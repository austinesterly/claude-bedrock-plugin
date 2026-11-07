// Checks the data tables against each other at startup and in the unit tests, so a typo in a
// species entry fails loudly instead of producing an animal nobody can feed (spec section 5.5).

import { canShare as canShareIds } from "../exhibits/mixing.js";
import { SPECIES } from "./species.js";
import { HABITAT_PROFILES } from "./profiles.js";
import { RATIONS, CARRIERS } from "./items.js";
import { BALANCE } from "./balance.js";
import { PROJECTS } from "./research.js";
import { MOB_KINDS } from "../animals/mobRules.js";

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
    if (s.breeding?.nestBox && !(s.roosts || s.dances)) errors.push(`${key}: eggs in a Nest Box are for the birds that roost or perch (roosts, dances)`);
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
    if (s.aquariumFeeder && !(s.dietTags.includes("flakes") || s.dietTags.includes("fish") || ((s.aquaticMammal || s.seaTurtle) && s.dietTags.includes("leafy")) || (s.waterPlants && s.dietTags.includes("insect")))) errors.push(`${key}: eats from an Aquarium Feeder, so its diet is flakes or fish (or a manatee's or sea turtle's Leafy Rations, an axolotl's Insect Rations)`);
    if ((s.looks || HABITAT_PROFILES[s.habitatProfile]?.aquatic) && !(s.school || s.bigFish || s.aquaticMammal || ((s.waterPlants || s.deepPool) && !s.looks))) errors.push(`${key}: looks and aquariums are for schools of fish, big fish and the mammals of the water (and an axolotl's tank, a dolphin's pool)`);
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
    if (s.seagrass && !((s.aquaticMammal || s.seaTurtle) && s.seagrass.perAnimal >= 1 && s.seagrass.share > 0 && s.seagrass.share < 1)) errors.push(`${key}: seagrass to graze is a mammal of the water's or a sea turtle's: columns of it for each, a share of its food under 1`);
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
    // Dragons (0.1.150): warmth (a lit campfire to bask by) is for a flyer in a hall it lands in (a profile with lands),
    // with the journal's "wingbask".
    if (s.warmth && !(s.warmth.min >= 1 && s.flies && HABITAT_PROFILES[s.habitatProfile]?.lands && s.observe?.includes("wingbask"))) errors.push(`${key}: warmth is a lit campfire or more, for a flyer in a hall it lands in (lands), with the journal's "wingbask"`);
    // Griffins (0.1.151): a hoard (gold to guard) is for a flyer in a hall it lands in (a profile with lands), with the
    // journal's "guard".
    if (s.hoard && !(s.hoard.min >= 1 && s.flies && HABITAT_PROFILES[s.habitatProfile]?.lands && s.observe?.includes("guard"))) errors.push(`${key}: a hoard is a block of gold or more, for a flyer in a hall it lands in (lands), with the journal's "guard"`);
    // Bosses (0.1.159): a boss travels in a carrier of its own gated by research, with the journal's tired-out task; snow
    // underfoot is a share of the floor, for a cold animal.
    if (s.boss && !(CARRIERS[s.carrierProfile]?.research && s.observe?.some((t) => /tired$/.test(t)))) errors.push(`${key}: a boss travels in a carrier gated by research, with a journal task to see it tired out ("...tired")`);
    if (s.snowFloor && !(s.snowFloor.share > 0 && s.snowFloor.share <= 1 && s.cold)) errors.push(`${key}: snow underfoot is a share of the floor, for a cold animal`);
    // Soul Sloths (0.1.161): soul underfoot is a share of the floor, for a Nether animal (heat); a beam is for a boss.
    if (s.soulFloor && !(s.soulFloor.share > 0 && s.soulFloor.share <= 1 && s.heat)) errors.push(`${key}: soul underfoot is a share of the floor, for a Nether animal`);
    if (s.beam && !s.boss) errors.push(`${key}: a beam to hang from is the Soul Sloth's (a boss)`);
    // Zoo mobs (0.1.163): a mob lives in a mob pen, travels in the Mob Cage and is calmed from a vanilla mob (mobSource;
    // the serum makes its wildSource), with the journal's "mobcalm", and has no young; the floor it likes is a share of
    // the floor, for a mob; the mob pen is for mobs.
    if (s.mob && !(String(s.habitatProfile).startsWith("mob_pen") && s.carrierProfile === "mob" && MOB_KINDS[s.mobSource] === s.wildSource && s.observe?.includes("mobcalm") && !b && !s.flies)) errors.push(`${key}: a mob lives in a mob pen, travels in the Mob Cage, is calmed from its mobSource into its wildSource (the journal's "mobcalm") and has no young`);
    if (s.mobFloor && !((s.mob || s.built === "iron") && s.mobFloor.ids?.length > 0 && s.mobFloor.share > 0 && s.mobFloor.share <= 1 && typeof s.mobFloor.how === "string")) errors.push(`${key}: the floor a mob likes is block ids, a share of the floor and how to say it, for a mob`);
    if (!s.mob && (String(s.habitatProfile).startsWith("mob_pen") || s.mobSource)) errors.push(`${key}: the mob pen and a mobSource are for mobs`);
    // What a mob likes in its pen (0.1.164: creepers' leaves or ferns, spiders' cobwebs): block ids, how many, how to say
    // it; a mob's own darker dark (spiders: 4) is a light below the Nocturnal Lamps', for a mob that likes the dark.
    if (s.mobDecor && !(s.mob && s.mobDecor.ids?.length > 0 && Number.isInteger(s.mobDecor.min) && s.mobDecor.min >= 1 && typeof s.mobDecor.how === "string")) errors.push(`${key}: what a mob likes in its pen is block ids, how many and how to say it, for a mob`);
    if (s.darkLight !== undefined && !(s.mob && s.lowLight && Number.isInteger(s.darkLight) && s.darkLight >= 1 && s.darkLight < BALANCE.nocturnal.maxLight)) errors.push(`${key}: a mob's own dark is a light from 1 to below the Nocturnal Lamps', for a mob that likes the dark`);
    // Glowhorn Stags (0.1.152): trunks to rub are a spot or more, for a grazer with coats that set the sex, with the
    // journal's "antlerrub".
    if (s.trunks && !(s.trunks.min >= 1 && s.graze && s.sexByCoat && s.observe?.includes("antlerrub"))) errors.push(`${key}: trunks to rub are a spot or more, for a grazer whose coats set the sex, with the journal's "antlerrub"`);
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
  const gh = BALANCE.glowhorn;
  for (const r of [gh.interestTicks, gh.wanderTicks, gh.grazeTicks, gh.rubTicks, gh.glowTicks, gh.alertTicks, gh.restTicks, gh.dayRestTicks, gh.wakeTicks, ...gh.twilight]) if (!(r.length === 2 && r[0] >= 0 && r[1] >= 0)) errors.push("glowhorn: ranges of two");
  for (const r of [gh.interestTicks, gh.wanderTicks, gh.grazeTicks, gh.rubTicks, gh.glowTicks, gh.alertTicks, gh.restTicks, gh.dayRestTicks, gh.wakeTicks]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("glowhorn: ranges from low to high");
  if (!([gh.day, ...gh.twilight].every((r) => r.every((t) => t >= 0 && t < 24000)) && gh.getUpTicks >= 24 && gh.bellowTicks >= 52 && gh.rubReachTicks >= 12 && gh.rubReachTicks < gh.rubTicks[0] && gh.glowRiseTicks >= 20 && gh.glowRiseTicks < gh.glowTicks[0] && gh.puffTicks < gh.bellowTicks && gh.rubStep > 0 && gh.rubStep < 1.5 && gh.lineUp.range > 0 && gh.lineUp.range <= 4 && gh.lineUp.side >= 0 && gh.lineUp.side < 1 && gh.lineUp.stepPace > 0 && gh.lineUp.stepPace <= 0.15 && gh.lineUp.backPace > 0 && gh.lineUp.backPace <= 0.15 && gh.lineUp.stall > 0 && gh.twilightGlow >= 1 && gh.motes >= 1 && gh.coolTicks > 0 && gh.startleTicks > 0 && gh.alertRange > 0 && gh.alertCool > 0 && gh.shyRange > 0 && gh.baitRange > 0 && gh.ambientChance >= 0 && gh.ambientChance <= 1 && gh.trunkComfortCap > 0 && gh.trunkComfortCap < 100 && gh.bait.every((item) => RATIONS[item]) && Object.values(gh.weights).every((w) => w >= 0) && gh.weights.wander > 0)) errors.push("glowhorn: getting up, the bellow, the rub's reach and the glow's rise in the client's 1.2, 2.6, 0.6 and 1 s or more, a step under a block and a half, a line-up of 4 blocks at most at a walk, the cap between 0 and 100, bait that is rations");
  const gf = BALANCE.griffin;
  for (const r of [gf.airTicks, gf.groundTicks, gf.guardTicks, gf.standTicks, gf.preenTicks, gf.eatTicks, gf.sleepTicks, gf.wakeTicks, gf.wildHeight]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("griffin: ranges from low to high");
  if (!(gf.day.every((t) => t >= 0 && t < 24000) && gf.screechTicks >= 44 && gf.takeoffTicks > 0 && gf.hoverHeight >= 2 && gf.glideChance >= 0 && gf.glideChance <= 1 && gf.diveChance >= 0 && gf.diveChance <= 1 && Object.values(SPECIES).filter((s) => s.hoard).every((s) => s.breeding?.juvenileScale === gf.chickScale) && gf.shyRange > 0 && gf.baitRange > gf.shyRange && gf.scareCool > 0 && gf.wildRange > 0 && gf.hoardComfortCap > 0 && gf.hoardComfortCap < 100 && gf.bait.every((item) => RATIONS[item]) && Object.values(gf.weights).every((w) => w >= 0) && gf.weights.stand > 0)) errors.push("griffin: the screech in the client's 2.2 s or more, chances from 0 to 1, the chick's scale the species', bait drawing from farther than shyness, the cap between 0 and 100, bait that is rations");
  const dr = BALANCE.dragon;
  for (const r of [dr.airTicks, dr.groundTicks, dr.baskTicks, dr.standTicks, dr.eatTicks, dr.sleepTicks, dr.wakeTicks, dr.wildHeight]) if (!(r[0] > 0 && r[1] >= r[0])) errors.push("dragon: ranges from low to high");
  if (!(dr.day.every((t) => t >= 0 && t < 24000) && dr.roarTicks >= 52 && dr.fireTicks >= 68 && dr.takeoffTicks > 0 && dr.hoverHeight >= 2 && dr.glideChance >= 0 && dr.glideChance <= 1 && Object.values(SPECIES).filter((s) => s.warmth).every((s) => s.breeding?.juvenileScale === dr.hatchlingScale) && dr.shyRange > 0 && dr.baitRange > dr.shyRange && dr.scareCool > 0 && dr.wildRange > 0 && dr.warmthComfortCap > 0 && dr.warmthComfortCap < 100 && dr.bait.every((item) => RATIONS[item]) && Object.values(dr.weights).every((w) => w >= 0) && dr.weights.stand > 0)) errors.push("dragon: the roar and the fire in the client's 2.6 and 3.4 s or more, the hatchling's scale the species', bait drawing from farther than shyness, the cap between 0 and 100, bait that is rations");
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
  // The farmyard four (0.1.168): bedding counted per animal, a look carried from the wild one (16 wool colours, 3
  // climates), the game's own products, petting only where it's safe.
  const fm = BALANCE.farm;
  if (!(fm.hayComfortCap > 0 && fm.hayComfortCap < 100 && fm.woolDays >= 1)) errors.push("farm: the hay cap between 0 and 100, wool back after a park day or more");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.hay && !(Number.isInteger(s.hay.per) && s.hay.per >= 1 && Number.isInteger(s.hay.min) && s.hay.min >= 1)) errors.push(`${key}: hay bedding is a whole number of animals a bale, and a whole number at least`);
    if (s.coatFrom === "color" && s.coats.length !== 16) errors.push(`${key}: a wool colour coat needs the 16 colours`);
    if (s.coatFrom === "climate" && s.coats.length !== 3) errors.push(`${key}: a climate coat needs the 3 climates`);
    if (s.coatFrom && s.origin !== "vanilla") errors.push(`${key}: only the game's own animals carry their look from a wild one this way`);
    if (s.products && !s.products.every((p) => ["wool", "milk", "eggs", "stew"].includes(p))) errors.push(`${key}: products are wool, milk, eggs or stew`);
    // Mooshrooms (0.1.191): mycelium to graze and the stew are the game's mooshroom's: red or brown, in the Farmyard, a calf
    // now and then the other colour, let go by the game's own colour events.
    if ((s.mycelium || s.products?.includes("stew")) && !(s.origin === "vanilla" && s.family === "mushroomcow" && s.habitatProfile === "farmyard" && s.mycelium?.perAnimal > 0 && s.mycelium.share > 0 && s.mycelium.share <= 1 && !s.graze && s.products?.includes("stew") && s.products.includes("milk") && s.coats.length === 2 && s.coatMutation?.swap && s.wildSpawnEvents?.length === 2 && s.hay)) errors.push(`${key}: mycelium and the stew are the game's mooshroom's: in the Farmyard with hay, red or brown, a calf now and then the other colour, let go by the game's colour events`);
    if (s.products?.includes("wool") && !s.graze) errors.push(`${key}: wool grows back with grass to graze`);
    if (s.petting && s.dangerous) errors.push(`${key}: no petting a dangerous animal`);
  }
  // Wolves and foxes (0.1.169): every bait a food it eats (and the journal says which); a scent trail is scent enrichment;
  // a napper needs cover to nap under; Burrow Soil to dig in is dig enrichment.
  if (!(BALANCE.woodland.soilMin >= 1)) errors.push("woodland: Burrow Soil to dig in is a block or more");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.baitAlso && !(s.baitText && s.baitAlso.every((i) => RATIONS[i] && s.dietTags.includes(RATIONS[i].diet)))) errors.push(`${key}: every bait is a food it eats, and the journal says which`);
    if (s.scentTrail && !s.enrichmentTags.includes("scent")) errors.push(`${key}: a scent trail is scent enrichment`);
    if (s.naps && !(s.cover?.minFraction > 0)) errors.push(`${key}: a napper needs cover to nap under`);
    if (s.toys?.includes("soil") && !s.enrichmentTags.includes("dig")) errors.push(`${key}: Burrow Soil is dig enrichment`);
  }
  // Polar bears (0.1.174): the game's own dangerous animal is calmed by its own event (it has no zoo calm or hunt events)
  // and comes out of a release grown by its own grow-up event.
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.dangerous && s.origin === "vanilla" && !(s.wildCalm?.startsWith("minecraft:") && s.wildGrown?.startsWith("minecraft:"))) errors.push(`${key}: the game's own dangerous animal is calmed and let go grown by the game's own events`);
    if ((s.wildCalm || s.wildGrown) && s.origin !== "vanilla") errors.push(`${key}: only the game's own animals use its events`);
  }
  // Sea turtles (0.1.183): a night inside the day's clock, act times positive, a walk slower than a stroll, a share under 1;
  // a sea turtle is the game's own, on a turtle beach, harmless, nesting in sand (warmth setting the sex), grazing seagrass,
  // fed from an Aquarium Feeder, carried in a Livestock Crate, the journal watching it ashore and nesting.
  const trt = BALANCE.turtle;
  if (!(trt.night[0] >= 12000 && trt.night[1] > trt.night[0] && trt.night[1] <= 24000 && [trt.seekTicks, trt.digTicks, trt.homeTicks, trt.retryTicks, trt.stuckTicks].every((n) => n > 0) && trt.walkPace > 0 && trt.walkPace < 0.2 && trt.stuckBlocks > 0 && trt.warmShare > 0.5 && trt.warmShare < 1 && trt.waterEach >= 1))
    errors.push("turtle: a night in the day's clock, act times positive, a walk under 0.2 a tick, a warm share between a half and 1");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.seaTurtle && !(s.origin === "vanilla" && s.habitatProfile === "turtle_beach" && !s.dangerous && s.sandNest?.tsd && s.seagrass && s.aquariumFeeder && s.carrierProfile === "livestock" && s.observe?.includes("beach") && s.observe?.includes("nesting") && s.breeding?.litterMax <= 4)) errors.push(`${key}: a sea turtle is the game's own on a turtle beach, harmless, nesting in sand, grazing seagrass, fed from an Aquarium Feeder, crated, watched ashore and nesting, 4 eggs at most`);
    if (HABITAT_PROFILES[s.habitatProfile] === HABITAT_PROFILES.turtle_beach && !s.seaTurtle) errors.push(`${key}: the turtle beach is the sea turtles'`);
  }
  // Camels (0.1.181): shares and caps between 0 and 1 and 100, a midday inside the day, a roof looked for as far up as
  // the measure looks, chances under 1; the desert is the game's own camel's, in a desert exhibit, in company, the journal watching
  // it kneel, let go grown by the game's own spawn_adult.
  const cml = BALANCE.camel;
  if (!(cml.sandShare > 0 && cml.sandShare <= 1 && Number.isInteger(cml.shadePerCamel) && cml.shadePerCamel >= 1 && [cml.sandComfortCap, cml.shadeComfortCap].every((c) => c > 0 && c < 100) && cml.midday[0] >= 0 && cml.midday[1] > cml.midday[0] && cml.midday[1] <= 12000 && cml.coverLook === HABITAT_PROFILES.desert.minHeight + BALANCE.cover.height - 1 && cml.seekTicks > 0 && cml.retryTicks > 0 && cml.bathChance > 0 && cml.bathChance < 1 && cml.bathTicks[0] > 0 && cml.bathTicks[1] >= cml.bathTicks[0] && cml.sitChance > 0 && cml.sitChance + cml.bathChance < 1 && cml.sitTicks[0] > 0 && cml.sitTicks[1] >= cml.sitTicks[0] && cml.walkPace > 0 && cml.walkPace < 0.5 && cml.stuckTicks > 0 && cml.stuckBlocks > 0))
    errors.push("camel: a sand share and whole shade blocks, caps between 0 and 100, a midday in the day, a roof looked for as far up as the measure looks, chances under 1, act times positive");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.bornTamed && !(s.origin === "vanilla" && s.desert)) errors.push(`${key}: only the game's camel is born tamed`);
    if (s.desert && !(s.origin === "vanilla" && s.habitatProfile === "desert" && s.social?.minGroup >= 2 && s.observe?.includes("kneel") && s.wildGrown === "minecraft:spawn_adult" && s.dietTags?.includes("leafy"))) errors.push(`${key}: the desert is the game's own camel's, in a desert exhibit, in company, the journal watching it kneel, let go by spawn_adult, eating leafy food`);
  }
  // Goats (0.1.180): a leap's reach is the arc's (up to 3 blocks up: the bench's walls), the ledges and their counts
  // whole numbers, a lookout higher than a ledge's drop, the measure keeping enough spots for the ledges it asks; the
  // rock ledges are the game's own goat's, sheltered on hay; a birth event for each coat, the game's own.
  const gt = BALANCE.goat;
  const between01 = (v) => v > 0 && v < 1;
  if (!(Number.isInteger(gt.leapUp) && gt.leapUp >= 1 && gt.leapUp <= 3 && gt.leapAcross >= 1 && gt.leapDown >= gt.leapUp && Number.isInteger(gt.ledgeDrop) && gt.ledgeDrop >= 1 && gt.lookout > gt.ledgeDrop && Number.isInteger(gt.perGoat) && gt.perGoat >= 1 && Number.isInteger(gt.minLedges) && gt.minLedges >= 1 && gt.spotKeep >= gt.minLedges && gt.ledgeComfortCap > 0 && gt.ledgeComfortCap < 100))
    errors.push("goat: leaps of 1 to 3 blocks up and no shorter down, whole-number ledges with a lookout higher than their drop, enough spots kept, a cap between 0 and 100");
  if (!([gt.leapChance, gt.onChance, gt.offChance, gt.highChance, gt.buttChance].every(between01) && gt.buttMin > 0 && gt.buttRange > gt.buttMin && gt.buttTicks > 0 && gt.buttPush > 0 && [gt.perchTicks, gt.leapTicks].every(([a, b]) => a > 0 && b >= a)))
    errors.push("goat: chances under 1, a butting range, act times positive");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.rockLedges && !(s.origin === "vanilla" && s.hay && s.habitatProfile === "mountain" && s.social?.minGroup >= 2 && s.observe?.includes("ledge"))) errors.push(`${key}: rock ledges are the game's own goat's, in a mountain exhibit with hay, in company, the journal watching its leap`);
    if (s.wildCoatEvents && !(s.origin === "vanilla" && s.wildCoatEvents.length === s.coats.length && s.wildCoatEvents.every((e) => e.startsWith("minecraft:")) && !s.wildCoats)) errors.push(`${key}: a birth event of the game's own for each coat, in place of colour events`);
    // Frogs (0.1.184): let go, spawned by the game's own event for each look, in place of its spawn and of any other look event.
    if (s.wildSpawnEvents && !(s.origin === "vanilla" && s.wildSpawnEvents.length === s.coats.length && s.wildSpawnEvents.every((e) => /^(minecraft:)?[a-z_]+$/.test(e)) && !s.wildCoats && !s.wildCoatEvents && !s.wildGrown)) errors.push(`${key}: a spawn event of the game's own for each look, in place of its spawn and of any other look event`);
  }
  // Frogs (0.1.184): a pad for every 1 to 4 frogs (1 at least), a cap under 100, open water kept, a leap that rises; lily pads
  // are the game's own frog's, in a frog pond, laying frogspawn whose young are tadpoles, eating Insect Rations, harmless, the
  // journal watching it on a pad and its leap; frogspawn, tadpoles, rain breeding and the frog pond are the frogs' alone.
  const fr = BALANCE.frog;
  if (!(Number.isInteger(fr.frogsPerPad) && fr.frogsPerPad >= 1 && fr.frogsPerPad <= 4 && Number.isInteger(fr.minPads) && fr.minPads >= 1 && fr.padComfortCap > 0 && fr.padComfortCap < 100 && Number.isInteger(fr.spawnKeep) && fr.spawnKeep >= 1 && fr.leapRise > 0 && Number.isInteger(fr.leapUp) && fr.leapUp >= 1 && fr.leapUp <= 6 && Number.isInteger(fr.leapDown) && fr.leapDown > fr.leapUp && Number.isInteger(fr.leapReach) && fr.leapReach >= 1 && fr.leapReach <= 8))
    errors.push("frog: a pad for every 1 to 4 frogs, 1 at least, a cap between 0 and 100, open water kept, a leap that rises, 1 to 6 blocks up, further down and 1 to 8 blocks off");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.lilyPads && !(s.origin === "vanilla" && s.habitatProfile === "frog_pond" && s.frogSpawn && s.breeding?.tadpoles && s.dietTags.includes("insect") && !s.dangerous && s.observe?.includes("lilypad") && s.observe?.includes("frogleap"))) errors.push(`${key}: lily pads are the game's own frog's, in a frog pond, laying frogspawn, its young tadpoles, eating Insect Rations, the journal watching it on a pad and leaping`);
    if ((s.frogSpawn || s.breeding?.tadpoles || s.rainBreeds) && !s.lilyPads) errors.push(`${key}: frogspawn, tadpoles and rain breeding are the frogs'`);
    if (Boolean(s.youngEntityType) !== Boolean(s.breeding?.tadpoles) || (s.youngEntityType && !(s.youngEntityType.startsWith("zoocraft:") && s.youngEntityType !== s.entityType))) errors.push(`${key}: young that are a mob of their own are the frogs' tadpoles, a zoo mob`);
    if (HABITAT_PROFILES[s.habitatProfile] === HABITAT_PROFILES.frog_pond && !s.lilyPads) errors.push(`${key}: the frog pond is the frogs'`);
  }
  // Axolotls (0.1.185): plants for each, caps between 0 and 100, the gravel spots and the floor's depth kept, a walk along the
  // bottom that moves; the plants are the game's own axolotl's, in an axolotl tank, a lone animal (no school) in a Water
  // Transport Tank, Insect Rations from an Aquarium Feeder, the journal watching it walk the bottom; the rare blue a coat.
  const ax = BALANCE.axolotl;
  if (!(ax.plantsPerAnimal >= 1 && ax.plantComfortCap > 0 && ax.plantComfortCap < 100 && ax.gravelComfortCap > 0 && ax.gravelComfortCap < 100 && Number.isInteger(ax.gravelKeep) && ax.gravelKeep >= 1 && Number.isInteger(ax.floorDepth) && ax.floorDepth >= 2 && ax.bottomMove > 0))
    errors.push("axolotl: plants for each, caps between 0 and 100, gravel spots kept, a floor looked for 2 or more down, a walk that moves");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.waterPlants && !(s.origin === "vanilla" && s.habitatProfile === "axolotl_tank" && !s.school && !s.dangerous && s.carrierProfile === "aquatic" && s.aquariumFeeder && s.dietTags.includes("insect") && !s.seagrass && s.observe?.includes("bottom"))) errors.push(`${key}: water plants are the game's own axolotl's, in an axolotl tank, alone in a Water Transport Tank, Insect Rations from an Aquarium Feeder, the journal watching it walk the bottom`);
    if (HABITAT_PROFILES[s.habitatProfile] === HABITAT_PROFILES.axolotl_tank && !s.waterPlants) errors.push(`${key}: the axolotl tank is the axolotls'`);
    if (s.coatMutation && !((s.coatMutation.swap ? s.coats.length === 2 : Number.isInteger(s.coatMutation.coat) && s.coatMutation.coat >= 0 && s.coatMutation.coat < s.coats.length) && s.coatMutation.chance > 0 && s.coatMutation.chance < 0.5 && s.breeding)) errors.push(`${key}: a rare colour is one of its coats, now and then, in a species that breeds`);
  }
  // Dolphins (0.1.186): a stretch of 2 or more at a depth of 2 or more, read down at least that far, a share of open water
  // and a cap between 0 and 100, a leap that rises and a swim alongside that moves;
  // the deep pool is the game's own dolphin's, in the dolphin pool, harmless, not a school, big fish or manatee, carried in
  // the Large Water Tank, fed fish from an Aquarium Feeder, kept in company, breeding, the journal watching it leap.
  const dol = BALANCE.dolphin;
  if (!(Number.isInteger(dol.stretch) && dol.stretch >= 2 && Number.isInteger(dol.diveDepth) && dol.diveDepth >= 2 && Number.isInteger(dol.floorDepth) && dol.floorDepth >= dol.diveDepth && dol.openShare > 0 && dol.openShare <= 1 && dol.depthComfortCap > 0 && dol.depthComfortCap < 100 && dol.leapRise > 0 && dol.alongside > 0 && dol.alongsideSpeed > 0))
    errors.push("dolphin: a stretch and a dive depth of 2 or more, read that far down, a share of open water, a cap between 0 and 100, a leap that rises, a swim alongside that moves");
  for (const [key, p] of Object.entries(HABITAT_PROFILES)) {
    if (p.firstGroup !== undefined && !(Number.isInteger(p.firstGroup) && p.firstGroup >= 1)) errors.push(`profile ${key}: the base's first group is a whole number of animals, 1 or more`);
  }
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.deepPool && !(s.origin === "vanilla" && s.habitatProfile === "dolphin_pool" && !s.school && !s.bigFish && !s.aquaticMammal && !s.dangerous && s.carrierProfile === "marine" && s.aquariumFeeder && s.dietTags.includes("fish") && s.breeding && s.social.minGroup >= 2 && s.observe?.includes("dolphinleap"))) errors.push(`${key}: a deep pool is the game's own dolphin's: in the dolphin pool, harmless, one animal (not a school, big fish or manatee) carried in the Large Water Tank, fed fish from an Aquarium Feeder, kept in company, breeding, the journal watching it leap`);
    if (HABITAT_PROFILES[s.habitatProfile] === HABITAT_PROFILES.dolphin_pool && !s.deepPool) errors.push(`${key}: the dolphin pool is the dolphins'`);
  }
  // Bees (0.1.187): flowers for each bee and a few at least, a share of their food up to all of it, caps between 0 and 100,
  // a hive for a whole number of bees, something kept; a bee garden is the game's own bee's: it flies, in the bee garden,
  // harmless, carried in the Small Carrier, sipping Nectar Rations from a Nectar Feeder when the flowers are short, kept
  // in a colony, breeding, the journal watching it gather nectar; only bees live in one.
  const bee = BALANCE.bee;
  if (!(bee.flowersPer > 0 && Number.isInteger(bee.flowersMin) && bee.flowersMin >= 1 && bee.share > 0 && bee.share <= 1 && bee.flowerComfortCap > 0 && bee.flowerComfortCap < 100 && Number.isInteger(bee.perHive) && bee.perHive >= 1 && bee.hiveComfortCap > 0 && bee.hiveComfortCap < 100 && bee.flowerKeep >= 1 && bee.hiveKeep >= 1))
    errors.push("bee: flowers for each bee and a whole number at least, a share of the food up to all of it, caps between 0 and 100, a whole number of bees to a hive, something kept");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.beeGarden && !(s.origin === "vanilla" && s.flies && s.habitatProfile === "bee_garden" && !s.dangerous && s.carrierProfile === "small" && s.nectarFeeder && s.dietTags.includes("nectar") && s.breeding && s.social.minGroup >= 2 && s.observe?.includes("beeflower"))) errors.push(`${key}: a bee garden is the game's own bee's: flying in the bee garden, harmless, carried in the Small Carrier, eating from a Nectar Feeder when the flowers are short, kept in a colony, breeding, the journal watching it gather nectar`);
    if (HABITAT_PROFILES[s.habitatProfile]?.bees && !s.beeGarden) errors.push(`${key}: the bee garden is the bees'`);
  }
  // Parrots (0.1.188): a dance within a few blocks of a jukebox, music for a park day or more, a jukebox or more kept, the
  // game's imitation range and chances of 1 in 1 or more (far ones rarer than near), heard a moment, a range round a
  // player; a dancer is the game's own parrot: it flies, in an aviary with Perches, harmless, carried in the Small
  // Carrier, in a flock, enjoying music, breeding in a Nest Box, the journal watching it dance and hearing it imitate.
  const par = BALANCE.parrot;
  if (!(par.danceRadius > 0 && par.danceRadius <= 8 && Number.isInteger(par.musicDays) && par.musicDays >= 0 && par.jukeboxKeep >= 1 && par.imitateRange > 0 && par.imitateEvery >= 20 && par.nearChance >= 1 && par.farChance >= par.nearChance && par.heardMs > 0 && par.range > 0))
    errors.push("parrot: a dance radius up to 8, whole park days of music, a jukebox kept, an imitation range, chances of 1 in 1 or more (far ones no likelier than near), heard a moment, a range");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.dances && !s.duplicates && !(s.origin === "vanilla" && s.flies && HABITAT_PROFILES[s.habitatProfile]?.aerial && HABITAT_PROFILES[s.habitatProfile]?.minRoosts && !s.roosts && !s.dangerous && s.carrierProfile === "small" && s.enrichmentTags.includes("music") && s.breeding?.nestBox && s.social.minGroup >= 2 && s.observe?.includes("dance") && s.observe?.includes("imitate")))
      errors.push(`${key}: a dancer is the game's parrot: it flies in an aviary with Perches (not the owls' roosting), harmless, in the Small Carrier, enjoying music, laying in a Nest Box, in a flock, the journal's "dance" and "imitate"`);
  }
  // Bats (0.1.194): a wake range, bouts, a glide, caps under 100; one that hangs is the game's bat: it flies in a roofed house,
  // a roost for each, a flight 8 wingspans long, in the dark, harmless, in the Small Carrier, a colony, the journal's
  // "hang" and "colony". Allays: a dance reach, the game's 5 minutes' rest; one that splits in two is the game's allay:
  // flying, dancing (no parrot's Perches, no Nest Box, no imitating), harmless, in the Small Carrier, enjoying music and a
  // note block, no breeding of its own, the journal's "dance".
  const bat = BALANCE.bat;
  if (!(bat?.wakeRange > 0 && bat.reach > 0 && bat.glideSpeed > 0 && bat.glideSpeed <= 1 && bat.flyTicks[0] > 0 && bat.flyTicks[0] <= bat.flyTicks[1] && bat.hangTicks[0] > 0 && bat.hangTicks[0] <= bat.hangTicks[1] && bat.startleTicks[0] > 0 && bat.startleTicks[0] <= bat.startleTicks[1] && bat.turnEvery >= 10 && bat.turnChance >= 0 && bat.turnChance <= 1 && bat.roostKeep >= 1 && bat.roostComfortCap > 0 && bat.roostComfortCap < 100 && bat.flightComfortCap > 0 && bat.flightComfortCap < 100 && bat.range > 0))
    errors.push("bat: a wake range, a reach, a glide up to a block a tick, bouts (shortest first), a turn, roosts kept, caps under 100, a range");
  const alla = BALANCE.allay;
  if (!(alla?.danceRadius > 0 && alla.danceRadius <= 16 && Number.isInteger(alla.dupTicks) && alla.dupTicks >= 20 && alla.noteKeep >= 1)) errors.push("allay: a dance reach up to 16, a rest in whole ticks, note blocks kept");
  for (const [key, s] of Object.entries(SPECIES)) {
    const prof = HABITAT_PROFILES[s.habitatProfile];
    if ((s.batRoost || s.flight) && !(s.origin === "vanilla" && s.batRoost?.per >= 1 && s.flight?.length >= 4 && s.flies && prof?.aerial && !prof.minRoosts && s.lowLight && !s.nightLife && !s.nocturnal && !s.dangerous && s.carrierProfile === "small" && s.social.minGroup >= 2 && s.observe?.includes("hang") && s.observe.includes("colony") && !s.dances))
      errors.push(`${key}: a bat is the game's: flying in a roofed house (no Perches), a roost for each, a long flight, in the dark, harmless, in the Small Carrier, a colony, the journal's "hang" and "colony"`);
    if (s.duplicates && !(s.origin === "vanilla" && s.dances && s.flies && prof?.aerial && !prof.minRoosts && !s.breeding && !s.dangerous && s.carrierProfile === "small" && s.enrichmentTags.includes("music") && s.noteBlock && s.enrichmentTags.includes("notes") && s.observe?.includes("dance") && !s.observe.includes("imitate")))
      errors.push(`${key}: one that splits in two is the game's allay: flying and dancing in a roofed room (no Perches), no breeding of its own, harmless, in the Small Carrier, enjoying music and a note block, the journal's "dance" (no imitating)`);
    if (s.noteBlock && !s.duplicates) errors.push(`${key}: a note block is the allays'`);
  }
  // Golems (0.1.195): a warm cap under 100, a range. A built one is the game's golem: no breeding, no water, no sexes by
  // coat, alone or more, the journal's spot; iron golems the paving, in the Reinforced Crate, let go as a player's; snow
  // golems a roof over all of the yard and the warmth; copper golems the chests and their copper (4 stages from the wild
  // one's oxidation, let go by the game's events for each), in the Small Carrier.
  const gol = BALANCE.golem;
  if (!(gol?.warmComfortCap > 0 && gol.warmComfortCap < 100 && gol.range > 0)) errors.push("golem: a warm cap under 100, a range");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.built && !(s.origin === "vanilla" && ["iron", "snow", "copper"].includes(s.built) && !s.breeding && s.drinksNothing && !s.sexByCoat && !s.hermaphrodite && !s.dangerous && !s.flies && s.social.minGroup === 1 && s.observe?.[0] === "spot" && s.dietTags.length === 1 && s.dietTags[0] === s.built))
      errors.push(`${key}: a built one is the game's golem: no breeding, drinking nothing, harmless, walking, alone or more, eating its own (${s.built})`);
    if (s.built === "iron" && !(s.mobFloor && s.carrierProfile === "large" && s.wildGrown === "minecraft:from_player" && s.observe.includes("rounds"))) errors.push(`${key}: an iron golem wants paving, travels in the Reinforced Crate, goes back as a player's, the journal's "rounds"`);
    if (s.built === "snow" && !(s.melts && s.cover?.minFraction === 1 && s.observe.includes("snowtrail"))) errors.push(`${key}: a snow golem wants a roof over all of its yard and a cool biome, the journal's "snowtrail"`);
    if (s.melts && s.built !== "snow") errors.push(`${key}: melting is the snow golems'`);
    if (s.built === "copper" && !(s.copper && s.chestSorting && s.enrichmentTags.includes("sorting") && s.coatFrom === "oxidation" && s.coats.length === 4 && s.wildSpawnEvents?.length === 4 && s.wildSpawnEvents.every((e) => e.startsWith("minecraft:from_player_")) && s.carrierProfile === "small" && s.observe.includes("chestsort"))) errors.push(`${key}: a copper golem sorts chests, has its 4 stages from the wild one and goes back by the game's events, in the Small Carrier, the journal's "chestsort"`);
    if ((s.copper || s.chestSorting || s.enrichmentTags.includes("sorting")) && s.built !== "copper") errors.push(`${key}: copper and chests are the copper golems'`);
    if (s.drinksNothing && !s.built) errors.push(`${key}: drinking nothing is the golems'`);
  }
  // Ocelots and cats (0.1.189): a rest-comfort cap under 100, spots kept, the game's trusting odds (one time in 3: its
  // probability 0.33). A shy one with rest spots is the game's ocelot or cat: harmless, a napper (with cover, above), in the
  // Small Carrier, an ocelot on a log each, a cat on a seat for each 2 or so, the journal's own sights; only the cat has
  // the two voices.
  const kitty = BALANCE.cat;
  if (!(kitty.restComfortCap > 0 && kitty.restComfortCap < 100 && kitty.restKeep >= 1 && kitty.trustOdds === 3 && kitty.seatReach >= 1 && kitty.seatReach <= 2 && kitty.bedSitOdds >= 1 && kitty.range > 0)) errors.push("cat: a rest comfort cap under 100, a spot kept, the game's trusting odds (3), a seat reached from 1 to 2 blocks off, bed sits one time in 1 or more, a range");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (!(s.wary || s.restSpots || s.soundVariants)) continue;
    const r = s.restSpots;
    const ok = s.origin === "vanilla" && s.wary && s.naps && !s.dangerous && s.carrierProfile === "small" && r && ((r.kind === "log" && r.per === 1 && s.family === "ocelot" && s.observe?.includes("trust")) || (r.kind === "seat" && r.per >= 1 && r.per <= 3 && s.family === "cat" && s.observe?.includes("sit")));
    if (!ok) errors.push(`${key}: a shy one with rest spots is the game's ocelot (a log each, the journal's "trust") or cat (a seat for each few, its "sit"): harmless, napping, in the Small Carrier`);
    if (s.soundVariants && s.family !== "cat") errors.push(`${key}: the two voices are the game's cat's`);
  }
  // Armadillos (0.1.190): caps under 100, the game's own cold tags; the game's armadillo, harmless, in the Small Carrier,
  // eating insects, sand underfoot (a share of the floor), the hedgehogs' Burrow Shelter, Burrow Soil to dig, warmth in a
  // cold biome, the journal's roll-up, let go grown.
  const dillo = BALANCE.armadillo;
  if (!(dillo.sandComfortCap > 0 && dillo.sandComfortCap < 100 && dillo.coldComfortCap > 0 && dillo.coldComfortCap < 100 && dillo.coldTags?.length && dillo.coldTags.every((t) => typeof t === "string"))) errors.push("armadillo: comfort caps under 100 and the biome tags that are cold");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (!(s.sandFloor || s.coldWarmth || s.rollsUp)) continue;
    const ok = s.origin === "vanilla" && s.family === "armadillo" && s.sandFloor?.share > 0 && s.sandFloor.share <= 1 && s.coldWarmth && s.rollsUp && !s.heat && !s.dangerous && s.carrierProfile === "small" && s.den === "burrow" && s.toys?.includes("soil") && s.dietTags?.includes("insect") && s.observe?.includes("rollup") && s.observe.includes("peek") && s.wildGrown === "minecraft:spawn_adult";
    if (!ok) errors.push(`${key}: sand underfoot, warmth in the cold and the roll-up are the game's armadillo's: harmless, in the Small Carrier, eating insects, a Burrow Shelter, Burrow Soil, the journal's roll-up and peek, let go by spawn_adult (no Nether heat)`);
  }
  // Sniffers (0.1.192): a cap under 100; the digging beds are the game's sniffer's: harmless, in the Livestock Crate,
  // eating seeds, the journal's sniffing and digging, let go grown by spawn_adult.
  if (!(BALANCE.sniffer?.digComfortCap > 0 && BALANCE.sniffer.digComfortCap < 100)) errors.push("sniffer: a comfort cap under 100");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (!s.digBed) continue;
    const ok = s.origin === "vanilla" && s.family === "sniffer" && s.digBed.share > 0 && s.digBed.share <= 1 && !s.dangerous && s.carrierProfile === "livestock" && s.dietTags?.includes("seed") && s.baitItem === "minecraft:torchflower_seeds" && s.observe?.includes("seedsniff") && s.observe.includes("digup") && s.wildGrown === "minecraft:spawn_adult" && !s.graze && !s.mycelium && !s.sandFloor;
    if (!ok) errors.push(`${key}: digging beds are the game's sniffer's: harmless, in the Livestock Crate, eating seeds (torchflower seeds as bait), the journal's sniffing and digging, let go by spawn_adult, no grazing or sand floor`);
  }
  // Horses and donkeys (0.1.175): a run is 4 blocks or more on a grazing floor, galloped at most as often as a horse's;
  // the run, grooming, markings and colour events are the game's own horses' and donkeys'; markings go with the horse's 7
  // coats, and there is a colour event for each coat.
  const pdk = BALANCE.paddock;
  if (!(pdk.runComfortCap > 0 && pdk.runComfortCap < 100 && pdk.groomComfortCap > 0 && pdk.groomComfortCap < 100 && pdk.groomDays >= 1 && pdk.grazeChance > 0 && pdk.grazeChance < 1 && pdk.gallopChance > 0 && pdk.gallopChance < 1 && [pdk.grazeTicks, pdk.gallopTicks].every(([a, b]) => a > 0 && b >= a))) errors.push("paddock: caps between 0 and 100, a grooming lasting a park day or more, chances under 1, act times positive");
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.run && !(Number.isInteger(s.run.length) && s.run.length >= 4 && (s.run.gallop ?? 1) > 0 && (s.run.gallop ?? 1) <= 1 && s.graze)) errors.push(`${key}: a run is 4 blocks or more on a grazing floor, galloped at most as often as a horse`);
    if ((s.run || s.groom || s.marks || s.wildCoats) && s.origin !== "vanilla") errors.push(`${key}: the paddock's ways are for the game's own horses and donkeys`);
    if (s.marks && s.coats.length !== 7) errors.push(`${key}: markings go with the horse's 7 coats`);
    if (s.wildCoats && s.wildCoats.length !== s.coats.length) errors.push(`${key}: a colour event for each coat`);
    if (s.wildGrowUp && (s.origin !== "vanilla" || s.wildGrown || !s.wildSource?.startsWith("minecraft:"))) errors.push(`${key}: a grow-up event when let go is for the game's own animals that come out of its usual spawn`);
  }
  // Pandas (0.1.170): a bamboo grove is a stalk or more, browsed (the grove toy, forage enrichment), and only a species with
  // one breeds by it; genes are the game's seven, on the game's own animal.
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.grove && !(s.grove.min >= 1 && s.toys?.includes("grove") && s.enrichmentTags.includes("forage"))) errors.push(`${key}: a bamboo grove is a stalk or more, browsed as forage`);
    if (s.breeding?.grove && !s.grove) errors.push(`${key}: breeding by a bamboo grove needs one measured`);
    if (s.genes && !(s.origin === "vanilla" && s.coats.length === 7)) errors.push(`${key}: genes are the game's seven, on its own animal`);
  }
  // Llamas, trader llamas and mules (0.1.193): carpets are the game's llamas'; only the trader llama is caught tamed (off its
  // trader's lead); a mule has no foals but a horse and a donkey do; herd mates share the exhibit; wild mounts are the game's.
  for (const [key, s] of Object.entries(SPECIES)) {
    if (s.decor && !(s.origin === "vanilla" && ["llama", "trader_llama"].includes(s.family) && s.coats.length === 4 && s.wildMount && s.observe?.includes("herd"))) errors.push(`${key}: carpets are the game's llamas', with its 4 coats`);
    if (s.freeTamed && !(s.decor && s.wildSource === "minecraft:trader_llama" && s.observe?.includes("onlead"))) errors.push(`${key}: only the game's trader llama is caught off its trader's lead`);
    if (s.sterile && !(s.origin === "vanilla" && s.family === "mule" && s.breeding && !s.crossBreed)) errors.push(`${key}: only the game's mule has no foals`);
    if (s.crossBreed && !(s.breeding && SPECIES[s.crossBreed.with]?.crossBreed?.with === key && SPECIES[s.crossBreed.young]?.sterile && s.crossBreed.young === SPECIES[s.crossBreed.with].crossBreed.young && canShareIds(key, s.crossBreed.with))) errors.push(`${key}: a cross is with a kind it shares with, both ways, and the foal has no foals of its own`);
    if (s.herdWith && !(s.herdWith.every((id) => SPECIES[id] && canShareIds(key, id)) && s.social?.prefersCompany)) errors.push(`${key}: herd mates are kinds it shares an exhibit with`);
    if (s.wildMount && !(s.origin === "vanilla" && s.carrierProfile === "livestock")) errors.push(`${key}: a wild mount is the game's own, in the Livestock Crate`);
    if ((s.decor || s.sterile) && s.wildGrown !== "minecraft:spawn_adult") errors.push(`${key}: let go grown by the game's spawn_adult`);
  }
  return errors;
}
