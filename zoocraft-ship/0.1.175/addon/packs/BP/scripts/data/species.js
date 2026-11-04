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
// The Warped Gecko (0.1.85, the Nether trio; spec 5.3 "Blue-green luminous climber | Wall clinging and vertical
// hunting | Registered climbing surfaces and insect feed") is a fantasy gecko built on the New Caledonian giant
// gecko: it climbs walls and glass (species.clings: the exhibit is measured for its walls and needs a roof), hides
// in a crack or a Burrow Shelter by day and is up at night (nightLife), hunts the moths an Insect Feeder lets out
// (insectFeeder), and keeps one grown male to an exhibit (oneMale). animals/gecko.js.
// The Cinder Boar (0.1.87, the Nether trio; spec 5.3 "Ash-colored rooting animal | Digs and uses cooling mud pockets |
// Ash, thermal mud, strong barrier") is a fantasy boar built on the wild boar: it roots in Warm Ash (ash), wallows in
// Thermal Mud in the heat (species.wallow), breaks through wooden fences, gates and doors (species.boarProof: the boar
// measure), lives in sounders of sows and piglets with one grown boar (oneMale), and a sow defends her piglets.
// animals/boar.js.
// The Soul Moth (0.1.88, the Nether pair; spec 5.3 "Pale blue moth | Gathers around soul light | Enclosed airspace,
// soul lights, nectar") is a fantasy hawk moth, drawn big (Austin's "Big moth"): it flies in a roofed moth house (the
// flight measure), circles soul light (species.soulLight), sips nectar from a Nectar Feeder (nectarFeeder), rests on a
// wall by day and flies at night (nightLife; soul light counts as dark, houseLight), and its young are caterpillars that
// eat host plants and lie in the floor as a pupa (breeding.hostPlants, pupaDays). animals/moth.js.
// The Quartz Beetle (0.1.89, the Nether pair; spec 5.3 "Chunky beetle with quartz plates | Burrows through mineral
// substrate | Heated cave, mineral bed") is a fantasy rhinoceros beetle, drawn big (Austin's "Big beetle"): it lives
// in a cave (a roof over the floor, species.cover), lies buried by day in Mineral Substrate (species.substrate, the
// walking measure's count), walks at night (nightLife), and two males that meet wrestle; its young are grubs that live
// and feed in the substrate and pupate in it (breeding.substrate, pupaDays). animals/beetle.js.
// The End Hopper (0.1.91, the End trio; spec 5.4 "Small creature with long angular legs | High jumps between platforms |
// Jump clearance, roof, landing pads") is a fantasy springhare with a jerboa's long angular hind legs, life-size (about
// a rabbit's): it leaps from Landing Pad to Landing Pad (species.pads: the jump measure counts them), so its exhibit
// needs a roof (species.hops: the jump measure's flood through the air mustn't lead out); in the wild it gets away from
// someone close in zigzag darts. animals/hopper.js.
// The Shimmer Snail (0.1.92, the End trio; spec 5.4 "Pale body, pearlescent spiral shell | Leaves a fading luminous
// trail | Mineral bed, shade, crevices") is a fantasy giant land snail, drawn big (three quarters of a block crawling):
// the rock snails' crevices to rest in (species.crevices: the crevice measure counts them) and their grazing of the rock
// (species.mineralBed: Mineral Substrate in the floor), Quantula's glowing foot and trail, and the giant African land
// snail's bouts, sealed rest and eggs laid in the ground (breeding.eggBed). A hermaphrodite: any two can pair
// (species.hermaphrodite, animals/breeding.js). animals/snail.js.
// The Obsidian Crab (0.1.93, the End trio; spec 5.4 "Low armored black shell | Scrapes minerals and digs | Rocky cave,
// mineral feeder, substrate") is a fantasy coconut crab (its size, its burrow plugged with its big claw, its nose for
// food, alone) drawn as a true crab, low and wide and walking sideways: the rock crabs' scraping of bare rock
// (species.rockFaces: the rock measure counts the faces), the sand crabs' digging in backwards (species.burrows: Mineral
// Substrate in the floor), Mineral Pellets from a Mineral Feeder only (species.mineralFeeder). The mother carries her
// eggs under her tail (breeding.carried). animals/crab.js.
// The Chorus Moth (0.1.94, the End pair; spec 5.4 "Purple angular wings | Hovers around chorus flowers | Flight space,
// chorus nectar, low light") is a fantasy elephant hawk-moth, drawn big: it flies in a roofed moth house (the Soul
// Moth's profile), hovers at chorus flowers to sip (species.chorusFlowers: the chorus measure counts them), takes
// Nectar Rations from a Nectar Feeder (nectarFeeder), and keeps its bouts at any hour in a dim house (lowLight: the
// nocturnal house's test), only at night in a bright one. Its caterpillars eat chorus on the floor and lie in it as a
// pupa (breeding.hostPlants, hostText, pupaDays). animals/chorusMoth.js.
// The Starback Tortoise (0.1.95, the End pair; spec 5.4 "Dark shell with star-like markings | Slow browsing and resting
// | End vegetation, warm pad, large retreat") is a fantasy Indian star tortoise, drawn big: it keeps to bouts, resting
// under a low roof (species.retreat), basking on a Warm Pad till it's warm (warmPads), then browsing the chorus standing
// on the floor (endPlants: the tortoise measure counts all three). She digs her nest in the Mineral Substrate
// (substrateNest, breeding.eggBed, breeding.nestDig). animals/starback.js.
// The Lush Okapi (0.1.137, the cave wing; research/cave_plan.md) is a real okapi at real size, found in lush caves: it
// browses the lush plants beside its floor with its long tongue (species.lushGround: moss in the floor and lush plants
// to browse, which the okapi measure counts; part of its food), licks clay (clayLick), eats Leafy Rations from a Basic
// Feeder or an Elevated Browse Feeder (browsesEither), keeps one grown male to an exhibit (oneMale; his ossicones:
// sexLook), and its calf lies hidden its first park day (hiddenCalf). A Reinforced Crate carries one after Cave
// Expeditions research (species.research). animals/okapi.js.
// The Earth Molebear (0.1.138, the cave wing) is a fantasy animal at a black bear's size, with a mole's spade hands and
// velvet coat and a star-nosed mole's star, found in ordinary caves below y 0: it tunnels into Burrow Soil beside its
// floor, and only that (species.burrowSoil: the molebear measure counts the soil and the faces it can dig; grubs it digs
// up are part of its food), and eats Insect Rations. A Reinforced Crate carries one after Cave Expeditions research.
// animals/molebear.js.
// The Skulker (0.1.139, the cave wing) is a fantasy animal of the deep dark, the warden's shape and senses but gentle,
// 1.9 blocks tall: blind, it hears someone moving near without sneaking and walks over to sniff them. It lives in the
// dark (lowLight: the nocturnal house's test, no daylight and nothing brighter than light 7), on a sculk floor
// (species.sculkFloor: the skulker measure counts the sculk and any shrieker, which frightens it), and eats Insect
// Rations. Its ribs, heart and tendrils glow, so guests see it in the dark (glows). A Reinforced Crate carries one after
// Cave Expeditions research. animals/skulker.js; its Ancient Cities animals/ancientCityRules.js.
// The Unicorn (0.1.149, module 9: the Mythical Glade) is a fantasy animal on a light riding horse's frame and at its
// size, with a long spiral horn that glows faintly: a grazer (species.graze, as the zebra) that eats from a Hay Rack too
// and needs the glade's glowing flowers on its floor (species.gladeFlowers: the unicorn measure counts them, and the
// floor cells with water beside them, where it dips its horn). Herds of 2 to 6; a Livestock Crate carries one.
// animals/unicorn.js.
// The Dragon (0.1.150, module 9; wild in the Lava Falls since 0.1.156) is the great flier of the Nether's caverns: four legs and a pair of great wings, about 7 blocks nose to
// tail with an 11-block span. It flies round a great hall (great_aerial: roofed over, 16 blocks of air) and lands on its
// floor, so it needs no perches; it basks by a lit campfire on the floor (species.warmth: the dragon measure counts
// them), roars and breathes a stream of fire (particles only). Alone or a few together; a Reinforced Crate carries one.
// animals/dragon.js.
// The Griffin (0.1.151, module 9): a lion's body with an eagle's head, wings and forelegs, about 4.5 blocks nose to tail
// with an 8-block span. It flies round the dragons' kind of hall (great_aerial) and lands on its floor; it guards gold
// (species.hoard: a block of gold or raw gold on the floor, the griffin measure counts them), screeches rearing up,
// preens, and climbs to the roof to dive like an eagle. Alone, a pair or a few; a Reinforced Crate carries one.
// animals/griffin.js.
// The Glowhorn Stag (0.1.152, module 9) is a great deer on an elk's frame and at its size (1.6 blocks at the shoulder)
// whose antlers glow, bone-pale to mint and turquoise, brighter at night: a grazer (species.graze, as the unicorn) that
// eats Leafy Rations from a Hay Rack too, and rubs its antlers on tree trunks (species.trunks: the stag measure counts the
// spots on the floor it can rub from). Both sexes carry antlers, a hind's smaller (the coat sets the sex). Herds of 2 to
// 8; a Livestock Crate carries one. animals/glowhorn.js.
// The Giant Yeti (0.1.159, module 10: the first boss, research/boss_plan.md) is a great white-furred ape 3.6 blocks tall
// that lives alone in a lair in the taigas, one to an area (animals/boss.js makes the lairs): calm till someone hits it
// or walks right up to it, then a boss fight (its energy on a boss bar; a swipe, a ground slam and a hurled snowball,
// each with a wind-up). It is never killed: worn down to a tenth it slumps down tired out, and only then its Yeti Cage
// works (species.boss; Yeti Tracking research). In a zoo it is calm, a guest favourite (species.favourite): a big cold
// exhibit (a Cooling Unit) with snow or ice under half the floor (species.snowFloor: the snow measure) and a den (cover),
// Fruit and Fish Rations. Alone or a pair, no young. animals/yeti.js.
// The Soul Sloth (0.1.161, the second boss) is a giant ground sloth from the soul sand valleys, 2.4 blocks high on all
// fours and 4 long, that hangs upside down under the bone beam of its lair's fossil arch, asleep much of the time
// (animals/boss.js makes the lairs, one to an area): calm till someone hits it or walks right up to it, then it drops
// and fights (a claw rake, a soul wail all round it, a lobbed clump of soul sand). Never killed: worn down it curls up
// tired out, and only then its Soul Cage works (Soul Tracking research). In a zoo it is calm, a guest favourite: a
// Thermal Regulator, soul sand or soul soil under half the floor (species.soulFloor) and a beam to hang from
// (species.beam: the sloth measure), Fungal Rations. Alone or a pair, no young. animals/sloth.js.
// The Baby Dragon (0.1.162, the third boss) is a young dragon of the outer End islands, dusky purple-black with violet
// eyes, 1.7 blocks at the back, 6 long with a 10-block span, that perches on the nest atop its lair's obsidian pillar
// (animals/boss.js makes the lairs, one to an area): calm till someone hits it or walks up under it, then it fights in
// the air (animals/babyDragon.js: a dive, a void bolt, a wing gust). Never killed: worn down it glides down and lies
// panting, and only then its Dragon Crate works (Dragon Tracking research). In a zoo it is calm, a guest favourite: a
// Dragon's great hall (it is flown by animals/dragon.js) with End ground underfoot (species.endGround), Meat Rations.
// Alone or a pair, no young.
// The zoo's mobs (0.1.163, module 11, the Hostile Mob House: research/mobhouse_plan.md; species.mob). A vanilla zombie or
// skeleton (species.mobSource: the one the journal spots) weakened to a quarter of its health turns into a calmed one
// (its wildSource, zoocraft:calm_zombie) when a Passivity Serum is used on it (Mob Taming research; animals/mobs.js), and
// a Mob Cage carries that to a mob pen: an exhibit beside a Mob House's hall (the mob_pen profile, a 5 x 5 floor for the
// first), shut in all round with a roof and walled off from the hall with glass or bars (animals/mobRules.js). In a pen
// they look as in the wild, never attack, never burn in the sun and never despawn. Zombies want the dark (lowLight) and
// graveyard earth underfoot, skeletons a crypt floor (species.mobFloor), Meat Rations or Bone Rations. No young.
// The creeper and the spider (0.1.164) the same way: a creeper never swells or explodes, a spider never climbs. Creepers
// want grass underfoot and leaves or ferns in the pen (species.mobDecor), Grain Rations, and are a guest favourite;
// spiders a darker pen (light 4 or less on the floor: species.darkLight) with cobwebs, Meat Rations. Each keeps a pen
// to itself.
// The Cyclops (0.1.165), the first rare mob: its wild one is fought as a boss is (animals/boss.js, its camp in the
// windswept hills or stony peaks) and calmed with the serum once it sits down tired out; in the zoo it wants a tall pen
// (mob_pen_giant: 7 x 7 and 6 high), stone underfoot and a pile of mossy boulders, Meat Rations, and is a guest
// favourite; alone or a pair.
// The Necromancer Skeleton (0.1.166), the second rare mob: its wild one is fought as a boss is (animals/boss.js, its crypt
// in a soul sand valley or beside a Nether fortress) and calmed with the serum once it kneels tired out; in the zoo it
// lives in a Mob House pen with soul sand or soul soil under half the floor and a soul lantern or more, Bone Rations, and
// is a guest favourite; alone or a pair.
// The Voidling (0.1.167), the third rare mob: its wild one is fought as a boss is (animals/boss.js, its rift on the outer
// End islands by an edge) and calmed with the serum once it crouches tired out; in the zoo it lives in a Mob House pen
// with a solid floor, end stone or end stone bricks under half of it, and a crying obsidian or more, eats Chorus Browse,
// and is a guest favourite; alone or a pair.

export const SPECIES = {
  "zoocraft:zoo_rabbit": {
    id: "zoocraft:zoo_rabbit",
    displayName: "Rabbit",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:rabbit", // catching this wild mob creates this species
    // Let go, a wild one the game spawned young (one time in four) grows up by the game's rabbit's own event (0.1.175).
    wildGrowUp: "grow_up",
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
    where: "Forests, birch forests, taigas, meadows and plains, in small herds. They keep away unless you sneak or hold food",
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
    where: "The Lava Falls in the Nether most of all, and lava lakes in basalt deltas and the Nether wastes, gliding just under the surface",
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
    // Let go grown with no rider (0.1.175): the game's own spawn for a grown one. Its usual spawn rolls a young one half the
    // time, and one time in ten a rider on its back (a zombified piglin, or a young strider).
    wildGrown: "spawn_adult",
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
    where: "The Chorus Meadows on the outer End islands (green turf, white trees and ponds) and the outer islands' end stone among the chorus plants, in small herds. They keep away unless you sneak or hold food",
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
    where: "The Rift Willows on the outer End islands (violet turf under great white willows) most of all, and the outer islands' end stone, nosing about alone or in pairs. One blinks away through a rift when you come close, unless you sneak or hold Chorus Browse",
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
  "zoocraft:warped_gecko": {
    id: "zoocraft:warped_gecko",
    displayName: "Warped Gecko",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_warped_gecko",
    entityType: "zoocraft:warped_gecko",
    family: "warped_gecko",
    movementProfile: "terrestrial",
    habitatProfile: "terrarium",
    // Insect Rations (mealworms, from an Insect Hatchery) in an Insect Feeder (items list: "Insect Ration | Warped
    // Gecko, hedgehogs"); at night a stocked one lets out moths, which they hunt along the walls.
    dietTags: ["insect"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:insect_ration",
    observe: ["spot", "cling", "hunt", "call"],
    where: "Warped forests and the Lava Falls in the Nether, alone or in twos on the warped nylium and up the stems, glowing a dim blue-green. By day they hide in cracks; at dusk they call, a cluck and then a growl, and at night they hunt moths. Walk right up to one and it hisses and runs up the wall; hold an Insect Ration and it comes down to you",
    // Giant geckos live alone or in pairs, and two grown males fight: one male with a female or two, and their young.
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator. Walls to climb (clings: the wall measure, a
    // roof over it all, balance.gecko.wallFaces wall faces each), a hide each by day (a crack, or a Burrow Shelter),
    // an Insect Feeder (insectFeeder), asleep by day and up at night (nightLife: a nocturnal house turns it round),
    // one grown male (oneMale). Let out on warped nylium (homeGround).
    heat: true,
    clings: true,
    insectFeeder: true,
    nightLife: true,
    oneMale: true,
    // Its spots and eyes glow (entity_emissive_alpha): guests see it in the dark (animals/nightRules.js nocturnalLine).
    glows: true,
    homeGround: { id: "minecraft:warped_nylium", text: "on warped nylium" },
    // A male is broader in the head, his glow spots brighter and more of them (minecraft:mark_variant 1).
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // One coat: a deep teal hide with rows of glowing cyan spots, a pale belly and amber eyes.
    coats: ["Warped"],
    // Two eggs a clutch (giant geckos: two, a few times a year); hatchlings are a third of a grown one's length.
    breeding: { litter: 2, gestationDays: 3, matureDays: 6, cooldownDays: 4, juvenileScale: 0.35, young: "hatchling", youngPlural: "hatchlings" },
    names: ["Sticky", "Velcro", "Neon", "Glowtoe", "Nyx", "Lichen", "Cyan", "Gripper", "Teal", "Glint", "Murk", "Gloam", "Suki", "Kiwi", "Sprocket", "Gecky"],
  },
  "zoocraft:cinder_boar": {
    id: "zoocraft:cinder_boar",
    displayName: "Cinder Boar",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_cinder_boar",
    entityType: "zoocraft:cinder_boar",
    family: "cinder_boar",
    movementProfile: "terrestrial",
    habitatProfile: "sounder",
    // Ember Rations (items list "Ember Ration | Ember Fox, Cinder Boar") or Fungal Rations (a boar eats mostly roots,
    // fungi and plants), from a Basic Feeder. A crimson fungus held up draws one over (the hoglin's lure).
    dietTags: ["ember", "fungus"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:ember_ration",
    observe: ["spot", "root", "wallow", "scrub"],
    where: "Basalt deltas and the Nether wastes, in sounders of sows and their striped piglets rooting in the soul soil; old boars wander alone. In the heat of the day they wallow. Come near the piglets and their mother stands in your way, bristling; keep coming and she charges. Hold an Ember Ration and they let you close",
    // Wild boar sounders are 6 to 20 sows and their young; 2 to 8 fits an exhibit. Alone they're uneasy.
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator. Warm Ash to root in (ash), Thermal Mud to wallow
    // in (wallow; without it comfort stays under balance.boar.wallowComfortCap: the heat is too much for them), strong
    // walls (boarProof: the boar measure), one grown boar (oneMale: boars live apart and fight in the rut). Spec 5.3:
    // "Ash, thermal mud, strong barrier". Let out on the ground of its home biomes (homeGround).
    heat: true,
    ash: { minCells: 8 },
    wallow: { minCells: 4 },
    boarProof: true,
    oneMale: true,
    homeGround: { ids: ["minecraft:basalt", "minecraft:blackstone", "minecraft:netherrack", "minecraft:soul_soil"], text: "on basalt, blackstone, netherrack or soul soil" },
    // A boar is bigger, with tusks (minecraft:mark_variant 1).
    sexLook: true,
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage", "dig"],
    // One coat: ash-grey bristles, a near-black crest tipped ember-orange, ember eyes; piglets striped buff.
    coats: ["Cinder"],
    // A litter of 3 to 5 (litterMax; wild boar: 3 to 12, 5 or 6 on average).
    breeding: { litter: 3, litterMax: 5, gestationDays: 3, matureDays: 5, cooldownDays: 6, juvenileScale: 0.35, young: "piglet", youngPlural: "piglets" },
    names: ["Snuffle", "Rooter", "Tusker", "Trotter", "Mudlark", "Grubber", "Hogan", "Tufa", "Huff", "Gristle", "Wallop", "Snorter", "Haggis", "Cobnut", "Burdock", "Mudpie"],
  },
  "zoocraft:soul_moth": {
    id: "zoocraft:soul_moth",
    displayName: "Soul Moth",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_soul_moth",
    entityType: "zoocraft:soul_moth",
    family: "soul_moth",
    movementProfile: "aerial",
    habitatProfile: "moth_house",
    flies: true, // steered through the air by animals/moth.js; the moth house is measured by floodAerial
    // Nectar Rations (butterfly houses feed a sugar solution) from a Nectar Feeder only (nectarFeeder); one held up
    // draws a wild one over to hover and sip from it.
    dietTags: ["nectar"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:nectar_ration",
    observe: ["spot", "orbit", "tumble", "sip"],
    where: "Soul sand valleys in the Nether, 2 to 4 together. At night they circle the soul fire burning on the soul soil; by day they rest flat against a basalt pillar or the valley wall, wings swept back. Hold a Nectar Ration near one and it flies over to hover and sip from it; walk right up to one at rest and it flashes the eyespots on its hindwings and flies off",
    // Moths aren't social: alone or many, gathering only at the light.
    social: { minGroup: 1, recommendedMax: 12, prefersCompany: false },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator. A roofed moth house (the profile), soul light
    // inside (soulLight: without one comfort stays under balance.moth.soulComfortCap), nectar from a Nectar Feeder
    // (nectarFeeder), at rest by day and flying at night (nightLife: a dark house turns it round; soul light counts as
    // dark, houseLight 10 where the Nocturnal Lamps give 7). Spec 5.3: "Enclosed airspace, soul lights, nectar". Let out
    // on the soul soil or soul sand of its valleys (homeGround).
    heat: true,
    soulLight: true,
    nectarFeeder: true,
    nightLife: true,
    houseLight: 10,
    // Its eyes, body rings and wing bands glow faint cyan (entity_emissive_alpha): guests see it in the dark.
    glows: true,
    homeGround: { ids: ["minecraft:soul_soil", "minecraft:soul_sand"], text: "on soul soil or soul sand" },
    // A male has broad feathery antennae and is a little smaller (minecraft:mark_variant 1).
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // One coat: pale blue wings with darker zigzag bands, a furry pale blue body, eyespots on the hindwings.
    coats: ["Soul"],
    // A clutch of 3 to 6 eggs (litterMax), laid only where host plants grow in the floor (hostPlants: the caterpillars
    // eat them, not from the feeder); they grow up in 5 park days, the last pupaDays as a pupa in the floor. The
    // caterpillar and the pupa are bones of their own drawn at the moth's scale: juvenileScale is the caterpillar's
    // length over the moth's span (9 units to 10, gen/moth.py).
    breeding: { litter: 3, litterMax: 6, gestationDays: 2, matureDays: 5, cooldownDays: 4, juvenileScale: 0.9, young: "caterpillar", youngPlural: "caterpillars", hostPlants: 4, pupaDays: 2 },
    names: ["Sphinx", "Candle", "Lantern", "Flit", "Ghostwing", "Soulwing", "Dusky", "Nocturne", "Pallid", "Azure", "Taper", "Gossamer", "Hawkmoth", "Silkie", "Moondust", "Willowisp"],
  },
  "zoocraft:quartz_beetle": {
    id: "zoocraft:quartz_beetle",
    displayName: "Quartz Beetle",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_quartz_beetle",
    entityType: "zoocraft:quartz_beetle",
    family: "quartz_beetle",
    movementProfile: "terrestrial",
    habitatProfile: "cave",
    // Mineral Pellets (a rhinoceros beetle eats fruit and sap; a Nether one, minerals) from a Basic Feeder. A nether
    // quartz held up draws one over too (balance.beetle.bait).
    dietTags: ["mineral"],
    carrierProfile: "thermal",
    baitItem: "zoocraft:mineral_pellets",
    observe: ["spot", "burrow", "wrestle", "hiss"],
    where: "The Nether wastes and basalt deltas, where nether quartz is commonest, 1 to 3 together. By day they lie buried in netherrack, soul soil, soul sand or gravel, only the quartz-plated back showing; at night they come out to walk and eat, and two males that meet wrestle. Walk right up to one on its feet and it rears and hisses; hold a Mineral Pellet or a nether quartz and it comes over",
    // Beetles aren't social: alone or many.
    social: { minGroup: 1, recommendedMax: 8, prefersCompany: false },
    // A Nether animal (spec section 10): a fuelled Thermal Regulator. A cave (cover: a roof over nearly all of the
    // floor), Mineral Substrate to bury itself in by day (substrate: without it comfort stays under
    // balance.beetle.bedComfortCap), buried by day and out at night (nightLife: a dark cave turns it round). Spec 5.3:
    // "Heated cave, mineral bed". Let out on the ground it buries itself in (homeGround).
    heat: true,
    cover: { minFraction: 0.9, why: "a cave roof" },
    substrate: { minCells: 6 },
    nightLife: true,
    homeGround: { ids: ["minecraft:netherrack", "minecraft:soul_soil", "minecraft:soul_sand", "minecraft:gravel"], text: "on netherrack, soul soil, soul sand or gravel" },
    // A male has the long horn on his pronotum over a short head horn (its length his own, zoocraft:horn); a female
    // has none and is a little smaller (minecraft:mark_variant 1).
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "dig"],
    // One coat: near-black, the wing covers plated with milky quartz.
    coats: ["Quartz"],
    // 2 to 4 grubs (litterMax), laid only in Mineral Substrate enough (substrate: the grubs live and feed in it, not
    // from the feeder); they grow up in 6 park days, the last pupaDays as a pupa in it. The grub is bones of its own
    // drawn at the beetle's scale: juvenileScale is its length over the beetle's (gen/beetle.py).
    breeding: { litter: 2, litterMax: 4, gestationDays: 2, matureDays: 6, cooldownDays: 4, juvenileScale: 0.8, young: "grub", youngPlural: "grubs", substrate: 6, pupaDays: 2 },
    names: ["Quartzy", "Hercules", "Rhino", "Atlas", "Goliath", "Chip", "Shard", "Scarab", "Dynamo", "Crag", "Gneiss", "Mica", "Beryl", "Obelisk", "Tank", "Prism"],
  },
  "zoocraft:end_hopper": {
    id: "zoocraft:end_hopper",
    displayName: "End Hopper",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_end_hopper",
    entityType: "zoocraft:end_hopper",
    family: "end_hopper",
    movementProfile: "terrestrial",
    habitatProfile: "hopper",
    // Chorus Browse (a springhare eats roots, stems, leaves and seeds; an End one, chorus) from a Basic Feeder; held up,
    // one draws it over to sniff it.
    dietTags: ["chorus"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "leap", "zigzag", "listen"],
    where: "The end stone of the outer End islands, 1 to 3 together, out and about at any hour (the End has no day or night). They leap up onto blocks and across the ground, never out over the void. Come close in Survival without sneaking and one gets away in zigzag leaps; hold Chorus Browse and it comes to sniff it",
    // Springhares forage in groups of up to nine without fighting, but don't need company.
    social: { minGroup: 1, recommendedMax: 8, prefersCompany: false },
    // End ground (spec 5.4 "End ground | vanilla end stone"); a roof, as it leaps 3 blocks high (hops: the jump
    // measure's flood through the air mustn't lead out); Landing Pads to leap between (pads: without them comfort
    // stays under balance.hopper.padComfortCap). Spec 5.4: "Jump clearance, roof, landing pads".
    endGround: { minCells: 8 },
    hops: true,
    pads: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Pale (end-stone cream, the common one), 1 Purpur (lilac grey).
    coats: ["Pale", "Purpur"],
    // One pup at a time (a springhare's single young), grown in 4 park days; it keeps to the floor and doesn't leap.
    breeding: { litter: 1, gestationDays: 3, matureDays: 4, cooldownDays: 4, juvenileScale: 0.5, young: "pup", youngPlural: "pups" },
    names: ["Pogo", "Boing", "Kip", "Skip", "Jinx", "Ricochet", "Lark", "Pounce", "Springer", "Sprig", "Tansy", "Cricket", "Zest", "Wink", "Dart", "Hopscotch"],
  },
  "zoocraft:shimmer_snail": {
    id: "zoocraft:shimmer_snail",
    displayName: "Shimmer Snail",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_shimmer_snail",
    entityType: "zoocraft:shimmer_snail",
    family: "shimmer_snail",
    movementProfile: "terrestrial",
    habitatProfile: "snail",
    // Mineral Pellets from a Basic Feeder (a rock snail rasps the rock itself; an End one, minerals); held up, one draws
    // it over to reach up at it. It also grazes the Mineral Substrate.
    dietTags: ["mineral"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:mineral_pellets",
    observe: ["spot", "trail", "withdraw", "seal"],
    where: "The end stone of the outer End islands, 2 to 4 together, out at any hour (the End has no day or night). They crawl slowly over the end stone grazing it, leave a glowing trail that fades, and rest sealed in their shells in crevices at the foot of rocks. Come close in Survival without sneaking and one pulls into its shell; hold Mineral Pellets and it crawls over to you",
    // Snails aren't social, but they rest near each other and follow each other's trails.
    social: { minGroup: 1, recommendedMax: 8, prefersCompany: false },
    // End ground (spec 5.4 "End ground | vanilla end stone"); shade (cover: a roof or leaves over a quarter of the
    // floor); a crevice each to rest in (crevices: without them comfort stays under balance.snail.creviceComfortCap);
    // Mineral Substrate to graze (mineralBed: without it comfort stays under balance.snail.bedComfortCap). Spec 5.4:
    // "Mineral bed, shade, crevices".
    endGround: { minCells: 4 },
    cover: { minFraction: 0.25, why: "shade" },
    crevices: true,
    mineralBed: { minCells: 4 },
    // No sexes: any two grown ones that aren't related can pair, and one of them lays the eggs.
    hermaphrodite: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Pearl (ivory, a pearl-white shell, the common one), 1 Opal (pale lilac, a
    // lavender shell).
    coats: ["Pearl", "Opal"],
    // 2 or 3 eggs laid in the Mineral Substrate (eggBed: 4 or more blocks of it in the floor); the hatchlings glow, leave
    // a fainter trail and crawl after their parent, grown in 4 park days.
    breeding: { litter: 2, litterMax: 3, gestationDays: 2, matureDays: 4, cooldownDays: 4, juvenileScale: 0.35, young: "hatchling", youngPlural: "hatchlings", eggBed: 4 },
    names: ["Spiral", "Twirl", "Gleam", "Slick", "Dewdrop", "Lustre", "Swirl", "Whorl", "Trickle", "Sheen", "Coil", "Shelly", "Escargot", "Nacre", "Helix", "Glisten"],
  },
  "zoocraft:obsidian_crab": {
    id: "zoocraft:obsidian_crab",
    displayName: "Obsidian Crab",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_obsidian_crab",
    entityType: "zoocraft:obsidian_crab",
    family: "obsidian_crab",
    movementProfile: "terrestrial",
    habitatProfile: "crab",
    // Mineral Pellets from a Mineral Feeder, and nothing else (a coconut crab eats other crabs' moulted shells for their
    // minerals; an End one, the zoo's pellets). Held up, they draw one from far off: it smells them.
    dietTags: ["mineral"],
    mineralFeeder: true,
    carrierProfile: "stabilized",
    baitItem: "zoocraft:mineral_pellets",
    observe: ["spot", "scrape", "dig", "claws"],
    where: "The end stone of the outer End islands, alone or 2 together, out at any hour (the End has no day or night). They walk sideways over the end stone, scrape minerals off the rock with their claws, and rest dug in backwards at a rock's foot with only the eyes and the big claw showing. Come at one in Survival without sneaking and it rears with its claws up, then bolts and digs in; hold Mineral Pellets and it walks over to you",
    // Coconut crabs live alone, and a big one eats a small one: 1 to 4 together, keeping an exhibit of their own.
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // End ground (spec 5.4 "End ground | vanilla end stone"); a rocky cave (cover: a roof over nearly all of the floor;
    // rockFaces: rock to scrape, without it comfort stays under balance.crab.rockComfortCap); Mineral Substrate to dig
    // its burrow in (burrows: without it comfort stays under balance.crab.burrowComfortCap); a Mineral Feeder.
    endGround: { minCells: 4 },
    cover: { minFraction: 0.9, why: "a cave roof" },
    rockFaces: { first: 4, extra: 2 },
    burrows: { perCrab: 2, minCells: 4 },
    // A male is bigger, his shell 144 mm across to her 101 (Christmas Island): she is 0.7 of him (minecraft:mark_variant
    // 1 a male).
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage", "dig"],
    // Coat comes from minecraft:variant: 0 Obsidian (glossy black, a violet sheen, the common one), 1 Crying (flecked
    // with glowing violet, like crying obsidian).
    coats: ["Obsidian", "Crying"],
    // She carries 2 or 3 eggs under her tail (carried) 3 park days; the crablets come out from under her, each with a
    // little spiral shell on its back (as young coconut crabs carry snail shells), grown in 5 park days. A crablet is
    // half a female's size (juvenileScale is of a female's, as a gorilla's: 0.35 of a male).
    breeding: { litter: 2, litterMax: 3, gestationDays: 3, matureDays: 5, cooldownDays: 4, juvenileScale: 0.5, young: "crablet", youngPlural: "crablets", carried: true },
    names: ["Pincer", "Clacker", "Snips", "Nipper", "Scuttle", "Onyx", "Jet", "Ebony", "Grit", "Crusher", "Sidle", "Rubble", "Knuckles", "Chisel", "Barnacle", "Tephra"],
  },
  "zoocraft:chorus_moth": {
    id: "zoocraft:chorus_moth",
    displayName: "Chorus Moth",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_chorus_moth",
    entityType: "zoocraft:chorus_moth",
    family: "chorus_moth",
    movementProfile: "aerial",
    habitatProfile: "moth_house",
    flies: true, // steered through the air by animals/chorusMoth.js; the moth house is measured by floodAerial
    // Nectar Rations from a Nectar Feeder only (nectarFeeder; 2 sugar and a chorus fruit make 2): chorus nectar. One
    // held up draws a wild one over to hover and sip from it.
    dietTags: ["nectar"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:nectar_ration",
    observe: ["spot", "flower", "warmup", "sip"],
    where: "The outer End islands where chorus grows, 2 to 4 together, out in bouts at any hour (the End has no day or night). Out, they work from chorus flower to chorus flower, hovering at each to sip; between, they rest on an end stone face with the wings folded into an arrowhead, and each shivers its wings warm before it flies. Hold a Nectar Ration near one and it flies over to sip from it; walk right up to one at rest and it gives a quick shiver and flies off",
    // Moths aren't social: alone or many.
    social: { minGroup: 1, recommendedMax: 12, prefersCompany: false },
    // A roofed moth house (the profile), chorus flowers inside, one for each and 2 at least (chorusFlowers: without
    // them comfort stays under balance.chorusMoth.flowerComfortCap), nectar from a Nectar Feeder (nectarFeeder), low
    // light (lowLight: no daylight and nothing brighter than the Nocturnal Lamps; in a bright house it flies only at night
    // and comfort stays under balance.chorusMoth.dimComfortCap), End ground (spec 5.4 "vanilla end stone").
    chorusFlowers: { perMoth: 1, min: 2 },
    nectarFeeder: true,
    lowLight: true,
    endGround: { minCells: 4 },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Chorus (deep purple forewings with lilac-pink bars, the common one), 1 Popped
    // (pale lilac, like popped chorus fruit). The sexes look alike.
    coats: ["Chorus", "Popped"],
    // A clutch of 3 to 6 eggs (litterMax), laid only where chorus stands on the floor (hostPlants, hostText: the
    // caterpillars eat it, not from the feeder); they grow up in 5 park days, the last pupaDays as a pupa in the floor.
    // The caterpillar and the pupa are bones of their own drawn at the moth's scale: juvenileScale is the caterpillar's
    // length over the moth's span (7 units to 8, gen/chorusmoth.py).
    breeding: { litter: 3, litterMax: 6, gestationDays: 2, matureDays: 5, cooldownDays: 4, juvenileScale: 0.875, young: "caterpillar", youngPlural: "caterpillars", hostPlants: 4, hostText: "chorus plants or flowers standing on the floor", pupaDays: 2 },
    names: ["Elpenor", "Plume", "Hoverwing", "Sipper", "Corolla", "Heather", "Wisteria", "Foxglove", "Popcorn", "Phlox", "Verbena", "Hum", "Bloom", "Purpura", "Willowherb", "Fuchsia"],
  },
  "zoocraft:starback_tortoise": {
    id: "zoocraft:starback_tortoise",
    displayName: "Starback Tortoise",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_starback_tortoise",
    entityType: "zoocraft:starback_tortoise",
    family: "starback_tortoise",
    movementProfile: "terrestrial",
    habitatProfile: "tortoise",
    // Chorus Browse from a Basic Feeder (an Indian star tortoise grazes grasses and herbs and eats fruit and flowers; an
    // End one, chorus), and the chorus standing on the floor, browsed at its foot. Held up (or a chorus fruit), one draws
    // it over to nibble at it.
    dietTags: ["chorus"],
    carrierProfile: "stabilized",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "warm", "chorus", "withdraw"],
    where: "Among the chorus of the outer End islands, alone or 2 together, keeping to bouts at any hour (the End has no day or night). They rest under cover (a chorus plant, a rock), come out to bask with the legs and neck stretched out till they're warm, and browse the chorus at its foot. Come close in Survival without sneaking and one pulls into its shell with a hiss; hold Chorus Browse or a chorus fruit and it plods over to nibble at it",
    // Solitary, but the males seldom or never fight: 1 to 6 together, keeping an exhibit of their own.
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // End vegetation (endPlants: chorus standing on the floor, 2 for each and 3 at least), a warm pad (warmPads: a Warm
    // Pad for every 2, 1 at least), a large retreat (retreat: a low roof over 2 blocks of floor for each, 4 at least);
    // without any of them comfort stays under its balance.starback cap. End ground (spec 5.4 "vanilla end stone"). She
    // nests in Mineral Substrate (substrateNest: it's counted).
    endPlants: { perTortoise: 2, min: 3 },
    warmPads: { perPad: 2, min: 1 },
    retreat: { perTortoise: 2, min: 4 },
    substrateNest: true,
    endGround: { minCells: 4 },
    // A male is 0.64 of a female (17.5 cm to her 27.5), his tail longer and thicker (minecraft:mark_variant 1 a male).
    sexLook: true,
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // One coat (minecraft:variant 0), Starback: a black, high-domed shell, a yellow star on each scute, the stars'
    // centres glowing faintly.
    coats: ["Starback"],
    // She digs a nest in the Mineral Substrate with her hind feet (nestDig; only with eggBed blocks of it in the floor),
    // lays 2 to 4 eggs, fills it and pats it flat; they hatch in 3 park days and dig out, grown in 6. A hatchling is 0.3
    // of a female (a real one 0.13, too small to see), black with yellow blotches, no stars yet.
    breeding: { litter: 2, litterMax: 4, gestationDays: 3, matureDays: 6, cooldownDays: 6, juvenileScale: 0.3, young: "hatchling", youngPlural: "hatchlings", eggBed: 2, nestDig: true },
    names: ["Twinkle", "Polaris", "Vega", "Sirius", "Astra", "Galileo", "Dome", "Plod", "Ponder", "Meteor", "Celeste", "Starla", "Mosaic", "Dipper", "Shelby", "Kepler"],
  },
  // Fish (0.1.119, module 6, Austin's idea 9: "Add fish species so zoos can have an aquarium. Players can gather fish in
  // large numbers, and fish need less watching than the animals"): zoo copies of the vanilla fish (the game's own models
  // and skins, as the Zoo Rabbit), kept as SCHOOLS (animals/schoolRules.js): one record a species a tank, `count` fish in
  // it (species.school.max at most), at most species.school.shown of them shown as mobs. Caught in bulk with a Water
  // Transport Tank (carrier profile `aquatic`: the one and its kind within BALANCE.aquarium.catchRange), no bait (fish
  // can't be fed), no Field Journal task but spotting one, no breeding, never ill. They eat Fish Flakes from an Aquarium
  // Feeder (species.aquariumFeeder) and nothing else: rationUnitsPerParkDay is a FISH's share (an eighth of a unit).
  // Their space is the water (the `aquarium` profile). All four share the Reef community (with the two squid, 0.1.121).
  // `bucket`: a water bucket used on a shown zoo fish takes one out in that bucket (0.1.121).
  "zoocraft:zoo_cod": {
    id: "zoocraft:zoo_cod",
    displayName: "Cod",
    plural: "Cod",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:cod",
    bucket: "minecraft:cod_bucket",
    entityType: "zoocraft:zoo_cod",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes", // what they eat (never used as bait: a school is scooped up, not coaxed)
    aquariumFeeder: true,
    school: { max: 16, shown: 6 },
    observe: ["spot"],
    where: "Cold and lukewarm oceans, in schools",
    social: { minGroup: 2, recommendedMax: 16, prefersCompany: true },
    rationUnitsPerParkDay: 0.125,
    enrichmentTags: [],
    coats: ["Silver"],
    names: ["Shoal", "Drift", "Current", "Tide", "Ripple", "Eddy", "Swell", "Surge", "Flow", "Wake", "Gale", "Breaker", "Spray", "Foam", "Crest", "Trough"],
  },
  "zoocraft:zoo_salmon": {
    id: "zoocraft:zoo_salmon",
    displayName: "Salmon",
    plural: "Salmon",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:salmon",
    bucket: "minecraft:salmon_bucket",
    entityType: "zoocraft:zoo_salmon",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 16, shown: 6 },
    observe: ["spot"],
    where: "Cold and frozen oceans and rivers, in runs",
    social: { minGroup: 2, recommendedMax: 16, prefersCompany: true },
    rationUnitsPerParkDay: 0.125,
    enrichmentTags: [],
    coats: ["Red"],
    names: ["Run", "Leap", "Rapids", "Torrent", "Cascade", "Brook", "Spring", "Riffle", "Chute", "Falls", "Stream", "Creek", "Burn", "Beck", "Ford", "Weir"],
  },
  "zoocraft:zoo_tropical_fish": {
    id: "zoocraft:zoo_tropical_fish",
    displayName: "Tropical Fish",
    plural: "Tropical Fish",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:tropicalfish",
    bucket: "minecraft:tropical_fish_bucket", // the bucket's fish takes a look of its own (a script-made bucket carries none)
    entityType: "zoocraft:zoo_tropical_fish",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 16, shown: 6 },
    // A school keeps the look of the fish it was caught from (the body shape, the pattern and the two colours: record
    // `look`, animals/schoolRules.js tropicalLook), shown with zoocraft:shape_N, pattern_N, base_N and pat_N.
    looks: true,
    observe: ["spot"],
    where: "Warm and lukewarm oceans, over the coral",
    social: { minGroup: 2, recommendedMax: 16, prefersCompany: true },
    rationUnitsPerParkDay: 0.125,
    enrichmentTags: [],
    coats: ["Reef"],
    names: ["Coral", "Lagoon", "Reef", "Atoll", "Anemone", "Kelp", "Pearl", "Shell", "Sunburst", "Rainbow", "Glimmer", "Dapple", "Paisley", "Tango", "Bubble", "Sparkle"],
  },
  "zoocraft:zoo_pufferfish": {
    id: "zoocraft:zoo_pufferfish",
    displayName: "Pufferfish",
    plural: "Pufferfish",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:pufferfish",
    bucket: "minecraft:pufferfish_bucket",
    entityType: "zoocraft:zoo_pufferfish",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 16, shown: 6 },
    observe: ["spot"],
    where: "Warm and lukewarm oceans. Keep back: a puffed one stings",
    social: { minGroup: 2, recommendedMax: 16, prefersCompany: true },
    rationUnitsPerParkDay: 0.125,
    enrichmentTags: [],
    coats: ["Spiny"],
    names: ["Puff", "Balloon", "Bloat", "Prickle", "Spike", "Globe", "Button", "Pip", "Bulge", "Quill", "Burr", "Pincushion", "Marble", "Bobble", "Blimp", "Needle"],
  },
  // The squid (0.1.121): zoo copies of the vanilla squid and glow squid (gen121/squid121.py), kept as schools like the
  // fish but bigger (8 a school, 4 shown). No bucket: the game's buckets hold fish only.
  "zoocraft:zoo_squid": {
    id: "zoocraft:zoo_squid",
    displayName: "Squid",
    plural: "Squid",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:squid",
    entityType: "zoocraft:zoo_squid",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 8, shown: 4 },
    observe: ["spot"],
    where: "Oceans and rivers, in small groups",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    rationUnitsPerParkDay: 0.25,
    enrichmentTags: [],
    coats: ["Blue"],
    names: ["Ink", "Inky", "Blot", "Squirt", "Tentacle", "Kraken", "Calamari", "Siphon", "Sucker", "Mantle", "Cuttle", "Splotch", "Nib", "Sepia", "Noodle", "Wiggle"],
  },
  "zoocraft:zoo_glow_squid": {
    id: "zoocraft:zoo_glow_squid",
    displayName: "Glow Squid",
    plural: "Glow Squid",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:glow_squid",
    entityType: "zoocraft:zoo_glow_squid",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 8, shown: 4 },
    observe: ["spot"],
    where: "Dark water deep underground, in small groups",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    rationUnitsPerParkDay: 0.25,
    enrichmentTags: [],
    coats: ["Teal"],
    names: ["Beacon", "Firefly", "Shine", "Radiant", "Flash", "Luster", "Dawn", "Pulse", "Starlight", "Torch", "Opal", "Lumi", "Lamp", "Fathom", "Nightlight", "Phosphor"],
  },
  // The Whale Shark (0.1.124, module 6b part 1; Austin 2026-10-27: "whale sharks ... should be" among the sharks, then
  // "whale sharks are passive"; research/trench_plan.md, trench_facts.md): the first BIG FISH (species.bigFish): a single
  // named animal in a giant tank, not a school, caught one at a time in the Large Water Tank (carrier `marine`, Marine
  // Husbandry research) with Fish Flakes held out; it filter-feeds Fish Flakes from the Aquarium Feeder (8 units a park
  // day: it is 12 m long), never breeds, never falls ill in a tank (as the schools), and is harmless. Found near the
  // surface of warm and lukewarm deep oceans, alone.
  "zoocraft:whale_shark": {
    id: "zoocraft:whale_shark",
    displayName: "Whale Shark",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_whale_shark",
    entityType: "zoocraft:whale_shark",
    movementProfile: "aquatic",
    habitatProfile: "giant_tank",
    dietTags: ["flakes"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    bigFish: true,
    observe: ["spot", "gulp"],
    where: "Near the surface of warm and lukewarm deep oceans, alone: cruising slowly, every so often slowing right down with its huge mouth wide open to filter the water. Harmless, and much bigger than anything else in the sea",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    rationUnitsPerParkDay: 8,
    enrichmentTags: [],
    coats: ["Spotted"],
    names: ["Wanderer", "Gentle", "Luna", "Bruno", "Marina", "Pacific", "Grande", "Checkers", "Plankton", "Harbor", "Juno", "Voyager", "Moonlit", "Odyssey", "Sapphire", "Titan"],
  },
  // The Great White (0.1.125, module 6b part 2; Austin 2026-10-27: "great whites, hammerheads ... They should be
  // dangerous"; research/trench_plan.md "Danger", trench_facts.md): a dangerous big fish (`shark`): the predators'
  // warn-then-charge danger with water moves (animals/shark.js: it circles a swimmer in its tank, then rushes and bites, 3
  // hearts and a shove), no Holding Dens (keepers fill the Aquarium Feeder from the bank and never go in), Fish Rations
  // from the Aquarium Feeder, caught in the Large Water Tank only while it eats a Fish Ration thrown into the water. It
  // surges to the surface now and then (the breach). Alone in deep oceans; a wild one hunts swimmers.
  "zoocraft:great_white": {
    id: "zoocraft:great_white",
    displayName: "Great White Shark",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_great_white",
    entityType: "zoocraft:great_white",
    movementProfile: "aquatic",
    habitatProfile: "large_tank",
    dietTags: ["fish"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_ration",
    aquariumFeeder: true,
    bigFish: true,
    shark: true,
    dangerous: true,
    dangerMoves: "circle anyone swimming in their tank, then rush and bite",
    observe: ["spot", "breach"],
    where: "The upper water of the Deep Trench (clear teal water over its abyss), alone. Very dangerous: a wild one goes for anyone swimming near it. Throw a Fish Ration into the water near one: while it eats it's calm, and the Large Water Tank can take it",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    rationUnitsPerParkDay: 3,
    enrichmentTags: [],
    coats: ["Grey"],
    sounds: { warn: "mob.dolphin.idle_water", warnPitch: 0.4, swipe: "mob.ravager.bite", swipePitch: 0.7 },
    names: ["Jaws", "Carcharo", "Nero", "Rip", "Bianca", "Razor", "Tempest", "Mako", "Bruce", "Ivory", "Whitecap", "Saltwater", "Torpedo", "Keel", "Undertow", "Pale"],
  },
  // The Hammerhead (0.1.125): the same shark rules, in a smaller tank and happier in company (young hammerheads school);
  // it sweeps the floor with its wide head now and then. Ones and threes in warm and lukewarm oceans.
  "zoocraft:hammerhead": {
    id: "zoocraft:hammerhead",
    displayName: "Hammerhead Shark",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_hammerhead",
    entityType: "zoocraft:hammerhead",
    movementProfile: "aquatic",
    habitatProfile: "large_tank",
    dietTags: ["fish"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_ration",
    aquariumFeeder: true,
    bigFish: true,
    shark: true,
    dangerous: true,
    dangerMoves: "circle anyone swimming in their tank, then rush and bite",
    observe: ["spot", "sweep"],
    where: "Warm and lukewarm oceans, alone or in small groups, in the upper water. Dangerous: a wild one goes for anyone swimming near it. Throw a Fish Ration into the water near one: while it eats it's calm, and the Large Water Tank can take it",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: true },
    rationUnitsPerParkDay: 2,
    enrichmentTags: [],
    coats: ["Bronze"],
    sounds: { warn: "mob.dolphin.idle_water", warnPitch: 0.5, swipe: "mob.ravager.bite", swipePitch: 0.85 },
    names: ["Anvil", "Mallet", "Scallop", "Sledge", "Cocos", "Galapagos", "Bronze", "Sphyrna", "Lewini", "Tacker", "Wedge", "Hatchet", "Banner", "Sextant", "Compass", "Lookout"],
  },
  // The Goblin Shark (0.1.126, module 6b part 3; Austin 2026-10-27: goblin sharks among the dangerous ones;
  // research/trench_plan.md, trench_facts.md): a shark of the deep, slow (sharkPace: half the others' steps, it drifts up
  // to a swimmer) with the same danger (the circle, the rush, the bite), caught the same way (a thrown Fish Ration, the
  // Large Water Tank). It lives in the dark: a trench tank (lowLight: no daylight on the water, nothing brighter than the
  // Nocturnal Lamps, measured as a nocturnal house is; in daylight comfort can't rise above the dim cap). Its show is the
  // jaw lunge (act 6: the jaws slung forward to the snout tip). Alone on the floor of deep oceans.
  "zoocraft:goblin_shark": {
    id: "zoocraft:goblin_shark",
    displayName: "Goblin Shark",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_goblin_shark",
    entityType: "zoocraft:goblin_shark",
    movementProfile: "aquatic",
    habitatProfile: "trench_tank",
    dietTags: ["fish"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_ration",
    aquariumFeeder: true,
    bigFish: true,
    shark: true,
    sharkPace: 0.5,
    lowLight: true,
    dangerous: true,
    dangerMoves: "drift up to anyone swimming in their tank, then shoot their jaws out and bite",
    observe: ["spot", "lunge"],
    where: "The dark bottom of the Deep Trench's abyss and down its canyons, alone, drifting slowly. Dangerous: a wild one comes for anyone swimming near it, jaws first. Throw a Fish Ration into the water near one: while it eats it's calm, and the Large Water Tank can take it",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    rationUnitsPerParkDay: 2,
    enrichmentTags: [],
    coats: ["Pink"],
    sounds: { warn: "mob.dolphin.idle_water", warnPitch: 0.3, swipe: "mob.ravager.bite", swipePitch: 0.5 },
    names: ["Mitsu", "Owston", "Blade", "Rosy", "Pinky", "Slingshot", "Phantom", "Canyon", "Trench", "Abyss", "Sakura", "Ghost", "Stiletto", "Deepwater", "Ravine", "Slope"],
  },
  // The Anglerfish (0.1.126; trench_facts.md: the humpback anglerfish, drawn "giant" at 1 m since the real one is 15 cm):
  // a harmless big fish (one named animal, the Large Water Tank, Fish Rations from the Aquarium Feeder) that hangs in the
  // dark of a small trench tank (lowLight) and barely moves. Its lure glows (the client's emissive bulb); now and then the
  // mouth gapes and the rod twitches (zoocraft:luring, the entity's timers), which the journal's "lure" task sees. Alone
  // on the floor of deep oceans.
  "zoocraft:anglerfish": {
    id: "zoocraft:anglerfish",
    displayName: "Anglerfish",
    plural: "Anglerfish",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_anglerfish",
    entityType: "zoocraft:anglerfish",
    movementProfile: "aquatic",
    habitatProfile: "dark_tank",
    dietTags: ["fish"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_ration",
    aquariumFeeder: true,
    bigFish: true,
    lure: true,
    lowLight: true,
    glows: true,
    observe: ["spot", "lure"],
    where: "The dark bottom of the Deep Trench's abyss and down its canyons, alone, hanging in the water with its lure lit. Harmless, and so slow the Large Water Tank takes it as it is",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    rationUnitsPerParkDay: 1,
    enrichmentTags: [],
    coats: ["Black"],
    names: ["Bulb", "Gloom", "Pitch", "Starlet", "Lampy", "Luminara", "Deeplight", "Lanterna", "Glowworm", "Lightkeeper", "Photon", "Nightfall", "Lucent", "Nightglow", "Fathoms", "Blackwater"],
  },
  // The Giant Stingray (0.1.127, module 6b part 4; Austin 2026-10-27: "giant stingrays ... at the bottom";
  // research/trench_plan.md, trench_facts.md §5c: drawn as the smooth stingray, the largest stingray of the sea, 2 m across
  // and 4 m long with its tail): a harmless big fish of the sea floor (one named animal, the Large Water Tank, Fish Rations
  // from the Aquarium Feeder). It wants a sand floor in its tank (species.sandBed: sand under half the water, 32 blocks at
  // least; animals/rayRules.js), and every so often it glides down and buries itself in the sand, only its eyes showing,
  // then bursts out, early when someone swims close (animals/ray.js). Alone on the sandy floor of warm and lukewarm oceans.
  "zoocraft:giant_stingray": {
    id: "zoocraft:giant_stingray",
    displayName: "Giant Stingray",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_giant_stingray",
    entityType: "zoocraft:giant_stingray",
    movementProfile: "aquatic",
    habitatProfile: "ray_tank",
    dietTags: ["fish"],
    carrierProfile: "marine",
    baitItem: "zoocraft:fish_ration",
    aquariumFeeder: true,
    bigFish: true,
    sandBed: { minFraction: 0.5, minCells: 32 },
    observe: ["spot", "bury"],
    where: "The sandy floor of warm and lukewarm oceans, alone: gliding low over the sand, or buried in it with only its eyes showing. Harmless (the spine on its tail is only for defence), and the Large Water Tank takes it as it is",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    rationUnitsPerParkDay: 2,
    enrichmentTags: [],
    coats: ["Grey-brown"],
    names: ["Sandy", "Dune", "Silt", "Glider", "Kite", "Seabed", "Flatty", "Brevi", "Whiptail", "Hideaway", "Sunken", "Dasy", "Shallows", "Seafloor", "Skate", "Mudflat"],
  },
  // The Jellyfish (0.1.127; Austin 2026-10-27: "some big glowing beautiful jelly fish", "keep them harmless", "they should
  // drift very slowly"; trench_facts.md §9: a lion's mane sized bell, 1.25 m here, glowing like the deep sea's crown
  // jellies): a school (the module 6 record, the Water Transport Tank, Fish Flakes from the Aquarium Feeder) drifting at a
  // tenth of a fish's speed, pulsing its bell. Its shown jellies take its three colours by turns (a school's coats,
  // animals.js spawnFish); swim close to one and it flashes a ring of light round its bell (species.flashes,
  // animals/jelly.js), as the Atolla jelly does. Mid-water in deep oceans, in small groups.
  "zoocraft:jellyfish": {
    id: "zoocraft:jellyfish",
    displayName: "Jellyfish",
    plural: "Jellyfish",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_jellyfish",
    entityType: "zoocraft:jellyfish",
    movementProfile: "aquatic",
    habitatProfile: "jelly_tank",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 8, shown: 4 },
    flashes: true,
    glows: true,
    observe: ["spot", "flash"],
    where: "Drifting through the Deep Trench, from down in its abyss up to the upper water, in small groups, glowing: crimson, sapphire and violet bells that pulse slowly as they drift. Harmless, and they never swim fast; swim close and one flashes a ring of light round its bell",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    rationUnitsPerParkDay: 0.25,
    enrichmentTags: [],
    coats: ["Crimson", "Sapphire", "Violet"],
    names: ["Medusa", "Billow", "Drifter", "Crown", "Pulsar", "Aurelia", "Cyanea", "Atolla", "Ribbon", "Bellflower", "Parasol", "Velella", "Chrysaora", "Mastigias", "Jellybean", "Moonbell"],
  },
  // The Catfish (0.1.129, module 6b part 5; idea 14 "catfish"; research/trench_plan.md "0.1.129", trench_facts.md §7: the
  // channel catfish, 0.6 m): a school (the module 6 record, the Water Transport Tank, Fish Flakes from the Aquarium
  // Feeder) of the river bottom. Every so often one goes down to the floor and creeps along it nose down, sweeping its
  // whiskers side to side to taste the bottom (species.bottomFeeder, animals/catfish.js), then swims up again. Harmless.
  // 2 to 4 together near the bottom of rivers, swamps and mangrove swamps.
  "zoocraft:catfish": {
    id: "zoocraft:catfish",
    displayName: "Catfish",
    plural: "Catfish",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_catfish",
    entityType: "zoocraft:catfish",
    movementProfile: "aquatic",
    habitatProfile: "aquarium",
    dietTags: ["flakes"],
    carrierProfile: "aquatic",
    baitItem: "zoocraft:fish_flakes",
    aquariumFeeder: true,
    school: { max: 8, shown: 4 },
    bottomFeeder: true,
    observe: ["spot", "whiskers"],
    where: "Near the bottom of rivers, swamps and mangrove swamps, 2 to 4 together: cruising slowly, or creeping along the floor nose down, sweeping their whiskers over it to taste for food. Harmless",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    rationUnitsPerParkDay: 0.25,
    enrichmentTags: [],
    coats: ["Channel"],
    names: ["Whiskers", "Barbel", "Mudcat", "Bayou", "Gumbo", "Flathead", "Bullhead", "Murky", "Rivercat", "Ozark", "Channel", "Silty", "Dredge", "Catty", "Muddy", "Sandbar"],
  },
  // The Manatee (0.1.129; idea 14 "manatees"; trench_facts.md §8: the West Indian manatee, 3 m): one named animal in a
  // lagoon (the `lagoon` profile: its space is the water), a mammal of the water (species.aquaticMammal): it breeds (one
  // calf, born in the water, so a lagoon needs no sheltered corner), travels in the Large Water Tank (Marine Husbandry),
  // coaxed in with a Leafy Ration, and is harmless. Leafy Rations from an Aquarium Feeder over the water (zoos float
  // lettuce for them), and the seagrass and kelp growing in its water (species.seagrass: perAnimal columns of water with
  // seagrass or kelp in them for each, a calf half; with enough, `share` of its food comes from grazing). Every 3 to 5
  // minutes it rises and holds its nostrils just out of the water to breathe; between breaths it grazes the seagrass,
  // head down (animals/manatee.js). A guest favourite (species.favourite: its exhibit's view counts a quarter more). Alone
  // or two together in rivers, mangrove swamps and the shallows of warm and lukewarm oceans.
  "zoocraft:manatee": {
    id: "zoocraft:manatee",
    displayName: "Manatee",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_manatee",
    entityType: "zoocraft:manatee",
    movementProfile: "aquatic",
    habitatProfile: "lagoon",
    dietTags: ["leafy"],
    carrierProfile: "marine",
    baitItem: "zoocraft:leafy_ration",
    aquariumFeeder: true,
    aquaticMammal: true,
    seagrass: { perAnimal: 6, share: 0.4 },
    favourite: true,
    observe: ["spot", "breathe"],
    where: "Rivers, mangrove swamps and the shallows of warm and lukewarm oceans, alone or two together: grazing the seagrass on the bottom, and every few minutes rising to put their nostrils out of the water to breathe. Harmless and gentle",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    rationUnitsPerParkDay: 4,
    enrichmentTags: [],
    coats: ["Grey"],
    // One calf after a long wait (a manatee carries hers about a year); it stays by its mother and grows up slowly.
    breeding: { litter: 1, gestationDays: 5, matureDays: 6, cooldownDays: 7, juvenileScale: 0.4, young: "calf", youngPlural: "calves" },
    names: ["Snooty", "Hugh", "Buffett", "Potato", "Lettuce", "Mellow", "Cabbage", "Calypso", "Bumble", "Seacow", "Gentleman", "Chubby", "Moo", "Waddle", "Sirena", "Manny"],
  },
  "zoocraft:okapi": {
    id: "zoocraft:okapi",
    displayName: "Lush Okapi",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_okapi",
    entityType: "zoocraft:okapi",
    family: "okapi",
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    // Leafy Rations from a Basic Feeder or an Elevated Browse Feeder (browsesEither: the giraffe's relative reaches
    // both), and the lush plants beside its floor.
    dietTags: ["leafy"],
    browsesEither: true,
    carrierProfile: "large",
    research: "cave_expeditions", // a Reinforced Crate carries one after Cave Expeditions research (transport/carriers.js)
    baitItem: "zoocraft:leafy_ration",
    observe: ["spot", "tongue", "eyewash", "clay"],
    where: "Lush caves, alone: look under azalea trees, where rooted dirt and hanging roots lead down to them. Out by day browsing azalea, dripleaf and glow berries with a long dark tongue and licking the clay round the cave pools. Shy: one slips away unless you sneak or hold a Leafy Ration",
    // Okapis live alone, a mother with her calf; two or three get on in a big enough exhibit.
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
    // Lush ground (the okapi measure): moss in the floor, and lush plants beside it to browse, plantsPer for each grown one
    // (minPlants at least), up to `share` of its food. A clay lick. Quiet cover, as the deer's.
    lushGround: { moss: 8, plantsPer: 2, minPlants: 2, share: 0.3 },
    clayLick: { min: 1 },
    cover: { minFraction: 0.1 },
    // One grown male to an exhibit (each marks his own ground); a male has two short furred ossicones (minecraft:mark_variant 1).
    oneMale: true,
    sexLook: true,
    hiddenCalf: true, // a calf lies hidden its first park day, in the okapi measure's best-covered spot (animals/nursery.js)
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // One coat: chocolate brown, white stripes on the rump and legs, a grey-white face, a tuft of moss along the crest
    // (a female a little redder; a calf its own skin).
    coats: ["Okapi"],
    // One calf after a long wait (15 months, as the giraffe's), on the giraffe's scale.
    breeding: { litter: 1, gestationDays: 4, matureDays: 6, cooldownDays: 8, juvenileScale: 0.45, young: "calf", youngPlural: "calves" },
    names: ["Ituri", "Epulu", "Velvet", "Cocoa", "Mossy", "Dripple", "Glowberry", "Kivu", "Mocha", "Pecan", "Fernie", "Hickory", "Rootsy", "Liana", "Umber", "Pippin"],
  },
  "zoocraft:molebear": {
    id: "zoocraft:molebear",
    displayName: "Earth Molebear",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_molebear",
    entityType: "zoocraft:molebear",
    family: "molebear",
    movementProfile: "terrestrial",
    // Twice the size since 0.1.140 (Austin), in the big animals' room (data/profiles.js big_burrower).
    habitatProfile: "big_burrower",
    // Insect Rations (grubs) from a Basic Feeder or an Insect Feeder, and the grubs it digs out of its Burrow Soil.
    dietTags: ["insect"],
    carrierProfile: "large",
    research: "cave_expeditions", // a Reinforced Crate carries one after Cave Expeditions research (transport/carriers.js)
    baitItem: "zoocraft:insect_ration",
    observe: ["spot", "spade", "starnose", "rearup"],
    where: "Ordinary caves deep down, below y 0, alone: not the lush caves or the deep dark. On the cave floor of stone, deepslate, tuff, gravel or dirt, sniffing with a pink star nose. Come close without sneaking and one digs itself into the ground",
    // Solitary, as a black bear: one alone, or a pair in a big enough exhibit, with their two cubs.
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // Burrow Soil (the molebear measure): `min` blocks or more beside the floor, and faces of it to tunnel into; with a
    // face for each grown one, the grubs it digs up are `share` of its food. 0.1.140: 12, the front of a bank 4 wide and
    // 3 high (a tunnel 2 by 2 with soil each side and over it).
    burrowSoil: { min: 12, share: 0.25 },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage", "dig"],
    // Two coats: Slate (dark slate-grey velvet) and Loam (warm brown); a cub has its own skin.
    coats: ["Slate", "Loam"],
    // Two cubs, as a black bear's, after a short wait; on a bear cub's scale.
    breeding: { litter: 2, gestationDays: 3, matureDays: 6, cooldownDays: 8, juvenileScale: 0.4, young: "cub", youngPlural: "cubs" },
    names: ["Digby", "Loamy", "Burrows", "Clod", "Tunnel", "Nubbin", "Gravel", "Moley", "Spade", "Shovel", "Mudge", "Starling", "Rootbeer", "Dusty", "Grubby", "Furrow"],
  },
  "zoocraft:skulker": {
    id: "zoocraft:skulker",
    displayName: "Skulker",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_skulker",
    entityType: "zoocraft:skulker",
    family: "skulker",
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    // Insect Rations from a Basic Feeder or an Insect Feeder: blind cave animals such as the olm live on small
    // invertebrates.
    dietTags: ["insect"],
    carrierProfile: "large",
    // One look: sculk-dark hide, glowing ribs, heart and tendrils (its glow layers); a sculkling the same at half size.
    coats: ["Sculk"],
    research: "cave_expeditions", // a Reinforced Crate carries one after Cave Expeditions research (transport/carriers.js)
    baitItem: "zoocraft:insect_ration",
    observe: ["spot", "tendrils", "meet", "emerge"],
    where: "The deep dark only, very rarely, on its sculk and deepslate. The first time you walk into an Ancient City, one rests somewhere near, out of sight. Move near it without sneaking and it walks over to sniff you",
    // Alone or a pair, with their one young.
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
    // The dark: no daylight on the floor and nothing brighter than light 7 (the nocturnal house's test; comfort capped
    // in light). Its ribs, heart and tendrils glow, so guests see it there.
    lowLight: true,
    glows: true,
    // Sculk in the floor (the skulker measure): `min` blocks or more; and no sculk shrieker in or beside the floor.
    sculkFloor: { min: 8 },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // One young at a time, a sculkling, half its size.
    breeding: { litter: 1, gestationDays: 4, matureDays: 8, cooldownDays: 10, juvenileScale: 0.5, young: "sculkling", youngPlural: "sculklings" },
    names: ["Hush", "Murmur", "Thrum", "Tremor", "Sonar", "Quaver", "Whisper", "Shade", "Rattle", "Rustle", "Thud", "Patter", "Cadence", "Sculky", "Tock", "Tick"],
  },
  "zoocraft:unicorn": {
    id: "zoocraft:unicorn",
    displayName: "Unicorn",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_unicorn",
    entityType: "zoocraft:unicorn",
    family: "unicorn",
    movementProfile: "terrestrial",
    habitatProfile: "grassland",
    // Grain Rations (hay with a little grain), from a Basic Feeder or a Hay Rack (rack), as the zebra.
    dietTags: ["grain"],
    rack: true,
    carrierProfile: "livestock",
    baitItem: "zoocraft:grain_ration",
    observe: ["spot", "moonflowers", "horndip", "rearing"],
    where: "The Mythical Glade only, in small herds on the open grass between the giant trees: grazing, nibbling the glowing flowers and dipping their horns in the glowing pools. Shy: one rears and canters off unless you sneak or hold a Grain Ration",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    // Grazing (the zebra's rule: perAnimal grass blocks in the floor for each give up to `share` of their food), and the
    // glade's glowing flowers on the floor (the unicorn measure): `per` for each grown one, `min` at least.
    graze: { perAnimal: 30, share: 0.4 },
    gladeFlowers: { per: 3, min: 4 },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Moonlit (snow white, a lavender-to-mint mane and tail, a pearl horn), 1 Dawn
    // (cream, a rose-to-peach mane and tail, a rose-gold horn). A foal is soft grey-white with a horn bud.
    coats: ["Moonlit", "Dawn"],
    // One foal after a long wait (a horse's 11 months), on the zebra's scale.
    breeding: { litter: 1, gestationDays: 4, matureDays: 5, cooldownDays: 6, juvenileScale: 0.6, young: "foal", youngPlural: "foals" },
    names: ["Seraphina", "Lumina", "Opaline", "Solstice", "Elowen", "Silverlace", "Halcyon", "Moonglow", "Rosalind", "Evenstar", "Thistledown", "Silverhoof", "Willowmist", "Isolde", "Mirabel", "Sunbeam"],
  },
  "zoocraft:dragon": {
    id: "zoocraft:dragon",
    displayName: "Dragon",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_dragon",
    entityType: "zoocraft:dragon",
    family: "dragon",
    movementProfile: "aerial",
    habitatProfile: "great_aerial",
    flies: true,
    // Meat Rations from a Basic Feeder on the floor.
    dietTags: ["meat"],
    carrierProfile: "large",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "dragonfire", "wingbask", "dragonroar"],
    where: "The Lava Falls in the Nether only, a rare few: flying through its great caverns and over the lava seas, now and then landing on the nylium by the falls to bask in the heat. Wary: one roars and takes off unless you sneak or hold a Meat Ration",
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
    // A lit campfire or soul campfire on the floor or beside it (the dragon measure), to bask by.
    warmth: { min: 1 },
    rationUnitsPerParkDay: 4,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Emerald (green scales, a gold belly, green fire), 1 Ember (red, a cream belly,
    // orange fire), 2 Frost (ice blue, a pale belly, icy blue fire). A hatchling is small with a big head and stubby horns.
    coats: ["Emerald", "Ember", "Frost"],
    // One hatchling after a long wait, growing slowly.
    breeding: { litter: 1, gestationDays: 6, matureDays: 8, cooldownDays: 10, juvenileScale: 0.35, young: "hatchling", youngPlural: "hatchlings" },
    names: ["Thorn", "Fafnir", "Brimstone", "Jasper", "Solara", "Borealis", "Galewing", "Ignatius", "Pyra", "Smoulder", "Rune", "Glacius", "Verdigris", "Malachite", "Hearthstone", "Garnet"],
  },
  "zoocraft:griffin": {
    id: "zoocraft:griffin",
    displayName: "Griffin",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_griffin",
    entityType: "zoocraft:griffin",
    family: "griffin",
    movementProfile: "aerial",
    habitatProfile: "great_aerial",
    flies: true,
    // Meat Rations from a Basic Feeder on the floor.
    dietTags: ["meat"],
    carrierProfile: "large",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "guard", "screech", "dive"],
    where: "The Mythical Glade only, a few, alone or in pairs: flying over the giant trees, perching on top of them and now and then landing on the open grass. Wary: one screeches and takes off unless you sneak or hold a Meat Ration",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    // A block of gold or raw gold on the floor or in it (the griffin measure), to guard.
    hoard: { min: 1 },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Golden (a white eagle's head on a tawny lion's body, golden wings), 1 Snowy
    // (white with grey bars), 2 Storm (slate grey, a dark head, steel-blue wings). A chick is small and fluffy with a big head.
    coats: ["Golden", "Snowy", "Storm"],
    // One chick after a long wait, growing slowly.
    breeding: { litter: 1, gestationDays: 5, matureDays: 6, cooldownDays: 8, juvenileScale: 0.4, young: "chick", youngPlural: "chicks" },
    names: ["Aquila", "Gryph", "Sunclaw", "Skyreach", "Altair", "Goldcrest", "Feathermane", "Leonis", "Aerie", "Valkyr", "Aurum", "Hyperion", "Cirrus", "Argent", "Stormwing", "Midas"],
  },
  "zoocraft:glowhorn_stag": {
    id: "zoocraft:glowhorn_stag",
    displayName: "Glowhorn Stag",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_glowhorn_stag",
    entityType: "zoocraft:glowhorn_stag",
    family: "glowhorn",
    movementProfile: "terrestrial",
    habitatProfile: "grassland",
    // Leafy Rations (the deer's), from a Basic Feeder or a Hay Rack (rack).
    dietTags: ["leafy"],
    rack: true,
    carrierProfile: "livestock",
    baitItem: "zoocraft:leafy_ration",
    observe: ["spot", "antlerglow", "antlerrub", "stagbellow"],
    where: "The Mythical Glade only, in small herds among the giant trees: grazing, rubbing their antlers on the trunks, and at dusk lifting their heads while their antlers flare with light. Wary: one bounds off unless you sneak or hold a Leafy Ration",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    // Grazing (the zebra's rule: perAnimal grass blocks in the floor for each give up to `share` of their food), and a
    // trunk to rub its antlers on (the stag measure): `min` spots on the floor to rub from.
    graze: { perAnimal: 30, share: 0.4 },
    trunks: { min: 1 },
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    // Coat comes from minecraft:variant: 0 Hind (smaller antlers, three points a side), 1 Stag (six points a side, a
    // darker neck and ruff). A fawn is dappled, its spots glowing faintly, with antler buds.
    coats: ["Hind", "Stag"],
    sexByCoat: ["female", "male"],
    // One fawn after a long wait (an elk's 8 months), on the deer's scale.
    breeding: { litter: 1, gestationDays: 3, matureDays: 5, cooldownDays: 5, juvenileScale: 0.5, young: "fawn", youngPlural: "fawns" },
    names: ["Ardent", "Sylvan", "Brindle", "Thornwick", "Brightbough", "Elderglow", "Fennick", "Hartley", "Mossbeam", "Tamarack", "Elkhorn", "Fernlight", "Hartwell", "Larkspur", "Thornbeam", "Wren"],
  },
  "zoocraft:giant_yeti": {
    id: "zoocraft:giant_yeti",
    displayName: "Giant Yeti",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    wildSource: "zoocraft:wild_giant_yeti",
    entityType: "zoocraft:giant_yeti",
    family: "giant_yeti",
    movementProfile: "terrestrial",
    habitatProfile: "yeti",
    // A boss (0.1.159): caught only once tired out in a fight (animals/boss.js bossCatchBlock), its lair then caught.
    boss: true,
    // Fruit Rations (sweet berries: its favourite) and Fish Rations, from a Basic Feeder.
    dietTags: ["fruit", "fish"],
    carrierProfile: "yeti",
    baitItem: "zoocraft:fruit_ration",
    observe: ["spot", "yetiroar", "yetihurl", "yetitired"],
    where: "The taigas only (snowy or not), one to an area, alone in its lair: a snowy clearing with a den of stone and ice. Calm till you hit it or walk right up to it in Survival without sneaking; then it fights, and it is never killed: worn down, it slumps down tired out",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // A cold habitat (the penguin's rule: a stocked Cooling Unit), snow or ice under half the floor (the snow measure),
    // and a den: a roof 5 or more blocks up over part of the floor.
    cold: true,
    snowFloor: { share: 0.5 },
    cover: { minFraction: 0.06, why: "a den" },
    // A guest favourite: its exhibit's view counts a quarter more.
    favourite: true,
    rationUnitsPerParkDay: 6,
    enrichmentTags: ["forage"],
    coats: ["Snow"],
    names: ["Avalanche", "Blizzard", "Glacier", "Snowdrift", "Everest", "Frostbeard", "Icemane", "Whiteout", "Kangri", "Migoi", "Yeren", "Hailstone", "Cragmore", "Tundra", "Rime", "Sleet"],
  },
  "zoocraft:soul_sloth": {
    id: "zoocraft:soul_sloth",
    displayName: "Soul Sloth",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    wildSource: "zoocraft:wild_soul_sloth",
    entityType: "zoocraft:soul_sloth",
    family: "soul_sloth",
    movementProfile: "terrestrial",
    habitatProfile: "sloth",
    // A boss (0.1.161): caught only once tired out in a fight (animals/boss.js bossCatchBlock), its lair then caught.
    boss: true,
    // Fungal Rations (crimson and warped fungus), from a Basic Feeder.
    dietTags: ["fungus"],
    carrierProfile: "sloth",
    baitItem: "zoocraft:fungal_ration",
    observe: ["spot", "slothhang", "slothlob", "slothtired"],
    where: "The soul sand valleys in the Nether only, one to an area, alone in its lair: a clearing of soul soil with a fossil arch of bone, where it hangs upside down under the beam. Calm till you hit it or walk right up to it in Survival without sneaking; then it drops down and fights, and it is never killed: worn down, it curls up tired out",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // A Nether animal: a fuelled Thermal Regulator. Soul sand or soul soil under half the floor (the sloth measure), and
    // a beam to hang from (a post with 5 solid blocks running out from its top, 5 to 8 over the floor).
    heat: true,
    soulFloor: { share: 0.5 },
    beam: true,
    // A guest favourite: its exhibit's view counts a quarter more.
    favourite: true,
    rationUnitsPerParkDay: 5,
    enrichmentTags: ["forage"],
    coats: ["Soul"],
    names: ["Lethe", "Doze", "Slumber", "Ashgrave", "Lull", "Dormer", "Drowse", "Mortimer", "Sorrow", "Grimsby", "Duskclaw", "Morrow", "Nod", "Tallow", "Wraith", "Barrow"],
  },
  "zoocraft:baby_dragon": {
    id: "zoocraft:baby_dragon",
    displayName: "Baby Dragon",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    wildSource: "zoocraft:wild_baby_dragon",
    entityType: "zoocraft:baby_dragon",
    family: "baby_dragon",
    movementProfile: "aerial",
    habitatProfile: "great_aerial",
    flies: true,
    // A boss (0.1.162): caught only once tired out in a fight (animals/boss.js bossCatchBlock), its lair then caught.
    boss: true,
    // Meat Rations from a Basic Feeder on the floor.
    dietTags: ["meat"],
    carrierProfile: "drake",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "drakesleep", "drakedive", "draketired"],
    where: "The outer End islands only (more than 800 blocks out from the middle of the End), one to an area, alone in its lair: a clearing of end stone with an obsidian pillar, its nest on top. Calm till you hit it or walk up under it in Survival without sneaking; then it takes off and fights in the air, and it is never killed: worn down, it glides down and lies panting",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // End ground underfoot as the End's animals have it (end stone, Chorus Turf or Rift Turf in the floor): a lot of it
    // for a big flier.
    endGround: { minCells: 100 },
    // A guest favourite: its exhibit's view counts a quarter more.
    favourite: true,
    rationUnitsPerParkDay: 4,
    enrichmentTags: ["forage"],
    coats: ["Void"],
    names: ["Corvus", "Inkwing", "Noctis", "Voidling", "Ender", "Shardwing", "Riftling", "Starveil", "Erebus", "Tenebris", "Obscura", "Elytra", "Shulk", "Wyrmling", "Morrigan", "Ichor"],
  },
  "zoocraft:zoo_zombie": {
    id: "zoocraft:zoo_zombie",
    displayName: "Zombie",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    // A mob (0.1.163): the vanilla zombie is the one the journal spots (mobSource); a calmed one (a Passivity Serum used
    // on a weakened zombie) is the one a Mob Cage carries (wildSource).
    wildSource: "zoocraft:calm_zombie",
    mobSource: "minecraft:zombie",
    entityType: "zoocraft:zoo_zombie",
    family: "zoo_zombie",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Meat Rations from a Basic Feeder (zombies eat flesh).
    dietTags: ["meat"],
    carrierProfile: "mob",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "mobcalm"],
    where: "Anywhere dark in the Overworld: on the surface at night and in caves (monsters spawn at block light 0). Weaken one to a quarter of its health, then use a Passivity Serum on it (Mob Taming research). Husks and drowned are other mobs",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // The dark: no daylight in the pen and nothing brighter than light 7 (the nocturnal house's test; comfort capped in
    // light), and graveyard earth under half the floor (the mob floor measure).
    lowLight: true,
    mobFloor: { ids: ["minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:dirt_with_roots", "minecraft:mud"], share: 0.5, how: "graveyard earth (dirt, coarse dirt, podzol, rooted dirt or mud)" },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    coats: ["Zombie"],
    names: ["Rotley", "Groan", "Mildew", "Shamble", "Grimace", "Lurch", "Moldy", "Stitches", "Grubb", "Mortis", "Shuffles", "Ghoulie", "Rigor", "Bogart", "Dregs", "Putrid"],
  },
  "zoocraft:zoo_skeleton": {
    id: "zoocraft:zoo_skeleton",
    displayName: "Skeleton",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    // A mob (0.1.163), as the zombie.
    wildSource: "zoocraft:calm_skeleton",
    mobSource: "minecraft:skeleton",
    entityType: "zoocraft:zoo_skeleton",
    family: "zoo_skeleton",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Bone Rations (bones and bone meal) from a Basic Feeder.
    dietTags: ["bone"],
    carrierProfile: "mob",
    baitItem: "zoocraft:bone_ration",
    observe: ["spot", "mobcalm"],
    where: "Anywhere dark in the Overworld: on the surface at night and in caves (monsters spawn at block light 0). Weaken one to a quarter of its health, then use a Passivity Serum on it (Mob Taming research). Strays and wither skeletons are other mobs",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // A crypt floor under a third of the floor (the mob floor measure).
    mobFloor: { ids: ["minecraft:bone_block", "minecraft:cobblestone", "minecraft:mossy_cobblestone", "minecraft:cobbled_deepslate", "minecraft:gravel"], share: 0.3, how: "a crypt floor (bone blocks, cobblestone, mossy cobblestone, cobbled deepslate or gravel)" },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    coats: ["Skeleton"],
    names: ["Rattles", "Clatter", "Femur", "Tibia", "Ribsy", "Bonaparte", "Skully", "Kneecap", "Marrow", "Calcium", "Jawbone", "Clavicle", "Sternum", "Patella", "Coccyx", "Humerus"],
  },
  "zoocraft:zoo_creeper": {
    id: "zoocraft:zoo_creeper",
    displayName: "Creeper",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    // A mob (0.1.164), as the zombie: the vanilla creeper is the one the journal spots, a calmed one the one a Mob Cage
    // carries. It never swells or explodes.
    wildSource: "zoocraft:calm_creeper",
    mobSource: "minecraft:creeper",
    entityType: "zoocraft:zoo_creeper",
    family: "zoo_creeper",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Grain Rations from a Basic Feeder.
    dietTags: ["grain"],
    carrierProfile: "mob",
    baitItem: "zoocraft:grain_ration",
    observe: ["spot", "mobcalm"],
    where: "Anywhere dark in the Overworld: on the surface at night and in caves (monsters spawn at block light 0). Weaken one to a quarter of its health (a bow keeps you out of reach), then use a Passivity Serum on it from a few blocks away (Mob Taming research): too close and it hisses and explodes",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // Grass blocks under a quarter of the floor, and 3 or more leaves or ferns in the pen (leaf blocks in a wall or as a
    // bush, ferns on the grass; a large fern is two).
    mobFloor: { ids: ["minecraft:grass_block"], share: 0.25, how: "grass blocks" },
    mobDecor: { ids: ["minecraft:oak_leaves", "minecraft:spruce_leaves", "minecraft:birch_leaves", "minecraft:jungle_leaves", "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:mangrove_leaves", "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:azalea_leaves", "minecraft:orange_poplar_leaves", "minecraft:red_poplar_leaves", "minecraft:yellow_poplar_leaves", "minecraft:azalea_leaves_flowered", "minecraft:fern", "minecraft:large_fern"], min: 3, how: "leaves or ferns", where: "leaf blocks in a wall or as a bush on the floor, ferns on the grass" },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    // A guest favourite: its pen's view counts a quarter more.
    favourite: true,
    coats: ["Creeper"],
    names: ["Fizzle", "Fizzbang", "Hissy", "Kaboom", "Fuse", "Popper", "Sparky", "Crackle", "Ssseymour", "Blammo", "Greenie", "Cactus", "Ticker", "Boomer", "Fusebox", "Ssslinky"],
  },
  "zoocraft:zoo_spider": {
    id: "zoocraft:zoo_spider",
    displayName: "Spider",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    // A mob (0.1.164), as the zombie. It walks the floor (navigation.walk, no climbing) and through cobwebs at full speed.
    wildSource: "zoocraft:calm_spider",
    mobSource: "minecraft:spider",
    entityType: "zoocraft:zoo_spider",
    family: "zoo_spider",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Meat Rations from a Basic Feeder.
    dietTags: ["meat"],
    carrierProfile: "mob",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "mobcalm"],
    where: "Anywhere dark in the Overworld: on the surface at night and in caves (monsters spawn at block light 0); by day they leave you be unless you hit them. Weaken one to a quarter of its health, then use a Passivity Serum on it (Mob Taming research). Cave spiders are other mobs",
    social: { minGroup: 1, recommendedMax: 6, prefersCompany: false },
    // The dark, darker than the zombies': no daylight and nothing brighter than light 4 on the floor (a Nocturnal Lamp
    // hung 3 blocks above the floor gives 4 right under it), and 3 or more cobwebs in the pen.
    lowLight: true,
    darkLight: 4,
    mobDecor: { ids: ["minecraft:web"], min: 3, how: "cobwebs", where: "hung in the corners and along the walls; spiders walk through them" },
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    coats: ["Spider"],
    names: ["Webster", "Eightlegs", "Silky", "Itsy", "Bitsy", "Tangle", "Creepycrawly", "Crawly", "Spindle", "Lurker", "Weaver", "Cobweb", "Arachne", "Eightball", "Hairy", "Dangle"],
  },
  "zoocraft:zoo_cyclops": {
    id: "zoocraft:zoo_cyclops",
    displayName: "Cyclops",
    plural: "Cyclopes",
    origin: "custom_overworld",
    homeDimension: "minecraft:overworld",
    // A mob (0.1.165): the wild one (a fourth kind in the boss framework) is the one the journal spots; a calmed one (the
    // Passivity Serum used on it while it sits tired out) is the one a Mob Cage carries.
    wildSource: "zoocraft:calm_cyclops",
    mobSource: "zoocraft:wild_cyclops",
    entityType: "zoocraft:zoo_cyclops",
    family: "zoo_cyclops",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen_giant",
    mob: true,
    // Meat Rations from a Basic Feeder.
    dietTags: ["meat"],
    carrierProfile: "mob",
    baitItem: "zoocraft:meat_ration",
    observe: ["spot", "mobcalm"],
    where: "The windswept hills and the stony peaks only, very rarely: one alone in its camp (a clearing ringed with boulders, a campfire in the middle and a bed of hides under a rock wall), made the first time you walk there once your park has done Mob Taming, and never within 1,500 blocks of another. It goes for anyone within 12 blocks (sneak to get closer) and can't be killed: wear it down till it sits down panting (a quarter of its health), then use a Passivity Serum on it",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // Stone underfoot (under half the floor), and a pile of 4 or more mossy cobblestone boulders in the pen.
    mobFloor: { ids: ["minecraft:stone", "minecraft:cobblestone", "minecraft:mossy_cobblestone", "minecraft:andesite", "minecraft:diorite", "minecraft:granite", "minecraft:tuff", "minecraft:calcite", "minecraft:gravel"], share: 0.5, how: "stone (stone, cobblestone, mossy cobblestone, andesite, diorite, granite, tuff, calcite or gravel)" },
    mobDecor: { ids: ["minecraft:mossy_cobblestone"], min: 4, how: "mossy cobblestone boulders", where: "a pile of them on the floor, or in a wall" },
    rationUnitsPerParkDay: 4,
    enrichmentTags: ["forage"],
    // A guest favourite: its pen's view counts a quarter more.
    favourite: true,
    coats: ["Hill"],
    names: ["Polyphemus", "Brontes", "Steropes", "Arges", "Bigeye", "Cobblejaw", "Gorm", "Lumpkin", "Clobber", "Grunt", "Basher", "Stomper", "Ogle", "Squint", "Monocle", "Hurlwick"],
  },
  "zoocraft:zoo_necromancer": {
    id: "zoocraft:zoo_necromancer",
    displayName: "Necromancer",
    origin: "custom_nether",
    homeDimension: "minecraft:nether",
    // A mob (0.1.166): the wild one (a fifth kind in the boss framework) is the one the journal spots; a calmed one (the
    // Passivity Serum used on it while it kneels tired out) is the one a Mob Cage carries.
    wildSource: "zoocraft:calm_necromancer",
    mobSource: "zoocraft:wild_necromancer",
    entityType: "zoocraft:zoo_necromancer",
    family: "zoo_necromancer",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Bone Rations from a Basic Feeder.
    dietTags: ["bone"],
    carrierProfile: "mob",
    baitItem: "zoocraft:bone_ration",
    observe: ["spot", "mobcalm"],
    where: "The Nether only, very rarely: one alone in its crypt (a floor of soul soil and blackstone with broken walls, pillars with soul lanterns, an altar and two headstones) in a soul sand valley or beside a Nether fortress, made the first time you walk there once your park has done Mob Taming, and never within 1,500 blocks of another. It goes for anyone within 12 blocks (sneak to get closer), throws soul bolts and raises skeletons, and can't be killed: wear it down till it kneels down panting (a quarter of its health), then use a Passivity Serum on it",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // Soul sand or soul soil under half the floor, and a soul lantern or more in the pen.
    mobFloor: { ids: ["minecraft:soul_sand", "minecraft:soul_soil"], share: 0.5, how: "soul sand or soul soil" },
    mobDecor: { ids: ["minecraft:soul_lantern"], min: 1, how: "soul lanterns", where: "hung from the roof, or standing on the floor or a wall" },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    // A guest favourite: its pen's view counts a quarter more.
    favourite: true,
    coats: ["Crypt"],
    names: ["Mordecai", "Grimwald", "Ossian", "Morbius", "Revenant", "Hollowell", "Cinderbone", "Soulwick", "Cryptkin", "Duskbane", "Marrowgast", "Sepulchre", "Wraithe", "Bonewick", "Graveling", "Lanthorn"],
  },
  "zoocraft:zoo_voidling": {
    id: "zoocraft:zoo_voidling",
    displayName: "Voidling",
    origin: "custom_end",
    homeDimension: "minecraft:the_end",
    // A mob (0.1.167): the wild one (a sixth kind in the boss framework) is the one the journal spots; a calmed one (the
    // Passivity Serum used on it while it crouches tired out) is the one a Mob Cage carries.
    wildSource: "zoocraft:calm_voidling",
    mobSource: "zoocraft:wild_voidling",
    entityType: "zoocraft:zoo_voidling",
    family: "zoo_voidling",
    movementProfile: "terrestrial",
    habitatProfile: "mob_pen",
    mob: true,
    // Chorus Browse from a Basic Feeder.
    dietTags: ["chorus"],
    carrierProfile: "mob",
    baitItem: "zoocraft:chorus_browse",
    observe: ["spot", "mobcalm"],
    where: "The outer End islands only, very rarely: one alone in its rift (a round floor of end stone with crying obsidian in its middle and a broken ring of obsidian pillars) by an island's edge, made the first time you walk out there once your park has done Mob Taming, and never within 1,500 blocks of another. It is very slow, but it goes for anyone within 10 blocks (sneak to get closer), throws void orbs, and shrieks before it grabs you to drag you to the edge (hit it and it lets go). It can't be killed: wear it down till it crouches down panting (a quarter of its health), then use a Passivity Serum on it",
    social: { minGroup: 1, recommendedMax: 2, prefersCompany: false },
    // A solid floor (no void in the zoo), end stone or end stone bricks under half of it, and a crying obsidian or more.
    mobFloor: { ids: ["minecraft:end_stone", "minecraft:end_bricks"], share: 0.5, how: "end stone or end stone bricks" },
    mobDecor: { ids: ["minecraft:crying_obsidian"], min: 1, how: "crying obsidian", where: "set in the floor or a wall" },
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    // A guest favourite: its pen's view counts a quarter more.
    favourite: true,
    coats: ["Shadow"],
    names: ["Ebon", "Shroud", "Penumbra", "Tenebra", "Sliver", "Stilt", "Gaunt", "Brink", "Lurk", "Nullie", "Dimly", "Duskin", "Murkle", "Inkwell", "Grimble", "Longarm"],
  },
  // The farmyard four (0.1.168, module 12: research/vanilla_plan.md): the game's own sheep, cows, pigs and chickens as zoo
  // copies with the vanilla look (the zoo rabbit's pattern), kept as a petting farm. They share a yard with each other and
  // the rabbits (exhibits/mixing.js farmyard). A sheep keeps its wool colour (species.coatFrom "color": minecraft:color),
  // the others their climate (coatFrom "climate": minecraft:climate_variant, the zoo copy's minecraft:variant). They want
  // hay bedding under a roof (species.hay), sheep and cows grass to graze, pigs a mud wallow; the game's shearing, milking
  // and eggs stay (species.products; animals/farm.js keeps a shorn sheep's wool growing back).
  "zoocraft:zoo_sheep": {
    id: "zoocraft:zoo_sheep",
    displayName: "Sheep",
    plural: "Sheep",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:sheep", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_sheep",
    family: "sheep", // the vanilla family: the journal counts wild and zoo ones as its flock
    movementProfile: "terrestrial",
    habitatProfile: "farmyard",
    dietTags: ["grain"],
    carrierProfile: "livestock",
    baitItem: "minecraft:wheat",
    rack: true,
    observe: ["spot", "graze", "herd"],
    where: "Plains, meadows, forests, taigas and snowy plains, in small flocks",
    social: { minGroup: 2, recommendedMax: 10, prefersCompany: true },
    graze: { perAnimal: 12, share: 0.5 },
    hay: { per: 2, min: 2 }, // bedding: hay bales under a roof, 1 for every 2 in the yard (animals/farmRules.js)
    products: ["wool"],
    petting: true, // with a keeper on its round the yard is a petting farm: guests like it a quarter more
    coatFrom: "color",
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage"],
    coats: ["White", "Orange", "Magenta", "Light Blue", "Yellow", "Lime", "Pink", "Gray", "Light Gray", "Cyan", "Purple", "Blue", "Brown", "Green", "Red", "Black"],
    breeding: { litter: 1, litterMax: 2, gestationDays: 2, matureDays: 2, cooldownDays: 3, juvenileScale: 0.5, young: "lamb", youngPlural: "lambs" },
    names: ["Woolly", "Fleece", "Baabara", "Lambchop", "Cotton", "Fluffy", "Lanolin", "Dolly", "Shearlock", "Daisy", "Puffball", "Ramsey", "Woolbert", "Muffin", "Snowball", "Tufty"],
  },
  "zoocraft:zoo_cow": {
    id: "zoocraft:zoo_cow",
    displayName: "Cow",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:cow", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_cow",
    family: "cow", // the vanilla family: the journal counts wild and zoo ones as its herd
    movementProfile: "terrestrial",
    habitatProfile: "farmyard",
    dietTags: ["grain"],
    carrierProfile: "livestock",
    baitItem: "minecraft:wheat",
    rack: true,
    observe: ["spot", "graze", "herd"],
    where: "Plains, meadows, forests, savannas and taigas, in small herds",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    graze: { perAnimal: 12, share: 0.5 },
    hay: { per: 2, min: 2 }, // bedding: hay bales under a roof, 1 for every 2 in the yard (animals/farmRules.js)
    products: ["milk"],
    petting: true, // with a keeper on its round the yard is a petting farm: guests like it a quarter more
    coatFrom: "climate",
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    coats: ["Temperate", "Warm", "Cold"],
    breeding: { litter: 1, gestationDays: 3, matureDays: 3, cooldownDays: 4, juvenileScale: 0.5, young: "calf", youngPlural: "calves" },
    names: ["Bessie", "Buttercup", "Clarabelle", "Moolinda", "Milky", "Moobert", "Gertie", "Mabel", "Brownie", "Caramel", "Dottie", "Bluebell", "Mootilda", "Angus", "Ferdinand", "Pumpkin"],
  },
  "zoocraft:zoo_pig": {
    id: "zoocraft:zoo_pig",
    displayName: "Pig",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:pig", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_pig",
    family: "pig", // the vanilla family: the journal counts wild and zoo ones as its herd
    movementProfile: "terrestrial",
    habitatProfile: "farmyard",
    dietTags: ["grain", "root"],
    carrierProfile: "livestock",
    baitItem: "minecraft:carrot",
    observe: ["spot", "sniff", "herd"],
    where: "Plains, forests, savannas, jungles and taigas, in small groups",
    social: { minGroup: 2, recommendedMax: 8, prefersCompany: true },
    mud: { minCells: 4 },
    hay: { per: 2, min: 2 }, // bedding: hay bales under a roof, 1 for every 2 in the yard (animals/farmRules.js)
    products: [],
    petting: true, // with a keeper on its round the yard is a petting farm: guests like it a quarter more
    coatFrom: "climate",
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage", "dig"],
    coats: ["Temperate", "Warm", "Cold"],
    breeding: { litter: 2, litterMax: 4, gestationDays: 2, matureDays: 2, cooldownDays: 3, juvenileScale: 0.5, young: "piglet", youngPlural: "piglets" },
    names: ["Wilbur", "Babe", "Oinkers", "Hamlet", "Porkchop", "Snorty", "Truffles", "Hogwash", "Curly", "Snuffles", "Snoutie", "Penelope", "Napoleon", "Gloria", "Squeaky", "Piggles"],
  },
  "zoocraft:zoo_chicken": {
    id: "zoocraft:zoo_chicken",
    displayName: "Chicken",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:chicken", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_chicken",
    family: "chicken", // the vanilla family: the journal counts wild and zoo ones as its flock
    movementProfile: "terrestrial",
    habitatProfile: "coop",
    dietTags: ["grain", "seed"],
    carrierProfile: "small",
    baitItem: "minecraft:wheat_seeds",
    observe: ["spot", "peck", "flock"],
    where: "Plains, forests, savannas, jungles and taigas, in small flocks",
    social: { minGroup: 3, recommendedMax: 12, prefersCompany: true },
    hay: { per: 2, min: 2 }, // bedding: hay bales under a roof, 1 for every 2 in the yard (animals/farmRules.js)
    products: ["eggs"],
    petting: true, // with a keeper on its round the yard is a petting farm: guests like it a quarter more
    coatFrom: "climate",
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["forage"],
    coats: ["Temperate", "Warm", "Cold"],
    breeding: { litter: 1, litterMax: 3, gestationDays: 1, matureDays: 2, cooldownDays: 2, juvenileScale: 0.5, young: "chick", youngPlural: "chicks" },
    names: ["Henrietta", "Clucky", "Pecky", "Eggbert", "Feathers", "Goldie", "Peep", "Henny", "Penny", "Cluckers", "Omelette", "Cornflake", "Speckles", "Scramble", "Featherby", "Chirpy"],
  },
  // Wolves and foxes (0.1.169, module 12: research/vanilla_plan.md): the game's own as zoo copies with the vanilla look
  // (the zoo rabbit's pattern) and the game's own ways (animals/woodlandRules.js). A wolf keeps its coat (minecraft:variant,
  // all nine), a fox red or arctic. Any of their foods coaxes one in (species.baitAlso). Wolves: a pack with a den (cover)
  // and Scent Posts to follow as a scent trail (species.scentTrail: the zoo wolf walks to one now and then). Foxes: alone
  // or a pair, napping by day under cover as the game's foxes do (species.naps: the journal reads the sleeping flag), with
  // Burrow Soil to dig in (toys "soil") and a Puzzle Feeder to find their food in.
  "zoocraft:zoo_wolf": {
    id: "zoocraft:zoo_wolf",
    displayName: "Wolf",
    plural: "Wolves",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:wolf", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_wolf",
    family: "wolf", // the vanilla family: the journal counts wild and zoo ones as its pack
    movementProfile: "terrestrial",
    habitatProfile: "pack",
    dietTags: ["meat"],
    carrierProfile: "livestock",
    baitItem: "zoocraft:meat_ration",
    baitAlso: ["minecraft:beef", "minecraft:porkchop", "minecraft:mutton", "minecraft:chicken", "minecraft:rabbit"], // the raw meats coax one in too
    baitText: "some raw meat (beef, pork, mutton, chicken or rabbit) or a Meat Ration",
    observe: ["spot", "pack", "sniff"],
    where: "Taigas and forests, in packs: pale ones in taigas, ashen in snowy taigas, black and chestnut in old growth taigas, rusty in sparse jungles, snowy in groves, spotted on savanna plateaus, striped in wooded badlands, woods ones in forests. They leave you be unless one is hit",
    social: { minGroup: 3, recommendedMax: 8, prefersCompany: true },
    cover: { minFraction: 0.1, why: "a den" }, // a roofed corner or trees, where the pack lies up together
    scentTrail: true, // the zoo wolf walks to a Scent Post now and then and noses it (entities/zoo_wolf.json move_to_block)
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["scent", "forage"],
    coats: ["Pale", "Ashen", "Black", "Chestnut", "Rusty", "Snowy", "Spotted", "Striped", "Woods"],
    breeding: { litter: 2, litterMax: 4, gestationDays: 3, matureDays: 4, cooldownDays: 5, juvenileScale: 0.5, young: "pup", youngPlural: "pups" },
    names: ["Fang", "Shadow", "Storm", "Timber", "Koda", "Kiba", "Rook", "Fenrir", "Akela", "Kaya", "Lobo", "Sitka", "Raksha", "Howl", "Moonfang", "Tala"],
  },
  "zoocraft:zoo_fox": {
    id: "zoocraft:zoo_fox",
    displayName: "Fox",
    plural: "Foxes",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:fox", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_fox",
    family: "fox", // the vanilla family: the journal counts wild and zoo ones
    movementProfile: "terrestrial",
    habitatProfile: "small_terrestrial",
    dietTags: ["fruit"],
    carrierProfile: "small",
    baitItem: "zoocraft:fruit_ration",
    baitAlso: ["minecraft:sweet_berries", "minecraft:glow_berries"], // berries coax one in too
    baitText: "sweet berries, glow berries or a Fruit Ration",
    observe: ["spot", "nap", "sniff"],
    where: "Taigas, old growth taigas and groves; white arctic foxes where the ground is snowy. By day they nap under the trees, at night they hunt rabbits and chickens. Shy: they run from anyone who isn't sneaking. Sneak up holding sweet berries and one comes to you",
    social: { minGroup: 1, recommendedMax: 5, prefersCompany: false }, // alone or a pair, with a litter
    cover: { minFraction: 0.2, why: "cover to nap under" },
    naps: true, // naps by day under cover, as the game's foxes do (entities/zoo_fox.json fox_day)
    toys: ["soil"], // digs in Burrow Soil (animals/woodlandRules.js soilFixtures)
    rationUnitsPerParkDay: 1,
    enrichmentTags: ["dig", "manipulate", "forage"],
    coats: ["Red", "Arctic"],
    breeding: { litter: 2, litterMax: 3, gestationDays: 2, matureDays: 3, cooldownDays: 4, juvenileScale: 0.5, young: "kit", youngPlural: "kits" },
    names: ["Reynard", "Tod", "Vixey", "Copper", "Brush", "Snowdrop", "Kitsune", "Marmalade", "Tinsel", "Flurry", "Paprika", "Sly", "Cinnabar", "Scarlet", "Rufus", "Swift"],
  },
  // Pandas (0.1.170, module 12: research/vanilla_plan.md "0.1.170 pandas: the design"): the game's own as a zoo copy with
  // the vanilla look and ways (animals/bambooRules.js). Each keeps the gene that shows on it (species.genes: its coat is
  // minecraft:variant 0-6, so a brown one is brown and a lazy one lazes), and a cub takes after a parent. Bamboo or a Leafy
  // Ration coaxes one in. A bamboo grove growing in the floor (species.grove) is something to browse, and they have cubs
  // only with one; shade over part of it.
  "zoocraft:zoo_panda": {
    id: "zoocraft:zoo_panda",
    displayName: "Panda",
    plural: "Pandas",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:panda", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_panda",
    family: "panda", // the vanilla family: the journal counts wild and zoo ones
    movementProfile: "terrestrial",
    habitatProfile: "medium_terrestrial",
    dietTags: ["leafy"],
    carrierProfile: "livestock",
    baitItem: "zoocraft:leafy_ration",
    baitAlso: ["minecraft:bamboo"], // bamboo coaxes one in too
    baitText: "some bamboo or a Leafy Ration",
    observe: ["spot", "bamboo", "gene"],
    where: "Bamboo jungles, and now and then jungles, alone or two or three together, sitting in the bamboo chewing a stalk. Calm: an aggressive one swats back if hit, and a worried one keeps away from people. Hold bamboo and one comes to you",
    social: { minGroup: 1, recommendedMax: 4, prefersCompany: false },
    cover: { minFraction: 0.15, why: "shade" },
    grove: { min: 6 }, // stalks of bamboo growing in the floor or beside it (animals/bambooRules.js measureBamboo)
    genes: true, // the coat is the gene that shows (minecraft:variant 0-6; entities/zoo_panda.json zoocraft:coat_N)
    toys: ["grove"], // a bamboo grove is something to browse (forage enrichment)
    rationUnitsPerParkDay: 2,
    enrichmentTags: ["forage", "climb", "manipulate"],
    coats: ["Normal", "Lazy", "Worried", "Playful", "Brown", "Weak", "Aggressive"],
    breeding: { litter: 1, gestationDays: 4, matureDays: 6, cooldownDays: 8, juvenileScale: 0.4, grove: true, young: "cub", youngPlural: "cubs" },
    names: ["Bao", "Mei", "Ling", "Tuan", "Yuan", "Xiao", "Panko", "Ping", "Jade", "Tofu", "Sesame", "Wonton", "Nori", "Taro", "Lychee", "Dango"],
  },
  // Polar bears (0.1.174, module 12: research/vanilla_plan.md "0.1.174 polar bears: the design"): the game's own as a zoo
  // copy (its look; the young drawn with the grown model, 0.1.172), kept like the big cats: dangerous (Holding Dens, a
  // cub going in and out with its mother, the double Keeper Gate, warn then swipe: animals/predators.js), stepped by
  // animals/polarBear.js. Cold (a stocked Cooling Unit), a pool to swim in (the "polar_bear" profile) and snow or ice
  // under a quarter of the floor (the yeti's snow measure: species.snowFloor). Caught wild like the big cats: a Fish
  // Ration or raw cod or salmon thrown down near a grown one; it can be crated while it eats. The game's own
  // minecraft:on_calm takes an angry one's attack off as it goes to eat (wildCalm), and one let go in the wild comes out
  // grown (wildGrown: the game's grow-up event; its spawn rolls a cub one time in ten).
  "zoocraft:zoo_polar_bear": {
    id: "zoocraft:zoo_polar_bear",
    displayName: "Polar Bear",
    plural: "Polar Bears",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:polar_bear", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_polar_bear",
    family: "polarbear", // the vanilla family: the journal counts wild and zoo ones
    movementProfile: "amphibious",
    habitatProfile: "polar_bear",
    // Fish (zoos feed polar bears fish, meat and a carnivore diet): Fish Rations, or raw cod or salmon, from a Basic Feeder.
    dietTags: ["fish"],
    carrierProfile: "large",
    baitItem: "zoocraft:fish_ration",
    baitAlso: ["minecraft:cod", "minecraft:salmon"], // raw cod or salmon thrown down draws one over too
    baitText: "a Fish Ration or a raw cod or salmon",
    wildCalm: "minecraft:on_calm",
    wildGrown: "minecraft:ageable_grow_up",
    observe: ["spot", "swim", "bank"],
    where: "Snowy plains, ice spikes and frozen oceans and rivers, alone or a mother with her cubs, swimming between the ice. Calm unless one is hit or someone comes near a cub; then a grown one stands up and charges. Throw a Fish Ration (or a raw cod or salmon) down near a grown one: while it eats it's calm, and can be crated",
    social: { minGroup: 1, recommendedMax: 3, prefersCompany: false },
    dangerous: true,
    dens: { spare: 0, cubsFollow: true },
    cold: true,
    snowFloor: { share: 0.25 },
    rationUnitsPerParkDay: 4,
    enrichmentTags: ["swim", "manipulate", "forage"],
    coats: ["White"],
    // 1 or 2 cubs (litterMax), born in the den with their mother; they stay by her till they're grown.
    breeding: { litter: 1, litterMax: 2, gestationDays: 4, matureDays: 8, cooldownDays: 8, juvenileScale: 0.5, young: "cub", youngPlural: "cubs" },
    sounds: { warn: "mob.polarbear.warning", warnPitch: 1.0, swipe: "mob.polarbear.warning", swipePitch: 0.75 },
    names: ["Nanuq", "Siku", "Aput", "Qannik", "Ukiuq", "Nuka", "Kallik", "Taqqiq", "Iceberg", "Pakak", "Floe", "Nilak", "Tundra Rose", "Sila", "Anuri", "Hudson"],
  },
  // Horses and donkeys (0.1.175, module 12: research/vanilla_plan.md "0.1.175 horses and donkeys: the design"): the game's
  // own as zoo copies (its look; the young drawn with the grown model, 0.1.172), kept in a paddock: room, a straight run
  // of floor to gallop along (species.run), grass to graze, hay bales under a roof in a stable corner (species.hay), a Hay
  // Rack, and grooming (species.groom: the game's brush used on each one, or a keeper with the paddock on their round).
  // animals/paddock.js grazes and gallops them (rules in animals/paddockRules.js). A horse keeps its coat (the game's 7)
  // and its markings (the game's 5: species.marks); one let go in the wild gets its coat back by the game's own colour
  // events (species.wildCoats: minecraft:make_<colour>) and, like every one of the game's own animals but the polar bear,
  // comes out grown (the game's spawn rolls a foal one time in five: quests/conservationRules.js growsUpWhenFreed).
  "zoocraft:zoo_horse": {
    id: "zoocraft:zoo_horse",
    displayName: "Horse",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:horse", // catching the wild one makes the zoo copy (the game's own look)
    entityType: "zoocraft:zoo_horse",
    family: "horse", // the vanilla family: the journal counts wild and zoo ones as its herd
    movementProfile: "terrestrial",
    habitatProfile: "paddock",
    dietTags: ["grain"],
    carrierProfile: "livestock",
    baitItem: "minecraft:wheat",
    baitAlso: ["zoocraft:grain_ration"], // a Grain Ration (hay) coaxes one in too
    baitText: "some wheat or a Grain Ration",
    rack: true,
    observe: ["spot", "graze", "herd"],
    where: "Plains and savannas, in herds of 2 to 6 of one colour",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    graze: { perAnimal: 30, share: 0.5 },
    hay: { per: 1, min: 1 }, // a stable corner: a hay bale under a roof for each (a 12 by 12 foot box each, the Defra code)
    run: { length: 20 }, // a straight run of floor 2 wide to gallop along (a 20 by 40 riding arena's short side)
    groom: true, // a brush on each one every few park days, or a keeper on the round
    marks: true, // its markings, the game's minecraft:mark_variant
    wildCoats: ["white", "creamy", "chestnut", "brown", "black", "gray", "darkbrown"], // the game's minecraft:make_<colour>
    rationUnitsPerParkDay: 4,
    enrichmentTags: ["forage"],
    coats: ["White", "Creamy", "Chestnut", "Brown", "Black", "Gray", "Dark Brown"],
    // One foal after about 11 months (4 park days), grown in 4.
    breeding: { litter: 1, gestationDays: 4, matureDays: 4, cooldownDays: 5, juvenileScale: 0.5, young: "foal", youngPlural: "foals" },
    names: ["Duchess", "Thunder", "Spirit", "Apollo", "Rosie", "Ranger", "Galloway", "Mustang", "Palomino", "Trigger", "Bronco", "Mistral", "Pegasus", "Whinny", "Clyde", "Shire"],
  },
  // Donkeys: a smaller paddock (the "donkey_paddock" profile), a shorter run and less grass (Scotland's equine code:
  // donkeys need much less grazing than horses), a hay bale for every 2 (the Donkey Sanctuary: 50 square feet of bedded
  // shelter each), always in company (the Donkey Sanctuary rehomes them only in pairs). They gallop half as often as
  // horses, and make a petting farm with a keeper on the round, as the farmyard four. They share a paddock with horses.
  "zoocraft:zoo_donkey": {
    id: "zoocraft:zoo_donkey",
    displayName: "Donkey",
    origin: "vanilla",
    homeDimension: "minecraft:overworld",
    wildSource: "minecraft:donkey",
    entityType: "zoocraft:zoo_donkey",
    family: "donkey",
    movementProfile: "terrestrial",
    habitatProfile: "donkey_paddock",
    dietTags: ["grain"],
    carrierProfile: "livestock",
    baitItem: "minecraft:wheat",
    baitAlso: ["zoocraft:grain_ration"],
    baitText: "some wheat or a Grain Ration",
    rack: true,
    observe: ["spot", "graze", "herd"],
    where: "Plains, savannas and meadows, alone or in twos and threes",
    social: { minGroup: 2, recommendedMax: 6, prefersCompany: true },
    graze: { perAnimal: 16, share: 0.5 },
    hay: { per: 2, min: 1 },
    run: { length: 12, gallop: 0.5 },
    groom: true,
    petting: true, // with a keeper on its round the paddock is a petting farm: guests like it a quarter more
    rationUnitsPerParkDay: 3,
    enrichmentTags: ["forage"],
    coats: ["Gray"],
    breeding: { litter: 1, gestationDays: 4, matureDays: 4, cooldownDays: 5, juvenileScale: 0.5, young: "foal", youngPlural: "foals" },
    names: ["Jack", "Jenny", "Honey", "Taffy", "Bertie", "Ollie", "Peggy", "Gus", "Hamish", "Winnie", "Poppet", "Wellington", "Parsnip", "Tumbleweed", "Buttons", "Mojave"],
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

// Every item that coaxes a wild one into its carrier: its bait, and any more it takes (species.baitAlso, 0.1.169).
export function baitItems(species) {
  return [species.baitItem, ...(species.baitAlso ?? [])].filter(Boolean);
}

export function speciesForWild(typeId) {
  return Object.values(SPECIES).find((s) => s.wildSource === typeId);
}

export function speciesForEntity(typeId) {
  return Object.values(SPECIES).find((s) => s.entityType === typeId);
}

// The zoo mob a vanilla mob is (0.1.163: the zombie the journal spots; 0.1.164 the creeper and spider too), or undefined.
export function speciesForMob(typeId) {
  return Object.values(SPECIES).find((s) => s.mobSource === typeId);
}
