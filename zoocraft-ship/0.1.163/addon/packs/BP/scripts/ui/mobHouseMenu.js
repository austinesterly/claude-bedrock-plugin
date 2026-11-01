import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { getPark, can, parkAt, withPark } from "../park/park.js";
import { houseText, setHousePrice, pensShown } from "../visitors/mobHouse.js";
import { mobHouseShare } from "../animals/mobRules.js";
import { message } from "../platform/mc.js";

// The Mob House menu (0.1.163): how the hall stands, the pens on view, and the entry price guests pay to go in.
// The house's park is the one its block stands in; a form's answer comes back outside any scope, so the reads run
// inside withPark (the Gift Shop's menu does the same).

export async function mobHouseMenu(player, house) {
  const g = BALANCE.mobHouse;
  const rec = db.get("equipment", house.id) ?? house;
  const park = parkAt(rec.dimension, rec.pos) ?? getPark();
  const paid = rec.paidDay === park?.today.day ? rec.paidToday ?? 0 : 0;
  const pens = rec.problem ? 0 : withPark(park, () => pensShown(rec).length);
  const goIn = Math.round(mobHouseShare(rec.price, BALANCE) * Math.min(1, g.varietyBase + g.varietyPerPen * Math.max(1, pens)) * 100);
  const body = [
    withPark(park, () => houseText(rec)),
    rec.problem ? "" : `§7The hall has ${rec.space} blocks of space inside.`,
    "",
    `§fEntry price: §7${rec.price} coins §8(guests think ${g.fair} is fair; about ${goIn}% of guests go in${pens > 1 ? "" : ", a few more with a second pen on view"})`,
    `§fMob pens on view: §7${pens}`,
    `§fGuests in today: §7${paid}`,
    "",
    "§7Mob pens are exhibits beside the hall: shut in all round with a roof, walled off from the hall with glass, glass panes or iron bars. Stand a Viewing Point in the hall (a guest path to it) looking into each pen. Wild monsters never spawn in the hall or the pens, but light the hall all the same.",
  ].join("\n");
  const form = new ActionFormData().title("Mob House").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (can(player, "spend", park)) add("Set the entry price", () => housePrice(player, rec, park));
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

async function housePrice(player, rec, park) {
  const g = BALANCE.mobHouse;
  const res = await show(player, new ModalFormData().title("Mob House entry").slider("Entry price (Zoo Coins)", g.min, g.max, { valueStep: 1, defaultValue: rec.price }).label(`Guests think §e${g.fair} coins§r is fair. A dearer entry draws fewer guests in.`));
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const cur = db.get("equipment", rec.id);
  if (!cur) return message(player, "§cThat Mob House is gone.");
  withPark(park, () => setHousePrice(cur, Math.round(value)));
  message(player, `§aThe Mob House now costs ${cur.price} coins to go in. §7About ${Math.round(mobHouseShare(cur.price, BALANCE) * 100)}% of guests will go in.`);
}
