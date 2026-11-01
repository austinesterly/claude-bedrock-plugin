import { system } from "@minecraft/server";
import { SLOTH, SLOTH_ACT, climbSteps, walkSteps, solidId } from "./slothRules.js";
import { yawOf } from "./bossRules.js";

// How Soul Sloths move by script (0.1.161): climbing up a post and turning over onto its beam to hang, turning back and
// climbing down, and walking to the foot of the post. A step a tick, by teleport (the Cinder Boar's glides,
// animals/boar.js): the climb and the turn with gravity off (the entity's zoocraft:hang group), the walk on the ground.
// The client plays the matching animation from zoocraft:act (climb 12, hang 10, walk 15): the turn over onto the beam
// and back is the client's own (gen161/sloth160.py turn_up and turn_down, 0.8 s), timed with the lift here. Used by
// animals/boss.js (the wild one in its lair) and animals/sloth.js (a zoo one under its exhibit's beam).

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {{ x: number, z: number, yaw: number, floor: number, climbY: number, hangY: number, beam: number }} Site */

const PROP = "zoocraft:act";
/** @type {Map<string, { e: Entity, pts: { x: number, y: number, z: number, yaw: number }[], i: number, act: number, done: (ok: boolean) => void }>} */
const moving = new Map();

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

/** @param {string} id */
export function gliding(id) {
  return moving.has(id);
}

// Stop a glide where it is (a fight starting): its `done` is not called.
/** @param {string} id */
export function stopGlide(id) {
  moving.delete(id);
}

/** @param {Entity} e @param {{ x: number, y: number, z: number, yaw: number }[]} pts @param {number} act @param {(ok: boolean) => void} done */
function glide(e, pts, act, done) {
  if (!pts.length) return done(true);
  moving.set(e.id, { e, pts, i: 0, act, done });
}

// Every tick: the sloths climbing, turning or walking, a step each.
export function tickSlothMoves() {
  for (const [id, m] of [...moving]) {
    let valid = false;
    try {
      valid = m.e.isValid;
    } catch {
      valid = false;
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      const p = m.pts[m.i++];
      m.e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: 0, y: p.yaw }, keepVelocity: false });
      setAct(m.e, m.act);
      if (m.i < m.pts.length) continue;
      moving.delete(id);
      m.done(true);
    } catch {
      moving.delete(id);
      try {
        m.done(false);
      } catch {
        // gone
      }
    }
  }
}

// Up the post from its foot and over onto the beam: the climb (its head just under the beam at the top), then the turn
// (lifted to the hanging height over the client's turn). Gravity must be off (the caller's zoocraft:hang). `then` once
// it hangs.
/** @param {Entity} e @param {Site} site @param {(ok: boolean) => void} then */
export function climbUp(e, site, then, H = SLOTH.hang) {
  const from = Math.max(site.floor, Math.min(e.location.y, site.climbY));
  const up = climbSteps(from, site.climbY, H.climbPace).map((y) => ({ x: site.x, y, z: site.z, yaw: site.yaw }));
  glide(e, up, SLOTH_ACT.climb, (ok) => {
    if (!ok) return then(false);
    const turn = climbSteps(site.climbY, site.hangY, Math.abs(site.hangY - site.climbY) / H.turnTicks).map((y) => ({ x: site.x, y, z: site.z, yaw: site.yaw }));
    glide(e, turn, SLOTH_ACT.hang, then);
  });
}

// Back off the beam and down the post to its foot: the turn back (lowered to the climbing height), then the climb down.
// Gravity still off; the caller turns it back on in `then`.
/** @param {Entity} e @param {Site} site @param {(ok: boolean) => void} then */
export function climbDown(e, site, then, H = SLOTH.hang) {
  const turn = climbSteps(site.hangY, site.climbY, Math.abs(site.hangY - site.climbY) / H.turnTicks).map((y) => ({ x: site.x, y, z: site.z, yaw: site.yaw }));
  glide(e, turn, SLOTH_ACT.climb, (ok) => {
    if (!ok) return then(false);
    const down = climbSteps(site.climbY, site.floor, H.climbPace).map((y) => ({ x: site.x, y, z: site.z, yaw: site.yaw }));
    glide(e, down, SLOTH_ACT.climb, then);
  });
}

// The floor's height under (x, z) within a block of `y` (the air over a solid block), or undefined.
function floorNear(d, x, z, y) {
  const fx = Math.floor(x), fz = Math.floor(z), fy = Math.floor(y + 0.01);
  for (const ty of [fy, fy + 1, fy - 1]) {
    try {
      const below = d.getBlock({ x: fx, y: ty - 1, z: fz })?.typeId;
      const at = d.getBlock({ x: fx, y: ty, z: fz })?.typeId;
      const over = d.getBlock({ x: fx, y: ty + 1, z: fz })?.typeId;
      if (solidId(below) && !solidId(at) && !solidId(over)) return ty;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// A walk to the foot of the post (the site), over the floor; then turned to face the post. `then(true)` there, or
// `then(false)` where the way was blocked or a step down too far (the caller puts it there).
/** @param {Entity} e @param {Site} site @param {(ok: boolean) => void} then */
export function walkTo(e, site, then, H = SLOTH.hang) {
  const d = e.dimension;
  const at = e.location;
  const steps = walkSteps(at, site, H.walkPace);
  const yaw = yawOf(site.x - at.x, site.z - at.z);
  const pts = [];
  let y = at.y;
  for (const s of steps) {
    const f = floorNear(d, s.x, s.z, y);
    if (f === undefined) return then(false);
    y = f;
    pts.push({ x: s.x, y, z: s.z, yaw });
  }
  // A quarter second turning to face the post.
  for (let i = 1; i <= 5; i++) pts.push({ x: site.x, y, z: site.z, yaw: yaw + ((((site.yaw - yaw) % 360) + 540) % 360 - 180) * (i / 5) });
  glide(e, pts, SLOTH_ACT.walk, then);
}

// Put it at the foot of its post (a walk that couldn't get there), facing the post.
/** @param {Entity} e @param {Site} site */
export function putAtPost(e, site) {
  e.teleport({ x: site.x, y: site.floor, z: site.z }, { rotation: { x: 0, y: site.yaw }, keepVelocity: false });
}

// Hold a hanging one exactly in place (a push, a reload): back on its spot if it drifted.
/** @param {Entity} e @param {Site} site */
export function keepHanging(e, site) {
  const l = e.location;
  if (Math.hypot(l.x - site.x, l.z - site.z) > 0.25 || Math.abs(l.y - site.hangY) > 0.25) {
    e.teleport({ x: site.x, y: site.hangY, z: site.z }, { rotation: { x: 0, y: site.yaw }, keepVelocity: false });
  }
}

// Whether it is at its hanging spot.
/** @param {{ x: number, y: number, z: number }} l @param {Site} site */
export function atHang(l, site) {
  return Math.hypot(l.x - site.x, l.z - site.z) <= 0.8 && Math.abs(l.y - site.hangY) <= 0.6;
}

export const NOW = () => system.currentTick;
