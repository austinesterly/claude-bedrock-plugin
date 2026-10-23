// Guest journeys (0.1.60, Austin: "allow NPCs to travel up stairs and across bridges to different
// far away exhibits"), pure. The path network (paths.js) already knows every path block guests can
// reach from the entrance, steps and bridges included; this plans a route over it from where a
// guest stands to a far Viewing Point, Snack Stand or Bench, and the game walks the guest along it
// (guests.js) instead of leaving it to the mob pathfinder, which only looks a few blocks around.
//
// Positions: a network node is a path BLOCK (x, y, z); a guest's feet stand on top of it, at y + 1
// (less for a slab). A "spot" is the block a guest stands in (feet), as points.js and services.js
// record it.

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const col = (x, z) => `${x},${z}`;

// The reached path block nearest to a standing spot (feet at `spot`): in a column within `reach`
// blocks sideways, with its top between three blocks below the feet and level with them.
export function nearestNode(net, spot, reach = 2) {
  let best;
  for (let dx = -reach; dx <= reach; dx++) {
    for (let dz = -reach; dz <= reach; dz++) {
      const ys = net.columns.get(col(spot.x + dx, spot.z + dz));
      if (!ys) continue;
      for (const y of ys) {
        if (y < spot.y - 3 || y > spot.y) continue;
        const d = dx * dx + dz * dz + (spot.y - 1 - y) ** 2;
        if (!best || d < best.d) best = { x: spot.x + dx, y, z: spot.z + dz, d };
      }
    }
  }
  return best;
}

// Shortest route over the network from one node to another, stepping to the four neighbours up or
// down one block (as the walk did), as a job: yields every `perYield` nodes taken off the queue so a
// big park's search spreads over ticks. Returns the nodes from `from` to `to`, or undefined when
// there is no way (or the search would cross more than `limit` nodes).
// 0.1.96: the same search a third quicker in the game's script engine: nodes are numbered rather than named by
// strings, a column is looked up once a search, and the loops index their steps (no iterators). A search never reaches
// more than `limit` blocks from `from`, well inside the numbering's 2^20 each way.
export function* routeSearch(net, from, to, limit = 6000, perYield = Infinity) {
  if (!net.columns.get(col(from.x, from.z))?.includes(from.y) || !net.columns.get(col(to.x, to.z))?.includes(to.y)) return undefined;
  const ox = from.x - SPAN;
  const oz = from.z - SPAN;
  const colNo = (x, z) => (x - ox) * 2 * SPAN + (z - oz);
  const nodeNo = (x, y, z) => colNo(x, z) * 1024 + (y + 512);
  const cols = new Map(); // column number -> its path blocks' y, or null
  const goal = nodeNo(to.x, to.y, to.z);
  const prev = new Map([[nodeNo(from.x, from.y, from.z), undefined]]);
  const queue = [from];
  let head = 0;
  while (head < queue.length) {
    const c = queue[head++];
    if (nodeNo(c.x, c.y, c.z) === goal) break;
    if (head % perYield === 0) yield;
    for (let d = 0; d < 4; d++) {
      const x = c.x + STEP_X[d];
      const z = c.z + STEP_Z[d];
      const cn = colNo(x, z);
      let ys = cols.get(cn);
      if (ys === undefined) cols.set(cn, (ys = net.columns.get(col(x, z)) ?? null));
      if (!ys) continue;
      for (let j = 0; j < 3; j++) {
        const y = c.y + STEP_Y[j];
        if (!ys.includes(y)) continue;
        const k = cn * 1024 + (y + 512);
        if (prev.has(k)) continue;
        prev.set(k, c);
        queue.push({ x, y, z });
        if (prev.size > limit) return undefined;
      }
    }
  }
  if (!prev.has(goal)) return undefined;
  const out = [];
  for (let n = to; n; n = prev.get(nodeNo(n.x, n.y, n.z))) out.push({ x: n.x, y: n.y, z: n.z });
  return out.reverse();
}
const SPAN = 1048576; // 2^20: node numbers stay exact (under 2^53)
const STEP_X = DIRS.map(([dx]) => dx);
const STEP_Z = DIRS.map(([, dz]) => dz);
const STEP_Y = [0, 1, -1];

// The same search run to the end at once (tests, and small networks).
export function routeBetween(net, from, to, limit = 6000) {
  const it = routeSearch(net, from, to, limit);
  let r = it.next();
  while (!r.done) r = it.next();
  return r.value;
}

// The corners of a route: straight flat runs are walked in one go; every turn and every step up or
// down is kept, so stairs are climbed block by block.
export function waypoints(route) {
  if (route.length <= 2) return route.slice();
  const out = [route[0]];
  for (let i = 1; i < route.length - 1; i++) {
    const a = route[i - 1];
    const b = route[i];
    const c = route[i + 1];
    const straight = b.x - a.x === c.x - b.x && b.z - a.z === c.z - b.z;
    const flat = a.y === b.y && b.y === c.y;
    if (!straight || !flat) out.push(b);
  }
  out.push(route[route.length - 1]);
  return out;
}

// Where feet stand on a path block: its top. `top(x, y, z)` tells the block's height (1 for a full
// block, 0.5 for a bottom slab); stairs are walked as a ramp between the nodes either side.
export function feetAt(node, top) {
  return { x: node.x + 0.5, y: node.y + (top ? top(node.x, node.y, node.z) : 1), z: node.z + 0.5 };
}

// One tick of walking from `pos` toward `target` (feet positions) at `speed` blocks per tick:
// the next position, the yaw to face, and whether the target is reached. The height follows the
// ground between the two in a straight ramp, so a step up a stair reads as a climb, not a hop.
export function walkStep(pos, target, speed) {
  const dx = target.x - pos.x;
  const dz = target.z - pos.z;
  const dist = Math.hypot(dx, dz);
  const yaw = Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
  if (dist <= speed) return { x: target.x, y: target.y, z: target.z, yaw, arrived: true };
  const f = speed / dist;
  return { x: pos.x + dx * f, y: pos.y + (target.y - pos.y) * f, z: pos.z + dz * f, yaw, arrived: false };
}

/**
 * Where to go next: a spot the guest hasn't been to yet, far ones favoured so the whole park gets
 * seen (weight 1 per 8 blocks away, at least 1). `spots` carry { x, y, z } feet positions; `at` is
 * the guest's feet. A spot at an exhibit in `favoured` (a set of exhibit ids: a Nether or End visitor's
 * own dimension's exhibits, 0.1.98) weighs `pull` times as much. Returns the chosen spot or undefined.
 */
export function pickDestination(spots, at, visited, random = Math.random, favoured = undefined, pull = 1) {
  const fresh = spots.filter((s) => !visited.has(s.id));
  const pool = fresh.length ? fresh : spots;
  if (!pool.length) return undefined;
  const weights = pool.map((s) => Math.max(1, Math.hypot(s.x - at.x, s.z - at.z) / 8) * (s.exhibitId && favoured?.has(s.exhibitId) ? pull : 1));
  let r = random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// How long a route takes at `speed` blocks per tick, in ticks (for a guest's patience).
export function routeTicks(route, speed) {
  let len = 0;
  for (let i = 1; i < route.length; i++) len += Math.hypot(route[i].x - route[i - 1].x, route[i].z - route[i - 1].z) || 1;
  return Math.ceil(len / speed);
}
