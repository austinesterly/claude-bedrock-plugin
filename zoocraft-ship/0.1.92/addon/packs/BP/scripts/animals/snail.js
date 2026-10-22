import { system, world, MolangVariableMap } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { db } from "../persistence/db.js";
import { animalFromEntity, liveEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { findWay, smoothWay, wayLength, pointAlong, turnToward } from "./zebraRules.js";
import { ACT, SNAIL_TYPES, DIRS, bodyOf, standable, headroom, creviceAt, wallFoot, crawlTick, restOrder, cellsRound, startle, comingOn, inTheWay, lineOn, addMark, markBright, markSits, trailNear, pickChoice, yawTo } from "./snailRules.js";

// Shimmer Snails (0.1.92, the End trio's second; spec 5.4 "Pale body, pearlescent spiral shell | Leaves a fading
// luminous trail | Mineral bed, shade, crevices"; the rules are in animals/snailRules.js). Every half second, for the
// snails near players. The End has no day or night, so it keeps to bouts: out a while (crawling about, grazing the
// Mineral Substrate or, in the wild, the end stone, eating at the feeder, looking about with its front raised and its
// eye stalks waving, following another's fresh trail and touching tentacles when it catches up), then it crawls to its
// resting place (its crevice, or a free one, or a wall's foot near where another rests, or any wall's foot, or where it
// is), goes in head first and seals itself in. As it crawls it lays a glowing trail, a mark every fifth of a block that
// fades over 45 seconds (dimmer marks under its head as it grazes or eats). Someone in Survival or Adventure close and
// coming on, not sneaking (nor holding its food or a carrier), or hitting it: it pulls into its shell a few seconds,
// then comes out, sooner each time again, and after a few times it stops pulling in for them until they leave it alone
// a minute. A held Mineral Pellet draws it over to reach up at it. Hatchlings crawl after their parent.
// All its moving is the script's: it crawls a tick at a time along a way of blocks (tickSnailMoves, a teleport a tick,
// without gravity while it crawls), up a step's face and down off one. What it's doing goes to the client through
// zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const REST_PROP = "zoocraft:rest"; // the crevice it last rested in ("x,y,z"), kept on the mob
const SPECIES_ID = "zoocraft:shimmer_snail";
const TRAIL = "zoocraft:snail_trail";
const HEAD = 0.33; // blocks from its middle to its mouth, grown

const state = new Map(); // entity id -> { e, body, mode, act, actUntil, after, yaw, bout, boutUntil, cool, restAt, search, trail, habits, seen, lead, feedAt, young, chase, avoid }
// restAt: the resting place it's crawling to or rests in ("x,y,z", held for it in `held` when it's a crevice); search: the
// wild look round for a resting place, a chunk each half second; trail: its marks ([{ x, y, z, t }]); habits: person id ->
// { n, last, stay } (getting used to them); seen: person id -> { x, z, d } (where they were when it last looked); chase:
// the cell a hatchling is crawling to after its parent ("x,y,z"); avoid: { cell, x, z, at, until }, where one it gave
// up giving way to stood at tick `at` (its ways go round it till then).
const moving = new Map(); // entity id -> { e, pts, d, end, pace, act, yaw, face, at, read, body, marks, travel, young, goal, wait, waitMax, done }
const held = new Map(); // dimension id -> Map of crevice key -> snail id (resting in it or on its way)

// Every 10 ticks: the snails near players.
export function tickSnails(now) {
  const T = BALANCE.snail;
  const players = onlinePlayers();
  const seen = new Map();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, SNAIL_TYPES);
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
    // No one near any more: it stays where it is, on the ground (gravity back), sealed in if it was resting.
    body(e, s, "ground");
    if (mv) e.teleport(mv.at, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
    if (s.act !== ACT.sealed) setAct(e, ACT.none);
  } catch {
    // gone
  }
}

// A snail hit or hurt by a player (initSnails): it pulls in, as for someone coming on.
export function snailHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const s = state.get(entity.id);
  if (!s || s.act === ACT.sealed || s.act === ACT.withdraw) return;
  const T = BALANCE.snail;
  const now = system.currentTick;
  const m = { id: entity.id, e: entity, s, young: isBaby(entity) };
  withdraw(m, now, damager.id, T);
}

// A wild one takes damage (entityHurt: an arrow too); one in a zoo takes none, so there's no hurt event for it, and a
// punch is heard as a hit (entityHitEntity). A hit that hurts comes through both: the second finds it pulled in.
export function initSnails() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        snailHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: SNAIL_TYPES },
  );
  world.afterEvents.entityHitEntity.subscribe((ev) => {
    try {
      if (SNAIL_TYPES.includes(ev.hitEntity?.typeId)) snailHurt(ev.hitEntity, ev.damagingEntity);
    } catch {
      // gone
    }
  });
}

// Every tick: crawl the snails along their ways.
export function tickSnailMoves() {
  const T = BALANCE.snail;
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
        // Another grown one just ahead: it waits, looking, till the way's clear; too long (two face to face), and it gives
        // up the crawl, its next ways going round where the other is for a while. How long it waits is drawn each time
        // (half to one and a half waitTicks), so of two face to face one gives up first and the other goes on.
        const block = mv.young ? undefined : inTheWay(mv.at, { x: p.x - mv.at.x, z: p.z - mv.at.z }, grownNear(id, e), T);
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
          setAct(e, ACT.look);
          continue;
        }
        mv.wait = 0;
        const r = crawlTick(mv.at, p, mv.read, mv.body, T);
        if (r.how === "stuck") {
          finish(id, mv, false);
          continue;
        }
        // Climbing a step's face it stays where it is across, its front raised, till it's up.
        if (r.how !== "climb") mv.d = d;
        if (p.dx || p.dz) mv.yaw = turnToward(mv.yaw, yawTo(p.dx, p.dz), T.turn);
        setAct(e, r.how === "climb" ? ACT.reach : mv.act);
        e.teleport({ x: r.x, y: r.y, z: r.z }, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        if (mv.marks && r.how === "crawl") {
          mv.travel += Math.hypot(r.x - mv.at.x, r.z - mv.at.z);
          // Only a mark that sits on a block's top goes in the trail others follow (not one pressed into a feeder's side).
          if (mv.travel >= T.markEvery) {
            mv.travel -= T.markEvery;
            if (markSits(mv.read, r)) {
              lay(e, r, mv.yaw, markBright(false, mv.young, T), mv.young, mv.read);
              const s = state.get(id);
              if (s) s.trail = addMark(s.trail, r, system.currentTick, T);
            }
          }
          if (Math.random() < T.crawlSoundChance) sound(e, "step.honey_block", 0.08, 1.6);
        }
        mv.at = { x: r.x, y: r.y, z: r.z };
        continue;
      }
      // There: it turns to face where it means to (into a crevice, at a feeder, at whoever holds a pellet).
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

// The crawl over (there, or stopped): on the ground again (gravity back) before whatever it does next, so it's never left
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

// ---------------- the snail ----------------
function member(e, now, T) {
  let s = state.get(e.id);
  if (!s) {
    s = { e, mode: "out", act: ACT.none, actUntil: 0, cool: 0, bout: "out", boutUntil: now + Math.floor(Math.random() * T.outTicks[1]), trail: [], habits: new Map(), seen: new Map() };
    state.set(e.id, s);
    // Met (again): on the ground with gravity; sealed in if it was resting (it rests on a while, then comes out).
    body(e, s, "ground");
    s.yaw = e.getRotation().y;
    if (e.getProperty(PROP) === ACT.sealed) {
      const k = spotKey(cellOf(e.location));
      if (creviceAt(readerOf(e), cellOf(e.location)) >= 0 && claim(e, k, e.id)) s.restAt = k;
      else s.restAt = undefined;
      s.bout = "rest";
      startActAt(e, s, now, ACT.sealed, Math.floor(between(T.restTicks) / 2), s.yaw, "wake");
    } else setAct(e, ACT.none);
  }
  s.e = e;
  const a = animalFromEntity(e);
  const young = a ? Boolean(a.juvenile) : isBaby(e);
  s.young = young;
  const ex = a?.location.kind === "exhibit" && !a.outside ? getExhibit(a.location.id) : undefined;
  return { id: e.id, e, a, s, young, ex, wild: !ex };
}

function step(m, now, players, T) {
  const { e, s } = m;
  s.trail = s.trail.filter((k) => now - k.t < T.trailTicks);
  // Someone close and coming on: it pulls in (not sealed in to rest: it's in already).
  if (s.act !== ACT.sealed && s.act !== ACT.withdraw && s.act !== ACT.emerge) {
    const who = threatOf(m, players, now, T);
    if (who && withdraw(m, now, who, T)) return;
  } else lookRound(m, players, T);
  if (moving.has(m.id)) {
    // Crawling to someone's pellet: they've put it away, so it stops.
    if (s.mode === "bait" && !tempterOf(e, players, T)) {
      stopCrawl(m);
      return settle(m, now, T);
    }
    // Crawling about when someone holds one out: it turns off for it.
    const tempter = s.mode === "crawl" && !m.young ? tempterOf(e, players, T) : undefined;
    if (tempter) {
      stopCrawl(m);
      return toBait(m, now, tempter, T);
    }
    // A hatchling crawling after its parent, and the parent's off somewhere else now: it turns after it.
    if (m.young && s.chase) {
      const parent = parentOf(m);
      if (!parent || spotKey(chaseCell(parent)) !== s.chase) {
        stopCrawl(m);
        return youngStep(m, now, T);
      }
    }
    return;
  }
  if (s.mode === "act") {
    // A hatchling grazing or looking about when its parent seals in beside it: it seals in too.
    if (m.young && (s.act === ACT.graze || s.act === ACT.look) && sealedBeside(m, T)) return youngStep(m, now, T);
    if (now < s.actUntil) return acting(m, now, players, T);
    return finished(m, now, players, T);
  }
  if (now < s.cool) return;
  if (s.mode === "home") return home(m, now, T);
  // A held Mineral Pellet: over to it.
  const tempter = tempterOf(e, players, T);
  if (tempter && !m.young) return toBait(m, now, tempter, T);
  if (m.young) return youngStep(m, now, T);
  // The bouts: out a while, then home to rest.
  if (s.bout === "out" && now >= s.boutUntil) {
    s.mode = "home";
    s.search = undefined;
    s.homeTries = 0;
    return home(m, now, T);
  }
  choose(m, now, T);
}

// What it does next, out and about.
function choose(m, now, T) {
  const { s } = m;
  const read = readerOf(m.e);
  const here = cellOf(m.e.location);
  const graze = m.wild ? onEndStone(m.e) : grazeSpots(m, here).length > 0;
  const trail = trailNear(trailsFor(m), m.e.location, now, T);
  const choice = pickChoice(T, { graze, feed: feederIn(m.ex), follow: Boolean(trail) });
  if (choice === "graze" && grazeChoice(m, now, read, here, T)) return;
  if (choice === "feed" && feedChoice(m, now, read, here, T)) return;
  if (choice === "follow" && trail && follow(m, now, trail, read, T)) return;
  if (choice === "look") return startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
  if (crawlAbout(m, now, read, here, T)) return;
  // Nowhere to crawl to (boxed in): it looks about instead.
  startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
  s.cool = now + T.coolTicks;
}

// About a few blocks: to a cell crawlAcross blocks off it can crawl to.
function crawlAbout(m, now, read, here, T) {
  const can = walker(m, read);
  const taken = takenBy(m);
  const cands = [];
  if (!m.wild) {
    for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
      if (kind !== "land") continue;
      const [x, y, z] = k.split(",").map(Number);
      const d = Math.hypot(x - here.x, z - here.z);
      if (d >= T.crawlAcross[0] && d <= T.crawlAcross[1] && Math.abs(y - here.y) <= 2 && !taken.has(k)) cands.push({ x, y, z });
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = T.crawlAcross[0] + Math.random() * (T.crawlAcross[1] - T.crawlAcross[0]);
      const x = Math.floor(here.x + 0.5 + Math.cos(a) * d);
      const z = Math.floor(here.z + 0.5 + Math.sin(a) * d);
      for (const dy of [0, 1, -1]) {
        const c = { x, y: here.y + dy, z };
        if (can(c) && !taken.has(spotKey(c))) {
          cands.push(c);
          break;
        }
      }
    }
  }
  shuffle(cands);
  for (const c of cands.slice(0, 6)) {
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    m.s.mode = "crawl";
    crawl(m, way, { act: ACT.crawl }, () => settle(m, system.currentTick, T));
    return true;
  }
  return false;
}

// Grazing: in a zoo to the Mineral Substrate (one of the nearest few cells over it), rasping with its head down; in the
// wild the end stone where it is.
function grazeChoice(m, now, read, here, T) {
  if (m.wild) {
    startAct(m, now, ACT.graze, T.grazeTicks, undefined, "settle");
    m.s.feedAt = now;
    return true;
  }
  const taken = takenBy(m);
  const spots = grazeSpots(m, here).filter((c) => !taken.has(spotKey(c))).sort((p, q) => dist(p, here) - dist(q, here)).slice(0, 4);
  shuffle(spots);
  const can = walker(m, read);
  for (const c of spots) {
    if (c.x === here.x && c.y === here.y && c.z === here.z) {
      startAct(m, now, ACT.graze, T.grazeTicks, undefined, "settle");
      m.s.feedAt = now;
      return true;
    }
    const way = wayTo(m, can, read, here, c, T);
    if (!way?.length) continue;
    m.s.mode = "crawl";
    crawl(m, way, { act: ACT.crawl }, (ok) => {
      if (!ok) return settle(m, system.currentTick, T);
      m.s.feedAt = system.currentTick;
      startAct(m, system.currentTick, ACT.graze, T.grazeTicks, undefined, "settle");
    });
    return true;
  }
  return false;
}

// Eating: to a floor cell beside a feeder of its exhibit with Mineral Pellets in it, facing it.
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
      const eat = () => {
        m.s.feedAt = system.currentTick;
        startAct(m, system.currentTick, ACT.graze, T.eatTicks, face, "settle");
      };
      if (c.x === here.x && c.y === here.y && c.z === here.z) {
        m.s.mode = "crawl";
        crawl(m, [], { act: ACT.crawl, to: { x: c.x + 0.5, z: c.z + 0.5 }, face }, (ok) => (ok ? eat() : settle(m, system.currentTick, T)));
        return true;
      }
      const way = wayTo(m, can, read, here, c, T);
      if (!way?.length) continue;
      m.s.mode = "crawl";
      crawl(m, way, { act: ACT.crawl, face }, (ok) => (ok ? eat() : settle(m, system.currentTick, T)));
      return true;
    }
  }
  return false;
}

// Following a fresh trail: along the other's marks from the nearest one on, toward where it is now, its head low; up
// with it, they touch tentacles.
function follow(m, now, trail, read, T) {
  const other = state.get(trail.id);
  if (!other) return false;
  const marks = other.trail.slice(trail.i);
  if (marks.length < 2) return false;
  const can = walker(m, read);
  // The marks lie where the other crawled; it follows only while they're still on ground it can crawl on.
  // Along it while it's on ground it can crawl on, and not through another that's still there.
  const still = stillAt(m);
  let n = 0;
  const body = bodyOf(m.young);
  while (n < marks.length && can(cellOf(marks[n])) && !still.has(spotKey(cellOf(marks[n]))) && (n === 0 || lineOn(can, marks[n - 1], marks[n], read, body))) n++;
  // Up to touching distance behind the other, never onto it.
  const o = other.e.location;
  while (n > 0 && Math.hypot(marks[n - 1].x - o.x, marks[n - 1].z - o.z) < T.touchReach) n--;
  if (n < 2) return false;
  // To the trail: straight if that's all ground it can crawl on, else round by its way (not over a feeder in between).
  const from = m.e.location;
  let lead = [];
  if (!lineOn(can, from, marks[0], read, body)) {
    const way = wayTo(m, can, read, cellOf(from), cellOf(marks[0]), T);
    if (!way) return false;
    lead = smoothWay(from, way, (c) => read(c.x, c.y, c.z) === "air").slice(1);
  }
  m.s.mode = "crawl";
  crawlPoints(m, [...lead, ...marks.slice(0, n)], { act: ACT.follow }, (ok) => {
    const t = system.currentTick;
    const o = state.get(trail.id);
    if (ok && o?.e?.isValid && Math.hypot(o.e.location.x - m.e.location.x, o.e.location.z - m.e.location.z) <= T.touchReach + T.markEvery * 2 && o.act !== ACT.sealed && o.act !== ACT.withdraw) {
      const face = yawTo(o.e.location.x - m.e.location.x, o.e.location.z - m.e.location.z);
      startAct(m, t, ACT.touch, T.touchTicks, face, "settle");
      // The other, if it's still, touches back.
      if (!moving.has(trail.id) && (o.mode === "out" || o.act === ACT.look || o.act === ACT.none)) {
        startActAt(o.e, o, t, ACT.touch, T.touchTicks, yawTo(m.e.location.x - o.e.location.x, m.e.location.z - o.e.location.z), "settle");
      }
      return;
    }
    settle(m, t, T);
  });
  return true;
}

// ---------------- going home to rest ----------------
// At a bout's end: to its resting place (snailRules.js restOrder: its crevice, a free one, a wall's foot near another's
// rest, any wall's foot, where it is), the first of them it can crawl to; in, head first; sealed.
function home(m, now, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  const read = readerOf(e);
  const here = cellOf(e.location);
  const found = m.wild ? wildLook(m, read, here, T) : zooLook(m, read, here, T);
  if (!found) return; // still looking round (the wild look takes a few half seconds)
  s.search = undefined;
  const can = walker(m, read);
  // Turned back on its way there homeTries times (blocked, or startled and lost its claim): it rests where it is.
  // In a zoo every crevice of its exhibit is one to go to (the crevice measure found them); in the wild those it found.
  const order = (s.homeTries ?? 0) >= T.homeTries ? [{ spot: here, kind: "here" }] : restOrder(found, e.location, T, m.wild ? undefined : Infinity);
  const taken = takenBy(m);
  for (const { spot, kind } of order) {
    const k = spotKey(spot);
    if (kind === "here") return rest(m, now, k, false, undefined, T);
    if ((kind === "home" || kind === "crevice") && !claim(e, k, m.id)) continue;
    // A wall's foot another has taken since it looked (resting there, on its way, or in it): the next one.
    if ((kind === "gather" || kind === "wall") && (restedIn(e, k, m.id) || taken.has(k))) continue;
    const allow = (c) => can(c) || spotKey(c) === k;
    // Round the others where it can; to its crevice through one that's in the way if it must (it's going in to rest).
    const crevice = kind === "home" || kind === "crevice";
    const way = spotKey(here) === k ? [] : wayTo(m, allow, read, here, spot, T) ?? (crevice ? wayTo(m, allow, read, here, spot, T, false) : undefined);
    if (!way) {
      if (kind === "home" || kind === "crevice") unclaim(e, k, m.id);
      continue;
    }
    // Into a crevice head first (facing in, away from its way out); against a wall facing it.
    const face = spot.way !== undefined ? yawTo(-DIRS[spot.way][0], -DIRS[spot.way][1]) : wallFace(read, spot);
    s.restAt = k;
    s.mode = "crawl";
    crawl(m, way, { act: ACT.crawl, to: { x: spot.x + 0.5, z: spot.z + 0.5 }, face }, (ok) => {
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
      rest(m, t, k, kind === "home" || kind === "crevice", face, T);
    });
    return;
  }
  rest(m, now, spotKey(here), false, undefined, T);
}

// Sealed in where it is (`k`, its cell): restTicks. A crevice it keeps as its own (it comes back to it).
function rest(m, now, k, crevice, face, T) {
  const { e, s } = m;
  s.mode = "act";
  s.bout = "rest";
  s.restAt = k;
  if (crevice) {
    try {
      e.setDynamicProperty(REST_PROP, k);
    } catch {
      // kept in the script only
    }
  }
  sound(e, "step.slime", 0.25, 1.4);
  startAct(m, now, ACT.sealed, T.restTicks, face, "wake");
}

// The zoo's look for a resting place: its exhibit's crevices (the crevice measure's, still crevices and free), the
// walls' feet of its floor within restReach, where the others rest.
function zooLook(m, read, here, T) {
  const e = m.e;
  const crevices = [];
  for (const [x, y, z] of m.ex.crevices?.spots ?? []) {
    const c = { x, y, z };
    const way = creviceAt(read, c);
    if (way >= 0 && free(e, spotKey(c), m.id)) crevices.push({ x, y, z, way });
  }
  const feet = [];
  for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.hypot(x - here.x, z - here.z) > T.restReach || Math.abs(y - here.y) > T.restRise) continue;
    const c = { x, y, z };
    if (wallFoot(read, c) && !restedIn(e, k, m.id)) feet.push(c);
  }
  return { home: homeOf(e), crevices, feet, rests: restsNear(m) };
}

// The wild look: the cells round it (snailRules.js cellsRound, nearest first), scanChunk a half second, for a free
// crevice (the nearest found ends the look) and the walls' feet; its own crevice first, if it's still there and free.
// Undefined while it's still looking.
function wildLook(m, read, here, T) {
  const e = m.e;
  const s = m.s;
  const mine = homeOf(e);
  if (!s.search) {
    if (mine && Math.hypot(mine.x - here.x, mine.z - here.z) <= T.restReach && creviceAt(read, mine) >= 0 && free(e, spotKey(mine), m.id)) {
      return { home: mine, crevices: [{ ...mine, way: creviceAt(read, mine) }], feet: [], rests: [] };
    }
    s.search = { cells: cellsRound(here, T.restReach, T.restRise), i: 0, crevices: [], feet: [] };
  }
  const look = s.search;
  const stop = Math.min(look.cells.length, look.i + T.scanChunk);
  for (; look.i < stop; look.i++) {
    const c = look.cells[look.i];
    const way = creviceAt(read, c);
    if (way >= 0 && free(e, spotKey(c), m.id)) {
      look.crevices.push({ x: c.x, y: c.y, z: c.z, way });
      look.i = look.cells.length;
      break;
    }
    if (look.feet.length < 12 && wallFoot(read, c) && !restedIn(e, spotKey(c), m.id)) look.feet.push({ x: c.x, y: c.y, z: c.z });
  }
  if (look.i < look.cells.length) return undefined;
  return { home: mine, crevices: look.crevices, feet: look.feet, rests: restsNear(m) };
}

// Where the other snails near it rest (sealed in), for gathering.
function restsNear(m) {
  const out = [];
  for (const [id, o] of state) {
    if (id === m.id || o.act !== ACT.sealed || !o.e?.isValid) continue;
    try {
      if (o.e.dimension.id !== m.e.dimension.id) continue;
      out.push(cellOf(o.e.location));
    } catch {
      // gone
    }
  }
  return out;
}

// Which way it faces resting against a wall: toward the first solid block beside it.
function wallFace(read, c) {
  for (const [dx, dz] of DIRS) if (read(c.x + dx, c.y, c.z + dz) !== "air") return yawTo(dx, dz);
  return undefined;
}

// ---------------- pulling in ----------------
// Who startles it now: someone in Survival or Adventure, not sneaking, not holding its food or a carrier (they're
// tempting or catching it), within startleRange of a wild one (zooStartleRange inside its exhibit for one in a zoo),
// coming on (snailRules.js comingOn). Their id, or undefined. It notes where each one near it is as it looks.
function threatOf(m, players, now, T) {
  const { e, s, ex } = m;
  const cells = ex ? cellsOf(ex.id) : undefined;
  let who;
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
      if (who || !survival(p) || p.isSneaking || tempting(p)) continue;
      if (m.wild ? d > T.startleRange : d > T.zooStartleRange || !cells?.has(spotKey(cellOf(l)))) continue;
      if (!comingOn(prev, l, d, T)) continue;
      who = p.id;
    } catch {
      // gone
    }
  }
  return who;
}

// While it's in its shell: it still notes where people are, so someone standing there isn't "coming on" when it's out.
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

// Into its shell for a while (snailRules.js startle: less each time again, not at all once it's used to them). True
// when it pulled in.
function withdraw(m, now, whoId, T) {
  const { e, s } = m;
  const r = startle(s.habits.get(whoId), now, T);
  s.habits.set(whoId, r.habit);
  if (s.habits.size > 16) for (const [k, h] of [...s.habits]) if (now - h.last > T.habitWindow) s.habits.delete(k);
  if (!r.withdraw) return false;
  if (moving.has(m.id)) stopCrawl(m);
  sound(e, "mob.slime.squish", 0.2, 1.6);
  startAct(m, now, ACT.withdraw, r.stay, undefined, "emerge");
  return true;
}

// ---------------- a held Mineral Pellet ----------------
// To a cell reachFrom blocks from whoever holds it (the nearest to them it can crawl to), then reaching up at it for as
// long as they hold it there.
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
    crawl(m, way, { act: ACT.crawl, face: yawTo(l.x - (c.x + 0.5), l.z - (c.z + 0.5)) }, (ok) => {
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

// ---------------- hatchlings ----------------
// A hatchling keeps near its parent: farther than youngNear[1] blocks, it crawls to a cell beside it; with its parent
// sealed in to rest, it seals itself in beside it; otherwise it grazes or looks about where it is.
function youngStep(m, now, T) {
  const { e, s } = m;
  const parent = parentOf(m);
  s.chase = undefined;
  const ps = sealedBeside(m, T);
  if (ps) {
    sound(e, "step.slime", 0.15, 1.8);
    return startAct(m, now, ACT.sealed, Math.max(20, ps.actUntil - now), s.yaw, "emerge");
  }
  if (parent) {
    const d = Math.hypot(parent.location.x - e.location.x, parent.location.z - e.location.z);
    if (d > T.youngNear[1]) {
      const read = readerOf(e);
      const here = cellOf(e.location);
      const can = walker(m, read);
      const taken = takenBy(m);
      // Beside where its parent is crawling to (it's quicker), or where it is.
      const pc = chaseCell(parent);
      // Beside it, nearest to the hatchling first; those taken (its brood round a crevice), a block farther out.
      const near = [];
      for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (dx || dz) near.push({ x: pc.x + dx, y: pc.y, z: pc.z + dz, ring: Math.max(Math.abs(dx), Math.abs(dz)) });
      near.sort((p, q) => p.ring - q.ring || dist(p, here) - dist(q, here));
      for (const c of near.filter((x) => can(x) && !taken.has(spotKey(x))).slice(0, 6)) {
        const way = wayTo(m, can, read, here, c, T);
        if (!way?.length) continue;
        s.mode = "crawl";
        s.chase = spotKey(pc);
        crawl(m, way, { act: ACT.crawl }, () => settle(m, system.currentTick, T));
        return;
      }
    }
  }
  if (Math.random() < 0.5) {
    s.feedAt = now;
    return startAct(m, now, ACT.graze, T.grazeTicks, undefined, "settle");
  }
  startAct(m, now, ACT.look, T.lookTicks, undefined, "settle");
}

// A hatchling's parent (the first of its parents), if it's about.
function parentOf(m) {
  const id = m.a?.parents?.[0];
  return id ? liveEntity(id) : undefined;
}

// A hatchling's parent's state when the parent is sealed in to rest within youngNear[1] of it, else undefined.
function sealedBeside(m, T) {
  const parent = parentOf(m);
  const ps = parent ? state.get(parent.id) : undefined;
  if (ps?.act !== ACT.sealed) return undefined;
  return Math.hypot(parent.location.x - m.e.location.x, parent.location.z - m.e.location.z) <= T.youngNear[1] ? ps : undefined;
}

// The cell a hatchling heads for after its parent: where the parent is crawling to, else where it is.
function chaseCell(parent) {
  const goal = moving.get(parent.id)?.goal;
  if (!goal) return cellOf(parent.location);
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

// While it grazes, eats, looks, reaches, touches or is in its shell: as it was, with the sounds that go with it.
// Grazing or eating, a dim mark under its head every feedMarkEvery ticks. Reaching, it goes on while they hold the
// pellet near it.
function acting(m, now, players, T) {
  const { e, s } = m;
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.graze) {
    if (Math.random() < 0.3) sound(e, m.ex && nearFeeder(m) ? "mob.armadillo.eat" : "brush.generic", 0.15, 1.6);
    if (now - (s.feedAt ?? 0) >= T.feedMarkEvery) {
      s.feedAt = now;
      const f = facing(s.yaw ?? e.getRotation().y);
      const k = (m.young ? 0.35 : 1) * HEAD;
      const l = e.location;
      lay(e, { x: l.x + f.x * k, y: l.y, z: l.z + f.z * k }, s.yaw ?? 0, markBright(true, m.young, T), m.young, readerOf(e));
    }
  }
  if (s.act === ACT.reach) {
    const p = tempterOf(e, players, T);
    if (p && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= T.reachFrom[1] + 0.7) {
      s.actUntil = Math.max(s.actUntil, now + 10);
      s.yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
    }
  }
}

// An act run its time: out of its shell after a startle or a rest (the emerge act), else back to choosing.
function finished(m, now, players, T) {
  const { e, s } = m;
  const after = s.after;
  s.after = undefined;
  if (after === "emerge") {
    sound(e, "mob.armadillo.unroll_start", 0.2, 1.5);
    return startAct(m, now, ACT.emerge, T.emergeTicks, undefined, "settle");
  }
  if (after === "wake") {
    if (s.restAt) unclaim(e, s.restAt, m.id);
    s.restAt = undefined;
    s.bout = "out";
    s.boutUntil = now + between(T.outTicks);
    sound(e, "mob.armadillo.unroll_start", 0.2, 1.4);
    return startAct(m, now, ACT.emerge, T.emergeTicks, undefined, "settle");
  }
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

// ---------------- crawling ----------------
// Crawl through the blocks `cells` from where it is (smoothed round the bends: zebraRules.js smoothWay), then
// `done(ok)`. opts: act, to (an exact end point { x, z }), face (a yaw to turn to there).
function crawl(m, cells, opts, done) {
  const e = m.e;
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const read = readerOf(e);
  const pts = smoothWay(from, cells, (c) => read(c.x, c.y, c.z) === "air");
  if (opts.to) {
    if (pts.length === 1) pts.push({ x: opts.to.x, y: from.y, z: opts.to.z });
    else pts[pts.length - 1] = { x: opts.to.x, y: pts[pts.length - 1].y, z: opts.to.z };
  }
  const last = cells.length ? cells[cells.length - 1] : cellOf(from);
  go(m, pts, { ...opts, goal: spotKey(last) }, done);
}

// Crawl through the points `pts` (another's trail) from where it is.
function crawlPoints(m, pts, opts, done) {
  const e = m.e;
  const end = pts[pts.length - 1];
  go(m, [{ x: e.location.x, y: e.location.y, z: e.location.z }, ...pts], { ...opts, goal: spotKey(cellOf(end)) }, done);
}

function go(m, pts, opts, done) {
  const { e, s } = m;
  const T = BALANCE.snail;
  const flat = pts.map((p) => ({ x: p.x, y: 0, z: p.z }));
  body(e, s, "glide");
  s.act = opts.act;
  moving.set(m.id, {
    e,
    pts: flat,
    d: 0,
    end: wayLength(flat),
    pace: m.young ? T.youngPace : T.pace,
    act: opts.act,
    yaw: e.getRotation().y,
    face: opts.face,
    at: { x: e.location.x, y: e.location.y, z: e.location.z },
    read: readerOf(e),
    body: bodyOf(m.young),
    marks: true,
    travel: 0,
    young: m.young,
    goal: opts.goal,
    done,
  });
}

// Stopped where it is (a startle, a pellet put away): on the ground there.
function stopCrawl(m) {
  const mv = moving.get(m.id);
  moving.delete(m.id);
  if (mv) m.s.yaw = mv.yaw;
  if (m.s.restAt && m.s.mode !== "act") {
    unclaim(m.e, m.s.restAt, m.id);
    m.s.restAt = undefined;
  }
  body(m.e, m.s, "ground");
}

// The way to `to` through the blocks it can crawl on (zebraRules.js findWay): a cell list, or undefined. Round the others
// that are still (grazing, looking, resting: never crawling through one), unless `round` is false.
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

// Where it can crawl: its exhibit's floor (not up on its feeders and fixtures), or, in the wild, any block of room
// with solid ground under it (snailRules.js standable: never over the void, nor onto a slab or a chorus stalk).
function walker(m, read) {
  if (m.wild) return (c) => standable(read, c);
  const cells = cellsOf(m.ex.id);
  const tops = equipmentTops(m.ex);
  return (c) => {
    const k = spotKey(c);
    return cells?.get(k) === "land" && !tops.has(k) && standable(read, c);
  };
}

// ---------------- the trail ----------------
// A glowing mark at `p` (its feet, or under its head grazing), lying flat along `yaw`: the particle (its size, brightness
// and heading as molang variables: gen/snail.py's zoocraft:snail_trail), where it lies on a block's top (snailRules.js
// markSits). The marks others follow are its crawl's (tickSnailMoves), kept in its trail.
function lay(e, p, yaw, bright, young, read) {
  if (!markSits(read, p)) return;
  const f = facing(yaw);
  try {
    const vars = new MolangVariableMap();
    vars.setFloat("variable.size", young ? 0.35 : 1);
    vars.setFloat("variable.bright", bright);
    vars.setFloat("variable.dx", f.x);
    vars.setFloat("variable.dz", f.z);
    e.dimension.spawnParticle(TRAIL, { x: p.x, y: p.y + 0.02, z: p.z }, vars);
  } catch {
    // Cosmetic only.
  }
}

// The fresh trails it could follow: the other grown snails' (in a zoo, of its own exhibit).
function trailsFor(m) {
  const out = [];
  const exId = m.ex?.id;
  for (const [id, o] of state) {
    if (id === m.id || o.young || !o.trail.length) continue;
    try {
      if (!o.e.isValid || o.e.dimension.id !== m.e.dimension.id) continue;
      const a = animalFromEntity(o.e);
      const oex = a?.location.kind === "exhibit" && !a.outside ? a.location.id : undefined;
      if (oex !== exId) continue;
      out.push({ id, marks: o.trail, at: o.e.location });
    } catch {
      // gone
    }
  }
  return out;
}

// ---------------- around it ----------------
// The cells of its exhibit's floor over Mineral Substrate within grazeReach.
function grazeSpots(m, here) {
  const T = BALANCE.snail;
  const out = [];
  if (!m.ex) return out;
  const sub = blockReader(m.e.dimension, { substrate: true });
  for (const [k, kind] of cellsOf(m.ex.id) ?? []) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.hypot(x - here.x, z - here.z) > T.grazeReach || Math.abs(y - here.y) > 2) continue;
    if (sub(x, y - 1, z) === "substrate") out.push({ x, y, z });
  }
  return out;
}

function onEndStone(e) {
  const c = cellOf(e.location);
  return idAt(e, { x: c.x, y: c.y - 1, z: c.z }) === "minecraft:end_stone";
}

function nearFeeder(m) {
  const e = m.e;
  for (const id of m.ex?.feederIds ?? []) {
    const rec = db.get("equipment", id);
    if (rec?.pos && Math.hypot(rec.pos.x + 0.5 - e.location.x, rec.pos.z + 0.5 - e.location.z) <= 1.6) return true;
  }
  return false;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES[SPECIES_ID].dietTags.includes(RATIONS[rec.item]?.diet));
}

// The cells over the exhibit's feeders and other equipment, which it never crawls onto ("x,y,z").
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

// The nearest player within baitRange holding Mineral Pellets, or undefined.
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

// ---------------- the crevices ----------------
function heldIn(e) {
  const id = e.dimension.id;
  let map = held.get(id);
  if (!map) held.set(id, (map = new Map()));
  return map;
}

// Hold the crevice `k` for snail `id`: false when another snail holds it.
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

// Another snail rests in that cell (or is on its way to rest there).
function restedIn(e, k, id) {
  for (const [oid, o] of state) if (oid !== id && o.restAt === k) return true;
  return !free(e, k, id);
}

// The cells the other snails are in, or crawling to ("x,y,z"): none of them a place to stop in (two never end up on top
// of each other).
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

// The cells the other snails are still in, or crawling to and will stop in: its ways go round them (not round where a
// crawling one is now: it'll be gone).
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

// Where the other grown snails within a block and a half of it are (crawling or not): the ones it gives way to.
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

// The crevice it last rested in, kept on the mob ({ x, y, z }), or undefined.
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

// ---------------- the mob ----------------
// Its body: "glide" (no gravity, the script crawling it) or "ground" (resting on what's under it). Each event swaps the
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

const idAt = (e, pos) => {
  try {
    return e.dimension.getBlock(pos)?.typeId;
  } catch {
    return undefined;
  }
};

// What it reads, each block once a second (platform/mc.js blockReader with gecko and thin, so a slab, stairs or other
// block that doesn't fill its space is "partial", never ground, and a chorus plant or flower, a thin stalk, the same;
// with leaves, so leaves are neither ground nor wall: what the crevice measure reads).
function readerOf(e) {
  const base = blockReader(e.dimension, { gecko: true, leaves: true, thin: true });
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

// The way a yaw faces, as a unit vector in x and z (Minecraft's: 0 faces +z, 90 faces -x).
function facing(yaw) {
  const r = (yaw * Math.PI) / 180;
  return { x: -Math.sin(r), z: Math.cos(r) };
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
