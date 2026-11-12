// Carrie's guiding (0.1.260; Austin's NPC Expansion #16-20 spec, Carrie: "guiding NPCs to other NPCs' homes", "Uses the
// existing path network", "Walks ahead or alongside the NPC being guided", "Avoids interfering with either NPC's work
// schedule", "Returns to her normal routine after completing the trip", "Does not teleport NPCs unnecessarily", "Does
// not alter or damage buildings or pathways"). Who she walks where and when are ours (playtest/NPC_batch3_suggestions.md),
// as are the numbers (balance.js residents.guide). No engine calls here.

import { inShift } from "./workRules.js";

export const GUIDE_ID = "carrie";
// Carrie's own trip: to the neighbour's door ("toGuest"), knocking ("calling"), walking ahead of them ("guiding"),
// standing aside at the other door while they go in ("seeing"), and home ("fromGuide").
export const GUIDE_STATES = new Set(["toGuest", "calling", "guiding", "seeing", "fromGuide"]);
// The neighbour's: walking behind her ("guided"), at the other home ("onVisit"), and home again ("fromVisit").
export const GUIDED_STATES = new Set(["guided", "onVisit", "fromVisit"]);

/** Ticks from time of day `t` until time of day `x` next comes round (0 when it's now). */
export function ticksUntil(t, x) {
  return ((((x - t) % 24000) + 24000) % 24000);
}

/**
 * Whether someone's day has room for `need` ticks from now: not the night (their bedtime), not on a work shift, and
 * neither a shift nor their bedtime starting before then. o: { t (time of day), phase (residentRules.js dayPhase),
 * shift ({ from, to } or undefined: workRules.js shiftOf), bedTime }.
 */
export function roomFor(o, need) {
  if (o.phase === "night") return false;
  if (o.shift && (inShift(o.t, o.shift) || ticksUntil(o.t, o.shift.from) < need)) return false;
  if (o.bedTime !== undefined && ticksUntil(o.t, o.bedTime) < need) return false;
  return true;
}

/** Whether Carrie may set off on another trip now. o: { tripsToday, lastTick, tick }. */
export function guideReady(o, g) {
  if ((o.tripsToday ?? 0) >= g.perDay) return false;
  return o.lastTick === undefined || o.tick - o.lastTick >= g.restSeconds * 20;
}

/**
 * Who she takes where: a neighbour from `guests` (at home and free) to another's home from `hosts` (at home), not the
 * same one twice in a day, nor a pair tried already today. Undefined when there's nobody.
 */
export function pickTrip(guests, hosts, today, random = Math.random) {
  const done = today ?? { guests: [], pairs: [] };
  const free = guests.filter((id) => id !== GUIDE_ID && !done.guests.includes(id));
  const order = [...free];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  for (const guest of order) {
    const to = hosts.filter((id) => id !== guest && id !== GUIDE_ID && !done.pairs.includes(`${guest}>${id}`));
    if (to.length) return { guest, host: to[Math.floor(random() * to.length)] };
  }
  return undefined;
}

/** Blocks along a walk (feet positions). */
export function pathLength(points) {
  let n = 0;
  for (let i = 1; i < (points?.length ?? 0); i++) n += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z);
  return n;
}

/** Ticks a walk takes at `pace` blocks a tick. */
export function walkTicks(points, pace) {
  return Math.ceil(pathLength(points) / Math.max(0.01, pace));
}

/**
 * Where Carrie stops at the other home: the walk (its corners, ending at the door) cut `short` blocks along it before its
 * end, so the neighbour walks past her to the door. The cut can fall partway along a stretch: a point there is added.
 * Keeps at least the first point. Returns the points to walk.
 */
export function stopShort(points, short) {
  if (!points?.length) return [];
  let left = 0;
  for (let i = points.length - 1; i > 0; i--) {
    const a = points[i - 1];
    const b = points[i];
    const seg = Math.hypot(b.x - a.x, b.z - a.z);
    if (left + seg >= short) {
      const k = seg > 0 ? (short - left) / seg : 1; // the share of this stretch cut off, from its end
      if (k >= 0.99) return points.slice(0, i);
      return [...points.slice(0, i), { x: b.x + (a.x - b.x) * k, y: b.y + (a.y - b.y) * k, z: b.z + (a.z - b.z) * k }];
    }
    left += seg;
  }
  return points.slice(0, 1);
}

/**
 * A spot a step aside from the end of a walk, to stand clear of the way on: [left, right] of the last stretch's
 * direction, `step` blocks out (the walkers' lanes are to the right of the line, so the left comes first).
 */
export function asideSpots(points, step) {
  const n = points?.length ?? 0;
  if (n < 2) return [];
  const a = points[n - 2];
  const b = points[n - 1];
  const len = Math.hypot(b.x - a.x, b.z - a.z);
  if (len < 0.01) return [];
  const dx = (b.x - a.x) / len;
  const dz = (b.z - a.z) / len;
  // Walking along (dx, dz), the right is (-dz, dx) (spaceRules.js laneTarget) and the left (dz, -dx).
  const left = { x: b.x + dz * step, y: b.y, z: b.z - dx * step };
  const right = { x: b.x - dz * step, y: b.y, z: b.z + dx * step };
  return [left, right];
}

/** How far a spot is from a walk: the shortest distance (flat) to any of its stretches. */
export function clearance(points, p) {
  let best = Infinity;
  for (let i = 0; i < (points?.length ?? 0); i++) {
    const a = points[i];
    const b = points[i + 1] ?? a;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len2 = dx * dx + dz * dz;
    const k = len2 > 0 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / len2)) : 0;
    best = Math.min(best, Math.hypot(p.x - (a.x + dx * k), p.z - (a.z + dz * k)));
  }
  return best;
}

/**
 * The spots to step aside to that stay clear of the neighbour's whole walk (at least `min` blocks from every stretch
 * of it, the way they came included: a stop near a corner has one side on their way in), clearest first.
 */
export function clearAsides(spots, walk, min) {
  return spots.map((s) => ({ s, c: clearance(walk, s) })).filter((x) => x.c >= min).sort((a, b) => b.c - a.c).map((x) => x.s);
}

/** The index of the point on a walk nearest to `pos`, to walk on from there. */
export function nearestIndex(points, pos) {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < (points?.length ?? 0); i++) {
    const d = Math.hypot(points[i].x - pos.x, points[i].z - pos.z);
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

/**
 * Keeping together on the walk: whether the one walking holds still this tick. Carrie (`lead`) waits while her
 * neighbour is more than g.waitFrom blocks behind (and walks on once they're within g.waitTo); the neighbour waits while
 * they're within g.gap of her (and walks on once she's g.gap + g.slack ahead). `held`: whether they're holding now.
 */
export function holdStill(lead, dist, held, g) {
  if (lead) return held ? dist > g.waitTo : dist > g.waitFrom;
  return held ? dist < g.gap + g.slack : dist < g.gap;
}

/** Carrie's page line: "3 trips today (of 4); 12 neighbours shown the way so far". */
export function guideText(today, total, g) {
  const n = today ?? 0;
  const all = total ?? 0;
  return `${n} trip${n === 1 ? "" : "s"} today (of ${g.perDay}); ${all} neighbour${all === 1 ? "" : "s"} shown the way so far`;
}
