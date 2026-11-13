// The fishing dimension's islands (0.1.272): where each one is, what kind it is and its shape, all worked out from the
// world's seed, so a world always has the same sky and every world a different one (Austin, 12 Nov 18:45Z: "we need to
// make sure each seed generates them randomly"). Nothing here touches the game: fishing/islands.js builds what these
// rules describe, a list of blocks at a time. Plan: research/Jack_rods_and_dimension_plan.md.
//
// The sky is cut into cells of LAYOUT.cell blocks. A cell holds one island or (LAYOUT.emptyChance) open sky. Cells go
// in regions of 2 by 2; a region can instead hold one huge island over all four (the ships and submarines, later) or a
// mythic one (the Shark People's town, later), and every world has one mythic region 2,000 to 4,000 blocks from the
// middle. An island's kind: common 55, uncommon 25, rare 12, exotic 7 (Austin's tiers). 0.1.272 built the common
// ones; 0.1.274 the uncommon ones too (BUILT): the common island's grass and ponds with amethyst worked through it, in
// purple and ZooCraft's red and blue (fishing/amethystRules.js): crystal spires, an open geode or two, crystals hanging
// under it and patches of amethyst in the grass. 0.1.275 the rare ones (Austin: "crying obsidian, and blackstone,
// gilded blackstone, some gold stuff as well, with a purply colored water"): blackstone ground with crimson nylium,
// huge crimson fungi for trees, a ruined portal of obsidian and crying obsidian with gold about it, broken pillars, gold
// in the stone, and ponds on magenta and purple beds (the sky's one biome gives all its water one colour, so the bed
// and a purple water fog, fishing/islands.js and equipment/divingHelmet.js, make it read purple). 0.1.276 the exotic
// ones (Austin: "a circled pool of water, relatively large, with large vibrant green weeping willows around it, there
// is a place for the angler to stand there as well. This shoud be a very lush island, with diamond shards sprinkled
// around as well"): one big round pool in the middle, deep in its centre; a ring of big bright green Weeping Willows
// round it leaning over the water; a spruce dock out into it from the side the portal is on, with lanterns at its end;
// grass and moss thick with flowers, ferns, azaleas and pink petals, a few azalea trees; seagrass and lily pads in the
// pool; glow berries hanging under it; and Diamond Shards lying about (fishing/diamondRules.js: 9 make a diamond). The
// 0.1.277 the mythic ones, each a town of the Shark People (Austin: "super rare, advanced fishing civilization of Shark
// People ... city like his picture, smaller"): a lagoon in the middle with a quay and piers, white houses with gold and
// blue domes round it, a palace with a great gold dome, a quartz wall with gold-domed towers and a golden gate, a ring
// of sea round the wall with sailboats on it, a causeway across it to a plaza on the beach (mythicSites). A mythic
// island takes a smaller radius than a huge one (MYTHIC_RADIUS) in the same place; no portal opens onto one, so it is
// found by travelling the sky. The huge ones stay open sky, untouched, until the version that builds them.
//
// 0.1.279: the closer sky (LAYOUT2, skyIslandsNear and the rest, after the first sky's layout below). Islands 172
// blocks apart instead of 256 (Austin: "33% closer"); the first sky's islands a world already built stay as they are.
// The game asks only the closer sky (sky...); the first sky's functions are for those islands and the tests.
//
// NEVER change LAYOUT or the hashing: islands already built in a world were placed by them.

export const FISHING = "zoocraft:fishing";

export const LAYOUT = Object.freeze({
  cell: 256,
  emptyChance: 0.12,
  kinds: /** @type {ReadonlyArray<[string, number]>} */ (Object.freeze([
    ["common", 55],
    ["uncommon", 25],
    ["rare", 12],
    ["exotic", 7],
  ])),
  hugeChance: 1 / 12,
  mythicChance: 0.01,
  mythicRing: Object.freeze([2000, 4000]),
  radius: Object.freeze([30, 60]),
  hugeRadius: Object.freeze([100, 130]),
  topY: Object.freeze([48, 200]),
  margin: 30,
});

/** The kinds of island this version builds; the rest wait, untouched, for theirs. */
export const BUILT = new Set(["common", "uncommon", "rare", "exotic", "mythic"]);

/** Most blocks in one list handed to the game at a time. */
export const BATCH = 2048;

// ---- hashing and noise

function mix(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** A 32-bit number from the seed and three whole numbers. */
export function hash(seed, a, b, c) {
  let h = mix((seed ^ 0x9e3779b9) >>> 0);
  h = mix((h ^ (a | 0)) >>> 0);
  h = mix((h + Math.imul(b | 0, 0x85ebca6b)) >>> 0);
  h = mix((h ^ Math.imul(c | 0, 0xc2b2ae35)) >>> 0);
  return h;
}

/** 0 (inclusive) to 1 (exclusive) from a hash. */
export const unit = (h) => h / 4294967296;

/** The world's seed (a string in the game) as a 32-bit number. */
export function seedOf(text) {
  let h = 0x811c9dc5;
  for (const ch of String(text ?? "")) {
    h ^= ch.codePointAt(0) ?? 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return mix(h >>> 0);
}

/** Smooth value noise, -1 to 1, one lattice step per unit. */
export function noise2(seed, x, z) {
  const x0 = Math.floor(x);
  const z0 = Math.floor(z);
  const fx = x - x0;
  const fz = z - z0;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = unit(hash(seed, x0, z0, 7)) * 2 - 1;
  const b = unit(hash(seed, x0 + 1, z0, 7)) * 2 - 1;
  const c = unit(hash(seed, x0, z0 + 1, 7)) * 2 - 1;
  const d = unit(hash(seed, x0 + 1, z0 + 1, 7)) * 2 - 1;
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Two octaves of noise2, -1 to 1. */
export function fbm2(seed, x, z) {
  return (noise2(seed, x, z) + 0.5 * noise2((seed + 1013) >>> 0, x * 2, z * 2)) / 1.5;
}

// ---- the layout

function mythicRegion(seed) {
  const a = unit(hash(seed, 0, 0, 101)) * Math.PI * 2;
  const [d0, d1] = LAYOUT.mythicRing;
  const d = d0 + unit(hash(seed, 0, 0, 103)) * (d1 - d0);
  const span = LAYOUT.cell * 2;
  return { rx: Math.floor((Math.cos(a) * d) / span), rz: Math.floor((Math.sin(a) * d) / span) };
}

/** "mythic", "huge" or undefined: what a region of 2 by 2 cells holds if it is one island. */
export function regionKind(seed, rx, rz) {
  const m = mythicRegion(seed);
  if (rx === m.rx && rz === m.rz) return "mythic";
  const u = unit(hash(seed, rx, rz, 107));
  if (u < LAYOUT.mythicChance) return "mythic";
  if (u < LAYOUT.mythicChance + LAYOUT.hugeChance) return "huge";
  return undefined;
}

/** How far an island's blocks can reach from its middle (its edge, the rocks floating round it). */
export function extentOf(isl) {
  return Math.ceil(isl.r * 1.15) + LAYOUT.margin;
}

function kindAt(seed, cx, cz) {
  const total = LAYOUT.kinds.reduce((s, [, w]) => s + w, 0);
  let u = unit(hash(seed, cx, cz, 137)) * total;
  for (const [k, w] of LAYOUT.kinds) {
    if (u < w) return k;
    u -= w;
  }
  return LAYOUT.kinds[0][0];
}

/**
 * The island in cell cx cz, or undefined for open sky: { id, kind, huge, x, z (its middle), y (its ground level),
 * r (its radius), s (its own seed) }. The four cells of a huge or mythic region give the same island.
 */
export function islandOf(seed, cx, cz) {
  const { cell } = LAYOUT;
  const rx = Math.floor(cx / 2);
  const rz = Math.floor(cz / 2);
  const big = regionKind(seed, rx, rz);
  const [y0, y1] = LAYOUT.topY;
  if (big) {
    const [r0, r1] = LAYOUT.hugeRadius;
    const u = unit(hash(seed, rx, rz, 109));
    const r = Math.round(r0 + u * (r1 - r0));
    const room = Math.max(0, cell - Math.ceil(r * 1.15) - LAYOUT.margin);
    const x = rx * 2 * cell + cell + Math.round((unit(hash(seed, rx, rz, 113)) * 2 - 1) * room);
    const z = rz * 2 * cell + cell + Math.round((unit(hash(seed, rx, rz, 127)) * 2 - 1) * room);
    const y = Math.round(y0 + unit(hash(seed, rx, rz, 131)) * (y1 - y0));
    // (0.1.277: a mythic island is a town smaller than a huge island, in the same place; its radius from the same number)
    const size = big === "mythic" ? Math.round(MYTHIC_RADIUS[0] + u * (MYTHIC_RADIUS[1] - MYTHIC_RADIUS[0])) : r;
    return { id: `r${rx},${rz}`, kind: big, huge: true, x, z, y, r: size, s: hash(seed, rx, rz, 139) };
  }
  if (unit(hash(seed, cx, cz, 149)) < LAYOUT.emptyChance) return undefined;
  const [r0, r1] = LAYOUT.radius;
  const r = Math.round(r0 + unit(hash(seed, cx, cz, 151)) * (r1 - r0));
  const lo = Math.ceil(r * 1.15) + LAYOUT.margin;
  const span = Math.max(0, cell - 2 * lo - 1);
  const x = cx * cell + lo + Math.floor(unit(hash(seed, cx, cz, 157)) * (span + 1));
  const z = cz * cell + lo + Math.floor(unit(hash(seed, cx, cz, 163)) * (span + 1));
  const y = Math.round(y0 + unit(hash(seed, cx, cz, 167)) * (y1 - y0));
  return { id: `${cx},${cz}`, kind: kindAt(seed, cx, cz), huge: false, x, z, y, r, s: hash(seed, cx, cz, 173) };
}

/** Every island whose blocks come within `reach` blocks of x z (each once). */
export function islandsNear(seed, x, z, reach) {
  const c = LAYOUT.cell;
  const out = new Map();
  for (let cx = Math.floor((x - reach) / c) - 1; cx <= Math.floor((x + reach) / c) + 1; cx++) {
    for (let cz = Math.floor((z - reach) / c) - 1; cz <= Math.floor((z + reach) / c) + 1; cz++) {
      const isl = islandOf(seed, cx, cz);
      if (!isl || out.has(isl.id)) continue;
      if (Math.hypot(isl.x - x, isl.z - z) - extentOf(isl) <= reach) out.set(isl.id, isl);
    }
  }
  return [...out.values()];
}

/** Whether this version builds that island (0.1.277: the mythic ones too, though they fill a region as a huge one does). */
export const builds = (isl) => Boolean(isl) && BUILT.has(isl.kind) && (!isl.huge || isl.kind === "mythic");

/**
 * The mythic island nearest x z within `regions` regions (of 2 by 2 cells) each way, or undefined: every world has
 * one 2,000 to 4,000 blocks from the middle, and about 1 region in 100 holds one.
 */
export function mythicNear(seed, x, z, regions = 10) {
  const span = LAYOUT.cell * 2;
  const rx0 = Math.floor(x / span);
  const rz0 = Math.floor(z / span);
  let best;
  for (let rz = rz0 - regions; rz <= rz0 + regions; rz++) {
    for (let rx = rx0 - regions; rx <= rx0 + regions; rx++) {
      if (regionKind(seed, rx, rz) !== "mythic") continue;
      const isl = /** @type {any} */ (islandOf(seed, rx * 2, rz * 2));
      const d = Math.hypot(isl.x - x, isl.z - z);
      if (!best || d < best.d) best = { isl, d };
    }
  }
  return best?.isl;
}

/** The island whose land covers x z (any kind, built or not), or undefined over open sky. */
export function islandAt(seed, x, z) {
  let best;
  for (const isl of islandsNear(seed, x, z, 0)) {
    const d = Math.hypot(isl.x - x, isl.z - z);
    if (d <= isl.r * 1.15 && (!best || d < best.d)) best = { isl, d };
  }
  return best?.isl;
}

/**
 * The loot table a catch comes from on an island of `islandKind`: an uncommon island's junk and treasure are its own
 * (0.1.274: amethyst shards and clusters in its three colours), a rare island's (0.1.275: blackstone, gold and the
 * Nether's treasures) and an exotic island's (0.1.276: its plants, and Diamond Shards, emeralds and the sea's
 * treasures) and a mythic island's (0.1.277: the sea's treasures, gold, prismarine, a trident now and then, a conduit
 * once in a long while), each mixed with the game's junk and treasure; fish, and everything on a common island, are the
 * game's (undefined).
 */
export const CATCH_SETS = Object.freeze({ uncommon: "crystal", rare: "gilded", exotic: "lush", mythic: "mythic" });
export function islandCatchPath(islandKind, kind) {
  const set = islandKind && Object.prototype.hasOwnProperty.call(CATCH_SETS, islandKind) ? CATCH_SETS[islandKind] : undefined;
  if (set && (kind === "junk" || kind === "treasure")) return `gameplay/fishing/zoocraft_${set}_${kind}`;
  return undefined;
}

/** What fills the gap under a return portal's frame: the island's own ground (0.1.275: a rare island's is blackstone). */
export const groundOf = (kind) => (kind === "rare" ? "minecraft:blackstone" : "minecraft:dirt");

/**
 * The island a portal at x z (in the fishing dimension's blocks) opens onto: the nearest one this version builds (0.1.277:
 * never a mythic one, which is found by travelling the sky: Austin, "super rare"); but
 * (0.1.275) like a Nether portal finding one already there, the nearest island that already has a return portal
 * (`linked`) if one is within a cell's width, so a later version building a new kind of island nearer doesn't move
 * where an old portal goes.
 */
export function arrivalIsland(seed, x, z, linked) {
  const near = islandsNear(seed, x, z, LAYOUT.cell * 6).filter((i) => builds(i) && i.kind !== "mythic");
  near.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z) || (a.id < b.id ? -1 : 1));
  if (linked) {
    const old = near.find((i) => Math.hypot(i.x - x, i.z - z) <= LAYOUT.cell && linked(i));
    if (old) return old;
  }
  return near[0];
}

// ---- an island's shape

// ---- the closer sky (0.1.279)
//
// Austin, 13 Nov: "the islands to be 33% closer, right now they are very spaced apart. Or use your judgement if you
// think 33% is too much". The layout above is the first sky (0.1.272 to 0.1.278). It stays only for the islands it
// already built in a world (`legacy`, from the world's records, legacyOf): they keep their places and their blocks, and
// portals that opened onto them still do. Every other island comes from this one: cells of 172 blocks instead of 256,
// each island within 8 blocks of its cell's middle (the first sky's could sit anywhere in its cell), so neighbours'
// middles are about 170 blocks apart instead of about 226, and the open sky between them about 70 blocks instead of
// about 127. A full third closer (cells of 160) would have left 1 island in 10 out and made the rest smaller, to keep
// them apart. No two islands come nearer each other than their two reaches and 4 blocks (reachOf: their land and the
// rocks floating off it): the lower in rank is made smaller, or left out if that would make it smaller than 30 (100
// for a huge one, 46 for a mythic one). Rank: an island already built, then mythic, then huge, then the rest, by their
// hashes. A cell is open sky 1 time in 20 (1 in 8 before). One too near an island a world already built first moves straight away from it (at most half a cell), so the
// old ones get neighbours as near as anywhere else, not a hole round them. The kinds are as before (55, 25, 12, 7 in 100; 1 region in 12 huge, 1 in 100 mythic; one mythic 2,000 to
// 4,000 blocks from the middle), all from a seed of their own made from the world's.
//
// NEVER change LAYOUT2 or its hashing either: once a world has built islands from it, they were placed by it.

export const LAYOUT2 = Object.freeze({
  cell: 172,
  jitter: 8,
  gap: 4,
  /** a cell of open sky: 1 in 20 (the first sky's 1 in 8 left gaps of two cells, the very spacing Austin meant) */
  emptyChance: 0.05,
  minRadius: 30,
  minHugeRadius: 100,
  /** how far skyMythicNear looks, in regions of 2 by 2 cells each way (beyond the one 2,000 to 4,000 out) */
  mythicRegions: 15,
});

/** How far an island's blocks reach from its middle: its land (at most 1.08 r) and the rocks floating off it (28 more). */
export const reachOf = (isl) => Math.ceil(isl.r * 1.08 + 28);

/** The closer sky's own seed, from the world's. */
export const seed2Of = (seed) => hash(seed, 279, 2, 0x5ca1);

const regions2 = new Map();
function mythicRegion2(s2) {
  let m = regions2.get(s2);
  if (m) return m;
  const a = unit(hash(s2, 0, 0, 101)) * Math.PI * 2;
  const [d0, d1] = LAYOUT.mythicRing;
  const d = d0 + unit(hash(s2, 0, 0, 103)) * (d1 - d0);
  const span = LAYOUT2.cell * 2;
  m = { rx: Math.floor((Math.cos(a) * d) / span), rz: Math.floor((Math.sin(a) * d) / span) };
  if (regions2.size > 64) regions2.clear();
  regions2.set(s2, m);
  return m;
}

/** "mythic", "huge" or undefined: what a region of 2 by 2 cells of the closer sky holds if it is one island. */
export function regionKind2(s2, rx, rz) {
  const m = mythicRegion2(s2);
  if (rx === m.rx && rz === m.rz) return "mythic";
  const u = unit(hash(s2, rx, rz, 107));
  if (u < LAYOUT.mythicChance) return "mythic";
  if (u < LAYOUT.mythicChance + LAYOUT.hugeChance) return "huge";
  return undefined;
}

const raw = new Map();
/**
 * A cell's island before it makes room for its neighbours in the closer sky, but after making room for the islands a
 * world already built (roomFromLegacy): { isl, rank } (rank: [tier, a hash]), or undefined.
 */
function cellOf2(s2, cx, cz, legacy) {
  const cache = legacy === LEGACY;
  const key = `${s2}:${cx},${cz}`;
  if (cache && raw.has(key)) return raw.get(key);
  const c0 = rawCell2(s2, cx, cz);
  const c = c0 && legacy.length ? roomFromLegacy(c0, legacy) : c0;
  if (cache) {
    if (raw.size > 40000) raw.clear();
    raw.set(key, c);
  }
  return c;
}

/**
 * An island of the closer sky too near one a world already built moves straight away from it until there is room
 * (the two reaches and the gap), at most half a cell from its place, so the old islands get neighbours as near as
 * everywhere else, not a hole round them; whatever is still too near makes it smaller, or leaves it out.
 */
function roomFromLegacy(c, legacy) {
  const isl = c.isl;
  const near = legacy.filter((l) => Math.abs(l.x - isl.x) < 520 && Math.abs(l.z - isl.z) < 520);
  if (!near.length) return c;
  const { gap, cell } = LAYOUT2;
  const most = cell / 2;
  let { x, z, r } = isl;
  for (let pass = 0; pass < 2; pass++) {
    for (const l of near) {
      const need = reachOf({ r }) + reachOf(l) + gap;
      const d = Math.hypot(x - l.x, z - l.z);
      if (d >= need) continue;
      const ux = d > 0.5 ? (x - l.x) / d : 1;
      const uz = d > 0.5 ? (z - l.z) / d : 0;
      let nx = l.x + ux * (need + 0.5);
      let nz = l.z + uz * (need + 0.5);
      const sd = Math.hypot(nx - isl.x, nz - isl.z);
      if (sd > most) {
        nx = isl.x + ((nx - isl.x) / sd) * most;
        nz = isl.z + ((nz - isl.z) / sd) * most;
      }
      x = Math.round(nx);
      z = Math.round(nz);
    }
  }
  const min = smallest(isl);
  for (const l of near) {
    const room = Math.hypot(l.x - x, l.z - z) - gap - reachOf(l);
    while (r >= min && Math.ceil(r * 1.08 + 28) > room) r--;
    if (r < min) return undefined;
  }
  return x === isl.x && z === isl.z && r === isl.r ? c : { isl: { ...isl, x, z, r }, rank: c.rank };
}

function rawCell2(s2, cx, cz) {
  const { cell, jitter } = LAYOUT2;
  const [y0, y1] = LAYOUT.topY;
  const rx = Math.floor(cx / 2);
  const rz = Math.floor(cz / 2);
  const big = regionKind2(s2, rx, rz);
  if (big) {
    const [r0, r1] = LAYOUT.hugeRadius;
    const u = unit(hash(s2, rx, rz, 109));
    const r = big === "mythic" ? Math.round(MYTHIC_RADIUS[0] + u * (MYTHIC_RADIUS[1] - MYTHIC_RADIUS[0])) : Math.round(r0 + u * (r1 - r0));
    const x = rx * 2 * cell + cell + Math.round((unit(hash(s2, rx, rz, 113)) * 2 - 1) * jitter);
    const z = rz * 2 * cell + cell + Math.round((unit(hash(s2, rx, rz, 127)) * 2 - 1) * jitter);
    const y = Math.round(y0 + unit(hash(s2, rx, rz, 131)) * (y1 - y0));
    return { isl: { id: `2:r${rx},${rz}`, kind: big, huge: true, x, z, y, r, s: hash(s2, rx, rz, 139) }, rank: [big === "mythic" ? 2 : 1, hash(s2, rx, rz, 223)] };
  }
  if (unit(hash(s2, cx, cz, 149)) < LAYOUT2.emptyChance) return undefined;
  const [r0, r1] = LAYOUT.radius;
  const r = Math.round(r0 + unit(hash(s2, cx, cz, 151)) * (r1 - r0));
  const x = cx * cell + cell / 2 + Math.round((unit(hash(s2, cx, cz, 157)) * 2 - 1) * jitter);
  const z = cz * cell + cell / 2 + Math.round((unit(hash(s2, cx, cz, 163)) * 2 - 1) * jitter);
  const y = Math.round(y0 + unit(hash(s2, cx, cz, 167)) * (y1 - y0));
  return { isl: { id: `2:${cx},${cz}`, kind: kindAt(s2, cx, cz), huge: false, x, z, y, r, s: hash(s2, cx, cz, 173) }, rank: [0, hash(s2, cx, cz, 211)] };
}

const outranks = (a, b) => a.rank[0] > b.rank[0] || (a.rank[0] === b.rank[0] && (a.rank[1] > b.rank[1] || (a.rank[1] === b.rank[1] && a.isl.id < b.isl.id)));
const smallest = (isl) => (isl.kind === "mythic" ? MYTHIC_RADIUS[0] : isl.huge ? LAYOUT2.minHugeRadius : LAYOUT2.minRadius);

/** A cell's island once it has made room for those that outrank it (they as they were before making room themselves). */
function settle2(s2, c, legacy) {
  const { cell, gap } = LAYOUT2;
  const isl = c.isl;
  const above = [];
  const seen = new Set([isl.id]);
  const cx0 = Math.floor(isl.x / cell);
  const cz0 = Math.floor(isl.z / cell);
  // (two huge islands' reaches and the gap come to under 2 cells, and each is at most half a cell from its place; 3
  // each way covers them)
  for (let dx = -3; dx <= 3; dx++) {
    for (let dz = -3; dz <= 3; dz++) {
      const o = cellOf2(s2, cx0 + dx, cz0 + dz, legacy);
      if (!o || seen.has(o.isl.id)) continue;
      seen.add(o.isl.id);
      if (outranks(o, c)) above.push(o.isl);
    }
  }
  for (const l of legacy) if (Math.abs(l.x - isl.x) < 520 && Math.abs(l.z - isl.z) < 520) above.push(l);
  const min = smallest(isl);
  let r = isl.r;
  for (const o of above) {
    const room = Math.hypot(o.x - isl.x, o.z - isl.z) - gap - reachOf(o);
    while (r >= min && Math.ceil(r * 1.08 + 28) > room) r--;
    if (r < min) return undefined;
  }
  return r === isl.r ? isl : { ...isl, r };
}

let LEGACY = Object.freeze(/** @type {any[]} */ ([]));
const settled = new Map();

/** The islands the first sky built in this world (legacyOf), which the closer sky keeps and makes room for. */
export function setLegacy(list) {
  LEGACY = Object.freeze([...list]);
  settled.clear();
  raw.clear();
}
export const legacyIslands = () => LEGACY;

/**
 * The first sky's islands named by `ids` (the world's island records: "cx,cz" or "rX,Z"; the closer sky's are "2:..."),
 * those of a kind that gets built.
 */
export function legacyOf(seed, ids) {
  const out = [];
  for (const id of ids) {
    if (typeof id !== "string") continue;
    const m = /^(r?)(-?\d+),(-?\d+)$/.exec(id);
    if (!m) continue;
    const a = Number(m[2]);
    const b = Number(m[3]);
    const isl = m[1] ? islandOf(seed, a * 2, b * 2) : islandOf(seed, a, b);
    if (isl && isl.id === id && builds(isl)) out.push(isl);
  }
  return out;
}

/** The closer sky's island in cell cx cz (the four cells of a huge or mythic region give the same one), or undefined. */
export function skyIslandOf(seed, cx, cz, legacy = LEGACY) {
  const s2 = seed2Of(seed);
  const key = `${s2}:${cx},${cz}`;
  const cache = legacy === LEGACY;
  if (cache && settled.has(key)) return settled.get(key);
  const c = cellOf2(s2, cx, cz, legacy);
  const isl = c ? settle2(s2, c, legacy) : undefined;
  if (cache) {
    if (settled.size > 20000) settled.clear();
    settled.set(key, isl);
  }
  return isl;
}

/** Every island whose blocks come within `reach` blocks of x z (each once): the closer sky's, and those already built. */
export function skyIslandsNear(seed, x, z, reach, legacy = LEGACY) {
  const c = LAYOUT2.cell;
  const out = new Map();
  for (let cx = Math.floor((x - reach) / c) - 1; cx <= Math.floor((x + reach) / c) + 1; cx++) {
    for (let cz = Math.floor((z - reach) / c) - 1; cz <= Math.floor((z + reach) / c) + 1; cz++) {
      const isl = skyIslandOf(seed, cx, cz, legacy);
      if (!isl || out.has(isl.id)) continue;
      if (Math.hypot(isl.x - x, isl.z - z) - extentOf(isl) <= reach) out.set(isl.id, isl);
    }
  }
  for (const l of legacy) if (!out.has(l.id) && Math.hypot(l.x - x, l.z - z) - extentOf(l) <= reach) out.set(l.id, l);
  return [...out.values()];
}

/** The island whose land covers x z (any kind, built or not), or undefined over open sky. */
export function skyIslandAt(seed, x, z, legacy = LEGACY) {
  let best;
  for (const isl of skyIslandsNear(seed, x, z, 0, legacy)) {
    const d = Math.hypot(isl.x - x, isl.z - z);
    if (d <= isl.r * 1.15 && (!best || d < best.d)) best = { isl, d };
  }
  return best?.isl;
}

/**
 * The island a portal at x z opens onto (as arrivalIsland did in the first sky): the nearest one that gets built, never
 * a mythic one; but the nearest one that already has a return portal (`linked`) if one is within 256 blocks, so a portal
 * that opened onto an island still does. A portal that opened onto one of the first sky's islands before 0.1.279 still
 * opens onto it: where the first sky's own choice (arrivalIsland, unchanged) is one of those islands, it stands. It
 * looks a little way out first, then farther (up to 1,536 blocks, as before).
 */
export function skyArrival(seed, x, z, linked, legacy = LEGACY) {
  if (linked && legacy.length) {
    const was = arrivalIsland(seed, x, z, linked);
    if (was && legacy.some((l) => l.id === was.id) && linked(was)) return was;
  }
  for (const reach of [LAYOUT.cell * 1.5, LAYOUT.cell * 3, LAYOUT.cell * 6]) {
    const near = skyIslandsNear(seed, x, z, reach, legacy).filter((i) => builds(i) && i.kind !== "mythic");
    near.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z) || (a.id < b.id ? -1 : 1));
    if (linked) {
      const old = near.find((i) => Math.hypot(i.x - x, i.z - z) <= LAYOUT.cell && linked(i));
      if (old) return old;
    }
    // (every island nearer than `reach` is in the list, so its nearest is the nearest there is)
    if (near.length && (Math.hypot(near[0].x - x, near[0].z - z) <= reach || reach === LAYOUT.cell * 6)) return near[0];
  }
  return undefined;
}

/**
 * The mythic island nearest x z, or undefined: the closer sky's within LAYOUT2.mythicRegions regions each way (every
 * world has one 2,000 to 4,000 blocks from the middle, and about 1 region in 100 holds one), and those already built.
 */
export function skyMythicNear(seed, x, z, regions = LAYOUT2.mythicRegions, legacy = LEGACY) {
  const s2 = seed2Of(seed);
  const span = LAYOUT2.cell * 2;
  const rx0 = Math.floor(x / span);
  const rz0 = Math.floor(z / span);
  const towns = [...legacy];
  for (let rz = rz0 - regions; rz <= rz0 + regions; rz++) {
    for (let rx = rx0 - regions; rx <= rx0 + regions; rx++) {
      if (regionKind2(s2, rx, rz) === "mythic") towns.push(skyIslandOf(seed, rx * 2, rz * 2, legacy));
    }
  }
  let best;
  let bestD = Infinity;
  for (const isl of towns) {
    if (!isl || isl.kind !== "mythic") continue;
    const d = Math.hypot(isl.x - x, isl.z - z);
    if (d < bestD) {
      best = isl;
      bestD = d;
    }
  }
  return best;
}

export const AIR = 0;
export const LAND = 1;
export const POND = 2;
export const ROCK = 3;
/** A column over an open geode (0.1.274): its top is the geode's floor. */
export const GEODE = 4;

/**
 * An empty shape for the island: per column of its square (side W, corner x0 z0) its kind (AIR, LAND, POND, ROCK),
 * top (the grass, or the water's surface), floor (a pond's bed; the grass elsewhere), bottom (the lowest block),
 * edge (how far out the column is, 0 the middle to 100 the shore) and roots (a hanging root under it).
 */
export function newShape(isl) {
  const R = extentOf(isl);
  const W = 2 * R + 1;
  const n = W * W;
  return {
    R,
    W,
    x0: isl.x - R,
    z0: isl.z - R,
    kind: new Uint8Array(n),
    top: new Int16Array(n),
    floor: new Int16Array(n),
    bottom: new Int16Array(n),
    edge: new Uint8Array(n),
    roots: new Uint8Array(n),
    ponds: [],
    rocks: [],
    landing: undefined,
    trees: [],
    geodes: [],
    sites: [],
    spires: [],
    hangers: [],
    patches: [],
    ruins: [],
    pillars: [],
    fungi: [],
    dock: undefined,
    shards: [],
  };
}

/** The column index of x z in the shape, or -1 outside it. */
export function at(sh, x, z) {
  const i = x - sh.x0;
  const j = z - sh.z0;
  return i < 0 || j < 0 || i >= sh.W || j >= sh.W ? -1 : j * sh.W + i;
}

/** Works the island's shape out into `sh`, a row of columns per step (so the game can spread it over ticks). */
export function* shapeSteps(isl, sh) {
  const { r, y: y0, s } = isl;
  const depth = Math.max(8, Math.round(r * 0.6));
  // the body: a rounded, wavy shore; gentle hills on top; a deep, rough, dripping underside (0.1.277: a mythic island's
  // is its town's, mythicBody)
  if (isl.kind === "mythic") yield* mythicBody(isl, sh, depth);
  else for (let j = 0; j < sh.W; j++) {
    const z = sh.z0 + j;
    for (let i = 0; i < sh.W; i++) {
      const x = sh.x0 + i;
      const dx = x - isl.x;
      const dz = z - isl.z;
      const d = Math.hypot(dx, dz);
      if (d > r * 1.1) continue;
      const ang = Math.atan2(dz, dx);
      const re = r * (0.86 + 0.14 * fbm2((s ^ 0x1) >>> 0, 3 + 2 * Math.cos(ang), 3 + 2 * Math.sin(ang)) + 0.08 * noise2((s ^ 0x2) >>> 0, x / 18, z / 18));
      if (d >= re) continue;
      const t = d / re;
      const top = y0 + Math.round(2.5 * (1 - t * t) + 1.8 * fbm2((s ^ 0x3) >>> 0, x / 24, z / 24) - (t > 0.8 ? (t - 0.8) * 8 : 0));
      const under = depth * Math.pow(Math.max(0, 1 - t * t), 0.7) * (0.75 + 0.35 * noise2((s ^ 0x4) >>> 0, x / 12, z / 12));
      let drip = 0;
      if (t < 0.85) {
        const q = noise2((s ^ 0x5) >>> 0, x / 5, z / 5);
        if (q > 0.5) drip = (q - 0.5) * 2 * depth * 0.35 * (1 - t);
      }
      const k = j * sh.W + i;
      sh.kind[k] = LAND;
      sh.top[k] = top;
      sh.floor[k] = top;
      sh.bottom[k] = top - 2 - Math.round(under + drip);
      sh.edge[k] = Math.min(100, Math.round(t * 100));
    }
    yield;
  }
  // an exotic island's one big round pool in its middle (0.1.276), instead of the ponds
  if (isl.kind === "exotic") {
    exoticPool(isl, sh);
    yield;
  }
  // ponds of normal water, each in a sealed basin well inside the shore
  const tries = isl.kind === "exotic" || isl.kind === "mythic" ? 0 : r >= 40 && unit(hash(s, 1, 0, 5)) < 0.6 ? 2 : 1;
  // a rare island always gets one (its purple water is its show): if its first looks found no room, up to 30 more
  const rarePonds = isl.kind === "rare";
  for (let p = 0; p < (rarePonds ? 32 : tries); p++) {
    if (p >= tries && sh.ponds.length) break;
    const a = unit(hash(s, p, 1, 7)) * Math.PI * 2;
    const dist = r * (0.12 + 0.28 * unit(hash(s, p, 2, 7)));
    // a rare island's ponds are its show (its purple water), so a little bigger (0.1.275)
    const big = isl.kind === "rare" ? 1.5 : 1;
    const pr = Math.max(4, Math.min(isl.kind === "rare" ? 14 : 10, Math.round(r * (0.11 + 0.08 * unit(hash(s, p, 3, 7))) * big)));
    const px = Math.round(isl.x + Math.cos(a) * dist);
    const pz = Math.round(isl.z + Math.sin(a) * dist);
    const bank = Math.ceil(pr * 1.7);
    if (sh.ponds.some((q) => Math.hypot(q.x - px, q.z - pz) < q.r * 1.7 + bank + 2)) continue;
    let ok = true;
    for (let z = pz - bank; z <= pz + bank && ok; z++) {
      for (let x = px - bank; x <= px + bank; x++) {
        if (Math.hypot(x - px, z - pz) > bank) continue;
        const k = at(sh, x, z);
        if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 85) {
          ok = false;
          break;
        }
      }
    }
    if (!ok) continue;
    sh.ponds.push({ x: px, z: pz, r: pr });
    for (let z = pz - bank; z <= pz + bank; z++) {
      for (let x = px - bank; x <= px + bank; x++) {
        const raw = Math.hypot(x - px, z - pz);
        if (raw > bank) continue;
        const k = at(sh, x, z);
        const pd = (raw / pr) * (1 + 0.18 * noise2((s ^ 0x6) >>> 0, x / 4, z / 4));
        if (pd < 1) {
          const floor = y0 - (1 + Math.round(2.5 * (1 - pd * pd)));
          sh.kind[k] = POND;
          sh.top[k] = y0;
          sh.floor[k] = floor;
          sh.bottom[k] = Math.min(sh.bottom[k], floor - 2);
        } else if (sh.kind[k] === LAND && sh.top[k] < y0) {
          sh.top[k] = y0;
          sh.floor[k] = y0;
        }
      }
    }
    yield;
  }
  // small rocks floating off the shore
  const rocks = 2 + Math.floor(unit(hash(s, 9, 0, 3)) * 3);
  for (let q = 0; q < rocks; q++) {
    const a = unit(hash(s, q, 9, 11)) * Math.PI * 2;
    const rr = 3 + Math.floor(unit(hash(s, q, 9, 13)) * 4);
    const dist = r * 1.08 + 8 + unit(hash(s, q, 9, 17)) * 14;
    const qx = Math.round(isl.x + Math.cos(a) * dist);
    const qz = Math.round(isl.z + Math.sin(a) * dist);
    const qy = y0 - 6 + Math.floor(unit(hash(s, q, 9, 19)) * 12);
    let free = true;
    for (let z = qz - rr - 2; z <= qz + rr + 2 && free; z++) for (let x = qx - rr - 2; x <= qx + rr + 2; x++) if (sh.kind[at(sh, x, z)] !== AIR) free = false;
    if (!free) continue;
    sh.rocks.push({ x: qx, z: qz, y: qy, r: rr });
    for (let z = qz - rr; z <= qz + rr; z++) {
      for (let x = qx - rr; x <= qx + rr; x++) {
        const d = Math.hypot(x - qx, z - qz) / (rr * (0.85 + 0.15 * noise2((s ^ 0x7) >>> 0, x / 3, z / 3)));
        if (d >= 1) continue;
        const k = at(sh, x, z);
        const top = qy + (d < 0.5 ? 1 : 0);
        sh.kind[k] = ROCK;
        sh.top[k] = top;
        sh.floor[k] = top;
        sh.bottom[k] = top - 1 - Math.round(rr * 1.3 * (1 - d * d));
        sh.edge[k] = 100;
      }
    }
  }
  // hanging roots under a few columns
  for (let k = 0; k < sh.kind.length; k++) {
    if (sh.kind[k] !== LAND || sh.edge[k] > 70) continue;
    const x = sh.x0 + (k % sh.W);
    const z = sh.z0 + Math.floor(k / sh.W);
    if (sh.top[k] - sh.bottom[k] >= 4 && unit(hash(s, x, z, 37)) < 0.05) sh.roots[k] = 1;
  }
  if (isl.kind === "uncommon") geodesOf(isl, sh);
  sh.landing = isl.kind === "mythic" ? mythicLanding(isl) : landingOf(isl, sh);
  if (isl.kind === "uncommon") {
    yield;
    crystalSites(isl, sh);
  }
  if (isl.kind === "rare") {
    yield;
    rareSites(isl, sh);
  }
  if (isl.kind === "exotic") {
    // its dock, its willows and azalea trees (its trees), then the Diamond Shards about it
    yield;
    exoticSites(isl, sh);
  } else if (isl.kind === "mythic") {
    // its town (0.1.277): its palms are its own, built block by block
    yield;
    yield* mythicSites(isl, sh);
  } else sh.trees = isl.kind === "rare" ? [] : treesOf(isl, sh);
  yield;
}

// ---- amethyst on an uncommon island (0.1.274)

/** The island's own colour of amethyst: purple 40 in 100, red 30, blue 30. */
export function colourOf(isl) {
  const u = unit(hash(isl.s, 61, 0, 1));
  return u < 0.4 ? "purple" : u < 0.7 ? "red" : "blue";
}

/** One feature's colour: the island's own 3 times in 5, else one of the other two. */
export function featureColour(isl, a, b) {
  const main = colourOf(isl);
  const u = unit(hash(isl.s, a, b, 63));
  if (u < 0.6) return main;
  const others = ["purple", "red", "blue"].filter((c) => c !== main);
  return others[u < 0.8 ? 0 : 1];
}

/** Ground whole and dry all round x z out to `n` blocks, well inside the shore. */
function solidGround(sh, x, z, n, maxEdge) {
  for (let dz = -n; dz <= n; dz++) {
    for (let dx = -n; dx <= n; dx++) {
      if (Math.hypot(dx, dz) > n) continue;
      const k = at(sh, x + dx, z + dz);
      if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > maxEdge) return false;
    }
  }
  return true;
}

/**
 * One or two open geodes (one on a smaller island): a hollow ball under the grass with its top cut off, so it's a
 * bowl lined with amethyst, then calcite, then smooth basalt, as the game's geodes, with crystals growing inside. The
 * columns over the hollow lose everything above its floor (GEODE).
 */
function geodesOf(isl, sh) {
  const n = isl.r >= 40 ? 2 : 1;
  for (let g = 0; g < 32 && sh.geodes.length < n; g++) {
    const R = 4 + Math.floor(unit(hash(isl.s, g, 71, 1)) * 3);
    const a = unit(hash(isl.s, g, 71, 2)) * Math.PI * 2;
    const dist = isl.r * 0.62 * Math.sqrt(unit(hash(isl.s, g, 71, 3)));
    const gx = Math.round(isl.x + Math.cos(a) * dist);
    const gz = Math.round(isl.z + Math.sin(a) * dist);
    if (!solidGround(sh, gx, gz, R + 3, 78)) continue;
    if (sh.ponds.some((p) => Math.hypot(p.x - gx, p.z - gz) < p.r * 1.7 + R + 3)) continue;
    if (sh.geodes.some((q) => Math.hypot(q.x - gx, q.z - gz) < q.R + R + 10)) continue;
    const cy = sh.top[at(sh, gx, gz)] - Math.round(R * 0.35);
    sh.geodes.push({ x: gx, z: gz, y: cy, R, colour: featureColour(isl, g, 73) });
    for (let z = gz - R; z <= gz + R; z++) {
      for (let x = gx - R; x <= gx + R; x++) {
        const h = Math.hypot(x - gx, z - gz);
        if (h >= R) continue;
        const k = at(sh, x, z);
        const floor = Math.floor(cy - Math.sqrt(R * R - h * h));
        if (floor >= sh.top[k]) continue;
        sh.kind[k] = GEODE;
        sh.top[k] = floor;
        sh.floor[k] = floor;
        sh.bottom[k] = Math.min(sh.bottom[k], floor - 4);
      }
    }
  }
}

/**
 * Where the amethyst grows: spire clusters on the grass (3 to 9, each one colour: a tall spire and up to three
 * smaller ones leaning out from it), crystals hanging under the island, and patches of amethyst in the grass. All
 * clear of the ponds, the geodes and the landing.
 */
function crystalSites(isl, sh) {
  const clear = (x, z, room, apart = 11) => {
    if (sh.landing && Math.hypot(x - sh.landing.x, z - sh.landing.z) < 9 + room) return false;
    if (sh.geodes.some((g) => Math.hypot(x - g.x, z - g.z) < g.R + 5 + room)) return false;
    if (sh.sites.some((q) => Math.hypot(x - q.x, z - q.z) < apart)) return false;
    return !nearWater(sh, x, z, 3 + room);
  };
  const want = Math.max(4, Math.round(isl.r / 8)) + Math.floor(unit(hash(isl.s, 81, 0, 1)) * 3);
  // the spots: the first look as it was; if a small or crowded island found fewer than 4, more looks, a little closer together
  const looks = [];
  for (let t = 0; t < want * 4; t++) looks.push([t, 11, 3]);
  for (let t = 1000; t < 1000 + want * 16; t++) looks.push([t, 8, 2]);
  for (const [t, apart, ground] of looks) {
    if (sh.sites.length >= (t >= 1000 ? 4 : want)) break;
    const a = unit(hash(isl.s, t, 81, 2)) * Math.PI * 2;
    const d = isl.r * 0.8 * Math.sqrt(unit(hash(isl.s, t, 81, 3)));
    const x = Math.round(isl.x + Math.cos(a) * d);
    const z = Math.round(isl.z + Math.sin(a) * d);
    if (!solidGround(sh, x, z, ground, 80) || !clear(x, z, 0, apart)) continue;
    const site = { x, z, colour: featureColour(isl, t, 83) };
    sh.sites.push(site);
    const u = (c) => unit(hash(isl.s, t, 85, c));
    const main = { x, z, y: sh.top[at(sh, x, z)] - 1, h: 8 + Math.floor(u(1) * 9), r0: 1.8 + u(2) * 1.0, tx: (u(3) - 0.5) * 0.24, tz: (u(4) - 0.5) * 0.24, colour: site.colour, dir: 1 };
    sh.spires.push(main);
    const more = 2 + Math.floor(u(5) * 3);
    for (let m = 0; m < more; m++) {
      const b = u(10 + m) * Math.PI * 2;
      const off = 2 + u(20 + m) * 1.5;
      const sx = Math.round(x + Math.cos(b) * off);
      const sz = Math.round(z + Math.sin(b) * off);
      const k = at(sh, sx, sz);
      if (k < 0 || sh.kind[k] !== LAND) continue;
      const lean = 0.25 + u(30 + m) * 0.2;
      sh.spires.push({ x: sx, z: sz, y: sh.top[k] - 1, h: 4 + Math.floor(u(40 + m) * 6), r0: 1.0 + u(50 + m) * 0.6, tx: Math.cos(b) * lean, tz: Math.sin(b) * lean, colour: site.colour, dir: 1 });
    }
  }
  // crystals hanging under the island
  const hangs = 2 + Math.round(isl.r / 12);
  for (let t = 0; t < hangs * 4 && sh.hangers.length < hangs; t++) {
    const a = unit(hash(isl.s, t, 87, 2)) * Math.PI * 2;
    const d = isl.r * 0.6 * Math.sqrt(unit(hash(isl.s, t, 87, 3)));
    const x = Math.round(isl.x + Math.cos(a) * d);
    const z = Math.round(isl.z + Math.sin(a) * d);
    const k = at(sh, x, z);
    if (k < 0 || sh.kind[k] !== LAND || sh.roots[k] || sh.edge[k] > 60) continue;
    if (sh.hangers.some((q) => Math.hypot(x - q.x, z - q.z) < 8)) continue;
    const u = (c) => unit(hash(isl.s, t, 89, c));
    sh.hangers.push({ x, z, y: sh.bottom[k], h: 5 + Math.floor(u(1) * 8), r0: 1.3 + u(2) * 0.9, tx: (u(3) - 0.5) * 0.3, tz: (u(4) - 0.5) * 0.3, colour: featureColour(isl, t, 91), dir: -1 });
  }
  // patches of amethyst showing through the grass
  const patches = 4 + Math.round(isl.r / 10);
  const tries = [];
  for (let t = 0; t < patches * 4; t++) tries.push([t, 2, 6]);
  for (let t = 1000; t < 1000 + patches * 16; t++) tries.push([t, 1, 4]);
  for (const [t, ground, apart] of tries) {
    if (sh.patches.length >= (t >= 1000 ? 3 : patches)) break;
    const a = unit(hash(isl.s, t, 93, 2)) * Math.PI * 2;
    const d = isl.r * 0.85 * Math.sqrt(unit(hash(isl.s, t, 93, 3)));
    const x = Math.round(isl.x + Math.cos(a) * d);
    const z = Math.round(isl.z + Math.sin(a) * d);
    if (!solidGround(sh, x, z, ground, 85) || !clear(x, z, 0, 6)) continue;
    if (sh.patches.some((q) => Math.hypot(x - q.x, z - q.z) < apart)) continue;
    sh.patches.push({ x, z, r: 1 + unit(hash(isl.s, t, 95, 1)) * 1.3, colour: featureColour(isl, t, 97) });
  }
}

// ---- a rare island (0.1.275): blackstone, gold, crimson fungi and a ruined portal

/**
 * Where a rare island's builds stand, all clear of its ponds, its landing and each other: a ruined portal (two on a
 * big island), a few broken pillars and huge crimson fungi (its trees: at least 3, more on a big island).
 */
function rareSites(isl, sh) {
  const s = isl.s;
  const far = (x, z, list, n) => list.every((q) => Math.hypot(x - q.x, z - q.z) >= n);
  const offLanding = (x, z, n) => !sh.landing || Math.hypot(x - sh.landing.x, z - sh.landing.z) >= n;
  // the ruined portal: obsidian and crying obsidian, 4 to 6 wide and 5 to 7 tall, broken in places
  // (a small island with a big pond: a second look, a little closer to the water and the landing, so it gets one)
  const ruins = isl.r >= 45 ? 2 : 1;
  const looks = [];
  for (let t = 0; t < 48; t++) looks.push([t, 4, 6, 14]);
  for (let t = 1000; t < 1064; t++) looks.push([t, 3, 4, 11]);
  for (const [t, ground, water, landing] of looks) {
    if (sh.ruins.length >= (t >= 1000 ? 1 : ruins)) break;
    const a = unit(hash(s, t, 201, 1)) * Math.PI * 2;
    const d = isl.r * 0.62 * Math.sqrt(unit(hash(s, t, 201, 2)));
    const x = Math.round(isl.x + Math.cos(a) * d);
    const z = Math.round(isl.z + Math.sin(a) * d);
    if (!solidGround(sh, x, z, ground, 72) || nearWater(sh, x, z, water) || !offLanding(x, z, landing) || !far(x, z, sh.ruins, 22)) continue;
    sh.ruins.push({ x, z, axis: unit(hash(s, t, 201, 3)) < 0.5 ? "x" : "z", w: 4 + Math.floor(unit(hash(s, t, 201, 4)) * 3), h: 5 + Math.floor(unit(hash(s, t, 201, 5)) * 3), t });
  }
  // broken pillars of polished blackstone bricks, some with a gold block on top
  const pillars = 3 + Math.floor(isl.r / 20);
  for (let t = 0; t < pillars * 8 && sh.pillars.length < pillars; t++) {
    const a = unit(hash(s, t, 203, 1)) * Math.PI * 2;
    const d = isl.r * 0.8 * Math.sqrt(unit(hash(s, t, 203, 2)));
    const x = Math.round(isl.x + Math.cos(a) * d);
    const z = Math.round(isl.z + Math.sin(a) * d);
    if (!solidGround(sh, x, z, 1, 80) || nearWater(sh, x, z, 2) || !offLanding(x, z, 8) || !far(x, z, sh.ruins, 9) || !far(x, z, sh.pillars, 6)) continue;
    sh.pillars.push({ x, z, h: 2 + Math.floor(unit(hash(s, t, 203, 3)) * 5), gold: unit(hash(s, t, 203, 4)) < 0.45, t });
  }
  // huge crimson fungi: a first look on a grid (at most 6, 9 on a big island), then, if it found fewer than 3 (5 on
  // a big island), a second look in its own random order over the spots between, and a third a little closer in
  const want = isl.r >= 45 ? 5 : 3;
  const most = isl.r >= 45 ? 9 : 6;
  const grow = (x, z, near = false) => {
    const k = at(sh, x, z);
    if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 75 || sh.top[k] !== sh.floor[k] || nearWater(sh, x, z, near ? 3 : 4)) return;
    if (!offLanding(x, z, near ? 9 : 11) || !far(x, z, sh.ruins, near ? 9 : 11) || !far(x, z, sh.pillars, near ? 5 : 6) || !far(x, z, sh.fungi, near ? 8 : 9)) return;
    const h = 5 + Math.floor(unit(hash(s, x, z, 209)) * 6);
    sh.fungi.push({ x, z, y: sh.top[k] + 1, h, R: h >= 8 ? 3 : 2 });
  };
  for (let gz = -sh.R; gz <= sh.R && sh.fungi.length < most; gz += 9) {
    for (let gx = -sh.R; gx <= sh.R && sh.fungi.length < most; gx += 9) {
      if (unit(hash(s, gx, gz, 205)) < 0.45) grow(isl.x + gx + Math.floor(unit(hash(s, gx, gz, 206)) * 5) - 2, isl.z + gz + Math.floor(unit(hash(s, gx, gz, 207)) * 5) - 2);
    }
  }
  const more = [];
  for (let gz = -sh.R + 2; gz <= sh.R; gz += 4) for (let gx = -sh.R + 2; gx <= sh.R; gx += 4) more.push([gx, gz, unit(hash(s, gx, gz, 208))]);
  more.sort((a, b) => a[2] - b[2]);
  for (const near of [false, true]) {
    for (const [gx, gz] of more) {
      if (sh.fungi.length >= want) break;
      grow(isl.x + gx, isl.z + gz, near);
    }
  }
}

/** The cells of a huge crimson fungus: its stem, its cap of nether wart with shroomlights inside, vines under its rim. */
function fungusCells(f, s) {
  const out = [];
  const u = (x, y, z, c) => unit(hash(s, x * 3 + c, y, z * 5 + c));
  for (let i = 0; i < f.h; i++) out.push({ x: f.x, y: f.y + i, z: f.z, id: "minecraft:crimson_stem" });
  const capH = f.R + 1;
  const top = f.y + f.h;
  const hem = [];
  for (let L = 0; L < capH; L++) {
    const y = top - L;
    const r = L === 0 ? f.R - 1 : f.R;
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        const ring = Math.max(Math.abs(dx), Math.abs(dz));
        const x = f.x + dx;
        const z = f.z + dz;
        if (Math.abs(dx) === r && Math.abs(dz) === r && r > 1) continue; // round off the corners
        if (L === 0) {
          out.push({ x, y, z, id: "minecraft:nether_wart_block" });
          continue;
        }
        if (ring === r) {
          if (L === capH - 1 && u(x, y, z, 1) < 0.35) continue; // a ragged hem
          out.push({ x, y, z, id: u(x, y, z, 2) < 0.1 ? "minecraft:shroomlight" : "minecraft:nether_wart_block" });
          if (L === capH - 1) hem.push({ x, y, z });
        } else if (ring === r - 1 && !(dx === 0 && dz === 0)) {
          const v = u(x, y, z, 3);
          if (v < 0.14) out.push({ x, y, z, id: "minecraft:shroomlight" });
          else if (v < 0.3) out.push({ x, y, z, id: "minecraft:nether_wart_block" });
        }
      }
    }
  }
  for (const c of hem) {
    if (u(c.x, c.y, c.z, 4) >= 0.3) continue;
    const n = 1 + Math.floor(u(c.x, c.y, c.z, 5) * 3);
    for (let i = 1; i <= n; i++) out.push({ x: c.x, y: c.y - i, z: c.z, id: "minecraft:weeping_vines", hang: true });
  }
  return out;
}

/**
 * A rare island's builds, worked out from its shape: the ruined portals (frame, rubble, the worked stone and gold
 * round its foot, blackstone under the frame where the ground dips), the pillars and the fungi. Returns
 * Map("x,y,z" -> block id); a cell already taken keeps its first block, as the game's air-only fills do.
 */
export function rareOfIsland(isl, sh) {
  const s = isl.s;
  const out = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  const set = (x, y, z, id) => {
    const k = key(x, y, z);
    if (!out.has(k)) out.set(k, id);
  };
  const topAt = (x, z) => {
    const k = at(sh, x, z);
    return k < 0 || sh.kind[k] !== LAND ? undefined : sh.top[k];
  };
  for (const ru of sh.ruins) {
    const [ax, az] = ru.axis === "x" ? [1, 0] : [0, 1];
    const lo = -Math.floor((ru.w - 1) / 2);
    let base = -Infinity;
    for (let i = 0; i < ru.w; i++) base = Math.max(base, (topAt(ru.x + (lo + i) * ax, ru.z + (lo + i) * az) ?? -Infinity) + 1);
    const u = (a, b, c) => unit(hash(s, ru.t * 31 + a, b, 211 + c));
    const missing = [];
    for (let i = 0; i < ru.w; i++) {
      const x = ru.x + (lo + i) * ax;
      const z = ru.z + (lo + i) * az;
      const tp = topAt(x, z);
      for (let y = tp + 1; y < base; y++) set(x, y, z, "minecraft:blackstone");
      for (let j = 0; j < ru.h; j++) {
        if (i !== 0 && i !== ru.w - 1 && j !== 0 && j !== ru.h - 1) continue;
        const v = u(i, j, 1);
        const corner = (i === 0 || i === ru.w - 1) && j === ru.h - 1;
        if (j > 0 && v < (corner ? 0.45 : 0.2)) {
          missing.push([i, j]);
          continue;
        }
        if (j === 0 && v < 0.06) continue;
        set(x, base + j, z, v < 0.48 ? "minecraft:crying_obsidian" : "minecraft:obsidian");
      }
    }
    // the worked stone round its foot: polished and cracked bricks, gilded blackstone and a little magma
    for (let dz = -4; dz <= 4; dz++) {
      for (let dx = -4; dx <= 4; dx++) {
        if (Math.hypot(dx, dz) > 3.6) continue;
        const x = ru.x + dx;
        const z = ru.z + dz;
        const tp = topAt(x, z);
        if (tp === undefined) continue;
        const v = u(dx + 9, dz + 9, 2);
        const id = v < 0.34 ? "minecraft:polished_blackstone_bricks" : v < 0.5 ? "minecraft:cracked_polished_blackstone_bricks" : v < 0.6 ? "minecraft:gilded_blackstone" : v < 0.64 ? "minecraft:magma" : undefined;
        if (id) set(x, tp, z, id);
      }
    }
    // the pieces that fell, lying near it, and gold blocks
    const lying = [];
    for (const [i, j] of missing) {
      if (u(i, j, 3) >= 0.55) continue;
      const side = u(i, j, 4) < 0.5 ? -1 : 1;
      const off = 2 + Math.floor(u(i, j, 5) * 2);
      const along = lo + i + Math.floor(u(i, j, 6) * 3) - 1;
      lying.push([ru.x + along * ax + side * off * az, ru.z + along * az + side * off * ax, u(i, j, 7) < 0.5 ? "minecraft:obsidian" : "minecraft:crying_obsidian"]);
    }
    const golds = 1 + Math.floor(u(0, 0, 8) * 3);
    for (let g = 0; g < golds; g++) {
      const side = u(g, 1, 9) < 0.5 ? -1 : 1;
      const off = 1 + Math.floor(u(g, 2, 9) * 3);
      const along = lo - 1 + Math.floor(u(g, 3, 9) * (ru.w + 2));
      lying.push([ru.x + along * ax + side * off * az, ru.z + along * az + side * off * ax, "minecraft:gold_block"]);
    }
    for (const [x, z, id] of lying) {
      const tp = topAt(x, z);
      if (tp === undefined || out.has(key(x, tp + 1, z))) continue;
      set(x, tp + 1, z, id);
    }
  }
  for (const p of sh.pillars) {
    const tp = topAt(p.x, p.z);
    for (let i = 1; i <= p.h; i++) set(p.x, tp + i, p.z, i === p.h ? "minecraft:chiseled_polished_blackstone" : unit(hash(s, p.t, i, 217)) < 0.3 ? "minecraft:cracked_polished_blackstone_bricks" : "minecraft:polished_blackstone_bricks");
    if (p.gold && p.h >= 3) set(p.x, tp + p.h + 1, p.z, "minecraft:gold_block");
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const t2 = topAt(p.x + dx, p.z + dz);
      if (t2 !== undefined) set(p.x + dx, t2, p.z + dz, "minecraft:polished_blackstone_bricks");
    }
  }
  // the fungi: no cell of a cap or its vines goes into the ground where the land rises under it
  for (const f of sh.fungi) {
    const cut = new Set();
    for (const c of fungusCells(f, s)) {
      const k = at(sh, c.x, c.z);
      const ground = k >= 0 && sh.kind[k] !== AIR && c.y <= sh.top[k];
      if (c.hang && (ground || cut.has(`${c.x},${c.z}`))) {
        cut.add(`${c.x},${c.z}`);
        continue;
      }
      if (!ground) set(c.x, c.y, c.z, c.id);
    }
  }
  return out;
}

/** The block on top of a rare island's column (0.1.275): blackstone, crimson nylium in patches and round each fungus, gilded specks, crying obsidian at the ponds' edges. */
function rareTopOf(isl, sh, k, x, z) {
  const s = isl.s;
  if (sh.kind[k] === LAND && sh.top[k] === isl.y && (isWet(sh, x + 1, z) || isWet(sh, x - 1, z) || isWet(sh, x, z + 1) || isWet(sh, x, z - 1))) {
    return unit(hash(s, x, z, 221)) < 0.4 ? "minecraft:crying_obsidian" : "minecraft:blackstone";
  }
  if (sh.fungi.some((f) => Math.hypot(x - f.x, z - f.z) <= 2.5)) return "minecraft:crimson_nylium";
  if (!nearWater(sh, x, z, 1) && fbm2((s ^ 0xa) >>> 0, x / 11, z / 11) > 0.12) return "minecraft:crimson_nylium";
  const u = unit(hash(s, x, z, 223));
  if (u < 0.035) return "minecraft:gilded_blackstone";
  return "minecraft:blackstone";
}

/** A rare pond's bed: magenta and purple, so the clear water over it reads purple, with crying obsidian glowing here and there. */
function rareBedOf(isl, x, z) {
  const u = unit(hash(isl.s, x, z, 225));
  if (u < 0.14) return "minecraft:crying_obsidian";
  return noise2((isl.s ^ 0xc) >>> 0, x / 4, z / 4) > 0.15 ? "minecraft:purple_concrete" : "minecraft:magenta_concrete";
}

/** The island's whole shape at once (tests, and anything that needn't spread it out). */
// ---- an exotic island (0.1.276): its pool, dock, willows and Diamond Shards

/** How much farther than the pool's edge the land round it reaches before it rises to the island's own ground. */
const POOL_BANK = 7;

/**
 * The one big round pool in the middle of an exotic island: as big as the island leaves room for (a third or so of its
 * radius, 10 to 20 blocks; smaller if the land round it is short), 1 block deep at the edge and 6 in the middle, the
 * ground round it eased down to the water's level so its banks are low and level.
 */
function exoticPool(isl, sh) {
  const { s, y: y0 } = isl;
  const a = unit(hash(s, 2, 1, 7)) * Math.PI * 2;
  const off = isl.r * 0.05 * unit(hash(s, 2, 2, 7));
  const px = Math.round(isl.x + Math.cos(a) * off);
  const pz = Math.round(isl.z + Math.sin(a) * off);
  const want = Math.max(10, Math.min(22, Math.round(isl.r * (0.4 + 0.06 * unit(hash(s, 2, 3, 7))))));
  for (let pr = want; pr >= 8; pr--) {
    const ring = pr + POOL_BANK;
    let ok = true;
    for (let z = pz - ring; z <= pz + ring && ok; z++) {
      for (let x = px - ring; x <= px + ring; x++) {
        if (Math.hypot(x - px, z - pz) > ring) continue;
        const k = at(sh, x, z);
        if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 85) {
          ok = false;
          break;
        }
      }
    }
    if (!ok) continue;
    sh.ponds.push({ x: px, z: pz, r: pr, pool: true });
    for (let z = pz - ring; z <= pz + ring; z++) {
      for (let x = px - ring; x <= px + ring; x++) {
        const raw = Math.hypot(x - px, z - pz);
        if (raw > ring) continue;
        const k = at(sh, x, z);
        const pd = (raw / pr) * (1 + 0.05 * noise2((s ^ 0x6) >>> 0, x / 5, z / 5));
        if (pd < 1) {
          const floor = y0 - (1 + Math.round(5 * (1 - pd * pd)));
          sh.kind[k] = POND;
          sh.top[k] = y0;
          sh.floor[k] = floor;
          sh.bottom[k] = Math.min(sh.bottom[k], floor - 2);
        } else {
          const u = Math.min(1, Math.max(0, (raw - pr) / POOL_BANK));
          const top = y0 + Math.round(Math.max(0, sh.top[k] - y0) * u * u * (3 - 2 * u));
          sh.top[k] = top;
          sh.floor[k] = top;
        }
      }
    }
    return;
  }
}

/** An exotic island's pool, if it got one. */
export const poolOf = (sh) => sh.ponds.find((q) => q.pool);

/**
 * The dock: from the pool's bank straight out into it, 3 wide, a third to a half of the pool's radius long (5 to 9),
 * its deck of spruce planks at the water's level (the bank's), on spruce log pilings down to the bed, a fence post with
 * a lantern on each corner of its far end, and a barrel on the bank beside it. It goes out from the side of the pool the
 * portal is on, so a player coming through sees it, but never within 3 blocks of the portal's frame or its pad (tried
 * in the four directions, nearest the portal first). Returns { axis "x"|"z", dir 1|-1, x, z (the deck's middle on the
 * bank), end (its middle at the far end), len, blocks Map("x,y,z" -> [id, states]) }.
 */
function dockOf(isl, sh, pool) {
  const s = isl.s;
  const y0 = isl.y;
  const L = sh.landing;
  let ax;
  let az;
  if (L) {
    ax = L.x + 0.5 - pool.x;
    az = L.z - pool.z;
  } else {
    const a = unit(hash(s, 81, 0, 1)) * Math.PI * 2;
    ax = Math.cos(a);
    az = Math.sin(a);
  }
  const want = Math.atan2(az, ax);
  const dirs = /** @type {Array<[string, number, number]>} */ ([["x", 1, 0], ["x", -1, Math.PI], ["z", 1, Math.PI / 2], ["z", -1, -Math.PI / 2]]);
  const off = (a) => Math.abs(Math.atan2(Math.sin(a - want), Math.cos(a - want)));
  dirs.sort((p, q) => off(p[2]) - off(q[2]));
  const len = Math.max(5, Math.min(9, Math.round(pool.r * 0.45)));
  // the portal's frame (4 along x, from x-1) and the pad the player steps out onto
  const clear = (x, z) => !L || x < L.x - 4 || x > L.x + 5 || Math.abs(z - L.z) > 3;
  for (const [axis, dir] of dirs) {
    const cell = (along, side) => (axis === "x" ? { x: pool.x + dir * along, z: pool.z + side } : { x: pool.x + side, z: pool.z + dir * along });
    // the bank: the first step out along the line where none of the 3 columns is water
    let bank = 0;
    for (let d = 1; d <= pool.r + POOL_BANK && !bank; d++) {
      if ([-1, 0, 1].every((w) => {
        const c = cell(d, w);
        return sh.kind[at(sh, c.x, c.z)] !== POND;
      })) bank = d;
    }
    if (!bank) continue;
    const end = bank - len;
    const blocks = new Map();
    const put = (x, y, z, id, states) => {
      const k = `${x},${y},${z}`;
      if (!blocks.has(k)) blocks.set(k, [id, states]);
    };
    let ok = true;
    for (let d = bank + 1; d >= end; d--) {
      for (const w of [-1, 0, 1]) {
        const c = cell(d, w);
        const k = at(sh, c.x, c.z);
        if (k < 0 || !clear(c.x, c.z) || (sh.kind[k] !== POND && sh.kind[k] !== LAND)) ok = false;
        if (k < 0) continue;
        put(c.x, y0, c.z, "minecraft:spruce_planks");
        // pilings: under its sides every third step, and its far end, from the deck down to the bed
        if (sh.kind[k] === POND && w !== 0 && (d === end || (bank - d) % 3 === 2)) {
          for (let y = y0 - 1; y > sh.floor[k]; y--) put(c.x, y, c.z, "minecraft:spruce_log");
        }
      }
    }
    for (const w of [-1, 1]) {
      const c = cell(end, w);
      put(c.x, y0 + 1, c.z, "minecraft:spruce_fence");
      put(c.x, y0 + 2, c.z, "minecraft:lantern", { hanging: false });
    }
    const b = cell(bank + 1, 2);
    const kb = at(sh, b.x, b.z);
    if (kb >= 0 && sh.kind[kb] === LAND && clear(b.x, b.z)) put(b.x, sh.top[kb] + 1, b.z, "minecraft:barrel", { facing_direction: 1 });
    const root = cell(bank, 0);
    const dock = { axis, dir, x: root.x, z: root.z, len, end: cell(end, 0), blocks };
    if (ok) return dock;
  }
  return undefined;
}

/** The Weeping Willows (0.1.276): a big one on a trunk 2 wide, and a smaller one; each with its strands hanging. */
export const WILLOWS = Object.freeze({ great: "zoocraft:weeping_willow_great_with_strands", small: "zoocraft:weeping_willow_with_strands" });
/** An exotic island's azalea trees (the game's azalea leaves, one in two flowering). */
export const AZALEAS = Object.freeze(["zoocraft:azalea_round", "zoocraft:azalea_round_flowering"]);

/**
 * How far out a tree's wood can reach from its trunk's middle (its trunk's lean and its branches; its leaves can meet
 * another tree's, but a tree whose trunk or branches would run into another's wood does not grow: 0.1.276 bench, a
 * small willow 12 from a big one did not): a big willow 8, a small one 6, an azalea tree 2.
 */
const REACH = Object.freeze({ 2: 8, 1: 6, 0: 2 });
const middle = (t) => [t.x + (t.w - 1) / 2, t.z + (t.w - 1) / 2];
/**
 * Whether a tree w wide (0 for an azalea tree) at x, z would be too close to any of the trees: their reaches and 1.
 * @param {Array<{x: number, z: number, w: number, azalea?: boolean}>} trees
 */
function crowded(trees, x, z, w) {
  const [mx, mz] = middle({ x, z, w: Math.max(1, w) });
  return trees.some((t) => {
    const [tx, tz] = middle(t);
    return Math.hypot(mx - tx, mz - tz) < REACH[w] + REACH[t.azalea ? 0 : t.w] + 1;
  });
}

/**
 * The places of an exotic island's builds: its dock (out from the bank the portal is on), its ring of Weeping Willows
 * round the pool (5 to 9, at least 4, clear of the dock and the landing), a few azalea trees out on the rest of it and
 * its Diamond Shards, sprinkled over the land (8 and one for every 3 blocks of its radius).
 */
function exoticSites(isl, sh) {
  const s = isl.s;
  const pool = poolOf(sh);
  const offLanding = (x, z, n) => !sh.landing || Math.hypot(x - (sh.landing.x + 0.5), z - sh.landing.z) >= n;
  const trees = [];
  /** columns the trees' trunks take */
  const trunks = new Set();
  if (pool) {
    sh.dock = dockOf(isl, sh, pool);
    const dock = sh.dock;
    // how far a spot is from the dock's line (its deck from the bank out to its end)
    const offDock = (x, z) => {
      const [a0, a1] = dock.axis === "x" ? [Math.min(dock.x, dock.end.x), Math.max(dock.x, dock.end.x)] : [Math.min(dock.z, dock.end.z), Math.max(dock.z, dock.end.z)];
      const along = dock.axis === "x" ? x : z;
      const across = dock.axis === "x" ? z - dock.z : x - dock.x;
      const da = along < a0 ? a0 - along : along > a1 ? along - a1 : 0;
      return Math.hypot(da, across);
    };
    // the ground under a trunk w wide: its lowest top, if it steps by no more than 1 (the higher grass under a big
    // trunk is then taken down to it, so the trunk's foot is clear: 0.1.276 bench, a big willow whose corner stood on
    // the higher grass did not grow)
    const flat = (x, z, w) => {
      let lo = Infinity;
      let hi = -Infinity;
      for (let dz = 0; dz < w; dz++) {
        for (let dx = 0; dx < w; dx++) {
          const k = at(sh, x + dx, z + dz);
          if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 80) return undefined;
          lo = Math.min(lo, sh.top[k]);
          hi = Math.max(hi, sh.top[k]);
        }
      }
      return hi - lo <= 1 ? lo : undefined;
    };
    const ring = [];
    const n = Math.max(5, Math.min(9, Math.round((2 * Math.PI * (pool.r + 5)) / 11)));
    const a0 = unit(hash(s, 70, 0, 1)) * Math.PI * 2;
    // a first ring just off the water, then (if the dock, the landing or the shore took too many) a second, farther out
    for (const [pass, out, count] of [[0, 4, n], [1, 7, n + 2]]) {
      for (let i = 0; i < count; i++) {
        if (pass === 1 && ring.length >= 4) break;
        const a = a0 + ((i + pass * 0.5) * 2 * Math.PI) / count + (unit(hash(s, i, 72 + pass, 1)) - 0.5) * (Math.PI / count) * 0.7;
        const d = pool.r + out + Math.floor(unit(hash(s, i, 72 + pass, 2)) * 2);
        const x = Math.round(pool.x + Math.cos(a) * d);
        const z = Math.round(pool.z + Math.sin(a) * d);
        if (!offLanding(x, z, 9) || offDock(x, z) < 6) continue;
        // a big willow if it was drawn and has room, else a small one, else none
        for (const w of unit(hash(s, i, 72 + pass, 3)) < (isl.r >= 45 ? 0.7 : 0.55) ? [2, 1] : [1]) {
          const top = flat(x, z, w);
          if (top === undefined || nearWater(sh, x, z, 2) || nearWater(sh, x + w - 1, z + w - 1, 2) || crowded(ring, x, z, w)) continue;
          if (w === 2) for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) sh.top[at(sh, x + dx, z + dz)] = top;
          ring.push({ id: w === 2 ? WILLOWS.great : WILLOWS.small, x, y: top + 1, z, w });
          break;
        }
      }
    }
    trees.push(...ring);
  }
  for (const t of trees) for (let dz = 0; dz < t.w; dz++) for (let dx = 0; dx < t.w; dx++) trunks.add(at(sh, t.x + dx, t.z + dz));
  // azalea trees out on the rest of the island, away from the pool's willows
  for (let gz = -sh.R; gz <= sh.R; gz += 8) {
    for (let gx = -sh.R; gx <= sh.R; gx += 8) {
      if (unit(hash(s, gx, gz, 75)) >= 0.32) continue;
      const x = isl.x + gx + Math.floor(unit(hash(s, gx, gz, 76)) * 5) - 2;
      const z = isl.z + gz + Math.floor(unit(hash(s, gx, gz, 77)) * 5) - 2;
      const k = at(sh, x, z);
      if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 78 || nearWater(sh, x, z, 3)) continue;
      if (pool && Math.hypot(x - pool.x, z - pool.z) < pool.r + 11) continue;
      if (!offLanding(x, z, 10) || crowded(trees, x, z, 0)) continue;
      const id = AZALEAS[unit(hash(s, gx, gz, 78)) < 0.5 ? 0 : 1];
      trees.push({ id, x, y: sh.top[k] + 1, z, w: 1, azalea: true });
      trunks.add(k);
    }
  }
  sh.trees = trees.map(({ id, x, y, z }) => ({ id, x, y, z }));
  // the Diamond Shards: sprinkled over the land, apart from each other, the trunks, the dock, the landing and the water
  const want = 8 + Math.round(isl.r / 3);
  const spots = [];
  for (let gz = -sh.R; gz <= sh.R; gz += 3) for (let gx = -sh.R; gx <= sh.R; gx += 3) spots.push([gx, gz, unit(hash(s, gx, gz, 85))]);
  spots.sort((p, q) => p[2] - q[2]);
  const dockAt = (x, z) => {
    const d = sh.dock;
    if (!d) return false;
    for (const k of d.blocks.keys()) {
      const [bx, , bz] = k.split(",").map(Number);
      if (Math.abs(bx - x) <= 1 && Math.abs(bz - z) <= 1) return true;
    }
    return false;
  };
  for (const [gx, gz] of spots) {
    if (sh.shards.length >= want) break;
    const x = isl.x + gx + Math.floor(unit(hash(s, gx, gz, 86)) * 3) - 1;
    const z = isl.z + gz + Math.floor(unit(hash(s, gx, gz, 87)) * 3) - 1;
    const k = at(sh, x, z);
    if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 90 || trunks.has(k) || nearWater(sh, x, z, 1)) continue;
    if (!offLanding(x, z, 4) || dockAt(x, z) || sh.shards.some((q) => Math.hypot(x - q.x, z - q.z) < 4)) continue;
    if (trees.some((t) => Math.abs(x - t.x - (t.w - 1) / 2) <= t.w && Math.abs(z - t.z - (t.w - 1) / 2) <= t.w)) continue;
    sh.shards.push({ x, y: sh.top[k] + 1, z });
  }
}

/** An exotic island's ground: grass, with patches of moss (none at the water's edge). */
export const EXOTIC_TOPS = Object.freeze(["minecraft:grass_block", "minecraft:moss_block"]);
function exoticTopOf(isl, sh, x, z) {
  if (fbm2((isl.s ^ 0xd) >>> 0, x / 10, z / 10) > 0.22 && !nearWater(sh, x, z, 1)) return "minecraft:moss_block";
  return "minecraft:grass_block";
}
/** An exotic island's flowers: every colour. */
export const EXOTIC_FLOWERS = Object.freeze(["minecraft:allium", "minecraft:azure_bluet", "minecraft:blue_orchid", "minecraft:cornflower", "minecraft:lily_of_the_valley", "minecraft:oxeye_daisy", "minecraft:pink_tulip", "minecraft:red_tulip", "minecraft:white_tulip", "minecraft:orange_tulip", "minecraft:poppy", "minecraft:dandelion"]);
/** Its tall plants, two blocks high (the game's double plants: the lower half, then the upper). */
export const EXOTIC_TALL = Object.freeze(["minecraft:peony", "minecraft:rose_bush", "minecraft:lilac", "minecraft:tall_grass", "minecraft:large_fern"]);
const DIRS4 = Object.freeze(["north", "south", "east", "west"]);

/**
 * One exotic-island column's plant, given its top block: [id, states, tall] or undefined. On grass: short grass, ferns,
 * flowers of every colour, pink petals, tall flowers and grass, the odd firefly bush; on moss: moss carpet and azalea
 * bushes; sugar cane at the water.
 */
function exoticPlantOf(isl, sh, top, x, z, wet) {
  const s = isl.s;
  if (wet && unit(hash(s, x, z, 35)) < 0.3) return ["minecraft:reeds"];
  const u = unit(hash(s, x, z, 31));
  const v = unit(hash(s, x, z, 33));
  if (top === "minecraft:moss_block") {
    if (u < 0.32) return ["minecraft:moss_carpet"];
    if (u < 0.37) return ["minecraft:azalea"];
    if (u < 0.42) return ["minecraft:flowering_azalea"];
    if (u < 0.5) return ["minecraft:short_grass"];
    return undefined;
  }
  if (u < 0.24) return ["minecraft:short_grass"];
  if (u < 0.3) return ["minecraft:fern"];
  if (u < 0.4) return [EXOTIC_FLOWERS[Math.floor(v * EXOTIC_FLOWERS.length)]];
  if (u < 0.44) return ["minecraft:pink_petals", { growth: Math.floor(v * 4), "minecraft:cardinal_direction": DIRS4[Math.floor(unit(hash(s, x, z, 89)) * 4)] }];
  if (u < 0.475) return [EXOTIC_TALL[Math.floor(v * EXOTIC_TALL.length)], undefined, true];
  if (u < 0.485) return ["minecraft:firefly_bush"];
  return undefined;
}

/** The block state a Diamond Shard's face is in (the game's amethyst's). */
const SHARD_FACE = "minecraft:block_face";
/** The crystals of Diamond Shards lying about an exotic island (0.1.276; fishing/diamondRules.js). */
export const DIAMOND_SHARDS = "zoocraft:diamond_shards";

/**
 * An exotic island's plants (0.1.276), its Diamond Shards, its pool's lily pads and seagrass, and the glow berries
 * hanging under it. `pad(x, z)` is the landing's pad; `taken` the dock's cells; `busy` the trees' trunks.
 */
function* exoticPlants(isl, sh, cols, tops, taken, busy, pad, grouped, batches) {
  const s = isl.s;
  const W = sh.W;
  const xOf = (k) => sh.x0 + (k % W);
  const zOf = (k) => sh.z0 + Math.floor(k / W);
  const shardAt = new Set(sh.shards.map((q) => at(sh, q.x, q.z)));
  const plants = new Map();
  for (const k of cols) {
    if ((sh.kind[k] !== LAND && sh.kind[k] !== ROCK) || busy.has(k) || shardAt.has(k)) continue;
    const x = xOf(k);
    const z = zOf(k);
    const y = sh.top[k] + 1;
    if (pad(x, z) || taken.has(`${x},${sh.top[k]},${z}`) || taken.has(`${x},${y},${z}`)) continue;
    const wet = sh.kind[k] === LAND && sh.top[k] === isl.y && (isWet(sh, x + 1, z) || isWet(sh, x - 1, z) || isWet(sh, x, z + 1) || isWet(sh, x, z - 1));
    const p = exoticPlantOf(isl, sh, tops.get(k), x, z, wet);
    if (!p) continue;
    const [id, states, tall] = p;
    if (id === "minecraft:reeds") {
      const n = 1 + Math.floor(unit(hash(s, x, z, 39)) * 3);
      for (let h = 0; h < n && !taken.has(`${x},${y + h},${z}`); h++) plants.set(`${x},${y + h},${z}`, [id]);
    } else if (tall) {
      if (taken.has(`${x},${y + 1},${z}`)) continue;
      plants.set(`${x},${y},${z}`, [id, { upper_block_bit: false }]);
      plants.set(`${x},${y + 1},${z}`, [id, { upper_block_bit: true }]);
    } else plants.set(`${x},${y},${z}`, [id, states]);
  }
  yield* grouped(plants);
  // the Diamond Shards, standing up out of the ground
  for (const op of batches(DIAMOND_SHARDS, sh.shards.map(({ x, y, z }) => ({ x, y, z })))) yield { ...op, states: { [SHARD_FACE]: "up" } };
  // lily pads round the pool's shallow edge, clear of the dock (so its water stays open to fish in)
  const nearDock = (x, z) => {
    for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) if (taken.has(`${x + dx},${isl.y},${z + dz}`)) return true;
    return false;
  };
  yield* batches("minecraft:waterlily", (function* () {
    for (const k of cols) {
      if (sh.kind[k] !== POND || sh.top[k] - sh.floor[k] > 3 || unit(hash(s, xOf(k), zOf(k), 51)) >= 0.1 || nearDock(xOf(k), zOf(k))) continue;
      yield { x: xOf(k), y: sh.top[k] + 1, z: zOf(k) };
    }
  })());
  // seagrass on the pool's bed, put into its water (put in air, its water would run)
  for (const op of batches("minecraft:seagrass", (function* () {
    for (const k of cols) if (sh.kind[k] === POND && sh.top[k] - sh.floor[k] >= 3 && unit(hash(s, xOf(k), zOf(k), 91)) < 0.3) yield { x: xOf(k), y: sh.floor[k] + 1, z: zOf(k) };
  })())) yield { ...op, into: "minecraft:water" };
  // glow berries hanging under it, 2 to 5 long, one in three with a berry (the lowest one grows no more)
  const vines = new Map();
  for (const k of cols) {
    if (!sh.roots[k]) continue;
    const x = xOf(k);
    const z = zOf(k);
    const n = 2 + Math.floor(unit(hash(s, x, z, 93)) * 4);
    for (let i = 1; i <= n; i++) {
      const berry = unit(hash(s, x, z, 95 + i)) < 0.35;
      const head = i === n;
      const id = berry ? (head ? "minecraft:cave_vines_head_with_berries" : "minecraft:cave_vines_body_with_berries") : "minecraft:cave_vines";
      vines.set(`${x},${sh.bottom[k] - i},${z}`, [id, head ? { growing_plant_age: 25 } : undefined]);
    }
  }
  yield* grouped(vines);
}

export function shapeOf(isl) {
  const sh = newShape(isl);
  for (const _ of shapeSteps(isl, sh));
  return sh;
}

const isWet = (sh, x, z) => sh.kind[at(sh, x, z)] === POND;

function nearWater(sh, x, z, n) {
  for (let dz = -n; dz <= n; dz++) for (let dx = -n; dx <= n; dx++) if (isWet(sh, x + dx, z + dz)) return true;
  return false;
}

/** Where the return portal stands: a flat strip of land 4 long (x) and 3 wide, away from water. */
function landingOf(isl, sh) {
  const a = unit(hash(isl.s, 3, 3, 3)) * Math.PI * 2;
  const cx = Math.round(isl.x + Math.cos(a) * isl.r * 0.45);
  const cz = Math.round(isl.z + Math.sin(a) * isl.r * 0.45);
  const fits = (lx, lz) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let z = lz - 1; z <= lz + 1; z++) {
      for (let x = lx - 1; x <= lx + 2; x++) {
        const k = at(sh, x, z);
        if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 85) return undefined;
        lo = Math.min(lo, sh.top[k]);
        hi = Math.max(hi, sh.top[k]);
      }
    }
    if (hi - lo > 1 || nearWater(sh, lx, lz, 3) || nearWater(sh, lx + 1, lz, 3)) return undefined;
    return hi;
  };
  for (let ring = 0; ring <= Math.ceil(isl.r * 0.9); ring++) {
    for (let dz = -ring; dz <= ring; dz++) {
      for (let dx = -ring; dx <= ring; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
        const hi = fits(cx + dx, cz + dz);
        if (hi !== undefined) return { x: cx + dx, z: cz + dz, y: hi + 1, axis: "x" };
      }
    }
  }
  return undefined;
}

/** The trees ZooCraft grows on a common island (its own oak and birch, 0.1.144), and how often. */
export const COMMON_TREES = /** @type {ReadonlyArray<[string, number]>} */ (Object.freeze([
  ["zoocraft:oak_round", 30],
  ["zoocraft:oak_branchy", 25],
  ["zoocraft:oak_tall", 12],
  ["zoocraft:oak_great", 8],
  ["zoocraft:birch_tall", 13],
  ["zoocraft:birch_slim", 12],
]));

function treesOf(isl, sh) {
  const out = [];
  const total = COMMON_TREES.reduce((n, [, w]) => n + w, 0);
  for (let gz = -sh.R; gz <= sh.R; gz += 7) {
    for (let gx = -sh.R; gx <= sh.R; gx += 7) {
      if (unit(hash(isl.s, gx, gz, 23)) >= (isl.kind === "uncommon" ? 0.3 : 0.42)) continue;
      const x = isl.x + gx + Math.floor(unit(hash(isl.s, gx, gz, 21)) * 5) - 2;
      const z = isl.z + gz + Math.floor(unit(hash(isl.s, gx, gz, 22)) * 5) - 2;
      const k = at(sh, x, z);
      if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 78 || sh.top[k] !== sh.floor[k] || nearWater(sh, x, z, 3)) continue;
      if (sh.landing && Math.hypot(x - sh.landing.x, z - sh.landing.z) < 10) continue;
      if (sh.sites.some((q) => Math.hypot(x - q.x, z - q.z) < 10) || sh.geodes.some((g) => Math.hypot(x - g.x, z - g.z) < g.R + 6)) continue;
      if (sh.patches.some((q) => Math.hypot(x - q.x, z - q.z) < q.r + 3)) continue;
      let u = unit(hash(isl.s, gx, gz, 25)) * total;
      let id = COMMON_TREES[0][0];
      for (const [t, w] of COMMON_TREES) {
        if (u < w) {
          id = t;
          break;
        }
        u -= w;
      }
      out.push({ id, x, y: sh.top[k] + 1, z });
    }
  }
  // an uncommon island keeps a few trees among its spires (0.1.274): if the first look found too few, a second look,
  // in its own random order over the spots between, a little nearer the spires
  if (isl.kind === "uncommon") {
    const want = isl.r >= 45 ? 3 : 2;
    const spots = [];
    for (let gz = -sh.R + 2; gz <= sh.R; gz += 4) for (let gx = -sh.R + 2; gx <= sh.R; gx += 4) spots.push([gx, gz, unit(hash(isl.s, gx, gz, 121))]);
    spots.sort((a, b) => a[2] - b[2]);
    for (const [gx, gz] of spots) {
      if (out.length >= want) break;
      const x = isl.x + gx;
      const z = isl.z + gz;
      const k = at(sh, x, z);
      if (k < 0 || sh.kind[k] !== LAND || sh.edge[k] > 78 || sh.top[k] !== sh.floor[k] || nearWater(sh, x, z, 3)) continue;
      if (sh.landing && Math.hypot(x - sh.landing.x, z - sh.landing.z) < 10) continue;
      if (sh.sites.some((q) => Math.hypot(x - q.x, z - q.z) < 9) || sh.geodes.some((g) => Math.hypot(x - g.x, z - g.z) < g.R + 6)) continue;
      if (sh.patches.some((q) => Math.hypot(x - q.x, z - q.z) < q.r + 3) || out.some((q) => Math.hypot(x - q.x, z - q.z) < 7)) continue;
      const total = COMMON_TREES.reduce((n, [, w]) => n + w, 0);
      let u = unit(hash(isl.s, gx, gz, 123)) * total;
      let id = COMMON_TREES[0][0];
      for (const [tr, w] of COMMON_TREES) {
        if (u < w) {
          id = tr;
          break;
        }
        u -= w;
      }
      out.push({ id, x, y: sh.top[k] + 1, z });
    }
  }
  return out;
}

// ---- the blocks, in the order they go in

/** A rare island's blocks (0.1.275): its top, its ponds' beds, the gold in its stone and its plants. */
export const RARE_TOPS = Object.freeze(["minecraft:blackstone", "minecraft:crimson_nylium", "minecraft:crying_obsidian", "minecraft:gilded_blackstone"]);
export const RARE_BEDS = Object.freeze(["minecraft:magenta_concrete", "minecraft:purple_concrete", "minecraft:crying_obsidian"]);
/** @type {ReadonlyArray<[string, number, number]>} */
const RARE_VEINS = Object.freeze([["minecraft:gilded_blackstone", 90, 41], ["minecraft:raw_gold_block", 450, 43]]);
export const RARE_PLANTS = Object.freeze(["minecraft:crimson_roots", "minecraft:crimson_fungus"]);
export const FLOWERS = Object.freeze(["minecraft:dandelion", "minecraft:poppy", "minecraft:azure_bluet", "minecraft:oxeye_daisy", "minecraft:cornflower"]);
/** An uncommon island's flowers (0.1.274): purples, blues, pinks and whites to go with the amethyst. */
export const CRYSTAL_FLOWERS = Object.freeze(["minecraft:allium", "minecraft:azure_bluet", "minecraft:cornflower", "minecraft:lily_of_the_valley", "minecraft:pink_tulip", "minecraft:oxeye_daisy"]);

const SETS = {
  purple: { block: "minecraft:amethyst_block", budding: "minecraft:budding_amethyst", stages: ["minecraft:small_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:large_amethyst_bud", "minecraft:amethyst_cluster"] },
  red: { block: "zoocraft:red_amethyst_block", budding: "zoocraft:budding_red_amethyst", stages: ["zoocraft:small_red_amethyst_bud", "zoocraft:medium_red_amethyst_bud", "zoocraft:large_red_amethyst_bud", "zoocraft:red_amethyst_cluster"] },
  blue: { block: "zoocraft:blue_amethyst_block", budding: "zoocraft:budding_blue_amethyst", stages: ["zoocraft:small_blue_amethyst_bud", "zoocraft:medium_blue_amethyst_bud", "zoocraft:large_blue_amethyst_bud", "zoocraft:blue_amethyst_cluster"] },
};
const SIDES6 = /** @type {ReadonlyArray<[string, number, number, number]>} */ ([
  ["up", 0, 1, 0],
  ["down", 0, -1, 0],
  ["north", 0, 0, -1],
  ["south", 0, 0, 1],
  ["east", 1, 0, 0],
  ["west", -1, 0, 0],
]);

/** The cells of a leaning, tapering pillar of amethyst (a spire going up from its base, or a crystal hanging down). */
function pillarCells(p) {
  const out = [];
  for (let i = 0; i < p.h; i++) {
    const cx = p.x + p.tx * i;
    const cz = p.z + p.tz * i;
    const ri = Math.max(0.5, p.r0 * (1 - (0.72 * i) / Math.max(1, p.h - 1)));
    const y = p.y + p.dir * i;
    const n = Math.ceil(ri) + 1;
    for (let dz = -n; dz <= n; dz++) {
      for (let dx = -n; dx <= n; dx++) {
        const x = Math.round(cx) + dx;
        const z = Math.round(cz) + dz;
        if (Math.hypot(x - cx, z - cz) <= ri + 0.25) out.push({ x, y, z, end: i === p.h - 1 });
      }
    }
  }
  return out;
}

/**
 * An uncommon island's amethyst, worked out from its shape: the solid blocks (amethyst in its colours, budding
 * amethyst, the geodes' calcite and smooth basalt) and the buds and clusters on them, each growing out into an empty
 * cell from the block it stands on. Returns { solid: Map("x,y,z" -> id), crystals: Map("x,y,z" -> { id, face }) }.
 */
export function amethystOfIsland(isl, sh) {
  const s = isl.s;
  const solid = new Map();
  const crystals = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  const empty = (x, y, z) => {
    if (solid.has(key(x, y, z)) || crystals.has(key(x, y, z))) return false;
    const k = at(sh, x, z);
    if (k < 0 || sh.kind[k] === AIR) return true;
    if (y > sh.top[k]) return true;
    return y < sh.bottom[k] - (sh.roots[k] ? 1 : 0);
  };
  const stageOf = (u) => (u < 0.2 ? 0 : u < 0.4 ? 1 : u < 0.65 ? 2 : 3);
  /** amethyst cells that can grow crystals: the budding ones among them are picked last */
  const faces = [];
  const grow = (x, y, z, colour, chance, salt) => {
    for (const [face, dx, dy, dz] of SIDES6) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (!empty(nx, ny, nz)) continue;
      faces.push([x, y, z, colour]);
      if (unit(hash(s, nx * 7 + dx, ny * 13 + dy, nz * 17 + dz + salt)) >= chance) continue;
      crystals.set(key(nx, ny, nz), { id: SETS[colour].stages[stageOf(unit(hash(s, nx, ny, nz + 101)))], face });
    }
  };
  // the geodes' shells: amethyst inside, then calcite, then smooth basalt, only below the ground (the top is cut off)
  const shells = [];
  for (const g of sh.geodes) {
    const span = g.R + 3;
    for (let y = g.y - span; y <= g.y + span; y++) {
      for (let z = g.z - span; z <= g.z + span; z++) {
        for (let x = g.x - span; x <= g.x + span; x++) {
          const d = Math.hypot(x - g.x, y - g.y, z - g.z);
          if (d < g.R || d >= g.R + 3.2) continue;
          const k = at(sh, x, z);
          if (k < 0 || (sh.kind[k] !== LAND && sh.kind[k] !== GEODE) || y > sh.top[k] || y < sh.bottom[k]) continue;
          const id = d < g.R + 1 ? SETS[g.colour].block : d < g.R + 2 ? "minecraft:calcite" : "minecraft:smooth_basalt";
          solid.set(key(x, y, z), id);
          if (d < g.R + 1) shells.push([x, y, z, g.colour]);
        }
      }
    }
  }
  // spires, hanging crystals, patches in the grass
  const pillars = [];
  for (const p of [...sh.spires, ...sh.hangers]) {
    const cells = pillarCells(p);
    for (const c of cells) solid.set(key(c.x, c.y, c.z), SETS[p.colour].block);
    pillars.push([p, cells]);
  }
  for (const q of sh.patches) {
    const n = Math.ceil(q.r);
    for (let dz = -n; dz <= n; dz++) {
      for (let dx = -n; dx <= n; dx++) {
        if (Math.hypot(dx, dz) > q.r) continue;
        const k = at(sh, q.x + dx, q.z + dz);
        if (k < 0 || sh.kind[k] !== LAND) continue;
        for (let y = sh.top[k] - 1; y <= sh.top[k]; y++) solid.set(key(q.x + dx, y, q.z + dz), SETS[q.colour].block);
      }
    }
  }
  // crystals: a cluster on every spire's top and every hanging crystal's tip, then here and there all over
  for (const [p, cells] of pillars) {
    for (const c of cells) {
      if (!c.end) continue;
      const ny = c.y + p.dir;
      if (empty(c.x, ny, c.z)) crystals.set(key(c.x, ny, c.z), { id: SETS[p.colour].stages[3], face: p.dir > 0 ? "up" : "down" });
    }
  }
  for (const [p, cells] of pillars) for (const c of cells) grow(c.x, c.y, c.z, p.colour, 0.18, 3);
  for (const q of sh.patches) {
    const n = Math.ceil(q.r);
    for (let dz = -n; dz <= n; dz++) {
      for (let dx = -n; dx <= n; dx++) {
        const k = at(sh, q.x + dx, q.z + dz);
        if (k < 0 || !solid.has(key(q.x + dx, sh.top[k], q.z + dz))) continue;
        const x = q.x + dx;
        const z = q.z + dz;
        const y = sh.top[k] + 1;
        if (empty(x, y, z) && unit(hash(s, x, y, z + 103)) < 0.45) crystals.set(key(x, y, z), { id: SETS[q.colour].stages[stageOf(unit(hash(s, x, y, z + 105)))], face: "up" });
      }
    }
  }
  for (const [x, y, z, colour] of shells) grow(x, y, z, colour, 0.3, 5);
  // budding amethyst: one in twelve of the amethyst blocks that face open air (the game's geodes have one in twelve)
  for (const [x, y, z, colour] of faces) {
    const k = key(x, y, z);
    if (solid.get(k) === SETS[colour].block && unit(hash(s, x, y, z + 107)) < 1 / 12) solid.set(k, SETS[colour].budding);
  }
  return { solid, crystals };
}

/**
 * The blocks for the island, as { block, list } with at most BATCH blocks each (a bud or cluster also has `states`,
 * its block_face; an exotic island's double plants, pink petals, lanterns and Diamond Shards theirs), then { tree, at }
 * for each tree. A list with `into` goes only where that block is (its seagrass, into its pool's water), not into air.
 */
export function* opsOf(isl, sh) {
  const W = sh.W;
  const cols = [];
  for (let k = 0; k < sh.kind.length; k++) if (sh.kind[k] !== AIR) cols.push(k);
  const xOf = (k) => sh.x0 + (k % W);
  const zOf = (k) => sh.z0 + Math.floor(k / W);
  const land = (k) => sh.kind[k] === LAND || sh.kind[k] === ROCK;
  function* batches(block, gen) {
    let list = [];
    for (const p of gen) {
      list.push(p);
      if (list.length >= BATCH) {
        yield { block, list };
        list = [];
      }
    }
    if (list.length) yield { block, list };
  }
  const s = isl.s;
  const crystal = isl.kind === "uncommon";
  const rare = isl.kind === "rare";
  const exotic = isl.kind === "exotic";
  const mythic = isl.kind === "mythic";
  /** a Map("x,y,z" -> [id, states]) as lists, one per block and states, in a fixed order */
  function* grouped(cells) {
    const groups = new Map();
    for (const [k, [id, states]] of cells) {
      const g = `${id}|${states ? JSON.stringify(states) : ""}`;
      if (!groups.has(g)) groups.set(g, { id, states, list: [] });
      const [x, y, z] = k.split(",").map(Number);
      groups.get(g).list.push({ x, y, z });
    }
    for (const g of [...groups.keys()].sort()) {
      const { id, states, list } = /** @type {any} */ (groups.get(g));
      for (const op of batches(id, list)) yield states ? { ...op, states } : op;
    }
  }
  /** the cells the amethyst takes (an uncommon island): no grass, flower, cane or root goes in or on them */
  const taken = new Set();
  if (crystal) {
    const { solid, crystals } = amethystOfIsland(isl, sh);
    for (const k of solid.keys()) taken.add(k);
    for (const k of crystals.keys()) taken.add(k);
    const ids = [...new Set(solid.values())].sort();
    for (const id of ids) {
      yield* batches(id, (function* () {
        for (const [k, v] of solid) {
          if (v !== id) continue;
          const [x, y, z] = k.split(",").map(Number);
          yield { x, y, z };
        }
      })());
    }
    const kinds = [...new Set([...crystals.values()].map((c) => `${c.id} ${c.face}`))].sort();
    for (const kf of kinds) {
      const [id, face] = kf.split(" ");
      for (const op of batches(id, (function* () {
        for (const [k, c] of crystals) {
          if (c.id !== id || c.face !== face) continue;
          const [x, y, z] = k.split(",").map(Number);
          yield { x, y, z };
        }
      })())) yield { ...op, states: { "minecraft:block_face": face } };
    }
  }
  // a rare island's builds (0.1.275): its ruined portals, pillars and fungi, before the ground they stand on
  /** a rare island's top block per column */
  const tops = new Map();
  if (rare) {
    const builds = rareOfIsland(isl, sh);
    for (const k of builds.keys()) taken.add(k);
    for (const id of [...new Set(builds.values())].sort()) {
      yield* batches(id, (function* () {
        for (const [k, v] of builds) {
          if (v !== id) continue;
          const [x, y, z] = k.split(",").map(Number);
          yield { x, y, z };
        }
      })());
    }
    for (const k of cols) if (land(k)) tops.set(k, rareTopOf(isl, sh, k, xOf(k), zOf(k)));
    for (const block of RARE_TOPS) {
      yield* batches(block, (function* () {
        for (const k of cols) if (tops.get(k) === block) yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
      })());
    }
  } else if (exotic) {
    // an exotic island's dock (0.1.276), before the water it stands in and the bank it starts on; then its grass and moss
    if (sh.dock) {
      for (const k of sh.dock.blocks.keys()) taken.add(k);
      yield* grouped(sh.dock.blocks);
    }
    for (const k of cols) if (land(k)) tops.set(k, exoticTopOf(isl, sh, xOf(k), zOf(k)));
    for (const block of EXOTIC_TOPS) {
      yield* batches(block, (function* () {
        for (const k of cols) if (tops.get(k) === block) yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
      })());
    }
  } else if (mythic) {
    // a mythic island's town (0.1.277), before the ground it stands on; then its paving, floors, sand and grass
    if (sh.city) {
      for (const k of sh.city.blocks.keys()) taken.add(k);
      for (const k of sh.city.decor.keys()) taken.add(k);
      yield* grouped(sh.city.blocks);
    }
    for (const k of cols) if (land(k)) tops.set(k, mythicTopOf(isl, sh, k));
    // (its sand waits until what holds it up is in: put in first, it fell on the test server)
    for (const block of [...new Set(tops.values())].filter((b) => b !== "minecraft:sand").sort()) {
      yield* batches(block, (function* () {
        for (const k of cols) if (tops.get(k) === block) yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
      })());
    }
  } else {
    // grass on top
    yield* batches("minecraft:grass_block", (function* () {
      for (const k of cols) if (land(k)) yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
    })());
  }
  // pond beds: sand at the shallow rim, clay and dirt deeper
  const bed = (k) => {
    const x = xOf(k);
    const z = zOf(k);
    if (sh.top[k] - sh.floor[k] <= 1) return "minecraft:sand";
    return noise2((s ^ 0x8) >>> 0, x / 3, z / 3) > 0.25 ? "minecraft:clay" : "minecraft:dirt";
  };
  // (a rare island's: magenta and purple, so its water reads purple)
  // (a mythic island's go in after its stone: mythicSand)
  const bedOf = rare ? (k) => rareBedOf(isl, xOf(k), zOf(k)) : mythic ? (k) => mythicBedOf(isl, sh, k) : bed;
  for (const block of rare ? RARE_BEDS : mythic ? [] : ["minecraft:sand", "minecraft:clay", "minecraft:dirt"]) {
    yield* batches(block, (function* () {
      for (const k of cols) if (sh.kind[k] === POND && bedOf(k) === block) yield { x: xOf(k), y: sh.floor[k], z: zOf(k) };
    })());
  }
  // the water (round an exotic island's dock and its pilings, 0.1.276)
  yield* batches("minecraft:water", (function* () {
    for (const k of cols) {
      if (sh.kind[k] !== POND) continue;
      for (let y = sh.floor[k] + 1; y <= sh.top[k]; y++) if (!taken.size || !taken.has(`${xOf(k)},${y},${zOf(k)}`)) yield { x: xOf(k), y, z: zOf(k) };
    }
  })());
  // dirt under the grass and the beds (a rare island's: blackstone)
  // (a mythic island's beach and plaza: sandstone under them, 0.1.277)
  if (mythic) {
    yield* batches("minecraft:sandstone", (function* () {
      for (const k of cols) {
        if (!mythicBeach(isl, sh, k)) continue;
        const f = sh.floor[k];
        for (let y = f - 1; y >= Math.max(sh.bottom[k], f - 3); y--) yield { x: xOf(k), y, z: zOf(k) };
      }
    })());
  }
  yield* batches(rare ? "minecraft:blackstone" : "minecraft:dirt", (function* () {
    for (const k of cols) {
      const f = sh.floor[k];
      for (let y = f - 1; y >= Math.max(sh.bottom[k], f - 3); y--) yield { x: xOf(k), y, z: zOf(k) };
    }
  })());
  // rooted dirt where roots hang (a rare island's vines hang from blackstone, an exotic island's glow berries from moss)
  yield* batches(rare ? "minecraft:blackstone" : exotic ? "minecraft:moss_block" : "minecraft:dirt_with_roots", (function* () {
    for (const k of cols) if (sh.roots[k]) yield { x: xOf(k), y: sh.bottom[k], z: zOf(k) };
  })());
  // ore in the stone: coal veins and fewer iron ones
  const landCols = cols.filter((k) => sh.kind[k] === LAND);
  /** @type {ReadonlyArray<[string, number, number]>} */
  const veins = rare ? RARE_VEINS : [["minecraft:coal_ore", 110, 41], ["minecraft:iron_ore", 300, 43]];
  for (const [block, per, salt] of veins) {
    yield* batches(block, (function* () {
      const n = Math.round(landCols.length / per);
      for (let v = 0; v < n && landCols.length; v++) {
        const k = landCols[Math.floor(unit(hash(s, v, salt, 45)) * landCols.length)];
        const lo = sh.bottom[k] + (sh.roots[k] ? 1 : 0);
        const hi = sh.floor[k] - 4;
        if (hi < lo) continue;
        const y = lo + Math.floor(unit(hash(s, v, salt, 47)) * (hi - lo + 1));
        const size = 3 + Math.floor(unit(hash(s, v, salt, 49)) * 4);
        const x0 = xOf(k);
        const z0 = zOf(k);
        for (let b = 0; b < size; b++) {
          const x = x0 + (b % 2);
          const z = z0 + (Math.floor(b / 2) % 2);
          const yy = y + Math.floor(b / 4);
          const kk = at(sh, x, z);
          if (kk < 0 || sh.kind[kk] !== LAND) continue;
          if (yy < sh.bottom[kk] + (sh.roots[kk] ? 1 : 0) || yy > sh.floor[kk] - 4) continue;
          yield { x, y: yy, z };
        }
      }
    })());
  }
  // stone for the rest of the body (anything already placed above is kept: the fills only fill air)
  if (rare) {
    // crying obsidian here and there on the underside, weeping its purple drops (0.1.275)
    yield* batches("minecraft:crying_obsidian", (function* () {
      for (const k of cols) if (sh.kind[k] === LAND && !sh.roots[k] && unit(hash(s, xOf(k), zOf(k), 227)) < 0.025) yield { x: xOf(k), y: sh.bottom[k], z: zOf(k) };
    })());
    // blackstone, with columns of basalt through it; marked `body`, so the builder puts the ponds' water in after it
    const bodyOf = (k) => (noise2((s ^ 0xb) >>> 0, xOf(k) / 9, zOf(k) / 9) > 0.25 ? "minecraft:basalt" : "minecraft:blackstone");
    for (const block of ["minecraft:blackstone", "minecraft:basalt"]) {
      for (const op of batches(block, (function* () {
        for (const k of cols) {
          if (bodyOf(k) !== block) continue;
          const lo = sh.bottom[k] + (sh.roots[k] ? 1 : 0);
          for (let y = sh.floor[k] - 4; y >= lo; y--) yield { x: xOf(k), y, z: zOf(k) };
        }
      })())) yield { ...op, body: true };
    }
  } else {
    yield* batches("minecraft:stone", (function* () {
      for (const k of cols) {
        const lo = sh.bottom[k] + (sh.roots[k] ? 1 : 0);
        for (let y = sh.floor[k] - 4; y >= lo; y--) yield { x: xOf(k), y, z: zOf(k) };
      }
    })());
  }
  // (0.1.277) a mythic island's sand, on its beach and its sea's bed, and the sea lanterns under its lagoon, once what
  // holds them up is in (on the test server, sand put in first fell); marked `body`, so the water goes in after them
  if (mythic) for (const op of mythicSand(isl, sh, cols, tops, batches)) yield { ...op, body: true };
  // plants: grass and flowers, sugar cane at the water, lily pads on it, roots under
  const busy = new Set();
  for (const t of sh.trees) {
    // (an exotic island's big willows stand on a trunk 2 wide)
    const w = t.id === WILLOWS.great ? 2 : 1;
    for (let dz = 0; dz < w; dz++) for (let dx = 0; dx < w; dx++) busy.add(at(sh, t.x + dx, t.z + dz));
  }
  const pad = (x, z) => sh.landing && x >= sh.landing.x - 3 && x <= sh.landing.x + 4 && Math.abs(z - sh.landing.z) <= 2;
  const flowers = crystal ? CRYSTAL_FLOWERS : FLOWERS;
  const plantOf = (k) => {
    // (an exotic island's plants are its own: exoticPlants)
    if (exotic || mythic || !land(k) || busy.has(k)) return undefined;
    const x = xOf(k);
    const z = zOf(k);
    if (pad(x, z)) return undefined;
    if (crystal && sh.geodes.some((g) => Math.hypot(x - g.x, z - g.z) < g.R + 3.5)) return undefined;
    if (taken.size && (taken.has(`${x},${sh.top[k]},${z}`) || taken.has(`${x},${sh.top[k] + 1},${z}`))) return undefined;
    if (rare) {
      // crimson roots and the odd fungus, on the nylium only
      if (tops.get(k) !== "minecraft:crimson_nylium") return undefined;
      const v = unit(hash(s, x, z, 31));
      return v < 0.3 ? "minecraft:crimson_roots" : v < 0.36 ? "minecraft:crimson_fungus" : undefined;
    }
    const wet = sh.kind[k] === LAND && sh.top[k] === isl.y && (isWet(sh, x + 1, z) || isWet(sh, x - 1, z) || isWet(sh, x, z + 1) || isWet(sh, x, z - 1));
    if (wet && unit(hash(s, x, z, 35)) < 0.3) return "minecraft:reeds";
    const u = unit(hash(s, x, z, 31));
    if (u < 0.28) return "minecraft:short_grass";
    if (u < 0.31) return flowers[Math.floor(unit(hash(s, x, z, 33)) * flowers.length)];
    return undefined;
  };
  for (const block of exotic || mythic ? [] : rare ? RARE_PLANTS : ["minecraft:short_grass", ...flowers]) {
    yield* batches(block, (function* () {
      for (const k of cols) if (plantOf(k) === block) yield { x: xOf(k), y: sh.top[k] + 1, z: zOf(k) };
    })());
  }
  if (exotic) yield* exoticPlants(isl, sh, cols, tops, taken, busy, pad, grouped, batches);
  if (mythic) {
    yield* mythicPlants(isl, sh, cols, tops, taken, pad, grouped, batches);
    // its lanterns and carpets last, once what they stand on is in (0.1.277: put in first, some fell off on the test server)
    if (sh.city) yield* grouped(sh.city.decor);
  }
  yield* batches("minecraft:reeds", (function* () {
    for (const k of cols) {
      if (plantOf(k) !== "minecraft:reeds") continue;
      const tall = 1 + Math.floor(unit(hash(s, xOf(k), zOf(k), 39)) * 3);
      for (let h = 1; h <= tall; h++) {
        if (taken.has(`${xOf(k)},${sh.top[k] + h},${zOf(k)}`)) break;
        yield { x: xOf(k), y: sh.top[k] + h, z: zOf(k) };
      }
    }
  })());
  if (rare) {
    // weeping vines, 2 to 6 long, where a common island has hanging roots
    yield* batches("minecraft:weeping_vines", (function* () {
      for (const k of cols) {
        if (!sh.roots[k]) continue;
        const n = 2 + Math.floor(unit(hash(s, xOf(k), zOf(k), 229)) * 5);
        for (let i = 1; i <= n; i++) yield { x: xOf(k), y: sh.bottom[k] - i, z: zOf(k) };
      }
    })());
  } else if (!exotic) {
    // (no lily pads on a mythic island's sea and lagoon, 0.1.277)
    if (!mythic) yield* batches("minecraft:waterlily", (function* () {
      for (const k of cols) if (sh.kind[k] === POND && unit(hash(s, xOf(k), zOf(k), 51)) < 0.06) yield { x: xOf(k), y: sh.top[k] + 1, z: zOf(k) };
    })());
    yield* batches("minecraft:hanging_roots", (function* () {
      for (const k of cols) if (sh.roots[k] && !taken.has(`${xOf(k)},${sh.bottom[k]},${zOf(k)}`) && !taken.has(`${xOf(k)},${sh.bottom[k] - 1},${zOf(k)}`)) yield { x: xOf(k), y: sh.bottom[k] - 1, z: zOf(k) };
    })());
  }
  for (const t of sh.trees) yield { tree: t.id, at: { x: t.x, y: t.y, z: t.z } };
}

// ---- a mythic island: the Shark People's town (0.1.277)
//
// Austin (12 Nov 18:45Z): "super rare, advanced fishing civilization of Shark People that speak, passive, friendlier
// look; city like his picture, smaller". His picture (research/Mythic_island_reference.png) is a ring city round a
// lagoon: white walls and towers with gold domes, a golden gate with blue banners facing the sea, a causeway out to it
// over clear water, a palace with a great gold dome at the back, palms, and sailboats on the sea round it. Here it is at
// the game's own detail (Austin: "This is minecraft remember"), smaller, on a floating island like the others:
// - the lagoon in the middle (a quarter of the island's radius), with a quay round it, three piers and a gold-topped
//   column in its middle;
// - the town round it: houses of white quartz, concrete and sandstone, square ones and round towers, each with a gold
//   or blue dome; paved streets; palms and flowering azaleas on the grass; the palace at the back, facing the lagoon;
// - its wall: quartz, 6 high, with towers capped in gold domes, and the gatehouse with its golden arch, blue banners
//   and two domed towers;
// - a ring of sea round the wall, a beach round that, and a causeway from the gate across the sea to a round plaza on
//   the beach, a wide band of prismarine and sea lanterns under the water either side of it (the picture's sunken road);
// - sailboats on the sea and in the lagoon; coral, seagrass and sand on the sea bed.
// The town's people come in the next version. Everything is worked out from the island's own seed, so every world's
// town differs (its gate faces one of four ways; its houses, towers, palms and boats fall differently).

/** A mythic island's radius: a town smaller than the huge islands its region could hold (Austin: "smaller"). */
export const MYTHIC_RADIUS = Object.freeze([46, 56]);

const GATE_DIRS = Object.freeze([[0, 1], [1, 0], [0, -1], [-1, 0]]);

/**
 * The town's plan from its island: the lagoon's radius L, the quay's outer edge Q, the wall's middle Wr, the way the
 * gate faces (gx gz), the town's ground level G (one over the water) and the plaza on the beach outside the gate.
 */
export function cityOf(isl) {
  const L = Math.round(isl.r * 0.24);
  const Wr = Math.round(isl.r * 0.6);
  const [gx, gz] = GATE_DIRS[Math.floor(unit(hash(isl.s, 5, 1, 7)) * 4)];
  const pu = isl.r - 4;
  return { L, Q: L + 3, Wr, gx, gz, G: isl.y + 1, plaza: { u: pu, x: isl.x + gx * pu, z: isl.z + gz * pu, r: 6 } };
}

/** A mythic island's body: round, its edge barely wavy; the lagoon, the town, the sea round it, the beach. */
function* mythicBody(isl, sh, depth) {
  const { r, y: y0, s } = isl;
  const { L, Wr, G, plaza } = cityOf(isl);
  for (let j = 0; j < sh.W; j++) {
    const z = sh.z0 + j;
    for (let i = 0; i < sh.W; i++) {
      const x = sh.x0 + i;
      const dx = x - isl.x;
      const dz = z - isl.z;
      const d = Math.hypot(dx, dz);
      const ang = Math.atan2(dz, dx);
      const re = r * (0.97 + 0.03 * fbm2((s ^ 0x1) >>> 0, 3 + 2 * Math.cos(ang), 3 + 2 * Math.sin(ang)));
      const onPlaza = Math.hypot(x - plaza.x, z - plaza.z) <= plaza.r + 0.5;
      if (d >= re && !onPlaza) continue;
      const t = Math.min(1, d / re);
      const k = j * sh.W + i;
      let kind = LAND;
      let top = G;
      let floor = G;
      if (d < L) {
        // the lagoon: 2 deep at its edge, 5 in its middle
        const q = d / L;
        kind = POND;
        top = y0;
        floor = y0 - (2 + Math.round(3 * (1 - q * q)));
      } else if (d >= Wr + 1 && d < re - 3 && !onPlaza) {
        // the sea round the wall: 3 deep at its sides, 5 in its middle
        const q = (d - (Wr + 1)) / Math.max(1, re - 3 - (Wr + 1));
        kind = POND;
        top = y0;
        floor = y0 - 3 - Math.round(2 * Math.sin(Math.PI * Math.min(1, q)));
      }
      const under = depth * Math.pow(Math.max(0, 1 - t * t), 0.7) * (0.75 + 0.35 * noise2((s ^ 0x4) >>> 0, x / 12, z / 12));
      let drip = 0;
      if (t < 0.85) {
        const q = noise2((s ^ 0x5) >>> 0, x / 5, z / 5);
        if (q > 0.5) drip = (q - 0.5) * 2 * depth * 0.35 * (1 - t);
      }
      let bottom = Math.min(floor - 2, G - 2 - Math.round(under + drip));
      // deep enough under the beach, the plaza and the lagoon's quay that the water beside them stays in
      if (d >= Wr || d < L + 3) bottom = Math.min(bottom, y0 - 7);
      sh.kind[k] = kind;
      sh.top[k] = top;
      sh.floor[k] = floor;
      sh.bottom[k] = bottom;
      sh.edge[k] = Math.min(100, Math.round(t * 100));
    }
    yield;
  }
}

/**
 * Where a return portal would stand: on the plaza, to its outer side. (No portal opens onto a mythic island, arrivalIsland,
 * so this only keeps the plaza clear of plants; a later version could use it.)
 */
function mythicLanding(isl) {
  const { gz, G, plaza } = cityOf(isl);
  return { x: plaza.x - 1, z: plaza.z + (gz !== 0 ? gz * 3 : 3), y: G + 1, axis: "x" };
}

const GOLD = "minecraft:gold_block";
const BLUE_DOME = "minecraft:light_blue_concrete";
const QB = "minecraft:quartz_bricks";
const SQ = "minecraft:smooth_quartz";
const PILLAR = "minecraft:quartz_pillar";
const LANTERN = "minecraft:lantern";
const SEA_LANTERN = "minecraft:sea_lantern";
const SAND_TILE = "minecraft:smooth_sandstone";
const SAND_EDGE = "minecraft:cut_sandstone";
const WOOD = "minecraft:spruce_planks";
const LEAVES = Object.freeze({ persistent_bit: true, update_bit: false });
/** A house's walls. */
export const HOUSE_WALLS = Object.freeze([SQ, QB, "minecraft:white_concrete", SAND_TILE]);
/** The coral blocks on the sea's bed (each living as long as water touches it). */
export const CORAL_BLOCKS = Object.freeze(["minecraft:tube_coral_block", "minecraft:brain_coral_block", "minecraft:bubble_coral_block", "minecraft:fire_coral_block", "minecraft:horn_coral_block"]);

/**
 * The town's blocks: sh.city = { blocks Map("x,y,z" -> [id, states]) (they go in first, so nothing else is put where
 * they are), tops Map(column -> the block on top: paving, plank floors), spots (for the town's people: each house's
 * door and the door's step outside, the palace's door, the plaza, the lagoon's middle), houses, towers, boats, palms }.
 * A generator, so the game spreads the work over ticks.
 */
function* mythicSites(isl, sh) {
  const c = cityOf(isl);
  const { L, Q, Wr, gx, gz, G, plaza } = c;
  const s = isl.s;
  const y0 = isl.y;
  const cx = isl.x;
  const cz = isl.z;
  const FOOT = y0 - 5;
  const B = new Map();
  const T = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  const set = (x, y, z, id, states) => B.set(key(x, y, z), states ? [id, states] : [id]);
  const del = (x, y, z) => B.delete(key(x, y, z));
  const has = (x, y, z) => B.has(key(x, y, z));
  // the gate's frame: u out from the middle toward the gate, v across it
  const W = (u, v) => [cx + u * gx - v * gz, cz + u * gz + v * gx];
  const U = (x, z) => (x - cx) * gx + (z - cz) * gz;
  const V = (x, z) => -(x - cx) * gz + (z - cz) * gx;
  const setUV = (u, y, v, id, states) => {
    const [x, z] = W(u, v);
    set(x, y, z, id, states);
  };
  const delUV = (u, y, v) => {
    const [x, z] = W(u, v);
    del(x, y, z);
  };
  const tile = (x, z, id) => {
    const k = at(sh, x, z);
    if (k >= 0 && sh.kind[k] === LAND) T.set(k, id);
  };
  const dist = (x, z) => Math.hypot(x - cx, z - cz);
  const roundCells = (R) => {
    const out = [];
    const n = Math.ceil(R);
    for (let dz = -n; dz <= n; dz++) for (let dx = -n; dx <= n; dx++) if (Math.hypot(dx, dz) <= R) out.push([dx, dz, Math.hypot(dx, dz)]);
    return out;
  };
  const towers = [];
  const domes = [];
  /** a dome of `id` on base level `base` over x z, radius R, only its shell; an end rod on its tip */
  function dome(x0, z0, base, R, id) {
    const H = R + 1;
    const rad = (i) => (i > H ? -1 : (R + 0.35) * Math.sqrt(Math.max(0, 1 - (i / (H + 0.2)) ** 2)));
    for (let i = 0; i <= H; i++) {
      const rr = rad(i);
      const next = rad(i + 1);
      for (const [dx, dz, d] of roundCells(rr)) if (d > next || d > rr - 1) set(x0 + dx, base + i, z0 + dz, id);
    }
    set(x0, base + H + 1, z0, "minecraft:end_rod", { facing_direction: 1 });
    domes.push({ x: x0, z: z0, base, R, id, tip: base + H + 1 });
  }
  /** a round tower, radius R, from `foot` up to `top`: quartz with a band of chiseled quartz, a smooth top, a dome */
  function tower(x0, z0, R, foot, top, domeId) {
    const cells = roundCells(R + 0.3);
    for (const [dx, dz, d] of cells) {
      for (let y = foot; y <= top; y++) set(x0 + dx, y, z0 + dz, y === top ? SQ : y === top - 2 && d > R - 0.7 ? "minecraft:chiseled_quartz_block" : QB);
    }
    dome(x0, z0, top + 1, R, domeId);
    towers.push({ x: x0, z: z0, R, top });
  }

  // ---- the wall: 2 thick, from under the water to 6 over the town, a walk on top, battlements outside, lanterns inside
  const ring = Math.ceil(Wr + 1);
  for (let z = cz - ring; z <= cz + ring; z++) {
    for (let x = cx - ring; x <= cx + ring; x++) {
      const d = dist(x, z);
      if (d < Wr - 1 || d >= Wr + 1) continue;
      for (let y = FOOT; y <= G + 5; y++) set(x, y, z, QB);
      set(x, G + 6, z, SQ);
      const step = Math.round(Math.atan2(z - cz, x - cx) * (Wr + 1));
      if (d >= Wr && (step & 1) === 0) set(x, G + 7, z, QB);
      if (d < Wr && ((step % 9) + 9) % 9 === 0) set(x, G + 7, z, LANTERN, { hanging: false });
    }
  }
  yield;
  // its towers, evenly round it (none where the gatehouse stands)
  const ag = Math.atan2(gz, gx);
  const nT = Math.max(6, Math.round((2 * Math.PI * Wr) / 20));
  const a0 = (unit(hash(s, 5, 2, 7)) * Math.PI * 2) / nT;
  for (let i = 0; i < nT; i++) {
    const a = a0 + (i * 2 * Math.PI) / nT;
    const off = Math.abs(Math.atan2(Math.sin(a - ag), Math.cos(a - ag)));
    if (off * Wr < 12) continue;
    tower(Math.round(cx + Math.cos(a) * Wr), Math.round(cz + Math.sin(a) * Wr), 2, FOOT, G + 9, GOLD);
  }
  yield;

  // ---- the gatehouse: 13 wide, 5 deep, 8 high; a gold-framed arch through it; blue banners; two domed towers
  const gu0 = Wr - 2;
  const gu1 = Wr + 2;
  for (let u = gu0; u <= gu1; u++) {
    for (let v = -6; v <= 6; v++) {
      for (let y = FOOT; y <= G + 7; y++) setUV(u, y, v, QB);
      setUV(u, G + 8, v, SQ);
      if ((u === gu0 || u === gu1) && (v & 1) === 0) setUV(u, G + 9, v, QB);
    }
  }
  for (const sv of [-6, 6]) {
    const [tx, tz] = W(Wr, sv);
    tower(tx, tz, 2, FOOT, G + 11, GOLD);
  }
  for (let u = gu0 - 1; u <= gu1; u++) {
    for (let v = -1; v <= 1; v++) {
      for (let y = G + 1; y <= G + 4; y++) delUV(u, y, v);
      setUV(u, G, v, SAND_TILE);
    }
    delUV(u, G + 5, 0);
  }
  for (const fu of [gu0, gu1]) {
    for (let y = G + 1; y <= G + 5; y++) {
      setUV(fu, y, -2, GOLD);
      setUV(fu, y, 2, GOLD);
    }
    for (const v of [-1, 1]) setUV(fu, G + 5, v, GOLD);
    for (const v of [-1, 0, 1]) setUV(fu, G + 6, v, GOLD);
    setUV(fu, G + 7, 0, "minecraft:lapis_block");
    // the banners, flush in its faces: blue, hung from a gold rod
    for (const v of [-4, 4]) {
      for (let y = G + 2; y <= G + 6; y++) setUV(fu, y, v, "minecraft:blue_wool");
      setUV(fu, G + 7, v, GOLD);
    }
  }
  yield;

  // ---- the plaza on the beach, and the causeway from it to the gate, its sunken band under the water either side
  const pr = plaza.r;
  for (let dz = -pr; dz <= pr; dz++) {
    for (let dx = -pr; dx <= pr; dx++) {
      const d = Math.hypot(dx, dz);
      if (d > pr + 0.5) continue;
      tile(plaza.x + dx, plaza.z + dz, d > pr - 1.2 ? SAND_EDGE : d < 1.5 ? "minecraft:chiseled_sandstone" : SAND_TILE);
    }
  }
  for (const [pu, pv] of [[-4, -4], [-4, 4], [4, -4], [4, 4]]) {
    setUV(plaza.u + pu, G + 1, pv, PILLAR);
    setUV(plaza.u + pu, G + 2, pv, LANTERN, { hanging: false });
  }
  for (let u = gu1 + 1; u <= plaza.u; u++) {
    const n = u - gu1;
    for (let v = -2; v <= 2; v++) {
      const [x, z] = W(u, v);
      const k = at(sh, x, z);
      if (k < 0) continue;
      set(x, G, z, Math.abs(v) === 1 ? QB : v === 0 && n % 4 === 0 ? SEA_LANTERN : SQ);
      if (sh.kind[k] === POND) for (let y = sh.floor[k] + 1; y < G; y++) set(x, y, z, "minecraft:prismarine_bricks");
    }
    if (n % 6 === 3 && u < plaza.u - pr) {
      for (const v of [-2, 2]) {
        setUV(u, G + 1, v, PILLAR);
        setUV(u, G + 2, v, LANTERN, { hanging: false });
      }
    }
    for (const v of [-4, -3, 3, 4]) {
      const [x, z] = W(u, v);
      const k = at(sh, x, z);
      if (k < 0 || sh.kind[k] !== POND) continue;
      set(x, y0 - 1, z, Math.abs(v) === 4 && n % 4 === 2 ? SEA_LANTERN : "minecraft:dark_prismarine");
      for (let y = sh.floor[k] + 1; y < y0 - 1; y++) set(x, y, z, "minecraft:prismarine");
    }
  }
  yield;

  // ---- the lagoon's quay (white down into the water), the promenade round it, its lanterns
  const qr = Math.ceil(Q);
  for (let z = cz - qr; z <= cz + qr; z++) {
    for (let x = cx - qr; x <= cx + qr; x++) {
      const d = dist(x, z);
      if (d < L || d >= Q) continue;
      tile(x, z, d < L + 1 ? SAND_EDGE : SAND_TILE);
      if (d < L + 1.2) for (let y = y0 - 6; y < G; y++) set(x, y, z, QB);
    }
  }
  const nq = Math.max(6, Math.round((2 * Math.PI * (Q - 0.5)) / 9));
  for (let i = 0; i < nq; i++) {
    const a = ag + ((i + 0.5) * 2 * Math.PI) / nq;
    const x = Math.round(cx + Math.cos(a) * (Q - 1));
    const z = Math.round(cz + Math.sin(a) * (Q - 1));
    set(x, G + 1, z, PILLAR);
    set(x, G + 2, z, LANTERN, { hanging: false });
  }
  // the avenue from the gate to the quay, the street inside the wall, the palace's forecourt
  for (let u = Q; u <= gu0 - 1; u++) {
    for (let v = -2; v <= 2; v++) {
      const [x, z] = W(u, v);
      tile(x, z, v === 0 ? "minecraft:chiseled_sandstone" : Math.abs(v) === 2 ? SAND_EDGE : SAND_TILE);
    }
    if ((u - Q) % 5 === 2) {
      for (const v of [-3, 3]) {
        setUV(u, G + 1, v, PILLAR);
        setUV(u, G + 2, v, LANTERN, { hanging: false });
      }
    }
  }
  for (let z = cz - ring; z <= cz + ring; z++) {
    for (let x = cx - ring; x <= cx + ring; x++) {
      const d = dist(x, z);
      if (d >= Wr - 3 && d < Wr - 1) tile(x, z, SAND_TILE);
    }
  }
  yield;

  // ---- the palace at the back, facing the lagoon: a hall with blue windows and a gold band, a great dome on a drum,
  // a domed tower at each corner, a golden doorway, a blue carpet to a gold seat
  const uf = Q + 3;
  const ub = Wr - 5;
  const D = ub - uf + 1;
  for (let u = -ub; u <= -uf; u++) {
    for (let v = -5; v <= 5; v++) {
      const shell = Math.abs(v) === 5 || u === -ub || u === -uf;
      setUV(u, G, v, QB);
      setUV(u, G + 8, v, (u + ub) % 4 === 2 && v % 4 === 0 ? SEA_LANTERN : SQ);
      if (!shell) continue;
      const along = Math.abs(v) === 5 ? u + ub : v + 5;
      const corner = Math.abs(v) === 5 && (u === -ub || u === -uf);
      for (let y = G + 1; y <= G + 7; y++) {
        let id = SQ;
        if (corner || along % 3 === 0) id = PILLAR;
        else if (y === G + 7) id = GOLD;
        else if (y >= G + 3 && y <= G + 5) id = "minecraft:light_blue_stained_glass_pane";
        setUV(u, y, v, id);
      }
      if ((along & 1) === 0) setUV(u, G + 9, v, SQ);
    }
  }
  for (let u = -ub + 1; u <= -uf - 1; u++) for (let v = -4; v <= 4; v++) for (let y = G + 1; y <= G + 7; y++) delUV(u, y, v);
  for (let v = -1; v <= 1; v++) for (let y = G + 1; y <= G + 4; y++) delUV(-uf, y, v);
  delUV(-uf, G + 5, 0);
  for (let y = G + 1; y <= G + 5; y++) {
    setUV(-uf, y, -2, GOLD);
    setUV(-uf, y, 2, GOLD);
  }
  for (const v of [-1, 1]) setUV(-uf, G + 5, v, GOLD);
  for (const v of [-1, 0, 1]) setUV(-uf, G + 6, v, GOLD);
  for (let u = -ub + 2; u <= -uf - 1; u++) setUV(u, G + 1, 0, "minecraft:blue_carpet");
  setUV(-ub + 1, G + 1, 0, GOLD);
  for (const v of [-4, 4]) for (const u of [-ub + 1, -uf - 1]) setUV(u, G + 1, v, LANTERN, { hanging: false });
  const um = -Math.round((uf + ub) / 2);
  const R = D >= 9 ? 4 : 3;
  const [px, pz] = W(um, 0);
  for (const [dx, dz, d] of roundCells(R + 0.35)) {
    for (let y = G + 9; y <= G + 11; y++) if (d > R - 0.65) set(px + dx, y, pz + dz, y === G + 11 ? "minecraft:chiseled_quartz_block" : SQ);
  }
  dome(px, pz, G + 12, R, GOLD);
  for (const u of [-ub, -uf]) {
    for (const v of [-6, 6]) {
      const [tx, tz] = W(u, v);
      tower(tx, tz, 2, G, G + 11, GOLD);
    }
  }
  for (let u = -uf + 1; u <= -Q; u++) for (let v = -4; v <= 4; v++) {
    const [x, z] = W(u, v);
    tile(x, z, Math.abs(v) === 4 ? SAND_EDGE : SAND_TILE);
  }
  const palace = { door: W(-uf, 0), step: W(-uf + 2, 0), middle: W(um, 0) };
  yield;

  // ---- the houses round the town, between the promenade and the street inside the wall, clear of the avenue and the
  // palace: square ones and round towers, white or sand-coloured, a gold dome (two in three) or a blue one
  const inner = Q + 2;
  const outer = Wr - 3;
  const hr = (inner + outer) / 2;
  const houses = [];
  const clear = (x, z) => {
    const u = U(x, z);
    const v = V(x, z);
    if (u > 0 && Math.abs(v) <= 4) return false;
    if (u <= -(uf - 3) && Math.abs(v) <= 9) return false;
    return true;
  };
  // walked round the ring a block at a time, a house wherever one fits (2 blocks at least between them)
  const circ = 2 * Math.PI * hr;
  let j = 0;
  for (let arc = unit(hash(s, 5, 4, 7)) * 4; arc < circ; ) {
    const a = ag + arc / hr;
    j++;
    const h = outer - inner >= 10 && unit(hash(s, j, 6, 7)) < 0.5 ? 3 : 2;
    const hx = Math.round(cx + Math.cos(a) * hr);
    const hz = Math.round(cz + Math.sin(a) * hr);
    let ok = true;
    for (const [x, z] of [[hx - h, hz - h], [hx + h, hz - h], [hx - h, hz + h], [hx + h, hz + h], [hx, hz]]) {
      const d = dist(x, z);
      if (d < inner || d > outer || !clear(x, z)) ok = false;
    }
    if (ok && houses.some((o) => Math.max(Math.abs(o.x - hx), Math.abs(o.z - hz)) < o.h + h + 3)) ok = false;
    if (ok && towers.some((o) => Math.max(Math.abs(o.x - hx), Math.abs(o.z - hz)) < o.R + h + 2)) ok = false;
    if (!ok) {
      arc += 1;
      continue;
    }
    arc += 2 * h + 3;
    const round = unit(hash(s, j, 7, 7)) < 0.35;
    const domeId = unit(hash(s, j, 8, 7)) < 0.65 ? GOLD : BLUE_DOME;
    const wall = HOUSE_WALLS[Math.floor(unit(hash(s, j, 9, 7)) * HOUSE_WALLS.length)];
    // its door on the side facing the lagoon
    const ddx = cx - hx;
    const ddz = cz - hz;
    const [nx, nz] = Math.abs(ddx) >= Math.abs(ddz) ? [Math.sign(ddx), 0] : [0, Math.sign(ddz)];
    const H = h === 3 ? 5 : 4;
    const cells = round ? roundCells(h + 0.3).map(([dx, dz]) => [dx, dz]) : [];
    if (!round) for (let dz = -h; dz <= h; dz++) for (let dx = -h; dx <= h; dx++) cells.push([dx, dz]);
    const inside = new Set(cells.map(([dx, dz]) => `${dx},${dz}`));
    const edgeOf = (dx, dz) => !inside.has(`${dx + 1},${dz}`) || !inside.has(`${dx - 1},${dz}`) || !inside.has(`${dx},${dz + 1}`) || !inside.has(`${dx},${dz - 1}`);
    const top = G + H + (round ? 2 : 0);
    for (const [dx, dz] of cells) {
      const x = hx + dx;
      const z = hz + dz;
      tile(x, z, WOOD);
      set(x, G, z, WOOD);
      const edge = edgeOf(dx, dz);
      const corner = !round && Math.abs(dx) === h && Math.abs(dz) === h;
      for (let y = G + 1; y <= top; y++) if (edge) set(x, y, z, corner ? PILLAR : wall);
      set(x, top + 1, z, SQ);
    }
    // the door (2 high, in the middle of the wall facing the lagoon) and its step outside
    const door = [hx + nx * h, hz + nz * h];
    del(door[0], G + 1, door[1]);
    del(door[0], G + 2, door[1]);
    const stepOut = [door[0] + nx, door[1] + nz];
    // windows in the middle of the other three sides, and either side of the door on a big house
    for (const [wx, wz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const mx = hx + wx * h;
      const mz = hz + wz * h;
      if (wx === nx && wz === nz) {
        if (h === 3) {
          for (const o of [-2, 2]) for (let y = G + 2; y <= G + 3; y++) set(mx + (wz !== 0 ? o : 0), y, mz + (wx !== 0 ? o : 0), "minecraft:glass_pane");
        }
        continue;
      }
      for (let y = G + 2; y <= G + 3; y++) set(mx, y, mz, "minecraft:glass_pane");
    }
    // a lantern inside, as far from the door as it can be
    let lamp;
    for (const [dx, dz] of cells) {
      if (edgeOf(dx, dz)) continue;
      const far = Math.hypot(hx + dx - door[0], hz + dz - door[1]) + (dx + 2 * dz) * 1e-3;
      if (!lamp || far > lamp[2]) lamp = [hx + dx, hz + dz, far];
    }
    if (lamp) set(lamp[0], G + 1, lamp[1], LANTERN, { hanging: false });
    dome(hx, hz, top + 2, h, domeId);
    houses.push({ x: hx, z: hz, h, round, dome: domeId, wall, door, step: stepOut });
    if (houses.length % 4 === 0) yield;
  }
  yield;

  // ---- the lagoon: three piers (one on from the avenue, one either side) with lanterns at their ends, a column in its
  // middle with a gold cap, and a little sailboat moored beside each side pier
  const pierLen = Math.min(5, L - 5);
  const piers = [];
  for (const [pu, pv] of [[1, 0], [0, 1], [0, -1]]) {
    for (let n = 0; n < pierLen; n++) {
      const along = L - n;
      for (let w = -1; w <= 1; w++) {
        const u = pu * along + pv * 0 + (pv !== 0 ? w : 0);
        const v = pv * along + (pu !== 0 ? w : 0);
        const [x, z] = W(u, v);
        const k = at(sh, x, z);
        if (k < 0) continue;
        set(x, G, z, WOOD);
        if (n === pierLen - 1 && w !== 0 && sh.kind[k] === POND) {
          for (let y = sh.floor[k] + 1; y < G; y++) set(x, y, z, "minecraft:spruce_log");
          set(x, G + 1, z, "minecraft:spruce_fence");
          set(x, G + 2, z, LANTERN, { hanging: false });
        }
      }
    }
    piers.push({ end: W(pu * (L - pierLen + 1), pv * (L - pierLen + 1)) });
  }
  for (const [dx, dz, d] of roundCells(1.5)) {
    const k = at(sh, cx + dx, cz + dz);
    if (k < 0) continue;
    for (let y = sh.floor[k] + 1; y <= G; y++) set(cx + dx, y, cz + dz, SQ);
    if (d > 1) set(cx + dx, G + 1, cz + dz, SEA_LANTERN);
  }
  for (let y = G + 1; y <= G + 5; y++) set(cx, y, cz, PILLAR);
  set(cx, G + 6, cz, GOLD);
  set(cx, G + 7, cz, "minecraft:end_rod", { facing_direction: 1 });
  yield;

  // ---- sailboats: a spruce hull at the water, a mast, a white mainsail and jib, a blue pennant
  const boats = [];
  const water = (x, z, lo, hi) => {
    const k = at(sh, x, z);
    const d = dist(x, z);
    return k >= 0 && sh.kind[k] === POND && d >= lo && d <= hi;
  };
  /** boat cells in its own frame (a along it, b across), from its middle */
  function boatCells(len) {
    const half = (len - 1) / 2;
    const out = [];
    for (let a = -half; a <= half; a++) {
      for (let b = -1; b <= 1; b++) {
        const tip = Math.abs(a) === half;
        if (tip && b !== 0) continue;
        out.push([a, b, tip]);
      }
    }
    return { half, cells: out };
  }
  /** a boat of `len` along `axis` (its bow toward +axis when dir is 1) with its middle at bx bz, if its hull and
   * `margin` blocks round it are all open water from lo to hi blocks from the island's middle, with nothing built there */
  function boat(bx, bz, axis, dir, len, lo, hi, margin) {
    const { half, cells } = boatCells(len);
    const at2 = (a, b) => (axis === "x" ? [bx + a * dir, bz + b] : [bx + b, bz + a * dir]);
    for (let a = -half - margin; a <= half + margin; a++) {
      for (let b = -1 - margin; b <= 1 + margin; b++) {
        const [x, z] = at2(a, b);
        if (!water(x, z, lo, hi) || has(x, y0 - 1, z) || has(x, y0, z) || has(x, G, z)) return false;
      }
    }
    for (const [a, b, tip] of cells) {
      const [x, z] = at2(a, b);
      set(x, y0, z, WOOD);
      if (tip || b !== 0) set(x, y0 + 1, z, WOOD);
    }
    const mast = len >= 7 ? 5 : 3;
    const [mx, mz] = at2(0, 0);
    for (let y = y0 + 1; y <= y0 + 1 + mast; y++) set(mx, y, mz, "minecraft:spruce_fence");
    const sail = len >= 7 ? [[-1, 2], [-2, 2], [-1, 3], [-2, 3], [-1, 4], [-2, 4], [-1, 5], [1, 2], [2, 2], [1, 3], [1, 4]] : [[-1, 2], [-1, 3], [1, 2]];
    for (const [a, h] of sail) {
      const [x, z] = at2(a, 0);
      set(x, y0 + h, z, "minecraft:white_wool");
    }
    const [fx, fz] = at2(-1, 0);
    set(fx, y0 + 1 + mast, fz, "minecraft:blue_wool");
    boats.push({ x: bx, z: bz, axis, dir, len });
    return true;
  }
  const re = isl.r * 0.97;
  const nb = 3 + Math.floor(unit(hash(s, 5, 3, 7)) * 3);
  for (let t = 0, placed = 0; t < 40 && placed < nb; t++) {
    const a = unit(hash(s, t, 10, 7)) * Math.PI * 2;
    const rb = (Wr + 2 + re - 3) / 2 + (unit(hash(s, t, 11, 7)) - 0.5) * 3;
    const bx = Math.round(cx + Math.cos(a) * rb);
    const bz = Math.round(cz + Math.sin(a) * rb);
    if (U(bx, bz) > Wr && Math.abs(V(bx, bz)) < 9) continue;
    if (boats.some((o) => Math.max(Math.abs(o.x - bx), Math.abs(o.z - bz)) < 10)) continue;
    const axis = Math.abs(Math.sin(a)) > Math.abs(Math.cos(a)) ? "x" : "z";
    const dir = unit(hash(s, t, 12, 7)) < 0.5 ? 1 : -1;
    if (boat(bx, bz, axis, dir, 7, Wr + 2, re - 3.5, 1)) placed++;
  }
  for (const pv of [1, -1]) {
    // beside the side pier, on its gate side
    const [bx, bz] = W(3, pv * (L - 4));
    boat(bx, bz, gx !== 0 ? "z" : "x", pv * (gx !== 0 ? gx : -gz) >= 0 ? 1 : -1, 5, 0, L - 0.8, 0);
  }
  yield;

  // ---- palms (on the beach and the town's grass) and flowering azaleas, never against anything built
  const palms = [];
  const free = (x, z, h, pad) => {
    for (let dz = -pad; dz <= pad; dz++) for (let dx = -pad; dx <= pad; dx++) for (let y = G; y <= G + h + 2; y++) if (has(x + dx, y, z + dz)) return false;
    return true;
  };
  const grassAt = (x, z) => {
    const k = at(sh, x, z);
    if (k < 0 || sh.kind[k] !== LAND || T.has(k)) return undefined;
    const d = dist(x, z);
    if (d >= Wr + 1) return Math.hypot(x - plaza.x, z - plaza.z) <= plaza.r + 1.5 ? undefined : "beach";
    return d >= Q && d < Wr - 3 ? "town" : undefined;
  };
  const span = sh.R;
  for (let gzz = -span; gzz <= span; gzz += 5) {
    for (let gxx = -span; gxx <= span; gxx += 5) {
      const x = cx + gxx + Math.floor(unit(hash(s, gxx, gzz, 61)) * 4) - 2;
      const z = cz + gzz + Math.floor(unit(hash(s, gxx, gzz, 63)) * 4) - 2;
      const where = grassAt(x, z);
      if (!where || unit(hash(s, gxx, gzz, 65)) >= (where === "beach" ? 0.45 : 0.3)) continue;
      const h = 5 + Math.floor(unit(hash(s, gxx, gzz, 67)) * 3);
      if (!free(x, z, h, 3) || palms.some((p) => Math.max(Math.abs(p.x - x), Math.abs(p.z - z)) < 5)) continue;
      const T0 = G + h;
      for (let y = G + 1; y <= T0; y++) set(x, y, z, "minecraft:jungle_log");
      set(x, T0 + 1, z, "minecraft:jungle_leaves", LEAVES);
      for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        set(x + ux, T0, z + uz, "minecraft:jungle_leaves", LEAVES);
        set(x + 2 * ux, T0, z + 2 * uz, "minecraft:jungle_leaves", LEAVES);
        set(x + 3 * ux, T0 - 1, z + 3 * uz, "minecraft:jungle_leaves", LEAVES);
      }
      for (const [ux, uz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        set(x + ux, T0, z + uz, "minecraft:jungle_leaves", LEAVES);
        set(x + 2 * ux, T0 - 1, z + 2 * uz, "minecraft:jungle_leaves", LEAVES);
      }
      palms.push({ x, z, h });
    }
  }
  yield;
  for (let gzz = -span; gzz <= span; gzz += 3) {
    for (let gxx = -span; gxx <= span; gxx += 3) {
      const x = cx + gxx + Math.floor(unit(hash(s, gxx, gzz, 71)) * 3) - 1;
      const z = cz + gzz + Math.floor(unit(hash(s, gxx, gzz, 73)) * 3) - 1;
      if (grassAt(x, z) !== "town" || unit(hash(s, gxx, gzz, 75)) >= 0.12 || !free(x, z, 2, 1)) continue;
      set(x, G + 1, z, "minecraft:azalea_leaves_flowered", LEAVES);
      const v = unit(hash(s, gxx, gzz, 77));
      if (v < 0.5 && grassAt(x + 1, z) === "town" && free(x + 1, z, 1, 0)) set(x + 1, G + 1, z, "minecraft:azalea_leaves", LEAVES);
      if (v > 0.6) set(x, G + 2, z, "minecraft:azalea_leaves_flowered", LEAVES);
    }
  }

  const spots = {
    G,
    houses: houses.map((h) => ({ door: h.door, step: h.step })),
    palace: { door: palace.door, step: palace.step },
    plaza: [plaza.x, plaza.z],
    lagoon: [cx, cz],
    piers: piers.map((p) => p.end),
  };
  // the lanterns and carpets go in last, once what they stand on is in (decor)
  const decor = new Map();
  for (const [k, v] of B) if (v[0] === LANTERN || v[0] === "minecraft:blue_carpet") decor.set(k, v);
  for (const k of decor.keys()) B.delete(k);
  sh.city = { blocks: B, decor, tops: T, spots, houses, towers, domes, boats, palms, gate: { u0: gu0, u1: gu1 } };
}

/** A mythic island's top block on a column: paving and plank floors as the town laid them; sand on the beach; grass. */
function mythicTopOf(isl, sh, k) {
  const t = sh.city?.tops.get(k);
  if (t) return t;
  if (sh.kind[k] !== LAND) return "minecraft:grass_block";
  const x = sh.x0 + (k % sh.W);
  const z = sh.z0 + Math.floor(k / sh.W);
  return Math.hypot(x - isl.x, z - isl.z) >= cityOf(isl).Wr + 1 ? "minecraft:sand" : "minecraft:grass_block";
}

/** Whether a mythic island's column is beach or plaza (sandstone under it, not dirt). */
function mythicBeach(isl, sh, k) {
  if (sh.kind[k] !== LAND) return false;
  const x = sh.x0 + (k % sh.W);
  const z = sh.z0 + Math.floor(k / sh.W);
  return Math.hypot(x - isl.x, z - isl.z) >= cityOf(isl).Wr + 1;
}

/**
 * A mythic island's sea bed: sand, with a coral block here and there in the sea round the wall (it goes in as sand and
 * becomes coral once the water is in: put in dry, coral dies at once), sea lanterns in a ring under the lagoon.
 */
function mythicBedOf(isl, sh, k) {
  const x = sh.x0 + (k % sh.W);
  const z = sh.z0 + Math.floor(k / sh.W);
  const { L } = cityOf(isl);
  const d = Math.hypot(x - isl.x, z - isl.z);
  if (d < L) {
    const step = Math.round(Math.atan2(z - isl.z, x - isl.x) * (L - 3));
    return Math.abs(d - (L - 3)) < 0.5 && ((step % 3) + 3) % 3 === 0 ? SEA_LANTERN : "minecraft:sand";
  }
  const u = unit(hash(isl.s, x, z, 233));
  return u < 0.05 ? CORAL_BLOCKS[Math.floor(unit(hash(isl.s, x, z, 235)) * CORAL_BLOCKS.length)] : "minecraft:sand";
}

/** The flowers in a mythic town's grass. */
export const MYTHIC_FLOWERS = Object.freeze(["minecraft:allium", "minecraft:pink_tulip", "minecraft:cornflower", "minecraft:lily_of_the_valley", "minecraft:oxeye_daisy", "minecraft:azure_bluet"]);

/**
 * A mythic island's sand (its beach, its sea's bed, sand where its coral will be) and the sea lanterns under its lagoon,
 * as lists: they go in after its stone, so the sand has something under it.
 */
function* mythicSand(isl, sh, cols, tops, batches) {
  const xOf = (k) => sh.x0 + (k % sh.W);
  const zOf = (k) => sh.z0 + Math.floor(k / sh.W);
  yield* batches("minecraft:sand", (function* () {
    for (const k of cols) if (tops.get(k) === "minecraft:sand") yield { x: xOf(k), y: sh.top[k], z: zOf(k) };
    for (const k of cols) if (sh.kind[k] === POND && mythicBedOf(isl, sh, k) !== SEA_LANTERN) yield { x: xOf(k), y: sh.floor[k], z: zOf(k) };
  })());
  yield* batches(SEA_LANTERN, (function* () {
    for (const k of cols) if (sh.kind[k] === POND && mythicBedOf(isl, sh, k) === SEA_LANTERN) yield { x: xOf(k), y: sh.floor[k], z: zOf(k) };
  })());
}

/** A mythic island's plants: grass, flowers and pink petals on its grass; coral and seagrass on the bed of its sea and lagoon. */
function* mythicPlants(isl, sh, cols, tops, taken, pad, grouped, batches) {
  const s = isl.s;
  const W = sh.W;
  const xOf = (k) => sh.x0 + (k % W);
  const zOf = (k) => sh.z0 + Math.floor(k / W);
  const plants = new Map();
  for (const k of cols) {
    if (sh.kind[k] !== LAND || tops.get(k) !== "minecraft:grass_block") continue;
    const x = xOf(k);
    const z = zOf(k);
    const y = sh.top[k] + 1;
    if (pad(x, z) || taken.has(`${x},${sh.top[k]},${z}`) || taken.has(`${x},${y},${z}`)) continue;
    const u = unit(hash(s, x, z, 31));
    if (u < 0.22) plants.set(`${x},${y},${z}`, ["minecraft:short_grass"]);
    else if (u < 0.27) plants.set(`${x},${y},${z}`, [MYTHIC_FLOWERS[Math.floor(unit(hash(s, x, z, 33)) * MYTHIC_FLOWERS.length)]]);
    else if (u < 0.3) plants.set(`${x},${y},${z}`, ["minecraft:pink_petals", { growth: 3, "minecraft:cardinal_direction": DIRS4[Math.floor(unit(hash(s, x, z, 37)) * 4)] }]);
  }
  yield* grouped(plants);
  // coral blocks in the sea's bed, put in place of the sand once the water is over it
  const coral = new Map();
  for (const k of cols) {
    if (sh.kind[k] !== POND) continue;
    const id = mythicBedOf(isl, sh, k);
    const x = xOf(k);
    const z = zOf(k);
    if (CORAL_BLOCKS.includes(id) && !taken.has(`${x},${sh.floor[k]},${z}`)) coral.set(`${x},${sh.floor[k]},${z}`, [id]);
  }
  for (const op of grouped(coral)) yield { ...op, into: "minecraft:sand" };
  // seagrass on the bed, put into the water once it's in (put in air, its water would run)
  for (const op of batches("minecraft:seagrass", (function* () {
    for (const k of cols) {
      if (sh.kind[k] !== POND || sh.top[k] - sh.floor[k] < 2) continue;
      const x = xOf(k);
      const z = zOf(k);
      const y = sh.floor[k] + 1;
      if (taken.has(`${x},${y},${z}`) || taken.has(`${x},${sh.floor[k]},${z}`) || mythicBedOf(isl, sh, k) !== "minecraft:sand" || unit(hash(s, x, z, 91)) >= 0.25) continue;
      yield { x, y, z };
    }
  })())) yield { ...op, into: "minecraft:water" };
}

// ---- the return portal on the island

/**
 * The prismarine frame (4 wide, 5 tall, along x) standing on the landing, the portal inside it, the dirt that fills
 * any gap under the frame, and where a player arrives (in the portal's middle).
 */
export function returnPortal(landing, sh) {
  const { x: lx, z: lz, y } = landing;
  const frame = [];
  const inside = [];
  const under = [];
  for (let dx = -1; dx <= 2; dx++) {
    for (let dy = 0; dy <= 4; dy++) {
      const p = { x: lx + dx, y: y + dy, z: lz };
      if (dx === -1 || dx === 2 || dy === 0 || dy === 4) frame.push(p);
      else inside.push(p);
    }
    const k = sh ? at(sh, lx + dx, lz) : -1;
    if (k >= 0) for (let yy = sh.top[k] + 1; yy < y; yy++) under.push({ x: lx + dx, y: yy, z: lz });
  }
  return { frame, inside, under, arrive: { x: lx + 1, y: y + 1, z: lz + 0.5 }, axis: "x" };
}
