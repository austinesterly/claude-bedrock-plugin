// 0.1.340: the Frequency Friends' hidden jungle villages at run time (rules: world/jungleVillageRules.js; numbers:
// BALANCE.jungleVillage). A player with Transcending Vision in a jungle with no village near has the jungle around
// looked over (a job) for its tallest tree; a tall enough one gets a village in its canopy. While a player with the
// vision is near, the village stands (for everyone near: Austin's "Shared reveal", 2026-11-20); when none is, every
// block goes back as it was. What a village replaced is kept in a world property until it is put back, so a village
// left up by a restart comes down again. The Frequency Friends are drawn only for players with the vision.
import { world, system, BlockPermutation } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, onlinePlayers, biomeAt } from "../platform/mc.js";
import { hasVision } from "./vision.js";
import { FF_ENTITY, FF_BLOCKS, SEEN, canFill, isJungle, tallestTrunks, villagePlan, FRIEND_SPOTS, villageBox, inBox, visionNear, villageNear, keepCode, restoreOf, FRIEND_LINES, occupied } from "./jungleVillageRules.js";

const LIST_KEY = "zoocraft:ff_villages";
const keptKey = (id) => `zoocraft:ff_kept:${id}`;
export const VISION_TAG = "zoocraft_vision"; // on players while they have the vision: the friends' interact asks for it
const PLAN = villagePlan();
const PLANNED = new Map(PLAN.map(([dx, dy, dz, block]) => [`${dx},${dy},${dz}`, block])); // what the village puts where
const busy = new Set(); // village ids being put up or taken down
const seenBy = new Map(); // friend entity id -> ids of the players it is drawn for
const scanned = []; // { dim, x, z } looked over this session with no village found
let scanning = false;
/** @type {{ scans: number, found: number, shown: number, hidden: number, placed: number, restored: number, swept: number, last?: object }} */
const stats = { scans: 0, found: 0, shown: 0, hidden: 0, placed: 0, restored: 0, swept: 0 };
const g = () => BALANCE.jungleVillage;

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
function setShown(id, shown) {
  const list = load();
  const v = list.find((x) => x.id === id);
  if (v) {
    v.shown = shown;
    save(list);
  }
}

/** How tall the jungle log column under (x, y, z) is, counting down from there (a trunk, or a branch: 1 or 2). */
function trunkHeight(d, top) {
  let down = top.y;
  try {
    while (top.y - down < 64 && d.getBlock({ x: top.x, y: down - 1, z: top.z })?.typeId === "minecraft:jungle_log") down--;
  } catch {
    // as far as could be read
  }
  return top.y - down + 1;
}

/**
 * Look the jungle around (x, z) over for its tallest tree, a column in 2 each way (so no 2 by 2 trunk is missed); put
 * a village in its crown if its trunk is tall enough.
 */
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
  // the highest trunk top that is a real trunk, not a branch or a small tree
  let trunk;
  for (const t of tallestTrunks(samples)) {
    if (trunkHeight(d, t) >= g().minTrunk) {
      trunk = t;
      break;
    }
    yield;
  }
  stats.last = { at: [cx, cz], samples: samples.length, trunk: trunk && [trunk.x, trunk.y, trunk.z] };
  if (!trunk || !isJungle(biomeAt(d, trunk))) {
    scanned.push({ dim, x: cx, z: cz });
    if (scanned.length > 64) scanned.shift();
    return;
  }
  const list = load();
  if (villageNear(list, dim, trunk.x, trunk.z, g().spacing) || list.length >= g().max) return;
  const id = `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  list.push({ id, dim, x: trunk.x, y: trunk.y - g().belowTop, z: trunk.z, shown: false });
  save(list);
  stats.found++;
}

function loaded(d, v) {
  const b = villageBox(v);
  for (const x of [b.min.x, b.max.x]) for (const z of [b.min.z, b.max.z]) if (!d.isChunkLoaded({ x, y: v.y, z })) return false;
  return true;
}

function removeFriends(d, v) {
  for (const e of d.getEntities({ type: FF_ENTITY, tags: [`ff_${v.id}`] })) {
    seenBy.delete(e.id);
    e.remove();
  }
}

/**
 * Put the village up: each planned block where there is air, leaves or vine and nobody stands, and the crown's leaves
 * cleared from where people walk; what was there kept.
 */
function* show(v, players) {
  const d = world.getDimension(v.dim);
  const codes = [], kept = [];
  const codeOf = (c) => {
    let i = codes.indexOf(c);
    if (i < 0) i = codes.push(c) - 1;
    return i;
  };
  const write = () => world.setDynamicProperty(keptKey(v.id), JSON.stringify({ c: codes, k: kept }));
  const taken = occupied(v, players);
  setShown(v.id, true);
  removeFriends(d, v);
  let n = 0;
  for (const [dx, dy, dz, block] of PLAN) {
    if (taken.has(`${dx},${dy},${dz}`)) continue;
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      if (b && canFill(b.typeId) && b.typeId !== block) {
        kept.push([dx, dy, dz, codeOf(keepCode(b.typeId, b.permutation.getAllStates()))]);
        b.setType(block);
        stats.placed++;
      }
    } catch (err) {
      reportError("ffShow", err);
    }
    if (++n % g().opsPerTick === 0) {
      write();
      yield;
    }
  }
  write();
  for (const [dx, dy, dz] of FRIEND_SPOTS) {
    try {
      const at = { x: v.x + dx + 0.5, y: v.y + dy, z: v.z + dz + 0.5 };
      if (!FF_BLOCKS.includes(d.getBlock({ x: v.x + dx, y: v.y + dy - 1, z: v.z + dz })?.typeId ?? "")) continue;
      d.spawnEntity(FF_ENTITY, at).addTag(`ff_${v.id}`);
    } catch (err) {
      reportError("ffFriend", err);
    }
  }
  for (const q of players) if (q.vision && visionNear(v, [q], g().showReach)) message(q.p, "§dHigh in the tallest tree, a village of the Frequency Friends hums into view.");
  stats.shown++;
}

/**
 * Take the village down: the friends go; each kept block back as it was where the village's own block (or the air it
 * cleared) is still there, so nothing anyone put there since is touched; then any of ours left on the plan to air.
 */
function* hide(v) {
  const d = world.getDimension(v.dim);
  let rec;
  try {
    rec = JSON.parse(String(world.getDynamicProperty(keptKey(v.id)) ?? '{"c":[],"k":[]}'));
  } catch {
    rec = { c: [], k: [] };
  }
  removeFriends(d, v);
  // anyone up there gets a slow fall, not a long drop
  const box = villageBox(v);
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === v.dim && inBox(p.location, box)) p.addEffect("slow_falling", g().slowFall, { showParticles: false });
    } catch {
      // only a kindness
    }
  }
  const left = [];
  let n = 0;
  for (const k of rec.k) {
    const [dx, dy, dz, ci] = k;
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      if (!b) left.push(k);
      else if (b.typeId === PLANNED.get(`${dx},${dy},${dz}`)) {
        const o = restoreOf(rec.c[ci]);
        b.setPermutation(BlockPermutation.resolve(o.typeId, o.states));
        stats.restored++;
      }
    } catch (err) {
      left.push(k);
      reportError("ffHide", err);
    }
    if (++n % g().opsPerTick === 0) yield;
  }
  // a block put in but not yet kept when the world stopped: it had been air, leaves or vine, so air it is
  for (const [dx, dy, dz] of PLAN) {
    try {
      const b = d.getBlock({ x: v.x + dx, y: v.y + dy, z: v.z + dz });
      if (b && FF_BLOCKS.includes(b.typeId)) {
        b.setType("minecraft:air");
        stats.swept++;
      }
    } catch {
      // unloaded: the next time round
    }
    if (++n % (g().opsPerTick * 4) === 0) yield;
  }
  if (left.length) world.setDynamicProperty(keptKey(v.id), JSON.stringify({ c: rec.c, k: left }));
  else {
    world.setDynamicProperty(keptKey(v.id), undefined);
    setShown(v.id, false);
  }
  stats.hidden++;
}

function run(v, job, ...args) {
  busy.add(v.id);
  system.runJob(
    (function* () {
      try {
        yield* job(v, ...args);
      } catch (err) {
        reportError("ffVillage", err);
      }
      busy.delete(v.id);
    })(),
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

/** Every 2 seconds: look for villages, put them up and take them down, draw the friends for whoever can see them. */
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
  // a new stretch of jungle looked over
  if (!scanning) {
    for (const q of players) {
      if (!q.vision || q.dim !== "minecraft:overworld") continue;
      if (villageNear(list, q.dim, q.x, q.z, g().spacing)) continue;
      if (scanned.some((s) => s.dim === q.dim && Math.hypot(s.x - q.x, s.z - q.z) < g().scanRadius)) continue;
      if (!isJungle(biomeAt(q.p.dimension, q.p.location))) continue;
      scanning = true;
      const at = { dim: q.dim, x: Math.floor(q.x), z: Math.floor(q.z) };
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
      break;
    }
  }
  // up while someone with the vision is near; down when nobody is
  for (const v of list) {
    if (busy.has(v.id)) continue;
    let d;
    try {
      d = world.getDimension(v.dim);
    } catch {
      continue;
    }
    const near = visionNear(v, players, v.shown ? g().hideReach : g().showReach);
    if (near === v.shown || !loaded(d, v)) continue;
    if (near) run(v, show, players);
    else run(v, hide);
  }
  drawFriends(list, players);
}

/** A player with the vision talking to a Frequency Friend gets a line in chat (the friend's interact asks for the vision). */
export function friendInteract(player, target) {
  if (target?.typeId !== FF_ENTITY || !hasVision(player)) return;
  message(player, `§d${FRIEND_LINES[Math.floor(Math.random() * FRIEND_LINES.length)]}`);
}

/** Bench: what has happened, and the villages. */
export function villageDebug() {
  return { ...stats, scanning, busy: busy.size, villages: load() };
}
