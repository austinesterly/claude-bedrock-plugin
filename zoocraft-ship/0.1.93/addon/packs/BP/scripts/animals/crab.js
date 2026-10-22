import { system, world, MolangVariableMap } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { reachesFeeder } from "../equipment/rules.js";
import { animalFromEntity, liveEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { findWay, smoothWay, wayLength, pointAlong, turnToward } from "./zebraRules.js";
import { DIRS, standable, headroom, crawlTick, cellsRound, comingOn, inTheWay, yawTo } from "./snailRules.js";
import { ACT, CRAB_TYPES, RESTING, bodyOf, rockSides, diggable, digSound, gritColour, restOrder, wildBurrowAt, sideYaw, threatAt, awayAims, rivalOf, yielder, pickChoice } from "./crabRules.js";

// Obsidian Crabs (0.1.93, the End trio's third; spec 5.4 "Low armored black shell | Scrapes minerals and digs | Rocky
// cave, mineral feeder, substrate"; the rules are in animals/crabRules.js). Every half second, for the crabs near
// players. The End has no day or night, so it keeps to bouts: out a while (walking side-on, scraping the minerals off a
// rock face with its claws, eating at the Mineral Feeder, sifting the ground, looking about up on its legs), then to its
// burrow (its own, or a free cell of Mineral Substrate, one by a rock first; in the wild the ground at a rock's foot, or
// where it is), where it digs itself in backwards, throwing up grit, and rests with only its eyes and its big claw out.
// Where it can't dig it rests pressed flat. Two grown ones that meet face off, claws up, and the smaller sidles off.
// Someone in Survival or Adventure coming at it, not sneaking (nor holding its food or a carrier): it rears with its
// claws up, and nearer, or hit, it bolts side-on (in a zoo to its burrow) and digs in a while. A held Mineral Pellet
// draws it over to reach up at it. Crablets keep near their mother and dig in when she does.
// All its moving is the script's: it walks a tick at a time along a way of blocks (tickCrabMoves, a teleport a tick,
// without gravity while it walks), up a step's face and down off one, its body side-on to its way but for the last
// block up to something it means to reach. What it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const BURROW_PROP = "zoocraft:burrow"; // the cell it last dug into ("x,y,z"), kept on the mob
const SPECIES_ID = "zoocraft:obsidian_crab";
const GRIT = "zoocraft:crab_grit";

// What it can be doing when another grown one comes up for a face-off: out, or busy where it is.
const CALM = new Set([ACT.none, ACT.look, ACT.scrape, ACT.eat, ACT.sift]);

const state = new Map(); // entity id -> { e, body, mode, act, actUntil, after, yaw, bout, boutUntil, cool, restAt, hide, restFor, search, seen, faced, sidleFrom, scrapeAt, digId, young, male, exId, chase, avoid, homeTries }
// mode: "out" (choosing), "act", "walk", "bait", "bolt", "home" (looking for where to rest), "seek" (the wild look for a
// rock face). restAt: where it rests or is going to ("x,y,z", held for it in `held` when it digs in there); hide: this
// rest is a startle's, not a bout's end; restFor: how long it stays dug in (a crablet's, till its mother's out); search:
// the wild look round, a chunk each half second; seen: person id -> { x, z, d } (where they were when it last looked);
// faced: crab id -> the tick they can face off again; sidleFrom: where the one it gave way to stands; scrapeAt: the
// rock face it scrapes ({ x, y, z, i }); digId: the block it digs or sifts in; chase: the cell a crablet is walking to
// after its mother; avoid: { cell, x, z, at, until }, where one it gave up giving way to stood (its ways go round it).
const moving = new Map(); // entity id -> { e, pts, d, end, pace, act, sideways, forwardLast, yaw, face, at, read, body, young, goal, wait, waitMax, done }
const held = new Map(); // dimension id -> Map of cell key -> crab id (dug in there or on its way)

// Every 10 ticks: the crabs near players.
export function tickCrabs(now) {
  const T = BALANCE.crab;
  const players = onlinePlayers();
  const seen = new Map();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, CRAB_TYPES);
    } catch {
      continue;
    }
    for (const e of list) if (!seen.has(e.id)) seen.set(e.id, e);
  }
  for (const e of seen.values()) {
    try {
      step(member(e, now, T), now, players, T);
    } catch {
      forget(e.id);
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
}

function forget(id) {
  const s = state.get(id);
  state.delete(id);
  const mv = moving.get(id);
  moving.delete(id);
  for (const map of held.values()) for (const [k, who] of [...map]) if (who === id) map.delete(k);
  const e = s?.e;
  if (!e) return;
  try {
    if (!e.isValid) return;
    // No one near any more: it stays where it is, on the ground (gravity back), dug in or flat if it was resting.
    body(e, s, "ground");
    if (mv) e.teleport(mv.at, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
    if (s.act !== ACT.burrowed && s.act !== ACT.flat) setAct(e, s.act === ACT.dig ? ACT.burrowed : ACT.none);
  } catch {
    // gone
  }
}

// A crab hit or hurt by a player (initCrabs): it bolts, as from someone too close. Dug in, it stays in.
export function crabHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const s = state.get(entity.id);
  if (!s || RESTING.has(s.act) || s.mode === "bolt") return;
  const T = BALANCE.crab;
  const a = animalFromEntity(entity);
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  const m = { id: entity.id, e: entity, a, s, young: s.young, ex, wild: !ex };
  bolt(m, system.currentTick, { x: damager.location.x, z: damager.location.z }, T);
}

// A wild one takes damage (entityHurt: an arrow too); one in a zoo takes none, so there's no hurt event for it, and a
// punch is heard as a hit (entityHitEntity). A hit that hurts comes through both: the second finds it bolting.
export function initCrabs() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        crabHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: CRAB_TYPES },
  );
  world.afterEvents.entityHitEntity.subscribe((ev) => {
    try {
      if (CRAB_TYPES.includes(ev.hitEntity?.typeId)) crabHurt(ev.hitEntity, ev.damagingEntity);
    } catch {
      // gone
    }
  });
}

// Every tick: walk the crabs along their ways.
export function tickCrabMoves() {
  const T = BALANCE.crab;
  for (const [id, mv] of [...moving]) {
    const e = mv.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      if (mv.d < mv.end) {
        // The last forwardLast blocks up to a rock, the feeder or a held pellet: forward, slower.
        const fwd = !mv.sideways || (mv.forwardLast && mv.end - mv.d <= T.forwardLast);
        const pace = mv.forwardLast && mv.end - mv.d <= T.forwardLast ? (mv.young ? T.youngPace : T.forwardPace) : mv.pace;
        const d = Math.min(mv.end, mv.d + pace);
        const p = pointAlong(mv.pts, d);
        // Another grown one just ahead: it waits till the way's clear; too long (two face to face), and it gives up the
        // walk, its next ways going round where the other is for a while. How long it waits is drawn each time (half to
        // one and a half waitTicks), so of two face to face one gives up first and the other goes on. Bolting it doesn't
        // wait.
        const block = mv.young || mv.act === ACT.scuttle ? undefined : inTheWay(mv.at, { x: p.x - mv.at.x, z: p.z - mv.at.z }, grownNear(id, e), T);
        if (block) {
          if (!mv.wait) mv.waitMax = Math.round(T.waitTicks * (0.5 + Math.random()));
          mv.wait = (mv.wait ?? 0) + 1;
          if (mv.wait > mv.waitMax) {
            const s = state.get(id);
            const now = system.currentTick;
            if (s) s.avoid = { cell: spotKey(cellOf(block)), x: block.x, z: block.z, at: now, until: now + T.avoidTicks };
            finish(id, mv, false);
            continue;
          }
          setAct(e, ACT.none);
          continue;
        }
        mv.wait = 0;
        const r = crawlTick(mv.at, p, mv.read, mv.body, T);
        if (r.how === "stuck") {
          finish(id, mv, false);
          continue;
        }
        // Climbing a step's face it stays where it is across, its legs working, till it's up.
        if (r.how !== "climb") mv.d = d;
        if (p.dx || p.dz) {
          const way = yawTo(p.dx, p.dz);
          mv.yaw = turnToward(mv.yaw, fwd ? way : sideYaw(mv.yaw, way), T.turn);
        }
        setAct(e, r.how === "climb" ? ACT.walk : fwd && mv.act !== ACT.scuttle ? ACT.forward : mv.act);
        e.teleport({ x: r.x, y: r.y, z: r.z }, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        if (r.how === "crawl" && Math.random() < (mv.act === ACT.scuttle ? T.stepSoundChance * 3 : T.stepSoundChance)) sound(e, "mob.endermite.step", 0.08, 1.8);
        mv.at = { x: r.x, y: r.y, z: r.z };
        continue;
      }
      // There: it turns to face where it means to (a rock face, the feeder, whoever holds a pellet, out of its burrow).
      if (mv.face !== undefined && Math.abs(angleDiff(mv.face, mv.yaw)) > 2) {
        mv.yaw = turnToward(mv.yaw, mv.face, T.turn);
        setAct(e, ACT.none);
        e.setRotation({ x: 0, y: mv.yaw });
        continue;
      }
      finish(id, mv, true);
    } catch {
      moving.delete(id);
    }
  }
}

// The walk over (there, or stopped): on the ground again (gravity back) before whatever it does next, so it's never left
// without gravity standing still.
function finish(id, mv, ok) {
  moving.delete(id);
  const s = state.get(id);
  if (s) {
    s.yaw = mv.yaw;
    body(mv.e, s, "ground");
  }
  mv.done(ok);
}

// ---------------- the crab ----------------
function member(e, now, T) {
  let s = state.get(e.id);
  if (!s) {
    s = { e, mode: "out", act: ACT.none, actUntil: 0, cool: 0, bout: "out", boutUntil: now + Math.floor(Math.random() * T.outTicks[1]), seen: new Map(), faced: new Map() };
    state.set(e.id, s);
    // Met (again): on the ground with gravity; dug in, or flat, if it was resting (it rests on a while, then comes out).
    body(e, s, "ground");
    s.yaw = e.getRotation().y;
    const was = e.getProperty(PROP);
    if (was === ACT.burrowed || was === ACT.dig) {
      const k = spotKey(cellOf(e.location));
      s.restAt = claim(e, k, e.id) ? k : undefined;
      s.bout = "rest";
      s.digId = idUnder(e, e.location);
      startActAt(e, s, now, ACT.burrowed, Math.floor(between(T.restTicks) / 2), s.yaw, "wake");
    } else if (was === ACT.flat) {
      s.restAt = spotKey(cellOf(e.location));
      s.bout = "rest";
      startActAt(e, s, now, ACT.flat, Math.floor(between(T.restTicks) / 2), s.yaw, "wake");
    } else setAct(e, ACT.none);
  }
  s.e = e;
  const a = animalFromEntity(e);
  const young = a ? Boolean(a.juvenile) : isBaby(e);
  s.young = young;
  s.male = a ? a.sex === "male" : markOf(e) === 1;
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  s.exId = ex?.id;
  return { id: e.id, e, a, s, young, ex, wild: !ex };
}

function step(m, now, players, T) {
  const { e, s } = m;
  // Someone coming at it: it rears, or nearer it bolts (not dug in: it sees no one; not bolting already).
  if (!RESTING.has(s.act) && s.mode !== "bolt") {
    const t = threatOf(m, players, now, T);
    if (t?.how === "bolt") return bolt(m, now, t.from, T);
    if (t?.how === "rear" && s.act !== ACT.display) return rear(m, now, t.from, T);
  } else lookRound(m, players, T);
  if (moving.has(m.id)) {
    // Walking to someone's pellet: they've put it away, so it stops.
    if (s.mode === "bait" && !tempterOf(e, players, T)) {
      stopWalk(m);
      return settle(m, now, T);
    }
    // Walking about when someone holds one out: it turns off for it.
    const tempter = s.mode === "walk" && !m.young ? tempterOf(e, players, T) : undefined;
    if (tempter) {
      stopWalk(m);
      return toBait(m, now, tempter, T);
    }
    // A crablet walking after its mother, and she's off somewhere else now: it turns after her.
    if (m.young && s.chase) {
      const mother = motherOf(m);
      if (!mother || spotKey(chaseCell(mother)) !== s.chase) {
        stopWalk(m);
        return youngStep(m, now, T);
      }
    }
    return;
  }
  if (s.mode === "act") {
    // A crablet busy out when its mother goes in to rest: it digs in too.
    if (m.young && !RESTING.has(s.act) && s.act !== ACT.flat && motherResting(m)) return youngStep(m, now, T);
    if (now < s.actUntil) return acting(m, now, players, T);
    return finished(m, now, players, T);
  }
  if (s.mode === "seek") return seekRock(m, now, T);
  if (now < s.cool) return;
  if (s.mode === "home") return home(m, now, T);
  // A held Mineral Pellet: over to it.
  const tempter = tempterOf(e, players, T);
  if (tempter && !m.young) return toBait(m, now, tempter, T);
  if (m.young) return youngStep(m, now, T);
  // The bouts: out a while, then to its burrow to rest.
  if (s.bout === "out" && now >= s.boutUntil) {
    s.mode = "home";
    s.search = undefined;
    s.homeTries = 0;
    return home(m, now, T);
  }
  // Another grown one right by it: a face-off.
  const rival = rivalNear(m, now, T);
  if (rival) return faceOff(m, rival, now, T);
  choose(m, now, T);
}

// What it does next, out and about.
function choose(m, now, T) {
  const { e, s } = m;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const sift = m.wild ? diggable(idUnder(e, e.location)) : substrateSpots(m, read, here, T.siftReach).length > 0;
  const choice = pickChoice(T, { feed: feederIn(m.ex), sift });
  if (choice === "scrape" && scrapeChoice(m, now, read, here, T)) return;
  if (choice === "feed" && feedChoice(m, now, read, here, T)) return;
  if (choice === "sift" && siftChoice(m, now, read, here, T)) return;
  if (choice === "look") return startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
  if (walkAbout(m, now, read, here, T)) return;
  // Nowhere to walk to (boxed in): it looks about instead.
  startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
  s.cool = now + T.coolTicks;
}

// About a few blocks, side-on: to a cell walkAcross blocks off it can walk to.
function walkAbout(m, now, read, here, T) {
  const can = walker(m, read);
  const taken = takenBy(m);
  const cands = [];
  if (!m.wild) {
    for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
      if (kind !== "land") continue;
      const [x, y, z] = k.split(",").map(Number);
      const d = Math.hypot(x - here.x, z - here.z);
      if (d >= T.walkAcross[0] && d <= T.walkAcross[1] && Math.abs(y - here.y) <= 2 && !taken.has(k)) cands.push({ x, y, z });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = T.walkAcross[0] + Math.random() * (T.walkAcross[1] - T.walkAcross[0]);
      const c = openNear(can, taken, Math.floor(here.x + 0.5 + Math.cos(a) * d), here.y, Math.floor(here.z + 0.5 + Math.sin(a) * d));
      if (c) cands.push(c);
    }
  }
  shuffle(cands);
  for (const c of cands.slice(0, 6)) {
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    m.s.mode = "walk";
    walk(m, way, { act: ACT.walk }, () => settle(m, system.currentTick, T));
    return true;
  }
  return false;
}

// Scraping: to a free cell beside a rock face (in a zoo the rock measure's; in the wild the nearest it finds, a look
// a chunk at a time), the last block forward, facing the rock; with none it can get to, the ground where it is.
function scrapeChoice(m, now, read, here, T) {
  if (m.wild) {
    m.s.search = { kind: "rock", cells: cellsRound(here, T.rockReach, 1), i: 0, found: [] };
    m.s.mode = "seek";
    setAct(m.e, ACT.look);
    return true;
  }
  const taken = takenBy(m);
  const can = walker(m, read);
  const faces = [];
  for (const [x, y, z, i] of m.ex.rock?.spots ?? []) {
    const c = { x, y, z };
    if (read(x + DIRS[i][0], y, z + DIRS[i][1]) === "rock" && can(c) && !taken.has(spotKey(c))) faces.push({ x, y, z, i });
  }
  faces.sort((p, q) => dist(p, here) - dist(q, here));
  const near = shuffle(faces.slice(0, 4));
  if (toRock(m, now, read, here, near, T)) return true;
  scrapeGround(m, now, T);
  return true;
}

// The wild look for a rock face: the cells round it nearest first (snailRules.js cellsRound), scanChunk a half second,
// till it has found four (or looked at them all); meanwhile it looks about. Then to the nearest it can get to, or the
// ground where it is.
function seekRock(m, now, T) {
  const { e, s } = m;
  const look = s.search;
  if (!look || look.kind !== "rock") return settle(m, now, T);
  const read = readerOf(e);
  const can = walker(m, read);
  const taken = takenBy(m);
  const stop = Math.min(look.cells.length, look.i + T.scanChunk);
  for (; look.i < stop && look.found.length < 4; look.i++) {
    const c = look.cells[look.i];
    if (!can(c) || taken.has(spotKey(c))) continue;
    const sides = rockSides(read, c);
    if (sides.length) look.found.push({ x: c.x, y: c.y, z: c.z, i: sides[0] });
  }
  if (look.i < look.cells.length && look.found.length < 4) return;
  s.search = undefined;
  s.mode = "out";
  if (toRock(m, now, read, cellOf(e.location), look.found, T)) return;
  scrapeGround(m, now, T);
}

// To one of the rock faces `faces` ([{ x, y, z, i }]: the cell and the way to the rock), the first it can get to,
// scraping it there. False when it can get to none.
function toRock(m, now, read, here, faces, T) {
  const can = walker(m, read);
  for (const f of faces) {
    const face = yawTo(DIRS[f.i][0], DIRS[f.i][1]);
    const scrape = () => {
      m.s.scrapeAt = f;
      m.s.digId = idAt(m.e, { x: f.x + DIRS[f.i][0], y: f.y, z: f.z + DIRS[f.i][1] });
      startAct(m, system.currentTick, ACT.scrape, T.scrapeTicks, face, "settle");
    };
    const to = { x: f.x + 0.5 + DIRS[f.i][0] * T.scrapeGap, z: f.z + 0.5 + DIRS[f.i][1] * T.scrapeGap };
    const way = f.x === here.x && f.y === here.y && f.z === here.z ? [] : wayTo(m, can, read, here, f, T);
    if (!way) continue;
    m.s.mode = "walk";
    walk(m, way, { act: ACT.walk, to, face, forwardLast: true }, (ok) => (ok ? scrape() : settle(m, system.currentTick, T)));
    return true;
  }
  return false;
}

// No rock to hand (a superflat field): it scrapes the ground where it is, leaning in.
function scrapeGround(m, now, T) {
  m.s.scrapeAt = undefined;
  m.s.digId = idUnder(m.e, m.e.location);
  startAct(m, now, ACT.scrape, T.scrapeTicks, undefined, "settle");
}

// Eating: to a floor cell beside a Mineral Feeder of its exhibit with Mineral Pellets in it, the last block forward,
// facing it.
function feedChoice(m, now, read, here, T) {
  const can = walker(m, read);
  const taken = takenBy(m);
  for (const id of m.ex?.feederIds ?? []) {
    const rec = db.get("equipment", id);
    if (!rec?.pos || rec.dimension !== m.e.dimension.id || !edible(rec)) continue;
    const beside = DIRS.map(([dx, dz]) => ({ x: rec.pos.x + dx, y: rec.pos.y, z: rec.pos.z + dz })).filter((c) => can(c) && !taken.has(spotKey(c)));
    beside.sort((p, q) => dist(p, here) - dist(q, here));
    for (const c of beside) {
      const face = yawTo(rec.pos.x - c.x, rec.pos.z - c.z);
      const eat = () => startAct(m, system.currentTick, ACT.eat, T.eatTicks, face, "settle");
      const to = { x: c.x + 0.5 + (rec.pos.x - c.x) * T.scrapeGap, z: c.z + 0.5 + (rec.pos.z - c.z) * T.scrapeGap };
      const way = c.x === here.x && c.y === here.y && c.z === here.z ? [] : wayTo(m, can, read, here, c, T);
      if (!way) continue;
      m.s.mode = "walk";
      walk(m, way, { act: ACT.walk, to, face, forwardLast: true }, (ok) => (ok ? eat() : settle(m, system.currentTick, T)));
      return true;
    }
  }
  return false;
}

// Sifting: in a zoo on the Mineral Substrate (one of the nearest few free cells of it), in the wild where it is (on
// ground it can dig), half sunk in, scooping to its mouth.
function siftChoice(m, now, read, here, T) {
  const sift = () => {
    m.s.digId = idUnder(m.e, m.e.location);
    startAct(m, system.currentTick, ACT.sift, T.siftTicks, undefined, "settle");
  };
  if (m.wild) {
    sift();
    return true;
  }
  const taken = takenBy(m);
  const spots = substrateSpots(m, read, here, T.siftReach)
    .filter((c) => !taken.has(spotKey(c)) && !restedIn(m.e, spotKey(c), m.id))
    .sort((p, q) => dist(p, here) - dist(q, here))
    .slice(0, 4);
  shuffle(spots);
  const can = walker(m, read);
  for (const c of spots) {
    if (c.x === here.x && c.y === here.y && c.z === here.z) {
      sift();
      return true;
    }
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    m.s.mode = "walk";
    walk(m, way, { act: ACT.walk, to: { x: c.x + 0.5, z: c.z + 0.5 } }, (ok) => (ok ? sift() : settle(m, system.currentTick, T)));
    return true;
  }
  return false;
}

// ---------------- face-offs ----------------
// Another grown one of its own exhibit (or both wild) right by it, out or busy where it is, whose turn has come.
function rivalNear(m, now, T) {
  if (m.young) return undefined;
  const others = [];
  for (const [id, o] of state) {
    if (id === m.id || o.young || o.exId !== m.s.exId || moving.has(id)) continue;
    if (!(o.mode === "out" || (o.mode === "act" && CALM.has(o.act)))) continue;
    try {
      if (!o.e?.isValid || o.e.dimension.id !== m.e.dimension.id) continue;
      const p = o.e.location;
      others.push({ id, x: p.x, y: p.y, z: p.z, until: m.s.faced.get(id) });
    } catch {
      // gone
    }
  }
  return rivalOf(m.e.location, others, now, T);
}

// Both rear at each other, claws up and clacking, faceOffTicks; then the smaller (crabRules.js yielder) sidles off.
// Not the same two again for faceOffCool ticks.
function faceOff(m, oid, now, T) {
  const o = state.get(oid);
  if (!o) return;
  const until = now + T.faceOffCool;
  m.s.faced.set(oid, until);
  o.faced.set(m.id, until);
  for (const map of [m.s.faced, o.faced]) if (map.size > 8) for (const [k, t] of [...map]) if (t <= now) map.delete(k);
  const loser = yielder({ id: m.id, male: m.s.male }, { id: oid, male: o.male });
  const a = m.e.location;
  const b = o.e.location;
  m.s.sidleFrom = loser === m.id ? { x: b.x, z: b.z } : undefined;
  o.sidleFrom = loser === oid ? { x: a.x, z: a.z } : undefined;
  startActAt(m.e, m.s, now, ACT.display, T.faceOffTicks, yawTo(b.x - a.x, b.z - a.z), loser === m.id ? "sidle" : "settle");
  startActAt(o.e, o, now, ACT.display, T.faceOffTicks, yawTo(a.x - b.x, a.z - b.z), loser === oid ? "sidle" : "settle");
  sound(m.e, "mob.shulker.close", 0.25, 1.8);
}

// The one that gave way: off side-on, sidleAcross blocks away from the other.
function sidle(m, now, T) {
  const from = m.s.sidleFrom;
  m.s.sidleFrom = undefined;
  if (!from || !awayTo(m, from, T.sidleAcross, { act: ACT.walk }, "walk", () => settle(m, system.currentTick, T), T)) settle(m, now, T);
}

// ---------------- someone coming at it ----------------
// Who comes at it now (crabRules.js threatAt): someone in Survival or Adventure, not sneaking, not holding its food or
// a carrier (they're tempting or catching it), coming at it, near a wild one (inside its exhibit for one in a zoo).
// The worst ({ id, d, how, from }), or undefined. It notes where each one near it is as it looks.
function threatOf(m, players, now, T) {
  const { e, s, ex } = m;
  const cells = ex ? cellsOf(ex.id) : undefined;
  let best;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id) continue;
      const l = p.location;
      const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
      if (d > T.watchRange || Math.abs(l.y - e.location.y) > 3) {
        s.seen.delete(p.id);
        continue;
      }
      const prev = s.seen.get(p.id);
      s.seen.set(p.id, { x: l.x, z: l.z, d });
      if (!survival(p) || p.isSneaking || tempting(p)) continue;
      if (!m.wild && !cells?.has(spotKey(cellOf(l)))) continue;
      const how = threatAt(d, comingOn(prev, l, d, T), !m.wild, T);
      if (!how) continue;
      if (!best || (how === "bolt" && best.how !== "bolt") || (how === best.how && d < best.d)) best = { id: p.id, d, how, from: { x: l.x, z: l.z } };
    } catch {
      // gone
    }
  }
  return best;
}

// Dug in: it still notes where people are, so someone standing there isn't "coming at it" when it's out.
function lookRound(m, players, T) {
  const { e, s } = m;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id) continue;
      const l = p.location;
      const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
      if (d > T.watchRange) s.seen.delete(p.id);
      else s.seen.set(p.id, { x: l.x, z: l.z, d });
    } catch {
      // gone
    }
  }
}

// Rearing at them, claws up and open, clacking, rearTicks.
function rear(m, now, from, T) {
  if (moving.has(m.id)) stopWalk(m);
  dropRest(m);
  sound(m.e, "mob.shulker.close", 0.25, 1.8);
  startAct(m, now, ACT.display, T.rearTicks, yawTo(from.x - m.e.location.x, from.z - m.e.location.z), "settle");
}

// Bolting from someone at `from`: scuttling side-on, in a zoo to its burrow (its own, or a free Mineral Substrate cell)
// to dig in; else boltAcross blocks away from them, then dug in where it stops (or flat, where it can't dig);
// hideTicks either way, and back to its bout.
function bolt(m, now, from, T) {
  const { e, s } = m;
  if (moving.has(m.id)) stopWalk(m);
  dropRest(m);
  s.hide = true;
  s.restFor = undefined;
  const done = () => hideHere(m, system.currentTick, T);
  if (!m.wild) {
    const read = readerOf(e);
    const here = cellOf(e.location);
    const can = walker(m, read);
    for (const { spot, kind } of restOrder(zooLook(m, read, here, T), e.location, T, Infinity)) {
      if (kind !== "home" && kind !== "burrow") break;
      const k = spotKey(spot);
      if (!claim(e, k, m.id)) continue;
      const way = spotKey(here) === k ? [] : wayTo(m, (c) => can(c) || spotKey(c) === k, read, here, spot, T);
      if (!way) {
        unclaim(e, k, m.id);
        continue;
      }
      s.restAt = k;
      s.mode = "bolt";
      sound(e, "mob.shulker.close", 0.25, 1.9);
      walk(m, way, { act: ACT.scuttle, pace: T.scuttlePace, to: { x: spot.x + 0.5, z: spot.z + 0.5 } }, (ok) => {
        const t = system.currentTick;
        if (!ok) {
          unclaim(e, k, m.id);
          s.restAt = undefined;
          return hideHere(m, t, T);
        }
        dig(m, t, k, true, faceOut(readerOf(e), spot), T);
      });
      return;
    }
  }
  sound(e, "mob.shulker.close", 0.25, 1.9);
  if (awayTo(m, from, T.boltAcross, { act: ACT.scuttle, pace: T.scuttlePace }, "bolt", done, T)) return;
  // Nowhere to run (boxed in): it digs in, or presses flat, where it is.
  hideHere(m, now, T);
}

// Off side-on `across` blocks away from `from` (crabRules.js awayAims: straight away, else up to 60 degrees aside),
// to the first point it can get to without going much farther round. False when there's none.
function awayTo(m, from, across, opts, mode, done, T) {
  const e = m.e;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const can = walker(m, read);
  const taken = takenBy(m);
  for (const aim of awayAims(e.location, from, across)) {
    const c = openNear(can, taken, Math.floor(aim.x), here.y, Math.floor(aim.z));
    if (!c || spotKey(c) === spotKey(here)) continue;
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length || way.length > across[1] * 2) continue;
    m.s.mode = mode;
    walk(m, way, opts, done);
    return true;
  }
  return false;
}

// Hiding where it is after a bolt: dug in if it can dig there (in a zoo, only into a free Mineral Substrate cell), else
// pressed flat.
function hideHere(m, now, T) {
  const { e, s } = m;
  s.hide = true;
  const here = cellOf(e.location);
  const k = spotKey(here);
  const can = m.wild ? diggable(idUnder(e, e.location)) : substrateSpots(m, readerOf(e), here, 0).some((c) => spotKey(c) === k);
  if (can && claim(e, k, m.id)) return dig(m, now, k, false, s.yaw, T);
  flat(m, now, k, s.yaw, T);
}

// Out of a rest (a flat one, cut short by someone coming at it): its rest's place let go.
function dropRest(m) {
  const { e, s } = m;
  if (s.act === ACT.flat && s.mode === "act") {
    if (s.restAt) unclaim(e, s.restAt, m.id);
    s.restAt = undefined;
    s.after = undefined;
  }
}

// ---------------- going to rest ----------------
// At a bout's end: to its burrow (crabRules.js restOrder: its own, a free one by a rock first, where it is if it can
// dig there, else flat at a rock's foot or where it is), the first of them it can walk to; there it digs in backwards.
function home(m, now, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const found = m.wild ? wildLook(m, read, here, T) : zooLook(m, read, here, T);
  if (!found) return; // still looking round (the wild look takes a few half seconds)
  s.search = undefined;
  const can = walker(m, read);
  // Turned back on its way homeTries times (blocked, or startled and lost its claim): it rests where it is.
  const order = (s.homeTries ?? 0) >= T.homeTries ? [{ spot: here, kind: found.dig ? "here" : "flat" }] : restOrder(found, e.location, T, m.wild ? undefined : Infinity);
  const taken = takenBy(m);
  for (const { spot, kind } of order) {
    const k = spotKey(spot);
    const atHere = k === spotKey(here);
    const burrow = kind !== "flat";
    if (burrow && !claim(e, k, m.id)) continue;
    if (kind === "here") return dig(m, now, k, true, s.yaw, T);
    if (!burrow && atHere) return flat(m, now, k, s.yaw, T);
    // A rock's foot another has taken since it looked (resting there, on its way, or in it): the next one.
    if (!burrow && (restedIn(e, k, m.id) || taken.has(k))) continue;
    const allow = (c) => can(c) || spotKey(c) === k;
    // Round the others where it can; to its burrow through one that's in the way if it must.
    const way = atHere ? [] : wayTo(m, allow, read, here, spot, T) ?? (burrow ? wayTo(m, allow, read, here, spot, T, false) : undefined);
    if (!way) {
      if (burrow) unclaim(e, k, m.id);
      continue;
    }
    const face = faceOut(read, spot);
    s.restAt = k;
    s.mode = "walk";
    walk(m, way, { act: ACT.walk, to: { x: spot.x + 0.5, z: spot.z + 0.5 }, face }, (ok) => {
      const t = system.currentTick;
      if (!ok) {
        if (burrow) unclaim(e, k, m.id);
        s.restAt = undefined;
        s.mode = "home";
        // Giving way isn't turning back: it goes on round the other.
        if (s.avoid?.at !== t) s.homeTries = (s.homeTries ?? 0) + 1;
        s.cool = t + T.coolTicks;
        return;
      }
      if (burrow) dig(m, t, k, true, face, T);
      else flat(m, t, k, face, T);
    });
    return;
  }
  flat(m, now, spotKey(here), s.yaw, T);
}

// Digging itself in backwards where it is (`k`, its cell, held for it): digTicks, throwing up grit, then dug in. A
// grown one keeps the cell as its burrow (`own`: it comes back to it).
function dig(m, now, k, own, face, T) {
  const { e, s } = m;
  if (!s.hide && !m.young) s.bout = "rest";
  s.restAt = k;
  if (own && !m.young) {
    try {
      e.setDynamicProperty(BURROW_PROP, k);
    } catch {
      // kept in the script only
    }
  }
  s.digId = idUnder(e, e.location);
  sound(e, digSound(s.digId), 0.3, 1.2);
  startAct(m, now, ACT.dig, T.digTicks, face, "burrowed");
}

// Pressed flat where it is (`k`): where it can't dig, or no burrow to be had. As long as it would stay dug in.
function flat(m, now, k, face, T) {
  const { s } = m;
  if (!s.hide && !m.young) s.bout = "rest";
  s.restAt = k;
  const ticks = s.restFor ?? (s.hide ? T.hideTicks : T.restTicks);
  s.restFor = undefined;
  startAct(m, now, ACT.flat, ticks, face, "wake");
}

// The zoo's look for where to rest: its exhibit's Mineral Substrate cells that are free (crabRules.js restOrder takes
// those by a rock first), the rock measure's cells at a rock's foot to press flat in.
function zooLook(m, read, here, T) {
  const e = m.e;
  const burrows = [];
  for (const c of substrateSpots(m, read, here, Infinity)) {
    const k = spotKey(c);
    if (restedIn(e, k, m.id)) continue;
    burrows.push({ ...c, rock: rockSides(read, c).length > 0 });
  }
  const feet = [];
  const seen = new Set();
  for (const [x, y, z] of m.ex.rock?.spots ?? []) {
    const k = `${x},${y},${z}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const c = { x, y, z };
    if (standable(read, c) && !restedIn(e, k, m.id)) feet.push(c);
  }
  return { home: homeOf(e), burrows, feet, dig: false };
}

// The wild look: its own burrow, if it's near, still diggable and free; else the cells round it (nearest first,
// scanChunk a half second) for diggable ground at a rock's foot (the nearest found ends the look). Undefined while it's
// still looking.
function wildLook(m, read, here, T) {
  const { e, s } = m;
  const under = idReaderOf(e);
  const dig = diggable(under(here.x, here.y - 1, here.z));
  const mine = homeOf(e);
  if (!s.search || s.search.kind !== "rest") {
    if (mine && Math.hypot(mine.x - here.x, mine.z - here.z) <= T.restReach && standable(read, mine) && diggable(under(mine.x, mine.y - 1, mine.z)) && !restedIn(e, spotKey(mine), m.id)) {
      return { home: mine, burrows: [{ ...mine, rock: rockSides(read, mine).length > 0 }], feet: [], dig };
    }
    s.search = { kind: "rest", cells: cellsRound(here, T.restReach, T.restRise), i: 0, found: [] };
  }
  const look = s.search;
  const stop = Math.min(look.cells.length, look.i + T.scanChunk);
  for (; look.i < stop; look.i++) {
    const c = look.cells[look.i];
    if (wildBurrowAt(read, under, c) && !restedIn(e, spotKey(c), m.id)) {
      look.found.push({ x: c.x, y: c.y, z: c.z, rock: true });
      look.i = look.cells.length;
      break;
    }
  }
  if (look.i < look.cells.length) return undefined;
  return { home: mine, burrows: look.found, feet: [], dig };
}

// Which way it faces dug in at `c`: away from a rock beside it (it backs in under the rock's edge), else as it is.
function faceOut(read, c) {
  const sides = rockSides(read, c);
  return sides.length ? yawTo(-DIRS[sides[0]][0], -DIRS[sides[0]][1]) : undefined;
}

// ---------------- a held Mineral Pellet ----------------
// To a cell reachFrom blocks from whoever holds it (the nearest to them it can walk to), forward all the way, antennae
// flicking (it follows its nose), then reaching up at it for as long as they hold it there.
function toBait(m, now, p, T) {
  const { e, s } = m;
  const l = p.location;
  const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
  const face = yawTo(l.x - e.location.x, l.z - e.location.z);
  if (d <= T.reachFrom[1]) return startAct(m, now, ACT.reach, T.reachTicks, face, "settle");
  const read = readerOf(e);
  const here = cellOf(e.location);
  const can = walker(m, read);
  const taken = takenBy(m);
  const pc = cellOf(l);
  const cands = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      for (let dy = -1; dy <= 1; dy++) {
        const c = { x: pc.x + dx, y: pc.y + dy, z: pc.z + dz };
        const r = Math.hypot(c.x + 0.5 - l.x, c.z + 0.5 - l.z);
        if (r >= T.reachFrom[0] && r <= T.reachFrom[1] && can(c) && !taken.has(spotKey(c))) cands.push({ c, r });
      }
    }
  }
  // Any block within reach of them will do: the nearest to it.
  cands.sort((p1, p2) => dist(p1.c, here) - dist(p2.c, here) || p1.r - p2.r);
  for (const { c } of cands.slice(0, 4)) {
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    s.mode = "bait";
    walk(m, way, { act: ACT.forward, pace: T.forwardPace, sideways: false, face: yawTo(l.x - (c.x + 0.5), l.z - (c.z + 0.5)) }, (ok) => {
      const t = system.currentTick;
      if (!ok) return settle(m, t, T);
      const who = tempterOf(e, onlinePlayers(), T);
      if (!who) return settle(m, t, T);
      startAct(m, t, ACT.reach, T.reachTicks, yawTo(who.location.x - e.location.x, who.location.z - e.location.z), "settle");
    });
    return;
  }
  // Nowhere near them it can get to (they're over a wall): it turns to them and looks.
  startAct(m, now, ACT.look, T.lookTicks, face, "settle");
}

// ---------------- crablets ----------------
// A crablet keeps near its mother: with her dug in (or flat) to rest, it digs in too, on the free Mineral Substrate
// nearest it within youngNear[1] + 2 blocks (in a zoo), or where it is if it can dig there, else flat, till she's out;
// farther from her than youngNear[1] blocks, it walks to a cell by her; otherwise it sifts, scrapes the ground or looks
// about where it is.
function youngStep(m, now, T) {
  const { e, s } = m;
  const mother = motherOf(m);
  s.chase = undefined;
  const ms = mother ? state.get(mother.id) : undefined;
  const read = readerOf(e);
  const here = cellOf(e.location);
  if (ms && (RESTING.has(ms.act) || ms.act === ACT.flat) && ms.act !== ACT.emerge) {
    s.hide = false;
    s.restFor = Math.max(40, ms.actUntil - now + (ms.act === ACT.dig ? T.restTicks[0] : 0));
    const k = spotKey(here);
    if (!m.wild) {
      const can = walker(m, read);
      const taken = takenBy(m);
      const spots = substrateSpots(m, read, here, T.youngNear[1] + 2).filter((c) => !restedIn(e, spotKey(c), m.id) && (spotKey(c) === k || !taken.has(spotKey(c))));
      spots.sort((p, q) => dist(p, here) - dist(q, here));
      for (const c of spots.slice(0, 4)) {
        const ck = spotKey(c);
        if (!claim(e, ck, m.id)) continue;
        if (ck === k) return dig(m, now, ck, false, s.yaw, T);
        const way = wayTo(m, (x) => can(x) || spotKey(x) === ck, read, here, c, T);
        if (!way) {
          unclaim(e, ck, m.id);
          continue;
        }
        s.restAt = ck;
        s.mode = "walk";
        walk(m, way, { act: ACT.walk, to: { x: c.x + 0.5, z: c.z + 0.5 } }, (ok) => {
          const t = system.currentTick;
          if (!ok) {
            unclaim(e, ck, m.id);
            s.restAt = undefined;
            return flat(m, t, spotKey(cellOf(e.location)), s.yaw, T);
          }
          dig(m, t, ck, false, s.yaw, T);
        });
        return;
      }
      return flat(m, now, k, s.yaw, T);
    }
    if (diggable(idUnder(e, e.location)) && claim(e, k, m.id)) return dig(m, now, k, false, s.yaw, T);
    return flat(m, now, k, s.yaw, T);
  }
  s.restFor = undefined;
  if (mother) {
    const d = Math.hypot(mother.location.x - e.location.x, mother.location.z - e.location.z);
    if (d > T.youngNear[1]) {
      const can = walker(m, read);
      const taken = takenBy(m);
      // Beside where its mother is walking to (it's quicker), or where she is.
      const pc = chaseCell(mother);
      // Beside her, nearest to the crablet first; those taken (its brood round her), a block farther out.
      const near = [];
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (dx || dz) near.push({ x: pc.x + dx, y: pc.y, z: pc.z + dz, ring: Math.max(Math.abs(dx), Math.abs(dz)) });
      near.sort((p, q) => p.ring - q.ring || dist(p, here) - dist(q, here));
      for (const c of near.filter((x) => can(x) && !taken.has(spotKey(x))).slice(0, 6)) {
        const way = wayTo(m, can, read, here, c, T);
        if (!way?.length) continue;
        s.mode = "walk";
        s.chase = spotKey(pc);
        walk(m, way, { act: ACT.walk }, () => settle(m, system.currentTick, T));
        return;
      }
    }
  }
  const r = Math.random();
  const sift = m.wild ? diggable(idUnder(e, e.location)) : substrateSpots(m, read, here, 0).length > 0;
  if (r < 0.35 && sift) {
    s.digId = idUnder(e, e.location);
    return startAct(m, now, ACT.sift, T.siftTicks, undefined, "settle");
  }
  if (r < 0.7) return scrapeGround(m, now, T);
  startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
}

// A crablet's mother (the first of its parents), if she's about.
function motherOf(m) {
  const id = m.a?.parents?.[0];
  return id ? liveEntity(id) : undefined;
}

// A crablet's mother is resting (digging in, dug in, or flat) within youngNear[1] + 2 blocks of it.
function motherResting(m) {
  const T = BALANCE.crab;
  const mother = motherOf(m);
  const ms = mother ? state.get(mother.id) : undefined;
  if (!ms || !(ms.act === ACT.dig || ms.act === ACT.burrowed || ms.act === ACT.flat)) return false;
  return Math.hypot(mother.location.x - m.e.location.x, mother.location.z - m.e.location.z) <= T.youngNear[1] + 2;
}

// The cell a crablet heads for after its mother: where she's walking to, else where she is.
function chaseCell(mother) {
  const goal = moving.get(mother.id)?.goal;
  if (!goal) return cellOf(mother.location);
  const [x, y, z] = goal.split(",").map(Number);
  return { x, y, z };
}

// ---------------- what it does ----------------
function startAct(m, now, act, ticks, yaw, after) {
  startActAt(m.e, m.s, now, act, ticks, yaw, after);
}

function startActAt(e, s, now, act, ticks, yaw, after) {
  s.mode = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.after = after;
  if (yaw !== undefined) s.yaw = yaw;
  body(e, s, "ground");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
}

// While it scrapes, eats, sifts, digs, rears, looks, reaches or rests: as it was, with the sounds and the grit that go
// with it. Reaching, it goes on while they hold the pellet near it.
function acting(m, now, players, T) {
  const { e, s } = m;
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const l = e.location;
  const k = m.young ? 0.35 : 1;
  if (s.act === ACT.scrape) {
    if (Math.random() < 0.4) sound(e, "scrape", 0.1, 1.7);
    if (Math.random() < 0.5) {
      const f = s.scrapeAt;
      const at = f ? { x: f.x + 0.5 + DIRS[f.i][0] * 0.48, y: f.y + 0.15 * k, z: f.z + 0.5 + DIRS[f.i][1] * 0.48 } : ahead(l, s.yaw, 0.3 * k);
      grit(e, at, s.digId);
    }
  } else if (s.act === ACT.eat) {
    if (Math.random() < 0.3) sound(e, "mob.armadillo.eat", 0.15, 1.4);
  } else if (s.act === ACT.sift || s.act === ACT.dig) {
    if (Math.random() < 0.6) grit(e, ahead(l, s.yaw, -0.15 * k), s.digId);
    if (Math.random() < 0.35) sound(e, digSound(s.digId), 0.15, 1.3);
  } else if (s.act === ACT.display) {
    if (Math.random() < 0.5) sound(e, "mob.shulker.close", 0.2, 1.8);
  } else if (s.act === ACT.reach) {
    const p = tempterOf(e, players, T);
    if (p && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= T.reachFrom[1] + 0.7) {
      s.actUntil = Math.max(s.actUntil, now + 10);
      s.yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
    }
  }
}

// An act run its time: dug in after digging in; out of its burrow (or up off the ground) after a rest, back to its
// bout (a new one after a bout's rest); sidling off after a face-off it lost; else back to choosing.
function finished(m, now, players, T) {
  const { e, s } = m;
  const after = s.after;
  s.after = undefined;
  if (after === "burrowed") {
    const ticks = s.restFor ?? (s.hide ? T.hideTicks : T.restTicks);
    s.restFor = undefined;
    return startAct(m, now, ACT.burrowed, ticks, s.yaw, "wake");
  }
  if (after === "wake") {
    const dug = s.act === ACT.burrowed;
    if (s.restAt) unclaim(e, s.restAt, m.id);
    s.restAt = undefined;
    if (!s.hide && !m.young) {
      s.bout = "out";
      s.boutUntil = now + between(T.outTicks);
    }
    s.hide = false;
    if (dug) {
      sound(e, digSound(s.digId), 0.3, 1.3);
      grit(e, e.location, s.digId);
      return startAct(m, now, ACT.emerge, T.emergeTicks, undefined, "settle");
    }
    return settle(m, now, T);
  }
  if (after === "sidle") return sidle(m, now, T);
  settle(m, now, T);
}

// Out, still, choosing again after coolTicks.
function settle(m, now, T) {
  const { e, s } = m;
  s.mode = s.bout === "out" || m.young ? "out" : "home";
  s.act = ACT.none;
  s.cool = now + T.coolTicks;
  body(e, s, "ground");
  setAct(e, ACT.none);
}

// ---------------- walking ----------------
// Walk through the blocks `cells` from where it is (smoothed round the bends: zebraRules.js smoothWay), then
// `done(ok)`. opts: act (walk, scuttle or forward), pace, sideways (side-on to its way; true unless said), forwardLast
// (the last forwardLast blocks forward), to (an exact end point { x, z }), face (a yaw to turn to there).
function walk(m, cells, opts, done) {
  const { e, s } = m;
  const T = BALANCE.crab;
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const read = readerOf(e);
  const pts = smoothWay(from, cells, (c) => read(c.x, c.y, c.z) === "air");
  if (opts.to) {
    if (pts.length === 1) pts.push({ x: opts.to.x, y: from.y, z: opts.to.z });
    else pts[pts.length - 1] = { x: opts.to.x, y: pts[pts.length - 1].y, z: opts.to.z };
  }
  const last = cells.length ? cells[cells.length - 1] : cellOf(from);
  const flatPts = pts.map((p) => ({ x: p.x, y: 0, z: p.z }));
  body(e, s, "glide");
  s.act = opts.act;
  moving.set(m.id, {
    e,
    pts: flatPts,
    d: 0,
    end: wayLength(flatPts),
    pace: opts.pace ?? (m.young ? T.youngPace : T.pace),
    act: opts.act,
    sideways: opts.sideways ?? true,
    forwardLast: Boolean(opts.forwardLast),
    yaw: e.getRotation().y,
    face: opts.face,
    at: from,
    read,
    body: bodyOf(m.young, !s.male),
    young: m.young,
    goal: spotKey(last),
    done,
  });
}

// Stopped where it is (someone coming at it, a pellet put away): on the ground there.
function stopWalk(m) {
  const mv = moving.get(m.id);
  moving.delete(m.id);
  if (mv) m.s.yaw = mv.yaw;
  if (m.s.restAt && m.s.mode !== "act") {
    unclaim(m.e, m.s.restAt, m.id);
    m.s.restAt = undefined;
  }
  body(m.e, m.s, "ground");
}

// The way to `to` through the blocks it can walk on (zebraRules.js findWay): a cell list, or undefined. Round the others
// that are still (busy, resting: never walking through one), unless `round` is false.
function wayTo(m, can, read, here, to, T, round = true) {
  const still = round ? stillAt(m) : new Set();
  // Where one it gave way to stood, a while after.
  const av = round && m.s.avoid && system.currentTick < m.s.avoid.until ? m.s.avoid : undefined;
  if (av) still.add(av.cell);
  const goal = spotKey(to);
  const ok = still.size ? (c) => can(c) && (!still.has(spotKey(c)) || spotKey(c) === goal) : can;
  const clear = (c) => headroom(read, c);
  const steps = m.wild ? T.wildSteps : T.walkSteps;
  const nodes = m.wild ? T.wildNodes : T.zooNodes;
  // In the same block as the one it gave way to: first aside into a next block the way most away from it (none toward
  // it: it would only stop again), then on round it.
  if (av && spotKey(here) === av.cell && goal !== av.cell) {
    const l = m.e.location;
    const off = (c) => {
      const ax = av.x - l.x;
      const az = av.z - l.z;
      const cx = c.x + 0.5 - l.x;
      const cz = c.z + 0.5 - l.z;
      return (ax * cx + az * cz) / (Math.hypot(ax, az) * Math.hypot(cx, cz) || 1);
    };
    const sides = DIRS.map(([dx, dz]) => ({ x: here.x + dx, y: here.y, z: here.z + dz })).filter((c) => ok(c) && off(c) <= 0.3);
    sides.sort((p, q) => off(p) - off(q));
    for (const side of sides) {
      const on = findWay(ok, clear, side, to, steps, nodes);
      if (on) return [side, ...on];
    }
  }
  return findWay(ok, clear, here, to, steps, nodes);
}

// Where it can walk: its exhibit's floor (not up on its feeders and fixtures), or, in the wild, any block of room with
// solid ground under it (snailRules.js standable: never over the void, nor onto a slab or a chorus stalk).
function walker(m, read) {
  if (m.wild) return (c) => standable(read, c);
  const cells = cellsOf(m.ex.id);
  const tops = equipmentTops(m.ex);
  return (c) => {
    const k = spotKey(c);
    return cells?.get(k) === "land" && !tops.has(k) && standable(read, c);
  };
}

// The first cell it can walk to and stop in at x, z, on its level or a block or two up or down, or undefined.
function openNear(can, taken, x, y, z) {
  for (const dy of [0, 1, -1, 2, -2]) {
    const c = { x, y: y + dy, z };
    if (can(c) && !taken.has(spotKey(c))) return c;
  }
  return undefined;
}

// ---------------- around it ----------------
// The cells of its exhibit's floor over Mineral Substrate within `reach` blocks across of `here` (and 2 up or down).
function substrateSpots(m, read, here, reach) {
  const out = [];
  if (!m.ex) return out;
  const can = walker(m, read);
  for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.hypot(x - here.x, z - here.z) > reach + 0.01 || Math.abs(y - here.y) > 2) continue;
    if (read(x, y - 1, z) === "substrate" && can({ x, y, z })) out.push({ x, y, z });
  }
  return out;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

// A feeder it eats from (only a Mineral Feeder: equipment/rules.js reachesFeeder) with food it eats in it.
function edible(rec) {
  const sp = SPECIES[SPECIES_ID];
  return Boolean(rec?.units > 0 && reachesFeeder(sp, rec) && sp.dietTags.includes(RATIONS[rec.item]?.diet));
}

// The cells over the exhibit's feeders and other equipment, which it never walks onto ("x,y,z").
function equipmentTops(ex) {
  const out = new Set();
  for (const id of [...(ex.feederIds ?? []), ...(ex.fixtureIds ?? [])]) {
    const rec = db.get("equipment", id);
    if (rec?.pos) out.add(`${rec.pos.x},${rec.pos.y + 1},${rec.pos.z}`);
  }
  return out;
}

const survival = (p) => {
  try {
    const mode = String(p.getGameMode()).toLowerCase();
    return mode === "survival" || mode === "adventure";
  } catch {
    return false;
  }
};

// Someone holding its food or an empty carrier: they're tempting or catching it.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return id === SPECIES[SPECIES_ID].baitItem || carrierByItem(id)?.full === false;
}

// The nearest player within baitRange holding Mineral Pellets, or undefined (it smells them from far off).
function tempterOf(e, players, T) {
  let best;
  let near = T.baitRange;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || heldItem(p)?.typeId !== SPECIES[SPECIES_ID].baitItem) continue;
      const d = Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z);
      if (d <= near) {
        near = d;
        best = p;
      }
    } catch {
      // gone
    }
  }
  return best;
}

// ---------------- the burrows ----------------
function heldIn(e) {
  const id = e.dimension.id;
  let map = held.get(id);
  if (!map) held.set(id, (map = new Map()));
  return map;
}

// Hold the cell `k` for crab `id` to dig into: false when another crab holds it.
function claim(e, k, id) {
  const map = heldIn(e);
  const who = map.get(k);
  if (who && who !== id && state.has(who)) return false;
  map.set(k, id);
  return true;
}

function unclaim(e, k, id) {
  if (!k) return;
  const map = heldIn(e);
  if (map.get(k) === id) map.delete(k);
}

function free(e, k, id) {
  const who = heldIn(e).get(k);
  return !who || who === id || !state.has(who);
}

// Another crab rests in that cell (dug in, flat, or on its way to), or holds it.
function restedIn(e, k, id) {
  for (const [oid, o] of state) if (oid !== id && o.restAt === k) return true;
  return !free(e, k, id);
}

// The cells the other crabs are in, or walking to ("x,y,z"): none of them a place to stop in (two never end up on top of
// each other).
function takenBy(m) {
  const out = new Set();
  for (const [id, o] of state) {
    if (id === m.id) continue;
    try {
      if (!o.e?.isValid || o.e.dimension.id !== m.e.dimension.id) continue;
      out.add(spotKey(cellOf(o.e.location)));
      const goal = moving.get(id)?.goal;
      if (goal) out.add(goal);
    } catch {
      // gone
    }
  }
  return out;
}

// The cells the other crabs are still in, or walking to and will stop in: its ways go round them (not round where a
// walking one is now: it'll be gone).
function stillAt(m) {
  const out = new Set();
  for (const [id, o] of state) {
    if (id === m.id) continue;
    try {
      if (!o.e?.isValid || o.e.dimension.id !== m.e.dimension.id) continue;
      const mv = moving.get(id);
      if (!mv) out.add(spotKey(cellOf(o.e.location)));
      else if (mv.goal) out.add(mv.goal);
    } catch {
      // gone
    }
  }
  return out;
}

// Where the other grown crabs within a block and a half of it are (walking or not): the ones it gives way to.
function grownNear(id, e) {
  const out = [];
  const l = e.location;
  for (const [oid, o] of state) {
    if (oid === id || o.young) continue;
    try {
      if (!o.e?.isValid || o.e.dimension.id !== e.dimension.id) continue;
      const p = o.e.location;
      if (Math.abs(p.x - l.x) < 1.5 && Math.abs(p.z - l.z) < 1.5) out.push(p);
    } catch {
      // gone
    }
  }
  return out;
}

// The cell it last dug into, kept on the mob ({ x, y, z }), or undefined.
function homeOf(e) {
  try {
    const v = e.getDynamicProperty(BURROW_PROP);
    if (typeof v !== "string") return undefined;
    const [x, y, z] = v.split(",").map(Number);
    return [x, y, z].every(Number.isFinite) ? { x, y, z } : undefined;
  } catch {
    return undefined;
  }
}

// ---------------- the mob ----------------
// Its body: "glide" (no gravity, the script walking it) or "ground" (resting on what's under it). Each event swaps the
// other group out, and both hold a physics component, as the entity's base does (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function isBaby(e) {
  try {
    return Boolean(e.getComponent("minecraft:is_baby"));
  } catch {
    return false;
  }
}

// A wild one's sex (minecraft:mark_variant: 1 a male), or undefined.
function markOf(e) {
  try {
    return e.getComponent("minecraft:mark_variant")?.value;
  } catch {
    return undefined;
  }
}

const idAt = (e, pos) => {
  try {
    return e.dimension.getBlock(pos)?.typeId;
  } catch {
    return undefined;
  }
};

// The block under where it stands.
function idUnder(e, l) {
  return idAt(e, { x: Math.floor(l.x), y: Math.floor(l.y + 0.01) - 1, z: Math.floor(l.z) });
}

// A puff of grit at `p`, the colour of the block `typeId` (crabRules.js gritColour; gen/crab.py's zoocraft:crab_grit).
function grit(e, p, typeId) {
  try {
    const c = gritColour(typeId);
    const vars = new MolangVariableMap();
    vars.setFloat("variable.r", c.r);
    vars.setFloat("variable.g", c.g);
    vars.setFloat("variable.b", c.b);
    e.dimension.spawnParticle(GRIT, { x: p.x, y: p.y + 0.05, z: p.z }, vars);
  } catch {
    // Cosmetic only.
  }
}

// What it reads, each block once a second (platform/mc.js blockReader with gecko and thin, so a slab, stairs, a zoo
// fixture or other block that doesn't fill its space is "partial", never ground, and a chorus plant or flower the same;
// with leaves, so leaves are neither ground nor wall; with substrate and rock, so it knows the Mineral Substrate it digs
// into and the rock it scrapes, both solid ground).
function readerOf(e) {
  const base = blockReader(e.dimension, { gecko: true, leaves: true, thin: true, substrate: true, rock: true });
  return cached(base);
}

// The typeId of each block, once a second (to tell what it can dig into).
function idReaderOf(e) {
  return cached((x, y, z) => idAt(e, { x, y, z }));
}

function cached(base) {
  const seen = new Map();
  let stamp = system.currentTick;
  return (x, y, z) => {
    if (system.currentTick - stamp >= 20) {
      seen.clear();
      stamp = system.currentTick;
    }
    const k = `${x},${y},${z}`;
    let c = seen.get(k);
    if (c === undefined) {
      c = base(x, y, z);
      seen.set(k, c);
    }
    return c;
  };
}

// The point `by` blocks ahead of `l` the way `yaw` faces (Minecraft's: 0 faces +z, 90 faces -x).
function ahead(l, yaw, by) {
  const r = ((yaw ?? 0) * Math.PI) / 180;
  return { x: l.x - Math.sin(r) * by, y: l.y, z: l.z + Math.cos(r) * by };
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

const spotKey = (p) => `${p.x},${p.y},${p.z}`;

function dist(c, here) {
  return Math.hypot(c.x - here.x, c.z - here.z) + Math.abs(c.y - here.y) * 0.5;
}

function angleDiff(a, b) {
  return ((((a - b) % 360) + 540) % 360) - 180;
}

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
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
