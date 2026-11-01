// Lava Rays where you can see them (0.1.160, Austin: "I am not seeing any lava rays in the lava falls biome"), pure.
// The bench (BDS 1.26.60, seed 12345, the Lava Falls at 400 50): the game puts a spawn only in lava within 44 blocks of a
// player, so a player on the land (y 83) got 2 Lava Rays in 6 minutes, and both were where nobody sees them: one in a
// spring set into the roof (y 111), one in a single lava block in a wall (y 80); held over the lava sea, 1 in 6 minutes
// (the dragons and geckos added in 0.1.156 share the same animal picks). So, near players in the Lava Falls, a few rays
// are put in open lava you can see (a pool, a fall's pool or the lava sea: lava with air over it and more lava round
// it), and a wild ray the game put in a spring or a stream, out of sight, is moved to open lava near it (or taken away,
// so it doesn't hold the animal cap). The game side is animals/lavaRays.js.

export const LAVA_RAY = "zoocraft:wild_lava_ray";
export const LAVA_FALLS = "zoocraft:lava_falls";

export const LAVA_RAYS = {
  everyTicks: 200, // a look round each player in the Lava Falls every 10 seconds
  near: 48, // wild rays within this of the player are counted
  maxNear: 4, // none added while this many are near
  group: [1, 2], // rays added a look
  ring: [8, 26], // blocks out from the player (inside the 32 where a wild animal starts to despawn)
  up: 6, // the lava looked for from this far over the player's feet...
  down: 30, // ...down to this far under them (the lava sea at y 31 from the land at about y 60)
  tries: 48, // columns tried a look (the bench: about 1 in 18 columns round the land at 400 50 has a spot for a new ray)
  reach: 30, // a new ray's spot no further than this from the player, up and down too (wild animals start to despawn past 32)
  seedOpen: 5, // a new ray's spot: lava on at least this many of the 8 cells round its top (well inside a pool)
  keepOpen: 3, // a ray is in sight with this many (a pool's edge has 3 or more; a spring or a falling stream 0 to 2)
  deep: 24, // a lava column's top is looked for this far up
  moveRange: 16, // a ray out of sight is moved to open lava within this
  moveTries: 24,
  playerClear: 12, // a ray within this of a player is left as it is (just put down from a spawn egg or a carrier)
};

/** @param {string | undefined} id */
export const isLava = (id) => id === "minecraft:lava" || id === "minecraft:flowing_lava";

const AROUND = [
  [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1],
];

/** @typedef {(x: number, y: number, z: number) => string | undefined} IdAt */

// The top of the lava column (x, z) that holds y: up through the lava to the last lava block (at most `deep` up), or
// undefined if (x, y, z) isn't lava or the top wasn't found.
/** @param {IdAt} idAt @param {number} x @param {number} y @param {number} z */
export function lavaTop(idAt, x, y, z, deep = LAVA_RAYS.deep) {
  if (!isLava(idAt(x, y, z))) return undefined;
  for (let t = y; t < y + deep; t++) {
    if (!isLava(idAt(x, t + 1, z))) return t;
  }
  return undefined;
}

// The lava over the floor a look down stopped on: its column's top, or undefined. A look down (getBlockBelow) passes
// through lava, even told to stop on liquids (the bench: 400 looks down over the Lava Falls, with 281 open lava tops
// near, stopped on lava 0 times and on the floor under it, warped nylium, magma, netherrack, every time), so the lava is
// found from the floor up.
/** @param {IdAt} idAt @param {number} x @param {number} floorY @param {number} z @param {string | undefined} hitId */
export function lavaOverFloor(idAt, x, floorY, z, hitId, deep = LAVA_RAYS.deep) {
  return lavaTop(idAt, x, isLava(hitId) ? floorY : floorY + 1, z, deep);
}

// Whether the lava top at (x, y, z) is open lava: air over it (not rock: a spring set into the roof or a wall, or lava
// shut in the rock) and lava on at least `need` of the 8 cells round it at that height (a pool or the sea, not a spring's
// single block or a falling stream).
/** @param {IdAt} idAt @param {number} x @param {number} y @param {number} z @param {number} need */
export function isOpenLava(idAt, x, y, z, need) {
  if (!isLava(idAt(x, y, z)) || idAt(x, y + 1, z) !== "minecraft:air") return false;
  let n = 0;
  for (const [dx, dz] of AROUND) if (isLava(idAt(x + dx, y, z + dz))) n++;
  return n >= need;
}

// Whether an entity at `at` (a wild ray) is in open lava: the column it is in (its feet's block, or the one under it
// while it floats on the top), topped by open lava.
/** @param {IdAt} idAt @param {{ x: number, y: number, z: number }} at */
export function inOpenLava(idAt, at, need = LAVA_RAYS.keepOpen, deep = LAVA_RAYS.deep) {
  const x = Math.floor(at.x);
  const z = Math.floor(at.z);
  const y = Math.floor(at.y);
  for (const sy of [y, y - 1]) {
    const top = lavaTop(idAt, x, sy, z, deep);
    if (top !== undefined) return isOpenLava(idAt, x, top, z, need);
  }
  return false;
}

// Whether a spot is within `r` of the player, up and down too.
/** @param {{ x: number, y: number, z: number }} p @param {{ x: number, y: number, z: number }} spot @param {number} r */
export function withinReach(p, spot, r) {
  return Math.hypot(spot.x - p.x, spot.y - p.y, spot.z - p.z) <= r;
}

// Whether a ray at `at` is out of sight: in lava (its feet's block or the one under) that isn't open lava, a spring set
// into the rock or a falling stream. A ray on the bank is in sight (it strolls out now and then and goes back in by
// itself: on the bench, at a look 3 minutes in, 4 of 8 seeded rays were on the bank by their pools), so it is left alone.
/** @param {IdAt} idAt @param {{ x: number, y: number, z: number }} at */
export function outOfSight(idAt, at, need = LAVA_RAYS.keepOpen, deep = LAVA_RAYS.deep) {
  const x = Math.floor(at.x);
  const z = Math.floor(at.z);
  const y = Math.floor(at.y);
  if (!isLava(idAt(x, y, z)) && !isLava(idAt(x, y - 1, z))) return false;
  return !inOpenLava(idAt, at, need, deep);
}

// `n` columns round `p`, `ring[0]` to `ring[1]` blocks out, at random.
/** @param {{ x: number, z: number }} p @param {() => number} rand @param {number} n @param {number[]} ring */
export function ringColumns(p, rand, n, ring) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = ring[0] + rand() * (ring[1] - ring[0]);
    out.push({ x: Math.floor(p.x + Math.cos(a) * d), z: Math.floor(p.z + Math.sin(a) * d) });
  }
  return out;
}

// How many rays to add this look: none while `near` are about already, else a group (1 or 2) up to the cap.
/** @param {number} near @param {() => number} rand */
export function raysToAdd(near, rand, R = LAVA_RAYS) {
  if (near >= R.maxNear) return 0;
  const g = R.group[0] + Math.floor(rand() * (R.group[1] - R.group[0] + 1));
  return Math.min(g, R.maxNear - near);
}

// Where in an open lava top a ray goes: in the top block, a little under its surface (it floats up to the top itself).
/** @param {number} x @param {number} top @param {number} z */
export const raySpot = (x, top, z) => ({ x: x + 0.5, y: top + 0.2, z: z + 0.5 });
