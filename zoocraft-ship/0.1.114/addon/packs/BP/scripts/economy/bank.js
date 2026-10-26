import { ItemStack, ItemTypes } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { BANK_PRICES } from "../data/bankPrices.js";
import { newId } from "../core/ids.js";
import { getPark, insidePark, can, denyText, runLater } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";
import { spend } from "./economy.js";
import { giveItem, message } from "../platform/mc.js";
import { haystack, roomFor, pushRecent, coinsText, BANK_TEXT } from "./bankRules.js";

// The Zoo Bank (0.1.102, research/bank_plan.md): a block that turns the park's Zoo Coins into blocks. It sells and
// never buys back (Austin: "Only sell"). Each purchase is one ledger entry with its own operation id; the coins are
// taken first, the save flushed, then the blocks given (what no longer fits drops at the player's feet). Only owners
// and managers spend; anyone can look at the prices. Each player's "bought lately" list lives in "bank".

const BANK = "bank";

let rows; // the priced blocks this game has: { id, key, price, group, name, hay }
let byKey;

// Built the first time a Bank opens: a block the game doesn't know (a newer or experimental one) is left out.
export function bankRows() {
  if (rows) return rows;
  rows = [];
  byKey = new Map();
  for (const [key, price, group, name] of BANK_PRICES) {
    const id = `minecraft:${key}`;
    let known = false;
    try {
      known = ItemTypes.get(id) !== undefined;
    } catch {
      known = false;
    }
    if (!known) continue;
    const r = { id, key, price, group, name };
    r.hay = haystack(r);
    rows.push(r);
    byKey.set(key, r);
  }
  return rows;
}

export function bankRow(key) {
  bankRows();
  return byKey.get(key);
}

// Why this Bank can't open, or undefined when it can.
export function bankProblem(block) {
  if (!getPark()) return BANK_TEXT.noPark;
  if (!insidePark(block.dimension.id, block.location)) return BANK_TEXT.outside;
  return undefined;
}

// The free room in the player's inventory for one item, and its stack size.
export function roomIn(player, id) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  const probe = new ItemStack(id, 1);
  if (!inv) return { room: 0, stack: probe.maxAmount };
  const slots = [];
  for (let i = 0; i < inv.size; i++) {
    const it = inv.getItem(i);
    slots.push(it ? { same: it.isStackableWith(probe), amount: it.amount } : undefined);
  }
  return { room: roomFor(slots, probe.maxAmount), stack: probe.maxAmount };
}

export function recentRows(player) {
  return (db.get(BANK, player.id)?.recent ?? []).map(bankRow).filter(Boolean);
}

/** Buys `count` of a block for the park's coins. Everything is checked again here: the menu's answers are intents. */
export function buyBlocks(player, row, count) {
  const park = getPark();
  if (!park) return message(player, BANK_TEXT.noPark);
  if (!can(player, "spend")) return message(player, denyText("spend"));
  const n = Math.floor(count);
  if (!(n >= 1) || !bankRow(row.key)) return;
  const cost = n * row.price;
  const what = `${n} ${row.name}`;
  const res = spend(player, cost, `Bank: ${what}`, newId("bank"));
  if (!res.ok) return message(player, `§cNot enough Zoo Coins: ${what} costs ${coinsText(cost)} and the park has ${coinsText(park.balance)}.`);
  const rec = db.get(BANK, player.id) ?? { id: player.id };
  db.put(BANK, { ...rec, recent: pushRecent(rec.recent, row.key, BALANCE.bank.recentKeep) });
  db.flush();
  giveItem(player, row.id, n);
  const paid = sandboxOn(getPark()) ? "free (sandbox)" : `for ${coinsText(cost)}`;
  message(player, `§aBought ${what} ${paid}.`);
}

// Placing one says whether it will work there.
export function bankPlaced(player, block) {
  message(player, bankProblem(block) ?? "§aZoo Bank placed. §fUse it to buy blocks with the park's Zoo Coins.");
}

export function bankComponent(openMenu) {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const problem = bankProblem(e.block);
      runLater(() => (problem ? message(player, problem) : openMenu(player)));
    },
  };
}
