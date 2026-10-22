// Keeper jobs (spec section 14). Pure: plain records in, plain answers out.
// A job is what an exhibit needs from a keeper right now: refill a feeder or a food basket, top up
// a water or lava trough, or clean. Jobs are worked out afresh from the records each time (the queue);
// a keeper claims one (keeper.job), travels, works and commits. One job id is never claimed twice.

import { reachesFeeder, drinksFrom } from "../equipment/rules.js";

export const JOB_TEXT = {
  feed: "refill the feeder",
  basket: "refill the food basket",
  water: "top up the trough",
  clean: "clean the exhibit",
};

const job = (kind, ex, target, priority) => ({
  id: `${kind}:${target.id}`,
  kind,
  exhibitId: ex.id,
  targetId: target.id,
  dimension: ex.dimension,
  pos: target.pos ?? ex.controller,
  priority,
});

// The jobs one occupied exhibit needs. `feeders` and `fixtures` are its linked equipment records,
// `diets` maps a ration item to its diet tag, `pool` says the animals drink from a pool.
export function jobsFor(ex, species, feeders, fixtures, pool, balance, diets) {
  const out = [];
  if (!species || !ex.animalIds.length) return out;
  const s = balance.staff;
  // Feeders: refill when the food the animals can eat runs under a day. A feeder holding the
  // wrong ration is left alone (the exhibit warns about it; it's the player's call).
  const eats = (f) => species.dietTags.includes(diets[f.item]);
  const usable = feeders.filter((f) => reachesFeeder(species, f) && !(f.units > 0 && !eats(f)));
  const food = usable.reduce((n, f) => n + f.units, 0);
  const perDay = ex.animalIds.length * species.rationUnitsPerParkDay;
  if (usable.length && food < perDay * s.feedBelowDays) {
    const emptiest = usable.reduce((a, b) => (b.units < a.units ? b : a));
    if (emptiest.units < balance.feeder.capacity) out.push(job("feed", ex, emptiest, food === 0 ? 3 : 2));
  }
  for (const f of fixtures) {
    if (f.type === "basket" && species.enrichmentTags.includes("forage") && !(f.units > 0)) out.push(job("basket", ex, f, 1));
    // A trough the animals don't drink from (a Lava Trough in a water exhibit, or the other way round) is left alone.
    if (f.type === "trough" && !pool && f.units <= balance.trough.lowAt && drinksFrom(species, f)) out.push(job("water", ex, f, f.units <= 0 ? 3 : 2));
  }
  const clean = ex.cleanliness ?? 100;
  if (clean < s.cleanBelow) out.push(job("clean", ex, { id: ex.id, pos: ex.controller }, clean < balance.needs.bands.urgent ? 3 : 2));
  return out;
}

// The job a keeper should take next: in one of its exhibits, not held by another keeper, not
// waiting after a failed try; most urgent first, then the order the jobs came in.
export function pickJob(keeper, jobs, claimed, retryAt, now) {
  let best;
  for (const j of jobs) {
    if (!keeper.exhibitIds.includes(j.exhibitId) || claimed.has(j.id)) continue;
    if ((retryAt.get(j.id) ?? -Infinity) > now) continue;
    if (!best || j.priority > best.priority) best = j;
  }
  return best;
}

// Which ration goes into a feeder or basket: what it already holds, otherwise the first ration
// this species eats that the Staff Rooms have.
export function rationFor(species, rec, stock, rations) {
  if (rec.item && rec.units > 0) return rec.item;
  return Object.keys(rations).find((item) => species.dietTags.includes(rations[item].diet) && (stock[item] ?? 0) > 0);
}

// Ration units in all Staff Rooms together.
export function totalStock(rooms) {
  const out = {};
  for (const r of rooms) for (const [item, n] of Object.entries(r.stock ?? {})) out[item] = (out[item] ?? 0) + n;
  return out;
}

export function roomUnits(room) {
  return Object.values(room.stock ?? {}).reduce((a, b) => a + b, 0);
}

// Take up to `wanted` units of `item` from the rooms, in order. Returns how many were taken.
export function takeStock(rooms, item, wanted) {
  let left = wanted;
  for (const r of rooms) {
    const have = r.stock?.[item] ?? 0;
    const take = Math.min(left, have);
    if (take <= 0) continue;
    r.stock[item] = have - take;
    if (r.stock[item] === 0) delete r.stock[item];
    left -= take;
    if (left <= 0) break;
  }
  return wanted - left;
}

// A new keeper looks after the occupied exhibits with the fewest keepers, busiest first.
export function defaultExhibits(exhibits, keepers, max) {
  const cover = (ex) => keepers.filter((k) => k.exhibitIds.includes(ex.id)).length;
  return exhibits
    .filter((ex) => ex.animalIds.length)
    .sort((a, b) => cover(a) - cover(b) || b.animalIds.length - a.animalIds.length)
    .slice(0, max)
    .map((ex) => ex.id);
}

// How many keepers the park can have: Staff Rooms house them, up to the park's cap (the benchmark park's own, bench/).
export function keeperLimit(rooms, balance, cap = balance.staff.maxKeepers) {
  return Math.min(cap, rooms * balance.staff.keepersPerRoom);
}

// --- the Staff Room building (Austin, 2026-10-08: "players should have to build a building") ---
// A Staff Room is a space the players build: walls, floor and roof all round, at least
// `minSize` x `minSize` x `minSize` of open space inside. The Staff Room block goes inside it or
// against its outside wall. `read(x, y, z)` gives a block category (data/blocks.js) or "unloaded".
// Only "air" (which includes torches, carpets, signs) is room space; anything else is wall, closed
// or open doors included, so a room with its door open still counts.
const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]];

// 0.1.96: blocks go by number rather than by an "x,y,z" string (most of a check's time in the game's script engine went
// on the strings), each block is read once, and the loops index their steps; the same walk in the same order, so the
// same answer. measureRoomSteps is the same check as a job, a slice every `perYield` blocks walked: beside a block
// against an outside wall the walk goes 1500 blocks into the open air before it gives up on that side.
export function measureRoom(source, pos, opts) {
  const steps = measureRoomSteps(source, pos, { ...opts, perYield: Infinity });
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}

/**
 * @param {(x: number, y: number, z: number) => string} source
 * @param {{ x: number, y: number, z: number }} pos
 * @param {{ minSize: number, maxCells: number, perYield: number }} opts
 * @returns {Generator<undefined, { ok: boolean, reason?: string, cells?: number, fits?: boolean, bbox?: { min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } }, unknown>}
 */
export function* measureRoomSteps(source, pos, opts) {
  const { minSize, maxCells, perYield } = opts;
  let work = 0;
  // A walk of maxCells blocks stays well inside 2^16 blocks of `pos` each way.
  const no = (x, y, z) => ((x - pos.x + ROOM_OFF) * ROOM_SPAN + (y - pos.y + ROOM_OFF)) * ROOM_SPAN + (z - pos.z + ROOM_OFF);
  const known = new Map(); // block number -> what it is
  const read = (x, y, z) => {
    const k = no(x, y, z);
    let c = known.get(k);
    if (c === undefined) known.set(k, (c = source(x, y, z)));
    return c;
  };
  const seen = new Set();
  let best;
  // Where to start: the cells beside the block (it's inside), then one further (it's against the wall).
  const starts = [];
  for (const [dx, dy, dz] of SIDES) for (const n of [1, 2]) starts.push({ x: pos.x + dx * n, y: pos.y + dy * n, z: pos.z + dz * n });
  for (const s of starts) {
    if (seen.has(no(s.x, s.y, s.z))) continue;
    const c = read(s.x, s.y, s.z);
    if (c === "unloaded") return { ok: false, reason: "unloaded" };
    if (c !== "air") continue;
    const cells = new Set([no(s.x, s.y, s.z)]);
    seen.add(no(s.x, s.y, s.z));
    // Breadth first, so open air around the block is all seen before the walk gives up on it.
    const queue = [s];
    let open = false;
    for (let i = 0; i < queue.length; i++) {
      if (++work % perYield === 0) yield;
      const p = queue[i];
      for (let d = 0; d < 6; d++) {
        const x = p.x + SIDES[d][0], y = p.y + SIDES[d][1], z = p.z + SIDES[d][2];
        const key = no(x, y, z);
        if (cells.has(key)) continue;
        const r = read(x, y, z);
        if (r === "unloaded") return { ok: false, reason: "unloaded" };
        if (r !== "air") continue;
        cells.add(key);
        seen.add(key);
        if (cells.size > maxCells) {
          open = true;
          break;
        }
        queue.push({ x, y, z });
      }
      if (open) break;
    }
    if (open) continue; // the outside: its cells near the block are all seen now
    // The Staff Room block itself counts as room space when it stands inside (a 3 x 3 x 3 room with
    // the block in it is big enough); in the wall or outside it can't make a room bigger.
    const space = new Set(cells);
    const at = [...queue];
    if (SIDES.some(([dx, dy, dz]) => cells.has(no(pos.x + dx, pos.y + dy, pos.z + dz)))) {
      space.add(no(pos.x, pos.y, pos.z));
      at.push(pos);
    }
    const size = largestCube(space, at, minSize, no);
    const room = { cells: cells.size, fits: size >= minSize, bbox: boundsOf(queue) };
    if (room.fits) return { ok: true, ...room };
    if (!best || room.cells > best.cells) best = room;
  }
  if (best) return { ok: false, reason: "small", cells: best.cells, bbox: best.bbox };
  return { ok: false, reason: "open" };
}
const ROOM_OFF = 65536;
const ROOM_SPAN = 131072;

// n if some n x n x n cube of the cells (numbered by `no`, at the positions `at`) is all there, else 0.
function largestCube(cells, at, n, no) {
  for (const p of at) {
    const base = no(p.x, p.y, p.z);
    let all = true;
    for (let a = 0; a < n && all; a++) for (let b = 0; b < n && all; b++) for (let c = 0; c < n && all; c++) if (!cells.has(base + (a * ROOM_SPAN + b) * ROOM_SPAN + c)) all = false;
    if (all) return n;
  }
  return 0;
}

function boundsOf(cells) {
  let min, max;
  for (const { x, y, z } of cells) {
    if (!min) {
      min = { x, y, z };
      max = { x, y, z };
      continue;
    }
    min = { x: Math.min(min.x, x), y: Math.min(min.y, y), z: Math.min(min.z, z) };
    max = { x: Math.max(max.x, x), y: Math.max(max.y, y), z: Math.max(max.z, z) };
  }
  return { min, max };
}

export const ROOM_TEXT = {
  open: "It isn't a closed room yet. Build walls, a floor and a roof all round with no gaps (doors count as wall), then put the Staff Room block inside or against the outside wall.",
  small: "The room is too small: it needs open space at least 3 x 3 x 3 inside (furniture takes up space).",
  unloaded: "Part of the room isn't loaded. Come closer and try again.",
};
