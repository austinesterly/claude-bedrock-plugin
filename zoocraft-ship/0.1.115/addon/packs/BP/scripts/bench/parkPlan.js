// The benchmark park (0.1.96, spec 21: "Profile all script loops with a full park"), pure: where every block of a
// full park goes, as a list of operations the builder (bench/benchmark.js) carries out a slice a tick. 20 exhibits
// with 100 animals of the 20 script-steered species, each built the way its test plan says a good exhibit is built
// (walls, floor, pools, roofs, dens, the double Keeper Gate, feeders, troughs, heaters, enrichment), Viewing Points
// on the paths, guest services, 5 Staff Rooms, the Park Entrance Gate and (bench 2, 0.1.101) an Aluminum Fence round it
// all with a gate in its south side, so the park is the fenced area as a new park's is. No world access: `planPark(origin, groundY)`
// returns { ops, exhibits, rooms, services, entrance, view, bbox }. The test zoo (0.1.104, /zoocraft:build) lays every
// species' exhibit out the same way inside an Aluminum Fence ring: planZoo(center, G, size).
//
// The layout: a central avenue (x -1..1) running north to south through the park, four rows of exhibits west and east
// of it with their glass fronts on a common line, a 3-wide path along each row's front, and behind each row a service
// strip (controllers, keeper corridors, the backs of the Holding Dens). South of the last row: the Staff Rooms and the
// entrance. Local exhibit coordinates: the floor is x 0..w-1, z 0..d-1 at y 0 (the ground block), the animals stand at
// y 1; the walls are at x -1 and w, z -1 (the back, north) and d (the front, south, facing the path).
//
// Ops: { op: "fill", from, to, block, states? } (a box of one block), { op: "set", pos, block, states? }, and
// { op: "place", pos, block, states?, stock? } for ZooCraft blocks that keep a record (the builder registers each one
// and fills it: stock { item?, units }), { op: "controller", pos, exhibit } for an exhibit's controller.

import { ringPlan, ringBox, linkStates } from "./zooPlan.js";

export const BENCH_VERSION = 2; // 2 (0.1.101): the Aluminum Fence round the park

const STONE = "minecraft:stone_bricks";
const GLASS = "minecraft:glass";
const TINTED = "minecraft:tinted_glass"; // see-through, keeps the daylight out (the dark houses)
const END_STONE = "minecraft:end_stone";
const END_BRICKS = "minecraft:end_bricks";
const AIR = "minecraft:air";
const WATER = "minecraft:water";
const LAVA = "minecraft:lava";
const PATH = "minecraft:gravel";
const LEAVES = "minecraft:oak_leaves";
const LEAF_STATES = { persistent_bit: true };
const SOUTH = { "minecraft:cardinal_direction": "south" };
const NORTH = { "minecraft:cardinal_direction": "north" };

const FEED = {
  basic: "zoocraft:basic_feeder",
  puzzle: "zoocraft:puzzle_feeder",
  rack: "zoocraft:hay_rack",
  insect: "zoocraft:insect_feeder",
  nectar: "zoocraft:nectar_feeder",
  mineral: "zoocraft:mineral_feeder",
  elevated: "zoocraft:elevated_feeder",
  thermal: "zoocraft:thermal_feeder",
};
const R = {
  meat: "zoocraft:meat_ration",
  grain: "zoocraft:grain_ration",
  leafy: "zoocraft:leafy_ration",
  fruit: "zoocraft:fruit_ration",
  pellets: "zoocraft:flamingo_pellets",
  fungal: "zoocraft:fungal_ration",
  ember: "zoocraft:ember_ration",
  insect: "zoocraft:insect_ration",
  nectar: "zoocraft:nectar_ration",
  mineral: "zoocraft:mineral_pellets",
  chorus: "zoocraft:chorus_browse",
};
// What the Staff Rooms are stocked with: every ration the park's animals eat.
export const STAFF_RATIONS = Object.values(R);
// The test zoo's animals (0.1.104) eat these too: fish (otters, penguins), Molten Plankton Feed (Lava Rays) and warped
// fungus (Striders), all rations a feeder and a Staff Room take.
const FISH = "zoocraft:fish_ration";
const PLANKTON = "zoocraft:molten_plankton";
const FUNGUS = "minecraft:warped_fungus";
export const ZOO_RATIONS = [...STAFF_RATIONS, FISH, PLANKTON, FUNGUS];

// One exhibit's builder: local coordinates in, world coordinates out.
function plot(ox, oz, G, w, d) {
  const ops = [];
  const W = (x, y, z) => ({ x: ox + x, y: G + y, z: oz + z });
  const p = {
    w,
    d,
    ops,
    at: W,
    fill(x0, y0, z0, x1, y1, z1, block, states) {
      ops.push({ op: "fill", from: W(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), to: W(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1)), block, states });
    },
    set(x, y, z, block, states) {
      ops.push({ op: "set", pos: W(x, y, z), block, states });
    },
    place(x, y, z, block, extra = {}) {
      ops.push({ op: "place", pos: W(x, y, z), block, ...extra });
    },
    // The floor (y 0) of the whole exhibit, or a part of it.
    floor(block, x0 = 0, z0 = 0, x1 = w - 1, z1 = d - 1) {
      p.fill(x0, 0, z0, x1, 0, z1, block);
    },
    // Walls h high all round (y 1..h) on the ground; the front (z d) in `front`.
    walls(h, block = STONE, front = GLASS) {
      p.fill(-1, 1, -1, w, h, -1, block);
      p.fill(-1, 1, 0, -1, h, d, block);
      p.fill(w, 1, 0, w, h, d, block);
      p.fill(0, 1, d, w - 1, h, d, front);
    },
    // A roof over the walls at height y.
    roof(y, block) {
      p.fill(-1, y, -1, w, y, d, block);
    },
    // A pool: water from the floor down (depth 1: the ground right under it; depth 2: deep).
    pool(x0, z0, x1, z1, depth) {
      p.fill(x0, 1 - depth, z0, x1, 0, z1, WATER);
    },
    // A feeder, filled.
    feeder(x, y, z, kind, item) {
      p.place(x, y, z, FEED[kind], { stock: { item, full: "feeder" } });
    },
    trough(x, z, y = 1) {
      p.place(x, y, z, "zoocraft:water_trough", { states: SOUTH, stock: { full: "trough" } });
    },
    heater(x, z, y = 1) {
      p.place(x, y, z, "zoocraft:thermal_regulator", { stock: { full: "heater" } });
    },
    basket(x, y, z, item) {
      p.place(x, y, z, "zoocraft:hanging_food_basket", { stock: { item, full: "basket" } });
    },
    fixture(x, y, z, block, states) {
      p.place(x, y, z, block, states ? { states } : {});
    },
    // A Climbing Frame: three blocks tall, each part placed.
    frame(x, z) {
      p.place(x, 1, z, "zoocraft:climbing_frame", { states: { "minecraft:multi_block_part": 0 } });
      p.set(x, 2, z, "zoocraft:climbing_frame", { "minecraft:multi_block_part": 1 });
      p.set(x, 3, z, "zoocraft:climbing_frame", { "minecraft:multi_block_part": 2 });
    },
    // Holding Dens in the back wall (z -1), each door facing into the exhibit (south), two blocks tall.
    dens(xs) {
      for (const x of xs) {
        p.set(x, 2, -1, AIR);
        p.place(x, 1, -1, "zoocraft:holding_den", { states: SOUTH });
      }
    },
    // The double Keeper Gate: the inner gate in the back wall at x, a passage 2 long walled and roofed, the outer gate
    // 3 blocks behind the inner one (BALANCE.predators.gates: 2 to 4 apart, in a row).
    keeperGates(x) {
      p.fill(x - 1, 1, -4, x - 1, 3, -2, STONE);
      p.fill(x + 1, 1, -4, x + 1, 3, -2, STONE);
      p.fill(x, 3, -4, x, 3, -2, STONE);
      p.fill(x, 1, -3, x, 2, -2, AIR);
      p.set(x, 2, -1, AIR);
      p.set(x, 2, -4, AIR);
      p.place(x, 1, -1, "zoocraft:keeper_gate", { states: SOUTH });
      p.place(x, 1, -4, "zoocraft:keeper_gate", { states: SOUTH });
    },
    // A lava pool (Lava Rays, Striders; 0.1.104): lava from the floor down, as pool() is water.
    lavaPool(x0, z0, x1, z1, depth) {
      p.fill(x0, 1 - depth, z0, x1, 0, z1, LAVA);
    },
    lavaTrough(x, z, y = 1) {
      p.place(x, y, z, "zoocraft:lava_trough", { states: SOUTH, stock: { full: "trough" } });
    },
    cooler(x, z, y = 1) {
      p.place(x, y, z, "zoocraft:cooling_unit", { stock: { full: "cooler" } });
    },
    anchor(x, z, y = 1) {
      p.place(x, y, z, "zoocraft:containment_anchor", { stock: { full: "anchor" } });
    },
    // An Elevated Browse Feeder (giraffes): two parts, the record on the lower one.
    elevated(x, z, item) {
      p.place(x, 1, z, FEED.elevated, { states: { "minecraft:multi_block_part": 0 }, stock: { item, full: "feeder" } });
      p.set(x, 2, z, FEED.elevated, { "minecraft:multi_block_part": 1 });
    },
    // A Thermal Feeder (Lava Rays): set into the bank level with the lava, so it's reached from the lava.
    thermal(x, z, item) {
      p.place(x, 0, z, FEED.thermal, { stock: { item, full: "feeder" } });
    },
    // A Nocturnal Lamp hung from the roof (the hedgehogs' house): a plain block, nothing to register.
    lamp(x, y, z, block = "zoocraft:red_night_lamp") {
      p.set(x, y, z, block, { "minecraft:block_face": "down" });
    },
  };
  return p;
}

// Every species' exhibit (spec section 5, each test plan's "good exhibit"): size, walls, what's inside, the animals.
// sexes: one letter each (m, f, h). Coats are picked by the builder (lions: coat 1 is a male's).
export const BLUEPRINTS = [
  {
    id: "lion",
    name: "Lions",
    species: "zoocraft:lion",
    w: 24,
    d: 24,
    sexes: "mffff",
    seed: [12, 5],
    controller: 7,
    corridor: 3,
    build(p) {
      p.walls(3);
      p.fill(8, 1, 10, 13, 1, 11, "minecraft:stone"); // a stone shelf to rest on (12 blocks of ledge, 2 a lion)
      p.fill(0, 5, 0, 7, 5, 7, STONE); // shade over a corner
      p.dens([10, 12, 14, 16, 18, 20]); // one each and a spare
      p.keeperGates(3);
      p.feeder(20, 1, 21, "basic", R.meat);
      p.basket(20, 2, 21, R.meat);
      p.feeder(22, 1, 21, "puzzle", R.meat);
      p.trough(22, 23);
      p.fixture(12, 1, 18, "zoocraft:scent_post");
    },
  },
  {
    id: "tiger",
    name: "Tigers",
    species: "zoocraft:tiger",
    w: 20,
    d: 20,
    sexes: "mf",
    seed: [9, 9],
    controller: 7,
    corridor: 3,
    build(p) {
      p.walls(3);
      p.pool(12, 12, 17, 17, 1); // the shallows round the edge
      p.pool(13, 13, 16, 16, 2); // 16 spots 2 deep
      p.fixture(11, 1, 14, "zoocraft:water_filter");
      p.fill(2, 1, 8, 6, 2, 8, "minecraft:mossy_cobblestone"); // rocks to lie up behind, out of sight
      p.fill(2, 1, 9, 2, 2, 12, "minecraft:mossy_cobblestone");
      p.fill(0, 5, 0, 6, 5, 6, STONE); // shade
      p.dens([10, 12]);
      p.keeperGates(3);
      p.feeder(16, 1, 2, "basic", R.meat);
      p.basket(16, 2, 2, R.meat);
      p.feeder(18, 1, 2, "puzzle", R.meat);
      p.fixture(10, 1, 6, "zoocraft:scent_post");
    },
  },
  {
    id: "crocodile",
    name: "Crocodiles",
    species: "zoocraft:crocodile",
    w: 18,
    d: 18,
    sexes: "mmff",
    seed: [12, 12],
    controller: 12,
    corridor: 15,
    build(p) {
      p.walls(3);
      p.pool(0, 0, 8, 17, 1);
      p.pool(0, 0, 7, 17, 2); // deep water to go under, a shallow edge along the bank
      p.fixture(3, -1, 12, "zoocraft:water_filter"); // on the bottom: keepers need a clear shore to see into the water
      p.floor("minecraft:sand", 11, 6, 13, 10); // sand 3 to 5 blocks from the water, to nest in
      p.fill(9, 3, 0, 13, 3, 6, STONE); // shade by the water
      p.dens([9, 10, 11, 12]);
      p.keeperGates(15); // the inner gate 7 blocks from the water
      p.feeder(16, 1, 16, "basic", R.meat);
      p.basket(16, 2, 16, R.meat);
    },
  },
  {
    id: "gorilla",
    name: "Gorillas",
    species: "zoocraft:gorilla",
    w: 21,
    d: 21,
    sexes: "mffff",
    seed: [10, 5],
    controller: 7,
    corridor: 3,
    build(p) {
      p.walls(5); // they pull themselves up 3.5 blocks
      p.frame(10, 11);
      p.dens([9, 11, 13, 15, 17]);
      p.keeperGates(3);
      p.feeder(18, 1, 18, "basic", R.leafy);
      p.basket(18, 2, 18, R.fruit);
      p.feeder(16, 1, 18, "puzzle", R.fruit);
      p.trough(20, 18);
    },
  },
  {
    id: "zebra",
    name: "Zebras",
    species: "zoocraft:zebra",
    w: 21,
    d: 21,
    sexes: "mfffff",
    seed: [10, 10],
    controller: 3,
    build(p) {
      p.walls(3); // a Hay Rack against a 2-high wall is a step over it
      p.place(8, 1, 0, FEED.rack, { states: SOUTH, stock: { item: R.grain, full: "feeder" } }); // stood on the floor: room for 4 each
      p.place(12, 1, 0, FEED.rack, { states: SOUTH, stock: { item: R.grain, full: "feeder" } });
      p.feeder(16, 1, 0, "puzzle", R.grain);
      p.basket(16, 2, 0, R.grain);
      p.trough(20, 20);
    },
  },
  {
    id: "flamingo",
    name: "Flamingos",
    species: "zoocraft:flamingo",
    w: 14,
    d: 14,
    sexes: "mmmmmfffff",
    seed: [10, 8],
    controller: 3,
    build(p) {
      p.walls(2);
      p.pool(0, 3, 7, 10, 1); // shallows to wade in
      p.fixture(3, 1, 11, "zoocraft:water_filter");
      p.floor("minecraft:mud", 8, 4, 8, 7); // mud at the water's edge to nest on
      p.feeder(12, 1, 1, "basic", R.pellets);
      p.basket(12, 2, 1, R.pellets);
    },
  },
  {
    id: "raccoon",
    name: "Raccoons",
    species: "zoocraft:raccoon",
    w: 10,
    d: 10,
    sexes: "mmff",
    seed: [4, 2],
    controller: 2,
    build(p) {
      p.walls(3, GLASS); // they can't grip glass
      p.frame(5, 5);
      p.pool(1, 7, 2, 8, 1); // water to wash their food in
      p.fixture(3, 1, 8, "zoocraft:water_filter");
      p.feeder(8, 1, 1, "puzzle", R.fruit);
      p.basket(8, 2, 1, R.fruit);
    },
  },
  {
    id: "red_panda",
    name: "Red Pandas",
    species: "zoocraft:red_panda",
    w: 10,
    d: 10,
    sexes: "mff",
    seed: [8, 1],
    controller: 2,
    build(p) {
      p.walls(7, GLASS);
      // Two oak trees whose leaves touch, back from the walls.
      p.fill(2, 4, 2, 4, 4, 4, LEAVES, LEAF_STATES);
      p.fill(5, 4, 5, 7, 4, 7, LEAVES, LEAF_STATES);
      p.fill(2, 5, 2, 7, 5, 7, LEAVES, LEAF_STATES);
      p.fill(3, 1, 3, 3, 4, 3, "minecraft:oak_log");
      p.fill(6, 1, 6, 6, 4, 6, "minecraft:oak_log");
      for (const z of [4, 6, 8]) p.fixture(8, 1, z, "zoocraft:nest_box", SOUTH); // one each, on the floor
      p.feeder(1, 1, 8, "basic", R.leafy);
      p.basket(1, 2, 8, R.leafy);
      p.trough(1, 6);
    },
  },
  {
    id: "owl",
    name: "Owls",
    species: "zoocraft:owl",
    w: 7,
    d: 7,
    sexes: "mmff",
    seed: [3, 3],
    controller: 2,
    build(p) {
      p.walls(4, GLASS);
      p.roof(5, GLASS);
      p.fixture(1, 1, 5, "zoocraft:perch", SOUTH); // a low perch
      p.fill(5, 1, 1, 5, 2, 1, "minecraft:oak_log");
      p.fixture(5, 3, 1, "zoocraft:perch", SOUTH); // a high one, on a post
      p.fixture(6, 1, 6, "zoocraft:nest_box", SOUTH);
      p.feeder(6, 1, 3, "basic", R.meat);
      p.basket(6, 2, 3, R.meat);
      p.trough(0, 0);
    },
  },
  {
    id: "crimson_grazer",
    name: "Crimson Grazers",
    species: "zoocraft:crimson_grazer",
    w: 20,
    d: 19,
    sexes: "mmfff",
    seed: [8, 8],
    controller: 4,
    build(p) {
      p.floor("minecraft:crimson_nylium");
      p.walls(3); // the Thermal Regulator in the corner would be a step over a 2-high wall
      p.fill(10, 1, 4, 10, 2, 4, "minecraft:crimson_stem"); // stems to rub on
      p.fill(4, 1, 12, 4, 2, 12, "minecraft:crimson_stem");
      p.fill(13, 5, 0, 19, 5, 5, STONE); // the herd's shelter
      p.heater(0, 0);
      p.feeder(18, 1, 17, "basic", R.fungal);
      p.basket(18, 2, 17, R.fungal);
      p.trough(16, 17);
    },
  },
  {
    id: "warped_gecko",
    name: "Warped Geckos",
    species: "zoocraft:warped_gecko",
    w: 6,
    d: 6,
    sexes: "mff",
    seed: [2, 2],
    controller: 2,
    build(p) {
      p.floor("minecraft:warped_nylium");
      p.walls(4, GLASS);
      p.roof(5, GLASS); // they climb glass
      // Two cracks at head height in the west wall, closed behind.
      for (const z of [2, 4]) {
        p.set(-1, 2, z, AIR);
        p.set(-2, 2, z, STONE);
      }
      p.fixture(5, 1, 5, "zoocraft:burrow_shelter", SOUTH);
      p.heater(0, 5);
      p.feeder(5, 1, 0, "insect", R.insect);
      p.basket(5, 2, 0, R.insect);
      p.trough(0, 0);
    },
  },
  {
    id: "cinder_boar",
    name: "Cinder Boars",
    species: "zoocraft:cinder_boar",
    w: 16,
    d: 16,
    sexes: "mffff",
    seed: [8, 5],
    controller: 4,
    build(p) {
      p.floor("minecraft:netherrack");
      p.walls(3); // stone: they break wood
      p.floor("zoocraft:warm_ash", 2, 2, 5, 3);
      p.floor("zoocraft:thermal_mud", 10, 10, 11, 11);
      p.set(12, 1, 10, "minecraft:basalt"); // a rock to rub on by the mud
      p.heater(0, 15);
      p.feeder(15, 1, 15, "basic", R.ember);
      p.basket(15, 2, 15, R.ember);
      p.trough(13, 15);
    },
  },
  {
    id: "soul_moth",
    name: "Soul Moths",
    species: "zoocraft:soul_moth",
    w: 6,
    d: 6,
    sexes: "mmmmffff",
    seed: [2, 3],
    controller: 2,
    build(p) {
      p.floor("minecraft:soul_soil");
      p.walls(4, STONE, TINTED);
      p.roof(5, STONE);
      p.set(3, 4, 3, "minecraft:soul_lantern", { hanging: true });
      p.set(0, 2, 2, "minecraft:soul_torch", { torch_facing_direction: "east" });
      p.set(3, 1, 1, "minecraft:soul_campfire");
      for (const [x, z] of [[1, 4], [2, 5], [4, 4]]) p.set(x, 1, z, "minecraft:crimson_roots");
      p.set(5, 1, 2, "minecraft:warped_roots");
      p.feeder(5, 1, 5, "nectar", R.nectar);
      p.basket(5, 2, 5, R.nectar);
      p.heater(0, 5);
      p.trough(5, 0);
    },
  },
  {
    id: "quartz_beetle",
    name: "Quartz Beetles",
    species: "zoocraft:quartz_beetle",
    w: 6,
    d: 6,
    sexes: "mmmfff",
    seed: [3, 4],
    controller: 2,
    build(p) {
      p.floor("minecraft:netherrack");
      p.walls(2, STONE, TINTED);
      p.roof(3, STONE); // the cave roof
      p.floor("zoocraft:mineral_substrate", 1, 1, 3, 2);
      p.set(0, 2, 4, "minecraft:torch", { torch_facing_direction: "east" });
      p.heater(0, 5);
      p.feeder(5, 1, 0, "basic", R.mineral);
      p.basket(5, 2, 0, R.mineral);
      p.trough(5, 2);
    },
  },
  {
    id: "end_hopper",
    name: "End Hoppers",
    species: "zoocraft:end_hopper",
    w: 10,
    d: 10,
    sexes: "mmmfff",
    seed: [5, 5],
    controller: 2,
    build(p) {
      p.floor(END_STONE);
      p.walls(5, GLASS);
      p.roof(6, GLASS); // they leap 3 blocks high
      p.fixture(2, 1, 2, "zoocraft:landing_pad");
      p.fixture(2, 1, 7, "zoocraft:landing_pad");
      p.fixture(7, 1, 2, "zoocraft:landing_pad");
      p.set(7, 1, 7, END_STONE);
      p.fixture(7, 2, 7, "zoocraft:landing_pad"); // a high one, 2 over the floor
      p.fixture(5, 1, 1, "zoocraft:landing_pad");
      p.fixture(5, 1, 8, "zoocraft:landing_pad");
      p.feeder(9, 1, 9, "basic", R.chorus);
      p.basket(9, 2, 9, R.chorus);
      p.trough(0, 9);
    },
  },
  {
    id: "shimmer_snail",
    name: "Shimmer Snails",
    species: "zoocraft:shimmer_snail",
    w: 6,
    d: 6,
    sexes: "hhhhhh",
    seed: [3, 4],
    controller: 2,
    margin: 1, // the crevice walls are 2 thick
    build(p) {
      p.floor(END_STONE);
      p.walls(3, GLASS); // the trough and feeder by the walls would be steps over 2-high ones
      // Crevice walls west and east: end stone bricks 2 thick, a block left out at the foot on the inside, 3 a side.
      p.fill(-2, 1, -1, -1, 3, 6, END_BRICKS);
      p.fill(6, 1, -1, 7, 3, 6, END_BRICKS);
      for (const z of [0, 2, 4]) {
        p.set(-1, 1, z, AIR);
        p.set(6, 1, z, AIR);
      }
      p.fill(0, 3, 0, 5, 3, 1, END_BRICKS); // shade over a third of the floor
      p.floor("zoocraft:mineral_substrate", 2, 2, 3, 3);
      p.feeder(5, 1, 5, "basic", R.mineral);
      p.basket(5, 2, 5, R.mineral);
      p.trough(0, 5);
    },
  },
  {
    id: "obsidian_crab",
    name: "Obsidian Crabs",
    species: "zoocraft:obsidian_crab",
    w: 7,
    d: 7,
    sexes: "mmff",
    seed: [3, 3],
    controller: 3,
    build(p) {
      p.floor(END_STONE);
      p.walls(2, GLASS);
      p.fill(-1, 1, -1, 7, 2, -1, "minecraft:obsidian"); // a rock wall along the back
      p.set(2, 1, 2, "minecraft:obsidian");
      p.set(5, 1, 2, "minecraft:obsidian");
      p.roof(3, END_BRICKS); // the cave roof
      p.floor("zoocraft:mineral_substrate", 1, 5, 4, 6);
      p.feeder(6, 1, 6, "mineral", R.mineral);
      p.basket(6, 2, 6, R.mineral);
      p.trough(0, 6);
    },
  },
  {
    id: "chorus_moth",
    name: "Chorus Moths",
    species: "zoocraft:chorus_moth",
    w: 7,
    d: 7,
    sexes: "mmmmffff",
    seed: [2, 2],
    controller: 3,
    build(p) {
      p.floor(END_STONE);
      p.walls(4, END_BRICKS, TINTED);
      p.roof(5, END_BRICKS);
      for (const [x, z] of [[1, 1], [5, 1], [1, 5], [5, 5]]) {
        p.set(x, 1, z, "minecraft:chorus_plant");
        p.set(x, 2, z, "minecraft:chorus_flower");
      }
      for (const [x, z] of [[3, 1], [1, 3], [5, 3], [3, 5]]) p.set(x, 1, z, "minecraft:chorus_flower");
      p.set(6, 1, 6, "zoocraft:purple_night_lamp");
      p.feeder(0, 1, 6, "nectar", R.nectar);
      p.basket(0, 2, 6, R.nectar);
      p.trough(6, 0);
    },
  },
  {
    id: "starback_tortoise",
    name: "Starback Tortoises",
    species: "zoocraft:starback_tortoise",
    w: 8,
    d: 8,
    sexes: "mmff",
    seed: [5, 3],
    controller: 5,
    build(p) {
      p.floor(END_STONE);
      p.walls(3, END_BRICKS, GLASS); // the chorus plants by the walls would be steps over 2-high ones
      p.fill(0, 3, 0, 3, 3, 2, END_BRICKS); // the lean-to: 12 blocks of floor under a low roof
      p.set(5, 0, 5, "zoocraft:warm_pad");
      p.set(6, 0, 5, "zoocraft:warm_pad");
      p.floor("zoocraft:mineral_substrate", 2, 4, 4, 4);
      for (const [x, z] of [[1, 6], [2, 7], [4, 7], [6, 7], [7, 5]]) p.set(x, 1, z, "minecraft:chorus_plant");
      for (const [x, z] of [[0, 7], [7, 3], [5, 2]]) p.set(x, 1, z, "minecraft:chorus_flower");
      p.feeder(7, 1, 0, "basic", R.chorus);
      p.basket(7, 2, 0, R.chorus);
      p.trough(0, 4);
    },
  },
  {
    id: "void_ray",
    name: "Void Rays",
    species: "zoocraft:void_ray",
    w: 24,
    d: 24,
    sexes: "mf",
    seed: [12, 12],
    controller: 3,
    build(p) {
      p.floor(END_STONE);
      p.walls(15, GLASS);
      p.roof(16, GLASS); // 15 blocks of flight room
      for (const [x, y, z] of [[6, 8, 6], [17, 10, 17], [6, 12, 17]]) p.fixture(x, y, z, "zoocraft:void_perch", SOUTH);
      p.feeder(22, 1, 22, "basic", R.chorus);
      p.basket(22, 2, 22, R.chorus);
      p.trough(22, 20);
    },
  },
  // The 14 other species (0.1.104, the test zoo: "Make an exhibit for all of our current species in it"), each from
  // its test plan's good exhibit and its habitat profile (data/profiles.js) and care rules (data/species.js).
  {
    id: "zoo_rabbit",
    name: "Rabbits",
    species: "zoocraft:zoo_rabbit",
    w: 10,
    d: 10,
    sexes: "mmff",
    seed: [5, 5],
    controller: 2,
    build(p) {
      p.walls(2);
      p.feeder(8, 1, 1, "basic", R.leafy);
      p.basket(8, 2, 1, R.leafy);
      p.trough(1, 8);
    },
  },
  {
    id: "otter",
    name: "Otters",
    species: "zoocraft:otter",
    w: 12,
    d: 12,
    sexes: "mmf",
    seed: [8, 8],
    controller: 3,
    build(p) {
      p.walls(3); // the Water Filter against the back wall would be a step over a 2-high wall
      p.pool(0, 0, 5, 11, 1); // half the floor water (they need 35%), a dry bank the other half
      p.pool(1, 2, 4, 7, 2); // 24 spots 2 deep to dive in (they need 4)
      p.fixture(6, 1, 0, "zoocraft:water_filter"); // at the pool's edge
      p.feeder(10, 1, 1, "puzzle", FISH); // they work a puzzle for their fish
      p.basket(10, 2, 1, FISH);
      p.feeder(10, 1, 10, "basic", FISH);
    },
  },
  {
    id: "capybara",
    name: "Capybaras",
    species: "zoocraft:capybara",
    w: 14,
    d: 14,
    sexes: "mmff",
    seed: [7, 4],
    controller: 3,
    build(p) {
      p.walls(2);
      p.pool(0, 9, 7, 13, 1); // a pool over a fifth of the floor to wade and swim in; the rest grazing bank
      p.pool(1, 11, 2, 12, 2); // 4 spots 2 deep (they need 2)
      p.fixture(8, 1, 12, "zoocraft:water_filter");
      p.feeder(12, 1, 1, "basic", R.leafy);
      p.basket(12, 2, 1, R.leafy);
      p.trough(1, 1);
    },
  },
  {
    id: "deer",
    name: "Deer",
    species: "zoocraft:deer",
    w: 15,
    d: 15,
    sexes: "mfff",
    seed: [7, 9],
    controller: 3,
    build(p) {
      p.walls(3); // a Hay Rack against a 2-high wall is a step over it
      // Quiet cover over a corner (they want 10% of the ground under leaves or a roof): an oak canopy on two trunks.
      p.fill(0, 5, 0, 6, 5, 6, LEAVES, LEAF_STATES);
      p.fill(2, 1, 2, 2, 4, 2, "minecraft:oak_log");
      p.fill(5, 1, 5, 5, 4, 5, "minecraft:oak_log");
      p.place(9, 1, 0, FEED.rack, { states: SOUTH, stock: { item: R.leafy, full: "feeder" } }); // stood on the floor
      p.feeder(13, 1, 13, "basic", R.leafy);
      p.basket(13, 2, 13, R.leafy);
      p.trough(13, 11);
    },
  },
  {
    id: "penguin",
    name: "Penguins",
    species: "zoocraft:penguin",
    w: 13,
    d: 12,
    sexes: "mmmfff",
    seed: [9, 6],
    controller: 3,
    build(p) {
      p.walls(3); // the Cooling Unit in the corner and the filter by the front would be steps over 2-high walls
      p.floor("minecraft:snow", 6, 0, 12, 11); // the colony's bank (Bedrock's full snow block is minecraft:snow; snow_block is the Java name: 0.1.105)
      p.pool(0, 0, 5, 11, 1); // the pool: 46% of the floor (they need 40%)
      p.pool(1, 1, 4, 10, 2); // 40 spots 2 deep to dive in (they need 4)
      p.fixture(6, 1, 11, "zoocraft:water_filter");
      p.cooler(12, 0); // the Cooling Unit beside the floor, stocked with ice
      p.feeder(11, 1, 10, "basic", FISH);
      p.basket(11, 2, 10, FISH);
    },
  },
  {
    id: "giraffe",
    name: "Giraffes",
    species: "zoocraft:giraffe",
    w: 19,
    d: 18,
    sexes: "mff",
    seed: [9, 9],
    controller: 4,
    build(p) {
      p.walls(3); // 7 blocks of headroom over the floor: no roof
      p.elevated(4, 2, R.leafy); // they browse high
      p.elevated(14, 2, R.leafy);
      p.feeder(17, 1, 16, "basic", R.leafy);
      p.basket(17, 2, 16, R.leafy);
      p.trough(1, 16);
    },
  },
  {
    id: "elephant",
    name: "Elephants",
    species: "zoocraft:elephant",
    w: 22,
    d: 20,
    sexes: "mff",
    seed: [11, 10],
    controller: 5,
    build(p) {
      p.walls(3);
      p.floor("minecraft:mud", 3, 3, 5, 5); // the mud wallow: 9 blocks (they need 6)
      p.place(10, 1, 0, FEED.rack, { states: SOUTH, stock: { item: R.leafy, full: "feeder" } });
      p.feeder(20, 1, 18, "puzzle", R.leafy); // they work a puzzle with their trunks
      p.basket(20, 2, 18, R.leafy);
      p.feeder(18, 1, 18, "basic", R.leafy);
      p.trough(1, 18);
    },
  },
  {
    id: "hedgehog",
    name: "Hedgehogs",
    species: "zoocraft:hedgehog",
    w: 9,
    d: 9,
    sexes: "mff",
    seed: [4, 4],
    controller: 2,
    build(p) {
      // The nocturnal house: closed walls and a solid roof, a tinted front the guests see through, lit only by
      // Nocturnal Lamps (light 7, the most allowed), so they're up by day for the guests.
      p.walls(3, STONE, TINTED);
      p.roof(4, STONE);
      for (const [x, z] of [[2, 2], [6, 2], [4, 6]]) p.lamp(x, 3, z);
      p.lamp(6, 3, 6, "zoocraft:purple_night_lamp");
      p.fixture(7, 1, 7, "zoocraft:burrow_shelter", SOUTH); // a burrow to sleep in
      p.feeder(7, 1, 1, "basic", R.insect);
      p.basket(7, 2, 1, R.insect);
      p.trough(1, 7);
    },
  },
  {
    id: "basalt_tortoise",
    name: "Basalt Tortoises",
    species: "zoocraft:basalt_tortoise",
    w: 12,
    d: 12,
    sexes: "mf",
    seed: [6, 6],
    controller: 3,
    build(p) {
      p.floor("minecraft:basalt");
      p.walls(3); // the Thermal Regulator in the corner would be a step over a 2-high wall
      p.floor("minecraft:magma", 2, 2, 4, 3); // 6 basking pads (they need 4)
      p.heater(0, 11);
      p.lavaTrough(11, 11); // they drink lava
      p.feeder(11, 1, 0, "basic", R.mineral);
      p.basket(11, 2, 0, R.mineral);
    },
  },
  {
    id: "ember_fox",
    name: "Ember Foxes",
    species: "zoocraft:ember_fox",
    w: 9,
    d: 9,
    sexes: "mff",
    seed: [4, 4],
    controller: 3,
    build(p) {
      p.floor("minecraft:soul_soil");
      p.walls(3);
      p.floor("zoocraft:warm_ash", 1, 1, 2, 3); // the ash bed: 6 blocks (they need 4)
      p.fixture(6, 1, 7, "zoocraft:ember_den", SOUTH); // the den to curl up in
      p.heater(0, 8);
      p.lavaTrough(8, 6);
      p.feeder(8, 1, 8, "basic", R.ember);
      p.basket(8, 2, 8, R.ember);
    },
  },
  {
    id: "lava_ray",
    name: "Lava Rays",
    species: "zoocraft:lava_ray",
    w: 12,
    d: 12,
    sexes: "mf",
    seed: [0, 6], // on the bank
    controller: 3,
    build(p) {
      p.walls(2); // stone, never wood: lava sets wooden fences alight
      p.lavaPool(2, 0, 11, 11, 1); // the pool: 83% lava (they need 60%), a 2-wide bank for the keepers
      p.lavaPool(4, 3, 8, 8, 2); // 30 spots 2 deep to turn in (they need 8)
      p.thermal(1, 5, PLANKTON); // in the bank, level with the lava
      p.basket(1, 2, 8, PLANKTON);
    },
  },
  {
    id: "zoo_strider",
    name: "Striders",
    species: "zoocraft:zoo_strider",
    w: 12,
    d: 12,
    sexes: "mmf",
    seed: [1, 1], // on the bank
    controller: 2,
    build(p) {
      p.walls(2);
      p.lavaPool(4, 0, 11, 11, 1); // lava over two thirds of the floor (they need 40%), a 4-wide bank (they need 20%)
      p.floor("minecraft:magma", 1, 4, 2, 6); // 6 warm spots on the bank to rest on (they need 4)
      p.feeder(2, 1, 10, "basic", FUNGUS); // on the bank, back from the walls (a feeder in a corner is a step over them)
      p.basket(2, 2, 10, FUNGUS);
    },
  },
  {
    id: "chorus_deer",
    name: "Chorus Deer",
    species: "zoocraft:chorus_deer",
    w: 15,
    d: 15,
    sexes: "mmff",
    seed: [7, 9],
    controller: 3,
    build(p) {
      p.floor(END_STONE); // End ground underfoot (they need 8 blocks)
      p.walls(3, END_BRICKS);
      p.fill(0, 5, 0, 6, 5, 6, END_BRICKS); // quiet cover over a corner (10% of the ground)
      p.feeder(13, 1, 13, "basic", R.chorus);
      p.basket(13, 2, 13, R.chorus);
      p.trough(13, 11);
    },
  },
  {
    id: "rift_ferret",
    name: "Rift Ferrets",
    species: "zoocraft:rift_ferret",
    w: 9,
    d: 9,
    sexes: "mmf",
    seed: [4, 4],
    controller: 2,
    build(p) {
      p.floor(END_STONE); // End ground underfoot (they need 6 blocks)
      p.walls(3, END_BRICKS); // the anchor, the feeder and the trough by the walls would be steps over 2-high ones
      p.anchor(0, 8); // the Containment Anchor beside the floor, charged
      p.fixture(2, 1, 2, "zoocraft:rift_tunnel", SOUTH); // two tunnels to blink between
      p.fixture(6, 1, 6, "zoocraft:rift_tunnel", SOUTH);
      p.feeder(8, 1, 0, "basic", R.chorus);
      p.basket(8, 2, 0, R.chorus);
      p.trough(8, 8);
    },
  },
];

// The rows, north to south: west of the avenue (from the avenue outward) and east of it.
export const ROWS = [
  { west: ["void_ray", "lion"], east: ["zebra", "raccoon", "red_panda"] },
  { west: ["gorilla", "crocodile"], east: ["tiger", "crimson_grazer"] },
  { west: ["cinder_boar", "flamingo", "owl"], east: ["end_hopper", "starback_tortoise", "obsidian_crab", "soul_moth"] },
  { west: ["quartz_beetle", "warped_gecko", "shimmer_snail"], east: ["chorus_moth"] },
];

const GAP = 3; // blocks between two exhibits' walls
const SERVICE = 5; // the strip behind a row: controllers, keeper corridors
const PATH_W = 3;
const ROW_EXTRA = SERVICE + 1 + 1 + PATH_W; // a row's depth beyond its deepest exhibit: the strip, two walls, the path
const RING_TOP = 2; // rows start this far inside the ring's north side
const RING_BOTTOM = 8; // room south of the last row's path for the Staff Rooms and the Ticket Booth

/**
 * The whole park around `origin` (the avenue's middle; x and z) on ground at y `G` (the top block of a flat world).
 * @param {{ x: number, z: number }} origin
 * @param {number} G
 */
export function planPark(origin, G) {
  return layout(origin, G, ROWS, undefined);
}

/**
 * The test zoo (0.1.104): every species' exhibit, packed in rows inside an Aluminum Fence ring of at least `size`
 * columns a side round `center` (the Park Deed's spot), with a gate in the middle of the north, east and west sides
 * and the Park Entrance Gate in the middle of the south side (bench/zooPlan.js ringPlan). The ring grows past
 * `size` when the exhibits need more room; the result's `size` says what it is.
 * @param {{ x: number, z: number }} center
 * @param {number} G
 * @param {number} size
 */
export function planZoo(center, G, size) {
  const fit = fitRing(BLUEPRINTS, size);
  return { ...layout(center, G, fit.rows, fit.size), size: fit.size, asked: size };
}

// The width an exhibit takes along its row: the floor, the walls and the margin either side.
const spanOf = (b) => b.w + 2 * (b.margin ?? 0) + 2;

/**
 * Rows for `blueprints` either side of the avenue, each side at most `side` wide: the deepest first, each put on the
 * first side with room for it (west before east, earlier rows before later), so the rows come out with exhibits of
 * about one depth and the fewest rows. Pure; the same input gives the same rows.
 */
export function packRows(blueprints, side) {
  const order = [...blueprints].sort((a, b) => b.d - a.d || a.id.localeCompare(b.id));
  const rows = [];
  const width = (ids) => ids.reduce((n, id, i) => n + spanOf(byIdOf(blueprints, id)) + (i ? GAP : 0), 0);
  for (const b of order) {
    let put = false;
    for (const row of rows) {
      for (const s of ["west", "east"]) {
        if (width([...row[s], b.id]) <= side) {
          row[s].push(b.id);
          put = true;
          break;
        }
      }
      if (put) break;
    }
    if (!put) rows.push({ west: [b.id], east: [] });
  }
  return rows;
}

function byIdOf(blueprints, id) {
  const b = blueprints.find((x) => x.id === id);
  if (!b) throw new Error(`no blueprint ${id}`);
  return b;
}

/** The smallest ring of at least `size` columns a side that holds `blueprints` in packed rows, and those rows. */
export function fitRing(blueprints, size) {
  const byId = Object.fromEntries(blueprints.map((b) => [b.id, b]));
  for (let S = Math.max(10, size); S <= 1000; S++) {
    const half = Math.floor(S / 2);
    const rows = packRows(blueprints, half - 4); // a clear column inside the fence, the wall, the avenue's 3
    const depth = rows.reduce((n, row) => n + ROW_EXTRA + Math.max(...[...row.west, ...row.east].map((id) => byId[id].d)), 0);
    if (RING_TOP + depth + RING_BOTTOM <= S) return { size: S, rows };
  }
  throw new Error("the exhibits don't fit a ring");
}

// The park's blocks: `rows` of exhibits either side of the avenue, paths, the entrance, the Staff Rooms, the services
// and the fence. With `ring`, the fence is an Aluminum Fence ring that many columns a side round the origin (the
// test zoo) and the entrance sits in its south side; without, the benchmark's fence round the park's box.
function layout(origin, G, rows, ring) {
  const byId = Object.fromEntries(BLUEPRINTS.map((b) => [b.id, b]));
  const ops = [];
  const exhibits = [];
  const viewing = [];
  const pathBoxes = [];
  const reserved = new Set(); // columns "x,z" a service may not take
  const reserve = (x0, z0, x1, z1) => {
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) reserved.add(`${x},${z}`);
  };
  // Lay out in local park coordinates (the avenue at x -1..1), then shift by the origin at the end.
  const depthOf = (row) => Math.max(...[...row.west, ...row.east].map((id) => byId[id].d));
  const totalDepth = rows.reduce((n, row) => n + ROW_EXTRA + depthOf(row), 0) + 10;
  const box = ring ? ringBox({ x: 0, z: 0 }, ring) : undefined; // the ring, in local coordinates
  let rowStart = box ? box.min.z + RING_TOP : -Math.floor(totalDepth / 2);
  const north = rowStart;
  let minX = 0;
  let maxX = 0;
  const rowPaths = [];
  for (const row of rows) {
    const D = depthOf(row);
    const front = rowStart + SERVICE + 1 + D; // the z of the front walls
    for (const side of ["west", "east"]) {
      let cursor = side === "west" ? -2 : 2; // the wall next to the avenue
      for (const id of row[side]) {
        const b = byId[id];
        const m = b.margin ?? 0;
        const ox = side === "west" ? cursor - m - b.w : cursor + m + 1;
        const oz = front - b.d;
        const p = plot(origin.x + ox, origin.z + oz, G, b.w, b.d);
        b.build(p);
        ops.push(...p.ops);
        // The controller: behind the back wall, out of reach.
        const cx = b.controller;
        ops.push({ op: "controller", pos: p.at(cx, 1, -2), exhibit: exhibits.length });
        reserve(origin.x + ox - 1 - m, origin.z + oz - SERVICE, origin.x + ox + b.w + m, origin.z + front);
        // Viewing Points on the path in front of the glass: one for a small exhibit, two for a wide one.
        const vps = b.w >= 16 ? [Math.floor(b.w / 4), Math.floor((3 * b.w) / 4)] : [Math.floor(b.w / 2)];
        for (const vx of vps) {
          const pos = p.at(vx, 1, b.d + 1);
          viewing.push(pos);
          ops.push({ op: "place", pos, block: "zoocraft:viewing_point", states: NORTH });
        }
        const animals = [...b.sexes].map((s, i) => ({ sex: s === "m" ? "male" : s === "f" ? "female" : "hermaphrodite", n: i }));
        exhibits.push({ id: b.id, name: b.name, species: b.species, seed: p.at(b.seed[0], 1, b.seed[1]), animals, box: { min: p.at(-1 - m, 0, -1), max: p.at(b.w + m, 0, b.d) } });
        minX = Math.min(minX, ox - 1 - m);
        maxX = Math.max(maxX, ox + b.w + m);
        cursor = side === "west" ? ox - m - 1 - GAP - 1 : ox + b.w + m + GAP + 1;
      }
    }
    rowPaths.push({ z0: front + 1, z1: front + PATH_W });
    rowStart = front + PATH_W + 1;
  }
  // Paths: along each row's front, the full width, and the avenue from the first row's back to the entrance (in the
  // ring's south side, or 4 beyond the last path).
  const last = rowPaths[rowPaths.length - 1];
  const gateZ = box ? box.max.z : last.z1 + 4; // the entrance threshold, on the avenue
  const south = box ? gateZ - 1 : gateZ + 3;
  for (const rp of rowPaths) pathBoxes.push({ x0: minX, z0: rp.z0, x1: maxX, z1: rp.z1 });
  pathBoxes.push({ x0: -1, z0: north, x1: 1, z1: south });
  for (const b of pathBoxes) ops.push({ op: "fill", from: { x: origin.x + b.x0, y: G, z: origin.z + b.z0 }, to: { x: origin.x + b.x1, y: G, z: origin.z + b.z1 }, block: PATH });
  // The entrance arch (5 wide: the avenue and a pillar each side) and the Ticket Booth beside it. In a ring the arch
  // is placed with the ring (below).
  const entrance = { x: origin.x, y: G + 1, z: origin.z + gateZ };
  if (!box) ops.push({ op: "place", pos: entrance, block: "zoocraft:park_entrance_gate", states: NORTH });
  ops.push({ op: "fill", from: { x: origin.x + 2, y: G, z: origin.z + gateZ - 2 }, to: { x: origin.x + 3, y: G, z: origin.z + gateZ - 2 }, block: PATH });
  const booth = { x: origin.x + 3, y: G + 1, z: origin.z + gateZ - 3 };
  ops.push({ op: "place", pos: booth, block: "zoocraft:ticket_booth", states: SOUTH });
  reserve(booth.x - 1, booth.z, booth.x + 1, booth.z + 1);
  // Staff Rooms south of the last row's path, either side of the entrance: closed huts with 3 x 3 x 3 of room inside,
  // the Staff Room block against the north wall outside, by the path.
  const rooms = [];
  const hutZ = last.z1 + 2; // the huts' north walls
  for (const hx of [-30, -22, -14, 10, 18]) {
    const x0 = origin.x + hx;
    const z0 = origin.z + hutZ;
    reserve(x0 - 1, z0 - 1, x0 + 5, z0 + 5);
    ops.push({ op: "fill", from: { x: x0, y: G + 1, z: z0 }, to: { x: x0 + 4, y: G + 4, z: z0 + 4 }, block: STONE });
    ops.push({ op: "fill", from: { x: x0 + 1, y: G + 1, z: z0 + 1 }, to: { x: x0 + 3, y: G + 3, z: z0 + 3 }, block: AIR });
    ops.push({ op: "set", pos: { x: x0 + 2, y: G + 2, z: z0 }, block: GLASS }); // a window onto the path
    const pos = { x: x0 + 2, y: G + 1, z: z0 - 1 };
    rooms.push(pos);
    ops.push({ op: "place", pos, block: "zoocraft:staff_room" });
  }
  // Guest services along the paths' south edges, where nothing else stands: Snack Stands, Benches, Litter Bins,
  // Donation Boxes, Restrooms, Water Fountains, Path Lamps and Planters (0.1.100), a few to each row.
  const services = [];
  const free = (x, z, w = 1, dz = 1) => {
    for (let i = 0; i < w; i++) for (let j = 0; j < dz; j++) if (reserved.has(`${x + i},${z + j}`)) return false;
    return true;
  };
  // Each with the states its block has: the Litter Bin has no facing (0.1.97: the game refused one with
  // "Failed to resolve block", so the build stopped at the first bin).
  const kinds = [
    { block: "zoocraft:snack_stand", w: 2, d: 2, states: NORTH },
    { block: "zoocraft:bench", w: 2, d: 1, states: NORTH },
    { block: "zoocraft:litter_bin", w: 1, d: 1 },
    { block: "zoocraft:donation_box", w: 1, d: 1, states: NORTH },
    { block: "zoocraft:bench", w: 2, d: 1, states: NORTH },
    { block: "zoocraft:litter_bin", w: 1, d: 1 },
    { block: "zoocraft:path_lamp", w: 1, d: 1, states: NORTH },
    { block: "zoocraft:restroom", w: 1, d: 1, states: NORTH },
    { block: "zoocraft:planter", w: 1, d: 1 },
    { block: "zoocraft:water_fountain", w: 1, d: 1 },
    { block: "zoocraft:path_lamp", w: 1, d: 1, states: NORTH },
    { block: "zoocraft:planter", w: 1, d: 1 },
  ];
  rowPaths.forEach((rp, r) => {
    const z = origin.z + rp.z1 + 1;
    let k = 0;
    for (let x = origin.x + minX + 2; x <= origin.x + maxX - 2 && k < kinds.length; x += 3) {
      const kind = kinds[(k + r) % kinds.length];
      if (Math.abs(x - origin.x) <= 3 || Math.abs(x + kind.w - 1 - origin.x) <= 3) continue; // keep the avenue clear
      if (!free(x, z, kind.w, kind.d) || !free(x - 1, z, kind.w + 2, 1)) continue;
      reserve(x - 1, z, x + kind.w, z + kind.d - 1);
      // The stand and bench parts run along +x from the main block when it faces north.
      const pos = { x, y: G + 1, z };
      services.push({ pos, block: kind.block });
      ops.push({ op: "place", pos, block: kind.block, states: kind.states });
      k++;
      x += kind.w;
    }
  });
  const bbox = box ? { min: { x: origin.x + box.min.x, z: origin.z + box.min.z }, max: { x: origin.x + box.max.x, z: origin.z + box.max.z } } : { min: { x: origin.x + minX - 2, z: origin.z + north - 1 }, max: { x: origin.x + maxX + 2, z: origin.z + south + 1 } };
  // The park's fence (0.1.101): Aluminum Fence all along the edge of the park's box, a gate where the avenue ends; or
  // the test zoo's ring (0.1.104) with its gates and the Park Entrance Gate.
  const fence = [];
  if (box) {
    for (const c of ringPlan(origin, ring)) {
      fence.push({ x: c.x, z: c.z });
      if (c.block) ops.push({ op: "place", pos: { x: c.x, y: G + 1, z: c.z }, block: c.block, states: c.states });
    }
  } else {
    for (let x = bbox.min.x; x <= bbox.max.x; x++) {
      fence.push({ x, z: bbox.min.z });
      fence.push({ x, z: bbox.max.z });
    }
    for (let z = bbox.min.z + 1; z < bbox.max.z; z++) {
      fence.push({ x: bbox.min.x, z });
      fence.push({ x: bbox.max.x, z });
    }
    // Each fence lands with its link states set from the edge itself (0.1.115; see zooPlan.js ringPlan).
    const onEdge = new Set(fence.map((c) => `${c.x},${c.z}`));
    const has = (x, z) => onEdge.has(`${x},${z}`);
    for (const { x, z } of fence) {
      const gate = z === bbox.max.z && x === origin.x;
      ops.push({ op: "place", pos: { x, y: G + 1, z }, block: gate ? "zoocraft:aluminum_fence_gate" : "zoocraft:aluminum_fence", states: gate ? NORTH : linkStates(has, x, z) });
    }
  }
  // Where the player watches from: the avenue in the middle of the park.
  const view = { x: origin.x + 0.5, y: G + 1, z: origin.z + 0.5 };
  return { ops, exhibits, rooms, services, entrance, booth, viewing, view, bbox, fence };
}
