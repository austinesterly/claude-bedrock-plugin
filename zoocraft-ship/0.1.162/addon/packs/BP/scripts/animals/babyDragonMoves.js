import { flyStep, forgetStep, boxOpen, passesThrough } from "./mover.js";
import { DRAKE_BODY, steerVelocity, moveOptions, pathBlocked, rodBox } from "./babyDragonRules.js";
import { yawOf } from "./bossRules.js";

// How a wild Baby Dragon flies (0.1.162): steered by script a tick at a time, as the Glade's Dragon is (animals/mover.js
// flyStep: a push a tick on an entity with no gravity, or short steps if the game ignores the pushes). animals/babyDragon.js
// gives it a plan, { goal, speed, accel, brake?, face?, arrive?, done? } (goal a point, or a function of the tick giving
// one: its circling), and this eases its velocity toward the goal each tick (babyDragonRules.js steerVelocity), so it
// swings round in curves. Its whole box is checked before each push: with something in the way it climbs over (or
// straight up, or goes on level, or slides along one way past a corner), so it doesn't ram an End island's edge or a
// chorus tree. Stuck a while with every way
// blocked (the bench, 0.1.162: hovering under its nest's rim it could neither rise nor go on), it first flies to the
// nearest open spot with room to rise (a detour), then on. It faces the way it flies, or `face` (a yaw) while it hovers.
// `done(true)` once it is within `arrive` of the goal.

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {{ x: number, y: number, z: number }} V3 */
/**
 * @typedef {{ goal: V3 | ((tick: number) => V3), speed: number, accel?: number, brake?: number, face?: number,
 *   arrive?: number, done?: (ok: boolean) => void }} Plan
 */

const flights = new Map(); // entity id -> { e, plan, v, blocked, moved, detour? }
const DETOUR_AFTER = 6; // ticks blocked every way before it looks for a way round

/** @param {Entity} e @param {Plan} plan */
export function steer(e, plan) {
  const old = flights.get(e.id);
  flights.set(e.id, { e, plan, v: old?.v ?? { x: 0, y: 0, z: 0 }, blocked: 0, moved: 0 });
}

// Stopped where it is (landed, perched, caught, gone): its pushes forgotten, its velocity cleared.
/** @param {string} id @param {Entity} [e] */
export function stopSteer(id, e) {
  const ent = e ?? flights.get(id)?.e;
  flights.delete(id);
  forgetStep(id);
  if (ent) {
    try {
      ent.clearVelocity();
    } catch {
      // gone
    }
  }
}

/** @param {string} id */
export function steering(id) {
  return flights.has(id);
}

// How many ticks in a row its way has been blocked (animals/babyDragon.js gives up a dive or lifts its circle).
/** @param {string} id */
export function blockedTicks(id) {
  return flights.get(id)?.blocked ?? 0;
}

// Whether it is going round something just now (blocked, or on a detour): animals/babyDragon.js starts no move then (the
// bench: a bolt started while it was wedged held it there, hovering, for the bolt's whole wind-up).
/** @param {string} id */
export function goingRound(id) {
  const f = flights.get(id);
  return Boolean(f && (f.blocked > 0 || f.detour));
}

// Change where a flight is facing while it hovers (undefined: the way it flies).
/** @param {string} id @param {number | undefined} yaw */
export function faceTo(id, yaw) {
  const f = flights.get(id);
  if (f) f.plan.face = yaw;
}

const ZERO = { x: 0, y: 0, z: 0 };

// Every tick: each baby dragon in the air a step along its plan.
export function tickDrakeMoves(now) {
  for (const [id, f] of [...flights]) {
    let valid = false;
    try {
      valid = f.e.isValid;
    } catch {
      valid = false;
    }
    if (!valid) {
      flights.delete(id);
      forgetStep(id);
      continue;
    }
    try {
      step(f, now);
    } catch {
      flights.delete(id);
      forgetStep(id);
      try {
        f.plan.done?.(false);
      } catch {
        // gone
      }
    }
  }
}

function step(f, now) {
  const e = f.e;
  const P = f.plan;
  const p = e.location;
  const aim = typeof P.goal === "function" ? P.goal(now) : P.goal;
  const dt = f.detour;
  if (dt && (now >= dt.until || Math.hypot(dt.x - p.x, dt.y - p.y, dt.z - p.z) <= 0.8)) f.detour = undefined;
  if (!f.detour && f.blocked >= DETOUR_AFTER) {
    f.detour = findDetour(e.dimension, p, aim, now);
    f.blocked = 0;
  }
  const goal = f.detour ?? aim;
  const want = steerVelocity(p, f.v, goal, P.speed, P.accel ?? 0.04, P.brake ?? 4);
  let go = ZERO;
  let first = true;
  for (const o of moveOptions(want)) {
    if (Math.hypot(o.x, o.y, o.z) < 1e-4 || boxOpen(e.dimension, p, { x: p.x + o.x, y: p.y + o.y, z: p.z + o.z }, DRAKE_BODY)) {
      go = o;
      break;
    }
    first = false;
  }
  // Blocked: no way it can go makes half the headway the move it wanted would (climbing over or sliding past a corner
  // does).
  const wl2 = want.x * want.x + want.y * want.y + want.z * want.z;
  const headway = wl2 < 1e-8 ? 1 : (go.x * want.x + go.y * want.y + go.z * want.z) / wl2;
  f.blocked = first || headway >= 0.45 ? 0 : f.blocked + 1;
  f.v = go;
  const h = Math.hypot(go.x, go.z);
  const yaw = P.face ?? (h > 0.03 ? yawOf(go.x, go.z) : e.getRotation().y);
  flyStep(e, go, { x: 0, y: yaw }, now, undefined, DRAKE_BODY);
  if (P.done && Math.hypot(aim.x - p.x, aim.y - p.y, aim.z - p.z) <= (P.arrive ?? 0.6)) {
    flights.delete(e.id);
    P.done(true);
  }
}

// The way round when it is stuck: of the spots 3 and 5 blocks off level with it all round, the one nearest the goal
// (along the ground) that it can fly straight to and rise 4 from; none, 2 blocks down if it can. Given up after 2 s.
/** @param {import("@minecraft/server").Dimension} d @param {V3} p @param {V3} aim @param {number} now */
function findDetour(d, p, aim, now) {
  let best;
  let bestD = Infinity;
  for (const r of [3, 5]) {
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const c = { x: p.x + Math.cos(a) * r, y: p.y, z: p.z + Math.sin(a) * r };
      const dd = Math.hypot(aim.x - c.x, aim.z - c.z);
      if (dd >= bestD || !pathOpen(d, p, c) || !roomOver(d, c, 4)) continue;
      best = c;
      bestD = dd;
    }
  }
  if (best) return { ...best, until: now + 40 };
  const down = { x: p.x, y: p.y - 2, z: p.z };
  return pathOpen(d, p, down) ? { ...down, until: now + 20 } : undefined;
}

// Whether its box can go straight from `a` to `b` (checked every 0.25 blocks along the way: in longer steps a slantwise
// way past a corner looked clear that its box catches, a tick's short step at a time).
/** @param {import("@minecraft/server").Dimension} d @param {V3} a @param {V3} b */
export function pathOpen(d, a, b) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / 0.25));
  let prev = a;
  for (let i = 1; i <= n; i++) {
    const q = { x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n, z: a.z + ((b.z - a.z) * i) / n };
    if (!boxOpen(d, prev, q, DRAKE_BODY)) return false;
    prev = q;
  }
  return true;
}

// Room over a spot: its box can rise `up` blocks from there (not under a ledge or its nest's rim).
/** @param {import("@minecraft/server").Dimension} d @param {V3} c @param {number} up */
export function roomOver(d, c, up) {
  return pathOpen(d, c, { x: c.x, y: c.y + up, z: c.z });
}

// Whether a bolt from `a` flies clear to `b`: no block its path touches on the way (`line`: DRAKE.moves.bolt.line;
// pathBlocked) but ones it passes through, and of an end rod only its rod (the bench: from beside its pillar or under
// its nest's rim its bolts hit its own lair).
/** @param {import("@minecraft/server").Dimension} d @param {V3} a @param {V3} b @param {{ pad: number, step: number }} [line] */
export function lineOpen(d, a, b, line) {
  try {
    return !pathBlocked(
      a,
      b,
      (x, y, z) => {
        const block = d.getBlock({ x, y, z });
        if (!block) return true; // unloaded
        if (block.typeId === "minecraft:end_rod") return rodBox(Number(block.permutation.getState("facing_direction") ?? 1));
        return passesThrough(block) ? undefined : true;
      },
      line?.pad ?? 0,
      line?.step ?? 0.25
    );
  } catch {
    return false; // unloaded
  }
}
