// Jellyfish in the game (0.1.127; research/trench_plan.md, trench_facts.md §9): harmless drifting schools. Swim close to
// one and it flashes a ring of light round its bell, as the deep sea's Atolla jelly does when something bumps it (its
// "burglar alarm"): zoocraft:flash sets zoocraft:flashing, and the entity's own zoocraft:flashing timer ends it (the
// entity flashes now and then by itself too, its zoocraft:drifting timer).
import { onlinePlayers, entitiesNear } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";

const TYPES = Object.values(SPECIES)
  .filter((s) => s.flashes)
  .flatMap((s) => [s.entityType, s.wildSource]);

// Every 10 ticks: each jellyfish someone is within BALANCE.jelly.bumpRange of flashes, unless it is flashing already.
export function tickJellies() {
  if (!TYPES.length) return;
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, BALANCE.jelly.bumpRange, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      try {
        if (e.getProperty("zoocraft:flashing") !== true) e.triggerEvent("zoocraft:flash");
      } catch {
        // gone
      }
    }
  }
}
