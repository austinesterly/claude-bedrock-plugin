import { houseFromReadings } from "../animals/nightRules.js";

// The nocturnal house measurement (0.1.63): once the floor is known, read the light the game itself
// computes on every floor block. The sky light says whether daylight gets in (a fully enclosed
// building has none anywhere), the light level says how bright it is (dim Nocturnal Lamps only; see
// animals/nightRules.js). A generator like the floods, a slice of blocks a tick.

const PER_YIELD = 200;

/**
 * @param {import("@minecraft/server").Dimension} dimension
 * @param {{ cells: Map<string, string>, house?: any }} out the walk measurement (or the flight measurement: Soul Moths);
 *   its land cells are read
 * @param {number} [max] the brightest allowed (animals/nightRules.js houseFromReadings)
 */
export function* measureHouse(dimension, out, balance, max = undefined) {
  const readings = [];
  let n = 0;
  for (const [k, kind] of out.cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    try {
      const b = dimension.getBlock({ x, y, z });
      if (b) readings.push({ sky: b.getSkyLightLevel(), light: b.getLightLevel() });
    } catch {
      // unloaded: left out of the count
    }
    if (++n % PER_YIELD === 0) yield;
  }
  out.house = houseFromReadings(readings, balance, max);
}
