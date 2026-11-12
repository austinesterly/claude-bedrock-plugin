// Guido's bows and his Bow Case (0.1.261), the parts with no game in them: which items are bows, each bow's numbers, who
// may look and trade, and the checks that keep a trade from ever doubling a bow. Runtime: guido/bowCase.js, bowShots.js.
import { BOWS, GAME_BOWS } from "../data/bows.js";

export const GUIDO_ID = "guido";
export const BOW_IDS = new Set(BOWS.map((b) => b.id));
const BY_ID = new Map(BOWS.map((b) => [b.id, b]));

/** A bow Guido keeps: one of ZooCraft's fifteen or the game's bow and crossbow. */
export function isCaseBow(typeId) {
  return BOW_IDS.has(typeId) || GAME_BOWS.includes(typeId);
}

/** One of ZooCraft's fifteen. */
export function bowOf(typeId) {
  return BY_ID.get(typeId);
}

/** A bow's power: how much faster (and harder, and farther) its arrows fly than the game's bow's. */
export function powerOf(damage, g) {
  const p = Math.sqrt(Math.max(0, damage) / g.baseDamage);
  return Math.round(Math.min(g.maxPower, Math.max(g.minPower, p)) * 100) / 100;
}

/** What a player may do at the case by friendship tier (0 Stranger .. 4 Best Friend). */
export function caseAccess(tier, g) {
  return { look: tier >= g.lookTier, trade: tier >= g.tradeTier };
}

/** A trade is open once a day per player. */
export function tradeOpen(lastDay, today) {
  return lastDay !== today;
}

/**
 * What identifies one bow in a slot, so a trade can check that nothing moved between the page and the swap: its kind,
 * its name, its wear and its enchantments (`it` is a plain record: typeId, nameTag, damage, enchants [[id, level]]).
 */
export function fingerprint(it) {
  if (!it?.typeId) return "";
  const ench = [...(it.enchants ?? [])].map(([id, lvl]) => `${id}:${lvl}`).sort().join(",");
  return `${it.typeId}|${it.nameTag ?? ""}|${it.damage ?? 0}|${ench}`;
}

/** Whether both sides of a trade still hold what the pages showed. */
export function tradeStillGood(offer, now) {
  return Boolean(offer.mine && offer.his && now.mine && now.his) && fingerprint(offer.mine) === fingerprint(now.mine) && fingerprint(offer.his) === fingerprint(now.his);
}

/** The bows to stock a new collection with: one of each of ZooCraft's fifteen, in the table's order. */
export function stockList() {
  return BOWS.map((b) => b.id);
}

/** How worn a bow is, in words. */
export function wearText(damage, max) {
  if (!max) return "never wears";
  const left = Math.max(0, Math.round(((max - (damage ?? 0)) / max) * 100));
  return left >= 100 ? "like new" : `${left}% left`;
}

/** An enchantment id in words ("minecraft:power" 5 -> "Power V"). */
export function enchantText(id, level) {
  const name = String(id).replace(/^minecraft:/, "").split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][level] ?? String(level);
  return `${name} ${roman}`;
}

/** The case's count line for Guido's page. */
export function caseText(n, size) {
  return `${n} bow${n === 1 ? "" : "s"} in his Bow Case (room for ${size})`;
}
