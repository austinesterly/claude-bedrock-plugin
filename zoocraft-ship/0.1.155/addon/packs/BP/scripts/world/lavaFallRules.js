// The Lava Falls' springs (0.1.141; 0.1.155 falls onto the land too; module 8 biomes, research/biomes_plan.md), pure.
// Lava made with the world never flows (no block update reaches it), so the biome's roof and walls get lava spring
// blocks instead (BP features lava_falls_*_spring), which world/lavaFalls.js turns into lava the first time their chunk
// runs. A spring is set into the roof or a wall (0.1.155) and pours out of its open side, or each of them. Its fall is
// kept only where every stream drops straight down at least MIN_DROP blocks into the lava sea, or at least
// MIN_LAND_DROP onto the ground, where it first lets a pool of lava into the ground for the fall to land in
// (planPool): sunk into level ground, sealed all round and underneath, so the lava never runs off across the land.
// Anywhere else the spring becomes netherrack.

export const MIN_DROP = 8; // a fall into the lava sea
export const MIN_LAND_DROP = 6; // a fall onto the ground, into the pool it makes
export const MAX_DROP = 120;
// The open sides a spring pours out of: below, then the four sides.
export const OPEN_SIDES = [
  { x: 0, y: -1, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 0, y: 0, z: 1 },
  { x: 0, y: 0, z: -1 },
];
export const AIR = "minecraft:air";
// What a fall drops through and lava burns away: air and the Nether's small plants and fire.
export const SOFT = [
  AIR,
  "minecraft:warped_roots",
  "minecraft:crimson_roots",
  "minecraft:nether_sprouts",
  "minecraft:twisting_vines",
  "minecraft:weeping_vines",
  "minecraft:warped_fungus",
  "minecraft:crimson_fungus",
  "minecraft:brown_mushroom",
  "minecraft:red_mushroom",
  "minecraft:fire",
  "minecraft:soul_fire",
];
export const LAVA = ["minecraft:lava", "minecraft:flowing_lava"];
// The ground a pool may be let into.
export const FLOOR = [
  "minecraft:netherrack",
  "minecraft:warped_nylium",
  "minecraft:crimson_nylium",
  "minecraft:soul_sand",
  "minecraft:soul_soil",
  "minecraft:blackstone",
  "minecraft:basalt",
  "minecraft:magma",
  "minecraft:gravel",
];
// A pool: the level floor within POOL_R2 (squared) of the fall's foot that joins up with the foot, leaving out any block
// next to lower ground (an open block at the pool's height, which the lava would run into); the middle of it (within
// DEEP_R2) two blocks deep where the floor goes on down. Netherrack and nylium round its rim turn to magma, one in
// RIM_MAGMA.
export const POOL_R2 = 5;
export const DEEP_R2 = 1;
export const RIM_MAGMA = 0.4;
export const RIM_TO_MAGMA = ["minecraft:netherrack", "minecraft:warped_nylium", "minecraft:crimson_nylium"];
export const CLEAR_UP = 32; // plants (twisting vines) cleared over a pool, at most this high

const soft = (t) => SOFT.includes(t);
const lava = (t) => LAVA.includes(t);
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

/**
 * What the fall from a spring at `at` lands on: each stream's foot and drop, or "wait" (a block not loaded yet) or
 * "rock" (no fall here). `get(x, y, z)` is the block's type id there, undefined where not loaded.
 * @param {{x: number, y: number, z: number}} at
 * @param {(x: number, y: number, z: number) => string | undefined} get
 */
export function springStreams(at, get) {
  const open = [];
  for (const o of OPEN_SIDES) {
    const t = get(at.x + o.x, at.y + o.y, at.z + o.z);
    if (t === undefined) return "wait";
    if (t === AIR) open.push(o);
  }
  if (!open.length) return "rock";
  const streams = [];
  for (const o of open) {
    const top = add(at, o);
    if (o.y === 0) {
      // Out of a side it falls only if there's air under that block, else it would run along the ground or a ledge.
      const under = get(top.x, top.y - 1, top.z);
      if (under === undefined) return "wait";
      if (under !== AIR) return "rock";
    }
    let drop = 0;
    let y = o.y === 0 ? top.y - 1 : top.y;
    let land;
    for (; drop <= MAX_DROP; y--, drop++) {
      const t = get(top.x, y, top.z);
      if (t === undefined) return "wait";
      if (!soft(t)) {
        land = t;
        break;
      }
    }
    if (land === undefined) return "rock";
    streams.push({ foot: { x: top.x, y, z: top.z }, land, drop: drop + (o.y === 0 ? 1 : 0) });
  }
  return streams;
}

/**
 * What a spring becomes, from its streams: "sea" (a fall into the lava sea), "pool" (a fall onto the ground, if a pool
 * fits there) or "rock". Every stream has to agree: all into lava at least MIN_DROP down, or all onto the floor at one
 * height at least MIN_LAND_DROP down.
 * @param {Array<{foot: {x: number, y: number, z: number}, land: string, drop: number}>} streams
 */
export function springFate(streams) {
  if (!streams.length) return "rock";
  if (streams.every((s) => lava(s.land) && s.drop >= MIN_DROP)) return "sea";
  const y = streams[0].foot.y;
  if (streams.every((s) => FLOOR.includes(s.land) && s.foot.y === y && s.drop >= MIN_LAND_DROP)) return "pool";
  return "rock";
}

/**
 * The pool a fall lands in: the blocks to turn to lava, the plants over it to clear (top first) and the rim blocks
 * to turn to magma; "wait" (not loaded) or null (no pool fits: a foot is next to lower ground or over a hollow). `feet`
 * are the streams' feet (the floor blocks they land on), the first the middle.
 * @param {Array<{x: number, y: number, z: number}>} feet
 * @param {(x: number, y: number, z: number) => string | undefined} get
 * @param {() => number} rand
 */
export function planPool(feet, get, rand) {
  const c = feet[0];
  const y0 = c.y;
  const key = (x, z) => `${x},${z}`;
  const N = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  // The level floor round the foot (open over it, solid under it), and lava already there.
  const cand = new Map(); // x,z -> { x, z, was }
  const R = Math.floor(Math.sqrt(POOL_R2));
  for (let dx = -R; dx <= R; dx++)
    for (let dz = -R; dz <= R; dz++) {
      if (dx * dx + dz * dz > POOL_R2) continue;
      const x = c.x + dx, z = c.z + dz;
      const t0 = get(x, y0, z), t1 = get(x, y0 + 1, z), tb = get(x, y0 - 1, z);
      if (t0 === undefined || t1 === undefined || tb === undefined) return "wait";
      if (lava(t0) || (FLOOR.includes(t0) && soft(t1) && !soft(tb))) cand.set(key(x, z), { x, z, was: t0 });
    }
  // Left out: floor next to lower ground.
  for (const [k, m] of [...cand]) {
    if (lava(m.was)) continue;
    for (const [dx, dz] of N) {
      const t = get(m.x + dx, y0, m.z + dz);
      if (t === undefined) return "wait";
      if (soft(t)) {
        cand.delete(k);
        break;
      }
    }
  }
  // The pool: what joins up with the foot.
  const member = new Map();
  const todo = [key(c.x, c.z)];
  while (todo.length) {
    const k = todo.pop();
    const m = cand.get(k);
    if (!m || member.has(k)) continue;
    member.set(k, m);
    for (const [dx, dz] of N) todo.push(key(m.x + dx, m.z + dz));
  }
  for (const f of feet) if (f.y !== y0 || !member.has(key(f.x, f.z))) return null;
  const lavaAt = [], air = [], magma = [];
  const rim = new Map();
  for (const m of member.values()) {
    if (lava(m.was)) continue;
    lavaAt.push({ x: m.x, y: y0, z: m.z });
    // Two deep in the middle where the floor goes on down and nothing open is beside or under the second block.
    const dx = m.x - c.x, dz = m.z - c.z;
    if (dx * dx + dz * dz <= DEEP_R2 && FLOOR.includes(get(m.x, y0 - 1, m.z) ?? "")) {
      const under = get(m.x, y0 - 2, m.z);
      if (under === undefined) return "wait";
      let deep = !soft(under);
      for (const [ex, ez] of N) {
        const t = get(m.x + ex, y0 - 1, m.z + ez);
        if (t === undefined) return "wait";
        if (soft(t)) deep = false;
      }
      if (deep) lavaAt.push({ x: m.x, y: y0 - 1, z: m.z });
    }
    for (const [ex, ez] of N) {
      const x = m.x + ex, z = m.z + ez;
      if (member.has(key(x, z))) continue;
      const t = get(x, y0, z);
      if (t === undefined) return "wait";
      if (RIM_TO_MAGMA.includes(t)) rim.set(key(x, z), { x, y: y0, z });
    }
    const col = [];
    for (let y = y0 + 1; y <= y0 + CLEAR_UP; y++) {
      const t = get(m.x, y, m.z);
      if (t === undefined) return "wait";
      if (t === AIR || !soft(t)) break;
      col.push({ x: m.x, y, z: m.z });
    }
    air.push(...col.reverse());
  }
  for (const r of rim.values()) if (rand() < RIM_MAGMA) magma.push(r);
  return { lava: lavaAt, air, magma };
}

/** @typedef {{x: number, y: number, z: number}} Cell */
/**
 * All a spring does: { kind: "wait" } | { kind: "rock" } | { kind: "sea" | "pool", lava, air, magma, touch } where
 * touch is the open side to set and clear, which starts the fall.
 * @param {Cell} at
 * @param {(x: number, y: number, z: number) => string | undefined} get
 * @param {() => number} rand
 * @returns {{ kind: "wait" } | { kind: "rock" } | { kind: "sea" | "pool", lava: Cell[], air: Cell[], magma: Cell[], touch: Cell }}
 */
export function springPlan(at, get, rand) {
  const streams = springStreams(at, get);
  if (streams === "wait") return { kind: "wait" };
  if (streams === "rock") return { kind: "rock" };
  const fate = springFate(streams);
  if (fate === "rock") return { kind: "rock" };
  const first = OPEN_SIDES.find((o) => get(at.x + o.x, at.y + o.y, at.z + o.z) === AIR);
  const touch = add(at, first);
  if (fate === "sea") return { kind: "sea", lava: [], air: [], magma: [], touch };
  const pool = planPool(streams.map((s) => s.foot), get, rand);
  if (pool === "wait") return { kind: "wait" };
  if (pool === null) return { kind: "rock" };
  return { kind: "pool", ...pool, touch };
}
