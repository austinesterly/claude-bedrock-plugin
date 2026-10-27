// Giant Stingrays in the game (0.1.127; the rules are animals/rayRules.js). Most of the time the engine swims them (the
// zoocraft:free group's swim goals, like the other big fish). Every so often (BALANCE.ray.settleEvery) one near a player
// goes down to the sand: this holds it (zoocraft:hold takes the swim goals), steers it a step a tick through the water to
// a spot over the sand (in a tank, one of the measured ex.sandBedSpots; in the wild, the sand under it or round it), lays
// it on the sand there buried (act 2: the client sinks it in, only the eyes above) and keeps it there; when its time is
// up, or someone comes within BALANCE.ray.burstRange, it bursts out (zoocraft:burst: the swim goals back, act 3 until the
// entity's zoocraft:bursting timer ends it). Out of everyone's range it is let go (and one gone, a Large Water Tank's
// catch, is forgotten the same way).
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { stepToward, headingOf } from "./sharkRules.js";
import { ACT, between, bedUnder, pickBed, shouldBurst } from "./rayRules.js";
import { reportError } from "../core/log.js";

const ACT_PROP = "zoocraft:act";
const RANGE = 48; // blocks from a player: stingrays this close go down to the sand now and then
const RAYS = Object.values(SPECIES).filter((s) => s.sandBed);
const TYPES = RAYS.flatMap((s) => [s.entityType, s.wildSource]);
const WILD = new Set(RAYS.map((s) => s.wildSource));

const rays = new Map(); // entity id -> { e, phase: "cruise" | "settle" | "buried", until, to, since }
const moving = new Map(); // entity id -> { e, to, read, blocked? }
const reported = new Set();

function setAct(e, act) {
  try {
    if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
  } catch {
    // gone
  }
}

function trigger(e, ev) {
  try {
    e.triggerEvent(ev);
  } catch {
    // gone
  }
}

function sound(e, id) {
  try {
    e.dimension.playSound(id, e.location, { volume: 0.7, pitch: 0.8 });
  } catch {
    // cosmetic
  }
}

// Back to the engine's swimming (out of range, or it never got down).
function letGo(id) {
  const r = rays.get(id);
  rays.delete(id);
  moving.delete(id);
  if (r && r.phase !== "cruise") {
    try {
      if (r.e.isValid) r.e.triggerEvent("zoocraft:free");
    } catch {
      // gone
    }
  }
}

// Every 10 ticks: each stingray near a player.
export function tickRays(now) {
  const R = BALANCE.ray;
  const players = onlinePlayers();
  const seen = new Set();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        stepRay(e, players, now, R);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("ray", error);
        }
      }
    }
  }
  for (const id of [...rays.keys()]) if (!seen.has(id)) letGo(id);
}

function stepRay(e, players, now, R) {
  let ex;
  if (!WILD.has(e.typeId)) {
    const a = animalFromEntity(e);
    ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
    if (!ex) {
      letGo(e.id);
      return;
    }
  }
  let r = rays.get(e.id);
  if (!r) {
    r = { e, phase: "cruise", until: now + between(R.settleEvery, Math.random()), to: undefined, since: now };
    rays.set(e.id, r);
    // One left down in the sand or held when the world was saved (or let go of out of range) swims again first.
    let act = ACT.cruise;
    try {
      act = e.getProperty(ACT_PROP) ?? ACT.cruise;
    } catch {
      // gone
    }
    if (act !== ACT.cruise) trigger(e, "zoocraft:free");
  }
  r.e = e;
  if (r.phase === "cruise") {
    if (now < r.until) return;
    const to = ex ? pickBed(ex.sandBedSpots, e.location, R.near, Math.random()) : wildBed(e, R);
    if (!to) {
      r.until = now + R.retry; // no sand to go down to: it swims on, and looks again later
      return;
    }
    trigger(e, "zoocraft:hold");
    Object.assign(r, { phase: "settle", to, since: now });
    moving.set(e.id, { e, to, read: blockReader(e.dimension) });
    setAct(e, ACT.settle);
    return;
  }
  if (r.phase === "settle") {
    const m = moving.get(e.id);
    const there = Math.hypot(e.location.x - r.to.x, e.location.y - r.to.y, e.location.z - r.to.z) <= R.reach;
    if (there) {
      // Down on the sand: laid there exactly (its feet on the sand, so the client's sinking hides all but the eyes).
      moving.delete(e.id);
      try {
        e.teleport(r.to, { keepVelocity: false });
      } catch {
        // gone
      }
      Object.assign(r, { phase: "buried", until: now + between(R.buryFor, Math.random()), since: now });
      setAct(e, ACT.buried);
      sound(e, "dig.sand");
      return;
    }
    if (m?.blocked || !m || now - r.since > R.settleTimeout) {
      // It couldn't get there through the water: back to swimming, and it tries again later.
      moving.delete(e.id);
      trigger(e, "zoocraft:free");
      Object.assign(r, { phase: "cruise", until: now + R.retry, to: undefined });
    }
    return;
  }
  // Buried: kept where it lies, until its time is up or someone swims close.
  let nearest = Infinity;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id) continue;
      nearest = Math.min(nearest, Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z));
    } catch {
      // gone
    }
  }
  if (shouldBurst(now, r.until, nearest, R)) {
    trigger(e, "zoocraft:burst"); // the swim goals back, act 3 until its timer
    sound(e, "dig.sand");
    Object.assign(r, { phase: "cruise", until: now + between(R.settleEvery, Math.random()), to: undefined });
    return;
  }
  const d = Math.hypot(e.location.x - r.to.x, e.location.y - r.to.y, e.location.z - r.to.z);
  if (d > R.reach) {
    try {
      e.teleport(r.to, { keepVelocity: false });
    } catch {
      // gone
    }
  }
  setAct(e, ACT.buried);
}

// A wild stingray's spot on the sand: under it, or under one of a few columns round it (R.search blocks out).
function wildBed(e, R) {
  const read = blockReader(e.dimension, { sandBed: true });
  const x0 = Math.floor(e.location.x);
  const y0 = Math.floor(e.location.y);
  const z0 = Math.floor(e.location.z);
  const tries = [[0, 0]];
  for (let k = 0; k < R.searchTries; k++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1 + Math.random() * R.search;
    tries.push([Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]);
  }
  for (const [dx, dz] of tries) {
    const y = bedUnder(read, x0 + dx, y0, z0 + dz, R.depth);
    if (y !== undefined) return { x: x0 + dx + 0.5, y, z: z0 + dz + 0.5 };
  }
  return undefined;
}

// Every tick: each settling stingray a glide step toward its spot, through water only.
export function tickRayMoves() {
  const R = BALANCE.ray;
  for (const [id, m] of [...moving]) {
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      rays.delete(id);
      continue;
    }
    try {
      const pos = e.location;
      const { pos: next, done } = stepToward(pos, m.to, R.pace, R);
      if (done) continue; // there: tickRays lays it down
      const water = (p) => m.read(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) === "water";
      let go = water(next) ? next : undefined;
      if (!go) {
        const level = { x: next.x, y: pos.y, z: next.z }; // keep its depth and go on sideways
        if (water(level)) go = level;
      }
      if (!go) {
        m.blocked = true;
        continue;
      }
      const { yaw, pitch } = headingOf(go.x - pos.x, go.y - pos.y, go.z - pos.z);
      e.teleport(go, { rotation: { x: Math.max(-25, Math.min(25, pitch)), y: yaw }, keepVelocity: false });
    } catch {
      moving.delete(id);
    }
  }
}
