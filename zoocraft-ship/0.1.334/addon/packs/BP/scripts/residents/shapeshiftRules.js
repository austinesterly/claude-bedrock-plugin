// 0.1.331: the dragon shape (Austin 2026-11-18 21:41Z, answer 5.4): "once the player drinks it, they turn into a small
// dragon for 30 seconds, it works! players can fly around as a dragon, and they can breath out a cool blue fire. After
// 30 seconds, the effects wear off." The player rides a small dragon of ours (zoocraft:shifted_dragon: the Crimson
// Dragon's model, Damien's own shape, drawn small) that the game steers as it steers the Happy Ghast: where the player
// looks and moves, jump to climb. They are hidden on its back. A swing of the arm (an attack, even at nothing) breathes
// the blue fire. Pure: no game objects here (residents/shapeshift.js runs it).

export const SHIFTED_DRAGON = "zoocraft:shifted_dragon";
/** 0.1.333: the Crimson Dragon's bodies (world/voidDragonRules.js): one creature to the fire. Its eyes are left out (a blow there counts three times). */
export const ONE_DRAGON = ["zoocraft:void_dragon", "zoocraft:void_dragon_part"];
export const DRAGON_EYE_ID = "zoocraft:void_dragon_eye";
/** The potion's effect, as residents/potionRules.js keeps it. */
export const SHAPE_ID = "dragon_shape";

/** 0.1.334: the armor slots (the game's names) and their words in chat. Austin: "you cannot shapeshift with armor on". */
export const ARMOR_SLOTS = ["Head", "Chest", "Legs", "Feet"];
const SLOT_WORDS = { Head: "head", Chest: "chest", Legs: "legs", Feet: "feet" };

/** 0.1.334: our items worn in an armor slot (every item of ours with minecraft:wearable: armor, hats, hairlines, necklaces). */
export const WEARABLE_IDS = [
  "zoocraft:chainmail_nether_wart_baseball_hat", "zoocraft:chainmail_warped_wood_sombrero",
  "zoocraft:copper_nether_wart_baseball_hat", "zoocraft:copper_warped_wood_sombrero",
  "zoocraft:crying_obsidian_necklace", "zoocraft:diamond_nether_wart_baseball_hat",
  "zoocraft:diamond_warped_wood_sombrero", "zoocraft:diving_helmet", "zoocraft:garnet_boots",
  "zoocraft:garnet_chestplate", "zoocraft:garnet_helmet", "zoocraft:garnet_leggings", "zoocraft:ghast_js",
  "zoocraft:golden_nether_wart_baseball_hat", "zoocraft:golden_warped_wood_sombrero", "zoocraft:hairline_bolt_black",
  "zoocraft:hairline_bolt_brown", "zoocraft:hairline_bolt_diamond", "zoocraft:hairline_bolt_red",
  "zoocraft:hairline_bolt_white", "zoocraft:hairline_lineup_black", "zoocraft:hairline_lineup_brown",
  "zoocraft:hairline_lineup_diamond", "zoocraft:hairline_lineup_red", "zoocraft:hairline_lineup_white",
  "zoocraft:hairline_peak_black", "zoocraft:hairline_peak_brown", "zoocraft:hairline_peak_diamond",
  "zoocraft:hairline_peak_red", "zoocraft:hairline_peak_white", "zoocraft:hairline_round_black",
  "zoocraft:hairline_round_brown", "zoocraft:hairline_round_diamond", "zoocraft:hairline_round_red",
  "zoocraft:hairline_round_white", "zoocraft:iron_nether_wart_baseball_hat", "zoocraft:iron_warped_wood_sombrero",
  "zoocraft:leather_nether_wart_baseball_hat", "zoocraft:leather_warped_wood_sombrero",
  "zoocraft:nether_wart_baseball_hat", "zoocraft:netherite_garnet_boots", "zoocraft:netherite_garnet_chestplate",
  "zoocraft:netherite_garnet_helmet", "zoocraft:netherite_garnet_leggings",
  "zoocraft:netherite_nether_wart_baseball_hat", "zoocraft:netherite_warped_wood_sombrero",
  "zoocraft:obsidian_boots", "zoocraft:obsidian_chestplate", "zoocraft:obsidian_helmet",
  "zoocraft:obsidian_leggings", "zoocraft:shroomlight_necklace", "zoocraft:soul_shoes", "zoocraft:spotless_boots",
  "zoocraft:spotless_chestplate", "zoocraft:spotless_leggings", "zoocraft:warped_wood_sombrero",
  "zoocraft:wither_star_necklace",
];
const WEARABLE = new Set(WEARABLE_IDS);

/** 0.1.334: an item that goes on in an armor slot when used: ours, and the game's armor, elytra, carved pumpkin, skulls and heads. */
export const isWearable = (id) => WEARABLE.has(id) || /^minecraft:(.+_(helmet|chestplate|leggings|boots|head|skull)|elytra|carved_pumpkin)$/.test(String(id));

/** 0.1.334: "head", "head and feet", "head, chest and feet". */
export function wornWords(slots) {
  const w = slots.map((s) => SLOT_WORDS[s] ?? String(s).toLowerCase());
  return w.length <= 1 ? w.join("") : `${w.slice(0, -1).join(", ")} and ${w[w.length - 1]}`;
}

/** 0.1.334: the chat line when a player with something worn tries to become a dragon. */
export const armorLine = (words, slots) => `${words.armor} ${words.armorWhere.replace("%s", wornWords(slots))}`;

/** Where a player looks, as a unit vector: the game's view (pitch: degrees down, yaw: degrees, 0 south, 90 west). */
export function viewDir(pitch, yaw) {
  const p = (pitch * Math.PI) / 180;
  const y = (yaw * Math.PI) / 180;
  return { x: -Math.sin(y) * Math.cos(p), y: -Math.sin(p), z: Math.cos(y) * Math.cos(p) };
}

/** The dragon's mouth: `g.ahead` blocks ahead of the dragon on the level its head faces (yaw), `g.up` over its feet. */
export function mouthOf(at, yaw, g) {
  const y = (yaw * Math.PI) / 180;
  return { x: at.x - Math.sin(y) * g.ahead, y: at.y + g.up, z: at.z + Math.cos(y) * g.ahead };
}

/**
 * Whether `to` lies in the fire: within `range` blocks of `from` and within `cone` degrees of `dir` (a unit vector), or
 * (0.1.333) within `width` blocks of its line, ahead. Returns the distance, or undefined when it is out of the fire.
 * Something right at the mouth is always in it.
 */
export function inFire(from, dir, to, range, cone, width = 0) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const d = Math.hypot(dx, dy, dz);
  if (d > range) return undefined;
  if (d < 0.75) return d;
  const along = dx * dir.x + dy * dir.y + dz * dir.z;
  if (along <= 0) return undefined;
  const off = Math.sqrt(Math.max(0, d * d - along * along));
  return off <= Math.max(width, along * Math.tan((cone * Math.PI) / 180)) + 1e-9 ? d : undefined;
}

/**
 * The game's mobs the blue fire never burns: players and the village's people and helpers. Nor ever a named, leashed or
 * tamed one, a zoo animal or one in an exhibit: they are somebody's.
 */
export const FIRE_SPARED = new Set(["minecraft:player", "minecraft:villager", "minecraft:villager_v2", "minecraft:wandering_trader", "minecraft:iron_golem", "minecraft:snow_golem", "minecraft:allay", "minecraft:armor_stand"]);

/**
 * 0.1.333: ZooCraft's own the fire never burns, by family: zoo animals, the Mob House's calm ones, Guido's bow vexes, the
 * mythic city's Shark Folk, other players' dragons (and players, and our unseen helpers). ZooCraft's people (residents,
 * guests, keepers, Damien) are no creatures of the game's ("mob") and are never burned either.
 */
export const FIRE_SPARED_FAMILIES = ["player", "inanimate", "projectile", "zoocraft_animal", "zoocraft_mob", "zoocraft_bow_vex", "shark_folk", "shifted_dragon"];

/**
 * Whether the blue fire may burn a mob: m is { typeId, families, named, leashed, tamed, zoo }. 0.1.333 (Austin: "It also
 * does not do damage from what I am seeing"): any creature (family "mob": the game's and ZooCraft's wild ones) and the
 * bosses (the Crimson Dragon), never one spared above. Without families, the game's own count as creatures.
 */
export function burns(m) {
  if (typeof m?.typeId !== "string" || FIRE_SPARED.has(m.typeId) || m.named || m.leashed || m.tamed || m.zoo) return false;
  const fam = m.families ?? (m.typeId.startsWith("minecraft:") ? ["mob"] : []);
  return !fam.some((f) => FIRE_SPARED_FAMILIES.includes(f)) && (fam.includes("mob") || fam.includes("zoocraft_boss"));
}

/** 0.1.333: where along the fire its puffs start: every `every` blocks out to two short of its reach. */
export function puffSpots(range, every) {
  const out = [];
  for (let k = 0; k <= range - 2 + 1e-9; k += every) out.push(k);
  return out;
}

/**
 * What one breath burns: `mobs` { typeId, pos, named, leashed, tamed, zoo, seen } (seen: nothing solid between the
 * mouth and it), nearest first, at most g.most of them. Each is taken at its middle (pos is its feet: + 0.6 up).
 */
export function fireTargets(mobs, mouth, dir, g) {
  const taken = new Set();
  return mobs
    .filter((m) => burns(m) && m.seen !== false)
    .map((m) => ({ m, d: inFire(mouth, dir, { x: m.pos.x, y: m.pos.y + 0.6, z: m.pos.z }, g.range, g.cone, g.width ?? 0) }))
    .filter((x) => x.d !== undefined)
    .sort((a, b) => a.d - b.d)
    .filter((x) => {
      // 0.1.333: one creature of many bodies (the Crimson Dragon and its parts: `group`) is burned once
      const k = x.m.group ?? x.m;
      if (taken.has(k)) return false;
      taken.add(k);
      return true;
    })
    .slice(0, g.most)
    .map((x) => x.m);
}

/** A whole number in steps of 5 within +-35 (the model's lean properties, the Crimson Dragon's own). */
export const leanStep = (deg) => Math.max(-35, Math.min(35, Math.round(deg / 5) * 5)) + 0; // + 0: never -0

/**
 * The small dragon's pose from its rider: `pitch` where the rider looks (degrees, down is +), `turn` how far they turned
 * in one tick (degrees, left is -), on the ground, breathing fire. Returns the Crimson Dragon's properties
 * (world/voidDragonRules.js leanOf): act (0 flying, 1 breathing fire, 2 standing), pitch (nose down is +, as it dives)
 * and bank (into the turn: to its left when it turns left, +).
 */
export function poseOf(pitch, turn, onGround, breathing) {
  return {
    act: breathing ? 1 : onGround ? 2 : 0,
    pitch: onGround ? 0 : leanStep(pitch * 0.8),
    bank: onGround ? 0 : leanStep(-turn * 5),
  };
}

/**
 * How far the view turned between two looks, the short way round (yaw in degrees): -180 to 180.
 */
export function turnOf(prevYaw, yaw) {
  let d = (yaw - prevYaw) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * What to do about a shifted player who isn't on their dragon now: "end" (they got off on purpose: sneaking, the game's
 * way off a mount, turns them back early), "mount" (the game put them off it: a teleport, a new dimension, a rejoin;
 * a new dragon under them), or "giveup" (it would not take them `most` times running: turn them back).
 */
export function offDragon(sneaking, tries, most) {
  if (sneaking) return "end";
  return tries >= most ? "giveup" : "mount";
}

/**
 * A rider's own Invisibility, kept while they are a dragon: `before` the ticks it had left when they drank, `gone` the
 * ticks since. Returns the ticks to give back when they turn back (0: none).
 */
export const invisibilityBack = (before, gone) => Math.max(0, (before ?? 0) - gone);

/** Whether a turned-back player still needs Slow Falling: in the air, and not past the most it is given (ticks). */
export function stillFalling(onGround, inWater, since, now, mostTicks, grace = 6) {
  if (now - since < grace) return true; // just off the dragon: the game still says they stand (the bench: a rider is "on the ground")
  return !onGround && !inWater && now - since < mostTicks;
}
