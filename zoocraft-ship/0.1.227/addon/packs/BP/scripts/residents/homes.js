// Resident homes (0.1.182, module 6c: research/npc_plan.md): the Resident Mailbox and the house round it. Records live
// in "equipment" (type "home"), keyed by the mailbox's position. A check measures the house (the Staff Room's room
// rule, staff/rules.js), finds its beds and door (homeRules.js homeParts), then finds the way to a zoo:
// - inside a park's fence, the door's path has to be on that park's guest paths (visitors/network.js);
// - outside every fence, a walk along path blocks from the door, staying out of the fenced areas, has to reach the path
//   by a park's entrance gate. That walk is remembered (the "paths" collection, "home:<mailbox id>") so a home far from
//   the zoo keeps its way while its ground isn't loaded, the park network's way (paths.js rememberingReader).
// The way to the gate as feet positions (homeRoute) is what residents/residents.js walks.
// Checks run as jobs, a slice a tick: when the mailbox is placed or used, when a block changes in or by the house or on
// its path, and every BALANCE.residents.homeCheckSeconds otherwise.
// 0.1.222: the check also notes what's in the house (`comfort`: homeRules.js homeContents) for its comfort out of 10.

import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { BALANCE } from "../data/balance.js";
import { BLOCKS } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { allParks, parkAt, parkById, withPark, runLater } from "../park/park.js";
import { currentNetwork, pathsPending } from "../visitors/network.js";
import { on, emit } from "../core/events.js";
import { newNetwork, walkPaths, rememberingReader, columnsOf, columnsInto, columnsHash, hasPath } from "../visitors/paths.js";
import { nearestNode, routeSearch, waypoints, feetAt } from "../visitors/routes.js";
import { measureRoomSteps } from "../staff/rules.js";
import { homeParts, pickBed, bedSpot, frontDoor, homeProblem, doorStarts, keyOf, homeContents } from "./homeRules.js";
import { dim, blockReader, pathReader, message, onlinePlayers } from "../platform/mc.js";

const EQUIP = "equipment";
const NET_PREFIX = "home:";

// mailbox id -> { net, gateNode, parkId, toGate: feet[], parkGate: feet, savedHash } (memory; the net is saved)
const ways = new Map();
const dirty = new Set();
const queued = new Set();
const lastCheck = new Map(); // mailbox id -> tick

export function allHomes() {
  const out = [];
  for (const rec of db.col(EQUIP).values()) if (rec.type === "home") out.push(rec);
  return out;
}

export function getHome(id) {
  const rec = db.get(EQUIP, id);
  return rec?.type === "home" ? rec : undefined;
}

export function homeWorks(rec) {
  return Boolean(rec && !rec.problem);
}

/** Move-in ON (0.1.220, Austin's Home Anchor switch): unlocked residents may move in by themselves. ON until turned off. */
export function homeAvailable(rec) {
  return Boolean(rec) && rec.available !== false;
}

/** Turn a home's Move-in ON or OFF. Turning it OFF never moves anyone out. */
export function setHomeAvailable(id, on) {
  const rec = getHome(id);
  if (!rec) return;
  rec.available = Boolean(on);
  db.put(EQUIP, rec);
}

/** The way from a home's door to its park's gate (feet positions), or undefined. */
export function homeWay(id) {
  return ways.get(id);
}

/**
 * The walk along the path from a home's front door to a spot outside every fence (0.1.224: a work site's gate), over the
 * path its check walked from the door (kept with the home, so it's known while the ground isn't loaded): feet positions,
 * or false when the path from the door doesn't reach within `reach` of the spot. A job.
 */
export function* homeWayTo(id, spot, reach) {
  const rec = getHome(id);
  if (!rec?.door) return false;
  const net = ways.get(id)?.net ?? loadNet(id)?.net;
  if (!net) return false;
  const g = BALANCE.residents;
  const doorNode = nearestNode(net, rec.door.outside, g.doorReach);
  const to = nearestNode(net, spot, reach);
  if (!doorNode || !to) return false;
  const route = yield* routeSearch(net, doorNode, to, g.homePathMax, g.routePerYield);
  if (!route) return false;
  const top = topReader(dim(rec.dimension));
  return waypoints(route).map((nd) => feetAt(nd, top));
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "home", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, problem: "unchecked" };
    db.put(EQUIP, rec);
  }
  return rec;
}

// The beds the other homes have taken (their heads), so two mailboxes in one house can't share a bed.
function takenBeds(except) {
  const out = new Set();
  for (const h of allHomes()) if (h.id !== except && h.bed) out.add(keyOf(h.bed.head));
  return out;
}

// A floor cell near the middle of the room, not the door's own step in: where the resident stands at home.
function standSpot(cells, door) {
  if (!cells.length) return undefined;
  let floor = Infinity;
  for (const c of cells) floor = Math.min(floor, c.y);
  const ground = cells.filter((c) => c.y === floor && !(door && c.x === door.inside.x && c.z === door.inside.z));
  const pool = ground.length ? ground : cells;
  let cx = 0;
  let cz = 0;
  for (const c of pool) {
    cx += c.x;
    cz += c.z;
  }
  cx /= pool.length;
  cz /= pool.length;
  let best = pool[0];
  let bestD = Infinity;
  for (const c of pool) {
    const d = Math.hypot(c.x - cx, c.z - cz);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return { x: best.x, y: best.y, z: best.z };
}

const checks = jobQueue((gen) => system.runJob(timedJob("homes", gen)), (error) => log(`homes: a home check failed: ${error}`));

/** Check a home again soon (a slice a tick). */
export function queueHomeCheck(id) {
  if (queued.has(id)) return;
  queued.add(id);
  checks.push(checkSteps(id));
}

function* checkSteps(id) {
  try {
    const rec = getHome(id);
    if (!rec) return;
    lastCheck.set(id, system.currentTick);
    const g = BALANCE.residents;
    const d = dim(rec.dimension);
    if (rec.dimension !== "minecraft:overworld") return finish(rec, { problem: "dimension" });
    // The mailbox gone without a player breaking it (blown up, replaced by a command): the home goes with it.
    let here;
    try {
      here = d.getBlock(rec.pos);
    } catch {
      here = undefined;
    }
    if (here && here.typeId !== BLOCKS.residentMailbox) return forget(id, rec);
    // 1. The room, keeping its cells.
    let room;
    try {
      room = yield* measureRoomSteps(blockReader(d), rec.pos, { minSize: g.roomMinSize, maxCells: g.roomMaxCells, perYield: g.roomCellsPerYield, keepCells: true });
    } catch {
      room = { ok: false, reason: "unloaded" };
    }
    if (!getHome(id)) return;
    // Not loaded: the last answer stands (a far home works while nobody is near it), and its way comes from memory.
    if (room.reason === "unloaded") {
      if (rec.problem === "unchecked") return finish(rec, { problem: "unloaded" });
      if (rec.door && !ways.has(id)) yield* wayFrom(rec);
      return;
    }
    if (!room.ok) return finish(rec, { problem: homeProblem({ room }) });
    // 2. Its beds and doors: the blocks round its cells, read a slice a tick.
    const cells = room.at ?? [];
    const near = new Map();
    let n = 0;
    for (const c of cells) {
      for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]]) {
        const p = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
        const k = keyOf(p);
        if (near.has(k)) continue;
        let b;
        try {
          const block = d.getBlock(p);
          b = block ? { typeId: block.typeId, states: /bed$|_door$/.test(block.typeId) ? block.permutation.getAllStates() : undefined } : undefined;
        } catch {
          b = undefined;
        }
        near.set(k, b);
        // The upper half of a door also asks after the block below it.
        if (b && /_door$/.test(b.typeId) && b.states?.upper_block_bit) {
          const lk = keyOf({ x: p.x, y: p.y - 1, z: p.z });
          if (!near.has(lk)) {
            try {
              const lb = d.getBlock({ x: p.x, y: p.y - 1, z: p.z });
              near.set(lk, lb ? { typeId: lb.typeId, states: lb.permutation.getAllStates() } : undefined);
            } catch {
              near.set(lk, undefined);
            }
          }
        }
        if (++n % g.partsPerYield === 0) yield;
      }
    }
    const parts = homeParts(cells, (x, y, z) => near.get(`${x},${y},${z}`));
    const bed = pickBed(parts.beds, takenBeds(id));
    const door = frontDoor(parts.doors, rec.pos);
    const now = getHome(id);
    if (!now) return;
    now.bed = bed;
    now.door = door;
    now.stand = standSpot(cells, door);
    now.space = room.cells;
    now.bbox = room.bbox;
    // 0.1.222: what's in the house, for its comfort: `near` holds every block round the open cells, the open cells
    // themselves among them (each is beside another), so torches, carpets and banners standing in them count too.
    now.comfort = homeContents(cells, [...near.values()].map((b) => b?.typeId));
    const early = homeProblem({ room, parts, bed, path: true });
    if (early) return finish(now, { problem: early });
    // 3. The way to a zoo. A walk that can't tell (unloaded ground it doesn't remember) keeps the last answer.
    let path = yield* wayFrom(now);
    const after = getHome(id);
    if (!after) return;
    if (path === undefined) path = after.lastPath;
    else after.lastPath = path;
    finish(after, { problem: homeProblem({ room, parts, bed, path }) });
  } finally {
    queued.delete(id);
  }
}

function finish(rec, { problem }) {
  const was = rec.problem;
  rec.problem = problem;
  rec.checkedAt = system.currentTick;
  db.put(EQUIP, rec);
  if (was !== problem && was !== "unchecked" && problem && problem !== "unchecked" && problem !== "unloaded" && rec.owner) {
    // Tell the owner, if they're about, that their home stopped working.
    runLater(() => {
      for (const p of onlinePlayers()) if (p.id === rec.owner) message(p, `§eThe home at ${rec.pos.x}, ${rec.pos.y}, ${rec.pos.z} needs fixing: use its mailbox to see why.`);
    });
  }
}

// The way from a home's door to a zoo: true when there is one (and `ways` holds it), false when there is none, undefined
// when the walk can't tell (unloaded ground it doesn't remember, or a park whose paths aren't walked yet).
function* wayFrom(rec) {
  const g = BALANCE.residents;
  const out = rec.door.outside;
  // Inside a fence: on that park's paths.
  const inside = parkAt(rec.dimension, out);
  if (inside) {
    const cur = withPark(inside, () => currentNetwork());
    if (!cur || cur.dimension !== rec.dimension) return undefined;
    const node = nearestNode(cur.net, out, g.doorReach);
    // Not on the paths the park last walked: no path, unless that walk is due again (a block changed) and may yet find it.
    if (!node) return withPark(inside, () => pathsPending()) ? undefined : cur.net.done && !cur.net.partial && !cur.net.capped ? false : undefined;
    rec.parkId = inside.id;
    ways.set(rec.id, { inside: true, parkId: inside.id, doorNode: node });
    return true;
  }
  // Outside: walk the path from the door, out of every fence, and look for a gate on it.
  const d = dim(rec.dimension);
  const prior = loadNet(rec.id);
  const remembered = new Set();
  const read = rememberingReader(pathReader(d, new Map()), prior?.net, remembered);
  const net = newNetwork();
  const parks = allParks().filter((p) => p.dimension === rec.dimension);
  const inBounds = (x, z) => !parkAt(rec.dimension, { x, y: 0, z });
  const starts = doorStarts(read, out, g.doorReach);
  yield* walkPaths(read, starts, { maxNodes: g.homePathMax, perYield: g.pathPerYield, inBounds }, net);
  net.remembered = remembered.size;
  yield* saveNet(rec.id, net, prior);
  const doorNode = nearestNode(net, out, g.doorReach);
  if (!doorNode) return net.partial ? undefined : false;
  for (const park of parks) {
    const ent = park.entrance;
    if (!ent || ent.dimension !== rec.dimension) continue;
    const gateNode = nearestNode(net, { x: ent.x, y: ent.y, z: ent.z }, BALANCE.paths.startRange);
    if (!gateNode) continue;
    // The way itself, door to gate, as feet positions.
    const route = yield* routeSearch(net, doorNode, gateNode, g.homePathMax, g.routePerYield);
    if (!route) continue;
    const toGate = waypoints(route).map((nd) => feetAt(nd, topReader(d)));
    // The park's own first path block by the gate, for the step in through it.
    const cur = withPark(park, () => currentNetwork());
    const parkGateNode = cur?.dimension === rec.dimension ? nearestNode(cur.net, { x: ent.x, y: ent.y, z: ent.z }, BALANCE.paths.startRange) : undefined;
    rec.parkId = park.id;
    ways.set(rec.id, { inside: false, parkId: park.id, net, toGate, parkGate: parkGateNode ? feetAt(parkGateNode, topReader(d)) : { x: ent.x + 0.5, y: ent.y, z: ent.z + 0.5 } });
    return true;
  }
  return net.partial || net.capped ? undefined : false;
}

// A path block's top (feet stand on it): a bottom slab is half a block.
function topReader(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (!b) return 1;
      if (/_slab$/.test(b.typeId)) return b.permutation.getState("minecraft:vertical_half") === "top" ? 1 : 0.5;
      return 1;
    } catch {
      return 1;
    }
  };
}

function loadNet(id) {
  const w = ways.get(id);
  if (w?.net) return { net: w.net, hash: w.savedHash };
  const rec = db.get("paths", NET_PREFIX + id);
  if (!rec?.cols) return undefined;
  try {
    const net = newNetwork();
    columnsInto(net, rec.cols);
    net.done = true;
    net.partial = true;
    return { net, hash: columnsHash(rec.cols) };
  } catch {
    return undefined;
  }
}

function* saveNet(id, net, prior) {
  const cols = [];
  for (const piece of columnsOf(net, 2000)) {
    cols.push(...piece);
    yield;
  }
  const hash = columnsHash(cols);
  if (hash === prior?.hash) return;
  db.put("paths", { id: NET_PREFIX + id, cols });
  emit("homePathsChanged", { homeId: id }); // 0.1.224: a path laid from the door (to a work site, say)
  const w = ways.get(id);
  if (w) w.savedHash = hash;
}

// A park walked its paths again: the homes whose doors are inside its fence check again (their door's path is on them).
on("pathsChanged", ({ parkId }) => {
  for (const h of allHomes()) {
    if (h.door && parkAt(h.dimension, h.door.outside)?.id === parkId) dirty.add(h.id);
  }
});

/** A block changed: homes whose house holds it, or whose path runs through it, check again. */
export function homeBlockChanged(dimensionId, pos) {
  for (const h of allHomes()) {
    if (h.dimension !== dimensionId) continue;
    const b = h.bbox;
    if (b && pos.x >= b.min.x - 1 && pos.x <= b.max.x + 1 && pos.y >= b.min.y - 1 && pos.y <= b.max.y + 1 && pos.z >= b.min.z - 1 && pos.z <= b.max.z + 1) {
      dirty.add(h.id);
      continue;
    }
    if (Math.abs(pos.x - h.pos.x) <= 2 && Math.abs(pos.y - h.pos.y) <= 2 && Math.abs(pos.z - h.pos.z) <= 2) {
      dirty.add(h.id);
      continue;
    }
    const net = ways.get(h.id)?.net;
    if (net && (hasPath(net, pos.x, pos.y, pos.z) || hasPath(net, pos.x, pos.y - 1, pos.z) || hasPath(net, pos.x, pos.y - 2, pos.z))) dirty.add(h.id);
    else if (h.door && Math.abs(pos.x - h.door.outside.x) <= BALANCE.residents.doorReach + 1 && Math.abs(pos.z - h.door.outside.z) <= BALANCE.residents.doorReach + 1 && Math.abs(pos.y - h.door.outside.y) <= 3) dirty.add(h.id);
  }
}

/** Every second: homes changed since, then any not checked for a while, into the check queue. */
export function tickHomes() {
  for (const id of dirty) queueHomeCheck(id);
  dirty.clear();
  const every = BALANCE.residents.homeCheckSeconds * 20;
  const now = system.currentTick;
  let started = 0;
  for (const h of allHomes()) {
    if (started >= 2) break;
    const last = lastCheck.get(h.id) ?? -Infinity;
    if (now - last < every) continue;
    lastCheck.set(h.id, now);
    queueHomeCheck(h.id);
    started++;
  }
}

// --- the mailbox ---

/** The player who placed a Resident Mailbox owns its home and hears what it needs (`quiet`, 0.1.227: the test setup's, not). */
export function homePlaced(player, block, quiet = false) {
  const rec = ensure(block);
  rec.owner = player.id;
  rec.ownerName = player.name;
  db.put(EQUIP, rec);
  queueHomeCheck(rec.id);
  if (!quiet) message(player, "§aResident Mailbox placed (Move-in ON). §fUse it to see whether the house is ready: it needs a closed room with a bed and a door, and a path from the door to a zoo.");
}

export function mailboxComponent(openMenu, removed) {
  return {
    onPlace(e) {
      const rec = ensure(e.block);
      runLater(() => queueHomeCheck(rec.id));
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      queueHomeCheck(rec.id);
      runLater(() => openMenu(player, rec.id));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const rec = getHome(id);
      if (rec) forget(id, rec, removed);
    },
  };
}

// A home whose mailbox is gone: its record, its remembered path, and (through `removed`, or the residents' next tick
// finding no home) its resident.
function forget(id, rec, removed = undefined) {
  db.remove(EQUIP, id);
  db.remove("paths", NET_PREFIX + id);
  ways.delete(id);
  dirty.delete(id);
  lastCheck.delete(id);
  removed?.(rec);
}

/** The park a home's resident visits (its path's), if any. */
export function homePark(rec) {
  return rec?.parkId ? parkById(rec.parkId) : undefined;
}
