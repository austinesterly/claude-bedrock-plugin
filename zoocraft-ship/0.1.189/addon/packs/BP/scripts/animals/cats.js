// Ocelots and cats in the game (0.1.189; the rules are animals/catRules.js, research/vanilla_plan.md "0.1.189 ocelots and
// cats: the design"). The game moves the zoo copies (their own goals: the avoid goal while shy, the nap, the copies' rest
// goals). Here:
// - Trust: a shy one fed raw cod or salmon by hand trusts one time in three (the game's trusting component fires the
//   copy's zoocraft:on_trust); the record keeps it, so the mob trusts again wherever it's put (animals/animals.js
//   spawnInExhibit), and the nearest player is told.
// - Seats: a cat's goal sits it down at a seat's edge (zoocraft:sit), so it's moved onto the middle of it; one that sat
//   down with no free seat by it lies down there for a nap instead. The goal never takes one to a bed (the test server:
//   four ways tried, none), and a cat seldom steps onto one by itself, so every 2 seconds a cat awake by a free bed (its
//   foot within seatReach) hops up onto the foot one time in bedSitOdds and sits down there (zoocraft:bed_sit).
import { system, world } from "@minecraft/server";
import { SPECIES } from "../data/species.js";
import { onlinePlayers, entitiesNear } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { animalFromEntity, saveAnimal } from "./animals.js";
import { seatFor, SITTING, BED_ONLY } from "./catRules.js";
import { reportError } from "../core/log.js";

const ON_TRUST = "zoocraft:on_trust";
const SIT = "zoocraft:sit";
const BED = "minecraft:bed";
const TYPES = Object.values(SPECIES).filter((s) => s.wary).map((s) => s.entityType);
const SEATERS = Object.values(SPECIES).filter((s) => s.restSpots?.kind === "seat").map((s) => s.entityType);

function told(e, a) {
  try {
    let best;
    let dist = Infinity;
    for (const p of e.dimension.getPlayers({ location: e.location, maxDistance: 8 })) {
      const d = Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z);
      if (d < dist) [best, dist] = [p, d];
    }
    best?.sendMessage(`§a${a.name} trusts you now: it won't run from people any more.`);
  } catch {
    // nobody near
  }
}

const typeReader = (d) => (x, y, z) => {
  const b = d.getBlock({ x, y, z });
  return b ? { id: b.typeId, states: b.typeId === BED ? b.permutation.getAllStates() : undefined } : undefined;
};
const spotOf = (s) => ({ x: s.x + 0.5, y: s.y + s.top, z: s.z + 0.5 });
const takenBy = (d, spot, e) => d.getEntities({ location: spot, maxDistance: 0.6 }).some((o) => o.id !== e.id && o.typeId !== "minecraft:item");

// A cat that has just sat down: onto the middle of the seat it's by, or a nap there if there's none free.
function seat(e) {
  const d = e.dimension;
  const s = seatFor(typeReader(d), e.location, BALANCE.cat);
  const spot = s && spotOf(s);
  const taken = spot && takenBy(d, spot, e);
  if (s && !taken && !s.on) e.teleport(spot, { dimension: d, keepVelocity: false });
  if (s && !taken) return;
  // It lies down there instead (got up, its goal took it straight back to the taken seat and sat it again, over and over:
  // the test server). Two ticks on: the sit's own change isn't on it yet as scripts hear of it (its sitting property
  // read false then and later the same tick, true the next), and an event that removes a group it hasn't got spoils it
  // (0.1.170), so only once it reads sitting.
  system.runTimeout(() => {
    try {
      if (e.isValid && e.getProperty(SITTING) === true) e.triggerEvent("zoocraft:sat_doze");
    } catch {
      // gone
    }
  }, 2);
}

// Every 2 seconds: each zoo cat near a player that's awake, on the ground and not sitting, by a free bed, hops up onto its
// foot one time in bedSitOdds and sits down there (the event sits it only in its awake group; between naps it lies down on
// the bed instead).
export function tickCatBeds() {
  if (!SEATERS.length) return;
  const T = BALANCE.cat;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, T.range, SEATERS);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        if (e.isSleeping || !e.isOnGround || e.getProperty(SITTING) === true || Math.random() >= 1 / T.bedSitOdds) continue;
        const d = e.dimension;
        const s = seatFor(typeReader(d), e.location, T, BED_ONLY);
        if (!s || s.on || takenBy(d, spotOf(s), e)) continue;
        e.teleport(spotOf(s), { dimension: d, keepVelocity: false });
        e.triggerEvent("zoocraft:bed_sit");
      } catch {
        // gone
      }
    }
  }
}

export function initCats() {
  if (!TYPES.length) return;
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      try {
        if (!ev.entity.isValid) return;
        if (ev.eventId === SIT) return void seat(ev.entity);
        const a = animalFromEntity(ev.entity);
        if (!a || a.trusts) return;
        a.trusts = true;
        saveAnimal(a);
        told(ev.entity, a);
      } catch (error) {
        reportError("cats", error);
      }
    },
    { entityTypes: TYPES, eventTypes: [ON_TRUST, SIT] },
  );
}
