// 0.1.341: Acufend in the game (rules: world/acufendRules.js; numbers: BALANCE.acufend). The Lightning TNT Frequency
// Stick going off against an upright Crying Obsidian frame lights it (world/vision.js asks here); a player standing in
// the portal goes through, onto a pad with a lit frame to come back by. The game has no "standing in a block" event,
// so every 4 ticks each player's feet and head are looked at (as the sea and Void portals). Austin, 2026-11-15: "load
// the area you are teleporting to before the teleport": the pad's chunks, or the way back's, are loaded first.
// 0.1.342: the great cave (world/acufendCaveRules.js) and the Frequency Friends' statue in it.
// 0.1.348: Acufend is a small moon (world/acufendMoonRules.js; Austin, 2026-11-21: "a tiny moon of an ancient world.
// It is only 500 blocks by 500 blocks ... load the whole dimension before the player even enters. At the end of the
// world, it would just be void. ... The cave also never loaded"). The land was built round each player as they went,
// and the great cave's chunks, the slowest to build, could fall behind. Now the whole moon, its cave and statue in it,
// is built once in each world, from a minute after the world first opens with this version: 6 by 6 chunks at a time
// (loaded for it), the middle first, by one job that never takes more than a slice of a tick, its progress kept so it
// carries on where it stopped. The portal opens onto it once it is whole (a line in chat says how far along it is).
// A world with Acufend land from before has its moon far from that land (none of it can be seen); anyone still on the
// old land goes home.
// 0.1.352: the way in's mouth made easy to find (world/acufendMouthRules.js): a hollow and four lit standing stones,
// made once the moon is whole (in a world whose moon was built before this, when it is next opened).
import { world, system, GameMode, ListBlockVolume, BlockVolume, BlockPermutation } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { portalStep, neighbours, readBack, writeBack } from "../fishing/portalRules.js";
import { seedOf } from "../fishing/islandRules.js";
import { withLoadedIn } from "../fishing/islands.js";
import { ACUFEND, ACU_PORTAL, ACU_AXIS, ACU_FRAME, ACU_BACK_KEY, lightAcuPortal, acuPortalStillWhole, arrivalPlan, knownSpotNear } from "./acufendRules.js";
import { caveLayout, chunkHasCave, compass } from "./acufendCaveRules.js";
import { MARK, MARK_Y, moonCentre, moonCave, moonAreas, moonChunkStart, moonColumnWork, moonChunkEnd, moonSpot, moonArrivalSpot, moonGround, onMoon, moonSpikes } from "./acufendMoonRules.js";
import { mouthPlan, stoneRuns, MOUTH_V } from "./acufendMouthRules.js";
import { IN_CHAMBER_UP } from "../residents/fossLeadRules.js";

const K = () => BALANCE.acufend;
const AIR_ONLY = { blockFilter: { includeTypes: ["minecraft:air"] } };
const LIT_IN = new Set(["minecraft:overworld", ACUFEND]);
/** The moon: { id "moon", v, x, z (its middle), cave: { x, z, side, sign }, next (areas built), done, chunks, mouth (0.1.352: MOUTH_V once the way in's mouth is made) } */
const MOON = "acufendMoon";
/** Its arrival pads made so far: { id "x,z", x, y, z } (the frame on each is mended whenever it is used). */
const PADS = "acufendMoonPads";
/** Acufend from before 0.1.348: its pads and its cave's place (only read: the moon is made far from them). */
const OLD_SPOTS = "acufendSpots";
const OLD_CAVE = "acufendCave";
const PAD = "minecraft:polished_blackstone";
const DEEP = "minecraft:deepslate";
/** on a player: they have stood in the great chamber (the hints on arriving stop) */
const SEEN_KEY = "zoocraft:acu_cave_seen2"; // (0.1.352: a new mark: the old one was set on the surface over the chamber)
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
/** The world's own Acufend: the same land for everyone in this world. */
const acuSeed = () => (seed ??= (seedOf(world.seed) ^ 0x41c0fe9d) >>> 0);

function fill(d, cells, block, options) {
  for (let i = 0; i < cells.length; i += 2000) d.fillBlocks(new ListBlockVolume(cells.slice(i, i + 2000)), block, options);
}

const tipBlocks = new Map();
/** A spike's point: pointed dripstone, standing or `hanging` (plain dripstone if this game has other states for it). */
function tip(hanging = false) {
  let b = tipBlocks.get(hanging);
  if (b === undefined) {
    try {
      b = BlockPermutation.resolve("minecraft:pointed_dripstone", { dripstone_thickness: "tip", hanging });
    } catch {
      b = "minecraft:dripstone_block";
    }
    tipBlocks.set(hanging, b);
  }
  return b;
}

let lichenBlock;
/** Glow lichen on the face of the block under it (null if this game has other states for it: then there is none). */
function lichen() {
  if (lichenBlock === undefined) {
    try {
      lichenBlock = BlockPermutation.resolve("minecraft:glow_lichen", { multi_face_direction_bits: 1 });
    } catch {
      lichenBlock = null;
    }
  }
  return lichenBlock;
}

// ---- the moon

/** @type {any} */
let moonRec;
const moonDoc = () => (moonRec ??= db.get(MOON, "moon"));
function saveMoon(r) {
  moonRec = r;
  db.put(MOON, r);
}
/** The moon as the rules take it ({ x, z, seed }), or undefined before it is placed. */
function moon() {
  const r = moonDoc();
  return r && { x: r.x, z: r.z, seed: acuSeed() };
}
/** Whether the whole moon is built (only then does the portal open onto it). */
export function moonReady() {
  return Boolean(moonDoc()?.done);
}

/** The moon placed (once in each world): its middle, and its great cave's. */
function placeMoon() {
  if (moonDoc()) return moonRec;
  const old = [...db.all(OLD_SPOTS)];
  const oc = db.get(OLD_CAVE, "cave");
  if (oc) old.push({ x: oc.x, z: oc.z }, { x: oc.padX, z: oc.padZ });
  const c = moonCentre(old, K());
  const cave = moonCave({ x: c.x, z: c.z, seed: acuSeed() }, K());
  saveMoon({ id: "moon", v: 1, x: c.x, z: c.z, cave: { x: cave.site.x, z: cave.site.z, side: cave.side, sign: cave.sign }, next: 0, done: false });
  log(`acufend: the moon placed round ${c.x} ${c.z} (old land: ${old.length} places), its great cave at ${cave.site.x} ${cave.site.z}`);
  return moonRec;
}

let caveMade;
/** The world's great cave (its layout), on the moon; undefined before the moon is placed. */
export function acuCave() {
  if (caveMade) return caveMade;
  const r = moonDoc();
  if (!r?.cave) return undefined;
  caveMade = caveLayout(acuSeed(), { x: r.cave.x, z: r.cave.z }, { x: r.x, z: r.z }, K(), { side: r.cave.side, sign: r.cave.sign });
  return caveMade;
}

/** Whether the Frequency Friends' statue has been taken away (from the cave Acufend had before): then the moon's has none. */
function statueGone() {
  const s = db.get("fossExpedition", "exp")?.statue;
  return Boolean(s) && s.state !== "cave";
}

// ---- building it

const built = new Set(); // chunks known to be built this session, "cx,cz"
/** @type {{ key: string, cx: number, cz: number, waiters: ((ok: boolean) => void)[] }[]} */
const queue = [];
const queued = new Map();
let running = false;
const stats = { built: 0, ms: 0, worst: 0, setMs: 0, worstSet: 0, dropped: 0, failed: 0, worstStep: 0, caveChunks: 0, caveMs: 0, caveWorst: 0, areas: 0, areaFailed: 0, repaired: 0, sentHome: 0, startedAt: 0, doneAt: 0 };
const ckey = (cx, cz) => `${cx},${cz}`;
/** @type {Set<string> | undefined} the moon's chunks */
let moonKeys;
/** @type {any[] | undefined} */
let areasOf;

function areas() {
  if (!areasOf) {
    const M = /** @type {any} */ (moon());
    areasOf = moonAreas(M, K());
    moonKeys = new Set(areasOf.flatMap((a) => a.chunks.map(([cx, cz]) => ckey(cx, cz))));
  }
  return areasOf;
}

function loaded(d, cx, cz) {
  try {
    return d.isChunkLoaded({ x: cx * 16, y: 0, z: cz * 16 });
  } catch {
    return false;
  }
}

/** Whether a chunk of the moon is built: the mark under it goes in last, so a chunk with it is whole. */
function isBuilt(d, cx, cz) {
  const key = ckey(cx, cz);
  if (built.has(key)) return true;
  if (blockId(d, cx * 16, MARK_Y, cz * 16) !== MARK) return false;
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
            const done = yield* buildChunk(d, e.cx, e.cz);
            ok = done;
          }
        } catch (error) {
          // unloaded part way (it is built again from the start when it is next wanted)
          stats.failed++;
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
 * One chunk of the moon: its columns worked out a row of 16 at a step (nothing set yet), then set a fill at a step:
 * the deep rock 16 high at a time, every long run (the cave's air, mostly) as one column of blocks, the rest by kind
 * 2000 at a time, the points and the lichen, and the mark under it last.
 */
function* buildChunk(d, cx, cz) {
  let t = Date.now();
  let ms = 0;
  const k = K();
  const x0 = cx * 16, z0 = cz * 16;
  let L = acuCave();
  if (L && !chunkHasCave(L, cx, cz)) L = undefined;
  if (L) L.noStatue = statueGone();
  const ch = moonChunkStart(/** @type {any} */ (moon()), cx, cz, k, L);
  for (let dx = 0; dx < 16; dx++) {
    for (let dz = 0; dz < 16; dz++) moonColumnWork(ch, dx, dz);
    const dt = Date.now() - t;
    ms += dt;
    stats.worstStep = Math.max(stats.worstStep, dt);
    yield;
    t = Date.now();
  }
  const plan = moonChunkEnd(ch);
  /** @type {Map<any, {x: number, y: number, z: number}[]>} */
  const lists = new Map();
  const add = (b, x, y, z) => {
    let l = lists.get(b);
    if (!l) lists.set(b, (l = []));
    l.push({ x, y, z });
  };
  /** @type {[number, number, number, number, string][]} x, y0, y1, z, block: the long runs, set a column at a time */
  const columns = [];
  const tips = { up: [], down: [] };
  const lc = lichen();
  for (const c of plan.cols) {
    for (const [y0, y1, b] of c.set) {
      if (y1 - y0 >= 5) columns.push([c.x, y0, y1, c.z, b]);
      else for (let y = y0; y <= y1; y++) add(b, c.x, y, c.z);
    }
    for (const tp of c.tips) (tp.hanging ? tips.down : tips.up).push({ x: c.x, y: tp.y, z: c.z });
    if (c.lichen !== undefined && lc) add(lc, c.x, c.lichen, c.z);
  }
  const sets = [];
  if (plan.fill) {
    for (let y = plan.fill[0]; y <= plan.fill[1]; y += 16) {
      const top = Math.min(plan.fill[1], y + 15);
      sets.push(() => d.fillBlocks(new BlockVolume({ x: x0, y, z: z0 }, { x: x0 + 15, y: top, z: z0 + 15 }), DEEP));
    }
  }
  for (let i = 0; i < columns.length; ) {
    let n = 0;
    const from = i;
    while (i < columns.length && n < 1000) n += columns[i][2] - columns[i++][1] + 1;
    const part = columns.slice(from, i);
    sets.push(() => {
      for (const [x, y0, y1, z, b] of part) d.fillBlocks(new BlockVolume({ x, y: y0, z }, { x, y: y1, z }), b);
    });
  }
  const slice = L ? 1000 : 2000;
  for (const [b, l] of lists) for (let i = 0; i < l.length; i += slice) sets.push(() => d.fillBlocks(new ListBlockVolume(l.slice(i, i + slice)), b));
  if (tips.up.length) sets.push(() => d.fillBlocks(new ListBlockVolume(tips.up), tip(false)));
  if (tips.down.length) sets.push(() => d.fillBlocks(new ListBlockVolume(tips.down), tip(true)));
  // the mark last: a chunk with it is whole
  sets.push(() => d.setBlockType({ x: x0, y: MARK_Y, z: z0 }, MARK));
  ms += Date.now() - t;
  for (const set of sets) {
    t = Date.now();
    set();
    const dt = Date.now() - t;
    ms += dt;
    stats.setMs += dt;
    stats.worstSet = Math.max(stats.worstSet, dt);
    stats.worstStep = Math.max(stats.worstStep, dt);
    yield;
  }
  built.add(ckey(cx, cz));
  stats.built++;
  stats.ms += ms;
  stats.worst = Math.max(stats.worst, ms);
  if (L) {
    stats.caveChunks++;
    stats.caveMs += ms;
    stats.caveWorst = Math.max(stats.caveWorst, ms);
  }
  return true;
}

let moonMaking = false;
let retryAt = 0;
/** the tick this world was opened on (the game's own tick count carries on from the last time it was played) */
let openedAt = -1;

/** The moon built, an area at a time from where it stopped (each area's chunks loaded while it is built). */
async function makeMoonLand() {
  if (moonMaking) return;
  moonMaking = true;
  try {
    const d = acufendDimension();
    if (!d) return;
    const all = areas();
    if (!stats.startedAt) stats.startedAt = system.currentTick;
    for (;;) {
      const r = moonDoc();
      if (!r || r.done) return;
      if (r.next >= all.length) {
        saveMoon({ ...r, done: true, chunks: moonKeys?.size });
        stats.doneAt = system.currentTick;
        log(`acufend: the moon is built (${moonKeys?.size} chunks, ${Math.round((stats.doneAt - stats.startedAt) / 20)} s)`);
        for (const p of world.getAllPlayers()) {
          try {
            if (states.get(p.id)?.waited) message(p, "§dAcufend is whole. The portal will take you now.");
          } catch {
            // gone
          }
        }
        return;
      }
      const a = all[r.next];
      await withLoadedIn(d, "zoocraft_acu_moon", a.from, a.to, async () => {
        const oks = await Promise.all(a.chunks.map(([cx, cz]) => want(cx, cz, false)));
        if (oks.some((ok) => !ok)) throw new Error(`${oks.filter((ok) => !ok).length} of its ${oks.length} chunks did not build`);
      });
      stats.areas++;
      saveMoon({ ...moonDoc(), next: r.next + 1 });
    }
  } catch (error) {
    stats.areaFailed++;
    retryAt = system.currentTick + K().moon.retry;
    if (stats.areaFailed <= 3) log(`acufend: an area of the moon not built yet: ${error}`);
  } finally {
    moonMaking = false;
  }
}

// ---- 0.1.352: the way in's mouth

let mouthMaking = false;
let mouthRetry = 0;
const mouthStats = { cols: 0, stones: 0, ms: 0, failed: 0 };

function* mouthJob(d, plan, done, failed) {
  try {
    const k = K();
    const M = /** @type {any} */ (moon());
    const t0 = Date.now();
    let n = 0;
    for (const c of plan.cols) {
      const under = d.getBlock({ x: c.x, y: c.floor - 1, z: c.z });
      if (!under) throw new Error(`the mouth's land at ${c.x} ${c.z} isn't loaded`);
      if (!under.isAir) under.setType(c.face);
      d.fillBlocks(new BlockVolume({ x: c.x, y: c.floor, z: c.z }, { x: c.x, y: c.floor + k.cave.mouth.clear, z: c.z }), "minecraft:air");
      mouthStats.cols++;
      if (++n % 24 === 0) yield;
    }
    for (const s of plan.stones) {
      const top = moonGround(M, s.x, s.z, k);
      for (const [x, y0, y1, z, b] of stoneRuns(s, top)) d.fillBlocks(new BlockVolume({ x, y: y0, z }, { x, y: y1, z }), b);
      mouthStats.stones++;
      yield;
    }
    mouthStats.ms = Date.now() - t0;
    done(true);
  } catch (error) {
    failed(error);
  }
}

/** The hollow and the standing stones at the way in's mouth, made once (its land loaded while it is). */
async function makeMouth() {
  if (mouthMaking) return;
  mouthMaking = true;
  try {
    const d = acufendDimension();
    const L = acuCave();
    if (!d || !L) return;
    const plan = mouthPlan(L, K());
    await withLoadedIn(d, "zoocraft_acu_mouth", plan.box.from, plan.box.to, () => new Promise((done, failed) => {
      system.runJob(timedJob("acufendMouth", mouthJob(d, plan, done, failed)));
    }));
    saveMoon({ ...moonDoc(), mouth: MOUTH_V });
    log(`acufend: the cave's mouth made at ${L.mouth.x} ${L.mouth.z} (${plan.cols.length} columns, ${plan.stones.length} standing stones)`);
  } catch (error) {
    mouthStats.failed++;
    mouthRetry = system.currentTick + K().cave.mouth.retry;
    if (mouthStats.failed <= 3) log(`acufend: the cave's mouth not made yet: ${error}`);
  } finally {
    mouthMaking = false;
  }
}

/**
 * 0.1.352, for Dr. Foss's way to the cave: the moon's land as the rules have it, once it is whole: { ground(x, z): its
 * top block there (undefined off it, or out by its sinking edge), blocked(x, z): a dripstone spike stands there }.
 */
export function acuWalk() {
  const M = moon();
  if (!M || !moonReady()) return undefined;
  const k = K();
  const spikes = new Map();
  return {
    ground: (x, z) => (onMoon(M, x, z, k, -(k.moon.rim + k.moon.wobble)) ? moonGround(M, x, z, k) : undefined),
    blocked: (x, z) => {
      const cx = Math.floor(x / 16), cz = Math.floor(z / 16), key = ckey(cx, cz);
      let l = spikes.get(key);
      if (!l) spikes.set(key, (l = moonSpikes(M, cx, cz, k)));
      return l.some((s) => Math.hypot(x - s.x, z - s.z) < s.r + 1);
    },
  };
}

/** How much of the moon is built, 0 to 100. */
export function moonProgress() {
  const r = moonDoc();
  if (!r) return 0;
  if (r.done) return 100;
  const all = areas();
  let n = 0;
  for (let i = 0; i < Math.min(r.next, all.length); i++) n += all[i].chunks.length;
  return Math.min(99, Math.floor((n / Math.max(1, moonKeys?.size ?? 1)) * 100));
}

/**
 * Every second: the moon placed and built (from a minute after the world opens); each player in Acufend: anyone off
 * the moon (on land from before it) or there before it is whole goes home; any chunk round them without its mark (a
 * world closed part way through one) built again; the great chamber found.
 */
export function tickAcufend() {
  const d = acufendDimension();
  if (!d) return;
  const k = K();
  if (openedAt < 0) openedAt = system.currentTick;
  if (system.currentTick >= openedAt + k.moon.startAfter) {
    if (!moonDoc()) {
      try {
        placeMoon();
      } catch (error) {
        reportError("acufend moon", error);
        return;
      }
    }
    const r0 = moonDoc();
    if (r0 && !r0.done && !moonMaking && system.currentTick >= retryAt) makeMoonLand();
    if (r0?.done && r0.mouth !== MOUTH_V && !mouthMaking && system.currentTick >= mouthRetry) makeMouth();
  }
  // (anyone there in the first minute, before the moon is begun, goes home too)
  const r = moonDoc() ?? { done: false };
  let players;
  try {
    players = d.getPlayers();
  } catch {
    return;
  }
  const M = /** @type {any} */ (moon());
  for (const p of players) {
    let l;
    try {
      l = p.location;
    } catch {
      continue;
    }
    if (!r.done || !onMoon(M, l.x, l.z, k, 300)) {
      sendHome(p, r.done ? "§7The land round you crumbles into the void. Acufend has drawn itself together into one small moon; the portal takes you there now." : "§7Acufend shimmers and fades round you. It is drawing itself together into one small moon; the portal opens onto it once it is whole.");
      continue;
    }
    repairNear(d, l);
    seeCave(p, l);
  }
}

/** The chunks of the moon round a player that have no mark under them (a world closed part way through one): built again. */
function repairNear(d, l) {
  areas();
  const cx = Math.floor(l.x / 16), cz = Math.floor(l.z / 16);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const key = ckey(cx + i, cz + j);
      if (built.has(key) || queued.has(key) || !moonKeys?.has(key) || !loaded(d, cx + i, cz + j) || isBuilt(d, cx + i, cz + j)) continue;
      stats.repaired++;
      want(cx + i, cz + j, true);
    }
  }
}

/** A player standing in the great chamber for the first time: a line in chat (and the hints on arriving stop). */
function seeCave(p, l) {
  const L = acuCave();
  if (!L) return;
  const m = L.chambers[0];
  if ((l.x - m.x) ** 2 + (l.z - m.z) ** 2 > (m.r * 0.8) ** 2 || l.y > m.floor + IN_CHAMBER_UP) return; // (0.1.352: by its floor: the land over the chamber is within its dome's height)
  try {
    if (p.getDynamicProperty(SEEN_KEY)) return;
    p.setDynamicProperty(SEEN_KEY, true);
  } catch {
    return;
  }
  message(p, "§6A cavern bigger than any you have seen. Far across it, something glitters in the dark: gold and emerald, on a stone dais.");
}

/** On arriving in Acufend, until they have found the great chamber: which way it lies, roughly. */
function caveHint(player, at) {
  const L = acuCave();
  if (!L) return;
  try {
    if (player.getDynamicProperty(SEEN_KEY)) return;
  } catch {
    return;
  }
  const dist = Math.max(10, Math.round(Math.hypot(L.mouth.x - at.x, L.mouth.z - at.z) / 10) * 10);
  message(player, `§7A cold wind rises from somewhere deep under the rock, about ${dist} blocks to the ${compass(at, L.mouth)}.`);
}

/**
 * For testing (/zoocraft:acucave): a player in Acufend to the mouth of the great cave's way in, facing down it, or
 * (`statue`) to the great chamber's floor beside the statue, the place loaded first. Returns what to tell them.
 */
export async function goToCave(player, statue) {
  const d = acufendDimension();
  if (!d || player.dimension.id !== ACUFEND) return "Only in Acufend: go through an Acufend portal first.";
  const L = acuCave();
  if (!L || !moonReady()) return `Acufend isn't whole yet (${moonProgress()}% built).`;
  const at = statue ? { x: L.statue.x + 8, z: L.statue.z } : { x: Math.round(L.mouth.x - L.way.x * 5), z: Math.round(L.mouth.z - L.way.z * 5) };
  const face = statue ? { x: -1, z: 0 } : L.way;
  const from = { x: at.x - 24, z: at.z - 24 }, to = { x: at.x + 24, z: at.z + 24 };
  await withLoadedIn(d, `zoocraft_acu_cave_${player.id}`, from, to, async (dim) => {
    let y = statue ? L.statue.y - 1 : moonGround(/** @type {any} */ (moon()), at.x, at.z, K()) + 1;
    if (!statue) {
      try {
        y = (dim.getTopmostBlock({ x: at.x, z: at.z })?.location.y ?? y - 1) + 1;
      } catch {
        // as worked out
      }
    }
    player.teleport({ x: at.x + 0.5, y, z: at.z + 0.5 }, { dimension: dim, rotation: { x: 0, y: (Math.atan2(-face.x, face.z) * 180) / Math.PI } });
  });
  return statue ? "Beside the Frequency Friends' statue, in the great chamber." : "At the mouth of the way into the great cave.";
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

/** The pad a portal at x z of the Overworld opens onto: one already made near its spot on the moon, else a new one. */
function padFor(x, z) {
  const k = K();
  const M = /** @type {any} */ (moon());
  const spot = moonSpot(M, x, z, k);
  const known = knownSpotNear(db.all(PADS), spot, k.linkRange);
  return known ?? moonArrivalSpot(M, acuCave(), spot.x, spot.z, k);
}

/** pad id -> its making under way (a player waiting in a portal and the trip itself ask for the same pad) */
const making = new Map();

/**
 * The pad at `spot` loaded (the moon is built already), the pad made the first time, its frame and portal mended
 * every time (only where there is air, so a player's blocks stay). Returns where a player arrives.
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
  if (!moonReady()) throw new Error("the moon isn't whole yet");
  const plan = arrivalPlan(spot);
  await withLoadedIn(d, `zoocraft_acu_${spot.x}_${spot.z}`.replace(/-/g, "m"), plan.from, plan.to, async (dim) => {
    if (!db.get(PADS, id)) {
      fill(dim, plan.clear, "minecraft:air");
      fill(dim, plan.pad, PAD);
      db.put(PADS, { id, x: spot.x, y: spot.y, z: spot.z });
    }
    fill(dim, plan.frame, ACU_FRAME, AIR_ONLY);
    fill(dim, plan.inside, BlockPermutation.resolve(ACU_PORTAL, { [ACU_AXIS]: plan.axis }), AIR_ONLY);
  });
  return plan.arrive;
}

async function toAcufend(player) {
  if (!moonReady()) return false;
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
  caveHint(player, arrive);
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

/** Someone in Acufend where they can't be (on land from before the moon, or there before it is whole): home, told why. */
function sendHome(player, text) {
  let st = states.get(player.id);
  if (!st) states.set(player.id, (st = { t: 0, held: false, going: false }));
  if (st.going) return;
  st.going = true;
  stats.sentHome++;
  toOverworld(player, "fell")
    .then(() => message(player, text))
    .catch((error) => reportError("acufend moon", error))
    .finally(() => {
      st.going = false;
      st.held = true;
      st.t = 0;
    });
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
    // 0.1.348: not until the moon is whole: they wait in the portal, told how far along it is
    if (inside && !st.held && dimId !== ACUFEND && !moonReady()) {
      st.t = 0;
      st.waited = true;
      const now = system.currentTick;
      if (!(now < (st.toldAt ?? -1e9) + 200)) {
        st.toldAt = now;
        play(player, "portal.trigger", 0.25);
        message(player, `§7The portal hums, but Acufend isn't whole yet beyond it: ${moonProgress()}% of its moon is built. It opens once it is all there.`);
      }
      continue;
    }
    if (inside && !st.held && was === 0) {
      play(player, "portal.trigger", 0.25);
      // start on the pad while they wait
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
  });
}

/** For the test server: the builder's numbers, the moon, the pads made, each player's portal state. */
export function acufendDebug() {
  const L = acuCave();
  const cave = L && { mouthMade: moonDoc()?.mouth ?? 0, mouthStats, site: L.site, mouth: L.mouth, statue: L.statue, box: L.box, way: L.way, chambers: L.chambers.map((c) => [c.x, c.z, Math.round(c.r), c.floor, c.h]) };
  return { ...stats, queued: queue.length, running, moonMaking, known: built.size, moon: moonDoc(), progress: moonProgress(), areas: areasOf?.length, chunks: moonKeys?.size, pads: db.all(PADS), cave, states: [...states.entries()].map(([id, s]) => ({ id, ...s })) };
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
