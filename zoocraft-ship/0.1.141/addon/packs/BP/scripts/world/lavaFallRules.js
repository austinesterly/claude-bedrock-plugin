// The Lava Falls' springs (0.1.141, module 8 biomes, research/biomes_plan.md), pure. Lava made with the world never
// flows (no block update reaches it), so the biome's roof and cliffs get lava spring blocks instead (BP features
// lava_falls_*_spring), which world/lavaFalls.js turns into lava the first time their chunk runs. A spring pours out
// of its open side: below it for one in the roof, else a side (one in a cliff). It is kept only if its lava would fall
// at least MIN_DROP blocks into the lava sea, so the falls pour into the lava and never flood the ground.

export const MIN_DROP = 8;
export const MAX_DROP = 120;
// The open side a spring pours out of, in the order tried: below (a roof spring), then the four sides.
export const OPEN_SIDES = [
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];
const LAVA = new Set(["minecraft:lava", "minecraft:flowing_lava"]);

/**
 * What a spring becomes: "lava" (a fall) or "netherrack" (no fall here), from what its fall would land on (the first
 * block that isn't air under its open side, undefined if none within MAX_DROP) and how many blocks of air it would fall
 * through first. No open side at all: netherrack.
 * @param {string | undefined} land @param {number} drop
 */
export function springFate(land, drop) {
  return land !== undefined && LAVA.has(land) && drop >= MIN_DROP ? "lava" : "netherrack";
}
