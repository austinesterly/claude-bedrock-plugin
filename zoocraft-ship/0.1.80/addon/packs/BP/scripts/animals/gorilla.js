import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS } from "../data/items.js";
import { db } from "../persistence/db.js";
import { getPark, parkTime } from "../park/park.js";
import { dayOf } from "../core/clock.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { reachesFeeder } from "../equipment/rules.js";
import { findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward, herdsOf } from "./zebraRules.js";
import { trunkBeside, climbRoute, stillOpen, centre } from "./climbRules.js";
import { ACT, PACE, TICKS, GORILLA_TYPES, roleOf, wildRole, isInfant, dayPart, pickMood, ringPlaces, bluffStep, apeUpLegs, apeDownLegs, apeEscapeLegs } from "./gorillaRules.js";
import { intentOf, clearIntent, arrivedAtDen, isDenned, ateBait, baitUnreachable, isCalm, hurtWild } from "./predators.js";
import { reportError } from "../core/log.js";

// Gorillas (0.1.80, the Treetop trio; spec 5.2 "gorilla | Gorilla | Social interaction and puzzle solving |
// Strong fixtures and climbing structures"; the rules are in animals/gorillaRules.js). Every half second, for the
// gorillas near players, by troop (an exhibit's gorillas, or loose ones close together: wild, or a zoo gorilla
// that got out): the troop has a mood for a while, set by the time of day, and each gorilla does what fits it.
// Feeding (morning and afternoon) it sits up eating at a feeder, works a Puzzle Feeder with a finger, or browses
// the leaves beside the floor; travelling, the silverback leads the troop somewhere else; resting (midday) they
// lie about round him while the young play; social, two groom, the young play, and the females and young climb a
// trunk or a Climbing Frame and sit on top (the silverback stays on the ground); at dusk each builds a nest,
// pulling branches in round it, and sleeps in it through the night. Wherever he goes and rests, the troop keeps
// near. Now and then the silverback gives the chest-beat display (hoots, stands up and beats his chest, slaps the
// ground). An infant rides on its mother's back its first park days (carried there each tick, tickGorillaMoves).
// All of that is the client's (gen/gorilla.py) through the zoocraft:act property; walks glide a tick at a time at
// the client's stride speeds through the exhibit's measured floor or open ground in the wild, and climbs follow
// legs (as the raccoon's: no gravity, the zoocraft:climb body).
// animals/predators.js decides the dangerous parts in a zoo exhibit and this module carries them out: a gorilla
// called to a Holding Den walks to its door and goes in; one warning a player off stands and beats its chest at
// them, then charges and shoves (the damage is predators.js's), then backs off. A wild silverback bluffs (Austin's
// card, "Bluff": gorillaRules.js bluffStep): the display at someone who comes near, a charge that stops short, and
// a real one only at someone who keeps coming or hurt his troop. A loose one tempted by a thrown Fruit Ration sits
// and eats it, calm, so it can be crated. A zoo gorilla in an exhibit without strong walls gets out along the way
// the ape measure found (exhibits/geometry.js floodApe) and is loose until it's crated.

const RANGE = 48; // blocks from a player: a troop with one of them this close is met, all of it
const KEEP_RANGE = 56; // and kept while one of it is this close
const FEMALE = 0.8; // a female's size, of a silverback's (the client scale)
const NIGHT_NEST = 6000; // ticks: a nest built this lately is tonight's
const ACT_PROP = "zoocraft:act";

const state = new Map(); // entity id -> { phase, act, busyUntil, actUntil, cool, body, troop, mood, top, ... }
const moving = new Map(); // entity id -> a glide (walking or running)
const climbing = new Map(); // entity id -> { e, legs, i, t, from, done, read }: climbing legs
const riders = new Map(); // infant entity id -> { e, mother }: carried on its mother's back
const troops = new Map(); // troop key -> { mood, until, travel, places, sound }
const hurt = new Map(); // entity id -> { playerId, until }: hurt by this player, its troop's silverback means it
const bluffs = new Map(); // `${entity id}|${player id}` -> bluffStep state
const climbSpots = new Map(); // exhibit id -> { at, spots }: where a gorilla can go up a trunk or a frame
let wildTroops = 0;
const reported = new Set(); // errors already in the content log (one line each, not every half second)

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}
function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.5), z: Math.floor(p.z) };
}
const keyOf = (c) => `${c.x},${c.y},${c.z}`;
function dist(p, q) {
  return Math.hypot(p.x - q.x, p.z - q.z);
}

function memo(read) {
  const m = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let v = m.get(k);
    if (v === undefined) {
      v = read(x, y, z);
      m.set(k, v);
    }
    return v;
  };
}
const FLOORLESS = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded"]);
// A grown gorilla stands about 1.3 blocks on all fours: open at its feet and head, on a floor (or wading).
function standable(read, c) {
  const feet = read(c.x, c.y, c.z);
  return (feet === "air" || (feet === "water" && read(c.x, c.y - 1, c.z) !== "water")) && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
// Room over its head for a step up or down (zebraRules.js findWay: the block two up).
function headroom(read, c) {
  return read(c.x, c.y + 2, c.z) === "air";
}
function openAt(read) {
  return (c) => read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air";
}
// Where a troop may walk: its exhibit's measured floor (not up on its feeders and fixtures, never deep water),
// or open ground in the wild.
function walker(ctx) {
  if (!ctx.wild) return (c) => ctx.cells?.get(keyOf(c)) === "land" && !ctx.onTop.has(keyOf(c));
  return (c) => standable(ctx.read, c);
}

function vulnerable(p) {
  try {
    const mode = String(p.getGameMode()).toLowerCase();
    return mode === "survival" || mode === "adventure";
  } catch {
    return false;
  }
}
function peaceful() {
  try {
    return String(world.getDifficulty()).toLowerCase() === "peaceful";
  } catch {
    return false;
  }
}

// ---------------- the half-second tick ----------------
export function tickGorillas(now) {
  const G = BALANCE.gorilla;
  const players = onlinePlayers();
  let part = "morning";
  try {
    part = dayPart(world.getTimeOfDay());
  } catch {
    // keeps the morning
  }
  let today = 0;
  try {
    today = dayOf(parkTime(), BALANCE.clock.dayLength);
  } catch {
    // day 0
  }
  const seen = new Set();
  const near = new Map();
  const zoo = new Map();
  const loose = [];
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, KEEP_RANGE + G.troopReach, GORILLA_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      const d = Math.hypot(e.location.x - player.location.x, e.location.y - player.location.y, e.location.z - player.location.z);
      if (d < (near.get(e.id) ?? Infinity)) near.set(e.id, d);
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_gorilla") {
        loose.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit" || isDenned(a.id)) {
        seen.delete(e.id); // shut in a Holding Den: still, hidden, the den's
        continue;
      }
      if (a.outside) {
        loose.push({ e, a }); // got out: loose until it's crated
        continue;
      }
      const troop = zoo.get(a.location.id) ?? [];
      troop.push({ e, a });
      zoo.set(a.location.id, troop);
    }
  }
  const keys = new Set();
  const met = (members) => {
    const close = (b) => /** @type {number} */ (near.get(b.e.id)) <= (state.has(b.e.id) ? KEEP_RANGE : RANGE);
    if (members.some(close)) return true;
    for (const b of members) seen.delete(b.e.id);
    return false;
  };
  for (const [exId, members] of zoo) {
    const ex = getExhibit(exId);
    const species = SPECIES[members[0].a.speciesId];
    if (!ex || !met(members)) continue;
    const key = `ex:${exId}`;
    keys.add(key);
    stepTroop(key, members, zooContext(ex, species, members[0].e, now, G), now, players, part, today, G);
  }
  loose.sort((p, q) => (p.e.id < q.e.id ? -1 : 1));
  const of = herdsOf(
    loose.map(({ e }) => ({ x: e.location.x, z: e.location.z })),
    G.troopReach,
  );
  const groups = new Map();
  loose.forEach((b, i) => groups.set(of[i], [...(groups.get(of[i]) ?? []), b]));
  for (const members of [...groups.values()].sort((p, q) => q.length - p.length)) {
    if (!met(members)) continue;
    const had = new Map();
    for (const { e } of members) {
      const k = state.get(e.id)?.troop;
      if (k && troops.has(k)) had.set(k, (had.get(k) ?? 0) + 1);
    }
    let key = [...had].sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1)).map(([k]) => k).find((k) => !keys.has(k));
    if (!key) key = `wild:${++wildTroops}`;
    keys.add(key);
    const read = memo(blockReader(members[0].e.dimension));
    stepTroop(key, members, { wild: true, species: SPECIES["zoocraft:gorilla"], read, climbRead: memo(blockReader(members[0].e.dimension, { leaves: true, climb: true })), cells: undefined, onTop: new Set(), feeders: [], puzzles: [] }, now, players, part, today, G);
  }
  // Out of everyone's range (or shut in a den): forgotten, and back to walking where the engine takes it.
  for (const [id] of [...state]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
    climbing.delete(id);
    riders.delete(id);
    try {
      const e = world.getEntity(id);
      if (e?.isValid && !isDenned(animalFromEntity(e)?.id ?? "")) {
        e.triggerEvent("zoocraft:move");
        setAct(e, ACT.none);
      }
    } catch {
      // unloaded
    }
  }
  for (const key of [...troops.keys()]) if (!keys.has(key)) troops.delete(key);
  for (const [id, h] of [...hurt]) if (now > h.until) hurt.delete(id);
  for (const k of [...bluffs.keys()]) if (!seen.has(k.split("|")[0])) bluffs.delete(k);
}

// What a zoo troop has to work with: the measured floor, the feeders holding food it eats (Puzzle Feeders too),
// and where it can go up a trunk or a Climbing Frame.
function zooContext(ex, species, e, now, G) {
  const read = memo(blockReader(e.dimension));
  const climbRead = memo(blockReader(e.dimension, { leaves: true, climb: true }));
  const cells = cellsOf(ex.id);
  const all = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  const fixtures = fixturesOf(ex);
  const onTop = new Set([...all, ...fixtures].map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  const edible = all.filter((f) => f.units > 0 && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
  return { wild: false, ex, species, read, climbRead, cells, onTop, feeders: edible.filter((f) => !f.puzzle), puzzles: edible.filter((f) => f.puzzle), spots: () => spotsOf(ex, cells, climbRead, onTop, now, G) };
}

// Where a gorilla in this exhibit can go up a trunk or a Climbing Frame (from a floor block beside it), found
// now and then (the exhibit can change).
function spotsOf(ex, cells, read, onTop, now, G) {
  const had = climbSpots.get(ex.id);
  if (had && now - had.at < 600) return had.spots;
  const spots = [];
  const done = new Set();
  let n = 0;
  for (const [k, v] of cells ?? []) {
    if (v !== "land" || onTop.has(k) || ++n > 3000) continue;
    const [x, y, z] = k.split(",").map(Number);
    const t = trunkBeside(read, { x, y, z });
    if (!t || t.from.x !== x || t.from.z !== z) continue;
    const id = `${x},${y},${z},${t.dir.x},${t.dir.z}`;
    if (done.has(id)) continue;
    done.add(id);
    const route = climbRoute(read, t.from, t.dir, G.maxUp);
    if (route) spots.push({ from: t.from, dir: t.dir, route });
  }
  climbSpots.set(ex.id, { at: now, spots });
  return spots;
}

// ---------------- the troop ----------------
function stepTroop(key, members, ctx, now, players, part, today, G) {
  let h = troops.get(key);
  if (!h) {
    h = { mood: "rest", until: 0, travel: undefined, places: new Map(), sound: {} };
    troops.set(key, h);
  }
  const troop = [];
  for (const { e, a } of members) {
    let s = state.get(e.id);
    if (!s) {
      s = { phase: "idle", act: ACT.none, busyUntil: 0, actUntil: 0, cool: now + between([0, 40]), body: undefined, troop: key, mood: undefined, top: undefined, met: true };
      state.set(e.id, s);
    }
    s.troop = key;
    let mark = 0;
    try {
      mark = e.getComponent("minecraft:mark_variant")?.value ?? 0;
    } catch {
      // keeps a female
    }
    const species = a ? SPECIES[a.speciesId] : ctx.species;
    const role = a ? roleOf(a, species) : wildRole(mark);
    const juvenile = role === "young";
    const scale = juvenile ? species.breeding.juvenileScale * FEMALE : role === "female" ? FEMALE : 1; // juvenileScale is of a female's size
    troop.push({ id: e.id, e, a, s, role, juvenile, scale, infant: Boolean(a && isInfant(a, today, G)), motherId: a?.parents?.[0] }); // a zoo-born one's parents: [mother, father]
  }
  const leader = troop.find((m) => m.role === "silverback") ?? troop.find((m) => !m.juvenile);
  if (now >= h.until) {
    const was = h.mood;
    h.mood = pickMood(part, G);
    h.until = now + between(G.moodTicks);
    h.travel = undefined;
    h.places.clear();
    if (was !== h.mood) for (const m of troop) if (m.s.phase === "act" && m.s.mood === was && !m.s.top) m.s.actUntil = now; // done with what that mood had it doing
  }
  for (const m of troop) {
    try {
      stepGorilla(m, h, troop, leader, ctx, now, players, G);
    } catch (error) {
      moving.delete(m.id);
      const why = String(error);
      if (!reported.has(why)) {
        reported.add(why);
        reportError("gorilla", error);
      }
    }
  }
  sounds(h, troop, now, G);
}

// ---------------- one gorilla ----------------
function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}
// Its body: "move" (the engine walks it), "still" (standing put, sat, lying, or carried by a glide), "climb" (no
// gravity: climbing legs carry it, and it stays up there) or "ride" (no gravity, no collision: on its mother's back).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// Doing `act` where it is, for `ticks`.
function startAct(m, now, act, ticks, mood = undefined) {
  const s = m.s;
  s.phase = "act";
  s.act = act;
  s.mood = mood;
  s.actUntil = Math.max(now, s.busyUntil) + (Array.isArray(ticks) ? between(ticks) : ticks);
  if (!s.top) body(m.e, s, "still");
  setAct(m.e, act);
}

// Back on its feet, then nothing in particular: the engine walks it about.
function settle(m, now, G) {
  const s = m.s;
  s.phase = "idle";
  s.act = ACT.none;
  s.top = undefined;
  s.cool = now + between(G.coolTicks);
  body(m.e, s, "move");
  setAct(m.e, ACT.none);
}

function stepGorilla(m, h, troop, leader, ctx, now, players, G) {
  const s = m.s;
  if (climbing.has(m.id)) return; // on its way up or down: the legs finish first
  if (!m.infant && riders.has(m.id)) {
    // Grown out of riding (or its mother gone): off her back, on its own feet.
    riders.delete(m.id);
    settle(m, now, G);
  }
  if (m.infant && rideStep(m, troop, ctx, now, G)) return;
  if (s.met) {
    // Met (again) up on top of a trunk or a Climbing Frame, where it was left when no one was near: down the way up
    // first (it'd stand up there for good otherwise: nothing walks it off).
    s.met = false;
    const spot = spotUnder(m, ctx, G);
    if (spot) {
      s.top = spot;
      return climbDown(m, now, G);
    }
  }
  // A zoo gorilla: what predators.js wants of it first (a den, a player inside the exhibit).
  const it = intentOf(m.id);
  if (!ctx.wild && it && (it.kind === "den" || it.kind === "warn" || it.kind === "charge" || it.kind === "back")) {
    if (s.top) return climbDown(m, now, G); // down first
    if (intentStep(m, it, ctx, now, players, G)) return;
  }
  if (ctx.wild) {
    if (it && (it.kind === "bait" || it.kind === "eat")) {
      if (s.top) return climbDown(m, now, G);
      if (baitStep(m, it, ctx, now, G)) return;
    }
    if (bluffer(m, troop) && bluff(m, h, troop, ctx, now, players, G)) return;
  } else if (m.a && !s.top && !moving.has(m.id) && climbOut(m, ctx, now, players, G)) return;
  if (moving.has(m.id)) return;
  if (now < s.busyUntil) return;
  if (s.phase === "act" && now < s.actUntil) return;
  if (s.top) return climbDown(m, now, G);
  // Asleep (or just done building its nest) and still the time for it: it sleeps on where it lies, not getting up
  // between one mood and the next.
  if (s.phase === "act" && (s.act === ACT.sleep || s.act === ACT.nest) && (h.mood === "sleep" || h.mood === "nest")) return startAct(m, now, ACT.sleep, Math.max(200, h.until - now), h.mood);
  if (s.phase === "act" || s.phase === "glide") settle(m, now, G);
  if (now < s.cool) return;
  // The silverback's display, now and then (more when there's someone about to show off to).
  if (m.role === "silverback" && h.mood !== "sleep" && h.mood !== "nest" && Math.random() < G.displayChance) return display(m, now, h.mood);
  // The troop keeps near the silverback.
  if (leader && m !== leader && h.mood !== "sleep" && dist(m.e.location, leader.e.location) > G.follow && followStep(m, leader, ctx, now, G)) return;
  switch (h.mood) {
    case "feed":
      return feedStep(m, ctx, now, G);
    case "travel":
      return travelStep(m, h, leader, ctx, now, G);
    case "rest":
      return restStep(m, h, troop, leader, ctx, now, G);
    case "social":
      return socialStep(m, h, troop, ctx, now, G);
    case "nest":
      // Building its nest, pulling branches in round it (one a night, however many nest moods the dusk has); then
      // asleep in it.
      if (s.nestedAt !== undefined && now - s.nestedAt < NIGHT_NEST) return startAct(m, now, ACT.sleep, Math.max(200, h.until - now), "nest");
      s.nestedAt = now;
      return startAct(m, now, ACT.nest, G.nestTicks, "nest");
    case "sleep":
      return startAct(m, now, ACT.sleep, Math.max(200, h.until - now), "sleep");
  }
}

// The chest-beat display where it stands (4 s), with its hoots and drumming.
function display(m, now, mood) {
  moving.delete(m.id);
  startAct(m, now, ACT.display, TICKS.display, mood);
  displaySounds(m.e);
}

// ---------------- feeding ----------------
// At a feeder (sat beside it eating, the food in its hand), at a Puzzle Feeder (working the pegs), or browsing
// the leaves beside the floor (reaching up, pulling a stem down); in the wild, browsing or picking at the plants
// where it is. The meal itself is the record's (animals/welfare.js): this is what players see.
function feedStep(m, ctx, now, G) {
  const r = Math.random();
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  if (!ctx.wild && ctx.puzzles.length && r < 0.35) return toFeeder(m, ctx, pick(ctx.puzzles), ACT.puzzle, G.puzzleTicks, now, G);
  if (!ctx.wild && ctx.feeders.length && r < 0.75) return toFeeder(m, ctx, pick(ctx.feeders), ACT.eat, G.eatTicks, now, G);
  const leaf = browseSpot(m, ctx);
  if (leaf) {
    if (keyOf(leaf.c) === keyOf(cellOf(m.e.location))) {
      m.e.setRotation({ x: 0, y: leaf.face });
      return startAct(m, now, ACT.browse, G.browseTicks, "feed");
    }
    if (walkTo(m, ctx, leaf.c, { act: ACT.walk, pace: PACE.walk, face: leaf.face }, (ok) => (ok ? startAct(m, system.currentTick, ACT.browse, G.browseTicks, "feed") : settle(m, system.currentTick, G)))) return;
  }
  // Picking at what grows on the ground where it is.
  startAct(m, now, ctx.wild ? ACT.eat : ACT.sit, ctx.wild ? G.eatTicks : G.sitTicks, "feed");
}

// Sat beside the feeder facing it (any side it can stand on).
function toFeeder(m, ctx, f, act, ticks, now, G) {
  const can = walker(ctx);
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dx, dz]) => ({ c: { x: f.pos.x + dx, y: f.pos.y, z: f.pos.z + dz }, face: yawTo(-dx, -dz) }))
    .filter(({ c }) => can(c));
  if (!sides.length) return startAct(m, now, ACT.sit, G.sitTicks, "feed");
  const { c, face } = sides[Math.floor(Math.random() * sides.length)];
  if (!walkTo(m, ctx, c, { act: ACT.walk, pace: PACE.walk, to: { x: c.x + 0.5, y: c.y, z: c.z + 0.5 }, face }, (ok) => (ok ? startAct(m, system.currentTick, act, ticks, "feed") : settle(m, system.currentTick, G)))) startAct(m, now, ACT.sit, G.sitTicks, "feed");
}

// A floor block near it with leaves beside it, level with it or a block or two up (a bush, a low branch): it
// browses there facing them.
function browseSpot(m, ctx) {
  const here = cellOf(m.e.location);
  const can = walker(ctx);
  const leafy = (c) => {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (const dy of [0, 1, 2]) if (ctx.climbRead(c.x + dx, c.y + dy, c.z + dz) === "leaves") return yawTo(dx, dz);
    return undefined;
  };
  let best;
  for (let k = 0; k < 24; k++) {
    const c = { x: here.x + between([-6, 6]), y: here.y, z: here.z + between([-6, 6]) };
    for (const dy of [0, 1, -1]) {
      const n = { ...c, y: c.y + dy };
      if (!can(n)) continue;
      const face = leafy(n);
      if (face !== undefined && (!best || dist(n, here) < dist(best.c, here))) best = { c: n, face };
    }
  }
  return best;
}

// ---------------- travelling, following, resting ----------------
// The silverback walks off somewhere (within G.travelReach); the others follow (followStep) and forage on the way.
function travelStep(m, h, leader, ctx, now, G) {
  if (m !== leader) return startAct(m, now, Math.random() < 0.5 ? ACT.eat : ACT.sit, G.sitTicks, "travel");
  const can = walker(ctx);
  const here = cellOf(m.e.location);
  let to;
  for (let k = 0; k < 16 && !to; k++) {
    const c = { x: here.x + between([-G.travelReach, G.travelReach]), y: here.y, z: here.z + between([-G.travelReach, G.travelReach]) };
    for (const dy of [0, 1, -1, 2, -2]) if (!to && can({ ...c, y: c.y + dy })) to = { ...c, y: c.y + dy };
  }
  if (!to || !walkTo(m, ctx, to, { act: ACT.walk, pace: PACE.walk }, (ok) => (ok ? startAct(m, system.currentTick, ACT.sit, G.sitTicks, "travel") : settle(m, system.currentTick, G)))) startAct(m, now, ACT.sit, G.sitTicks, "travel");
}

// Too far from the silverback: it goes to him (stopping a little way off).
function followStep(m, leader, ctx, now, G) {
  const to = cellOf(leader.e.location);
  return walkTo(m, ctx, to, { act: ACT.walk, pace: PACE.walk, stopShort: G.restRing }, (ok) => (ok ? startAct(m, system.currentTick, ACT.sit, G.sitTicks, "follow") : settle(m, system.currentTick, G)));
}

// The midday rest (a day nest): the silverback lies down where he is, the rest round him, the young nearest; a
// young one plays instead, half the time.
function restStep(m, h, troop, leader, ctx, now, G) {
  if (m.juvenile && Math.random() < 0.5) return startAct(m, now, ACT.play, G.playTicks, "rest");
  const lieDown = () => startAct(m, system.currentTick, Math.random() < 0.7 ? ACT.rest : ACT.sit, G.restTicks, "rest");
  if (!leader || m === leader) return lieDown();
  if (h.placesAt && dist(h.placesAt, leader.e.location) > 1.5) h.places.clear(); // he moved: round where he is now
  if (!h.places.has(m.id)) {
    h.placesAt = { x: leader.e.location.x, z: leader.e.location.z };
    const others = troop.filter((o) => o !== leader).sort((p, q) => Number(q.juvenile) - Number(p.juvenile));
    const spots = ringPlaces(leader.e.location, others.length, G, Math.floor(Math.random() * 360));
    const can = walker(ctx);
    const y = cellOf(leader.e.location).y;
    const mid = leader.e.location;
    const taken = new Set();
    others.forEach((o, i) => {
      // Its place on the ring, or the nearest one round it there's floor for (he may lie by a wall or a tree).
      const r = Math.hypot(spots[i].x - mid.x, spots[i].z - mid.z);
      const a0 = Math.atan2(spots[i].z - mid.z, spots[i].x - mid.x);
      let place;
      for (let k = 0; k < 12 && !place; k++) {
        const a = a0 + (((k % 2 ? 1 : -1) * Math.ceil(k / 2) * 30) * Math.PI) / 180;
        const p = { x: mid.x + Math.cos(a) * r, z: mid.z + Math.sin(a) * r };
        const c = [0, 1, -1].map((dy) => ({ x: Math.floor(p.x), y: y + dy, z: Math.floor(p.z) })).find((q) => can(q) && !taken.has(keyOf(q)));
        if (c) place = { cell: c, at: p };
      }
      if (place) taken.add(keyOf(place.cell));
      h.places.set(o.id, place);
    });
  }
  const place = h.places.get(m.id);
  if (!place || dist(m.e.location, place.at) < 0.8) return lieDown();
  const face = yawTo(leader.e.location.x - place.at.x, leader.e.location.z - place.at.z);
  if (!walkTo(m, ctx, place.cell, { act: ACT.walk, pace: PACE.walk, to: { x: place.at.x, y: place.cell.y, z: place.at.z }, face }, (ok) => (ok ? lieDown() : settle(m, system.currentTick, G)))) lieDown();
}

// ---------------- social: grooming, play, climbing ----------------
function socialStep(m, h, troop, ctx, now, G) {
  if (m.juvenile && Math.random() < 0.6) return startAct(m, now, ACT.play, G.playTicks, "social");
  // Females and the young climb (the silverback stays on the ground).
  if (m.role !== "silverback" && Math.random() < G.climbChance && climbStep(m, ctx, now, G)) return;
  // Grooming another that's sat or lying near: beside it, facing it, picking through its fur.
  const free = troop.filter((o) => o !== m && !moving.has(o.id) && !climbing.has(o.id) && !o.s.top && !riders.has(o.id) && o.s.phase !== "glide" && dist(o.e.location, m.e.location) < 10);
  if (free.length && Math.random() < 0.6) {
    const o = free[Math.floor(Math.random() * free.length)];
    const yaw = o.e.getRotation().y;
    const r = ((yaw + 90) * Math.PI) / 180;
    const at = { x: o.e.location.x - Math.sin(r) * 1.1, z: o.e.location.z + Math.cos(r) * 1.1 };
    const cell = { x: Math.floor(at.x), y: Math.floor(o.e.location.y + 0.5), z: Math.floor(at.z) };
    if (walker(ctx)(cell)) {
      startAct(o, now, ACT.sit, 400, "social"); // it sits for it
      const face = yawTo(o.e.location.x - at.x, o.e.location.z - at.z);
      if (walkTo(m, ctx, cell, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: cell.y, z: at.z }, face }, (ok) => {
        if (!ok) return settle(m, system.currentTick, G);
        startAct(m, system.currentTick, ACT.groom, G.groomTicks, "social");
        o.s.actUntil = Math.max(o.s.actUntil, m.s.actUntil);
      }))
        return;
    }
  }
  startAct(m, now, ACT.sit, G.sitTicks, "social");
}

// Up the nearest trunk or Climbing Frame it can get to, to sit on top (or cling under the leaves) a while.
function climbStep(m, ctx, now, G) {
  const here = cellOf(m.e.location);
  let spot;
  if (ctx.wild) {
    for (let r = 0; r <= 6 && !spot; r++) {
      for (let dx = -r; dx <= r && !spot; dx++) {
        for (let dz = -r; dz <= r && !spot; dz++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
          for (const dy of [0, 1, -1]) {
            const c = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
            if (spot || !standable(ctx.read, c)) continue;
            const t = trunkBeside(ctx.climbRead, c);
            const route = t && t.from.x === c.x && t.from.z === c.z && climbRoute(ctx.climbRead, t.from, t.dir, G.maxUp);
            if (route) spot = { from: t.from, dir: t.dir, route };
          }
        }
      }
    }
  } else {
    const spots = ctx.spots();
    if (spots.length) {
      const near = [...spots].sort((p, q) => dist(p.from, here) - dist(q.from, here)).slice(0, 4);
      spot = near[Math.floor(Math.random() * near.length)];
    }
  }
  if (!spot) return false;
  const up = () => {
    const legs = apeUpLegs(spot.from, spot.dir, spot.route, G, m.scale);
    m.s.phase = "climb";
    body(m.e, m.s, "climb");
    run(m, legs, () => {
      const t = system.currentTick;
      m.s.top = spot;
      startAct(m, t, spot.route.onTop ? ACT.top : ACT.climb, G.topTicks, "social");
    });
  };
  if (here.x === spot.from.x && here.z === spot.from.z) {
    up();
    return true;
  }
  return walkTo(m, ctx, spot.from, { act: ACT.walk, pace: PACE.walk, to: centre(spot.from) }, (ok) => (ok ? up() : settle(m, system.currentTick, G)));
}

// The trunk or Climbing Frame a gorilla stands on top of, as a climb spot (its way up), or undefined.
function spotUnder(m, ctx, G) {
  const here = cellOf(m.e.location);
  const under = ctx.climbRead(here.x, here.y - 1, here.z);
  if (under !== "log" && under !== "frame") return undefined;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (let y = here.y - 2; y >= here.y - 1 - G.maxUp; y--) {
      const from = { x: here.x + dx, y, z: here.z + dz };
      if (!standable(ctx.read, from)) continue;
      const dir = { x: -dx, z: -dz };
      const route = (ctx.wild || ctx.cells?.get(keyOf(from)) === "land") && climbRoute(ctx.climbRead, from, dir, G.maxUp);
      if (route?.onTop && keyOf(route.top) === keyOf(here)) return { from, dir, route };
      break;
    }
  }
  return undefined;
}

// Down from the top (or from where it clung), feet first, the way it went up.
function climbDown(m, now, G) {
  const spot = m.s.top;
  if (!spot) return;
  m.s.top = undefined;
  m.s.phase = "climb";
  body(m.e, m.s, "climb");
  run(m, apeDownLegs(spot.from, spot.dir, spot.route, G, m.scale), () => settle(m, system.currentTick, G));
}

function run(m, legs, done) {
  climbing.set(m.id, { e: m.e, legs, i: 0, t: 0, from: { x: m.e.location.x, y: m.e.location.y, z: m.e.location.z }, done, read: memo(blockReader(m.e.dimension, { leaves: true, climb: true })) });
}

// ---------------- the infant on its mother's back ----------------
// Its first park days it rides on her back while she's about (climbing too); when she sits, rests or sleeps it gets
// off and stays right beside her doing the same (playing while she sits). True while it's handled here.
function rideStep(m, troop, ctx, now, G) {
  const mother = troop.find((o) => o.a && o.a.id === m.motherId);
  if (!mother) {
    riders.delete(m.id);
    return false;
  }
  const ms = mother.s;
  const down = ms.phase === "act" && !ms.top && [ACT.sleep, ACT.rest, ACT.nest, ACT.sit, ACT.groom].includes(ms.act);
  if (!down) {
    if (!riders.has(m.id)) {
      moving.delete(m.id);
      riders.set(m.id, { e: m.e, mother: mother.e });
      m.s.phase = "ride";
      body(m.e, m.s, "ride");
    }
    setAct(m.e, ACT.ride);
    return true;
  }
  if (riders.has(m.id)) {
    riders.delete(m.id);
    // Off onto the ground at her side.
    const yaw = mother.e.getRotation().y;
    const r = ((yaw + 90) * Math.PI) / 180;
    const at = { x: mother.e.location.x - Math.sin(r) * 0.7, y: mother.e.location.y, z: mother.e.location.z + Math.cos(r) * 0.7 };
    const c = cellOf(at);
    const spot = standable(ctx.read, c) ? at : mother.e.location;
    m.e.teleport(spot, { rotation: { x: 0, y: yaw }, keepVelocity: false });
    m.s.phase = "idle";
    m.s.busyUntil = 0;
  }
  if (m.s.phase === "act" && now < m.s.actUntil) return true;
  const act = ms.act === ACT.sleep || ms.act === ACT.nest ? ACT.sleep : ms.act === ACT.rest ? ACT.rest : ACT.play;
  startAct(m, now, act, Math.max(20, ms.actUntil - now), "ride");
  return true;
}

// ---------------- what predators.js asks of a zoo gorilla ----------------
function intentStep(m, it, ctx, now, players, G) {
  const s = m.s;
  const e = m.e;
  if (it.kind === "den") {
    // Called into a Holding Den: a walk to the door, and in (an infant on her back goes in with her).
    if (moving.get(m.id)?.why === "den") return true;
    const d = dist(e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
    if (d < 0.9) {
      arrivedAtDen(e);
      state.delete(m.id);
      return true;
    }
    const ok = walkTo(m, ctx, it.to, { act: ACT.walk, pace: PACE.walk * 1.5, to: { x: it.to.x + 0.5, y: it.to.y, z: it.to.z + 0.5 }, why: "den" }, (done) => {
      if (done) {
        arrivedAtDen(e);
        state.delete(m.id);
      }
    });
    if (!ok) clearIntent(m.id, "den");
    return true;
  }
  const p = players.find((q) => q.id === it.playerId);
  if (!p) return false;
  const yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
  if (it.kind === "warn") {
    // Up on its legs, beating its chest at them.
    moving.delete(m.id);
    if (s.act !== ACT.warn || s.phase !== "act") startAct(m, now, ACT.warn, 400);
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    s.actUntil = now + 20;
    return true;
  }
  if (it.kind === "charge") {
    // The rush at them (a fresh way each half second), then the shove (predators.js lands it within reach).
    if (dist(e.location, p.location) <= BALANCE.predators.danger.reach) {
      moving.delete(m.id);
      if (s.act !== ACT.shove) startAct(m, now, ACT.shove, TICKS.shove + 6);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    chase(m, ctx, p, PACE.run, ACT.run, BALANCE.predators.danger.reach * 0.8, G);
    return true;
  }
  if (it.kind === "back") {
    // The shove that landed plays out first; then a few steps away, and it sits watching them.
    if (it.swiped && s.struck !== it.since) {
      s.struck = it.since;
      moving.delete(m.id);
      if (s.act !== ACT.shove) startAct(m, now, ACT.shove, TICKS.shove + 4);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    if (moving.has(m.id) || (s.phase === "act" && now < s.actUntil)) return true;
    if (s.backed === it.since) {
      startAct(m, now, ACT.sit, 40);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    s.backed = it.since;
    if (!backAway(m, ctx, p, 5)) startAct(m, now, ACT.sit, 40);
    return true;
  }
  return false;
}

// A few blocks straight away from the player if there's floor there, else a little to one side or the other.
function backAway(m, ctx, p, far) {
  const e = m.e;
  const away = Math.atan2(e.location.z - p.location.z, e.location.x - p.location.x);
  const yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
  const can = walker(ctx);
  for (const d of [far, far - 2]) {
    for (const turn of [0, 30, -30, 60, -60, 90, -90]) {
      const a = away + (turn * Math.PI) / 180;
      const to = cellOf({ x: e.location.x + Math.cos(a) * d, y: e.location.y, z: e.location.z + Math.sin(a) * d });
      const goal = [0, 1, -1].map((dy) => ({ ...to, y: to.y + dy })).find(can);
      if (goal && walkTo(m, ctx, goal, { act: ACT.walk, pace: PACE.walk * 1.5, face: yaw }, () => startAct(m, system.currentTick, ACT.sit, 40))) return true;
    }
  }
  return false;
}

// A short way toward the player (up to G.chaseSteps blocks), stopping `stopShort` from them, at `pace`.
function chase(m, ctx, p, pace, act, stopShort, G) {
  const g = moving.get(m.id);
  const target = cellOf(p.location);
  if (g?.why === "chase" && g.target === keyOf(target) && g.s < g.end) return;
  const can = walker(ctx);
  let goal = target;
  if (!can(goal)) goal = [1, -1].map((dy) => ({ ...target, y: target.y + dy })).find(can) ?? target;
  const way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(ctx.read, c), cellOf(m.e.location), goal, G.chaseSteps, G.chaseNodes);
  if (!way || !way.length) return;
  glide(m, way, { act, pace, why: "chase", to: { x: p.location.x, y: goal.y, z: p.location.z }, stopShort }, () => {});
  const ng = moving.get(m.id);
  if (ng) ng.target = keyOf(target);
}

// ---------------- loose: a thrown Fruit Ration ----------------
function baitStep(m, it, ctx, now, G) {
  if (it.kind === "eat") {
    // Sat eating it, calm while it lasts.
    if (m.s.act !== ACT.eat) startAct(m, now, ACT.eat, 200);
    m.s.actUntil = now + 20;
    return true;
  }
  if (moving.get(m.id)?.why === "bait") return true;
  const d = dist(m.e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
  const eatNow = () => {
    if (ateBait(m.e, system.currentTick)) startAct(m, system.currentTick, ACT.eat, 200);
  };
  if (d < 1.2) {
    eatNow();
    return true;
  }
  // No way to it: it leaves that one be. A walk cut short is tried again, a few times.
  const failed = () => {
    m.s.baitFails = (m.s.baitFails ?? 0) + 1;
    if (m.s.baitFails >= 3) {
      m.s.baitFails = 0;
      baitUnreachable(m.id);
    }
  };
  if (!walkTo(m, ctx, it.to, { act: ACT.walk, pace: PACE.walk * 1.5, why: "bait", stopShort: 0.7 }, (ok) => (ok ? eatNow() : failed()))) {
    m.s.baitFails = 0;
    baitUnreachable(m.id);
  }
  return true;
}

// ---------------- loose: the silverback's bluff ----------------
// The troop's silverback bluffs (or, with none, each grown one: a female that got out on her own).
function bluffer(m, troop) {
  if (m.juvenile) return false;
  return m.role === "silverback" || !troop.some((o) => o.role === "silverback");
}

const RANK = { charge: 4, display: 3, stand: 2, back: 1, calm: 0 };
function bluff(m, h, troop, ctx, now, players, G) {
  const B = G.bluff;
  const e = m.e;
  if (isCalm(m.id) || peaceful()) {
    for (const k of [...bluffs.keys()]) if (k.startsWith(`${m.id}|`)) bluffs.delete(k);
    return false;
  }
  const grudges = new Set(troop.map((o) => hurt.get(o.id)?.playerId).filter(Boolean));
  let worst;
  for (const p of players) {
    const k = `${m.id}|${p.id}`;
    if (p.dimension.id !== e.dimension.id) {
      bluffs.delete(k);
      continue;
    }
    const d = dist(p.location, e.location);
    if (d > B.displayRange + B.leaveSlack + 4 || Math.abs(p.location.y - e.location.y) > 8) {
      bluffs.delete(k);
      continue;
    }
    const before = bluffs.get(k);
    const st = bluffStep(before, { dist: d, exposed: vulnerable(p), grudge: grudges.has(p.id) }, now, B);
    bluffs.set(k, st);
    if (st.phase !== before?.phase) told(p, st, B);
    if (st.shove) system.runTimeout(() => shove(e, p, B), 11); // the push lands about half a second into the shove
    if (!worst || RANK[st.phase] > RANK[worst.st.phase]) worst = { st, p, d };
  }
  if (!worst || worst.st.phase === "calm" || (worst.st.phase === "back" && !worst.st.shove)) {
    if (m.s.bluffing && m.s.act === ACT.shove && now < m.s.actUntil) return true; // the shove plays out
    if (m.s.bluffing) {
      m.s.bluffing = false;
      moving.delete(m.id);
      settle(m, now, G);
    }
    return false;
  }
  const { st, p, d } = worst;
  m.s.bluffing = true;
  if (m.s.top) {
    climbDown(m, now, G);
    return true;
  }
  const yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
  const face = () => e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
  if (st.phase === "display") {
    if (m.s.act !== ACT.display || m.s.phase !== "act") display(m, now, "bluff");
    if (now - st.since < 10) face();
    m.s.actUntil = Math.max(m.s.actUntil, now + 20);
    return true;
  }
  if (st.phase === "stand") {
    // Standing his ground, beating his chest at them.
    moving.delete(m.id);
    if (m.s.act !== ACT.warn || m.s.phase !== "act") startAct(m, now, ACT.warn, 400, "bluff");
    face();
    m.s.actUntil = now + 20;
    return true;
  }
  if (st.phase === "back") {
    // The shove (a real charge that reached them).
    moving.delete(m.id);
    startAct(m, now, ACT.shove, TICKS.shove + 4, "bluff");
    face();
    return true;
  }
  // The charge: at them, stopping short (a bluff) or right up to them (a real one).
  if (st.since === now) chargeSound(e, st.real);
  if (d <= (st.real ? B.reach : B.stopShort + 0.4)) {
    moving.delete(m.id);
    if (m.s.act !== ACT.warn) startAct(m, now, ACT.warn, 20, "bluff");
    face();
    return true;
  }
  chase(m, ctx, p, PACE.run, ACT.run, st.real ? B.reach * 0.8 : B.stopShort, G);
  return true;
}

function shove(e, p, B) {
  try {
    if (!e.isValid || !p.isValid || !vulnerable(p)) return;
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > B.reach + 0.75) return;
    p.applyDamage(B.damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * B.knock, z: (dz / len) * B.knock }, B.lift);
    e.dimension.playSound("mob.irongolem.throw", e.location, { volume: 1, pitch: 0.8 });
  } catch {
    // gone
  }
}

// What the player is told when it changes (at most once in B.tellEvery for each kind).
const toldAt = new Map(); // `${player id}|${phase}` -> tick
function told(p, st, B) {
  const text = st.phase === "display" ? "§eA silverback is warning you off: back away slowly and he lets you be" : st.phase === "charge" ? (st.real ? "§cThe silverback is charging you for real: get away!" : "§eHe's charging to scare you off: stand back and he stops short") : undefined;
  if (!text) return;
  const k = `${p.id}|${st.phase}${st.real ? "r" : ""}`;
  const now = system.currentTick;
  if (now - (toldAt.get(k) ?? -100000) < B.tellEvery) return;
  toldAt.set(k, now);
  try {
    p.onScreenDisplay.setActionBar(text);
  } catch {
    // gone
  }
}

// A gorilla hurt by a player (initGorillas, world.afterEvents.entityHurt): no longer calm, and its troop's
// silverback means it: his next charge at them is real.
export function gorillaHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  hurt.set(entity.id, { playerId: damager.id, until: system.currentTick + BALANCE.gorilla.bluff.hurtTicks });
  hurtWild(entity.id);
}

// ---------------- out of an exhibit without strong walls ----------------
// Near the start of the way out the ape measure found, now and then it takes it, and the park members hear where.
function climbOut(m, ctx, now, players, G) {
  const ex = ctx.ex;
  const c = ex?.apeClimb;
  if (!c || c.proof !== false || !c.path?.length || m.a.outside) return false;
  if (now < m.s.busyUntil || (m.s.phase === "act" && now < m.s.actUntil)) return false;
  const path = c.path.map(([x, y, z]) => ({ x, y, z }));
  const start = path[0];
  const here = cellOf(m.e.location);
  if (start.y !== here.y || Math.hypot(start.x - here.x, start.z - here.z) > G.escapeReach) return false;
  if (Math.random() >= G.escapeChance) return false;
  const legs = apeEscapeLegs(ctx.climbRead, here, path, G);
  if (!legs?.length) return false;
  m.s.phase = "climb";
  body(m.e, m.s, "climb");
  run(m, legs, () => settle(m, system.currentTick, G));
  const park = getPark();
  const v = c.via ?? path[path.length - 1];
  const text = `§c${m.a.name} the gorilla is getting out of ${ex.name} near ${v.x} ${v.y} ${v.z}! §7It's dangerous loose: keep back. Gorillas climb fences, trees and frames and pull themselves up 3.5 blocks: build the walls 4 high of solid blocks or glass (the clipboard says where). To bring it back, throw a Fruit Ration down near it and crate it with a Reinforced Crate while it eats.`;
  for (const p of players) if (park?.members[p.id] && p.dimension.id === m.e.dimension.id) message(p, text);
  return true;
}

// ---------------- gliding, climbing and riding, every tick ----------------
export function tickGorillaMoves() {
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
      if (m.s < m.end) {
        const s = Math.min(m.end, m.s + m.pace);
        let p = pointAlong(m.pts, s);
        let c = cellOf(p);
        // Never into a block: stepping up it gets up onto the block it's over.
        if (m.read(c.x, c.y, c.z) !== "air" && m.read(c.x, c.y, c.z) !== "water" && standable(m.read, { x: c.x, y: c.y + 1, z: c.z })) {
          p = { ...p, y: c.y + 1 };
          c = { x: c.x, y: c.y + 1, z: c.z };
        }
        const k = keyOf(c);
        if (k !== m.cell) {
          if (!standable(m.read, c) && !standable(m.read, { x: c.x, y: c.y - 1, z: c.z })) {
            finish(id, m, false);
            continue;
          }
          m.cell = k;
        }
        m.s = s;
        if (p.dx || p.dz) m.yaw = turnToward(m.yaw, yawTo(p.dx, p.dz), m.turn);
        setAct(e, m.act);
        e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
        continue;
      }
      if (m.face !== undefined && Math.abs(((((m.face - m.yaw) % 360) + 540) % 360) - 180) > 2) {
        m.yaw = turnToward(m.yaw, m.face, 10);
        setAct(e, ACT.walk);
        e.setRotation({ x: 0, y: m.yaw });
        continue;
      }
      finish(id, m, true);
    } catch {
      moving.delete(id);
    }
  }
  for (const [id, m] of [...climbing]) {
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      climbing.delete(id);
      continue;
    }
    try {
      const leg = m.legs[m.i];
      if (m.t === 0) {
        // Something built in the way since it set off: it lets go (no fall damage) and walks again.
        if (!stillOpen(m.read, { x: Math.floor(leg.to.x), y: Math.floor(leg.to.y + 0.01), z: Math.floor(leg.to.z) })) {
          climbing.delete(id);
          const s = state.get(id);
          if (s) {
            s.top = undefined;
            s.phase = "idle";
            s.body = "move";
          }
          e.triggerEvent("zoocraft:move");
          setAct(e, ACT.none);
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
        climbing.delete(id);
        m.done();
      }
    } catch {
      climbing.delete(id);
    }
  }
  // Infants on their mothers' backs: on her back over her middle (behind her when she climbs, upright).
  for (const [id, r] of [...riders]) {
    try {
      if (!r.e.isValid || !r.mother.isValid) {
        riders.delete(id);
        continue;
      }
      const yaw = r.mother.getRotation().y;
      const up = climbing.has(r.mother.id) || state.get(r.mother.id)?.top;
      const back = up ? -0.42 : -0.12;
      const rad = (yaw * Math.PI) / 180;
      const loc = r.mother.location;
      r.e.teleport({ x: loc.x - Math.sin(rad) * back, y: loc.y + (up ? 0.55 : 0.86), z: loc.z + Math.cos(rad) * back }, { rotation: { x: 0, y: yaw }, keepVelocity: false });
    } catch {
      riders.delete(id);
    }
  }
}

function finish(id, m, ok) {
  moving.delete(id);
  m.done(ok);
}

/**
 * Glide a gorilla through the blocks `cells` from where it stands, then `done(ok)`. opts: act, pace (blocks a
 * tick), to (an exact end point), face (a yaw to turn to there), stopShort (blocks short of the end), why.
 */
function glide(m, cells, opts, done) {
  const e = m.e;
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const read = blockReader(e.dimension);
  const pts = smoothWay(from, cells, openAt(read));
  if (opts.to) {
    const to = { x: opts.to.x, y: pts[pts.length - 1].y, z: opts.to.z };
    if (pts.length === 1) pts.push(to);
    else pts[pts.length - 1] = to;
  }
  m.s.phase = "glide";
  body(e, m.s, "still");
  moving.set(e.id, {
    e,
    pts,
    s: 0,
    end: Math.max(0, wayLength(pts) - (opts.stopShort ?? 0)),
    pace: opts.pace ?? PACE.walk,
    act: opts.act ?? ACT.walk,
    turn: opts.pace >= PACE.run ? 18 : 12,
    yaw: e.getRotation().y,
    face: opts.face,
    why: opts.why,
    read,
    cell: keyOf(cellOf(from)),
    done,
  });
}

function walkTo(m, ctx, to, opts, then) {
  const G = BALANCE.gorilla;
  const way = findWay(walker(ctx), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? G.wildWalkSteps : G.walkSteps, ctx.wild ? G.wildNodes : Infinity);
  if (!way) return false;
  if (!way.length && !opts.to && opts.face === undefined) {
    then(true);
    return true;
  }
  glide(m, way, opts, then);
  return true;
}

// ---------------- sounds ----------------
// The display: hoots rising (0 to 0.9 s), the chest beat (a drum roll, 0.9 to 2.7 s), the ground slap (3.3 s).
function displaySounds(e) {
  const play = (id, pitch, volume, at) =>
    system.runTimeout(() => {
      try {
        if (e.isValid) e.dimension.playSound(id, e.location, { volume, pitch });
      } catch {
        // Cosmetic only.
      }
    }, at);
  [0, 5, 10, 14].forEach((t, i) => play("note.flute", 0.5 + i * 0.06, 1.2, t));
  for (let t = 18; t <= 54; t += 3) play("note.bd", 0.75 + (t % 2) * 0.05, 1.6, t);
  play("note.bd", 0.5, 2, 66);
}
function chargeSound(e, real) {
  try {
    e.dimension.playSound("mob.ravager.roar", e.location, { volume: real ? 2 : 1.4, pitch: 1.25 });
  } catch {
    // Cosmetic only.
  }
}

// One troop's worth at a time: the chest beat while one warns someone off (a roll every 2.6 s, as the client's
// bouts), a contented grumble now and then while awake, a young one's play, chewing.
function sounds(h, troop, now, G) {
  const S = h.sound;
  try {
    for (const m of troop) {
      if (m.s.act !== ACT.warn || now < (m.s.beatNext ?? 0)) continue;
      m.s.beatNext = now + 52;
      for (let t = 0; t <= 30; t += 3) {
        system.runTimeout(() => {
          try {
            if (m.e.isValid) m.e.dimension.playSound("note.bd", m.e.location, { volume: 1.5, pitch: 0.8 });
          } catch {
            // Cosmetic only.
          }
        }, t);
      }
    }
    const awake = troop.filter((m) => m.s.act !== ACT.sleep && m.s.act !== ACT.warn && m.s.act !== ACT.display);
    if (awake.length && now >= (S.idle ??= now + between(G.idleEvery))) {
      S.idle = now + between(G.idleEvery);
      const m = awake[Math.floor(Math.random() * awake.length)];
      m.e.dimension.playSound("mob.panda.idle", m.e.location, { volume: 0.5, pitch: m.juvenile ? 1.4 : 0.55 });
    }
    const play = troop.find((m) => m.s.act === ACT.play);
    if (play && now >= (S.play ?? 0)) {
      S.play = now + 80;
      play.e.dimension.playSound("mob.panda.idle", play.e.location, { volume: 0.35, pitch: 1.6 });
    }
    const eat = troop.find((m) => m.s.act === ACT.eat || m.s.act === ACT.browse);
    if (eat && now >= (S.eat ?? 0)) {
      S.eat = now + 60;
      eat.e.dimension.playSound("mob.panda.eat", eat.e.location, { volume: 0.3, pitch: 0.7 });
    }
  } catch {
    // Cosmetic only.
  }
}

export function initGorillas() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        gorillaHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: GORILLA_TYPES },
  );
}
