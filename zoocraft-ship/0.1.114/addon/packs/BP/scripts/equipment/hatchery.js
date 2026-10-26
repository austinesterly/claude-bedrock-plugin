import { BALANCE } from "../data/balance.js";
import { ITEMS } from "../data/items.js";
import { can, denyText, runLater } from "../park/park.js";
import { giveItem, message } from "../platform/mc.js";

// Insect Hatchery (0.1.62; items list: "Block that slowly makes insect rations, since vanilla has
// no insects to gather"). The block grows mealworms on its own: its own tick (minecraft:tick, every
// minute or two) raises the zoocraft:grown state by one batch, up to balance.hatchery.batches, and
// the grubs show in the box. Using the block takes every grown batch out as Insect Rations and
// starts it again. The state lives in the block, so there is no record to keep.

/** @type {any} Custom block states aren't in the vanilla typings. */
const GROWN = "zoocraft:grown";

export function batchesGrown(block) {
  return Number(block.permutation.getState(GROWN) ?? 0);
}

export function hatcheryComponent() {
  return {
    onTick(e) {
      grow(e.block);
    },
    onPlayerInteract(e) {
      const { player, block } = e;
      if (!player) return;
      runLater(() => take(player, block));
    },
  };
}

function grow(block) {
  try {
    const n = batchesGrown(block);
    if (n < BALANCE.hatchery.batches) block.setPermutation(block.permutation.withState(GROWN, n + 1));
  } catch {
    // unloaded or replaced
  }
}

function take(player, block) {
  const H = BALANCE.hatchery;
  const n = batchesGrown(block);
  if (!n) return message(player, `§6Insect Hatchery: §fnothing grown yet. §7It grows a batch of ${H.rationsPerBatch} Insect Rations every minute or two on its own, up to ${H.batches} batches; use it to take them out.`);
  if (!can(player, "care")) return message(player, denyText("care"));
  block.setPermutation(block.permutation.withState(GROWN, 0));
  giveItem(player, ITEMS.insectRation, n * H.rationsPerBatch);
  message(player, `§aTook ${n * H.rationsPerBatch} Insect Rations from the hatchery (${n} batch${n === 1 ? "" : "es"} of ${H.batches}). It starts growing again.`);
}
