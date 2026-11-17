// The Deep Trench's dark caves (0.1.313; rules in trenchCaveRules.js). While a player dives in the Deep Trench, the
// chunks round them that are due a cave get it: looked at first (only natural rock and water may be there: nothing
// anyone built is ever touched, and nothing inside a zoo), sealed (air and lava round it turned to deepslate), then
// filled with water. A chunk is done once and recorded, so old trenches get their caves the first time someone dives
// there and new ones as they are found. Goblin Sharks and Anglerfish spawn in the dark of them.
import { system, BlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { onlinePlayers } from "../platform/mc.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { log } from "../core/log.js";
import { parkAt } from "../park/park.js";
import { regionOf, hasBit, withBit, EMPTY_BITS, chunksAround, CARVED, SEALED } from "./trenchRules.js";
import { hasCave, caveBoxes, caveMouth, floorFits, shellOf } from "./trenchCaveRules.js";

const COL = "trenchcave";
const OVERWORLD = "minecraft:overworld";
const WATERY = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:kelp", "minecraft:seagrass", "minecraft:sea_pickle", "minecraft:glow_lichen", "minecraft:bubble_column"]);
// what a cave may be cut through or stand beside: the trench's own rock, water and floor life
const NATURAL = new Set([...CARVED, "minecraft:water", "minecraft:sea_lantern"]);
const GLOWING = ["minecraft:glow_lichen", "minecraft:sea_lantern", "minecraft:magma", "minecraft:amethyst_cluster", "minecraft:large_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:small_amethyst_bud", "minecraft:sea_pickle", "minecraft:sculk_vein"];
const OPEN = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:kelp", "minecraft:seagrass", "minecraft:bubble_column"]);
const seen = new Set(); // "cx,cz" settled this session
const queued = new Set();
const failures = new Map();
const count = { made: 0, none: 0, kept: 0 }; // for the test server
const jobs = jobQueue((gen) => system.runJob(timedJob("trenchcave", gen)), (error) => log(`trench caves: a chunk failed: ${error}`));
const key = (cx, cz) => `${cx},${cz}`;

function recorded(cx, cz) {
  const r = regionOf(cx, cz);
  const rec = db.get(COL, r.id);
  return Boolean(rec && hasBit(rec.bits, r.bit));
}

function record(cx, cz) {
  const r = regionOf(cx, cz);
  const rec = db.get(COL, r.id) ?? { id: r.id, bits: EMPTY_BITS };
  rec.bits = withBit(rec.bits, r.bit);
  db.put(COL, rec);
}

/** Every 40 ticks (main.js): the chunks round each player diving in the Deep Trench that are due a cave are queued. */
export function tickTrenchCaves() {
  const C = BALANCE.trench.caves;
  if (seen.size > 20000) seen.clear();
  for (const player of onlinePlayers()) {
    let dimension;
    let loc;
    try {
      dimension = player.dimension;
      loc = player.location;
      if (dimension.id !== OVERWORLD || loc.y > C.diveBelow) continue;
      if (dimension.getBiome(loc)?.id !== BALANCE.trench.biome) continue;
    } catch {
      continue;
    }
    const pcx = Math.floor(loc.x) >> 4;
    const pcz = Math.floor(loc.z) >> 4;
    for (const { cx, cz } of chunksAround(pcx, pcz, C.radius)) {
      const k = key(cx, cz);
      if (seen.has(k) || queued.has(k)) continue;
      if (!hasCave(cx, cz, C) || recorded(cx, cz)) {
        seen.add(k);
        continue;
      }
      if (jobs.waiting >= C.maxQueued) return;
      queued.add(k);
      jobs.push(caveJob(dimension, cx, cz, C));
    }
  }
}

function* caveJob(dimension, cx, cz, C) {
  const k = key(cx, cz);
  try {
    const result = yield* caveChunk(dimension, cx, cz, C);
    count[result]++;
    if (result !== "none") record(cx, cz); // made, or kept as it is for good (something built there)
    seen.add(k);
  } catch (error) {
    const n = (failures.get(k) ?? 0) + 1;
    failures.set(k, n);
    if (n >= 3) seen.add(k);
  } finally {
    queued.delete(k);
  }
}

/**
 * Chunk (cx, cz)'s cave. Returns "made"; "none" when there is no deep trench floor at its mouth (looked at again
 * another session); "kept" when something not natural is in the way (never looked at again). Throws when the chunk
 * isn't loaded.
 * @returns {Generator<undefined, string, unknown>}
 */
export function* caveChunk(dimension, cx, cz, C) {
  const m = caveMouth(cx, cz, C);
  let y = C.floorMax + 6;
  let b = dimension.getBlock({ x: m.x, y, z: m.z });
  if (!b) throw new Error("not loaded");
  if (!WATERY.has(b.typeId)) return "none"; // a spire, a cliff, or not the abyss
  if (dimension.getBiome({ x: m.x, y, z: m.z })?.id !== BALANCE.trench.biome) return "none";
  while (y > C.lowest && WATERY.has(b.typeId)) {
    y--;
    b = dimension.getBlock({ x: m.x, y, z: m.z });
    if (!b) throw new Error("not loaded");
  }
  const floorY = y;
  if (!floorFits(floorY, C)) return "none";
  if (parkAt(dimension.id, { x: m.x, y: floorY, z: m.z })) return "kept";
  const boxes = caveBoxes(cx, cz, floorY, C);
  const shells = boxes.map((box) => shellOf(box, floorY));
  // look first: every block of the cave and its shell is the trench's own
  let looked = 0;
  for (let i = 0; i < shells.length; i++) {
    const s = shells[i];
    const deep = boxes[i].part !== "shaft";
    for (let x = s.min.x; x <= s.max.x; x++) {
      for (let z = s.min.z; z <= s.max.z; z++) {
        for (let yy = s.min.y; yy <= s.max.y; yy++) {
          const t = dimension.getBlock({ x, y: yy, z })?.typeId;
          if (!t) throw new Error("not loaded");
          if (!NATURAL.has(t)) return "kept";
          if (deep && OPEN.has(t)) return "kept"; // open water beside the tunnel or chamber: a canyon there would let light in
          if (++looked % C.perSlice === 0) yield;
        }
      }
    }
  }
  yield;
  for (const s of shells) {
    dimension.fillBlocks(new BlockVolume(s.min, s.max), "minecraft:deepslate", { blockFilter: { includeTypes: SEALED } });
    yield;
  }
  // nothing that glows is left in the cave's own walls
  for (const s of shells) {
    dimension.fillBlocks(new BlockVolume(s.min, s.max), "minecraft:deepslate", { blockFilter: { includeTypes: GLOWING } });
    yield;
  }
  for (const box of boxes) {
    dimension.fillBlocks(new BlockVolume(box.min, box.max), "minecraft:water");
    yield;
  }
  return "made";
}

/** For the test server. */
export function trenchCaveStatus() {
  return { ...count, waiting: jobs.waiting, queued: queued.size, seen: seen.size };
}
