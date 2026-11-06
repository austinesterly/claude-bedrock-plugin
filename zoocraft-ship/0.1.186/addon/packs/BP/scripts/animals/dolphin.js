// Dolphins in the game (0.1.186; the rules are animals/dolphinRules.js, research/vanilla_plan.md "0.1.186 dolphins: the
// design"). The game swims the zoo copy (movement.basic, its navigation letting it sink, so it uses the pool's whole
// depth). Its leap the script gives it: under movement.basic the game's own breach never lifts it out (the test server:
// the game's dolphins leapt now and then, the copies never). Every 10 ticks, for each zoo dolphin in an exhibit within
// range of a player: when its leap is due and it's close under the surface, an arc out of the water and back in a few
// blocks on (dolphinRules.leapPath, checked clear: never through a wall or out of the pool), with the game's dolphin
// jump and splash sounds; carried along the arc by teleport, a point a tick (tickDolphinMoves). If it isn't near the
// surface, or no way out is clear, it tries again a moment later while the leap is due.
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { between } from "./rayRules.js";
import { surfaceAbove } from "./manateeRules.js";
import { underSurface, leapPath, leapClear } from "./dolphinRules.js";
import { reportError } from "../core/log.js";

const TYPES = Object.values(SPECIES).filter((s) => s.deepPool).map((s) => s.entityType);
const TURNS = [0, 45, -45, 90, -90, 135, -135, 180]; // ways out tried, from its heading

const state = new Map(); // entity id -> { leapAt }
const moving = new Map(); // entity id -> { e, pts, i }
const reported = new Set();

function sound(e, id) {
  try {
    e.dimension.playSound(id, e.location, { volume: 0.7, pitch: 0.9 + Math.random() * 0.2 });
  } catch {
    // cosmetic
  }
}

// Every 10 ticks: each zoo dolphin near a player.
export function tickDolphins(now) {
  if (!TYPES.length) return;
  const T = BALANCE.dolphin;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, T.range, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        stepDolphin(e, now, T);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("dolphin", error);
        }
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id) && !moving.has(id)) state.delete(id);
}

function stepDolphin(e, now, T) {
  if (moving.has(e.id)) return;
  let s = state.get(e.id);
  if (!s) {
    s = { leapAt: now + between(T.firstLeap, Math.random()) };
    state.set(e.id, s);
  }
  if (now < s.leapAt) return;
  const a = animalFromEntity(e);
  if (a?.location.kind !== "exhibit" || !e.isInWater) {
    s.leapAt = now + T.retry;
    return;
  }
  const read = blockReader(e.dimension, { seagrass: true });
  const l = e.location;
  const surface = surfaceAbove(read, Math.floor(l.x), Math.floor(l.y), Math.floor(l.z), Math.ceil(T.leapFrom) + 1);
  if (surface === undefined || underSurface(l.y, surface, T) === undefined) {
    s.leapAt = now + T.retry; // too deep (or under a roof): it tries again in a moment
    return;
  }
  const yaw = e.getRotation().y;
  for (const turn of TURNS) {
    const pts = leapPath(l, yaw + turn, surface, T);
    if (!leapClear(pts, surface, read)) continue;
    moving.set(e.id, { e, pts, i: 0, yaw: yaw + turn });
    s.leapAt = now + between(T.leapEvery, Math.random());
    sound(e, "mob.dolphin.jump");
    return;
  }
  s.leapAt = now + T.retry; // no clear way out from here: in a moment
}

// Every tick: each leaping dolphin a point along its arc; at the end, the splash.
export function tickDolphinMoves() {
  for (const [id, mv] of [...moving]) {
    const e = mv.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      const p = mv.pts[mv.i++];
      e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: p.pitch, y: mv.yaw }, keepVelocity: false });
      if (mv.i >= mv.pts.length) {
        moving.delete(id);
        e.clearVelocity();
        sound(e, "mob.dolphin.splash");
      }
    } catch {
      moving.delete(id);
    }
  }
}

// Leaping now (the Field Journal's "watch one leap out of the water")?
export function dolphinLeaping(id) {
  return moving.has(id);
}

// Dolphins in a leap now (for /zoocraft:status and the test server).
export function dolphinMoves() {
  return { leaping: moving.size, watched: state.size };
}
