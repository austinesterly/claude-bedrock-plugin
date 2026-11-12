// Red and blue amethyst (0.1.274): the game's amethyst in two new colours, for the fishing sky's uncommon islands.
// Austin, 12 Nov 18:45Z: "Uncommon: red and blue amethyst". Each colour has the game's six blocks (the block, budding,
// the three buds and the cluster) and its shard, and behaves as the game's does (from the game's own numbers):
// - Budding amethyst: on a random tick, a 1 in 5 chance that one of its six sides (picked at random) grows: a small bud
//   in air or water there, or the bud already on that side one stage on. It drops nothing, even with Silk Touch.
// - Buds and clusters: light 1, 2, 4 and 5. A cluster drops 4 shards to a pickaxe (Fortune multiplies them as the
//   game's ores: I a third of the time x2; II a quarter each x2, x3; III a fifth each x2, x3, x4) and 2 shards broken any
//   other way. A bud drops nothing. Silk Touch drops any of them as itself. Nothing drops in creative. One pops off
//   (as if broken by nothing held) when the block it grows from is broken or blown up, and when a piston pushes it.
// - The block drops itself to a pickaxe and nothing to anything else (and itself when blown up).
// - Silk Touch: the game itself drops any custom block as its own item to Silk Touch, whatever its loot table says
//   (MCPE-114654; seen on the test server with budding blue amethyst), so nothing more comes from here; where the
//   game's amethyst would drop nothing (budding, or the block to a tool that isn't a pickaxe), that item is taken back.
// The game's own purple amethyst keeps its own rules; these ids are only for the islands' mix of colours.
// Pure, so the tests can run them; fishing/amethyst.js is the game side.

const SETS = {
  purple: {
    block: "minecraft:amethyst_block",
    budding: "minecraft:budding_amethyst",
    stages: ["minecraft:small_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:large_amethyst_bud", "minecraft:amethyst_cluster"],
    shard: "minecraft:amethyst_shard",
  },
};
for (const c of ["red", "blue"]) {
  SETS[c] = {
    block: `zoocraft:${c}_amethyst_block`,
    budding: `zoocraft:budding_${c}_amethyst`,
    stages: [`zoocraft:small_${c}_amethyst_bud`, `zoocraft:medium_${c}_amethyst_bud`, `zoocraft:large_${c}_amethyst_bud`, `zoocraft:${c}_amethyst_cluster`],
    shard: `zoocraft:${c}_amethyst_shard`,
  };
}
export const AMETHYST = Object.freeze(SETS);
export const COLOURS = Object.freeze(["purple", "red", "blue"]);
/** The new colours (ZooCraft's blocks). */
export const NEW_COLOURS = Object.freeze(["red", "blue"]);
/** Light from a bud or cluster by stage (small, medium, large, cluster): the game's. */
export const LIGHT = Object.freeze([1, 2, 4, 5]);
/** The block state that says which face of its support a bud or cluster grows from (the game's and ours). */
export const FACE_STATE = "minecraft:block_face";
export const FACES = Object.freeze(["up", "down", "north", "south", "east", "west"]);
export const STEP = Object.freeze({ up: [0, 1, 0], down: [0, -1, 0], north: [0, 0, -1], south: [0, 0, 1], east: [1, 0, 0], west: [-1, 0, 0] });
/** A budding block's chance that a random tick grows something (on the one side it picks): the game's 20%. */
export const GROW_CHANCE = 0.2;
/** The selection and collision box of each stage, in pixels (the game's shapes: 3, 4, 5 and 7 tall). */
export const SHAPES = Object.freeze([
  { origin: [-4, 0, -4], size: [8, 3, 8] },
  { origin: [-5, 0, -5], size: [10, 4, 10] },
  { origin: [-5, 0, -5], size: [10, 5, 10] },
  { origin: [-5, 0, -5], size: [10, 7, 10] },
]);

/** What a block is, if it's ZooCraft's red or blue amethyst: { colour, part: "block"|"budding"|"crystal", stage }. */
export function amethystOf(typeId) {
  for (const colour of NEW_COLOURS) {
    const s = AMETHYST[colour];
    if (typeId === s.block) return { colour, part: "block", stage: -1 };
    if (typeId === s.budding) return { colour, part: "budding", stage: -1 };
    const stage = s.stages.indexOf(typeId);
    if (stage >= 0) return { colour, part: "crystal", stage };
  }
  return undefined;
}

/** Which side a budding block's random tick works on, or undefined (4 times in 5, nothing grows). */
export function growSide(rand) {
  if (rand() >= GROW_CHANCE) return undefined;
  return FACES[Math.min(FACES.length - 1, Math.floor(rand() * FACES.length))];
}

/**
 * What grows on side `side` of a budding block of `colour`, given what's there now (`there` its id, `face` its
 * block_face if it has one): a new small bud in air or water, the next stage of a bud of that colour growing from this
 * block (its face is `side`), or undefined. Returns the new block's id (its face is `side`).
 */
export function grownOn(colour, side, there, face) {
  const s = AMETHYST[colour];
  if (!s) return undefined;
  if (there === "minecraft:air" || there === "minecraft:water" || there === "minecraft:flowing_water") return s.stages[0];
  const stage = s.stages.indexOf(there);
  if (stage >= 0 && stage < 3 && face === side) return s.stages[stage + 1];
  return undefined;
}

/**
 * Whether a bud or cluster whose block_face is `face` grows from the block `d` ([dx, dy, dz]) away from it, so it pops
 * off when that block goes (its block_face is the face of that block it grows out of).
 */
export function growsFrom(face, d) {
  const s = STEP[face];
  return Boolean(s) && s[0] === -d[0] && s[1] === -d[1] && s[2] === -d[2];
}

/** How many times Fortune multiplies an ore-like drop (the game's formula): 1 to level + 1. */
export function fortuneTimes(level, rand) {
  const L = Math.max(0, Math.floor(level ?? 0));
  if (!L) return 1;
  const r = Math.floor(rand() * (L + 2));
  return Math.max(0, r - 1) + 1;
}

/**
 * What a red or blue amethyst block drops when it's broken. `tool` is undefined when nothing held broke it (a blast,
 * its support gone), else { creative, pickaxe, silk, fortune } of the breaking player's held item. Returns
 * [{ item, count }] (empty for nothing).
 */
export function dropsOf(typeId, tool, rand) {
  const a = amethystOf(typeId);
  if (!a || tool?.creative) return [];
  const s = AMETHYST[a.colour];
  if (tool?.silk) return []; // the game drops it itself (silkTakesBack)
  if (a.part === "budding") return [];
  if (a.part === "block") return !tool || tool.pickaxe ? [{ item: s.block, count: 1 }] : [];
  if (a.stage < 3) return [];
  if (tool?.pickaxe) return [{ item: s.shard, count: 4 * fortuneTimes(tool.fortune, rand) }];
  return [{ item: s.shard, count: 2 }];
}

/**
 * Whether the item the game itself dropped to Silk Touch (any custom block drops as itself to it) must be taken back,
 * because the game's own amethyst drops nothing there: budding amethyst, and the block to a tool that isn't a pickaxe.
 */
export function silkTakesBack(typeId, tool) {
  const a = amethystOf(typeId);
  if (!a || !tool?.silk || tool.creative) return false;
  return a.part === "budding" || (a.part === "block" && !tool.pickaxe);
}
