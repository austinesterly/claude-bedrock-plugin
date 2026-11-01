import { system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem } from "../platform/mc.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { yawOf } from "./bossRules.js";
import { ZOO_SLOTH, SLOTH, SLOTH_ACT, SLOTH_SEATED, SLOTH_DAY, hangSite, nextHang, pickSlothInterest, solidId } from "./slothRules.js";
import { gliding, stopGlide, climbUp, climbDown, walkTo, putAtPost, keepHanging, atHang } from "./slothMoves.js";

// Soul Sloths in a zoo (0.1.161; the rules are in animals/slothRules.js "The zoo sloth's day"). Every half second, for
// the zoo sloths near players. Calm: it never fights and can't be hurt. Most of the time it hangs asleep from its
// exhibit's beam (the sloth measure in exhibits/exhibits.js finds the beams: a post with 5 solid blocks running out from
// its top, 5 to 8 over the floor), awake now and then; at the end of an awake spell, now and then it climbs down the
// post (animals/slothMoves.js) and is on the ground a while: eating at its Basic Feeder (Fungal Rations), raking the soul
// sand, yawning, sitting, ambling (the engine walks it: zoocraft:move, zoocraft:seek_feeder); then it walks back to
// the post and climbs up. Two sloths take a beam each; one with no beam of its own sleeps curled up on the ground. What
// it's doing goes to the client through zoocraft:act.

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

// Its body (the entity's groups: zoocraft:moving, zoocraft:still, zoocraft:hang with gravity off), each event swapping
// the others out.
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

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES[ZOO_SLOTH].dietTags.includes(RATIONS[rec.item]?.diet));
}

function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function holdsBait(p) {
  const id = heldItem(p)?.typeId ?? "";
  return id === SPECIES[ZOO_SLOTH].baitItem || carrierByItem(id)?.full === false;
}

// The hanging spot under a measured beam (exhibits/exhibits.js ex.sloth.beams: the post's column, the way the beam runs,
// the floor and the beam's heights).
function siteOf(b) {
  return b ? hangSite({ x: b.x, z: b.z }, { x: b.dx, z: b.dz }, b.floor, b.beam) : undefined;
}

// Whether the beam over a hanging spot is still there (the block its claws hold).
function beamThere(e, site) {
  try {
    return solidId(e.dimension.getBlock({ x: Math.floor(site.x), y: site.beam, z: Math.floor(site.z) })?.typeId);
  } catch {
    return true; // unloaded: as it was
  }
}

// Every 10 ticks: the zoo sloths near players. Sloths in one exhibit take its beams in turn (by id).
export function tickSloths(now) {
  const seen = new Set();
  const players = onlinePlayers();
  /** @type {Map<string, { e: import("@minecraft/server").Entity, ex: any }[]>} */
  const byExhibit = new Map();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, [ZOO_SLOTH]);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        const a = animalFromEntity(e);
        const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
        const key = ex?.id ?? `none:${e.id}`;
        if (!byExhibit.has(key)) byExhibit.set(key, []);
        byExhibit.get(key).push({ e, ex });
      } catch {
        // gone
      }
    }
  }
  for (const group of byExhibit.values()) {
    group.sort((p, q) => (p.e.id < q.e.id ? -1 : 1));
    const beams = group[0].ex?.sloth?.beams ?? [];
    group.forEach(({ e, ex }, i) => {
      try {
        step(e, now, players, ex, siteOf(beams[i]));
      } catch {
        state.delete(e.id);
        stopGlide(e.id);
      }
    });
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    stopGlide(id);
  }
}

function step(e, now, players, ex, site) {
  const Z = SLOTH_DAY;
  let s = state.get(e.id);
  if (!s) {
    s = { cycle: "ground", cycleUntil: now + between(SLOTH.hang.groundTicks), phase: "idle", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: SLOTH_ACT.none, actUntil: 0, cool: now + Z.coolTicks, site, ticks: 0 };
    state.set(e.id, s);
    seek(e, s, "none");
    if (site && atHang(e.location, site)) {
      body(e, s, "hang");
      keepHanging(e, site);
      s.cycle = "sleep";
      s.cycleUntil = now + between(SLOTH.hang.sleepTicks);
      setAct(e, SLOTH_ACT.sleep);
    } else {
      body(e, s, "move");
      setAct(e, SLOTH_ACT.none);
    }
  }
  s.site = site ?? s.site;
  if (!site && (s.cycle === "sleep" || s.cycle === "awake")) s.site = undefined;
  if (gliding(e.id)) return; // climbing or walking: its end moves it on
  if (s.cycle === "climb") return;
  if (s.cycle === "sleep" || s.cycle === "awake") return hanging(e, s, now);
  // On the ground.
  const tempted = players.some((p) => p.dimension.id === e.dimension.id && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) <= Z.baitRange && holdsBait(p));
  if (s.phase === "act") {
    if (tempted && s.act !== SLOTH_ACT.curl) return finish(e, s, now);
    if (now < s.actUntil) {
      if (s.act === SLOTH_ACT.eat && Math.random() < 0.3) sound(e, "random.eat", 0.5, 0.5);
      return;
    }
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return;
    s.phase = "idle";
    body(e, s, "move");
  }
  if (tempted) return void seek(e, s, "none");
  if (now >= s.cycleUntil && e.isOnGround) {
    if (s.site) return goUp(e, s);
    // No beam of its own: asleep curled up on the ground a while.
    s.cycleUntil = now + between(SLOTH.hang.groundTicks);
    return startAct(e, s, now, SLOTH_ACT.curl, between(Z.curlTicks));
  }
  if (now >= s.interestUntil) {
    s.interest = pickSlothInterest({ feeder: feederIn(ex) });
    s.interestUntil = now + between(Z.wanderTicks);
    seek(e, s, s.interest === "feeder" ? "feeder" : "none");
  }
  if (now < s.cool || !e.isOnGround) return;
  if (s.interest === "feeder") return void tryFeeder(e, s, now, ex);
  if (s.interest === "rake") {
    startAct(e, s, now, SLOTH_ACT.rake, SLOTH.rakeTicks);
    sound(e, "dig.soul_sand", 0.8, 0.7);
  } else if (s.interest === "yawn") {
    startAct(e, s, now, SLOTH_ACT.yawn, SLOTH.yawnTicks);
    sound(e, "mob.polarbear.idle", 0.6, 0.4);
  } else if (s.interest === "sit") startAct(e, s, now, SLOTH_ACT.sit, between(Z.sitTicks));
}

// Hanging from its beam: asleep or awake by its own clock; at the end of an awake spell, now and then down to the
// ground. Held on its spot; if its beam is gone it falls.
function hanging(e, s, now) {
  s.ticks++;
  if (!s.site) return fall(e, s, now);
  if (s.ticks % 4 === 0 && !beamThere(e, s.site)) return fall(e, s, now);
  keepHanging(e, s.site);
  if (now < s.cycleUntil) return;
  const n = nextHang(s.cycle);
  if (n.next === "ground") return goDown(e, s, n.ticks);
  s.cycle = n.next;
  s.cycleUntil = now + n.ticks;
  setAct(e, s.cycle === "sleep" ? SLOTH_ACT.sleep : SLOTH_ACT.hang);
}

function fall(e, s, now) {
  s.cycle = "ground";
  s.cycleUntil = now + between(SLOTH.hang.groundTicks);
  s.phase = "idle";
  body(e, s, "move");
  setAct(e, SLOTH_ACT.none);
}

// Down off the beam and the post, then on its feet for a while.
function goDown(e, s, ticks) {
  s.cycle = "climb";
  climbDown(e, s.site, () => {
    if (state.get(e.id) !== s) return;
    body(e, s, "move");
    setAct(e, SLOTH_ACT.none);
    s.cycle = "ground";
    s.phase = "idle";
    s.cycleUntil = system.currentTick + ticks;
  });
}

// Back to the foot of its post (a walk), up it and over onto the beam; asleep there.
function goUp(e, s) {
  const site = s.site;
  s.cycle = "climb";
  seek(e, s, "none");
  body(e, s, "still");
  walkTo(e, site, (ok) => {
    if (state.get(e.id) !== s) return;
    if (!ok) putAtPost(e, site);
    body(e, s, "hang");
    climbUp(e, site, (up) => {
      if (state.get(e.id) !== s) return;
      if (!up) {
        body(e, s, "move");
        s.cycle = "ground";
        s.cycleUntil = system.currentTick + 400;
        return;
      }
      s.cycle = "sleep";
      s.cycleUntil = system.currentTick + between(SLOTH.hang.sleepTicks);
      setAct(e, SLOTH_ACT.sleep);
      sound(e, "mob.polarbear.idle", 0.5, 0.35);
    });
  });
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

function finish(e, s, now) {
  const Z = SLOTH_DAY;
  const seated = SLOTH_SEATED.includes(s.act);
  s.act = SLOTH_ACT.none;
  setAct(e, SLOTH_ACT.none);
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

// At a Basic Feeder of its exhibit with Fungal Rations in it: it eats, facing it.
function tryFeeder(e, s, now, ex) {
  const p = e.location;
  const here = { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (!dx && !dz) continue;
      const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y, z: here.z + dz }));
      if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec)) continue;
      if (Math.hypot(here.x + dx + 0.5 - p.x, here.z + dz + 0.5 - p.z) > SLOTH_DAY.feederReach) continue;
      return startAct(e, s, now, SLOTH_ACT.eat, between(SLOTH_DAY.eatTicks), yawOf(here.x + dx + 0.5 - p.x, here.z + dz + 0.5 - p.z));
    }
  }
}
