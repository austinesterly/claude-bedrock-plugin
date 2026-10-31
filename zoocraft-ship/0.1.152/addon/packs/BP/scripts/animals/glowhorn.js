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
import { ACT, LYING_ACTS, STAG_TYPES, MOTE, BREATH, GRASS, isDay, isTwilight, pickInterest, rubFrom, lineUp, pointAt } from "./glowhornRules.js";

// Glowhorn Stags (0.1.152, the Mythical Glade; the rules are in animals/glowhornRules.js). Every half second, for the
// stags near players only. The engine walks them (zoocraft:moving: a stroll, the Leafy Ration they're tempted by, the
// way home in a zoo; a wild one also bounds off from someone close); this picks what each heads for next and plays what
// it does there: grazing the grass where it stands; to the feeder or Hay Rack; to a tree trunk (the entity's
// zoocraft:seek_trunk, a move_to_block over every kind of log) to rub its antlers on the bark, knocking on the wood;
// bellowing with its neck stretched up, a puff of breath at its mouth; at dusk and dawn above all, lifting its head
// while its antlers flare (the client's night skin) and glowing motes rise from them with a chime; lying down by day for
// a rest and through the night. Someone sprinting close in a zoo and it freezes, head up and ears turning; in the wild
// anyone close in Survival who isn't sneaking or holding a Leafy Ration makes it stop, head up and snorting, and then it
// bounds off. A fawn follows its mother (the engine's follow_parent) and bleats now and then. What it's doing goes to
// the client through zoocraft:act. The engine's walk to a trunk ends with it against the bark, too close for its
// antlers: it lines up (a few steps back, or on, facing the trunk; moved a tick at a time by tickGlowhornMoves).

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const SEEKS = { feeder: "feeder", rub: "trunk" };

const state = new Map(); // entity id -> state (see step)
const moving = new Map(); // entity id -> { e, pts, i, yaw, act, done }: lining up for a rub

// Every tick: the stags lining up for a rub, a step along their way each; at the end, the rub.
export function tickGlowhornMoves(now) {
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
      m.e.teleport({ x: p.x, y: m.e.location.y, z: p.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
      setAct(m.e, m.act);
      if (m.i < m.pts.length) continue;
      moving.delete(id);
      m.done(now);
    } catch {
      moving.delete(id);
    }
  }
}

// Every 10 ticks: the stags near players.
export function tickGlowhorns(now) {
  const seen = new Set();
  const players = onlinePlayers();
  const T = BALANCE.glowhorn;
  let day = true, twilight = false;
  try {
    const t = world.getTimeOfDay();
    day = isDay(t, T);
    twilight = isTwilight(t, T);
  } catch {
    // keep it day
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, STAG_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, day, twilight);
      } catch {
        state.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
  for (const id of [...moving.keys()]) if (!seen.has(id)) moving.delete(id);
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

// What the engine walks it toward: "feeder", "trunk" or "none".
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

function particle(e, id, at) {
  try {
    e.dimension.spawnParticle(id, at);
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

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:glowhorn_stag"].dietTags.includes(RATIONS[rec.item]?.diet));
}

function step(e, now, players, day, twilight) {
  const T = BALANCE.glowhorn;
  if (moving.has(e.id)) return; // lining up for a rub: a second at most
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
  let young = false;
  try {
    young = e.hasComponent("minecraft:is_baby");
  } catch {
    young = Boolean(a?.juvenile);
  }
  s.young = young;
  const scare = startler(e, players, wild, T);
  if (scare && now >= s.alertCool && !(s.phase === "act" && s.act === ACT.alert)) {
    s.alertCool = now + T.alertCool;
    const yaw = yawTo(scare.location.x - e.location.x, scare.location.z - e.location.z);
    if (s.phase === "act" && LYING_ACTS.includes(s.act)) {
      // Lying down: up first (the client's get-up), then it goes off as it would.
      finish(e, s, now);
      return;
    }
    // It stops and stares, head up, with a snort (a wild one then bounds off: the engine's avoid_mob_type, once it
    // walks again).
    sound(e, "mob.horse.breathe", 0.6, young ? 1.4 : 0.8);
    return void startAct(e, s, now, ACT.alert, wild ? T.startleTicks : T.alertTicks, yaw);
  }
  if (s.phase === "act") {
    if (s.act !== ACT.alert && tempted(e, players, T)) return finish(e, s, now); // held food: up and over
    if (s.act === ACT.rest && s.nightRest && day) {
      // Morning: up within a few seconds, not at the end of the night's lie-down.
      s.nightRest = false;
      s.actUntil = Math.min(s.actUntil, now + between(T.wakeTicks));
    }
    if (now < s.actUntil) return acting(e, s, now, T);
    if (s.act === ACT.rest && !day) {
      s.actUntil = now + between(T.restTicks); // it lies on through the night
      s.nightRest = true; // a day's rest run on into the night too: up in the morning with the rest
      return;
    }
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return; // getting up: the client's get-up animation
    s.phase = "idle";
    body(e, s, "move");
  }
  // A wild one bounds off from someone close (the engine's avoid_mob_type); held food brings either kind over.
  if ((wild && scare) || tempted(e, players, T)) return void seek(e, s, "none");
  if (Math.random() < T.ambientChance) {
    if (young) sound(e, "mob.goat.ambient", 0.3, 1.7); // a fawn's bleat
    else sound(e, "mob.horse.breathe", 0.3, 0.85);
  }
  if (now >= s.interestUntil) choose(e, s, now, ex, day, twilight, young, T);
  // How far it went since the last look: still, on the way to a trunk, and the engine's walk has ended.
  const p = e.location;
  const moved = s.lastAt ? Math.hypot(p.x - s.lastAt.x, p.z - s.lastAt.z) : Infinity;
  s.lastAt = { x: p.x, z: p.z };
  if (now < s.cool || !e.isOnGround) return;
  const here = cellOf(e.location);
  const at = typeReader(e);
  if (s.interest === "graze") tryGraze(e, s, now, here, at, T);
  else if (s.interest === "feeder") tryFeeder(e, s, now, here, ex, T) || tryGraze(e, s, now, here, at, T);
  else if (s.interest === "rub") tryRub(e, s, now, here, at, T) || (moved < T.lineUp.stall && lineUpForRub(e, s, now, here, at, T));
  else if (s.interest === "bellow") {
    startAct(e, s, now, ACT.bellow, T.bellowTicks, undefined);
    s.puffAt = now + T.puffTicks;
    s.puffed = false;
    sound(e, T.bellowSound, 1.0, T.bellowPitch + Math.random() * 0.1);
  } else if (s.interest === "glow") {
    startAct(e, s, now, ACT.glow, T.glowTicks, undefined);
    s.glowFrom = now + T.glowRiseTicks;
    s.chimed = false;
  } else if (s.interest === "rest") {
    startAct(e, s, now, ACT.rest, day ? T.dayRestTicks : T.restTicks, undefined);
    s.nightRest = !day;
  }
}

// What it heads for next (glowhornRules.js pickInterest), from what its exhibit has (a wild one: what the glade has).
function choose(e, s, now, ex, day, twilight, young, T) {
  const st = ex?.stag;
  s.interest = pickInterest({ day, twilight, grass: ex ? (ex.grassCells ?? 0) > 0 : true, feeder: feederIn(ex), trunk: st ? st.rubs > 0 : true, young }, T);
  s.interestUntil = now + between(T.interestTicks);
  seek(e, s, SEEKS[s.interest] ?? "none");
}

function startAct(e, s, now, act, ticks, yaw) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw ?? e.getRotation().y;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// Holding its pose, with the sounds of what it's doing: the knock of antlers on bark, the bellow's breath, the glow's
// motes and chime.
function acting(e, s, now, T) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const r = Math.random();
  const scale = s.young ? 0.5 : 1;
  if (s.act === ACT.graze && r < 0.3) sound(e, s.atFeeder ? "mob.horse.eat" : "dig.grass", 0.3, s.atFeeder ? 1.1 : 1.3);
  else if (s.act === ACT.rub && now >= s.rubFrom && r < 0.45) sound(e, "hit.wood", 0.7, 0.8 + Math.random() * 0.3);
  else if (s.act === ACT.bellow && !s.puffed && now >= s.puffAt) {
    s.puffed = true;
    particle(e, BREATH, pointAt(e.location, s.yaw, T.mouth.ahead, T.mouth.up, scale));
  } else if (s.act === ACT.glow && now >= s.glowFrom) {
    // From when its head is up (the client lifts it over a second), motes rise from its antlers every half second,
    // with a chime at first and now and then after.
    const c = pointAt(e.location, s.yaw, T.antlers.ahead, T.antlers.up, scale);
    for (let i = 0; i < T.motes; i++) particle(e, MOTE, { x: c.x + (Math.random() - 0.5) * T.antlers.spread * scale, y: c.y + Math.random() * 0.4 * scale, z: c.z + (Math.random() - 0.5) * T.antlers.spread * scale });
    if (!s.chimed || r < 0.2) {
      s.chimed = true;
      sound(e, "chime.amethyst_block", 0.7, (s.young ? 1.3 : 0.9) + Math.random() * 0.3);
    }
  }
}

// Done: on its feet again (after lying down, still a moment while it gets up), wandering a while before the next thing.
function finish(e, s, now) {
  const T = BALANCE.glowhorn;
  const lying = LYING_ACTS.includes(s.act);
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

// On grass: head down, grazing where it stands.
function tryGraze(e, s, now, here, at, T) {
  if (at(here.x, here.y - 1, here.z) !== GRASS) return false;
  s.atFeeder = false;
  return startAct(e, s, now, ACT.graze, T.grazeTicks, undefined);
}

// At a trunk: from where it stands, or a cell beside it (it steps there: within T.rubStep of the cell's middle), with
// the trunk RUB_GAP cells ahead along a side (glowhornRules.js rubFrom), it faces the bark and rubs its antlers on it.
function tryRub(e, s, now, here, at, T) {
  if (s.young) return false;
  const p = e.location;
  let best;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      const c = { x: here.x + dx, y: here.y, z: here.z + dz };
      const d = Math.hypot(c.x + 0.5 - p.x, c.z + 0.5 - p.z);
      if (d > T.rubStep || (best && d >= best.d)) continue;
      if ((dx || dz) && !standable(at, c)) continue;
      const r = rubFrom(at, c);
      if (r) best = { c, r, d };
    }
  }
  if (!best) return false;
  const { c, r } = best;
  const yaw = yawTo(r.dx, r.dz);
  if (best.d > 0.15) {
    try {
      e.teleport({ x: c.x + 0.5, y: p.y, z: c.z + 0.5 }, { rotation: { x: 0, y: yaw }, keepVelocity: false });
    } catch {
      return false;
    }
  }
  return rub(e, s, now, yaw, T);
}

function rub(e, s, now, yaw, T) {
  startAct(e, s, now, ACT.rub, T.rubTicks, yaw);
  s.rubFrom = now + T.rubReachTicks;
  return true;
}

// Stopped by a trunk with no rub cell under it (the engine's walk ends with its body against the bark): the nearest rub
// cell it can line up on (glowhornRules.js lineUp: straight on or back, facing the trunk) over open floor, and it steps
// there, then rubs.
function lineUpForRub(e, s, now, here, at, T) {
  if (s.young) return false;
  const p = e.location;
  const R = Math.ceil(T.lineUp.range + T.lineUp.side);
  let best;
  for (let dx = -R; dx <= R; dx++) {
    for (let dz = -R; dz <= R; dz++) {
      const c = { x: here.x + dx, y: here.y, z: here.z + dz };
      const d = Math.hypot(c.x + 0.5 - p.x, c.z + 0.5 - p.z);
      if (best && d >= best.d) continue;
      const r = rubFrom(at, c);
      if (!r) continue;
      const way = lineUp(p, c, r, T);
      if (way && standable(at, c) && clearWay(at, p, way.pts, here.y)) best = { c, r, d, way };
    }
  }
  if (!best) return false;
  const yaw = yawTo(best.r.dx, best.r.dz);
  startAct(e, s, now, ACT[best.way.act], 1e9, yaw);
  moving.set(e.id, { e, pts: best.way.pts, i: 0, yaw, act: ACT[best.way.act], done: (t) => rub(e, s, t, yaw, T) });
  return true;
}

// Its body (1.3 blocks wide) can go along `pts` at level `y`: every cell under it on the way standable.
function clearWay(at, p, pts, y) {
  const seen = new Set();
  for (const q of [p, ...pts]) {
    for (const ox of [-0.55, 0.55]) {
      for (const oz of [-0.55, 0.55]) {
        const c = { x: Math.floor(q.x + ox), y, z: Math.floor(q.z + oz) };
        const k = `${c.x},${c.z}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (!standable(at, c)) return false;
      }
    }
  }
  return true;
}

// A cell it can stand in: solid ground under it, open at its feet and a block up.
function standable(at, c) {
  const under = at(c.x, c.y - 1, c.z);
  const feet = at(c.x, c.y, c.z), head = at(c.x, c.y + 1, c.z);
  if (!under || under === "minecraft:air" || under.includes("water") || under.includes("lava")) return false;
  const open = (id) => id === "minecraft:air" || id === "minecraft:short_grass" || id === "minecraft:tall_grass" || id === "minecraft:fern" || id === "zoocraft:moonbloom" || id === "zoocraft:starpetal" || id === "zoocraft:wisp_fern";
  return open(feet) && open(head);
}

// At a feeder or Hay Rack of its exhibit with Leafy Rations in it: it eats from it head down (a rack hangs a block up).
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
