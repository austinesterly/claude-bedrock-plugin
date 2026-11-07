// Habitat sizing profiles (spec section 6) and exhibit registration limits.
// Area required = baseArea + extraArea * max(0, population - 1), counted on usable reachable cells.

export const HABITAT_PROFILES = {
  small_terrestrial: { baseArea: 36, extraArea: 12, minHeight: 3 },
  // The farmyard four (0.1.168): sheep, cows and pigs 48 blocks for the first and 16 for each more, chickens a coop of 16
  // and 4; 3 blocks of headroom (research/vanilla_plan.md).
  farmyard: { baseArea: 48, extraArea: 16, minHeight: 3 },
  coop: { baseArea: 16, extraArea: 4, minHeight: 3 },
  // Wolves (0.1.169): a pack's run, 120 blocks for the first and 24 for each more; 3 blocks of headroom.
  pack: { baseArea: 120, extraArea: 24, minHeight: 3 },
  medium_terrestrial: { baseArea: 100, extraArea: 30, minHeight: 4 },
  large_terrestrial: { baseArea: 256, extraArea: 80, minHeight: 6 },
  // Earth Molebears at twice the size (0.1.140, Austin's card: "Large-animal room"): the big animals' floor, with the
  // 4 blocks of headroom they had (1.9 blocks tall, a cave exhibit with a roof suits them).
  big_burrower: { baseArea: 256, extraArea: 80, minHeight: 4 },
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
  // Dragons (0.1.150, the Mythical Glade): a great hall, roofed over (the flight measure, as for the Void Ray), with 16
  // blocks of air over the floor (a 7-block dragon with an 11-block span, beating its wings on the way up) and 30 x 30 of
  // floor for the first, 300 more for each more. They land on its floor (lands: no perches) and bask by a campfire
  // (species.warmth).
  great_aerial: { baseArea: 900, extraArea: 300, minHeight: 16, aerial: true, lands: true },
  // Giant Yetis (0.1.159, the first boss): a big floor for a 3.6-block ape with a 1.9-block body (20 x 20 for the first,
  // 200 more for a second) and 5 blocks of headroom, the den's roof included.
  yeti: { baseArea: 400, extraArea: 200, minHeight: 5 },
  // Soul Sloths (0.1.161, the second boss): a big floor for a 4-block-long sloth with a 1.9-block body (20 x 20 for the
  // first, 200 more for a second) and 5 blocks of headroom (it rears up to 4); its beam stands 5 to 8 over the floor.
  sloth: { baseArea: 400, extraArea: 200, minHeight: 5 },
  // Zombies and skeletons (0.1.163, the Hostile Mob House): a pen beside a Mob House's hall, a 5 x 5 floor for the first
  // and 10 more for each more, 3 blocks of headroom (they are 2 tall). Shut in all round with a roof (animals/mobRules.js).
  mob_pen: { baseArea: 25, extraArea: 10, minHeight: 3 },
  // The Cyclops (0.1.165): a tall pen beside the hall for a 3.5-block giant, 7 x 7 of floor for the first and 25 more
  // for a second, 6 blocks of headroom.
  mob_pen_giant: { baseArea: 49, extraArea: 25, minHeight: 6 },
  // The phantom (0.1.205): a tall pen beside the hall to circle and swoop in (it never lands: animals/mobFlight.js flies
  // it round a ring under the roof), 6 x 6 of floor for the first and 12 more each, 6 blocks of headroom.
  mob_pen_sky: { baseArea: 36, extraArea: 12, minHeight: 6 },
  // The ghast (0.1.208): a 4-block ghast floating about a pen beside the hall: the happy ghast's Sky Pen room (0.1.196,
  // the same 4 by 4 by 4), 256 blocks of floor for the first and 96 more each, under 12 blocks of air (three ghasts tall).
  mob_pen_ghast: { baseArea: 256, extraArea: 96, minHeight: 12 },
  // The undead mounts (0.1.198): a stable pen beside the hall, 120 blocks of floor for the first and 40 more each, 4 blocks
  // of headroom (the zoo's smallest horse paddock, the donkeys': the undead don't graze or gallop; a camel husk is 2.4 tall).
  mob_pen_stable: { baseArea: 120, extraArea: 40, minHeight: 4 },
  // The drowned and the zombie nautilus (0.1.200): a Mob House pen that is a tank, its space the water (an aquarium's, as
  // the nautilus tank's): the zombie's pen in water, 25 blocks of it for the first and 10 more each, all of the first's 2
  // deep (a drowned is 1.9 tall and walks the bottom), 2 of headroom over the bank the Habitat Marker is used on.
  mob_pen_water: { baseArea: 25, extraArea: 10, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 25 },
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
  // Polar bears (0.1.174): Manitoba's Polar Bear Protection Regulation (M.R. 210/2002) asks 500 m2 of exhibit for one or
  // two bears and 150 more for each more, a pool of 70 m2 or more with a shallow end to wade in and a deep end 3 m deep,
  // and a holding area 4 x 3 x 2.5 m for each bear (the Holding Dens: species.dens). Scaled like the lions' (500 m2 for a
  // pair: 280 blocks): 220 blocks for the first, 80 for each more, a pool a seventh of it or more, 2 deep in 8 spots to
  // swim and 1 deep in 4 to wade, and half of it dry. Its soft ground (125 m2: a quarter) is the snow (species.snowFloor).
  // Horses and donkeys (0.1.175): horses 200 blocks for the first and 60 for each more, donkeys 120 and 40 (the Donkey
  // Sanctuary asks an acre at least for a pair; Scotland's equine code: donkeys need much less grazing than horses), 4
  // blocks of headroom (a horse is 1.6 tall, on a hay bale 2.6). A shared paddock is sized for the horses.
  paddock: { baseArea: 200, extraArea: 60, minHeight: 4 },
  donkey_paddock: { baseArea: 120, extraArea: 40, minHeight: 4 },
  // Llamas and mules (0.1.193): 150 blocks for the first and 50 for each more, scaled from the sources (Open Sanctuary: about
  // an acre a llama sharing pasture with other kinds; Lost Creek Llamas: 1 to 1.5 llamas an acre with horses; World Horse
  // Welfare: mules may need more room to roam than donkeys, whose 120 and 40 are the Donkey Sanctuary's half acre each).
  // 4 blocks of headroom (a llama is 1.87 tall).
  llama_paddock: { baseArea: 150, extraArea: 50, minHeight: 4 },
  mule_paddock: { baseArea: 150, extraArea: 50, minHeight: 4 },
  // Goats (0.1.180): 60 blocks for the first and 16 for each more (a little more than the farmyard's, for the rocks), 3
  // blocks of headroom. The strong walls and the rock ledges are their own rules (species.rockLedges).
  mountain: { baseArea: 60, extraArea: 16, minHeight: 3 },
  // Camels (0.1.181): 120 blocks for the first and 40 for each more (200 for three: the Scottish guidance's 10 by 20 m for a
  // male and two females), 3 blocks of headroom (the game's camel is 2.375 high). Sand and shade are their own rules
  // (species.desert).
  desert: { baseArea: 120, extraArea: 40, minHeight: 3 },
  // Sea turtles (0.1.183): USFWS "Standard Conditions for Care and Maintenance of Captive Sea Turtles" (2019), for a turtle
  // over 65 cm, water nine shell lengths by two shell widths, 1.2 m deep, doubled for each more. The game's shell is about
  // 1.25 by 1.2 blocks: 27 blocks of water each, 2 deep. So 45 blocks for the first and 45 for each more, 60% of it water and
  // 20% dry beach, 27 spots 2 deep; 2 blocks of headroom (the turtle is 0.4 high). Sand to nest in and seagrass are their own
  // rules (species.sandNest, species.seagrass).
  turtle_beach: { baseArea: 45, extraArea: 45, minHeight: 2, amphibious: true, minWaterFraction: 0.6, minDryFraction: 0.2, minDeepWater: 27 },
  // Frogs (0.1.184): the EAZA natterjack toad guideline (2025) gives Copenhagen Zoo's breeding enclosure, 227 x 310 cm with
  // land 75% and water 25% (20 cm deep) for 8 to 20 toads: about 18 blocks a frog at the game frog's size at the most
  // toads, 45 at the fewest. 36 for the first and 18 for each more, at least a quarter water (1 deep is enough) and half
  // dry land; 3 blocks of headroom (they leap). Lily pads on the water are their own rule (animals/frogRules.js).
  frog_pond: { baseArea: 36, extraArea: 18, minHeight: 3, amphibious: true, minWaterFraction: 0.25, minDryFraction: 0.5, minDeepWater: 0 },
  // Axolotls (0.1.185): the EAZA Amphibian TAG guideline for the Lake Patzcuaro salamander (a close relative) keeps up to 4
  // in a densely planted 110 x 60 x 40 cm aquarium; they live on the bottom, and the water need only be deeper than one is
  // long (2.1.7). At the game axolotl's size (0.75 blocks) that's about 6 blocks of floor for 4, too cramped for a game: 16
  // water blocks for the first and 4 for each more, its space the water (aquatic, measured from the bank like any tank),
  // 1 deep enough; 2 blocks of headroom over the bank. The plants and the floor are their own rules (species.waterPlants).
  axolotl_tank: { baseArea: 16, extraArea: 4, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 0 },
  polar_bear: { baseArea: 220, extraArea: 80, minHeight: 4, amphibious: true, minWaterFraction: 0.15, minDryFraction: 0.5, minDeepWater: 8, minShallowWater: 4 },
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
  // The large tank (0.1.125): a shark's. 256 water cells for the first and 64 more each, 128 of them 2 deep; 2 of headroom.
  large_tank: { baseArea: 256, extraArea: 64, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 128 },
  // The trench tanks (0.1.126): a goblin shark's, 200 water cells for the first and 50 more each, 100 of them 2 deep; an
  // anglerfish's, 64 and 16 more each, 32 of them 2 deep. Both in the dark: their species want low light (species.lowLight),
  // so the light on the water is read as a nocturnal house's is (exhibits/light.js).
  trench_tank: { baseArea: 200, extraArea: 50, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 100 },
  dark_tank: { baseArea: 64, extraArea: 16, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 32 },
  // A stingray's tank (0.1.127): 144 water cells for the first and 48 more each, 72 of them 2 deep, with sand under the
  // water (species.sandBed). A jellyfish tank: 48 for a school's first jelly and 6 more each (8 jellies: 90), 32 of them deep.
  ray_tank: { baseArea: 144, extraArea: 48, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 72 },
  jelly_tank: { baseArea: 48, extraArea: 6, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 32 },
  // A manatee's lagoon (0.1.129): 160 water cells for the first and 60 more each (a calf half that), 80 of them 2 deep;
  // like a tank, its space is the water. Its seagrass is the species' (species.seagrass).
  lagoon: { baseArea: 160, extraArea: 60, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 80 },
  // A dolphin pool (0.1.186): the European Association for Aquatic Mammals' standard, a pool for five dolphins 275 square
  // metres of water and 75 more for each more (at a block a metre, the game dolphin is life-size): 275 water cells for up
  // to five (firstGroup) and 75 more each. Its space is the water. Its depth and width (a stretch 8 by 8 and 4 deep: the
  // standard's 3.5 m, the US rules' 7.32 m across) and the open water they breathe at are the species' (species.deepPool,
  // animals/dolphinRules.js); the 64 cells 2 deep here are that stretch's.
  dolphin_pool: { baseArea: 275, extraArea: 75, firstGroup: 5, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 64 },
  // A bee garden (0.1.187): bees are kept in hives in the open, a colony foraging an acre or more (beekeepers' rule; the
  // North American pollinator survey's beekeepers ask 1 to 5), and zoos keep them in observation hives with the bees
  // flying out. A zoo bee can't fly free, so a roofed garden (a greenhouse, as bumblebees are kept in for pollination):
  // 25 blocks of floor for up to 3 (a hive's worth, firstGroup) and 6 more each, under the moth house's 4 blocks of air
  // (the flight measure). The size is a game choice. The flowers and the hives are the species' (species.beeFlowers,
  // beeHives: animals/beeRules.js); a Beehive or Bee Nest inside says what an empty one is for (bees).
  bee_garden: { baseArea: 25, extraArea: 6, firstGroup: 3, minHeight: 4, aerial: true, bees: true },
  // A parrot aviary (0.1.188): flights for macaws 2 to 3 wingspans wide, 6 body lengths long and 4 high (the aviculturist
  // Jerry McCawley, the AFA's Watchbird); the game's parrot is a block tall, so 25 blocks of floor (5 by 5) for a pair
  // (firstGroup) and 8 more each, under 4 blocks of air, roofed (the flight measure), with 2 or more of the owls'
  // Perches (minRoosts) to fly between. The sizes are a game choice from those rules of thumb. The jukeboxes beside its
  // air (they dance) are the species' (species.dances: animals/parrotRules.js).
  parrot_aviary: { baseArea: 25, extraArea: 8, firstGroup: 2, minHeight: 4, aerial: true, minRoosts: 2 },
  // A bat house (0.1.194): flight room at least 8 wingspans long (the AZA Bat TAG; the game's bat spans about 1.2 blocks, so
  // a straight 10 blocks of air: species.flight), 40 blocks of floor (10 by 4) for the first 3 (firstGroup) and 4 more each,
  // under 4 of air, roofed with something they can hang from (species.batRoost: animals/batRules.js). A game choice from
  // that rule of thumb.
  bat_house: { baseArea: 40, extraArea: 4, firstGroup: 3, minHeight: 4, aerial: true },
  // An allay room (0.1.194): 25 blocks of floor for the first 2 and 6 more each, under 4 of air (the game's allay hovers 1
  // to 4 up), roofed. A game choice: the game keeps them in small cages. The jukeboxes and note blocks are the species'.
  allay_room: { baseArea: 25, extraArea: 6, firstGroup: 2, minHeight: 4, aerial: true },
  // Golem yards (0.1.195): the game's iron golem is 1.4 wide and 2.9 tall and walks a village's paths: 64 blocks of floor
  // for one (8 by 8) and 32 more each, under 4 of air. A snow golem (0.4 by 1.8): 16 blocks and 8 more each, under 3 of air
  // (and a roof over all of it: species.cover). A copper golem (0.6 by 1): 16 and 8 more each, under 2. Game choices: the
  // game keeps none of them in pens. The paving, the chests and the roof are the species'.
  iron_golem_yard: { baseArea: 64, extraArea: 32, firstGroup: 1, minHeight: 4 },
  snow_golem_yard: { baseArea: 16, extraArea: 8, firstGroup: 1, minHeight: 3 },
  copper_golem_yard: { baseArea: 16, extraArea: 8, firstGroup: 1, minHeight: 2 },
  // A Sky Pen (0.1.196): the game's happy ghast is 4 blocks across and floats about slowly, roaming 64 blocks from its home:
  // 256 blocks of floor (16 by 16) for the first and 96 more each, under 12 blocks of air (three ghasts tall), walled and
  // roofed as every flyer's room (sky). A game choice. The glass roof is the species' (species.skyRoof).
  sky_pen: { baseArea: 256, extraArea: 96, firstGroup: 1, minHeight: 12, aerial: true, sky: true },
  // A nautilus tank (0.1.196): Daw and Barord ("Husbandry of the Nautilus", Tropical Fish Hobbyist) ask at least 3 feet long,
  // 18 inches wide and 2 feet deep for one nautilus under 6 inches, bigger for more: 6 shells by 3 by 4 deep. At the game's
  // 0.9-block shell, 16 water cells for the first and 8 more each, all of the first's 2 deep; its space is the water. The
  // dim light is the species' (species.lowLight).
  nautilus_tank: { baseArea: 16, extraArea: 8, minHeight: 2, amphibious: true, aquatic: true, minWaterFraction: 0.6, minDryFraction: 0, minDeepWater: 16 },
  // A Sulfur Cave (0.1.197): the game's sulfur cubes come 2 to 4 together and hop a block and a quarter (the test server):
  // 36 blocks of floor (6 by 6) for the first two and 9 more each, 3 blocks high. A game choice. The sulfur or cinnabar
  // underfoot is the species' (species.sulfurFloor).
  sulfur_cave: { baseArea: 36, extraArea: 9, firstGroup: 2, minHeight: 3 },
  // An ocelot exhibit (0.1.189): the San Diego Zoo Wildlife Alliance's managed-care minimum is 4 by 2 by 2.5 metres for one,
  // "structural complexity deemed more important than size", and an ocelot's "primary habitat requirement is dense
  // vegetative cover" (Animal Diversity Web): 30 blocks of floor for one or a pair (firstGroup; they live alone otherwise)
  // and 12 more each, under 4 blocks of air. The cover and the logs to rest on are the species' (species.cover,
  // species.restSpots: animals/catRules.js). The sizes are a game choice from those rules of thumb.
  ocelot: { baseArea: 30, extraArea: 12, firstGroup: 2, minHeight: 4 },
  // The Cat House (0.1.189): the Association of Shelter Veterinarians' figure for cats housed together is 1.7 square metres
  // (18 square feet) of floor each, no more than 6 to a room, with several resting places up off the floor: 12 blocks of
  // floor for a pair (firstGroup) and 4 more each, under 3 blocks of air. The roofed corner and the seats are the species'
  // (species.cover, species.restSpots).
  cat_house: { baseArea: 12, extraArea: 4, firstGroup: 2, minHeight: 3 },
  // Armadillos (0.1.190): Lincoln Park Zoo kept each three-banded armadillo in a box 112 by 58 by 61 cm with straw, Oglebay
  // a family group with sand-and-mulch pools and hides; no source gives an exhibit minimum. 20 blocks of floor for one or
  // a pair (firstGroup) and 6 more each, under 2 blocks of air (it stands 0.65): a game choice. The sand, the den, the
  // digging and the warmth are the species' (species.sandFloor, den, toys, coldWarmth: animals/armadilloRules.js).
  armadillo: { baseArea: 20, extraArea: 6, firstGroup: 2, minHeight: 2 },
};

// The most air a Void Perch flyer wants over the floor: an empty exhibit with a Void Perch is measured for flight
// with this. One with only Perches (owls, 0.1.81) is measured with the most air a percher wants (ROOST_HEIGHT); one with
// a lit campfire (dragons, 0.1.150) with the dragons' hall's own.
export const AERIAL_HEIGHT = Math.max(...Object.values(HABITAT_PROFILES).filter((p) => p.aerial && p.minPerches).map((p) => p.minHeight));
export const ROOST_HEIGHT = Math.max(...Object.values(HABITAT_PROFILES).filter((p) => p.aerial && p.minRoosts).map((p) => p.minHeight));

// First-version limit: 64 x 64 horizontal, 32 high, around the seed point.
export const EXHIBIT_LIMITS = {
  halfWidth: 32,
  halfHeight: 16,
  maxDrop: 3, // a ledge deeper than this is not walkable
  cellsPerYield: 48, // flood-fill work per tick slice
};

// The base covers the first animal, or the profile's first group (a dolphin pool's five, 0.1.186).
export function requiredArea(profile, population) {
  return profile.baseArea + profile.extraArea * Math.max(0, population - (profile.firstGroup ?? 1));
}
