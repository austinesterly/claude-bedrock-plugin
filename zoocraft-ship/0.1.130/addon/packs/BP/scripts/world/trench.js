// The Deep Trench's trenches in the game (0.1.130; the rules are world/trenchRules.js). A biome can't reshape the ground
// and a JSON feature can't be tried before it ships, so the add-on carves the trenches itself, a chunk at a time, when a
// player first comes within BALANCE.trench.radius chunks of it (with the chunks round it loaded too, so the walls can be
// sealed). For each column of the chunk a trench line passes that is in the zoocraft:deep_trench biome: the first solid
// block from the sea down is the floor; if it's natural ground in the deep ocean, the air and lava round the column are
// sealed with stone (deepslate under y 0), then the column is turned to water from the trench's bottom up, natural
// blocks and sea plants only. A chunk done is recorded (the "trench" collection, a bitmap a region of 32 by 32 chunks)
// and never carved again, so anything placed in a trench afterwards stays. One chunk at a time, in a background job.
import { system, BlockPermutation, BlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { onlinePlayers } from "../platform/mc.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { log } from "../core/log.js";
import {
  chunkColumns, carveRange, sealBoxes, cellKey, cellMiddle, regionOf, hasBit, withBit, EMPTY_BITS, chunksAround, CARVED, SEALED,
} from "./trenchRules.js";

const COL = "trench";
const OVERWORLD = "minecraft:overworld";
const seen = new Set(); // "cx,cz" looked at this session: carved, recorded, or no trench in it
const queued = new Set(); // "cx,cz" waiting in the job queue or being carved
const failures = new Map(); // "cx,cz" -> times its carving failed (given up on this session after three)
const jobs = jobQueue((gen) => system.runJob(timedJob("trench", gen)), (error) => log(`trench: carving a chunk failed: ${error}`));

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

// The chunk and the eight round it are loaded (a seal can reach a block into the next chunk).
function loadedAround(dimension, cx, cz) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      try {
        if (!dimension.isChunkLoaded({ x: (cx + dx) * 16 + 8, y: 0, z: (cz + dz) * 16 + 8 })) return false;
      } catch {
        return false;
      }
    }
  }
  return true;
}

// Every 20 ticks (main.js): the chunks round each player in the Overworld not looked at yet, nearest first,
// go into the queue once they and their neighbours are loaded and a trench line passes them.
export function tickTrench() {
  const T = BALANCE.trench;
  if (seen.size > T.seenMax) seen.clear(); // looking again costs a little arithmetic and the record
  for (const player of onlinePlayers()) {
    let dimension;
    let loc;
    try {
      dimension = player.dimension;
      loc = player.location;
    } catch {
      continue;
    }
    if (dimension.id !== OVERWORLD) continue;
    const pcx = Math.floor(loc.x) >> 4;
    const pcz = Math.floor(loc.z) >> 4;
    for (const { cx, cz } of chunksAround(pcx, pcz, T.radius)) {
      const k = key(cx, cz);
      if (seen.has(k) || queued.has(k)) continue;
      if (jobs.waiting >= T.maxQueued) return;
      const cols = chunkColumns(cx, cz, T);
      if (!cols.length || recorded(cx, cz)) {
        seen.add(k);
        continue;
      }
      if (!loadedAround(dimension, cx, cz)) continue; // later, once they are
      queued.add(k);
      jobs.push(carveJob(dimension, cx, cz, cols, T));
    }
  }
}

function* carveJob(dimension, cx, cz, cols, T) {
  const k = key(cx, cz);
  try {
    const result = yield* carveChunk(dimension, cols, T);
    if (result === "carved") record(cx, cz);
    seen.add(k); // "carved", or the trench line passes outside the biome here
  } catch (error) {
    // A chunk unloaded part way: looked at again when a player comes back (carving twice changes nothing).
    const n = (failures.get(k) ?? 0) + 1;
    failures.set(k, n);
    if (n >= 3) seen.add(k);
    log(`trench: chunk ${k} not finished (${error}); ${n >= 3 ? "left for this session" : "it is tried again later"}`);
  } finally {
    queued.delete(k);
  }
}

/**
 * Carve one chunk's trench columns (cols from chunkColumns). Returns "carved" when the chunk is in the biome (whether
 * or not there was anything left to carve), "outside" when none of its trench columns is. Throws when a chunk it needs
 * isn't loaded.
 * @returns {Generator<undefined, string, unknown>}
 */
export function* carveChunk(dimension, cols, T) {
  // The biome, once for each 4 by 4 cell the columns are in.
  const cells = new Map();
  const inside = [];
  for (const c of cols) {
    const ck = cellKey(c.x, c.z);
    let ok = cells.get(ck);
    if (ok === undefined) {
      ok = dimension.getBiome(cellMiddle(c.x, c.z, T.biomeY)).id === T.biome;
      cells.set(ck, ok);
    }
    if (ok) inside.push(c);
  }
  yield;
  if (!inside.length) return "outside";
  // The floor of each column: the first block from rayFrom down that isn't water or a plant.
  const work = [];
  for (let i = 0; i < inside.length; i++) {
    const c = inside[i];
    const hit = dimension.getBlockFromRay({ x: c.x + 0.5, y: T.rayFrom + 0.5, z: c.z + 0.5 }, { x: 0, y: -1, z: 0 }, { includeLiquidBlocks: false, includePassableBlocks: false, maxDistance: T.rayFrom + 64 });
    // Every loaded Overworld column has bedrock within reach, so no hit means the chunk has unloaded: tried again later.
    if (!hit) throw new Error(`no ground found under ${c.x}, ${c.z}`);
    const range = carveRange(c.bottom, hit.block.location.y, hit.block.typeId, T);
    if (range) work.push({ x: c.x, z: c.z, ...range });
    if (i % 16 === 15) yield;
  }
  if (!work.length) return "carved";
  // Seal round every column first (a seal only replaces air and lava, so it never fills a column already carved). A
  // side in a chunk that has unloaded since throws: the chunk is tried again later.
  const sealOpts = { blockFilter: { includeTypes: SEALED } };
  const carveOpts = { blockFilter: { includeTypes: CARVED } };
  const perms = new Map();
  const perm = (id) => {
    let p = perms.get(id);
    if (!p) perms.set(id, (p = BlockPermutation.resolve(id)));
    return p;
  };
  const boxes = sealBoxes(work);
  for (let i = 0; i < boxes.length; i++) {
    dimension.fillBlocks(new BlockVolume(boxes[i].from, boxes[i].to), perm(boxes[i].block), sealOpts);
    if (i % 8 === 7) yield;
  }
  const water = perm("minecraft:water");
  for (const w of work) {
    dimension.fillBlocks(new BlockVolume({ x: w.x, y: w.lo, z: w.z }, { x: w.x, y: w.hi, z: w.z }), water, carveOpts);
    yield;
  }
  return "carved";
}

/** For /zoocraft:status: chunks looked at this session, waiting, and recorded regions. */
export function trenchStatus() {
  return { seen: seen.size, waiting: jobs.waiting, regions: db.all(COL).length };
}
