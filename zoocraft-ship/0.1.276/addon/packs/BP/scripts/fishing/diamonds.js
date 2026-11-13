// Diamond Shards in the game (0.1.276; the rules are fishing/diamondRules.js): their drops (the loot table is empty,
// because "Fortune with a pickaxe" can't be written in a custom block's loot table), and popping off when the block
// they grow from goes, as the game's amethyst buds do (done here, as for red and blue amethyst: on the test server a
// placement filter never popped one).
import { world } from "@minecraft/server";
import { reportError } from "../core/log.js";
import { toolOf, spawnDrops } from "./amethyst.js";
import { STEP, FACE_STATE, growsFrom } from "./amethystRules.js";
import { SHARDS_BLOCK, shardDrops } from "./diamondRules.js";

/** Diamond Shards round a block that's gone which grew from it pop off: broken as a block is, dropping their shard. */
function popLoose(dimension, at) {
  for (const [dx, dy, dz] of Object.values(STEP)) {
    const p = { x: at.x + dx, y: at.y + dy, z: at.z + dz };
    let b;
    try {
      b = dimension.getBlock(p);
    } catch {
      continue; // not loaded
    }
    if (b?.typeId !== SHARDS_BLOCK) continue;
    let f;
    try {
      f = b.permutation.getState(/** @type {any} */ (FACE_STATE));
    } catch {
      f = undefined;
    }
    if (!growsFrom(String(f), [-dx, -dy, -dz])) continue;
    const wet = b.isWaterlogged;
    try {
      dimension.runCommand(`setblock ${p.x} ${p.y} ${p.z} ${wet ? "water" : "air"} destroy`);
    } catch (error) {
      reportError("diamond shards pop", error);
      continue;
    }
    spawnDrops(dimension, p, shardDrops(undefined, Math.random));
  }
}

/** Diamond Shards pop off when the block they grow from is broken by a player or blown up; blown up, they drop theirs. */
export function wireDiamonds() {
  world.afterEvents.playerBreakBlock.subscribe((e) => popLoose(e.dimension, e.block.location));
  world.afterEvents.blockExplode.subscribe((e) => {
    if (e.explodedBlockPermutation.type.id === SHARDS_BLOCK) spawnDrops(e.dimension, e.block.location, shardDrops(undefined, Math.random));
    popLoose(e.dimension, e.block.location);
  });
}

/** The Diamond Shards block's custom component (zoocraft:diamond_shards): its drop to the player who breaks it. */
export function diamondShardsComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentPlayerBreakEvent} e */
    onPlayerBreak(e) {
      if (!e.player) return;
      spawnDrops(e.dimension, e.block.location, shardDrops(toolOf(e.player), Math.random));
    },
  };
}
