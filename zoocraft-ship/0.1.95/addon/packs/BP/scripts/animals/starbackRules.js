// Starback Tortoises (0.1.95, the End pair's second; spec 5.4 "Dark shell with star-like markings | Slow browsing and
// resting | End vegetation, warm pad, large retreat"), pure: its body, how it warms up and cools down, the tortoise
// measure exhibits.js runs over a floor (the chorus it browses, the Warm Pads it basks on, the low roof it rests under),
// where it rests and basks, its ways (on the level, or down off a step, never up one), someone startling it, and what
// an exhibit needs. The game side is animals/starback.js. Its walking over the blocks is the Shimmer Snail's
// (animals/snailRules.js crawlTick, at the tortoise's pace).
// Sources (research/end_pair_facts.md, research/end_pair_plan.md): the Indian star tortoise (a female's shell about
// 27.5 cm long, a male's 17.5 cm; the shell about half as high as long and 0.7 as wide; solitary, the males seldom or
// never fighting and grunting as they mate; a nest dug with the hind feet, filled and flattened with the plastron; the
// hatchlings without stars, black with yellow blotches; sheltering under vegetation or other cover through the heat of
// the day), turtles basking until warm enough to be active (time basking competing with feeding), a startled tortoise
// pulling in with a hiss as the air leaves its lungs, the fastest tortoise on record at 0.28 m/s.

import { DIRS, standable } from "./snailRules.js";
import { isChorus } from "./chorusMothRules.js";

// The tortoise mobs, found by type (0.1.70: never by family alone).
export const STARBACK_TYPES = ["zoocraft:starback_tortoise", "zoocraft:wild_starback_tortoise"];
export const WILD_STARBACK = "zoocraft:wild_starback_tortoise";

// What a tortoise is doing (its zoocraft:act entity property): the client plays the matching animation (gen/starback.py
// ACT_STATES) and the Field Journal watches for it. 0 is out and still; 2 resting, drawn halfway in; 3 basking, legs
// splayed and neck stretched out flat; 4 browsing, neck stretched up, biting and tugging (at chorus, the feeder or a
// held Chorus Browse); 5 eating with its head down (grazing the floor where there's no chorus); 6 pulled all in
// (startled); 7 the head coming slowly out; 8 digging a nest with its hind feet; 9 patting it flat; 10 looking about.
export const ACT = { none: 0, walk: 1, rest: 2, bask: 3, browse: 4, eat: 5, withdraw: 6, peek: 7, nest: 8, pat: 9, look: 10 };

// In its shell (pulled in, or coming out): it sees no one coming, and a hit only keeps it in.
export const SHELLED = new Set([ACT.withdraw, ACT.peek]);

// Its body: a female 0.7 wide and 0.5 high (gen/starback.py: her collision box), a male MALE of her (17.5 cm to her
// 27.5), a hatchling YOUNG of her.
export const BODY = { half: 0.35, height: 0.5 };
export const MALE = 0.64;
export const YOUNG = 0.3;
export function bodyOf(young, male) {
  const k = young ? YOUNG : male ? MALE : 1;
  return { half: BODY.half * k, height: BODY.height * k };
}

const EPS = 1e-6;

// ---------------- warmth ----------------

/**
 * Its warmth (0 to 1, the script's, not saved) `ticks` on from `w`, by where it is (`how`, balance.starback.warm):
 * "pad" basking on a Warm Pad, up padRise a tick to 1 (full in about 45 seconds); "open" basking off one, openRise a
 * tick (a third as fast) to openMax at most; "rest" in its retreat or its shell, down restFall a tick to floor; "out"
 * (walking, browsing, anything else), down outFall a tick (a little faster) to floor. One already past where it's
 * heading stays as it is.
 */
export function warmthAfter(w, ticks, how, W) {
  if (ticks <= 0) return w;
  if (how === "pad") return Math.min(1, w + W.padRise * ticks);
  if (how === "open") return w >= W.openMax ? w : Math.min(W.openMax, w + W.openRise * ticks);
  if (w <= W.floor) return w;
  return Math.max(W.floor, w - (how === "rest" ? W.restFall : W.outFall) * ticks);
}

// Warm enough to stop basking: `basked` on a pad; in the open as warm as it gets there (openMax), if that's less.
export function warmEnough(w, onPad, W) {
  return w >= (onPad ? W.basked : Math.min(W.basked, W.openMax)) - EPS;
}

/**
 * What it does next out of its retreat: "bask" till it's warm (warmEnough), then "feed" (browse, the feeder) till it has
 * cooled to `cooled`, then "bask" again. `phase`: what it was doing ("bask" or "feed"); `onPad`: it's basking on a pad.
 */
export function nextPhase(phase, w, onPad, W) {
  if (phase === "bask") return warmEnough(w, onPad, W) ? "feed" : "bask";
  return w <= W.cooled + EPS ? "bask" : "feed";
}

// ---------------- ways ----------------

/**
 * A way for it to walk from the block `from` to the block `to`: breadth first over the blocks it can stand in
 * (`can(cell)`), on the level or down off a step a block high (with room over the block it steps down into, `clear`:
 * snailRules.js headroom), never up one (a step is higher than it is). Of the shortest ways, the one that keeps nearest
 * the straight line between them: a staircase along it, which its walk smooths into a near straight line (not along one
 * side and then the other). The blocks in order, ending at `to` ([] when it's there); undefined with no way within
 * `maxSteps` blocks, or none after looking at `maxNodes`.
 * @param {(c: {x: number, y: number, z: number}) => boolean} can
 * @param {(c: {x: number, y: number, z: number}) => boolean} clear
 */
export function findWalk(can, clear, from, to, maxSteps, maxNodes = Infinity) {
  const k = (c) => `${c.x},${c.y},${c.z}`;
  const goal = k(to);
  if (k(from) === goal) return [];
  const depth = new Map([[k(from), 0]]);
  const at = new Map([[k(from), from]]);
  let frontier = [from];
  let found;
  for (let step = 0; step < maxSteps && frontier.length && !found; step++) {
    const next = [];
    for (const c of frontier) {
      for (const [dx, dz] of DIRS) {
        for (const dy of [0, -1]) {
          const n = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
          const nk = k(n);
          if (depth.has(nk) || !can(n)) continue;
          if (dy === -1 && !clear(n)) continue;
          depth.set(nk, step + 1);
          at.set(nk, n);
          if (nk === goal) found = n;
          if (depth.size > maxNodes) return undefined;
          next.push(n);
        }
      }
      if (found) break;
    }
    frontier = next;
  }
  if (!found) return undefined;
  // Back from `to`, a block nearer `from` each time (one it could have stepped from: level, or a block higher with room
  // over this one), the one nearest the line.
  const ax = to.x - from.x;
  const az = to.z - from.z;
  const len = Math.hypot(ax, az) || 1;
  const off = (c) => Math.abs((c.x - from.x) * az - (c.z - from.z) * ax) / len;
  const path = [found];
  let c = found;
  for (let d = depth.get(goal); d > 1; d--) {
    let best;
    for (const [dx, dz] of DIRS) {
      for (const dy of [0, 1]) {
        const pk = k({ x: c.x - dx, y: c.y + dy, z: c.z - dz });
        if (depth.get(pk) !== d - 1 || (dy === 1 && !clear(c))) continue;
        const p = at.get(pk);
        if (!best || off(p) < off(best) - 1e-9) best = p;
      }
    }
    c = best;
    path.unshift(c);
  }
  return path;
}

// ---------------- the tortoise measure ----------------

// The kinds (exhibits.js's reader) that make a roof over a floor cell: anything but open air, liquid, a fence or wall,
// an open gate or an unloaded block.
const NOT_ROOF = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded"]);
export function isRoof(kind) {
  return Boolean(kind) && !NOT_ROOF.has(kind);
}

/**
 * The tortoise measure (exhibits/exhibits.js, for Starback Tortoises), over the floor the walking measure found (cells:
 * key "x,y,z" -> kind; the "land" ones):
 * - the chorus standing on it: the lowest block of a chorus plant or flower beside a floor cell at its level, standing on
 *   something that isn't chorus (animals/chorusMothRules.js measureChorus's rule), each counted once; where the first
 *   `keep` are, [x, y, z, dx, dz]: the floor cell it browses from and the way to the chorus;
 * - the Warm Pads in the floor: the floor cells over a zoocraft:warm_pad, and where the first `keep` are, [x, y, z];
 * - the retreat: the floor cells under a low roof (the block 2 over the floor a roof, isRoof: the walking measure leaves
 *   2 blocks of air over every floor cell), and where the first `keep` are, [x, y, z].
 * Not the tops of chorus plants (the walking measure's floor, but no tortoise climbs up there).
 * `read(x, y, z)`: the exhibit reader's kind; `typeAt(x, y, z)`: { id } for a block, undefined unloaded. A generator, a
 * slice of `opts.cellsPerYield` floor cells at a time.
 * @param {(x: number, y: number, z: number) => string} read
 * @param {(x: number, y: number, z: number) => ({ id: string } | undefined)} typeAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {ReturnType<typeof newTortoiseResult>} out
 */
export function* measureTortoise(read, typeAt, cells, opts, out) {
  const bases = new Set();
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    // The top of a chorus plant (the walking measure stands on it) is no floor a tortoise can climb to.
    const floor = typeAt(x, y - 1, z)?.id;
    if (floor && isChorus(floor)) continue;
    if (floor === "zoocraft:warm_pad") {
      out.pads++;
      if (out.padSpots.length < opts.keep) out.padSpots.push([x, y, z]);
    }
    if (isRoof(read(x, y + 2, z))) {
      out.retreat++;
      if (out.retreatSpots.length < opts.keep) out.retreatSpots.push([x, y, z]);
    }
    for (const [dx, dz] of DIRS) {
      const nk = `${x + dx},${y},${z + dz}`;
      if (cells.has(nk) || bases.has(nk)) continue;
      const nb = typeAt(x + dx, y, z + dz);
      if (!nb || !isChorus(nb.id)) continue;
      const under = typeAt(x + dx, y - 1, z + dz);
      if (!under || isChorus(under.id) || under.id === "minecraft:air") continue;
      bases.add(nk);
      out.plants++;
      if (out.plantSpots.length < opts.keep) out.plantSpots.push([x, y, z, dx, dz]);
    }
  }
  return out;
}

/** @returns {{ plants: number, plantSpots: number[][], pads: number, padSpots: number[][], retreat: number, retreatSpots: number[][] }} */
export function newTortoiseResult() {
  return { plants: 0, plantSpots: [], pads: 0, padSpots: [], retreat: 0, retreatSpots: [] };
}

// In the wild (and wherever its exhibit wasn't measured): chorus to browse beside the cell `c` it can stand in, the
// ways to it (indices into DIRS): the lowest block of a chorus plant or flower at its level, standing on something
// that isn't chorus. `typeAt(x, y, z)`: a block's typeId.
export function chorusBeside(typeAt, c) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const x = c.x + DIRS[i][0];
    const z = c.z + DIRS[i][1];
    if (!isChorus(typeAt(x, c.y, z) ?? "")) continue;
    const under = typeAt(x, c.y - 1, z);
    if (under && !isChorus(under) && under !== "minecraft:air") out.push(i);
  }
  return out;
}

// A cell to rest in the wild, with its kind: "roof" under a roof (an overhang, chorus overhead: the block 1 or 2 over
// it), "wall" against a rock or a chorus stalk (a solid block, or chorus, beside it at its level), else undefined.
// `read` is the tortoise's (gecko and thin: chorus is "partial").
export function wildRestAt(read, c) {
  if (!standable(read, c)) return undefined;
  if (isRoof(read(c.x, c.y + 1, c.z)) || isRoof(read(c.x, c.y + 2, c.z))) return "roof";
  for (const [dx, dz] of DIRS) {
    const k = read(c.x + dx, c.y, c.z + dz);
    if (k !== "air" && isRoof(k)) return "wall";
  }
  return undefined;
}

/**
 * Where it goes to rest at a bout's end, the likeliest first (every step a fallback, 0.1.90): the retreat cell it last
 * rested in, if it's still free; the free cells under a low roof, nearest first (in a zoo every one of its exhibit's:
 * `reach` Infinity); a wall's foot within restReach; where it is. `found`: { home: { x, y, z } | undefined, roofed:
 * [{ x, y, z }], walls: [{ x, y, z }] } (free of other tortoises). Returns [{ spot, kind }], kind "home", "roof", "wall"
 * or "here".
 */
export function restOrder(found, here, T, reach = T.restReach + 1) {
  const d = (c) => Math.hypot(c.x + 0.5 - here.x, c.z + 0.5 - here.z) + Math.abs(c.y - here.y) * 0.5;
  const by = (list) => [...list].sort((p, q) => d(p) - d(q));
  const key = (c) => `${c.x},${c.y},${c.z}`;
  const out = [];
  const home = found.home && found.roofed.find((c) => key(c) === key(found.home));
  if (home) out.push({ spot: home, kind: "home" });
  for (const c of by(found.roofed)) if (c !== home && d(c) <= reach) out.push({ spot: c, kind: "roof" });
  for (const c of by(found.walls)) if (d(c) <= T.restReach + 1) out.push({ spot: c, kind: "wall" });
  out.push({ spot: { x: Math.floor(here.x), y: Math.floor(here.y + 1e-3), z: Math.floor(here.z) }, kind: "here" });
  return out;
}

// ---------------- someone near it ----------------

/**
 * Someone startling it (balance.starback): someone in Survival or Adventure, not sneaking, coming on (snailRules.js
 * comingOn) within startleRange of a wild one (zooStartleRange inside its exhibit). A hit always does. Returns how long
 * it stays in its shell (ticks, drawn from withdrawTicks, or hitTicks for a hit), or 0.
 */
export function startleFor(d, coming, zoo, hit, T, random = Math.random) {
  const draw = (r) => Math.round(r[0] + random() * (r[1] - r[0]));
  if (hit) return draw(T.hitTicks);
  if (!coming || d > (zoo ? T.zooStartleRange : T.startleRange)) return 0;
  return draw(T.withdrawTicks);
}

// ---------------- what an exhibit needs ----------------

// Chorus on the floor (species.endPlants): perTortoise for each grown one, min at least.
export function plantsNeeded(species, n) {
  const p = species.endPlants;
  return p ? Math.max(p.min, Math.ceil(p.perTortoise * n)) : 0;
}

// Warm Pads (species.warmPads): one for every perPads grown ones, min at least.
export function padsNeeded(species, n) {
  const p = species.warmPads;
  return p ? Math.max(p.min, Math.ceil(n / p.perPad)) : 0;
}

// Floor under the low roof (species.retreat): perTortoise blocks for each grown one, min at least.
export function retreatNeeded(species, n) {
  const r = species.retreat;
  return r ? Math.max(r.min, r.perTortoise * n) : 0;
}

// Chorus enough to browse (cause "plants"), Warm Pads enough to bask on ("warmPads"), a retreat big enough ("retreat"):
// false caps comfort. Not measured yet: passes.
export function hasEndPlants(species, ex, n) {
  if (!species.endPlants || !ex.tortoise) return true;
  return ex.tortoise.plants >= plantsNeeded(species, n);
}

export function hasWarmPads(species, ex, n) {
  if (!species.warmPads || !ex.tortoise) return true;
  return ex.tortoise.pads >= padsNeeded(species, n);
}

export function hasRetreat(species, ex, n) {
  if (!species.retreat || !ex.tortoise) return true;
  return ex.tortoise.retreat >= retreatNeeded(species, n);
}

export const PLANT_HOW = "chorus plants or flowers standing on the floor (a chorus flower stands on end stone, a chorus plant on end stone or more chorus)";
export const RETREAT_HOW = "a low roof 2 blocks over the floor (a lean-to, a hut or a low cave of any blocks)";

// The Exhibit Clipboard's lines for Starback Tortoises: the chorus, the Warm Pads, the retreat, the hatchlings.
export function starbackLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, residents.filter((a) => !a.juvenile).length);
  const t = ex.tortoise;
  if (!t) {
    lines.push("§fChorus, Warm Pads and retreat: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const plants = plantsNeeded(species, n);
    const pads = padsNeeded(species, n);
    const room = retreatNeeded(species, n);
    lines.push(`§fChorus to browse: ${t.plants >= plants ? "§a" : "§c"}${t.plants}§7 of ${plants} (${PLANT_HOW})`);
    lines.push(`§fWarm Pads: ${t.pads >= pads ? "§a" : "§c"}${t.pads}§7 of ${pads} in the floor to bask on`);
    lines.push(`§fRetreat: ${t.retreat >= room ? "§a" : "§c"}${t.retreat}§7 of ${room} blocks of floor under ${RETREAT_HOW}`);
  }
  const eggs = species.breeding?.eggBed;
  if (eggs) {
    if (ex.substrateCells === undefined) lines.push("§fMineral Substrate: §7not measured yet: use the Habitat Marker on the ground inside again");
    else lines.push(`§fMineral Substrate: ${ex.substrateCells >= eggs ? "§a" : "§7"}${ex.substrateCells}§7 blocks (a female nests only with ${eggs} or more)`);
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fHatchlings: §7${young}, black with yellow blotches, their stars still to come`);
  return lines;
}

// Care warnings for Starback Tortoises: chorus enough, Warm Pads enough, a retreat big enough; Mineral Substrate to nest
// in while breeding is on.
export function starbackWarnings(ex, residents, plural, species, T) {
  const out = [];
  const t = ex.tortoise;
  const n = Math.max(1, residents.filter((a) => !a.juvenile).length);
  if (t) {
    const plants = plantsNeeded(species, n);
    if (species.endPlants && t.plants < plants) out.push({ severity: 2, text: `${plural} browse the End's plants: ${plants} or more ${PLANT_HOW} (${t.plants} now; comfort can't rise above ${T.plantComfortCap} without them).` });
    const pads = padsNeeded(species, n);
    if (species.warmPads && t.pads < pads) out.push({ severity: 2, text: `${plural} bask to warm up before they browse: ${pads} or more Warm Pads in the floor, one for every ${species.warmPads.perPad} (${t.pads} now; comfort can't rise above ${T.padComfortCap} without them, and they bask in the open, warming slowly). 3 end stone bricks over a magma block make one at the Zoo Workshop.` });
    const room = retreatNeeded(species, n);
    if (species.retreat && t.retreat < room) out.push({ severity: 2, text: `${plural} rest under cover: ${room} or more blocks of floor under ${RETREAT_HOW}, ${species.retreat.perTortoise} for each (${t.retreat} now; comfort can't rise above ${T.retreatComfortCap} without it).` });
  }
  const eggs = species.breeding?.eggBed;
  if (ex.breeding?.on && eggs && (ex.substrateCells ?? 0) < eggs) out.push({ severity: 1, text: `Breeding is on, but a female digs her nest only in Mineral Substrate: ${eggs} or more blocks in the floor (${ex.substrateCells ?? 0} now).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live among the chorus of the outer End islands, alone or 2 together. The End has no day or night, so they keep to bouts: resting under cover (a chorus plant, a rock), then out to bask in the open, legs and neck stretched out, till they're warm, and to browse the chorus. Come close in Survival without sneaking (within ${T.startleRange} blocks) and one pulls into its shell with a hiss, then peeks out and goes on; it never runs. Hold Chorus Browse or a chorus fruit within ${T.baitRange} blocks and it plods over to nibble at it`;
}
