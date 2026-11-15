// Ash's shop (0.1.304; the rules: residents/ashRules.js): on his menu while he is awake. Every piece is listed, locked
// or open by the buying player's own friendship with him; an open one is paid for from the park's Zoo Coins (the coins
// leave first, then the piece is handed over), so nothing is free and no money is made.
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message, giveItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "./bondRules.js";
import { bondOf } from "./bonds.js";
import { spend } from "../economy/economy.js";
import { coinsText } from "../economy/bankRules.js";
import { newId } from "../core/ids.js";
import { getPark, parkAt, withPark, can, denyText } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";
import { ASH_ID, shopRows, buyCheck } from "./ashRules.js";

function parkHere(player) {
  try {
    return parkAt(player.dimension.id, player.location) ?? getPark();
  } catch {
    return getPark();
  }
}
const rowsFor = (player) => shopRows(bondOf(ASH_ID, player.id).points, BALANCE.ashShop.price);

/** Buys one piece for the player. Returns the line to tell them, and whether it was bought. */
export function buyWare(player, key, park = parkHere(player)) {
  const res = residentById(ASH_ID);
  const row = rowsFor(player).find((r) => r.key === key);
  const say = (k) => `§f${res.name}: §7"${bondLine(res, k)}"`;
  if (!row) return { ok: false, text: "" };
  if (!row.open) return { ok: false, text: `${say("shopLocked")} §8(${row.name}: ${row.at} friendship)` };
  if (!park) return { ok: false, text: "§7There's no park here to pay from." };
  if (!can(player, "spend", park)) return { ok: false, text: denyText("spend", park) };
  const free = sandboxOn(park);
  if (buyCheck(row, park.balance, free) === "poor") return { ok: false, text: `${say("shopPoor")} §c${row.name} costs ${coinsText(row.price)} and the park has ${coinsText(park.balance ?? 0)}.` };
  const paid = withPark(park, () => spend(player, row.price, `Ash: ${row.name}`, newId("ash")));
  if (!paid?.ok) return { ok: false, text: `${say("shopPoor")} §c${row.name} costs ${coinsText(row.price)} and the park has ${coinsText(park.balance ?? 0)}.` };
  giveItem(player, row.id, 1);
  return { ok: true, text: `${say("shopDone")} §aYou buy the ${row.name}.` };
}

/** His shop page. */
export async function ashShop(player) {
  const res = residentById(ASH_ID);
  if (!res) return;
  const park = parkHere(player);
  const free = Boolean(park && sandboxOn(park));
  const rows = rowsFor(player);
  const points = bondOf(ASH_ID, player.id).points ?? 0;
  const body = [`§f${res.name}: §7"${bondLine(res, "shopLook")}"`, "", `§7Your friendship with Ash: ${points} of 100.`];
  body.push(!park ? "§7There's no park here to pay from." : free ? "§7Free in sandbox." : `§7Paid from the park's Zoo Coins. The park has ${coinsText(park.balance ?? 0)}.`);
  body.push("§8Hats and shoes go on like armor, necklaces in the chest slot, gauntlets in the off hand.");
  const form = new ActionFormData().title("Ash's Designs").body(body.join("\n"));
  for (const r of rows) form.button(r.open ? `${r.name}: ${free ? "free" : coinsText(r.price)}\n§8${r.short}` : `§8Locked: ${r.name}\n§8Needs ${r.at} friendship`);
  form.button("Back");
  const got = await show(player, form);
  if (got?.selection === undefined || got.selection >= rows.length) return;
  message(player, buyWare(player, rows[got.selection].key, park).text);
}

/** For the test server. */
export function ashShopDebug(player) {
  const park = parkHere(player);
  return { points: bondOf(ASH_ID, player.id).points ?? 0, balance: park?.balance, rows: rowsFor(player).map((r) => [r.key, r.at, r.price, r.open]) };
}
