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
};

export const ENTITIES = {
  floatingToy: "zoocraft:floating_toy_entity",
  enrichmentBall: "zoocraft:enrichment_ball_entity",
  blazeBone: "zoocraft:blaze_bone_entity",
  witherSkullBall: "zoocraft:wither_skull_ball_entity",
  guest: "zoocraft:guest",
  keeper: "zoocraft:keeper",
  tourGuide: "zoocraft:tour_guide",
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
  staffRoom: "zoocraft:staff_room",
  researchDesk: "zoocraft:research_desk",
  giftShop: "zoocraft:gift_shop",
  cooler: "zoocraft:cooling_unit",
  heater: "zoocraft:thermal_regulator",
  warmAsh: "zoocraft:warm_ash",
  thermalMud: "zoocraft:thermal_mud",
  mineralSubstrate: "zoocraft:mineral_substrate",
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
  nestBox: "zoocraft:nest_box",
  roost: "zoocraft:perch", // the wooden Perch owls sit on (0.1.81), the fixture "roost"; the Void Perch is `perch`
  insectFeeder: "zoocraft:insect_feeder", // a feeder holding Insect Rations that lets out moths at night (Warped Geckos, 0.1.85)
  landingPad: "zoocraft:landing_pad", // a cushioned block End Hoppers leap between (0.1.91)
  nectarFeeder: "zoocraft:nectar_feeder", // a dish of nectar on a post that holds Nectar Rations (Soul Moths, 0.1.88)
  mineralFeeder: "zoocraft:mineral_feeder", // a polished blackstone basin that holds Mineral Pellets (Obsidian Crabs, 0.1.93)
};

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

// What a feeder or a Hanging Food Basket shows inside (the blocks' zoocraft:food state): leaves,
// fish, mineral pellets, seared ember chunks, glowing plankton (baskets only: the Thermal Feeder
// has its own look), warped fungus, chorus browse, mealworms (insect rations), apples and berries
// (fruit rations), pink pellets (Flamingo Pellets), golden hay (Grain Rations) or red meat on the bone
// (Meat Rations). A Hay Rack shows only leafy hay (0) or grain hay (10). Empty blocks show the leafy
// look, which is hidden anyway.
export const FOOD_LOOK = { leafy: 0, fish: 1, mineral: 2, ember: 3, plankton: 4, fungus: 5, chorus: 6, insect: 7, fruit: 8, pellet: 9, grain: 10, meat: 11, nectar: 12 };
export function foodLook(item) {
  return FOOD_LOOK[RATIONS[item]?.diet] ?? 0;
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
};

// `full` says whether this stack holds an animal; `empty` and `occupied` stay the two item ids.
export function carrierByItem(typeId) {
  for (const [profile, c] of Object.entries(CARRIERS)) {
    if (c.empty === typeId) return { ...c, profile, full: false };
    if (c.occupied === typeId) return { ...c, profile, full: true };
  }
  return undefined;
}
