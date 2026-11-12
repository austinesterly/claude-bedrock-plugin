// The fishing dimension's islands (0.1.272): where each one is, what kind it is and its shape, all worked out from the
// world's seed, so a world always has the same sky and every world a different one (Austin, 12 Nov 18:45Z: "we need to
// make sure each seed generates them randomly"). Nothing here touches the game: fishing/islands.js builds what these
// rules describe, a list of blocks at a time. Plan: research/Jack_rods_and_dimension_plan.md.
//
// The sky is cut into cells of LAYOUT.cell blocks. A cell holds one island or (LAYOUT.emptyChance) open sky. Cells go
// in regions of 2 by 2; a region can instead hold one huge island over all four (the ships and submarines, later) or a
// mythic one (the Shark People's town, later), and every world has one mythic region 2,000 to 4,000 blocks from the
// middle. An island's kind: common 55, uncommon 25, rare 12, exotic 7 (Austin's tiers). This version builds the common
// ones only (BUILT); the others stay open sky, untouched, until the version that builds them.
//
// NEVER change LAYOUT or the hashing: islands already built in a world were placed by them.

export const FISHING = "zoocraft:fishing";

export const LAYOUT = Object.freeze({
  cell: 256,
  emptyChance: 0.12,
  kinds: /** @type {ReadonlyArray<[string, number]>} */ (Object.freeze([
    ["common", 55],
    ["uncommon", 25],
    ["rare", 12],
    ["exotic", 7],
  ])),
  hugeChance: 1 / 12,
  mythicChance: 0.01,
  mythicRing: Object.freeze([2000, 4000]),
  radius: Object.freeze([30, 60]),
  hugeRadius: Object.freeze([100, 130]),
  topY: Object.freeze([48, 200]),
  margin: 30,
});

/** The kinds of island this version builds; the rest wait, untouched, for theirs. */
export const BUILT = new Set(["common"]);

/** Most blocks in one list handed to the game at a time. */
export const BATCH = 2048;

// ---- hashing and noise

function mix(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** A 32-bit number from the seed and three whole numbers. */
export function hash(seed, a, b, c) {
  let h = mix((seed ^ 0x9e3779b9) >>> 0);
  h = mix((h ^ (a | 0)) >>> 0);
  h = mix((h + Math.imul(b | 0, 0x85ebca6b)) >>> 0);
  h = mix((h ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0);
  return h;
}

/** 0 (inclusive) to 1 (exclusive) from a hash. */
export const unit = (h) => h / 4294967296;

/** The world's seed (a string in the game) as a 32-bit number. */
export function seedOf(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text ?? "")) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return mix(h >>> 0);
}

/** Smooth value noise, -1 to 1, one lattice step per unit. */
export function noise2(seed, x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = unit(hash(seed, x0, z0, 7)) * 2 - 1;
  const b = unit(hash(seed, x0 + 1, z0, 7)) * 2 - 1;
  const c = unit(hash(seed, x0, z0 + 1, 7)) * 2 - 1;
  const d = unit(hash(seed, x0 + 1, z0 + 1, 7)) * 2 - 1;
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Two octaves of noise2, -1 to 1. */
export function fbm2(seed, x, z) {
  return (noise2(seed, x, z) + 0.5 * noise2((seed + 1013) >>> 0, x * 2, z * 2)) / 1.5;
}

// ---- the layout

function mythicRegion(seed) {
  const a = unit(hash(seed, 0, 0, 101)) * Math.PI * 2;
  const [d0, d1] = LAYOUT.mythicRing;
  const d = d0 + unit(hash(seed, 0, 0, 103)) * (d1 - d0);
  const span = LAYOUT.cell * 2;
  return { rx: Math.floor((Math.cos(a) * d) / span), rz: Math.floor((Math.sin(a) * d) / span) };
}

/** "mythic", "huge" or undefined: what a region of 2 by 2 cells holds if it is one island. */
export function regionKind(seed, rx, rz) {
  const m = mythicRegion(seed);
  if (rx === m.rx && rz === m.rz) return "mythic";
  const u = unit(hash(seed, rx, rz, 107));
  if (u < LAYOUT.mythicChance) return "mythic";
  if (u < LAYOUT.mythicChance + LAYOUT.hugeChance) return "huge";
  return undefined;
}

/** How far an island's blocks can reach from its middle (its edge, the rocks floating round it). */
export function extentOf(isl) {
  return Math.ceil(isl.r * 1.15) + LAYOUT.margin;
}

function kindAt(seed, cx, cz) {
  const total = LAYOUT.kinds.reduce((s, [, w]) => s + w, 0);
  let u = unit(hash(seed, cx, cz, 137)) * total;
  for (const [k, w] of LAYOUT.kinds) {
    if (u < w) return k;
    u -= w;
  }
  return LAYOUT.kinds[0][0];
}

/**
 * The island in cell cx cz, or undefined for open sky: { id, kind, huge, x, z (its middle), y (its ground level),
 * r (its radius), s (its own seed) }. The four cells of a huge or mythic region give the same island.
 */
export function islandOf(seed, cx, cz) {
  const { cell } = LAYOUT;
  const rx = Math.floor(cx / 2);
  const rz = Math.floor(cz / 2);
  const big = regionKind(seed, rx, rz);
  const [y0, y1] = LAYOUT.topY;
  if (big) {
    const [r0, r1] = LAYOUT.hugeRadius;
    const r = Math.round(r0 + unit(hash(seed, rx, rz, 109)) * (r1 - r0));
    const room = Math.max(0, cell - Math.ceil(r * 1.15) - LAYOUT.margin);
    const x = rx * 2 * cell + cell + Math.round((unit(hash(seed, rx, rz, 113)) * 2 - 1) * room);
    const z = rz * 2 * cell + cell + Math.round((unit(hash(seed, rx, rz, 127)) * 2 - 1) * room);
    const y = Math.round(y0 + unit(hash(seed, rx, rz, 131)) * (y1 - y0));
    return { id: `r${rx},${rz}`, kind: big, huge: true, x, z, y, r, s: hash(seed, rx, rz, 139) };
  }
  if (unit(hash(seed, cx, cz, 149)) < LAYOUT.emptyChance) return undefined;
  const [r0, r1] = LAYOUT.radius;
  const r = Math.round(r0 + unit(hash(seed, cx, cz, 151)) * (r1 - r0));
  const lo = Math.ceil(r * 1.15) + LAYOUT.margin;
  const span = Math.max(0, cell - 2 * lo - 1);
  const x = cx * cell + lo + Math.floor(unit(hash(seed, cx, cz, 157)) * (span + 1));
  const z = cz * cell + lo + Math.floor(unit(hash(seed, cx, cz, 163)) * (span + 1));
  const y = Math.round(y0 + unit(hash(seed, cx, cz, 167)) * (y1 - y0));
  return { id: `${cx},${cz}`, kind: kindAt(seed, cx, cz), huge: false, x, z, y, r, s: hash(seed, cx, cz, 173) };
}

/** Every island whose blocks come within `reach` blocks of x z (each once). */
export function islandsNear(seed, x, z, reach) {
  const c = LAYOUT.cell;
  const out = new Map();
  for (let cx = Math.floor((x - reach) / c) - 1; cx <= Math.floor((x + reach) / c) + 1; cx++) {
    for (let cz = Math.floor((z - reach) / c) - 1; cz <= Math.floor((z + reach) / c) + 1; cz++) {
      const isl = islandOf(seed, cx, cz);
      if (!isl || out.has(isl.id)) continue;
      if (Math.hypot(isl.x - x, isl.z - z) - extentOf(isl) <= reach) out.set(isl.id, isl);
    }
  }
  return [...out.values()];
}

/** Whether this version builds that island. */
export const builds = (isl) => Boolean(isl) && !isl.huge && BUILT.has(isl.kind);

/** The island a portal at x z (in the fishing dimension's blocks) opens onto: the nearest one this version builds. */
export function arrivalIsland(seed, x, z) {
  const near = islandsNear(seed, x, z, LAYOUT.cell * 6).filter(builds);
  near.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z) || (a.id < b.id ? -1 : 1));
  return near[0];
}

// ---- an island's shape

export const AIR = 0;
export const LAND = 1;
export const POND = 2;
export const ROCK = 3;

/**
 * An empty shape for the island: per column of its square (side W, corner x0 z0) its kind (AIR, LAND, POND, ROCK),
 * top (the grass, or the water's surface), floor (a pond's bed; the grass elsewhere), bottom (the lowest block),
 * edge (how far out the column is, 0 the middle to 100 the shore) and roots (a hanging root under it).
 */
export function newShape(isl) {
  const R = extentOf(isl);
  const W = 2 * R + 1;
  const n = W * W;
  return {
    R,
    W,
    x0: isl.x - R,
    z0: isl.z - R,
    kind: new Uint8Array(n),
    top: new Int16Array(n),
    floor: new Int16Array(n),
    bottom: new Int16Array(n),
    edge: new Uint8Array(n),
    roots: new Uint8Array(n),
    ponds: [],
    rocks: [],
    landing: undefined,
    trees: [],
  };
}

/** The column index of x z in the shape, or -1 outside it. */
export function at(sh, x, z) {
  const i = x - sh.x0;
  const j = z - sh.z0;
  return i < 0 || j < 0 || i >= sh.W || j >= sh.W ? -1 : j * sh.W + i;
}

/** Works the island's shape out into `sh`, a row of columns per step (so the game can spread it over ticks). */
export function* shapeSteps(isl, sh) {
  const { r, y: y0, s } = isl;
  const depth = Math.max(8, Math.round(r * 0.6));
  // the body: a rounded, wavy shore; gentle hills on top; a deep, rough, dripping underside
  for (let j = 0; j < sh.W; j++) {
    const z = sh.z0 + j;
    for (let i = 0; i < sh.W; i++) {
      const x = sh.x0 + i;
      const dx = x - isl.x;
      const dz = z - isl.z;
      const d = Math.hypot(dx, dz);
      if (d > r * 1.1) continue;
      const ang = Math.atan2(dz, dx);
      const re = r * (0.86 + 0.14 * fbm2((s ^ 0x1) >>> 0, 3 + 2 * Math.cos(ang), 3 + 2 * Math.sin(ang)) + 0.08 * noise2((s ^ 0x2) >>> 0, x / 18, z / 18));
      if (d >= re) continue;
      const t = d / re;
      const top = y0 + Math.round(2.5 * (1 - t * t) + 1.8 * fbm2((s ^ 0x3) >>> 0, x / 24, z / 24) - (t > 0.8 ? (t - 0.8) * 8 : 0));
      const under = depth * Math.pow(Math.max(0, 1 - t * t), 0.7) * (0.75 + 0.35 * noise2((s ^ 0x4) >>> 0, x / 12, z / 12));
      let drip = 0;
      if (t < 0.85) {
        const q = noise2((s ^ 0x5) >>> 0, x / 5, z / 5);
        if (q > 0.5) drip = (q - 0.5) * 2 * depth * 0.35 * (1 - t);
      }
      const k = j * sh.W + i;
      sh.kind[k] = LAND;
      sh.top[k] = top;
      sh.floor[k] = top;
      sh.bottom[k] = top - 2 - Math.round(under + drip);
      sh.edge[k] = Math.min(100, Math.round(t * 100));
    }
    yield;
  }
  // ponds of normal water, each in a sealed basin well inside the shore
  const tries = r >= 40 && unit(hash(s, 1, 0, 5)) < 0.6 ? 2 : 1;
  for (let p = 0; p < tries; p++) {
    const a = unit(hash(s, p, 1, 7)) * Math.PI * 2;
    const dist = r * (0.12 + 0.28 * unit(hash(s, p, 2, 7)));
    const pr = Math.max(4, Math.min(10, Math.round(r * (0.11 + 0.08 * unit(hash(s, p, 3, 7))))));
    const px = Math.round(isl.x + Math.cos(a) * dist);
    const pz = Math.round(isl.z + Math.sin(a) * dist);
    const bank = Math.ceil(pr * 1.7);
    if (sh.ponds.some((q) => Math.hypot(q.x - px, q.z - pz) < q.r * 1.7 + bank + 2)) continue;
    let ok = true;
    for (let z = pz - bank; z <= pz + bank && ok; z++) {
      for (let x = px - bank; x <= px + bank; x++) {
        if (Math.hypot(x - px, z - pz) > bank) continue;
        const k = at(sh, x, z);
        if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 85) {
          ok = false;
          break;
        }
      }
    }
    if (!ok) continue;
    sh.ponds.push({ x: px, z: pz, r: pr });
    for (let z = pz - bank; z <= pz + bank; z++) {
      for (let x = px - bank; x <= px + bank; x++) {
        const raw = Math.hypot(x - px, z - pz);
        if (raw > bank) continue;
        const k = at(sh, x, z);
        const pd = (raw / pr) * (1 + 0.18 * noise2((s ^ 0x6) >>> 0, x / 4, z / 4));
        if (pd < 1) {
          const floor = y0 - (1 + Math.round(2.5 * (1 - pd * pd)));
          sh.kind[k] = POND;
          sh.top[k] = y0;
          sh.floor[k] = floor;
          sh.bottom[k] = Math.min(sh.bottom[k], floor - 2);
        } else if (sh.kind[k] === LAND && sh.top[k] < y0) {
          sh.top[k] = y0;
          sh.floor[k] = y0;
        }
      }
    }
    yield;
  }
  // small rocks floating off the shore
  const rocks = 2 + Math.floor(unit(hash(s, 9, 0, 3)) * 3);
  for (let q = 0; q < rocks; q++) {
    const a = unit(hash(s, q, 9, 11)) * Math.PI * 2;
    const rr = 3 + Math.floor(unit(hash(s, q, 9, 13)) * 4);
    const dist = r * 1.08 + 8 + unit(hash(s, q, 9, 17)) * 14;
    const qx = Math.round(isl.x + Math.cos(a) * dist);
    const qz = Math.round(isl.z + Math.sin(a) * dist);
    const qy = y0 - 6 + Math.floor(unit(hash(s, q, 9, 19)) * 12);
    let free = true;
    for (let z = qz - rr - 2; z <= qz + rr + 2 && free; z++) for (let x = qx - rr - 2; x <= qx + rr + 2; x++) if (sh.kind[at(sh, x, z)] !== AIR) free = false;
    if (!free) continue;
    sh.rocks.push({ x: qx, z: qz, y: qy, r: rr });
    for (let z = qz - rr; z <= qz + rr; z++) {
      for (let x = qx - rr; x <= qx + rr; x++) {
        const d = Math.hypot(x - qx, z - qz) / (rr * (0.85 + 0.15 * noise2((s ^ 0x7) >>> 0, x / 3, z / 3)));
        if (d >= 1) continue;
        const k = at(sh, x, z);
        const top = qy + (d < 0.5 ? 1 : 0);
        sh.kind[k] = ROCK;
        sh.top[k] = top;
        sh.floor[k] = top;
        sh.bottom[k] = top - 1 - Math.round(rr * 1.3 * (1 - d * d));
        sh.edge[k] = 100;
      }
    }
  }
  // hanging roots under a few columns
  for (let k = 0; k < sh.kind.length; k++) {
    if (sh.kind[k] !== LAND || sh.edge[k] > 70) continue;
    const x = sh.x0 + (k % sh.W);
    const z = sh.z0 + Math.floor(k / sh.W);
    if (sh.top[k] - sh.bottom[k] >= 4 && unit(hash(s, x, z, 37)) < 0.05) sh.roots[k] = 1;
  }
  sh.landing = landingOf(isl, sh);
  sh.trees = treesOf(isl, sh);
  yield;
}

/** The island's whole shape at once (tests, and anything that needn't spread it out). */
export function shapeOf(isl) {
  const sh = newShape(isl);
  for (const _ of shapeSteps(isl, sh));
  return sh;
}

const isWet = (sh, x, z) => sh.kind[at(sh, x, z)] === POND;

function nearWater(sh, x, z, n) {
  for (let dz = -n; dz <= n; dz++) for (let dx = -n; dx <= n; dx++) if (isWet(sh, x + dx, z + dz)) return true;
  return false;
}

/** Where the return portal stands: a flat strip of land 4 long (x) and 3 wide, away from water. */
function landingOf(isl, sh) {
  const a = unit(hash(isl.s, 3, 3, 3)) * Math.PI * 2;
  const cx = Math.round(isl.x + Math.cos(a) * isl.r * 0.45);
  const cz = Math.round(isl.z + Math.sin(a) * isl.r * 0.45);
  const fits = (lx, lz) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let z = lz - 1; z <= lz + 1; z++) {
      for (let x = lx - 1; x <= lx + 2; x++) {
        const k = at(sh, x, z);
        if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 85) return undefined;
        lo = Math.min(lo, sh.top[k]);
        hi = Math.max(hi, sh.top[k]);
      }
    }
    if (hi - lo > 1 || nearWater(sh, lx, lz, 3) || nearWater(sh, lx + 1, lz, 3)) return undefined;
    return hi;
  };
  for (let ring = 0; ring <= Math.ceil(isl.r * 0.9); ring++) {
    for (let dz = -ring; dz <= ring; dz++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
        const hi = fits(cx + dx, cz + dz);
        if (hi !== undefined) return { x: cx + dx, z: cz + dz, y: hi + 1, axis: "x" };
      }
    }
  }
  return undefined;
}

/** The trees ZooCraft grows on a common island (its own oak and birch, 0.1.144), and how often. */
export const COMMON_TREES = /** @type {ReadonlyArray<[string, number]>} */ (Object.freeze([
  ["zoocraft:oak_round", 30],
  ["zoocraft:oak_branchy", 25],
  ["zoocraft:oak_tall", 12],
  ["zoocraft:oak_great", 8],
  ["zoocraft:birch_tall", 13],
  ["zoocraft:birch_slim", 12],
]));

function treesOf(isl, sh) {
  const out = [];
  const total = COMMON_TREES.reduce((n, [, w]) => n + w, 0);
  for (let gz = -sh.R; gz <= sh.R; gz += 7) {
    for (let gx = -sh.R; gx <= sh.R; gx += 7) {
      if (unit(hash(isl.s, gx, gz, 23)) >= 0.42) continue;
      const x = isl.x + gx + Math.floor(unit(hash(isl.s, gx, gz, 21)) * 5) - 2;
      const z = isl.z + gz + Math.floor(unit(hash(isl.s, gx, gz, 22)) * 5) - 2;
      const k = at(sh, x, z);
      if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 78 || sh.top[k] !== sh.floor[k] || nearWater(sh, x, z, 3)) continue;
      if (sh.landing && Math.hypot(x - sh.landing.x, z - sh.landing.z) < 10) continue;
      let u = unit(hash(isl.s, gx, gz, 25)) * total;
      let id = COMMON_TREES[0][0];
      for (const [t, w] of COMMON_TREES) {
        if (u < w) {
          id = t;
          break;
        }
        u -= w;
      }
      out.push({ id, x, y: sh.top[k] + 1, z });
    }
  }
  return out;
}

// ---- the blocks, in the order they go in

export const FLOWERS = Object.freeze(["minecraft:dandelion", "minecraft:poppy", "minecraft:azure_bluet", "minecraft:oxeye_daisy", "minecraft:cornflower"]);

/** The blocks for the island, as { block, list } with at most BATCH blocks each, then { tree, at } for each tree. */
export function* opsOf(isl, sh) {
  const W = sh.W;
  const cols = [];
  for (let k = 0; k < sh.kind.length; k++) if (sh.kind[k] !== AIR) cols.push(k);
  const xOf = (k) => sh.x0 + (k % W);
  const zOf = (k) => sh.z0 + Math.floor(k / W);
  const land = (k) => sh.kind[k] === LAND || sh.kind[k] === ROCK;
  function* batches(block, gen) {
    let list = [];
    for (const p of gen) {
      list.push(p);
      if (list.length >= BATCH) {
        yield { block, list };
        list = [];
      }
    }
    if (list.length) yield { block, list };
  }
  const s = isl.s;
  // grass on top
  yield* batches("minecraft:grass_block", (function* () {
    for (const k of cols) if (land(k)) yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
  })());
  // pond beds: sand at the shallow rim, clay and dirt deeper
  const bed = (k) => {
    const x = xOf(k);
    const z = zOf(k);
    if (sh.top[k] - sh.floor[k] <= 1) return "minecraft:sand";
    return noise2((s ^ 0x8) >>> 0, x / 3, z / 3) > 0.25 ? "minecraft:clay" : "minecraft:dirt";
  };
  for (const block of ["minecraft:sand", "minecraft:clay", "minecraft:dirt"]) {
    yield* batches(block, (function* () {
      for (const k of cols) if (sh.kind[k] === POND && bed(k) === block) yield { x: xOf(k), y: sh.floor[k], z: zOf(k) };
    })());
  }
  // the water
  yield* batches("minecraft:water", (function* () {
    for (const k of cols) if (sh.kind[k] === POND) for (let y = sh.floor[k] + 1; y <= sh.top[k]; y++) yield { x: xOf(k), y, z: zOf(k) };
  })());
  // dirt under the grass and the beds
  yield* batches("minecraft:dirt", (function* () {
    for (const k of cols) {
      const f = sh.floor[k];
      for (let y = f - 1; y >= Math.max(sh.bottom[k], f - 3); y--) yield { x: xOf(k), y, z: zOf(k) };
    }
  })());
  // rooted dirt where roots hang
  yield* batches("minecraft:dirt_with_roots", (function* () {
    for (const k of cols) if (sh.roots[k]) yield { x: xOf(k), y: sh.bottom[k], z: zOf(k) };
  })());
  // ore in the stone: coal veins and fewer iron ones
  const landCols = cols.filter((k) => sh.kind[k] === LAND);
  /** @type {[string, number, number][]} */
  const veins = [["minecraft:coal_ore", 110, 41], ["minecraft:iron_ore", 300, 43]];
  for (const [block, per, salt] of veins) {
    yield* batches(block, (function* () {
      const n = Math.round(landCols.length / per);
      for (let v = 0; v < n && landCols.length; v++) {
        const k = landCols[Math.floor(unit(hash(s, v, salt, 45)) * landCols.length)];
        const lo = sh.bottom[k] + (sh.roots[k] ? 1 : 0);
        const hi = sh.floor[k] - 4;
        if (hi < lo) continue;
        const y = lo + Math.floor(unit(hash(s, v, salt, 47)) * (hi - lo + 1));
        const size = 3 + Math.floor(unit(hash(s, v, salt, 49)) * 4);
        const x0 = xOf(k);
        const z0 = zOf(k);
        for (let b = 0; b < size; b++) {
          const x = x0 + (b % 2);
          const z = z0 + (Math.floor(b / 2) % 2);
          const yy = y + Math.floor(b / 4);
          const kk = at(sh, x, z);
          if (kk < 0 || sh.kind[kk] !== LAND) continue;
          if (yy < sh.bottom[kk] + (sh.roots[kk] ? 1 : 0) || yy > sh.floor[kk] - 4) continue;
          yield { x, y: yy, z };
        }
      }
    })());
  }
  // stone for the rest of the body (anything already placed above is kept: the fills only fill air)
  yield* batches("minecraft:stone", (function* () {
    for (const k of cols) {
      const lo = sh.bottom[k] + (sh.roots[k] ? 1 : 0);
      for (let y = sh.floor[k] - 4; y >= lo; y--) yield { x: xOf(k), y, z: zOf(k) };
    }
  })());
  // plants: grass and flowers, sugar cane at the water, lily pads on it, roots under
  const busy = new Set();
  for (const t of sh.trees) busy.add(at(sh, t.x, t.z));
  const pad = (x, z) => sh.landing && x >= sh.landing.x - 3 && x <= sh.landing.x + 4 && Math.abs(z - sh.landing.z) <= 2;
  const plantOf = (k) => {
    if (!land(k) || busy.has(k)) return undefined;
    const x = xOf(k);
    const z = zOf(k);
    if (pad(x, z)) return undefined;
    const wet = sh.kind[k] === LAND && sh.top[k] === isl.y && (isWet(sh, x + 1, z) || isWet(sh, x - 1, z) || isWet(sh, x, z + 1) || isWet(sh, x, z - 1));
    if (wet && unit(hash(s, x, z, 35)) < 0.3) return "minecraft:reeds";
    const u = unit(hash(s, x, z, 31));
    if (u < 0.28) return "minecraft:short_grass";
    if (u < 0.31) return FLOWERS[Math.floor(unit(hash(s, x, z, 33)) * FLOWERS.length)];
    return undefined;
  };
  for (const block of ["minecraft:short_grass", ...FLOWERS]) {
    yield* batches(block, (function* () {
      for (const k of cols) if (plantOf(k) === block) yield { x: xOf(k), y: sh.top[k] + 1, z: zOf(k) };
    })());
  }
  yield* batches("minecraft:reeds", (function* () {
    for (const k of cols) {
      if (plantOf(k) !== "minecraft:reeds") continue;
      const tall = 1 + Math.floor(unit(hash(s, xOf(k), zOf(k), 39)) * 3);
      for (let h = 1; h <= tall; h++) yield { x: xOf(k), y: sh.top[k] + h, z: zOf(k) };
    }
  })());
  yield* batches("minecraft:waterlily", (function* () {
    for (const k of cols) if (sh.kind[k] === POND && unit(hash(s, xOf(k), zOf(k), 51)) < 0.06) yield { x: xOf(k), y: sh.top[k] + 1, z: zOf(k) };
  })());
  yield* batches("minecraft:hanging_roots", (function* () {
    for (const k of cols) if (sh.roots[k]) yield { x: xOf(k), y: sh.bottom[k] - 1, z: zOf(k) };
  })());
  for (const t of sh.trees) yield { tree: t.id, at: { x: t.x, y: t.y, z: t.z } };
}

// ---- the return portal on the island

/**
 * The prismarine frame (4 wide, 5 tall, along x) standing on the landing, the portal inside it, the dirt that fills
 * any gap under the frame, and where a player arrives (in the portal's middle).
 */
export function returnPortal(landing, sh) {
  const { x: lx, z: lz, y } = landing;
  const frame = [];
  const inside = [];
  const under = [];
  for (let dx = -1; dx <= 2; dx++) {
    for (let dy = 0; dy <= 4; dy++) {
      const p = { x: lx + dx, y: y + dy, z: lz };
      if (dx === -1 || dx === 2 || dy === 0 || dy === 4) frame.push(p);
      else inside.push(p);
    }
    const k = sh ? at(sh, lx + dx, lz) : -1;
    if (k >= 0) for (let yy = sh.top[k] + 1; yy < y; yy++) under.push({ x: lx + dx, y: yy, z: lz });
  }
  return { frame, inside, under, arrive: { x: lx + 1, y: y + 1, z: lz + 0.5 }, axis: "x" };
}
