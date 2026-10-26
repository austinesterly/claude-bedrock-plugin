import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, message, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { getPark, parkOfRecord } from "../park/park.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { isNocturnalHouse } from "./nightRules.js";
import { ACT, POSE, WALL_GAP, GECKO_TYPES, geckoOpen, validSpot, explore, routeTo, spotPos, legsAlong, crackAt, hidePose, phaseOf, pickWander, pickHide, pickStalk, facingSpot, rivalPairs, mothSpots, mothPos, faceOf, poseFor, yawTo, movesFrom } from "./geckoRules.js";

// Warped Geckos (0.1.85, the Nether trio; spec 5.3 "Wall clinging and vertical hunting | Registered climbing
// surfaces and insect feed"; the rules are in animals/geckoRules.js). Every half second, for the geckos near
// players only. It climbs by script: the zoocraft:climb event turns off its gravity and walking, and a glide a tick
// at a time (tickGeckoMoves) carries it along a route on its wall graph; on the floor between routes it stands
// (zoocraft:still); someone tempting it gets the engine's walking back (zoocraft:move). How it sits (on the floor,
// head up or down on a wall, across one) goes to the client through zoocraft:pose, what it does through zoocraft:act.
// Its day (geckoRules.js phaseOf; turned round in a nocturnal house): by day it sleeps in a crack (an opening in a
// wall), else in a Burrow Shelter, else up high on a wall, each in a hide of its own (no two geckos share a spot);
// at dusk it comes out and calls (a cluck, then a growl); at night it climbs about (a grown male keeping low, the
// rest higher), clings head down watching, licks its eyes, and hunts the moths a stocked Insect Feeder lets out (a wild one, the moths drawn to its glow): over to it,
// creeping the last of the way, a freeze, the snap, a lick of the lips. Two grown males close by at night bob their
// heads and growl, then one goes. Someone in Survival or Adventure right beside one gets the threat (up on its legs,
// mouth wide, a hiss) and it runs off up the wall; no harm done. Someone holding an Insect Ration or an empty carrier
// draws it down to the floor. A zoo gecko whose exhibit's air leads out may climb out at night.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const POSE_PROP = "zoocraft:pose";
const MOTH = "zoocraft:moth";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it comes down to them

const state = new Map(); // entity id -> state (see meet)
const moving = new Map(); // entity id -> { e, legs, route, i, t, from, done, read, keep, cut }
const moths = new Map(); // moth id -> { id, dim, spot, pos, until, feeder, by }
const nextMoth = new Map(); // feeder id (or a wild gecko's id) -> tick
const rivalCool = new Map(); // "id|id" -> tick
let mothSeq = 0;

// Every 10 ticks: the geckos near players, their moths and their rivals.
export function tickGeckos(now) {
  const T = BALANCE.gecko;
  const players = onlinePlayers();
  const seen = new Map(); // id -> { e, a }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, GECKO_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      try {
        seen.set(e.id, { e, a: animalFromEntity(e) });
      } catch {
        // gone
      }
    }
  }
  let time = 0;
  try {
    time = world.getTimeOfDay();
  } catch {
    // keep the last
  }
  const groups = new Map(); // "ex:<id>" | "wild:<dim>" -> members
  for (const b of seen.values()) {
    const k = b.a?.location.kind === "exhibit" ? `ex:${b.a.location.id}` : `wild:${b.e.dimension.id}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(b);
  }
  for (const [k, list] of groups) {
    const ex = k.startsWith("ex:") ? getExhibit(k.slice(3)) : undefined;
    const phase = phaseOf(time, T, ex ? isNocturnalHouse(ex, BALANCE) : false);
    try {
      if (phase === "night") {
        if (ex) feederMoths(ex, list[0].e.dimension, now, T);
        rivals(list, now, T);
      }
    } catch {
      // try again next time
    }
    for (const b of list) {
      try {
        step(b.e, b.a, ex, now, players, phase, T);
      } catch {
        forget(b.e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
  for (const [id, m] of [...moths]) if (now > m.until) moths.delete(id);
}

function forget(id) {
  const m = moving.get(id);
  const s = state.get(id);
  state.delete(id);
  moving.delete(id);
  for (const o of moths.values()) if (o.by === id) o.by = undefined;
  // Gliding when no one is near any more: onto the nearest spot of its route, so it isn't left in mid-air with its
  // gravity off (it is met there again, clinging, when someone comes back).
  if (m && s) {
    try {
      const l = m.e.location;
      let best;
      let bestD = Infinity;
      for (const r of m.route) {
        const q = spotPos(r.s, s.gap);
        const d = Math.hypot(q.x - l.x, q.y - l.y, q.z - l.z);
        if (d < bestD && validSpot(m.read, r.s)) {
          best = r.s;
          bestD = d;
        }
      }
      if (!best) return letGo(m.e);
      const h = best.f === "f" ? { pose: POSE.floor, yaw: m.e.getRotation().y } : poseFor(best.f, "down");
      m.e.teleport(spotPos(best, s.gap), { rotation: { x: 0, y: h.yaw }, keepVelocity: false });
      if (best.f === "f") m.e.triggerEvent("zoocraft:still");
      setPose(m.e, h.pose);
      setAct(m.e, ACT.still);
    } catch {
      // gone
    }
  }
}

// Every tick: glide the geckos along their routes; every few ticks, the moths flutter.
export function tickGeckoMoves() {
  for (const [id, m] of [...moving]) {
    const e = m.e;
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
      const leg = m.legs[m.i];
      if (m.t === 0) {
        // Something built in the way since it set off: it lets go (no fall damage) and drops.
        if (!geckoOpen(m.read(Math.floor(leg.to.x), Math.floor(leg.to.y + 0.01), Math.floor(leg.to.z)))) {
          moving.delete(id);
          letGo(e);
          continue;
        }
        setAct(e, leg.act);
        setPose(e, leg.pose);
      }
      m.t++;
      const f = Math.min(1, m.t / leg.ticks);
      e.teleport({ x: m.from.x + (leg.to.x - m.from.x) * f, y: m.from.y + (leg.to.y - m.from.y) * f, z: m.from.z + (leg.to.z - m.from.z) * f }, { rotation: { x: 0, y: leg.yaw }, keepVelocity: false });
      if (m.t < leg.ticks) continue;
      m.from = leg.to;
      m.i++;
      m.t = 0;
      if (m.i >= m.legs.length) {
        moving.delete(id);
        m.done();
      }
    } catch {
      moving.delete(id);
    }
  }
  if (system.currentTick % 4 !== 0) return;
  for (const m of moths.values()) {
    try {
      const d = world.getDimension(m.dim);
      if (d.isChunkLoaded(m.pos)) d.spawnParticle(MOTH, m.pos);
    } catch {
      // cosmetic
    }
  }
}

// ---------------- the gecko ----------------
// Its tuning: a hatchling sits nearer the wall (it's drawn smaller about its feet).
function gapOf(a) {
  const scale = a?.juvenile ? SPECIES["zoocraft:warped_gecko"].breeding.juvenileScale : 1;
  return WALL_GAP * scale;
}

function reader(e) {
  return blockReader(e.dimension, { leaves: true, gecko: true });
}

/**
 * Met (again): where it is on its graph, from where it stands and how it sits (a gecko left clinging to a wall when
 * the world was saved is still there, its gravity off). Undefined when that's no spot it can be at.
 */
function spotOf(e, gap, read) {
  let pose = 0;
  try {
    pose = Number(e.getProperty(POSE_PROP) ?? 0);
  } catch {
    // none
  }
  const l = e.location;
  const x = Math.floor(l.x);
  const z = Math.floor(l.z);
  if (!pose) {
    const s = { x, y: Math.floor(l.y + 0.01), z, f: "f" };
    return validSpot(read, s) ? s : undefined;
  }
  const y = Math.floor(l.y + gap + 0.01);
  const near = faceOf(l.x - (x + 0.5), l.z - (z + 0.5));
  for (const f of [near, "e", "w", "s", "n", "f"]) {
    const s = { x, y, z, f };
    if (validSpot(read, s)) return s;
  }
  return undefined;
}

function meet(e, a, now, T) {
  const gap = gapOf(a);
  const read = reader(e);
  const at = spotOf(e, gap, read);
  const spot = at?.f === "f" ? freeFloor(e, read, at) : at;
  const s = { phase: "idle", spot, hold: undefined, gap, act: ACT.none, actUntil: 0, queue: [], mode: "awake", next: now + 20, threatCool: 0, hideCool: 0, anchor: { x: Math.floor(e.location.x), y: Math.floor(e.location.y + 0.01), z: Math.floor(e.location.z) }, body: undefined, dim: e.dimension.id, goal: undefined, hideAt: undefined, out: false };
  state.set(e.id, s);
  if (!spot) {
    // Nowhere it can hold (on a slab, say): on its feet with its gravity, until it's somewhere it can.
    loose(e, s);
    return s;
  }
  s.hold = spot.f === "f" ? poseFor("f", "s") : poseFor(spot.f, "down");
  try {
    s.hold.yaw = spot.f === "f" ? e.getRotation().y : s.hold.yaw;
  } catch {
    // keep it
  }
  settle(e, s);
  return s;
}

// The blocks the other geckos here hold, are on their way to, or have taken to hide in: no two end up in one spot.
function othersAt(e) {
  const out = new Set();
  for (const [id, o] of state) {
    if (id === e.id || o.dim !== e.dimension.id) continue;
    if (o.spot) out.add(blockOf(o.spot));
    if (o.goal) out.add(blockOf(o.goal));
    if (o.mode === "hiding" && o.hideAt) out.add(o.hideAt);
  }
  return out;
}

const blockOf = (s) => `${s.x},${s.y},${s.z}`;

// A floor spot to take up where it stands: its own block, or (another there already) a free one beside it.
function freeFloor(e, read, spot) {
  const busy = othersAt(e);
  if (!busy.has(blockOf(spot))) return spot;
  return movesFrom(read, spot).find((m) => m.kind === "walk" && !busy.has(blockOf(m.to)))?.to;
}

// A search's spots without those in `busy` blocks (its routes still come from the whole search).
function without(seen, busy) {
  if (!busy.size) return seen;
  return new Map([...seen].filter(([, n]) => !busy.has(blockOf(n.s))));
}

// Out of its exhibit (it climbed out, or the park has found it outside): until it's caught it keeps out. Its reader
// sees the air over the exhibit's floor and walls as no way through (fencedReader), so no route takes it back over
// the wall; it still clings to the walls' outsides. Never for one that is back inside the fence (released again).
const escaped = (s, a) => Boolean(s.out || a?.outside);
const inFence = (f, p) => p.x >= f.min.x && p.x <= f.max.x && p.z >= f.min.z && p.z <= f.max.z;
function fenceOf(s, ex, a) {
  const b = ex?.bbox;
  if (!b || !s.spot || !escaped(s, a)) return undefined;
  const f = { min: { x: b.min.x - 1, z: b.min.z - 1 }, max: { x: b.max.x + 1, z: b.max.z + 1 } };
  return inFence(f, s.spot) ? undefined : f;
}
function fencedReader(read, fence) {
  if (!fence) return read;
  return (x, y, z) => {
    const c = read(x, y, z);
    return geckoOpen(c) && inFence(fence, { x, z }) ? "partial" : c;
  };
}

// The box its routes keep to: its exhibit's air (the wall measure's, else the floor's with headroom); for a wild one,
// round where it was met; for one out of its exhibit, round where it got out.
function boxOf(s, ex, a, T) {
  if (ex && !escaped(s, a)) {
    const w = ex.walls?.box;
    if (w && ex.walls.enclosed) return w;
    const b = ex.bbox;
    if (b) return { min: { x: b.min.x - 1, y: b.min.y - 1, z: b.min.z - 1 }, max: { x: b.max.x + 1, y: b.min.y + T.zooUp, z: b.max.z + 1 } };
  }
  const o = s.anchor;
  return { min: { x: o.x - T.wildReach, y: o.y - T.wildDown, z: o.z - T.wildReach }, max: { x: o.x + T.wildReach, y: o.y + T.wildUp, z: o.z + T.wildReach } };
}

function floorOf(s, ex, a) {
  return ex?.bbox && !escaped(s, a) ? ex.bbox.min.y : s.anchor.y;
}

function step(e, a, ex, now, players, phase, T) {
  let s = state.get(e.id);
  if (!s) s = meet(e, a, now, T);
  if (moving.has(e.id)) {
    // On its way somewhere: someone right beside it (in Survival), or tempting it, stops it at the end of the move.
    if (tempted(e, players) || (now >= s.threatCool && threatNear(e, players, T))) cutShort(e.id);
    return;
  }
  const read = fencedReader(reader(e), fenceOf(s, ex, a));
  if (s.phase === "loose") return looseStep(e, s, read, players);
  if (s.phase === "tempt") {
    if (tempted(e, players)) return;
    return looseStep(e, s, read, players, true);
  }
  // Its wall or floor gone from under it: it lets go.
  if (!s.spot || !validSpot(read, s.spot)) return letGo(e);
  // Someone tempting it: down to the floor, then the engine's walking.
  if (tempted(e, players)) return comeDown(e, s, ex, a, read, T);
  // Someone right beside it: the threat, then it runs.
  if (now >= s.threatCool) {
    const p = threatNear(e, players, T);
    if (p) return threaten(e, s, ex, a, read, p, now, T);
  }
  if (s.phase === "act") {
    if (now < s.actUntil) return acting(e, s);
    if (s.queue.length) return nextAct(e, s, now);
    s.phase = "idle";
    s.act = ACT.none;
    if (s.moth) s.moth = undefined;
  }
  holdAt(e, s);
  if (now < s.next) return;
  const male = a ? a.sex === "male" : markOf(e) === 1;
  const adult = a ? !a.juvenile : true;
  if (phase === "day" || phase === "dawn") return hideFor(e, s, ex, a, read, now, phase, T);
  // Up for the night (or the dusk).
  if (s.mode === "hiding") {
    s.mode = "awake";
    return wander(e, s, ex, a, read, now, male, adult, T, 2, 5, () => (phase === "dusk" ? call(e, s, now, T) : watch(e, s, now, T)));
  }
  if (phase === "dusk") {
    if (Math.random() < 0.5) return call(e, s, now, T);
    return watch(e, s, now, T);
  }
  // Night: out of the exhibit along its walls, if the air leads out; a moth to hunt; somewhere to go.
  if (ex && a && !escaped(s, a) && ex.walls && ex.walls.enclosed === false && Math.random() < T.escapeChance && climbOut(e, s, ex, a, read, players, T)) return;
  const m = mothFor(e, s, ex, a, T);
  if (m && hunt(e, s, ex, a, read, m, now, T)) return;
  if (!ex && Math.random() < T.wildMothChance) wildMoth(e, s, read, now, T);
  if (Math.random() < T.callChance) return call(e, s, now, T);
  if (Math.random() < T.lickChance) return startAct(e, s, now, ACT.lick, T.lickTicks);
  return wander(e, s, ex, a, read, now, male, adult, T, T.wanderMin, T.wanderMax, () => watch(e, s, now, T));
}

// Clinging still where it got to: head down on a wall, watching; sat on the floor.
function watch(e, s, now, T) {
  if (s.spot.f !== "f") s.hold = poseFor(s.spot.f, "down");
  startAct(e, s, now, ACT.still, T.watchTicks);
}

function call(e, s, now, T) {
  startAct(e, s, now, ACT.call, T.callTicks);
  // The cluck, then the growl (the "devil in the trees").
  sound(e, "mob.frog.ambient", 0.6, 1.5);
  system.runTimeout(() => sound(e, "mob.cat.hiss", 0.35, 0.5), 12);
  s.queue = [{ act: ACT.still, ticks: T.callRest }];
}

function wander(e, s, ex, a, read, now, male, adult, T, min, max, then) {
  const seen = explore(read, s.spot, boxOf(s, ex, a, T), T.limit);
  const key = pickWander(without(seen, othersAt(e)), floorOf(s, ex, a), male, adult, { ...T, wanderMin: min, wanderMax: max });
  if (!key) {
    s.next = now + 60;
    return then();
  }
  go(e, s, routeTo(seen, key), T.walk, ACT.walk, then);
}

// Glide along a route; at its end it holds the last spot the way the last leg left it.
function go(e, s, route, speed, act, then, lastAct = undefined, lastSpeed = undefined) {
  if (route.length < 2) return then();
  let legs = legsAlong(route, s.gap, speed, act);
  if (lastAct !== undefined && legs.length) {
    // The last move slower, doing lastAct (creeping up on a moth).
    const tail = legsAlong(route.slice(-2), s.gap, lastSpeed ?? speed, lastAct);
    const n = route[route.length - 1].kind === "top" || route[route.length - 1].kind === "edge" || route[route.length - 1].kind === "round" ? 2 : 1;
    legs = [...legs.slice(0, legs.length - n), ...tail];
  }
  body(e, s, "climb");
  s.phase = "move";
  s.goal = route[route.length - 1].s;
  const rec = {
    e,
    legs,
    route,
    i: 0,
    t: 0,
    from: { x: e.location.x, y: e.location.y, z: e.location.z },
    read: reader(e),
    keep: false, // a route that is itself the answer to someone (coming down to them, climbing out): never cut short
    cut: false,
    done: () => {
      const last = rec.legs[rec.legs.length - 1];
      s.spot = last.spot;
      s.goal = undefined;
      s.hold = { pose: last.pose, yaw: last.yaw };
      s.phase = "idle";
      holdAt(e, s);
      if (rec.cut) s.next = 0; // stopped short for someone: it answers them now (step), not what it set off to do
      else then();
    },
  };
  moving.set(e.id, rec);
  return rec;
}

const keep = (rec) => {
  if (rec) rec.keep = true;
};

// Someone right beside it, or tempting it, while it glides along a route: it stops at the end of the move it's on.
function cutShort(id) {
  const m = moving.get(id);
  if (!m || m.keep || m.cut) return;
  let j = m.i;
  while (j < m.legs.length && !m.legs[j].spot) j++;
  if (j >= m.legs.length - 1) return;
  m.legs = m.legs.slice(0, j + 1);
  m.cut = true;
  const s = state.get(id);
  if (s) s.goal = m.legs[j].spot;
}

// Onto its spot from a little way off (where the engine walked it, or where it was met): a short walk there, never a
// jump. Then held there.
function settle(e, s) {
  const p = spotPos(s.spot, s.gap);
  const l = e.location;
  const d = Math.hypot(p.x - l.x, p.y - l.y, p.z - l.z);
  if (d <= 0.25 || d > 1.5) return holdAt(e, s);
  if (s.spot.f === "f") s.hold = { pose: POSE.floor, yaw: yawTo(p.x - l.x, p.z - l.z) };
  const h = s.hold ?? poseFor(s.spot.f, "down");
  body(e, s, "climb");
  s.phase = "move";
  s.goal = s.spot;
  moving.set(e.id, {
    e,
    legs: [{ to: p, ticks: Math.max(2, Math.round(d / BALANCE.gecko.walk)), act: ACT.walk, pose: h.pose, yaw: h.yaw, spot: s.spot }],
    route: [{ s: s.spot, kind: undefined }],
    i: 0,
    t: 0,
    from: { x: l.x, y: l.y, z: l.z },
    read: reader(e),
    keep: true,
    cut: false,
    done: () => {
      s.goal = undefined;
      s.phase = "idle";
      holdAt(e, s);
    },
  });
}

// Held where it is: its body (standing on the floor, clinging to a wall), its pose and its facing, put back on its
// spot if anything moved it.
function holdAt(e, s) {
  if (!s.spot) return;
  body(e, s, s.spot.f === "f" ? "still" : "climb");
  const h = s.hold ?? poseFor(s.spot.f, "down");
  setPose(e, h.pose);
  const p = spotPos(s.spot, s.gap);
  const l = e.location;
  if (Math.hypot(l.x - p.x, l.y - p.y, l.z - p.z) > 0.25) e.teleport(p, { rotation: { x: 0, y: h.yaw }, keepVelocity: false });
  else e.setRotation({ x: 0, y: h.yaw });
}

function startAct(e, s, now, act, ticks) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.queue = [];
  holdAt(e, s);
  setAct(e, act);
}

function nextAct(e, s, now) {
  const n = s.queue.shift();
  if (n.hold) s.hold = n.hold;
  s.phase = "act";
  s.act = n.act;
  s.actUntil = now + (Array.isArray(n.ticks) ? between(n.ticks) : n.ticks);
  holdAt(e, s);
  setAct(e, n.act);
  if (n.run) n.run();
}

function acting(e, s) {
  holdAt(e, s);
  setAct(e, s.act);
}

// ---------------- its day ----------------
// By day (and coming in at dawn): to its hide and asleep there.
function hideFor(e, s, ex, a, read, now, phase, T) {
  if (s.mode === "hiding") {
    // In its hide already: asleep (tucked in) until the evening. One that found nowhere looks again now and then.
    if (s.hideHow || now < s.hideCool) return startAct(e, s, now, s.hideHow === "crack" || s.hideHow === "shelter" ? ACT.hide : ACT.sleep, T.sleepTicks);
  }
  s.mode = "hiding";
  s.hideHow = undefined;
  s.hideAt = undefined;
  const seen = explore(read, s.spot, boxOf(s, ex, a, T), T.limit);
  // A hide of its own: not one another has taken, nor a spot another holds.
  const busy = othersAt(e);
  const shelters = new Set(ex ? fixturesOf(ex).filter((f) => f.type === "burrow").map((f) => `${f.pos.x},${f.pos.y},${f.pos.z}`).filter((k) => !busy.has(k)) : []);
  const pick = pickHide(without(seen, busy), (x, y, z) => crackAt(read, x, y, z), shelters);
  if (pick) s.hideAt = blockOf(seen.get(pick.key).s);
  const tuck = () => {
    if (pick?.how === "crack") s.hold = hidePose(s.spot, pick.out);
    else if (pick?.how === "wall") s.hold = poseFor(s.spot.f, "up");
    s.hideHow = pick && pick.how !== "wall" ? pick.how : undefined;
    s.hideCool = now + T.hideLook;
    startAct(e, s, system.currentTick, pick && pick.how !== "wall" ? ACT.hide : ACT.sleep, T.sleepTicks);
  };
  if (!pick) return tuck();
  go(e, s, routeTo(seen, pick.key), T.walk, ACT.walk, tuck);
}

// ---------------- moths ----------------
// At night a stocked Insect Feeder in a gecko's exhibit lets out a moth now and then, onto a wall near it.
function feederMoths(ex, d, now, T) {
  const read = blockReader(d, { leaves: true, gecko: true });
  const b = ex.bbox;
  const box = ex.walls?.enclosed ? ex.walls.box : b && { min: b.min, max: { x: b.max.x, y: b.min.y + T.zooUp, z: b.max.z } };
  const inside = box ? (x, y, z) => x >= box.min.x && x <= box.max.x && y >= box.min.y && y <= box.max.y && z >= box.min.z && z <= box.max.z : undefined;
  for (const id of ex.feederIds ?? []) {
    const rec = db.get("equipment", id);
    if (!rec?.insect || !(rec.units > 0)) continue;
    if ([...moths.values()].some((m) => m.feeder === id)) continue;
    if (now < (nextMoth.get(id) ?? 0)) continue;
    nextMoth.set(id, now + between(T.mothEvery));
    const spots = mothSpots(read, rec.pos, T.mothReach, inside);
    if (spots.length) addMoth(d.id, spots[Math.floor(Math.random() * spots.length)], now, T, id);
  }
}

// A moth drawn to a wild gecko's glow, onto a wall near it.
function wildMoth(e, s, read, now, T) {
  if (now < (nextMoth.get(e.id) ?? 0)) return;
  if ([...moths.values()].some((m) => m.dim === e.dimension.id && Math.hypot(m.pos.x - e.location.x, m.pos.y - e.location.y, m.pos.z - e.location.z) <= T.mothRange)) return;
  nextMoth.set(e.id, now + between(T.mothEvery));
  const spots = mothSpots(read, s.spot, T.mothReach);
  if (spots.length) addMoth(e.dimension.id, spots[Math.floor(Math.random() * spots.length)], now, T, undefined);
}

function addMoth(dim, spot, now, T, feeder) {
  const id = `moth${++mothSeq}`;
  moths.set(id, { id, dim, spot, pos: mothPos(spot), until: now + T.mothTicks, feeder, by: undefined });
}

// The nearest moth it could go for: within mothRange, not another gecko's, inside its exhibit for a zoo one.
function mothFor(e, s, ex, a, T) {
  const box = boxOf(s, ex, a, T);
  let best;
  let bestD = Infinity;
  for (const m of moths.values()) {
    if (m.dim !== e.dimension.id || (m.by && m.by !== e.id)) continue;
    const { x, y, z } = m.spot;
    if (x < box.min.x || x > box.max.x || y < box.min.y || y > box.max.y || z < box.min.z || z > box.max.z) continue;
    const d = Math.hypot(m.pos.x - e.location.x, m.pos.y - e.location.y, m.pos.z - e.location.z);
    if (d <= T.mothRange && d < bestD) {
      best = m;
      bestD = d;
    }
  }
  return best;
}

// Over to the moth, the last of the way creeping; a freeze; the snap; a lick of the lips.
function hunt(e, s, ex, a, read, m, now, T) {
  const seen = explore(read, s.spot, boxOf(s, ex, a, T), T.limit);
  const key = pickStalk(without(seen, othersAt(e)), m.spot, s.gap);
  if (!key) return false;
  m.by = e.id;
  const strike = () => {
    if (!moths.has(m.id)) return watch(e, s, system.currentTick, T); // another got it, or it flew
    s.hold = facingSpot(s.spot, m.spot, s.hold ?? poseFor(s.spot.f, "down"));
    startAct(e, s, system.currentTick, ACT.still, T.freezeTicks);
    s.moth = m.id;
    s.queue = [
      {
        act: ACT.snap,
        ticks: T.snapTicks,
        run: () => {
          moths.delete(m.id);
          sound(e, "random.eat", 0.3, 1.8);
        },
      },
      { act: ACT.lick, ticks: T.lickTicks },
    ];
  };
  const route = routeTo(seen, key);
  if (route.length < 2) {
    strike();
    return true;
  }
  go(e, s, route, T.walk, ACT.walk, strike, ACT.stalk, T.stalk);
  return true;
}

// ---------------- rivals ----------------
// Two grown males close by at night: they face each other and bob their heads, growling; then the one met later goes.
function rivals(list, now, T) {
  const males = [];
  for (const { e, a } of list) {
    const s = state.get(e.id);
    // Only one doing nothing much (between moves, or clinging still or licking its eyes) squares up.
    if (!s || moving.has(e.id) || !s.spot || !(s.phase === "idle" || (s.phase === "act" && (s.act === ACT.still || s.act === ACT.lick)))) continue;
    const male = a ? a.sex === "male" : markOf(e) === 1;
    if (!male || (a && a.juvenile)) continue;
    males.push({ id: e.id, x: e.location.x, y: e.location.y, z: e.location.z, e, s });
  }
  for (const p of rivalPairs(males, T.rivalRange)) {
    const k = [p.a, p.b].sort().join("|");
    if (now < (rivalCool.get(k) ?? 0)) continue;
    rivalCool.set(k, now + T.rivalCool);
    const one = males.find((m) => m.id === p.a);
    const two = males.find((m) => m.id === p.b);
    for (const [me, them] of [
      [one, two],
      [two, one],
    ]) {
      me.s.hold = facingSpot(me.s.spot, them.s.spot, me.s.hold ?? poseFor(me.s.spot.f, "down"));
      startAct(me.e, me.s, now, ACT.bob, T.bobTicks);
    }
    sound(one.e, "mob.cat.hiss", 0.4, 0.45);
    system.runTimeout(() => sound(two.e, "mob.cat.hiss", 0.4, 0.4), 15);
    // Afterwards the one met later backs off somewhere else.
    two.s.queue = [{ act: ACT.still, ticks: 10, run: () => (two.s.next = 0) }];
  }
}

// ---------------- people ----------------
const survival = (p) => {
  try {
    const m = String(p.getGameMode()).toLowerCase();
    return m === "survival" || m === "adventure";
  } catch {
    return false;
  }
};

// Someone holding its food or an empty carrier: they're tempting or catching it.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return BALANCE.gecko.bait.includes(id) || carrierByItem(id)?.full === false;
}

function tempted(e, players) {
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !tempting(p)) continue;
      if (Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z) <= TEMPT_RANGE) return true;
    } catch {
      // gone
    }
  }
  return false;
}

// The nearest one in Survival or Adventure right beside it (not tempting it).
function threatNear(e, players, T) {
  let best;
  let bestD = Infinity;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !survival(p) || tempting(p)) continue;
      const d = Math.min(
        Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z),
        Math.hypot(p.location.x - e.location.x, p.location.y + 1.6 - e.location.y, p.location.z - e.location.z),
      );
      if (d <= T.threatRange && d < bestD) {
        best = p;
        bestD = d;
      }
    } catch {
      // gone
    }
  }
  return best;
}

// Up on its legs, mouth wide, a hiss; then off up the wall away from them.
function threaten(e, s, ex, a, read, p, now, T) {
  s.threatCool = now + T.threatCool;
  if (s.moth) {
    const m = moths.get(s.moth);
    if (m) m.by = undefined;
    s.moth = undefined;
  }
  if (s.spot.f === "f") s.hold = poseFor("f", faceOf(p.location.x - e.location.x, p.location.z - e.location.z));
  startAct(e, s, now, ACT.threat, T.threatTicks);
  sound(e, "mob.cat.hiss", 0.7, 1.3);
  s.queue = [
    {
      act: ACT.threat,
      ticks: 1,
      run: () => {
        const seen = explore(read, s.spot, boxOf(s, ex, a, T), T.limit);
        const floorY = floorOf(s, ex, a);
        let best;
        let bestScore = -Infinity;
        for (const [k, n] of without(seen, othersAt(e))) {
          if (n.d > T.fleeMax) continue;
          const q = spotPos(n.s, s.gap);
          const away = Math.hypot(q.x - p.location.x, q.z - p.location.z);
          const score = Math.min(n.s.y - floorY, T.fleeUp) * 2 + away;
          if (score > bestScore) {
            best = k;
            bestScore = score;
          }
        }
        if (!best) return;
        go(e, s, routeTo(seen, best), T.run, ACT.run, () => watch(e, s, system.currentTick, T));
      },
    },
  ];
}

// Someone tempting it: off the wall to the nearest floor, then the engine walks it to them.
function comeDown(e, s, ex, a, read, T) {
  const toFloor = () => {
    s.phase = "tempt";
    body(e, s, "move");
    setAct(e, ACT.none);
    setPose(e, POSE.floor);
  };
  if (s.spot.f === "f") return toFloor();
  // To the nearest spot on its floor (not a crack's or a ledge's), else the nearest floor of any kind.
  const seen = explore(read, s.spot, boxOf(s, ex, a, T), T.limit);
  const free = without(seen, othersAt(e));
  const floorY = floorOf(s, ex, a);
  let any;
  for (const [k, n] of free) {
    if (n.s.f !== "f") continue;
    if (n.s.y === floorY) return keep(go(e, s, routeTo(seen, k), T.walk, ACT.walk, toFloor));
    any ??= k;
  }
  if (any) return keep(go(e, s, routeTo(seen, any), T.walk, ACT.walk, toFloor));
  return toFloor();
}

// ---------------- climbing out ----------------
// A zoo gecko in an exhibit whose air leads out: now and then at night it climbs out, over the wall and down the
// outside, and the park members hear where. Out, it keeps out (fenceOf) round where it got out, until it's caught.
function climbOut(e, s, ex, a, read, players, T) {
  const b = ex.bbox;
  if (!b) return false;
  const box = { min: { x: b.min.x - T.escapeReach, y: b.min.y - 2, z: b.min.z - T.escapeReach }, max: { x: b.max.x + T.escapeReach, y: b.min.y + T.zooUp + 4, z: b.max.z + T.escapeReach } };
  const seen = explore(read, s.spot, box, T.escapeLimit);
  let out;
  for (const [k, n] of seen) {
    const { x, z } = n.s;
    if (x < b.min.x - 1 || x > b.max.x + 1 || z < b.min.z - 1 || z > b.max.z + 1) {
      out = k;
      break;
    }
  }
  if (!out) return false;
  const v = seen.get(out).s;
  s.out = true;
  s.anchor = { x: v.x, y: v.y, z: v.z };
  keep(go(e, s, routeTo(seen, out), T.walk, ACT.walk, () => watch(e, s, system.currentTick, T)));
  const park = parkOfRecord(ex) ?? getPark();
  const text = `§c${a.name} is climbing out of ${ex.name} near ${v.x} ${v.y} ${v.z}! §7Warped Geckos climb glass and walls: roof the exhibit over (the clipboard says where the air leads out). Catch it with an empty Thermal Carrier, or tempt it down with an Insect Ration, and release it back inside once it's roofed.`;
  for (const p of players) if (park?.members[p.id] && p.dimension.id === e.dimension.id) message(p, text);
  return true;
}

// ---------------- loose ----------------
// On its feet with its gravity (let go, tempted, or met somewhere it can't hold): once it's standing on a floor it
// can hold again, it takes it up.
function loose(e, s) {
  moving.delete(e.id);
  s.phase = "loose";
  s.spot = undefined;
  body(e, s, "move");
  setAct(e, ACT.none);
  setPose(e, POSE.floor);
}

function looseStep(e, s, read, players, fromTempt = false) {
  if (tempted(e, players) && !fromTempt) {
    s.phase = "tempt";
    return;
  }
  if (!e.isOnGround) return;
  const l = e.location;
  const here = { x: Math.floor(l.x), y: Math.floor(l.y + 0.01), z: Math.floor(l.z), f: "f" };
  if (!validSpot(read, here)) return;
  const spot = freeFloor(e, read, here);
  if (!spot) return; // others all round it: on its feet a little longer
  s.spot = spot;
  s.phase = "idle";
  try {
    s.hold = { pose: POSE.floor, yaw: e.getRotation().y };
  } catch {
    s.hold = poseFor("f", "s");
  }
  s.next = system.currentTick + 40;
  settle(e, s);
}

function letGo(e) {
  const s = state.get(e.id);
  if (s) loose(e, s);
  else {
    e.triggerEvent("zoocraft:move");
    setAct(e, ACT.none);
    setPose(e, POSE.floor);
  }
}

// ---------------- the mob ----------------
// Its body: "move" (walking, with gravity), "still" (standing put on the floor) or "climb" (no gravity, no walking:
// the glide carries it, and it clings where it stops). Each event swaps the other two groups out, and every one
// holds the walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function setPose(e, pose) {
  if (e.getProperty(POSE_PROP) !== pose) e.setProperty(POSE_PROP, pose);
}

function markOf(e) {
  try {
    return e.getComponent("minecraft:mark_variant")?.value ?? 0;
  } catch {
    return 0;
  }
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

// The moths out now, as { spot, pos, by, feeder } (the mock world's checks read them).
export function mothsOut() {
  return [...moths.values()].map((m) => ({ spot: m.spot, pos: m.pos, by: m.by, feeder: m.feeder }));
}
