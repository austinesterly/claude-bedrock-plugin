// Mirium the banker's pages (0.1.357; Austin's NPC #30 spec; the rules: residents/miriumRules.js), on her menu while
// she is awake: Banking, Currency Exchange and the Daily Shop.
// - Zoo Coins are the park's own (economy/economy.js): she uses that one account and its ledger, nothing of her own.
// - Banking shows what the game already has: the park's coins and its latest ledger lines. No deposits, no loans.
// - Currency Exchange trades nothing yet: Zoo Coins are the only currency (Austin decides what it exchanges).
// - She sells every item in the game a player comes by in the ordinary way (data/miriumPool.js), for Zoo Coins only.
// - The Daily Shop is rolled once a Minecraft day, kept in the "miriumShop" collection with its day, and is the same
//   for everyone; what each player bought today is kept with it. Buying: checked again here, the coins leave first
//   under an operation id (so nothing runs twice), then the count is saved, then the thing is handed over; if the
//   handing over fails the coins come back.
import { world, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message, giveItem } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "./bondRules.js";
import { bondOf } from "./bonds.js";
import { spend, earn, recent } from "../economy/economy.js";
import { coinsText } from "../economy/bankRules.js";
import { newId } from "../core/ids.js";
import { getPark, parkAt, withPark, can, denyText } from "../park/park.js";
import { sandboxOn, balanceText } from "../park/rules.js";
import { MIRIUM_ID, RARITY_NAMES, rollDay, validDay, lineup, buyCheck, boughtMore, listingButton, oddsText, discountFor } from "./miriumRules.js";

/** Whether this game has an item (the pool lists the newest game's; an older one lacks a few). */
function hasItem(id) {
  try {
    return Boolean(new ItemStack(id, 1));
  } catch {
    return false;
  }
}

const COL = "miriumShop";
const KEY = "today";

function parkHere(player) {
  try {
    return parkAt(player.dimension.id, player.location) ?? getPark();
  } catch {
    return getPark();
  }
}

const pointsOf = (player) => bondOf(MIRIUM_ID, player.id).points ?? 0;
const say = (key) => {
  const res = residentById(MIRIUM_ID);
  return `§f${res.name}: §7"${bondLine(res, key)}"`;
};

/** Today's shop: the stored one while it is today's, else a new one, stored at once (undefined if the pool has a gap). */
export function shopToday(day = world.getDay()) {
  const had = db.get(COL, KEY);
  if (validDay(had, day)) return had;
  const fresh = rollDay(day, undefined, Math.random, hasItem);
  if (!fresh) return undefined;
  const rec = db.put(COL, { id: KEY, ...fresh, bought: {} });
  db.flush();
  return rec;
}

const rowsFor = (player, rec) => lineup(rec, pointsOf(player), BALANCE.mirium, rec.bought?.[player.id] ?? {});

/** Buys one listing for the player. Returns the line to tell them, and whether it was bought. */
export function buyListing(player, id, park = parkHere(player)) {
  const rec = shopToday();
  if (!rec) return { ok: false, text: "§7The shop is closed today." };
  const row = rowsFor(player, rec).find((r) => r.id === id);
  if (!row) return { ok: false, text: "§7That isn't in the shop today." };
  if (!park) return { ok: false, text: "§7There's no park here to pay from." };
  if (!can(player, "spend", park)) return { ok: false, text: denyText("spend", park) };
  const free = sandboxOn(park);
  const what = row.count > 1 ? `${row.count} ${row.name}` : row.name;
  const why = buyCheck(row, park.balance, free);
  if (why === "sold") return { ok: false, text: say("shopSold") };
  const poor = { ok: false, text: `${say("shopPoor")} §c${what} costs ${coinsText(row.price)} and the park has ${coinsText(park.balance ?? 0)}.` };
  if (why === "poor") return poor;
  const paid = withPark(park, () => spend(player, row.price, `Mirium: ${what}`, newId("mirium")));
  if (!paid?.ok) return poor;
  db.put(COL, { ...rec, bought: { ...rec.bought, [player.id]: boughtMore(rec.bought?.[player.id], id) } });
  db.flush();
  try {
    giveItem(player, row.id, row.count);
  } catch {
    // never coins gone and nothing handed over: the coins come back, and so does the stock
    if (!free) withPark(park, () => earn(row.price, `Mirium: ${what} returned`, newId("mirium")));
    db.put(COL, { ...db.get(COL, KEY), bought: rec.bought ?? {} });
    db.flush();
    return { ok: false, text: "§cThat couldn't be handed over, so nothing was charged." };
  }
  return { ok: true, text: `${say("shopDone")} §aYou buy ${what}${free ? "" : ` for ${coinsText(row.price)}`}.` };
}

/** Her Daily Shop page. */
export async function miriumShop(player) {
  for (;;) {
    const rec = shopToday();
    if (!rec) return message(player, "§7The shop is closed today.");
    const park = parkHere(player);
    const free = Boolean(park && sandboxOn(park));
    const g = BALANCE.mirium;
    const points = pointsOf(player);
    const rows = rowsFor(player, rec);
    const body = [say("shopLook"), "", `§7Ten listings for day ${rec.day}, new ones tomorrow. §7${oddsText(points, g)}`];
    if (discountFor(points, g)) body.push(`§a${Math.round(g.discount * 100)}% off everything for a best friend.`);
    body.push(!park ? "§7There's no park here to pay from." : free ? "§7Free in sandbox." : `§7Paid from the park's Zoo Coins: ${balanceText(park)}§7.`);
    const form = new ActionFormData().title("Mirium's Daily Shop").body(body.join("\n"));
    for (const r of rows) form.button(listingButton(r, free));
    form.button("Back");
    const got = await show(player, form);
    if (got?.selection === undefined || got.selection >= rows.length) return;
    message(player, buyListing(player, rows[got.selection].id, park).text);
  }
}

/** Her Banking page: the park's Zoo Coins and its latest ledger lines (what the game already keeps). */
export async function miriumBank(player) {
  const park = parkHere(player);
  if (!park) return message(player, "§7There's no park here to look up.");
  const g = BALANCE.mirium;
  const low = !sandboxOn(park) && (park.balance ?? 0) < g.lowBalance;
  const lines = withPark(park, () => recent(g.ledgerLines)).map((e) => `${e.amount >= 0 ? "§a+" : "§c"}${e.amount} §7${e.reason}`);
  const body = [say(low ? "bankLow" : "bankLook"), "", `§fZoo Coins: ${balanceText(park)}`, "§7The park's coins are one account, shared by everyone who runs the park.", "", "§fLatest transactions:", ...(lines.length ? lines : ["§8None yet."])];
  await show(player, new ActionFormData().title("Banking").body(body.join("\n")).button("Close"));
}

/** Her Currency Exchange page: nothing to exchange yet. */
export async function miriumExchange(player) {
  const body = [say("exchange"), "", "§7Currencies: §fZoo Coins §7only. No exchange rates are set."];
  await show(player, new ActionFormData().title("Currency Exchange").body(body.join("\n")).button("Close"));
}

/** For the test server. */
export function miriumDebug(player, day = world.getDay()) {
  const rec = shopToday(day);
  const park = parkHere(player);
  return {
    day: rec?.day,
    points: pointsOf(player),
    balance: park?.balance,
    rolls: [rec?.uRare, rec?.uLegendary],
    rows: rec ? rowsFor(player, rec).map((r) => `${RARITY_NAMES[r.rarity][0]}:${r.id.replace("zoocraft:", "")}:${r.price}:${r.left}`) : [],
  };
}
