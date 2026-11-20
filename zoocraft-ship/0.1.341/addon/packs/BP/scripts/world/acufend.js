// 0.1.341: Acufend in the game (rules: world/acufendRules.js; numbers: BALANCE.acufend). The Lightning TNT Frequency
// Stick going off against an upright Crying Obsidian frame lights it (world/vision.js asks here); a player standing in
// the portal goes through, onto a pad with a lit frame to come back by. Acufend's land is built a chunk at a time round
// each player there, by one job that never takes more than a slice of a tick. The game has no "standing in a block"
// event, so every 4 ticks each player's feet and head are looked at (as the sea and Void portals). Austin, 2026-11-15:
// "load the area you are teleporting to before the teleport": the pad's chunks, or the way back's, are loaded first.
import { world, system, GameMode, ListBlockVolume, BlockVolume, BlockPermutation } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { portalStep, neighbours, readBack, writeBack } from "../fishing/portalRules.js";
import { seedOf } from "../fishing/islandRules.js";
import { withLoadedIn } from "../fishing/islands.js";
import { ACUFEND, ACU_PORTAL, ACU_AXIS, ACU_FRAME, ACU_BACK_KEY, FLOOR, FLOOR_Y, lightAcuPortal, acuPortalStillWhole, acuSpot, chunkSpikes, chunkGrounds, chunkFloor, columnRuns, chunksAround, arrivalSpot, arrivalPlan, knownSpotNear } from "./acufendRules.js";

const K = () => BALANCE.acufend;
const AIR_ONLY = { blockFilter: { includeTypes: ["minecraft:air"] } };
const LIT_IN = new Set(["minecraft:overworld", ACUFEND]);
/** Acufend's arrival pads made so far: { id "x,z", x, y, z } (the frame on each is mended whenever it is used). */
const SPOTS = "acufendSpots";
const PAD = "minecraft:polished_blackstone";
const DEEP = "minecraft:deepslate";
/** player id -> { t, held, going } */
const states = new Map();
const told = new Set();

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function blockId(d, x, y, z) {
  try {
    return d.getBlock({ x, y, z })?.typeId;
  } catch {
    return undefined;
  }
}

function play(player, sound, volume = 1) {
  try {
    player.playSound(sound, { volume });
  } catch {
    // none
  }
}

function tellOnce(player, key, text) {
  if (!player || told.has(`${player.id}:${key}`)) return;
  told.add(`${player.id}:${key}`);
  message(player, text);
}

export function acufendDimension() {
  try {
    return world.getDimension(ACUFEND);
  } catch {
    return undefined;
  }
}

let seed;
/** The world's own Acufend: the same land for everyone in this world, whatever order it is explored in. */
const acuSeed = () => (seed ??= (seedOf(world.seed) ^ 0x41c0fe9d) >>> 0);

function fill(d, cells, block, options) {
  for (let i = 0; i < cells.length; i += 2000) d.fillBlocks(new ListBlockVolume(cells.slice(i, i + 2000)), block, options);
}

let tipBlock;
/** A spike's point: standing pointed dripstone (plain dripstone if this game has other states for it). */
function tip() {
  if (tipBlock === undefined) {
    try {
      tipBlock = BlockPermutation.resolve("minecraft:pointed_dripstone", { dripstone_thickness: "tip", hanging: false });
    } catch {
      tipBlock = "minecraft:dripstone_block";
    }
  }
  return tipBlock;
}

// ---- the land, built round the players there

const built = new Set(); // chunks known to be built this session, "cx,cz"
/** @type {{ key: string, cx: number, cz: number, waiters: ((ok: boolean) => void)[] }[]} */
const queue = [];
const queued = new Map();
/** chunk -> times its building failed this session (3 and it is let be, so a chunk that can't be built costs nothing) */
const failures = new Map();
let running = false;
const stats = { built: 0, ms: 0, worst: 0, setMs: 0, worstSet: 0, dropped: 0, failed: 0, aheadFailed: 0 };
const ckey = (cx, cz) => `${cx},${cz}`;

function loaded(d, cx, cz) {
  try {
    return d.isChunkLoaded({ x: cx * 16, y: 0, z: cz * 16 });
  } catch {
    return false;
  }
}

/** Whether a chunk is built: its bedrock floor goes in last, so a chunk with it is whole. */
function isBuilt(d, cx, cz) {
  const key = ckey(cx, cz);
  if (built.has(key)) return true;
  if (blockId(d, cx * 16, FLOOR_Y, cz * 16) !== FLOOR) return false;
  built.add(key);
  return true;
}

/** Asks for a chunk to be built (`first`: before the rest). Resolves true once it is, false if it wasn't loaded. */
function want(cx, cz, first) {
  const key = ckey(cx, cz);
  let e = queued.get(key);
  if (!e) {
    e = { key, cx, cz, waiters: [] };
    queued.set(key, e);
    if (first) queue.unshift(e);
    else queue.push(e);
  } else if (first) {
    queue.splice(queue.indexOf(e), 1);
    queue.unshift(e);
  }
  const entry = e;
  const p = new Promise((res) => entry.waiters.push(res));
  pump();
  return p;
}

function pump() {
  if (running || !queue.length) return;
  running = true;
  system.runJob(timedJob("acufend", builder()));
}

function* builder() {
  try {
    while (queue.length) {
      const e = /** @type {any} */ (queue.shift());
      queued.delete(e.key);
      const d = acufendDimension();
      let ok = false;
      if (d && loaded(d, e.cx, e.cz)) {
        try {
          if (isBuilt(d, e.cx, e.cz)) ok = true;
          else {
            // (a yield* alone: the game's script engine can't have one inside a longer expression in a try)
            const done = yield* buildChunk(d, e.cx, e.cz, acuSeed(), K());
            ok = done;
          }
        } catch (error) {
          // unloaded part way (it is built again from the start when it is next wanted)
          stats.failed++;
          failures.set(e.key, (failures.get(e.key) ?? 0) + 1);
          if (stats.failed <= 3) log(`acufend: chunk ${e.key} not built: ${error}`);
        }
      } else stats.dropped++;
      for (const r of e.waiters) r(ok);
      yield;
    }
  } finally {
    running = false;
  }
}

/**
 * One chunk of Acufend: its columns worked out a row of 16 at a step (nothing set yet), then set a fill at a step:
 * the deep rock 16 high at a time, every other block by kind, 2000 at a time, and the bedrock floor last.
 */
function* buildChunk(d, cx, cz, s, k) {
  let t = Date.now();
  let ms = 0;
  const x0 = cx * 16, z0 = cz * 16;
  const grounds = chunkGrounds(s, cx, cz, k);
  const floor = chunkFloor(s, cx, cz, k, grounds);
  const spikes = chunkSpikes(s, cx, cz, k);
  /** @type {Map<string, {x: number, y: number, z: number}[]>} */
  const lists = new Map();
  const tips = [];
  for (let dx = 0; dx < 16; dx++) {
    for (let dz = 0; dz < 16; dz++) {
      const x = x0 + dx, z = z0 + dz;
      const c = columnRuns(s, x, z, k, spikes, floor, grounds[dx * 16 + dz]);
      for (const [y0, y1, b] of c.runs) {
        let l = lists.get(b);
        if (!l) lists.set(b, (l = []));
        for (let y = y0; y <= y1; y++) l.push({ x, y, z });
      }
      if (c.tip) tips.push({ x, y: c.top + 1, z });
    }
    ms += Date.now() - t;
    yield;
    t = Date.now();
  }
  const sets = [];
  for (let y = FLOOR_Y + 1; y <= floor; y += 16) {
    const top = Math.min(floor, y + 15);
    sets.push(() => d.fillBlocks(new BlockVolume({ x: x0, y, z: z0 }, { x: x0 + 15, y: top, z: z0 + 15 }), DEEP));
  }
  for (const [b, l] of lists) for (let i = 0; i < l.length; i += 2000) sets.push(() => d.fillBlocks(new ListBlockVolume(l.slice(i, i + 2000)), b));
  if (tips.length) sets.push(() => d.fillBlocks(new ListBlockVolume(tips), tip()));
  // the floor last: a chunk with it is whole
  sets.push(() => d.fillBlocks(new BlockVolume({ x: x0, y: FLOOR_Y, z: z0 }, { x: x0 + 15, y: FLOOR_Y, z: z0 + 15 }), FLOOR));
  ms += Date.now() - t;
  for (const set of sets) {
    t = Date.now();
    set();
    const dt = Date.now() - t;
    ms += dt;
    stats.setMs += dt;
    stats.worstSet = Math.max(stats.worstSet, dt);
    yield;
  }
  built.add(ckey(cx, cz));
  stats.built++;
  stats.ms += ms;
  stats.worst = Math.max(stats.worst, ms);
  return true;
}

/** The chunks of the box from..to built (the ones loaded); `first`: before anything else waiting. */
function buildBox(from, to, first = true) {
  const asks = [];
  for (let cx = Math.floor(from.x / 16); cx <= Math.floor(to.x / 16); cx++) for (let cz = Math.floor(from.z / 16); cz <= Math.floor(to.z / 16); cz++) asks.push(want(cx, cz, first));
  return Promise.all(asks);
}

/** player id -> true while the land ahead of them is loaded and built */
const ahead = new Map();

/**
 * The game only keeps the chunks nearest a player loaded (4 round them, by default), too few to hide Acufend's edge
 * in its fog; so the rest of the square buildRadius round them is loaded for a while (a ticking area) and built.
 */
function buildAhead(d, p, l, r) {
  if (ahead.has(p.id)) return;
  let need = false;
  for (const [cx, cz] of chunksAround(l.x, l.z, r)) {
    const key = ckey(cx, cz);
    if (!built.has(key) && (failures.get(key) ?? 0) < 3) {
      need = true;
      break;
    }
  }
  if (!need) return;
  const cx = Math.floor(l.x / 16), cz = Math.floor(l.z / 16);
  const from = { x: (cx - r) * 16, z: (cz - r) * 16 }, to = { x: (cx + r) * 16 + 15, z: (cz + r) * 16 + 15 };
  ahead.set(p.id, true);
  withLoadedIn(d, `zoocraft_acu_ahead_${p.id}`, from, to, () => buildBox(from, to, false))
    .catch((error) => {
      stats.aheadFailed++;
      if (stats.aheadFailed <= 3) log(`acufend: the land round ${p.name} not loaded: ${error}`);
    })
    .finally(() => ahead.delete(p.id));
}

/**
 * Every second: the land round each player in Acufend, nearest first: the chunks the game has loaded round them at
 * once, then the rest of the square BALANCE.acufend.buildRadius round them.
 */
export function tickAcufend() {
  const d = acufendDimension();
  if (!d) return;
  let players;
  try {
    players = d.getPlayers();
  } catch {
    return;
  }
  const r = K().buildRadius;
  for (const p of players) {
    let l;
    try {
      l = p.location;
    } catch {
      continue;
    }
    for (const [cx, cz] of chunksAround(l.x, l.z, r)) {
      const key = ckey(cx, cz);
      if (built.has(key) || queued.has(key) || (failures.get(key) ?? 0) >= 3 || !loaded(d, cx, cz) || isBuilt(d, cx, cz)) continue;
      want(cx, cz, false);
    }
    buildAhead(d, p, l, r);
  }
}

// ---- the portal

/**
 * The stick has gone off against a block (`hit`, from projectileHitBlock; `at` where it landed; `owner` the thrower,
 * if online). Against Crying Obsidian it lights the frame that block is part of. Returns "lit", or why not ("place",
 * "frame"), or undefined when it hit anything else.
 */
export function acufendStickHit(d, hit, at, owner) {
  const block = hit?.block;
  if (!block || block.typeId !== ACU_FRAME) return undefined;
  if (!LIT_IN.has(d.id)) {
    tellOnce(owner, "place", "§7The Crying Obsidian hums, then goes still. The way to Acufend only opens from the Overworld.");
    return "place";
  }
  const b = block.location;
  const f = /** @type {any} */ (hit.face);
  const step = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] }[f] ?? [0, 1, 0];
  // where to look for the frame's inside: past the face it struck, where it lay, then all round the block it struck
  const tries = [{ x: b.x + step[0], y: b.y + step[1], z: b.z + step[2] }, { x: Math.floor(at.x), y: Math.floor(at.y), z: Math.floor(at.z) }, ...neighbours(b)];
  let look = { x: 0, y: 0, z: 1 };
  try {
    if (owner) look = owner.getViewDirection();
  } catch {
    // facing south, as good as any
  }
  const get = (x, y, z) => blockId(d, x, y, z);
  const seen = new Set();
  for (const start of tries) {
    const key = `${start.x},${start.y},${start.z}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const portal = lightAcuPortal(get, start, look, K().frame);
    if (!portal) continue;
    fill(d, portal.cells, BlockPermutation.resolve(ACU_PORTAL, { [ACU_AXIS]: portal.axis }), AIR_ONLY);
    try {
      d.playSound("portal.trigger", start, { volume: 0.7, pitch: 0.8 });
      d.playSound("ambient.weather.lightning.impact", start, { volume: 0.5, pitch: 1.3 });
    } catch {
      // no sound, no matter
    }
    return "lit";
  }
  tellOnce(owner, "frame", "§7The stick crackles against the Crying Obsidian. A whole upright frame of it, 4 wide and 5 tall or bigger and empty in the middle, would catch.");
  return "frame";
}

function inPortal(player) {
  try {
    const d = player.dimension;
    const l = player.location;
    const x = Math.floor(l.x);
    const z = Math.floor(l.z);
    return blockId(d, x, Math.floor(l.y), z) === ACU_PORTAL || blockId(d, x, Math.floor(l.y + 1.2), z) === ACU_PORTAL;
  } catch {
    return false;
  }
}

/** Off any mount, and nothing riding them: the game won't take a player with riders to another dimension. */
function unmount(player) {
  try {
    const on = player.getComponent("minecraft:riding")?.entityRidingOn;
    on?.getComponent("minecraft:rideable")?.ejectRider(player);
  } catch {
    // not riding
  }
  try {
    player.getComponent("minecraft:rideable")?.ejectRiders();
  } catch {
    // nothing riding them
  }
}

function fade(player) {
  try {
    player.camera.fade({ fadeColor: { red: 0.42, green: 0.16, blue: 0.5 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.5, fadeOutTime: 0.9 } });
  } catch {
    // no camera control here
  }
}

/** The pad a portal at x z of the Overworld opens onto: one already made near its spot, else a new one. */
function padFor(x, z) {
  const k = K();
  const spot = acuSpot(x, z, k);
  const known = knownSpotNear(db.all(SPOTS), spot, k.linkRange);
  return known ?? arrivalSpot(acuSeed(), spot.x, spot.z, k);
}

/** pad id -> its making under way (a player waiting in a portal and the trip itself ask for the same pad) */
const making = new Map();

/**
 * The pad at `spot` loaded, the land round it built, the pad made the first time, its frame and portal mended every
 * time (only where there is air, so a player's blocks stay). Returns where a player arrives.
 */
export function ensurePad(spot) {
  const id = `${spot.x},${spot.z}`;
  let p = making.get(id);
  if (!p) {
    p = makePad(spot, id).finally(() => making.delete(id));
    making.set(id, p);
  }
  return p;
}

async function makePad(spot, id) {
  const d = acufendDimension();
  if (!d) throw new Error("no Acufend dimension");
  const plan = arrivalPlan(spot);
  await withLoadedIn(d, `zoocraft_acu_${spot.x}_${spot.z}`.replace(/-/g, "m"), plan.from, plan.to, async (dim) => {
    const oks = await buildBox(plan.from, plan.to);
    if (oks.some((ok) => !ok)) throw new Error(`the land round the pad at ${id} did not build`);
    if (!db.get(SPOTS, id)) {
      fill(dim, plan.clear, "minecraft:air");
      fill(dim, plan.pad, PAD);
      db.put(SPOTS, { id, x: spot.x, y: spot.y, z: spot.z });
    }
    fill(dim, plan.frame, ACU_FRAME, AIR_ONLY);
    fill(dim, plan.inside, BlockPermutation.resolve(ACU_PORTAL, { [ACU_AXIS]: plan.axis }), AIR_ONLY);
  });
  return plan.arrive;
}

async function toAcufend(player) {
  const from = player.dimension;
  const spot = padFor(player.location.x, player.location.z);
  const arrive = await ensurePad(spot);
  if (!inPortal(player) || player.dimension.id !== from.id) return false; // stepped out while it was made
  const d = acufendDimension();
  if (!d) return false;
  let ry = 0;
  try {
    ry = player.getRotation().y;
  } catch {
    ry = 0;
  }
  player.setDynamicProperty(ACU_BACK_KEY, writeBack(from.id, player.location, ry));
  unmount(player);
  fade(player);
  await withLoadedIn(d, `zoocraft_acu_in_${player.id}`, { x: arrive.x - 8, z: arrive.z - 8 }, { x: arrive.x + 8, z: arrive.z + 8 }, () => {
    player.teleport(arrive, { dimension: d, rotation: { x: 0, y: 0 } });
  });
  play(player, "portal.travel", 0.35);
  return true;
}

/** Where a player goes back to: where they came through, else their spawn point, else the world's. */
function wayBack(player) {
  let back;
  try {
    back = readBack(player.getDynamicProperty(ACU_BACK_KEY));
  } catch {
    back = undefined;
  }
  if (back) return back;
  let sp;
  try {
    sp = player.getSpawnPoint();
  } catch {
    sp = undefined;
  }
  if (sp) return { d: sp.dimension.id, x: sp.x + 0.5, y: sp.y, z: sp.z + 0.5, ry: 0 };
  const w = world.getDefaultSpawnLocation();
  return { d: "minecraft:overworld", x: w.x + 0.5, y: w.y > 320 ? undefined : w.y, z: w.z + 0.5, ry: 0 };
}

async function toOverworld(player, why) {
  const back = wayBack(player);
  const d = world.getDimension(back.d);
  unmount(player);
  fade(player);
  await withLoadedIn(d, `zoocraft_acu_out_${player.id}`, { x: Math.floor(back.x) - 8, z: Math.floor(back.z) - 8 }, { x: Math.floor(back.x) + 8, z: Math.floor(back.z) + 8 }, () => {
    let y = back.y;
    if (y === undefined) {
      // the world's spawn with no height: the ground there, now that it is loaded
      const top = d.getTopmostBlock({ x: back.x, z: back.z });
      y = top ? top.location.y + 1 : 100;
      if (!top) why = "fell";
    }
    player.teleport({ x: back.x, y, z: back.z }, { dimension: d, rotation: { x: 0, y: back.ry } });
  });
  if (why === "fell") {
    try {
      player.addEffect("slow_falling", K().slowFall, { showParticles: false });
    } catch {
      // none
    }
  }
  play(player, "portal.travel", 0.35);
  return true;
}

function go(player, st) {
  st.going = true;
  const trip = player.dimension.id === ACUFEND ? toOverworld(player, "portal") : toAcufend(player);
  trip
    .then((went) => {
      st.going = false;
      if (went) st.held = true;
      st.t = 0;
    })
    .catch((error) => {
      st.going = false;
      st.t = 0;
      st.held = true;
      log(`acufend portal: ${player.name} couldn't go through: ${error}`);
      message(player, "§7The portal flickers. Step out and in again to try once more.");
    });
}

/** Every 4 ticks: each player in an Acufend portal (through once they've stood there long enough), or falling out of Acufend. */
export function tickAcuPortals() {
  const k = K();
  for (const player of world.getAllPlayers()) {
    let st = states.get(player.id);
    if (!st) states.set(player.id, (st = { t: 0, held: false, going: false }));
    if (st.going) continue;
    let dimId;
    try {
      dimId = player.dimension.id;
    } catch {
      continue;
    }
    if (dimId === ACUFEND && player.location.y < k.voidY) {
      st.going = true;
      toOverworld(player, "fell")
        .catch((error) => reportError("acufend portal", error))
        .finally(() => {
          // back where they went in: in that portal, so held until they step out of it
          st.going = false;
          st.held = true;
          st.t = 0;
        });
      continue;
    }
    const inside = inPortal(player);
    const was = st.t;
    const r = portalStep(st, inside, creative(player), 4, k);
    st.t = r.st.t;
    st.held = r.st.held;
    if (inside && !st.held && was === 0) {
      play(player, "portal.trigger", 0.25);
      // start on the pad and the land round it while they wait
      if (dimId !== ACUFEND) {
        try {
          ensurePad(padFor(player.location.x, player.location.z)).catch(() => {});
        } catch {
          // tried again when they go
        }
      }
    }
    if (r.go) go(player, st);
  }
}

/** A frame or portal block broken (by a player or a blast): a portal no longer in a whole frame goes out. */
function checkAround(d, p) {
  const get = (x, y, z) => blockId(d, x, y, z);
  for (const n of neighbours(p)) {
    let perm;
    try {
      perm = d.getBlock(n)?.permutation;
    } catch {
      continue;
    }
    if (perm?.type.id !== ACU_PORTAL) continue;
    const axis = /** @type {string} */ (perm.getState(/** @type {any} */ (ACU_AXIS)) ?? "x");
    const { cells, whole } = acuPortalStillWhole(get, n, axis, K().frame);
    if (!whole) {
      try {
        fill(d, cells, "minecraft:air", { blockFilter: { includeTypes: [ACU_PORTAL] } });
      } catch (error) {
        reportError("acufend portal", error);
      }
    }
  }
}

export function wireAcufend() {
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    const id = e.brokenBlockPermutation.type.id;
    if (id !== ACU_PORTAL && id !== ACU_FRAME) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.blockExplode.subscribe((e) => {
    const id = e.explodedBlockPermutation.type.id;
    if (id !== ACU_PORTAL && id !== ACU_FRAME) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.playerLeave.subscribe((e) => {
    states.delete(e.playerId);
    ahead.delete(e.playerId);
  });
}

/** For the test server: the builder's numbers, the pads made, each player's portal state. */
export function acufendDebug() {
  return { ...stats, queued: queue.length, running, known: built.size, ahead: ahead.size, pads: db.all(SPOTS), states: [...states.entries()].map(([id, s]) => ({ id, ...s })) };
}

/**
 * For testing (/zoocraft:acuframe): a Crying Obsidian frame, 4 wide and 5 tall (2 by 3 inside), 3 blocks in front of a
 * player, across the way they face, standing on the ground, only where there is air. Returns what to tell them.
 */
export function buildTestAcuFrame(player) {
  const d = player.dimension;
  if (!LIT_IN.has(d.id)) return "The way to Acufend only opens from the Overworld.";
  const look = player.getViewDirection();
  const alongX = Math.abs(look.z) >= Math.abs(look.x); // facing north or south: the frame runs east to west
  const ahead = 3;
  const c = { x: Math.floor(player.location.x) + (alongX ? 0 : Math.sign(look.x) * ahead), y: Math.floor(player.location.y), z: Math.floor(player.location.z) + (alongX ? Math.sign(look.z) * ahead : 0) };
  const cells = [];
  for (let a = -1; a <= 2; a++) {
    for (let dy = 0; dy <= 4; dy++) {
      if (a === -1 || a === 2 || dy === 0 || dy === 4) cells.push(alongX ? { x: c.x + a, y: c.y + dy, z: c.z } : { x: c.x, y: c.y + dy, z: c.z + a });
    }
  }
  try {
    fill(d, cells, ACU_FRAME, AIR_ONLY);
  } catch {
    return "The frame reaches into land that isn't loaded. Stand somewhere open and try again.";
  }
  return `A Crying Obsidian frame stands ${ahead} blocks in front of you. Throw the Lightning TNT Frequency Stick at it to open the way to Acufend.`;
}
