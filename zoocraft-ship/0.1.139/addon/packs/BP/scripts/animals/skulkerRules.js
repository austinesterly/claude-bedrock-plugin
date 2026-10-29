// Skulkers (0.1.139, the cave wing: research/cave_plan.md "0.1.139 Skulker"), pure: the skulker measure (the sculk in
// an exhibit's floor, and any sculk shrieker in or beside it), what an exhibit needs, what one hears, the day, and what
// one does next. The game side is animals/skulker.js; its Ancient Cities are animals/ancientCityRules.js.
// A fantasy animal (research/cave_facts.md): the warden's shape and senses, gentle. Blind; it hears by the vibrations
// of someone moving (sneaking makes none, as for the warden and the sculk sensor) and walks over to sniff them, its
// heart beating fast, and digs into the sculk to rest as the warden digs down. Every rule here is by the species'
// flags, never by name.
import { isNocturnalHouse, houseProblems } from "./nightRules.js";

// The skulker mobs, found by type (0.1.70: never by family alone).
export const SKULKER_TYPES = ["zoocraft:skulker", "zoocraft:wild_skulker"];

// What a skulker is doing (its zoocraft:act entity property): the client plays the matching animation and the Field
// Journal watches for it. listen: still, its tendrils quivering and clicking; sniff: leaning in to sniff someone it
// walked over to; buried: sunk into the sculk with its tendrils showing (only to look at); emerge: rising out of it.
export const ACT = { none: 0, listen: 1, sniff: 2, feed: 3, sit: 4, buried: 5, emerge: 6 };
// Down (sitting, or sunk into the sculk): the client's getting-up animation takes a moment, so the script holds it
// still that long after (BALANCE.skulker.getUpTicks, emergeTicks).
export const LYING_ACTS = [ACT.sit, ACT.buried];

export const SCULK = "minecraft:sculk";
export const SHRIEKER = "minecraft:sculk_shrieker";
export const SCULK_HOW = "sculk in the floor (sculk drops itself only when mined with Silk Touch; Ancient City chests hold it, and a sculk catalyst spreads it where mobs die)";
export const DARK_HOW = "no daylight on the floor (solid walls and roof, tinted glass to look through) and nothing brighter than light 7: Nocturnal Lamps, glow lichen or a sculk catalyst; torches, lanterns and soul lanterns are too bright";

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- the skulker measure ----------------

/** @returns {{ sculk: number, shriekers: number }} */
export function newSkulkerResult() {
  return { sculk: 0, shriekers: 0 };
}

/**
 * The skulker measure (exhibits/exhibits.js, for Skulkers living here), over the floor the walking measure found (cells:
 * key "x,y,z" -> kind; the "land" ones):
 * - sculk: the sculk blocks under a floor cell;
 * - shriekers: sculk shriekers under a floor cell, in one, or beside one at its level or a block down, each counted once.
 * `idAt(x, y, z)`: a block's typeId, undefined unloaded. A generator, a slice of `opts.cellsPerYield` floor cells a time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newSkulkerResult>} out
 */
export function* measureSkulker(idAt, cells, opts, out) {
  const shriek = new Set();
  let work = 0;
  const look = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (!shriek.has(k) && idAt(x, y, z) === SHRIEKER) {
      shriek.add(k);
      out.shriekers++;
    }
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    if (idAt(x, y - 1, z) === SCULK) out.sculk++;
    look(x, y - 1, z);
    look(x, y, z);
    for (const [dx, dz] of DIRS) {
      look(x + dx, y, z + dz);
      look(x + dx, y - 1, z + dz);
    }
  }
  return out;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Sculk (cause "sculk"): enough in the floor. False caps comfort. Not measured yet: passes.
export function hasSculkFloor(species, ex) {
  if (!species.sculkFloor || !ex.skulker) return true;
  return ex.skulker.sculk >= species.sculkFloor.min;
}

// No sculk shrieker (cause "shriek"): one in or beside the floor frightens them. Not measured yet: passes.
export function isQuiet(species, ex) {
  if (!species.sculkFloor || !ex.skulker) return true;
  return ex.skulker.shriekers === 0;
}

// The Exhibit Clipboard's lines for Skulkers: the dark, the sculk, the shriekers, the young.
export function skulkerLines(ex, residents, species, balance) {
  const lines = [];
  const T = balance.skulker;
  if (!ex.house) lines.push("§fDark: §7not measured yet: use the Habitat Marker on the ground inside again");
  else if (isNocturnalHouse(ex, balance)) lines.push(`§fDark: §ayes§7 (${ex.house.lit ? "dimly lit; they glow, so guests see them" : "pitch dark; they glow, so guests see them"})`);
  else lines.push(`§fDark: §cno§7: ${houseProblems(ex.house, balance).join("; ")}. Comfort can't rise above ${balance.chorusMoth.dimComfortCap}`);
  const t = ex.skulker;
  if (!t) {
    lines.push("§fSculk: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const min = species.sculkFloor.min;
    lines.push(`§fSculk: ${t.sculk >= min ? "§a" : "§c"}${t.sculk}§7 of ${min} (${SCULK_HOW})`);
    lines.push(t.shriekers ? `§fSculk shriekers: §c${t.shriekers}§7: they frighten them (comfort can't rise above ${T.shriekComfortCap}): take them out. Sculk sensors are fine` : "§fSculk shriekers: §anone§7 (sculk sensors are fine)");
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§f${species.breeding.youngPlural[0].toUpperCase()}${species.breeding.youngPlural.slice(1)}: §7${young}: they follow their mother about`);
  return lines;
}

// Care warnings for Skulkers: the dark, the sculk, no shriekers.
export function skulkerWarnings(ex, residents, plural, species, balance) {
  const out = [];
  const T = balance.skulker;
  if (ex.house && !isNocturnalHouse(ex, balance)) out.push({ severity: 2, text: `${plural} live in the dark: ${DARK_HOW}. Now: ${houseProblems(ex.house, balance).join("; ")}. Comfort can't rise above ${balance.chorusMoth.dimComfortCap} until it's dark. Measure again with the Habitat Marker after.` });
  const t = ex.skulker;
  if (t && !hasSculkFloor(species, ex)) out.push({ severity: 2, text: `${plural} need ${species.sculkFloor.min} or more blocks of ${SCULK_HOW} (${t.sculk} now; comfort can't rise above ${T.sculkComfortCap} without it).` });
  if (t && !isQuiet(species, ex)) out.push({ severity: 2, text: `A sculk shrieker in or beside the floor frightens ${plural.toLowerCase()} (${t.shriekers} now; comfort can't rise above ${T.shriekComfortCap}): take ${t.shriekers === 1 ? "it" : "them"} out. Sculk sensors are fine.` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live only in the deep dark, very rarely, on its sculk and deepslate. The first time you walk into an Ancient City, one is somewhere near, resting out of sight. They are blind: move within ${T.hearRange} blocks without sneaking and one stops, its tendrils quivering and clicking, then walks over to sniff you, its heart beating fast. Never dangerous. Hold an Insect Ration and one comes over from ${T.baitRange} blocks`;
}

// ---------------- what it hears ----------------

/**
 * Who it hears: the nearest of `heard` (people who made a sound just now: moved without sneaking; { id, location,
 * dimension }) in its dimension within `range` blocks. undefined if none.
 * @template {{ id: string, location: { x: number, y: number, z: number }, dimension: string }} P
 * @param {{ x: number, y: number, z: number }} at @param {string} dimension @param {P[]} heard @param {number} range
 * @returns {P | undefined}
 */
export function hearing(at, dimension, heard, range) {
  let best;
  let bestD = Infinity;
  for (const p of heard) {
    if (p.dimension !== dimension) continue;
    const d = Math.hypot(p.location.x - at.x, p.location.y - at.y, p.location.z - at.z);
    if (d <= range && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

// Whether someone made a sound since the last look: moved more than `min` blocks (from `was`, the last look, when it was
// the one just before), not sneaking, and not a spectator.
/** @param {{ x: number, y: number, z: number } | undefined} was @param {{ x: number, y: number, z: number }} now */
export function madeSound(was, now, sneaking, spectator, min) {
  if (!was || sneaking || spectator) return false;
  return Math.hypot(now.x - was.x, now.y - was.y, now.z - was.z) > min;
}

// ---------------- the day and what it does ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// Up by day (T.day), resting at night (dug into the sculk, or sitting).
export function isDay(timeOfDay, T) {
  return within(((timeOfDay % 24000) + 24000) % 24000, T.day);
}

/**
 * What it does next: "feeder" (in its exhibit, with food), "wander", "sit", "listen" (standing still, its tendrils
 * quivering) or, at night always, "rest". `o`: { day, feeder }. Weights T.weights.
 * @param {{ day: boolean, feeder?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["feeder", o.feeder ? W.feeder : 0],
    ["wander", W.wander],
    ["sit", W.sit],
    ["listen", W.listen],
  ];
  let r = random() * options.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of options) {
    if (r < w) return what;
    r -= w;
  }
  return "wander";
}

// Where it rests: dug into the floor when it stands on sculk (or on a sculk vein), sitting anywhere else.
/** @param {string | undefined} under the block under it @param {string | undefined} at the block it stands in */
export function restAct(under, at) {
  return under === SCULK || at === "minecraft:sculk_vein" ? ACT.buried : ACT.sit;
}
