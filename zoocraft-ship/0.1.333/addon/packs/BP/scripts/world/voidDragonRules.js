// The Void Dragon's rules (0.1.318; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, section 5, and
// the dragon's arrival under friendship 80). Pure, so the tests can run them; world/voidDragon.js is the game side.
// The numbers the spec left open are the ones Austin approved on 17 Nov 2026 (data/balance.js voidDragon).

export const VOID_DRAGON = "zoocraft:void_dragon";
export const DRAGON_EYE = "zoocraft:void_dragon_eye";
export const DRAGON_BALL = "zoocraft:void_fireball";
export const DRAGON_PART = "zoocraft:void_dragon_part";
/** 0.1.333: the unseen body that carries its health bar below each player in the void (Austin: "always up"). */
export const DRAGON_BAR = "zoocraft:void_dragon_bar";

/**
 * 0.1.333: who carries the dragon's health bar. Those carrying it already come first, then the rest in their order; each
 * carries one unless they are within `cover` of a bar already carried (their own is `bar` blocks from them, `at`). So
 * every player has a bar in reach, and players together share one rather than see two.
 * players: [{ id, at, bar }]. Returns a Set of their ids.
 */
export function barCarriers(players, cover, carrying = new Set()) {
  const order = [...players.filter((p) => carrying.has(p.id)), ...players.filter((p) => !carrying.has(p.id))];
  const out = [];
  for (const p of order) if (!out.some((q) => Math.hypot(p.at.x - q.bar.x, p.at.y - q.bar.y, p.at.z - q.bar.z) <= cover)) out.push(p);
  return new Set(out.map((p) => p.id));
}

/** 0.1.333: where a player's bar goes: `below` blocks under them, never under the dimension's floor. */
export const barSpot = (at, below, floor) => ({ x: at.x, y: Math.max(floor, at.y - below), z: at.z });

/** Parts of its body from its middle, in blocks: x to its left, y up, z ahead. */
export const PARTS = {
  // 0.1.326: where the redrawn model carries its head as it flies (its neck arched up)
  eyeL: { x: 1.4, y: 4.1, z: 9.1 },
  eyeR: { x: -1.4, y: 4.1, z: 9.1 },
  mouth: { x: 0, y: 2.8, z: 12 },
};

/**
 * Where it can be hit besides its chest (0.1.327; Austin: "let's make the dragon hitbox more accurate"): unseen parts
 * that ride its head, neck, hips, tail and wings, each from the dragon's middle as PARTS is (x to its left, y the
 * part's foot, z ahead), with the box of `HIT_SIZES[size]` (width, height). Its head's box is narrow so that its eyes
 * stand out at either side. A blow on a part is the same blow on the dragon.
 */
export const HIT_SIZES = [[2.0, 1.0], [2.0, 3.2], [2.2, 2.0], [2.2, 2.4], [2.3, 1.6], [2.3, 2.8], [2.4, 3.2], [2.4, 3.6], [2.8, 3.6], [4.4, 5.0], [7.0, 1.2]];
export const HIT_PARTS = [
  { name: "skull", x: 0, y: 0.8, z: 8.5, size: 6 },
  { name: "snout", x: 0, y: 0.5, z: 10.9, size: 1 },
  { name: "neck1", x: 0, y: 1.1, z: 6.4, size: 7 },
  { name: "neck2", x: 0, y: 1.1, z: 4.0, size: 7 },
  { name: "hips", x: 0, y: 0.0, z: -3.8, size: 9 },
  { name: "tail1", x: 0, y: 0.7, z: -6.1, size: 8 },
  { name: "tail2", x: 0, y: 0.9, z: -8.4, size: 6 },
  { name: "tail3", x: 0, y: 1.0, z: -10.7, size: 5 },
  { name: "tail4", x: 0, y: 1.2, z: -12.9, size: 3 },
  { name: "tail5", x: 0, y: 1.3, z: -15.1, size: 2 },
  { name: "tail6", x: 0, y: 1.5, z: -17.4, size: 4 },
  { name: "tip", x: 0, y: 1.6, z: -19.5, size: 0 },
  { name: "wingL1", x: 5.4, y: 2.6, z: -1.9, size: 10, wing: true },
  { name: "wingL2", x: 12.3, y: 2.6, z: -1.9, size: 10, wing: true },
  { name: "wingR1", x: -5.4, y: 2.6, z: -1.9, size: 10, wing: true },
  { name: "wingR2", x: -12.3, y: 2.6, z: -1.9, size: 10, wing: true },
];

/**
 * Where hit part `part` is: with the dragon standing (`stand`) it is lifted as its body is, and its folded wings'
 * parts are drawn in to its back.
 */
export function hitPartPos(pos, yaw, part, stand) {
  if (stand && part.wing) return { x: pos.x, y: pos.y + STAND + 3, z: pos.z };
  return partPos(pos, yaw, { x: part.x, y: part.y + (stand ? STAND : 0), z: part.z });
}

/** How far its body is lifted when it stands on the ground (its legs under it), in blocks. */
export const STAND = 2;

/**
 * How it leans as it flies (0.1.326; Austin: "the movements are not very fluid, and it feels very stiff"): `bank`, the
 * roll into a turn of `turn` degrees this tick (to its left when it turns left: positive), and `pitch`, nose down
 * (positive) as it dives and up as it climbs, from its velocity `v`. Whole steps of 5 degrees, each within `k.max`.
 */
export const LEAN = { perTurn: 5, pitch: 0.8, max: 35, step: 5 };
export function leanOf(turn, v, k = LEAN) {
  const snap = (n) => Math.max(-k.max, Math.min(k.max, Math.round(n / k.step) * k.step)) + 0;
  const speed = Math.hypot(v.x, v.y, v.z);
  const dive = speed < 0.05 ? 0 : (-Math.asin(Math.max(-1, Math.min(1, v.y / speed))) * 180) / Math.PI;
  return { bank: snap(-turn * k.perTurn), pitch: snap(dive * k.pitch) };
}

/** The turn from yaw `from` to yaw `to`, in degrees, the short way round. */
export const turnBetween = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;

/** The way a yaw faces (the game's: 0 is south, +z; 90 is west, -x). */
export function ahead(yaw) {
  const r = (yaw * Math.PI) / 180;
  return { x: -Math.sin(r), z: Math.cos(r) };
}

/** The yaw that faces along (dx, dz). */
export const yawTo = (dx, dz) => (Math.atan2(-dx, dz) * 180) / Math.PI;

/** Where a part is in the world, for a body at `pos` facing `yaw`. */
export function partPos(pos, yaw, part) {
  const f = ahead(yaw);
  // its left is ahead turned a quarter turn: (f.z, -f.x)
  return { x: pos.x + f.x * part.z + f.z * part.x, y: pos.y + part.y, z: pos.z + f.z * part.z - f.x * part.x };
}

/** The phase by its health: 1 (down to 51%), 2 (50 to 26%), 3 (25 to 11%), 4 (10%: the transformation). */
export function phaseOf(hp, max, k) {
  const f = hp / max;
  if (f <= k.phases.transform) return 4;
  if (f <= k.phases.white) return 3;
  if (f <= k.phases.voidFire) return 2;
  return 1;
}

/** Its health after a blow: never under the health at which it transforms (it is not killed). */
export const floorHealth = (hp, max, k) => Math.max(hp, Math.ceil(max * k.phases.transform));

/** What a blow to an eye is worth. */
export const eyeDamage = (damage, k) => damage * k.eyeMultiplier;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Whether a player at `p` is close enough to its face to be bitten: within reach of its mouth, and not behind it. */
export function biteHits(pos, yaw, p, k) {
  const m = partPos(pos, yaw, PARTS.mouth);
  if (dist(m, p) > k.bite.reach) return false;
  const f = ahead(yaw);
  return (p.x - pos.x) * f.x + (p.z - pos.z) * f.z > PARTS.mouth.z - k.bite.reach;
}

/** Whether `p` is in a cone from `from` along `dir` (a unit vector): within `range`, and no wider than `cos` (the cosine of half its angle). */
export function inCone(from, dir, p, range, cos) {
  const dx = p.x - from.x, dy = p.y - from.y, dz = p.z - from.z;
  const d = Math.hypot(dx, dy, dz);
  if (d > range) return false;
  if (d < 1.5) return true;
  return (dx * dir.x + dy * dir.y + dz * dir.z) / d >= cos;
}

/** How far `p` is from the line from `a` to `b`. */
export function lineDistance(a, b, p) {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const l2 = ab.x * ab.x + ab.y * ab.y + ab.z * ab.z;
  const t = l2 < 1e-9 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y + (p.z - a.z) * ab.z) / l2));
  return dist(p, { x: a.x + ab.x * t, y: a.y + ab.y * t, z: a.z + ab.z * t });
}

/** A unit vector from `a` to `b` (straight ahead level, if they are the same spot). */
export function unit(a, b) {
  const d = dist(a, b);
  return d < 1e-6 ? { x: 0, y: 0, z: 1 } : { x: (b.x - a.x) / d, y: (b.y - a.y) / d, z: (b.z - a.z) / d };
}

/** Whether a player at `p` is on the island for the firestorm: over its ground, no higher than the fire reaches. Nowhere on the island is safe; the air above it is. */
export function inFirestorm(p, isle, k) {
  return Math.abs(p.x - isle.x) <= isle.rx + 1.5 && Math.abs(p.z - isle.z) <= isle.rz + 1.5 && p.y >= isle.y - 8 && p.y <= isle.y + 1 + k.firestorm.height;
}

/** Where it circles: point `i` of a ring round the island, rising and falling. */
export function circlePoint(i, isle, k) {
  const a = (i / k.fly.points) * Math.PI * 2;
  return { x: isle.x + Math.cos(a) * k.fly.radius, y: isle.y + k.fly.height + Math.sin(a * 2) * k.fly.swing, z: isle.z + Math.sin(a) * k.fly.radius };
}

/** Where it rests its wings for the firestorm: on the island, beside the portal. */
export const perchPoint = (isle) => ({ x: isle.x, y: isle.y + 1, z: isle.z + 6 });

/**
 * What it does next after circling: "storm" when the island firestorm is due; else by its phase and a throw of
 * `random`: "breath" (crimson fire, every phase), "beam" (phase 2: the purple fire beam), "ball" (phase 3: the black
 * fireball, which takes the beam's place).
 */
export function nextAttack(phase, sinceStorm, random, k) {
  if (sinceStorm >= k.firestorm.every) return "storm";
  const r = random();
  if (phase === 2 && r < k.beam.chance) return "beam";
  if (phase >= 3 && r < k.fireball.chance) return "ball";
  return "breath";
}

/** Its velocity next tick: turned toward `goal` by no more than `accel`, at `speed` (slowing within `brake` blocks of it). */
export function steer(pos, v, goal, speed, accel, brake = 6) {
  const d = dist(pos, goal);
  const s = d < 1e-6 ? 0 : (speed * Math.min(1, d / brake)) / d;
  const c = { x: (goal.x - pos.x) * s - v.x, y: (goal.y - pos.y) * s - v.y, z: (goal.z - pos.z) * s - v.z };
  const l = Math.hypot(c.x, c.y, c.z);
  const f = l > accel ? accel / l : 1;
  return { x: v.x + c.x * f, y: v.y + c.y * f, z: v.z + c.z * f };
}

/** A yaw turned from `from` toward `to` by at most `step` degrees. */
export function turnTo(from, to, step) {
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  const y = from + Math.max(-step, Math.min(step, d));
  return ((((y + 180) % 360) + 360) % 360) - 180; // kept within a turn
}

/**
 * The dragon's arrival in the Overworld (0.1.325; Austin: "he should be seen from a distance descending and sitting
 * down while looking at all the food, then when the meet is tossed in, the dragon follows it"). Its parts, each timed
 * in ticks from its own start: it comes down out of the sky in a wide turn round the bait ("descend", until it has
 * landed, or `land` ticks at most), sits facing the food ("sit"), Darian sends the beef through the portal ("push"),
 * it follows ("follow", until it is through, or `follow` ticks at most), and is gone ("done").
 */
export const ARRIVAL = { land: 700, sit: 120, push: 50, follow: 140, ring: 52, high: 50, out: 14, turns: [210, 160, 110, 60], last: { angle: 25, radius: 32, high: 14 } };
export function arrivalNext(part, t, o = {}, k = ARRIVAL) {
  if (part === "descend") return o.landed || t >= k.land ? "sit" : "descend";
  if (part === "sit") return t >= k.sit ? "push" : "sit";
  if (part === "push") return t >= k.push ? "follow" : "push";
  if (part === "follow") return o.through || t >= k.follow ? "done" : "follow";
  return "done";
}

/**
 * Where it may sit: `out` blocks from the bait `b`, first on the side away from the portal's middle `mid`, then to
 * either side of that. Each is { x, z, angle } (the angle from the bait, in degrees).
 */
export function landingSpots(b, mid, k = ARRIVAL) {
  const dx = b.x - mid.x, dz = b.z - mid.z;
  const base = Math.hypot(dx, dz) < 0.5 ? 0 : (Math.atan2(dz, dx) * 180) / Math.PI;
  return [0, 40, -40, 80, -80].map((turn) => {
    const angle = base + turn;
    const r = (angle * Math.PI) / 180;
    return { x: b.x + 0.5 + Math.cos(r) * k.out, z: b.z + 0.5 + Math.sin(r) * k.out, angle };
  });
}

/**
 * Its way down to `land` ({ x, y, z, angle }) round the bait `b`: where it starts, far off and high, and the points it
 * flies by in turn, the last its seat. `scale` draws the turn in (1: the whole of it).
 */
export function descentPath(b, land, scale = 1, k = ARRIVAL) {
  const at = (angle, radius, high) => {
    const r = ((land.angle + angle) * Math.PI) / 180;
    return { x: b.x + 0.5 + Math.cos(r) * radius, y: land.y + high, z: b.z + 0.5 + Math.sin(r) * radius };
  };
  const n = k.turns.length;
  const points = k.turns.map((a, i) => at(a, k.ring * scale, (k.last.high + ((k.high - k.last.high) * (n - 1 - i)) / n) * scale));
  points.push(at(k.last.angle, k.last.radius * scale, k.last.high * scale), { x: land.x, y: land.y, z: land.z });
  return { start: at(k.turns[0] + 45, (k.ring + 12) * scale, (k.high + 8) * scale), points };
}

/** Whether Darian may ask if the player is ready: the bait hangs, he has said to come back, the days have passed, and the dragon has not come. */
export function mayAsk(o, day, k) {
  return Boolean(o.waitStarted && o.beef && !o.lured && day - o.beef.day >= k.waitDays);
}
