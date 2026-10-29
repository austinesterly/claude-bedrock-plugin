// Lush Okapis (0.1.137, the cave wing: research/cave_plan.md "0.1.137 Lush Okapi"), pure: the okapi measure (the moss in
// an exhibit's floor, the lush plants beside it to browse, the clay to lick, the trunks to rub, the covered spots a calf
// hides in), what an exhibit needs, the day, and what one does next. The game side is animals/okapi.js.
// Sources (research/cave_facts.md): out by day and solitary; it strips leaves with its long dark tongue and washes its
// eyelids and cleans its ears with it; it eats clay from riverbeds for salt and minerals; males rub their necks on trees
// to mark them and curl the lip (flehmen) at a female's scent; a calf spends its first weeks hidden in the undergrowth and
// gets up to nurse. Every rule here is by the species' flags, never by name.

// The okapi mobs, found by type (0.1.70: never by family alone).
export const OKAPI_TYPES = ["zoocraft:okapi", "zoocraft:wild_okapi"];

// What an okapi is doing (its zoocraft:act entity property): the client plays the matching animation (the tongue shows
// for the first three) and the Field Journal watches for it.
export const ACT = { none: 0, browse: 1, lick: 2, groom: 3, rub: 4, flehmen: 5, alert: 6, hide: 7, nurse: 8, rest: 9 };
// Lying down (a calf hidden, or resting): the client's get-up animation takes a moment, so the script holds it still
// that long after (BALANCE.okapi.getUpTicks).
export const LYING_ACTS = [ACT.hide, ACT.rest];
// The tag on a mother waiting for her calf to come and nurse (animals/okapi.js): the calf's zoocraft:to_mother (an engine
// follow_mob in the entity) follows only an okapi with it.
export const MOTHER_TAG = "zoocraft_okapi_mother";

// The lush plants it browses: azalea bushes and their leaves, big and small dripleaf, glow berry vines (cave vines).
export const LUSH_PLANTS = new Set([
  "minecraft:azalea",
  "minecraft:flowering_azalea",
  "minecraft:azalea_leaves",
  "minecraft:azalea_leaves_flowered",
  "minecraft:big_dripleaf",
  "minecraft:small_dripleaf_block",
  "minecraft:cave_vines",
  "minecraft:cave_vines_body_with_berries",
  "minecraft:cave_vines_head_with_berries",
]);
export const MOSS_BLOCK = "minecraft:moss_block";
export const MOSS_CARPET = "minecraft:moss_carpet";
export const CLAY = "minecraft:clay";
// A trunk to rub its neck on: a log or wood of any tree, stripped or not, and the nether stems and hyphae.
const RUBS = [/_log$/, /_wood$/, /_hyphae$/, /^minecraft:(stripped_)?(crimson|warped)_stem$/];
export function isRubbable(id) {
  return Boolean(id) && RUBS.some((r) => r.test(id));
}

export const PLANT_HOW = "azalea or flowering azalea bushes, azalea leaves, big or small dripleaf, or glow berry vines beside the floor, at its level or up to 2 blocks above";
export const MOSS_HOW = "moss blocks in the floor (or moss carpet on it)";
export const CLAY_HOW = "clay in the floor (or under the edge of a pool)";

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- the okapi measure ----------------

/** @returns {{ moss: number, plants: number, clay: number, rubs: number, hideSpots: number[][] }} */
export function newOkapiResult() {
  return { moss: 0, plants: 0, clay: 0, rubs: 0, hideSpots: [] };
}

/**
 * The okapi measure (exhibits/exhibits.js, for Lush Okapis living here), over the floor the walking measure found
 * (cells: key "x,y,z" -> kind; the "land" ones):
 * - moss: the floor cells over a moss block or with moss carpet on them;
 * - plants: the lush plants (LUSH_PLANTS) beside a floor cell at its level or up to 2 blocks above, and glow berry vines
 *   hanging into a floor cell's column 1 or 2 blocks up, each counted once;
 * - clay: the clay blocks under a floor cell, or under the water beside one (a pool's edge), each counted once;
 * - rubs: the sides of trunks (isRubbable) beside a floor cell at its level or one above;
 * - hideSpots: the best `opts.keep` floor cells for a calf to lie hidden in, [x, y, z, score]: 4 for cover (anything but
 *   air or water 2 to `opts.coverRise` blocks over it, as the walking measure reads it: leaves, a roof), and 1 for each
 *   side with something standing beside it (a corner scores 2).
 * `read(x, y, z)`: the exhibit reader's kind; `typeAt(x, y, z)`: { id } for a block, undefined unloaded. A generator, a
 * slice of `opts.cellsPerYield` floor cells at a time.
 * @param {(x: number, y: number, z: number) => string} read
 * @param {(x: number, y: number, z: number) => ({ id: string } | undefined)} typeAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number, coverRise: number }} opts
 * @param {ReturnType<typeof newOkapiResult>} out
 */
export function* measureOkapi(read, typeAt, cells, opts, out) {
  const seen = new Set(); // plants and clay counted
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    const floor = typeAt(x, y - 1, z)?.id;
    if (floor === MOSS_BLOCK || typeAt(x, y, z)?.id === MOSS_CARPET) out.moss++;
    if (floor === CLAY && !seen.has(`${x},${y - 1},${z}`)) {
      seen.add(`${x},${y - 1},${z}`);
      out.clay++;
    }
    for (const h of [1, 2]) {
      const pk = `${x},${y + h},${z}`;
      if (seen.has(pk) || !LUSH_PLANTS.has(typeAt(x, y + h, z)?.id ?? "")) continue;
      seen.add(pk);
      out.plants++;
    }
    let sides = 0;
    for (const [dx, dz] of DIRS) {
      const nx = x + dx;
      const nz = z + dz;
      const nkind = cells.get(`${nx},${y},${nz}`);
      if (nkind === "land") continue; // another floor cell: its own column is counted with it
      if (nkind === "water") {
        const ck = `${nx},${y - 1},${nz}`;
        if (!seen.has(ck) && typeAt(nx, y - 1, nz)?.id === CLAY) {
          seen.add(ck);
          out.clay++;
        }
        continue;
      }
      const side = read(nx, y, nz);
      if (side !== "air" && side !== "unloaded" && side !== "water") sides++;
      for (const h of [0, 1, 2]) {
        const pk = `${nx},${y + h},${nz}`;
        const id = typeAt(nx, y + h, nz)?.id;
        if (h <= 1 && isRubbable(id)) out.rubs++;
        if (seen.has(pk) || !LUSH_PLANTS.has(id ?? "")) continue;
        seen.add(pk);
        out.plants++;
      }
    }
    let covered = false;
    for (let h = 2; h <= opts.coverRise && !covered; h++) {
      const c = read(x, y + h, z);
      covered = c !== "air" && c !== "unloaded" && c !== "water";
    }
    keepBest(out.hideSpots, [x, y, z, (covered ? 4 : 0) + sides], opts.keep);
  }
  out.hideSpots.sort((a, b) => b[3] - a[3]);
  if (out.hideSpots.length > opts.keep) out.hideSpots.length = opts.keep;
  return out;
}

// Keep the `keep` best-scoring spots (trimmed now and then, not on every push).
function keepBest(list, spot, keep) {
  list.push(spot);
  if (list.length < keep * 4) return;
  list.sort((a, b) => b[3] - a[3]);
  list.length = keep;
}

// Where a newborn calf lies hidden: the best-scoring hide spot, the nearest to `near` among the best; undefined with none.
/** @param {number[][] | undefined} spots @param {{ x: number, y: number, z: number }} near */
export function hideSpotFor(spots, near) {
  let best;
  let score = -1;
  let dist = Infinity;
  for (const [x, y, z, s] of spots ?? []) {
    const d = (x + 0.5 - near.x) ** 2 + (y - near.y) ** 2 + (z + 0.5 - near.z) ** 2;
    if (s > score || (s === score && d < dist)) {
      best = { x, y, z };
      score = s;
      dist = d;
    }
  }
  return best;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Lush plants to browse (species.lushGround): plantsPer for each grown one, minPlants at least.
export function plantsNeeded(species, n) {
  const g = species.lushGround;
  return g ? Math.max(g.minPlants, Math.ceil(g.plantsPer * n)) : 0;
}

// Lush ground (cause "lush"): moss enough in the floor and lush plants enough beside it; a clay lick (cause "clay"):
// clay enough. False caps comfort. Not measured yet: passes.
export function hasLushGround(species, ex, n) {
  if (!species.lushGround || !ex.okapi) return true;
  return ex.okapi.moss >= species.lushGround.moss && ex.okapi.plants >= plantsNeeded(species, n);
}

export function hasClayLick(species, ex) {
  if (!species.clayLick || !ex.okapi) return true;
  return ex.okapi.clay >= species.clayLick.min;
}

// The share of its food it browses from the lush plants: up to lushGround.share with enough, less with fewer; nothing
// before the exhibit has been measured (as the zebra's grazing).
export function browseShare(species, ex, n) {
  const g = species.lushGround;
  if (!g || !ex.okapi) return 0;
  const need = plantsNeeded(species, Math.max(1, n));
  return g.share * Math.min(1, ex.okapi.plants / need);
}

// The Exhibit Clipboard's lines for Lush Okapis: the moss, the plants, the clay lick, the calves.
export function okapiLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, grown(residents));
  const t = ex.okapi;
  if (!t) {
    lines.push("§fMoss, lush plants and clay: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const need = plantsNeeded(species, n);
    const moss = species.lushGround.moss;
    lines.push(`§fMoss: ${t.moss >= moss ? "§a" : "§c"}${t.moss}§7 of ${moss} (${MOSS_HOW})`);
    lines.push(`§fLush plants to browse: ${t.plants >= need ? "§a" : "§c"}${t.plants}§7 of ${need} (${PLANT_HOW}): ${Math.round(browseShare(species, ex, n) * 100)}% of their food`);
    if (species.clayLick) lines.push(`§fClay lick: ${t.clay >= species.clayLick.min ? `§ayes§7 (${t.clay} clay blocks)` : "§cnone§7"}: ${CLAY_HOW}`);
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fCalves: §7${young}: each lies hidden its first park day, getting up only to nurse, then follows its mother`);
  return lines;
}

// Care warnings for Lush Okapis: lush ground, a clay lick, one grown male.
export function okapiWarnings(ex, residents, plural, species, T) {
  const out = [];
  const t = ex.okapi;
  const n = Math.max(1, grown(residents));
  if (t && !hasLushGround(species, ex, n)) out.push({ severity: 2, text: `${plural} live on lush ground: ${species.lushGround.moss} or more ${MOSS_HOW}, and ${plantsNeeded(species, n)} or more lush plants to browse: ${PLANT_HOW} (${t.moss} moss and ${t.plants} plants now; comfort can't rise above ${T.lushComfortCap} without them).` });
  if (t && !hasClayLick(species, ex)) out.push({ severity: 2, text: `${plural} lick clay for its salt and minerals: ${species.clayLick.min} or more blocks of ${CLAY_HOW} (none now; comfort can't rise above ${T.clayComfortCap} without it).` });
  if (species.oneMale && residents.filter((a) => !a.juvenile && a.sex === "male").length > 1) out.push({ severity: 2, text: `Two grown male ${plural.toLowerCase()} won't settle in one exhibit: each marks his own ground. Move the others to an exhibit of their own.` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live in lush caves, alone: under azalea trees on the surface, rooted dirt and hanging roots lead down to them. Out by day, they browse azalea, dripleaf and glow berries with long dark tongues and lick the clay round the cave pools; at night they lie down. Shy: come within ${T.shyRange} blocks in Survival without sneaking and one lifts its head, swivels its ears and walks off quickly. Sneak, or hold a Leafy Ration: within ${T.baitRange} blocks one comes over to you`;
}

// ---------------- the day and what it does ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// Out by day (T.day), lying down at night.
export function isDay(timeOfDay, T) {
  return within(((timeOfDay % 24000) + 24000) % 24000, T.day);
}

/**
 * What it heads for next: "browse" (lush plants), "feeder", "clay", "groom", "rub" (a grown male, a trunk), "flehmen" (a
 * grown male with a grown female near), "wander" or "rest". At night always "rest". `o`: { day, male, female, plants,
 * feeder, clay, rub }: what it is and what there is (in its exhibit, or for a wild one, round it). Weights T.weights.
 * @param {{ day: boolean, male?: boolean, female?: boolean, plants?: boolean, feeder?: boolean, clay?: boolean, rub?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["browse", o.plants ? W.browse : 0],
    ["feeder", o.feeder ? W.feeder : 0],
    ["clay", o.clay ? W.clay : 0],
    ["groom", W.groom],
    ["rub", o.male && o.rub ? W.rub : 0],
    ["flehmen", o.male && o.female ? W.flehmen : 0],
    ["wander", W.wander],
    ["rest", W.rest],
  ];
  let r = random() * options.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of options) {
    if (r < w) return what;
    r -= w;
  }
  return "wander";
}

// The lush plants beside the cell `c` it stands in, [{ dx, dz, h, key }] (dx = dz = 0: vines hanging over it): beside it
// at its level or up to 2 above, or hanging 1 or 2 above it. `typeAt(x, y, z)`: a block's typeId.
/** @param {(x: number, y: number, z: number) => (string | undefined)} typeAt */
export function plantsBeside(typeAt, c) {
  const out = [];
  for (const [dx, dz] of [[0, 0], ...DIRS]) {
    for (const h of dx || dz ? [0, 1, 2] : [1, 2]) {
      if (LUSH_PLANTS.has(typeAt(c.x + dx, c.y + h, c.z + dz) ?? "")) out.push({ dx, dz, h, key: `${c.x + dx},${c.y + h},${c.z + dz}` });
    }
  }
  return out;
}

// The clay it can lick from the cell `c`: under its feet ({ dx: 0, dz: 0 }), or in the floor (or a pool's floor) beside
// it; undefined with none.
/** @param {(x: number, y: number, z: number) => (string | undefined)} typeAt */
export function clayBeside(typeAt, c) {
  for (const [dx, dz] of [[0, 0], ...DIRS]) if (typeAt(c.x + dx, c.y - 1, c.z + dz) === CLAY) return { dx, dz };
  return undefined;
}

// A trunk beside the cell `c` to rub its neck on (at its level or one above): { dx, dz }, or undefined.
/** @param {(x: number, y: number, z: number) => (string | undefined)} typeAt */
export function trunkBeside(typeAt, c) {
  for (const [dx, dz] of DIRS) for (const h of [1, 0]) if (isRubbable(typeAt(c.x + dx, c.y + h, c.z + dz))) return { dx, dz };
  return undefined;
}

// The plant to browse from what's beside it: not the one it last browsed while there is another (it moves on from plant
// to plant), else that one.
export function pickPlant(beside, last, random = Math.random) {
  const fresh = beside.filter((p) => p.key !== last);
  const from = fresh.length ? fresh : beside;
  return from.length ? from[Math.floor(random() * from.length)] : undefined;
}
