// Manatees in the game (0.1.129; the rules are animals/manateeRules.js). Most of the time the engine swims them (the
// zoocraft:free group's swim goals: a slow glide, tempted by a Leafy Ration). For one near a player this keeps two clocks:
// every BALANCE.manatee.breathEvery ticks (3 to 5 minutes) it rises (zoocraft:hold takes the swim goals, act 2) a step a
// tick to just under the surface over it, holds its nostrils out of the water a few seconds (act 3, the blowhole's puff)
// and sinks back to swimming (zoocraft:free); between breaths it goes down to the seagrass (in a lagoon one of the
// measured ex.seagrassSpots, in the wild the seagrass under it or round it) and grazes there head down (act 1) a while.
// A calf does the same, its breath a little shallower. Out of everyone's range it is let go (and one gone, a Large Water
// Tank's catch, is forgotten the same way).
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { stepToward, headingOf } from "./sharkRules.js";
import { between, pickBed } from "./rayRules.js";
import { ACT, surfaceAbove, breathSpot, seagrassUnder } from "./manateeRules.js";
import { reportError } from "../core/log.js";

const ACT_PROP = "zoocraft:act";
const RANGE = 48; // blocks from a player: manatees this close breathe and graze where it shows
const MANATEES = Object.values(SPECIES).filter((s) => s.aquaticMammal);
const TYPES = MANATEES.flatMap((s) => [s.entityType, s.wildSource]);
const WILD = new Set(MANATEES.map((s) => s.wildSource));
const SPECIES_OF = new Map(MANATEES.flatMap((s) => [[s.entityType, s], [s.wildSource, s]]));

const manatees = new Map(); // entity id -> { e, phase: "cruise" | "rise" | "breathe" | "down" | "graze", breathAt, grazeAt, until, since }
const moving = new Map(); // entity id -> { e, to, read, hold?, blocked? }
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

function sound(e, id, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume: 0.8, pitch });
  } catch {
    // cosmetic
  }
}

// Back to the engine's swimming.
function letGo(id) {
  const m = manatees.get(id);
  manatees.delete(id);
  moving.delete(id);
  if (m && m.phase !== "cruise") {
    try {
      if (m.e.isValid) m.e.triggerEvent("zoocraft:free");
    } catch {
      // gone
    }
  }
}

// Every 10 ticks: each manatee near a player.
export function tickManatees(now) {
  if (!TYPES.length) return;
  const M = BALANCE.manatee;
  const seen = new Set();
  for (const player of onlinePlayers()) {
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
        stepManatee(e, now, M);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("manatee", error);
        }
      }
    }
  }
  for (const id of [...manatees.keys()]) if (!seen.has(id)) letGo(id);
}

// Swimming again (the act back to 0), with its next graze `graze` ticks off.
function swimOn(m, now, graze) {
  moving.delete(m.e.id);
  trigger(m.e, "zoocraft:free");
  Object.assign(m, { phase: "cruise", grazeAt: Math.max(m.grazeAt, now + graze) });
}

function stepManatee(e, now, M) {
  let ex;
  if (!WILD.has(e.typeId)) {
    const a = animalFromEntity(e);
    ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
    if (!ex) {
      letGo(e.id);
      return;
    }
  }
  let m = manatees.get(e.id);
  if (!m) {
    // Each one's first breath and graze at its own time.
    m = { e, phase: "cruise", breathAt: now + between(M.firstBreath, Math.random()), grazeAt: now + between(M.grazeEvery, Math.random()), until: 0, since: now };
    manatees.set(e.id, m);
    // One left held when the world was saved (or let go of out of range) swims again first.
    let act = ACT.cruise;
    try {
      act = e.getProperty(ACT_PROP) ?? ACT.cruise;
    } catch {
      // gone
    }
    if (act !== ACT.cruise) trigger(e, "zoocraft:free");
  }
  m.e = e;
  const mv = moving.get(e.id);
  const at = (to) => Math.hypot(e.location.x - to.x, e.location.y - to.y, e.location.z - to.z) <= M.reach;
  // Time to breathe: it leaves whatever it is doing (but a breath) and rises.
  if (now >= m.breathAt && m.phase !== "rise" && m.phase !== "breathe") {
    const read = blockReader(e.dimension, { seagrass: true });
    const surface = surfaceAbove(read, Math.floor(e.location.x), Math.floor(e.location.y), Math.floor(e.location.z), M.up);
    if (surface === undefined) {
      m.breathAt = now + M.retry; // under a roof or ice, or out of the water: it tries again in a moment
      return;
    }
    let baby = false;
    try {
      baby = Boolean(e.getComponent("minecraft:is_baby"));
    } catch {
      // gone
    }
    const depth = M.breathDepth * (baby ? SPECIES_OF.get(e.typeId)?.breeding?.juvenileScale ?? 1 : 1);
    trigger(e, "zoocraft:hold");
    Object.assign(m, { phase: "rise", since: now });
    moving.set(e.id, { e, to: breathSpot(e.location, surface, depth), read, pace: M.pace.rise });
    setAct(e, ACT.rise);
    return;
  }
  if (m.phase === "rise") {
    if (mv && at(mv.to)) {
      // At the surface: the nostrils out, the puff of its breath; it holds there a few seconds.
      mv.hold = true;
      Object.assign(m, { phase: "breathe", until: now + between(M.breathFor, Math.random()), since: now });
      setAct(e, ACT.breathe);
      sound(e, "mob.dolphin.blowhole", 0.6);
      return;
    }
    if (mv?.blocked || !mv || now - m.since > M.riseTimeout) {
      m.breathAt = now + M.retry; // couldn't get up there: it tries again in a moment
      swimOn(m, now, 0);
    }
    return;
  }
  if (m.phase === "breathe") {
    if (now < m.until) return setAct(e, ACT.breathe);
    m.breathAt = now + between(M.breathEvery, Math.random());
    swimOn(m, now, between(M.afterBreath, Math.random())); // down again, and to the seagrass soon after
    return;
  }
  if (m.phase === "cruise") {
    if (now < m.grazeAt) return;
    const to = ex ? pickBed(ex.seagrassSpots, e.location, M.near, Math.random()) : wildGrass(e, M);
    if (!to) {
      m.grazeAt = now + M.retry; // no seagrass to go to: it swims on, and looks again later
      return;
    }
    trigger(e, "zoocraft:hold");
    Object.assign(m, { phase: "down", since: now });
    moving.set(e.id, { e, to, read: blockReader(e.dimension, { seagrass: true }), pace: M.pace.down });
    return;
  }
  if (m.phase === "down") {
    if (mv && at(mv.to)) {
      mv.hold = true;
      Object.assign(m, { phase: "graze", until: now + between(M.grazeFor, Math.random()), since: now });
      setAct(e, ACT.graze);
      sound(e, "mob.horse.eat", 0.5);
      return;
    }
    if (mv?.blocked || !mv || now - m.since > M.downTimeout) swimOn(m, now, M.retry); // it couldn't get there: later
    return;
  }
  // Grazing, head down at the seagrass, until its time is up.
  if (now >= m.until) return swimOn(m, now, between(M.grazeEvery, Math.random()));
  setAct(e, ACT.graze);
}

// A wild manatee's seagrass: under it, or under one of a few columns round it (M.search blocks out).
function wildGrass(e, M) {
  const read = blockReader(e.dimension, { seagrass: true });
  const x0 = Math.floor(e.location.x);
  const y0 = Math.floor(e.location.y);
  const z0 = Math.floor(e.location.z);
  const tries = [[0, 0]];
  for (let k = 0; k < M.searchTries; k++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1 + Math.random() * M.search;
    tries.push([Math.round(Math.cos(a) * r), Math.round(Math.sin(a) * r)]);
  }
  for (const [dx, dz] of tries) {
    const y = seagrassUnder(read, x0 + dx, y0, z0 + dz, M.depth);
    if (y !== undefined) return { x: x0 + dx + 0.5, y, z: z0 + dz + 0.5 };
  }
  return undefined;
}

// Every tick: each rising or grazing-bound manatee a glide step toward its spot, through water only; one breathing or
// grazing kept where it is.
export function tickManateeMoves() {
  const M = BALANCE.manatee;
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
      manatees.delete(id);
      continue;
    }
    try {
      const pos = e.location;
      if (m.hold) {
        if (Math.hypot(pos.x - m.to.x, pos.y - m.to.y, pos.z - m.to.z) > M.drift) e.teleport(m.to, { keepVelocity: false });
        continue;
      }
      const { pos: next, done } = stepToward(pos, m.to, m.pace, M);
      if (done) continue; // there: tickManatees takes it on
      const water = (p) => {
        const c = m.read(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z));
        return c === "water" || c === "seagrass";
      };
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
      const flat = Math.hypot(go.x - pos.x, go.z - pos.z) > 0.005;
      e.teleport(go, { rotation: { x: Math.max(-20, Math.min(20, pitch)), y: flat ? yaw : e.getRotation().y }, keepVelocity: false });
    } catch {
      moving.delete(id);
    }
  }
}
