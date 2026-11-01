import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem } from "../platform/mc.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { YETI_ACT, SEATED_ACTS, ZOO_YETI, ZOO_DAY, pickYetiInterest, yawOf } from "./bossRules.js";
import { ZOO_CYCLOPS, CYCLOPS_DAY } from "./cyclopsRules.js";

// Giant Yetis in a zoo (0.1.159; the rules are in animals/bossRules.js "The zoo yeti's day"). Every half second, for the
// zoo yetis near players. Calm: it never fights (no target, no attack) and can't be hurt. The engine walks it
// (zoocraft:moving: a stroll, the Fruit Ration it's tempted by, the way home to its exhibit; zoocraft:seek_feeder to its
// Basic Feeder); this picks what it does next and plays it: eating at the feeder, tossing a snowball up and catching it,
// rearing up with a softer roar and a beat of its chest, sitting down to rest, and at night sleeping sitting. What it's
// doing goes to the client through zoocraft:act.
// Cyclopes in a zoo (0.1.165) live the same day with their own weights and sounds (animals/cyclopsRules.js CYCLOPS_DAY):
// eating at their feeder, tossing a rock up and catching it, a softer bellow, sitting, sleeping at night. (The acts are
// the yeti's numbers.)

// Each kind: its day's numbers and its toss and roar sounds ([id, volume, pitch]).
const ZOO_KINDS = {
  [ZOO_YETI]: { day: ZOO_DAY, toss: ["dig.snow", 0.8, 0.8], roar: ["mob.polarbear.warning", 0.7, 0.7] },
  [ZOO_CYCLOPS]: { day: CYCLOPS_DAY, toss: ["dig.stone", 0.8, 0.7], roar: ["mob.ravager.roar", 0.5, 0.9] },
};
const ZOO_TYPES = Object.keys(ZOO_KINDS);

const RANGE = 48;
const PROP = "zoocraft:act";
const state = new Map(); // entity id -> state

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // cosmetic only
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

function edible(rec, type) {
  return Boolean(rec?.units > 0 && SPECIES[type].dietTags.includes(RATIONS[rec.item]?.diet));
}

function feederIn(ex, type) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id), type)));
}

function holdsBait(p, type) {
  const id = heldItem(p)?.typeId ?? "";
  return id === SPECIES[type].baitItem || carrierByItem(id)?.full === false;
}

// Every 10 ticks: the zoo yetis near players.
export function tickYetis(now) {
  const seen = new Set();
  const players = onlinePlayers();
  const night = isNight();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, ZOO_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, night);
      } catch {
        state.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function step(e, now, players, night) {
  const K = ZOO_KINDS[e.typeId] ?? ZOO_KINDS[ZOO_YETI];
  const Z = K.day;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: YETI_ACT.none, actUntil: 0, cool: now + Z.coolTicks };
    state.set(e.id, s);
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, YETI_ACT.none);
  }
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const tempted = players.some((p) => p.dimension.id === e.dimension.id && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= Z.baitRange && holdsBait(p, e.typeId));
  if (s.phase === "act") {
    if (tempted && s.act !== YETI_ACT.sleep) return finish(e, s, now, Z);
    if (s.act === YETI_ACT.sleep && !night) {
      s.actUntil = Math.min(s.actUntil, now + between(Z.wakeTicks));
    }
    if (now < s.actUntil) {
      if (s.act === YETI_ACT.eat && Math.random() < 0.3) sound(e, "random.eat", 0.5, 0.6);
      return;
    }
    if (s.act === YETI_ACT.sleep && night) {
      s.actUntil = now + between(Z.sleepTicks);
      return;
    }
    return finish(e, s, now, Z);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return;
    s.phase = "idle";
    body(e, s, "move");
  }
  if (tempted) return void seek(e, s, "none");
  if (now >= s.interestUntil) {
    s.interest = pickYetiInterest({ night, feeder: feederIn(ex, e.typeId) }, Math.random, Z);
    s.interestUntil = now + between(Z.interestTicks);
    seek(e, s, s.interest === "feeder" ? "feeder" : "none");
  }
  if (now < s.cool || !e.isOnGround) return;
  if (s.interest === "feeder") return void tryFeeder(e, s, now, ex, Z);
  if (s.interest === "toss") {
    startAct(e, s, now, YETI_ACT.toss, Z.tossTicks);
    sound(e, ...K.toss);
  } else if (s.interest === "roar") {
    startAct(e, s, now, YETI_ACT.roar, Z.roarTicks);
    sound(e, ...K.roar);
  } else if (s.interest === "sit") startAct(e, s, now, YETI_ACT.sit, between(Z.sitTicks));
  else if (s.interest === "sleep") startAct(e, s, now, YETI_ACT.sleep, between(Z.sleepTicks));
}

function startAct(e, s, now, act, ticks, yaw = undefined) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + ticks;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
}

function finish(e, s, now, Z = ZOO_DAY) {
  const seated = SEATED_ACTS.includes(s.act);
  s.act = YETI_ACT.none;
  setAct(e, YETI_ACT.none);
  s.cool = now + Z.coolTicks;
  s.interest = "wander";
  s.interestUntil = now + between(Z.wanderTicks);
  if (seated) {
    s.phase = "up";
    s.actUntil = now + Z.getUpTicks;
  } else {
    s.phase = "idle";
    body(e, s, "move");
  }
}

// At a Basic Feeder of its exhibit with its food in it (a yeti's Fruit or Fish Rations, a Cyclops's Meat Rations): it
// eats, facing it.
function tryFeeder(e, s, now, ex, Z = ZOO_DAY) {
  const p = e.location;
  const here = { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (!dx && !dz) continue;
      const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y, z: here.z + dz }));
      if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec, e.typeId)) continue;
      if (Math.hypot(here.x + dx + 0.5 - p.x, here.z + dz + 0.5 - p.z) > Z.feederReach) continue;
      return startAct(e, s, now, YETI_ACT.eat, between(Z.eatTicks), yawOf(here.x + dx + 0.5 - p.x, here.z + dz + 0.5 - p.z));
    }
  }
}
