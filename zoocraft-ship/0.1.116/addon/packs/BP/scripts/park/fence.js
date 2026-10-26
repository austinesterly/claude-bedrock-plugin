import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { BLOCKS } from "../data/items.js";
import { on, emit } from "../core/events.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { getPark, parkEdge, setFencedArea, areaRecordId, setEntrance, allParks, forEachPark, inPark, parkName } from "./park.js";
import { areaSteps, colKey, parseCol, insideArea, sameArea, fenceState, statusText, changeText, edgeDistance } from "./fenceRules.js";
import { cellsOf } from "../equipment/multiblock.js";
import { linkedPermutation, relinkAt, relinkBlock } from "../equipment/endFence.js";
import { blockChanged } from "../exhibits/exhibits.js";
import { dim, heldItem, message, onlinePlayers } from "../platform/mc.js";

// The fenced park area (0.1.101, idea 12; research/fence_plan.md): the Aluminum Fence and its gate, the list of the
// park's fence blocks, and the job that works out the park's area from them (park/fenceRules.js areaSteps).
//
// 0.1.103 (Austin, with a photo of an ornamental picket fence: "The alumium fence can be a block, and it should look
// like this but silver"): the Aluminum Fence is a full block of silver pickets (gen/fence103.py), with no link states:
// a row of them is one fence, and its culling rules hide the faces between two of them. The End Fences beside one
// still reach out to it (equipment/endFence.js), so relinkAt stays in its place and break events.
//
// The list ("fence" collection, a record per dimension: "x,y,z" -> kind) holds every Aluminum Fence, Aluminum Fence
// Gate and Park Entrance Gate block, kept by their own place and break events (any means: a player, an explosion, the
// benchmark builder), so it never scans the world and works with far parts of the park unloaded. Each run checks the
// listed blocks in loaded chunks against the world, so one removed by a command drops out. The run waits until the
// fence has been left alone for a few seconds (BALANCE.park.fenceSettleTicks), then fills as a job. A closed fence's
// area is saved (the "area" record) and handed to park/park.js, which every "inside the park" question asks. Only
// this module writes the "fence" collection.
//
// 0.1.114 (several parks a world): the list stays one a dimension (a fence block is a fence block, whichever park it
// ends up round); each park has its own run (its own settle timer, builder and job), fills from its own Park Deed
// spot and keeps its own area record. A fence change in a dimension puts every park there on the timer. A fence that
// closes round another park's spot too is refused ("overlap"): the park keeps its last area and its members are told
// which park is inside.

const COL = "fence";
const FENCE = 1;
const GATE = 2;
const ENTRANCE = 3; // the Park Entrance Gate's threshold block (the main block)
const ENTRANCE_PART = 4; // its pillars and beams
const TYPE_OF = { [FENCE]: BLOCKS.aluminumFence, [GATE]: BLOCKS.aluminumGate, [ENTRANCE]: BLOCKS.entranceGate, [ENTRANCE_PART]: BLOCKS.entranceGatePart };
/** @type {any} */
const OPEN = "zoocraft:open";
/** @type {any} */
const FACING = "minecraft:cardinal_direction";

const posKey = (p) => `${p.x},${p.y},${p.z}`;

function listOf(dimensionId) {
  return db.get(COL, dimensionId) ?? { id: dimensionId, blocks: {} };
}

function note(dimensionId, pos, kind) {
  const rec = listOf(dimensionId);
  rec.blocks[posKey(pos)] = kind;
  db.put(COL, rec);
}

function drop(dimensionId, pos) {
  const rec = db.get(COL, dimensionId);
  const k = posKey(pos);
  if (!rec || rec.blocks[k] === undefined) return;
  delete rec.blocks[k];
  db.put(COL, rec);
}

// --- when the area is worked out ---

// One run a park (0.1.114): { due: the tick its next run may start, after the fence was last changed; builder: the
// player who changed it last, told how the fence stands when the run is done; running }.
const runs = new Map();
let started = false;
function runOf(park) {
  let r = runs.get(park.id);
  if (!r) runs.set(park.id, (r = { due: undefined, builder: undefined, running: false }));
  return r;
}

/** The fence changed in `dimensionId` (by `playerId`, if a player): every park there works its area out again once
 * it's left alone. */
export function fenceTouched(dimensionId, playerId = undefined) {
  for (const park of allParks()) {
    if (park.dimension !== dimensionId) continue;
    const r = runOf(park);
    r.due = system.currentTick + BALANCE.park.fenceSettleTicks;
    if (playerId) r.builder = playerId;
  }
}

// Every second (main.js).
export function tickFence() {
  if (!started) {
    started = true;
    for (const park of allParks()) runOf(park).due = system.currentTick; // once after the world loads: the entrance gate, and blocks gone while it was shut
  }
  forEachPark((park) => {
    const r = runOf(park);
    if (r.running || r.due === undefined || system.currentTick < r.due) return;
    r.due = undefined;
    const who = r.builder;
    r.builder = undefined;
    r.running = true;
    system.runJob(
      timedJob(
        "fence",
        inPark(park, (function* () {
          try {
            yield* work(park, who);
          } catch (error) {
            log(`fence: working out ${parkName(park)}'s area failed: ${error}`);
          } finally {
            r.running = false;
          }
        })()),
      ),
    );
  });
}

/** Work the scope's park's area out now, inside the caller's job (the benchmark builder, once its fence is up). */
export function* fenceAreaNow() {
  const park = getPark();
  if (!park) return;
  const r = runOf(park);
  while (r.running) yield;
  r.due = undefined;
  r.running = true;
  try {
    yield* work(park, undefined);
  } finally {
    r.running = false;
  }
}

function* work(park, who) {
  const d = dim(park.dimension);
  noteOldEntrance(park, d);
  // The listed blocks, checked against the world where it's loaded: a column with any of them in it, at any height,
  // is a fence column (and the height of one of its blocks, for the messages).
  const rec = db.get(COL, park.dimension);
  const blocks = rec?.blocks ?? {};
  const cols = new Map();
  let aluminum = 0;
  let dropped = 0;
  let relinked = 0;
  let n = 0;
  for (const key of Object.keys(blocks)) {
    const kind = blocks[key];
    const [x, y, z] = key.split(",").map(Number);
    let block;
    try {
      block = d.getBlock({ x, y, z });
    } catch {
      block = undefined; // not loaded: it stays on the list
    }
    if (block && block.typeId !== TYPE_OF[kind]) {
      delete blocks[key];
      dropped++;
      continue;
    }
    if (kind === FENCE || kind === GATE) aluminum++;
    // 0.1.116 (Austin, on 0.1.115 in a world whose ring /zoocraft:build had put up before it: "The fence problem is
    // they only work facing a certain direction"): a fence a script placed before 0.1.115 has no link states, so its
    // slab runs along x whichever way its row goes. Every listed fence in a loaded chunk gets its states set from its
    // neighbours here, once after the world loads and after every change; a fence already right is left alone.
    if (kind === FENCE && block) {
      try {
        if (relinkBlock(block)) relinked++;
      } catch {
        // a neighbour's chunk unloaded: next time
      }
    }
    const ck = colKey(x, z);
    if (!cols.has(ck)) cols.set(ck, y);
    if (++n % 64 === 0) yield;
  }
  if (dropped) {
    db.put(COL, rec);
    log(`fence: ${dropped} listed fence blocks are gone from the world`);
  }
  if (relinked) log(`fence: ${relinked} Aluminum Fence blocks joined to their neighbours`);
  const list = [...cols.keys()].map(parseCol);
  const r = yield* areaSteps(list, park.center, BALANCE.park.fenceCellsPerSlice);
  settle(db.get("park", park.id) ?? park, r, aluminum, cols, who);
}

// A Park Entrance Gate placed before 0.1.101 isn't on the list: the park's own entrance goes on it once it's loaded.
function noteOldEntrance(park, d) {
  const ent = park.entrance;
  if (!ent || ent.dimension !== park.dimension || listOf(park.dimension).blocks[posKey(ent)] !== undefined) return;
  try {
    const block = d.getBlock(ent);
    if (block?.typeId === BLOCKS.entranceGate) listEntranceGate(block);
  } catch {
    // not loaded: next time
  }
}

function listEntranceGate(block) {
  const dir = block.permutation.getState(FACING) ?? "north";
  for (const { part, pos } of cellsOf(BLOCKS.entranceGate, block.location, dir)) note(block.dimension.id, pos, part === 0 ? ENTRANCE : ENTRANCE_PART);
}

/** A Park Entrance Gate (its threshold block) was placed at `block` and its arch built: the whole arch goes on the list. */
export function noteEntranceGate(block) {
  listEntranceGate(block);
  fenceTouched(block.dimension.id);
}

function members(park) {
  return onlinePlayers().filter((p) => park.members[p.id]);
}

// 0.1.114: an exhibit whose controller was placed before the fence closed, in a world with several parks, had no park
// to say (or the wrong one: parkAt found nothing). Once the fence holds it, it's this park's.
function adoptExhibits(park, area) {
  for (const ex of db.all("exhibits")) {
    if (ex.parkId === park.id || ex.dimension !== park.dimension || !ex.controller) continue;
    if (!insideArea(area, ex.controller.x, ex.controller.z)) continue;
    ex.parkId = park.id;
    db.put("exhibits", ex);
  }
}

function settle(park, r, aluminum, cols, who) {
  const rec = db.get(COL, areaRecordId(park)) ?? { id: areaRecordId(park) };
  const was = rec.status?.state;
  const prev = rec.last && rec.last.dimension === park.dimension && rec.last.cx === park.center.x && rec.last.cz === park.center.z ? rec.last : undefined;
  let state = fenceState(r, aluminum);
  // 0.1.114: a fence that closes round another park's Park Deed spot too would make one park of two: refused.
  const other = state === "closed" ? allParks().find((p) => p.id !== park.id && p.dimension === park.dimension && insideArea(r.area, p.center.x, p.center.z)) : undefined;
  if (other) state = "overlap";
  let next = prev;
  if (state === "closed") next = { dimension: park.dimension, cx: park.center.x, cz: park.center.z, ...r.area };
  else if (state === "none") next = undefined; // the fence is all gone: the park has no ground again
  // Where a gap is, at the height of the fence nearest it.
  let gap;
  if (r.gap) {
    let best = Infinity;
    let y = park.center.y;
    for (const [ck, cy] of cols) {
      const [x, z] = parseCol(ck);
      const dd = (x - r.gap.x) ** 2 + (z - r.gap.z) ** 2;
      if (dd < best) {
        best = dd;
        y = cy;
      }
    }
    gap = { x: r.gap.x, y, z: r.gap.z };
  }
  const changed = !sameArea(prev, next);
  if (state === "closed") adoptExhibits(park, next);
  rec.last = next;
  rec.status = { state, gap, fence: r.fence, ground: next?.ground, cells: next?.cells, other: other ? { name: parkName(other), x: other.center.x, y: other.center.y, z: other.center.z } : undefined, at: Date.now() };
  db.put(COL, rec);
  if (changed) {
    setFencedArea(next, park);
    db.flush(COL);
    log(`fence: ${parkName(park)}'s area is ${next ? `${next.cells} columns inside the fence` : "back to no fence"}`);
    emit("parkAreaChanged", { area: next });
    if (next) entranceInside(park, next);
  }
  const ctx = { center: park.center, edge: parkEdge(park) };
  const news = changeText(was, rec.status, prev !== undefined, ctx);
  if (news) for (const p of members(park)) message(p, news);
  else if (who) {
    const p = onlinePlayers().find((q) => q.id === who);
    if (p) {
      try {
        p.onScreenDisplay.setActionBar(statusText(rec.status, ctx, true));
      } catch {
        // left meanwhile
      }
    }
  }
}

// A fence that closes with the park's entrance outside it: a listed Park Entrance Gate inside the fence becomes the
// entrance instead, or the park closes until one is put in the fence or inside it (guests can't come in from outside).
function entranceInside(park, area) {
  const ent = park.entrance;
  if (ent && ent.dimension === park.dimension && insideArea(area, ent.x, ent.z)) return;
  for (const [key, kind] of Object.entries(listOf(park.dimension).blocks)) {
    if (kind !== ENTRANCE) continue;
    const [x, y, z] = key.split(",").map(Number);
    if (!insideArea(area, x, z)) continue;
    setEntrance(park.dimension, { x, y, z });
    for (const p of members(park)) message(p, `§aThe Park Entrance Gate at ${x} ${y} ${z} is the park's entrance${park.open ? "" : ": use it to open the park"}.`);
    return;
  }
  if (!ent) return;
  setEntrance(undefined, undefined);
  for (const p of members(park)) message(p, `§eThe Park Entrance Gate at ${ent.x} ${ent.y} ${ent.z} is outside the park's fence now, so the park has closed. §fPut a Park Entrance Gate in the fence or inside it, then use it to open the park again.`);
}

// --- the blocks ---

function here(block) {
  return { x: block.x, y: block.y, z: block.z };
}

let builder; // the player who last placed a fence block or gate (beforeOnPlayerPlace has the player; onPlace doesn't)

export function aluminumFenceComponent() {
  return {
    beforeOnPlayerPlace(e) {
      if (e.player) builder = e.player.id;
      // 0.1.110: the arms are part of the placed block, so the fence appears already joined to its neighbours.
      try {
        e.permutationToPlace = linkedPermutation(BLOCKS.aluminumFence, e.block.dimension, e.block.location);
      } catch {
        // set a tick later by onPlace instead
      }
    },
    onPlace(e) {
      const d = e.block.dimension;
      const pos = here(e.block);
      note(d.id, pos, FENCE);
      fenceTouched(d.id, builder);
      system.run(() => relinkAt(d, pos));
    },
    onBreak(e) {
      const d = e.dimension;
      const pos = here(e.block);
      drop(d.id, pos);
      const by = e.entitySource?.typeId === "minecraft:player" ? e.entitySource.id : undefined;
      fenceTouched(d.id, by);
      system.run(() => relinkAt(d, pos));
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player || heldItem(player)) return;
      system.run(() => message(player, `§6Aluminum Fence: §f${statusText(db.get(COL, "area")?.status, statusContext(), false)}. A thin panel of silver pickets, half a block wide and a block and a half high, so animals can't jump it; it joins the fences, gates and blocks beside it. Copper ingots and iron nuggets at the Zoo Workshop.`));
    },
  };
}

export function aluminumGateComponent() {
  return {
    beforeOnPlayerPlace(e) {
      if (e.player) builder = e.player.id;
    },
    onPlace(e) {
      const d = e.block.dimension;
      const pos = here(e.block);
      note(d.id, pos, GATE);
      fenceTouched(d.id, builder);
      system.run(() => relinkAt(d, pos));
    },
    onBreak(e) {
      const d = e.dimension;
      const pos = here(e.block);
      drop(d.id, pos);
      const by = e.entitySource?.typeId === "minecraft:player" ? e.entitySource.id : undefined;
      fenceTouched(d.id, by);
      system.run(() => relinkAt(d, pos));
    },
    // Anyone opens and shuts it, as a vanilla gate. Open or shut it is part of the park's fence; in an exhibit's fence
    // an open one is a gap like any other gate (platform/mc.js reads zoocraft:open).
    onPlayerInteract(e) {
      const d = e.block.dimension;
      const pos = here(e.block);
      system.run(() => {
        let block;
        try {
          block = d.getBlock(pos);
        } catch {
          return;
        }
        if (block?.typeId !== BLOCKS.aluminumGate) return;
        const open = !block.permutation.getState(OPEN);
        block.setPermutation(block.permutation.withState(OPEN, open));
        try {
          d.playSound(open ? "random.door_open" : "random.door_close", { x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5 });
        } catch {
          // sound is cosmetic
        }
        blockChanged(d.id, pos); // an exhibit with this gate in its fence measures again
      });
    },
  };
}

function statusContext() {
  const park = getPark();
  return { center: park?.center ?? { x: 0, y: 0, z: 0 }, edge: parkEdge(park) };
}

/** For the Park Ledger: one line on what marks the park's edge. */
export function fenceSummary() {
  const park = getPark();
  if (!park) return "";
  return statusText(db.get(COL, areaRecordId(park))?.status, statusContext(), false);
}

/** How far the column (x, z) is from the park's fence, sideways (conservation releases, 0.1.101). */
export function distanceFromFence(x, z) {
  const park = getPark();
  if (!park) return Infinity;
  const cols = [];
  for (const key of Object.keys(listOf(park.dimension).blocks)) {
    const [bx, , bz] = key.split(",").map(Number);
    cols.push([bx, bz]);
  }
  return edgeDistance(cols, x, z);
}

export function initFence() {
  on("parkClaimed", (park) => fenceTouched(park.dimension));
}
