import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, message, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, BLOCKS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { getPark, parkTime, parkOfRecord, dayFor } from "../park/park.js";
import { dayOf } from "../core/clock.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { trunkBeside, upLegs, downLegs, escapeLegs, stillOpen, yawTo, centre, clingSpot, hugFor } from "./climbRules.js";
import { ACT, RED_PANDA_TYPES, moodAt, pandaRoute, canopyMap, pathTo, pickSpot, drapeSpot, nestBeside, holeDir, nestSpot, pickInterest, restAct, isHotBiome, isCanopy } from "./pandaRules.js";

// Red pandas (0.1.79, the Treetop trio; spec 5.2 "Elevated travel and resting | Continuous climbing
// routes, nest boxes"; the rules are in animals/pandaRules.js). Every half second, for the red pandas
// near players only. The day sets the mood (pandaRules.js moodAt): at dawn, at dusk and for a spell
// around midnight they're about: up a trunk (the engine walks one to a tree with the entity's
// zoocraft:seek_climb, a move_to_block), on up through the leaves onto the canopy and along it a trip or
// three, stopping to look about, then back and down head first; sat up at the feeder with a stalk of
// bamboo; grooming. Through the day they rest up in the trees, draped over a branch (sprawled out panting
// in a hot biome); at night they sleep curled up with the tail over the face, on the canopy or in a Nest
// Box (one beside the canopy, or on the floor). With nowhere to climb they lie down where they are. A
// Survival player right beside one on the ground gets the warning: up on its hind legs, arms up, a hiss
// (no harm done). A wild one goes up a tree when someone comes near. Cubs stay in the Nest Box their
// first park day, twittering, then follow and play. A zoo red panda in an exhibit that isn't climb-proof
// climbs out along the way out the measure found. Climbing is script-driven, as the raccoon's: the
// zoocraft:climb event turns off gravity and walking and a glide a tick at a time (tickRedPandaMoves)
// carries it; zoocraft:move gives both back. What it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it leaves them to it
/** @type {any} */
const FACING = "minecraft:cardinal_direction";

const state = new Map(); // entity id -> state (see step)
const moving = new Map(); // entity id -> { e, legs, i, t, from, done, read }

// Every 10 ticks: the red pandas near players.
export function tickRedPandas(now) {
  const seen = new Set();
  const players = onlinePlayers();
  let mood = "rest";
  try {
    mood = moodAt(world.getTimeOfDay(), BALANCE.redpanda);
  } catch {
    // keep resting
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, RED_PANDA_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, mood);
      } catch {
        state.delete(e.id);
        moving.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
  }
}

// Every tick: glide the climbing red pandas along their legs.
export function tickRedPandaMoves() {
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
        // Something built in the way since it set off: it lets go and drops (no fall damage).
        if (!leg.inside && !stillOpen(m.read, cellOf(leg.to))) {
          moving.delete(id);
          letGo(e);
          continue;
        }
        setAct(e, leg.act);
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
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

const keyOf = (c) => `${c.x},${c.y},${c.z}`;

// Anywhere from range[0] to range[1] ticks.
/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function reader(e) {
  return blockReader(e.dimension, { leaves: true, climb: true });
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its body: "move" (walking, with gravity), "still" (standing put) or "climb" (no gravity, no walking:
// the glide carries it, and it stays put up in the trees or in a Nest Box). Each event swaps the other
// two groups out, and every one holds the walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "climb", "feeder", "nest" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function run(e, s, phase, legs, done) {
  s.phase = phase;
  s.got = true;
  moving.set(e.id, { e, legs, i: 0, t: 0, from: { x: e.location.x, y: e.location.y, z: e.location.z }, done, read: reader(e) });
}

// Its tuning (balance.redpanda), with a cub hugging nearer the bark (climbRules.js hugFor) and its own size.
function tuning(a) {
  const T = BALANCE.redpanda;
  const scale = a?.juvenile ? SPECIES["zoocraft:red_panda"].breeding.juvenileScale : 1;
  return scale < 1 ? { ...T, hug: hugFor(T.hug, scale), scale } : { ...T, scale: 1 };
}

// Back on its feet: gravity and walking again, nothing on.
function settle(e, s) {
  s.phase = "idle";
  s.climb = undefined;
  s.target = undefined;
  s.nest = undefined;
  s.cool = system.currentTick + BALANCE.redpanda.coolTicks;
  body(e, s, "move");
  setAct(e, ACT.none);
}

function letGo(e) {
  const s = state.get(e.id);
  if (s) settle(e, s);
  else {
    e.triggerEvent("zoocraft:move");
    setAct(e, ACT.none);
  }
}

// Is it hot where it lives? Its exhibit's measure says (ex.hotBiome); a wild one reads the biome it's in, once.
function hotFor(e, s, ex) {
  if (ex) return Boolean(ex.hotBiome);
  if (s.hot === undefined) {
    try {
      const b = e.dimension.getBiome(e.location);
      s.hot = isHotBiome({ id: b.id, tags: b.getTags() }, BALANCE.redpanda);
    } catch {
      s.hot = false;
    }
  }
  return s.hot;
}

function step(e, now, players, mood) {
  const T0 = BALANCE.redpanda;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, interest: "idle", interestUntil: 0, actUntil: 0, cool: now + T0.coolTicks, standCool: 0 };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, a climb cut short included (it drops; no fall
    // damage), so it can never be stranded without its gravity or its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  if (moving.has(e.id)) return;
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const T = tuning(a);
  const hot = hotFor(e, s, ex);
  // A cub its first park day stays in a Nest Box.
  if (a?.juvenile && ex && dayFor(a) - (a.bornDay ?? -Infinity) < T.nestDays) {
    if (s.phase === "nest") return nesting(e, s, now, mood, true);
    if (s.phase === "idle" && cubToNest(e, s, now, ex, T)) return;
  }
  if (s.phase === "top") return onCanopy(e, s, now, mood, hot);
  if (s.phase === "rest") return resting(e, s, now, mood, hot);
  if (s.phase === "nest") return nesting(e, s, now, mood, false);
  if (s.phase === "act") return now < s.actUntil ? acting(e, s, now) : settle(e, s);
  if (s.phase !== "idle") settle(e, s); // a glide that stopped without finishing
  // Up in the trees without a climb on (met again there, let go there, or a cub out of a Nest Box beside
  // the canopy): gravity holds it on the leaves (or in them) and the engine never walks it off that drop.
  if (fromCanopy(e, s, T)) return;

  // On the ground. The warning first: a Survival player right beside it.
  if (now >= s.standCool && warn(e, s, now, players, T)) return;
  const wild = !a;
  if (wild && shy(e, players, T) && s.interest !== "climb") {
    s.interest = "climb";
    s.interestUntil = now + T.interestTicks;
  }
  if (now >= s.interestUntil) {
    // Its time for the last one ran out with nothing done (no climb, Nest Box, meal or act): nowhere it got to.
    s.tired = s.interestUntil > 0 && !s.got;
    s.got = false;
    const cub = Boolean(a?.juvenile);
    // A wild one forages for the bamboo growing round it (the engine walks it to bamboo as to a feeder).
    s.interest = pickInterest({ mood, feeder: wild || feederIn(ex), nest: nestIn(ex), cub, company: cub && companyNear(e) });
    s.interestUntil = now + T.interestTicks + Math.floor(Math.random() * T.interestTicks);
  }
  const want = s.interest === "climb" || s.interest === "feeder" || s.interest === "nest" ? s.interest : "none";
  seek(e, s, want);
  if (now < s.cool || !e.isOnGround || tempted(e, players)) return;
  const here = cellOf(e.location);
  const read = reader(e);
  if (ex && a && !a.outside && climbOut(e, s, ex, a, here, read, players, T)) return;
  s.mood = mood;
  if (s.interest === "climb" && tryClimb(e, s, now, here, read, T)) return;
  if (s.interest === "feeder" && tryEat(e, s, now, here, ex)) return;
  if (s.interest === "nest" && tryNest(e, s, now, here, T)) return;
  if ((s.interest === "groom" || s.interest === "play") && Math.random() < T.actChance) return void startAct(e, s, now, s.interest === "groom" ? ACT.groom : ACT.play, s.interest === "groom" ? T.groomTicks : T.playTicks, undefined);
  // Resting or asleep with nowhere it got to: now and then it lies down where it is.
  if (mood !== "active" && s.tired && Math.random() < T.groundRestChance) {
    s.tired = false;
    startAct(e, s, now, restAct(mood, hot), T.groundRestTicks, undefined);
  }
}

// Someone close by holding its food or an empty carrier: it lets them tempt or catch it.
function tempted(e, players) {
  const bait = BALANCE.redpanda.bait;
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const id = heldItem(p)?.typeId ?? "";
    if (!(bait.includes(id) || carrierByItem(id)?.full === false)) continue;
    if (dist(p.location, e.location) <= TEMPT_RANGE) return true;
  }
  return false;
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

const survival = (p) => {
  const m = String(p.getGameMode()).toLowerCase();
  return m === "survival" || m === "adventure";
};

// The warning (SDZ, Smithsonian: it stands on its hind legs and swipes when threatened): up on its hind
// legs facing them, arms up, a hiss. It does no harm.
function warn(e, s, now, players, T) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || !survival(p)) continue;
    const l = p.location;
    if (dist(l, e.location) > T.standRange) continue;
    s.standCool = now + T.standCool;
    startAct(e, s, now, ACT.stand, T.standTicks, yawTo(l.x - e.location.x, l.z - e.location.z));
    sound(e, "mob.cat.hiss", 0.5, 1.5);
    return true;
  }
  return false;
}

// A wild one with someone near it goes up a tree.
function shy(e, players, T) {
  return players.some((p) => p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.shyRange);
}

function companyNear(e) {
  try {
    return entitiesNear(e.dimension, e.location, 4, RED_PANDA_TYPES).some((o) => o.id !== e.id);
  } catch {
    return false;
  }
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  if (!ex) return false;
  return (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:red_panda"].dietTags.includes(RATIONS[rec.item]?.diet));
}

// A Nest Box in its exhibit.
function nestIn(ex) {
  return Boolean(ex && (ex.fixtureIds ?? []).some((id) => db.get("equipment", id)?.type === "nest"));
}

function isNestAt(e) {
  return (x, y, z) => db.get("equipment", posKey(e.dimension.id, { x, y, z }))?.type === "nest";
}

// Up a tree trunk or a Climbing Frame beside it, on up through the leaves onto the canopy.
function tryClimb(e, s, now, here, read, T) {
  const t = trunkBeside(read, here);
  if (!t) return false;
  const route = pandaRoute(read, t.from, t.dir, T.maxUp);
  if (!route) return false;
  const legs = [];
  if (t.from !== here) legs.push({ to: centre(t.from), ticks: T.acrossTicks, act: ACT.along, yaw: yawTo(t.from.x - here.x, t.from.z - here.z) });
  const pauseAt = route.up.length >= 4 && Math.random() < T.pauseChance ? 1 + Math.floor(Math.random() * (route.up.length - 2)) : -1;
  legs.push(...upLegs(t.from, t.dir, route, T, pauseAt));
  s.climb = { from: t.from, dir: t.dir, route, T };
  body(e, s, "climb");
  seek(e, s, "none");
  run(e, s, "up", legs, () => atTop(e, s));
  return true;
}

// At the top of the climb: out on the canopy (or on top of the trunk) it looks for where to go; under
// something it can't get through, it clings there a while.
function atTop(e, s) {
  const { route, dir, T } = s.climb;
  const now = system.currentTick;
  if (!route.onTop) {
    s.home = undefined;
    return rest(e, s, now, ACT.cling, clingSpot(route.up[route.up.length - 1], dir, T.hug), yawTo(dir.x, dir.z), T.clingTicks);
  }
  s.home = keyOf(route.top);
  s.trips = s.mood === "active" ? between(T.trips) : 1;
  s.phase = "top";
  s.spot = centre(route.top);
  s.yaw = yawTo(dir.x, dir.z);
  setAct(e, ACT.none);
  e.teleport(s.spot, { rotation: { x: 0, y: s.yaw }, keepVelocity: false });
}

// Standing on the canopy with no climb to go back down: the nearest canopy block it can get to that a
// trunk's route comes up to (pandaRoute from the floor below it), as if it had climbed up there; then on
// along the canopy (onCanopy) and down that trunk in time. False when it isn't up on the canopy or has no way down.
function fromCanopy(e, s, T) {
  const read = reader(e);
  const here = cellOf(e.location);
  if (read(here.x, here.y, here.z) === "leaves") {
    // In the leaves (a climb cut short there): straight down through them, head first, to the floor below.
    const legs = [];
    for (let y = here.y; y > here.y - T.maxDown && (read(here.x, y - 1, here.z) === "leaves" || read(here.x, y - 1, here.z) === "air"); y--) legs.push({ to: centre({ x: here.x, y: y - 1, z: here.z }), ticks: T.downTicks, act: ACT.down, yaw: e.getRotation().y, inside: true });
    if (!legs.length) return false;
    legs[legs.length - 1].act = ACT.none;
    body(e, s, "climb");
    seek(e, s, "none");
    run(e, s, "down", legs, () => settle(e, s));
    return true;
  }
  if (!e.isOnGround || !isCanopy(read, here.x, here.y, here.z)) return false;
  const map = canopyMap(read, here, T.canopyCells);
  for (const c of [...map.values()].sort((p, q) => p.dist - q.dist)) {
    let y = c.y - 1;
    while (y > c.y - T.maxUp - 2 && (read(c.x, y, c.z) === "leaves" || read(c.x, y, c.z) === "air")) y--;
    const foot = { x: c.x, y: y + 1, z: c.z };
    if (foot.y >= c.y - 1) continue;
    const t = trunkBeside(read, foot);
    if (!t || t.from !== foot) continue;
    const route = pandaRoute(read, foot, t.dir, T.maxUp);
    if (!route?.onTop || keyOf(route.top) !== keyOf(c)) continue;
    s.climb = { from: foot, dir: t.dir, route, T };
    s.home = keyOf(c);
    s.spot = centre(here);
    s.yaw = yawTo(t.dir.x, t.dir.z);
    s.trips = 0;
    s.phase = "top";
    body(e, s, "climb");
    seek(e, s, "none");
    return true;
  }
  return false;
}

// Up on the canopy, between one thing and the next: about, it goes along it a trip or three; resting or
// asleep, it makes for a Nest Box beside the canopy (mostly at night) or a spot to drape or curl up.
function onCanopy(e, s, now, mood, hot) {
  const T = s.climb.T;
  s.mood = mood; // a Nest Box it goes into from here keeps this mood (intoNest: restMood), not the one it climbed in
  const read = reader(e);
  const here = cellOf(s.spot);
  const map = canopyMap(read, here, T.canopyCells);
  if (mood === "active") {
    if (s.trips-- <= 0) return goBack(e, s);
    const k = pickSpot(map, T.tripMin, T.tripMax);
    if (!k) return goBack(e, s);
    return along(e, s, pathTo(map, k), () => rest(e, s, system.currentTick, ACT.none, s.spot, s.yaw, T.lookTicks));
  }
  const nest = nestBeside(map, isNestAt(e));
  if (nest && Math.random() < (mood === "sleep" ? T.nestNight : T.nestDay)) {
    return along(e, s, pathTo(map, nest.key), () => intoNest(e, s, nest.box, nest.cell, T, "up"));
  }
  const k = pickSpot(map, 1, T.tripMax) ?? keyOf(here);
  const c = map.get(k) ?? here;
  return along(e, s, pathTo(map, k), () => {
    const act = restAct(mood, hot);
    const d = act === ACT.curl ? { pos: centre(c), yaw: undefined } : drapeSpot(read, c, T);
    rest(e, s, system.currentTick, act, d.pos, d.yaw ?? s.yaw, T.restTicks, mood);
  });
}

// Along the canopy from where it is through `path` (blocks), then `done`.
function along(e, s, path, done) {
  const T = s.climb.T;
  let prev = cellOf(s.spot);
  const legs = path.map((c) => {
    const leg = { to: centre(c), ticks: c.y !== prev.y ? Math.round(T.acrossTicks * 1.5) : T.acrossTicks, act: ACT.along, yaw: yawTo(c.x - prev.x, c.z - prev.z) };
    prev = c;
    return leg;
  });
  if (!legs.length) return done();
  s.yaw = legs[legs.length - 1].yaw;
  run(e, s, "along", legs, () => {
    s.spot = centre(prev);
    done();
  });
}

// A while doing `act` at `spot` up in the trees: a look about between trips, draped over a branch, curled
// up asleep, panting, or clinging to the bark. Resting (with `mood`) it wakes early when the day moves on.
function rest(e, s, now, act, spot, yaw, ticks, mood = undefined) {
  s.phase = "rest";
  s.act = act;
  s.actUntil = now + between(ticks);
  s.restMood = mood;
  s.spot = spot;
  s.yaw = yaw;
  setAct(e, act);
  e.teleport(spot, { rotation: { x: 0, y: yaw ?? 0 }, keepVelocity: false });
}

function resting(e, s, now, mood, hot) {
  const woke = s.restMood && mood !== s.restMood;
  if (now < s.actUntil && !woke) return hold(e, s, now);
  if (!s.home) return climbDown(e, s); // it was clinging to the bark
  s.spot = centre(cellOf(s.spot));
  if (s.act === ACT.none) {
    s.phase = "top";
    return onCanopy(e, s, now, mood, hot);
  }
  return goBack(e, s);
}

// Up there it stays put (it has no gravity while it climbs): nudged off its spot, it goes back. It keeps
// its heading, but for a look about, when it turns as it likes; now and then a squeal or twitter.
function hold(e, s, now) {
  const p = e.location;
  if (dist(p, s.spot) > 0.3) e.teleport(s.spot, { rotation: { x: 0, y: s.yaw ?? 0 }, keepVelocity: false });
  else if (s.act !== ACT.none && s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.none && Math.random() < 0.02) sound(e, "mob.fox.ambient", 0.3, 1.8);
}

// Back along the canopy to where it came up, then down head first.
function goBack(e, s) {
  const T = s.climb.T;
  const here = cellOf(s.spot);
  if (s.home && keyOf(here) !== s.home) {
    const map = canopyMap(reader(e), here, T.canopyCells * 2);
    if (!map.has(s.home)) return letGo(e); // the way back is gone: it drops (no fall damage)
    return along(e, s, pathTo(map, s.home), () => climbDown(e, s));
  }
  climbDown(e, s);
}

function climbDown(e, s) {
  const { from, dir, route, T } = s.climb;
  run(e, s, "down", downLegs(from, dir, route, T), () => settle(e, s));
}

// Into a Nest Box from the block `from` beside it (up on the canopy, or on the floor): through the hole,
// head out of it looking about. `how`: "up" (from the canopy), "floor" or "cub".
function intoNest(e, s, box, from, T, how) {
  let dir = { x: 0, z: -1 };
  try {
    dir = holeDir(String(e.dimension.getBlock(box)?.permutation.getState(FACING) ?? "north"));
  } catch {
    // facing north
  }
  const spot = nestSpot(box, dir, T.scale, T);
  s.nest = { box, from, how, spot: spot.pos, yaw: spot.yaw };
  body(e, s, "climb");
  seek(e, s, "none");
  run(e, s, "intoNest", [{ to: spot.pos, ticks: T.nestTicks, act: ACT.nest, yaw: spot.yaw, inside: true }], () => {
    s.phase = "nest";
    s.act = ACT.nest;
    s.spot = spot.pos;
    s.yaw = spot.yaw;
    s.restMood = s.mood;
    s.actUntil = system.currentTick + between(T.restTicks);
  });
}

// In the Nest Box: it stays (a cub its first day, the whole day), then out the way it came.
function nesting(e, s, now, mood, cub) {
  const gone = db.get("equipment", posKey(e.dimension.id, s.nest.box))?.type !== "nest";
  const done = gone || (!cub && (now >= s.actUntil || (s.restMood && mood !== s.restMood)));
  if (!done) {
    hold(e, s, now);
    if (cub && Math.random() < 0.04) sound(e, "mob.fox.ambient", 0.2, 2.0); // cubs twitter in the nest
    return;
  }
  const n = s.nest;
  const out = centre(n.from);
  if (n.how === "up") {
    run(e, s, "outNest", [{ to: out, ticks: s.climb.T.nestTicks, act: ACT.along, yaw: yawTo(n.from.x - n.box.x, n.from.z - n.box.z), inside: true }], () => {
      s.spot = out;
      s.nest = undefined;
      goBack(e, s);
    });
    return;
  }
  run(e, s, "outNest", [{ to: out, ticks: BALANCE.redpanda.nestTicks, act: ACT.none, yaw: yawTo(n.from.x - n.box.x, n.from.z - n.box.z), inside: true }], () => settle(e, s));
}

// Into a Nest Box on the floor beside it.
function tryNest(e, s, now, here, T) {
  const isNest = isNestAt(e);
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (Math.abs(dx) + Math.abs(dz) !== 1) continue;
      const box = { x: here.x + dx, y: here.y, z: here.z + dz };
      if (!isNest(box.x, box.y, box.z)) continue;
      intoNest(e, s, box, here, T, "floor");
      return true;
    }
  }
  return false;
}

// A cub its first park day: straight into its exhibit's Nest Box (the first one that's loaded).
function cubToNest(e, s, now, ex, T) {
  for (const id of ex.fixtureIds ?? []) {
    const rec = db.get("equipment", id);
    if (rec?.type !== "nest" || rec.dimension !== e.dimension.id) continue;
    try {
      if (!e.dimension.isChunkLoaded(rec.pos)) continue;
    } catch {
      continue;
    }
    e.teleport(centre(rec.pos), { keepVelocity: false });
    s.mood = "sleep";
    intoNest(e, s, rec.pos, cellOf(e.location), T, "cub");
    s.nest.from = nestExit(e, rec.pos);
    return true;
  }
  return false;
}

// Where a cub comes out of the Nest Box when its first day is over: the floor in front of the hole, or
// below it (it drops; no fall damage).
function nestExit(e, box) {
  let dir = { x: 0, z: -1 };
  try {
    dir = holeDir(String(e.dimension.getBlock(box)?.permutation.getState(FACING) ?? "north"));
  } catch {
    // facing north
  }
  return { x: box.x + dir.x, y: box.y, z: box.z + dir.z };
}

// Sat up at a feeder holding food it eats (or beside bamboo growing), a stalk in its paws.
function tryEat(e, s, now, here, ex) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const pos = { x: here.x + dx, y: here.y, z: here.z + dz };
      const rec = db.get("equipment", posKey(e.dimension.id, pos));
      const food = rec?.type === "feeder" && (!ex || (ex.feederIds ?? []).includes(rec.id)) && edible(rec);
      let bamboo = false;
      if (!food) {
        try {
          bamboo = e.dimension.getBlock(pos)?.typeId === "minecraft:bamboo";
        } catch {
          // unloaded
        }
      }
      if (food || bamboo) return startAct(e, s, now, ACT.eat, BALANCE.redpanda.eatTicks, yawTo(dx, dz));
    }
  }
  return false;
}

function startAct(e, s, now, act, ticks, yaw) {
  s.phase = "act";
  s.got = true;
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// While it eats, grooms, warns or plays: keep facing the way it was, with the sounds that go with it.
function acting(e, s, now) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.eat && now % 30 < 10) sound(e, "mob.panda.eat", 0.25, 1.6);
  else if (s.act === ACT.play && Math.random() < 0.05) sound(e, "mob.fox.ambient", 0.25, 2.0);
}

// A zoo red panda in an exhibit that isn't climb-proof: near the start of the way out the measure found,
// now and then it takes it, and the park members hear where. T: its tuning.
function climbOut(e, s, ex, a, here, read, players, T) {
  const c = ex.climb;
  if (!c || c.proof !== false || !c.path?.length) return false;
  const path = c.path.map(([x, y, z]) => ({ x, y, z }));
  const start = path[0];
  if (start.y !== here.y || Math.hypot(start.x - here.x, start.z - here.z) > T.escapeReach) return false;
  if (Math.random() >= T.escapeChance) return false;
  const legs = escapeLegs(read, here, path, T);
  if (!legs?.length) return false;
  body(e, s, "climb");
  seek(e, s, "none");
  run(e, s, "escape", legs, () => settle(e, s));
  const park = parkOfRecord(ex) ?? getPark();
  const v = c.via ?? path[path.length - 1];
  const text = `§c${a.name} is climbing out of ${ex.name} near ${v.x} ${v.y} ${v.z}! §7Red pandas climb: glass walls, an overhang along the top of the wall or a roof stop them (the exhibit's clipboard says where). Catch it with an empty Small Carrier: once the exhibit is climb-proof, release it back inside.`;
  for (const p of players) if (park?.members[p.id] && p.dimension.id === e.dimension.id) message(p, text);
  return true;
}
