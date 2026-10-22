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
    if (s.dangerous && !(s.carrierProfile === "large" && s.dens && s.dens.spare >= 0 && s.dietTags.includes(RATIONS[s.baitItem]?.diet))) errors.push(`${key}: a dangerous species travels in a Reinforced Crate, is baited with a ration it eats and has Holding Dens`);
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
    if (b?.eggBed && !s.mineralBed) errors.push(`${key}: eggs laid in Mineral Substrate are counted with the mineral bed (species.mineralBed)`);
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
    if (s.houseLight !== undefined && !(s.nightLife && s.houseLight >= BALANCE.nocturnal.maxLight && s.houseLight < 15)) errors.push(`${key}: a house light is a night animal's, at least the Nocturnal Lamps' and under daylight's`);
  }
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
  if (Math.abs(sw.food + sw.seating + sw.litter - 1) > 1e-9) errors.push("services weights don't sum to 1");
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
  if (!(c.minDistance > BALANCE.park.radius)) errors.push("conservation.minDistance must reach past the park boundary");
  if (!(c.guestsPerRelease >= 0 && c.guestsCap >= c.guestsPerRelease)) errors.push("conservation guest boost: the cap must hold at least one release");
  return errors;
}
