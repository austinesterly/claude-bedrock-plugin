import { EquipmentSlot } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { PIECES, FIRE_RESISTANCE, FR_TICKS, HINT_TICKS, piecesOn, fogFor, fogCommands, fireResistance, putOut, burning, hint } from "./obsidianRules.js";

// Obsidian Armor (0.1.158; the rules are in equipment/obsidianRules.js). Every 10 ticks, for each player: the
// helmet's lava fog on their fog stack while it is on, off when it isn't; with the whole suit on, fire resistance
// topped up (lava, fire and magma can't hurt them) and the flames put out once they are out of the lava; taken off
// with the suit. A line on the action bar when the suit goes on, and while only some of it is on in lava.

const state = new Map(); // player id -> { fog: fog id | undefined | null, gave: boolean, full: boolean, hintAt: number }
const SLOTS = { head: EquipmentSlot.Head, chest: EquipmentSlot.Chest, legs: EquipmentSlot.Legs, feet: EquipmentSlot.Feet };

export function tickObsidianArmor(now = 0) {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      step(player, now);
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function step(player, now) {
  let s = state.get(player.id);
  if (!s) {
    s = { fog: null, gave: false, full: false, hintAt: -1e9 }; // null: not known yet, so a fog left from before is cleared
    state.set(player.id, s);
  }
  const eq = player.getComponent("minecraft:equippable");
  /** @type {{ head?: string, chest?: string, legs?: string, feet?: string }} */
  const worn = {};
  if (eq) for (const [k, slot] of Object.entries(SLOTS)) worn[k] = eq.getEquipment(slot)?.typeId;
  const on = piecesOn(worn);
  const full = on === 4;
  const cmds = fogCommands(s.fog, fogFor(worn.head === PIECES.head));
  if (cmds.length) {
    for (const c of cmds) {
      try {
        player.runCommand(c);
      } catch {
        // A remove with nothing to remove can fail; the push after it still runs.
      }
    }
    s.fog = fogFor(worn.head === PIECES.head);
  }
  const left = player.getEffect(FIRE_RESISTANCE)?.duration ?? 0;
  const what = fireResistance(full, left, s.gave);
  if (what === "give") {
    player.addEffect(FIRE_RESISTANCE, FR_TICKS, { amplifier: 0, showParticles: false });
    s.gave = true;
  } else if (what === "take") {
    player.removeEffect(FIRE_RESISTANCE);
    s.gave = false;
  } else if (!left) s.gave = false;
  let feet, head;
  if (on > 0) {
    feet = player.dimension.getBlock(player.location)?.typeId;
    head = player.dimension.getBlock(player.getHeadLocation())?.typeId;
  }
  const onFire = on > 0 && player.getComponent("minecraft:onfire") !== undefined;
  if (putOut(full, onFire, feet, head)) player.extinguishFire(false);
  const line = hint(on, s.full, burning(feet) || burning(head) || onFire);
  if (line && (on === 4 || now - s.hintAt >= HINT_TICKS)) {
    player.onScreenDisplay.setActionBar(line);
    s.hintAt = now;
  }
  s.full = full;
}
