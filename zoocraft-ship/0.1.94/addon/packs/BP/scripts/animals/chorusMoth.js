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
import { phaseOf, fits, spotKey, pickRest, handSpots, pupaNow } from "./mothRules.js";
import { ACT, CHORUS_MOTH_TYPES, WILD_CHORUS_MOTH, BODY, isChorusFlower, hoverSpots, flowerKey, pickFlower, remember, awake, flyingChoice, restPos, wallSpots, dishSpots, startles, overGround, pickHost, munchPos } from "./chorusMothRules.js";

// Chorus Moths (0.1.94, the End pair's first; spec 5.4 "Purple angular wings | Hovers around chorus flowers | Flight
// space, chorus nectar, low light"; the rules are in animals/chorusMothRules.js). Every half second, for the moths near
// players, each keeps to its bouts, as an elephant hawk-moth does at dusk: a few minutes out, working its way round the
// chorus flowers (the nearest it hasn't just left first, one moth to a flower), hovering a little way off each with its
// proboscis in the flower and its wings a blur, now and then over to the Nectar Feeder to sip, flitting across the
// house between; then a rest up a wall, head up, wings folded into an arrowhead. Before every flight from rest it
// shivers its wings warm. In a dim house (no daylight, nothing brighter than the Nocturnal Lamps) it keeps its bouts at
// any hour; in a bright one it is out only at dusk and through the night. Someone in Survival or Adventure walking
// right up to one at rest (not sneaking) gets a quick shiver, and it flies off to another wall. Caterpillars crawl the
// floor to the foot of a chorus plant and munch it, and rear to show their eyespots when someone comes close; on their
// last days they burrow into the floor and lie there as a pupa; the moth that comes out pumps its wings out on the
// floor before it flies.
// Flights are steered here a tick at a time (tickChorusMothMoves) through the house's measured air (the flight
// measure: the owl's search and straightening); the push a tick is animals/mover.js flyStep's. The entity has no
// gravity and no moving of its own (gen/chorusmoth.py). In the wild it keeps the same bouts round where it was met,
// hovering at the chorus flowers found round there, resting on an end stone face (never a chorus stalk: too thin), and
// never flying out over the void; it flies over to sip from a Nectar Ration someone holds (where it can be crated once
// the Field Journal's tasks are done). With no flowers near (a flat field) it flits about; with no wall near it flies
// further to look for one, and failing that rests on the ground. All it does goes to the client through the
// zoocraft:act property.

const RANGE = 48; // blocks from a player
const ACT_PROP = "zoocraft:act";
const BAIT = () => SPECIES["zoocraft:chorus_moth"]?.baitItem;

const state = new Map(); // entity id -> { mode, at, yaw, act, actUntil, bout, boutUntil, next, recent, ... }
const moves = new Map(); // entity id -> a flight or a crawl, steered a tick at a time
const restUse = new Map(); // rest spot key -> entity id
const flowerUse = new Map(); // chorus flower key -> entity id (a moth at it, or on its way)
const sipUse = new Map(); // feeder side key -> entity id
const plantUse = new Map(); // chorus plant block key -> entity id (a caterpillar at it)
const baitUse = new Map(); // player id -> the wild moth their Nectar Ration has drawn over (one at a time)
const restCache = new Map(); // exhibit id -> { cells, spots }: the wall spots of its last measure
const wildFlowers = new Map(); // a wild home's area key -> { flowers, done, at }: the chorus flowers round it
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
  reportError("chorus moth", error);
}

function vulnerable(p) {
  try {
    const mode = String(p.getGameMode()).toLowerCase();
    return mode === "survival" || mode === "adventure";
  } catch {
    return false;
  }
}

function sneaking(p) {
  try {
    return Boolean(p.isSneaking);
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
  for (const m of [restUse, flowerUse, sipUse, plantUse, baitUse]) for (const [k, v] of m) if (v === id) m.delete(k);
}

function forget(id) {
  release(id);
  state.delete(id);
  moves.delete(id);
  forgetStep(id);
}

// ---------------- the half-second tick ----------------
export function tickChorusMoths(now) {
  const T = BALANCE.chorusMoth;
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
      list = entitiesNear(player.dimension, player.location, RANGE, CHORUS_MOTH_TYPES);
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
  const wild = e.typeId === WILD_CHORUS_MOTH;
  const a = wild ? undefined : animalFromEntity(e);
  let s = state.get(e.id);
  if (!s) {
    // Met (again): one that was at rest up a wall or on the ground is still resting there; any other is out on a
    // bout, held where it is until it decides where to go.
    const was = e.getProperty(ACT_PROP);
    const young = Boolean(a?.juvenile);
    const resting = !young && (was === ACT.rest || was === ACT.none);
    s = { mode: resting ? (was === ACT.rest ? "rest" : "floor") : "hold", at: { ...e.location }, yaw: e.getRotation().y, act: resting ? was : ACT.none, actUntil: 0, bout: resting ? "rest" : "fly", boutUntil: now + between(resting ? T.boutRest : T.boutFly), next: 0, sipped: -Infinity, retry: 0, met: now, recent: [], rearCool: 0, startleCool: 0 };
    state.set(e.id, s);
    setAct(e, s.act);
  }
  const m = moves.get(e.id);
  if (m) {
    // A caterpillar crawling stops to rear at someone come close; anything else in motion carries on.
    if (m.act !== ACT.crawl || now < s.rearCool || !threat(e, players, T.rearRange)) return;
    moves.delete(e.id);
    e.clearVelocity();
    s.at = { ...e.location };
    s.mode = "crawl";
  }
  const c = { e, s, a, now, players, today, T, wild, phase: phaseOf(time, T) };
  if (wild) return wildStep(c);
  if (!a) return hold(c);
  const ex = a.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  const cells = ex ? cellsOf(ex.id) : undefined;
  // Out of its house, or the house not measured since the world loaded: down to the ground and settle there.
  if (!ex || !cells) return settle(c);
  s.settled = false;
  c.ex = ex;
  c.cells = cells;
  c.open = (x, y, z) => cells.has(`${x},${y},${z}`);
  zooStep(c);
}

// Someone in Survival or Adventure, not sneaking, within `range` of it.
function threat(e, players, range) {
  return players.find((q) => q.dimension.id === e.dimension.id && startles({ ...q.location, vulnerable: vulnerable(q), sneaking: sneaking(q) }, e.location, range));
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

// While it hovers, sips, shivers, munches, rears or pumps its wings: as it was, with the sounds that go with it.
function keepAct(c) {
  const { e, s, now } = c;
  e.setRotation({ x: 0, y: s.yaw ?? 0 });
  setAct(e, s.act);
  if (s.act === ACT.hover || s.act === ACT.sip) {
    if (now % 40 < 10) sound(e, "mob.bee.loop", 0.15, 0.6); // the hover hum
    if (Math.random() < 0.08) sound(e, "random.drink_honey", 0.2, 1.6);
  }
  if ((s.act === ACT.warm || s.act === ACT.warm_flat) && now % 40 < 10) sound(e, "mob.bee.loop", 0.2, 1.2); // the shiver's buzz
  if (s.act === ACT.munch && Math.random() < 0.3) sound(e, "mob.armadillo.eat", 0.2, 1.7);
}

// ---------------- its bouts (the house and the wild alike) ----------------

// The act of one at rest: up a wall, or on the floor.
function restAct(s) {
  return s.mode === "rest" ? ACT.rest : ACT.none;
}

// Landed at rest: a rest bout starts (one startled off its wall in the middle of one keeps what was left of it).
function startRest(c) {
  const { s, T } = c;
  const now = system.currentTick;
  if (s.bout !== "rest" || s.boutUntil <= now) {
    s.bout = "rest";
    s.boutUntil = now + between(T.boutRest);
  }
}

// The warm-up before it flies: wings raised and buzzing (on a wall, or flat on the ground), then `after`.
function warmUp(c, ticks, after) {
  const { e, s } = c;
  s.after = after;
  startAct(c, s.mode === "rest" ? ACT.warm : ACT.warm_flat, ticks);
  if (after === "flee") sound(e, "mob.bat.takeoff", 0.35, 1.4);
}

// Someone right up to it at rest: a quick shiver, then off well away from them.
function startled(c) {
  const { e, s, T, now, players } = c;
  if (now < s.startleCool) return false;
  const p = threat(e, players, T.startleRange);
  if (!p) return false;
  s.fleeFrom = { ...p.location };
  s.startleCool = now + T.startleWarm + T.startleGap;
  warmUp(c, T.startleWarm, "flee");
  return true;
}

// Warm: off. Startled, to another rest spot well away from whoever came (or off across the house all the same); else a
// flying bout starts, at a flower first.
function warmedUp(c) {
  const { s, now, T } = c;
  s.act = ACT.none;
  const flee = s.after === "flee";
  s.after = undefined;
  if (flee) {
    if (c.rest(true) || c.flit()) return;
    return setAct(c.e, restAct(s));
  }
  s.bout = "fly";
  s.boutUntil = now + between(T.boutFly);
  s.next = 0;
  if (c.wild) {
    // Out round where it was met again, and a new look for a wall when it next rests.
    s.searches = 0;
    if (s.origin) s.home = { ...s.origin };
  }
  if (c.flower() || c.flit()) return;
  // Nowhere to fly to just now: it stays at rest a while longer.
  s.bout = "rest";
  s.boutUntil = now + T.retryTicks;
  setAct(c.e, restAct(s));
}

function boutStep(c) {
  const { e, s, now, T } = c;
  if (s.actUntil > now) return keepAct(c);
  if (s.act === ACT.warm || s.act === ACT.warm_flat) return warmedUp(c);
  const resting = s.mode === "rest" || s.mode === "floor";
  if (resting && startled(c)) return;
  // At rest: through its rest bout (all day, in a bright house), then the warm-up and off.
  if (resting) {
    if (!c.awake || (s.bout === "rest" && now < s.boutUntil)) return setAct(e, restAct(s));
    return warmUp(c, T.warmTicks, "fly");
  }
  // In the air with a rest due (its flying bout over, or the day come in a bright house): to a wall; with none to get
  // to, down onto the floor (in the wild: a further look for a wall first, then the ground).
  if (!c.awake || s.bout !== "fly" || now >= s.boutUntil) {
    if (now < s.retry) return setAct(e, ACT.fly);
    if (c.rest(false) || c.floorRest()) return;
    s.retry = now + T.retryTicks;
    return setAct(e, ACT.fly);
  }
  // Out: by turns the chorus flowers, the feeder, a flit across; a hover between.
  if (now < s.next) return setAct(e, ACT.fly);
  const choice = flyingChoice({ nectar: c.sips, sippedAgo: now - s.sipped, flower: c.flowers.length > 0 }, T);
  if (choice === "sip" && c.sip()) return;
  if (choice !== "flit" && c.flower()) return;
  if (c.flit()) return;
  s.next = now + between(T.pauseTicks);
  setAct(e, ACT.fly);
}

// To a chorus flower (by `travel`, the house's or the wild's way of flying): hovering in front of it, its proboscis in
// the flower, holding station with a slow sway; then on to the next. One moth to a flower.
function toFlower(c, travel) {
  const { e, s, T, now } = c;
  const used = usedByOthers(flowerUse, e.id);
  // Flowers it found no way to lately are left a while (a wild one up out of reach, say).
  if (!s.skip) s.skip = new Map();
  for (const [k, until] of s.skip) if (until <= now) s.skip.delete(k);
  const from = s.mode === "flower";
  for (let i = 0; i < 3; i++) {
    const f = pickFlower(c.flowers.filter((q) => !s.skip.has(flowerKey(q))), e.location, s.recent, used, from);
    if (!f) return false;
    const k = flowerKey(f);
    s.skip.set(k, now + T.flowerSkip);
    if (!flowerThere(e, f)) continue; // broken since the measure (or the look round home): passed over a while
    const taken = othersCells(e.id); // (a spot in a block another is in, or flying to, passed over)
    for (const o of hoverSpots(c.open, f, e.location).filter((q) => !taken.has(keyOf(cellOf(q.at)))).slice(0, 2)) {
      const ok = travel(c, cellOf(o.at), o.at, () => {
        s.mode = "flower";
        s.recent = remember(s.recent, k, Math.min(T.recentFlowers, c.flowers.length - 1));
        startAct({ ...c, now: system.currentTick }, ACT.hover, T.hoverTicks, o.yaw);
      });
      if (!ok) continue;
      // Its own from the take-off (after begin(), which lets go of the one it was at) until it next flies.
      s.skip.delete(k);
      flowerUse.set(k, e.id);
      return true;
    }
  }
  return false;
}

// Still a chorus flower there.
function flowerThere(e, f) {
  try {
    return isChorusFlower(e.dimension.getBlock(f)?.typeId ?? "");
  } catch {
    return false;
  }
}

// ---------------- in the moth house ----------------
function zooStep(c) {
  const { e, s, a, ex, now, today, T } = c;
  hold(c);
  c.flowers = ex.chorus?.flowers ?? [];
  c.feeders = (ex.feederIds ?? []).map((id) => db.get("equipment", id)).filter((f) => f && f.nectar && f.units > 0 && RATIONS[f.item]?.diet === "nectar");
  if (a.juvenile) return youngStep(c);
  // A new moth out of its pupa (it grew up today): on the floor it pumps its crumpled wings out, then warms up and flies.
  if (a.emergedDay === today && !emerged.has(`${a.id},${today}`)) {
    if (emerged.size > 200) emerged.clear();
    emerged.add(`${a.id},${today}`);
    toFloor(c);
    s.bout = "rest";
    s.boutUntil = now;
    startAct(c, ACT.emerge, T.emergeTicks);
    sound(e, "block.sniffer_egg.crack", 0.3, 1.8);
    return;
  }
  if (s.act === ACT.emerge && s.actUntil <= now) s.act = ACT.none;
  // A dim house (or one not measured for its light yet): out in bouts at any hour; a bright one, only at night.
  c.awake = awake(ex.house ? isNocturnalHouse(ex, BALANCE) : true, c.phase);
  c.sips = c.feeders.length > 0;
  c.rest = (away) => toRest(c, away);
  c.floorRest = () => toFloorRest(c);
  c.flit = () => flit(c);
  c.flower = () => toFlower(c, flyTo);
  c.sip = () => toSip(c);
  boutStep(c);
}

// The wall spots of the house (worked out once a measure, kept while the measure stands): whole blocks only, read as a
// gecko and a snail read them (a slab, a lantern or a chorus stalk is no wall to rest flat on).
function spotsOf(c) {
  const { ex, cells } = c;
  const kept = restCache.get(ex.id);
  if (kept && kept.cells === cells) return kept.spots;
  const read = blockReader(c.e.dimension, { gecko: true, thin: true });
  const spots = wallSpots(cells, (x, y, z) => read(x, y, z) === "solid", c.T);
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
    startRest(c);
  });
  if (!ok) restUse.delete(k);
  return ok;
}

// No wall to get to: down onto the floor under it (or a block beside, clear of the others), wings folded, to rest there.
function toFloorRest(c) {
  const { e, s } = c;
  const here = cellOf(e.location);
  const taken = othersCells(e.id);
  for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let y = here.y; y >= here.y - 12; y--) {
      const kind = c.cells.get(`${here.x + dx},${y},${here.z + dz}`);
      if (kind === undefined) break;
      if (kind !== "land") continue;
      const t = { x: here.x + dx, y, z: here.z + dz };
      if (taken.has(keyOf(t))) break;
      if (flyTo(c, t, { x: t.x + 0.5, y: t.y, z: t.z + 0.5 }, () => {
        s.mode = "floor";
        setAct(e, ACT.none);
        startRest(c);
      })) return true;
      break;
    }
  }
  return false;
}

// Over to a Nectar Feeder: it hovers at the dish, wings a blur, and sips.
function toSip(c) {
  const { e, s, T } = c;
  const used = usedByOthers(sipUse, e.id);
  const options = [];
  for (const f of c.feeders) for (const o of dishSpots(c.open, f.pos, e.location, used)) options.push(o);
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
      s.next = system.currentTick + between(T.pauseTicks);
    })) return true;
  }
  return false;
}

// The blocks the other moths are still in, or flying to: a flit never ends in one, on top of another.
function othersCells(id) {
  const out = new Set();
  for (const [k, s] of state) if (k !== id && s.at && !moves.has(k)) out.add(keyOf(cellOf(s.at)));
  for (const [k, m] of moves) if (k !== id) out.add(keyOf(cellOf(m.f.pts[m.f.pts.length - 1])));
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
      sound(e, "dig.stone", 0.4, 1.3);
      return;
    }
    if (s.actUntil > now) return keepAct(c);
    s.mode = "pupa";
    s.act = ACT.pupa;
    return setAct(e, ACT.pupa);
  }
  if (s.mode === "floor" || s.mode === "hold" || s.mode === "rest") {
    // (one just there from a crawl, at the foot of its plant, stays where it is)
    if (!(s.mode === "hold" && s.at && dist(e.location, s.at) < 0.05)) toFloor(c);
    s.mode = "crawl";
  }
  // Someone right up to it: it pulls its head in and swells its front so the eyespots stare.
  if (s.act !== ACT.rear && now >= s.rearCool && threat(e, c.players, T.rearRange)) {
    s.rearCool = now + T.rearTicks + T.rearGap;
    startAct(c, ACT.rear, T.rearTicks);
    sound(e, "mob.armadillo.peek", 0.3, 1.2);
    return;
  }
  if (s.actUntil > now) return keepAct(c);
  // Along the floor to the foot of a chorus plant (one no other caterpillar is at, and not the one it last munched: it
  // goes from plant to plant), and munch it; with none, a little way along (and then any plant again).
  for (const [k, v] of plantUse) if (v === e.id) plantUse.delete(k);
  const used = usedByOthers(plantUse, e.id);
  if (s.lastPlant !== undefined) used.add(s.lastPlant);
  const here = { ...e.location };
  const taken = othersCells(e.id);
  const host = pickHost((ex.chorus?.plantSpots ?? []).filter(([x, y, z]) => !taken.has(`${x},${y},${z}`)), here, used, T.larvaRange);
  if (host) {
    plantUse.set(host.plant, e.id);
    const at = munchPos(host);
    if (crawlTo(c, host.cell, at, () => startAct({ ...c, now: system.currentTick }, ACT.munch, T.munchTicks, at.yaw))) {
      s.lastPlant = host.plant;
      return;
    }
    plantUse.delete(host.plant);
  }
  s.lastPlant = undefined;
  const from = cellOf(here);
  for (let i = 0; i < 8; i++) {
    const t = { x: from.x + between([-3, 3]), y: from.y, z: from.z + between([-3, 3]) };
    if (c.cells.get(keyOf(t)) !== "land" || keyOf(t) === keyOf(from) || taken.has(keyOf(t))) continue;
    if (crawlTo(c, t, { x: t.x + 0.5, y: t.y, z: t.z + 0.5 }, () => startAct({ ...c, now: system.currentTick }, ACT.none, T.larvaRest))) return;
  }
  startAct(c, ACT.none, T.larvaRest);
}

// Crawl along the floor (its "land" blocks) to the block `goal`, ending at `end`, round the blocks the others are on or
// going to (never over one munching its plant, or into one's block); `then(heading)` there. False when there's no way.
function crawlTo(c, goal, end, then) {
  const { e, s, T } = c;
  const from = cellOf(e.location);
  const others = othersCells(e.id);
  others.delete(keyOf(from));
  const floor = (x, y, z) => c.cells.get(`${x},${y},${z}`) === "land" && !others.has(`${x},${y},${z}`);
  if (!floor(from.x, from.y, from.z)) return false;
  const way = airWay(floor, from, goal, 400);
  if (!way || way.length > T.larvaRange * 3) return false;
  // (on the block already: just the little way across it)
  const pts = way.length === 1 ? [{ ...e.location }, end] : smoothWay(floor, way, { ...e.location }, end, { half: 0.12, height: 0.1 }, 0);
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
  const { e, T } = c;
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
  for (const m of [sipUse, flowerUse]) for (const [k, v] of m) if (v === e.id) m.delete(k);
  s.mode = "fly";
  s.act = act;
  s.actUntil = 0;
  const f = flightOf(pts);
  const limit = Math.ceil(f.total / Math.max(0.01, fly.cruise * 0.4)) + 60;
  if (act === ACT.fly && f.total > 1) sound(e, "mob.parrot.fly", 0.25, 1.7);
  moves.set(e.id, { kind: "fly", e, f, s: 0, t: 0, limit, yaw: e.getRotation().y, fly, then, act, heading: e.getRotation().y });
}

// Every tick: the moths in flight and the caterpillars crawling, along their way.
export function tickChorusMothMoves() {
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
      fly(id, m);
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

// ---------------- the wild ----------------

// The wild's reader, kept for one step: a chorus stalk is "partial" (thin: no wall to rest flat on, and not air to fly
// through), as are slabs and lanterns (gecko).
function reader(e) {
  const read = blockReader(e.dimension, { gecko: true, thin: true });
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
  const { e, s, now, T } = c;
  hold(c);
  c.read = reader(e);
  c.open = (x, y, z) => c.read(x, y, z) === "air";
  if (!s.home) s.home = cellOf(e.location);
  if (!s.origin) s.origin = { ...s.home }; // where it was met: its bouts go round here, so it never drifts off
  // Someone with a Nectar Ration (in hand, or an empty carrier in hand and one on them): over to hover and sip from it.
  const lure = lurer(c);
  if (lure) return baited(c, lure);
  if (s.baited) {
    s.baited = false;
    s.next = 0;
    s.act = ACT.none;
    s.bout = "fly";
    s.boutUntil = now + between(T.boutFly);
    for (const [k, v] of baitUse) if (v === e.id) baitUse.delete(k);
  }
  // The End has no day or night: its bouts go on at any hour, wherever it is.
  c.awake = true;
  c.flowers = flowersNearHome(c);
  c.sips = false;
  c.rest = (away) => wildRest(c, away);
  c.floorRest = () => wildFloorRest(c);
  c.flit = () => wildFlit(c);
  c.flower = () => toFlower(c, wildTo);
  c.sip = () => false;
  boutStep(c);
}

// The chorus flowers round a wild moth's home, looked for in a job a slice at a time and kept for all the moths living
// about there (up the chorus trees too: wildScan.up); looked for again every wildScan.every ticks (chorus grows, and
// flowers get placed or broken), the last look's flowers kept meanwhile.
function flowersNearHome(c) {
  const { e, s, T, now } = c;
  const W = T.wildScan;
  const k = `${e.dimension.id},${Math.floor(s.home.x / 8)},${Math.floor(s.home.z / 8)}`;
  const kept = wildFlowers.get(k);
  if (kept && (!kept.done || now - kept.at < W.every)) return kept.flowers;
  if (wildFlowers.size > 64) wildFlowers.clear();
  const rec = { flowers: kept?.flowers ?? [], done: false, at: now };
  wildFlowers.set(k, rec);
  const d = e.dimension;
  const h = { ...s.home };
  system.runJob(
    (function* () {
      const found = [];
      let n = 0;
      for (let x = h.x - W.r; x <= h.x + W.r; x++) {
        for (let z = h.z - W.r; z <= h.z + W.r; z++) {
          for (let y = h.y - W.down; y <= h.y + W.up; y++) {
            try {
              const b = d.getBlock({ x, y, z });
              if (b && isChorusFlower(b.typeId) && found.length < T.wildFlowerKeep) found.push({ x, y, z });
            } catch {
              // unloaded: left out
            }
            if (++n % W.perTick === 0) yield;
          }
        }
      }
      rec.flowers = found;
      rec.done = true;
    })(),
  );
  return rec.flowers;
}

// A wall spot near home: an open block beside a whole block (an end stone face; never a chorus stalk), 2 or more over
// the ground, high first; `away` from whoever startled it. c.noWall: none at all round there (a flat field).
function wildRest(c, away = false) {
  const { e, s, T } = c;
  const centre = away ? cellOf(e.location) : s.home;
  const used = usedByOthers(restUse, e.id);
  const found = [];
  let walls = 0;
  const consider = (x, y, z, dx, dz, g) => {
    walls++;
    const spot = { cell: { x, y, z }, dir: { x: dx, z: dz }, score: y - g.y };
    if (used.has(spotKey(spot))) return;
    if (away && s.fleeFrom && dist(middle(spot.cell), s.fleeFrom) < T.fleeMin) return;
    found.push(spot);
  };
  for (let i = 0; i < T.wildSamples; i++) {
    const x = centre.x + between([-T.wildRange, T.wildRange]);
    const z = centre.z + between([-T.wildRange, T.wildRange]);
    // The ground looked for well below it: from a spot up a wall (up to 6 over the ground) it's 7 down.
    const g = groundAt(c.read, x, z, centre.y + 10, centre.y - 12);
    if (!g) continue;
    const y = g.y + between([2, 6]);
    if (!c.open(x, y, z)) continue;
    const side = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dz]) => c.read(x + dx, y, z + dz) === "solid");
    if (side) consider(x, y, z, side[0], side[1], g);
  }
  // None found by the samples: every other column round there, every height (a wall the samples missed, or none at
  // all: a flat field).
  if (!found.length && !walls) {
    for (let x = centre.x - T.wildRange; x <= centre.x + T.wildRange; x += 2) {
      for (let z = centre.z - T.wildRange; z <= centre.z + T.wildRange; z += 2) {
        const g = groundAt(c.read, x, z, centre.y + 10, centre.y - 12);
        if (!g) continue;
        for (let y = g.y + 6; y >= g.y + 2; y--) {
          if (!c.open(x, y, z)) continue;
          const side = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dz]) => c.read(x + dx, y, z + dz) === "solid");
          if (!side) continue;
          consider(x, y, z, side[0], side[1], g);
          break;
        }
      }
    }
  }
  c.noWall = walls === 0;
  found.sort((p, q) => q.score - p.score);
  for (const [i, spot] of found.slice(0, 5).entries()) {
    const at = restPos(spot);
    const route = wildWay(c, { ...e.location }, at, i < 2);
    if (!route) continue;
    const k = spotKey(spot);
    begin(c, route, () => {
      s.mode = "rest";
      s.restKey = k;
      s.yaw = at.yaw;
      e.setRotation({ x: 0, y: at.yaw });
      setAct(e, ACT.rest);
      startRest(c);
    }, T.wildFly, ACT.fly);
    restUse.set(k, e.id); // its own from the take-off (begin() has let go of the one it was on)
    return true;
  }
  return false;
}

// No wall to get to near home: with none at all round there, a flight further to look (wildSearches times), then the
// ground. (A wall it couldn't get to just now: it tries again in a while.)
function wildFloorRest(c) {
  const { s, T } = c;
  if (!c.noWall) return false;
  s.searches = (s.searches ?? 0) + 1;
  if (s.searches <= T.wildSearches && wildSearch(c)) return true;
  return wildGround(c);
}

// A flight to searchRange blocks from where it was met, a few over the ground, and home moved there, so the next look
// for a wall is round there.
function wildSearch(c) {
  const { e, s, T } = c;
  const o = s.origin;
  const taken = othersCells(e.id);
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = between(T.searchRange);
    const x = o.x + Math.round(Math.cos(a) * r);
    const z = o.z + Math.round(Math.sin(a) * r);
    const g = groundAt(c.read, x, z, o.y + 8, o.y - 12);
    if (!g) continue;
    const t = { x, y: g.y + between([2, 4]), z };
    if (!c.open(t.x, t.y, t.z) || !c.open(t.x, t.y + 1, t.z) || taken.has(keyOf(t))) continue;
    if (wildTo(c, t, middle(t, 0.35), () => {
      s.mode = "hover";
      s.home = t;
      s.retry = 0;
    })) return true;
  }
  return false;
}

// With no wall to be found: down onto the ground below it (or a block beside, clear of the others), where it rests
// flat, wings folded, through its rest bout.
function wildGround(c) {
  const { e, s } = c;
  const here = cellOf(e.location);
  const taken = othersCells(e.id);
  for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
    const g = groundAt(c.read, here.x + dx, here.z + dz, here.y + 1, here.y - 24);
    if (!g || taken.has(keyOf(g))) continue;
    const end = { x: g.x + 0.5, y: g.y, z: g.z + 0.5 };
    const route = wildWay(c, { ...e.location }, end, true);
    if (!route) continue;
    begin(c, route, () => {
      s.mode = "floor";
      setAct(e, ACT.none);
      startRest(c);
    }, c.T.wildFly, ACT.fly);
    return true;
  }
  return false;
}

// A flit about its home.
function wildFlit(c) {
  const { e, s, T } = c;
  const here = cellOf(e.location);
  const taken = othersCells(e.id); // never to a block another is in, or flying to
  for (let i = 0; i < 10; i++) {
    let t = { x: here.x + between([-T.flitRange, T.flitRange]), y: here.y + between([-2, 2]), z: here.z + between([-T.flitRange, T.flitRange]) };
    if (dist(t, s.home) > T.wildRange) t = { x: s.home.x + between([-3, 3]), y: s.home.y + between([1, 3]), z: s.home.z + between([-3, 3]) };
    if (!c.open(t.x, t.y, t.z) || !c.open(t.x, t.y + 1, t.z) || taken.has(keyOf(t))) continue;
    const at = middle(t, 0.35);
    if (wildTo(c, t, at, () => {
      s.mode = "hover";
      s.next = system.currentTick + between(T.pauseTicks);
    })) return true;
  }
  return false;
}

// Through open air in the wild to `end` (the block `goal`), `then` once there.
function wildTo(c, goal, end, then) {
  const route = wildWay(c, { ...c.e.location }, end, true);
  if (!route) return false;
  begin(c, route, then, c.T.wildFly, ACT.fly);
  return true;
}

// A flight through open air in the wild from `a` to `b`: straight, or up over what's in the way, or (`deep`) round
// it through the gaps, straightened; never one out over the void (ground within voidLook under all of it).
function wildWay(c, a, b, deep) {
  const { open, read, T } = c;
  const safe = (route) => (route && overGround(route, read, T.voidLook) ? route : undefined);
  const quick = safe(wildRoute(open, a, b, BODY, [1, 2, 4]));
  if (quick || !deep) return quick;
  let from = cellOf(a);
  if (!open(from.x, from.y, from.z)) from = { ...from, y: from.y + 1 };
  const cells = seekWay(open, from, cellOf(b), 2000, 4, 6);
  return cells ? safe(smoothWay(open, cells, a, b, BODY, 0.3)) : undefined;
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
  // In front of their hands, toward it (or further round them, a pillar or a wall beside them in the way).
  const want = handSpots(p.location, e.location, T.baitGap).find((q) => fits(c.open, q, BODY));
  if (!want) {
    s.baitRetry = now + 40;
    return;
  }
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
  const route = wildWay(c, { ...e.location }, want, !s.baited || off > 2);
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
