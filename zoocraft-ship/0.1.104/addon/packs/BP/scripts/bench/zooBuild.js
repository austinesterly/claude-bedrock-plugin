import { BALANCE } from "../data/balance.js";
import { log } from "../core/log.js";
import { getPark } from "../park/park.js";
import { fenceSummary } from "../park/fence.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { runBuild, groundY, unresolved } from "./benchmark.js";
import { planZoo, ZOO_RATIONS } from "./parkPlan.js";
import { zooBuiltText, ZOO_SIZE } from "./zooPlan.js";

// /zoocraft:build [size] (0.1.104, Austin: "can you make a zoocrsft build command with the aluminum fences and a
// 100 x 100 zoo so I can test easier", then "Make an exhibit for all of our current species in it, and make sure the
// animals are in it as well"): a test zoo in one go, on flat ground. If the world has no park, it claims one where
// the player stands (they're the owner, as with the Park Deed); a park already claimed but still empty is built
// round its spot. Then it builds what the benchmark builds (bench/benchmark.js), from the plan bench/parkPlan.js
// planZoo makes: an exhibit for every species with its animals in it, paths, Viewing Points, guest services, 5 Staff
// Rooms with keepers, and round it all an Aluminum Fence `size` columns a side (100 unless told, more when the
// exhibits need it) with a gate in the middle of the north, east and west sides and the Park Entrance Gate in the
// middle of the south side; the park's area comes from that fence, and the park opens.

const AREA = "zoocraft_zoo";

const ZOO_MODE = {
  tag: "Zoo",
  bench: false,
  area: AREA,
  rations: ZOO_RATIONS,
  keepers: BALANCE.benchmark.keepers, // as many as the Staff Rooms and the park's own cap allow
  starting: (plan) => `§6Zoo: §fbuilding ${plan.exhibits.length} exhibits inside a ${plan.size} x ${plan.size} Aluminum Fence round the Park Deed's spot${plan.asked < plan.size ? ` (${plan.asked} x ${plan.asked} wouldn't hold them)` : ""}. Stay where you are.`,
  done: (plan, c) => zooBuiltText(plan, c, plan.center, fenceSummary()),
};

/** Start building the test zoo round the player (or the park's spot). Returns why it can't, or undefined once started. */
export function startZooBuild(player, size = ZOO_SIZE.default) {
  if (!(size >= ZOO_SIZE.min && size <= ZOO_SIZE.max)) return `size must be ${ZOO_SIZE.min} to ${ZOO_SIZE.max}`;
  const park = getPark();
  if (park?.benchmark) return "This world holds the benchmark park. Make a new Superflat world (Creative, cheats on) and run it there.";
  if (park && allExhibits().length) return "This park already has exhibits. The test zoo needs an empty park: make a new Superflat world (Creative, cheats on) and run it there.";
  if (park && park.dimension !== player.dimension.id) return "The park is in another dimension: run it there.";
  if (player.dimension.id !== "minecraft:overworld") return "Run it in the Overworld.";
  const G = groundY(player);
  const center = park ? { x: park.center.x, z: park.center.z } : { x: Math.floor(player.location.x), z: Math.floor(player.location.z) };
  const plan = { ...planZoo(center, G, size), center };
  const bad = unresolved(plan);
  if (bad) {
    log(`zoo: ${bad}`);
    return `The zoo can't build: ${bad}. Nothing was changed.`;
  }
  return runBuild(player, plan, G, ZOO_MODE);
}
