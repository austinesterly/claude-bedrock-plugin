// 0.1.348: Acufend as Austin has it now (2026-11-21): "Acufend is actually a tiny moon of an ancient world. It is only
// 500 blocks by 500 blocks ... load the whole dimension before the player even enters. At the end of the world, it
// would just be void." The land (world/acufendRules.js) and the great cave (world/acufendCaveRules.js) as before, on a
// round moon 500 blocks across: its edge wanders a little way in (never out past the 500), the land sinks toward it,
// and under the land the rock rounds off below like the underside of a floating island, with stones of dripstone
// hanging from it. Past the edge, and under it, the void. All of it is built before anyone can go there
// (world/acufend.js), an area of chunks at a time. Pure: worked out the same in the game and in the tests.
import { hash, unit } from "../fishing/islandRules.js";
import { acuNoise, groundAt, columnRuns, chunkGrounds, chunkSpikes, spikesNear } from "./acufendRules.js";
import { AIR, DRIP, caveLayout, caveColumn, chunkHasCave, paintRuns, diffRuns, blockAt, tubeDistance } from "./acufendCaveRules.js";

const DEEP = "minecraft:deepslate";
/** Under each of the moon's chunks once it is built, at the bottom of the world (nobody ever gets that low). */
export const MARK = "minecraft:barrier";
export const MARK_Y = -64;
const SKIN = ["minecraft:tuff", "minecraft:smooth_basalt", "minecraft:deepslate"];

const S = (seed, n) => (seed ^ Math.imul(n, 0x3b9ac9f1)) >>> 0;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Where the moon's middle is: at 0 0, or in a world with Acufend land from before (0.1.341 to 0.1.347: `old`, the
 * places of its pads and its cave) far enough from all of it (k.moon.away) that none of it can ever be seen from the moon.
 */
export function moonCentre(old, k) {
  const pts = (old ?? []).filter((p) => Number.isFinite(p?.x) && Number.isFinite(p?.z));
  const away = k.moon.away;
  const clear = (c) => pts.every((p) => Math.hypot(p.x - c.x, p.z - c.z) >= away);
  const step = Math.ceil((away * 2) / 1024) * 1024;
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  for (let ring = 0; ring <= 4; ring++) {
    for (const [a, b] of ring === 0 ? [[0, 0]] : dirs) {
      const c = { x: a * step * ring, z: b * step * ring };
      if (clear(c)) return c;
    }
  }
  let far = 0;
  for (const p of pts) far = Math.max(far, Math.abs(p.x), Math.abs(p.z));
  return { x: Math.ceil((far + away) / 1024) * 1024, z: 0 };
}

/**
 * The moon's edge seen from its middle toward the middle of the column x z: how far that column is from the middle
 * (`d`) and how far the edge reaches that way (`R`). The edge wanders in by up to k.moon.wobble, never out: no column
 * is ever more than k.moon.r - 2 from the middle (so it is never more than 500 across).
 */
export function moonEdge(M, x, z, k) {
  const m = k.moon;
  const dx = x + 0.5 - M.x, dz = z + 0.5 - M.z;
  const d = Math.hypot(dx, dz);
  const a = Math.atan2(dz, dx);
  const n = 0.6 * acuNoise(S(M.seed, 1), Math.cos(a) * 3 + 40, Math.sin(a) * 3 + 40) + 0.4 * acuNoise(S(M.seed, 2), Math.cos(a) * 9 + 40, Math.sin(a) * 9 + 40);
  return { d, R: m.r - 2 - m.wobble * clamp(0.5 + 0.5 * n, 0, 1) };
}

/** The land's height at x z on the moon: Acufend's ground, sinking over the last k.moon.rim blocks toward the edge. */
export function moonGround(M, x, z, k, g = groundAt(M.seed, x, z, k), e = moonEdge(M, x, z, k)) {
  const m = k.moon;
  const t = clamp((e.d - (e.R - m.rim)) / m.rim, 0, 1);
  return g - Math.round(m.rimDrop * t * t * (3 - 2 * t));
}

/** The underside of the moon's rock at x z (the lowest block of it, before any hanging stone), or Infinity past the edge. */
export function moonBottom(M, x, z, k, e = moonEdge(M, x, z, k)) {
  const m = k.moon;
  if (e.d >= e.R) return Infinity;
  const q = e.d / e.R;
  const f = Math.pow(1 - Math.pow(q, m.shape), 1 / m.shape);
  return Math.round(m.rimBottom - (m.rimBottom - m.deep) * f + 3 * acuNoise(S(M.seed, 3), x / 11, z / 11)) | 0; // (never -0)
}

/** The stone hanging from the underside in the cell (i, j), or null: { x, z, r, h }. */
function hangOf(M, i, j, k) {
  const m = k.moon;
  if (unit(hash(S(M.seed, 4), i, j, 7)) >= m.hangChance) return null;
  const x = i * m.hangCell + 2 + (hash(S(M.seed, 5), i, j, 1) % (m.hangCell - 4));
  const z = j * m.hangCell + 2 + (hash(S(M.seed, 6), i, j, 2) % (m.hangCell - 4));
  const r = 1.5 + unit(hash(S(M.seed, 7), i, j, 3)) * 2.5;
  const h = m.hang[0] + Math.floor(unit(hash(S(M.seed, 8), i, j, 4)) * (m.hang[1] - m.hang[0] + 1));
  return { x, z, r, h };
}

/** The hanging stones that may reach into the chunk (chunk x, chunk z). */
export function moonHangs(M, cx, cz, k) {
  const c = k.moon.hangCell;
  const out = [];
  for (let i = Math.floor((cx * 16 - 5) / c); i <= Math.floor((cx * 16 + 20) / c); i++) {
    for (let j = Math.floor((cz * 16 - 5) / c); j <= Math.floor((cz * 16 + 20) / c); j++) {
      const h = hangOf(M, i, j, k);
      if (h) out.push(h);
    }
  }
  return out;
}

/** The land's spikes that may reach into the chunk, those standing well inside the edge (none in the sinking rim). */
export function moonSpikes(M, cx, cz, k) {
  return chunkSpikes(M.seed, cx, cz, k).filter((s) => {
    const e = moonEdge(M, s.x, s.z, k);
    return e.d + s.r < e.R - k.moon.rim;
  });
}

/**
 * The column at x z, bottom up: { empty } past the edge (or where the rock would be too thin to stand), else { runs
 * [y0, y1, block], ground, top, bottom (its lowest block), rock (the underside of its rock, over any hanging stone),
 * tip (a spike's point over `top`), hangTip (the y of the point under a hanging stone, if one ends there) }. `spikes` and `hangs` the chunk's (moonSpikes, moonHangs), `g`
 * Acufend's own ground there (chunkGrounds) if already worked out.
 */
export function moonColumn(M, x, z, k, spikes, hangs, g) {
  const m = k.moon;
  const e = moonEdge(M, x, z, k);
  const ground = moonGround(M, x, z, k, g ?? groundAt(M.seed, x, z, k), e);
  const bottom = moonBottom(M, x, z, k, e);
  if (!(bottom < ground - 3)) return { empty: true, runs: [], ground, top: ground, bottom, tip: false };
  const c = columnRuns(M.seed, x, z, k, spikes, bottom - 1, ground, bottom);
  // the underside: a skin of tuff and smooth basalt (and deepslate) two blocks thick
  const n = hash(S(M.seed, 9), x, 0, z) % 7;
  let runs = paintRuns(c.runs, bottom, Math.min(bottom + 1, c.ground - 4), SKIN[n < 3 ? 0 : n < 5 ? 1 : 2]);
  // a stone of dripstone hanging under it, here and there (not out near the edge)
  let hang = 0, hangTip;
  if (e.d < e.R * 0.9) {
    let best = 0, mid = false;
    for (const h of hangs) {
      const ex = x - h.x, ez = z - h.z;
      const d2 = ex * ex + ez * ez;
      if (d2 >= h.r * h.r) continue;
      const d = Math.sqrt(d2);
      const len = Math.round(h.h * Math.pow(1 - d / h.r, 1.3));
      if (len > best) {
        best = len;
        mid = d < 0.75;
      }
    }
    hang = Math.max(0, Math.min(best, bottom - m.lowest));
    if (hang > 0) {
      runs = [[bottom - hang, bottom - 1, DRIP], ...runs];
      if (mid) hangTip = bottom - hang - 1;
    }
  }
  return { empty: false, runs, ground: c.ground, top: c.top, bottom: bottom - hang, rock: bottom, tip: c.tip, hangTip };
}

// ---- a chunk of it

/**
 * Working out a chunk, a column at a time (so the game can do it a row at a time): moonChunkStart, then moonColumnWork
 * for each of its 256 columns, then moonChunkEnd. `L` the great cave's layout, if any of it is in this chunk.
 */
export function moonChunkStart(M, cx, cz, k, L) {
  return { M, cx, cz, k, L, G: chunkGrounds(M.seed, cx, cz, k), spikes: moonSpikes(M, cx, cz, k), hangs: moonHangs(M, cx, cz, k), cols: [], solid: 0, lo: -Infinity, hi: Infinity };
}

export function moonColumnWork(ch, dx, dz) {
  const { M, k, L } = ch;
  const x = ch.cx * 16 + dx, z = ch.cz * 16 + dz;
  const col = moonColumn(M, x, z, k, ch.spikes, ch.hangs, ch.G[dx * 16 + dz]);
  if (col.empty) return;
  let fin = col.runs;
  const tips = [];
  if (col.tip) tips.push({ y: col.top + 1, hanging: false });
  if (col.hangTip !== undefined) tips.push({ y: col.hangTip, hanging: true });
  let lichen;
  const cave = L && caveColumn(L, x, z, col.ground, col.top);
  if (cave) {
    for (const [y0, y1, blk] of cave.paint) fin = paintRuns(fin, y0, y1, blk);
    tips.push(...cave.tips);
    lichen = cave.lichen;
  }
  const held = tips.filter((t) => blockAt(fin, t.y) === AIR && blockAt(fin, t.hanging ? t.y + 1 : t.y - 1) !== AIR);
  if (lichen !== undefined && !(blockAt(fin, lichen) === AIR && blockAt(fin, lichen - 1) !== AIR && !held.some((t) => t.y === lichen))) lichen = undefined;
  ch.solid++;
  ch.lo = Math.max(ch.lo, col.rock + 2);
  ch.hi = Math.min(ch.hi, Math.min(col.ground, k.bandsFrom) - 8);
  ch.cols.push({ x, z, fin, tips: held, lichen });
}

/**
 * The chunk worked out: { fill: [y0, y1] or null (where every column is deep rock: set as one fill first), cols: [{ x,
 * z, set: the runs to set over the fill (air included where the cave is in it), tips, lichen }] }.
 */
export function moonChunkEnd(ch) {
  const fill = ch.solid === 256 && ch.lo <= ch.hi ? [ch.lo, ch.hi] : null;
  const under = fill ? [[fill[0], fill[1], DEEP]] : [];
  return { fill, cols: ch.cols.map((c) => ({ x: c.x, z: c.z, set: diffRuns(c.fin, under), fin: c.fin, tips: c.tips, lichen: c.lichen })) };
}

/** A chunk of the moon worked out all at once (for the tests). */
export function moonChunk(M, cx, cz, k, L) {
  const ch = moonChunkStart(M, cx, cz, k, L && chunkHasCave(L, cx, cz) ? L : undefined);
  for (let dx = 0; dx < 16; dx++) for (let dz = 0; dz < 16; dz++) moonColumnWork(ch, dx, dz);
  return moonChunkEnd(ch);
}

/**
 * The moon's chunks (every chunk any of it can reach into), in areas of k.moon.area by k.moon.area chunks, the middle
 * ones first: [{ chunks: [[cx, cz]], from: { x, z }, to: { x, z } }] (from..to the blocks of its chunks, to load).
 */
export function moonAreas(M, k) {
  const m = k.moon;
  const c0x = Math.floor((M.x - m.r) / 16), c1x = Math.floor((M.x + m.r) / 16);
  const c0z = Math.floor((M.z - m.r) / 16), c1z = Math.floor((M.z + m.r) / 16);
  const areas = new Map();
  for (let cx = c0x; cx <= c1x; cx++) {
    for (let cz = c0z; cz <= c1z; cz++) {
      const nx = clamp(M.x, cx * 16, cx * 16 + 16), nz = clamp(M.z, cz * 16, cz * 16 + 16);
      if (Math.hypot(nx - M.x, nz - M.z) >= m.r) continue;
      const key = `${Math.floor((cx - c0x) / m.area)},${Math.floor((cz - c0z) / m.area)}`;
      if (!areas.has(key)) areas.set(key, []);
      areas.get(key).push([cx, cz]);
    }
  }
  const out = [...areas.values()].map((chunks) => {
    const xs = chunks.map((c) => c[0]), zs = chunks.map((c) => c[1]);
    const from = { x: Math.min(...xs) * 16, z: Math.min(...zs) * 16 }, to = { x: Math.max(...xs) * 16 + 15, z: Math.max(...zs) * 16 + 15 };
    return { chunks, from, to, mid: Math.hypot((from.x + to.x) / 2 - M.x, (from.z + to.z) / 2 - M.z) };
  });
  out.sort((a, b) => a.mid - b.mid || a.from.x - b.from.x || a.from.z - b.from.z);
  return out.map(({ chunks, from, to }) => ({ chunks, from, to }));
}

// ---- the great cave on it

/**
 * The great cave on the moon: its great chamber's middle (of 25 places within k.moon.caveOffset of the moon's middle,
 * the one with the most rock over it, as caveSite), and the way in from the side chamber and way round that leaves its
 * mouth nearest k.moon.mouthAt from the middle, the whole cave well inside the edge. { site, side, sign, L }.
 */
export function moonCave(M, k) {
  const m = k.moon;
  const a0 = unit(hash(S(M.seed, 10), 1, 2, 3)) * Math.PI * 2;
  const pts = [{ x: M.x, z: M.z }];
  for (let i = 0; i < 12; i++) for (const f of [0.5, 1]) pts.push({ x: Math.round(M.x + Math.cos(a0 + (i * Math.PI) / 6) * m.caveOffset * f), z: Math.round(M.z + Math.sin(a0 + (i * Math.PI) / 6) * m.caveOffset * f) });
  let site = pts[0], best = -Infinity;
  for (const p of pts) {
    let score = groundAt(M.seed, p.x, p.z, k);
    for (let j = 0; j < 8; j++) score += groundAt(M.seed, Math.round(p.x + Math.cos((j * Math.PI) / 4) * 30), Math.round(p.z + Math.sin((j * Math.PI) / 4) * 30), k);
    if (score > best) {
      best = score;
      site = p;
    }
  }
  const inner = m.r - 2 - m.wobble - m.rim - 10;
  let pick, pickScore = -Infinity;
  for (let side = 1; side <= 4; side++) {
    for (const sign of [1, -1]) {
      const L = caveLayout(M.seed, site, { x: M.x, z: M.z }, k, { side, sign });
      const md = Math.hypot(L.mouth.x - M.x, L.mouth.z - M.z);
      const inside = md <= inner && L.chambers.every((ch) => Math.hypot(ch.x - M.x, ch.z - M.z) + ch.r * 1.15 + 2 <= inner);
      const score = inside ? -Math.abs(md - m.mouthAt) : -1000 - md;
      if (score > pickScore) {
        pickScore = score;
        pick = { site, side, sign, L };
      }
    }
  }
  return /** @type {any} */ (pick);
}

// ---- getting there

/** Where a portal at x z of the Overworld leads on the moon: an eighth of the way out from its middle, kept within k.moon.padRadius. */
export function moonSpot(M, x, z, k) {
  let rx = Math.floor(x / k.scale), rz = Math.floor(z / k.scale);
  const d = Math.hypot(rx, rz);
  if (d > k.moon.padRadius) {
    rx = Math.round((rx * k.moon.padRadius) / d);
    rz = Math.round((rz * k.moon.padRadius) / d);
  }
  return { x: M.x + rx, z: M.z + rz };
}

/**
 * The spot nearest x z on the moon for an arrival pad: level, below the mountains, clear of spikes, not over the great
 * cave's way in, and within k.moon.padRadius (and a little) of the middle. Looks outwards in rings, 4 blocks apart.
 */
export function moonArrivalSpot(M, L, x, z, k) {
  const way = L?.tubes.find((t) => t.open);
  const ok = (px, pz) => {
    if (Math.hypot(px - M.x, pz - M.z) > k.moon.padRadius + 24) return undefined;
    if (way && tubeDistance(way, px, pz).d < way.w + 12) return undefined;
    const g = moonGround(M, px, pz, k);
    if (g >= k.bandsFrom - 4) return undefined;
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -3], [0, 3], [-3, 0], [3, 0]]) if (Math.abs(moonGround(M, px + dx, pz + dz, k) - g) > 2) return undefined;
    const near = spikesNear(M.seed, Math.floor(px / k.spikeCell), Math.floor(pz / k.spikeCell), k);
    if (near.some((s) => Math.hypot(s.x - px, s.z - pz) < s.r + 5)) return undefined;
    return g;
  };
  for (let ring = 0; ring <= 40; ring++) {
    const pts = [];
    if (ring === 0) pts.push([x, z]);
    else
      for (let i = -ring; i <= ring; i++) {
        pts.push([x + i * 4, z - ring * 4], [x + i * 4, z + ring * 4]);
        if (Math.abs(i) < ring) pts.push([x - ring * 4, z + i * 4], [x + ring * 4, z + i * 4]);
      }
    for (const [px, pz] of pts) {
      const g = ok(px, pz);
      if (g !== undefined) return { x: px, y: g, z: pz };
    }
  }
  return { x: M.x, y: moonGround(M, M.x, M.z, k), z: M.z };
}

/** Whether x z is on (over) the moon, with `margin` blocks round its edge. */
export function onMoon(M, x, z, k, margin = 0) {
  return Math.hypot(x - M.x, z - M.z) <= k.moon.r + margin;
}
