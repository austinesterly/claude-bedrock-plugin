import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { reachesFeeder } from "../equipment/rules.js";
import { animalFromEntity, saveAnimal } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { smoothWay, wayLength, pointAlong, turnToward } from "./zebraRules.js";
import { DIRS, standable, headroom, crawlTick, cellsRound, comingOn, inTheWay, yawTo } from "./snailRules.js";
import { ACT, STARBACK_TYPES, SHELLED, bodyOf, warmthAfter, warmEnough, nextPhase, findWalk, chorusBeside, wildRestAt, isRoof, restOrder, startleFor } from "./starbackRules.js";

// Starback Tortoises (0.1.95, the End pair's second; spec 5.4 "Dark shell with star-like markings | Slow browsing and
// resting | End vegetation, warm pad, large retreat"; the rules are in animals/starbackRules.js). Every half second,
// for the tortoises near players. The End has no day or night, so it keeps to bouts: resting under its low roof
// (drawn halfway in), then out, first to bask on a Warm Pad till it's warm (in the open without one, warming slowly),
// then browsing the chorus at its foot (or the feeder, or the ground where there's no chorus), back to a pad when it
// has cooled, and after a few minutes back under the roof. Someone in Survival or Adventure coming close, not sneaking
// (nor holding its food or a carrier), or a hit: it pulls into its shell with a hiss, sits, then the head comes slowly
// out, it looks about and goes on; it never runs. A held Chorus Browse or chorus fruit draws it over to nibble at it.
// A female whose eggs are due digs a nest in the Mineral Substrate with her hind feet and pats it flat (the hatchlings
// dig out there, animals/nursery.js); the father comes to her grunting first. Two never end up on top of each other:
// one gives way, as the snail does. All its moving is the script's: it walks a tick at a time along a way of blocks
// (tickStarbackMoves, a teleport a tick, without gravity while it walks), on the level or down off a step, never up one.
// What it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const REST_PROP = "zoocraft:retreat"; // the cell it last rested in ("x,y,z"), kept on the mob
const HATCHED_PROP = "zoocraft:hatched"; // a hatchling's first meeting has been marked (the egg's crack heard)
const SPECIES_ID = "zoocraft:starback_tortoise";
const PAD = "zoocraft:warm_pad";

const state = new Map(); // entity id -> { e, body, mode, act, actUntil, after, yaw, bout, boutUntil, cool, restAt, restLeft, padAt, onPad, plantAt, phase, warmth, warmAt, fed, recent, search, seen, young, male, animalId, exId, expecting, courted, nestTry, avoid, homeTries }
// mode: "out" (choosing), "act", "walk", "bait", "court", "home" (looking for where to rest), "seek" (the wild look for
// chorus). bout: "rest" or "out" (boutUntil: when it goes back to rest). phase out: "bask" or "feed"
// (starbackRules.js nextPhase); warmth (0 to 1) as of warmAt. restAt: where it rests or is going to ("x,y,z", held for
// it in `held`), restLeft: what's left of a rest a startle cut short; padAt: the cell it basks in (held), onPad: on a
// Warm Pad there; plantAt: the chorus it browses ("chorus:x,y,z", held); recent: the chorus it last browsed; fed: it
// has been to the feeder this bout; seen: person id -> { x, z, d } (where they were when it last looked); expecting
// (a female): { father, since, nested } from her record; courted: the "female id:day" it last grunted at; nestTry:
// no nest to be had, it doesn't look again till then; avoid: { cell, x, z, at, until }, where one it gave up giving
// way to stood (its ways go round it).
const moving = new Map(); // entity id -> { e, pts, d, end, pace, act, yaw, face, at, read, body, goal, wait, waitMax, done }
const held = new Map(); // dimension id -> Map of key -> tortoise id (a retreat cell, a pad, chorus, a nest cell)

// Every 10 ticks: the tortoises near players.
export function tickStarbacks(now) {
  const T = BALANCE.starback;
  const players = onlinePlayers();
  const seen = new Map();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, STARBACK_TYPES);
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
    // No one near any more: it stays where it is, on the ground (gravity back), resting if it was.
    body(e, s, "ground");
    if (mv) e.teleport(mv.at, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
    if (s.act !== ACT.rest && !SHELLED.has(s.act)) setAct(e, ACT.none);
  } catch {
    // gone
  }
}

// A tortoise hit or hurt by a player (initStarbacks): it pulls in (hitTicks), or, in already, stays in longer.
export function starbackHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const s = state.get(entity.id);
  if (!s) return;
  const T = BALANCE.starback;
  const now = system.currentTick;
  const a = animalFromEntity(entity);
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  withdraw({ id: entity.id, e: entity, a, s, young: s.young, ex, wild: !ex }, now, startleFor(0, true, Boolean(ex), true, T), T);
}

// A wild one takes damage (entityHurt: an arrow too); one in a zoo takes none, so there's no hurt event for it, and a
// punch is heard as a hit (entityHitEntity). A hit that hurts comes through both: the second keeps it in.
export function initStarbacks() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        starbackHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: STARBACK_TYPES },
  );
  world.afterEvents.entityHitEntity.subscribe((ev) => {
    try {
      if (STARBACK_TYPES.includes(ev.hitEntity?.typeId)) starbackHurt(ev.hitEntity, ev.damagingEntity);
    } catch {
      // gone
    }
  });
}

// Every tick: walk the tortoises along their ways.
export function tickStarbackMoves() {
  const T = BALANCE.starback;
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
        const d = Math.min(mv.end, mv.d + mv.pace);
        const p = pointAlong(mv.pts, d);
        // Another just ahead: it waits till the way's clear; too long (two face to face), and it gives up the walk, its
        // next ways going round where the other is for a while. How long it waits is drawn each time (half to one and a
        // half waitTicks), so of two face to face one gives up first and the other goes on.
        const block = inTheWay(mv.at, { x: p.x - mv.at.x, z: p.z - mv.at.z }, othersNear(id, e), T);
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
        // It never climbs (a step is higher than it is): a block in its way stops the walk.
        if (r.how === "stuck" || r.how === "climb") {
          finish(id, mv, false);
          continue;
        }
        mv.d = d;
        if (p.dx || p.dz) mv.yaw = turnToward(mv.yaw, yawTo(p.dx, p.dz), T.turn);
        setAct(e, mv.act);
        e.teleport({ x: r.x, y: r.y, z: r.z }, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        if (r.how === "crawl" && Math.random() < T.stepSoundChance) sound(e, "mob.turtle.step", 0.15, 1.3);
        mv.at = { x: r.x, y: r.y, z: r.z };
        continue;
      }
      // There: it turns (slowly) to face where it means to (the chorus, the feeder, whoever holds the browse).
      if (mv.face !== undefined && Math.abs(angleDiff(mv.face, mv.yaw)) > 2) {
        mv.yaw = turnToward(mv.yaw, mv.face, T.turn);
        setAct(e, ACT.walk);
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

// ---------------- the tortoise ----------------
function member(e, now, T) {
  let s = state.get(e.id);
  const fresh = !s;
  if (!s) {
    const W = T.warm;
    s = { e, mode: "out", act: ACT.none, actUntil: 0, cool: 0, bout: "out", boutUntil: now + Math.floor(Math.random() * T.outTicks[1]), phase: "bask", warmth: W.start[0] + Math.random() * (W.start[1] - W.start[0]), warmAt: now, recent: [], seen: new Map() };
    state.set(e.id, s);
    // Met (again): on the ground with gravity; resting if it was (it rests on a while), in its shell if it was (it
    // peeks out).
    body(e, s, "ground");
    s.yaw = e.getRotation().y;
    const was = e.getProperty(PROP);
    if (was === ACT.rest) {
      const k = spotKey(cellOf(e.location));
      s.restAt = claim(e, k, e.id) ? k : undefined;
      s.bout = "rest";
      startActAt(e, s, now, ACT.rest, Math.floor(between(T.restTicks) / 2), s.yaw, "wake");
    } else if (SHELLED.has(was)) startActAt(e, s, now, ACT.peek, T.peekTicks, s.yaw, "look");
    else setAct(e, ACT.none);
  }
  s.e = e;
  const a = animalFromEntity(e);
  const young = a ? Boolean(a.juvenile) : isBaby(e);
  s.young = young;
  s.male = a ? a.sex === "male" : markOf(e) === 1;
  s.animalId = a?.id;
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  s.exId = ex?.id;
  s.expecting = a?.expecting && !young && !s.male ? { father: a.expecting.fatherId, since: a.expecting.since, nested: Boolean(a.expecting.nestAt) } : undefined;
  // A hatchling just dug out of its nest: the egg's crack, once.
  if (fresh && young && ex) hatched(e);
  return { id: e.id, e, a, s, young, ex, wild: !ex };
}

function step(m, now, players, T) {
  const { e, s } = m;
  warmUp(s, now, T);
  // Someone coming close: it pulls in (not in its shell already: it sees no one).
  if (!SHELLED.has(s.act)) {
    const stay = threatOf(m, players, T);
    if (stay) return withdraw(m, now, stay, T);
  } else lookRound(m, players, T);
  if (moving.has(m.id)) {
    // Plodding to someone's browse: they've put it away, so it stops; they've come up to it, so it stops and nibbles;
    // they've moved off from where it was going, so it heads for them again.
    if (s.mode === "bait") {
      const p = tempterOf(e, players, T);
      if (!p) {
        stopWalk(m);
        return settle(m, now, T);
      }
      const l = p.location;
      if (Math.hypot(l.x - e.location.x, l.z - e.location.z) <= T.reachFrom[1]) {
        stopWalk(m);
        return startAct(m, now, ACT.browse, T.baitTicks, yawTo(l.x - e.location.x, l.z - e.location.z), "settle");
      }
      const [gx, , gz] = moving.get(m.id).goal.split(",").map(Number);
      if (Math.hypot(gx + 0.5 - l.x, gz + 0.5 - l.z) > T.reachFrom[1] + 0.5) {
        stopWalk(m);
        return toBait(m, now, p, T);
      }
      return;
    }
    // Walking about when someone holds one out: it turns off for it.
    const tempter = (s.mode === "walk" || s.mode === "out") && !m.young ? tempterOf(e, players, T) : undefined;
    if (tempter) {
      stopWalk(m);
      return toBait(m, now, tempter, T);
    }
    return;
  }
  if (s.mode === "act") {
    if (now < s.actUntil) return acting(m, now, players, T);
    return finished(m, now, T);
  }
  if (s.mode === "seek") return seekChorus(m, now, T);
  if (now < s.cool) return;
  if (s.mode === "home") return home(m, now, T);
  // A held Chorus Browse or chorus fruit: over to it.
  const tempter = !m.young ? tempterOf(e, players, T) : undefined;
  if (tempter) return toBait(m, now, tempter, T);
  // A female whose eggs are due: to the Mineral Substrate to nest. Her mate: to her first, grunting.
  if (!m.wild && s.expecting && !s.expecting.nested && now >= (s.nestTry ?? 0)) return toNest(m, now, T);
  if (!m.wild && !m.young && s.male && courtTo(m, now, T)) return;
  // The bouts: out a while, then back under its roof to rest.
  if (s.bout === "rest" || now >= s.boutUntil) {
    s.mode = "home";
    s.search = undefined;
    s.homeTries = 0;
    return home(m, now, T);
  }
  choose(m, now, T);
}

// Its warmth since it was last worked out (starbackRules.js warmthAfter): basking on a pad or in the open, resting or
// in its shell, or out and about.
function warmUp(s, now, T) {
  const how = s.act === ACT.bask && s.mode === "act" ? (s.onPad ? "pad" : "open") : s.act === ACT.rest || SHELLED.has(s.act) ? "rest" : "out";
  s.warmth = warmthAfter(s.warmth, now - (s.warmAt ?? now), how, T.warm);
  s.warmAt = now;
}

// What it does next, out: basking till it's warm, then browsing (and now and then the feeder) till it has cooled.
function choose(m, now, T) {
  const { s } = m;
  s.phase = nextPhase(s.phase ?? "bask", s.warmth, Boolean(s.onPad), T.warm);
  const read = readerOf(m.e);
  const here = cellOf(m.e.location);
  if (s.phase === "bask") return baskChoice(m, now, read, here, T);
  if (!m.young && !s.fed && feederIn(m.ex) && Math.random() < T.feedChance && feedChoice(m, now, read, here, T)) return;
  browseChoice(m, now, read, here, T);
}

// ---------------- basking ----------------
// To a free Warm Pad (in a zoo the tortoise measure's, nearest first; anywhere, one under it), else a floor block in the
// open near it (no roof over it), else where it is; there it basks, legs splayed and neck stretched out, till it's warm.
function baskChoice(m, now, read, here, T) {
  const { e } = m;
  const can = walker(m, read);
  const taken = takenBy(m);
  // A pad is free unless another is still on it or on its way to it (one walking across it will be gone).
  const still = stillAt(m);
  const spots = [];
  if (idUnder(e, e.location) === PAD) spots.push(here);
  for (const [x, y, z] of m.ex?.tortoise?.padSpots ?? []) {
    const c = { x, y, z };
    if (idAt(e, { x, y: y - 1, z }) === PAD && can(c) && !still.has(spotKey(c)) && !restedIn(e, spotKey(c), m.id)) spots.push(c);
  }
  spots.sort((p, q) => dist(p, here) - dist(q, here));
  for (const c of spots.slice(0, 4)) if (baskAt(m, now, read, here, c, T)) return;
  // No pad to be had: the open.
  const open = openSpots(m, read, here, T).filter((c) => !taken.has(spotKey(c)) && !restedIn(e, spotKey(c), m.id));
  open.sort((p, q) => dist(p, here) - dist(q, here));
  for (const c of open.slice(0, 4)) if (baskAt(m, now, read, here, c, T)) return;
  bask(m, now, spotKey(here), T);
}

// To `c` to bask there (held for it): false when another holds it or there's no way.
function baskAt(m, now, read, here, c, T) {
  const k = spotKey(c);
  if (!claim(m.e, k, m.id)) return false;
  if (k === spotKey(here)) {
    bask(m, now, k, T);
    return true;
  }
  const can = walker(m, read);
  const way = wayTo(m, (x) => can(x) || spotKey(x) === k, read, here, c, T);
  if (!way) {
    unclaim(m.e, k, m.id);
    return false;
  }
  m.s.padAt = k;
  m.s.mode = "walk";
  walk(m, way, { act: ACT.walk, to: { x: c.x + 0.5, z: c.z + 0.5 } }, (ok) => {
    const t = system.currentTick;
    if (!ok) {
      unclaim(m.e, k, m.id);
      m.s.padAt = undefined;
      return settle(m, t, T);
    }
    bask(m, t, k, T);
  });
  return true;
}

function bask(m, now, k, T) {
  const { e, s } = m;
  s.padAt = k;
  claim(e, k, m.id);
  s.onPad = idUnder(e, e.location) === PAD;
  startAct(m, now, ACT.bask, T.baskMaxTicks, undefined, "basked");
}

// Floor blocks in the open within baskReach of it: no roof 2 over them (in a zoo its exhibit's floor; in the wild any
// block it can stand in).
function openSpots(m, read, here, T) {
  const can = walker(m, read);
  const out = [];
  if (!m.wild) {
    for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
      if (kind !== "land") continue;
      const [x, y, z] = k.split(",").map(Number);
      if (Math.hypot(x - here.x, z - here.z) > T.baskReach || Math.abs(y - here.y) > 2) continue;
      const c = { x, y, z };
      if (can(c) && !isRoof(read(x, y + 2, z))) out.push(c);
    }
    return out;
  }
  for (const c of cellsRound(here, T.baskReach, 1)) if (can(c) && !isRoof(read(c.x, c.y + 1, c.z)) && !isRoof(read(c.x, c.y + 2, c.z))) out.push(c);
  return out;
}

// ---------------- browsing ----------------
// To the chorus (in a zoo the tortoise measure's; in the wild a look round it), one no other is at and not one it just
// browsed, the last block slow, facing it; there it browses, neck stretched up, biting and tugging. No chorus to be
// had: it plods on a little and grazes the ground, head down.
function browseChoice(m, now, read, here, T) {
  const { e, s } = m;
  if (m.wild || !m.ex?.tortoise) {
    s.search = { cells: cellsRound(here, T.wildReach, 2), i: 0, found: [] };
    s.mode = "seek";
    setAct(e, ACT.look);
    return;
  }
  const ids = idReaderOf(e);
  const can = walker(m, read);
  const taken = takenBy(m);
  const spots = [];
  for (const [x, y, z, dx, dz] of m.ex.tortoise.plantSpots ?? []) {
    const c = { x, y, z };
    const plant = `chorus:${x + dx},${y},${z + dz}`;
    if (!chorusBeside(ids, c).some((i) => DIRS[i][0] === dx && DIRS[i][1] === dz)) continue;
    if (s.recent.includes(plant) || !free(e, plant, m.id)) continue;
    if (!can(c) || (taken.has(spotKey(c)) && spotKey(c) !== spotKey(here))) continue;
    spots.push({ x, y, z, dx, dz, plant });
  }
  // The nearest it can get to (the last few browsed left out, so it works its way round the ones near it).
  spots.sort((p, q) => dist(p, here) - dist(q, here));
  const near = spots.slice(0, 3);
  // Every chorus just browsed: the oldest is fair again.
  if (!near.length && s.recent.length && (m.ex.tortoise.plantSpots ?? []).length) s.recent.shift();
  if (toChorus(m, now, read, here, near, T)) return;
  graze(m, now, read, here, T);
}

// The wild look for chorus: the cells round it nearest first (snailRules.js cellsRound), scanChunk a half second, till
// it has found four (or looked at them all); meanwhile it looks about. Then to the nearest it can get to, or it grazes.
function seekChorus(m, now, T) {
  const { e, s } = m;
  const look = s.search;
  if (!look) return settle(m, now, T);
  const read = readerOf(e);
  const ids = idReaderOf(e);
  const can = walker(m, read);
  const taken = takenBy(m);
  const stop = Math.min(look.cells.length, look.i + T.scanChunk);
  for (; look.i < stop && look.found.length < 4; look.i++) {
    const c = look.cells[look.i];
    if (!can(c) || taken.has(spotKey(c))) continue;
    for (const i of chorusBeside(ids, c)) {
      const plant = `chorus:${c.x + DIRS[i][0]},${c.y},${c.z + DIRS[i][1]}`;
      if (s.recent.includes(plant) || !free(e, plant, m.id)) continue;
      look.found.push({ x: c.x, y: c.y, z: c.z, dx: DIRS[i][0], dz: DIRS[i][1], plant });
      break;
    }
  }
  if (look.i < look.cells.length && look.found.length < 4) return;
  s.search = undefined;
  s.mode = "out";
  if (!look.found.length && s.recent.length) s.recent.shift();
  if (toChorus(m, now, read, cellOf(e.location), look.found, T)) return;
  graze(m, now, read, cellOf(e.location), T);
}

// To one of `spots` ([{ x, y, z, dx, dz, plant }]: the floor cell, the way to the chorus, its key), the first it can get
// to (the chorus held for it), browsing it there. False when it can get to none.
function toChorus(m, now, read, here, spots, T) {
  const can = walker(m, read);
  for (const c of spots) {
    if (!claim(m.e, c.plant, m.id)) continue;
    const face = yawTo(c.dx, c.dz);
    const to = { x: c.x + 0.5 + c.dx * T.browseGap, z: c.z + 0.5 + c.dz * T.browseGap };
    const way = spotKey(c) === spotKey(here) ? [] : wayTo(m, can, read, here, c, T);
    if (!way) {
      unclaim(m.e, c.plant, m.id);
      continue;
    }
    m.s.plantAt = c.plant;
    m.s.mode = "walk";
    walk(m, way, { act: ACT.walk, to, face }, (ok) => {
      const t = system.currentTick;
      if (!ok) {
        dropPlant(m);
        return settle(m, t, T);
      }
      startAct(m, t, ACT.browse, T.browseTicks, face, "browsed");
    });
    return true;
  }
  return false;
}

// No chorus: it plods on a few blocks (grazeStep: in its exhibit, or anywhere it can stand in the wild) to fresh
// ground and grazes there, head down; where it is when it can get nowhere.
function graze(m, now, read, here, T) {
  const can = walker(m, read);
  const taken = takenBy(m);
  const [lo, hi] = T.grazeStep;
  const spots = cellsRound(here, hi, 1).filter((c) => c.d >= lo && can(c) && !taken.has(spotKey(c)) && !restedIn(m.e, spotKey(c), m.id));
  for (const c of shuffle(spots).slice(0, 3)) {
    const way = wayTo(m, can, read, here, c, T);
    if (!way) continue;
    m.s.mode = "walk";
    walk(m, way, { act: ACT.walk, to: { x: c.x + 0.5, z: c.z + 0.5 } }, (ok) => {
      const t = system.currentTick;
      if (!ok) return settle(m, t, T);
      startAct(m, t, ACT.eat, T.eatTicks, undefined, "pause");
    });
    return;
  }
  startAct(m, now, ACT.eat, T.eatTicks, undefined, "pause");
}

// ---------------- the feeder ----------------
// To a floor cell beside a Basic Feeder of its exhibit with Chorus Browse in it, facing it, reaching up to it; once a
// bout.
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
      const to = { x: c.x + 0.5 + (rec.pos.x - c.x) * T.browseGap, z: c.z + 0.5 + (rec.pos.z - c.z) * T.browseGap };
      const way = spotKey(c) === spotKey(here) ? [] : wayTo(m, can, read, here, c, T);
      if (!way) continue;
      m.s.mode = "walk";
      m.s.fed = true;
      walk(m, way, { act: ACT.walk, to, face }, (ok) => {
        const t = system.currentTick;
        if (!ok) return settle(m, t, T);
        startAct(m, t, ACT.browse, T.eatTicks, face, "pause");
      });
      return true;
    }
  }
  return false;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

// A feeder it eats from (equipment/rules.js reachesFeeder: a Basic Feeder) with food it eats in it.
function edible(rec) {
  const sp = SPECIES[SPECIES_ID];
  return Boolean(rec?.units > 0 && reachesFeeder(sp, rec) && sp.dietTags.includes(RATIONS[rec.item]?.diet));
}

// ---------------- someone near it ----------------
// Whoever startles it now (starbackRules.js startleFor): someone in Survival or Adventure, not sneaking, not holding
// its food or a carrier (they're tempting or catching it), coming on, near a wild one (inside its exhibit for one in a
// zoo). How long it stays in its shell, or 0. It notes where each one near it is as it looks.
function threatOf(m, players, T) {
  const { e, s, ex } = m;
  const cells = ex ? cellsOf(ex.id) : undefined;
  let stay = 0;
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
      stay = Math.max(stay, startleFor(d, comingOn(prev, l, d, T), !m.wild, false, T));
    } catch {
      // gone
    }
  }
  return stay;
}

// In its shell: it still notes where people are, so someone standing there isn't "coming on" when it's out.
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

// Pulled into its shell with a hiss, `stay` ticks, where it is (it never runs): then it peeks out, looks about and goes
// on (resting again, if it was). In its shell already: it stays in at least as long.
function withdraw(m, now, stay, T) {
  const { e, s } = m;
  if (SHELLED.has(s.act) && s.mode === "act") {
    if (s.act === ACT.peek) {
      startAct(m, now, ACT.withdraw, stay, undefined, "peek");
      sound(e, "mob.armadillo.roll", 0.3, 1.2);
    } else s.actUntil = Math.max(s.actUntil, now + stay);
    return;
  }
  if (moving.has(m.id)) stopWalk(m);
  // A rest cut short: what's left of it, after.
  if (s.act === ACT.rest && s.mode === "act") s.restLeft = Math.max(0, s.actUntil - now);
  if (s.act !== ACT.bask) dropPad(m);
  dropPlant(m);
  sound(e, "mob.cat.hiss", 0.25, 0.6);
  sound(e, "mob.armadillo.roll", 0.3, 1.2);
  startAct(m, now, ACT.withdraw, stay, undefined, "peek");
}

// ---------------- going to rest ----------------
// At a bout's end: under its low roof (starbackRules.js restOrder: the cell it last rested in, a free one nearest
// first, a wall's foot, where it is), the first it can walk to; there it rests, drawn halfway in.
function home(m, now, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const found = m.wild || !m.ex?.tortoise ? wildLook(m, read, here, T) : zooLook(m, read, here);
  if (!found) return; // still looking round (the wild look takes a few half seconds)
  s.search = undefined;
  dropPad(m);
  const can = walker(m, read);
  // Turned back on its way homeTries times (blocked, or startled and lost its claim): it rests where it is.
  const order = (s.homeTries ?? 0) >= T.homeTries ? [{ spot: here, kind: "here" }] : restOrder(found, e.location, T, m.wild ? undefined : Infinity);
  for (const { spot, kind } of order) {
    const k = spotKey(spot);
    const atHere = k === spotKey(here);
    if (!claim(e, k, m.id)) continue;
    if (kind === "here" || atHere) return rest(m, now, k, kind !== "here" && kind !== "wall", s.yaw, T);
    const allow = (c) => can(c) || spotKey(c) === k;
    // Round the others where it can; under its roof through one that's in the way if it must.
    const way = wayTo(m, allow, read, here, spot, T) ?? (kind !== "wall" ? wayTo(m, allow, read, here, spot, T, false) : undefined);
    if (!way) {
      unclaim(e, k, m.id);
      continue;
    }
    s.restAt = k;
    s.mode = "walk";
    walk(m, way, { act: ACT.walk, to: { x: spot.x + 0.5, z: spot.z + 0.5 } }, (ok) => {
      const t = system.currentTick;
      if (!ok) {
        unclaim(e, k, m.id);
        s.restAt = undefined;
        s.mode = "home";
        // Giving way isn't turning back: it goes on round the other.
        if (s.avoid?.at !== t) s.homeTries = (s.homeTries ?? 0) + 1;
        s.cool = t + T.coolTicks;
        return;
      }
      rest(m, t, k, kind !== "wall", s.yaw, T);
    });
    return;
  }
  rest(m, now, spotKey(here), false, s.yaw, T);
}

// Resting where it is (`k`, held for it), drawn halfway in, restTicks (or what's left of a rest a startle cut short).
// Under a roof it keeps the cell as its own (`own`: it comes back to it).
function rest(m, now, k, own, face, T) {
  const { e, s } = m;
  s.bout = "rest";
  s.restAt = k;
  claim(e, k, m.id);
  if (own) {
    try {
      e.setDynamicProperty(REST_PROP, k);
    } catch {
      // kept in the script only
    }
  }
  const ticks = s.restLeft || between(T.restTicks);
  s.restLeft = undefined;
  startAct(m, now, ACT.rest, ticks, face, "wake");
}

// The zoo's look for where to rest: the tortoise measure's cells under the low roof that are free, the floor's cells
// against a wall.
function zooLook(m, read, here) {
  const e = m.e;
  const can = walker(m, read);
  const roofed = [];
  for (const [x, y, z] of m.ex.tortoise.retreatSpots ?? []) {
    const c = { x, y, z };
    if (can(c) && isRoof(read(x, y + 2, z)) && !restedIn(e, spotKey(c), m.id)) roofed.push(c);
  }
  const walls = [];
  for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
    if (kind !== "land" || walls.length >= 32) continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.hypot(x - here.x, z - here.z) > BALANCE.starback.restReach) continue;
    const c = { x, y, z };
    if (wildRestAt(read, c) === "wall" && can(c) && !restedIn(e, k, m.id)) walls.push(c);
  }
  return { home: homeOf(e), roofed, walls };
}

// The wild look: the cells round it (nearest first, scanChunk a half second) for one under cover (an overhang, chorus
// overhead) or against a rock or a chorus stalk; the first under cover ends the look. Undefined while it's still
// looking.
function wildLook(m, read, here, T) {
  const { e, s } = m;
  if (!s.search || s.search.kind !== "rest") s.search = { kind: "rest", cells: cellsRound(here, T.restReach, T.restRise), i: 0, roofed: [], walls: [] };
  const look = s.search;
  const stop = Math.min(look.cells.length, look.i + T.scanChunk);
  for (; look.i < stop; look.i++) {
    const c = look.cells[look.i];
    if (restedIn(e, spotKey(c), m.id)) continue;
    const kind = wildRestAt(read, c);
    if (kind === "roof") {
      look.roofed.push({ x: c.x, y: c.y, z: c.z });
      look.i = look.cells.length;
      break;
    }
    if (kind === "wall" && look.walls.length < 4) look.walls.push({ x: c.x, y: c.y, z: c.z });
  }
  if (look.i < look.cells.length) return undefined;
  const mine = homeOf(e);
  const roofed = look.roofed;
  if (mine && Math.hypot(mine.x - here.x, mine.z - here.z) <= T.restReach && wildRestAt(read, mine) === "roof" && !restedIn(e, spotKey(mine), m.id) && !roofed.some((c) => spotKey(c) === spotKey(mine))) roofed.push(mine);
  return { home: mine, roofed, walls: look.walls };
}

// ---------------- a held Chorus Browse ----------------
// To a cell reachFrom blocks from whoever holds it (the nearest to them it can walk to), then neck stretched up toward
// it, nibbling, for as long as they hold it there.
function toBait(m, now, p, T) {
  const { e, s } = m;
  const l = p.location;
  const d = Math.hypot(l.x - e.location.x, l.z - e.location.z);
  const face = yawTo(l.x - e.location.x, l.z - e.location.z);
  dropPlant(m);
  dropPad(m);
  if (d <= T.reachFrom[1]) return startAct(m, now, ACT.browse, T.baitTicks, face, "settle");
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
  cands.sort((p1, p2) => dist(p1.c, here) - dist(p2.c, here) || p1.r - p2.r);
  for (const { c } of cands.slice(0, 4)) {
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    s.mode = "bait";
    walk(m, way, { act: ACT.walk, face: yawTo(l.x - (c.x + 0.5), l.z - (c.z + 0.5)) }, (ok) => {
      const t = system.currentTick;
      if (!ok) return settle(m, t, T);
      const who = tempterOf(e, onlinePlayers(), T);
      if (!who) return settle(m, t, T);
      startAct(m, t, ACT.browse, T.baitTicks, yawTo(who.location.x - e.location.x, who.location.z - e.location.z), "settle");
    });
    return;
  }
  // Nowhere near them it can get to (they're over a wall): it turns to them and looks.
  startAct(m, now, ACT.look, T.lookTicks, face, "settle");
}

// ---------------- nesting ----------------
// A female whose eggs are due (animals/nursery.js: mated, with Mineral Substrate in the floor): to a free cell of
// Mineral Substrate (the nearest few, by turns), where she digs with her hind feet nestTicks, lays, and pats it flat
// patTicks; the nest is kept on her record (expecting.nestAt), and the hatchlings dig out there. None to be had: she
// looks again in a while.
function toNest(m, now, T) {
  const { e, s } = m;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const can = walker(m, read);
  const taken = takenBy(m);
  const spots = substrateSpots(m, read).filter((c) => (spotKey(c) === spotKey(here) || !taken.has(spotKey(c))) && !restedIn(e, spotKey(c), m.id));
  spots.sort((p, q) => dist(p, here) - dist(q, here));
  for (const c of shuffle(spots.slice(0, 3))) {
    const k = spotKey(c);
    if (!claim(e, k, m.id)) continue;
    const dig = () => {
      dropPad(m);
      s.padAt = k; // the nest cell, held while she's at it
      startAct(m, system.currentTick, ACT.nest, T.nestTicks, undefined, "pat");
      sound(e, "mob.sniffer.digging", 0.25, 1.4);
    };
    if (k === spotKey(here)) {
      dig();
      return;
    }
    const way = wayTo(m, (x) => can(x) || spotKey(x) === k, read, here, c, T);
    if (!way) {
      unclaim(e, k, m.id);
      continue;
    }
    s.mode = "walk";
    walk(m, way, { act: ACT.walk, to: { x: c.x + 0.5, z: c.z + 0.5 } }, (ok) => {
      if (!ok) {
        unclaim(e, k, m.id);
        s.nestTry = system.currentTick + T.coolTicks * 10;
        return settle(m, system.currentTick, T);
      }
      dig();
    });
    return;
  }
  s.nestTry = now + T.nestRetry;
  choose(m, now, T);
}

// Her nest dug and patted flat: kept on her record, so the hatchlings dig out there.
function nested(m) {
  const { e, s } = m;
  const a = animalFromEntity(e);
  const at = cellOf(e.location);
  if (a?.expecting && !a.expecting.nestAt) {
    a.expecting.nestAt = { x: at.x, y: at.y, z: at.z };
    saveAnimal(a);
  }
  if (s.expecting) s.expecting.nested = true;
}

// The cells of its exhibit's floor over Mineral Substrate (it nests in them).
function substrateSpots(m, read) {
  const out = [];
  if (!m.ex) return out;
  const can = walker(m, read);
  const sub = blockReader(m.e.dimension, { substrate: true });
  for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (sub(x, y - 1, z) === "substrate" && can({ x, y, z })) out.push({ x, y, z });
  }
  return out;
}

// A male whose mate's eggs are newly due (she's still to nest): to a cell beside her, once, where he stretches his neck
// toward her and grunts (courtTicks). False when there's none to go to.
function courtTo(m, now, T) {
  const { e, s } = m;
  if (!s.animalId) return false;
  for (const [oid, o] of state) {
    if (oid === m.id || o.exId !== s.exId || o.expecting?.father !== s.animalId || o.expecting.nested) continue;
    const mark = `${oid}:${o.expecting.since}`;
    if (s.courted === mark) continue;
    s.courted = mark;
    try {
      if (!o.e?.isValid) continue;
      const p = o.e.location;
      if (Math.hypot(p.x - e.location.x, p.z - e.location.z) > T.courtRange) continue;
      const read = readerOf(e);
      const here = cellOf(e.location);
      const can = walker(m, read);
      const taken = takenBy(m);
      const pc = cellOf(p);
      const beside = [];
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (dx || dz) beside.push({ x: pc.x + dx, y: pc.y, z: pc.z + dz });
      beside.sort((p1, p2) => dist(p1, here) - dist(p2, here));
      const grunt = () => {
        const t = system.currentTick;
        const her = o.e.location;
        startAct(m, t, ACT.look, T.courtTicks, yawTo(her.x - e.location.x, her.z - e.location.z), "court");
        sound(e, "mob.turtle.ambient", 0.5, 0.6);
      };
      for (const c of beside.filter((x) => can(x) && !taken.has(spotKey(x))).slice(0, 4)) {
        const way = spotKey(c) === spotKey(here) ? [] : wayTo(m, can, read, here, c, T);
        if (!way) continue;
        s.mode = "court";
        walk(m, way, { act: ACT.walk }, (ok) => (ok ? grunt() : settle(m, system.currentTick, T)));
        return true;
      }
    } catch {
      // gone
    }
  }
  return false;
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

// While it rests, basks, browses, eats, digs, pats, looks or sits in its shell: as it was, with the sounds that go with
// it. Basking ends once it's warm; nibbling at a held browse goes on while they hold it near it; a male's grunts.
function acting(m, now, players, T) {
  const { e, s } = m;
  // Someone holding out its food: it leaves off basking (once it's warm enough to eat), browsing or grazing for it.
  if (!m.young && (s.act === ACT.eat || (s.act === ACT.browse && s.after !== "settle") || (s.act === ACT.bask && s.warmth >= T.warm.cooled))) {
    const p = tempterOf(e, players, T);
    if (p) return toBait(m, now, p, T);
  }
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.bask) {
    if (warmEnough(s.warmth, Boolean(s.onPad), T.warm)) s.actUntil = now;
  } else if (s.act === ACT.browse || s.act === ACT.eat) {
    if (Math.random() < 0.25) sound(e, "mob.armadillo.eat", 0.15, 0.8);
    // Nibbling at a held browse: on while they hold it near.
    if (s.after === "settle" && s.act === ACT.browse) {
      const p = tempterOf(e, players, T);
      if (p && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= T.reachFrom[1] + 0.7) {
        s.actUntil = Math.max(s.actUntil, now + 25); // past the next look (every 10 ticks)
        s.yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
      }
    }
  } else if (s.act === ACT.nest) {
    if (Math.random() < 0.3) sound(e, "mob.sniffer.digging", 0.2, 1.4);
  } else if (s.act === ACT.pat) {
    if (Math.random() < 0.3) sound(e, "mob.turtle.step", 0.25, 0.7);
  } else if (s.act === ACT.look && s.after === "court" && Math.random() < 0.3) {
    sound(e, "mob.turtle.ambient", 0.4, 0.6);
  }
}

// An act run its time: out of its shell after a startle (peeking, then looking about, then resting again or on); out
// of its rest into a bout; basked warm; on from a chorus to the next after a pause; the nest dug, then patted; else
// back to choosing.
function finished(m, now, T) {
  const { e, s } = m;
  const after = s.after;
  s.after = undefined;
  if (after === "peek") {
    sound(e, "mob.armadillo.peek", 0.4, 1);
    return startAct(m, now, ACT.peek, T.peekTicks, undefined, "look");
  }
  if (after === "look") return startAct(m, now, ACT.look, T.lookTicks, undefined, s.bout === "rest" ? "rest" : "settle");
  // Startled at rest: back to it for what was left (under its roof still), or, with little left, out into its bout.
  if (after === "rest" && (s.restLeft ?? 0) > T.coolTicks) return rest(m, now, s.restAt ?? spotKey(cellOf(e.location)), false, s.yaw, T);
  if (after === "rest" || after === "wake") {
    s.restLeft = undefined;
    if (s.restAt) unclaim(e, s.restAt, m.id);
    s.restAt = undefined;
    s.bout = "out";
    s.boutUntil = now + between(T.outTicks);
    s.phase = "bask";
    s.fed = false;
    return settle(m, now, T);
  }
  if (after === "basked") {
    dropPad(m);
    s.phase = nextPhase("bask", s.warmth, Boolean(s.onPad), T.warm);
    s.onPad = false;
    return settle(m, now, T);
  }
  if (after === "browsed") {
    if (s.plantAt) {
      s.recent.push(s.plantAt);
      while (s.recent.length > T.recentPlants) s.recent.shift();
    }
    dropPlant(m);
    return startAct(m, now, Math.random() < 0.3 ? ACT.look : ACT.none, T.pauseTicks, undefined, "settle");
  }
  if (after === "pause") return startAct(m, now, ACT.none, T.pauseTicks, undefined, "settle");
  if (after === "pat") {
    sound(e, "mob.turtle.step", 0.3, 0.7);
    return startAct(m, now, ACT.pat, T.patTicks, undefined, "nested");
  }
  if (after === "nested") {
    nested(m);
    dropPad(m);
  }
  settle(m, now, T);
}

// Out, still, choosing again after coolTicks.
function settle(m, now, T) {
  const { e, s } = m;
  s.mode = s.bout === "rest" ? "home" : "out";
  s.act = ACT.none;
  s.cool = now + T.coolTicks;
  body(e, s, "ground");
  setAct(e, ACT.none);
}

// The pad (or open block, or nest cell) it held, let go.
function dropPad(m) {
  if (m.s.padAt) unclaim(m.e, m.s.padAt, m.id);
  m.s.padAt = undefined;
}

function dropPlant(m) {
  if (m.s.plantAt) unclaim(m.e, m.s.plantAt, m.id);
  m.s.plantAt = undefined;
}

// ---------------- walking ----------------
// Walk through the blocks `cells` from where it is (smoothed round the bends: zebraRules.js smoothWay), then
// `done(ok)`. opts: act, pace, to (an exact end point { x, z }), face (a yaw to turn to there).
function walk(m, cells, opts, done) {
  const { e, s } = m;
  const T = BALANCE.starback;
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
    yaw: e.getRotation().y,
    face: opts.face,
    at: from,
    read,
    body: bodyOf(m.young, s.male),
    goal: spotKey(last),
    done,
  });
}

// Stopped where it is (startled, a held browse put away or held out): on the ground there, what it held let go.
function stopWalk(m) {
  const mv = moving.get(m.id);
  moving.delete(m.id);
  if (mv) m.s.yaw = mv.yaw;
  if (m.s.restAt && m.s.mode !== "act") {
    unclaim(m.e, m.s.restAt, m.id);
    m.s.restAt = undefined;
  }
  dropPad(m);
  dropPlant(m);
  body(m.e, m.s, "ground");
}

// The way to `to` through the blocks it can walk on (starbackRules.js findWalk: on the level or down a step): a cell
// list, or undefined. Round the others that are still (busy, resting: never walking through one), unless `round` is
// false.
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
      const on = findWalk(ok, clear, side, to, steps, nodes);
      if (on) return [side, ...on];
    }
  }
  return findWalk(ok, clear, here, to, steps, nodes);
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

// Its food held up (Chorus Browse, or a chorus fruit).
function baitHeld(id) {
  return id === SPECIES[SPECIES_ID].baitItem || id === "minecraft:chorus_fruit";
}

// Someone holding its food or an empty carrier: they're tempting or catching it.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return baitHeld(id) || carrierByItem(id)?.full === false;
}

// The nearest player within baitRange holding Chorus Browse or a chorus fruit, or undefined.
function tempterOf(e, players, T) {
  let best;
  let near = T.baitRange;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !baitHeld(heldItem(p)?.typeId ?? "")) continue;
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

// ---------------- the places it holds ----------------
function heldIn(e) {
  const id = e.dimension.id;
  let map = held.get(id);
  if (!map) held.set(id, (map = new Map()));
  return map;
}

// Hold `k` (a cell to rest or bask in, a nest, "chorus:x,y,z") for tortoise `id`: false when another holds it.
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

// Another tortoise rests in that cell (or is on its way to), or holds it.
function restedIn(e, k, id) {
  for (const [oid, o] of state) if (oid !== id && o.restAt === k) return true;
  return !free(e, k, id);
}

// The cells the other tortoises are in, or walking to ("x,y,z"): none of them a place to stop in (two never end up on
// top of each other).
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

// The cells the other tortoises are still in, or walking to and will stop in: its ways go round them (not round where
// a walking one is now: it'll be gone).
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

// Where the other tortoises within a block and a half of it are (walking or not, hatchlings too): the ones it gives way
// to.
function othersNear(id, e) {
  const out = [];
  const l = e.location;
  for (const [oid, o] of state) {
    if (oid === id) continue;
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

// The cell it last rested in under a roof, kept on the mob ({ x, y, z }), or undefined.
function homeOf(e) {
  try {
    const v = e.getDynamicProperty(REST_PROP);
    if (typeof v !== "string") return undefined;
    const [x, y, z] = v.split(",").map(Number);
    return [x, y, z].every(Number.isFinite) ? { x, y, z } : undefined;
  } catch {
    return undefined;
  }
}

// A hatchling met for the first time: the egg's crack as it digs out (once: marked on the mob).
function hatched(e) {
  try {
    if (e.getDynamicProperty(HATCHED_PROP)) return;
    e.setDynamicProperty(HATCHED_PROP, true);
    sound(e, "block.turtle_egg.crack", 0.6, 1.2);
  } catch {
    // Cosmetic only.
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

// What it reads, each block once a second (platform/mc.js blockReader with gecko and thin, so a slab, stairs, a zoo
// fixture or other block that doesn't fill its space is "partial", never ground, and a chorus plant or flower the same;
// with leaves, so leaves are neither ground nor wall).
function readerOf(e) {
  return cached(blockReader(e.dimension, { gecko: true, leaves: true, thin: true }));
}

// The typeId of each block, once a second (the chorus it browses).
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
