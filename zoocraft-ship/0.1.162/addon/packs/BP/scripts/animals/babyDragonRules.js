// Baby Dragons (module 10, 0.1.162: the third boss; research/boss_plan.md "0.1.162 Baby Dragon"), pure: its fight's
// numbers, which move it makes, who a move hits and how hard they are thrown (and the void guard, so a push never
// throws anyone off an End island), the flight's steering (a velocity eased toward where it wants to be), its circling,
// what a calm one on its nest does next, the outer End's ground and its lair (an end stone clearing with an obsidian
// pillar topped by its nest). A zoo one's exhibit wants End ground underfoot as the End's animals do (species.endGround,
// the walking and flight measures' end stone count). The game side is animals/babyDragon.js (the wild
// one's fight and calm, run by animals/boss.js), animals/babyDragonMoves.js (its flight, a step a tick) and
// animals/dragon.js (a zoo one, flown as the Glade's Dragon is).
import { lairFrame, seeded, fights, awayFrom, offFacing } from "./bossRules.js";

export const WILD_DRAKE = "zoocraft:wild_baby_dragon";
export const ZOO_DRAKE = "zoocraft:baby_dragon";
export const VOID_BOLT = "zoocraft:void_bolt";
export const DRAKE_TYPES = [WILD_DRAKE, ZOO_DRAKE];

// What a baby dragon is doing (its zoocraft:act entity property): the client plays the matching animation (RP
// baby_dragon.animation_controllers.json, gen162/drake162.py) and the Field Journal watches for it. 0 to 7 are the
// Glade Dragon's (animals/dragonRules.js ACT), so a zoo one is flown by animals/dragon.js; 8 to 14 are the boss's.
export const DRAKE_ACT = { fly: 0, stand: 1, bask: 2, roar: 3, fire: 4, eat: 5, sleep: 6, hover: 7, dive: 8, bolt: 9, gust: 10, airRoar: 11, tired: 12, stunned: 13, stoop: 14 };

// Measured on the model (gen162/drake162.py checks these against it), in blocks: its box (the collision box the
// entity files give it, and what the flight checks for room), and where the bolt leaves its mouth at the spit (ahead of
// its feet and up, hovering).
export const DRAKE_BODY = { half: 1.0, height: 1.8, boltAhead: 1.87, boltUp: 1.86 };

// The Baby Dragon's fight (boss_plan.md). Ticks are game ticks (20 a second); speeds blocks a tick.
export const DRAKE = {
  energy: 300, // a baby: a little less than the yeti's and the sloth's 400
  tiredAt: 30,
  angryAt: 150,
  ring: 32,
  provoke: 7, // from the ground under it (it perches 9 blocks up)
  noHitTicks: 1200,
  recoverTicks: 1200,
  regenPerSecond: 4,
  roarTicks: 52, // the screech on its nest (the art's roar, 2.6 s)
  airRoarTicks: 44, // the roar in the air (2.2 s)
  every: 50,
  everyAngry: 30,
  firstMove: 30,
  leash: 40, // never farther than this from its nest (2D)
  // Circling its target in the fight: this far out and this high over them, at about 6 blocks a second.
  circle: { radius: [10, 14], height: [5, 9], speed: 0.3, accel: 0.035 },
  moves: {
    // The dive: hangs with its wings drawn back and screeches (0.9 s; it locks on to where they stand 0.2 s before the
    // end), then dives straight there: 7 and about 3 blocks of knock back to anyone within 2.5 of it on the way. It lands
    // where it hit and shakes its head (2 s), then climbs back.
    dive: { min: 6, max: 26, weight: 0.45, windTicks: 18, lockAt: 14, speed: 0.75, accel: 0.16, maxTicks: 60, reach: 2.5, damage: 7, knock: { h: 1.0, v: 0.4 }, stunTicks: 40, ground: 4 },
    // The void bolt: hovering, the head drawn back (1.0 s), then a bolt spat straight at their chest (no drop): 5 on a
    // hit (the projectile's) and a push. It fades after 4 seconds. From 6 out (the bench: climbing back out after a
    // dive it was mostly 6 to 8 off at its next move, so from 8 it hardly ever spat one).
    // Its clear line: every block its path touches, checked every 0.1 blocks with 0.06 to spare (the game hits a block
    // the bolt's path only grazes at an edge; its box plays no part: the bench's bolts flew past blocks within 0.3).
    bolt: { min: 6, max: 28, weight: 0.35, strikeAt: 20, ticks: 30, damage: 5, knock: { h: 0.7, v: 0.25 }, speed: 1.3, life: 80, line: { pad: 0.06, step: 0.1 } },
    // The wing gust (at someone within 20): down in front of them, 3 up and 5 out (up to 1.5 s getting there), the wings
    // drawn up (0.8 s) and beaten forward at 1.0 s: 3 and a strong push, to everyone within 8 in front of it.
    gust: { from: 20, weight: 0.2, crowdWeight: 0.6, reach: 8, arc: 80, approachTicks: 30, strikeAt: 20, ticks: 28, damage: 3, knock: { h: 1.6, v: 0.45 }, height: 3, standOff: 5, speed: 0.4 },
  },
  // Angry at half: hovering with its wings wide it roars (2.2 s); at 1 s everyone within 12 along the ground and 16 up or
  // down is slowed (Slowness II, 3 s) and pushed back. 16: kept over its nest it circles up to 13 over its clearing (the
  // bench, 0.1.162: 11.4 over the player, the roar reaching 10 missed them).
  angry: { ticks: 44, blastAt: 20, radius: 12, depth: 16, slowTicks: 60, slowLevel: 1, knock: { h: 1.2, v: 0.3 } },
  // A push that would throw someone off the island: no ground within `depth` under the spot `ahead` blocks along it.
  voidGuard: { ahead: 4, depth: 24, nudge: 0.2 },
  // Calm on its nest: asleep or awake by its own clock (the End has no night); awake, now and then a plume of violet
  // fire or a low growl; at the end of an awake spell now and then up to circle its lair, then back down onto its nest.
  perch: {
    sleepTicks: [1200, 3000],
    awakeTicks: [400, 1000],
    circleChance: 0.35,
    circleTicks: [320, 600],
    fireChance: 0.012, // a look (every 10 ticks) awake
    growlChance: 0.008,
    fireTicks: 68, // the art's fire (3.4 s)
    radius: [8, 12],
    height: [4, 8], // over its nest
    speed: 0.2,
    accel: 0.025,
  },
  // Tired out it glides down to the clearing at its pillar's foot (or the ground under it).
  tiredGlide: { speed: 0.22, accel: 0.03, giveUp: 240 },
  riseTicks: 24, // rested: up on its feet a moment before it flies home
  takeoff: { up: 4, speed: 0.2 },
  // Home to its nest: from under or beside it (lower than its top, within `clear`), out to `clear` from it and up first,
  // clear of its rim (the bench: rising from the rest spot straight in, it hovered under the rim); then `over` blocks
  // over the nest, then down.
  land: { over: 3, clear: 7, speed: 0.12, slow: 0.07 },
  // Lairs: one per outer End area.
  spacing: 800,
  // 32 to 48 blocks from the player, on the outer islands (more than 800 blocks out from the middle of the End), 20 air
  // over the clearing, level within 3.
  site: { min: 32, max: 48, parks: 160, level: 3, tries: 32, air: 20, outer: 800 },
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16,
  lairEvery: 100,
};

const hyp = (/** @type {number} */ a, /** @type {number} */ b) => Math.hypot(a, b);
const rad = (/** @type {number} */ d) => (d * Math.PI) / 180;

// --- The flight ----------------------------------------------------------------------------------------------------
// The next tick's velocity: the old one eased toward `speed` straight at the goal (slowing within `brake` blocks of
// it), changing by at most `accel` a tick. So it swings round in curves rather than turning on the spot.
/**
 * @param {{ x: number, y: number, z: number }} pos @param {{ x: number, y: number, z: number }} v
 * @param {{ x: number, y: number, z: number }} goal @param {number} speed @param {number} accel @param {number} [brake]
 */
export function steerVelocity(pos, v, goal, speed, accel, brake = 4) {
  const dx = goal.x - pos.x, dy = goal.y - pos.y, dz = goal.z - pos.z;
  const d = Math.hypot(dx, dy, dz);
  const s = d < 1e-6 ? 0 : (speed * Math.min(1, d / brake)) / d;
  const want = { x: dx * s, y: dy * s, z: dz * s };
  let cx = want.x - v.x, cy = want.y - v.y, cz = want.z - v.z;
  const c = Math.hypot(cx, cy, cz);
  if (c > accel) {
    cx *= accel / c;
    cy *= accel / c;
    cz *= accel / c;
  }
  return { x: v.x + cx, y: v.y + cy, z: v.z + cz };
}

// The steps to try for a move `v` with something in the way, in order: as it is, climbing over (up as fast as it was
// going), straight up, level, sliding level along one way (the larger first) and only up or down. Sliding: going
// slantwise past a corner (its pillar's, under its nest's rim) its box catches the corner while a move along one way is
// free (the bench, 0.1.162: wedged there, every slantwise step blocked, it hung still for seconds).
/** @param {{ x: number, y: number, z: number }} v */
export function moveOptions(v) {
  const h = Math.hypot(v.x, v.z);
  const up = Math.max(Math.abs(v.y), h * 0.7, 0.05);
  const alongX = { x: v.x, y: 0, z: 0 }, alongZ = { x: 0, y: 0, z: v.z };
  const rest = [{ x: v.x * 0.5, y: up, z: v.z * 0.5 }, { x: 0, y: up, z: 0 }, { x: v.x, y: 0, z: v.z }, ...(Math.abs(v.x) >= Math.abs(v.z) ? [alongX, alongZ] : [alongZ, alongX]), { x: 0, y: v.y, z: 0 }];
  return [v, ...rest.filter((o) => Math.hypot(o.x, o.y, o.z) >= 1e-4)];
}

// A point on a circle round `c` (radius `r`, `h` over it) at angle `a` (degrees), kept within the leash of `home`.
/**
 * @param {{ x: number, y: number, z: number }} c @param {number} a @param {number} r @param {number} h
 * @param {{ x: number, z: number }} [home] @param {number} [leash]
 */
export function circlePoint(c, a, r, h, home, leash = DRAKE.leash) {
  let x = c.x + Math.cos(rad(a)) * r;
  let z = c.z + Math.sin(rad(a)) * r;
  if (home) {
    const d = hyp(x - home.x, z - home.z);
    if (d > leash) {
      x = home.x + ((x - home.x) * leash) / d;
      z = home.z + ((z - home.z) * leash) / d;
    }
  }
  return { x, y: c.y + h, z };
}

// A goal kept off its lair's pillar and nest: within `reach` of the nest's middle (along each way: the nest's edge, its
// own half and a block) and lower than `over` above it, lifted to `over` above it; and so is a goal whose straight way
// from `from` (where it is) passes through there low. Circling someone standing near its pillar, it then flies over its
// nest, not under its rim (the bench, 0.1.162: wedged under the rim by the pillar, it hovered there and spat its bolts
// into its own nest; and with only the goal lifted, going for a goal on the far side it went in under the rim again
// and again, a detour out each time, for 8 seconds).
/**
 * @param {{ x: number, y: number, z: number }} p @param {{ x: number, y: number, z: number } | undefined} nest
 * @param {{ x: number, y: number, z: number }} [from] @param {number} [reach] @param {number} [over]
 */
export function clearOfNest(p, nest, from = undefined, reach = DRAKE_LAIR.nest.half + 0.5 + DRAKE_BODY.half + 1, over = DRAKE.land.over) {
  if (!nest || p.y >= nest.y + over) return p;
  const low = (/** @type {{ x: number, y: number, z: number }} */ q) => Math.abs(q.x - nest.x) <= reach && Math.abs(q.z - nest.z) <= reach && q.y < nest.y + over;
  let hit = low(p);
  if (!hit && from) {
    const n = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.y - from.y, p.z - from.z) / 0.5));
    for (let i = 0; i < n && !hit; i++) hit = low({ x: from.x + ((p.x - from.x) * i) / n, y: from.y + ((p.y - from.y) * i) / n, z: from.z + ((p.z - from.z) * i) / n });
  }
  return hit ? { x: p.x, y: nest.y + over, z: p.z } : p;
}

// The angle (degrees) of `p` round `c`, as circlePoint takes it.
/** @param {{ x: number, z: number }} c @param {{ x: number, z: number }} p */
export function angleAround(c, p) {
  return (Math.atan2(p.z - c.z, p.x - c.x) * 180) / Math.PI;
}

// Degrees a tick round a circle of radius r at `speed` blocks a tick.
/** @param {number} speed @param {number} r */
export function degreesPerTick(speed, r) {
  return ((speed / Math.max(1, r)) * 180) / Math.PI;
}

// --- The fight -----------------------------------------------------------------------------------------------------
// Which move it makes at a target `dist` blocks off (along the ground) as it circles: the dive or the bolt, whichever
// reaches, or the wing gust (it swoops down in front of them first: within `gust.from`), by their weights; the gust
// more likely with two or more fighting within 6 of the target (`near`). Undefined when none reaches (it closes in).
/** @param {number} dist @param {number} near @param {() => number} [rand] */
export function pickDrakeMove(dist, near, rand = Math.random, D = DRAKE) {
  const M = D.moves;
  /** @type {[string, number][]} */
  const can = [];
  if (dist >= M.dive.min && dist <= M.dive.max) can.push(["dive", M.dive.weight]);
  if (dist >= M.bolt.min && dist <= M.bolt.max) can.push(["bolt", M.bolt.weight]);
  if (dist <= M.gust.from) can.push(["gust", near >= 2 ? M.gust.crowdWeight : M.gust.weight]);
  if (!can.length) return undefined;
  let r = rand() * can.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of can) {
    if (r < w) return what;
    r -= w;
  }
  return can[can.length - 1][0];
}

/** @typedef {{ id: string, x: number, y: number, z: number, mode: string, sneaking?: boolean }} Who */

// Who the dive hits this tick: fighting players within its reach of its middle (`at` its feet; its middle 0.9 up) not
// hit already this dive; each { id, x, z, h, v }, the push away from it along the ground.
/** @param {{ x: number, y: number, z: number }} at @param {number} yaw @param {Who[]} players @param {Set<string>} done */
export function diveHits(at, yaw, players, done, D = DRAKE) {
  const M = D.moves.dive;
  const out = [];
  for (const p of players) {
    if (!fights(p.mode) || done.has(p.id)) continue;
    const d = Math.hypot(p.x - at.x, p.y + 0.9 - (at.y + 0.9), p.z - at.z);
    if (d > M.reach) continue;
    const away = awayFrom(at, p, yaw);
    out.push({ id: p.id, x: away.x * M.knock.h, z: away.z * M.knock.h, h: M.knock.h, v: M.knock.v });
  }
  return out;
}

// Who the gust hits: fighting players within its reach in front of it (its arc either side of where it faces), below it
// or a little over. Who the angry roar hits: everyone within its radius.
/** @param {"gust" | "angry"} move @param {{ x: number, y: number, z: number }} at @param {number} yaw @param {Who[]} players */
export function drakeHits(move, at, yaw, players, D = DRAKE) {
  const out = [];
  for (const p of players) {
    if (!fights(p.mode)) continue;
    const d = hyp(p.x - at.x, p.z - at.z);
    const dy = p.y - at.y;
    let hit, knock;
    if (move === "gust") {
      hit = d <= D.moves.gust.reach && dy > -7 && dy < 3 && (d < 1.5 || offFacing(at, yaw, p) <= D.moves.gust.arc);
      knock = D.moves.gust.knock;
    } else {
      hit = d <= D.angry.radius && Math.abs(dy) <= D.angry.depth;
      knock = D.angry.knock;
    }
    if (!hit) continue;
    const away = awayFrom(at, p, yaw);
    out.push({ id: p.id, x: away.x * knock.h, z: away.z * knock.h, h: knock.h, v: knock.v });
  }
  return out;
}

// The void guard: a push `h` along the unit way `dir` for someone at `p` is cut to a nudge when there is no ground under
// the spot `ahead` blocks along it (`groundUnder(x, y, z)`: whether there is solid ground within `depth` blocks under
// there) or under where they stand. Returns the push to give (h).
/**
 * @param {(x: number, y: number, z: number) => boolean} groundUnder @param {{ x: number, y: number, z: number }} p
 * @param {{ x: number, z: number }} dir @param {number} h
 */
export function guardedPush(groundUnder, p, dir, h, G = DRAKE.voidGuard) {
  if (h <= G.nudge) return h;
  const to = { x: p.x + dir.x * G.ahead, y: p.y + 0.5, z: p.z + dir.z * G.ahead };
  const mid = { x: p.x + dir.x * G.ahead * 0.5, y: p.y + 0.5, z: p.z + dir.z * G.ahead * 0.5 };
  if (groundUnder(to.x, to.y, to.z) && groundUnder(mid.x, mid.y, mid.z)) return h;
  return G.nudge;
}

// Whether a straight path from `a` to `b` touches a block, `shapeAt(x, y, z)` saying what is in each: undefined (clear),
// true (a whole block) or the box of a thin one in it (rodBox). Points every `step` along it, each with `pad` to spare
// all round; with `pad` at least half of `step` no block the path passes through is skipped, however short its stretch
// in it. Checked a quarter block apart, a bare line slipped past a block whose edge it grazed, and the game counts a
// graze as a hit (the bench, 0.1.162: one bolt of eleven spat past its nest's rim hit the rim at its corner's edge);
// an end rod is only its rod (a bolt flew past one inside its block and hit the player).
/** @param {{ x: number, y: number, z: number }} a @param {{ x: number, y: number, z: number }} b @param {(x: number, y: number, z: number) => (boolean | number[] | undefined)} shapeAt */
export function pathBlocked(a, b, shapeAt, pad = 0, step = 0.25) {
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) / step));
  /** @type {Map<string, boolean | number[] | undefined>} */
  const seen = new Map();
  for (let i = 0; i <= n; i++) {
    const px = a.x + ((b.x - a.x) * i) / n, py = a.y + ((b.y - a.y) * i) / n, pz = a.z + ((b.z - a.z) * i) / n;
    for (let x = Math.floor(px - pad); x <= Math.floor(px + pad); x++)
      for (let y = Math.floor(py - pad); y <= Math.floor(py + pad); y++)
        for (let z = Math.floor(pz - pad); z <= Math.floor(pz + pad); z++) {
          const k = `${x},${y},${z}`;
          let s = seen.get(k);
          if (s === undefined && !seen.has(k)) seen.set(k, (s = shapeAt(x, y, z)));
          if (!s) continue;
          if (s === true) return true;
          if (px + pad > x + s[0] && px - pad < x + s[3] && py + pad > y + s[1] && py - pad < y + s[4] && pz + pad > z + s[2] && pz - pad < z + s[5]) return true;
        }
  }
  return false;
}

// An end rod's rod in its block ([x0, y0, z0, x1, y1, z1]): 0.25 thick, along its facing_direction (0 and 1 down and
// up, 2 and 3 north and south, 4 and 5 west and east).
/** @param {number} facing */
export function rodBox(facing) {
  const lo = 0.375, hi = 0.625;
  if (facing <= 1) return [lo, 0, lo, hi, 1, hi];
  if (facing <= 3) return [lo, lo, 0, hi, hi, 1];
  return [0, lo, lo, 1, hi, hi];
}

// The bolt's velocity: straight from `from` to `to` (the target's chest) at `speed` (no drop: the bolt has no gravity).
/** @param {{ x: number, y: number, z: number }} from @param {{ x: number, y: number, z: number }} to */
export function boltVelocity(from, to, speed = DRAKE.moves.bolt.speed) {
  const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
  const d = Math.max(0.01, Math.hypot(dx, dy, dz));
  return { x: (dx / d) * speed, y: (dy / d) * speed, z: (dz / d) * speed };
}

// Where it hovers for the gust: `standOff` out from the target on its own side (straight out along `fallback`, the way
// it faces, when it is right over them), `height` over them.
/**
 * @param {{ x: number, y: number, z: number }} target @param {{ x: number, y: number, z: number }} at
 * @param {{ x: number, z: number }} fallback
 */
export function gustSpot(target, at, fallback, D = DRAKE) {
  const G = D.moves.gust;
  const dx = at.x - target.x, dz = at.z - target.z;
  const d = hyp(dx, dz);
  const u = d < 0.5 ? { x: -fallback.x, z: -fallback.z } : { x: dx / d, z: dz / d };
  return { x: target.x + u.x * G.standOff, y: target.y + G.height, z: target.z + u.z * G.standOff };
}

// What a calm one on its nest does next: asleep, then awake a while; awake, asleep again or (now and then) up to circle
// its lair; circling, home. Returns { next, ticks }.
/** @param {"sleep" | "awake" | "circle"} now @param {() => number} [rand] */
export function nextPerch(now, rand = Math.random, P = DRAKE.perch) {
  const span = (/** @type {number[]} */ r) => Math.round(r[0] + rand() * (r[1] - r[0]));
  if (now === "sleep") return { next: "awake", ticks: span(P.awakeTicks) };
  if (now === "awake") return rand() < P.circleChance ? { next: "circle", ticks: span(P.circleTicks) } : { next: "sleep", ticks: span(P.sleepTicks) };
  return { next: "home", ticks: 0 };
}

// --- The outer End's ground ------------------------------------------------------------------------------------------
// Out on the outer islands: more than `outer` blocks from the middle of the End.
/** @param {{ x: number, z: number }} p */
export function outerEnd(p, outer = DRAKE.site.outer) {
  return hyp(p.x, p.z) > outer;
}

// What stands on the End's ground (cleared for a lair) and the ground itself; anything else (purpur and the rest of an
// End city, obsidian, a gateway's bedrock) is no place for a lair.
const OVER_END = /^minecraft:(air|chorus_plant|chorus_flower|end_rod|void_air|cave_air)$|^zoocraft:/;
const END_GROUND = /^minecraft:end_stone$/;
/** @param {string | undefined} id */
export function isEndGround(id) {
  return Boolean(id) && END_GROUND.test(String(id));
}

// The ground's height at a column: from `top` (the topmost block) down through chorus plants and the like to the first
// end stone. "bad" where something else is met first (purpur, obsidian); undefined unread or none within `depth`.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {number} x @param {number} z @param {number} top */
export function endGroundY(idAt, x, z, top, depth = 40) {
  for (let y = top; y > top - depth; y--) {
    const id = idAt(x, y, z);
    if (id === undefined) return undefined;
    if (END_GROUND.test(id)) return y;
    if (!OVER_END.test(id)) return "bad";
  }
  return undefined;
}

// A hall's End ground (0.1.162): how many of the floor's land cells (`cells`: "x,y,z" -> kind, standing on y - 1) stand
// on end stone, Chorus Turf or Rift Turf (`idAt` the block ids). A big empty exhibit with enough of it is measured for
// flight as a Baby Dragon's hall (it needs no campfire, as the Glade's Dragons do, nor gold, as the Griffins do).
const END_FLOOR = /^minecraft:end_stone$|^zoocraft:chorus_turf$|^zoocraft:rift_turf$/;
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {Map<string, string>} cells */
export function* countEndFloor(idAt, cells, cellsPerYield = 64) {
  let n = 0;
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    if (END_FLOOR.test(idAt(x, y - 1, z) ?? "")) n++;
  }
  return n;
}

// Whether a site is good for a lair: the ground over the clearing (every 2 blocks out to its radius) within `level` of
// the middle's, all end stone, all read. `groundAt(x, z)`: endGroundY at that column. Returns the middle's height.
/** @param {(x: number, z: number) => (number | "bad" | undefined)} groundAt @param {{ x: number, z: number }} c */
export function drakeSiteLevel(groundAt, c, radius = DRAKE_LAIR.radius, level = DRAKE.site.level) {
  const y0 = groundAt(c.x, c.z);
  if (typeof y0 !== "number") return undefined;
  for (let dx = -radius; dx <= radius; dx += 2) {
    for (let dz = -radius; dz <= radius; dz += 2) {
      if (hyp(dx, dz) > radius) continue;
      const y = groundAt(c.x + dx, c.z + dz);
      if (typeof y !== "number" || Math.abs(y - y0) > level) return undefined;
    }
  }
  return y0;
}

// --- Its lair --------------------------------------------------------------------------------------------------------
// A round clearing (radius 8) of end stone with patches of end stone bricks; in its middle an obsidian pillar 3 by 3 and
// 8 high (the floor block is y 0, the pillar y 1 to 8) flecked with crying obsidian, topped at y 9 by the nest: a 7 by 7
// platform with its corners cut, an obsidian rim round end stone bricks with purpur in the middle, a few low end stone
// brick walls on its edge and end rods at four of its corners; three short obsidian spikes round the clearing's rim.
export const DRAKE_LAIR = { radius: 8, clearUp: 20, fillDown: 4, pillar: { half: 1, height: 8 }, nest: { half: 3 }, rest: { v: -5 } };

// The lair's nest spot (where it perches: its feet on the nest, facing the way the player came from) and its rest spot
// (on the clearing's floor in front of the pillar, where it lies down tired out), in the world.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function drakeLairSite(c, facing) {
  const at = lairFrame(c, facing);
  const L = DRAKE_LAIR;
  const o = at(0, 0, 0);
  const toward = at(0, -1, 0); // a block toward the front (where the player came from)
  const yaw = Math.round((Math.atan2(-(toward.x - o.x), toward.z - o.z) * 180) / Math.PI) + 0;
  const r = at(0, L.rest.v, 1);
  return {
    nest: { x: o.x + 0.5, y: c.y + L.pillar.height + 2, z: o.z + 0.5, yaw },
    rest: { x: r.x + 0.5, y: c.y + 1, z: r.z + 0.5, yaw },
  };
}

// Every block the lair sets, in order ({ x, y, z, id, states? }); the clearing's columns are cleared first
// (drakeLairColumns) and their dips filled with end stone. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function drakeLairBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  const L = DRAKE_LAIR;
  const R = L.radius;
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  // The floor: end stone with patches of end stone bricks (not under the pillar).
  const patches = Array.from({ length: 5 }, () => ({ u: Math.round((rand() - 0.5) * 12), v: Math.round((rand() - 0.5) * 12), r: 0.8 + rand() * 1.4 }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const brick = patches.some((p) => hyp(u - p.u, v - p.v) <= p.r) && (Math.abs(u) > 1 || Math.abs(v) > 1);
      put(u, v, 0, brick ? "minecraft:end_bricks" : "minecraft:end_stone");
    }
  }
  // The pillar: obsidian, 3 by 3, flecked with crying obsidian.
  const P = L.pillar;
  for (let y = 1; y <= P.height; y++) {
    for (let u = -P.half; u <= P.half; u++) {
      for (let v = -P.half; v <= P.half; v++) put(u, v, y, rand() < 0.14 ? "minecraft:crying_obsidian" : "minecraft:obsidian");
    }
  }
  // The nest: a 7 by 7 platform with its corners cut, an obsidian rim round end stone bricks, purpur in the middle.
  const N = L.nest.half;
  const top = P.height + 1;
  for (let u = -N; u <= N; u++) {
    for (let v = -N; v <= N; v++) {
      if (Math.abs(u) === N && Math.abs(v) === N) continue;
      const rim = Math.abs(u) === N || Math.abs(v) === N;
      const mid = Math.abs(u) + Math.abs(v) <= 1;
      put(u, v, top, rim ? "minecraft:obsidian" : mid ? "minecraft:purpur_block" : "minecraft:end_bricks");
    }
  }
  // Low walls on its edge (a pinwheel, so the dragon's tail and wings have gaps), and an end rod at four corners.
  for (const [u, v] of [[N, -1], [-N, 1], [1, N], [-1, -N], [N, 0], [-N, 0]]) put(u, v, top + 1, "minecraft:end_stone_brick_wall");
  for (const [u, v] of [[N, N - 1], [-N, -(N - 1)], [N - 1, -N], [-(N - 1), N]]) put(u, v, top + 1, "minecraft:end_rod", { facing_direction: 1 });
  // Three short obsidian spikes round the clearing's rim, the tallest tipped with crying obsidian: at its back and its
  // back corners, never in front where it lies down tired out (the bench: one a block behind its rest spot was in its
  // box, so its glide down never got there, and put there the game pushed it half a block off).
  for (let i = 0; i < 3; i++) {
    const a = rad([60, 300, 0][i] + (rand() - 0.5) * 30);
    const d = R - 1.5;
    const u = Math.round(Math.sin(a) * d), v = Math.round(Math.cos(a) * d);
    const h = 2 + i;
    for (let y = 1; y <= h; y++) put(u, v, y, y === h && i === 2 ? "minecraft:crying_obsidian" : "minecraft:obsidian");
  }
  return out;
}

// The columns of the clearing (the world's x, z).
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function drakeLairColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = DRAKE_LAIR.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// The Field Journal's line on wild ones.
export function drakeWildLine(D = DRAKE) {
  return `In the wild one lives alone in its lair on the outer End islands (an end stone clearing with an obsidian pillar, its nest on top), one to an area: a lair is made when a park member walks on the outer islands (more than ${D.site.outer} blocks from the middle of the End) with none within ${D.spacing} blocks. It perches on its nest, asleep or looking about, and now and then flies round its lair. Calm till someone hits it (an arrow counts) or walks up under it in Survival without sneaking: then it screeches, takes off and fights in the air, its boss bar showing. It circles you and dives at where you stand, spits violet bolts from afar, and swoops down to beat its wings at you, each with a wind-up you can see: dodge. After a dive it lands for a moment: hit it then. At half its energy it roars, slowing you. It is never killed: worn down to a tenth it glides down and lies panting, and then its Dragon Crate works (with a Meat Ration in your inventory). Left alone a minute it gets up rested and flies back to its nest`;
}
