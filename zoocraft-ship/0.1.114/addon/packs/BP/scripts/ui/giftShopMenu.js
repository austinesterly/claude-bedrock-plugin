import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { getPark, can, parkAt, withPark } from "../park/park.js";
import { shopText, stockShop, buySouvenirs, setGiftPrice } from "../visitors/giftShop.js";
import { viewedSummary } from "../visitors/services.js";
import { giftShare, memorable } from "../visitors/serviceRules.js";
import { message } from "../platform/mc.js";

// Gift Shop menu (spec section 12): stock souvenirs from the inventory or the supply line, and set
// the price. Shows how memorable the visit is, which decides how many guests buy.
// 0.1.114: the shop's park is the one its block stands in; a form's answer comes back outside any scope, so the
// reads and the stocking run inside withPark.

export async function giftShopMenu(player, shop) {
  const g = BALANCE.giftShop;
  const rec = db.get("equipment", shop.id) ?? shop;
  const park = parkAt(rec.dimension, rec.pos) ?? getPark();
  const sold = rec.soldDay === park?.today.day ? rec.soldToday ?? 0 : 0;
  const seen = withPark(park, viewedSummary);
  const mem = memorable(seen.welfare, seen.species, BALANCE);
  const buyers = Math.round(giftShare(rec.price, BALANCE) * mem * 100);
  const visit = seen.species
    ? `§7Guests see ${seen.species} kind${seen.species === 1 ? "" : "s"} of animal at ${Math.round(seen.welfare)}% welfare: the visit is ${Math.round(mem * 100)}% memorable${seen.species < 2 ? " (a second kind of animal on view makes it more so)" : ""}.`
    : "§7Guests can't see any animals from a Viewing Point yet, so nobody buys a souvenir.";
  const body = [
    shopText(rec),
    rec.problem ? "" : `§7The building has ${rec.space} blocks of space inside.`,
    "",
    `§fStock: §7${rec.stock} of ${g.capacity} souvenirs`,
    `§fPrice: §7${rec.price} coins §8(guests think ${g.fair} is fair; about ${buyers}% of guests buy one)`,
    `§fSold today: §7${sold}`,
    "",
    visit,
    "",
    "§7Stock it with wool (plush toys, 2 each), paper (postcards) or paintings (prints, 3 each), or buy souvenirs in from the supply line.",
  ].join("\n");
  const form = new ActionFormData().title("Gift Shop").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (can(player, "care", park)) add("Stock from my inventory", () => withPark(park, () => stockShop(player, rec)));
  if (can(player, "spend", park)) {
    add(`Buy ${g.wholesaleBundle} souvenirs\n§8${g.wholesaleBundle * g.wholesaleCost} coins`, () => withPark(park, () => buySouvenirs(player, rec)));
    add("Set the price", () => giftPrice(player, rec, park));
  }
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

async function giftPrice(player, rec, park) {
  const g = BALANCE.giftShop;
  const res = await show(player, new ModalFormData().title("Souvenir price").slider("Price per souvenir (Zoo Coins)", g.min, g.max, { valueStep: 1, defaultValue: rec.price }).label(`Guests think §e${g.fair} coins§r is fair. Dearer souvenirs sell to fewer guests.`));
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const cur = db.get("equipment", rec.id);
  if (!cur) return message(player, "§cThat Gift Shop is gone.");
  withPark(park, () => setGiftPrice(cur, Math.round(value)));
  message(player, `§aSouvenirs now cost ${cur.price} coins. §7About ${Math.round(giftShare(cur.price, BALANCE) * 100)}% of guests will buy one after a great visit.`);
}
