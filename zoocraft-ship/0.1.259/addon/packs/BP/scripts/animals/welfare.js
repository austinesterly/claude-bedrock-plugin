// Welfare math (spec section 7). Pure: takes plain records, returns new values; no Minecraft calls.
// Needs run 0-100, higher is better. Satiety and enrichment drain over park time; cleanliness
// belongs to the exhibit; comfort and social drift toward a target set by the exhibit's conditions.

import { RATIONS, rationPlural } from "../data/items.js";
import { BALANCE } from "../data/balance.js";

export const NEED_KEYS = ["satiety", "comfort", "cleanliness", "enrichment", "social"];
const clamp = (v) => Math.max(0, Math.min(100, v));

export function welfareScore(needs, weights) {
  let w = 0;
  for (const k of NEED_KEYS) w += weights[k] * needs[k];
  return Math.round(w);
}

export function band(value, bands) {
  if (value >= bands.healthy) return "healthy";
  if (value >= bands.attention) return "attention";
  if (value >= bands.urgent) return "urgent";
  return "critical";
}

export function lowestNeed(needs) {
  let worst = NEED_KEYS[0];
  for (const k of NEED_KEYS) if (needs[k] < needs[worst]) worst = k;
  return worst;
}

export function comfortTarget(spaceRatio) {
  // spaceRatio = usable area / required area. A crowded exhibit is safe but uncomfortable.
  return spaceRatio >= 1 ? 90 : Math.round(90 * Math.max(0, spaceRatio));
}

export function socialTarget(social, groupSize) {
  if (groupSize < social.minGroup) return 40;
  if (groupSize > social.recommendedMax) return 55;
  if (social.prefersCompany && groupSize < 2) return 65;
  return 90;
}

const toward = (value, target, maxStep) => (value < target ? Math.min(target, value + maxStep) : Math.max(target, value - maxStep));

/**
 * Advance one animal by `seconds` of park time.
 * @param {object} animal  record with needs, health and criticalSeconds
 * @param {object} species species entry
 * @param {{ exhibitCleanliness: number, spaceRatio: number, groupSize: number, feederUnits: number, water?: boolean, cover?: boolean, cold?: boolean, mud?: boolean, heat?: boolean, bask?: boolean, ash?: boolean, den?: boolean, end?: boolean, anchor?: boolean, tunnel?: boolean, tree?: boolean, wash?: boolean, graze?: boolean, harem?: boolean, dens?: boolean, ledge?: boolean, coalition?: boolean, privacy?: boolean, solitary?: boolean, bank?: boolean, submerge?: boolean, canopy?: boolean, nestbox?: boolean, shade?: boolean, troop?: boolean, deep?: boolean, perches?: boolean, nylium?: boolean, rub?: boolean, walls?: boolean, hide?: boolean, males?: boolean, wallow?: boolean, soul?: boolean, bed?: boolean, pads?: boolean, crevices?: boolean, mineral?: boolean, rock?: boolean, burrows?: boolean, flowers?: boolean, dim?: boolean, endPlants?: boolean, warmPads?: boolean, retreat?: boolean, sand?: boolean, seagrass?: boolean, lush?: boolean, clay?: boolean, burrow?: boolean, sculk?: boolean, shriek?: boolean, bloom?: boolean, warmth?: boolean, hoard?: boolean, trunk?: boolean, snow?: boolean, soulfloor?: boolean, beam?: boolean, mobfloor?: boolean, hay?: boolean, run?: boolean, groomed?: boolean, rockLedges?: boolean, desertSand?: boolean, desertShade?: boolean, lilyPads?: boolean, waterPlants?: boolean, tankFloor?: boolean, deepStretch?: boolean, openWater?: boolean, beeFlowers?: boolean, beeHives?: boolean, restSpots?: boolean, sandFloor?: boolean, chill?: boolean, mycelium?: boolean, digBed?: boolean, batRoosts?: boolean, batFlight?: boolean, coolBiome?: boolean, skyView?: boolean, sulfur?: boolean, drainFactor?: number, grazeShare?: number, satietyCap?: number, enrichmentPerDay?: number, germFactor?: number }} ctx
 *   water: false when the animals have nothing to drink (comfort is capped); cover: false when a
 *   species that wants quiet cover hasn't enough (comfort is capped); heat: false when a Nether
 *   species has no working Thermal Regulator; bask: false without enough basking pads; ash: false
 *   without a big enough Warm Ash bed; den: false without an Ember Den; end: false without enough
 *   end stone in the floor (End ground); anchor: false when a rift species has no charged Containment
 *   Anchor; tunnel: false without enough Rift Tunnels; tree: false when a climber has no climbing tree or
 *   Climbing Frame; wash: false without water to wash food in; graze: false when grazers haven't enough
 *   grass; harem: false while rival stallions share the mares; dens: false when a dangerous species has
 *   too few Holding Dens; ledge: false when lions have too few ledges; coalition: false with more grown
 *   males than a coalition; privacy: false when tigers have too little screened floor; solitary: false
 *   with two grown tigers loose together (but a pair on their introduction day); bank: false for a crocodile
 *   left without a spot on the sunny basking bank (the smallest, when it's short); submerge: false when the
 *   crocodiles haven't deep water enough to go under all at once; canopy: false when red pandas haven't canopy
 *   enough reached by climbing; nestbox: false without a Nest Box each; shade: false in a hot biome without shade
 *   over enough of the floor; perches: false while an owl aviary's Perches are all about one height; nylium: false
 *   when Crimson Grazers haven't crimson nylium enough in the floor; rub: false without a crimson stem to rub on; walls:
 *   false when Warped Geckos haven't wall enough to climb; hide: false without a hide each (a crack or a Burrow
 *   Shelter); males: false with two grown males together (geckos, boars); wallow: false when Cinder Boars haven't
 *   Thermal Mud enough in the floor; soul: false when Soul Moths have no soul light; bed: false when Quartz
 *   Beetles haven't Mineral Substrate enough in the floor; pads: false when End Hoppers haven't Landing Pads
 *   enough, or none high; crevices: false when Shimmer Snails haven't a crevice each; mineral: false when they
 *   haven't Mineral Substrate enough in the floor; rock: false when Obsidian Crabs haven't rock faces enough to scrape;
 *   burrows: false when they haven't Mineral Substrate enough to dig into; flowers: false when Chorus Moths haven't
 *   chorus flowers enough; dim: false when their house isn't dim; endPlants: false when Starback Tortoises haven't
 *   chorus enough on the floor to browse; warmPads: false when they haven't Warm Pads enough; retreat: false when their
 *   low roof is too small; sand: false when Giant Stingrays haven't sand enough under the water; seagrass: false when
 *   manatees haven't seagrass or kelp enough in the water to graze; lush: false when Lush Okapis haven't moss and lush
 *   plants enough; clay: false when they have no clay lick; burrow: false when Earth Molebears haven't Burrow Soil
 *   enough to tunnel into; sculk: false when Skulkers haven't sculk enough in the floor; shriek: false with a sculk
 *   shrieker in or beside it; bloom: false when Unicorns haven't glowing flowers enough on the floor; warmth: false
 *   when Dragons have no lit campfire on the floor to bask by; hoard: false when Griffins have no gold on the floor to
 *   guard; trunk: false when Glowhorn Stags have no trunk to rub their antlers on; snow: false when Giant Yetis have too
 *   little snow underfoot; soulfloor: false when Soul Sloths have too little soul sand or soul soil underfoot; beam:
 *   false when they have no beam to hang from; troop: false
 *   while two silverbacks share the females (gorillas); deep: false with
 *   water 2 or more deep in the exhibit for a species that can't swim; drainFactor: the satiety drain's share today (a planned fast day); grazeShare: the share of its food it gets
 *   grazing (0 to 1: the satiety drain is that much lower, so it eats that much less from the feeders);
 *   satietyCap: how high the feeders can bring its satiety (a zebra pushed off the food by higher-ranking
 *   ones); enrichmentPerDay: enrichment restored by the exhibit's equipment; germFactor: how fast the illness clock runs
 *   (below 1 for a while after Clian sanitises the exhibit, 0.1.259)
 * @returns {{ unitsEaten: number }} feeder units consumed; the caller takes them off the feeder
 */
export function simulateAnimal(animal, species, ctx, seconds, balance) {
  const days = seconds / balance.clock.dayLength;
  const n = animal.needs;
  const drain = balance.needs.drainPerDay;

  n.satiety = clamp(n.satiety - drain.satiety * days * (1 - (ctx.grazeShare ?? 0)) * (ctx.drainFactor ?? 1));
  // Eat from real feeder stock: each unit restores exactly one share of a day's drain, so an
  // animal eating its daily ration holds steady (a grazer needs that much less of it).
  const perUnit = drain.satiety / species.rationUnitsPerParkDay;
  const cap = ctx.satietyCap ?? 100;
  let unitsEaten = 0;
  let units = ctx.feederUnits;
  while (units > 0 && n.satiety <= cap - perUnit) {
    n.satiety = clamp(n.satiety + perUnit);
    units--;
    unitsEaten++;
  }

  n.enrichment = clamp(n.enrichment - drain.enrichment * days + (ctx.enrichmentPerDay ?? 0) * days);
  n.cleanliness = clamp(ctx.exhibitCleanliness);
  const step = balance.needs.adjustPerDay * days;
  let comfortGoal = comfortTarget(ctx.spaceRatio);
  if (ctx.water === false) comfortGoal = Math.min(comfortGoal, balance.trough.dryComfortCap);
  if (ctx.cover === false) comfortGoal = Math.min(comfortGoal, balance.cover.comfortCap);
  if (ctx.cold === false) comfortGoal = Math.min(comfortGoal, balance.cooler.warmComfortCap);
  if (ctx.mud === false) comfortGoal = Math.min(comfortGoal, balance.mud.comfortCap);
  if (ctx.heat === false) comfortGoal = Math.min(comfortGoal, balance.heater.coldComfortCap);
  if (ctx.bask === false) comfortGoal = Math.min(comfortGoal, balance.bask.comfortCap);
  if (ctx.ash === false) comfortGoal = Math.min(comfortGoal, balance.ash.comfortCap);
  if (ctx.den === false) comfortGoal = Math.min(comfortGoal, balance.den.comfortCap);
  if (ctx.end === false) comfortGoal = Math.min(comfortGoal, balance.endGround.comfortCap);
  if (ctx.anchor === false) comfortGoal = Math.min(comfortGoal, balance.anchor.comfortCap);
  if (ctx.tunnel === false) comfortGoal = Math.min(comfortGoal, balance.tunnel.comfortCap);
  if (ctx.tree === false) comfortGoal = Math.min(comfortGoal, balance.climbTree.comfortCap);
  if (ctx.wash === false) comfortGoal = Math.min(comfortGoal, balance.wash.comfortCap);
  if (ctx.graze === false) comfortGoal = Math.min(comfortGoal, balance.graze.comfortCap);
  if (ctx.harem === false) comfortGoal = Math.min(comfortGoal, balance.zebra.rivalComfortCap);
  if (ctx.dens === false) comfortGoal = Math.min(comfortGoal, balance.predators.dens.comfortCap);
  if (ctx.ledge === false) comfortGoal = Math.min(comfortGoal, balance.lion.ledgeComfortCap);
  if (ctx.coalition === false) comfortGoal = Math.min(comfortGoal, balance.lion.coalitionComfortCap);
  if (ctx.privacy === false) comfortGoal = Math.min(comfortGoal, balance.tiger.privacyComfortCap);
  if (ctx.solitary === false) comfortGoal = Math.min(comfortGoal, balance.tiger.solitaryComfortCap);
  if (ctx.bank === false) comfortGoal = Math.min(comfortGoal, balance.croc.bankComfortCap);
  if (ctx.submerge === false) comfortGoal = Math.min(comfortGoal, balance.croc.submergeComfortCap);
  if (ctx.canopy === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.canopyComfortCap);
  if (ctx.nestbox === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.nestComfortCap);
  if (ctx.shade === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.shadeComfortCap);
  if (ctx.troop === false) comfortGoal = Math.min(comfortGoal, balance.gorilla.rivalComfortCap);
  if (ctx.deep === false) comfortGoal = Math.min(comfortGoal, balance.gorilla.deepComfortCap);
  if (ctx.perches === false) comfortGoal = Math.min(comfortGoal, balance.owl.perchComfortCap);
  if (ctx.nylium === false) comfortGoal = Math.min(comfortGoal, balance.grazer.nyliumComfortCap);
  if (ctx.rub === false) comfortGoal = Math.min(comfortGoal, balance.grazer.rubComfortCap);
  if (ctx.walls === false) comfortGoal = Math.min(comfortGoal, balance.gecko.wallsComfortCap);
  if (ctx.hide === false) comfortGoal = Math.min(comfortGoal, balance.gecko.hideComfortCap);
  if (ctx.males === false) comfortGoal = Math.min(comfortGoal, balance.gecko.rivalComfortCap);
  if (ctx.wallow === false) comfortGoal = Math.min(comfortGoal, balance.boar.wallowComfortCap);
  if (ctx.soul === false) comfortGoal = Math.min(comfortGoal, balance.moth.soulComfortCap);
  if (ctx.bed === false) comfortGoal = Math.min(comfortGoal, balance.beetle.bedComfortCap);
  if (ctx.pads === false) comfortGoal = Math.min(comfortGoal, balance.hopper.padComfortCap);
  if (ctx.crevices === false) comfortGoal = Math.min(comfortGoal, balance.snail.creviceComfortCap);
  if (ctx.mineral === false) comfortGoal = Math.min(comfortGoal, balance.snail.bedComfortCap);
  if (ctx.rock === false) comfortGoal = Math.min(comfortGoal, balance.crab.rockComfortCap);
  if (ctx.burrows === false) comfortGoal = Math.min(comfortGoal, balance.crab.burrowComfortCap);
  if (ctx.flowers === false) comfortGoal = Math.min(comfortGoal, balance.chorusMoth.flowerComfortCap);
  if (ctx.dim === false) comfortGoal = Math.min(comfortGoal, balance.chorusMoth.dimComfortCap);
  if (ctx.endPlants === false) comfortGoal = Math.min(comfortGoal, balance.starback.plantComfortCap);
  if (ctx.warmPads === false) comfortGoal = Math.min(comfortGoal, balance.starback.padComfortCap);
  if (ctx.retreat === false) comfortGoal = Math.min(comfortGoal, balance.starback.retreatComfortCap);
  if (ctx.sand === false) comfortGoal = Math.min(comfortGoal, balance.ray.sandComfortCap);
  if (ctx.seagrass === false) comfortGoal = Math.min(comfortGoal, balance.manatee.seagrassComfortCap);
  if (ctx.lush === false) comfortGoal = Math.min(comfortGoal, balance.okapi.lushComfortCap);
  if (ctx.clay === false) comfortGoal = Math.min(comfortGoal, balance.okapi.clayComfortCap);
  if (ctx.burrow === false) comfortGoal = Math.min(comfortGoal, balance.molebear.soilComfortCap);
  if (ctx.sculk === false) comfortGoal = Math.min(comfortGoal, balance.skulker.sculkComfortCap);
  if (ctx.shriek === false) comfortGoal = Math.min(comfortGoal, balance.skulker.shriekComfortCap);
  if (ctx.bloom === false) comfortGoal = Math.min(comfortGoal, balance.unicorn.flowerComfortCap);
  if (ctx.warmth === false) comfortGoal = Math.min(comfortGoal, balance.dragon.warmthComfortCap);
  if (ctx.hoard === false) comfortGoal = Math.min(comfortGoal, balance.griffin.hoardComfortCap);
  if (ctx.trunk === false) comfortGoal = Math.min(comfortGoal, balance.glowhorn.trunkComfortCap);
  if (ctx.snow === false) comfortGoal = Math.min(comfortGoal, balance.yeti.snowComfortCap);
  if (ctx.soulfloor === false) comfortGoal = Math.min(comfortGoal, balance.sloth.soulComfortCap);
  if (ctx.beam === false) comfortGoal = Math.min(comfortGoal, balance.sloth.beamComfortCap);
  if (ctx.mobfloor === false) comfortGoal = Math.min(comfortGoal, balance.mobs.floorComfortCap);
  if (ctx.hay === false) comfortGoal = Math.min(comfortGoal, balance.farm.hayComfortCap); // the farmyard's bedding (0.1.168)
  if (ctx.run === false) comfortGoal = Math.min(comfortGoal, balance.paddock.runComfortCap); // the paddock's run (0.1.175)
  if (ctx.groomed === false) comfortGoal = Math.min(comfortGoal, balance.paddock.groomComfortCap); // grooming (0.1.175)
  if (ctx.rockLedges === false) comfortGoal = Math.min(comfortGoal, balance.goat.ledgeComfortCap); // goats' rock ledges (0.1.180)
  if (ctx.desertSand === false) comfortGoal = Math.min(comfortGoal, balance.camel.sandComfortCap); // camels' sand underfoot (0.1.181)
  if (ctx.desertShade === false) comfortGoal = Math.min(comfortGoal, balance.camel.shadeComfortCap); // camels' shade (0.1.181)
  if (ctx.lilyPads === false) comfortGoal = Math.min(comfortGoal, balance.frog.padComfortCap); // frogs' lily pads (0.1.184)
  if (ctx.waterPlants === false) comfortGoal = Math.min(comfortGoal, balance.axolotl.plantComfortCap); // axolotls' plants (0.1.185)
  if (ctx.tankFloor === false) comfortGoal = Math.min(comfortGoal, balance.axolotl.gravelComfortCap); // and no gravel (0.1.185)
  if (ctx.deepStretch === false) comfortGoal = Math.min(comfortGoal, balance.dolphin.depthComfortCap); // dolphins' deep stretch (0.1.186)
  if (ctx.openWater === false) comfortGoal = Math.min(comfortGoal, balance.dolphin.depthComfortCap); // and the open water they breathe at (0.1.186)
  if (ctx.beeFlowers === false) comfortGoal = Math.min(comfortGoal, balance.bee.flowerComfortCap); // bees' flowers (0.1.187)
  if (ctx.beeHives === false) comfortGoal = Math.min(comfortGoal, balance.bee.hiveComfortCap); // and a hive for each 3 (0.1.187)
  if (ctx.restSpots === false) comfortGoal = Math.min(comfortGoal, balance.cat.restComfortCap); // ocelots' logs, cats' seats (0.1.189)
  if (ctx.sandFloor === false) comfortGoal = Math.min(comfortGoal, balance.armadillo.sandComfortCap); // armadillos' sand (0.1.190)
  if (ctx.chill === false) comfortGoal = Math.min(comfortGoal, balance.armadillo.coldComfortCap); // and warmth in a snowy biome (0.1.190)
  if (ctx.mycelium === false) comfortGoal = Math.min(comfortGoal, balance.graze.comfortCap); // mooshrooms' mycelium (0.1.191)
  if (ctx.digBed === false) comfortGoal = Math.min(comfortGoal, balance.sniffer.digComfortCap); // sniffers' digging beds (0.1.192)
  if (ctx.batRoosts === false) comfortGoal = Math.min(comfortGoal, balance.bat.roostComfortCap); // bats' roosts (0.1.194)
  if (ctx.batFlight === false) comfortGoal = Math.min(comfortGoal, balance.bat.flightComfortCap); // and their flight (0.1.194)
  if (ctx.coolBiome === false) comfortGoal = Math.min(comfortGoal, balance.golem.warmComfortCap); // snow golems in a warm biome (0.1.195)
  if (ctx.skyView === false) comfortGoal = Math.min(comfortGoal, balance.ghast.skyComfortCap); // happy ghasts without the sky (0.1.196)
  if (ctx.sulfur === false) comfortGoal = Math.min(comfortGoal, balance.sulfurCube.floorComfortCap); // sulfur cubes without their ground (0.1.197)
  n.comfort = clamp(toward(n.comfort, comfortGoal, step));
  n.social = clamp(toward(n.social, socialTarget(species.social, ctx.groupSize), step));

  // Sustained critical care makes the animal ill; it never dies of neglect in default mode.
  const critical = NEED_KEYS.some((k) => n[k] < balance.needs.bands.urgent);
  // 0.1.259: slower where Clian has sanitised lately (ctx.germFactor, residents/sanitationRules.js): fewer germs
  animal.criticalSeconds = critical ? (animal.criticalSeconds ?? 0) + seconds * (ctx.germFactor ?? 1) : 0;
  if (animal.criticalSeconds >= balance.needs.illAfterCriticalSeconds) animal.ill = true;
  if (animal.ill && !critical && NEED_KEYS.every((k) => n[k] >= balance.needs.bands.attention)) animal.ill = false;

  for (const k of NEED_KEYS) n[k] = Math.round(n[k] * 100) / 100;
  return { unitsEaten };
}

// Quiet cover: how many covered blocks the exhibit needs, and whether it has them. A species
// without a cover need, or an exhibit not measured for cover yet, always has enough.
export function coverNeeded(species, usableArea) {
  return species.cover ? Math.ceil(usableArea * species.cover.minFraction) : 0;
}

export function hasCover(species, ex) {
  if (!species.cover || ex.coveredCells === undefined) return true;
  return ex.coveredCells >= coverNeeded(species, ex.usableArea);
}

// Mud wallow (elephants): enough blocks of mud in the floor. Like cover, a species without the need,
// or an exhibit not measured for it yet, always has enough.
export function hasMud(species, ex) {
  if (!species.mud || ex.mudCells === undefined) return true;
  return ex.mudCells >= species.mud.minCells;
}

// Basking pads (Basalt Tortoises): enough magma blocks in the floor. Like mud, a species without the
// need, or an exhibit not measured for it yet, always has enough.
export function hasBask(species, ex) {
  if (!species.bask || ex.hotCells === undefined) return true;
  return ex.hotCells >= species.bask.minCells;
}

// Warm Ash bed (Ember Foxes): enough Warm Ash blocks in the floor to dig in. Like mud, a species
// without the need, or an exhibit not measured for it yet, always has enough.
export function hasAsh(species, ex) {
  if (!species.ash || ex.ashCells === undefined) return true;
  return ex.ashCells >= species.ash.minCells;
}

// End ground (Chorus Deer): enough end stone in the floor. Like mud, a species without the need, or
// an exhibit not measured for it yet, always has enough.
export function hasEnd(species, ex) {
  if (!species.endGround || ex.endCells === undefined) return true;
  return ex.endCells >= species.endGround.minCells;
}

// What is holding an exhibit's comfort down right now, as keys for adviceFor: everything that caps
// the comfort target below healthy. Empty means nothing is wrong and comfort is only catching up.
export function comfortCauses(ctx, balance) {
  const out = [];
  if (comfortTarget(ctx.spaceRatio) < balance.needs.bands.healthy) out.push("space");
  for (const k of ["water", "cover", "cold", "mud", "heat", "bask", "ash", "den", "end", "anchor", "tunnel", "tree", "wash", "graze", "harem", "dens", "ledge", "coalition", "privacy", "solitary", "bank", "submerge", "canopy", "nestbox", "shade", "troop", "deep", "perches", "nylium", "rub", "walls", "hide", "males", "wallow", "soul", "bed", "pads", "crevices", "mineral", "rock", "burrows", "flowers", "dim", "endPlants", "warmPads", "retreat", "sand", "seagrass", "lush", "clay", "burrow", "sculk", "shriek", "bloom", "warmth", "hoard", "trunk", "snow", "soulfloor", "beam", "mobfloor", "hay", "run", "groomed", "rockLedges", "desertSand", "desertShade", "lilyPads", "waterPlants", "tankFloor", "deepStretch", "openWater", "beeFlowers", "beeHives", "restSpots", "sandFloor", "chill", "mycelium", "digBed", "batRoosts", "batFlight", "coolBiome", "skyView", "sulfur"]) if (ctx[k] === false) out.push(k);
  return out;
}

// Recovery holding at a Recovery Station: every need climbs back toward healthy, and the animal is
// well again once nothing is low. Without a station, animals in holding just wait unchanged.
export function recoverInHolding(animal, seconds, balance) {
  const step = (balance.recovery.perDay * seconds) / balance.clock.dayLength;
  const goal = balance.needs.startNeeds;
  for (const k of NEED_KEYS) animal.needs[k] = Math.round(toward(animal.needs[k], Math.max(animal.needs[k], goal[k]), step) * 100) / 100;
  animal.criticalSeconds = 0;
  if (NEED_KEYS.every((k) => animal.needs[k] >= balance.needs.bands.healthy)) animal.ill = false;
}

// Exhibit cleanliness drains faster with more residents, and with an unfiltered pool
// (waterDirt is the extra share from equipment/rules.js waterDirtFactor).
export function dirtyExhibit(exhibit, population, seconds, balance, waterDirt = 0) {
  if (population <= 0) return;
  const days = seconds / balance.clock.dayLength;
  const rate = balance.needs.drainPerDay.cleanliness * (1 + balance.care.exhibitDirtPerExtraAnimal * Math.max(0, population - 1)) * (1 + waterDirt);
  exhibit.cleanliness = Math.round(clamp((exhibit.cleanliness ?? 100) - rate * days) * 100) / 100;
}

const NEED_ADVICE = {
  satiety: "Fill the feeder with rations",
  cleanliness: "Clean the exhibit with a Cleaning Rake",
  enrichment: "Play with the animal (empty hand) or add enrichment equipment",
  comfort: "Measure the exhibit again with the Habitat Marker to see what it needs",
  social: "Animals of this species like company",
};

// What each comfort cause asks for (Austin, 0.1.45: name only what applies to this animal).
const COMFORT_FIX = {
  space: () => "more room",
  water: (s) => (s?.lavaSwimmer || s?.lavaWalker ? "a lava pool" : s?.drinksLava ? "lava to drink in a Lava Trough" : "drinking water"),
  cover: () => "trees or a roof over part of the ground",
  cold: () => "a Cooling Unit with ice",
  mud: () => "a mud wallow",
  heat: () => "a fuelled Thermal Regulator",
  bask: (s) => (s?.bask?.rest ? "magma blocks to rest on" : "magma blocks to bask on"),
  ash: (s) => (s?.wallow ? `Warm Ash in the floor to root in (${s.ash.minCells} blocks)` : "a Warm Ash bed to dig in"),
  den: (s) => (s?.den === "burrow" ? "a Burrow Shelter" : "an Ember Den"),
  end: () => "end stone in the floor",
  anchor: () => "a charged Containment Anchor",
  tunnel: (s) => `${s?.tunnels?.min ?? 2} or more Rift Tunnels to blink between`,
  tree: () => "a climbing tree (3 or more logs high) or a Climbing Frame",
  wash: () => "water to wash their food in (a pool, even one block)",
  graze: (s) => `grass to graze (${s?.graze?.perAnimal ?? 30} grass blocks in the floor for each)`,
  harem: () => "one stallion with the mares (keep the other stallions together in a bachelor group)",
  dens: (s) => `a Holding Den for each grown ${s?.displayName?.toLowerCase() ?? "animal"}${s?.dens?.spare ? `, and ${s.dens.spare} spare` : ""}`,
  ledge: () => "a ledge to rest up high for each (a floor block 1 or 2 higher than the floor beside it)",
  coalition: () => "no more than two grown males (a coalition)",
  privacy: () => "screened floor to get out of sight (rock, earth, leaves or a tree trunk round a floor block at head height)",
  bank: () => "a bigger sunny bank to bask on (4 blocks for each, within 3 of the water, open to the sky, not gravel, rock or logs)",
  submerge: () => "deeper water for all to go under at once (4 spots 2 deep for each grown one)",
  solitary: () => "one grown tiger loose at a time (a Holding Den each: they take turns out)",
  canopy: () => "more canopy to travel and rest on (leaves, logs or a Climbing Frame 2 or more blocks up, reached from a trunk)",
  nestbox: () => "a Nest Box for each grown one (on the floor, or up beside the canopy)",
  shade: () => "shade from the heat over a third of the floor (leaves or a roof): it's a hot biome",
  troop: () => "one silverback with the females (move the other grown males to a bachelor group of their own)",
  deep: () => "no water 2 or more deep: they can't swim (fill it to 1 block deep, or fence the deep part off)",
  perches: () => "Perches at different heights (one 2 or more blocks higher than another)",
  nylium: () => "crimson nylium in the floor (16 blocks or more)",
  rub: () => "a crimson stem to rub against (standing on the floor, back from the walls)",
  walls: () => "more wall to climb (16 wall faces for each: make it taller, or add pillars or blocks inside)",
  hide: () => "a hide each for the day (a crack: a one-block gap in a wall, open on one side only; or a Burrow Shelter)",
  males: () => "one grown male (move the others to an exhibit of their own)",
  wallow: (s) => `Thermal Mud to wallow in (${s?.wallow?.minCells ?? 4} blocks in the floor): without it the heat is too much for them`,
  bed: (s) => `Mineral Substrate to bury themselves in by day (${s?.substrate?.minCells ?? 6} blocks in the floor; 4 gravel, a nether quartz and a bone meal make 4)`,
  pads: () => "Landing Pads to leap between: 3 or more (one for each End Hopper over 3), each with 3 blocks of air over it, within 3 blocks up and 5 across of the floor or another pad, and one 2 or more blocks over the floor (3 purple wool over 3 end stone make 3)",
  rock: () => "rock to scrape: the sides of rock blocks standing at the floor's level, a wall of rock or boulders on the floor (obsidian, end stone, stone, deepslate, blackstone, basalt and the like)",
  burrows: (s) => `Mineral Substrate to dig their burrows in (${s?.burrows?.perCrab ?? 2} blocks in the floor for each, ${s?.burrows?.minCells ?? 4} at least; 4 gravel, a nether quartz and a bone meal make 4)`,
  endPlants: (s) => `chorus to browse: ${s?.endPlants?.perTortoise ?? 2} chorus plants or flowers standing on the floor for each, ${s?.endPlants?.min ?? 3} at least`,
  warmPads: (s) => `Warm Pads in the floor to bask on: one for every ${s?.warmPads?.perPad ?? 2}, ${s?.warmPads?.min ?? 1} at least (3 end stone bricks over a magma block at the Zoo Workshop)`,
  seagrass: (s) => `seagrass to graze: seagrass or kelp growing in ${s?.seagrass?.perAnimal ?? 6} water blocks for each (a calf half)`,
  lush: (s) => `lush ground: ${s?.lushGround?.moss ?? 8} or more moss blocks in the floor (or moss carpet on it), and lush plants beside the floor to browse (azalea bushes, azalea leaves, dripleaf or glow berry vines), ${s?.lushGround?.plantsPer ?? 2} for each, ${s?.lushGround?.minPlants ?? 2} at least`,
  clay: (s) => `a clay lick: ${s?.clayLick?.min ?? 1} or more clay blocks in the floor (or under the edge of a pool)`,
  burrow: (s) => `Burrow Soil to tunnel into: ${s?.burrowSoil?.min ?? 12} or more blocks of it beside the floor, a bank three blocks high and four wide, with 3 blocks of open floor in front`,
  sculk: (s) => `sculk in the floor: ${s?.sculkFloor?.min ?? 8} or more blocks (sculk drops itself only when mined with Silk Touch)`,
  shriek: () => "quiet: no sculk shrieker in or beside the floor (they frighten them; sculk sensors are fine)",
  warmth: () => "a lit campfire or soul campfire on the floor to bask by",
  hoard: () => "a block of gold or raw gold on the floor to guard",
  trunk: () => "a tree trunk to rub their antlers on: a log (any wood) at the floor's edge or standing in it, with three blocks of open floor in front of it",
  snow: (s) => `snow underfoot: snow blocks, snow layers, ice, packed ice or blue ice under ${Math.round((s?.snowFloor?.share ?? 0.5) * 100)}% of the floor or more`,
  soulfloor: (s) => `soul sand or soul soil under ${Math.round((s?.soulFloor?.share ?? 0.5) * 100)}% of the floor or more`,
  mobfloor: (s) => [s?.mobFloor ? `${s.mobFloor.how} under ${Math.round(s.mobFloor.share * 100)}% of the floor or more` : "", s?.mobDecor ? `${s.mobDecor.min} or more ${s.mobDecor.how} in the pen` : ""].filter(Boolean).join(", and ") || "the floor they like", // and what they like in the pen (0.1.164)
  beam: () => "a beam to hang from: a post of solid blocks with 5 solid blocks running out from its top, 5 to 8 blocks over the floor with open air under them",
  hay: (s) => `hay bales under a roof to bed down on: ${s?.hay?.per === 1 ? "1 for each" : `1 for every ${s?.hay?.per ?? 2}`} in the ${s?.run ? "paddock" : "yard"}, ${s?.hay?.min ?? 2} at least`,
  run: (s) => `a straight run of open floor ${s?.run?.length ?? 20} blocks long and 2 wide to gallop along`,
  groomed: () => "grooming: a brush used on each one, or a keeper with this paddock on their round",
  desertSand: () => `sand underfoot: sand or red sand under at least ${Math.round(BALANCE.camel.sandShare * 100)}% of the floor`,
  desertShade: () => `shade to lie in at midday: tree leaves or a roof over ${BALANCE.camel.shadePerCamel} blocks of floor for each`,
  lilyPads: () => `lily pads to sit on: a lily pad or big dripleaf on the water for every ${BALANCE.frog.frogsPerPad} frogs`,
  waterPlants: () => `water plants to hide among: seagrass or kelp growing in ${BALANCE.axolotl.plantsPerAnimal} of the tank's water blocks for each (a young one half)`,
  tankFloor: () => "a floor without gravel under the water (they swallow it): bare, sand, clay or stone",
  deepStretch: () => `room to dive and turn: a stretch of water ${BALANCE.dolphin.stretch} by ${BALANCE.dolphin.stretch} blocks and ${BALANCE.dolphin.diveDepth} deep`,
  openWater: () => `open water to breathe at: at least ${Math.round(BALANCE.dolphin.openShare * 100)}% of the pool with nothing right over it`,
  beeFlowers: () => `flowers to forage: the game's bee flowers in the garden, ${BALANCE.bee.flowersPer} for each bee and ${BALANCE.bee.flowersMin} at least`,
  beeHives: () => `a hive: a Beehive or Bee Nest for each ${BALANCE.bee.perHive}, its front opening into the garden`,
  sandFloor: (s) => `soft ground to dig in: sand or red sand under at least ${Math.round((s?.sandFloor?.share ?? 0.3) * 100)}% of the floor`,
  chill: () => "warmth: a fuelled Thermal Regulator beside the floor (a snowy biome, and they can't keep themselves warm)",
  mycelium: (s) => `mycelium to graze (${s?.mycelium?.perAnimal ?? 12} mycelium blocks in the floor for each)`,
  batRoosts: () => "somewhere to hang: a roof of solid blocks over open air (not glass, leaves or slabs), a block of it for each",
  sulfur: (s) => `their caves' ground: sulfur or cinnabar under ${Math.round((s?.sulfurFloor?.share ?? 0.5) * 100)}% of the floor or more`,
  skyView: (s) => `the open sky: glass over ${Math.round((s?.skyRoof?.minFraction ?? 0.5) * 100)}% of their pen's roof or more`,
  coolBiome: () => "somewhere cooler: a yard in a biome no warmer than they can stand (not a desert, badlands, a savanna or the Nether)",
  batFlight: (s) => `room to fly: a straight ${s?.flight?.length ?? 10} blocks of open air`,
  digBed: (s) => `ground to dig in: dirt, grass, moss, podzol or mud under at least ${Math.round((s?.digBed?.share ?? 0.5) * 100)}% of the floor`,
  restSpots: (s) => (s?.restSpots?.kind === "log" ? "logs to rest up on: a log on the floor for each, open on top" : `seats up off the floor: a chest, a bed or a lit furnace for each ${s?.restSpots?.per ?? 2}, open on top`),
  rockLedges: () => `rock ledges to leap onto: the tops of rock blocks with a drop of ${BALANCE.goat.ledgeDrop} or more beside them, ${BALANCE.goat.perGoat} for each (${BALANCE.goat.minLedges} at least), one a lookout ${BALANCE.goat.lookout} or more blocks over the floor`,
  bloom: (s) => `glowing flowers on the floor: ${s?.gladeFlowers?.per ?? 3} Moonblooms, Starpetals or Wisp Ferns for each, ${s?.gladeFlowers?.min ?? 4} at least (from the Mythical Glade)`,
  sand: (s) => `a sand floor to bury themselves in: sand under ${Math.round((s?.sandBed?.minFraction ?? 0.5) * 100)}% of the water at least (${s?.sandBed?.minCells ?? 32} blocks at least)`,
  retreat: (s) => `a retreat: a low roof 2 blocks over the floor, over ${s?.retreat?.perTortoise ?? 2} blocks of it for each, ${s?.retreat?.min ?? 4} at least`,
  flowers: (s) => `chorus flowers to hover at and sip from: one for each, ${s?.chorusFlowers?.min ?? 2} at least, inside the house or on its walls (on end stone or a chorus plant)`,
  dim: (s) => s?.mob ? `the dark: no daylight in the pen and nothing brighter than light ${s.darkLight ?? 7}${s.darkLight ? " on the floor" : ""} (a solid roof and walls, tinted glass to the hall: daylight comes in through the hall's door, even shut, and on through plain glass and iron bars; ${s.darkLight ? "a Nocturnal Lamp hung 3 blocks above the floor" : "Nocturnal Lamps or glow lichen"})` : s?.bigFish ? "a dark tank: no daylight on the water and nothing brighter than the Nocturnal Lamps (roof it over, solid or tinted walls, Nocturnal Lamps, glow lichen or a sea pickle)" : s?.sculkFloor ? "the dark: no daylight on the floor and nothing brighter than light 7 (solid walls and roof, tinted glass to look through; Nocturnal Lamps, glow lichen or a sculk catalyst)" : "low light: no daylight on the floor and nothing brighter than the Nocturnal Lamps (in a bright house they fly only at night)",
  crevices: () => "a crevice for each to rest in: a one-block gap at the foot of a wall, roofed over and walled on three sides, open onto the floor (leave a block out at the foot of a wall two blocks thick, on the inside)",
  mineral: (s) => `Mineral Substrate to graze (${s?.mineralBed?.minCells ?? 4} blocks in the floor; 4 gravel, a nether quartz and a bone meal make 4)`,
  soul: () => "a soul light inside (a soul lantern, soul torch, soul campfire or soul fire): they gather round it at night, and without one they're restless",
};

const listOf = (parts) => (parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`);

/**
 * What to do about a low need. With the species and the exhibit's comfort causes (comfortCauses),
 * the advice names only what applies; with no causes left, comfort is just recovering. `pushed`: this
 * one gets pushed off the food by higher-ranking ones (zebras), with the feeding places each feeder has.
 * @param {string} need
 * @param {any} [species]
 * @param {string[]} [causes]
 * @param {{ feeder: number, rack: number }} [pushed]
 */
export function adviceFor(need, species, causes, pushed = undefined) {
  if (need === "comfort" && causes) {
    if (!causes.length) return "Nothing to fix: everything it needs is in place, and comfort is recovering a little every park day";
    return `Give the animals ${listOf(causes.map((c) => COMFORT_FIX[c]?.(species) ?? c))}`;
  }
  if (need === "satiety" && species && pushed) return `Add feeding places: ${(species.plural ?? `${species.displayName}s`).toLowerCase()} feed in rank order, and this one gets pushed off the food by higher-ranking ones (a Basic Feeder has room for ${pushed.feeder}, a Hay Rack for ${pushed.rack})`;
  if (need === "satiety" && species) return `Fill the ${species.lavaSwimmer ? "Thermal Feeder" : species.rack ? "feeder or Hay Rack" : "feeder"} with ${rationPlural(species.baitItem)}`;
  // Manatees (0.1.129): grazing the seagrass in their water keeps them busy.
  // Axolotls (0.1.185): hiding and foraging among the water plants.
  if (need === "enrichment" && species?.waterPlants) return `Plant seagrass or kelp in the water for them to hide and forage among (${BALANCE.axolotl.plantsPerAnimal} water blocks with it for each, a young one half), or play with the animal (empty hand)`;
  if (need === "enrichment" && species?.seagrass) return `Plant seagrass or kelp in the water for them to graze (${species.seagrass.perAnimal} water blocks with it for each, a calf half), or play with the animal (empty hand)`;
  if (need === "social" && species) {
    const plural = species.plural ?? `${species.displayName}s`;
    const s = species.social;
    // Herd mates of other kinds count (0.1.193: llamas and trader llamas each other, a mule the horses and donkeys).
    const mates = species.herdWith ? ` (${species.herdWith.map((id) => `${id.split(":")[1].replace(/^zoo_/, "").replace(/_/g, " ")}s`).join(" and ")} sharing the exhibit count as their herd)` : "";
    return s.prefersCompany ? `${plural} like company: keep ${Math.max(2, s.minGroup)} or more together, up to ${s.recommendedMax}${mates}` : `${plural} are happy alone: keep no more than ${s.recommendedMax} together`;
  }
  return NEED_ADVICE[need];
}
