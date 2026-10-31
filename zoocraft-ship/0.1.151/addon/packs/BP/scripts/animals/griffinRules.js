// Griffins (0.1.151, the Mythical Glade: research/mythical_plan.md "0.1.151 Griffin"), pure: the griffin measure (gold
// in or on an exhibit's floor: the hoard), what an exhibit needs, what one does on the ground, its dive, where it flies
// and lands. The game side is animals/griffin.js.
// A lion's body with an eagle's head, wings and forelegs, about 4.5 blocks nose to tail with an 8-block span: it flies
// round the dragons' kind of hall (great_aerial), beating and gliding, and now and then climbs high and dives like an
// eagle; it lands to guard its gold with its wings mantled round it, to screech rearing up, to preen, to eat from the
// feeder, and at night to sleep by its hoard. The hall's flight, landing and spot rules are the dragon's
// (animals/dragonRules.js), with a griffin's numbers. Every rule here is by the species' flags, never by name.

import { GLIDE } from "./glide.js";

// The griffin mobs, found by type (0.1.70: never by family alone).
export const GRIFFIN_TYPES = ["zoocraft:griffin", "zoocraft:wild_griffin"];
export const WILD_GRIFFIN = "zoocraft:wild_griffin";

// What a griffin is doing (its zoocraft:act entity property; zoocraft:gliding picks the glide over the beating while it
// flies): the client plays the matching animation and the Field Journal watches for it.
export const ACT = { fly: 0, stand: 1, guard: 2, screech: 3, preen: 4, eat: 5, sleep: 6, hover: 7, dive: 8 };
export const GROUND_ACTS = [ACT.stand, ACT.guard, ACT.screech, ACT.preen, ACT.eat, ACT.sleep];

// Its hoard: a block of gold or of raw gold in its floor or set on it (the legend: griffins guard gold).
export const GOLD = new Set(["minecraft:gold_block", "minecraft:raw_gold_block"]);
export const HOARD_HOW = "a block of gold or raw gold on the floor";

// The flight (animals/glide.js's maths with a griffin's numbers): quicker than a dragon and turning tighter.
export const GRIFFIN_FLIGHT = {
  ...GLIDE,
  speed: 0.25, // blocks a tick flying (5 a second)
  edgeSpeed: 0.09, // slower when the air ahead runs out, so it turns before a wall
  turn: 4.5, // degrees a tick it turns toward its spot
  sharpTurn: 11, // degrees a tick when the air ahead runs out
  depthGain: 0.1, // how firmly it holds the spot's height
  maxRise: 0.14, // blocks a tick up or down
  gravity: 0, // the entity has none
  trim: 0.004,
  maxTrim: 0.03,
  reach: 1.4, // blocks: close enough to the spot to pick another
  depth: 0.5,
  lookAhead: 3, // blocks ahead checked for a wall
  spotTicks: 260, // a spot not reached by then is given up
  wanderRange: 14, // blocks: how far away a new spot may be
  tries: 24,
  margin: 3, // blocks of air each side of a spot it flies to (its wings)
  headroom: 2, // blocks of air over a spot (its height and a little)
  landMargin: 2, // blocks of floor or air each side of a spot it lands on
  // Its body as the game sees it (the entity's collision box): a grown one 1.6 wide and 1.8 tall, a chick 0.65 by 0.7.
  body: { half: 0.8, height: 1.8 },
  hatchlingBody: { half: 0.325, height: 0.7 },
};
// The dive (the stoop): faster, dropping steeply toward the low spot and easing out over the floor as it gets there,
// turning wide (it picks a spot ahead of it).
export const DIVE_FLIGHT = { ...GRIFFIN_FLIGHT, speed: 0.4, edgeSpeed: 0.15, turn: 3, sharpTurn: 8, depthGain: 0.16, maxRise: 0.34, reach: 1.8, spotTicks: 90 };

// How far ahead a dive's low spot must be for the drop (blocks ahead per block down): at the dive's speed and its
// steepest descent it gets all the way down before it is over the spot.
export const DIVE_SLOPE = 1.25;

/** At the top of the climb before a dive: over the spot and up within 1.5 blocks of its height. */
export function atDiveTop(pos, spot, g = GRIFFIN_FLIGHT) {
  return Math.hypot(spot.x - pos.x, spot.z - pos.z) < g.reach && spot.y - pos.y < 1.5;
}

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- the griffin measure ----------------

/** @returns {{ gold: number, spots: { x: number, y: number, z: number }[] }} */
export function newGriffinResult() {
  return { gold: 0, spots: [] };
}

/**
 * The griffin measure (exhibits/exhibits.js, for griffins living here, or an empty exhibit that might be a griffin's
 * hall), over the floor a measure found (cells: key "x,y,z" -> kind; the "land" ones): the blocks of gold or raw gold its
 * floor stands on or is beside (a block of the floor, or one set on it), each once; the first 8 kept (spots). `read(x,
 * y, z)`: a block's { id }, undefined unloaded. A generator, a slice of `opts.cellsPerYield` floor cells at a time. (What
 * stands on a hall's floor and so isn't floor under a low roof, gold among it, is the dragon measure's lowTops.)
 * @param {(x: number, y: number, z: number) => ({ id?: string } | undefined)} read
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newGriffinResult>} out
 */
export function* measureGriffin(read, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  const look = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (seen.has(k)) return;
    seen.add(k);
    if (!GOLD.has(read(x, y, z)?.id ?? "")) return;
    out.gold++;
    if (out.spots.length < 8) out.spots.push({ x, y, z });
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    look(x, y - 1, z);
    for (const [dx, dz] of DIRS) look(x + dx, y, z + dz);
  }
  return out;
}

// ---------------- what an exhibit needs ----------------
// A hoard (cause "hoard"). False caps comfort. Not measured yet: passes.
export function hasHoard(species, ex) {
  if (!species.hoard || !ex.griffin) return true;
  return ex.griffin.gold >= species.hoard.min;
}

// The Exhibit Clipboard's lines for griffins: the hoard, the chicks.
export function griffinLines(ex, residents, species) {
  const lines = [];
  const g = ex.griffin;
  if (!g) lines.push("§fGold hoard: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fGold hoard: ${g.gold >= species.hoard.min ? "§a" : "§c"}${g.gold}§7 block${g.gold === 1 ? "" : "s"} (${HOARD_HOW}, to guard)`);
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fChicks: §7${young}: they fly after a grown griffin and land beside it`);
  return lines;
}

// Care warnings for griffins: the hoard.
export function griffinWarnings(ex, residents, plural, species, T) {
  const out = [];
  if (ex.griffin && !hasHoard(species, ex)) out.push({ severity: 2, text: `${plural} guard gold: ${HOARD_HOW} (none now; comfort can't rise above ${T.hoardComfortCap} without one).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild a few fly over the Mythical Glade, alone or in pairs, perching on top of the giant trees and landing on the open grass. Wary: come within ${T.shyRange} blocks in Survival without sneaking and one screeches and takes off. Hold a Meat Ration: within ${T.baitRange} blocks one comes down and lands beside you`;
}

// ---------------- what it does on the ground ----------------
/**
 * What it does once it has landed: "sleep" at night; by day "guard" (lying over its gold; less often with none),
 * "eat" (at a feeder with meat in it), "screech" (a grown one only), "preen" or "stand". `o`: { day, gold, feeder,
 * young }. Weights T.weights.
 * @param {{ day: boolean, gold?: boolean, feeder?: boolean, young?: boolean }} o
 */
export function pickGroundAct(o, T, random = Math.random) {
  if (!o.day) return "sleep";
  const W = T.weights;
  const options = [
    ["guard", W.guard * (o.gold ? 1.5 : 0.5)],
    ["eat", o.feeder ? W.eat : 0],
    ["screech", o.young ? 0 : W.screech],
    ["preen", W.preen],
    ["stand", W.stand],
  ];
  let r = random() * options.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of options) {
    if (r < w) return what;
    r -= w;
  }
  return "stand";
}

// ---------------- the dive ----------------
// Where the hall's flight measure puts its air: the floor's height (the lowest floor cell) and the top of its air.
/** @param {number[][]} air @param {number[][]} land */
export function hallSpan(air, land) {
  let floor = Infinity, top = -Infinity;
  for (const c of land) floor = Math.min(floor, c[1]);
  for (const c of air) top = Math.max(top, c[1]);
  return { floor, top };
}

/**
 * A spot high in the hall to dive from: an air cell of `air` within 3 blocks of the top of the air and at least 8 over
 * the floor, with room for its wings, from 6 to the wander range from `pos`. The spot ({ x, y, z }) or undefined.
 * @param {number[][]} air
 */
export function pickDiveTop(air, pos, kindAt, span, g = GRIFFIN_FLIGHT, random = Math.random) {
  if (!air.length || span.top - span.floor < 10) return undefined;
  const high = air.filter(([, y]) => y >= span.top - 3 && y >= span.floor + 8 && y <= span.top - 1);
  for (let i = 0; i < g.tries && high.length; i++) {
    const [x, y, z] = high[Math.floor(random() * high.length)];
    const d = Math.hypot(x + 0.5 - pos.x, z + 0.5 - pos.z);
    if (d < 6 || d > g.wanderRange) continue;
    if (!roomFor(kindAt, x, y, z, g)) continue;
    return { x: x + 0.5, y: y + g.depth, z: z + 0.5 };
  }
  return undefined;
}

/**
 * Where a dive from `pos` (heading `yaw`, Minecraft's) goes: an air cell 2 or 3 blocks over the floor, from 9 (and at
 * least DIVE_SLOPE times the drop) to 22 blocks away and no more than 50 degrees off its heading (it stoops on what's ahead), with room
 * for its wings. The spot or undefined.
 * @param {number[][]} air
 */
export function pickDiveLow(air, pos, yaw, kindAt, span, g = GRIFFIN_FLIGHT, random = Math.random) {
  const low = air.filter(([, y]) => y === span.floor + 2 || y === span.floor + 3);
  for (let i = 0; i < g.tries * 2 && low.length; i++) {
    const [x, y, z] = low[Math.floor(random() * low.length)];
    const dx = x + 0.5 - pos.x, dz = z + 0.5 - pos.z;
    const d = Math.hypot(dx, dz);
    if (d < Math.max(9, (pos.y - y) * DIVE_SLOPE) || d > 22) continue; // (far enough to come all the way down)
    const want = (Math.atan2(-dx, dz) * 180) / Math.PI;
    if (Math.abs(((((want - yaw) % 360) + 540) % 360) - 180) > 50) continue;
    if (!roomFor(kindAt, x, y, z, g)) continue;
    return { x: x + 0.5, y: y + g.depth, z: z + 0.5 };
  }
  return undefined;
}

// Room to fly at the cell: open (air or floor) `margin` blocks each side and `headroom` blocks up (the dragon's rule).
function roomFor(kindAt, x, y, z, g) {
  if (!kindAt(x, y, z)) return false;
  for (const [dx, dz] of DIRS) if (!kindAt(x + dx * g.margin, y, z + dz * g.margin)) return false;
  for (let h = 1; h <= g.headroom; h++) if (!kindAt(x, y + h, z)) return false;
  return true;
}
