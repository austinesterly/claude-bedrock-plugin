// Handing over a resident's friendship reward (0.1.243; the rules are residents/rewardRules.js). Sophia's is a book:
// a vanilla written book with Austin's text (data/lore.js), signed by her, so it reads like any book and can be kept,
// shelved or put on a lectern. 0.1.245: a reward can be a thing instead (Terra's plans: `item`).
import { world, ItemStack } from "@minecraft/server";
import { GLADES_BOOK } from "../data/lore.js";
import { bondOf, saveBond } from "./bonds.js";
import { rewardDue, rewardsEarned, withReward } from "./rewardRules.js";
import { bondLine } from "./bondRules.js";

const BOOKS = { [GLADES_BOOK.id]: GLADES_BOOK };

/** A signed copy of a lore book, or undefined if the game won't make one. */
export function bookStack(id) {
  const b = BOOKS[id];
  if (!b) return undefined;
  try {
    const stack = new ItemStack("minecraft:writable_book", 1);
    const book = stack.getComponent("minecraft:book");
    book.setContents(b.pages);
    // The game signs titles of 16 characters at most: a longer one is signed by its short title and carries the whole
    // title as the book's name.
    try {
      book.signBook(b.title, b.author);
    } catch {
      book.signBook(b.short, b.author);
      stack.nameTag = `§r§f${b.title}`;
    }
    return stack;
  } catch {
    return undefined;
  }
}

function hand(player, stack) {
  let left = stack;
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    left = c ? c.addItem(stack) : stack;
  } catch {
    left = stack;
  }
  if (left) {
    try {
      player.dimension.spawnItem(left, player.location);
    } catch {
      return undefined; // the player has gone
    }
  }
  return Boolean(left);
}

/** A reward as the thing handed over: a signed book, or one of an item. Undefined if the game won't make it. */
function stackOf(r) {
  if (r.book) return bookStack(r.book);
  try {
    return new ItemStack(r.item, 1);
  } catch {
    return undefined;
  }
}

/** Whether a resident has a reward ready for this player. */
export function rewardFor(res, playerId) {
  return rewardDue(res, bondOf(res.id, playerId));
}

/**
 * Hands a ready reward to the player talking to the resident. Returns { line, name, count, dropped } (the shape of a
 * work gift's hand-over, with the thing's own name) or undefined when none is ready.
 */
export function handReward(player, res) {
  const b = bondOf(res.id, player.id);
  const r = rewardDue(res, b);
  if (!r) return undefined;
  const stack = stackOf(r);
  if (!stack) return undefined;
  const dropped = hand(player, stack);
  if (dropped === undefined) return undefined;
  saveBond(withReward(b, r, world.getDay()), player); // theirs for good from here
  return { line: bondLine(res, r.line ?? "reward"), name: r.name, count: 1, dropped };
}

/** Whether the player carries a signed copy of the book already. */
export function carriesBook(player, id) {
  const b = BOOKS[id];
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; c && i < c.size; i++) {
      const it = c.getItem(i);
      if (it?.typeId !== "minecraft:written_book" || !b) continue;
      const title = it.getComponent("minecraft:book")?.title;
      if (title === b.title || title === b.short) return true;
    }
  } catch {
    // unreadable inventory: say they have none, they can ask again
  }
  return false;
}

/** Whether the player carries a reward already (a signed copy of the book, or one of the item). */
export function carries(player, r) {
  if (r.book) return carriesBook(player, r.book);
  try {
    const c = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; c && i < c.size; i++) if (c.getItem(i)?.typeId === r.item) return true;
  } catch {
    // unreadable inventory: say they have none, they can ask again
  }
  return false;
}

/**
 * Another of a reward for a player who earned it and carries none: `reward` is which (their first if not given).
 * Returns { line, name, dropped } or undefined.
 */
export function copyAgain(player, res, reward) {
  const earned = rewardsEarned(res, bondOf(res.id, player.id));
  const r = reward ? earned.find((x) => x === reward) : earned[0];
  if (!r || carries(player, r)) return undefined;
  const stack = stackOf(r);
  if (!stack) return undefined;
  const dropped = hand(player, stack);
  return dropped === undefined ? undefined : { line: bondLine(res, "rewardAgain"), name: r.name, dropped };
}
