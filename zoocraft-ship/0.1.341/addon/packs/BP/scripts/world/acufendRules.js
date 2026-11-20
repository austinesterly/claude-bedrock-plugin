// 0.1.341: Acufend and its portal, the rules (Austin's NPC #29 spec, sections 10 and 11). Pure, so the tests can run
// them; world/acufend.js is the game side, BALANCE.acufend the numbers.
//
// The portal: an upright frame of Crying Obsidian built like the Nether's (the corners optional), 2 to 21 blocks wide
// and 3 to 21 tall inside ("exact frame dimensions have not yet been established": the Nether's), lit only by the
// Lightning TNT Frequency Stick going off against it. Standing in it takes a player to Acufend, at an eighth of the
// distance as the Nether, onto a level pad with a lit frame to come back by.
//
// Acufend: Bedrock gives a new dimension no terrain of its own (only the void generator), so its land is built by the
// add-on, a chunk at a time round each player there, every block worked out from the world's seed and the place, so
// it is the same land whoever explores it and in whatever order: jagged rock, sharp dripstone spikes, and strange
// mountains banded orange and purple under an orange sky going purple at the horizon.
import { hash, unit } from "../fishing/islandRules.js";

export const ACUFEND = "zoocraft:acufend";
export const ACU_PORTAL = "zoocraft:acufend_portal";
export const ACU_AXIS = "zoocraft:axis";
export const ACU_FRAME = "minecraft:crying_obsidian";
/** The player's way back: where they stood when they last went into Acufend. */
export const ACU_BACK_KEY = "zoocraft:acufend_back";
/** Under every built column, at y 0: also how a chunk is known to be built. */
export const FLOOR = "minecraft:bedrock";
export const FLOOR_Y = 0;

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * The portal the stick lights from `start` (an empty block), in the upright plane along `axis` ("x": the frame runs
 * along x; "z": along z), or undefined if that isn't the inside of a whole Crying Obsidian frame. `get(x, y, z)` is
 * the block's id, or undefined where the world isn't loaded. Returns { axis, cells, width, height, min }.
 */
export function findAcuPortal(get, start, axis, k) {
  const open = (id) => id === "minecraft:air";
  if (!open(get(start.x, start.y, start.z))) return undefined;
  const a0 = axis === "x" ? start.x : start.z;
  const pos = (a, y) => (axis === "x" ? { x: a, y, z: start.z } : { x: start.x, y, z: a });
  const seen = new Set([`${a0},${start.y}`]);
  const todo = [[a0, start.y]];
  let minA = a0, maxA = a0, minY = start.y, maxY = start.y;
  while (todo.length) {
    const [a, y] = /** @type {[number, number]} */ (todo.pop());
    minA = Math.min(minA, a);
    maxA = Math.max(maxA, a);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    if (maxA - minA + 1 > k.max || maxY - minY + 1 > k.max) return undefined;
    for (const [da, dy] of SIDES) {
      const na = a + da, ny = y + dy;
      if (seen.has(`${na},${ny}`)) continue;
      const p = pos(na, ny);
      const id = get(p.x, p.y, p.z);
      if (id === undefined) return undefined;
      if (open(id)) {
        seen.add(`${na},${ny}`);
        todo.push([na, ny]);
      } else if (id !== ACU_FRAME) return undefined;
    }
  }
  const width = maxA - minA + 1, height = maxY - minY + 1;
  if (width < k.minWidth || height < k.minHeight || seen.size !== width * height) return undefined;
  const cells = [...seen].map((s) => {
    const [a, y] = s.split(",").map(Number);
    return pos(a, y);
  });
  return { axis, cells, width, height, min: pos(minA, minY) };
}

/** The portal from `start`, the plane the thrower faced tried first (`look`: their view direction). */
export function lightAcuPortal(get, start, look, k) {
  const first = Math.abs(look?.x ?? 0) > Math.abs(look?.z ?? 0) ? "z" : "x";
  return findAcuPortal(get, start, first, k) ?? findAcuPortal(get, start, first === "x" ? "z" : "x", k);
}

/** Whether the portal blocks joined to `start` still sit in a whole frame. Returns { cells, whole }. */
export function acuPortalStillWhole(get, start, axis, k) {
  const pos = (a, y) => (axis === "x" ? { x: a, y, z: start.z } : { x: start.x, y, z: a });
  const a0 = axis === "x" ? start.x : start.z;
  const seen = new Set([`${a0},${start.y}`]);
  const todo = [[a0, start.y]];
  const cells = [];
  let whole = true;
  while (todo.length && seen.size <= k.max * k.max) {
    const [a, y] = /** @type {[number, number]} */ (todo.pop());
    cells.push(pos(a, y));
    for (const [da, dy] of SIDES) {
      const p = pos(a + da, y + dy);
      const id = get(p.x, p.y, p.z);
      if (id === ACU_PORTAL) {
        if (!seen.has(`${a + da},${y + dy}`)) {
          seen.add(`${a + da},${y + dy}`);
          todo.push([a + da, y + dy]);
        }
      } else if (id !== ACU_FRAME) whole = false;
    }
  }
  return { cells, whole };
}

/** Where a portal at x z in the Overworld leads in Acufend: an eighth of the way, as the Nether. */
export const acuSpot = (x, z, k) => ({ x: Math.floor(x / k.scale), z: Math.floor(z / k.scale) });

// ---- the land

const S = (seed, n) => (seed ^ Math.imul(n, 0x27d4eb2d)) >>> 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// Acufend's own value noise: one mixing round for each lattice corner. (The fishing sky's noise2 mixes four times;
// on the game's script engine that made the land's working out three quarters of a chunk's cost.)
function corner(seed, x, z) {
  let h = (Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(z | 0, 0x165667b1) ^ seed) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2147483648 - 1;
}

/** Smooth value noise, -1 to 1, one lattice step per unit. */
export function acuNoise(seed, x, z) {
  const x0 = Math.floor(x), z0 = Math.floor(z);
  const fx = x - x0, fz = z - z0;
  const u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const a = corner(seed, x0, z0), b = corner(seed, x0 + 1, z0), c = corner(seed, x0, z0 + 1), d = corner(seed, x0 + 1, z0 + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Two octaves of it, -1 to 1. */
const acuFbm = (seed, x, z) => (acuNoise(seed, x, z) + 0.5 * acuNoise((seed + 1013) >>> 0, x * 2, z * 2)) / 1.5;

/** The land's slow shapes (rolling ground, the great ridges) are worked out every STEP blocks and blended between. */
const STEP = 4;

/** The slow part of the height at a lattice point: the rolling ground, and here and there a great ridge of mountain. */
function smoothAt(seed, x, z, k) {
  const rolling = 14 * acuFbm(S(seed, 1), x / 70, z / 70);
  const ridge = 1 - Math.abs(acuNoise(S(seed, 3), x / 130, z / 130));
  const mask = clamp((acuFbm(S(seed, 4), x / 220, z / 220) + 0.15) * 2, 0, 1);
  return rolling + Math.pow(ridge, 4) * k.mountain * mask;
}

const blend = (a, b, c, d, u, v) => a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;

/** The rock's height at the whole-numbered x z, before any spike: the slow shapes blended, and a rough top. */
export function groundAt(seed, x, z, k) {
  const i = Math.floor(x / STEP) * STEP, j = Math.floor(z / STEP) * STEP;
  const sm = blend(smoothAt(seed, i, j, k), smoothAt(seed, i + STEP, j, k), smoothAt(seed, i, j + STEP, k), smoothAt(seed, i + STEP, j + STEP, k), (x - i) / STEP, (z - j) / STEP);
  return Math.round(k.base + sm + 3 * acuNoise(S(seed, 2), x / 5, z / 5));
}

/**
 * The spikes whose cells are the 3 by 3 round cell (cx, cz): [{ x, z, r, h, foot }], h the height over its foot. A
 * cell has one or none; now and then a giant (5 to 7 across the foot, 50 to 80 high).
 */
export function spikesNear(seed, cx, cz, k) {
  const out = [];
  for (let i = cx - 1; i <= cx + 1; i++) {
    for (let j = cz - 1; j <= cz + 1; j++) {
      const s = spikeOf(seed, i, j, k);
      if (s) out.push(s);
    }
  }
  return out;
}

/** Spikes already worked out, for each balance (the same numbers give the same spikes): neighbouring chunks share cells. */
const spikeCache = new WeakMap();

/** The spike of the cell (i, j), or null. */
function spikeOf(seed, i, j, k) {
  let cache = spikeCache.get(k);
  if (!cache) spikeCache.set(k, (cache = new Map()));
  const key = `${seed},${i},${j}`;
  const had = cache.get(key);
  if (had !== undefined) return had;
  let s = null;
  if (unit(hash(S(seed, 5), i, j, 11)) < k.spikeChance) {
    const x = i * k.spikeCell + 2 + (hash(S(seed, 6), i, j, 1) % (k.spikeCell - 4));
    const z = j * k.spikeCell + 2 + (hash(S(seed, 7), i, j, 2) % (k.spikeCell - 4));
    const giant = unit(hash(S(seed, 12), i, j, 5)) < k.giantChance;
    const r = giant ? 5 + unit(hash(S(seed, 8), i, j, 3)) * 2 : 1.6 + unit(hash(S(seed, 8), i, j, 3)) * 2.6;
    const h = giant ? 50 + Math.floor(unit(hash(S(seed, 9), i, j, 4)) * 30) : 14 + Math.floor(unit(hash(S(seed, 9), i, j, 4)) * 34);
    s = Object.freeze({ x, z, r, h, foot: groundAt(seed, x, z, k) });
  }
  if (cache.size > 20000) cache.clear();
  cache.set(key, s);
  return s;
}

/** The spikes that may reach into the chunk at (chunk x, chunk z): those of every cell round it. */
export function chunkSpikes(seed, chx, chz, k) {
  const c0x = Math.floor((chx * 16) / k.spikeCell), c1x = Math.floor((chx * 16 + 15) / k.spikeCell);
  const c0z = Math.floor((chz * 16) / k.spikeCell), c1z = Math.floor((chz * 16 + 15) / k.spikeCell);
  const seen = new Map();
  for (let i = c0x; i <= c1x; i++) for (let j = c0z; j <= c1z; j++) for (const s of spikesNear(seed, i, j, k)) seen.set(`${s.x},${s.z}`, s);
  return [...seen.values()];
}

/**
 * The column at x z: its ground (`ground`, if already worked out), its top (a spike's, if one rises there) and whether
 * a spike's tip ends it.
 */
export function columnAt(seed, x, z, k, spikes, ground = groundAt(seed, x, z, k)) {
  let top = ground, tip = false, spike = false;
  for (const s of spikes) {
    const ex = x - s.x, ez = z - s.z;
    const d2 = ex * ex + ez * ez;
    if (d2 >= s.r * s.r) continue;
    const d = Math.sqrt(d2);
    const t = s.foot + Math.round(s.h * Math.pow(1 - d / s.r, 1.4));
    if (t > top) {
      top = t;
      spike = true;
      tip = d < 0.75;
    }
  }
  return { ground, top, spike, tip };
}

const BANDS = ["minecraft:orange_terracotta", "minecraft:purple_terracotta", "minecraft:hardened_clay", "minecraft:magenta_terracotta", "minecraft:orange_terracotta", "minecraft:smooth_basalt"];

/** The surface rock at x z: tuff, with patches of blackstone and of basalt. */
export function surfaceAt(seed, x, z) {
  const n = acuNoise(S(seed, 10), x / 9, z / 9);
  return n > 0.35 ? "minecraft:blackstone" : n < -0.45 ? "minecraft:basalt" : "minecraft:tuff";
}

/**
 * The blocks of the column at x z above the chunk's common floor `from` (exclusive), as [y0, y1, block] runs, bottom
 * up: deep rock, the surface, the mountains' coloured bands above k.bandsFrom, a spike of dripstone and its tip.
 * `ground`: the column's ground, if already worked out (chunkGrounds).
 */
export function columnRuns(seed, x, z, k, spikes, from, ground) {
  const c = columnAt(seed, x, z, k, spikes, ground);
  const runs = [];
  const add = (y0, y1, b) => {
    y0 = Math.max(y0, from + 1);
    if (y1 >= y0) runs.push([y0, y1, b]);
  };
  const surf = Math.min(c.ground - 3, k.bandsFrom - 1);
  add(FLOOR_Y + 1, surf - 1, "minecraft:deepslate");
  if (c.ground < k.bandsFrom) add(surf, c.ground, surfaceAt(seed, x, z));
  else {
    add(surf, k.bandsFrom - 1, "minecraft:tuff");
    const warp = Math.floor(3 * acuNoise(S(seed, 11), x / 24, z / 24));
    for (let y = k.bandsFrom; y <= c.ground; ) {
      const band = Math.floor((y + warp) / 3);
      const end = Math.min(c.ground, band * 3 - warp + 2);
      add(y, end, BANDS[((band % BANDS.length) + BANDS.length) % BANDS.length]);
      y = end + 1;
    }
  }
  if (c.top > c.ground) add(c.ground + 1, c.top, "minecraft:dripstone_block");
  return { runs, ...c };
}

/**
 * The ground of each of the chunk's 256 columns, [dx * 16 + dz]: groundAt's, with the slow shapes' 25 lattice points
 * over the chunk worked out once.
 */
export function chunkGrounds(seed, chx, chz, k) {
  const x0 = chx * 16, z0 = chz * 16;
  const L = new Array(25);
  for (let a = 0; a <= 4; a++) for (let b = 0; b <= 4; b++) L[a * 5 + b] = smoothAt(seed, x0 + a * STEP, z0 + b * STEP, k);
  const g = new Array(256);
  const s2 = S(seed, 2);
  for (let x = 0; x < 16; x++) {
    const a = x >> 2, u = (x & 3) / STEP;
    for (let z = 0; z < 16; z++) {
      const b = z >> 2, v = (z & 3) / STEP;
      const sm = blend(L[a * 5 + b], L[(a + 1) * 5 + b], L[a * 5 + b + 1], L[(a + 1) * 5 + b + 1], u, v);
      g[x * 16 + z] = Math.round(k.base + sm + 3 * acuNoise(s2, (x0 + x) / 5, (z0 + z) / 5));
    }
  }
  return g;
}

/** 8 under the lowest ground in the chunk: up to there, the whole chunk is one fill of deep rock. */
export function chunkFloor(seed, chx, chz, k, grounds = chunkGrounds(seed, chx, chz, k)) {
  let low = Infinity;
  for (const g of grounds) low = Math.min(low, g);
  return Math.max(FLOOR_Y, Math.min(low, k.bandsFrom) - 8);
}

/** The chunks within `r` chunks of x z, nearest first: [chunk x, chunk z]. */
export function chunksAround(x, z, r) {
  const cx = Math.floor(x / 16), cz = Math.floor(z / 16);
  const out = [];
  for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) out.push([cx + i, cz + j]);
  return out.sort((a, b) => (a[0] - cx) ** 2 + (a[1] - cz) ** 2 - ((b[0] - cx) ** 2 + (b[1] - cz) ** 2));
}

// ---- where a player arrives

/**
 * The spot nearest x z where the ground is level and clear of spikes and below the mountains: the arrival pad's
 * middle. Looks outwards in rings, 4 blocks apart.
 */
export function arrivalSpot(seed, x, z, k) {
  for (let ring = 0; ring <= 24; ring++) {
    const pts = [];
    if (ring === 0) pts.push([x, z]);
    else
      for (let i = -ring; i <= ring; i++) {
        pts.push([x + i * 4, z - ring * 4], [x + i * 4, z + ring * 4]);
        if (Math.abs(i) < ring) pts.push([x - ring * 4, z + i * 4], [x + ring * 4, z + i * 4]);
      }
    for (const [px, pz] of pts) {
      const g = groundAt(seed, px, pz, k);
      if (g >= k.bandsFrom - 4) continue;
      let level = true;
      for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -3], [0, 3], [-3, 0], [3, 0]]) if (Math.abs(groundAt(seed, px + dx, pz + dz, k) - g) > 2) level = false;
      if (!level) continue;
      const near = spikesNear(seed, Math.floor(px / k.spikeCell), Math.floor(pz / k.spikeCell), k);
      if (near.some((s) => Math.hypot(s.x - px, s.z - pz) < s.r + 5)) continue;
      return { x: px, y: g, z: pz };
    }
  }
  return { x, y: groundAt(seed, x, z, k), z };
}

/** The pad already made nearest the spot, if one is within `range` of it: a portal near another keeps opening onto it. */
export function knownSpotNear(spots, spot, range) {
  let best;
  let bd = Infinity;
  for (const s of spots ?? []) {
    if (![s?.x, s?.y, s?.z].every(Number.isFinite)) continue;
    const d = Math.hypot(s.x - spot.x, s.z - spot.z);
    if (d <= range && d < bd) {
      best = { x: s.x, y: s.y, z: s.z };
      bd = d;
    }
  }
  return best;
}

/**
 * The arrival: a 7 by 7 pad of polished blackstone at ground level, the air over it cleared 6 high, a Crying Obsidian
 * frame 4 wide and 5 tall on it (2 by 3 inside, lit), and where the player stands, in front of it.
 */
export function arrivalPlan(spot) {
  const g = spot.y;
  const pad = [], clear = [], frame = [], inside = [];
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      pad.push({ x: spot.x + dx, y: g, z: spot.z + dz });
      for (let dy = 1; dy <= 6; dy++) clear.push({ x: spot.x + dx, y: g + dy, z: spot.z + dz });
    }
  }
  for (let a = -1; a <= 2; a++) {
    for (let dy = 1; dy <= 5; dy++) {
      const c = { x: spot.x + a, y: g + dy, z: spot.z };
      if (a === -1 || a === 2 || dy === 1 || dy === 5) frame.push(c);
      else inside.push(c);
    }
  }
  return {
    pad, clear, frame, inside, axis: "x",
    arrive: { x: spot.x + 1, y: g + 1, z: spot.z + 2.5 },
    from: { x: spot.x - 24, z: spot.z - 24 }, to: { x: spot.x + 24, z: spot.z + 24 },
  };
}
