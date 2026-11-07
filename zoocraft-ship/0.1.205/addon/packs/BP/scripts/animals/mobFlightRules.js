// Mobs flown by script (0.1.205, module 12; research/vanilla_plan.md "0.1.205 the phantom: the design"). The game's
// phantom circles 20 to 40 blocks over its target and swoops at it every 10 to 20 seconds (circle_around_anchor and
// swoop_attack, the 1.26.62.1 server's phantom.json; minecraft.wiki "Phantom"); under a roof those goals sit it at the
// roof (the 0.1.204 test server: the game's own phantom and copies with its goals alike), so the zoo's phantoms are flown
// a tick at a time (animals/mobFlight.js) by the Void Rays' glide maths (animals/glide.js): round and round a ring under
// the pen's roof, and every 10 to 20 seconds a swoop down over the floor and back up, as the game's swoop. A calmed one
// circles low over where it was calmed, and over a player holding its food, so it can be led and caged. Pure: the tests
// run these.
import { FLIGHT } from "./glide.js";

export const PHANTOM_FLIGHT = {
  ...FLIGHT,
  speed: 0.22, // blocks per tick round the ring (4.4 a second: the game's phantom glides fast)
  edgeSpeed: 0.08, // slower when the air ahead runs out, so it turns before a wall
  turn: 7, // degrees per tick it turns toward the ring ahead
  sharpTurn: 16, // degrees per tick when the air ahead runs out
  depthGain: 0.12, // how firmly it holds its height
  maxRise: 0.12, // blocks per tick up or down (a swoop's dive and climb)
  gravity: 0, // the entity has none
  lookAhead: 1.6, // blocks ahead checked for a wall
  lead: 40, // degrees ahead round the ring it steers for
  margin: 1.4, // blocks kept off the pen's walls
  minRadius: 1.6, // the smallest ring
  topGap: 1.6, // blocks under the roof it circles at (its feet: its back is 0.5 over them)
  floorGap: 1.3, // blocks over the floor at the bottom of a swoop
  swoopTicks: 50, // ticks a swoop dives before it climbs again (2.5 seconds)
  swoopEvery: [200, 400], // ticks from the end of one swoop to the next (10 to 20 seconds, the game's Bedrock phantom's)
  wildRadius: 2.5, // a calmed one's ring over where it was calmed
  wildHeight: 2, // blocks over the ground it circles at, within reach of a Mob Cage
  wildSpeed: 0.1, // blocks per tick round that ring: a calmed one glides lazily (2 a second), easy to watch and to cage
  groundBelow: 64, // blocks searched down for the ground under a calmed one (a wild one circles 20 to 40 up)
  seekDrop: 6, // blocks it comes down at a time looking for the ground when none is in reach
  baitRange: 10, // blocks: a player holding its food this close draws a calmed one
  baitRadius: 2.5, // its ring over that player (at its full speed, to keep up with them)
  baitHeight: 2.5, // blocks over the player's feet
  headroom: 0.7, // blocks between its feet and a roof over it, at the least (its back is 0.5 up)
};

// The kinds flown here, each with its flight; the zoo's ones (`pen`) fly in their pen's ring, the calmed ones low.
export const MOB_FLIGHT = { "zoocraft:calm_phantom": PHANTOM_FLIGHT, "zoocraft:zoo_phantom": PHANTOM_FLIGHT };
export const FLYING_MOBS = Object.keys(MOB_FLIGHT);
export const PEN_FLYERS = new Set(["zoocraft:zoo_phantom"]);

/** @typedef {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } }} Box */
/** @typedef {{ cx: number, cz: number, rx: number, rz: number, high: number, low: number }} Ring */

/**
 * The ring a mob flies round in its pen, from the box of the pen's air cells (the pen measure's, ex.mobPen.air): its
 * middle, its radii along x and z (the pen's half widths less the margin, at least minRadius), the height it circles at
 * (topGap under the roof's underside) and the height it swoops down to (floorGap over the floor). Undefined without a box.
 * @param {Box | undefined} box @param {typeof PHANTOM_FLIGHT} [F] @returns {Ring | undefined}
 */
export function ringOf(box, F = PHANTOM_FLIGHT) {
  if (!box) return undefined;
  const floor = box.min.y, top = box.max.y + 1;
  const high = Math.max(floor + F.floorGap, top - F.topGap);
  return {
    cx: (box.min.x + box.max.x + 1) / 2,
    cz: (box.min.z + box.max.z + 1) / 2,
    rx: Math.max(F.minRadius, (box.max.x + 1 - box.min.x) / 2 - F.margin),
    rz: Math.max(F.minRadius, (box.max.z + 1 - box.min.z) / 2 - F.margin),
    high,
    low: Math.min(high, floor + F.floorGap),
  };
}

/**
 * The air a pen's mobs fly in: the pen measure's box of its air (0.1.205 on), else a pen measured before it, from its
 * walking box (the floor's cells) and the profile's headroom.
 * @param {{ air?: Box } | undefined} pen @param {Box | undefined} walk @param {number} minHeight @returns {Box | undefined}
 */
export function penAir(pen, walk, minHeight) {
  if (pen?.air) return pen.air;
  if (!walk) return undefined;
  return { min: { ...walk.min }, max: { x: walk.max.x, y: walk.min.y + minHeight - 1, z: walk.max.z } };
}

// Each one of a pen flies a lane of its own, so two don't keep to one line: a wide ring, a narrower one a block lower
// round the other way, and one between.
export const LANES = [
  { r: 1, dy: 0, dir: 1 },
  { r: 0.72, dy: -1, dir: -1 },
  { r: 0.86, dy: -0.5, dir: 1 },
];
/** @param {string} id */
export function laneOf(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % LANES.length;
}
/** @param {Ring} ring @param {number} k @param {typeof PHANTOM_FLIGHT} [F] @returns {Ring} */
export function laneRing(ring, k, F = PHANTOM_FLIGHT) {
  const L = LANES[k] ?? LANES[0];
  const high = Math.max(ring.low, ring.high + L.dy);
  return { ...ring, rx: Math.max(F.minRadius, ring.rx * L.r), rz: Math.max(F.minRadius, ring.rz * L.r), high };
}

// A ring round a point at one height (a calmed one's: over where it was calmed, or over a player holding its food).
/** @param {{ x: number, z: number }} c @param {number} r @param {number} y @returns {Ring} */
export function ringAround(c, r, y) {
  return { cx: c.x, cz: c.z, rx: r, rz: r, high: y, low: y };
}

/**
 * How fast it may go round a ring: its speed, or slower where the ring bends tighter than its turn can follow (an
 * ellipse bends tightest at the ends of its long axis, a radius of short squared over long).
 * @param {Ring} ring @param {typeof PHANTOM_FLIGHT} [F]
 */
export function ringSpeed(ring, F = PHANTOM_FLIGHT) {
  const short = Math.min(ring.rx, ring.rz), long = Math.max(ring.rx, ring.rz);
  const bend = (short * short) / long;
  return Math.max(F.edgeSpeed, Math.min(F.speed, ((F.turn * Math.PI) / 180) * bend));
}

/**
 * Where to steer for: the point `lead` degrees on round the ring (the way `dir` says, 1 or -1) from where the mob is, at
 * height `y`. Steering for a point that keeps moving on ahead of it, the glide maths carry it round the ring.
 * @param {{ x: number, z: number }} pos @param {Ring} ring @param {number} dir @param {number} y @param {typeof PHANTOM_FLIGHT} [F]
 */
export function ringSpot(pos, ring, dir, y, F = PHANTOM_FLIGHT) {
  const a = Math.atan2((pos.z - ring.cz) / ring.rz, (pos.x - ring.cx) / ring.rx) + (dir * F.lead * Math.PI) / 180;
  return { x: ring.cx + ring.rx * Math.cos(a), y, z: ring.cz + ring.rz * Math.sin(a) };
}

/**
 * A tick of the swoops: `t.until` while one dives, `t.next` the tick the next may start. One starts when its time comes
 * in a pen (`pen`: a calmed one never swoops); when it ends the next is 10 to 20 seconds on (`r`, a random number in
 * [0, 1), picks where). Returns the swoops' state now.
 * @param {{ until?: number, next: number }} t @param {number} now @param {number} r @param {boolean} pen @param {typeof PHANTOM_FLIGHT} [F]
 */
export function swoopStep(t, now, r, pen, F = PHANTOM_FLIGHT) {
  if (t.until !== undefined && now < t.until) return t;
  if (t.until !== undefined) return { until: undefined, next: now + F.swoopEvery[0] + Math.floor(r * (F.swoopEvery[1] - F.swoopEvery[0] + 1)) };
  if (pen && now >= t.next) return { until: now + F.swoopTicks, next: t.next };
  return t;
}

/**
 * The height to circle at over `base` (the ground's top, or a player's feet) wanting `want` blocks up, under a roof:
 * `air` blocks of air from `base` up. At least 0.3 up; under a low roof, as high as its back fits.
 * @param {number} base @param {number} want @param {number} air @param {typeof PHANTOM_FLIGHT} [F]
 */
export function heightUnder(base, want, air, F = PHANTOM_FLIGHT) {
  return base + Math.max(0.3, Math.min(want, air - F.headroom));
}
