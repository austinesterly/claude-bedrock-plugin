import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { dayFor } from "../park/park.js";
import { animalFromEntity, liveEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { yawTo } from "./climbRules.js";
import { ACT, LYING_ACTS, OKAPI_TYPES, MOTHER_TAG, isDay, pickInterest, plantsBeside, clayBeside, trunkBeside, pickPlant } from "./okapiRules.js";

// Lush Okapis (0.1.137, the cave wing; the rules are in animals/okapiRules.js). Every half second, for the okapis near
// players only. The engine walks them (zoocraft:moving: a stroll, the Leafy Ration they're tempted by, the way home in
// a zoo; a wild one also walks off from someone close); this picks what each heads for next and plays what it does
// there: to the lush plants (the entity's zoocraft:seek_browse, a move_to_block) to strip their leaves with its long
// tongue, one plant then another; to the feeder; to clay to lick; a grown male to a tree trunk to rub his neck on, or to
// curl his lip at a female near him; washing an eye or an ear with the tongue where it stands; lying down for a rest by
// day and through the night. Out by day only (cave_facts.md). Someone sprinting close in a zoo, or anyone close in
// Survival without sneaking or a Leafy Ration in the wild, and it freezes, head up and ears turning, then walks off.
// A calf lies hidden its first park day in the covered spot it was born in (animals/nursery.js), legs tucked; now and
// then it gets up and walks to its mother (she leaves off what she is doing, getting up first if lying down, and stands
// and waits, tagged MOTHER_TAG: the calf's zoocraft:to_mother, an engine follow_mob that follows only her), nurses while
// she licks it, and lies down again. After that it follows her (the engine's follow_parent) and now and then goes to
// her the same way to nurse. What it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const SEEKS = { browse: "browse", feeder: "feeder", clay: "clay", rub: "rub" };

const state = new Map(); // entity id -> state (see step)

// Every 10 ticks: the okapis near players.
export function tickOkapis(now) {
  const seen = new Set();
  const players = onlinePlayers();
  let day = true;
  try {
    day = isDay(world.getTimeOfDay(), BALANCE.okapi);
  } catch {
    // keep it day
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, OKAPI_TYPES);
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

// What the engine walks it toward: "browse", "feeder", "clay", "rub" or "none".
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

// What startles it: in the wild anyone in Survival close by, not sneaking or holding a Leafy Ration; in a zoo someone
// sprinting close. The player, or undefined.
function startler(e, players, wild, T) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || !survival(p)) continue;
    const d = dist(p.location, e.location);
    if (wild ? d <= T.shyRange && !p.isSneaking && !holdsBait(p, T) : d <= T.alertRange && p.isSprinting) return p;
  }
  return undefined;
}

// A grown male: his record's sex in a zoo; a wild one's minecraft:mark_variant (1 a male).
function isMale(e, a) {
  if (a) return a.sex === "male" && !a.juvenile;
  try {
    return e.getComponent("minecraft:mark_variant")?.value === 1;
  } catch {
    return false;
  }
}

// The grown females near a male (okapis of either kind, not young, mark_variant 0).
function femalesNear(e, T) {
  try {
    return entitiesNear(e.dimension, e.location, T.flehmenRange, OKAPI_TYPES).filter((o) => o.id !== e.id && !o.getComponent("minecraft:is_baby") && (o.getComponent("minecraft:mark_variant")?.value ?? 0) === 0);
  } catch {
    return [];
  }
}

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:okapi"].dietTags.includes(RATIONS[rec.item]?.diet));
}

function step(e, now, players, day) {
  const T = BALANCE.okapi;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: ACT.none, actUntil: 0, cool: now + T.coolTicks, alertCool: 0, nurseAt: now + between(T.nurseEvery) };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it is never stranded without its walking, and no calf on its
    // way to it (a nursing left off when the mobs were unloaded).
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
    if (e.typeId === "zoocraft:okapi") e.triggerEvent("zoocraft:from_mother"); // a zoo one's (the wild one has no calves)
    if (e.hasTag(MOTHER_TAG)) e.removeTag(MOTHER_TAG);
  }
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const young = Boolean(a?.juvenile && ex);
  // A young one on its way to its mother, or nursing.
  if (s.nurse) return nursing(e, s, now, a, T);
  // A calf its first park day lies hidden, getting up only to nurse.
  if (young && dayFor(a) - (a.bornDay ?? -Infinity) < T.hideDays) return lying(e, s, now, a, T);
  if (s.calf) {
    s.calf = undefined; // its first day is over: on its feet (it gets up first), following its mother
    s.phase = "up";
    s.actUntil = now + T.getUpTicks;
    setAct(e, ACT.none);
    return;
  }
  const wild = !a;
  const scare = startler(e, players, wild, T);
  if (scare && now >= s.alertCool) {
    s.alertCool = now + T.alertCool;
    sound(e, "mob.horse.breathe", 0.5, 1.4); // a snort
    return void startAct(e, s, now, ACT.alert, T.alertTicks, yawTo(scare.location.x - e.location.x, scare.location.z - e.location.z));
  }
  if (s.phase === "act") {
    // A wild one doesn't stay with someone close: its startled look is cut short as they come on (the cloud server: a
    // keeper walking up reached it during a full look).
    if (wild && scare && (s.act !== ACT.alert || dist(scare.location, e.location) <= T.shyRange / 2)) return finish(e, s, now);
    if (s.act !== ACT.alert && !s.waitingFor && tempted(e, players, T)) return finish(e, s, now); // held food: up and over
    if (now < s.actUntil) return acting(e, s);
    if (s.act === ACT.rest && !day) {
      s.actUntil = now + between(T.restTicks); // it lies on through the night
      return;
    }
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return; // getting up: the client's get-up animation
    s.phase = "idle";
    if (s.waitingFor) return void startAct(e, s, now, ACT.none, T.nurseTimeout, undefined); // up for her calf: she waits
    body(e, s, "move");
  }
  // A wild one walks off from someone close (the engine's avoid_mob_type); held food brings either kind over.
  if ((wild && scare) || tempted(e, players, T)) return void seek(e, s, "none");
  if (Math.random() < T.ambientChance) sound(e, "mob.horse.breathe", 0.25, a?.juvenile ? 1.4 : 0.75); // a soft chuff
  // A young one now and then goes to its mother to nurse.
  if (young && now >= s.nurseAt && s.phase === "idle" && goNurse(e, s, now, a, T, false)) return;
  if (now >= s.interestUntil) choose(e, s, now, a, ex, day, T);
  if (now < s.cool || !e.isOnGround) return;
  const here = cellOf(e.location);
  const at = typeReader(e);
  if (s.interest === "browse") tryBrowse(e, s, now, here, at, T);
  else if (s.interest === "feeder") tryFeeder(e, s, now, here, ex, T) || tryBrowse(e, s, now, here, at, T);
  else if (s.interest === "clay") tryLick(e, s, now, here, at, T);
  else if (s.interest === "rub") tryRub(e, s, now, here, at, T);
  else if (s.interest === "groom") startAct(e, s, now, ACT.groom, T.groomTicks, undefined);
  else if (s.interest === "flehmen") tryFlehmen(e, s, now, T);
  else if (s.interest === "rest") startAct(e, s, now, ACT.rest, day ? T.dayRestTicks : T.restTicks, undefined);
}

// What it heads for next (okapiRules.js pickInterest), from what its exhibit has (a wild one: what lush caves have).
function choose(e, s, now, a, ex, day, T) {
  const male = isMale(e, a);
  const t = ex?.okapi;
  s.interest = pickInterest({ day, male, female: male && femalesNear(e, T).length > 0, plants: t ? t.plants > 0 : true, feeder: feederIn(ex), clay: t ? t.clay > 0 : true, rub: t ? t.rubs > 0 : true }, T);
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

// Holding its pose, with the sounds of what it's doing.
function acting(e, s) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const r = Math.random();
  if (s.act === ACT.browse && r < 0.3) sound(e, s.atFeeder ? "mob.horse.eat" : "dig.azalea_leaves", 0.3, s.atFeeder ? 1.3 : 1.2);
  else if ((s.act === ACT.lick || s.act === ACT.groom) && r < 0.25) sound(e, "random.drink_honey", 0.2, s.act === ACT.lick ? 1.5 : 1.8);
  else if (s.act === ACT.rub && r < 0.35) sound(e, "mob.armadillo.brush", 0.3, 0.8);
}

// Done: on its feet again (after lying down, still a moment while it gets up), wandering a while before the next thing.
// A mother done waiting (her calf never came) waits no more.
function finish(e, s, now) {
  const T = BALANCE.okapi;
  const lying = LYING_ACTS.includes(s.act);
  s.waitingFor = undefined;
  s.act = ACT.none;
  s.atFeeder = false;
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

// At a lush plant: it faces it and strips the leaves with its tongue; the next time, another plant while there is one.
function tryBrowse(e, s, now, here, at, T) {
  const p = pickPlant(plantsBeside(at, here), s.lastPlant);
  if (!p) return false;
  s.lastPlant = p.key;
  s.atFeeder = false;
  return startAct(e, s, now, ACT.browse, T.browseTicks, p.dx || p.dz ? yawTo(p.dx, p.dz) : undefined);
}

// At a feeder of its exhibit with Leafy Rations in it: it browses them the same way.
function tryFeeder(e, s, now, here, ex, T) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      for (const dy of [0, 1]) {
        const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y + dy, z: here.z + dz }));
        if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec)) continue;
        startAct(e, s, now, ACT.browse, T.browseTicks, yawTo(dx, dz));
        s.atFeeder = true;
        return true;
      }
    }
  }
  return false;
}

// On clay, or beside it: head down, licking it for the salt.
function tryLick(e, s, now, here, at, T) {
  const c = clayBeside(at, here);
  if (!c) return false;
  return startAct(e, s, now, ACT.lick, T.lickTicks, c.dx || c.dz ? yawTo(c.dx, c.dz) : undefined);
}

// A grown male beside a trunk rubs his neck on it to mark it.
function tryRub(e, s, now, here, at, T) {
  const t = trunkBeside(at, here);
  if (!t) return false;
  return startAct(e, s, now, ACT.rub, T.rubTicks, yawTo(t.dx, t.dz));
}

// A grown male near a grown female lifts his head toward her and curls his lip.
function tryFlehmen(e, s, now, T) {
  const f = femalesNear(e, T)[0];
  if (!f) {
    s.interestUntil = 0;
    return false;
  }
  sound(e, "mob.horse.breathe", 0.4, 0.7);
  return startAct(e, s, now, ACT.flehmen, T.flehmenTicks, yawTo(f.location.x - e.location.x, f.location.z - e.location.z));
}

// Its mother's mob, while it's loaded.
function motherOf(a) {
  try {
    const m = liveEntity(a.parents?.[0]);
    return m?.isValid ? m : undefined;
  } catch {
    return undefined;
  }
}

// Its first park day: lying hidden (legs tucked) where it was born; now and then it gets up to go to its mother.
function lying(e, s, now, a, T) {
  if (!s.calf) {
    s.calf = true;
    s.phase = "calf";
    body(e, s, "still");
    seek(e, s, "none");
  }
  setAct(e, ACT.hide);
  if (now >= s.nurseAt) goNurse(e, s, now, a, T, true);
}

// Time to nurse: with its mother within T.motherRange, a hidden calf gets up first (the client's get-up animation), then
// it walks to her (toMother) while she stands and waits. False with her too far or not loaded (it tries again later).
function goNurse(e, s, now, a, T, hidden) {
  s.nurseAt = now + between(T.nurseEvery);
  const m = motherOf(a);
  if (!m || dist(m.location, e.location) > T.motherRange) return false;
  s.nurse = { stage: hidden ? "up" : "going", until: now + (hidden ? T.getUpTicks : T.nurseTimeout), hidden };
  sound(e, "mob.goat.ambient", 0.3, 1.7); // a calf's bleat
  if (hidden) setAct(e, ACT.none);
  else toMother(e, s, now, m, T);
  return true;
}

// On its way: its zoocraft:to_mother (the engine follows the mob tagged MOTHER_TAG); she leaves off what she is doing
// (lying down, she gets up first: the mock park caught her lying on while it nursed) and waits where she is. Not while
// something startles her.
function toMother(e, s, now, m, T) {
  s.phase = "nurse";
  setAct(e, ACT.none);
  seek(e, s, "none");
  body(e, s, "move");
  e.triggerEvent("zoocraft:to_mother");
  m.addTag(MOTHER_TAG);
  const ms = state.get(m.id);
  if (!ms || (ms.phase === "act" && ms.act === ACT.alert)) return;
  if (ms.phase === "act") finish(m, ms, now);
  ms.waitingFor = e.id;
  if (ms.phase !== "up") startAct(m, ms, now, ACT.none, T.nurseTimeout, undefined);
}

// Getting up, on its way, then nursing (head up under her flank) while she licks it: close enough (T.nurseReach), or
// near enough when its time to get there is up (T.nurseFar: the engine may stop it a little short of her).
function nursing(e, s, now, a, T) {
  const n = s.nurse;
  const m = motherOf(a);
  if (n.stage === "up") {
    if (now < n.until) return;
    if (!m) return endNurse(e, s, now, undefined);
    n.stage = "going";
    n.until = now + T.nurseTimeout;
    return toMother(e, s, now, m, T);
  }
  if (n.stage === "going") {
    const d = m ? dist(m.location, e.location) : Infinity;
    if (d <= T.nurseReach || (now >= n.until && d <= T.nurseFar)) {
      n.stage = "suckling";
      n.until = now + between(T.nurseTicks);
      n.yaw = yawTo(m.location.x - e.location.x, m.location.z - e.location.z);
      e.triggerEvent("zoocraft:from_mother");
      body(e, s, "still");
      const ms = state.get(m.id);
      // She turns to it and licks it (unless something else has her: a scare).
      if (ms && (ms.waitingFor === e.id || (ms.phase !== "act" && ms.phase !== "up"))) {
        startAct(m, ms, now, ACT.groom, n.until - now, yawTo(e.location.x - m.location.x, e.location.z - m.location.z));
        ms.waitingFor = e.id;
      }
      return;
    }
    if (!m || now >= n.until) return endNurse(e, s, now, m);
    return;
  }
  e.setRotation({ x: 0, y: n.yaw });
  setAct(e, ACT.nurse);
  if (now >= n.until) endNurse(e, s, now, m);
}

// Done (or given up): she goes about her day; a hidden calf lies down again, an older one is on its feet.
function endNurse(e, s, now, m) {
  const n = s.nurse;
  s.nurse = undefined;
  e.triggerEvent("zoocraft:from_mother");
  if (m) {
    if (m.hasTag(MOTHER_TAG)) m.removeTag(MOTHER_TAG);
    const ms = state.get(m.id);
    if (ms?.waitingFor === e.id) {
      ms.waitingFor = undefined;
      if (ms.phase === "act") finish(m, ms, now);
    }
  }
  if (n?.hidden) {
    s.phase = "calf";
    body(e, s, "still");
    setAct(e, ACT.hide);
  } else {
    s.act = ACT.nurse;
    finish(e, s, now);
  }
}
