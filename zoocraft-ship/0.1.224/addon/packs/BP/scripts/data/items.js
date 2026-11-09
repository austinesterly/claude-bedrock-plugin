// Item, ration and carrier registry: the ids the scripts look for, kept in one place.

export const ITEMS = {
  parkDeed: "zoocraft:park_deed",
  habitatMarker: "zoocraft:habitat_marker",
  clipboard: "zoocraft:exhibit_clipboard",
  cleaningRake: "zoocraft:cleaning_rake",
  leafyRation: "zoocraft:leafy_ration",
  fishRation: "zoocraft:fish_ration",
  floatingToy: "zoocraft:floating_toy",
  enrichmentBall: "zoocraft:enrichment_ball",
  blazeBone: "zoocraft:blaze_bone",
  witherSkullBall: "zoocraft:wither_skull_ball",
  clearLavaBucket: "zoocraft:clear_lava_bucket",
  insectRation: "zoocraft:insect_ration",
  fruitRation: "zoocraft:fruit_ration",
  binLatch: "zoocraft:bin_latch",
  flamingoPellets: "zoocraft:flamingo_pellets",
  grainRation: "zoocraft:grain_ration",
  meatRation: "zoocraft:meat_ration",
  fungalRation: "zoocraft:fungal_ration",
  nectarRation: "zoocraft:nectar_ration",
  fishFlakes: "zoocraft:fish_flakes", // the fish's ration (0.1.119): a dried kelp and wheat seeds make 4
  transportTank: "zoocraft:transport_tank", // the Water Transport Tank (0.1.119): the carrier a school travels in
  passivitySerum: "zoocraft:passivity_serum", // calms a weakened zombie, skeleton (0.1.163), creeper or spider (0.1.164; animals/mobs.js)
  boneRation: "zoocraft:bone_ration", // the skeletons' food (0.1.163)
};

export const ENTITIES = {
  floatingToy: "zoocraft:floating_toy_entity",
  enrichmentBall: "zoocraft:enrichment_ball_entity",
  blazeBone: "zoocraft:blaze_bone_entity",
  witherSkullBall: "zoocraft:wither_skull_ball_entity",
  guest: "zoocraft:guest",
  keeper: "zoocraft:keeper",
  tourGuide: "zoocraft:tour_guide",
  resident: "zoocraft:resident", // the residents who live in the homes players build (0.1.182, residents/residents.js)
};

export const BLOCKS = {
  controller: "zoocraft:exhibit_controller",
  feeder: "zoocraft:basic_feeder",
  entranceGate: "zoocraft:park_entrance_gate",
  entranceGatePart: "zoocraft:park_entrance_gate_part",
  workshop: "zoocraft:zoo_workshop",
  trough: "zoocraft:water_trough",
  lavaTrough: "zoocraft:lava_trough",
  basket: "zoocraft:hanging_food_basket",
  filter: "zoocraft:water_filter",
  keeperGate: "zoocraft:keeper_gate",
  keeperGateTop: "zoocraft:keeper_gate_top",
  station: "zoocraft:recovery_station",
  ticketBooth: "zoocraft:ticket_booth",
  viewingPoint: "zoocraft:viewing_point",
  snackStand: "zoocraft:snack_stand",
  snackStandPart: "zoocraft:snack_stand_part",
  bench: "zoocraft:bench",
  benchPart: "zoocraft:bench_part",
  litterBin: "zoocraft:litter_bin",
  donationBox: "zoocraft:donation_box",
  restroom: "zoocraft:restroom",
  restroomPart: "zoocraft:restroom_part",
  waterFountain: "zoocraft:water_fountain",
  pathLamp: "zoocraft:path_lamp",
  pathLampPart: "zoocraft:path_lamp_part",
  planter: "zoocraft:planter",
  staffRoom: "zoocraft:staff_room",
  researchDesk: "zoocraft:research_desk",
  noticeboard: "zoocraft:noticeboard", // 0.1.176: the caretaker's board (ui/parkMenu.js noticeboardMenu)
  giftShop: "zoocraft:gift_shop",
  mobHouse: "zoocraft:mob_house", // the Hostile Mob House (0.1.163, visitors/mobHouse.js)
  residentMailbox: "zoocraft:resident_mailbox", // a resident's home (0.1.182, residents/homes.js)
  workAnchor: "zoocraft:work_anchor", // a resident's work site (0.1.224, residents/work.js)
  cooler: "zoocraft:cooling_unit",
  heater: "zoocraft:thermal_regulator",
  warmAsh: "zoocraft:warm_ash",
  thermalMud: "zoocraft:thermal_mud",
  mineralSubstrate: "zoocraft:mineral_substrate",
  burrowSoil: "zoocraft:burrow_soil", // packed earth a molebear tunnels into (0.1.138)
  emberDen: "zoocraft:ember_den",
  elevatedFeeder: "zoocraft:elevated_feeder",
  thermalFeeder: "zoocraft:thermal_feeder",
  clearLava: "zoocraft:clear_lava",
  lavaFilter: "zoocraft:lava_filter",
  perch: "zoocraft:void_perch",
  anchor: "zoocraft:containment_anchor",
  tunnel: "zoocraft:rift_tunnel",
  endFence: "zoocraft:end_fence",
  endFenceTop: "zoocraft:end_fence_top",
  burrow: "zoocraft:burrow_shelter",
  hatchery: "zoocraft:insect_hatchery",
  redLamp: "zoocraft:red_night_lamp",
  purpleLamp: "zoocraft:purple_night_lamp",
  tourDesk: "zoocraft:tour_desk",
  platform: "zoocraft:expedition_platform",
  puzzleFeeder: "zoocraft:puzzle_feeder",
  climbingFrame: "zoocraft:climbing_frame",
  flamingoNest: "zoocraft:flamingo_nest",
  flockMirror: "zoocraft:flock_mirror",
  hayRack: "zoocraft:hay_rack",
  holdingDen: "zoocraft:holding_den",
  holdingDenTop: "zoocraft:holding_den_top",
  scentPost: "zoocraft:scent_post",
  crocNest: "zoocraft:croc_nest",
  turtleNest: "zoocraft:turtle_nest", // a sea turtle's eggs on the sand (0.1.183)
  frogSpawn: "zoocraft:frog_spawn", // a frog's spawn on the water (0.1.184)
  nestBox: "zoocraft:nest_box",
  roost: "zoocraft:perch", // the wooden Perch owls sit on (0.1.81), the fixture "roost"; the Void Perch is `perch`
  insectFeeder: "zoocraft:insect_feeder", // a feeder holding Insect Rations that lets out moths at night (Warped Geckos, 0.1.85)
  landingPad: "zoocraft:landing_pad", // a cushioned block End Hoppers leap between (0.1.91)
  nectarFeeder: "zoocraft:nectar_feeder", // a dish of nectar on a post that holds Nectar Rations (Soul Moths, 0.1.88)
  mineralFeeder: "zoocraft:mineral_feeder", // a polished blackstone basin that holds Mineral Pellets (Obsidian Crabs, 0.1.93)
  aluminumFence: "zoocraft:aluminum_fence", // the park's edge (0.1.101): a fence closed round the Park Deed's spot is the park
  aluminumGate: "zoocraft:aluminum_fence_gate", // a gate in that edge, open or shut part of it
  bank: "zoocraft:bank", // the Zoo Bank (0.1.102): the park's Zoo Coins for blocks
  aquariumFeeder: "zoocraft:aquarium_feeder", // a glass box of Fish Flakes on a post, over the water or in it (0.1.119)
};

// Our fire-proof entities: minecraft:fire_immune among their components, never in a group (a test checks the list
// against the entity files). Clear Lava's burn check (animals/lavaSwim.js) leaves them out.
export const FIRE_IMMUNE_TYPES = ["baby_dragon", "basalt_tortoise", "blaze_bone_entity", "calm_blaze", "calm_ender_dragon", "calm_ghast", "calm_magma_cube", "calm_necromancer", "calm_shulker", "calm_vex", "calm_warden", "calm_wither", "calm_wither_skeleton", "calm_zoglin", "calm_zombified_piglin", "cinder_boar", "crimson_grazer", "dragon", "ember_fox", "enrichment_ball_entity", "floating_toy_entity", "guest", "keeper", "lava_ray", "quartz_beetle", "resident", "soul_clump", "soul_moth", "soul_sloth", "tour_guide", "void_bolt", "warped_gecko", "wild_baby_dragon", "wild_basalt_tortoise", "wild_cinder_boar", "wild_crimson_grazer", "wild_dragon", "wild_ember_fox", "wild_lava_ray", "wild_necromancer", "wild_quartz_beetle", "wild_soul_moth", "wild_soul_sloth", "wild_warped_gecko", "wither_skull_ball_entity", "zoo_blaze", "zoo_ender_dragon", "zoo_ghast", "zoo_magma_cube", "zoo_necromancer", "zoo_shulker", "zoo_strider", "zoo_vex", "zoo_warden", "zoo_wither", "zoo_wither_skeleton", "zoo_zoglin", "zoo_zombified_piglin"].map((t) => `zoocraft:${t}`);

// Flowing Clear Lava (0.1.49): one block per flow level, 1 (nearly full) to 7 (a thin film), so each
// level's faces only vanish against the same level. The source and falling columns are clearLava.
export const CLEAR_LAVA_FLOWING = [1, 2, 3, 4, 5, 6, 7].map((n) => `zoocraft:clear_lava_flowing_${n}`);
export function isClearLava(typeId) {
  return typeId === BLOCKS.clearLava || CLEAR_LAVA_FLOWING.includes(typeId);
}

// Rations: which diet tag an item feeds, and how many ration units one item is worth. `plural`
// when "label + s" reads wrong; `thermal` rations go in a Thermal Feeder (Lava Rays feed in the lava).
export const RATIONS = {
  "zoocraft:leafy_ration": { diet: "leafy", units: 1, label: "Leafy Ration" },
  "zoocraft:fish_ration": { diet: "fish", units: 1, label: "Fish Ration" },
  "zoocraft:mineral_pellets": { diet: "mineral", units: 1, label: "Mineral Pellet" },
  "zoocraft:ember_ration": { diet: "ember", units: 1, label: "Ember Ration" },
  "zoocraft:molten_plankton": { diet: "plankton", units: 1, label: "Molten Plankton Feed", plural: "Molten Plankton Feed", thermal: true },
  // Striders eat plain warped fungus (grows on warped nylium with bone meal).
  "minecraft:warped_fungus": { diet: "fungus", units: 1, label: "Warped Fungus", plural: "Warped Fungi" },
  // End browsers (spec items list: "Chorus Browse | Chorus Deer, End herbivores | Chorus fruit").
  "zoocraft:chorus_browse": { diet: "chorus", units: 1, label: "Chorus Browse", plural: "Chorus Browse" },
  // Insect eaters (hedgehogs; items list: "Made by the Insect Hatchery"): no recipe, the hatchery grows them.
  "zoocraft:insect_ration": { diet: "insect", units: 1, label: "Insect Ration" },
  // Fruit eaters (raccoons; items list: "Fruit Ration | parrots, gorillas, raccoons | apples, berries,
  // melon"): crafted from apples, sweet berries, glow berries or melon slices.
  "zoocraft:fruit_ration": { diet: "fruit", units: 1, label: "Fruit Ration" },
  // Flamingo food (0.1.72): pellets with the red pigment flamingos get their pink from (beetroot, kelp
  // and fish). Flamingos eat Insect Rations too, but only pink rations keep them pink.
  "zoocraft:flamingo_pellets": { diet: "pellet", units: 1, label: "Flamingo Pellet", pink: true },
  // Grain (0.1.74; items list: "Grain Ration | 1 | Farm animals, horses, zebras | Wheat, hay bale"): hay
  // with a little grain mixed in, as zoos feed zebras (grass hay the bulk, a grain supplement on top).
  "zoocraft:grain_ration": { diet: "grain", units: 1, label: "Grain Ration" },
  // Meat (0.1.75; items list: "Meat Ration | 2 | Lions, tigers, crocodiles, wolves"; crocodiles 0.1.77): raw beef, mutton,
  // pork, chicken or rabbit, as zoos feed big cats meat on the bone. Thrown down near a wild predator it
  // calms it while it eats (animals/predators.js).
  "zoocraft:meat_ration": { diet: "meat", units: 1, label: "Meat Ration" },
  // Fungus (0.1.84; items list: "Fungal Ration | Crimson Grazer, mooshrooms | Crimson and warped fungus"): crimson
  // and warped fungus with nether wart. Crimson Grazers eat plain warped fungus too (the Strider's), the same diet.
  "zoocraft:fungal_ration": { diet: "fungus", units: 1, label: "Fungal Ration" },
  // Nectar (0.1.88; items list "Nectar Feeder | For Soul Moths and Chorus Moths"): butterfly houses feed a sugar
  // solution, so 2 sugar and a honeycomb (or sweet berries; or a chorus fruit, 0.1.94: chorus nectar). Only in a Nectar
  // Feeder or a Hanging Food Basket.
  "zoocraft:nectar_ration": { diet: "nectar", units: 1, label: "Nectar Ration" },
  // Fish Flakes (0.1.119; spec 5.1 "Fish, squid | Aquarium"): a dried kelp and wheat seeds make 4. Only in an Aquarium
  // Feeder (equipment/feeder.js), where every fish eats; a fish eats an eighth of a unit a park day.
  "zoocraft:fish_flakes": { diet: "flakes", units: 1, label: "Fish Flakes", plural: "Fish Flakes" },
  // Bone (0.1.163, the Hostile Mob House): bones and bone meal for the skeletons. A calmed skeleton follows one (or a bone).
  "zoocraft:bone_ration": { diet: "bone", units: 1, label: "Bone Ration" },
  // The farmyard four's own foods (0.1.168), so a Minecraft farm can feed the zoo: wheat is grain (a Grain Ration's worth),
  // carrots, potatoes and beetroot roots (pigs), the seeds seed (chickens). `one`: how the bait is asked for.
  "minecraft:wheat": { diet: "grain", units: 1, label: "Wheat", plural: "Wheat", one: "some wheat" },
  "minecraft:carrot": { diet: "root", units: 1, label: "Carrot", one: "a carrot" },
  "minecraft:potato": { diet: "root", units: 1, label: "Potato", plural: "Potatoes", one: "a potato" },
  "minecraft:beetroot": { diet: "root", units: 1, label: "Beetroot", one: "a beetroot" },
  "minecraft:wheat_seeds": { diet: "seed", units: 1, label: "Wheat Seeds", plural: "Wheat Seeds", one: "some wheat seeds" },
  "minecraft:beetroot_seeds": { diet: "seed", units: 1, label: "Beetroot Seeds", plural: "Beetroot Seeds", one: "some beetroot seeds" },
  "minecraft:melon_seeds": { diet: "seed", units: 1, label: "Melon Seeds", plural: "Melon Seeds", one: "some melon seeds" },
  "minecraft:pumpkin_seeds": { diet: "seed", units: 1, label: "Pumpkin Seeds", plural: "Pumpkin Seeds", one: "some pumpkin seeds" },
  // Wolves' and foxes' own foods (0.1.169): the raw meats are meat (a Meat Ration's worth: anything that eats Meat Rations
  // eats them), sweet and glow berries fruit (a Fruit Ration's worth).
  "minecraft:beef": { diet: "meat", units: 1, label: "Raw Beef", plural: "Raw Beef", one: "some raw beef" },
  "minecraft:porkchop": { diet: "meat", units: 1, label: "Raw Porkchop", one: "a raw porkchop" },
  "minecraft:mutton": { diet: "meat", units: 1, label: "Raw Mutton", plural: "Raw Mutton", one: "some raw mutton" },
  "minecraft:chicken": { diet: "meat", units: 1, label: "Raw Chicken", plural: "Raw Chicken", one: "a raw chicken" },
  "minecraft:rabbit": { diet: "meat", units: 1, label: "Raw Rabbit", plural: "Raw Rabbit", one: "a raw rabbit" },
  "minecraft:sweet_berries": { diet: "fruit", units: 1, label: "Sweet Berries", plural: "Sweet Berries", one: "some sweet berries" },
  "minecraft:glow_berries": { diet: "fruit", units: 1, label: "Glow Berries", plural: "Glow Berries", one: "some glow berries" },
  // Pandas' own food (0.1.170): bamboo is leafy (a Leafy Ration's worth: anything that eats Leafy Rations eats it).
  "minecraft:bamboo": { diet: "leafy", units: 1, label: "Bamboo", plural: "Bamboo", one: "some bamboo" },
  // Camels' own food (0.1.181): a cactus is leafy too (a Leafy Ration's worth: anything that eats Leafy Rations eats one).
  "minecraft:cactus": { diet: "leafy", units: 1, label: "Cactus", plural: "Cacti", one: "a cactus" },
  // Sea turtles' own food (0.1.183): seagrass is leafy too (a Leafy Ration's worth: the game's turtle eats it).
  "minecraft:seagrass": { diet: "leafy", units: 1, label: "Seagrass", plural: "Seagrass", one: "some seagrass" },
  // Polar bears' (0.1.174): raw cod and salmon are fish (a Fish Ration's worth: anything that eats Fish Rations eats them).
  "minecraft:cod": { diet: "fish", units: 1, label: "Raw Cod", plural: "Raw Cod", one: "a raw cod" },
  "minecraft:salmon": { diet: "fish", units: 1, label: "Raw Salmon", plural: "Raw Salmon", one: "a raw salmon" },
  // Nautiluses' (0.1.196): the game's nautilus is tamed with pufferfish and eats tropical fish too.
  "minecraft:pufferfish": { diet: "fish", units: 1, label: "Pufferfish", plural: "Pufferfish", one: "a pufferfish" },
  "minecraft:tropical_fish": { diet: "fish", units: 1, label: "Tropical Fish", plural: "Tropical Fish", one: "a tropical fish" },
  // Armadillos' own food (0.1.190): a spider eye is insect food (an Insect Ration's worth: the game's armadillo eats them).
  "minecraft:spider_eye": { diet: "insect", units: 1, label: "Spider Eye", one: "a spider eye" },
  // Sniffers' own foods (0.1.192): the seeds they dig up are seed (the chickens eat them too, as in the game).
  "minecraft:torchflower_seeds": { diet: "seed", units: 1, label: "Torchflower Seeds", plural: "Torchflower Seeds", one: "some torchflower seeds" },
  "minecraft:pitcher_pod": { diet: "seed", units: 1, label: "Pitcher Pod", one: "a pitcher pod" },
  // A hay bale (0.1.193: the game's llama follows one): grain, 9 wheat's worth, as in a crafting grid.
  "minecraft:hay_block": { diet: "grain", units: 9, label: "Hay Bale", one: "a hay bale" },
  // Golems (0.1.195): iron and copper to keep them in repair, snow to top them up (a game choice: the game's eat nothing).
  // An ingot is 9 nuggets, a snow block 4 snowballs, as in a crafting grid. A feeder shows them as its mineral look.
  "minecraft:iron_nugget": { diet: "iron", units: 1, label: "Iron Nugget", one: "an iron nugget", look: "mineral" },
  "minecraft:iron_ingot": { diet: "iron", units: 9, label: "Iron Ingot", one: "an iron ingot", look: "mineral" },
  "minecraft:snowball": { diet: "snow", units: 1, label: "Snowball", one: "a snowball", look: "mineral" },
  "minecraft:snow": { diet: "snow", units: 4, label: "Snow Block", one: "a snow block", look: "mineral" },
  "minecraft:copper_nugget": { diet: "copper", units: 1, label: "Copper Nugget", one: "a copper nugget", look: "mineral" },
  "minecraft:copper_ingot": { diet: "copper", units: 9, label: "Copper Ingot", one: "a copper ingot", look: "mineral" },
  // Sulfur cubes' (0.1.197): the game's small ones grow on slimeballs.
  "minecraft:slime_ball": { diet: "slime", units: 1, label: "Slimeball", one: "a slimeball", look: "mineral" },
  "minecraft:slime": { diet: "slime", units: 9, label: "Slime Block", one: "a slime block", look: "mineral" },
  // Magma cubes' (0.1.203): the game's magma cream (a slimeball and blaze powder; a magma cube drops it), the magma cube's
  // own jelly as slimeballs are the slime's. A feeder shows it as seared ember chunks.
  "minecraft:magma_cream": { diet: "magma", units: 1, label: "Magma Cream", plural: "Magma Cream", one: "some magma cream", look: "ember" },
  // The undead mounts' (0.1.198): the game's zombie horse follows a red mushroom and is healed by one, its camel husk a
  // rabbit's foot. Each a diet of its own (a red mushroom isn't a Nether fungus; a rabbit's foot isn't a meal for a lion).
  "minecraft:red_mushroom": { diet: "mushroom", units: 1, label: "Red Mushroom", one: "a red mushroom", look: "fungus" },
  "minecraft:rabbit_foot": { diet: "rabbit_foot", units: 1, label: "Rabbit's Foot", plural: "Rabbit's Feet", one: "a rabbit's foot", look: "meat" },
  // The breeze's and the creaking's (0.1.213, a game choice: the game's eat nothing): a breeze's wind charges (a breeze
  // rod is 4, as in a crafting grid), a creaking's resin clumps (a block of resin is 9). A feeder shows the wind as its
  // mineral look, the resin as its ember look (orange chunks).
  "minecraft:wind_charge": { diet: "wind", units: 1, label: "Wind Charge", one: "a wind charge", look: "mineral" },
  "minecraft:breeze_rod": { diet: "wind", units: 4, label: "Breeze Rod", one: "a breeze rod", look: "mineral" },
  "minecraft:resin_clump": { diet: "resin", units: 1, label: "Resin Clump", one: "a resin clump", look: "ember" },
  "minecraft:resin_block": { diet: "resin", units: 9, label: "Block of Resin", plural: "Blocks of Resin", one: "a block of resin", look: "ember" },
};

// "Leafy Rations", "Molten Plankton Feed": a ration's name for more than one.
export function rationPlural(item) {
  const r = RATIONS[item];
  return r ? r.plural ?? `${r.label}s` : item;
}

// "1 Leafy Ration", "3 Leafy Rations": the name that goes after a count.
export function rationCount(item, n) {
  return n === 1 ? RATIONS[item]?.label ?? item : rationPlural(item);
}

// "a Meat Ration", "an Ember Ration", "some Chorus Browse", "some raw beef": how one is asked for (0.1.208).
export function rationOne(item) {
  const r = RATIONS[item];
  if (!r) return `a ${item.split(":")[1].replace(/_/g, " ")}`;
  if (r.one) return r.one;
  if (r.plural === r.label) return `some ${r.label}`;
  return `${/^[AEIOU]/i.test(r.label) ? "an" : "a"} ${r.label}`;
}

// What a feeder or a Hanging Food Basket shows inside (the blocks' zoocraft:food state): leaves,
// fish, mineral pellets, seared ember chunks, glowing plankton (baskets only: the Thermal Feeder
// has its own look), warped fungus, chorus browse, mealworms (insect rations), apples and berries
// (fruit rations), pink pellets (Flamingo Pellets), golden hay (Grain Rations) or red meat on the bone
// (Meat Rations). A Hay Rack shows only leafy hay (0) or grain hay (10). Empty blocks show the leafy
// look, which is hidden anyway.
export const FOOD_LOOK = { leafy: 0, fish: 1, mineral: 2, ember: 3, plankton: 4, fungus: 5, chorus: 6, insect: 7, fruit: 8, pellet: 9, grain: 10, meat: 11, nectar: 12, flakes: 13, bone: 14, root: 15, seed: 16 }; // bone (0.1.163): bones; root and seed (0.1.168): carrots, potatoes and beetroot, a scatter of seeds
export function foodLook(item) {
  const r = RATIONS[item];
  return FOOD_LOOK[r?.look ?? r?.diet] ?? 0; // r.look: another diet's look (the golems' iron, snow and copper, 0.1.195)
}

// Carriers come in pairs: the empty item and the occupied one (one item type has one icon).
/** @type {Record<string, { empty: string, occupied: string, label: string, research?: string }>} */
export const CARRIERS = {
  small: { empty: "zoocraft:small_carrier", occupied: "zoocraft:small_carrier_occupied", label: "Small Carrier" },
  livestock: { empty: "zoocraft:livestock_crate", occupied: "zoocraft:livestock_crate_occupied", label: "Livestock Crate" },
  large: { empty: "zoocraft:reinforced_crate", occupied: "zoocraft:reinforced_crate_occupied", label: "Reinforced Crate" },
  // Nether animals (spec section 8: "Nether wildlife | Thermal carrier"); needs Heat Systems research.
  thermal: { empty: "zoocraft:thermal_carrier", occupied: "zoocraft:thermal_carrier_occupied", label: "Thermal Carrier", research: "heat_systems" },
  // End animals (spec section 8: "End wildlife | Stabilized carrier"); needs Dimensional Preparation research.
  stabilized: { empty: "zoocraft:stabilized_carrier", occupied: "zoocraft:stabilized_carrier_occupied", label: "Stabilized Carrier", research: "dimensional_preparation" },
  // Fish (0.1.119; spec items list "Water Transport Tank | 4 glass, 2 iron ingots, a water bucket"): a whole school at
  // once, no bait, no research (transport/carriers.js packSchool).
  aquatic: { empty: "zoocraft:transport_tank", occupied: "zoocraft:transport_tank_occupied", label: "Water Transport Tank" },
  // Big fish (0.1.124, module 6b: the whale shark first): one animal at a time in the Large Water Tank (5 glass, 2 iron
  // ingots, a water bucket and a Water Transport Tank), after Marine Husbandry research; baited like any animal.
  marine: { empty: "zoocraft:large_tank", occupied: "zoocraft:large_tank_occupied", label: "Large Water Tank", research: "marine_husbandry" },
  // The Giant Yeti (0.1.159, the first boss): its own cage (6 iron bars, 2 packed ice and a Reinforced Crate at the Zoo
  // Workshop), after Yeti Tracking research; only once the yeti is tired out (animals/boss.js bossCatchBlock).
  yeti: { empty: "zoocraft:yeti_cage", occupied: "zoocraft:yeti_cage_occupied", label: "Yeti Cage", research: "yeti_tracking" },
  // The Soul Sloth (0.1.161, the second boss): its own cage (4 iron bars, 2 soul lanterns, 2 soul sand and a Reinforced
  // Crate at the Zoo Workshop), after Soul Tracking research; only once the sloth is tired out.
  sloth: { empty: "zoocraft:soul_cage", occupied: "zoocraft:soul_cage_occupied", label: "Soul Cage", research: "soul_tracking" },
  // The Baby Dragon (0.1.162, the third boss): its own crate (4 obsidian, 2 purpur blocks, 2 ender pearls and a
  // Reinforced Crate at the Zoo Workshop), after Dragon Tracking research; only once the dragon is tired out.
  drake: { empty: "zoocraft:dragon_crate", occupied: "zoocraft:dragon_crate_occupied", label: "Dragon Crate", research: "dragon_tracking" },
  // Zombies and skeletons (0.1.163, the Hostile Mob House), creepers and spiders (0.1.164): a barred cage (seven iron bars, an iron chain and a Reinforced
  // Crate at the Zoo Workshop), after Mob Taming research; only a calmed one goes in.
  mob: { empty: "zoocraft:mob_cage", occupied: "zoocraft:mob_cage_occupied", label: "Mob Cage", research: "mob_taming" },
};

// `full` says whether this stack holds an animal; `empty` and `occupied` stay the two item ids.
export function carrierByItem(typeId) {
  for (const [profile, c] of Object.entries(CARRIERS)) {
    if (c.empty === typeId) return { ...c, profile, full: false };
    if (c.occupied === typeId) return { ...c, profile, full: true };
  }
  return undefined;
}
