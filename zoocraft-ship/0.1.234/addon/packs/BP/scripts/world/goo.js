// Goo (0.1.234; the rules are in world/formationRules.js). An add-on can't make a liquid, so goo is a block with no
// collision that looks like one. Every 2 ticks, for each player standing in it: they are slowed (wading), sink
// slowly instead of dropping, and rise while they hold jump, so a goo pit is a place to wade out of, not a trap.
// It does no harm (ours to choose: Austin asked for a goo pool, not for what it does).
import { InputButton, ButtonState } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { gooMove } from "./formationRules.js";

const G = BALANCE.formation.goo;
const wading = new Set(); // player ids in the goo (or rising out of it) last time: the line on the action bar shows once

export function tickGoo() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    try {
      const d = player.dimension;
      const at = player.location;
      const id = (dy) => d.getBlock({ x: at.x, y: at.y + dy, z: at.z })?.typeId;
      const around = [id(0), id(1.5)];
      if (!around.includes("zoocraft:goo") && !wading.has(player.id)) continue; // most players, most of the time: one or two looks
      const jumping = player.isJumping || player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed;
      const move = gooMove(around, [id(-1), id(-2)], jumping);
      if (!move) continue;
      seen.add(player.id);
      if (around.includes("zoocraft:goo")) player.addEffect("slowness", G.ticks, { amplifier: G.slowness, showParticles: false });
      if (move === "rise") {
        player.removeEffect("slow_falling");
        player.addEffect("levitation", G.riseTicks, { amplifier: G.rise, showParticles: false });
      } else {
        player.removeEffect("levitation");
        player.addEffect("slow_falling", G.ticks, { amplifier: 0, showParticles: false });
      }
      if (!wading.has(player.id)) player.onScreenDisplay.setActionBar("Goo: hold jump to wade up and out.");
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  wading.clear();
  for (const id of seen) wading.add(id);
}
