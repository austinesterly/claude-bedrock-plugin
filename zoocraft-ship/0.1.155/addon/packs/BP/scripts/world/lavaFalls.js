// The Lava Falls' springs in the game (0.1.141, 0.1.155; the rules are world/lavaFallRules.js). A spring block (made
// with the world, looking like netherrack) ticks once its chunk runs: it reads where its lava would fall and becomes
// lava (a fall, into the lava sea or into a pool it lets into the ground first) or netherrack. Lava a script sets
// doesn't flow until a block next to it changes (Mojang's server 1.26.60: still after minutes; flowing at once after a
// neighbour changed), so the pool's lava lies still and the spring's open side is set to netherrack and back to air,
// which starts the fall. Its tick loops, so a spring whose fall or pool is in a chunk not loaded yet tries again later.
import { springPlan } from "./lavaFallRules.js";

/** @param {import("@minecraft/server").Block} block */
function springTick(block) {
  const d = block.dimension;
  const { min, max } = d.heightRange;
  /** @param {number} x @param {number} y @param {number} z */
  const get = (x, y, z) => {
    if (y < min || y >= max) return "minecraft:bedrock";
    return d.getBlock({ x, y, z })?.typeId;
  };
  const plan = springPlan(block.location, get, Math.random);
  if (plan.kind === "wait") return;
  if (plan.kind === "rock") {
    block.setType("minecraft:netherrack");
    return;
  }
  for (const a of plan.air) d.getBlock(a)?.setType("minecraft:air");
  for (const m of plan.magma) d.getBlock(m)?.setType("minecraft:magma");
  for (const l of plan.lava) d.getBlock(l)?.setType("minecraft:lava");
  block.setType("minecraft:lava");
  const open = d.getBlock(plan.touch);
  if (!open) return;
  open.setType("minecraft:netherrack");
  open.setType("minecraft:air");
}

export function lavaSpringComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentTickEvent} e */
    onTick(e) {
      try {
        springTick(e.block);
      } catch {
        // out of the world or unloaded mid-way: the tick loops, so it tries again
      }
    },
  };
}
