import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { reportError } from "../core/log.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { glideStep, reached, facing, pitchOf, yawOf } from "./glide.js";
import { flyStep, forgetStep, passesThrough, boxOpen } from "./mover.js";
import { isDay, pickAirSpot, pickLandSpot, roomToLand, tightTurn } from "./dragonRules.js";
import { ACT, GRIFFIN_TYPES, WILD_GRIFFIN, GRIFFIN_FLIGHT as G, DIVE_FLIGHT, DIVE_SLOPE, pickGroundAct, hallSpan, pickDiveTop, pickDiveLow, atDiveTop } from "./griffinRules.js";

// Griffins (0.1.151, the Mythical Glade; the rules are in animals/griffinRules.js). Built on the dragon's steering
// (animals/dragon.js, 0.1.150): Bedrock has no flying AI for a big flier, so a griffin is steered here, a tick at a time,
// by small pushes (the glide maths of animals/glide.js with its own numbers, GRIFFIN_FLIGHT; its entity has no gravity).
// Every half second the brain (tickGriffins) finds the griffins near players and decides; every tick (tickGriffinMoves)
// moves them.
// In the air it flies from spot to spot round its hall (the exhibit's flight measure), beating its wings or gliding, and
// now and then climbs to the top of the hall and dives (the eagle's stoop: DIVE_FLIGHT, its wings tucked) down to a spot
// over the floor ahead, then sweeps up again. After a while it picks what to do on the ground and lands for it: by its
// gold to guard it, lying with its wings mantled round it; beside the feeder to eat; anywhere to screech, rearing up, to
// preen or just stand; at night it lands by its gold and sleeps till morning. Landing it comes in over the spot and
// hovers down; taking off it hovers up first. A chick follows a grown griffin about, flying after it and landing beside
// it. A wild one flies over the Mythical Glade and lands now and then on the open grass or on top of a giant tree's
// crown; someone close in Survival who isn't sneaking or holding a Meat Ration makes it screech and take off; a Meat
// Ration held close brings it down to land beside them. What it's doing goes to the client through zoocraft:act (and
// zoocraft:gliding while it flies).

const RANGE = 64; // blocks from a player: a big flier is seen from far off
// A chick left behind: as fast as a grown one's dive, and quick to climb or drop with it (1.4 times the speed alone
// left a chick a median 9 blocks back in the park simulator, the grown ones diving).
const CATCH_UP = { ...G, speed: G.speed * 1.6, maxRise: 0.3, depthGain: 0.16 };
const PROP = "zoocraft:act";

const state = new Map(); // entity id -> state (see wake)
const lists = new WeakMap(); // an exhibit's cells Map -> { air: [x, y, z][], land: [x, y, z][] }

// A griffin that can't be flown says why in the content log (each different error once a session).
const told = new Set();
function tell(error) {
  const key = String(error);
  if (told.has(key) || told.size > 20) return;
  told.add(key);
  reportError("griffin", error);
}

function forget(id) {
  state.delete(id);
  forgetStep(id);
}

// Every 10 ticks: the griffins near players, what each does next.
export function tickGriffins(now) {
  const seen = new Set();
  const players = onlinePlayers();
  let day = true;
  try {
    day = isDay(world.getTimeOfDay(), BALANCE.griffin);
  } catch {
    // keep it day
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, GRIFFIN_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        think(e, now, players, day);
      } catch (error) {
        tell(error);
        forget(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
}

// Every tick: each griffin along its way, or held where it stands.
export function tickGriffinMoves(now) {
  for (const [id, s] of [...state]) {
    let valid = false;
    try {
      valid = s.e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      forget(id);
      continue;
    }
    try {
      move(s, now);
    } catch (error) {
      tell(error);
      forget(id);
    }
  }
}

// ---------------- small pieces ----------------
// Anywhere from range[0] to range[1] ticks.
/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function setProp(e, k, v) {
  if (e.getProperty(k) !== v) e.setProperty(k, v);
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}

const survival = (p) => {
  const m = String(p.getGameMode()).toLowerCase();
  return m === "survival" || m === "adventure";
};

function holdsBait(p, T) {
  const id = heldItem(p)?.typeId ?? "";
  return T.bait.includes(id) || carrierByItem(id)?.full === false;
}

// A feeder in its exhibit with meat in it: { pos } or undefined.
function meatFeeder(ex) {
  for (const id of ex?.feederIds ?? []) {
    const rec = db.get("equipment", id);
    if (rec?.units > 0 && SPECIES["zoocraft:griffin"].dietTags.includes(RATIONS[rec.item]?.diet)) return rec;
  }
  return undefined;
}

// What the exhibit's flight measure found at a block ("air", "land", "perch"), or for a wild griffin (or a hall not
// measured since the world loaded) what the blocks say: open (air, or grass and flowers it passes through) over solid
// ground is "land", other open blocks "air".
function kinds(e, s) {
  const cells = s.exId ? cellsOf(s.exId) : undefined;
  if (cells) {
    let l = lists.get(cells);
    if (!l) {
      l = { air: [], land: [] };
      for (const [k, kind] of cells) {
        const c = k.split(",").map(Number);
        if (kind !== "land") l.air.push(c);
        else l.land.push(c);
      }
      l.span = hallSpan(l.air, l.land); // the floor's height and the top of the air (for its dives)
      lists.set(cells, l);
    }
    return { kindAt: (x, y, z) => cells.get(`${x},${y},${z}`), lists: l, measured: true };
  }
  const d = e.dimension;
  const open = (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      return Boolean(b && passesThrough(b));
    } catch {
      return false;
    }
  };
  return { kindAt: (x, y, z) => (open(x, y, z) ? (open(x, y - 1, z) ? "air" : "land") : undefined), lists: undefined, measured: false };
}

// The y of the first open block over the ground under `p` (searching down `depth` blocks; grass and flowers aren't
// ground), or undefined.
function groundUnder(e, p, depth = 24) {
  const d = e.dimension;
  const x = Math.floor(p.x), z = Math.floor(p.z);
  let y = Math.floor(p.y);
  try {
    for (let i = 0; i < depth; i++, y--) {
      const below = d.getBlock({ x, y: y - 1, z });
      if (!below) return undefined;
      if (below.isLiquid) return undefined; // not over water
      if (!passesThrough(below)) return y;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

// ---------------- the brain ----------------
function wake(e, now) {
  const p = e.location;
  const g = groundUnder(e, { x: p.x, y: p.y + 0.5, z: p.z }, 3);
  const onGround = g !== undefined && Math.abs(p.y - g) < 0.6;
  // Met (again): on the ground it stands a moment; in the air it hovers a moment before going anywhere.
  const s = { e, mode: onGround ? "ground" : "air", spot: { x: p.x, y: p.y, z: p.z }, drifting: true, until: now + 20, trim: 0, glide: false, airUntil: now + between(BALANCE.griffin.airTicks), act: onGround ? ACT.stand : ACT.hover, actUntil: now + 40, groundUntil: now + between(BALANCE.griffin.groundTicks), yaw: e.getRotation().y, beatAt: now, home: { x: p.x, y: p.y, z: p.z } };
  state.set(e.id, s);
  return s;
}

function think(e, now, players, day) {
  const T = BALANCE.griffin;
  let s = state.get(e.id);
  if (!s) s = wake(e, now);
  s.e = e;
  const a = animalFromEntity(e);
  s.exId = a?.location.kind === "exhibit" ? a.location.id : undefined;
  s.wild = !a;
  let young = Boolean(a?.juvenile);
  try {
    young ||= Boolean(e.getComponent("minecraft:is_baby"));
  } catch {
    // grown
  }
  s.young = young;
  s.day = day;
  let variant = 0;
  try {
    variant = e.getComponent("minecraft:variant")?.value ?? 0;
  } catch {
    // Golden
  }
  s.variant = variant;
  // A wild one: someone close in Survival, not sneaking and not holding meat, and it screeches and takes off; held meat
  // brings it down beside them.
  const bait = players.find((p) => p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.baitRange && holdsBait(p, T));
  if (s.wild) {
    const scare = players.find((p) => p.dimension.id === e.dimension.id && survival(p) && !p.isSneaking && !holdsBait(p, T) && dist(p.location, e.location) <= T.shyRange);
    if (scare && !bait && now >= (s.scaredUntil ?? 0)) {
      s.scaredUntil = now + T.scareCool;
      s.flee = { x: scare.location.x, z: scare.location.z, until: now + T.scareCool * 3 }; // shied from for a minute
      if (s.mode === "ground") {
        s.yaw = yawOf(scare.location.x - e.location.x, scare.location.z - e.location.z);
        startAct(s, now, ACT.screech, T.screechTicks);
        s.thenTakeOff = true;
      } else {
        s.airUntil = now + between(T.airTicks); // already up: it stays up a while
        if (s.mode === "air" && (s.diving || s.diveNext)) pickSpot(s, now); // breaking off its dive, away from them
      }
      return;
    }
  }
  if (bait && (s.mode === "air" || s.mode === "land") && !s.baited && now >= (s.baitLook ?? 0)) {
    // Down beside the one holding meat (in a zoo, if that is in its hall); no room there, it looks again in a while.
    const k = kinds(e, s);
    const spot = landNear(e, s, k, bait.location, 5);
    if (spot) {
      s.baited = true;
      startLanding(s, now, spot, "stand");
      s.face = { x: Math.floor(bait.location.x), y: Math.floor(bait.location.y), z: Math.floor(bait.location.z) }; // facing them
      return;
    }
    s.baitLook = now + 40;
  }
  if (s.baited && !bait) s.baited = false;
  if (s.mode === "ground") return ground(e, s, now, day, bait, T);
  if (s.mode === "air" && (now >= s.airUntil || !day) && !s.young) return planLanding(e, s, now, day, T);
  if (s.mode === "air" && s.young) return followLeader(e, s, now, day, T);
}

// On the ground: through its acts; when the time is up (and it's day) it takes off.
function ground(e, s, now, day, bait, T) {
  if (s.act === ACT.sleep) {
    if (day && !s.waking) {
      s.waking = true;
      s.actUntil = Math.min(s.actUntil, now + between(T.wakeTicks));
    }
    if (now < s.actUntil) return;
    if (!day) {
      s.actUntil = now + between(T.sleepTicks); // it sleeps on through the night
      return;
    }
    s.waking = false;
    return startAct(s, now, ACT.stand, T.standTicks);
  }
  if (now < s.actUntil) return;
  if (s.thenTakeOff || (now >= s.groundUntil && day && !bait)) {
    s.thenTakeOff = false;
    return takeOff(s, now, T);
  }
  if (bait) {
    s.yaw = yawOf(bait.location.x - e.location.x, bait.location.z - e.location.z);
    return startAct(s, now, ACT.stand, [40, 60]);
  }
  const ex = s.exId ? getExhibit(s.exId) : undefined;
  next(s, now, ex, day, T);
}

// The next thing on the ground where it is (it doesn't walk: it flies to the next place). To guard, or at night to sleep,
// a grown one away from the gold flies over to it (tried again after a while if it found no room there).
function next(s, now, ex, day, T) {
  let what = pickGroundAct({ day, gold: Boolean(ex?.griffin?.gold), feeder: false, young: s.young }, T);
  // The screech plays once as the act starts (the client holds the last frame): never one straight after another.
  if (what === "screech" && s.act === ACT.screech) what = "stand";
  if ((what === "guard" || what === "sleep") && !s.young && now >= (s.goldRetry ?? 0) && awayFromGold(s.e.location, ex)) {
    s.goldRetry = now + 600;
    s.want = what;
    return takeOff(s, now, T, 40);
  }
  // (by its gold if it stands within 5 blocks of a block of it, wherever it landed)
  s.byGold = Boolean(ex?.griffin?.spots?.length) && !awayFromGold(s.e.location, ex);
  const acts = { sleep: [ACT.sleep, T.sleepTicks], guard: [ACT.guard, T.guardTicks], screech: [ACT.screech, T.screechTicks], preen: [ACT.preen, T.preenTicks], stand: [ACT.stand, T.standTicks] };
  const [act, ticks] = acts[what] ?? acts.stand;
  startAct(s, now, act, ticks);
}

// More than 5 blocks from every block of its hall's hoard (one with gold).
function awayFromGold(p, ex) {
  const gold = ex?.griffin?.spots ?? [];
  return gold.length > 0 && gold.every((f) => Math.hypot(f.x + 0.5 - p.x, f.z + 0.5 - p.z) > 5);
}

function startAct(s, now, act, ticks) {
  s.act = act;
  s.actFrom = now;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  setProp(s.e, PROP, act);
  if (act === ACT.screech) s.screechAt = now + 9; // as the beak opens, rearing up
  if (act === ACT.guard && s.byGold) sound(s.e, "armor.equip_gold", 0.7, s.young ? 1.4 : 0.9); // settling over its gold
  if (act === ACT.sleep) s.waking = false;
  if (act === ACT.eat) s.chompAt = now + 6;
  if (act === ACT.preen) s.ruffleAt = now + 10;
}

// What it lands for, and where: by its gold to guard it (and at night to sleep), beside the feeder with meat to eat,
// anywhere else for the rest; a wild one on open ground or a treetop below it.
function planLanding(e, s, now, day, T) {
  if (s.diving || s.diveNext) return; // the dive first
  const ex = s.exId ? getExhibit(s.exId) : undefined;
  const feeder = meatFeeder(ex);
  // (what it took off for, if it flew up to go to its gold)
  const what = s.want ?? pickGroundAct({ day, gold: Boolean(ex?.griffin?.gold), feeder: Boolean(feeder), young: s.young }, T);
  s.want = undefined;
  const k = kinds(e, s);
  const gold = ex?.griffin?.spots?.[Math.floor(Math.random() * ex.griffin.spots.length)];
  let spot;
  if ((what === "guard" || what === "sleep") && gold) spot = landNear(e, s, k, gold, 4);
  else if (what === "eat" && feeder) spot = landNear(e, s, k, feeder.pos, 3);
  s.byGold = Boolean(spot && gold && (what === "guard" || what === "sleep"));
  if (!spot) spot = landAnywhere(e, s, k, now);
  if (!spot) {
    s.airUntil = now + 100; // nowhere to land yet: fly on a little and try again
    return;
  }
  s.face = what === "eat" && feeder ? feeder.pos : s.byGold ? gold : undefined;
  startLanding(s, now, spot, what);
}

function startLanding(s, now, cell, then) {
  s.mode = "land";
  s.diving = false;
  s.diveNext = false;
  s.land = cell;
  s.then = then;
  s.descending = false;
  s.spot = { x: cell.x + 0.5, y: cell.y + BALANCE.griffin.hoverHeight, z: cell.z + 0.5 };
  s.drifting = false;
  s.until = now + G.spotTicks;
}

function landNear(e, s, k, near, within) {
  if (k.lists) return pickLandSpot(k.lists.land, k.kindAt, { x: Math.floor(near.x), y: Math.floor(near.y), z: Math.floor(near.z) }, within, G);
  // Wild: the ground a few blocks from it, toward the griffin first (then round to either side, for room: a great tree
  // can stand on that side), then farther out (the server bench: on the glade's steep slopes no level ground within 6
  // blocks of someone holding meat had room for it, so it never came down).
  const p = e.location;
  const toward = Math.atan2(p.z - near.z, p.x - near.x);
  for (const r of [3, 4.5, 6, 8, 10]) {
    for (const turn of [0, 35, -35, 70, -70, 110, -110, 145, -145, 180]) {
      const a = toward + (turn * Math.PI) / 180;
      const at = { x: near.x + Math.cos(a) * r, y: near.y + 5, z: near.z + Math.sin(a) * r };
      const y = groundUnder(e, at, 12);
      if (y === undefined) continue;
      const c = { x: Math.floor(at.x), y, z: Math.floor(at.z) };
      if (roomy(e, k, c, false)) return c;
    }
  }
  return undefined;
}

function landAnywhere(e, s, k, now) {
  if (k.lists) return pickLandSpot(k.lists.land, k.kindAt, undefined, 6, G);
  const p = e.location;
  for (let i = 0; i < 12; i++) {
    const at = { x: p.x + (Math.random() - 0.5) * 24, y: p.y, z: p.z + (Math.random() - 0.5) * 24 };
    // (near home, as its flights are, unless it is keeping away from whoever scared it)
    if (s.home && !shunned(s, s.home.x, s.home.z, now) && Math.hypot(at.x - s.home.x, at.z - s.home.z) > BALANCE.griffin.wildRange) {
      at.x = (at.x + s.home.x) / 2;
      at.z = (at.z + s.home.z) / 2;
    }
    if (shunned(s, at.x, at.z, now)) continue; // not back down beside whoever scared it
    const y = groundUnder(e, at, 30);
    if (y === undefined) continue;
    const c = { x: Math.floor(at.x), y, z: Math.floor(at.z) };
    if (roomy(e, k, c, true)) return c;
  }
  return undefined;
}

// A wild one shies from where it was scared, for a minute after: it flies and lands well away from there.
function shunned(s, x, z, now) {
  return Boolean(s.flee) && now < s.flee.until && Math.hypot(x - s.flee.x, z - s.flee.z) < BALANCE.griffin.shyRange * 1.5;
}

// Room to land on open ground (the wild), as in a hall: level ground under its whole footprint, nothing in the way of its
// body, room for its wings; and open sky over it (not under a crown, where it couldn't rise to fly off). On the top of a
// giant tree's crown too (`crowns`: an eagle's lookout), never on a trunk or a branch.
const TREE = /leaves|_log$|_wood$|_stem$|_hyphae$/;
const LEAVES = /leaves/;
function roomy(e, k, c, crowns) {
  if (!roomToLand(k.kindAt, c.x, c.y, c.z, G)) return false;
  try {
    const under = e.dimension.getBlock({ x: c.x, y: c.y - 1, z: c.z })?.typeId ?? "";
    if (TREE.test(under) && !(crowns && LEAVES.test(under))) return false;
  } catch {
    return false;
  }
  const up = BALANCE.griffin.hoverHeight + G.body.height + 4;
  const r = G.body.half - 0.1;
  try {
    for (const [dx, dz] of [[0, 0], [r, r], [-r, r], [r, -r], [-r, -r]]) {
      if (e.dimension.getBlockFromRay({ x: c.x + 0.5 + dx, y: c.y + 0.1, z: c.z + 0.5 + dz }, { x: 0, y: 1, z: 0 }, { maxDistance: up, includeLiquidBlocks: true, includePassableBlocks: false })) return false;
    }
  } catch {
    return false;
  }
  return true;
}

// Up off the ground, for a flight of T.airTicks (or `airFor` ticks: a hop over to its gold).
function takeOff(s, now, T, airFor = undefined) {
  const p = s.e.location;
  s.mode = "takeoff";
  s.spot = { x: p.x, y: p.y + T.hoverHeight, z: p.z };
  s.drifting = true;
  s.until = now + T.takeoffTicks;
  s.airUntil = now + (airFor ?? between(T.airTicks));
  setProp(s.e, PROP, ACT.hover);
}

// A chick: after the nearest grown griffin of its hall (or the wild one nearby), landing beside it when it lands.
function followLeader(e, s, now, day, T) {
  // The grown one it follows: the one it has been following while it's still about (switching between a pair halfway
  // left it trailing behind both), else the nearest.
  let leader = s.leader && state.get(s.leader.e.id) === s.leader && s.leader.exId === s.exId ? s.leader : undefined;
  let best = Infinity;
  if (!leader) {
    for (const o of state.values()) {
      if (o === s || o.young || o.exId !== s.exId) continue;
      const d = dist(o.e.location, e.location);
      if (d < best) {
        best = d;
        leader = o;
      }
    }
  }
  s.leader = leader;
  if (!leader) {
    if (now >= s.airUntil || !day) planLanding(e, s, now, day, T);
    return;
  }
  if (leader.mode === "ground" || leader.mode === "land") {
    const k = kinds(e, s);
    const spot = landNear(e, s, k, leader.land ?? leader.e.location, 5) ?? landAnywhere(e, s, k, now);
    if (spot) startLanding(s, now, spot, day ? "stand" : "sleep");
    return;
  }
  // In the air: its spot is just behind the grown one and to its side.
  const f = facing(leader.e.getRotation().y);
  s.follow = { x: leader.e.location.x - f.x * 4 + f.z * 2.5, y: leader.e.location.y - 0.5, z: leader.e.location.z - f.z * 4 - f.x * 2.5 };
}

// ---------------- the moves ----------------
function move(s, now) {
  const e = s.e;
  const T = BALANCE.griffin;
  if (s.mode === "ground") return hold(s, now, T);
  const pos = e.location;
  if (s.mode === "takeoff") {
    if (now >= s.until || Math.abs(pos.y - s.spot.y) < 0.3) {
      s.mode = "air";
      pickSpot(s, now);
    }
    return fly(s, now, T, true);
  }
  if (s.mode === "land") {
    if (!s.descending && (reached(pos, s.spot, G) || now >= s.until)) {
      // Out of time still a way off over its landing place (a turn it couldn't make): it flies on and tries again.
      if (!reached(pos, s.spot, G) && Math.hypot(pos.x - s.spot.x, pos.z - s.spot.z) > 3) return giveUpLanding(s, now);
      s.descending = true;
      s.until = now + 120;
      s.spot = { x: s.land.x + 0.5, y: s.land.y, z: s.land.z + 0.5 };
      s.drifting = true;
    }
    if (s.descending && (Math.abs(pos.y - s.spot.y) < 0.12 || now >= s.until)) return touchDown(s, now, T);
    return fly(s, now, T, s.descending);
  }
  // In the air: on to the next spot when this one's reached (a chick's is beside its leader). A dive ends at its low spot
  // (or once it is down near it, or out of time), and it sweeps up to the next; at the top of the climb before one, it
  // dives.
  if (s.young && s.follow) {
    s.spot = s.follow;
    s.drifting = false;
    if (reached(pos, s.spot, G)) s.drifting = true;
  } else if (s.diving) {
    if (now >= s.until || reached(pos, s.spot, DIVE_FLIGHT) || pos.y - s.spot.y < 0.6) {
      s.diving = false;
      pickSpot(s, now);
    }
  } else if (s.diveNext && !s.drifting) {
    // (over the top spot but still climbing: it circles up till it's there)
    if (atDiveTop(pos, s.spot, G)) startDive(s, now);
    else if (now >= s.until) pickSpot(s, now);
  } else if (now >= s.until || (!s.drifting && reached(pos, s.spot, G))) pickSpot(s, now);
  return fly(s, now, T, s.drifting);
}

// The stoop: from the top of the hall (or high over the glade) down at a spot over the floor ahead of it, its wings
// tucked. Nowhere to dive to, it flies on.
function startDive(s, now) {
  s.diveNext = false;
  const e = s.e;
  const k = kinds(e, s);
  const pos = e.location;
  const yaw = e.getRotation().y;
  let low;
  if (k.lists) low = pickDiveLow(k.lists.air, pos, yaw, k.kindAt, k.lists.span, G);
  else low = wildDiveLow(s, pos, yaw, now);
  if (!low) return pickSpot(s, now);
  s.diving = true;
  s.spot = low;
  s.drifting = false;
  s.glide = false;
  s.until = now + DIVE_FLIGHT.spotTicks;
  sound(e, "mob.phantom.swoop", 1.0, s.young ? 1.5 : 0.85);
}

// A wild dive: the ground ahead, 9 to 22 blocks off (and at least DIVE_SLOPE times the drop, so it gets all the way
// down), 3.5 blocks over it, 10 or more under it (a drop of 6.5 or more, as in a hall), with a clear way down; open ground, never a tree's crown (the bench:
// a dive at a crown stopped a few blocks down, over the leaves); within its range of where it was met.
function wildDiveLow(s, pos, yaw, now) {
  const f = facing(yaw);
  for (let i = 0; i < 12; i++) {
    const a = ((Math.random() - 0.5) * 80 * Math.PI) / 180;
    const d = 9 + Math.random() * 13;
    const dir = { x: f.x * Math.cos(a) - f.z * Math.sin(a), z: f.z * Math.cos(a) + f.x * Math.sin(a) };
    const at = { x: pos.x + dir.x * d, y: pos.y, z: pos.z + dir.z * d };
    const g = groundUnder(s.e, at, 30);
    if (g === undefined || pos.y - g < 10 || d < (pos.y - g - 3.5) * DIVE_SLOPE) continue;
    if (TREE.test(s.e.dimension.getBlock({ x: Math.floor(at.x), y: g - 1, z: Math.floor(at.z) })?.typeId ?? "leaves")) continue;
    if (s.home && Math.hypot(at.x - s.home.x, at.z - s.home.z) > BALANCE.griffin.wildRange) continue; // (over its glade)
    const spot = { x: Math.floor(at.x) + 0.5, y: g + 3.5, z: Math.floor(at.z) + 0.5 };
    if (shunned(s, spot.x, spot.z, now)) continue;
    if (clearFlight(s, pos, spot)) return spot;
  }
  return undefined;
}

// The next spot in the air: a cell of its hall with room for its wings (a wild one: open air a way over the ground,
// near where it was first seen, away from whoever scared it). Now and then it glides there rather than beating; now and
// then (a grown one, in a hall tall enough, or over the glade) it climbs to the top of the hall to dive from there.
function pickSpot(s, now) {
  const e = s.e;
  const T = BALANCE.griffin;
  const k = kinds(e, s);
  let spot;
  const fleeing = Boolean(s.flee) && now < s.flee.until;
  s.diving = false;
  s.diveNext = false;
  if (!s.young && !fleeing && s.day !== false && now < s.airUntil && Math.random() < T.diveChance) {
    if (k.lists) spot = pickDiveTop(k.lists.air, e.location, k.kindAt, k.lists.span, G);
    else spot = wildSpot(s, k, T, now, true);
    if (spot) s.diveNext = true;
  }
  if (!spot) {
    if (k.lists) spot = pickAirSpot(k.lists.air, e.location, k.kindAt, G);
    else spot = wildSpot(s, k, T, now);
  }
  if (spot) {
    s.spot = spot;
    s.drifting = false;
    s.until = now + G.spotTicks;
    s.glide = !s.diveNext && Math.random() < T.glideChance;
    return;
  }
  // Nowhere to go yet (the hall not measured since the world loaded, or a cramped place): it hovers a moment.
  s.spot = { x: e.location.x, y: e.location.y, z: e.location.z };
  s.drifting = true;
  s.until = now + 30;
}

function wildSpot(s, k, T, now, high = false) {
  const p = s.e.location;
  const fleeing = Boolean(s.flee) && now < s.flee.until;
  for (let i = 0; i < 16; i++) {
    let x, z;
    if (fleeing) {
      // Away from whoever scared it: out past where it shies from, on its own side of them (back over its glade once
      // the minute is up).
      const a = Math.atan2(p.z - s.flee.z, p.x - s.flee.x) + ((Math.random() - 0.5) * 2 * Math.PI) / 3;
      const r = T.shyRange * 1.5 + 2 + Math.random() * 10;
      x = s.flee.x + Math.cos(a) * r;
      z = s.flee.z + Math.sin(a) * r;
    } else {
      x = p.x + (Math.random() - 0.5) * 2 * G.wanderRange;
      z = p.z + (Math.random() - 0.5) * 2 * G.wanderRange;
      // Keep near home (over the glade it was met in).
      if (s.home && Math.hypot(x - s.home.x, z - s.home.z) > T.wildRange) {
        x = (x + s.home.x) / 2;
        z = (z + s.home.z) / 2;
      }
    }
    const top = { x, y: p.y + 12, z };
    const g = groundUnder(s.e, top, 40);
    if (g === undefined) continue;
    const y = g + (high ? T.wildHeight[1] + 2 : between(T.wildHeight)); // (a dive starts from higher up)
    const c = { x: Math.floor(x), y, z: Math.floor(z) };
    if (!k.kindAt(c.x, c.y, c.z) || !k.kindAt(c.x, c.y + 1, c.z) || !k.kindAt(c.x, c.y + 2, c.z)) continue;
    if (!k.kindAt(c.x + 3, c.y, c.z) || !k.kindAt(c.x - 3, c.y, c.z) || !k.kindAt(c.x, c.y, c.z + 3) || !k.kindAt(c.x, c.y, c.z - 3)) continue;
    const spot = { x: c.x + 0.5, y: c.y + 0.5, z: c.z + 0.5 };
    if (!clearFlight(s, p, spot)) continue; // a treetop in the way
    return spot;
  }
  return undefined;
}

// Nothing solid on the straight way there for its body (feet positions `from` and `to`): the game's block raycast from
// its middle and the corners of its box (plants don't count). The glade's great trees stand as tall as it flies.
function clearFlight(s, from, to) {
  const v = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
  const len = Math.hypot(v.x, v.y, v.z);
  if (len < 0.5) return true;
  const dir = { x: v.x / len, y: v.y / len, z: v.z / len };
  const b = s.young ? G.hatchlingBody : G.body;
  const h = b.half - 0.1, lo = 0.1, hi = b.height - 0.1;
  const from9 = [[0, b.height / 2, 0], [h, lo, h], [-h, lo, h], [h, lo, -h], [-h, lo, -h], [h, hi, h], [-h, hi, h], [h, hi, -h], [-h, hi, -h]];
  try {
    for (const [dx, dy, dz] of from9) {
      if (s.e.dimension.getBlockFromRay({ x: from.x + dx, y: from.y + dy, z: from.z + dz }, dir, { maxDistance: len, includeLiquidBlocks: true, includePassableBlocks: false })) return false;
    }
  } catch {
    return false;
  }
  return true;
}

// One tick of flight (or hovering, drifting): the push, its heading and pitch, the act (beating or gliding, or the hover
// when it holds still in the air), and the wing beats.
function fly(s, now, T, hovering) {
  const e = s.e;
  const pos = e.location;
  const yaw = e.getRotation().y;
  const f = facing(yaw);
  const ahead = { x: Math.floor(pos.x + f.x * G.lookAhead), y: Math.floor(s.spot.y), z: Math.floor(pos.z + f.z * G.lookAhead) };
  const k = kinds(e, s);
  const body = s.young ? G.hatchlingBody : G.body;
  // The wild: the glade's great trees stand as tall as it flies. A crown ahead of it, it turns hard and climbs over, and
  // if that doesn't clear it in a second, it picks somewhere else to fly to (with a clear way there).
  const wild = !k.measured && s.mode === "air" && !hovering;
  const crownAhead = wild && solidAround(e, pos, { x: f.x, y: 0, z: f.z }, G.lookAhead, body);
  s.crownTicks = crownAhead ? (s.crownTicks ?? 0) + 1 : 0;
  if (s.crownTicks > 20) {
    s.crownTicks = 0;
    pickSpot(s, now);
  }
  const clearAhead = Boolean(k.kindAt(ahead.x, ahead.y, ahead.z)) && !tightTurn(pos, yaw, s.spot, G) && !crownAhead;
  // A chick a way behind its spot beside the grown one flies faster to catch up; a dive is the stoop's.
  const g = s.diving && !hovering ? DIVE_FLIGHT : s.young && s.mode === "air" && s.follow && !hovering && dist(pos, s.follow) > 6 ? CATCH_UP : G;
  const v = glideStep({ pos, yaw, spot: s.spot, drifting: hovering, clearAhead, trim: s.trim }, g);
  s.trim = v.trim;
  if (crownAhead) v.y = Math.max(v.y, G.maxRise);
  // Never pushed up or down into a block over or under its body (a crown's edge, the floor): it flies on level till it
  // is clear of it.
  if (Math.abs(v.y) > 0.001 && !boxOpen(e.dimension, pos, { x: pos.x, y: pos.y + v.y, z: pos.z }, body)) v.y = 0;
  if (hovering && s.mode === "land") {
    // Coming down: drawn over the landing cell's middle as it sinks.
    v.x = Math.max(-0.06, Math.min(0.06, (s.spot.x - pos.x) * 0.1));
    v.z = Math.max(-0.06, Math.min(0.06, (s.spot.z - pos.z) * 0.1));
  }
  flyStep(e, v, hovering ? { x: 0, y: s.face ? yawOf(s.face.x + 0.5 - pos.x, s.face.z + 0.5 - pos.z) : yaw } : { x: pitchOf(v), y: v.yaw }, now, tell, s.young ? G.hatchlingBody : G.body);
  const diving = s.diving && !hovering;
  const gliding = !hovering && !diving && s.glide && v.y <= 0.02;
  setProp(e, PROP, hovering ? ACT.hover : diving ? ACT.dive : ACT.fly);
  setProp(e, "zoocraft:gliding", gliding);
  if (!gliding && !diving && now >= s.beatAt) {
    s.beatAt = now + (hovering ? 16 : 22);
    sound(e, "mob.enderdragon.flap", s.young ? 0.25 : 0.45, s.young ? 1.9 : 1.35 + Math.random() * 0.1);
  }
}

// Something solid within `dist` ahead of its body (`dir`: level, unit): the game's block raycast from its middle, its box's
// sides and its top and bottom.
function solidAround(e, pos, dir, dist, body) {
  const h = body.half - 0.1;
  const starts = [[0, body.height / 2, 0], [dir.z * h, body.height / 2, -dir.x * h], [-dir.z * h, body.height / 2, dir.x * h], [0, 0.1, 0], [0, body.height - 0.1, 0]];
  try {
    for (const [dx, dy, dz] of starts) {
      if (e.dimension.getBlockFromRay({ x: pos.x + dx, y: pos.y + dy, z: pos.z + dz }, dir, { maxDistance: dist, includeLiquidBlocks: true, includePassableBlocks: false })) return true;
    }
  } catch {
    // unloaded: nothing known there
  }
  return false;
}

// Back up into the air from a landing it couldn't make, to try again a little later.
function giveUpLanding(s, now) {
  s.mode = "air";
  s.byGold = false;
  s.land = undefined;
  s.then = undefined;
  s.face = undefined;
  s.baited = false;
  s.airUntil = now + 100;
  pickSpot(s, now);
}

// Down: its feet on the floor of its landing cell, what it landed for. The hover down eases in, so it stops a little over
// the floor: its feet are put on it. Out of time still more than half a block over it (something in the way), it goes
// back up and tries again.
function touchDown(s, now, T) {
  const e = s.e;
  const p = e.location;
  const floor = s.spot && Math.abs(p.y - s.spot.y) < 0.6 ? s.spot.y : undefined;
  if (floor === undefined) return giveUpLanding(s, now);
  s.mode = "ground";
  s.groundUntil = now + between(T.groundTicks);
  flyStep(e, { x: 0, y: 0, z: 0 }, undefined, now, tell);
  if (Math.abs(p.y - floor) > 0.01) {
    try {
      e.teleport({ x: p.x, y: floor, z: p.z }, { keepVelocity: false });
    } catch {
      // stays where it is
    }
  }
  s.yaw = s.face ? yawOf(s.face.x + 0.5 - e.location.x, s.face.z + 0.5 - e.location.z) : e.getRotation().y;
  setProp(e, "zoocraft:gliding", false);
  const what = s.then;
  s.then = undefined;
  const ex = s.exId ? getExhibit(s.exId) : undefined;
  s.byGold = Boolean(ex?.griffin?.spots?.length) && !awayFromGold(e.location, ex);
  const acts = { sleep: [ACT.sleep, T.sleepTicks], guard: [ACT.guard, T.guardTicks], eat: [ACT.eat, T.eatTicks], screech: [ACT.screech, T.screechTicks], preen: [ACT.preen, T.preenTicks], stand: [ACT.stand, T.standTicks] };
  const [act, ticks] = acts[what] ?? acts.stand;
  startAct(s, now, act, ticks);
  s.face = undefined;
}

// On the ground: held still where it stands, facing its way; the screech, the preening's ruffles, the eating's bites.
function hold(s, now, T) {
  const e = s.e;
  flyStep(e, { x: 0, y: 0, z: 0 }, { x: 0, y: s.yaw }, now, tell);
  setProp(e, PROP, s.act);
  if (s.act === ACT.screech && s.screechAt && now >= s.screechAt) {
    s.screechAt = undefined;
    sound(e, "mob.phantom.idle", s.young ? 0.6 : 1.3, s.young ? 1.6 : 0.8);
  } else if (s.act === ACT.preen && now >= s.ruffleAt) {
    s.ruffleAt = now + 25 + Math.floor(Math.random() * 20);
    sound(e, "mob.parrot.fly", 0.5, s.young ? 1.3 : 0.75);
  } else if (s.act === ACT.eat && now >= s.chompAt) {
    s.chompAt = now + 14 + Math.floor(Math.random() * 10);
    sound(e, "mob.ravager.bite", 0.45, s.young ? 1.7 : 1.3);
  }
}

// For /zoocraft:rays-style reports and the tests: what the steering is doing with a griffin.
export function griffinInfo(id) {
  const s = state.get(id);
  return s ? { mode: s.mode, act: s.act, spot: s.spot, land: s.land, then: s.then, young: s.young, wild: s.wild, diving: Boolean(s.diving), diveNext: Boolean(s.diveNext) } : undefined;
}
export function griffinErrors() {
  return [...told];
}
export { WILD_GRIFFIN };
