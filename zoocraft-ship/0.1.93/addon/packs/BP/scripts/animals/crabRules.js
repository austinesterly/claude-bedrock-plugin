// Obsidian Crabs (0.1.93, the End trio's third; spec 5.4 "Low armored black shell | Scrapes minerals and digs | Rocky
// cave, mineral feeder, substrate"), pure: its body, the rock it scrapes (and the rock measure exhibits.js runs over a
// floor), the ground it digs into and where it digs in at a bout's end, walking side-on to its way, rearing and bolting
// from someone coming at it, face-offs, and what an exhibit needs. The game side is animals/crab.js. Its walking over
// the blocks is the Shimmer Snail's (animals/snailRules.js crawlTick, at the crab's paces).
// Sources (research/end_facts.md, research/end_plan.md): the coconut crab (a grown male 2 kg and 14 cm across the
// shell, a female a third of his weight; a burrow it digs, rests in by day and plugs with its big claw; food found by
// smell from far off; alone, the big ones eating the small); the true crabs' sideways walk (35 of 50 species filmed walk
// mostly sideways); the rock crabs (Grapsus scrapes the film off bare rock with its spoon-tipped claws); the ghost and sand
// crabs, which dig themselves in backwards till only the eyes are out; a crab rears and spreads its claws at something
// big coming fast, and bolts from one too close.

import { DIRS, standable } from "./snailRules.js";

// The crab mobs, found by type (0.1.70: never by family alone).
export const CRAB_TYPES = ["zoocraft:obsidian_crab", "zoocraft:wild_obsidian_crab"];
export const WILD_CRAB = "zoocraft:wild_obsidian_crab";

// What a crab is doing (its zoocraft:act entity property): the client plays the matching animation (gen/crab.py
// ACT_STATES) and the Field Journal watches for it. 0 is out and still; 1 walking side-on, 2 scuttling (bolting), 13
// walking forward (the last block up to a rock, the feeder or a held pellet); 6 digging in, 7 dug in, 8 digging out; 9
// rearing with its claws up; 12 pressed flat (resting where it can't dig).
export const ACT = { none: 0, walk: 1, scuttle: 2, scrape: 3, eat: 4, sift: 5, dig: 6, burrowed: 7, emerge: 8, display: 9, look: 10, reach: 11, flat: 12, forward: 13 };

// Resting under the ground: digging in, dug in or digging out (it sees no one coming, and a hit doesn't move it).
export const RESTING = new Set([ACT.dig, ACT.burrowed, ACT.emerge]);

// Its body: a male 0.6 wide and 0.3 high (gen/crab.py BOX), a female FEMALE of him, a crablet YOUNG of a male.
export const BODY = { half: 0.3, height: 0.3 };
export const FEMALE = 0.7;
export const YOUNG = 0.35;
export function bodyOf(young, female) {
  const k = young ? YOUNG : female ? FEMALE : 1;
  return { half: BODY.half * k, height: BODY.height * k };
}

const EPS = 1e-3;

// ---------------- the rock ----------------

// A rock face beside `c` (a cell it can stand in): the ways (indices into DIRS) to the rock blocks standing beside it at
// its level ("rock" from a reader that asks for it: data/blocks.js ROCK_PATTERNS).
export function rockSides(read, c) {
  const out = [];
  for (let i = 0; i < 4; i++) if (read(c.x + DIRS[i][0], c.y, c.z + DIRS[i][1]) === "rock") out.push(i);
  return out;
}

/**
 * The rock measure (exhibits/exhibits.js, for Obsidian Crabs): over the floor the walking measure found (cells: key
 * "x,y,z" -> kind; the "land" ones), the sides of rock blocks facing onto it at its level (a wall of rock, or boulders
 * standing on the floor): how many, and where the first `keep` are ([x, y, z, the way to the rock]: the floor cell it
 * scrapes from).
 * @param {(x: number, y: number, z: number) => string} read a reader with rock (and gecko and thin, as the crab reads)
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {ReturnType<typeof newRockResult>} out
 */
export function* measureRock(read, cells, opts, out) {
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    for (const i of rockSides(read, { x, y, z })) {
      out.count++;
      if (out.spots.length < opts.keep) out.spots.push([x, y, z, i]);
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  return out;
}

/** @returns {{ count: number, spots: number[][] }} */
export function newRockResult() {
  return { count: 0, spots: [] };
}

// ---------------- the ground ----------------

// What it can dig into: Mineral Substrate, end stone, gravel, sand, red sand, dirt, coarse dirt, grass, soul sand and
// soul soil (a coconut crab digs in sand and soil; an End one in end stone too). Stone, planks and the like it can't:
// there it presses itself flat.
const DIG_PATTERNS = [/^zoocraft:mineral_substrate$/, /^minecraft:(end_stone|gravel|sand|red_sand|dirt|coarse_dirt|grass_block|grass|soul_sand|soul_soil)$/];
export function diggable(typeId) {
  return typeof typeId === "string" && DIG_PATTERNS.some((r) => r.test(typeId));
}

// The sound of digging in `typeId` (Mojang's sound_definitions.json): gravel for Mineral Substrate and gravel, sand,
// grass for dirt and grass, the soul blocks' own, stone for end stone and any rock.
export function digSound(typeId) {
  const id = String(typeId ?? "");
  if (/^(zoocraft:mineral_substrate|minecraft:gravel)$/.test(id)) return "dig.gravel";
  if (/^minecraft:(red_)?sand$/.test(id)) return "dig.sand";
  if (/^minecraft:(dirt|coarse_dirt|grass_block|grass)$/.test(id)) return "dig.grass";
  if (id === "minecraft:soul_sand") return "dig.soul_sand";
  if (id === "minecraft:soul_soil") return "dig.soul_soil";
  return "dig.stone";
}

// The colour of the grit it throws up digging in `typeId` or scrapes off it (the crab_grit particle's r, g, b, 0 to 1):
// the block's own, near enough.
/** @type {[RegExp, string][]} */
const GRIT = [
  [/^zoocraft:mineral_substrate$/, "#8e8a91"],
  [/^minecraft:end_(stone|bricks)$/, "#dcdca0"],
  [/^minecraft:(crying_)?obsidian$/, "#2a1d3d"],
  [/^minecraft:gravel$/, "#85807d"],
  [/^minecraft:sand$/, "#dbcf9e"],
  [/^minecraft:red_sand$/, "#b5622a"],
  [/^minecraft:(dirt|coarse_dirt|grass_block|grass)$/, "#866043"],
  [/^minecraft:soul_(sand|soil)$/, "#4f3d31"],
  [/blackstone/, "#2c262c"],
  [/basalt/, "#55555b"],
  [/deepslate/, "#4f4f53"],
  [/diorite|calcite|quartz/, "#d9d6cf"],
  [/granite/, "#95654f"],
  [/tuff/, "#6c6d66"],
  [/dripstone/, "#866b5c"],
  [/netherrack/, "#6e3535"],
  [/amethyst/, "#8a5fc6"],
];
export function gritColour(typeId) {
  const id = String(typeId ?? "");
  const hex = GRIT.find(([r]) => r.test(id))?.[1] ?? "#7f7f7f";
  return { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255 };
}

// ---------------- resting ----------------

/**
 * Where it goes at a bout's end, the likeliest first (every step a fallback, 0.1.90): its own burrow (the cell it last
 * dug into), if it's still free and still ground it can dig; the free cells it can dig into that it found, those
 * beside a rock first, nearest first (in a zoo every Mineral Substrate cell of its exhibit: reach Infinity; in the wild
 * the ground at a rock's foot within its look); where it is, if it can dig there; else pressed flat, at the foot of a
 * rock if there's one near (a zoo's), or where it is. `found`: { home: { x, y, z } | undefined, burrows: [{ x, y, z,
 * rock }] (free of other crabs; rock: beside a rock), feet: [{ x, y, z }] (free cells beside a rock), dig: whether it
 * can dig in where it is }. Returns [{ spot, kind }], kind "home", "burrow", "here" (dig in where it is) or "flat".
 */
export function restOrder(found, here, T, reach = T.restReach + 1) {
  const d = (c) => Math.hypot(c.x + 0.5 - here.x, c.z + 0.5 - here.z) + Math.abs(c.y - here.y) * 0.5;
  const key = (c) => `${c.x},${c.y},${c.z}`;
  const out = [];
  const home = found.home && found.burrows.find((c) => key(c) === key(found.home));
  if (home) out.push({ spot: home, kind: "home" });
  const burrows = found.burrows.filter((c) => c !== home && d(c) <= reach).sort((p, q) => Number(Boolean(q.rock)) - Number(Boolean(p.rock)) || d(p) - d(q));
  for (const c of burrows) out.push({ spot: c, kind: "burrow" });
  const cell = { x: Math.floor(here.x), y: Math.floor(here.y + EPS), z: Math.floor(here.z) };
  if (found.dig) out.push({ spot: cell, kind: "here" });
  for (const c of [...found.feet].sort((p, q) => d(p) - d(q))) if (d(c) <= T.restReach + 1) out.push({ spot: c, kind: "flat" });
  out.push({ spot: cell, kind: "flat" });
  return out;
}

// A cell to dig into in the wild: one it can stand in with ground under it it can dig (`idUnder`: the block's typeId),
// beside a rock (wild crabs dig in at a rock's foot).
export function wildBurrowAt(read, idUnder, c) {
  return standable(read, c) && rockSides(read, c).length > 0 && diggable(idUnder(c.x, c.y - 1, c.z));
}

// ---------------- walking ----------------

function norm(a) {
  return ((((a + 180) % 360) + 360) % 360) - 180;
}
function diff(a, b) {
  return norm(a - b);
}

// Its yaw walking side-on along `wayYaw` (a true crab's walk): its body across the way, leading with whichever side
// means less turning from `yaw`. A tie (the way straight ahead or behind) goes the one way, the same each time.
export function sideYaw(yaw, wayYaw) {
  const left = norm(wayYaw - 90);
  const right = norm(wayYaw + 90);
  return Math.abs(diff(left, yaw)) <= Math.abs(diff(right, yaw)) ? left : right;
}

// ---------------- someone coming at it ----------------

/**
 * What someone near it does to it (balance.crab): within boltRange of a wild one (zooBoltRange inside its exhibit)
 * coming at it (snailRules.js comingOn), it bolts; within startleRange (zooStartleRange) coming at it, it rears. A hit
 * always makes it bolt. Returns "bolt", "rear" or undefined.
 */
export function threatAt(d, coming, zoo, T) {
  if (!coming) return undefined;
  if (d <= (zoo ? T.zooBoltRange : T.boltRange)) return "bolt";
  if (d <= (zoo ? T.zooStartleRange : T.startleRange)) return "rear";
  return undefined;
}

// Where it bolts to from someone at `from` (`at`: where it is; `across`: [least, most] blocks): points straight away
// from them and up to 60 degrees either side, the straightest and farthest first.
export function awayAims(at, from, across) {
  let ax = at.x - from.x;
  let az = at.z - from.z;
  const len = Math.hypot(ax, az);
  if (len < 1e-6) {
    ax = 1;
    az = 0;
  } else {
    ax /= len;
    az /= len;
  }
  const base = Math.atan2(az, ax);
  const out = [];
  const mid = (across[0] + across[1]) / 2;
  for (const off of [0, 20, -20, 40, -40, 60, -60]) {
    const a = base + (off * Math.PI) / 180;
    for (const r of [across[1], mid, across[0]]) out.push({ x: at.x + Math.cos(a) * r, z: at.z + Math.sin(a) * r });
  }
  return out;
}

// ---------------- face-offs ----------------

/**
 * Another grown crab to face off with (`others`: [{ id, x, y, z, until }]: until, the tick this pair can face off again):
 * the nearest within faceOffRange across (and on its level), whose turn has come. Returns its id, or undefined.
 */
export function rivalOf(at, others, now, T) {
  let best;
  for (const o of others) {
    if (Math.abs(o.y - at.y) > 0.6 || (o.until ?? 0) > now) continue;
    const d = Math.hypot(o.x - at.x, o.z - at.z);
    if (d <= T.faceOffRange && (!best || d < best.d)) best = { id: o.id, d };
  }
  return best?.id;
}

// Of two grown crabs facing off (`a`, `b`: { id, male }), the one that gives way and sidles off: the smaller (a female,
// to a male), else either.
export function yielder(a, b, random = Math.random) {
  if (a.male !== b.male) return a.male ? b.id : a.id;
  return random() < 0.5 ? a.id : b.id;
}

// ---------------- what it does ----------------

/**
 * What it does next when it's out (balance.crab.choices: weights): "walk" (about, side-on, a few blocks), "scrape"
 * (a rock face, or the ground where there's none), "feed" (at the Mineral Feeder), "sift" (in ground it can dig) or
 * "look" (up on its legs, eyes up). `can`: which of feed and sift it can do now.
 */
export function pickChoice(T, can, random = Math.random) {
  const list = Object.entries(T.choices).filter(([k]) => (k === "feed" || k === "sift" ? Boolean(can[k]) : true));
  const total = list.reduce((n, [, w]) => n + w, 0);
  let r = random() * total;
  for (const [k, w] of list) {
    r -= w;
    if (r <= 0) return k;
  }
  return list[list.length - 1][0];
}

// ---------------- what an exhibit needs ----------------

// Rock faces: species.rockFaces.first for the first crab, extra more for each other grown one.
export function rockNeeded(species, n) {
  return species.rockFaces.first + species.rockFaces.extra * Math.max(0, n - 1);
}

// Mineral Substrate to dig into: perCrab blocks for each grown crab, minCells at least.
export function burrowsNeeded(species, n) {
  return Math.max(species.burrows.minCells, species.burrows.perCrab * n);
}

// Rock enough to scrape (species.rockFaces): false caps comfort (cause "rock"). Not measured yet: passes.
export function hasRockFaces(species, ex, n) {
  if (!species.rockFaces || !ex.rock) return true;
  return ex.rock.count >= rockNeeded(species, n);
}

// Mineral Substrate enough to dig into (species.burrows): false caps comfort (cause "burrows"). Not measured yet: passes.
export function hasBurrows(species, ex, n) {
  if (!species.burrows || ex.substrateCells === undefined) return true;
  return ex.substrateCells >= burrowsNeeded(species, n);
}

export const ROCK_HOW = "the side of a rock block standing at the floor's level, a wall of rock or a boulder on the floor (obsidian, end stone, stone, deepslate, blackstone, basalt and the like)";

// The Exhibit Clipboard's lines for Obsidian Crabs: the rock faces, the Mineral Substrate, the crablets.
export function crabLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, residents.filter((a) => !a.juvenile).length);
  const need = rockNeeded(species, n);
  if (!ex.rock) lines.push("§fRock to scrape: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fRock to scrape: ${ex.rock.count >= need ? "§a" : "§c"}${ex.rock.count}§7 of ${need} faces (${ROCK_HOW})`);
  const bed = burrowsNeeded(species, n);
  if (ex.substrateCells === undefined) lines.push("§fMineral Substrate: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fMineral Substrate: ${ex.substrateCells >= bed ? "§a" : "§c"}${ex.substrateCells}§7 of ${bed} blocks to dig their burrows in`);
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fCrablets: §7${young}, each with a little spiral shell on its back`);
  return lines;
}

// Care warnings for Obsidian Crabs: rock enough to scrape, Mineral Substrate enough to dig into.
export function crabWarnings(ex, residents, plural, species, T) {
  const out = [];
  const n = Math.max(1, residents.filter((a) => !a.juvenile).length);
  const need = rockNeeded(species, n);
  if (species.rockFaces && ex.rock && ex.rock.count < need) out.push({ severity: 2, text: `${plural} scrape the minerals off rock with their claws: ${need} or more rock faces at the floor's level (${ex.rock.count} now; comfort can't rise above ${T.rockComfortCap} without them). A rock face is ${ROCK_HOW}.` });
  const bed = burrowsNeeded(species, n);
  if (species.burrows && ex.substrateCells !== undefined && ex.substrateCells < bed) out.push({ severity: 2, text: `${plural} dig themselves into Mineral Substrate to rest: ${bed} or more blocks in the floor (${ex.substrateCells} now; comfort can't rise above ${T.burrowComfortCap} without it). Craft it from gravel, a nether quartz and bone meal.` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live on the end stone of the outer End islands, alone or 2 together. The End has no day or night, so they keep to bouts: out a while, walking side-on, scraping minerals off the rock with their claws and sifting the ground, then dug in backwards at a rock's foot with only the eyes and the big claw showing. Come at one in Survival without sneaking and within ${T.startleRange} blocks it rears with its claws up; within ${T.boltRange} it bolts sideways and digs in. Hold Mineral Pellets and one smells them from ${T.baitRange} blocks and walks over`;
}
