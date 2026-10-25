// The Zoo Bank's rules (0.1.102, research/bank_plan.md): finding a block by name, the amounts to offer, the room in
// an inventory and the texts. Pure: nothing from Minecraft, so the tests run them in plain Node.

const ALIAS = { grey: "gray", colour: "color", colours: "colors" };

// Lower case, apostrophes dropped ("Jack o'Lantern" is "jack olantern"), anything else not a letter or digit a space.
export function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((w) => ALIAS[w] ?? w)
    .join(" ");
}

// What a search looks through for a row ({ key, name }): its English name and the words of its id.
export function haystack(row) {
  return ` ${normalize(row.name)} ${normalize(row.key)} `;
}

// A query word is found as it is, or without a plural's "s" or "es" ("logs", "torches").
function found(hay, w) {
  if (hay.includes(w)) return true;
  if (w.length > 3 && w.endsWith("es") && hay.includes(w.slice(0, -2))) return true;
  return w.length > 2 && w.endsWith("s") && hay.includes(w.slice(0, -1));
}

/**
 * The rows whose name or id holds every word of the query, best first: the name itself, then names that start with
 * the query, then names with a word that starts with its first word, then the rest; shorter names first within each.
 */
export function searchBlocks(rows, query) {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(" ");
  const hits = [];
  for (const r of rows) {
    const hay = r.hay ?? haystack(r);
    if (!words.every((w) => found(hay, w))) continue;
    const name = normalize(r.name);
    const rank = name === q ? 0 : name.startsWith(q) ? 1 : ` ${name}`.includes(` ${words[0]}`) ? 2 : 3;
    hits.push({ r, rank, name });
  }
  hits.sort((a, b) => a.rank - b.rank || a.name.length - b.name.length || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return hits.map((h) => h.r);
}

/** How many free spaces an inventory has for one item: empty slots hold a stack, a slot of the same item the rest. */
export function roomFor(slots, stack) {
  let room = 0;
  for (const s of slots) room += !s ? stack : s.same ? Math.max(0, stack - s.amount) : 0;
  return room;
}

/** The amounts to offer: 1, 2, 4 ... under a stack, then 1, 2, 3, 4, 6, 9, 18, 27 and 36 stacks, up to the limit, and the limit itself last. */
export function buyAmounts(stack, limit) {
  const top = Math.floor(limit);
  if (!(top >= 1)) return [];
  const out = new Set();
  for (const n of [1, 2, 4, 8, 16, 32]) if (n < stack) out.add(n);
  for (const k of [1, 2, 3, 4, 6, 9, 18, 27, 36]) out.add(k * stack);
  const list = [...out].filter((n) => n <= top).sort((a, b) => a - b);
  if (list[list.length - 1] !== top) list.push(top);
  return list;
}

const thousands = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export function coinsText(n) {
  return `${thousands(n)} coin${n === 1 ? "" : "s"}`;
}

/**
 * One line of the amount list: "16 for 16 coins", "1 stack (64) for 64 coins", "3 stacks (192) ...", "..., free" at a
 * price of 0 (sandbox mode), and why the last one stops there.
 */
export function amountLabel(n, stack, price, last = undefined) {
  const k = n / stack;
  const what = stack > 1 && Number.isInteger(k) ? `${k} stack${k === 1 ? "" : "s"} (${thousands(n)})` : thousands(n);
  const why = last === "room" ? ", all that fits" : last === "coins" ? ", all the park can afford" : "";
  return `${what}${price > 0 ? ` for ${coinsText(n * price)}` : ", free"}${why}`;
}

/** The most a player can buy: what fits in the inventory, and what the park can pay (no limit in sandbox mode). */
export function buyLimit(room, balance, price, sandbox) {
  const afford = sandbox ? Infinity : Math.floor(balance / price);
  return { limit: Math.min(room, afford), by: afford < room ? "coins" : "room" };
}

/** A player's "bought lately" list: this block first, no repeats, `keep` at most. */
export function pushRecent(list, key, keep) {
  return [key, ...(list ?? []).filter((k) => k !== key)].slice(0, keep);
}

/** How many blocks each group holds and their price range: [{ group, count, min, max }] in group order. */
export function groupSummary(rows, groups) {
  const out = groups.map((name, i) => ({ group: i, name, count: 0, min: Infinity, max: 0 }));
  for (const r of rows) {
    const g = out[r.group];
    if (!g) continue;
    g.count++;
    g.min = Math.min(g.min, r.price);
    g.max = Math.max(g.max, r.price);
  }
  return out.filter((g) => g.count > 0);
}

/** One block's button: its name, then its price each. */
export function blockButton(row) {
  return `${row.name}\n§8${coinsText(row.price)} each`;
}

export const BANK_TEXT = {
  noPark: "§eThere's no park yet. Claim one with the Park Deed, then use the Zoo Bank inside it.",
  outside: "§eThis Zoo Bank is outside the park. It only works inside the park (the Park Ledger's Park edge line says where that is).",
  noRoom: (name) => `§eYour inventory has no room for ${name}. Make some space and try again.`,
  noCoins: (name, price, balance) => `§eThe park has ${coinsText(balance)}; one ${name} costs ${coinsText(price)}.`,
  noMatch: (query) => `§eNo block in the Bank is called "${query}". Try part of the name, like "oak" or "brick".`,
  short: "§eType part of a block's name.",
  gone: (name) => `§eThe Bank can't sell ${name} in this game.`,
};
