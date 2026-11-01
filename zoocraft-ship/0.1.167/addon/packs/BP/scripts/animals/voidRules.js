// The Voidling (0.1.167, module 11's third rare mob: research/mobhouse_plan.md "0.1.167 Voidling: the design"), pure: its
// fight's numbers (a sixth kind in the boss framework, animals/boss.js: never killed, its health worn down to a quarter
// and no further, when it crouches down panting and the Passivity Serum takes), the grab (Austin's, 2026-10-22: after a
// one second shriek it grabs someone in front of it and walks them slowly to the island's edge, to let go of them over
// the void; any hit on it breaks the grab), the way to the edge it walks, where its rifts are made (the outer End
// islands, near an edge), the rift's blocks, and its zoo day (animals/yeti.js plays it, as the zoo yeti's). Hostile, as
// the Cyclops: anyone in Survival or Adventure who comes within 10 blocks starts a fight (sneaking, within 4). The grab
// itself, a step a tick, is animals/voidling.js.

import { YETI_ACT, ZOO_DAY, lairFrame, seeded } from "./bossRules.js";

export const WILD_VOID = "zoocraft:wild_voidling";
export const CALM_VOID = "zoocraft:calm_voidling";
export const ZOO_VOID = "zoocraft:zoo_voidling";
export const VOID_ORB = "zoocraft:voidling_orb";

// What it is doing (its zoocraft:act entity property), the yeti's numbers (RP voidling.animation_controllers.json): 1 the
// claw rake, 3 the void orb, 4 the shriek, 5 eat, 6 tired (crouched, panting), 7 crouch (resting), 8 sleep (crouched,
// head bowed), 9 the wisp (a zoo voidling stretching up to let a violet wisp float off its fingers); and its own: 10 the
// grab (the shriek with its arms thrown wide, then the lunge), 11 dragging (its arms held out in front, walking), 12
// letting go (its arms flung open), 13 staggering back (the grab broken by a hit). (2, the yeti's slam, it has none.)
export const VOID_ACT = { ...YETI_ACT, grab: 10, drag: 11, letgo: 12, stagger: 13 };

// Its fight (as YETI in animals/bossRules.js, with its own numbers). Ticks are game ticks (20 a second); blocks.
export const VOID = {
  energy: 80, // its health: the boss bar
  tiredAt: 20, // a quarter: it crouches down panting, can't be hurt, and the Passivity Serum takes
  angryAt: 40, // half: the void shriek, then faster
  ring: 28, // a fight goes on while a Survival player is this near its rift's middle
  provoke: 10, // a Survival or Adventure player this near starts a fight (hostile)
  sneakProvoke: 4, // ... or this near, sneaking
  hostile: true, // a fight goes on while someone is within its provoke reach, hit or not
  noHitTicks: 1200, // a minute with no hit and nobody that near ends a fight
  recoverTicks: 1200, // tired, with nobody within the ring for a minute: it gets up rested
  regenPerSecond: 1, // health back while calm
  roarTicks: 40, // the opening shriek (the art's, 2.0 s; the cry at 0.6 s)
  every: 50, // a move every 2.5 seconds while it fights (1.7 angry), the first a second after the shriek
  everyAngry: 34,
  firstMove: 20,
  gapTicks: 4,
  moves: {
    // Near, in front: a long arm drawn back (0.7 s) and swept across its front: 5, a push (guarded: never off the island).
    swipe: { reach: 3.8, arc: 70, strikeAt: 14, ticks: 26, damage: 5, knock: { h: 0.8, v: 0.3 } },
    // Near, in front: the grab. The shriek with its arms thrown wide (1 second: the warning), then the lunge; someone
    // still within its reach in front of it (and in Survival or Adventure) is grabbed. A miss: the lunge plays out.
    grab: { reach: 3.5, arc: 80, high: 2, strikeAt: 20, ticks: 30 },
    // Far: a violet orb grown between its hands (0.9 s) and flung, flying slowly (9 blocks a second) and straight (no
    // drop): 4 on a hit (the
    // projectile's), 3 seconds of Darkness and a little push (guarded). Step aside and it misses.
    hurl: { min: 5, max: 20, strikeAt: 18, ticks: 28, damage: 4, knock: { h: 0.3, v: 0.1 }, speed: 0.45, gravity: 0, darkTicks: 60 },
  },
  // The grab: whom it holds `hold` blocks in front of it, `lift` off the ground, as it walks `pace` blocks a tick (about
  // 1.1 a second) along its way to the edge; there it holds them out over the void and lets go (`letgoTicks`, its arms
  // flung open). Broken (any player's hit on it): it staggers back (`staggerTicks`) and they are put down, pushed back
  // toward the island (`free`). It lets go where it is if its way is blocked for `stuckTicks`, after `maxTicks`
  // whatever, and if the one it holds is more than `leash` from where it last held them (an ender pearl or a chorus
  // fruit). No grab within `cooldown` of the last one ending. `chance`: how often a grab is picked when one can be made.
  grab: { hold: 1.3, lift: 0.3, pace: 0.055, maxTicks: 320, stuckTicks: 40, cooldown: 200, leash: 2.5, letgoTicks: 14, staggerTicks: 16, chance: 0.6, free: { h: 0.6, v: 0.25 } },
  // Its way to the edge (edgeRoute): looked for along `rays` ways round it, a sample every `step` out to `far`; the
  // ground may rise `up` and fall `down` from one sample to the next; the edge is a sample with no block in its column,
  // and `beyond` more past it with none (a real edge, not a hole). It stops `stop` short of the first empty sample.
  route: { rays: 16, far: 14, step: 0.5, up: 1, down: 3, beyond: 3, stop: 0.9 },
  // Angry at half health: the void shriek (2.2 s); at 1 s everyone within 10 is slowed, in Darkness and pushed back a
  // little (guarded).
  angry: { ticks: 44, blastAt: 20, radius: 10, slowTicks: 60, slowLevel: 1, darkTicks: 80, knock: { h: 0.6, v: 0.2 } },
  // The orb leaves from between its hands (the art: thrust out in front), started a little nearer so it is never inside
  // a wall in front of it.
  throwFrom: { ahead: 1.2, up: 1.6 },
  // Calm: a low hum now and then; at night to the crying obsidian in its rift's middle, to crouch there head bowed.
  calmRoarChance: 0.003,
  calmRoarTicks: 40,
  denArrive: 1.5,
  denGiveUp: 600,
  // Rifts: very rare, one to a wide area (as the Cyclops's camps and the Necromancer's crypts).
  spacing: 1500,
  // On the outer islands (more than `outer` from the End's middle), the ground level over the rift (within `level`), the
  // void within `edge` of its middle (rifts are made near an island's edge).
  site: { min: 16, max: 40, parks: 160, level: 3, tries: 40, edge: 14, outer: 800 },
  lookAgain: 600, // 30 seconds before a player is looked round for a rift again after a look that found no site
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16,
  lairEvery: 100,
};

// Its place: the outer End islands. Bedrock's End is one biome ("the_end"), so the islands are told by how far out they
// are: more than VOID.site.outer blocks from the End's middle (as the Baby Dragon's, animals/babyDragonRules.js
// outerEnd).
export const VOID_BIOME_TAG = "the_end";
/** @param {{ x: number, z: number }} p */
export function outerIslands(p, outer = VOID.site.outer) {
  return Math.hypot(p.x, p.z) > outer;
}
// A rift keeps away from every other lair (a Baby Dragon's on the same islands): this far between their middles.
export const RIFT_APART = 40;

// The way a yaw faces, as a unit vector along the ground (bossRules.js aheadOf's).
/** @param {number} yaw */
export function yawDir(yaw) {
  const r = (yaw * Math.PI) / 180;
  return { x: -Math.sin(r), z: Math.cos(r) };
}

// --- Its moves -----------------------------------------------------------------------------------------------------
// Which move, `dist` from its target: the grab when they are within its reach and `grabOk()` (no cooldown, a way to the
// edge: worked out only when the grab is picked), else the rake; the orb when they are 5 to 20 off; else none (it
// closes in).
/** @param {number} dist @param {() => boolean} grabOk @param {() => number} [rand] */
export function pickVoidMove(dist, grabOk, rand = Math.random, R = VOID) {
  const M = R.moves;
  if (dist <= M.grab.reach && rand() < R.grab.chance && grabOk()) return "grab";
  if (dist <= M.swipe.reach) return "swipe";
  if (dist >= M.hurl.min && dist <= M.hurl.max) return "hurl";
  return undefined;
}

// Whether someone is grabbed at the lunge: in Survival or Adventure, within its reach in front of it (its arc either
// side of where it faces), near its height.
/** @param {{ x: number, y: number, z: number }} at @param {number} yaw @param {{ x: number, y: number, z: number, mode: string }} p */
export function inGrabReach(at, yaw, p, R = VOID) {
  const G = R.moves.grab;
  const m = String(p.mode).toLowerCase();
  if (m !== "survival" && m !== "adventure") return false;
  const dx = p.x - at.x, dz = p.z - at.z;
  const d = Math.hypot(dx, dz);
  if (d > G.reach || Math.abs(p.y - at.y) > G.high) return false;
  if (d < 1.2) return true;
  const f = yawDir(yaw);
  const cos = (f.x * dx + f.z * dz) / d;
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI <= G.arc;
}

// --- The way to the edge -------------------------------------------------------------------------------------------
// The shortest straight way from `from` (its feet's spot; `floorY` the block it stands on) to an island's edge it can
// walk: along each of `rays` ways, a sample every `step` blocks; `colAt(x, z)` says what each column is: the height of
// its top block (a number), "void" (no block in it at all) or undefined (not read, or no place to walk: a chorus plant,
// an End city's wall). From one sample to the next the ground may rise `up` and fall `down`. The edge: the first empty
// sample within `far`, with `beyond` more past it empty too. Returns { yaw, dir, length, floors } (it walks `length`
// along `dir`, and `floors` are each sample's ground, { s, y }) or undefined: no edge it can walk to.
/**
 * @param {(x: number, z: number) => (number | "void" | undefined)} colAt @param {{ x: number, z: number }} from
 * @param {number} floorY
 */
export function edgeRoute(colAt, from, floorY, R = VOID.route) {
  let best;
  for (let i = 0; i < R.rays; i++) {
    const yaw = (360 / R.rays) * i;
    const dir = yawDir(yaw);
    const r = alongRay(colAt, from, floorY, dir, R);
    if (r && (!best || r.length < best.length)) best = { yaw, dir, ...r };
  }
  return best;
}

function alongRay(colAt, from, floorY, dir, R) {
  const cache = new Map();
  const col = (s) => {
    const x = Math.floor(from.x + dir.x * s), z = Math.floor(from.z + dir.z * s);
    const k = `${x},${z}`;
    if (!cache.has(k)) cache.set(k, colAt(x, z));
    return cache.get(k);
  };
  /** @type {{ s: number, y: number }[]} */
  const floors = [];
  let y = floorY;
  const n = Math.round(R.far / R.step);
  for (let i = 1; i <= n; i++) {
    const s = i * R.step;
    const h = col(s);
    if (h === "void") {
      for (let k = 1; k <= R.beyond; k++) if (col(s + k * R.step) !== "void") return undefined;
      return { length: Math.max(0, +(s - R.stop).toFixed(3)), edge: s, floors };
    }
    if (typeof h !== "number" || h - y > R.up || y - h > R.down) return undefined;
    y = h;
    floors.push({ s, y: h });
  }
  return undefined;
}

// The ground's height `s` blocks along a way (the nearest sample's; its own floor before the first), or undefined past
// the edge.
/** @param {{ floors: { s: number, y: number }[], edge: number }} route @param {number} floorY @param {number} s */
export function floorAlong(route, floorY, s, R = VOID.route) {
  if (s >= route.edge - R.step / 2) return undefined;
  let y = floorY;
  for (const f of route.floors) {
    if (f.s > s + R.step / 2) break;
    y = f.y;
  }
  return y;
}

// Where it and the one it holds are, `s` blocks along its way from `from` (its feet's spot at the start, `floorY` the
// block under them): it on the ground there; they `hold` in front, `lift` off the ground under them (or, out over the
// void, at its own height and the lift).
/**
 * @param {{ dir: { x: number, z: number }, floors: { s: number, y: number }[], edge: number, length: number }} route
 * @param {{ x: number, z: number }} from @param {number} floorY @param {number} s
 */
export function dragSpots(route, from, floorY, s, G = VOID.grab, R = VOID.route) {
  const d = Math.min(s, route.length);
  const y = (floorAlong(route, floorY, d, R) ?? floorY) + 1;
  const me = { x: from.x + route.dir.x * d, y, z: from.z + route.dir.z * d };
  const under = floorAlong(route, floorY, d + G.hold, R);
  const them = { x: from.x + route.dir.x * (d + G.hold), y: Math.max(y, (under ?? -Infinity) + 1) + G.lift, z: from.z + route.dir.z * (d + G.hold) };
  return { me, them, over: under === undefined };
}

// One tick of a grab, pure: what happens now. `g`: { s (blocks walked), ticks, stuck (ticks in a row its way was
// blocked) }; `o`: { hit (a player's hit on it since the last tick), lost (it or they gone, or they no longer in Survival
// or Adventure), leash (how far they are from where it last held them), blocked (its next spot has no room) }.
// Returns "broken", "lost", "escaped", "edge" (holding them out over the void: let go), "stuck", "timeout", or "walk" (a
// step on; g.s is moved on).
/** @param {{ s: number, ticks: number, stuck: number }} g @param {{ hit: boolean, lost: boolean, leash: number, blocked: boolean }} o @param {number} length */
export function grabStep(g, o, length, G = VOID.grab) {
  if (o.lost) return "lost";
  if (o.hit) return "broken";
  if (o.leash > G.leash) return "escaped";
  g.ticks++;
  if (g.s >= length) return "edge";
  if (g.ticks > G.maxTicks) return "timeout";
  if (o.blocked) {
    g.stuck++;
    return g.stuck >= G.stuckTicks ? "stuck" : "walk";
  }
  g.stuck = 0;
  g.s = Math.min(length, g.s + G.pace);
  return "walk";
}

// --- Its rift ------------------------------------------------------------------------------------------------------
// A round floor (radius 5: 11 across) of end stone with patches of end stone bricks and a few blocks of obsidian; in its
// middle a 3 by 3 of crying obsidian (the void scar), where it crouches at night; a broken ring of six obsidian pillars
// round it, 2 to 4 high, some topped with an end rod.
export const RIFT = {
  radius: 5,
  clearUp: 20, // cleared this high over the floor (the chorus plants)
  fillDown: 4, // dips under the floor filled with end stone this deep
  scar: 1, // the crying obsidian: 3 by 3
  pillars: 4.5, // the ring's radius
  dry: 3, // no water on its floor or this far round it (dryRound)
};
const hyp = Math.hypot;

// Its home: the middle of the scar (it is put there, wanders round it, and crouches there at night).
/** @param {{ x: number, y: number, z: number }} c */
export function riftDen(c) {
  const bed = { x: c.x + 0.5, y: c.y + 1, z: c.z + 0.5 };
  return { x: bed.x, y: bed.y, z: bed.z, bed };
}

// Every block the rift sets, in order: { x, y, z, id, states? }. `c`: the floor's middle on the floor block's level.
// The columns are cleared up to clearUp first (riftColumns), dips filled; then this. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function riftBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  const R = RIFT.radius;
  const patches = Array.from({ length: 3 }, () => ({ u: Math.round((rand() - 0.5) * 7), v: Math.round((rand() - 0.5) * 7), r: 0.8 + rand() * 1.0 }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      if (Math.abs(u) <= RIFT.scar && Math.abs(v) <= RIFT.scar) {
        put(u, v, 0, "minecraft:crying_obsidian");
        continue;
      }
      const brick = patches.some((p) => hyp(u - p.u, v - p.v) <= p.r);
      put(u, v, 0, rand() < 0.06 ? "minecraft:obsidian" : brick ? "minecraft:end_bricks" : "minecraft:end_stone");
    }
  }
  // The broken ring: six obsidian pillars, 2 to 4 high; about half topped with an end rod.
  for (let i = 0; i < 6; i++) {
    const a = ((i * 60 + 30 + (rand() - 0.5) * 16) * Math.PI) / 180;
    const u = Math.round(Math.sin(a) * RIFT.pillars), v = Math.round(Math.cos(a) * RIFT.pillars);
    const h = 2 + Math.floor(rand() * 3);
    for (let y = 1; y <= h; y++) put(u, v, y, "minecraft:obsidian");
    if (rand() < 0.5) put(u, v, h + 1, "minecraft:end_rod", { facing_direction: 1 });
  }
  return out;
}

// The rift's columns (the world's x, z), each to be cleared from the floor up and its dips filled.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function riftColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = RIFT.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// Whether a rift site is near an island's edge: along any of 16 ways from its middle, a column with no block in it
// (`colAt` as edgeRoute's) from just past its floor out to `edge` blocks. riftNearEdgeSteps is the same a way at a time
// (a yield after each): the rift look runs as a job, since on a big island a look that finds no site reads some 3,000
// columns (bench 0.1.167: 0.47 seconds in one tick when it was done at once).
/**
 * @param {(x: number, z: number) => (number | "void" | undefined)} colAt @param {{ x: number, z: number }} c
 * @returns {Generator<undefined, boolean, unknown>}
 */
export function* riftNearEdgeSteps(colAt, c, edge = VOID.site.edge) {
  for (let i = 0; i < 16; i++) {
    const dir = yawDir(i * 22.5);
    for (let s = RIFT.radius + 1; s <= edge; s++) {
      const h = colAt(Math.floor(c.x + 0.5 + dir.x * s), Math.floor(c.z + 0.5 + dir.z * s));
      if (h === "void") return true;
      if (h === undefined) break;
    }
    yield;
  }
  return false;
}

// Whether a lair's clearing has no water on it or round it (bench 0.1.167: a rift cut into a Chorus Meadow beside its
// pond was flooded, the pond running in over its floor, which sits up to 3 below the ground round it). `wetAt` says
// whether a column has water over its topmost block (getTopmostBlock reads under water: on the bench it gave the end
// stone under a meadow's pond, and gravel 13 under the sea), read every other block out to `radius` (a Chorus Meadow's
// ponds are 5 or more across): the rift's floor and 3 more round it (RIFT.dry), or the Baby Dragon's clearing and 3.
/** @param {(x: number, z: number) => boolean} wetAt @param {{ x: number, z: number }} c */
export function dryRound(wetAt, c, radius = RIFT.radius + RIFT.dry) {
  const m = 2 * Math.floor(radius / 2); // even steps from its middle, whatever the radius
  for (let dx = -m; dx <= m; dx += 2) {
    for (let dz = -m; dz <= m; dz += 2) {
      if (Math.hypot(dx, dz) > radius) continue;
      if (wetAt(c.x + dx, c.z + dz)) return false;
    }
  }
  return true;
}

/** @param {(x: number, z: number) => (number | "void" | undefined)} colAt @param {{ x: number, z: number }} c */
export function riftNearEdge(colAt, c, edge = VOID.site.edge) {
  const it = riftNearEdgeSteps(colAt, c, edge);
  for (;;) {
    const r = it.next();
    if (r.done) return r.value;
  }
}

// --- The zoo voidling's day (animals/yeti.js, as the zoo yeti's) ---------------------------------------------------
// Calm: it wanders slowly, eats at its feeder, stretches its long arms up and lets a violet wisp float off its fingers,
// hums now and then, crouches to rest, and at night crouches with its head bowed. It never grabs, rakes or throws.
export const VOID_DAY = { ...ZOO_DAY, weights: { feeder: 3, toss: 1.4, roar: 0.6, sit: 1.6, wander: 3 } };
