import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { getPark, claimPark, can, denyText, roleOf, setMember, insidePark, setEntrance, setOpen, setSetting, setAdmission, knownPlayers, transferPark } from "../park/park.js";
import { balanceText, sandboxLine, settingsText, memberRows, ROLE_LABEL, ROLE_TEXT, GIVABLE_ROLES, canHandOver } from "../park/rules.js";
import { spend, earn, recent } from "../economy/economy.js";
import { allExhibits, getExhibit } from "../exhibits/exhibits.js";
import { inHolding, allAnimals, welfare } from "../animals/animals.js";
import { band } from "../animals/welfare.js";
import { tutorialStatus, claimKit } from "../quests/tutorial.js";
import { expeditionStatus } from "../quests/expedition.js";
import { conservationStatus, releaseStatus } from "../quests/conservation.js";
import { packFromHolding } from "../transport/carriers.js";
import { allFixtures } from "../equipment/fixtures.js";
import { ratingNow } from "../visitors/visitors.js";
import { priceDemand, valueScore } from "../visitors/demand.js";
import { admission, pairedBooth, allPoints } from "../visitors/points.js";
import { allServices, serviceText, stockFromInventory, buyStock, setSnackPrice, SERVICE_NAMES } from "../visitors/services.js";
import { snackShare, amenityLines } from "../visitors/serviceRules.js";
import { pathSummary } from "../visitors/network.js";
import { currentMix } from "../visitors/guests.js";
import { mixText } from "../visitors/visitorMix.js";
import { newId } from "../core/ids.js";
import { openExhibit, openAnimal } from "./clipboard.js";
import { adoptGateNear } from "../park/gate.js";
import { countItem, giveItem, takeItem, message, onlinePlayers } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { allKeepers } from "../staff/staff.js";
import { tourSummary } from "../visitors/tours.js";
import { rideSummary } from "../visitors/rides.js";
import { fieldJournal } from "./fieldJournal.js";
import { RATIONS, rationPlural } from "../data/items.js";

// Park Deed menu: claim the park, then the Park Ledger dashboard (overview, animals, exhibits,
// finances, journal, supplies, holding, members, settings). Every button is an intent; the
// owning module checks and commits.

const ITEM_LABEL = { "zoocraft:leafy_ration": "Leafy Rations", "zoocraft:fish_ration": "Fish Rations", "zoocraft:small_carrier": "Small Carrier", "zoocraft:livestock_crate": "Livestock Crate", "zoocraft:reinforced_crate": "Reinforced Crate", "minecraft:packed_ice": "Packed Ice", "zoocraft:mineral_pellets": "Mineral Pellets", "zoocraft:thermal_carrier": "Thermal Carrier", "minecraft:charcoal": "Charcoal", "zoocraft:ember_ration": "Ember Rations", "zoocraft:molten_plankton": "Molten Plankton Feed", "minecraft:warped_fungus": "Warped Fungi", "zoocraft:chorus_browse": "Chorus Browse", "zoocraft:stabilized_carrier": "Stabilized Carrier", "zoocraft:insect_ration": "Insect Rations" };
// The rations not named above by their own names (0.1.88: the shop showed the newer ones, Fruit Rations on, by their ids).
const itemLabel = (item) => ITEM_LABEL[item] ?? (RATIONS[item] ? rationPlural(item) : item);

// Park Ledger dashboard (spec section 16): the overview first, then one page per area. The
// Research tab arrives with that system.
export async function openDeed(player) {
  const park = getPark();
  if (!park) return claimFlow(player);
  const role = roleOf(player.id);
  const r = ratingNow();
  const tut = tutorialStatus();
  const exp = expeditionStatus();
  const con = conservationStatus();
  const rel = releaseStatus();
  const tours = tourSummary();
  const rides = rideSummary();
  const warnings = topWarnings(3);
  const body = [
    `§fZoo Coins: ${balanceText(park)}   §fRating: §f${r.stars} stars §7(score ${r.score})`,
    ...(sandboxLine(park) ? [sandboxLine(park)] : []),
    `§fStatus: ${park.open ? "§aOpen" : "§7Closed"}${park.entrance ? "" : " §7(no entrance gate yet)"}`,
    `§fToday: §7${park.today.guests} guests, ${park.today.revenue} coins`,
    `§fGuests say: ${r.complaintLine ? `§e${r.complaintLine}` : "§aThey're enjoying the park."}`,
    `§fVisitors: §7${mixText(currentMix())}`,
    `§fAnimals: §7${allAnimals().length}   §fExhibits: §7${allExhibits().length}   §fIn holding: §7${inHolding().length}`,
    `§fKeepers: §7${allKeepers().length} §8(hire and manage them at a Staff Room)`,
    `§fTours: §7${tours.guides} guide${tours.guides === 1 ? "" : "s"}, ${tours.tours} tour${tours.tours === 1 ? "" : "s"} and ${tours.tickets} ticket${tours.tickets === 1 ? "" : "s"} today §8(${tours.desks ? "hire and manage guides at a Tour Desk" : "build a Tour Desk beside a path to run tours"})`,
    `§fRides: §7${rides.rays} Void Ray${rides.rays === 1 ? "" : "s"} on the Expedition, ${rides.rides} ride${rides.rides === 1 ? "" : "s"} and ${rides.tickets} ticket${rides.tickets === 1 ? "" : "s"} today §8(${rides.platforms ? "assign rays and set the price at an Expedition Platform" : "build an Expedition Platform beside a path under open sky"})`,
    `§fConservation: §7${rel.count} released to the wild${rel.count ? ` §8(+${Math.round(rel.boost * 100)}% guests a day)` : " §8(from an animal's page on the Exhibit Clipboard)"}`,
    "",
    warnings.length ? `§fNeeds attention:\n${warnings.map((w) => `${SEVERITY_COLOR[w.severity] ?? "§e"}- ${w.where}: ${w.text}`).join("\n")}` : "§aNothing needs attention.",
    tut.next ? `\n§bTutorial ${tut.done}/${tut.total}: §f${tut.next.title}` : "",
    exp.started && !exp.finished ? `\n§dEnd expedition ${exp.done}/${exp.total}: §f${exp.next.title}` : "",
    con.started && !con.finished ? `\n§2Conservation ${con.done}/${con.total}: §f${con.next.title}` : "",
    `\n§7Your role: ${ROLE_LABEL[role] ?? role}. §8${ROLE_TEXT[role] ?? ""}`,
  ].join("\n");
  const form = new ActionFormData().title("Park Ledger").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  add("Animals", () => animalsList(player));
  add("Exhibits", () => exhibitsList(player));
  add("Finances", () => finances(player));
  add(tut.next ? `Journal §8(tutorial ${tut.done}/${tut.total})` : "Journal", () => journal(player));
  add("Field Journal", () => fieldJournal(player));
  add("Supply shop", () => shop(player));
  if (inHolding().length) add(`Recovery holding (${inHolding().length})`, () => holding(player));
  if (role === "owner") add("Members", () => members(player));
  if (role === "owner") add("Settings", () => settings(player));
  add("Close", () => {});
  const res = await show(player, form);
  if (res && res.selection !== undefined) await actions[res.selection]?.();
}

const SEVERITY_COLOR = { 3: "§c", 2: "§6", 1: "§e" };

// The most urgent warnings across all exhibits, worst first, one per exhibit issue.
function topWarnings(count) {
  const out = [];
  for (const ex of allExhibits()) {
    for (const text of ex.issues) out.push({ severity: 3, where: ex.name, text });
    for (const w of ex.careWarnings) out.push({ severity: w.severity, where: ex.name, text: w.text });
  }
  return out.sort((a, b) => b.severity - a.severity).slice(0, count);
}

function whereIs(a) {
  if (a.location.kind === "exhibit") return getExhibit(a.location.id)?.name ?? "an exhibit";
  if (a.location.kind === "carrier") return "in a carrier";
  return "recovery holding";
}

async function animalsList(player) {
  const list = allAnimals();
  if (!list.length) return message(player, "§eNo animals yet. Catch one with a Small Carrier.");
  const form = new ActionFormData().title("Animals");
  for (const a of list) {
    const b = band(welfare(a), BALANCE.needs.bands);
    form.button(`${a.name} §8(${SPECIES[a.speciesId].displayName})\n${BAND_COLOR[b]}${BAND_TEXT[b]} §8· ${whereIs(a)}`);
  }
  const r = await show(player, form);
  if (r && r.selection !== undefined) openAnimal(player, list[r.selection].id);
}

const BAND_COLOR = { healthy: "§2", attention: "§6", urgent: "§6", critical: "§4" };
const BAND_TEXT = { healthy: "Healthy", attention: "Needs attention", urgent: "Urgent", critical: "Critical" };

async function finances(player) {
  const park = getPark();
  const r = ratingNow();
  const lines = recent(10).map((e) => `${e.amount >= 0 ? "§a+" : "§c"}${e.amount} §7${e.reason}`);
  const body = [
    `§fZoo Coins: ${balanceText(park)}`,
    `§fAdmission: §7${r.price} coins per guest ${pairedBooth() ? "(set at the Ticket Booth)" : "(place a Ticket Booth near the entrance gate to set it)"}`,
    `§fToday: §7${park.today.guests} guests, ${park.today.revenue} coins`,
    `§fYesterday: §7${park.lastDay.guests} guests, ${park.lastDay.revenue} coins`,
    `§fRating: §7${r.stars} stars (score ${r.score}). More stars bring more guests.`,
    `§fGuest satisfaction: §7${r.satisfaction} §8(viewing ${r.factors.viewing}, cleanliness ${r.factors.cleanliness}, value ${r.factors.value}, services ${r.factors.services})`,
    `§fServices: §7food ${r.services.parts.food}, seating ${r.services.parts.seating}, tidy paths ${r.services.parts.litter} §8(litter ${Math.round(park.litter ?? 0)})`,
    ...amenityLines(r.services.amenities, BALANCE),
    pathLine(),
    ...(r.unviewed.length ? [`§fNo working Viewing Point: §7${r.unviewed.join(", ")}`] : []),
    "",
    "§fRecent coins:",
    lines.join("\n") || "§7No transactions yet.",
  ].join("\n");
  await show(player, new ActionFormData().title("Finances").body(body).button("Close"));
}

function pathLine() {
  const net = pathSummary();
  const features = allServices();
  const off = [...allPoints("viewpoint").filter((v) => v.problem === "path").map(() => "Viewing Point"), ...features.filter((f) => f.problem === "path").map((f) => SERVICE_NAMES[f.type])];
  if (!getPark()?.entrance) return "§fGuest paths: §7place a Park Entrance Gate first";
  if (!net) return "§fGuest paths: §7not checked yet (stand near the entrance gate)";
  const reach = `${net.size} path blocks reach from the entrance${net.remembered ? ` (${net.remembered} remembered from earlier visits)` : ""}${net.capped ? `; §estopped at ${BALANCE.paths.maxNodes} blocks, the nearest part§7` : ""}`;
  const edge = net.unloadedAt ? `; §eunchecked ground at ${net.unloadedAt.x}, ${net.unloadedAt.z}: walk there and the paths beyond it get checked` : "";
  return `§fGuest paths: §7${reach}${edge}${off.length ? `; §enot on a path: ${off.join(", ")}` : ""}`;
}

async function journal(player) {
  const tut = tutorialStatus();
  const exp = expeditionStatus();
  const chain = (q, color) => q.steps.map((s) => (q.completed[s.id] !== undefined ? `§2Done: §7${s.title}` : s === q.next ? `${color}Now: §f${s.title}\n§7${s.hint}` : `§8Later: ${s.title}`));
  const parts = [`§6Caretaker tutorial ${tut.done}/${tut.total}\n\n${chain(tut, "§b").join("\n")}`];
  // The End expedition (spec section 4 stages) follows the tutorial: the campaign to the End wing.
  if (exp.open) parts.push(exp.finished ? `§dEnd expedition ${exp.done}/${exp.total}: §6complete` : `§dEnd expedition ${exp.done}/${exp.total}\n\n${chain(exp, "§d").join("\n")}`);
  // The conservation programme (spec phase 5): releases to the wild, beside the expedition.
  const con = conservationStatus();
  const rel = releaseStatus();
  if (con.open) parts.push((con.finished ? `§2Conservation programme ${con.done}/${con.total}: §6complete` : `§2Conservation programme ${con.done}/${con.total}\n\n${chain(con, "§2").join("\n")}`) + `\n§7Released to the wild: ${rel.count}${rel.count ? ` (${Object.entries(rel.species).map(([id, n]) => `${n} ${SPECIES[id]?.displayName ?? id}`).join(", ")}); ${Math.round(rel.boost * 100)}% more guests a day` : ""}`);
  const form = new ActionFormData().title("Journal").body(parts.join("\n\n"));
  const kit = Boolean(tut.next);
  if (kit) form.button(`Replacement starter kit\n§8${BALANCE.tutorial.maxKitClaims - tut.kitClaims} left, one per park day`);
  form.button("Close");
  const r = await show(player, form);
  if (kit && r?.selection === 0) claimKit(player);
}

async function claimFlow(player) {
  const r = await show(
    player,
    new MessageFormData()
      .title("Claim a park")
      .body(`Found a wildlife park here? Your park covers ${BALANCE.park.radius} blocks around where you stand, and you start with ${BALANCE.economy.startingFunds} Zoo Coins.\n\nNext: build a Zoo Workshop. The Journal in this menu walks you through your first exhibit.`)
      .button1("Claim here")
      .button2("Not yet"),
  );
  if (r?.selection !== 0) return;
  const res = claimPark(player);
  if (!res.ok) return message(player, `§c${res.reason}`);
  message(player, `§aYou claimed the park! §e${BALANCE.economy.startingFunds} Zoo Coins §ato start.`);
}

async function exhibitsList(player) {
  const list = allExhibits();
  if (!list.length) return message(player, "§eNo exhibits yet. Place an Exhibit Controller to start one.");
  const form = new ActionFormData().title("Exhibits");
  for (const ex of list) form.button(`${ex.name}\n§8${ex.animalIds.length} animals · ${ex.state}`);
  const r = await show(player, form);
  if (r && r.selection !== undefined) openExhibit(player, list[r.selection].id);
}

async function shop(player) {
  const entries = Object.entries(BALANCE.shop);
  const park = getPark();
  const form = new ActionFormData().title("Supply shop").body(`§fZoo Coins: ${balanceText(park)}`);
  for (const [item, { price, bundle }] of entries) form.button(`${bundle} ${itemLabel(item)}\n§8${price * bundle} coins`);
  form.button("Sell rations\n§8get coins back for rations you carry");
  form.button("Back");
  const r = await show(player, form);
  if (!r || r.selection === undefined || r.selection > entries.length) return;
  if (!can(player, "spend")) return message(player, denyText("spend"));
  if (r.selection === entries.length) return sell(player);
  const [item, { price, bundle }] = entries[r.selection];
  const cost = price * bundle;
  const res = spend(player, cost, `Bought ${bundle} ${itemLabel(item)}`, newId("buy"));
  if (!res.ok) return message(player, `§cNot enough Zoo Coins (${cost} needed).`);
  db.flush();
  giveItem(player, item, bundle);
  message(player, `§aBought ${bundle} ${itemLabel(item)} for ${cost} coins.`);
}

async function sell(player) {
  const entries = Object.entries(BALANCE.shop).filter(([item, e]) => e.sell > 0 && countItem(player, item) > 0);
  if (!entries.length) return message(player, "§eYou aren't carrying any rations to sell.");
  const form = new ActionFormData().title("Sell rations").body("The shop buys rations back for less than it sells them.");
  for (const [item, { sell: each }] of entries) form.button(`${itemLabel(item)}\n§8you have ${countItem(player, item)} · ${each} coin${each === 1 ? "" : "s"} each`);
  const r = await show(player, form);
  if (!r || r.selection === undefined || !entries[r.selection]) return;
  const [item, { sell: each }] = entries[r.selection];
  const label = itemLabel(item);
  const have = countItem(player, item);
  let count = have;
  if (have > 1) {
    const m = await show(player, new ModalFormData().title(`Sell ${label}`).slider("How many?", 1, have, { valueStep: 1, defaultValue: have }));
    if (!m) return;
    count = Math.min(Number(m.formValues[0]), countItem(player, item));
  }
  // Take the items first, so a failed or repeated sale can never pay out twice.
  if (count < 1 || !takeItem(player, item, count)) return message(player, `§cYou no longer have ${count} ${label}.`);
  earn(count * each, `Sold ${count} ${label}`, newId("sell"));
  db.flush();
  message(player, `§aSold ${count} ${label} for ${count * each} coins.`);
}

export async function holding(player) {
  const list = inHolding();
  if (!list.length) return message(player, "§aNo animals in recovery holding.");
  const station = allFixtures("station").length > 0;
  const care = station ? "§aThe Recovery Station is nursing them back to health." : "§eBuild a Recovery Station (Zoo Workshop) so unwell animals get better here.";
  const form = new ActionFormData().title("Recovery holding").body(`Animals here are safe but not on show. ${care}\n\n§fPick one to put it in an empty carrier from your inventory, then use the carrier inside an exhibit.`);
  for (const a of list) {
    const b = band(welfare(a), BALANCE.needs.bands);
    form.button(`${a.name} (${SPECIES[a.speciesId].displayName})\n${a.ill ? "§4Unwell" : `${BAND_COLOR[b]}${BAND_TEXT[b]}`} §8· ${a.location.why ?? ""}`);
  }
  const r = await show(player, form);
  if (r && r.selection !== undefined && list[r.selection]) packFromHolding(player, list[r.selection].id);
}

// Members (spec section 2 roles): everyone who has ever joined the world is listed, online or not,
// with their role; the owner picks one to change it or to hand the park over.
async function members(player) {
  if (!can(player, "members")) return message(player, denyText("members"));
  const park = getPark();
  const rows = memberRows(park, knownPlayers(), onlinePlayers().map((p) => p.id));
  const help = ["owner", "manager", "keeper", "visitor"].map((r) => `§f${ROLE_LABEL[r]}: §7${ROLE_TEXT[r]}`).join("\n");
  if (!rows.length) return show(player, new ActionFormData().title("Members").body(`§eNo other player has joined this world yet. When someone does, they appear here and you can give them a role.\n\n${help}`).button("Close"));
  const form = new ActionFormData().title("Members").body(`§fOwner: §7${park.members[park.ownerId]?.name ?? "?"}\n\n${help}\n\n§fPick a player to change their role:`);
  for (const m of rows) form.button(`${m.name}\n§8${ROLE_LABEL[m.role]} · ${m.online ? "§aonline" : "§7offline"}`);
  form.button("Close");
  const r = await show(player, form);
  if (!r || r.selection === undefined || !rows[r.selection]) return;
  await memberPage(player, rows[r.selection]);
  return members(player);
}

async function memberPage(player, m) {
  const form = new ActionFormData().title(m.name).body(`§fRole now: §7${ROLE_LABEL[m.role]}\n§8${ROLE_TEXT[m.role]}\n\n§fGive them a role:`);
  for (const role of GIVABLE_ROLES) form.button(`${ROLE_LABEL[role]}${role === m.role ? " §8(now)" : ""}\n§8${ROLE_TEXT[role].split(":")[0]}`);
  form.button("Hand the park over to them\n§8you stay on as a manager");
  form.button("Back");
  const r = await show(player, form);
  if (!r || r.selection === undefined) return;
  if (r.selection < GIVABLE_ROLES.length) {
    const role = GIVABLE_ROLES[r.selection];
    setMember(m.id, m.name, role);
    message(player, `§a${m.name} is now a ${role}.`);
    const target = onlinePlayers().find((p) => p.id === m.id);
    if (target) message(target, `§6${player.name} made you a ${role}: §f${ROLE_TEXT[role]}.`);
    return;
  }
  if (r.selection === GIVABLE_ROLES.length) return handOverFlow(player, m);
}

async function handOverFlow(player, m) {
  const park = getPark();
  const check = canHandOver(park, m.id);
  if (!check.ok) return message(player, `§e${check.reason}`);
  const r = await show(player, new MessageFormData().title("Hand the park over").body(`Make ${m.name} the park owner? They will control members and settings; you stay on as a manager (building and spending). Only they can hand it back.`).button1("Hand it over").button2("Cancel"));
  if (r?.selection !== 0) return;
  const res = transferPark(m.id, m.name);
  if (!res.ok) return message(player, `§e${res.reason}`);
  message(player, `§a${m.name} now owns the park. You're a manager.`);
  const target = onlinePlayers().find((p) => p.id === m.id);
  if (target) message(target, `§6${player.name} handed the park to you: §fyou're the owner now.`);
}

// Park settings (spec sections 2 and 19): sandbox mode and peaceful care, with what each does spelled
// out (park/rules.js). Switching sandbox mode tells every member online.
async function settings(player) {
  if (!can(player, "settings")) return message(player, denyText("settings"));
  const park = getPark();
  const r = await show(
    player,
    new ModalFormData()
      .title("Park settings")
      .label(settingsText(park))
      .toggle("Sandbox mode (unlimited coins, free research and wages)", { defaultValue: Boolean(park.settings.sandbox) })
      .toggle("Peaceful care (needs don't drop)", { defaultValue: Boolean(park.settings.peacefulCare) }),
  );
  if (!r) return;
  // The label takes a slot in formValues in some server-ui versions: read the toggles from the end.
  const sandbox = Boolean(r.formValues[r.formValues.length - 2]);
  const peaceful = Boolean(r.formValues[r.formValues.length - 1]);
  const sandboxChanged = sandbox !== Boolean(park.settings.sandbox);
  setSetting("sandbox", sandbox);
  setSetting("peacefulCare", peaceful);
  message(player, `§aSandbox mode ${sandbox ? "on" : "off"}, peaceful care ${peaceful ? "on" : "off"}.`);
  if (sandboxChanged) {
    const fresh = getPark();
    for (const p of onlinePlayers()) if (p.id !== player.id && fresh.members[p.id]) message(p, sandbox ? "§dSandbox mode is on: §fnothing costs Zoo Coins, research is free, keepers work for free." : "§7Sandbox mode is off: §fcoins, parts and wages count again.");
  }
}

export async function gateMenu(player, block) {
  const park = getPark();
  if (!park) return message(player, "§eClaim a park with a Park Deed first.");
  if (!insidePark(block.dimension.id, block.location)) return message(player, "§eThe entrance gate must be inside your park boundary.");
  if (!can(player, "build")) return message(player, denyText("build"));
  const opening = !park.open;
  const price = `Each guest pays ${admission()} Zoo Coins${pairedBooth() ? "" : " (a Ticket Booth near this gate lets you set the price)"}.`;
  const r = await show(player, new MessageFormData().title("Park entrance").body(opening ? `Open the park to guests? ${price} More guests come when your animals are happy and easy to see.` : "Close the park? Guests stop arriving until you reopen.").button1(opening ? "Open" : "Close").button2("Cancel"));
  if (r?.selection !== 0) return;
  setEntrance(block.dimension.id, { x: block.x, y: block.y, z: block.z });
  setOpen(opening);
  message(player, opening ? "§aThe park is open!" : "§7The park is closed.");
}

// Snack Stand (spec section 12): stock from the inventory or the supply line, and set the price.
export async function standMenu(player, stand) {
  const s = BALANCE.snacks;
  const rec = db.get("equipment", stand.id) ?? stand;
  const status = serviceText(rec);
  const sold = rec.soldDay === getPark()?.today.day ? rec.soldToday ?? 0 : 0;
  const buyers = Math.round(snackShare(rec.price, BALANCE) * 100);
  const body = [
    status,
    "",
    `§fStock: §7${rec.stock} of ${s.capacity} snacks`,
    `§fPrice: §7${rec.price} coins §8(guests think ${s.fair} is fair; about ${buyers}% of guests buy one)`,
    `§fSold today: §7${sold}`,
    "",
    "§7Stock it with bread, cookies, apples, melon slices, baked potatoes, pumpkin pie, cake or sweet berries, or buy snacks in from the supply line.",
  ].join("\n");
  const form = new ActionFormData().title("Snack Stand").body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  if (can(player, "care")) add("Stock from my inventory", () => stockFromInventory(player, rec));
  if (can(player, "spend")) {
    add(`Buy ${s.wholesaleBundle} snacks\n§8${s.wholesaleBundle * s.wholesaleCost} coins`, () => buyStock(player, rec));
    add("Set the price", () => snackPrice(player, rec));
  }
  add("Close", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

async function snackPrice(player, rec) {
  const s = BALANCE.snacks;
  const res = await show(player, new ModalFormData().title("Snack price").slider("Price per snack (Zoo Coins)", s.min, s.max, { valueStep: 1, defaultValue: rec.price }).label(`Guests think §e${s.fair} coins§r is fair. Dearer snacks sell to fewer guests.`));
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const cur = db.get("equipment", rec.id);
  if (!cur) return message(player, "§cThat Snack Stand is gone.");
  setSnackPrice(cur, Math.round(value));
  message(player, `§aSnacks now cost ${cur.price} coins. §7About ${Math.round(snackShare(cur.price, BALANCE) * 100)}% of guests will buy one.`);
}

// Ticket Booth (spec section 13): sets the admission price while it stands near the entrance gate.
export async function boothMenu(player, booth) {
  const park = getPark();
  if (!park) return message(player, "§eClaim a park with a Park Deed first.");
  const range = BALANCE.ticketBooth.pairRange;
  if (!park.entrance && !adoptGateNear(booth.dimension, booth.pos, range)) return message(player, `§eTicket Booth: place a Park Entrance Gate within ${range} blocks. Then this booth sets the admission price.`);
  const paired = pairedBooth();
  if (!paired) return message(player, `§eTicket Booth: too far from the Park Entrance Gate. Put it within ${range} blocks of the gate.`);
  if (paired.id !== booth.id) return message(player, "§eAnother Ticket Booth already sets the price at this entrance.");
  const r = ratingNow();
  if (!can(player, "spend")) return message(player, `§6Ticket Booth: §fadmission is ${r.price} Zoo Coins.`);
  const a = BALANCE.admission;
  const res = await show(
    player,
    new ModalFormData()
      .title("Ticket Booth")
      .slider("Admission price (Zoo Coins)", a.min, a.max, { valueStep: 1, defaultValue: r.price })
      .label(`Guests think about §e${r.fair} coins§r is fair for a ${r.stars}-star park. Charge more and fewer come and they rate the park's value lower. Charge less and a few more come.`),
  );
  const value = res?.formValues?.find((v) => typeof v === "number");
  if (typeof value !== "number") return;
  const price = Math.round(value);
  if (price === r.price) return;
  setAdmission(price);
  const more = Math.round((priceDemand(price, r.fair, BALANCE) - 1) * 100);
  const effect = more > 0 ? `about ${more}% more guests` : more < 0 ? `about ${-more}% fewer guests` : "the usual number of guests";
  message(player, `§aAdmission is now ${price} coins. §7Expect ${effect}; value rating ${valueScore(price, r.fair, BALANCE)}/100.`);
}
