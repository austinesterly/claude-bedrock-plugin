import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem, countItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { parkTime } from "../park/park.js";
import { dayOf } from "../core/clock.js";
import { animalFromEntity, getAnimal } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { flyStep, forgetStep } from "./mover.js";
import { yawTo, turnToward } from "./zebraRules.js";
import { holeDir } from "./pandaRules.js";
import { reportError } from "../core/log.js";
import { ACT, OWL_TYPES, WILD_OWL, phaseOf, hootPitch, airWay, seekWay, smoothWay, flightOf, along, speedAt, wingsAt, roostsOf, highestFree, heightAbove, feederSpot, treetopAt, groundAt, wildRoute, tempts, besidePlayer, isLow } from "./owlRules.js";

// Owls (0.1.81, the Treetop trio; spec 5.2 "owl | Owl | Nocturnal flight and perch watching | Enclosed airspace,
// nesting boxes"; the rules are in animals/owlRules.js). Every half second, for the owls near players, each owl
// does what the time of day asks of a night bird: by day it roosts still on the highest free Perch, eyes half
// shut (open, and watching, when someone comes close; the engine turns its head to follow them, the zoocraft:
// watching group's look goal), preening now and then; at dusk it hoots from its perch, the white throat puffed
// with each "oo-HU", and its mate answers; at night it watches from a perch, then flies silently to another, or
// swoops down to the feeder and mantles over the food; at dawn it goes back to the roost and coughs up a pellet.
// Someone in Survival or Adventure within a few blocks of one on the ground, on a low perch or in its Nest Box
// gets the threat display: wings spread in a half-circle, hissing and snapping its bill (no harm done). An owl
// sitting on eggs stays in the Nest Box; owlets spend their first park days in it, begging when a parent comes
// near, then hop and flutter about the floor and the low perches.
// Flights are steered here a tick at a time (tickOwlMoves) through the aviary's measured air (the flight measure,
// exhibits/geometry.js floodAerial: a search through it, then straightened), with a take-off, a cruise of
// wingbeats and glides, and a landing feet first; the push a tick is animals/mover.js flyStep's, as the Void
// Ray's (impulses, steps if the game ignores them). The entity has no gravity and no walking of its own
// (gen/owl.py). In the wild it roosts in a treetop near where it was found, flies from tree to tree at night and
// pounces on the ground now and then, through open air it checks; someone holding a Meat Ration draws it down to
// land by them (where it can be crated once the Field Journal's tasks are done). All it does goes to the client
// through the zoocraft:act property.

const RANGE = 48; // blocks from a player
const ACT_PROP = "zoocraft:act";
/** @type {any} */
const FACING = "minecraft:cardinal_direction";
const BODY = { half: 0.26, height: 0.78 }; // round its feet (blocks): a grown female's collision box (0.5 across, 0.75 up) and a hair more
// In the wild, with room to spare, it keeps further from the leaves (the game moves a body one way at a time, so a
// line that just clears a corner can still catch on it).
const WILD_BODY = { half: 0.34, height: 0.85 };
const BAIT = () => SPECIES["zoocraft:owl"]?.baitItem;

const state = new Map(); // entity id -> { mode, at, yaw, perchId, act, actUntil, phase, ... }
const flights = new Map(); // entity id -> { e, f, s, t, limit, yaw, fly, then }
const perchUse = new Map(); // Perch (roost) record id -> entity id
const reported = new Set(); // errors already in the content log (one line each)

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}
const keyOf = (c) => `${c.x},${c.y},${c.z}`;
const cellOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y + 0.05), z: Math.floor(p.z) });
const middle = (c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 });
function dist(p, q) {
  return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
}

function tell(error) {
  const k = String(error);
  if (reported.has(k) || reported.size > 20) return;
  reported.add(k);
  reportError("owl", error);
}

function vulnerable(p) {
  try {
    const mode = String(p.getGameMode()).toLowerCase();
    return mode === "survival" || mode === "adventure";
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

function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}

// Its look goal on (perched: the engine turns its head to whoever it watches) or off (flying).
function body(e, s, how) {
  if (s.look === how) return;
  e.triggerEvent(how === "fly" ? "zoocraft:fly" : "zoocraft:watch");
  s.look = how;
}

function sexOfMob(e, a) {
  if (a?.sex) return a.sex;
  try {
    return e.getComponent("minecraft:mark_variant")?.value === 1 ? "male" : "female";
  } catch {
    return "female";
  }
}

function forget(id) {
  const s = state.get(id);
  if (s?.perchId !== undefined && perchUse.get(s.perchId) === id) perchUse.delete(s.perchId);
  state.delete(id);
  flights.delete(id);
  forgetStep(id);
}

// ---------------- the half-second tick ----------------
export function tickOwls(now) {
  const T = BALANCE.owl;
  const players = onlinePlayers();
  let phase = "day";
  try {
    phase = phaseOf(world.getTimeOfDay(), T);
  } catch {
    // keeps the day
  }
  let today = 0;
  try {
    today = dayOf(parkTime(), BALANCE.clock.dayLength);
  } catch {
    // day 0
  }
  const seen = new Set();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, OWL_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, phase, today);
      } catch (error) {
        tell(error);
        forget(e.id);
      }
    }
  }
  // Out of everyone's range: forgotten (met again later), but one in the air finishes its flight first.
  for (const id of [...state.keys()]) if (!seen.has(id) && !flights.has(id)) forget(id);
}

function step(e, now, players, phase, today) {
  const T = BALANCE.owl;
  let s = state.get(e.id);
  if (!s) {
    // Met (again): perched where it is, its look goal on, until it decides otherwise.
    s = { mode: "perch", at: { ...e.location }, yaw: e.getRotation().y, act: ACT.none, actUntil: 0, displayCool: 0, phase: undefined, until: 0, bout: 0, hootNext: 0, ate: -Infinity };
    s.adrift = !standing(e); // met in the air (the world saved it mid-flight): it flies somewhere to land first
    state.set(e.id, s);
    body(e, s, "watch");
    setAct(e, ACT.none);
  }
  if (flights.has(e.id)) return;
  const a = animalFromEntity(e);
  const wild = e.typeId === WILD_OWL;
  const c = { e, s, a, now, players, phase, today, T, wild, sex: sexOfMob(e, a) };
  s.wild = wild;
  if (wild) return wildStep(c);
  if (!a) return hold(c);
  const ex = a.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  const cells = ex ? cellsOf(ex.id) : undefined;
  // Out of its exhibit, or the aviary not measured since the world loaded: down to the ground and stay there.
  if (!ex || !cells) return settle(c);
  s.settled = false;
  c.ex = ex;
  c.cells = cells;
  c.open = (x, y, z) => cells.has(`${x},${y},${z}`);
  s.exId = ex.id;
  zooStep(c);
}

// On something: a block (a Perch's bar, a branch, the floor) just under its feet, or in a Nest Box.
function standing(e) {
  try {
    const p = e.location;
    if (p.y - Math.floor(p.y) > 0.2) return false;
    const under = e.dimension.getBlock({ x: p.x, y: p.y - 0.1, z: p.z });
    return Boolean(under && !under.isAir);
  } catch {
    return true;
  }
}

// Perched: it stays put (no gravity, no walking: only a push from someone moves it, and it goes back).
function hold(c) {
  const { e, s } = c;
  if (!s.at) return;
  if (dist(e.location, s.at) > 0.3) e.teleport(s.at, { rotation: { x: 0, y: s.yaw ?? 0 }, keepVelocity: false });
  else e.clearVelocity();
}

function startAct(c, act, ticks, yaw = undefined) {
  const { e, s, now } = c;
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  if (yaw !== undefined) {
    s.yaw = yaw;
    e.setRotation({ x: 0, y: yaw });
  }
  setAct(e, act);
}

// While it eats, displays or hoots: facing the way it was, with the sounds that go with it.
function keepAct(c) {
  const { e, s, now } = c;
  if (s.act === ACT.eat || s.act === ACT.display) e.setRotation({ x: 0, y: s.yaw ?? 0 });
  setAct(e, s.act);
  if (s.act === ACT.eat && now % 40 < 10) sound(e, "mob.parrot.eat", 0.3, 0.7);
  if (s.act === ACT.display && Math.random() < 0.35) sound(e, "random.click", 0.4, 1.8 + Math.random() * 0.3); // the bill snapping
}

// ---------------- in the aviary ----------------
function zooStep(c) {
  const { e, s, a, ex, now, phase, today, T } = c;
  hold(c);
  const fixtures = fixturesOf(ex);
  // A Perch counts while the air over it is still in the aviary's measure.
  c.roosts = roostsOf(fixtures).filter((r) => c.cells.get(keyOf(r.cell)) === "perch");
  const box = fixtures.find((f) => f.type === "nest");
  if (s.adrift && !a.juvenile) {
    s.adrift = false;
    if (goRoost(c) || toPerch(c, randomPerch(c))) return;
  }
  // Owlets their first park days: in the Nest Box.
  if (a.juvenile && box && today - (a.bornDay ?? -Infinity) < T.nestDays) return owletInBox(c, box);
  if (now >= s.displayCool && threatened(c)) return;
  if (s.actUntil > now) return keepAct(c);
  // Sitting on eggs: in the Nest Box.
  if (a.expecting && box) return incubate(c, box);
  // Owlets of hers in the box: she broods them there, and at night fetches food for them.
  if (box && nestlings(c)) return brood(c, box);
  if (s.mode === "nest") s.mode = "perch"; // the eggs hatched, or the box went: out it comes at its next flight
  if (a.juvenile) return owletAbout(c);
  if (s.phase !== phase) {
    s.phase = phase;
    if (phase === "day" || phase === "dawn") goRoost(c);
    if (phase === "dawn" && s.pelletDay !== today) s.pellet = true;
    if (phase === "dusk") {
      s.bout = between(T.bout);
      s.hootNext = now + between(T.firstHoot);
    }
    if (phase === "night") s.until = now + between(T.watchTicks);
    if (flights.has(e.id)) return;
  }
  if (phase === "day" || phase === "dawn") {
    // Off the roost (just let into the aviary, back from the feeder): up to it.
    if (s.perchId === undefined && c.roosts.length && goRoost(c)) return;
    if (phase === "dawn" && s.pellet) return pellet(c);
    if (phase === "day" && Math.random() < T.preenChance) return startAct(c, ACT.preen, T.preenTicks);
    setAct(e, someoneNear(c, T.wakeRange) ? ACT.none : ACT.roost);
    return;
  }
  if (phase === "dusk") {
    if (now >= s.hootNext && s.bout > 0) return hoot(c);
    setAct(e, ACT.none);
    return;
  }
  // The night: watching from a perch, then off somewhere.
  if (Math.random() < T.nightHootChance) return hoot(c);
  if (now < s.until) {
    setAct(e, ACT.watch);
    return;
  }
  s.until = now + between(T.watchTicks);
  if (now - s.ate >= T.mealGap && Math.random() < T.feedChance && toFeeder(c)) return;
  if (toPerch(c, randomPerch(c))) return;
  setAct(e, ACT.watch);
}

function someoneNear(c, range) {
  return c.players.some((p) => p.dimension.id === c.e.dimension.id && dist(p.location, c.e.location) <= range);
}

// The Perches taken by other owls.
function usedByOthers(id) {
  const used = new Set();
  for (const [perch, owner] of perchUse) if (owner !== id) used.add(perch);
  return used;
}

// Up to the highest free Perch (unless it's on one as high already). False when there's none to go to.
function goRoost(c) {
  const { e, s } = c;
  const r = highestFree(c.roosts, usedByOthers(e.id));
  if (!r) return false;
  const on = c.roosts.find((q) => q.id === s.perchId);
  if (on && on.pos.y >= r.pos.y) return false;
  return toPerch(c, r);
}

// Another free Perch, any but the one it's on.
function randomPerch(c) {
  const used = usedByOthers(c.e.id);
  const free = c.roosts.filter((r) => !used.has(r.id) && r.id !== c.s.perchId);
  return free.length ? free[Math.floor(Math.random() * free.length)] : undefined;
}

// Facing across the Perch's bar (it runs east-west unless the Perch was placed facing east or west), the side
// nearer the way it came.
function perchYaw(c, r, heading) {
  let across = false;
  try {
    const dir = String(c.e.dimension.getBlock(r.pos)?.permutation.getState(FACING) ?? "north");
    across = dir === "east" || dir === "west";
  } catch {
    // runs east-west
  }
  const options = across ? [90, -90] : [0, 180];
  const off = (y) => Math.abs(((((y - heading) % 360) + 540) % 360) - 180);
  return off(options[0]) <= off(options[1]) ? options[0] : options[1];
}

function toPerch(c, r) {
  if (!r) return false;
  const { e, s } = c;
  perchUse.set(r.id, e.id);
  const ok = flyTo(c, r.cell, middle(r.cell), (heading) => {
    s.perchId = r.id;
    s.yaw = perchYaw(c, r, heading);
    e.setRotation({ x: 0, y: s.yaw });
  });
  if (!ok) perchUse.delete(r.id);
  return ok;
}

// Down to the feeder (food it eats in it): it lands beside it and mantles over the food.
function toFeeder(c) {
  const { e, s, ex } = c;
  const feeders = (ex.feederIds ?? []).map((id) => db.get("equipment", id)).filter((f) => f && f.units > 0 && SPECIES["zoocraft:owl"].dietTags.includes(RATIONS[f.item]?.diet));
  if (!feeders.length) return false;
  const f = feeders[Math.floor(Math.random() * feeders.length)];
  const spot = feederSpot(c.cells, f.pos, e.location);
  if (!spot) return false;
  return flyTo(c, spot.cell, middle(spot.cell), () => {
    s.ate = c.now;
    s.until = 0;
    startAct({ ...c, now: system.currentTick }, ACT.eat, c.T.eatTicks, spot.yaw);
  });
}

// At dawn on the roost: it coughs up a pellet (what it couldn't digest: fur and bones).
function pellet(c) {
  const { e, s, today, T } = c;
  s.pellet = false;
  s.pelletDay = today;
  startAct(c, ACT.pellet, T.pelletTicks);
  system.runTimeout(() => {
    try {
      if (e.isValid) sound(e, "mob.fox.spit", 0.5, 0.6);
    } catch {
      // gone
    }
  }, Math.round(T.pelletTicks * 0.6));
}

// A hoot: the deep "oo-HU", its mate answering (an owl in the same aviary hoots back soon after).
function hoot(c) {
  const { e, s, now, T } = c;
  s.bout = Math.max(0, s.bout - 1);
  s.hootNext = now + between(T.hootGap);
  startAct(c, ACT.hoot, T.hootTicks);
  const [p1, p2] = hootPitch(c.sex);
  sound(e, "note.flute", T.hootVolume, p1);
  system.runTimeout(() => {
    try {
      if (e.isValid) sound(e, "note.flute", T.hootVolume, p2);
    } catch {
      // gone
    }
  }, 8);
  // Its mate: an owl of the same aviary, or a wild one close by.
  for (const [id, o] of state) {
    if (id === e.id || o.actUntil > now) continue;
    const mate = c.wild ? o.wild && o.at && dist(o.at, e.location) <= 32 : o.exId === c.ex?.id;
    if (!mate) continue;
    o.bout = Math.max(o.bout, 1);
    o.hootNext = Math.min(Math.max(o.hootNext, now), now + between(T.answer));
  }
}

// The threat display at someone in Survival or Adventure right by it: on the ground or a low perch, or in its
// Nest Box (eggs or owlets). It faces them, wings spread, hissing and snapping the bill. True when it displayed.
function threatened(c) {
  const { e, s, now, T } = c;
  const low = s.mode === "nest" || isLow(heightAbove(c.cells, cellOf(e.location)), T);
  if (!low) return false;
  return displayAt(c);
}

function displayAt(c) {
  const { e, s, now, T, players } = c;
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || !vulnerable(p)) continue;
    if (dist(p.location, e.location) > T.displayRange) continue;
    s.displayCool = now + T.displayTicks + T.displayCool;
    s.threat = { id: p.id, until: now + T.displayTicks + 40 };
    startAct(c, ACT.display, T.displayTicks, yawTo(p.location.x - e.location.x, p.location.z - e.location.z));
    sound(e, "mob.cat.hiss", 0.6, 0.6);
    return true;
  }
  return false;
}

// A mother sitting on her eggs: into the Nest Box and there she stays, facing out of the hole.
function incubate(c, box) {
  const { e, s } = c;
  if (s.mode === "nest") {
    setAct(e, ACT.roost);
    return;
  }
  const spot = boxSpot(c, box.pos);
  const ok = flyTo(c, box.pos, spot.pos, () => {
    s.mode = "nest";
    s.yaw = spot.yaw;
    e.setRotation({ x: 0, y: spot.yaw });
  });
  if (!ok) setAct(e, ACT.roost);
}

// A mother's owlets in their first park days (in the Nest Box)?
function nestlings(c) {
  const { a, ex, today, T } = c;
  if (c.sex !== "female") return false;
  return (ex.animalIds ?? []).some((id) => {
    const y = id !== a.id ? getAnimal(id) : undefined;
    return Boolean(y?.juvenile && y.parents?.includes(a.id) && today - (y.bornDay ?? -Infinity) < T.nestDays);
  });
}

// Brooding: in the Nest Box with her owlets by day and at the twilights; at night, a while with them, then down
// to the feeder, and back to them with the food (they beg as she comes in).
function brood(c, box) {
  const { e, s, now, phase, T } = c;
  if (s.mode !== "nest") {
    s.until = now + between(T.watchTicks);
    return incubate(c, box);
  }
  if (phase !== "night") return incubate(c, box);
  if (now < s.until) return setAct(e, ACT.watch);
  s.until = now + between(T.watchTicks);
  if (!toFeeder(c)) setAct(e, ACT.watch);
}

// Where an owl sits in a Nest Box: on its floor facing out of the hole; a grown one in the middle, an owlet
// (side -1 or 1) to one side and a little back, beside its mother.
function boxSpot(c, pos, side = 0) {
  let dir = { x: 0, z: -1 };
  try {
    dir = holeDir(String(c.e.dimension.getBlock(pos)?.permutation.getState(FACING) ?? "north"));
  } catch {
    // facing north
  }
  const off = { x: -dir.z * side * 0.2 - dir.x * Math.abs(side) * 0.1, z: dir.x * side * 0.2 - dir.z * Math.abs(side) * 0.1 };
  return { pos: { x: pos.x + 0.5 + off.x, y: pos.y + 0.06, z: pos.z + 0.5 + off.z }, yaw: yawTo(dir.x, dir.z) };
}

// An owlet its first park days: in the Nest Box, begging (wings shivering, a thin hiss) when a parent is near.
function owletInBox(c, box) {
  const { e, s, now, T } = c;
  const spot = boxSpot(c, box.pos, (Number(String(e.id).slice(-1)) || 0) % 2 ? 1 : -1);
  if (s.mode !== "nest" || dist(e.location, spot.pos) > 0.3) {
    e.teleport(spot.pos, { rotation: { x: 0, y: spot.yaw }, keepVelocity: false });
    s.mode = "nest";
    s.at = spot.pos;
    s.yaw = spot.yaw;
  }
  if (now >= s.displayCool && displayAt(c)) return;
  if (s.actUntil > now) return keepAct(c);
  // Begging at a parent in the box with them, from dusk to dawn (when the food comes).
  if (c.phase !== "day" && parentNear(c) && Math.random() < T.begChance) {
    startAct(c, ACT.beg, [40, 80]);
    sound(e, "mob.cat.hiss", 0.15, 1.9);
    return;
  }
  setAct(e, ACT.nestbox);
}

function parentNear(c) {
  try {
    return entitiesNear(c.e.dimension, c.e.location, 3, ["zoocraft:owl"]).some((o) => o.id !== c.e.id && !animalFromEntity(o)?.juvenile);
  } catch {
    return false;
  }
}

// An owlet out of the box: hopping and fluttering about the floor and the low perches, begging at its parents.
function owletAbout(c) {
  const { e, s, now, T } = c;
  if (now < s.until) {
    if (parentNear(c) && Math.random() < T.begChance * 0.3) return startAct(c, ACT.beg, [40, 80]);
    setAct(e, ACT.none);
    return;
  }
  s.until = now + between(T.owletHop);
  const here = cellOf(e.location);
  const used = usedByOthers(e.id);
  const low = c.roosts.filter((r) => !used.has(r.id) && isLow(heightAbove(c.cells, r.cell), T) && r.cell.y - here.y <= T.lowPerch && dist(r.cell, here) <= T.owletRange);
  if (low.length && Math.random() < 0.5) {
    const r = low[Math.floor(Math.random() * low.length)];
    perchUse.set(r.id, e.id);
    if (flyTo(c, r.cell, middle(r.cell), () => (s.perchId = r.id), T.owletFly)) return;
    perchUse.delete(r.id);
  }
  for (let i = 0; i < 12; i++) {
    const t = { x: here.x + between([-T.owletRange, T.owletRange]), y: here.y + between([-2, 1]), z: here.z + between([-T.owletRange, T.owletRange]) };
    if (c.cells.get(keyOf(t)) !== "land" || keyOf(t) === keyOf(here)) continue;
    if (flyTo(c, t, middle(t), undefined, T.owletFly)) return;
  }
}

// Out of its exhibit, or the aviary not measured since the world loaded: down onto the ground below it, and
// there it stands (to be caught, or until it's measured again).
function settle(c) {
  const { e, s } = c;
  hold(c);
  if (s.settled) return setAct(e, ACT.none);
  s.settled = true;
  const read = reader(e);
  const p = e.location;
  const g = groundAt(read, Math.floor(p.x), Math.floor(p.z), Math.floor(p.y), Math.floor(p.y) - 24);
  if (!g || g.y >= Math.floor(p.y + 0.05)) return setAct(e, ACT.none);
  const route = wildWay((x, y, z) => read(x, y, z) === "air", { ...p }, middle(g), true);
  if (route) begin(c, route, undefined, c.T.wildFly);
}

// ---------------- flights ----------------

// Fly through the aviary's air to the block `goal`, landing at `end`; `then(heading)` once it's there. False
// when there's no way.
function flyTo(c, goal, end, then, fly = c.T.fly) {
  const { e, s } = c;
  if (c.now < (s.retry ?? 0)) return false; // no way the last time it looked: it waits a while
  let from = cellOf(e.location);
  if (!c.open(from.x, from.y, from.z)) {
    // Stood a hair into a block (on a Perch's bar, say): the open block over it or beside it.
    const near = [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]].map(([dx, dy, dz]) => ({ x: from.x + dx, y: from.y + dy, z: from.z + dz })).find((q) => c.open(q.x, q.y, q.z));
    if (!near) return false;
    from = near;
  }
  const way = airWay(c.open, from, goal, c.T.maxNodes);
  if (!way) {
    s.retry = c.now + c.T.retryTicks;
    return false;
  }
  const pts = smoothWay(c.open, way, { ...e.location }, end, BODY);
  begin(c, pts, then, fly);
  return true;
}

function begin(c, pts, then, fly) {
  const { e, s } = c;
  if (s.perchId !== undefined && perchUse.get(s.perchId) === e.id) perchUse.delete(s.perchId); // off its Perch
  s.perchId = undefined;
  s.mode = "fly";
  s.act = ACT.fly;
  s.actUntil = 0;
  const f = flightOf(pts);
  const limit = Math.ceil(f.total / Math.max(0.05, fly.cruise * 0.4)) + 60;
  body(e, s, "fly");
  flights.set(e.id, { e, f, s: 0, t: 0, limit, yaw: e.getRotation().y, fly, then, heading: e.getRotation().y });
}

// Every tick: the owls in flight, along their way.
export function tickOwlMoves() {
  for (const [id, m] of [...flights]) {
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      flights.delete(id);
      continue;
    }
    try {
      fly(id, m);
    } catch (error) {
      tell(error);
      flights.delete(id);
    }
  }
}

function fly(id, m) {
  const e = m.e;
  const p = e.location;
  const v = speedAt(m.s, m.f.total, m.fly);
  // On along the way, unless it has fallen behind (a bump, a slow push): then the way waits for it, so it never
  // cuts across a corner to catch up.
  if (dist(p, along(m.f, m.s)) < 0.35) m.s = Math.min(m.f.total, m.s + v);
  m.t++;
  const q = along(m.f, m.s);
  const end = m.f.pts[m.f.pts.length - 1];
  const left = dist(p, end);
  if ((m.s >= m.f.total && left < 0.15) || m.t > m.limit) return landed(id, m, end);
  const d = { x: q.x - p.x, y: q.y - p.y, z: q.z - p.z };
  const len = Math.hypot(d.x, d.y, d.z);
  const most = Math.max(v * 1.5, 0.08); // it catches up over a few ticks, never in one jump
  if (len > most) {
    d.x *= most / len;
    d.y *= most / len;
    d.z *= most / len;
  }
  if (Math.hypot(q.dx, q.dz) > 0.05) {
    m.heading = yawTo(q.dx, q.dz);
    m.yaw = turnToward(m.yaw, m.heading, 25);
  }
  const seg = Math.hypot(q.dx, q.dy, q.dz);
  setAct(e, wingsAt(m.s, m.f.total, q.dy, seg, m.t, m.fly));
  flyStep(e, d, { x: 0, y: m.yaw }, system.currentTick, tell);
}

// There: stood on its spot, perched (its look goal back on), and whatever comes next.
function landed(id, m, end) {
  const e = m.e;
  flights.delete(id);
  const s = state.get(id);
  e.teleport(end, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
  e.clearVelocity();
  if (!s) return;
  s.mode = "perch";
  s.at = { ...end };
  s.yaw = m.yaw;
  s.act = ACT.none;
  setAct(e, ACT.none);
  body(e, s, "watch");
  if (m.then) m.then(m.heading);
}

// ---------------- the wild ----------------

function reader(e) {
  const read = blockReader(e.dimension, { leaves: true });
  const memo = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let v = memo.get(k);
    if (v === undefined) {
      v = read(x, y, z);
      memo.set(k, v);
    }
    return v;
  };
}

function wildStep(c) {
  const { e, s, now, phase, today, T } = c;
  hold(c);
  c.read = reader(e);
  c.open = (x, y, z) => c.read(x, y, z) === "air";
  if (!s.home) s.home = cellOf(e.location);
  if (s.adrift) {
    s.adrift = false;
    if (toTree(c, "roost")) return;
    return settle(c);
  }
  // Someone with a Meat Ration (in hand, or an empty carrier in hand and one on them): down to land by them.
  const lure = lurer(c);
  if (lure) return baited(c, lure);
  if (s.baited) {
    s.baited = false;
    s.until = 0;
    s.tree = undefined;
  }
  if (wildThreat(c)) return;
  if (s.actUntil > now) return keepAct(c);
  if (s.phase !== phase) {
    s.phase = phase;
    if (phase === "dawn" && s.pelletDay !== today) s.pellet = true;
    if (phase === "dusk") {
      s.bout = between(T.bout);
      s.hootNext = now + between(T.firstHoot);
    }
    if (phase === "night") s.until = now + between(T.watchTicks);
    if (phase === "day" || phase === "dawn") s.tree = undefined; // the roost tree for the day
  }
  if (phase === "day" || phase === "dawn") {
    if (!onTree(c) && toTree(c, "roost")) return;
    if (phase === "dawn" && s.pellet) return pellet(c);
    if (phase === "day" && Math.random() < T.preenChance) return startAct(c, ACT.preen, T.preenTicks);
    setAct(e, someoneNear(c, T.wakeRange) ? ACT.none : ACT.roost);
    return;
  }
  if (phase === "dusk") {
    if (!onTree(c) && toTree(c, "roost")) return;
    if (now >= s.hootNext && s.bout > 0) return hoot(c);
    setAct(e, ACT.none);
    return;
  }
  if (Math.random() < T.nightHootChance) return hoot(c);
  if (now < s.until) {
    setAct(e, ACT.watch);
    return;
  }
  s.until = now + between(T.watchTicks);
  if (Math.random() < T.pounceChance && pounce(c)) return;
  if (toTree(c, "hop")) return;
  setAct(e, ACT.watch);
}

// Is it on its tree (stood on leaves)?
function onTree(c) {
  const p = c.e.location;
  return c.read(Math.floor(p.x), Math.floor(p.y + 0.05) - 1, Math.floor(p.z)) === "leaves";
}

// A treetop to fly to: "roost" the highest near where it lives, "hop" another within reach of it at night,
// "flee" one well away from `away`. False when none it can get to.
function toTree(c, why, away = undefined) {
  const { e, s, T, now } = c;
  if (why !== "flee" && now < (s.retry ?? 0)) return false; // nowhere the last time it looked: it waits a while
  const here = e.location;
  const centre = why === "flee" ? cellOf(here) : s.home;
  const r = T.treeRange;
  const found = [];
  for (let i = 0; i < T.treeSamples; i++) {
    const x = centre.x + between([-r, r]);
    const z = centre.z + between([-r, r]);
    const top = treetopAt(c.read, x, z, centre.y + 16, centre.y - 8);
    if (!top) continue;
    const spot = middle(top);
    if (dist(spot, here) < 3) continue;
    if (away && dist(spot, away) < T.fleeMin) continue;
    found.push(spot);
  }
  if (why === "roost") found.sort((p, q) => q.y - p.y);
  else if (why === "flee") found.sort((p, q) => dist(q, away) - dist(p, away));
  else found.sort(() => Math.random() - 0.5);
  for (const [i, spot] of found.slice(0, 6).entries()) {
    const route = wildWay(c.open, { ...here }, spot, i < 2);
    if (!route) continue;
    begin(c, route, () => (s.tree = spot), T.wildFly);
    return true;
  }
  s.retry = now + T.retryTicks;
  return false;
}

// At night now and then: a swoop down onto the ground (prey), a while there with it, then back up.
function pounce(c) {
  const { e, s, T } = c;
  const here = e.location;
  for (let i = 0; i < 16; i++) {
    const x = Math.floor(here.x) + between([-T.pounceRange, T.pounceRange]);
    const z = Math.floor(here.z) + between([-T.pounceRange, T.pounceRange]);
    const g = groundAt(c.read, x, z, Math.floor(here.y), Math.floor(here.y) - 20);
    if (!g) continue;
    const spot = middle(g);
    const route = wildWay(c.open, { ...here }, spot, i < 2);
    if (!route) continue;
    begin(c, route, (heading) => {
      s.until = 0;
      startAct({ ...c, now: system.currentTick }, ACT.eat, T.pounceTicks, heading);
    }, T.wildFly);
    return true;
  }
  return false;
}

// The nearest player within reach tempting it, or undefined.
function lurer(c) {
  const { e, T } = c;
  const bait = BAIT();
  let best;
  let bestD = T.baitRange;
  for (const p of c.players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const d = dist(p.location, e.location);
    if (d > bestD) continue;
    const held = heldItem(p)?.typeId ?? "";
    const carrier = carrierByItem(held);
    if (!tempts(held, carrier?.full === false, carrier?.full === false && countItem(p, bait) > 0, bait)) continue;
    best = p;
    bestD = d;
  }
  return best;
}

// Tempted: it lands on the ground a couple of blocks from them, facing them, and stays while they tempt it.
function baited(c, p) {
  const { e, s, T, now } = c;
  const at = s.at ?? e.location;
  if (s.baited && dist(at, p.location) <= T.baitLand + 2.5 && Math.abs(at.y - p.location.y) < 2) {
    e.setRotation({ x: 0, y: yawTo(p.location.x - e.location.x, p.location.z - e.location.z) });
    setAct(e, ACT.none);
    return;
  }
  if (now < (s.baitRetry ?? 0)) return; // no way down the last time it looked
  // The spot toward it first, then round the player either way (under trees the way down may be on the far side).
  for (const turn of [0, 45, -45, 90, -90, 135, -135, 180]) {
    const want = besidePlayer(p.location, turned(p.location, e.location, turn), T.baitLand);
    const g = groundAt(c.read, Math.floor(want.x), Math.floor(want.z), Math.floor(p.location.y) + 2, Math.floor(p.location.y) - 3);
    if (!g) continue;
    const route = wildWay(c.open, { ...e.location }, middle(g), turn === 0 || turn === 45);
    if (!route) continue;
    s.baited = true;
    begin(c, route, undefined, T.wildFly);
    return;
  }
  s.baitRetry = now + 40;
}

// `o` swung `deg` degrees round `p` (level).
function turned(p, o, deg) {
  const r = (deg * Math.PI) / 180;
  const dx = o.x - p.x;
  const dz = o.z - p.z;
  return { x: p.x + dx * Math.cos(r) - dz * Math.sin(r), y: o.y, z: p.z + dx * Math.sin(r) + dz * Math.cos(r) };
}

// A flight through open air in the wild from `a` to `b` (feet points): straight, or up over what's in the way, or
// (`deep`, a search costing more: kept to a couple of tries a look) round it through the gaps, straightened.
function wildWay(open, a, b, deep) {
  const quick = wildRoute(open, a, b, WILD_BODY);
  if (quick || !deep) return quick;
  let from = cellOf(a);
  if (!open(from.x, from.y, from.z)) from = { ...from, y: from.y + 1 }; // stood a hair into its leaves
  const cells = seekWay(open, from, cellOf(b), 3000);
  return cells ? smoothWay(open, cells, a, b, WILD_BODY) : undefined;
}

// Someone in Survival or Adventure right up to it: on the ground or low down it displays at them, and if they're
// still there once it's done it flies off to a tree away from them; up in a tree, it just flies off.
function wildThreat(c) {
  const { e, s, now, T, players } = c;
  const here = e.location;
  const p = players.find((q) => q.dimension.id === e.dimension.id && vulnerable(q) && dist(q.location, here) <= T.flushRange);
  if (!p) return false;
  if (s.actUntil > now && s.act === ACT.display) {
    keepAct(c);
    return true;
  }
  const feet = Math.floor(here.y + 0.05);
  const onLeaves = c.read(Math.floor(here.x), feet - 1, Math.floor(here.z)) === "leaves";
  const g = onLeaves ? groundAt(c.read, Math.floor(here.x), Math.floor(here.z), feet - 1, feet - 12) : undefined;
  const low = !onLeaves || (g !== undefined && feet - g.y <= T.lowPerch);
  if (!low) return toTree(c, "flee", p.location);
  // Displayed at them already, and they're still here: off it goes.
  if (s.threat?.id === p.id && now <= s.threat.until + 60) {
    s.threat = undefined;
    return toTree(c, "flee", p.location);
  }
  if (dist(p.location, here) <= T.displayRange && now >= s.displayCool) return displayAt(c);
  return false;
}
