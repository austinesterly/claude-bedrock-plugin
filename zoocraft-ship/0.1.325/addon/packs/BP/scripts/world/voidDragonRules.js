// The Void Dragon's rules (0.1.318; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, section 5, and
// the dragon's arrival under friendship 80). Pure, so the tests can run them; world/voidDragon.js is the game side.
// The numbers the spec left open are the ones Austin approved on 17 Nov 2026 (data/balance.js voidDragon).

export const VOID_DRAGON = "zoocraft:void_dragon";
export const DRAGON_EYE = "zoocraft:void_dragon_eye";
export const DRAGON_BALL = "zoocraft:void_fireball";

/** Parts of its body from its middle, in blocks: x to its left, y up, z ahead. */
export const PARTS = {
  eyeL: { x: 1.4, y: 2.3, z: 9.4 },
  eyeR: { x: -1.4, y: 2.3, z: 9.4 },
  mouth: { x: 0, y: 1.2, z: 11 },
};

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
