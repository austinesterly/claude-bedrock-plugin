import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, isNight, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { reachesFeeder, drinksFrom } from "../equipment/rules.js";
import { today } from "./nursery.js";
import { ACT, PACE, ZEBRA_TYPES, roleOf, rankOrder, feedingPlaces, pickMood, isMidday, fileOrder, filePace, findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward, besideOf, threatOf, headingsAway, headingIndex, runLine, HEADINGS, herdsOf, wildSex, footprintOf, crowding, cellsUnder, clearLine, ROOM_TOUCH } from "./zebraRules.js";

// Zebras (0.1.74, the Animal wave; spec 5.2 "zebra | Zebra | Coordinated herd movement | Savanna mixing
// and broad grazing"; the rules are in animals/zebraRules.js). Every half second, for the zebras near
// players: each herd (an exhibit's zebras, or wild zebras close together) has a mood for a while, and
// each zebra does what fits it. Grazing, they spread out heads down, step slowly on, go up to the
// feeders in rank order (the low-ranking ones wait when there's no room) and to the trough; the
// stallion herds a straggler back, two meet nose to nose, foals nurse at their mother's flank and play
// in bursts, rival stallions fight and bachelors spar. Trekking, the herd walks off in single file: the
// mare with the youngest foal (else the top mare) in front, each foal behind its mother, the stallion
// at the rear; the others walk up to where the lead set off and follow on in its steps, trotting to
// catch up. Resting, they doze on their feet, groom in pairs side by side facing opposite ways, rest a
// chin on a partner's back, and one lies down, maybe for a roll in the dust and a shake. At night most
// lie down, some flat out asleep, while one stands watch, and the watch changes. Someone sprinting up
// (or, in the wild, anyone running at them, or a hurt zebra) startles the herd: the first to notice
// barks, they gallop off together, slow to a trot and a walk, then stop, turn and stare, the stallion
// nearest the threat. A newborn's mother keeps the others off for its first park day. Walks, trots and
// gallops glide a tick at a time (tickZebraMoves) at the client's stride speeds, through the exhibit's
// measured floor (or open ground in the wild); everything else is the engine's walking, which the zebra
// gets back whenever it's done. Wild herds move off from anyone who isn't sneaking (the entity's
// avoid_mob_type) and come to a Grain Ration. What each zebra is doing goes to the client through its
// zoocraft:act property for the animations, and the Field Journal reads the same. Sounds are
// throttled per herd.

const RANGE = 48; // blocks from a player: a herd with one of them this close is met, all of it
const KEEP_RANGE = 56; // and kept while one of it is this close (so a herd at the edge isn't met, forgotten and met again)
const TEMPT_RANGE = 8; // someone this close holding its food or an empty carrier: it leaves them to it
const ACT_PROP = "zoocraft:act";
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const state = new Map(); // entity id -> { phase, body, act, actUntil, cool, yaw, busyUntil, upUntil, downUntil, then, after, spot, flee, roll, herd, calmUntil, crowded }
const moving = new Map(); // entity id -> a glide (see glide)
const herds = new Map(); // herd key -> { mood, until, startle, calmUntil, trek, watchId, watchUntil, next, taken, sound, at, from, rejoinAt }
const hurt = new Map(); // entity id -> { x, z, tick }: a wild zebra hurt, and where from
let wildHerds = 0; // wild herds met so far (each new one's key)

/** @param {number[]} range anywhere from range[0] to range[1] */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

// The block a zebra stands in (half a block up, so a slab or carpet underfoot counts as its floor).
function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.5), z: Math.floor(p.z) };
}
const keyOf = (c) => `${c.x},${c.y},${c.z}`;

// Block categories (data/blocks.js), each block read once while a plan is made.
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

// Nothing at a zebra's feet or head in the block `c`: the corners of its ways are cut only past open blocks
// (zebraRules.js smoothWay), so it keeps clear of fence posts, feeders and troughs.
function openAt(dimension) {
  const read = memoRead(dimension);
  return (c) => read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air";
}

// Can a zebra stand in the block `c`? Open at its feet and head (it's 1.7 blocks tall), on a floor.
const FLOORLESS = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded"]);
function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
// Room over its head for a step up out of (or down into) the block `c`.
function headroom(read, c) {
  return read(c.x, c.y + 2, c.z) === "air";
}

// Where a herd may walk: an exhibit's measured floor (exhibits.js cellsOf: "land"; nowhere before the
// exhibit has been measured since the world loaded) but not up on its feeders, racks and troughs, or
// open ground in the wild.
function walker(ctx) {
  if (!ctx.wild) return (c) => ctx.cells?.get(keyOf(c)) === "land" && !ctx.onTop.has(keyOf(c));
  return (c) => standable(ctx.read, c);
}

// ---------------- room ----------------
// The ground a zebra covers (zebraRules.js footprintOf, measured off the model): standing, bucking in
// play, lying down (and getting up), or asleep flat out or rolling.
function howOf(m) {
  const s = m.s;
  if (s?.phase === "down") return s.act === ACT.sleep || s.act === ACT.roll || s.roll ? "sleep" : "lie"; // (a roll to come too)
  if (s?.phase === "up") return "lie";
  if (s?.phase === "act" && s.act === ACT.play) return "buck";
  return "stand";
}

function footprintHere(m, how = howOf(m)) {
  const l = m.e.location;
  return footprintOf(l.x, l.z, m.e.getRotation().y, how, m.juvenile);
}

// The blocks a zebra's body and head cover where it stands (or lies).
function coverOf(m) {
  const fp = footprintHere(m);
  const y = Math.floor(m.e.location.y + 0.5);
  return new Set([...cellsUnder(fp.body, y), ...cellsUnder(fp.head, y)]);
}

// The blocks one being walked somewhere will cover where it's going.
function goalCover(m, g) {
  if (!g.goal) return new Set();
  const fp = footprintOf(g.goal.x, g.goal.z, g.goal.yaw, g.goal.how, m.juvenile);
  const y = Math.floor(g.goal.y + 0.5);
  return new Set([...cellsUnder(fp.body, y), ...cellsUnder(fp.head, y)]);
}

// Every half second a zebra walked somewhere looks along the next blocks of its way: where another has
// since stopped (to graze, doze or lie down) or is going to stop, it takes a new way round them to the
// same place, or stops short where it is when there's none. Not in single file (the others keep off
// the lead's way), nor at a trot or gallop (a run, a fright: over in a moment), nor stepping out from
// between others boxed round it (its way goes past them on purpose).
function lookAhead(m, g, ctx, Z) {
  if (g.file || g.boxed || g.act === ACT.trot || g.act === ACT.gallop || g.s >= g.end || !g.goal) return;
  // Another has since stopped where it was going (the engine walked it there): it stops short.
  const there = footprintOf(g.goal.x, g.goal.z, g.goal.yaw, g.goal.how, m.juvenile);
  for (const o of ctx.herd) {
    if (o === m || o.id === g.partner || moving.has(o.id)) continue;
    if (Math.abs(o.e.location.y - g.goal.y) <= 1.5 && crowding(there, footprintHere(o)) > ROOM_TOUCH) return finish(m.id, g, false);
  }
  const goal = keyOf(cellOf(g.goal));
  const reach = Math.min(g.end, g.s + 2.5);
  let blocked = false;
  for (let d = g.s + 0.25; d <= reach && !blocked; d += 0.25) {
    const k = keyOf(cellOf(pointAlong(g.pts, d)));
    if (k === goal) break;
    blocked = (ctx.standing.get(k) ?? []).some((id) => id !== m.id);
  }
  if (!blocked) return;
  const to = cellOf(g.goal);
  const cells = findWay(walkerFor(ctx, m, to), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? Z.wildWalkSteps : Z.walkSteps, ctx.wild ? Z.wildNodes : Infinity);
  if (!cells) return finish(m.id, g, false);
  const pts = smoothWay(m.e.location, cells, openAt(m.e.dimension));
  if (g.to) {
    const end = { x: g.to.x, y: pts[pts.length - 1].y, z: g.to.z };
    if (pts.length === 1) pts.push(end);
    else pts[pts.length - 1] = end;
  }
  g.pts = pts;
  g.s = 0;
  g.end = wayLength(pts);
}

// Where the others are, or for one being walked somewhere, where it's going (its glide's goal, as it
// will be there: standing, or lying down) and, while it stands waiting, where it is.
function placesOf(o) {
  const g = moving.get(o.id);
  if (!g) return [footprintHere(o)];
  const out = g.goal ? [footprintOf(g.goal.x, g.goal.z, g.goal.yaw, g.goal.how, o.juvenile)] : [];
  if (g.waiting || g.s === 0) out.push(footprintHere(o)); // standing where it is for now
  return out;
}

// Room for `m` to stand (or lie down: how) at (x, z) facing yaw: its body crosses none of the others'
// bodies, and no head goes through a body, beyond touching (zebraRules.js crowding). `partner` is the
// one it pairs up with on purpose (nursing, grooming, resting head to tail, meeting nose to nose,
// fighting), placed together by the numbers.
function roomAt(ctx, m, x, z, yaw, how = "stand", partner = undefined) {
  const fp = footprintOf(x, z, yaw, how, m.juvenile);
  return !crowderOf(ctx, m, fp, partner) && !onTrekWay(ctx, m, fp, m.e.location.y) && !shyAt(ctx, m, x, z);
}

// In the wild, nowhere within shyRange of someone who isn't sneaking (or holding its food) is a place
// to stop: there the engine would only walk it off again.
function shyAt(ctx, m, x, z) {
  if (!ctx.wild || !ctx.players) return false;
  const Z = BALANCE.zebra;
  const y = m.e.location.y;
  for (const p of ctx.players) {
    try {
      if (p.isSneaking || p.dimension.id !== m.e.dimension.id || Z.bait.includes(heldItem(p)?.typeId ?? "")) continue;
      const l = p.location;
      if (Math.hypot(l.x - x, l.y - y, l.z - z) <= Z.shyRange) return true;
    } catch {
      // gone
    }
  }
  return false;
}

// Standing (with footprint `fp`) on the way a file is walking, not one of it.
function onTrekWay(ctx, m, fp, y) {
  const t = ctx.trek;
  if (!t || t.left.has(m.id)) return false;
  const h = Math.floor(y + 0.5);
  for (const k of cellsUnder(fp.body, h)) if (t.way.has(k)) return true;
  for (const k of cellsUnder(fp.head, h)) if (t.way.has(k)) return true;
  return false;
}

function roomFor(ctx, m, cell, yaw, how = "stand", partner = undefined) {
  return roomAt(ctx, m, cell.x + 0.5, cell.z + 0.5, yaw, how, partner);
}

// Whether `m`, walking about where the engine takes it, is about to walk into another: a step on along
// the way it went since the last look (half a second ago), its body would be deeper in one (or in where
// one is going to stand) than it is now.
function walksInto(m, ctx) {
  const s = m.s;
  const l = m.e.location;
  const was = s.was;
  s.was = { x: l.x, z: l.z };
  if (!was || s.body !== "move") return false;
  const dx = l.x - was.x;
  const dz = l.z - was.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.15 || d > 3) return false;
  const yaw = yawTo(dx, dz);
  const here = footprintOf(l.x, l.z, yaw, "stand", m.juvenile);
  const on = footprintOf(l.x + (dx / d) * 0.8, l.z + (dz / d) * 0.8, yaw, "stand", m.juvenile);
  for (const o of ctx.herd ?? []) {
    if (o.id === m.id) continue;
    try {
      if (!o.e.isValid || Math.abs(o.e.location.y - l.y) > 1.5) continue;
      for (const q of placesOf(o)) {
        const deeper = crowding(on, q);
        if (deeper > ROOM_TOUCH && deeper > crowding(here, q) + 0.02) return true;
      }
    } catch {
      // gone
    }
  }
  return false;
}

// The other crowding the footprint `fp` of `m`, if any.
function crowderOf(ctx, m, fp, partner = undefined) {
  const y = m.e.location.y;
  for (const o of ctx.herd ?? []) {
    if (o.id === m.id || o.id === partner) continue;
    try {
      if (!o.e.isValid || Math.abs(o.e.location.y - y) > 1.5) continue;
      for (const q of placesOf(o)) if (crowding(fp, q) > ROOM_TOUCH) return o;
    } catch {
      // gone
    }
  }
  return undefined;
}

// Doing something where it stands (grazing, dozing, lying down, playing, standing watch) needs room
// there: one in another's way first steps off to the nearest place with room (makeRoom). `start(tick)`
// then; false when there's no room near (it carries on walking where the engine takes it).
function inRoom(m, ctx, Z, how, start) {
  const l = m.e.location;
  if (roomAt(ctx, m, l.x, l.z, m.e.getRotation().y, how)) {
    start(system.currentTick);
    return true;
  }
  return makeRoom(m, ctx, Z, how, start);
}

// A step or two off to the nearest block with room for it (four blocks off at most, where the herd is
// packed in a corner), ending facing the way it stepped; then `then(tick)`. False when there's none. One
// boxed in (the others lay down round it, legs out) steps out between them, a few blocks at most.
function makeRoom(m, ctx, Z, how, then) {
  const here = cellOf(m.e.location);
  const near = [];
  for (let dx = -4; dx <= 4; dx++) {
    for (let dz = -4; dz <= 4; dz++) {
      if (dx || dz) near.push({ c: { x: here.x + dx, y: here.y, z: here.z + dz }, d: Math.hypot(dx, dz) + Math.random() * 0.1, yaw: yawTo(dx, dz) });
    }
  }
  near.sort((p, q) => p.d - q.d);
  for (const boxed of [false, true]) {
    const can = boxed ? walker(ctx) : walkerFor(ctx, m);
    for (const { c, yaw } of near) {
      if (!can(c) || !roomFor(ctx, m, c, yaw, how)) continue;
      const way = findWay(can, (q) => headroom(ctx.read, q), here, c, boxed ? 4 : 8);
      if (!way?.length) continue;
      glide(m, way, { act: ACT.step, pace: PACE.walk, face: yaw, how, boxed }, (ok) => (ok ? then(system.currentTick) : settle(m, system.currentTick, Z)));
      return true;
    }
  }
  return false;
}

// The steps of a line it can stop at: cut back to the last block with room for it, facing along the line
// (or `face(cell)`), and no shorter than `least`; empty when there's none.
function roomyLine(ctx, m, line, least = 1, face = undefined) {
  const out = line.slice();
  while (out.length >= least) {
    const end = out[out.length - 1];
    const prev = out.length > 1 ? out[out.length - 2] : cellOf(m.e.location);
    const yaw = face ? face(end) : yawTo(end.x - prev.x, end.z - prev.z);
    if (roomFor(ctx, m, end, yaw)) return out;
    out.pop();
  }
  return [];
}

// Where `m` may walk: the herd's floor, round the blocks the others standing about cover with their
// bodies and heads (grazing, dozing, lying down, waiting their turn in a file: ctx.standing), so it never
// walks through one. Its goal `to` it may always walk to (beside its mother or a partner, whose body may
// reach into it).
function walkerFor(ctx, m, to = undefined) {
  const floor = walker(ctx);
  const goal = to ? keyOf(to) : undefined;
  return (c) => {
    if (!floor(c)) return false;
    const k = keyOf(c);
    if (k === goal) return true;
    const ids = ctx.standing.get(k);
    return !ids || ids.every((id) => id === m.id);
  };
}

// ---------------- the half-second tick ----------------
// Every 10 ticks: the zebras near players, by herd. A herd is met whole, as soon as one of it is within
// RANGE of someone (one at the edge would otherwise be left out, walking through the others), and kept
// whole while one of it is within KEEP_RANGE (its others looked for a herd's reach further out).
export function tickZebras(now) {
  const Z = BALANCE.zebra;
  const players = onlinePlayers();
  const night = isNight();
  let midday = false;
  try {
    midday = isMidday(world.getTimeOfDay());
  } catch {
    // keeps the day's chances
  }
  const seen = new Set();
  const near = new Map(); // entity id -> blocks from the nearest player
  const zoo = new Map(); // exhibit id -> [{ e, a }]
  const wild = []; // [{ e }]
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, KEEP_RANGE + Z.herdReach, ZEBRA_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      const d = Math.hypot(e.location.x - player.location.x, e.location.y - player.location.y, e.location.z - player.location.z);
      if (d < (near.get(e.id) ?? Infinity)) near.set(e.id, d);
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_zebra") {
        wild.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit") continue;
      const herd = zoo.get(a.location.id) ?? [];
      herd.push({ e, a });
      zoo.set(a.location.id, herd);
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
    if (!ex || !species?.harem || !met(members)) continue;
    const key = `ex:${exId}`;
    keys.add(key);
    stepHerd(key, members, zooContext(ex, species, members[0].e), now, players, night, midday, Z);
  }
  // Wild zebras in herds (zebras close together, zebraRules.js herdsOf). A herd keeps its key, and with
  // it its mood, its fright and its calm, while it holds together: each group takes the key most of its
  // zebras had, the biggest group first, so a herd that comes apart is carried on by its bigger part; a
  // group left with no key of its own gets a new one, and the fright and calm of the herd most of its
  // zebras came from (two herds that come together go on as the one most of them were in).
  wild.sort((p, q) => (p.e.id < q.e.id ? -1 : 1));
  const of = herdsOf(
    wild.map(({ e }) => ({ x: e.location.x, z: e.location.z })),
    Z.herdReach,
  );
  const groups = new Map();
  wild.forEach((b, i) => groups.set(of[i], [...(groups.get(of[i]) ?? []), b]));
  for (const members of [...groups.values()].sort((p, q) => q.length - p.length)) {
    if (!met(members)) continue;
    const had = new Map();
    for (const { e } of members) {
      const k = state.get(e.id)?.herd;
      if (k && herds.has(k)) had.set(k, (had.get(k) ?? 0) + 1);
    }
    const olds = [...had].sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1)).map(([k]) => k);
    let key = olds.find((k) => !keys.has(k));
    if (!key) {
      key = `wild:${++wildHerds}`;
      if (olds.length) herds.set(key, partOf(/** @type {any} */ (herds.get(olds[0])), olds[0]));
    }
    keys.add(key);
    stepHerd(key, members, { wild: true, species: SPECIES["zoocraft:zebra"], read: memoRead(members[0].e.dimension), cells: undefined, onTop: new Set(), feeders: [], troughs: [], places: 0 }, now, players, night, midday, Z);
  }
  // Out of everyone's range: forgotten, and back on its feet walking where the engine takes it (met
  // again, it starts afresh).
  for (const [id, s] of [...state]) {
    if (seen.has(id)) continue;
    state.delete(id);
    const g = moving.get(id);
    moving.delete(id);
    // A file it was in (or was about to set off in) walks on without it.
    for (const h of herds.values()) h.trek?.left.delete(id);
    if (g?.file) {
      g.trek.left.delete(id);
      if (g.lead) g.trek.leadDone = true;
    }
    try {
      const e = world.getEntity(id);
      if (e?.isValid) {
        if (s.body !== "move") e.triggerEvent("zoocraft:move");
        setAct(e, ACT.none);
      }
    } catch {
      // unloaded
    }
  }
  for (const key of [...herds.keys()]) if (!keys.has(key)) herds.delete(key);
  for (const [id, h] of [...hurt]) if (now - h.tick > 200) hurt.delete(id);
}

// The part of a wild herd that came apart from the rest: as frightened, and as calm, as the herd was, and
// in its mood (a file that lost its herd comes to a stop: endTrek); it makes its way back (rejoin).
function partOf(h, from) {
  return { mood: h.mood, until: h.until, startle: h.startle && { ...h.startle }, calmUntil: h.calmUntil, trek: undefined, watchId: h.watchId, watchUntil: h.watchUntil, next: { ...h.next }, taken: new Map(), sound: {}, from };
}

// What a zoo herd has to work with: the measured floor, the feeders holding food they eat, the troughs
// with water, and the feeding places. The blocks on top of its feeders, racks and fixtures (a Water
// Trough, a Basic Feeder, a Hay Rack on the floor) are open floor to the measure, as an animal could jump
// up there, but a zebra goes round them: it never climbs onto one (onTop).
function zooContext(ex, species, e) {
  const read = memoRead(e.dimension);
  const cells = cellsOf(ex.id);
  const all = ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean);
  const fixtures = fixturesOf(ex);
  const onTop = new Set([...all, ...fixtures].map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  const feeders = all.filter((f) => f.units > 0 && species.dietTags.includes(RATIONS[f.item]?.diet) && reachesFeeder(species, f));
  const troughs = fixtures.filter((f) => f.type === "trough" && f.units > 0 && drinksFrom(species, f));
  return { wild: false, ex, species, read, cells, onTop, feeders, troughs, places: feedingPlaces(feeders, BALANCE.zebra.places) };
}

// Where to stand to eat or drink at the block `pos`, and how: beside it on the floor, facing it. A
// feeder level with its feet it eats from the top of (feed), one sunk a block it grazes from; a Hay
// Rack hung a block up it reaches up into (rack), one on the ground it eats from at head height
// (rackLow); a trough level with its feet it drinks from, one sunk a block it grazes at.
function spotsAt(pos, kind, can) {
  const out = [];
  const acts =
    kind === "rack"
      ? [
          [-1, ACT.rack],
          [0, ACT.rackLow],
        ]
      : [
          [0, kind === "trough" ? ACT.drink : ACT.feed],
          [1, ACT.graze],
        ];
  for (const [dx, dz] of DIRS) {
    for (const [dy, act] of acts) {
      const c = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
      if (can(c)) out.push({ cell: c, act, yaw: yawTo(-dx, -dz), key: `${keyOf(pos)}>${keyOf(c)}` });
    }
  }
  return out;
}

const kindOf = (f) => (f.type === "trough" ? "trough" : f.rack ? "rack" : "feeder");

// ---------------- the herd ----------------
function describe(members, ctx) {
  const out = members.map(({ e, a }) => ({ e, a, id: e.id, aid: a?.id, juvenile: Boolean(a?.juvenile), role: "mare", motherId: undefined, born: a?.bornDay, feeds: true, s: undefined }));
  if (ctx.wild) {
    // A wild herd: each zebra's sex is fixed by its entity id (zebraRules.js wildSex; a caught one
    // keeps it), so its stallion is the first male and the females are his mares.
    for (const m of out) m.role = wildSex(m.id) === "male" ? "stallion" : "mare";
    out.forEach((m, i) => (m.rank = i));
    return out;
  }
  for (const m of out) {
    m.role = roleOf(m.a, ctx.species);
    const mum = m.a.parents?.[0];
    m.motherId = mum ? out.find((o) => o.aid === mum)?.id : undefined;
  }
  // Rank order (the stallion, then the mares in the order they came), foals after.
  const rank = rankOrder(
    out.map((m) => m.a),
    ctx.species,
    ctx.ex.animalIds,
  ).map((a) => a.id);
  const at = (m) => (m.juvenile ? 1000 : rank.indexOf(m.aid));
  out.sort((p, q) => at(p) - at(q));
  out.forEach((m, i) => (m.rank = i)); // who gives way to whom (foals to everyone)
  // Who gets to the food: the first `places` grown-ups in rank; foals eat with their mothers.
  const allowed = new Set(rank.slice(0, ctx.places));
  for (const m of out) m.feeds = m.juvenile || allowed.has(m.aid);
  return out;
}

function stepHerd(key, members, ctx, now, players, night, midday, Z) {
  let h = herds.get(key);
  if (!h) {
    h = { mood: undefined, until: 0, startle: undefined, calmUntil: 0, trek: undefined, watchId: undefined, watchUntil: 0, next: {}, taken: new Map(), sound: {} };
    herds.set(key, h);
  }
  const herd = describe(members, ctx);
  ctx.herd = herd;
  ctx.players = players; // in the wild, anyone it shies from
  ctx.trek = h.trek; // a file on its way: the others keep off it
  h.at = { x: herd.reduce((n, m) => n + m.e.location.x, 0) / herd.length, z: herd.reduce((n, m) => n + m.e.location.z, 0) / herd.length };
  for (const m of herd) {
    let s = state.get(m.id);
    if (!s) {
      s = { phase: "idle", body: undefined, act: ACT.none, actUntil: 0, cool: now + between(Z.coolTicks), yaw: undefined, busyUntil: 0, upUntil: 0 };
      state.set(m.id, s);
      // Met (again): on its feet, nothing on, so it can never be left standing still.
      try {
        body(m.e, s, "move");
        setAct(m.e, ACT.none);
      } catch {
        // gone
      }
    }
    m.s = s;
    s.herd = key;
  }
  // The blocks the ones not being walked along cover, and those the ones being walked somewhere will
  // cover when they get there: the others' ways go round them.
  ctx.standing = new Map();
  for (const m of herd) {
    const g = moving.get(m.id);
    const cover = g ? new Set([...goalCover(m, g), ...(g.waiting || g.s === 0 ? coverOf(m) : [])]) : coverOf(m);
    for (const k of cover) ctx.standing.set(k, [...(ctx.standing.get(k) ?? []), m.id]);
  }
  for (const m of herd) {
    const g = moving.get(m.id);
    if (g) guard(() => lookAhead(m, g, ctx, Z), m);
  }
  // Places at the food held by zebras that have since moved on.
  for (const [k, id] of [...h.taken]) if (state.get(id)?.spot !== k) h.taken.delete(k);
  // Startled: someone sprinting up (zoo 6 blocks, wild 16), a hurt zebra, or (rarely, in a zoo) nothing
  // at all. Once over it, a herd stays calm for a while, so someone running about doesn't keep it on the
  // run; each zebra remembers that too (a wild herd that ran may come apart, or be met again). Being hurt
  // isn't something it calms down about: hurt while it stands and stares after running, it's off again;
  // hurt while running off (or about to), it's running already.
  const sore = herd.map((m) => hurt.get(m.id)).find(Boolean);
  if (sore && h.startle) {
    const stopped = now >= h.startle.runAt && herd.every((m) => !moving.has(m.id));
    for (const m of herd) hurt.delete(m.id);
    if (stopped) startle(h, herd, sore, now, Z, ctx.wild);
  } else if (sore) {
    for (const m of herd) hurt.delete(m.id);
    startle(h, herd, sore, now, Z, ctx.wild);
  } else if (!h.startle && now >= h.calmUntil && herd.every((m) => now >= (m.s.calmUntil ?? 0))) {
    const dimId = members[0].e.dimension.id;
    const near = players
      .filter((p) => p.dimension.id === dimId)
      .map((p) => ({ x: p.location.x, z: p.location.z, sprinting: Boolean(p.isSprinting), sneaking: Boolean(p.isSneaking) }));
    const pos = herd.map((m) => m.e.location);
    /** @type {{ x: number, z: number } | undefined} */
    let threat = threatOf(pos, near, ctx.wild ? Z.wildStartleRange : Z.startleRange);
    if (!threat && !ctx.wild && Math.random() < Z.randomStartle) {
      const c = pos[Math.floor(Math.random() * pos.length)];
      const a = Math.random() * Math.PI * 2;
      threat = { x: c.x + Math.cos(a) * 6, z: c.z + Math.sin(a) * 6 };
    }
    if (threat) startle(h, herd, threat, now, Z, ctx.wild);
  }
  if (h.startle) {
    if (now < h.startle.until) {
      // The ones furthest along the way they run set off first, so each run ends clear of those ahead.
      const d = h.startle.dirs[0];
      const along = (m) => m.e.location.x * d.x + m.e.location.z * d.z;
      for (const m of herd.slice().sort((p, q) => along(q) - along(p))) guard(() => fleeStep(m, h, herd, ctx, now, Z), m);
      return;
    }
    h.startle = undefined;
    h.calmUntil = now + Z.calmTicks;
    for (const m of herd) m.s.calmUntil = h.calmUntil;
    h.mood = "graze";
    h.until = now + between(Z.moodTicks);
  }
  // The file is in (or has walked long enough): back to grazing.
  if (h.mood === "trek" && (!h.trek || now >= h.trek.until || !h.trek.left.size)) endTrek(h, herd, now, Z);
  // A part of a wild herd that came apart (in a fright, say) calls and makes its way back to the rest by
  // day, as soon as the fright is over: in single file, or one on its own at a trot. Close enough, it's
  // one herd again (herdsOf).
  if (h.from && !herds.has(h.from)) h.from = undefined; // the rest are gone, or met again as part of it
  const rest = h.from && !night ? herds.get(h.from)?.at : undefined;
  if (rest && h.mood !== "trek" && h.mood !== "night" && now >= (h.rejoinAt ?? 0)) {
    h.rejoinAt = now + 100;
    if (rejoin(h, herd, ctx, rest, now, Z) && h.trek) {
      h.mood = "trek";
      h.until = now + Z.trekTicks;
    }
  }
  // A new mood when this one has run out (a trek runs to its end), and straight away at dusk and dawn.
  const dark = h.mood === "night";
  if (!h.mood || night !== dark || (now >= h.until && h.mood !== "trek")) {
    if (h.trek) endTrek(h, herd, now, Z);
    h.mood = pickMood({ night, midday }, Z);
    h.until = now + between(Z.moodTicks);
    // While a part of it is lost, a wild herd stays about (calling back), so the lost ones find it.
    if (h.mood === "trek" && ctx.wild && [...herds.values()].some((o) => o.from === key)) h.mood = "graze";
    // The herd's own timers (nursing, herding, greetings, fights) run on through its moods: a mood is
    // shorter than most of them, so starting them afresh with each would mean they never came round.
    if (h.mood === "trek" && !planTrek(h, herd, ctx, now, Z)) h.mood = "graze";
    if (h.mood === "rest") planRest(herd, ctx, now, Z);
    if (h.mood === "night") planNight(h, herd, now, Z);
  }
  // The herd's own goings on: a newborn's mother keeping the others off, the stallion herding a
  // straggler, greetings, fights and sparring (by day, grazing).
  if (!ctx.wild && h.mood !== "night") guard(() => imprint(herd, ctx, Z));
  if (h.mood === "graze") {
    guard(() => herding(h, herd, ctx, now, Z));
    guard(() => greeting(h, herd, ctx, now, Z));
    if (!ctx.wild) guard(() => rivals(h, herd, ctx, now, Z));
  }
  for (const m of herd) guard(() => stepZebra(m, h, herd, ctx, now, players, Z), m);
  sounds(h, herd, now, Z);
}

// One zebra's misstep never stops the rest: it is forgotten and met again next time.
function guard(fn, m = undefined) {
  try {
    fn();
  } catch {
    if (m) {
      state.delete(m.id);
      moving.delete(m.id);
    }
  }
}

// ---------------- the glide: walking, trotting and galloping where the script takes it ----------------
// Every tick: the zebras being walked along their ways. A follower in single file keeps its place
// behind the lead (how far the lead has walked, less the gaps in front of it: zebraRules.js filePace);
// a run eases down to a trot and a walk before it stops (BALANCE.zebra.easeTrot, easeWalk blocks
// before its end); anything built in the way since it set off stops it there.
export function tickZebraMoves() {
  const now = system.currentTick;
  const Z = BALANCE.zebra;
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
      if (now < m.start) {
        m.waiting = true;
        continue;
      }
      let pace = m.pace;
      let act = m.act;
      if (m.file && !m.lead) {
        // It sets off only once the one in front of it is on its way and past where the lead set off
        // (one getting up first holds up those behind it), so two never cross on their way there; the
        // later one trots to catch up.
        if (m.s === 0 && m.ahead && m.trek.left.has(m.ahead)) {
          const front = moving.get(m.ahead);
          if (!front?.file || front.s < front.approach) {
            setAct(e, ACT.none);
            m.waiting = true;
            continue;
          }
        }
        // As far as the lead has walked less the gaps in front of it, and never closer than its gap to the
        // one in front where that one really is (it may have fallen behind): along their ways, and as the
        // crow flies (where it falls in behind, the corners of their two ways are cut differently).
        let want = Math.min(m.end, m.approach + m.trek.leadDist - m.behind);
        const front = m.ahead ? moving.get(m.ahead) : undefined;
        if (front?.file && front.trek === m.trek && front.s >= front.approach) want = Math.min(want, m.approach + (front.s - front.approach) - (m.behind - front.behind));
        if (front?.file && front.trek === m.trek && front.s > 0) {
          const fl = front.e.location;
          if (Math.hypot(fl.x - e.location.x, fl.z - e.location.z) < m.behind - front.behind - 0.05) want = Math.min(want, m.s);
        }
        const how = filePace(m.s, want, m.trotting);
        m.trotting = how === "trot";
        if (how === "wait") {
          // In its place: it stands until the lead walks on, or, once the lead is there, it's there too.
          if (m.trek.leadDone || m.s >= m.end) {
            finish(id, m, true);
            continue;
          }
          setAct(e, ACT.none);
          m.waiting = true;
          continue;
        }
        pace = Math.min(how === "trot" ? PACE.trot : PACE.walk, want - m.s);
        act = how === "trot" ? ACT.trot : ACT.file;
      } else if (m.ease) {
        const left = m.end - m.s;
        if (left < Z.easeWalk && pace > PACE.walk) {
          pace = PACE.walk;
          act = ACT.step;
        } else if (left < Z.easeTrot && pace > PACE.trot) {
          pace = PACE.trot;
          act = ACT.trot;
        }
      }
      // Two walking where their ways cross: the one lower in rank stops to let the other by (three
      // seconds at most), so they never walk through each other. One setting off at a run (a fright, a
      // foal's gallop) right behind another holds back a moment (a second and a half at most) till
      // there's room ahead, so they never run one inside the other.
      const walking = !m.file && pace <= PACE.walk && m.s < m.end;
      const running = !m.file && pace > PACE.walk && m.s < 2;
      if ((walking && givesWay(id, m)) || (running && runsInto(id, m))) {
        if (++m.held < (walking ? 60 : 30)) {
          setAct(e, walking ? ACT.none : ACT.alert);
          m.waiting = true;
          continue;
        }
      } else m.held = 0;
      m.waiting = false;
      if (m.s < m.end) {
        const s = Math.min(m.end, m.s + pace);
        const p = pointAlong(m.pts, s);
        const c = cellOf(p);
        const k = keyOf(c);
        if (k !== m.cell) {
          if (!standable(m.read, c) && !standable(m.read, { x: c.x, y: c.y - 1, z: c.z })) {
            finish(id, m, false);
            continue;
          }
          m.cell = k;
        }
        m.s = s;
        if (m.file && m.lead) m.trek.leadDist = s;
        if (p.dx || p.dz) m.yaw = turnToward(m.yaw, yawTo(p.dx, p.dz), m.turn);
        setAct(e, act);
        e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
        footfall(e, m, act, now);
        continue;
      }
      // There: turning on the spot to face what it came for, stepping round.
      if (m.face !== undefined && Math.abs(((((m.face - m.yaw) % 360) + 540) % 360) - 180) > 2) {
        m.yaw = turnToward(m.yaw, m.face, m.faceTurn);
        setAct(e, ACT.step);
        e.setRotation({ x: 0, y: m.yaw });
        continue;
      }
      finish(id, m, true);
    } catch {
      moving.delete(id);
    }
  }
}

// Whether `m` (walking along its way) stops for another walked by the script: half a block on, its body
// would crowd the other's where it is now, and either the other is ahead of it going the same way (two
// that set off together keep one behind the other, whatever their ranks: the one in front walks on and
// gets clear), or their ways cross and the other goes first: walking in single file, higher in rank, or
// standing (waiting its turn in a file: the next look ahead takes it round). Not one waiting for it, nor
// one it is already through crossing (walking on is how it gets clear).
function givesWay(id, m) {
  const p = pointAlong(m.pts, Math.min(m.end, m.s + 0.6));
  const l = m.e.location;
  const len = Math.hypot(p.dx, p.dz);
  const yaw = len > 0.001 ? yawTo(p.dx, p.dz) : m.yaw;
  const dir = { x: -Math.sin((yaw * Math.PI) / 180), z: Math.cos((yaw * Math.PI) / 180) };
  const next = footprintOf(p.x, p.z, yaw, "stand", m.foal);
  const here = footprintOf(l.x, l.z, m.yaw, "stand", m.foal);
  for (const [oid, o] of moving) {
    if (oid === id || (o.held > 0 && o.rank > m.rank)) continue;
    let ol;
    try {
      ol = o.e.location;
    } catch {
      continue;
    }
    if (Math.abs(ol.y - l.y) > 1.5 || Math.hypot(ol.x - l.x, ol.z - l.z) > 4) continue;
    const theirs = footprintOf(ol.x, ol.z, o.yaw, "stand", o.foal);
    if (crowding(next, theirs) <= ROOM_TOUCH) continue;
    const ahead = (ol.x - l.x) * dir.x + (ol.z - l.z) * dir.z > 0;
    const sameWay = -Math.sin((o.yaw * Math.PI) / 180) * dir.x + Math.cos((o.yaw * Math.PI) / 180) * dir.z > 0.5;
    if (ahead && sameWay) return true;
    if (crowding(here, theirs) > ROOM_TOUCH) continue;
    if (o.file || o.rank < m.rank || o.waiting) return true;
  }
  return false;
}

// Whether `m`, setting off at a run, would run into another walked by the script ahead of it: half a
// block on, its body would crowd one in front of it (along its way).
function runsInto(id, m) {
  const p = pointAlong(m.pts, Math.min(m.end, m.s + 0.6));
  const l = m.e.location;
  const next = footprintOf(p.x, p.z, Math.hypot(p.dx, p.dz) > 0.001 ? yawTo(p.dx, p.dz) : m.yaw, "stand", m.foal);
  for (const [oid, o] of moving) {
    if (oid === id) continue;
    let ol;
    try {
      ol = o.e.location;
    } catch {
      continue;
    }
    if (Math.abs(ol.y - l.y) > 1.5 || Math.hypot(ol.x - l.x, ol.z - l.z) > 4) continue;
    if ((ol.x - l.x) * p.dx + (ol.z - l.z) * p.dz <= 0) continue; // not ahead of it
    if (crowding(next, footprintOf(ol.x, ol.z, o.yaw, "stand", o.foal)) > ROOM_TOUCH) return true;
  }
  return false;
}

function finish(id, m, ok) {
  moving.delete(id);
  if (m.file && m.lead) m.trek.leadDone = true;
  const s = state.get(id);
  if (s) s.yaw = undefined;
  m.done(ok);
}

// Hoof falls: two a stride walking, a drum of four galloping; three zebras' worth at most a tick.
let lastFootfall = -1;
let footfalls = 0;
function footfall(e, m, act, now) {
  const every = act === ACT.gallop ? 9 : act === ACT.trot ? 7 : 10;
  if ((now + m.phase) % every !== 0) return;
  if (now !== lastFootfall) {
    lastFootfall = now;
    footfalls = 0;
  }
  if (++footfalls > 3) return;
  try {
    const gallop = act === ACT.gallop;
    e.dimension.playSound(gallop ? "mob.horse.gallop" : "mob.horse.soft", e.location, { volume: gallop ? 0.35 : 0.15, pitch: 0.9 + Math.random() * 0.2 });
  } catch {
    // Cosmetic only.
  }
}

/**
 * Walk (or trot, or gallop) a zebra through the blocks `cells` from where it stands, then `done(ok)`.
 * opts: act (what it shows on the way), pace (blocks a tick), turn (degrees a tick), face (a yaw to turn
 * to once there, stepping round at faceTurn degrees a tick), to (an exact end point in the last block
 * instead of its centre), start (a tick to set
 * off), end (blocks along the way to stop at, short of its end), ease (slow to a trot and a walk before
 * it stops), file (single file: { trek, lead, approach, behind, ahead }: approach, the blocks of its walk
 * up to where the lead set off; behind, the gaps in front of it; ahead, the one in front of it).
 */
function glide(m, cells, opts, done) {
  const e = m.e;
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const pts = smoothWay(from, cells, openAt(e.dimension));
  if (opts.to) {
    const to = { x: opts.to.x, y: pts[pts.length - 1].y, z: opts.to.z };
    if (pts.length === 1) pts.push(to);
    else pts[pts.length - 1] = to;
  }
  m.s.phase = "glide";
  m.s.after = undefined;
  body(e, m.s, "still");
  // Where it will stand at the end, facing which way, and how (opts.how: lying down there, say): the
// others leave it room there (roomAt).
  const end = opts.end ?? wayLength(pts);
  const last = pointAlong(pts, end);
  const goal = { x: last.x, y: last.y, z: last.z, yaw: opts.face ?? (Math.hypot(last.dx, last.dz) > 0.001 ? yawTo(last.dx, last.dz) : e.getRotation().y), how: opts.how ?? "stand" };
  moving.set(e.id, {
    e,
    pts,
    s: 0,
    end,
    goal,
    pace: opts.pace ?? PACE.walk,
    act: opts.act ?? ACT.step,
    turn: opts.turn ?? 14,
    yaw: e.getRotation().y,
    face: opts.face,
    to: opts.to,
    partner: opts.partner, // the one it is walking up to on purpose (nursing, grooming, meeting, herding)
    boxed: Boolean(opts.boxed), // stepping out between others boxed round it (makeRoom): past them on purpose
    faceTurn: opts.faceTurn ?? 12,
    ease: Boolean(opts.ease),
    // Read afresh as it goes, so a block put in its way since it set off stops it.
    read: blockReader(e.dimension),
    cell: keyOf(cellOf(from)),
    start: opts.start ?? 0,
    phase: Math.floor(Math.random() * 10),
    file: Boolean(opts.file),
    trek: opts.file?.trek,
    lead: opts.file?.lead ?? false,
    approach: opts.file?.approach ?? 0,
    behind: opts.file?.behind ?? 0,
    ahead: opts.file?.ahead,
    trotting: false,
    foal: m.juvenile,
    rank: m.rank ?? 0,
    waiting: false, // standing for now: waiting its turn in a file, or letting another by
    held: 0, // ticks it has stood letting another by
    done,
  });
}

// A way to the block `to` through the blocks it may walk (in the wild, not looking at too many).
function wayTo(m, ctx, to) {
  const Z = BALANCE.zebra;
  return findWay(walkerFor(ctx, m, to), (c) => headroom(ctx.read, c), cellOf(m.e.location), to, ctx.wild ? Z.wildWalkSteps : Z.walkSteps, ctx.wild ? Z.wildNodes : Infinity);
}

// Walk to the block `to` (its middle, where it was found to have room), then `then(ok)`. False when
// there's no way.
function walkTo(m, ctx, to, opts, then) {
  const way = wayTo(m, ctx, to);
  if (!way) return false;
  if (!way.length && !opts.to) {
    // Already in that block: a step to its middle, unless it's there.
    const l = m.e.location;
    if (Math.hypot(l.x - (to.x + 0.5), l.z - (to.z + 0.5)) > 0.1) opts = { ...opts, to: { x: to.x + 0.5, y: to.y, z: to.z + 0.5 } };
    else if (opts.face === undefined) {
      then(true);
      return true;
    }
  }
  glide(m, way, opts, then);
  return true;
}

// Turning round where it stands to face `yaw`, stepping round (degrees a tick), then `then`: a turn
// players see, never a snap. Cut short (a fright), it gets its body back instead.
function turnTo(m, yaw, rate, then) {
  glide(m, [], { act: ACT.step, face: yaw, faceTurn: rate }, (ok) => (ok ? then() : settle(m, system.currentTick, BALANCE.zebra)));
}
// Ticks a turn to `yaw` takes at `rate` degrees a tick.
function turnTicks(m, yaw, rate) {
  const d = Math.abs(((((yaw - m.e.getRotation().y) % 360) + 540) % 360) - 180);
  return Math.ceil(d / rate);
}

// ---------------- one zebra ----------------
function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}

// Its body: "move" (walking where the engine takes it) or "still" (standing put while it does
// something, or while a glide carries it). Each event swaps the other group out, and both hold the
// walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(how === "move" ? "zoocraft:move" : "zoocraft:still");
  s.body = how;
}

function settle(m, now, Z) {
  const s = m.s;
  s.phase = "idle";
  s.cool = now + between(Z.coolTicks);
  s.yaw = undefined;
  releaseSpot(m);
  body(m.e, s, "move");
  setAct(m.e, ACT.none);
}

// Doing `act` where it stands for `ticks` (or a range), facing `yaw` if given.
function startAct(m, now, act, ticks, yaw = undefined) {
  const s = m.s;
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  s.after = undefined;
  body(m.e, s, "still");
  setAct(m.e, act);
  if (yaw !== undefined) m.e.setRotation({ x: 0, y: yaw });
}

// Lying down (lie, asleep or a roll): the client plays lying down first, rolls from lying, and wakes
// before anything else from asleep (gen/zebra_anim.py); busyUntil is when it has finished whatever it's
// playing, so nothing changes under it.
function goDown(m, now, act, Z) {
  const s = m.s;
  const wasDown = s.phase === "down";
  const from = wasDown ? s.act : ACT.none;
  const start = Math.max(now, s.busyUntil);
  s.phase = "down";
  s.yaw = undefined;
  releaseSpot(m);
  body(m.e, s, "still");
  if (!wasDown) s.busyUntil = start + Z.downTicks + (act === ACT.sleep ? Z.toSleepTicks : act === ACT.roll ? Z.rollTicks : 0);
  else if (from === ACT.sleep && act !== ACT.sleep) s.busyUntil = start + Z.wakeTicks + (act === ACT.roll ? Z.rollTicks : 0);
  else if (act === ACT.sleep && from !== ACT.sleep) s.busyUntil = start + Z.toSleepTicks;
  else if (act === ACT.roll && from !== ACT.roll) s.busyUntil = start + Z.rollTicks;
  s.act = act;
  setAct(m.e, act);
}

// Getting up: it finishes lying down (or a roll) first, wakes if asleep, then gets up front first; then `then`.
function getUp(m, now, Z, then = undefined) {
  const s = m.s;
  if (s.phase !== "down") return;
  const start = Math.max(now, s.busyUntil);
  s.upUntil = start + (s.act === ACT.sleep ? Z.wakeTicks : 0) + Z.upTicks;
  s.phase = "up";
  s.then = then;
  s.act = ACT.none;
  setAct(m.e, ACT.none);
}

function isBusy(m) {
  return moving.has(m.id) || m.s.phase === "up" || m.s.phase === "glide";
}

// Free for the herd's goings on (nursing, meeting, a fight or sparring, herding a straggler, a newborn's
// mother keeping the others off): standing about, or grazing (it looks up from the grass for it). Not
// while it walks, eats or drinks at its place, dozes, lies down or is busy with another.
function isFree(m) {
  return !isBusy(m) && (m.s.phase === "idle" || (m.s.phase === "act" && m.s.act === ACT.graze));
}

function stepZebra(m, h, herd, ctx, now, players, Z) {
  const s = m.s;
  if (s.phase !== "idle" || moving.has(m.id)) s.was = undefined; // where it stood at the last look (walksInto)
  if (moving.has(m.id)) return;
  if (s.phase === "glide") return settle(m, now, Z); // its glide was cut short
  if (s.phase === "up") {
    if (now < s.upUntil) return;
    const then = s.then;
    s.then = undefined;
    settle(m, now, Z);
    if (then) then();
    return;
  }
  // Someone close by holding its food or an empty carrier, or (wild) anyone not sneaking: the engine
  // brings it to them or walks it off, so it gets its body back.
  if (tempted(m.e, players, Z) || (ctx.wild && spooked(m.e, players, Z))) {
    if (s.phase === "down") return getUp(m, now, Z);
    if (s.phase !== "idle") settle(m, now, Z);
    return;
  }
  // Standing in another's way (the engine walked it up close) for a second: it steps off to where there's
  // room. Of two walking about, the one lower in rank gives way.
  if (s.phase === "idle") {
    // In the way of a file walking past: it steps off it straight away.
    if (onTrekWay(ctx, m, footprintHere(m), m.e.location.y) && makeRoom(m, ctx, Z, "stand", () => settle(m, system.currentTick, Z))) return;
    // Walking about where the engine takes it, it doesn't walk on into another: it stops there (first
    // stepping off, if it's already in one's way) and grazes a while, or, the herd not grazing, stands a
    // moment; the engine's walk lapses.
    if (walksInto(m, ctx)) {
      s.was = undefined;
      const act = h.mood === "graze" ? ACT.graze : ACT.none;
      if (inRoom(m, ctx, Z, "stand", (t) => startAct(m, t, act, act === ACT.graze ? Z.grazeTicks : Z.stopTicks))) return;
    }
    const o = crowderOf(ctx, m, footprintHere(m));
    const standing = o && (!moving.has(o.id) || moving.get(o.id).waiting); // (one waiting its turn in a file stands too)
    if (o && standing && (o.s?.phase !== "idle" || herd.indexOf(o) < herd.indexOf(m))) {
      s.crowded = (s.crowded ?? 0) + 1;
      if (s.crowded >= 2 && makeRoom(m, ctx, Z, "stand", () => settle(m, system.currentTick, Z))) {
        s.crowded = 0;
        return;
      }
    } else s.crowded = 0;
  }
  if (s.phase === "act") {
    // Grazing where a file is walking past: it steps off its way and grazes on.
    if (s.act === ACT.graze && onTrekWay(ctx, m, footprintHere(m), m.e.location.y) && makeRoom(m, ctx, Z, "stand", (t) => startAct(m, t, ACT.graze, Z.grazeTicks))) return;
    if (now < s.actUntil) return acting(m);
    const next = s.after;
    settle(m, now, Z);
    if (next) next();
    return;
  }
  if (h.mood === "night") return nightStep(m, h, herd, ctx, now, Z);
  if (s.phase === "down") return restDown(m, h, now, Z);
  if (h.mood === "rest") return restStep(m, ctx, now, Z);
  if (h.mood === "trek") return; // walking in file, or standing where it stopped
  grazeStep(m, h, herd, ctx, now, Z);
}

// While it does something: it keeps facing the way it should.
function acting(m) {
  const s = m.s;
  if (s.yaw !== undefined) m.e.setRotation({ x: 0, y: s.yaw });
  setAct(m.e, s.act);
}

// Someone close by holding its food or an empty carrier: it lets them tempt or catch it.
function tempted(e, players, Z) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const id = heldItem(p)?.typeId ?? "";
    if (!(Z.bait.includes(id) || carrierByItem(id)?.full === false)) continue;
    const l = p.location;
    if (Math.hypot(l.x - e.location.x, l.y - e.location.y, l.z - e.location.z) <= TEMPT_RANGE) return true;
  }
  return false;
}

// Wild zebras keep away from people (the entity's avoid_mob_type, out to the same range): anyone this
// close who isn't sneaking.
function spooked(e, players, Z) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || p.isSneaking) continue;
    const l = p.location;
    if (Math.hypot(l.x - e.location.x, l.y - e.location.y, l.z - e.location.z) <= Z.shyRange) return true;
  }
  return false;
}

// ---------------- grazing ----------------
// Spread out, heads down: grazing a while, a slow step or two on, then grazing again; now and then up
// to a feeder (a free place there, in rank order) or the trough. Foals keep near their mothers, nurse
// and play. Between times the engine walks it about with the herd.
function grazeStep(m, h, herd, ctx, now, Z) {
  const s = m.s;
  if (now < s.cool) return;
  if (m.juvenile && !ctx.wild && foalStep(m, h, herd, ctx, now, Z)) return;
  // A foal lives on its mother's milk (and grazes a little): it doesn't go up to the feeders, racks and
  // troughs, whose eating and drinking poses are made for a grown zebra's reach.
  const r = Math.random();
  if (!m.juvenile && m.feeds && r < Z.feedChance && toFood(m, h, ctx, ctx.feeders, Z)) return;
  if (!m.juvenile && r >= Z.feedChance && r < Z.feedChance + Z.drinkChance && toFood(m, h, ctx, ctx.troughs, Z)) return;
  if (Math.random() < Z.grazeChance) {
    const step = Math.random() < Z.stepChance;
    inRoom(m, ctx, Z, "stand", (t) => {
      startAct(m, t, ACT.graze, Z.grazeTicks);
      // Then a slow step or two on, still grazing (the herd drifts as it grazes).
      if (step) m.s.after = () => stepOn(m, ctx, Z);
    });
  }
}

// A step or two straight on (or turned a little), head still low: then grazing again.
function stepOn(m, ctx, Z) {
  const yaw = m.e.getRotation().y;
  const turn = Math.random() < 0.5 ? 0 : Math.random() < 0.5 ? 1 : -1;
  const i = (((Math.round(yaw / 45) + turn) % 8) + 8) % 8;
  const line = runLine(walkerFor(ctx, m), (c) => headroom(ctx.read, c), cellOf(m.e.location), HEADINGS[i], 1 + Math.floor(Math.random() * 2));
  // It stops where there's room for it: one step, if two would crowd another.
  const way = roomyLine(ctx, m, line);
  if (!way.length) return;
  glide(m, way, { act: ACT.step, pace: PACE.walk }, (ok) => {
    const t = system.currentTick;
    if (!ok) return settle(m, t, Z);
    startAct(m, t, ACT.graze, Z.grazeTicks);
  });
}

// Up to a feeder, rack or trough with a free place, then eating or drinking there. False when there's
// none it can reach.
function toFood(m, h, ctx, list, Z) {
  if (!list.length || !ctx.cells) return false;
  const here = m.e.location;
  const options = [];
  for (const f of list) {
    const kind = kindOf(f);
    const room = kind === "trough" ? Z.places.trough : kind === "rack" ? Z.places.rack : f.puzzle ? Z.places.puzzle : Z.places.feeder;
    const spots = spotsAt(f.pos, kind, walkerFor(ctx, m));
    if (spots.filter((p) => h.taken.has(p.key)).length >= room) continue;
    for (const p of spots) if (!h.taken.has(p.key) && roomFor(ctx, m, p.cell, p.yaw)) options.push({ ...p, d: Math.hypot(p.cell.x + 0.5 - here.x, p.cell.z + 0.5 - here.z) });
  }
  options.sort((p, q) => p.d - q.d);
  for (const spot of options.slice(0, 3)) {
    h.taken.set(spot.key, m.id);
    m.s.spot = spot.key;
    const ok = walkTo(m, ctx, spot.cell, { act: ACT.step, pace: PACE.walk, face: spot.yaw }, (arrived) => {
      const t = system.currentTick;
      if (!arrived) return settle(m, t, Z);
      startAct(m, t, spot.act, spot.act === ACT.drink ? Z.drinkTicks : Z.feedTicks, spot.yaw);
      m.s.spot = spot.key; // its place, while it eats there
    });
    if (ok) return true;
    h.taken.delete(spot.key);
    m.s.spot = undefined;
  }
  return false;
}

// Its place at the food, given up.
function releaseSpot(m) {
  const s = m.s;
  if (!s.spot) return;
  for (const h of herds.values()) if (h.taken.get(s.spot) === m.id) h.taken.delete(s.spot);
  s.spot = undefined;
}

// ---------------- foals ----------------
// A foal nurses at its mother's left flank now and then (she stands for it, her head round to it),
// plays in bursts (bucking, or a gallop round her), and keeps near her.
function foalStep(m, h, herd, ctx, now, Z) {
  const mother = herd.find((o) => o.id === m.motherId);
  if (!mother) return false;
  const far = dist(m, mother);
  const next = (h.next[`nurse:${m.id}`] ??= now + between(Z.nurseEvery));
  if (now >= next && isFree(mother) && far <= 12) {
    h.next[`nurse:${m.id}`] = now + between(Z.nurseEvery);
    if (nurse(m, mother, ctx, now, Z)) return true;
    h.next[`nurse:${m.id}`] = now + between(Z.tryAgain); // no room at her flank just now
  }
  if (far > Z.foalStray) {
    // Back to her side, coming round to face her way.
    const yaw = mother.e.getRotation().y;
    const side = cellOf(besideOf(mother.e.location, yaw, 1.5, -0.5));
    const hurry = far > 8;
    if (roomFor(ctx, m, side, yaw) && walkTo(m, ctx, side, { act: hurry ? ACT.trot : ACT.step, pace: hurry ? PACE.trot : PACE.walk, ease: hurry, face: yaw }, () => settle(m, system.currentTick, Z))) return true;
  }
  if (Math.random() < Z.playChance) {
    if (Math.random() < 0.4 && playRun(m, mother, ctx, Z)) return true;
    // Bucking where it stands, clear of the others' bodies (its hind legs kick out behind).
    if (inRoom(m, ctx, Z, "buck", (t) => startAct(m, t, ACT.play, Z.playTicks))) return true;
  }
  return false;
}

function nurse(m, mother, ctx, now, Z) {
  const yaw = mother.e.getRotation().y;
  const at = besideOf(mother.e.location, yaw, Z.nurseSide[0], Z.nurseSide[1]);
  const cell = cellOf(at);
  // Its body (0.54 wide) clear of the blocks there too: she may stand by a fence or a trough.
  if (!walker(ctx)(cell) || !clearLine(at, at, openAt(m.e.dimension), 0.27) || !roomAt(ctx, m, at.x, at.z, (yaw + 180) % 360, "stand", mother.id)) return false;
  // She stands for it from when it sets off.
  startAct(mother, now, ACT.none, 200, yaw);
  const ok = walkTo(m, ctx, cell, { act: ACT.step, pace: PACE.walk, to: at, face: (yaw + 180) % 360, partner: mother.id }, (there) => {
    const t = system.currentTick;
    if (!there || mother.s.phase !== "act" || mother.s.act !== ACT.none) return settle(m, t, Z);
    const ticks = between(Z.nurseTicks);
    startAct(mother, t, ACT.nurse, ticks, yaw);
    startAct(m, t, ACT.nurse, ticks, (yaw + 180) % 360);
  });
  if (!ok) mother.s.actUntil = now;
  return ok;
}

// A gallop round its mother: the blocks of a ring two out from her, as far as they're open. At the
// grown-ups' gallop: a foal's legs go round faster for its shorter stride (gen/zebra_anim.py leg_rate).
function playRun(m, mother, ctx, Z) {
  const c = cellOf(mother.e.location);
  const ring = [
    [2, 0],
    [2, 2],
    [0, 2],
    [-2, 2],
    [-2, 0],
    [-2, -2],
    [0, -2],
    [2, -2],
    [2, 0],
  ];
  const can = walkerFor(ctx, m);
  const clear = (q) => headroom(ctx.read, q);
  const way = [];
  let at = cellOf(m.e.location);
  for (const [dx, dz] of ring) {
    const to = { x: c.x + dx, y: c.y, z: c.z + dz };
    const leg = findWay(can, clear, at, to, 4);
    if (!leg) break;
    way.push(...leg);
    at = to;
  }
  if (way.length < 6) return false;
  // It pulls up (and bucks) where there's room for it.
  const end = way[way.length - 1];
  const prev = way[way.length - 2];
  if (!roomFor(ctx, m, end, yawTo(end.x - prev.x, end.z - prev.z), "buck")) return false;
  glide(m, way, { act: ACT.gallop, pace: PACE.gallop, turn: 20, ease: true, how: "buck" }, () => startAct(m, system.currentTick, ACT.play, Z.playTicks));
  return true;
}

// A newborn's first park day: its mother keeps the others off (Jerusalem Zoo), driving any grown-up
// that comes close away, head low and ears back; it steps off.
function imprint(herd, ctx, Z) {
  const day = today(ctx.ex);
  for (const foal of herd) {
    if (!foal.juvenile || foal.born !== day) continue;
    const mother = herd.find((o) => o.id === foal.motherId);
    if (!mother || !isFree(mother)) continue;
    const intruder = herd.find((o) => o !== mother && o !== foal && !o.juvenile && isFree(o) && dist(o, mother) < Z.imprintRange);
    if (!intruder) continue;
    const il = intruder.e.location;
    const ml = mother.e.location;
    const clear = (c) => headroom(ctx.read, c);
    const away = roomyLine(ctx, intruder, runLine(walkerFor(ctx, intruder), clear, cellOf(il), headingsAway(il, ml)[0], 3));
    if (away.length) glide(intruder, away, { act: ACT.step, pace: PACE.walk }, () => settle(intruder, system.currentTick, Z));
    const toward = roomyLine(ctx, mother, runLine(walkerFor(ctx, mother), clear, cellOf(ml), { x: Math.sign(Math.round(il.x - ml.x)), z: Math.sign(Math.round(il.z - ml.z)) }, 1));
    if (toward.length) glide(mother, toward, { act: ACT.herd, pace: PACE.walk }, () => settle(mother, system.currentTick, Z));
  }
}

// ---------------- the stallion, greetings, rivals ----------------
// The stallion herds a straggler back: up behind it, head low and snaking, and it walks back in.
function herding(h, herd, ctx, now, Z) {
  if (now < (h.next.herd ??= now + between(Z.herdEvery))) return;
  h.next.herd = now + between(Z.herdEvery);
  const stallion = herd.find((m) => m.role === "stallion");
  if (!stallion || !herd.some((m) => m.role === "mare")) return;
  const others = herd.filter((m) => m !== stallion);
  if (others.length < 2) return;
  const cx = others.reduce((n, m) => n + m.e.location.x, 0) / others.length;
  const cz = others.reduce((n, m) => n + m.e.location.z, 0) / others.length;
  const stray = others
    .filter(isFree)
    .map((m) => ({ m, d: Math.hypot(m.e.location.x - cx, m.e.location.z - cz) }))
    .sort((p, q) => q.d - p.d)[0];
  if (!stray || stray.d < Z.strayDist) return;
  // A straggler, but he's busy (or can't get behind it just now): he sees to it a moment later.
  h.next.herd = now + between(Z.tryAgain);
  if (!isFree(stallion)) return;
  const sl = stray.m.e.location;
  const ux = (sl.x - cx) / stray.d;
  const uz = (sl.z - cz) / stray.d;
  const behind = cellOf({ x: sl.x + ux * 2, y: sl.y, z: sl.z + uz * 2 });
  if (!walkerFor(ctx, stallion)(behind) || !roomFor(ctx, stallion, behind, yawTo(-ux, -uz), "stand", stray.m.id)) return;
  const went = walkTo(stallion, ctx, behind, { act: ACT.herd, pace: PACE.walk, face: yawTo(-ux, -uz), partner: stray.m.id }, (ok) => {
    settle(stallion, system.currentTick, Z);
    if (!ok || !isFree(stray.m)) return;
    const back = cellOf({ x: sl.x - ux * 4, y: sl.y, z: sl.z - uz * 4 });
    if (walkerFor(ctx, stray.m)(back) && roomFor(ctx, stray.m, back, yawTo(-ux, -uz))) walkTo(stray.m, ctx, back, { act: ACT.step, pace: PACE.walk, face: yawTo(-ux, -uz) }, () => settle(stray.m, system.currentTick, Z));
  });
  if (went) h.next.herd = now + between(Z.herdEvery);
}

// Two meet nose to nose, ears forward, sniffing: one walks up to the other.
function greeting(h, herd, ctx, now, Z) {
  if (now < (h.next.greet ??= now + between(Z.greetEvery))) return;
  // Not now (none free near another, no room to meet): a moment later.
  h.next.greet = now + between(Z.tryAgain);
  const free = herd.filter((m) => !m.juvenile && isFree(m));
  if (free.length < 2) return;
  const a = free[Math.floor(Math.random() * free.length)];
  const b = free.filter((o) => o !== a).sort((p, q) => dist(p, a) - dist(q, a))[0];
  if (dist(a, b) > 10) return;
  const met = faceOff(a, b, ctx, now, Z, ACT.greet, Z.greetTicks, () => {
    try {
      a.e.dimension.playSound("mob.horse.breathe", a.e.location, { volume: 0.5, pitch: 1.1 });
    } catch {
      // Cosmetic only.
    }
  });
  if (met) h.next.greet = now + between(Z.greetEvery);
}

function dist(p, q) {
  return Math.hypot(p.e.location.x - q.e.location.x, p.e.location.z - q.e.location.z);
}

// `a` walks up to stand two blocks off `b`, the two face each other nose to nose, and both do `act`
// for `ticks`; then `then`. `b` waits for it, looking.
function faceOff(a, b, ctx, now, Z, act, ticks, then = undefined) {
  const bc = cellOf(b.e.location);
  const al = a.e.location;
  const sides = DIRS.map(([dx, dz]) => ({ x: bc.x + dx * 2, y: bc.y, z: bc.z + dz * 2, dx, dz })).sort((p, q) => Math.hypot(p.x + 0.5 - al.x, p.z + 0.5 - al.z) - Math.hypot(q.x + 0.5 - al.x, q.z + 0.5 - al.z));
  const can = walkerFor(ctx, a);
  for (const c of sides) {
    const yawA = yawTo(-c.dx, -c.dz);
    const yawB = (yawA + 180) % 360;
    // Room for a there, and for b to turn round where it stands to face it.
    const bl = b.e.location;
    if (!can(c) || !roomFor(ctx, a, c, yawA, "stand", b.id) || !roomAt(ctx, b, bl.x, bl.z, yawB, "stand", a.id)) continue;
    const ok = walkTo(a, ctx, { x: c.x, y: c.y, z: c.z }, { act: ACT.step, pace: PACE.walk, face: yawA, partner: b.id }, (there) => {
      const t = system.currentTick;
      if (!there || b.s.phase !== "act" || b.s.act !== ACT.alert) return settle(a, t, Z);
      // Face to face where they really stand.
      const n = between(ticks);
      const al2 = a.e.location;
      const bl2 = b.e.location;
      startAct(b, t, act, n, yawTo(al2.x - bl2.x, al2.z - bl2.z));
      startAct(a, t, act, n, yawTo(bl2.x - al2.x, bl2.z - al2.z));
      if (then) then();
    });
    if (!ok) continue;
    // b turns round to face it, then looks, waiting for it.
    turnTo(b, yawB, 18, () => startAct(b, system.currentTick, ACT.alert, 200, yawB));
    return true;
  }
  return false;
}

// Rival stallions (two or more grown males with the mares) fight now and then: face to face, rearing
// and striking, biting; then one turns and kicks out behind, and the other backs off at a trot.
// Bachelors (no mares) spar in play instead.
function rivals(h, herd, ctx, now, Z) {
  const males = herd.filter((m) => m.role === "stallion");
  if (males.length < 2) return;
  const harem = herd.some((m) => m.role === "mare");
  const what = harem ? "fight" : "spar";
  const every = harem ? Z.fightEvery : Z.sparEvery;
  if (now < (h.next[what] ??= now + between(every))) return;
  // Not now (one of them busy, too far apart, no room to face off): a moment later.
  h.next[what] = now + between(Z.tryAgain);
  const free = males.filter(isFree);
  if (free.length < 2) return;
  // One of them walks up to the nearest other.
  const a = free[Math.floor(Math.random() * free.length)];
  const b = free.filter((o) => o !== a).sort((p, q) => dist(p, a) - dist(q, a))[0];
  if (dist(a, b) > Z.rivalReach) return;
  const faced = faceOff(a, b, ctx, now, Z, harem ? ACT.fight : ACT.spar, harem ? Z.fightTicks : Z.sparTicks, () => {
    if (!harem) return;
    try {
      a.e.dimension.playSound("mob.horse.angry", a.e.location, { volume: 0.8, pitch: 1.2 });
    } catch {
      // Cosmetic only.
    }
    // The fight ends with b turning round (stepping round, rump to a) and kicking out behind at a; a
    // stands its ground until the kick lands (half way through it), then backs off at a trot.
    const al0 = a.e.location;
    const bl0 = b.e.location;
    const away = yawTo(bl0.x - al0.x, bl0.z - al0.z);
    const wait = turnTicks(b, away, 20) + Math.round(Z.kickTicks / 2);
    b.s.after = () =>
      turnTo(b, away, 20, () => {
        startAct(b, system.currentTick, ACT.kick, Z.kickTicks, away);
        try {
          b.e.dimension.playSound("mob.horse.donkey.angry", b.e.location, { volume: 0.8, pitch: 1.3 });
        } catch {
          // Cosmetic only.
        }
      });
    a.s.after = () => {
      startAct(a, system.currentTick, ACT.alert, wait);
      a.s.after = () => {
        const al = a.e.location;
        const off = roomyLine(ctx, a, runLine(walkerFor(ctx, a), (c) => headroom(ctx.read, c), cellOf(al), headingsAway(al, b.e.location)[0], 3));
        if (off.length) glide(a, off, { act: ACT.trot, pace: PACE.trot, ease: true }, () => settle(a, system.currentTick, Z));
        else startAct(a, system.currentTick, ACT.alert, 40);
      };
    };
  });
  if (faced) h.next[what] = now + between(every);
}

// ---------------- single file ----------------
// The herd sets off in single file (zebraRules.js fileOrder): the lead walks its way; each of the others
// walks up to where the lead set off and follows on in its steps, its gaps behind the lead, trotting to
// catch up when it has fallen behind. To water, a feeder or rack, or across the exhibit; in the wild 16
// to 24 blocks over open ground. False when there's nowhere to go.
function planTrek(h, herd, ctx, now, Z, toward = undefined) {
  const walkers = herd.filter((m) => !moving.has(m.id) && m.s.phase !== "glide");
  if (walkers.length < 2) return false;
  const order = fileOrder(
    walkers.map((m) => ({ id: m.id, role: m.juvenile ? "foal" : m.role, motherId: m.motherId, born: m.born })),
    Z.fileGap,
  );
  const lead = walkers.find((m) => m.id === order[0].id);
  const start = cellOf(lead.e.location);
  const clear = (c) => headroom(ctx.read, c);
  // The lead's way goes round the others standing about, and each one's walk up to where the lead set off
  // goes round the rest (walkerFor), so none walks through one waiting its turn: they line up in rank
  // order, not in the order they stand.
  const can = walkerFor(ctx, lead);
  let way;
  let goal; // { act, yaw, key } at the end: water or food
  if (ctx.wild) {
    // Off somewhere, or back toward the rest of its herd (that way, about as far as they are).
    const n = toward ? Math.min(Z.wildTrekSteps[1], Math.max(4, Math.round(Math.hypot(toward.x - start.x, toward.z - start.z)) - 4)) : between(Z.wildTrekSteps);
    const first = toward ? headingIndex(toward.x - start.x, toward.z - start.z) : Math.floor(Math.random() * 8);
    for (const k of toward ? [0, 1, -1, 2, -2] : [0, 1, 2, 3, 4, 5, 6, 7]) {
      const dir = HEADINGS[(first + k + 8) % 8];
      let line = runLine(can, clear, start, dir, n);
      // Back to the rest: round whatever's in the way (one of them standing beside the lead, say).
      if (toward && k === 0 && line.length < n) {
        const round = roundTo(can, clear, start, dir, n, Z.wildNodes);
        if (round && round.length > line.length) line = round;
      }
      if (line.length >= Math.min(8, n)) {
        way = line;
        break;
      }
    }
  } else if (ctx.cells) {
    const r = Math.random();
    const targets = r < 0.35 ? ctx.troughs : r < 0.7 ? ctx.feeders : [];
    for (const f of targets) {
      const spot = spotsAt(f.pos, kindOf(f), can).find((p) => !h.taken.has(p.key) && roomFor(ctx, lead, p.cell, p.yaw));
      if (!spot) continue;
      const w = findWay(can, clear, start, spot.cell, Z.walkSteps);
      if (w && w.length >= 3) {
        way = w;
        goal = spot;
        break;
      }
    }
    if (!way) {
      // Across the exhibit: a block of floor well away from the lead.
      const far = [];
      for (const [k, kind] of ctx.cells) {
        if (kind !== "land" || ctx.onTop.has(k)) continue;
        const [x, y, z] = k.split(",").map(Number);
        if (Math.hypot(x - start.x, z - start.z) >= Z.trekReach) far.push({ x, y, z });
      }
      for (let tries = 0; tries < 4 && far.length && !way; tries++) {
        const w = findWay(can, clear, start, far[Math.floor(Math.random() * far.length)], Z.walkSteps);
        if (w && w.length >= 4 && roomyLine(ctx, lead, w, w.length).length) way = w;
      }
    }
  }
  if (!way) return false;
  // The blocks of its way and the others' walks up to it, which the rest keep off (roomAt).
  const trek = { until: now + Z.trekTicks, leadDist: 0, leadDone: false, left: new Set(), way: new Set([keyOf(start), ...way.map(keyOf)]) };
  h.trek = trek;
  if (goal) {
    h.taken.set(goal.key, lead.id);
    lead.s.spot = goal.key;
  }
  // The others walk up to where the lead set off round its way, never along it toward the lead: they
  // fall in behind it.
  const onWay = new Set(way.map(keyOf));
  let behind = 0;
  let ahead; // the last to join: the one in front of the next
  for (const [i, o] of order.entries()) {
    const m = walkers.find((w) => w.id === o.id);
    const gapped = behind + o.gap; // the gaps in front of it, counting only those who join
    let cells = way;
    let approach = 0;
    if (i > 0) {
      const can = walkerFor(ctx, m, start);
      const to = findWay((c) => can(c) && !onWay.has(keyOf(c)), clear, cellOf(m.e.location), start, ctx.wild ? Z.wildWalkSteps : Z.walkSteps, ctx.wild ? Z.wildNodes : Infinity);
      if (!to) continue;
      for (const c of to) trek.way.add(keyOf(c));
      cells = [...to, ...way];
      approach = to.length ? wayLength(smoothWay(m.e.location, to, openAt(m.e.dimension))) : 0;
    }
    const end = wayLength(smoothWay(m.e.location, cells, openAt(m.e.dimension))) - (i > 0 ? gapped : 0);
    if (end < 0.5) continue;
    behind = gapped;
    const front = ahead;
    ahead = m.id;
    // On its feet first: one lying down gets up, then sets off (the lead's walk waits for nobody).
    if (m.s.phase === "down") getUp(m, now, Z);
    else if (m.s.phase === "act") settle(m, now, Z);
    trek.left.add(m.id);
    const go = () => {
      glide(m, cells, { act: ACT.file, pace: PACE.walk, end, start: i === 0 ? now + 10 : 0, face: i === 0 && goal ? goal.yaw : undefined, file: { trek, lead: i === 0, approach, behind: gapped, ahead: front } }, (ok) => {
        trek.left.delete(m.id);
        const t = system.currentTick;
        if (i === 0 && ok && goal) {
          startAct(m, t, goal.act, goal.act === ACT.drink ? Z.drinkTicks : Z.feedTicks, goal.yaw);
          m.s.spot = goal.key; // its place, while it eats or drinks there
          return;
        }
        // Where it stopped, it grazes (stepping off first if it stopped in another's way).
        if (ok && inRoom(m, ctx, Z, "stand", (t2) => startAct(m, t2, ACT.graze, Z.grazeTicks))) return;
        settle(m, t, Z);
      });
    };
    if (m.s.phase === "up") m.s.then = go;
    else go();
  }
  if (!trek.left.has(lead.id) || trek.left.size < 2) {
    // Not a file: nobody sets off.
    h.trek = trek;
    endTrek(h, herd, now, Z);
    releaseSpot(lead);
    return false;
  }
  return true;
}

// The trek is over: anyone still walking in file stops where it is, and anyone still getting up stays put.
function endTrek(h, herd, now, Z) {
  const trek = h.trek;
  for (const m of herd) {
    const g = moving.get(m.id);
    if (g?.file) finish(m.id, g, false);
    if (trek?.left.has(m.id) && m.s.phase === "up") m.s.then = undefined;
  }
  h.trek = undefined;
  if (h.mood === "trek") {
    h.mood = "graze";
    h.until = now + between(Z.moodTicks);
  }
}

// Back to the rest of the herd (at `to`): the part that came apart calls (a zebra's bark is its contact
// call as well as its alarm), then walks back in single file, or on its own at a trot.
function rejoin(h, herd, ctx, to, now, Z) {
  const caller = herd.find((m) => !moving.has(m.id) && m.s.phase !== "down" && m.s.phase !== "up");
  if (!caller) return false;
  if (herd.length > 1) {
    if (!planTrek(h, herd, ctx, now, Z, to)) return false;
  } else {
    const m = caller;
    const start = cellOf(m.e.location);
    const can = walkerFor(ctx, m);
    const clear = (c) => headroom(ctx.read, c);
    const n = Math.min(Z.wildTrekSteps[1], Math.max(4, Math.round(Math.hypot(to.x - start.x, to.z - start.z)) - 4));
    const first = headingIndex(to.x - start.x, to.z - start.z);
    let line;
    for (const k of [0, 1, -1, 2, -2]) {
      const dir = HEADINGS[(first + k + 8) % 8];
      let l = runLine(can, clear, start, dir, n);
      if (k === 0 && l.length < n) {
        const round = roundTo(can, clear, start, dir, n, Z.wildNodes);
        if (round && round.length > l.length) l = round;
      }
      l = roomyLine(ctx, m, l, 4);
      if (l.length >= Math.min(4, n)) {
        line = l;
        break;
      }
    }
    if (!line) return false;
    if (m.s.phase === "act") settle(m, now, Z);
    glide(m, line, { act: ACT.trot, pace: PACE.trot, turn: 20, ease: true }, () => settle(m, system.currentTick, Z));
  }
  try {
    caller.e.dimension.playSound("mob.horse.donkey.idle", caller.e.location, { volume: 1, pitch: 1.35 });
  } catch {
    // Cosmetic only.
  }
  return true;
}

// ---------------- resting ----------------
// Dozing on their feet; pairs grooming side by side facing opposite ways, or resting head to tail with
// a chin on the other's back; one lying down, maybe for a roll in the dust and a shake; foals lie down.
function planRest(herd, ctx, now, Z) {
  const free = herd.filter((m) => !isBusy(m) && m.s.phase !== "down");
  for (const m of free) if (m.s.phase === "act") settle(m, now, Z);
  const used = new Set();
  const grown = free.filter((m) => !m.juvenile);
  const pairs = Math.floor(grown.length * Z.pairShare);
  for (let i = 0; i < pairs; i++) {
    const a = grown.find((m) => !used.has(m.id));
    if (!a) break;
    const b = grown.filter((m) => m !== a && !used.has(m.id)).sort((p, q) => dist(p, a) - dist(q, a))[0];
    if (!b || dist(a, b) > 10) break;
    used.add(a.id);
    used.add(b.id);
    pairUp(a, b, ctx, now, Z, Math.random() < 0.5 ? "groom" : "rest");
  }
  let lying = 0;
  for (const m of free) {
    if (used.has(m.id)) continue;
    if (m.juvenile || (lying < 1 && Math.random() < Z.lieChance)) {
      if (!m.juvenile) lying++;
      // Room to lie down (and to roll over, if it will).
      const roll = !m.juvenile && Math.random() < Z.rollChance;
      inRoom(m, ctx, Z, roll ? "sleep" : "lie", (t) => {
        goDown(m, t, ACT.lie, Z);
        m.s.downUntil = t + between(Z.lieTicks);
        m.s.roll = roll;
      });
      continue;
    }
    inRoom(m, ctx, Z, "stand", (t) => startAct(m, t, ACT.doze, Z.dozeTicks));
  }
}

// `b` walks round to stand at `a`'s left facing the other way (grooming: level with its withers;
// resting: head to tail), and both groom or rest.
function pairUp(a, b, ctx, now, Z, how) {
  const yaw = a.e.getRotation().y;
  const [left, ahead] = how === "groom" ? Z.groomSide : Z.restSide;
  const at = besideOf(a.e.location, yaw, left, ahead);
  const cell = cellOf(at);
  const al = a.e.location;
  // b's body (0.9 wide) clear of the blocks there too: a may stand by a fence or a trough.
  if (!walker(ctx)(cell) || !clearLine(at, at, openAt(b.e.dimension)) || !roomAt(ctx, a, al.x, al.z, yaw, "stand", b.id) || !roomAt(ctx, b, at.x, at.z, (yaw + 180) % 360, "stand", a.id)) {
    inRoom(a, ctx, Z, "stand", (t) => startAct(a, t, ACT.doze, Z.dozeTicks));
    inRoom(b, ctx, Z, "stand", (t) => startAct(b, t, ACT.doze, Z.dozeTicks));
    return;
  }
  startAct(a, now, ACT.doze, 300, yaw);
  const act = how === "groom" ? ACT.groom : ACT.rest;
  const ok = walkTo(b, ctx, cell, { act: ACT.step, pace: PACE.walk, to: at, face: (yaw + 180) % 360, partner: a.id }, (there) => {
    const t = system.currentTick;
    if (!there || a.s.phase !== "act" || a.s.act !== ACT.doze) return settle(b, t, Z);
    const ticks = between(how === "groom" ? Z.groomTicks : Z.restPairTicks);
    startAct(a, t, act, ticks, yaw);
    startAct(b, t, act, ticks, (yaw + 180) % 360);
  });
  if (!ok) inRoom(b, ctx, Z, "stand", (t) => startAct(b, t, ACT.doze, Z.dozeTicks));
}

// Resting: once a doze ends it dozes again (a foal lies down).
function restStep(m, ctx, now, Z) {
  if (now < m.s.cool) return;
  if (m.juvenile) {
    inRoom(m, ctx, Z, "lie", (t) => {
      goDown(m, t, ACT.lie, Z);
      m.s.downUntil = t + between(Z.lieTicks);
    });
    return;
  }
  inRoom(m, ctx, Z, "stand", (t) => startAct(m, t, ACT.doze, Z.dozeTicks));
}

// Lying down by day: a roll in the dust once it has settled (then up, and a shake), else it gets up
// when its time is over, or when the herd stops resting.
function restDown(m, h, now, Z) {
  const s = m.s;
  if (now < s.busyUntil) return;
  if (s.act === ACT.roll) return getUp(m, now, Z, () => startAct(m, system.currentTick, ACT.shake, Z.shakeTicks));
  if (s.act === ACT.sleep) return goDown(m, now, ACT.lie, Z); // wakes, then gets up next time
  if (s.roll && h.mood === "rest" && now >= s.busyUntil + Z.rollAfter) {
    s.roll = false;
    goDown(m, now, ACT.roll, Z);
    try {
      m.e.dimension.playSound("dig.gravel", m.e.location, { volume: 0.4, pitch: 0.8 });
    } catch {
      // Cosmetic only.
    }
    return;
  }
  if (h.mood !== "rest" || now >= (s.downUntil ?? 0)) getUp(m, now, Z);
}

// ---------------- night ----------------
// Most lie down, some flat out asleep for a while; one stands watch, and the watch changes; a foal
// lies down by its mother.
function planNight(h, herd, now, Z) {
  const grown = herd.filter((m) => !m.juvenile);
  h.watchId = grown[Math.floor(Math.random() * grown.length)]?.id;
  h.watchUntil = now + between(Z.watchTicks);
}

function nightStep(m, h, herd, ctx, now, Z) {
  const s = m.s;
  // The watch changes: one lying awake gets up to take over, and the one on watch lies down.
  if (now >= h.watchUntil) {
    const next = herd.find((o) => !o.juvenile && o.id !== h.watchId && o.s.phase === "down" && o.s.act === ACT.lie && now >= o.s.busyUntil);
    if (next) {
      h.watchId = next.id;
      h.watchUntil = now + between(Z.watchTicks);
      getUp(next, now, Z);
    } else h.watchUntil = now + 200;
  }
  if (m.id === h.watchId) {
    if (s.phase === "down") return getUp(m, now, Z);
    if (s.phase === "idle") inRoom(m, ctx, Z, "stand", (t) => startAct(m, t, ACT.watch, Z.watchTicks[0]));
    return;
  }
  if (s.phase === "idle") {
    // A foal goes to its mother's side first, coming round to face her way.
    const mother = m.juvenile ? herd.find((o) => o.id === m.motherId) : undefined;
    if (mother && dist(m, mother) > 3) {
      const yaw = mother.e.getRotation().y;
      const side = cellOf(besideOf(mother.e.location, yaw, 1.6, 0));
      if (roomFor(ctx, m, side, yaw, "lie") && walkTo(m, ctx, side, { act: ACT.step, pace: PACE.walk, face: yaw, how: "lie" }, (ok) => (ok ? goDown(m, system.currentTick, ACT.lie, Z) : settle(m, system.currentTick, Z)))) return;
    }
    inRoom(m, ctx, Z, "lie", (t) => goDown(m, t, ACT.lie, Z));
    return;
  }
  if (s.phase !== "down" || now < s.busyUntil) return;
  // Lying awake or asleep, in bouts (flat out only where there's room for its legs).
  const l = m.e.location;
  if (s.act === ACT.roll) goDown(m, now, ACT.lie, Z);
  else if (s.act === ACT.lie && Math.random() < Z.sleepChance && roomAt(ctx, m, l.x, l.z, m.e.getRotation().y, "sleep")) {
    goDown(m, now, ACT.sleep, Z);
    s.downUntil = now + between(Z.sleepTicks);
  } else if (s.act === ACT.sleep && now >= (s.downUntil ?? 0)) goDown(m, now, ACT.lie, Z);
}

// ---------------- startled ----------------
// The first to notice barks (and snorts), the rest stop and look; then they gallop off together, away
// from the threat, slow down, stop, turn and stare (the stallion's run is shorter, so he ends up between
// the herd and the threat). Lying ones get up first and follow.
function startle(h, herd, threat, now, Z, wild = false) {
  // Which way the herd runs (straight away from the threat from where it stands, else to either side)
  // and how far, the same for all of them (one getting up first runs after the rest the same way).
  const cx = herd.reduce((n, o) => n + o.e.location.x, 0) / herd.length;
  const cz = herd.reduce((n, o) => n + o.e.location.z, 0) / herd.length;
  const dirs = headingsAway({ x: cx, z: cz }, threat);
  h.startle = { x: threat.x, z: threat.z, runAt: now + Z.barkTicks, until: now + Z.startleTicks, id: now, dirs, steps: between(wild ? Z.wildRunSteps : Z.runSteps) };
  h.calmUntil = h.startle.until + Z.calmTicks;
  if (h.trek) endTrek(h, herd, now, Z);
  const near = (m) => Math.hypot(m.e.location.x - threat.x, m.e.location.z - threat.z);
  const first = herd.slice().sort((p, q) => near(p) - near(q))[0];
  for (const m of herd) {
    const g = moving.get(m.id);
    if (g) finish(m.id, g, false);
    m.s.flee = h.startle.id;
    m.s.calmUntil = h.calmUntil; // calm again from the end of the fright (whatever becomes of its herd)
    if (m.s.phase === "down") {
      getUp(m, now, Z);
      continue;
    }
    if (m.s.phase === "up") continue;
    const l = m.e.location;
    const look = yawTo(threat.x - l.x, threat.z - l.z);
    releaseSpot(m);
    // Wheeling round to look (quickly, stepping round), then barking or staring till they run.
    const until = h.startle.runAt;
    if (m === first) {
      try {
        m.e.dimension.playSound("mob.horse.donkey.idle", l, { volume: 1, pitch: 1.45 });
        m.e.dimension.playSound("mob.horse.breathe", l, { volume: 0.8, pitch: 0.8 });
      } catch {
        // Cosmetic only.
      }
    }
    const act = m === first ? ACT.bark : ACT.alert;
    turnTo(m, look, 30, () => {
      const t = system.currentTick;
      startAct(m, t, act, Math.max(4, until - t), look);
    });
  }
}

function fleeStep(m, h, herd, ctx, now, Z) {
  const s = m.s;
  if (moving.has(m.id)) return;
  if (s.phase === "up") {
    if (now < s.upUntil) return;
    s.then = undefined;
    settle(m, now, Z);
  }
  if (s.phase === "down") return getUp(m, now, Z);
  if (now < h.startle.runAt) return;
  if (s.flee === h.startle.id) {
    // Off at a gallop, all together: the herd's way and as far (the stallion 3 fewer, so he ends up
    // nearest the threat), round a tree or a rock in the way rather than off on a way of its own.
    s.flee = undefined;
    const n = Math.max(2, h.startle.steps - (m.role === "stallion" ? 3 : 0));
    const can = walker(ctx);
    const clear = (c) => headroom(ctx.read, c);
    const from = cellOf(m.e.location);
    let best = [];
    for (const [i, dir] of h.startle.dirs.entries()) {
      let line = runLine(can, clear, from, dir, n);
      if (i === 0 && line.length < n) {
        const round = roundTo(can, clear, from, dir, n, ctx.wild ? Z.wildNodes : Infinity);
        if (round && round.length > line.length) line = round;
      }
      if (line.length > best.length) best = line;
      if (best.length >= n) break;
    }
    const threat = { x: h.startle.x, z: h.startle.z };
    const stare = () => {
      const p = m.e.location;
      startAct(m, system.currentTick, ACT.alert, Z.stareTicks, yawTo(threat.x - p.x, threat.z - p.z));
    };
    // It pulls up where there's room for it, clear of where the others are running to; then it wheels
    // round (stepping round) to face the threat, and stares.
    best = roomyLine(ctx, m, best, 2, (c) => yawTo(threat.x - (c.x + 0.5), threat.z - (c.z + 0.5)));
    const gallop = best.length >= 4;
    if (best.length >= 2) {
      const end = best[best.length - 1];
      const face = yawTo(threat.x - (end.x + 0.5), threat.z - (end.z + 0.5));
      glide(m, best, { act: gallop ? ACT.gallop : ACT.trot, pace: gallop ? PACE.gallop : PACE.trot, turn: 25, ease: true, face, faceTurn: 15 }, stare);
    } else {
      const p = m.e.location;
      turnTo(m, yawTo(threat.x - p.x, threat.z - p.z), 15, stare);
    }
    return;
  }
  if (s.phase === "act" && now >= s.actUntil) settle(m, now, Z);
}

// A run from `from` along `dir`, n blocks, round whatever stands in its way (a tree, a rock, one of the
// herd): a way round to the line a few blocks on, then on along it. Undefined when there's no way round
// close by (something as big as a pond: another way, then).
function roundTo(can, clear, from, dir, n, nodes) {
  const line = runLine(can, clear, from, dir, n);
  if (line.length >= n) return line;
  const at = line[line.length - 1] ?? from;
  for (let k = line.length + 2; k <= Math.min(n, line.length + 6); k++) {
    for (const dy of [0, 1, -1, 2, -2]) {
      const c = { x: from.x + dir.x * k, y: at.y + dy, z: from.z + dir.z * k };
      if (!can(c)) continue;
      const round = findWay(can, clear, at, c, 12, nodes);
      if (round) return [...line, ...round, ...runLine(can, clear, c, dir, n - k)];
    }
  }
  return undefined;
}

// Hurt (a wild zebra: zoo ones can't be): its herd runs from whoever did it.
export function initZebras() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        const e = ev.hurtEntity;
        const from = ev.damageSource?.damagingEntity?.location ?? e.location;
        hurt.set(e.id, { x: from.x, z: from.z, tick: system.currentTick });
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_zebra"] },
  );
}

// ---------------- the herd's sounds ----------------
// One herd's worth at a time, however many zebras: tearing grass now and then while any graze or feed,
// a snort or a whinny every half minute or so, a foal's squeal at play.
function sounds(h, herd, now, Z) {
  const S = h.sound;
  try {
    const eating = herd.filter((m) => m.s.phase === "act" && [ACT.graze, ACT.feed, ACT.rack, ACT.rackLow].includes(m.s.act));
    if (eating.length && now >= (S.eat ?? 0)) {
      S.eat = now + Z.eatEvery;
      const m = eating[Math.floor(Math.random() * eating.length)];
      m.e.dimension.playSound("mob.horse.eat", m.e.location, { volume: 0.35, pitch: 0.9 + Math.random() * 0.2 });
    }
    const awake = herd.filter((m) => m.s.phase !== "down");
    if (awake.length && now >= (S.idle ??= now + between(Z.idleEvery))) {
      S.idle = now + between(Z.idleEvery);
      const m = awake[Math.floor(Math.random() * awake.length)];
      m.e.dimension.playSound(Math.random() < 0.5 ? "mob.horse.breathe" : "mob.horse.idle", m.e.location, { volume: 0.45, pitch: m.juvenile ? 1.7 : 1.15 + Math.random() * 0.15 });
    }
    const play = herd.find((m) => m.s.phase === "act" && m.s.act === ACT.play);
    if (play && now >= (S.play ?? 0)) {
      S.play = now + Z.playSoundEvery;
      play.e.dimension.playSound("mob.horse.idle", play.e.location, { volume: 0.4, pitch: 1.8 });
    }
  } catch {
    // Cosmetic only.
  }
}
