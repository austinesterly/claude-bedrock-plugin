// Habitat sizing profiles (spec section 6) and exhibit registration limits.
// Area required = baseArea + extraArea * max(0, population - 1), counted on usable reachable cells.

export const HABITAT_PROFILES = {
  small_terrestrial: { baseArea: 36, extraArea: 12, minHeight: 3 },
  medium_terrestrial: { baseArea: 100, extraArea: 30, minHeight: 4 },
  large_terrestrial: { baseArea: 256, extraArea: 80, minHeight: 6 },
  // Giraffes (spec section 6: "giraffes need greater shelter clearance"): 7 blocks of headroom.
  tall_terrestrial: { baseArea: 180, extraArea: 60, minHeight: 7 },
  // Amphibious profiles count water surface as space, and need enough water, dry bank and depth.
  small_wetland: { baseArea: 64, extraArea: 20, minHeight: 4, amphibious: true, minWaterFraction: 0.35, minDryFraction: 0.25, minDeepWater: 4 },
  // Capybaras: mostly grazing bank with a pool to wade and swim in; the pool can be shallow.
  medium_wetland: { baseArea: 96, extraArea: 24, minHeight: 4, amphibious: true, minWaterFraction: 0.2, minDryFraction: 0.45, minDeepWater: 2 },
  // Penguins: a cold pool to dive in and a dry bank where the colony stands together.
  small_polar: { baseArea: 64, extraArea: 12, minHeight: 4, amphibious: true, minWaterFraction: 0.4, minDryFraction: 0.3, minDeepWater: 4 },
  // Lava Rays (M4, spec 5.3): a lava pool to glide in, mostly lava, deep enough to turn, with a
  // bank for keepers and carriers. Space counts the bank and the lava surface.
  lava_pool: { baseArea: 80, extraArea: 32, minHeight: 3, lava: true, minLavaFraction: 0.6, minDeepLava: 8 },
  // Striders (M4, spec 5.1): a lava pool to walk across (any depth) and a bank with warm magma blocks
  // to rest on. Space counts the bank and the lava surface; they're 2 blocks tall.
  lava_shore: { baseArea: 64, extraArea: 24, minHeight: 3, lava: true, onLava: true, minLavaFraction: 0.4, minDeepLava: 0, minDryFraction: 0.2 },
  large_aquatic: { baseArea: 144, extraArea: 48, minHeight: 5 },
  small_aviary: { baseArea: 64, extraArea: 16, minHeight: 6 },
  // Void Rays (M5, spec 5.4): a roofed exhibit with air over the floor to glide in, and Void Perches
  // floating up in the air to rest on. Measured by a flood through the air (geometry.js floodAerial);
  // space counts the floor with that much air above it. Giant since 0.1.66 (Austin's idea 5: "the
  // giant ray's exhibit has to be roofed in and big enough to suit it"): 14 blocks of air and a
  // 20 x 20 floor for the first ray.
  large_aerial: { baseArea: 400, extraArea: 120, minHeight: 14, aerial: true, minPerches: 2 },
  // Flamingos (0.1.72, spec 5.2 "Flock wading | Shallow water and mud nesting"): they feed wading, so
  // the water has to be 1 block deep (the ground right under it) in enough spots. Deeper water they
  // swim in, and don't need. Space counts the bank and the water surface.
  wading: { baseArea: 64, extraArea: 12, minHeight: 4, amphibious: true, minWaterFraction: 0.3, minDryFraction: 0.25, minDeepWater: 0, minShallowWater: 16 },
  // Zebras (0.1.74, spec 5.2 "Coordinated herd movement | Savanna mixing and broad grazing"): a herd
  // needs room to graze spread out, walk off in single file and run from a fright, more than deer
  // and less than elephants. The grass to graze is its own rule (species.graze).
  grassland: { baseArea: 160, extraArea: 48, minHeight: 4 },
  // Lions (0.1.75, spec 5.2 "Pride rest and scent investigation | Group dens, secure service access"): a
  // pride lies up together, patrols its fence and plays, so it gets more room than a zebra herd for the
  // first (zoo guidance: 500 m2 for a pair, more for each); 4 blocks of headroom. Dens, ledges and the
  // double Keeper Gate are their own rules (species.dens, species.ledge, the keepers).
  pride: { baseArea: 220, extraArea: 60, minHeight: 4 },
  // Tigers (0.1.76, spec 5.2 "Solitary patrolling and swimming | Privacy and separate adult territories"):
  // AZA asks 144 m2 for one tiger and half as much again for each more (zoo exhibits average 511 m2), and
  // "a concrete pool is key", over 1 m deep with shallows for cubs: mostly dry ground, a pool 2 blocks
  // deep in 6 spots to swim and 1 deep in 4 to lie in and cool off. The turns, the dens and the screened
  // floor are their own rules (species.solitary, species.privacy, species.dens).
  tiger: { baseArea: 200, extraArea: 100, minHeight: 4, amphibious: true, minWaterFraction: 0.08, minDryFraction: 0.6, minDeepWater: 6, minShallowWater: 4, shallowWhy: "lie in the shallows to cool off", shallowUse: "to lie in" },
  // Crocodiles (0.1.77, spec 5.2 "Basking and submerged resting | Secure keeper access, shore clearance"): SA
  // DENR asks 3 times the animal's length each way for one (about 110 m2 for a 3.5 m crocodile), about half of it
  // pond, and 30% more for each more; scaled to blocks like the tiger's. Water to go under (2 deep in 4 spots for
  // one; species.submerges asks 4 for each) and dry bank to bask on (species.basks: the sunny bank).
  crocodile: { baseArea: 150, extraArea: 45, minHeight: 2, amphibious: true, minWaterFraction: 0.4, minDryFraction: 0.35, minDeepWater: 4 },
  // Red pandas (0.1.79, spec 5.2 "Elevated travel and resting | Continuous climbing routes, nest boxes"): a
  // little more floor than a raccoon's, and 5 blocks of headroom for the trees they live up in (the canopy and
  // the Nest Boxes are their own rules: species.canopy, species.nestBox).
  arboreal: { baseArea: 40, extraArea: 16, minHeight: 5 },
  // Gorillas (0.1.80, spec 5.2 "Social interaction and puzzle solving | Strong fixtures and climbing
  // structures"): room for a troop (EAZA 2024: a big outdoor area with plenty of climbing) and headroom for a
  // Climbing Frame or trees; the strong walls are the ape measure's (species.ape).
  troop: { baseArea: 200, extraArea: 50, minHeight: 5 },
  // Owls (0.1.81, spec 5.2 "Enclosed airspace, nesting boxes"): AZA 2019 asks at least 6 x 3.9 x 3.7 m for a
  // pair, so 16 blocks of floor for one and 8 more each, under 4 blocks of air, roofed (the flight measure, as
  // for the Void Ray: geometry.js floodAerial), with 2 or more Perches (minRoosts) to sit on.
  aviary: { baseArea: 16, extraArea: 8, minHeight: 4, aerial: true, minRoosts: 2 },
  // Crimson Grazers (0.1.84, spec 5.3 "Herd browsing and fungus rubbing | Crimson ground, fungal feed, herd
  // shelter"): a herd's room to graze (a musk ox bull stands 1.4 blocks at the shoulder and 2.3 long), and
  // headroom over the bulls; the crimson ground and the rubbing stem are their own rules (species.nylium, rubStem).
  herd: { baseArea: 180, extraArea: 40, minHeight: 4 },
  // Warped Geckos (0.1.85, spec 5.3 "Wall clinging and vertical hunting | Registered climbing surfaces"): a tall
  // terrarium (a giant gecko is about a third of a block long); the walls and the roof are their own rules
  // (species.clings: the wall measure).
  terrarium: { baseArea: 9, extraArea: 4, minHeight: 4 },
  // Cinder Boars (0.1.87, spec 5.3 "Ash, thermal mud, strong barrier"): a sounder's room to forage. Austria's zoo rule
  // (1. Tierhaltungsverordnung, Anlage 8) asks 200 square metres for a wild boar enclosure and 40 more for each
  // adult; scaled to blocks like the other big animals. A boar stands 0.8 blocks at the shoulder. The ash, the mud and
  // the strong walls are their own rules (species.ash, wallow, boarProof).
  sounder: { baseArea: 120, extraArea: 24, minHeight: 3 },
  // Soul Moths (0.1.88, spec 5.3 "Enclosed airspace, soul lights, nectar"): a moth house, roofed over (the flight
  // measure, as for owls and Void Rays), 9 blocks of floor for the first and 2 more each under 4 blocks of air (a
  // butterfly house is a few rooms' worth for hundreds; a big moth wants room to circle a light). A Nectar Feeder
  // inside says what an empty one is for (nectar); the soul lights are their own rule (species.soulLight).
  moth_house: { baseArea: 9, extraArea: 2, minHeight: 4, aerial: true, nectar: true },
  // Quartz Beetles (0.1.89, spec 5.3 "Heated cave, mineral bed"): a cave, 12 blocks of floor for the first and 3 more
  // each (a zoo's beetle tank is a few times a big beetle's length each; drawn big, a beetle is 0.6 blocks long, and
  // males wrestle), 2 blocks high. The roof is its cover (species.cover) and the bed its own rule (species.substrate).
  cave: { baseArea: 12, extraArea: 3, minHeight: 2 },
  // End Hoppers (0.1.91, spec 5.4 "Jump clearance, roof, landing pads"): a rabbit-sized leaper, 36 blocks of floor for
  // the first and 8 more each, under 4 blocks of air (jump clearance). The roof (species.hops) and the Landing Pads
  // (species.pads) are the jump measure's.
  hopper: { baseArea: 36, extraArea: 8, minHeight: 4 },
  // Shimmer Snails (0.1.92, spec 5.4 "Mineral bed, shade, crevices"): a slow crawler three quarters of a block long, 9
  // blocks of floor for the first and 3 more each, 2 blocks of air. The crevices (species.crevices) are the crevice
  // measure's; the bed (species.mineralBed) and the shade (species.cover) the walking measure's.
  snail: { baseArea: 9, extraArea: 3, minHeight: 2 },
  // Obsidian Crabs (0.1.93, spec 5.4 "Rocky cave, mineral feeder, substrate"): a walker whose legs reach nearly a block
  // across, 12 blocks of floor for the first and 6 more each, 2 blocks of air. The rock (species.rockFaces) is the rock
  // measure's; the Mineral Substrate (species.burrows) and the cave roof (species.cover) the walking measure's.
  crab: { baseArea: 12, extraArea: 6, minHeight: 2 },
  // Starback Tortoises (0.1.95, spec 5.4 "End vegetation, warm pad, large retreat"): a walker 0.8 blocks long, 12 blocks
  // of floor for the first and 6 more each, 2 blocks of air. The chorus (species.endPlants), the Warm Pads
  // (species.warmPads) and the low roof (species.retreat) are the tortoise measure's; the Mineral Substrate it nests in
  // (species.substrateNest) the walking measure's.
  tortoise: { baseArea: 12, extraArea: 6, minHeight: 2 },
  // Aquariums (0.1.119, module 6, spec 5.1 "Fish, squid | Aquarium | water volume, swimming clearance, filtration"): a
  // tank, measured from its bank or rim like any pool (the Habitat Marker on the ground beside the water). Its space is
  // the WATER (aquatic: exhibits/room.js counts the water cells, not the bank): 16 water cells for the first school and 1
  // more a fish, at least 60% of the exhibit water, 2 blocks deep in 4 spots so a school can turn. A fish is under a
  // block tall: 2 blocks of air over the bank is plenty.
  aquarium: { baseArea: 16, extraArea: 1, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 4 },
  // The giant tank (0.1.124, module 6b, research/trench_plan.md): the Whale Shark's, the largest water exhibit in the
  // game (Austin: "the biggest fish alive (about 12 m)"). 600 water cells for the first one (about 30 by 20) and 150
  // more each, 400 of them 2 blocks deep so a 12 m fish can turn; 3 blocks of air over the bank for the keeper's reach.
  giant_tank: { baseArea: 600, extraArea: 150, minHeight: 3, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 400 },
};

// The most air any flying species wants over the floor: an empty exhibit with a Void Perch is measured for flight
// with this. One with only Perches (owls, 0.1.81) is measured with the most air a percher wants (ROOST_HEIGHT).
export const AERIAL_HEIGHT = Math.max(...Object.values(HABITAT_PROFILES).filter((p) => p.aerial).map((p) => p.minHeight));
export const ROOST_HEIGHT = Math.max(...Object.values(HABITAT_PROFILES).filter((p) => p.aerial && p.minRoosts).map((p) => p.minHeight));

// First-version limit: 64 x 64 horizontal, 32 high, around the seed point.
export const EXHIBIT_LIMITS = {
  halfWidth: 32,
  halfHeight: 16,
  maxDrop: 3, // a ledge deeper than this is not walkable
  cellsPerYield: 48, // flood-fill work per tick slice
};

export function requiredArea(profile, population) {
  return profile.baseArea + profile.extraArea * Math.max(0, population - 1);
}
