import { system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { ACT, HOPPER_TYPES, PAD_BLOCK, leapWay, wildLeap, landingIn, zigzag, along, pickPad, farthestPad, spotKey, pickChoice, withinLeap, standsOn, yawTo } from "./hopperRules.js";

// End Hoppers (0.1.91, the End trio's first; spec 5.4 "Small creature with long angular legs | High jumps between
// platforms | Jump clearance, roof, landing pads"; the rules are in animals/hopperRules.js). Every half second, for the
// hoppers near players. The End has no day or night, so it keeps to bouts: out and about a while, then a nap standing
// asleep (head and front paws tucked between its hind legs, its tail round its feet), wherever it is. Up and about, it
// leaps: in a zoo from Landing Pad to Landing Pad (crouch, leap, land with all four feet together, sit up with its
// ears up, then on to another, 2 to 5 in a run, sometimes back down to the floor), across the floor without pads; in
// the wild up onto blocks higher, down off them and across the ground, never out over the void. Between leaps it
// forages hunched on all fours (at the feeder, in a zoo), sits up to look round, rests its head and ears on the ground
// to listen, or hops about where the engine walks it. Someone in Survival or Adventure who comes close, not sneaking
// (in the wild nor holding its food or a carrier): a wild one gets away in zigzag darts, each turned off the straight
// way left and right by turns (the jerboa's escape), then sits bolt upright watching them, and goes again if they keep
// coming; one in a zoo leaps to the pad farthest from them, or zigzags across the floor. A held Chorus Browse draws it
// over (the entities' tempt): it sits up in front of whoever holds it and sniffs. Pups keep to the floor by their
// mother (the entity's follow_parent) and never leap.
// Walking is the engine's; every leap is the script's, a push a tick along its arc (tickHopperMoves: the game moves it
// by the push, closed loop on where it is; one the game doesn't move is carried by teleport, the rays' fallback). What
// it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const SPECIES_ID = "zoocraft:end_hopper";
const TEMPT_RANGE = 10; // the entities' tempt reaches this far
const FEED_REACH = 2.5; // this near a feeder it wants, it forages at it
const PAD_TRIES = 3; // leaps off a pad it can't make before it gives up the pad and walks off it
const THIN = new Set(["minecraft:chorus_plant", "minecraft:chorus_flower"]); // stalks, not ground to land on

const state = new Map(); // entity id -> { e, body, seek, mode, act, actUntil, yaw, after, bout, boutUntil, choiceUntil, interest, cool, circuit, onPad, padAt, zig, from, watching, watchD, stuck, lastAt }
// onPad: the pad spot key it stands on; padAt: the one it is leaping to (both held for it in `held`).
const moving = new Map(); // entity id -> { e, pts, i, to, yaw, act, delay, last, want, slow, done }
const held = new Map(); // dimension id -> Map of pad spot key -> hopper id (on it or leaping to it)
const carried = new Set(); // hoppers the game didn't move by the push: carried by teleport from then on

// Every 10 ticks: the hoppers near players.
export function tickHoppers(now) {
  const T = BALANCE.hopper;
  const players = onlinePlayers();
  const seen = new Map(); // id -> entity
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, HOPPER_TYPES);
    } catch {
      continue;
    }
    for (const e of list) if (!seen.has(e.id)) seen.set(e.id, e);
  }
  for (const e of seen.values()) {
    try {
      step(member(e, now, T), now, players, T);
    } catch {
      forget(e.id);
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
}

function forget(id) {
  const s = state.get(id);
  state.delete(id);
  const mv = moving.get(id);
  moving.delete(id);
  for (const map of held.values()) for (const [k, who] of [...map]) if (who === id) map.delete(k);
  const e = s?.e;
  if (!e) return;
  try {
    if (!e.isValid) return;
    // Mid-leap: it lands where it was going at once (never left in the air).
    if (mv) e.teleport(mv.to, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
    // No one near any more: one on a pad stays there, still, until someone comes (met again, it carries on from the
    // pad); one on the floor goes back to its own walking, so it isn't left still where it was.
    setAct(e, ACT.none);
    if (onPadBlock(e)) return;
    body(e, s, "move");
    seek(e, s, "none");
  } catch {
    // gone
  }
}

// Every tick: fly the leaping hoppers along their arcs.
export function tickHopperMoves() {
  const T = BALANCE.hopper;
  for (const [id, mv] of [...moving]) {
    const e = mv.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      // On the ground a moment between the darts of a zigzag.
      if (mv.delay > 0) {
        mv.delay--;
        e.clearVelocity();
        setAct(e, ACT.land);
        continue;
      }
      const at = e.location;
      // Told to move last tick and moved less than movedShare of it, slowTicks ticks running: the game isn't moving
      // it by the push, so it's carried from now on.
      if (mv.last && mv.want >= T.minWant) {
        const got = Math.hypot(at.x - mv.last.x, at.y - mv.last.y, at.z - mv.last.z);
        mv.slow = got < mv.want * T.movedShare ? mv.slow + 1 : 0;
        if (mv.slow >= T.slowTicks) carried.add(id);
      }
      setAct(e, mv.act);
      if (mv.i >= mv.pts.length) {
        // Pushed to the last point a tick ago: it settles exactly where it was going (0.1.91 mock world: settled in
        // place of the last push, it jumped a tick's way, up to 0.8 of a block at the end of a drop).
        moving.delete(id);
        e.teleport(mv.to, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        e.clearVelocity();
        mv.done();
        continue;
      }
      const p = mv.pts[mv.i++];
      const v = { x: p.x - at.x, y: p.y - at.y, z: p.z - at.z };
      mv.last = { x: at.x, y: at.y, z: at.z };
      mv.want = Math.hypot(v.x, v.y, v.z);
      e.setRotation({ x: 0, y: mv.yaw });
      if (carried.has(id)) {
        e.teleport(p, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        continue;
      }
      e.clearVelocity();
      e.applyImpulse(v);
    } catch {
      moving.delete(id);
    }
  }
  if (carried.size > 500) carried.clear();
}

// Hoppers being carried now (for /zoocraft:status).
export function carriedHoppers() {
  return carried.size;
}

// ---------------- the hopper ----------------
function member(e, now, T) {
  let s = state.get(e.id);
  if (!s) {
    s = { e, mode: "out", act: ACT.none, actUntil: 0, choiceUntil: 0, cool: 0, stuck: 0, bout: "active", boutUntil: now + Math.floor(Math.random() * T.activeTicks[1]) };
    state.set(e.id, s);
    // Met (again): on a pad it stands there, still, and goes on from it; else on its feet with its own walking.
    setAct(e, ACT.none);
    if (onPadBlock(e)) {
      const k = spotKey(cellOf(e.location));
      if (claim(e, k, e.id)) {
        s.onPad = k;
        s.circuit = between([1, 3]);
        body(e, s, "still");
        seek(e, s, "none");
      } else body(e, s, "move");
    } else {
      body(e, s, "move");
      seek(e, s, "none");
    }
  }
  s.e = e;
  const a = animalFromEntity(e);
  const pup = a ? Boolean(a.juvenile) : isBaby(e);
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  return { id: e.id, e, a, s, pup, ex, wild: !ex };
}

function step(m, now, players, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  // The pad under it gone (broken, or it was pushed off): it's on the floor.
  if (s.onPad && !onPadBlock(e)) leavePad(m);
  // Up on a pad it didn't leap to (pushed or walked up, or a dart came down on it): the pad's its own if no one else
  // has it; if someone has, it leaps down off it (0.1.91 mock world: one strolled up onto a pad another sat on).
  if (!s.onPad && onPadBlock(e)) {
    const k = spotKey(cellOf(e.location));
    if (claim(e, k, m.id)) {
      s.onPad = k;
      body(e, s, "still");
      seek(e, s, "none");
    } else if (!m.pup && !s.zig && s.mode !== "act" && floorLeap(m, now, leapReader(e), T, true)) return;
  }
  // Someone too close: away (a wild one in zigzag darts; one in a zoo to the farthest pad, or zigzagging). While it
  // sits up watching after a zigzag, only if they come on again (comeOn blocks nearer than when it sat up) or close.
  if (!m.pup && !s.zig) {
    const threat = threatOf(m, players, T);
    const watching = s.mode === "act" && s.act === ACT.sit && s.watching;
    if (threat && (!watching || threat.d <= T.startleRange || threat.d <= s.watchD - T.comeOn)) return getAway(m, now, threat, T);
  }
  if (s.zig) return nextDart(m, now, T);
  if (s.mode === "act") {
    if (now < s.actUntil) return acting(m, now, players, T);
    return finished(m, now, players, T);
  }
  // A held Chorus Browse: over to it (off a pad first), and sniff.
  const tempter = tempterOf(e, players);
  if (tempter) return tempted(m, now, tempter, T);
  // The bouts: awake a while, then a nap where it is.
  if (s.bout === "active" && now >= s.boutUntil) {
    s.bout = "nap";
    s.interest = undefined;
    return startAct(m, now, ACT.sleep, T.napTicks, undefined, "wake");
  }
  if (s.onPad) return padNext(m, now, T);
  if (Math.random() < T.idleSoundChance) sound(e, "mob.rabbit.idle", 0.25, 1.4);
  if (now < s.cool) return;
  if (!e.isOnGround) return;
  hopSound(m);
  if (s.interest === "feeder") return toFeeder(m, now, T);
  if (now < s.choiceUntil) return;
  choose(m, now, T);
}

// What it does next on the floor.
function choose(m, now, T) {
  const { e, s, ex } = m;
  const choice = pickChoice(T, m.pup);
  if (choice === "circuit" && circuit(m, now, T)) return;
  if (choice === "forage") {
    if (feederIn(ex)) {
      s.interest = "feeder";
      s.interestUntil = now + T.interestTicks;
      body(e, s, "move");
      return seek(e, s, "feeder");
    }
    return startAct(m, now, ACT.forage, T.forageTicks, undefined, "settle");
  }
  if (choice === "sit") return startAct(m, now, ACT.sit, T.sitTicks, undefined, "settle");
  if (choice === "listen") return startAct(m, now, ACT.listen, T.listenTicks, undefined, "settle");
  // Hopping about where the engine takes it (also a circuit with no leap to make).
  body(e, s, "move");
  seek(e, s, "none");
  setAct(e, ACT.none);
  s.choiceUntil = now + between(T.walkTicks);
}

// ---------------- the leaps ----------------
// A run of leaps: in a zoo to a free pad within a leap (the higher ones likelier), else across the floor; in the wild
// up onto a block higher, down off one, or across flat ground. False when there's no leap it can make.
function circuit(m, now, T) {
  const { e, s } = m;
  const read = leapReader(e);
  if (m.wild) {
    const way = wildLeap(cellOf(e.location), read, T);
    return Boolean(way && takeOff(m, now, way.to, way.pts, undefined, T));
  }
  s.circuit = between(T.circuitLeaps);
  const here = cellOf(e.location);
  const spots = padSpots(m);
  for (let i = 0; i < 3 && spots.length; i++) {
    const to = pickPad(spots, here, heldIn(e), m.id, T);
    if (!to) break;
    if (leapTo(m, now, to, read, T)) return true;
    const k = spotKey(to);
    spots.splice(spots.findIndex(([x, y, z]) => spotKey({ x, y, z }) === k), 1);
  }
  return floorLeap(m, now, read, T);
}

// On a pad, sat up: on to another pad (circuit leaps left, and not back down by chance), else down to the floor.
// With no leap it can make from here, it sits on a while; after PAD_TRIES of those it gives the pad up and walks off.
function padNext(m, now, T) {
  const { e, s } = m;
  const read = leapReader(e);
  const here = cellOf(e.location);
  s.circuit = (s.circuit ?? 1) - 1;
  if (s.circuit > 0 && Math.random() >= T.floorChance) {
    const spots = padSpots(m);
    for (let i = 0; i < 3 && spots.length; i++) {
      const to = pickPad(spots, here, heldIn(e), m.id, T);
      if (!to) break;
      if (leapTo(m, now, to, read, T)) return;
      const k = spotKey(to);
      spots.splice(spots.findIndex(([x, y, z]) => spotKey({ x, y, z }) === k), 1);
    }
  }
  if (floorLeap(m, now, read, T, true)) return;
  // Down by way of another pad, if that's all it can reach.
  const to = pickPad(padSpots(m), here, heldIn(e), m.id, T);
  if (to && leapTo(m, now, to, read, T)) return;
  if (++s.stuck >= PAD_TRIES) {
    s.stuck = 0;
    leavePad(m);
    return settle(m, now, T);
  }
  startAct(m, now, ACT.sit, T.sitTicks, undefined, "pad");
}

// A leap to the pad spot `to` (a cell): the arc clear for its body, ground under all of it. True when it crouches to go.
function leapTo(m, now, to, read, T) {
  const dest = { x: to.x + 0.5, y: to.y, z: to.z + 0.5 };
  const pts = leapWay(fromOf(m.e), dest, read, T);
  return Boolean(pts && takeOff(m, now, dest, pts, spotKey(to), T));
}

// A leap across the floor of its exhibit: to a floor cell floorAcross blocks off (down off a pad: within a leap of it),
// with 2 blocks of air at it, not the top of a feeder or other equipment. True when it crouches to go.
function floorLeap(m, now, read, T, down = false) {
  const e = m.e;
  const here = cellOf(e.location);
  const cells = m.ex ? cellsOf(m.ex.id) : undefined;
  if (!cells) return false;
  const tops = equipmentTops(m.ex);
  const near = down ? 1 : T.floorAcross[0];
  const far = down ? T.reachAcross : T.floorAcross[1];
  const cands = [];
  for (let dx = -far; dx <= far; dx++) {
    for (let dz = -far; dz <= far; dz++) {
      const d = Math.hypot(dx, dz);
      if (d < near || d > far) continue;
      for (let dy = down ? -T.dropMax : -1; dy <= (down ? 0 : 1); dy++) {
        const c = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
        const k = spotKey(c);
        if (cells.get(k) !== "land" || tops.has(k)) continue;
        if (!withinLeap(here, c, T)) continue;
        cands.push(c);
      }
    }
  }
  shuffle(cands);
  for (const c of cands.slice(0, 10)) {
    if (read(c.x, c.y, c.z) !== "air" || read(c.x, c.y + 1, c.z) !== "air" || !standsOn(read(c.x, c.y - 1, c.z))) continue;
    const dest = { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
    const pts = leapWay(fromOf(e), dest, read, T);
    if (pts && takeOff(m, now, dest, pts, idAt(e, { x: c.x, y: c.y - 1, z: c.z }) === PAD_BLOCK ? spotKey(c) : undefined, T)) return true;
  }
  return false;
}

// Crouch, then the leap: the pad it's going to held for it from now (no other hopper leaps there). False when the pad
// is taken after all.
function takeOff(m, now, dest, pts, padKey, T) {
  const { e, s } = m;
  if (padKey && !claim(e, padKey, m.id)) return false;
  s.padAt = padKey;
  s.leap = { dest, pts };
  s.stuck = 0;
  s.interest = undefined;
  startAct(m, now, ACT.crouch, T.crouchTicks, yawTo(dest.x - e.location.x, dest.z - e.location.z), "leap");
  return true;
}

// Off it goes (the crouch done): the way looked at again from where it is now, then flown.
function fly(m, now, T) {
  const { e, s } = m;
  const go = s.leap;
  s.leap = undefined;
  if (!go) return settle(m, now, T);
  const read = leapReader(e);
  const pts = leapWay(fromOf(e), go.dest, read, T) ?? undefined;
  if (!pts) {
    // Something in the way now: it stays where it is.
    unclaim(e, s.padAt, m.id);
    s.padAt = undefined;
    return s.onPad ? startAct(m, now, ACT.sit, T.sitTicks, undefined, "pad") : settle(m, now, T);
  }
  if (s.onPad) leavePad(m);
  s.mode = "leap";
  sound(e, "mob.frog.jump_to_block", 0.4, 1.4);
  const yaw = yawTo(go.dest.x - e.location.x, go.dest.z - e.location.z);
  s.yaw = yaw;
  moving.set(m.id, { e, pts, i: 0, to: go.dest, yaw, act: ACT.leap, delay: 0, slow: 0, done: () => landed(m, system.currentTick, T) });
}

// Down: on a pad (the cushion's thump), it lands, then sits up with its ears up and goes on from there; on the ground,
// it lands and goes about its business.
function landed(m, now, T) {
  const { e, s } = m;
  if (onPadBlock(e)) {
    const k = spotKey(cellOf(e.location));
    if (s.padAt && s.padAt !== k) unclaim(e, s.padAt, m.id);
    s.padAt = undefined;
    claim(e, k, m.id);
    s.onPad = k;
    sound(e, "land.cloth", 0.6, 1.2);
    return startAct(m, now, ACT.land, T.landTicks, s.yaw, "sitpad");
  }
  unclaim(e, s.padAt, m.id);
  s.padAt = undefined;
  sound(e, "land.stone", 0.35, 1.5);
  startAct(m, now, ACT.land, T.landTicks, s.yaw, "settle");
}

// ---------------- getting away ----------------
// The nearest someone it gets away from: in Survival or Adventure, not sneaking, not holding its food or a carrier
// (they're tempting or catching it); for a wild one within fleeRange, for one in a zoo within startleRange and inside
// its exhibit. { x, y, z, d } or undefined.
function threatOf(m, players, T) {
  const { e, ex } = m;
  const cells = ex ? cellsOf(ex.id) : undefined;
  let best;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !survival(p) || p.isSneaking || tempting(p)) continue;
      const l = p.location;
      const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
      if (Math.abs(l.y - e.location.y) > 4) continue;
      if (m.wild ? d > T.fleeRange : d > T.startleRange || !cells?.has(spotKey(cellOf(l)))) continue;
      if (!best || d < best.d) best = { x: l.x, y: l.y, z: l.z, d };
    } catch {
      // gone
    }
  }
  return best;
}

function getAway(m, now, threat, T) {
  const { e, s } = m;
  s.interest = undefined;
  s.watching = false;
  unclaim(e, s.padAt, m.id);
  s.padAt = undefined;
  s.leap = undefined;
  s.from = { x: threat.x, z: threat.z };
  // In a zoo: the pad farthest from them it can leap to, if there's one.
  if (!m.wild) {
    const read = leapReader(e);
    const to = farthestPad(padSpots(m), cellOf(e.location), heldIn(e), m.id, threat, T);
    if (to) {
      const dest = { x: to.x + 0.5, y: to.y, z: to.z + 0.5 };
      const pts = leapWay(fromOf(e), dest, read, T);
      if (pts && claim(e, spotKey(to), m.id)) {
        // Startled: off at once, no crouch.
        s.padAt = spotKey(to);
        s.leap = { dest, pts };
        s.circuit = 1;
        body(e, s, "still");
        seek(e, s, "none");
        return fly(m, now, T);
      }
    }
  }
  const away = yawTo(e.location.x - threat.x, e.location.z - threat.z);
  s.zig = { turns: zigzag(0, between(m.wild ? T.darts : T.zooDarts), T), i: 0, away };
  body(e, s, "still");
  seek(e, s, "none");
  nextDart(m, now, T, 0);
}

// The next dart of the zigzag, or, darts done (or boxed in), sitting bolt upright watching whoever it got away from.
function nextDart(m, now, T, delay = T.dartGap) {
  const { e, s } = m;
  const z = s.zig;
  if (!z) return;
  const threat = threatOf(m, onlinePlayers(), T);
  // Darts done: it sits up watching them once they're watchFrom or more off (in a zoo, out of its startle); nearer, it
  // keeps going, up to dartsMax darts (0.1.91 mock world: it sat up 3 blocks from someone sprinting after it).
  if (z.i >= z.turns.length) {
    if (!threat || threat.d >= (m.wild ? T.watchFrom : T.startleRange) || z.i >= T.dartsMax) return watch(m, now, T);
    z.turns.push(-Math.sign(z.turns[z.i - 1]) * (T.dartTurn[0] + Math.random() * (T.dartTurn[1] - T.dartTurn[0])));
  }
  // Each dart turned off the straight way from where they are now, or (out of its flight range now) from where it last
  // saw them (0.1.91 mock world: kept from where they were when it started, a dart could take it back at someone who
  // had come on round it).
  if (threat) s.from = { x: threat.x, z: threat.z };
  if (s.from) z.away = yawTo(e.location.x - s.from.x, e.location.z - s.from.z);
  const heading = z.away + z.turns[z.i++];
  const way = dartWay(m, heading, z.away, T);
  if (!way) {
    // No dart this way or any other: it stops and watches.
    z.i = z.turns.length;
    return watch(m, now, T);
  }
  if (s.onPad) leavePad(m);
  s.mode = "leap";
  s.yaw = way.yaw;
  sound(e, "mob.rabbit.hop", 0.5, 1.2);
  moving.set(m.id, { e, pts: way.pts, i: 0, to: way.to, yaw: way.yaw, act: ACT.dart, back: way.back, delay, slow: 0, done: () => dartLanded(m, T) });
}

function dartLanded(m, T) {
  const { e, s } = m;
  if (onPadBlock(e)) {
    const k = spotKey(cellOf(e.location));
    if (claim(e, k, m.id)) s.onPad = k;
  }
  sound(e, s.onPad ? "land.cloth" : "land.stone", 0.3, 1.6);
  nextDart(m, system.currentTick, T);
}

// Sitting up watching whoever it got away from (they come on again: off it goes again).
function watch(m, now, T) {
  const { e, s } = m;
  s.zig = undefined;
  s.watching = true;
  const threat = threatOf(m, onlinePlayers(), T);
  if (threat) s.from = { x: threat.x, z: threat.z };
  s.watchD = threat ? threat.d : m.wild ? T.fleeRange : T.startleRange;
  const yaw = s.from ? yawTo(s.from.x - e.location.x, s.from.z - e.location.z) : undefined;
  startAct(m, now, ACT.sit, T.watchTicks, yaw, s.onPad ? "pad" : "settle");
}

// A dart along `heading` (yaw), or turned more if that one can't be made (never back toward the threat, `away` its
// straight way off): onto ground at most a block higher or dropMax lower (in a zoo, its exhibit's floor), the arc
// clear, ground under all of it. Boxed in every way off from them (the edge of an island, a corner), it doubles back
// past them to one side, the jerboa's hairpin turn, never straight at them; shorter darts only after all those (0.1.91
// mock world: hops of a block and a half along an island's edge let someone walk up onto it). { to, pts, yaw, back }
// or undefined.
function dartWay(m, heading, away, T) {
  const e = m.e;
  const read = leapReader(e);
  const here = cellOf(e.location);
  const from = fromOf(e);
  const cells = m.ex ? cellsOf(m.ex.id) : undefined;
  const tops = m.ex ? equipmentTops(m.ex) : new Set();
  const DT = { ...T, arcPeak: T.dartPeak, arcPeakPerBlock: 0.05, baseTicks: T.dartBase, ticksPerBlock: T.dartPerBlock, leapTicks: T.dartTicks };
  const want = T.dartAcross[0] + Math.random() * (T.dartAcross[1] - T.dartAcross[0]);
  const side = Math.sign(heading - away) || 1;
  const ways = [];
  for (const turn of [0, 20 * side, -20 * side, 45 * side, -45 * side, 90 * side, -90 * side]) {
    const yaw = heading + turn;
    if (Math.abs(angleDiff(yaw, away)) > 110) continue;
    ways.push({ yaw, back: false });
  }
  for (const turn of [135 * side, -135 * side, 150 * side, -150 * side]) ways.push({ yaw: away + turn, back: true });
  const tries = [];
  for (const d of [want, want * 0.7, 1.5]) for (const w of ways) tries.push({ ...w, d });
  for (const { yaw, back, d } of tries) {
    const p = along(from, yaw, d);
    const x = Math.floor(p.x);
    const z = Math.floor(p.z);
    if (x === here.x && z === here.z) continue;
    let y;
    if (cells) {
      for (let dy = 1; dy >= -T.dropMax && y === undefined; dy--) {
        const k = `${x},${here.y + dy},${z}`;
        if (cells.get(k) === "land" && !tops.has(k)) y = here.y + dy;
      }
      if (y !== undefined && (read(x, y, z) !== "air" || read(x, y + 1, z) !== "air" || !standsOn(read(x, y - 1, z)))) y = undefined;
    } else y = landingIn(read, x, z, here.y - T.dropMax, here.y + 1, T.wildClear);
    if (y === undefined) continue;
    const to = { x: x + 0.5, y, z: z + 0.5 };
    const pts = leapWay(from, to, read, DT);
    if (pts) return { to, pts, yaw: yawTo(to.x - from.x, to.z - from.z), back };
  }
  return undefined;
}

// ---------------- a held Chorus Browse ----------------
// Off a pad first (a leap down toward them); on the floor the engine's tempt walks it over; within sniffReach it sits
// up in front of them and sniffs, for as long as they hold it.
function tempted(m, now, p, T) {
  const { e, s } = m;
  s.interest = undefined;
  const l = p.location;
  const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
  if (s.onPad) {
    const read = leapReader(e);
    if (!m.pup && floorLeap(m, now, read, T, true)) return;
    return startAct(m, now, ACT.sit, T.sniffTicks, yawTo(l.x - e.location.x, l.z - e.location.z), "pad");
  }
  if (d <= T.sniffReach) return startAct(m, now, ACT.sniff, T.sniffTicks, yawTo(l.x - e.location.x, l.z - e.location.z), "settle");
  body(e, s, "move");
  seek(e, s, "none");
  setAct(e, ACT.none);
}

// ---------------- the feeder ----------------
// Walking to the feeder (the engine's seek): this near one of its exhibit's with Chorus Browse in it, it forages there,
// hunched on all fours facing it. It gives up after interestTicks.
function toFeeder(m, now, T) {
  const { e, s, ex } = m;
  if (now >= (s.interestUntil ?? 0) || !feederIn(ex)) {
    s.interest = undefined;
    seek(e, s, "none");
    s.choiceUntil = 0;
    return;
  }
  for (const id of ex.feederIds) {
    const rec = db.get("equipment", id);
    if (!rec?.pos || rec.dimension !== e.dimension.id || !edible(rec)) continue;
    const dx = rec.pos.x + 0.5 - e.location.x;
    const dz = rec.pos.z + 0.5 - e.location.z;
    if (Math.hypot(dx, dz) > FEED_REACH || Math.abs(rec.pos.y - e.location.y) > 1.5) continue;
    s.interest = undefined;
    return startAct(m, now, ACT.forage, T.eatTicks, yawTo(dx, dz), "settle");
  }
}

// ---------------- what it does ----------------
function startAct(m, now, act, ticks, yaw, after) {
  const { e, s } = m;
  s.mode = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.after = after;
  if (yaw !== undefined) s.yaw = yaw;
  if (act !== ACT.sit) s.watching = false;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
}

// While it crouches, lands, sits up, listens, forages, sniffs or sleeps: as it was, with the sounds that go with it.
// Sniffing, it goes on while they hold the Chorus Browse in front of it; a sleeper wakes for a held one.
function acting(m, now, players, T) {
  const { e, s } = m;
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.forage && Math.random() < 0.3) sound(e, "mob.rabbit.idle", 0.2, 1.7);
  if (s.act === ACT.sniff) {
    const p = tempterOf(e, players);
    if (p && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= T.sniffReach + 0.5) {
      s.actUntil = Math.max(s.actUntil, now + 10);
      s.yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
    }
  }
  if (s.act === ACT.sleep && tempterOf(e, players)) s.actUntil = now;
}

// An act run its time.
function finished(m, now, players, T) {
  const { e, s } = m;
  const after = s.after;
  s.after = undefined;
  if (after === "leap") return fly(m, now, T);
  if (after === "sitpad") return startAct(m, now, ACT.sit, T.sitTicks, undefined, "pad");
  if (after === "wake") {
    s.bout = "active";
    s.boutUntil = now + between(T.activeTicks);
    if (s.onPad) return startAct(m, now, ACT.sit, T.sitTicks, undefined, "pad");
  }
  if (after === "pad" && s.onPad) {
    // Sat up on the pad: on with the circuit (padNext), unless something else comes first.
    s.mode = "pad";
    s.act = ACT.sit;
    s.watching = false;
    return step(m, now, players, T);
  }
  settle(m, now, T);
}

// Back on its feet on the floor, hopping about where the engine takes it.
function settle(m, now, T) {
  const { e, s } = m;
  s.mode = "out";
  s.act = ACT.none;
  s.yaw = undefined;
  s.watching = false;
  s.cool = now + T.coolTicks;
  if (s.onPad && onPadBlock(e)) {
    // Still on a pad: it stays still on it (padNext takes it down).
    s.mode = "pad";
    setAct(e, ACT.sit);
    return;
  }
  if (s.onPad) leavePad(m);
  body(e, s, "move");
  setAct(e, ACT.none);
}

// ---------------- the pads ----------------
// The counted pads of its exhibit (the jump measure's, [x, y, z, height] spots) with a Landing Pad still under them.
function padSpots(m) {
  const spots = m.ex?.hops?.spots ?? [];
  return spots.filter(([x, y, z]) => idAt(m.e, { x, y: y - 1, z }) === PAD_BLOCK);
}

function heldIn(e) {
  const id = e.dimension.id;
  let map = held.get(id);
  if (!map) held.set(id, (map = new Map()));
  return map;
}

// Hold the pad spot `k` for hopper `id`: false when another hopper holds it.
function claim(e, k, id) {
  const map = heldIn(e);
  const who = map.get(k);
  if (who && who !== id && state.has(who)) return false;
  map.set(k, id);
  return true;
}

function unclaim(e, k, id) {
  if (!k) return;
  const map = heldIn(e);
  if (map.get(k) === id) map.delete(k);
}

function leavePad(m) {
  unclaim(m.e, m.s.onPad, m.id);
  m.s.onPad = undefined;
  m.s.stuck = 0;
}

function onPadBlock(e) {
  const c = cellOf(e.location);
  return idAt(e, { x: c.x, y: c.y - 1, z: c.z }) === PAD_BLOCK;
}

// The cells over the exhibit's feeders and other equipment, which it never leaps onto ("x,y,z"); not the pads.
function equipmentTops(ex) {
  const out = new Set();
  for (const id of [...(ex.feederIds ?? []), ...(ex.fixtureIds ?? [])]) {
    const rec = db.get("equipment", id);
    if (rec?.pos && rec.type !== "pad") out.add(`${rec.pos.x},${rec.pos.y + 1},${rec.pos.z}`);
  }
  return out;
}

// ---------------- around it ----------------
function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES[SPECIES_ID].dietTags.includes(RATIONS[rec.item]?.diet));
}

const survival = (p) => {
  try {
    const mode = String(p.getGameMode()).toLowerCase();
    return mode === "survival" || mode === "adventure";
  } catch {
    return false;
  }
};

// Someone holding its food or an empty carrier: they're tempting or catching it.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return id === SPECIES[SPECIES_ID].baitItem || carrierByItem(id)?.full === false;
}

// The nearest player within TEMPT_RANGE holding a Chorus Browse, or undefined.
function tempterOf(e, players) {
  let best;
  let near = TEMPT_RANGE;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || heldItem(p)?.typeId !== SPECIES[SPECIES_ID].baitItem) continue;
      const d = Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z);
      if (d <= near) {
        near = d;
        best = p;
      }
    } catch {
      // gone
    }
  }
  return best;
}

// Now and then a quiet hop's sound while it hops about.
function hopSound(m) {
  const { e, s } = m;
  const at = e.location;
  const last = s.lastAt;
  s.lastAt = { x: at.x, z: at.z };
  if (last && Math.hypot(at.x - last.x, at.z - last.z) > 0.3 && Math.random() < 0.5) sound(e, "mob.rabbit.hop", 0.15, 1.5);
}

// ---------------- the mob ----------------
// Its body: "move" (hopping about) or "still" (crouching, leaping, landing, sitting up, listening, sleeping; the
// script flies its leaps). Each event swaps the other group out, and both hold the walking speed and physics the
// entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "feeder" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function isBaby(e) {
  try {
    return Boolean(e.getComponent("minecraft:is_baby"));
  } catch {
    return false;
  }
}

const idAt = (e, pos) => {
  try {
    return e.dimension.getBlock(pos)?.typeId;
  } catch {
    return undefined;
  }
};

// Where its feet are.
function fromOf(e) {
  return { x: e.location.x, y: e.location.y, z: e.location.z };
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

// What a leap reads, each block once (platform/mc.js blockReader with gecko: true, so it never lands on a slab, stairs,
// an end rod or other block that doesn't fill its space: "partial"); nor on a chorus plant or flower, a thin stalk.
function leapReader(e) {
  const base = blockReader(e.dimension, { gecko: true });
  return memo((x, y, z) => {
    const c = base(x, y, z);
    return c === "solid" && THIN.has(idAt(e, { x, y, z }) ?? "") ? "partial" : c;
  });
}

// A block reader that reads each block once.
function memo(read) {
  const seen = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let c = seen.get(k);
    if (c === undefined) seen.set(k, (c = read(x, y, z)));
    return c;
  };
}

function angleDiff(a, b) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}
