import { db } from "../persistence/db.js";
import { SPECIES, speciesForWild, speciesForEntity, pluralOf, livesOnLava } from "../data/species.js";
import { getPark } from "../park/park.js";
import { allAnimals } from "../animals/animals.js";
import { log } from "../core/log.js";
import { BLOCKS, CLEAR_LAVA_FLOWING } from "../data/items.js";
import { onlinePlayers, message } from "../platform/mc.js";
import { LEVELS, TASKS, levelOf, tasksSeen, watch, alongSight } from "./rules.js";
import { cellsAlong } from "../animals/glide.js";
import { ACT, CLIMBING_ACTS } from "../animals/climbRules.js";
import { ACT as FLAMINGO_ACT, DISPLAY_ACTS } from "../animals/flamingoRules.js";
import { ACT as ZEBRA_ACT } from "../animals/zebraRules.js";
import { ACT as LION_ACT } from "../animals/lionRules.js";
import { ACT as TIGER_ACT } from "../animals/tigerRules.js";
import { ACT as CROC_ACT } from "../animals/crocRules.js";
import { ACT as PANDA_ACT } from "../animals/pandaRules.js";
import { ACT as GORILLA_ACT } from "../animals/gorillaRules.js";
import { ACT as OWL_ACT } from "../animals/owlRules.js";
import { ACT as GRAZER_ACT } from "../animals/grazerRules.js";

const TIGER_MARK = [TIGER_ACT.spray, TIGER_ACT.rub, TIGER_ACT.claw, TIGER_ACT.scrape];

const LION_DOWN = [LION_ACT.lie, LION_ACT.sleep, LION_ACT.sleepBack];
const LION_SCENT = [LION_ACT.sniff, LION_ACT.flehmen, LION_ACT.spray, LION_ACT.scrape, LION_ACT.claw];

// Field Journal (spec sections 4 and 8). Park members fill it in by looking at animals: a few
// seconds of watching one, wild or in a zoo, does a task. A species has to be "ready to move"
// before a wild one can be caught. One record per species in the "discovery" collection.

const DISC = "discovery";
const RANGE = 24; // blocks: how far a player can watch an animal from
const STEP = 0.5; // seconds between looks (the loop runs every 10 ticks)
const HERD_RANGE = 8; // blocks: another of its kind this close counts as its herd
const progress = new Map(); // "player|species|task" -> seconds watched without a break

function recordOf(speciesId) {
  return db.get(DISC, speciesId) ?? { id: speciesId, done: [] };
}

export function levelFor(speciesId) {
  const species = SPECIES[speciesId];
  return species ? levelOf(species, recordOf(speciesId).done) : 0;
}

export function levels() {
  return Object.fromEntries(Object.keys(SPECIES).map((id) => [id, levelFor(id)]));
}

export function doneTasks(speciesId) {
  return recordOf(speciesId).done;
}

export function canMove(speciesId) {
  return levelFor(speciesId) >= 3;
}

// Why a wild one can't be moved yet, with what's left to watch.
export function notReadyText(species) {
  const done = doneTasks(species.id);
  const left = (species.observe ?? ["spot"]).filter((t) => !done.includes(t)).map((t) => TASKS[t].text.toLowerCase());
  return `You don't know ${pluralOf(species).toLowerCase()} well enough to move one safely yet. Field Journal: ${left.join("; ")}. Look at one for a few seconds to fill it in.`;
}

function complete(speciesId, task, player) {
  const rec = recordOf(speciesId);
  if (rec.done.includes(task)) return;
  const species = SPECIES[speciesId];
  const before = levelOf(species, rec.done);
  rec.done = [...rec.done, task];
  db.put(DISC, rec);
  const after = levelOf(species, rec.done);
  const left = (species.observe ?? []).filter((t) => !rec.done.includes(t));
  const next = left.length ? ` §7Next: ${TASKS[left[0]].text.toLowerCase()}.` : "";
  const level = after > before ? ` §fNow: §b${LEVELS[after]}${after === 3 ? " (you can catch one now)" : ""}.` : "";
  for (const p of onlinePlayers()) {
    if (p.id === player.id || getPark()?.members[p.id]) message(p, `§bField Journal: §f${player.name} ${TASKS[task].done}: ${species.displayName}.${level}${next}`);
  }
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
// client through the entity's properties.
function flightSight(species, hit) {
  if (!species.flies || species.roosts) return {};
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

// Every half second: what each park member is looking at.
export function tickDiscovery() {
  const park = getPark();
  if (!park) return;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    if (!park.members[player.id]) continue;
    let hit;
    try {
      hit = player.getEntitiesFromViewDirection({ maxDistance: RANGE })[0]?.entity ?? throughLava(player);
    } catch {
      continue;
    }
    if (!hit?.isValid) continue;
    const species = speciesForWild(hit.typeId) ?? speciesForEntity(hit.typeId);
    if (!species) continue;
    const sight = { inWater: hit.isInWater, onGround: hit.isOnGround, still: isStill(hit), herd: species.family ? hasHerd(hit, species.family) : false, ...groundSight(species, hit), ...flightSight(species, hit), ...riftSight(species, hit), ...nightSight(species, hit), ...climbSight(species, hit), ...pandaSight(species, hit), ...gorillaSight(species, hit), ...owlSight(species, hit), ...grazerSight(species, hit), ...flamingoSight(species, hit), ...zebraSight(species, hit), ...lionSight(species, hit), ...tigerSight(species, hit), ...crocSight(species, hit) };
    for (const t of tasksSeen(species, recordOf(species.id).done, sight)) seen.add(`${player.id}|${species.id}|${t}`);
  }
  for (const key of watch(progress, seen, STEP)) {
    const [playerId, speciesId, task] = key.split("|");
    const player = onlinePlayers().find((p) => p.id === playerId);
    if (player) complete(speciesId, task, player);
  }
}

// Parks that had animals before the Field Journal existed: those species are already known.
export function initDiscovery() {
  const have = new Set(allAnimals().map((a) => a.speciesId));
  for (const id of have) {
    if (!SPECIES[id] || db.get(DISC, id)) continue;
    db.put(DISC, { id, done: [...(SPECIES[id].observe ?? ["spot"])], grandfathered: true });
  }
  log(`discovery: ${Object.values(levels()).filter((l) => l >= 3).length} species ready to move`);
}
