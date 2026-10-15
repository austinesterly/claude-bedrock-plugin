import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS } from "../data/items.js";
import { db } from "../persistence/db.js";
import { on } from "../core/events.js";
import { animalFromEntity, liveEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { reachesFeeder, drinksFrom } from "../equipment/rules.js";
import { findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward } from "./zebraRules.js";
import { dayPart, ledgesOf } from "./lionRules.js";
import { ACT, PACE, TICKS, TIGER_TYPES, roleOf, wildRole, pickMood, groupsOf, clash, huntStep, looking, swimY } from "./tigerRules.js";
import { intentOf, clearIntent, arrivedAtDen, isDenned, ateBait, baitUnreachable, isCalm, hurtWild } from "./predators.js";
import { introToday } from "./tigerTurns.js";
import { reportError } from "../core/log.js";

// Tigers (0.1.76, Big predators; spec 5.2 "tiger | Tiger | Solitary patrolling and swimming | Privacy and
// separate adult territories"; the rules are in animals/tigerRules.js, the turns in animals/tigerTurns.js).
// Every half second, for the tigers near players: each tiger lives alone (a tigress with her cubs shares a
// mood with them), and does what its mood asks. Resting (most of the day) it walks to a quiet place (screened
// floor out of sight, a ledge) and lies down alone: on its chest, flat out on its side or now and then on
// its back, grooming a paw, yawning; a tigress with cubs lies on her side to nurse them. On patrol it walks
// its boundary along the fence and marks: rubbing its cheeks on a Scent Post, rearing up to claw it high,
// spraying it with the tail up, scraping with its hind feet, sniffing and grimacing (flehmen), rolling on
// its back in the grass. It swims across its pool and climbs out, or lies in the shallows up to its neck (at
// midday most). It chuffs (soft puffs through the nose) to a keeper or a player standing still outside its
// fence, to its cubs, and when it's let out of a Holding Den. Two grown tigers loose together (but for a
// pair on their introduction day) fight: they rear up and swat, hissing, and part, and go at it again.
// All of that is the client's (gen/tiger_anim.py) through the zoocraft:act property; walks and swims glide a
// tick at a time (tickTigerMoves) at the client's stride speeds, through the exhibit's measured floor and
// water or open ground and water in the wild. In water 2 deep it swims, held at the surface (its zoocraft:afloat
// body: no gravity).
// animals/predators.js decides the dangerous parts and this module carries them out, as animals/lion.js does:
// a zoo tiger called to a Holding Den walks up to its door and goes in (her cubs trot after her and go in with
// her); one warning a player off shows the threat face and snarls, then charges (swimming, too) and swipes,
// then backs off. A wild tiger hunts players from ambush (Austin, 2026-10-15: "Also make them very dangerous in
// the wild"): see huntStepTiger. A wild one tempted by a thrown Meat Ration walks to it and eats it lying
// down, calm, so it can be crated.

const RANGE = 48; // blocks from a player: a tiger this close is stepped
const KEEP_RANGE = 56; // and kept while it's this close
const ACT_PROP = "zoocraft:act";

const state = new Map(); // entity id -> { phase, act, posture, busyUntil, actUntil, cool, body, family, hunt, mood }
const moving = new Map(); // entity id -> a glide
const families = new Map(); // family key -> { mood, until, chuffed }
const hurt = new Map(); // wild entity id -> { playerId, until }: hurt by this player, it turns on them
const released = new Set(); // animal ids just let out of a Holding Den: they chuff
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
// Standing: open at its feet and head, on a floor. A grown tiger stands about a block.
function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
// The water's surface block: water, open over it.
function surface(read, c) {
  return read(c.x, c.y, c.z) === "water" && read(c.x, c.y + 1, c.z) === "air";
}
// Deep enough to swim (2 deep: water under the surface block too).
function deepAt(read, c) {
  return surface(read, c) && read(c.x, c.y - 1, c.z) === "water";
}
function headroom(read, c) {
  return read(c.x, c.y + 2, c.z) === "air";
}
function openAt(read) {
  return (c) => (read(c.x, c.y, c.z) === "air" || read(c.x, c.y, c.z) === "water") && read(c.x, c.y + 1, c.z) === "air";
}
// Where a tiger may go: its exhibit's measured floor (not up on its feeders and fixtures) and the surface of
// its water, or open ground and water in the wild. dry: land only (walking to a place on land).
function walker(ctx, dry = false) {
  if (!ctx.wild) return (c) => (ctx.cells?.get(keyOf(c)) === "land" && !ctx.onTop.has(keyOf(c))) || (!dry && ctx.cells?.get(keyOf(c)) === "water" && surface(ctx.read, c));
  return (c) => standable(ctx.read, c) || (!dry && surface(ctx.read, c));
}

// ---------------- the half-second tick ----------------
export function tickTigers(now) {
  const T = BALANCE.tiger;
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
      list = entitiesNear(player.dimension, player.location, KEEP_RANGE, TIGER_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      const d = Math.hypot(e.location.x - player.location.x, e.location.y - player.location.y, e.location.z - player.location.z);
      if (d < (near.get(e.id) ?? Infinity)) near.set(e.id, d);
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_tiger") {
        wild.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit" || isDenned(a.id)) {
        // shut in a Holding Den: still, hidden, the den's (no glide, no state: never woken by the cleanup below)
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
  const keys = new Set();
  for (const [exId, members] of zoo) {
    const ex = getExhibit(exId);
    if (!ex || !members.some(close)) {
      for (const b of members) seen.delete(b.e.id);
      continue;
    }
    const ctx = zooContext(ex, SPECIES[members[0].a.speciesId], members[0].e, now);
    // Two grown tigers loose together (not a pair on their introduction day): they fight.
    const grown = members.filter((b) => !b.a.juvenile);
    ctx.clash = clash(grown.map((b) => b.a), introToday(exId)) ? grown : undefined;
    // Each tigress with her cubs (or each grown tiger alone) is a family with its own mood; a cub whose
    // mother isn't here lives on its own.
    const groups = groupsOf(members.map((b) => b.a));
    const placed = new Set(groups.flatMap((g) => g.ids));
    const families = [...groups.map((g) => ({ key: g.key, fam: members.filter((b) => g.ids.includes(b.a.id)) })), ...members.filter((b) => !placed.has(b.a.id)).map((b) => ({ key: b.a.id, fam: [b] }))];
    for (const { key: k, fam } of families) {
      if (!fam.length) continue;
      const key = `ex:${exId}:${k}`;
      keys.add(key);
      stepFamily(key, fam, ctx, now, players, part, T);
    }
  }
  for (const b of wild) {
    if (!close(b)) {
      seen.delete(b.e.id);
      continue;
    }
    const key = `wild:${b.e.id}`;
    keys.add(key);
    const ctx = { wild: true, species: SPECIES["zoocraft:tiger"], read: memoRead(b.e.dimension), cells: undefined, onTop: new Set(), feeders: [], troughs: [], posts: [], ledges: [], screens: [], deep: [], shallow: [], banks: [] };
    stepFamily(key, [b], ctx, now, players, part, T);
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
  for (const key of [...families.keys()]) if (!keys.has(key)) families.delete(key);
  for (const [id, h] of [...hurt]) if (now > h.until) hurt.delete(id);
  for (const id of [...grounds.keys()]) if (!zoo.has(id)) grounds.delete(id);
}

// What a zoo tiger has to work with: the measured floor and water (deep enough to swim, and the shallows
// to lie in), the banks it gets in and out by, its ledges and screened floor, the feeders holding meat, the
// troughs with water, its Scent Posts. The ground's parts are worked out once a minute (or when the exhibit
// is measured again): they read many blocks.
const grounds = new Map(); // exhibit id -> { cells, at, ledges, screens, deep, shallow, banks }
function zooContext(ex, species, e, now) {
  const read = memoRead(e.dimension);
  const cells = cellsOf(ex.id);
  const all = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  const fixtures = fixturesOf(ex);
  const onTop = new Set([...all, ...fixtures].map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  const feeders = all.filter((f) => f.units > 0 && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
  const troughs = fixtures.filter((f) => f.type === "trough" && f.units > 0 && drinksFrom(species, f));
  const posts = fixtures.filter((f) => f.type === "scent");
  let g = grounds.get(ex.id);
  if (!g || g.cells !== cells || now - g.at > 1200) {
    g = { cells, at: now, ledges: [], screens: [], deep: [], shallow: [], banks: [] };
    if (cells) {
      g.ledges = ledgesOf(cells).filter((c) => !onTop.has(keyOf(c)));
      g.screens = (ex.screenSpots ?? []).map(([x, y, z]) => ({ x, y, z })).filter((c) => !onTop.has(keyOf(c))); // from the measure
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
  return { wild: false, ex, species, read, cells, onTop, feeders, troughs, posts, ledges: g.ledges, screens: g.screens, deep: g.deep, shallow: g.shallow, banks: g.banks };
}

// ---------------- a family ----------------
function stepFamily(key, members, ctx, now, players, part, T) {
  let h = families.get(key);
  if (!h) {
    h = { mood: "rest", until: 0, chuffed: 0 };
    families.set(key, h);
  }
  const fam = [];
  for (const { e, a } of members) {
    let s = state.get(e.id);
    if (!s) {
      s = { phase: "idle", act: ACT.none, posture: 0, busyUntil: 0, actUntil: 0, cool: now + between([0, 40]), body: undefined, family: key, hunt: undefined };
      state.set(e.id, s);
    }
    s.family = key;
    let mark = 0;
    try {
      mark = e.getComponent("minecraft:mark_variant")?.value ?? 0;
    } catch {
      // keeps a tigress
    }
    const role = a ? roleOf(a) : wildRole(mark);
    fam.push({ id: e.id, e, a, s, role, juvenile: role === "cub", motherId: a?.parents?.[0] }); // a zoo-born cub's parents: [mother, father]
  }
  const cubs = fam.some((m) => m.juvenile);
  if (now >= h.until) {
    const was = h.mood;
    h.mood = pickMood(part, { cubs, deep: ctx.deep.length > 0, shallow: ctx.shallow.length > 0 }, T);
    h.until = now + between(T.moodTicks);
    h.place = undefined;
    if (was !== h.mood) {
      for (const m of fam) if (m.s.phase === "act" && m.s.mood === was) m.s.actUntil = now; // done with what that mood had it doing
      // A tigress chuffs to her cubs as they gather round for a rest or a game.
      if (cubs && (h.mood === "rest" || h.mood === "play")) {
        const mother = fam.find((m) => !m.juvenile);
        if (mother && mother.s.phase !== "glide" && mother.s.posture === 0 && now >= mother.s.busyUntil) startAct(mother, now, ACT.chuff, T.chuffTicks, h.mood);
      }
    }
  }
  for (const m of fam) {
    try {
      stepTiger(m, h, fam, ctx, now, players, part, T);
    } catch (error) {
      moving.delete(m.id);
      const why = String(error);
      if (!reported.has(why)) {
        reported.add(why);
        reportError("tiger", error);
      }
    }
  }
  sounds(h, fam, now, T);
}

// ---------------- one tiger ----------------
function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}
// Its body: "move" (the engine walks it), "still" (standing put, lying, or carried by a glide on land) or
// "afloat" (in water 2 deep: no gravity, held at the surface by the script).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(how === "move" ? "zoocraft:move" : how === "afloat" ? "zoocraft:afloat" : "zoocraft:still");
  s.body = how;
}

// The posture an act puts it in (the client's controller: 0 standing, 1 sitting, 2 on its chest, 3 on its
// side, 4 on its back); a tigress nurses on her side, a cub suckles standing.
function postureOf(act, juvenile) {
  if (act === ACT.sit) return 1;
  if (act === ACT.lie || act === ACT.eat || act === ACT.groom || act === ACT.soak) return 2;
  if (act === ACT.sleep) return 3;
  if (act === ACT.sleepBack || act === ACT.roll) return 4;
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
  body(m.e, s, inDeep(m) ? "afloat" : "still");
  setAct(m.e, act);
}

// Back on its feet (getting up first), then nothing in particular: the engine walks it about.
function settle(m, now, T) {
  const s = m.s;
  const start = Math.max(now, s.busyUntil);
  s.busyUntil = start + postureTicks(s.posture, 0);
  s.posture = 0;
  s.phase = "idle";
  s.act = ACT.none;
  s.cool = s.busyUntil + between(T.coolTicks);
  body(m.e, s, inDeep(m) ? "afloat" : "move");
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

// In water 2 deep where it is now.
function inDeep(m) {
  try {
    const read = blockReader(m.e.dimension);
    const l = m.e.location;
    const c = { x: Math.floor(l.x), y: Math.floor(l.y + 0.2), z: Math.floor(l.z) };
    return [c, { ...c, y: c.y + 1 }].some((w) => deepAt(read, w));
  } catch {
    return false;
  }
}

function stepTiger(m, h, fam, ctx, now, players, part, T) {
  const s = m.s;
  // A zoo tiger: what predators.js wants of it first (a den, a player inside the exhibit). Cubs follow their
  // mother to her den.
  const it = ctx.wild ? undefined : intentOf(m.id);
  if (it && intentStep(m, it, ctx, now, players, T)) return;
  if (!ctx.wild && m.juvenile && followToDen(m, fam, ctx, now, T)) return;
  if (ctx.wild) {
    const b = intentOf(m.id); // a thrown Meat Ration
    if (b && (b.kind === "bait" || b.kind === "eat") && baitStep(m, b, ctx, now, T)) return;
    if (huntStepTiger(m, ctx, now, players, part, T)) return;
  }
  if (moving.has(m.id)) return;
  if (now < s.busyUntil) return;
  // Left in deep water with nothing to do (a swim cut short, a chase that ended): it swims out.
  if (s.phase !== "act" && inDeep(m) && swimOut(m, ctx, now, T)) return;
  // Two grown tigers loose together: they fight.
  if (ctx.clash?.some((b) => b.e.id === m.id) && sparStep(m, ctx, now, T)) return;
  // A cub wakes (or leaves its play) and goes to suckle as soon as its mother lies down to nurse.
  if (m.juvenile && s.act !== ACT.nurse) {
    const mother = nursingMother(m, fam);
    if (mother && suckleStep(m, mother, ctx, now, T)) return;
  }
  if (s.phase === "act" && now < s.actUntil) return;
  if (s.phase === "act" && s.then !== undefined) {
    // Something that follows on from what it just did (the grimace after sniffing a scent).
    const next = s.then;
    s.then = undefined;
    return startAct(m, now, next, T.scentTicks, s.mood);
  }
  if (s.phase === "act" || s.phase === "glide") settle(m, now, T);
  if (now < s.cool) return;
  if (!ctx.wild && !m.juvenile && released.has(m.a?.id)) {
    // Just let out of a Holding Den: a few chuffs.
    released.delete(m.a.id);
    return startAct(m, now, ACT.chuff, T.chuffTicks, h.mood);
  }
  if (!ctx.wild && !m.juvenile && chuffStep(m, ctx, now, players, T)) return;
  if (m.juvenile && cubStep(m, h, fam, ctx, now, T)) return;
  if (!ctx.wild && !m.juvenile && h.mood !== "roar" && foodStep(m, ctx, now, T)) return;
  switch (h.mood) {
    case "rest":
      return restStep(m, h, fam, ctx, now, T);
    case "patrol":
      return patrolStep(m, ctx, now, T);
    case "swim":
      return swimStep(m, ctx, now, T);
    case "soak":
      return soakStep(m, ctx, now, T);
    case "roar":
      return roarStep(m, h, ctx, now, T);
    case "play":
      return restStep(m, h, fam, ctx, now, T); // the tigress lies by while the cubs play
  }
}

// ---------------- food and water ----------------
// Now and then up to a feeder holding meat (eating from its top, a block up: neck pulls and chewing), to a
// trough or the pool's edge (drinking crouched, lapping), standing beside it facing it. The meal itself is the
// record's (animals/welfare.js): this is what players see.
function foodStep(m, ctx, now, T) {
  const r = Math.random();
  const kind = r < T.feedChance ? "feed" : r < T.feedChance + T.drinkChance ? "drink" : undefined;
  if (!kind) return false;
  const act = kind === "feed" ? ACT.feed : ACT.drink;
  // Where it stands: its nose over the middle of the feeder's top, in the trough's water, or over the pool's
  // edge. The poses put the nose 37.5 (eating at a feeder) or 38.5 (drinking) model units ahead of where it
  // stands, 32 to a block for a tigress (gen/tiger_poses.py HEAD_AT), further for a bigger male.
  const size = m.role === "male" ? 0.572 / 0.5 : 1;
  const reach = ((act === ACT.feed ? 37.5 : 38.5) / 32) * size - 0.1;
  const can = walker(ctx, true);
  const sides = [];
  const list = kind === "feed" ? ctx.feeders : ctx.troughs;
  for (const f of list) {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const at = { x: f.pos.x + 0.5 + dx * reach, z: f.pos.z + 0.5 + dz * reach };
      const c = { x: Math.floor(at.x), y: f.pos.y, z: Math.floor(at.z) };
      const nearC = { x: f.pos.x + dx, y: f.pos.y, z: f.pos.z + dz };
      if (can(c) && can(nearC)) sides.push({ at, c, face: yawTo(-dx, -dz) });
    }
  }
  // At the pool's edge: standing on the bank, facing the water.
  if (kind === "drink")
    for (const b of ctx.banks.slice(0, 40)) {
      const r2 = (b.face * Math.PI) / 180;
      const back = reach - 0.6; // the bank block's middle is 0.5 from the water; the nose reaches over it
      sides.push({ at: { x: b.c.x + 0.5 + Math.sin(r2) * back, z: b.c.z + 0.5 - Math.cos(r2) * back }, c: b.c, face: b.face });
    }
  if (!sides.length) return false;
  if (!onFeet(m, now)) return true;
  const { at, c, face } = sides[Math.floor(Math.random() * sides.length)];
  return walkTo(m, ctx, c, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: c.y, z: at.z }, face, dry: true }, (ok) => (ok ? startAct(m, system.currentTick, act, act === ACT.feed ? T.feedTicks : T.drinkTicks) : settle(m, system.currentTick, T)));
}

// ---------------- resting alone ----------------
// Where it rests: out of sight on screened floor if there is some (the most screened, the quietest), else a
// ledge, else a quiet spot of its floor; in the wild, where it is. Its own spot, not another tiger's.
function restPlace(m, h, fam, ctx) {
  if (h.place) return h.place;
  let at;
  if (!ctx.wild && ctx.cells) {
    const taken = new Set([...families.values()].filter((o) => o !== h && o.place).map((o) => keyOf(o.place.cell)));
    const pick = (list) => {
      const free = list.filter((c) => !taken.has(keyOf(c)));
      return free.length ? free[Math.floor(Math.random() * free.length)] : undefined;
    };
    at = pick(ctx.screens) ?? pick(ctx.ledges);
    if (!at) {
      const land = [...ctx.cells].filter(([k, v]) => v === "land" && !ctx.onTop.has(k)).map(([k]) => k.split(",").map(Number));
      if (land.length) {
        const [x, y, z] = land[Math.floor(Math.random() * land.length)];
        at = { x, y, z };
      }
    }
  }
  if (!at) return undefined;
  h.place = { cell: at, at: { x: at.x + 0.5, z: at.z + 0.5 }, yaw: Math.floor(Math.random() * 4) * 90 };
  return h.place;
}

function restStep(m, h, fam, ctx, now, T) {
  const lieDown = () => {
    const now = system.currentTick; // called back at the end of a walk: the tick it arrived
    // On its chest first; then, more often than not, flat out asleep on its side (and now and then over on
    // its back); grooming a paw now and then; a tigress with cubs lies on her side to nurse them.
    const r = Math.random();
    const mother = !m.juvenile && fam.some((c) => c.juvenile && c.motherId === m.a?.id);
    if (mother && r < T.nurseChance) return startAct(m, now, ACT.nurse, T.nurseTicks, "rest");
    if (r < T.sleepChance) return startAct(m, now, Math.random() < T.backChance ? ACT.sleepBack : ACT.sleep, T.lieTicks, "rest");
    if (r < T.sleepChance + T.groomChance) return startAct(m, now, ACT.groom, T.groomTicks, "rest");
    startAct(m, now, ACT.lie, T.lieTicks, "rest");
  };
  // Already down where it rests: on with it (a yawn on waking, then down again).
  if (m.s.posture >= 2 && m.s.mood === "rest") {
    if (Math.random() < T.yawnChance) return startAct(m, now, ACT.yawn, 60, "rest");
    return lieDown();
  }
  // A cub lies down by its mother.
  const mother = m.juvenile && fam.find((o) => o.a && o.a.id === m.motherId);
  const place = mother ? undefined : restPlace(m, h, fam, ctx);
  if (mother && dist(m.e.location, mother.e.location) > 2.5) {
    if (!onFeet(m, now)) return;
    const c = cellOf(mother.e.location);
    if (walkTo(m, ctx, c, { act: ACT.walk, pace: PACE.walk, stopShort: 1.4, dry: true }, (ok) => (ok ? lieDown() : settle(m, system.currentTick, T)))) return;
  }
  if (!place) return lieDown();
  const here = cellOf(m.e.location);
  if (dist(m.e.location, place.at) < 0.8 || (here.x === place.cell.x && here.z === place.cell.z)) return lieDown();
  if (!onFeet(m, now)) return;
  if (!walkTo(m, ctx, place.cell, { act: ACT.walk, pace: PACE.walk, to: { x: place.at.x, y: place.cell.y, z: place.at.z }, face: place.yaw, dry: true }, (ok) => (ok ? lieDown() : settle(m, system.currentTick, T))))
    lieDown();
}

// ---------------- patrol and marking ----------------
// A walk along its boundary (to a far stretch of the fence, or to a Scent Post half the time), then, there:
// rubbing its cheeks on the post, rearing up to claw it high, spraying it with the tail up, scraping with
// its hind feet, sniffing (and the flehmen grimace), or rolling on its back in the grass. Males mark more.
function patrolStep(m, ctx, now, T) {
  if (m.juvenile) return startAct(m, now, ACT.sit, T.socialTicks, "patrol");
  if (!onFeet(m, now)) return;
  const post = ctx.posts.length && Math.random() < 0.5 ? ctx.posts[Math.floor(Math.random() * ctx.posts.length)] : undefined;
  const can = walker(ctx, true);
  let to;
  let face;
  let postSide = false;
  if (post) {
    // Beside the post, with the post at its left (for the cheek rub), or facing it (to claw it, or with its
    // back to it to spray it).
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = { x: post.pos.x + dx, y: post.pos.y, z: post.pos.z + dz };
      if (can(c)) {
        to = c;
        face = yawTo(-dx, -dz);
        postSide = true;
        break;
      }
    }
  }
  if (!to) {
    // A stretch of the boundary: floor beside the fence (a floor block with no floor on one side), as far
    // from here as it can find; in the wild, anywhere within reach.
    const here = cellOf(m.e.location);
    if (!ctx.wild && ctx.cells) {
      let best;
      for (let k = 0; k < 24; k++) {
        const c = { x: here.x + between([-T.patrolReach, T.patrolReach]), y: here.y, z: here.z + between([-T.patrolReach, T.patrolReach]) };
        for (const dy of [0, 1, -1]) {
          const n = { ...c, y: c.y + dy };
          if (!can(n)) continue;
          const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dz]) => ![0, 1, -1].some((ey) => ctx.cells.has(`${n.x + dx},${n.y + ey},${n.z + dz}`)));
          if (!edge) continue;
          const d = dist(n, here);
          if (!best || d > best.d) best = { n, d, face: yawTo(-edge[0], -edge[1]) };
        }
      }
      if (best) {
        to = best.n;
        face = (best.face + 90) % 360; // walking along the fence, not into it
      }
    }
    for (let k = 0; k < 12 && !to; k++) {
      const c = { x: here.x + between([-T.patrolReach, T.patrolReach]), y: here.y, z: here.z + between([-T.patrolReach, T.patrolReach]) };
      for (const dy of [0, 1, -1]) if (!to && can({ ...c, y: c.y + dy })) to = { ...c, y: c.y + dy };
    }
  }
  const mark = () => {
    const male = m.role === "male";
    const r = Math.random();
    let act = ACT.sniff;
    if (postSide) act = r < 0.25 ? ACT.rub : r < 0.45 ? ACT.claw : r < 0.6 ? ACT.sniff : r < 0.75 || !male ? ACT.scrape : ACT.spray;
    else if (r < (male ? 0.3 : 0.15)) act = Math.random() < 0.5 ? ACT.spray : ACT.scrape;
    else if (r < 0.45) act = ACT.roll;
    const go = () => startAct(m, system.currentTick, act, act === ACT.roll ? T.rollTicks : T.scentTicks, "patrol");
    // Its back to the post (spray), the post at its left (rub): turned round on the spot first.
    if (postSide && (act === ACT.spray || act === ACT.rub)) turnThen(m, ((face ?? 0) + (act === ACT.spray ? 180 : 90)) % 360, go);
    else go();
    // After sniffing a scent, the grimace now and then.
    if (act === ACT.sniff && Math.random() < 0.4) m.s.then = ACT.flehmen;
  };
  if (!to || !walkTo(m, ctx, to, { act: ACT.walk, pace: PACE.walk, face, dry: true }, (ok) => (ok ? mark() : settle(m, system.currentTick, T)))) startAct(m, now, ACT.sniff, T.scentTicks, "patrol");
}

// ---------------- swimming and soaking ----------------
// A swim: to a bank beside the deep water, in, and across to the farthest bank it can reach by water, out.
function swimStep(m, ctx, now, T) {
  if (!ctx.deep.length || !ctx.banks.length) return startAct(m, now, ACT.lie, T.lieTicks, "swim");
  if (!onFeet(m, now)) return;
  const deep = new Set(ctx.deep.map(keyOf));
  const nearDeep = (w) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => deep.has(keyOf({ x: w.x + dx, y: w.y, z: w.z + dz })));
  const into = ctx.banks.filter((b) => nearDeep(b.water));
  if (!into.length) return startAct(m, now, ACT.lie, T.lieTicks, "swim");
  const start = into.reduce((a, b) => (dist(a.c, m.e.location) < dist(b.c, m.e.location) ? a : b));
  // The way across: through the water only, out at a bank as far from where it got in as it can find.
  const across = () => {
    const ends = ctx.banks.filter((b) => b !== start).sort((p, q) => dist(q.c, start.c) - dist(p.c, start.c));
    const water = (c) => ctx.cells.get(keyOf(c)) === "water" && surface(ctx.read, c);
    for (const end of ends.slice(0, 6)) {
      const way = findWay((c) => water(c) || keyOf(c) === keyOf(end.c), () => true, start.c, end.c, T.walkSteps, 4000);
      if (way && way.length > 2) {
        glide(m, way, { act: ACT.walk, pace: PACE.walk, why: "swim" }, () => settle(m, system.currentTick, T));
        return;
      }
    }
    settle(m, system.currentTick, T);
  };
  if (dist(m.e.location, { x: start.c.x + 0.5, z: start.c.z + 0.5 }) < 0.8) return across();
  if (!walkTo(m, ctx, start.c, { act: ACT.walk, pace: PACE.walk, dry: true }, (ok) => (ok ? across() : settle(m, system.currentTick, T)))) startAct(m, now, ACT.lie, T.lieTicks, "swim");
}

// Out of deep water by the nearest bank.
function swimOut(m, ctx, now, T) {
  if (ctx.wild) {
    // The nearest dry ground within a few blocks.
    const here = cellOf(m.e.location);
    let best;
    for (let dx = -6; dx <= 6; dx++)
      for (let dz = -6; dz <= 6; dz++)
        for (const dy of [0, 1, 2, -1]) {
          const c = { x: here.x + dx, y: here.y + dy, z: here.z + dz };
          if (standable(ctx.read, c) && (!best || Math.hypot(dx, dz) < best.d)) best = { c, d: Math.hypot(dx, dz) };
        }
    if (!best) return false;
    return walkTo(m, ctx, best.c, { act: ACT.walk, pace: PACE.walk }, () => settle(m, system.currentTick, T));
  }
  if (!ctx.banks.length) return false;
  const b = ctx.banks.reduce((p, q) => (dist(p.c, m.e.location) < dist(q.c, m.e.location) ? p : q));
  return walkTo(m, ctx, b.c, { act: ACT.walk, pace: PACE.walk }, () => settle(m, system.currentTick, T));
}

// Soaking: into the shallows (water a block deep, the ground right under it) and lying down there up to its
// neck (the client raises it in the water), for a long while.
function soakStep(m, ctx, now, T) {
  if (m.juvenile) return startAct(m, now, ACT.play, T.playTicks, "soak"); // the cubs play in the shallows by her
  if (!ctx.shallow.length) return startAct(m, now, ACT.lie, T.lieTicks, "soak");
  const here = cellOf(m.e.location);
  if (ctx.shallow.some((c) => c.x === here.x && c.z === here.z && Math.abs(c.y - here.y) <= 1)) return startAct(m, now, ACT.soak, T.soakTicks, "soak");
  if (!onFeet(m, now)) return;
  const taken = new Set([...state.values()].filter((o) => o.act === ACT.soak && o.soakAt).map((o) => o.soakAt));
  const free = ctx.shallow.filter((c) => !taken.has(keyOf(c)));
  if (!free.length) return startAct(m, now, ACT.lie, T.lieTicks, "soak");
  const c = free.reduce((p, q) => (dist(p, m.e.location) < dist(q, m.e.location) ? p : q));
  m.s.soakAt = keyOf(c);
  if (!walkTo(m, ctx, c, { act: ACT.walk, pace: PACE.walk, to: { x: c.x + 0.5, y: c.y, z: c.z + 0.5 } }, (ok) => (ok ? startAct(m, system.currentTick, ACT.soak, T.soakTicks, "soak") : settle(m, system.currentTick, T))))
    startAct(m, now, ACT.lie, T.lieTicks, "soak");
}

// ---------------- the roar ----------------
// Rare (tigers call far less than lions): now and then at dusk or dawn a grown one stands and gives its long
// moaning roar; the cubs sit.
function roarStep(m, h, ctx, now, T) {
  if (m.juvenile) return startAct(m, now, ACT.sit, T.socialTicks, "roar");
  if (!onFeet(m, now)) return;
  startAct(m, now, ACT.roar, T.roarTicks, "roar");
  m.s.roarFrom = m.s.busyUntil;
}

// ---------------- chuffing ----------------
// A grown zoo tiger chuffs (prusten: the friendly puffs through the nose) to someone standing still just
// outside its fence, near it, now and then (keepers chuff to tigers, and familiar tigers chuff back: AZA).
function chuffStep(m, ctx, now, players, T) {
  if (now < (m.s.chuffAt ?? 0) || m.s.posture !== 0) return false;
  const e = m.e;
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const d = Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z);
    if (d > T.chuffRange || Math.abs(p.location.y - e.location.y) > 3) continue;
    const pc = { x: Math.floor(p.location.x), y: Math.floor(p.location.y), z: Math.floor(p.location.z) };
    if (ctx.cells?.has(keyOf(pc)) || ctx.cells?.get(keyOf({ ...pc, y: pc.y + 1 })) === "water") continue; // inside: that's predators.js's business
    let still = false;
    try {
      const v = p.getVelocity();
      still = Math.hypot(v.x, v.z) < 0.02;
    } catch {
      // unknown: not still
    }
    if (!still) continue;
    m.s.chuffAt = now + T.chuffEvery;
    turnThen(m, yawTo(p.location.x - e.location.x, p.location.z - e.location.z), () => startAct(m, system.currentTick, ACT.chuff, T.chuffTicks));
    return true;
  }
  return false;
}

// ---------------- sparring ----------------
// Two grown tigers loose together: up to the nearest other one, reared up face to face swatting and hissing a
// while, then apart (a few blocks away) and at it again after a pause.
function sparStep(m, ctx, now, T) {
  const others = ctx.clash.filter((b) => b.e.id !== m.id);
  if (!others.length) return false;
  if (m.s.phase === "act" && m.s.act === ACT.spar && now < m.s.actUntil) return true;
  if (now < (m.s.sparAt ?? 0)) return false;
  const o = others.reduce((p, q) => (dist(p.e.location, m.e.location) < dist(q.e.location, m.e.location) ? p : q));
  const d = dist(o.e.location, m.e.location);
  const yaw = yawTo(o.e.location.x - m.e.location.x, o.e.location.z - m.e.location.z);
  if (d <= 2.2) {
    turnThen(m, yaw, () => {
      startAct(m, system.currentTick, ACT.spar, T.sparTicks);
      m.s.sparAt = m.s.actUntil + between(T.sparRest);
    });
    try {
      m.e.dimension.playSound("mob.cat.hiss", m.e.location, { volume: 1.2, pitch: 0.5 });
    } catch {
      // Cosmetic only.
    }
    return true;
  }
  if (!onFeet(m, now)) return true;
  const c = cellOf(o.e.location);
  return walkTo(m, ctx, c, { act: ACT.trot, pace: PACE.trot, stopShort: 1.8, why: "spar" }, () => settle(m, system.currentTick, T));
}

// ---------------- cubs ----------------
// A cub keeps close to its mother: suckling at her belly while she nurses, playing, or lying by her.
function nursingMother(m, fam) {
  const mother = fam.find((o) => o.a && o.a.id === m.motherId);
  return mother && mother.s.phase === "act" && mother.s.act === ACT.nurse ? mother : undefined;
}

function cubStep(m, h, fam, ctx, now, T) {
  const mother = nursingMother(m, fam);
  if (mother && suckleStep(m, mother, ctx, now, T)) return true;
  if (h.mood === "play" || (h.mood === "patrol" && Math.random() < 0.5)) {
    startAct(m, now, ACT.play, T.playTicks, h.mood);
    return true;
  }
  const mom = fam.find((o) => o.a && o.a.id === m.motherId);
  if (mom && dist(m.e.location, mom.e.location) > T.cubStray && onFeet(m, now)) {
    const c = cellOf(mom.e.location);
    if (walkTo(m, ctx, c, { act: ACT.trot, pace: PACE.trot, stopShort: 1.2 }, () => settle(m, system.currentTick, T))) return true;
  }
  return false;
}

// Suckling at her belly while she nurses: beside her on the side she lies on (her belly faces her left).
function suckleStep(m, mother, ctx, now, T) {
  const yaw = mother.e.getRotation().y;
  const r = (yaw * Math.PI) / 180;
  const at = { x: mother.e.location.x - Math.cos(r) * T.suckleGap, z: mother.e.location.z - Math.sin(r) * T.suckleGap };
  const level = Math.floor(mother.e.location.y + 0.5);
  const cell = [0, -1, 1].map((dy) => ({ x: Math.floor(at.x), y: level + dy, z: Math.floor(at.z) })).find(walker(ctx, true));
  if (cell && dist(m.e.location, at) < 0.6) {
    startAct(m, now, ACT.nurse, mother.s.actUntil - now, "rest");
    return true;
  }
  if (cell) {
    if (onFeet(m, now)) walkTo(m, ctx, cell, { act: ACT.walk, pace: PACE.walk, to: { x: at.x, y: cell.y, z: at.z }, face: (yaw + 90) % 360, dry: true }, () => {});
    return true;
  }
  return false;
}

// Her cubs trot after a tigress called into a Holding Den (they go in with her: animals/predators.js).
function followToDen(m, fam, ctx, now, T) {
  const mom = fam.find((o) => o.a && o.a.id === m.motherId);
  const it = mom && intentOf(mom.id);
  if (it?.kind !== "den") return false;
  if (moving.get(m.id)?.why === "den") return true;
  if (!onFeet(m, now)) return true;
  if (dist(m.e.location, { x: it.to.x + 0.5, z: it.to.z + 0.5 }) < 1.5) {
    startAct(m, now, ACT.sit, 40);
    return true;
  }
  walkTo(m, ctx, it.to, { act: ACT.trot, pace: PACE.trot, why: "den", stopShort: 1.2 }, () => startAct(m, system.currentTick, ACT.sit, 40));
  return true;
}

// ---------------- what predators.js asks of a zoo tiger ----------------
function intentStep(m, it, ctx, now, players, T) {
  const s = m.s;
  const e = m.e;
  if (it.kind === "den") {
    // Called into a Holding Den: up from where it lies, a trot to the door (out of the water first), and in.
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
    // The threat face: crouched, the ears twisted round, snarling, staring at them (in the water it treads
    // water, facing them).
    moving.delete(m.id);
    const act = inDeep(m) ? ACT.swim : ACT.warn;
    if (s.act !== act || s.phase !== "act") {
      if (!onFeet(m, now)) return true;
      startAct(m, now, act, 400);
    }
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    s.actUntil = now + 20;
    return true;
  }
  if (it.kind === "charge") {
    // The rush: at the charge's pace straight at them (swimming after them in the pool), then the swipe
    // (predators.js lands it when it's within reach).
    const d = dist(e.location, p.location);
    if (d <= T.hunt.reach) {
      moving.delete(m.id);
      if (s.act !== ACT.swipe) startAct(m, now, ACT.swipe, TICKS.swipe + 6);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    if (!onFeet(m, now)) return true;
    chase(m, ctx, p, PACE.gallop, ACT.gallop, T);
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
      startAct(m, now, inDeep(m) ? ACT.swim : ACT.alert, 40);
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
      return true;
    }
    s.backed = it.since;
    if (!onFeet(m, now)) return true;
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
    if (!goal || !walkTo(m, ctx, goal, { act: ACT.trot, pace: PACE.trot, face: yaw }, () => startAct(m, system.currentTick, ACT.alert, 40))) startAct(m, now, ACT.alert, 40);
    return true;
  }
  return false;
}

// A short way toward the player (up to T.chaseSteps blocks), stopping short of them, glided at `pace` (in
// deep water at its swimming pace).
function chase(m, ctx, p, pace, act, T) {
  const g = moving.get(m.id);
  const point = p.location;
  const target = cellOf(point);
  if (g?.why === "chase" && g.act === act && g.target === keyOf(target) && Math.hypot(g.aim.x - point.x, g.aim.z - point.z) < 0.6 && g.s < g.end) return;
  const from = cellOf(m.e.location);
  const can = walker(ctx);
  let goal = target;
  if (!can(goal)) goal = [1, -1].map((dy) => ({ ...target, y: target.y + dy })).find(can) ?? target;
  let way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(ctx.read, c), from, goal, T.chaseSteps, T.chaseNodes);
  let part = false;
  if (!way) {
    const d = Math.hypot(goal.x - from.x, goal.z - from.z);
    if (d > 16) {
      const mid = { x: Math.floor(from.x + ((goal.x - from.x) * 16) / d), y: from.y, z: Math.floor(from.z + ((goal.z - from.z) * 16) / d) };
      const step = [0, 1, -1, 2, -2].map((dy) => ({ ...mid, y: mid.y + dy })).find(can);
      if (step) way = findWay(can, (c) => headroom(ctx.read, c), from, step, T.chaseSteps, T.chaseNodes);
      part = Boolean(way);
    }
  }
  if (!way || !way.length) return;
  glide(m, way, part ? { act, pace, why: "chase" } : { act, pace, why: "chase", to: { x: point.x, y: goal.y, z: point.z }, stopShort: T.hunt.reach * 0.8 }, () => {});
  const ng = moving.get(m.id);
  if (ng) {
    ng.target = keyOf(target);
    ng.aim = { x: point.x, z: point.z };
  }
}

// ---------------- the wild: a thrown Meat Ration ----------------
function baitStep(m, it, ctx, now, T) {
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
// How far off a tiger spots this player now: by day T.hunt.spotDay, at dusk, by night and at dawn
// T.hunt.spotNight; half that for someone sneaking.
function spotRange(p, part, T) {
  const base = part === "day" || part === "midday" ? T.hunt.spotDay : T.hunt.spotNight;
  return p.isSneaking ? base * T.hunt.sneakFactor : base;
}

function huntStepTiger(m, ctx, now, players, part, T) {
  const s = m.s;
  const e = m.e;
  if (isCalm(m.id) || m.juvenile || peaceful()) {
    s.hunt = undefined;
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
      if (d <= spotRange(p, part, T) && Math.abs(p.location.y - e.location.y) < 8 && (!best || d < best.d)) best = { p, d };
    }
    target = best?.p;
  }
  if (!target) {
    if (s.hunt) {
      s.hunt = undefined;
      moving.delete(m.id);
      settle(m, now, T);
    }
    return false;
  }
  if (!s.hunt || s.hunt.playerId !== target.id) {
    s.hunt = { playerId: target.id, ...huntStep(undefined, { dist: Infinity, looked: true }, now, T), step: undefined };
    spotted(target, T);
  }
  const d = dist(target.location, e.location);
  let view = { x: 0, z: 1 };
  try {
    view = target.getViewDirection();
  } catch {
    // facing south
  }
  const looked = looking(view, target.location, e.location, T.hunt.lookDeg);
  const was = s.hunt.phase;
  const H = huntStep(s.hunt, { dist: d, looked, hurt: Boolean(grudge) }, now, T);
  s.hunt = { ...H, playerId: target.id };
  const yaw = yawTo(target.location.x - e.location.x, target.location.z - e.location.z);
  if (H.step === "giveup") {
    // Stared down: it slinks off once, then leaves them be a while.
    if (s.slunk !== H.giveUpUntil) {
      s.slunk = H.giveUpUntil;
      moving.delete(m.id);
      if (!onFeet(m, now)) return true;
      const away = Math.atan2(e.location.z - target.location.z, e.location.x - target.location.x);
      const to = cellOf({ x: e.location.x + Math.cos(away) * 12, y: e.location.y, z: e.location.z + Math.sin(away) * 12 });
      const goal = [0, 1, -1, 2, -2].map((dy) => ({ ...to, y: to.y + dy })).find(walker(ctx));
      if (goal && walkTo(m, ctx, goal, { act: ACT.walk, pace: PACE.walk, why: "slink" }, () => settle(m, system.currentTick, T))) return true;
    }
    return moving.get(m.id)?.why === "slink";
  }
  if (H.step === "rest") {
    // Winded after a rush: it stands panting, watching, then stalks again.
    moving.delete(m.id);
    if (s.act !== ACT.alert) startAct(m, now, inDeep(m) ? ACT.swim : ACT.alert, H.restUntil - now);
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 20) });
    return true;
  }
  if (H.step === "attack") {
    if (moving.get(m.id)?.why === "pounce") return true; // still in the air
    moving.delete(m.id);
    if (!onFeet(m, now)) return true;
    e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    if (now >= (s.hunt.biteAt ?? 0)) {
      s.hunt.biteAt = now + T.hunt.biteTicks;
      startAct(m, now, ACT.swipe, TICKS.swipe);
      blow(e, target, T.hunt.damage, T.hunt.knock, T.hunt.lift, T.hunt.reach + 0.75, "mob.ravager.bite");
    } else if (s.act !== ACT.swipe || now >= s.actUntil) startAct(m, now, inDeep(m) ? ACT.swim : ACT.warn, 10);
    return true;
  }
  if (H.step === "freeze") {
    // Looked at: frozen flat where it is, staring; in long grass close by, a rustle.
    moving.delete(m.id);
    if (s.act !== ACT.ambush || s.phase !== "act") {
      if (inDeep(m)) return true; // nothing to hide behind in the water: it just treads water
      startAct(m, now, ACT.ambush, 400);
    }
    s.actUntil = now + 20;
    if (d <= T.hunt.rustleRange && now >= (s.rustleAt ?? 0)) {
      s.rustleAt = now + 60;
      try {
        e.dimension.playSound("step.grass", e.location, { volume: 0.35, pitch: 0.8 });
      } catch {
        // Cosmetic only.
      }
    }
    return true;
  }
  if (H.step === "pounce") {
    // The leap: from the gathering crouch up and onto them (the glide carries it through the air), landing
    // on them for 5 hearts and a hard shove.
    moving.delete(m.id);
    if (!onFeet(m, now)) return true;
    e.setRotation({ x: 0, y: yaw });
    startAct(m, now, ACT.pounce, TICKS.pounce + 2);
    s.hunt.biteAt = now + 12 + T.hunt.biteTicks; // the pounce is the first blow
    const to = { x: target.location.x, y: e.location.y, z: target.location.z };
    const len = Math.max(0.5, dist(to, e.location) - T.hunt.reach * 0.5);
    // Gathering 3 ticks, in the air 9 (0.15 to 0.6 s of the client's 0.85 s pounce), then landing on them.
    system.runTimeout(() => {
      try {
        if (!e.isValid) return;
        glide(m, [cellOf(to)], { act: ACT.pounce, pace: len / 9, why: "pounce", to, stopShort: T.hunt.reach * 0.5 }, () => {});
      } catch {
        // gone
      }
    }, 3);
    system.runTimeout(() => blow(e, target, T.hunt.pounceDamage, T.hunt.pounceKnock, T.hunt.pounceLift, T.hunt.reach + 1.2, "mob.ravager.roar"), 12);
    return true;
  }
  if (!onFeet(m, now)) {
    if (H.phase === "rush") s.hunt.rushFrom = now; // getting up: the rush starts once it's up
    return true;
  }
  if (H.step === "stalk") {
    chase(m, ctx, target, PACE.stalk, ACT.stalk, T);
    return true;
  }
  // The rush: a coughing roar as it breaks cover, then at them faster than they can sprint.
  if (was !== "rush") {
    try {
      e.dimension.playSound("mob.ravager.roar", e.location, { volume: 2, pitch: 0.8 });
    } catch {
      // Cosmetic only.
    }
  }
  if (moving.get(m.id)?.why === "pounce") return true;
  chase(m, ctx, target, PACE.gallop, ACT.gallop, T);
  return true;
}

// A blow that lands if they're still within `reach`: damage and a shove.
function blow(e, p, damage, knock, lift, reach, sound) {
  try {
    if (!e.isValid || !p.isValid || !vulnerable(p)) return;
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > reach) return;
    p.applyDamage(damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * knock, z: (dz / len) * knock }, lift);
    e.dimension.playSound(sound, e.location, { volume: 1, pitch: 1.0 });
  } catch {
    // gone
  }
}

// The first time a tiger fixes on someone: a line saying what's happening (no growl: it hunts in silence).
const warned = new Map(); // player id -> tick
function spotted(p, T) {
  try {
    const now = system.currentTick;
    if (now - (warned.get(p.id) ?? -10000) < T.hunt.tellEvery) return;
    warned.set(p.id, now);
    p.onScreenDisplay.setActionBar("§cSomething is watching you from cover: keep facing it and back away (a tiger creeps up only while your back is turned)");
  } catch {
    // gone
  }
}

// A wild tiger hurt by a player (world.afterEvents.entityHurt): calm or not, it turns on whoever did it.
export function tigerHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const T = BALANCE.tiger;
  hurt.set(entity.id, { playerId: damager.id, until: system.currentTick + T.hunt.hurtTicks });
  hurtWild(entity.id);
}

// ---------------- gliding ----------------
export function tickTigerMoves() {
  for (const [id, m] of [...moving]) {
    if (moving.get(id) !== m) continue; // stopped (or replaced) by an earlier one's end this tick: a den shut on its cubs
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
        let p = pointAlong(m.pts, m.s);
        let c = cellOf(p);
        // In the water: deep, it swims (slower, held at the surface, afloat); in the shallows it wades.
        const deep = deepAt(m.read, c) || deepAt(m.read, { ...c, y: c.y - 1 });
        const wet = deep || surface(m.read, c);
        const pace = m.why === "pounce" ? m.pace : deep ? Math.min(m.pace, Math.max(PACE.swim, m.pace * 0.4)) : wet ? Math.min(m.pace, PACE.trot) : m.pace;
        const s = Math.min(m.end, m.s + pace);
        p = pointAlong(m.pts, s);
        c = cellOf(p);
        const dc = deepAt(m.read, c) ? c : deepAt(m.read, { ...c, y: c.y - 1 }) ? { ...c, y: c.y - 1 } : undefined;
        if (dc) p = { ...p, y: swimY(dc.y, m.role) };
        else if (m.read(c.x, c.y, c.z) !== "air" && m.read(c.x, c.y, c.z) !== "water" && standable(m.read, { x: c.x, y: c.y + 1, z: c.z })) {
          // Never into a block: stepping up it gets up onto the block it's over.
          p = { ...p, y: c.y + 1 };
          c = { x: c.x, y: c.y + 1, z: c.z };
        }
        const k = keyOf(c);
        if (k !== m.cell) {
          if (!dc && !standable(m.read, c) && !surface(m.read, c) && !standable(m.read, { x: c.x, y: c.y - 1, z: c.z }) && !surface(m.read, { x: c.x, y: c.y - 1, z: c.z })) {
            finish(id, m, false);
            continue;
          }
          m.cell = k;
        }
        m.s = s;
        if (p.dx || p.dz) m.yaw = turnToward(m.yaw, yawTo(p.dx, p.dz), m.turn);
        body(e, m.st, dc ? "afloat" : "still");
        setAct(e, dc && m.act !== ACT.pounce ? ACT.swim : m.act);
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
 * Glide a tiger through the blocks `cells` from where it stands, then `done(ok)`. opts: act, pace (blocks a
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
    st: m.s,
    role: m.role,
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

// Turning on the spot to `yaw` (10 degrees a tick, as at a glide's end), then `then()`.
function turnThen(m, yaw, then) {
  glide(m, [], { act: ACT.walk, pace: PACE.walk, face: yaw }, () => then());
}

function walkTo(m, ctx, to, opts, then) {
  const T = BALANCE.tiger;
  const way = findWay(walker(ctx, Boolean(opts.dry) && !inDeep(m)), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? T.wildWalkSteps : T.walkSteps, ctx.wild ? T.wildNodes : Infinity);
  if (!way) return false;
  if (!way.length && !opts.to && opts.face === undefined) {
    then(true);
    return true;
  }
  glide(m, way, opts, then);
  return true;
}

// ---------------- sounds ----------------
// The roar (one long moaning "aaonh" a cycle), the chuff's puffs, a low moan now and then while awake, and a
// cub's mew at play.
function sounds(h, fam, now, T) {
  try {
    for (const m of fam) {
      if (m.s.act === ACT.roar && now >= m.s.busyUntil) {
        // The client's 9 s cycle: the roar 0.8 to 3.6 s into it.
        const t = (now - (m.s.roarFrom ?? m.s.busyUntil)) % 180;
        const cycle = now - t;
        if (m.s.roarCycle !== cycle && t >= 16) {
          m.s.roarCycle = cycle;
          m.e.dimension.playSound("mob.ravager.roar", m.e.location, { volume: 3, pitch: m.role === "male" ? 0.5 : 0.58 });
        }
      }
      if (m.s.act === ACT.chuff && now >= m.s.busyUntil && now >= (m.s.puffAt ?? 0)) {
        m.s.puffAt = now + 44; // a burst every 2.2 s (the client's chuff)
        m.e.dimension.playSound("mob.horse.breathe", m.e.location, { volume: 0.7, pitch: m.juvenile ? 1.2 : 0.7 });
      }
    }
    const awake = fam.filter((m) => m.s.posture < 3 && m.s.act !== ACT.roar && m.s.act !== ACT.ambush && m.s.act !== ACT.stalk);
    if (awake.length && now >= (h.idleAt ??= now + between(T.idleEvery))) {
      h.idleAt = now + between(T.idleEvery);
      const m = awake[Math.floor(Math.random() * awake.length)];
      m.e.dimension.playSound(m.juvenile ? "mob.cat.meow" : "mob.polarbear.idle", m.e.location, { volume: 0.5, pitch: m.juvenile ? 0.75 : 0.5 });
    }
    const play = fam.find((m) => m.s.act === ACT.play);
    if (play && now >= (h.playAt ?? 0)) {
      h.playAt = now + 60;
      play.e.dimension.playSound("mob.cat.meow", play.e.location, { volume: 0.4, pitch: 1.0 });
    }
  } catch {
    // Cosmetic only.
  }
}

// What a tiger is doing, for the Field Journal (its zoocraft:act).
export function tigerAct(entity) {
  try {
    return entity.getProperty(ACT_PROP) ?? 0;
  } catch {
    return 0;
  }
}

export function initTigers() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        tigerHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_tiger"] },
  );
  // Let out of a Holding Den: it chuffs.
  on("denChanged", ({ den, animal, shut }) => {
    if (!shut && SPECIES[animal?.speciesId]?.solitary) released.add(animal.id);
    if (shut)
      for (const id of [animal?.id, ...(den?.cubs ?? [])]) {
        const e = id && liveEntity(id);
        if (!e) continue;
        moving.delete(e.id);
        state.delete(e.id);
      }
  });
}
