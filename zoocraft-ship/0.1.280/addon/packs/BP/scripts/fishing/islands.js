// The fishing dimension's islands in the game (0.1.272, the uncommon ones 0.1.274, the rare ones 0.1.275, the exotic ones 0.1.276, the mythic towns 0.1.277; the rules are fishing/islandRules.js). An island is built
// the first time a player comes near it in the dimension, or when a portal opens onto it: its chunks are kept loaded
// for the build, then its blocks go in as lists of up to 2,048 at a time in a background job, one island at a time,
// and only into air, so nothing anyone placed there is ever replaced. (Measured on the test server, 26.6x: a list of
// 8,000 blocks goes in in 8 ms; a cuboid fill told to fill only air places nothing in a stretch of sky nothing has
// been placed in yet, so every fill here is a list.) A built island is recorded (the "fishingIslands" collection) and
// never built again; one cut off half built (the world closed) is finished next time, which only fills what's still air.
// (0.1.279: the islands come from the closer sky, islandRules.js LAYOUT2; those built before keep their places.)
// (0.1.280: a huge island, too big to keep loaded at once, is built a quarter at a time: buildInParts.)
import { world, system, ListBlockVolume, BlockPermutation } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { BALANCE } from "../data/balance.js";
import { FISHING, seedOf, skyIslandsNear, builds, newShape, shapeSteps, opsOf, returnPortal, groundOf, setLegacy, legacyOf, partsOf, waterBoxOf } from "./islandRules.js";
import { PORTAL, AXIS } from "./portalRules.js";

const COL = "fishingIslands";
const WATER = "minecraft:water";
const STONE = "minecraft:stone";
const AIR_ONLY = { blockFilter: { includeTypes: ["minecraft:air"] } };
/** island id -> { isl, waiters: [resolve, reject][] } waiting to be built, nearest first */
const queue = [];
/** island id -> the build under way */
let building;
let seed;

const K = () => BALANCE.fishingSky;

/**
 * The world's seed as a number. The first time (0.1.279): the islands the first sky built in this world (its records
 * from 0.1.272 to 0.1.278) are kept in the closer sky where they are, and the new islands make room for them.
 */
export function worldSeed() {
  if (seed === undefined) {
    seed = seedOf(world.seed);
    const old = legacyOf(seed, db.all(COL).map((r) => r.id));
    setLegacy(old);
    if (old.length) log(`fishing sky: ${old.length} islands from before 0.1.279 kept where they are`);
  }
  return seed;
}

export function fishingDimension() {
  try {
    return world.getDimension(FISHING);
  } catch {
    return undefined;
  }
}

/** Whether the island is built. */
export function isBuilt(isl) {
  return db.get(COL, isl.id)?.state === "built";
}

/** The island's record ({ id, state, portal }), if it has one. */
export function islandRecord(isl) {
  return db.get(COL, isl.id);
}

function record(isl, patch) {
  const old = db.get(COL, isl.id) ?? { id: isl.id };
  db.put(COL, { ...old, ...patch, id: isl.id });
}

/** Resolves once the island is built (at once if it is). `first`: ahead of the rest of the queue (a portal waits). */
export function ensureIsland(isl, first = false) {
  if (isBuilt(isl)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (building?.isl.id === isl.id) return building.waiters.push([resolve, reject]);
    const q = queue.find((e) => e.isl.id === isl.id);
    if (q) {
      q.waiters.push([resolve, reject]);
      if (first) queue.unshift(...queue.splice(queue.indexOf(q), 1));
    } else if (first) queue.unshift({ isl, waiters: [[resolve, reject]] });
    else queue.push({ isl, waiters: [[resolve, reject]] });
    pump();
  });
}

function pump() {
  if (building || !queue.length) return;
  building = /** @type {any} */ (queue.shift());
  const job = building;
  build(job.isl).then(
    () => {
      building = undefined;
      for (const [res] of job.waiters) res();
      pump();
    },
    (error) => {
      building = undefined;
      log(`fishing sky: building island ${job.isl.id} failed: ${error}`);
      for (const [, rej] of job.waiters) rej(error);
      system.runTimeout(pump, 40);
    },
  );
}

const ticks = (n) => new Promise((r) => system.runTimeout(() => r(undefined), n));
/** How long a box may take to load before it is let go and tried again later (30 seconds). */
const LOAD_TICKS = 600;

/** The chunks of the box from..to that are not loaded yet, as the box round them (undefined: all loaded). */
function unloadedOf(d, from, to) {
  let box;
  for (let x = Math.floor(from.x / 16) * 16; x <= to.x; x += 16) {
    for (let z = Math.floor(from.z / 16) * 16; z <= to.z; z += 16) {
      if (d.isChunkLoaded({ x, y: 0, z })) continue;
      if (!box) box = { from: { x, z }, to: { x: x + 15, z: z + 15 } };
      box = { from: { x: Math.min(box.from.x, x), z: Math.min(box.from.z, z) }, to: { x: Math.max(box.to.x, x + 15), z: Math.max(box.to.z, z + 15) } };
    }
  }
  return box;
}

/**
 * Loads the box from..to of the fishing dimension and keeps it loaded until `run` is done. (0.1.276, on the test
 * server: a ticking area asked for while a player is in the fishing sky can stay "loading" for good, a few of its
 * chunks never loading and its promise never settling, and every island after it then waited for ever; a second
 * ticking area over those chunks gets them loaded at once. So the box counts as loaded once the area says so or every
 * chunk in it is loaded; after a second, the chunks still not loaded get an area of their own; and a box not loaded in
 * 30 seconds is let go, to be tried again.)
 */
export async function withLoaded(name, from, to, run) {
  const d = fishingDimension();
  const tam = world.tickingAreaManager;
  if (!d || !tam) throw new Error("no fishing dimension");
  const options = { dimension: d, from: { x: from.x, y: 0, z: from.z }, to: { x: to.x, y: 0, z: to.z } };
  for (let tries = 0; !tam.hasCapacity(options); tries++) {
    if (tries > 60) throw new Error(`no room to load ${name} (${tam.chunkCount} of ${tam.maxChunkCount} chunks in use)`);
    await ticks(20);
  }
  const nudge = `${name}_n`;
  for (const n of [name, nudge]) if (tam.hasTickingArea(n)) tam.removeTickingArea(n);
  const drop = () => {
    for (const n of [name, nudge]) {
      try {
        if (tam.hasTickingArea(n)) tam.removeTickingArea(n);
      } catch {
        // gone already
      }
    }
  };
  let settled = false;
  let failed;
  tam.createTickingArea(name, options).then(
    () => (settled = true),
    (error) => {
      failed = error ?? new Error(`${name} could not load`);
      settled = true;
    },
  );
  for (let t = 0; !settled; t += 5) {
    const left = unloadedOf(d, from, to);
    if (!left) break;
    if (t >= LOAD_TICKS) {
      drop();
      throw new Error(`${name} did not load in ${LOAD_TICKS / 20} s`);
    }
    // each second, an area of their own for the chunks still not loaded (if there is room for it)
    if (t >= 20 && t % 20 === 0) {
      const o = { dimension: d, from: { x: left.from.x, y: 0, z: left.from.z }, to: { x: left.to.x, y: 0, z: left.to.z } };
      try {
        if (tam.hasTickingArea(nudge)) tam.removeTickingArea(nudge);
        if (tam.hasCapacity(o)) {
          tam.createTickingArea(nudge, o).catch(() => {
            // tried again next second
          });
        }
      } catch {
        // tried again next second
      }
    }
    await ticks(5);
  }
  if (failed) {
    drop();
    throw failed;
  }
  try {
    return await run(d);
  } finally {
    drop();
  }
}

function asJob(name, gen) {
  return new Promise((resolve, reject) => {
    system.runJob(
      timedJob(
        name,
        (function* () {
          try {
            resolve(yield* gen);
          } catch (error) {
            reject(error);
          }
        })(),
      ),
    );
  });
}

const areaName = (isl) => `zoocraft_isle_${isl.id.replace(/[^0-9a-z]/gi, "_")}`;

async function build(isl) {
  if (partsOf(isl)) return buildInParts(isl);
  const R = Math.ceil(isl.r * 1.15) + 40;
  const t0 = Date.now();
  record(isl, { state: "building" });
  let placed = 0;
  let calls = 0;
  await withLoaded(areaName(isl), { x: isl.x - R, z: isl.z - R }, { x: isl.x + R, z: isl.z + R }, (d) =>
    asJob(
      "fishingisland",
      (function* () {
        const sh = newShape(isl);
        yield* shapeSteps(isl, sh);
        const place = (op) => {
          calls++;
          if (op.tree) {
            try {
              d.placeFeature(op.tree, op.at);
            } catch {
              // no room for that tree
            }
          } else {
            const block = op.states ? BlockPermutation.resolve(op.block, op.states) : op.block;
            // (an exotic island's seagrass goes into its pool's water, `into`; everything else only into air)
            placed += d.fillBlocks(new ListBlockVolume(op.list), block, op.into ? { blockFilter: { includeTypes: [op.into] } } : AIR_ONLY).getCapacity();
          }
        };
        // the ponds' water goes in once the ground round them is all in (0.1.274: on the test server, water put in
        // before the stone ran into a few of the stone's places while the fills were still going), and before the
        // plants that want it beside them (a rare island's body is blackstone and basalt, its lists marked `body`)
        const water = [];
        let stone = false;
        for (const op of opsOf(isl, sh)) {
          if (op.block === WATER) {
            water.push(op);
            continue;
          }
          if (op.block === STONE || op.body) stone = true;
          else if (stone) {
            for (const w of water.splice(0)) {
              place(w);
              yield;
            }
          }
          place(op);
          yield;
        }
        for (const w of water.splice(0)) {
          place(w);
          yield;
        }
        return sh;
      })(),
    ),
  ).then((sh) => {
    const rp = sh.landing ? returnPortal(sh.landing, sh) : undefined;
    // (0.1.277: a mythic town's spots too, its houses' doors and so on, for its people)
    record(isl, { landing: sh.landing, under: rp?.under ?? [], ...(sh.city ? { city: sh.city.spots } : {}) });
  });
  record(isl, { state: "built", day: world.getDay() });
  log(`fishing sky: island ${isl.id} (${isl.kind}, r ${isl.r}) built, ${placed} blocks in ${calls} steps, ${Date.now() - t0} ms`);
}

/**
 * The island's return portal: the prismarine frame on its landing, filled with portal (only where it's air, so a
 * player's blocks stay; a frame they broke is mended). Returns where a player arrives in it.
 */
export async function ensureReturnPortal(isl) {
  let rec = islandRecord(isl);
  if (!rec?.landing) {
    const sh = newShape(isl);
    await asJob("fishingportal", shapeSteps(isl, sh));
    if (!sh.landing) throw new Error(`island ${isl.id} has no landing`);
    record(isl, { landing: sh.landing, under: returnPortal(sh.landing, sh).under });
    rec = islandRecord(isl);
  }
  const L = rec.landing;
  const rp = returnPortal(L);
  const under = Array.isArray(rec.under) ? rec.under : [];
  await withLoaded(`${areaName(isl)}_p`, { x: L.x - 8, z: L.z - 8 }, { x: L.x + 8, z: L.z + 8 }, (d) => {
    if (under.length) d.fillBlocks(new ListBlockVolume(under), groundOf(isl.kind), AIR_ONLY);
    d.fillBlocks(new ListBlockVolume(rp.frame), "minecraft:prismarine", AIR_ONLY);
    d.fillBlocks(new ListBlockVolume(rp.inside), BlockPermutation.resolve(PORTAL, { [AXIS]: rp.axis }), AIR_ONLY);
  });
  return rp.arrive;
}

/** Every 20 ticks: the islands near each player in the fishing dimension that aren't built yet join the queue. */
export function tickIslands() {
  const s = worldSeed();
  for (const p of world.getAllPlayers()) {
    let id;
    try {
      id = p.dimension.id;
    } catch {
      continue;
    }
    if (id !== FISHING) continue;
    const near = skyIslandsNear(s, p.location.x, p.location.z, K().buildReach).filter(builds);
    near.sort((a, b) => Math.hypot(a.x - p.location.x, a.z - p.location.z) - Math.hypot(b.x - p.location.x, b.z - p.location.z));
    for (const isl of near) {
      if (isBuilt(isl) || building?.isl.id === isl.id || queue.some((e) => e.isl.id === isl.id)) continue;
      ensureIsland(isl).catch(() => {
        // logged; tried again on a later pass
      });
    }
  }
}

/** For the test server: the queue and what's built. */
export function islandsDebug() {
  return { building: building?.isl.id, queue: queue.map((e) => e.isl.id), built: db.all(COL).map((r) => `${r.id}:${r.state}`) };
}
// ---- a huge island, in parts (0.1.280)

/** The chests on a huge island's ships and what fills them (BP/loot_tables/chests): the first trawler's skipper's has a Deep Sea Rod. */
export const CHEST_LOOT = Object.freeze({
  captain: "loot_tables/chests/zoocraft_trawler_captain.json",
  trawler: "loot_tables/chests/zoocraft_trawler.json",
  submarine: "loot_tables/chests/zoocraft_submarine.json",
});

function lootTableOf(path) {
  const m = world.getLootTableManager();
  for (const p of [path, path.replace(/^loot_tables\//, "").replace(/\.json$/, "")]) {
    try {
      const t = m.getLootTable(p);
      if (t) return t;
    } catch {
      // the other way of naming it
    }
  }
  return undefined;
}

/**
 * Fills a ship's chest from its loot table, the things in random slots as a game chest's are, if the chest is there and
 * empty (one a player put something in, or emptied, is left as it is). True once it's dealt with.
 */
function fillChest(d, c) {
  try {
    const b = d.getBlock({ x: c.x, y: c.y, z: c.z });
    if (b?.typeId !== "minecraft:chest") return true;
    const box = b.getComponent("minecraft:inventory")?.container;
    if (!box) return false;
    if (box.emptySlotsCount < box.size) return true;
    const table = lootTableOf(CHEST_LOOT[c.loot]);
    const items = (table && world.getLootTableManager().generateLootFromTable(table)) ?? [];
    const free = [...Array(box.size).keys()];
    for (const it of items) {
      if (!free.length) break;
      const slot = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      box.setItem(slot, it);
    }
    return true;
  } catch (error) {
    log(`fishing sky: a ship's chest at ${c.x} ${c.y} ${c.z} wasn't filled: ${error}`);
    return false;
  }
}

/** The harbour's boats, on its water once it's in (once for an island: they're the players' to take). */
function launchBoats(d, isl, sh) {
  if (islandRecord(isl)?.boats) return;
  for (const b of sh.harbour?.boats ?? []) {
    try {
      if (d.getEntities({ type: "minecraft:boat", location: b, maxDistance: 3 }).length) continue;
      d.spawnEntity("minecraft:boat", b);
    } catch (error) {
      log(`fishing sky: a boat for ${isl.id} wasn't put on the water: ${error}`);
    }
  }
  record(isl, { boats: true });
}

/**
 * A huge island (0.1.280): the game keeps at most 300 chunks loaded for an add-on (measured on the test server), and a
 * huge island needs about 480. So its shape is worked out first (it needs nothing loaded), then its blocks go in a
 * quarter at a time with that quarter loaded (partsOf): first the ground, the harbour's quay and its ships; then its
 * water, in one go once all the ground round it is in (put in a quarter at a time, it would run off into the quarters
 * not built yet); then each quarter's plants, lamps and trees, and the ships' chests filled. Like any island, only into
 * air, so nothing anyone placed is replaced, and a build cut off is finished next time.
 */
async function buildInParts(isl) {
  const t0 = Date.now();
  record(isl, { state: "building" });
  let placed = 0;
  let calls = 0;
  const sh = newShape(isl);
  await asJob("fishingisland", shapeSteps(isl, sh));
  const parts = /** @type {any[]} */ (partsOf(isl));
  const place = (d, op) => {
    calls++;
    if (op.tree) {
      try {
        d.placeFeature(op.tree, op.at);
      } catch {
        // no room for that tree
      }
      return;
    }
    const block = op.states ? BlockPermutation.resolve(op.block, op.states) : op.block;
    placed += d.fillBlocks(new ListBlockVolume(op.list), block, op.into ? { blockFilter: { includeTypes: [op.into] } } : AIR_ONLY).getCapacity();
  };
  const water = [];
  const late = parts.map(() => /** @type {any[]} */ ([]));
  for (const [i, part] of parts.entries()) {
    await withLoaded(`${areaName(isl)}_${i}`, part.from, part.to, (d) =>
      asJob(
        "fishingisland",
        (function* () {
          let stone = false;
          for (const op of opsOf(isl, sh, part.clip)) {
            if (op.block === WATER) {
              water.push(op);
              continue;
            }
            if (op.block === STONE || op.body) stone = true;
            else if (stone) {
              late[i].push(op);
              continue;
            }
            place(d, op);
            yield;
          }
        })(),
      ),
    );
  }
  const box = waterBoxOf(sh);
  if (box) {
    await withLoaded(`${areaName(isl)}_w`, box.from, box.to, (d) =>
      asJob(
        "fishingisland",
        (function* () {
          for (const op of water) {
            place(d, op);
            yield;
          }
          launchBoats(d, isl, sh);
        })(),
      ),
    );
  }
  const filled = new Set(islandRecord(isl)?.filled ?? []);
  for (const [i, part] of parts.entries()) {
    await withLoaded(`${areaName(isl)}_${i}`, part.from, part.to, (d) =>
      asJob(
        "fishingisland",
        (function* () {
          for (const op of late[i]) {
            place(d, op);
            yield;
          }
          for (const c of sh.harbour?.chests ?? []) {
            const k = `${c.x},${c.y},${c.z}`;
            if (!part.clip(c.x, c.z) || filled.has(k)) continue;
            if (fillChest(d, c)) filled.add(k);
            yield;
          }
        })(),
      ),
    );
    record(isl, { filled: [...filled] });
  }
  record(isl, { state: "built", day: world.getDay() });
  log(`fishing sky: island ${isl.id} (${isl.kind}, r ${isl.r}) built in ${parts.length} parts, ${placed} blocks in ${calls} steps, ${Date.now() - t0} ms`);
}
