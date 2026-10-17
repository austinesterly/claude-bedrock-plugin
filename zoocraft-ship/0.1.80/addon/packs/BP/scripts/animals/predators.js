import { system, world, ItemStack, EntityDamageCause } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES, pluralOf } from "../data/species.js";
import { BLOCKS } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { emit } from "../core/events.js";
import { log } from "../core/log.js";
import { can, denyText } from "../park/park.js";
import { getExhibit, isInsideCells, cellsOf, exhibitAt } from "../exhibits/exhibits.js";
import { getAnimal, animalsIn, liveEntity, animalFromEntity } from "../animals/animals.js";
import { onlinePlayers, message, heldItem, dim } from "../platform/mc.js";
import { dangerStep, densNeeded, shiftPlan, allShutIn, servicePairs, interlockedBy, keeperBlock, baitNear } from "./predatorRules.js";
import { shoreBlock } from "./crocRules.js";

// Big predators (0.1.75: lions; 0.1.76: tigers; 0.1.77: crocodiles), the game side; the rules are in
// animals/predatorRules.js and the research in research/predators_plan.md. This module owns:
// - the Holding Den (a den set into the exhibit's fence, worked from outside: "Call in", "Let out",
//   and crating an animal shut inside). A shut-in animal is hidden in the den block (invisible, no
//   collision, held still) and its record is on the den's "equipment" record (`held`). A tigress's cubs
//   go in with her (species.dens.cubsFollow: the den's `cubs`), and come out with her. A den the tigers'
//   turns shut (animals/tigerTurns.js) is marked `turn`: only the turns let that one out again;
// - the service entrance: two Keeper Gates in a row (an airlock) with the interlock, one open at a time;
// - what keepers do before going into a dangerous exhibit (shift every animal into the dens, count them,
//   go in through the airlock) and after (let them out);
// - the danger to players inside the exhibit ("Warn, then swipe") and the bait thrown to a wild one (each
//   species' own: a Meat Ration, or a Fruit Ration for a gorilla, 0.1.80), or to a zoo gorilla that got out
//   of its exhibit (species.ape: it can be calmed and crated the same way).
// It decides; each species' controller (animals/lion.js, animals/tiger.js, animals/croc.js) moves the animal: it asks intentOf(entity id)
// every step and calls arrivedAtDen() when it has walked up to a den door.

const EQUIP = "equipment";
const RID = "zoocraft:rid";
/** @type {any} */
const DOOR = "zoocraft:door";
/** @type {any} */
const INSIDE = "zoocraft:inside";
/** @type {any} */
const FACING = "minecraft:cardinal_direction";
const DIR = { north: { x: 0, z: -1 }, south: { x: 0, z: 1 }, west: { x: -1, z: 0 }, east: { x: 1, z: 0 } };
const RANGE = 48; // blocks from a player: dangerous animals this close are stepped

const intents = new Map(); // entity id -> { kind: "den" | "warn" | "charge" | "back" | "out" | "bait", ... }
const danger = new Map(); // `${entity id}|${player id}` -> dangerStep state
const STRIKE_TICKS = 11; // from the swipe's start in predators.js to the paw landing in the client's swipe
const keeperShut = new Map(); // exhibit id -> Set of den ids a keeper shut (let out again when done)
const calm = new Map(); // wild entity id -> { until, itemId, fed }
const unreachable = new Map(); // wild entity id -> { ids: bait item ids it found no way to, until }

// ---------------- dens ----------------

export function isDangerous(species) {
  return Boolean(species?.dangerous);
}

export function allDens() {
  return db.all(EQUIP).filter((r) => r.type === "holding");
}

// The Holding Dens that serve this exhibit (linked by its measurement).
export function densOf(ex) {
  return (ex.fixtureIds ?? []).map((id) => db.get(EQUIP, id)).filter((r) => r?.type === "holding");
}

// The den an animal is shut in (or a cub in with its mother), or undefined.
export function denOf(animalId) {
  return allDens().find((d) => d.held === animalId || d.cubs?.includes(animalId));
}

export function isDenned(animalId) {
  return Boolean(denOf(animalId));
}

// The open ground in front of a den's door (where an animal walks up to it, and comes out).
export function frontOf(rec) {
  const d = DIR[rec.facing] ?? DIR.north;
  return { x: rec.pos.x + d.x, y: rec.pos.y, z: rec.pos.z + d.z };
}

function lookOf(rec) {
  try {
    const d = dim(rec.dimension);
    if (!d.isChunkLoaded(rec.pos)) return;
    for (const dy of [0, 1]) {
      const b = d.getBlock({ x: rec.pos.x, y: rec.pos.y + dy, z: rec.pos.z });
      if (!b || (b.typeId !== BLOCKS.holdingDen && b.typeId !== BLOCKS.holdingDenTop)) continue;
      let p = b.permutation.withState(DOOR, rec.held ? 1 : 0);
      if (dy === 1) p = p.withState(INSIDE, rec.held ? 1 : 0);
      if (p !== b.permutation) b.setPermutation(p);
    }
  } catch {
    // Unloaded: the look catches up next time.
  }
}

function ensureDen(block) {
  const bottom = block.typeId === BLOCKS.holdingDenTop ? block.below() : block;
  const id = posKey(bottom.dimension.id, bottom.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "holding", blockId: BLOCKS.holdingDen, dimension: bottom.dimension.id, pos: { x: bottom.x, y: bottom.y, z: bottom.z }, facing: denFacing(bottom), held: undefined, exhibitId: undefined };
    db.put(EQUIP, rec);
  }
  return rec;
}

// The block's front (its door) faces the way it was turned when placed: away from the player placing
// it from outside the fence (y_rotation_offset 0 on the den, so the model's -z door ends up facing away).
function denFacing(block) {
  try {
    return block.permutation.getState(FACING) ?? "north";
  } catch {
    return "north";
  }
}

// A tigress's cubs (species.dens.cubsFollow): her young in the same exhibit, not shut in already.
function cubsWith(a) {
  const species = SPECIES[a.speciesId];
  const ex = species?.dens?.cubsFollow && a.location.kind === "exhibit" && getExhibit(a.location.id);
  if (!ex) return undefined;
  const ids = animalsIn(ex).filter((c) => c.juvenile && c.parents?.[0] === a.id && !isDenned(c.id)).map((c) => c.id);
  return ids.length ? ids : undefined;
}

function hideInDen(entity, rec) {
  entity.triggerEvent("zoocraft:den_in");
  entity.teleport({ x: rec.pos.x + 0.5, y: rec.pos.y + 0.05, z: rec.pos.z + 0.5 }, { keepVelocity: false });
  entity.addEffect("invisibility", 20000000, { showParticles: false, amplifier: 0 });
}

// Out onto the ground in front of the door, facing into the exhibit (k: a cub's place beside its mother).
function outOfDen(entity, rec, k = 0) {
  const f = frontOf(rec);
  const side = DIR[rec.facing] ?? DIR.north;
  const off = k ? (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.6 : 0; // cubs either side of her, along the fence
  const x = f.x + 0.5 + off * Math.abs(side.z);
  const z = f.z + 0.5 + off * Math.abs(side.x);
  entity.removeEffect("invisibility");
  entity.triggerEvent("zoocraft:den_out");
  entity.teleport({ x, y: f.y, z }, { keepVelocity: false, facingLocation: { x: x + (f.x - rec.pos.x) * 3, y: f.y + 1, z: z + (f.z - rec.pos.z) * 3 } });
}

// Shut an animal in: hidden in the den block, held still, no collision (its entity's zoocraft:denned
// group), the door down. Its needs go on as usual; it eats from the den's hatch (feeding is by the record).
// A tigress's cubs go in with her. opts.turn: shut in by the tigers' turns (animals/tigerTurns.js).
export function shutIn(entity, rec, opts = {}) {
  const a = animalFromEntity(entity);
  if (!a || rec.held) return false;
  rec.held = a.id;
  rec.cubs = cubsWith(a);
  rec.turn = opts.turn ? true : undefined;
  db.put(EQUIP, rec);
  intents.delete(entity.id);
  hideInDen(entity, rec);
  for (const id of rec.cubs ?? []) {
    const c = liveEntity(id);
    if (!c) continue;
    intents.delete(c.id);
    hideInDen(c, rec);
  }
  lookOf(rec);
  try {
    entity.dimension.playSound("block.iron_trapdoor.close", rec.pos, { volume: 0.9, pitch: 0.6 });
  } catch {
    // no sound
  }
  emit("denChanged", { den: rec, animal: a, shut: true });
  return true;
}

// Let it out onto the ground in front of the door (her cubs with her).
export function letOut(rec) {
  const a = rec.held && getAnimal(rec.held);
  const e = a && liveEntity(a.id);
  const cubs = rec.cubs ?? [];
  rec.held = undefined;
  rec.cubs = undefined;
  rec.turn = undefined;
  db.put(EQUIP, rec);
  lookOf(rec);
  cubs.forEach((id, k) => {
    const c = liveEntity(id);
    if (c) outOfDen(c, rec, k + 1);
  });
  if (e) {
    outOfDen(e, rec);
    try {
      e.dimension.playSound("block.iron_trapdoor.open", rec.pos, { volume: 0.9, pitch: 0.6 });
    } catch {
      // no sound
    }
  }
  if (a) emit("denChanged", { den: rec, animal: a, shut: false });
}

// The animal shut in here leaves in a Reinforced Crate (transport/carriers.js crateFromDen): the den is
// empty again and its door goes up. A tigress crated from the den leaves her cubs: they come out into the
// exhibit. A cub crated (a player can't reach one in a den, but a record can move) just leaves the den.
export function vacateDen(rec, animalId = rec.held) {
  if (animalId !== rec.held) {
    rec.cubs = rec.cubs?.filter((id) => id !== animalId);
    if (!rec.cubs?.length) rec.cubs = undefined;
    db.put(EQUIP, rec);
    return;
  }
  const cubs = rec.cubs ?? [];
  rec.held = undefined;
  rec.cubs = undefined;
  rec.turn = undefined;
  db.put(EQUIP, rec);
  lookOf(rec);
  cubs.forEach((id, k) => {
    const c = liveEntity(id);
    if (c) outOfDen(c, rec, k);
  });
}

// A mob spawned (again) for an animal shut in a den stays hidden in it (a grown-up's new mob, a reload),
// and a cub born while its mother is shut in (tigers: species.dens.cubsFollow) is born in the den with
// her. animals/animals.js spawnInExhibit.
export function keepInDen(entity, a) {
  let rec = denOf(a.id);
  const mother = a.parents?.[0];
  if (!rec && a.juvenile && mother && SPECIES[a.speciesId]?.dens?.cubsFollow) {
    rec = allDens().find((d) => d.held === mother);
    if (rec) {
      rec.cubs = [...(rec.cubs ?? []), a.id];
      db.put(EQUIP, rec);
    }
  }
  if (!rec) return false;
  hideInDen(entity, rec);
  return true;
}

// A cub that grows up in the den with its mother comes out on its own (a grown tiger has a den of its
// own, and its turns: animals/tigerTurns.js). animals/nursery.js growUp.
export function letCubOut(animalId) {
  const rec = allDens().find((d) => d.cubs?.includes(animalId));
  if (!rec) return;
  rec.cubs = rec.cubs.filter((id) => id !== animalId);
  if (!rec.cubs.length) rec.cubs = undefined;
  db.put(EQUIP, rec);
  const e = liveEntity(animalId);
  if (e) outOfDen(e, rec);
}

// Does this exhibit hold a dangerous species (its keepers' rules, the danger to players)?
export function isDangerousExhibit(ex) {
  return animalsIn(ex).some((a) => isDangerous(SPECIES[a.speciesId]));
}

// The controller walked the animal up to the den door: in it goes.
export function arrivedAtDen(entity) {
  const it = intents.get(entity.id);
  if (it?.kind !== "den") return false;
  const rec = db.get(EQUIP, it.denId);
  if (!rec || rec.held) {
    intents.delete(entity.id);
    return false;
  }
  return shutIn(entity, rec, { turn: it.turn });
}

// Call this animal into this den (animals/tigerTurns.js: the tiger whose turn out is over). opts.turn:
// the turns shut it in, and only the turns let it out. Returns false when it isn't about or the den is full.
export function callAnimalIn(animalId, rec, opts = {}) {
  const e = liveEntity(animalId);
  if (!e || rec.held) return false;
  intents.set(e.id, { kind: "den", denId: rec.id, to: frontOf(rec), since: system.currentTick, turn: Boolean(opts.turn) });
  return true;
}

// Call a loose animal into this den: the nearest of the exhibit's grown dangerous animals that isn't in
// a den. Returns its name, or why not.
export function callIn(rec) {
  const ex = rec.exhibitId && getExhibit(rec.exhibitId);
  if (!ex) return { why: "This Holding Den isn't in an exhibit's fence yet: measure the exhibit with the Habitat Marker." };
  if (rec.held) return { why: `${getAnimal(rec.held)?.name ?? "An animal"} is already shut in here.` };
  const loose = animalsIn(ex).filter((a) => isDangerous(SPECIES[a.speciesId]) && !a.juvenile && !isDenned(a.id) && !intentFor(a, "den"));
  let best;
  for (const a of loose) {
    const e = liveEntity(a.id);
    if (!e) continue;
    const d = Math.hypot(e.location.x - rec.pos.x, e.location.z - rec.pos.z);
    if (!best || d < best.d) best = { a, e, d };
  }
  if (!best) return { why: loose.length ? "None of them is close enough to hear: come back when you're nearer the exhibit." : "Every grown animal in this exhibit is already shut in." };
  intents.set(best.e.id, { kind: "den", denId: rec.id, to: frontOf(rec), since: system.currentTick });
  return { name: best.a.name };
}

function intentFor(a, kind) {
  const e = liveEntity(a.id);
  return e && intents.get(e.id)?.kind === kind;
}

// What the controller should do with this animal now (or undefined: its own life).
export function intentOf(entityId) {
  return intents.get(entityId);
}

export function clearIntent(entityId, kind = undefined) {
  if (!kind || intents.get(entityId)?.kind === kind) intents.delete(entityId);
}

// ---------------- the Holding Den block ----------------

function sideOf(player, rec) {
  const d = DIR[rec.facing] ?? DIR.north;
  const dx = player.location.x - (rec.pos.x + 0.5);
  const dz = player.location.z - (rec.pos.z + 0.5);
  return dx * d.x + dz * d.z >= 0 ? "front" : "back";
}

async function denMenu(player, rec) {
  const ex = rec.exhibitId && getExhibit(rec.exhibitId);
  const held = rec.held && getAnimal(rec.held);
  const species = held ? SPECIES[held.speciesId] : ex ? SPECIES[ex.speciesId] : undefined;
  const lines = [];
  lines.push(ex ? `In the fence of §f${ex.name}§r.` : "§eNot in an exhibit's fence yet.§r Set it into the fence with its door facing in, then measure the exhibit with the Habitat Marker.");
  const cubs = (rec.cubs ?? []).map((id) => getAnimal(id)?.name).filter(Boolean);
  const young = (n) => (n === 1 ? species?.breeding?.young ?? "cub" : species?.breeding?.youngPlural ?? "cubs");
  lines.push(held ? `§fShut in: ${held.name} the ${species?.displayName ?? "animal"}${cubs.length ? ` with her ${young(cubs.length)} ${cubs.join(" and ")}` : ""}.` : "§7Empty: the door is up.");
  if (held && rec.turn) lines.push("§7In for the turns: tigers live alone, so the others stay in while one is out, a different one each park day. Let out early, it's called back in.");
  if (ex) {
    const dens = densOf(ex);
    const need = densNeeded(species ?? {}, animalsIn(ex).filter((a) => isDangerous(SPECIES[a.speciesId])));
    if (need) lines.push(`§7Dens: ${dens.length} for ${need} needed (${dens.filter((d) => d.held).length} shut in).`);
  }
  lines.push("§7Worked from outside: big cats, crocodiles and gorillas are shut in here before anyone goes into their exhibit. Keepers do it themselves.");
  const form = new ActionFormData().title("Holding Den").body(lines.join("\n"));
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  const crate = heldItem(player)?.typeId === "zoocraft:reinforced_crate";
  if (!held && ex) add("Call one in", () => {
    const r = callIn(rec);
    message(player, r.name ? `§aCalling ${r.name} into the den with ${species?.dietTags.includes("meat") ? "a bit of meat" : "a treat"}.` : `§e${r.why}`);
  });
  if (held) add(`Let ${held.name} out`, () => {
    letOut(rec);
    message(player, `§a${held.name} is out${cubs.length ? `, with her ${young(cubs.length)}` : ""}.`);
  });
  if (held && crate) add(`Crate ${held.name}`, () => emit("crateFromDen", { player, den: rec }));
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

export function holdingDenComponent() {
  return {
    beforeOnPlayerPlace(e) {
      const above = e.block.above();
      if (!above?.isAir) {
        e.cancel = true;
        if (e.player) system.run(() => message(e.player, "§eA Holding Den needs two blocks of space."));
      }
    },
    onPlace(e) {
      const block = e.block;
      if (block.typeId !== BLOCKS.holdingDen) return;
      const facing = denFacing(block);
      system.run(() => {
        const above = block.above();
        if (above?.isAir) {
          above.setType(BLOCKS.holdingDenTop);
          above.setPermutation(above.permutation.withState(FACING, facing));
        }
        const rec = ensureDen(block);
        emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos });
      });
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensureDen(e.block);
      system.run(() => {
        if (!can(player, "care")) return message(player, denyText("care"));
        if (sideOf(player, rec) === "front") return message(player, "§eWork the Holding Den from outside the fence, behind it: its door faces into the exhibit.");
        denMenu(player, rec);
      });
    },
    onPlayerBreak(e) {
      const wasTop = e.brokenBlockPermutation.type.id === BLOCKS.holdingDenTop;
      const bottomPos = wasTop ? { x: e.block.x, y: e.block.y - 1, z: e.block.z } : { x: e.block.x, y: e.block.y, z: e.block.z };
      const dimension = e.block.dimension;
      const id = posKey(dimension.id, bottomPos);
      const rec = db.get(EQUIP, id);
      if (rec?.held) letOut(rec); // never bury an animal in a broken den
      system.run(() => {
        const other = dimension.getBlock(wasTop ? bottomPos : { x: bottomPos.x, y: bottomPos.y + 1, z: bottomPos.z });
        if (other && (other.typeId === BLOCKS.holdingDen || other.typeId === BLOCKS.holdingDenTop)) other.setType("minecraft:air");
        if (wasTop && e.player?.getGameMode() !== "Creative") dimension.spawnItem(new ItemStack(BLOCKS.holdingDen, 1), { x: bottomPos.x + 0.5, y: bottomPos.y + 0.5, z: bottomPos.z + 0.5 });
        if (rec) {
          db.remove(EQUIP, id);
          emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos, removed: rec });
        }
      });
    },
  };
}

// ---------------- the service entrance ----------------

// Keeper Gates get a record ("gate", keyed by the bottom half) when placed or first used, so an exhibit
// can find its service entrance by its measurement.
export function gateRecord(bottom) {
  const id = posKey(bottom.dimension.id, bottom.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "gate", dimension: bottom.dimension.id, pos: { x: bottom.x, y: bottom.y, z: bottom.z } };
    db.put(EQUIP, rec);
  }
  return rec;
}

export function forgetGate(dimensionId, pos) {
  const id = posKey(dimensionId, pos);
  if (db.get(EQUIP, id)?.type === "gate") db.remove(EQUIP, id);
}

// The exhibit's double Keeper Gates, from its last measurement (each pair: inner in the fence, outer
// outside it). Kept on the exhibit (ex.service) by measureService.
export function measureService(ex, cells) {
  const near = (p) => ex.bbox && p.x >= ex.bbox.min.x - BALANCE.predators.gates.pairMax - 1 && p.x <= ex.bbox.max.x + BALANCE.predators.gates.pairMax + 1 && p.z >= ex.bbox.min.z - BALANCE.predators.gates.pairMax - 1 && p.z <= ex.bbox.max.z + BALANCE.predators.gates.pairMax + 1;
  const gates = db.all(EQUIP).filter((r) => r.type === "gate" && r.dimension === ex.dimension && near(r.pos));
  const touches = (p) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => cells.get(`${p.x + dx},${p.y},${p.z + dz}`) === "land");
  return servicePairs(gates, touches, BALANCE.predators.gates);
}

function gateOpen(id) {
  const rec = db.get(EQUIP, id);
  if (!rec) return false;
  try {
    const b = dim(rec.dimension).getBlock(rec.pos);
    return Boolean(b?.permutation.getState(/** @type {any} */ ("zoocraft:open")));
  } catch {
    return false;
  }
}

// The interlock: may this Keeper Gate open? (No while the other gate of its pair is open.)
export function interlockText(bottom) {
  const id = posKey(bottom.dimension.id, bottom.location);
  for (const ex of db.all("exhibits")) {
    if (!ex.service?.length || ex.dimension !== bottom.dimension.id) continue;
    const other = interlockedBy(id, ex.service, gateOpen);
    if (other) return "§eThe other gate of this double Keeper Gate is open: one at a time. Wait for it to swing shut.";
  }
  return undefined;
}

// Does an open gate at `pos` belong to a pair whose other gate is shut? (Then the exhibit is still
// closed: that's the airlock working, not an open gate.)
export function airlockHolds(ex, pos) {
  for (const p of ex.service ?? []) {
    const mine = (q) => q.x === pos.x && q.z === pos.z && (q.y === pos.y || q.y === pos.y - 1);
    if (mine(p.innerPos) && !gateOpen(p.outer)) return true;
    if (mine(p.outerPos) && !gateOpen(p.inner)) return true;
  }
  return false;
}

// ---------------- keepers ----------------

// Is a keeper shifting this exhibit's animals or working in it (they're let out when the job ends)? The
// tigers' turns wait till then (animals/tigerTurns.js).
export function keeperBusy(exId) {
  return keeperShut.has(exId);
}

// What stops a keeper going into this exhibit, or undefined. Only dangerous exhibits have rules.
export function keeperStop(ex) {
  const group = animalsIn(ex).filter((a) => isDangerous(SPECIES[a.speciesId]));
  if (!group.length) return undefined;
  const species = SPECIES[group[0].speciesId];
  return keeperBlock(species, ex, { pairs: ex.service ?? [], needed: densNeeded(species, group), have: densOf(ex).length, shore: species.shoreClear ? shoreBlock(ex, BALANCE.croc) : undefined });
}

// Visible keeper, before going in: call every loose grown animal into a den. Returns { done, text }:
// done once all are shut in (the count), text for the keeper's status.
export function shiftForKeeper(ex) {
  const group = animalsIn(ex).filter((a) => isDangerous(SPECIES[a.speciesId]));
  if (!group.length) return { done: true };
  const species = SPECIES[group[0].speciesId];
  const dens = densOf(ex);
  const view = group.map((a) => {
    const e = liveEntity(a.id);
    return { id: a.id, juvenile: a.juvenile, denId: denOf(a.id)?.id, pos: e ? e.location : dens[0]?.pos ?? ex.controller, e };
  });
  const shut = keeperShut.get(ex.id) ?? new Set();
  keeperShut.set(ex.id, shut);
  const plan = shiftPlan(view, dens.map((d) => ({ id: d.id, pos: d.pos, held: d.held })));
  for (const { animalId, denId } of plan.assign) {
    const v = view.find((x) => x.id === animalId);
    if (!v?.e) continue;
    const it = intents.get(v.e.id);
    if (it?.kind === "den") continue;
    const rec = db.get(EQUIP, denId);
    intents.set(v.e.id, { kind: "den", denId, to: frontOf(rec), since: system.currentTick, keeper: true });
    shut.add(denId);
  }
  const grown = view.filter((v) => !v.juvenile);
  const inNow = grown.filter((v) => v.denId).length;
  const many = pluralOf(species).toLowerCase();
  if (allShutIn(view)) return { done: true, text: `Counted: all ${grown.length} ${many} shut in` };
  return { done: false, text: `Shifting the ${many} into their Holding Dens (${inNow} of ${grown.length} in)` };
}

// After the job: let out every animal the keeper shut in.
export function releaseAfterKeeper(ex) {
  const shut = keeperShut.get(ex.id);
  if (!shut) return;
  for (const id of shut) {
    const rec = db.get(EQUIP, id);
    if (rec?.held) letOut(rec);
  }
  keeperShut.delete(ex.id);
}

// The cells a visible keeper walks through: outside the outer gate, between the gates, inside the inner
// gate. pair: one of ex.service.
export function airlockWalk(pair) {
  const o = pair.outerPos;
  const i = pair.innerPos;
  const sx = Math.sign(i.x - o.x);
  const sz = Math.sign(i.z - o.z);
  return {
    outside: { x: o.x - sx, y: o.y, z: o.z - sz },
    between: { x: Math.round((o.x + i.x) / 2), y: o.y, z: Math.round((o.z + i.z) / 2) },
    inside: { x: i.x + sx, y: i.y, z: i.z + sz },
  };
}

// ---------------- danger to players inside the exhibit ----------------

function vulnerable(p) {
  try {
    const m = p.getGameMode();
    return m === "Survival" || m === "Adventure" || m === "survival" || m === "adventure";
  } catch {
    return false;
  }
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
}

// Every 10 ticks: zoo animals of dangerous species near players; the warn and swipe.
export function tickPredators(now) {
  const D = BALANCE.predators.danger;
  const players = onlinePlayers();
  const seen = new Set();
  for (const player of players) {
    let near;
    try {
      near = player.dimension.getEntities({ location: player.location, maxDistance: RANGE, families: ["zoocraft_animal"] });
    } catch {
      continue;
    }
    for (const e of near) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      const a = animalFromEntity(e);
      const species = a && SPECIES[a.speciesId];
      if (!isDangerous(species) || a.location.kind !== "exhibit" || a.juvenile) continue; // cubs are no danger
      stepDanger(e, a, species, players, now, D);
    }
  }
  for (const k of [...danger.keys()]) if (!seen.has(k.split("|")[0])) danger.delete(k);
  for (const id of [...intents.keys()]) {
    const it = intents.get(id);
    if (it.kind === "den" && now - it.since > BALANCE.predators.dens.callTicks) intents.delete(id); // it didn't come
  }
  tickWildBait(now, players);
}

function stepDanger(e, a, species, players, now, D) {
  const denned = isDenned(a.id);
  let worst; // the player it deals with first: charging beats warning
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const dist = Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z);
    if (dist > D.warnRange + D.leaveSlack + 4) {
      danger.delete(`${e.id}|${p.id}`);
      continue;
    }
    const k = `${e.id}|${p.id}`;
    const before = danger.get(k);
    // Inside: standing in it, or swimming in its pool (a swimmer's feet are under the top water block).
    const pc = cellOf(p.location);
    const inside = isInsideCells(a.location.id, pc, ["land", "water"]) || isInsideCells(a.location.id, { ...pc, y: pc.y + 1 }, ["water"]);
    const s = dangerStep(before, { inside, vulnerable: vulnerable(p), denned, dist, sneaking: p.isSneaking }, now, D);
    danger.set(k, s);
    // The paw lands when the strike does: lion.js starts the swipe on its next step (two ticks on) and the
    // blow comes about half a second into it. Out of reach by then, it missed.
    if (s.swipe) system.runTimeout(() => swipe(e, p, species, D), STRIKE_TICKS);
    if (s.phase === "warn" && before?.phase !== "warn") warnPlayer(e, p, a, species);
    const rank = { charge: 3, warn: 2, back: 1, calm: 0 }[s.phase];
    if (!worst || rank > worst.rank) worst = { rank, s, p };
  }
  const it = intents.get(e.id);
  if (it && it.kind !== "warn" && it.kind !== "charge" && it.kind !== "back") return; // going to its den: that comes first
  if (!worst || worst.rank === 0) {
    if (it) intents.delete(e.id);
    return;
  }
  const kind = worst.s.phase;
  // swiped: it backs off from a swipe that landed (the controller plays the strike first), not a miss.
  if (it?.kind !== kind || it.playerId !== worst.p.id) intents.set(e.id, { kind, playerId: worst.p.id, since: now, swiped: Boolean(worst.s.swipe) });
}

function warnPlayer(e, p, a, species) {
  try {
    p.onScreenDisplay.setActionBar(`§c${a.name} is warning you off: leave the exhibit, or shut it in a Holding Den from outside`);
    e.dimension.playSound(species.sounds?.warn ?? "mob.polarbear.warning", e.location, { volume: 1, pitch: species.sounds?.warnPitch ?? 0.7 });
  } catch {
    // gone
  }
}

function swipe(e, p, species, D) {
  try {
    if (!e.isValid || !p.isValid || !vulnerable(p)) return;
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > D.reach + 0.75) return; // it didn't get there after all
    p.applyDamage(D.damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * D.knock, z: (dz / len) * D.knock }, D.lift);
    e.dimension.playSound(species.sounds?.swipe ?? "mob.ravager.bite", e.location, { volume: 1, pitch: species.sounds?.swipePitch ?? 1.1 });
  } catch (error) {
    log(`predators: swipe: ${error}`);
  }
}

// Was this player warned off by an animal of this exhibit lately (for the Field Journal and tests)?
export function dangerPhase(entityId, playerId) {
  return danger.get(`${entityId}|${playerId}`)?.phase ?? "calm";
}

// ---------------- the wild: bait thrown down ----------------

// The wild mobs of dangerous species: only they have the hunting and calm groups (zoocraft:hunt, zoocraft:calm).
function wildType(typeId) {
  return Object.values(SPECIES).some((s) => s.dangerous && s.wildSource === typeId);
}
function huntEvent(e, ev) {
  if (wildType(e.typeId)) e.triggerEvent(ev);
}
// A zoo gorilla out of its exhibit (species.ape, 0.1.80) is baited as a wild one is.
function looseApe(e) {
  const a = animalFromEntity(e);
  return Boolean(a?.outside && SPECIES[a.speciesId]?.ape);
}

// Every 10 ticks (from tickPredators): a wild predator near a thrown ration of its own bait (a Meat Ration, a
// Fruit Ration for a gorilla) goes to it and eats (its hunting group off: zoocraft:calm), and stays calm a
// while: then it can be crated. So does a zoo gorilla that got out of its exhibit.
function tickWildBait(now, players) {
  const B = BALANCE.predators.bait;
  for (const [id, c] of [...calm]) {
    if (now < c.until) continue;
    calm.delete(id);
    const e = world.getEntity(id);
    if (e?.isValid) {
      huntEvent(e, "zoocraft:hunt");
      intents.delete(id);
    }
  }
  const kinds = Object.values(SPECIES).filter((s) => s.dangerous).flatMap((s) => [{ type: s.wildSource, bait: s.baitItem }, ...(s.ape ? [{ type: s.entityType, bait: s.baitItem, loose: true }] : [])]);
  const baits = new Set(kinds.map((k) => k.bait));
  const seen = new Set();
  for (const p of players) {
    let items, wild;
    try {
      items = p.dimension.getEntities({ location: p.location, maxDistance: RANGE, type: "minecraft:item" }).filter((it) => baits.has(it.getComponent("minecraft:item")?.itemStack?.typeId));
      if (!items.length) continue;
      wild = kinds.flatMap((k) => p.dimension.getEntities({ location: p.location, maxDistance: RANGE, type: k.type }).filter((w) => !k.loose || looseApe(w)).map((w) => ({ w, bait: k.bait })));
    } catch {
      continue;
    }
    for (const { w, bait } of wild) {
      if (seen.has(w.id) || calm.has(w.id)) continue;
      seen.add(w.id);
      const tried = unreachable.get(w.id);
      if (tried && now >= tried.until) unreachable.delete(w.id);
      const item = baitNear(w.location, items.filter((it) => it.getComponent("minecraft:item")?.itemStack?.typeId === bait && !(tried && now < tried.until && tried.ids.has(it.id))).map((it) => ({ id: it.id, pos: it.location, it })), B.range);
      if (!item) continue;
      calm.set(w.id, { until: now + B.calmTicks, itemId: item.id });
      huntEvent(w, "zoocraft:calm");
      intents.set(w.id, { kind: "bait", itemId: item.id, to: cellOf(item.pos), since: now });
    }
  }
}

// The controller reached the bait: it's eaten (the item goes) and the calm runs from now. Returns false
// when the bait is gone (someone picked it up, or it despawned): no meal, so no calm, and it hunts again.
export function ateBait(entity, now) {
  const it = intents.get(entity.id);
  if (it?.kind !== "bait") return false;
  let item;
  try {
    item = world.getEntity(it.itemId);
  } catch {
    item = undefined;
  }
  if (!item?.isValid) {
    hurtWild(entity.id);
    return false;
  }
  try {
    const s = item.getComponent("minecraft:item")?.itemStack;
    if (s && s.amount > 1) {
      const loc = item.location;
      const d = item.dimension;
      item.remove();
      const rest = new ItemStack(s.typeId, s.amount - 1);
      d.spawnItem(rest, loc);
    } else item.remove();
  } catch {
    // gone
  }
  const c = calm.get(entity.id);
  if (c) {
    c.until = Math.max(c.until, now + BALANCE.predators.bait.calmTicks);
    c.fed = true;
  }
  it.kind = "eat";
  return true;
}

// The controller found no way to the meat (across a fence, up a cliff): it hunts again, and leaves that
// piece of meat be from now on.
export function baitUnreachable(entityId) {
  const it = intents.get(entityId);
  if (it?.kind === "bait") {
    const tried = unreachable.get(entityId) ?? { ids: new Set(), until: 0 };
    tried.ids.add(it.itemId);
    tried.until = system.currentTick + 1200; // a minute, then it may try again (the ground may have changed)
    unreachable.set(entityId, tried);
  }
  hurtWild(entityId);
}

// A wild predator hurt by a player: no longer calm (whatever it was eating), it hunts again.
export function hurtWild(entityId) {
  calm.delete(entityId);
  intents.delete(entityId);
  try {
    const e = world.getEntity(entityId);
    if (e?.isValid) huntEvent(e, "zoocraft:hunt");
  } catch {
    // gone
  }
}

// A big cat just let go in the wild (a conservation release, transport/carriers.js) is calm a while:
// time for whoever let it out to walk away.
export function calmFor(entity, ticks) {
  calm.set(entity.id, { until: system.currentTick + ticks, itemId: undefined });
  try {
    huntEvent(entity, "zoocraft:calm");
  } catch {
    // gone
  }
}

// Is this wild predator calm (going to a thrown Meat Ration, eating it, fed, or just released)? Then it
// doesn't hunt.
export function isCalm(entityId) {
  return calm.has(entityId);
}

// Has it eaten the Meat Ration (eating it now, or fed and still calm)? Only then a carrier can take it:
// not while it's still on its way to the meat.
export function isFed(entityId) {
  return Boolean(calm.get(entityId)?.fed);
}

export function initPredators() {
  log(`predators: ${allDens().length} Holding Dens`);
}
