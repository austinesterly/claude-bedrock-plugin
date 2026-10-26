import { ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { RATIONS, BLOCKS, foodLook } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { emit } from "../core/events.js";
import { can, denyText, inScopeAt } from "../park/park.js";
import { heldItem, setHeldItem, message, dim } from "../platform/mc.js";
import { feederCapacity } from "../research/research.js";

// Basic Feeder (spec section 10): stock lives in an "equipment" record keyed by the block's
// position, so animals eat from it even when its chunk is unloaded, and two animals eating at
// once can't take the same unit (AC-04). The block's look (empty / low / full, and which food) is a view.
// The Elevated Browse Feeder (giraffes) is the same feeder, two blocks tall: its record sits on the
// bottom part and is marked `high`. The Thermal Feeder (Lava Rays) stands at the edge of a lava
// pool, holds only Molten Plankton Feed and is marked `thermal`; its look shows only how full it is.
// The Puzzle Feeder (0.1.71) is a Basic Feeder animals have to work at to get the food out, marked
// `puzzle`: while it holds food a species eats, it is "manipulate" enrichment for that species too
// (equipment/rules.js enrichmentKinds); raccoons sit up at it and work the pegs (animals/raccoon.js).
// The Hay Rack (0.1.74) is a feeder hung on a wall (or stood on the ground) that holds hay: Grain or
// Leafy Rations only, marked `rack`. Zebras, deer and elephants eat from it (species.rack,
// equipment/rules.js reachesFeeder), from the floor a block below it or level with it; it has room for
// more zebras at once than a Basic Feeder (BALANCE.zebra.places). Its look shows how full it is and
// which hay (zoocraft:food 0 leafy, 10 grain).
// The Insect Feeder (0.1.85) is a mesh-topped box of mealworms that holds Insect Rations only, marked `insect`: any
// insect eater eats from it (hedgehogs, raccoons, flamingos), Warped Geckos from nothing else (species.insectFeeder),
// and at night a stocked one in a gecko exhibit lets out a moth now and then for them to hunt (animals/gecko.js). Its
// look shows only how full it is.
// The Nectar Feeder (0.1.88) is a shallow glass dish of glowing blue nectar on a post, ringed by petals, that holds
// Nectar Rations only, marked `nectar`: Soul Moths and Chorus Moths eat from nothing else (species.nectarFeeder),
// hovering at the dish.
// Its look shows only how full it is.
// The Mineral Feeder (0.1.93) is a low basin of polished blackstone heaped with pellets that holds Mineral Pellets only,
// marked `mineral`: Obsidian Crabs eat from nothing else (species.mineralFeeder), and anything else with a mineral diet
// eats from it too. Its look shows only how full it is.
// The Aquarium Feeder (0.1.119) is a glass box of flakes on an iron post, hung over the water (its foot on the bank or
// on a block over the pool) or stood in the water, that holds Fish Flakes only, marked `aquarium`: every fish eats from
// it (species.aquariumFeeder) and from nothing else, and nothing else eats from it. It holds BALANCE.aquarium.feederCapacity
// units (three times a feeder's: a school of 16 eats 2 a park day). Its look shows only how full it is.

const EQUIP = "equipment";
/** @type {any} Custom block state names aren't in the vanilla typings. */
const FILL_STATE = "zoocraft:fill";
/** @type {any} */
const FOOD_STATE = "zoocraft:food";
/** @type {any} */
const PART = "minecraft:multi_block_part";

// The block holding the record: the bottom part of an Elevated Browse Feeder.
function base(block) {
  if (block.typeId === BLOCKS.elevatedFeeder && block.permutation.getState(PART) === 1) return block.below() ?? block;
  return block;
}

export function feederAt(dimensionId, pos) {
  return db.get(EQUIP, posKey(dimensionId, pos));
}

// 0.1.111: the scope's park's feeders while a loop runs for one park (park/park.js inScopeAt).
export function allFeeders() {
  return db.all(EQUIP).filter((e) => e.type === "feeder" && inScopeAt(e));
}

function ensureRecord(placed) {
  const block = base(placed);
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "feeder", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, item: undefined, units: 0, exhibitId: undefined };
    if (block.typeId === BLOCKS.elevatedFeeder) rec.high = true;
    if (block.typeId === BLOCKS.thermalFeeder) rec.thermal = true;
    if (block.typeId === BLOCKS.puzzleFeeder) rec.puzzle = true;
    if (block.typeId === BLOCKS.hayRack) rec.rack = true;
    if (block.typeId === BLOCKS.insectFeeder) rec.insect = true;
    if (block.typeId === BLOCKS.nectarFeeder) rec.nectar = true;
    if (block.typeId === BLOCKS.mineralFeeder) rec.mineral = true;
    if (block.typeId === BLOCKS.aquariumFeeder) rec.aquarium = true;
    db.put(EQUIP, rec);
  }
  return rec;
}

// "Feeder", "Elevated Browse Feeder", "Thermal Feeder", "Puzzle Feeder", "Hay Rack", "Insect Feeder", "Nectar Feeder",
// "Mineral Feeder": what players call this one.
export function feederName(rec) {
  return rec.high ? "Elevated Browse Feeder" : rec.thermal ? "Thermal Feeder" : rec.puzzle ? "Puzzle Feeder" : rec.rack ? "Hay Rack" : rec.insect ? "Insect Feeder" : rec.nectar ? "Nectar Feeder" : rec.mineral ? "Mineral Feeder" : rec.aquarium ? "Aquarium Feeder" : "Feeder";
}

// What this feeder holds at most: an Aquarium Feeder three times a feeder's worth, the rest the feeder capacity
// (raised by Bulk Feeders research).
export function capacityOf(rec) {
  return rec.aquarium ? BALANCE.aquarium.feederCapacity : feederCapacity();
}

// What a Hay Rack holds: hay (Grain or Leafy Rations).
const RACK_DIETS = ["grain", "leafy"];

// Why this ration can't go in this feeder, or undefined when it can: Molten Plankton Feed only
// goes in a Thermal Feeder, and a Thermal Feeder takes nothing else; a Hay Rack holds only hay; an Insect Feeder
// only Insect Rations; a Nectar Feeder only Nectar Rations, which go in nothing else (a Hanging Food Basket aside); a
// Mineral Feeder only Mineral Pellets.
export function wrongRation(rec, item) {
  if (rec.aquarium && RATIONS[item]?.diet !== "flakes") return "§cAn Aquarium Feeder holds Fish Flakes only (a dried kelp and wheat seeds make 4).";
  if (!rec.aquarium && RATIONS[item]?.diet === "flakes") return "§cFish Flakes go in an Aquarium Feeder, hung over the water of an aquarium or stood in it.";
  if (rec.nectar && RATIONS[item]?.diet !== "nectar") return "§cA Nectar Feeder holds Nectar Rations only (2 sugar and a honeycomb, sweet berries or a chorus fruit).";
  if (!rec.nectar && RATIONS[item]?.diet === "nectar") return "§cNectar Rations go in a Nectar Feeder, for Soul Moths and Chorus Moths.";
  if (rec.rack && !RACK_DIETS.includes(RATIONS[item]?.diet)) return "§cA Hay Rack holds hay: Grain or Leafy Rations.";
  if (rec.insect && RATIONS[item]?.diet !== "insect") return "§cAn Insect Feeder holds Insect Rations only (an Insect Hatchery grows them).";
  if (rec.mineral && RATIONS[item]?.diet !== "mineral") return "§cA Mineral Feeder holds Mineral Pellets only (basalt or blackstone with a bone meal make 2).";
  const thermal = Boolean(RATIONS[item]?.thermal);
  if (rec.thermal && !thermal) return `§cA Thermal Feeder holds only Molten Plankton Feed, for Lava Rays.`;
  if (!rec.thermal && thermal) return `§cMolten Plankton Feed goes in a Thermal Feeder at the edge of the lava pool.`;
  return undefined;
}

function fillLevel(units) {
  if (units <= 0) return 0;
  return units <= BALANCE.feeder.lowAt ? 1 : 2;
}

export function refreshLook(rec) {
  try {
    const d = dim(rec.dimension);
    if (!d.isChunkLoaded(rec.pos)) return;
    const block = d.getBlock(rec.pos);
    const level = fillLevel(rec.units);
    if (block?.typeId === BLOCKS.thermalFeeder || block?.typeId === BLOCKS.insectFeeder || block?.typeId === BLOCKS.nectarFeeder || block?.typeId === BLOCKS.mineralFeeder || block?.typeId === BLOCKS.aquariumFeeder) {
      if (block.permutation.getState(FILL_STATE) !== level) block.setPermutation(block.permutation.withState(FILL_STATE, level));
      return;
    }
    if (block?.typeId !== BLOCKS.feeder && block?.typeId !== BLOCKS.puzzleFeeder && block?.typeId !== BLOCKS.hayRack) return;
    const food = foodLook(rec.item);
    let perm = block.permutation;
    if (perm.getState(FILL_STATE) === level && perm.getState(FOOD_STATE) === food) return;
    perm = perm.withState(FILL_STATE, level).withState(FOOD_STATE, food);
    block.setPermutation(perm);
  } catch {
    // Unloaded or replaced; the look catches up next time.
  }
}

// Take up to `units` from the feeder. Returns how many were actually taken.
export function consume(rec, units) {
  const take = Math.max(0, Math.min(units, rec.units));
  if (take === 0) return 0;
  rec.units -= take;
  if (rec.units === 0) rec.item = undefined;
  db.put(EQUIP, rec);
  refreshLook(rec);
  return take;
}

export function feederComponent() {
  return {
    onPlace(e) {
      const rec = ensureRecord(e.block);
      emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos });
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensureRecord(e.block);
      const stack = heldItem(player);
      const ration = stack && RATIONS[stack.typeId];
      if (!ration) {
        const what = rec.item ? ` (${RATIONS[rec.item].label})` : "";
        const puzzle = rec.puzzle ? " §7Animals that like to handle things (raccoons, otters, elephants...) work it for their food: enrichment while it holds food they eat." : "";
        const rack = rec.rack ? " §7It holds hay (Grain or Leafy Rations). Zebras, deer and elephants eat from it, hung on the fence a block above their floor or stood on the floor." : "";
        const insect = rec.insect ? " §7It holds Insect Rations. Insect eaters eat from it (Warped Geckos from nothing else), and at night in a Warped Gecko exhibit, while it holds food, it lets out a moth now and then for them to hunt." : "";
        const nectar = rec.nectar ? " §7It holds Nectar Rations. Soul Moths and Chorus Moths hover at the dish and sip; they eat from nothing else." : "";
        const mineral = rec.mineral ? " §7It holds Mineral Pellets. Obsidian Crabs eat from nothing else; Basalt Tortoises, Quartz Beetles and Shimmer Snails eat from it too." : "";
        const aquarium = rec.aquarium ? " §7It holds Fish Flakes. Every fish eats from it, and from nothing else; a school of 16 eats 2 units a park day. Hang it over the water or stand it in the water." : "";
        message(player, `§6${feederName(rec)}: §f${rec.units}/${capacityOf(rec)} ration units${what}.${puzzle}${rack}${insect}${nectar}${mineral}${aquarium} ${rec.exhibitId ? "" : "§7(Not linked to an exhibit yet: validate the exhibit with the Habitat Marker.)"}`);
        return;
      }
      if (!can(player, "care")) return message(player, denyText("care"));
      const wrong = wrongRation(rec, stack.typeId);
      if (wrong) return message(player, wrong);
      if (rec.item && rec.item !== stack.typeId) return message(player, "§cThis feeder holds a different ration. Let it empty first.");
      const space = capacityOf(rec) - rec.units;
      if (space <= 0) return message(player, "§eThe feeder is full.");
      const items = Math.min(stack.amount, Math.ceil(space / ration.units));
      rec.units = Math.min(capacityOf(rec), rec.units + items * ration.units);
      rec.item = stack.typeId;
      db.put(EQUIP, rec);
      if (items >= stack.amount) setHeldItem(player, undefined);
      else {
        stack.amount -= items;
        setHeldItem(player, stack);
      }
      refreshLook(rec);
      message(player, `§aAdded ${items} ration${items === 1 ? "" : "s"}. ${feederName(rec)}: ${rec.units}/${capacityOf(rec)}.`);
    },
    onPlayerBreak(e) {
      const top = e.brokenBlockPermutation.type.id === BLOCKS.elevatedFeeder && e.brokenBlockPermutation.getState(PART) === 1;
      const at = top ? { x: e.block.x, y: e.block.y - 1, z: e.block.z } : e.block.location;
      const id = posKey(e.block.dimension.id, at);
      // The Elevated Browse Feeder's parts drop nothing; it drops one feeder item here.
      if (e.brokenBlockPermutation.type.id === BLOCKS.elevatedFeeder && e.player?.getGameMode() !== "Creative") e.block.dimension.spawnItem(new ItemStack(BLOCKS.elevatedFeeder, 1), e.block.center());
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      // Give the stored rations back as items so nothing is lost.
      const ration = rec.item && RATIONS[rec.item];
      if (ration && rec.units > 0) {
        let count = Math.floor(rec.units / ration.units);
        while (count > 0) {
          const s = new ItemStack(rec.item, 1);
          const n = Math.min(count, s.maxAmount);
          s.amount = n;
          count -= n;
          e.block.dimension.spawnItem(s, e.block.center());
        }
      }
      db.remove(EQUIP, id);
      emit("equipmentChanged", { dimension: rec.dimension, pos: rec.pos, removed: rec });
    },
  };
}

// Exhibits call this after validation. A feeder belongs to one exhibit at a time.
export function linkFeeder(rec, exhibitId) {
  if (rec.exhibitId === exhibitId) return;
  rec.exhibitId = exhibitId;
  db.put(EQUIP, rec);
}
