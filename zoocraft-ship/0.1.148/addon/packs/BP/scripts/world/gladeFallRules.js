// The Mythical Glade's springs (0.1.148, module 9, research/mythical_plan.md), pure. Water made with the world never
// flows (no block update reaches it), so the glade's cliffs get spring blocks instead (BP feature glade_spring, just
// under the turf with open air on a side), which world/gladeFalls.js turns into water the first time their chunk runs.
// A spring pours out of its open side and is kept only if the water would fall at least MIN_DROP blocks, so it makes a
// waterfall and not a trickle down a step; else it turns back into the ground round it.

export const MIN_DROP = 4;
export const MAX_DROP = 64;
// The open side a spring pours out of, in the order tried (a spring sits in a cliff face, never under an overhang).
export const OPEN_SIDES = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
];
const LAVA = new Set(["minecraft:lava", "minecraft:flowing_lava"]);
const SOIL = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:dirt_with_roots"]);

/**
 * What a spring becomes: "water" (a fall) or "rock" (no fall here), from what its fall would land on (the first block
 * that isn't air under its open side, undefined if none within MAX_DROP) and how many blocks of air it would fall
 * through first.
 * @param {string | undefined} land @param {number} drop
 */
export function springFate(land, drop) {
  return land !== undefined && !LAVA.has(land) && drop >= MIN_DROP ? "water" : "rock";
}

/**
 * The block a spring that makes no fall turns into: dirt under turf or dirt, else stone (what the cliff is made of there).
 * @param {string | undefined} above the block over the spring
 */
export function rockFor(above) {
  return above !== undefined && SOIL.has(above) ? "minecraft:dirt" : "minecraft:stone";
}
