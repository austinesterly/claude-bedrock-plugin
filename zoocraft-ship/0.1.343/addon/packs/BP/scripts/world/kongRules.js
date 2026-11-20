// 0.1.343: Augustus Kong, Protector of Gods (Austin's NPC #29 spec, section 13), the rules of his fight. Pure, so the
// tests can run them; world/augustusKong.js plays them in the great cave of Acufend (world/acufendCaveRules.js).
//
// An enormous gorilla, six blocks tall, guarding the Frequency Friends' statue on its dais. He stands guard in front of
// it, facing the way in; a player coming near it wakes him. He moves only on the flat floor round the statue, never
// onto it, and changes no block, so the statue (and the cave) are never harmed. Two moves, each with a warning you can
// see coming:
// - Jump Slam: he crouches low, a ring of dust marking where he will land (where the player was when he crouched); he
//   leaps in a high arc (over the statue if it is in the way) and lands with a slam that hurts everyone in the ring,
//   most at its middle, and throws them back.
// - Dripstone Spike Throw: he drives a fist into the floor, tears out a spike of dripstone, raises it over his shoulder
//   and hurls it at the player; it flies fast and nearly flat, and breaks on what it hits.
// At half his health he roars and beats his chest, and is quicker after: shorter warnings, a wider slam, three spikes
// thrown at once. A player out of his reach (high up, or off the flat floor) only gets spikes. Worn down to his last
// point of health he is beaten: he sinks down, and never fights again (the world remembers it). Nobody in the chamber
// for a while and the fight is over: he gets all his health back and goes back to his place.

export const KONG = "zoocraft:augustus_kong";
export const KONG_SPIKE = "zoocraft:kong_spike";
/** zoocraft:act, what his animation shows. */
export const KONG_ACT = { idle: 0, walk: 1, crouch: 2, leap: 3, slam: 4, rip: 5, aim: 6, throw: 7, roar: 8, sit: 9 };

const TAU = Math.PI * 2;
const hyp = (x, z) => Math.sqrt(x * x + z * z);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Minecraft's yaw (0 south, 90 west) of a way to face. */
export function yawTo(dx, dz) {
  return (Math.atan2(-dx, dz) * 180) / Math.PI;
}

/** Turning toward a yaw, at most `step` degrees. */
export function turnTo(yaw, want, step) {
  let d = (((want - yaw) % 360) + 540) % 360 - 180;
  if (Math.abs(d) <= step) return want;
  return yaw + Math.sign(d) * step;
}

/** A point `ahead` blocks in front of a place facing `yaw`, `side` to its right, `up` over it. */
export function aheadOf(at, yaw, ahead, up = 0, side = 0) {
  const r = (yaw * Math.PI) / 180;
  const fx = -Math.sin(r), fz = Math.cos(r); // the way it faces
  const rx = -fz, rz = fx; // its right hand
  return { x: at.x + fx * ahead + rx * side, y: at.y + up, z: at.z + fz * ahead + rz * side };
}

/** The middle of the statue, at the height of the floor round its dais (the lowest air there: where he stands). */
export function arenaMiddle(L) {
  return { x: L.statue.x + 0.5, y: L.chambers[0].floor, z: L.statue.z + 0.5 };
}

/** A place kept to the flat floor round the statue: no nearer it than keepOff, no further than ring. */
export function inRing(c, p, k) {
  const dx = p.x - c.x, dz = p.z - c.z;
  const d = hyp(dx, dz);
  if (d < 1e-6) return { x: c.x + k.keepOff, z: c.z };
  const r = clamp(d, k.keepOff, k.ring);
  return { x: c.x + (dx / d) * r, z: c.z + (dz / d) * r };
}

/** The least distance from c to the line from a to b (all level). */
export function segmentDistance(c, a, b) {
  const vx = b.x - a.x, vz = b.z - a.z;
  const L2 = vx * vx + vz * vz;
  const t = L2 < 1e-9 ? 0 : clamp(((c.x - a.x) * vx + (c.z - a.z) * vz) / L2, 0, 1);
  return hyp(a.x + vx * t - c.x, a.z + vz * t - c.z);
}

/** Where he stands guard: in front of the statue on the side the way in comes from, facing it. */
export function guardSpot(L, k) {
  const c = arenaMiddle(L);
  const w = wayIn(L);
  return { x: c.x + w.x * k.guard, y: c.y, z: c.z + w.z * k.guard, yaw: yawTo(w.x, w.z) };
}

/**
 * The way players come into the great chamber, from its middle (a unit x z): toward the side chamber the way in from
 * the surface comes down into (its passage runs straight in from there).
 */
export function wayIn(L) {
  const c = arenaMiddle(L);
  const open = L.tubes.find((t) => t.open);
  const end = open ? open.pts[open.pts.length - 1] : L.pad;
  let side = L.chambers[1] ?? { x: L.pad.x, z: L.pad.z };
  for (const ch of L.chambers.slice(1)) if (hyp(ch.x - end.x, ch.z - end.z) < hyp(side.x - end.x, side.z - end.z)) side = ch;
  const dx = side.x - c.x, dz = side.z - c.z;
  const d = hyp(dx, dz) || 1;
  return { x: dx / d, z: dz / d };
}

/** Where he sits once beaten: across the statue from his old place, facing it. */
export function restSpot(L, k) {
  const c = arenaMiddle(L);
  const w = wayIn(L);
  return { x: c.x - w.x * k.ring, y: c.y, z: c.z - w.z * k.ring, yaw: yawTo(w.x, w.z) };
}

/**
 * One step of his walk toward a goal: straight, or round the statue when the straight way passes too near it (he
 * walks round it on its circle), always kept to the ring.
 */
export function walkStep(c, pos, goal, speed, k) {
  const to = inRing(c, goal, k);
  const dx = to.x - pos.x, dz = to.z - pos.z;
  const d = hyp(dx, dz);
  if (d <= speed) return to;
  if (segmentDistance(c, pos, to) >= k.keepOff - 0.05) return inRing(c, { x: pos.x + (dx / d) * speed, z: pos.z + (dz / d) * speed }, k);
  const r = Math.max(k.keepOff, hyp(pos.x - c.x, pos.z - c.z));
  const a = Math.atan2(pos.z - c.z, pos.x - c.x);
  let da = Math.atan2(to.z - c.z, to.x - c.x) - a;
  da = ((da % TAU) + TAU + Math.PI) % TAU - Math.PI;
  const step = Math.sign(da) * Math.min(Math.abs(da), speed / r);
  // along the circle, and in toward the goal's distance as it goes
  const rr = r + clamp(hyp(to.x - c.x, to.z - c.z) - r, -speed * 0.5, speed * 0.5);
  return inRing(c, { x: c.x + Math.cos(a + step) * rr, z: c.z + Math.sin(a + step) * rr }, k);
}

/** His phase: 2 from half his health down (BALANCE.kong.phase2), else 1. */
export function phaseOf(hp, max, k) {
  return hp <= max * k.phase2 ? 2 : 1;
}

/** The slam's numbers for a phase. */
export function slamOf(k, phase) {
  const s = k.slam;
  return { warn: phase === 2 ? s.warn2 : s.warn, radius: phase === 2 ? s.radius2 : s.radius };
}

/**
 * A leap's plan: from where he is to where the target stood (kept to the ring), how many ticks in the air (longer for
 * further), how high (higher for further; over the statue's top when it is in the way).
 */
export function leapPlan(c, from, target, k) {
  const s = k.slam;
  const land = inRing(c, target, k);
  const dist = hyp(land.x - from.x, land.z - from.z);
  const air = Math.round(clamp(s.air[0] + dist * s.airPerBlock, s.air[0], s.air[1]));
  let h = clamp(s.height[0] + dist * s.heightPerBlock, s.height[0], s.height[1]);
  if (segmentDistance(c, from, land) < k.keepOff - 0.5) h = Math.max(h, s.over);
  return { from: { x: from.x, z: from.z }, land, air, h, dist };
}

/** Where he is t ticks into a leap: level along the line, up and down a parabola. y is over the floor. */
export function leapAt(plan, t) {
  const s = clamp(t / plan.air, 0, 1);
  return { x: plan.from.x + (plan.land.x - plan.from.x) * s, y: 4 * plan.h * s * (1 - s), z: plan.from.z + (plan.land.z - plan.from.z) * s };
}

/**
 * Who a landing hurts: everyone within the radius (level) and not far over or under the floor; most at the middle,
 * least at the edge, each thrown back away from it. players: [{ id, x, y, z }].
 */
export function slamHits(at, players, k, phase) {
  const s = k.slam;
  const R = slamOf(k, phase).radius;
  const out = [];
  for (const p of players) {
    const dx = p.x - at.x, dz = p.z - at.z;
    const d = hyp(dx, dz);
    const dy = p.y - at.y;
    if (d > R || dy < -s.under || dy > s.up) continue;
    const f = d / R;
    const damage = Math.round(s.damage[0] + (s.damage[1] - s.damage[0]) * f);
    const ux = d > 0.2 ? dx / d : 1, uz = d > 0.2 ? dz / d : 0;
    const h = s.knock.h * (1 - 0.4 * f);
    out.push({ id: p.id, damage, knock: { x: ux * h, z: uz * h, v: s.knock.v } });
  }
  return out;
}

/** Whether a slam can reach someone: the ring point nearest them is within the slam, and they are not up high. */
export function slamReaches(c, target, floorY, k, phase) {
  const land = inRing(c, target, k);
  return hyp(land.x - target.x, land.z - target.z) <= slamOf(k, phase).radius - 1 && target.y - floorY <= k.slam.up;
}

/**
 * His next move against a target: "slam" or "spike". Spikes only when a slam can't reach them, or they are too far to
 * leap to; a slam when they are too near to throw at; otherwise by chance (more spikes at phase 2), never the same
 * three times running. last: his moves, latest first.
 */
export function nextMove(c, pos, target, floorY, k, phase, u, last = []) {
  if (!slamReaches(c, target, floorY, k, phase)) return "spike";
  const d = hyp(target.x - pos.x, target.z - pos.z);
  if (d > k.slam.reach) return "spike";
  if (d < k.spike.min) return "slam";
  let m = u < (phase === 2 ? k.spike.chance2 : k.spike.chance) ? "spike" : "slam";
  if (last.length >= 2 && last[0] === m && last[1] === m) m = m === "slam" ? "spike" : "slam";
  return m;
}

/** Ticks of rest between moves. */
export function restFor(k, phase, u) {
  const [lo, hi] = phase === 2 ? k.rest2 : k.rest;
  return Math.round(lo + (hi - lo) * clamp(u, 0, 1));
}

/** Where he throws from: his raised right hand. */
export function handAt(pos, yaw, k) {
  const h = k.spike.hand;
  return aheadOf(pos, yaw, h.ahead, h.up, h.side);
}

/**
 * The spikes he throws at a target: one (three at phase 2, fanned out by `spread` degrees each side), each its start
 * speed, nearly flat (a little gravity), aimed at the target's chest.
 */
export function spikeThrows(from, target, k, phase) {
  const s = k.spike;
  const n = phase === 2 ? s.fan2 : 1;
  const out = [];
  const dx = target.x - from.x, dz = target.z - from.z;
  const d = Math.max(0.5, hyp(dx, dz));
  const ticks = Math.max(1, d / s.speed);
  const dy = target.y + 1.1 - from.y;
  const vy = (dy + 0.5 * s.gravity * ticks * ticks) / ticks;
  for (let i = 0; i < n; i++) {
    const a = (((i - (n - 1) / 2) * s.spread) * Math.PI) / 180;
    const ux = (dx / d) * Math.cos(a) - (dz / d) * Math.sin(a);
    const uz = (dx / d) * Math.sin(a) + (dz / d) * Math.cos(a);
    out.push({ x: ux * s.speed, y: vy, z: uz * s.speed });
  }
  return out;
}

/** A spike one tick on: where it gets to and its new speed. */
export function spikeStep(pos, v, k) {
  return { pos: { x: pos.x + v.x, y: pos.y + v.y, z: pos.z + v.z }, v: { x: v.x, y: v.y - k.spike.gravity, z: v.z } };
}

/** How far down it points (degrees, + down) flying at v: its model is tipped by it (zoocraft:pitch). */
export function spikePitch(v) {
  return Math.round(clamp((Math.atan2(-v.y, hyp(v.x, v.z)) * 180) / Math.PI, -80, 80));
}

/** The points along a spike's flight this tick, a quarter block apart (for what it hits). */
export function pathPoints(a, b, every = 0.25) {
  const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  const n = Math.max(1, Math.ceil(len / every));
  const out = [];
  for (let i = 1; i <= n; i++) out.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n, z: a.z + ((b.z - a.z) * i) / n });
  return out;
}

/** The first player its flight from a to b passes through (a body 0.6 round and 1.9 high, the spike's own width added), or undefined. */
export function spikeHit(a, b, players, k) {
  const r = 0.3 + k.spike.width;
  for (const q of pathPoints(a, b)) {
    for (const p of players) {
      if (q.y < p.y - k.spike.width || q.y > p.y + 1.9 + k.spike.width) continue;
      if (hyp(q.x - p.x, q.z - p.z) <= r) return { player: p, at: q };
    }
  }
  return undefined;
}

/**
 * A hit on him, cut so it never takes his last point of health: { damage, beaten }. beaten: this hit brings him to it.
 * /kill (selfDestruct) and the void go through.
 */
export function hurtCut(current, damage, cause) {
  if (cause === "selfDestruct" || cause === "void") return { damage, beaten: false };
  if (current <= 1) return { damage: 0, beaten: true };
  if (current - damage >= 1) return { damage, beaten: false };
  return { damage: Math.max(0, current - 1), beaten: true };
}

/** Whether a place is in the great chamber, for the fight: within its wall (a little in from it) and under its dome. */
export function inChamber(L, p, k) {
  const m = L.chambers[0];
  return hyp(p.x - (m.x + 0.5), p.z - (m.z + 0.5)) <= m.r * k.chamber && p.y >= m.floor - 3 && p.y <= m.floor + m.h;
}

/** The record of his defeat in the world's "acufendCave" collection, or undefined: { id: "kong", beaten, at, by }. */
export function beatenRecord(rec) {
  return rec && rec.id === "kong" && rec.beaten === true ? rec : undefined;
}
