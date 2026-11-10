// Spessartine Garnet gear (0.1.235; Austin: "equal to diamond in minecraft durability and all other stats"). The
// item files carry what they can (damage, durability, speed, tier, protection, enchanting, repair). The game gives
// custom items no armor toughness, no wear from mining or from tilling, stripping and path-making, and charges a
// custom sword 2 a hit where a diamond sword pays 1 (all measured on Mojang's server against diamond). These rules
// make up the difference; equipment/garnetGear.js applies them. No engine calls here: the tests run it.
import { BALANCE } from "../data/balance.js";

const G = BALANCE.garnet;
export const GARNET_ARMOR = ["zoocraft:garnet_helmet", "zoocraft:garnet_chestplate", "zoocraft:garnet_leggings", "zoocraft:garnet_boots"];
export const GARNET_TOOLS = ["zoocraft:garnet_sword", "zoocraft:garnet_pickaxe", "zoocraft:garnet_axe", "zoocraft:garnet_shovel", "zoocraft:garnet_hoe"];

/** The share of a blow that gets through armor: the game's rule (armor points, toughness, the blow before armor). */
export function through(armor, toughness, blow) {
  return 1 - Math.min(20, Math.max(armor / 5, armor - (4 * blow) / (toughness + 8))) / 25;
}

/** The toughness the Garnet pieces worn should add (2 a piece, as diamond). */
export function owedToughness(worn) {
  return worn.filter((id) => GARNET_ARMOR.includes(id)).length * G.toughness;
}

/** The game tells a script what a blow will cost after armor (and after `kept`, the share Protection and Resistance
 *  leave), with the toughness it knows (`have`). This gives what it should cost with `have + owed`: the blow before
 *  armor is found by halving (a bigger blow always costs more), then put through armor again with the full toughness. */
export function eased(armor, have, owed, cost, kept = 1) {
  if (!(owed > 0) || !(cost > 0) || !(kept > 0)) return cost;
  const afterArmor = cost / kept;
  let lo = afterArmor;
  let hi = afterArmor * 25; // armor never lets less than 1/25 through... nor more than all of it
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (mid * through(armor, have, mid) < afterArmor) lo = mid;
    else hi = mid;
  }
  return hi * through(armor, have + owed, hi) * kept;
}

/** The share of a blow Protection enchantments and Resistance leave: 4% off a point of protection (20 points at
 *  most), then 20% off a level of Resistance. `points` counts Protection once a level, and Fire, Blast and
 *  Projectile Protection twice a level against their own kind of harm. */
export function keptShare(points, resistance) {
  return (1 - Math.min(20, Math.max(0, points)) / 25) * Math.max(0, 1 - 0.2 * (resistance ?? 0));
}

/** Protection points from one piece's enchantments ({ id: level }) against a kind of harm. */
export function protectionPoints(enchants, cause) {
  const special = { fire: "fire_protection", lava: "fire_protection", magma: "fire_protection", campfire: "fire_protection", soulCampfire: "fire_protection", blockExplosion: "blast_protection", entityExplosion: "blast_protection", fireworks: "blast_protection", projectile: "projectile_protection" }[cause];
  return (enchants.protection ?? 0) + (special ? 2 * (enchants[special] ?? 0) : 0);
}

/** Whether armor softens this kind of harm at all (drowning, falls, hunger, magic and the void go straight through). */
export function armorCounts(cause) {
  return G.armorCauses.includes(cause);
}

/** What a hit on a mob costs the tool: 1 for the sword, 2 for the others (diamond's). */
export function hitWear(id) {
  return id === "zoocraft:garnet_sword" ? 1 : 2;
}

/** What breaking a block costs: nothing for blocks that break at a touch, else 1 (the sword 2). */
export function mineWear(id, blockId) {
  if (G.instant.some((p) => p.test(blockId))) return 0;
  return id === "zoocraft:garnet_sword" ? 2 : 1;
}

/** What using the tool on a block costs. The game itself charges a custom shovel for a path and a custom axe for
 *  scraping copper, but not a hoe for tilling or an axe for stripping (measured): those cost 1 here, as diamond's. */
export function useWear(id, before, after) {
  if (before === after) return 0;
  if (id === "zoocraft:garnet_hoe" && after === "minecraft:farmland") return 1;
  if (id === "zoocraft:garnet_axe" && /^minecraft:stripped_/.test(after)) return 1;
  return 0;
}

/** With Unbreaking, each point of wear is only sometimes paid: 1 time in (level + 1). `roll` is 0..1. */
export function pays(unbreaking, roll) {
  return roll < 1 / ((unbreaking ?? 0) + 1);
}
