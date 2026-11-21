// 0.1.340: the Frequency Friends' hidden jungle villages at run time; 0.1.347: their tree house village (rules: the
// layout and every block in world/treeVillagePlan.js; numbers: BALANCE.jungleVillage). A player with Transcending
// Vision in a jungle with no village near has the jungle around looked over (a job) for its tallest tree; a tall enough
// one is the great tree of a village. When a player with the vision first comes near it, the trees round it are looked
// over too (which get a home, where the bridges can go). While a player with the vision is near, the village stands
// (for everyone near: Austin's "Shared reveal", 2026-11-20); when none is, every block goes back as it was. What a
// village replaced is written down before it is replaced (a world property), so a village left up by a restart comes
// down again exactly. While it stands its blocks can't be broken, blown up or stripped. The Frequency Friends are drawn
// only for players with the vision.
import { world, system, BlockPermutation, BlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError, info } from "../core/log.js";
import { withLoadedIn } from "../fishing/islands.js";
import { VISION_KEY } from "./visionRules.js";
import { message, onlinePlayers, biomeAt } from "../platform/mc.js";
import { hasVision } from "./vision.js";
import { FF_ENTITY, FF_BLOCKS, SEEN, isJungle, tallestTrunks, villagePlan as villagePlanV1, villageBox as villageBoxV1, inBox, visionNear, villageNear, keepCode, fromCode, restoreOf, FRIEND_LINES, occupied } from "./jungleVillageRules.js";
import { PLAN_V, villagePlan, chooseLayout, trunkAt, canFill, trunkCentre, packEntry, unpackEntries, KEPT_PART } from "./treeVillagePlan.js";

const LIST_KEY = "zoocraft:ff_villages";
const keptKey = (id) => `zoocraft:ff_kept:${id}`;
const partKey = (id, i) => `zoocraft:ff_kept:${id}:${i}`;
export const VISION_TAG = "zoocraft_vision"; // on players while they have the vision: the friends' interact asks for it
const LOG = "minecraft:jungle_log";
const busy = new Set(); // village ids being laid out, put up or taken down
const seenBy = new Map(); // friend entity id -> ids of the players it is drawn for
const scanned = []; // { dim, x, z, at } looked over lately with no village found (0.1.350: again after BALANCE.jungleVillage.rescan)
const plans = new Map(); // village id -> { plan, perms, box (world), friends (world) }
const placedBy = new Map(); // village id -> Map "dim|x,y,z" -> the type we put there (what may not be broken)
const told = new Map(); // player id -> tick last told the wood won't break
const waitTill = new Map(); // village id -> tick before which its area isn't tried again (0.1.350: it couldn't be loaded)
let scanning = false;
/** @type {{ scans: number, found: number, laid: number, shown: number, hidden: number, placed: number, restored: number, kept: number, blocked: number, saved: number, persisted: number, migrated: number, loads: number, loadFailed: number, last?: any, lastLayout?: object }} */
const stats = { scans: 0, found: 0, laid: 0, shown: 0, hidden: 0, placed: 0, restored: 0, kept: 0, blocked: 0, saved: 0, persisted: 0, migrated: 0, loads: 0, loadFailed: 0 };
const g = () => BALANCE.jungleVillage;
const read = (d) => (x, y, z) => {
  try {
    return d.getBlock({ x, y, z })?.typeId;
  } catch {
    return undefined;
  }
};

function load() {
  try {
    return JSON.parse(String(world.getDynamicProperty(LIST_KEY) ?? "[]"));
  } catch {
    return [];
  }
}
function save(list) {
  world.setDynamicProperty(LIST_KEY, JSON.stringify(list));
}
function update(id, fn) {
  const list = load();
  const v = list.find((x) => x.id === id);
  if (v) {
    fn(v);
    save(list);
  }
}

/** The village's blocks, worked out once from its layout: the plan, each block's permutation, where it all is. */
function planOf(v) {
  let p = plans.get(v.id);
  if (p) return p;
  const plan = villagePlan(v.L, g().palette);
  const bad = new Set();
  const perms = plan.pal.map(([id, st]) => {
    try {
      return BlockPermutation.resolve(id, st);
    } catch (err) {
      if (!bad.has(id)) reportError("ffPerm", `${id} ${JSON.stringify(st)} ${err}`);
      bad.add(id);
      return undefined;
    }
  });
  const box = { min: { x: v.x + plan.box.min.x, y: v.y + plan.box.min.y, z: v.z + plan.box.min.z }, max: { x: v.x + plan.box.max.x, y: v.y + plan.box.max.y, z: v.z + plan.box.max.z } };
  p = { plan, perms, box, friends: plan.friends.map(([dx, dy, dz]) => ({ x: v.x + dx, y: v.y + dy, z: v.z + dz })) };
  plans.set(v.id, p);
  return p;
}
const boxOf = (v) => (v.v === PLAN_V ? planOf(v).box : villageBoxV1(v));

// ---- what a village replaced, written down before it is replaced ----
/** { c: original codes, t: our types, parts: strings of packed entries } */
function readKept(id) {
  let head;
  try {
    head = JSON.parse(String(world.getDynamicProperty(keptKey(id)) ?? "null"));
  } catch {
    head = null;
  }
  if (!head || head.v !== PLAN_V) return head;
  const parts = [];
  for (let i = 0; i < head.n; i++) parts.push(String(world.getDynamicProperty(partKey(id, i)) ?? ""));
  return { ...head, parts };
}
function writeKept(id, rec, from = 0) {
  world.setDynamicProperty(keptKey(id), JSON.stringify({ v: PLAN_V, c: rec.c, t: rec.t, n: rec.parts.length }));
  for (let i = from; i < rec.parts.length; i++) world.setDynamicProperty(partKey(id, i), rec.parts[i]);
  stats.saved++;
}
function dropKept(id, n) {
  world.setDynamicProperty(keptKey(id), undefined);
  for (let i = 0; i < n; i++) world.setDynamicProperty(partKey(id, i), undefined);
}
/** The blocks a standing village put there (from its record): those can't be broken while it stands. */
function placedOf(v) {
  let m = placedBy.get(v.id);
  if (m || v.v !== PLAN_V) return m;
  m = new Map();
  const rec = readKept(v.id);
  if (rec?.parts) for (const [dx, dy, dz, , ti] of unpackEntries(rec.parts.join(""))) if (!rec.t[ti].startsWith("~")) m.set(`${v.dim}|${v.x + dx},${v.y + dy},${v.z + dz}`, rec.t[ti]);
  placedBy.set(v.id, m);
  return m;
}

/** How tall the jungle log column under (x, y, z) is, counting down from there (a trunk, or a branch: 1 or 2). */
function trunkHeight(d, top) {
  let down = top.y;
  try {
    while (top.y - down < 64 && d.getBlock({ x: top.x, y: down - 1, z: top.z })?.typeId === LOG) down--;
  } catch {
    // as far as could be read
  }
  return top.y - down + 1;
}

/** Look the jungle around (x, z) over for its tallest tree (a column in 2 each way, so no 2 by 2 trunk is missed). */
function* scan(dim, cx, cz) {
  const d = world.getDimension(dim);
  const r = g().scanRadius, step = g().scanStep;
  const samples = [];
  let n = 0;
  for (let x = cx - r; x <= cx + r; x += step) {
    for (let z = cz - r; z <= cz + r; z += step) {
      try {
        if (d.isChunkLoaded({ x, y: 64, z })) {
          const b = d.getTopmostBlock({ x, z });
          if (b) samples.push({ x, z, y: b.location.y, typeId: b.typeId });
        }
      } catch {
        // a column out of reach is skipped
      }
      if (++n % 120 === 0) yield;
    }
  }
  stats.scans++;
  let main;
  for (const t of tallestTrunks(samples)) {
    if (trunkHeight(d, t) >= g().minTrunk) {
      main = trunkAt(read(d), t.x, t.y, t.z);
      if (main && main.h >= g().minTrunk) break;
      main = undefined;
    }
    yield;
  }
  const tops = tallestTrunks(samples, 1);
  stats.last = { at: [cx, cz], tick: system.currentTick, samples: samples.length, tallest: tops[0] && [tops[0].x, tops[0].y, tops[0].z], trunk: main && [main.x0, main.b, main.z0, main.s, main.h] };
  const near = main && villageNear(load(), dim, main.x0, main.z0, g().spacing);
  const why = !main
    ? `no trunk ${g().minTrunk} or more logs tall in ${samples.length} columns`
    : !isJungle(biomeAt(d, { x: main.x0, y: main.b + 2, z: main.z0 }))
      ? "its tallest tree isn't in jungle"
      : near
        ? `a village ${Math.round(Math.hypot(near.x - main.x0, near.z - main.z0))} blocks away already`
        : load().length >= g().max
          ? "the world has all the villages it can keep"
          : "";
  stats.last.why = why || "a village goes there";
  info(`jungle village: looked over the jungle round ${cx} ${cz}: ${main ? `the tallest trunk ${main.h} logs (${main.s} by ${main.s}) at ${main.x0} ${main.b} ${main.z0}` : "no tall trunk"}; ${why || "a village goes there"}`);
  if (why) {
    if (!near) {
      scanned.push({ dim, x: cx, z: cz, at: system.currentTick });
      if (scanned.length > 64) scanned.shift();
    }
    return;
  }
  const list = load();
  const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  list.push({ id, dim, x: main.x0, y: main.b, z: main.z0, v: PLAN_V, t: main, shown: false });
  save(list);
  stats.found++;
}

/** The trees round the great tree looked over: which get a home, where the bridges go (once, when someone comes near). */
function* layOut(v) {
  const d = world.getDimension(v.dim);
  const rd = read(d);
  const main = trunkAt(rd, v.t.x0, v.t.b + v.t.h - 1, v.t.z0) ?? trunkAt(rd, v.t.x0, v.t.b, v.t.z0);
  if (!main || main.h < g().minTrunk) {
    // the great tree is gone (cut down): no village here
    const list = load().filter((x) => x.id !== v.id);
    save(list);
    return;
  }
  const [cx, cz] = trunkCentre(main);
  const r = g().satReach;
  const tops = [];
  let n = 0;
  for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    for (let z = Math.floor(cz - r); z <= Math.ceil(cz + r); z++) {
      if (Math.hypot(x + 0.5 - cx, z + 0.5 - cz) > r) continue;
      try {
        const b = d.getTopmostBlock({ x, z });
        if (b?.typeId === LOG) tops.push({ x, z, y: b.location.y });
      } catch {
        // out of reach
      }
      if (++n % 150 === 0) yield;
    }
  }
  const L = yield* chooseLayout(rd, main, tops, g());
  update(v.id, (x) => {
    x.x = main.x0;
    x.y = main.b;
    x.z = main.z0;
    x.t = main;
    x.L = L;
  });
  plans.delete(v.id);
  stats.laid++;
  stats.lastLayout = { id: v.id, homes: L.sats.length, pods: L.pods.length, bridges: L.links.length, f1: L.f1, f2: L.f2, h: L.h };
}

/** The square round the great tree whose trees are looked over when it is laid out. */
function areaOf(v) {
  const r = g().satReach + 8;
  return { min: { x: v.x - r, y: v.y, z: v.z - r }, max: { x: v.x + r, y: v.y, z: v.z + r } };
}
/** The village's box and the leaves round it (made to stay while it stands). */
function reachOf(v) {
  const b = boxOf(v);
  return { min: { x: b.min.x - 5, y: b.min.y, z: b.min.z - 5 }, max: { x: b.max.x + 5, y: b.max.y, z: b.max.z + 5 } };
}

function removeFriends(d, v) {
  for (const e of d.getEntities({ type: FF_ENTITY, tags: [`ff_${v.id}`] })) {
    seenBy.delete(e.id);
    e.remove();
  }
}

const LEAVES = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry", "azalea", "pale_oak"].map((t) => `minecraft:${t}_leaves`).concat("minecraft:azalea_leaves_flowered");
/** Where the leaves round a box are (none where a chunk isn't loaded), a slice at a time (a job). */
function* leavesIn(d, box) {
  const out = [];
  for (let x = box.min.x; x <= box.max.x; x += 8) {
    try {
      const vol = new BlockVolume({ x, y: box.min.y, z: box.min.z }, { x: Math.min(box.max.x, x + 7), y: box.max.y, z: box.max.z });
      for (const at of d.getBlocks(vol, { includeTypes: LEAVES }, false).getBlockLocationIterator()) out.push(at);
    } catch {
      // a slice out of reach
    }
    yield;
  }
  return out;
}

/**
 * Put the village up: in batches, each block it will replace (air, leaves, vines, grass, its own trees' branches; never
 * where somebody stands) written down first, then replaced; the Frequency Friends at their places.
 */
function* show(v, players) {
  const d = world.getDimension(v.dim);
  const P = planOf(v);
  const ops = P.plan.ops;
  const taken = occupied(v, players);
  update(v.id, (x) => (x.shown = true));
  removeFriends(d, v);
  const rec = { c: [], t: [], parts: [""] };
  const ci = new Map(), ti = new Map();
  const ix = (arr, m, s) => {
    let i = m.get(s);
    if (i === undefined) {
      i = arr.push(s) - 1;
      m.set(s, i);
    }
    return i;
  };
  const add = (dx, dy, dz, code, type) => {
    const e = packEntry(dx, dy, dz, ix(rec.c, ci, code), ix(rec.t, ti, type));
    if (rec.parts[rec.parts.length - 1].length + e.length > KEPT_PART) rec.parts.push("");
    rec.parts[rec.parts.length - 1] += e;
  };
  // first the leaves round where it goes are made to stay while it stands (a leaf whose way to its tree's logs goes
  // through a block the village takes would fall away, and drop a sapling), each written down ("~": only made to
  // stay) so it goes back to just what it was when the village comes down
  const B = P.box, near = { min: { x: B.min.x - 4, y: B.min.y - 4, z: B.min.z - 4 }, max: { x: B.max.x + 4, y: B.max.y + 4, z: B.max.z + 4 } };
  const leaves = [];
  const found = yield* leavesIn(d, near); // (not in the for's head: the game's script engine trips on that)
  for (const at of found) {
    try {
      const b = d.getBlock(at);
      if (!b || b.permutation.getState("persistent_bit") !== false) continue;
      add(at.x - v.x, at.y - v.y, at.z - v.z, keepCode(b.typeId, b.permutation.getAllStates()), `~${b.typeId}`);
      leaves.push(b);
    } catch {
      // out of reach
    }
  }
  writeKept(v.id, rec);
  let k = 0;
  for (const b of leaves) {
    try {
      b.setPermutation(b.permutation.withState("persistent_bit", true));
      stats.persisted++;
    } catch {
      // gone
    }
    if (++k % (g().opsPerTick * 4) === 0) yield;
  }
  const placed = new Map();
  placedBy.set(v.id, placed);
  const W = g().writeEvery;
  for (let i0 = 0; i0 < ops.length; i0 += W) {
    const batch = [];
    const from = rec.parts.length - 1;
    for (let i = i0; i < Math.min(ops.length, i0 + W); i++) {
      const [dx, dy, dz, pi, branch] = ops[i];
      const perm = P.perms[pi];
      if (!perm || taken.has(`${dx},${dy},${dz}`)) continue;
      let b;
      try {
        b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      } catch {
        b = undefined;
      }
      if (!b) continue;
      const want = P.plan.pal[pi][0];
      if (b.typeId === want) continue;
      if (!canFill(b.typeId) && !(branch && b.typeId === LOG)) {
        stats.blocked++;
        continue;
      }
      add(dx, dy, dz, keepCode(b.typeId, b.permutation.getAllStates()), want);
      batch.push([b, perm, want]);
    }
    writeKept(v.id, rec, from);
    stats.kept += batch.length;
    let n = 0;
    for (const [b, perm, want] of batch) {
      try {
        b.setPermutation(perm);
        placed.set(`${v.dim}|${b.x},${b.y},${b.z}`, want);
        stats.placed++;
      } catch (err) {
        reportError("ffShow", err);
      }
      if (++n % g().opsPerTick === 0) yield;
    }
    yield;
  }
  for (const at of P.friends) {
    try {
      const under = d.getBlock({ x: at.x, y: at.y - 1, z: at.z })?.typeId;
      if (!under || under === "minecraft:air" || under === "minecraft:jungle_leaves") continue;
      d.spawnEntity(FF_ENTITY, { x: at.x + 0.5, y: at.y, z: at.z + 0.5 }).addTag(`ff_${v.id}`);
    } catch (err) {
      reportError("ffFriend", err);
    }
  }
  for (const q of players) if (q.vision && visionNear(v, [q], g().showReach)) message(q.p, "§dHigh in the tallest trees, the Frequency Friends' village hums into view: homes in the branches, and bridges between them.");
  stats.shown++;
}

/** Anyone up there gets a slow fall, not a long drop. */
function slowFall(v, box) {
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === v.dim && inBox(p.location, { min: { x: box.min.x - 2, y: box.min.y - 2, z: box.min.z - 2 }, max: { x: box.max.x + 2, y: box.max.y + 4, z: box.max.z + 2 } })) p.addEffect("slow_falling", g().slowFall, { showParticles: false });
    } catch {
      // only a kindness
    }
  }
}

/**
 * Take the village down, last block first (so nothing that hangs on another loses its hold and drops): each block back
 * as it was, where our block is still there (so nothing anyone put there since is touched); last of all the leaves made
 * to stay go back to just what they were.
 */
function* hide(v) {
  const d = world.getDimension(v.dim);
  const rec = readKept(v.id);
  removeFriends(d, v);
  slowFall(v, boxOf(v));
  if (!rec?.parts) {
    update(v.id, (x) => (x.shown = false));
    placedBy.delete(v.id);
    return;
  }
  const entries = unpackEntries(rec.parts.join(""));
  const left = [];
  let n = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    const [dx, dy, dz, c, t] = entries[i];
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      const only = rec.t[t].startsWith("~"); // a leaf only made to stay: back to just what it was
      if (!b) left.push(entries[i]);
      else if (b.typeId === (only ? rec.t[t].slice(1) : rec.t[t])) {
        const o = only ? fromCode(rec.c[c]) : restoreOf(rec.c[c]);
        b.setPermutation(BlockPermutation.resolve(o.typeId, o.states));
        stats.restored++;
      }
    } catch (err) {
      left.push(entries[i]);
      reportError("ffHide", err);
    }
    if (++n % g().opsPerTick === 0) yield;
  }
  dropKept(v.id, rec.n);
  if (left.length) {
    left.reverse();
    const parts = [""];
    for (const e of left) {
      const s = packEntry(...e);
      if (parts[parts.length - 1].length + s.length > KEPT_PART) parts.push("");
      parts[parts.length - 1] += s;
    }
    writeKept(v.id, { c: rec.c, t: rec.t, parts });
  } else {
    update(v.id, (x) => (x.shown = false));
    placedBy.delete(v.id);
  }
  stats.hidden++;
}

/** 0.1.340's village (four huts of Frequency blocks in a crown), taken down as it was put up: then a tree house village is planned in its place. */
function* hideV1(v) {
  const d = world.getDimension(v.dim);
  const PLANNED = new Map(villagePlanV1().map(([dx, dy, dz, block]) => [`${dx},${dy},${dz}`, block]));
  let rec;
  try {
    rec = JSON.parse(String(world.getDynamicProperty(keptKey(v.id)) ?? '{"c":[],"k":[]}'));
  } catch {
    rec = { c: [], k: [] };
  }
  removeFriends(d, v);
  slowFall(v, villageBoxV1(v));
  let n = 0;
  for (const k of rec.k ?? []) {
    const [dx, dy, dz, ci] = k;
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      if (b && b.typeId === PLANNED.get(`${dx},${dy},${dz}`)) {
        const o = restoreOf(rec.c[ci]);
        b.setPermutation(BlockPermutation.resolve(o.typeId, o.states));
        stats.restored++;
      }
    } catch (err) {
      reportError("ffHide", err);
    }
    if (++n % g().opsPerTick === 0) yield;
  }
  // any of its Frequency blocks left on the plan (put in but not yet written down when the world stopped): to air
  for (const [dx, dy, dz] of [...PLANNED.keys()].map((k) => k.split(",").map(Number))) {
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      if (b && FF_BLOCKS.includes(b.typeId)) b.setType("minecraft:air");
    } catch {
      // unloaded: it stays on the list for next time
    }
    if (++n % (g().opsPerTick * 4) === 0) yield;
  }
  world.setDynamicProperty(keptKey(v.id), undefined);
  save(load().filter((x) => x.id !== v.id));
  stats.migrated++;
}

/**
 * A job on a village (laying it out, putting it up, taking it down) with all of `box` loaded while it runs (0.1.350: a
 * ticking area of its own; the game itself keeps only some 4 chunks round a player loaded, too few for a village
 * some 90 blocks across, and the village waited for ever for the rest). Taken down after.
 */
function run(v, box, job, ...args) {
  busy.add(v.id);
  stats.loads++;
  const d = world.getDimension(v.dim);
  withLoadedIn(d, `zoocraft_ffv_${v.id}`, box.min, box.max, () => new Promise((resolve) => {
    system.runJob(
      (function* () {
        try {
          yield* job(v, ...args);
        } catch (err) {
          reportError("ffVillage", err);
        }
        resolve(undefined);
      })(),
    );
  })).then(
    () => busy.delete(v.id),
    (err) => {
      stats.loadFailed++;
      if (stats.loadFailed <= 3) reportError("ffLoad", err);
      waitTill.set(v.id, system.currentTick + 200); // tried again in 10 s
      busy.delete(v.id);
    },
  );
}

/** Each Frequency Friend drawn for the players with the vision, and for nobody else. */
function drawFriends(list, players) {
  const online = new Set(players.map((q) => q.p.id));
  for (const v of list) {
    if (!v.shown) continue;
    let ents = [];
    try {
      ents = world.getDimension(v.dim).getEntities({ type: FF_ENTITY, tags: [`ff_${v.id}`] });
    } catch {
      ents = [];
    }
    for (const e of ents) {
      let set = seenBy.get(e.id);
      if (!set) seenBy.set(e.id, (set = new Set()));
      for (const id of [...set]) if (!online.has(id)) set.delete(id); // left: drawn afresh if they come back
      for (const q of players) {
        try {
          if (q.vision) {
            q.p.setPropertyOverrideForEntity(e, SEEN, true); // every time round: cheap, and sure to hold
            set.add(q.p.id);
          } else if (set.has(q.p.id)) {
            q.p.removePropertyOverrideForEntity(e, SEEN);
            set.delete(q.p.id);
          }
        } catch {
          // the player or the friend left
        }
      }
    }
  }
}

/** Every 2 seconds: look for villages, lay them out, put them up and take them down, draw the friends. */
export function tickVillages() {
  const players = [];
  for (const p of onlinePlayers()) {
    try {
      const vision = hasVision(p);
      if (vision && !p.hasTag(VISION_TAG)) p.addTag(VISION_TAG);
      else if (!vision && p.hasTag(VISION_TAG)) p.removeTag(VISION_TAG);
      players.push({ p, x: p.location.x, y: p.location.y, z: p.location.z, dim: p.dimension.id, vision });
    } catch {
      // left this tick
    }
  }
  const list = load();
  // a new stretch of jungle looked over (0.1.350: one looked over with nothing found, again after a while)
  if (!scanning) {
    for (const q of players) {
      if (!q.vision || q.dim !== "minecraft:overworld") continue;
      if (villageNear(list, q.dim, q.x, q.z, g().spacing)) continue;
      if (lookedOver(q)) continue;
      if (!isJungle(biomeAt(q.p.dimension, q.p.location))) continue;
      startScan(q.dim, q.x, q.z);
      break;
    }
  }
  // laid out when someone with the vision first comes near; up while one is near; down when none is
  for (const v of list) {
    if (busy.has(v.id) || (waitTill.get(v.id) ?? 0) > system.currentTick) continue;
    let d;
    try {
      d = world.getDimension(v.dim);
    } catch {
      continue;
    }
    if (v.v !== PLAN_V) {
      // 0.1.340's village: down (if it stands) and off the list, so the tree house village takes its place
      if (!v.shown) {
        world.setDynamicProperty(keptKey(v.id), undefined);
        save(load().filter((x) => x.id !== v.id));
        stats.migrated++;
      } else run(v, villageBoxV1(v), hideV1);
      continue;
    }
    if (!v.L) {
      if (visionNear(v, players, g().showReach)) run(v, areaOf(v), layOut);
      continue;
    }
    if (v.shown) placedOf(v);
    const near = visionNear(v, players, v.shown ? g().hideReach : g().showReach);
    if (near === v.shown) continue;
    if (near) run(v, reachOf(v), show, players);
    else run(v, reachOf(v), hide);
  }
  drawFriends(list, players);
}

/** Whether the jungle round a player was looked over lately and no village found. */
function lookedOver(q) {
  const t = system.currentTick;
  return scanned.some((s) => s.dim === q.dim && Math.hypot(s.x - q.x, s.z - q.z) < g().scanRadius && t - (s.at ?? 0) < g().rescan);
}

/** The jungle round (x, z) looked over now (a job). */
function startScan(dim, x, z) {
  scanning = true;
  const at = { dim, x: Math.floor(x), z: Math.floor(z) };
  system.runJob(
    (function* () {
      try {
        yield* scan(at.dim, at.x, at.z);
      } catch (err) {
        reportError("ffScan", err);
      }
      scanning = false;
    })(),
  );
}

/**
 * 0.1.350, /zoocraft:village: why there is (or isn't) a village round a player, as lines for chat; `look`: the jungle
 * round them looked over now (if they have the vision and are in a jungle).
 */
export function villageReport(player, look) {
  const out = [];
  const l = player.location, dim = player.dimension.id;
  const left = Number(player.getDynamicProperty(VISION_KEY) ?? 0) || 0;
  out.push(left > 0 ? `Transcending Vision: on, ${Math.ceil(left)} s left.` : "Transcending Vision: off (throw the Lightning TNT Frequency Stick at your feet). No village shows without it.");
  const biome = biomeAt(player.dimension, l);
  const jungle = isJungle(biome);
  out.push(dim !== "minecraft:overworld" ? "You're not in the Overworld." : !biome ? "Here: the ground round you isn't loaded yet; ask again in a moment." : `Here: ${biome.id}${jungle ? " (a jungle)" : " (not a jungle: villages are only looked for in jungles)"}.`);
  const list = load();
  const v = villageNear(list, dim, l.x, l.z, 100000);
  if (v) {
    const dist = Math.round(Math.hypot(v.x - l.x, v.z - l.z));
    const state = v.v !== PLAN_V ? "an old one from 0.1.340, coming down" : busy.has(v.id) ? "being worked on now" : v.shown ? "up" : v.L ? "laid out, not up (it goes up when someone with the vision is within " + g().showReach + " blocks)" : "found, not laid out yet (that happens when someone with the vision is within " + g().showReach + " blocks)";
    out.push(`Nearest village: its great tree at ${v.x} ${v.y} ${v.z}, ${dist} blocks away: ${state}. Villages in this world: ${list.length}.`);
  } else out.push("No village found in this world yet.");
  const s = stats.last;
  if (s) out.push(`Last look over the jungle: round ${s.at[0]} ${s.at[1]}, ${Math.round((system.currentTick - s.tick) / 20)} s ago: ${s.trunk ? `the tallest trunk ${s.trunk[4]} logs at ${s.trunk[0]} ${s.trunk[1]} ${s.trunk[2]}` : "no trunk tall enough"}; ${s.why}.`);
  else out.push("No look over the jungle yet since the world opened.");
  if (stats.loadFailed) out.push(`Couldn't load a village's area ${stats.loadFailed} time(s) (tried again).`);
  if (look) {
    if (left <= 0) out.push("Not looking: you need the vision.");
    else if (!jungle || dim !== "minecraft:overworld") out.push("Not looking: you need to be in a jungle.");
    else if (scanning) out.push("Already looking; ask again in a moment.");
    else {
      for (let i = scanned.length - 1; i >= 0; i--) if (scanned[i].dim === dim && Math.hypot(scanned[i].x - l.x, scanned[i].z - l.z) < g().scanRadius) scanned.splice(i, 1);
      startScan(dim, l.x, l.z);
      out.push(`Looking over the jungle within ${g().scanRadius} blocks of you now; ask again in a moment.`);
    }
  }
  return out;
}

/** Is this one of a standing village's blocks (one it put there)? */
function ours(block) {
  const k = `${block.dimension.id}|${block.x},${block.y},${block.z}`;
  for (const m of placedBy.values()) if (m.get(k) === block.typeId) return true;
  return false;
}

/** A standing village's blocks can't be broken (a word in chat, now and then, so it isn't a mystery). */
export function villageBreakBefore(e) {
  if (!placedBy.size || !ours(e.block)) return false;
  e.cancel = true;
  const p = e.player;
  const now = system.currentTick;
  if (now - (told.get(p.id) ?? -1e9) > 100) {
    told.set(p.id, now);
    system.runTimeout(() => {
      try {
        message(p, "§dThe Frequency Friends' wood hums under your hand, and won't give.");
      } catch {
        // gone
      }
    }, 1);
  }
  return true;
}

/** ...nor stripped with an axe (it would no longer be ours, and stay behind when the village goes). */
export function villageInteractBefore(e) {
  if (!placedBy.size || !/_axe$/.test(e.itemStack?.typeId ?? "") || !/_(log|wood)$/.test(e.block.typeId) || !ours(e.block)) return false;
  e.cancel = true;
  return true;
}

/** ...nor blown up: a blast near a standing village leaves its blocks be. */
export function villageBlastBefore(e) {
  if (!placedBy.size) return;
  const hit = e.getImpactedBlocks();
  const keep = hit.filter((b) => !ours(b));
  if (keep.length !== hit.length) e.setImpactedBlocks(keep);
}

/** A player with the vision talking to a Frequency Friend gets a line in chat (the friend's interact asks for the vision). */
export function friendInteract(player, target) {
  if (target?.typeId !== FF_ENTITY || !hasVision(player)) return;
  message(player, `§d${FRIEND_LINES[Math.floor(Math.random() * FRIEND_LINES.length)]}`);
}

/** Bench: what has happened, and the villages. */
export function villageDebug() {
  return { ...stats, scanning, busy: busy.size, standing: [...placedBy].map(([id, m]) => [id, m.size]), villages: load().map((v) => ({ ...v, L: v.L && { ...v.L, sats: v.L.sats.length } })) };
}
/** Bench: a village's plan and its record. */
export function villagePlanDebug(id) {
  const v = load().find((x) => x.id === id) ?? load()[0];
  if (!v?.L) return undefined;
  return { v, plan: planOf(v), kept: readKept(v.id) };
}
