// Since 0.1.133 the abyss is made with the world (BP features/trench_*, the same shape worked out in Molang) and
// nothing calls these; they stay as the 0.1.132 design the features follow.
// The Deep Trench's abyss (0.1.132, research/trench_plan.md "0.1.132"), pure. Austin, 2026-10-28: "The depth is the
// most important thing." So world/trench.js digs the whole biome out: each column down to abyssBottom, about y -40 (some
// 100 blocks of water), dropping at a ragged cliff where the biome meets the ocean round it, with the trench lines of
// trenchRules.js cut deeper as canyons. Then chunkOps puts life on the new floor: clusters of rock spires (dark, or
// pale calcite flecked with amethyst), coral reefs and canopies, kelp and sea grass, and down in the dark sea lanterns
// set in the rock, sea pickles and glow lichen. Every choice is a hash of the column's x and z and each column is built
// up from its own floor only, so the same world always gets the same abyss and chunks done in any order meet without a
// seam. Every number is BALANCE.trench.
import { hash, noise, trenchBottom, naturalFloor, CARVED } from "./trenchRules.js";

const lerp = ([a, b], t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);

/**
 * The 4 by 4 biome cells outside the biome that a column of chunk (cx, cz) could be nearest to, in the chunk and the
 * chunks round it (every cell nearer than 16 blocks to the chunk is in them): those next to a cell in the biome (the
 * nearest cell outside always is), as [x, z, x, z, ...] of their corners. inBiome(i, j) says whether cell (i, j), x 4i
 * to 4i + 3 and z 4j to 4j + 3, is in the biome.
 * @param {(i: number, j: number) => boolean} inBiome
 * @returns {number[]}
 */
export function outsideCells(cx, cz, inBiome) {
  const out = [];
  for (let i = cx * 4 - 4; i < cx * 4 + 8; i++) {
    for (let j = cz * 4 - 4; j < cz * 4 + 8; j++) {
      if (inBiome(i, j)) continue;
      let next = false;
      for (let a = -1; a <= 1 && !next; a++) for (let b = -1; b <= 1 && !next; b++) next = (a || b) && i + a >= cx * 4 - 4 && i + a < cx * 4 + 8 && j + b >= cz * 4 - 4 && j + b < cz * 4 + 8 && inBiome(i + a, j + b);
      if (next) out.push(i * 4, j * 4);
    }
  }
  return out;
}

/** How far column (x, z) is from the nearest of the cells outside (from outsideCells), up to `max` blocks. */
export function edgeDistance(x, z, outside, max) {
  const px = x + 0.5;
  const pz = z + 0.5;
  let best = max * max;
  for (let k = 0; k < outside.length; k += 2) {
    const ex = Math.max(outside[k] - px, 0, px - outside[k] - 4);
    const ez = Math.max(outside[k + 1] - pz, 0, pz - outside[k + 1] - 4);
    const d2 = ex * ex + ez * ez;
    if (d2 < best) best = d2;
  }
  return Math.sqrt(best);
}

/**
 * How far each column of chunk (cx, cz) is from the biome's edge, up to `max` blocks (at most 16): 256 numbers, index
 * dx * 16 + dz, -1 for a column outside the biome.
 * @param {(i: number, j: number) => boolean} inBiome
 * @returns {number[]}
 */
export function edgeDistances(cx, cz, inBiome, max) {
  const outside = outsideCells(cx, cz, inBiome);
  const out = [];
  for (let idx = 0; idx < 256; idx++) {
    const x = cx * 16 + (idx >> 4);
    const z = cz * 16 + (idx & 15);
    out.push(inBiome(x >> 2, z >> 2) ? edgeDistance(x, z, outside, max) : -1);
  }
  return out;
}

/**
 * The abyss's bottom at column (x, z), `edge` blocks from the biome's edge: the lowest y the column is dug to (a column
 * whose floor is already at or under it is left as it is). The abyss floor, or a canyon's bottom where one is deeper;
 * within `rim` blocks of the edge it rises toward rimTop (above the sea floor, so nothing is dug right at the edge),
 * smoothly and in `ledges` steps that wander in and out, the edge bent by up to rimJag blocks so the cliff isn't
 * straight, and its face rough by up to `crag` blocks.
 * @returns {number}
 */
export function abyssBottom(x, z, edge, T) {
  const floor = T.abyss + T.abyssVary * noise(x, z, T.abyssScale, 21) + T.rough * noise(x, z, T.roughScale, 22);
  const canyon = trenchBottom(x, z, T);
  const deep = canyon === undefined ? floor : Math.min(floor, canyon);
  const bent = edge - (T.rimJag * (noise(x, z, T.rimJagScale, 31) + 1)) / 2;
  const t = Math.max(0, Math.min(1, bent / (T.rim - T.rimJag)));
  if (t >= 1) return Math.round(deep);
  const step = Math.min(1, Math.floor(t * T.ledges + (noise(x, z, T.ledgeScale, 32) + 1) / 2) / T.ledges);
  const p = 0.55 * smooth(t) + 0.45 * step;
  const face = T.crag * noise(x, z, T.cragScale, 33) * Math.sin(Math.PI * t);
  return Math.round(T.rimTop + (deep - T.rimTop) * p + face);
}

// What the life is made of.
const AMETHYST = "minecraft:amethyst_block";
const CALCITE = "minecraft:calcite";
const LANTERN = "minecraft:sea_lantern";
const DARK = [
  ["minecraft:deepslate", "minecraft:cobbled_deepslate"],
  ["minecraft:tuff", "minecraft:deepslate"],
  ["minecraft:deepslate", "minecraft:smooth_basalt"],
  ["minecraft:cobbled_deepslate", "minecraft:tuff"],
];
const PALE = [CALCITE, CALCITE];
// Coral colours: fire red, brain pink, horn yellow, tube blue, bubble purple; a reef is mostly its first colour.
export const REEF_COLOURS = [["fire", "brain"], ["fire", "brain"], ["brain", "fire"], ["brain", "bubble"], ["fire", "horn"], ["tube", "bubble"], ["horn", "brain"]];

// What life may go into: water and the sea plants already there ("open"); what a lantern or a vein may be set into:
// the natural rock and sand of the sea floor and under it ("ground", none of the plants or loose bits).
export const OPEN = ["minecraft:water", "minecraft:flowing_water", "minecraft:seagrass", "minecraft:kelp", "minecraft:sea_pickle"];
const NOT_SET_IN = new Set(["minecraft:kelp", "minecraft:seagrass", "minecraft:sea_pickle", "minecraft:glow_lichen", "minecraft:pointed_dripstone", "minecraft:sculk_vein", "minecraft:amethyst_cluster", "minecraft:large_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:small_amethyst_bud"]);
export const GROUND = CARVED.filter((t) => naturalFloor(t) && !NOT_SET_IN.has(t));
const GROUND_SET = new Set(GROUND);

/**
 * One op: blocks y0..y1 of column (x, z) become `block` (with `states`), only where they are `into` ("open" or "ground");
 * a waterlogged one is a single block given water after it's put down (sea pickles and glow lichen glow only so).
 */
const op = (x, z, y0, y1, block, into = "open", states = undefined, waterlog = false) => ({ x, z, y0, y1, block, into, states, waterlog });

/**
 * The spire cluster in spire cell (i, j), or null: up to `max` spires round a middle at least `margin` in from the
 * cell's sides, each { x, z, r, h, rocks: [lower, upper], band (where the upper rock starts, a share of h), pale, salt }.
 * The margin keeps every spire inside its cell, so a column only looks at its own cell's.
 */
export function spireCluster(i, j, T) {
  const P = T.spire;
  if (hash(i, j, 41) >= P.chance) return null;
  const span = P.cell - 2 * P.margin;
  const mx = i * P.cell + P.margin + span * hash(i, j, 42);
  const mz = j * P.cell + P.margin + span * hash(i, j, 43);
  const n = P.min + Math.floor((P.max - P.min + 1) * hash(i, j, 44));
  const spires = [];
  for (let k = 0; k < n; k++) {
    const h = (salt) => hash(i * 16 + k, j, salt);
    const angle = 2 * Math.PI * h(45);
    const out = k === 0 ? 0 : P.spread * Math.sqrt(h(46));
    const tall = h(47) < P.tallChance;
    const pale = h(50) < P.paleChance;
    spires.push({
      x: mx + out * Math.cos(angle),
      z: mz + out * Math.sin(angle),
      r: lerp(P.radius, h(49)) * (tall ? 1.25 : 1),
      h: lerp(tall ? P.tall : P.height, h(48)),
      rocks: pale ? PALE : DARK[Math.floor(DARK.length * h(51))],
      band: 0.3 + 0.4 * h(52),
      pale,
      salt: 100 + 7 * k,
    });
  }
  return spires;
}

/**
 * The tallest spire over column (x, z): { rel (how far it rises above the column's floor), spire, q (1 at its middle,
 * 0 at its edge) }, or null. Each column's edge is pushed in or out a little (ragged sides) and its height jagged by up
 * to `jag`. cache: a Map of the clusters worked out already (optional).
 */
export function spireAt(x, z, T, cache = undefined) {
  const P = T.spire;
  const i = Math.floor(x / P.cell);
  const j = Math.floor(z / P.cell);
  const ck = `${i},${j}`;
  let spires = cache?.get(ck);
  if (spires === undefined) {
    spires = spireCluster(i, j, T);
    cache?.set(ck, spires);
  }
  if (!spires) return null;
  let best = null;
  for (const s of spires) {
    const reach = s.r * (0.75 + 0.5 * hash(x, z, s.salt));
    const d = Math.hypot(x + 0.5 - s.x, z + 0.5 - s.z);
    if (d >= reach) continue;
    const q = 1 - d / reach;
    const rel = Math.round(s.h * Math.pow(q, P.shape) + P.jag * (2 * hash(x, z, s.salt + 1) - 1));
    if (rel >= 2 && (!best || rel > best.rel)) best = { rel, spire: s, q };
  }
  return best;
}

// A spire's column over a floor at floorY: its lower rock up to the band, its upper rock above, never above `cap`; an
// amethyst fleck in some columns and a sea lantern in a few of its outer ones (where the sides show).
function spireOps(x, z, floorY, at, T) {
  const P = T.spire;
  const s = at.spire;
  const top = Math.min(floorY + at.rel, P.cap);
  if (top <= floorY) return [];
  const n = top - floorY;
  const bandY = floorY + 1 + Math.round(s.band * s.h);
  const fleckY = hash(x, z, s.salt + 2) < (s.pale ? P.paleFleck : P.fleck) ? floorY + 1 + Math.floor(n * hash(x, z, s.salt + 3)) : undefined;
  const lanternY = at.q < 0.5 && hash(x, z, s.salt + 4) < P.lantern ? floorY + 1 + Math.floor(n * hash(x, z, s.salt + 5)) : undefined;
  const blockAt = (y) => (y === lanternY ? LANTERN : y === fleckY ? AMETHYST : y < bandY ? s.rocks[0] : s.rocks[1]);
  const ops = [];
  let start = floorY + 1;
  let cur = blockAt(start);
  for (let y = start + 1; y <= top + 1; y++) {
    const b = y <= top ? blockAt(y) : undefined;
    if (b === cur) continue;
    ops.push(op(x, z, start, y - 1, cur));
    start = y;
    cur = b;
  }
  return ops;
}

/** The reef in reef cell (i, j), or null: { x, z, r, h, canopy, colours }, at least `margin` in from the cell's sides. */
export function reefIn(i, j, T) {
  const R = T.reef;
  if (hash(i, j, 61) >= R.chance) return null;
  const span = R.cell - 2 * R.margin;
  const r = lerp(R.radius, hash(i, j, 64));
  return {
    x: i * R.cell + R.margin + span * hash(i, j, 62),
    z: j * R.cell + R.margin + span * hash(i, j, 63),
    r,
    h: Math.round(lerp(R.height, hash(i, j, 65))),
    canopy: r >= R.canopyMin && hash(i, j, 66) < R.canopyChance,
    colours: REEF_COLOURS[Math.floor(REEF_COLOURS.length * hash(i, j, 67))],
  };
}

// A reef's column over a floor at floorY, or null off the reef: a mound of coral blocks highest in the middle, or a
// canopy (a trunk in the middle under a cap that droops to its edge, a fan sometimes in its shade); a coral fan on top
// of some columns.
function reefOps(x, z, floorY, T, cache) {
  const R = T.reef;
  const ck = `r${Math.floor(x / R.cell)},${Math.floor(z / R.cell)}`;
  let reef = cache?.get(ck);
  if (reef === undefined) {
    reef = reefIn(Math.floor(x / R.cell), Math.floor(z / R.cell), T);
    cache?.set(ck, reef);
  }
  if (!reef) return null;
  const d = Math.hypot(x + 0.5 - reef.x, z + 0.5 - reef.z);
  if (d > reef.r) return null;
  const colour = reef.colours[hash(x, z, 68) < 0.65 ? 0 : 1];
  const block = `minecraft:${colour}_coral_block`;
  const fan = (y) => op(x, z, y, y, `minecraft:${colour}_coral_fan`, "open", { coral_fan_direction: hash(x, z, 70) < 0.5 ? 0 : 1 }, true);
  const u = d / reef.r;
  const ops = [];
  let top;
  if (!reef.canopy) {
    const rel = Math.round(reef.h * (1 - u * u) + hash(x, z, 69));
    if (rel < 1) return null;
    top = floorY + rel;
    ops.push(op(x, z, floorY + 1, top, block));
  } else if (d <= R.trunk) {
    top = floorY + reef.h + 2;
    ops.push(op(x, z, floorY + 1, top, block));
  } else {
    top = floorY + reef.h + 2 - Math.round(R.droop * u * u);
    ops.push(op(x, z, Math.max(floorY + 1, top - (u < 0.7 ? 1 : 0)), top, block));
    if (top > floorY + 2 && hash(x, z, 71) < 0.3) ops.push(fan(floorY + 1));
  }
  if (hash(x, z, 72) < R.topChance) ops.push(fan(top + 1));
  return ops;
}

// The rest of the floor: in the dark at the bottom (a floor at or under `deep`) a sea lantern set in the rock, sea
// pickles or glow lichen on it; kelp where the kelp noise is high, else sea grass, short or tall (both thinner in the
// deep); or nothing.
function lifeOps(x, z, floorY, T) {
  const L = T.life;
  const deep = floorY <= L.deep;
  const r = hash(x, z, 73);
  let c = deep ? L.lantern : 0;
  if (r < c) return [op(x, z, floorY, floorY, LANTERN, "ground")];
  c += deep ? L.pickles : L.picklesHigh;
  if (r < c) return [op(x, z, floorY + 1, floorY + 1, "minecraft:sea_pickle", "open", { cluster_count: Math.floor(4 * hash(x, z, 74)), dead_bit: false }, true)];
  if (deep) {
    c += L.lichen;
    if (r < c) return [op(x, z, floorY + 1, floorY + 1, "minecraft:glow_lichen", "open", { multi_face_direction_bits: 1 }, true)]; // 1: on the face below
  }
  if (noise(x, z, L.kelpScale, 75) > L.kelpEdge && hash(x, z, 76) < (deep ? L.kelpDeep : L.kelpChance)) {
    const top = Math.min(floorY + Math.round(lerp(L.kelp, hash(x, z, 77))), L.kelpTop);
    return top > floorY ? [op(x, z, floorY + 1, top, "minecraft:kelp", "open", { kelp_age: 25 })] : [];
  }
  if (hash(x, z, 78) < (deep ? L.grassDeep : L.grass)) {
    if (hash(x, z, 79) >= L.tallGrass) return [op(x, z, floorY + 1, floorY + 1, "minecraft:seagrass", "open", { sea_grass_type: "default" })];
    return [op(x, z, floorY + 1, floorY + 1, "minecraft:seagrass", "open", { sea_grass_type: "double_bot" }), op(x, z, floorY + 2, floorY + 2, "minecraft:seagrass", "open", { sea_grass_type: "double_top" })];
  }
  return [];
}

const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * What's put on column (x, z)'s new floor once its chunk is dug, as ops. floor: { y, type }, its floor before digging;
 * dug: { lo } when it was dug (its new floor is lo - 1). A column left as it was gets life only on natural ground no
 * higher than maxFloor. A spire (from a floor at or under the spire's maxFloor), else a reef, else the rest of the
 * floor's life. cache: a Map for the spire clusters and reefs worked out already.
 */
export function columnOps(x, z, floor, dug, T, cache) {
  if (!dug && (!GROUND_SET.has(floor.type) || floor.y > T.maxFloor)) return [];
  const floorY = dug ? dug.lo - 1 : floor.y;
  const spire = floorY <= T.spire.maxFloor ? spireAt(x, z, T, cache) : null;
  if (spire) return spireOps(x, z, floorY, spire, T);
  return reefOps(x, z, floorY, T, cache) ?? lifeOps(x, z, floorY, T);
}

/**
 * The amethyst veins (calcite round an amethyst block) set in the walls dug column `idx` of chunk (cx, cz) bares on
 * its four sides, inside the chunk (floors and dug as in chunkOps).
 */
export function veinOps(cx, cz, idx, floors, dug, T) {
  const d = dug.get(idx);
  const ops = [];
  if (d) {
    const dx = idx >> 4;
    const dz = idx & 15;
    for (let s = 0; s < 4; s++) {
      const [sx, sz] = SIDES[s];
      if (dx + sx < 0 || dx + sx > 15 || dz + sz < 0 || dz + sz > 15) continue;
      const side = (dx + sx) * 16 + dz + sz;
      const sd = dug.get(side);
      const sf = floors.get(side);
      const top = sd ? sd.lo - 1 : sf && GROUND_SET.has(sf.type) ? sf.y : undefined; // the top of the bared wall
      if (top === undefined || top - d.lo + 1 < T.life.veinMin) continue;
      const x = cx * 16 + dx;
      const z = cz * 16 + dz;
      if (hash(x * 4 + s, z, 81) >= T.life.vein) continue;
      const y = d.lo + Math.floor((top - d.lo - 2) * hash(x * 4 + s, z, 82));
      ops.push(op(x + sx, z + sz, y, y, CALCITE, "ground"), op(x + sx, z + sz, y + 1, y + 1, AMETHYST, "ground"), op(x + sx, z + sz, y + 2, y + 2, CALCITE, "ground"));
    }
  }
  return ops;
}

/**
 * Everything put on the new floor of chunk (cx, cz) once it's dug, as ops: each column's (columnOps), then the veins
 * (veinOps). floors: index (dx * 16 + dz) -> { y, type }, the floor of each column in the biome before digging; dug:
 * index -> { lo } for each column dug.
 */
export function chunkOps(cx, cz, floors, dug, T) {
  const ops = [];
  const cache = new Map();
  for (const [idx, f] of floors) ops.push(...columnOps(cx * 16 + (idx >> 4), cz * 16 + (idx & 15), f, dug.get(idx), T, cache));
  for (const idx of dug.keys()) ops.push(...veinOps(cx, cz, idx, floors, dug, T));
  return ops;
}

/** The dug columns (work: { x, z, lo, hi } each) as boxes: runs along x of columns with the same z, lo and hi. */
export function carveBoxes(work) {
  const rows = new Map();
  for (const w of work) {
    const k = `${w.z},${w.lo},${w.hi}`;
    let xs = rows.get(k);
    if (!xs) rows.set(k, (xs = []));
    xs.push(w.x);
  }
  const out = [];
  for (const [k, xs] of rows) {
    const [z, lo, hi] = k.split(",").map(Number);
    xs.sort((a, b) => a - b);
    let x0 = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === xs[i - 1] + 1) continue;
      out.push({ from: { x: x0, y: lo, z }, to: { x: xs[i - 1], y: hi, z } });
      x0 = xs[i];
    }
  }
  return out;
}

/**
 * Seal boxes (each one column, from trenchRules.sealBoxes) merged into fewer: neighbours along x with the same block,
 * y range and z become one box, then those along z with the same block, y range and x span; a box over 32768 blocks
 * (the most one fill takes) is cut into slices of y.
 */
export function mergeBoxes(boxes) {
  const pass = (list, a, b) => {
    const groups = new Map();
    for (const box of list) {
      const k = `${box.block}|${box.from.y}|${box.to.y}|${box.from[b]}|${box.to[b]}`;
      let g = groups.get(k);
      if (!g) groups.set(k, (g = []));
      g.push(box);
    }
    const out = [];
    for (const g of groups.values()) {
      g.sort((p, q) => p.from[a] - q.from[a]);
      let cur = { from: { ...g[0].from }, to: { ...g[0].to }, block: g[0].block };
      for (let i = 1; i < g.length; i++) {
        if (g[i].from[a] <= cur.to[a] + 1) {
          cur.to[a] = Math.max(cur.to[a], g[i].to[a]);
          continue;
        }
        out.push(cur);
        cur = { from: { ...g[i].from }, to: { ...g[i].to }, block: g[i].block };
      }
      out.push(cur);
    }
    return out;
  };
  const out = [];
  for (const box of pass(pass(boxes, "x", "z"), "z", "x")) {
    const area = (box.to.x - box.from.x + 1) * (box.to.z - box.from.z + 1);
    const step = Math.max(1, Math.floor(32768 / area));
    for (let y = box.from.y; y <= box.to.y; y += step) out.push({ from: { ...box.from, y }, to: { ...box.to, y: Math.min(box.to.y, y + step - 1) }, block: box.block });
  }
  return out;
}
