// Quest rules: status, progress, accept, abandon, kill credit and the turn-in transaction.
// Everything here is synchronous. Call it after the last await of a UI flow, so nothing can
// change between the checks and the writes.

import { ItemStack } from "@minecraft/server";
import { QUESTS, QUEST_IDS } from "./quests.js";
import { getState, now, saveState } from "./state.js";

export const Status = { Available: "available", Active: "active", Ready: "ready", Cooldown: "cooldown", Finished: "finished" };

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

/** Remove exactly `amount` items. Only call after countItem() said there are enough. */
function removeItem(player, typeId, amount) {
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
      inv.setItem(i, it); // getItem returns a copy: write it back
    }
  }
  return left === 0;
}

function giveItem(player, typeId, count) {
  const inv = inventory(player);
  let left = count;
  while (left > 0) {
    const stack = new ItemStack(typeId, 1);
    stack.amount = Math.min(left, stack.maxAmount);
    left -= stack.amount;
    const rest = inv?.addItem(stack) ?? stack;
    if (rest) player.dimension.spawnItem(rest, player.location); // inventory full: drop at feet
  }
}

export function progressOf(player, id) {
  const q = QUESTS[id];
  const a = getState(player).active[id];
  if (!a) return 0;
  return Math.min(q.count, q.kind === "collect" ? countItem(player, q.item) : a.n);
}

export function statusOf(player, id) {
  const q = QUESTS[id];
  const s = getState(player);
  if (s.active[id]) return progressOf(player, id) >= q.count ? Status.Ready : Status.Active;
  const d = s.done[id];
  if (!d) return Status.Available;
  if (!q.repeatable) return Status.Finished;
  return now() - d.last >= (q.cooldownTicks ?? 0) ? Status.Available : Status.Cooldown;
}

/** Ticks until a repeatable quest can be taken again (0 if available). */
export function cooldownLeft(player, id) {
  const d = getState(player).done[id];
  const q = QUESTS[id];
  if (!d || !q.repeatable) return 0;
  return Math.max(0, (q.cooldownTicks ?? 0) - (now() - d.last));
}

export function accept(player, id) {
  if (statusOf(player, id) !== Status.Available) return false;
  const s = getState(player);
  s.active[id] = { n: 0, at: now() };
  saveState(player, s);
  return true;
}

export function abandon(player, id) {
  const s = getState(player);
  if (!s.active[id]) return false;
  delete s.active[id];
  saveState(player, s);
  return true;
}

/**
 * Turn-in transaction: re-check, take the items, then save and pay.
 * Returns a message for the player.
 */
export function turnIn(player, id) {
  const q = QUESTS[id];
  if (statusOf(player, id) !== Status.Ready) return { ok: false, text: "That quest isn't finished yet." };
  if (q.kind === "collect" && !removeItem(player, q.item, q.count)) return { ok: false, text: "Couldn't take the items." };
  const s = getState(player);
  delete s.active[id];
  const d = s.done[id] ?? { times: 0, last: 0 };
  s.done[id] = { times: d.times + 1, last: now() };
  saveState(player, s); // save before paying, so a crash can't pay twice
  for (const r of q.reward.items) giveItem(player, r.id, r.count);
  if (q.reward.xp) player.addExperience(q.reward.xp);
  return { ok: true, text: q.done };
}

/** Kill credit: called from entityDie for the killing player. */
export function creditKill(player, deadTypeId) {
  const s = getState(player);
  let changed = false;
  for (const id of QUEST_IDS) {
    const q = QUESTS[id];
    const a = s.active[id];
    if (!a || q.kind !== "kill" || !q.targets.includes(deadTypeId) || a.n >= q.count) continue;
    a.n += 1;
    changed = true;
    player.onScreenDisplay.setActionBar(`${q.title}: ${a.n}/${q.count}`);
    if (a.n === q.count) {
      player.sendMessage(`§a${q.title} complete! Return to the quest giver.`);
      player.playSound("random.levelup");
    }
  }
  if (changed) saveState(player, s);
}

/** Collect progress note: called when a tracked item enters the inventory. */
export function noteCollect(player, typeId) {
  const s = getState(player);
  for (const id of QUEST_IDS) {
    const q = QUESTS[id];
    if (!s.active[id] || q.kind !== "collect" || q.item !== typeId) continue;
    const n = Math.min(q.count, countItem(player, typeId));
    player.onScreenDisplay.setActionBar(`${q.title}: ${n}/${q.count}`);
  }
}

export function activeIds(player) {
  return Object.keys(getState(player).active).filter((id) => QUESTS[id]);
}
