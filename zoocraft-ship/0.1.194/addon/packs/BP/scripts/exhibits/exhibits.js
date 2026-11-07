import { system } from "@minecraft/server";
import { timedJob } from "../core/perf.js";
import { longestRun, floorColumns } from "../animals/paddockRules.js";
import { ledgeReport, wallsIssue } from "../animals/goatRules.js";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { emit, on } from "../core/events.js";
import { info, log } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, pluralOf, livesOnLava } from "../data/species.js";
import { HABITAT_PROFILES, EXHIBIT_LIMITS, AERIAL_HEIGHT, ROOST_HEIGHT, requiredArea } from "../data/profiles.js";
import { perchSpread } from "../animals/owlRules.js";
import { floodTerrestrial, floodAerial, floodClimb, floodApe, floodBoar, newResult, newClimbResult, newBoarResult, isReachable, key } from "./geometry.js";
import { climbIssue } from "../animals/climbRules.js";
import { measureHouse } from "./light.js";
import { habitatArea, habitatProblem } from "./room.js";
import { blockReader, dim, message, biomeAt } from "../platform/mc.js";
import { isHotBiome } from "../animals/pandaRules.js";
import { apeIssue } from "../animals/gorillaRules.js";
import { allFeeders, linkFeeder } from "../equipment/feeder.js";
import { fishWeight } from "../animals/schoolRules.js";
import { allFixtures, saveFixture, refreshLook } from "../equipment/fixtures.js";
import { serves, isWarm, isAnchored } from "../equipment/rules.js";
import { parkTime, getPark, insidePark, parkEdge, parkAt, inScope, parkOfRecord, insideParkColumn, withPark, onlyPark } from "../park/park.js";
import { mixProblem, widestProfile, spaceFactor } from "./mixing.js";
import { measureService, airlockHolds } from "../animals/predators.js";
import { denServes } from "../animals/predatorRules.js";
import { ledgesOf } from "../animals/lionRules.js";
import { measureCroc, gateToWater } from "../animals/crocRules.js";
import { newWallsResult, measureWalls, roofIssue } from "../animals/geckoRules.js";
import { boarIssue } from "../animals/boarRules.js";
import { newMothResult, measureMoth, isSoulLight } from "../animals/mothRules.js";
import { padReport, hopIssue } from "../animals/hopperRules.js";
import { measureCrevices, newCreviceResult } from "../animals/snailRules.js";
import { measureRock, newRockResult } from "../animals/crabRules.js";
import { measureChorus, newChorusResult } from "../animals/chorusMothRules.js";
import { measureTortoise, newTortoiseResult } from "../animals/starbackRules.js";
import { measureOkapi, newOkapiResult } from "../animals/okapiRules.js";
import { measureMolebear, newMolebearResult } from "../animals/molebearRules.js";
import { measureBamboo, newBambooResult } from "../animals/bambooRules.js";
import { measureSkulker, newSkulkerResult } from "../animals/skulkerRules.js";
import { measureUnicorn, newUnicornResult } from "../animals/unicornRules.js";
import { measureStag, newStagResult } from "../animals/glowhornRules.js";
import { measureSnow, newSnowResult } from "../animals/bossRules.js";
import { measureSloth, newSlothResult } from "../animals/slothRules.js";
import { measureDragon, newDragonResult, CAMPFIRES } from "../animals/dragonRules.js";
import { measureGriffin, newGriffinResult } from "../animals/griffinRules.js";
import { countEndFloor, ZOO_DRAKE } from "../animals/babyDragonRules.js";
import { housesNear, penReport, mobPenProblem, newMobFloorResult, measureMobFloor, newMobDecorResult, measureMobDecor } from "../animals/mobRules.js";
import { PAD_BLOCKS, spawnSpotsOf, frogWallsIssue } from "../animals/frogRules.js";
import { gravelFloors } from "../animals/axolotlRules.js";
import { poolColumns, poolSummary } from "../animals/dolphinRules.js";
import { measureBees, newBeeResult, hiveBeside, isHive, hasBeeFlowers } from "../animals/beeRules.js";
import { measureParrots, newParrotResult } from "../animals/parrotRules.js";
import { measureBats, newBatResult } from "../animals/batRules.js";
import { measureAllays, newAllayResult } from "../animals/allayRules.js";
import { measureRest, newRestResult } from "../animals/catRules.js";
import { isColdBiome } from "../animals/armadilloRules.js";

// Exhibits (spec section 6): an Exhibit Controller gives an exhibit its identity; the Habitat
// Marker sets the interior point; the validator measures usable reachable space and finds gaps.
// States: draft -> ready -> occupied, and unsafe when an occupied exhibit is open.
// Flyers (Void Rays, 0.1.51) are measured by a flood through the air instead (geometry.js
// floodAerial): an empty exhibit gets that flight measurement too (ex.aerial) once a Void Perch floats
// inside it, so a Void Ray can be released there; once one lives there the flight measurement is the
// exhibit's own. Only this module writes the "exhibits" collection.
// Mixed species (0.1.61, exhibits/mixing.js): ex.speciesId is the first species to move in (the
// lead: breeding and the feeder advice follow it) and ex.speciesIds every species living there, lead
// first. The exhibit is measured for all of them (cover, mud, basking pads, ash, end stone: whatever
// any resident wants) with the profile asking the most ground, and a shared exhibit needs
// balance.mixing.spaceFactor times the room.
// Climbers (raccoons, 0.1.71): an exhibit they live in is measured for climbing too (geometry.js
// floodClimb), and so is an empty one, so a release can say whether a climber would stay inside.
// An exhibit a resident could climb out of is not enclosed (unsafe), and the measure counts the
// climbing trees on the floor (ex.climb).
// Nesting birds (flamingos, 0.1.72): the measure counts their nest sites, mud in the floor right
// beside the water (ex.nestSites; ex.nestSpots, where the first 64 are).
// Grazers (zebras, 0.1.74): the measure counts the grass blocks in their floor (ex.grassCells). A Hay
// Rack is reached from the floor a block below it (hung on the fence) or level with it (on the ground).
// Big predators (lions, 0.1.75): a Holding Den serves the exhibit its door faces into; the exhibit's
// double Keeper Gate (ex.service: two gates in a row, one in the fence) is found with both gates shut,
// and while one of them is open and the other shut the exhibit is still closed (that's the airlock);
// lions' ledges are counted (ex.ledgeCells: floor blocks 1 or 2 higher than the floor beside them).
// Tigers (0.1.76, species.privacy): the screened floor is counted (ex.screenCells, and where the first of
// them are, ex.screenSpots: floor blocks with rock, earth, leaves or a tree trunk round them at head
// height, exhibits/geometry.js).
// Crocodiles (0.1.77, species.basks): the croc measure (animals/crocRules.js measureCroc) counts the sunny
// basking bank (ex.sunBankCells; ex.sunBankSpots, nearest the water first), the shore ring right beside the water
// and what clutters it (ex.shoreCells, ex.shoreBlocked, ex.shoreSpots), shade near the water (ex.shadeSpots) and
// sand to nest in (ex.sandSites, ex.sandSpots); and the inner Keeper Gate's distance from the water
// (ex.gateToWater).
// Red pandas (0.1.79, species.canopy): the climb measure goes on past a way out to count the canopy (ex.climb.canopy:
// blocks up in the trees reached by climbing) and the Nest Boxes beside it, which serve the exhibit as one on
// the floor does; the biome at the floor says whether it's hot (ex.hotBiome), and then the shade over the
// floor is counted (ex.coveredCells, species.heatShade).
// Gorillas (0.1.80, species.ape): the ape measure (geometry.js floodApe: what a gorilla grips, fences among them,
// and how far it reaches up) for apes living here and for an empty exhibit (ex.apeClimb: strong walls or not, the
// way out, the climbing trees). An exhibit a gorilla could get out of is unsafe, and one won't move in.
// Warped Geckos (0.1.85, species.clings): the wall measure (a flood through the air, which mustn't lead out: they
// climb glass and walls, so the exhibit needs a roof; then animals/geckoRules.js measureWalls counts the wall faces
// to cling to and the cracks to hide in) for geckos living here, and for an empty exhibit with an Insect Feeder in it
// (ex.walls). An exhibit whose air leads out with geckos in it is unsafe, and one won't move in.
// Cinder Boars (0.1.87, species.boarProof): the boar measure (geometry.js floodBoar: the walking flood through the
// wooden fences, gates and doors a boar breaks) for boars living here and for an empty exhibit (ex.boarWalls: strong
// walls or not, the way out, the wooden blocks beside the floor). An exhibit a boar could break out of is unsafe, and
// one won't move in. Their Thermal Mud is counted (ex.thermalMudCells).
// Quartz Beetles (0.1.89, species.substrate): the Mineral Substrate in the floor is counted (ex.substrateCells); their
// cave roof is their cover.
// End Hoppers (0.1.91, species.hops, species.pads): the jump measure (a flood through the air, which mustn't lead out:
// they leap 3 blocks high, so the exhibit needs a roof; then animals/hopperRules.js padReport counts the Landing Pads
// that count: air over them, within a leap of the floor or of each other, and the high ones) for hoppers living here,
// and for an empty exhibit with a Landing Pad inside (ex.hops). An exhibit whose air leads out with hoppers in it is
// unsafe, and one won't move in. The jump measure links the pads inside to the exhibit.
// Shimmer Snails (0.1.92, species.crevices, species.mineralBed): the crevice measure (animals/snailRules.js
// measureCrevices: the one-block holes at the foot of the walls that open onto the floor, and where the first are:
// ex.crevices) for snails living here; their Mineral Substrate is counted (ex.substrateCells), as the beetles' is.
// Obsidian Crabs (0.1.93, species.rockFaces, species.burrows): the rock measure (animals/crabRules.js measureRock: the
// sides of rock blocks facing onto the floor at its level, and where the first are: ex.rock) for crabs living here;
// their Mineral Substrate is counted (ex.substrateCells) for their burrows.
// Soul Moths (0.1.88, species.soulLight): the flight measure (a moth house, roofed over), then the moth measure
// (animals/mothRules.js measureMoth: the soul lights in its air or on its walls, and which way each sits; the host
// plants in the floor and where the first are: ex.soul) for moths living here, and for an empty exhibit with a Nectar
// Feeder in it, which is measured for flight with a moth's headroom so they can move in. The moth house's light is
// read on its floor with soul light counting as dark (species.houseLight).
// Chorus Moths (0.1.94, species.chorusFlowers): the chorus measure (animals/chorusMothRules.js measureChorus: the chorus
// flowers in the air or on its walls, the chorus standing on the floor for the caterpillars: ex.chorus) for moths
// living here, and for an empty exhibit with a Nectar Feeder in it; the house's light is read for their low light
// (species.lowLight).
// Starback Tortoises (0.1.95, species.endPlants, species.warmPads, species.retreat): the tortoise measure
// (animals/starbackRules.js measureTortoise: the chorus standing on the floor, the Warm Pads in it, the floor under a low
// roof, and where the first of each are: ex.tortoise) for tortoises living here; their Mineral Substrate is counted
// (ex.substrateCells, species.substrateNest) for the nest.
// Lush Okapis (0.1.137, species.lushGround, clayLick, hiddenCalf): the okapi measure (animals/okapiRules.js measureOkapi:
// the moss in the floor, the lush plants beside it, the clay, the trunks to rub on, and the best-covered spots for a calf
// to lie hidden in: ex.okapi) for okapis living here.
// Earth Molebears (0.1.138, species.burrowSoil): the molebear measure (animals/molebearRules.js measureMolebear: the
// Burrow Soil beside the floor, and the faces of it a tunnel can start into: ex.molebear) for molebears living here.
// Skulkers (0.1.139, species.sculkFloor): the skulker measure (animals/skulkerRules.js measureSkulker: the sculk in the
// floor, and any sculk shrieker in or beside it: ex.skulker) for skulkers living here; the dark is the nocturnal
// house's measure (species.lowLight).
// Unicorns (0.1.149, species.gladeFlowers): the unicorn measure (animals/unicornRules.js measureUnicorn: the glowing
// flowers on the floor, and the floor cells with water beside them to dip a horn in: ex.unicorn) for unicorns living here.
// Glowhorn Stags (0.1.152, species.trunks): the stag measure (animals/glowhornRules.js measureStag: the trunks beside the
// floor, and the floor cells it can rub its antlers on one from: ex.stag) for stags living here.
// Giant Yetis (0.1.159, species.snowFloor): the snow measure (animals/bossRules.js measureSnow: the floor's snow and ice:
// ex.snow) for yetis living here.
// Soul Sloths (0.1.161, species.soulFloor and species.beam): the sloth measure (animals/slothRules.js measureSloth: the
// floor's soul sand and soul soil, and the beams to hang from: ex.sloth) for sloths living here.
// Dragons (0.1.150, species.warmth): the dragon measure (animals/dragonRules.js measureDragon: the lit campfires on the
// floor or beside it: ex.dragon) for dragons living here; and a big empty exhibit with a lit campfire is measured for
// flight with the dragons' hall's headroom, so one can move in.
// Griffins (0.1.151, species.hoard): the griffin measure (animals/griffinRules.js measureGriffin: the blocks of gold or
// raw gold on the floor or in it: ex.griffin), and the dragon measure's lowTops (the gold stands on the floor), for
// griffins living here; a big empty exhibit with gold on the floor is measured for flight as a dragon's is.
// Zombies and skeletons (0.1.163, species.mob): the pen measure (animals/mobRules.js penReport: the air flood, closed all
// round with a roof or where it leads out, the working Mob House whose hall it is beside, and whether its air is the
// hall's: ex.mobPen) for mobs living here, and for an empty exhibit beside a working Mob House's hall, so one can move
// in; and the floor they like (species.mobFloor: the blocks under the floor, by id: ex.mobFloor) for mobs living here.
// Creepers and spiders (0.1.164): what they like in the pen (species.mobDecor: leaves or ferns, cobwebs; the blocks in the
// pen's air and round it, by id: ex.mobFloor.decor).

const EX = "exhibits";
const DEFAULT_PROFILE = "small_terrestrial";
const jobs = new Map(); // exhibit id -> generation number of the newest validation
const cellCache = new Map(); // exhibit id -> Map of reachable cells from the last validation
const shadeCache = new Map(); // exhibit id -> Set of its shaded floor cells' keys from the last validation (camels, 0.1.181)
const pending = new Set(); // exhibits waiting for a revalidation after nearby edits
const running = new Map(); // exhibit id -> { gen, at }: the measurement under way (0.1.150)
const busy = (id) => {
  const r = running.get(id);
  return Boolean(r) && system.currentTick - r.at < 1200; // (one that never finished doesn't block for good)
};

export function getExhibit(id) {
  return db.get(EX, id);
}

// 0.1.111: only the scope's park's exhibits while a loop runs for one park (park/park.js inScope); every exhibit otherwise.
export function allExhibits() {
  return db.all(EX).filter(inScope);
}

// Every species living in the exhibit, the lead first (empty for an empty exhibit).
export function speciesIn(ex) {
  const ids = ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : []);
  return ids.map((id) => SPECIES[id]).filter(Boolean);
}

// The lead species (the first to move in), or undefined.
export function leadSpecies(ex) {
  return ex.speciesId ? SPECIES[ex.speciesId] : undefined;
}

// Does any resident species want this (cover, mud, bask, ash, endGround, heat, ...)?
function anyWants(ex, flag) {
  return speciesIn(ex).some((sp) => Boolean(sp[flag]));
}

// The profile the exhibit is measured with: the resident asking the most ground (a shared
// exhibit is sized for its biggest species), or small_terrestrial while it's empty.
export function profileOf(ex, extraSpecies = undefined) {
  const list = speciesIn(ex);
  if (extraSpecies) list.push(extraSpecies);
  return widestProfile(list, HABITAT_PROFILES) ?? HABITAT_PROFILES[DEFAULT_PROFILE];
}

// Young (spec section 9) take part of an adult's space; a school of fish (0.1.119) counts its fish.
function spaceWeight(ex) {
  return fishWeight(ex.animalIds.map((id) => db.get("animals", id)).filter(Boolean), SPECIES, BALANCE.breeding.juvenileWeight);
}

// Breeding is on, or young live here: measure the shelter (leaves or a roof) for them.
function wantsShelter(ex) {
  return Boolean(ex.breeding?.on) || ex.animalIds.some((id) => db.get("animals", id)?.juvenile);
}

// Room for `extra` more animals, measured with the species' profile (or the exhibit's own).
export function capacity(ex, extra = 0, species = undefined) {
  const profile = profileOf(ex, species);
  const population = ex.animalIds.length + extra;
  const kinds = new Set(speciesIn(ex).map((sp) => sp.id));
  if (species) kinds.add(species.id);
  const required = Math.ceil(requiredArea(profile, Math.max(1, spaceWeight(ex) + extra)) * spaceFactor(kinds.size, BALANCE));
  const usable = habitatArea(ex, profile);
  return { population, required, usable, fits: usable >= required, mixed: kinds.size > 1 };
}

// Can this exhibit take one more of `species` (`extra` more: a school of that many fish, 0.1.119)? Used before a catch
// and before a release.
export function fitFor(ex, species, extra = 1) {
  return { cap: capacity(ex, extra, species), problem: mixProblem(speciesIn(ex).map((sp) => sp.id), species, SPECIES) ?? habitatProblem(ex, HABITAT_PROFILES[species.habitatProfile], species.displayName, species) ?? heatProblem(ex, species) ?? anchorProblem(ex, species) ?? climbProblem(ex, species) ?? mobProblem(ex, species) };
}

// Zombies and skeletons (0.1.163) move only into a mob pen: beside a working Mob House's hall, shut in all round with a
// roof, walled off from the hall.
function mobProblem(ex, species) {
  if (!species.mob) return undefined;
  return mobPenProblem(ex.mobPen, pluralOf(species), mobHouseWorks(ex.mobPen?.houseId));
}

// Does the Mob House with this id still have its hall (visitors/mobHouse.js houseWorks; read here from its record, as
// that module reads this one)?
function mobHouseWorks(id) {
  return Boolean(id) && db.get("equipment", id)?.room === "ok";
}

// A climber (raccoons) moves in only where it can't climb out; a gorilla only behind strong walls; a gecko only
// under a roof (its exhibit measured for its walls: an Insect Feeder inside says what it's for); a boar only where no
// wood leads out; a hopper only under a roof (its exhibit measured for its pads: a Landing Pad inside says what it's
// for).
function climbProblem(ex, species) {
  // Frogs (0.1.184) only where their leaps don't lead out.
  if (species.lilyPads) {
    if (!ex.frog) return `${pluralOf(species)} leap ${BALANCE.frog.leapUp} blocks up, so the exhibit has to be measured for strong walls: use the Habitat Marker on the ground inside again.`;
    return ex.frog.enclosed === false ? frogWallsIssue(pluralOf(species), ex.frog.escape, BALANCE.frog) : undefined;
  }
  // Goats (0.1.180) only where their own walk (leaping 3 up) doesn't lead out.
  if (species.rockLedges) {
    if (!ex.goat) return `${pluralOf(species)} leap ${BALANCE.goat.leapUp} blocks up, so the exhibit has to be measured for strong walls: use the Habitat Marker on the ground inside again.`;
    return ex.goat.enclosed ? undefined : wallsIssue(pluralOf(species), ex.goat.escape, BALANCE.goat);
  }
  if (species.hops) {
    if (!ex.hops) return `${pluralOf(species)} leap 3 blocks high, so the exhibit has to be measured for its roof and its Landing Pads: put a Landing Pad inside, then use the Habitat Marker on the ground inside again.`;
    return ex.hops.enclosed ? undefined : hopIssue(pluralOf(species), ex.hops);
  }
  if (species.clings) {
    if (!ex.walls) return `${pluralOf(species)} climb glass and walls, so the exhibit has to be measured for its walls and roof: put an Insect Feeder inside, then use the Habitat Marker on the ground inside again.`;
    return ex.walls.enclosed ? undefined : roofIssue(pluralOf(species), ex.walls);
  }
  if (species.ape) {
    if (!ex.apeClimb) return `${pluralOf(species)} climb and reach up high, so the exhibit has to be measured for strong walls: use the Habitat Marker on the ground inside again.`;
    return ex.apeClimb.proof ? undefined : apeIssue(pluralOf(species), ex.apeClimb, BALANCE.gorilla);
  }
  if (species.boarProof) {
    if (!ex.boarWalls) return `${pluralOf(species)} break through wooden fences, gates and doors, so the exhibit has to be measured for strong walls: use the Habitat Marker on the ground inside again.`;
    return ex.boarWalls.proof ? undefined : boarIssue(pluralOf(species), ex.boarWalls);
  }
  if (!species.climbs) return undefined;
  if (!ex.climb) return `${pluralOf(species)} climb, so the exhibit has to be measured for climbing: use the Habitat Marker on the ground inside again.`;
  return ex.climb.proof ? undefined : climbIssue(pluralOf(species), ex.climb);
}

// A Nether animal (spec section 10) moves in only once the exhibit has a fuelled Thermal Regulator.
function heatProblem(ex, species) {
  if (!species.heat) return undefined;
  const heaters = (ex.fixtureIds ?? []).map((id) => db.get("equipment", id)).filter((f) => f?.type === "heater");
  if (!heaters.length) return `${pluralOf(species)} need heat: put a Thermal Regulator beside the floor, fuel it with charcoal or coal, then measure the exhibit again with the Habitat Marker.`;
  if (!isWarm(species, heaters)) return "The Thermal Regulator is out of fuel: add charcoal, coal, coal blocks or blaze rods.";
  return undefined;
}

// A rift animal (Rift Ferrets, spec section 10) moves in only once the exhibit has a charged
// Containment Anchor to keep its blinks inside.
function anchorProblem(ex, species) {
  if (!species.anchor) return undefined;
  const anchors = (ex.fixtureIds ?? []).map((id) => db.get("equipment", id)).filter((f) => f?.type === "anchor");
  if (!anchors.length) return `${pluralOf(species)} need a Containment Anchor: put one beside the floor, charge it with ender pearls, then measure the exhibit again with the Habitat Marker.`;
  if (!isAnchored(species, anchors)) return "The Containment Anchor is out of charge: add ender pearls, eyes of ender or popped chorus fruit.";
  return undefined;
}

// --- controller lifecycle ---

export function controllerPlaced(block) {
  const dimension = block.dimension.id;
  const pos = { x: block.x, y: block.y, z: block.z };
  // A controller placed near an exhibit that lost its controller reconnects to it (AC-14).
  const orphan = allExhibits().find(
    (ex) => ex.controllerMissing && ex.dimension === dimension && Math.abs(ex.controller.x - pos.x) <= 6 && Math.abs(ex.controller.z - pos.z) <= 6 && Math.abs(ex.controller.y - pos.y) <= 4,
  );
  if (orphan) {
    orphan.controller = pos;
    orphan.controllerMissing = false;
    orphan.issues = orphan.issues.filter((i) => !i.startsWith("Controller"));
    db.put(EX, orphan);
    db.flush(EX);
    return { exhibit: orphan, reconnected: true };
  }
  const n = allExhibits().length + 1;
  const ex = {
    id: newId("ex"),
    name: `Exhibit ${n}`,
    parkId: parkAt(dimension, pos)?.id ?? getPark()?.id, // 0.1.109: the park the controller stands in (0.1.114: else the scope's, the placing player's)
    dimension,
    controller: pos,
    controllerMissing: false,
    state: "draft",
    seed: undefined,
    bbox: undefined,
    penBox: undefined, // the box of the last walking measure that stayed in (0.1.87)
    usableArea: 0,
    landCells: 0,
    waterCells: 0,
    speciesId: undefined,
    animalIds: [],
    feederIds: [],
    cleanliness: 100,
    lastCleaned: -1e9,
    issues: ["Not measured yet: use the Habitat Marker on the ground inside the exhibit."],
    careWarnings: [],
    validations: 0,
  };
  db.put(EX, ex);
  db.flush(EX);
  return { exhibit: ex, reconnected: false };
}

export function controllerAt(dimensionId, pos) {
  return allExhibits().find((ex) => ex.dimension === dimensionId && ex.controller.x === pos.x && ex.controller.y === pos.y && ex.controller.z === pos.z);
}

export function controllerBroken(dimensionId, pos) {
  const ex = controllerAt(dimensionId, pos);
  if (!ex) return undefined;
  if (ex.animalIds.length === 0 && ex.state === "draft") {
    // Nothing lives here and it was never set up: just forget it.
    db.remove(EX, ex.id);
    return undefined;
  }
  ex.controllerMissing = true;
  if (!ex.issues.some((i) => i.startsWith("Controller"))) ex.issues.unshift("Controller missing: place a new Exhibit Controller nearby to reconnect.");
  db.put(EX, ex);
  db.flush(EX);
  return ex;
}

export function rename(ex, name) {
  ex.name = String(name).slice(0, 32) || ex.name;
  db.put(EX, ex);
}

export function removeExhibit(ex) {
  if (ex.animalIds.length) return false; // residents must move out first (spec section 20)
  for (const f of allFeeders()) if (f.exhibitId === ex.id) linkFeeder(f, undefined);
  for (const f of allFixtures()) if (f.exhibitId === ex.id) linkFixture(f, undefined);
  db.remove(EX, ex.id);
  cellCache.delete(ex.id);
  shadeCache.delete(ex.id);
  db.flush(EX);
  return true;
}

// --- validation ---

/**
 * Measure the exhibit from its seed point. Resolves to the result, or undefined if a newer
 * validation of the same exhibit replaced this one.
 */
export function validate(exId, seed) {
  const ex = getExhibit(exId);
  if (!ex) return Promise.resolve(undefined);
  const start = seed ?? ex.seed;
  if (!start) return Promise.resolve(undefined);
  const gen = (jobs.get(exId) ?? 0) + 1;
  jobs.set(exId, gen);
  running.set(exId, { gen, at: system.currentTick });
  pending.delete(exId);
  const profile = profileOf(ex);
  let out = newResult(start);
  let air; // the flight measurement: the exhibit's own for a flying species, a second look for an empty exhibit with a Void Perch in it
  let climb; // the climb measure: for climbers living here, or an empty exhibit one might move into
  let croc; // the croc measure: the basking bank, the shore, shade and sand (crocodiles living here)
  let ape; // the ape measure: for gorillas living here, or an empty exhibit one might move into
  let walls; // the wall measure: for geckos living here, or an empty exhibit with an Insect Feeder in it
  let boar; // the boar measure: for boars living here, or an empty exhibit one might move into
  let soul; // the moth measure: for moths living here, or an empty exhibit with a Nectar Feeder in it
  let hops; // the jump measure: for hoppers living here, or an empty exhibit with a Landing Pad in it
  let crevices; // the crevice measure: for snails living here
  let rock; // the rock measure: for crabs living here
  let chorus; // the chorus measure: for Chorus Moths living here, or an empty exhibit with a Nectar Feeder in it
  let tortoise; // the tortoise measure: for Starback Tortoises living here
  let okapi; // the okapi measure: for Lush Okapis living here
  let molebear; // the molebear measure: for Earth Molebears living here
  let skulker; // the skulker measure: for Skulkers living here
  let unicorn; // the unicorn measure: for Unicorns living here
  let stag; // the stag measure: for Glowhorn Stags living here
  let snow; // the snow measure: for Giant Yetis living here
  let sloth; // the sloth measure: for Soul Sloths living here
  let mobPen; // the pen measure: for mobs living here, or an empty exhibit beside a working Mob House's hall
  let mobFloor; // the mob floor measure: for mobs living here
  let bamboo; // the bamboo measure: for pandas living here (0.1.170)
  let mobDecor; // what mobs living here like in the pen (0.1.164): measured with the pen's air
  let dragon; // the dragon measure: for Dragons living here, or a big empty exhibit with a lit campfire in it
  let griffin; // the griffin measure: for Griffins living here, or a big empty exhibit with gold on its floor
  let goat; // the goats' walk and their rock ledges (0.1.180): for goats living here, or an empty exhibit one might move into
  let pond; // the frog pond's lily pads and open water to lay on (0.1.184): for frogs living here
  let tank; // the axolotl tank's floor (0.1.185): for axolotls living here
  let pool; // the dolphin pool's depth, width and open water (0.1.186): for dolphins living here
  let bees; // the bee garden's flowers and hives (0.1.187): for bees living here, or an empty exhibit with a hive in it
  let parrots; // the parrot aviary's jukeboxes (0.1.188): for parrots living here
  let cats; // the logs and seats to rest on (0.1.189): for ocelots and cats living here
  const species = leadSpecies(ex);
  // Axolotls (0.1.185) want the manatees' seagrass count, for their water plants (animals/axolotlRules.js).
  const wants = (flag) => anyWants(ex, flag) || (flag === "seagrass" && anyWants(ex, "waterPlants"));
  const memo = new Map(); // what each block is, shared by this measurement's readers (platform/mc.js blockReader)
  const read = blockReader(dim(ex.dimension), { leaves: true, mud: wants("mud") || wants("nest"), hot: wants("bask"), ash: wants("ash"), end: wants("endGround"), perch: true, grass: wants("graze"), nylium: wants("nylium"), stem: wants("rubStem"), thermalMud: wants("wallow"), substrate: wants("substrate") || wants("mineralBed") || wants("burrows") || wants("substrateNest"), sandBed: wants("sandBed") || wants("desert") || wants("sandFloor"), seagrass: wants("seagrass"), hay: wants("hay"), mycelium: wants("mycelium"), dig: wants("digBed") }, memo);
  const opts = { ...EXHIBIT_LIMITS, minHeight: profile.minHeight, coverHeight: wants("cover") || wants("heatShade") || wantsShelter(ex) || wants("hay") || wants("desert") ? BALANCE.cover.height : 0, countMud: wants("mud"), countShore: wants("nest"), countHot: wants("bask"), countAsh: wants("ash"), countEnd: wants("endGround"), countGrass: wants("graze"), countNylium: wants("nylium"), countStem: wants("rubStem"), countThermalMud: wants("wallow"), countSubstrate: wants("substrate") || wants("mineralBed") || wants("burrows") || wants("substrateNest"), countSand: wants("sandBed"), countSandFloor: wants("desert") || wants("sandFloor"), countSeagrass: wants("seagrass"), countHay: wants("hay"), countMycelium: wants("mycelium"), countDig: wants("digBed"), swimLava: !species || speciesIn(ex).some(livesOnLava), screenRead: wants("privacy") ? blockReader(dim(ex.dimension), { leaves: true, climb: true }, memo) : undefined };
  // The air is cheap to read, so the flight flood takes bigger slices.
  const airOpts = { ...opts, cellsPerYield: opts.cellsPerYield * 2 };
  return new Promise((resolve) => {
    system.runJob(
      timedJob("validate", (function* () {
        try {
          if (profile.aerial) {
            yield* floodAerial(read, start, airOpts, out);
            air = out;
            // Soul Moths: the moth house's light on its floor, then its soul lights and host plants (Chorus Moths: the chorus).
            if ((wants("nocturnal") || wants("nightLife") || wants("lowLight")) && !out.error) yield* measureHouse(dim(ex.dimension), out, BALANCE, houseLightOf(ex));
            if (wants("soulLight") && !out.error) {
              soul = newMothResult();
              yield* measureMoth(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.moth.plantKeep }, soul);
            }
            if (wants("chorusFlowers") && !out.error) {
              chorus = newChorusResult();
              yield* measureChorus(lightReader(dim(ex.dimension)), out.cells, chorusOpts(airOpts, airOpts.minHeight), chorus);
            }
            // Bees (0.1.187): the game's bee flowers and the hives opening into the garden (animals/beeRules.js).
            if (wants("beeGarden") && !out.error) {
              bees = newBeeResult();
              yield* measureBees(lightReader(dim(ex.dimension)), out.cells, beeOpts(airOpts), bees);
            }
            // Parrots (0.1.188): the jukeboxes beside the aviary's air (animals/parrotRules.js).
            if (wants("dances") && !out.error) {
              parrots = newParrotResult();
              yield* measureParrots(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, jukeboxKeep: BALANCE.parrot.jukeboxKeep }, parrots);
            }
            // Bats (0.1.194): the roof's blocks they can hang from, and the longest straight flight (animals/batRules.js).
            if (wants("batRoost") && !out.error) {
              out.batResult = newBatResult();
              yield* measureBats(blockReader(dim(ex.dimension), { climb: true, leaves: true, gecko: true }, memo), out.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.bat.roostKeep }, out.batResult);
            }
            // Allays (0.1.194): the note blocks beside the room's air (animals/allayRules.js).
            if (wants("noteBlock") && !out.error) {
              out.allayResult = newAllayResult();
              yield* measureAllays(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.allay.noteKeep }, out.allayResult);
            }
            // Dragons: the lit campfires on the floor or beside it.
            if (wants("warmth") && !out.error) {
              dragon = newDragonResult();
              yield* measureDragon(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, minHeight: airOpts.minHeight }, dragon);
            }
            // Griffins: the gold on the floor or in it; and the tops of what stands on the floor, the gold among it (the
            // dragon measure's lowTops).
            if (wants("hoard") && !out.error) {
              griffin = newGriffinResult();
              yield* measureGriffin(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield }, griffin);
              if (!dragon) {
                dragon = newDragonResult();
                yield* measureDragon(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, minHeight: airOpts.minHeight }, dragon);
              }
            }
          } else {
            yield* floodTerrestrial(read, start, opts, out);
            // The nocturnal house (hedgehogs): read the light on the floor once the walk is measured. A trench tank
            // (0.1.126, species.lowLight on an aquatic profile): the light on the water and the bank.
            if ((wants("nocturnal") || wants("nightLife") || wants("lowLight")) && !out.error) yield* measureHouse(dim(ex.dimension), out, BALANCE, houseLightOf(ex), profile.aquatic ? ["land", "water"] : ["land"]);
            // An empty exhibit counts a lava pool as space (it may be for Lava Rays), unless the lava
            // leads out of the pen: then it's a moat, and the exhibit is measured as walkers see it.
            if (!species && out.lavaCells > 0 && !out.enclosed) {
              out = newResult(start);
              yield* floodTerrestrial(read, start, { ...opts, swimLava: false }, out);
            }
            // Climbers (raccoons): can one climb out, and how many climbing trees are there? An empty
            // exhibit is measured too, so a raccoon's release can say.
            if (!out.error && (!species || anyWants(ex, "climbs"))) {
              climb = newClimbResult();
              // Red pandas: the whole canopy is counted (past a way out too), and the Nest Boxes beside it.
              const canopy = anyWants(ex, "canopy");
              const nests = canopy ? allFixtures("nest").filter((f) => f.dimension === ex.dimension).map((f) => ({ id: f.id, pos: f.pos })) : [];
              yield* floodClimb(blockReader(dim(ex.dimension), { leaves: true, climb: true }, memo), out.cells, { rise: BALANCE.climb.rise, cellsPerYield: opts.cellsPerYield, full: canopy, nests }, climb);
            }
            // Gorillas: strong walls, and the climbing trees. An empty exhibit too, so a gorilla's release can say.
            if (!out.error && (!species || anyWants(ex, "ape"))) {
              ape = newClimbResult();
              yield* floodApe(blockReader(dim(ex.dimension), { leaves: true, climb: true, ape: true }, memo), out.cells, { rise: BALANCE.climb.rise, reach: BALANCE.gorilla.reach, cellsPerYield: opts.cellsPerYield }, ape);
            }
            // Cinder Boars: does wood (fences, gates, doors) lead out? They break through it. An empty exhibit too, so a
            // boar's release can say.
            if (!out.error && (!species || anyWants(ex, "boarProof"))) {
              boar = newBoarResult();
              yield* floodBoar(blockReader(dim(ex.dimension), { boar: true }, memo), out.cells, { maxDrop: opts.maxDrop, rise: BALANCE.climb.rise, cellsPerYield: opts.cellsPerYield }, boar);
            }
            // Crocodiles: the sunny bank, the shore and what clutters it, shade near the water, sand to nest in. Sea turtles
            // (0.1.183): the same sand to nest in.
            if (!out.error && (anyWants(ex, "basks") || anyWants(ex, "sandNest"))) {
              croc = {};
              const T = BALANCE.croc;
              yield* measureCroc(blockReader(dim(ex.dimension), { croc: true }, memo), out.cells, { bankReach: T.bankReach, sky: T.sky, nestNear: T.nestNear, nestFar: T.nestFar, cellsPerYield: opts.cellsPerYield }, croc);
            }
            // Warped Geckos: does the air lead out (they'd climb out over the top), and how much wall is there to
            // cling to, with how many cracks? An empty exhibit with an Insect Feeder in it too, so a gecko can move in.
            if (!out.error && (anyWants(ex, "clings") || (!species && insectFeederInside(ex, out)))) {
              const room = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.terrarium.minHeight, countEnd: false }, room);
              if (!room.error) {
                walls = { ...newWallsResult(), enclosed: room.enclosed, escape: room.escape, box: room.bbox };
                yield* measureWalls(blockReader(dim(ex.dimension), { leaves: true, gecko: true }, memo), room.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.gecko.crackKeep }, walls);
              }
            }
            // End Hoppers: does the air lead out (they'd leap out over the fence), and which Landing Pads count? An empty
            // exhibit with a Landing Pad in it too, so a hopper can move in.
            if (!out.error && (anyWants(ex, "hops") || (!species && padInside(ex, out)))) {
              const room = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.hopper.minHeight, countEnd: false }, room);
              if (!room.error) {
                // The pads with open air of the exhibit right over them, and the floor the walking measure found.
                const pads = allFixtures("pad").filter((f) => f.dimension === ex.dimension && room.cells.has(key(f.pos.x, f.pos.y + 1, f.pos.z))).map((f) => ({ id: f.id, pos: f.pos }));
                const floor = [];
                for (const [k, kind] of out.cells) {
                  if (kind !== "land") continue;
                  const [x, y, z] = k.split(",").map(Number);
                  floor.push({ x, y, z });
                }
                hops = { enclosed: room.enclosed, escape: room.escape, ...padReport(pads, floor, (x, y, z) => room.cells.has(key(x, y, z)), BALANCE.hopper) };
              }
            }
            // Goats (0.1.180): their own walk, leaping up to leapUp blocks onto what is beside them, fences and closed gates
            // too (geometry.js rise and leapFences), and down as far as they leap: does it lead out (walls not high enough
            // for them), and the rock ledges on it (the tops of rock blocks with a drop beside them, goatRules.js
            // ledgeReport). An empty exhibit too, so a goat's release can say.
            if (!out.error && (!species || anyWants(ex, "rockLedges"))) {
              const G = BALANCE.goat;
              const walk = newResult(start);
              yield* floodTerrestrial(read, start, { ...EXHIBIT_LIMITS, minHeight: profile.minHeight, cellsPerYield: opts.cellsPerYield, maxDrop: G.leapDown, rise: G.leapUp, leapFences: true }, walk);
              if (!walk.error) {
                const rockRead = blockReader(dim(ex.dimension), { rock: true }, memo);
                yield;
                goat = { enclosed: !walk.escape, escape: walk.escape, ...ledgeReport(walk.cells, (x, y, z) => rockRead(x, y, z) === "rock", (x, y, z) => read(x, y, z) === "air", G) };
              }
            }
            // Frogs (0.1.184): the lily pads and big dripleaf on the water to sit on (the block right over a top water cell),
            // and the open water to lay frogspawn on (air over a top water cell: animals/frogRules.js spawnSpotsOf, beside a
            // pad first). For frogs living here.
            if (!out.error && anyWants(ex, "lilyPads")) {
              const d = dim(ex.dimension);
              const typeAt = (x, y, z) => {
                try {
                  return d.getBlock({ x, y, z })?.typeId;
                } catch {
                  return undefined; // unloaded: neither a pad nor open
                }
              };
              const tops = [];
              let pads = 0;
              let n = 0;
              const padAt = new Set();
              for (const [k, kind] of out.cells) {
                if (kind !== "water") continue;
                const [x, y, z] = k.split(",").map(Number);
                const over = typeAt(x, y + 1, z);
                if (over === "minecraft:water" || over === "minecraft:flowing_water") continue; // not the top of the water
                tops.push([x, y, z]);
                if (PAD_BLOCKS.has(over)) {
                  pads++;
                  padAt.add(key(x, y + 1, z));
                }
                if (++n % 64 === 0) yield;
              }
              const spawnSpots = spawnSpotsOf(tops, (x, y, z) => typeAt(x, y, z) === "minecraft:air", (x, y, z) => padAt.has(key(x, y, z)), BALANCE.frog.spawnKeep);
              // And their own walk with their leaps (geometry.js leap: up to leapUp blocks up onto the top of anything
              // within leapReach blocks, fences and gates too): does it lead out (walls not high enough for a frog's leap
              // from the floor or from anything it can sit on near them).
              const F = BALANCE.frog;
              const walk = newResult(start);
              yield* floodTerrestrial(read, start, { ...EXHIBIT_LIMITS, minHeight: profile.minHeight, cellsPerYield: opts.cellsPerYield, maxDrop: F.leapDown, rise: F.leapUp, leapFences: true, leap: { reach: F.leapReach, up: F.leapUp, down: F.leapDown } }, walk);
              pond = { pads, spawnSpots, enclosed: !walk.error && !walk.escape, escape: walk.escape };
            }
            // Axolotls (0.1.185): the floor under the water (animals/axolotlRules.js gravelFloors: down each column from its
            // top water cell through the water and the plants), never gravel. Their plants are the seagrass count above.
            if (!out.error && anyWants(ex, "waterPlants")) {
              const d = dim(ex.dimension);
              const typeAt = (x, y, z) => {
                try {
                  return d.getBlock({ x, y, z })?.typeId;
                } catch {
                  return undefined; // unloaded: no gravel
                }
              };
              const tops = [];
              let n = 0;
              for (const [k, kind] of out.cells) {
                if (kind !== "water") continue;
                const [x, y, z] = k.split(",").map(Number);
                const over = typeAt(x, y + 1, z);
                if (over === "minecraft:water" || over === "minecraft:flowing_water") continue; // not the top of the water
                tops.push([x, y, z]);
                if (++n % 64 === 0) yield;
              }
              yield;
              tank = gravelFloors(tops, typeAt, BALANCE.axolotl.floorDepth, BALANCE.axolotl.gravelKeep);
            }
            // Dolphins (0.1.186): each column of the pool's water read down from its top cell (animals/dolphinRules.js
            // poolColumns): the widest stretch deep enough to dive and turn in, and the tops open to the air they breathe.
            if (!out.error && anyWants(ex, "deepPool")) {
              const d = dim(ex.dimension);
              const typeAt = (x, y, z) => {
                try {
                  return d.getBlock({ x, y, z })?.typeId;
                } catch {
                  return undefined; // unloaded: ends the column, and covered
                }
              };
              const tops = [];
              let n = 0;
              for (const [k, kind] of out.cells) {
                if (kind !== "water") continue;
                const [x, y, z] = k.split(",").map(Number);
                const over = typeAt(x, y + 1, z);
                if (over === "minecraft:water" || over === "minecraft:flowing_water") continue; // not the top of the water
                tops.push([x, y, z]);
                if (++n % 64 === 0) yield;
              }
              yield;
              pool = poolSummary(poolColumns(tops, typeAt, BALANCE.dolphin.floorDepth), BALANCE.dolphin);
            }
            // Shimmer Snails: the crevices at the foot of the walls that open onto the floor, to rest in (read as the snail
            // reads, gecko and thin: a slab, stairs, a chorus stalk or anything else that doesn't fill its space isn't a
            // wall or a roof; nor leaves).
            if (!out.error && anyWants(ex, "crevices")) {
              crevices = newCreviceResult();
              yield* measureCrevices(blockReader(dim(ex.dimension), { leaves: true, gecko: true, thin: true }, memo), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.snail.creviceKeep }, crevices);
            }
            // Obsidian Crabs: the sides of rock blocks facing onto the floor at its level, to scrape (read as the crab
            // reads, gecko and thin: a slab or stairs of stone, a wall or a fence isn't a rock face).
            if (!out.error && anyWants(ex, "rockFaces")) {
              rock = newRockResult();
              yield* measureRock(blockReader(dim(ex.dimension), { leaves: true, gecko: true, thin: true, rock: true }, memo), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.crab.rockKeep }, rock);
            }
            // Starback Tortoises: the chorus standing on the floor to browse, the Warm Pads in it to bask on, the floor
            // under a low roof to rest under (the roof read as the walking measure reads it; the blocks by their ids).
            if (!out.error && anyWants(ex, "warmPads")) {
              tortoise = newTortoiseResult();
              yield* measureTortoise(read, lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.starback.keep }, tortoise);
            }
            // Lush Okapis: the moss, the lush plants and the clay (by their ids), the trunks, and the floor under cover for
            // a calf to lie hidden (the cover read as the walking measure reads it).
            if (!out.error && anyWants(ex, "lushGround")) {
              okapi = newOkapiResult();
              yield* measureOkapi(read, lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.okapi.hideKeep, coverRise: BALANCE.okapi.coverRise }, okapi);
            }
            // Earth Molebears: the Burrow Soil (by its id) beside the floor, and the faces of it a tunnel can start into
            // (read as animals/molebear.js reads the ground round a tunnel: gecko and thin, so only a full block is firm).
            // (Foxes too, 0.1.169: they dig in it; species.toys "soil", animals/woodlandRules.js soilFixtures.)
            if (!out.error && (anyWants(ex, "burrowSoil") || speciesIn(ex).some((sp) => sp.toys?.includes("soil")))) {
              molebear = newMolebearResult();
              const typeAt = lightReader(dim(ex.dimension));
              const M = BALANCE.molebear;
              yield* measureMolebear((x, y, z) => typeAt(x, y, z)?.id, blockReader(dim(ex.dimension), { leaves: true, gecko: true, thin: true }, memo), out.cells, out.bbox, { cellsPerYield: opts.cellsPerYield }, molebear, { w: M.tunnelWide, h: M.tunnelHigh, room: M.tunnelRoom });
            }
            // Skulkers: the sculk in the floor and any sculk shrieker in or beside it (by their ids).
            if (!out.error && anyWants(ex, "sculkFloor")) {
              skulker = newSkulkerResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureSkulker((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, skulker);
            }
            // Unicorns: the glowing flowers on the floor and the water beside it (by their ids).
            if (!out.error && anyWants(ex, "gladeFlowers")) {
              unicorn = newUnicornResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureUnicorn((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, unicorn);
            }
            // Glowhorn Stags: the trunks beside the floor and the spots to rub them from (by their ids).
            if (!out.error && anyWants(ex, "trunks")) {
              stag = newStagResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureStag((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, stag);
            }
            // Giant Yetis: the snow and ice in the floor (by their ids).
            if (!out.error && anyWants(ex, "snowFloor")) {
              snow = newSnowResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureSnow((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, snow);
            }
            // Soul Sloths: the soul sand and soul soil in the floor, and the beams over it (by their ids).
            if (!out.error && anyWants(ex, "soulFloor")) {
              sloth = newSlothResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureSloth((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, sloth);
            }
            // Zombies and skeletons (0.1.163): the pen (its air: shut in all round, the Mob House it is beside, whether it
            // opens into the hall), for mobs living here or an empty exhibit beside a working Mob House's hall; the floor
            // they like (by its ids).
            if (!out.error && (anyWants(ex, "mob") || !species)) {
              const houses = housesNear(db.all("equipment").filter((e) => e.type === "mobhouse"), ex.dimension, out.bbox, BALANCE.mobs.penReach);
              if (houses.length || anyWants(ex, "mob")) {
                const room = newResult(start);
                yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.mob_pen.minHeight, countEnd: false }, room);
                if (!room.error) mobPen = penReport(room, houses, (x, y, z) => read(x, y, z) === "air", (x, y, z) => room.cells.has(key(x, y, z)));
                // Creepers and spiders (0.1.164): what they like in the pen, in its air and round it.
                if (!room.error && anyWants(ex, "mobDecor")) {
                  mobDecor = newMobDecorResult();
                  const typeAt = lightReader(dim(ex.dimension));
                  const ids = new Set(speciesIn(ex).flatMap((sp) => sp.mobDecor?.ids ?? []));
                  yield* measureMobDecor((x, y, z) => typeAt(x, y, z)?.id, room.cells, { cellsPerYield: opts.cellsPerYield, ids }, mobDecor);
                }
              }
            }
            // Pandas (0.1.170): the bamboo stalks growing in the floor or beside it (by their id), each counted once.
            if (!out.error && anyWants(ex, "grove")) {
              bamboo = newBambooResult();
              const typeAt = lightReader(dim(ex.dimension));
              yield* measureBamboo((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield }, bamboo);
            }
            // Ocelots and cats (0.1.189): the logs and seats on the floor or beside it, open on top (animals/catRules.js).
            if (!out.error && anyWants(ex, "restSpots")) {
              cats = newRestResult();
              yield* measureRest(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.cat.restKeep }, cats);
            }
            if (!out.error && (anyWants(ex, "mobFloor") || anyWants(ex, "mobDecor"))) {
              mobFloor = newMobFloorResult();
              const typeAt = lightReader(dim(ex.dimension));
              const ids = new Set(speciesIn(ex).flatMap((sp) => sp.mobFloor?.ids ?? []));
              yield* measureMobFloor((x, y, z) => typeAt(x, y, z)?.id, out.cells, { cellsPerYield: opts.cellsPerYield, ids }, mobFloor);
              if (mobDecor) mobFloor.decor = mobDecor;
            }
            // An empty exhibit with a Void Perch floating inside it is measured for flight as well, so
            // a Void Ray can move in (the perch says what the exhibit is for); one with only Perches (0.1.81), so
            // owls can, with an owl's headroom.
            const inside = !species && !out.error ? perchesInside(ex, out) : undefined;
            // A Beehive or Bee Nest beside the floor of an empty exhibit (0.1.187). (A yield* stands on its own in a try:
            // QuickJS can't compile one inside a longer expression there.)
            let hived = false;
            if (!inside && !species && !out.error) {
              const found = yield* hiveBeside(idReader(dim(ex.dimension)), out.cells, opts.cellsPerYield);
              hived = found;
            }
            if (inside) {
              air = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: inside === "void" ? AERIAL_HEIGHT : ROOST_HEIGHT, countEnd: false }, air);
              air.height = inside === "void" ? AERIAL_HEIGHT : ROOST_HEIGHT;
              if (air.error) air = undefined;
            } else if (hived) {
              // A Beehive or Bee Nest in an empty exhibit (0.1.187): a bee garden in the making, measured for flight with
              // its headroom and for its flowers and hives, so bees can move in.
              air = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.bee_garden.minHeight, countEnd: false }, air);
              air.height = HABITAT_PROFILES.bee_garden.minHeight;
              if (air.error) air = undefined;
              else {
                bees = newBeeResult();
                yield* measureBees(lightReader(dim(ex.dimension)), air.cells, beeOpts(airOpts), bees);
              }
            } else if (!species && !out.error && nectarFeederInside(ex, out)) {
              // A Nectar Feeder in an empty exhibit: a moth house in the making, measured for flight with a moth's
              // headroom and for its soul lights and host plants, so Soul Moths can move in, and its chorus, so Chorus Moths
              // can.
              air = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.moth_house.minHeight, countEnd: false }, air);
              air.height = HABITAT_PROFILES.moth_house.minHeight;
              if (air.error) air = undefined;
              else {
                soul = newMothResult();
                yield* measureMoth(lightReader(dim(ex.dimension)), air.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.moth.plantKeep }, soul);
                chorus = newChorusResult();
                yield* measureChorus(lightReader(dim(ex.dimension)), air.cells, chorusOpts(airOpts, HABITAT_PROFILES.moth_house.minHeight), chorus);
              }
            } else if (!species && !out.error && out.usableArea >= HABITAT_PROFILES.great_aerial.baseArea) {
              // A lit campfire in a big empty exhibit: a dragons' hall in the making, measured for flight with their
              // headroom (and for its campfires again, on that floor), so a Dragon can move in. Gold on its floor
              // (0.1.151): a griffins' hall, the same. End ground over enough of its floor (0.1.162): a Baby Dragon's.
              const fires = newDragonResult();
              yield* measureDragon(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: opts.cellsPerYield }, fires);
              const gold = newGriffinResult();
              yield* measureGriffin(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: opts.cellsPerYield }, gold);
              const ids = lightReader(dim(ex.dimension));
              const endFloor = yield* countEndFloor((x, y, z) => ids(x, y, z)?.id, out.cells, opts.cellsPerYield);
              if (fires.campfires > 0 || gold.gold > 0 || endFloor >= (SPECIES[ZOO_DRAKE]?.endGround?.minCells ?? 100)) {
                air = newResult(start);
                yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.great_aerial.minHeight, countEnd: false }, air);
                air.height = HABITAT_PROFILES.great_aerial.minHeight;
                if (air.error) air = undefined;
                else {
                  dragon = newDragonResult();
                  yield* measureDragon(lightReader(dim(ex.dimension)), air.cells, { cellsPerYield: airOpts.cellsPerYield, minHeight: air.height }, dragon);
                  griffin = newGriffinResult();
                  yield* measureGriffin(lightReader(dim(ex.dimension)), air.cells, { cellsPerYield: airOpts.cellsPerYield }, griffin);
                }
              }
            }
          }
        } catch (error) {
          out.error = `Validation failed: ${error}`;
          out.done = true;
        }
        yield; // the results go in in a step of their own (0.1.96: with the measure's last slice it was the slowest step)
        if (running.get(exId)?.gen === gen) running.delete(exId);
        if (jobs.get(exId) !== gen) return resolve(undefined); // superseded by a newer edit
        resolve(applyValidation(exId, start, out, air, climb, croc, ape, walls, boar, soul, hops, crevices, rock, chorus, tortoise, okapi, molebear, skulker, unicorn, dragon, griffin, stag, snow, sloth, mobPen, mobFloor, bamboo, goat, pond, tank, pool, bees, parrots, cats));
      })()),
    );
  });
}

// A Void Perch ("void") or else a Perch ("roost", 0.1.81) within the walls of a walking measurement, up to the
// exhibit height limit above its floor; undefined with neither.
function perchesInside(ex, r) {
  const b = r.bbox;
  if (!b) return undefined;
  const within = (f) => f.dimension === ex.dimension && f.pos.x >= b.min.x - 1 && f.pos.x <= b.max.x + 1 && f.pos.z >= b.min.z - 1 && f.pos.z <= b.max.z + 1 && f.pos.y >= b.min.y - 1 && f.pos.y <= b.min.y + EXHIBIT_LIMITS.halfHeight;
  if (allFixtures("perch").some(within)) return "void";
  return allFixtures("roost").some(within) ? "roost" : undefined;
}

// The most light a night animal's house may have: the Nocturnal Lamps', or more for one whose own light counts as dark
// (Soul Moths: soul light, species.houseLight).
function houseLightOf(ex) {
  return Math.max(BALANCE.nocturnal.maxLight, ...speciesIn(ex).map((sp) => sp.houseLight ?? 0));
}

// The moth measure's reader: a block's id, and its states for a soul light (hanging, put out, on a wall) or a campfire
// (put out: the dragon measure); undefined unloaded.
const BED = "minecraft:bed";

function lightReader(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (!b) return undefined;
      return { id: b.typeId, states: isSoulLight(b.typeId) || CAMPFIRES.has(b.typeId) || isHive(b.typeId) || b.typeId === BED ? b.permutation.getAllStates() : undefined }; // a bed's head or foot (0.1.189)
    } catch {
      return undefined;
    }
  };
}

// Block ids only, from the light reader (one reader for a whole measure).
function idReader(d) {
  const read = lightReader(d);
  return (x, y, z) => read(x, y, z)?.id;
}

// The bee measure's slices and what it keeps (0.1.187).
function beeOpts(airOpts) {
  return { cellsPerYield: airOpts.cellsPerYield, flowerKeep: BALANCE.bee.flowerKeep, hiveKeep: BALANCE.bee.hiveKeep };
}

// The chorus measure's slices, what it keeps and the headroom the air was measured with (Chorus Moths).
function chorusOpts(airOpts, minHeight) {
  return { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.chorusMoth.plantKeep, flowerKeep: BALANCE.chorusMoth.flowerKeep, minHeight };
}

// A Nectar Feeder (Soul Moths, Chorus Moths) within the walls of a walking measurement, up to its highest floor.
function nectarFeederInside(ex, r) {
  const b = r.bbox;
  if (!b) return false;
  return allFeeders().some((f) => f.nectar && f.dimension === ex.dimension && f.pos.x >= b.min.x - 1 && f.pos.x <= b.max.x + 1 && f.pos.z >= b.min.z - 1 && f.pos.z <= b.max.z + 1 && f.pos.y >= b.min.y - 1 && f.pos.y <= b.max.y + 1);
}

// A Landing Pad (End Hoppers) within the walls of a walking measurement, up to the exhibit height limit above its floor.
function padInside(ex, r) {
  const b = r.bbox;
  if (!b) return false;
  return allFixtures("pad").some((f) => f.dimension === ex.dimension && f.pos.x >= b.min.x - 1 && f.pos.x <= b.max.x + 1 && f.pos.z >= b.min.z - 1 && f.pos.z <= b.max.z + 1 && f.pos.y >= b.min.y - 1 && f.pos.y <= b.min.y + EXHIBIT_LIMITS.halfHeight);
}

// An Insect Feeder (Warped Geckos) within the walls of a walking measurement, up to its highest floor.
function insectFeederInside(ex, r) {
  const b = r.bbox;
  if (!b) return false;
  return allFeeders().some((f) => f.insect && f.dimension === ex.dimension && f.pos.x >= b.min.x - 1 && f.pos.x <= b.max.x + 1 && f.pos.z >= b.min.z - 1 && f.pos.z <= b.max.z + 1 && f.pos.y >= b.min.y - 1 && f.pos.y <= b.max.y + 1);
}

// 0.1.114: the results go in for the exhibit's park (its time, its members' messages), whoever asked for the measure.
function applyValidation(exId, ...rest) {
  return withPark(parkOfRecord(getExhibit(exId)) ?? onlyPark(), () => applyValidationIn(exId, ...rest));
}

function applyValidationIn(exId, seed, r, air, climb, croc, ape, walls, boar, soul, hops, crevices, rock, chorus, tortoise, okapi, molebear, skulker, unicorn, dragon, griffin, stag, snow, sloth, mobPen, mobFloor, bamboo, goat, pond, tank, pool, bees, parrots, cats) {
  const ex = getExhibit(exId);
  if (!ex) return undefined;
  ex.validations++;
  if (r.error) {
    // Couldn't measure (bad seed or unloaded): keep the last good measurement.
    ex.issues = [r.error, ...ex.issues.filter((i) => i.startsWith("Controller"))];
    db.put(EX, ex);
    return r;
  }
  ex.seed = seed;
  ex.bbox = r.bbox;
  // The pen as built: kept while the walls are open (a fence a boar broke), so what got out through the gap is outside.
  if (r.enclosed || !ex.penBox) ex.penBox = r.enclosed ? r.bbox : undefined;
  ex.usableArea = r.usableArea;
  ex.landCells = r.landCells;
  ex.waterCells = r.waterCells;
  ex.deepWaterCells = r.deepWaterCells;
  ex.lavaCells = r.lavaCells;
  ex.deepLavaCells = r.deepLavaCells;
  // (the tops of chorus low under the roof aren't: no moth wants to stand there, Chorus Moths' chorus.lowTops)
  // (nor the molebears' own tunnels, 2 high in their Burrow Soil since 0.1.140: molebear.tunnels)
  // (nor the tops of what stands on a dragons' floor, its campfires, feeder, basket and trough, 0.1.150: dragon.lowTops)
  // (nor, for every species, the tops of things standing on the floor, a block up from floor with the headroom beside
  // them, 0.1.179: r.lowTopCells, geometry.js topsOf; mostly the same cells as chorus.lowTops and dragon.lowTops, so
  // the larger count is taken off, never both)
  ex.lowCells = Math.max(0, r.lowCeilingCells - Math.max(r.lowTopCells ?? 0, (chorus && air === r ? chorus.lowTops : 0) + (dragon && air === r ? dragon.lowTops : 0)) - (molebear?.tunnels ?? 0)); // floor under a roof (not leaves) lower than the headroom
  // A flyer's exhibit measured enclosed has a roof over all of it (0.1.81: the flight measure counts no cover, so
  // until then a Void Ray's shelter was 0 and it could never breed).
  ex.coveredCells = anyWants(ex, "cover") || anyWants(ex, "heatShade") || wantsShelter(ex) || anyWants(ex, "desert") ? (profileOf(ex).aerial && r.enclosed ? r.usableArea : r.coveredCells) : undefined;
  // Red pandas: is the exhibit in a hot biome (read at the floor where it was measured from)?
  ex.hotBiome = anyWants(ex, "heatShade") ? isHotBiome(biomeAt(dim(ex.dimension), seed), BALANCE.redpanda) : undefined;
  // Armadillos (0.1.190): is it a snowy biome (they need warmth there)?
  ex.coldBiome = anyWants(ex, "coldWarmth") ? isColdBiome(biomeAt(dim(ex.dimension), seed), BALANCE.armadillo) : undefined;
  ex.mudCells = anyWants(ex, "mud") ? r.mudCells : undefined;
  ex.hayBales = anyWants(ex, "hay") ? r.hayBales : undefined; // the farmyard's bedding (0.1.168)
  ex.runLength = anyWants(ex, "run") ? longestRun(floorColumns(r.cells)) : undefined; // a straight run 2 wide to gallop along (0.1.175)
  ex.nestSites = anyWants(ex, "nest") ? r.shoreMudCells : undefined; // mud right beside the water (flamingos)
  ex.nestSpots = anyWants(ex, "nest") ? r.shoreMud : undefined;
  ex.hotCells = anyWants(ex, "bask") ? r.hotCells : undefined;
  ex.ashCells = anyWants(ex, "ash") ? r.ashCells : undefined;
  ex.endCells = anyWants(ex, "endGround") ? r.endCells : undefined;
  ex.grassCells = anyWants(ex, "graze") ? r.grassCells : undefined; // grass blocks in the floor to graze (zebras)
  ex.myceliumCells = anyWants(ex, "mycelium") ? r.myceliumCells : undefined; // mycelium blocks in the floor to graze (mooshrooms, 0.1.191)
  ex.digCells = anyWants(ex, "digBed") ? r.digCells : undefined; // floor blocks a sniffer digs (0.1.192)
  ex.bats = anyWants(ex, "batRoost") ? r.batResult : undefined; // the bats' roosts and flight (0.1.194)
  ex.allays = anyWants(ex, "noteBlock") ? r.allayResult : undefined; // the allays' note blocks (0.1.194)
  ex.nyliumCells = anyWants(ex, "nylium") ? r.nyliumCells : undefined; // crimson nylium in the floor (Crimson Grazers)
  ex.stemCount = anyWants(ex, "rubStem") ? r.stemCount : undefined; // crimson stems beside the floor to rub on
  ex.thermalMudCells = anyWants(ex, "wallow") ? r.thermalMudCells : undefined; // Thermal Mud in the floor to wallow in (Cinder Boars)
  ex.substrateCells = anyWants(ex, "substrate") || anyWants(ex, "mineralBed") || anyWants(ex, "burrows") || anyWants(ex, "substrateNest") ? r.substrateCells : undefined; // Mineral Substrate in the floor to bury themselves in (Quartz Beetles), to graze and lay in (Shimmer Snails), to dig their burrows in (Obsidian Crabs), to nest in (Starback Tortoises)
  ex.sandBedCells = anyWants(ex, "sandBed") ? r.sandBedCells : undefined; // water blocks over sand (Giant Stingrays, 0.1.127)
  ex.sandFloorCells = anyWants(ex, "desert") || anyWants(ex, "sandFloor") ? r.sandFloorCells : undefined; // floor blocks on sand or red sand (camels, 0.1.181; armadillos, 0.1.190)
  ex.sandBedSpots = anyWants(ex, "sandBed") ? r.sandBed : undefined; // where the first 64 are, the spots to bury themselves in
  ex.seagrassCells = anyWants(ex, "seagrass") ? r.seagrassCells : undefined; // water columns with seagrass or kelp (manatees, 0.1.129)
  ex.seagrassSpots = anyWants(ex, "seagrass") ? r.seagrass : undefined; // where the first 64 are, the spots to graze
  if (anyWants(ex, "waterPlants")) ex.seagrassCells = r.seagrassCells; // and the axolotls' water plants (0.1.185)
  ex.screenCells = anyWants(ex, "privacy") ? r.screenCells : undefined; // screened floor blocks (tigers)
  ex.screenSpots = anyWants(ex, "privacy") ? r.screens : undefined;
  ex.house = anyWants(ex, "nocturnal") || anyWants(ex, "nightLife") || anyWants(ex, "lowLight") ? r.house : undefined; // the nocturnal house (hedgehogs): enclosed from daylight and dim (animals/nightRules.js)
  // Crocodiles: the sunny basking bank, the shore ring and its clutter, shade near the water, sand to nest in.
  for (const k of ["sunBankCells", "sunBankSpots", "shoreCells", "shoreBlocked", "shoreSpots", "shadeSpots", "sandSites", "sandSpots"]) ex[k] = croc ? croc[k] : undefined;
  const flying = Boolean(profileOf(ex).aerial);
  ex.flightCells = air ? air.flightCells : undefined;
  // The flight measurement (see the note at the top): what a flying species would find here.
  ex.aerial = air ? { enclosed: air.enclosed, usableArea: air.usableArea, lowCells: Math.max(0, air.lowCeilingCells - Math.max(air.lowTopCells ?? 0, (chorus?.lowTops ?? 0) + (dragon?.lowTops ?? 0))), escape: air.escape, perchCount: 0, roostCount: 0, height: air.height ?? profileOf(ex).minHeight } : undefined;
  // The climb measure (raccoons): where one could get out, the way out for the escape (one longer
  // than 64 blocks isn't kept: no raccoon takes it, though the exhibit is still unsafe), and the trees.
  ex.climb = climb ? { proof: climb.proof, via: climb.via, path: climb.path && climb.path.length <= 64 ? climb.path.map((p) => [p.x, p.y, p.z]) : undefined, trees: climb.trees, canopy: anyWants(ex, "canopy") ? climb.canopy : undefined } : undefined;
  // Red pandas: the Nest Boxes up beside the canopy (the climb measure found them).
  const treeNests = new Set(climb?.nests ?? []);
  // Gorillas: the ape measure, kept the same way.
  ex.apeClimb = ape ? { proof: ape.proof, via: ape.via, path: ape.path && ape.path.length <= 64 ? ape.path.map((p) => [p.x, p.y, p.z]) : undefined, trees: ape.trees } : undefined;
  // Warped Geckos: the wall measure (where the air leads out, the wall faces, the cracks and where the first are, and
  // the box of the air, which their routes keep to).
  ex.walls = walls ? { enclosed: walls.enclosed, escape: walls.escape, faces: walls.faces, cracks: walls.cracks, crackSpots: walls.crackSpots, box: walls.box } : undefined;
  // Cinder Boars: the boar measure, kept the same way (the way out for the escape, and the wooden blocks beside the floor).
  ex.boarWalls = boar ? { proof: boar.proof, via: boar.via, path: boar.path && boar.path.length <= 64 ? boar.path.map((p) => [p.x, p.y, p.z]) : undefined, weak: boar.weak } : undefined;
  // Soul Moths: the soul lights (where, and which way each sits: hanging, standing, on a wall) and the host plants in the
  // floor (how many, and where the first are).
  ex.soul = soul ? { lights: soul.lights.slice(0, 32), plants: soul.plants, plantSpots: soul.plantSpots } : undefined;
  // End Hoppers: the jump measure (the roof: where the air leads out; how many Landing Pads count, the high ones and why
  // the others don't; where the counted ones are, with their heights over the floor, which their leaps go between).
  ex.hops = hops ? { enclosed: hops.enclosed, escape: hops.escape, pads: hops.pads, counted: hops.counted, high: hops.high, noClear: hops.noClear, outOfReach: hops.outOfReach, spots: hops.spots.slice(0, 64) } : undefined;
  const hopPads = new Set(hops?.ids ?? []);
  // Shimmer Snails: the crevice measure (how many crevices open onto the floor, and where the first are, [x, y, z, the
  // way out]).
  ex.crevices = crevices ? { count: crevices.count, spots: crevices.spots } : undefined;
  // Obsidian Crabs: the rock measure (how many rock faces stand at the floor's level, and where the first are, [x, y, z,
  // the way to the rock]).
  ex.rock = rock ? { count: rock.count, spots: rock.spots } : undefined;
  // Chorus Moths: the chorus measure (how many chorus flowers have an open side, and where the first are; how much
  // chorus stands on the floor, and where the first is, [x, y, z, the way to it]).
  ex.chorus = chorus ? { flowers: chorus.flowers, flowerCount: chorus.flowerCount, plants: chorus.plants, plantSpots: chorus.plantSpots } : undefined;
  // Starback Tortoises: the tortoise measure (how much chorus stands on the floor, how many Warm Pads are in it, how much
  // floor is under the low roof, and where the first of each are).
  ex.tortoise = tortoise ? { plants: tortoise.plants, plantSpots: tortoise.plantSpots, pads: tortoise.pads, padSpots: tortoise.padSpots, retreat: tortoise.retreat, retreatSpots: tortoise.retreatSpots } : undefined;
  // Lush Okapis: the okapi measure (the moss, the lush plants, the clay, the trunks to rub on, and the best-covered spots
  // for a calf to lie hidden in, [x, y, z, score]).
  ex.okapi = okapi ? { moss: okapi.moss, plants: okapi.plants, clay: okapi.clay, rubs: okapi.rubs, hideSpots: okapi.hideSpots } : undefined;
  // Earth Molebears: the molebear measure (the Burrow Soil beside the floor, and the faces of it to tunnel into).
  ex.molebear = molebear ? { soil: molebear.soil, bank: molebear.bank, faces: molebear.faces } : undefined; // (faces: 0.1.140)
  // Skulkers: the skulker measure (the sculk in the floor, the shriekers in or beside it).
  ex.skulker = skulker ? { sculk: skulker.sculk, shriekers: skulker.shriekers } : undefined;
  // Unicorns: the unicorn measure (the glowing flowers on the floor, the spots beside water to dip a horn in).
  ex.unicorn = unicorn ? { flowers: unicorn.flowers, dips: unicorn.dips } : undefined;
  // Dragons: the dragon measure (the lit campfires on the floor or beside it, and where the first 8 are).
  ex.dragon = dragon ? { campfires: dragon.campfires, spots: dragon.spots } : undefined;
  // Griffins: the griffin measure (the blocks of gold on the floor or in it, and where the first 8 are).
  ex.griffin = griffin ? { gold: griffin.gold, spots: griffin.spots } : undefined;
  // Glowhorn Stags: the stag measure (the trunk blocks beside the floor, the floor cells to rub one from).
  ex.stag = stag ? { trunks: stag.trunks, rubs: stag.rubs } : undefined;
  // Giant Yetis: the snow measure (the floor's snow and ice, of all its blocks).
  ex.snow = snow ? { snow: snow.snow, cells: snow.cells } : undefined;
  // Soul Sloths: the sloth measure (the floor's soul sand and soul soil, of all its blocks; the beams, up to 4).
  ex.sloth = sloth ? { soul: sloth.soul, cells: sloth.cells, beams: sloth.beams } : undefined;
  // Zombies and skeletons (0.1.163): the pen measure (shut in all round or where it leads out, the Mob House it is beside,
  // whether it opens into the hall) and the floor they like (the floor's blocks, and the ones they like by id).
  ex.mobPen = mobPen;
  ex.mobFloor = mobFloor ? { cells: mobFloor.cells, ids: mobFloor.ids, decor: mobFloor.decor } : undefined; // decor: creepers' and spiders' (0.1.164)
  // Pandas (0.1.170): the bamboo measure (the stalks growing in the floor or beside it).
  ex.bamboo = bamboo ? { stalks: bamboo.stalks } : undefined;
  // Goats (0.1.180): their walk (enclosed for them, or where it leads out) and their rock ledges (how many, how many are
  // lookouts, the highest, and where the highest are with their heights: animals/goat.js leaps between them).
  ex.goat = goat ? { enclosed: goat.enclosed, escape: goat.escape, ledges: goat.ledges, high: goat.high, top: goat.top, spots: goat.spots } : undefined;
  // Frogs (0.1.184): the lily pads on the water and the open water to lay frogspawn on ([x, y, z, beside a pad]).
  ex.frog = pond ? { pads: pond.pads, spawnSpots: pond.spawnSpots, enclosed: pond.enclosed, escape: pond.escape } : undefined;
  // Axolotls (0.1.185): how many columns of the tank's water stand on gravel, and where the first few are ([x, y, z]).
  ex.axolotl = tank ? { gravel: tank.gravel, spots: tank.spots } : undefined;
  // Dolphins (0.1.186): the widest stretch of water deep enough to dive in (its side), the columns that deep, the deepest,
  // and the tops open to the air.
  ex.dolphin = pool ? { stretch: pool.stretch, deep: pool.deep, deepest: pool.deepest, open: pool.open } : undefined;
  // Bees (0.1.187): the bee flowers in the garden, the hives opening into it (and those facing a wall), their honey, and
  // where the first few of each are.
  ex.bees = bees ? { flowers: bees.flowers, hives: bees.hives, walled: bees.walled, honey: bees.honey, flowerSpots: bees.flowerSpots, hiveSpots: bees.hiveSpots } : undefined;
  // Parrots (0.1.188): the aviary's jukeboxes, and where the first few are (they dance to them).
  ex.parrots = parrots ? { jukeboxes: parrots.jukeboxes, jukeboxSpots: parrots.jukeboxSpots } : undefined;
  ex.cats = cats ? { logs: cats.logs, seats: cats.seats, chests: cats.chests, beds: cats.beds, furnaces: cats.furnaces, coldFurnaces: cats.coldFurnaces, spots: cats.spots } : undefined;
  cellCache.set(ex.id, r.cells);
  if (anyWants(ex, "desert")) shadeCache.set(ex.id, new Set(r.shadeSpots ?? []));
  else shadeCache.delete(ex.id);

  const issues = [];
  if (ex.controllerMissing) issues.push("Controller missing: place a new Exhibit Controller nearby to reconnect.");
  const outside = outsideIssue(ex);
  if (outside) issues.push(outside);
  // The double Keeper Gate (0.1.75): measured with every gate shut (an open inner gate lets the measure
  // into the passage between the gates). An open gate whose partner is shut is the airlock working.
  if (!r.openGates.length) ex.service = measureService(ex, r.cells);
  // Crocodiles: how far the inner Keeper Gate is from the water (shore clearance).
  ex.gateToWater = croc ? gateToWater(ex.service, [...r.cells].filter(([, v]) => v === "water").map(([k]) => k.split(",").map(Number))) : undefined;
  const openGates = r.openGates.filter((g) => !airlockHolds(ex, g));
  const airlock = r.openGates.length > 0 && !openGates.length;
  if (openGates.length) {
    const g = openGates[0];
    issues.push(`Open gate or door at ${g.x} ${g.y} ${g.z}: close it.`);
  } else if (r.escape) {
    issues.push(flying ? `Not enclosed: the animals could fly out near ${r.escape.x} ${r.escape.y} ${r.escape.z}. Close the roof and the walls.` : `Not enclosed: animals could walk out near ${r.escape.x} ${r.escape.y} ${r.escape.z}. Fill gaps with fences or walls.`);
  }
  const c = ex.controller;
  if (r.cells.has(key(c.x, c.y, c.z)) || r.cells.has(key(c.x, c.y + 1, c.z)) || isReachable(r.cells, c) || isReachable(r.cells, c, "lava")) {
    issues.push("Move the controller outside the fence, out of the animals' reach.");
  }
  // A climber living here that could climb out makes the exhibit unsafe, like an open gate.
  const climbers = speciesIn(ex).filter((sp) => sp.climbs);
  const climbsOut = Boolean(climbers.length && climb && !climb.proof);
  if (climbsOut && !openGates.length && !r.escape) issues.push(climbIssue(pluralOf(climbers[0]), climb));
  // So does a gorilla living here that could get out over walls that aren't strong enough.
  const apes = speciesIn(ex).filter((sp) => sp.ape);
  const apesOut = Boolean(apes.length && ape && !ape.proof);
  if (apesOut && !climbsOut && !openGates.length && !r.escape) issues.push(apeIssue(pluralOf(apes[0]), ape, BALANCE.gorilla));
  // And geckos living here whose air leads out: they climb glass and walls, and would get out over the top.
  const clingers = speciesIn(ex).filter((sp) => sp.clings);
  const wallsOut = Boolean(clingers.length && walls && !walls.enclosed);
  if (wallsOut && !climbsOut && !apesOut && !openGates.length && !r.escape) issues.push(roofIssue(pluralOf(clingers[0]), walls));
  // And boars living here that could break out through wooden fences, gates or doors.
  const boars = speciesIn(ex).filter((sp) => sp.boarProof);
  const boarsOut = Boolean(boars.length && boar && !boar.proof);
  if (boarsOut && !climbsOut && !apesOut && !wallsOut && !openGates.length && !r.escape) issues.push(boarIssue(pluralOf(boars[0]), boar));
  // And hoppers living here whose air leads out: they leap 3 blocks high, out over the fence.
  const hoppers = speciesIn(ex).filter((sp) => sp.hops);
  const hopsOut = Boolean(hoppers.length && hops && !hops.enclosed);
  if (hopsOut && !climbsOut && !apesOut && !wallsOut && !boarsOut && !openGates.length && !r.escape) issues.push(hopIssue(pluralOf(hoppers[0]), hops));
  // And goats living here whose walk leads out (0.1.180): they leap 3 blocks up, onto a wall or a fence too low and out.
  const goats = speciesIn(ex).filter((sp) => sp.rockLedges);
  const goatsOut = Boolean(goats.length && goat && !goat.enclosed);
  if (goatsOut && !climbsOut && !apesOut && !wallsOut && !boarsOut && !hopsOut && !openGates.length && !r.escape) issues.push(wallsIssue(pluralOf(goats[0]), goat.escape, BALANCE.goat));
  // And frogs living here whose leaps lead out (0.1.184): onto a wall or a fence too low and out.
  const frogs = speciesIn(ex).filter((sp) => sp.lilyPads);
  const frogsOut = Boolean(frogs.length && pond && !pond.enclosed);
  if (frogsOut && !climbsOut && !apesOut && !wallsOut && !boarsOut && !hopsOut && !goatsOut && !openGates.length && !r.escape) issues.push(frogWallsIssue(pluralOf(frogs[0]), pond.escape, BALANCE.frog));
  // And mobs living here in a pen that isn't one (0.1.163): no working Mob House beside it, open to the sky, or opening
  // into the hall.
  const mobs = speciesIn(ex).filter((sp) => sp.mob);
  if (mobs.length) {
    const why = mobPenProblem(mobPen, mobs.length === 1 ? pluralOf(mobs[0]) : "Mobs", mobHouseWorks(mobPen?.houseId));
    if (why) issues.push(why);
  }
  if (r.lowCeilingCells > 0 && r.usableArea === 0) issues.push(flying ? `The roof is too low: the animals need ${profileOf(ex).minHeight} blocks of air over the floor.` : "The ceiling is too low for animals here.");

  // Feeders: only ones the animals can actually reach count (AC-03). A Thermal Feeder is reached
  // from the lava, so it stands at the edge of the lava pool; a Hay Rack from the floor a block below
  // it (hung on the fence) or level with it.
  const inBox = (p, up = 2) => r.bbox && p.x >= r.bbox.min.x - 1 && p.x <= r.bbox.max.x + 1 && p.z >= r.bbox.min.z - 1 && p.z <= r.bbox.max.z + 1 && p.y >= r.bbox.min.y - 2 && p.y <= r.bbox.max.y + up; // up: a frog pond's basket hangs higher (basketHang)
  const linked = [];
  for (const f of allFeeders()) {
    if (f.dimension !== ex.dimension) continue;
    const boxed = inBox(f.pos);
    if (boxed && isReachable(r.cells, f.pos, f.aquarium ? "water" : f.thermal ? "lava" : "land", f.aquarium ? [-1, 0, 1] : f.rack ? [-1, 0] : undefined)) {
      const other = f.exhibitId && f.exhibitId !== ex.id && getExhibit(f.exhibitId);
      if (other && other.feederIds.includes(f.id)) {
        issues.push(`The feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} already belongs to ${other.name}.`);
        continue;
      }
      linked.push(f.id);
      linkFeeder(f, ex.id);
    } else {
      if (boxed) issues.push(f.aquarium ? `The Aquarium Feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} must hang over the water or stand in it (water right beside it, level with it or a block up or down).` : f.thermal ? `The Thermal Feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} must stand at the edge of the lava pool, level with the lava.` : f.rack ? `The Hay Rack at ${f.pos.x} ${f.pos.y} ${f.pos.z} can't be reached by the animals: hang it on the fence a block above their floor, or stand it on the floor, beside open ground.` : `The feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} can't be reached by the animals.`);
      if (f.exhibitId === ex.id) linkFeeder(f, undefined);
    }
  }
  ex.feederIds = linked;
  // Bees with flowers enough eat nothing else (0.1.187): no feeder needed.
  const foraging = SPECIES[ex.speciesId]?.beeGarden && hasBeeFlowers(SPECIES[ex.speciesId], ex, ex.animalIds?.length ?? 0, BALANCE.bee);
  if (!linked.length && !foraging) issues.push(SPECIES[ex.speciesId]?.lavaSwimmer ? "No reachable feeder: place a Thermal Feeder at the edge of the lava pool, level with the lava." : SPECIES[ex.speciesId]?.aquariumFeeder ? "No reachable feeder: hang an Aquarium Feeder over the water (or stand it in the water)." : `No reachable feeder: place ${SPECIES[ex.speciesId]?.nectarFeeder ? "a Nectar Feeder" : SPECIES[ex.speciesId]?.mineralFeeder ? "a Mineral Feeder" : SPECIES[ex.speciesId]?.insectFeeder ? "an Insect Feeder" : SPECIES[ex.speciesId]?.browsesHigh ? "an Elevated Browse Feeder" : SPECIES[ex.speciesId]?.rack ? "a Basic Feeder or a Hay Rack" : "a Basic Feeder"} inside, next to open ground.`);

  // Other equipment: troughs, baskets and filters serve the exhibit their position fits (see
  // equipment/rules.js); a toy, ball, Blaze Bone or Wither Skull Ball belongs to the exhibit it was put in.
  // Void Perches are found by the flight measurement (the air over and under them).
  const airBox = (p) => air?.bbox && p.x >= air.bbox.min.x - 1 && p.x <= air.bbox.max.x + 1 && p.z >= air.bbox.min.z - 1 && p.z <= air.bbox.max.z + 1 && p.y >= air.bbox.min.y - 1 && p.y <= air.bbox.max.y + 1;
  const fixtureIds = [];
  let perchCount = 0;
  const roosts = []; // the Perches (owls) linked: their records
  // A basket hangs up to two blocks over the floor, or up to a frog's leap over a frog pond's (0.1.184).
  const basketHang = anyWants(ex, "lilyPads") ? Math.max(2, BALANCE.frog.leapUp) : 2;
  for (const f of allFixtures()) {
    if (f.dimension !== ex.dimension || f.type === "station") continue;
    const loose = LOOSE.has(f.type);
    const mine = loose ? f.exhibitId === ex.id : f.type === "pad" ? hopPads.has(f.id) : f.type === "perch" || f.type === "roost" ? Boolean(air) && airBox(f.pos) && serves(f.type, air.cells, f.pos) : f.type === "holding" ? inBox(f.pos) && denServes(r.cells, f) : f.type === "nest" ? treeNests.has(f.id) || (inBox(f.pos) && serves(f.type, r.cells, f.pos)) : inBox(f.pos, f.type === "basket" ? basketHang : 2) && serves(f.type, r.cells, f.pos, basketHang);
    if (mine) {
      fixtureIds.push(f.id);
      if (f.type === "perch") perchCount++;
      if (f.type === "roost") roosts.push(f);
      linkFixture(f, ex.id);
    } else if (f.exhibitId === ex.id && !loose) linkFixture(f, undefined);
  }
  ex.fixtureIds = fixtureIds;
  // Lions' ledges: raised floor to rest on (never the top of a feeder, a trough or other equipment).
  if (anyWants(ex, "ledge")) {
    const tops = new Set([...allFeeders(), ...allFixtures()].filter((f) => f.dimension === ex.dimension).map((f) => `${f.pos.x},${f.pos.y + 1},${f.pos.z}`));
    ex.ledgeCells = ledgesOf(r.cells).filter((c) => !tops.has(`${c.x},${c.y},${c.z}`)).length;
  } else ex.ledgeCells = undefined;
  if (ex.aerial) ex.aerial.perchCount = perchCount;
  ex.perchCount = air ? perchCount : undefined;
  // Owls' Perches (0.1.81): how many, and how far apart in height (they want high and low ones).
  if (ex.aerial) ex.aerial.roostCount = roosts.length;
  ex.roostCount = air ? roosts.length : undefined;
  ex.roostSpread = air ? perchSpread(roosts) : undefined;

  const enclosed = (r.enclosed || (airlock && !r.escape)) && (r.usableArea > 0 || r.lavaCells > 0) && !climbsOut && !apesOut && !wallsOut && !boarsOut && !hopsOut && !goatsOut && !frogsOut;
  const species = leadSpecies(ex);
  // Every resident species gets its own habitat check (a shared wetland still needs its pool).
  for (const sp of speciesIn(ex)) {
    const problem = habitatProblem(ex, HABITAT_PROFILES[sp.habitatProfile], sp.displayName, sp);
    if (problem && !issues.includes(problem)) issues.push(problem);
  }
  if (!enclosed) ex.state = ex.animalIds.length ? "unsafe" : "draft";
  else ex.state = ex.animalIds.length ? "occupied" : "ready";
  ex.enclosed = enclosed;
  const cap = capacity(ex);
  // An empty exhibit counts water and lava too, so a pool being built for otters or Lava Rays isn't called too small.
  // An empty moth house in the making (a Nectar Feeder inside) counts its floor under a moth's headroom.
  const area = species ? habitatArea(ex, profileOf(ex)) : bees ? habitatArea(ex, HABITAT_PROFILES.bee_garden) : soul ? habitatArea(ex, HABITAT_PROFILES.moth_house) : ex.usableArea + (ex.waterCells ?? 0) + (ex.lavaCells ?? 0);
  // An empty exhibit measured for its walls (an Insect Feeder inside) is a terrarium in the making: sized for a gecko;
  // one with a Nectar Feeder inside, a moth house: sized for a moth; one with a Landing Pad inside (measured for its
  // pads), a hopper's: sized for a hopper.
  const sizeProfile = !species && walls ? HABITAT_PROFILES.terrarium : !species && bees ? HABITAT_PROFILES.bee_garden : !species && soul ? HABITAT_PROFILES.moth_house : !species && hops ? HABITAT_PROFILES.hopper : profileOf(ex);
  if (enclosed && area < requiredArea(sizeProfile, 1)) issues.push(`Too small: needs ${requiredArea(sizeProfile, 1)} usable blocks for one animal, has ${area}.`);
  else if (cap.population > 0 && !cap.fits) issues.push(`Crowded: ${cap.population} animals${cap.mixed ? " of mixed species (a quarter more room)" : ""} need ${cap.required} usable blocks, the exhibit has ${cap.usable}.`);
  ex.issues = issues;
  ex.validatedAt = parkTime();
  db.put(EX, ex);
  db.flush(EX);
  emit("exhibitValidated", { exhibit: ex, result: r });
  return r;
}

// Equipment that sits loose in the exhibit (thrown in, not built in).
const LOOSE = new Set(["toy", "ball", "bone", "skull"]);

function linkFixture(f, exhibitId) {
  if (f.exhibitId !== exhibitId) {
    f.exhibitId = exhibitId;
    saveFixture(f);
  }
  refreshLook(f);
}

// Re-measure exhibits near an edited block (a fence broken while an animal is inside, AC-02).
export function blockChanged(dimensionId, pos) {
  for (const ex of allExhibits()) {
    if (ex.dimension !== dimensionId || !ex.bbox || !ex.seed) continue;
    const b = ex.bbox;
    if (pos.x >= b.min.x - 2 && pos.x <= b.max.x + 2 && pos.z >= b.min.z - 2 && pos.z <= b.max.z + 2 && pos.y >= b.min.y - 3 && pos.y <= b.max.y + 4) pending.add(ex.id);
  }
}

// Called every couple of seconds: run queued revalidations, and re-check occupied exhibits whose area is loaded, each
// about every two minutes (catches explosions, pistons and other non-player edits). A few measurements start each run,
// edits first: the re-checks are spread over the two minutes, so a big park isn't measured all in one tick (0.1.96).
const swept = new Set(); // in `pending` for the re-check only, not for an edit
let sweepAt = 0;
export function serviceValidations() {
  const v = BALANCE.validation;
  let started = 0;
  for (const id of [...pending].sort((a, b) => Number(swept.has(a)) - Number(swept.has(b)))) {
    if (started >= v.startsPerRun) break;
    const ex = getExhibit(id);
    if (!ex) {
      pending.delete(id);
      swept.delete(id);
      continue;
    }
    if (!dim(ex.dimension).isChunkLoaded(ex.seed)) continue; // waits until someone is near
    if (busy(id)) continue; // a measurement already under way finishes first (a fresh one would cut it off)
    swept.delete(id);
    started++;
    const wasState = ex.state;
    validate(id).then((r) => {
      const now = getExhibit(id);
      if (r && now && now.state !== wasState) emit("exhibitStateChanged", { exhibit: now, from: wasState });
    });
  }
  const due = allExhibits().filter((ex) => ex.seed && ex.animalIds.length && dim(ex.dimension).isChunkLoaded(ex.seed));
  for (let k = Math.ceil(due.length / v.sweepRuns); k > 0 && due.length; k--) {
    const ex = due[sweepAt++ % due.length];
    if (pending.has(ex.id) || busy(ex.id)) continue;
    pending.add(ex.id);
    swept.add(ex.id);
  }
}

// --- lookups used by other modules ---

export function exhibitAt(dimensionId, pos) {
  return allExhibits().find((ex) => {
    const b = ex.bbox;
    return ex.dimension === dimensionId && b && pos.x >= b.min.x && pos.x <= b.max.x && pos.z >= b.min.z && pos.z <= b.max.z && pos.y >= b.min.y - 2 && pos.y <= b.max.y + 3;
  });
}

export function nearestExhibit(dimensionId, pos, maxDist = 48) {
  let best, bestD = maxDist * maxDist;
  for (const ex of allExhibits()) {
    if (ex.dimension !== dimensionId) continue;
    const dx = ex.controller.x - pos.x;
    const dz = ex.controller.z - pos.z;
    const d = dx * dx + dz * dz;
    if (d <= bestD) {
      best = ex;
      bestD = d;
    }
  }
  return best;
}

// Every cell of the last measurement (key -> kind), or undefined before the first one since the world
// loaded. Flying animals (animals/flight.js) pick where to glide from it.
export function cellsOf(exId) {
  return cellCache.get(exId);
}

// Where a desert exhibit's floor is shaded (keys "x,y,z" of the cells under trees or a roof), from its last measure:
// where the camels go at midday (0.1.181). Undefined when it hasn't been measured since the world loaded.
export function shadeSpotsOf(exId) {
  return shadeCache.get(exId);
}

// What the animals of an exhibit can reach at `pos` ("land", "water"...), null when they can't
// get there, undefined when the exhibit hasn't been measured since the world loaded.
export function reachableCell(exId, pos) {
  const cells = cellCache.get(exId);
  if (!cells) return undefined;
  return cells.get(key(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z))) ?? null;
}

// `kinds`: where the animal may be let out; Lava Rays also go straight into the lava.
export function isInsideCells(exId, pos, kinds = ["land"]) {
  const cells = cellCache.get(exId);
  return !!cells && kinds.includes(cells.get(key(Math.floor(pos.x), Math.floor(pos.y), Math.floor(pos.z))));
}

// A land cell (or one of `kinds`) close to `near` to release an animal onto.
export function releaseSpot(exId, near, kinds = ["land"]) {
  const cells = cellCache.get(exId);
  if (!cells) return undefined;
  let best, bestD = Infinity;
  for (const [k, kind] of cells) {
    if (!kinds.includes(kind)) continue;
    const [x, y, z] = k.split(",").map(Number);
    const d = (x - near.x) ** 2 + (y - near.y) ** 2 * 4 + (z - near.z) ** 2;
    if (d < bestD) {
      best = { x, y, z };
      bestD = d;
    }
  }
  return best;
}

// --- residents and care, called by animals / transport ---

export function addResident(ex, animalId, speciesId) {
  if (!ex.animalIds.includes(animalId)) ex.animalIds.push(animalId);
  // A new species (the first animal, or a companion species moving in) means measuring its own
  // needs (cover, mud, basking pads, ash, end stone, flight room) right away.
  const ids = ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : []);
  if (!ids.includes(speciesId)) {
    ids.push(speciesId);
    if (ex.seed) pending.add(ex.id);
  }
  ex.speciesIds = ids;
  ex.speciesId = ex.speciesId ?? speciesId;
  if (ex.state === "ready") ex.state = "occupied";
  db.put(EX, ex);
}

export function removeResident(ex, animalId) {
  ex.animalIds = ex.animalIds.filter((id) => id !== animalId);
  // The species list follows the animals left; the lead passes to the next species when its last one goes.
  const left = new Set(ex.animalIds.map((id) => db.get("animals", id)?.speciesId).filter(Boolean));
  ex.speciesIds = (ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : [])).filter((id) => left.has(id));
  ex.speciesId = ex.speciesIds[0];
  if (!ex.animalIds.length) {
    ex.speciesId = undefined;
    ex.speciesIds = [];
    if (ex.state === "occupied") ex.state = "ready";
    if (ex.state === "unsafe") ex.state = "draft";
  }
  db.put(EX, ex);
}

// Breeding settings and progress (animals/nursery.js): { on, goodDays, cooldownUntil, lastDay }.
// Turning it on measures the exhibit again so the shelter gets counted.
export function setBreeding(ex, patch) {
  const wasOn = Boolean(ex.breeding?.on);
  ex.breeding = { ...(ex.breeding ?? {}), ...patch };
  db.put(EX, ex);
  if (!wasOn && ex.breeding.on && ex.seed) pending.add(ex.id);
}

// Parrots danced to a jukebox this park day (0.1.188, animals/parrot.js): music enrichment (animals.js).
export function noteMusic(ex, day) {
  if (ex.musicDay === day) return;
  ex.musicDay = day;
  db.put(EX, ex);
}

export function setCareWarnings(ex, warnings) {
  const same = JSON.stringify(ex.careWarnings) === JSON.stringify(warnings);
  if (same) return;
  ex.careWarnings = warnings;
  db.put(EX, ex);
}

export function dirtied(ex) {
  db.put(EX, ex);
}

export function clean(player, ex) {
  const now = parkTime();
  if (now - ex.lastCleaned < BALANCE.care.rakeCooldown) {
    message(player, "§eThis exhibit was just cleaned. Try again in a moment.");
    return false;
  }
  ex.lastCleaned = now;
  ex.cleanliness = Math.min(100, (ex.cleanliness ?? 100) + BALANCE.care.rakeCleanliness);
  db.put(EX, ex);
  message(player, `§aCleaned ${ex.name}. Cleanliness ${Math.round(ex.cleanliness)}.`);
  emit("careGiven", { player, kind: "clean", exhibit: ex });
  return true;
}

// A keeper rakes the exhibit (staff module): the same clean as the Cleaning Rake.
export function staffClean(ex) {
  ex.lastCleaned = parkTime();
  ex.cleanliness = Math.min(100, (ex.cleanliness ?? 100) + BALANCE.care.rakeCleanliness);
  db.put(EX, ex);
}

// An exhibit left outside the park's edge (0.1.101: a fence closed elsewhere, or a park that has no ground yet). It
// still works for its animals; guests and the paths stop at the edge.
const OUTSIDE = "Outside the park";
function outsideIssue(ex) {
  const park = parkOfRecord(ex) ?? getPark(); // 0.1.114: the exhibit's own park
  const at = ex.seed ?? ex.controller;
  if (!park || park.dimension !== ex.dimension || insideParkColumn(park, at.x, at.z)) return undefined;
  if (parkEdge(park) === "fence") return `${OUTSIDE}: it's beyond the park's Aluminum Fence. Run the fence round it, and guests can reach it again.`;
  return `${OUTSIDE}: the park has no ground until an Aluminum Fence closes round the Park Deed's spot. Fence the park in round it.`;
}

// The park's edge moved: each exhibit's "Outside the park" note is brought up to date (no need to measure again).
function edgeMoved() {
  for (const ex of allExhibits()) {
    const now = outsideIssue(ex);
    const old = ex.issues.find((i) => i.startsWith(OUTSIDE));
    if (now === old) continue;
    const rest = ex.issues.filter((i) => !i.startsWith(OUTSIDE));
    if (now) rest.splice(rest[0]?.startsWith("Controller") ? 1 : 0, 0, now);
    ex.issues = rest;
    db.put(EX, ex);
  }
}

export function initExhibits() {
  on("equipmentChanged", ({ dimension, pos }) => blockChanged(dimension, pos));
  on("parkAreaChanged", edgeMoved);
  info(`exhibits: ${allExhibits().length} loaded`);
}
