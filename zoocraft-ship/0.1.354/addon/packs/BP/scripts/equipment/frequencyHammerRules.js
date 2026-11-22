// The Frequency Hammer (0.1.354), the prize of the Frequency Friends' villages. Austin (2026-11-22): "it works like a
// wind charge and a mace. When you swing at the ground with left click, it launches you like a wind charge, and when
// you are in the air you can right click to slam on the ground and do splash damage."
// Pure rules: the push of a swing, the slam's reach and hurt. Numbers: BALANCE.frequencyHammer.
import { burns } from "../residents/shapeshiftRules.js";

export const FREQUENCY_HAMMER = "zoocraft:frequency_hammer";
export const PRIZE_FRAME = "minecraft:glow_frame";
/** A frame's facing_direction by the side of its block it is seen from (it hangs on the block behind it). */
export const FRAME_FACING = { n: 2, s: 3, w: 4, e: 5 };
export const prizeStructure = (face) => `zoocraft:ff_prize_${face}`;

/** The game's flight, as measured (0.1.303): each tick v = (v - 0.08) * 0.98, then the move. How high a push of v0 goes. */
export function riseOf(v0) {
  let v = v0, y = 0;
  for (;;) {
    v = (v - 0.08) * 0.98;
    if (v <= 0) return y;
    y += v;
  }
}

/**
 * The push of a swing at a block: away from where the hammer struck (as a wind charge's burst pushes), `from` the
 * struck point to the middle of the player. Straight down at your feet: straight up, k.power. Struck further off:
 * weaker (never under k.least of it), and always some way up. Nothing past k.reach. Returns { x, y, z } or undefined.
 */
export function launchPush(from, k) {
  const dist = Math.hypot(from.x, from.y, from.z);
  if (!(dist <= k.reach)) return undefined;
  const power = k.power * Math.max(k.least, Math.min(1, 1 - (dist - k.full) / k.fade));
  const n = dist < 0.01 ? { x: 0, y: 1, z: 0 } : { x: from.x / dist, y: from.y / dist, z: from.z / dist };
  return { x: n.x * power, y: Math.max(k.minUp, n.y * power), z: n.z * power };
}

/** A slam's hurt at its middle after a fall of `fall` blocks: as the game's mace counts it (steep at first, then less), capped. */
export function slamDamage(fall, k) {
  let d = k.base, left = Math.max(0, fall - k.free);
  for (const [blocks, each] of k.steps) {
    const n = Math.min(left, blocks);
    d += n * each;
    left -= n;
    if (left <= 0) break;
  }
  return Math.min(k.cap, Math.round(d));
}

/** How far a slam reaches after that fall. */
export const slamRadius = (fall, k) => Math.min(k.radiusMax, k.radius + Math.max(0, fall - k.free) * k.radiusPer);

/** The hurt `dist` from a slam's middle: all of it close in, down to k.edge of it at the rim, nothing past. */
export function slamAt(dist, damage, radius, k) {
  if (dist > radius) return 0;
  if (dist <= k.core) return damage;
  return Math.max(1, Math.round(damage * (1 - (1 - k.edge) * ((dist - k.core) / Math.max(0.01, radius - k.core)))));
}

/**
 * Whom a slam hurts: the game's creatures and ZooCraft's wild ones and bosses, Augustus Kong too; never players,
 * villagers and golems, a named, leashed or tamed one, a zoo animal, the Mob House's calm ones (as the dragon shape's
 * fire, residents/shapeshiftRules.js burns). m: { typeId, families, named, leashed, tamed, zoo }.
 */
export const slamHurts = (m) => burns(m) || (m?.typeId === "zoocraft:augustus_kong" && !m.named);

/** Whether a fall's hurt is spared: a slam's landing always; a launch's when it lands no more than k.safeDrop under where it began. */
export const fallSpared = (st, landY, k) => Boolean(st) && (Boolean(st.slam) || landY >= st.launchY - k.safeDrop);
