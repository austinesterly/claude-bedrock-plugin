import { system, world } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { findPlace } from "./places.js";
import { TURF, MEADOW_GROUND, NAME, PROBES, DEPTH, MOTE, ENDERMAN, SEND_AWAY_RANGE, meadowStep, mayBeMeadow, meadowFogCommands, ambience, motePositions, sendAwayOnSpawn, sendAwayNear } from "./meadowRules.js";

// The Chorus Meadow's feel (0.1.142; the rules are in world/meadowRules.js). Every 20 ticks, for each player: whether
// they are in a meadow (Chorus Turf under them, or under a spot 4 blocks out), and while they are: the meadow's fog on
// their fog stack, motes drifting round them, a chime now and then, its name on screen on walking in (and its Places
// entry the first time), and endermen near them on the turf sent away. Endermen that spawn on the turf are sent away as
// they come.

const state = new Map(); // player id -> { in, miss, left, fog: boolean | null }

/** @param {import("@minecraft/server").Dimension} d @param {import("@minecraft/server").Vector3} loc */
function turfUnder(d, loc) {
  for (const [dx, dz] of PROBES) {
    try {
      if (d.getBlockBelow({ x: loc.x + dx, y: loc.y + 0.5, z: loc.z + dz }, { maxDistance: DEPTH })?.typeId === TURF) return true;
    } catch {
      // not loaded there
    }
  }
  return false;
}

// An enderman goes as if it had teleported: a puff of portal particles and its sound, then it is gone.
/** @param {import("@minecraft/server").Entity} e */
function sendAway(e) {
  const d = e.dimension;
  const at = { x: e.location.x, y: e.location.y + 1, z: e.location.z };
  for (const id of ["minecraft:mob_portal", "minecraft:mob_portal", "minecraft:endrod"]) {
    try {
      d.spawnParticle(id, at);
    } catch {
      // a particle the game doesn't know
    }
  }
  try {
    d.playSound("mob.endermen.portal", at, { volume: 0.7 });
  } catch {
    // unloaded
  }
  e.remove();
}

/** @param {import("@minecraft/server").Player} player @param {number} now */
function step(player, now) {
  let s = state.get(player.id);
  if (!s) {
    s = { in: false, miss: 0, left: -Infinity, fog: null }; // fog null: not known, so one left from before is cleared
    state.set(player.id, s);
  }
  const d = player.dimension;
  const loc = player.location;
  const next = meadowStep(s, mayBeMeadow(d.id, loc) && turfUnder(d, loc), now);
  for (const c of meadowFogCommands(s.fog, next.in)) {
    try {
      player.runCommand(c);
    } catch {
      // A remove with nothing to remove can fail; the push after it still runs.
    }
  }
  s.fog = next.in;
  s.in = next.in;
  s.miss = next.miss;
  s.left = next.left;
  if (!next.in) return;
  if (next.title) player.onScreenDisplay.setTitle(`§d${NAME}`, { subtitle: "§7The End", fadeInDuration: 10, stayDuration: 50, fadeOutDuration: 20 });
  if (next.enter) findPlace(player, "chorus_meadow", loc);
  for (const p of motePositions(loc, Math.random)) {
    try {
      d.spawnParticle(MOTE, p);
    } catch {
      // out of the loaded area
    }
  }
  const a = ambience(Math.random);
  if (a) player.playSound(a.sound, { volume: a.volume, pitch: a.pitch });
  for (const e of d.getEntities({ type: ENDERMAN, location: loc, maxDistance: SEND_AWAY_RANGE })) {
    let ground;
    try {
      ground = d.getBlockBelow(e.location, { maxDistance: 3, includePassableBlocks: true })?.typeId;
    } catch {
      continue;
    }
    if (sendAwayNear(ground, e.nameTag)) sendAway(e);
  }
}

export function tickMeadows() {
  const now = system.currentTick;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      step(player, now);
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

// An enderman spawning on a meadow's ground is sent away at once (a spawn egg near a player is let be: meadowRules.js).
export function watchMeadowSpawns() {
  world.afterEvents.entitySpawn.subscribe(({ entity, cause }) => {
    if (entity.typeId !== ENDERMAN) return;
    try {
      const d = entity.dimension;
      const ground = d.getBlockBelow(entity.location, { maxDistance: 3, includePassableBlocks: true })?.typeId;
      if (!MEADOW_GROUND.includes(ground ?? "")) return;
      let nearest = Infinity;
      for (const p of d.getPlayers({ location: entity.location, maxDistance: 64 })) {
        nearest = Math.min(nearest, Math.hypot(p.location.x - entity.location.x, p.location.y - entity.location.y, p.location.z - entity.location.z));
      }
      if (sendAwayOnSpawn(entity.typeId, cause, d.id, ground, nearest)) entity.remove();
    } catch {
      // gone already
    }
  });
}
