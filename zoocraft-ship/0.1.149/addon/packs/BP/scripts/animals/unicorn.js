import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { yawTo } from "./climbRules.js";
import { ACT, LYING_ACTS, UNICORN_TYPES, TROUGH, SPARKLE, isDay, pickInterest, flowerBeside, waterBeside, onGrass, sparkleAt } from "./unicornRules.js";

// Unicorns (0.1.149, the Mythical Glade; the rules are in animals/unicornRules.js). Every half second, for the unicorns
// near players only. The engine walks them (zoocraft:moving: a stroll, the Grain Ration they're tempted by, the way home
// in a zoo; a wild one also canters off from someone close); this picks what each heads for next and plays what it does
// there: to the glowing flowers (the entity's zoocraft:seek_flowers, a move_to_block) to graze them; grazing the grass
// where it stands; to water (zoocraft:seek_water) to touch its horn to it, sparkles rising from the water; to the feeder
// or Hay Rack; rearing up now and then; lying down for a rest by day and through the night. Someone sprinting close in
// a zoo and it freezes, head up and ears turning; in the wild anyone close in Survival who isn't sneaking or holding a
// Grain Ration makes it rear, and then it canters off. A foal follows its mother (the engine's follow_parent). What
// it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const SEEKS = { flowers: "flowers", feeder: "feeder", dip: "water" };

const state = new Map(); // entity id -> state (see step)

// Every 10 ticks: the unicorns near players.
export function tickUnicorns(now) {
  const seen = new Set();
  const players = onlinePlayers();
  let day = true;
  try {
    day = isDay(world.getTimeOfDay(), BALANCE.unicorn);
  } catch {
    // keep it day
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, UNICORN_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, day);
      } catch {
        state.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
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

// Its body: "move" (the engine walks it) or "still" (it stands or lies put). Each event swaps the other group out.
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "flowers", "feeder", "water" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
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

// What a block is (its typeId), for the rules; undefined where it can't be read.
function typeReader(e) {
  const d = e.dimension;
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}

const survival = (p) => {
  const m = String(p.getGameMode()).toLowerCase();
  return m === "survival" || m === "adventure";
};

function holdsBait(p, T) {
  const id = heldItem(p)?.typeId ?? "";
  return T.bait.includes(id) || carrierByItem(id)?.full === false;
}

// Someone close by holding its food or an empty carrier: it lets the engine's tempt bring it over.
function tempted(e, players, T) {
  return players.some((p) => p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.baitRange && holdsBait(p, T));
}

// What startles it: in the wild anyone in Survival close by, not sneaking or holding a Grain Ration; in a zoo someone
// sprinting close. The player, or undefined.
function startler(e, players, wild, T) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || !survival(p)) continue;
    const d = dist(p.location, e.location);
    if (wild ? d <= T.shyRange && !p.isSneaking && !holdsBait(p, T) : d <= T.alertRange && p.isSprinting) return p;
  }
  return undefined;
}

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:unicorn"].dietTags.includes(RATIONS[rec.item]?.diet));
}

function step(e, now, players, day) {
  const T = BALANCE.unicorn;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: ACT.none, actUntil: 0, cool: now + T.coolTicks, alertCool: 0 };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it is never stranded without its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const wild = !a;
  const scare = startler(e, players, wild, T);
  if (scare && now >= s.alertCool && !(s.phase === "act" && (s.act === ACT.rear || s.act === ACT.alert))) {
    s.alertCool = now + T.alertCool;
    const yaw = yawTo(scare.location.x - e.location.x, scare.location.z - e.location.z);
    if (s.phase === "act" && LYING_ACTS.includes(s.act)) {
      // Lying down: up first (the client's get-up), then it goes off as it would.
      finish(e, s, now);
      return;
    }
    if (wild) {
      // It rears, neighing, then canters off (the engine's avoid_mob_type, once it walks again).
      sound(e, "mob.horse.angry", 0.6, a?.juvenile ? 1.5 : 1.15);
      return void startAct(e, s, now, ACT.rear, T.rearTicks, yaw);
    }
    sound(e, "mob.horse.breathe", 0.5, 1.3); // a snort
    return void startAct(e, s, now, ACT.alert, T.alertTicks, yaw);
  }
  if (s.phase === "act") {
    if (s.act !== ACT.alert && s.act !== ACT.rear && tempted(e, players, T)) return finish(e, s, now); // held food: up and over
    if (s.act === ACT.rest && s.nightRest && day) {
      // Morning: up within a few seconds, not at the end of the night's lie-down (up to 2 minutes on).
      s.nightRest = false;
      s.actUntil = Math.min(s.actUntil, now + between(T.wakeTicks));
    }
    if (now < s.actUntil) return acting(e, s, now);
    if (s.act === ACT.rest && !day) {
      s.actUntil = now + between(T.restTicks); // it lies on through the night
      return;
    }
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return; // getting up: the client's get-up animation
    s.phase = "idle";
    body(e, s, "move");
  }
  // A wild one canters off from someone close (the engine's avoid_mob_type); held food brings either kind over.
  if ((wild && scare) || tempted(e, players, T)) return void seek(e, s, "none");
  if (Math.random() < T.ambientChance) sound(e, Math.random() < 0.7 ? "mob.horse.breathe" : "mob.horse.idle", 0.3, a?.juvenile ? 1.5 : 1.1);
  if (now >= s.interestUntil) choose(e, s, now, ex, day, T);
  if (now < s.cool || !e.isOnGround) return;
  const here = cellOf(e.location);
  const at = typeReader(e);
  if (s.interest === "flowers") tryFlowers(e, s, now, here, at, T);
  else if (s.interest === "graze") tryGraze(e, s, now, here, at, T);
  else if (s.interest === "dip") tryDip(e, s, now, here, at, T);
  else if (s.interest === "feeder") tryFeeder(e, s, now, here, ex, T) || tryGraze(e, s, now, here, at, T);
  else if (s.interest === "rear") {
    sound(e, "mob.horse.angry", 0.4, a?.juvenile ? 1.6 : 1.25);
    startAct(e, s, now, ACT.rear, T.rearTicks, undefined);
  } else if (s.interest === "rest") {
    startAct(e, s, now, ACT.rest, day ? T.dayRestTicks : T.restTicks, undefined);
    s.nightRest = !day;
  }
}

// What it heads for next (unicornRules.js pickInterest), from what its exhibit has (a wild one: what the glade has).
function choose(e, s, now, ex, day, T) {
  const t = ex?.unicorn;
  s.interest = pickInterest({ day, flowers: t ? t.flowers > 0 : true, grass: ex ? (ex.grassCells ?? 0) > 0 : true, water: t ? t.dips > 0 : true, feeder: feederIn(ex) }, T);
  s.interestUntil = now + between(T.interestTicks);
  seek(e, s, SEEKS[s.interest] ?? "none");
}

function startAct(e, s, now, act, ticks, yaw) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// Holding its pose, with the sounds of what it's doing; at the water, the sparkles.
function acting(e, s, now) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const r = Math.random();
  if ((s.act === ACT.graze || s.act === ACT.flowers) && r < 0.3) sound(e, s.atFeeder ? "mob.horse.eat" : "dig.grass", 0.3, s.atFeeder ? 1.2 : 1.4);
  else if (s.act === ACT.dip && s.sparkle && now >= s.dipFrom) {
    // From when the horn touches the water (the client lowers it over 0.8 s), sparkles rise from it every half second,
    // with a chime now and then.
    try {
      for (let i = 0; i < 3; i++) e.dimension.spawnParticle(SPARKLE, { x: s.sparkle.x + (Math.random() - 0.5) * 0.6, y: s.sparkle.y, z: s.sparkle.z + (Math.random() - 0.5) * 0.6 });
    } catch {
      // Cosmetic only.
    }
    if (!s.chimed || r < 0.25) {
      s.chimed = true;
      sound(e, "chime.amethyst_block", 0.6, 1.0 + Math.random() * 0.4);
    }
  }
}

// Done: on its feet again (after lying down, still a moment while it gets up), wandering a while before the next thing.
function finish(e, s, now) {
  const T = BALANCE.unicorn;
  const lying = LYING_ACTS.includes(s.act);
  s.act = ACT.none;
  s.atFeeder = false;
  s.sparkle = undefined;
  setAct(e, ACT.none);
  s.cool = now + T.coolTicks;
  s.interest = "wander";
  s.interestUntil = now + between(T.wanderTicks);
  if (lying) {
    s.phase = "up";
    s.actUntil = now + T.getUpTicks;
  } else {
    s.phase = "idle";
    body(e, s, "move");
  }
}

// At a glowing flower (in its cell or beside it): it faces it and grazes round it.
function tryFlowers(e, s, now, here, at, T) {
  const f = flowerBeside(at, here);
  if (!f) return false;
  s.atFeeder = false;
  return startAct(e, s, now, ACT.flowers, T.grazeTicks, f.dx || f.dz ? yawTo(f.dx, f.dz) : undefined);
}

// On grass: head down, grazing where it stands.
function tryGraze(e, s, now, here, at, T) {
  if (!onGrass(at, here)) return false;
  s.atFeeder = false;
  return startAct(e, s, now, ACT.graze, T.grazeTicks, undefined);
}

// Beside water: it faces it and lowers its horn to the surface; the sparkles rise from where the horn touches.
function tryDip(e, s, now, here, at, T) {
  const w = waterBeside(at, here);
  if (!w) return false;
  startAct(e, s, now, ACT.dip, T.dipTicks, yawTo(w.dx, w.dz));
  s.sparkle = sparkleAt(here, w, at(here.x + w.dx, w.y, here.z + w.dz) === TROUGH);
  s.dipFrom = now + T.dipReachTicks;
  s.chimed = false;
  return true;
}

// At a feeder or Hay Rack of its exhibit with Grain Rations in it: it eats from it the same way (a rack hangs a block up).
function tryFeeder(e, s, now, here, ex, T) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      for (const dy of [0, 1]) {
        const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y + dy, z: here.z + dz }));
        if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec)) continue;
        startAct(e, s, now, ACT.graze, T.grazeTicks, yawTo(dx, dz));
        s.atFeeder = true;
        return true;
      }
    }
  }
  return false;
}
