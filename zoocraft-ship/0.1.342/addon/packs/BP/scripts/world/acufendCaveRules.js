// 0.1.342: Acufend's great cave and the Frequency Friends' statue (Austin's NPC #29 spec, sections 11 and 12), the
// rules. Pure, so the tests can run them; world/acufend.js builds the cave into the land as each chunk is built.
//
// One cave in each world, placed (once) some 400 blocks from the first pad anyone arrives on: a dripstone cave on a
// far bigger scale than the game's. A great central chamber (a dome up to 70 high, kept 10 under the ground above), its
// middle a flat floor round a dais with the statue on it; four side chambers round it, each joined to it by a narrow
// winding passage hung with dripstone points; a steep tunnel, 5 wide, from the surface down into the side chamber that
// faces the first pad. Huge stalagmites and stalactites (some meeting as pillars), dripstone on every face with tuff
// and copper in it, glow lichen here and there.
import { hash, unit } from "../fishing/islandRules.js";
import { acuNoise, groundAt } from "./acufendRules.js";

export const RELIC_GOLD = "zoocraft:relic_gold";
export const RELIC_EMERALD = "zoocraft:relic_emerald";
export const RELIC_STONE = "zoocraft:relic_stone";
export const RELIC_SPIKE = "zoocraft:relic_spike";
export const RELIC_BLOCKS = [RELIC_GOLD, RELIC_EMERALD, RELIC_STONE, RELIC_SPIKE];
export const AIR = "minecraft:air";
export const DRIP = "minecraft:dripstone_block";
const TUFF = "minecraft:tuff";
const COPPER = "minecraft:copper_ore";
const DEEP = "minecraft:deepslate";
export const DAIS = "minecraft:tuff_bricks";
export const DAIS_CORNER = "minecraft:chiseled_tuff";
/** The floor under a chunk with any of the cave in it, in place of bedrock: a chunk built before the cave is known by it. */
export const CAVE_FLOOR = "minecraft:reinforced_deepslate";

const S = (seed, n) => (seed ^ Math.imul(n, 0x2c1b3c6d)) >>> 0;
const u = (seed, n, i, j) => unit(hash(S(seed, n), Math.floor(i), Math.floor(j), 3));

/**
 * The statue, 3 wide, 3 deep and 7 tall: a pointed, spiky rock of gold and emerald on a plinth of carved stone, points
 * standing out at its corners, at two of its sides higher up and at its tip. [dx, dy, dz, block] from the middle of
 * its bottom layer.
 */
export function statueCells() {
  const out = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const corner = dx !== 0 && dz !== 0;
      const mid = dx === 0 && dz === 0;
      out.push([dx, 0, dz, RELIC_STONE]);
      out.push([dx, 1, dz, corner ? RELIC_GOLD : mid ? RELIC_GOLD : RELIC_EMERALD]);
      out.push([dx, 2, dz, corner ? RELIC_SPIKE : mid ? RELIC_EMERALD : RELIC_GOLD]);
      if (!corner) out.push([dx, 3, dz, mid ? RELIC_GOLD : RELIC_EMERALD]);
      if (!corner) out.push([dx, 4, dz, mid ? RELIC_EMERALD : dx !== 0 ? RELIC_SPIKE : RELIC_GOLD]);
    }
  }
  out.push([0, 5, 0, RELIC_GOLD]);
  out.push([0, 6, 0, RELIC_SPIKE]);
  return out;
}

// ---- where the cave is

/**
 * The great chamber's middle: one of 24 places 400 to 480 blocks from the first pad (`pad`), the one with the most
 * rock over it (the ground there and round it highest), so its dome can rise highest.
 */
export function caveSite(seed, pad, k) {
  const c = k.cave;
  let best = { x: pad.x + c.siteDistances[0], z: pad.z };
  let bestScore = -Infinity;
  const a0 = u(seed, 1, pad.x, pad.z) * Math.PI * 2;
  for (let i = 0; i < 8; i++) {
    for (const dist of c.siteDistances) {
      const a = a0 + (i * Math.PI) / 4;
      const x = Math.round(pad.x + Math.cos(a) * dist), z = Math.round(pad.z + Math.sin(a) * dist);
      let score = groundAt(seed, x, z, k);
      for (let j = 0; j < 8; j++) score += groundAt(seed, Math.round(x + Math.cos((j * Math.PI) / 4) * 30), Math.round(z + Math.sin((j * Math.PI) / 4) * 30), k);
      if (score > bestScore) {
        bestScore = score;
        best = { x, z };
      }
    }
  }
  return best;
}

// ---- its shape

/**
 * A chamber at x z: undefined outside its wall; else its floor (the lowest air) and dome (the highest, before the
 * ground above caps it).
 */
export function chamberAt(ch, x, z) {
  const dx = x - ch.x, dz = z - ch.z;
  const d2 = dx * dx + dz * dz;
  const R = ch.r * 1.15 + 2;
  if (d2 >= R * R) return undefined;
  const d = Math.sqrt(d2);
  const ang = Math.atan2(dz, dx);
  const wall = ch.r * (1 + 0.12 * acuNoise(ch.seed, Math.cos(ang) * 2.2 + 50, Math.sin(ang) * 2.2 + 50)) + 1.6 * acuNoise((ch.seed + 7) >>> 0, x / 3.5, z / 3.5);
  if (d >= wall) return undefined;
  const t = d / wall;
  const floor = ch.arena && d < ch.arena ? ch.floor : ch.floor + Math.round(2 * acuNoise((ch.seed + 3) >>> 0, x / 9, z / 9) + ch.bowl * t * t * t);
  const dome = ch.floor + Math.round(ch.h * Math.sqrt(1 - t * t) + 3 * acuNoise((ch.seed + 5) >>> 0, x / 7, z / 7));
  return { floor, dome, t };
}

/** A chamber's floor at x z, or its own floor height outside its wall. */
const floorAt = (ch, x, z) => chamberAt(ch, Math.round(x), Math.round(z))?.floor ?? ch.floor;

/**
 * Everything the cave is made of, from the world's seed, the great chamber's middle and the first pad: { chambers,
 * tubes, cones, grid, box, statue, mouth, way }. A chamber is { x, z, r, floor, h, bowl, arena, seed, a }; a tube (a
 * passage, or the way in) is { pts, segs, len, w, h, y0, y1, open, box }; a cone (stalagmite or stalactite) is
 * { x, z, r, h, up, chamber }. `mouth` is where the way in meets the surface, `way` the way down it from there.
 */
export function caveLayout(seed, site, pad, k) {
  const c = k.cave;
  const main = { x: site.x, z: site.z, r: c.r, floor: c.floor, h: c.height, bowl: 8, arena: c.arena, seed: hash(S(seed, 2), site.x, site.z, 1), a: 0 };
  const chambers = [main];
  const tubes = [];
  const a0 = u(seed, 3, site.x, site.z) * Math.PI * 2;
  for (let i = 0; i < 4; i++) {
    const a = a0 + (i * Math.PI) / 2 + (u(seed, 4, i, 0) - 0.5) * 0.6;
    const r = c.sideR[0] + u(seed, 5, i, 0) * (c.sideR[1] - c.sideR[0]);
    const dist = c.r + r + c.gap + u(seed, 6, i, 0) * 8;
    chambers.push({
      x: Math.round(site.x + Math.cos(a) * dist), z: Math.round(site.z + Math.sin(a) * dist), r, a,
      floor: c.floor + 2 + Math.floor(u(seed, 7, i, 0) * 6), h: c.sideHeight[0] + Math.floor(u(seed, 8, i, 0) * (c.sideHeight[1] - c.sideHeight[0])), bowl: 5, arena: 0,
      seed: hash(S(seed, 9), i, site.x, site.z),
    });
  }
  // a narrow winding passage from the great chamber to each side chamber, its ends well inside both, each end's floor
  // a block over the chamber's there (so walking out of it the chamber's own floor takes over: no step to climb)
  for (let i = 1; i <= 4; i++) {
    const ch = chambers[i];
    const dx = Math.cos(ch.a), dz = Math.sin(ch.a);
    const dist = Math.hypot(ch.x - site.x, ch.z - site.z);
    const from = { x: site.x + dx * (c.r - 12), z: site.z + dz * (c.r - 12) };
    const to = { x: site.x + dx * (dist - ch.r + 10), z: site.z + dz * (dist - ch.r + 10) };
    const pts = [from];
    for (const f of [0.33, 0.66]) {
      const off = (u(seed, 10, i, f * 100) - 0.5) * 14;
      pts.push({ x: from.x + (to.x - from.x) * f - dz * off, z: from.z + (to.z - from.z) * f + dx * off });
    }
    pts.push(to);
    tubes.push(tube(pts, c.passage.w, c.passage.h, floorAt(main, from.x, from.z) + 1, floorAt(ch, to.x, to.z) + 1, false));
  }
  // the way in: from the surface down into the side chamber facing the first pad
  const toPad = Math.atan2(pad.z - site.z, pad.x - site.x);
  let side = chambers[1];
  for (const ch of chambers.slice(2)) if (angleGap(ch.a, toPad) < angleGap(side.a, toPad)) side = ch;
  const ox = Math.cos(side.a), oz = Math.sin(side.a);
  const start = { x: side.x + ox * (side.r - 10), z: side.z + oz * (side.r - 10) };
  const startY = floorAt(side, start.x, start.z) + 1;
  let len = c.entrance.minLength;
  let mouth = start;
  let top = 0;
  for (let i = 0; i < 4; i++) {
    mouth = { x: Math.round(start.x + ox * len), z: Math.round(start.z + oz * len) };
    top = groundAt(seed, mouth.x, mouth.z, k);
    len = Math.max(c.entrance.minLength, Math.ceil((top - startY) * c.entrance.run));
  }
  const bend = (u(seed, 11, side.x, side.z) - 0.5) * 16;
  const midPt = { x: (start.x + mouth.x) / 2 - oz * bend, z: (start.z + mouth.z) / 2 + ox * bend };
  tubes.push(tube([mouth, midPt, start], c.entrance.w, c.entrance.h, top - 1, startY, true));
  // stalagmites and stalactites
  const cones = [];
  chambers.forEach((ch, ci) => {
    const big = ci === 0;
    const n = big ? c.cones.main : c.cones.side;
    for (let j = 0; j < n.up + n.down; j++) {
      const up = j < n.up;
      const a = u(ch.seed, 12, j, 1) * Math.PI * 2;
      const lo = up ? ch.arena + 4 : 0;
      const d = lo + Math.sqrt(u(ch.seed, 13, j, 2)) * Math.max(1, ch.r - 7 - lo);
      const sz = u(ch.seed, 14, j, 3);
      const r = big ? (up ? 2 + sz * 3.5 : 1.5 + sz * 2.5) : 1.4 + sz * 2;
      const pillar = up && u(ch.seed, 15, j, 4) < c.cones.pillars;
      const h = pillar ? 999 : big ? (up ? 10 + sz * 34 : 8 + sz * 24) : 6 + sz * 15;
      const x = ch.x + Math.cos(a) * d, z = ch.z + Math.sin(a) * d;
      // none in the way of a passage or the way in (a stalactite over one may hang down into it)
      if (tubes.some((tb) => tubeDistance(tb, x, z).d < r + tb.w + 2)) continue;
      cones.push({ x, z, r, h, up, chamber: ci });
    }
  });
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const ch of chambers) {
    x0 = Math.min(x0, ch.x - ch.r * 1.15 - 4);
    z0 = Math.min(z0, ch.z - ch.r * 1.15 - 4);
    x1 = Math.max(x1, ch.x + ch.r * 1.15 + 4);
    z1 = Math.max(z1, ch.z + ch.r * 1.15 + 4);
  }
  for (const t of tubes) {
    x0 = Math.min(x0, t.box.x0);
    z0 = Math.min(z0, t.box.z0);
    x1 = Math.max(x1, t.box.x1);
    z1 = Math.max(z1, t.box.z1);
  }
  const grid = new Map();
  for (const cn of cones) {
    for (let gx = Math.floor((cn.x - cn.r) / 8); gx <= Math.floor((cn.x + cn.r) / 8); gx++) {
      for (let gz = Math.floor((cn.z - cn.r) / 8); gz <= Math.floor((cn.z + cn.r) / 8); gz++) {
        const key = `${gx},${gz}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(cn);
      }
    }
  }
  const back = Math.hypot(mouth.x - midPt.x, mouth.z - midPt.z) || 1;
  return {
    seed, site, pad, chambers, tubes, cones, grid,
    box: { x0: Math.floor(x0), z0: Math.floor(z0), x1: Math.ceil(x1), z1: Math.ceil(z1) },
    statue: { x: site.x, y: main.floor + 1, z: site.z },
    mouth: { x: mouth.x, y: top + 1, z: mouth.z },
    // facing down the way in from its mouth
    way: { x: (midPt.x - mouth.x) / back, z: (midPt.z - mouth.z) / back },
  };
}

function angleGap(a, b) {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
}

/** How far x z is from a tube's middle line (d), and how far along it that nearest point is (0 to 1). */
function tubeDistance(tb, x, z) {
  let d = Infinity, along = 0;
  for (const sg of tb.segs) {
    const ex = sg.b.x - sg.a.x, ez = sg.b.z - sg.a.z;
    const q = Math.max(0, Math.min(1, ((x - sg.a.x) * ex + (z - sg.a.z) * ez) / (ex * ex + ez * ez || 1)));
    const dd = Math.hypot(x - (sg.a.x + ex * q), z - (sg.a.z + ez * q));
    if (dd < d) {
      d = dd;
      along = (sg.at + q * sg.l) / tb.len;
    }
  }
  return { d, along };
}

function tube(pts, w, h, y0, y1, open) {
  let len = 0;
  const segs = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const l = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
    segs.push({ a: pts[i], b: pts[i + 1], l, at: len });
    len += l;
  }
  const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
  return { pts, segs, len, w, h, y0, y1, open, box: { x0: Math.min(...xs) - w - 2, z0: Math.min(...zs) - w - 2, x1: Math.max(...xs) + w + 2, z1: Math.max(...zs) + w + 2 } };
}

/** Whether any part of the cave reaches into the chunk (chunk x, chunk z). */
export function chunkHasCave(L, cx, cz) {
  const x0 = cx * 16, z0 = cz * 16, x1 = x0 + 15, z1 = z0 + 15;
  if (x1 < L.box.x0 || x0 > L.box.x1 || z1 < L.box.z0 || z0 > L.box.z1) return false;
  for (const ch of L.chambers) {
    const R = ch.r * 1.15 + 3;
    const nx = Math.max(x0, Math.min(ch.x, x1)), nz = Math.max(z0, Math.min(ch.z, z1));
    if ((nx - ch.x) ** 2 + (nz - ch.z) ** 2 < R * R) return true;
  }
  return L.tubes.some((t) => !(x1 < t.box.x0 || x0 > t.box.x1 || z1 < t.box.z0 || z0 > t.box.z1));
}

/**
 * The cave in the column at x z (its ground `ground`, the land's top `top`): { air, paint, tips, lichen }, or undefined
 * when the cave isn't in this column. `air` its open spaces [y0, y1, chamber index or -1 for a tube]; `paint` what to
 * paint over the land, in order (later over earlier): [y0, y1, block]; `tips` the points of dripstone ({ y, hanging });
 * `lichen` the y glow lichen grows at on the floor, if it does.
 */
export function caveColumn(L, x, z, ground, top) {
  const b = L.box;
  if (x < b.x0 || x > b.x1 || z < b.z0 || z > b.z1) return undefined;
  /** @type {[number, number, number][]} */
  const air = [];
  /** where the way in runs over a dip in the land: dripstone built up under it, a causeway (so it never steps) */
  const fills = [];
  L.chambers.forEach((ch, ci) => {
    const at = chamberAt(ch, x, z);
    if (!at) return;
    const ceil = Math.min(at.dome, ground - 10);
    if (ceil - at.floor >= 2) air.push([at.floor, ceil, ci]);
  });
  for (const tb of L.tubes) {
    if (x < tb.box.x0 || x > tb.box.x1 || z < tb.box.z0 || z > tb.box.z1) continue;
    const { d: best, along } = tubeDistance(tb, x + 0.5, z + 0.5); // from the column's middle
    const w = tb.w + 0.6 * acuNoise(L.seed, x / 3, z / 3);
    if (best > w) continue;
    // (a passage's floor wanders a block up and down, but not at its ends: there it meets the chambers' floors)
    const fl = Math.round(tb.y0 + (tb.y1 - tb.y0) * along + (tb.open ? 0 : Math.min(1, along * 8, (1 - along) * 8) * acuNoise((L.seed + 1) >>> 0, x / 6, z / 6)));
    let hi = fl + tb.h - (best > w - 1 ? 1 : 0);
    if (tb.open) {
      if (hi >= ground - 1) hi = Math.max(hi, top);
      if (fl - 1 > top) fills.push([top + 1, fl - 1]);
    } else hi = Math.min(hi, ground - 3);
    if (hi - fl >= 1) air.push([fl, hi, -1]);
  }
  if (!air.length) return undefined;
  const paint = [];
  const tips = [];
  for (const [a, b] of fills) paint.push([a, b, DRIP]);
  // dripstone over every face round the air (with tuff in it, and now and then copper), then the air itself
  for (const [a, c] of air) {
    for (const y of [a - 2, a - 1, c + 1, c + 2]) {
      if (y < 1 || y > top) continue;
      const n = hash(L.seed, x, y, z) % 100;
      paint.push([y, y, n < 3 ? COPPER : n < 28 ? TUFF : DRIP]);
    }
  }
  for (const [a, c] of air) paint.push([a, c, AIR]);
  // the great stalagmites and stalactites, in their own chambers
  const near = air.some((r) => r[2] === -1) ? [] : (L.grid.get(`${Math.floor(x / 8)},${Math.floor(z / 8)}`) ?? []);
  for (const cn of near) {
    const room = air.find((r) => r[2] === cn.chamber);
    if (!room) continue;
    const ex = x - cn.x, ez = z - cn.z;
    const d2 = ex * ex + ez * ez;
    if (d2 >= cn.r * cn.r) continue;
    const d = Math.sqrt(d2);
    const len = Math.round(Math.min(cn.h, 400) * Math.pow(1 - d / cn.r, 1.3));
    if (len < 1) continue;
    const [a, c] = room;
    if (cn.up) {
      const end = Math.min(c, a + len - 1);
      paint.push([a, end, DRIP]);
      if (d < 0.75 && end < c) tips.push({ y: end + 1, hanging: false });
    } else {
      const end = Math.max(a, c - len + 1);
      paint.push([end, c, DRIP]);
      if (d < 0.75 && end > a) tips.push({ y: end - 1, hanging: true });
    }
  }
  // the passages' ceilings hang with points
  for (const [a, c, ci] of air) if (ci === -1 && c - a >= 3 && c < ground - 1 && hash(L.seed, x, 17, z) % 5 === 0) tips.push({ y: c, hanging: true });
  // the dais, and the statue on it
  const st = L.statue;
  const sx = x - st.x, sz = z - st.z;
  const onDais = Math.abs(sx) <= 4 && Math.abs(sz) <= 4;
  if (onDais) {
    paint.push([st.y - 1, st.y - 1, Math.abs(sx) === 4 && Math.abs(sz) === 4 ? DAIS_CORNER : DAIS]);
    for (const [dx, dy, dz, blk] of statueCells()) if (dx === sx && dz === sz) paint.push([st.y + dy, st.y + dy, blk]);
  }
  // glow lichen on the chambers' floors, here and there
  let lichen;
  const room = air.find((r) => r[2] >= 0);
  if (room && !onDais && hash(L.seed, x, 23, z) % 28 === 0) lichen = room[0];
  return { air, paint, tips, lichen };
}

/** The block at y in runs [y0, y1, block] (bottom up, not overlapping), air where none is. */
export function blockAt(runs, y) {
  for (const [a, b, blk] of runs) if (y >= a && y <= b) return blk;
  return AIR;
}

/** `runs` (bottom up) with `block` painted over y0..y1, each run it covers cut round it. */
export function paintRuns(runs, y0, y1, block) {
  const out = [];
  let put = false;
  const place = () => {
    if (!put) out.push([y0, y1, block]);
    put = true;
  };
  for (const [a, b, blk] of runs) {
    if (b < y0) out.push([a, b, blk]);
    else if (a > y1) {
      place();
      out.push([a, b, blk]);
    } else {
      if (a < y0) out.push([a, y0 - 1, blk]);
      place();
      if (b > y1) out.push([y1 + 1, b, blk]);
    }
  }
  place();
  // runs of the same block side by side as one
  const merged = [];
  for (const r of out) {
    const last = merged[merged.length - 1];
    if (last && last[2] === r[2] && last[1] + 1 === r[0]) last[1] = r[1];
    else merged.push([r[0], r[1], r[2]]);
  }
  return merged;
}

/**
 * Where the column's runs `to` differ from what is there already (`from`; air where neither has a run): the runs to
 * set, each with to's block (air included).
 */
export function diffRuns(to, from) {
  const cuts = new Set();
  for (const [a, b] of to) cuts.add(a).add(b + 1);
  for (const [a, b] of from) cuts.add(a).add(b + 1);
  const ys = [...cuts].sort((p, q) => p - q);
  const out = [];
  for (let i = 0; i + 1 < ys.length; i++) {
    const a = ys[i], b = ys[i + 1] - 1;
    const want = blockAt(to, a);
    if (want === blockAt(from, a)) continue;
    const last = out[out.length - 1];
    if (last && last[2] === want && last[1] + 1 === a) last[1] = b;
    else out.push([a, b, want]);
  }
  return out;
}

/**
 * A cave column worked into the land's: `land` the land's runs over the deep rock (1..floor deepslate), `cave` its
 * caveColumn, `again` whether the land is built there already (else only the deep rock is, filled first). Returns
 * { set: the runs to set, tips: [{ y, hanging }], lichen: a y or undefined, cut: whether the land's own top is gone }.
 */
export function caveWork(land, floor, cave, landTop, again) {
  const deep = [[1, floor, DEEP], ...land];
  let fin = deep;
  for (const [y0, y1, blk] of cave.paint) fin = paintRuns(fin, y0, y1, blk);
  const set = diffRuns(fin, again ? deep : [[1, floor, DEEP]]);
  const tips = cave.tips.filter((t) => blockAt(fin, t.y) === AIR && blockAt(fin, t.hanging ? t.y + 1 : t.y - 1) !== AIR);
  const lichen = cave.lichen !== undefined && blockAt(fin, cave.lichen) === AIR && blockAt(fin, cave.lichen - 1) !== AIR && !tips.some((t) => t.y === cave.lichen) ? cave.lichen : undefined;
  return { set, tips, lichen, cut: blockAt(fin, landTop) === AIR };
}

/** Which way from one place (x z) to another, in words: "north", "north-east", and so on (north is -z). */
export function compass(from, to) {
  const a = Math.atan2(to.x - from.x, -(to.z - from.z)); // 0 north, then clockwise
  const names = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return names[((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8];
}
