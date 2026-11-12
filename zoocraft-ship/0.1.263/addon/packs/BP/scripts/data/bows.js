// 0.1.261: Guido's bows (Austin's "All 15", 2026-11-12). ZooCraft's own version of each of the 15 TwoDogs Zombies bows:
// each fires the game's own arrows (minecraft:shooter with minecraft:arrow, BP items/), looks like its TwoDogs
// original. Draw time is TwoDogs' own (the Ballista loads like a crossbow). Power scales the arrow's speed, and with it
// the arrow's damage and reach: sqrt(TwoDogs damage per arrow / 14), held to 0.7 to 1.5, so the TwoDogs Bow (14)
// matches the game's bow. Durability is the game's bow's for all (TwoDogs bows have none).
// 0.1.263 (Austin, 12 Nov: "I want all the abilities the same for each bow, just use vanilla arrows only instead"):
// `power` is each one's TwoDogs ability with its TwoDogs numbers, carried out with the game's arrows
// (guido/bowShots.js; how: balance.js residents.bowCase.powers). The four with none in TwoDogs have none here.
// `from` is the TwoDogs item each one copies, for the record; nothing in ZooCraft uses a TwoDogs id.
export const BOWS = [
  { id: "zoocraft:short_bow", from: "short_bow", name: "Short Bow", draw: 0.35, damage: 6 },
  { id: "zoocraft:scrap_bow", from: "scrap_bow", name: "Scrap Bow", draw: 0.55, damage: 5, power: { kind: "cone", arrows: 4, spreadDeg: 16 } },
  { id: "zoocraft:needle_bow", from: "needle_bow", name: "Needle Bow", draw: 1.8, damage: 18, power: { kind: "headshot", times: 2 } },
  { id: "zoocraft:classic_bow", from: "bow", name: "Classic Bow", draw: 0.7, damage: 14 },
  { id: "zoocraft:flurry_bow", from: "flurry_bow", name: "Flurry Bow", draw: 0.3, damage: 8 },
  { id: "zoocraft:longbow", from: "longbow", name: "Longbow", draw: 1.15, damage: 32 },
  { id: "zoocraft:proximity_bow", from: "proximity_bow", name: "Proximity Bow", draw: 0.85, damage: 24, power: { kind: "homing" } },
  { id: "zoocraft:twin_fang_bow", from: "twin_fang_bow", name: "Twin Fang Bow", draw: 1.0, damage: 20, power: { kind: "twin", arrows: 2 } },
  { id: "zoocraft:vexcaller_bow", from: "vexcaller_bow", name: "Vexcaller Bow", draw: 1.2, damage: 26, power: { kind: "vex" } },
  { id: "zoocraft:sonic_bow", from: "sonic_bow", name: "Sonic Bow", draw: 1.0, damage: 10, power: { kind: "sonic" } },
  { id: "zoocraft:blightbloom_bow", from: "blightbloom_bow", name: "Blightbloom Bow", draw: 0.85, damage: 12, power: { kind: "spores", perSecond: 5 } },
  { id: "zoocraft:blaze_bow", from: "blaze_bow", name: "Blaze Bow", draw: 0.75, damage: 14, power: { kind: "burn", perSecond: 4 } },
  { id: "zoocraft:panda_bow", from: "panda_bow", name: "Panda Bow", draw: 0.35, damage: 9, power: { kind: "hearts" } },
  { id: "zoocraft:scorpion_bow", from: "scorpion", name: "Scorpion", draw: 1.3, damage: 48, power: { kind: "pierce", through: 7 } },
  { id: "zoocraft:ballista_bow", from: "ballista_bow", name: "Ballista", draw: 1.25, damage: 40, load: true, power: { kind: "ring", arrows: 4 } },
];

/** The game's own bows, which Guido also collects and trades. */
export const GAME_BOWS = ["minecraft:bow", "minecraft:crossbow"];
