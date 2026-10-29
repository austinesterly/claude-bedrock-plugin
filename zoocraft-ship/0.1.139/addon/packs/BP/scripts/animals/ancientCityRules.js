// The Skulker's Ancient Cities (0.1.139, pure): whether someone stands in one (city blocks around them, read a sample
// at a time), whether it is one found before, and where to put the city's Skulker out of their sight. The game side is
// animals/skulker.js tickAncientCities. On the bench (Mojang's server, seed 12345, 2026-10-29) the sample read 95, 76 and
// 80 city blocks at three places in the test map's city and 0 in the plain deep dark and in an ordinary cave, in 4 to 5
// ms; the hiding place was found 14 to 22 blocks off in 0 to 8 ms.

// The blocks an Ancient City is built of (research/cave_facts.md, seen on the test map), and none of them make up the
// deep dark's own caves: its floors and halls of deepslate bricks and tiles, the polished and chiseled deepslate, the
// portal frame's reinforced deepslate, the gray wool carpets and the soul lanterns.
export const CITY_BLOCKS = new Set([
  "minecraft:deepslate_bricks", "minecraft:cracked_deepslate_bricks", "minecraft:deepslate_brick_slab", "minecraft:deepslate_brick_stairs",
  "minecraft:deepslate_brick_wall", "minecraft:deepslate_tiles", "minecraft:cracked_deepslate_tiles", "minecraft:deepslate_tile_slab",
  "minecraft:deepslate_tile_stairs", "minecraft:deepslate_tile_wall", "minecraft:polished_deepslate", "minecraft:polished_deepslate_slab",
  "minecraft:polished_deepslate_stairs", "minecraft:polished_deepslate_wall", "minecraft:chiseled_deepslate", "minecraft:reinforced_deepslate",
  "minecraft:gray_wool", "minecraft:gray_carpet", "minecraft:soul_lantern",
]);

// The sample round a point: every `step` blocks out to `r` across, at the heights in `dys`.
export function citySample(p, r = 12, step = 3, dys = [-3, -1, 1, 3]) {
  const out = [];
  const x0 = Math.floor(p.x), y0 = Math.floor(p.y), z0 = Math.floor(p.z);
  for (let dx = -r; dx <= r; dx += step) for (let dz = -r; dz <= r; dz += step) for (const dy of dys) out.push({ x: x0 + dx, y: y0 + dy, z: z0 + dz });
  return out;
}

// How many of the sample are city blocks (idAt: a block's id, or undefined unloaded), counting no further than `stop`.
/**
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {{ x: number, y: number, z: number }} p
 */
export function cityScore(idAt, p, r = 12, step = 3, dys = [-3, -1, 1, 3], stop = Infinity) {
  let n = 0;
  for (const c of citySample(p, r, step, dys)) if (CITY_BLOCKS.has(idAt(c.x, c.y, c.z)) && ++n >= stop) break;
  return n;
}

// A city not found before: `spacing` blocks or more from every one found (cities are about 100 to 200 across).
/** @param {{ x: number, z: number }[] | undefined} cities @param {{ x: number, z: number }} p @param {number} spacing */
export function isNewCity(cities, p, spacing) {
  return (cities ?? []).every((c) => Math.hypot(c.x - p.x, c.z - p.z) >= spacing);
}

// Where to put a city's Skulker: a cell `min` to `max` blocks from p (around it, from a random start), with a floor
// under it (kindAt "solid") and room for it (`height` cells of air), out of sight of `eye` (blocked(eye, cellCentre):
// a block between). Looked for up and down a few blocks from p's height. undefined if none.
/**
 * @param {(x: number, y: number, z: number) => string} kindAt
 * @param {(eye: { x: number, y: number, z: number }, to: { x: number, y: number, z: number }) => boolean} blocked
 * @param {{ x: number, y: number, z: number }} eye
 * @param {{ x: number, y: number, z: number }} p
 * @param {{ min?: number, max?: number, height?: number, tries?: number, rand?: () => number, dy?: number }} [opts]
 */
export function hideSpot(kindAt, blocked, eye, p, opts = {}) {
  const { min = 12, max = 24, height = 2, tries = 48, rand = Math.random, dy = 6 } = opts;
  const y0 = Math.floor(p.y);
  const a0 = rand() * 360;
  for (let i = 0; i < tries; i++) {
    const a = ((a0 + i * 137.5) % 360) * (Math.PI / 180);
    const d = min + ((i * 7) % (max - min + 1));
    const x = Math.floor(p.x + Math.cos(a) * d), z = Math.floor(p.z + Math.sin(a) * d);
    for (let k = 0; k <= dy * 2; k++) {
      const y = y0 + (k % 2 ? -((k + 1) >> 1) : k >> 1);
      if (kindAt(x, y - 1, z) !== "solid") continue;
      let room = true;
      for (let h = 0; h < height && room; h++) room = kindAt(x, y + h, z) === "air";
      if (!room) continue;
      const at = { x: x + 0.5, y: y + 1, z: z + 0.5 };
      if (!blocked(eye, at)) continue;
      return { x: x + 0.5, y, z: z + 0.5 };
    }
  }
  return undefined;
}
