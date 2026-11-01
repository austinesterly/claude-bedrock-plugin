import { system, MolangVariableMap } from "@minecraft/server";
import { log } from "../core/log.js";
import {
  DRAKE, DRAKE_ACT, DRAKE_BODY, VOID_BOLT, pickDrakeMove, diveHits, drakeHits, guardedPush, boltVelocity, gustSpot,
  nextPerch, circlePoint, angleAround, degreesPerTick, clearOfNest,
} from "./babyDragonRules.js";
import { steer, stopSteer, steering, blockedTicks, pathOpen, roomOver, lineOpen, goingRound } from "./babyDragonMoves.js";
import { boxOpen } from "./mover.js";
import { provoker, fights, targetOf, fightOver, aheadOf, yawOf, restedSince, regen } from "./bossRules.js";
import { fireAt, firing, BABY_FIRE, BABY_FIRE_COLOUR, FIRE_PARTICLE } from "./dragonRules.js";

// A wild Baby Dragon (module 10, 0.1.162; the rules are in animals/babyDragonRules.js, the design in research/boss_plan.md
// "0.1.162 Baby Dragon"): animals/boss.js finds it and its lair, notes the hits and keeps its energy floor, and hands
// each look (every 2 ticks) here. It flies (animals/babyDragonMoves.js steers it a tick at a time: it has no gravity), so
// unlike the yeti and the sloth it has no walking groups: everything it does is here, and what it is doing goes to the
// client through zoocraft:act (and zoocraft:gliding).
// Calm on its nest (on top of its lair's pillar): asleep or awake by its own clock, now and then a plume of violet fire or
// a growl, and at the end of an awake spell now and then up to fly round its lair and back down. Hit (an arrow counts),
// or walked up to under it by someone in Survival who isn't sneaking, it screeches and takes off. In the fight it circles
// its target 10 to 14 out and 5 to 9 up, and every few seconds makes a move you can see coming: the dive (it hangs, wings
// drawn back, then stoops straight at where you stood, and lands there a moment, stunned: hit it then), the void bolt
// (spat from a hover), the wing gust (it swoops down in front of you and beats its wings: a strong push). A push never
// throws anyone off the island (the void guard). At half its energy it roars, slowing everyone near. Worn down to its
// floor it glides down to the clearing at its pillar's foot and lies there panting: its Dragon Crate works then, and left
// alone a minute it gets up rested and flies back to its nest.

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Player} Player */
/** @typedef {{ id: string, x: number, y: number, z: number, mode: string, sneaking: boolean, player: Player, dim: string }} Who */
/**
 * What animals/boss.js lends it: a script hit on a player that lands (its own hits are cancelled otherwise), the boss
 * bar, whether this state is still the boss's, and the tired stamp.
 * @typedef {{ hurt: (p: Player, damage: number, by: Entity) => void, bar: (e: Entity, s: any, on: boolean) => void,
 *   live: (e: Entity, s: any) => boolean, tiredProp: string, clock: () => number }} Ctx
 */

const PROP = "zoocraft:act";
const GLIDE = "zoocraft:gliding";
const A = DRAKE_ACT;
const D = DRAKE;
const Y = /** @type {any} */ (DRAKE); // as bossRules.js's shared rules take a boss's numbers (typed by the yeti's)

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const rad = (d) => (d * Math.PI) / 180;
const span = (/** @type {number[]} */ r) => Math.round(r[0] + Math.random() * (r[1] - r[0]));
const between = (/** @type {number[]} */ r) => r[0] + Math.random() * (r[1] - r[0]);
const ahead = (yaw) => ({ x: -Math.sin(rad(yaw)), z: Math.cos(rad(yaw)) });

// --- Small helpers ------------------------------------------------------------------------------------------------
function sound(e, id, volume = 1, pitch = 1, at = undefined) {
  try {
    e.dimension.playSound(id, at ?? e.location, { volume, pitch });
  } catch {
    // cosmetic only
  }
}

function particle(e, id, at, vars = undefined) {
  try {
    e.dimension.spawnParticle(id, at, vars);
  } catch {
    // cosmetic only
  }
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function setGlide(e, on) {
  if (e.getProperty(GLIDE) !== on) e.setProperty(GLIDE, on);
}

function face(e, yaw) {
  try {
    e.setRotation({ x: 0, y: yaw });
  } catch {
    // next time
  }
}

function put(e, p, yaw) {
  try {
    e.teleport({ x: p.x, y: p.y, z: p.z }, yaw === undefined ? { keepVelocity: false } : { rotation: { x: 0, y: yaw }, keepVelocity: false });
  } catch {
    // stays where it is
  }
}

// The ground under p: the height its feet stand at on the first solid block within `depth` under it, or undefined (the
// void, or not loaded).
function groundBelow(e, p, depth) {
  try {
    const b = e.dimension.getBlockBelow({ x: p.x, y: p.y + 0.5, z: p.z }, { maxDistance: depth, includeLiquidBlocks: true, includePassableBlocks: false });
    return b ? b.location.y + 1 : undefined;
  } catch {
    return undefined;
  }
}

// The void guard (babyDragonRules.js guardedPush): how hard a push `h` along the unit way `dir` may throw someone at `p`:
// full where there is ground under the way they'd go, a nudge where there isn't (or it isn't loaded).
/** @param {import("@minecraft/server").Dimension} dimension */
export function guardKnock(dimension, p, dir, h) {
  const under = (x, y, z) => {
    try {
      return dimension.getBlockBelow({ x, y, z }, { maxDistance: D.voidGuard.depth, includeLiquidBlocks: true, includePassableBlocks: false }) !== undefined;
    } catch {
      return false;
    }
  };
  return guardedPush(under, p, dir, h);
}

// A hit's push on a player ({ x, z, h, v } from the rules: x and z the push along the ground, h its strength), guarded.
function push(e, w, h) {
  const len = Math.hypot(h.x, h.z);
  if (len < 1e-6) return;
  const dir = { x: h.x / len, z: h.z / len };
  const force = guardKnock(e.dimension, w, dir, h.h);
  try {
    w.player.applyKnockback({ x: dir.x * force, z: dir.z * force }, force < h.h ? Math.min(h.v, 0.15) : h.v);
  } catch {
    // gone
  }
}

function hitAll(e, list, who, damage, X) {
  for (const h of list) {
    const w = who.find((x) => x.id === h.id);
    if (!w) continue;
    if (damage) X.hurt(w.player, damage, e);
    push(e, w, h);
  }
}

function flapping(e, s, now, pitch = 1.45) {
  if (now < (s.beatAt ?? 0)) return;
  s.beatAt = now + 16;
  sound(e, "mob.enderdragon.flap", 0.5, pitch);
}

function stamp(e, X) {
  try {
    e.setDynamicProperty(X.tiredProp, X.clock());
  } catch {
    // next time
  }
}

// Where it perches: its lair's nest, else (a spawn egg's) where it first was.
function perchOf(e, s) {
  if (s.site?.nest) return s.site.nest;
  const h = s.home ?? e.location;
  return { x: h.x, y: h.y, z: h.z, yaw: e.getRotation().y };
}

// --- Met ----------------------------------------------------------------------------------------------------------
// First met (or met again after a reload, or after no one was near): on its nest, perched; anywhere else it flies back
// to it. Still tired out (it was tired when last looked after, and not rested since): it glides down and lies panting.
/** @param {Entity} e @param {import("@minecraft/server").EntityHealthComponent | undefined} hp @param {Ctx} X */
export function drakeMeet(e, s, now, hp, X) {
  s.perch = perchOf(e, s);
  stopSteer(e.id, e);
  setGlide(e, false);
  if (hp && hp.currentValue <= D.tiredAt) {
    const at = e.getDynamicProperty(X.tiredProp);
    if (restedSince(at, X.clock(), Y)) {
      hp.resetToMaxValue();
      return toCalm(e, s, now);
    }
    return tiredFall(e, s, now, X, typeof at === "number");
  }
  if (dist3(e.location, s.perch) <= 1.5) return perch(e, s, now, Math.random() < 0.5 ? "sleep" : "awake");
  toCalm(e, s, now);
}

// --- Every look ---------------------------------------------------------------------------------------------------
/**
 * @param {Entity} e @param {any} s its state (animals/boss.js meet) @param {number} now @param {Who[]} who
 * @param {number} energy @param {import("@minecraft/server").EntityHealthComponent} hp @param {{ by: string } | undefined} hit
 * @param {Ctx} X
 */
export function drakeStep(e, s, now, who, energy, hp, hit, X) {
  if (!s.perch) s.perch = perchOf(e, s);
  const at = e.location;
  // Under the world (it never should be: it flies), or far off its leash: back on its nest.
  let bottom = 0;
  try {
    bottom = e.dimension.heightRange.min;
  } catch {
    // the End's
  }
  if (at.y < bottom + 2) {
    X.bar(e, s, false);
    s.angry = false;
    s.target = undefined;
    put(e, s.perch, s.perch.yaw);
    return perch(e, s, now, "awake");
  }
  switch (s.phase) {
    case "calm":
      return calm(e, s, now, who, energy, hp, hit);
    case "roar":
      return roaring(e, s, now, who, X);
    case "fight":
      return fighting(e, s, now, who, energy, X);
    case "move":
      return moving(e, s, now, who, X);
    case "angry":
      return angry(e, s, now, who, X);
    case "tiredfall":
      return tiredFalling(e, s, now);
    case "tired":
      return tiredStep(e, s, now, who, hp, X);
    case "rise":
      if (now >= s.until) toCalm(e, s, now);
      return;
    default:
      toCalm(e, s, now);
  }
}

// --- Calm -----------------------------------------------------------------------------------------------------------
const PERCHED = new Set(["sleep", "awake", "fire"]);

function calm(e, s, now, who, energy, hp, hit) {
  if (energy < D.energy && now > s.regenAt) hp.setCurrentValue(regen(energy, now - s.regenAt, D));
  s.regenAt = now;
  const l = e.location;
  // Who walks up to it: on its nest, measured from the clearing's floor under it (it perches 9 blocks up); or anyone
  // who climbs up to it.
  const up = Boolean(s.site) && PERCHED.has(s.cycle);
  const from = up ? { x: l.x, y: s.site.rest.y, z: l.z } : l;
  const p = hit ? who.find((w) => w.id === hit.by) : provoker(from, who, D.provoke) ?? provoker(l, who, 4);
  if (p && fights(p.mode)) {
    s.target = p.id;
    s.lastHit = now;
    return startRoar(e, s, now, who);
  }
  if (s.cycle === "fire") return fireStep(e, s, now);
  if (s.cycle === "circle") {
    flapping(e, s, now);
    if (now >= s.cycleUntil || !steering(e.id)) startHome(e, s, now);
    return;
  }
  if (s.cycle === "home") return homing(e, s, now);
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 5) return; // the rest every 10 ticks
  keepPerched(e, s);
  if (s.cycle === "awake") {
    if (Math.random() < D.perch.fireChance) return startFire(e, s, now);
    if (Math.random() < D.perch.growlChance) sound(e, "mob.enderdragon.growl", 0.5, 1.7);
  }
  if (now < s.cycleUntil) return;
  const n = nextPerch(s.cycle === "sleep" ? "sleep" : "awake");
  if (n.next === "circle") return startCircle(e, s, now, n.ticks);
  s.cycle = n.next;
  s.cycleUntil = now + n.ticks;
  setAct(e, s.cycle === "sleep" ? A.sleep : A.stand);
}

// Perched on its nest (or where it first was), asleep or awake.
function perch(e, s, now, cycle) {
  stopSteer(e.id, e);
  const n = s.perch;
  if (dist3(e.location, n) > 0.05) put(e, n, n.yaw);
  else face(e, n.yaw);
  s.phase = "calm";
  s.cycle = cycle;
  s.cycleUntil = now + span(cycle === "sleep" ? D.perch.sleepTicks : D.perch.awakeTicks);
  setGlide(e, false);
  setAct(e, cycle === "sleep" ? A.sleep : A.stand);
}

// Kept on its nest (nothing pushes it off: it has no gravity, and a push from a player would leave it hanging in the air).
function keepPerched(e, s) {
  const n = s.perch;
  if (dist3(e.location, n) > 0.3) put(e, n, n.yaw);
  try {
    e.clearVelocity();
  } catch {
    // gone
  }
}

// A plume of violet fire from its nest, out over the clearing (particles only: nothing is lit or hurt).
function startFire(e, s, now) {
  s.cycle = "fire";
  s.fireFrom = now;
  s.whooshed = false;
  setAct(e, A.fire);
}

function fireStep(e, s, now) {
  const t = (now - s.fireFrom) / 20;
  if (!s.whooshed && t >= BABY_FIRE.on) {
    s.whooshed = true;
    sound(e, "mob.ghast.fireball", 0.8, 0.9);
  }
  if (firing(t, BABY_FIRE)) flames(e, s.perch.yaw, t);
  if (now - s.fireFrom < D.perch.fireTicks) return;
  s.cycle = "awake";
  setAct(e, A.stand);
}

function flames(e, yaw, t) {
  const { origin, dir } = fireAt(e.location, yaw, t, 1, BABY_FIRE);
  try {
    const vars = new MolangVariableMap();
    vars.setFloat("variable.dx", dir.x);
    vars.setFloat("variable.dy", dir.y);
    vars.setFloat("variable.dz", dir.z);
    vars.setFloat("variable.r", BABY_FIRE_COLOUR.r);
    vars.setFloat("variable.g", BABY_FIRE_COLOUR.g);
    vars.setFloat("variable.b", BABY_FIRE_COLOUR.b);
    particle(e, FIRE_PARTICLE, origin, vars);
  } catch {
    // cosmetic only
  }
}

// Up off its nest to fly round its lair a while.
function startCircle(e, s, now, ticks) {
  const P = D.perch;
  const c = s.perch;
  const r = between(P.radius);
  const h = between(P.height);
  const dir = Math.random() < 0.5 ? 1 : -1;
  const a0 = angleAround(c, e.location) + 40 * dir;
  const rate = degreesPerTick(P.speed, r) * dir;
  s.cycle = "circle";
  s.cycleUntil = now + ticks;
  setGlide(e, false);
  setAct(e, A.fly);
  sound(e, "mob.enderdragon.flap", 0.7, 1.4);
  steer(e, { goal: (t) => circlePoint(c, a0 + (t - now) * rate, r, h), speed: P.speed, accel: P.accel });
}

// Home: flown to over its nest, then down onto it (hovering, facing out), then perched.
function startHome(e, s, now) {
  const n = s.perch;
  s.cycle = "home";
  s.from = now;
  setGlide(e, false);
  setAct(e, A.fly);
  const l = e.location;
  const d = dist2(l, n);
  if (l.y < n.y + 1 && d < D.land.clear) {
    // Under or beside its nest: out and up, clear of the rim, first.
    const u = d < 0.5 ? ahead(n.yaw) : { x: (l.x - n.x) / d, z: (l.z - n.z) / d };
    s.stage = "out";
    steer(e, { goal: { x: n.x + u.x * D.land.clear, y: n.y + D.land.over, z: n.z + u.z * D.land.clear }, speed: D.perch.speed, accel: D.perch.accel, arrive: 1.5, done: () => {} });
    return;
  }
  overNest(e, s, now);
}

function overNest(e, s, now) {
  const n = s.perch;
  s.stage = "over";
  s.from = now;
  steer(e, { goal: { x: n.x, y: n.y + D.land.over, z: n.z }, speed: D.perch.speed, accel: D.perch.accel, arrive: 1.0, done: () => {} });
}

function homing(e, s, now) {
  const n = s.perch;
  if (steering(e.id) && now - s.from < 600) {
    if (s.stage === "over" || s.stage === "out") flapping(e, s, now);
    return;
  }
  if (s.stage === "out") return overNest(e, s, now);
  if (s.stage === "over" && dist3(e.location, { x: n.x, y: n.y + D.land.over, z: n.z }) <= 2) {
    s.stage = "down";
    s.from = now;
    setAct(e, A.hover);
    steer(e, { goal: n, speed: D.land.speed, accel: 0.03, brake: 2, arrive: 0.2, face: n.yaw, done: () => {} });
    return;
  }
  // Down (or the way was blocked for half a minute: put on it).
  perch(e, s, now, "awake");
}

// --- The fight ----------------------------------------------------------------------------------------------------
// The screech: on its nest it rears up (the art's roar, 2.6 s), in the air it hovers (the air roar, 2.2 s); then its bar
// and the fight.
function startRoar(e, s, now, who) {
  const perched = s.phase === "calm" && PERCHED.has(s.cycle);
  stopSteer(e.id, e);
  s.phase = "roar";
  s.until = now + (perched ? D.roarTicks : D.airRoarTicks);
  setGlide(e, false);
  setAct(e, perched ? A.roar : A.airRoar);
  const t = who.find((w) => w.id === s.target);
  if (t) face(e, yawOf(t.x - e.location.x, t.z - e.location.z));
  sound(e, "mob.enderdragon.growl", 1.6, 1.45);
  system.runTimeout(() => sound(e, "mob.phantom.swoop", 1.2, 0.8), 20);
}

function roaring(e, s, now, who, X) {
  const t = who.find((w) => w.id === s.target);
  if (t && now < s.until - 6) face(e, yawOf(t.x - e.location.x, t.z - e.location.z));
  if (now < s.until) return;
  X.bar(e, s, true);
  s.phase = "fight";
  s.nextMove = now + D.firstMove;
  circle(e, s, now, who);
}

// Circling its target: a point running round them (this far out, this high up, kept within the leash of its nest) that
// it chases, so it swings round them in curves.
function circle(e, s, now, who) {
  const t = who.find((w) => w.id === s.target);
  if (t) s.tpos = { x: t.x, y: t.y, z: t.z };
  if (!s.tpos) return;
  const C = D.circle;
  const r = between(C.radius);
  const h = between(C.height);
  s.dir = s.dir ?? (Math.random() < 0.5 ? 1 : -1);
  const speed = s.angry ? C.speed * 1.2 : C.speed;
  const a0 = angleAround(s.tpos, e.location) + 35 * s.dir;
  const rate = degreesPerTick(speed, r) * s.dir;
  const home = s.perch;
  setGlide(e, false);
  setAct(e, A.fly);
  steer(e, { goal: (tick) => clearOfNest(circlePoint(s.tpos, a0 + (tick - now) * rate, r, h, home, D.leash), s.site?.nest, e.location), speed, accel: C.accel });
}

function fighting(e, s, now, who, energy, X) {
  if (energy <= D.tiredAt) return tiredFall(e, s, now, X);
  const home = s.perch;
  if (fightOver({ home, players: who, now, lastHit: s.lastHit }, Y)) return endFight(e, s, now, X);
  if (!s.angry && energy <= D.angryAt) return startAngry(e, s, now);
  const at = e.location;
  const t = targetOf(at, home, who, D.ring);
  if (!t) return endFight(e, s, now, X);
  s.target = t.id;
  s.tpos = { x: t.x, y: t.y, z: t.z };
  if (!steering(e.id)) circle(e, s, now, who);
  flapping(e, s, now);
  if (now < s.nextMove) return;
  // Going round something (blocked, or on a detour): no move till it is clear (the bench: a bolt started wedged by its
  // pillar held it there for the wind-up, and it spat into its own nest).
  if (goingRound(e.id)) {
    s.nextMove = now + 5;
    return;
  }
  const near = who.filter((w) => fights(w.mode) && dist2(t, w) <= 6).length;
  const d = dist2(at, t);
  let move = pickDrakeMove(d, near);
  // A dive with something in the way (its nest, a pillar, a chorus tree) or a bolt with no clear line to their chest:
  // the other one if it can, or wait (the bench: dives past its pillar were given up a moment after they started; bolts
  // from beside its pillar hit its own lair).
  if (move === "dive" && !diveOk(e, at, t)) move = boltOk(e, at, t) ? "bolt" : undefined;
  else if (move === "bolt" && !boltOk(e, at, t)) move = diveOk(e, at, t) ? "dive" : undefined;
  if (!move) {
    s.nextMove = now + 10;
    return;
  }
  startMove(e, s, now, move, t);
}

// Whether it can dive at `t` from `at` (in reach, and a clear way for its box to where they stand), or spit a bolt at
// them (in reach, and a clear line from its mouth to their chest).
function diveOk(e, at, t) {
  const M = D.moves.dive;
  const d = dist2(at, t);
  return d >= M.min && d <= M.max && pathOpen(e.dimension, at, { x: t.x, y: t.y + 0.05, z: t.z });
}

function boltOk(e, at, t) {
  const M = D.moves.bolt;
  const d = dist2(at, t);
  return d >= M.min && d <= M.max && lineOpen(e.dimension, aheadOf(at, yawOf(t.x - at.x, t.z - at.z), DRAKE_BODY.boltAhead, DRAKE_BODY.boltUp), { x: t.x, y: t.y + 1.2, z: t.z }, M.line);
}

// A move: the dive and the bolt start hovering where it is, turned to its target; the gust first swoops down in front of
// them.
function startMove(e, s, now, move, t) {
  const at = e.location;
  s.phase = "move";
  s.move = move;
  s.from = now;
  s.struck = false;
  s.aim = undefined;
  s.yaw = yawOf(t.x - at.x, t.z - at.z);
  setGlide(e, false);
  if (move === "gust") {
    // Down in front of them on its own side, or the far side, or either flank: the first it can fly straight to with
    // room over it (never under a ledge or its nest's rim: on the bench it hovered under the rim and stuck). None: a bolt.
    const f = ahead(e.getRotation().y);
    const t0 = s.tpos ?? t;
    const dx = at.x - t0.x, dz = at.z - t0.z;
    const dd = Math.hypot(dx, dz);
    const u = dd < 0.5 ? { x: -f.x, z: -f.z } : { x: dx / dd, z: dz / dd };
    const from = (v, p = t0) => ({ x: p.x + v.x * 10, y: p.y, z: p.z + v.z * 10 });
    const side = [u, { x: -u.x, z: -u.z }, { x: -u.z, z: u.x }, { x: u.z, z: -u.x }].find((v) => {
      const spot = gustSpot(t0, from(v), f);
      return pathOpen(e.dimension, at, spot) && roomOver(e.dimension, spot, 3);
    });
    // No way down in front of them: a bolt if it has a clear line, else no move yet (the bench: a bolt in its place from
    // beside its nest hit the nest's rim).
    if (!side) {
      if (boltOk(e, at, t)) return startMove(e, s, now, "bolt", t);
      s.phase = "fight";
      s.move = undefined;
      s.nextMove = now + 10;
      return;
    }
    s.stage = "approach";
    setAct(e, A.fly);
    steer(e, { goal: () => gustSpot(s.tpos, from(side, s.tpos), f), speed: D.moves.gust.speed, accel: 0.06, brake: 3, arrive: 1.2, done: () => {} });
    return;
  }
  s.stage = "wind";
  stopSteer(e.id, e);
  face(e, s.yaw);
  if (move === "dive") {
    setAct(e, A.dive);
    sound(e, "mob.enderdragon.growl", 1.2, 1.9);
  } else {
    setAct(e, A.bolt);
    sound(e, "mob.phantom.idle", 1.2, 0.6);
  }
}

function moving(e, s, now, who, X) {
  const target = who.find((w) => w.id === s.target);
  if (target) s.tpos = { x: target.x, y: target.y, z: target.z };
  if (s.move === "dive") return diving(e, s, now, who, target, X);
  if (s.move === "gust") return gusting(e, s, now, who, target, X);
  const M = D.moves.bolt;
  const at = e.location;
  const t = now - s.from;
  if (!s.struck && target && t < M.strikeAt - 4) s.yaw = yawOf(target.x - at.x, target.z - at.z);
  face(e, s.yaw);
  if (!s.struck && t >= M.strikeAt) {
    s.struck = true;
    spit(e, s, target);
  }
  if (t >= M.ticks) backToFight(e, s, now, who);
}

// The void bolt, from its mouth at their chest (where they stand now: step aside and it misses). It has no gravity.
function spit(e, s, target) {
  const from = aheadOf(e.location, s.yaw, DRAKE_BODY.boltAhead, DRAKE_BODY.boltUp);
  sound(e, "mob.shulker.shoot", 1.5, 0.7, from);
  if (!target) return;
  try {
    const bolt = e.dimension.spawnEntity(VOID_BOLT, from);
    const proj = /** @type {import("@minecraft/server").EntityProjectileComponent | undefined} */ (bolt.getComponent("minecraft:projectile"));
    if (!proj) return void bolt.remove();
    proj.owner = e;
    proj.shoot(boltVelocity(from, { x: target.x, y: target.y + 1.2, z: target.z }), { uncertainty: 0 });
  } catch (error) {
    log(`boss: the void bolt: ${error}`);
  }
}

// The dive: hanging with its wings drawn back (locking on to where they stand a moment before the end), then straight
// down at that spot; anyone within its reach on the way is hit once. It lands where it hit if the ground is close, and
// shakes its head there (stunned) before climbing back.
function diving(e, s, now, who, target, X) {
  const M = D.moves.dive;
  const at = e.location;
  const t = now - s.from;
  if (s.stage === "wind") {
    if (target && t < M.lockAt) {
      s.yaw = yawOf(target.x - at.x, target.z - at.z);
      s.aim = { x: target.x, y: target.y, z: target.z };
    }
    face(e, s.yaw);
    if (t < M.windTicks) return;
    if (!s.aim) return backToFight(e, s, now, who);
    s.stage = "stoop";
    s.stoopFrom = now;
    s.hitDone = new Set();
    setAct(e, A.stoop);
    sound(e, "mob.phantom.swoop", 2.0, 0.8);
    steer(e, { goal: s.aim, speed: M.speed, accel: M.accel, brake: 1.5, arrive: 0.8, done: () => {} });
    return;
  }
  if (s.stage === "stoop") {
    const list = diveHits(at, s.yaw, who, s.hitDone);
    for (const h of list) s.hitDone.add(h.id);
    if (list.length) sound(e, "mob.enderdragon.hit", 1.0, 1.4);
    hitAll(e, list, who, M.damage, X);
    if (steering(e.id) && now - s.stoopFrom < M.maxTicks && blockedTicks(e.id) < 6) return;
    stopSteer(e.id, e);
    const g = groundBelow(e, at, M.ground + 1);
    const spot = g === undefined ? undefined : { x: at.x, y: g, z: at.z };
    if (spot && at.y - g <= M.ground && boxOpen(e.dimension, at, spot, DRAKE_BODY)) {
      put(e, spot, undefined);
      s.stage = "stunned";
      s.until = now + M.stunTicks;
      setAct(e, A.stunned);
      particle(e, "zoocraft:drake_dust", { x: at.x, y: g + 0.1, z: at.z });
      sound(e, "mob.ravager.stun", 1.2, 1.3);
      sound(e, "dig.stone", 1.5, 0.6);
      return;
    }
    return backToFight(e, s, now, who);
  }
  if (now >= s.until) backToFight(e, s, now, who); // stunned on the ground: up again
}

// The wing gust: swooped down in front of them (or as near as it got in a second and a half), it beats its wings
// forward: everyone within its reach in front of it is hit and pushed hard (guarded).
function gusting(e, s, now, who, target, X) {
  const G = D.moves.gust;
  const at = e.location;
  if (s.stage === "approach") {
    flapping(e, s, now);
    if (steering(e.id) && now - s.from < G.approachTicks) return;
    stopSteer(e.id, e);
    s.stage = "beat";
    s.from = now;
    if (target) s.yaw = yawOf(target.x - at.x, target.z - at.z);
    face(e, s.yaw);
    setAct(e, A.gust);
    sound(e, "mob.enderdragon.flap", 1.2, 1.2);
    return;
  }
  const t = now - s.from;
  if (!s.struck && target && t < G.strikeAt - 4) s.yaw = yawOf(target.x - at.x, target.z - at.z);
  face(e, s.yaw);
  if (!s.struck && t >= G.strikeAt) {
    s.struck = true;
    const f = ahead(s.yaw);
    try {
      const vars = new MolangVariableMap();
      vars.setFloat("variable.dx", f.x);
      vars.setFloat("variable.dz", f.z);
      particle(e, "zoocraft:drake_gust", aheadOf(at, s.yaw, 1.5, 0.8), vars);
    } catch {
      // cosmetic only
    }
    sound(e, "wind_charge.burst", 1.6, 0.7);
    sound(e, "mob.enderdragon.flap", 1.6, 0.9);
    hitAll(e, drakeHits("gust", at, s.yaw, who), who, G.damage, X);
  }
  if (t >= G.ticks) backToFight(e, s, now, who);
}

function backToFight(e, s, now, who) {
  s.phase = "fight";
  s.move = undefined;
  s.stage = undefined;
  s.nextMove = now + (s.angry ? D.everyAngry : D.every);
  if (Math.random() < 0.3) s.dir = -(s.dir ?? 1);
  circle(e, s, now, who);
}

// Angry at half: hovering with its wings wide, a roar; everyone near slowed and pushed back (guarded). Quicker after.
function startAngry(e, s, now) {
  stopSteer(e.id, e);
  s.angry = true;
  s.phase = "angry";
  s.from = now;
  s.blasted = false;
  setGlide(e, false);
  setAct(e, A.airRoar);
  sound(e, "mob.enderdragon.growl", 2.0, 1.2);
}

function angry(e, s, now, who, X) {
  const G = D.angry;
  const t = now - s.from;
  const at = e.location;
  const target = who.find((w) => w.id === s.target);
  if (target && t < G.blastAt) face(e, yawOf(target.x - at.x, target.z - at.z));
  if (!s.blasted && t >= G.blastAt) {
    s.blasted = true;
    particle(e, "zoocraft:drake_roar", at);
    sound(e, "mob.enderdragon.growl", 1.5, 0.9);
    const list = drakeHits("angry", at, e.getRotation().y, who);
    for (const h of list) {
      try {
        who.find((w) => w.id === h.id)?.player.addEffect("slowness", G.slowTicks, { amplifier: G.slowLevel, showParticles: true });
      } catch {
        // gone
      }
    }
    hitAll(e, list, who, 0, X);
  }
  if (t >= G.ticks) backToFight(e, s, now, who);
}

function endFight(e, s, now, X) {
  X.bar(e, s, false);
  s.angry = false;
  s.target = undefined;
  s.move = undefined;
  toCalm(e, s, now);
}

// Calm again: home to its nest.
function toCalm(e, s, now) {
  s.phase = "calm";
  s.regenAt = now;
  s.target = undefined;
  startHome(e, s, now);
}

// --- Tired out --------------------------------------------------------------------------------------------------------
// Worn down: its bar gone, it glides down to the clearing at its pillar's foot (a spawn egg's: to the ground under it),
// then lies there panting. It can't be hurt (animals/boss.js) and its crate works (bossCatchBlock).
function tiredFall(e, s, now, X, kept = false) {
  if (!kept) stamp(e, X);
  X.bar(e, s, false);
  s.phase = "tiredfall";
  s.from = now;
  s.move = undefined;
  s.stage = undefined;
  const at = e.location;
  const g = groundBelow(e, at, 48);
  s.rest = s.site?.rest ?? (g !== undefined ? { x: at.x, y: g, z: at.z, yaw: e.getRotation().y } : s.perch);
  setAct(e, A.fly);
  setGlide(e, true);
  sound(e, "mob.enderdragon.growl", 0.8, 0.8);
  steer(e, { goal: s.rest, speed: D.tiredGlide.speed, accel: D.tiredGlide.accel, brake: 3, arrive: 0.5, done: () => {} });
}

function tiredFalling(e, s, now) {
  if (steering(e.id) && now - s.from < D.tiredGlide.giveUp) return;
  stopSteer(e.id, e);
  put(e, s.rest, s.rest.yaw);
  s.phase = "tired";
  s.quietSince = now;
  s.ticks = 0;
  setGlide(e, false);
  setAct(e, A.tired);
  sound(e, "mob.enderdragon.growl", 0.5, 0.7);
}

function tiredStep(e, s, now, who, hp, X) {
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 30 === 0) sound(e, "mob.phantom.idle", 0.4, 0.5); // panting, every 3 seconds
  if (who.some((w) => dist2(w, e.location) <= D.ring)) {
    s.quietSince = now;
    if (s.ticks % 10 === 0) stamp(e, X); // every 2 seconds is close enough
  }
  if (now - s.quietSince < D.recoverTicks) return;
  // Rested: up on its feet with its energy back, then home.
  hp.resetToMaxValue();
  s.angry = false;
  s.phase = "rise";
  s.until = now + D.riseTicks;
  setAct(e, A.stand);
}
