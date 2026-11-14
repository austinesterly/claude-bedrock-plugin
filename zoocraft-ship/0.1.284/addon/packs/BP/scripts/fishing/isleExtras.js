// The exotic islands' mist and the Gilded Sea Chart (0.1.284): the game side of fishing/chartRules.js.
import { world } from "@minecraft/server";
import { FISHING, skyIslandAt, skyMythicNear } from "./islandRules.js";
import { worldSeed } from "./islands.js";
import { isleFogCommands, chartLine } from "./chartRules.js";

/** player id -> whether the mist is on (null at first: not known, so one left from before is cleared) */
const fogOn = new Map();

/** Every 10 ticks: the mist for each player standing on (or over) an exotic island in the fishing sky. */
export function tickIsleFog() {
  const seen = new Set();
  for (const p of world.getAllPlayers()) {
    try {
      seen.add(p.id);
      const want = p.dimension.id === FISHING && skyIslandAt(worldSeed(), p.location.x, p.location.z)?.kind === "exotic";
      const cmds = isleFogCommands(fogOn.has(p.id) ? fogOn.get(p.id) : null, want);
      for (const c of cmds) {
        try {
          p.runCommand(c);
        } catch {
          // a remove with nothing to remove can fail; the push after it still runs
        }
      }
      fogOn.set(p.id, want);
    } catch {
      // left, or between dimensions: next time
    }
  }
  for (const id of [...fogOn.keys()]) if (!seen.has(id)) fogOn.delete(id);
}

/** The chart's custom component (zoocraft:sea_chart): use it to read where the Shark People's town is. */
export function chartComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseEvent} e */
    onUse(e) {
      const player = e.source;
      if (!player) return;
      try {
        const inSky = player.dimension.id === FISHING;
        const from = inSky ? player.location : { x: 0, z: 0 };
        const town = skyMythicNear(worldSeed(), from.x, from.z);
        player.sendMessage(chartLine(from, town, inSky));
        player.playSound("item.book.page_turn", { volume: 1, pitch: 0.9 });
      } catch {
        // gone
      }
    },
  };
}
