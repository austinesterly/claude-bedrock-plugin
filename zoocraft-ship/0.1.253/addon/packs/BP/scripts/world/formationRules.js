// The Exotic Formation: where the caverns are. Since 0.1.253 it is a real cave biome (BP biomes/
// exotic_formation.biome.json) that the game lays over parts of its lush and dripstone caves from the world's seed,
// so no arithmetic can say where one is: the game knows (`/locate biome zoocraft:exotic_formation`, and the biome at
// a place). What this file still does by whole-number arithmetic is cut the map into squares, so the owls, the
// Shark People and their villages can be counted and placed square by square inside the biome.
// No engine calls here: the tests run it.
import { BALANCE } from "../data/balance.js";

const F = BALANCE.formation;
/** A whole number's remainder that is never negative (as the features' math.mod(math.mod(v, n) + n, n)). */
export const mod = (v, n) => ((v % n) + n) % n;

/** The square of the map a column is in. */
export function cellOf(x, z) {
  return { i: Math.floor(x / F.cell), j: Math.floor(z / F.cell) };
}

/**
 * Square (i, j) as a place a hall may be: its middle, a radius that covers the whole square, and the height the
 * halls' floors are near. Whether a hall IS there is the biome's to say (isExotic on the biome at a place).
 */
export function formationIn(i, j) {
  return { x: i * F.cell + F.cell / 2, z: j * F.cell + F.cell / 2, radius: F.radius, y: F.floor };
}

/** Whether a biome id is the Exotic Formation's. */
export function isExotic(biomeId) {
  return biomeId === F.biome;
}

/** The colour piece (0 at the roof) of a Sunset Vine hung under `above`: a vine's piece is one more than the piece over it. */
export function vinePiece(aboveId, abovePiece) {
  return aboveId === "zoocraft:sunset_vine" ? Math.min(F.vinePieces - 1, (abovePiece ?? 0) + 1) : 0;
}

/** What goo does to someone: `around` is the blocks at their feet and head, `under` the two under their feet.
 *  "rise" while they hold jump in it or just over it (so they clear a pit's rim), "sink" (slowly) in it, else undefined. */
export function gooMove(around, under, jumping) {
  const isGoo = (id) => id === "zoocraft:goo";
  const inIt = around.some(isGoo);
  if (jumping && (inIt || under.some(isGoo))) return "rise";
  return inIt ? "sink" : undefined;
}
