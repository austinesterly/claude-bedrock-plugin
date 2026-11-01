import { EquipmentSlot, GameMode } from "@minecraft/server";
import { onlinePlayers, message } from "../platform/mc.js";
import { BOOK, LAVA_SPEED, ATTRIBUTE, TEXT, hasStrider, loreWith, speedAction, bookOutcome, bootsName } from "./striderRules.js";

// Lava Strider (0.1.160; the rules and the bench numbers are in equipment/striderRules.js). The Lava Strider Book used
// while wearing boots gives them Lava Strider (the tooltip line); every 10 ticks, each
// player wearing such boots has the game's lava speed attribute set to walking pace, and back to the game's own once
// they come off (or on joining without them).

const wasOn = new Map(); // player id -> whether their boots had it last look (for the line on the action bar)

/** @param {import("@minecraft/server").ItemStack | undefined} item */
function striderOn(item) {
  if (!item) return false;
  try {
    return hasStrider(item.getLore());
  } catch {
    return false;
  }
}

export function tickLavaStrider() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      const feet = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Feet);
      const on = striderOn(feet);
      const attr = player.getComponent(ATTRIBUTE);
      if (attr) {
        const what = speedAction(on, attr.currentValue, attr.defaultValue);
        if (what === "set") attr.setCurrentValue(LAVA_SPEED);
        else if (what === "reset") attr.resetToDefaultValue();
      }
      if (on && wasOn.get(player.id) === false) player.onScreenDisplay.setActionBar(TEXT.on);
      wasOn.set(player.id, on);
    } catch {
      // left, or not ready yet: next time
    }
  }
  for (const id of [...wasOn.keys()]) if (!seen.has(id)) wasOn.delete(id);
}

// The book used (its item component, main.js): the boots worn get Lava Strider, and the book is used up (kept in
// Creative).
/** @param {import("@minecraft/server").Player} player */
export function useStriderBook(player) {
  const eq = player.getComponent("minecraft:equippable");
  if (!eq) return;
  const feet = eq.getEquipment(EquipmentSlot.Feet);
  const what = bookOutcome(feet?.typeId, striderOn(feet));
  if (what !== "add" || !feet) return message(player, TEXT[what]);
  feet.setLore(loreWith(feet.getLore()));
  eq.setEquipment(EquipmentSlot.Feet, feet);
  if (player.getGameMode() !== GameMode.Creative && eq.getEquipment(EquipmentSlot.Mainhand)?.typeId === BOOK) eq.setEquipment(EquipmentSlot.Mainhand, undefined);
  try {
    player.playSound("random.anvil_use", { volume: 0.8, pitch: 1.2 });
    player.playSound("random.levelup", { volume: 0.6, pitch: 1.4 });
  } catch {
    // cosmetic only
  }
  message(player, TEXT.add(bootsName(feet.typeId)));
}
