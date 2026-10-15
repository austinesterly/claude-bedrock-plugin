import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS } from "../data/items.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { reachesFeeder, drinksFrom } from "../equipment/rules.js";
import { findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward, herdsOf } from "./zebraRules.js";
import { ACT, PACE, TICKS, LION_TYPES, roleOf, wildRole, dayPart, pickMood, pilePlaces, ledgesOf, huntStep } from "./lionRules.js";
import { intentOf, clearIntent, arrivedAtDen, isDenned, ateBait, baitUnreachable, isCalm, hurtWild } from "./predators.js";
import { reportError } from "../core/log.js";

// Lions (0.1.75, Big predators; spec 5.2 "lion | Lion | Pride rest and scent investigation | Group dens,
// secure service access"; the rules are in animals/lionRules.js). Every half second, for the lions near
// players, by pride (an exhibit's lions, or wild lions close together): the pride has a mood for a while,
// and each lion does what fits it. Resting (most of the day, more at midday) they walk to a place
// together (a ledge if there is one) and lie down in a pile touching, on their chests, then flat out on
// their sides or on their backs, now and then yawning; a lioness with cubs lies on her side to nurse them.
// Social, two rub heads or one licks another, they sit together; cubs play. On patrol one walks the
// ground sniffing; at a Scent Post (or anywhere now and then) it sniffs, grimaces (flehmen), sprays with
// its tail up, scrapes with its hind feet or claws the post. At dusk and before dawn the pride roars
// together. Zoo lions go to their feeders and troughs. All of that is the client's (gen/lion_anim.py)
// through the zoocraft:act property; walks glide a tick at a time (tickLionMoves) at the client's stride
// speeds, through the exhibit's measured floor or open ground in the wild.
// animals/predators.js decides the dangerous parts and this module carries them out: a zoo lion called
// to a Holding Den walks up to its door and goes in; one warning a player off crouches and snarls, then
// charges and swipes (the damage is predators.js's), then backs off. A wild lion hunts players (Austin,
// 2026-10-15: "Also make them very dangerous in the wild"): see huntStep. A wild one tempted by a thrown
// Meat Ration walks to it and eats it lying down, calm, so it can be crated.

const RANGE = 48; // blocks from a player: a pride with one of them this close is met, all of it
const KEEP_RANGE = 56; // and kept while one of it is this close
const ACT_PROP = "zoocraft:act";

const state = new Map(); // entity id -> { phase, act, posture, busyUntil, actUntil, cool, body, pride, hunt, place }
const moving = new Map(); // entity id -> a glide
const prides = new Map(); // pride key -> { mood, until, anchor, yaw, roarAt, sound }
const hurt = new Map(); // wild entity id -> { playerId, until }: hurt by this player, it (and its pride) turns on them
let wildPrides = 0;
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

function memoRead(dimension) {
  const read = blockReader(dimension);
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
const FLOORLESS = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded"]);
// A grown lion stands 1.1 to 1.3 blocks: open at its feet and head, on a floor.
function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
function headroom(read, c) {
  return read(c.x, c.y + 2, c.z) === "air";
}
function openAt(read) {
  return (c) => read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air";
}
// Where a pride may walk: its exhibit's measured floor (not up on its feeders and fixtures), or open
// ground in the wild.
function walker(ctx) {
  if (!ctx.wild) return (c) => ctx.cells?.get(keyOf(c)) === "land" && !ctx.onTop.has(keyOf(c));
  return (c) => standable(ctx.read, c);
}

// ---------------- the half-second tick ----------------
export function tickLions(now) {
  const L = BALANCE.lion;
  const players = onlinePlayers();
  let part = "day";
  try {
    part = dayPart(world.getTimeOfDay());
  } catch {
    // keeps the day
  }
  const seen = new Set();
  const near = new Map();
  const zoo = new Map();
  const wild = [];
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, KEEP_RANGE + L.prideReach, LION_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      const d = Math.hypot(e.location.x - player.location.x, e.location.y - player.location.y, e.location.z - player.location.z);
      if (d < (near.get(e.id) ?? Infinity)) near.set(e.id, d);
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_lion") {
        wild.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit" || isDenned(a.id)) continue; // shut in a Holding Den: still, hidden, the den's
      const pride = zoo.get(a.location.id) ?? [];
      pride.push({ e, a });
      zoo.set(a.location.id, pride);
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
    stepPride(key, members, zooContext(ex, species, members[0].e), now, players, part, L);
  }
  wild.sort((p, q) => (p.e.id < q.e.id ? -1 : 1));
  const of = herdsOf(
    wild.map(({ e }) => ({ x: e.location.x, z: e.location.z })),
    L.prideReach,
  );
  const groups = new Map();
  wild.forEach((b, i) => groups.set(of[i], [...(groups.get(of[i]) ?? []), b]));
  for (const members of [...groups.values()].sort((p, q) => q.length - p.length)) {
    if (!met(members)) continue;
    const had = new Map();
    for (const { e } of members) {
      const k = state.get(e.id)?.pride;
      if (k && prides.has(k)) had.set(k, (had.get(k) ?? 0) + 1);
    }
    let key = [...had].sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1)).map(([k]) => k).find((k) => !keys.has(k));
    if (!key) key = `wild:${++wildPrides}`;
    keys.add(key);
    stepPride(key, members, { wild: true, species: SPECIES["zoocraft:lion"], read: memoRead(members[0].e.dimension), cells: undefined, onTop: new Set(), feeders: [], troughs: [], posts: [] }, now, players, part, L);
  }
  // Out of everyone's range: forgotten, and back to walking where the engine takes it.
  for (const [id] of [...state]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
    try {
      const e = world.getEntity(id);
      if (e?.isValid) {
        e.triggerEvent("zoocraft:move");
        setAct(e, ACT.none);
      }
    } catch {
      // unloaded
    }
  }
  for (const key of [...prides.keys()]) if (!keys.has(key)) prides.delete(key);
  for (const [id, h] of [...hurt]) if (now > h.until) hurt.delete(id);
}

// What a zoo pride has to work with: the measured floor, its ledges, the feeders holding meat, the
// troughs with water, and its Scent Posts.
function zooContext(ex, species, e) {
  const read = memoRead(e.dimension);
  const cells = cellsOf(ex.id);
  const all = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  const fixtures = fixturesOf(ex);
  const onTop = new Set([...all, ...fixtures].map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  const feeders = all.filter((f) => f.units > 0 && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
  const troughs = fixtures.filter((f) => f.type === "trough" && f.units > 0 && drinksFrom(species, f));
  const posts = fixtures.filter((f) => f.type === "scent");
  const ledges = cells ? ledgesOf(cells).filter((c) => !onTop.has(keyOf(c))) : [];
  return { wild: false, ex, species, read, cells, onTop, feeders, troughs, posts, ledges };
}

// ---------------- the pride ----------------
function stepPride(key, members, ctx, now, players, part, L) {
  let h = prides.get(key);
  if (!h) {
    h = { mood: "rest", until: 0, anchor: undefined, yaw: 0, roarAt: 0, sound: {}, places: new Map() };
    prides.set(key, h);
  }
  const pride = [];
  for (const { e, a } of members) {
    let s = state.get(e.id);
    if (!s) {
      s = { phase: "idle", act: ACT.none, posture: 0, busyUntil: 0, actUntil: 0, cool: now + between([0, 40]), body: undefined, pride: key, hunt: undefined };
      state.set(e.id, s);
    }
    s.pride = key;
    let variant = 0;
    try {
      variant = e.getComponent("minecraft:variant")?.value ?? 0;
    } catch {
      // keeps a lioness
    }
    const role = a ? roleOf(a) : wildRole(variant);
    pride.push({ id: e.id, e, a, s, role, juvenile: role === "cub", motherId: a?.parents?.[0] }); // a zoo-born cub's parents: [mother, father]
  }
  const cubs = pride.some((m) => m.juvenile);
  if (now >= h.until) {
    const was = h.mood;
    h.mood = pickMood(part, cubs, L);
    h.until = now + between(L.moodTicks);
    h.anchor = undefined;
    h.places.clear();
    if (h.mood === "roar") h.roarAt = now + between([20, 60]);
    if (was !== h.mood) for (const m of pride) if (m.s.phase === "act" && m.s.mood === was) m.s.actUntil = now; // done with what that mood had it doing
  }
  for (const m of pride) {
    try {
      stepLion(m, h, pride, ctx, now, players, part, L);
    } catch (error) {
      moving.delete(m.id);
      const why = String(error);
      if (!reported.has(why)) {
        reported.add(why);
        reportError("lion", error);
      }
    }
  }
  sounds(h, pride, now, L);
}

// ---------------- one lion ----------------
function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}
// Its body: "move" (the engine walks it) or "still" (standing put, lying, or carried by a glide).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(how === "move" ? "zoocraft:move" : "zoocraft:still");
  s.body = how;
}

// The posture an act puts it in (the client's controller: 0 standing, 1 sitting, 2 on its chest, 3 on its
// side, 4 on its back); a lioness nurses on her side, a cub suckles standing.
function postureOf(act, juvenile) {
  if (act === ACT.sit) return 1;
  if (act === ACT.lie || act === ACT.eat) return 2;
  if (act === ACT.sleep) return 3;
  if (act === ACT.sleepBack) return 4;
  if (act === ACT.nurse) return juvenile ? 0 : 3;
  return 0;
}
// Ticks the client takes from one posture to another (through the chain: standing, chest, side, back;
// sitting goes from standing and back up to it).
function postureTicks(from, to) {
  if (from === to) return 0;
  if (from === 1) return TICKS.sitUp + postureTicks(0, to);
  if (to === 1) return postureTicks(from, 0) + TICKS.sit;
  const down = [TICKS.down, TICKS.toSide, TICKS.toBack];
  const up = [TICKS.up, TICKS.fromSide, TICKS.fromBack];
  const rank = (p) => (p === 0 ? 0 : p - 1); // 0, 2, 3, 4 -> 0, 1, 2, 3
  let t = 0;
  for (let r = rank(from); r < rank(to); r++) t += down[r];
  for (let r = rank(from); r > rank(to); r--) t += up[r - 1];
  return t;
}

// Doing `act` where it is (getting into the posture for it first), for `ticks`.
function startAct(m, now, act, ticks, mood = undefined) {
  const s = m.s;
  const to = postureOf(act, m.juvenile);
  const start = Math.max(now, s.busyUntil);
  s.busyUntil = start + postureTicks(s.posture, to);
  s.posture = to;
  s.phase = "act";
  s.act = act;
  s.mood = mood;
  s.actUntil = s.busyUntil + (Array.isArray(ticks) ? between(ticks) : ticks);
  body(m.e, s, "still");
  setAct(m.e, act);
}

// Back on its feet (getting up first), then nothing in particular: the engine walks it about.
function settle(m, now, L) {
  const s = m.s;
  const start = Math.max(now, s.busyUntil);
  s.busyUntil = start + postureTicks(s.posture, 0);
  s.posture = 0;
  s.phase = "idle";
  s.act = ACT.none;
  s.cool = s.busyUntil + between(L.coolTicks);
  body(m.e, s, "move");
  setAct(m.e, ACT.none);
}

// On its feet and ready to walk (getting up first if it isn't): false while it's still getting up.
function onFeet(m, now) {
  const s = m.s;
  if (s.posture !== 0) {
    s.busyUntil = Math.max(now, s.busyUntil) + postureTicks(s.posture, 0);
    s.posture = 0;
    s.act = ACT.none;
    setAct(m.e, ACT.none);
    body(m.e, s, "still");
  }
  return now >= s.busyUntil;
}

function stepLion(m, h, pride, ctx, now, players, part, L) {
  const s = m.s;
  const e = m.e;
  // A zoo lion: what predators.js wants of it first (a den, a player inside the exhibit).
  const it = ctx.wild ? undefined : intentOf(m.id);
  if (it && intentStep(m, it, ctx, now, players, L)) return;
  if (ctx.wild) {
    const b = intentOf(m.id); // a thrown Meat Ration
    if (b && (b.kind === "bait" || b.kind === "eat") && baitStep(m, b, ctx, now, L)) return;
    if (huntStepLion(m, pride, ctx, now, players, part, L)) return;
  }
  if (moving.has(m.id)) return;
  if (now < s.busyUntil) return;
  // A cub wakes (or leaves its play) and goes to suckle as soon as its mother lies down to nurse.
  if (m.juvenile && s.act !== ACT.nurse) {
    const mother = nursingMother(m, pride);
    if (mother && suckleStep(m, mother, ctx, now, L)) return;
  }
  if (s.phase === "act" && now < s.actUntil) return;
  if (s.phase === "act" && s.then !== undefined) {
    // Something that follows on from what it just did (the grimace after sniffing a scent).
    const next = s.then;
    s.then = undefined;
    return startAct(m, now, next, L.scentTicks, s.mood);
  }
  if (s.phase === "act" || s.phase === "glide") settle(m, now, L);
  if (now < s.cool) return;
  if (m.juvenile && cubStep(m, h, pride, ctx, now, L)) return;
  if (!ctx.wild && !m.juvenile && h.mood !== "roar" && foodStep(m, ctx, now, L)) return;
  switch (h.mood) {
    case "rest":
      return restStep(m, h, pride, ctx, now, L);
    case "social":
      return socialStep(m, h, pride, ctx, now, L);
    case "patrol":
      return patrolStep(m, h, ctx, now, L);
    case "roar":
      return roarStep(m, h, pride, ctx, now, L);
    case "play":
      return restStep(m, h, pride, ctx, now, L); // the grown ones lie by while the cubs play
  }
}

// ---------------- food and water ----------------
// Now and then up to a feeder holding meat (eating from its top, a block up: neck pulls and chewing) or to
// a trough (drinking crouched, lapping), standing beside it facing it. The meal itself is the record's
// (animals/welfare.js): this is what players see.
function foodStep(m, ctx, now, L) {
  const r = Math.random();
  const list = r < L.feedChance ? ctx.feeders : r < L.feedChance + L.drinkChance ? ctx.troughs : [];
  if (!list.length) return false;
  const f = list[Math.floor(Math.random() * list.length)];
  const act = list === ctx.feeders ? ACT.feed : ACT.drink;
  // Where it stands: its nose over the middle of the feeder's top, or in the trough's water. The poses
  // put the nose 44 (eating at a feeder) or 46 (drinking) model units ahead of where it stands, 32 to a
  // block for a lioness (gen/lion_poses.py HEAD_AT), further for a bigger male.
  const reach = ((act === ACT.feed ? 44 : 46) / 32) * (m.role === "male" ? 0.575 / 0.5 : 1) - 0.1;
  const can = walker(ctx);
  const sides = [[1, 0], [-1, 0], [0, 1], [0, -1]]
    .map(([dx, dz]) => {
      const at = { x: f.pos.x + 0.5 + dx * reach, z: f.pos.z + 0.5 + dz * reach };
      return { at, c: { x: Math.floor(at.x), y: f.pos.y, z: Math.floor(at.z) }, face: yawTo(-dx, -dz), near: { x: f.pos.x + dx, y: f.pos.y, z: f.pos.z + dz } };
    })
    .filter(({ c, near }) => can(c) && can(near));
  if (!sides.length) return false;
  if (!onFeet(m, now)) return true;
  const { at, c, face } = sides[Math.floor(Math.random() * sides.length)];
  return walkTo(m, ctx, c, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: c.y, z: at.z }, face }, (ok) => (ok ? startAct(m, system.currentTick, act, act === ACT.feed ? L.feedTicks : L.drinkTicks) : settle(m, system.currentTick, L)));
}

// ---------------- resting in a pile ----------------
// The pride's resting place: a ledge in a zoo exhibit if it has one (the most ledge blocks together),
// else a quiet spot of its floor; in the wild, where the pride is.
function anchorOf(h, pride, ctx) {
  if (h.anchor) return h.anchor;
  const centre = { x: 0, z: 0 };
  for (const m of pride) {
    centre.x += m.e.location.x / pride.length;
    centre.z += m.e.location.z / pride.length;
  }
  let at;
  if (!ctx.wild && ctx.ledges.length) {
    let best;
    for (const c of ctx.ledges) {
      const n = ctx.ledges.filter((o) => o.y === c.y && Math.abs(o.x - c.x) <= 2 && Math.abs(o.z - c.z) <= 2).length;
      if (!best || n > best.n) best = { c, n };
    }
    at = best.c;
  } else if (!ctx.wild && ctx.cells) {
    const land = [...ctx.cells].filter(([, v]) => v === "land").map(([k]) => k.split(",").map(Number));
    if (land.length) {
      const [x, y, z] = land[Math.floor(Math.random() * land.length)];
      at = { x, y, z };
    }
  }
  if (!at) {
    const c = cellOf({ x: centre.x, y: pride[0].e.location.y, z: centre.z });
    at = c;
  }
  h.anchor = { x: at.x + 0.5, y: at.y, z: at.z + 0.5 };
  h.yaw = Math.floor(Math.random() * 4) * 90;
  return h.anchor;
}

// Its own place in the pile (pilePlaces), snapped to a block it may lie in.
function placeOf(m, h, pride, ctx, L) {
  if (h.places.has(m.id)) return h.places.get(m.id);
  const anchor = anchorOf(h, pride, ctx);
  const order = pride.filter((o) => !o.juvenile || o.role === "cub");
  const spots = pilePlaces(anchor, h.yaw, order.map((o) => o.role), L);
  const can = walker(ctx);
  order.forEach((o, i) => {
    const p = spots[i];
    let c = { x: Math.floor(p.x), y: anchor.y, z: Math.floor(p.z) };
    if (!can(c)) {
      // the nearest open block within two
      let best;
      for (let dx = -2; dx <= 2; dx++)
        for (let dz = -2; dz <= 2; dz++)
          for (const dy of [0, 1, -1]) {
            const n = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
            if (can(n) && (!best || Math.hypot(dx, dz) < best.d)) best = { n, d: Math.hypot(dx, dz) };
          }
      c = best?.n;
    }
    h.places.set(o.id, c ? { cell: c, at: { x: p.x, z: p.z }, yaw: p.yaw } : undefined);
  });
  return h.places.get(m.id);
}

function restStep(m, h, pride, ctx, now, L) {
  const place = placeOf(m, h, pride, ctx, L);
  const lieDown = () => {
    const now = system.currentTick; // called back at the end of a walk: the tick it arrived
    // On its chest first; then, more often than not, flat out asleep on its side (and now and then over on
    // its back, paws in the air); a lioness with cubs lies on her side to nurse them.
    const r = Math.random();
    const mother = !m.juvenile && pride.some((c) => c.juvenile && c.motherId === m.a?.id);
    if (mother && r < L.nurseChance) return startAct(m, now, ACT.nurse, L.nurseTicks, "rest");
    if (r < L.sleepChance) return startAct(m, now, Math.random() < L.backChance ? ACT.sleepBack : ACT.sleep, L.lieTicks, "rest");
    startAct(m, now, ACT.lie, L.lieTicks, "rest");
  };
  // Already down where it rests: on with it (a yawn on waking, then down again).
  if (m.s.posture >= 2 && m.s.mood === "rest") {
    if (Math.random() < L.yawnChance) return startAct(m, now, ACT.yawn, 60, "rest");
    return lieDown();
  }
  if (!place) return lieDown();
  const here = cellOf(m.e.location);
  if (dist(m.e.location, place.at) < 0.8 || (here.x === place.cell.x && here.z === place.cell.z)) return lieDown();
  if (!onFeet(m, now)) return;
  if (!walkTo(m, ctx, place.cell, { act: ACT.walk, pace: PACE.walk, to: { x: place.at.x, y: place.cell.y, z: place.at.z }, face: place.yaw }, (ok) => (ok ? lieDown() : settle(m, system.currentTick, L))))
    lieDown();
}

// ---------------- social ----------------
// Two grown ones (or a lioness and a cub): rubbing heads (greeting, eyes half shut), or one licking the
// other's head and neck, side by side facing the same way, the partner on its left; else it sits.
function socialStep(m, h, pride, ctx, now, L) {
  if (m.s.posture >= 2) return startAct(m, now, ACT.lie, L.lieTicks, "social");
  const free = pride.filter((o) => o !== m && !o.juvenile && !moving.has(o.id) && o.s.phase === "idle" && now >= o.s.busyUntil && o.s.posture === 0);
  if (m.juvenile || !free.length || Math.random() < 0.3) return startAct(m, now, Math.random() < 0.5 ? ACT.sit : ACT.yawn, L.socialTicks, "social");
  const o = free.reduce((a, b) => (dist(a.e.location, m.e.location) < dist(b.e.location, m.e.location) ? a : b));
  // It walks up beside the partner on the partner's right, facing the same way (so the partner is on its left).
  const yaw = o.e.getRotation().y;
  const r = (yaw * Math.PI) / 180;
  const side = { x: Math.cos(r), z: Math.sin(r) };
  const at = { x: o.e.location.x + side.x * L.besideGap, z: o.e.location.z + side.z * L.besideGap };
  const cell = { x: Math.floor(at.x), y: Math.floor(o.e.location.y + 0.5), z: Math.floor(at.z) };
  const act = Math.random() < 0.55 ? ACT.rub : ACT.lick;
  if (!walker(ctx)(cell)) return startAct(m, now, ACT.sit, L.socialTicks, "social");
  startAct(o, now, ACT.sit, L.socialTicks, "social"); // the partner sits for it
  o.s.actUntil = now + 400;
  walkTo(m, ctx, cell, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: cell.y, z: at.z }, face: yaw }, (ok) => {
    if (!ok) return settle(m, system.currentTick, L);
    startAct(m, system.currentTick, act, L.socialTicks, "social");
    o.s.actUntil = m.s.actUntil;
    if (act === ACT.rub) startAct(o, system.currentTick, ACT.rub, m.s.actUntil - system.currentTick, "social");
  });
}

// ---------------- patrol and scent ----------------
// A walk to somewhere along its ground (a Scent Post if the exhibit has one, half the time), then, there:
// sniffing, the flehmen grimace, spraying with the tail up, scraping with the hind feet or (at a post)
// clawing it. Males mark more.
function patrolStep(m, h, ctx, now, L) {
  if (m.juvenile) return startAct(m, now, ACT.sit, L.socialTicks, "patrol");
  if (!onFeet(m, now)) return;
  const post = ctx.posts.length && Math.random() < 0.5 ? ctx.posts[Math.floor(Math.random() * ctx.posts.length)] : undefined;
  const can = walker(ctx);
  let to;
  let face;
  if (post) {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = { x: post.pos.x + dx, y: post.pos.y, z: post.pos.z + dz };
      if (can(c)) {
        to = c;
        face = yawTo(-dx, -dz);
        break;
      }
    }
  }
  if (!to) {
    const here = cellOf(m.e.location);
    for (let k = 0; k < 12 && !to; k++) {
      const c = { x: here.x + between([-L.patrolReach, L.patrolReach]), y: here.y, z: here.z + between([-L.patrolReach, L.patrolReach]) };
      for (const dy of [0, 1, -1]) if (!to && can({ ...c, y: c.y + dy })) to = { ...c, y: c.y + dy };
    }
  }
  const mark = () => {
    const male = m.role === "male";
    const r = Math.random();
    let act = ACT.sniff;
    if (post) act = r < 0.35 ? ACT.sniff : r < 0.55 ? ACT.flehmen : r < 0.75 ? ACT.claw : r < 0.9 || !male ? ACT.scrape : ACT.spray;
    else if (r < (male ? 0.25 : 0.1)) act = Math.random() < 0.5 ? ACT.spray : ACT.scrape;
    startAct(m, system.currentTick, act, L.scentTicks, "patrol");
    // After sniffing a scent, the grimace now and then.
    if (act === ACT.sniff && Math.random() < 0.4) m.s.then = ACT.flehmen;
  };
  if (!to || !walkTo(m, ctx, to, { act: ACT.walk, pace: PACE.walk, face }, (ok) => (ok ? mark() : settle(m, system.currentTick, L)))) startAct(m, now, ACT.sniff, L.scentTicks, "patrol");
}

// ---------------- the roar ----------------
// The pride's chorus at dusk and before dawn: each grown one stands where it is, head low, and roars (the
// client's 12 s cycle: moans, the roars, the grunts); the cubs sit.
function roarStep(m, h, pride, ctx, now, L) {
  if (m.juvenile) return startAct(m, now, ACT.sit, L.socialTicks, "roar");
  if (now < h.roarAt) return startAct(m, now, ACT.alert, 20, "roar");
  startAct(m, now, ACT.roar, L.roarTicks, "roar");
  m.s.roarFrom = m.s.busyUntil;
}

// ---------------- cubs ----------------
// A cub keeps close to its mother: suckling at her belly while she nurses, playing with another cub, or
// lying against her.
function nursingMother(m, pride) {
  const mother = pride.find((o) => o.a && o.a.id === m.motherId);
  return mother && mother.s.phase === "act" && mother.s.act === ACT.nurse ? mother : undefined;
}

function cubStep(m, h, pride, ctx, now, L) {
  const mother = nursingMother(m, pride);
  if (mother && suckleStep(m, mother, ctx, now, L)) return true;
  if (h.mood === "play" || (h.mood === "social" && Math.random() < 0.5)) {
    startAct(m, now, ACT.play, L.playTicks, h.mood);
    return true;
  }
  if (mother && dist(m.e.location, mother.e.location) > L.cubStray && onFeet(m, now)) {
    const c = cellOf(mother.e.location);
    if (walkTo(m, ctx, c, { act: ACT.trot, pace: PACE.trot, stopShort: 1.2 }, () => settle(m, system.currentTick, L))) return true;
  }
  return false;
}

// Suckling at her belly while she nurses: beside her on the side she lies on (her right side down: her
// belly faces her left). False when there's no floor there.
function suckleStep(m, mother, ctx, now, L) {
  const yaw = mother.e.getRotation().y;
  const r = (yaw * Math.PI) / 180;
  const at = { x: mother.e.location.x - Math.cos(r) * L.suckleGap, z: mother.e.location.z - Math.sin(r) * L.suckleGap };
  const level = Math.floor(mother.e.location.y + 0.5);
  // Her belly's side may hang over a ledge's edge: the cub stands on the floor there, a block up or down.
  const cell = [0, -1, 1].map((dy) => ({ x: Math.floor(at.x), y: level + dy, z: Math.floor(at.z) })).find(walker(ctx));
  if (cell && dist(m.e.location, at) < 0.6) {
    startAct(m, now, ACT.nurse, mother.s.actUntil - now, "rest");
    return true;
  }
  if (cell) {
    if (onFeet(m, now)) walkTo(m, ctx, cell, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: cell.y, z: at.z }, face: (yaw + 90) % 360 }, () => {});
    return true;
  }
  // No floor at her belly (she lies against a wall): it lies against her or plays instead.
  return false;
}

// ---------------- what predators.js asks of a zoo lion ----------------
function intentStep(m, it, ctx, now, players, L) {
  const s = m.s;
  const e = m.e;
  if (it.kind === "den") {
    // Called into a Holding Den: up from where it lies, a trot to the door, and in.
    if (moving.get(m.id)?.why === "den") return true;
    if (!onFeet(m, now)) return true;
    const d = dist(e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
    if (d < 0.9) {
      arrivedAtDen(e);
      state.delete(m.id);
      return true;
    }
    const ok = walkTo(m, ctx, it.to, { act: ACT.trot, pace: PACE.trot, to: { x: it.to.x + 0.5, y: it.to.y, z: it.to.z + 0.5 }, why: "den" }, (done) => {
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
    // Crouched, ears flat, snarling, staring at them.
    moving.delete(m.id);
    if (s.act !== ACT.warn || s.phase !== "act") {
      if (!onFeet(m, now)) return true;
      startAct(m, now, ACT.warn, 400);
    }
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    s.actUntil = now + 20;
    return true;
  }
  if (it.kind === "charge") {
    // The rush: at the charge's pace straight at them (each half second a fresh way to where they are
    // now), then the swipe (predators.js lands it when it's within reach).
    const d = dist(e.location, p.location);
    if (d <= L.hunt.reach) {
      moving.delete(m.id);
      if (s.act !== ACT.swipe) startAct(m, now, ACT.swipe, TICKS.swipe + 6);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    if (!onFeet(m, now)) return true;
    chase(m, ctx, p, PACE.gallop, ACT.gallop, L);
    return true;
  }
  if (it.kind === "back") {
    // The swipe that landed (predators.js hit them as it came in): the strike plays out first.
    if (it.swiped && s.struck !== it.since) {
      s.struck = it.since;
      moving.delete(m.id);
      if (s.act !== ACT.swipe) startAct(m, now, ACT.swipe, TICKS.swipe + 4);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    // Backing off: a few steps away from them, then it stands and watches.
    if (moving.has(m.id) || (s.phase === "act" && now < s.actUntil)) return true;
    if (s.backed === it.since) {
      startAct(m, now, ACT.alert, 40);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    s.backed = it.since;
    if (!onFeet(m, now)) return true;
    // Straight away from them if there's floor there, else a little to one side or the other, or less far
    // (a fence or a ledge's edge behind it).
    const away = Math.atan2(e.location.z - p.location.z, e.location.x - p.location.x);
    const can = walker(ctx);
    let goal;
    for (const far of [L.backOff, L.backOff - 2, L.backOff - 3]) {
      for (const turn of [0, 30, -30, 60, -60, 90, -90]) {
        const a = away + (turn * Math.PI) / 180;
        const to = cellOf({ x: e.location.x + Math.cos(a) * far, y: e.location.y, z: e.location.z + Math.sin(a) * far });
        goal = [0, 1, -1].map((dy) => ({ ...to, y: to.y + dy })).find(can);
        if (goal) break;
      }
      if (goal) break;
    }
    if (!goal || !walkTo(m, ctx, goal, { act: ACT.trot, pace: PACE.trot, face: yaw }, () => startAct(m, system.currentTick, ACT.alert, 40))) startAct(m, now, ACT.alert, 40);
    return true;
  }
  return false;
}

// A short way toward the player (up to L.chaseSteps blocks), stopping short of them, glided at `pace`.
// aim: a point beside them to make for instead (a lioness fanning out on the stalk).
function chase(m, ctx, p, pace, act, L, aim = undefined) {
  const g = moving.get(m.id);
  const point = aim ?? p.location;
  const target = cellOf(point);
  // Still on its way to (about) the same spot at the same pace: carry on. A stalk that turns into the
  // charge, or a target that moved off, is a fresh way.
  if (g?.why === "chase" && g.act === act && g.target === keyOf(target) && Math.hypot(g.aim.x - point.x, g.aim.z - point.z) < 0.6 && g.s < g.end) return;
  const from = cellOf(m.e.location);
  const can = walker(ctx);
  let goal = target;
  if (!can(goal)) goal = [1, -1].map((dy) => ({ ...target, y: target.y + dy })).find(can) ?? target;
  const way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(ctx.read, c), from, goal, L.chaseSteps, L.chaseNodes);
  if (!way || !way.length) return;
  // To the very spot they stand on (not their block's middle), stopping just within reach of it.
  glide(m, way, { act, pace, why: "chase", to: { x: point.x, y: goal.y, z: point.z }, stopShort: L.hunt.reach * 0.8 }, () => {});
  const ng = moving.get(m.id);
  if (ng) {
    ng.target = keyOf(target);
    ng.aim = { x: point.x, z: point.z };
  }
}

// ---------------- the wild: a thrown Meat Ration ----------------
function baitStep(m, it, ctx, now, L) {
  if (it.kind === "eat") {
    // Eating it lying down, the meat between its paws: calm while it lasts.
    if (m.s.act !== ACT.eat) startAct(m, now, ACT.eat, 200);
    m.s.actUntil = now + 20;
    return true;
  }
  if (moving.get(m.id)?.why === "bait") return true;
  if (!onFeet(m, now)) return true;
  const d = dist(m.e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
  const eatNow = () => {
    if (ateBait(m.e, system.currentTick)) startAct(m, system.currentTick, ACT.eat, 200);
  };
  if (d < 1.2) {
    eatNow();
    return true;
  }
  // It stops with the meat between its forepaws (0.7 of a block ahead of it lying down).
  // No way to it: it leaves that meat be and hunts again. A walk cut short is tried again, a few times.
  const failed = () => {
    m.s.baitFails = (m.s.baitFails ?? 0) + 1;
    if (m.s.baitFails >= 3) {
      m.s.baitFails = 0;
      baitUnreachable(m.id);
    }
  };
  if (!walkTo(m, ctx, it.to, { act: ACT.trot, pace: PACE.trot, why: "bait", stopShort: 0.7 }, (ok) => (ok ? eatNow() : failed()))) {
    m.s.baitFails = 0;
    baitUnreachable(m.id);
  }
  return true;
}

// ---------------- the wild hunt ----------------
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
// How far off a lion spots this player now: by day L.hunt.spotDay, at dusk, by night and at dawn
// L.hunt.spotNight; half that for someone sneaking.
function spotRange(p, part, L) {
  const base = part === "day" || part === "midday" ? L.hunt.spotDay : L.hunt.spotNight;
  return p.isSneaking ? base * L.hunt.sneakFactor : base;
}

function huntStepLion(m, pride, ctx, now, players, part, L) {
  const s = m.s;
  const e = m.e;
  if (isCalm(m.id) || m.juvenile || peaceful()) {
    s.hunt = undefined;
    return false;
  }
  // The one it's after: whoever hurt it or its pride lately, else someone it (or a pride mate already
  // hunting) has spotted. Once on someone, it keeps after them until they're well out of range.
  let target;
  const grudge = [m, ...pride].map((o) => hurt.get(o.id)).find(Boolean);
  if (grudge) target = players.find((p) => p.id === grudge.playerId && vulnerable(p) && p.dimension.id === e.dimension.id);
  if (!target && s.hunt) {
    const p = players.find((q) => q.id === s.hunt.playerId);
    if (p && vulnerable(p) && p.dimension.id === e.dimension.id && dist(p.location, e.location) <= spotRange(p, part, L) + L.hunt.leaveSlack) target = p;
  }
  if (!target) {
    const mate = pride.find((o) => o !== m && o.s.hunt);
    const mp = mate && players.find((q) => q.id === mate.s.hunt.playerId);
    if (mp && vulnerable(mp) && dist(mp.location, e.location) <= spotRange(mp, part, L) + L.hunt.leaveSlack) target = mp;
  }
  if (!target) {
    let best;
    for (const p of players) {
      if (!vulnerable(p) || p.dimension.id !== e.dimension.id) continue;
      const d = dist(p.location, e.location);
      if (d <= spotRange(p, part, L) && Math.abs(p.location.y - e.location.y) < 8 && (!best || d < best.d)) best = { p, d };
    }
    target = best?.p;
  }
  if (!target) {
    if (s.hunt) {
      s.hunt = undefined;
      moving.delete(m.id);
      settle(m, now, L);
    }
    return false;
  }
  if (!s.hunt || s.hunt.playerId !== target.id) {
    s.hunt = { playerId: target.id, since: now, growled: false, chaseFrom: undefined, restUntil: 0 };
    spotted(target, m, L);
  }
  const H = s.hunt;
  const d = dist(target.location, e.location);
  const yaw = yawTo(target.location.x - e.location.x, target.location.z - e.location.z);
  // Winded after a long chase: it stands panting a while, watching, then comes on again.
  if (now < H.restUntil) {
    moving.delete(m.id);
    if (s.act !== ACT.alert) startAct(m, now, ACT.alert, H.restUntil - now);
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 20) });
    return true;
  }
  const step = huntStep(m.role, d, now - H.since, L);
  if (step !== "charge" && step !== "attack") H.chaseFrom = undefined;
  if (step === "attack") {
    moving.delete(m.id);
    if (!onFeet(m, now)) return true;
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    if (now >= (H.biteAt ?? 0)) {
      H.biteAt = now + L.hunt.biteTicks;
      startAct(m, now, ACT.swipe, TICKS.swipe + 4);
      bite(e, target, L);
    } else if (s.act !== ACT.swipe || now >= s.actUntil) startAct(m, now, ACT.warn, 10);
    return true;
  }
  if (step === "hold") {
    // A male holds back, roaring, then joins the charge.
    moving.delete(m.id);
    if (!onFeet(m, now)) return true;
    if (s.act !== ACT.roar) startAct(m, now, ACT.roar, L.hunt.maleHoldTicks);
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 20) });
    return true;
  }
  if (!onFeet(m, now)) return true;
  if (step === "stalk") {
    // Low and slow toward them; close enough, a low growl.
    if (!H.growled && d <= L.hunt.growlRange) {
      H.growled = true;
      try {
        e.dimension.playSound("mob.polarbear.warning", e.location, { volume: 0.6, pitch: 0.55 });
      } catch {
        // Cosmetic only.
      }
    }
    chase(m, ctx, target, PACE.stalk, ACT.stalk, L, flankOf(m, pride, target, d, L));
    return true;
  }
  // The charge, until it's winded.
  H.chaseFrom ??= now;
  if (now - H.chaseFrom > L.hunt.chaseTicks) {
    H.restUntil = now + L.hunt.restTicks;
    H.chaseFrom = undefined;
    return true;
  }
  chase(m, ctx, target, PACE.gallop, ACT.gallop, L);
  return true;
}

// Stalking, the lionesses fan out round the one they're after (the wings and the centre of a pride's
// hunt), so the charge comes in from several sides: each makes for a point beside them, out to its own
// side of the line from them to the hunting lionesses' middle (L.hunt.flankDeg between neighbours), at
// most chargeRange blocks off them. Undefined (straight at them) for a lone one, a male and a cub.
function flankOf(m, pride, p, d, L) {
  if (m.role === "male" || m.juvenile) return undefined;
  const on = pride.filter((o) => o.role !== "male" && !o.juvenile && (o === m || o.s.hunt?.playerId === p.id));
  if (on.length < 2) return undefined;
  const mid = on.reduce((c, o) => ({ x: c.x + o.e.location.x / on.length, z: c.z + o.e.location.z / on.length }), { x: 0, z: 0 });
  const bx = mid.x - p.location.x;
  const bz = mid.z - p.location.z;
  const len = Math.hypot(bx, bz);
  if (len < 1) return undefined;
  // In the order they already stand round them, so no two cross each other's way (ties by id).
  const side = (o) => Math.atan2(bx * (o.e.location.z - p.location.z) - bz * (o.e.location.x - p.location.x), bx * (o.e.location.x - p.location.x) + bz * (o.e.location.z - p.location.z));
  on.sort((a, b) => side(a) - side(b) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const ang = ((on.indexOf(m) - (on.length - 1) / 2) * L.hunt.flankDeg * Math.PI) / 180;
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const r = Math.min(L.hunt.chargeRange, Math.max(L.hunt.reach * 2, d * 0.7));
  return { x: p.location.x + ((bx * c - bz * s) / len) * r, y: p.location.y, z: p.location.z + ((bx * s + bz * c) / len) * r };
}

// The bite and swipe: 4 hearts and a shove.
function bite(e, p, L) {
  try {
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > L.hunt.reach + 0.75) return;
    p.applyDamage(L.hunt.damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * L.hunt.knock, z: (dz / len) * L.hunt.knock }, L.hunt.lift);
    e.dimension.playSound("mob.ravager.bite", e.location, { volume: 1, pitch: 1.05 });
  } catch {
    // gone
  }
}

// The first time a lion fixes on someone: a growl they can hear, and a line saying what's happening.
const warned = new Map(); // player id -> tick
function spotted(p, m, L) {
  try {
    const now = system.currentTick;
    if (now - (warned.get(p.id) ?? -10000) < L.hunt.tellEvery) return;
    warned.set(p.id, now);
    p.onScreenDisplay.setActionBar(`§cA ${m.role === "male" ? "lion" : "lioness"} has spotted you: back away, or sneak (they spot sneakers at half the distance)`);
  } catch {
    // gone
  }
}

// A wild lion hurt by a player (main.js, world.afterEvents.entityHurt): calm or not, it and its pride
// turn on whoever did it.
export function lionHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const L = BALANCE.lion;
  hurt.set(entity.id, { playerId: damager.id, until: system.currentTick + L.hunt.hurtTicks });
  hurtWild(entity.id);
}

// ---------------- gliding ----------------
export function tickLionMoves() {
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
        // Never into a block: stepping down off a ledge it keeps the ledge's height till it's over the
        // floor below; stepping up it gets up onto the block it's over.
        if (m.read(c.x, c.y, c.z) !== "air" && standable(m.read, { x: c.x, y: c.y + 1, z: c.z })) {
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
}

function finish(id, m, ok) {
  moving.delete(id);
  m.done(ok);
}

/**
 * Glide a lion through the blocks `cells` from where it stands, then `done(ok)`. opts: act, pace (blocks a
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
    turn: opts.pace >= PACE.gallop ? 18 : 12,
    yaw: e.getRotation().y,
    face: opts.face,
    why: opts.why,
    read,
    cell: keyOf(cellOf(from)),
    done,
  });
}

function walkTo(m, ctx, to, opts, then) {
  const L = BALANCE.lion;
  const way = findWay(walker(ctx), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? L.wildWalkSteps : L.walkSteps, ctx.wild ? L.wildNodes : Infinity);
  if (!way) return false;
  if (!way.length && !opts.to && opts.face === undefined) {
    then(true);
    return true;
  }
  glide(m, way, opts, then);
  return true;
}

// ---------------- the pride's sounds ----------------
// One pride's worth at a time: the roars (deep, carrying), a grunt or a snarl now and then while awake,
// a cub's mew at play, and the purr-like huffs of two rubbing heads.
function sounds(h, pride, now, L) {
  const S = h.sound;
  try {
    for (const m of pride) {
      if (m.s.act !== ACT.roar || now < m.s.busyUntil) continue;
      // The client's 12 s cycle: moans, then a roar about every 1.4 s, then grunts every 0.6 s. (This runs
      // every half second, so each sound is due from a time, not on an exact tick.)
      const t = (now - (m.s.roarFrom ?? m.s.busyUntil)) % 240;
      const cycle = now - t;
      if (m.s.roarCycle !== cycle) {
        m.s.roarCycle = cycle;
        m.s.roarNext = cycle + 50;
        m.s.gruntNext = cycle + 194;
      }
      if (t < 190 && now >= m.s.roarNext) {
        m.s.roarNext += 28;
        m.e.dimension.playSound("mob.ravager.roar", m.e.location, { volume: 3, pitch: m.role === "male" ? 0.62 : 0.75 });
      }
      if (t >= 194 && now >= m.s.gruntNext) {
        m.s.gruntNext += 12;
        m.e.dimension.playSound("mob.polarbear.warning", m.e.location, { volume: 1.2, pitch: 0.5 });
      }
    }
    const awake = pride.filter((m) => m.s.posture < 3 && m.s.act !== ACT.roar);
    if (awake.length && now >= (S.idle ??= now + between(L.idleEvery))) {
      S.idle = now + between(L.idleEvery);
      const m = awake[Math.floor(Math.random() * awake.length)];
      m.e.dimension.playSound(m.juvenile ? "mob.cat.meow" : "mob.polarbear.idle", m.e.location, { volume: 0.5, pitch: m.juvenile ? 0.8 : 0.6 });
    }
    const play = pride.find((m) => m.s.act === ACT.play);
    if (play && now >= (S.play ?? 0)) {
      S.play = now + 60;
      play.e.dimension.playSound("mob.cat.meow", play.e.location, { volume: 0.4, pitch: 1.1 });
    }
  } catch {
    // Cosmetic only.
  }
}

// What a lion is doing, for the Field Journal (its zoocraft:act).
export function lionAct(entity) {
  try {
    return entity.getProperty(ACT_PROP) ?? 0;
  } catch {
    return 0;
  }
}

export function initLions() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        lionHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_lion"] },
  );
}
