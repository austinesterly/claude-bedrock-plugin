// Mirium's Daily Shop, the rules (0.1.357; Austin's NPC #30 spec, research/ZooCraft_Tycoon_NPC_30_Mirium.md, sections
// 4 to 8, and his own line: "friendship level 40 60 80 100 all increse odds of rare or better items for sale, level
// 100 gives you a 20% discount on everything"). Pure: no game calls, so the tests run it as it is.
//
// A day's shop is rolled once and kept: ten Common picks in order, two Rare, two Legendary, and the two rolls
// themselves (numbers from 0 to 1). Everyone gets the first six Commons. The Rare pair shows when the day's Rare roll
// is under the chance (50% by his spec), else Commons seven and eight; the Legendary pair when the Legendary roll is
// under its chance (10%), else Commons nine and ten. So it is always ten listings, at least six Common, and the same
// lineup for everyone at the same friendship. A closer friend's chances are higher against the same two rolls: whatever
// a stranger sees as Rare or Legendary today, a friend sees too, and now and then a friend sees a pair a stranger doesn't.

export const MIRIUM_ID = "mirium";
export const RARITIES = ["common", "rare", "legendary"];
export const RARITY_NAMES = { common: "Common", rare: "Rare", legendary: "Legendary" };
// the colours of the three: plain, aqua, gold
export const RARITY_INK = { common: "§f", rare: "§b", legendary: "§6" };

// The pool: every listing she can pick, by rarity: [id, coins, how many, English name] (data/miriumPool.js: every item
// in the game a player comes by in the ordinary way, Austin 2026-11-22; what is never for sale is listed there too).
import { SHOP_POOL } from "../data/miriumPool.js";
export { SHOP_POOL };

/** The step of friendship a player is on in `g.at` (0 for under the first step). */
export function oddsStep(points, g) {
  let s = 0;
  for (let i = 0; i < g.at.length; i++) if ((points ?? 0) >= g.at[i]) s = i;
  return s;
}

/** The chances of the Rare pair and of the Legendary pair for a friendship. */
export function oddsFor(points, g) {
  const s = oddsStep(points, g);
  return { rare: g.rare[s], legendary: g.legendary[s] };
}

/** What a friendship takes off every price (0.2 at 100). */
export const discountFor = (points, g) => ((points ?? 0) >= g.discountAt ? g.discount : 0);

/** A price after the discount: whole coins, never under 1, never more than the full price. */
export function priceFor(price, points, g) {
  const d = discountFor(points, g);
  return d ? Math.max(1, Math.floor(price * (1 - d))) : price;
}

/** `n` different picks from a list by `random`, only ones `ok` passes (fewer only when the list runs out). */
export function pickDistinct(list, n, random = Math.random, ok = (/** @type {any} */ _row) => true) {
  const left = [...list];
  const out = [];
  while (out.length < n && left.length) {
    const pick = left.splice(Math.floor(random() * left.length), 1)[0];
    if (ok(pick)) out.push(pick);
  }
  return out;
}

/**
 * A new day's shop: { day, uRare, uLegendary, common: 10 ids, rare: 2 ids, legendary: 2 ids }. Undefined when the
 * pool can't fill it with different things (the spec: report the gap, don't fill with something else). `has(id)`:
 * whether this game has the item (an older game lacks the newest ones; those are passed over).
 */
export function rollDay(day, pool = SHOP_POOL, random = Math.random, has = (/** @type {string} */ _id) => true) {
  const ids = (list, n) => pickDistinct(list, n, random, (r) => has(r[0])).map((r) => r[0]);
  const uRare = random(), uLegendary = random();
  const rec = { day, uRare, uLegendary, common: ids(pool.common, 10), rare: ids(pool.rare, 2), legendary: ids(pool.legendary, 2) };
  return rec.common.length === 10 && rec.rare.length === 2 && rec.legendary.length === 2 ? rec : undefined;
}

/** Whether a stored shop is a whole one for this pool (a pool that changed with an update rolls the day again). */
export function validDay(rec, day, pool = SHOP_POOL) {
  if (!rec || rec.day !== day || !(rec.uRare >= 0 && rec.uRare < 1) || !(rec.uLegendary >= 0 && rec.uLegendary < 1)) return false;
  const ok = (list, n, rows) => Array.isArray(list) && list.length === n && new Set(list).size === n && list.every((id) => rows.some((r) => r[0] === id));
  return ok(rec.common, 10, pool.common) && ok(rec.rare, 2, pool.rare) && ok(rec.legendary, 2, pool.legendary);
}

/**
 * The ten listings a player sees: { id, name, count, rarity, full (the price), price (theirs), stock (they may buy
 * today), left }. `bought`: what this player bought today, by id.
 */
export function lineup(rec, points, g, bought = {}, pool = SHOP_POOL) {
  const odds = oddsFor(points, g);
  const row = (rarity) => (id) => {
    const [, full, count, name] = pool[rarity].find((r) => r[0] === id);
    const stock = g.stock[rarity];
    return { id, name, count, rarity, full, price: priceFor(full, points, g), stock, left: Math.max(0, stock - (bought[id] ?? 0)) };
  };
  const rare = rec.uRare < odds.rare;
  const legendary = rec.uLegendary < odds.legendary;
  return [
    ...rec.common.slice(0, 6).map(row("common")),
    ...(rare ? rec.rare.map(row("rare")) : rec.common.slice(6, 8).map(row("common"))),
    ...(legendary ? rec.legendary.map(row("legendary")) : rec.common.slice(8, 10).map(row("common"))),
  ];
}

/** Whether a listing can be bought: "ok", "sold" (none left for this player today) or "poor" (the park can't pay). */
export function buyCheck(row, balance, free) {
  if (!row || row.left <= 0) return "sold";
  if (!free && (balance ?? 0) < row.price) return "poor";
  return "ok";
}

/** What a player bought today, with one more of `id`. */
export const boughtMore = (bought, id) => ({ ...bought, [id]: (bought?.[id] ?? 0) + 1 });

/** A listing's button: its rarity in its colour, what it is, the price and how many are left. */
export function listingButton(row, free) {
  const what = row.count > 1 ? `${row.count} ${row.name}` : row.name;
  const price = free ? "free" : row.price < row.full ? `${row.price} coins §8(was ${row.full})` : `${row.price} coins`;
  if (row.left <= 0) return `§8${RARITY_NAMES[row.rarity]}: ${what}\n§8Sold out today`;
  return `${RARITY_INK[row.rarity]}${RARITY_NAMES[row.rarity]}: ${what}\n§8${price} · ${row.left} left`;
}

/** The shop page's lines about the day's odds for this player. */
export function oddsText(points, g) {
  const o = oddsFor(points, g);
  const next = g.at.find((a) => a > (points ?? 0));
  const pct = (v) => `${Math.round(v * 100)}%`;
  return `Each day: Rare ${pct(o.rare)}, Legendary ${pct(o.legendary)} at your friendship${next ? ` (better at ${next})` : ""}.`;
}
