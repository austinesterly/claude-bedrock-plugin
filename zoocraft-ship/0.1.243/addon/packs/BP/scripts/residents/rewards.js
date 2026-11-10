// Handing over a resident's friendship reward (0.1.243; the rules are residents/rewardRules.js). Sophia's is a book:
// a vanilla written book with Austin's text (data/lore.js), signed by her, so it reads like any book and can be kept,
// shelved or put on a lectern.
import { world, ItemStack } from "@minecraft/server";
import { GLADES_BOOK } from "../data/lore.js";
import { bondOf, saveBond } from "./bonds.js";
import { rewardDue, rewardEarned, withReward } from "./rewardRules.js";
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
  const stack = bookStack(r.book);
  if (!stack) return undefined;
  const dropped = hand(player, stack);
  if (dropped === undefined) return undefined;
  saveBond(withReward(b, r, world.getDay()), player); // theirs for good from here
  return { line: bondLine(res, "reward"), name: r.name, count: 1, dropped };
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

/** Another copy for a player who earned it and carries none. Returns { line, name, dropped } or undefined. */
export function copyAgain(player, res) {
  const r = rewardEarned(res, bondOf(res.id, player.id));
  if (!r || carriesBook(player, r.book)) return undefined;
  const stack = bookStack(r.book);
  if (!stack) return undefined;
  const dropped = hand(player, stack);
  return dropped === undefined ? undefined : { line: bondLine(res, "rewardAgain"), name: r.name, dropped };
}
