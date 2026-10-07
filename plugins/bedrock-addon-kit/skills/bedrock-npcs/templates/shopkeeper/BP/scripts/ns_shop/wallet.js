// Currency adapter. Pick one mode; the rest of the shop only calls balance/canPay/pay/earn.
//   "score": a scoreboard objective (shows on the sidebar, scriptable from commands and other packs;
//            operators can also edit it with /scoreboard, so treat it as game data, not anti-cheat).
//   "item":  a physical item such as emeralds (players can see, drop and trade it).
// Scoreboard and inventory writes need a writable context: never call pay/earn from a
// before-event or command callback without system.run.

import { ItemStack, world } from "@minecraft/server";

export const CURRENCY = { mode: "score", objective: "ns_coins", display: "Coins", item: "minecraft:emerald", unit: "coins" };

function objective() {
  return world.scoreboard.getObjective(CURRENCY.objective) ?? world.scoreboard.addObjective(CURRENCY.objective, CURRENCY.display);
}

function inventory(player) {
  return player.getComponent("minecraft:inventory")?.container;
}

export function countItem(player, typeId) {
  const inv = inventory(player);
  if (!inv) return 0;
  let n = 0;
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (it?.typeId === typeId) n += it.amount;
  }
  return n;
}

/** Remove exactly `amount`. Call only after countItem() returned at least `amount`. */
export function removeItem(player, typeId, amount) {
  const inv = inventory(player);
  let left = amount;
  for (let i = 0; i < inv.size && left > 0; i++) {
    const it = inv.getItem(i);
    if (it?.typeId !== typeId) continue;
    const take = Math.min(left, it.amount);
    left -= take;
    if (take === it.amount) inv.setItem(i, undefined);
    else {
      it.amount -= take;
      inv.setItem(i, it);
    }
  }
  return left === 0;
}

/** How many of `typeId` fit in the inventory right now (empty slots plus room in matching stacks). */
export function roomFor(player, typeId) {
  const inv = inventory(player);
  if (!inv) return 0;
  const probe = new ItemStack(typeId, 1);
  let room = 0;
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    if (!it) room += probe.maxAmount;
    else if (it.isStackableWith(probe)) room += Math.max(0, it.maxAmount - it.amount);
  }
  return room;
}

/**
 * Add items in max-size stacks. Returns how many did not fit (0 when roomFor() was checked first).
 * With `dropRest`, items that don't fit are dropped at the player's feet instead.
 */
export function giveItem(player, typeId, amount, dropRest = false) {
  const inv = inventory(player);
  let left = amount;
  let lost = 0;
  while (left > 0) {
    const stack = new ItemStack(typeId, 1);
    stack.amount = Math.min(left, stack.maxAmount);
    left -= stack.amount;
    const rest = inv?.addItem(stack) ?? stack;
    if (!rest) continue;
    if (dropRest) player.dimension.spawnItem(rest, player.location);
    else lost += rest.amount;
  }
  return lost;
}

export function balance(player) {
  if (CURRENCY.mode === "item") return countItem(player, CURRENCY.item);
  return objective().getScore(player) ?? 0;
}

export function canPay(player, amount) {
  return balance(player) >= amount;
}

/** Take money. Returns false and changes nothing if the player can't pay. */
export function pay(player, amount) {
  if (amount < 0 || !canPay(player, amount)) return false;
  if (CURRENCY.mode === "item") return removeItem(player, CURRENCY.item, amount);
  objective().addScore(player, -amount);
  return true;
}

/** Give money. Item mode drops what doesn't fit at the player's feet. */
export function earn(player, amount) {
  if (amount <= 0) return;
  if (CURRENCY.mode === "item") {
    giveItem(player, CURRENCY.item, amount, true);
    return;
  }
  objective().addScore(player, amount);
}

/** Make sure the objective exists (call once after world load). */
export function initWallet() {
  if (CURRENCY.mode === "score") objective();
}
