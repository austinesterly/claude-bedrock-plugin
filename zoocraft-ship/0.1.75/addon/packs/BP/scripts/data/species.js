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
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
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
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
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
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
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
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: true },
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
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
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
