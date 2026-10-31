// Dragons (0.1.150, the Mythical Glade: research/mythical_plan.md "0.1.150 Dragon"), pure: the dragon measure (lit
// campfires in or beside an exhibit's floor), what an exhibit needs, the day, what one does on the ground, where it
// flies and lands, and where its fire comes from. The game side is animals/dragon.js.
// A big four-legged dragon with great wings, about 7 blocks nose to tail with an 11-block span: it flies round its hall
// beating and gliding, lands to bask by a campfire with its wings spread, roars, breathes a stream of fire (particles
// only: it never lights or hurts anything), eats from the feeder and sleeps curled up at night. Every rule here is by the
// species' flags, never by name.

import { GLIDE } from "./glide.js";

// The dragon mobs, found by type (0.1.70: never by family alone).
export const DRAGON_TYPES = ["zoocraft:dragon", "zoocraft:wild_dragon"];
export const WILD_DRAGON = "zoocraft:wild_dragon";

// What a dragon is doing (its zoocraft:act entity property; zoocraft:gliding picks the glide over the beating while it
// flies): the client plays the matching animation and the Field Journal watches for it.
export const ACT = { fly: 0, stand: 1, bask: 2, roar: 3, fire: 4, eat: 5, sleep: 6, hover: 7 };
export const GROUND_ACTS = [ACT.stand, ACT.bask, ACT.roar, ACT.fire, ACT.eat, ACT.sleep];

// What warms it: a lit campfire or soul campfire in its floor or beside it.
export const CAMPFIRES = new Set(["minecraft:campfire", "minecraft:soul_campfire"]);
export const WARMTH_HOW = "a lit campfire or soul campfire on the floor";

// The fire (RP particles/dragon_fire.json): its colour by coat (minecraft:variant: 0 Emerald, 1 Ember, 2 Frost).
export const FIRE_PARTICLE = "zoocraft:dragon_fire";
export const FIRE_COLOURS = [
  { r: 0.45, g: 1.0, b: 0.35 },
  { r: 1.0, g: 0.48, b: 0.12 },
  { r: 0.55, g: 0.85, b: 1.0 },
];
// Where the stream comes from, as the client's fire animation holds the head (gen150/dragon150.py checks these against
// the model): in blocks ahead of and above the dragon's feet, the neck's base and the mouth; the snout's slope (degrees,
// minus is down); the stream's time in the 3.4 s animation (from the lunge till the jaw starts to shut); and the neck's
// sweep from side to side (degrees each way, degrees of its cycle a second).
export const FIRE = { neck: { ahead: 1.0, up: 1.56 }, mouth: { ahead: 3.08, up: 1.68 }, pitch: -14, on: 0.9, off: 2.9, length: 3.4, sweep: 16, sweepRate: 95 };

// The flight (animals/glide.js's maths with a dragon's numbers): a big flier, faster than a Void Ray and turning wider.
export const DRAGON_FLIGHT = {
  ...GLIDE,
  speed: 0.22, // blocks a tick flying (4.4 a second)
  edgeSpeed: 0.08, // slower when the air ahead runs out, so it turns before a wall
  turn: 3, // degrees a tick it turns toward its spot
  sharpTurn: 9, // degrees a tick when the air ahead runs out
  depthGain: 0.08, // how firmly it holds the spot's height
  maxRise: 0.12, // blocks a tick up or down
  gravity: 0, // the entity has none
  trim: 0.004,
  maxTrim: 0.03,
  reach: 1.6, // blocks: close enough to the spot to pick another
  depth: 0.5,
  lookAhead: 3.5, // blocks ahead checked for a wall
  spotTicks: 300, // a spot not reached by then is given up
  wanderRange: 14, // blocks: how far away a new spot may be
  tries: 24,
  margin: 4, // blocks of air each side of a spot it flies to (its wings)
  headroom: 3, // blocks of air over a spot (its height and a little)
  landMargin: 2, // blocks of floor or air each side of a spot it lands on
  // Its body as the game sees it (the entity's collision box): a grown one 2.4 wide and 2.2 tall, a hatchling 0.9 by 0.8.
  // Landing, its whole footprint needs room (the server bench, 0.1.150: a raised grass block under one side of it held it
  // a block up); flying, a push counts as moving it only when the whole box has room (animals/mover.js).
  body: { half: 1.2, height: 2.2 },
  hatchlingBody: { half: 0.45, height: 0.8 },
};

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- the dragon measure ----------------

/** @returns {{ campfires: number, spots: { x: number, y: number, z: number }[], lowTops: number }} */
export function newDragonResult() {
  return { campfires: 0, spots: [], lowTops: 0 };
}

// What a hall has standing on its floor for the dragons (a campfire, the feeder and its basket, a trough or a rack): the
// floor over one of these is under the roof by its height, but no dragon wants to stand on it (lowTops).
export const FLOOR_THINGS = new Set([...CAMPFIRES, "zoocraft:basic_feeder", "zoocraft:hanging_food_basket", "zoocraft:water_trough", "zoocraft:hay_rack"]);

// A lit campfire or soul campfire, from a reader's { id, states } (states: the block's, extinguished among them).
/** @param {{ id?: string, states?: Record<string, any> } | undefined} b */
export function litCampfire(b) {
  return Boolean(b && CAMPFIRES.has(b.id ?? "") && !b.states?.extinguished);
}

/**
 * The dragon measure (exhibits/exhibits.js, for dragons living here, or an empty exhibit that might be a dragon's hall),
 * over the floor a measure found (cells: key "x,y,z" -> kind; the "land" ones): the lit campfires its floor stands on or
 * is beside (a campfire is a block of the floor, or one set on it), each once; the first 8 kept (spots). With
 * `opts.minHeight` (a flight measure's cells), lowTops: the floor cells on top of a campfire, a feeder, its basket, a
 * trough or a rack (FLOOR_THINGS) with less than that much air over them (the measure counts them as floor under a low
 * roof; exhibits/exhibits.js takes them off ex.lowCells, as no dragon stands on them). `read(x, y, z)`: a block's
 * { id, states }, undefined unloaded. A generator, a slice of `opts.cellsPerYield` floor cells at a time.
 * @param {(x: number, y: number, z: number) => ({ id?: string, states?: Record<string, any> } | undefined)} read
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, minHeight?: number }} opts
 * @param {ReturnType<typeof newDragonResult>} out
 */
export function* measureDragon(read, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  const look = (x, y, z, b = undefined) => {
    const k = `${x},${y},${z}`;
    if (seen.has(k)) return;
    if (!litCampfire(b ?? read(x, y, z))) return;
    seen.add(k);
    out.campfires++;
    if (out.spots.length < 8) out.spots.push({ x, y, z });
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    const below = read(x, y - 1, z);
    look(x, y - 1, z, below);
    for (const [dx, dz] of DIRS) look(x + dx, y, z + dz);
    if (opts.minHeight && FLOOR_THINGS.has(below?.id ?? "")) {
      for (let h = 1; h < opts.minHeight; h++) {
        const above = cells.get(`${x},${y + h},${z}`);
        if (above !== "air" && above !== "perch") {
          out.lowTops++;
          break;
        }
      }
    }
  }
  return out;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// A lit campfire (cause "warmth"). False caps comfort. Not measured yet: passes.
export function hasWarmth(species, ex) {
  if (!species.warmth || !ex.dragon) return true;
  return ex.dragon.campfires >= species.warmth.min;
}

// The Exhibit Clipboard's lines for dragons: the campfire, the hatchlings.
export function dragonLines(ex, residents, species) {
  const lines = [];
  const d = ex.dragon;
  if (!d) lines.push("§fCampfire: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fCampfires: ${d.campfires >= species.warmth.min ? "§a" : "§c"}${d.campfires}§7 lit (${WARMTH_HOW}, to bask by)`);
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fHatchlings: §7${young}: they fly after a grown dragon and land beside it`);
  return lines;
}

// Care warnings for dragons: the campfire.
export function dragonWarnings(ex, residents, plural, species, T) {
  const out = [];
  if (ex.dragon && !hasWarmth(species, ex)) out.push({ severity: 2, text: `${plural} bask by a fire: ${WARMTH_HOW} (none lit now; comfort can't rise above ${T.warmthComfortCap} without one).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild a rare few fly over the Mythical Glade, high over the giant trees, now and then landing on the open grass to bask in the sun. Wary: come within ${T.shyRange} blocks in Survival without sneaking and one roars and takes off. Hold a Meat Ration: within ${T.baitRange} blocks one comes down and lands beside you`;
}

// ---------------- the day and what it does on the ground ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// Up by day (T.day), asleep at night.
export function isDay(timeOfDay, T) {
  return within(((timeOfDay % 24000) + 24000) % 24000, T.day);
}

/**
 * What it does once it has landed: "sleep" at night; by day "bask" (by the campfire when there is one), "eat" (at a
 * feeder with meat in it), "roar", "fire" (a grown one only) or "stand". `o`: { day, warm, feeder, young }. Weights
 * T.weights.
 * @param {{ day: boolean, warm?: boolean, feeder?: boolean, young?: boolean }} o
 */
export function pickGroundAct(o, T, random = Math.random) {
  if (!o.day) return "sleep";
  const W = T.weights;
  const options = [
    ["bask", W.bask * (o.warm ? 1.5 : 1)],
    ["eat", o.feeder ? W.eat : 0],
    ["roar", W.roar],
    ["fire", o.young ? 0 : W.fire],
    ["stand", W.stand],
  ];
  let r = random() * options.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of options) {
    if (r < w) return what;
    r -= w;
  }
  return "stand";
}

// ---------------- the fire ----------------
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const rad = (d) => (d * Math.PI) / 180;

// The neck's sweep (degrees; plus turns the head to the dragon's right) `t` seconds into the fire, as the client's
// animation has it.
export function sweepAt(t) {
  const on = clamp01((t - FIRE.on) / 0.2) * (1 - clamp01((t - FIRE.off) / 0.3));
  return Math.sin(rad(Math.max(0, t - FIRE.on) * FIRE.sweepRate)) * FIRE.sweep * on;
}

// Is the stream pouring `t` seconds in?
export function firing(t) {
  return t >= FIRE.on && t <= FIRE.off;
}

/**
 * Where the stream starts and which way it goes, `t` seconds into the fire, for a dragon at `pos` facing `yaw`
 * (Minecraft's: 0 faces +z, 90 faces -x), drawn at `scale`: the mouth swung round the neck's base by the sweep, and the
 * snout's slope. { origin, dir } (dir a unit vector).
 */
export function fireAt(pos, yaw, t, scale = 1) {
  const sw = sweepAt(t);
  const f = (a) => ({ x: -Math.sin(rad(a)), z: Math.cos(rad(a)) });
  const body = f(yaw);
  const head = f(yaw + sw);
  const reach = FIRE.mouth.ahead - FIRE.neck.ahead;
  const origin = {
    x: pos.x + (body.x * FIRE.neck.ahead + head.x * reach) * scale,
    y: pos.y + FIRE.mouth.up * scale,
    z: pos.z + (body.z * FIRE.neck.ahead + head.z * reach) * scale,
  };
  const c = Math.cos(rad(FIRE.pitch));
  return { origin, dir: { x: head.x * c, y: Math.sin(rad(FIRE.pitch)), z: head.z * c } };
}

// A spot close by and off to one side is inside the circle it turns in at full speed (about 4 blocks across each side):
// it slows and banks hard there, as at a wall, or it would circle round the spot.
export function tightTurn(pos, yaw, spot, g = DRAGON_FLIGHT) {
  const dx = spot.x - pos.x;
  const dz = spot.z - pos.z;
  const want = (Math.atan2(-dx, dz) * 180) / Math.PI;
  const off = Math.abs(((((want - yaw) % 360) + 540) % 360) - 180);
  const radius = g.speed / ((g.turn * Math.PI) / 180);
  return Math.hypot(dx, dz) < radius * 2.2 && off > 50;
}

// ---------------- where it flies and lands ----------------
// `kindAt(x, y, z)`: what the exhibit's flight measure found there ("air", "land", "perch"), undefined where it can't go.

// Room to fly at the cell: open (air or floor) `margin` blocks each side and `headroom` blocks up.
export function roomToFly(kindAt, x, y, z, g = DRAGON_FLIGHT) {
  if (!kindAt(x, y, z)) return false;
  for (const [dx, dz] of DIRS) if (!kindAt(x + dx * g.margin, y, z + dz * g.margin)) return false;
  for (let h = 1; h <= g.headroom; h++) if (!kindAt(x, y + h, z)) return false;
  return true;
}

// Room to land on the cell: floor there and in the 4 cells beside it (level ground, not the top of a feeder), its body's
// footprint (the blocks round the cell its box covers) open up its height, `landMargin` blocks each side open, the
// headroom over it.
export function roomToLand(kindAt, x, y, z, g = DRAGON_FLIGHT) {
  if (kindAt(x, y, z) !== "land") return false;
  for (const [dx, dz] of DIRS) if (kindAt(x + dx, y, z + dz) !== "land") return false;
  const r = Math.ceil(g.body.half - 0.5), up = Math.ceil(g.body.height) - 1;
  for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) for (let h = 0; h <= up; h++) if (!kindAt(x + dx, y + h, z + dz)) return false;
  for (const [dx, dz] of DIRS) if (!kindAt(x + dx * g.landMargin, y, z + dz * g.landMargin)) return false;
  for (let h = 1; h <= g.headroom; h++) if (!kindAt(x, y + h, z)) return false;
  return true;
}

/**
 * A spot to fly to from `pos`: a random cell of `list` ([x, y, z, kind]) within the wander range, not too close, with
 * room for its wings, at least 2 blocks over the floor. The spot ({ x, y, z }, a cell's middle), or undefined.
 * @param {number[][]} list
 */
export function pickAirSpot(list, pos, kindAt, g = DRAGON_FLIGHT, random = Math.random) {
  if (!list.length) return undefined;
  for (let i = 0; i < g.tries; i++) {
    const [x, y, z] = list[Math.floor(random() * list.length)];
    if (Math.abs(x + 0.5 - pos.x) > g.wanderRange || Math.abs(z + 0.5 - pos.z) > g.wanderRange) continue;
    if (Math.hypot(x + 0.5 - pos.x, z + 0.5 - pos.z) < 4) continue;
    if (kindAt(x, y - 1, z) === "land" || kindAt(x, y - 2, z) === "land" || kindAt(x, y, z) === "land") continue; // 2 blocks up at least
    if (!roomToFly(kindAt, x, y, z, g)) continue;
    return { x: x + 0.5, y: y + g.depth, z: z + 0.5 };
  }
  return undefined;
}

/**
 * A spot to land: a floor cell of `land` ([x, y, z]: the exhibit's floor cells) with room round it; beside `near` (a
 * campfire, a feeder: from 2 to `within` blocks of it) when given, one of those at random. The cell ({ x, y, z }) or
 * undefined.
 * @param {number[][]} land
 */
export function pickLandSpot(land, kindAt, near = undefined, within = 6, g = DRAGON_FLIGHT, random = Math.random) {
  if (!land.length) return undefined;
  if (near) {
    const options = land.filter(([x, , z]) => {
      const d = Math.hypot(x - near.x, z - near.z);
      return d >= 2 && d <= within;
    });
    for (let i = 0; i < g.tries && options.length; i++) {
      const k = Math.floor(random() * options.length);
      const [x, y, z] = options[k];
      if (roomToLand(kindAt, x, y, z, g)) return { x, y, z };
      options.splice(k, 1);
    }
    return undefined;
  }
  for (let i = 0; i < g.tries; i++) {
    const [x, y, z] = land[Math.floor(random() * land.length)];
    if (roomToLand(kindAt, x, y, z, g)) return { x, y, z };
  }
  return undefined;
}
