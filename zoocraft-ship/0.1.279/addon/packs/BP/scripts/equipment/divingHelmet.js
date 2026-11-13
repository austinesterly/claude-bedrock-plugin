import { EquipmentSlot } from "@minecraft/server";
import { onlinePlayers, biomeAt } from "../platform/mc.js";
import { HELMET, NIGHT_VISION, NV_TICKS, fogFor, fogCommands, headUnderwater, nightVision } from "./divingRules.js";
import { FISHING, skyIslandAt } from "../fishing/islandRules.js";
import { worldSeed } from "../fishing/islands.js";

// The Diving Helmet (0.1.136; the rules are in equipment/divingRules.js). Every 10 ticks, for each player: the helmet's
// water fog on their fog stack while they wear it (the Deep Trench's teal there, the clear one elsewhere), off when they
// don't; night vision topped up while the head is under the water with it on, taken off again on coming up. Over a rare
// island in the fishing sky (0.1.275), worn or not, a purple water fog, so its ponds are purple under the water.

const state = new Map(); // player id -> { fog: fog id | undefined, gave: boolean }

export function tickDivingHelmets() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      step(player);
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

/** Whether the player is over a rare island in the fishing sky (its ponds' water fog is purple). */
function overRareIsland(player) {
  if (player.dimension.id !== FISHING) return false;
  return skyIslandAt(worldSeed(), player.location.x, player.location.z)?.kind === "rare";
}

function step(player) {
  let s = state.get(player.id);
  if (!s) {
    s = { fog: null, gave: false }; // null: not known yet, so a fog left from before is cleared
    state.set(player.id, s);
  }
  const wearing = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId === HELMET;
  const want = fogFor(wearing, wearing ? biomeAt(player.dimension, player.location)?.id : undefined, overRareIsland(player));
  const cmds = fogCommands(s.fog, want);
  if (cmds.length) {
    for (const c of cmds) {
      try {
        player.runCommand(c);
      } catch {
        // A remove with nothing to remove can fail; the push after it still runs.
      }
    }
    s.fog = want;
  }
  let under = false;
  if (wearing) {
    const block = player.dimension.getBlock(player.getHeadLocation());
    under = headUnderwater(block?.typeId, block?.isWaterlogged ?? false);
  }
  const left = player.getEffect(NIGHT_VISION)?.duration ?? 0;
  const what = nightVision(wearing, under, left, s.gave);
  if (what === "give") {
    player.addEffect(NIGHT_VISION, NV_TICKS, { amplifier: 0, showParticles: false });
    s.gave = true;
  } else if (what === "take") {
    player.removeEffect(NIGHT_VISION);
    s.gave = false;
  } else if (!left) s.gave = false;
}
