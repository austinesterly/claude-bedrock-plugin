// The goo update's rules (0.1.237), kept apart from the game so the tests can read them. Austin, 2026-11-10: "Goo
// should start to drown you. Let's make goo bubble as well, and pop and stuff. Let's also allow the vanilla bucket to
// pick up goo, and goo can be used to form sticky gauntlets. Gauntlets are crafted from leather, and if you dip the
// leather gauntlets in a cauldron of goo, you get sticky gauntlets. These have unlimited durability, and they allow
// players to climb up walls" and "You can equip sticky gauntlets by putting them in your off hand".
export const GOO = "zoocraft:goo";
export const GOO_BUCKET = "zoocraft:goo_bucket";
export const GOO_CAULDRON = "zoocraft:goo_cauldron";
export const LEATHER_GAUNTLETS = "zoocraft:leather_gauntlets";
export const STICKY_GAUNTLETS = "zoocraft:sticky_gauntlets";

/**
 * A player's air after one look (the loop's `step` ticks). The stable script API can't read the game's own air, so goo
 * keeps a count of its own that runs as water's does: a full breath lasts `G.air` ticks with the head under,
 * Respiration stretches it (level + 1 times), Water Breathing and Conduit Power stop it, and once it is gone the goo
 * costs `G.drownHarm` every `G.drownEvery` ticks. Out of the goo the breath comes back quickly.
 * Returns { air, hurt }.
 */
export function airStep(air, headIn, breathes, respiration, step, G) {
  if (!headIn) return { air: Math.min(G.air, air + G.airBack * step), hurt: false };
  if (breathes) return { air, hurt: false };
  const next = air - step / (1 + Math.max(0, respiration));
  if (next <= -G.drownEvery) return { air: 0, hurt: true };
  return { air: next, hurt: false };
}

/** The ten bubbles over the hotbar, as water shows them: how many are left. */
export function airBubbles(air, G) {
  return Math.max(0, Math.min(10, Math.ceil((air / G.air) * 10)));
}

/** The line on the action bar while the breath is short. */
export function airLine(air, G) {
  const n = airBubbles(air, G);
  return `§bAir §f${"o".repeat(n)}§8${"-".repeat(10 - n)}`;
}

/**
 * Sticky Gauntlets on a wall, one tick. `touching`: a wall beside the feet or chest; `ledge`: nothing beside the
 * player any more but a wall just under the feet (the top of the climb); `clung`: on the wall last tick; `held`: on it
 * to stay (they climbed or hung for a moment, or a fall was caught), not from one tap of jump; `vy`: the
 * player's speed up (blocks a tick); `slow`: Slow Falling is on them. Returns undefined (not on the wall) or
 * { lift, mantle }: the push up to give. The push is exact: each tick the game takes its gravity off a player's speed
 * and then a fiftieth of what is left (measured on Mojang's server: gravity 0.08, or 0.01 for a player who has Slow
 * Falling and is moving down), so the push that leaves them moving at the wanted speed is wanted / 0.98 + gravity -
 * speed, and none is given when they would move at least that fast anyway.
 * Holding jump climbs, sneaking hangs still, neither slides down slowly. Nothing ever slows a player who is moving up
 * faster than that (a jump onto the wall carries on as a jump), and a hop beside a wall (one tap of jump) isn't
 * caught: only a real fall is, so walking about with the gauntlets on feels as it always did.
 */
export function climbMove({ touching, ledge, clung, held, jump, sneak, vy, slow }, C) {
  if (!touching) {
    if (ledge && clung && jump) return { lift: Math.max(0, C.mantle - vy), mantle: true }; // over the top in one move
    return undefined;
  }
  if (!jump && !sneak && !held && vy > C.catchAt) return undefined;
  const want = jump ? C.up : sneak ? -C.hang : -C.slide;
  const gravity = slow && vy < 0 ? C.gravitySlow : C.gravity;
  if ((vy - gravity) * C.drag >= want) return { lift: 0, mantle: false };
  return { lift: want / C.drag + gravity - vy, mantle: false };
}

/** A Goo Cauldron after one pair of gauntlets is dipped: its next level, 0 = empty (a plain cauldron again). */
export function afterDip(level) {
  return Math.max(0, level - 1);
}

/** What using `held` on a Goo Cauldron at `level` does: "dip", "scoop", "fill" or undefined (just the hint). */
export function cauldronUse(held, level) {
  if (held === LEATHER_GAUNTLETS) return "dip";
  if (held === "minecraft:bucket" && level === 3) return "scoop";
  if (held === GOO_BUCKET && level < 3) return "fill";
  return undefined;
}

/** Of the block ids from a column's top down, the index of the goo that lies open to the air (a pool's surface). */
export function gooSurface(ids) {
  for (let i = 1; i < ids.length; i++) {
    if (ids[i] === GOO && ids[i - 1] === "minecraft:air") return i;
    if (ids[i] !== "minecraft:air" && ids[i] !== GOO) continue;
  }
  return -1;
}
