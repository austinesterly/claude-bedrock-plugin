// Where a resident sets their own workstation down in their house (0.1.309; Austin 2026-11-16: "Han should place his
// own hanvil when he moves in"). No engine calls here.
const K = (x, z) => `${x},${z}`;
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/** The open floor cells reached from `from` by walking: a Set of "x,z". `open(x, z)` says whether a cell is open. */
export function reach(from, open, limit = 400) {
  const seen = new Set();
  if (!open(from.x, from.z)) return seen;
  const todo = [[from.x, from.z]];
  seen.add(K(from.x, from.z));
  while (todo.length && seen.size < limit) {
    const [x, z] = todo.pop();
    for (const [dx, dz] of SIDES) {
      const k = K(x + dx, z + dz);
      if (seen.has(k) || !open(x + dx, z + dz)) continue;
      seen.add(k);
      todo.push([x + dx, z + dz]);
    }
  }
  return seen;
}

/**
 * The floor cell a workstation goes on, or undefined when the house has no room for one. `open(x, z)`: an open floor
 * cell of the house (air or a carpet over something to stand on, inside its walls); `free(x, z)`: one of those with
 * nothing on it at all (the workstation never takes a carpet's place); `stand`: where the resident stands at home;
 * `door`: the cell just inside the front door. The cell is one the resident can walk to, not where they stand, not the
 * door's cell or one beside it, and with it filled every other cell can still be walked to. Of those, the one with
 * the most walls and furniture round it (a corner before the middle of the room), then the one furthest from the door.
 */
export function pickSpot(open, stand, door, free = open) {
  const all = reach(stand, open);
  if (all.size < 3) return undefined;
  let best;
  for (const k of all) {
    const [x, z] = k.split(",").map(Number);
    if (x === stand.x && z === stand.z) continue;
    if (!free(x, z)) continue; // walked over, but not bare (a carpet lies there)
    if (door && Math.abs(x - door.x) + Math.abs(z - door.z) <= 1) continue;
    const without = reach(stand, (a, b) => !(a === x && b === z) && open(a, b));
    if (without.size !== all.size - 1) continue; // it would wall part of the house off
    let walls = 0;
    for (const [dx, dz] of SIDES) if (!open(x + dx, z + dz)) walls++;
    const far = door ? Math.abs(x - door.x) + Math.abs(z - door.z) : 0;
    const score = walls * 100 + far;
    if (!best || score > best.score || (score === best.score && (x < best.x || (x === best.x && z < best.z)))) best = { x, z, score };
  }
  return best ? { x: best.x, z: best.z } : undefined;
}
