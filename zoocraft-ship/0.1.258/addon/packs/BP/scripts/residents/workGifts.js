// Work gifts (0.1.226, stage E of Austin's residents spec, section 9: research/npc_spec_plan.md section 10). The rules
// are residents/giftRules.js and the tables data/workGifts.js. A gift waits in a player's friendship record ("bonds",
// `pending`: { item, count, day, why }) and is handed over only when that player talks to the resident.
import { world, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { WORK_GIFTS } from "../data/workGifts.js";
import { residentById } from "../data/residents.js";
import { tierOf } from "./bondRules.js";
import { bondOf, saveBond } from "./bonds.js";
import { giftTableOf, rollGift, mayKeep, keepChance, earns, giftWords, poisonDue } from "./giftRules.js";

/**
 * After a resident's good shift (why "work", with their work skill) or happy zoo visit ("day"): for each player who is
 * their Friend or closer, maybe a gift kept for them. `mood` is theirs now. Returns how many were kept.
 */
export function keepGifts(resId, why, mood, skill, random = Math.random) {
  const g = BALANCE.residents.gifts;
  const res = residentById(resId);
  const table = giftTableOf(res, WORK_GIFTS);
  if (!table || !earns(why, mood, g)) return 0;
  const day = world.getDay();
  let n = 0;
  for (const b of db.all("bonds")) {
    if (b.res !== resId) continue;
    const tier = tierOf(b.points, BALANCE.residents.bonds);
    if (!mayKeep(b, tier, day, g) || random() >= keepChance(tier, res, g)) continue;
    const gift = rollGift(table, why === "work" ? skill : undefined, tier, random);
    if (!gift) continue;
    saveBond({ ...b, pending: { ...gift, day, why }, keptDay: day });
    n++;
  }
  return n;
}

/** The gift a resident keeps for a player, or undefined. */
export function giftFor(resId, playerId) {
  return bondOf(resId, playerId).pending;
}

/**
 * Hands a waiting gift to the player who is talking to the resident: into their inventory, and what doesn't fit at
 * their feet. Returns { line, key (the item's name to translate), count, dropped } or undefined when none waits.
 */
export function handOver(player, res) {
  const b = bondOf(res.id, player.id);
  const p = b.pending;
  if (!p) return undefined;
  let stack;
  try {
    stack = new ItemStack(p.item, p.count);
  } catch {
    stack = undefined;
  }
  // Taken off the record first, so nothing hands it over twice.
  saveBond({ ...b, pending: undefined, gotDay: world.getDay(), workGifts: (b.workGifts ?? 0) + (stack ? 1 : 0) }, player);
  if (!stack) return undefined;
  const key = stack.localizationKey;
  return { line: giftWords(res), key, count: p.count, dropped: give(player, stack) };
}

// Into the player's inventory, and what doesn't fit at their feet. Returns whether any was dropped.
function give(player, stack) {
  let left = stack;
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    left = c ? c.addItem(stack) : stack; // what didn't fit, or undefined
  } catch {
    left = stack;
  }
  if (left) {
    try {
      player.dimension.spawnItem(left, player.location);
    } catch {
      // the player has gone: nothing to drop it for
    }
  }
  return Boolean(left);
}

/**
 * 0.1.258, Desilva's Poison Gift (giftRules.js poisonDue): when the player starts a chat with her, now and then she hands
 * them her poison. She never comes to the player with it. Returns as handOver does, or undefined.
 */
export function handPoison(player, res, random = Math.random) {
  const rule = res?.poisonGift;
  if (!rule) return undefined;
  const b = bondOf(res.id, player.id);
  const day = world.getDay();
  if (b.poisonRollDay === day) return undefined;
  const due = poisonDue(rule, b, day, random);
  saveBond({ ...b, poisonRollDay: day, poisonDay: due ? day : b.poisonDay }, player);
  if (!due) return undefined;
  let stack;
  try {
    stack = new ItemStack(rule.item, 1);
  } catch {
    return undefined;
  }
  const lines = res.lines?.poisonGift ?? [];
  return { line: lines[Math.floor(random() * lines.length)] ?? "Here.", key: stack.localizationKey, count: 1, dropped: give(player, stack) };
}
