// Shop screens: categories -> offers -> quantity -> confirm -> transaction -> receipt.
// Every await can take minutes, so the transaction functions re-check everything themselves.

import { world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { showForm } from "./forms.js";
import { BUYBACK, CATEGORIES, MAX_BUNDLES } from "./catalog.js";
import { CURRENCY, balance, canPay, countItem, earn, giveItem, pay, removeItem, roomFor } from "./wallet.js";

const RECEIPTS = "ns:receipts"; // player dynamic property: JSON array, newest first
const KEEP_RECEIPTS = 8;

const money = (n) => `${n} ${CURRENCY.unit}`;
const ok = (r) => r && !r.canceled;

export async function openShop(player) {
  for (;;) {
    const form = new ActionFormData().title("Vendor").body(`Welcome! You have §e${money(balance(player))}§r.`);
    const actions = [];
    for (const c of CATEGORIES) { form.button(c.name, c.icon); actions.push(() => browse(player, c)); }
    form.button("Sell items", "textures/items/emerald"); actions.push(() => sellMenu(player));
    form.button("My receipts", "textures/items/paper"); actions.push(() => showReceipts(player));
    form.button("Close"); actions.push(null);

    const r = await showForm(player, form);
    if (!player.isValid || !ok(r) || r.selection === undefined) return;
    const next = actions[r.selection];
    if (!next) return;
    await next();
    if (!player.isValid) return;
  }
}

async function browse(player, category) {
  for (;;) {
    const coins = balance(player);
    const form = new ActionFormData().title(category.name).body(`You have §e${money(coins)}§r.`);
    for (const o of category.offers) form.button(`${o.name} x${o.count}\n${coins >= o.price ? "§2" : "§c"}${money(o.price)}`, o.icon);
    form.button("Back");
    const r = await showForm(player, form);
    if (!player.isValid || !ok(r) || r.selection === undefined || r.selection >= category.offers.length) return;
    await buyFlow(player, category.offers[r.selection]);
    if (!player.isValid) return;
  }
}

/** Ask how many bundles (slider), between 1 and `max`. Resolves to a number or undefined. */
async function askQuantity(player, title, label, max) {
  if (max <= 1) return 1;
  const form = new ModalFormData().title(title).slider(label, 1, max, { defaultValue: 1, valueStep: 1 }).submitButton("Next");
  const r = await showForm(player, form);
  if (!player.isValid || !ok(r)) return undefined;
  const n = Math.floor(Number(r.formValues?.[0]));
  return Number.isFinite(n) ? Math.min(max, Math.max(1, n)) : undefined; // never trust client values
}

async function confirm(player, title, body, yes) {
  const r = await showForm(player, new MessageFormData().title(title).body(body).button1(yes).button2("Cancel"));
  return player.isValid && ok(r) && r.selection === 0; // MessageFormData: 0 = button1
}

async function buyFlow(player, offer) {
  const affordable = Math.floor(balance(player) / offer.price);
  if (affordable < 1) {
    player.sendMessage(`§cYou need ${money(offer.price)} for ${offer.name}.`);
    player.playSound("mob.villager.no");
    return;
  }
  const qty = await askQuantity(player, offer.name, `Bundles of ${offer.count}`, Math.min(MAX_BUNDLES, affordable));
  if (!qty) return;
  const total = qty * offer.price;
  if (!(await confirm(player, "Confirm purchase", `Buy ${qty * offer.count} x ${offer.name} for ${money(total)}?`, "Buy"))) return;
  buy(player, offer, qty);
}

/** Buy transaction. Synchronous: check money and space, take money, give items, write a receipt. */
function buy(player, offer, qty) {
  const total = qty * offer.price;
  const items = qty * offer.count;
  if (!canPay(player, total)) return fail(player, `Not enough ${CURRENCY.unit} (${balance(player)}/${total}).`);
  if (roomFor(player, offer.item) < items) return fail(player, "Not enough room in your inventory.");
  if (!pay(player, total)) return fail(player, "Payment failed.");
  const lost = giveItem(player, offer.item, items);
  if (lost > 0) {
    // Should not happen after roomFor(), but refund rather than lose anything.
    earn(player, Math.ceil((lost / items) * total));
    player.sendMessage("§eSome items didn't fit; that part was refunded.");
  }
  receipt(player, "bought", offer, items - lost, total);
}

async function sellMenu(player) {
  for (;;) {
    const form = new ActionFormData().title("Sell items").body("I buy these:");
    for (const o of BUYBACK) {
      const have = countItem(player, o.item);
      form.button(`${o.name} x${o.count} -> ${money(o.price)}\n§8You have ${have}`, o.icon);
    }
    form.button("Back");
    const r = await showForm(player, form);
    if (!player.isValid || !ok(r) || r.selection === undefined || r.selection >= BUYBACK.length) return;
    const o = BUYBACK[r.selection];
    const bundles = Math.floor(countItem(player, o.item) / o.count);
    if (bundles < 1) {
      fail(player, `You need at least ${o.count} ${o.name}.`);
      continue;
    }
    const qty = await askQuantity(player, `Sell ${o.name}`, `Bundles of ${o.count}`, Math.min(MAX_BUNDLES, bundles));
    if (!qty) continue;
    if (!(await confirm(player, "Confirm sale", `Sell ${qty * o.count} x ${o.name} for ${money(qty * o.price)}?`, "Sell"))) continue;
    sell(player, o, qty);
  }
}

/** Sell transaction: count, remove, then pay. Remove-then-give means a failure can't duplicate money. */
function sell(player, offer, qty) {
  const items = qty * offer.count;
  if (countItem(player, offer.item) < items) return fail(player, `You no longer have ${items} ${offer.name}.`);
  if (!removeItem(player, offer.item, items)) return fail(player, "Couldn't take the items.");
  earn(player, qty * offer.price);
  receipt(player, "sold", offer, items, qty * offer.price);
}

function fail(player, text) {
  player.sendMessage(`§c${text}`);
  player.playSound("mob.villager.no");
  return false;
}

function readReceipts(player) {
  const raw = player.getDynamicProperty(RECEIPTS);
  try {
    const list = typeof raw === "string" ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function receipt(player, verb, offer, items, total) {
  const list = readReceipts(player);
  list.unshift({ day: world.getDay(), verb, id: offer.id, name: offer.name, items, total });
  player.setDynamicProperty(RECEIPTS, JSON.stringify(list.slice(0, KEEP_RECEIPTS)));
  player.sendMessage(`§aReceipt:§r ${verb} ${items} x ${offer.name} for ${money(total)}. Balance: ${money(balance(player))}.`);
  player.playSound(verb === "bought" ? "random.orb" : "mob.villager.yes");
}

async function showReceipts(player) {
  const list = readReceipts(player);
  const body = list.length
    ? list.map((r) => `Day ${r.day}: ${r.verb} ${r.items} x ${r.name} (${money(r.total)})`).join("\n")
    : "No purchases yet.";
  await showForm(player, new ActionFormData().title("My receipts").body(body).button("Back"));
}
