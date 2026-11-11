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
 * Sticky Gauntlets (0.1.251; Austin, 2026-11-11: "I do not want potion effects and levetation for sticky gloves, I
 * want the player to be able to parqour around with sticky gloves equipped, they should have to click the block above
 * to climb, and you should be able to hop off the wall to jump to another, no slow falling or potion effects, change
 * it with the script"). All of it is pushes worked out here; no effect is ever given.
 *
 * The push that leaves a player moving up at exactly `want` blocks a tick: each tick the game takes its gravity off a
 * player's speed and then a fiftieth of what is left (measured on Mojang's server), so push = want / drag + gravity -
 * speed. With want 0 the player hangs still.
 */
export function holdPush(want, vy, C) {
  return want / C.drag + C.gravity - vy;
}

/**
 * What a click on the wall block `block` does for a wearer whose feet are at `at` ({x, y, z}, the player's middle).
 * `freeAbove(n)`: true when the cell n above the block is no wall. Returns undefined (too far, or under the feet) or
 * { kind, y }: where the feet go.
 *  - "wall": the hands take hold of the clicked block and the body hangs under it (feet one below the block): a block
 *    at head height just holds on; the block above pulls the player up one; never down.
 *  - "ledge": the clicked block has room for a player on top: up and over onto it.
 *  - "ceiling": a block straight overhead: hang under it.
 */
export function gripTarget(at, block, freeAbove, C) {
  const dx = Math.max(Math.abs(at.x - (block.x + 0.5)) - 0.5, 0);
  const dz = Math.max(Math.abs(at.z - (block.z + 0.5)) - 0.5, 0);
  const gap = Math.hypot(dx, dz);
  if (gap === 0) {
    const room = block.y - (at.y + C.tall);
    if (room < -0.3 || room > C.armUp) return undefined; // not overhead, or out of arm's reach
    return { kind: "ceiling", y: Math.max(at.y, block.y - C.tall - C.headRoom) };
  }
  if (gap > C.grab) return undefined;
  if (block.y + 1 <= at.y || block.y > at.y + C.reachUp) return undefined;
  if (freeAbove(1) && freeAbove(2)) return { kind: "ledge", y: block.y + 1 };
  return { kind: "wall", y: Math.max(at.y, Math.min(block.y - 1, at.y + C.maxPull)) };
}

/** The speed up for this tick of a pull to `target`: C.up, eased so the last tick lands on the height. */
export function pullSpeed(y, target, C) {
  return Math.max(0, Math.min(C.up, target - y));
}

/**
 * The speed for this tick of a hang at `target`: none, but for the hair the last tick left them off it (measured: a
 * player held by pushes alone crept up 0.002 a tick).
 */
export function holdSpeed(y, target, C) {
  return Math.max(-C.holdMax, Math.min(C.holdMax, (target - y) * C.holdGain));
}

/**
 * The hop off a wall when jump is pressed: { x, y, z } to push with. `view`: where the player looks; `out`: the
 * wall's outward direction ({x, z}, zero for a ceiling). Looking away from the wall the hop goes where they look;
 * looking at the wall it goes along it and off it, never back up it (climbing takes clicks).
 */
export function hopPush(view, out, C) {
  let x = view.x;
  let z = view.z;
  const n = Math.hypot(out.x, out.z);
  if (n > 0) {
    const ox = out.x / n;
    const oz = out.z / n;
    const dot = x * ox + z * oz;
    if (dot < C.hopFacing) {
      x += ox * (C.hopOff - dot);
      z += oz * (C.hopOff - dot);
    }
  }
  const len = Math.hypot(x, z);
  if (len < 1e-6) return { x: 0, y: C.hopUp, z: 0 };
  return { x: (x / len) * C.hopOut, y: C.hopUp, z: (z / len) * C.hopOut };
}

/**
 * Fall harm after letting go of a wall. The game counts every block a player has dropped since they last stood on
 * the ground, hanging or not, so its count is too high for a climber: the harm owed is for the drop since they let go
 * (`drop` blocks; the first three are free, as always), and never more than the game asked for (armor, Feather
 * Falling and hay are already in `harm`).
 */
export function fairFallHarm(drop, harm, C) {
  return Math.max(0, Math.min(harm, Math.ceil(drop - C.freeFall - 1e-6)));
}

export const GOO_FOG = "zoocraft:fog_goo";
export const GOO_FOG_TAG = "zoocraft_goo";
/** The commands that put the goo's fog on a player's view, or take it off. */
export function gooFog(on) {
  return on ? [`fog @s remove ${GOO_FOG_TAG}`, `fog @s push ${GOO_FOG} ${GOO_FOG_TAG}`] : [`fog @s remove ${GOO_FOG_TAG}`];
}

/**
 * Which goo an empty bucket takes: `cells` are the block ids along the player's line of sight, nearest first
 * ("" = air), `passable(id)` says what a bucket reaches through (plants on the goo). The first goo wins; anything
 * solid before it stops the bucket. With no goo in sight a player standing in goo takes the goo they stand in
 * (`own`: the index to use then, or -1). Returns the index, or -1.
 */
export function scoopPick(cells, passable, own = -1) {
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] === GOO) return i;
    if (cells[i] !== "" && !passable(cells[i])) break;
  }
  return own;
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
