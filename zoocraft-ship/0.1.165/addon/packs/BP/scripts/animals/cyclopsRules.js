// The Cyclops (0.1.165, module 11's first rare mob: research/mobhouse_plan.md "0.1.165 Cyclops: the design"), pure: its
// fight's numbers (a fourth kind in the boss framework, animals/boss.js: never killed, its health worn down to a quarter
// and no further, when it sits down panting and the Passivity Serum takes), the biomes its camps are made in, the camp's
// blocks, and its zoo day (animals/yeti.js plays it, as the zoo yeti's). Hostile, unlike the bosses: anyone in Survival
// or Adventure who comes within 12 blocks starts a fight (sneaking, within 4).

import { YETI_ACT, ZOO_DAY, lairFrame, seeded } from "./bossRules.js";

export const WILD_CYCLOPS = "zoocraft:wild_cyclops";
export const CALM_CYCLOPS = "zoocraft:calm_cyclops";
export const ZOO_CYCLOPS = "zoocraft:zoo_cyclops";
export const CYCLOPS_ROCK = "zoocraft:cyclops_rock";

// What it is doing (its zoocraft:act entity property), the yeti's numbers (RP cyclops.animation_controllers.json): 1
// the club smash, 2 the stomp, 3 the rock throw, 4 the bellow, 5 eat, 6 tired, 7 sit, 8 sleep, 9 toss (a zoo cyclops
// tossing a rock up and catching it).
export const CYCLOPS_ACT = { ...YETI_ACT };

// Its fight (as YETI in animals/bossRules.js, with its own numbers). Ticks are game ticks (20 a second).
export const CYCLOPS = {
  energy: 100, // its health: the boss bar
  tiredAt: 25, // a quarter: it sits down panting, can't be hurt, and the Passivity Serum takes
  angryAt: 50, // half: the angry bellow, then faster
  ring: 28, // a fight goes on while a Survival player is this near its camp's bed
  provoke: 12, // a Survival or Adventure player this near starts a fight (hostile)
  sneakProvoke: 4, // ... or this near, sneaking
  hostile: true, // a fight goes on while someone is within its provoke reach, hit or not
  noHitTicks: 1200, // a minute with no hit and nobody that near ends a fight
  recoverTicks: 1200, // tired, with nobody within the ring for a minute: it gets up rested
  regenPerSecond: 1, // health back while calm
  roarTicks: 40, // the opening bellow (the art's, 2.2 s; its roar at 0.8 s)
  every: 50, // a move every 2.5 seconds while it fights (1.6 angry), the first a second after the bellow
  everyAngry: 32,
  firstMove: 20,
  gapTicks: 4,
  moves: {
    // Near, in front: the club raised high (0.9 s) and brought down on the ground 3 blocks out: 8, a knock back.
    swipe: { reach: 4.5, arc: 60, strikeAt: 18, ticks: 32, damage: 8, knock: { h: 1.1, v: 0.4 } },
    // Near, all round: a foot lifted high (1 s) and stamped down: 5, and thrown up and back.
    slam: { reach: 5.5, high: 2, strikeAt: 20, ticks: 34, damage: 5, knock: { h: 0.9, v: 0.7 } },
    // Far: a rock picked up and lifted over its head (1.1 s), thrown: 6 on a hit (the projectile's) and a push.
    hurl: { min: 6, max: 24, strikeAt: 22, ticks: 30, damage: 6, knock: { h: 0.8, v: 0.3 }, speed: 1.0, gravity: 0.05 },
  },
  // Angry at half health: the bellow (2.2 s); at 1 s everyone within 10 is slowed and pushed back.
  angry: { ticks: 44, blastAt: 20, radius: 10, slowTicks: 60, slowLevel: 1, knock: { h: 1.0, v: 0.3 } },
  // The rock leaves its hands over its head at the throw (the art's: 4.5 blocks up), a block in front of its body.
  throwFrom: { ahead: 1.0, up: 4.2 },
  // Calm: a grumbling bellow now and then; at night to its bed of hides to sleep.
  calmRoarChance: 0.003,
  calmRoarTicks: 44,
  denArrive: 2.0,
  denGiveUp: 600,
  // Camps: very rare, one to a wide area.
  spacing: 1500,
  site: { min: 32, max: 48, parks: 160, level: 4, tries: 32 },
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16,
  lairEvery: 100,
};

// Its biomes: the windswept hills (all five kinds carry the tag extreme_hills: windswept hills, gravelly hills, forest,
// and their edge and mutated kinds) and the stony peaks (no tag of its own: by its id).
export const CYCLOPS_BIOME_TAG = "extreme_hills";
export const CYCLOPS_BIOME_IDS = ["minecraft:stony_peaks"];
/** @param {{ id: string, tags: string[] } | undefined} biome */
export function inCyclopsBiome(biome) {
  return Boolean(biome) && ((biome.tags ?? []).includes(CYCLOPS_BIOME_TAG) || CYCLOPS_BIOME_IDS.includes(biome.id));
}

// The camp's shape: a round flat clearing (radius 7: 15 across) cut into the hills; at the back (the way the lair frame's
// v runs), a bed of hides (brown carpet, 3 by 2) under a rough wall of rock up to 4 high; a campfire in the middle on a
// ring of gravel; boulders round the rim but for the way in at the front (-v, the side the player came from); a pile of
// rocks, two log seats and a few bones off to the sides.
export const CAMP = {
  radius: 7,
  clearUp: 20, // trees cleared this high over the floor
  fillDown: 4, // dips under the floor filled with stone this deep
  bed: { v0: 3, v1: 4, half: 1 },
  wall: { v: 6, half: 3 },
};

// Its home and its bed (the middle of the bed of hides), in the world: it is put there, wanders round it, and sleeps
// there at night.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function campDen(c, facing) {
  const at = lairFrame(c, facing);
  const a = at(0, CAMP.bed.v0, 1);
  const b = at(0, CAMP.bed.v1, 1);
  const bed = { x: (a.x + b.x) / 2 + 0.5, y: a.y, z: (a.z + b.z) / 2 + 0.5 };
  return { x: bed.x, y: bed.y, z: bed.z, bed };
}

const FLOOR_PATCH = ["minecraft:gravel", "minecraft:stone", "minecraft:andesite", "minecraft:gravel"];
const ROCKS = ["minecraft:stone", "minecraft:stone", "minecraft:cobblestone", "minecraft:mossy_cobblestone", "minecraft:andesite"];
const BOULDERS = ["minecraft:cobblestone", "minecraft:mossy_cobblestone", "minecraft:mossy_cobblestone", "minecraft:stone", "minecraft:andesite"];
const hyp = Math.hypot;

// Every block the camp sets, in order: { x, y, z, id, states? }. `c`: the clearing's middle on the floor block's level.
// The columns are cleared up to clearUp first (campColumns), dips filled; then this. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function campBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  const R = CAMP.radius;
  const across = facing % 2 === 0 ? "x" : "z"; // the world axis the frame's u runs along (a log lying across)
  // The floor: coarse dirt, with patches of gravel, stone and andesite, and a ring of gravel round the fire.
  const patches = Array.from({ length: 5 }, () => ({ u: Math.round((rand() - 0.5) * 10), v: Math.round((rand() - 0.5) * 10), r: 0.8 + rand() * 1.4, id: FLOOR_PATCH[Math.floor(rand() * FLOOR_PATCH.length)] }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const ring = hyp(u, v) <= 1.6;
      const patch = patches.find((p) => hyp(u - p.u, v - p.v) <= p.r);
      put(u, v, 0, ring ? "minecraft:gravel" : patch ? patch.id : "minecraft:coarse_dirt");
    }
  }
  // The rock wall at the back: highest behind the bed, lower to its ends, and short wings either side of the bed.
  const W = CAMP.wall;
  for (let u = -W.half; u <= W.half; u++) {
    const h = 3 + (Math.abs(u) <= 1 ? 1 : 0) - (Math.abs(u) === W.half ? 1 : 0);
    for (let y = 1; y <= h; y++) put(u, W.v, y, ROCKS[Math.floor(rand() * ROCKS.length)]);
  }
  for (const u of [-W.half, W.half]) {
    for (let y = 1; y <= 2; y++) put(u, W.v - 1, y, ROCKS[Math.floor(rand() * ROCKS.length)]);
    put(u, W.v - 2, 1, ROCKS[Math.floor(rand() * ROCKS.length)]);
  }
  // The bed of hides.
  const B = CAMP.bed;
  for (let u = -B.half; u <= B.half; u++) for (let v = B.v0; v <= B.v1; v++) put(u, v, 1, "minecraft:brown_carpet");
  // The campfire in the middle (lit).
  put(0, 0, 1, "minecraft:campfire");
  // Boulders round the rim at the sides (the wall is at the back; none in the front, where the way in is: 180 degrees,
  // the gap between 138 and 222).
  for (const a0 of [62, 100, 138, 222, 260, 298]) {
    const a = (a0 + (rand() - 0.5) * 14) * (Math.PI / 180);
    const d = R - 1;
    const u = Math.round(Math.sin(a) * d), v = Math.round(Math.cos(a) * d);
    put(u, v, 1, BOULDERS[Math.floor(rand() * BOULDERS.length)]);
    put(u + (rand() < 0.5 ? 1 : -1), v, 1, BOULDERS[Math.floor(rand() * BOULDERS.length)]);
    if (rand() < 0.6) put(u, v, 2, BOULDERS[Math.floor(rand() * BOULDERS.length)]);
  }
  // Two log seats by the fire, across the clearing in front of it.
  for (const [u0, v] of [[-3, -2], [2, -3]]) for (let u = u0; u <= u0 + 1; u++) put(u, v, 1, "minecraft:spruce_log", { pillar_axis: across });
  // Its pile of rocks for throwing, by the wall.
  put(4, 3, 1, "minecraft:cobblestone");
  put(5, 2, 1, "minecraft:cobblestone");
  put(4, 2, 1, "minecraft:mossy_cobblestone");
  put(4, 2, 2, "minecraft:cobblestone");
  // A few bones lying about, off to the sides (clear of the way in).
  for (const a0 of [115, 245, 290]) {
    const a = (a0 + (rand() - 0.5) * 20) * (Math.PI / 180);
    const d = 3.5 + rand() * 1.5;
    put(Math.round(Math.sin(a) * d), Math.round(Math.cos(a) * d), 1, "minecraft:bone_block", { pillar_axis: rand() < 0.5 ? "x" : "z" });
  }
  return out;
}

// The camp's columns (the world's x, z), each to be cleared from the floor up and its dips filled.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function campColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = CAMP.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// --- The zoo cyclops's day (animals/yeti.js, as the zoo yeti's) ----------------------------------------------------
// Calm: it wanders, eats at its feeder, picks up a rock and tosses it up to catch it, bellows (softer), sits down to
// rest, and at night sleeps sitting.
export const CYCLOPS_DAY = { ...ZOO_DAY, weights: { feeder: 3, toss: 1.2, roar: 0.5, sit: 1.5, wander: 3 } };
