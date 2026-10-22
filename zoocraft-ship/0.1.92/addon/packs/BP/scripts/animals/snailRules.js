// Shimmer Snails (0.1.92, the End trio's second; spec 5.4 "Pale body, pearlescent spiral shell | Leaves a fading
// luminous trail | Mineral bed, shade, crevices"), pure: how it crawls (a box a tick at a time over the blocks, up a
// step's face and down off one), the crevices it rests in (and the crevice measure exhibits.js runs over a floor), where
// it rests when there's none, pulling into its shell and getting used to someone, the trails it leaves and follows, and
// what an exhibit needs. The game side is animals/snail.js.
// Sources (research/end_facts.md, research/end_plan.md): the giant African land snail (a 20 cm shell; it rests sealed
// with a white epiphragm, comes back to its resting place, and is a hermaphrodite laying its eggs in soil); Quantula
// striata, whose light organ in the front of the head-foot flashes green-aqua, bright crawling, half as bright feeding,
// and whose eggs and young glow; the rock snails (Chondrina clienta rests in crevices 6 to 20 cm deep in limestone walls
// and comes out on wet days to graze the lichens and cyanobacteria within half a metre; Euchondrus rasps the rock
// itself). Snails follow each other's mucus trails (Ng et al. 2013), find their way home over 10 to 30 m, crawl about
// 16 cm a minute, pull in when touched and stop pulling in to a touch repeated (habituation).

import { yawTo } from "./grazerRules.js";

export { yawTo };

// The snail mobs, found by type (0.1.70: never by family alone).
export const SNAIL_TYPES = ["zoocraft:shimmer_snail", "zoocraft:wild_shimmer_snail"];
export const WILD_SNAIL = "zoocraft:wild_shimmer_snail";

// What a snail is doing (its zoocraft:act entity property): the client plays the matching animation (gen/snail.py
// ACT_STATES) and the Field Journal watches for it. 0 is out and still. 4 is the startle's pulling in; 6 is sealed in
// to rest, which pulls in by itself (so only a startle shows 4).
export const ACT = { none: 0, crawl: 1, graze: 2, look: 3, withdraw: 4, emerge: 5, sealed: 6, follow: 7, reach: 8, touch: 9 };

// Its body: 0.5 wide, 0.55 high (gen/snail.py BOX); a hatchling's is 0.35 of that.
export const BODY = { half: 0.25, height: 0.55 };
export function bodyOf(young, scale = 0.35) {
  return young ? { half: BODY.half * scale, height: BODY.height * scale } : BODY;
}

// ---------------- the blocks ----------------

// What it can stand on and what walls it in: anything solid. Not air, liquid, a fence or wall ("barrier"), an open
// gate, leaves, an unloaded block, nor (with the gecko reader the snail uses) a slab, stairs or other block that
// doesn't fill its space ("partial": it would sink into it or hang over it).
const NOT_SOLID = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded", "partial", "leaves"]);
export function solid(kind) {
  return !NOT_SOLID.has(kind);
}

// A cell it can be in: open, solid under it. It's 0.55 high, so a block of room is enough.
export function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && solid(read(c.x, c.y - 1, c.z));
}

// Room over a cell to climb up out of it or come down into it (zebraRules.js findWay's `clear`).
export function headroom(read, c) {
  return read(c.x, c.y + 1, c.z) === "air";
}

export const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// A crevice at `c`: a one-block hole at the foot of a wall, open, solid under it and over it, solid on three sides and
// open on the fourth onto ground it can crawl on (a rock snail rests in a crack in a wall). Its way out (an index into
// DIRS, toward the open side), or -1.
export function creviceAt(read, c) {
  if (read(c.x, c.y, c.z) !== "air" || !solid(read(c.x, c.y - 1, c.z)) || !solid(read(c.x, c.y + 1, c.z))) return -1;
  let way = -1;
  for (let i = 0; i < 4; i++) {
    const [dx, dz] = DIRS[i];
    const k = read(c.x + dx, c.y, c.z + dz);
    if (solid(k)) continue;
    // Open two ways, or one side a fence, water or leaves: not a crevice.
    if (way >= 0 || k !== "air") return -1;
    way = i;
  }
  if (way < 0) return -1;
  const [dx, dz] = DIRS[way];
  return standable(read, { x: c.x + dx, y: c.y, z: c.z + dz }) ? way : -1;
}

// A wall's foot: a cell it can rest in with a solid block beside it (against a wall, a rock or a feeder).
export function wallFoot(read, c) {
  return standable(read, c) && DIRS.some(([dx, dz]) => solid(read(c.x + dx, c.y, c.z + dz)));
}

/**
 * The crevice measure (exhibits/exhibits.js, for Shimmer Snails): over the floor the walking measure found (cells: key
 * "x,y,z" -> kind; the "land" ones), the crevices that open onto it (creviceAt, opening onto a land cell): how many,
 * and where the first `keep` are ([x, y, z, way out]).
 * @param {(x: number, y: number, z: number) => string} read a gecko reader
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {ReturnType<typeof newCreviceResult>} out
 */
export function* measureCrevices(read, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dz] of DIRS) {
      const c = { x: x + dx, y, z: z + dz };
      const ck = `${c.x},${c.y},${c.z}`;
      if (seen.has(ck) || cells.has(ck)) continue;
      seen.add(ck);
      const way = creviceAt(read, c);
      if (way < 0) continue;
      // It opens onto this land cell (its one open side is the way back to it).
      if (c.x + DIRS[way][0] !== x || c.z + DIRS[way][1] !== z) continue;
      out.count++;
      if (out.spots.length < opts.keep) out.spots.push([c.x, c.y, c.z, way]);
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  return out;
}

/** @returns {{ count: number, spots: number[][] }} */
export function newCreviceResult() {
  return { count: 0, spots: [] };
}

// ---------------- crawling ----------------

const EPS = 1e-3;

// Every block its box covers at `x, y, z` (its feet) open.
export function boxClear(read, x, y, z, body) {
  for (let bx = Math.floor(x - body.half + EPS); bx <= Math.floor(x + body.half - EPS); bx++) {
    for (let bz = Math.floor(z - body.half + EPS); bz <= Math.floor(z + body.half - EPS); bz++) {
      for (let by = Math.floor(y + EPS); by <= Math.floor(y + body.height - EPS); by++) if (read(bx, by, bz) !== "air") return false;
    }
  }
  return true;
}

// The highest top of a block under its box at `x, y, z`, at its feet or below (`depth` blocks down at most): what it
// rests on there. Any block stops the look down a column (a slab or a fence counts as a full block: it never lies on
// one, only over its edge). Undefined with nothing under any of it (the void).
export function floorUnder(read, x, y, z, body, depth = 2) {
  let top;
  const from = Math.floor(y + EPS) - 1;
  for (let bx = Math.floor(x - body.half + EPS); bx <= Math.floor(x + body.half - EPS); bx++) {
    for (let bz = Math.floor(z - body.half + EPS); bz <= Math.floor(z + body.half - EPS); bz++) {
      for (let by = from; by >= from - depth; by--) {
        if (read(bx, by, bz) === "air") continue;
        if (top === undefined || by + 1 > top) top = by + 1;
        break;
      }
    }
  }
  return top;
}

// A step to climb onto, its box at `x, y, z`: a block under it, and every block under it solid (never up onto a fence,
// a slab or leaves, which it would sink into or hang over).
function stepUnder(read, x, y, z, body) {
  let any = false;
  for (let bx = Math.floor(x - body.half + EPS); bx <= Math.floor(x + body.half - EPS); bx++) {
    for (let bz = Math.floor(z - body.half + EPS); bz <= Math.floor(z + body.half - EPS); bz++) {
      const k = read(bx, y - 1, bz);
      if (k === "air") continue;
      if (!solid(k)) return false;
      any = true;
    }
  }
  return any;
}

/**
 * One tick of crawling: from `at` (its feet) toward `q` (the next point of its way, { x, z }). Clear ahead, it goes
 * there, resting on what's under it, and, over a drop (a step down, its box all past the edge), eases down the face
 * dropPace a tick. Blocked ahead by a step a block high (solid: not a fence, a slab or leaves) with room over it and
 * over where it is, it climbs the face where it is, climbPace a tick, then goes on. Anything else stops it. Returns
 * { x, y, z, how }: how is "crawl", "drop", "climb" or "stuck" (then x, y, z are where it is).
 */
export function crawlTick(at, q, read, body, T) {
  if (boxClear(read, q.x, at.y, q.z, body)) {
    const top = floorUnder(read, q.x, at.y, q.z, body);
    if (top === undefined) return { x: at.x, y: at.y, z: at.z, how: "stuck" };
    if (top < at.y - EPS) return { x: q.x, y: Math.max(top, at.y - T.dropPace), z: q.z, how: "drop" };
    return { x: q.x, y: top, z: q.z, how: "crawl" };
  }
  const up = Math.floor(at.y + EPS) + 1;
  if (boxClear(read, q.x, up, q.z, body) && boxClear(read, at.x, up, at.z, body) && stepUnder(read, q.x, up, q.z, body)) {
    return { x: at.x, y: Math.min(up, at.y + T.climbPace), z: at.z, how: "climb" };
  }
  return { x: at.x, y: at.y, z: at.z, how: "stuck" };
}

// ---------------- resting ----------------

/**
 * Where it goes to rest at a bout's end, the likeliest first (every step a fallback, 0.1.90): the crevice it last
 * rested in, if it's still free; the free crevices within `reach`, nearest first (in a zoo, every crevice of its
 * exhibit: Infinity); a wall's foot within gatherReach of where another snail rests (they gather); any wall's foot,
 * nearest first; where it is (a superflat field). `found`: { home: { x, y, z } | undefined, crevices: [{ x, y, z, way
 * }], feet: [{ x, y, z }], rests: [{ x, y, z }] } (crevices free of other snails; rests where the others rest). Returns
 * [{ spot, kind }] with kind "home", "crevice", "gather", "wall" or "here".
 */
export function restOrder(found, here, T, reach = T.restReach + 1) {
  const d = (c) => Math.hypot(c.x + 0.5 - here.x, c.z + 0.5 - here.z) + Math.abs(c.y - here.y) * 0.5;
  const by = (list) => [...list].sort((p, q) => d(p) - d(q));
  const out = [];
  const key = (c) => `${c.x},${c.y},${c.z}`;
  const home = found.home && found.crevices.find((c) => key(c) === key(found.home));
  if (home) out.push({ spot: home, kind: "home" });
  for (const c of by(found.crevices)) if (c !== home && d(c) <= reach) out.push({ spot: c, kind: "crevice" });
  const feet = by(found.feet).filter((c) => d(c) <= T.restReach + 1);
  const near = (c) => found.rests.some((r) => Math.hypot(r.x - c.x, r.z - c.z) <= T.gatherReach && Math.abs(r.y - c.y) <= 1 && key(r) !== key(c));
  for (const c of feet) if (near(c)) out.push({ spot: c, kind: "gather" });
  for (const c of feet) if (!near(c)) out.push({ spot: c, kind: "wall" });
  out.push({ spot: { x: Math.floor(here.x), y: Math.floor(here.y + EPS), z: Math.floor(here.z) }, kind: "here" });
  return out;
}

// The cells round `here` within `r` across and `dy` up or down, nearest first (the wild look for a resting place).
export function cellsRound(here, r, dy) {
  const out = [];
  for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) for (let y = -dy; y <= dy; y++) if (Math.hypot(x, z) <= r + 0.01) out.push({ x: here.x + x, y: here.y + y, z: here.z + z, d: Math.hypot(x, z) + Math.abs(y) * 0.5 });
  return out.sort((p, q) => p.d - q.d);
}

// ---------------- pulling in ----------------

/**
 * Someone who startles it (balance.snail: someone too close coming on, or hitting it), with what it remembers of them
 * (`habit`: { n, last, stay }, or undefined): the first time it stays in withdrawTicks, then each time again within
 * habitWindow ticks habitFactor of the time before (withdrawMin at least), so always shorter; once it has pulled in
 * habitAfter times it stops pulling in for them until they've left it alone habitWindow ticks (every time they come on
 * counts as not leaving it alone). Returns { withdraw, stay, habit }: stay, the ticks it stays in.
 */
export function startle(habit, now, T, random = Math.random) {
  const h = habit && now - habit.last <= T.habitWindow ? { n: habit.n, last: habit.last, stay: habit.stay } : { n: 0, last: now };
  h.last = now;
  if (h.n >= T.habitAfter) return { withdraw: false, stay: 0, habit: h };
  const stay = h.n > 0 && h.stay > 0 ? Math.max(T.withdrawMin, Math.round(h.stay * T.habitFactor)) : Math.round(T.withdrawTicks[0] + random() * (T.withdrawTicks[1] - T.withdrawTicks[0]));
  h.n += 1;
  h.stay = stay;
  return { withdraw: true, stay, habit: h };
}

// Giving way: another grown snail (`others`: [{ x, y, z }]) within giveWay of it (`at`) across, on its level or a block
// up or down (one at a step's edge, about to ease down onto the other or have it climb up into it), ahead of it the way
// it's crawling (`dir`: { x, z }). It waits till the way's clear (waitTicks at most, then it gives up that crawl and
// goes round it). One right on it (no way to tell ahead) doesn't stop it crawling off. Returns the one in its way, or
// undefined.
export function inTheWay(at, dir, others, T) {
  const len = Math.hypot(dir.x, dir.z);
  if (!len) return undefined;
  for (const o of others) {
    if (Math.abs(o.y - at.y) > 1.05) continue;
    const dx = o.x - at.x;
    const dz = o.z - at.z;
    const d = Math.hypot(dx, dz);
    if (d < 1e-6 || d >= T.giveWay) continue;
    if ((dx * dir.x + dz * dir.z) / (len * d) > 0.3) return o;
  }
  return undefined;
}

// A straight crawl from `a` to `b` ({ x, y, z }) all over cells it can crawl on (`can`, by cell): each tenth of a block
// along it, the cell at a's height for the first half and at b's for the rest (a step crossed halfway). On the level,
// with `read` and `body`, its body clear of blocks all along too (past a feeder's corner, not into it: it would climb it).
export function lineOn(can, a, b, read = undefined, body = undefined) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.1));
  const level = Math.abs(a.y - b.y) < EPS;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const y = f < 0.5 ? a.y : b.y;
    const x = a.x + (b.x - a.x) * f;
    const z = a.z + (b.z - a.z) * f;
    if (!can({ x: Math.floor(x), y: Math.floor(y + 0.01), z: Math.floor(z) })) return false;
    if (read && body && level && !boxClear(read, x, y, z, body)) return false;
  }
  return true;
}

// Coming on: they've moved comeOn blocks or more since it last looked (`prev`: { x, z, d }) and aren't going away. Seen
// for the first time already this near (they came round a rock), they count as coming on.
export function comingOn(prev, p, d, T) {
  if (!prev) return true;
  return Math.hypot(p.x - prev.x, p.z - prev.z) >= T.comeOn && d <= prev.d + 0.05;
}

// ---------------- the trail ----------------

// Its trail's marks, the last trailTicks of them ([{ x, y, z, t }], oldest first): a new one at `p` at tick `now`, the
// old ones let go.
export function addMark(marks, p, now, T) {
  const out = marks.filter((m) => now - m.t < T.trailTicks);
  out.push({ x: p.x, y: p.y, z: p.z, t: now });
  return out;
}

// A mark lies where its middle is over a block's top (the block under it solid, its own open): not out over the edge of
// a step it crawls along, nor inside a block its head is against.
export function markSits(read, p) {
  const y = Math.round(p.y);
  if (Math.abs(p.y - y) > EPS) return false;
  const x = Math.floor(p.x);
  const z = Math.floor(p.z);
  return read(x, y, z) === "air" && solid(read(x, y - 1, z));
}

// How bright a mark is: full crawling, half grazing or eating (Quantula's light), a hatchling's fainter.
export function markBright(feeding, young, T) {
  return (feeding ? T.feedBright : 1) * (young ? T.youngBright : 1);
}

/**
 * A fresh trail to follow: of the other snails' marks (`trails`: [{ id, marks, at }]: `at`, where the other is now), the
 * nearest within followReach of `here` across (and a block up or down), laid within trailFresh ticks, that has newer
 * marks after it to crawl along before touching distance of the other (the marks right behind it are no trail to
 * follow: it's already there). Returns { id, i } (the mark it starts from), or undefined.
 */
export function trailNear(trails, here, now, T) {
  let best;
  for (const { id, marks, at } of trails) {
    for (let i = 0; i < marks.length - 1; i++) {
      const m = marks[i];
      if (now - m.t > T.trailFresh || Math.abs(m.y - here.y) > 1) continue;
      if (at && [m, marks[i + 1]].some((k) => Math.hypot(k.x - at.x, k.z - at.z) < T.touchReach)) continue;
      const d = Math.hypot(m.x - here.x, m.z - here.z);
      if (d > T.followReach) continue;
      if (!best || d < best.d) best = { id, i, d };
    }
  }
  return best ? { id: best.id, i: best.i } : undefined;
}

// ---------------- what it does ----------------

/**
 * What it does next when it's out (balance.snail.choices: weights): "crawl" (about, a few blocks), "graze" (rasping
 * the Mineral Substrate, or the end stone in the wild), "feed" (at the feeder), "look" (front raised, eye stalks
 * waving) or "follow" (another's fresh trail). `can`: which of graze, feed and follow it can do now.
 */
export function pickChoice(T, can, random = Math.random) {
  const list = Object.entries(T.choices).filter(([k]) => (k === "graze" || k === "feed" || k === "follow" ? Boolean(can[k]) : true));
  const total = list.reduce((n, [, w]) => n + w, 0);
  let r = random() * total;
  for (const [k, w] of list) {
    r -= w;
    if (r <= 0) return k;
  }
  return list[list.length - 1][0];
}

// ---------------- what an exhibit needs ----------------

// Crevices: one for each grown snail.
export function crevicesNeeded(n) {
  return Math.max(1, n);
}

// Crevices enough (species.crevices): false caps comfort (cause "crevices"). Not measured yet: passes.
export function hasCrevices(species, ex, n) {
  if (!species.crevices || !ex.crevices) return true;
  return ex.crevices.count >= crevicesNeeded(n);
}

// A Mineral Substrate bed enough (species.mineralBed): false caps comfort (cause "mineral"). Not measured yet: passes.
export function hasMineralBed(species, ex) {
  if (!species.mineralBed || ex.substrateCells === undefined) return true;
  return ex.substrateCells >= species.mineralBed.minCells;
}

const CREVICE_HOW = "a one-block gap at the foot of a wall, roofed over and walled on three sides, open onto the floor";

// The Exhibit Clipboard's lines for Shimmer Snails: the crevices and the Mineral Substrate.
export function snailLines(ex, residents, species) {
  const lines = [];
  const need = crevicesNeeded(residents.filter((a) => !a.juvenile).length);
  if (!ex.crevices) lines.push("§fCrevices: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fCrevices: ${ex.crevices.count >= need ? "§a" : "§c"}${ex.crevices.count}§7 of ${need} (one for each snail to rest in: ${CREVICE_HOW})`);
  const bed = species.mineralBed.minCells;
  const eggs = species.breeding?.eggBed ?? bed;
  if (ex.substrateCells === undefined) lines.push("§fMineral Substrate: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fMineral Substrate: ${ex.substrateCells >= bed ? "§a" : "§c"}${ex.substrateCells}§7 of ${bed} blocks to graze${ex.substrateCells < eggs ? ` (they lay their eggs only with ${eggs} or more)` : " and lay their eggs in"}`);
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fHatchlings: §7${young}, crawling after their parent`);
  return lines;
}

// Care warnings for Shimmer Snails: a crevice each, the Mineral Substrate.
export function snailWarnings(ex, residents, plural, species, T) {
  const out = [];
  const need = crevicesNeeded(residents.filter((a) => !a.juvenile).length);
  if (species.crevices && ex.crevices && ex.crevices.count < need) out.push({ severity: 2, text: `${plural} rest sealed in a crevice, one to each: ${need} or more (${ex.crevices.count} now; comfort can't rise above ${T.creviceComfortCap} without them). A crevice is ${CREVICE_HOW}: leave a block out at the foot of a wall two blocks thick, on the inside, or set two blocks a block apart against a wall with a block over them.` });
  const bed = species.mineralBed?.minCells ?? 0;
  if (bed && ex.substrateCells !== undefined && ex.substrateCells < bed) out.push({ severity: 2, text: `${plural} graze Mineral Substrate, rasping at it: at least ${bed} blocks in the floor (${ex.substrateCells} now; comfort can't rise above ${T.bedComfortCap} without it). Craft it from gravel, a nether quartz and bone meal.` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live on the end stone of the outer End islands, 2 to 4 together. The End has no day or night, so they keep to bouts: out a while, crawling, grazing the end stone and following each other's trails, then sealed in their shells in a crevice or against a rock. They leave a glowing trail that fades. Come within ${T.startleRange} blocks in Survival without sneaking and one pulls into its shell (less and less, if you keep at it). Hold Mineral Pellets and one crawls over to you`;
}
