// 0.1.331: the dragon shape (Austin 2026-11-18 21:41Z, answer 5.4): "once the player drinks it, they turn into a small
// dragon for 30 seconds, it works! players can fly around as a dragon, and they can breath out a cool blue fire. After
// 30 seconds, the effects wear off." The player rides a small dragon of ours (zoocraft:shifted_dragon: the Crimson
// Dragon's model, Damien's own shape, drawn small) that the game steers as it steers the Happy Ghast: where the player
// looks and moves, jump to climb. They are hidden on its back. A swing of the arm (an attack, even at nothing) breathes
// the blue fire. Pure: no game objects here (residents/shapeshift.js runs it).

export const SHIFTED_DRAGON = "zoocraft:shifted_dragon";
/** The potion's effect, as residents/potionRules.js keeps it. */
export const SHAPE_ID = "dragon_shape";

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
 * Whether `to` lies in the fire: within `range` blocks of `from` and within `cone` degrees of `dir` (a unit vector).
 * Returns the distance, or undefined when it is out of the fire. Something right at the mouth is always in it.
 */
export function inFire(from, dir, to, range, cone) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const d = Math.hypot(dx, dy, dz);
  if (d > range) return undefined;
  if (d < 0.75) return d;
  const cos = (dx * dir.x + dy * dir.y + dz * dir.z) / d;
  return cos >= Math.cos((cone * Math.PI) / 180) ? d : undefined;
}

/**
 * The game's mobs the blue fire never burns: players and the village's people and helpers. The fire burns only the
 * game's own mobs (not ZooCraft's: residents, guests, keepers, zoo animals, the Mob House's copies), and never a
 * named, leashed or tamed one, a zoo animal or one in an exhibit: they are somebody's.
 */
export const FIRE_SPARED = new Set(["minecraft:player", "minecraft:villager", "minecraft:villager_v2", "minecraft:wandering_trader", "minecraft:iron_golem", "minecraft:snow_golem", "minecraft:allay", "minecraft:armor_stand"]);

/** Whether the blue fire may burn a mob: m is { typeId, named, leashed, tamed, zoo }. */
export function burns(m) {
  return typeof m?.typeId === "string" && m.typeId.startsWith("minecraft:") && !FIRE_SPARED.has(m.typeId) && !m.named && !m.leashed && !m.tamed && !m.zoo;
}

/**
 * What one breath burns: `mobs` { typeId, pos, named, leashed, tamed, zoo, seen } (seen: nothing solid between the
 * mouth and it), nearest first, at most g.most of them. Each is taken at its middle (pos is its feet: + 0.6 up).
 */
export function fireTargets(mobs, mouth, dir, g) {
  return mobs
    .filter((m) => burns(m) && m.seen !== false)
    .map((m) => ({ m, d: inFire(mouth, dir, { x: m.pos.x, y: m.pos.y + 0.6, z: m.pos.z }, g.range, g.cone) }))
    .filter((x) => x.d !== undefined)
    .sort((a, b) => a.d - b.d)
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
