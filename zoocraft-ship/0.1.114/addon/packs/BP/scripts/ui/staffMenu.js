import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { RATIONS, rationPlural, rationCount } from "../data/items.js";
import { getPark, can, denyText, withPark, parkAt } from "../park/park.js";
import { balanceText } from "../park/rules.js";
import { spend } from "../economy/economy.js";
import { allExhibits, getExhibit } from "../exhibits/exhibits.js";
import { allKeepers, getKeeper, workingRooms, stockTotals, limit, hire, dismiss, rename, assign, statusOf, stockRoom, unstockRoom, roomText } from "../staff/staff.js";
import { roomUnits } from "../staff/rules.js";
import { exhibitsPerKeeper } from "../research/research.js";
import { newId } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { countItem, takeItem, giveItem, message } from "../platform/mc.js";

// Staff menu (spec sections 14 and 16): opened only at a Staff Room block, so players walk to the
// building (Austin, 2026-10-08). `room` undefined still works (no stocking) but nothing opens it that
// way. Every button is an intent; staff.js commits.
// 0.1.114: the staff of the park the room stands in (`park`); a form's answer comes back outside any scope, so
// every read and commit after one runs inside withPark(park).

const s = () => BALANCE.staff;

function stockLine(stock) {
  const parts = Object.keys(RATIONS).map((item) => `${stock[item] ?? 0} ${rationPlural(item)}`);
  return parts.join(", ");
}

export async function staffMenu(player, room, scope = (room && parkAt(room.dimension, room.pos)) ?? getPark()) {
  const park = scope && withPark(scope, getPark);
  if (!park) return message(player, "§eClaim a park with the Park Deed first.");
  const { keepers, rooms, body } = withPark(park, () => staffBody(player, room, park));
  const form = new ActionFormData().title("Staff").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (room) add("Stock supplies\n§8put the rations you carry in this room", () => withPark(park, () => stockFromInventory(player, room, park)));
  if (room && roomUnits(room) > 0) add("Take rations out", () => takeOut(player, room, park));
  if (room || rooms.length) add(`Buy rations for the Staff Room\n§8${s().buyBundle} at shop prices`, () => buyIn(player, room ?? rooms[0], park));
  add(`Hire a keeper\n§8${s().keeperWage} coins a park day`, () => hireFlow(player, park));
  for (const k of keepers) add(`${k.name}\n§8${statusOf(k).replace(/§./g, "")}`, () => keeperMenu(player, k.id, room, park));
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

function staffBody(player, room, park) {
  const keepers = allKeepers();
  const rooms = workingRooms();
  const body = [
    `§fKeepers: §7${keepers.length} of ${limit()} §8(each Staff Room houses ${s().keepersPerRoom}, up to ${s().maxKeepers})`,
    `§fWages: §7${s().keeperWage} coins per keeper each park day${keepers.length ? `, ${keepers.length * s().keeperWage} in all` : ""}. §fZoo Coins: ${balanceText(park)}`,
    `§fSupplies in ${rooms.length === 1 ? "the Staff Room" : `${rooms.length} working Staff Rooms`}: §7${stockLine(stockTotals())}`,
    room ? `${room.valid ? "§a" : "§c"}${roomText(room)}` : `§7A Staff Room is a building you make: walls, floor and roof with at least ${s().roomMinSize} x ${s().roomMinSize} x ${s().roomMinSize} of open space inside, and the Staff Room block inside it or against its outside wall.`,
    room ? `§fThis room: §7${roomUnits(room)}/${s().roomCapacity} ration units${room.valid ? "" : " §8(keepers can't use them until it's a room)"}` : "§7Stock supplies at a Staff Room.",
    "",
    keepers.length ? "§7Keepers refill feeders, food baskets and troughs from these supplies and clean their exhibits." : "§7Hire a keeper to refill feeders, food baskets and troughs and clean exhibits for you.",
  ].join("\n");
  return { keepers, rooms, body };
}

async function stockFromInventory(player, room, park) {
  if (!can(player, "care", park)) return message(player, denyText("care", park));
  let moved = 0;
  for (const [item, ration] of Object.entries(RATIONS)) {
    const have = countItem(player, item);
    if (!have) continue;
    const space = s().roomCapacity - roomUnits(room);
    const count = Math.min(have, Math.floor(space / ration.units));
    if (count <= 0) break;
    // Take the items first, so a failed or repeated move never makes rations out of nothing.
    if (!takeItem(player, item, count)) continue;
    moved += stockRoom(room, item, count * ration.units);
  }
  db.flush();
  if (!moved) return message(player, roomUnits(room) >= s().roomCapacity ? "§eThe Staff Room is full." : "§eYou aren't carrying any rations.");
  message(player, `§aStocked ${moved} ration units. Staff Room: ${roomUnits(room)}/${s().roomCapacity}.`);
}

async function takeOut(player, room, park) {
  if (!can(player, "care", park)) return message(player, denyText("care", park));
  const items = Object.keys(room.stock ?? {}).filter((item) => room.stock[item] > 0);
  const form = new ActionFormData().title("Take rations out");
  for (const item of items) form.button(`${rationPlural(item)}\n§8${room.stock[item]} here`);
  const r = await show(player, form);
  if (!r || r.selection === undefined || !items[r.selection]) return;
  const item = items[r.selection];
  const have = room.stock[item] ?? 0;
  let want = have;
  if (have > 1) {
    const m = await show(player, new ModalFormData().title(`Take ${rationPlural(item)}`).slider("How many?", 1, have, { valueStep: 1, defaultValue: Math.min(have, 64) }));
    if (!m) return;
    want = Number(m.formValues[0]);
  }
  const taken = withPark(park, () => unstockRoom(room, item, Math.min(want, room.stock[item] ?? 0)));
  db.flush();
  if (taken) giveItem(player, item, taken);
  message(player, `§aTook ${taken} ${rationCount(item, taken)}.`);
}

async function buyIn(player, room, park) {
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const items = Object.keys(RATIONS).filter((item) => BALANCE.shop[item]);
  const form = new ActionFormData().title("Buy rations for the Staff Room").body(`§fZoo Coins: ${balanceText(park)}`);
  for (const item of items) form.button(`${s().buyBundle} ${rationPlural(item)}\n§8${BALANCE.shop[item].price * s().buyBundle} coins`);
  const r = await show(player, form);
  if (!r || r.selection === undefined || !items[r.selection]) return;
  const item = items[r.selection];
  if (s().roomCapacity - roomUnits(room) < s().buyBundle) return message(player, "§eThat Staff Room is too full.");
  const cost = BALANCE.shop[item].price * s().buyBundle;
  const res = withPark(park, () => spend(player, cost, `Bought ${s().buyBundle} ${rationPlural(item)} for the Staff Room`, newId("buy")));
  if (!res.ok) return message(player, `§cNot enough Zoo Coins (${cost} needed).`);
  withPark(park, () => stockRoom(room, item, s().buyBundle * RATIONS[item].units));
  db.flush();
  message(player, `§aBought ${s().buyBundle} ${rationPlural(item)} into the Staff Room for ${cost} coins.`);
}

async function hireFlow(player, park) {
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const r = await show(
    player,
    new MessageFormData()
      .title("Hire a keeper")
      .body(`A keeper refills feeders, food baskets and water and lava troughs with rations from the Staff Rooms, and cleans their exhibits. They look after up to ${exhibitsPerKeeper()} exhibits.\n\nWages: ${s().keeperWage} Zoo Coins at the start of each park day. A keeper who can't be paid stops work until the park can pay.`)
      .button1("Hire")
      .button2("Not now"),
  );
  if (r?.selection !== 0) return;
  const res = withPark(park, hire);
  if (!res.ok) return message(player, `§e${res.reason}`);
  const names = res.keeper.exhibitIds.map((id) => getExhibit(id)?.name).filter(Boolean);
  message(player, `§aHired ${res.keeper.name}. ${names.length ? `Looking after: ${names.join(", ")}.` : "§eNo exhibits with animals yet: assign some from the Staff menu."}`);
}

async function keeperMenu(player, keeperId, room, park) {
  const k = getKeeper(keeperId);
  if (!k) return;
  const names = k.exhibitIds.map((id) => getExhibit(id)?.name ?? "a removed exhibit");
  const body = [
    `§f${k.name}, keeper`,
    `§fNow: §7${withPark(park, () => statusOf(k)).replace(/§./g, "")}`,
    `§fLooks after: §7${names.join(", ") || "nothing yet"}`,
    `§fJobs done: §7${k.done ?? 0}`,
    k.owed?.length ? `§cWages owed: ${k.owed.length * s().keeperWage} coins` : `§fWages: §7${s().keeperWage} coins a park day, paid`,
  ].join("\n");
  const form = new ActionFormData().title(k.name).body(body).button("Assign exhibits").button("Rename").button("Dismiss").button("Back");
  const r = await show(player, form);
  if (!r || r.selection === undefined) return;
  if (r.selection === 3) return staffMenu(player, room, park);
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  if (r.selection === 0) return assignFlow(player, k.id, park);
  if (r.selection === 1) {
    const m = await show(player, new ModalFormData().title(`Rename ${k.name}`).textField("Name", k.name, { defaultValue: k.name }));
    const name = String(m?.formValues?.[0] ?? "").trim().slice(0, 24);
    if (!name) return;
    const fresh = getKeeper(k.id);
    if (!fresh) return;
    rename(fresh, name);
    db.flush();
    return message(player, `§aRenamed the keeper to ${name}.`);
  }
  if (r.selection === 2) {
    const ok = await show(player, new MessageFormData().title(`Dismiss ${k.name}?`).body(`${k.name} leaves the park.${k.owed?.length ? " Wages still owed are written off." : ""}`).button1("Dismiss").button2("Keep"));
    if (ok?.selection !== 0) return;
    const fresh = getKeeper(k.id);
    if (fresh) withPark(park, () => dismiss(fresh));
    message(player, `§e${k.name} has left the park.`);
  }
}

async function assignFlow(player, keeperId, park) {
  const k = getKeeper(keeperId);
  if (!k) return;
  const exhibits = withPark(park, allExhibits);
  if (!exhibits.length) return message(player, "§eNo exhibits yet.");
  const form = new ModalFormData().title(`${k.name}: exhibits`);
  for (const ex of exhibits) form.toggle(`${ex.name} §8(${ex.animalIds.length} animals)`, { defaultValue: k.exhibitIds.includes(ex.id) });
  const r = await show(player, form);
  if (!r) return;
  const chosen = exhibits.filter((_, i) => r.formValues[i]).map((ex) => ex.id);
  const fresh = getKeeper(k.id);
  if (!fresh) return;
  withPark(park, () => assign(fresh, chosen));
  db.flush();
  const per = withPark(park, exhibitsPerKeeper);
  const extra = chosen.length > per ? ` §eA keeper looks after ${per} at most; the first ${per} were kept.` : "";
  message(player, `§a${fresh.name} looks after ${fresh.exhibitIds.length} exhibit${fresh.exhibitIds.length === 1 ? "" : "s"}.${extra}`);
}
