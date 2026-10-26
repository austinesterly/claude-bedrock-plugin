import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { getPark, can, denyText, withPark, parkAt } from "../park/park.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { getAnimal } from "../animals/animals.js";
import { platformText, platformLoop, getPlatform, candidateRays, raysOnDuty, rayState, assignRay, releaseRay, setRidePrice, rideNow } from "../visitors/rides.js";
import { rideShare, rideSeatsPerDay, loopText } from "../visitors/rideRules.js";
import { message } from "../platform/mc.js";

// Expedition Platform menu (0.1.66): opened only at the platform block, so players walk there
// (Austin, 2026-10-08). Shows the loop the ride flies, the price and today's sales, and the rays on
// the ride; assign and release rays, set the price, and ride along. Every button is an intent;
// rides.js commits.
// 0.1.114: the platform's park is the one its block stands in; a form's answer comes back outside any scope, so
// the reads and commits after one run inside withPark(park).

const r = () => BALANCE.ride;

export async function rideMenu(player, platform, scope = parkAt(platform.dimension, platform.pos) ?? getPark()) {
  const park = scope && withPark(scope, getPark);
  if (!park) return message(player, "§eClaim a park with the Park Deed first.");
  const rec = getPlatform(platform.id) ?? platform;
  const body = withPark(park, () => platformBody(rec));
  const form = new ActionFormData().title("Expedition Platform").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (park.members[player.id]) add("Ride now\n§8free for park members", () => rideFlow(player, rec, park));
  if (can(player, "spend", park)) {
    add("Assign a Void Ray", () => assignFlow(player, rec, park));
    add("Set the ride price", () => priceFlow(player, rec, park));
  }
  for (const id of rec.rayIds ?? []) {
    const a = getAnimal(id);
    if (a) add(`${a.name}\n§8${withPark(park, () => rayState(a, rec)).text.replace(/§./g, "")}`, () => rayMenu(player, id, rec, park));
  }
  add("Close", () => {});
  const res = await show(player, form);
  if (res && res.selection !== undefined) await actions[res.selection]?.();
}

function platformBody(rec) {
  const duty = raysOnDuty(rec);
  const plan = platformLoop(rec);
  const buyers = Math.round(rideShare(rec.price, BALANCE) * 100);
  const seats = rideSeatsPerDay(duty.length, BALANCE);
  const body = [
    platformText(rec),
    `§fThe loop: §7${loopText(plan, BALANCE)}`,
    "",
    `§fRides: §7${rec.price} coins §8(guests think ${r().fair} is fair; about ${buyers}% of guests buy one)`,
    `§fSold today: §7${rec.soldToday ?? 0} of ${seats} seats §8(${duty.length} ray${duty.length === 1 ? "" : "s"} x ${r().ridesPerDay} rides x ${r().seats} riders)`,
    `§fRides today: §7${rec.ridesToday ?? 0}${rec.waiting ? ` §8(${rec.waiting} rider${rec.waiting === 1 ? "" : "s"} waiting for the next ray)` : ""}`,
    `§fRays on the ride: §7${(rec.rayIds ?? []).length} of ${r().maxRays}`,
    ...(rec.rayIds ?? []).map((id) => {
      const a = getAnimal(id);
      return a ? `  §7${a.name}: ${rayState(a, rec).text}` : "  §8(a ray that is gone)";
    }),
    "",
    `§7A ray with riders climbs straight up from here, flies over the park's exhibits (nearest first, up to ${r().maxStops}) with ${r().clearance} blocks of clearance, hovers over each, and comes back down to land. A ray flies ${r().ridesPerDay} rides a park day at most, only while it is well, and rests ${r().restSeconds} s between rides. Park members ride for free.`,
  ].join("\n");
  return body;
}

async function rideFlow(player, platform, park) {
  const cur = getPlatform(platform.id);
  if (!cur) return message(player, "§cThat platform is gone.");
  const res = withPark(park, () => rideNow(player, cur));
  if (!res.ok) return message(player, `§e${res.reason}`);
  if (res.started) message(player, "§dA ray is on its way to the platform. Stay on the platform: you're on as soon as it lands. Sneak to get off at any time (you'll float down).");
  else message(player, "§dYou're on. Sneak to get off at any time (you'll float down).");
}

async function assignFlow(player, platform, park) {
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const cur = getPlatform(platform.id);
  if (!cur) return message(player, "§cThat platform is gone.");
  const list = withPark(park, () => candidateRays(cur)).filter((c) => c.platform?.id !== cur.id);
  if (!list.length) return message(player, "§eNo grown Void Ray lives in an exhibit in this dimension yet. Catch wild rays with a Stabilized Carrier and give them a roofed exhibit, then assign them here.");
  const form = new ActionFormData().title("Assign a Void Ray").body(`§7Grown Void Rays living in your exhibits. A ray assigned here leaves its exhibit for each ride and flies straight back after. ${r().maxRays} rays per platform at most.`);
  for (const c of list) form.button(`${c.animal.name}\n§8${c.exhibit.name}${c.platform ? " (on another platform's ride)" : ""}`);
  form.button("Back");
  const res = await show(player, form);
  if (!res || res.selection === undefined || res.selection >= list.length) return rideMenu(player, cur, park);
  const pick = list[res.selection];
  const fresh = getPlatform(cur.id);
  if (!fresh) return;
  const out = withPark(park, () => assignRay(fresh, pick.animal.id));
  if (!out.ok) return message(player, `§e${out.reason}`);
  db.flush();
  message(player, `§a${pick.animal.name} now flies the Expedition from this platform. §7It sets off as soon as guests buy rides, while it is well.`);
}

async function priceFlow(player, platform, park) {
  const res = await show(player, new ModalFormData().title("Ride price").slider("Price per ride (Zoo Coins)", r().min, r().max, { valueStep: 1, defaultValue: platform.price }).label(`Guests think ${r().fair} coins is fair.`));
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const cur = getPlatform(platform.id);
  if (!cur) return message(player, "§cThat platform is gone.");
  withPark(park, () => setRidePrice(cur, Math.round(value)));
  db.flush();
  message(player, `§aRides now cost ${cur.price} coins. §7About ${Math.round(rideShare(cur.price, BALANCE) * 100)}% of guests will buy one.`);
}

async function rayMenu(player, rayId, platform, park) {
  const a = getAnimal(rayId);
  if (!a) return;
  const ex = a.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const body = [
    `§f${a.name}, Void Ray${ex ? ` of ${ex.name}` : ""}`,
    `§fNow: §7${withPark(park, () => rayState(a, platform)).text.replace(/§./g, "")}`,
    `§fRides today: §7${a.ridesToday ?? 0} of ${r().ridesPerDay}   §fAll time: §7${a.ridesTotal ?? 0}`,
  ].join("\n");
  const form = new ActionFormData().title(a.name).body(body).button("Release from the ride").button("Back");
  const res = await show(player, form);
  if (!res || res.selection === undefined) return;
  if (res.selection === 1) return rideMenu(player, platform, park);
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const ok = await show(player, new MessageFormData().title(`Release ${a.name}?`).body(`${a.name} stops flying the Expedition and stays in its exhibit. A ride in progress ends and the ray goes home.`).button1("Release").button2("Keep"));
  if (ok?.selection !== 0) return;
  const fresh = getPlatform(platform.id);
  if (!fresh) return;
  withPark(park, () => releaseRay(fresh, rayId));
  db.flush();
  message(player, `§e${a.name} is off the ride.`);
}
