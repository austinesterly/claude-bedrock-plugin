import { world, system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, biomeAt } from "../platform/mc.js";
import { LAVA_RAY, LAVA_FALLS, LAVA_RAYS, isOpenLava, outOfSight, lavaOverFloor, ringColumns, raysToAdd, raySpot, withinReach } from "./lavaRayRules.js";

// Lava Rays where you can see them (0.1.160; the rules and the bench numbers are in animals/lavaRayRules.js). Every 10
// seconds for each player in the Lava Falls: wild rays near them that are out of sight (in a spring set into the rock,
// or a falling stream) are moved to open lava close by, or taken away; and with fewer than 4 about, one or two more are
// put in open lava 8 to 26 blocks off and within 30 (a pool, a fall's pool or the lava sea). A wild ray the game spawns anywhere is
// looked at the same way a tick later. The spawn rule (spawn_rules/wild_lava_ray.json) still adds its own.

const nextAt = new Map(); // player id -> the tick of their next look
const AIR = "minecraft:air";

/** @param {import("@minecraft/server").Dimension} d */
function idReader(d) {
  const memo = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (memo.has(k)) return memo.get(k);
    let id;
    try {
      id = d.getBlock({ x, y, z })?.typeId; // undefined where unloaded: never loads a chunk
    } catch {
      id = undefined;
    }
    memo.set(k, id);
    return id;
  };
}

function spawningOn() {
  try {
    return world.gameRules.doMobSpawning !== false;
  } catch {
    return true;
  }
}

// An open lava top in the column (x, z), looked for down from a start in the air at each of `starts`: the look down
// stops on the floor under any lava (it passes through lava), and the lava over that floor is followed up to its top.
// The top's height, or undefined.
function openTopIn(d, idAt, x, z, starts, lowest, need) {
  for (const y0 of starts) {
    if (idAt(x, y0, z) !== AIR) continue;
    let hit;
    try {
      hit = d.getBlockBelow({ x: x + 0.5, y: y0 + 0.5, z: z + 0.5 }, { includeLiquidBlocks: true, includePassableBlocks: false, maxDistance: Math.max(1, y0 - lowest) });
    } catch {
      hit = undefined;
    }
    if (!hit) continue;
    const top = lavaOverFloor(idAt, x, hit.location.y, z, hit.typeId);
    if (top !== undefined && top < y0 && isOpenLava(idAt, x, top, z, need)) return top;
  }
  return undefined;
}

// Is a player within `r` blocks?
function playerNear(players, at, r) {
  return players.some((p) => {
    try {
      const l = p.location;
      return Math.hypot(l.x - at.x, l.y - at.y, l.z - at.z) <= r;
    } catch {
      return false;
    }
  });
}

// A wild ray out of sight (in a spring set into the rock or a falling stream): moved to open lava near it, or taken
// away. One in open lava or on the bank is left alone.
function settle(ray, players) {
  if (!ray.isValid) return;
  const d = ray.dimension;
  const at = ray.location;
  const idAt = idReader(d);
  if (!outOfSight(idAt, at)) return;
  if (playerNear(players, at, LAVA_RAYS.playerClear)) return;
  const y = Math.floor(at.y);
  const starts = [y + 2, y - 3, y - 8, y - 14];
  for (const c of ringColumns(at, Math.random, LAVA_RAYS.moveTries, [0, LAVA_RAYS.moveRange])) {
    const top = openTopIn(d, idAt, c.x, c.z, starts, y - 30, LAVA_RAYS.keepOpen);
    if (top === undefined) continue;
    ray.teleport(raySpot(c.x, top, c.z), { keepVelocity: false });
    return;
  }
  ray.remove();
}

// A wild ray the game has just spawned: looked at a tick on (its chunk is ready by then).
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  try {
    if (entity.typeId !== LAVA_RAY) return;
  } catch {
    return;
  }
  system.runTimeout(() => {
    try {
      settle(entity, onlinePlayers());
    } catch {
      // gone, or its chunk went; the next look round a player sees to it
    }
  }, 2);
});

export function tickLavaRays(now) {
  const players = onlinePlayers();
  for (const p of players) {
    if ((nextAt.get(p.id) ?? 0) > now) continue;
    nextAt.set(p.id, now + LAVA_RAYS.everyTicks);
    try {
      look(p, players);
    } catch {
      // unloaded round them; next time
    }
  }
  if (nextAt.size > players.length * 2) for (const id of [...nextAt.keys()]) if (!players.some((p) => p.id === id)) nextAt.delete(id);
}

function look(p, players) {
  const d = p.dimension;
  if (d.id !== "minecraft:nether") return;
  const l = p.location;
  if (biomeAt(d, l)?.id !== LAVA_FALLS) return;
  const rays = entitiesNear(d, l, LAVA_RAYS.near, [LAVA_RAY]);
  let kept = 0;
  for (const r of rays) {
    try {
      settle(r, players);
      if (r.isValid) kept++;
    } catch {
      // gone
    }
  }
  if (!spawningOn()) return;
  let want = raysToAdd(kept, Math.random);
  if (!want) return;
  const idAt = idReader(d);
  const fy = Math.floor(l.y);
  const starts = [fy + 1, fy + LAVA_RAYS.up];
  for (const c of ringColumns(l, Math.random, LAVA_RAYS.tries, LAVA_RAYS.ring)) {
    if (want <= 0) break;
    const top = openTopIn(d, idAt, c.x, c.z, starts, fy - LAVA_RAYS.down, LAVA_RAYS.seedOpen);
    if (top === undefined) continue;
    const spot = raySpot(c.x, top, c.z);
    if (!withinReach(l, spot, LAVA_RAYS.reach)) continue;
    if (biomeAt(d, { x: c.x, y: top, z: c.z })?.id !== LAVA_FALLS) continue;
    d.spawnEntity(LAVA_RAY, spot);
    want--;
  }
}
