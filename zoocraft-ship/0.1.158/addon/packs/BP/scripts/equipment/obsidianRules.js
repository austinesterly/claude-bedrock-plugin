// Obsidian Armor (0.1.158; Austin: "Let's add some lava resistance armor that also lets you see in lava like our water
// one", a full suit, "crafted from obsidian"), pure. Wear all four pieces and lava, fire and magma can't hurt you: the
// suit keeps fire resistance topped up while it is all on, and puts the flames out once you are out of the lava. The
// helmet's tinted-glass visor clears the view in lava: like the Diving Helmet in water, it puts its own lava fog on the
// wearer's fog stack (RP fogs/obsidian_helmet_fog_setting.json: Mojang's ends 0.64 blocks out, 4 with fire resistance;
// this one is clear to 8 and gone at 48).

export const PIECES = { head: "zoocraft:obsidian_helmet", chest: "zoocraft:obsidian_chestplate", legs: "zoocraft:obsidian_leggings", feet: "zoocraft:obsidian_boots" };
export const FOG = "zoocraft:fog_obsidian_helmet";
export const FOG_TAG = "zoocraft_obsidian"; // the fog stack entry's own id (the Diving Helmet's is zoocraft_diving)
export const FIRE_RESISTANCE = "fire_resistance";
// Fire resistance topped up to 10 seconds every half second while the suit is all on, so it never runs out; taken off
// with the suit, unless there is more left than the suit gives (a potion's).
export const FR_TICKS = 200;
// A hint on the action bar at most this often (ticks).
export const HINT_TICKS = 60;

// How many of the four pieces are on: `worn` maps head, chest, legs and feet to the item ids in those slots.
/** @param {{ head?: string, chest?: string, legs?: string, feet?: string }} worn */
export function piecesOn(worn) {
  return Object.entries(PIECES).filter(([slot, id]) => worn[slot] === id).length;
}

/** @param {{ head?: string, chest?: string, legs?: string, feet?: string }} worn */
export const fullSuit = (worn) => piecesOn(worn) === 4;

// The fog the wearer should have on: the lava one with the helmet on, else none.
/** @param {boolean} helmet */
export const fogFor = (helmet) => (helmet ? FOG : undefined);

// The commands that take the wearer's stack from `had` to `want`: every push after a remove, so the stack never holds
// more than one entry of ours. `had` null: not known yet (the first look at this player since the scripts loaded,
// when one may be left from before), so it is removed.
/** @param {string | undefined | null} had @param {string | undefined} want */
export function fogCommands(had, want) {
  if (had === want) return [];
  const out = [`fog @s remove ${FOG_TAG}`];
  if (want) out.push(`fog @s push ${want} ${FOG_TAG}`);
  return out;
}

// What to do with fire resistance: "give" (topped up), "take" (the suit's, once it is not all on) or "none". `left`:
// the fire resistance the player has now, in ticks (0 none); `gave`: whether the suit gave it.
/** @param {boolean} full @param {number} left @param {boolean} gave */
export function fireResistance(full, left, gave) {
  if (full) return left > FR_TICKS ? "none" : "give";
  if (gave && left > 0 && left <= FR_TICKS) return "take";
  return "none";
}

// Blocks that burn: standing in one (or with the head in one) keeps a player alight.
const HOT = new Set(["minecraft:lava", "minecraft:flowing_lava", "minecraft:fire", "minecraft:soul_fire"]);
/** @param {string | undefined} typeId */
export const burning = (typeId) => Boolean(typeId && HOT.has(typeId));

// Put the flames out: the whole suit on, alight, and out of the lava and the fire (feet and head).
/** @param {boolean} full @param {boolean} onFire @param {string | undefined} feetBlock @param {string | undefined} headBlock */
export const putOut = (full, onFire, feetBlock, headBlock) => full && onFire && !burning(feetBlock) && !burning(headBlock);

// The action-bar hint, or undefined: when the whole suit has just gone on, and while only some of it is on in lava
// or alight (the suit keeps the lava off only as a set). `wasFull`: whether it was all on last time.
/** @param {number} on @param {boolean} wasFull @param {boolean} hot */
export function hint(on, wasFull, hot) {
  if (on === 4) return wasFull ? undefined : "§6Obsidian Armor: lava and fire can't hurt you, and the helmet clears your view in lava.";
  if (on > 0 && hot) return `§eObsidian Armor keeps the lava off only as a full set: ${on} of 4 on.`;
  return undefined;
}
