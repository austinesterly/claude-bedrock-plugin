// The abandoned park (0.1.176, module 13; spec section 3, "restore an abandoned wildlife park into a Three-Dimension
// Wildlife Sanctuary"; research/polish_plan.md): the starting site as a plan of blocks fitted to the ground that's
// there. Pure, so the tests run it in plain Node; starter/site.js reads the ground, builds the plan and records it.
//
// The spec's site: "damaged entrance, small caretaker cabin, workshop shell, storage area, one unfinished habitat, and
// a noticeboard. Integrate the site with natural terrain. Do not require a flat world or automatically clear a huge
// region." So:
// - an old Aluminum Fence 41 columns a side round the spot, standing on the ground column by column, broken in six
//   places (the tutorial's "Fence in your park" step is mending it);
// - the Park Entrance Gate in the middle of its south side, overgrown, with rubble and a "Closed" sign;
// - a yard inside the gate, level at the ground's middle height, holding the caretaker cabin (east), the workshop shell
//   (west), the park stores (behind the cabin) and the Noticeboard by the cabin;
// - an old gravel path from the gate north to an unfinished 11 x 11 pen, with gaps the player fills;
// - the pen ("Rabbit Meadow") on its own level, its west side missing four fences, and a broken viewing deck by it.
// Only the yard, the pen's ground and the path are levelled, each blended into the ground round it over two columns;
// everything else keeps its own ground and trees. North is -z, so the gate (south side) is at z = +HALF.

import { linkStates } from "../bench/zooPlan.js";

export const SITE = {
  half: 20, // the ring stands at +-20: 41 columns a side
  margin: 3, // columns read past the ring
  clear: 32, // blocks cleared above levelled ground (trees on it go; the game's big conifers reach about 31)
  blend: 2, // columns over which levelled ground meets the natural ground
  maxSpread: 9, // the most the ground under the yard or the pen may rise and fall (highest minus lowest)
  maxStep: 9, // the most the pen may sit above or below the yard (the path climbs it a block a step)
  maxWetPad: 0.1, // the share of the yard's or the pen's columns that may be water
  maxWetRing: 10, // ring columns that may stand in water (each gets a cobblestone footing)
};

// Where everything is, in columns from the spot (dx east, dz south).
const YARD = [
  { x0: -13, x1: 13, z0: 8, z1: 21 },
  { x0: -4, x1: 4, z0: 22, z1: 25 }, // the approach outside the gate
];
const PEN_PAD = { x0: -7, x1: 7, z0: -17, z1: -3 };
const PEN = { x0: -5, x1: 5, z0: -15, z1: -5 }; // its fence; the floor inside is 9 x 9
const PEN_GAP = { x: -5, z0: -12, z1: -9 }; // the four missing fences of its west side
const PATH = { x0: -1, x1: 1, z0: -4, z1: 19 }; // the old path (3 wide) from the gate to the pen
const PATH_GAPS = [16, 17, 18, 19, 9, 3, 4, -1]; // rows of it overgrown (the first four by the gate, so the walk from it doesn't start)
const DECK = { x0: 2, x1: 5, z0: -4, z1: -2 }; // the viewing deck, east of the path's end
const DECK_HOLES = [[3, -3], [5, -2]];
const CABIN = { x0: 6, x1: 12, z0: 13, z1: 19 };
const SHELL = { x0: -12, x1: -6, z0: 13, z1: 19 };
const STORES = { x0: 6, x1: 12, z0: 8, z1: 11 };
// The six broken stretches of the old fence (14 columns), none by the gate or a corner.
export const RING_GAPS = [
  { side: "north", from: -12, to: -10 },
  { side: "north", from: 7, to: 8 },
  { side: "east", from: -6, to: -4 },
  { side: "west", from: 2, to: 3 },
  { side: "west", from: -15, to: -14 },
  { side: "south", from: 10, to: 11 },
];

// What the stores hold: one set of materials for the tutorial's first steps (spec section 3: "craft a feeder, water
// trough, bedding, and keeper gate"; the tutorial's own steps in quests/steps.js): the Zoo Workshop (in the workshop's
// barrel), the 14 fence repairs (16 Aluminum Fence), an Exhibit Controller, a Habitat Marker, a Basic Feeder, a Small
// Carrier, Leafy Rations, a Viewing Point, the pen's four fences and the path's 24 gravel, with a little spare.
export const SUPPLIES = {
  workshop: [
    { item: "minecraft:copper_ingot", amount: 2 },
    { item: "minecraft:book", amount: 1 },
    { item: "minecraft:spruce_planks", amount: 8 },
  ],
  tools: [
    { item: "minecraft:copper_ingot", amount: 8 },
    { item: "minecraft:iron_nugget", amount: 6 },
    { item: "minecraft:redstone", amount: 2 },
    { item: "minecraft:book", amount: 1 },
    { item: "minecraft:paper", amount: 1 },
    { item: "minecraft:stick", amount: 4 },
    { item: "minecraft:string", amount: 2 },
    { item: "minecraft:iron_ingot", amount: 1 },
    { item: "minecraft:green_dye", amount: 1 },
  ],
  habitat: [
    { item: "minecraft:spruce_planks", amount: 16 },
    { item: "minecraft:oak_fence", amount: 6 },
    { item: "minecraft:oak_leaves", amount: 8 },
    { item: "minecraft:wheat", amount: 4 },
    { item: "minecraft:gravel", amount: 32 },
  ],
};

export const SIGNS = {
  entrance: "ZooCraft\nWildlife Park\n~ closed ~",
  workshop: "Old Workshop\nBuild a Zoo\nWorkshop here",
  stores: "Park Stores\nSupplies to\nget started",
  pen: "Rabbit Meadow\ncoming soon",
};

// Blocks the ground reading looks through (plants, trees, snow layers, the odd block a tree or a village leaves):
// the ground is the first block under them that isn't one of these. Matched on the id after "minecraft:" /
// "zoocraft:"; grass_block, snow and every stone and soil are ground.
const NOT_GROUND = /(leaves|_log$|_wood$|^log|_stem$|hyphae|sapling|_grass$|_moss$|fern$|flower|tulip|orchid|allium|bluet|daisy|poppy|dandelion|lily|rose|peony|lilac|sunflower|bush|berr|cane|bamboo|vine|snow_layer|cactus|mushroom|petals|litter|azalea|roots|lichen|carpet|nest|cocoa|pumpkin|melon|propagule|dripleaf|spore|seagrass|kelp|coral|pickle|web|torch|lantern|sign|fence|wall$|door|bed$|chest|barrel|rail|button|pressure|ladder|pot$|banner|hay_block|beehive|strands|^grass$|willow|whitewood|pitcher|torchflower|cornflower|wither_rose|eyeblossom|cactus_flower|firefly|bush$)/;

/** Whether a block id is ground for the reading (not a plant, tree part or loose block on top of it). */
export function isGround(typeId) {
  if (!typeId || typeId === "minecraft:air") return false;
  const name = typeId.slice(typeId.indexOf(":") + 1);
  if (name === "grass_block" || name === "snow" || name === "moss_block" || name === "mud") return true;
  return !NOT_GROUND.test(name);
}

// The ground's own top kept where the site levels it (sand stays sand, podzol stays podzol), else grass.
const KEEP_TOP = new Set(["minecraft:grass_block", "minecraft:sand", "minecraft:red_sand", "minecraft:podzol", "minecraft:mycelium", "minecraft:coarse_dirt", "minecraft:dirt", "minecraft:snow", "minecraft:moss_block"]);
const GRASSY = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:podzol", "minecraft:coarse_dirt", "minecraft:moss_block"]);
// Blocks that fall when there's air under them: the plan puts a block that holds under each one it sets (a desert's
// sand can lie on sandstone over a hollow; set again, it would drop into it and take a sign on it down too).
const FALLS = new Set(["minecraft:sand", "minecraft:red_sand", "minecraft:gravel", "minecraft:suspicious_sand", "minecraft:suspicious_gravel"]);
const fillUnder = (top) => (top === "minecraft:sand" ? "minecraft:sandstone" : top === "minecraft:red_sand" ? "minecraft:red_sandstone" : top === "minecraft:snow" ? "minecraft:dirt" : "minecraft:dirt");

const inRect = (r, x, z) => x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1;
const inYard = (x, z) => YARD.some((r) => inRect(r, x, z));
const inPath = (x, z) => x >= PATH.x0 && x <= PATH.x1 && z > PEN_PAD.z1 && z < YARD[0].z0; // the part between the two levels

/** A small fixed number from a column (0..1), so the ruins look the same every time they're built. */
export function hash2(x, z) {
  let h = (x * 374761393 + z * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function median(list) {
  const s = [...list].sort((a, b) => a - b);
  return s.length ? s[Math.floor((s.length - 1) / 2)] : undefined;
}

/** Every column of the old fence's ring (dx, dz): [{ x, z, side, along }], with whether it's a gap or the gate's. */
export function ringColumns() {
  const H = SITE.half;
  const out = [];
  const seen = new Set();
  const add = (x, z, side, along) => {
    const k = `${x},${z}`;
    if (seen.has(k)) return;
    seen.add(k);
    const gap = RING_GAPS.some((g) => g.side === side && along >= g.from && along <= g.to);
    const gate = side === "south" && Math.abs(x) <= 2;
    out.push({ x, z, side, along, gap, gate });
  };
  for (let x = -H; x <= H; x++) add(x, -H, "north", x);
  for (let z = -H; z <= H; z++) add(H, z, "east", z);
  for (let x = H; x >= -H; x--) add(x, H, "south", x);
  for (let z = H; z >= -H; z--) add(-H, z, "west", z);
  return out;
}

/**
 * Read area: every column the plan looks at, as offsets from the spot.
 * @returns {{x0: number, x1: number, z0: number, z1: number}}
 */
export function readBox() {
  const r = SITE.half + SITE.margin;
  return { x0: -r, x1: r, z0: -r, z1: r + 5 }; // the approach and the spawn spot lie past the south side
}

/**
 * Whether the ground suits the old park, and the levels it would be built at.
 * @param {(dx: number, dz: number) => ({y: number, liquid?: string, top?: string} | undefined)} ground the ground
 *   under each column (y: the top ground block; liquid: "water" or "lava" over it; top: the ground block's id)
 * @returns {{ok: boolean, reason?: string, yard?: number, pen?: number}}
 */
export function siteLevels(ground) {
  const cols = (test, box) => {
    const out = [];
    for (let x = box.x0; x <= box.x1; x++) for (let z = box.z0; z <= box.z1; z++) if (test(x, z)) out.push(ground(x, z));
    return out;
  };
  const yard = [...cols(() => true, YARD[0]), ...cols(() => true, YARD[1])];
  const pen = cols(() => true, PEN_PAD);
  if ([...yard, ...pen].some((g) => !g)) return { ok: false, reason: "Part of the ground isn't loaded yet. Stand in the middle of the spot and try again." };
  if ([...yard, ...pen].some((g) => g.liquid === "lava")) return { ok: false, reason: "There's lava where the old park's buildings would go. Find drier ground." };
  const wet = (list) => list.filter((g) => g.liquid).length / list.length;
  if (wet(yard) > SITE.maxWetPad || wet(pen) > SITE.maxWetPad) return { ok: false, reason: "There's too much water where the old park's buildings would go. Find drier ground, away from rivers and lakes." };
  const ring = ringColumns().map((c) => ground(c.x, c.z));
  if (ring.some((g) => !g)) return { ok: false, reason: "Part of the ground isn't loaded yet. Stand in the middle of the spot and try again." };
  if (ring.filter((g) => g.liquid).length > SITE.maxWetRing) return { ok: false, reason: "Too much of the old fence would stand in water. Find drier ground." };
  if (ring.some((g) => g.liquid === "lava")) return { ok: false, reason: "The old fence would cross lava. Find another spot." };
  const spread = (list) => Math.max(...list.map((g) => g.y)) - Math.min(...list.map((g) => g.y));
  if (spread(yard) > SITE.maxSpread || spread(pen) > SITE.maxSpread) return { ok: false, reason: `The ground is too steep here (the old park's buildings need ground that rises and falls less than ${SITE.maxSpread + 1} blocks). Find flatter ground.` };
  const yardY = median(yard.map((g) => g.y));
  const penY = median(pen.map((g) => g.y));
  if (Math.abs(yardY - penY) > SITE.maxStep) return { ok: false, reason: "The ground climbs too much between the gate and the pen. Find flatter ground." };
  return { ok: true, yard: yardY, pen: penY };
}

/**
 * The old park round the spot `center` ({x, z}), fitted to `ground` (as siteLevels). Returns { ok: false, reason } if
 * the ground won't take it, else the plan: ops in build order ({op: "fill", from, to, block, states} | {op: "set",
 * pos, block, states, items?, text?} | {op: "place", pos, block, states}: "place" runs the block's own onPlace),
 * the spots it remembers (spot: the Park Deed's; board, gate, spawn, plaza, rabbits) and its box.
 */
export function planSite(center, ground) {
  const lv = siteLevels(ground);
  if (!lv.ok) return { ok: false, reason: lv.reason };
  const Y = lv.yard;
  const P = lv.pen;
  const cx = Math.floor(center.x);
  const cz = Math.floor(center.z);
  const W = (x, y, z) => ({ x: cx + x, y, z: cz + z });
  const ops = [];
  const fill = (x0, y0, z0, x1, y1, z1, block, states) => {
    if (y1 < y0) return;
    ops.push({ op: "fill", from: W(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), to: W(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), block, states });
  };
  const set = (x, y, z, block, states, extra = {}) => ops.push({ op: "set", pos: W(x, y, z), block, ...(states ? { states } : {}), ...extra });
  const place = (x, y, z, block, states) => ops.push({ op: "place", pos: W(x, y, z), block, ...(states ? { states } : {}) });

  // --- the ground: the level each column ends at (undefined: as it is) ---
  // The path between the yard and the pen climbs evenly from the pen's level to the yard's.
  const pathLevel = (z) => {
    const t = (z - PEN_PAD.z1) / (YARD[0].z0 - PEN_PAD.z1);
    return Math.round(P + (Y - P) * t);
  };
  const levelled = (x, z) => {
    if (inYard(x, z)) return Y;
    if (inRect(PEN_PAD, x, z)) return P;
    if (inPath(x, z)) return pathLevel(z);
    return undefined;
  };
  // Near levelled ground, the ground leans toward it over SITE.blend columns (only where it's more than a block off).
  const target = (x, z) => {
    const own = levelled(x, z);
    if (own !== undefined) return { y: own, pad: true };
    const g = ground(x, z);
    if (!g) return undefined;
    let best;
    for (let dx = -SITE.blend; dx <= SITE.blend; dx++) {
      for (let dz = -SITE.blend; dz <= SITE.blend; dz++) {
        const l = levelled(x + dx, z + dz);
        if (l === undefined) continue;
        const dist = Math.max(Math.abs(dx), Math.abs(dz));
        if (!best || dist < best.dist) best = { dist, l };
      }
    }
    if (!best || Math.abs(g.y - best.l) <= 1) return undefined;
    const share = (SITE.blend + 1 - best.dist) / (SITE.blend + 1);
    return { y: Math.round(g.y + (best.l - g.y) * share), pad: false };
  };
  const box = readBox();
  const finalY = new Map(); // each column's ground once built
  const finalTop = new Map(); // and its top block
  for (let x = box.x0; x <= box.x1; x++) {
    for (let z = box.z0; z <= box.z1; z++) {
      const g = ground(x, z);
      if (!g) continue;
      const t = target(x, z);
      if (!t) {
        finalY.set(`${x},${z}`, g.y);
        finalTop.set(`${x},${z}`, g.liquid ? "minecraft:water" : g.top);
        continue;
      }
      const top = g.liquid ? "minecraft:grass_block" : KEEP_TOP.has(g.top) ? g.top : "minecraft:grass_block";
      const under = fillUnder(top);
      const surface = g.liquid ? g.surface ?? g.y : g.y; // water (a pad may hold a little) is filled to the level
      if (t.y > g.y) fill(x, g.y + 1, z, x, t.y - 1, z, under);
      if (FALLS.has(top) && t.y - 1 <= g.y) set(x, t.y - 1, z, under);
      set(x, t.y, z, top);
      // Clear above: the whole height over levelled ground (its trees go), the old ground's height over blending.
      const clearTo = t.pad ? t.y + SITE.clear : Math.max(surface, g.y) + 3;
      fill(x, t.y + 1, z, x, clearTo, z, "minecraft:air");
      finalY.set(`${x},${z}`, t.y);
      finalTop.set(`${x},${z}`, top);
    }
  }
  const gy = (x, z) => finalY.get(`${x},${z}`) ?? ground(x, z)?.y ?? Y;
  // Grass and flowers only stay on soil (on sand they'd break off at the first block update).
  const soil = (x, z) => GRASSY.has(finalTop.get(`${x},${z}`));

  // --- the yard: a worn plaza inside the gate ---
  for (let x = -4; x <= 4; x++) {
    for (let z = 14; z <= 25; z++) {
      if (z === SITE.half && Math.abs(x) <= 2) continue; // under the gate
      const h = hash2(x, z);
      const onPath = x >= PATH.x0 && x <= PATH.x1 && z <= PATH.z1 && !PATH_GAPS.includes(z); // the gravel goes there
      if (onPath) continue;
      if (h < 0.35) set(x, Y, z, "minecraft:coarse_dirt");
      else if (h < 0.45) set(x, Y + 1, z, "minecraft:moss_carpet");
      else if (h < 0.55 && z < SITE.half && soil(x, z)) set(x, Y + 1, z, "minecraft:short_grass");
    }
  }

  // --- the old path, gate to pen, with its gaps ---
  for (let z = PATH.z0; z <= PATH.z1; z++) {
    if (PATH_GAPS.includes(z)) continue;
    const y = z >= YARD[0].z0 ? Y : z <= PEN_PAD.z1 ? P : pathLevel(z);
    for (let x = PATH.x0; x <= PATH.x1; x++) {
      set(x, y - 1, z, fillUnder(finalTop.get(`${x},${z}`))); // gravel falls too
      set(x, y, z, "minecraft:gravel");
    }
  }
  // The viewing deck east of the path's end (a Viewing Point goes on it), two planks gone.
  for (let x = DECK.x0; x <= DECK.x1; x++) for (let z = DECK.z0; z <= DECK.z1; z++) if (!DECK_HOLES.some(([hx, hz]) => hx === x && hz === z)) set(x, P, z, "minecraft:spruce_planks");

  // --- the caretaker cabin (east of the plaza): spruce, a doorway with no door, one broken window ---
  {
    const { x0, x1, z0, z1 } = CABIN;
    fill(x0, Y, z0, x1, Y, z1, "minecraft:spruce_planks");
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        const edge = x === x0 || x === x1 || z === z0 || z === z1;
        if (!edge) continue;
        const corner = (x === x0 || x === x1) && (z === z0 || z === z1);
        for (let y = Y + 1; y <= Y + 3; y++) set(x, y, z, corner ? "minecraft:spruce_log" : "minecraft:spruce_planks", corner ? { pillar_axis: "y" } : undefined);
      }
    }
    set(x0, Y + 1, 16, "minecraft:air"); // the doorway faces the plaza
    set(x0, Y + 2, 16, "minecraft:air");
    for (const [x, z] of [[9, z0], [x1, 15], [x1, 17]]) set(x, Y + 2, z, "minecraft:glass_pane");
    set(9, Y + 2, z1, "minecraft:air"); // the broken one
    fill(x0 - 1, Y + 4, z0 - 1, x1 + 1, Y + 4, z1 + 1, "minecraft:spruce_planks");
    fill(x0, Y + 5, z0 + 1, x1, Y + 5, z1 - 1, "minecraft:spruce_slab", { "minecraft:vertical_half": "bottom" });
    set(11, Y + 1, 14, "minecraft:bookshelf");
    set(11, Y + 2, 14, "minecraft:bookshelf");
    set(11, Y + 1, 18, "minecraft:lantern", { hanging: false });
    set(8, Y + 1, 18, "minecraft:red_wool"); // the caretaker's old bunk
    set(9, Y + 1, 18, "minecraft:red_wool");
    set(7, Y + 3, 14, "minecraft:web");
    set(10, Y + 3, 18, "minecraft:web");
  }
  // The Noticeboard by the cabin's doorway, facing the plaza.
  const board = { x: 5, y: Y + 1, z: 17 };
  set(board.x, board.y, board.z, "zoocraft:noticeboard", { "minecraft:cardinal_direction": "west" });

  // --- the workshop shell (west of the plaza): stone brick walls fallen to different heights, half a roof ---
  {
    const { x0, x1, z0, z1 } = SHELL;
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) set(x, Y, z, hash2(x, z) < 0.5 ? "minecraft:stone_bricks" : "minecraft:cobblestone");
    const stone = (x, y, z) => {
      const h = hash2(x * 7 + y, z * 3 - y);
      return h < 0.5 ? "minecraft:stone_bricks" : h < 0.75 ? "minecraft:mossy_stone_bricks" : "minecraft:cracked_stone_bricks";
    };
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        const edge = x === x0 || x === x1 || z === z0 || z === z1;
        if (!edge) continue;
        if (x === x1 && z >= 15 && z <= 17) continue; // the way in, from the plaza
        const height = 1 + Math.floor(hash2(x + 31, z - 17) * 4); // 1..4 blocks of wall left
        for (let y = Y + 1; y <= Y + height; y++) set(x, y, z, stone(x, y, z));
      }
    }
    fill(x0, Y + 5, z0, x1, Y + 5, z0 + 2, "minecraft:stone_brick_slab", { "minecraft:vertical_half": "bottom" });
    set(-11, Y + 1, 18, "minecraft:crafting_table");
    set(-11, Y + 1, 14, "minecraft:barrel", { facing_direction: 1, open_bit: false }, { items: SUPPLIES.workshop });
    set(-11, Y + 4, 14, "minecraft:web");
    set(-8, Y + 1, 18, "minecraft:spruce_standing_sign", { ground_sign_direction: 12 }, { text: SIGNS.workshop }); // facing the way in
  }

  // --- the park stores (behind the cabin): a lean-to with chests, barrels and hay ---
  {
    const { x0, x1, z0, z1 } = STORES;
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) for (let y = Y + 1; y <= Y + 3; y++) set(x, y, z, "minecraft:spruce_fence");
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (hash2(x + 5, z + 9) > 0.15) set(x, Y + 4, z, "minecraft:spruce_slab", { "minecraft:vertical_half": "bottom" });
    set(8, Y + 1, 9, "minecraft:chest", { "minecraft:cardinal_direction": "west" }, { items: SUPPLIES.tools });
    set(8, Y + 1, 10, "minecraft:chest", { "minecraft:cardinal_direction": "west" }, { items: SUPPLIES.habitat });
    set(11, Y + 1, 10, "minecraft:barrel", { facing_direction: 1, open_bit: false });
    set(11, Y + 2, 10, "minecraft:barrel", { facing_direction: 1, open_bit: false });
    set(10, Y + 1, 9, "minecraft:hay_block", { pillar_axis: "y" });
    set(10, Y + 1, 10, "minecraft:hay_block", { pillar_axis: "y" });
    set(10, Y + 2, 9, "minecraft:hay_block", { pillar_axis: "x" });
    set(5, Y + 1, 10, "minecraft:spruce_standing_sign", { ground_sign_direction: 4 }, { text: SIGNS.stores });
  }

  // --- the unfinished habitat: an oak-fenced pen, its west side four fences short ---
  {
    const { x0, x1, z0, z1 } = PEN;
    // A meadow: grass inside the pen whatever the ground round it (sand, snow, podzol).
    fill(x0 + 1, P, z0 + 1, x1 - 1, P, z1 - 1, "minecraft:grass_block");
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        const edge = x === x0 || x === x1 || z === z0 || z === z1;
        if (!edge) {
          const h = hash2(x * 3, z * 5);
          if (h < 0.18) set(x, P + 1, z, "minecraft:short_grass");
          else if (h < 0.22) set(x, P + 1, z, h < 0.2 ? "minecraft:dandelion" : "minecraft:poppy");
          continue;
        }
        if (x === PEN_GAP.x && z >= PEN_GAP.z0 && z <= PEN_GAP.z1) continue;
        set(x, P + 1, z, "minecraft:oak_fence");
      }
    }
    for (const [x, z] of [[3, -13], [2, -13], [3, -12]]) set(x, P + 1, z, "minecraft:azalea_leaves", { persistent_bit: true });
    set(-3, P + 1, -3, "minecraft:spruce_standing_sign", { ground_sign_direction: 0 }, { text: SIGNS.pen });
  }

  // --- the old fence ring, on the ground column by column, with its gaps ---
  const ring = ringColumns();
  const standing = new Set(ring.filter((c) => !c.gap).map((c) => `${c.x},${c.z}`));
  const has = (x, z) => standing.has(`${x},${z}`);
  for (const c of ring) {
    if (c.gate) continue;
    const g = ground(c.x, c.z);
    let y = gy(c.x, c.z);
    if (g?.liquid && !levelled(c.x, c.z) && finalY.get(`${c.x},${c.z}`) === g.y) {
      // In water: a cobblestone footing up to the surface.
      const top = g.surface ?? g.y;
      fill(c.x, g.y + 1, c.z, c.x, top, c.z, "minecraft:mossy_cobblestone");
      y = top;
    }
    if (c.gap) {
      // Grass grown up in the gap, where the ground grows grass.
      const h = hash2(c.x, c.z);
      if (soil(c.x, c.z) && h < 0.8) set(c.x, y + 1, c.z, h < 0.5 ? "minecraft:short_grass" : "minecraft:fern");
      continue;
    }
    // A tree trunk in the way goes (its leaves stay up, as the game's own trees do when a trunk is cut).
    fill(c.x, y + 2, c.z, c.x, y + 6, c.z, "minecraft:air");
    place(c.x, y + 1, c.z, "zoocraft:aluminum_fence", (() => {
      const l = linkStates(has, c.x, c.z);
      return { "zoocraft:n": l["zoocraft:n"], "zoocraft:e": l["zoocraft:e"], "zoocraft:s": l["zoocraft:s"], "zoocraft:w": l["zoocraft:w"] };
    })());
  }
  // A fallen log by one gap, as if a tree came down on the fence.
  {
    const g = RING_GAPS[0];
    for (let x = g.from - 1; x <= g.to + 1; x++) set(x, gy(x, -SITE.half + 1) + 1, -SITE.half + 1, "minecraft:oak_log", { pillar_axis: "x" });
  }

  // --- the damaged entrance ---
  const gate = { x: 0, y: Y + 1, z: SITE.half };
  fill(-2, Y + 1, SITE.half, 2, Y + 5, SITE.half, "minecraft:air");
  place(gate.x, gate.y, gate.z, "zoocraft:park_entrance_gate", { "minecraft:cardinal_direction": "north" });
  set(-2, Y + 1, SITE.half - 1, "minecraft:web");
  set(2, Y + 2, SITE.half - 1, "minecraft:web");
  for (const [x, z, block] of [[-4, 21, "minecraft:mossy_cobblestone"], [-3, 22, "minecraft:mossy_cobblestone"], [-4, 22, "minecraft:cobblestone_wall"], [3, 21, "minecraft:cracked_stone_bricks"], [4, 21, "minecraft:mossy_stone_bricks"], [4, 22, "minecraft:mossy_cobblestone_wall"]]) set(x, Y + 1, z, block);
  set(-4, Y + 2, 21, "minecraft:mossy_cobblestone_wall");
  set(3, Y + 1, 23, "minecraft:spruce_standing_sign", { ground_sign_direction: 0 }, { text: SIGNS.entrance });

  // --- where things are ---
  const rabbits = [[-22, -6], [-23, -3], [-22, -1]].filter(([x, z]) => ground(x, z) && !ground(x, z).liquid).map(([x, z]) => W(x, gy(x, z) + 1, z));
  return {
    ok: true,
    ops,
    levels: { yard: Y, pen: P },
    spot: W(0, pathLevel(0) + 1, 0), // the Park Deed's spot: the middle of the ring, on the path
    board: W(board.x, board.y, board.z),
    gate: W(gate.x, gate.y, gate.z),
    plaza: W(0, Y + 1, 15),
    spawn: W(0, Y + 1, 24), // outside the gate, looking north at it
    rabbits,
    gaps: RING_GAPS.length, // the breaks in the old fence
    gapColumns: RING_GAPS.reduce((n, g) => n + g.to - g.from + 1, 0),
    bbox: { min: W(box.x0, 0, box.z0), max: W(box.x1, 0, box.z1) },
  };
}

/** Whether (x, z) lies inside an old park's ring box (its own fence or anything it holds). */
export function insideSite(site, x, z) {
  const H = SITE.half;
  return Math.abs(x - site.center.x) <= H && Math.abs(z - site.center.z) <= H;
}
