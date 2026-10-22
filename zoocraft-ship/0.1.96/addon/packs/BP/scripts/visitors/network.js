import { system } from "@minecraft/server";
import { timedJob } from "../core/perf.js";
import { BALANCE } from "../data/balance.js";
import { emit } from "../core/events.js";
import { log } from "../core/log.js";
import { db } from "../persistence/db.js";
import { getPark, insidePark, parkRadius } from "../park/park.js";
import { newNetwork, entranceStarts, walkPaths, linkStatus, rememberingReader, forgetColumn, columnsOf, columnsInto, columnsHash } from "./paths.js";
import { dim, pathReader, onlinePlayers } from "../platform/mc.js";

// The guest path network: one bounded walk over path blocks from the Park Entrance Gate, re-run
// when someone builds or breaks inside the park, or every so often. Features remember their last
// "linked" answer in their records, so an unloaded park keeps counting what was connected.
//
// Memory (0.1.64, Austin: "extend further than 128 blocks ... scan within 500 blocks, do not take
// any shortcuts"): Minecraft only loads the chunks near players, so no single walk can read a
// 500-block park. The last network is kept, and saved in the "paths" collection so it survives
// leaving the world: where the ground is unloaded, a path block an earlier walk found still counts
// and the walk carries on past it (paths.js rememberingReader), so walking round the park once
// fills the map in and it stays filled. A block placed or broken inside the park drops the
// remembered path blocks it touches at once, so a gap is never walked through from memory. The
// walk runs from the entrance whether or not its chunk is loaded, as long as something is
// remembered there, and runs again as soon as a player comes near the first unchecked edge (the
// Park Menu names it). The network is written back only when it changed.

const NET_ID = "net";
let current; // the last finished walk: { net, entrance key, dimension }
let running = false;
let dirty = true;
let lastRun = -Infinity;
let loaded = false;
let savedHash;

const entranceKey = (e) => (e ? `${e.dimension}|${e.x}|${e.y}|${e.z}` : "");

// The saved network, once, before the first walk: everything on it counts as remembered until a
// walk has seen it again.
function loadSaved() {
  loaded = true;
  const rec = db.get("paths", NET_ID);
  if (!rec?.cols || !rec.dimension) return;
  try {
    const net = newNetwork();
    columnsInto(net, rec.cols);
    net.done = true;
    net.partial = true;
    net.remembered = net.size;
    savedHash = columnsHash(rec.cols);
    current = { net, entrance: rec.entrance, dimension: rec.dimension };
    log(`paths: ${net.size} path blocks remembered from the last visit`);
  } catch (error) {
    log(`paths: saved network unreadable, starting afresh: ${error}`);
  }
}

// A block changed inside the park: walk again, and forget the remembered path blocks it touches
// (the block itself and the two below it, whose headroom it may have taken).
export function pathsDirty(dimensionId, pos) {
  if (!insidePark(dimensionId, pos)) return;
  dirty = true;
  if (current?.dimension === dimensionId) forgetColumn(current.net, pos.x, pos.z, pos.y - 2, pos.y);
}

function playerNear(dimensionId, pos, range) {
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== dimensionId) continue;
    if (Math.hypot(p.location.x - pos.x, p.location.z - pos.z) <= range) return true;
  }
  return false;
}

// Called every two seconds.
export function tickPaths() {
  if (!loaded) loadSaved();
  const park = getPark();
  const ent = park?.entrance;
  if (!ent) return; // no entrance: nothing to walk from (the memory keeps for when one is set)
  if (running) return;
  if (current?.entrance !== entranceKey(ent)) dirty = true;
  const prior = current?.dimension === ent.dimension ? current.net : undefined;
  const d = dim(ent.dimension);
  if (!d.isChunkLoaded(ent) && !prior) return; // waits until someone is near the entrance, the first time
  if (!dirty && prior?.unloadedAt && playerNear(ent.dimension, prior.unloadedAt, BALANCE.paths.frontierRange)) dirty = true;
  if (!dirty && system.currentTick - lastRun < BALANCE.paths.recheckSeconds * 20) return;
  running = true;
  dirty = false;
  lastRun = system.currentTick;
  const remembered = new Set();
  const read = rememberingReader(pathReader(d, new Map()), prior, remembered);
  const net = newNetwork();
  const { center } = park;
  const radius = parkRadius(park);
  const inBounds = (x, z) => (x - center.x) ** 2 + (z - center.z) ** 2 <= radius * radius;
  const opts = { maxNodes: BALANCE.paths.maxNodes, perYield: BALANCE.paths.perYield, inBounds };
  system.runJob(
    timedJob("paths", (function* () {
      try {
        const starts = entranceStarts(read, ent, BALANCE.paths.startRange);
        yield* walkPaths(read, starts, opts, net);
        net.remembered = remembered.size;
        current = { net, entrance: entranceKey(ent), dimension: ent.dimension };
        emit("pathsChanged", { size: net.size });
        yield* save(net, ent);
      } catch (error) {
        log(`paths: walk failed: ${error}`);
      } finally {
        running = false;
      }
    })()),
  );
}

// Write the network to the "paths" collection when it differs from what is saved, a slice a tick.
function* save(net, ent) {
  const cols = [];
  for (const piece of columnsOf(net, 2000)) {
    cols.push(...piece);
    yield;
  }
  const hash = columnsHash(cols);
  if (hash === savedHash) return;
  savedHash = hash;
  db.put("paths", { id: NET_ID, dimension: ent.dimension, entrance: entranceKey(ent), cols });
}

// true / false when the last walk can tell, undefined when it can't (no walk yet, another
// dimension, or the walk was cut short before reaching this spot).
export function pathLinked(dimensionId, pos) {
  if (!current || current.dimension !== dimensionId) return undefined;
  return linkStatus(current.net, pos, BALANCE.paths.reach);
}

// The last finished walk's network and dimension (guest journeys plan routes over it).
export function currentNetwork() {
  return current ? { net: current.net, dimension: current.dimension } : undefined;
}

export function pathSummary() {
  if (!current) return undefined;
  const { net } = current;
  return { size: net.size, partial: net.partial, capped: net.capped, remembered: net.remembered, unloadedAt: net.unloadedAt };
}
