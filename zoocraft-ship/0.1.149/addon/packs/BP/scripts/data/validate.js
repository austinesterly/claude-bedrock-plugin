// Checks the data tables against each other at startup and in the unit tests, so a typo in a
// species entry fails loudly instead of producing an animal nobody can feed (spec section 5.5).

import { SPECIES } from "./species.js";
import { HABITAT_PROFILES } from "./profiles.js";
import { RATIONS, CARRIERS } from "./items.js";
import { BALANCE } from "./balance.js";
import { PROJECTS } from "./research.js";

export function validateData() {
  const errors = [];
  const diets = new Set(Object.values(RATIONS).map((r) => r.diet));
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.id !== key) errors.push(`${key}: id field is ${s.id}`);
    if (!s.id.startsWith("zoocraft:")) errors.push(`${key}: id must use the zoocraft namespace`);
    if (!HABITAT_PROFILES[s.habitatProfile]) errors.push(`${key}: unknown habitat profile ${s.habitatProfile}`);
    if (!CARRIERS[s.carrierProfile]) errors.push(`${key}: unknown carrier ${s.carrierProfile}`);
    for (const d of s.dietTags) if (!diets.has(d)) errors.push(`${key}: no ration feeds diet "${d}"`);
    if (s.baitItem && !RATIONS[s.baitItem]) errors.push(`${key}: bait ${s.baitItem} is not a ration`);
    if (!(s.rationUnitsPerParkDay > 0)) errors.push(`${key}: rationUnitsPerParkDay must be positive`);
    if (!s.names?.length) errors.push(`${key}: needs at least one default name`);
    if (!s.coats?.length) errors.push(`${key}: needs at least one coat (a name for each look)`);
    const b = s.breeding;
    if (b && !(b.litter >= 1 && b.gestationDays >= 1 && b.matureDays >= 1 && b.cooldownDays >= 0 && b.juvenileScale > 0 && b.juvenileScale < 1 && b.young)) errors.push(`${key}: breeding entry is incomplete`);
    if (s.sexByCoat && s.sexByCoat.length !== s.coats.length) errors.push(`${key}: sexByCoat needs one entry per coat`);
    for (const t of s.toys ?? []) {
      const kind = BALANCE.enrichment.fromEquipment[t];
      if (!kind || !s.enrichmentTags.includes(kind)) errors.push(`${key}: toy ${t} gives no enrichment it enjoys`);
    }
    if (s.lavaSwimmer && !HABITAT_PROFILES[s.habitatProfile]?.lava) errors.push(`${key}: a lava swimmer needs a lava habitat profile`);
    if (s.lavaWalker && !HABITAT_PROFILES[s.habitatProfile]?.onLava) errors.push(`${key}: a lava walker needs a lava shore habitat profile`);
    if (Boolean(s.flies) !== Boolean(HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: a flyer needs an aerial habitat profile, and only a flyer can have one`);
    // Nesting birds (flamingos, 0.1.72): a flock, nest sites and mirrors, a wetland, and a park day building
    // before the egg (gestationDays 2 or more).
    const n = s.nest;
    if (n && !(n.flock >= 2 && n.sites >= 1 && n.mirrorBirds >= 0 && b?.gestationDays >= 2 && HABITAT_PROFILES[s.habitatProfile]?.amphibious)) errors.push(`${key}: a nesting species needs a flock, nest sites, a wetland profile and 2 or more days expecting`);
    if (s.pink && !Object.values(RATIONS).some((r) => r.pink && s.dietTags.includes(r.diet))) errors.push(`${key}: a pink species needs a pink ration it eats`);
    if (s.wades && !(HABITAT_PROFILES[s.habitatProfile]?.minShallowWater > 0)) errors.push(`${key}: a wader needs shallows in its habitat profile`);
    // Grazers, Hay Racks and harems (zebras, 0.1.74).
    if (s.graze && !(s.graze.perAnimal > 0 && s.graze.share > 0 && s.graze.share < 1)) errors.push(`${key}: a grazer needs grass for each animal and a share of its food from grazing below 1`);
    if (s.rack && !s.dietTags.some((d) => d === "grain" || d === "leafy")) errors.push(`${key}: a Hay Rack holds only Grain or Leafy Rations, and this species eats neither`);
    if (s.harem && s.sexByCoat) errors.push(`${key}: a harem species has stallions and mares in every coat`);
    // Big predators (lions, 0.1.75): crated in a Reinforced Crate, meat-eaters fed Meat Rations, Holding
    // Dens, and a litter range.
    // A gorilla (0.1.80) is baited with a Fruit Ration: the bait is whatever the species eats.
    // A shark (0.1.125) is the exception: a dangerous big fish in the Large Water Tank, no dens (keepers never go in).
    if (s.dangerous && !s.shark && !(s.carrierProfile === "large" && s.dens && s.dens.spare >= 0 && s.dietTags.includes(RATIONS[s.baitItem]?.diet))) errors.push(`${key}: a dangerous species travels in a Reinforced Crate, is baited with a ration it eats and has Holding Dens`);
    if (s.shark && !(s.dangerous && s.bigFish && !s.dens && s.dangerMoves && s.dietTags.includes(RATIONS[s.baitItem]?.diet))) errors.push(`${key}: a shark is a dangerous big fish without Holding Dens, with its own danger line, baited with a ration it eats`);
    if (b?.litterMax !== undefined && !(Number.isInteger(b.litterMax) && b.litterMax >= b.litter)) errors.push(`${key}: litterMax is a whole number, at least the litter`);
    if (s.manes && !s.sexByCoat) errors.push(`${key}: a maned species shows its males by its coat`);
    // Tigers (0.1.76): a solitary species takes turns out of its Holding Dens (a den each, cubs in with
    // their mother); its stripe patterns and its sex are on the mob (zoocraft:pattern_N, zoocraft:sex_N).
    if (s.solitary && !(s.dangerous && s.dens?.spare >= 0 && s.dens.cubsFollow && !s.social.prefersCompany)) errors.push(`${key}: a solitary species is dangerous, has a Holding Den each with the cubs following, and lives alone`);
    if (s.patterns !== undefined && !(Number.isInteger(s.patterns) && s.patterns >= 1 && s.sexLook && !s.sexByCoat)) errors.push(`${key}: patterns is a whole number, with the sex shown on the mob`);
    if (s.privacy && !s.solitary) errors.push(`${key}: privacy (screened floor) is for solitary species`);
    // Crocodiles (0.1.77): a basking bank and deep water to go under (an amphibious profile), shore clearance
    // for a dangerous species, meals about once a week, a size on the mob, and a sand nest.
    if ((s.basks || s.submerges) && !HABITAT_PROFILES[s.habitatProfile]?.amphibious) errors.push(`${key}: a basking bank and deep water need an amphibious habitat profile`);
    if (s.shoreClear && !s.dangerous) errors.push(`${key}: shore clearance is a keepers' rule for dangerous species`);
    if (s.meals && !(s.meals.every >= 1 && s.meals.at > 0 && s.meals.at < 100)) errors.push(`${key}: meals every 1 or more park days, eaten below a satiety between 0 and 100`);
    if (s.sizes !== undefined && !(Number.isInteger(s.sizes) && s.sizes >= 1 && s.sexLook)) errors.push(`${key}: sizes is a whole number, with the sex shown on the mob`);
    if (s.sandNest && !(s.sandNest.sites >= 1 && b?.gestationDays >= 2 && !s.nest)) errors.push(`${key}: a sand nest needs sites, 2 or more days expecting, and no flamingo nest`);
    // Red pandas (0.1.79): the canopy is counted by the climb measure, so a species that lives up in the trees climbs.
    if (s.canopy && !(s.climbs && s.climbTree)) errors.push(`${key}: a canopy is reached by climbing (climbs and climbTree)`);
    // Gorillas (0.1.80): the ape measure is its own (never with the raccoon's climb-proofing); a troop is one
    // male with the females, its sexes on the mob; an ape gets out only where it's dangerous to meet loose.
    if (s.ape && (s.climbs || !s.dangerous)) errors.push(`${key}: an ape is measured for strong walls (not climbs), and is dangerous`);
    if (s.troop && !(s.sexLook && !s.harem && !s.sexByCoat)) errors.push(`${key}: a troop shows its sexes on the mob (sexLook), and isn't a harem`);
    // Owls (0.1.81): a bird that roosts on Perches flies in an aviary that counts them; eggs in a Nest Box.
    if (s.roosts && !(s.flies && HABITAT_PROFILES[s.habitatProfile]?.minRoosts)) errors.push(`${key}: a bird that roosts on Perches flies (flies), in a profile that counts them (minRoosts)`);
    if (s.breeding?.nestBox && !s.roosts) errors.push(`${key}: eggs in a Nest Box are for the birds that roost (roosts)`);
    // Crimson Grazers (0.1.84): crimson ground and a rubbing stem are a Nether herd's, shown with its sexes on the mob.
    if ((s.nylium || s.rubStem) && !(s.heat && s.sexLook && s.social?.prefersCompany)) errors.push(`${key}: crimson ground and a rubbing stem are for a Nether herd (heat, sexLook, prefersCompany)`);
    // Warped Geckos (0.1.85): an Insect Feeder holds Insect Rations; a clinger is measured by its own wall measure
    // (never with the raccoon's or the gorilla's), walks (no aerial profile) and eats from an Insect Feeder; one grown
    // male is told apart on the mob.
    if (s.insectFeeder && !s.dietTags.includes("insect")) errors.push(`${key}: an Insect Feeder holds only Insect Rations, and this species doesn't eat them`);
    if (s.clings && (s.climbs || s.ape || s.flies || !s.insectFeeder || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: a clinger has its own wall measure (not climbs or ape), walks, and eats from an Insect Feeder`);
    if (s.oneMale && !s.sexLook) errors.push(`${key}: one grown male is told apart on the mob (sexLook)`);
    if (s.homeGround && !((typeof s.homeGround.id === "string" || (Array.isArray(s.homeGround.ids) && s.homeGround.ids.length > 0)) && typeof s.homeGround.text === "string")) errors.push(`${key}: homeGround is { id or ids, text }`);
    // Cinder Boars (0.1.87): a wallow is a Nether animal's, with ash to root in; the boar measure is its own (never with
    // the raccoon's, the gorilla's or the gecko's), for a walker.
    if (s.wallow && !(s.wallow.minCells >= 1 && s.heat && s.ash)) errors.push(`${key}: a wallow is Thermal Mud blocks (minCells) for a Nether animal that roots in ash (heat, ash)`);
    if (s.boarProof && (s.climbs || s.ape || s.clings || s.flies || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: a boar is measured for the wood it breaks (not climbs, ape or clings), and walks`);
    // Soul Moths (0.1.88): a Nectar Feeder holds nectar; soul light is for a flyer in a moth house (a profile with
    // nectar) that eats from one; caterpillars want host plants and lie as a pupa through the last days of growing up; a
    // house allowed more light than the Nocturnal Lamps' is a night animal's, and darker than daylight.
    if (s.nectarFeeder && !s.dietTags.includes("nectar")) errors.push(`${key}: eats from a Nectar Feeder, so its diet is nectar`);
    if (s.soulLight && !(s.flies && s.nectarFeeder && HABITAT_PROFILES[s.habitatProfile]?.nectar)) errors.push(`${key}: gathers round soul light: a flyer in a moth house (a profile with nectar), eating from a Nectar Feeder`);
    // Quartz Beetles (0.1.89): grubs live in Mineral Substrate (breeding.substrate) as caterpillars on host plants, and
    // pupate too; the bed is Mineral Substrate blocks (minCells) for a Nether animal under a cave roof.
    if (b && (b.hostPlants !== undefined || b.substrate !== undefined || b.pupaDays !== undefined) && !((b.hostPlants >= 1) !== (b.substrate >= 1) && b.pupaDays >= 1 && b.pupaDays < b.matureDays)) errors.push(`${key}: caterpillars need host plants (1 or more), grubs Mineral Substrate (1 or more), one or the other, and pupa days inside the days growing up`);
    if (s.substrate && !(s.substrate.minCells >= 1 && s.heat && s.cover && !s.flies && (!b?.substrate || b.substrate >= s.substrate.minCells))) errors.push(`${key}: a bed is Mineral Substrate blocks (minCells) for a Nether animal that walks under a roof, and the grubs' at least as big`);
    if (b?.substrate && !s.substrate) errors.push(`${key}: grubs in Mineral Substrate are a beetle's (species.substrate)`);
    // End Hoppers (0.1.91): the jump measure is its own (never with the raccoon's, the gorilla's, the gecko's or the
    // boar's), for a walker; Landing Pads are counted by it.
    if (s.hops && (s.climbs || s.ape || s.clings || s.boarProof || s.flies || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: a leaper has its own jump measure (not climbs, ape, clings or boarProof), and walks`);
    if (s.pads && !s.hops) errors.push(`${key}: Landing Pads are counted by the jump measure (species.hops)`);
    // Shimmer Snails (0.1.92): the crevice measure runs over a walking floor; eggs in Mineral Substrate are counted by the
    // mineral bed; a hermaphrodite has no sexes, so nothing that goes by sex.
    if (s.crevices && (s.flies || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: crevices are counted on a walking floor`);
    if (s.mineralBed && !(s.mineralBed.minCells >= 1)) errors.push(`${key}: a mineral bed needs a size (mineralBed.minCells)`);
    if (b?.eggBed && !s.mineralBed && !s.substrateNest) errors.push(`${key}: eggs laid in Mineral Substrate are counted with the mineral bed (species.mineralBed) or for a nest (species.substrateNest)`);
    if (s.hermaphrodite && (s.sexLook || s.sexByCoat || s.harem || s.manes || s.troop || s.solitary || s.oneMale)) errors.push(`${key}: a hermaphrodite has no sexes (not sexLook, sexByCoat, harem, manes, troop, solitary or oneMale)`);
    // Obsidian Crabs (0.1.93): a Mineral Feeder holds Mineral Pellets; the rock measure and the burrows are a walking
    // floor's; a mother carrying her eggs has a sex.
    if (s.mineralFeeder && !s.dietTags.includes("mineral")) errors.push(`${key}: eats from a Mineral Feeder, so its diet is mineral`);
    if ((s.rockFaces || s.burrows) && (s.flies || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: rock faces and burrows are counted on a walking floor`);
    if (s.rockFaces && !(s.rockFaces.first >= 1 && s.rockFaces.extra >= 0)) errors.push(`${key}: rock faces for the first and for each extra (rockFaces.first, rockFaces.extra)`);
    if (s.burrows && !(s.burrows.perCrab >= 1 && s.burrows.minCells >= 1)) errors.push(`${key}: Mineral Substrate to dig into for each and at least (burrows.perCrab, burrows.minCells)`);
    if (b?.carried && s.hermaphrodite) errors.push(`${key}: a mother carries the eggs, so it has sexes`);
    // Chorus Moths (0.1.94): chorus flowers are for a flyer in a moth house (a profile with nectar) that eats from a
    // Nectar Feeder, one for each and a few at least; low light is the nocturnal house's test, not a night animal's
    // turned-round day; the caterpillars' host plants can be named.
    if (s.chorusFlowers && !(s.flies && s.nectarFeeder && HABITAT_PROFILES[s.habitatProfile]?.nectar && s.chorusFlowers.min >= 1 && s.chorusFlowers.perMoth > 0)) errors.push(`${key}: hovers at chorus flowers: a flyer in a moth house eating from a Nectar Feeder, with flowers for each and at least (chorusFlowers.perMoth, chorusFlowers.min)`);
    if (s.lowLight && (s.nightLife || s.nocturnal)) errors.push(`${key}: low light is a dim house at any hour, not a night animal's`);
    if (b?.hostText !== undefined && !(b.hostPlants >= 1 && typeof b.hostText === "string" && b.hostText.length > 0)) errors.push(`${key}: host plants named (breeding.hostText) for caterpillars that eat them`);
    // Starback Tortoises (0.1.95): chorus, Warm Pads and a low roof are counted on a walking floor, each for so many and
    // a few at least; a nest dug in the Mineral Substrate needs it counted (substrateNest) and some of it (eggBed), and a
    // mother to dig it.
    if ((s.endPlants || s.warmPads || s.retreat) && (s.flies || HABITAT_PROFILES[s.habitatProfile]?.aerial)) errors.push(`${key}: chorus, Warm Pads and a retreat are counted on a walking floor`);
    if (s.endPlants && !(s.endPlants.perTortoise > 0 && s.endPlants.min >= 1)) errors.push(`${key}: chorus for each and at least (endPlants.perTortoise, endPlants.min)`);
    if (s.warmPads && !(s.warmPads.perPad >= 1 && s.warmPads.min >= 1)) errors.push(`${key}: a Warm Pad for so many and at least (warmPads.perPad, warmPads.min)`);
    if (s.retreat && !(s.retreat.perTortoise >= 1 && s.retreat.min >= 1)) errors.push(`${key}: floor under the low roof for each and at least (retreat.perTortoise, retreat.min)`);
    if (b?.nestDig && !(b.eggBed >= 1 && s.substrateNest && !s.hermaphrodite)) errors.push(`${key}: a nest dug in the Mineral Substrate needs it counted (substrateNest), some of it (breeding.eggBed) and a mother`);
    if (s.houseLight !== undefined && !(s.nightLife && s.houseLight >= BALANCE.nocturnal.maxLight && s.houseLight < 15)) errors.push(`${key}: a house light is a night animal's, at least the Nocturnal Lamps' and under daylight's`);
    // Schools of fish (0.1.119): a school travels in a Water Transport Tank, lives in a tank (an aquatic profile), eats
    // Fish Flakes from an Aquarium Feeder, shows some of its fish, never breeds; its food is counted by the fish.
    if (s.school && !(s.carrierProfile === "aquatic" && HABITAT_PROFILES[s.habitatProfile]?.aquatic && s.aquariumFeeder && s.dietTags.includes("flakes") && !b && s.school.max >= 1 && s.school.shown >= 1 && s.school.shown <= s.school.max && s.rationUnitsPerParkDay <= 0.5)) errors.push(`${key}: a school travels in a Water Transport Tank (aquatic), lives in an aquarium, eats Fish Flakes from an Aquarium Feeder, never breeds, shows some of its fish and eats a fish's share`);
    if (s.aquariumFeeder && !(s.dietTags.includes("flakes") || s.dietTags.includes("fish") || (s.aquaticMammal && s.dietTags.includes("leafy")))) errors.push(`${key}: eats from an Aquarium Feeder, so its diet is flakes or fish (or a manatee's Leafy Rations)`);
    if ((s.looks || HABITAT_PROFILES[s.habitatProfile]?.aquatic) && !(s.school || s.bigFish || s.aquaticMammal)) errors.push(`${key}: looks and aquariums are for schools of fish, big fish and the mammals of the water`);
    // Big fish (0.1.124): a single animal in a tank (an aquatic profile), one at a time in the Large Water Tank, eating
    // from an Aquarium Feeder; never a school, never breeding; dangerous only as a shark (0.1.125).
    if (s.bigFish && !(!s.school && !b && s.carrierProfile === "marine" && HABITAT_PROFILES[s.habitatProfile]?.aquatic && s.aquariumFeeder && s.observe?.includes("spot"))) errors.push(`${key}: a big fish is one animal in a tank, carried in the Large Water Tank, fed from an Aquarium Feeder, never breeding`);
    if (s.bigFish && s.dangerous && !s.shark) errors.push(`${key}: a dangerous big fish is a shark`);
    // The trench (0.1.126): a slow shark's pace is a fraction of the sharks'; the lure is a harmless big fish's show.
    if (s.sharkPace !== undefined && !(s.shark && s.sharkPace > 0 && s.sharkPace <= 1)) errors.push(`${key}: a shark's pace is a fraction of the sharks' (0 to 1)`);
    if (s.lure && !(s.bigFish && !s.shark && s.observe?.includes("lure"))) errors.push(`${key}: the lure is a harmless big fish's show, and its journal task`);
    // The sand and the drift (0.1.127): a sand bed is a harmless big fish's (a share of its water, the journal's "bury"); a
    // flash is a school's (its journal task "flash").
    if (s.sandBed && !(s.bigFish && !s.dangerous && s.sandBed.minFraction > 0 && s.sandBed.minFraction <= 1 && s.observe?.includes("bury"))) errors.push(`${key}: a sand bed is a harmless big fish's, a share of its water (0 to 1), with the journal's "bury"`);
    if (s.flashes && !(s.school && !s.dangerous && s.observe?.includes("flash"))) errors.push(`${key}: the flash is a harmless school's, with the journal's "flash"`);
    // The river and the lagoon (0.1.129): a bottom feeder is a harmless school (its journal task "whiskers"); a mammal of
    // the water is one harmless animal in a tank or lagoon that breeds, carried in the Large Water Tank, eating Leafy
    // Rations from an Aquarium Feeder, never a school or a big fish, with the journal's "breathe"; seagrass to graze is
    // a mammal of the water's (columns for each, a share of its food under 1).
    if (s.bottomFeeder && !(s.school && !s.dangerous && s.observe?.includes("whiskers"))) errors.push(`${key}: a bottom feeder is a harmless school, with the journal's "whiskers"`);
    if (s.aquaticMammal && !(!s.school && !s.bigFish && !s.dangerous && b && s.carrierProfile === "marine" && HABITAT_PROFILES[s.habitatProfile]?.aquatic && s.aquariumFeeder && s.dietTags.includes("leafy") && s.observe?.includes("breathe"))) errors.push(`${key}: a mammal of the water is one harmless animal in a tank or lagoon that breeds, carried in the Large Water Tank, eating Leafy Rations from an Aquarium Feeder, with the journal's "breathe"`);
    if (s.seagrass && !(s.aquaticMammal && s.seagrass.perAnimal >= 1 && s.seagrass.share > 0 && s.seagrass.share < 1)) errors.push(`${key}: seagrass to graze is a mammal of the water's: columns of it for each, a share of its food under 1`);
    // Lush Okapis (0.1.137): lush ground is moss and lush plants to browse for a share of its food under 1, with the
    // journal's "tongue"; a clay lick is a clay block or more on lush ground; a research gate is a known project; reaching
    // either feeder isn't reaching only the high one; a hidden calf is the one young of a birth, on lush ground.
    if (s.lushGround && !(s.lushGround.moss >= 1 && s.lushGround.plantsPer > 0 && s.lushGround.minPlants >= 1 && s.lushGround.share > 0 && s.lushGround.share < 1 && s.observe?.includes("tongue"))) errors.push(`${key}: lush ground is moss blocks and lush plants for each (a minimum), a share of its food under 1, with the journal's "tongue"`);
    if (s.clayLick && !(s.clayLick.min >= 1 && s.lushGround)) errors.push(`${key}: a clay lick is a clay block or more, for an animal of lush ground`);
    if (s.research && !PROJECTS.some((p) => p.id === s.research)) errors.push(`${key}: research ${s.research} is not a project`);
    if (s.browsesEither && s.browsesHigh) errors.push(`${key}: browsesEither reaches both feeders, so not browsesHigh too`);
    if (s.hiddenCalf && !(s.breeding?.litter === 1 && !s.breeding.litterMax && s.lushGround)) errors.push(`${key}: a hidden calf is the one young of a birth, lying in the okapi measure's best-covered spot`);
    // Earth Molebears (0.1.138): Burrow Soil is blocks of it beside the floor and a share of its food under 1 from the
    // grubs it digs, with the journal's "spade", for an eater of Insect Rations.
    // Skulkers (0.1.139): a sculk floor is blocks of it under the floor, for an animal of the dark, with the journal's
    // "tendrils".
    // Unicorns (0.1.149): glowing flowers are a few for each and some at least, for a grazer, with the journal's
    // "moonflowers".
    if (s.gladeFlowers && !(s.gladeFlowers.per > 0 && s.gladeFlowers.min >= 1 && s.graze && s.observe?.includes("moonflowers"))) errors.push(`${key}: glowing flowers are a few for each and some at least, for a grazer, with the journal's "moonflowers"`);
    if (s.sculkFloor && !(s.sculkFloor.min >= 1 && s.lowLight && s.observe?.includes("tendrils"))) errors.push(`${key}: a sculk floor is blocks of it in the floor, for an animal of the dark, with the journal's "tendrils"`);
    if (s.burrowSoil && !(s.burrowSoil.min >= 1 && s.burrowSoil.share > 0 && s.burrowSoil.share < 1 && s.observe?.includes("spade") && s.dietTags?.includes("insect"))) errors.push(`${key}: Burrow Soil is blocks of it beside the floor, a share of its food under 1, with the journal's "spade", for an insect eater`);
  }
  const aq = BALANCE.aquarium;
  if (!(aq.catchRange >= 1 && aq.feederCapacity >= BALANCE.feeder.capacity && aq.refillEvery >= 20)) errors.push("aquarium: a catch range of a block or more, an Aquarium Feeder holding at least a feeder's worth, a refill check a second or more apart");
  const fl = BALANCE.flamingo;
  if (!(fl.rosyAt > fl.fadingAt && fl.fadingAt > 0 && fl.rosyAt <= 100 && fl.pinkUp > 0 && fl.pinkDown > 0 && fl.pelletShare > 0 && fl.pelletShare <= 1)) errors.push("flamingo pink: rosy above fading, and a park day's gain and loss");
  if (!fl.bait.every((item) => RATIONS[item])) errors.push("flamingo bait must be rations");
  const zb = BALANCE.zebra;
  if (!zb.bait.every((item) => RATIONS[item])) errors.push("zebra bait must be rations");
  if (!(zb.places.feeder > 0 && zb.places.puzzle > 0 && zb.places.rack > 0 && zb.places.trough > 0)) errors.push("zebra feeding places: room for one or more at every feeder and trough");
  if (!(zb.pushedSatiety > 0 && zb.pushedSatiety < 100 && zb.rivalComfortCap > 0 && zb.rivalComfortCap < 100 && BALANCE.graze.comfortCap > 0)) errors.push("zebra caps: between 0 and 100");
  if (!(zb.easeTrot > zb.easeWalk && zb.easeWalk > 0)) errors.push("zebra runs ease down to a trot before a walk");
  const pd = BALANCE.predators;
  if (!(pd.danger.closeRange < pd.danger.strikeRange && pd.danger.strikeRange <= pd.danger.warnRange && pd.danger.reach < pd.danger.closeRange)) errors.push("predator danger: reach inside close, close inside strike, strike inside warn");
  if (!(pd.gates.pairMin >= 2 && pd.gates.pairMax >= pd.gates.pairMin && pd.fastEvery >= 2 && pd.fastDrain >= 0 && pd.fastDrain < 1)) errors.push("predators: gate pairs 2 or more blocks apart, a fast day at most every other day, a lower drain");
  const ln = BALANCE.lion;
  const tg = BALANCE.tiger;
  const cr = BALANCE.croc;
  const rp = BALANCE.redpanda;
  const ow = BALANCE.owl;
  const gz = BALANCE.grazer;
  const gk = BALANCE.gecko;
  const gp = gk.phases;
  if (!(gp.dusk[1] === gp.night[0] && gp.night[1] === gp.dawn[0] && gp.dusk[0] < gp.dusk[1] && gp.night[0] < gp.night[1] && gp.dawn[0] < gp.dawn[1])) errors.push("gecko: dusk, night and dawn follow one another");
  if (!(gk.wallFaces >= 1 && gk.crackKeep >= 1 && [gk.wallsComfortCap, gk.hideComfortCap, gk.rivalComfortCap].every((c) => c > 0 && c < 100))) errors.push("gecko: wall faces and kept cracks 1 or more, caps between 0 and 100");
  if (!(gk.stalk > 0 && gk.stalk < gk.walk && gk.walk < gk.run && gk.run < 1 && gk.wanderMin >= 1 && gk.wanderMax >= gk.wanderMin && gk.maleLow >= 1 && gk.limit >= gk.wanderMax && gk.escapeLimit >= gk.limit)) errors.push("gecko moves: a creep slower than the walk, slower than the run, under a block a tick; wanders of a move or more inside the search");
  if (!(gk.threatRange > 0 && gk.threatRange < gk.mothRange && gk.rivalRange > 0 && gk.mothReach >= 1 && gk.fleeMax >= 1)) errors.push("gecko: the threat close by, moths reached and gone for, a flight of a move or more");
  if (!gk.bait.every((item) => RATIONS[item])) errors.push("gecko bait must be rations");
  if (!(gz.nyliumCells >= 1 && gz.nyliumComfortCap > 0 && gz.nyliumComfortCap < 100 && gz.rubComfortCap > 0 && gz.rubComfortCap < 100)) errors.push("grazer: nylium blocks to graze, caps between 0 and 100");
  if (!(gz.reach > gz.realShort && gz.realShort < gz.rushShort && gz.rushRange <= gz.ringRangeZoo && gz.ringRangeZoo <= gz.ringRange && gz.ringRange <= gz.grudgeRange && gz.ringPace > 0 && gz.rushPace > gz.ringPace && gz.rushPace < 1)) errors.push("grazer ring: a real rush ends within reach and a bluff short of it, the rush inside the ring's range, a rush faster than the shuffle into the ring, under a block a tick");
  const bo = BALANCE.boar;
  if (!(bo.wallowComfortCap > 0 && bo.wallowComfortCap < 100 && bo.muddyTicks > 0 && bo.seekTicks > 0)) errors.push("boar: the wallow cap between 0 and 100, a mud coat that dries, a time to give up");
  if (!(bo.realRange < bo.bluffRange && bo.bluffRange <= bo.alertRangeZoo && bo.alertRangeZoo <= bo.alertRange && bo.alertRange <= bo.grudgeRange && bo.reach > bo.realShort && bo.realShort < bo.bluffShort && bo.trotPace > 0 && bo.chargePace > bo.trotPace && bo.chargePace < 1)) errors.push("boar defence: a real charge closer in than the bluff, inside the alert, ending within reach; a charge faster than the trot, under a block a tick");
  if (!(bo.sowDamage > 0 && bo.boarDamage >= bo.sowDamage && bo.escapeChance > 0 && bo.escapeChance <= 1 && bo.buttTicks > 0 && bo.outRun > 0 && bo.probeChance >= 0 && bo.probeChance <= 1 && bo.buttTellEvery >= bo.tellEvery && bo.shyAgain > 0)) errors.push("boar: a hit that hurts (a boar's at least a sow's), a chance to try the wood and to get out, a way on out");
  if (!bo.bait.every((item) => RATIONS[item] || item === "minecraft:crimson_fungus")) errors.push("boar bait must be rations or a crimson fungus");
  const bt = [bo.morning, bo.midday, bo.afternoon];
  if (!(bt[0][1] === bt[1][0] && bt[1][1] === bt[2][0] && bt[1][0] < bt[1][1] && bt[2][0] < bt[2][1])) errors.push("boar: the morning, the heat of the day and the afternoon follow one another");
  const mo = BALANCE.moth;
  const mp = mo.phases;
  if (!(mp.dusk[1] === mp.night[0] && mp.night[1] === mp.dawn[0] && mp.dusk[0] < mp.dusk[1] && mp.night[0] < mp.night[1] && mp.dawn[0] < mp.dawn[1])) errors.push("moth: dusk, night and dawn follow one another");
  for (const f of [mo.fly, mo.wildFly, mo.crawl]) if (!(f.slow > 0 && f.slow < f.cruise && f.cruise < 1 && f.accel > 0 && f.brake > 0)) errors.push("moth flights and crawls: a slow start and end under the cruise, under a block a tick");
  if (!(mo.orbitRadius[0] > 0 && mo.orbitRadius[0] <= mo.orbitRadius[1] && mo.under > 0 && mo.over > 0 && mo.out > 0 && mo.orbitSpeed > 0 && mo.orbitSpeed < 1 && mo.orbitGap > 0 && mo.orbitTicks[0] > 0 && mo.orbitTicks[1] >= mo.orbitTicks[0] && mo.stallRise > 0 && mo.invertDrop > 0 && mo.stallTicks > 0 && mo.invertTicks > 0 && [mo.stallChance, mo.invertChance, mo.sipChance, mo.orbitChance].every((p) => p >= 0 && p <= 1))) errors.push("moth lights: a circle round a light, flown under a block a tick for a while; a stall and an inversion that rise and fall; chances between 0 and 1");
  if (!(mo.soulComfortCap > 0 && mo.soulComfortCap < 100 && mo.flashRange > 0 && mo.fleeMin > mo.flashRange && mo.restMin >= 1 && mo.plantKeep >= 1 && mo.larvaRange >= 1 && mo.baitRange > mo.baitGap && mo.wildScan.r >= 1 && mo.wildScan.perTick >= 1)) errors.push("moth: the soul cap between 0 and 100, a flight from the flash farther than the flash, a rest a block or more up, host plants kept and reached, the bait reached from beyond its gap, a scan round home");
  const be = BALANCE.beetle;
  const bp = be.phases;
  if (!(bp.dusk[1] === bp.night[0] && bp.night[1] === bp.dawn[0] && bp.dusk[0] < bp.dusk[1] && bp.night[0] < bp.night[1] && bp.dawn[0] < bp.dawn[1])) errors.push("beetle: dusk, night and dawn follow one another");
  if (![be.tunnelPace, be.stepPace, be.scurryPace, be.chasePace, be.grubPace].every((p) => p > 0 && p < 1) || !(be.chasePace < be.scurryPace)) errors.push("beetle moves: under a block a tick, the chase slower than the scurry it follows");
  if (![be.feederChance, be.tunnelChance, be.wrestleChance, be.peekChance, be.grubTunnelChance].every((p) => p >= 0 && p <= 1)) errors.push("beetle: chances between 0 and 1");
  if (!(be.tunnelNear >= 1 && be.tunnelFar >= be.tunnelNear && be.grubTunnel >= 1 && be.grubReach >= 1 && be.backOff > be.chaseShort && be.walkOff > be.hissRange && be.hissRange > 0 && be.meetRange > be.faceGap && be.faceGap > 0)) errors.push("beetle: tunnels of a block or more, a chase that ends short of the loser, a walk off past the hiss, males that meet farther apart than they face off");
  for (const r of [be.eatTicks, be.faceTicks, be.shoveTicks, be.flipTicks, be.peekTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("beetle: tick ranges from low to high");
  if (!(be.flipTicks[0] > be.pryTicks && be.digTicks > 0 && be.emergeTicks > 0 && be.hissTicks > 0 && be.hissAgain > be.hissTicks && be.rightTicks > 0 && be.bedComfortCap > 0 && be.bedComfortCap < 100)) errors.push("beetle: a pry inside the flip, acts that take time, the bed cap between 0 and 100");
  if (!be.bait.every((item) => RATIONS[item] || item === "minecraft:quartz")) errors.push("beetle bait must be rations or a nether quartz");
  const ho = BALANCE.hopper;
  for (const r of [ho.activeTicks, ho.napTicks, ho.walkTicks, ho.forageTicks, ho.sitTicks, ho.listenTicks, ho.eatTicks, ho.leapTicks, ho.circuitLeaps, ho.floorAcross, ho.wildUp, ho.wildAcross, ho.flatAcross, ho.darts, ho.zooDarts, ho.dartAcross, ho.dartTurn, ho.dartTicks, ho.watchTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("hopper: ranges from low to high");
  if (!(Object.values(ho.choices).every((w) => w >= 0) && ho.choices.circuit > 0 && ho.choices.walk > 0)) errors.push("hopper: choices weighted 0 or more, with leaps and hopping about among them");
  if (!(ho.reachUp >= ho.wildUp[1] && ho.reachAcross >= ho.floorAcross[1] && ho.reachAcross >= ho.wildAcross[1] && ho.dropMax >= ho.reachUp && ho.voidLook > ho.dropMax && ho.padClear >= 2 && ho.highMin >= 1 && ho.highMin <= ho.reachUp && ho.minPads >= 1 && ho.wildClear >= 1)) errors.push("hopper: a leap's reach covers the wild and floor leaps and drops as far as it leaps up, the void looked for below the deepest drop, pads with headroom and a high one it can reach");
  if (!(ho.fleeRange > ho.startleRange && ho.startleRange > 0 && ho.dartTurn[1] < 90 && ho.comeOn > 0 && ho.watchFrom > ho.startleRange && ho.watchFrom <= ho.fleeRange && ho.dartsMax >= ho.darts[1] && ho.dartAcross[1] <= ho.reachAcross && ho.dartPeak > 0 && ho.dartPeak < ho.arcPeak && ho.dartTicks[1] <= ho.leapTicks[1] && ho.sniffReach >= 1.5 && ho.padComfortCap > 0 && ho.padComfortCap < 100 && ho.movedShare > 0 && ho.movedShare < 1 && ho.slowTicks >= 1 && ho.minWant > 0 && [ho.floorChance, ho.idleSoundChance].every((p) => p >= 0 && p <= 1))) errors.push("hopper: a flight from farther off than the startle, darts turned under 90 degrees within a leap and lower and quicker than one, a sniff where the tempt stops, the pads cap between 0 and 100, chances between 0 and 1");
  const sl = BALANCE.snail;
  for (const r of [sl.outTicks, sl.restTicks, sl.crawlAcross, sl.grazeTicks, sl.eatTicks, sl.lookTicks, sl.withdrawTicks, sl.reachFrom, sl.youngNear]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("snail: ranges from low to high");
  if (!(Object.values(sl.choices).every((w) => w >= 0) && sl.choices.crawl > 0 && sl.choices.look > 0)) errors.push("snail: choices weighted 0 or more, with crawling about and looking among them");
  if (!(sl.pace > 0 && sl.youngPace > 0 && sl.youngPace <= sl.pace && sl.climbPace > 0 && sl.dropPace > 0 && sl.markEvery > sl.pace && sl.turn > 0 && sl.walkSteps >= sl.crawlAcross[1] && sl.wildSteps >= sl.crawlAcross[1] && sl.zooNodes > 0 && sl.wildNodes > 0)) errors.push("snail: crawling forward slower than a mark apart (a hatchling no faster), up and down steps, ways long enough for a crawl about");
  if (!(sl.restReach >= 1 && sl.restRise >= 1 && sl.gatherReach >= 1 && sl.scanChunk >= 1 && sl.homeTries >= 1 && sl.creviceKeep >= 1)) errors.push("snail: resting places looked for within reach, a chunk at a time");
  if (!(sl.watchRange > sl.startleRange && sl.startleRange >= sl.zooStartleRange && sl.zooStartleRange > 0 && sl.comeOn > 0 && sl.withdrawMin >= 1 && sl.withdrawMin <= sl.withdrawTicks[0] && sl.habitFactor > 0 && sl.habitFactor < 1 && sl.habitAfter >= 1 && sl.habitWindow > sl.withdrawTicks[1] && sl.emergeTicks > 0)) errors.push("snail: a startle within the watch, out again sooner each time and used to someone after a few");
  if (!(sl.trailTicks >= sl.trailFresh && sl.trailFresh > 0 && sl.followReach > 0 && sl.touchReach > 0 && sl.giveWay > 0 && sl.giveWay < sl.touchReach && sl.waitTicks > 0 && sl.avoidTicks > sl.waitTicks && sl.feedMarkEvery > 0 && sl.baitRange > sl.reachFrom[1] && [sl.feedBright, sl.youngBright, sl.crawlSoundChance].every((p) => p >= 0 && p <= 1) && [sl.creviceComfortCap, sl.bedComfortCap].every((c) => c > 0 && c < 100))) errors.push("snail: a trail kept as long as it's followed, giving way short of touching, brightness and chances between 0 and 1, the caps between 0 and 100");
  const cb = BALANCE.crab;
  for (const r of [cb.outTicks, cb.restTicks, cb.walkAcross, cb.scrapeTicks, cb.eatTicks, cb.siftTicks, cb.lookTicks, cb.rearTicks, cb.boltAcross, cb.hideTicks, cb.sidleAcross, cb.reachFrom, cb.youngNear]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("crab: ranges from low to high");
  if (!(Object.values(cb.choices).every((w) => w >= 0) && cb.choices.walk > 0 && cb.choices.look > 0 && cb.choices.scrape > 0)) errors.push("crab: choices weighted 0 or more, with walking about, scraping and looking among them");
  if (!(cb.pace > 0 && cb.forwardPace > 0 && cb.forwardPace <= cb.pace && cb.scuttlePace > cb.pace && cb.youngPace > 0 && cb.youngPace <= cb.pace && cb.forwardLast > 0 && cb.climbPace > 0 && cb.dropPace > 0 && cb.turn > 0 && cb.walkSteps >= cb.walkAcross[1] && cb.wildSteps >= cb.boltAcross[1] && cb.zooNodes > 0 && cb.wildNodes > 0 && cb.scrapeGap >= 0 && cb.scrapeGap < 0.2)) errors.push("crab: walking forward no faster than side-on, bolting faster, a crablet no faster, up and down steps, ways long enough for a bolt, scraping short of the rock");
  if (!(cb.restReach >= 1 && cb.restRise >= 1 && cb.scanChunk >= 1 && cb.homeTries >= 1 && cb.rockKeep >= 1 && cb.rockReach >= 1 && cb.siftReach >= 1 && cb.digTicks > 0 && cb.emergeTicks > 0)) errors.push("crab: burrows and rock looked for within reach, a chunk at a time");
  if (!(cb.watchRange > cb.startleRange && cb.startleRange > cb.boltRange && cb.boltRange > 0 && cb.zooStartleRange > cb.zooBoltRange && cb.zooBoltRange > 0 && cb.watchRange > cb.zooStartleRange && cb.comeOn > 0)) errors.push("crab: rearing farther off than bolting, both within the watch");
  if (!(cb.faceOffRange > 0 && cb.faceOffTicks > 0 && cb.faceOffCool > cb.faceOffTicks && cb.baitRange > cb.reachFrom[1] && cb.giveWay > 0 && cb.giveWay < cb.faceOffRange && cb.waitTicks > 0 && cb.avoidTicks > cb.waitTicks && cb.stepSoundChance >= 0 && cb.stepSoundChance <= 1 && [cb.rockComfortCap, cb.burrowComfortCap].every((c) => c > 0 && c < 100))) errors.push("crab: face-offs once in a while, giving way short of one, chances between 0 and 1, the caps between 0 and 100");
  const cm = BALANCE.chorusMoth;
  const cp = cm.phases;
  if (!(cp.dusk[1] === cp.night[0] && cp.night[1] === cp.dawn[0] && cp.dusk[0] < cp.dusk[1] && cp.night[0] < cp.night[1] && cp.dawn[0] < cp.dawn[1])) errors.push("chorus moth: dusk, night and dawn follow one another");
  for (const r of [cm.boutFly, cm.boutRest, cm.warmTicks, cm.hoverTicks, cm.sipTicks, cm.pauseTicks, cm.larvaRest, cm.munchTicks, cm.searchRange]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("chorus moth: ranges from low to high");
  for (const f of [cm.fly, cm.wildFly, cm.crawl]) if (!(f.slow > 0 && f.slow < f.cruise && f.cruise < 1 && f.accel > 0 && f.brake > 0)) errors.push("chorus moth flights and crawls: a slow start and end under the cruise, under a block a tick");
  if (!(cm.startleWarm > 0 && cm.startleWarm < cm.warmTicks[0] && cm.startleGap > 0 && cm.startleRange > 0 && cm.fleeMin > cm.startleRange && cm.restMin >= 1 && cm.recentFlowers >= 1 && cm.flowerSkip > 0 && [cm.flowerChance, cm.sipChance].every((p) => p >= 0 && p <= 1))) errors.push("chorus moth: a startle's shiver shorter than the warm-up, a flight from it farther than the startle, a rest a block or more up, chances between 0 and 1");
  if (!([cm.flowerComfortCap, cm.dimComfortCap].every((c) => c > 0 && c < 100) && cm.flowerKeep >= 1 && cm.plantKeep >= 1 && cm.larvaRange >= 1 && cm.rearRange > 0 && cm.rearTicks > 0 && cm.rearGap >= 0 && cm.baitRange > cm.baitGap && cm.wildScan.r >= 1 && cm.wildScan.perTick >= 1 && cm.wildScan.every >= 100 && cm.wildFlowerKeep >= 1 && cm.voidLook >= 4 && cm.wildSearches >= 0)) errors.push("chorus moth: the caps between 0 and 100, flowers and chorus kept and reached, the bait reached from beyond its gap, a scan round home, the void looked for");
  const sb = BALANCE.starback;
  const sbw = sb.warm;
  for (const r of [sb.restTicks, sb.outTicks, sbw.start, sb.browseTicks, sb.eatTicks, sb.grazeStep, sb.pauseTicks, sb.lookTicks, sb.withdrawTicks, sb.hitTicks, sb.reachFrom]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("starback: ranges from low to high");
  if (!(sbw.floor >= 0 && sbw.floor < sbw.cooled && sbw.cooled < sbw.openMax && sbw.openMax <= sbw.basked && sbw.basked <= 1 && sbw.start[0] >= sbw.floor && sbw.start[1] <= 1 && sbw.padRise > sbw.openRise && sbw.openRise > 0 && sbw.outFall >= sbw.restFall && sbw.restFall > 0 && (sbw.basked - sbw.floor) / sbw.padRise <= sb.baskMaxTicks && (sbw.openMax - sbw.floor) / sbw.openRise <= sb.baskMaxTicks)) errors.push("starback warmth: cooled under what it warms to in the open, a pad quicker than the open, cooling faster out than at rest, warm within a bask");
  if (!(sb.pace > 0 && sb.youngPace > 0 && sb.youngPace <= sb.pace && sb.turn > 0 && sb.dropPace > 0 && sb.walkSteps >= 8 && sb.wildSteps >= 4 && sb.zooNodes > 0 && sb.wildNodes > 0 && sb.browseGap >= 0 && sb.browseGap <= 0.5 - 0.35 + 1e-9)) errors.push("starback: a hatchling no faster, ways long enough, browsing short of the chorus (a female is 0.7 wide)");
  if (!(sb.restReach >= 1 && sb.restRise >= 1 && sb.scanChunk >= 1 && sb.homeTries >= 1 && sb.keep >= 1 && sb.wildReach >= 1 && sb.baskReach >= 1 && sb.recentPlants >= 1 && sb.feedChance >= 0 && sb.feedChance <= 1 && sb.stepSoundChance >= 0 && sb.stepSoundChance <= 1)) errors.push("starback: rest, chorus and the open looked for within reach, chances between 0 and 1");
  if (!(sb.watchRange > sb.startleRange && sb.startleRange > sb.zooStartleRange && sb.zooStartleRange > 0 && sb.comeOn > 0 && sb.peekTicks > 0 && sb.hitTicks[0] > sb.withdrawTicks[1] && sb.baitRange > sb.reachFrom[1] && sb.giveWay > 0 && sb.waitTicks > 0 && sb.avoidTicks > sb.waitTicks && sb.nestTicks > 0 && sb.patTicks > 0 && sb.nestRetry > 0 && sb.courtTicks > 0 && sb.courtRange > 0 && [sb.plantComfortCap, sb.padComfortCap, sb.retreatComfortCap].every((c) => c > 0 && c < 100))) errors.push("starback: startled nearer in a zoo, longer for a hit, the bait reached from beyond its reach, giving way, the nest, the caps between 0 and 100");
  const ok = BALANCE.okapi;
  for (const r of [ok.interestTicks, ok.wanderTicks, ok.browseTicks, ok.lickTicks, ok.groomTicks, ok.rubTicks, ok.alertTicks, ok.restTicks, ok.dayRestTicks, ok.nurseEvery, ok.nurseTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("okapi: ranges from low to high");
  if (!(ok.day.every((t) => t >= 0 && t < 24000) && ok.getUpTicks >= 24 && ok.coolTicks > 0 && ok.flehmenTicks > 0 && ok.alertCool > ok.alertTicks[1] && ok.alertRange > 0 && ok.shyRange > ok.baitRange && ok.baitRange > 0 && ok.flehmenRange > 0 && ok.hideDays >= 1 && ok.nurseReach > 0 && ok.nurseFar > ok.nurseReach && ok.nurseTimeout > 0 && ok.motherRange > ok.nurseFar && ok.hideKeep >= 1 && ok.coverRise >= 2 && ok.ambientChance >= 0 && ok.ambientChance <= 1 && [ok.lushComfortCap, ok.clayComfortCap].every((c) => c > 0 && c < 100) && ok.bait.every((item) => RATIONS[item]) && Object.values(ok.weights).every((w) => w >= 0) && ok.weights.wander > 0)) errors.push("okapi: getting up in the client's 1.2 s or more, shy from beyond the bait's reach, nursing within its mother's reach, the caps between 0 and 100, bait that is rations");
  const mb = BALANCE.molebear;
  for (const r of [mb.interestTicks, mb.wanderTicks, mb.denTicks, mb.sniffTicks, mb.standTicks, mb.restTicks, mb.dayRestTicks, mb.hideTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("molebear: ranges from low to high");
  if (!(mb.day.every((t) => t >= 0 && t < 24000) && mb.getUpTicks >= 16 && mb.climbTicks >= 24 && mb.coolTicks > 0 && mb.digTicks > 0 && mb.snapTicks > 0 && mb.feedTicks > 0 && mb.crawlSteps >= 1 && mb.shuffleStep > 0 && mb.shuffleStep <= 0.5 && mb.tunnelMax >= 1 && mb.digsPerDay >= 1 && [mb.tunnelWide, mb.tunnelHigh].every((n) => Number.isInteger(n) && n >= 1 && n <= 3) && mb.bodyBack >= 0 && mb.bodyBack < mb.tunnelRoom && Number.isInteger(mb.tunnelRoom) && mb.tunnelRoom >= 1 && Number.isInteger(mb.startReach) && mb.startReach >= 1 && mb.startReach <= 3 && mb.approachTicks > 0 && mb.approachRange > 0 && mb.approachStep > 0 && mb.approachStep <= 1 && mb.alertRange > 0 && mb.alertCool > 0 && mb.hideRange > 0 && mb.standRange > mb.hideRange && mb.baitRange > 0 && mb.ambientChance >= 0 && mb.ambientChance <= 1 && mb.soilComfortCap > 0 && mb.soilComfortCap < 100 && mb.bait.every((item) => RATIONS[item]) && Object.values(mb.weights).every((w) => w >= 0) && mb.weights.wander > 0)) errors.push("molebear: getting up and climbing out in the client's 0.8 and 1.2 s or more, standing from beyond where it hides, a shuffle no longer than half a block, tunnels 1 to 3 blocks wide and high, its body drawn back less than the floor it digs from, the cap between 0 and 100, bait that is rations");
  const un = BALANCE.unicorn;
  for (const r of [un.interestTicks, un.wanderTicks, un.grazeTicks, un.dipTicks, un.alertTicks, un.restTicks, un.dayRestTicks, un.wakeTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("unicorn: ranges from low to high");
  if (!(un.day.every((t) => t >= 0 && t < 24000) && un.getUpTicks >= 24 && un.rearTicks >= 40 && un.dipReachTicks >= 16 && un.dipReachTicks < un.dipTicks[0] && un.coolTicks > 0 && un.alertRange > 0 && un.alertCool > 0 && un.shyRange > 0 && un.baitRange > 0 && un.ambientChance >= 0 && un.ambientChance <= 1 && un.flowerComfortCap > 0 && un.flowerComfortCap < 100 && un.bait.every((item) => RATIONS[item]) && Object.values(un.weights).every((w) => w >= 0) && un.weights.wander > 0)) errors.push("unicorn: getting up, rearing and the dip's reach in the client's 1.2, 2 and 0.8 s or more, the cap between 0 and 100, bait that is rations");
  const sk = BALANCE.skulker;
  for (const r of [sk.interestTicks, sk.wanderTicks, sk.listenIdleTicks, sk.meetTicks, sk.sitTicks, sk.restTicks, sk.city.hide]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("skulker: ranges from low to high");
  if (!(sk.day.every((t) => t >= 0 && t < 24000) && sk.getUpTicks >= 16 && sk.digTicks >= 50 && sk.emergeTicks >= 50 && sk.coolTicks > 0 && sk.hearRange > 0 && sk.moveMin > 0 && sk.listenTicks > 0 && sk.followRange >= sk.hearRange && sk.visitTicks > 0 && sk.meetRange > 0 && sk.meetReach >= sk.meetRange && sk.stuckTicks > 0 && sk.hearCool > 0 && sk.feedTicks > 0 && sk.baitRange > 0 && sk.ambientChance >= 0 && sk.ambientChance <= 1 && sk.sculkComfortCap > 0 && sk.sculkComfortCap < 100 && sk.shriekComfortCap > 0 && sk.shriekComfortCap < 100 && sk.bait.every((item) => RATIONS[item]) && Object.values(sk.weights).every((w) => w >= 0) && sk.weights.wander > 0 && sk.city.every >= 20 && sk.city.depth < 0 && sk.city.score > 0 && sk.city.spacing > 0)) errors.push("skulker: getting up and rising in the client's 0.8 and 2.5 s or more, following from as far as it hears, the caps between 0 and 100, bait that is rations, a city check below ground");
  const ph = ow.phases;
  if (!(ph.dusk[1] === ph.night[0] && ph.night[1] === ph.dawn[0] && ph.dusk[0] < ph.dusk[1] && ph.night[0] < ph.night[1] && ph.dawn[0] < ph.dawn[1])) errors.push("owl: dusk, night and dawn follow one another");
  for (const f of [ow.fly, ow.wildFly, ow.owletFly]) if (!(f.slow > 0 && f.slow < f.cruise && f.cruise < 1 && f.accel > 0 && f.brake > 0)) errors.push("owl flights: a slow start and end under the cruise, under a block a tick");
  if (!(ow.displayRange < ow.flushRange && ow.lowPerch >= 1 && ow.perchSpread >= 1 && ow.perchComfortCap > 0 && ow.perchComfortCap < 100 && ow.minPerches >= 1 && ow.nestDays >= 1)) errors.push("owl: the display inside the flush, a low perch a block or more, a spread of a block or more, a cap between 0 and 100");
  const go = BALANCE.gorilla;
  const gb = go.bluff;
  if (!(go.reach >= 1 && go.rivalComfortCap > 0 && go.rivalComfortCap < 100 && go.deepComfortCap > 0 && go.deepComfortCap < 100 && go.bachelorMax >= 2 && go.rideDays >= 1 && go.maxUp >= 2 && go.hug > 0 && go.hug < 0.5)) errors.push("gorilla: a reach of a block or more, caps between 0 and 100, a bachelor group of 2 or more, infants riding a day or more, climbs of 2 blocks or more, hugging inside the block");
  if (!(gb.reach < gb.stopShort && gb.stopShort < gb.closeRange && gb.closeRange < gb.chargeRange && gb.chargeRange < gb.displayRange && gb.displayTicks > 0 && gb.chargeTicks > 0)) errors.push("gorilla bluff: reach inside the stop, the stop inside close, close inside the charge, the charge inside the display");
  if (!(rp.canopyPer >= 1 && rp.canopyComfortCap > 0 && rp.canopyComfortCap < 100 && rp.nestComfortCap > 0 && rp.nestComfortCap < 100 && rp.shade > 0 && rp.shade < 1 && rp.shadeComfortCap > 0 && rp.shadeComfortCap < 100 && rp.tripMin >= 1 && rp.tripMax >= rp.tripMin && rp.canopyCells > rp.tripMax && rp.nestFront > 0 && rp.nestFront < 0.5)) errors.push("redpanda: canopy blocks for each, caps between 0 and 100, a share of the floor shaded, trips along the canopy it maps, a Nest Box front inside the block");
  if (!(cr.bankPerCroc >= 1 && cr.bankReach >= 1 && cr.deepPerCroc >= 1 && cr.deepPerYoung >= 0 && cr.bankComfortCap > 0 && cr.bankComfortCap < 100 && cr.submergeComfortCap > 0 && cr.submergeComfortCap < 100 && cr.nestNear >= 1 && cr.nestFar >= cr.nestNear && cr.sunMales >= 0 && cr.sunMales <= 1)) errors.push("croc: a bank and deep water for each, caps between 0 and 100, nest sites near the water, a share of males");
  if (!(cr.hunt.grabReach < cr.hunt.lungeRange && cr.hunt.lungeRange < cr.hunt.spotDay && cr.hunt.spotDay <= cr.hunt.spotNight && cr.hunt.landSnap < cr.hunt.landWarn && cr.hunt.landWarn <= cr.hunt.spotDay && cr.hunt.rolls >= 1)) errors.push("croc hunt: the grab inside the lunge, the lunge inside its spotting range, the snap inside the warning");
  if (!(tg.introEvery >= 2 && tg.introWindow >= 1 && tg.introWindow < tg.introEvery && tg.screenPerTiger >= 1 && tg.privacyComfortCap > 0 && tg.privacyComfortCap < 100 && tg.solitaryComfortCap > 0 && tg.solitaryComfortCap < tg.privacyComfortCap)) errors.push("tiger: an introduction every 2 or more park days, a window shorter than that, caps between 0 and 100 (fighting the lower)");
  if (!(tg.hunt.reach < tg.hunt.pounceRange && tg.hunt.pounceRange < tg.hunt.rushAny && tg.hunt.rushAny < tg.hunt.rushBack && tg.hunt.rushBack < tg.hunt.spotDay && tg.hunt.spotDay <= tg.hunt.spotNight)) errors.push("tiger hunt: reach inside the pounce, the pounce inside a rush, a rush inside its spotting range");
  if (!(ln.coalitionMax >= 1 && ln.ledgePerLion >= 1 && ln.ledgeComfortCap > 0 && ln.ledgeComfortCap < 100 && ln.coalitionComfortCap > 0 && ln.coalitionComfortCap < 100 && pd.dens.comfortCap > 0 && pd.dens.comfortCap < 100)) errors.push("lion caps: between 0 and 100, a coalition and a ledge each");
  const w = BALANCE.needs.weights;
  const sum = w.satiety + w.comfort + w.cleanliness + w.enrichment + w.social;
  if (Math.abs(sum - 1) > 1e-9) errors.push(`welfare weights sum to ${sum}, not 1`);
  const r = BALANCE.rating.weights;
  const rsum = r.welfare + r.satisfaction + r.variety + r.operations;
  if (Math.abs(rsum - 1) > 1e-9) errors.push(`rating weights sum to ${rsum}, not 1`);
  for (const item of Object.keys(BALANCE.shop)) {
    if (!RATIONS[item] && !Object.values(CARRIERS).some((c) => c.empty === item) && !BALANCE.cooler.ice[item] && !BALANCE.heater.fuel[item]) errors.push(`shop sells unknown item ${item}`);
  }
  const a = BALANCE.admission;
  if (!(a.min <= BALANCE.economy.admissionPrice && BALANCE.economy.admissionPrice <= a.max)) errors.push("default admission price is outside the Ticket Booth range");
  const sn = BALANCE.snacks;
  if (!(sn.min <= sn.defaultPrice && sn.defaultPrice <= sn.max)) errors.push("default snack price is outside the Snack Stand range");
  for (const [item, units] of Object.entries(BALANCE.snackFoods)) if (!(Number.isInteger(units) && units > 0)) errors.push(`snack food ${item} must give a whole number of snacks`);
  const tr = BALANCE.tours;
  if (!(tr.min <= tr.defaultPrice && tr.defaultPrice <= tr.max)) errors.push("default tour ticket price is outside the Tour Desk range");
  if (!(tr.stopsBase > 0 && tr.stopsPer > 0 && tr.stopsBase + tr.stopsPer * tr.maxStops >= 1)) errors.push("a full tour walk must sell every ticket its share allows");
  if (!(Number.isInteger(tr.groupSize) && tr.groupSize >= 1 && Number.isInteger(tr.toursPerGuide) && tr.toursPerGuide >= 1 && tr.followers <= tr.groupSize)) errors.push("tour groups: whole sizes, and no more shown than a group holds");
  const rd = BALANCE.ride;
  if (!(rd.min <= rd.defaultPrice && rd.defaultPrice <= rd.max)) errors.push("default ride price is outside the Expedition Platform range");
  if (!(Number.isInteger(rd.seats) && rd.seats >= 1 && Number.isInteger(rd.ridesPerDay) && rd.ridesPerDay >= 1 && Number.isInteger(rd.maxRays) && rd.maxRays >= 1)) errors.push("rides: whole seats, rides a day and rays per platform");
  if (!(rd.clearance > 0 && rd.minCruise > 0 && rd.skyClear >= rd.minCruise && rd.loopSpeed > 0 && rd.climbSpeed > 0)) errors.push("rides: the loop needs clearance, a cruise height within the open sky, and speeds");
  const rm = BALANCE.rays.mount;
  if (!(rm.speed > 0 && rm.rise > 0 && rm.turn > 0 && rm.tameChance > 0 && rm.tameChance <= 1)) errors.push("ray mounts: speed, rise, turn and a tame chance up to 1");
  const rc = BALANCE.rays.cities;
  if (!(rc.over[0] >= 1 && rc.over[1] >= rc.over[0] && rc.group[0] >= 1 && rc.group[1] >= rc.group[0] && rc.perCity >= rc.group[1] && rc.maxNear >= 1)) errors.push("End City rays: sensible heights, groups and caps");
  const sw = BALANCE.services.weights;
  if (Math.abs(Object.values(sw).reduce((a, b) => a + b, 0) - 1) > 1e-9) errors.push("services weights don't sum to 1");
  for (const k of ["food", "seating", "litter", "restrooms", "drinks"]) if (!(sw[k] > 0)) errors.push(`services weight ${k} missing`);
  for (const p of PROJECTS) {
    if (!(p.cost > 0) || !Object.keys(p.items).length || !p.text) errors.push(`research ${p.id}: needs parts, a cost and a text`);
    for (const id of [].concat(p.needs.after ?? [])) if (!PROJECTS.some((q) => q.id === id)) errors.push(`research ${p.id}: opens after unknown project ${id}`);
    for (const [id, level] of Object.entries(p.needs.species ?? {})) {
      if (!SPECIES[id]) errors.push(`research ${p.id}: needs unknown species ${id}`);
      if (!(level >= 1 && level <= 3)) errors.push(`research ${p.id}: a species level is 1 to 3`);
    }
    if (p.needs.releases !== undefined && !(Number.isInteger(p.needs.releases) && p.needs.releases >= 1)) errors.push(`research ${p.id}: releases needed must be a whole number, 1 or more`);
  }
  const c = BALANCE.conservation;
  if (!(c.minDistance > 0)) errors.push("conservation.minDistance must be past the Park Deed's spot");
  if (!(c.beyondFence > 0)) errors.push("conservation.beyondFence must be past a fenced park's edge");
  const pk = BALANCE.park;
  if (!(pk.fenceSettleTicks > 0 && pk.fenceCellsPerSlice >= 1000)) errors.push("park fence: settle time and cells a slice must be positive");
  if (!(c.guestsPerRelease >= 0 && c.guestsCap >= c.guestsPerRelease)) errors.push("conservation guest boost: the cap must hold at least one release");
  return errors;
}
