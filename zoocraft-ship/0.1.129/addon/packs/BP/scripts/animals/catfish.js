// Catfish in the game (0.1.129; the rules are animals/catfishRules.js). Most of the time the engine swims them (the
// zoocraft:free group's swim goals, kept low). Every so often (BALANCE.catfish.forageEvery) one near a player goes down to
// the floor to forage: this holds it (zoocraft:hold takes the swim goals), glides it down a step a tick to the floor under
// it, then creeps it along the floor nose down (act 1: the client sweeps its head and whiskers), turning where a wall, a
// drop or the edge of the water is in the way, for BALANCE.catfish.forageFor ticks; then it lets it swim again
// (zoocraft:free). In a tank and in the wild alike. Out of everyone's range it is let go (and one gone, a Water Transport
// Tank's catch, is forgotten the same way).
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { stepToward, headingOf } from "./sharkRules.js";
import { between } from "./rayRules.js";
import { ACT, floorUnder, creepStep, floorAhead } from "./catfishRules.js";
import { reportError } from "../core/log.js";

const ACT_PROP = "zoocraft:act";
const RANGE = 32; // blocks from a player: catfish this close forage now and then
const TYPES = Object.values(SPECIES)
  .filter((s) => s.bottomFeeder)
  .flatMap((s) => [s.entityType, s.wildSource]);

const fish = new Map(); // entity id -> { e, phase: "swim" | "down" | "forage", until, since }
const moving = new Map(); // entity id -> { e, mode: "glide" | "creep", to?, heading?, turnLeft?, floor?, read, blocked? }
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

// Back to the engine's swimming.
function letGo(id) {
  const f = fish.get(id);
  fish.delete(id);
  moving.delete(id);
  if (f && f.phase !== "swim") {
    try {
      if (f.e.isValid) f.e.triggerEvent("zoocraft:free");
    } catch {
      // gone
    }
  }
}

// Every 10 ticks: each catfish near a player.
export function tickCatfish(now) {
  if (!TYPES.length) return;
  const C = BALANCE.catfish;
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
        stepCatfish(e, now, C);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("catfish", error);
        }
      }
    }
  }
  for (const id of [...fish.keys()]) if (!seen.has(id)) letGo(id);
}

function stepCatfish(e, now, C) {
  let f = fish.get(e.id);
  if (!f) {
    // Spread out: each one's first forage at its own time.
    f = { e, phase: "swim", until: now + between(C.forageEvery, Math.random()), since: now };
    fish.set(e.id, f);
    // One left on the floor or held when the world was saved (or let go of out of range) swims again first.
    let act = ACT.swim;
    try {
      act = e.getProperty(ACT_PROP) ?? ACT.swim;
    } catch {
      // gone
    }
    if (act !== ACT.swim) trigger(e, "zoocraft:free");
  }
  f.e = e;
  if (f.phase === "swim") {
    if (now < f.until) return;
    const read = blockReader(e.dimension, { seagrass: true });
    const x = Math.floor(e.location.x);
    const z = Math.floor(e.location.z);
    const floor = floorUnder(read, x, Math.floor(e.location.y), z, C.depth);
    if (floor === undefined) {
      f.until = now + C.retry; // no floor in reach under it: it swims on, and looks again later
      return;
    }
    trigger(e, "zoocraft:hold");
    Object.assign(f, { phase: "down", since: now });
    moving.set(e.id, { e, mode: "glide", to: { x: e.location.x, y: floor + C.belly, z: e.location.z }, read });
    setAct(e, ACT.forage); // nose down on the way
    return;
  }
  const m = moving.get(e.id);
  if (f.phase === "down") {
    if (m?.mode === "glide" && Math.hypot(e.location.x - m.to.x, e.location.y - m.to.y, e.location.z - m.to.z) <= C.reach) {
      // On the floor: it creeps along it, the way it was facing.
      let yaw = 0;
      try {
        yaw = e.getRotation().y;
      } catch {
        // gone
      }
      moving.set(e.id, { e, mode: "creep", heading: (-yaw * Math.PI) / 180, floor: Math.floor(m.to.y), read: m.read });
      Object.assign(f, { phase: "forage", until: now + between(C.forageFor, Math.random()), since: now });
      return;
    }
    if (m?.blocked || !m || now - f.since > C.downTimeout) {
      // It couldn't get down through the water: back to swimming, and it tries again later.
      moving.delete(e.id);
      trigger(e, "zoocraft:free");
      Object.assign(f, { phase: "swim", until: now + C.retry });
    }
    return;
  }
  // Foraging: on along the floor until its time is up.
  if (now >= f.until || !m) {
    moving.delete(e.id);
    trigger(e, "zoocraft:free"); // the swim goals back, act 0
    Object.assign(f, { phase: "swim", until: now + between(C.forageEvery, Math.random()) });
    return;
  }
  setAct(e, ACT.forage);
}

// Every tick: each catfish going down a glide step, each foraging one a creeping step along the floor.
export function tickCatfishMoves() {
  const C = BALANCE.catfish;
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
      fish.delete(id);
      continue;
    }
    try {
      const pos = e.location;
      if (m.mode === "glide") {
        const { pos: next, done } = stepToward(pos, m.to, C.pace.down, C);
        if (done) continue; // there: tickCatfish starts the creep
        const c = m.read(Math.floor(next.x), Math.floor(next.y), Math.floor(next.z));
        if (c !== "water" && c !== "seagrass") {
          m.blocked = true;
          continue;
        }
        const { yaw } = headingOf(m.to.x - pos.x, 0, m.to.z - pos.z);
        e.teleport(next, { rotation: { x: 0, y: Math.abs(m.to.x - pos.x) + Math.abs(m.to.z - pos.z) > 0.01 ? yaw : e.getRotation().y }, keepVelocity: false });
        continue;
      }
      // Turning away from a wall, a drop or the water's edge: round on the spot, a little each tick.
      if (m.turnLeft) {
        const d = Math.sign(m.turnLeft) * Math.min(Math.abs(m.turnLeft), C.turnRate);
        m.heading += d;
        m.turnLeft -= d;
        e.setRotation({ x: 0, y: (-m.heading * 180) / Math.PI });
        continue;
      }
      // Creeping: a step along its heading, which wanders a little.
      const step = creepStep(pos, m.heading, C.pace.creep, C.swing, Math.random());
      const floor = floorAhead(m.read, step.pos, m.floor);
      if (floor === undefined) {
        m.turnLeft = Math.PI * (0.5 + Math.random()) * (Math.random() < 0.5 ? -1 : 1);
        continue;
      }
      m.heading = step.heading;
      m.floor = floor;
      const go = { x: step.pos.x, y: floor + C.belly, z: step.pos.z };
      const { yaw } = headingOf(go.x - pos.x, 0, go.z - pos.z);
      e.teleport(go, { rotation: { x: 0, y: yaw }, keepVelocity: false });
    } catch {
      moving.delete(id);
    }
  }
}
