import { system } from "@minecraft/server";
import { VOID, VOID_ACT, dragSpots, grabStep } from "./voidRules.js";
import { guardKnock } from "./babyDragon.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";

// The Voidling's grab (0.1.167; research/mobhouse_plan.md "0.1.167 Voidling: the design"; the rules are in
// animals/voidRules.js): once its shriek is over and someone is in its reach in front of it, animals/boss.js hands them
// here with its way to the island's edge (edgeRoute). Every tick, a step: it walks its way at a slow pace, by teleport,
// turned along it, and holds them out in front of it (teleported there each tick, their own look kept), lifted a little;
// at the edge they are over the void, and it lets go. Any player's hit on it breaks the grab (boss.js's before-hurt
// calls grabHit): it staggers back and they are put down, pushed back toward the island. An ender pearl or a chorus fruit
// (they turn up far from where it held them), its way blocked for 2 seconds, it or they gone, or they no longer in
// Survival or Adventure: it lets go where it is. boss.js reads how the grab ended (takeGrab) and goes on with its fight.

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Player} Player */
/**
 * @typedef {{ yaw: number, dir: { x: number, z: number }, length: number, edge: number, floors: { s: number, y: number }[],
 *   from: { x: number, z: number }, floorY: number }} Route
 */

const PROP = "zoocraft:act";
/** @type {Map<string, { e: Entity, p: Player, route: Route, g: { s: number, ticks: number, stuck: number }, last: { x: number, y: number, z: number }, hit: boolean }>} */
const grabs = new Map();
/** @type {Map<string, string>} voidling id -> how its last grab ended */
const ended = new Map();

function setAct(e, act) {
  try {
    if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
  } catch {
    // gone
  }
}

function sound(e, id, volume = 1, pitch = 1) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // cosmetic only
  }
}

function particle(e, id, up = 1.2) {
  try {
    const l = e.location;
    e.dimension.spawnParticle(id, { x: l.x, y: l.y + up, z: l.z });
  } catch {
    // cosmetic only
  }
}

// Whether a Voidling is holding someone now.
/** @param {string} id */
export function grabbing(id) {
  return grabs.has(id);
}

// A player's hit on a Voidling (from the before-hurt event: nothing in the world is changed here): its grab breaks on the
// next tick.
/** @param {string} id */
export function grabHit(id) {
  const g = grabs.get(id);
  if (g) g.hit = true;
}

// How its last grab ended ("edge", "broken", "escaped", "stuck", "timeout", "lost" or "stopped"), once; undefined while
// it holds someone or after it was read.
/** @param {string} id */
export function takeGrab(id) {
  if (grabs.has(id)) return undefined;
  const out = ended.get(id);
  ended.delete(id);
  return out;
}

// A grab begun: `p` taken, turned to face its way, the catch's sound and a burst of violet.
/** @param {Entity} e @param {Player} p @param {Route} route */
export function startGrab(e, p, route) {
  if (grabs.has(e.id)) return false;
  try {
    const l = p.location;
    grabs.set(e.id, { e, p, route, g: { s: 0, ticks: 0, stuck: 0 }, last: { x: l.x, y: l.y, z: l.z }, hit: false });
  } catch {
    return false;
  }
  ended.delete(e.id);
  setAct(e, VOID_ACT.drag);
  sound(e, "mob.endermen.portal", 1.4, 0.55);
  particle(e, "zoocraft:voidling_wisp");
  return true;
}

// Let go now, wherever it is (its fight over, it tired out or calmed, or it gone): they are put down where they are.
/** @param {string} id */
export function endGrab(id, why = "stopped") {
  const G = grabs.get(id);
  if (!G) return;
  grabs.delete(id);
  ended.set(id, why);
}

// The ground and room at its next spot: its feet, knees and head clear of anything solid (a block someone put in its
// way), and the spot they are held in too. Room is air, or grass and the like walked through (data/blocks.js
// PASSABLE_PATTERNS). (Block.isSolid is not in the stable script API: it reads undefined, bench 0.1.167.)
function roomAt(d, p, high) {
  const x = Math.floor(p.x), z = Math.floor(p.z), y0 = Math.floor(p.y + 0.01);
  for (let y = y0; y < y0 + high; y++) {
    const b = d.getBlock({ x, y, z });
    if (b === undefined || !(b.isAir || PASSABLE_PATTERNS.some((r) => r.test(b.typeId)))) return false;
  }
  return true;
}

// Every tick: each Voidling holding someone, a step on.
export function tickGrabs() {
  for (const [id, G] of [...grabs]) {
    const { e, p, route, g } = G;
    let lost = false;
    let where;
    try {
      lost = !e.isValid || !p.isValid;
      if (!lost) {
        const mode = String(p.getGameMode()).toLowerCase();
        lost = mode !== "survival" && mode !== "adventure";
        where = p.location;
      }
    } catch {
      lost = true;
    }
    const leash = where ? Math.hypot(where.x - G.last.x, where.y - G.last.y, where.z - G.last.z) : 0;
    let blocked = false;
    if (!lost && !G.hit) {
      try {
        const next = dragSpots(route, route.from, route.floorY, g.s + VOID.grab.pace);
        blocked = !roomAt(e.dimension, next.me, 3) || (!next.over && !roomAt(e.dimension, next.them, 2));
      } catch {
        blocked = true;
      }
    }
    const out = grabStep(g, { hit: G.hit, lost, leash, blocked }, route.length);
    try {
      if (out === "walk") {
        const at = dragSpots(route, route.from, route.floorY, g.s);
        e.teleport(at.me, { rotation: { x: 0, y: route.yaw }, keepVelocity: false });
        p.teleport(at.them, { keepVelocity: false });
        G.last = at.them;
        if (g.ticks % 12 === 0) sound(e, "mob.endermen.idle", 0.9, 0.45); // its slow steps, a low murmur
        continue;
      }
      grabs.delete(id);
      ended.set(id, out);
      if (out === "edge") {
        // Out over the void: held there a moment, then let go (a little flung out, so they fall clear of the edge).
        const at = dragSpots(route, route.from, route.floorY, route.length);
        p.teleport(at.them, { keepVelocity: false });
        system.runTimeout(() => {
          try {
            p.applyKnockback({ x: route.dir.x * 0.25, z: route.dir.z * 0.25 }, 0);
          } catch {
            // gone
          }
        }, 1);
        setAct(e, VOID_ACT.letgo);
        sound(e, "mob.endermen.scream", 1.2, 0.55);
        sound(e, "mob.endermen.stare", 0.8, 0.7);
        particle(e, "zoocraft:voidling_wisp");
      } else if (out === "broken") {
        // Hit: it staggers back and drops them, pushed back toward the island (the way it came; guarded all the same).
        const back = { x: -route.dir.x, z: -route.dir.z };
        const h = guardKnock(e.dimension, p.location, back, VOID.grab.free.h);
        p.applyKnockback({ x: back.x * h, z: back.z * h }, VOID.grab.free.v);
        setAct(e, VOID_ACT.stagger);
        sound(e, "mob.endermen.hit", 1.2, 0.55);
        particle(e, "zoocraft:voidling_wisp");
      } else if (out !== "lost") {
        setAct(e, VOID_ACT.letgo);
        sound(e, "mob.endermen.idle", 1.0, 0.5);
      }
    } catch {
      grabs.delete(id);
      ended.set(id, "lost");
    }
  }
}
