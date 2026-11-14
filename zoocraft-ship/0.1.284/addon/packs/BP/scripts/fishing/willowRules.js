// The exotic islands' willows, built block by block (0.1.284). Austin, 14 Nov: "make the willows look more like willows,
// even if you have to use custom blocks. I want them to be very detailed willows as well." Until now they were the
// game's tree shapes (a cherry's crown on an oak trunk) with strands under them. Each willow here is worked out from
// its own seed: a thick trunk that leans toward the water, flared roots, boughs that arch up and out and droop at
// their ends, twigs off them, a crown of leaves along every bough (some with catkins), and long drapes hanging from
// the crown, longest at its rim, down to just above the ground or the water. Pure: no engine calls.

/** The blocks a willow is made of: its bark (trunk, boughs and twigs), leaves, leaves with catkins, drapes, and roots. */
export const WILLOW = Object.freeze({
  wood: "zoocraft:willow_bark",
  leaves: "zoocraft:weeping_willow_leaves",
  catkins: "zoocraft:willow_catkin_leaves",
  drape: "zoocraft:willow_drape",
  roots: "minecraft:mangrove_roots",
});
/** The drape's state: its last block is a tip. */
export const DRAPE_TIP = "zoocraft:tip";

/** How far a willow's crown reaches from its trunk, at most (its longest bough over the water, its leaves and a twig). */
export const WILLOW_REACH = Object.freeze({ great: 18, small: 11 });

const key = (x, y, z) => `${x},${y},${z}`;

/**
 * A willow's cells, from its trunk's foot (0 0 0, the first block above the ground; a great willow's trunk is 2 by 2:
 * 0..1 each way). `u(a, b)` is the tree's own random number, 0 to 1, the same for the same a b. `lean` [x, z] is the
 * way to the water (a unit vector, or [0, 0]). `floorAt(dx, dz)` is the lowest free cell of that column (the first
 * above its ground, or above the water), from the foot's height, or undefined where there is no ground under it;
 * `wetAt(dx, dz)` whether that column is water (no root goes onto it).
 * Returns { wood: [[x, y, z]], roots: [[x, y, z]], leaves: [[x, y, z, catkins]], drapes: [[x, y, z, tip]], top: its
 * highest block, reach: how far out it goes }.
 */
export function willowCells(u, great, lean, floorAt, wetAt = (/** @type {number} */ _dx, /** @type {number} */ _dz) => false) {
  const wood = new Set();
  const leaves = new Map();
  const c0 = great ? 0.5 : 0;
  const H = great ? 9 + Math.floor(u(0, 1) * 3) : 6 + Math.floor(u(0, 1) * 2);
  const L = great ? 2.6 : 1.5;
  const centre = (dy) => {
    const f = (dy / H) ** 2;
    return [c0 + lean[0] * L * f, c0 + lean[1] * L * f];
  };
  // the trunk: wide at the foot, then 2 by 2 (a great one) or 1 (a small one), bending toward the water as it rises
  for (let dy = 0; dy <= H; dy++) {
    const [cx, cz] = centre(dy);
    const r = great ? (dy < 2 ? 1.6 : 0.9) : dy < 1 ? 1.0 : 0.75;
    for (let dz = -2; dz <= 3; dz++) {
      for (let dx = -2; dx <= 3; dx++) {
        if (Math.hypot(dx - cx, dz - cz) <= r) wood.add(key(dx, dy, dz));
      }
    }
  }
  const [tx, tz] = centre(H);
  // the roots: flares out from the foot, following the ground down
  const roots = [];
  const nr = great ? 6 : 4;
  const ra = u(0, 2) * Math.PI * 2;
  for (let i = 0; i < nr; i++) {
    const a = ra + (i * 2 * Math.PI) / nr + (u(1, i) - 0.5) * 0.6;
    const len = (great ? 3 : 2) + Math.floor(u(2, i) * 2);
    for (let d = great ? 2 : 1; d <= len + (great ? 1 : 0); d++) {
      const x = Math.round(c0 + Math.cos(a) * d);
      const z = Math.round(c0 + Math.sin(a) * d);
      const f = floorAt(x, z);
      if (f === undefined || f > 1 || f < -2 || wetAt(x, z) || wood.has(key(x, f, z))) break;
      roots.push([x, f, z]);
    }
  }
  // the boughs: up and out in an arch, down again at their ends; longer over the water; twigs off them
  const points = [];
  const line = (x, y, z) => wood.add(key(Math.round(x), Math.round(y), Math.round(z)));
  const nb = great ? 6 + Math.floor(u(0, 3) * 2) : 4 + Math.floor(u(0, 3) * 2);
  const ba = u(0, 4) * Math.PI * 2;
  for (let i = 0; i < nb; i++) {
    const a = ba + (i * 2 * Math.PI) / nb + (u(3, i) - 0.5) * 0.5;
    const over = Math.cos(a) * lean[0] + Math.sin(a) * lean[1];
    const len = ((great ? 7 : 4.5) + u(4, i) * (great ? 3.5 : 2)) * (1 + 0.3 * Math.max(0, over));
    const rise = (great ? 3.2 : 2.2) + u(5, i) * (great ? 2 : 1);
    const h = (t) => rise * (1 - (2 * t - 0.9) ** 2 / 0.81);
    const steps = Math.ceil(len * 2);
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const x = tx + Math.cos(a) * len * t;
      const z = tz + Math.sin(a) * len * t;
      const y = H + h(t);
      line(x, y, z);
      if (great && t < 0.4) line(x, y - 1, z);
      if (t >= 0.3) points.push([x, y, z, great ? 2.1 : 1.7]);
    }
    for (const [k, t0] of [[0, 0.5], [1, 0.78]]) {
      const side = (k ? 1 : -1) * (u(6, i) < 0.5 ? 1 : -1);
      const ta = a + side * (0.7 + u(7 + k, i) * 0.4);
      const tl = (great ? 4 : 2.5) + u(9 + k, i) * 1.5;
      const bx = tx + Math.cos(a) * len * t0;
      const bz = tz + Math.sin(a) * len * t0;
      const by = H + h(t0);
      const n = Math.ceil(tl * 2);
      for (let j = 1; j <= n; j++) {
        const d = (tl * j) / n;
        const x = bx + Math.cos(ta) * d;
        const z = bz + Math.sin(ta) * d;
        const y = by - d * 0.35;
        line(x, y, z);
        points.push([x, y, z, great ? 1.8 : 1.5]);
      }
    }
  }
  // the crown: leaves round every bough and twig past its first third, and a dome over the trunk's top
  points.push([tx, H + (great ? 3.6 : 2.6), tz, great ? 3.4 : 2.6]);
  const cell = (x, y, z) => u(40 + ((x * 7 + z * 13 + y * 29) & 63), (x * 31 + z * 17 + y * 5) | 0);
  for (const [px, py, pz, r] of points) {
    const R = Math.ceil(r);
    for (let dy = 0; dy <= R; dy++) {
      for (let dz = -R; dz <= R; dz++) {
        for (let dx = -R; dx <= R; dx++) {
          const x = Math.round(px) + dx;
          const y = Math.round(py) + dy;
          const z = Math.round(pz) + dz;
          const q = (x - px) ** 2 + (z - pz) ** 2 + ((y - py) * 1.7) ** 2;
          if (q > r * r) continue;
          const k = key(x, y, z);
          if (wood.has(k) || leaves.has(k)) continue;
          const rnd = cell(x, y, z);
          // a ragged outside: some of the outermost leaves are left out
          if (q > (r - 0.9) ** 2 && rnd < 0.16) continue;
          leaves.set(k, [x, y, z, rnd > 0.88]);
        }
      }
    }
  }
  // no bare bough shows from above: a leaf over every bough block that has nothing on it
  for (const k of wood) {
    const [x, y, z] = k.split(",").map(Number);
    if (y <= H) continue;
    const up = key(x, y + 1, z);
    if (!wood.has(up) && !leaves.has(up)) leaves.set(up, [x, y + 1, z, cell(x, y + 1, z) > 0.88]);
  }
  // the drapes: under the lowest leaf of a column, longest at the crown's rim, to just above the ground or the water
  const low = new Map();
  let reach = 0;
  let top = H;
  for (const [x, y, z] of leaves.values()) {
    const k = `${x},${z}`;
    const had = low.get(k);
    if (!had || y < had[1]) low.set(k, [x, y, z]);
    reach = Math.max(reach, Math.hypot(x - tx, z - tz));
    top = Math.max(top, y);
  }
  const drapes = [];
  for (const [x, y, z] of low.values()) {
    const e = Math.hypot(x - tx, z - tz) / reach;
    const rnd = cell(x, -9, z);
    if (rnd > 0.3 + 0.7 * e * e) continue;
    let n = Math.round(((great ? 3 : 2) + e * e * (great ? 13 : 8)) * (0.6 + 0.4 * cell(x, -8, z)));
    const f = floorAt(x, z);
    // one clear block above the ground or the water; over the island's edge, no longer than 6
    n = Math.min(n, f === undefined ? 6 : y - 1 - f);
    for (let j = 1; j <= n; j++) {
      if (wood.has(key(x, y - j, z)) || leaves.has(key(x, y - j, z))) {
        n = j - 1;
        break;
      }
    }
    for (let j = 1; j <= n; j++) drapes.push([x, y - j, z, j === n]);
  }
  return {
    wood: [...wood].map((k) => k.split(",").map(Number)),
    roots,
    leaves: [...leaves.values()],
    drapes,
    top,
    reach: Math.ceil(reach),
  };
}
