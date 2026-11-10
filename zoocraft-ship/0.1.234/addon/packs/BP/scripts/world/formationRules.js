// The Exotic Formation (0.1.234): where the caverns are. The world makes them (features/formation_*.json), and
// where each one is comes from whole-number arithmetic on the square of the map it is in, the same in every world,
// so this file can repeat it and point a player at one. Only the cavern's outline, roof and pits come from the
// world's own noise, which a script can't read. No engine calls here: the tests run it.
import { BALANCE } from "../data/balance.js";

const F = BALANCE.formation;
/** A whole number's remainder that is never negative (as the features' math.mod(math.mod(v, n) + n, n)). */
export const mod = (v, n) => ((v % n) + n) % n;

/** The square of the map a column is in. */
export function cellOf(x, z) {
  return { i: Math.floor(x / F.cell), j: Math.floor(z / F.cell) };
}

/** The formation in square (i, j): its middle, its radius and the height of its floor at the rim; undefined if the square has none. */
export function formationIn(i, j) {
  if (mod(i * 7 + j * 13 + mod(i * j, 5) * 3, F.chanceOf) >= F.chance) return undefined;
  return {
    x: i * F.cell + F.cell / 2 + (mod(i * 37 + j * 91, 7) - 3) * 16,
    z: j * F.cell + F.cell / 2 + (mod(i * 53 + j * 29, 7) - 3) * 16,
    radius: F.radius + mod(i * 17 + j * 71, 5) * F.radiusStep,
    y: F.floor + mod(i * 11 + j * 23, 5) * F.floorStep,
  };
}

/** Where to stand in a formation: the middle of its hall (kept clear of pillars and goo), a little over the floor. */
export function standIn(f) {
  return { x: f.x, y: f.y - F.dip + F.standOver, z: f.z };
}

/** The nearest formation to (x, z), looking `rings` squares out each way: { x, y, z, radius, distance }. */
export function nearestFormation(x, z, rings = F.searchRings) {
  const c = cellOf(x, z);
  let best;
  for (let di = -rings; di <= rings; di++) {
    for (let dj = -rings; dj <= rings; dj++) {
      const f = formationIn(c.i + di, c.j + dj);
      if (!f) continue;
      const distance = Math.hypot(f.x - x, f.z - z);
      if (!best || distance < best.distance) best = { ...standIn(f), radius: f.radius, distance };
    }
  }
  return best;
}

/** Whether (x, z) is inside a formation's outline (roughly: the noise moves the edge a little). */
export function insideFormation(x, z) {
  const c = cellOf(x, z);
  const f = formationIn(c.i, c.j);
  return !!f && Math.hypot(f.x - x, f.z - z) < f.radius;
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
