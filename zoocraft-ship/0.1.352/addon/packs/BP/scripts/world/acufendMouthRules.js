// 0.1.352: the mouth of the great cave's way in, made easy to find (Austin, 2026-11-21: "There should also be a cave
// opening in the surface that leads down to it so its not all luck"). The way in (world/acufendCaveRules.js) came up
// as a trench five blocks across, easy to walk past. Now the land round its first stretch is cut back into a wide
// hollow that funnels down to it, ending in a rock face with the tunnel's dark opening in it; and four tall standing
// stones of dripstone, each crowned with pale purple light, stand round it, to be seen from far off. Pure: the rules
// say what to cut and where the stones stand; world/acufend.js does it once in each world, after the moon is built
// (and in worlds whose moon was built before this).
import { tubeDistance, DRIP } from "./acufendCaveRules.js";

const TUFF = "minecraft:tuff";
import { hash } from "../fishing/islandRules.js";

export const MOUTH_LIGHT = "minecraft:pearlescent_froglight";
/** The version of the mouth's shape (kept with the moon: a world with an older one, or none, has it made). */
export const MOUTH_V = 1;

/** The point `s` blocks along a tube from its first point, and the way it runs there: { x, z, ux, uz }. */
export function alongTube(tb, s) {
  const at = Math.max(0, Math.min(tb.len, s));
  let sg = tb.segs[tb.segs.length - 1];
  for (const g of tb.segs) {
    if (at <= g.at + g.l) {
      sg = g;
      break;
    }
  }
  const q = sg.l ? (at - sg.at) / sg.l : 0;
  return { x: sg.a.x + (sg.b.x - sg.a.x) * q, z: sg.a.z + (sg.b.z - sg.a.z) * q, ux: (sg.b.x - sg.a.x) / (sg.l || 1), uz: (sg.b.z - sg.a.z) / (sg.l || 1) };
}

/** The way in's floor (its lowest air) `s` blocks down it from its mouth. */
export function wayFloor(tb, s) {
  return Math.round(tb.y0 + (tb.y1 - tb.y0) * (Math.max(0, Math.min(tb.len, s)) / tb.len));
}

/**
 * The hollow and the stones: { cols, stones, box }. cols: [{ x, z, floor }]: in that column everything from `floor` up
 * is cleared (the hollow's side there; over the way in itself, its own floor), and the block under `floor`, if there
 * is one, is faced with dripstone or tuff (`face`). stones: [{ x, z, h }], standing on the land as it is there. box:
 * { from, to } all of it lies in (level).
 */
export function mouthPlan(L, k) {
  const g = k.cave.mouth;
  const tb = L.tubes.find((t) => t.open);
  const cols = [];
  const R = Math.ceil(tb.w + g.flare + 2);
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (let s = 0; s <= g.length; s += 2) {
    const p = alongTube(tb, s);
    x0 = Math.min(x0, p.x - R);
    z0 = Math.min(z0, p.z - R);
    x1 = Math.max(x1, p.x + R);
    z1 = Math.max(z1, p.z + R);
  }
  x0 = Math.floor(x0);
  z0 = Math.floor(z0);
  x1 = Math.ceil(x1);
  z1 = Math.ceil(z1);
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const { d, along } = tubeDistance(tb, x + 0.5, z + 0.5);
      const s = along * tb.len;
      if (s > g.length) continue;
      const lat = Math.max(0, d - (tb.w - 0.6));
      if (lat > g.flare) continue;
      const n = hash(L.seed, x, 31, z) % 100;
      cols.push({ x, z, floor: wayFloor(tb, s) + Math.ceil(lat * g.slope), face: n < 30 ? TUFF : DRIP });
    }
  }
  // the stones: two either side of where the hollow begins, two on the rock face over the tunnel
  const stones = [];
  const st = g.stones;
  [[0, st.gate], [g.length + st.back, tb.w + g.flare * 0.6]].forEach(([s, side], i) => {
    const p = alongTube(tb, Math.min(s, tb.len));
    const over = s - Math.min(s, tb.len);
    for (const sg of [-1, 1]) {
      const x = Math.round(p.x + p.ux * over - p.uz * side * sg), z = Math.round(p.z + p.uz * over + p.ux * side * sg);
      stones.push({ x, z, h: st.height[0] + (hash(L.seed, x, 37 + i, z) % (st.height[1] - st.height[0] + 1)) });
    }
  });
  for (const s of stones) {
    x0 = Math.min(x0, s.x - 2);
    z0 = Math.min(z0, s.z - 2);
    x1 = Math.max(x1, s.x + 2);
    z1 = Math.max(z1, s.z + 2);
  }
  return { cols, stones, box: { from: { x: x0, z: z0 }, to: { x: x1, z: z1 } } };
}

/**
 * A standing stone on ground whose top block is at `top`: [x, y0, y1, z, block] runs. Three by three at the foot
 * (from two blocks under the ground, so it stands on a slope), its middle the full height, its sides six tenths, its
 * corners a third; pale light on the middle and on each side.
 */
export function stoneRuns(stone, top) {
  const out = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const corner = dx !== 0 && dz !== 0, mid = dx === 0 && dz === 0;
      const h = Math.max(2, Math.round(stone.h * (mid ? 1 : corner ? 0.33 : 0.6)));
      out.push([stone.x + dx, top - 2, top + h - 1, stone.z + dz, DRIP]);
      if (!corner) out.push([stone.x + dx, top + h, top + h, stone.z + dz, MOUTH_LIGHT]);
    }
  }
  return out;
}
