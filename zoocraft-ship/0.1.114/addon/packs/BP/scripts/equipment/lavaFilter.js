import { system, ItemStack, GameMode, BlockPermutation } from "@minecraft/server";
import { BLOCKS, ITEMS, isClearLava } from "../data/items.js";
import { heldItem, setHeldItem, giveItem, message } from "../platform/mc.js";
import { cellsAlong } from "../animals/glide.js";
import { runLater, runTimeoutLater } from "../park/park.js";

// Clear Lava (Austin, 0.1.47): lava you can see through, so Lava Rays can be watched under the
// surface. A lava bucket used on a Lava Filter comes back as a Clear Lava Bucket. Bedrock add-ons
// can't add liquids, so Clear Lava is a block that can't be walked on, aimed at or mined: a Clear
// Lava Bucket pours a source, which flows like lava (equipment/clearLavaFlow.js, 0.1.49), and an
// empty bucket scoops a source up again. animals/lavaSwim.js makes it burn and lets rays swim in it.

const WORK_TICKS = 30; // the filter's window glows this long after filtering

// --- Lava Filter: a lava bucket in, a Clear Lava Bucket out ---
export function lavaFilterComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player) return;
      const stack = heldItem(player);
      if (stack?.typeId !== "minecraft:lava_bucket") {
        const hint = stack?.typeId === ITEMS.clearLavaBucket ? " This bucket is already filtered." : "";
        return message(player, `§6Lava Filter: §fuse a lava bucket on it to filter the lava into Clear Lava, which you can see through.${hint} §7Lava Rays swim in it; it burns and flows like lava.`);
      }
      setHeldItem(player, new ItemStack(ITEMS.clearLavaBucket, 1));
      try {
        block.setPermutation(block.permutation.withState("zoocraft:working", true));
        const where = { dimension: block.dimension, pos: block.location };
        runTimeoutLater(() => {
          try {
            const b = where.dimension.getBlock(where.pos);
            if (b?.typeId === BLOCKS.lavaFilter) b.setPermutation(b.permutation.withState("zoocraft:working", false));
          } catch {
            // unloaded meanwhile
          }
        }, WORK_TICKS);
      } catch {
        // the glow is only for show
      }
      message(player, "§aFiltered: a Clear Lava Bucket. §7Pour it into a lava pool to see the Lava Rays under the surface.");
    },
  };
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function offset(pos, face) {
  const f = String(face).toLowerCase();
  const d = { up: [0, 1, 0], down: [0, -1, 0], north: [0, 0, -1], south: [0, 0, 1], west: [-1, 0, 0], east: [1, 0, 0] }[f] ?? [0, 1, 0];
  return { x: pos.x + d[0], y: pos.y + d[1], z: pos.z + d[2] };
}

// --- Clear Lava Bucket: pour a Clear Lava source where it's aimed ---
// Clear Lava can't be aimed at, so pointing into a pool hits the floor or wall behind it: the source
// goes in the first space from there up that isn't already a source (open, or flowing Clear Lava,
// like a lava bucket poured into flowing lava), so a pool fills layer by layer.
let sourcePerm;
export function clearLavaBucketComponent(changed) {
  return {
    onUseOn(e) {
      const player = e.source;
      const dimension = e.block.dimension;
      let pos = offset(e.block.location, e.blockFace);
      runLater(() => {
        for (let i = 0; i < 4; i++) {
          const b = dimension.getBlock(pos);
          if (!b) return;
          if (b.typeId === BLOCKS.clearLava && !b.permutation.getState("zoocraft:falling")) {
            pos = { x: pos.x, y: pos.y + 1, z: pos.z };
            continue;
          }
          if (!b.isAir && !isClearLava(b.typeId)) return message(player, "§eThere's no room for the Clear Lava there.");
          sourcePerm ??= BlockPermutation.resolve(BLOCKS.clearLava, { "zoocraft:falling": false });
          b.setPermutation(sourcePerm);
          if (!creative(player)) setHeldItem(player, new ItemStack("minecraft:bucket", 1));
          changed(dimension.id, pos);
          return;
        }
      });
    },
  };
}

// --- An empty bucket scoops up the Clear Lava source it's pointed at ---
// Like a bucket in real lava, it reaches through flowing lava and falls to the source behind them.
const lastScoop = new Map();
export function scoopClearLava(player, changed) {
  const last = lastScoop.get(player.id) ?? -100;
  if (system.currentTick - last < 5) return true; // one scoop per click (use and use-on both arrive)
  const d = player.dimension;
  for (const c of cellsAlong(player.getHeadLocation(), player.getViewDirection(), 5.5)) {
    let b;
    try {
      b = d.getBlock(c);
    } catch {
      return false;
    }
    if (!b) return false;
    if (isClearLava(b.typeId) && (b.typeId !== BLOCKS.clearLava || b.permutation.getState("zoocraft:falling"))) continue;
    if (b.typeId === BLOCKS.clearLava) {
      lastScoop.set(player.id, system.currentTick);
      runLater(() => {
        const stack = heldItem(player);
        const here = d.getBlock(c);
        if (stack?.typeId !== "minecraft:bucket" || here?.typeId !== BLOCKS.clearLava || here.permutation.getState("zoocraft:falling")) return;
        d.getBlock(c)?.setType("minecraft:air");
        if (creative(player)) giveItem(player, ITEMS.clearLavaBucket, 1);
        else if (stack.amount > 1) {
          stack.amount -= 1;
          setHeldItem(player, stack);
          giveItem(player, ITEMS.clearLavaBucket, 1);
        } else setHeldItem(player, new ItemStack(ITEMS.clearLavaBucket, 1));
        changed(d.id, c);
      });
      return true;
    }
    if (!b.isAir) return false; // the first thing in the way isn't Clear Lava
  }
  return false;
}
