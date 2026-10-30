// The Mythical Glade's springs in the game (0.1.148; the rules are world/gladeFallRules.js). A spring block (made with
// the world, looking like stone) ticks once its chunk runs: it finds its open side and how far its water would fall,
// and becomes water (a waterfall) or the ground round it. Water a script sets doesn't flow until a block next to it
// changes (as the Lava Falls' lava, 0.1.141), so the open side is set to stone and back to air in the same tick, which
// starts the fall. Its tick loops, so a spring whose open side or fall is in a chunk not loaded yet tries again later.
import { OPEN_SIDES, MAX_DROP, springFate, rockFor } from "./gladeFallRules.js";

/** @param {import("@minecraft/server").Block} block */
function springTick(block) {
  const d = block.dimension;
  const { x, y, z } = block.location;
  const above = d.getBlock({ x, y: y + 1, z });
  if (!above) return; // not loaded yet
  let open;
  for (const o of OPEN_SIDES) {
    const b = d.getBlock({ x: x + o.x, y, z: z + o.z });
    if (!b) return;
    if (b.isAir) {
      open = b;
      break;
    }
  }
  if (!open) {
    block.setType(rockFor(above.typeId));
    return;
  }
  let land;
  let drop = 0;
  for (let yy = y - 1; yy > d.heightRange.min && drop < MAX_DROP; yy--, drop++) {
    const b = d.getBlock({ x: open.location.x, y: yy, z: open.location.z });
    if (!b) return;
    if (!b.isAir) {
      land = b.typeId;
      break;
    }
  }
  if (springFate(land, drop) === "rock") {
    block.setType(rockFor(above.typeId));
    return;
  }
  block.setType("minecraft:water");
  open.setType("minecraft:stone");
  open.setType("minecraft:air");
}

export function gladeSpringComponent() {
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
