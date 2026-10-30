// Unicorns (0.1.149, the Mythical Glade: research/mythical_plan.md "0.1.149 Unicorn"), pure: the unicorn measure (the
// glowing flowers on an exhibit's floor, and the floor cells with water beside them to dip a horn in), what an exhibit
// needs, the day, and what one does next. The game side is animals/unicorn.js.
// A fantasy animal on a horse's frame: it grazes grass and the glade's glowing flowers, rears up on its hind legs,
// lies down at night, and touches its horn to water (the legend: a unicorn's horn makes water pure), sparkles rising
// where it does. Every rule here is by the species' flags, never by name.

// The unicorn mobs, found by type (0.1.70: never by family alone).
export const UNICORN_TYPES = ["zoocraft:unicorn", "zoocraft:wild_unicorn"];

// What a unicorn is doing (its zoocraft:act entity property): the client plays the matching animation (6 the grazing
// one) and the Field Journal watches for it.
export const ACT = { none: 0, graze: 1, dip: 2, rear: 3, alert: 4, rest: 5, flowers: 6 };
// Lying down to rest: the client's get-up animation takes a moment, so the script holds it still that long after
// (BALANCE.unicorn.getUpTicks).
export const LYING_ACTS = [ACT.rest];

// The Mythical Glade's glowing flowers (0.1.147), the ones it grazes.
export const GLADE_FLOWERS = new Set(["zoocraft:moonbloom", "zoocraft:starpetal", "zoocraft:wisp_fern"]);
// What its horn dips into: water (still or running), or a Water Trough.
export const WATER = new Set(["minecraft:water", "minecraft:flowing_water", "zoocraft:water_trough"]);
export const TROUGH = "zoocraft:water_trough";
export const GRASS = "minecraft:grass_block";
// A dip's sparkles (RP particles/horn_sparkle.json).
export const SPARKLE = "zoocraft:horn_sparkle";

export const FLOWER_HOW = "Moonblooms, Starpetals or Wisp Ferns growing on the floor (pick them in a Mythical Glade; they grow on grass or dirt)";
export const WATER_HOW = "water beside the floor to dip a horn in: a Water Trough, or the edge of a pool";

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
// The four sides first, then the corners: the engine's walk to a flower or a pool can stop corner-on to it (on Mojang's
// server a unicorn walking to a Moonbloom stopped 0.9 from it, diagonally).
const DIRS8 = [...DIRS, [1, 1], [1, -1], [-1, 1], [-1, -1]];

// ---------------- the unicorn measure ----------------

/** @returns {{ flowers: number, dips: number }} */
export function newUnicornResult() {
  return { flowers: 0, dips: 0 };
}

/**
 * The unicorn measure (exhibits/exhibits.js, for unicorns living here), over the floor the walking measure found
 * (cells: key "x,y,z" -> kind; the "land" ones):
 * - flowers: the floor cells a glowing flower grows in (GLADE_FLOWERS: they are walked through, so a flower's cell is a
 *   floor cell);
 * - dips: the floor cells with water beside them (waterBeside: a side or a corner), where one can dip its horn.
 * `idAt(x, y, z)`: a block's typeId, undefined unloaded. A generator, a slice of `opts.cellsPerYield` floor cells at a
 * time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newUnicornResult>} out
 */
export function* measureUnicorn(idAt, cells, opts, out) {
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    if (GLADE_FLOWERS.has(idAt(x, y, z) ?? "")) out.flowers++;
    if (waterBeside(idAt, { x, y, z })) out.dips++;
  }
  return out;
}

// Water beside the cell `c` (at its level, as a Water Trough or a pool brimming level with the floor, or one below:
// a pool's surface level with the ground), on one of its four sides or corners: { dx, dz, y } (y: the water block's),
// else undefined.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt */
export function waterBeside(idAt, c) {
  for (const [dx, dz] of DIRS8) {
    const at = idAt(c.x + dx, c.y, c.z + dz);
    if (WATER.has(at ?? "")) return { dx, dz, y: c.y };
    if (at === "minecraft:air" && WATER.has(idAt(c.x + dx, c.y - 1, c.z + dz) ?? "")) return { dx, dz, y: c.y - 1 };
  }
  return undefined;
}

// A glowing flower to graze from the cell `c`: in it ({ dx: 0, dz: 0 }), or beside it (a side or a corner) at its level
// or a block up or down; undefined with none.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt */
export function flowerBeside(idAt, c) {
  if (GLADE_FLOWERS.has(idAt(c.x, c.y, c.z) ?? "")) return { dx: 0, dz: 0 };
  for (const [dx, dz] of DIRS8) for (const h of [0, -1, 1]) if (GLADE_FLOWERS.has(idAt(c.x + dx, c.y + h, c.z + dz) ?? "")) return { dx, dz };
  return undefined;
}

// Grass under its feet to graze where it stands.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt */
export function onGrass(idAt, c) {
  return idAt(c.x, c.y - 1, c.z) === GRASS;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Glowing flowers (species.gladeFlowers): `per` for each grown one, `min` at least.
export function flowersNeeded(species, n) {
  const g = species.gladeFlowers;
  return g ? Math.max(g.min, Math.ceil(g.per * n)) : 0;
}

// Glowing flowers enough (cause "bloom"). False caps comfort. Not measured yet: passes.
export function hasGladeFlowers(species, ex, n) {
  if (!species.gladeFlowers || !ex.unicorn) return true;
  return ex.unicorn.flowers >= flowersNeeded(species, n);
}

// The Exhibit Clipboard's lines for unicorns: the glowing flowers, the water to dip in, the foals.
export function unicornLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, grown(residents));
  const t = ex.unicorn;
  if (!t) {
    lines.push("§fGlowing flowers and water: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const need = flowersNeeded(species, n);
    lines.push(`§fGlowing flowers: ${t.flowers >= need ? "§a" : "§c"}${t.flowers}§7 of ${need} (${FLOWER_HOW})`);
    lines.push(`§fWater to dip a horn in: ${t.dips > 0 ? `§a${t.dips}§7 spots on the floor beside it` : "§enone§7"} (${WATER_HOW})`);
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fFoals: §7${young}: they follow their mother about`);
  return lines;
}

// Care warnings for unicorns: the glowing flowers.
export function unicornWarnings(ex, residents, plural, species, T) {
  const out = [];
  const t = ex.unicorn;
  const n = Math.max(1, grown(residents));
  if (t && !hasGladeFlowers(species, ex, n)) out.push({ severity: 2, text: `${plural} graze the glowing flowers of their glade: ${flowersNeeded(species, n)} or more ${FLOWER_HOW} (${t.flowers} now; comfort can't rise above ${T.flowerComfortCap} without them).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live only in the Mythical Glade, in small herds on the open grass between the giant trees: grazing, nibbling the glowing flowers, dipping their horns in the glowing pools so sparkles rise, and lying down at night. Shy: come within ${T.shyRange} blocks in Survival without sneaking and one rears up and canters off. Sneak, or hold a Grain Ration: within ${T.baitRange} blocks one comes over to you`;
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
 * What it heads for next: "flowers" (the glowing flowers), "graze" (grass where it stands), "dip" (water), "feeder",
 * "rear", "wander" or "rest". At night always "rest". `o`: { day, flowers, grass, water, feeder }: what there is (in its
 * exhibit, or for a wild one, round it). Weights T.weights.
 * @param {{ day: boolean, flowers?: boolean, grass?: boolean, water?: boolean, feeder?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["flowers", o.flowers ? W.flowers : 0],
    ["graze", o.grass ? W.graze : 0],
    ["dip", o.water ? W.dip : 0],
    ["feeder", o.feeder ? W.feeder : 0],
    ["rear", W.rear],
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

// Where a dip's sparkles rise: over the middle of the water block beside it, just above its surface (a trough's water
// stands higher in the block).
/** @param {{ x: number, y: number, z: number }} c @param {{ dx: number, dz: number, y: number }} w @param {boolean} trough */
export function sparkleAt(c, w, trough) {
  return { x: c.x + w.dx + 0.5, y: w.y + (trough ? 0.9 : 1.0), z: c.z + w.dz + 0.5 };
}
