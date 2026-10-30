import { system, world } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { findPlace } from "./places.js";
import { PATCHES, MEADOW_GROUND, PROBES, DEPTH, ENDERMAN, SEND_AWAY_RANGE, patchOf, meadowStep, mayBeMeadow, meadowFogCommands, ambience, motePositions, sendAwayOnSpawn, sendAwayNear } from "./meadowRules.js";

// The End patches' feel (the Chorus Meadow 0.1.142, the Rift Willows 0.1.143; the rules are in world/meadowRules.js).
// Every 20 ticks, for each player: which patch they are in (its turf under them, or under a spot 4 blocks out), and while
// they are in one: its fog on their fog stack, its particles drifting round them, its sounds now and then, its name on
// screen on walking in (and its Places entry the first time), and, in a meadow, endermen near them on its ground sent
// away. Endermen that spawn on a meadow's ground are sent away as they come.

const state = new Map(); // player id -> { in, miss, left, last, fog: string | null }

// The patch whose turf is under the player or under one of the spots round them ("" for none).
/** @param {import("@minecraft/server").Dimension} d @param {import("@minecraft/server").Vector3} loc */
function patchUnder(d, loc) {
  for (const [dx, dz] of PROBES) {
    try {
      const p = patchOf(d.getBlockBelow({ x: loc.x + dx, y: loc.y + 0.5, z: loc.z + dz }, { maxDistance: DEPTH })?.typeId);
      if (p) return p;
    } catch {
      // not loaded there
    }
  }
  return "";
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
    s = { in: "", miss: 0, left: -Infinity, last: "", fog: null }; // fog null: not known, so one left from before is cleared
    state.set(player.id, s);
  }
  const d = player.dimension;
  const loc = player.location;
  const next = meadowStep(s, mayBeMeadow(d.id, loc) ? patchUnder(d, loc) : "", now);
  for (const c of meadowFogCommands(s.fog, next.in)) {
    try {
      player.runCommand(c);
    } catch {
      // A remove with nothing to remove can fail; the push after it still runs.
    }
  }
  Object.assign(s, { in: next.in, miss: next.miss, left: next.left, last: next.last, fog: next.in });
  if (!next.in) return;
  const patch = PATCHES[next.in];
  if (next.title) player.onScreenDisplay.setTitle(`${patch.colour}${patch.name}`, { subtitle: "§7The End", fadeInDuration: 10, stayDuration: 50, fadeOutDuration: 20 });
  if (next.enter) findPlace(player, next.in, loc);
  for (const p of motePositions(loc, Math.random)) {
    try {
      d.spawnParticle(patch.mote, p);
    } catch {
      // out of the loaded area
    }
  }
  const a = ambience(next.in, Math.random);
  if (a) player.playSound(a.sound, { volume: a.volume, pitch: a.pitch });
  if (next.in !== "chorus_meadow") return;
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
