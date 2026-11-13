// Handing over a resident's friendship reward (0.1.243; the rules are residents/rewardRules.js). Sophia's is a book:
// a vanilla written book with Austin's text (data/lore.js), signed by her, so it reads like any book and can be kept,
// shelved or put on a lectern. 0.1.245: a reward can be a thing instead (Terra's plans: `item`).
import { world, ItemStack } from "@minecraft/server";
import { GLADES_BOOK } from "../data/lore.js";
import { bondOf, saveBond } from "./bonds.js";
import { rewardDue, rewardsDueNow, rewardsEarned, withReward, askAgain } from "./rewardRules.js";
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

/** "a Steel Rod and Jack's Flint and Steel": the names of what is handed over. */
function andList(names) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
}

/**
 * Hands a ready reward to the player talking to the resident. Returns { line, name, count, dropped } (the shape of a
 * work gift's hand-over, with the thing's own name) or undefined when none is ready. 0.1.281: every reward ready at
 * that friendship comes in the same hand-over (rewardsDueNow: Jack's rod and lighter), named together.
 */
export function handReward(player, res) {
  const b = bondOf(res.id, player.id);
  const due = rewardsDueNow(res, b);
  const r = due[0];
  if (!r) return undefined;
  if (r.ability) {
    // 0.1.254: an ability (Jaylen's Hairline Painting): nothing changes hands, it is on their menu from here
    saveBond(withReward(b, r, world.getDay()), player);
    return { line: bondLine(res, r.line ?? "reward"), name: r.gives ?? r.name, count: 1, dropped: false };
  }
  const day = world.getDay();
  let bond = b;
  let dropped = false;
  const given = [];
  for (const x of due) {
    const stack = stackOf(x);
    if (!stack) continue;
    const d = hand(player, stack);
    if (d === undefined) break; // the player has gone
    dropped = dropped || d;
    bond = withReward(bond, x, day); // theirs for good from here
    given.push(x);
  }
  if (!given.length) return undefined;
  saveBond(bond, player);
  const line = given.length > 1 ? given[0].lineWith ?? given[0].line : given[0].line;
  return { line: bondLine(res, line ?? "reward"), name: andList(given.map((x) => x.give ?? x.name)), count: 1, dropped };
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
  const r = reward ? earned.find((x) => x === reward) : earned.find(askAgain);
  if (!askAgain(r) || carries(player, r)) return undefined; // 0.1.281: not one they don't give twice (Jack's rod)
  const stack = stackOf(r);
  if (!stack) return undefined;
  const dropped = hand(player, stack);
  return dropped === undefined ? undefined : { line: bondLine(res, "rewardAgain"), name: r.name, dropped };
}
