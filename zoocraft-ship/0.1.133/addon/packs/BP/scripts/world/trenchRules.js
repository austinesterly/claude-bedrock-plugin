// The Deep Trench (0.1.130, module 6b part 6; research/trench_plan.md "0.1.130", trench_biome_facts.md), pure. The
// biome (BP biomes/deep_trench.biome.json) repaints part of the deep ocean; a biome can't reshape the ground, so the
// trenches are carved by world/trench.js from the rules here: a network of winding canyons on a fixed pattern of the
// world's x and z (the same world always gets the same trenches, and a trench runs on from one chunk into the next).
// Points on a jittered grid every `cell` blocks, each joined to the next point east or south by chance; the canyon
// follows those lines, its x and z bent a little by smooth noise so it winds. A column within the half width of a line
// is carved: a flat bottom near the line, walls rising almost sheer to the floor. Every number is BALANCE.trench.
// Since 0.1.132 the whole biome is dug out into an abyss (abyssRules.js) and these lines are its canyons, cut deeper.

// A whole number's hash in [0, 1), the same on every machine.
export function hash(i, j, salt) {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(salt, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Smooth value noise in [-1, 1] at (x, z), changing over about `scale` blocks.
export function noise(x, z, scale, salt) {
  const fx = x / scale;
  const fz = z / scale;
  const i = Math.floor(fx);
  const j = Math.floor(fz);
  const s = fade(fx - i);
  const t = fade(fz - j);
  const v = (a, b) => hash(a, b, salt) * 2 - 1;
  const top = v(i, j) + (v(i + 1, j) - v(i, j)) * s;
  const bottom = v(i, j + 1) + (v(i + 1, j + 1) - v(i, j + 1)) * s;
  return top + (bottom - top) * t;
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

// The network's point in grid cell (i, j): somewhere in the middle three fifths of the cell.
export function pointOf(i, j, T) {
  return { x: (i + 0.2 + 0.6 * hash(i, j, 1)) * T.cell, z: (j + 0.2 + 0.6 * hash(i, j, 2)) * T.cell };
}

// Whether the point in cell (i, j) is joined to the next one east, and to the next one south.
export const joinsEast = (i, j, T) => hash(i, j, 3) < T.eastChance;
export const joinsSouth = (i, j, T) => hash(i, j, 4) < T.southChance;

// Distance from (x, z) to the segment a-b.
function toSegment(x, z, a, b) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len2 = dx * dx + dz * dz;
  const t = len2 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / len2)) : 0;
  return Math.hypot(x - (a.x + t * dx), z - (a.z + t * dz));
}

// How far the column (x, z) is from the nearest trench line, measured where the noise has bent it to (two layers: a
// broad bend of up to `warp` blocks and a smaller wiggle; Infinity with no line near). The points are at least a fifth of a cell inside their cells and a trench is narrower than that, so the
// lines from the cells round the column's are all that can reach it.
export function lineDistance(x, z, T) {
  const wx = x + T.warp * noise(x, z, T.warpScale, 5) + T.wiggle * noise(x, z, T.wiggleScale, 9);
  const wz = z + T.warp * noise(x, z, T.warpScale, 6) + T.wiggle * noise(x, z, T.wiggleScale, 10);
  const ci = Math.floor(wx / T.cell);
  const cj = Math.floor(wz / T.cell);
  let best = Infinity;
  for (let i = ci - 1; i <= ci + 1; i++) {
    for (let j = cj - 1; j <= cj + 1; j++) {
      const p = pointOf(i, j, T);
      if (joinsEast(i, j, T)) best = Math.min(best, toSegment(wx, wz, p, pointOf(i + 1, j, T)));
      if (joinsSouth(i, j, T)) best = Math.min(best, toSegment(wx, wz, p, pointOf(i, j + 1, T)));
    }
  }
  return best;
}

// The bottom of the trench at column (x, z): the lowest y the column is carved down to, or undefined where no trench
// passes. Flat over the middle `flat` of the half width (at T.bottom, give or take bottomVary), then rising straight to
// T.top at the edge; the floor cuts the walls off lower, so a column whose bottom is above its floor isn't carved.
export function trenchBottom(x, z, T) {
  const half = T.halfWidth + T.widthVary * noise(x, z, T.widthScale, 8);
  const u = lineDistance(x, z, T) / half;
  if (!(u < 1)) return undefined;
  const low = T.bottom + T.bottomVary * noise(x, z, T.bottomScale, 7);
  const v = Math.max(0, (u - T.flat) / (1 - T.flat));
  return Math.round(low + (T.top - low) * v);
}

// The columns of chunk (cx, cz) a trench passes, each with its bottom: [{ x, z, bottom }].
export function chunkColumns(cx, cz, T) {
  const out = [];
  for (let dx = 0; dx < 16; dx++) {
    for (let dz = 0; dz < 16; dz++) {
      const x = cx * 16 + dx;
      const z = cz * 16 + dz;
      const bottom = trenchBottom(x, z, T);
      if (bottom !== undefined) out.push({ x, z, bottom });
    }
  }
  return out;
}

// What carving does. Only these turn to water: the natural rock, sand and gravel of the floor and under it, ores, the
// plants of the sea floor and caves, and any air or lava inside the trench. Nothing a player builds is in the list (nor
// planks, bricks, prismarine and the like of shipwrecks, ruins and monuments), so those are never carved away.
export const CARVED = [
  "minecraft:stone", "minecraft:granite", "minecraft:diorite", "minecraft:andesite", "minecraft:deepslate", "minecraft:tuff",
  "minecraft:calcite", "minecraft:gravel", "minecraft:sand", "minecraft:clay", "minecraft:dirt", "minecraft:coarse_dirt",
  "minecraft:dripstone_block", "minecraft:pointed_dripstone", "minecraft:smooth_basalt", "minecraft:magma", "minecraft:obsidian",
  "minecraft:moss_block", "minecraft:sculk", "minecraft:sculk_vein", "minecraft:glow_lichen", "minecraft:infested_stone",
  "minecraft:infested_deepslate", "minecraft:amethyst_block", "minecraft:budding_amethyst", "minecraft:amethyst_cluster",
  "minecraft:large_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:small_amethyst_bud", "minecraft:raw_iron_block",
  "minecraft:raw_copper_block", "minecraft:coal_ore", "minecraft:iron_ore", "minecraft:copper_ore", "minecraft:gold_ore",
  "minecraft:redstone_ore", "minecraft:lit_redstone_ore", "minecraft:lapis_ore", "minecraft:diamond_ore", "minecraft:emerald_ore",
  "minecraft:deepslate_coal_ore", "minecraft:deepslate_iron_ore", "minecraft:deepslate_copper_ore", "minecraft:deepslate_gold_ore",
  "minecraft:deepslate_redstone_ore", "minecraft:lit_deepslate_redstone_ore", "minecraft:deepslate_lapis_ore",
  "minecraft:deepslate_diamond_ore", "minecraft:deepslate_emerald_ore", "minecraft:kelp", "minecraft:seagrass",
  "minecraft:sea_pickle", "minecraft:bubble_column", "minecraft:air", "minecraft:lava", "minecraft:flowing_lava",
  "minecraft:flowing_water",
];
const CARVED_SET = new Set(CARVED);
const NOT_GROUND = new Set(["minecraft:air", "minecraft:lava", "minecraft:flowing_lava", "minecraft:flowing_water", "minecraft:bubble_column"]);

// A floor block the trench may cut through: natural ground (what a column's first solid block under the sea is).
export const naturalFloor = (typeId) => CARVED_SET.has(typeId) && !NOT_GROUND.has(typeId);

// What sealing fills: air and lava round the trench become stone, so the sea doesn't pour into a cave or meet lava.
export const SEALED = ["minecraft:air", "minecraft:lava", "minecraft:flowing_lava"];

// What to carve in a column whose floor (its first solid block from the sea down) is at floorY of type floorType: the
// range lo..hi (inclusive) turned to water, or undefined when it's left as it is (the floor above maxFloor isn't deep
// ocean, the floor isn't natural ground, or the floor is at or under the bottom already: carved before). Above the
// floor up to plantsTop only kelp, seagrass and sea pickles are there to carve (the rest is water), so the plants of the
// carved column go too and none is left floating.
export function carveRange(bottom, floorY, floorType, T) {
  if (floorY > T.maxFloor || floorY < bottom || !naturalFloor(floorType)) return undefined;
  return { lo: bottom, hi: T.plantsTop, floor: floorY };
}

// The boxes that seal a chunk's carved columns (work: {x, z, lo, floor} each) before any of them is carved, so the
// water can't run into a cave or meet lava: the block under each column, and each of its four sides (water runs
// sideways and down, never corner to corner) from its bottom up to its floor, or only up to just under that side's own
// bottom when the side is carved in the same chunk. Stone at y 0 and above and deepslate below (what the rock is
// there), each only where SEALED blocks are.
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
export function sealBoxes(work) {
  const bottoms = new Map(work.map((w) => [`${w.x},${w.z}`, w.lo]));
  const out = [];
  for (const w of work) {
    sealColumn(out, w.x, w.z, w.lo - 1, w.lo - 1);
    for (const [dx, dz] of SIDES) {
      const side = bottoms.get(`${w.x + dx},${w.z + dz}`);
      sealColumn(out, w.x + dx, w.z + dz, w.lo, side === undefined ? w.floor : Math.min(w.floor, side - 1));
    }
  }
  return out;
}
function sealColumn(out, x, z, from, to) {
  if (to >= Math.max(0, from)) out.push({ from: { x, y: Math.max(0, from), z }, to: { x, y: to, z }, block: "minecraft:stone" });
  if (from < 0 && from <= Math.min(-1, to)) out.push({ from: { x, y: from, z }, to: { x, y: Math.min(-1, to), z }, block: "minecraft:deepslate" });
}

// The 4 by 4 biome cell a column is in (the game keeps a biome for each 4 by 4 by 4 cell), and its middle.
export const cellKey = (x, z) => `${x >> 2},${z >> 2}`;
export const cellMiddle = (x, z, y) => ({ x: (x & ~3) + 2, y, z: (z & ~3) + 2 });

// Which carved chunks are recorded: a region of 32 by 32 chunks keeps a bitmap of them as 256 hex digits.
const REGION = 32;
export function regionOf(cx, cz) {
  const rx = Math.floor(cx / REGION);
  const rz = Math.floor(cz / REGION);
  return { id: `${rx},${rz}`, bit: cx - rx * REGION + REGION * (cz - rz * REGION) };
}
export const EMPTY_BITS = "0".repeat((REGION * REGION) / 4);
export function hasBit(bits, bit) {
  return (parseInt(bits[bit >> 2] ?? "0", 16) & (1 << (bit & 3))) !== 0;
}
export function withBit(bits, bit) {
  const at = bit >> 2;
  const digit = (parseInt(bits[at], 16) | (1 << (bit & 3))).toString(16);
  return bits.slice(0, at) + digit + bits.slice(at + 1);
}

// The chunks round (cx, cz) out to about `radius` (a circle, so that with radius 2 the chunks round each of them are
// still within the smallest simulation distance, 4), nearest first.
export function chunksAround(cx, cz, radius) {
  const out = [];
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dz = -radius; dz <= radius; dz++) {
      const d = dx * dx + dz * dz;
      if (d <= radius * radius + 1) out.push({ cx: cx + dx, cz: cz + dz, d });
    }
  }
  return out.sort((a, b) => a.d - b.d);
}

// Places the Field Journal can record (world/places.js): found the first time a player is in the biome.
export const PLACES = {
  deep_trench: {
    name: "Deep Trench",
    biome: "zoocraft:deep_trench",
    hint: "Deep and deep cold oceans far from land, where the water turns clear teal and the sea floor drops away at a cliff into an abyss some 100 blocks deep",
    about: "Clear teal water over an abyss some 100 blocks deep, its floor near y -40 and canyons cut deeper still. Clusters of rock spires rise from it, kelp and sea grass grow on it, coral reefs heap up on it, purple amethyst shows in white calcite, and sea lanterns, sea pickles and glow lichen light its dark bottom. Goblin sharks and anglerfish keep to the bottom, great whites cruise the upper water, and glowing jellyfish drift through it",
    found: "§bField Journal: §fyou found the §bDeep Trench§f. Its floor drops away into an abyss: goblin sharks and anglerfish live in the dark at the bottom, great whites in the upper water and jellyfish drift through it. Its page is under Places.",
  },
};

// The Places page: a line a place, found (where) or not (with the Park Guidebook, where to look).
export function placeLines(found, guidebook) {
  const lines = [];
  for (const [id, place] of Object.entries(PLACES)) {
    const f = found?.[id];
    if (f) lines.push(`§b${place.name}§7: found at x ${f.x}, z ${f.z}. ${place.about}.`);
    else lines.push(`§8${place.name}§7: not found yet. ${guidebook ? `Where to look: ${place.hint}.` : "The Park Guidebook (Research Desk) says where to look."}`);
    lines.push("");
  }
  return lines;
}
