import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS } from "../data/items.js";
import { db } from "../persistence/db.js";
import { on } from "../core/events.js";
import { animalFromEntity, animalsIn, getAnimal, liveEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { reachesFeeder } from "../equipment/rules.js";
import { findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward } from "./zebraRules.js";
import { dayPart } from "./lionRules.js";
import { ACT, DOWN_ACTS, WATER_ACTS, TICKS, CROC_TYPES, scaleOf, bodyOf, growStage, paceOf, floatY, pickMood, bankPlaces, sizeOrder, meet, huntStepCroc, SPOTTED_LINE } from "./crocRules.js";
import { intentOf, clearIntent, arrivedAtDen, isDenned, ateBait, baitUnreachable, isCalm, hurtWild } from "./predators.js";
import { nestsIn, today } from "./nursery.js";
import { reportError } from "../core/log.js";

// Crocodiles (0.1.77, Big predators; spec 5.2 "crocodile | Crocodile | Basking and submerged resting | Secure
// keeper access, shore clearance"; the rules are in animals/crocRules.js). Every half second, for the
// crocodiles near players: each has its own mood for a while. Basking, it hauls out onto the sunny bank (the
// biggest takes the spot nearest the water) and lies there with its jaws gaping; at the hottest time it gapes in
// the shade; it lies at the waterline half out, the back end in the water; it floats with only its eyes,
// nostrils and a line of scutes out, drifting now and then; it sinks backward, tail first, and rests on the
// bottom of the deep water, then rises nose first; it cruises along the shore, the tail sculling; a grown male
// at dawn and dusk, with a female about, displays in the water (the head and tail lifted, the bellow, a jaw
// slap, bubbles), and in the breeding season rubs jaws with her. Into the water it goes by a belly slide down
// the bank; out of it, a high walk up the bank and a flop onto its belly. Rain keeps them in the water; nights
// are in the water. A smaller one meeting a bigger one lifts its snout and moves off (two grown males of about
// a size face up, hissing). About once a week (animals/welfare.js marks the meal) a grown one comes to the
// feeder, snaps the meat off it, takes it into the water, death-rolls to tear it and tosses its head to
// swallow. An expecting female digs her nest in the sand with her hind feet and lies guarding it; when the
// young hatch she picks each up in her jaws and carries it to the water, and they keep near her (chirping).
// All of that is the client's (gen/croc_anim.py) through the zoocraft:act property; walks, slides and swims
// glide a tick at a time (tickCrocMoves) at the client's stride speeds, through the exhibit's measured floor and
// water or open ground and water in the wild. In water 2 deep it floats (its zoocraft:afloat body: no gravity,
// held at the surface by the script, its eyes just out) or lies on the bottom.
// animals/predators.js decides the dangerous parts and this module carries them out, as animals/lion.js and
// animals/tiger.js do: one called to a Holding Den hauls out and walks up to its door; one warning a player off
// rears up in the threat gape, puffed up, hissing (in the water it faces them, eyes up), then charges (a belly run
// on land, a fast swim in the water) and snaps sideways, then backs off. A wild crocodile hunts players from the
// water (Austin, 2026-10-15: "Also make them very dangerous in the wild"): see huntCroc. A wild one tempted by a
// thrown Meat Ration comes out to it and gulps it down, calm, so it can be crated.

const RANGE = 48; // blocks from a player: a crocodile this close is stepped
const KEEP_RANGE = 56; // and kept while it's this close
const ACT_PROP = "zoocraft:act";
const GROW_PROP = "zoocraft:grow";

const state = new Map(); // entity id -> { phase, act, posture, busyUntil, actUntil, cool, body, mood, moodUntil, place, hunt }
const moving = new Map(); // entity id -> a glide
const held = new Map(); // entity id -> what it holds in its jaws: { e (a hatchling's mob or a player), player, since }
const carried = new Set(); // hatchling animal ids carried to the water already (or being carried)
const hurt = new Map(); // wild entity id -> { playerId, until }: hurt by this player, it turns on them
const banks = new Map(); // exhibit id -> { at, places: Map animal id -> spot }
const met = new Map(); // "id|id" -> tick: two crocodiles that met (one gave way) lately
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
const mid = (c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 });

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
// Standing: open at its feet and over its back, on a floor (a crocodile is low: a block of headroom).
function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
// The water's surface block: water, open over it.
function surface(read, c) {
  return read(c.x, c.y, c.z) === "water" && read(c.x, c.y + 1, c.z) === "air";
}
// Deep enough to float and go under (2 deep: water under the surface block too).
function deepAt(read, c) {
  return surface(read, c) && read(c.x, c.y - 1, c.z) === "water";
}
function headroom(read, c) {
  return read(c.x, c.y + 1, c.z) === "air" || read(c.x, c.y + 1, c.z) === "water";
}
function openAt(read) {
  return (c) => read(c.x, c.y, c.z) === "air" || read(c.x, c.y, c.z) === "water";
}
// The water column it's in, from wherever in it (the surface block up to 4 above, the bottom below): { top,
// bottom } (the surface block's y and the lowest water block's), or undefined out of the water.
function columnAt(read, x, y, z) {
  for (let dy = -1; dy <= 4; dy++) {
    const c = { x, y: y + dy, z };
    if (!surface(read, c)) continue;
    let b = c.y;
    while (b > c.y - 12 && read(x, b - 1, z) === "water") b--;
    return { top: c.y, bottom: b };
  }
  return undefined;
}
// Where a crocodile may go: its exhibit's measured floor (not up on its feeders and fixtures) and the surface of
// its water, or open ground and water in the wild. dry: land only.
function walker(ctx, dry = false) {
  if (!ctx.wild) return (c) => (ctx.cells?.get(keyOf(c)) === "land" && !ctx.onTop.has(keyOf(c))) || (!dry && ctx.cells?.get(keyOf(c)) === "water" && surface(ctx.read, c));
  return (c) => standable(ctx.read, c) || (!dry && surface(ctx.read, c));
}
// Through the water only (its surface).
function swimmer(ctx) {
  if (!ctx.wild) return (c) => ctx.cells?.get(keyOf(c)) === "water" && surface(ctx.read, c);
  return (c) => surface(ctx.read, c);
}

// A crocodile's size: its scale (a female of the middle class 0.5) from its record, or a wild one's mob.
function scaleFor(e, a) {
  if (a) {
    return scaleOf(bodyOf(a, SPECIES[a.speciesId]?.breeding?.matureDays));
  }
  let male = false;
  let size = 2;
  try {
    male = (e.getComponent("minecraft:mark_variant")?.value ?? 0) === 1;
    size = Number(e.getProperty("zoocraft:size") ?? 2);
  } catch {
    // a female of the middle size
  }
  return scaleOf({ juvenile: false, male, size });
}
// Its nose, from its origin, in blocks: the head's tip 47 model units ahead in the standing pose, 16 to a
// block at scale 1 (gen/crocodile.py).
const noseAhead = (scale) => (47 * scale) / 16;

// Is it raining in the overworld (crocodiles keep to the water)? The script API has no stable weather getter, so
// the weather changes are kept (and saved on the world, for after a reload).
let raining = false;

// ---------------- the half-second tick ----------------
export function tickCrocs(now) {
  const T = BALANCE.croc;
  const players = onlinePlayers();
  let part = "day";
  let rain = false;
  try {
    part = dayPart(world.getTimeOfDay());
    rain = raining;
  } catch {
    // keeps the day, dry
  }
  const seen = new Set();
  const near = new Map();
  const zoo = new Map();
  const wild = [];
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, KEEP_RANGE, CROC_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      const d = Math.hypot(e.location.x - player.location.x, e.location.y - player.location.y, e.location.z - player.location.z);
      if (d < (near.get(e.id) ?? Infinity)) near.set(e.id, d);
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_crocodile") {
        wild.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit" || isDenned(a.id)) {
        // shut in a Holding Den: still, hidden, the den's
        state.delete(e.id);
        moving.delete(e.id);
        continue;
      }
      const list2 = zoo.get(a.location.id) ?? [];
      list2.push({ e, a });
      zoo.set(a.location.id, list2);
    }
  }
  const close = (b) => /** @type {number} */ (near.get(b.e.id)) <= (state.has(b.e.id) ? KEEP_RANGE : RANGE);
  for (const [exId, members] of zoo) {
    const ex = getExhibit(exId);
    if (!ex || !members.some(close)) {
      for (const b of members) seen.delete(b.e.id);
      continue;
    }
    const ctx = zooContext(ex, SPECIES[members[0].a.speciesId], members[0].e, members, now, part, rain);
    for (const b of members) stepOne(b, ctx, now, players, part, T);
  }
  for (const b of wild) {
    if (!close(b)) {
      seen.delete(b.e.id);
      continue;
    }
    const ctx = { wild: true, species: SPECIES["zoocraft:crocodile"], read: memoRead(b.e.dimension), cells: undefined, onTop: new Set(), feeders: [], deep: [], shallow: [], banks: [], bankSpots: [], shadeSpots: [], nests: [], members: [b], part, rain, places: new Map() };
    stepOne(b, ctx, now, players, part, T);
  }
  // Out of everyone's range: forgotten, and back to walking where the engine takes it.
  for (const [id] of [...state]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
    letGo(id);
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
  for (const [id, h] of [...hurt]) if (now > h.until) hurt.delete(id);
  for (const [k, t] of [...met]) if (now - t > T.meetEvery) met.delete(k);
  for (const id of [...banks.keys()]) if (!zoo.has(id)) banks.delete(id);
}

function stepOne(b, ctx, now, players, part, T) {
  const m = member(b, now);
  try {
    stepCroc(m, ctx, now, players, part, T);
  } catch (error) {
    moving.delete(m.id);
    const why = String(error);
    if (!reported.has(why)) {
      reported.add(why);
      reportError("croc", error);
    }
  }
  sounds(m, now, T);
}

function member({ e, a }, now) {
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", act: ACT.none, posture: "stand", busyUntil: 0, actUntil: 0, cool: now + between([0, 40]), body: undefined, mood: undefined, moodUntil: 0, place: undefined, hunt: undefined };
    state.set(e.id, s);
  }
  const scale = scaleFor(e, a);
  return { id: e.id, e, a, s, scale, juvenile: Boolean(a?.juvenile), male: a ? a.sex === "male" : isWildMale(e), motherId: a?.parents?.[0] };
}
function isWildMale(e) {
  try {
    return (e.getComponent("minecraft:mark_variant")?.value ?? 0) === 1;
  } catch {
    return false;
  }
}

// What a zoo crocodile has to work with: the measured floor and water (deep enough to float and go under, and
// the shallows), the banks it gets in and out by, its sunny basking bank and shade (from the measure), the
// feeders holding meat, the nests, and who takes which basking spot. The ground's parts are worked out once a
// minute (or when the exhibit is measured again): they read many blocks.
const grounds = new Map(); // exhibit id -> { cells, at, deep, shallow, banks }
function zooContext(ex, species, e, members, now, part, rain) {
  const T = BALANCE.croc;
  const read = memoRead(e.dimension);
  const cells = cellsOf(ex.id);
  const all = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  const fixtures = fixturesOf(ex);
  const onTop = new Set([...all, ...fixtures].map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  const feeders = all.filter((f) => f.units > 0 && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
  let g = grounds.get(ex.id);
  if (!g || g.cells !== cells || now - g.at > 1200) {
    g = { cells, at: now, deep: [], shallow: [], banks: [] };
    if (cells) {
      for (const [k, v] of cells) {
        const [x, y, z] = k.split(",").map(Number);
        const c = { x, y, z };
        if (v === "water" && surface(read, c)) (deepAt(read, c) ? g.deep : g.shallow).push(c);
      }
      // Banks: floor right beside the water's surface (level with it or a block up), where it gets in and out.
      const water = new Set([...g.deep, ...g.shallow].map(keyOf));
      for (const [k, v] of cells) {
        if (v !== "land" || onTop.has(k)) continue;
        const [x, y, z] = k.split(",").map(Number);
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const w = [0, -1].map((dy) => ({ x: x + dx, y: y + dy, z: z + dz })).find((c) => water.has(keyOf(c)));
          if (w) {
            g.banks.push({ c: { x, y, z }, water: w, face: yawTo(dx, dz) });
            break;
          }
        }
      }
    }
    grounds.set(ex.id, g);
  }
  const bankSpots = (ex.sunBankSpots ?? []).map(([x, y, z, d]) => ({ x, y, z, d })).filter((c) => !onTop.has(keyOf(c)));
  const shadeSpots = (ex.shadeSpots ?? []).map(([x, y, z, d]) => ({ x, y, z, d })).filter((c) => !onTop.has(keyOf(c)));
  // The basking bank in size order (worked out again every few minutes, or when the crocodiles change).
  const ids = members.map((b) => b.a.id).sort().join(",");
  let bk = banks.get(ex.id);
  if (!bk || bk.ids !== ids || now - bk.at > 2400 || bk.n !== bankSpots.length) {
    bk = { at: now, ids, n: bankSpots.length, places: bankPlaces(members.filter((b) => !b.a.juvenile).map((b) => b.a), bankSpots, T) };
    banks.set(ex.id, bk);
  }
  return { wild: false, ex, species, read, cells, onTop, feeders, deep: g.deep, shallow: g.shallow, banks: g.banks, bankSpots, shadeSpots, nests: nestsIn(ex.id), members, part, rain, places: bk.places };
}

// ---------------- one crocodile ----------------
function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}
// Its body: "move" (the engine walks it), "still" (lying, standing put, or carried by a glide on land) or
// "afloat" (in water 2 deep: no gravity, held at the surface or on the bottom by the script).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(how === "move" ? "zoocraft:move" : how === "afloat" ? "zoocraft:afloat" : "zoocraft:still");
  s.body = how;
}

// The posture an act puts it in (the client's controller): "down" (lying: lie_down 1 s, get_up 1.2 s), "threat"
// (reared up on its legs for the threat gape, the snap and snapping meat off a feeder: rear 0.3 s, drop 0.35 s),
// "water" (in the water: blended, no lying down or getting up) or "stand".
function postureOf(act, wet) {
  if (act === ACT.under || WATER_ACTS.includes(act)) return "water";
  if (act === ACT.none && wet) return "water";
  if (DOWN_ACTS.includes(act)) return "down";
  if (act === ACT.warn || act === ACT.snap || act === ACT.feed) return "threat";
  return "stand";
}
// Ticks the client takes from one posture to another.
function postureTicks(from, to) {
  if (from === to || from === "water" || to === "water") return 0;
  const up = from === "down" ? TICKS.up : from === "threat" ? TICKS.drop : 0;
  const down = to === "down" ? TICKS.down : to === "threat" ? TICKS.rear : 0;
  return up + down;
}

// Doing `act` where it is (getting into the posture for it first), for `ticks`.
function startAct(m, now, act, ticks, why = undefined) {
  const s = m.s;
  const wet = inWater(m);
  const to = postureOf(act, wet);
  const start = Math.max(now, s.busyUntil);
  s.busyUntil = start + postureTicks(s.posture, to);
  s.posture = to;
  s.phase = "act";
  s.act = act;
  s.why = why;
  s.then = undefined; // whatever was to follow an act it no longer does (the caller sets its own after this)
  s.actUntil = s.busyUntil + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.actFrom = s.busyUntil;
  body(m.e, s, wet ? "afloat" : "still");
  setAct(m.e, act);
}

// Back to nothing in particular: on its feet on land (the engine walks it a little), floating in the water.
function settle(m, now, T) {
  const s = m.s;
  const wet = inWater(m);
  const to = wet ? "water" : "stand";
  const start = Math.max(now, s.busyUntil);
  s.busyUntil = start + postureTicks(s.posture, to);
  s.posture = to;
  s.phase = "idle";
  s.act = ACT.none;
  s.why = undefined;
  s.then = undefined;
  s.cool = s.busyUntil + between(T.coolTicks);
  if (wet) {
    body(m.e, s, "afloat");
    holdAtSurface(m);
    setAct(m.e, ACT.float);
    s.act = ACT.float;
  } else {
    body(m.e, s, "move");
    setAct(m.e, ACT.none);
  }
}

// On its feet and ready to walk (getting up first if it isn't): false while it's still getting up. In the
// water there's nothing to get up from.
function onFeet(m, now) {
  const s = m.s;
  if (s.posture === "down" || s.posture === "threat") {
    s.busyUntil = Math.max(now, s.busyUntil) + postureTicks(s.posture, "stand");
    s.posture = "stand";
    s.act = ACT.none;
    setAct(m.e, ACT.none);
    body(m.e, s, "still");
  }
  return now >= s.busyUntil;
}

// In the water (deep or shallow) where it is now.
function inWater(m) {
  try {
    const read = blockReader(m.e.dimension);
    const l = m.e.location;
    return Boolean(columnAt(read, Math.floor(l.x), Math.floor(l.y), Math.floor(l.z)));
  } catch {
    return false;
  }
}
function inDeep(m) {
  try {
    const read = blockReader(m.e.dimension);
    const l = m.e.location;
    const col = columnAt(read, Math.floor(l.x), Math.floor(l.y), Math.floor(l.z));
    return Boolean(col && col.top > col.bottom);
  } catch {
    return false;
  }
}
// Floating: held at the surface, the eyes just out (crocRules floatY).
function holdAtSurface(m) {
  try {
    const read = blockReader(m.e.dimension);
    const l = m.e.location;
    const col = columnAt(read, Math.floor(l.x), Math.floor(l.y), Math.floor(l.z));
    if (!col || col.top === col.bottom) return;
    m.e.teleport({ x: l.x, y: floatY(col.top, m.scale), z: l.z }, { keepVelocity: false });
  } catch {
    // gone
  }
}

function stepCroc(m, ctx, now, players, part, T) {
  const s = m.s;
  growLook(m);
  // A carry cut short (a warning, a charge, a den call took her walk to the water): she puts the hatchling
  // down where she is, and may come back for it.
  if (s.carrying && moving.get(m.id)?.act !== ACT.carry) {
    letGo(m.id);
    carried.delete(s.carrying);
    s.carrying = undefined;
  }
  // A zoo crocodile: what predators.js wants of it first (a den, a player inside the exhibit).
  const it = ctx.wild ? undefined : intentOf(m.id);
  if (it && intentStep(m, it, ctx, now, players, T)) return;
  // Rain: one lying out (or on its way to) goes back into the water now, not when its mood runs out.
  if (ctx.rain && (ctx.wild || ctx.deep.length > 0) && (s.mood === "bask" || s.mood === "shade" || s.mood === "halfout")) {
    s.moodUntil = now;
    if (s.phase === "act" && (s.act === ACT.bask || s.act === ACT.lie || s.act === ACT.halfout)) s.actUntil = now;
  }
  if (ctx.wild) {
    const b = intentOf(m.id); // a thrown Meat Ration
    if (b && (b.kind === "bait" || b.kind === "eat") && baitStep(m, b, ctx, now, T)) return;
    if (huntCroc(m, ctx, now, players, part, T)) return;
  }
  if (held.has(m.id) && !s.carrying) letGo(m.id); // holding nothing it should
  if (moving.has(m.id)) return;
  if (now < s.busyUntil) return;
  // Something that follows on from what it just did (the swallow after the roll, rising after resting on the
  // bottom...): s.then, called when the act ends.
  if (s.phase === "act" && now < s.actUntil) {
    if (s.act === ACT.float && now >= (s.driftAt ?? Infinity)) drift(m, ctx, now, T);
    return;
  }
  if (s.phase === "act" && s.then) {
    const next = s.then;
    s.then = undefined;
    return next(now);
  }
  if (s.phase === "act" || s.phase === "glide") settle(m, now, T);
  if (now < s.cool) return;
  if (!ctx.wild && m.a) {
    // About once a week: the meal (animals/welfare.js marks it on the record).
    if (!m.juvenile && mealStep(m, ctx, now, T)) return;
    // An expecting female digs her nest and guards it; when the young hatch, she carries them to the water.
    if (!m.juvenile && nestStep(m, ctx, now, T)) return;
    if (m.juvenile && crecheStep(m, ctx, now, T)) return;
    if (meetStep(m, ctx, now, T)) return;
  }
  if (now >= s.moodUntil || !s.mood) {
    s.mood = pickMood(part, { bank: ctx.wild ? true : ctx.bankSpots.length > 0 && (m.juvenile || ctx.places.has(m.a.id)), deep: ctx.wild ? true : ctx.deep.length > 0, shade: ctx.wild ? false : ctx.shadeSpots.length > 0, display: !m.juvenile && m.male && (part === "dawn" || part === "dusk") && (ctx.wild || ctx.members.some((b) => !b.a.juvenile && b.a.sex !== "male")), rain: ctx.rain }, T);
    s.moodUntil = now + between(T.moodTicks);
    s.place = undefined;
  }
  switch (s.mood) {
    case "bask":
      return lieOut(m, ctx, now, T, "bask");
    case "shade":
      return lieOut(m, ctx, now, T, "shade");
    case "halfout":
      return halfOut(m, ctx, now, T);
    case "float":
      return floatStep(m, ctx, now, T);
    case "submerge":
      return submerge(m, ctx, now, T);
    case "swim":
      return swimStep(m, ctx, now, T);
    case "display":
      return displayStep(m, ctx, now, T);
  }
}

// A young one's look grows with it: zoocraft:grow 0 (a hatchling) to 4 (nearly grown), by the days it has left.
function growLook(m) {
  if (!m.juvenile || !m.a) return;
  const sp = SPECIES[m.a.speciesId];
  const want = growStage(m.a.juvenileDaysLeft ?? sp?.breeding?.matureDays ?? 1, sp?.breeding?.matureDays ?? 1);
  try {
    if (m.e.getProperty(GROW_PROP) !== want) m.e.triggerEvent(`zoocraft:grow_${want}`);
  } catch {
    // gone
  }
}

// ---------------- lying out: basking and the shade ----------------
// Its place on the bank: its own basking spot (the bank in size order: the biggest nearest the water), facing
// the water; or a shady spot near the water; a young one near its mother. Then up the bank (out of the water
// first), and down onto its belly there, gaping.
function lieOut(m, ctx, now, T, kind) {
  const s = m.s;
  if (s.posture === "down" && s.place?.kind === kind) return startAct(m, now, kind === "bask" || Math.random() < 0.7 ? ACT.bask : ACT.lie, T.lieTicks, kind);
  let at;
  if (ctx.wild) at = landNear(ctx, cellOf(m.e.location), 4);
  else if (m.juvenile) at = nearMother(m, ctx, kind === "bask" ? ctx.bankSpots : ctx.shadeSpots, T);
  else if (kind === "bask") at = ctx.places.get(m.a.id);
  else at = pickFree(ctx.shadeSpots, m);
  if (!at) return floatStep(m, ctx, now, T);
  const water = nearestWater(ctx, at);
  const face = water ? yawTo(water.x - at.x, water.z - at.z) : Math.floor(Math.random() * 4) * 90;
  s.place = { kind, cell: at, face };
  const lie = () => startAct(m, system.currentTick, kind === "bask" || Math.random() < 0.7 ? ACT.bask : ACT.lie, T.lieTicks, kind);
  const here = cellOf(m.e.location);
  if (here.x === at.x && here.z === at.z && !inWater(m)) return turnThen(m, face, lie);
  if (!onFeet(m, now)) return;
  if (!walkTo(m, ctx, at, { act: m.juvenile && Math.random() < 0.3 ? ACT.gallop : ACT.walk, pace: paceOf(m.juvenile && Math.random() < 0.3 ? "gallop" : "walk", m.scale), to: mid(at), face, dry: true }, (ok) => (ok ? lie() : settle(m, system.currentTick, T)))) lie();
}

// Half out at the waterline: on a bank block beside the water, facing up the bank, its back end over the water.
function halfOut(m, ctx, now, T) {
  const s = m.s;
  if (s.posture === "down" && s.place?.kind === "halfout") return startAct(m, now, ACT.halfout, T.lieTicks, "halfout");
  const list = ctx.wild ? wildBanks(ctx, cellOf(m.e.location)) : ctx.banks;
  const pool = m.juvenile && !ctx.wild ? list.filter((b) => mother(m, ctx) && dist(b.c, mother(m, ctx).e.location) <= T.crecheRange) : list;
  const b = pickFree(pool.map((x) => ({ ...x.c, bank: x })), m)?.bank;
  if (!b) return floatStep(m, ctx, now, T);
  const face = (b.face + 180) % 360; // its back to the water
  const r = (b.face * Math.PI) / 180;
  const back = 0.45; // its middle a little out over the edge
  const to = { x: b.c.x + 0.5 - Math.sin(r) * back, y: b.c.y, z: b.c.z + 0.5 + Math.cos(r) * back };
  s.place = { kind: "halfout", cell: b.c, face };
  const lie = () => startAct(m, system.currentTick, ACT.halfout, T.lieTicks, "halfout");
  if (!onFeet(m, now)) return;
  if (!walkTo(m, ctx, b.c, { act: ACT.walk, pace: paceOf("walk", m.scale), to, face, dry: true }, (ok) => (ok ? lie() : settle(m, system.currentTick, T)))) lie();
}

// ---------------- in the water ----------------
// Floating: into the deep water (sliding down the bank from where it lay), to a spot of its own, and floating
// there eyes-up; drifting now and then.
function floatStep(m, ctx, now, T, act = ACT.float, ticks = T.floatTicks, why = "float") {
  const s = m.s;
  if (inDeep(m) && s.posture === "water") {
    holdAtSurface(m);
    startAct(m, now, act, ticks, why);
    s.driftAt = now + between(T.driftEvery);
    return;
  }
  const at = waterSpot(m, ctx, T);
  if (!at) return lieOut(m, ctx, now, T, "shade");
  intoWater(m, ctx, now, T, at, () => {
    holdAtSurface(m);
    startAct(m, system.currentTick, act, ticks, why);
    m.s.driftAt = system.currentTick + between(T.driftEvery);
  });
}

// A deep spot to float at: its own (away from the others), near its mother for a young one, in the wild the
// nearest deep water.
function waterSpot(m, ctx, T) {
  if (ctx.wild) return deepNear(ctx, cellOf(m.e.location), 8);
  const list = ctx.deep.length ? ctx.deep : ctx.shallow;
  if (m.juvenile) return nearMother(m, ctx, list, T) ?? pickFree(list, m);
  return pickFree(list, m);
}

// Into the water and over to `to` (a surface cell): from lying on the bank, a belly slide down into it; from its
// feet, a walk in; in the water already, a swim. Then `then()`.
function intoWater(m, ctx, now, T, to, then) {
  const s = m.s;
  if (inWater(m)) return swimTo(m, ctx, to, { act: ACT.swim, pace: paceOf("swim", m.scale) }, (ok) => (ok ? then() : settle(m, system.currentTick, T)));
  const way = findWay(walker(ctx), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? T.wildWalkSteps : T.walkSteps, ctx.wild ? T.wildNodes : Infinity);
  if (!way) return settle(m, now, T);
  if (s.posture === "down") {
    // The slide: lying as it is, down the bank (slide pace) to the water's edge, then swimming on.
    const first = way.findIndex((c) => surface(ctx.read, c));
    const land = first < 0 ? way : way.slice(0, first + 1);
    s.act = ACT.slide;
    setAct(m.e, ACT.slide);
    glide(m, land, { act: ACT.slide, pace: T.slidePace / 20, why: "slide" }, (ok) => {
      if (!ok) return settle(m, system.currentTick, T);
      m.s.posture = "water";
      const rest = first < 0 ? [] : way.slice(first + 1);
      if (!rest.length) return then();
      glide(m, rest, { act: ACT.swim, pace: paceOf("swim", m.scale) }, (ok2) => (ok2 ? then() : settle(m, system.currentTick, T)));
    });
    try {
      m.e.dimension.playSound("random.splash", m.e.location, { volume: 0.4, pitch: 0.7 });
    } catch {
      // Cosmetic only.
    }
    return;
  }
  if (!onFeet(m, now)) {
    // Getting down off its rear (the feeder's snap) first: in once it's on its feet, and then on as it was to.
    s.then = (t) => intoWater(m, ctx, t, T, to, then);
    return;
  }
  glide(m, way, { act: ACT.walk, pace: paceOf("walk", m.scale) }, (ok) => (ok ? then() : settle(m, system.currentTick, T)));
}

// Drifting a little: a slow swim to a deep spot nearby, then floating on.
function drift(m, ctx, now, T) {
  const s = m.s;
  s.driftAt = now + between(T.driftEvery);
  const here = cellOf(m.e.location);
  const can = swimmer(ctx);
  for (let k = 0; k < 8; k++) {
    const c = { x: here.x + between([-4, 4]), y: here.y, z: here.z + between([-4, 4]) };
    const w = [0, -1, 1].map((dy) => ({ ...c, y: c.y + dy })).find((n) => can(n) && deepAt(ctx.read, n));
    if (!w || taken(w, m)) continue;
    const until = s.actUntil;
    swimTo(m, ctx, w, { act: ACT.swim, pace: paceOf("swim", m.scale) * 0.6 }, () => {
      holdAtSurface(m);
      startAct(m, system.currentTick, ACT.float, Math.max(20, until - system.currentTick), s.why);
      m.s.driftAt = system.currentTick + between(T.driftEvery);
    });
    return;
  }
}

// Resting on the bottom: out over the deep water, it sinks backward, tail first, lies on the bottom a long
// while, then rises nose first and floats.
function submerge(m, ctx, now, T) {
  const s = m.s;
  if (!inDeep(m)) {
    const at = waterSpot(m, ctx, T);
    if (!at || !deepAt(ctx.read, at)) return floatStep(m, ctx, now, T);
    return intoWater(m, ctx, now, T, at, () => submerge(m, ctx, system.currentTick, T));
  }
  const l = m.e.location;
  const col = columnAt(ctx.read, Math.floor(l.x), Math.floor(l.y), Math.floor(l.z));
  if (!col || col.top === col.bottom) return floatStep(m, ctx, now, T);
  startAct(m, now, ACT.sink, TICKS.sink, "submerge");
  dive(m, floatY(col.top, m.scale), col.bottom, TICKS.sink);
  s.then = (t) => {
    startAct(m, t, ACT.under, T.underTicks, "submerge");
    m.s.then = (t2) => {
      startAct(m, t2, ACT.rise, TICKS.rise, "submerge");
      dive(m, col.bottom, floatY(col.top, m.scale), TICKS.rise);
      m.s.then = (t3) => floatStep(m, ctx, t3, T);
    };
  };
}

// Straight down (or up) in the water from y0 to y1 over `ticks`, where it is.
function dive(m, y0, y1, ticks) {
  const l = m.e.location;
  moving.set(m.id, { e: m.e, st: m.s, scale: m.scale, kind: "dive", x: l.x, z: l.z, y0, y1, t: 0, ticks, yaw: m.e.getRotation().y, done: () => {} });
}

// A swim: along the water to the far side of it (as far as it can reach), the legs back, the tail sculling.
function swimStep(m, ctx, now, T) {
  if (!inWater(m)) {
    const at = waterSpot(m, ctx, T);
    if (!at) return lieOut(m, ctx, now, T, "bask");
    return intoWater(m, ctx, now, T, at, () => swimStep(m, ctx, system.currentTick, T));
  }
  const here = cellOf(m.e.location);
  const list = ctx.wild ? [] : (m.juvenile && mother(m, ctx) ? ctx.deep.filter((c) => dist(c, mother(m, ctx).e.location) <= T.crecheRange) : ctx.deep);
  let to;
  if (list.length) {
    const far = [...list].sort((p, q) => dist(q, here) - dist(p, here)).slice(0, 8);
    to = far[Math.floor(Math.random() * far.length)];
  } else to = deepNear(ctx, { x: here.x + between([-8, 8]), y: here.y, z: here.z + between([-8, 8]) }, 4);
  if (!to) return floatStep(m, ctx, now, T);
  swimTo(m, ctx, to, { act: ACT.swim, pace: paceOf("swim", m.scale) }, () => floatStep(m, ctx, system.currentTick, T, ACT.float, T.floatTicks, "swim"));
}

// A grown male's display (dawn and dusk, in the water, a female about): floating, the head and tail lifted, the
// bellow, the jaw slap, the bubbles (sounds below); in the breeding season, now and then he swims over to a
// female floating near and they rub jaws.
function displayStep(m, ctx, now, T) {
  if (!inDeep(m)) return floatStep(m, ctx, now, T, ACT.display, T.displayTicks, "display");
  if (!ctx.wild && ctx.ex.breeding?.on && Math.random() < T.rubChance) {
    const her = ctx.members.find((b) => b.a.sex !== "male" && !b.a.juvenile && !b.a.expecting && state.get(b.e.id)?.act === ACT.float && dist(b.e.location, m.e.location) <= T.rubRange);
    if (her) {
      const hs = /** @type {any} */ (state.get(her.e.id));
      const yaw = yawTo(her.e.location.x - m.e.location.x, her.e.location.z - m.e.location.z);
      const at = { x: her.e.location.x - Math.sin((yaw * Math.PI) / 180) * -1.4, z: her.e.location.z - Math.cos((yaw * Math.PI) / 180) * 1.4 };
      return swimTo(m, ctx, cellOf({ ...at, y: her.e.location.y }), { act: ACT.swim, pace: paceOf("swim", m.scale), face: yaw }, () => {
        const t = system.currentTick;
        startAct(m, t, ACT.rub, T.rubTicks, "display");
        hs.mood = "float";
        hs.actUntil = t;
        const hm = member(her, t);
        turnThen(hm, (yaw + 180) % 360, () => startAct(hm, system.currentTick, ACT.rub, T.rubTicks, "float"));
      });
    }
  }
  holdAtSurface(m);
  startAct(m, now, ACT.display, T.displayTicks, "display");
}

// ---------------- the meal ----------------
// About once a week a grown crocodile eats (animals/welfare.js: a.mealTick, the tick it ate). When a player is
// near: up to the feeder in a high walk, reared up to snap the meat off it, then into the water with it, the
// death roll to tear it, and the head tosses to swallow. The meal itself is the record's: this is what players
// see.
function mealStep(m, ctx, now, T) {
  const a = m.a;
  if (a.mealTick === undefined || now - a.mealTick > T.mealShowTicks || m.s.mealShown === a.mealTick) return false;
  m.s.mealShown = a.mealTick;
  const reach = noseAhead(m.scale) - 0.3;
  const can = walker(ctx, true);
  const sides = [];
  for (const f of ctx.feeders.length ? ctx.feeders : ctx.ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean)) {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const at = { x: f.pos.x + 0.5 + dx * reach, z: f.pos.z + 0.5 + dz * reach };
      const c = { x: Math.floor(at.x), y: f.pos.y, z: Math.floor(at.z) };
      const nearC = { x: f.pos.x + dx, y: f.pos.y, z: f.pos.z + dz };
      if (can(c) && can(nearC)) sides.push({ at, c, face: yawTo(-dx, -dz) });
    }
  }
  if (!sides.length) return false;
  if (!onFeet(m, now)) return true;
  const { at, c, face } = sides[Math.floor(Math.random() * sides.length)];
  const roll = (t) => {
    startAct(m, t, ACT.roll, T.rollTicks, "meal");
    m.s.then = (t2) => {
      startAct(m, t2, ACT.swallow, T.swallowTicks, "meal");
      m.s.then = (t3) => floatStep(m, ctx, t3, T);
    };
  };
  const snap = () => {
    startAct(m, system.currentTick, ACT.feed, T.feedTicks, "meal");
    m.s.then = (t) => {
      // Into the water with it: the nearest deep spot.
      const w = nearestDeep(ctx, cellOf(m.e.location));
      if (!w) return roll(t);
      intoWater(m, ctx, t, T, w, () => roll(system.currentTick));
    };
  };
  walkTo(m, ctx, c, { act: ACT.walk, pace: paceOf("walk", m.scale), to: { x: at.x, y: c.y, z: at.z }, face, dry: true }, (ok) => (ok ? snap() : settle(m, system.currentTick, T)));
  return true;
}

// ---------------- the nest ----------------
// Her nest (animals/nursery.js keeps the record and the Crocodile Nest block): on the first day she digs it with
// her hind feet (lying beside it); then she lies by it guarding, head up, most of the time; when the young
// hatch she carries each to the water in her jaws.
function nestStep(m, ctx, now, T) {
  const a = m.a;
  const day = today();
  const rec = ctx.nests.find((n) => n.motherId === a.id && n.kind === "sand");
  if (!rec) return false;
  const hatched = rec.hatchDay !== undefined;
  if (hatched) return day - rec.hatchDay <= 1 && carryStep(m, rec, ctx, now, T);
  if (!a.expecting || a.expecting.nestId !== rec.id) return false;
  // Where she lies: beside the nest (the block next to it nearest the water), facing it.
  const nest = rec.pos;
  const can = walker(ctx, true);
  let spot;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const c = [0, 1, -1].map((dy) => ({ x: nest.x + dx, y: nest.y + dy, z: nest.z + dz })).find(can);
    if (c && (!spot || (nearestWater(ctx, c)?.d ?? 99) < (nearestWater(ctx, spot.c)?.d ?? 99))) spot = { c, face: yawTo(-dx, -dz) };
  }
  if (!spot) return false;
  const here = cellOf(m.e.location);
  const there = here.x === spot.c.x && here.z === spot.c.z;
  if (there && m.s.posture === "down") {
    // Dug on the first day; then guarding (now and then a while in the water, close by).
    if (rec.day === day && !m.s.dug?.includes(rec.id)) {
      m.s.dug = [...(m.s.dug ?? []), rec.id];
      startAct(m, now, ACT.dig, T.digTicks, "nest");
      return true;
    }
    startAct(m, now, ACT.guard, T.guardTicks, "nest");
    return true;
  }
  if (Math.random() < T.guardLeave && m.s.why === "nest") return false; // a while in the water
  if (!onFeet(m, now)) return true;
  const lie = () => {
    const t = system.currentTick;
    if (rec.day === day && !m.s.dug?.includes(rec.id)) {
      m.s.dug = [...(m.s.dug ?? []), rec.id];
      return startAct(m, t, ACT.dig, T.digTicks, "nest");
    }
    startAct(m, t, ACT.guard, T.guardTicks, "nest");
  };
  const step = (spot.face + 90) % 360; // lying alongside the nest, her head by it
  if (!walkTo(m, ctx, spot.c, { act: ACT.walk, pace: paceOf("walk", m.scale), to: mid(spot.c), face: step, dry: true }, (ok) => (ok ? lie() : settle(m, system.currentTick, T)))) return false;
  return true;
}

// The hatching: she picks up each hatchling still on land near the nest in her jaws (it hangs limp), carries it
// to the water and lets it go in the shallows with a swing of the head.
function carryStep(m, rec, ctx, now, T) {
  if (m.s.carrying) return true;
  const young = ctx.members.filter((b) => b.a.juvenile && b.a.parents?.[0] === m.a.id && !carried.has(b.a.id) && !inWaterAt(ctx, b.e.location) && dist(b.e.location, rec.pos) <= 5);
  if (!young.length) return false;
  const y = young.reduce((p, q) => (dist(p.e.location, m.e.location) < dist(q.e.location, m.e.location) ? p : q));
  if (!onFeet(m, now)) return true;
  const pick = () => {
    const t = system.currentTick;
    carried.add(y.a.id);
    const ym = member(y, t);
    moving.delete(ym.id);
    startAct(ym, t, ACT.carried, 2000, "carried");
    held.set(m.id, { e: y.e, player: false, since: t });
    m.s.carrying = y.a.id;
    const w = nearestBank(ctx, cellOf(m.e.location));
    const drop = () => {
      const t2 = system.currentTick;
      letGo(m.id);
      m.s.carrying = undefined;
      // Let go in the water in front of her: a swing of the head (the snap's).
      const r = (m.e.getRotation().y * Math.PI) / 180;
      const at = { x: m.e.location.x - Math.sin(r) * (noseAhead(m.scale) + 0.4), y: m.e.location.y, z: m.e.location.z + Math.cos(r) * (noseAhead(m.scale) + 0.4) };
      try {
        const col = columnAt(ctx.read, Math.floor(at.x), Math.floor(at.y), Math.floor(at.z));
        // Not water in front of her and no floor there (a fence, a wall): down at her side instead.
        const spot = col || standable(ctx.read, cellOf(at)) ? at : m.e.location;
        y.e.teleport({ x: spot.x, y: col ? floatY(col.top, ym.scale) : spot.y, z: spot.z }, { keepVelocity: false });
      } catch {
        // gone
      }
      startAct(ym, t2, ACT.float, 60, "float");
      startAct(m, t2, ACT.alert, 20, "nest");
    };
    if (!w) return drop();
    // No way to the water from here: she lets it go where she stands (it finds the water itself).
    if (!walkTo(m, ctx, w.c, { act: ACT.carry, pace: paceOf("walk", m.scale), to: mid(w.c), face: w.face, dry: true }, () => drop())) drop();
  };
  if (!walkTo(m, ctx, cellOf(y.e.location), { act: ACT.walk, pace: paceOf("walk", m.scale), stopShort: noseAhead(m.scale) - 0.2, dry: true }, (ok) => (ok ? turnThen(m, yawTo(y.e.location.x - m.e.location.x, y.e.location.z - m.e.location.z), pick) : settle(m, system.currentTick, T)))) return false;
  return true;
}

// ---------------- the young ----------------
// The hatchlings keep near their mother (a crèche): within T.crecheRange of her, floating in the shallows and
// basking on the bank by her; they gallop back to her when they've strayed, and chirp now and then.
function crecheStep(m, ctx, now, T) {
  const s = m.s;
  if (carried.has(m.a.id) && s.act === ACT.carried) return true; // in her jaws
  const mom = mother(m, ctx);
  if (Math.random() < T.chirpChance) {
    startAct(m, now, ACT.chirp, T.chirpTicks, "chirp");
    return true;
  }
  if (!mom || dist(m.e.location, mom.e.location) <= T.crecheRange) return false;
  if (inWater(m)) {
    const to = cellOf(mom.e.location);
    const w = swimmer(ctx)(to) ? to : deepNear(ctx, to, 3) ?? nearestWater(ctx, to);
    if (w) return swimTo(m, ctx, w, { act: ACT.swim, pace: paceOf("swim", m.scale) * 1.5, stopShort: 1.5 }, () => settle(m, system.currentTick, T)) || false;
    return false;
  }
  if (!onFeet(m, now)) return true;
  return walkTo(m, ctx, cellOf(mom.e.location), { act: ACT.gallop, pace: paceOf("gallop", m.scale), stopShort: 1.5 }, () => settle(m, system.currentTick, T));
}

function mother(m, ctx) {
  return m.motherId ? ctx.members.find((b) => b.a.id === m.motherId) : undefined;
}
function nearMother(m, ctx, list, T) {
  const mom = mother(m, ctx);
  if (!mom) return undefined;
  const near = list.filter((c) => dist(c, mom.e.location) <= T.crecheRange && !taken(c, m));
  return near.length ? near[Math.floor(Math.random() * near.length)] : undefined;
}

// ---------------- rank ----------------
// Two grown crocodiles meeting (within T.meetRange): the smaller lifts its snout (submission) and moves off;
// two grown males of about one size face up, hissing, and the smaller backs away.
function meetStep(m, ctx, now, T) {
  if (m.juvenile || Math.random() > T.meetChance) return false;
  for (const b of ctx.members) {
    if (b.a.id === m.a.id || b.a.juvenile || dist(b.e.location, m.e.location) > T.meetRange) continue;
    const k = [m.a.id, b.a.id].sort().join("|");
    if (met.has(k)) continue;
    const r = meet(m.a, b.a);
    if (!r || r.yields !== m.a.id) continue;
    met.set(k, now);
    const yaw = yawTo(b.e.location.x - m.e.location.x, b.e.location.z - m.e.location.z);
    const away = () => {
      const t = system.currentTick;
      // Off a few blocks, away from the bigger one.
      const here = cellOf(m.e.location);
      const ax = Math.round(Math.sin((yaw * Math.PI) / 180) * 4);
      const az = Math.round(-Math.cos((yaw * Math.PI) / 180) * 4);
      const go = { x: here.x + ax, y: here.y, z: here.z + az };
      const can = walker(ctx);
      const to = [0, 1, -1].map((dy) => ({ ...go, y: go.y + dy })).find(can);
      if (to) {
        if (inWater(m)) swimTo(m, ctx, to, { act: ACT.swim, pace: paceOf("swim", m.scale) }, () => settle(m, system.currentTick, T));
        else walkTo(m, ctx, to, { act: ACT.walk, pace: paceOf("walk", m.scale) }, () => settle(m, system.currentTick, T));
      } else settle(m, t, T);
    };
    const show = r.show === "face" || !inWater(m) ? ACT.warn : ACT.snoutLift;
    turnThen(m, yaw, () => {
      startAct(m, system.currentTick, show, T.snoutTicks, "meet");
      m.s.then = () => away();
      if (show === ACT.warn) hiss(m.e, 0.8);
    });
    return true;
  }
  return false;
}

// ---------------- what predators.js asks of a zoo crocodile ----------------
function intentStep(m, it, ctx, now, players, T) {
  const s = m.s;
  const e = m.e;
  if (it.kind === "den") {
    // Called into a Holding Den: out of the water, a high walk to the door, and in.
    if (moving.get(m.id)?.why === "den") return true;
    if (!onFeet(m, now)) return true;
    const d = dist(e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
    if (d < 0.9) {
      arrivedAtDen(e);
      state.delete(m.id);
      return true;
    }
    const ok = walkTo(m, ctx, it.to, { act: ACT.walk, pace: paceOf("walk", m.scale) * 1.6, to: { x: it.to.x + 0.5, y: it.to.y, z: it.to.z + 0.5 }, why: "den" }, (done) => {
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
  const wet = inDeep(m);
  if (it.kind === "warn") {
    // The threat gape: reared up, puffed, the jaws wide, hissing (predators.js plays the hiss); in the water it
    // floats facing them, eyes up.
    moving.delete(m.id);
    const act = wet ? ACT.float : ACT.warn;
    if (s.act !== act || s.phase !== "act") {
      if (!wet && !onFeet(m, now)) return true;
      if (wet) holdAtSurface(m); // eyes up (from partway down a dive, or the bottom)
      startAct(m, now, act, 400, "danger");
    }
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    s.actUntil = now + 20;
    return true;
  }
  if (it.kind === "charge") {
    // The rush: a belly run on land, a fast swim in the water, then the snap (predators.js lands it).
    const d = dist(e.location, p.location);
    if (d <= BALANCE.predators.danger.reach + noseAhead(m.scale) * 0.5) {
      moving.delete(m.id);
      if (s.act !== ACT.snap) startAct(m, now, ACT.snap, TICKS.snap + 6, "danger");
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    if (!wet && !onFeet(m, now)) return true;
    chase(m, ctx, p, wet ? paceOf("swimFast", m.scale) : paceOf("belly", m.scale), wet ? ACT.swimFast : ACT.belly, T);
    return true;
  }
  if (it.kind === "back") {
    if (it.swiped && s.struck !== it.since) {
      s.struck = it.since;
      moving.delete(m.id);
      if (s.act !== ACT.snap) startAct(m, now, ACT.snap, TICKS.snap + 4, "danger");
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    // Backing off: away from them (toward the water on land), then it watches.
    if (moving.has(m.id) || (s.phase === "act" && now < s.actUntil)) return true;
    if (s.backed === it.since) {
      startAct(m, now, wet ? ACT.float : ACT.alert, 40, "danger");
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    s.backed = it.since;
    if (!wet && !onFeet(m, now)) return true;
    const away = Math.atan2(e.location.z - p.location.z, e.location.x - p.location.x);
    const can = walker(ctx);
    let goal;
    for (const far of [T.backOff, T.backOff - 2, T.backOff - 3]) {
      for (const turn of [0, 30, -30, 60, -60, 90, -90]) {
        const a = away + (turn * Math.PI) / 180;
        const to = cellOf({ x: e.location.x + Math.cos(a) * far, y: e.location.y, z: e.location.z + Math.sin(a) * far });
        goal = [0, 1, -1].map((dy) => ({ ...to, y: to.y + dy })).find(can);
        if (goal) break;
      }
      if (goal) break;
    }
    if (!goal || !walkTo(m, ctx, goal, { act: ACT.walk, pace: paceOf("walk", m.scale) * 1.6, face: yaw }, () => startAct(m, system.currentTick, inDeep(m) ? ACT.float : ACT.alert, 40, "danger"))) startAct(m, now, wet ? ACT.float : ACT.alert, 40, "danger");
    return true;
  }
  return false;
}

// A short way toward the player (up to T.chaseSteps blocks), stopping short of them, at `pace`.
function chase(m, ctx, p, pace, act, T, stopShort = undefined) {
  const g = moving.get(m.id);
  const point = p.location;
  const target = cellOf(point);
  if (g?.why === "chase" && g.act === act && g.target === keyOf(target) && Math.hypot(g.aim.x - point.x, g.aim.z - point.z) < 0.6 && g.s < g.end) return true;
  const from = cellOf(m.e.location);
  const can = walker(ctx);
  let goal = target;
  if (!can(goal)) goal = [1, -1, -2].map((dy) => ({ ...target, y: target.y + dy })).find(can) ?? target;
  let way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(ctx.read, c), from, goal, T.chaseSteps, T.chaseNodes);
  let part = false;
  if (!way) {
    const d = Math.hypot(goal.x - from.x, goal.z - from.z);
    if (d > 16) {
      const mid2 = { x: Math.floor(from.x + ((goal.x - from.x) * 16) / d), y: from.y, z: Math.floor(from.z + ((goal.z - from.z) * 16) / d) };
      const step = [0, 1, -1, 2, -2].map((dy) => ({ ...mid2, y: mid2.y + dy })).find(can);
      if (step) way = findWay(can, (c) => headroom(ctx.read, c), from, step, T.chaseSteps, T.chaseNodes);
      part = Boolean(way);
    }
  }
  if (!way || !way.length) return false;
  glide(m, way, part ? { act, pace, why: "chase" } : { act, pace, why: "chase", to: { x: point.x, y: goal.y, z: point.z }, stopShort: stopShort ?? noseAhead(m.scale) * 0.8 }, () => {});
  const ng = moving.get(m.id);
  if (ng) {
    ng.target = keyOf(target);
    ng.aim = { x: point.x, z: point.z };
  }
  return true;
}

// ---------------- the wild: a thrown Meat Ration ----------------
// Out to the meat (swimming or walking), and gulped down with tosses of the head: calm while it lasts.
function baitStep(m, it, ctx, now, T) {
  if (it.kind === "eat") {
    if (m.s.why !== "bait") startAct(m, now, inWater(m) ? ACT.swallow : ACT.feed, 200, "bait");
    m.s.actUntil = now + 20;
    return true;
  }
  if (moving.get(m.id)?.why === "bait") return true;
  if (!inWater(m) && !onFeet(m, now)) return true;
  const d = dist(m.e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 });
  const eatNow = () => {
    if (ateBait(m.e, system.currentTick)) {
      startAct(m, system.currentTick, inWater(m) ? ACT.swallow : ACT.feed, 200, "bait");
      try {
        m.e.dimension.playSound("random.eat", m.e.location, { volume: 0.8, pitch: 0.5 });
      } catch {
        // Cosmetic only.
      }
    }
  };
  if (d < noseAhead(m.scale)) {
    eatNow();
    return true;
  }
  const failed = () => {
    m.s.baitFails = (m.s.baitFails ?? 0) + 1;
    if (m.s.baitFails >= 3) {
      m.s.baitFails = 0;
      baitUnreachable(m.id);
    }
  };
  if (!walkTo(m, ctx, it.to, { act: ACT.walk, pace: paceOf("walk", m.scale) * 2, why: "bait", stopShort: noseAhead(m.scale) - 0.3 }, (ok) => (ok ? eatNow() : failed()))) {
    m.s.baitFails = 0;
    baitUnreachable(m.id);
  }
  return true;
}

// ---------------- the wild ambush ----------------
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
// How far off a crocodile spots this player now: by day T.hunt.spotDay, at dusk, by night and at dawn
// T.hunt.spotNight; half that for someone sneaking.
function spotRange(p, part, T) {
  const base = part === "day" || part === "midday" ? T.hunt.spotDay : T.hunt.spotNight;
  return p.isSneaking ? base * T.hunt.sneakFactor : base;
}
// How far from `at` the nearest water's surface is (across the ground, up to `reach`; Infinity when none).
function waterDist(read, at, reach) {
  const c0 = cellOf(at);
  let best = Infinity;
  for (let dx = -reach; dx <= reach; dx++)
    for (let dz = -reach; dz <= reach; dz++) {
      const d = Math.hypot(dx, dz);
      if (d >= best || d > reach) continue;
      for (const dy of [0, -1, -2, 1]) if (surface(read, { x: c0.x + dx, y: c0.y + dy, z: c0.z + dz })) {
        best = d;
        break;
      }
    }
  return best;
}
function inWaterAt(ctx, p) {
  return Boolean(columnAt(ctx.read, Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)));
}

/**
 * A wild crocodile, each half second, with someone about (animals/crocRules.js huntStepCroc decides): from the
 * water it sinks and swims under toward the bank nearest them, surfacing eyes-only to check now and then; when
 * they're near enough to it and to the water it lunges out, bites, holds on, drags them in and rolls; hitting it
 * makes it let go. A swimmer it chases under the water. On the bank it gapes and hisses at anyone coming close,
 * snaps at anyone closer, and otherwise slides into the water and hunts from there; hurt on land, it chases a
 * little way, then goes back.
 */
function huntCroc(m, ctx, now, players, part, T) {
  const s = m.s;
  const e = m.e;
  if (isCalm(m.id) || peaceful()) {
    if (s.hunt) endHunt(m, now, T);
    return false;
  }
  // The one it's after: whoever hurt it lately, else the one it's on, else the nearest it spots.
  let target;
  const grudge = hurt.get(m.id);
  if (grudge) target = players.find((p) => p.id === grudge.playerId && vulnerable(p) && p.dimension.id === e.dimension.id);
  if (!target && s.hunt) {
    const p = players.find((q) => q.id === s.hunt.playerId);
    if (p && vulnerable(p) && p.dimension.id === e.dimension.id && dist(p.location, e.location) <= spotRange(p, part, T) + T.hunt.leaveSlack) target = p;
  }
  if (!target) {
    let best;
    for (const p of players) {
      if (!vulnerable(p) || p.dimension.id !== e.dimension.id) continue;
      const d = dist(p.location, e.location);
      if (d <= spotRange(p, part, T) && Math.abs(p.location.y - e.location.y) < 6 && (!best || d < best.d)) best = { p, d };
    }
    target = best?.p;
  }
  if (!target) {
    if (s.hunt) endHunt(m, now, T);
    return false;
  }
  if (!s.hunt || s.hunt.playerId !== target.id) {
    if (s.hunt) endHunt(m, now, T);
    s.hunt = { playerId: target.id };
    spotted(target, T);
  }
  const wet = inWater(m);
  const d = Math.hypot(target.location.x - e.location.x, target.location.z - e.location.z);
  // A hit it hasn't answered yet (each hit once): holding someone it lets go; on land it chases them.
  const fresh = Boolean(grudge && grudge.at > (s.hurtSeen ?? -1));
  if (fresh) s.hurtSeen = grudge.at;
  const see = {
    dist: d,
    playerToWater: waterDist(ctx.read, target.location, T.hunt.lungeWater + 1),
    inWater: wet,
    toWater: wet ? 0 : waterDist(ctx.read, e.location, T.hunt.landReach + 1),
    swimming: Boolean(columnAt(ctx.read, Math.floor(target.location.x), Math.floor(target.location.y + 0.3), Math.floor(target.location.z))) && !standable(ctx.read, cellOf(target.location)),
    hurt: fresh,
  };
  // Still holding someone it shouldn't (gone, out of reach): let go.
  const h = held.get(m.id);
  if (h?.player && (!h.e.isValid || !vulnerable(h.e) || Math.hypot(h.e.location.x - e.location.x, h.e.location.z - e.location.z) > noseAhead(m.scale) + 2.5)) see.hurt = true;
  const was = s.hunt.phase;
  const H = huntStepCroc(s.hunt.phase ? s.hunt : undefined, see, now, T);
  s.hunt = { ...H, playerId: target.id };
  const yaw = yawTo(target.location.x - e.location.x, target.location.z - e.location.z);
  switch (H.step) {
    case "stalk":
    case "check": {
      if (H.step === "check" || (was === "stalk" && moving.get(m.id)?.why === "check")) {
        // Up to look: eyes out, facing them, a moment.
        moving.delete(m.id);
        holdAtSurface(m);
        startAct(m, now, ACT.float, T.hunt.checkTicks, "hunt");
        e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 40) });
        return true;
      }
      if (s.phase === "act" && s.why === "hunt" && s.act === ACT.float && now < s.actUntil) return true;
      // Under the water toward the bank nearest them.
      const to = waterNearest(ctx, target.location, 8);
      if (!to) return true;
      if (moving.get(m.id)?.why === "stalk" && moving.get(m.id).target === keyOf(to)) return true;
      swimTo(m, ctx, to, { act: ACT.swim, pace: T.hunt.stalkPace / 20, why: "stalk", under: true, stopShort: 0.5 }, () => {});
      const g = moving.get(m.id);
      if (g) g.target = keyOf(to);
      if (now >= (s.bubbleAt ?? 0)) {
        s.bubbleAt = now + 40;
        try {
          e.dimension.playSound("bubble.pop", e.location, { volume: 0.4, pitch: 0.8 });
        } catch {
          // Cosmetic only.
        }
      }
      return true;
    }
    case "lunge": {
      if (was === "lunge") return true; // in the air
      moving.delete(m.id);
      e.setRotation({ x: 0, y: yaw });
      startAct(m, now, ACT.lunge, TICKS.lunge + 2, "hunt");
      const to = { x: target.location.x, y: e.location.y, z: target.location.z };
      const len = Math.min(T.hunt.lungeRange, Math.max(0.5, dist(to, e.location) - noseAhead(m.scale) * 0.7));
      const r = Math.atan2(to.z - e.location.z, to.x - e.location.x);
      const end = { x: e.location.x + Math.cos(r) * len, y: target.location.y, z: e.location.z + Math.sin(r) * len };
      glide(m, [cellOf(end)], { act: ACT.lunge, pace: T.hunt.lungePace / 20, why: "lunge", to: end, keepAct: true }, () => {});
      try {
        e.dimension.playSound("random.splash", e.location, { volume: 1.2, pitch: 0.6 });
      } catch {
        // Cosmetic only.
      }
      return true;
    }
    case "grab": {
      // The bite, and it holds on.
      moving.delete(m.id);
      e.setRotation({ x: 0, y: yaw });
      startAct(m, now, ACT.snap, TICKS.snap, "hunt");
      if (bite(e, target, T.hunt.biteDamage, noseAhead(m.scale) + 1.5)) held.set(m.id, { e: target, player: true, since: now });
      return true;
    }
    case "drag": {
      // Walking backward into the water with them.
      if (!held.has(m.id)) {
        s.hunt = { ...s.hunt, phase: "retreat", retreatUntil: now + T.hunt.missTicks };
        return true;
      }
      if (moving.get(m.id)?.why === "drag") return true;
      const w = deepNear(ctx, cellOf(e.location), 6) ?? waterNearest(ctx, e.location, 6);
      if (!w) return true;
      const way = findWay(walker(ctx), (c) => headroom(ctx.read, c), cellOf(e.location), w, T.wildWalkSteps, T.wildNodes);
      if (way?.length) glide(m, way, { act: ACT.drag, pace: T.hunt.dragPace / 20, why: "drag", backward: true }, () => {});
      return true;
    }
    case "roll":
      if (s.act !== ACT.roll) {
        moving.delete(m.id);
        holdAtSurface(m);
        startAct(m, now, ACT.roll, 400, "hunt");
      }
      return true;
    case "rollBite":
      if (s.act !== ACT.roll) startAct(m, now, ACT.roll, 400, "hunt");
      if (held.get(m.id)?.player) bite(e, held.get(m.id).e, T.hunt.rollDamage, noseAhead(m.scale) + 2.5);
      return true;
    case "release":
    case "miss":
    case "retreat": {
      if (held.has(m.id)) letGo(m.id);
      if (moving.get(m.id)?.why === "retreat") return true;
      if (s.retreated === H.retreatUntil) {
        if (s.phase !== "act" || now >= s.actUntil) {
          if (inDeep(m)) {
            holdAtSurface(m);
            startAct(m, now, ACT.float, 40, "hunt");
          } else startAct(m, now, ACT.alert, 20, "hunt");
        }
        return true;
      }
      s.retreated = H.retreatUntil;
      // Back under the water, away from them.
      const away = Math.atan2(e.location.z - target.location.z, e.location.x - target.location.x);
      const far = cellOf({ x: e.location.x + Math.cos(away) * 8, y: e.location.y, z: e.location.z + Math.sin(away) * 8 });
      const to = deepNear(ctx, far, 5) ?? waterNearest(ctx, far, 6);
      if (to) {
        if (wet) swimTo(m, ctx, to, { act: ACT.swim, pace: paceOf("swim", m.scale) * 2, why: "retreat", under: true }, () => {});
        else walkTo(m, ctx, to, { act: ACT.walk, pace: paceOf("walk", m.scale) * 2, why: "retreat" }, () => {});
      }
      return true;
    }
    case "warn":
      // On the bank: up on its legs, gaping, hissing.
      moving.delete(m.id);
      if (s.act !== ACT.warn || s.phase !== "act") {
        if (!onFeet(m, now)) return true;
        startAct(m, now, ACT.warn, 400, "hunt");
      }
      s.actUntil = now + 20;
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      if (now >= (s.hissAt ?? 0)) {
        s.hissAt = now + 50;
        hiss(e, 1.2);
      }
      return true;
    case "slide": {
      if (moving.get(m.id)?.why === "slide" || moving.get(m.id)?.why === "toWater") return true;
      const w = deepNear(ctx, cellOf(e.location), 8) ?? waterNearest(ctx, e.location, 8);
      if (!w) return false; // no water: it lies where it is
      intoWater(m, ctx, now, T, w, () => {
        holdAtSurface(m);
        startAct(m, system.currentTick, ACT.float, 20, "hunt");
      });
      const g = moving.get(m.id);
      if (g && g.why === undefined) g.why = "toWater";
      return true;
    }
    case "chase":
      // After a swimmer, under the water, faster than they can swim.
      chase(m, ctx, target, T.hunt.swimChase / 20, ACT.swimFast, T, 0.6);
      return true;
    case "landChase":
      if (!onFeet(m, now)) return true;
      chase(m, ctx, target, T.hunt.landChasePace / 20, ACT.belly, T, 0.6);
      return true;
  }
  return false;
}

function endHunt(m, now, T) {
  const s = m.s;
  letGo(m.id);
  s.hunt = undefined;
  moving.delete(m.id);
  settle(m, now, T);
}

// A bite that lands if they're still within `reach`: damage, and the bite's sound.
function bite(e, p, damage, reach) {
  try {
    if (!e.isValid || !p.isValid || !vulnerable(p)) return false;
    const len = Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z);
    if (len > reach) return false;
    p.applyDamage(damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    e.dimension.playSound("mob.ravager.bite", e.location, { volume: 1.2, pitch: 0.8 });
    return true;
  } catch {
    return false;
  }
}

function hiss(e, volume) {
  try {
    e.dimension.playSound("mob.cat.hiss", e.location, { volume, pitch: 0.35 });
  } catch {
    // Cosmetic only.
  }
}

// The first time a crocodile fixes on someone: a line saying what's happening.
const warned = new Map(); // player id -> tick
function spotted(p, T) {
  try {
    const now = system.currentTick;
    if (now - (warned.get(p.id) ?? -10000) < T.hunt.tellEvery) return;
    warned.set(p.id, now);
    p.onScreenDisplay.setActionBar(SPOTTED_LINE);
  } catch {
    // gone
  }
}

// A wild crocodile hurt by a player (world.afterEvents.entityHurt): it lets go of whoever it holds, and turns on
// whoever hurt it.
export function crocHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const T = BALANCE.croc;
  const now = system.currentTick;
  hurt.set(entity.id, { playerId: damager.id, until: now + T.hunt.hurtTicks, at: now });
  hurtWild(entity.id);
}

// ---------------- places ----------------
// A spot from `list` ({ x, y, z }) not taken by another crocodile's place or body.
function pickFree(list, m) {
  const free = list.filter((c) => !taken(c, m));
  return free.length ? free[Math.floor(Math.random() * free.length)] : undefined;
}
function taken(c, m) {
  for (const [id, o] of state) {
    if (id === m.id) continue;
    const at = o.place?.cell;
    if (at && Math.abs(at.x - c.x) < 2 && Math.abs(at.z - c.z) < 2) return true;
  }
  for (const [id, g] of moving) if (id !== m.id && g.goal && Math.abs(g.goal.x - c.x) < 2 && Math.abs(g.goal.z - c.z) < 2) return true;
  return false;
}
function nearestOf(list, at) {
  let best;
  for (const c of list) {
    const d = dist(c, at);
    if (!best || d < best.d) best = { ...c, d };
  }
  return best;
}
function nearestWater(ctx, at) {
  if (ctx.wild) {
    const w = waterNearest(ctx, at, 8);
    return w ? { ...w, d: dist(w, at) } : undefined;
  }
  return nearestOf([...ctx.deep, ...ctx.shallow], at);
}
function nearestDeep(ctx, at) {
  if (ctx.wild) return deepNear(ctx, at, 8);
  return nearestOf(ctx.deep, at) ?? nearestOf(ctx.shallow, at);
}
function nearestBank(ctx, at) {
  if (ctx.wild) return wildBanks(ctx, at)[0];
  let best;
  for (const b of ctx.banks) {
    const d = dist(b.c, at);
    if (!best || d < best.d) best = { ...b, d };
  }
  return best;
}
// In the wild: the water surface cell nearest `at` within `reach` (scanned), deep ones only for deepNear.
function waterNearest(ctx, at, reach, deep = false) {
  const c0 = cellOf(at);
  let best;
  for (let dx = -reach; dx <= reach; dx++)
    for (let dz = -reach; dz <= reach; dz++) {
      const d = Math.hypot(dx, dz);
      if (d > reach || (best && d >= best.d)) continue;
      for (const dy of [0, -1, -2, 1]) {
        const c = { x: c0.x + dx, y: c0.y + dy, z: c0.z + dz };
        if (deep ? deepAt(ctx.read, c) : surface(ctx.read, c)) {
          best = { c, d };
          break;
        }
      }
    }
  return best?.c;
}
function deepNear(ctx, at, reach) {
  return waterNearest(ctx, at, reach, true);
}
function landNear(ctx, at, reach) {
  for (let r = 1; r <= reach; r++)
    for (let k = 0; k < 8; k++) {
      const c = { x: at.x + between([-r, r]), y: at.y, z: at.z + between([-r, r]) };
      const n = [0, 1, -1].map((dy) => ({ ...c, y: c.y + dy })).find((q) => standable(ctx.read, q) && waterDist(ctx.read, q, 3) <= 3);
      if (n) return n;
    }
  return undefined;
}
function wildBanks(ctx, at) {
  const out = [];
  for (let dx = -6; dx <= 6; dx++)
    for (let dz = -6; dz <= 6; dz++)
      for (const dy of [0, 1, -1]) {
        const c = { x: at.x + dx, y: at.y + dy, z: at.z + dz };
        if (!standable(ctx.read, c)) continue;
        for (const [ex, ez] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const w = [0, -1].map((wy) => ({ x: c.x + ex, y: c.y + wy, z: c.z + ez })).find((q) => surface(ctx.read, q));
          if (w) {
            out.push({ c, water: w, face: yawTo(ex, ez), d: Math.hypot(dx, dz) });
            break;
          }
        }
      }
  return out.sort((p, q) => p.d - q.d);
}

// ---------------- gliding ----------------
// Walks and swims a tick at a time; a hatchling in its mother's jaws (or a player in a wild one's) carried along
// at its nose.
export function tickCrocMoves() {
  for (const [id, m] of [...moving]) {
    if (moving.get(id) !== m) continue;
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
      if (m.kind === "dive") {
        m.t++;
        const f = Math.min(1, m.t / m.ticks);
        e.teleport({ x: m.x, y: m.y0 + (m.y1 - m.y0) * f, z: m.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
        if (f >= 1) moving.delete(id);
        continue;
      }
      if (m.s < m.end) {
        let p = pointAlong(m.pts, m.s);
        let c = cellOf(p);
        const col = columnAt(m.read, c.x, c.y, c.z);
        const deep = Boolean(col && col.top > col.bottom);
        // A walk slows in the water (wading), a swim doesn't.
        const pace = m.keepAct || m.water ? m.pace : deep ? Math.max(m.pace, paceOf("swim", m.scale)) : m.pace;
        const s = Math.min(m.end, m.s + pace);
        p = pointAlong(m.pts, s);
        c = cellOf(p);
        const dc = columnAt(m.read, c.x, c.y, c.z);
        let wet = false;
        if (dc && dc.top > dc.bottom && !(m.keepAct && m.act === ACT.lunge)) {
          // Afloat: at the surface (the eyes just out), or under it stalking (a block down, or on the bottom).
          wet = true;
          p = { ...p, y: m.under ? Math.max(dc.bottom, floatY(dc.top, m.scale) - 0.9) : floatY(dc.top, m.scale) };
        } else if (m.read(c.x, c.y, c.z) !== "air" && m.read(c.x, c.y, c.z) !== "water" && standable(m.read, { x: c.x, y: c.y + 1, z: c.z })) {
          // Never into a block: stepping up it gets up onto the block it's over.
          p = { ...p, y: c.y + 1 };
          c = { x: c.x, y: c.y + 1, z: c.z };
        } else if (Math.floor(p.y) < c.y && m.read(c.x, Math.floor(p.y), c.z) !== "air" && m.read(c.x, Math.floor(p.y), c.z) !== "water" && standable(m.read, c)) {
          // Coming up out of the water onto the bank (its path between the float height and the bank's top):
          // on top of the bank block, not half into it.
          p = { ...p, y: c.y };
        }
        const k = keyOf(c);
        if (k !== m.cell) {
          if (!dc && !standable(m.read, c) && !surface(m.read, c) && !standable(m.read, { x: c.x, y: c.y - 1, z: c.z }) && !surface(m.read, { x: c.x, y: c.y - 1, z: c.z }) && !(m.keepAct && m.act === ACT.lunge)) {
            finish(id, m, false);
            continue;
          }
          m.cell = k;
        }
        m.s = s;
        if (p.dx || p.dz) m.yaw = turnToward(m.yaw, (yawTo(p.dx, p.dz) + (m.backward ? 180 : 0)) % 360, m.turn);
        body(e, m.st, wet ? "afloat" : "still");
        m.st.posture = wet ? "water" : m.act === ACT.slide ? "down" : "stand";
        const act = m.keepAct || !wet ? m.act : m.act === ACT.swimFast || m.act === ACT.drag ? m.act : ACT.swim;
        m.st.act = act;
        setAct(e, act);
        e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
        continue;
      }
      if (m.face !== undefined && Math.abs(((((m.face - m.yaw) % 360) + 540) % 360) - 180) > 2) {
        m.yaw = turnToward(m.yaw, m.face, 8);
        if (m.st.posture !== "down") setAct(e, inWaterBody(m) ? ACT.swim : ACT.walk);
        e.setRotation({ x: 0, y: m.yaw });
        continue;
      }
      finish(id, m, true);
    } catch {
      moving.delete(id);
    }
  }
  // What they hold in their jaws, at the nose.
  for (const [id, h] of [...held]) {
    try {
      const e = world.getEntity(id);
      if (!e?.isValid || !h.e.isValid) {
        held.delete(id);
        continue;
      }
      const s = state.get(id);
      const scale = s?.scale ?? 0.5;
      const r = (e.getRotation().y * Math.PI) / 180;
      const ahead = (47 * scale) / 16 - (h.player ? 0.2 : 0.1);
      const at = { x: e.location.x - Math.sin(r) * ahead, y: e.location.y + (h.player ? 0 : (8 * scale) / 16), z: e.location.z + Math.cos(r) * ahead };
      if (h.player) {
        // Gone from its jaws (dead and respawned elsewhere, another dimension): let go, never pull them back.
        let dead = false;
        try {
          dead = (h.e.getComponent("minecraft:health")?.currentValue ?? 1) <= 0;
        } catch {
          // alive
        }
        if (dead || h.e.dimension.id !== e.dimension.id || Math.hypot(h.e.location.x - at.x, h.e.location.z - at.z) > 4) {
          held.delete(id);
          continue;
        }
        h.e.teleport(at, { keepVelocity: false });
      } else {
        // A hatchling hangs from her jaws: over the bank's edge, never into the ground.
        const read = blockReader(e.dimension);
        const fy = Math.floor(at.y);
        const cat = read(Math.floor(at.x), fy, Math.floor(at.z));
        if (cat !== "air" && cat !== "water" && cat !== "unloaded") at.y = fy + 1;
        h.e.teleport(at, { rotation: { x: 0, y: (e.getRotation().y + 90) % 360 }, keepVelocity: false });
      }
    } catch {
      held.delete(id);
    }
  }
}
function inWaterBody(m) {
  return m.st.body === "afloat";
}

function finish(id, m, ok) {
  moving.delete(id);
  m.done(ok);
}

/**
 * Glide a crocodile through the blocks `cells` from where it stands, then `done(ok)`. opts: act, pace (blocks a
 * tick), to (an exact end point), face (a yaw to turn to there), stopShort (blocks short of the end), why,
 * under (stalking under the water), backward (dragging: facing back the way it came), keepAct (the lunge: its
 * act whatever the water), water (a swim: no wading slow-down).
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
  m.s.scale = m.scale;
  body(e, m.s, "still");
  moving.set(e.id, {
    e,
    st: m.s,
    scale: m.scale,
    pts,
    s: 0,
    end: Math.max(0, wayLength(pts) - (opts.stopShort ?? 0)),
    pace: opts.pace ?? paceOf("walk", m.scale),
    act: opts.act ?? ACT.walk,
    turn: (opts.pace ?? 0) >= 0.15 ? 20 : 10,
    yaw: e.getRotation().y,
    face: opts.face,
    why: opts.why,
    under: Boolean(opts.under),
    backward: Boolean(opts.backward),
    keepAct: Boolean(opts.keepAct),
    water: Boolean(opts.water),
    goal: cells.length ? cells[cells.length - 1] : undefined,
    read,
    cell: keyOf(cellOf(from)),
    done,
  });
}

// Turning on the spot to `yaw` (8 degrees a tick), then `then()`.
function turnThen(m, yaw, then) {
  glide(m, [], { act: m.s.posture === "down" ? m.s.act : ACT.walk, pace: paceOf("walk", m.scale), face: yaw }, () => then());
}

function walkTo(m, ctx, to, opts, then) {
  const T = BALANCE.croc;
  const way = findWay(walker(ctx, Boolean(opts.dry) && !inWater(m)), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? T.wildWalkSteps : T.walkSteps, ctx.wild ? T.wildNodes : Infinity);
  if (!way) return false;
  if (!way.length && !opts.to && opts.face === undefined) {
    then(true);
    return true;
  }
  glide(m, way, opts, then);
  return true;
}
// Through the water only, to the surface cell `to`.
function swimTo(m, ctx, to, opts, then) {
  const T = BALANCE.croc;
  const can = swimmer(ctx);
  const way = findWay((c) => can(c) || keyOf(c) === keyOf(to), () => true, cellOf(m.e.location), to, ctx.wild ? T.wildWalkSteps : T.walkSteps, ctx.wild ? T.wildNodes : 4000);
  if (!way) {
    // From just over the surface (floating), the cell under it.
    const here = cellOf(m.e.location);
    const way2 = findWay((c) => can(c) || keyOf(c) === keyOf(to), () => true, { ...here, y: here.y - 1 }, to, ctx.wild ? T.wildWalkSteps : T.walkSteps, ctx.wild ? T.wildNodes : 4000);
    if (!way2) return false;
    glide(m, way2, { ...opts, water: true }, then);
    return true;
  }
  glide(m, way, { ...opts, water: true }, then);
  return true;
}

// Let go of whatever it holds: a hatchling is put down where it is; a player is just let go.
function letGo(id) {
  const h = held.get(id);
  if (!h) return;
  held.delete(id);
  if (!h.player) {
    try {
      const ys = state.get(h.e.id);
      if (ys) {
        ys.act = ACT.none;
        ys.phase = "idle";
        ys.actUntil = 0;
      }
      setAct(h.e, ACT.none);
    } catch {
      // gone
    }
  }
}

// ---------------- sounds ----------------
// The display (the client's 7 s cycle: the bellow 1.2 to 3.6 s into it with the bubbles, the jaw slap at
// 4.4 s), the hatchlings' chirps, the digging, the swallow's gulps, the death roll's splashes.
function sounds(m, now, T) {
  const s = m.s;
  try {
    if (s.phase !== "act" || now < s.busyUntil) return;
    const t = now - (s.actFrom ?? now);
    const e = m.e;
    if (s.act === ACT.display) {
      const k = t % 140;
      if (k >= 24 && k < 34 && s.bellowAt !== now - k) {
        s.bellowAt = now - k;
        e.dimension.playSound("mob.ravager.ambient", e.location, { volume: 3, pitch: 0.45 });
        e.dimension.playSound("bubble.up", e.location, { volume: 1, pitch: 0.8 });
      }
      if (k >= 88 && k < 98 && s.slapAt !== now - k) {
        s.slapAt = now - k;
        e.dimension.playSound("random.splash", e.location, { volume: 1.5, pitch: 0.7 });
      }
    }
    if (s.act === ACT.chirp && t < 10 && s.chirpAt !== s.actFrom) {
      s.chirpAt = s.actFrom;
      e.dimension.playSound("mob.frog.ambient", e.location, { volume: 0.6, pitch: 1.9 });
    }
    if (s.act === ACT.dig && now >= (s.digAt ?? 0)) {
      s.digAt = now + 30;
      e.dimension.playSound("mob.sniffer.digging", e.location, { volume: 0.6, pitch: 1.1 });
    }
    if (s.act === ACT.swallow && t % 48 < 10 && s.gulpAt !== now - (t % 48)) {
      s.gulpAt = now - (t % 48);
      e.dimension.playSound("random.eat", e.location, { volume: 0.8, pitch: 0.5 });
    }
    if (s.act === ACT.roll && now >= (s.splashAt ?? 0)) {
      s.splashAt = now + 12;
      e.dimension.playSound("random.splash", e.location, { volume: 1, pitch: 0.9 });
    }
    if (s.act === ACT.feed && now >= (s.snapAt ?? 0) && s.why === "meal") {
      s.snapAt = now + 26;
      e.dimension.playSound("mob.ravager.bite", e.location, { volume: 0.7, pitch: 1.0 });
    }
  } catch {
    // Cosmetic only.
  }
}

// The hatchlings call from the nest on the day they hatch (animals/nursery.js says when), and the eggs crack.
export function hatchSounds(dimension, pos) {
  try {
    dimension.playSound("block.turtle_egg.crack", pos, { volume: 1, pitch: 0.9 });
    for (let k = 0; k < 4; k++) system.runTimeout(() => dimension.playSound("mob.frog.ambient", pos, { volume: 0.8, pitch: 1.9 }), 10 + k * 14);
  } catch {
    // Cosmetic only.
  }
}

// What a crocodile is doing, for the Field Journal (its zoocraft:act).
export function crocAct(entity) {
  try {
    return entity.getProperty(ACT_PROP) ?? 0;
  } catch {
    return 0;
  }
}

// The crocodiles in an exhibit, biggest first (the clipboard's rank).
export function rankIn(ex) {
  return sizeOrder(animalsIn(ex).filter((a) => SPECIES[a.speciesId]?.rank));
}

export function initCrocs() {
  try {
    raining = world.getDynamicProperty("zoocraft:rain") === true;
  } catch {
    // dry
  }
  world.afterEvents.weatherChange.subscribe((ev) => {
    if (ev.dimension !== "minecraft:overworld" && ev.dimension !== "overworld") return;
    raining = ev.newWeather !== "Clear";
    try {
      world.setDynamicProperty("zoocraft:rain", raining);
    } catch {
      // kept for this session
    }
  });
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        crocHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_crocodile"] },
  );
  on("denChanged", ({ animal, shut }) => {
    if (!shut) return;
    const e = animal?.id && liveEntity(animal.id);
    if (!e) return;
    moving.delete(e.id);
    letGo(e.id);
    state.delete(e.id);
  });
  // A hatchling's record gone (moved, crated): it's no longer anyone's to carry.
  on("animalMoved", ({ animal }) => {
    if (animal?.id) carried.delete(animal.id);
  });
  void getAnimal;
}
