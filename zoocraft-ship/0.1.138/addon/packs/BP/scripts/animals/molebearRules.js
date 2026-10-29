// Earth Molebears (0.1.138, the cave wing: research/cave_plan.md "0.1.138 Earth Molebear"), pure: the molebear measure
// (the Burrow Soil beside an exhibit's floor), what a tunnel may dig, what an exhibit needs, the day, and what one does
// next. The game side is animals/molebear.js.
// Sources (research/cave_facts.md): a black bear's body (it digs its own den into a hillside, and digs into stumps and
// logs for grubs, licking them up); a mole's spade hands, palms turned out, swimming through the soil in a breaststroke,
// pushing the loose soil up; the star-nosed mole's star, touched to the ground a dozen times a second, and the fastest
// eater of any mammal. Every rule here is by the species' flags, never by name.

// The molebear mobs, found by type (0.1.70: never by family alone).
export const MOLEBEAR_TYPES = ["zoocraft:molebear", "zoocraft:wild_molebear"];

// What a molebear is doing (its zoocraft:act entity property): the client plays the matching animation and the Field
// Journal watches for it.
export const ACT = { none: 0, dig: 1, sniff: 2, snap: 3, stand: 4, rest: 5, buried: 6, crawl: 7 };
// Down (resting curled up, or sunk into the ground): the client's getting-up animation takes a moment, so the script
// holds it still that long after (BALANCE.molebear.getUpTicks).
export const LYING_ACTS = [ACT.rest, ACT.buried];

// The only block a zoo molebear digs.
export const BURROW_SOIL = "zoocraft:burrow_soil";
export const SOIL_HOW = "Burrow Soil (2 dirt, a gravel and a clay ball make 4): a bank of it inside the exhibit, two blocks high and three wide, to tunnel into from the floor";
// The grit a molebear's digging throws up, for Burrow Soil (its texture's earth, gen138/ents138.py); other ground takes
// the crab's colours (crabRules.js gritColour).
export const SOIL_GRIT = { r: 0x7a / 255, g: 0x5a / 255, b: 0x3c / 255 };
// A block that falls when what's under it goes: never left over a tunnel.
const FALLING = [/^minecraft:(sand|red_sand|gravel|suspicious_sand|suspicious_gravel|anvil|chipped_anvil|damaged_anvil|dragon_egg|pointed_dripstone|scaffolding)$/, /_concrete_powder$/];
// The natural cave floor a wild one burrows into for a rest (only to look at: the ground isn't touched).
export const WILD_GROUND = new Set(["minecraft:stone", "minecraft:deepslate", "minecraft:tuff", "minecraft:cobbled_deepslate", "minecraft:andesite", "minecraft:diorite", "minecraft:granite", "minecraft:gravel", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:dirt_with_roots"]);

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- the molebear measure ----------------

/** @returns {{ soil: number, bank: number }} */
export function newMolebearResult() {
  return { soil: 0, bank: 0 };
}

/**
 * The molebear measure (exhibits/exhibits.js, for Earth Molebears living here), over the floor the walking measure found
 * (cells: key "x,y,z" -> kind; the "land" ones) and its box:
 * - soil: the Burrow Soil blocks under a floor cell, or beside one at its level or one above, each counted once;
 * - bank: those it can start a tunnel into from a floor cell beside them (canDig): the faces to dig.
 * `idAt(x, y, z)`: a block's typeId, undefined unloaded; `kindAt`: the exhibit reader's kind. A generator, a slice of
 * `opts.cellsPerYield` floor cells at a time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {(x: number, y: number, z: number) => string} kindAt
 * @param {Map<string, string>} cells
 * @param {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } | undefined} box
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newMolebearResult>} out
 */
export function* measureMolebear(idAt, kindAt, cells, box, opts, out) {
  const seen = new Set();
  const banks = new Set();
  let work = 0;
  const count = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (seen.has(k) || idAt(x, y, z) !== BURROW_SOIL) return;
    seen.add(k);
    out.soil++;
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    count(x, y - 1, z);
    for (const [dx, dz] of DIRS) {
      count(x + dx, y, z + dz);
      count(x + dx, y + 1, z + dz);
      const bk = `${x + dx},${y},${z + dz}`;
      if (!banks.has(bk) && canDig(idAt, kindAt, { x, y, z }, { x: x + dx, y, z: z + dz }, box)) {
        banks.add(bk);
        out.bank++;
      }
    }
  }
  return out;
}

// ---------------- what a tunnel may dig ----------------

// Firm ground round a tunnel: Burrow Soil, or a full solid block (the exhibit reader's "solid") that doesn't fall.
// Unloaded is never firm.
function firm(idAt, kindAt, x, y, z) {
  const id = idAt(x, y, z);
  if (!id) return false;
  if (id === BURROW_SOIL) return true;
  return kindAt(x, y, z) === "solid" && !FALLING.some((r) => r.test(id));
}

/**
 * Whether it may dig the block at `to` from `from` (the cell it stands in, or the tunnel's last block: beside it, at its
 * level). Only Burrow Soil; only inside its exhibit's reach (`box`: the measured floor's box, a block wider each way,
 * at the floor's heights); and only where digging leaves a dead end: firm ground under it, over it and on its three
 * other sides. So a tunnel never breaks into the open, into another tunnel, under a wall or out of the exhibit, and
 * nothing can fall into it.
 * `idAt(x, y, z)`: a block's typeId; `kindAt(x, y, z)`: the exhibit reader's kind ("solid", "air", ...).
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {(x: number, y: number, z: number) => string} kindAt
 * @param {{ x: number, y: number, z: number }} from
 * @param {{ x: number, y: number, z: number }} to
 * @param {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } | undefined} box
 */
export function canDig(idAt, kindAt, from, to, box) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  if (to.y !== from.y || Math.abs(dx) + Math.abs(dz) !== 1) return false;
  if (idAt(to.x, to.y, to.z) !== BURROW_SOIL) return false;
  if (!box || to.x < box.min.x - 1 || to.x > box.max.x + 1 || to.z < box.min.z - 1 || to.z > box.max.z + 1 || to.y < box.min.y || to.y > box.max.y) return false;
  const around = [
    [0, -1, 0],
    [0, 1, 0],
    [dx, 0, dz],
    [dz, 0, dx],
    [-dz, 0, -dx],
  ];
  return around.every(([ax, ay, az]) => firm(idAt, kindAt, to.x + ax, to.y + ay, to.z + az));
}

// The first face it can start a tunnel into from the cell `c`: { dx, dz }, or undefined.
export function faceBeside(idAt, kindAt, c, box) {
  for (const [dx, dz] of DIRS) if (canDig(idAt, kindAt, c, { x: c.x + dx, y: c.y, z: c.z + dz }, box)) return { dx, dz };
  return undefined;
}

/**
 * Where it starts a tunnel from, standing at `p` (where the engine's walk to the soil left it): the cell it's in, or one
 * beside it (its eight neighbours, at its level), the nearest first, that is open floor (`open(x, y, z)`: room for it
 * there on firm ground) with a face it can dig into. { cell, dir: { dx, dz } }, or undefined.
 * @param {(x: number, y: number, z: number) => boolean} open
 */
export function tunnelStart(idAt, kindAt, open, p, box) {
  const here = { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
  const cells = [];
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) cells.push({ x: here.x + dx, y: here.y, z: here.z + dz });
  cells.sort((a, b) => Math.hypot(a.x + 0.5 - p.x, a.z + 0.5 - p.z) - Math.hypot(b.x + 0.5 - p.x, b.z + 0.5 - p.z));
  for (const c of cells) {
    if ((c.x !== here.x || c.z !== here.z) && !open(c.x, c.y, c.z)) continue;
    const dir = faceBeside(idAt, kindAt, c, box);
    if (dir) return { cell: c, dir };
  }
  return undefined;
}

// Steps from the point `p` to the centre of the cell `c` (at p's height), none longer than `size`, the last at the centre.
export function walkSteps(p, c, size) {
  const to = { x: c.x + 0.5, z: c.z + 0.5 };
  const n = Math.max(1, Math.ceil(Math.hypot(to.x - p.x, to.z - p.z) / size));
  const out = [];
  for (let i = 1; i < n; i++) out.push({ x: p.x + ((to.x - p.x) * i) / n, y: p.y, z: p.z + ((to.z - p.z) * i) / n });
  out.push({ x: to.x, y: p.y, z: to.z });
  return out;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Burrow Soil (cause "burrow"): soil enough beside the floor. False caps comfort. Not measured yet: passes.
export function hasBurrowSoil(species, ex) {
  if (!species.burrowSoil || !ex.molebear) return true;
  return ex.molebear.soil >= species.burrowSoil.min;
}

// The share of its food it digs up as grubs: up to burrowSoil.share with a bank face for each grown one, less with
// fewer; nothing before the exhibit has been measured (as the okapi's browsing).
export function grubShare(species, ex, n) {
  const g = species.burrowSoil;
  if (!g || !ex.molebear) return 0;
  return g.share * Math.min(1, ex.molebear.bank / Math.max(1, n));
}

// Digging left today, of T.digsPerDay a park day (its record's dug: { day, n }).
export function digsLeft(a, day, T) {
  const d = a?.dug;
  return d && d.day === day ? Math.max(0, T.digsPerDay - d.n) : T.digsPerDay;
}

// The Exhibit Clipboard's lines for Earth Molebears: the Burrow Soil, the banks to dig, the cubs.
export function molebearLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, grown(residents));
  const t = ex.molebear;
  if (!t) {
    lines.push("§fBurrow Soil: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const min = species.burrowSoil.min;
    lines.push(`§fBurrow Soil: ${t.soil >= min ? "§a" : "§c"}${t.soil}§7 of ${min} (${SOIL_HOW})`);
    lines.push(`§fFaces to tunnel into: ${t.bank >= n ? "§a" : "§e"}${t.bank}§7: grubs dug up are ${Math.round(grubShare(species, ex, n) * 100)}% of their food. Fill dug tunnels with Burrow Soil again to keep it up`);
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fCubs: §7${young}: they follow their mother about`);
  return lines;
}

// Care warnings for Earth Molebears: Burrow Soil to dig.
export function molebearWarnings(ex, residents, plural, species, T) {
  const out = [];
  const t = ex.molebear;
  if (t && !hasBurrowSoil(species, ex)) out.push({ severity: 2, text: `${plural} need ${species.burrowSoil.min} or more blocks of ${SOIL_HOW} (${t.soil} now; their tunnels use it up, so fill them in again now and then; comfort can't rise above ${T.soilComfortCap} without it).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live in ordinary caves below y 0, alone: not in the lush caves or the deep dark. They wander the cave floor sniffing with their pink star noses, stand up on their hind legs to sniff the air, and sink into the ground for a rest with only the back and the star showing. Come within ${T.hideRange} blocks without sneaking and one digs itself in; within ${T.standRange} it stands up to sniff at you. Hold an Insect Ration: within ${T.baitRange} blocks one comes over to you`;
}

// ---------------- the day and what it does ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// Out by day (T.day), resting curled up at night.
export function isDay(timeOfDay, T) {
  return within(((timeOfDay % 24000) + 24000) % 24000, T.day);
}

/**
 * What it heads for next: "dig" (a bank of Burrow Soil, with digging left today), "feeder", "sniff", "stand", "wander"
 * or "rest". At night always "rest". `o`: { day, soil, feeder }: what there is (in its exhibit; a wild one has no soil or
 * feeder). Weights T.weights.
 * @param {{ day: boolean, soil?: boolean, feeder?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["dig", o.soil ? W.dig : 0],
    ["feeder", o.feeder ? W.feeder : 0],
    ["sniff", W.sniff],
    ["stand", W.stand],
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

// The steps of a crawl from `a` to `b` (block cells: their centres at floor level), `n` of them, the last at `b`.
export function crawlSteps(a, b, n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    out.push({ x: a.x + 0.5 + (b.x - a.x) * k, y: a.y, z: a.z + 0.5 + (b.z - a.z) * k });
  }
  return out;
}
