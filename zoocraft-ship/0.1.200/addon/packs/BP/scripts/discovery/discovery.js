import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, speciesForWild, speciesForEntity, speciesForMob, pluralOf, livesOnLava } from "../data/species.js";
import { CALM_TYPES } from "../animals/mobRules.js";
import { memberOfAny, parksOf, allParks, withPark } from "../park/park.js";
import { allAnimals } from "../animals/animals.js";
import { info, log } from "../core/log.js";
import { BLOCKS, CLEAR_LAVA_FLOWING } from "../data/items.js";
import { onlinePlayers, message, blockReader } from "../platform/mc.js";
import { LEVELS, TASKS, levelOf, tasksSeen, watch, alongSight, bestLevels, wildTasks } from "./rules.js";
import { cellsAlong } from "../animals/glide.js";
import { blocksView } from "../data/blocks.js";
import { pandaSeen } from "../animals/bambooRules.js";
import { ACT, CLIMBING_ACTS } from "../animals/climbRules.js";
import { ACT as FLAMINGO_ACT, DISPLAY_ACTS } from "../animals/flamingoRules.js";
import { ACT as ZEBRA_ACT } from "../animals/zebraRules.js";
import { ACT as LION_ACT } from "../animals/lionRules.js";
import { ACT as TIGER_ACT } from "../animals/tigerRules.js";
import { ACT as CROC_ACT } from "../animals/crocRules.js";
import { ACT as PANDA_ACT } from "../animals/pandaRules.js";
import { ACT as SHARK_ACT } from "../animals/sharkRules.js";
import { ACT as RAY_ACT } from "../animals/rayRules.js";
import { ACT as CATFISH_ACT } from "../animals/catfishRules.js";
import { ACT as MANATEE_ACT } from "../animals/manateeRules.js";
import { ACT as GORILLA_ACT } from "../animals/gorillaRules.js";
import { ACT as OWL_ACT } from "../animals/owlRules.js";
import { ACT as GRAZER_ACT } from "../animals/grazerRules.js";
import { ACT as GECKO_ACT, POSE as GECKO_POSE } from "../animals/geckoRules.js";
import { ACT as BOAR_ACT } from "../animals/boarRules.js";
import { ACT as MOTH_ACT } from "../animals/mothRules.js";
import { ACT as BEETLE_ACT } from "../animals/beetleRules.js";
import { ACT as HOPPER_ACT } from "../animals/hopperRules.js";
import { ACT as SNAIL_ACT } from "../animals/snailRules.js";
import { ACT as CRAB_ACT } from "../animals/crabRules.js";
import { ACT as CHORUS_MOTH_ACT } from "../animals/chorusMothRules.js";
import { gatheringAt } from "../animals/beeRules.js";
import { heardLately, HEARD } from "../animals/parrotRules.js";
import { TRUSTS, SITTING } from "../animals/catRules.js";
import { STATE as ARMADILLO_STATE, WILD_STATE as WILD_ARMADILLO_STATE, isRolledUp, isPeeking } from "../animals/armadilloRules.js";
import { ACT as SNIFFER_ACT, isScenting, isDigging as isSnifferDigging } from "../animals/snifferRules.js";
import { DECOR as LLAMA_DECOR } from "../animals/llamaRules.js";
import { ROOST as BAT_ROOST, BODY_HEIGHT as BAT_HEIGHT, wildResting } from "../animals/batRules.js";
import { HOLDING as ALLAY_HOLDING } from "../animals/allayRules.js";
import { CHEST as GOLEM_CHEST, WILD_CHEST } from "../animals/golemRules.js";
import { CAN_MOVE as GHAST_CAN_MOVE, WILD_CAN_MOVE as WILD_GHAST_CAN_MOVE, floating as ghastFloats } from "../animals/ghastRules.js";
import { BLOCK as CUBE_BLOCK, WILD_BLOCK as WILD_CUBE_BLOCK, holdsBlock, hopping as cubeHops } from "../animals/sulfurCubeRules.js";
import { ACT as STARBACK_ACT } from "../animals/starbackRules.js";
import { ACT as OKAPI_ACT } from "../animals/okapiRules.js";
import { ACT as MOLEBEAR_ACT } from "../animals/molebearRules.js";
import { ACT as SKULKER_ACT } from "../animals/skulkerRules.js";
import { ACT as UNICORN_ACT } from "../animals/unicornRules.js";
import { ACT as STAG_ACT } from "../animals/glowhornRules.js";
import { YETI_ACT, ZOO_YETI } from "../animals/bossRules.js";
import { ACT as PADDOCK_ACT } from "../animals/paddockRules.js";
import { ACT as GOAT_ACT } from "../animals/goatRules.js";
import { isKneeling } from "../animals/camel.js";
import { isAshore, isLaying } from "../animals/turtle.js";
import { onPad, isLeaping } from "../animals/frogRules.js";
import { walkingOnBottom } from "../animals/axolotlRules.js";
import { leaping, swimmingAlongside } from "../animals/dolphinRules.js";
import { dolphinLeaping } from "../animals/dolphin.js";
import { SLOTH_ACT, SLOTH_HANGING, ZOO_SLOTH } from "../animals/slothRules.js";
import { DRAKE_ACT, ZOO_DRAKE } from "../animals/babyDragonRules.js";
import { ACT as DRAGON_ACT } from "../animals/dragonRules.js";
import { ACT as GRIFFIN_ACT } from "../animals/griffinRules.js";

const TIGER_MARK = [TIGER_ACT.spray, TIGER_ACT.rub, TIGER_ACT.claw, TIGER_ACT.scrape];

const LION_DOWN = [LION_ACT.lie, LION_ACT.sleep, LION_ACT.sleepBack];
const LION_SCENT = [LION_ACT.sniff, LION_ACT.flehmen, LION_ACT.spray, LION_ACT.scrape, LION_ACT.claw];

// Field Journal (spec sections 4 and 8). Park members fill it in by looking at animals: a few
// seconds of watching one, wild or in a zoo, does a task. A species has to be "ready to move"
// before a wild one can be caught. 0.1.117 (Austin: "Field journals should be individual unlocks"): the journal is
// each player's own. One record a player and species in the "discovery" collection, id "<player id>:<species id>"
// (the record carries both apart too), and it goes with the player to any park. What a park knows (parkLevels) is the
// best any of its members knows: the park's quests and conservation programme read that; catching, releasing and the
// Research Desk's locks read the player's own.

const DISC = "discovery";
const JOURNAL_V = 2; // players record journalV: the journal version whose first-join grandfathering the player has had
const RANGE = 24; // blocks: how far a player can watch an animal from
const STEP = 0.5; // seconds between looks (the loop runs every 10 ticks)
const HERD_RANGE = 8; // blocks: another of its kind this close counts as its herd
const progress = new Map(); // "player|species|task" -> seconds watched without a break

/** @param {{ id: string } | string} player a player, or a player id */
const idOf = (player) => (typeof player === "string" ? player : player.id);

function recordOf(playerId, speciesId) {
  const id = `${playerId}:${speciesId}`;
  return db.get(DISC, id) ?? { id, player: playerId, species: speciesId, done: [] };
}

/** @param {{ id: string } | string} player */
export function levelFor(player, speciesId) {
  const species = SPECIES[speciesId];
  return species ? levelOf(species, recordOf(idOf(player), speciesId).done) : 0;
}

/** The player's journal: species id -> level. @param {{ id: string } | string} player */
export function levels(player) {
  return Object.fromEntries(Object.keys(SPECIES).map((id) => [id, levelFor(player, id)]));
}

/** The park's journal: the best level any of its members has reached, by species id. */
export function parkLevels(park) {
  return bestLevels(Object.keys(SPECIES), Object.keys(park?.members ?? {}).map((pid) => levels(pid)));
}

/** @param {{ id: string } | string} player */
export function doneTasks(player, speciesId) {
  return recordOf(idOf(player), speciesId).done;
}

/** @param {{ id: string } | string} player */
export function canMove(player, speciesId) {
  return levelFor(player, speciesId) >= 3;
}

// Why a wild one can't be moved yet, with what's left to watch.
export function notReadyText(player, species) {
  const done = doneTasks(player, species.id);
  const left = wildTasks(species).filter((t) => !done.includes(t)).map((t) => TASKS[t].text.toLowerCase()); // a wild one's (0.1.193)
  return `You don't know ${pluralOf(species).toLowerCase()} well enough to move one safely yet. Field Journal: ${left.join("; ")}. Look at one for a few seconds to fill it in.`;
}

function complete(speciesId, task, player) {
  const rec = recordOf(player.id, speciesId);
  if (rec.done.includes(task)) return;
  const species = SPECIES[speciesId];
  const before = levelOf(species, rec.done);
  rec.done = [...rec.done, task];
  db.put(DISC, rec);
  const after = levelOf(species, rec.done);
  const left = (species.observe ?? []).filter((t) => !rec.done.includes(t));
  const next = left.length ? ` §7Next: ${TASKS[left[0]].text.toLowerCase()}.` : "";
  const level = after > before ? ` §fNow: §b${LEVELS[after]}${after === 3 ? " (you can catch one now)" : ""}.` : "";
  message(player, `§bField Journal: §fYou ${TASKS[task].done}: ${species.displayName}.${level}${next}`);
}

// Standing still: barely moving sideways (grazing, or looking about).
function isStill(entity) {
  try {
    const v = entity.getVelocity();
    return Math.hypot(v.x, v.z) < 0.02;
  } catch {
    return false;
  }
}

// Another of its kind (wild or in a zoo) within HERD_RANGE blocks.
function hasHerd(entity, family) {
  try {
    return entity.dimension.getEntities({ location: entity.location, maxDistance: HERD_RANGE, families: [family] }).some((e) => e.id !== entity.id);
  } catch {
    return false;
  }
}

// The block an animal stands on (magma for basking Basalt Tortoises and resting Striders, soul soil for prowling Ember Foxes).
function groundOf(entity) {
  try {
    const l = entity.location;
    return entity.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y - 0.2), z: Math.floor(l.z) })?.typeId;
  } catch {
    return undefined;
  }
}
const MAGMA = new Set(["minecraft:magma", "minecraft:magma_block"]);
const SOUL = new Set(["minecraft:soul_soil", "minecraft:soul_sand"]);
const LAVA = new Set(["minecraft:lava", "minecraft:flowing_lava", BLOCKS.clearLava, ...CLEAR_LAVA_FLOWING]);

// Is the animal in lava (a Lava Ray gliding or drifting, a Strider walking across)? Its body or just under it is lava.
function inLava(entity) {
  try {
    const l = entity.location;
    for (const dy of [0, -0.5]) {
      if (LAVA.has(entity.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y + dy), z: Math.floor(l.z) })?.typeId)) return true;
    }
  } catch {
    // unloaded
  }
  return false;
}

// A Lava Ray in a Clear Lava pool: Clear Lava is a block, not a liquid, so the game's view raycast can
// stop at the pool's surface and never reach the ray inside. When the raycast finds nothing, walk the
// line of sight ourselves (rules.js alongSight): the first lava-living animal within a block of the
// line, with nothing but air and lava in the way.
function throughLava(player) {
  try {
    const d = player.dimension;
    const from = player.getHeadLocation();
    const near = d
      .getEntities({ location: from, maxDistance: RANGE })
      .filter((e) => e.id !== player.id && livesOnLava(speciesForWild(e.typeId) ?? speciesForEntity(e.typeId)))
      .map((e) => ({ id: e.id, x: e.location.x, y: e.location.y, z: e.location.z, entity: e }));
    if (!near.length) return undefined;
    const cells = cellsAlong(from, player.getViewDirection(), RANGE, 0.25).map((c) => {
      const b = d.getBlock(c);
      return { ...c, open: Boolean(b && (b.isAir || LAVA.has(b.typeId))) };
    });
    const id = alongSight(cells, near);
    return near.find((a) => a.id === id)?.entity;
  } catch {
    return undefined;
  }
}

// Behind glass (0.1.192): the game's view raycast stops at the first block it meets, glass too, so an animal watched
// through an exhibit's glass front was never seen (the test server: from the path the Sniffers' journal stayed empty,
// inside the paddock all three tasks ticked). When the raycast and the lava walk find nothing, walk the line of sight
// ourselves (rules.js alongSight): the first animal the journal knows within a block of the line, with nothing in the way
// that hides it (data/blocks.js blocksView: glass, bars, fences, water and Clear Lava don't). The blocks are read one by
// one up to the first that hides, so a look at the ground reads a few.
function* openCells(d, cells) {
  for (const c of cells) {
    const b = d.getBlock(c);
    yield { ...c, open: Boolean(b && (b.isAir || b.isLiquid || LAVA.has(b.typeId) || !blocksView(b.typeId, { isAir: false, isLiquid: false }))) };
  }
}

function throughGlass(player) {
  try {
    const d = player.dimension;
    const from = player.getHeadLocation();
    const near = d
      .getEntities({ location: from, maxDistance: RANGE })
      .filter((e) => e.id !== player.id && Boolean(speciesForWild(e.typeId) ?? speciesForEntity(e.typeId) ?? speciesForMob(e.typeId)))
      .map((e) => ({ id: e.id, x: e.location.x, y: e.location.y, z: e.location.z, entity: e }));
    if (!near.length) return undefined;
    const id = alongSight(openCells(d, cellsAlong(from, player.getViewDirection(), RANGE, 0.25)), near);
    return near.find((a) => a.id === id)?.entity;
  } catch {
    return undefined;
  }
}

// Flyers (Void Rays): gliding toward somewhere, and the loop the loop, as animals/flight.js tells the
// client through the entity's properties. (Owls and the moths have their own acts: owlSight, mothSight,
// chorusMothSight.)
/** @returns {{ flying?: boolean, looping?: boolean }} */
function flightSight(species, hit) {
  if (!species.flies || species.roosts || species.soulLight || species.chorusFlowers || species.warmth || species.beeGarden || species.dances || species.batRoost) return {}; // bees (0.1.187): beeSight; parrots (0.1.188): parrotSight
  if (species.hoard || species.boss) return {}; // Griffins (0.1.151) and Baby Dragons (0.1.162) have their own acts: griffinSight, drakeSight
  try {
    return { flying: hit.getProperty("zoocraft:gliding") === true, looping: hit.getProperty("zoocraft:looping") === true };
  } catch {
    return {};
  }
}

// Rift Ferrets: the blink just made and standing up to peer about, as animals/rift.js tells the client
// through the entity's properties.
/** @returns {{ blinking?: boolean, peering?: boolean }} */
function riftSight(species, hit) {
  if (!species.anchor) return {};
  try {
    return { blinking: hit.getProperty("zoocraft:rifted") === true, peering: hit.getProperty("zoocraft:peering") === true };
  } catch {
    return {};
  }
}

// Nocturnal animals (hedgehogs): asleep or curled into a ball, as animals/night.js tells the client
// through the entity's properties.
/** @returns {{ awake?: boolean, curled?: boolean }} */
function nightSight(species, hit) {
  if (!species.nocturnal) return {};
  try {
    const asleep = hit.getProperty("zoocraft:asleep") === true;
    return { awake: !asleep, curled: hit.getProperty("zoocraft:curled") === true };
  } catch {
    return {};
  }
}

// Climbers (raccoons): up a trunk or a frame, or washing at the water, as animals/raccoon.js tells the
// client through the entity's zoocraft:act property. (Red pandas have their own acts: pandaSight.)
/** @returns {{ climbing?: boolean, washing?: boolean }} */
function climbSight(species, hit) {
  if (!species.climbs || species.canopy) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { climbing: CLIMBING_ACTS.includes(act), washing: act === ACT.wash };
  } catch {
    return {};
  }
}

// Flamingos: filter feeding, resting on one leg or displaying, as animals/flamingo.js tells the client
// through the entity's zoocraft:act property.
/** @returns {{ filtering?: boolean, oneLeg?: boolean, displaying?: boolean }} */
function flamingoSight(species, hit) {
  if (!species.wades) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { filtering: act === FLAMINGO_ACT.feed, oneLeg: act === FLAMINGO_ACT.rest, displaying: DISPLAY_ACTS.includes(act) };
  } catch {
    return {};
  }
}

// Zebras: grazing, walking in single file or grooming, as animals/zebra.js tells the client through the
// entity's zoocraft:act property.
/** @returns {{ grazing?: boolean, inFile?: boolean, grooming?: boolean }} */
function zebraSight(species, hit) {
  if (!species.harem) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { grazing: act === ZEBRA_ACT.graze, inFile: act === ZEBRA_ACT.file, grooming: act === ZEBRA_ACT.groom };
  } catch {
    return {};
  }
}

// Horses and donkeys (0.1.175): a zoo one grazes with its head down while animals/paddock.js says so (zoocraft:act); a wild
// one standing still on the ground counts as grazing, as the farmyard's. One object type, not a union of two: the
// sight's spread of some forty of these overflows the type checker's cache with one more union.
/** @returns {{ grazing?: boolean }} */
function paddockSight(species, hit) {
  if (!species.run || hit.typeId !== species.entityType) return {};
  try {
    return { grazing: hit.getProperty("zoocraft:act") === PADDOCK_ACT.graze };
  } catch {
    return {};
  }
}

// Goats (0.1.180): a zoo one in a leap or on a ledge looking out as animals/goat.js tells the client (zoocraft:act); a
// wild one off the ground and rising fast (the game's own leap: a step's jump starts slower). One object type for both
// branches (see paddockSight).
/** @returns {{ goatLeaping?: boolean }} */
function goatSight(species, hit) {
  if (!species.rockLedges) return {};
  try {
    if (hit.typeId !== species.entityType) return { goatLeaping: !hit.isOnGround && !hit.isInWater && hit.getVelocity().y > 0.5 };
    const act = hit.getProperty("zoocraft:act");
    return { goatLeaping: act === GOAT_ACT.leap || act === GOAT_ACT.perch };
  } catch {
    return {};
  }
}

// Camels (0.1.181): kneeling, by the game's own sitting (its events, heard by animals/camel.js) or a zoo one's rest or dust
// bath (zoocraft:act). One object type for both branches (see paddockSight).
/** @returns {{ camelKneeling?: boolean }} */
function camelSight(species, hit) {
  if (!species.desert && !species.kneels) return {}; // and the camel husk (0.1.198)
  return { camelKneeling: isKneeling(hit) };
}

// Sea turtles (0.1.183): up on the sand out of the water, and a female digging her nest (a zoo one at act 2, a wild one
// between the game's own go_lay_egg and laid_egg, heard by animals/turtle.js). One object type for both branches.
/** @returns {{ turtleAshore?: boolean, turtleLaying?: boolean }} */
function turtleSight(species, hit) {
  if (!species.seaTurtle) return {};
  return { turtleAshore: isAshore(hit), turtleLaying: isLaying(hit) };
}

// Frogs (0.1.184): sitting on a lily pad or big dripleaf (the block its feet are in, or the one under them), and a leap (up
// off the ground, not in the water, rising). The same for a wild one and a zoo one. One object type for both branches.
/** @returns {{ frogOnPad?: boolean, frogLeaping?: boolean }} */
function frogSight(species, hit) {
  if (!species.lilyPads) return {};
  try {
    const p = hit.location;
    const at = { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
    const feet = hit.dimension.getBlock(at)?.typeId;
    const below = hit.dimension.getBlock({ x: at.x, y: at.y - 1, z: at.z })?.typeId;
    return { frogOnPad: hit.isOnGround && onPad(feet, below), frogLeaping: isLeaping(hit.isOnGround, hit.isInWater, hit.getVelocity().y, BALANCE.frog) };
  } catch {
    return {};
  }
}

// Axolotls (0.1.185): walking along the bottom (on the floor under the water, moving across it). The same for a wild one
// and a zoo one. One object type for both branches.
/** @returns {{ axolotlBottom?: boolean }} */
function axolotlSight(species, hit) {
  if (!species.waterPlants) return {};
  try {
    const v = hit.getVelocity();
    return { axolotlBottom: walkingOnBottom(hit.isOnGround, hit.isInWater, v.x, v.z, BALANCE.axolotl) };
  } catch {
    return {};
  }
}

// Dolphins (0.1.186): a leap (out of the water over water, rising) and swimming alongside a swimming player (within a few
// blocks, moving). The same for a wild one and a zoo one. One object type for both branches.
/** @returns {{ dolphinLeap?: boolean, dolphinAlongside?: boolean }} */
function dolphinSight(species, hit) {
  if (!species.deepPool) return {};
  try {
    const T = BALANCE.dolphin;
    const v = hit.getVelocity();
    const l = hit.location;
    const d = hit.dimension;
    const at = (dy) => d.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y) - dy, z: Math.floor(l.z) })?.typeId;
    const waterBelow = at(1) === "minecraft:water" || at(2) === "minecraft:water";
    const near = d.getPlayers({ location: l, maxDistance: T.alongside }).some((p) => p.isInWater);
    return {
      dolphinLeap: dolphinLeaping(hit.id) || leaping(hit.isInWater, hit.isOnGround, v.y, waterBelow, T), // a zoo dolphin leaps by the script (animals/dolphin.js)
      dolphinAlongside: swimmingAlongside(near ? 0 : Infinity, near, Math.hypot(v.x, v.z), T),
    };
  } catch {
    return {};
  }
}

// Bees (0.1.187): sitting in a flower (the game's bee sits in the flower's block while it gathers), and carrying nectar
// (the game's own property, pollen drawn on its back). Wild and zoo ones alike.
// Ocelots and cats (0.1.189): one that trusts people, one sitting still on a seat (the zoo copies' own properties; the
// game's own cat and ocelot have neither for a script to read).
/** @returns {{ catTrusts?: boolean, catSitting?: boolean }} */
function catSight(species, hit) {
  if (!species.restSpots || hit.typeId !== species.entityType) return {};
  try {
    return { catTrusts: hit.getProperty(TRUSTS) === true, catSitting: hit.getProperty(SITTING) === true && isStill(hit) };
  } catch {
    return {};
  }
}

// Armadillos (0.1.190): rolled up, and peeking out (the copy's state property, or the game's own on a wild one).
/** @returns {{ rolledUp?: boolean, peeking?: boolean }} */
function armadilloSight(species, hit) {
  if (!species.rollsUp) return {};
  try {
    const state = hit.getProperty(hit.typeId === species.entityType ? ARMADILLO_STATE : WILD_ARMADILLO_STATE);
    return { rolledUp: isRolledUp(state), peeking: isPeeking(state) };
  } catch {
    return {};
  }
}

// Sniffers (0.1.192): sniffing out a spot and digging (a zoo one's own property; the game's has none to read).
/** @returns {{ snifferScenting?: boolean, snifferDigging?: boolean }} */
function snifferSight(species, hit) {
  if (!species.digBed || hit.typeId !== species.entityType) return {};
  try {
    const act = hit.getProperty(SNIFFER_ACT);
    return { snifferScenting: isScenting(act), snifferDigging: isSnifferDigging(act) };
  } catch {
    return {};
  }
}

// Bats (0.1.194): hanging (a zoo one's own property; a wild one resting by the game's engine: still in the air under a
// block it can hang from). Allays: holding an item someone gave it (a zoo one's own property).
/** @returns {{ batHanging?: boolean, allayHolding?: boolean }} */
function batAllaySight(species, hit) {
  if (!species.batRoost && !species.duplicates) return {};
  try {
    if (species.duplicates) return { allayHolding: hit.typeId === species.entityType && hit.getProperty(ALLAY_HOLDING) === true };
    if (hit.typeId === species.entityType) return { batHanging: hit.getProperty(BAT_ROOST) === true };
    const l = hit.location;
    const above = blockReader(hit.dimension, { climb: true, leaves: true, gecko: true })(Math.floor(l.x), Math.floor(l.y + BAT_HEIGHT + 0.05), Math.floor(l.z));
    return { batHanging: wildResting(isStill(hit), hit.isOnGround, above) };
  } catch {
    return {};
  }
}

// Golems (0.1.195): an iron golem walking; a snow golem walking in the snow layer it leaves; a copper golem opening a
// chest (the game's chest_interaction: the zoo copy's own property, or the wild one's).
/** @returns {{ golemWalking?: boolean, snowTrailing?: boolean, chestSorting?: boolean }} */
function golemSight(species, hit) {
  if (!species.built) return {};
  try {
    if (species.built === "iron") return { golemWalking: !isStill(hit) && hit.isOnGround };
    if (species.built === "snow") {
      const l = hit.location;
      const at = hit.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y), z: Math.floor(l.z) });
      return { snowTrailing: !isStill(hit) && at?.typeId === "minecraft:snow_layer" };
    }
    const c = hit.getProperty(hit.typeId === species.entityType ? GOLEM_CHEST : WILD_CHEST);
    return { chestSorting: typeof c === "string" && c !== "none" };
  } catch {
    return {};
  }
}

// Happy ghasts (0.1.196): one floating about (any movement: they're slow), or held still under someone on its back (its
// can_move: the zoo copy's own property, or the wild one's).
/** @returns {{ ghastFloating?: boolean, ghastHeld?: boolean }} */
function ghastSight(species, hit) {
  if (!species.hatched) return {};
  try {
    const held = hit.getProperty(hit.typeId === species.entityType ? GHAST_CAN_MOVE : WILD_GHAST_CAN_MOVE) === false;
    return { ghastFloating: !held && ghastFloats(hit.getVelocity()), ghastHeld: held };
  } catch {
    return {};
  }
}

// Sulfur cubes (0.1.197): one hopping about with no block in it, or one holding a block (its property: the zoo copy's own,
// or the wild one's).
/** @returns {{ cubeHopping?: boolean, cubeHolding?: boolean }} */
function cubeSight(species, hit) {
  if (!species.absorbs) return {};
  try {
    const holding = holdsBlock(hit.getProperty(hit.typeId === species.entityType ? CUBE_BLOCK : WILD_CUBE_BLOCK));
    return { cubeHopping: !holding && cubeHops(hit.getVelocity()), cubeHolding: holding };
  } catch {
    return {};
  }
}

// Llamas (0.1.193): one wearing a carpet (a zoo one's own property), and a wild trader llama on its wandering trader's lead.
/** @returns {{ llamaDressed?: boolean, traderLed?: boolean }} */
function llamaSight(species, hit) {
  if (!species.decor) return {};
  try {
    if (hit.typeId === species.entityType) return { llamaDressed: Number(hit.getProperty(LLAMA_DECOR) ?? 0) > 0 };
    const lead = hit.getComponent("minecraft:leashable");
    return { traderLed: Boolean(lead?.isLeashed && lead.leashHolder?.typeId === "minecraft:wandering_trader") };
  } catch {
    return {};
  }
}

// Parrots (0.1.188): dancing (the zoo copy's own property), and one that imitated a monster a moment ago.
/** @returns {{ parrotDancing?: boolean, parrotHeard?: boolean }} */
function parrotSight(species, hit) {
  if (!species.dances) return {};
  try {
    return { parrotDancing: hit.getProperty("zoocraft:dancing") === true, parrotHeard: heardLately(hit.getDynamicProperty(HEARD), Date.now(), BALANCE.parrot) };
  } catch {
    return {};
  }
}

/** @returns {{ beeInFlower?: boolean, beeNectar?: boolean }} */
function beeSight(species, hit) {
  if (!species.beeGarden) return {};
  try {
    const l = hit.location;
    const id = hit.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y), z: Math.floor(l.z) })?.typeId;
    return { beeInFlower: gatheringAt(id ?? ""), beeNectar: hit.getProperty("minecraft:has_nectar") === true };
  } catch {
    return {};
  }
}

// Lions: lying up, a scent investigated or the roar, as animals/lion.js tells the client (zoocraft:act).
/** @returns {{ lyingUp?: boolean, scenting?: boolean, roaring?: boolean }} */
function lionSight(species, hit) {
  if (!species.manes) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { lyingUp: LION_DOWN.includes(act), scenting: LION_SCENT.includes(act), roaring: act === LION_ACT.roar };
  } catch {
    return {};
  }
}

// Tigers: marking (spraying, the cheek rub, clawing high, scraping) and the ambush freeze, as animals/tiger.js
// tells the client (zoocraft:act).
/** @returns {{ marking?: boolean, ambushing?: boolean }} */
function tigerSight(species, hit) {
  if (!species.solitary) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { marking: TIGER_MARK.includes(act), ambushing: act === TIGER_ACT.ambush };
  } catch {
    return {};
  }
}

// Crocodiles: basking with the jaws open, the death roll, a wild one floating eyes-up, as animals/croc.js tells
// the client (zoocraft:act).
/** @returns {{ gaping?: boolean, rolling?: boolean, lurking?: boolean }} */
function crocSight(species, hit) {
  if (!species.basks) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { gaping: act === CROC_ACT.bask, rolling: act === CROC_ACT.roll, lurking: hit.typeId === "zoocraft:wild_crocodile" && act === CROC_ACT.float };
  } catch {
    return {};
  }
}

// Big fish (0.1.124): a whale shark filter feeding (the entity's own timers flip zoocraft:feeding, wild or in a tank).
/** @returns {{ gulping?: boolean, breaching?: boolean, sweeping?: boolean, lunging?: boolean, luring?: boolean, burying?: boolean }} */
function bigFishSight(species, hit) {
  if (!species.bigFish) return {};
  try {
    if (species.shark) {
      const act = hit.getProperty("zoocraft:act");
      return { breaching: act === SHARK_ACT.breach, sweeping: act === SHARK_ACT.sweep, lunging: act === SHARK_ACT.lunge };
    }
    if (species.lure) return { luring: hit.getProperty("zoocraft:luring") === true }; // the anglerfish (0.1.126)
    if (species.sandBed) return { burying: hit.getProperty("zoocraft:act") === RAY_ACT.buried }; // a stingray in the sand (0.1.127)
    return { gulping: hit.getProperty("zoocraft:feeding") === true };
  } catch {
    return {};
  }
}

// Red pandas: coming down head first, draped over a branch, curled up asleep, as animals/redpanda.js tells the
// client (zoocraft:act).
/** @returns {{ headDown?: boolean, draped?: boolean, tailWrapped?: boolean }} */
function pandaSight(species, hit) {
  if (!species.canopy) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { headDown: act === PANDA_ACT.down, draped: act === PANDA_ACT.drape, tailWrapped: act === PANDA_ACT.curl };
  } catch {
    return {};
  }
}

// Gorillas: the chest-beat display (or the warning, beating at someone), a nest being built, grooming, as
// animals/gorilla.js tells the client (zoocraft:act).
// Owls: a hoot, mantling over food (in an aviary at the feeder, in the wild on prey), a pellet coughed up, as
// animals/owl.js tells the client (zoocraft:act).
/** @returns {{ hooting?: boolean, pouncing?: boolean, pelleting?: boolean }} */
function owlSight(species, hit) {
  if (!species.roosts) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { hooting: act === OWL_ACT.hoot, pouncing: act === OWL_ACT.eat, pelleting: act === OWL_ACT.pellet };
  } catch {
    return {};
  }
}

// Crimson Grazers: in the ring (or rushing out of it), rubbing on a stem, chewing the cud, as animals/grazer.js tells
// the client (zoocraft:act). One return type for both branches: each sight helper spread into the sight object
// below that returns {} or a shape doubles the union TypeScript builds for it, and one more ran tsc out of room
// ("Map maximum size exceeded").
/** @returns {{ ringing?: boolean, rubbing?: boolean, chewing?: boolean }} */
function grazerSight(species, hit) {
  if (!species.nylium) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { ringing: act === GRAZER_ACT.ring || act === GRAZER_ACT.rush, rubbing: act === GRAZER_ACT.rub, chewing: act === GRAZER_ACT.chew };
  } catch {
    return {};
  }
}

// Warped Geckos: clinging to a wall, stalking or snapping up a moth, calling, as animals/gecko.js tells the client
// (zoocraft:pose, zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ clinging?: boolean, hunting?: boolean, calling?: boolean }} */
function geckoSight(species, hit) {
  if (!species.clings) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    const pose = hit.getProperty("zoocraft:pose");
    return { clinging: pose !== undefined && pose !== GECKO_POSE.floor, hunting: act === GECKO_ACT.stalk || act === GECKO_ACT.snap, calling: act === GECKO_ACT.call };
  } catch {
    return {};
  }
}

// Cinder Boars: rooting, wallowing, rubbing the mud off, as animals/boar.js tells the client (zoocraft:act). One return
// type for both branches (see grazerSight).
/** @returns {{ rooting?: boolean, wallowing?: boolean, scrubbing?: boolean }} */
function boarSight(species, hit) {
  if (!species.wallow) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { rooting: act === BOAR_ACT.root, wallowing: act === BOAR_ACT.wallow, scrubbing: act === BOAR_ACT.rub };
  } catch {
    return {};
  }
}

// Soul Moths: circling a soul light (a stall under one too), the flip over one, sipping nectar, as animals/moth.js tells
// the client (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ orbiting?: boolean, tumbling?: boolean, sipping?: boolean }} */
function mothSight(species, hit) {
  if (!species.soulLight) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { orbiting: act === MOTH_ACT.orbit_l || act === MOTH_ACT.orbit_r || act === MOTH_ACT.stall, tumbling: act === MOTH_ACT.invert, sipping: act === MOTH_ACT.sip };
  } catch {
    return {};
  }
}

// Quartz Beetles: digging into the bed or out of it (or tunnelling through it), two males wrestling, the hiss, as
// animals/beetle.js tells the client (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ burrowing?: boolean, wrestling?: boolean, hissing?: boolean }} */
function beetleSight(species, hit) {
  if (!species.substrate) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { burrowing: act === BEETLE_ACT.dig || act === BEETLE_ACT.emerge || act === BEETLE_ACT.tunnel, wrestling: act === BEETLE_ACT.face || act === BEETLE_ACT.shove || act === BEETLE_ACT.pry || act === BEETLE_ACT.flipped || act === BEETLE_ACT.righting, hissing: act === BEETLE_ACT.hiss };
  } catch {
    return {};
  }
}

// End Hoppers: a leap (the crouch, the arc and the landing), the zigzag (its darts: one seen is enough, as every leap
// ends with the land act the darts touch down in), listening with the head on the ground, as animals/hopper.js tells the
// client (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ leaping?: boolean, zigzagging?: boolean, listening?: boolean }} */
function hopperSight(species, hit) {
  if (!species.pads) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { leaping: act === HOPPER_ACT.crouch || act === HOPPER_ACT.leap || act === HOPPER_ACT.land, zigzagging: act === HOPPER_ACT.dart, listening: act === HOPPER_ACT.listen };
  } catch {
    return {};
  }
}

// Shimmer Snails: crawling (along its way, or along another's trail), pulled into its shell at a startle (not the pull-in
// of going to rest, which is the sealed act's own), sealed in to rest, as animals/snail.js tells the client
// (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ trailing?: boolean, withdrawing?: boolean, sealedIn?: boolean }} */
function snailSight(species, hit) {
  if (!species.crevices) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { trailing: act === SNAIL_ACT.crawl || act === SNAIL_ACT.follow, withdrawing: act === SNAIL_ACT.withdraw, sealedIn: act === SNAIL_ACT.sealed };
  } catch {
    return {};
  }
}

// Obsidian Crabs: scraping a rock (or the ground), digging itself in, rearing with its claws up (at someone coming at
// it, or at another crab), as animals/crab.js tells the client (zoocraft:act). One return type for both branches (see
// grazerSight).
/** @returns {{ scraping?: boolean, digging?: boolean, rearing?: boolean }} */
function crabSight(species, hit) {
  if (!species.rockFaces) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { scraping: act === CRAB_ACT.scrape, digging: act === CRAB_ACT.dig, rearing: act === CRAB_ACT.display };
  } catch {
    return {};
  }
}

// Chorus Moths: hovering at a chorus flower, the warm-up shiver (on a wall or on the ground), sipping nectar, as
// animals/chorusMoth.js tells the client (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ flowering?: boolean, warming?: boolean, sipping?: boolean }} */
function chorusMothSight(species, hit) {
  if (!species.chorusFlowers) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { flowering: act === CHORUS_MOTH_ACT.hover, warming: act === CHORUS_MOTH_ACT.warm || act === CHORUS_MOTH_ACT.warm_flat, sipping: act === CHORUS_MOTH_ACT.sip };
  } catch {
    return {};
  }
}

// Starback Tortoises: basking warm, browsing, pulled into its shell, as animals/starback.js tells the client
// (zoocraft:act). One return type for both branches (see grazerSight).
/** @returns {{ warmBasking?: boolean, chorusBrowsing?: boolean, withdrawing?: boolean }} */
function starbackSight(species, hit) {
  if (!species.warmPads) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { warmBasking: act === STARBACK_ACT.bask, chorusBrowsing: act === STARBACK_ACT.browse, withdrawing: act === STARBACK_ACT.withdraw };
  } catch {
    return {};
  }
}

// Lush Okapis (0.1.137): browsing with the tongue, washing an eye or an ear with it, licking clay, as animals/okapi.js tells
// the client (zoocraft:act).
/** @returns {{ tongueBrowsing?: boolean, eyeWashing?: boolean, clayLicking?: boolean }} */
function okapiSight(species, hit) {
  if (!species.lushGround) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { tongueBrowsing: act === OKAPI_ACT.browse, eyeWashing: act === OKAPI_ACT.groom, clayLicking: act === OKAPI_ACT.lick };
  } catch {
    return {};
  }
}

// Earth Molebears (0.1.138): digging with the spade hands (a tunnel, or a wild one digging itself in), sniffing with the
// star, standing up, as animals/molebear.js tells the client (zoocraft:act).
/** @returns {{ spadeDigging?: boolean, starSniffing?: boolean, standingUp?: boolean }} */
function molebearSight(species, hit) {
  if (!species.burrowSoil) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { spadeDigging: act === MOLEBEAR_ACT.dig || act === MOLEBEAR_ACT.buried, starSniffing: act === MOLEBEAR_ACT.sniff, standingUp: act === MOLEBEAR_ACT.stand };
  } catch {
    return {};
  }
}

// Skulkers (0.1.139): listening with its tendrils, sniffing someone, rising out of the sculk, as animals/skulker.js
// tells the client (zoocraft:act).
/** @returns {{ tendrilsListening?: boolean, sniffingSomeone?: boolean, emerging?: boolean }} */
function skulkerSight(species, hit) {
  if (!species.sculkFloor) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { tendrilsListening: act === SKULKER_ACT.listen, sniffingSomeone: act === SKULKER_ACT.sniff, emerging: act === SKULKER_ACT.emerge };
  } catch {
    return {};
  }
}

// Unicorns (0.1.149): grazing the glowing flowers, dipping the horn, rearing, as animals/unicorn.js tells the client
// (zoocraft:act).
/** @returns {{ flowerGrazing?: boolean, hornDipping?: boolean, rearing?: boolean }} */
function unicornSight(species, hit) {
  if (!species.gladeFlowers) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { flowerGrazing: act === UNICORN_ACT.flowers, hornDipping: act === UNICORN_ACT.dip, rearing: act === UNICORN_ACT.rear };
  } catch {
    return {};
  }
}

// Dragons (0.1.150): breathing fire, basking with the wings spread, roaring, as animals/dragon.js tells the client
// (zoocraft:act).
/** @returns {{ dragonFire?: boolean, wingBasking?: boolean, dragonRoaring?: boolean }} */
function dragonSight(species, hit) {
  if (!species.warmth) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { dragonFire: act === DRAGON_ACT.fire, wingBasking: act === DRAGON_ACT.bask, dragonRoaring: act === DRAGON_ACT.roar };
  } catch {
    return {};
  }
}

// Griffins (0.1.151): guarding the gold, screeching, diving, as animals/griffin.js tells the client (zoocraft:act).
/** @returns {{ goldGuarding?: boolean, griffinScreeching?: boolean, griffinDiving?: boolean }} */
function griffinSight(species, hit) {
  if (!species.hoard) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { goldGuarding: act === GRIFFIN_ACT.guard, griffinScreeching: act === GRIFFIN_ACT.screech, griffinDiving: act === GRIFFIN_ACT.dive };
  } catch {
    return {};
  }
}

// Glowhorn Stags (0.1.152): showing the glow, rubbing antlers on a trunk, bellowing, as animals/glowhorn.js tells the
// client (zoocraft:act).
/** @returns {{ antlerGlowing?: boolean, antlerRubbing?: boolean, stagBellowing?: boolean }} */
function stagSight(species, hit) {
  if (!species.trunks) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { antlerGlowing: act === STAG_ACT.glow, antlerRubbing: act === STAG_ACT.rub, stagBellowing: act === STAG_ACT.bellow };
  } catch {
    return {};
  }
}

// Giant Yetis (0.1.159): roaring, hurling a snowball, tired out, as animals/boss.js and animals/yeti.js tell the client
// (zoocraft:act).
/** @returns {{ yetiRoaring?: boolean, yetiHurling?: boolean, yetiTired?: boolean }} */
function yetiSight(species, hit) {
  if (species.id !== ZOO_YETI) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { yetiRoaring: act === YETI_ACT.roar, yetiHurling: act === YETI_ACT.hurl, yetiTired: act === YETI_ACT.tired };
  } catch {
    return {};
  }
}

// Soul Sloths (0.1.161): hanging from its beam (asleep or awake), lobbing a clump, tired out, as animals/boss.js and
// animals/sloth.js tell the client (zoocraft:act).
/** @returns {{ slothHanging?: boolean, slothLobbing?: boolean, slothTired?: boolean }} */
function slothSight(species, hit) {
  if (species.id !== ZOO_SLOTH) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { slothHanging: SLOTH_HANGING.includes(Number(act)), slothLobbing: act === SLOTH_ACT.hurl, slothTired: act === SLOTH_ACT.tired };
  } catch {
    return {};
  }
}

// Baby Dragons (0.1.162): asleep, diving (the wind-up or the stoop), tired out, as animals/babyDragon.js and
// animals/dragon.js tell the client (zoocraft:act).
/** @returns {{ drakeSleeping?: boolean, drakeDiving?: boolean, drakeTired?: boolean }} */
function drakeSight(species, hit) {
  if (species.id !== ZOO_DRAKE) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { drakeSleeping: act === DRAKE_ACT.sleep, drakeDiving: act === DRAKE_ACT.dive || act === DRAKE_ACT.stoop, drakeTired: act === DRAKE_ACT.tired };
  } catch {
    return {};
  }
}

// Foxes (0.1.169): asleep in the game's own nap (the fox's sleeping flag, which Entity.isSleeping reads), wild or in a zoo.
/** @returns {{ napping?: boolean }} */
function napSight(species, hit) {
  if (!species.naps) return {};
  try {
    return { napping: hit.isSleeping === true };
  } catch {
    return {};
  }
}

// Pandas (0.1.170): bamboo growing within 2 blocks of it, and whether its gene shows (minecraft:variant 1-6), wild or in a
// zoo. (The red panda's sight is pandaSight.)
/** @returns {{ amongBamboo?: boolean, geneShows?: boolean }} */
function bambooSight(species, hit) {
  if (!species.genes) return {};
  try {
    const d = hit.dimension;
    return pandaSeen((x, y, z) => d.getBlock({ x, y, z })?.typeId, hit.location, hit.getComponent("minecraft:variant")?.value);
  } catch {
    return {};
  }
}

// Zombies and skeletons (0.1.163): a calmed one, or one in a zoo (the vanilla one is only spotted).
/** @returns {{ mobCalm?: boolean }} */
function mobSight(species, hit) {
  if (!species.mob) return {};
  return { mobCalm: CALM_TYPES.has(hit.typeId) || hit.typeId === species.entityType };
}

// The undead mounts (0.1.198): one walking on the ground with nothing riding it (a zoo one never has a rider); the zombie
// nautilus (0.1.200) swimming. One object type for both branches (see paddockSight).
/** @returns {{ mountRiderless?: boolean, mountSwimRiderless?: boolean }} */
function mountSight(species, hit) {
  if (!species.undeadMount) return {};
  try {
    const riders = hit.getComponent("minecraft:rideable")?.getRiders() ?? [];
    const free = !isStill(hit) && riders.length === 0;
    return { mountRiderless: free && hit.isOnGround, mountSwimRiderless: free && hit.isInWater };
  } catch {
    return {};
  }
}

/** @returns {{ chestBeat?: boolean, nestBuilding?: boolean, picking?: boolean }} */
function gorillaSight(species, hit) {
  if (!species.troop) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { chestBeat: act === GORILLA_ACT.display || act === GORILLA_ACT.warn, nestBuilding: act === GORILLA_ACT.nest, picking: act === GORILLA_ACT.groom };
  } catch {
    return {};
  }
}

function groundSight(species, hit) {
  const prowls = species.observe?.includes("prowl");
  const lava = livesOnLava(species) ? inLava(hit) : false;
  if (!species.bask && !prowls) return { onMagma: false, onSoul: false, inLava: lava };
  const id = groundOf(hit);
  return { onMagma: Boolean(species.bask) && MAGMA.has(id), onSoul: Boolean(prowls) && SOUL.has(id), inLava: lava };
}

// Jellyfish (0.1.127): one flashing its ring of light (zoocraft:flashing, the entity's timers and animals/jelly.js).
/** @returns {{ flashing?: boolean }} */
function jellySight(species, hit) {
  if (!species.flashes) return {};
  try {
    return { flashing: hit.getProperty("zoocraft:flashing") === true };
  } catch {
    return {};
  }
}

// Catfish and manatees (0.1.129): one foraging on the floor with its whiskers (animals/catfish.js), one breathing at the
// surface (animals/manatee.js), as zoocraft:act tells the client.
/** @returns {{ whiskering?: boolean, breathing?: boolean }} */
function riverSight(species, hit) {
  if (!species.bottomFeeder && !species.aquaticMammal) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return species.bottomFeeder ? { whiskering: act === CATFISH_ACT.forage } : { breathing: act === MANATEE_ACT.breathe };
  } catch {
    return {};
  }
}

// Every half second: what each park member is looking at.
export function tickDiscovery() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    if (!memberOfAny(player)) continue; // 0.1.114: a member of any park (the journal is one a player from 0.1.115)
    let hit;
    try {
      hit = player.getEntitiesFromViewDirection({ maxDistance: RANGE })[0]?.entity ?? throughLava(player) ?? throughGlass(player);
    } catch {
      continue;
    }
    if (!hit?.isValid) continue;
    const species = speciesForWild(hit.typeId) ?? speciesForEntity(hit.typeId) ?? speciesForMob(hit.typeId);
    if (!species) continue;
    // Each sight function declares one object type for all its returns (its keys optional): spread here, a function that
    // returned {} or an object would double the type checker's union (0.1.187: at 8192 it ran out of room).
    const sight = { inWater: hit.isInWater, onGround: hit.isOnGround, still: isStill(hit), herd: species.family ? hasHerd(hit, species.family) : false, ...groundSight(species, hit), ...flightSight(species, hit), ...riftSight(species, hit), ...nightSight(species, hit), ...climbSight(species, hit), ...pandaSight(species, hit), ...gorillaSight(species, hit), ...owlSight(species, hit), ...grazerSight(species, hit), ...geckoSight(species, hit), ...boarSight(species, hit), ...mothSight(species, hit), ...beetleSight(species, hit), ...hopperSight(species, hit), ...snailSight(species, hit), ...crabSight(species, hit), ...chorusMothSight(species, hit), ...starbackSight(species, hit), ...okapiSight(species, hit), ...molebearSight(species, hit), ...skulkerSight(species, hit), ...unicornSight(species, hit), ...dragonSight(species, hit), ...griffinSight(species, hit), ...stagSight(species, hit), ...yetiSight(species, hit), ...slothSight(species, hit), ...drakeSight(species, hit), ...mobSight(species, hit), ...napSight(species, hit), ...bambooSight(species, hit), ...flamingoSight(species, hit), ...zebraSight(species, hit), ...paddockSight(species, hit), ...goatSight(species, hit), ...camelSight(species, hit), ...turtleSight(species, hit), ...frogSight(species, hit), ...axolotlSight(species, hit), ...dolphinSight(species, hit), ...beeSight(species, hit), ...parrotSight(species, hit), ...catSight(species, hit), ...armadilloSight(species, hit), ...snifferSight(species, hit), ...llamaSight(species, hit), ...batAllaySight(species, hit), ...lionSight(species, hit), ...tigerSight(species, hit), ...crocSight(species, hit), ...bigFishSight(species, hit), ...jellySight(species, hit), ...riverSight(species, hit), ...golemSight(species, hit), ...ghastSight(species, hit), ...cubeSight(species, hit), ...mountSight(species, hit) };
    for (const t of tasksSeen(species, recordOf(player.id, species.id).done, sight)) seen.add(`${player.id}|${species.id}|${t}`);
  }
  for (const key of watch(progress, seen, STEP)) {
    const [playerId, speciesId, task] = key.split("|");
    const player = onlinePlayers().find((p) => p.id === playerId);
    if (player) complete(speciesId, task, player);
  }
}

// Fill in every task of a species in a player's journal (a species the park kept before the player's journal could
// know it). True when the page changed.
function fillPage(playerId, speciesId, from = undefined) {
  const species = SPECIES[speciesId];
  if (!species) return false;
  const rec = recordOf(playerId, speciesId);
  const done = [...new Set([...rec.done, ...(from ?? species.observe ?? ["spot"])])];
  if (done.length === rec.done.length) return false;
  rec.done = done;
  rec.grandfathered = true;
  db.put(DISC, rec);
  return true;
}

// A player's first join since the journal became their own (0.1.117), once (players record journalV): every species
// in a park they belong to is filled in, as the park's one journal was for species it kept before the journal
// existed. A member made later watches the animals like anyone else: that is the individual unlock.
export function grandfatherPlayer(player) {
  const rec = db.get("players", player.id) ?? { id: player.id };
  if ((rec.journalV ?? 0) >= JOURNAL_V) return 0;
  let n = 0;
  for (const park of parksOf(player)) {
    for (const id of new Set(withPark(park, allAnimals).map((a) => a.speciesId))) if (fillPage(player.id, id)) n++;
  }
  db.put("players", { ...rec, id: player.id, journalV: JOURNAL_V });
  if (n) {
    info(`discovery: ${player.name}'s Field Journal filled in for ${n} species their parks keep`);
    message(player, `§bField Journal: §fit's your own now, and goes with you to any park. ${n} species your park${parksOf(player).length === 1 ? " keeps are" : "s keep are"} filled in already.`);
  }
  return n;
}

// Once, on a world whose Field Journal was the park's (one record a species, id the species id): every member of every
// park gets those pages, and the park's records go (0.1.117).
export function initDiscovery() {
  const old = db.all(DISC).filter((r) => !r.player);
  if (old.length) {
    const members = new Set(allParks().flatMap((p) => Object.keys(p.members ?? {})));
    let pages = 0;
    for (const r of old) {
      for (const pid of members) if (fillPage(pid, r.id, r.done ?? [])) pages++;
      db.remove(DISC, r.id);
    }
    info(`discovery: the park's Field Journal (${old.length} species) is each member's own now: ${pages} pages for ${members.size} member${members.size === 1 ? "" : "s"}`);
  }
  const journals = new Set(db.all(DISC).map((r) => r.player)).size;
  info(`discovery: ${journals} Field Journal${journals === 1 ? "" : "s"}`);
}
