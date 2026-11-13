// Diamond Shards (0.1.276): the crystals lying about the fishing sky's exotic islands. Austin, 12 Nov 18:45Z: "diamond
// shards sprinkled around as well. 9 Diamond shards can create a diamond". The block (Diamond Shards) is the game's
// large amethyst bud in the game's diamond colours, and acts as the game's amethyst buds and clusters do:
// - it drops one Diamond Shard broken any way; to a pickaxe, Fortune multiplies it as the game's ores (I a third of the
//   time x2; II a quarter each x2, x3; III a fifth each x2, x3, x4); nothing in creative; itself to Silk Touch (the
//   game does that for any custom block);
// - it pops off, dropping its shard, when the block it grows from is broken or blown up, and a piston pops it (nothing
//   drops);
// - nine Diamond Shards craft a diamond (BP recipe zoocraft:diamond_from_shards).
// Pure, so the tests can run it; fishing/diamonds.js is the game side.
import { fortuneTimes } from "./amethystRules.js";

export const SHARDS_BLOCK = "zoocraft:diamond_shards";
export const SHARD = "zoocraft:diamond_shard";
/** Diamond Shards to a diamond. */
export const PER_DIAMOND = 9;

/**
 * What Diamond Shards drop when broken: `tool` undefined when nothing held broke them (a blast, the block under them
 * gone), else { creative, pickaxe, silk, fortune } of the breaking player's held item. Returns [{ item, count }].
 */
export function shardDrops(tool, rand) {
  if (tool?.creative || tool?.silk) return [];
  return [{ item: SHARD, count: tool?.pickaxe ? fortuneTimes(tool.fortune, rand) : 1 }];
}
