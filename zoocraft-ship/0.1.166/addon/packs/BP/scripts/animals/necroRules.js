// The Necromancer Skeleton (0.1.166, module 11's second rare mob: research/mobhouse_plan.md "0.1.166 Necromancer
// Skeleton: the design"), pure: its fight's numbers (a fifth kind in the boss framework, animals/boss.js: never killed,
// its health worn down to a quarter and no further, when it kneels panting on its staff and the Passivity Serum takes),
// the skeletons it raises while it fights, where its crypts are made (a soul sand valley, or beside a Nether fortress),
// the crypt's blocks, and its zoo day (animals/yeti.js plays it, as the zoo yeti's). Hostile, as the Cyclops: anyone in
// Survival or Adventure who comes within 12 blocks starts a fight (sneaking, within 4).

import { YETI_ACT, ZOO_DAY, lairFrame, seeded, aheadOf } from "./bossRules.js";

export const WILD_NECRO = "zoocraft:wild_necromancer";
export const CALM_NECRO = "zoocraft:calm_necromancer";
export const ZOO_NECRO = "zoocraft:zoo_necromancer";
export const SOUL_BOLT = "zoocraft:necro_bolt";
// The plain skeletons it raises: tagged, and with its id, so they crumble when its fight is over.
export const RAISED_TYPE = "minecraft:skeleton";
export const RAISED_TAG = "zoocraft_raised";
export const RAISED_PROP = "zoocraft:raised_by";

// What it is doing (its zoocraft:act entity property), the yeti's numbers (RP necromancer.animation_controllers.json): 1
// the staff strike, 2 the soul ring, 3 the soul bolt, 4 the wail, 5 eat, 6 tired (kneeling on its staff, panting), 7
// kneel (resting), 8 sleep (kneeling, head bowed), 9 conjure (a zoo necromancer letting a soul flame float off its staff);
// and its own 10, raising a skeleton.
export const NECRO_ACT = { ...YETI_ACT, raise: 10 };

// Its fight (as YETI in animals/bossRules.js, with its own numbers). Ticks are game ticks (20 a second).
export const NECRO = {
  energy: 80, // its health: the boss bar
  tiredAt: 20, // a quarter: it kneels down panting, can't be hurt, and the Passivity Serum takes
  angryAt: 40, // half: the soul wail, then faster
  ring: 28, // a fight goes on while a Survival player is this near its crypt's carpet
  provoke: 12, // a Survival or Adventure player this near starts a fight (hostile)
  sneakProvoke: 4, // ... or this near, sneaking
  hostile: true, // a fight goes on while someone is within its provoke reach, hit or not
  noHitTicks: 1200, // a minute with no hit and nobody that near ends a fight
  recoverTicks: 1200, // tired, with nobody within the ring for a minute: it gets up rested
  regenPerSecond: 1, // health back while calm
  roarTicks: 40, // the opening wail (the art's, 2.2 s; the cry at 0.8 s)
  every: 50, // a move every 2.5 seconds while it fights (1.6 angry), the first a second after the wail
  everyAngry: 32,
  firstMove: 20,
  gapTicks: 4,
  moves: {
    // Near, in front: the staff swung round (0.7 s) and down across the front: 6, a knock back.
    swipe: { reach: 3.5, arc: 60, strikeAt: 14, ticks: 26, damage: 6, knock: { h: 1.0, v: 0.35 } },
    // Near, all round: the staff lifted (0.9 s) and its foot struck on the ground, a ring of soul fire out round it: 4,
    // slowed 2 seconds.
    slam: { reach: 4.5, high: 2, strikeAt: 18, ticks: 30, damage: 4, knock: { h: 0.6, v: 0.3 }, slowTicks: 40, slowLevel: 1 },
    // Far: the staff's flame drawn back (0.9 s) and flung, a soul bolt flying straight (no drop): 6 on a hit (the
    // projectile's), set on fire, a little push. Step aside and it misses.
    hurl: { min: 5, max: 24, strikeAt: 18, ticks: 28, damage: 6, knock: { h: 0.4, v: 0.15 }, speed: 1.1, gravity: 0 },
    // Raising a skeleton: the staff held up high (1.1 s), then its foot struck down and the skeleton claws up.
    raise: { strikeAt: 22, ticks: 34 },
  },
  // While it fights: a skeleton raised every 10 seconds (the first 5 seconds in), while fewer than 3 it raised stand;
  // 2.5 to 4 blocks from it, toward its target if there is room.
  raise: { first: 100, every: 200, max: 3, near: 2.5, far: 4.0 },
  // Angry at half health: the soul wail (2.2 s); at 1 s everyone within 10 is slowed and pushed back.
  angry: { ticks: 44, blastAt: 20, radius: 10, slowTicks: 60, slowLevel: 1, knock: { h: 1.0, v: 0.3 } },
  // The bolt leaves the staff's flame (the art: thrust out in front, 2.7 blocks ahead and 1.75 up at the release),
  // started a little nearer so it is never inside a wall in front of it.
  throwFrom: { ahead: 1.6, up: 1.8 },
  // Calm: a low chant now and then; at night to its carpet before the altar, to stand there with its head bowed.
  calmRoarChance: 0.003,
  calmRoarTicks: 44,
  denArrive: 1.5,
  denGiveUp: 600,
  // Crypts: very rare, one to a wide area (as the Cyclops's camps).
  spacing: 1500,
  // (48 tries, the bench found good ground rare round fortresses: a look round one with none waits lookAgain. Its ground
  // may rise `up` over the middle's (cut away: the crypt clears 8 up) and fall `down` under it (filled: 4 down).)
  site: { min: 28, max: 44, parks: 160, up: 5, down: 4, tries: 48, air: 6, over: 12, under: 24 },
  lookAgain: 600, // 30 seconds before a player is looked round for a crypt again after a look that found no site
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16,
  lairEvery: 100,
};

// Its places: a soul sand valley (the biome's tag), or beside a Nether fortress anywhere in the Nether. The script API's
// structure lookup is not in the stable API, so a fortress is found by its blocks: 40 or more nether bricks (the block,
// its fence, stairs and slab) in a box 20 blocks round the player and 8 up and down. (Bedrock's nether brick block is
// minecraft:nether_brick; minecraft:netherbrick is the item.)
export const NECRO_BIOME_TAG = "soulsand_valley";
/** @param {{ id: string, tags: string[] } | undefined} biome */
export function inNecroBiome(biome) {
  return Boolean(biome) && (biome.tags ?? []).includes(NECRO_BIOME_TAG);
}
export const FORTRESS = {
  blocks: ["minecraft:nether_brick", "minecraft:nether_brick_fence", "minecraft:nether_brick_stairs", "minecraft:nether_brick_slab"],
  range: 20,
  height: 8,
  min: 40,
};
// The box looked through round a player for a fortress, and a crypt's own box (none of the fortress may be in it: a
// crypt is never cut into a fortress, or under its bridges: the box goes CRYPT.openAbove over the floor).
/** @param {{ x: number, y: number, z: number }} p */
export function fortressBox(p, F = FORTRESS) {
  const x = Math.floor(p.x), y = Math.floor(p.y), z = Math.floor(p.z);
  return { from: { x: x - F.range, y: y - F.height, z: z - F.range }, to: { x: x + F.range, y: y + F.height, z: z + F.range } };
}
/** @param {{ x: number, y: number, z: number }} c */
export function cryptBox(c) {
  const R = CRYPT.radius + 1;
  return { from: { x: c.x - R, y: c.y - CRYPT.fillDown, z: c.z - R }, to: { x: c.x + R, y: c.y + CRYPT.openAbove, z: c.z + R } };
}
// A box clamped to a dimension's heights ({ min, max }: max is the first height above the top).
/** @param {{ from: { x: number, y: number, z: number }, to: { x: number, y: number, z: number } }} box @param {{ min: number, max: number }} range */
export function clampBox(box, range) {
  const lo = range.min, hi = range.max - 1;
  const y0 = Math.max(lo, Math.min(hi, box.from.y)), y1 = Math.max(lo, Math.min(hi, box.to.y));
  return { from: { ...box.from, y: y0 }, to: { ...box.to, y: y1 } };
}
// A crypt keeps away from every other lair (a Soul Sloth's in the same valley): this far between their middles.
export const CRYPT_APART = 40;
/** @param {number} count */
export const fortressNear = (count, F = FORTRESS) => count >= F.min;

// The ground under a crypt's site, found going down a column from fromY to toY as the Soul Sloth's lairs find theirs
// (animals/slothRules.js netherGroundY): the first Nether ground block with `air` blocks of open space over it; "wet" at
// lava first; undefined if none or unread. For the crypt the Nether's small plants and fire count as open space too (the
// crypt clears them): the bench found most sites round a fortress in a warped forest failing on its roots and fungi.
const CRYPT_GROUND = /^minecraft:(soul_sand|soul_soil|netherrack|basalt|polished_basalt|smooth_basalt|blackstone|gravel|bone_block|magma|nether_gold_ore|quartz_ore|crimson_nylium|warped_nylium)$/;
const CRYPT_OPEN = /^minecraft:(air|cave_air|void_air|fire|soul_fire|warped_roots|crimson_roots|nether_sprouts|twisting_vines|weeping_vines|warped_fungus|crimson_fungus|brown_mushroom|red_mushroom)$/;
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {number} x @param {number} z @param {number} fromY @param {number} toY @param {number} air */
export function cryptGroundY(idAt, x, z, fromY, toY, air) {
  let clear = 0;
  for (let y = fromY; y >= toY; y--) {
    const id = idAt(x, y, z);
    if (id === undefined) return undefined;
    if (id.includes("lava")) return "wet";
    if (CRYPT_OPEN.test(id)) {
      clear++;
      continue;
    }
    if (clear >= air && CRYPT_GROUND.test(id)) return y;
    clear = 0; // an overhang, a tree or a pillar's top: count again under it
  }
  return undefined;
}

// A crypt site's floor height (the middle's ground, found going down from S.over over the player's height to S.under under
// it), or undefined: every 2 blocks out to the crypt's radius the ground (with S.air open over it, no lava) at most S.up
// over the middle's and S.down under it. Rougher than the Soul Sloth's lairs take (3 either way): the bench found level
// ground rare round fortresses, in the Nether's caverns; the crypt cuts the rises away and fills the dips.
/** @param {(x: number, z: number, from: number, to: number) => (number | "wet" | undefined)} groundAt @param {{ x: number, z: number }} c @param {number} playerY */
export function cryptSiteLevel(groundAt, c, playerY, S = NECRO.site) {
  const y0 = groundAt(c.x, c.z, Math.floor(playerY) + S.over, Math.floor(playerY) - S.under);
  if (typeof y0 !== "number") return undefined;
  const R = CRYPT.radius;
  for (let dx = -R; dx <= R; dx += 2) {
    for (let dz = -R; dz <= R; dz += 2) {
      if (hyp(dx, dz) > R) continue;
      const y = groundAt(c.x + dx, c.z + dz, y0 + S.up + S.air, y0 - S.down - 1);
      if (typeof y !== "number" || y - y0 > S.up || y0 - y > S.down) return undefined;
    }
  }
  return y0;
}

// --- Raising skeletons -------------------------------------------------------------------------------------------
// Whether it raises one now: the time come and fewer than the most it keeps standing.
/** @param {number} now @param {number} at @param {number} standing */
export function mayRaise(now, at, standing, R = NECRO) {
  return now >= at && standing < R.raise.max;
}
// The spots to try for one, in order: toward its target (its yaw) first, then wider round it and behind it.
/** @param {{ x: number, y: number, z: number }} at @param {number} yaw @param {() => number} [rand] */
export function raiseSpots(at, yaw, rand = Math.random, R = NECRO) {
  const out = [];
  for (const off of [-35, 35, -70, 70, 0, 110, -110, 180]) {
    const d = R.raise.near + rand() * (R.raise.far - R.raise.near);
    const p = aheadOf(at, yaw + off, d, 0);
    out.push({ x: Math.floor(p.x), z: Math.floor(p.z) });
  }
  return out;
}
// The floor a raised skeleton climbs out onto at a spot: the first block, from one over the Necromancer's floor (y0) down
// to 3 under it, that is something to stand on with two blocks of room over it (air, a carpet, roots). Undefined if none
// or unread: that spot is skipped. Never lava, water or fire; never a lantern, a torch, a fence or a wall's top.
const ROOM = /^minecraft:(air|cave_air|void_air|[a-z_]*carpet|crimson_roots|warped_roots|nether_sprouts|short_grass|tall_grass|fern)$/;
const NO_FLOOR = /lava|water|fire|lantern|torch|fence|_wall$|chain|vine|roots|sprouts|button|lever|sign|carpet|air$|grass$|fern$/;
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {number} x @param {number} y0 @param {number} z */
export function raiseFloor(idAt, x, y0, z) {
  for (let y = y0 + 1; y >= y0 - 3; y--) {
    const id = idAt(x, y, z);
    if (id === undefined) return undefined;
    if (NO_FLOOR.test(id)) continue;
    const a = idAt(x, y + 1, z), b = idAt(x, y + 2, z);
    if (a !== undefined && b !== undefined && ROOM.test(a) && ROOM.test(b)) return y;
  }
  return undefined;
}

// --- Its crypt -----------------------------------------------------------------------------------------------------
// A flat floor (radius 6: 13 across) of soul soil with patches of soul sand and a cross of polished blackstone bricks;
// low broken walls round the rim but for the way in at the front (-v); four pillars with soul lanterns on top, two of them
// flanking the way in; at the back (the way the lair frame's v runs) an altar of chiseled polished blackstone with a soul
// lantern at each end, and before it a black carpet (3 by 2) where it stands; two headstones and some bones.
export const CRYPT = {
  radius: 6,
  clearUp: 8, // cleared this high over the floor
  fillDown: 4, // dips under the floor filled with soul soil this deep
  openAbove: 24, // no fortress block this high over the floor (none of its bridges over it)
  carpet: { v0: 3, v1: 4, half: 1 },
  altar: { v: 5, half: 1 },
};

// Its home and its carpet's middle, in the world: it is put there, wanders round it, and stands there at night.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function cryptDen(c, facing) {
  const at = lairFrame(c, facing);
  const a = at(0, CRYPT.carpet.v0, 1);
  const b = at(0, CRYPT.carpet.v1, 1);
  const bed = { x: (a.x + b.x) / 2 + 0.5, y: a.y, z: (a.z + b.z) / 2 + 0.5 };
  return { x: bed.x, y: bed.y, z: bed.z, bed };
}

const WALL = ["minecraft:polished_blackstone_bricks", "minecraft:polished_blackstone_bricks", "minecraft:cracked_polished_blackstone_bricks", "minecraft:blackstone"];
const hyp = Math.hypot;

// Every block the crypt sets, in order: { x, y, z, id, states? }. `c`: the floor's middle on the floor block's level.
// The columns are cleared up to clearUp first (cryptColumns), dips filled; then this. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function cryptBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  const R = CRYPT.radius;
  // The floor: soul soil with patches of soul sand, a cross of polished blackstone bricks (the path in, and across).
  const patches = Array.from({ length: 4 }, () => ({ u: Math.round((rand() - 0.5) * 8), v: Math.round((rand() - 0.5) * 8), r: 0.8 + rand() * 1.2 }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const path = (u === 0 && v <= 2) || (v === 0 && Math.abs(u) <= 3);
      const patch = patches.some((p) => hyp(u - p.u, v - p.v) <= p.r);
      put(u, v, 0, path ? "minecraft:polished_blackstone_bricks" : patch ? "minecraft:soul_sand" : "minecraft:soul_soil");
    }
  }
  // The low broken walls round the rim: 1 or 2 high, a block missing here and there; none in the front (the way in:
  // the gap between 140 and 220 degrees).
  for (let a0 = 0; a0 < 360; a0 += 9) {
    if (a0 > 140 && a0 < 220) continue;
    const a = a0 * (Math.PI / 180);
    const u = Math.round(Math.sin(a) * R), v = Math.round(Math.cos(a) * R);
    if (rand() < 0.18) continue; // fallen
    put(u, v, 1, WALL[Math.floor(rand() * WALL.length)]);
    if (rand() < 0.45) put(u, v, 2, WALL[Math.floor(rand() * WALL.length)]);
  }
  // The four pillars, 3 high with a soul lantern on top (the front two flank the way in).
  for (const [u, v] of [[-4, 4], [4, 4], [-3, -4], [3, -4]]) {
    for (let y = 1; y <= 3; y++) put(u, v, y, y === 2 ? "minecraft:chiseled_polished_blackstone" : "minecraft:polished_blackstone_bricks");
    put(u, v, 4, "minecraft:soul_lantern", { hanging: false });
  }
  // The altar at the back, a soul lantern at each end.
  const A = CRYPT.altar;
  for (let u = -A.half; u <= A.half; u++) put(u, A.v, 1, "minecraft:chiseled_polished_blackstone");
  for (const u of [-A.half, A.half]) put(u, A.v, 2, "minecraft:soul_lantern", { hanging: false });
  // Its carpet before the altar.
  const C = CRYPT.carpet;
  for (let u = -C.half; u <= C.half; u++) for (let v = C.v0; v <= C.v1; v++) put(u, v, 1, "minecraft:black_carpet");
  // Two headstones off the path (a block of bricks and a slab on it).
  for (const u of [-3, 3]) {
    put(u, 1, 1, "minecraft:polished_blackstone_bricks");
    put(u, 1, 2, "minecraft:polished_blackstone_brick_slab", { "minecraft:vertical_half": "bottom" });
  }
  // A few bones lying about, off to the sides (clear of the path, the carpet, the headstones, the pillars and the walls:
  // 4 to 5 blocks out at 60, 120, 240 and 300 degrees, give or take 10).
  for (const a0 of [60, 120, 240, 300]) {
    const a = (a0 + (rand() - 0.5) * 20) * (Math.PI / 180);
    const d = 4.0 + rand() * 1.0;
    put(Math.round(Math.sin(a) * d), Math.round(Math.cos(a) * d), 1, "minecraft:bone_block", { pillar_axis: rand() < 0.5 ? "x" : "z" });
  }
  return out;
}

// The crypt's columns (the world's x, z), each to be cleared from the floor up and its dips filled.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function cryptColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = CRYPT.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// The way out (the bench: a crypt cut into rising ground had a rim of rock up to 5 blocks high round it, and its way in
// faced a wall): 3 wide in front of the way in, from just past the rim out 6 blocks, the Nether's own ground and plants
// cut away 4 blocks up from the floor's height. Only these blocks go (never a fortress's or a bastion's), so a path
// through a fortress's wall or a bastion is left as it was; where the ground falls away nothing is cut.
export const CRYPT_PATH = { half: 1, from: CRYPT.radius + 1, to: CRYPT.radius + 6, up: 4 };
export const CRYPT_CUT = [
  "minecraft:netherrack", "minecraft:soul_sand", "minecraft:soul_soil", "minecraft:basalt", "minecraft:smooth_basalt",
  "minecraft:gravel", "minecraft:magma", "minecraft:nether_gold_ore", "minecraft:quartz_ore", "minecraft:crimson_nylium",
  "minecraft:warped_nylium", "minecraft:nether_wart_block", "minecraft:warped_wart_block", "minecraft:shroomlight",
  "minecraft:crimson_stem", "minecraft:warped_stem", "minecraft:crimson_roots", "minecraft:warped_roots",
  "minecraft:nether_sprouts", "minecraft:crimson_fungus", "minecraft:warped_fungus", "minecraft:twisting_vines",
  "minecraft:weeping_vines", "minecraft:bone_block", "minecraft:glowstone", "minecraft:brown_mushroom", "minecraft:red_mushroom",
  "minecraft:fire", "minecraft:soul_fire",
];
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function cryptPath(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  for (let v = -CRYPT_PATH.from; v >= -CRYPT_PATH.to; v--) {
    for (let u = -CRYPT_PATH.half; u <= CRYPT_PATH.half; u++) {
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// --- The zoo necromancer's day (animals/yeti.js, as the zoo yeti's) ------------------------------------------------
// Calm: it wanders, eats at its feeder, holds its staff up and lets a soul flame float off it, chants softly, kneels to
// rest, and at night kneels with its head bowed. It never raises anything in the zoo.
export const NECRO_DAY = { ...ZOO_DAY, weights: { feeder: 3, toss: 1.4, roar: 0.6, sit: 1.5, wander: 3 } };
