import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { getPark, can, denyText, withPark, parkAt } from "../park/park.js";
import { balanceText } from "../park/rules.js";
import { deskText, deskRouteText, deskRoute, allGuides, getGuide, getDesk, guidesOnDuty, limit, hire, dismiss, rename, statusOf, setTourPrice } from "../visitors/tours.js";
import { tourShare, stopsFactor, seatsPerDay } from "../visitors/tourRules.js";
import { message } from "../platform/mc.js";

// Tour Desk menu (0.1.65): opened only at a Tour Desk block, so players walk to the desk (Austin,
// 2026-10-08). Shows the walk the desk's tours make, the ticket price and sales, and the guides;
// hire, rename and dismiss guides and set the price. Every button is an intent; tours.js commits.
// 0.1.114: the desk's park is the one its block stands in; a form's answer comes back outside any scope, so the
// reads and commits after one run inside withPark(park).

const t = () => BALANCE.tours;

export async function tourMenu(player, desk, scope = parkAt(desk.dimension, desk.pos) ?? getPark()) {
  const park = scope && withPark(scope, getPark);
  if (!park) return message(player, "§eClaim a park with the Park Deed first.");
  const rec = getDesk(desk.id) ?? desk;
  const { here, body } = withPark(park, () => deskBody(rec, park));
  const form = new ActionFormData().title("Tour Desk").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (can(player, "spend", park)) {
    add(`Hire a Tour Guide\n§8${t().guideWage} coins a park day`, () => hireFlow(player, rec, park));
    add("Set the ticket price", () => priceFlow(player, rec, park));
  }
  for (const g of here) add(`${g.name}\n§8${withPark(park, () => statusOf(g)).replace(/§./g, "")}`, () => guideMenu(player, g.id, rec, park));
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

function deskBody(rec, park) {
  const guides = allGuides();
  const here = guides.filter((g) => g.deskId === rec.id);
  const duty = guidesOnDuty(rec);
  const plan = deskRoute(rec.id)?.plan;
  const stops = plan?.stops.length ?? 0;
  const buyers = Math.round(tourShare(rec.price, BALANCE) * stopsFactor(stops, BALANCE) * 100);
  const seats = seatsPerDay(duty.length, BALANCE);
  const body = [
    deskText(rec),
    `§fThe walk: §7${deskRouteText(rec)}`,
    "",
    `§fTickets: §7${rec.price} coins §8(guests think ${t().fair} is fair; about ${buyers}% of guests buy one${stops ? "" : ", once there is a walk"})`,
    `§fSold today: §7${rec.soldToday ?? 0} of ${seats} seats §8(${duty.length} guide${duty.length === 1 ? "" : "s"} on duty x ${t().toursPerGuide} tours x ${t().groupSize} guests)`,
    `§fTours today: §7${rec.toursToday ?? 0}${rec.waiting ? ` §8(${rec.waiting} ticket holder${rec.waiting === 1 ? "" : "s"} waiting for the next group)` : ""}`,
    `§fGuides: §7${guides.length} of ${limit()} §8(each Tour Desk employs ${t().guidesPerDesk}, up to ${t().maxGuides}) §fWages: §7${t().guideWage} coins a guide each park day. §fZoo Coins: ${balanceText(park)}`,
    "",
    "§7A guide takes each group from this desk along your paths to every exhibit with a working Viewing Point (one stop each, nearest first), talks about the animals at each stop, and walks back. Guests buy tickets while a guide is on duty and there is a walk; a group sets off as soon as tickets are sold.",
  ].join("\n");
  return { here, body };
}

async function hireFlow(player, desk, park) {
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const r = await show(
    player,
    new MessageFormData()
      .title("Hire a Tour Guide")
      .body(`A Tour Guide leads groups of up to ${t().groupSize} guests from this desk along the paths to the exhibits guests can see into, up to ${t().toursPerGuide} tours a park day, and talks about the animals at every stop.\n\nWages: ${t().guideWage} Zoo Coins at the start of each park day. A guide who can't be paid stops leading tours until the park can pay.`)
      .button1("Hire")
      .button2("Not now"),
  );
  if (r?.selection !== 0) return;
  const cur = getDesk(desk.id);
  const res = withPark(park, () => hire(cur ?? desk));
  if (!res.ok) return message(player, `§e${res.reason}`);
  message(player, `§aHired ${res.guide.name} as a Tour Guide. §7Tours set off from this desk as soon as guests buy tickets.`);
}

async function priceFlow(player, desk, park) {
  const res = await show(player, new ModalFormData().title("Ticket price").slider("Price per tour ticket (Zoo Coins)", t().min, t().max, { valueStep: 1, defaultValue: desk.price }).label(`Guests think §e${t().fair} coins§r is fair. Dearer tickets sell to fewer guests; more stops on the walk sell more.`));
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const cur = getDesk(desk.id);
  if (!cur) return message(player, "§cThat Tour Desk is gone.");
  withPark(park, () => setTourPrice(cur, Math.round(value)));
  db.flush();
  message(player, `§aTour tickets now cost ${cur.price} coins. §7About ${Math.round(tourShare(cur.price, BALANCE) * 100)}% of guests will buy one when the walk shows them the whole park.`);
}

async function guideMenu(player, guideId, desk, park) {
  const g = getGuide(guideId);
  if (!g) return;
  const body = [
    `§f${g.name}, tour guide`,
    `§fNow: §7${withPark(park, () => statusOf(g)).replace(/§./g, "")}`,
    `§fTours led: §7${g.done ?? 0}`,
    g.owed?.length ? `§cWages owed: ${g.owed.length * t().guideWage} coins` : `§fWages: §7${t().guideWage} coins a park day, paid`,
  ].join("\n");
  const form = new ActionFormData().title(g.name).body(body).button("Rename").button("Dismiss").button("Back");
  const r = await show(player, form);
  if (!r || r.selection === undefined) return;
  if (r.selection === 2) return tourMenu(player, desk, park);
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  if (r.selection === 0) {
    const m = await show(player, new ModalFormData().title(`Rename ${g.name}`).textField("Name", g.name, { defaultValue: g.name }));
    const name = String(m?.formValues?.[0] ?? "").trim().slice(0, 24);
    if (!name) return;
    const fresh = getGuide(g.id);
    if (!fresh) return;
    rename(fresh, name);
    db.flush();
    return message(player, `§aRenamed the guide to ${name}.`);
  }
  if (r.selection === 1) {
    const ok = await show(player, new MessageFormData().title(`Dismiss ${g.name}?`).body(`${g.name} leaves the park.${g.owed?.length ? " Wages still owed are written off." : ""}`).button1("Dismiss").button2("Keep"));
    if (ok?.selection !== 0) return;
    const fresh = getGuide(g.id);
    if (fresh) withPark(park, () => dismiss(fresh));
    message(player, `§e${g.name} has left the park.`);
  }
}
