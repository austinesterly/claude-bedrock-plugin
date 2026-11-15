// Chasm's trade (0.1.290; the rules: residents/voidRules.js): on his menu once he has offered it at 50 friendship.
// "1 diamond = 1 Volatile Void Essence": the diamonds leave the player's stacks first, and exactly as many essences
// are handed over (at the player's feet if their inventory is full).
import { ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message, giveItem } from "../platform/mc.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "./bondRules.js";
import { bondOf } from "./bonds.js";
import { CHASM_ID, ESSENCE, diamondsIn, tradePlan, tradeOffers, hasTrade } from "./voidRules.js";

const slotsOf = (inv) => Array.from({ length: inv.size }, (_, i) => {
  const it = inv.getItem(i);
  return it && !it.nameTag ? { typeId: it.typeId, amount: it.amount } : undefined; // a renamed diamond is left alone
});

/** Whether Chasm trades with this player. */
export function chasmTrades(player) {
  return hasTrade(bondOf(CHASM_ID, player.id));
}

/** Trades up to `want` of the player's diamonds for as many essences. Returns how many were traded. */
export function tradeDiamonds(player, want) {
  if (!chasmTrades(player)) return 0;
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return 0;
  const plan = tradePlan(slotsOf(inv), want);
  let took = 0;
  for (const { slot, n } of plan.take) {
    const it = inv.getItem(slot);
    if (!it || it.typeId !== "minecraft:diamond" || it.nameTag || it.amount < n) continue; // changed under us: skip it
    if (it.amount === n) inv.setItem(slot, undefined);
    else {
      it.amount -= n;
      inv.setItem(slot, it);
    }
    took += n;
  }
  if (took > 0) giveItem(player, ESSENCE, took);
  return took;
}

/** His trade page. */
export async function essenceTrade(player) {
  const res = residentById(CHASM_ID);
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!res || !inv || !chasmTrades(player)) return;
  const have = diamondsIn(slotsOf(inv));
  if (!have) {
    message(player, `§f${res.name}: §7"${bondLine(res, "tradeNone")}"`);
    return;
  }
  const offers = tradeOffers(have);
  const form = new ActionFormData().title("Chasm's Trade").body(`§f${res.name}: §7"${bondLine(res, "tradeLook")}"\n\n§7You carry ${have} diamond${have === 1 ? "" : "s"}. Each one buys 1 Volatile Void Essence.`);
  for (const n of offers) form.button(n === have && n > 1 ? `Trade all ${n} diamonds` : `Trade ${n} diamond${n === 1 ? "" : "s"}`);
  form.button("Back");
  const r = await show(player, form);
  if (r?.selection === undefined || r.selection >= offers.length) return;
  const n = tradeDiamonds(player, offers[r.selection]);
  if (n > 0) message(player, `§f${res.name}: §7"${bondLine(res, "tradeDone")}" §aYou trade ${n} diamond${n === 1 ? "" : "s"} for ${n} Volatile Void Essence.`);
  else message(player, `§f${res.name}: §7"${bondLine(res, "tradeNone")}"`);
}

/** For the test server. */
export function tradeDebug(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  let essence = 0;
  for (let i = 0; inv && i < inv.size; i++) if (inv.getItem(i)?.typeId === ESSENCE) essence += inv.getItem(i).amount;
  return { trades: chasmTrades(player), diamonds: inv ? diamondsIn(slotsOf(inv)) : 0, essence };
}
