// Places in the Field Journal (0.1.130): the Deep Trench is found the first time a player is in its biome. Each player's
// own, like the journal: one record a player in the "places" collection, { id: player id, found: { place: { x, z } } }.
import { db } from "../persistence/db.js";
import { onlinePlayers, message, biomeAt } from "../platform/mc.js";
import { PLACES } from "./trenchRules.js";

const COL = "places";

/** The places the player has found: place id -> { x, z }. @param {{ id: string }} player */
export function foundPlaces(player) {
  return db.get(COL, player.id)?.found ?? {};
}

// Every 40 ticks: a player standing (or swimming) in a place's biome for the first time finds it.
export function tickPlaces() {
  for (const player of onlinePlayers()) {
    let biome;
    let loc;
    try {
      loc = player.location;
      biome = biomeAt(player.dimension, loc);
    } catch {
      continue;
    }
    if (!biome) continue;
    for (const [id, place] of Object.entries(PLACES)) {
      if (biome.id !== place.biome) continue;
      const rec = db.get(COL, player.id) ?? { id: player.id, found: {} };
      if (rec.found[id]) continue;
      rec.found[id] = { x: Math.floor(loc.x), z: Math.floor(loc.z) };
      db.put(COL, rec);
      message(player, place.found);
    }
  }
}
