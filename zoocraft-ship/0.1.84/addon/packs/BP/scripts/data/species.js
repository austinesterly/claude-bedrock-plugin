// Species catalogue (spec section 5.5). Adding an animal = an entry here + its entity and art.
// The zoo rabbit is a zoo copy of the vanilla rabbit that keeps its coat; the otter is the first
// custom animal (original model), caught from wild otters near rivers and swamps; the capybara
// (M3) is a calm grazer that rests in groups and swims in shallow water, found in swamps and jungles;
// the deer (M3) is a wary herd grazer of forests and meadows that wants quiet cover in its exhibit;
// the penguin (M3) lives in colonies in frozen places and needs a cold exhibit (a Cooling Unit);
// the giraffe (M3) is a tall savanna browser that eats only from an Elevated Browse Feeder;
// the elephant (M3) is a big savanna herd animal that needs a mud wallow and loves an Enrichment Ball.
// Every species can breed (spec section 9, M3 breeding controls): see animals/breeding.js.
// The Basalt Tortoise (M4, spec 5.3) is the first Nether animal: it needs heat (a fuelled Thermal
// Regulator), basking pads (magma blocks in the floor) and Mineral Pellets, and travels in a Thermal Carrier.
// The Ember Fox (M4, spec 5.3) needs heat too, a Warm Ash bed to dig in, an Ember Den to curl up in,
// lava to drink and Ember Rations.
// The Lava Ray (M4, spec 5.3) swims in lava: a lava pool exhibit, Molten Plankton Feed from a Thermal
// Feeder at the pool edge. Nether animals have their own toys (species.toys, Austin 0.1.46): a Blaze
// Bone for Ember Foxes and a Wither Skull Ball for Basalt Tortoises.
// The Strider (M4, spec 5.1: "Lava pool, warm resting zones, thermal transport") is a zoo copy of the
// vanilla strider, caught from wild striders: it walks across a lava pool (species.lavaWalker), rests
// on magma blocks on the bank and shivers anywhere else, and eats warped fungus from a Basic Feeder.
// The Chorus Deer (M5, spec 5.4: "Slender lavender grazer, branching antlers | Browses chorus growth in
// groups | Chorus browse, quiet retreat, herd room") is the first End animal: a herd browser of the
// End islands that wants end stone underfoot (species.endGround), quiet cover and Chorus Browse, and
// travels in a Stabilized Carrier (Dimensional Preparation research).
// The Void Ray (M5, spec 5.4: "Wide dark ray with a luminous underside | Glides through the air in slow
// arcs, rests on perches | Flight room, perches, chorus browse") is the first flyer (species.flies):
// a roofed exhibit with 14 blocks of air (large_aerial, measured by a flood through the air) and Void
// Perches floating in it to rest on; steered by animals/flight.js. End ground underfoot like the deer.
// The Raccoon (0.1.71, the Animal wave; spec 5.x "Manipulates puzzle feeders | Climbing; attracted to
// unsecured bins") is the first climber (species.climbs): its exhibit is measured for climbing too
// (exhibits/geometry.js floodClimb) and one it could climb out of is unsafe. It wants a climbing tree
// or a Climbing Frame and water to wash its food in, works Puzzle Feeders, and raids Litter Bins
// without a Bin Latch when it's loose at night (animals/raccoon.js).
// The Flamingo (0.1.72, the Animal wave; spec 5.2 "Flock wading | Shallow water and mud nesting") wades
// (species.wades: its exhibit needs shallows, water 1 block deep), lives in flocks, gets its pink from
// its food (species.pink: Flamingo Pellets) and nests (species.nest): only in a flock big enough (Flock
// Mirrors help), every grown-up rosy, on mud at the water's edge (animals/flamingo.js).
// The Zebra (0.1.74, the Animal wave; spec 5.2 "Coordinated herd movement | Savanna mixing and broad
// grazing") grazes (species.graze: grass blocks in the exhibit floor give it part of its food), lives in
// harems (species.harem: one stallion with the mares; rival stallions fight), eats from a Hay Rack
// (species.rack; deer and elephants do too) and feeds in rank order (species.feedRank: with too few
// feeding places the low-ranking ones get pushed off). Herds walk off in single file and run from a
// fright (animals/zebra.js).
// The Lion (0.1.75, Big predators; spec 5.2 "Pride rest and scent investigation | Group dens, secure
// service access") is dangerous (species.dangerous: a Holding Den for each grown one, keepers go in only
// through a double Keeper Gate with every one shut in, and a player inside its exhibit is warned off,
// then charged and swiped; wild ones hunt people), fasts one park day in seven (species.fasts), rests up
// high (species.ledge), and the males wear a light or dark mane (species.manes). A pride rests in a pile,
// patrols and marks its fence, investigates a Scent Post, roars at dusk and dawn (animals/lion.js).
// The Tiger (0.1.76, spec 5.2 "Solitary patrolling and swimming | Privacy and separate adult territories")
// is dangerous too, and solitary (species.solitary): one grown tiger loose at a time, the others in their
// Holding Dens taking turns out (animals/tigerTurns.js), a tigress's cubs in and out with her
// (dens.cubsFollow); it wants screened floor to get out of sight (species.privacy), swims and lies in the
// shallows (its "tiger" profile), and each has its own stripe pattern (species.patterns, the mob's
// skin_id) and its sex on the mob (species.sexLook: a male is bigger, with a full ruff). animals/tiger.js.
// The Crocodile (0.1.77, spec 5.2 "Basking and submerged resting | Secure keeper access, shore clearance") is
// dangerous too: it basks on a sunny bank (species.basks) and rests under the water (species.submerges: deep
// water for all at once), its keepers need the shore kept clear (species.shoreClear), it eats about once a week
// (species.meals), the biggest first (species.rank), each has its own size (species.sizes: the mob's
// zoocraft:size), its sex (species.sexLook: a male is bigger, his head broader) and its tail crest (species.patterns),
// and it nests in sand (species.sandNest), the nest's warmth setting the hatchlings' sex. animals/croc.js.
// The Red Panda (0.1.79, spec 5.2 "Elevated travel and resting | Continuous climbing routes, nest boxes") climbs
// like the raccoon (species.climbs, climbTree), lives up on the canopy reached from a trunk (species.canopy),
// sleeps in a Nest Box (species.nestBox) and needs shade in a hot biome (species.heatShade). animals/redpanda.js.
// The Gorilla (0.1.80, spec 5.2 "Social interaction and puzzle solving | Strong fixtures and climbing structures")
// lives in a troop (species.troop: one silverback), is dangerous (dens, the double Keeper Gate), needs strong
// walls (species.ape: the ape measure), drowns in deep water (species.noSwim) and wants something to climb
// (climbTree). animals/gorilla.js.
// The Owl (0.1.81, the Eurasian eagle-owl; spec 5.2 "Nocturnal flight and perch watching | Enclosed airspace, nesting
// boxes") flies (an "aviary": the flight measure) and roosts on Perches at varied heights (species.roosts), a
// night bird out at dusk and dawn, and lays its eggs in a Nest Box (breeding.nestBox). animals/owl.js.
// The Crimson Grazer (0.1.84, the Nether trio; spec 5.3 "Stocky six-legged fungal herbivore | Herd browsing and
// fungus rubbing | Crimson ground, fungal feed, herd shelter") is a fantasy herd animal built on the musk ox: crimson
// nylium underfoot (species.nylium), a crimson stem to rub on (species.rubStem), shelter over part of the floor
// (cover), heat, and the herd's ring against a threat. animals/grazer.js.

export const SPECIES = {
  "zoocraft:zoo_rabbit": {
    id: "zoocraft:zoo_rabbit",
    displayName: "Rabbit",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:rabbit", // catching this wild mob creates this species
    entityType: "zoocraft:zoo_rabbit",
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    dietTags: ["leafy"],
    carrierProfile: "small",
    baitItem: "zoocraft:leafy_ration", // one is used up when the rabbit is coaxed into a carrier
    // Field Journal (spec section 8): what to watch before one can be moved safely, and where to look.
    observe: ["spot"],
    where: "Plains, meadows, flower forests, deserts and snowy slopes",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: true },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "dig"],
    // Coat comes from the wild rabbit's minecraft:variant (0 brown .. 5 salt).
    coats: ["Brown", "White", "Black", "Splotched", "Gold", "Salt"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 2, gestationDays: 1, matureDays: 2, cooldownDays: 2, juvenileScale: 0.5, young: "kit", youngPlural: "kits" },
    names: ["Pebble", "Clover", "Biscuit", "Thistle", "Maple", "Juniper", "Hazel", "Nutmeg", "Willow", "Poppy", "Sorrel", "Bramble", "Dot", "Fennel", "Sage", "Toffee"],
  },
  "zoocraft:otter": {
    id: "zoocraft:otter",
    displayName: "Otter",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_otter",
    entityType: "zoocraft:otter",
    movementProfile: "amphibious",
    habitatProfile: "small_wetland",
    dietTags: ["fish"],
    carrierProfile: "small",
    baitItem: "zoocraft:fish_ration",
    observe: ["spot", "swim", "bank"],
    where: "Rivers and swamps, in pairs or threes",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["swim", "manipulate", "forage"],
    coats: ["River"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 2, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.5, young: "pup", youngPlural: "pups" },
    names: ["Ripple", "Pebble", "Bubbles", "Splash", "Brook", "Minnow", "Kelpie", "Skipper", "Puddle", "Wade", "Sprat", "Marlin", "Eddy", "Tumble", "Otto", "Nessie"],
  },
  "zoocraft:capybara": {
    id: "zoocraft:capybara",
    displayName: "Capybara",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_capybara",
    entityType: "zoocraft:capybara",
    movementProfile: "amphibious",
    habitatProfile: "medium_wetland",
    dietTags: ["leafy"],
    carrierProfile: "livestock",
    baitItem: "zoocraft:leafy_ration",
    observe: ["spot", "swim", "bank"],
    where: "Swamps, mangrove swamps and jungles, in groups",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["swim", "forage"],
    coats: ["Russet"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 2, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.45, young: "pup", youngPlural: "pups" },
    names: ["Cappy", "Mochi", "Barley", "Pudding", "Bean", "Hazel", "Tater", "Waffles", "Nugget", "Coco", "Sprout", "Pickles", "Dumpling", "Truffle", "Basil", "Marshmallow"],
  },
  "zoocraft:deer": {
    id: "zoocraft:deer",
    displayName: "Deer",
    plural: "Deer",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_deer",
    entityType: "zoocraft:deer",
    family: "deer", // the mob family the Field Journal counts as its herd
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    dietTags: ["leafy"],
    carrierProfile: "livestock",
    baitItem: "zoocraft:leafy_ration",
    rack: true, // it eats from a Hay Rack too (0.1.74)
    observe: ["spot", "graze", "herd"],
    where: "Forests, birch forests, taigas and meadows, in small herds. They keep away unless you sneak or hold food",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    // Quiet cover (spec section 5.2): trees or a roof over part of the ground, or comfort stays low.
    cover: { minFraction: 0.1 },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    // Coat comes from the wild deer's minecraft:variant: 0 doe, 1 buck (antlers).
    coats: ["Doe", "Buck"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 1, gestationDays: 3, matureDays: 4, cooldownDays: 5, juvenileScale: 0.55, young: "fawn", youngPlural: "fawns" },
    sexByCoat: ["female", "male"], // a doe is female, a buck male
    names: ["Fern", "Bramble", "Hazel", "Rowan", "Willow", "Acorn", "Birch", "Clover", "Juniper", "Maple", "Thistle", "Aspen", "Bracken", "Sorrel", "Holly", "Ash"],
  },
  "zoocraft:penguin": {
    id: "zoocraft:penguin",
    displayName: "Penguin",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_penguin",
    entityType: "zoocraft:penguin",
    family: "penguin", // the mob family the Field Journal counts as its colony
    movementProfile: "amphibious",
    habitatProfile: "small_polar",
    dietTags: ["fish"],
    carrierProfile: "small",
    baitItem: "zoocraft:fish_ration",
    observe: ["spot", "swim", "colony"],
    where: "Frozen places (snowy plains, ice spikes, snowy beaches, frozen rivers), in colonies",
    social: { minGroup: 3, recommendedMax: 12, prefersCompany: true },
    // A cold habitat (spec section 5.5): a stocked Cooling Unit, or comfort stays low.
    cold: true,
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["swim", "forage"],
    coats: ["Gentoo"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 1, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.6, young: "chick", youngPlural: "chicks" },
    names: ["Pip", "Waddles", "Pebble", "Flipper", "Tux", "Sprat", "Skipper", "Nugget", "Biscuit", "Bubbles", "Frost", "Pingu", "Domino", "Sardine", "Puffin", "Mumble"],
  },
  "zoocraft:giraffe": {
    id: "zoocraft:giraffe",
    displayName: "Giraffe",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_giraffe",
    entityType: "zoocraft:giraffe",
    family: "giraffe", // the mob family the Field Journal counts as its herd
    movementProfile: "terrestrial",
    habitatProfile: "tall_terrestrial",
    dietTags: ["leafy"],
    // Elevated browse (spec section 5.5): giraffes eat only from an Elevated Browse Feeder.
    browsesHigh: true,
    carrierProfile: "large",
    baitItem: "zoocraft:leafy_ration",
    observe: ["spot", "browse", "herd"],
    where: "Savannas, in small herds",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    coats: ["Reticulated"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 1, gestationDays: 4, matureDays: 6, cooldownDays: 8, juvenileScale: 0.45, young: "calf", youngPlural: "calves" },
    names: ["Twiga", "Stretch", "Acacia", "Patches", "Sunny", "Marigold", "Kito", "Zuri", "Amber", "Biscuit", "Lofty", "Savanna", "Toffee", "Jengo", "Pippa", "Rafiki"],
  },
  "zoocraft:elephant": {
    id: "zoocraft:elephant",
    displayName: "Elephant",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_elephant",
    entityType: "zoocraft:elephant",
    family: "elephant", // the mob family the Field Journal counts as its herd
    movementProfile: "terrestrial",
    habitatProfile: "large_terrestrial",
    dietTags: ["leafy"],
    carrierProfile: "large",
    baitItem: "zoocraft:leafy_ration",
    rack: true, // it eats from a Hay Rack too (0.1.74)
    observe: ["spot", "trunk", "herd"],
    where: "Savannas, in small herds",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    // Mud bathing (spec section 5.2; item list: "Mud Wallow | Vanilla mud (registered)"): enough
    // blocks of mud in the exhibit floor, or comfort stays low.
    mud: { minCells: 6 },
    rationUnitsPerParkDay: 4,
    // Durable enrichment: the Enrichment Ball (manipulate) and a Hanging Food Basket (forage).
    enrichmentTags: ["manipulate", "forage"],
    coats: ["Savanna"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 1, gestationDays: 5, matureDays: 8, cooldownDays: 10, juvenileScale: 0.4, young: "calf", youngPlural: "calves" },
    names: ["Tembo", "Nandi", "Pebbles", "Jumbo", "Kibo", "Amara", "Dumbo", "Ruby", "Mosi", "Thandi", "Boulder", "Nala", "Juma", "Olive", "Rumble", "Ellie"],
  },
  "zoocraft:hedgehog": {
    id: "zoocraft:hedgehog",
    displayName: "Hedgehog",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_hedgehog",
    entityType: "zoocraft:hedgehog",
    family: "hedgehog",
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    dietTags: ["insect"],
    carrierProfile: "small",
    baitItem: "zoocraft:insect_ration",
    observe: ["spot", "forage", "curl"],
    where: "Forests, plains and meadows at night, nosing through the grass alone. By day they sleep curled up, so look after dark",
    // A pair and a litter (0.1.81: below that, the first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: false },
    // Spec 5: "Night foraging and curling | Small tunnels and nocturnal viewing". Asleep by Minecraft
    // day and up at night (animals/night.js); a nocturnal house (a fully enclosed, dark building lit by
    // Nocturnal Lamps) turns that round so guests see them by day (animals/nightRules.js).
    nocturnal: true,
    // Its den is a Burrow Shelter (a leaf-litter mound over a log), not an Ember Den.
    den: "burrow",
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "dig"],
    // Coat comes from minecraft:variant: 0 Brown (the common coat), 1 Blonde (pale spines, rarer).
    coats: ["Brown", "Blonde"],
    breeding: { litter: 3, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.5, young: "hoglet", youngPlural: "hoglets" },
    names: ["Prickles", "Bramble", "Sonic", "Mrs Tiggy", "Conker", "Quill", "Hazel", "Nutkin", "Pudding", "Twiggy", "Hedwig", "Thistle", "Acorn", "Moss", "Pip", "Dusk"],
  },
  "zoocraft:basalt_tortoise": {
    id: "zoocraft:basalt_tortoise",
    displayName: "Basalt Tortoise",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_basalt_tortoise",
    entityType: "zoocraft:basalt_tortoise",
    family: "basalt_tortoise",
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    dietTags: ["mineral"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:mineral_pellets",
    observe: ["spot", "bask", "gnaw"],
    where: "Basalt deltas in the Nether, basking on magma blocks",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator, or comfort stays low and after
    // the recovery window it goes to recovery holding.
    heat: true,
    // Basking pads (spec 5.3: "Hot stones, basalt ground"): magma blocks in the exhibit floor.
    bask: { minCells: 4 },
    // It drinks lava, not water (Austin, 0.1.44): a Lava Trough filled with lava buckets.
    drinksLava: true,
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage", "manipulate"],
    // Its favourite toy: a Wither Skull Ball to nudge around with its beak.
    toys: ["skull"],
    coats: ["Basalt"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 2, gestationDays: 3, matureDays: 6, cooldownDays: 6, juvenileScale: 0.4, young: "hatchling", youngPlural: "hatchlings" },
    names: ["Cinder", "Slag", "Pumice", "Ember", "Obsidian", "Clinker", "Basil", "Tuff", "Magma", "Scoria", "Ash", "Flint", "Smoky", "Kiln", "Coal", "Rocky"],
  },
  "zoocraft:ember_fox": {
    id: "zoocraft:ember_fox",
    displayName: "Ember Fox",
    plural: "Ember Foxes",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_ember_fox",
    entityType: "zoocraft:ember_fox",
    family: "ember_fox",
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    dietTags: ["ember"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:ember_ration",
    observe: ["spot", "sniff", "prowl"],
    where: "Soul sand valleys and crimson forests in the Nether, trotting over soul soil",
    // A pair and a litter (0.1.81: below that, the first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: false },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator, or comfort stays low and after
    // the recovery window it goes to recovery holding.
    heat: true,
    // Spec 5.3: "Digs warm ash and curls in heated den | Ash bed, den, heat supply".
    ash: { minCells: 4 },
    den: true,
    // Like the Basalt Tortoise, it drinks lava from a Lava Trough.
    drinksLava: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "manipulate", "dig"],
    // Its favourite toy: a Blaze Bone to chew and bury in the ash.
    toys: ["bone"],
    coats: ["Charcoal"],
    breeding: { litter: 3, gestationDays: 3, matureDays: 5, cooldownDays: 6, juvenileScale: 0.5, young: "kit", youngPlural: "kits" },
    names: ["Sooty", "Flicker", "Kindle", "Scorch", "Tinder", "Wick", "Blaze", "Smudge", "Sizzle", "Charcoal", "Pepper", "Toast", "Spark", "Ashby", "Glow", "Fennel"],
  },
  "zoocraft:lava_ray": {
    id: "zoocraft:lava_ray",
    displayName: "Lava Ray",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_lava_ray",
    entityType: "zoocraft:lava_ray",
    family: "lava_ray",
    movementProfile: "lava",
    habitatProfile: "lava_pool",
    dietTags: ["plankton"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:molten_plankton",
    observe: ["spot", "glide", "drift"],
    where: "Lava lakes in basalt deltas and the Nether wastes, gliding just under the surface",
    // A pair and a litter (0.1.81: below that, the first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // Spec 5.3: it swims in lava (a lava pool counts as its space; see exhibits/geometry.js swimLava).
    // The lava keeps it warm, so it needs no Thermal Regulator, and it drinks nothing else.
    lavaSwimmer: true,
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    coats: ["Ember"],
    breeding: { litter: 2, gestationDays: 3, matureDays: 6, cooldownDays: 6, juvenileScale: 0.45, young: "pup", youngPlural: "pups" },
    names: ["Cinder", "Glimmer", "Molten", "Ripple", "Flare", "Ashwing", "Ignis", "Lumen", "Sear", "Drift", "Magmar", "Kindle", "Ember", "Glow", "Coral", "Smolder"],
  },
  "zoocraft:zoo_strider": {
    id: "zoocraft:zoo_strider",
    displayName: "Strider",
    origin: "vanilla",
    homeDimension: "minecraft:nether",
    wildSource: "minecraft:strider", // catching a wild strider creates this species
    entityType: "zoocraft:zoo_strider",
    family: "strider",
    movementProfile: "lava_walker",
    habitatProfile: "lava_shore",
    dietTags: ["fungus"],
    carrierProfile: "thermal",
    baitItem: "minecraft:warped_fungus",
    observe: ["spot", "stride", "ashore"],
    where: "Lava seas all over the Nether, walking across the lava; they shiver and turn purple when they step ashore",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    // It walks on lava (a lava pool counts as its space, see exhibits/geometry.js swimLava) and the lava
    // keeps it warm, so it needs no Thermal Regulator and drinks nothing else.
    lavaWalker: true,
    // Warm resting spots (spec 5.1): magma blocks on the bank. On lava or magma it's warm; anywhere
    // else it shivers (the vanilla cold look).
    bask: { minCells: 4, rest: true },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    coats: ["Crimson"],
    breeding: { litter: 1, gestationDays: 2, matureDays: 4, cooldownDays: 4, juvenileScale: 0.5, young: "baby strider", youngPlural: "baby striders" },
    names: ["Stilts", "Wobble", "Crimson", "Toasty", "Lanky", "Fungo", "Scorch", "Warp", "Sizzle", "Basalt", "Wade", "Ember", "Shiver", "Magma", "Tiptoe", "Pudding"],
  },
  "zoocraft:chorus_deer": {
    id: "zoocraft:chorus_deer",
    displayName: "Chorus Deer",
    plural: "Chorus Deer",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_chorus_deer",
    entityType: "zoocraft:chorus_deer",
    family: "chorus_deer", // the mob family the Field Journal counts as its herd
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    dietTags: ["chorus"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "browse", "herd"],
    where: "The outer End islands, in small herds among the chorus plants. They keep away unless you sneak or hold food",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    // Quiet retreat (spec 5.4): trees, chorus plants or a roof over part of the ground.
    cover: { minFraction: 0.1 },
    // End ground (spec 5.4 "End ground | vanilla end stone"): end stone in the exhibit floor, or comfort
    // stays low.
    endGround: { minCells: 8 },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Lavender (the common coat), 1 Dusk (deep violet, starry flecks).
    coats: ["Lavender", "Dusk"],
    // Breeding (spec section 9): young per birth, park days expecting, park days to grow up, rest
    // after a birth, and how big the young look next to an adult.
    breeding: { litter: 1, gestationDays: 3, matureDays: 4, cooldownDays: 5, juvenileScale: 0.55, young: "fawn", youngPlural: "fawns" },
    names: ["Chorus", "Echo", "Lilac", "Violet", "Pearl", "Nova", "Wisp", "Hollow", "Drift", "Twilight", "Aster", "Iris", "Mauve", "Orchid", "Rift", "Lumen"],
  },
  "zoocraft:void_ray": {
    id: "zoocraft:void_ray",
    displayName: "Void Ray",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_void_ray",
    entityType: "zoocraft:void_ray",
    family: "void_ray",
    movementProfile: "aerial",
    habitatProfile: "large_aerial",
    flies: true, // steered through the air by animals/flight.js; the exhibit is measured by floodAerial
    dietTags: ["chorus"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "soar", "loop"],
    where: "High over the outer End islands and around End Cities, gliding in slow arcs. Hold Chorus Browse and one comes down to hover over you; keep feeding it and it may let you ride it",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: true },
    endGround: { minCells: 16 },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    coats: ["Void", "Nebula"],
    breeding: { litter: 1, gestationDays: 4, matureDays: 4, cooldownDays: 6, juvenileScale: 0.5, young: "pup", youngPlural: "pups" },
    names: ["Umbra", "Nebula", "Comet", "Zephyr", "Halo", "Eclipse", "Vesper", "Aurora", "Quasar", "Nimbus", "Sable", "Stardust", "Lyra", "Orion", "Mist", "Glimmer"],
  },
  "zoocraft:rift_ferret": {
    id: "zoocraft:rift_ferret",
    displayName: "Rift Ferret",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_rift_ferret",
    entityType: "zoocraft:rift_ferret",
    family: "rift_ferret",
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    dietTags: ["chorus"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "blink", "peer"],
    where: "The outer End islands, nosing about the end stone alone or in pairs. One blinks away through a rift when you come close, unless you sneak or hold Chorus Browse",
    // A pair and a litter (0.1.81: below that, the first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: true },
    endGround: { minCells: 6 },
    // Spec 5.4: "Short puzzle-route teleports | Active containment anchor, hiding tunnels". A charged
    // Containment Anchor keeps its blinks inside the exhibit (animals/rift.js); without one it doesn't
    // blink and is unsettled. Rift Tunnels on the floor are its route and its hiding places.
    anchor: true,
    tunnels: { min: 2 },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "manipulate", "dig"],
    // Coat comes from minecraft:variant: 0 Twilight (the common coat), 1 Moonlit (pale, magenta shimmer).
    coats: ["Twilight", "Moonlit"],
    breeding: { litter: 3, gestationDays: 3, matureDays: 4, cooldownDays: 5, juvenileScale: 0.5, young: "kit", youngPlural: "kits" },
    names: ["Blink", "Flicker", "Scamper", "Portal", "Pip", "Wisp", "Ripple", "Vex", "Nimble", "Quill", "Dash", "Fidget", "Shimmer", "Zip", "Mote", "Skitter"],
  },
  "zoocraft:raccoon": {
    id: "zoocraft:raccoon",
    displayName: "Raccoon",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_raccoon",
    entityType: "zoocraft:raccoon",
    family: "raccoon",
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    // It eats nearly anything: Fruit Rations (apples, berries, melon), Insect Rations or Fish Rations.
    dietTags: ["fruit", "insect", "fish"],
    carrierProfile: "small",
    baitItem: "zoocraft:fruit_ration",
    observe: ["spot", "climb", "wash"],
    where: "Forests, swamps and riversides, out at night: up the trees, washing food at the water's edge, and raiding Litter Bins that have no latch. Hold a Fruit Ration and one comes to you",
    // A pair and a litter (0.1.81: below that, the first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: false },
    // Spec 5.x: "Manipulates puzzle feeders | Climbing; attracted to unsecured bins". It climbs out of
    // an exhibit that isn't climb-proof (climbs), wants a climbing tree or a Climbing Frame (climbTree)
    // and water to wash its food in (wash), and works a stocked Puzzle Feeder (manipulate).
    climbs: true,
    climbTree: true,
    wash: { minCells: 1 },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["manipulate", "climb", "forage"],
    // Coat comes from minecraft:variant: 0 Grey (the common coat), 1 Cinnamon (warm brown, rarer).
    coats: ["Grey", "Cinnamon"],
    breeding: { litter: 3, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.5, young: "kit", youngPlural: "kits" },
    names: ["Bandit", "Rascal", "Ringo", "Mischief", "Pepper", "Smudge", "Socks", "Nibbles", "Rummage", "Scout", "Juniper", "Mango", "Pickles", "Zorro", "Maple", "Tumble"],
  },
  "zoocraft:flamingo": {
    id: "zoocraft:flamingo",
    displayName: "Flamingo",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_flamingo",
    entityType: "zoocraft:flamingo",
    family: "flamingo",
    movementProfile: "amphibious",
    habitatProfile: "wading",
    // Flamingo Pellets keep them pink (pink, below); Insect Rations feed them but don't.
    dietTags: ["pellet", "insect"],
    carrierProfile: "small",
    baitItem: "zoocraft:flamingo_pellets",
    observe: ["spot", "filter", "oneleg", "display"],
    where: "Mangrove swamps, swamps and warm beaches, in flocks by day: wading in the shallows, filter feeding with their heads upside down, and resting on one leg. A wild flock walks away from anyone who isn't sneaking or holding Flamingo Pellets",
    social: { minGroup: 3, recommendedMax: 16, prefersCompany: true },
    // Spec 5.2: "Flock wading | Shallow water and mud nesting". They wade in the shallows (wades: the
    // wading profile's shallows), get their pink from their food (pink: Flamingo Pellets, or they fade)
    // and nest only in a flock of nest.flock grown-ups (each Flock Mirror counts as nest.mirrorBirds
    // more, up to twice the flock), every grown-up rosy, on mud at the water's edge (nest.sites or more).
    wades: true,
    pink: true,
    nest: { flock: 6, sites: 2, mirrorBirds: 2 },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["swim", "forage"],
    coats: ["Greater"],
    // One egg: a park day building the nest, then two sitting on the egg in turns. The chick is grey.
    breeding: { litter: 1, gestationDays: 3, matureDays: 4, cooldownDays: 4, juvenileScale: 0.4, young: "chick", youngPlural: "chicks" },
    names: ["Rosa", "Coral", "Blush", "Peaches", "Flossie", "Paloma", "Sorbet", "Petal", "Carmen", "Lola", "Bubblegum", "Shrimp", "Sunset", "Guava", "Flora", "Rosita"],
  },
  "zoocraft:zebra": {
    id: "zoocraft:zebra",
    displayName: "Zebra",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_zebra",
    entityType: "zoocraft:zebra",
    family: "zebra",
    movementProfile: "terrestrial",
    habitatProfile: "grassland",
    // Grain Rations (hay with a little grain), from a Basic Feeder or a Hay Rack (rack, below).
    dietTags: ["grain"],
    carrierProfile: "livestock",
    baitItem: "zoocraft:grain_ration",
    observe: ["spot", "graze", "file", "groom"],
    where: "Savannas, in herds by day: grazing spread out, walking off in single file, and galloping away from anyone who runs at them. A wild herd moves off from anyone who isn't sneaking or holding a Grain Ration",
    social: { minGroup: 3, recommendedMax: 10, prefersCompany: true },
    // Spec 5.2: "Coordinated herd movement | Savanna mixing and broad grazing". They graze (graze:
    // perAnimal grass blocks in the floor for each give them up to `share` of their food), live in harems
    // (harem: one stallion with the mares and foals, other stallions in a bachelor group), eat from a Hay
    // Rack (rack) and feed in rank order (feedRank: with too few feeding places the low-ranking ones get
    // pushed off). animals/zebra.js, animals/zebraRules.js.
    graze: { perAnimal: 30, share: 0.5 },
    harem: true,
    rack: true,
    feedRank: true,
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage", "manipulate"],
    // Coat comes from minecraft:variant: 0 Burchell's (the southern form: brown shadow stripes, paler
    // lower legs), 1 Grant's (the northern form: crisp black and white down to the hooves). Foals are brown.
    coats: ["Burchell's", "Grant's"],
    // One foal after a long wait; it grows up slowly.
    breeding: { litter: 1, gestationDays: 4, matureDays: 5, cooldownDays: 6, juvenileScale: 0.6, young: "foal", youngPlural: "foals" },
    names: ["Ziggy", "Stripes", "Zola", "Duma", "Jabari", "Amani", "Imani", "Baraka", "Dazzle", "Barcode", "Tamu", "Kesi", "Zebedee", "Pinstripe", "Humbug", "Zigzag"],
  },
  "zoocraft:lion": {
    id: "zoocraft:lion",
    displayName: "Lion",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_lion",
    entityType: "zoocraft:lion",
    family: "lion",
    movementProfile: "terrestrial",
    habitatProfile: "pride",
    // Meat Rations (zoos feed a meat mix, bones and whole prey), from a Basic Feeder.
    dietTags: ["meat"],
    carrierProfile: "large",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "pile", "scent", "roar"],
    where: "Savannas, in prides: lying up in the shade most of the day, hunting at dusk, through the night and at dawn. Very dangerous: a wild pride stalks anyone it spots and charges. Throw a Meat Ration down near one: while it eats it's calm, and can be crated",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    // Spec 5.2: "Pride rest and scent investigation | Group dens, secure service access". dangerous: the
    // keepers' rules and the danger to players (animals/predators.js); dens: a Holding Den for each grown
    // lion and `spare` more (three dens for two cats); fasts: one park day in seven without food; ledge: a
    // raised place to rest for each (BALANCE.lion.ledgePerLion); manes: the males' mane, light or dark
    // (their mark_variant); shade over part of the ground (cover). animals/lion.js, animals/lionRules.js.
    dangerous: true,
    dens: { spare: 1 },
    fasts: true,
    ledge: true,
    manes: true,
    cover: { minFraction: 0.1, why: "shade" },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["scent", "manipulate", "forage"],
    // Coat comes from minecraft:variant: 0 a lioness, 1 a lion (the maned male). The mane is its own mark.
    coats: ["Lioness", "Lion"],
    sexByCoat: ["female", "male"],
    // 1 to 3 cubs (litterMax) after a few park days; cubs grow up slowly, in the pride's care.
    breeding: { litter: 1, litterMax: 3, gestationDays: 3, matureDays: 6, cooldownDays: 6, juvenileScale: 0.48, young: "cub", youngPlural: "cubs" },
    sounds: { warn: "mob.polarbear.warning", warnPitch: 0.55, swipe: "mob.ravager.bite", swipePitch: 0.9 },
    names: ["Simba", "Dhahabu", "Asha", "Imara", "Malaika", "Jasiri", "Tau", "Subira", "Shani", "Bahati", "Zawadi", "Jabali", "Neema", "Sefu", "Kesho", "Ayo"],
  },
  "zoocraft:tiger": {
    id: "zoocraft:tiger",
    displayName: "Tiger",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_tiger",
    entityType: "zoocraft:tiger",
    family: "tiger",
    movementProfile: "terrestrial",
    habitatProfile: "tiger",
    // Meat Rations (zoos feed a meat mix, bones and whole prey), from a Basic Feeder.
    dietTags: ["meat"],
    carrierProfile: "large",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "mark", "swim", "ambush"],
    where: "Jungles (Bengal tigers) and cold taigas (Amur tigers), alone: resting by day, patrolling and marking at dusk and by night, swimming in the heat. Very dangerous: one creeps up behind anyone it spots and rushes them; it freezes when you look at it. Throw a Meat Ration down near one: while it eats it's calm, and can be crated",
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: false },
    // Spec 5.2: "Solitary patrolling and swimming | Privacy and separate adult territories". dangerous: the
    // keepers' rules and the danger to players (animals/predators.js); dens: a Holding Den each (spare 0),
    // a tigress's cubs going in with her (cubsFollow); fasts: one park day in seven without food;
    // solitary: one grown tiger loose at a time, the turns; privacy: screened floor to get out of sight
    // (BALANCE.tiger.screenPerTiger); patterns: 3 stripe patterns a coat (minecraft:skin_id); sexLook: the
    // male's size and ruff (minecraft:mark_variant 1); shade over part of the ground (cover).
    // Happy alone; an exhibit holds up to 5 (a pair and their cubs, say), one grown tiger (or a tigress
    // and her cubs) out at a time, the others taking turns in their dens.
    dangerous: true,
    dens: { spare: 0, cubsFollow: true },
    fasts: true,
    solitary: true,
    privacy: true,
    patterns: 3,
    sexLook: true,
    cover: { minFraction: 0.1, why: "shade" },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["scent", "manipulate", "swim"],
    // Coat comes from minecraft:variant: 0 a Bengal tiger (deep orange, black stripes), 1 an Amur tiger
    // (paler and longer-furred, brown-black stripes spaced wider).
    coats: ["Bengal", "Amur"],
    // 1 to 3 cubs (litterMax) after an introduction day; cubs stay with their mother a long while.
    breeding: { litter: 1, litterMax: 3, gestationDays: 3, matureDays: 8, cooldownDays: 8, juvenileScale: 0.45, young: "cub", youngPlural: "cubs" },
    sounds: { warn: "mob.cat.hiss", warnPitch: 0.45, swipe: "mob.ravager.bite", swipePitch: 0.95 },
    names: ["Raja", "Mira", "Kavi", "Sundari", "Bagha", "Tara", "Arjun", "Rani", "Shere", "Leela", "Vikram", "Ishani", "Bodhi", "Nisha", "Rudra", "Sasha", "Yuri", "Anya", "Dasha", "Misha"],
  },
  "zoocraft:crocodile": {
    id: "zoocraft:crocodile",
    displayName: "Crocodile",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_crocodile",
    entityType: "zoocraft:crocodile",
    family: "crocodile",
    movementProfile: "amphibious",
    habitatProfile: "crocodile",
    // Meat Rations (zoos feed whole prey and meat, about once a week), from a Basic Feeder.
    dietTags: ["meat"],
    carrierProfile: "large",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "gape", "roll", "lurk"],
    where: "Swamps and mangrove swamps, one or two together: lurking in the water with only the eyes showing, basking on the bank by day. Very dangerous: one lunges out of the water at anyone near the edge, drags them in and rolls (hit it to make it let go), and you can't outswim one. Throw a Meat Ration down near one: while it eats it's calm, and can be crated",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // Spec 5.2: "Basking and submerged resting | Secure keeper access, shore clearance". dangerous: the
    // keepers' rules and the danger to players (animals/predators.js); dens: a Holding Den for each grown one
    // (the young stay out: they're no danger); basks: a sunny basking bank in size order
    // (BALANCE.croc.bankPerCroc each); submerges: deep water for all to go under at once; shoreClear: keepers go
    // in only with the water's edge clear and the inner Keeper Gate back from it; meals: a grown one eats about
    // once a week (its satiety drains at a seventh of the rate, and it eats when it's down to 75); rank: the
    // biggest first at the food and on the bank; sizes: 5 size classes (zoocraft:size), a male a third bigger
    // (sexLook: minecraft:mark_variant 1); patterns: 3 tail crests (minecraft:skin_id: Bouwman and Cronje 2016
    // tell wild ones apart by them); sandNest: she digs a nest in sand near the water, and its warmth sets the
    // hatchlings' sex (tsd). Shade over part of the ground (cover: SA DENR, "shade for all").
    dangerous: true,
    dens: { spare: 0 },
    basks: true,
    submerges: true,
    shoreClear: true,
    meals: { every: 7, at: 75 },
    rank: true,
    sizes: 5,
    sexLook: true,
    patterns: 3,
    sandNest: { sites: 1, tsd: true },
    cover: { minFraction: 0.1, why: "shade" },
    dangerMoves: "warn anyone inside their exhibit (reared up, puffed, the jaws wide, hissing), then charge and snap sideways",
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage", "swim"],
    // One coat, the Nile crocodile's: dark olive-bronze with faded cross-bands, the young greener and boldly banded.
    coats: ["Nile"],
    // 2 to 4 hatchlings (the ones that make it: real clutches are 25 to 80 eggs) after the incubation in the
    // sand nest; most nest every 2 to 3 years.
    breeding: { litter: 2, litterMax: 4, gestationDays: 4, matureDays: 10, cooldownDays: 12, juvenileScale: 0.1, young: "hatchling", youngPlural: "hatchlings" },
    sounds: { warn: "mob.cat.hiss", warnPitch: 0.35, swipe: "mob.ravager.bite", swipePitch: 0.8 },
    names: ["Kubwa", "Mara", "Gena", "Nkosi", "Sobek", "Ayana", "Ziwa", "Mamba", "Ramla", "Khufu", "Nefer", "Nia", "Sadiki", "Lulu", "Gugu", "Pili", "Tumo", "Sefa"],
  },
  "zoocraft:red_panda": {
    id: "zoocraft:red_panda",
    displayName: "Red Panda",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_red_panda",
    entityType: "zoocraft:red_panda",
    family: "red_panda",
    movementProfile: "terrestrial",
    habitatProfile: "arboreal",
    // Bamboo, offered freely in zoos (the AZA manual): Leafy Rations.
    dietTags: ["leafy"],
    carrierProfile: "small",
    baitItem: "zoocraft:leafy_ration",
    observe: ["spot", "headfirst", "drape", "tailwrap"],
    where: "Bamboo jungles, one or two together, out at dawn and dusk: up in the trees, draped over a branch through the day. A wild one goes up a tree when someone comes near; hold a Leafy Ration and one comes to you",
    // A mother with her cubs (0.1.81: at 2, a pair's first litter could never come: "the group is full").
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // Spec 5.2: it climbs out of an exhibit that isn't climb-proof (climbs) and wants something to climb
    // (climbTree), as the raccoon does; it travels and rests up on the canopy, which has to be reached from a
    // trunk (canopy: balance.redpanda.canopyPer blocks for each); it sleeps in a Nest Box (nestBox, one each); in
    // a hot biome it needs shade (heatShade).
    climbs: true,
    climbTree: true,
    canopy: true,
    nestBox: true,
    heatShade: true,
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["climb", "forage"],
    // One coat, the western (Himalayan) red panda's; the cubs are born buff-grey and turn red as they grow.
    coats: ["Western"],
    // Usually 2 cubs, 1 to 4 (SDZ); born in the Nest Box and staying in it their first park day.
    breeding: { litter: 2, litterMax: 3, gestationDays: 3, matureDays: 3, cooldownDays: 5, juvenileScale: 0.35, young: "cub", youngPlural: "cubs" },
    names: ["Momo", "Ginger", "Pabu", "Rusty", "Bamboo", "Sherpa", "Tashi", "Nima", "Kesar", "Pemba", "Mishka", "Tenzin", "Chestnut", "Russet", "Saffron", "Cinnamon"],
  },
  "zoocraft:gorilla": {
    id: "zoocraft:gorilla",
    displayName: "Gorilla",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_gorilla",
    entityType: "zoocraft:gorilla",
    family: "gorilla",
    movementProfile: "terrestrial",
    habitatProfile: "troop",
    // Browse and leaves (EAZA 2024: vegetables, browse and pellets; little fruit): Leafy Rations, and Fruit
    // Rations (the items list's gorilla food), which bait a wild one.
    dietTags: ["leafy", "fruit"],
    carrierProfile: "large",
    baitItem: "zoocraft:fruit_ration",
    observe: ["spot", "chestbeat", "nightnest", "picking"],
    where: "Jungles, in troops: one silverback with his females and young, feeding by day and building nests of branches to sleep in at dusk. Come close and the silverback warns you off, beating his chest; keep coming and he charges. Throw a Fruit Ration down near one: while it eats it can be crated",
    social: { minGroup: 2, recommendedMax: 10, prefersCompany: true },
    // Spec 5.2: dangerous: the keepers' rules and the danger to players (animals/predators.js); dens: a
    // Holding Den each, an infant going in with its mother (cubsFollow); troop: one silverback (two with the
    // females fight, as zebra stallions do; a bachelor group is fine); ape: strong walls, the ape measure
    // (exhibits/geometry.js floodApe: they climb trees, frames and fences and reach up 3.5 blocks); noSwim:
    // deep water is a danger; climbTree: something to climb; sexLook: the silverback's size, saddle and crest
    // (minecraft:mark_variant 1).
    dangerous: true,
    dens: { spare: 0, cubsFollow: true },
    dangerMoves: "warn anyone inside their exhibit (up on the legs, beating the chest), then charge and shove",
    troop: true,
    ape: true,
    noSwim: true,
    climbTree: true,
    sexLook: true,
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["climb", "forage", "manipulate"],
    // One coat, the western lowland gorilla's: black-brown, a reddish crown, a silverback's silver saddle.
    coats: ["Western lowland"],
    // One infant (twins are rare), carried on its mother's back; slow to grow up, a long while between births.
    breeding: { litter: 1, gestationDays: 4, matureDays: 8, cooldownDays: 10, juvenileScale: 0.4, young: "infant", youngPlural: "infants" },
    sounds: { warn: "mob.polarbear.warning", warnPitch: 0.75, swipe: "mob.irongolem.throw", swipePitch: 0.8 },
    names: ["Kumbuka", "Ndume", "Kouillou", "Ozala", "Shufai", "Moja", "Lope", "Bakari", "Mekili", "Mbeli", "Tumani", "Nyota", "Sango", "Kwame", "Asali", "Djala"],
  },
  "zoocraft:owl": {
    id: "zoocraft:owl",
    displayName: "Owl",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_owl",
    entityType: "zoocraft:owl",
    family: "owl",
    movementProfile: "aerial",
    habitatProfile: "aviary",
    flies: true, // steered through the air by animals/owl.js; the aviary is measured by floodAerial
    // Whole prey (AZA 2019: mice, rats, rabbits, quail, chicks): Meat Rations, which tempt a wild one down.
    dietTags: ["meat"],
    carrierProfile: "small",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "hoot", "pounce", "pellet"],
    where: "Taiga, dark forest and windswept hills, alone or a pair: roosting in a treetop by day, hooting at dusk and flying from tree to tree at night. Hold a Meat Ration and one comes down to land by you",
    // A pair shares an aviary and stays together (AZA 2019), with their young: up to 5 (a pair and 3 owlets).
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: true },
    // Spec 5.2: perches at varied heights (roosts: Perches, the fixture "roost", 2 or more apart in height for
    // comfort); the sexes look alike but the female is bigger (sexLook: a male is minecraft:mark_variant 1, drawn
    // at 0.88 of her).
    roosts: true,
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // One coat, the eagle-owl's: tawny, streaked dark, the ear tufts and orange eyes; owlets in grey-buff down.
    coats: ["Eagle-owl"],
    // Usually 2 eggs (up to 3 here; 1 to 4, König & Weick 2008), laid only in a Nest Box (nestBox) and sat on by the
    // female; the owlets stay in the box their first park days (balance.owl.nestDays).
    breeding: { litter: 2, litterMax: 3, gestationDays: 3, matureDays: 6, cooldownDays: 8, juvenileScale: 0.6, young: "owlet", youngPlural: "owlets", nestBox: true },
    names: ["Bubo", "Strix", "Hoolet", "Duskwing", "Fenwick", "Ural", "Eyrie", "Gloaming", "Corvin", "Moonbeam", "Nightjar", "Barnaby", "Talon", "Oakley", "Tawny", "Midnight"],
  },
  "zoocraft:crimson_grazer": {
    id: "zoocraft:crimson_grazer",
    displayName: "Crimson Grazer",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_crimson_grazer",
    entityType: "zoocraft:crimson_grazer",
    family: "crimson_grazer",
    movementProfile: "terrestrial",
    habitatProfile: "herd",
    // Fungal Rations (crimson and warped fungus with nether wart; items list "Fungal Ration | Crimson Grazer,
    // mooshrooms | Crimson and warped fungus"), or plain warped fungus, from a Basic Feeder.
    dietTags: ["fungus"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:fungal_ration",
    observe: ["spot", "ring", "rub", "cud"],
    where: "Crimson forests in the Nether, in herds of 3 to 5 on the crimson nylium. Come near and the herd forms a ring, horns out, and a bull rushes at you and stops short; hurt one and he means it. Hold a Fungal Ration and they let you close",
    // Musk oxen live in herds of 8 to 24; 3 to 8 fits an exhibit. Alone or in twos they're uneasy.
    social: { minGroup: 3, recommendedMax: 8, prefersCompany: true },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator, or comfort stays low and after the recovery
    // window it goes to recovery holding. Crimson ground: balance.grazer.nyliumCells crimson nylium blocks in the
    // floor (nylium); a crimson stem or hyphae beside the floor to rub on (rubStem); herd shelter: trees or a roof
    // over a tenth of the floor (cover). Spec 5.3: "Crimson ground, fungal feed, herd shelter".
    heat: true,
    nylium: true,
    rubStem: true,
    cover: { minFraction: 0.1, why: "herd shelter" },
    // A bull is bigger, with the heavy boss across his brow (minecraft:mark_variant 1).
    sexLook: true,
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // One coat: a crimson-maroon hide, a shaggy dark mane, a pale shroomlight-yellow muzzle, fungus caps on the shoulders.
    coats: ["Crimson"],
    // One calf after a long wait (musk ox: 8 months), slow to grow.
    breeding: { litter: 1, gestationDays: 4, matureDays: 8, cooldownDays: 8, juvenileScale: 0.4, young: "calf", youngPlural: "calves" },
    names: ["Grumble", "Thatch", "Mossback", "Porcini", "Cobble", "Burl", "Morel", "Toadstool", "Hob", "Hummock", "Bristle", "Crumpet", "Wart", "Nylon", "Shroom", "Stomp"],
  },
};

// Lava Rays swim in lava, Striders walk across it: either way the lava pool is their home.
export function livesOnLava(species) {
  return Boolean(species?.lavaSwimmer || species?.lavaWalker);
}

// "Otters", "Deer": the display name for more than one.
export function pluralOf(species) {
  return species.plural ?? `${species.displayName}s`;
}

export function speciesForWild(typeId) {
  return Object.values(SPECIES).find((s) => s.wildSource === typeId);
}

export function speciesForEntity(typeId) {
  return Object.values(SPECIES).find((s) => s.entityType === typeId);
}
