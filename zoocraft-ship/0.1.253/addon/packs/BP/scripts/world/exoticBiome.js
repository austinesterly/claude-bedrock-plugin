// Whether a place is in the Exotic Formation (0.1.253): the biome the game has there, or at one of the heights the
// world's features read for that column (BP features/formation_*.json: a hall is dug where the biome is there at any
// of them, so someone on a hall's floor can be a little under the biome itself). A place in land that is not loaded
// counts as outside.
import { BALANCE } from "../data/balance.js";
import { isExotic } from "./formationRules.js";

const F = BALANCE.formation;

export function inExotic(dimension, at) {
  const x = Math.floor(at.x);
  const z = Math.floor(at.z);
  try {
    for (const y of [Math.floor(at.y), ...F.levels]) if (isExotic(dimension.getBiome({ x, y, z }).id)) return true;
  } catch {
    // not loaded
  }
  return false;
}
