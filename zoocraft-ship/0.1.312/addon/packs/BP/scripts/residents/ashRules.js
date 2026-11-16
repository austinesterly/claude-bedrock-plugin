// Ash's shop and what his pieces do (0.1.304; Austin's NPC #25 spec, research/ZooCraft_Tycoon_NPCs_24-25_Don_L_and_Ash.md).
// Pure rules: the nine pieces with the friendship each needs (Austin's table, kept as he wrote it), where each is worn,
// the potion effects of the four that give one, the Shroomlight Necklace's light, and the Wither Star Necklace's stored
// damage. The game side is residents/ashShop.js and equipment/ashWear.js; the numbers Austin left open (prices, levels,
// the star's limits) are ours, in data/balance.js `ashShop`, listed for him in playtest/NPC_batch3_suggestions.md.
export const ASH_ID = "ash";
export const DON_ID = "don_l";
export const BASKETBALL = "zoocraft:basketball_prototype";

const Z = (k) => `zoocraft:${k}`;
// `slot`: where it counts as worn. The game has no necklace or glove slot: a necklace is worn in the chest slot (so the
// Crying Obsidian Necklace's 5 armor points are the game's own), gauntlets in the off hand as the Sticky Gauntlets are.
export const WARES = [
  { key: "warped_wood_sombrero", name: "Warped Wood Sombrero", at: 20, slot: "head", short: "A hat, for looks" },
  { key: "shroomlight_necklace", name: "Shroomlight Necklace", at: 30, slot: "chest", short: "A small glow around you", glow: true },
  { key: "ghast_js", name: "Ghast J's", at: 40, slot: "feet", short: "Slow Falling while worn", effect: "slow_falling" },
  { key: "blaze_gauntlets", name: "Blaze Gauntlets", at: 50, slot: "offhand", short: "Fire Resistance in the off hand", effect: "fire_resistance" },
  { key: "nether_wart_baseball_hat", name: "Nether Wart Woven Baseball Hat", at: 60, slot: "head", short: "A hat with a pufferfish logo" },
  { key: "crying_obsidian_necklace", name: "Crying Obsidian Necklace", at: 70, slot: "chest", short: "5 armor points", armor: 5 },
  { key: "soul_shoes", name: "Soul Shoes", at: 80, slot: "feet", short: "Swiftness while worn", effect: "speed" },
  { key: "warped_gauntlets", name: "Warped Gauntlets", at: 90, slot: "offhand", short: "Haste in the off hand", effect: "haste" },
  { key: "wither_star_necklace", name: "Wither Star Necklace", at: 100, slot: "chest", short: "Damage you take is added to your next hit", star: true },
].map((w) => ({ ...w, id: Z(w.key) }));
export const wareOf = (id) => WARES.find((w) => w.id === id);
export const GLOW_ITEM = Z("shroomlight_necklace");
export const STAR_ITEM = Z("wither_star_necklace");

/** The shop's rows for a player with `points` of friendship: every piece, open or not, with its price. */
export function shopRows(points, prices) {
  return WARES.map((w) => ({ ...w, price: prices[w.key], open: (points ?? 0) >= w.at }));
}

/** Whether a row can be bought: "ok", "locked" (friendship) or "poor" (the park's coins; never in sandbox). */
export function buyCheck(row, balance, free = false) {
  if (!row?.open) return "locked";
  if (!free && (balance ?? 0) < row.price) return "poor";
  return "ok";
}

/** The potion effects a player's worn things give: `worn` = { head, chest, feet, offhand } item ids. A piece in the wrong place gives nothing. */
export function wornEffects(worn) {
  return WARES.filter((w) => w.effect && worn?.[w.slot] === w.id).map((w) => w.effect);
}

/**
 * What to do with one effect: "give" (topped up), "take" (ours, once the piece is off) or "none". `left`: the effect the
 * player has now in ticks (0 none), `gave`: whether a piece gave it, `ticks`: how long we give it for. A longer one
 * from a potion or a beacon is left alone, and never taken.
 */
export function effectStep(want, left, gave, ticks) {
  if (want) return left > ticks ? "none" : "give";
  if (gave && left > 0 && left <= ticks) return "take";
  return "none";
}

/** The Wither Star Necklace: damage taken is kept, added up, to at most `cap`. */
export function starAdd(stored, damage, cap) {
  const d = Number.isFinite(damage) && damage > 0 ? damage : 0;
  return Math.min(cap, Math.max(0, stored ?? 0) + d);
}

/** ... and spent whole on the next hit that lands: { damage, stored: 0, bonus }. */
export function starHit(stored, damage) {
  const bonus = Math.max(0, stored ?? 0);
  return { damage: damage + bonus, stored: 0, bonus };
}

/**
 * 0.1.312: how the kept damage shows and sounds. `frac` 0..1 of the cap: the charge note climbs with it, the glow gets
 * more glints, and a let-go of half the cap or more is the big one.
 */
export function starFx(stored, cap) {
  const frac = Math.min(1, Math.max(0, (stored ?? 0) / cap));
  return { frac, pitch: Math.round((0.7 + 0.9 * frac) * 100) / 100, glints: frac >= 0.5 ? 2 : 1, big: frac >= 0.5 };
}

/** Where the weapon hand is, near enough: in front of the eyes, to the right, a little down. */
export function starHand(head, view) {
  const len = Math.hypot(view.x, view.z) || 1;
  const right = { x: -view.z / len, z: view.x / len };
  return { x: head.x + view.x * 0.55 + right.x * 0.4, y: head.y - 0.45 + view.y * 0.3, z: head.z + view.z * 0.55 + right.z * 0.4 };
}

/** Only a hit by hand or with a weapon in the hand spends it (no arrows, no thorns, never oneself). */
export function starCounts(cause, attackerId, hurtId, projectile) {
  return cause === "entityAttack" && !projectile && Boolean(attackerId) && attackerId !== hurtId;
}

const cell = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z), dim: p.dim });
const same = (a, b) => Boolean(a && b && a.x === b.x && a.y === b.y && a.z === b.z && a.dim === b.dim);
/**
 * The Shroomlight Necklace's light, one unseen light block at the wearer's head that moves with them:
 * { clear: cell to put back to air | undefined, set: cell to light | undefined }. `prev`: the cell lit now.
 */
export function glowPlan(prev, head, wearing) {
  if (!wearing || !head) return { clear: prev, set: undefined };
  const at = cell(head);
  if (same(prev, at)) return { clear: undefined, set: undefined };
  return { clear: prev, set: at };
}
export const lightBlock = (level) => `minecraft:light_block_${Math.max(1, Math.min(15, Math.round(level)))}`;
