// Sharks in the game (0.1.125; the rules are animals/sharkRules.js): the Great White and the Hammerhead, dangerous big
// fish. Most of the time the engine swims them (the zoocraft:free group's swim goals, like the zoo fish). When
// animals/predators.js gives one an intent (warn, charge, back round a swimmer in its tank; bait or eat for a thrown
// Fish Ration, wild or in a tank), this holds the shark (zoocraft:hold takes the swim goals and the show timers away)
// and steers it itself, a step a tick through water only, with its act for the client; when the intent is gone it is
// let go (zoocraft:free). A wild shark hunts swimmers with the game's own targeting (its zoocraft:hunting group);
// hurt by someone, calm or not, it hunts again (animals/predators.js hurtWild).
import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { intentOf, ateBait, baitUnreachable, hurtWild } from "./predators.js";
import { ACT, actFor, circleSpot, angleFrom, awaySpot, stepToward, headingOf, paceFor } from "./sharkRules.js";
import { reportError } from "../core/log.js";

const ACT_PROP = "zoocraft:act";
const RANGE = 48; // blocks from a player: sharks this close are stepped
const SHARKS = Object.values(SPECIES).filter((s) => s.shark);
const TYPES = SHARKS.flatMap((s) => [s.entityType, s.wildSource]);
const WILD = new Set(SHARKS.map((s) => s.wildSource));

const held = new Map(); // entity id -> { e, angle, fails, act }
const moving = new Map(); // entity id -> { e, to, pace, act, read }
const reported = new Set();

function setAct(e, act) {
  try {
    if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
  } catch {
    // gone
  }
}

function hold(e) {
  let h = held.get(e.id);
  if (!h) {
    h = { e, angle: undefined, fails: 0 };
    held.set(e.id, h);
    try {
      e.triggerEvent("zoocraft:hold");
    } catch {
      // gone
    }
  }
  return h;
}

function free(id) {
  const h = held.get(id);
  held.delete(id);
  moving.delete(id);
  if (!h) return;
  try {
    if (h.e.isValid) h.e.triggerEvent("zoocraft:free"); // the swim goals back, the act to cruise
  } catch {
    // gone
  }
}

function steer(e, to, act, S) {
  moving.set(e.id, { e, to, pace: paceFor(act, S), act, read: blockReader(e.dimension) });
  setAct(e, act);
}

// Every 10 ticks: each shark near a player, by its intent.
export function tickSharks(now) {
  const S = BALANCE.shark;
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
        stepShark(e, players, now, S);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("shark", error);
        }
      }
    }
  }
  // Out of everyone's range: let go, back to the engine's swimming.
  for (const id of [...held.keys()]) if (!seen.has(id)) free(id);
}

function stepShark(e, players, now, S) {
  const it = intentOf(e.id);
  const wild = WILD.has(e.typeId);
  if (!wild) {
    const a = animalFromEntity(e);
    if (!a || a.location.kind !== "exhibit") {
      free(e.id);
      return;
    }
  }
  if (!it || !["warn", "charge", "back", "bait", "eat"].includes(it.kind)) {
    if (held.has(e.id)) free(e.id);
    return;
  }
  const h = hold(e);
  if (it.kind === "bait") return baitStep(e, h, it, now, S);
  if (it.kind === "eat") {
    moving.delete(e.id);
    setAct(e, ACT.eat);
    return;
  }
  const p = players.find((q) => q.id === it.playerId);
  if (!p) {
    moving.delete(e.id);
    setAct(e, ACT.cruise);
    return;
  }
  if (it.kind === "warn") {
    // Round and round the swimmer, a little under them, the head turned in.
    if (h.angle === undefined) h.angle = angleFrom(p.location, e.location);
    h.angle += S.circleStep;
    steer(e, circleSpot(p.location, h.angle, S), ACT.circle, S);
    return;
  }
  h.angle = undefined;
  if (it.kind === "charge") {
    // The rush, straight at them (predators.js lands the bite within reach).
    steer(e, { x: p.location.x, y: p.location.y + 0.4, z: p.location.z }, ACT.rush, S);
    return;
  }
  // back: away from them once, then it watches (the act back to cruise while it holds off).
  if (h.backed !== it.since) {
    h.backed = it.since;
    steer(e, awaySpot(e.location, p.location, S), ACT.cruise, S);
  } else if (!moving.has(e.id)) setAct(e, ACT.cruise);
}

// Out to a thrown Fish Ration (an item afloat or sunk in its water) and eaten: calm while it lasts (predators.js).
function baitStep(e, h, it, now, S) {
  let item;
  try {
    item = world.getEntity(it.itemId);
  } catch {
    item = undefined;
  }
  if (!item?.isValid) {
    baitUnreachable(e.id); // gone: it hunts again
    free(e.id);
    return;
  }
  const to = item.location;
  const d = Math.hypot(to.x - e.location.x, to.y - e.location.y, to.z - e.location.z);
  if (d <= S.reach + 0.6) {
    moving.delete(e.id);
    if (ateBait(e, now)) {
      setAct(e, ACT.eat);
      try {
        e.dimension.playSound("random.eat", e.location, { volume: 0.8, pitch: 0.6 });
      } catch {
        // cosmetic
      }
    }
    return;
  }
  const g = moving.get(e.id);
  if (g?.blocked) {
    h.fails += 1;
    if (h.fails >= S.baitTries) {
      h.fails = 0;
      baitUnreachable(e.id); // no way through the water to it (on the bank, say): it hunts again, and leaves that one be
      free(e.id);
      return;
    }
  }
  steer(e, { x: to.x, y: to.y, z: to.z }, ACT.eat, S);
}

// Every tick: each steered shark a step toward its spot, through water only (never into the bank or the air).
export function tickSharkMoves() {
  const S = BALANCE.shark;
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
      held.delete(id);
      continue;
    }
    try {
      const pos = e.location;
      const { pos: next, done } = stepToward(pos, m.to, m.pace, S);
      if (done) {
        moving.delete(id);
        continue;
      }
      const water = (p) => m.read(Math.floor(p.x), Math.floor(p.y), Math.floor(p.z)) === "water";
      let go = water(next) ? next : undefined;
      if (!go) {
        const level = { x: next.x, y: pos.y, z: next.z }; // keep its depth and go on sideways
        if (water(level)) go = level;
      }
      if (!go) {
        m.blocked = true;
        moving.delete(id); // the edge of its water: it waits there (the next step decides anew)
        continue;
      }
      const { yaw, pitch } = headingOf(go.x - pos.x, go.y - pos.y, go.z - pos.z);
      e.teleport(go, { rotation: { x: Math.max(-40, Math.min(40, pitch)), y: yaw }, keepVelocity: false });
    } catch {
      moving.delete(id);
    }
  }
}

export function initSharks() {
  if (!WILD.size) return;
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        if (ev.damageSource?.damagingEntity?.typeId === "minecraft:player") hurtWild(ev.hurtEntity.id);
      } catch {
        // gone
      }
    },
    { entityTypes: [...WILD] },
  );
}
