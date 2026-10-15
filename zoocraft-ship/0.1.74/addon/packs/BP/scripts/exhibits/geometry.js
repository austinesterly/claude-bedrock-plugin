// Habitat validation for walking animals (spec section 6). Pure: blocks come from `read(x, y, z)`,
// which returns a category from data/blocks.js ("air", "solid", "barrier", "gate_open", "water",
// "lava") or "unloaded". The game wraps it in system.runJob; tests feed it a grid.
//
// A bounded flood fill walks the cells an animal could stand in, starting from the seed (the
// block above the ground the Habitat Marker touched). Animals step up one block, drop up to
// `maxDrop`, swim across water, and can't pass barriers (fences, walls, closed gates) or lava.
// Lava Rays (opts.swimLava) swim in lava the way other animals swim in water: lava cells count.
// If the fill reaches the 64 x 64 x 32 limit, the exhibit is not enclosed. Only reachable cells
// count, so an inaccessible pocket adds nothing (AC-01).
// Flyers (Void Rays, floodAerial below) are measured by a flood through the air instead.

const passable = (c) => c === "air" || c === "gate_open";
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const DIRS6 = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

export const key = (x, y, z) => `${x},${y},${z}`;

export function newResult(seed) {
  return {
    seed,
    done: false,
    enclosed: false,
    escape: undefined, // { x, y, z } where the fill left the limit box
    unloaded: false,
    cells: new Map(), // key -> "land" | "water" | "lava" (flight: "land" | "air" | "perch")
    usableArea: 0, // land cells with enough headroom
    landCells: 0,
    waterCells: 0,
    deepWaterCells: 0, // water cells with more water below (deep enough to dive)
    lavaCells: 0, // lava surface cells (only when opts.swimLava)
    deepLavaCells: 0, // lava cells with more lava below
    lowCeilingCells: 0,
    coveredCells: 0, // usable land cells under trees or a roof (only counted when opts.coverHeight)
    mudCells: 0, // usable land cells standing on mud (only counted when opts.countMud)
    shoreMudCells: 0, // usable land cells on mud right beside the water: flamingo nest sites (only counted when opts.countShore)
    shoreMud: [], // where the first 64 of them are, [x, y, z]
    hotCells: 0, // usable land cells standing on a magma block (only counted when opts.countHot)
    ashCells: 0, // usable land cells standing on Warm Ash (only counted when opts.countAsh)
    endCells: 0, // usable land cells standing on end stone (only counted when opts.countEnd)
    grassCells: 0, // usable land cells standing on a grass block, the grass to graze (only counted when opts.countGrass)
    flightCells: 0, // flight only: air cells above the floor, the room to glide in (perch cells included)
    perchCells: 0, // flight only: air cells directly over a Void Perch
    openGates: [], // positions of open gates / doors on the boundary
    hazards: 0, // lava edges (unless swimLava) and deep drops seen
    bbox: undefined, // { min: {x,y,z}, max: {x,y,z} }
    error: undefined,
  };
}

/**
 * @param {(x: number, y: number, z: number) => string} source block categories; "leaves", "mud", "hot", "ash", "end" and "grass" are optional
 * @param {{x: number, y: number, z: number}} seed
 * @param {{ halfWidth: number, halfHeight: number, maxDrop: number, minHeight: number, cellsPerYield: number, coverHeight?: number, countMud?: boolean, countShore?: boolean, countHot?: boolean, countAsh?: boolean, countEnd?: boolean, countGrass?: boolean, swimLava?: boolean }} opts
 *   coverHeight: how far above the animals' headroom to look for cover (leaves or a roof); 0 or
 *   unset skips the cover count. countMud: count usable cells standing on mud (a mud wallow).
 *   countHot: count usable cells standing on a magma block (basking pads). countAsh: count usable
 *   cells standing on Warm Ash (an ash bed). countEnd: count usable cells standing on end stone
 *   (End ground). countShore: count the usable cells on mud right beside the water, the flamingos'
 *   nest sites (the reader must report "mud"). countGrass: count the usable cells standing on a grass
 *   block, the grass grazers graze (the reader must report "grass"). swimLava: lava is swimmable (Lava
 *   Rays), not a hazard
 * @param {ReturnType<typeof newResult>} out
 */
export function* floodTerrestrial(source, seed, opts, out) {
  // Tree leaves ("leaves", when the reader reports them) are solid for walking and floors, but an
  // animal can stand under a canopy: summarize lets them through the headroom and counts them as cover.
  // Mud, magma, ash, end stone and grass ("mud", "hot", "ash", "end" and "grass", when asked for) are
  // ordinary solid ground except for their counts.
  const read = (x, y, z) => {
    const c = source(x, y, z);
    return c === "leaves" || c === "mud" || c === "hot" || c === "ash" || c === "end" || c === "perch" || c === "grass" ? "solid" : c;
  };
  const swim = (c) => swimmable(c, opts);
  const stop = (why) => {
    out.error = why;
    out.done = true;
  };

  const cellAt = (x, y, z) => {
    const feet = read(x, y, z);
    if (feet === "unloaded") throw new Unloaded();
    if (feet === "water") return "water";
    if (feet === "lava" && opts.swimLava) return "lava";
    if (!passable(feet)) return undefined;
    const head = read(x, y + 1, z);
    if (!(passable(head) || swim(head))) return undefined;
    const below = read(x, y - 1, z);
    if (below === "unloaded") throw new Unloaded();
    return below === "solid" ? "land" : undefined;
  };

  // Where an animal standing at (x, y, z) ends up when it moves to column (nx, nz), or undefined.
  const step = (x, y, z, nx, nz) => {
    for (const dy of [0, 1]) {
      const c = read(nx, y + dy, nz);
      if (c === "unloaded") throw new Unloaded();
      if (c === "barrier") return undefined;
      if (c === "lava" && !opts.swimLava) {
        out.hazards++;
        return undefined;
      }
      if (c === "gate_open") {
        const g = { x: nx, y: y + dy, z: nz };
        if (!out.openGates.some((o) => o.x === g.x && o.y === g.y && o.z === g.z)) out.openGates.push(g);
      }
    }
    const f0 = read(nx, y, nz);
    if (f0 === "solid") {
      // Step up one block, if there is headroom above the animal for the hop.
      const kind = cellAt(nx, y + 1, nz);
      const hop = read(x, y + 2, z);
      return kind && (passable(hop) || swim(hop)) ? { y: y + 1, kind } : undefined;
    }
    for (let yy = y; yy >= y - opts.maxDrop; yy--) {
      const kind = cellAt(nx, yy, nz);
      if (kind) return { y: yy, kind };
      const c = read(nx, yy, nz);
      if (!passable(c)) return undefined; // landed on something that isn't a floor
    }
    out.hazards++; // a drop deeper than maxDrop
    return undefined;
  };

  try {
    let start = cellAt(seed.x, seed.y, seed.z);
    if (!start) {
      stop("The marked spot isn't open ground. Use the marker on the floor inside the exhibit.");
      return out;
    }
    const queue = [[seed.x, seed.y, seed.z]];
    out.cells.set(key(seed.x, seed.y, seed.z), start);
    let head = 0;
    let work = 0;
    while (head < queue.length) {
      const [x, y, z] = queue[head++];
      for (const [dx, dz] of DIRS) {
        const nx = x + dx;
        const nz = z + dz;
        const to = step(x, y, z, nx, nz);
        if (!to) continue;
        const k = key(nx, to.y, nz);
        if (out.cells.has(k)) continue;
        if (Math.abs(nx - seed.x) > opts.halfWidth || Math.abs(nz - seed.z) > opts.halfWidth || Math.abs(to.y - seed.y) > opts.halfHeight) {
          out.escape = { x: nx, y: to.y, z: nz };
          out.done = true;
          out.enclosed = false;
          summarize(source, opts, out);
          return out;
        }
        out.cells.set(k, to.kind);
        queue.push([nx, to.y, nz]);
      }
      if (++work % opts.cellsPerYield === 0) yield;
    }
    out.enclosed = out.openGates.length === 0;
    summarize(source, opts, out);
    out.done = true;
    return out;
  } catch (error) {
    if (error instanceof Unloaded) {
      out.unloaded = true;
      stop("Part of the exhibit isn't loaded. Stand closer and try again.");
      return out;
    }
    throw error;
  }
}

class Unloaded extends Error {}

// Liquids an animal can swim in (feet or head): water, and lava for Lava Rays.
function swimmable(c, opts) {
  return c === "water" || (Boolean(opts.swimLava) && c === "lava");
}

// A floor cell right beside the water: a water cell next to it, level with its feet or a block lower
// (a pool dug into the floor). Flamingos nest there, on mud.
function besideWater(cells, x, y, z) {
  return DIRS.some(([dx, dz]) => cells.get(key(x + dx, y, z + dz)) === "water" || cells.get(key(x + dx, y - 1, z + dz)) === "water");
}

function summarize(read, opts, out) {
  /** @type {any} */
  let min;
  /** @type {any} */
  let max;
  for (const [k, kind] of out.cells) {
    const [x, y, z] = k.split(",").map(Number);
    if (!min) {
      min = { x, y, z };
      max = { x, y, z };
    } else {
      min = { x: Math.min(min.x, x), y: Math.min(min.y, y), z: Math.min(min.z, z) };
      max = { x: Math.max(max.x, x), y: Math.max(max.y, y), z: Math.max(max.z, z) };
    }
    if (kind === "water") {
      out.waterCells++;
      if (read(x, y - 1, z) === "water") out.deepWaterCells++;
      continue;
    }
    if (kind === "lava") {
      out.lavaCells++;
      if (read(x, y - 1, z) === "lava") out.deepLavaCells++;
      continue;
    }
    out.landCells++;
    let clear = true;
    for (let h = 2; h < opts.minHeight; h++) {
      const c = read(x, y + h, z);
      if (!(passable(c) || swimmable(c, opts) || c === "unloaded" || c === "leaves")) {
        clear = false;
        break;
      }
    }
    if (clear) {
      out.usableArea++;
      if (opts.coverHeight && covered(read, x, y, z, opts)) out.coveredCells++;
      if (opts.countMud && read(x, y - 1, z) === "mud") out.mudCells++;
      if (opts.countShore && read(x, y - 1, z) === "mud" && besideWater(out.cells, x, y, z)) {
        out.shoreMudCells++;
        if (out.shoreMud.length < 64) out.shoreMud.push([x, y, z]);
      }
      if (opts.countHot && read(x, y - 1, z) === "hot") out.hotCells++;
      if (opts.countAsh && read(x, y - 1, z) === "ash") out.ashCells++;
      if (opts.countEnd && read(x, y - 1, z) === "end") out.endCells++;
      if (opts.countGrass && read(x, y - 1, z) === "grass") out.grassCells++;
    } else out.lowCeilingCells++;
  }
  out.bbox = min ? { min, max } : undefined;
}

// Quiet cover (deer, spec section 5.2): a canopy or roof above the animal's head, up to coverHeight
// blocks above the headroom. A natural tree's canopy usually hangs inside the headroom, so leaves
// count from just above the head; a roof (anything else solid) only above the headroom, since a lower
// one already makes the cell unusable. Fences and walls don't count.
function covered(read, x, y, z, opts) {
  for (let h = 2; h < opts.minHeight + opts.coverHeight; h++) {
    const c = read(x, y + h, z);
    if (c === "solid" || c === "leaves" || c === "mud" || c === "hot" || c === "ash" || c === "end" || c === "perch" || c === "grass") return true;
    if (c === "unloaded") return false;
  }
  return false;
}

/**
 * Flight room for flying animals (Void Rays, spec 5.4): a flood through the air from the seed, six
 * ways, through every block an animal can fly through (air and open gates). Each block reached is a
 * cell: "land" when the block under it is floor (the animals can land there), "perch" when it is a
 * Void Perch (the reader must be asked for "perch"), else "air". Water and lava are not flown
 * through. The flood leaving the limit box is an escape, so an open top is not enclosed: a flying
 * animal needs a roof. usableArea is the floor with `minHeight` blocks of air above it (the room the
 * animals need); the rest of the floor is lowCeilingCells. endCells, when asked for, counts the
 * usable floor on end stone. Open gates are recorded and flown through, like the walking flood.
 * @param {(x: number, y: number, z: number) => string} source block categories
 * @param {{x: number, y: number, z: number}} seed the air block above the floor the marker touched
 * @param {{ halfWidth: number, halfHeight: number, minHeight: number, cellsPerYield: number, countEnd?: boolean }} opts
 * @param {ReturnType<typeof newResult>} out
 */
export function* floodAerial(source, seed, opts, out) {
  const read = (x, y, z) => {
    const c = source(x, y, z);
    if (c === "unloaded") throw new Unloaded();
    return c;
  };
  const stop = (why) => {
    out.error = why;
    out.done = true;
  };
  // What the air at (x, y, z) is over.
  const kindAt = (x, y, z) => {
    const below = read(x, y - 1, z);
    if (below === "perch") return "perch";
    if (passable(below) || below === "water" || below === "lava") return "air";
    return "land";
  };
  try {
    if (!passable(read(seed.x, seed.y, seed.z))) {
      stop("The marked spot isn't open ground. Use the marker on the floor inside the exhibit.");
      return out;
    }
    const queue = [[seed.x, seed.y, seed.z]];
    out.cells.set(key(seed.x, seed.y, seed.z), kindAt(seed.x, seed.y, seed.z));
    let head = 0;
    let work = 0;
    while (head < queue.length) {
      const [x, y, z] = queue[head++];
      for (const [dx, dy, dz] of DIRS6) {
        const nx = x + dx;
        const ny = y + dy;
        const nz = z + dz;
        const k = key(nx, ny, nz);
        if (out.cells.has(k)) continue;
        const c = read(nx, ny, nz);
        if (!passable(c)) continue;
        if (c === "gate_open") {
          const g = { x: nx, y: ny, z: nz };
          if (!out.openGates.some((o) => o.x === g.x && o.y === g.y && o.z === g.z)) out.openGates.push(g);
        }
        if (Math.abs(nx - seed.x) > opts.halfWidth || Math.abs(nz - seed.z) > opts.halfWidth || Math.abs(ny - seed.y) > opts.halfHeight) {
          out.escape = { x: nx, y: ny, z: nz };
          out.done = true;
          out.enclosed = false;
          summarizeAerial(source, opts, out);
          return out;
        }
        out.cells.set(k, kindAt(nx, ny, nz));
        queue.push([nx, ny, nz]);
      }
      if (++work % opts.cellsPerYield === 0) yield;
    }
    out.enclosed = out.openGates.length === 0;
    summarizeAerial(source, opts, out);
    out.done = true;
    return out;
  } catch (error) {
    if (error instanceof Unloaded) {
      out.unloaded = true;
      stop("Part of the exhibit isn't loaded. Stand closer and try again.");
      return out;
    }
    throw error;
  }
}

function summarizeAerial(read, opts, out) {
  /** @type {any} */
  let min;
  /** @type {any} */
  let max;
  for (const [k, kind] of out.cells) {
    const [x, y, z] = k.split(",").map(Number);
    if (!min) {
      min = { x, y, z };
      max = { x, y, z };
    } else {
      min = { x: Math.min(min.x, x), y: Math.min(min.y, y), z: Math.min(min.z, z) };
      max = { x: Math.max(max.x, x), y: Math.max(max.y, y), z: Math.max(max.z, z) };
    }
    if (kind !== "land") {
      out.flightCells++;
      if (kind === "perch") out.perchCells++;
      continue;
    }
    out.landCells++;
    let clear = true;
    for (let h = 1; h < opts.minHeight; h++) {
      const above = out.cells.get(key(x, y + h, z));
      if (above !== "air" && above !== "perch") {
        clear = false;
        break;
      }
    }
    if (clear) {
      out.usableArea++;
      if (opts.countEnd && read(x, y - 1, z) === "end") out.endCells++;
    } else out.lowCeilingCells++;
  }
  out.bbox = min ? { min, max } : undefined;
}

// --- climbing (raccoons, 0.1.71; spec 6: "climbing species need their own validator") ---
// What a climber makes of each block category from a climb reader (blockReader with climb: true):
// it can be in air, an open gate, water or leaves (it pushes through foliage); it grips the side of
// anything solid but glass (stone, planks, logs, leaves, fences, walls, bars, closed gates); and it
// stands on anything solid, glass too. It can't hang under a ceiling.
export const climbOpen = (c) => c === "air" || c === "gate_open" || c === "water" || c === "leaves";
export const climbGrips = (c) => !(c === "air" || c === "gate_open" || c === "water" || c === "glass" || c === "pane" || c === "lava" || c === "unloaded");
export const climbFloor = (c) => climbGrips(c) || c === "glass" || c === "pane";

export function newClimbResult() {
  return {
    done: false,
    proof: undefined, // true: nothing gets out by climbing; false: see escape, via and path
    escape: undefined, // { x, y, z }: the first block outside the exhibit a climber reaches
    via: undefined, // { x, y, z, leaves, hedge }: where it gets over (the top of the wall, a tree's branches over it, or a hedge)
    path: undefined, // [{ x, y, z }]: the way out, from the floor to the escape
    reached: 0, // blocks a climber reaches beyond the walking ones (up walls and trunks, onto rocks)
    trees: 0, // climbing trees: trunks 3 or more logs high standing beside the floor (a 2 x 2 trunk is one)
  };
}

// Columns of 3 or more logs whose bottom log stands beside a walking floor cell, grouped into trees
// (touching columns, a 2 x 2 trunk say, are one tree).
function countTrees(cols) {
  const left = new Set(cols);
  let trees = 0;
  for (const start of cols) {
    if (!left.has(start)) continue;
    trees++;
    const stack = [start];
    left.delete(start);
    while (stack.length) {
      const [x, z] = stack.pop().split(",").map(Number);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const k = `${x + dx},${z + dz}`;
          if (left.has(k)) {
            left.delete(k);
            stack.push(k);
          }
        }
      }
    }
  }
  return trees;
}

/**
 * Can a climber get out? (Raccoons, 0.1.71.) A flood from every land and water cell the walking
 * measurement reached (`walk`, key -> kind), through what a climber can do on top of walking: cling
 * to the side of anything but glass and climb up or down it, push through leaves, step over the top
 * of what it was holding, and drop off an edge to the first place it can stand, swim or hold on. A
 * roof, or an overhang sticking inward along the top of the wall, stops it (it can't hang under a
 * ceiling), and so do glass walls and glass panes (nothing to grip).
 * The exhibit's footprint is the walking columns, the columns they ring (rocks, trunks, an island) and
 * one more all round (the walls, and anything on top of them); a climber that reaches a column
 * outside it has climbed out. It also counts the climbing trees (out.trees). `opts.rise`: how far
 * above the highest walking cell (and below the lowest) to follow a climber.
 * @param {(x: number, y: number, z: number) => string} source climb reader categories
 * @param {Map<string, string>} walk the walking measurement's cells
 * @param {{ rise: number, cellsPerYield: number }} opts
 * @param {ReturnType<typeof newClimbResult>} out
 */
export function* floodClimb(source, walk, opts, out) {
  const memo = new Map();
  const read = (x, y, z) => {
    const k = key(x, y, z);
    let c = memo.get(k);
    if (c === undefined) {
      c = source(x, y, z);
      memo.set(k, c);
    }
    return c;
  };
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, minY = Infinity, maxY = -Infinity;
  const cols = new Set();
  const starts = [];
  for (const [k, kind] of walk) {
    const [x, y, z] = k.split(",").map(Number);
    cols.add(`${x},${z}`);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    if (kind === "land" || kind === "water") starts.push(k);
  }
  if (!starts.length) {
    out.proof = true;
    out.done = true;
    return out;
  }
  let work = 0;
  // Climbing trees: three logs up from beside a land cell.
  const trunks = new Set();
  for (const k of starts) {
    if (walk.get(k) !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dz] of DIRS) {
      if (read(x + dx, y, z + dz) === "log" && read(x + dx, y + 1, z + dz) === "log" && read(x + dx, y + 2, z + dz) === "log") trunks.add(`${x + dx},${z + dz}`);
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  out.trees = countTrees(trunks);
  // Columns a 2D flood from outside the box can't reach without crossing a walking column are inside.
  const ox = minX - 2, oz = minZ - 2, w = maxX - minX + 5, d = maxZ - minZ + 5;
  const outside = new Uint8Array(w * d);
  const q2 = [];
  const mark = (i, j) => {
    if (i < 0 || j < 0 || i >= w || j >= d || outside[i + j * w] || cols.has(`${i + ox},${j + oz}`)) return;
    outside[i + j * w] = 1;
    q2.push(i + j * w);
  };
  for (let i = 0; i < w; i++) {
    mark(i, 0);
    mark(i, d - 1);
  }
  for (let j = 0; j < d; j++) {
    mark(0, j);
    mark(w - 1, j);
  }
  for (let h = 0; h < q2.length; h++) {
    const i = q2[h] % w, j = (q2[h] - i) / w;
    mark(i + 1, j);
    mark(i - 1, j);
    mark(i, j + 1);
    mark(i, j - 1);
  }
  const inner = (x, z) => {
    const i = x - ox, j = z - oz;
    return i >= 0 && j >= 0 && i < w && j < d && !outside[i + j * w];
  };
  const footprint = (x, z) => {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (inner(x + dx, z + dz)) return true;
    return false;
  };

  const top = maxY + opts.rise;
  const bottom = minY - opts.rise;
  const grips = (x, y, z) => DIRS.some(([dx, dz]) => climbGrips(read(x + dx, y, z + dz)));
  const held = (x, y, z) => read(x, y, z) === "water" || climbFloor(read(x, y - 1, z)) || grips(x, y, z);
  const from = new Map(); // key -> the key it was reached from ("" for a walking cell)
  const queue = [];
  for (const k of starts) {
    from.set(k, "");
    queue.push(k);
  }
  /** @type {string | undefined} */
  let found;
  const add = (x, y, z, parent) => {
    if (y > top || y < bottom) return false;
    const k = key(x, y, z);
    if (from.has(k)) return false;
    from.set(k, parent);
    out.reached++;
    if (!footprint(x, z)) {
      found = k;
      return true;
    }
    queue.push(k);
    return false;
  };
  // Dropping from (x, y, z) down to the first place it can stand, swim or hold on.
  const drop = (x, y, z, parent) => {
    for (let yy = y; yy >= bottom; yy--) {
      if (!climbOpen(read(x, yy, z))) return false; // lava, or outside the loaded world
      if (held(x, yy, z)) return add(x, yy, z, parent);
    }
    return false;
  };
  let head = 0;
  while (head < queue.length && !found) {
    const k = queue[head++];
    const [x, y, z] = k.split(",").map(Number);
    // Across: to an open neighbour, dropping if there is nothing there to stand on or hold.
    for (const [dx, dz] of DIRS) {
      if (climbOpen(read(x + dx, y, z + dz)) && drop(x + dx, y, z + dz, k)) break;
    }
    // Up, holding on to the side of something; at the top, over onto whatever it was holding.
    if (!found && grips(x, y, z) && climbOpen(read(x, y + 1, z))) {
      if (held(x, y + 1, z)) add(x, y + 1, z, k);
      else for (const [dx, dz] of DIRS) if (climbOpen(read(x + dx, y + 1, z + dz)) && held(x + dx, y + 1, z + dz) && add(x + dx, y + 1, z + dz, k)) break;
    }
    // Down: climbing down, or dropping.
    if (!found && climbOpen(read(x, y - 1, z))) drop(x, y - 1, z, k);
    if (++work % opts.cellsPerYield === 0) yield;
  }
  if (found) {
    const path = [];
    for (let k = found; k; k = from.get(k)) {
      const [x, y, z] = k.split(",").map(Number);
      path.unshift({ x, y, z });
    }
    out.proof = false;
    out.path = path;
    out.escape = path[path.length - 1];
    // Where it gets over: the first step off the inside columns (the top of the wall, or the
    // branches reaching over it). Leaves there with a wall under them (glass and fences too) are a
    // tree's branches; leaves down to the floor are a hedge, the wall itself.
    const over = path.find((p) => !inner(p.x, p.z)) ?? out.escape;
    const leafy = read(over.x, over.y, over.z) === "leaves";
    let wall = false;
    for (let y = over.y - 1; leafy && !wall && y >= minY; y--) wall = !climbOpen(read(over.x, y, over.z));
    out.via = { x: over.x, y: over.y, z: over.z, leaves: leafy && wall, hedge: leafy && !wall };
  } else out.proof = true;
  out.done = true;
  return out;
}

// Is a block at `pos` (a feeder, say) reachable from a land cell? It must sit beside a land cell
// at the animal's feet or one below, so a feeder behind a wall counts for nothing (AC-03).
// A Thermal Feeder is reached from the lava instead (kind "lava"). A Hay Rack (0.1.74) hangs a block
// above the floor beside it or stands on it: `dys` [-1, 0] (the floor a block below it, or level).
export function isReachable(cells, pos, kind = "land", dys = [0, 1]) {
  for (const [dx, dz] of DIRS) {
    for (const dy of dys) {
      if (cells.get(key(pos.x + dx, pos.y + dy, pos.z + dz)) === kind) return true;
    }
  }
  return false;
}
