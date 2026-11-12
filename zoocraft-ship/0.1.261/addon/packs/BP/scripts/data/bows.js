// 0.1.261: Guido's bows (Austin's "All 15", 2026-11-12). ZooCraft's own version of each of the 15 TwoDogs Zombies bows:
// each fires the game's own arrows (minecraft:shooter with minecraft:arrow, BP items/), looks like its TwoDogs
// original, and keeps one simple difference from it. Draw time is TwoDogs' own (the Ballista loads like a crossbow).
// Power scales the arrow's speed, and with it the arrow's damage and reach: sqrt(TwoDogs damage per arrow / 14), held to
// 0.7 to 1.5, so the TwoDogs Bow (14) matches the game's bow. Three keep a small touch: Blaze arrows burn, Blightbloom
// arrows poison, Panda arrows leave hearts. Their other TwoDogs powers (cones, homing, piercing, vexes, rings) come
// from TwoDogs' own scripts and don't come along. Durability is the game's bow's for all (TwoDogs bows have none).
// `from` is the TwoDogs item each one copies, for the record; nothing in ZooCraft uses a TwoDogs id.
export const BOWS = [
  { id: "zoocraft:short_bow", from: "short_bow", name: "Short Bow", draw: 0.35, damage: 6 },
  { id: "zoocraft:scrap_bow", from: "scrap_bow", name: "Scrap Bow", draw: 0.55, damage: 5 },
  { id: "zoocraft:needle_bow", from: "needle_bow", name: "Needle Bow", draw: 1.8, damage: 18 },
  { id: "zoocraft:classic_bow", from: "bow", name: "Classic Bow", draw: 0.7, damage: 14 },
  { id: "zoocraft:flurry_bow", from: "flurry_bow", name: "Flurry Bow", draw: 0.3, damage: 8 },
  { id: "zoocraft:longbow", from: "longbow", name: "Longbow", draw: 1.15, damage: 32 },
  { id: "zoocraft:proximity_bow", from: "proximity_bow", name: "Proximity Bow", draw: 0.85, damage: 24 },
  { id: "zoocraft:twin_fang_bow", from: "twin_fang_bow", name: "Twin Fang Bow", draw: 1.0, damage: 20 },
  { id: "zoocraft:vexcaller_bow", from: "vexcaller_bow", name: "Vexcaller Bow", draw: 1.2, damage: 26 },
  { id: "zoocraft:sonic_bow", from: "sonic_bow", name: "Sonic Bow", draw: 1.0, damage: 10 },
  { id: "zoocraft:blightbloom_bow", from: "blightbloom_bow", name: "Blightbloom Bow", draw: 0.85, damage: 12, touch: "poison" },
  { id: "zoocraft:blaze_bow", from: "blaze_bow", name: "Blaze Bow", draw: 0.75, damage: 14, touch: "fire" },
  { id: "zoocraft:panda_bow", from: "panda_bow", name: "Panda Bow", draw: 0.35, damage: 9, touch: "hearts" },
  { id: "zoocraft:scorpion_bow", from: "scorpion", name: "Scorpion", draw: 1.3, damage: 48 },
  { id: "zoocraft:ballista_bow", from: "ballista_bow", name: "Ballista", draw: 1.25, damage: 40, load: true },
];

/** The game's own bows, which Guido also collects and trades. */
export const GAME_BOWS = ["minecraft:bow", "minecraft:crossbow"];
