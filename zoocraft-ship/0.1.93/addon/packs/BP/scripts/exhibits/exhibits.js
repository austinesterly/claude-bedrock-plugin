import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { emit, on } from "../core/events.js";
import { log } from "../core/log.js";
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
import { allFixtures, saveFixture, refreshLook } from "../equipment/fixtures.js";
import { serves, isWarm, isAnchored } from "../equipment/rules.js";
import { parkTime } from "../park/park.js";
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

const EX = "exhibits";
const DEFAULT_PROFILE = "small_terrestrial";
const jobs = new Map(); // exhibit id -> generation number of the newest validation
const cellCache = new Map(); // exhibit id -> Map of reachable cells from the last validation
const pending = new Set(); // exhibits waiting for a revalidation after nearby edits

export function getExhibit(id) {
  return db.get(EX, id);
}

export function allExhibits() {
  return db.all(EX);
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

// Young (spec section 9) take part of an adult's space.
function spaceWeight(ex) {
  return ex.animalIds.reduce((n, id) => n + (db.get("animals", id)?.juvenile ? BALANCE.breeding.juvenileWeight : 1), 0);
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

// Can this exhibit take one more of `species`? Used before a catch and before a release.
export function fitFor(ex, species) {
  return { cap: capacity(ex, 1, species), problem: mixProblem(speciesIn(ex).map((sp) => sp.id), species, SPECIES) ?? habitatProblem(ex, HABITAT_PROFILES[species.habitatProfile], species.displayName) ?? heatProblem(ex, species) ?? anchorProblem(ex, species) ?? climbProblem(ex, species) };
}

// A climber (raccoons) moves in only where it can't climb out; a gorilla only behind strong walls; a gecko only
// under a roof (its exhibit measured for its walls: an Insect Feeder inside says what it's for); a boar only where no
// wood leads out; a hopper only under a roof (its exhibit measured for its pads: a Landing Pad inside says what it's
// for).
function climbProblem(ex, species) {
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
  const species = leadSpecies(ex);
  const wants = (flag) => anyWants(ex, flag);
  const read = blockReader(dim(ex.dimension), { leaves: true, mud: wants("mud") || wants("nest"), hot: wants("bask"), ash: wants("ash"), end: wants("endGround"), perch: true, grass: wants("graze"), nylium: wants("nylium"), stem: wants("rubStem"), thermalMud: wants("wallow"), substrate: wants("substrate") || wants("mineralBed") || wants("burrows") });
  const opts = { ...EXHIBIT_LIMITS, minHeight: profile.minHeight, coverHeight: wants("cover") || wants("heatShade") || wantsShelter(ex) ? BALANCE.cover.height : 0, countMud: wants("mud"), countShore: wants("nest"), countHot: wants("bask"), countAsh: wants("ash"), countEnd: wants("endGround"), countGrass: wants("graze"), countNylium: wants("nylium"), countStem: wants("rubStem"), countThermalMud: wants("wallow"), countSubstrate: wants("substrate") || wants("mineralBed") || wants("burrows"), swimLava: !species || speciesIn(ex).some(livesOnLava), screenRead: wants("privacy") ? blockReader(dim(ex.dimension), { leaves: true, climb: true }) : undefined };
  // The air is cheap to read, so the flight flood takes bigger slices.
  const airOpts = { ...opts, cellsPerYield: opts.cellsPerYield * 2 };
  return new Promise((resolve) => {
    system.runJob(
      (function* () {
        try {
          if (profile.aerial) {
            yield* floodAerial(read, start, airOpts, out);
            air = out;
            // Soul Moths: the moth house's light on its floor, then its soul lights and host plants.
            if ((wants("nocturnal") || wants("nightLife")) && !out.error) yield* measureHouse(dim(ex.dimension), out, BALANCE, houseLightOf(ex));
            if (wants("soulLight") && !out.error) {
              soul = newMothResult();
              yield* measureMoth(lightReader(dim(ex.dimension)), out.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.moth.plantKeep }, soul);
            }
          } else {
            yield* floodTerrestrial(read, start, opts, out);
            // The nocturnal house (hedgehogs): read the light on the floor once the walk is measured.
            if ((wants("nocturnal") || wants("nightLife")) && !out.error) yield* measureHouse(dim(ex.dimension), out, BALANCE, houseLightOf(ex));
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
              yield* floodClimb(blockReader(dim(ex.dimension), { leaves: true, climb: true }), out.cells, { rise: BALANCE.climb.rise, cellsPerYield: opts.cellsPerYield, full: canopy, nests }, climb);
            }
            // Gorillas: strong walls, and the climbing trees. An empty exhibit too, so a gorilla's release can say.
            if (!out.error && (!species || anyWants(ex, "ape"))) {
              ape = newClimbResult();
              yield* floodApe(blockReader(dim(ex.dimension), { leaves: true, climb: true, ape: true }), out.cells, { rise: BALANCE.climb.rise, reach: BALANCE.gorilla.reach, cellsPerYield: opts.cellsPerYield }, ape);
            }
            // Cinder Boars: does wood (fences, gates, doors) lead out? They break through it. An empty exhibit too, so a
            // boar's release can say.
            if (!out.error && (!species || anyWants(ex, "boarProof"))) {
              boar = newBoarResult();
              yield* floodBoar(blockReader(dim(ex.dimension), { boar: true }), out.cells, { maxDrop: opts.maxDrop, rise: BALANCE.climb.rise, cellsPerYield: opts.cellsPerYield }, boar);
            }
            // Crocodiles: the sunny bank, the shore and what clutters it, shade near the water, sand to nest in.
            if (!out.error && anyWants(ex, "basks")) {
              croc = {};
              const T = BALANCE.croc;
              yield* measureCroc(blockReader(dim(ex.dimension), { croc: true }), out.cells, { bankReach: T.bankReach, sky: T.sky, nestNear: T.nestNear, nestFar: T.nestFar, cellsPerYield: opts.cellsPerYield }, croc);
            }
            // Warped Geckos: does the air lead out (they'd climb out over the top), and how much wall is there to
            // cling to, with how many cracks? An empty exhibit with an Insect Feeder in it too, so a gecko can move in.
            if (!out.error && (anyWants(ex, "clings") || (!species && insectFeederInside(ex, out)))) {
              const room = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.terrarium.minHeight, countEnd: false }, room);
              if (!room.error) {
                walls = { ...newWallsResult(), enclosed: room.enclosed, escape: room.escape, box: room.bbox };
                yield* measureWalls(blockReader(dim(ex.dimension), { leaves: true, gecko: true }), room.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.gecko.crackKeep }, walls);
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
            // Shimmer Snails: the crevices at the foot of the walls that open onto the floor, to rest in (read as the snail
            // reads, gecko and thin: a slab, stairs, a chorus stalk or anything else that doesn't fill its space isn't a
            // wall or a roof; nor leaves).
            if (!out.error && anyWants(ex, "crevices")) {
              crevices = newCreviceResult();
              yield* measureCrevices(blockReader(dim(ex.dimension), { leaves: true, gecko: true, thin: true }), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.snail.creviceKeep }, crevices);
            }
            // Obsidian Crabs: the sides of rock blocks facing onto the floor at its level, to scrape (read as the crab
            // reads, gecko and thin: a slab or stairs of stone, a wall or a fence isn't a rock face).
            if (!out.error && anyWants(ex, "rockFaces")) {
              rock = newRockResult();
              yield* measureRock(blockReader(dim(ex.dimension), { leaves: true, gecko: true, thin: true, rock: true }), out.cells, { cellsPerYield: opts.cellsPerYield, keep: BALANCE.crab.rockKeep }, rock);
            }
            // An empty exhibit with a Void Perch floating inside it is measured for flight as well, so
            // a Void Ray can move in (the perch says what the exhibit is for); one with only Perches (0.1.81), so
            // owls can, with an owl's headroom.
            const inside = !species && !out.error ? perchesInside(ex, out) : undefined;
            if (inside) {
              air = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: inside === "void" ? AERIAL_HEIGHT : ROOST_HEIGHT, countEnd: false }, air);
              air.height = inside === "void" ? AERIAL_HEIGHT : ROOST_HEIGHT;
              if (air.error) air = undefined;
            } else if (!species && !out.error && nectarFeederInside(ex, out)) {
              // A Nectar Feeder in an empty exhibit: a moth house in the making, measured for flight with a moth's
              // headroom and for its soul lights and host plants, so Soul Moths can move in.
              air = newResult(start);
              yield* floodAerial(read, start, { ...airOpts, minHeight: HABITAT_PROFILES.moth_house.minHeight, countEnd: false }, air);
              air.height = HABITAT_PROFILES.moth_house.minHeight;
              if (air.error) air = undefined;
              else {
                soul = newMothResult();
                yield* measureMoth(lightReader(dim(ex.dimension)), air.cells, { cellsPerYield: airOpts.cellsPerYield, keep: BALANCE.moth.plantKeep }, soul);
              }
            }
          }
        } catch (error) {
          out.error = `Validation failed: ${error}`;
          out.done = true;
        }
        if (jobs.get(exId) !== gen) return resolve(undefined); // superseded by a newer edit
        resolve(applyValidation(exId, start, out, air, climb, croc, ape, walls, boar, soul, hops, crevices, rock));
      })(),
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

// The moth measure's reader: a block's id, and its states for a soul light (hanging, put out, on a wall); undefined
// unloaded.
function lightReader(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (!b) return undefined;
      return { id: b.typeId, states: isSoulLight(b.typeId) ? b.permutation.getAllStates() : undefined };
    } catch {
      return undefined;
    }
  };
}

// A Nectar Feeder (Soul Moths) within the walls of a walking measurement, up to its highest floor.
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

function applyValidation(exId, seed, r, air, climb, croc, ape, walls, boar, soul, hops, crevices, rock) {
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
  ex.lowCells = r.lowCeilingCells; // floor under a roof (not leaves) lower than the headroom
  // A flyer's exhibit measured enclosed has a roof over all of it (0.1.81: the flight measure counts no cover, so
  // until then a Void Ray's shelter was 0 and it could never breed).
  ex.coveredCells = anyWants(ex, "cover") || anyWants(ex, "heatShade") || wantsShelter(ex) ? (profileOf(ex).aerial && r.enclosed ? r.usableArea : r.coveredCells) : undefined;
  // Red pandas: is the exhibit in a hot biome (read at the floor where it was measured from)?
  ex.hotBiome = anyWants(ex, "heatShade") ? isHotBiome(biomeAt(dim(ex.dimension), seed), BALANCE.redpanda) : undefined;
  ex.mudCells = anyWants(ex, "mud") ? r.mudCells : undefined;
  ex.nestSites = anyWants(ex, "nest") ? r.shoreMudCells : undefined; // mud right beside the water (flamingos)
  ex.nestSpots = anyWants(ex, "nest") ? r.shoreMud : undefined;
  ex.hotCells = anyWants(ex, "bask") ? r.hotCells : undefined;
  ex.ashCells = anyWants(ex, "ash") ? r.ashCells : undefined;
  ex.endCells = anyWants(ex, "endGround") ? r.endCells : undefined;
  ex.grassCells = anyWants(ex, "graze") ? r.grassCells : undefined; // grass blocks in the floor to graze (zebras)
  ex.nyliumCells = anyWants(ex, "nylium") ? r.nyliumCells : undefined; // crimson nylium in the floor (Crimson Grazers)
  ex.stemCount = anyWants(ex, "rubStem") ? r.stemCount : undefined; // crimson stems beside the floor to rub on
  ex.thermalMudCells = anyWants(ex, "wallow") ? r.thermalMudCells : undefined; // Thermal Mud in the floor to wallow in (Cinder Boars)
  ex.substrateCells = anyWants(ex, "substrate") || anyWants(ex, "mineralBed") || anyWants(ex, "burrows") ? r.substrateCells : undefined; // Mineral Substrate in the floor to bury themselves in (Quartz Beetles), to graze and lay in (Shimmer Snails), to dig their burrows in (Obsidian Crabs)
  ex.screenCells = anyWants(ex, "privacy") ? r.screenCells : undefined; // screened floor blocks (tigers)
  ex.screenSpots = anyWants(ex, "privacy") ? r.screens : undefined;
  ex.house = anyWants(ex, "nocturnal") || anyWants(ex, "nightLife") ? r.house : undefined; // the nocturnal house (hedgehogs): enclosed from daylight and dim (animals/nightRules.js)
  // Crocodiles: the sunny basking bank, the shore ring and its clutter, shade near the water, sand to nest in.
  for (const k of ["sunBankCells", "sunBankSpots", "shoreCells", "shoreBlocked", "shoreSpots", "shadeSpots", "sandSites", "sandSpots"]) ex[k] = croc ? croc[k] : undefined;
  const flying = Boolean(profileOf(ex).aerial);
  ex.flightCells = air ? air.flightCells : undefined;
  // The flight measurement (see the note at the top): what a flying species would find here.
  ex.aerial = air ? { enclosed: air.enclosed, usableArea: air.usableArea, lowCells: air.lowCeilingCells, escape: air.escape, perchCount: 0, roostCount: 0, height: air.height ?? profileOf(ex).minHeight } : undefined;
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
  cellCache.set(ex.id, r.cells);

  const issues = [];
  if (ex.controllerMissing) issues.push("Controller missing: place a new Exhibit Controller nearby to reconnect.");
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
  if (r.lowCeilingCells > 0 && r.usableArea === 0) issues.push(flying ? `The roof is too low: the animals need ${profileOf(ex).minHeight} blocks of air over the floor.` : "The ceiling is too low for animals here.");

  // Feeders: only ones the animals can actually reach count (AC-03). A Thermal Feeder is reached
  // from the lava, so it stands at the edge of the lava pool; a Hay Rack from the floor a block below
  // it (hung on the fence) or level with it.
  const inBox = (p) => r.bbox && p.x >= r.bbox.min.x - 1 && p.x <= r.bbox.max.x + 1 && p.z >= r.bbox.min.z - 1 && p.z <= r.bbox.max.z + 1 && p.y >= r.bbox.min.y - 2 && p.y <= r.bbox.max.y + 2;
  const linked = [];
  for (const f of allFeeders()) {
    if (f.dimension !== ex.dimension) continue;
    const boxed = inBox(f.pos);
    if (boxed && isReachable(r.cells, f.pos, f.thermal ? "lava" : "land", f.rack ? [-1, 0] : undefined)) {
      const other = f.exhibitId && f.exhibitId !== ex.id && getExhibit(f.exhibitId);
      if (other && other.feederIds.includes(f.id)) {
        issues.push(`The feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} already belongs to ${other.name}.`);
        continue;
      }
      linked.push(f.id);
      linkFeeder(f, ex.id);
    } else {
      if (boxed) issues.push(f.thermal ? `The Thermal Feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} must stand at the edge of the lava pool, level with the lava.` : f.rack ? `The Hay Rack at ${f.pos.x} ${f.pos.y} ${f.pos.z} can't be reached by the animals: hang it on the fence a block above their floor, or stand it on the floor, beside open ground.` : `The feeder at ${f.pos.x} ${f.pos.y} ${f.pos.z} can't be reached by the animals.`);
      if (f.exhibitId === ex.id) linkFeeder(f, undefined);
    }
  }
  ex.feederIds = linked;
  if (!linked.length) issues.push(SPECIES[ex.speciesId]?.lavaSwimmer ? "No reachable feeder: place a Thermal Feeder at the edge of the lava pool, level with the lava." : `No reachable feeder: place ${SPECIES[ex.speciesId]?.nectarFeeder ? "a Nectar Feeder" : SPECIES[ex.speciesId]?.mineralFeeder ? "a Mineral Feeder" : SPECIES[ex.speciesId]?.insectFeeder ? "an Insect Feeder" : SPECIES[ex.speciesId]?.browsesHigh ? "an Elevated Browse Feeder" : SPECIES[ex.speciesId]?.rack ? "a Basic Feeder or a Hay Rack" : "a Basic Feeder"} inside, next to open ground.`);

  // Other equipment: troughs, baskets and filters serve the exhibit their position fits (see
  // equipment/rules.js); a toy, ball, Blaze Bone or Wither Skull Ball belongs to the exhibit it was put in.
  // Void Perches are found by the flight measurement (the air over and under them).
  const airBox = (p) => air?.bbox && p.x >= air.bbox.min.x - 1 && p.x <= air.bbox.max.x + 1 && p.z >= air.bbox.min.z - 1 && p.z <= air.bbox.max.z + 1 && p.y >= air.bbox.min.y - 1 && p.y <= air.bbox.max.y + 1;
  const fixtureIds = [];
  let perchCount = 0;
  const roosts = []; // the Perches (owls) linked: their records
  for (const f of allFixtures()) {
    if (f.dimension !== ex.dimension || f.type === "station") continue;
    const loose = LOOSE.has(f.type);
    const mine = loose ? f.exhibitId === ex.id : f.type === "pad" ? hopPads.has(f.id) : f.type === "perch" || f.type === "roost" ? Boolean(air) && airBox(f.pos) && serves(f.type, air.cells, f.pos) : f.type === "holding" ? inBox(f.pos) && denServes(r.cells, f) : f.type === "nest" ? treeNests.has(f.id) || (inBox(f.pos) && serves(f.type, r.cells, f.pos)) : inBox(f.pos) && serves(f.type, r.cells, f.pos);
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

  const enclosed = (r.enclosed || (airlock && !r.escape)) && (r.usableArea > 0 || r.lavaCells > 0) && !climbsOut && !apesOut && !wallsOut && !boarsOut && !hopsOut;
  const species = leadSpecies(ex);
  // Every resident species gets its own habitat check (a shared wetland still needs its pool).
  for (const sp of speciesIn(ex)) {
    const problem = habitatProblem(ex, HABITAT_PROFILES[sp.habitatProfile], sp.displayName);
    if (problem && !issues.includes(problem)) issues.push(problem);
  }
  if (!enclosed) ex.state = ex.animalIds.length ? "unsafe" : "draft";
  else ex.state = ex.animalIds.length ? "occupied" : "ready";
  ex.enclosed = enclosed;
  const cap = capacity(ex);
  // An empty exhibit counts water and lava too, so a pool being built for otters or Lava Rays isn't called too small.
  // An empty moth house in the making (a Nectar Feeder inside) counts its floor under a moth's headroom.
  const area = species ? habitatArea(ex, profileOf(ex)) : soul ? habitatArea(ex, HABITAT_PROFILES.moth_house) : ex.usableArea + (ex.waterCells ?? 0) + (ex.lavaCells ?? 0);
  // An empty exhibit measured for its walls (an Insect Feeder inside) is a terrarium in the making: sized for a gecko;
  // one with a Nectar Feeder inside, a moth house: sized for a moth; one with a Landing Pad inside (measured for its
  // pads), a hopper's: sized for a hopper.
  const sizeProfile = !species && walls ? HABITAT_PROFILES.terrarium : !species && soul ? HABITAT_PROFILES.moth_house : !species && hops ? HABITAT_PROFILES.hopper : profileOf(ex);
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

// Called every couple of seconds: run queued revalidations, and now and then re-check occupied
// exhibits whose area is loaded (catches explosions, pistons and other non-player edits).
let sweepCounter = 0;
export function serviceValidations() {
  for (const id of [...pending]) {
    const ex = getExhibit(id);
    if (!ex) {
      pending.delete(id);
      continue;
    }
    if (!dim(ex.dimension).isChunkLoaded(ex.seed)) continue; // waits until someone is near
    const wasState = ex.state;
    validate(id).then((r) => {
      const now = getExhibit(id);
      if (r && now && now.state !== wasState) emit("exhibitStateChanged", { exhibit: now, from: wasState });
    });
  }
  if (++sweepCounter % 60 === 0) {
    for (const ex of allExhibits()) if (ex.seed && ex.animalIds.length && dim(ex.dimension).isChunkLoaded(ex.seed)) pending.add(ex.id);
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

export function initExhibits() {
  on("equipmentChanged", ({ dimension, pos }) => blockChanged(dimension, pos));
  log(`exhibits: ${allExhibits().length} loaded`);
}
