// The residents' street for /zoocraft:testsetup (0.1.227, Austin: "Can you make a zoocraft command that sets everything
// up for me to test on a superflat world"), pure: where every block goes, as the zoo plan's operations (bench/parkPlan.js:
// fill and set, a chest's items with its set), laid on the flat ground south of the test zoo's Park Entrance Gate.
// - A gravel street 3 wide runs south from the gate, with a house either side of it every 11 blocks: one each for the 10
//   residents (STREET_HOMES), its door on the street, a path from the door to the street and a sign by it saying who
//   lives there. Each house is 9 x 9 outside in its own wood, walls 3 high under a flat roof: 7 x 7 of room inside with a
//   bed, a door, windows, lanterns, bookshelves, a crafting table, a barrel, a flower pot and a carpet (a grand home by
//   residents/homeRules.js homeComfort), and what its resident would love (their homeLikes: music, a kitchen, a
//   fireplace). The floors are stripped oak, not a path block (data/blocks.js PATH_PATTERNS), so the street's path stops
//   at each door. Each Resident Mailbox goes in last, inside by the door (bench/testSetup.js).
// - Where the street ends a path runs across to three work sites (residents/work.js), each with its Work Anchor and a
//   chest beside it, inside a shut gate on the path: Paola's woodlot to the west (oak fence round grass: oak, birch and
//   spruce trees and saplings in a square, four dark oak saplings), Dave's mine in the middle (stone walls 3 high
//   with ores for every skill in its walls and floor) and Ron's field to the east (oak fence round farmland watered by
//   two channels: rows of ripe and growing wheat, carrots, potatoes and beetroot, two bare rows, seeds in the chest).
//   0.1.244: and Terra's research site further east (oak fence round grass, three composters, plant waste in the chest).
//   0.1.268: and Jack's fishing spot furthest west (oak fence round grass and a pond a block deep, an empty chest).
// - Lanterns on fence posts along the street.
// planStreet(entrance, G): `entrance` the zoo plan's (the gate's threshold, in the ring's south side), G the ground's y.
// Returns { ops, homes, sites, signs, trees, spots, box, view, facing }: `trees` the woodlot's grown ones, `spots` every
// spot a sapling was put or a tree grew from ({ pos, sapling }). Every op is inside `box`, south of the ring.

import { residentById } from "../data/residents.js";

const GRAVEL = "minecraft:gravel";
const AIR = "minecraft:air";
const GLASS = "minecraft:glass";
const FLOOR = "minecraft:stripped_oak_wood";
const DOOR = "minecraft:wooden_door";
const BED = "minecraft:bed";
const LANTERN = "minecraft:lantern";
const SIGN = "minecraft:spruce_standing_sign";
const FENCE = "minecraft:oak_fence";
const GATE = "minecraft:fence_gate";
const STONE = "minecraft:stone"; // not a path block either: the mine's walls don't join the street's path
const GRASS = "minecraft:grass_block";
const CHEST = "minecraft:chest";
export const STREET_ANCHOR = "zoocraft:work_anchor";
export const STREET_MAILBOX = "zoocraft:resident_mailbox";

// The layout, in blocks south of the gate's threshold (z) and either side of the street's middle (x).
export const STREET = {
  first: 3, // the first houses' north walls, south of the ring's fence
  slot: 11, // a house (9) and the gap to the next (2)
  front: 4, // a house's front wall this far either side of the street's middle (the street is 3 wide)
  end: 124, // the street's last row, and the path across to the work sites
  sites: 126, // the work sites' north sides (their gates)
  depth: 19, // the woodlot's and the field's size each way, fence to fence (the mine's 13)
};

// Who lives in which house (west or east of the street, the i-th from the gate), its walls, posts and roof, and what
// they'd love in it (their homeLikes; books are in every house). The workers live nearest their work: Paola west by the
// woodlot, Ron east by the field, Dave by the mine.
export const STREET_HOMES = [
  { res: "teddy", side: "west", i: 0, planks: "oak_planks", log: "oak_log" },
  { res: "austin", side: "east", i: 0, planks: "birch_planks", log: "birch_log" },
  { res: "amanda", side: "west", i: 1, planks: "spruce_planks", log: "spruce_log" },
  { res: "carrot", side: "east", i: 1, planks: "cherry_planks", log: "cherry_log" },
  { res: "sheila", side: "west", i: 2, planks: "jungle_planks", log: "jungle_log", loves: "furnace" },
  { res: "zach", side: "east", i: 2, planks: "acacia_planks", log: "acacia_log", loves: "jukebox" },
  { res: "jared", side: "west", i: 3, planks: "mangrove_planks", log: "mangrove_log", loves: "jukebox" },
  { res: "dave", side: "east", i: 3, planks: "dark_oak_planks", log: "dark_oak_log", roof: "spruce_planks", loves: "campfire" },
  { res: "paola", side: "west", i: 4, planks: "oak_planks", log: "spruce_log" },
  { res: "ron", side: "east", i: 4, planks: "birch_planks", log: "dark_oak_log", loves: "campfire" },
  // 0.1.243: Austin's residents 11 to 14
  { res: "terra", side: "west", i: 5, planks: "bamboo_planks", log: "oak_log" },
  { res: "sophia", side: "east", i: 5, planks: "cherry_planks", log: "spruce_log" },
  { res: "jaylen", side: "west", i: 6, planks: "crimson_planks", log: "dark_oak_log" },
  { res: "ailing_bot", side: "east", i: 6, planks: "spruce_planks", log: "oak_log", loves: "jukebox", also: "furnace" },
  // 0.1.248: Dr. Pollo
  { res: "dr_pollo", side: "west", i: 7, planks: "jungle_planks", log: "spruce_log", loves: "bookshelf" },
  // 0.1.258: batch 3
  { res: "clian", side: "east", i: 7, planks: "birch_planks", log: "birch_log", loves: "barrel" },
  { res: "carrie", side: "west", i: 8, planks: "spruce_planks", log: "dark_oak_log", loves: "campfire" },
  { res: "desilva", side: "east", i: 8, planks: "crimson_planks", log: "dark_oak_log", loves: "crafting_table" },
  { res: "aloof", side: "west", i: 9, planks: "acacia_planks", log: "birch_log", loves: "jukebox" },
  { res: "guido", side: "east", i: 9, planks: "oak_planks", log: "dark_oak_log", loves: "furnace" },
  // 0.1.267
  { res: "jack", side: "west", i: 10, planks: "spruce_planks", log: "oak_log", loves: "bookshelf" },
];

// The work sites: whose, which kind (residents/workRules.js WORK_KINDS), where the gate is (x from the street's middle).
export const STREET_SITES = [
  { worker: "paola", kind: "woodlot", gateX: -21 },
  { worker: "dave", kind: "mine", gateX: 0 },
  { worker: "ron", kind: "field", gateX: 21 },
  { worker: "terra", kind: "research", gateX: 40 }, // 0.1.244
  { worker: "jack", kind: "fishing", gateX: -40 }, // 0.1.268
];

// A sign's text: the resident's name and job, or the work site's name.
const titled = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function homeSign(resId) {
  const r = residentById(resId);
  return r ? (r.occupation ? `${r.name}\n${titled(r.occupation)}` : r.name) : resId; // 0.1.243: some have no job
}
const SITE_WORDS = { woodlot: "woodlot", mine: "mine", field: "field", research: "research site", fishing: "fishing spot" };
export function siteSign(site) {
  return `${residentById(site.worker)?.name ?? site.worker}'s\n${SITE_WORDS[site.kind]}`;
}

function builder(ops) {
  const fill = (a, b, block, states = undefined) => {
    ops.push({ op: "fill", from: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), z: Math.min(a.z, b.z) }, to: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), z: Math.max(a.z, b.z) }, block, ...(states ? { states } : {}) });
  };
  const set = (pos, block, states = undefined, extra = {}) => ops.push({ op: "set", pos, block, ...(states ? { states } : {}), ...extra });
  return { fill, set };
}

// One house: local u along the street (0..8, north to south), v away from it (0 the front wall, 8 the back), y up.
function house(ops, out, ex, ez, G, h) {
  const { fill, set } = builder(ops);
  const s = h.side === "west" ? -1 : 1;
  const z0 = ez + STREET.first + STREET.slot * h.i;
  const at = (u, y, v) => ({ x: ex + s * (STREET.front + v), y: G + y, z: z0 + u });
  const box = (u0, y0, v0, u1, y1, v1, block, states = undefined) => fill(at(u0, y0, v0), at(u1, y1, v1), block, states);
  const inward = s < 0 ? "west" : "east"; // the way in through the door
  const planks = `minecraft:${h.planks}`;
  box(0, 0, 0, 8, 0, 8, FLOOR);
  box(0, 1, 0, 8, 3, 8, planks);
  box(1, 1, 1, 7, 3, 7, AIR);
  for (const [u, v] of [[0, 0], [8, 0], [0, 8], [8, 8]]) box(u, 1, v, u, 3, v, `minecraft:${h.log}`);
  box(0, 4, 0, 8, 4, 8, `minecraft:${h.roof ?? "dark_oak_planks"}`);
  for (const [u, v] of [[2, 0], [6, 0], [0, 4], [8, 4], [4, 8]]) set(at(u, 2, v), GLASS);
  // The door, in the middle of the front wall, as wooden doors stand when a player walks in and puts one down.
  const door = { "minecraft:cardinal_direction": inward, door_hinge_bit: false, open_bit: false };
  set(at(4, 1, 0), DOOR, { ...door, upper_block_bit: false });
  set(at(4, 2, 0), DOOR, { ...door, upper_block_bit: true });
  // The bed against the back wall, its head there (direction: 0 south, 1 west, 2 north, 3 east, foot to head).
  const dir = s < 0 ? 1 : 3;
  set(at(6, 1, 6), BED, { direction: dir, head_piece_bit: false });
  set(at(6, 1, 7), BED, { direction: dir, head_piece_bit: true });
  // Furnishings (four kinds: books, a workbench, storage, plants; the carpet a fifth), and the resident's love.
  set(at(1, 1, 7), "minecraft:bookshelf");
  set(at(2, 1, 7), "minecraft:bookshelf");
  set(at(3, 1, 7), "minecraft:crafting_table");
  set(at(7, 1, 7), "minecraft:barrel");
  set(at(7, 1, 6), "minecraft:flower_pot");
  box(3, 1, 3, 5, 1, 5, "minecraft:red_carpet");
  if (h.loves) set(at(1, 1, 4), `minecraft:${h.loves}`, h.loves === "campfire" ? { extinguished: false } : undefined);
  if (h.also) set(at(1, 1, 2), `minecraft:${h.also}`); // 0.1.243: a second love (Ailing Bot bakes too)
  // Five lanterns from the roof: light for every 12 floor tiles (the full two points of light).
  for (const [u, v] of [[2, 2], [6, 2], [2, 6], [6, 4], [4, 6]]) set(at(u, 3, v), LANTERN, { hanging: true });
  // The path from the step out of the door to the street, and the sign beside it, facing the street.
  box(4, 0, -2, 4, 0, -1, GRAVEL);
  const sign = at(5, 1, -2);
  set(sign, SIGN, { ground_sign_direction: s < 0 ? 12 : 4 });
  out.signs.push({ pos: sign, text: homeSign(h.res) });
  out.homes.push({ res: h.res, side: h.side, i: h.i, mailbox: at(3, 1, 1), mailboxStates: { "minecraft:cardinal_direction": s < 0 ? "east" : "west" }, door: at(4, 1, 0), outside: at(4, 1, -1), bed: { head: at(6, 1, 7), foot: at(6, 1, 6) }, box: { min: { x: Math.min(at(0, 0, 0).x, at(0, 0, 8).x), y: G, z: z0 }, max: { x: Math.max(at(0, 0, 0).x, at(0, 0, 8).x), y: G + 4, z: z0 + 8 } } });
}

// A fenced plot (the woodlot, the field): oak fence round x0..x1, z0..z1, its gate in the north side at gx.
function fenced(fill, set, x0, x1, z0, z1, G, gx) {
  fill({ x: x0, y: G + 1, z: z0 }, { x: x1, y: G + 1, z: z0 }, FENCE);
  fill({ x: x0, y: G + 1, z: z1 }, { x: x1, y: G + 1, z: z1 }, FENCE);
  fill({ x: x0, y: G + 1, z: z0 }, { x: x0, y: G + 1, z: z1 }, FENCE);
  fill({ x: x1, y: G + 1, z: z0 }, { x: x1, y: G + 1, z: z1 }, FENCE);
  set({ x: gx, y: G + 1, z: z0 }, GATE); // shut, spanning the north side (a gate's default facing)
}

// The woodlot's saplings: [x from the gate, z from the north fence, kind, grown], and the dark oak's four (their
// north-west one). A tree that grows over the fence is one the tree chopper leaves (residents/workRules.js treeAt
// "edge"), so each stands as far in as its tree may reach (SAPLING_REACH, blocks from its sapling): birch and spruce grow
// straight up, a dark oak's trunk leans up to 2 and branches 1 past that, and an oak may grow into a big one with
// branches as far as the woodlot lets a log be from its trunk (balance.js residents.work.woodlot.branchReach): the one
// oak is in the middle. Those `grown` are trees already (treeBlocks; bench/testSetup.js tells the woodlot they grew from
// its saplings), so Paola has trees to cut on her first morning; the rest are saplings to grow.
/** @type {[number, number, string, boolean][]} */
export const SAPLINGS = [
  [-5, 5, "spruce", true], [0, 5, "birch", true], [5, 5, "spruce", true],
  [0, 10, "oak", true], [5, 10, "birch", true],
  [-5, 15, "birch", true], [0, 15, "spruce", false], [5, 15, "spruce", false],
];

// A grown tree, the shape the game grows a small one in from its sapling, plainly: its trunk, then its leaves in layers
// [y over the sapling's spot, layer]: "wide" 5 x 5 without its corners, "square" 3 x 3, "plus" a cross, "top" one leaf.
const LEAF_LAYERS = { top: [0, false], plus: [1, true], square: [1, false], wide: [2, true] }; // [reach, corners left out]
/** @type {Record<string, { trunk: number, leaves: [number, string][] }>} */
const TREE_SHAPES = {
  oak: { trunk: 5, leaves: [[2, "wide"], [3, "wide"], [4, "square"], [5, "plus"]] },
  birch: { trunk: 6, leaves: [[3, "wide"], [4, "wide"], [5, "square"], [6, "plus"]] },
  spruce: { trunk: 7, leaves: [[2, "wide"], [3, "plus"], [4, "wide"], [5, "plus"], [6, "plus"], [7, "top"]] },
};

/**
 * The blocks of a `kind` tree (oak, birch, spruce) grown from a sapling at `base`: [{ pos, block, states }], its logs
 * upright, its leaves ones that grew (persistent_bit false: they fall once it's cut, as a grown tree's do).
 */
export function treeBlocks(kind, base) {
  const shape = TREE_SHAPES[kind];
  const out = [];
  for (let y = 0; y < shape.trunk; y++) out.push({ pos: { x: base.x, y: base.y + y, z: base.z }, block: `minecraft:${kind}_log`, states: { pillar_axis: "y" } });
  for (const [y, layer] of shape.leaves) {
    const [r, cut] = LEAF_LAYERS[layer];
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (cut && Math.abs(dx) === r && Math.abs(dz) === r) continue;
        if (!dx && !dz && y < shape.trunk) continue; // the trunk
        out.push({ pos: { x: base.x + dx, y: base.y + y, z: base.z + dz }, block: `minecraft:${kind}_leaves`, states: { persistent_bit: false, update_bit: false } });
      }
    }
  }
  return out;
}
export const DARK_OAK = [-5, 10];
// The research site (0.1.244): half its width, its depth, its composters [x from the gate, z from the north fence] and
// the plant waste in its chest.
export const RESEARCH = {
  half: 5,
  depth: 11,
  composters: [[-3, 4], [0, 7], [3, 5]],
  /** @type {[string, number][]} */
  waste: [["minecraft:wheat_seeds", 32], ["minecraft:oak_leaves", 16], ["minecraft:poppy", 8]],
};
export const SAPLING_REACH = { birch: 0, spruce: 0, dark_oak: 3, oak: 7 };
// Jack's fishing spot (0.1.268): half its width, its depth, its pond (x from the gate, z from the north fence, a block
// deep, let into the ground): 25 blocks of water with grass all round it to cast from.
export const FISHING = { half: 6, depth: 13, pond: { x0: -2, x1: 2, z0: 5, z1: 9 } };

// The mine's ores: [x from the gate, z from the north wall, y above the floor (0 the floor itself), ore]. In the walls
// (x ±6, z 12; and the north wall, z 0) and the floor, each beside a floor block: coal, copper and iron for an
// Apprentice, gold, redstone and lapis for a Skilled miner, diamonds and an emerald for an Expert.
/** @type {[number, number, number, string][]} */
export const MINE_ORES = [
  [-6, 2, 1, "coal_ore"], [-6, 4, 2, "iron_ore"], [-6, 6, 1, "copper_ore"], [-6, 8, 2, "coal_ore"], [-6, 10, 1, "iron_ore"],
  [6, 2, 2, "coal_ore"], [6, 4, 1, "copper_ore"], [6, 6, 2, "iron_ore"], [6, 8, 1, "coal_ore"], [6, 10, 2, "copper_ore"],
  [-4, 12, 1, "coal_ore"], [-2, 12, 2, "copper_ore"], [0, 12, 1, "iron_ore"], [2, 12, 2, "coal_ore"], [4, 12, 1, "copper_ore"],
  [-3, 4, 0, "iron_ore"], [3, 4, 0, "coal_ore"], [-3, 8, 0, "copper_ore"], [3, 8, 0, "coal_ore"], [0, 6, 0, "iron_ore"],
  [-4, 0, 2, "coal_ore"], [-3, 0, 1, "iron_ore"],
  [-6, 11, 1, "gold_ore"], [6, 11, 1, "redstone_ore"], [-5, 12, 2, "lapis_ore"], [5, 12, 2, "gold_ore"], [-6, 1, 2, "redstone_ore"], [6, 1, 2, "lapis_ore"],
  [-1, 12, 1, "diamond_ore"], [6, 5, 1, "diamond_ore"], [-6, 7, 2, "emerald_ore"],
];

/**
 * The street south of the zoo's gate.
 * @param {{ x: number, z: number }} entrance
 * @param {number} G
 */
export function planStreet(entrance, G) {
  const ex = entrance.x;
  const ez = entrance.z;
  const ops = [];
  const out = { homes: [], sites: [], signs: [], trees: [], spots: [] };
  const { fill, set } = builder(ops);
  // The street, and the path across its end to the three gates.
  fill({ x: ex - 1, y: G, z: ez + 1 }, { x: ex + 1, y: G, z: ez + STREET.end }, GRAVEL);
  for (const st of STREET_SITES) {
    fill({ x: ex, y: G, z: ez + STREET.end }, { x: ex + st.gateX, y: G, z: ez + STREET.end }, GRAVEL);
    set({ x: ex + st.gateX, y: G, z: ez + STREET.sites - 1 }, GRAVEL);
  }
  // Lantern posts either side of the street, between the houses' paths.
  for (let k = 0; k <= 11; k++) {
    const z = ez + STREET.first - 1 + STREET.slot * k;
    for (const x of [ex - 2, ex + 2]) {
      set({ x, y: G + 1, z }, FENCE);
      set({ x, y: G + 2, z }, LANTERN, { hanging: false });
    }
  }
  for (const h of STREET_HOMES) house(ops, out, ex, ez, G, h);
  const z0 = ez + STREET.sites;
  const site = (st, anchor, chest, items) => {
    set(anchor, STREET_ANCHOR);
    set(chest, CHEST, undefined, { items });
    const sign = { x: ex + st.gateX + 2, y: G + 1, z: z0 - 1 };
    set(sign, SIGN, { ground_sign_direction: 8 });
    out.signs.push({ pos: sign, text: siteSign(st) });
    out.sites.push({ worker: st.worker, kind: st.kind, anchor, chest, gate: { x: ex + st.gateX, y: G + 1, z: z0 }, outside: { x: ex + st.gateX, y: G + 1, z: z0 - 1 } });
  };
  // Paola's woodlot: grass inside the fence, the trees and saplings 4 or more apart and each tree's reach inside the
  // fence.
  {
    const st = STREET_SITES[0];
    const gx = ex + st.gateX;
    const x0 = gx - 9, x1 = gx + 9, z1 = z0 + STREET.depth - 1;
    fill({ x: x0 + 1, y: G, z: z0 + 1 }, { x: x1 - 1, y: G, z: z1 - 1 }, GRASS);
    fenced(fill, set, x0, x1, z0, z1, G, gx);
    for (const [dx, dz, kind, grown] of SAPLINGS) {
      const pos = { x: gx + dx, y: G + 1, z: z0 + dz };
      const sapling = `minecraft:${kind}_sapling`;
      if (!grown) set(pos, sapling);
      else {
        for (const b of treeBlocks(kind, pos)) set(b.pos, b.block, b.states);
        out.trees.push({ pos, sapling });
      }
      out.spots.push({ pos, sapling });
    }
    fill({ x: gx + DARK_OAK[0], y: G + 1, z: z0 + DARK_OAK[1] }, { x: gx + DARK_OAK[0] + 1, y: G + 1, z: z0 + DARK_OAK[1] + 1 }, "minecraft:dark_oak_sapling");
    for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) out.spots.push({ pos: { x: gx + DARK_OAK[0] + dx, y: G + 1, z: z0 + DARK_OAK[1] + dz }, sapling: "minecraft:dark_oak_sapling" });
    site(st, { x: gx + 2, y: G + 1, z: z0 + 2 }, { x: gx + 3, y: G + 1, z: z0 + 2 }, [["minecraft:oak_sapling", 8], ["minecraft:birch_sapling", 8], ["minecraft:spruce_sapling", 8], ["minecraft:dark_oak_sapling", 8]]);
  }
  // Dave's mine: a stone box with its floor, walls 3 high, open to the sky, the gate in the north wall with room over
  // it, the ores, and a lantern on each corner of the walls for his night shifts.
  {
    const st = STREET_SITES[1];
    const gx = ex + st.gateX;
    const x0 = gx - 6, x1 = gx + 6, z1 = z0 + 12;
    fill({ x: x0, y: G, z: z0 }, { x: x1, y: G + 3, z: z1 }, STONE);
    fill({ x: x0 + 1, y: G + 1, z: z0 + 1 }, { x: x1 - 1, y: G + 3, z: z1 - 1 }, AIR);
    set({ x: gx, y: G + 1, z: z0 }, GATE);
    set({ x: gx, y: G + 2, z: z0 }, AIR);
    for (const [dx, dz, dy, ore] of MINE_ORES) set({ x: gx + dx, y: G + dy, z: z0 + dz }, `minecraft:${ore}`);
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) set({ x, y: G + 4, z }, LANTERN, { hanging: false }); // on the corners, off the floor
    site(st, { x: gx + 2, y: G + 1, z: z0 + 2 }, { x: gx + 3, y: G + 1, z: z0 + 2 }, []);
  }
  // Ron's field: grass by the gate and along the south fence, farmland between, two water channels so every farmland
  // block is within 4 of water, then the crops in rows (crops over the channels taken out again).
  {
    const st = STREET_SITES[2];
    const gx = ex + st.gateX;
    const x0 = gx - 9, x1 = gx + 9, z1 = z0 + STREET.depth - 1;
    fill({ x: x0 + 1, y: G, z: z0 + 1 }, { x: x1 - 1, y: G, z: z1 - 1 }, GRASS);
    fill({ x: x0 + 1, y: G, z: z0 + 4 }, { x: x1 - 1, y: G, z: z1 - 2 }, "minecraft:farmland", { moisturized_amount: 7 });
    /** @type {[number, string, number][]} */
    const rows = [
      [4, "wheat", 7], [5, "wheat", 7], [6, "carrots", 7], [7, "carrots", 7], [8, "potatoes", 7], [9, "potatoes", 7], [10, "beetroot", 7], [11, "beetroot", 7],
      [12, "wheat", 3], [13, "wheat", 3], [14, "carrots", 2],
    ];
    for (const [dz, crop, growth] of rows) fill({ x: x0 + 1, y: G + 1, z: z0 + dz }, { x: x1 - 1, y: G + 1, z: z0 + dz }, `minecraft:${crop}`, { growth });
    // The crops over the channels go first, so none is left standing on water for a moment and drops.
    for (const wx of [gx - 4, gx + 4]) {
      fill({ x: wx, y: G + 1, z: z0 + 4 }, { x: wx, y: G + 1, z: z1 - 2 }, AIR);
      fill({ x: wx, y: G, z: z0 + 4 }, { x: wx, y: G, z: z1 - 2 }, "minecraft:water");
    }
    fenced(fill, set, x0, x1, z0, z1, G, gx);
    site(st, { x: gx + 2, y: G + 1, z: z0 + 2 }, { x: gx + 3, y: G + 1, z: z0 + 2 }, [["minecraft:wheat_seeds", 16], ["minecraft:beetroot_seeds", 16], ["minecraft:carrot", 16], ["minecraft:potato", 16]]);
  }
  // Terra's research site (0.1.244): grass inside an oak fence, three composters to study at, each beside open floor,
  // and plant waste in the chest for her first bone meal.
  {
    const st = STREET_SITES[3];
    const gx = ex + st.gateX;
    const x0 = gx - RESEARCH.half, x1 = gx + RESEARCH.half, z1 = z0 + RESEARCH.depth - 1;
    fill({ x: x0 + 1, y: G, z: z0 + 1 }, { x: x1 - 1, y: G, z: z1 - 1 }, GRASS);
    fenced(fill, set, x0, x1, z0, z1, G, gx);
    for (const [dx, dz] of RESEARCH.composters) set({ x: gx + dx, y: G + 1, z: z0 + dz }, "minecraft:composter");
    site(st, { x: gx + 2, y: G + 1, z: z0 + 2 }, { x: gx + 3, y: G + 1, z: z0 + 2 }, RESEARCH.waste);
  }
  // Jack's fishing spot (0.1.268): grass inside an oak fence round a pond a block deep, the bank all round it to cast
  // from, and an empty chest for the catch.
  {
    const st = STREET_SITES[4];
    const gx = ex + st.gateX;
    const x0 = gx - FISHING.half, x1 = gx + FISHING.half, z1 = z0 + FISHING.depth - 1;
    const p = FISHING.pond;
    fill({ x: x0 + 1, y: G, z: z0 + 1 }, { x: x1 - 1, y: G, z: z1 - 1 }, GRASS);
    fill({ x: gx + p.x0, y: G, z: z0 + p.z0 }, { x: gx + p.x1, y: G, z: z0 + p.z1 }, "minecraft:water");
    fenced(fill, set, x0, x1, z0, z1, G, gx);
    site(st, { x: gx + 2, y: G + 1, z: z0 + 2 }, { x: gx + 3, y: G + 1, z: z0 + 2 }, []);
  }
  const box = { min: { x: ex - 48, z: ez + 1 }, max: { x: ex + 48, z: ez + STREET.sites + STREET.depth + 1 } };
  return { ops, ...out, box, view: { x: ex + 0.5, y: G + 1, z: ez + 2.5 }, facing: { x: ex + 0.5, y: G + 2, z: ez + 30 } };
}

/**
 * What /zoocraft:testsetup says once the street stands: `r` from bench/testSetup.js ({ moved: resident ids, problems:
 * lines, friends, sites: how many work, trees: the woodlot's ready to cut }), `names` resident id -> name.
 */
export function streetBuiltText(r, names) {
  const who = (ids) => ids.map((id) => names[id] ?? id).join(", ");
  const lines = [`§aResidents' street built south of the Park Entrance Gate: §f${r.moved.length} of ${STREET_HOMES.length} residents moved in (${who(r.moved)}), each in their own house with their name on a sign by the door.`];
  lines.push(`§fWork sites where the street ends: Jack's fishing spot (furthest west), Paola's woodlot (west), Dave's mine (middle), Ron's field (east) and Terra's research site (further east), ${r.sites} of ${STREET_SITES.length} with their worker working. Paola, Ron, Terra and Jack work mornings, Dave at night. ${r.trees ? `Paola has ${r.trees} trees ready to cut and saplings growing (bone meal grows them sooner)` : "Bone meal the woodlot's saplings to give Paola trees to cut"}; Ron's field has ripe crops; Terra's chest has plant waste to turn into bone meal; Jack fishes his spot's pond.`);
  lines.push(r.friends ? "§fYou start as a Friend of every resident (40 points): gifts, Follow Me and work gifts are open." : "§7Friendship starts at Stranger: chat with them and bring them things they like.");
  return [...lines, ...r.problems];
}
