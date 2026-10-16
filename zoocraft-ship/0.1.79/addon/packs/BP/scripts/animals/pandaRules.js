// Red pandas (0.1.79, the Treetop trio), pure: the day's moods, the way up a trunk onto the canopy and
// along it, the Nest Box, the heat, and what an exhibit needs. Spec 5.2: "red_panda | Red panda |
// Elevated travel and resting | Continuous climbing routes, nest boxes". The game side is
// animals/redpanda.js; the canopy count is the climb measure's (exhibits/geometry.js floodClimb).
// Sources (research/treetop_facts.md): crepuscular, with a smaller peak near midnight, resting 60-75% of
// the time in zoos (Bugler et al. 2023); they climb down head first, sleep on branches, in hollows and
// nest boxes, sprawl on a branch and pant in the heat and curl up with the tail over the face in the
// cold; heat above about 25 C is a risk and protection above 27 C critical (AZA manual).

import { climbGrips } from "../exhibits/geometry.js";

// The red panda mobs, found by type (0.1.70: never by family alone).
export const RED_PANDA_TYPES = ["zoocraft:red_panda", "zoocraft:wild_red_panda"];

// What a red panda is doing (its zoocraft:act entity property): the client plays the matching
// animation and the Field Journal watches for it. The climbing ones share the raccoon's numbers
// (animals/climbRules.js ACT: climb 1, cling 2, down 7, and 9 for going along the top), so the
// raccoon's climbing legs (upLegs, downLegs) serve both.
export const ACT = { none: 0, climb: 1, cling: 2, eat: 3, groom: 4, stand: 5, curl: 6, down: 7, drape: 8, along: 9, nest: 10, pant: 11, play: 12 };
// Asleep (the client shuts its eyes).
export const SLEEP_ACTS = [ACT.curl, ACT.drape];

const DIRS = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
];

// ---------------- the day ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight. A range [a, b] may run past
// midnight's wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// "active" at dawn, at dusk and for a spell around midnight (foraging, climbing, along the canopy);
// "rest" through the day (draped on a branch, or panting in the heat); "sleep" through the night
// (curled up on the canopy or in a Nest Box).
export function moodAt(timeOfDay, T) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  if (within(t, T.dawn) || within(t, T.dusk) || within(t, T.midnight)) return "active";
  return t < 12000 ? "rest" : "sleep";
}

// ---------------- what the exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Canopy blocks to travel and rest on: balance.redpanda.canopyPer for each grown one.
export function canopyNeeded(animals, T) {
  return Math.max(1, grown(animals)) * T.canopyPer;
}

// A continuous climbing route (spec 5.2): enough canopy reached by climbing (the climb measure's
// count). A species without the need, or an exhibit not measured for it yet, always has it.
export function hasCanopy(species, ex, animals, T) {
  if (!species.canopy || !ex.climb || ex.climb.canopy === undefined) return true;
  return ex.climb.canopy >= canopyNeeded(animals, T);
}

// A Nest Box for each grown one (spec 5.2 "nest boxes"; red pandas sleep in them, and cubs are born in one).
export function nestsNeeded(animals) {
  return Math.max(1, grown(animals));
}

export function hasNestBoxes(species, fixtures, animals) {
  if (!species.nestBox) return true;
  return fixtures.filter((f) => f.type === "nest").length >= nestsNeeded(animals);
}

// A hot biome (the biome at the exhibit's floor, dimension.getBiome): one of balance.redpanda.hotTags
// (bedrock-samples biomes: desert and mesa run at 2.0, savanna 1.2; a bamboo jungle 0.95), or failing
// the tags, a desert, savanna or badlands id.
export function isHotBiome(biome, T) {
  if (!biome) return false;
  if (biome.tags?.length) return biome.tags.some((t) => T.hotTags.includes(t));
  return /desert|savanna|badlands|mesa/.test(biome.id ?? "");
}

// In a hot biome, cover (leaves or a roof) over balance.redpanda.shade of the floor.
export function shadeNeeded(ex, T) {
  return Math.ceil((ex.usableArea ?? 0) * T.shade);
}

export function hasShade(species, ex, T) {
  if (!species.heatShade || !ex.hotBiome) return true;
  return (ex.coveredCells ?? 0) >= shadeNeeded(ex, T);
}

// The care warnings: canopy, Nest Boxes and shade from the heat.
export function pandaWarnings(ex, residents, fixtures, plural, T) {
  const out = [];
  const nests = fixtures.filter((f) => f.type === "nest").length;
  if (ex.climb?.canopy !== undefined && ex.climb.canopy < canopyNeeded(residents, T)) {
    out.push({ severity: 2, text: `${plural} travel and rest up in the trees: they need ${canopyNeeded(residents, T)} canopy blocks (${T.canopyPer} for each grown one) they can reach by climbing, on top of leaves, logs or a Climbing Frame 2 or more blocks up (${ex.climb.canopy} now). Grow trees whose leaves reach a trunk they can climb, back from the walls.` });
  }
  if (nests < nestsNeeded(residents)) out.push({ severity: 2, text: `${plural} sleep in Nest Boxes: place one for each grown one (${nests} of ${nestsNeeded(residents)}), up on a trunk or a wall beside the canopy, or on the floor.` });
  if (ex.hotBiome && (ex.coveredCells ?? 0) < shadeNeeded(ex, T)) out.push({ severity: 3, text: `Too hot: ${plural.toLowerCase()} suffer above about 25 C, and this is a hot biome. Shade at least a third of the floor with leaves or a roof (${ex.coveredCells ?? 0} of ${shadeNeeded(ex, T)} blocks now).` });
  return out;
}

// The clipboard's lines: the canopy and the Nest Boxes, and the heat in a hot biome.
export function pandaLines(ex, residents, fixtures, T) {
  const nests = fixtures.filter((f) => f.type === "nest").length;
  const lines = [];
  lines.push(ex.climb?.canopy !== undefined ? `§fCanopy: §7${ex.climb.canopy} of ${canopyNeeded(residents, T)} blocks up in the trees, reached from a trunk` : "§fCanopy: §7not measured yet: use the Habitat Marker on the ground inside again");
  lines.push(`§fNest Boxes: §7${nests} of ${nestsNeeded(residents)}`);
  if (ex.hotBiome) lines.push(`§fHeat: §ca hot biome§7, ${ex.coveredCells ?? 0} of ${shadeNeeded(ex, T)} floor blocks shaded`);
  return lines;
}

// ---------------- climbing ----------------
// What it stands on up in the trees: leaves, a log or a Climbing Frame.
export const canopyFloor = (c) => c === "leaves" || c === "log" || c === "frame";

// A canopy block: open, with leaves, a log or a frame under it.
export function isCanopy(read, x, y, z) {
  return read(x, y, z) === "air" && canopyFloor(read(x, y - 1, z));
}

/**
 * The way up a trunk (a column of logs) or a Climbing Frame from a red panda standing in the block
 * `foot`, the trunk `dir` ({ x, z }) one block away: up the face while the trunk is beside it and on
 * up through the leaves round it (it pushes through foliage), at most `maxUp` blocks, until it comes
 * out on top of the leaves (onTop, top in its own column: the canopy); or, where the trunk ends with its
 * top clear, over onto the top of the trunk (onTop, top on the trunk); otherwise it clings where it
 * stopped. Undefined when there are fewer than 2 blocks to climb. The route has the raccoon's shape
 * (animals/climbRules.js climbRoute), so its upLegs and downLegs serve.
 * @returns {{ up: {x:number,y:number,z:number}[], top: {x:number,y:number,z:number}, onTop: boolean, canopy: boolean } | undefined}
 */
export function pandaRoute(read, foot, dir, maxUp) {
  const tx = foot.x + dir.x;
  const tz = foot.z + dir.z;
  const up = [];
  for (let k = 1; k <= maxUp; k++) {
    const y = foot.y + k;
    const here = read(foot.x, y, foot.z);
    // Out of the leaves into the open: standing on top of the canopy.
    if (here === "air" && up.length >= 2 && read(foot.x, y - 1, foot.z) === "leaves") return { up, top: { x: foot.x, y, z: foot.z }, onTop: true, canopy: true };
    if (here !== "air" && here !== "leaves") break;
    if (here !== "leaves" && !climbGrips(read(tx, y, tz))) break;
    up.push({ x: foot.x, y, z: foot.z });
  }
  if (up.length < 2) return undefined;
  const last = up[up.length - 1];
  const above = last.y + 1;
  if (read(foot.x, above, foot.z) === "air" && read(tx, above, tz) === "air" && canopyFloor(read(tx, last.y, tz))) return { up, top: { x: tx, y: above, z: tz }, onTop: true, canopy: false };
  return { up, top: last, onTop: false, canopy: false };
}

const keyOf = (c) => `${c.x},${c.y},${c.z}`;

/**
 * The canopy it can get to from `start` (a canopy block, where it came up): a flood over canopy
 * blocks, a step along to the next one level, a step up onto one a block higher (with room over its
 * head) or a step down onto one a block lower (open at its own level first), at most `maxCells` of
 * them. Each entry has its distance (steps) and the block it was reached from.
 * @returns {Map<string, { x: number, y: number, z: number, dist: number, prev: string | undefined }>}
 */
export function canopyMap(read, start, maxCells) {
  const map = new Map([[keyOf(start), { ...start, dist: 0, prev: undefined }]]);
  const queue = [start];
  for (let h = 0; h < queue.length && map.size < maxCells; h++) {
    const c = queue[h];
    const from = map.get(keyOf(c));
    for (const d of DIRS) {
      for (const dy of [0, 1, -1]) {
        const n = { x: c.x + d.x, y: c.y + dy, z: c.z + d.z };
        const k = keyOf(n);
        if (map.has(k) || !isCanopy(read, n.x, n.y, n.z)) continue;
        if (dy === 1 && read(c.x, c.y + 1, c.z) !== "air") continue;
        if (dy === -1 && read(n.x, c.y, n.z) !== "air") continue;
        map.set(k, { ...n, dist: from.dist + 1, prev: keyOf(c) });
        queue.push(n);
        if (map.size >= maxCells) break;
      }
      if (map.size >= maxCells) break;
    }
  }
  return map;
}

// The blocks from the start of the map to `key`, the start left out.
export function pathTo(map, key) {
  const out = [];
  for (let k = key; k && map.get(k)?.prev !== undefined; k = map.get(k).prev) out.unshift(map.get(k));
  return out.map(({ x, y, z }) => ({ x, y, z }));
}

// Somewhere along the canopy `min` to `max` steps away (the farthest ones twice as likely); or the
// farthest it has when nothing is that far, or undefined when there's nowhere else to go.
export function pickSpot(map, min, max, random = Math.random) {
  const far = [...map.values()].filter((c) => c.dist >= min && c.dist <= max);
  const pool = far.length ? far.flatMap((c) => (c.dist * 2 > min + max ? [c, c] : [c])) : [...map.values()].filter((c) => c.dist > 0).sort((a, b) => b.dist - a.dist).slice(0, 1);
  if (!pool.length) return undefined;
  return keyOf(pool[Math.floor(random() * pool.length)]);
}

// Draped over a branch: lengthwise along the edge of the canopy where it has one (nothing to stand on
// beside it), shifted toward the drop so its legs and tail hang over; otherwise just lying there.
export function drapeSpot(read, c, T) {
  for (const d of DIRS) {
    const open = read(c.x + d.x, c.y, c.z + d.z) === "air" && !canopyFloor(read(c.x + d.x, c.y - 1, c.z + d.z));
    if (open) return { pos: { x: c.x + 0.5 + d.x * T.drapeShift, y: c.y, z: c.z + 0.5 + d.z * T.drapeShift }, yaw: yawAlong(d) };
  }
  return { pos: { x: c.x + 0.5, y: c.y, z: c.z + 0.5 }, yaw: undefined };
}

// Facing along an edge whose drop is `d` away.
function yawAlong(d) {
  return d.x ? 0 : 90;
}

// A Nest Box beside the canopy it can get to: the nearest one standing level with a canopy block,
// right beside it. isNest(x, y, z) says whether a Nest Box is there.
export function nestBeside(map, isNest) {
  let best;
  for (const c of map.values()) {
    if (best && c.dist >= best.cell.dist) continue;
    for (const d of DIRS) {
      const box = { x: c.x + d.x, y: c.y, z: c.z + d.z };
      if (isNest(box.x, box.y, box.z)) {
        best = { cell: c, box };
        break;
      }
    }
  }
  return best ? { key: keyOf(best.cell), cell: { x: best.cell.x, y: best.cell.y, z: best.cell.z }, box: best.box } : undefined;
}

// Which way a Nest Box's hole faces, from its minecraft:cardinal_direction (the block turns its -z
// front that way; gen/redpanda.py).
export function holeDir(direction) {
  return { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, west: { x: -1, z: 0 }, east: { x: 1, z: 0 } }[direction] ?? { x: 0, z: -1 };
}

// Where a red panda sits in a Nest Box (the block `box`, its hole `dir` away), and the way it faces:
// toward the hole, far enough forward that its head is out of it and the rest of it inside. The box's
// front is T.nestFront in front of the middle; the back of a grown one's head T.headBack in front of
// its own middle, `scale` of that for a cub.
export function nestSpot(box, dir, scale, T) {
  const f = T.nestFront - T.headBack * scale;
  return { pos: { x: box.x + 0.5 + dir.x * f, y: box.y + T.nestFloor, z: box.z + 0.5 + dir.z * f }, yaw: Math.round((Math.atan2(0 - dir.x, dir.z) * 180) / Math.PI) };
}

// What it goes looking for next on the ground (the engine walks it there; animals/redpanda.js does the
// rest when it arrives). Active: up a tree mostly, to the feeder when there's food it eats, grooming
// on the spot; a cub with company plays. Resting or asleep: up a tree to drape over a branch or curl
// up, or into a Nest Box on the floor; with nowhere up, it lies down where it is.
export function pickInterest({ mood, feeder, nest, cub, company }, random = Math.random) {
  if (mood === "active") {
    const pool = ["climb", "climb", "climb", "groom", "idle"];
    if (feeder) pool.push("feeder", "feeder");
    if (cub && company) pool.push("play", "play");
    return pool[Math.floor(random() * pool.length)];
  }
  const pool = ["climb", "climb", "climb"];
  if (nest) pool.push(mood === "sleep" ? "nest" : "climb", "nest");
  return pool[Math.floor(random() * pool.length)];
}

// How it rests: panting in the heat (a hot biome, by day), curled up at night, draped over a branch by day.
export function restAct(mood, hot) {
  if (mood === "sleep") return ACT.curl;
  return hot ? ACT.pant : ACT.drape;
}
