// Bosses (module 10, 0.1.159: the framework with the Giant Yeti; research/boss_plan.md), pure: the energy floor (a boss
// is never killed: its energy is its health, and a hit that would take it under the tired floor is cut to stop there),
// what provokes it, which move it makes, who a move hits and how hard they are thrown, when a fight is over, when a
// tired one gets up, and its lair: where one may be made (one per taiga area, well away from any park), the ground's
// height under the trees, and the blocks of the clearing and the den. The game side is animals/boss.js; the zoo yeti's
// day is animals/yeti.js.

// The bosses, found by type (0.1.70: never by family alone).
export const WILD_YETI = "zoocraft:wild_giant_yeti";
export const ZOO_YETI = "zoocraft:giant_yeti";
export const SNOWBALL = "zoocraft:yeti_snowball";
export const BOSS_TYPES = [WILD_YETI];
export const YETI_TYPES = [WILD_YETI, ZOO_YETI];
export const BOSSES = "bosses"; // the world record: a lair a record (lairRecord)
export const LAIR_PROP = "zoocraft:lair"; // the wild yeti's lair id (a dynamic property)

// What a yeti is doing (its zoocraft:act entity property): the client plays the matching animation (RP
// giant_yeti.animation_controllers.json) and the Field Journal watches for it.
export const YETI_ACT = { none: 0, swipe: 1, slam: 2, hurl: 3, roar: 4, eat: 5, tired: 6, sit: 7, sleep: 8, toss: 9 };
// Sitting, sleeping and tired: the client's get-up takes 1.2 seconds.
export const SEATED_ACTS = [YETI_ACT.tired, YETI_ACT.sit, YETI_ACT.sleep];

// The Giant Yeti's fight (boss_plan.md "0.1.159 Giant Yeti: the design"). Ticks are game ticks (20 a second).
export const YETI = {
  energy: 400, // its health: the boss bar
  tiredAt: 40, // 10%: it slumps down tired out, and can't be hurt
  angryAt: 200, // half: the chest beat and the frost roar, then faster
  ring: 32, // a fight goes on while a Survival player is this near its home
  provoke: 5, // a Survival or Adventure player this near, not sneaking, starts a fight
  noHitTicks: 1200, // a minute without a player's hit ends a fight
  recoverTicks: 1200, // tired, with nobody within the ring for a minute: it gets up rested
  regenPerSecond: 4, // energy back while calm
  roarTicks: 40, // the opening roar: chest beats and a roar (2 s; the art's roar, its roar at 0.8 s)
  // A move every 2.5 seconds (1.5 angry) while it fights, the first a second after the opening roar.
  every: 50,
  everyAngry: 30,
  firstMove: 20,
  gapTicks: 4, // act 0 this long between moves, so the client sees the act change (the controller's one-shots)
  moves: {
    // Near, in front (its arm sweeps 3.2 blocks out from its middle): an arm drawn back (0.8 s), then a backhand: 7, about
    // 3 blocks of knock back.
    swipe: { reach: 4.5, arc: 70, strikeAt: 16, ticks: 30, damage: 7, knock: { h: 1.0, v: 0.35 } },
    // Near, all round: both fists up over its head (1.2 s), down into the snow: 6 and thrown up and back.
    slam: { reach: 6.5, high: 2, strikeAt: 24, ticks: 40, damage: 6, knock: { h: 1.3, v: 0.6 } },
    // Far: snow scooped up into a big ball over its head (1.1 s) and thrown: 5 on a hit (the projectile's) and a push.
    hurl: { min: 7, max: 22, strikeAt: 22, ticks: 30, damage: 5, knock: { h: 0.9, v: 0.3 }, speed: 1.1, gravity: 0.05 },
  },
  // Angry at half energy: the chest beat and the frost roar (2 s); at 1 s everyone within 12 is slowed and pushed back.
  angry: { ticks: 44, blastAt: 20, radius: 12, slowTicks: 60, slowLevel: 1, knock: { h: 1.2, v: 0.3 } },
  // The snowball leaves its hands over its head at the throw (the art's ball: 5 blocks up, a little in front).
  throwFrom: { ahead: 0.9, up: 4.3 },
  // Calm: a roar now and then (a sound and its rear-up), at night to its den to sleep.
  calmRoarChance: 0.004, // a look (every 10 ticks)
  calmRoarTicks: 44,
  denArrive: 2.5, // blocks from the den's bed: it sits down to sleep
  denGiveUp: 600, // ticks: not there by then, it sleeps where it is
  // Lairs: one per taiga area.
  spacing: 800, // no new lair this near any other in the dimension, caught or not
  // 32 to 48 blocks from the player: the clearing (8 more) stays inside the 4 chunks the game keeps ticking round them,
  // so every block of it can be read and set.
  site: { min: 32, max: 48, parks: 160, level: 3, tries: 24 },
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16, // walking this near a lair finds it (Places)
  lairEvery: 100, // ticks between looks for a player in a taiga
};

/** @param {number} a @param {number} b */
const hyp = (a, b) => Math.hypot(a, b);

// The game's yaw facing (dx, dz): 0 south (+z), 90 west, 180 north, -90 east (animals/climbRules.js yawTo).
/** @param {number} dx @param {number} dz */
export function yawOf(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0;
}

// A point `ahead` blocks in front along yaw and `up` blocks up from pos.
/** @param {{ x: number, y: number, z: number }} pos @param {number} yaw @param {number} ahead @param {number} up */
export function aheadOf(pos, yaw, ahead, up) {
  const r = (yaw * Math.PI) / 180;
  return { x: pos.x - Math.sin(r) * ahead, y: pos.y + up, z: pos.z + Math.cos(r) * ahead };
}

// --- The energy floor ---------------------------------------------------------------------------------------------
// What to do with a hit on a wild boss, in the game's before-hurt event. `current`: its health as the event reads it,
// which the bench showed is already less the hit (400 -> 392 on an 8 hit; cancelling puts it back), so the health before
// the hit is current + damage. `fromPlayer`: a player's hit (their melee, or something they shot or threw); `cause`:
// the game's damage cause. Returns { cancel: true } or { damage } (the hit as it should land: cut so it stops at the
// tired floor) or {} to let it be.
/**
 * @param {{ current: number, damage: number, fromPlayer: boolean, cause: string, tired: boolean, floor?: number }} hit
 * @returns {{ cancel?: boolean, damage?: number }}
 */
export function hurtOutcome(hit) {
  const floor = hit.floor ?? YETI.tiredAt;
  if (hit.cause === "selfDestruct" || hit.cause === "void") return {}; // /kill, and the void: an admin's, let through
  if (!hit.fromPlayer || hit.tired) return { cancel: true };
  const before = hit.current + hit.damage;
  if (before <= floor) return { cancel: true };
  if (before - hit.damage < floor) return { damage: before - floor };
  return {};
}

// --- Provoking and the fight ---------------------------------------------------------------------------------------
/** @typedef {{ id: string, x: number, y: number, z: number, mode: string, sneaking?: boolean }} Who */

// Someone who walks right up to it: in Survival or Adventure, within YETI.provoke blocks, not sneaking. The first such
// (nearest), or undefined.
/** @param {{ x: number, y: number, z: number }} at @param {Who[]} players */
export function provoker(at, players, reach = YETI.provoke) {
  let best;
  let bestD = Infinity;
  for (const p of players) {
    if (!fights(p.mode) || p.sneaking) continue;
    const d = hyp(p.x - at.x, p.z - at.z);
    if (d <= reach && Math.abs(p.y - at.y) <= 4 && d < bestD) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

// Who it fights: a player in Survival or Adventure (never Creative or Spectator).
/** @param {string} mode */
export function fights(mode) {
  const m = String(mode).toLowerCase();
  return m === "survival" || m === "adventure";
}

// Its target: the nearest fighting player within the ring round its home (and in reach of where it is: 48).
/** @param {{ x: number, y: number, z: number }} at @param {{ x: number, y: number, z: number }} home @param {Who[]} players */
export function targetOf(at, home, players, ring = YETI.ring) {
  let best;
  let bestD = Infinity;
  for (const p of players) {
    if (!fights(p.mode) || hyp(p.x - home.x, p.z - home.z) > ring) continue;
    const d = hyp(p.x - at.x, p.z - at.z);
    if (d < bestD && d <= 48) {
      best = p;
      bestD = d;
    }
  }
  return best;
}

// Whether a fight is over: nobody it fights within the ring round its home, or a minute since a player's hit.
/** @param {{ home: { x: number, z: number }, players: Who[], now: number, lastHit: number }} f */
export function fightOver(f, Y = YETI) {
  if (f.now - f.lastHit >= Y.noHitTicks) return true;
  return !f.players.some((p) => fights(p.mode) && hyp(p.x - f.home.x, p.z - f.home.z) <= Y.ring);
}

// The angle (degrees, 0 to 180) between its facing and the way to a point.
/** @param {{ x: number, z: number }} at @param {number} yaw @param {{ x: number, z: number }} to */
export function offFacing(at, yaw, to) {
  const want = yawOf(to.x - at.x, to.z - at.z);
  const d = (((want - yaw) % 360) + 540) % 360 - 180;
  return Math.abs(d);
}

// Which move it makes at a target `dist` blocks off: near, the swipe or the slam (the slam when two or more are close,
// or one in three); far, the hurl; in between (5 to 7 blocks), none yet: it closes in. `near`: how many it fights are
// within the slam's reach.
/** @param {number} dist @param {number} near @param {() => number} [rand] */
export function pickMove(dist, near, rand = Math.random, Y = YETI) {
  const M = Y.moves;
  if (dist <= M.swipe.reach) return near >= 2 || rand() < 1 / 3 ? "slam" : "swipe";
  if (dist <= M.slam.reach && near >= 2) return "slam";
  if (dist >= M.hurl.min && dist <= M.hurl.max) return "hurl";
  return undefined;
}

// Who a move hits, and the push for each: the swipe, those within its reach in front (its arc either side of where it
// faces); the slam, those within its reach all round, on the ground near its own height; the angry roar, those within
// its radius. Each { id, x, z, h, v }: the knock back away from the yeti (h along the ground, v up).
/**
 * @param {"swipe" | "slam" | "angry"} move @param {{ x: number, y: number, z: number }} at @param {number} yaw
 * @param {Who[]} players
 */
export function moveHits(move, at, yaw, players, Y = YETI) {
  const out = [];
  for (const p of players) {
    if (!fights(p.mode)) continue;
    const d = hyp(p.x - at.x, p.z - at.z);
    const dy = p.y - at.y;
    let hit = false;
    let knock;
    if (move === "swipe") {
      hit = d <= Y.moves.swipe.reach && dy > -2 && dy < 4 && (d < 1.2 || offFacing(at, yaw, p) <= Y.moves.swipe.arc);
      knock = Y.moves.swipe.knock;
    } else if (move === "slam") {
      hit = d <= Y.moves.slam.reach && Math.abs(dy) <= Y.moves.slam.high;
      knock = Y.moves.slam.knock;
    } else {
      hit = d <= Y.angry.radius && Math.abs(dy) <= 6;
      knock = Y.angry.knock;
    }
    if (!hit) continue;
    const away = awayFrom(at, p, yaw);
    out.push({ id: p.id, x: away.x * knock.h, z: away.z * knock.h, h: knock.h, v: knock.v });
  }
  return out;
}

// The way from `from` to `to` along the ground, as a unit vector (its facing when they stand on it).
/** @param {{ x: number, z: number }} from @param {{ x: number, z: number }} to @param {number} yaw */
export function awayFrom(from, to, yaw) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const d = hyp(dx, dz);
  if (d < 0.05) {
    const r = (yaw * Math.PI) / 180;
    return { x: -Math.sin(r), z: Math.cos(r) };
  }
  return { x: dx / d, z: dz / d };
}

// The snowball's velocity (blocks a tick) from `from` to land on `to` (a player's chest): `speed` along the ground, up
// enough that the projectile's gravity (blocks a tick, each tick) brings it down there.
/** @param {{ x: number, y: number, z: number }} from @param {{ x: number, y: number, z: number }} to */
export function throwVelocity(from, to, speed = YETI.moves.hurl.speed, gravity = YETI.moves.hurl.gravity) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const d = Math.max(0.5, hyp(dx, dz));
  const t = Math.max(1, d / speed);
  const vy = (to.y - from.y + 0.5 * gravity * t * t) / t;
  return { x: (dx / d) * speed, y: vy, z: (dz / d) * speed };
}

// Tired out and left alone: up rested once the stamp (Date.now() ms when it was tired, or last had a player within the
// ring) is the recovery time old. No stamp (never tired here): not rested.
/** @param {unknown} at @param {number} nowMs */
export function restedSince(at, nowMs, Y = YETI) {
  return typeof at === "number" && Number.isFinite(at) && nowMs - at >= Y.recoverTicks * 50;
}

// Energy back while calm: `perSecond` for `ticks`, up to the full.
/** @param {number} energy @param {number} ticks */
export function regen(energy, ticks, Y = YETI) {
  return Math.min(Y.energy, energy + (Y.regenPerSecond * ticks) / 20);
}

// --- Lairs --------------------------------------------------------------------------------------------------------
// A lair a record in the "bosses" collection:
/**
 * @typedef {{ id: string, species: string, dimension: string, x: number, y: number, z: number,
 *   den: { x: number, y: number, z: number }, facing: number, state: "wild" | "caught", madeAt: number, built?: boolean }} Lair
 */

// Whether a new lair may be made near p: no lair of any kind (wild or caught) within the spacing in that dimension.
/** @param {Lair[]} lairs @param {string} dimension @param {{ x: number, z: number }} p */
export function lairAllowed(lairs, dimension, p, spacing = YETI.spacing) {
  return lairs.every((l) => l.dimension !== dimension || hyp(l.x - p.x, l.z - p.z) >= spacing);
}

// The nearest lair to p in its dimension that `want` accepts, with its distance, or undefined.
/** @param {Lair[]} lairs @param {string} dimension @param {{ x: number, z: number }} p @param {(l: Lair) => boolean} [want] */
export function nearestLair(lairs, dimension, p, want = () => true) {
  let best;
  let bestD = Infinity;
  for (const l of lairs) {
    if (l.dimension !== dimension || !want(l)) continue;
    const d = hyp(l.x - p.x, l.z - p.z);
    if (d < bestD) {
      best = l;
      bestD = d;
    }
  }
  return best ? { lair: best, dist: bestD } : undefined;
}

// What's not ground: what stands on it (trees, plants, snow layers) or lies loose on it. Read down through these to the
// ground under a forest.
const NOT_GROUND = /(leaves|_log$|_wood$|^minecraft:air$|snow_layer|fern|short_grass|tall_grass|_flower|flower$|bush|mushroom|vine|sapling|dandelion|poppy|azalea|propagule|lily|rose|tulip|orchid|allium|bluet|daisy|cornflower|valley|torchflower|pitcher|carpet|leaf_litter|pale_moss|_roots$|pumpkin|melon|bamboo|cactus|sugar_cane|cobweb|lichen|dripleaf|spore|hanging_moss|moss_carpet|firefly|wildflowers|button|torch|lantern|_sign|_banner|chest|beehive|bee_nest)/;
const WET = /(water|lava|^minecraft:ice$|frosted_ice|bubble_column|kelp|seagrass)/;
/** @param {string | undefined} id */
export function isGround(id) {
  return Boolean(id) && !NOT_GROUND.test(id) && !WET.test(id);
}

// The ground's height at a column: from `top` (the topmost block) down through trees, plants and snow layers to the
// first ground block. "wet" where water, ice or lava is the first thing under the trees; undefined unread (unloaded),
// or no ground within `depth`.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {number} x @param {number} z @param {number} top */
export function groundY(idAt, x, z, top, depth = 40) {
  for (let y = top; y > top - depth; y--) {
    const id = idAt(x, y, z);
    if (id === undefined) return undefined;
    if (WET.test(id)) return "wet";
    if (isGround(id)) return y;
  }
  return undefined;
}

// Whether a site is good for a lair: the ground over the clearing (every 2 blocks out to its radius) within `level`
// blocks of the middle's, none of it water, ice or lava, all of it read. `groundAt(x, z)`: groundY at that column.
/** @param {(x: number, z: number) => (number | "wet" | undefined)} groundAt @param {{ x: number, z: number }} c */
export function siteLevel(groundAt, c, radius = LAIR.radius, level = YETI.site.level) {
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

// The spots to try for a lair round a player: `tries` of them, `min` to `max` blocks off, round from a random start.
/** @param {{ x: number, z: number }} p @param {() => number} [rand] */
export function siteCandidates(p, rand = Math.random, S = YETI.site) {
  const out = [];
  const a0 = rand() * 360;
  for (let i = 0; i < S.tries; i++) {
    const a = ((a0 + i * 137.5) % 360) * (Math.PI / 180);
    const d = S.min + ((i * 11) % (S.max - S.min + 1));
    out.push({ x: Math.floor(p.x + Math.cos(a) * d), z: Math.floor(p.z + Math.sin(a) * d) });
  }
  return out;
}

// Far enough from every park: `parks` the parks' deed spots (park.center) in this dimension.
/** @param {{ x: number, z: number }[]} parks @param {{ x: number, z: number }} p */
export function farFromParks(parks, p, min = YETI.site.parks) {
  return parks.every((c) => hyp(c.x - p.x, c.z - p.z) >= min);
}

// The lair's shape (boss_plan.md "Lairs"): a round clearing (radius 8: 17 across), and on one side a den of stone,
// cobblestone, mossy cobblestone and packed ice, 5 wide, 4 deep and 5 high inside, its door 3 wide and 4 high facing the
// clearing; the yeti's moss bed at the back of the den; two packed-ice spikes by the door; mossy boulders round the
// rim, sweet berry bushes on podzol, and a few bone blocks.
export const LAIR = {
  radius: 8,
  clearUp: 22, // trees cleared this high over the floor
  fillDown: 4, // dips under the floor filled with dirt this deep
  den: { front: 2, back: 7, half: 3, height: 5, door: { half: 1, height: 4 } },
};
const FACINGS = [{ x: 0, z: 1 }, { x: -1, z: 0 }, { x: 0, z: -1 }, { x: 1, z: 0 }]; // yaw 0, 90, 180, -90

// From the lair's own frame to the world: u across (to its right looking at the den), v toward the den, y up from the
// floor block. `facing` 0 to 3 (FACINGS: the way to the den).
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function lairFrame(c, facing) {
  const f = FACINGS[((facing % 4) + 4) % 4];
  const r = { x: -f.z, z: f.x }; // to the right of f
  return (/** @type {number} */ u, /** @type {number} */ v, /** @type {number} */ y) => ({ x: c.x + r.x * u + f.x * v, y: c.y + y, z: c.z + r.z * u + f.z * v });
}

// The den's middle, where the yeti is put (its home), and its bed's middle, in the world.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function denSpot(c, facing) {
  const at = lairFrame(c, facing);
  const D = LAIR.den;
  const mid = at(0, (D.front + D.back) / 2, 1);
  const bed = at(0, D.back - 1.5, 1);
  return { x: mid.x + 0.5, y: mid.y, z: mid.z + 0.5, bed: { x: bed.x + 0.5, y: bed.y, z: bed.z + 0.5 } };
}

// A small seeded random (the lair's own look, the same each time it is worked out).
/** @param {number} seed */
export function seeded(seed) {
  let s = (Math.floor(seed) % 2147483647) || 1;
  if (s < 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STONES = ["minecraft:stone", "minecraft:stone", "minecraft:cobblestone", "minecraft:cobblestone", "minecraft:mossy_cobblestone", "minecraft:mossy_cobblestone", "minecraft:packed_ice"];

// Every block the lair sets, in order: { x, y, z, id, states? }. `c`: the clearing's middle on the floor block's level
// (y the ground's height there). The columns of the clearing are cleared of trees up to clearUp first (lairColumns),
// dips filled; then this. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function lairBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  const D = LAIR.den;
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  const R = LAIR.radius;
  // The floor: snow with patches of packed ice; podzol where a berry bush grows.
  const bushes = [];
  for (let i = 0; i < 4; i++) {
    const a = (200 + i * 40 + rand() * 20) * (Math.PI / 180); // in the front half, away from the den
    const d = 3 + rand() * 2.5;
    bushes.push({ u: Math.round(Math.sin(a) * d), v: Math.round(Math.cos(a) * d) });
  }
  const iceSeeds = Array.from({ length: 4 }, () => ({ u: Math.round((rand() - 0.5) * 10), v: Math.round((rand() - 0.7) * 8), r: 1 + rand() * 1.5 }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const bush = bushes.some((b) => b.u === u && b.v === v);
      const ice = !bush && iceSeeds.some((s) => hyp(u - s.u, v - s.v) <= s.r);
      put(u, v, 0, bush ? "minecraft:podzol" : ice ? "minecraft:packed_ice" : "minecraft:snow");
    }
  }
  // The den: walls and roof of the mixed stone, the door open, the inside clear, the bed of moss at the back.
  for (let u = -D.half; u <= D.half; u++) {
    for (let v = D.front; v <= D.back; v++) {
      const wall = Math.abs(u) === D.half || v === D.front || v === D.back;
      for (let y = 1; y <= D.height; y++) {
        const door = v === D.front && Math.abs(u) <= D.door.half && y <= D.door.height;
        if (wall && !door) put(u, v, y, STONES[Math.floor(rand() * STONES.length)]);
        else put(u, v, y, "minecraft:air");
      }
      // The roof, and a ridge over the inside for a rounded look.
      put(u, v, D.height + 1, STONES[Math.floor(rand() * STONES.length)]);
      if (Math.abs(u) < D.half && v > D.front && v < D.back) put(u, v, D.height + 2, rand() < 0.5 ? "minecraft:mossy_cobblestone" : "minecraft:stone");
    }
  }
  for (let u = -1; u <= 1; u++) for (let v = D.back - 2; v <= D.back - 1; v++) put(u, v, 1, "minecraft:moss_carpet");
  // Two packed-ice spikes by the door (3 and 4 high).
  for (const [u, h] of [[-(D.half + 1), 3], [D.half + 1, 4]]) for (let y = 1; y <= h; y++) put(u, D.front - 1, y, "minecraft:packed_ice");
  // Mossy boulders round the rim, on the sides and the far half.
  for (let i = 0; i < 5; i++) {
    const a = (100 + i * 40 + rand() * 15) * (Math.PI / 180);
    const d = R - 1.5;
    const u = Math.round(Math.sin(a) * d), v = Math.round(Math.cos(a) * d);
    put(u, v, 1, "minecraft:mossy_cobblestone");
    put(u + (rand() < 0.5 ? 1 : -1), v, 1, rand() < 0.5 ? "minecraft:mossy_cobblestone" : "minecraft:cobblestone");
    if (rand() < 0.6) put(u, v, 2, "minecraft:mossy_cobblestone");
  }
  // Sweet berry bushes with their berries, on their podzol.
  for (const b of bushes) put(b.u, b.v, 1, "minecraft:sweet_berry_bush", { growth: 3 });
  // A few bone blocks lying about.
  for (let i = 0; i < 3; i++) {
    const a = (130 + i * 50 + rand() * 30) * (Math.PI / 180);
    const d = 4 + rand() * 2;
    put(Math.round(Math.sin(a) * d), Math.round(Math.cos(a) * d), 1, "minecraft:bone_block", { pillar_axis: rand() < 0.5 ? "x" : "z" });
  }
  return out;
}

// The columns of the clearing (the world's x, z), each to be cleared from the floor up and its dips filled.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function lairColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = LAIR.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// Which way the den lies from the clearing's middle: on the far side from where the player stands, its door toward
// them (0 to 3, FACINGS).
/** @param {{ x: number, z: number }} c @param {{ x: number, z: number }} from */
export function denFacing(c, from) {
  const dx = c.x - from.x;
  const dz = c.z - from.z;
  if (Math.abs(dz) >= Math.abs(dx)) return dz >= 0 ? 0 : 2;
  return dx >= 0 ? 3 : 1;
}

// A missing wild yeti: how many looks in a row its den (loaded, a player near) has had no yeti within reach. After
// YETI.respawn.looks it is put back.
/** @param {number} misses @param {{ playerNear: boolean, denLoaded: boolean, yetis: number }} look */
export function missingLooks(misses, look, Y = YETI) {
  if (!look.playerNear || !look.denLoaded) return misses;
  return look.yetis > 0 ? 0 : misses + 1;
}

// --- The zoo yeti's day (animals/yeti.js) -------------------------------------------------------------------------
// Calm; it wanders, eats at its feeder, scoops up snow and tosses a snowball up to catch it, rears up with a softer roar
// and a beat of its chest, sits down to rest, and at night sleeps sitting.
export const ZOO_DAY = {
  weights: { feeder: 3, toss: 1.5, roar: 0.6, sit: 1.5, wander: 3 },
  interestTicks: [300, 600], // how long it keeps at an interest before picking again
  coolTicks: 40, // between one thing and the next
  wanderTicks: [100, 240],
  eatTicks: [100, 180], // 5 to 9 seconds at the feeder
  tossTicks: 50, // the art's toss (2.4 s)
  roarTicks: 46, // the art's roar (2.2 s)
  sitTicks: [400, 900], // a rest of 20 to 45 seconds
  sleepTicks: [1200, 2400], // at night, renewed till morning
  wakeTicks: [20, 200], // in the morning, up within 1 to 10 seconds
  getUpTicks: 24, // the client's get-up (1.2 s)
  baitRange: 8,
  feederReach: 2.6, // blocks from a feeder's middle: it eats
};

// What a zoo yeti heads for next: at night, to sleep; by day by the weights (the feeder only with food in it).
/** @param {{ night: boolean, feeder: boolean }} o @param {() => number} [random] */
export function pickYetiInterest(o, random = Math.random, Z = ZOO_DAY) {
  if (o.night) return "sleep";
  const W = Z.weights;
  const options = [["feeder", o.feeder ? W.feeder : 0], ["toss", W.toss], ["roar", W.roar], ["sit", W.sit], ["wander", W.wander]];
  let r = random() * options.reduce((n, [, w]) => n + Number(w), 0);
  for (const [what, w] of options) {
    if (r < Number(w)) return String(what);
    r -= Number(w);
  }
  return "wander";
}

// --- The zoo yeti's exhibit: snow underfoot -------------------------------------------------------------------------
// Snow or ice underfoot on part of the floor (species.snowFloor: `share` of it): snow blocks, snow layers, ice, packed
// ice or blue ice. The snow measure (exhibits/exhibits.js, for yetis living here) over the floor the walking measure
// found (cells: key "x,y,z" -> kind; the "land" ones, each the air a block over the floor).
export const SNOW_FLOOR = new Set(["minecraft:snow", "minecraft:ice", "minecraft:packed_ice", "minecraft:blue_ice", "minecraft:powder_snow"]);
export const SNOW_HOW = "snow blocks, snow layers, ice, packed ice or blue ice in the floor";

export function newSnowResult() {
  return { snow: 0, cells: 0 };
}

/**
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number }} opts @param {{ snow: number, cells: number }} out
 */
export function* measureSnow(idAt, cells, opts, out) {
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    out.cells++;
    if (SNOW_FLOOR.has(idAt(x, y - 1, z) ?? "") || idAt(x, y, z) === "minecraft:snow_layer") out.snow++;
  }
  return out;
}

// Enough snow (cause "snow": species.snowFloor). False caps comfort. Not measured yet: passes.
/** @param {{ snowFloor?: { share: number } }} species @param {{ snow?: { snow: number, cells: number } }} ex */
export function hasSnow(species, ex) {
  if (!species.snowFloor || !ex.snow) return true;
  return ex.snow.cells > 0 && ex.snow.snow / ex.snow.cells >= species.snowFloor.share;
}

// The Exhibit Clipboard's lines for yetis: the snow.
export function snowLines(ex, species) {
  const t = ex.snow;
  if (!t) return ["§fSnow underfoot: §7not measured yet: use the Habitat Marker on the ground inside again"];
  const pct = t.cells ? Math.round((t.snow / t.cells) * 100) : 0;
  return [`§fSnow underfoot: ${hasSnow(species, ex) ? "§a" : "§c"}${pct}%§7 of the floor (${t.snow} of ${t.cells} blocks; ${Math.round(species.snowFloor.share * 100)}% wanted: ${SNOW_HOW})`];
}

// Care warnings for yetis: the snow.
export function snowWarnings(ex, plural, species, cap) {
  if (!ex.snow || hasSnow(species, ex)) return [];
  return [{ severity: 2, text: `${plural} want snow underfoot: ${SNOW_HOW} under ${Math.round(species.snowFloor.share * 100)}% of the floor or more (${ex.snow.snow} of ${ex.snow.cells} blocks now). Without it comfort can't rise above ${cap}.` }];
}

// The Field Journal's line on wild ones.
export function wildLine(Y = YETI) {
  return `In the wild one lives alone in its lair in a taiga (a snowy clearing with a den of stone and ice), one to an area: a lair is made when a park member walks in a taiga with none within ${Y.spacing} blocks. Calm till someone hits it or walks up to it in Survival without sneaking: then it rears up roaring and fights, its boss bar showing. It swipes at you close by, slams the ground round it, and hurls snowballs from afar, each with a wind-up you can see: dodge. At half its energy it beats its chest and gives a frost roar that slows you. It is never killed: worn down to a tenth it slumps down tired out, and then its Yeti Cage works (with a Fruit Ration in your inventory). Left alone a minute it gets up rested`;
}
