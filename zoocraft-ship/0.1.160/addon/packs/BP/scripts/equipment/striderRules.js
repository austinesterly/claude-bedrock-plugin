// Lava Strider (0.1.160, Austin: "lets also add a lava strider enchantment for boots that allows for normal speed
// travel in lava"), pure. Bedrock add-ons can't add enchantments of their own (the enchanting table and the anvil only
// know the game's), so it comes as a Lava Strider Book: wear the boots, use the book, and they carry "Lava Strider" in
// their tooltip from then on (any boots, their own enchantments kept). Worn, they set the wearer's lava speed: the
// game's own lava_movement attribute every player has (0.02, the same as under water). The bench (BDS 1.26.60, a
// simulated player in a lane of lava 2 deep): walking on the ground 4.27 blocks a second; in lava 0.78; with Speed III
// 0.78 (Speed doesn't touch lava); lava_movement 0.1 -> 3.90, 0.3 -> 11.64. So 0.11 is walking pace (about 4.3).
// The lava still burns: the boots are for getting about, Obsidian Armor or Fire Resistance for staying alive.

export const BOOK = "zoocraft:lava_strider_book";
// The tooltip line, grey like the game's enchantments: it is what carries Lava Strider (the bench: an item property the
// book's use set on the boots read back unset on the worn boots; the line stayed, through taking them off and on again).
export const LORE = "§r§7Lava Strider";
export const LAVA_SPEED = 0.11; // lava_movement with the boots on: walking pace in lava
export const ATTRIBUTE = "minecraft:lava_movement";

// Whether boots carry Lava Strider: the tooltip line.
/** @param {string[] | undefined} lore */
export function hasStrider(lore) {
  return Boolean(lore && lore.includes(LORE));
}

// The boots' tooltip lines with Lava Strider added (their own lines kept, Lava Strider once).
/** @param {string[] | undefined} lore */
export function loreWith(lore) {
  const out = [...(lore ?? [])];
  if (!out.includes(LORE)) out.push(LORE);
  return out;
}

// What the wearer's lava speed needs: "set" (the boots on, not at their speed yet), "reset" (back to the game's own,
// with them off) or "none". `cur` and `def`: the attribute's value now and its default.
/** @param {boolean} worn @param {number} cur @param {number} def */
export function speedAction(worn, cur, def) {
  const want = worn ? LAVA_SPEED : def;
  if (Math.abs(cur - want) <= 1e-4) return "none";
  return worn ? "set" : "reset";
}

// Using the book: what happens, from what is on the feet. "none" (no boots on), "has" (they carry it already) or
// "add".
/** @param {string | undefined} feet @param {boolean} has */
export function bookOutcome(feet, has) {
  if (!feet) return "none";
  return has ? "has" : "add";
}

export const TEXT = {
  none: "§ePut on the boots you want to give Lava Strider to, then use the book.",
  has: "§eThese boots already have Lava Strider.",
  add: (name) => `§6Lava Strider added to your ${name}: §fyou walk through lava at your normal pace with them on. Lava still burns: wear Obsidian Armor or drink Fire Resistance.`,
  on: "§6Lava Strider: §fyou walk through lava at your normal pace.",
};

// The boots' name for the message, from their item id ("minecraft:diamond_boots" -> "Diamond Boots").
/** @param {string} typeId */
export function bootsName(typeId) {
  const id = typeId.split(":")[1] ?? typeId;
  const words = id.split("_").map((w) => (w === "golden" ? "Gold" : w[0].toUpperCase() + w.slice(1)));
  return words.join(" ");
}
