import { log } from "../core/log.js";
import { goldMask, goldCommands, hasItemCommand } from "./mobRules.js";

// A piglin's or zombified piglin's weapon and golden armour (0.1.206, module 12; research/vanilla_plan.md "0.1.206
// piglins, piglin brutes and zombified piglins: the design"), the world side. A script can't read a mob's hand or armour
// (the test server: no equippable component on a mob), but the game's hasitem test can, run as the mob; and replaceitem
// puts armour on one. The rules (the slots, the mask, the commands) are in animals/mobRules.js.

// Does the mob have that item in that slot?
function hasItem(e, slot, item) {
  try {
    return e.runCommand(hasItemCommand(slot, item)).successCount > 0;
  } catch {
    return false;
  }
}

/** The first of `gear` the mob holds in its hand, or undefined. */
export function heldGear(e, gear) {
  return gear.find((item) => hasItem(e, "slot.weapon.mainhand", item));
}

/** The golden armour the mob wears, as a mask (0 for none). */
export function wornGold(e) {
  return goldMask((slot, item) => hasItem(e, slot, item));
}

/** Put a mask's golden armour on the mob. */
export function dressGold(e, mask) {
  for (const cmd of goldCommands(mask)) {
    try {
      e.runCommand(cmd);
    } catch (err) {
      log(`gold: ${cmd} failed: ${err}`);
    }
  }
}
