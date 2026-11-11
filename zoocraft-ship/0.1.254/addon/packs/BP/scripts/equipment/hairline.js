// A painted hairline on a player's head (0.1.254; the rules and the looks are data/hairlines.js). The item can't be
// dropped or put in a chest (so the reward stays the player's own) and is kept on death; a player takes it off like a
// helmet, or has it wiped off at Jaylen's menu.
import { ItemStack, EquipmentSlot, ItemLockMode } from "@minecraft/server";
import { hairlineItem, isHairline, headPlan } from "../data/hairlines.js";

const container = (player) => {
  try {
    return player.getComponent("minecraft:inventory")?.container;
  } catch {
    return undefined;
  }
};

/** The painted hairline a player wears: its item id, or undefined. */
export function wornHairline(player) {
  try {
    const id = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId;
    return isHairline(id) ? id : undefined;
  } catch {
    return undefined;
  }
}

/** Takes every painted hairline out of the player's inventory (one taken off earlier). Returns how many. */
function clearCarried(player) {
  const c = container(player);
  let n = 0;
  for (let i = 0; c && i < c.size; i++) {
    if (!isHairline(c.getItem(i)?.typeId)) continue;
    c.setItem(i, undefined);
    n++;
  }
  return n;
}

/**
 * Paints a hairline on the player: a helmet goes to the inventory first. Returns { ok: true, moved (the helmet's
 * item id when one was moved) } or { ok: false, why: "full" (a helmet and no room for it) | "gone" }.
 */
export function paintHairline(player, style, colour) {
  try {
    const eq = player.getComponent("minecraft:equippable");
    const c = container(player);
    if (!eq || !c) return { ok: false, why: "gone" };
    const head = eq.getEquipment(EquipmentSlot.Head);
    const plan = headPlan(head?.typeId, c.emptySlotsCount > 0);
    if (plan === "full") return { ok: false, why: "full" };
    let moved;
    if (plan === "move" && head) {
      if (c.addItem(head)) return { ok: false, why: "full" }; // one helmet: all of it went in, or none
      moved = head.typeId;
    }
    clearCarried(player);
    const stack = new ItemStack(hairlineItem(style, colour), 1);
    stack.lockMode = ItemLockMode.inventory;
    stack.keepOnDeath = true;
    eq.setEquipment(EquipmentSlot.Head, stack);
    return { ok: true, moved };
  } catch {
    return { ok: false, why: "gone" };
  }
}

/** Wipes the player's painted hairline off (worn or carried). Returns whether there was one. */
export function wipeHairline(player) {
  try {
    let had = clearCarried(player) > 0;
    if (wornHairline(player)) {
      player.getComponent("minecraft:equippable")?.setEquipment(EquipmentSlot.Head, undefined);
      had = true;
    }
    return had;
  } catch {
    return false;
  }
}
