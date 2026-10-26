import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { parkTime, worldDay, dayFor } from "../park/park.js";
import { dayOf } from "../core/clock.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { isNocturnalHouse } from "./nightRules.js";
import { ACT, BEETLE_TYPES, phaseOf, isOut, burrowable, digSound, pickTunnel, hornOf, wrestleKind, winnerOf, facePlaces, awayTargets, besideCells, pairKey, pupaNow, yawTo, stepsAlong, rushTo } from "./beetleRules.js";

// Quartz Beetles (0.1.89, the Nether pair's second; spec 5.3 "Chunky beetle with quartz plates | Burrows through
// mineral substrate | Heated cave, mineral bed"; the rules are in animals/beetleRules.js). Every half second, for the
// beetles near players. A night animal (the world's clock; a dark cave, a nocturnal house, turns it round so guests see
// it out by day): by day it lies buried in the Mineral Substrate (a wild one in netherrack, soul soil, soul sand or
// gravel), only its quartz-plated back showing, now and then tunnelling a few blocks through it; at dusk it digs out
// and goes to the feeder; through the night it walks about (the engine's walking), eats, and two grown males that
// meet wrestle: face to face, tapping horns, the smaller backs off and is chased a few blocks, or, matched, they shove
// and one pries the other up and flips it on its back; the flipped one kicks, rights itself and walks off. No harm
// done. At dawn it goes back to the bed and digs in (with no bed it can get to, it stands still till dusk). Someone in
// Survival or Adventure right up to one on its feet: it rears and hisses, then digs in where it is if it can, or walks
// off. The grubs live buried in the bed (a pale hump), now and then tunnelling a block or two or curling up at the
// surface a moment; one out of the bed crawls back to it; on their pupa days nothing shows; the new beetle digs up out
// of the bed the day it grows up.
// Walking is the engine's (a random stroll, the feeder and the bed sought by move_to_block goals, the tempt); burying,
// tunnelling, the steps onto the bed, the wrestling, walking off and every grub's moving are the script's, a teleport a
// tick (tickBeetleMoves). What it's doing goes to the client through zoocraft:act, a male's horn size through
// zoocraft:horn.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const HORN = "zoocraft:horn";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it leaves them to it
const SPECIES_ID = "zoocraft:quartz_beetle";
const FEED_REACH = 2.5; // stood still this near a feeder it wants, not beside it: it steps beside it
const BED_STEP = 3; // the bed cell it came to taken, or its walk there ended short: it steps to a free one this near
const SHARE_MOVE = 0.1; // in a cell another lies in too: the chance each half second it tunnels off to a free one
const NO_WAY_COOL = 100; // two males with no level way to face off: they don't try again for this long

const state = new Map(); // entity id -> { e, body, seek, mode, act, actUntil, yaw, after, interest, interestUntil, bedBy, cool, hissAgain, hideUntil, freeUntil, from, boutKey, wasOut, bedAt, stillAt }
// bedAt: the bed cell it lies in or is on its way into (posKey), so no two lie in one cell; stillAt: where it stood a
// half second ago.
const moving = new Map(); // entity id -> { e, pts, i, face, act, done }
const bouts = new Map(); // pair key -> { a, b, kind, stage, until, win, lose }
const cooled = new Map(); // pair key -> the tick they may wrestle again
const emerged = new Set(); // "animal id,park day": a new beetle that has dug out today

// Every 10 ticks: the beetles near players.
export function tickBeetles(now) {
  const T = BALANCE.beetle;
  const players = onlinePlayers();
  let time = 18000;
  try {
    time = world.getTimeOfDay();
  } catch {
    // keep the night
  }
  let today = 0;
  try {
    today = worldDay();
  } catch {
    // no park yet
  }
  const seen = new Map(); // id -> entity
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, BEETLE_TYPES);
    } catch {
      continue;
    }
    for (const e of list) if (!seen.has(e.id)) seen.set(e.id, e);
  }
  // All of them met first, so each one's bed cell is held before any of them looks for one.
  const members = [];
  for (const e of seen.values()) {
    try {
      members.push(member(e, now));
    } catch {
      forget(e.id);
    }
  }
  const males = [];
  for (const m of members) {
    try {
      step(m, now, players, time, today, T);
    } catch {
      forget(m.id);
      continue;
    }
    if (m.adult && m.male) males.push(m);
  }
  try {
    wrestling(males, now, players, time, T);
  } catch {
    for (const k of [...bouts.keys()]) endBout(k, now, T);
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
  for (const [k, until] of [...cooled]) if (now > until) cooled.delete(k);
}

function forget(id) {
  const s = state.get(id);
  state.delete(id);
  moving.delete(id);
  if (s?.boutKey) endBout(s.boutKey, system.currentTick, BALANCE.beetle);
  // No one near any more: one in the ground stays there, still, until someone comes again (met again, it carries on
  // buried); one on its feet goes back to its own walking, so it isn't left still where it was.
  const e = s?.e;
  if (!e) return;
  try {
    if (!e.isValid || s.mode === "buried" || s.young) return;
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  } catch {
    // gone
  }
}

// Every tick: glide the beetles tunnelling, stepping onto the bed, wrestling, walking off and the grubs along their steps.
export function tickBeetleMoves() {
  for (const [id, m] of [...moving]) {
    let valid = false;
    try {
      valid = m.e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      const p = m.pts[m.i++];
      m.e.teleport({ x: p.x, y: m.e.location.y, z: p.z }, { rotation: { x: 0, y: p.yaw ?? m.face }, keepVelocity: false });
      setAct(m.e, m.act);
      if (m.i < m.pts.length) continue;
      moving.delete(id);
      m.done();
    } catch {
      moving.delete(id);
    }
  }
}

// ---------------- the beetle ----------------
function member(e, now) {
  let s = state.get(e.id);
  if (!s) {
    s = { e, mode: "out", act: ACT.none, actUntil: 0, interest: "wander", interestUntil: 0, cool: 0, hissAgain: 0, hideUntil: 0, freeUntil: 0 };
    state.set(e.id, s);
    // Met (again): buried where it was left, if it was (the act stays with the mob); a grub as it was; else on its feet
    // with its own walking, so it's never stuck still without it.
    const was = e.getProperty(PROP);
    if (was === ACT.buried || was === ACT.tunnel) {
      s.mode = "buried";
      s.bedAt = bedKey(e, cellOf(e.location));
      s.yaw = e.getRotation().y;
      body(e, s, "still");
      seek(e, s, "none");
      setAct(e, ACT.buried);
    } else if (!isBaby(e)) {
      body(e, s, "move");
      seek(e, s, "none");
      setAct(e, ACT.none);
    } else s.bedAt = bedKey(e, cellOf(e.location)); // a grub holds the cell it lies in (grubStep moves it if it's shared)
  }
  s.e = e;
  const a = animalFromEntity(e);
  const adult = a ? !a.juvenile : !isBaby(e);
  const male = adult && (a ? a.sex === "male" : markOf(e) === 1);
  // His horn, short to long, set the first time he's met.
  if (male && e.getProperty(HORN) === 0) e.setProperty(HORN, hornOf(a?.id ?? e.id));
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  return { id: e.id, e, a, s, adult, male, ex, wild: !ex };
}

function step(m, now, players, time, today, T) {
  const { e, s, a, ex } = m;
  if (a) today = dayFor(a); // 0.1.114: its exhibit's park's day
  if (!m.adult) return grubStep(m, now, T);
  s.young = false;
  if (moving.has(m.id) || s.boutKey) return;
  const phase = phaseOf(time, T, ex ? isNocturnalHouse(ex, BALANCE) : false);
  const out = isOut(phase);
  // Dusk: out to the feeder first.
  if (out && !s.wasOut) {
    s.interest = "feeder";
    s.interestUntil = now + T.interestTicks;
  }
  s.wasOut = out;
  // A new beetle out of its pupa (it grew up today): it digs up out of the bed, and walks about a while.
  if (a && a.emergedDay === today && !emerged.has(`${a.id},${today}`)) {
    if (emerged.size > 200) emerged.clear();
    emerged.add(`${a.id},${today}`);
    s.freeUntil = now + T.newOutTicks;
    return digOut(m, now, T);
  }
  if (s.mode === "act") {
    if (now < s.actUntil) return acting(m);
    return finished(m, now, T);
  }
  if (s.mode === "buried") {
    setAct(e, ACT.buried);
    if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
    if (out && now >= s.hideUntil) return digOut(m, now, T);
    // Two in one cell (met again so, or more of them than the bed has cells): now and then one tunnels off to a free one.
    if ((taken(m, cellOf(e.location)) && Math.random() < SHARE_MOVE) || Math.random() < T.tunnelChance) tunnel(m, now, T);
    return;
  }
  // On its feet.
  if (hiss(m, now, players, T)) return;
  if (now < s.cool || !e.isOnGround) return;
  // Stood still since the last half second (the engine's walk ended, or it stays at a goal).
  const at = { x: e.location.x, z: e.location.z };
  const still = Boolean(s.stillAt && Math.hypot(at.x - s.stillAt.x, at.z - s.stillAt.z) < 0.05);
  s.stillAt = at;
  if (!out && now >= s.freeUntil) return toBed(m, now, T, still);
  s.bedBy = undefined;
  if (tempted(e, players)) return;
  forage(m, now, T, still);
}

// Out walking: the engine walks it (a random stroll); now and then it heads for the feeder and eats there.
function forage(m, now, T, still) {
  const { e, s, ex } = m;
  body(e, s, "move");
  setAct(e, ACT.none);
  if (now >= s.interestUntil) {
    s.interest = Math.random() < T.feederChance ? "feeder" : "wander";
    s.interestUntil = now + T.interestTicks + Math.floor(Math.random() * T.interestTicks);
  }
  const food = s.interest === "feeder" && feederIn(ex);
  seek(e, s, food ? "feeder" : "none");
  if (!food) return;
  const here = cellOf(e.location);
  if (tryEat(m, here, ex, now, T)) {
    s.interestUntil = 0;
    return;
  }
  // The engine's walk to the feeder ends goal_radius from wherever move_to_block puts its target point, which can be
  // short of the cells beside it: stood still there, it steps beside it.
  if (still) toFeeder(m, here, ex, now, T);
}

// Within FEED_REACH of a feeder of its exhibit with food it eats, but not beside it: a step to the nearest cell beside it
// it can get to all the way, and it eats there.
function toFeeder(m, here, ex, now, T) {
  const { e, s } = m;
  for (const id of ex?.feederIds ?? []) {
    const rec = db.get("equipment", id);
    if (!rec?.pos || rec.dimension !== e.dimension.id || rec.pos.y !== here.y || !edible(rec)) continue;
    if (Math.hypot(rec.pos.x + 0.5 - e.location.x, rec.pos.z + 0.5 - e.location.z) > FEED_REACH) continue;
    for (const c of besideCells(rec.pos, e.location).slice(0, 5)) {
      if (!open(e, c)) continue;
      const to = { x: c.x + 0.5, z: c.z + 0.5 };
      const way = wayTo(m, to, T.stepPace);
      if (!way.whole) continue;
      body(e, s, "still");
      seek(e, s, "none");
      s.mode = "walk";
      return glide(m, way.pts, yawTo(to.x - e.location.x, to.z - e.location.z), ACT.scurry, () => {
        const t = system.currentTick;
        settle(m, t, T);
        if (tryEat(m, cellOf(e.location), ex, t, T)) s.interestUntil = 0;
      });
    }
  }
}

// Dawn: to the bed, and into it once it's on it (a step onto it first, if the walk there ended beside it, or onto a free
// cell of it near, if it came to one another beetle lies in or its walk ended short: two in one cell only when there are
// more of them than cells). With no bed it can get to in seekTicks, it stands still where it is a while, then looks
// again.
function toBed(m, now, T, still) {
  const { e, s } = m;
  const here = cellOf(e.location);
  const onBed = burrowable(idAt(e, below(e)), m.wild);
  const bed = bedUnder(m, here) ?? (onBed || still ? freeBedNear(m, here, T) : undefined);
  if (bed) return intoBed(m, now, T, here, bed);
  body(e, s, "move");
  setAct(e, ACT.none);
  seek(e, s, "bed");
  if (s.bedBy === undefined) s.bedBy = now + T.seekTicks;
  if (now >= s.bedBy) {
    s.bedBy = undefined;
    // Every bed cell near it taken (more of them than the bed has cells): it digs in beside another rather than stand
    // all day.
    const shared = onBed ? here : freeBedNear(m, here, T, true);
    if (shared) return intoBed(m, now, T, here, shared);
    startAct(m, now, ACT.none, T.restTicks, undefined, "settle");
  }
}

// Into the bed cell: a dig where it stands, or a step onto it, then the dig.
function intoBed(m, now, T, here, bed) {
  const { e, s } = m;
  s.bedBy = undefined;
  seek(e, s, "none");
  if (bed === here) return dig(m, now, T);
  body(e, s, "still");
  s.mode = "walk";
  s.bedAt = bedKey(e, bed); // on its way into it: no one else digs in there
  glide(m, wayTo(m, { x: bed.x + 0.5, z: bed.z + 0.5 }, T.stepPace).pts, yawTo(bed.x + 0.5 - e.location.x, bed.z + 0.5 - e.location.z), ACT.scurry, () => {
    const t = system.currentTick;
    const c = cellOf(e.location);
    if (c.x === bed.x && c.z === bed.z) dig(m, t, T);
    else settle(m, t, T);
  });
}

function dig(m, now, T) {
  m.s.bedAt = bedKey(m.e, cellOf(m.e.location));
  sound(m.e, digSound(idAt(m.e, below(m.e))), 0.5, 1.2);
  startAct(m, now, ACT.dig, T.digTicks, undefined, "buried");
}

function digOut(m, now, T) {
  sound(m.e, digSound(idAt(m.e, below(m.e))), 0.5, 1.1);
  startAct(m, now, ACT.emerge, T.emergeTicks, m.s.yaw, "settle");
}

// Buried: a few blocks through the bed to another spot in it, in a straight line, the back sliding through the floor.
function tunnel(m, now, T) {
  const { e, s } = m;
  const to = tunnelTo(m, T.tunnelNear, T.tunnelFar, T.tunnelPace);
  if (!to) return;
  const from = { x: e.location.x, z: e.location.z };
  const end = { x: to.x + 0.5, z: to.z + 0.5 };
  const yaw = yawTo(end.x - from.x, end.z - from.z);
  s.yaw = yaw;
  s.bedAt = bedKey(e, to);
  sound(e, digSound(idAt(e, below(e))), 0.35, 1.0);
  glide(m, stepsAlong(from, end, T.tunnelPace), yaw, ACT.tunnel, () => setAct(e, ACT.buried));
}

// A bed cell `near` to `far` blocks off with no other beetle lying in it (any of them, pickTunnel) it can get to in a
// straight line through the bed at `pace` a tick, as it will glide (at every point of the way the bed under its middle,
// open over it at its level; every cell its body covers open), or undefined. { x, y, z }. The way may pass under
// another one buried (a moment): only where it ends must be its own, so one in a shared cell is never shut in.
function tunnelTo(m, near, far, pace) {
  const e = m.e;
  const here = cellOf(e.location);
  const ok = new Map();
  const isBed = (x, z) => {
    const k = `${x},${z}`;
    if (!ok.has(k)) ok.set(k, open(e, { x, y: here.y, z }) && burrowable(idAt(e, { x, y: here.y - 1, z }), m.wild));
    return ok.get(k);
  };
  const cands = [];
  const r = Math.ceil(far);
  for (let dx = -r; dx <= r; dx++) for (let dz = -r; dz <= r; dz++) if ((dx || dz) && dx * dx + dz * dz <= far * far) cands.push({ x: here.x + dx, z: here.z + dz });
  const from = { x: e.location.x, z: e.location.z };
  const half = halfOf(m);
  // Distances cell to cell (the candidates are whole cells off this one), checked in pickTunnel's random order so only
  // the ways it might take are walked.
  const left = cands.filter((c) => isBed(c.x, c.z) && !taken(m, { x: c.x, y: here.y, z: c.z }));
  for (;;) {
    const to = pickTunnel(left, here, near, far);
    if (!to) return undefined;
    const line = stepsAlong(from, { x: to.x + 0.5, z: to.z + 0.5 }, pace);
    if (line.every((p) => isBed(Math.floor(p.x), Math.floor(p.z))) && levelWay(e, line, half)) return { x: to.x, y: here.y, z: to.z };
    left.splice(left.indexOf(to), 1);
  }
}

// ---------------- the hiss ----------------
// Someone in Survival or Adventure within hissRange of it on its feet (not tempting it): it rears and hisses at them,
// then digs in where it is if it's on its bed, or walks off. At most once each hissAgain.
function hiss(m, now, players, T) {
  const { e, s } = m;
  if (now < s.hissAgain) return false;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !survival(p) || tempting(p)) continue;
      const l = p.location;
      if (Math.hypot(l.x - e.location.x, l.z - e.location.z) > T.hissRange || Math.abs(l.y - e.location.y) > 2) continue;
      s.hissAgain = now + T.hissAgain;
      s.from = { x: l.x, z: l.z };
      sound(e, "mob.cat.hiss", 0.5, 1.5);
      startAct(m, now, ACT.hiss, T.hissTicks, yawTo(l.x - e.location.x, l.z - e.location.z), "hissed");
      return true;
    } catch {
      // gone
    }
  }
  return false;
}

// ---------------- the males ----------------
// Two grown males out walking (not busy, the same exhibit or both wild) within meetRange of each other: now and then
// they wrestle (once each wrestleCool for a pair). The bouts already going go on.
function wrestling(males, now, players, time, T) {
  for (const [k, b] of [...bouts]) boutStep(k, b, now, T);
  const free = males.filter((m) => {
    const s = m.s;
    if (s.mode !== "out" || s.boutKey || moving.has(m.id) || now < s.cool || !m.e.isOnGround) return false;
    return isOut(phaseOf(time, T, m.ex ? isNocturnalHouse(m.ex, BALANCE) : false)) && !tempted(m.e, players);
  });
  for (let i = 0; i < free.length; i++) {
    const a = free[i];
    if (a.s.boutKey) continue;
    for (let j = i + 1; j < free.length; j++) {
      const b = free[j];
      if (b.s.boutKey || a.e.dimension.id !== b.e.dimension.id || (a.ex?.id ?? "wild") !== (b.ex?.id ?? "wild")) continue;
      const d = Math.hypot(a.e.location.x - b.e.location.x, a.e.location.z - b.e.location.z);
      const k = pairKey(a.id, b.id);
      if (d > T.meetRange || Math.abs(a.e.location.y - b.e.location.y) > 0.5 || cooled.has(k) || Math.random() >= T.wrestleChance) continue;
      if (startBout(k, a, b, now, T)) break;
      cooled.set(k, now + NO_WAY_COOL);
    }
  }
}

// Into place: each steps to its side of their middle, faceGap apart, and turns to face the other. Only with a level way
// for each all the way there and open ground between the two places (not with the feeder or a rock between them): true
// when they start.
function startBout(k, a, b, now, T) {
  const places = facePlaces(a.e.location, b.e.location, T.faceGap);
  const ways = [[a, places.a], [b, places.b]].map(([m, p]) => ({ m, p, way: wayTo(m, p, T.stepPace) }));
  if (!ways.every((w) => w.way.whole) || !levelWay(a.e, stepsAlong(places.a, places.b, 0.1), halfOf(a))) return false;
  const bout = { a, b, kind: wrestleKind(hornAt(a), hornAt(b)), stage: "close", until: now + 60 };
  bouts.set(k, bout);
  for (const { m, p, way } of ways) {
    m.s.boutKey = k;
    m.s.mode = "bout";
    body(m.e, m.s, "still");
    seek(m.e, m.s, "none");
    glide(m, way.pts, p.yaw, ACT.scurry, () => {
      m.s.yaw = p.yaw;
      setAct(m.e, ACT.face);
    });
  }
  return true;
}

function boutStep(k, bout, now, T) {
  const { a, b } = bout;
  if (![a, b].every((m) => state.get(m.id) === m.s && m.e.isValid)) return endBout(k, now, T);
  if ([a, b].some((m) => moving.has(m.id))) {
    if (now > bout.until + 200) endBout(k, now, T); // stuck on the way
    return;
  }
  const face = () => {
    for (const [m, o] of [[a, b], [b, a]]) m.s.yaw = yawTo(o.e.location.x - m.e.location.x, o.e.location.z - m.e.location.z);
  };
  const hold = (m, act) => {
    setAct(m.e, act);
    if (m.s.yaw !== undefined) m.e.setRotation({ x: 0, y: m.s.yaw });
  };
  if (bout.stage === "close") {
    // Face to face, tapping horns.
    face();
    bout.stage = "face";
    bout.until = now + between(T.faceTicks);
  }
  if (bout.stage === "face") {
    hold(a, ACT.face);
    hold(b, ACT.face);
    if (Math.random() < 0.4) sound(a.e, "hit.bone_block", 0.35, 1.7);
    if (now < bout.until) return;
    const w = winnerOf(hornAt(a), hornAt(b)) === "a" ? a : b;
    bout.win = w;
    bout.lose = w === a ? b : a;
    if (bout.kind === "standoff") return backOff(k, bout, now, T);
    bout.stage = "shove";
    bout.until = now + between(T.shoveTicks);
  }
  if (bout.stage === "shove") {
    hold(a, ACT.shove);
    hold(b, ACT.shove);
    if (Math.random() < 0.3) sound(a.e, "hit.bone_block", 0.45, 1.2);
    if (now < bout.until) return;
    // The winner gets his horn under the other and pries him up; over he goes.
    bout.stage = "flip";
    bout.until = now + between(T.flipTicks);
    sound(bout.lose.e, "hit.bone_block", 0.7, 0.9);
    bout.pryUntil = now + T.pryTicks;
  }
  if (bout.stage === "flip") {
    hold(bout.win, now < bout.pryUntil ? ACT.pry : ACT.face);
    hold(bout.lose, ACT.flipped);
    if (now < bout.until) return;
    bout.stage = "right";
    bout.until = now + T.rightTicks;
  }
  if (bout.stage === "right") {
    hold(bout.win, ACT.none);
    hold(bout.lose, ACT.righting);
    if (now < bout.until) return;
    return backOff(k, bout, now, T, false);
  }
  if (bout.stage === "away" && now >= bout.until) endBout(k, now, T);
}

// The loser goes off backOff blocks from the winner (offWay: round a wall or the feeder in the way); after a standoff the
// winner chases him a few blocks. Boxed in, he stays where he is.
function backOff(k, bout, now, T, chase = true) {
  const { win, lose } = bout;
  bout.stage = "away";
  bout.until = now + 10;
  const way = offWay(lose, win.e.location, T.backOff, T.scurryPace) ?? { pts: [], yaw: lose.s.yaw };
  glide(lose, way.pts, way.yaw, ACT.scurry, () => setAct(lose.e, ACT.none));
  if (!chase || !way.pts.length) return setAct(win.e, ACT.none);
  const end = way.pts[way.pts.length - 1];
  const after = rushTo(win.e.location, end, T.chaseShort);
  const chaseWay = after.length >= 0.5 ? wayTo(win, after, T.chasePace) : { pts: [] };
  glide(win, chaseWay.pts, after.yaw, ACT.scurry, () => setAct(win.e, ACT.none));
}

function endBout(k, now, T) {
  const bout = bouts.get(k);
  bouts.delete(k);
  cooled.set(k, now + T.wrestleCool);
  if (!bout) return;
  for (const m of [bout.a, bout.b]) {
    if (m.s.boutKey !== k) continue;
    m.s.boutKey = undefined;
    moving.delete(m.id);
    try {
      if (m.e.isValid) settle(m, now, T);
    } catch {
      // gone
    }
  }
}

function hornAt(m) {
  try {
    return m.e.getProperty(HORN) || 2;
  } catch {
    return 2;
  }
}

// ---------------- the grubs ----------------
// Buried in the bed (a pale hump), now and then tunnelling a block or two through it or curling up at the surface a
// moment; one out of the bed crawls to the nearest it can get to. On its pupa days it lies in its cell (nothing shows).
// Each in a cell of its own: one in a cell another beetle lies in tunnels to a free one. A grub never walks by itself:
// it's still, and moved by the script.
function grubStep(m, now, T) {
  const { e, s, a } = m;
  s.young = true;
  body(e, s, "still");
  seek(e, s, "none");
  if (moving.has(m.id)) return;
  const here = cellOf(e.location);
  if (a && pupaNow(a, SPECIES[SPECIES_ID])) {
    s.mode = "pupa";
    s.bedAt = bedKey(e, here);
    return setAct(e, ACT.pupa);
  }
  if (s.mode === "act") {
    if (now < s.actUntil) return acting(m);
    s.mode = "grub";
  }
  if (burrowable(idAt(e, { ...here, y: here.y - 1 }), m.wild)) {
    s.mode = "grub";
    setAct(e, ACT.grub);
    if (taken(m, here) && Math.random() < SHARE_MOVE) {
      const to = tunnelTo(m, 1, BED_STEP, T.grubPace);
      if (to) {
        s.bedAt = bedKey(e, to);
        const from = { x: e.location.x, z: e.location.z };
        const end = { x: to.x + 0.5, z: to.z + 0.5 };
        return glide(m, stepsAlong(from, end, T.grubPace), yawTo(end.x - from.x, end.z - from.z), ACT.grub, () => setAct(e, ACT.grub));
      }
    }
    s.bedAt = bedKey(e, here);
    if (Math.random() < T.peekChance) {
      sound(e, "mob.armadillo.peek", 0.3, 1.7);
      return startAct(m, now, ACT.peek, T.peekTicks, undefined, "grub");
    }
    if (Math.random() < T.grubTunnelChance) {
      const to = tunnelTo(m, 1, T.grubTunnel, T.grubPace);
      if (to) {
        s.bedAt = bedKey(e, to);
        const from = { x: e.location.x, z: e.location.z };
        const end = { x: to.x + 0.5, z: to.z + 0.5 };
        glide(m, stepsAlong(from, end, T.grubPace), yawTo(end.x - from.x, end.z - from.z), ACT.grub, () => setAct(e, ACT.grub));
      }
    }
    return;
  }
  // Out of the bed: to the nearest free bed cell it can crawl to in a straight line, at most each grubLook.
  s.bedAt = undefined;
  setAct(e, ACT.peek);
  if (now < (s.crawlLook ?? 0)) return;
  s.crawlLook = now + T.grubLook;
  const beds = [];
  for (let dx = -T.grubReach; dx <= T.grubReach; dx++) {
    for (let dz = -T.grubReach; dz <= T.grubReach; dz++) {
      const c = { x: here.x + dx, y: here.y, z: here.z + dz };
      if ((dx || dz) && open(e, c) && burrowable(idAt(e, { ...c, y: c.y - 1 }), m.wild) && !taken(m, c)) beds.push(c);
    }
  }
  beds.sort((p, q) => Math.hypot(p.x - here.x, p.z - here.z) - Math.hypot(q.x - here.x, q.z - here.z));
  for (const c of beds.slice(0, 6)) {
    const way = wayTo(m, { x: c.x + 0.5, z: c.z + 0.5 }, T.grubPace);
    if (!way.whole) continue;
    s.mode = "crawl";
    s.bedAt = bedKey(e, c);
    return glide(m, way.pts, yawTo(c.x + 0.5 - e.location.x, c.z + 0.5 - e.location.z), ACT.crawl, () => {
      s.mode = "grub";
      setAct(e, ACT.grub);
    });
  }
}

// ---------------- moving it ----------------
// Every cell its body covers along the way open at its level, and the cell under its middle a floor. `half`: half its
// width.
function levelWay(e, pts, half) {
  const read = blockReader(e.dimension);
  const y = Math.floor(e.location.y + 0.01);
  const h = half - 0.01;
  const seen = new Set();
  for (const p of pts) {
    for (let x = Math.floor(p.x - h); x <= Math.floor(p.x + h); x++) {
      for (let z = Math.floor(p.z - h); z <= Math.floor(p.z + h); z++) {
        const k = `${x},${z}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (read(x, y, z) !== "air") return false;
      }
    }
    const under = read(Math.floor(p.x), y - 1, Math.floor(p.z));
    if (under === "air" || under === "water" || under === "lava" || under === "unloaded" || under === "gate_open") return false;
  }
  return true;
}

// Half its body's width: a male's box is 0.5 wide, a female's 0.85 of his, a grub's 0.35 (the entity files).
function halfOf(m) {
  return !m.adult ? 0.17 : m.male ? 0.25 : 0.21;
}

// The way from where it is to `to` ({ x, z }) at `pace` a tick over open, level ground: straight or, with something in
// the way, round it by one corner off to a side of where the straight way is blocked; else straight as far as it gets.
// { pts, whole }: whole when it gets all the way.
function wayTo(m, to, pace) {
  const from = { x: m.e.location.x, z: m.e.location.z };
  if (Math.hypot(to.x - from.x, to.z - from.z) < 0.05) return { pts: [], whole: true };
  const half = halfOf(m);
  const all = stepsAlong(from, to, pace);
  let n = 0;
  while (n < all.length && levelWay(m.e, [all[n]], half)) n++;
  if (n === all.length) return { pts: all, whole: true };
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  const blocked = all[n];
  for (const off of [1, -1, 1.5, -1.5, 2, -2]) {
    const c = { x: blocked.x - (dz / len) * off, z: blocked.z + (dx / len) * off };
    const a = stepsAlong(from, c, pace);
    const b = stepsAlong(c, to, pace);
    if (!levelWay(m.e, a, half) || !levelWay(m.e, b, half)) continue;
    const ya = yawTo(c.x - from.x, c.z - from.z);
    const yb = yawTo(to.x - c.x, to.z - c.z);
    return { pts: [...a.map((q) => ({ ...q, yaw: ya })), ...b.map((q) => ({ ...q, yaw: yb }))], whole: true };
  }
  return { pts: all.slice(0, n), whole: false };
}

// The way it goes off from `other` ({ x, z }), `far` blocks at `pace` a tick: straight away or, with something in the
// way, the first way clear turned up to 90 degrees either side (beetleRules.js awayTargets); boxed in, the way that gets
// it farthest from `other`, as far as it goes, or undefined when none gets it half a block farther. { pts, yaw }.
function offWay(m, other, far, pace) {
  const from = { x: m.e.location.x, z: m.e.location.z };
  const half = halfOf(m);
  let best;
  let most = Math.hypot(from.x - other.x, from.z - other.z) + 0.5;
  for (const to of awayTargets(from, other, far)) {
    const all = stepsAlong(from, to, pace);
    let n = 0;
    while (n < all.length && levelWay(m.e, [all[n]], half)) n++;
    if (n === all.length) return { pts: all, yaw: to.yaw };
    const end = n ? all[n - 1] : from;
    const d = Math.hypot(end.x - other.x, end.z - other.z);
    if (d > most) {
      most = d;
      best = { pts: all.slice(0, n), yaw: to.yaw };
    }
  }
  return best;
}

function glide(m, pts, face, act, done) {
  if (!pts.length) return done();
  m.s.yaw = face;
  moving.set(m.id, { e: m.e, pts, i: 0, face, act, done });
}

// ---------------- what it does ----------------
function startAct(m, now, act, ticks, yaw, after) {
  const { e, s } = m;
  s.mode = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.after = after;
  if (yaw !== undefined) s.yaw = yaw;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
}

// While it digs, eats or hisses: as it was, with the sounds that go with it.
function acting(m) {
  const { e, s } = m;
  if (s.yaw !== undefined && s.act !== ACT.none) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if ((s.act === ACT.dig || s.act === ACT.emerge) && Math.random() < 0.4) sound(e, digSound(idAt(e, below(e))), 0.35, 1.2);
  else if (s.act === ACT.eat && Math.random() < 0.25) sound(e, "mob.armadillo.eat", 0.3, 1.4);
  else if (s.act === ACT.hiss && Math.random() < 0.3) sound(e, "mob.cat.hiss", 0.35, 1.6);
}

// An act run its time: buried once it has dug in; on its feet after the rest; after the hiss into its bed if it's on
// one (and kept there hideTicks), else off from whoever it hissed at.
function finished(m, now, T) {
  const { e, s } = m;
  const after = s.after;
  s.after = undefined;
  if (after === "buried") {
    s.mode = "buried";
    s.act = ACT.buried;
    return setAct(e, ACT.buried);
  }
  if (after === "hissed") {
    const here = cellOf(e.location);
    if (bedUnder(m, here) === here) {
      s.hideUntil = now + T.hideTicks;
      return dig(m, now, T);
    }
    const way = s.from ? offWay(m, s.from, T.walkOff, T.scurryPace) : undefined;
    s.from = undefined;
    if (way) {
      s.mode = "walk";
      return glide(m, way.pts, way.yaw, ACT.scurry, () => settle(m, system.currentTick, T));
    }
  }
  settle(m, now, T);
}

// Back on its feet, walking where the engine takes it.
function settle(m, now, T) {
  const { e, s } = m;
  s.mode = "out";
  s.bedAt = undefined;
  s.act = ACT.none;
  s.yaw = undefined;
  s.cool = now + T.coolTicks;
  body(e, s, "move");
  setAct(e, ACT.none);
}

// ---------------- around it ----------------
const EDGE = 0.4;
// The bed cell under its body (the one it stands in, or one at its side within EDGE of its middle: a move_to_block
// goal ends goal_radius from the block's middle, which can be on the block beside it), open at its level, with no other
// beetle lying in it; undefined.
function bedUnder(m, here) {
  const e = m.e;
  const l = e.location;
  const cells = [here];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const c = { x: here.x + dx, y: here.y, z: here.z + dz };
      const nx = Math.max(c.x, Math.min(l.x, c.x + 1));
      const nz = Math.max(c.z, Math.min(l.z, c.z + 1));
      if (Math.hypot(nx - l.x, nz - l.z) <= EDGE) cells.push(c);
    }
  }
  return cells.find((c) => burrowable(idAt(e, { ...c, y: c.y - 1 }), m.wild) && (c === here || open(e, c)) && !taken(m, c));
}

// The nearest bed cell within BED_STEP blocks it can step to all the way, open, with no other beetle lying in it (for
// one that came to a cell of the bed another lies in, or ended its walk a little off it); undefined. `shared`, with
// every one taken: the one fewest lie in.
function freeBedNear(m, here, T, shared = false) {
  const e = m.e;
  const cells = [];
  for (let dx = -BED_STEP; dx <= BED_STEP; dx++) for (let dz = -BED_STEP; dz <= BED_STEP; dz++) if (dx || dz) cells.push({ x: here.x + dx, y: here.y, z: here.z + dz });
  const d = (c) => Math.hypot(c.x + 0.5 - e.location.x, c.z + 0.5 - e.location.z);
  cells.sort((p, q) => d(p) - d(q));
  let best;
  for (const c of cells) {
    if (d(c) > BED_STEP || !open(e, c) || (!shared && taken(m, c)) || !burrowable(idAt(e, { ...c, y: c.y - 1 }), m.wild)) continue;
    if (!wayTo(m, { x: c.x + 0.5, z: c.z + 0.5 }, T.stepPace).whole) continue;
    if (!shared) return c;
    // Sharing: the cell fewest lie in, the nearest of those.
    const n = lying(m, c);
    if (!best || n < best.n) best = { c, n };
  }
  return best?.c;
}

// The bed cell one lies in (or is digging into, or tunnelling or crawling to): its claim, so no two lie in one cell.
function bedKey(e, c) {
  return posKey(e.dimension.id, c);
}

// The bed cells the beetles near players lie in or are on their way into ("x,y,z"), in a dimension: a grub hatches in
// none of them (animals/nursery.js).
export function heldBeds(dimensionId) {
  const out = new Set();
  const pre = `${dimensionId}|`;
  for (const s of state.values()) if (s.bedAt?.startsWith(pre)) out.add(s.bedAt.slice(pre.length).split("|").join(","));
  return out;
}

// Another beetle lies in that cell (or is on its way into it).
function taken(m, c) {
  return lying(m, c) > 0;
}

// How many other beetles lie in that cell (or are on their way into it).
function lying(m, c) {
  const k = bedKey(m.e, c);
  let n = 0;
  for (const [id, o] of state) if (id !== m.id && o.bedAt === k) n++;
  return n;
}

function open(e, c) {
  return blockReader(e.dimension)(c.x, c.y, c.z) === "air";
}

const idAt = (e, pos) => {
  try {
    return e.dimension.getBlock(pos)?.typeId;
  } catch {
    return undefined;
  }
};

function below(e) {
  const c = cellOf(e.location);
  return { x: c.x, y: c.y - 1, z: c.z };
}

// Head down at a feeder beside it in its exhibit with food it eats.
function tryEat(m, here, ex, now, T) {
  const e = m.e;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const pos = { x: here.x + dx, y: here.y, z: here.z + dz };
      const rec = db.get("equipment", posKey(e.dimension.id, pos));
      if (rec?.type === "feeder" && (ex?.feederIds ?? []).includes(rec.id) && edible(rec)) {
        startAct(m, now, ACT.eat, T.eatTicks, yawTo(dx, dz), "settle");
        return true;
      }
    }
  }
  return false;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES[SPECIES_ID].dietTags.includes(RATIONS[rec.item]?.diet));
}

const survival = (p) => {
  try {
    const m = String(p.getGameMode()).toLowerCase();
    return m === "survival" || m === "adventure";
  } catch {
    return false;
  }
};

// Someone holding its food (or a nether quartz) or an empty carrier: they're tempting or catching it.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return BALANCE.beetle.bait.includes(id) || carrierByItem(id)?.full === false;
}

function tempted(e, players) {
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !tempting(p)) continue;
      if (Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z) <= TEMPT_RANGE) return true;
    } catch {
      // gone
    }
  }
  return false;
}

// ---------------- the mob ----------------
// Its body: "move" (walking) or "still" (buried, digging, wrestling, glided by the script). Each event swaps the other
// group out, and both hold the walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "feeder", "bed" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function markOf(e) {
  try {
    return e.getComponent("minecraft:mark_variant")?.value ?? 0;
  } catch {
    return 0;
  }
}

function isBaby(e) {
  try {
    return Boolean(e.getComponent("minecraft:is_baby"));
  } catch {
    return false;
  }
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}
