import { world, system, EntityDamageCause, BlockPermutation, BlockVolume } from "@minecraft/server";
import { onlinePlayers, entitiesNear, biomeAt, message } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { allParks, memberOfAny, parkAt } from "../park/park.js";
import { findPlace } from "../world/places.js";
import { log } from "../core/log.js";
import { jobQueue } from "../core/jobs.js";
import { timedJob } from "../core/perf.js";
import {
  YETI, YETI_ACT, SEATED_ACTS, WILD_YETI, SNOWBALL, BOSS_TYPES, BOSSES, LAIR_PROP, LAIR,
  hurtOutcome, provoker, fights, targetOf, fightOver, pickMove, moveHits, throwVelocity, regen, aheadOf, yawOf,
  lairAllowed, groundY, siteLevel, siteCandidates, farFromParks, lairBlocks, lairColumns, denSpot, denFacing,
  missingLooks,
  restedSince,
} from "./bossRules.js";

// The bosses' fights and lairs (module 10, 0.1.159: the Giant Yeti; the rules are in animals/bossRules.js, the design in
// research/boss_plan.md). A wild boss is never killed: its energy is its health, shown on its boss bar while it fights;
// a player's hits wear it down to the tired floor and no further (the before-hurt event cuts them), and nothing else
// hurts it (its damage sensor, and this). Calm in its lair, it wanders, sleeps in its den at night and roars now and
// then; hit, or walked right up to by someone in Survival who isn't sneaking, it rears up roaring and fights: it walks
// at them (the engine's chase), and every few seconds it stops for a move you can see coming (a swipe, a ground slam, a
// snowball hurled from afar) that this plays: the wind-up, then the hits and the knock back. At half energy it beats
// its chest and gives a frost roar that slows and pushes everyone near, and is quicker after. Tired out it slumps down
// panting, can't be hurt, and its carrier works on it (transport/carriers.js pack, with bossCatchBlock below); left
// alone a minute it gets up rested. A fight ends when no one it fights is near its lair, or a minute goes by without a
// hit; it walks home and gets its energy back. Lairs: a park member walking in a taiga with no lair within 800 blocks
// gets one made nearby (a clearing with a den), the yeti put in it; the "bosses" collection keeps each lair (wild or
// caught), and a lair's missing yeti is put back. Walking near a lair finds it (Places).

const PROP = "zoocraft:act";
const HOME_PROP = "zoocraft:home"; // "x,y,z": where a yeti not from a lair (a spawn egg's) first was
const TIRED_PROP = "zoocraft:tired_at"; // when it was tired out, or last had a player near while tired (Date.now() ms)
const RANGE = 64; // blocks from a player: the yetis looked after
const OVERWORLD = "minecraft:overworld";

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Player} Player */
/** @typedef {{ id: string, x: number, y: number, z: number, mode: string, sneaking: boolean, player: Player, dim: string }} Who */

const state = new Map(); // yeti id -> its state (see meet)
const hits = new Map(); // yeti id -> { by: player id, tick }: a player's hit seen in the before-hurt event, for the loop
let applying = false; // the script's own hit on a player is landing (the yeti's melee_box_attack hits are cancelled)
const misses = new Map(); // lair id -> looks in a row with its den loaded, a player near, and no yeti
const nextLairLook = new Map(); // player id -> tick
const building = new Set(); // lair ids whose blocks are being placed
const buildTries = new Map(); // lair id -> builds started since load (a lair left half built is built again, 3 times at most)
const jobs = jobQueue((gen) => system.runJob(timedJob("lairs", gen)), (error) => log(`lairs: building a lair failed: ${error}`));

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** @param {Entity} e */
function health(e) {
  return /** @type {import("@minecraft/server").EntityHealthComponent | undefined} */ (e.getComponent("minecraft:health"));
}

// --- Hits ---------------------------------------------------------------------------------------------------------
// A wild boss hurt: a player's hit lands, cut at the tired floor; anything else (fire, mobs, wolves, its own snowball)
// is cancelled; /kill and the void go through. Read-only here (a before event): the hit is noted for the loop.
world.beforeEvents.entityHurt.subscribe(
  (ev) => {
    try {
      const e = ev.hurtEntity;
      const src = ev.damageSource;
      const by = src.damagingEntity;
      const fromPlayer = by?.typeId === "minecraft:player";
      const hp = health(e);
      const s = state.get(e.id);
      const out = hurtOutcome({ current: hp?.currentValue ?? YETI.energy, damage: ev.damage, fromPlayer, cause: String(src.cause), tired: s?.phase === "tired" || s?.phase === "rise" });
      if (out.cancel) ev.cancel = true;
      else if (out.damage !== undefined) ev.damage = out.damage;
      if (fromPlayer && !out.cancel && by) hits.set(e.id, { by: by.id, tick: system.currentTick });
    } catch {
      // never stop a hit for an error here
    }
  },
  { entityFilter: { families: ["zoocraft_boss"] } },
);

// A player hurt by a yeti's own melee (the engine's chase hits for 0): cancelled. The script's moves land while
// `applying` is set; its snowball comes as a projectile and lands.
world.beforeEvents.entityHurt.subscribe(
  (ev) => {
    if (applying) return;
    try {
      const src = ev.damageSource;
      if (src.damagingEntity?.typeId === WILD_YETI && !src.damagingProjectile) ev.cancel = true;
    } catch {
      // let it be
    }
  },
  { entityFilter: { type: "minecraft:player" } },
);

// The snowball's hit: a push back and a puff of snow on a player; a puff where it lands on the ground.
world.afterEvents.projectileHitEntity.subscribe((ev) => {
  try {
    if (ev.projectile?.typeId !== SNOWBALL) return;
    const hit = ev.getEntityHit()?.entity;
    const at = ev.location;
    particle(ev.dimension, "zoocraft:yeti_snow_puff", at);
    sound(ev.dimension, "dig.snow", at, 1.2, 0.7);
    if (hit?.typeId !== "minecraft:player") return;
    const k = YETI.moves.hurl.knock;
    const v = ev.projectile.getVelocity();
    const len = Math.hypot(v.x, v.z) || 1;
    hit.applyKnockback({ x: (v.x / len) * k.h, z: (v.z / len) * k.h }, k.v);
  } catch {
    // cosmetic and the push only
  }
});
world.afterEvents.projectileHitBlock.subscribe((ev) => {
  try {
    if (ev.projectile?.typeId !== SNOWBALL) return;
    particle(ev.dimension, "zoocraft:yeti_snow_puff", ev.location);
    sound(ev.dimension, "dig.snow", ev.location, 1.2, 0.7);
  } catch {
    // cosmetic only
  }
});

// --- Small helpers ------------------------------------------------------------------------------------------------
function sound(dimension, id, at, volume = 1, pitch = 1) {
  try {
    dimension.playSound(id, at, { volume, pitch });
  } catch {
    // cosmetic only
  }
}

function particle(dimension, id, at) {
  try {
    dimension.spawnParticle(id, at);
  } catch {
    // cosmetic only
  }
}

/** @param {Entity} e @param {number} act */
function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its walking (the entity's groups: calm, seek_den, rest, chase, chase_angry, hold), each event swapping the others out.
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// The boss bar: on while it fights, off otherwise (its own group, so it doesn't flicker as the walking changes).
function bar(e, s, on) {
  if (s.bar === on) return;
  e.triggerEvent(on ? "zoocraft:bar_on" : "zoocraft:bar_off");
  s.bar = on;
}

function face(e, yaw) {
  try {
    e.setRotation({ x: 0, y: yaw });
  } catch {
    // next time
  }
}

// Everyone online, as the rules take them.
/** @returns {Who[]} */
function everyone() {
  const out = [];
  for (const p of onlinePlayers()) {
    try {
      const l = p.location;
      out.push({ id: p.id, x: l.x, y: l.y, z: l.z, mode: String(p.getGameMode()), sneaking: p.isSneaking, player: p, dim: p.dimension.id });
    } catch {
      // left
    }
  }
  return out;
}

// Its home: its lair's den, else where it first was (a spawn egg's).
function homeOf(e, s) {
  if (s.home) return s.home;
  const lairId = e.getDynamicProperty(LAIR_PROP);
  const lair = typeof lairId === "string" ? db.get(BOSSES, lairId) : undefined;
  if (lair) {
    s.lairId = lair.id;
    s.home = { x: lair.den.x, y: lair.den.y, z: lair.den.z, bed: lair.den.bed };
    return s.home;
  }
  const kept = e.getDynamicProperty(HOME_PROP);
  if (typeof kept === "string") {
    const [x, y, z] = kept.split(",").map(Number);
    s.home = { x, y, z };
    return s.home;
  }
  const l = e.location;
  s.home = { x: Math.floor(l.x) + 0.5, y: Math.floor(l.y), z: Math.floor(l.z) + 0.5 };
  e.setDynamicProperty(HOME_PROP, `${s.home.x},${s.home.y},${s.home.z}`);
  return s.home;
}

// First met (or met again after a reload): calm, its bar off; or still tired out, if it was.
function meet(e, now) {
  const s = { phase: "calm", body: undefined, bar: undefined, angry: false, until: 0, lastHit: now, nextMove: 0, quietSince: now, denSince: 0, target: undefined, move: undefined, home: undefined, lairId: undefined, regenAt: now };
  state.set(e.id, s);
  const hp = health(e);
  bar(e, s, false);
  if (hp && hp.currentValue <= YETI.tiredAt) {
    // Tired out when last looked after: up rested if nobody has been near it (it isn't looked after with no player
    // within 64 blocks) for the time it takes to recover; else still tired.
    const at = e.getDynamicProperty(TIRED_PROP);
    if (restedSince(at, clock())) {
      hp.resetToMaxValue();
      body(e, s, "calm");
      setAct(e, YETI_ACT.none);
    } else tire(e, s, now, typeof at === "number");
  } else {
    body(e, s, "calm");
    setAct(e, YETI_ACT.none);
  }
  homeOf(e, s);
  return s;
}

// --- The loop -----------------------------------------------------------------------------------------------------
// Every 2 ticks: the wild yetis near players.
export function tickBosses(now) {
  const who = everyone();
  const seen = new Set();
  for (const p of who) {
    let list;
    try {
      list = entitiesNear(p.player.dimension, p, RANGE, BOSS_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, who.filter((w) => w.dim === p.dim));
      } catch (error) {
        state.delete(e.id);
        log(`boss: ${error}`);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
  for (const id of [...hits.keys()]) if (!seen.has(id)) hits.delete(id);
}

function step(e, now, who) {
  const s = state.get(e.id) ?? meet(e, now);
  const hp = health(e);
  if (!hp) return;
  const energy = hp.currentValue;
  const home = homeOf(e, s);
  const at = e.location;
  const hit = hits.get(e.id);
  if (hit) {
    hits.delete(e.id);
    s.lastHit = now;
    if (!s.target) s.target = hit.by;
  }
  switch (s.phase) {
    case "calm":
    case "den":
    case "sleep":
    case "wake":
    case "calmroar":
      return calm(e, s, now, who, energy, hp, home, hit);
    case "roar":
      return roaring(e, s, now, who);
    case "fight":
      return fighting(e, s, now, who, energy, home);
    case "move":
      return moving(e, s, now, who, energy);
    case "angry":
      return angry(e, s, now, who);
    case "tired":
      return tired(e, s, now, who, home, hp);
    case "rise":
      if (now >= s.until) toCalm(e, s, now);
      return;
    default:
      toCalm(e, s, now);
  }
}

// Calm: energy coming back, wandering (or to its den and asleep at night), a roar now and then; provoked, it fights.
function calm(e, s, now, who, energy, hp, home, hit) {
  if (energy < YETI.energy && now > s.regenAt) {
    hp.setCurrentValue(regen(energy, now - s.regenAt));
  }
  s.regenAt = now;
  const p = hit ? who.find((w) => w.id === hit.by) : provoker(e.location, who);
  if (p && fights(p.mode)) {
    s.target = p.id;
    s.lastHit = now;
    if (s.phase === "sleep") {
      // Up first (the client's get-up), then the roar.
      s.phase = "wake";
      s.until = now + 24;
      setAct(e, YETI_ACT.none);
      body(e, s, "hold");
      return;
    }
    if (s.phase !== "wake") return startRoar(e, s, now, who);
  }
  if (s.phase === "wake") {
    if (now >= s.until) startRoar(e, s, now, who);
    return;
  }
  if (s.phase === "calmroar") {
    if (now >= s.until) {
      setAct(e, YETI_ACT.none);
      s.phase = "calm";
      body(e, s, "calm");
    }
    return;
  }
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 5) return; // the rest every half second (the loop runs every 2 ticks)
  const night = isNight();
  if (s.phase === "sleep") {
    if (!night) {
      s.phase = "rise";
      s.until = now + 24;
      setAct(e, YETI_ACT.none);
    }
    return;
  }
  if (night && home.bed) {
    if (s.phase !== "den") {
      s.phase = "den";
      s.denSince = now;
      body(e, s, "seek_den");
    }
    const d = dist2(e.location, home.bed);
    if (d <= YETI.denArrive || now - s.denSince >= YETI.denGiveUp) {
      s.phase = "sleep";
      body(e, s, "rest");
      setAct(e, YETI_ACT.sleep);
    }
    return;
  }
  if (s.phase === "den") {
    s.phase = "calm";
    body(e, s, "calm");
  }
  if (Math.random() < YETI.calmRoarChance) {
    s.phase = "calmroar";
    s.until = now + YETI.calmRoarTicks;
    body(e, s, "hold");
    setAct(e, YETI_ACT.roar);
    roarSounds(e, s, now, 0.6, 0.9);
  }
}

function isNight() {
  try {
    const t = world.getTimeOfDay() % 24000;
    return t >= 13000 && t < 23000;
  } catch {
    return false;
  }
}

// The roar's sounds, at their moments in the art's roar (chest beats at 0.15 to 0.6 s, the roar at 0.8 s).
function roarSounds(e, s, now, volume, pitch) {
  const d = e.dimension;
  const l = e.location;
  for (const t of [3, 6, 9, 12]) system.runTimeout(() => sound(d, "mob.ravager.step", l, volume, 0.6), t);
  system.runTimeout(() => sound(d, "mob.ravager.roar", l, volume * 2, pitch), 16);
}

// Rearing up with a roar, then the fight.
function startRoar(e, s, now, who) {
  s.phase = "roar";
  s.until = now + YETI.roarTicks;
  body(e, s, "hold");
  setAct(e, YETI_ACT.roar);
  const t = who.find((w) => w.id === s.target);
  if (t) face(e, yawOf(t.x - e.location.x, t.z - e.location.z));
  roarSounds(e, s, now, 1.0, 0.75);
}

function roaring(e, s, now, who) {
  if (now < s.until) return;
  setAct(e, YETI_ACT.none);
  bar(e, s, true);
  s.phase = "fight";
  s.nextMove = now + YETI.firstMove;
  body(e, s, s.angry ? "chase_angry" : "chase");
}

function fighting(e, s, now, who, energy, home) {
  if (energy <= YETI.tiredAt) return tire(e, s, now);
  if (fightOver({ home, players: who, now, lastHit: s.lastHit })) return endFight(e, s, now);
  if (!s.angry && energy <= YETI.angryAt) return startAngry(e, s, now);
  const at = e.location;
  const t = targetOf(at, home, who);
  if (!t) return endFight(e, s, now);
  s.target = t.id;
  if (now < s.nextMove) return;
  const d = dist2(at, t);
  const near = who.filter((w) => fights(w.mode) && dist2(at, w) <= YETI.moves.slam.reach && Math.abs(w.y - at.y) <= YETI.moves.slam.high).length;
  const move = pickMove(d, near);
  if (!move) return;
  s.phase = "move";
  s.move = move;
  s.from = now;
  s.struck = false;
  s.yaw = yawOf(t.x - at.x, t.z - at.z);
  body(e, s, "hold");
  face(e, s.yaw);
  setAct(e, YETI_ACT[move]);
  if (move === "hurl") sound(e.dimension, "dig.snow", at, 1.0, 0.6); // the scoop
  else if (move === "slam") sound(e.dimension, "mob.polarbear.warning", at, 1.2, 0.6);
  else sound(e.dimension, "mob.polarbear.warning", at, 0.8, 0.8);
}

// A move: the wind-up (turned to its target, tracking them till a moment before), the strike, then back to the chase.
function moving(e, s, now, who, energy) {
  const M = YETI.moves[s.move];
  const t = now - s.from;
  const at = e.location;
  const target = who.find((w) => w.id === s.target);
  if (!s.struck && target && t < M.strikeAt - 4) {
    s.yaw = yawOf(target.x - at.x, target.z - at.z);
  }
  face(e, s.yaw);
  if (!s.struck && t >= M.strikeAt) {
    s.struck = true;
    if (s.move === "hurl") hurl(e, s, target);
    else strike(e, s, who);
  }
  if (t < M.ticks) return;
  setAct(e, YETI_ACT.none);
  s.phase = "fight";
  s.nextMove = now + (s.angry ? YETI.everyAngry : YETI.every);
  body(e, s, s.angry ? "chase_angry" : "chase");
  if (energy <= YETI.tiredAt) tire(e, s, now);
}

// The swipe's or the slam's hits: damage (the game scales a mob's hits by difficulty) and the knock back.
function strike(e, s, who) {
  const at = e.location;
  const list = moveHits(s.move, at, s.yaw, who);
  const d = e.dimension;
  if (s.move === "slam") {
    const fists = aheadOf(at, s.yaw, 3.3, 0.2);
    particle(d, "zoocraft:yeti_snow_burst", fists);
    particle(d, "zoocraft:yeti_snow_burst", { x: at.x, y: at.y + 0.2, z: at.z });
    sound(d, "mob.ravager.stun", fists, 1.4, 0.7);
    sound(d, "dig.snow", fists, 1.5, 0.5);
  } else {
    sound(d, "mob.irongolem.throw", at, 1.2, 0.6);
  }
  const damage = YETI.moves[s.move].damage;
  for (const h of list) {
    const w = who.find((x) => x.id === h.id);
    if (!w) continue;
    try {
      applying = true;
      w.player.applyDamage(damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    } catch {
      // gone
    } finally {
      applying = false;
    }
    try {
      w.player.applyKnockback({ x: h.x, z: h.z }, h.v);
    } catch {
      // gone
    }
  }
}

// The snowball: from over its head, at the target's chest (where they stand now: step aside and it misses).
function hurl(e, s, target) {
  const d = e.dimension;
  const from = aheadOf(e.location, s.yaw, YETI.throwFrom.ahead, YETI.throwFrom.up);
  sound(d, "mob.snowgolem.shoot", from, 1.4, 0.5);
  if (!target) return;
  try {
    const ball = d.spawnEntity(SNOWBALL, from);
    const proj = /** @type {import("@minecraft/server").EntityProjectileComponent | undefined} */ (ball.getComponent("minecraft:projectile"));
    if (!proj) return void ball.remove();
    proj.owner = e;
    proj.shoot(throwVelocity(from, { x: target.x, y: target.y + 1.2, z: target.z }), { uncertainty: 0 });
  } catch (error) {
    log(`boss: the snowball: ${error}`);
  }
}

// Angry at half: the chest beat and the frost roar; everyone near slowed and pushed back.
function startAngry(e, s, now) {
  s.angry = true;
  s.phase = "angry";
  s.from = now;
  s.blasted = false;
  body(e, s, "hold");
  setAct(e, YETI_ACT.roar);
  roarSounds(e, s, now, 1.4, 0.55);
}

function angry(e, s, now, who) {
  const A = YETI.angry;
  const t = now - s.from;
  if (!s.blasted && t >= A.blastAt) {
    s.blasted = true;
    const at = e.location;
    particle(e.dimension, "zoocraft:yeti_frost_roar", at);
    sound(e.dimension, "random.glass", at, 1.0, 0.5);
    for (const h of moveHits("angry", at, 0, who)) {
      const w = who.find((x) => x.id === h.id);
      if (!w) continue;
      try {
        w.player.addEffect("slowness", A.slowTicks, { amplifier: A.slowLevel, showParticles: true });
        w.player.applyKnockback({ x: h.x, z: h.z }, h.v);
      } catch {
        // gone
      }
    }
  }
  if (t < A.ticks) return;
  setAct(e, YETI_ACT.none);
  s.phase = "fight";
  s.nextMove = now + YETI.everyAngry;
  body(e, s, "chase_angry");
}

// The tired stamp's clock: real time, so it goes on while the yeti's chunk is unloaded or the world is shut, and doesn't
// stop with the daylight cycle off or jump with /time set (the world's absolute time did both on the bench).
function clock() {
  return Date.now();
}

// Tired out: slumped down panting, its bar gone; it can't be hurt (the before-hurt event) and its carrier works.
function tire(e, s, now, kept = false) {
  if (!kept) e.setDynamicProperty(TIRED_PROP, clock());
  s.phase = "tired";
  s.quietSince = now;
  bar(e, s, false);
  body(e, s, "rest");
  setAct(e, YETI_ACT.tired);
  sound(e.dimension, "mob.polarbear.idle", e.location, 1.0, 0.5);
}

function tired(e, s, now, who, home, hp) {
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 20 === 0) sound(e.dimension, "mob.polarbear.idle", e.location, 0.5, 0.45); // panting, every 2 seconds
  const near = who.some((w) => dist2(w, e.location) <= YETI.ring);
  if (near) {
    s.quietSince = now;
    if (s.ticks % 20 === 0) e.setDynamicProperty(TIRED_PROP, clock()); // every 2 seconds is close enough
  }
  if (now - s.quietSince < YETI.recoverTicks) return;
  // Rested: up with its energy back, and home.
  hp.resetToMaxValue();
  s.angry = false;
  s.phase = "rise";
  s.until = now + 24;
  setAct(e, YETI_ACT.none);
}

function endFight(e, s, now) {
  bar(e, s, false);
  s.angry = false;
  s.target = undefined;
  toCalm(e, s, now);
}

function toCalm(e, s, now) {
  s.phase = "calm";
  s.regenAt = now;
  setAct(e, YETI_ACT.none);
  body(e, s, "calm");
}

// Whether a wild boss can be caught now: undefined if it can, else why not (transport/carriers.js pack).
/** @param {Entity} e */
export function bossCatchBlock(e) {
  if (e.typeId !== WILD_YETI) return undefined;
  const s = state.get(e.id);
  const hp = health(e);
  const tiredOut = s ? s.phase === "tired" : (hp?.currentValue ?? YETI.energy) <= YETI.tiredAt;
  if (!tiredOut) return "A Giant Yeti only goes into its cage once it is tired out: wear it down in a fight till it slumps down panting.";
  return undefined;
}

// A wild boss caught: its lair turns caught, so that area never gets another.
/** @param {Entity} e */
export function bossCaught(e) {
  try {
    const lairId = e.getDynamicProperty(LAIR_PROP);
    const lair = typeof lairId === "string" ? db.get(BOSSES, lairId) : undefined;
    if (lair && lair.state !== "caught") db.put(BOSSES, { ...lair, state: "caught" });
  } catch {
    // no lair: a spawn egg's
  }
  state.delete(e.id);
  hits.delete(e.id);
}

// --- Lairs --------------------------------------------------------------------------------------------------------
function lairs() {
  return [...db.col(BOSSES).values()];
}

// Every 20 ticks: lairs made for park members walking in a taiga, lairs found; every other time, missing yetis put back.
let lairTicks = 0;
export function tickLairs(now) {
  const all = lairs();
  for (const p of onlinePlayers()) {
    try {
      lookAround(p, now, all);
    } catch {
      // unloaded round them; next time
    }
  }
  if (++lairTicks % 2 === 0) keepLairs(now, all);
}

function lookAround(p, now, all) {
  const d = p.dimension;
  const loc = p.location;
  if (d.id !== OVERWORLD) return;
  for (const l of all) if (l.dimension === d.id && dist2(l, loc) <= YETI.findRange) findPlace(p, "yeti_lair", l);
  if ((nextLairLook.get(p.id) ?? 0) > now) return;
  nextLairLook.set(p.id, now + YETI.lairEvery);
  if (!memberOfAny(p)) return;
  if (!(biomeAt(d, loc)?.tags ?? []).includes("taiga")) return;
  if (!lairAllowed(all, d.id, loc)) return;
  makeLair(p, d, loc, all);
}

// A reader of block ids that never loads a chunk (undefined where unloaded).
function idReader(d) {
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}

function makeLair(p, d, loc, all) {
  const idAt = idReader(d);
  const tops = new Map();
  const groundAt = (x, z) => {
    const k = `${x},${z}`;
    if (tops.has(k)) return tops.get(k);
    let g;
    try {
      const top = d.getTopmostBlock({ x, z });
      g = top ? groundY(idAt, x, z, top.location.y) : undefined;
    } catch {
      g = undefined;
    }
    tops.set(k, g);
    return g;
  };
  const parks = allParks().filter((k) => k.dimension === d.id && k.center).map((k) => k.center);
  for (const c of siteCandidates(loc)) {
    if (!farFromParks(parks, c) || parkAt(d.id, c)) continue;
    if (!(biomeAt(d, { x: c.x, y: loc.y, z: c.z })?.tags ?? []).includes("taiga")) continue;
    const y = siteLevel(groundAt, c);
    if (y === undefined) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const den = denSpot(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    /** @type {import("./bossRules.js").Lair} */
    const lair = { id, species: "zoocraft:giant_yeti", dimension: d.id, x: c.x, y, z: c.z, den, facing, state: "wild", madeAt: Date.now(), built: false };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return;
  }
}

function startBuild(d, lair) {
  const n = (buildTries.get(lair.id) ?? 0) + 1;
  if (n > 3) return;
  buildTries.set(lair.id, n);
  building.add(lair.id);
  jobs.push(buildLair(d, lair));
}

// The lair's blocks, a slice at a time: the clearing's trees and plants cleared, dips filled, then the floor, the den,
// the spikes, the boulders, the bushes and the bones; then the yeti, at home in its den. Marked built at the end: one
// left half built (the world closed, or a chunk unloaded) is built again when a player is next near it (keepLairs).
function* buildLair(d, lair) {
  try {
    yield* buildBlocks(d, lair);
  } finally {
    building.delete(lair.id);
  }
}

function* buildBlocks(d, lair) {
  const c = { x: lair.x, y: lair.y, z: lair.z };
  const air = BlockPermutation.resolve("minecraft:air");
  const dirt = BlockPermutation.resolve("minecraft:dirt");
  let n = 0;
  for (const col of lairColumns(c, lair.facing)) {
    d.fillBlocks(new BlockVolume({ x: col.x, y: c.y + 1, z: col.z }, { x: col.x, y: c.y + LAIR.clearUp, z: col.z }), air);
    for (let y = c.y - LAIR.fillDown; y < c.y; y++) {
      const b = d.getBlock({ x: col.x, y, z: col.z });
      if (b && (b.isAir || b.isLiquid || !b.isSolid)) b.setPermutation(dirt);
    }
    if (++n % 12 === 0) yield;
  }
  n = 0;
  for (const b of lairBlocks(c, lair.facing, lair.x * 31 + lair.z)) {
    const block = d.getBlock(b);
    if (block) block.setPermutation(BlockPermutation.resolve(b.id, b.states ?? {}));
    if (++n % 40 === 0) yield;
  }
  db.put(BOSSES, { ...lair, built: true });
  lair.built = true;
  putYeti(d, lair);
}

function putYeti(d, lair) {
  const e = d.spawnEntity(WILD_YETI, { x: lair.den.x, y: lair.den.y, z: lair.den.z }, { initialPersistence: true });
  e.setDynamicProperty(LAIR_PROP, lair.id);
  try {
    e.setRotation({ x: 0, y: (lair.facing * 90 + 180) % 360 }); // facing out of its door
  } catch {
    // as it is
  }
  return e;
}

// Wild lairs near players: a yeti missing three looks running is put back; a second one by the same den is taken away.
function keepLairs(now, all) {
  const players = onlinePlayers();
  for (const lair of all) {
    if (lair.state !== "wild" || building.has(lair.id)) continue;
    const near = players.some((p) => {
      try {
        return p.dimension.id === lair.dimension && dist2(p.location, lair) <= YETI.respawn.near;
      } catch {
        return false;
      }
    });
    if (!near) continue;
    const d = world.getDimension(lair.dimension);
    let loaded = false;
    try {
      loaded = d.isChunkLoaded(lair.den) && d.getBlock(lair.den) !== undefined;
    } catch {
      loaded = false;
    }
    if (lair.built === false) {
      if (loaded) startBuild(d, lair);
      continue;
    }
    let mine = [];
    try {
      mine = entitiesNear(d, lair.den, YETI.respawn.missing, BOSS_TYPES).filter((e) => e.getDynamicProperty(LAIR_PROP) === lair.id);
    } catch {
      mine = [];
    }
    for (const extra of mine.slice(1)) {
      try {
        extra.remove();
      } catch {
        // gone
      }
    }
    const m = missingLooks(misses.get(lair.id) ?? 0, { playerNear: near, denLoaded: loaded, yetis: mine.length });
    if (m >= YETI.respawn.looks) {
      misses.delete(lair.id);
      putYeti(d, lair);
    } else misses.set(lair.id, m);
  }
}
