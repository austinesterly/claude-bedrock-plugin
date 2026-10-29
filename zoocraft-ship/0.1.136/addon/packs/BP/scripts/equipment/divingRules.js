// The Diving Helmet (0.1.136; Austin: "We need to create a helmet that let's you see in water easily"), pure. Under the
// water the game draws the biome's water fog (Mojang's: it ends 60 blocks out, and each time the head goes under it
// starts at 0.01 blocks and clears over 30 seconds), and deep water and night are dark. Worn, the helmet puts its own
// water fog on the wearer's fog stack (RP fogs/diving_helmet*_fog_setting.json: clear to 16 blocks, gone at 128, at
// once), the Deep Trench's in its own teal, and gives night vision while the head is under the water.

export const HELMET = "zoocraft:diving_helmet";
export const FOG_TAG = "zoocraft_diving"; // the fog stack entry's own id: /fog push and remove use it
export const FOGS = { water: "zoocraft:fog_diving_helmet", trench: "zoocraft:fog_diving_helmet_trench" };
export const TRENCH = "zoocraft:deep_trench";
export const NIGHT_VISION = "night_vision";
// Night vision blinks in its last 10 seconds (200 ticks); topped up to 15 seconds every half second it never gets there.
// On coming up it is taken off again, unless it has more left than the helmet gives (a potion's).
export const NV_TICKS = 300;

// The fog the wearer should have on: none without the helmet, the trench's in the Deep Trench, else the clear one.
/** @param {boolean} wearing @param {string | undefined} biome */
export function fogFor(wearing, biome) {
  if (!wearing) return undefined;
  return biome === TRENCH ? FOGS.trench : FOGS.water;
}

// The commands that take the wearer's stack from `had` to `want` (fog ids, or undefined for none). Every push is
// preceded by a remove, so the stack never holds more than one helmet entry. `had` null: not known (the first look
// at this player since the scripts loaded, when an entry may be left from before), so it is removed.
/** @param {string | undefined | null} had @param {string | undefined} want */
export function fogCommands(had, want) {
  if (had === want) return [];
  const out = [`fog @s remove ${FOG_TAG}`];
  if (want) out.push(`fog @s push ${want} ${FOG_TAG}`);
  return out;
}

// Blocks the head is under the water in: water itself, a bubble column, and the plants that only grow in it.
const UNDERWATER = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:bubble_column", "minecraft:seagrass", "minecraft:kelp", "minecraft:tall_seagrass"]);
/** @param {string | undefined} typeId @param {boolean} [waterlogged] */
export function headUnderwater(typeId, waterlogged = false) {
  return Boolean(waterlogged || (typeId && UNDERWATER.has(typeId)));
}

// What to do with night vision: "give" (topped up), "take" (the helmet's, on coming up or taking it off) or nothing.
// `left`: the night vision the player has now, in ticks (0 none); `gave`: whether the helmet gave it.
/** @param {boolean} wearing @param {boolean} under @param {number} left @param {boolean} gave */
export function nightVision(wearing, under, left, gave) {
  if (wearing && under) return left > NV_TICKS ? "none" : "give";
  if (gave && left > 0 && left <= NV_TICKS) return "take";
  return "none";
}
