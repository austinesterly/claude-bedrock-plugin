// A mythic town built before 0.1.285, raised again as the bigger town (0.1.285): Austin, 14 Nov, "the village needs to be
// much more detailed ... If we have to make it bigger to do that, that is fine". An island is built once, so a town
// that stands already would stay the small one. /zoocraft:mythic true calls this for such a town: its people are
// taken away, the island's whole box is cleared to air (never as far as another island: reachOf keeps them apart),
// and it is built again from the rules as they are now. Whatever a player built on that island goes with it.
// Players on the island wait on a glass step high over it while that happens, and are set down on the new plaza.
import { system, BlockVolume } from "@minecraft/server";
import { withLoaded, forgetIsland, ensureIsland } from "./islands.js";
import { clearTown } from "./town.js";
import { cityOf } from "./islandRules.js";
import { log } from "../core/log.js";

/** How far out from the island's middle the clearing goes: past its beach and the rocks floating by it. */
export const clearReach = (isl) => Math.ceil(isl.r * 1.15) + 12;

const ticks = (n) => new Promise((resolve) => system.runTimeout(() => resolve(undefined), n));

/**
 * One pass over the island's box, a column of 16 by 16 and 120 high at a time (a fill takes 32,768 blocks at most):
 * everything in it to air. Resolves with [blocks cleared, fills that failed].
 */
function sweep(d, isl, R, lo, hi) {
  return new Promise((resolve, reject) => {
    system.runJob(
      (function* () {
        let n = 0;
        let failed = 0;
        try {
          for (let x0 = isl.x - R; x0 <= isl.x + R; x0 += 16) {
            for (let z0 = isl.z - R; z0 <= isl.z + R; z0 += 16) {
              for (let y0 = lo; y0 <= hi; y0 += 120) {
                const to = { x: Math.min(x0 + 15, isl.x + R), y: Math.min(y0 + 119, hi), z: Math.min(z0 + 15, isl.z + R) };
                try {
                  n += d.fillBlocks(new BlockVolume({ x: x0, y: y0, z: z0 }, to), "minecraft:air", { blockFilter: { excludeTypes: ["minecraft:air"] } }).getCapacity();
                } catch {
                  failed++;
                }
              }
              yield;
            }
          }
          resolve([n, failed]);
        } catch (error) {
          reject(error);
        }
      })(),
    );
  });
}

/** Clears the island and builds it again. Resolves with how many blocks were cleared. */
export async function rebuildTown(isl) {
  const R = clearReach(isl);
  const c = cityOf(isl);
  /** @type {any[]} */
  const waiting = [];
  let cleared = 0;
  let stepY = 0;
  await withLoaded("zoocraft_rebuild", { x: isl.x - R, z: isl.z - R }, { x: isl.x + R, z: isl.z + R }, async (d) => {
    clearTown(d, isl);
    const hr = d.heightRange;
    const lo = Math.max(hr.min, isl.y - 96);
    const hi = Math.min(hr.max - 3, isl.y + 72);
    // nobody falls with the ground: players on the island stand on a glass step over it meanwhile
    stepY = hi + 1;
    d.fillBlocks(new BlockVolume({ x: isl.x - 1, y: stepY, z: isl.z - 1 }, { x: isl.x + 1, y: stepY, z: isl.z + 1 }), "minecraft:glass");
    for (const p of d.getPlayers()) {
      if (Math.abs(p.location.x - isl.x) > R + 8 || Math.abs(p.location.z - isl.z) > R + 8) continue;
      p.teleport({ x: isl.x + 0.5, y: stepY + 1, z: isl.z + 0.5 }, { dimension: d });
      waiting.push(p);
    }
    // twice, and again while anything is left: the lagoon's water runs into the columns already cleared
    let failed = 0;
    for (let pass = 0; pass < 6; pass++) {
      const [n, f] = await sweep(d, isl, R, lo, hi);
      cleared += n;
      failed = f;
      if (pass > 0 && n === 0) break;
      await ticks(30);
    }
    if (failed) throw new Error(`${failed} parts of the island could not be cleared`);
    log(`fishing sky: island ${isl.id} cleared for its rebuild, ${cleared} blocks`);
    // what fell out of the chests and off the walls
    for (const e of d.getEntities({ type: "minecraft:item", location: { x: isl.x, y: isl.y, z: isl.z }, maxDistance: R * 1.5 + 100 })) {
      try {
        e.remove();
      } catch {
        // gone
      }
    }
  });
  forgetIsland(isl);
  await ensureIsland(isl, true);
  // down onto the new plaza, facing the gate, and the glass step away
  await withLoaded("zoocraft_rebuild", { x: isl.x - 8, z: isl.z - 8 }, { x: isl.x + 8, z: isl.z + 8 }, async (d) => {
    for (const p of waiting) {
      try {
        p.teleport({ x: c.plaza.x + 0.5, y: c.G + 1, z: c.plaza.z + 0.5 }, { dimension: d, rotation: { x: 0, y: (Math.atan2(c.gx, -c.gz) * 180) / Math.PI } });
      } catch {
        // left the game
      }
    }
    d.fillBlocks(new BlockVolume({ x: isl.x - 1, y: stepY, z: isl.z - 1 }, { x: isl.x + 1, y: stepY, z: isl.z + 1 }), "minecraft:air");
  });
  return cleared;
}
