import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { BANK_GROUPS } from "../data/bankPrices.js";
import { getPark, can, denyText, withPark } from "../park/park.js";
import { balanceText, sandboxOn } from "../park/rules.js";
import { bankRows, recentRows, roomIn, buyBlocks } from "../economy/bank.js";
import { searchBlocks, groupSummary, blockButton, buyAmounts, amountLabel, buyLimit, coinsText, BANK_TEXT } from "../economy/bankRules.js";
import { message } from "../platform/mc.js";

// The Zoo Bank's menu (0.1.102, research/bank_plan.md): search by name, the player's last purchases and thirteen
// groups to browse, 40 blocks to a page; pick a block, then how many. The answers are intents: economy/bank.js checks
// everything again when it buys. A submenu returns "back" for the main menu; anything else closes the Bank.
// 0.1.114: the Bank sells for the park it stands in (`scope`, the park of the block's menu); a form's answer comes
// back outside any scope, so every read and the purchase run inside withPark(scope).

const lastQuery = new Map(); // player id -> their last search, to start the next one from

export async function bankMenu(player, scope = getPark()) {
  for (;;) {
    const park = scope && withPark(scope, getPark);
    if (!park) return;
    const rows = withPark(park, bankRows);
    const recent = withPark(park, () => recentRows(player));
    const lines = [`§fZoo Coins: ${balanceText(park)}`, "§7The Bank turns the park's coins into blocks. It sells blocks; it doesn't buy them back."];
    if (!can(player, "spend", park)) lines.push("", "§eYou can look at the prices. Only a park manager or the owner can buy.");
    const form = new ActionFormData().title("Zoo Bank").body(lines.join("\n"));
    const actions = [];
    const add = (label, fn) => {
      form.button(label);
      actions.push(fn);
    };
    add("Search by name\n§8type part of a block's name", () => searchMenu(player, park));
    if (recent.length) add(`Bought lately\n§8${recent.length} block${recent.length === 1 ? "" : "s"}`, () => listMenu(player, "Bought lately", recent, park));
    for (const g of groupSummary(rows, BANK_GROUPS)) {
      const range = g.min === g.max ? coinsText(g.min) : `${g.min} to ${coinsText(g.max)}`;
      add(`${g.name}\n§8${g.count} blocks · ${range}`, () => listMenu(player, g.name, rows.filter((r) => r.group === g.group), park));
    }
    add("Close", () => "close");
    const r = await show(player, form);
    if (!r || r.selection === undefined) return;
    if ((await actions[r.selection]?.()) !== "back") return;
  }
}

async function searchMenu(player, scope) {
  const form = new ModalFormData()
    .title("Search the Bank")
    .textField("Block name, or part of it", "oak planks", { defaultValue: lastQuery.get(player.id) ?? "" })
    .submitButton("Search");
  const res = await show(player, form);
  const typed = res?.formValues?.find((v) => typeof v === "string");
  if (typeof typed !== "string") return "back";
  const q = typed.trim();
  if (!q) {
    message(player, BANK_TEXT.short);
    return "back";
  }
  lastQuery.set(player.id, q);
  const found = searchBlocks(withPark(scope, bankRows), q);
  if (!found.length) {
    message(player, BANK_TEXT.noMatch(q));
    return "back";
  }
  return listMenu(player, `Search: ${q}`, found, scope);
}

// A list of blocks, a page at a time. Picking one goes to its amounts; Back goes to the main menu.
async function listMenu(player, title, list, scope) {
  const per = BALANCE.bank.pageSize;
  const pages = Math.max(1, Math.ceil(list.length / per));
  let page = 0;
  for (;;) {
    const park = withPark(scope, getPark);
    if (!park) return "close";
    const shown = list.slice(page * per, page * per + per);
    const head = pages > 1 ? `Page ${page + 1} of ${pages}: ` : "";
    const form = new ActionFormData().title(title).body(`§7${head}${list.length} block${list.length === 1 ? "" : "s"}. §fZoo Coins: ${balanceText(park)}`);
    for (const row of shown) form.button(blockButton(row));
    const extra = [];
    if (page + 1 < pages) extra.push("next");
    if (page > 0) extra.push("previous");
    extra.push("back");
    for (const e of extra) form.button(e === "next" ? "Next page" : e === "previous" ? "Previous page" : "Back");
    const r = await show(player, form);
    if (!r || r.selection === undefined) return "close";
    if (r.selection < shown.length) {
      if ((await buyMenu(player, shown[r.selection], scope)) === "close") return "close";
      continue;
    }
    const e = extra[r.selection - shown.length];
    if (e === "next") page++;
    else if (e === "previous") page--;
    else return "back";
  }
}

// How many of one block: a list of amounts with their cost, up to what fits and what the park can pay. Cancelling
// goes back to the list; a purchase (or a reason it can't be made) closes the Bank so the chat line shows.
async function buyMenu(player, row, scope) {
  const park = withPark(scope, getPark);
  if (!park) return "close";
  if (!can(player, "spend", park)) {
    message(player, denyText("spend", park));
    return "close";
  }
  const { room, stack } = roomIn(player, row.id);
  if (room < 1) {
    message(player, BANK_TEXT.noRoom(row.name));
    return "close";
  }
  const sandbox = sandboxOn(park);
  const { limit, by } = buyLimit(room, park.balance, row.price, sandbox);
  if (limit < 1) {
    message(player, BANK_TEXT.noCoins(row.name, row.price, park.balance));
    return "close";
  }
  const amounts = buyAmounts(stack, limit);
  const price = sandbox ? 0 : row.price;
  const labels = amounts.map((n, i) => amountLabel(n, stack, price, i === amounts.length - 1 ? by : undefined));
  const info = [`§f${coinsText(row.price)} each.`, `§7Room in your inventory for ${room}.`, sandbox ? "§dSandbox mode: blocks are free." : `§7The park has ${coinsText(park.balance)}.`].join(" ");
  const form = new ModalFormData()
    .title(row.name)
    .dropdown("How many?", labels, { defaultValueIndex: Math.max(0, amounts.indexOf(Math.min(stack, limit))) })
    .label(info)
    .submitButton("Buy");
  const res = await show(player, form);
  const pick = res?.formValues?.find((v) => typeof v === "number");
  if (typeof pick !== "number" || !amounts[pick]) return undefined;
  withPark(park, () => buyBlocks(player, row, amounts[pick]));
  return "close";
}
