// Mega TNT (0.1.335; Austin's NPC #28 spec: Tim's gift at 100 friendship, "10x the blast radius of normal TNT ...
// not just 10x the damage"): the numbers and the shapes, no engine calls. The runtime is world/megaTnt.js.
//
// TNT's blast radius is 4; Mega TNT's is 40. Tried on the test server (0.1.335): the game's own blast at radius 40
// stopped the server for 2.3 s and, as its rays spread apart with distance, blew only a ragged hole about 20 blocks
// out in dirt (7 in stone), so it could not give the 10x radius. Mega TNT's crater is cut by script instead: a ball of
// radius 40 round the blast, the middle first and outwards, a few columns a step, which took the server about half a
// second without one slow tick; the game's blast (without breaking blocks) does the damage, the push and the sound.

export const MEGA_TNT = "zoocraft:mega_tnt";
export const MEGA_PRIMED = "zoocraft:mega_tnt_primed";
export const FUSE_LEFT = "zoocraft:fuse"; // dynamic property on a lit one: ticks left to burn
export const LATE = "zoocraft:late"; // entity property: the fuse is nearly done (it flashes fast)

// Blocks the blast leaves standing, as TNT's does: what an explosion can't break (blast-proof or unbreakable), water
// and lava (an explosion never takes them), and the game's blocks that aren't solid things to blow away. ZooCraft's
// own explosion-proof blocks are added from their definitions (data/blastProof.js).
export const KEEP_VANILLA = [
  "minecraft:bedrock", "minecraft:barrier", "minecraft:obsidian", "minecraft:crying_obsidian", "minecraft:respawn_anchor",
  "minecraft:ancient_debris", "minecraft:netherite_block", "minecraft:enchanting_table", "minecraft:anvil", "minecraft:chipped_anvil",
  "minecraft:damaged_anvil", "minecraft:ender_chest", "minecraft:reinforced_deepslate", "minecraft:end_portal_frame", "minecraft:end_portal",
  "minecraft:end_gateway", "minecraft:command_block", "minecraft:chain_command_block", "minecraft:repeating_command_block",
  "minecraft:structure_block", "minecraft:structure_void", "minecraft:jigsaw", "minecraft:allow", "minecraft:deny", "minecraft:border_block",
  "minecraft:water", "minecraft:flowing_water", "minecraft:lava", "minecraft:flowing_lava", "minecraft:bubble_column",
  "minecraft:moving_block", "minecraft:trial_spawner", "minecraft:vault", "minecraft:light_block",
];

// Blocks that hold things: what is in them falls out where they stood before the crater takes them (an explosion
// drops a chest's contents).
export const HOLDERS = [
  "minecraft:chest", "minecraft:trapped_chest", "minecraft:barrel", "minecraft:hopper", "minecraft:dispenser", "minecraft:dropper",
  "minecraft:furnace", "minecraft:lit_furnace", "minecraft:blast_furnace", "minecraft:lit_blast_furnace", "minecraft:smoker",
  "minecraft:lit_smoker", "minecraft:brewing_stand", "minecraft:crafter", "minecraft:undyed_shulker_box",
  ...["white", "orange", "magenta", "light_blue", "yellow", "lime", "pink", "gray", "light_gray", "cyan", "purple", "blue", "brown", "green", "red", "black"].map((c) => `minecraft:${c}_shulker_box`),
];

/** What lights one by hand: flint and steel or a fire charge (as TNT). */
export function lighterOf(typeId) {
  return typeId === "minecraft:flint_and_steel" ? "flint" : typeId === "minecraft:fire_charge" ? "charge" : undefined;
}

/** Fire next to it (as fire lights TNT). */
export const isFire = (typeId) => typeId === "minecraft:fire" || typeId === "minecraft:soul_fire";

/**
 * How long a lit one burns, in ticks: lit by a player, by redstone or by fire, g.fuse (Austin, 2026-11-19: 20 s); set
 * off by another blast, a short fuse as TNT's is (g.chainFuse, from..to).
 */
export function fuseTicks(cause, g, random = Math.random) {
  if (cause === "blast") return g.chainFuse[0] + Math.floor(random() * (g.chainFuse[1] - g.chainFuse[0] + 1));
  return g.fuse;
}

/**
 * The crater: every column (dx, dz) inside a ball of `radius`, with how far it reaches up and down there (`half`),
 * nearest the middle first, so it opens from the blast outwards. A ball of radius 40 is 5,025 columns.
 */
export function craterColumns(radius) {
  const out = [];
  const R = Math.floor(radius);
  for (let dx = -R; dx <= R; dx++)
    for (let dz = -R; dz <= R; dz++) {
      const h2 = radius * radius - dx * dx - dz * dz;
      if (h2 < 0) continue;
      out.push({ dx, dz, half: Math.floor(Math.sqrt(h2)) });
    }
  return out.sort((a, b) => a.dx * a.dx + a.dz * a.dz - (b.dx * b.dx + b.dz * b.dz) || a.dx - b.dx || a.dz - b.dz);
}

/** The ys a column cuts, kept inside the world's height ({ min, max }: the lowest and one past the highest block). */
export function columnSpan(cy, half, height) {
  const lo = Math.max(height.min, cy - half), hi = Math.min(height.max - 1, cy + half);
  return lo <= hi ? { lo, hi } : undefined;
}

/** Whether (dx, dy, dz) from the middle is inside the ball. */
export const inBall = (dx, dy, dz, radius) => dx * dx + dy * dy + dz * dz <= radius * radius;

/** The ball's bounding box round a centre block. */
export function ballBox(c, radius, height) {
  const R = Math.floor(radius);
  return { from: { x: c.x - R, y: Math.max(height.min, c.y - R), z: c.z - R }, to: { x: c.x + R, y: Math.min(height.max - 1, c.y + R), z: c.z + R } };
}

/** Whether the fuse is nearly done (the last g.lateTicks): it flashes fast. */
export const isLate = (left, g) => left <= g.lateTicks;

/** Where to put the blast's smoke: n points spread through the ball (seeded, so tests see the same). */
export function smokePoints(c, radius, n, random = Math.random) {
  const out = [{ x: c.x + 0.5, y: c.y + 0.5, z: c.z + 0.5 }];
  for (let i = 1; i < n; i++) {
    const r = radius * Math.cbrt(random()), u = random() * 2 - 1, t = random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    out.push({ x: c.x + 0.5 + r * s * Math.cos(t), y: c.y + 0.5 + r * u * 0.6, z: c.z + 0.5 + r * s * Math.sin(t) });
  }
  return out;
}
