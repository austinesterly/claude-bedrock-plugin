import { ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { log } from "../core/log.js";
import { SPECIES, speciesForWild, pluralOf } from "../data/species.js";
import { CARRIERS, carrierByItem } from "../data/items.js";
import { TRANSFERS, move, checkToken, reconcile, pruneTransfers } from "./journal.js";
import { noRoomReason } from "../exhibits/room.js";
import { mixProblem } from "../exhibits/mixing.js";
import { getPark, parkTime, can, denyText, parkEdge, parkOfRecord, withPark } from "../park/park.js";
import { allExhibits, exhibitAt, validate, fitFor, isInsideCells, releaseSpot, addResident, removeResident, getExhibit } from "../exhibits/exhibits.js";
import { createAnimal, setLocation, spawnInExhibit, allAnimals, getAnimal, moveToHolding, animalFromEntity, despawn, labelOf } from "../animals/animals.js";
import { schoolLabel, tropicalLook } from "../animals/schoolRules.js";
import { HABITAT_PROFILES } from "../data/profiles.js";
import { heldItem, setHeldItem, countItem, takeItem, findItemSlot, setSlotItem, giveItem, message, center } from "../platform/mc.js";
import { canMove, notReadyText } from "../discovery/discovery.js";
import { researched } from "../research/research.js";
import { PROJECTS } from "../data/research.js";
import { checkRelease, siteCheckAt, wildSpot, commitRelease } from "../quests/conservation.js";
import { dimensionName, groundText, wildDistance } from "../quests/conservationRules.js";
import { BALANCE } from "../data/balance.js";
import { wildSex } from "../animals/zebraRules.js";
import { isFed, denOf, vacateDen, calmFor } from "../animals/predators.js";
import { crateBlock } from "../animals/predatorRules.js";

// Carriers (spec section 8). A carrier item holds only a transfer id and a one-time token; the
// animal record lives in the store the whole time. Every step is journaled so a crash, a full
// inventory or a copied carrier never makes a second animal or loses the only one (AC-05, AC-06).
// A carrier packed for a conservation release (0.1.57, transfer.purpose "release") can still be
// used in an exhibit like any other; used on the ground in the animal's home wilds, far from the
// park, it lets the animal go for good (quests/conservation.js).
// Big predators (0.1.75): a wild one goes into a Reinforced Crate only while it eats a Meat Ration thrown
// down near it (that's the bait: none is needed in the inventory); a zoo one only while it is shut in a
// Holding Den, crated through the den from outside the fence ("Crate" on the den's menu).

const P_TRANSFER = "zoocraft:transfer";
const P_TOKEN = "zoocraft:token";
const busy = new Set(); // player ids with a release in progress

function occupiedStack(carrier, transfer, animal) {
  const species = SPECIES[animal.speciesId];
  const stack = new ItemStack(carrier.occupied, 1);
  stack.setDynamicProperties({ [P_TRANSFER]: transfer.id, [P_TOKEN]: transfer.token });
  const hint = transfer.purpose === "release" ? `§r§7Bound for the wild: use on the ground in ${dimensionName(species.homeDimension)}, ${wildDistance(parkEdge() === "fence", BALANCE.conservation)}.` : species.school ? "§r§7Use on the bank of a ready aquarium, beside the water." : "§r§7Use on the ground inside a ready exhibit.";
  stack.setLore([species.school ? `§r§f${schoolLabel(species, animal.count ?? 1)} §7(${animal.name}'s school)` : `§r§f${animal.name} §7(${species.displayName})`, hint]);
  return stack;
}

// A Water Transport Tank on a wild fish (0.1.119): it and its kind within BALANCE.aquarium.catchRange go in together,
// as many as the species' school.max and as some aquarium has room for; no bait. Young ones are left. A tropical
// school keeps the look of the fish it was used on.
function packSchool(player, wild, carrier, species) {
  const shares = (ex) => !mixProblem(ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : []), species, SPECIES);
  const noRoom = noRoomReason(allExhibits(), species, (ex) => fitFor(ex, species, 1), shares);
  if (noRoom) return message(player, `§e${noRoom}`);
  const near = wild.dimension.getEntities({ type: wild.typeId, location: wild.location, maxDistance: BALANCE.aquarium.catchRange }).filter((e) => e.isValid && e.id !== wild.id && !e.getComponent("minecraft:is_baby"));
  const fish = [wild, ...near].slice(0, species.school.max);
  const tanks = allExhibits().filter((ex) => (ex.state === "ready" || ex.state === "occupied") && (!ex.speciesId || shares(ex)));
  let n = fish.length;
  while (n > 1 && !tanks.some((ex) => {
    const f = fitFor(ex, species, n);
    return !f.problem && f.cap.fits;
  })) n--;
  const now = parkTime();
  const transfer = { id: newId("tr"), token: newId("tk"), animalId: undefined, phase: "Reserved", source: { kind: "wild", type: wild.typeId }, createdAt: now, updatedAt: now };
  const animal = createAnimal(species, 0, { count: n, ...(species.looks ? { look: tropicalLook(wild) } : {}) });
  transfer.animalId = animal.id;
  db.put(TRANSFERS, transfer);
  setLocation(animal, { kind: "carrier", id: transfer.id });
  db.flush();
  const hand = heldItem(player);
  if (hand && hand.typeId === carrier.empty && hand.amount > 1) {
    hand.amount -= 1;
    setHeldItem(player, occupiedStack(carrier, transfer, animal));
    player.getComponent("minecraft:inventory")?.container?.addItem(hand);
  } else {
    setHeldItem(player, occupiedStack(carrier, transfer, animal));
  }
  for (const e of fish.slice(0, n)) if (e.isValid) e.remove();
  move(db, transfer, "Packed", now);
  db.flush();
  const left = fish.length - n;
  message(player, `§a${schoolLabel(species, n)} swam into the tank${left ? ` (the tank's aquarium has room for no more; ${left} stayed)` : ""}. Use it on the bank of their aquarium, beside the water.`);
}

// Wild animal + empty carrier in hand.
export function pack(player, wild) {
  const stack = heldItem(player);
  const carrier = stack && carrierByItem(stack.typeId);
  if (!carrier || carrier.full) return;
  if (!getPark()) return message(player, "§eClaim a park with a Park Deed first.");
  if (!can(player, "care")) return message(player, denyText("care"));
  const species = speciesForWild(wild.typeId);
  if (!species) return message(player, "§eThis animal isn't part of the zoo catalogue yet.");
  if (species.carrierProfile !== carrier.profile) return message(player, `§eA ${species.displayName} travels in a ${CARRIERS[species.carrierProfile]?.label ?? "different carrier"}.`);
  if (carrier.research && !researched(carrier.research)) return message(player, `§eThe ${carrier.label} needs ${PROJECTS.find((p) => p.id === carrier.research)?.name ?? "more"} research at the Research Desk first.`);
  if (wild.getComponent("minecraft:is_baby")) return message(player, "§eLeave the young ones with their families.");
  if (wild.getComponent("minecraft:is_tamed")) return message(player, `§eThis ${species.displayName} is tamed: it's a mount, not a zoo animal. Climb on and fly it.`);
  if (!canMove(player, species.id)) return message(player, `§e${notReadyText(player, species)}`); // 0.1.117: the player's own journal
  if (species.school) return packSchool(player, wild, carrier, species);
  const tooDangerous = crateBlock(species, { wild: true, eating: isFed(wild.id) }); // it has eaten the meat (not just on its way to it)
  if (tooDangerous) return message(player, `§e${tooDangerous}`);
  const noRoom = noRoomReason(allExhibits(), species, (ex) => fitFor(ex, species), (ex) => !mixProblem(ex.speciesIds ?? [ex.speciesId], species, SPECIES));
  if (noRoom) return message(player, `§e${noRoom}`);
  if (!species.dangerous && countItem(player, species.baitItem) < 1) return message(player, `§eYou need a ${species.baitItem.split(":")[1].replace(/_/g, " ")} in your inventory to coax it in.`);

  const now = parkTime();
  const coat = wild.getComponent("minecraft:variant")?.value ?? 0;
  const transfer = { id: newId("tr"), token: newId("tk"), animalId: undefined, phase: "Reserved", source: { kind: "wild", type: wild.typeId }, createdAt: now, updatedAt: now };
  // A harem species (zebras) keeps the sex it had in its wild herd (stallion or mare: zebraRules.js wildSex).
  // A lion's mane (light or dark, its wild mark_variant) stays with it.
  const extra = species.harem ? { sex: wildSex(wild.id) } : {};
  if (species.manes) extra.mane = wild.getComponent("minecraft:mark_variant")?.value ?? 0;
  // A tiger keeps its sex (its wild mark_variant: 1 a male) and its own stripes (skin_id).
  if (species.sexLook) extra.sex = wild.getComponent("minecraft:mark_variant")?.value === 1 ? "male" : "female";
  if (species.patterns) extra.pattern = wild.getComponent("minecraft:skin_id")?.value ?? 0;
  // A crocodile keeps its size class (its wild zoocraft:size) too.
  if (species.sizes) extra.size = Number(wild.getProperty("zoocraft:size") ?? 2);
  const animal = createAnimal(species, coat, extra);
  transfer.animalId = animal.id;
  db.put(TRANSFERS, transfer);
  setLocation(animal, { kind: "carrier", id: transfer.id });
  db.flush();

  if (!species.dangerous) takeItem(player, species.baitItem, 1); // a big cat already ate the thrown one
  // Write the carrier back into the hand slot (re-read: the bait may have been in the hand stack).
  const hand = heldItem(player);
  if (hand && hand.typeId === carrier.empty && hand.amount > 1) {
    hand.amount -= 1;
    setHeldItem(player, occupiedStack(carrier, transfer, animal));
    player.getComponent("minecraft:inventory")?.container?.addItem(hand);
  } else {
    setHeldItem(player, occupiedStack(carrier, transfer, animal));
  }
  // A wild strider may wear a saddle or carry a rider: the rider gets off and the saddle comes back.
  let saddled = false;
  try {
    wild.getComponent("minecraft:rideable")?.ejectRiders();
    saddled = Boolean(wild.getComponent("minecraft:is_saddled"));
  } catch {
    // not rideable
  }
  wild.remove();
  if (saddled) giveItem(player, "minecraft:saddle", 1);
  move(db, transfer, "Packed", now);
  db.flush();
  message(player, species.carrierProfile === "marine" ? `§a${animal.name} the ${species.displayName} swam into the tank. Use it on the bank of its ${species.aquaticMammal ? "lagoon" : "tank"}, beside the water.` : `§a${animal.name} the ${species.displayName} hopped into the carrier.${saddled ? " You kept its saddle." : ""} Use it on the ground inside its exhibit.`); // big fish and manatees: 0.1.129
}

// Zoo animal + empty carrier in hand: pick it up again, for example after it got out of its
// exhibit, or to move it to another one. No bait: it's already the park's animal. A big predator
// only from its Holding Den (crateFromDen below: no entity, the record is given).
export function repack(player, entity, known = undefined) {
  const stack = heldItem(player);
  const carrier = stack && carrierByItem(stack.typeId);
  if (!carrier || carrier.full) return;
  if (!can(player, "care")) return message(player, denyText("care"));
  const a = known ?? animalFromEntity(entity);
  if (!a || a.location.kind !== "exhibit") return message(player, "§eThis animal isn't on the park's records.");
  const species = SPECIES[a.speciesId];
  if (species.carrierProfile !== carrier.profile) return message(player, `§eA ${species.displayName} travels in a ${CARRIERS[species.carrierProfile]?.label ?? "different carrier"}.`);
  if (carrier.research && !researched(carrier.research)) return message(player, `§eThe ${carrier.label} needs ${PROJECTS.find((p) => p.id === carrier.research)?.name ?? "more"} research at the Research Desk first.`); // 0.1.125: in the zoo too
  const den = denOf(a.id);
  // A cub can be picked up loose (no danger; shut the grown ones in their dens first to go in safely).
  // A gorilla out of its exhibit (0.1.80): only while it eats a thrown Fruit Ration.
  const loose = Boolean(a.outside && species.ape && !den);
  // A shark in its tank (0.1.125): only while it eats a thrown Fish Ration, like a wild one.
  const tooDangerous = crateBlock(species, { wild: false, denned: Boolean(den) || Boolean(a.juvenile), loose, eating: (loose || Boolean(species.bigFish)) && Boolean(entity) && isFed(entity.id) });
  if (tooDangerous) return message(player, `§e${tooDangerous}`);

  const now = parkTime();
  const transfer = { id: newId("tr"), token: newId("tk"), animalId: a.id, phase: "Reserved", source: { kind: "exhibit", id: a.location.id }, createdAt: now, updatedAt: now };
  db.put(TRANSFERS, transfer);
  const ex = getExhibit(a.location.id);
  if (ex) removeResident(ex, a.id);
  a.outside = false;
  setLocation(a, { kind: "carrier", id: transfer.id });
  db.flush();

  const hand = heldItem(player);
  if (hand && hand.typeId === carrier.empty && hand.amount > 1) {
    hand.amount -= 1;
    setHeldItem(player, occupiedStack(carrier, transfer, a));
    player.getComponent("minecraft:inventory")?.container?.addItem(hand);
  } else {
    setHeldItem(player, occupiedStack(carrier, transfer, a));
  }
  despawn(a);
  if (entity?.isValid) entity.remove();
  if (den) vacateDen(den, a.id); // out through the den's back door: the den is empty (a tigress's cubs come out), its door goes up
  move(db, transfer, "Packed", now);
  db.flush();
  message(player, species.school ? `§a${labelOf(a)} are back in the tank. Use it on the bank of an aquarium.` : species.bigFish || species.aquaticMammal ? `§a${a.name} is in the tank. Use it on the bank of its ${species.aquaticMammal ? "lagoon" : "tank"}, beside the water.` : `§a${a.name} is ${den ? "in the crate, straight from the Holding Den" : "back in the carrier"}. Use it on the ground inside an exhibit.`); // big fish: 0.1.125
  if (ex) validate(ex.id);
}

// "Crate" on a Holding Den's menu, an empty Reinforced Crate in hand: the animal shut in it.
export function crateFromDen(player, den) {
  const fresh = db.get("equipment", den.id);
  const a = fresh?.held && getAnimal(fresh.held);
  if (!a) return message(player, "§eThe den is empty now.");
  repack(player, undefined, a);
}

// Occupied carrier used on a block.
export async function release(player, block) {
  if (busy.has(player.id)) return;
  const stack = heldItem(player);
  const carrier = stack && carrierByItem(stack.typeId);
  if (!carrier?.full) return;
  if (!can(player, "care")) return message(player, denyText("care"));
  const transferId = stack.getDynamicProperty(P_TRANSFER);
  const token = stack.getDynamicProperty(P_TOKEN);
  const check = checkToken(db, String(transferId), String(token));
  if (!check.ok) return message(player, `§c${check.reason}`);
  const transfer = check.transfer;
  const animal = getAnimal(transfer.animalId);
  if (!animal) return message(player, "§cThis carrier's animal record is missing.");
  const species = SPECIES[animal.speciesId];
  const target = { x: block.x, y: block.y + 1, z: block.z };
  const ex = exhibitAt(block.dimension.id, target);
  if (!ex && transfer.purpose === "release") return releaseToWild(player, block, carrier, transfer, animal, species, token);
  if (!ex) return message(player, "§eUse the carrier on the ground inside an exhibit.");
  const sharing = mixProblem(ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : []), species, SPECIES);
  if (sharing) return message(player, `§e${ex.name}: ${sharing}`);

  // 0.1.114: the exhibit's park (the item handler's scope), kept across the await below.
  const park = parkOfRecord(ex) ?? getPark();
  busy.add(player.id);
  try {
    move(db, transfer, "ArrivalPending", parkTime(), { destination: ex.id });
    db.flush();
    message(player, `§7Checking ${ex.name}...`);
    // Re-check the destination right before release (spec section 8).
    const r = await validate(ex.id);
    return withPark(park, () => arrive(player, carrier, transfer, animal, species, token, target, ex, r));
  } catch (error) {
    if (transfer.phase === "ArrivalPending") move(db, transfer, "Packed", parkTime(), { note: String(error) });
    db.flush();
    throw error;
  } finally {
    busy.delete(player.id);
  }
}

// The release itself, once the exhibit is measured again (sync, inside the exhibit's park's scope).
function arrive(player, carrier, transfer, animal, species, token, target, ex, r) {
  const fresh = getExhibit(ex.id);
  const back = (why) => {
    move(db, transfer, "Packed", parkTime(), { note: why });
    db.flush();
    message(player, `§c${why}`);
  };
  if (!r || !fresh) return back("The exhibit changed while checking. Try again.");
  if (!fresh.enclosed) return back(`${fresh.name} isn't safe yet: ${fresh.issues[0] ?? "it isn't enclosed."}`);
  const fit = fitFor(fresh, species, species.school ? animal.count ?? 1 : 1);
  if (fit.problem) return back(`${fresh.name} isn't right for ${species.school ? pluralOf(species) : `a ${species.displayName}`} yet. ${fit.problem}`);
  if (!fit.cap.fits) return back(`${fresh.name} is too small for ${species.school ? `${labelOf(animal)} more` : `another ${species.displayName}`} (needs ${fit.cap.required} usable blocks, has ${fit.cap.usable}).`);
  // Lava Rays go straight into the lava pool, as near the carrier as it reaches (their home is
  // where they're let out); a school into the water (0.1.119); everyone else onto the ground.
  // A school, or a big fish (0.1.124), goes into the water: the tank is used on the bank beside it.
  const swims = Boolean(species.school || HABITAT_PROFILES[species.habitatProfile]?.aquatic);
  const kinds = species.lavaSwimmer ? ["lava"] : swims ? ["water"] : ["land"];
  const spot = isInsideCells(fresh.id, target, kinds) ? target : releaseSpot(fresh.id, target, kinds) ?? (swims ? undefined : releaseSpot(fresh.id, target));
  if (!spot) return back(swims ? `No water near here to let ${species.school ? "them" : "it"} into: use the tank on the bank beside the water.` : "No open ground to release onto.");
  // The carrier must still be in hand with the same token: no swapping mid-check.
  const now = heldItem(player);
  if (!now || now.getDynamicProperty(P_TOKEN) !== token) return back("Keep the carrier in your hand while releasing.");

  spawnInExhibit(animal, fresh, spot);
  setLocation(animal, { kind: "exhibit", id: fresh.id });
  addResident(fresh, animal.id, animal.speciesId);
  move(db, transfer, "Exhibited", parkTime());
  setHeldItem(player, new ItemStack(carrier.empty, 1));
  db.flush();
  message(player, species.school ? `§a${labelOf(animal)} are now swimming in ${fresh.name}!` : `§a${animal.name} is now living in ${fresh.name}!`);
  // Measure again so the exhibit's state and crowding warnings include the new resident.
  validate(fresh.id);
}

// Wild mobs that take the zoo animal's coat (their entity files have zoocraft:coat_N events).
const WILD_COATS = new Set(["zoocraft:deer", "zoocraft:chorus_deer", "zoocraft:void_ray", "zoocraft:rift_ferret", "zoocraft:zebra", "zoocraft:lion", "zoocraft:tiger", "zoocraft:end_hopper", "zoocraft:shimmer_snail", "zoocraft:obsidian_crab", "zoocraft:chorus_moth", "zoocraft:starback_tortoise"]);

// A carrier bound for the wild, used on the ground outside any exhibit: a conservation release.
// The site is checked (home dimension, far from the park, the species' ground), a wild one with
// the animal's name appears, the transfer closes as Released and the record leaves the park.
function releaseToWild(player, block, carrier, transfer, animal, species, token) {
  const site = siteCheckAt(species, block);
  if (!site.ok) return message(player, `§e${site.reason}`);
  const spot = wildSpot(species, block);
  if (!spot) return message(player, "§eNo open ground here to let it out on.");
  busy.add(player.id);
  try {
    move(db, transfer, "ArrivalPending", parkTime(), { destination: "wild" });
    db.flush();
    const now = heldItem(player);
    if (!now || now.getDynamicProperty(P_TOKEN) !== token) {
      move(db, transfer, "Packed", parkTime(), { note: "carrier left the hand" });
      db.flush();
      return message(player, "§cKeep the carrier in your hand while releasing.");
    }
    const e = block.dimension.spawnEntity(species.wildSource, center(spot));
    e.nameTag = animal.name;
    if (WILD_COATS.has(species.id)) {
      try {
        e.triggerEvent(`zoocraft:coat_${animal.coat}`);
        if (species.manes) e.triggerEvent(`zoocraft:mane_${animal.mane ?? 0}`);
        if (species.sexLook) e.triggerEvent(`zoocraft:sex_${animal.sex === "male" ? 1 : 0}`);
        if (species.patterns) e.triggerEvent(`zoocraft:pattern_${animal.pattern ?? 0}`);
      } catch {
        // keeps the default coat
      }
    }
    // A crocodile (one coat) keeps its sex, its tail crest and its size.
    if (species.sizes) {
      try {
        e.triggerEvent(`zoocraft:sex_${animal.sex === "male" ? 1 : 0}`);
        e.triggerEvent(`zoocraft:pattern_${animal.pattern ?? 0}`);
        e.triggerEvent(`zoocraft:size_${animal.size ?? 2}`);
      } catch {
        // keeps the wild look
      }
    }
    // A big cat let go is calm a while: time to walk away before it hunts.
    if (species.dangerous) calmFor(e, BALANCE.predators.bait.releaseCalmTicks);
    move(db, transfer, "Released", parkTime(), { where: { dimension: block.dimension.id, pos: spot } });
    setHeldItem(player, new ItemStack(carrier.empty, 1));
    commitRelease({ animal, player, dimensionId: block.dimension.id, pos: spot, transferId: transfer.id });
    db.flush();
    log(`released ${animal.name} (${species.id}) at ${spot.x} ${spot.y} ${spot.z} in ${block.dimension.id}`);
  } catch (error) {
    if (transfer.phase === "ArrivalPending") move(db, transfer, "Packed", parkTime(), { note: String(error) });
    db.flush();
    throw error;
  } finally {
    busy.delete(player.id);
  }
}

// Exhibit -> carrier, bound for the wild (the animal's page on the Exhibit Clipboard). Needs an
// empty carrier of the right kind in the inventory; the conservation rules say who may go.
export function packForRelease(player, animalId) {
  const a = getAnimal(animalId);
  if (!a || a.location.kind !== "exhibit") return message(player, "§eThat animal isn't in an exhibit any more.");
  if (!can(player, "care")) return message(player, denyText("care"));
  if (SPECIES[a.speciesId]?.school) return message(player, "§eA school of fish stays in the zoo: pick it up with a Water Transport Tank to move it.");
  const check = checkRelease(a, player);
  if (!check.ok) return message(player, `§e${check.reason}`);
  const species = SPECIES[a.speciesId];
  const carrier = CARRIERS[species.carrierProfile];
  const slot = findItemSlot(player, carrier.empty);
  if (slot < 0) return message(player, `§eYou need an empty ${carrier.label} in your inventory.`);
  const ex = getExhibit(a.location.id);
  const now = parkTime();
  const transfer = { id: newId("tr"), token: newId("tk"), animalId: a.id, phase: "Reserved", purpose: "release", source: { kind: "exhibit", id: ex?.id }, createdAt: now, updatedAt: now };
  db.put(TRANSFERS, transfer);
  if (ex) removeResident(ex, a.id);
  a.outside = false;
  setLocation(a, { kind: "carrier", id: transfer.id });
  db.flush();
  setSlotItem(player, slot, occupiedStack({ ...carrier, profile: species.carrierProfile }, transfer, a));
  despawn(a);
  move(db, transfer, "Packed", now);
  db.flush();
  message(player, `§a${a.name} is in the carrier, bound for the wild. §fLet it out in ${dimensionName(species.homeDimension)}, ${wildDistance(parkEdge() === "fence", BALANCE.conservation)}, ${groundText(species)}. (Used inside an exhibit, the carrier houses it again instead.)`);
  if (ex) validate(ex.id);
}

// Recovery holding -> carrier (park menu). Needs an empty carrier of the right kind in hand.
export function packFromHolding(player, animalId) {
  const a = getAnimal(animalId);
  if (!a || a.location.kind !== "holding") return message(player, "§eThat animal isn't in holding any more.");
  if (!can(player, "care")) return message(player, denyText("care"));
  const species = SPECIES[a.speciesId];
  const carrier = CARRIERS[species.carrierProfile];
  // Carriers stack to 1, so the empty one's slot simply becomes the occupied one.
  const slot = findItemSlot(player, carrier.empty);
  if (slot < 0) return message(player, `§eYou need an empty ${carrier.label} in your inventory.`);
  const now = parkTime();
  const transfer = { id: newId("tr"), token: newId("tk"), animalId: a.id, phase: "Reserved", source: { kind: "holding" }, createdAt: now, updatedAt: now };
  db.put(TRANSFERS, transfer);
  setLocation(a, { kind: "carrier", id: transfer.id });
  db.flush();
  setSlotItem(player, slot, occupiedStack({ ...carrier, profile: species.carrierProfile }, transfer, a));
  move(db, transfer, "Packed", now);
  db.flush();
  message(player, `§a${a.name} is in the carrier. Use it on the ground inside an exhibit.`);
}

// On world load: settle interrupted trips, and make sure every animal has exactly one place.
export function reconcileTransport() {
  const now = parkTime();
  for (const id of reconcile(db, now)) {
    const a = getAnimal(id);
    if (a) moveToHolding(a, "trip interrupted");
  }
  for (const a of allAnimals()) {
    if (a.location.kind !== "carrier") continue;
    const t = db.get(TRANSFERS, a.location.id);
    if (!t || t.phase !== "Packed" || t.animalId !== a.id) moveToHolding(a, "carrier record lost");
  }
  pruneTransfers(db);
  db.flush();
  log(`transport: ${db.all(TRANSFERS).filter((t) => t.phase === "Packed").length} animals in carriers`);
}
