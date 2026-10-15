import { system, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, BLOCKS, ITEMS, ENTITIES, foodLook, rationCount } from "../data/items.js";
import { newId, posKey } from "../core/ids.js";
import { emit } from "../core/events.js";
import { can, denyText } from "../park/park.js";
import { coolingValue, heatValue, chargeValue } from "./rules.js";
import { anchorCapacity, anchorUsePerDay } from "../research/research.js";
import { heldItem, setHeldItem, giveItem, message, dim } from "../platform/mc.js";
import { gateRecord, forgetGate, interlockText } from "../animals/predators.js";

// Exhibit equipment other than feeders (spec section 10): Water Trough, Hanging Food Basket,
// Water Filter, Cooling Unit, Thermal Regulator, Ember Den, Recovery Station, the Floating Toy, the Enrichment Ball and the
// Nether toys (Blaze Bone, Wither Skull Ball), the Void Perch (0.1.51) Void Rays rest on, and the Containment
// Anchor and Rift Tunnel (0.1.52) Rift Ferrets blink with, the Burrow Shelter (0.1.62) hedgehogs sleep in, and the Climbing
// Frame (0.1.71) raccoons climb, three blocks tall (its record sits on the bottom part), and the Flock Mirror
// (0.1.72) that makes a small flamingo flock feel bigger, and the Scent Post (0.1.75) the keepers rub
// scents on for lions to investigate. Holding Dens (0.1.75) are "holding" records found and linked the
// same way (their block is animals/predators.js's). Each piece is an
// "equipment" record keyed by its block position (a toy or ball by its own id), so it works while its chunk is unloaded. The
// block's look is a view of the record. Exhibits link the pieces on validation.

const EQUIP = "equipment";
const RID = "zoocraft:rid";
/** @type {any} Custom block states aren't in the vanilla typings. */
const FILL = "zoocraft:fill";
/** @type {any} */
const FOOD = "zoocraft:food";
/** @type {any} */
const WORKING = "zoocraft:working";
/** @type {any} */
const OPEN = "zoocraft:open";
/** @type {any} */
const PART = "minecraft:multi_block_part";

const TYPE_OF_BLOCK = { [BLOCKS.trough]: "trough", [BLOCKS.lavaTrough]: "trough", [BLOCKS.basket]: "basket", [BLOCKS.filter]: "filter", [BLOCKS.station]: "station", [BLOCKS.cooler]: "cooler", [BLOCKS.heater]: "heater", [BLOCKS.emberDen]: "den", [BLOCKS.perch]: "perch", [BLOCKS.anchor]: "anchor", [BLOCKS.tunnel]: "tunnel", [BLOCKS.burrow]: "burrow", [BLOCKS.climbingFrame]: "frame", [BLOCKS.flockMirror]: "mirror", [BLOCKS.scentPost]: "scent" };
const FIXTURE_TYPES = new Set(["trough", "basket", "filter", "station", "toy", "ball", "bone", "skull", "cooler", "heater", "den", "perch", "anchor", "tunnel", "burrow", "frame", "mirror", "scent", "holding"]);
const LOOSE = new Set(["toy", "ball", "bone", "skull"]);

export function allFixtures(type) {
  return db.all(EQUIP).filter((e) => (type ? e.type === type : FIXTURE_TYPES.has(e.type)));
}

export function fixturesOf(ex) {
  return (ex.fixtureIds ?? []).map((id) => db.get(EQUIP, id)).filter(Boolean);
}

export function saveFixture(rec) {
  db.put(EQUIP, rec);
}

// The block holding the record: the bottom part of a Climbing Frame.
function baseOf(block) {
  if (block.typeId !== BLOCKS.climbingFrame) return block;
  const part = block.permutation.getState(PART) ?? 0;
  return part > 0 ? block.dimension.getBlock({ x: block.x, y: block.y - part, z: block.z }) ?? block : block;
}

function ensure(placed) {
  const block = baseOf(placed);
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    const type = TYPE_OF_BLOCK[block.typeId];
    rec = { id, type, blockId: block.typeId, dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, exhibitId: undefined };
    if (type === "trough" || type === "cooler" || type === "heater" || type === "anchor") rec.units = 0;
    if (block.typeId === BLOCKS.lavaTrough) rec.liquid = "lava"; // a Water Trough has no liquid set: water
    if (type === "basket") Object.assign(rec, { units: 0, item: undefined });
    db.put(EQUIP, rec);
  }
  return rec;
}

// Make the block show its record: trough water level, basket food (and which food), filter light, cooler light, anchor charge.
export function refreshLook(rec) {
  if (LOOSE.has(rec.type) || rec.type === "station" || rec.type === "den" || rec.type === "perch" || rec.type === "tunnel" || rec.type === "burrow" || rec.type === "frame" || rec.type === "mirror" || rec.type === "scent" || rec.type === "holding") return;
  try {
    const d = dim(rec.dimension);
    if (!d.isChunkLoaded(rec.pos)) return;
    const block = d.getBlock(rec.pos);
    if (!block || block.typeId !== rec.blockId) return;
    let name = FILL;
    let value;
    if (rec.type === "trough") value = rec.units <= 0 ? 0 : rec.units <= BALANCE.trough.lowAt ? 1 : 2;
    else if (rec.type === "cooler") value = rec.units <= 0 ? 0 : rec.units <= BALANCE.cooler.lowAt ? 1 : 2;
    else if (rec.type === "heater") value = rec.units <= 0 ? 0 : rec.units <= BALANCE.heater.lowAt ? 1 : 2;
    else if (rec.type === "anchor") value = rec.units <= 0 ? 0 : rec.units <= BALANCE.anchor.lowAt ? 1 : 2;
    else if (rec.type === "basket") value = rec.units > 0 ? 1 : 0;
    else {
      name = WORKING;
      value = Boolean(rec.exhibitId);
    }
    // A basket also shows which food it holds.
    const food = rec.type === "basket" ? foodLook(rec.item) : undefined;
    let perm = block.permutation;
    if (perm.getState(name) === value && (food === undefined || perm.getState(FOOD) === food)) return;
    perm = perm.withState(name, value);
    if (food !== undefined) perm = perm.withState(FOOD, food);
    block.setPermutation(perm);
  } catch {
    // Unloaded or replaced; the look catches up next time.
  }
}

function useItem(player, stack, count) {
  if (count >= stack.amount) setHeldItem(player, undefined);
  else {
    stack.amount -= count;
    setHeldItem(player, stack);
  }
}

function interact(player, rec) {
  const stack = heldItem(player);
  if (rec.type === "station") return emit("openHolding", { player });
  if (rec.type === "den") {
    return message(player, rec.exhibitId ? "§6Ember Den: §fin this exhibit. §7Ember Foxes curl up in it to sleep; keep the Thermal Regulator fuelled so it stays warm." : "§6Ember Den: §fnot in an exhibit. §7Place it on an exhibit's floor (foxes walk into it), then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "burrow") {
    return message(player, rec.exhibitId ? "§6Burrow Shelter: §fin this exhibit. §7Hedgehogs trot in and sleep in it: by day, or at night in a nocturnal house (an exhibit roofed over)." : "§6Burrow Shelter: §fnot in an exhibit. §7Place it on an exhibit's floor (hedgehogs walk into it), then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "frame") {
    return message(player, rec.exhibitId ? "§6Climbing Frame: §fin this exhibit. §7Raccoons climb it, look out from the top by day and nap up there at night. It counts as a climbing tree, and as climbing enrichment." : "§6Climbing Frame: §fnot in an exhibit. §7Stand it on an exhibit's floor (open ground beside it), then measure the exhibit with the Habitat Marker. Keep it away from the walls: climbers can use it to get over them.");
  }
  if (rec.type === "mirror") {
    const nest = SPECIES["zoocraft:flamingo"].nest;
    return message(player, rec.exhibitId ? `§6Flock Mirror: §fin this exhibit. §7Flamingos see their flock in it: each mirror makes the flock feel ${nest.mirrorBirds} birds bigger (up to twice its size), so a small flock still displays and can nest. They nest in a flock of ${nest.flock}.` : "§6Flock Mirror: §fnot in an exhibit. §7Stand it at the water's edge inside a flamingo exhibit, then measure the exhibit with the Habitat Marker. Flamingos see their flock in it.");
  }
  if (rec.type === "scent") {
    return message(player, rec.exhibitId ? "§6Scent Post: §fin this exhibit. §7Keepers rub new scents on it (spices, other animals' bedding): lions come to sniff it, pull the flehmen face, rub their cheeks on it, claw it and spray it. It counts as scent enrichment." : "§6Scent Post: §fnot in an exhibit. §7Stand it on an exhibit's floor (open ground beside it), then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "perch") {
    return message(player, rec.exhibitId ? "§6Void Perch: §fin this exhibit. §7Void Rays glide down to it and rest on the ledge." : "§6Void Perch: §fnot in an exhibit. §7Float it up in the air inside a roofed exhibit (air under it and room above it), then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "tunnel") {
    return message(player, rec.exhibitId ? "§6Rift Tunnel: §fin this exhibit. §7Rift Ferrets blink from tunnel to tunnel and hide inside; place 2 or more." : "§6Rift Tunnel: §fnot in an exhibit. §7Place it on an exhibit's floor (ferrets walk into it), then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "anchor") {
    const each = stack ? chargeValue(stack.typeId, BALANCE) : 0;
    const cap = anchorCapacity();
    if (!each) return message(player, `§6Containment Anchor: §f${rec.units}/${cap} charge. §7${rec.exhibitId ? "It holds this exhibit's Rift Ferrets: their blinks land only inside it, and they stop blinking without charge" : "Place it beside an exhibit's floor, then measure the exhibit"}; it uses ${anchorUsePerDay()} a park day. Charge it with ender pearls, eyes of ender or popped chorus fruit.`);
    if (!can(player, "care")) return message(player, denyText("care"));
    if (rec.units >= cap) return message(player, "§eThe Containment Anchor is fully charged.");
    const items = Math.min(stack.amount, Math.ceil((cap - rec.units) / each));
    rec.units = Math.min(cap, rec.units + items * each);
    db.put(EQUIP, rec);
    useItem(player, stack, items);
    refreshLook(rec);
    const what = stack.typeId === "minecraft:ender_eye" ? (items === 1 ? "eye of ender" : "eyes of ender") : stack.typeId.slice("minecraft:".length).replace(/_/g, " ") + (items === 1 || stack.typeId === "minecraft:popped_chorus_fruit" ? "" : "s");
    return message(player, `§aAdded ${items} ${what} to the Containment Anchor: ${rec.units}/${cap} charge.`);
  }
  if (rec.type === "filter") {
    return message(player, rec.exhibitId ? "§aWater Filter: working. It keeps this pool clean." : "§cWater Filter: faulted. Place it at the edge of a pool or under the water, then measure the exhibit with the Habitat Marker.");
  }
  if (rec.type === "cooler") {
    const each = stack ? coolingValue(stack.typeId, BALANCE) : 0;
    const cap = BALANCE.cooler.capacity;
    if (!each) return message(player, `§6Cooling Unit: §f${rec.units}/${cap} cold. §7${rec.exhibitId ? "It keeps this exhibit cold for penguins" : "Place it beside an exhibit's floor or pool, then measure the exhibit"}; it uses ${BALANCE.cooler.unitsPerDay} a park day. Fill it with ice, packed ice, blue ice or snow blocks.`);
    if (!can(player, "care")) return message(player, denyText("care"));
    if (rec.units >= cap) return message(player, "§eThe Cooling Unit is full.");
    const items = Math.min(stack.amount, Math.ceil((cap - rec.units) / each));
    rec.units = Math.min(cap, rec.units + items * each);
    db.put(EQUIP, rec);
    useItem(player, stack, items);
    refreshLook(rec);
    const what = stack.typeId === "minecraft:snow" ? "snow blocks" : stack.typeId.slice("minecraft:".length).replace("_", " ");
    return message(player, `§aAdded ${items} ${what} to the Cooling Unit: ${rec.units}/${cap} cold.`);
  }
  if (rec.type === "heater") {
    const each = stack ? heatValue(stack.typeId, BALANCE) : 0;
    const cap = BALANCE.heater.capacity;
    if (!each) return message(player, `§6Thermal Regulator: §f${rec.units}/${cap} heat. §7${rec.exhibitId ? "It keeps this exhibit warm for Nether animals" : "Place it beside an exhibit's floor, then measure the exhibit"}; it uses ${BALANCE.heater.unitsPerDay} a park day. Fuel it with charcoal, coal, coal blocks or blaze rods.`);
    if (!can(player, "care")) return message(player, denyText("care"));
    if (rec.units >= cap) return message(player, "§eThe Thermal Regulator is full.");
    const items = Math.min(stack.amount, Math.ceil((cap - rec.units) / each));
    rec.units = Math.min(cap, rec.units + items * each);
    db.put(EQUIP, rec);
    useItem(player, stack, items);
    refreshLook(rec);
    const what = stack.typeId.slice("minecraft:".length).replace(/_/g, " ");
    return message(player, `§aAdded ${items} ${what} to the Thermal Regulator: ${rec.units}/${cap} heat.`);
  }
  if (rec.type === "trough") {
    // A Water Trough takes water buckets; a Lava Trough takes lava buckets (Basalt Tortoises drink lava).
    const liquid = rec.liquid ?? "water";
    const name = liquid === "lava" ? "Lava Trough" : "Water Trough";
    if (stack?.typeId !== `minecraft:${liquid}_bucket`) {
      const hint = stack?.typeId === "minecraft:lava_bucket" ? " Lava goes in a Lava Trough." : stack?.typeId === "minecraft:water_bucket" ? " Water goes in a Water Trough." : "";
      return message(player, `§6${name}: §f${rec.units}/${BALANCE.trough.capacity} ${liquid}. §7Fill it with a ${liquid} bucket.${hint}`);
    }
    if (!can(player, "care")) return message(player, denyText("care"));
    if (rec.units >= BALANCE.trough.capacity) return message(player, "§eThe trough is full.");
    rec.units = Math.min(BALANCE.trough.capacity, rec.units + BALANCE.trough.bucketUnits);
    db.put(EQUIP, rec);
    setHeldItem(player, new ItemStack("minecraft:bucket", 1));
    refreshLook(rec);
    return message(player, `§aFilled the trough: ${rec.units}/${BALANCE.trough.capacity} ${liquid}.`);
  }
  // Basket: any ration; the animals only forage at it if it's food they eat.
  const ration = stack && RATIONS[stack.typeId];
  if (!ration) {
    const what = rec.item ? `${rec.units} ${rationCount(rec.item, rec.units)}` : "empty";
    return message(player, `§6Hanging Food Basket: §f${what}. §7Fill it with rations the animals eat; they forage at it for enrichment. Over a lava pool, fill it with Molten Plankton Feed for Lava Rays.`);
  }
  if (!can(player, "care")) return message(player, denyText("care"));
  if (rec.item && rec.item !== stack.typeId) return message(player, "§cThis basket holds a different ration. Let it empty first.");
  const space = BALANCE.basket.capacity - rec.units;
  if (space <= 0) return message(player, "§eThe basket is full.");
  const items = Math.min(stack.amount, Math.ceil(space / ration.units));
  rec.units = Math.min(BALANCE.basket.capacity, rec.units + items * ration.units);
  rec.item = stack.typeId;
  db.put(EQUIP, rec);
  useItem(player, stack, items);
  refreshLook(rec);
  message(player, `§aAdded ${items} ration${items === 1 ? "" : "s"} to the basket: ${rec.units}/${BALANCE.basket.capacity}.`);
}

// Custom component for the trough, basket, filter, station, regulator, den, perch, anchor, tunnel, burrow, frame, mirror and scent post blocks.
export function fixtureComponent() {
  return {
    onPlace(e) {
      const rec = ensure(e.block);
      emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos });
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      system.run(() => interact(player, rec));
    },
    onPlayerBreak(e) {
      // A Climbing Frame comes down whole, whichever part was broken (its parts drop nothing): one
      // frame item back, and its record is on the bottom part.
      const frame = e.brokenBlockPermutation.type.id === BLOCKS.climbingFrame;
      const part = frame ? e.brokenBlockPermutation.getState(PART) ?? 0 : 0;
      if (frame && e.player?.getGameMode() !== "Creative") e.block.dimension.spawnItem(new ItemStack(BLOCKS.climbingFrame, 1), e.block.center());
      const id = posKey(e.block.dimension.id, { x: e.block.x, y: e.block.y - part, z: e.block.z });
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      // A basket gives its food back, so nothing is lost.
      if (rec.type === "basket" && rec.item && rec.units > 0) {
        const s = new ItemStack(rec.item, 1);
        s.amount = Math.min(rec.units, s.maxAmount);
        e.block.dimension.spawnItem(s, e.block.center());
      }
      db.remove(EQUIP, id);
      emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos, removed: rec });
    },
  };
}

// --- Floating Toy: an item that becomes a toy floating on an exhibit's pool ---

export function placeToy(player, exhibitAt) {
  const hit = player.getBlockFromViewDirection({ maxDistance: 6, includeLiquidBlocks: true, includePassableBlocks: true });
  const block = hit?.block;
  if (!block || !(block.typeId === "minecraft:water" || block.typeId === "minecraft:flowing_water")) return message(player, "§eAim at the water in an exhibit's pool, then use the toy.");
  const ex = exhibitAt(block.dimension.id, block.location);
  if (!ex || !(ex.waterCells > 0)) return message(player, "§eThe toy goes in an exhibit's pool. Measure the exhibit with the Habitat Marker first.");
  if (!can(player, "care")) return message(player, denyText("care"));
  const stack = heldItem(player);
  if (stack?.typeId !== ITEMS.floatingToy) return;
  const rec = { id: newId("toy"), type: "toy", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, exhibitId: ex.id };
  const ent = block.dimension.spawnEntity(ENTITIES.floatingToy, { x: block.x + 0.5, y: block.y + 0.9, z: block.z + 0.5 });
  ent.setDynamicProperty(RID, rec.id);
  db.put(EQUIP, rec);
  useItem(player, stack, 1);
  emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos });
  message(player, `§aThe toy is floating in ${ex.name}'s pool.`);
}

// --- Ground toys: items that become a toy on an exhibit's floor. The Enrichment Ball (elephants push
// it about) is for anyone who likes to handle things; the Nether toys (Austin, 0.1.46) are each one
// species' favourite: a Blaze Bone for Ember Foxes, a Wither Skull Ball for Basalt Tortoises. ---

const GROUND_TOYS = {
  [ITEMS.enrichmentBall]: { type: "ball", entity: ENTITIES.enrichmentBall, name: "ball", placed: "The ball", who: "Animals that like to handle things (elephants, Ember Foxes and Basalt Tortoises) play with it." },
  [ITEMS.blazeBone]: { type: "bone", entity: ENTITIES.blazeBone, name: "Blaze Bone", placed: "The Blaze Bone", who: "Ember Foxes chew it and bury it in the ash; other animals leave it alone." },
  [ITEMS.witherSkullBall]: { type: "skull", entity: ENTITIES.witherSkullBall, name: "Wither Skull Ball", placed: "The Wither Skull Ball", who: "Basalt Tortoises nudge it about with their beaks; other animals leave it alone." },
};

export function placeGroundToy(player, exhibitAt, itemId) {
  const toy = GROUND_TOYS[itemId];
  if (!toy) return;
  const hit = player.getBlockFromViewDirection({ maxDistance: 6 });
  const block = hit?.block;
  const above = block && { x: block.x, y: block.y + 1, z: block.z };
  const ex = above && exhibitAt(block.dimension.id, above);
  if (!ex || !(ex.usableArea > 0)) return message(player, `§eAim at the ground inside an exhibit, then use the ${toy.name}. Measure the exhibit with the Habitat Marker first.`);
  if (!can(player, "care")) return message(player, denyText("care"));
  const stack = heldItem(player);
  if (stack?.typeId !== itemId) return;
  const rec = { id: newId(toy.type), type: toy.type, dimension: block.dimension.id, pos: above, exhibitId: ex.id };
  const ent = block.dimension.spawnEntity(toy.entity, { x: block.x + 0.5, y: block.y + 1, z: block.z + 0.5 });
  ent.setDynamicProperty(RID, rec.id);
  db.put(EQUIP, rec);
  useItem(player, stack, 1);
  emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos });
  message(player, `§a${toy.placed} is in ${ex.name}. §7${toy.who}`);
}

// The item each toy entity gives back when picked up.
const TOY_ITEM = {
  [ENTITIES.floatingToy]: ITEMS.floatingToy,
  [ENTITIES.enrichmentBall]: ITEMS.enrichmentBall,
  [ENTITIES.blazeBone]: ITEMS.blazeBone,
  [ENTITIES.witherSkullBall]: ITEMS.witherSkullBall,
};

export function isToyEntity(entity) {
  return Boolean(entity && TOY_ITEM[entity.typeId]);
}

// Using a toy or ball picks it back up.
export function pickUpToy(player, entity) {
  const item = TOY_ITEM[entity.typeId];
  const rid = entity.getDynamicProperty(RID);
  const rec = typeof rid === "string" && db.get(EQUIP, rid);
  entity.remove();
  if (rec) {
    db.remove(EQUIP, rec.id);
    emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos, removed: rec });
  }
  giveItem(player, item, 1);
}

// A toy whose record is gone (picked up, or the world was copied) is removed; a toy killed by a
// command takes its record with it.
export function trackToy(entity) {
  if (!isToyEntity(entity)) return;
  const rid = entity.getDynamicProperty(RID);
  if (typeof rid !== "string" || !db.get(EQUIP, rid)) entity.remove();
}

export function toyGone(entity) {
  if (!isToyEntity(entity)) return;
  try {
    const rid = entity.getDynamicProperty(RID);
    if (typeof rid === "string" && db.get(EQUIP, rid)) db.remove(EQUIP, rid);
  } catch {
    // Already gone.
  }
}

// --- Keeper Gate: a two-block gate only keepers, managers and the owner can open ---
// Two in a row, 2 to 4 blocks apart with one in the exhibit's fence, are a big predator exhibit's
// double service gate (0.1.75): the interlock lets only one of them open at a time
// (animals/predators.js). Each gate has a record so the exhibit measure finds its pairs.

const closeTimers = new Map(); // bottom position key -> run id

function gateHalves(block) {
  const bottom = block.typeId === BLOCKS.keeperGateTop ? block.below() : block;
  return { bottom, top: bottom?.above() };
}

function setOpen(block, open) {
  if (block && (block.typeId === BLOCKS.keeperGate || block.typeId === BLOCKS.keeperGateTop) && block.permutation.getState(OPEN) !== open) {
    block.setPermutation(block.permutation.withState(OPEN, open));
  }
}

export function keeperGateComponent() {
  return {
    beforeOnPlayerPlace(e) {
      const above = e.block.above();
      if (!above?.isAir) {
        e.cancel = true;
        if (e.player) system.run(() => message(e.player, "§eA Keeper Gate needs two blocks of space."));
      }
    },
    onPlace(e) {
      const block = e.block;
      if (block.typeId !== BLOCKS.keeperGate) return;
      const facing = block.permutation.getState(/** @type {any} */ ("minecraft:cardinal_direction"));
      system.run(() => {
        const above = block.above();
        if (!above?.isAir) return;
        above.setType(BLOCKS.keeperGateTop);
        above.setPermutation(above.permutation.withState(/** @type {any} */ ("minecraft:cardinal_direction"), facing));
        gateRecord(block);
        emit("equipmentChanged", { dimension: block.dimension.id, pos: block.location });
      });
    },
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player) return;
      system.run(() => {
        if (!can(player, "care")) return message(player, "§cStaff only: Keeper Gates open for keepers, managers and the owner.");
        const { bottom, top } = gateHalves(block);
        if (!bottom) return;
        gateRecord(bottom);
        const open = !bottom.permutation.getState(OPEN);
        // The interlock: one gate of a double Keeper Gate at a time.
        const locked = open && interlockText(bottom);
        if (locked) return message(player, locked);
        setOpen(bottom, open);
        setOpen(top, open);
        const k = posKey(bottom.dimension.id, bottom.location);
        if (closeTimers.has(k)) system.clearRun(closeTimers.get(k));
        closeTimers.delete(k);
        const where = { dimension: bottom.dimension, pos: { x: bottom.x, y: bottom.y, z: bottom.z } };
        if (open) {
          closeTimers.set(
            k,
            system.runTimeout(() => {
              closeTimers.delete(k);
              try {
                const b = where.dimension.getBlock(where.pos);
                setOpen(b, false);
                setOpen(b?.above(), false);
              } catch {
                // Unloaded: it stays as it was; the validator reports an open gate.
              }
              emit("equipmentChanged", { dimension: where.dimension.id, pos: where.pos });
            }, BALANCE.keeperGate.closeAfterTicks),
          );
        } else emit("equipmentChanged", { dimension: where.dimension.id, pos: where.pos });
      });
    },
    onPlayerBreak(e) {
      // Breaking either half removes the other one; only the bottom half drops the gate item.
      const other = e.brokenBlockPermutation.type.id === BLOCKS.keeperGate ? e.block.above() : e.block.below();
      const dropsItem = e.brokenBlockPermutation.type.id === BLOCKS.keeperGateTop;
      const dimension = e.block.dimension;
      const pos = other ? { x: other.x, y: other.y, z: other.z } : undefined;
      const bottomPos = e.brokenBlockPermutation.type.id === BLOCKS.keeperGate ? { x: e.block.x, y: e.block.y, z: e.block.z } : pos;
      if (bottomPos) forgetGate(dimension.id, bottomPos);
      system.run(() => {
        if (!pos) return;
        const b = dimension.getBlock(pos);
        if (b && (b.typeId === BLOCKS.keeperGate || b.typeId === BLOCKS.keeperGateTop)) {
          b.setType("minecraft:air");
          if (dropsItem && e.player?.getGameMode() !== "Creative") dimension.spawnItem(new ItemStack(BLOCKS.keeperGate, 1), b.center());
        }
        emit("equipmentChanged", { dimension: dimension.id, pos });
      });
    },
  };
}
