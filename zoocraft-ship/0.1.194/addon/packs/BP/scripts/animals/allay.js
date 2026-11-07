import { world } from "@minecraft/server";
import { onlinePlayers, entitiesNear } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { dayFor } from "../park/park.js";
import { animalFromEntity, createAnimal, saveAnimal, spawnInExhibit } from "./animals.js";
import { getExhibit, addResident, validate } from "../exhibits/exhibits.js";
import { DUP_READY, dupResting, dupRestMs } from "./allayRules.js";
import { reportError } from "../core/log.js";

// Allays in the game (0.1.194; the rules are animals/allayRules.js, research/vanilla_plan.md "0.1.194 bats and allays: the
// design"). The game hovers the zoo copy and keeps its item goals (its note block goal stays, but without the game's
// vibration listener, which the game keeps to its own allay and warden, it never hears one); dancing is the parrots'
// (animals/parrot.js).
// Splitting in two is the game's engine's, so here: the copy's own interaction takes an amethyst shard from someone using
// one on it while it dances and isn't resting (its event zoocraft:duplicate), and a new zoo allay comes out beside it, both
// resting 5 minutes (the records' dupUntil, in real time: Date.now()'s milliseconds); every second the allays near players get their
// zoocraft:dup_ready back once the rest is over (or lose it after a reload while resting).

const TYPES = Object.values(SPECIES).filter((s) => s.duplicates).map((s) => s.entityType);
const reported = new Set();

function tell(error) {
  const why = String(error);
  if (reported.has(why) || reported.size > 20) return;
  reported.add(why);
  reportError("allay", error);
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
}

function split(e) {
  const a = e.isValid ? animalFromEntity(e) : undefined;
  if (!a || a.location.kind !== "exhibit") return;
  const ex = getExhibit(a.location.id);
  const sp = SPECIES[a.speciesId];
  if (!ex || !sp?.duplicates) return;
  const now = Date.now();
  if (dupResting(a, now)) return; // the copy's filter keeps this from happening
  const until = now + dupRestMs(BALANCE.allay);
  a.dupUntil = until;
  saveAnimal(a);
  const twin = createAnimal(sp, 0, { parents: [a.id], bornDay: dayFor(a), sex: "none", dupUntil: until });
  twin.location = { kind: "exhibit", id: ex.id };
  saveAnimal(twin);
  addResident(ex, twin.id, sp.id);
  try {
    const t = spawnInExhibit(twin, ex, cellOf(e.location));
    t.triggerEvent("zoocraft:dup_rest");
    twin.needsSpawn = false;
  } catch {
    twin.needsSpawn = true; // the nursery places it when the room loads
  }
  saveAnimal(twin);
  try {
    // The game's: the amethyst chime and hearts.
    e.dimension.playSound("chime.amethyst_block", e.location, { volume: 2, pitch: 1 });
    for (let i = 0; i < 4; i++) e.dimension.spawnParticle("minecraft:heart_particle", { x: e.location.x + (Math.random() - 0.5) * 0.6, y: e.location.y + 0.6 + Math.random() * 0.3, z: e.location.z + (Math.random() - 0.5) * 0.6 });
  } catch {
    // Cosmetic only.
  }
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === e.dimension.id && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) < 24) p.sendMessage(`§d${a.name} split in two in ${ex.name}: ${twin.name} is new! §fBoth rest ${Math.round(BALANCE.allay.dupTicks / 1200)} minutes before they can again.`);
    } catch {
      // gone
    }
  }
  validate(ex.id); // room with the new one counted
}

export function initAllays() {
  if (!TYPES.length) return;
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      try {
        split(ev.entity);
      } catch (error) {
        tell(error);
      }
    },
    { entityTypes: TYPES, eventTypes: ["zoocraft:duplicate"] },
  );
}

// Every 20 ticks: each zoo allay near a player gets zoocraft:dup_ready as its record says.
export function tickAllays() {
  if (!TYPES.length) return;
  const seen = new Set();
  const now = Date.now();
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, BALANCE.parrot.range, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        const a = animalFromEntity(e);
        if (!a) continue;
        const ready = !dupResting(a, now);
        if (e.getProperty(DUP_READY) !== ready) e.triggerEvent(ready ? "zoocraft:dup_ready" : "zoocraft:dup_rest");
      } catch (error) {
        tell(error);
      }
    }
  }
}
