// Places in the Field Journal (0.1.130): the Deep Trench (and the Lush Caves, 0.1.137) is found the first time a player is
// in its biome. Each player's own, like the journal: one record a player in the "places" collection, { id: player id,
// found: { place: { x, y, z } } }.
import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { onlinePlayers, message, biomeAt } from "../platform/mc.js";
import { PLACES, directionText, inPlace } from "./trenchRules.js";

const COL = "places";

/** The places the player has found: place id -> { x, y, z } (y from 0.1.137). @param {{ id: string }} player */
export function foundPlaces(player) {
  return db.get(COL, player.id)?.found ?? {};
}

const NEAR_EVERY = 1200; // ticks: the nearest is worked out again at most once a minute a player (sooner after a walk)
const NEAR_SOON = 200;
const NEAR_MOVED = 64; // blocks walked that make it worth working out again sooner
/** @type {Map<string, { tick: number, x: number, z: number, text: Record<string, string> }>} */
const nearCache = new Map();

// The way to the nearest of each place with directions whose research is done (`opened`: project ids), from where the
// player stands in the Overworld: place id -> text. From the world seed (Dimension.calculateClosestBiomeFromSeed, 5 to 9
// ms on the bench), only when the Places page opens, at most once a minute a player (or 10 seconds after walking 64
// blocks). Elsewhere, a line saying it shows in the Overworld.
/** @param {import("@minecraft/server").Player} player @param {string[]} opened */
export function nearPlaces(player, opened) {
  /** @type {Record<string, string>} */
  const out = {};
  const want = Object.entries(PLACES).filter(([, p]) => p.directions && opened.includes(p.research));
  if (!want.length) return out;
  let dimension;
  let loc;
  try {
    dimension = player.dimension;
    loc = player.location;
  } catch {
    return out;
  }
  if (dimension.id !== "minecraft:overworld") {
    for (const [id] of want) out[id] = "The way to the nearest shows here when you are in the Overworld";
    return out;
  }
  const now = system.currentTick;
  const last = nearCache.get(player.id);
  if (last && want.every(([id]) => id in last.text)) {
    const age = now - last.tick;
    if (age < NEAR_SOON || (age < NEAR_EVERY && Math.hypot(last.x - loc.x, last.z - loc.z) < NEAR_MOVED)) return last.text;
  }
  for (const [id, place] of want) {
    try {
      const at = dimension.calculateClosestBiomeFromSeed({ x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) }, place.biome);
      out[id] = at ? `The nearest from where you stand: ${directionText(loc, at)}${place.underground ? ", below the surface" : ""}` : "None found near here";
    } catch {
      out[id] = "The way to the nearest couldn't be worked out just now";
    }
  }
  nearCache.set(player.id, { tick: now, x: loc.x, z: loc.z, text: out });
  return out;
}

// Every 40 ticks: a player standing (or swimming) in a place's biome for the first time finds it (the Deep Caves, 0.1.138:
// below y 0 out of the sky's light, trenchRules.js inPlace).
export function tickPlaces() {
  for (const player of onlinePlayers()) {
    let biome;
    let loc;
    let dimension;
    try {
      loc = player.location;
      dimension = player.dimension;
      biome = biomeAt(dimension, loc);
    } catch {
      continue;
    }
    if (!biome) continue;
    const found = db.get(COL, player.id)?.found ?? {};
    // The sky light at the head, read only when a place under ground is still to find and they're deep enough.
    let sky;
    if (Object.entries(PLACES).some(([id, p]) => p.below !== undefined && !found[id] && loc.y < p.below)) {
      try {
        sky = dimension.getSkyLightLevel({ x: loc.x, y: loc.y + 1.6, z: loc.z });
      } catch {
        sky = undefined;
      }
    }
    const at = { biome: biome.id, dimension: dimension.id, y: loc.y, sky };
    for (const [id, place] of Object.entries(PLACES)) {
      if (!inPlace(place, at)) continue;
      const rec = db.get(COL, player.id) ?? { id: player.id, found: {} };
      if (rec.found[id]) continue;
      rec.found[id] = { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
      db.put(COL, rec);
      message(player, place.found);
    }
  }
}
