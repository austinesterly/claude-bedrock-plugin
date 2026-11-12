// 0.1.261: Guido's bows (Austin's "All 15", 2026-11-12). ZooCraft's own version of each of the 15 TwoDogs Zombies bows:
// each fires the game's own arrows (minecraft:shooter with minecraft:arrow, BP items/), looks like its TwoDogs
// original. Draw time is TwoDogs' own. Power scales the arrow's speed, and with it the arrow's damage and reach:
// sqrt(TwoDogs damage per arrow / 14), held to 0.7 to 1.5, so the TwoDogs Bow (14) matches the game's bow. Durability
// is the game's bow's for all (TwoDogs bows have none).
// 0.1.263 (Austin, 12 Nov: "I want all the abilities the same for each bow, just use vanilla arrows only instead"):
// `power` is each one's TwoDogs ability, carried out with the game's arrows (guido/bowShots.js).
// 0.1.264 (the TwoDogs files, 12 Nov: TwoDogs_BP scripts/config/catalog.js BOWS): every number below is TwoDogs' own, as
// its catalog has it: the powers, the headshot (x1.5, the Needle x2), the Signature each bow gains when it's upgraded
// (`signature`, bought from Guido: guido/bowCase.js), the Vexcaller's own upgrade stages, the trails and the sounds.
// Damage numbers a power adds (a blast, a splash, a cloud, burning, a vex's strike) are TwoDogs' too: its zombies have
// the game's zombie's 20 health, so they mean the same here. `from` is the TwoDogs item each one copies, for the record;
// nothing in ZooCraft uses a TwoDogs id.
//
// power kinds: fan (arrows spread evenly across spreadDeg, level), headshot (times), homing (coneDeg, range: blocks it looks for a mob in (it flies on as far as it will),
// turnPerSecond degrees, for TwoDogs' arrow flying flightSpeed blocks a tick), vex (count called per hit, range: blocks the arrow flies before it's gone, TwoDogs' rangeBlocks), sonic (range, pullRadius, minAhead, spacing), spores (radius,
// seconds, perSecond), burn (perSecond, seconds), hearts, pierce (through, range: straight, no drop), radial (arrows
// flat in a ring round the player, range: straight).
// signature kinds: explosive / lightning (radius, damage), rapid (no draw: each use fires a volley, recovery seconds),
// pierce (through more), refund (chance an arrow comes back), scope (fov while sneaking and drawing, damageTimes),
// homing (stronger numbers, damageTimes), poison (perSecond, seconds), vex (count), aftershock (pulled mobs held, seconds),
// spreading (a mob that dies in a spreading cloud bursts into a smaller one), inferno (radius, damage, perSecond,
// seconds), wide (a wider bolt), radial (arrows in the ring for the same arrows).
const ION = { particles: ["ion_trail", "ion_core"], spacing: 0.45, clear: 1.6, sparks: "ion_spark", sparkEvery: 2, burst: ["ion_flash", "ion_burst"] };
const SONIC = { particles: ["sonic_ring"], spacing: 1.1, clear: 2.2, sparks: "sonic_mote", sparkEvery: 1, burst: ["sonic_burst", "sonic_mote"] };
const BLOOM = { particles: ["bloom_trail"], spacing: 0.6, clear: 1.4, sparks: "spore_trail", sparkEvery: 2, burst: ["spore_burst"] };
const BLAZE = { particles: ["blaze_trail"], spacing: 0.5, clear: 1.2, sparks: "lava_ember", sparkEvery: 2, burst: ["blaze_burst"], fire: true };

export const BOWS = [
  {
    id: "zoocraft:short_bow", from: "short_bow", name: "Short Bow", draw: 0.35, damage: 6, headshot: 1.5,
    signature: { kind: "explosive", radius: 2, damage: 8, text: "Explosive arrows (+8 in 2 blocks)" },
  },
  {
    id: "zoocraft:scrap_bow", from: "scrap_bow", name: "Scrap Bow", draw: 0.55, damage: 5, headshot: 1.5, spreadInsteadOfDraw: true,
    power: { kind: "fan", arrows: 4, spreadDeg: 16 },
    signature: { kind: "rapid", recovery: 0.45, text: "Rapid fire: no draw, each use fires a volley" },
  },
  {
    id: "zoocraft:needle_bow", from: "needle_bow", name: "Needle Bow", draw: 1.8, damage: 18, headshot: 2,
    power: { kind: "headshot", times: 2 },
    signature: { kind: "pierce", through: 1, trail: "trail_purple", text: "Glowing arrows pierce one extra mob" },
  },
  {
    id: "zoocraft:classic_bow", from: "bow", name: "Classic Bow", draw: 0.7, damage: 14, headshot: 1.5,
    signature: { kind: "lightning", radius: 2, damage: 8, text: "Lightning splash (+8 in 2 blocks)" },
  },
  {
    id: "zoocraft:flurry_bow", from: "flurry_bow", name: "Flurry Bow", draw: 0.3, damage: 8, headshot: 1.5,
    signature: { kind: "refund", chance: 0.33, text: "Luck in the Chamber: 33% chance to refund the arrow" },
  },
  {
    id: "zoocraft:longbow", from: "longbow", name: "Longbow", draw: 1.15, damage: 32, headshot: 1.5,
    signature: { kind: "scope", damageTimes: 1.25, fov: 45, text: "Scope (sneak while drawing) and +25% damage" },
  },
  {
    id: "zoocraft:proximity_bow", from: "proximity_bow", name: "Proximity Bow", draw: 0.85, damage: 24, headshot: 1.5,
    power: { kind: "homing", coneDeg: 15, range: 18, turnPerSecond: 90, flightSpeed: 2.2 },
    signature: { kind: "homing", coneDeg: 22, range: 22, turnPerSecond: 120, damageTimes: 1.1, text: "Stronger homing and +10% damage" },
  },
  {
    id: "zoocraft:twin_fang_bow", from: "twin_fang_bow", name: "Twin Fang Bow", draw: 1.0, damage: 20, headshot: 1.5,
    power: { kind: "fan", arrows: 2, spreadDeg: 4 },
    signature: { kind: "poison", perSecond: 2, seconds: 4, text: "Poison: 2/s for 4 s" },
  },
  {
    id: "zoocraft:vexcaller_bow", from: "vexcaller_bow", name: "Vexcaller Bow", draw: 1.2, damage: 26, headshot: 1.5,
    power: { kind: "vex", count: 1, range: 28 },
    signature: { kind: "vex", count: 3, text: "Vex Conclave: three vexes per hit" },
    // Its own upgrades, instead of the usual three (TwoDogs' Woodland Mansion spec 4): no draw-time change.
    stages: { damage: [1, 1, 1, 1.1], text: ["Each arrow hit heals 1 heart", "Overflowing: up to 4 bonus hearts", "Direct damage +10%"] },
    trail: ION,
    charge: {
      draw: { id: "respawn_anchor.charge", volume: 0.3, pitch: 1.5 },
      ready: { id: "chime.amethyst_block", volume: 0.6, pitch: 1.4 },
      shot: { id: "mob.shulker.shoot", volume: 0.5, pitch: 1.7 },
      flash: ["ion_flash", "ion_burst"],
    },
  },
  {
    id: "zoocraft:sonic_bow", from: "sonic_bow", name: "Sonic Bow", draw: 1.0, damage: 10, headshot: 1.5,
    power: { kind: "sonic", range: 64, pullRadius: 24, minAhead: 5, spacing: 0.9 },
    signature: { kind: "aftershock", seconds: 2, text: "Aftershock: pulled mobs are frozen for 2 s" },
    trail: SONIC,
    charge: {
      draw: { id: "mob.warden.sonic_charge", volume: 0.45, pitch: 1.5 },
      ready: { id: "power.on.sculk_sensor", volume: 0.8, pitch: 1.3 },
      shot: { id: "mob.warden.sonic_boom", volume: 0.7, pitch: 1.25 },
      flash: ["sonic_burst", "sonic_mote"],
    },
  },
  {
    id: "zoocraft:blightbloom_bow", from: "blightbloom_bow", name: "Blightbloom Bow", draw: 0.85, damage: 12, headshot: 1.5,
    power: { kind: "spores", radius: 2.6, seconds: 4, perSecond: 5 },
    signature: { kind: "spreading", text: "Spreading Bloom: mobs that die in a cloud burst into a new one" },
    trail: BLOOM,
  },
  {
    id: "zoocraft:blaze_bow", from: "blaze_bow", name: "Blaze Bow", draw: 0.75, damage: 14, headshot: 1.5,
    power: { kind: "burn", perSecond: 4, seconds: 4 },
    signature: { kind: "inferno", radius: 2.5, damage: 12, perSecond: 4, seconds: 3, text: "Inferno: arrows burst into flame where they land (+12 in 2.5 blocks, sets them alight)" },
    trail: BLAZE,
  },
  {
    id: "zoocraft:panda_bow", from: "panda_bow", name: "Panda Bow", draw: 0.35, damage: 9, headshot: 1.5,
    power: { kind: "hearts" },
    signature: { kind: "refund", chance: 0.33, text: "Bamboo Luck: 33% chance to refund the arrow" },
    trail: "minecraft:heart_particle",
  },
  {
    id: "zoocraft:scorpion_bow", from: "scorpion", name: "Scorpion", draw: 1.3, damage: 48, headshot: 1.5,
    power: { kind: "pierce", through: 7, range: 48 },
    signature: { kind: "wide", text: "Wider bolt with a bigger hitbox" },
  },
  {
    // TwoDogs, Austin 2026-10-01: no draw time (it fires on the press and winds itself back over its recovery).
    id: "zoocraft:ballista_bow", from: "ballista_bow", name: "Ballista", draw: 0.05, instant: true, recovery: 0.75, damage: 40, headshot: 1.5,
    power: { kind: "radial", arrows: 4, range: 32 },
    signature: { kind: "radial", arrows: 16, text: "16 arrows in a ring for the same 4 arrows" },
  },
];

/** The game's own bows, which Guido also collects and trades. */
export const GAME_BOWS = ["minecraft:bow", "minecraft:crossbow"];
