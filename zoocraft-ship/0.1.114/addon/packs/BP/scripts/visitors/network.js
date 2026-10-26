import { system } from "@minecraft/server";
import { timedJob } from "../core/perf.js";
import { BALANCE } from "../data/balance.js";
import { emit } from "../core/events.js";
import { log } from "../core/log.js";
import { db } from "../persistence/db.js";
import { getPark, parkAt, insideParkColumn, parkRecordId, inPark, parkName } from "../park/park.js";
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
//
// 0.1.114 (several parks a world): one network a park, walked from that park's entrance within that park's fence,
// saved under "net" for the world's first park and "net:<park id>" for the others (park/park.js parkRecordId). Every
// question here is about the scope's park (the loop's, or the park a block or player is in); a block changed in a
// park marks that park's walk.

const NET_ID = "net";
// park id -> { current: the last finished walk { net, entrance key, dimension }, running, dirty, lastRun, loaded, savedHash }
const walks = new Map();
function walkOf(park = getPark()) {
  if (!park) return undefined;
  let w = walks.get(park.id);
  if (!w) walks.set(park.id, (w = { park, current: undefined, running: false, dirty: true, lastRun: -Infinity, loaded: false, savedHash: undefined }));
  return w;
}

const entranceKey = (e) => (e ? `${e.dimension}|${e.x}|${e.y}|${e.z}` : "");

// The saved network, once, before the first walk: everything on it counts as remembered until a
// walk has seen it again.
function loadSaved(w) {
  w.loaded = true;
  const rec = db.get("paths", parkRecordId(NET_ID, w.park));
  if (!rec?.cols || !rec.dimension) return;
  try {
    const net = newNetwork();
    columnsInto(net, rec.cols);
    net.done = true;
    net.partial = true;
    net.remembered = net.size;
    w.savedHash = columnsHash(rec.cols);
    w.current = { net, entrance: rec.entrance, dimension: rec.dimension };
    log(`paths: ${net.size} path blocks of ${parkName(w.park)} remembered from the last visit`);
  } catch (error) {
    log(`paths: saved network unreadable, starting afresh: ${error}`);
  }
}

// The scope's park's fenced area changed (0.1.101): walk again, within the new edge.
export function pathsAreaChanged() {
  const w = walkOf();
  if (w) w.dirty = true;
}

// A block changed inside a park: that park walks again, and forgets the remembered path blocks it touches
// (the block itself and the two below it, whose headroom it may have taken).
export function pathsDirty(dimensionId, pos) {
  const park = parkAt(dimensionId, pos);
  if (!park) return;
  const w = walkOf(park);
  w.dirty = true;
  if (w.current?.dimension === dimensionId) forgetColumn(w.current.net, pos.x, pos.z, pos.y - 2, pos.y);
}

function playerNear(dimensionId, pos, range) {
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== dimensionId) continue;
    if (Math.hypot(p.location.x - pos.x, p.location.z - pos.z) <= range) return true;
  }
  return false;
}

// Called every two seconds, for the scope's park (main.js runs it once a park).
export function tickPaths() {
  const park = getPark();
  const w = walkOf(park);
  if (!w) return;
  if (!w.loaded) loadSaved(w);
  const ent = park.entrance;
  if (!ent) return; // no entrance: nothing to walk from (the memory keeps for when one is set)
  if (w.running) return;
  if (w.current?.entrance !== entranceKey(ent)) w.dirty = true;
  const prior = w.current?.dimension === ent.dimension ? w.current.net : undefined;
  const d = dim(ent.dimension);
  if (!d.isChunkLoaded(ent) && !prior) return; // waits until someone is near the entrance, the first time
  if (!w.dirty && prior?.unloadedAt && playerNear(ent.dimension, prior.unloadedAt, BALANCE.paths.frontierRange)) w.dirty = true;
  if (!w.dirty && system.currentTick - w.lastRun < BALANCE.paths.recheckSeconds * 20) return;
  w.running = true;
  w.dirty = false;
  w.lastRun = system.currentTick;
  const remembered = new Set();
  const read = rememberingReader(pathReader(d, new Map()), prior, remembered);
  const net = newNetwork();
  const inBounds = (x, z) => insideParkColumn(park, x, z); // the fence's area
  const opts = { maxNodes: BALANCE.paths.maxNodes, perYield: BALANCE.paths.perYield, inBounds };
  system.runJob(
    timedJob(
      "paths",
      inPark(park, (function* () {
        try {
          const starts = entranceStarts(read, ent, BALANCE.paths.startRange);
          yield* walkPaths(read, starts, opts, net);
          net.remembered = remembered.size;
          w.current = { net, entrance: entranceKey(ent), dimension: ent.dimension };
          emit("pathsChanged", { size: net.size, parkId: park.id });
          yield* save(w, net, ent);
        } catch (error) {
          log(`paths: walk failed: ${error}`);
        } finally {
          w.running = false;
        }
      })()),
    ),
  );
}

// Write the network to the "paths" collection when it differs from what is saved, a slice a tick.
function* save(w, net, ent) {
  const cols = [];
  for (const piece of columnsOf(net, 2000)) {
    cols.push(...piece);
    yield;
  }
  const hash = columnsHash(cols);
  if (hash === w.savedHash) return;
  w.savedHash = hash;
  db.put("paths", { id: parkRecordId(NET_ID, w.park), dimension: ent.dimension, entrance: entranceKey(ent), cols });
}

// The walk a spot's question is about: the scope's park's, else the park the spot is in.
function walkAt(dimensionId, pos) {
  return walkOf(getPark() ?? parkAt(dimensionId, pos))?.current;
}

// true / false when the last walk can tell, undefined when it can't (no walk yet, another
// dimension, or the walk was cut short before reaching this spot).
export function pathLinked(dimensionId, pos) {
  const current = walkAt(dimensionId, pos);
  if (!current || current.dimension !== dimensionId) return undefined;
  return linkStatus(current.net, pos, BALANCE.paths.reach);
}

// The scope's park's last finished walk: its network and dimension (guest journeys plan routes over it).
export function currentNetwork() {
  const current = walkOf()?.current;
  return current ? { net: current.net, dimension: current.dimension } : undefined;
}

export function pathSummary() {
  const current = walkOf()?.current;
  if (!current) return undefined;
  const { net } = current;
  return { size: net.size, partial: net.partial, capped: net.capped, remembered: net.remembered, unloadedAt: net.unloadedAt };
}
