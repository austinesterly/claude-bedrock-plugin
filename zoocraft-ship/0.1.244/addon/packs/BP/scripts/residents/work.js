// Work sites (0.1.224, stage D of Austin's residents spec: research/npc_spec_plan.md section 8): the Work Anchor and the
// site round it. Records live in "equipment" (type "worksite"), keyed by the anchor's position: { id, type, dimension,
// pos, owner, ownerName, worker (a resident's id), problem, cells (floor blocks), gate: { gate, inside, outside }, chest
// (beside the anchor), bbox, targets (ores in reach), way (the worker's walk from their front door to the gate, feet
// positions), spent (ores mined: [{ pos, typeId, day }], each grows back after g.regrowDays), checkedAt }.
// A check (a job, a slice a tick) measures the site the way exhibits are measured (exhibits/geometry.js floodTerrestrial:
// the floor a person can walk, shut in by fences, walls and blocks), finds its gate and chest, the ores within reach of
// its floor (workRules.js workTargets), and the path from the worker's front door to the gate (homes.js homeWayTo). The
// floor and the ores are kept in memory for residents/residents.js, which walks the worker there and back and has them
// work. mineTarget below is the only place work changes a block: only an ore, only within reach of the measured floor,
// only in a site that works and was measured a moment ago, with what it gives put in the work chest first, and the rock
// it sat in left in its place; and the only other change is that rock turning back into the same ore days later.
// 0.1.225: a site's work follows its worker's kind (workRules.js WORK_KINDS): the mine's ores; the woodlot's trees grown
// from saplings it saw (kept in the record's `saplings`: spots it saw a sapling on, or one was placed or planted) and
// bare ground to plant; the field's ripe crops and bare farmland. workTask hands those to workActs.js, the only other
// place work changes blocks, after the same checks mineTarget makes.

import { system, world, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { BALANCE } from "../data/balance.js";
import { posKey } from "../core/ids.js";
import { parkAt, runLater } from "../park/park.js";
import { residentById } from "../data/residents.js";
import { floodTerrestrial, newResult } from "../exhibits/geometry.js";
import { getHome, homeWayTo, queueHomeCheck } from "./homes.js";
import { on } from "../core/events.js";
import { HOUSE_GONE } from "./homeRules.js";
import { siteGates, nearestGate, workTargets, siteProblem, isOre, canMine, oreDrop, reaches, roomFor, workKindOf, ORES } from "./workRules.js";
import { kindBalance, canDo, treeAt, plantSpots, fieldTasks, reachesTree, SAPLING_LOG, ALONE, GATHER, SEED_CROP, countIn } from "./workRules.js";
import { ACTS, slotsOf } from "./workActs.js";
import { isStation, wasteIn } from "./workRules.js";
import { dim, blockReader, message, onlinePlayers } from "../platform/mc.js";

const EQUIP = "equipment";
export const ANCHOR = "zoocraft:work_anchor";
const CHESTS = /^minecraft:(chest|trapped_chest|barrel)$/;
const GATES = /fence_gate$/;
const key = (p) => `${p.x},${p.y},${p.z}`;

// site id -> { cells: Set of floor keys, targets: [{ pos, stand, typeId }], worker } (memory: measured again after a reload)
const mem = new Map();
const dirty = new Set();
const queued = new Set();
const lastCheck = new Map(); // site id -> tick
const passing = new Map(); // site id -> tick its worker opened its gate (the check waits until they've shut it)

export function allSites() {
  const out = [];
  for (const rec of db.col(EQUIP).values()) if (rec.type === "worksite") out.push(rec);
  return out;
}

export function getSite(id) {
  const rec = db.get(EQUIP, id);
  return rec?.type === "worksite" ? rec : undefined;
}

/** The work site a resident works at, if any. */
export function siteOf(resId) {
  return allSites().find((s) => s.worker === resId);
}

/** Whether a site works (measured: fenced, gated, a chest, a worker, a path from their home). */
export function siteWorks(rec) {
  return Boolean(rec && !rec.problem);
}

/** What a site holds in memory: { cells, targets } (undefined until it's measured, and while it isn't loaded). */
export function siteMemory(id) {
  return mem.get(id);
}

/** Whether a site was measured recently enough to work in (g.freshSeconds). */
export function siteFresh(rec) {
  return Boolean(rec?.checkedAt !== undefined && system.currentTick - rec.checkedAt <= BALANCE.residents.work.freshSeconds * 20);
}

/** The worker is going through the site's gate (open: true) or has shut it again (false): no check sees it open meanwhile. */
export function sitePassing(id, open) {
  if (open) passing.set(id, system.currentTick);
  else {
    passing.delete(id);
    dirty.add(id);
  }
}

function isPassing(id) {
  const t = passing.get(id);
  if (t === undefined) return false;
  if (system.currentTick - t <= BALANCE.residents.work.passSeconds * 20) return true;
  passing.delete(id);
  return false;
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "worksite", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, problem: "noWorker" };
    db.put(EQUIP, rec);
  }
  return rec;
}

const checks = jobQueue((gen) => system.runJob(timedJob("worksites", gen)), (error) => log(`work: a site check failed: ${error}`));

/** Check a site again soon (a slice a tick). */
export function queueSiteCheck(id) {
  if (queued.has(id)) return;
  queued.add(id);
  checks.push(checkSteps(id));
}

// A worker's home walked its paths again and found them changed (a path laid from the door toward the site): their
// site checks again, for the way.
on("homePathsChanged", ({ homeId }) => {
  for (const s of allSites()) if (s.worker && db.get("residents", s.worker)?.homeId === homeId) dirty.add(s.id);
});

/** Check a site again soon, and its worker's home first (their path from the door is walked again with it). */
export function recheckSite(id) {
  const rec = getSite(id);
  if (!rec) return;
  const homeId = rec.worker ? db.get("residents", rec.worker)?.homeId : undefined;
  if (homeId) queueHomeCheck(homeId);
  queueSiteCheck(id);
}

// The open floor beside the anchor, where its measure starts: feet and head open, ground under them.
function seedOf(read, pos) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const p = { x: pos.x + dx, y: pos.y, z: pos.z + dz };
    const feet = read(p.x, p.y, p.z);
    const head = read(p.x, p.y + 1, p.z);
    const below = read(p.x, p.y - 1, p.z);
    if (feet === "unloaded" || head === "unloaded" || below === "unloaded") return "unloaded";
    if (feet === "air" && head === "air" && below === "solid") return p;
  }
  return undefined;
}

// Leaves: "natural" (grown: they decay), "placed" (a player's: they don't), or undefined for anything else.
function leafReader(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (!b || !/leaves/.test(b.typeId)) return undefined;
      return b.permutation.getState("persistent_bit") ? "placed" : "natural";
    } catch {
      return undefined;
    }
  };
}

// The work chest's inventory, or undefined.
function containerAt(d, pos) {
  try {
    const b = pos ? d.getBlock(pos) : undefined;
    return b && CHESTS.test(b.typeId) ? b.getComponent("minecraft:inventory")?.container : undefined;
  } catch {
    return undefined;
  }
}

function typeReader(d) {
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}

// Where the worker's home stands for work: "ok", "broken" (the house itself needs fixing) or "inPark" (inside a fence).
function homeFor(workerRec) {
  const home = workerRec ? getHome(workerRec.homeId) : undefined;
  if (!home?.door || HOUSE_GONE.has(home.problem)) return { home, state: "broken" };
  if (parkAt(home.dimension, home.door.outside)) return { home, state: "inPark" };
  return { home, state: "ok" };
}

function* checkSteps(id) {
  try {
    const rec = getSite(id);
    if (!rec) return;
    lastCheck.set(id, system.currentTick);
    // Their worker is going through the gate: measured once it's shut again.
    if (isPassing(id)) {
      dirty.add(id);
      return;
    }
    const g = BALANCE.residents.work;
    const d = dim(rec.dimension);
    const typeAt = typeReader(d);
    // The anchor gone without a player breaking it (blown up, replaced by a command): the site goes with it.
    let here;
    try {
      here = d.getBlock(rec.pos);
    } catch {
      here = undefined;
    }
    if (here && here.typeId !== ANCHOR) return forget(id);
    const workerRec = rec.worker ? db.get("residents", rec.worker) : undefined;
    const kind = workKindOf(residentById(rec.worker ?? "")) ?? "mine";
    const base = { dimension: rec.dimension, inPark: Boolean(parkAt(rec.dimension, rec.pos)) };
    if (base.dimension !== "minecraft:overworld" || base.inPark) return finish(rec, siteProblem(base, g));
    if (!here) return unloaded(rec);
    // The chest or barrel beside the anchor.
    let chest;
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]]) {
      const p = { x: rec.pos.x + dx, y: rec.pos.y + dy, z: rec.pos.z + dz };
      if (CHESTS.test(typeAt(p.x, p.y, p.z) ?? "")) {
        chest = p;
        break;
      }
    }
    // 1. The floor, from beside the anchor. Nobody stands on the anchor or the chest (nor climbs out of the site from
    // their tops): measured, they're as a fence.
    const fixed = new Set([key(rec.pos), ...(chest ? [key(chest)] : [])]);
    const blocks = blockReader(d);
    const read = (x, y, z) => (fixed.has(`${x},${y},${z}`) ? "barrier" : blocks(x, y, z));
    const seed = seedOf(read, rec.pos);
    if (seed === "unloaded") return unloaded(rec);
    if (!seed) return finish(rec, siteProblem({ ...base, seed: undefined }, g));
    const out = newResult(seed);
    try {
      yield* floodTerrestrial(read, seed, { halfWidth: g.halfWidth, halfHeight: g.halfHeight, maxDrop: g.maxDrop, minHeight: 2, cellsPerYield: g.cellsPerYield, rise: 1 }, out);
    } catch {
      out.unloaded = true;
    }
    if (!getSite(id)) return;
    if (out.unloaded) return unloaded(rec);
    if (isPassing(id)) {
      dirty.add(id);
      return;
    }
    const cells = new Set();
    for (const [k, v] of out.cells) if (v === "land") cells.add(k);
    const flood = { unloaded: false, enclosed: out.enclosed, escape: out.escape, openGates: out.openGates };
    // 2. The gate nearest the worker's door.
    const { home, state: homeState } = workerRec ? homeFor(workerRec) : { home: undefined, state: undefined };
    const gates = out.enclosed ? siteGates(cells, (x, y, z) => GATES.test(typeAt(x, y, z) ?? "")) : [];
    const gate = nearestGate(gates, home?.door?.outside);
    // 3. What there is to work, by its worker's kind: the woodlot's trees and ground to plant, the field's crops, or
    // (a miner's, or nobody's yet) the ores within reach of the floor, read a slice a tick, and mined ores grown back.
    /** @type {any[]} */
    const targets = [];
    /** @type {any} */
    const extra = {};
    if (out.enclosed && cells.size >= g.minCells && rec.worker && kind === "woodlot") yield* woodlotTasks(id, d, cells, out.bbox, chest, gate, targets, extra, typeAt);
    else if (out.enclosed && cells.size >= g.minCells && rec.worker && kind === "field") yield* fieldWork(d, cells, chest, targets, extra, typeAt);
    else if (out.enclosed && cells.size >= g.minCells && rec.worker && kind === "research") yield* researchWork(d, cells, chest, targets, extra, typeAt);
    else if (out.enclosed && cells.size >= g.minCells) {
      const all = [...cells];
      const seen = new Set();
      for (let i = 0; i < all.length && targets.length < g.maxTargets; i += g.targetsPerYield) {
        for (const t of workTargets(new Set(all.slice(i, i + g.targetsPerYield)), typeAt, isOre, g.maxTargets)) {
          const k = key(t.pos);
          if (seen.has(k) || cells.has(k)) continue;
          seen.add(k);
          targets.push(t);
        }
        yield;
      }
      yield* regrow(id, d, cells, targets, typeAt);
    }
    // 4. The worker's walk from their front door to the gate.
    let way;
    if (gate && homeState === "ok") way = yield* homeWayTo(home.id, gate.outside, g.gateReach);
    const now = getSite(id);
    if (!now) return;
    now.cells = cells.size;
    now.gate = gate;
    now.chest = chest;
    now.bbox = out.bbox;
    now.targets = kind === "woodlot" ? targets.filter((x) => x.act === "cut").length : kind === "field" ? targets.filter((x) => x.act === "harvest").length : targets.length;
    now.work = kind === "mine" ? undefined : extra;
    now.kind = kind;
    now.escape = flood.escape;
    now.openGate = flood.openGates?.[0];
    if (Array.isArray(way)) now.way = way;
    else if (way === false || !gate || homeState !== "ok") now.way = undefined;
    mem.set(id, { cells, targets, worker: now.worker, kind, stations: kind === "research" ? [...targets] : undefined });
    const known = Array.isArray(way) ? true : way === false ? false : now.way ? true : undefined;
    finish(now, siteProblem({ ...base, seed, flood, cells: cells.size, gate, chest, kind, worker: now.worker, home: homeState, way: known }, g));
  } finally {
    queued.delete(id);
  }
}

const SIDES4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// The woodlot (0.1.225): saplings on its floor now (each spot kept, so a tree that grows there is known to have grown
// here), the trees grown on those spots that its worker can cut whole (workRules.js treeAt), and, while the chest has
// saplings that grow alone, bare ground to plant them in.
function* woodlotTasks(id, d, cells, box, chest, gate, targets, extra, typeAt) {
  const g = kindBalance("woodlot", BALANCE.residents.work);
  const memo = new Map();
  const at = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (memo.has(k)) return memo.get(k);
    const v = typeAt(x, y, z);
    memo.set(k, v);
    return v;
  };
  const leafAt = leafReader(d);
  const rec = getSite(id);
  if (!rec) return;
  const tracked = new Map((rec.saplings ?? []).map((s) => [key(s), s]));
  let n = 0;
  for (const k of cells) {
    const [x, y, z] = k.split(",").map(Number);
    const t = at(x, y, z);
    if (t && SAPLING_LOG[t] && !tracked.has(k)) tracked.set(k, { x, y, z, typeId: t });
    if (++n % 200 === 0) yield;
  }
  const feet = new Set();
  const skipped = {};
  let skipAt;
  let growing = 0;
  for (const [k, s] of [...tracked]) {
    const t = at(s.x, s.y, s.z);
    if (t && SAPLING_LOG[t]) {
      growing++;
      continue;
    }
    if (t !== SAPLING_LOG[s.typeId]) {
      if (t !== undefined) tracked.delete(k); // cut, dug up or built over: not a tree of ours any more
      continue;
    }
    const tr = treeAt(s, at, leafAt, box, g);
    yield;
    if (!tr.ok) {
      skipped[tr.why] = (skipped[tr.why] ?? 0) + 1;
      skipAt ??= { x: s.x, y: s.y, z: s.z };
      continue;
    }
    const fk = key(tr.foot[0]);
    if (feet.has(fk)) continue;
    feet.add(fk);
    // Where to stand: beside the trunk, else (its low leaves fill the ground round it) the nearest floor in reach.
    let stand;
    let pos;
    for (const f of tr.foot) {
      for (const [dx, dz] of SIDES4) {
        const c = { x: f.x + dx, y: f.y, z: f.z + dz };
        if (!stand && cells.has(key(c))) {
          stand = c;
          pos = { x: f.x, y: f.y, z: f.z };
        }
      }
    }
    const r = g.cutReach ?? 1;
    for (let dist = 1; !stand && dist <= r; dist++) {
      for (const f of tr.foot) {
        for (let dx = -dist; dx <= dist && !stand; dx++) {
          for (let dz = -dist; dz <= dist && !stand; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== dist) continue;
            for (const dy of [0, -1, 1]) {
              const c = { x: f.x + dx, y: f.y + dy, z: f.z + dz };
              if (!stand && cells.has(key(c)) && reachesTree(c, f, r)) {
                stand = c;
                pos = { x: f.x, y: f.y, z: f.z };
              }
            }
          }
        }
      }
    }
    if (!stand) {
      skipped.noRoom = (skipped.noRoom ?? 0) + 1;
      skipAt ??= { x: s.x, y: s.y, z: s.z };
      continue;
    }
    targets.push({ act: "cut", pos, stand, typeId: tr.type, big: tr.big, logs: tr.logs.length });
  }
  const container = containerAt(d, chest);
  const slots = container ? slotsOf(container) : [];
  extra.saplings = [...ALONE].reduce((a, s) => a + countIn(slots, s), 0);
  if (extra.saplings > 0) {
    const avoid = [{ pos: rec.pos, r: 1 }, ...(gate ? [{ pos: gate.inside, r: 2 }] : []), ...(chest ? [{ pos: chest, r: 1 }] : [])];
    for (const s of plantSpots(cells, at, avoid, g)) targets.push({ act: "plant", ...s });
  }
  extra.trees = targets.filter((x) => x.act === "cut").length;
  extra.big = targets.filter((x) => x.act === "cut" && x.big).length;
  extra.spots = targets.filter((x) => x.act === "plant").length;
  extra.growing = growing;
  extra.skipped = Object.values(skipped).reduce((a, b) => a + b, 0);
  if (extra.skipped) {
    extra.why = skipped; // { edge, touching, tooBig, leaves, noRoom, notTree: how many }, for the Work Anchor
    extra.skipAt = skipAt;
  }
  const now = getSite(id);
  if (!now) return;
  now.saplings = [...tracked.values()].slice(-g.maxTargets);
  db.put(EQUIP, now);
}

// The field (0.1.225): its ripe crops, and bare farmland to sow while the chest has seeds.
function* fieldWork(d, cells, chest, targets, extra, typeAt) {
  const g = BALANCE.residents.work;
  const growthAt = (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.permutation.getState("growth");
    } catch {
      return undefined;
    }
  };
  const container = containerAt(d, chest);
  const slots = container ? slotsOf(container) : [];
  extra.seeds = Object.keys(SEED_CROP).reduce((a, s) => a + countIn(slots, s), 0);
  const all = [...cells];
  let growing = 0;
  let bare = 0;
  for (let i = 0; i < all.length && targets.length < g.maxTargets; i += g.targetsPerYield) {
    const r = fieldTasks(new Set(all.slice(i, i + g.targetsPerYield)), typeAt, growthAt, true, g.maxTargets - targets.length, cells);
    for (const x of r.tasks) {
      if (x.act === "sow") {
        bare++;
        if (!extra.seeds) continue;
      }
      targets.push(x);
    }
    growing += r.growing;
    yield;
  }
  extra.ripe = targets.filter((x) => x.act === "harvest").length;
  extra.bare = bare;
  extra.growing = growing;
}

// The research site (0.1.244): its composters in reach of the floor (each a station to study at), and how much plant
// waste the chest holds.
function* researchWork(d, cells, chest, targets, extra, typeAt) {
  const g = BALANCE.residents.work;
  const all = [...cells];
  const seen = new Set();
  for (let i = 0; i < all.length && targets.length < g.maxTargets; i += g.targetsPerYield) {
    for (const t of workTargets(new Set(all.slice(i, i + g.targetsPerYield)), typeAt, isStation, g.maxTargets)) {
      const k = key(t.pos);
      if (seen.has(k) || cells.has(k)) continue;
      seen.add(k);
      targets.push({ ...t, act: "research" });
    }
    yield;
  }
  const container = containerAt(d, chest);
  extra.stations = targets.length;
  extra.waste = container ? wasteIn(slotsOf(container)) : 0;
}

// Mined ores grow back (g.regrowDays later), as a deposit does: only where the rock left in the ore's place is still
// there, still in reach of the site's floor (anything else there, a block a player put, stays as it is).
function* regrow(id, d, cells, targets, typeAt) {
  const rec = getSite(id);
  if (!rec?.spent?.length) return;
  const g = BALANCE.residents.work;
  const today = world.getDay();
  const floor = [...cells].map((k) => k.split(",").map(Number));
  const keep = [];
  let n = 0;
  for (const s of rec.spent) {
    if (today - s.day < g.regrowDays) {
      keep.push(s);
      continue;
    }
    const o = ORES[s.typeId];
    const stand = floor.find(([x, y, z]) => reaches({ x, y, z }, s.pos));
    if (!o || !stand || typeAt(s.pos.x, s.pos.y, s.pos.z) !== o.rock) continue;
    try {
      d.getBlock(s.pos)?.setType(s.typeId);
      targets.push({ pos: s.pos, stand: { x: stand[0], y: stand[1], z: stand[2] }, typeId: s.typeId });
    } catch {
      keep.push(s);
    }
    if (++n % 8 === 0) yield;
  }
  const now = getSite(id);
  if (!now) return;
  now.spent = keep;
  db.put(EQUIP, now);
}

// Not loaded: the last answer stands (a far site works on paper, and its worker walks there), but its floor and ores
// aren't in memory, so nothing there is worked until someone is near.
function unloaded(rec) {
  mem.delete(rec.id);
  if (rec.problem === "unchecked") return finish(rec, "unloaded");
  rec.checkedAt = undefined;
  db.put(EQUIP, rec);
}

function finish(rec, problem) {
  const was = rec.problem;
  rec.problem = problem;
  rec.checkedAt = system.currentTick;
  db.put(EQUIP, rec);
  if (!was && problem && problem !== "unchecked" && problem !== "unloaded" && rec.owner) {
    // It worked and now doesn't: tell the owner, if they're about.
    runLater(() => {
      for (const p of onlinePlayers()) if (p.id === rec.owner) message(p, `§eThe work site at ${rec.pos.x}, ${rec.pos.y}, ${rec.pos.z} needs fixing: use its Work Anchor to see why.`);
    });
  }
}

/** A block changed: sites holding it, or by their anchor, check again. */
export function siteBlockChanged(dimensionId, pos) {
  for (const s of allSites()) {
    if (s.dimension !== dimensionId) continue;
    const b = s.bbox;
    if (b && pos.x >= b.min.x - 1 && pos.x <= b.max.x + 1 && pos.y >= b.min.y - 2 && pos.y <= b.max.y + 3 && pos.z >= b.min.z - 1 && pos.z <= b.max.z + 1) dirty.add(s.id);
    else if (Math.abs(pos.x - s.pos.x) <= 2 && Math.abs(pos.y - s.pos.y) <= 2 && Math.abs(pos.z - s.pos.z) <= 2) dirty.add(s.id);
  }
}

/**
 * Every second: sites changed since, then any not checked for a while (sooner while their worker is there: `busy`).
 * @param {(site: any) => boolean} [busy]
 */
export function tickSites(busy = (site) => false) {
  for (const id of dirty) queueSiteCheck(id);
  dirty.clear();
  const g = BALANCE.residents.work;
  const now = system.currentTick;
  let started = 0;
  for (const s of allSites()) {
    if (started >= 2) break;
    const every = (busy(s) ? g.busyCheckSeconds : g.checkSeconds) * 20;
    if (now - (lastCheck.get(s.id) ?? -Infinity) < every) continue;
    lastCheck.set(s.id, now);
    queueSiteCheck(s.id);
    started++;
  }
}

// --- the worker ---

/** A resident takes the job at a site (one site each, one worker a site). Returns why not, or undefined. */
export function assignWorker(siteId, resId) {
  const rec = getSite(siteId);
  if (!rec) return "gone";
  if (rec.worker && rec.worker !== resId) return "taken";
  for (const other of allSites()) if (other.id !== siteId && other.worker === resId) releaseWorker(other.id);
  rec.worker = resId;
  rec.problem = "unchecked";
  rec.way = undefined;
  db.put(EQUIP, rec);
  recheckSite(siteId);
  return undefined;
}

/** Nobody works at a site any more. */
export function releaseWorker(siteId) {
  const rec = getSite(siteId);
  if (!rec) return;
  rec.worker = undefined;
  rec.way = undefined;
  rec.problem = "noWorker";
  db.put(EQUIP, rec);
  queueSiteCheck(siteId);
}

/** A resident gone (moved out): their site has no worker. */
export function workerGone(resId) {
  for (const s of allSites()) if (s.worker === resId) releaseWorker(s.id);
}

/**
 * Work one ore at a site: the only place work breaks a block. Only an ore (workRules.js ORES) the worker's skill can
 * mine, only within reach of where they stand on the site's measured floor, only in a site that works and was measured
 * a moment ago, and only when the work chest has room for what it gives (put in first); the rock it sat in is left in
 * its place. Returns { ok: true, item, count } or { ok: false, why: "problem" | "stale" | "gone" | "skill" | "full" |
 * "unloaded" | "chest" }.
 */
export function mineTarget(siteId, target, stand, skill, random = Math.random) {
  const rec = getSite(siteId);
  const m = mem.get(siteId);
  if (!rec || rec.problem || !m) return { ok: false, why: "problem" };
  if (!siteFresh(rec)) return { ok: false, why: "stale" };
  if (!m.cells.has(key(stand)) || !reaches(stand, target) || m.cells.has(key(target))) return { ok: false, why: "gone" };
  const d = dim(rec.dimension);
  let block;
  let chestBlock;
  try {
    block = d.getBlock(target);
    chestBlock = rec.chest ? d.getBlock(rec.chest) : undefined;
  } catch {
    block = undefined;
  }
  if (!block) return { ok: false, why: "unloaded" };
  const typeId = block.typeId;
  if (!isOre(typeId)) {
    dropTarget(m, target);
    return { ok: false, why: "gone" };
  }
  if (!canMine(typeId, skill)) return { ok: false, why: "skill" };
  const drop = oreDrop(typeId, random);
  let container;
  try {
    container = chestBlock && CHESTS.test(chestBlock.typeId) ? chestBlock.getComponent("minecraft:inventory")?.container : undefined;
  } catch {
    container = undefined;
  }
  if (!container) return { ok: false, why: "chest" };
  const slots = [];
  for (let i = 0; i < container.size; i++) {
    const it = container.getItem(i);
    slots.push(it ? { typeId: it.typeId, amount: it.amount, max: it.maxAmount } : undefined);
  }
  if (!roomFor(slots, drop.item, drop.count)) return { ok: false, why: "full" };
  try {
    const left = container.addItem(new ItemStack(drop.item, drop.count));
    if (left) return { ok: false, why: "full" };
    block.setType(drop.rock);
    d.playSound("dig.stone", { x: target.x + 0.5, y: target.y + 0.5, z: target.z + 0.5 });
  } catch (error) {
    log(`work: mining ${target.x} ${target.y} ${target.z}: ${error}`);
    return { ok: false, why: "unloaded" };
  }
  dropTarget(m, target);
  rec.targets = m.targets.length;
  rec.spent = [...(rec.spent ?? []), { pos: { x: target.x, y: target.y, z: target.z }, typeId, day: world.getDay() }].slice(-BALANCE.residents.work.maxTargets);
  db.put(EQUIP, rec);
  return { ok: true, item: drop.item, count: drop.count };
}

function dropTarget(m, target) {
  m.targets = m.targets.filter((t) => !(t.pos.x === target.x && t.pos.y === target.y && t.pos.z === target.z));
}

/**
 * Do one task at a site (0.1.225): an ore (mineTarget above), or the woodlot's and the field's (workActs.js), after
 * the same checks: the site works and was measured a moment ago, the worker stands on its floor, their skill does it,
 * and the work chest is there. Returns workActs.js's answer ({ ok, act, item, count } or { ok: false, why }), with
 * "problem", "stale", "chest" and "unloaded" from here.
 */
export function workTask(siteId, task, skill, random = Math.random) {
  if (!task?.act || task.act === "mine") return { act: "mine", ...mineTarget(siteId, task.pos, task.stand, skill, random) };
  const rec = getSite(siteId);
  const m = mem.get(siteId);
  if (!rec || rec.problem || !m) return { ok: false, why: "problem" };
  if (!siteFresh(rec)) return { ok: false, why: "stale" };
  if (!m.cells.has(key(task.stand))) return { ok: false, why: "gone" };
  if (!canDo(task, skill)) return { ok: false, why: "skill" };
  const act = ACTS[task.act];
  if (!act) return { ok: false, why: "gone" };
  const d = dim(rec.dimension);
  const container = containerAt(d, rec.chest);
  if (!container) return { ok: false, why: "chest" };
  const g = kindBalance(m.kind, BALANCE.residents.work);
  let got;
  try {
    got = act({ d, container, cells: m.cells, box: rec.bbox, typeAt: typeReader(d), leafAt: leafReader(d), tracked: new Set((rec.saplings ?? []).map(key)) }, task, skill, g, random);
  } catch (error) {
    log(`work: ${task.act} at ${task.pos.x} ${task.pos.y} ${task.pos.z}: ${error}`);
    return { ok: false, why: "unloaded" };
  }
  if (got.ok || got.why === "gone") dropTask(m, task);
  // 0.1.244: a station is studied at again and again: once each has had its turn, all of them are up again.
  if (got.ok && task.act === "research" && !m.targets.some((x) => x.act === "research")) m.targets = [...m.targets, ...(m.stations ?? [])];
  if (!got.ok && got.why === "gone" && task.act === "research") m.stations = (m.stations ?? []).filter((x) => !(x.pos.x === task.pos.x && x.pos.y === task.pos.y && x.pos.z === task.pos.z));
  if (got.why === "supplies") m.targets = m.targets.filter((x) => x.act !== task.act); // nothing left to plant or sow with
  if (got.ok) {
    if (got.foot || got.planted?.length) {
      const cut = new Set((got.foot ?? []).map(key));
      rec.saplings = [...(rec.saplings ?? []).filter((s) => !cut.has(key(s))), ...(got.planted ?? [])].slice(-g.maxTargets);
    }
    // A tree gone opens floor, and a sapling takes a spot: measured again.
    if (task.act === "cut" || task.act === "plant") dirty.add(siteId);
    db.put(EQUIP, rec);
  }
  return got;
}

function dropTask(m, task) {
  m.targets = m.targets.filter((x) => !(x.act === task.act && x.pos.x === task.pos.x && x.pos.y === task.pos.y && x.pos.z === task.pos.z && x.entityId === task.entityId));
}

/** A woodlot's floor: the saplings, sticks and apples lying on it (for a Skilled tree chopper to pick up), at most 16. */
export function gatherTasks(siteId) {
  const rec = getSite(siteId);
  const m = mem.get(siteId);
  const b = rec?.bbox;
  if (!b || !m) return [];
  const c = { x: (b.min.x + b.max.x + 1) / 2, y: (b.min.y + b.max.y + 1) / 2, z: (b.min.z + b.max.z + 1) / 2 };
  const r = Math.hypot(b.max.x - b.min.x + 1, b.max.y - b.min.y + 1, b.max.z - b.min.z + 1) / 2 + 1;
  let es;
  try {
    es = dim(rec.dimension).getEntities({ type: "minecraft:item", location: c, maxDistance: r });
  } catch {
    return [];
  }
  const out = [];
  for (const e of es) {
    let stack;
    try {
      stack = e.getComponent("minecraft:item")?.itemStack;
    } catch {
      stack = undefined;
    }
    if (!stack || !GATHER.has(stack.typeId)) continue;
    const p = { x: Math.floor(e.location.x), y: Math.floor(e.location.y), z: Math.floor(e.location.z) };
    if (!m.cells.has(key(p))) continue;
    out.push({ act: "gather", pos: p, stand: p, entityId: e.id, typeId: stack.typeId });
    if (out.length >= 16) break;
  }
  return out;
}

/** A block placed by a player (0.1.225): a sapling put on a woodlot's floor is one of its trees to be. */
export function siteBlockPlaced(dimensionId, pos, typeId) {
  if (!SAPLING_LOG[typeId]) return;
  for (const s of allSites()) {
    const b = s.bbox;
    if (s.dimension !== dimensionId || !b || pos.x < b.min.x || pos.x > b.max.x || pos.z < b.min.z || pos.z > b.max.z || pos.y < b.min.y || pos.y > b.max.y + 1) continue;
    const k = key(pos);
    if ((s.saplings ?? []).some((x) => key(x) === k)) continue;
    s.saplings = [...(s.saplings ?? []), { x: pos.x, y: pos.y, z: pos.z, typeId }].slice(-BALANCE.residents.work.maxTargets);
    db.put(EQUIP, s);
  }
}

// --- the Work Anchor ---

/** The player who placed a Work Anchor owns its site and hears what it needs (`quiet`, 0.1.227: the test setup's, not). */
export function anchorPlaced(player, block, quiet = false) {
  const rec = ensure(block);
  rec.owner = player.id;
  rec.ownerName = player.name;
  db.put(EQUIP, rec);
  queueSiteCheck(rec.id);
  if (!quiet) message(player, "§aWork Anchor placed. §fUse it to choose who works here and see what the site needs: fenced in all round, a fence gate, a chest or barrel beside the anchor, and a path from the worker's front door to the gate. Work sites are outside the zoo's fence.");
}

export function workAnchorComponent(openMenu) {
  return {
    onPlace(e) {
      const rec = ensure(e.block);
      runLater(() => queueSiteCheck(rec.id));
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      queueSiteCheck(rec.id);
      runLater(() => openMenu(player, rec.id));
    },
    onPlayerBreak(e) {
      forget(posKey(e.block.dimension.id, e.block.location));
    },
  };
}

function forget(id) {
  db.remove(EQUIP, id);
  mem.delete(id);
  dirty.delete(id);
  lastCheck.delete(id);
  passing.delete(id);
}

/** Bench only: a site's record and what it holds in memory, for the log. */
export function siteDebug(id) {
  const rec = getSite(id);
  const m = mem.get(id);
  const acts = {};
  for (const x of m?.targets ?? []) acts[x.act ?? "mine"] = (acts[x.act ?? "mine"] ?? 0) + 1;
  return { problem: rec?.problem, worker: rec?.worker, kind: m?.kind, cells: rec?.cells, gate: rec?.gate, chest: rec?.chest, targets: m?.targets?.length ?? 0, acts, work: rec?.work, saplings: rec?.saplings?.length ?? 0, way: rec?.way?.length ?? 0, spent: rec?.spent?.length ?? 0, fresh: siteFresh(rec) };
}
