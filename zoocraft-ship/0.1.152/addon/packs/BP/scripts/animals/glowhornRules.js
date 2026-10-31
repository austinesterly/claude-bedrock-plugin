// Glowhorn Stags (0.1.152, the Mythical Glade: research/mythical_plan.md "0.1.152 Glowhorn Stag"), pure: the stag
// measure (tree trunks at the floor's edge to rub antlers on), what an exhibit needs, the day and the twilight, what one
// does next, and where it rubs. The game side is animals/glowhorn.js.
// A great deer on an elk's frame whose antlers glow, bone-pale at the burr to mint and turquoise at the tips, brighter
// at night: it grazes, eats from a Hay Rack, bellows with its head stretched up and a puff of breath, rubs its antlers
// on a tree trunk, and at dusk (and dawn) lifts its head while its antlers flare and glowing motes rise from them with a
// chime; at night it lies down, its antlers still alight. Every rule here is by the species' flags, never by name.

// The stag mobs, found by type (0.1.70: never by family alone).
export const STAG_TYPES = ["zoocraft:glowhorn_stag", "zoocraft:wild_glowhorn_stag"];

// What a stag is doing (its zoocraft:act entity property): the client plays the matching animation (6 the glow, which
// also draws the night skin's brighter antlers) and the Field Journal watches for it. 7 and 8: lining up for a rub, a
// few steps forward or back with the script moving it (lineUp), the client's legs walking by time.
export const ACT = { none: 0, graze: 1, bellow: 2, rub: 3, alert: 4, rest: 5, glow: 6, step: 7, back: 8 };
// Lying down to rest: the client's get-up animation takes a moment, so the script holds it still that long after
// (BALANCE.glowhorn.getUpTicks).
export const LYING_ACTS = [ACT.rest];

export const GRASS = "minecraft:grass_block";
// The glow's motes (RP particles/antler_mote.json) and the bellow's breath (particles/breath_puff.json).
export const MOTE = "zoocraft:antler_mote";
export const BREATH = "zoocraft:breath_puff";

// A trunk: the glade's own logs and wood, or any vanilla log, wood, stem or hyphae, stripped or not.
export const GLADE_LOGS = new Set(["zoocraft:mythwood_log", "zoocraft:mythwood_wood", "zoocraft:white_willow_log", "zoocraft:whitewood_log"]);
const VANILLA_TRUNK = /^minecraft:(stripped_)?[a-z_]+_(log|wood|stem|hyphae)$/;
/** @param {string | undefined} id */
export function isTrunk(id) {
  return Boolean(id) && (GLADE_LOGS.has(id) || VANILLA_TRUNK.test(id));
}
// What the antlers and the head pass over on the way to the bark: air, or low plants.
const LOW_PLANTS = new Set(["minecraft:short_grass", "minecraft:tall_grass", "minecraft:fern", "minecraft:large_fern", "zoocraft:moonbloom", "zoocraft:starpetal", "zoocraft:wisp_fern"]);
/** @param {string | undefined} id */
function open(id) {
  return id === "minecraft:air" || LOW_PLANTS.has(id ?? "");
}

export const TRUNK_HOW = "a tree trunk or a log (any wood) at the floor's edge or standing in it, with three blocks of open floor in front of it";

// How far a rub's trunk is from where it stands (cells, straight along a side): the client's rub reaches its antlers'
// foremost tines just into the bark 2.5 blocks ahead of its middle (with the head tucked they reach a block past its
// face), the face well short of it.
export const RUB_GAP = 3;

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * Lining up for a rub. The engine's walk to a trunk (the entity's move_to_block) ends with its body against the bark,
 * its middle a block and a half off (0.1.152 bench), too close for its antlers. From where it stopped (`p`), the way to
 * the middle of the rub cell `c` (rubFrom's `r`: the trunk along that side), facing the trunk all the way: forward
 * ("step") or backing off ("back"), at most T.lineUp.side blocks off to a side and T.lineUp.range along.
 * { act, pts: a point each tick } or undefined.
 * @param {{ x: number, z: number }} p
 * @param {{ x: number, z: number }} c
 * @param {{ dx: number, dz: number }} r
 */
export function lineUp(p, c, r, T) {
  const L = T.lineUp;
  const mx = c.x + 0.5 - p.x, mz = c.z + 0.5 - p.z;
  const along = mx * r.dx + mz * r.dz; // towards the trunk
  const side = Math.abs(mx * r.dz - mz * r.dx);
  if (side > L.side || Math.abs(along) > L.range) return undefined;
  const back = along < 0;
  const n = Math.max(1, Math.ceil(Math.hypot(mx, mz) / (back ? L.backPace : L.stepPace)));
  const pts = [];
  for (let i = 1; i <= n; i++) pts.push({ x: p.x + (mx * i) / n, z: p.z + (mz * i) / n });
  return { act: back ? "back" : "step", pts };
}

// ---------------- the stag measure ----------------

/** @returns {{ trunks: number, rubs: number }} */
export function newStagResult() {
  return { trunks: 0, rubs: 0 };
}

/**
 * Where it can rub from the cell `c` (it stands there): a trunk RUB_GAP cells along one of the four sides, at the
 * cell's level or a block up, with the cells between open at both heights (air or low plants). { dx, dz, y } (y: the
 * trunk block's), else undefined.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {{ x: number, y: number, z: number }} c
 */
export function rubFrom(idAt, c) {
  next: for (const [dx, dz] of DIRS) {
    for (let k = 1; k < RUB_GAP; k++) {
      const mx = c.x + dx * k, mz = c.z + dz * k;
      if (!open(idAt(mx, c.y, mz)) || !open(idAt(mx, c.y + 1, mz))) continue next;
    }
    const tx = c.x + dx * RUB_GAP, tz = c.z + dz * RUB_GAP;
    if (isTrunk(idAt(tx, c.y + 1, tz))) return { dx, dz, y: c.y + 1 };
    if (isTrunk(idAt(tx, c.y, tz))) return { dx, dz, y: c.y };
  }
  return undefined;
}

/**
 * The stag measure (exhibits/exhibits.js, for stags living here), over the floor the walking measure found (cells: key
 * "x,y,z" -> kind; the "land" ones):
 * - trunks: the trunk blocks beside the floor (a side, at a floor cell's level or a block up), each once;
 * - rubs: the floor cells it can rub from (rubFrom).
 * `idAt(x, y, z)`: a block's typeId, undefined unloaded. A generator, a slice of `opts.cellsPerYield` floor cells at a
 * time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newStagResult>} out
 */
export function* measureStag(idAt, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dz] of DIRS) {
      for (const h of [0, 1]) {
        const tk = `${x + dx},${y + h},${z + dz}`;
        if (seen.has(tk) || !isTrunk(idAt(x + dx, y + h, z + dz))) continue;
        seen.add(tk);
        out.trunks++;
      }
    }
    if (rubFrom(idAt, { x, y, z })) out.rubs++;
  }
  return out;
}

// ---------------- what an exhibit needs ----------------
// A trunk to rub (cause "trunk": species.trunks, `min` rub spots). False caps comfort. Not measured yet: passes.
export function hasTrunks(species, ex) {
  if (!species.trunks || !ex.stag) return true;
  return ex.stag.rubs >= species.trunks.min;
}

// The Exhibit Clipboard's lines for stags: the trunks, the fawns.
export function stagLines(ex, residents, species) {
  const lines = [];
  const t = ex.stag;
  if (!t) lines.push("§fTrunks to rub: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fTrunks to rub: ${t.rubs >= species.trunks.min ? "§a" : "§c"}${t.rubs}§7 spot${t.rubs === 1 ? "" : "s"} on the floor (${t.trunks} trunk block${t.trunks === 1 ? "" : "s"} beside it; ${TRUNK_HOW})`);
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fFawns: §7${young}: dappled, with glowing spots; they follow their mother`);
  return lines;
}

// Care warnings for stags: the trunks.
export function stagWarnings(ex, residents, plural, species, T) {
  const out = [];
  if (ex.stag && !hasTrunks(species, ex)) out.push({ severity: 2, text: `${plural} rub their antlers on tree trunks: ${TRUNK_HOW} (no spot now; comfort can't rise above ${T.trunkComfortCap} without one).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live only in the Mythical Glade, in small herds among the giant trees: grazing, rubbing their antlers on the trunks, bellowing, and at dusk and dawn lifting their heads while their antlers flare and glowing motes rise from them. At night they lie down, their antlers still alight. Wary: come within ${T.shyRange} blocks in Survival without sneaking and one stops, head up, then bounds off. Hold a Leafy Ration: within ${T.baitRange} blocks one comes over to you`;
}

// ---------------- the day and what it does ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}
const tod = (t) => ((t % 24000) + 24000) % 24000;

// Out by day (T.day), lying down at night.
export function isDay(timeOfDay, T) {
  return within(tod(timeOfDay), T.day);
}

// Dusk or dawn (T.twilight: a list of ranges), when it shows its glow most.
export function isTwilight(timeOfDay, T) {
  const t = tod(timeOfDay);
  return T.twilight.some((r) => within(t, r));
}

/**
 * What it heads for next: "graze" (grass where it stands), "feeder", "rub" (a trunk; a grown one only), "bellow" (a
 * grown one only), "glow" (far likelier at dusk and dawn), "wander" or "rest". At night always "rest". `o`: { day,
 * twilight, grass, feeder, trunk, young }: what there is (in its exhibit, or for a wild one, round it). Weights
 * T.weights; at twilight the glow's times T.twilightGlow.
 * @param {{ day: boolean, twilight?: boolean, grass?: boolean, feeder?: boolean, trunk?: boolean, young?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["graze", o.grass ? W.graze : 0],
    ["feeder", o.feeder ? W.feeder : 0],
    ["rub", o.trunk && !o.young ? W.rub : 0],
    ["bellow", o.young ? 0 : W.bellow],
    ["glow", W.glow * (o.twilight ? T.twilightGlow : 1)],
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

// Where something at `ahead` blocks in front of its middle and `up` over its feet is, for a mob at `pos` facing `yaw`
// (Minecraft's: 0 south, +z; 90 west, -x), at `scale` (a grown one 1, a fawn 0.5).
/** @param {{ x: number, y: number, z: number }} pos */
export function pointAt(pos, yaw, ahead, up, scale = 1) {
  const r = (yaw * Math.PI) / 180;
  return { x: pos.x - Math.sin(r) * ahead * scale, y: pos.y + up * scale, z: pos.z + Math.cos(r) * ahead * scale };
}
