// Melding Solute in the world (0.1.322; rules: world/soluteRules.js). Milk goes into an empty cauldron by the interact
// event (the game's cauldron takes the click first, as with the Goo Bucket: equipment/gooBucket.js); the Milk and
// Solute Cauldrons are blocks of ours with their own use. Words come in chat only.
import { system, ItemStack, GameMode, BlockPermutation } from "@minecraft/server";
import { heldItem, setHeldItem, giveItem, message } from "../platform/mc.js";
import { runLater } from "../park/park.js";
import { reportError } from "../core/log.js";
import { SOLUTE_CAULDRON, MILK_BUCKET, soluteUse, soluteHint } from "./soluteRules.js";

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function stateOf(block) {
  const out = { empty: false, gooLevel: 0, bottles: 0 };
  try {
    if (block.typeId === "minecraft:cauldron") out.empty = (block.permutation.getState("fill_level") ?? 0) === 0;
    out.gooLevel = Number(block.permutation.getState("zoocraft:level") ?? 0);
    out.bottles = Number(block.permutation.getState("zoocraft:bottles") ?? 0);
  } catch {
    // a block without those states
  }
  return out;
}

/** One of the stack in hand becomes `typeId` (a creative player keeps theirs). */
function swapOne(player, stack, typeId) {
  if (creative(player)) return;
  if (stack.amount > 1) {
    stack.amount -= 1;
    setHeldItem(player, stack);
    giveItem(player, typeId, 1);
  } else setHeldItem(player, new ItemStack(typeId, 1));
}

function takeOne(player, stack) {
  if (creative(player)) return;
  if (stack.amount > 1) {
    stack.amount -= 1;
    setHeldItem(player, stack);
  } else setHeldItem(player, undefined);
}

function apply(player, block, stack, use) {
  const d = block.dimension;
  const pos = block.location;
  if (use.to === SOLUTE_CAULDRON) block.setPermutation(BlockPermutation.resolve(SOLUTE_CAULDRON, { "zoocraft:bottles": use.bottles }));
  else block.setType(use.to);
  if (use.give) {
    takeOne(player, stack);
    giveItem(player, use.give, 1);
  } else if (use.back) swapOne(player, stack, use.back);
  const at = { x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5 };
  try {
    d.playSound(use.sound, at);
    if (use.made) for (let i = 0; i < 6; i++) d.spawnParticle("minecraft:villager_happy", { x: pos.x + 0.2 + 0.12 * i, y: pos.y + 1.1, z: pos.z + 0.3 + ((i * 7) % 5) * 0.1 });
  } catch {
    // only for show
  }
  if (use.made) message(player, "§aMelding Solute. §fThe milk and the goo turn bright green. Fill Glass Bottles from the cauldron: it holds 16.");
}

const last = new Map();
/**
 * A use on a cauldron that is the game's own or the Goo Cauldron (main.js asks before the block's own use): a Milk
 * Bucket into an empty cauldron, or onto a full Goo Cauldron. Returns true when it is ours (the click is then spent).
 */
export function soluteInteract(player, block, stack) {
  if (stack?.typeId !== MILK_BUCKET) return false;
  const use = soluteUse(stack.typeId, block.typeId, stateOf(block));
  if (!use) {
    const hint = soluteHint(block.typeId, stateOf(block));
    if (!hint) return false;
    if (system.currentTick - (last.get(player.id) ?? -100) >= 5) runLater(() => message(player, hint));
    last.set(player.id, system.currentTick);
    return true; // the milk is not drunk at a Goo Cauldron
  }
  if (system.currentTick - (last.get(player.id) ?? -100) < 5) return true; // one pour per click
  last.set(player.id, system.currentTick);
  const d = block.dimension;
  const pos = block.location;
  runLater(() => {
    try {
      const b = d.getBlock(pos);
      const held = heldItem(player);
      if (!b || held?.typeId !== MILK_BUCKET) return;
      const again = soluteUse(held.typeId, b.typeId, stateOf(b));
      if (again) apply(player, b, held, again);
    } catch (error) {
      reportError("solute pour", error);
    }
  });
  return true;
}

/** The Milk Cauldron's and the Solute Cauldron's own use (one custom component for both). */
export function soluteCauldronComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player) return;
      try {
        const stack = heldItem(player);
        const st = stateOf(block);
        const use = stack ? soluteUse(stack.typeId, block.typeId, st) : undefined;
        if (use) return apply(player, block, stack, use);
        const hint = soluteHint(block.typeId, st);
        if (hint) message(player, hint);
      } catch (error) {
        reportError("solute cauldron", error);
      }
    },
  };
}
