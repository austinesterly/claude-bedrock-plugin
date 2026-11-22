// The Acufend Incubator (0.1.355; Austin: "the mysterious egg can only be hatched if placed into an acufend
// incubator ... made by putting one torch in the middle of 8 acurite"). The Mysterious Egg is set in it by hand, and
// warms a stage at a time on the block's own tick; the stage lives in the block, so there is no record to keep.
// Broken with the egg in it, the egg drops with it. What hatches is Austin's to say: until then it stops at ready.
import { ItemStack, GameMode } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { heldItem, setHeldItem, message, later } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { MYSTERIOUS_EGG, STAGE, WARM, READY, nextStage, useOf } from "../world/acuriteRules.js";
import { SPECIES } from "../data/species.js";
import { scopeFor, withPark } from "../park/park.js";
import { crateNewborn } from "../transport/carriers.js";
import { kongExtra } from "../animals/babyKongRules.js";

const stageOf = (perm) => Number(perm.getState(STAGE) ?? 0);

function use(player, block) {
  const stage = stageOf(block.permutation);
  const held = heldItem(player);
  const what = useOf(stage, held?.typeId);
  const w = BALANCE.acurite.incubator.words;
  if (what === "put") {
    if (player.getGameMode() !== GameMode.Creative) setHeldItem(player, undefined);
    block.setPermutation(block.permutation.withState(STAGE, 1));
    try {
      block.dimension.playSound("block.sniffer_egg.plop", block.center(), { volume: 1, pitch: 0.8 });
    } catch {
      // only a sound
    }
    return message(player, `§d${w.put}`);
  }
  if (what === "empty") return message(player, `§7${w.empty}`);
  if (what === "warming") return message(player, `§d${w.warming.replace("{n}", String(stage)).replace("{of}", String(WARM))}`);
  return hatch(player, block);
}

// Ready, and used once more (0.1.356): Baby Kong, in a crate in the player's hands; the incubator is empty again.
function hatch(player, block) {
  const K = BALANCE.babyKong;
  const park = scopeFor(block, player);
  if (!park) return message(player, `§e${K.words.noPark}`);
  withPark(park, () => crateNewborn(player, SPECIES["zoocraft:gorilla"], kongExtra(K)));
  block.setPermutation(block.permutation.withState(STAGE, 0));
  try {
    block.dimension.playSound("block.sniffer_egg.hatch", block.center(), { volume: 1, pitch: 0.8 });
  } catch {
    // only a sound
  }
  message(player, `§d${K.words.hatch}`);
}

export function incubatorComponent() {
  return {
    onTick(e) {
      try {
        const s = stageOf(e.block.permutation);
        const n = nextStage(s);
        if (n === s) return;
        e.block.setPermutation(e.block.permutation.withState(STAGE, n));
        if (n === READY) e.block.dimension.playSound("block.sniffer_egg.crack", e.block.center(), { volume: 1, pitch: 1 });
      } catch (err) {
        reportError("incubator.tick", err);
      }
    },
    onPlayerInteract(e) {
      const { player, block } = e;
      if (!player) return;
      later(() => {
        try {
          use(player, block);
        } catch (err) {
          reportError("incubator.use", err);
        }
      });
    },
    onPlayerBreak(e) {
      try {
        if (stageOf(e.brokenBlockPermutation) >= 1) e.dimension.spawnItem(new ItemStack(MYSTERIOUS_EGG, 1), { x: e.block.x + 0.5, y: e.block.y + 0.5, z: e.block.z + 0.5 });
      } catch (err) {
        reportError("incubator.break", err);
      }
    },
  };
}
