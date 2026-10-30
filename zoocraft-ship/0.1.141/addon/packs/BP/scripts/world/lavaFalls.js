// The Lava Falls' springs in the game (0.1.141; the rules are world/lavaFallRules.js). A spring block (made with the
// world, looking like netherrack) ticks once its chunk runs: it finds its open side and what its lava would fall into,
// and becomes lava (a fall) or netherrack. Lava a script sets doesn't flow until a block next to it changes (Mojang's
// server 1.26.60: still after minutes; flowing at once after a neighbour changed), so the open side is set to
// netherrack and back to air in the same tick, which starts the fall. Its tick loops, so a spring whose open side or
// fall is in a chunk not loaded yet tries again later.
import { OPEN_SIDES, MAX_DROP, springFate } from "./lavaFallRules.js";

/** @param {import("@minecraft/server").Block} block */
function springTick(block) {
  const d = block.dimension;
  const { x, y, z } = block.location;
  let open;
  for (const o of OPEN_SIDES) {
    const b = d.getBlock({ x: x + o.x, y: y + o.y, z: z + o.z });
    if (!b) return; // not loaded yet
    if (b.isAir) {
      open = b;
      break;
    }
  }
  if (!open) {
    block.setType("minecraft:netherrack");
    return;
  }
  let land;
  let drop = 0;
  for (let yy = open.location.y - 1; yy > d.heightRange.min && drop < MAX_DROP; yy--, drop++) {
    const b = d.getBlock({ x: open.location.x, y: yy, z: open.location.z });
    if (!b) return;
    if (!b.isAir) {
      land = b.typeId;
      break;
    }
  }
  if (springFate(land, drop) === "netherrack") {
    block.setType("minecraft:netherrack");
    return;
  }
  block.setType("minecraft:lava");
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
