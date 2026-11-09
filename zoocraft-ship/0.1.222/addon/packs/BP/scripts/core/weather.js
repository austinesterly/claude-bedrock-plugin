// The Overworld's weather (0.1.222, residents stage B: research/npc_spec_plan.md section 2, point 8). @minecraft/server
// 2.10.0 can set the weather and tells of each change (world.afterEvents.weatherChange), but has no call that reads it,
// so each change is remembered as it happens, in a world property that lasts through reloads. A world that has never
// changed counts as clear; one the crocodiles saw rain in (animals/croc.js keeps "zoocraft:rain") starts as rain.

import { world } from "@minecraft/server";

const KEY = "zoocraft:weather";
const KINDS = new Set(["Clear", "Rain", "Thunder"]);
let now = "Clear";

/** "Clear", "Rain" or "Thunder": the Overworld's weather as last heard. */
export function weatherNow() {
  return now;
}

export function initWeather() {
  try {
    const kept = world.getDynamicProperty(KEY);
    if (typeof kept === "string" && KINDS.has(kept)) now = kept;
    else if (world.getDynamicProperty("zoocraft:rain") === true) now = "Rain";
  } catch {
    // clear
  }
  world.afterEvents.weatherChange.subscribe((ev) => {
    if (ev.dimension !== "minecraft:overworld" && ev.dimension !== "overworld") return;
    now = KINDS.has(ev.newWeather) ? ev.newWeather : "Clear";
    try {
      world.setDynamicProperty(KEY, now);
    } catch {
      // kept for this session
    }
  });
}
