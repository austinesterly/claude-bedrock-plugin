import { db } from "../persistence/db.js";
import { SPECIES, speciesForWild, speciesForEntity, pluralOf, livesOnLava } from "../data/species.js";
import { memberOfAny, parksOf, allParks, withPark } from "../park/park.js";
import { allAnimals } from "../animals/animals.js";
import { log } from "../core/log.js";
import { BLOCKS, CLEAR_LAVA_FLOWING } from "../data/items.js";
import { onlinePlayers, message } from "../platform/mc.js";
import { LEVELS, TASKS, levelOf, tasksSeen, watch, alongSight, bestLevels } from "./rules.js";
import { cellsAlong } from "../animals/glide.js";
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
import { ACT as STARBACK_ACT } from "../animals/starbackRules.js";
import { ACT as OKAPI_ACT } from "../animals/okapiRules.js";

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
  const left = (species.observe ?? ["spot"]).filter((t) => !done.includes(t)).map((t) => TASKS[t].text.toLowerCase());
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

// Flyers (Void Rays): gliding toward somewhere, and the loop the loop, as animals/flight.js tells the
// client through the entity's properties. (Owls and the moths have their own acts: owlSight, mothSight,
// chorusMothSight.)
function flightSight(species, hit) {
  if (!species.flies || species.roosts || species.soulLight || species.chorusFlowers) return {};
  try {
    return { flying: hit.getProperty("zoocraft:gliding") === true, looping: hit.getProperty("zoocraft:looping") === true };
  } catch {
    return {};
  }
}

// Rift Ferrets: the blink just made and standing up to peer about, as animals/rift.js tells the client
// through the entity's properties.
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
function zebraSight(species, hit) {
  if (!species.harem) return {};
  try {
    const act = hit.getProperty("zoocraft:act");
    return { grazing: act === ZEBRA_ACT.graze, inFile: act === ZEBRA_ACT.file, grooming: act === ZEBRA_ACT.groom };
  } catch {
    return {};
  }
}

// Lions: lying up, a scent investigated or the roar, as animals/lion.js tells the client (zoocraft:act).
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
      hit = player.getEntitiesFromViewDirection({ maxDistance: RANGE })[0]?.entity ?? throughLava(player);
    } catch {
      continue;
    }
    if (!hit?.isValid) continue;
    const species = speciesForWild(hit.typeId) ?? speciesForEntity(hit.typeId);
    if (!species) continue;
    const sight = { inWater: hit.isInWater, onGround: hit.isOnGround, still: isStill(hit), herd: species.family ? hasHerd(hit, species.family) : false, ...groundSight(species, hit), ...flightSight(species, hit), ...riftSight(species, hit), ...nightSight(species, hit), ...climbSight(species, hit), ...pandaSight(species, hit), ...gorillaSight(species, hit), ...owlSight(species, hit), ...grazerSight(species, hit), ...geckoSight(species, hit), ...boarSight(species, hit), ...mothSight(species, hit), ...beetleSight(species, hit), ...hopperSight(species, hit), ...snailSight(species, hit), ...crabSight(species, hit), ...chorusMothSight(species, hit), ...starbackSight(species, hit), ...okapiSight(species, hit), ...flamingoSight(species, hit), ...zebraSight(species, hit), ...lionSight(species, hit), ...tigerSight(species, hit), ...crocSight(species, hit), ...bigFishSight(species, hit), ...jellySight(species, hit), ...riverSight(species, hit) };
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
    log(`discovery: ${player.name}'s Field Journal filled in for ${n} species their parks keep`);
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
    log(`discovery: the park's Field Journal (${old.length} species) is each member's own now: ${pages} pages for ${members.size} member${members.size === 1 ? "" : "s"}`);
  }
  const journals = new Set(db.all(DISC).map((r) => r.player)).size;
  log(`discovery: ${journals} Field Journal${journals === 1 ? "" : "s"}`);
}
