// A place to stand in an Exotic Formation hall (0.1.240; first written for the Midnight Owls, 0.1.238): one column
// of the hall read from the top down for a solid block with air over it. Goo, plants and liquids are not floor.
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { perchIn } from "./midnightOwlRules.js";

const kinds = new Map(); // block id -> "solid" or "other"

function kindOf(block) {
  if (block.isAir) return "air";
  if (block.isLiquid) return "other";
  const id = block.typeId;
  let k = kinds.get(id);
  if (!k) {
    k = PASSABLE_PATTERNS.some((r) => r.test(id)) ? "other" : "solid";
    kinds.set(id, k);
  }
  return k;
}

/**
 * The height to stand at in the column of `spot` ({ x, z }) of hall `f`: over the first solid block, reading down
 * `M.depth` blocks from `M.top` over the hall's floor, that has `M.room` blocks of air over it. undefined if none.
 */
export function hallFloor(d, f, spot, M) {
  const range = d.heightRange;
  const top = Math.min(range.max - 1, f.y + M.top);
  const column = [];
  for (let i = 0; i <= M.depth && top - i >= range.min; i++) {
    const b = d.getBlock({ x: spot.x, y: top - i, z: spot.z });
    if (!b) break;
    column.push(kindOf(b));
  }
  const i = perchIn(column, M);
  return i < 0 ? undefined : top - i + 1;
}
