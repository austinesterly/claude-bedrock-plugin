// The fishing sky's fish in their ponds (0.1.289), in the game; the rules are fishing/pondFishRules.js. Every 5 seconds,
// for each built island a player is on: its pond is found (once: from the island's plan, or from its shape worked out
// in a job and kept on the island's record), and if fewer than two of its fish swim there and none were put in today,
// the missing ones are put into its water.
import { world, system } from "@minecraft/server";
import { log } from "../core/log.js";
import { FISHING, skyIslandAt, newShape, shapeSteps } from "./islandRules.js";
import { worldSeed, fishingDimension, islandRecord, noteIsland } from "./islands.js";
import { POND_FISH, POND_P, pondFishId, pondOfPlan, pondOfShape, pondSpots, fishDue } from "./pondFishRules.js";

const ponds = new Map(); // island id -> { x, z, r, top } | null (none) | "working"
const isWater = (id) => id === "minecraft:water" || id === "minecraft:flowing_water";

function pondOf(isl) {
  const had = ponds.get(isl.id);
  if (had !== undefined) return had === "working" ? undefined : had ?? undefined;
  const rec = islandRecord(isl);
  let pond = rec?.pond === null ? null : rec?.pond ?? pondOfPlan(isl);
  if (pond !== undefined) {
    ponds.set(isl.id, pond);
    return pond ?? undefined;
  }
  // its shape, a step at a time
  ponds.set(isl.id, "working");
  const sh = newShape(isl);
  system.runJob(
    (function* () {
      try {
        yield* shapeSteps(isl, sh);
        pond = pondOfShape(isl, sh) ?? null;
        ponds.set(isl.id, pond);
        noteIsland(isl, { pond });
      } catch (error) {
        ponds.set(isl.id, null);
        log(`pond fish: island ${isl.id}'s pond couldn't be found: ${error}`);
      }
    })(),
  );
  return undefined;
}

/** The water at x z: a place a block under its surface (or in it, one deep), looking down from `top`; undefined if none. */
function waterAt(d, x, z, top) {
  for (let y = top; y > top - 24; y--) {
    const b = d.getBlock({ x, y, z });
    if (!b) return undefined;
    if (!isWater(b.typeId)) continue;
    const under = d.getBlock({ x, y: y - 1, z });
    return { x, y: isWater(under?.typeId) ? y - 0.8 : y + 0.2, z };
  }
  return undefined;
}

function tend(d, isl, today) {
  const type = pondFishId(isl.kind);
  const rec = islandRecord(isl);
  if (!type || rec?.state !== "built") return;
  const pond = pondOf(isl);
  if (!pond) return;
  for (const [dx, dz] of [[0, 0], [-16, -16], [16, -16], [-16, 16], [16, 16]]) {
    if (!d.isChunkLoaded({ x: pond.x + dx, y: 0, z: pond.z + dz })) return;
  }
  let swimming = 0;
  for (const e of d.getEntities({ type, location: { x: pond.x, y: pond.top, z: pond.z }, maxDistance: isl.r * 1.3 + 24 })) {
    try {
      if (e.getDynamicProperty(POND_P) === isl.id) swimming++;
    } catch {
      // gone
    }
  }
  let due = fishDue(swimming, rec.fishDay, today);
  if (!due) return;
  let put = 0;
  for (const s of pondSpots(pond)) {
    if (!due) break;
    const at = waterAt(d, s.x, s.z, pond.top);
    if (!at) continue;
    try {
      const e = d.spawnEntity(type, at, { initialPersistence: true, initialRotation: (put * 137) % 360 });
      e.setDynamicProperty(POND_P, isl.id);
      put++;
      due--;
    } catch (error) {
      log(`pond fish: island ${isl.id}: couldn't put a fish in: ${error}`);
      break;
    }
  }
  if (put) {
    noteIsland(isl, { fishDay: today });
    log(`pond fish: island ${isl.id} (${isl.kind}): ${put} put into its pond (${swimming} were there)`);
  }
}

export function tickPondFish() {
  const d = fishingDimension();
  if (!d) return;
  const today = world.getDay();
  const done = new Set();
  for (const p of world.getAllPlayers()) {
    let here;
    try {
      if (p.dimension.id !== FISHING) continue;
      here = skyIslandAt(worldSeed(), p.location.x, p.location.z);
    } catch {
      continue;
    }
    if (!here || done.has(here.id)) continue;
    done.add(here.id);
    try {
      tend(d, here, today);
    } catch (error) {
      log(`pond fish: island ${here.id}: ${error}`);
    }
  }
}

/** For the test server: an island's pond and the fish swimming at it. */
export function pondFishDebug(isl) {
  const d = fishingDimension();
  const pond = pondOf(isl);
  const type = pondFishId(isl.kind);
  const fish = pond && type && d ? d.getEntities({ type, location: { x: pond.x, y: pond.top, z: pond.z }, maxDistance: isl.r * 1.3 + 24 }) : [];
  return { type, pond, want: POND_FISH, day: islandRecord(isl)?.fishDay, fish: fish.map((e) => ({ at: [e.location.x, e.location.y, e.location.z].map((v) => Math.round(v * 10) / 10), mine: e.getDynamicProperty(POND_P) === isl.id, wet: e.isInWater })) };
}
