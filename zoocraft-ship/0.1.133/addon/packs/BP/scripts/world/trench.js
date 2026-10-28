// Retired in 0.1.133: nothing runs this job now. The abyss is made with the world (BP features/ and feature_rules/
// trench_*), so chunks come out of the generator already deep, with no seams. Kept for its tests and the record.
// The Deep Trench in the game (0.1.130; dug into an abyss since 0.1.132; the rules are world/trenchRules.js and
// abyssRules.js). A biome can't reshape the ground, so the add-on digs the biome out itself, a chunk at a time, when a
// player first comes within BALANCE.trench.radius chunks of it (with the chunks round it loaded, so the walls can be
// sealed and the biome's edge seen). For each column of the chunk in the zoocraft:deep_trench biome: the first solid
// block from the sea down is the floor; if it's natural ground in the deep ocean and above the column's abyss bottom
// (about y -40, rising to a cliff at the biome's edge, lower in a canyon), the air and lava round the column are sealed
// with stone (deepslate under y 0), then the column is turned to water from that bottom up, natural blocks and sea
// plants only. Then the new floor gets its life: rock spires, coral reefs, kelp, sea grass, and glowing sea lanterns,
// sea pickles and glow lichen down in the dark. A chunk done is recorded (the "abyss" collection, a bitmap a region of 32
// by 32 chunks) and never dug again, so anything placed in it afterwards stays. One chunk at a time, in a background job.
import { system, BlockPermutation, BlockVolume, LiquidType } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { onlinePlayers } from "../platform/mc.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { log } from "../core/log.js";
import { carveRange, sealBoxes, regionOf, hasBit, withBit, EMPTY_BITS, chunksAround, CARVED, SEALED } from "./trenchRules.js";
import { outsideCells, edgeDistance, abyssBottom, columnOps, veinOps, carveBoxes, mergeBoxes, OPEN, GROUND } from "./abyssRules.js";

// 0.1.132: the record of dug chunks. The chunks 0.1.130 and 0.1.131 carved (the "trench" collection) are dug again into
// the abyss; digging never takes away what isn't natural ground, so what was built in them stays.
const COL = "abyss";
const OVERWORLD = "minecraft:overworld";
const seen = new Set(); // "cx,cz" looked at this session: dug, recorded, or not in the biome
const queued = new Set(); // "cx,cz" waiting in the job queue or being dug
const failures = new Map(); // "cx,cz" -> times its digging failed (given up on this session after three)
const cells = new Map(); // "i,j" -> whether that 4 by 4 cell is in the biome (the same every session)
let dryLogged = false;
const jobs = jobQueue((gen) => system.runJob(timedJob("trench", gen)), (error) => log(`trench: digging a chunk failed: ${error}`));

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

// The chunk and the eight round it are loaded (a seal can reach a block into the next chunk, and the biome's edge is
// looked for up to a chunk away).
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

// Every 20 ticks (main.js): the chunks round each player in the Overworld not looked at yet, nearest first, go into the
// queue once they and their neighbours are loaded. A chunk outside the biome takes a look at its 16 biome cells.
export function tickTrench() {
  const T = BALANCE.trench;
  if (seen.size > T.seenMax) seen.clear(); // looking again costs a look at the biome and the record
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
      if (recorded(cx, cz)) {
        seen.add(k);
        continue;
      }
      if (!loadedAround(dimension, cx, cz)) continue; // later, once they are
      queued.add(k);
      jobs.push(digJob(dimension, cx, cz, T));
    }
  }
}

function* digJob(dimension, cx, cz, T) {
  const k = key(cx, cz);
  try {
    const result = yield* digChunk(dimension, cx, cz, T);
    if (result === "dug") record(cx, cz);
    seen.add(k); // "dug", or not in the biome
  } catch (error) {
    // A chunk unloaded part way: looked at again when a player comes back (digging twice changes nothing).
    const n = (failures.get(k) ?? 0) + 1;
    failures.set(k, n);
    if (n >= 3) seen.add(k);
    log(`trench: chunk ${k} not finished (${error}); ${n >= 3 ? "left for this session" : "it is tried again later"}`);
  } finally {
    queued.delete(k);
  }
}

/**
 * Dig chunk (cx, cz) into the abyss and put life on its new floor. Returns "dug" when any of it is in the biome
 * (whether or not there was anything left to dig), "outside" when none is. Throws when a chunk it needs isn't loaded.
 * @returns {Generator<undefined, string, unknown>}
 */
export function* digChunk(dimension, cx, cz, T) {
  const inBiome = (i, j) => {
    const ck = `${i},${j}`;
    let v = cells.get(ck);
    if (v === undefined) {
      v = dimension.getBiome({ x: i * 4 + 2, y: T.biomeY, z: j * 4 + 2 }).id === T.biome;
      if (cells.size >= T.biomeCacheMax) cells.clear();
      cells.set(ck, v);
    }
    return v;
  };
  // The chunk's own 16 cells: none in the biome, nothing to do.
  let any = false;
  for (let i = cx * 4; i < cx * 4 + 4; i++) for (let j = cz * 4; j < cz * 4 + 4; j++) any = inBiome(i, j) || any;
  yield;
  if (!any) return "outside";
  // The cells of the chunks round it (where the biome ends), a row at a time.
  for (let i = cx * 4 - 4; i < cx * 4 + 8; i++) {
    for (let j = cz * 4 - 4; j < cz * 4 + 8; j++) inBiome(i, j);
    yield;
  }
  const outside = outsideCells(cx, cz, inBiome);
  yield;
  // The floor of each column in the biome (the first block from rayFrom down that isn't water or a plant), how far it
  // is from the biome's edge, and how deep it's dug.
  const floors = new Map();
  const dug = new Map();
  const work = [];
  for (let idx = 0; idx < 256; idx++) {
    const x = cx * 16 + (idx >> 4);
    const z = cz * 16 + (idx & 15);
    if (inBiome(x >> 2, z >> 2)) {
      const hit = dimension.getBlockFromRay({ x: x + 0.5, y: T.rayFrom + 0.5, z: z + 0.5 }, { x: 0, y: -1, z: 0 }, { includeLiquidBlocks: false, includePassableBlocks: false, maxDistance: T.rayFrom + 64 });
      // Every loaded Overworld column has bedrock within reach, so no hit means the chunk has unloaded: tried again later.
      if (!hit) throw new Error(`no ground found under ${x}, ${z}`);
      const floor = { y: hit.block.location.y, type: hit.block.typeId };
      floors.set(idx, floor);
      const range = carveRange(abyssBottom(x, z, edgeDistance(x, z, outside, T.rim), T), floor.y, floor.type, T);
      if (range) {
        work.push({ x, z, ...range });
        dug.set(idx, range);
      }
    }
    if (idx % 16 === 15) yield;
  }
  const perms = new Map();
  const perm = (id, states) => {
    const pk = states ? `${id}${JSON.stringify(states)}` : id;
    let p = perms.get(pk);
    if (!p) perms.set(pk, (p = BlockPermutation.resolve(id, states)));
    return p;
  };
  if (work.length) {
    // Seal round every column first (a seal only replaces air and lava, so it never fills a column already dug). A side
    // in a chunk that has unloaded since throws: the chunk is tried again later.
    const sealOpts = { blockFilter: { includeTypes: SEALED } };
    const carveOpts = { blockFilter: { includeTypes: CARVED } };
    const seals = sealBoxes(work);
    yield;
    const boxes = mergeBoxes(seals);
    yield;
    for (let i = 0; i < boxes.length; i++) {
      dimension.fillBlocks(new BlockVolume(boxes[i].from, boxes[i].to), perm(boxes[i].block), sealOpts);
      if (i % 8 === 7) yield;
    }
    const water = perm("minecraft:water");
    for (const box of carveBoxes(work)) {
      dimension.fillBlocks(new BlockVolume(box.from, box.to), water, carveOpts);
      yield;
    }
  }
  // The life on the new floor, a column at a time (abyssRules.chunkOps's order): each column's, then the veins.
  const openOpts = { blockFilter: { includeTypes: OPEN } };
  const groundOpts = { blockFilter: { includeTypes: GROUND } };
  const cache = new Map();
  let n = 0;
  for (const [idx, f] of floors) {
    for (const o of columnOps(cx * 16 + (idx >> 4), cz * 16 + (idx & 15), f, dug.get(idx), T, cache)) placeOp(dimension, o, perm, openOpts, groundOpts);
    if (++n % 16 === 0) yield;
  }
  for (const idx of dug.keys()) {
    for (const o of veinOps(cx, cz, idx, floors, dug, T)) placeOp(dimension, o, perm, openOpts, groundOpts);
    if (++n % 32 === 0) yield;
  }
  return "dug";
}

// One op of the life (abyssRules): a fill into water or rock, or a single block put where there's water and then given
// water (a sea pickle, glow lichen or coral fan: only so do pickles and lichen glow, and a coral without water dies).
function placeOp(dimension, o, perm, openOpts, groundOpts) {
  if (!o.waterlog) {
    dimension.fillBlocks(new BlockVolume({ x: o.x, y: o.y0, z: o.z }, { x: o.x, y: o.y1, z: o.z }), perm(o.block, o.states), o.into === "ground" ? groundOpts : openOpts);
    return;
  }
  const block = dimension.getBlock({ x: o.x, y: o.y0, z: o.z });
  if (!block || !OPEN.includes(block.typeId)) return;
  block.setPermutation(perm(o.block, o.states));
  try {
    if (!block.isWaterlogged && block.canContainLiquid(LiquidType.Water)) block.setWaterlogged(true);
  } catch (error) {
    if (!dryLogged) log(`trench: a ${o.block} couldn't be given water (${error})`);
    dryLogged = true;
  }
}

/** For /zoocraft:status: chunks looked at this session, waiting, and recorded regions. */
export function trenchStatus() {
  return { seen: seen.size, waiting: jobs.waiting, regions: db.all(COL).length };
}
