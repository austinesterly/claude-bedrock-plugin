// Midnight Owls (0.1.238): the rules, kept apart from the game so the tests can read them. Austin, 2026-11-10: "Let's
// also add midnight owls to the biome. They are dark black, with bright blue eyes, they are the size of the players,
// they are not dangerous." A slow loop keeps a few in each square of the Exotic Formation that has a player in it
// (world/midnightOwls.js; since 0.1.253 the formation is a biome and the map is counted by squares), put down out
// of the player's reach on a hall's floor or a ledge, and the game takes them away again once nobody is near.
import { cellOf, formationIn } from "./formationRules.js";

export const MIDNIGHT_OWL = "zoocraft:wild_midnight_owl";

/** The square of the map a player at x, y, z is in, as a place for a hall (formationIn), if they are at the halls' height; else undefined.
 *  Whether they are in the Exotic Formation is the caller's to ask of the biome. */
export function hallAt(x, y, z, M) {
  const c = cellOf(x, z);
  const f = formationIn(c.i, c.j);
  if (y > f.y + M.over || y < f.y - M.under) return undefined;
  return f;
}

/** A place to look for a floor: somewhere in the hall's inner part. `r1`, `r2`: two random numbers from 0 to 1. */
export function owlSpot(f, r1, r2, M) {
  const a = r1 * Math.PI * 2;
  const d = Math.sqrt(r2) * f.radius * M.inner; // even over the floor, not crowded into the middle
  return { x: Math.floor(f.x + Math.cos(a) * d), z: Math.floor(f.z + Math.sin(a) * d) };
}

/**
 * Of a column's blocks from the top down (each "air", "solid" or "other": goo, plants, liquids), the index of the
 * first solid block with room for an owl over it (`M.room` blocks of air), or -1.
 */
export function perchIn(kinds, M) {
  for (let i = M.room; i < kinds.length; i++) {
    if (kinds[i] !== "solid") continue;
    let clear = true;
    for (let k = 1; k <= M.room; k++) if (kinds[i - k] !== "air") clear = false;
    if (clear) return i;
  }
  return -1;
}

/** Far enough from every player (their x, z) that it isn't seen to appear at arm's length. */
export function awayFrom(spot, players, M) {
  return players.every((p) => Math.hypot(p.x - spot.x, p.z - spot.z) >= M.away);
}

/** How many more owls the hall takes. */
export function owlsWanted(have, M) {
  return Math.max(0, M.perHall - have);
}
