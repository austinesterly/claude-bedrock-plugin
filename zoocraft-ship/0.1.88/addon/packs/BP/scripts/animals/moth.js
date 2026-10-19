import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem, countItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { parkTime } from "../park/park.js";
import { dayOf } from "../core/clock.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { isNocturnalHouse } from "./nightRules.js";
import { flyStep, forgetStep } from "./mover.js";
import { yawTo, turnToward } from "./zebraRules.js";
import { reportError } from "../core/log.js";
import { airWay, seekWay, smoothWay, flightOf, along, speedAt, wildRoute, groundAt } from "./owlRules.js";
import { ACT, MOTH_TYPES, WILD_MOTH, BODY, phaseOf, lightKind, isSoulLight, orbitFor, orbitAt, orbitAct, orbitYaw, orbitDir, joinAngle, orbitPace, onCircle, angleOf, stallLift, invertDrop, fits, restSpots, restPos, spotKey, pickRest, sipSpots, besideHand, nightChoice, pupaNow, pickPlant } from "./mothRules.js";

// Soul Moths (0.1.88, the Nether pair's first; spec 5.3 "soul_moth | Pale blue moth | Gathers around soul light |
// Enclosed airspace, soul lights, nectar"; the rules are in animals/mothRules.js). Every half second, for the moths
// near players, each does what the time of day asks of a hawk moth: by day it rests up a wall (high, near a soul light
// first), head up and wings swept back; at dusk it flies out to the Nectar Feeder and hovers there sipping, proboscis
// out; through the night it circles the soul lights, banked with its back to the light (now and then climbing under a
// hanging light until it stalls, or flipping over above one on the floor and dropping), sips again, and flits about
// the house; at dawn it goes back to a wall. A moth house (dark: no daylight, nothing brighter than soul light) turns
// that round. Someone in Survival or Adventure right up to a resting moth gets the startle display: it lifts its
// forewings to flash the eyespots, rocks, and flies to another wall. Caterpillars crawl the floor from host plant to
// host plant and munch them; on their last days they burrow into the floor and lie there as a pupa; the moth that
// comes out pumps its wings out on the floor before it flies.
// Flights are steered here a tick at a time (tickMothMoves) through the house's measured air (the flight measure:
// the owl's search and straightening), the circles round a light too; the push a tick is animals/mover.js flyStep's.
// The entity has no gravity and no moving of its own (gen/moth.py). In the wild a moth rests on a wall near where it
// was found, circles the soul fire near there at night, and flies over to hover and sip from a Nectar Ration someone
// holds (where it can be crated once the Field Journal's tasks are done). All it does goes to the client through the
// zoocraft:act property.

const RANGE = 48; // blocks from a player
const ACT_PROP = "zoocraft:act";
const BAIT = () => SPECIES["zoocraft:soul_moth"]?.baitItem;

const state = new Map(); // entity id -> { mode, at, yaw, act, actUntil, phase, restKey, ... }
const moves = new Map(); // entity id -> a flight, a circle round a light, or a crawl, steered a tick at a time
const restUse = new Map(); // rest spot key -> entity id
const sipUse = new Map(); // feeder side key -> entity id
const plantUse = new Map(); // host plant block key -> entity id (a caterpillar at it)
const baitUse = new Map(); // player id -> the wild moth their Nectar Ration has drawn over (one at a time)
const restCache = new Map(); // exhibit id -> { cells, spots }: the wall spots of its last measure
const wildLights = new Map(); // a wild home's area key -> { lights, done }: the soul lights round it
const emerged = new Set(); // "animal id,park day": a new moth that has pumped its wings out today
const reported = new Set(); // errors already in the content log (one line each)

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}
const keyOf = (c) => `${c.x},${c.y},${c.z}`;
const cellOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y + 0.05), z: Math.floor(p.z) });
const middle = (c, lift = 0.3) => ({ x: c.x + 0.5, y: c.y + lift, z: c.z + 0.5 });
function dist(p, q) {
  return Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);
}

function tell(error) {
  const k = String(error);
  if (reported.has(k) || reported.size > 20) return;
  reported.add(k);
  reportError("moth", error);
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

function release(id) {
  for (const m of [restUse, sipUse, plantUse, baitUse]) for (const [k, v] of m) if (v === id) m.delete(k);
}

function forget(id) {
  release(id);
  state.delete(id);
  moves.delete(id);
  forgetStep(id);
}

// ---------------- the half-second tick ----------------
export function tickMoths(now) {
  const T = BALANCE.moth;
  const players = onlinePlayers();
  let time = 6000;
  try {
    time = world.getTimeOfDay();
  } catch {
    // keeps noon
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
      list = entitiesNear(player.dimension, player.location, RANGE, MOTH_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, time, today, T);
      } catch (error) {
        tell(error);
        forget(e.id);
      }
    }
  }
  // Out of everyone's range: forgotten (met again later), but one in the air finishes its flight first.
  for (const id of [...state.keys()]) if (!seen.has(id) && !moves.has(id)) forget(id);
}

function step(e, now, players, time, today, T) {
  let s = state.get(e.id);
  if (!s) {
    // Met (again): held where it is until it decides otherwise.
    s = { mode: "hold", at: { ...e.location }, yaw: e.getRotation().y, act: ACT.none, actUntil: 0, phase: undefined, next: 0, sipped: -Infinity, retry: 0, met: now };
    state.set(e.id, s);
    setAct(e, ACT.none);
  }
  if (moves.has(e.id)) return;
  const a = animalFromEntity(e);
  const wild = e.typeId === WILD_MOTH;
  const c = { e, s, a, now, players, today, T, wild };
  if (wild) {
    c.phase = phaseOf(time, T);
    return wildStep(c);
  }
  if (!a) return hold(c);
  const ex = a.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  const cells = ex ? cellsOf(ex.id) : undefined;
  // Out of its house, or the house not measured since the world loaded: down to the ground and settle there.
  if (!ex || !cells) return settle(c);
  s.settled = false;
  c.ex = ex;
  c.cells = cells;
  c.open = (x, y, z) => cells.has(`${x},${y},${z}`);
  c.phase = phaseOf(time, T, isNocturnalHouse(ex, BALANCE));
  zooStep(c);
}

// Held where it is: no gravity and no moving of its own, so only a push from someone moves it, and it goes back.
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

// While it sips, flashes, munches or pumps its wings: as it was, with the sounds that go with it.
function keepAct(c) {
  const { e, s, now } = c;
  e.setRotation({ x: 0, y: s.yaw ?? 0 });
  setAct(e, s.act);
  if (s.act === ACT.sip) {
    if (now % 40 < 10) sound(e, "mob.bee.loop", 0.15, 0.6); // the hover hum
    if (Math.random() < 0.08) sound(e, "random.drink_honey", 0.2, 1.6);
  }
  if (s.act === ACT.munch && Math.random() < 0.3) sound(e, "mob.armadillo.eat", 0.2, 1.7);
}

// ---------------- in the moth house ----------------
function zooStep(c) {
  const { e, s, a, ex, now, phase, today, T } = c;
  hold(c);
  c.lights = ex.soul?.lights ?? [];
  c.feeders = (ex.feederIds ?? []).map((id) => db.get("equipment", id)).filter((f) => f && f.nectar && f.units > 0 && RATIONS[f.item]?.diet === "nectar");
  if (a.juvenile) return youngStep(c);
  // A new moth out of its pupa (it grew up today): on the floor it pumps its crumpled wings out, then flies.
  if (a.emergedDay === today && !emerged.has(`${a.id},${today}`)) {
    if (emerged.size > 200) emerged.clear();
    emerged.add(`${a.id},${today}`);
    toFloor(c);
    startAct(c, ACT.emerge, T.emergeTicks);
    sound(e, "block.sniffer_egg.crack", 0.3, 1.8);
    return;
  }
  if (s.actUntil > now) return keepAct(c);
  if (s.act === ACT.flash) {
    // Done flashing: off to another wall, or (none away from them) off across the house all the same, never flashing
    // over and over at someone stood there.
    s.act = ACT.none;
    if (toRest(c, true) || flit(c)) return;
  }
  if (s.mode === "rest" && startled(c)) return;
  if (s.phase !== phase) {
    s.phase = phase;
    s.next = 0;
    if (phase === "dusk") s.sipped = -Infinity; // out to the feeder first
  }
  if (phase === "day" || phase === "dawn") {
    if (s.mode === "rest") return setAct(e, ACT.rest);
    if (now < s.retry) return setAct(e, s.mode === "floor" ? ACT.none : ACT.fly);
    if (toRest(c)) return;
    s.retry = now + T.retryTicks;
    return;
  }
  // Dusk and night: by turns, sipping, circling a soul light, flitting about.
  if (now < s.next) return setAct(e, s.mode === "rest" ? ACT.rest : s.mode === "floor" ? ACT.none : ACT.fly);
  const choice = nightChoice({ dusk: phase === "dusk", nectar: c.feeders.length > 0, sippedAgo: now - s.sipped, light: c.lights.length > 0 }, T);
  if (choice === "sip" && toSip(c)) return;
  if (choice !== "flit" && c.lights.length && toLight(c)) return;
  if (flit(c)) return;
  s.next = now + between(T.hoverTicks);
}

// Someone in Survival or Adventure right up to it at rest: the startle display (the eyespots flashed), then away.
function startled(c) {
  const { e, s, T, players } = c;
  const p = players.find((q) => q.dimension.id === e.dimension.id && vulnerable(q) && dist(q.location, e.location) <= T.flashRange);
  if (!p) return false;
  startAct(c, ACT.flash, T.flashTicks);
  s.fleeFrom = { ...p.location };
  sound(e, "mob.bat.takeoff", 0.35, 1.4);
  return true;
}

// The wall spots of the house (worked out once a measure, kept while the measure stands).
function spotsOf(c) {
  const { ex, cells } = c;
  const kept = restCache.get(ex.id);
  if (kept && kept.cells === cells) return kept.spots;
  const read = blockReader(c.e.dimension, { gecko: true });
  const wallAt = (x, y, z) => {
    const k = read(x, y, z);
    return k === "solid";
  };
  const spots = restSpots(cells, wallAt, ex.soul?.lights ?? [], c.T);
  restCache.set(ex.id, { cells, spots });
  return spots;
}

function usedByOthers(map, id) {
  const used = new Set();
  for (const [k, owner] of map) if (owner !== id) used.add(k);
  return used;
}

// To a wall to rest: one of the best free spots (`away`: not the one it's on, and well away from whoever startled it).
function toRest(c, away = false) {
  const { e, s, T } = c;
  let spots = spotsOf(c);
  if (away) spots = spots.filter((p) => spotKey(p) !== s.restKey && (!s.fleeFrom || dist(middle(p.cell), s.fleeFrom) >= T.fleeMin));
  const spot = pickRest(spots, usedByOthers(restUse, e.id));
  if (!spot) return false;
  const at = restPos(spot);
  const k = spotKey(spot);
  restUse.set(k, e.id);
  const ok = flyTo(c, spot.cell, at, () => {
    s.mode = "rest";
    s.restKey = k;
    s.yaw = at.yaw;
    e.setRotation({ x: 0, y: at.yaw });
    setAct(e, ACT.rest);
  });
  if (!ok) restUse.delete(k);
  return ok;
}

// Over to a Nectar Feeder: it hovers at the dish, wings a blur, and sips.
function toSip(c) {
  const { e, s, T } = c;
  const used = usedByOthers(sipUse, e.id);
  const options = [];
  for (const f of c.feeders) for (const o of sipSpots(c.open, f.pos, e.location, used)) options.push(o);
  options.sort((p, q) => dist(p.at, e.location) - dist(q.at, e.location));
  for (const o of options.slice(0, 3)) {
    const ok = flyTo(c, cellOf(o.at), o.at, () => {
      s.sipped = system.currentTick;
      s.mode = "sip";
      startAct({ ...c, now: system.currentTick }, ACT.sip, T.sipTicks, o.yaw);
    });
    if (!ok) continue;
    // Held from the take-off (after begin(), which lets go of whatever side it held before) until it next flies.
    sipUse.set(o.side, e.id);
    return true;
  }
  return false;
}

// Out to circle a soul light (the one with others at it as often as an empty one: several share a light).
function toLight(c) {
  const { e, T } = c;
  const lights = [...c.lights].sort(() => Math.random() - 0.5);
  for (const l of lights.slice(0, 4)) {
    const o = orbitFor(c.open, l, T);
    if (!o) continue;
    if (joinOrbit(c, o, flyTo)) return true;
  }
  return false;
}

// Fly to the circle `o` (by `travel`, the house's or the wild's way of flying), then round it.
function joinOrbit(c, o, travel) {
  const { e, s, T } = c;
  const lightKey = keyOf(o.light);
  const a = joinAngle(o, e.location, orbiters(lightKey, e.id).map((m) => m.a));
  const at = orbitAt(o, a);
  return travel(c, cellOf(at), at, () => {
    s.mode = "orbit";
    // The way round the ones circling it now go, chosen once it's there: one that set off for this light after it did
    // may have got there first.
    const dir = orbitDir(orbiters(lightKey, e.id).map((m) => m.dir));
    moves.set(e.id, { kind: "orbit", e, o, a, dir, lightKey, t: 0, until: between(T.orbitTicks), event: undefined, yaw: orbitYaw(a, dir) });
  });
}

// The others going round the light `lightKey`.
function orbiters(lightKey, id) {
  const out = [];
  for (const m of moves.values()) if (m.kind === "orbit" && m.lightKey === lightKey && m.e.id !== id) out.push(m);
  return out;
}

// A flit across the house: to an open block a few blocks off, where it hovers a moment.
function flit(c) {
  const { e, s, T } = c;
  const here = cellOf(e.location);
  const taken = othersCells(e.id);
  for (let i = 0; i < 12; i++) {
    const t = { x: here.x + between([-T.flitRange, T.flitRange]), y: here.y + between([-2, 2]), z: here.z + between([-T.flitRange, T.flitRange]) };
    if (!c.open(t.x, t.y, t.z) || dist(t, here) < 2 || taken.has(keyOf(t))) continue;
    const at = middle(t, 0.35);
    if (flyTo(c, t, at, () => {
      s.mode = "hover";
      s.next = system.currentTick + between(T.hoverTicks);
    })) return true;
  }
  return false;
}

// The blocks the other moths are still in, or flying to: a flit never ends in one, on top of another.
function othersCells(id) {
  const out = new Set();
  for (const [k, s] of state) if (k !== id && s.at && !moves.has(k)) out.add(keyOf(cellOf(s.at)));
  for (const [k, m] of moves) if (k !== id && m.kind === "fly") out.add(keyOf(cellOf(m.f.pts[m.f.pts.length - 1])));
  return out;
}

// Down onto the floor below it, where it stands (just out of its pupa, or not knowing where it is).
function toFloor(c) {
  const { e, s } = c;
  const p = e.location;
  const read = reader(e);
  const g = groundAt(read, Math.floor(p.x), Math.floor(p.z), Math.floor(p.y + 0.05), Math.floor(p.y) - 24);
  const spot = g ? { x: Math.floor(p.x) + 0.5, y: g.y, z: Math.floor(p.z) + 0.5 } : { ...p };
  e.teleport(spot, { rotation: { x: 0, y: s.yaw ?? 0 }, keepVelocity: false });
  s.at = spot;
  s.mode = "floor";
}

// ---------------- the young: caterpillars and pupae ----------------
function youngStep(c) {
  const { e, s, a, ex, now, T } = c;
  const species = SPECIES[a.speciesId];
  if (pupaNow(a, species)) {
    if (s.mode !== "pupa" && s.act !== ACT.burrow) {
      // Its pupa days: it burrows into the floor where it is, and lies there as a pupa (one just met, there already).
      release(e.id);
      toFloor(c);
      if (now - s.met < 30) {
        s.mode = "pupa";
        s.act = ACT.pupa;
        return setAct(e, ACT.pupa);
      }
      startAct(c, ACT.burrow, T.burrowTicks);
      sound(e, "dig.soul_soil", 0.4, 1.3);
      return;
    }
    if (s.actUntil > now) return keepAct(c);
    s.mode = "pupa";
    s.act = ACT.pupa;
    return setAct(e, ACT.pupa);
  }
  if (s.mode === "floor" || s.mode === "hold") {
    toFloor(c);
    s.mode = "crawl";
  }
  if (s.actUntil > now) return keepAct(c);
  // Along the floor to a host plant (one no other caterpillar is at), and munch it; with none, a little way along.
  for (const [k, v] of plantUse) if (v === e.id) plantUse.delete(k);
  const used = usedByOthers(plantUse, e.id);
  const here = { ...e.location };
  const plant = pickPlant(ex.soul?.plantSpots ?? [], here, used, T.larvaRange);
  if (plant) {
    const k = keyOf(plant);
    plantUse.set(k, e.id);
    if (crawlTo(c, plant, (heading) => startAct({ ...c, now: system.currentTick }, ACT.munch, T.munchTicks, heading))) return;
    plantUse.delete(k);
  }
  const at = cellOf(here);
  for (let i = 0; i < 8; i++) {
    const t = { x: at.x + between([-3, 3]), y: at.y, z: at.z + between([-3, 3]) };
    if (c.cells.get(keyOf(t)) !== "land" || keyOf(t) === keyOf(at)) continue;
    if (crawlTo(c, t, () => startAct({ ...c, now: system.currentTick }, ACT.none, T.larvaRest))) return;
  }
  startAct(c, ACT.none, T.larvaRest);
}

// Crawl along the floor (its "land" blocks) to the block `goal`, round the blocks other caterpillars are on or
// crawling to (never over one munching its plant); `then(heading)` there. False when there's no way.
function crawlTo(c, goal, then) {
  const { e, s, T } = c;
  const from = cellOf(e.location);
  const others = othersCells(e.id);
  others.delete(keyOf(goal));
  others.delete(keyOf(from));
  const floor = (x, y, z) => c.cells.get(`${x},${y},${z}`) === "land" && !others.has(`${x},${y},${z}`);
  if (!floor(from.x, from.y, from.z)) return false;
  const way = airWay(floor, from, goal, 400);
  if (!way || way.length > T.larvaRange * 3) return false;
  const end = { x: goal.x + 0.5, y: goal.y, z: goal.z + 0.5 };
  const pts = smoothWay(floor, way, { ...e.location }, end, { half: 0.12, height: 0.1 }, 0);
  begin(c, pts, then, T.crawl, ACT.crawl);
  s.mode = "crawl";
  return true;
}

// ---------------- out of its house ----------------

// Out of its house, or the house not measured since the world loaded: down to the ground below it, settled there
// (to be caught, or until it's measured again).
function settle(c) {
  const { e, s } = c;
  hold(c);
  if (s.settled) return setAct(e, c.a?.juvenile && s.mode === "pupa" ? ACT.pupa : ACT.none);
  s.settled = true;
  toFloor(c);
  setAct(e, ACT.none);
}

// ---------------- flights ----------------

// Fly through the house's air to the block `goal`, ending at `end`; `then(heading)` once it's there. False when
// there's no way.
function flyTo(c, goal, end, then) {
  const { e, s, T } = c;
  let from = cellOf(e.location);
  if (!c.open(from.x, from.y, from.z)) {
    // A hair into a block (against its wall, say): the open block beside it, over it or under it.
    const near = [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, -1, 0]].map(([dx, dy, dz]) => ({ x: from.x + dx, y: from.y + dy, z: from.z + dz })).find((q) => c.open(q.x, q.y, q.z));
    if (!near) return false;
    from = near;
  }
  const way = airWay(c.open, from, goal, T.maxNodes);
  if (!way) return false;
  const pts = smoothWay(c.open, way, { ...e.location }, end, BODY, 0.3);
  begin(c, pts, then, T.fly, ACT.fly);
  return true;
}

function begin(c, pts, then, fly, act) {
  const { e, s } = c;
  if (s.restKey !== undefined && restUse.get(s.restKey) === e.id) restUse.delete(s.restKey); // off its wall
  s.restKey = undefined;
  for (const [k, v] of sipUse) if (v === e.id) sipUse.delete(k);
  s.mode = "fly";
  s.act = act;
  s.actUntil = 0;
  const f = flightOf(pts);
  const limit = Math.ceil(f.total / Math.max(0.01, fly.cruise * 0.4)) + 60;
  if (act === ACT.fly && f.total > 1) sound(e, "mob.parrot.fly", 0.25, 1.7);
  moves.set(e.id, { kind: "fly", e, f, s: 0, t: 0, limit, yaw: e.getRotation().y, fly, then, act, heading: e.getRotation().y });
}

// Every tick: the moths in flight, round their lights and crawling, along their way.
export function tickMothMoves() {
  for (const [id, m] of [...moves]) {
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moves.delete(id);
      continue;
    }
    try {
      if (m.kind === "orbit") circle(id, m);
      else fly(id, m);
    } catch (error) {
      tell(error);
      moves.delete(id);
    }
  }
}

// Push toward `q` from where it is, catching up over a few ticks, never in one jump.
function pushTo(e, q, v, yaw) {
  const p = e.location;
  const d = { x: q.x - p.x, y: q.y - p.y, z: q.z - p.z };
  const len = Math.hypot(d.x, d.y, d.z);
  const most = Math.max(v * 1.5, 0.05);
  if (len > most) {
    d.x *= most / len;
    d.y *= most / len;
    d.z *= most / len;
  }
  flyStep(e, d, { x: 0, y: yaw }, system.currentTick, tell);
}

function fly(id, m) {
  const e = m.e;
  const p = e.location;
  const v = speedAt(m.s, m.f.total, m.fly);
  // On along the way, unless it has fallen behind: then the way waits for it, so it never cuts a corner to catch up.
  if (dist(p, along(m.f, m.s)) < 0.3) m.s = Math.min(m.f.total, m.s + v);
  m.t++;
  const q = along(m.f, m.s);
  const end = m.f.pts[m.f.pts.length - 1];
  if ((m.s >= m.f.total && dist(p, end) < 0.12) || m.t > m.limit) return arrived(id, m, end);
  if (Math.hypot(q.dx, q.dz) > 0.02) {
    m.heading = yawTo(q.dx, q.dz);
    m.yaw = turnToward(m.yaw, m.heading, m.act === ACT.crawl ? 12 : 30);
  }
  setAct(e, m.act);
  pushTo(e, q, v, m.yaw);
}

// There: held on its spot, and whatever comes next.
function arrived(id, m, end) {
  const e = m.e;
  moves.delete(id);
  const s = state.get(id);
  e.teleport(end, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
  e.clearVelocity();
  if (!s) return;
  s.mode = "hold";
  s.at = { ...end };
  s.yaw = m.yaw;
  s.act = ACT.none;
  setAct(e, m.act === ACT.crawl ? ACT.none : ACT.fly);
  if (m.then) m.then(m.heading);
}

// Round a soul light: along the circle at the orbit speed, banked with its back to the light, now and then a stall
// (climbing under a light above it) or an inversion (flipping over above one below it); off again when its time is up.
function circle(id, m) {
  const T = BALANCE.moth;
  const e = m.e;
  m.t++;
  if (!m.event && m.t % 20 === 0) {
    if (m.o.stall && Math.random() < T.stallChance) m.event = { act: ACT.stall, from: m.t, len: T.stallTicks };
    else if (m.o.invert && Math.random() < T.invertChance) m.event = { act: ACT.invert, from: m.t, len: T.invertTicks };
  }
  let dy = 0;
  let speed = T.orbitSpeed;
  if (m.event) {
    const f = (m.t - m.event.from) / m.event.len;
    dy = m.event.act === ACT.stall ? stallLift(f, T) : invertDrop(f, T);
    speed *= m.event.act === ACT.stall ? 0.4 : 0.7; // slowing as it climbs and stalls; tumbling
    if (f >= 1) m.event = undefined;
  }
  // Its place on the circle kept behind the one ahead, going round or hovering on it (one that has just broken away).
  const ahead = orbiters(m.lightKey, e.id).map((n) => n.a);
  for (const [k, o] of state) if (k !== id && o.at && !moves.has(k) && onCircle(m.o, o.at)) ahead.push(angleOf(m.o, o.at));
  speed = orbitPace(m.a, m.dir, m.o.r, ahead, speed, T.orbitGap);
  m.a += (m.dir * speed) / m.o.r;
  const q = orbitAt(m.o, m.a, dy);
  m.yaw = orbitYaw(m.a, m.dir);
  setAct(e, m.event?.act ?? orbitAct(m.dir));
  pushTo(e, q, speed, m.yaw);
  if (m.t < m.until || m.event) return;
  // Done circling: it breaks away and hovers a moment, then chooses again (stopped there: hold() would pull it back
  // from wherever the last push carried it).
  moves.delete(id);
  e.clearVelocity();
  const s = state.get(id);
  if (!s) return;
  s.mode = "hover";
  s.at = { ...e.location };
  s.yaw = m.yaw;
  s.act = ACT.none;
  s.next = system.currentTick + between(T.hoverTicks);
  setAct(e, ACT.fly);
}

// ---------------- the wild ----------------

function reader(e) {
  const read = blockReader(e.dimension, { gecko: true });
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
  const { e, s, now, phase, T } = c;
  hold(c);
  c.read = reader(e);
  c.open = (x, y, z) => c.read(x, y, z) === "air";
  if (!s.home) s.home = cellOf(e.location);
  // Someone with a Nectar Ration (in hand, or an empty carrier in hand and one on them): over to hover and sip from it.
  const lure = lurer(c);
  if (lure) return baited(c, lure);
  if (s.baited) {
    s.baited = false;
    s.next = 0;
    s.act = ACT.none;
    for (const [k, v] of baitUse) if (v === e.id) baitUse.delete(k);
  }
  if (s.actUntil > now) return keepAct(c);
  if (s.act === ACT.flash) {
    s.act = ACT.none;
    if (wildRest(c, true) || wildFlit(c)) return;
  }
  if (s.mode === "rest" && startled(c)) return;
  if (s.phase !== phase) {
    s.phase = phase;
    s.next = 0;
  }
  if (phase === "day" || phase === "dawn") {
    if (s.mode === "rest") return setAct(e, ACT.rest);
    if (now < s.retry) return setAct(e, ACT.fly);
    if (wildRest(c)) return;
    s.retry = now + T.retryTicks;
    return;
  }
  if (now < s.next) return setAct(e, s.mode === "rest" ? ACT.rest : ACT.fly);
  const lights = lightsNearHome(c);
  if (lights.length && Math.random() < T.orbitChance) {
    for (const l of [...lights].sort(() => Math.random() - 0.5).slice(0, 3)) {
      const o = orbitFor(c.open, l, T);
      if (o && joinOrbit(c, o, wildTo)) return;
    }
  }
  if (wildFlit(c)) return;
  s.next = now + between(T.hoverTicks);
}

// The soul lights round a wild moth's home (soul fire on the soul soil, a lantern, a campfire, a torch), looked for once
// in a job a slice at a time and kept for all the moths living about there.
function lightsNearHome(c) {
  const { e, s, T } = c;
  const W = T.wildScan;
  const k = `${e.dimension.id},${Math.floor(s.home.x / 8)},${Math.floor(s.home.z / 8)}`;
  const kept = wildLights.get(k);
  if (kept) return kept.lights;
  if (wildLights.size > 64) wildLights.clear();
  const rec = { lights: [], done: false };
  wildLights.set(k, rec);
  const d = e.dimension;
  const h = { ...s.home };
  system.runJob(
    (function* () {
      let n = 0;
      for (let x = h.x - W.r; x <= h.x + W.r; x++) {
        for (let z = h.z - W.r; z <= h.z + W.r; z++) {
          for (let y = h.y - W.down; y <= h.y + W.up; y++) {
            try {
              const b = d.getBlock({ x, y, z });
              if (b && isSoulLight(b.typeId)) {
                const kind = lightKind(b.typeId, b.permutation.getAllStates());
                if (kind && rec.lights.length < 12) rec.lights.push({ x, y, z, kind });
              }
            } catch {
              // unloaded: left out
            }
            if (++n % W.perTick === 0) yield;
          }
        }
      }
      rec.done = true;
    })(),
  );
  return rec.lights;
}

// A wall spot near home for the day: an open block beside a solid one (basalt, the valley wall), 2 or more over the
// ground, high first; `away` from whoever startled it.
function wildRest(c, away = false) {
  const { e, s, T } = c;
  const centre = away ? cellOf(e.location) : s.home;
  const used = usedByOthers(restUse, e.id);
  const found = [];
  for (let i = 0; i < T.wildSamples; i++) {
    const x = centre.x + between([-T.wildRange, T.wildRange]);
    const z = centre.z + between([-T.wildRange, T.wildRange]);
    // The ground looked for well below it: from a spot up a wall (up to 6 over the ground) it's 7 down.
    const g = groundAt(c.read, x, z, centre.y + 10, centre.y - 12);
    if (!g) continue;
    const y = g.y + between([2, 6]);
    if (!c.open(x, y, z)) continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (c.read(x + dx, y, z + dz) !== "solid") continue;
      const spot = { cell: { x, y, z }, dir: { x: dx, z: dz }, score: y - g.y };
      if (used.has(spotKey(spot))) continue;
      if (away && s.fleeFrom && dist(middle(spot.cell), s.fleeFrom) < T.fleeMin) continue;
      found.push(spot);
      break;
    }
  }
  found.sort((p, q) => q.score - p.score);
  for (const [i, spot] of found.slice(0, 5).entries()) {
    const at = restPos(spot);
    const route = wildWay(c.open, { ...e.location }, at, i < 2);
    if (!route) continue;
    const k = spotKey(spot);
    begin(c, route, () => {
      s.mode = "rest";
      s.restKey = k;
      s.yaw = at.yaw;
      e.setRotation({ x: 0, y: at.yaw });
      setAct(e, ACT.rest);
    }, T.wildFly, ACT.fly);
    restUse.set(k, e.id); // its own from the take-off (begin() has let go of the one it was on)
    return true;
  }
  return false;
}

// A flit about its home at night.
function wildFlit(c) {
  const { e, s, T } = c;
  const here = cellOf(e.location);
  for (let i = 0; i < 10; i++) {
    let t = { x: here.x + between([-T.flitRange, T.flitRange]), y: here.y + between([-2, 2]), z: here.z + between([-T.flitRange, T.flitRange]) };
    if (dist(t, s.home) > T.wildRange) t = { x: s.home.x + between([-3, 3]), y: s.home.y + between([1, 3]), z: s.home.z + between([-3, 3]) };
    if (!c.open(t.x, t.y, t.z) || !c.open(t.x, t.y + 1, t.z)) continue;
    const at = middle(t, 0.35);
    if (wildTo(c, t, at, () => {
      s.mode = "hover";
      s.next = system.currentTick + between(T.hoverTicks);
    })) return true;
  }
  return false;
}

// Through open air in the wild to `end` (the block `goal`), `then` once there.
function wildTo(c, goal, end, then) {
  const route = wildWay(c.open, { ...c.e.location }, end, true);
  if (!route) return false;
  begin(c, route, then, c.T.wildFly, ACT.fly);
  return true;
}

// A flight through open air in the wild from `a` to `b`: straight, or up over what's in the way, or (`deep`) round
// it through the gaps, straightened.
function wildWay(open, a, b, deep) {
  const quick = wildRoute(open, a, b, BODY, [1, 2, 4]);
  if (quick || !deep) return quick;
  let from = cellOf(a);
  if (!open(from.x, from.y, from.z)) from = { ...from, y: from.y + 1 };
  const cells = seekWay(open, from, cellOf(b), 2000, 4, 6);
  return cells ? smoothWay(open, cells, a, b, BODY, 0.3) : undefined;
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
    if (!(held === bait || (carrier?.full === false && countItem(p, bait) > 0))) continue;
    const drawn = baitUse.get(p.id);
    if (drawn !== undefined && drawn !== e.id) continue; // another is at their hands: one at a time
    best = p;
    bestD = d;
  }
  return best;
}

// Tempted: it flies over to hover in front of them, at their hands, sipping from the ration; it stays while they hold
// it, and follows when they move.
function baited(c, p) {
  const { e, s, T, now } = c;
  for (const [k, v] of baitUse) if (v === e.id && k !== p.id) baitUse.delete(k);
  baitUse.set(p.id, e.id);
  const want = besideHand(p.location, e.location, T.baitGap);
  const face = yawTo(p.location.x - want.x, p.location.z - want.z);
  const off = dist(e.location, want);
  if (s.baited && off <= 0.3) {
    s.mode = "sip";
    s.act = ACT.sip;
    s.actUntil = 0;
    s.yaw = face;
    e.setRotation({ x: 0, y: face });
    setAct(e, ACT.sip);
    if (now % 40 < 10) sound(e, "mob.bee.loop", 0.15, 0.6);
    if (Math.random() < 0.15) sound(e, "random.drink_honey", 0.2, 1.6);
    return;
  }
  if (now < (s.baitRetry ?? 0)) return;
  if (!fits(c.open, want)) {
    s.baitRetry = now + 40;
    return;
  }
  const route = wildWay(c.open, { ...e.location }, want, !s.baited || off > 2);
  if (!route) {
    s.baitRetry = now + 40;
    return;
  }
  s.baited = true;
  begin(c, route, () => {
    s.yaw = face;
    e.setRotation({ x: 0, y: face });
  }, T.wildFly, ACT.fly);
}
