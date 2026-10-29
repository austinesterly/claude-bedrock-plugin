import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem, blockReader, biomeAt, message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { memberOfAny } from "../park/park.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { yawTo } from "./climbRules.js";
import { foundPlaces, findPlace } from "../world/places.js";
import { ACT, LYING_ACTS, SKULKER_TYPES, isDay, pickInterest, hearing, madeSound, restAct } from "./skulkerRules.js";
import { cityScore, isNewCity, hideSpot } from "./ancientCityRules.js";

// Skulkers (0.1.139, the cave wing; the rules are in animals/skulkerRules.js). Every half second, for the skulkers near
// players only. The engine walks them (zoocraft:moving: a stroll, the Insect Ration they're tempted by, the way home in
// a zoo; zoocraft:visit: over to someone it heard, the entity's follow_mob after a player tagged zoocraft_heard); this
// picks what each does next and plays it. Blind, it hears: someone moving within T.hearRange blocks without sneaking
// and it stops to listen, its tendrils quivering and clicking, turned to them; then walks over (the visit) and sniffs
// them, its heart beating fast (zoocraft:excited), and wanders off, paying no heed to sounds for a while. Never hostile:
// it has no attack. By day it wanders, listens, sits now and then, and eats at its feeder; at night it digs into the
// sculk where it stands and rests buried with its tendrils showing (only to look at: nothing is changed), or sits. A
// sound wakes it: it rises (the warden's emerge) and listens. What it's doing goes to the client through zoocraft:act.
// Ancient Cities (tickAncientCities): a park member walking into one for the first time finds it (Places), and the
// first time anyone does, one Skulker is placed resting out of their sight nearby.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const EXCITED = "zoocraft:excited";
const TAG = "zoocraft_heard"; // a player a skulker is walking over to (its follow_mob's filter)

const state = new Map(); // entity id -> state (see step)
const lastSeen = new Map(); // player id -> { tick, x, y, z }: where they were at the last look
const tagged = new Set(); // players given the tag this session
const tagChecked = new Set(); // players whose tag (left from before a reload) was looked at
const placedResting = new Set(); // entity ids of city Skulkers just placed: they start resting

// Every 10 ticks: the skulkers near players.
export function tickSkulkers(now) {
  const seen = new Set();
  const players = onlinePlayers();
  /** @type {Set<string>} */
  const visiting = new Set();
  let day = true;
  try {
    day = isDay(world.getTimeOfDay(), BALANCE.skulker);
  } catch {
    // keep it day
  }
  let heard;
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, SKULKER_TYPES);
    } catch {
      continue;
    }
    if (!list.length) continue;
    heard ??= sounds(players, now);
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, heard, day);
        const s = state.get(e.id);
        if (s?.phase === "visit" && s.target) visiting.add(s.target);
      } catch {
        state.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
  tags(players, visiting);
}

/** @typedef {{ id: string, location: import("@minecraft/server").Vector3, dimension: string, player: import("@minecraft/server").Player }} Heard */

// Who made a sound since the last look (half a second ago): moved without sneaking. Where everyone is is kept for the
// next look; a look longer ago than that (no skulker was near) counts nothing.
/** @returns {Heard[]} */
function sounds(players, now) {
  const T = BALANCE.skulker;
  const out = [];
  for (const p of players) {
    let loc;
    let sneaking;
    let spectator;
    let dimension;
    try {
      loc = p.location;
      sneaking = p.isSneaking;
      spectator = String(p.getGameMode()).toLowerCase() === "spectator";
      dimension = p.dimension.id;
    } catch {
      continue;
    }
    const was = lastSeen.get(p.id);
    if (madeSound(was && now - was.tick <= 12 ? was : undefined, loc, sneaking, spectator, T.moveMin)) out.push({ id: p.id, location: loc, dimension, player: p });
    lastSeen.set(p.id, { tick: now, x: loc.x, y: loc.y, z: loc.z });
  }
  for (const id of [...lastSeen.keys()]) if (!players.some((p) => p.id === id)) lastSeen.delete(id);
  return out;
}

// The tag a skulker's walk follows: on the players one is walking over to, off everyone else (a tag left from before a
// reload too, looked at once a session).
function tags(players, visiting) {
  for (const p of players) {
    try {
      if (visiting.has(p.id)) {
        if (!tagged.has(p.id)) {
          p.addTag(TAG);
          tagged.add(p.id);
        }
      } else if (tagged.has(p.id) || !tagChecked.has(p.id)) {
        tagChecked.add(p.id);
        tagged.delete(p.id);
        if (p.hasTag(TAG)) p.removeTag(TAG);
      }
    } catch {
      // gone; next time
    }
  }
}

// Anywhere from range[0] to range[1] ticks.
/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its heart beating fast (the client's heartbeat): while it has heard someone and until it has sniffed them.
function setExcited(e, on) {
  if (e.getProperty(EXCITED) !== on) e.setProperty(EXCITED, on);
}

// Its body: "move" (the engine walks it), "still" (it stands, sits or lies put) or "visit" (the engine walks it over to
// someone it heard). Each event swaps the others out.
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks a zoo one toward: "feeder" or "none" (a wild one has no seeking).
function seek(e, s, what) {
  if (s.seek === what || s.wild) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}

function holdsBait(p, T) {
  const id = heldItem(p)?.typeId ?? "";
  return T.bait.includes(id) || carrierByItem(id)?.full === false;
}

// Someone close by holding its food or an empty carrier: it lets the engine's tempt bring it over.
function tempted(e, players, T) {
  return players.some((p) => p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.baitRange && holdsBait(p, T));
}

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:skulker"].dietTags.includes(RATIONS[rec.item]?.diet));
}

function playerById(players, id) {
  return players.find((p) => p.id === id);
}

// The yaw from it to someone.
function yawToward(e, p) {
  return yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
}

/** @param {Heard[]} heard */
function step(e, now, players, heard, day) {
  const T = BALANCE.skulker;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", wild: e.typeId === "zoocraft:wild_skulker", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: ACT.none, actUntil: 0, cool: now + T.coolTicks, hearCool: 0, target: undefined, downAt: 0 };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it is never stranded without its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
    setExcited(e, false);
    if (placedResting.delete(e.id)) rest(e, s, now, T.restTicks); // a city's Skulker, placed resting
  }
  const a = s.wild ? undefined : animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const bait = tempted(e, players, T);
  // A sound: someone moving close without sneaking. It wakes from a rest (rising out of the sculk, or getting up) and
  // listens; busy with someone already, or for a while after a visit, it pays no heed.
  if (!s.target && !bait && now >= s.hearCool) {
    const h = hearing(e.location, e.dimension.id, heard, T.hearRange);
    if (h) heardSomeone(e, s, now, h.player);
  }
  if (s.phase === "visit") return visit(e, s, now, players, T);
  if (s.phase === "act") {
    if (s.target && (s.act === ACT.listen || s.act === ACT.sniff)) {
      const p = playerById(players, s.target);
      if (p && p.dimension.id === e.dimension.id) s.yaw = yawToward(e, p); // turned to them
    }
    if (bait && !s.target) return finish(e, s, now); // held food: up and over
    if (now < s.actUntil) return acting(e, s);
    if (s.act === ACT.listen && s.target) return startVisit(e, s, now, players, T);
    if (LYING_ACTS.includes(s.act) && !day && !s.target) {
      s.actUntil = now + between(T.restTicks); // it rests on through the night
      return;
    }
    if (s.act === ACT.sniff) return met(e, s, now, T);
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return; // getting up, or rising out of the sculk: the client's animation
    s.phase = "idle";
    setAct(e, ACT.none);
    body(e, s, "move");
    if (s.target) {
      const p = playerById(players, s.target);
      if (p && p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.followRange) return void listen(e, s, now, p, T);
      forget(e, s, now, T.hearCool / 2);
    }
  }
  if (bait) return void seek(e, s, "none");
  if (Math.random() < T.ambientChance) sound(e, "mob.warden.idle", 0.2, a?.juvenile ? 1.8 : 1.4); // a low rumble
  if (now >= s.interestUntil) choose(e, s, now, ex, day, T);
  if (now < s.cool || !e.isOnGround) return;
  if (s.interest === "feeder") tryFeeder(e, s, now, ex, T);
  else if (s.interest === "listen") startAct(e, s, now, ACT.listen, T.listenIdleTicks, undefined);
  else if (s.interest === "sit") startAct(e, s, now, ACT.sit, T.sitTicks, undefined);
  else if (s.interest === "rest") rest(e, s, now, day ? T.sitTicks : T.restTicks);
}

// What it does next (skulkerRules.js pickInterest), from what its exhibit has (a wild one: no feeder).
function choose(e, s, now, ex, day, T) {
  s.interest = pickInterest({ day, feeder: feederIn(ex) }, T);
  s.interestUntil = now + between(T.interestTicks);
  seek(e, s, s.interest === "feeder" ? "feeder" : "none");
}

function startAct(e, s, now, act, ticks, yaw) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  if (act === ACT.buried) s.downAt = now;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// A rest: dug into the sculk where it stands (or a sculk vein), sitting anywhere else.
function rest(e, s, now, ticks) {
  const here = { x: Math.floor(e.location.x), y: Math.floor(e.location.y + 0.01), z: Math.floor(e.location.z) };
  let under;
  let at;
  try {
    under = e.dimension.getBlock({ x: here.x, y: here.y - 1, z: here.z })?.typeId;
    at = e.dimension.getBlock(here)?.typeId;
  } catch {
    // read as neither
  }
  const act = restAct(under, at);
  if (act === ACT.buried) sound(e, "mob.warden.dig", 0.3, 1.4);
  return startAct(e, s, now, act, ticks, undefined);
}

// Holding its pose, with the sounds of what it's doing.
function acting(e, s) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const r = Math.random();
  if (s.act === ACT.listen && r < (s.target ? 0.5 : 0.15)) sound(e, "mob.warden.listening", s.target ? 0.35 : 0.2, 1.4);
  else if (s.act === ACT.sniff && r < 0.4) sound(e, "mob.warden.sniff", 0.35, 1.4);
  else if (s.act === ACT.feed && r < 0.4) sound(e, "mob.armadillo.eat", 0.35, 0.8);
  if (s.target && Math.random() < 0.25) sound(e, "mob.warden.heartbeat", 0.25, 1.3);
}

// Done: on its feet again (after sitting or rising out of the sculk, still a moment while it gets up), wandering a while
// before the next thing.
function finish(e, s, now) {
  const T = BALANCE.skulker;
  const was = s.act;
  s.act = ACT.none;
  s.cool = now + T.coolTicks;
  s.interest = "wander";
  s.interestUntil = now + between(T.wanderTicks);
  if (was === ACT.buried) {
    // The warden's emerge, after its dig down has finished.
    s.phase = "up";
    s.actUntil = now + T.emergeTicks + Math.max(0, s.downAt + T.digTicks - now);
    setAct(e, ACT.emerge);
    sound(e, "mob.warden.emerge", 0.3, 1.4);
  } else if (was === ACT.sit) {
    s.phase = "up";
    s.actUntil = now + T.getUpTicks;
    setAct(e, ACT.none);
  } else {
    s.phase = "idle";
    setAct(e, ACT.none);
    body(e, s, "move");
  }
}

// It heard someone: it wakes (rising or getting up first) and listens, turned to them.
function heardSomeone(e, s, now, p) {
  const T = BALANCE.skulker;
  s.target = p.id;
  setExcited(e, true);
  sound(e, "mob.warden.clicking", 0.4, 1.4); // its tendrils click
  if (s.phase === "act") {
    if (LYING_ACTS.includes(s.act)) return finish(e, s, now); // up first: it listens after
    finish(e, s, now);
  }
  if (s.phase === "idle") listen(e, s, now, p, T);
}

function listen(e, s, now, p, T) {
  startAct(e, s, now, ACT.listen, T.listenTicks, yawToward(e, p));
  sound(e, "mob.warden.listening", 0.4, 1.4);
}

// Over to them: the engine's follow_mob after the tagged player (tickSkulkers tags them).
function startVisit(e, s, now, players, T) {
  const p = playerById(players, s.target);
  if (!p || p.dimension.id !== e.dimension.id || dist(p.location, e.location) > T.followRange) return forget(e, s, now, T.hearCool / 2);
  s.phase = "visit";
  s.act = ACT.none;
  setAct(e, ACT.none);
  seek(e, s, "none");
  body(e, s, "visit");
  s.visitUntil = now + T.visitTicks;
  s.lastAt = { x: e.location.x, y: e.location.y, z: e.location.z };
  s.stillSince = now;
}

// On its way: close enough and it sniffs them; stopped short (a wall, the glass of its exhibit) but near, it sniffs from
// there; gone, too far or too long and it gives up.
function visit(e, s, now, players, T) {
  const p = playerById(players, s.target);
  if (!p || p.dimension.id !== e.dimension.id) return forget(e, s, now, T.hearCool / 2);
  const d = Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z);
  if (dist(e.location, s.lastAt) > 0.3) {
    s.lastAt = { x: e.location.x, y: e.location.y, z: e.location.z };
    s.stillSince = now;
  }
  if (d <= T.meetRange || (now - s.stillSince >= T.stuckTicks && d <= T.meetReach)) {
    sound(e, "mob.warden.sniff", 0.4, 1.4);
    return void startAct(e, s, now, ACT.sniff, T.meetTicks, yawToward(e, p));
  }
  if (now >= s.visitUntil || d > T.followRange) return forget(e, s, now, T.hearCool / 2);
  if (Math.random() < 0.2) sound(e, "mob.warden.heartbeat", 0.25, 1.3);
}

// Sniffed them: calm again, off on its way, paying no heed to sounds for a while.
function met(e, s, now, T) {
  forget(e, s, now, T.hearCool);
}

function forget(e, s, now, cool) {
  s.target = undefined;
  s.hearCool = now + cool;
  setExcited(e, false);
  finish(e, s, now);
}

// At a feeder of its exhibit with Insect Rations in it: it eats.
function tryFeeder(e, s, now, ex, T) {
  const here = { x: Math.floor(e.location.x), y: Math.floor(e.location.y + 0.01), z: Math.floor(e.location.z) };
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      for (const dy of [0, 1]) {
        const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y + dy, z: here.z + dz }));
        if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec)) continue;
        return startAct(e, s, now, ACT.feed, T.feedTicks, yawTo(dx, dz));
      }
    }
  }
  return false;
}

// ---------------- Ancient Cities ----------------
const CITIES = "cities"; // one record, { id: "ancient", list: [{ x, z }] }: the Ancient Cities a Skulker was placed in
const nextCityLook = new Map(); // player id -> tick

// Every 20 ticks (each player looked at every T.city.every ticks): a park member in the deep dark, deep enough, with
// Ancient City blocks round them (ancientCityRules.js cityScore) finds the place; in a city no one found before, one
// Skulker is placed resting 12 to 24 blocks off, out of their sight, to be found (kept: it never despawns).
export function tickAncientCities(now) {
  const C = BALANCE.skulker.city;
  for (const p of onlinePlayers()) {
    if ((nextCityLook.get(p.id) ?? 0) > now) continue;
    nextCityLook.set(p.id, now + C.every);
    try {
      lookForCity(p, C);
    } catch {
      // unloaded round them; next time
    }
  }
}

function lookForCity(p, C) {
  const d = p.dimension;
  const loc = p.location;
  if (d.id !== "minecraft:overworld" || loc.y > C.depth || !memberOfAny(p)) return;
  if (biomeAt(d, loc)?.id !== "minecraft:deep_dark") return;
  const rec = db.get(CITIES, "ancient") ?? { id: "ancient", list: [] };
  const known = !isNewCity(rec.list, loc, C.spacing);
  if (known && foundPlaces(p).ancient_city) return;
  const idAt = (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
  if (cityScore(idAt, loc, 12, 3, [-3, -1, 1, 3], C.score) < C.score) return;
  findPlace(p, "ancient_city", loc);
  if (known) return;
  rec.list.push({ x: Math.floor(loc.x), z: Math.floor(loc.z) });
  db.put(CITIES, rec);
  const kindAt = blockReader(d, { gecko: true, thin: true, leaves: true });
  const blocked = (eye, to) => {
    const v = { x: to.x - eye.x, y: to.y - eye.y, z: to.z - eye.z };
    const len = Math.hypot(v.x, v.y, v.z);
    return Boolean(d.getBlockFromRay(eye, { x: v.x / len, y: v.y / len, z: v.z / len }, { maxDistance: len - 0.5, includeLiquidBlocks: false, includePassableBlocks: false }));
  };
  const spot = hideSpot(kindAt, blocked, p.getHeadLocation(), loc, { min: C.hide[0], max: C.hide[1] });
  if (!spot) return;
  const e = d.spawnEntity("zoocraft:wild_skulker", spot, { initialPersistence: true });
  placedResting.add(e.id);
  try {
    p.playSound("mob.warden.heartbeat", { location: spot, volume: 0.6, pitch: 1.3 });
  } catch {
    // Cosmetic only.
  }
  message(p, "§8Somewhere close by in the dark, a heart beats slowly.");
}
