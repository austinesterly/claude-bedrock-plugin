// The fishing sky's fish as swimming mobs (0.1.289; Austin, 15 Nov: "add the new fish as mobs, and 2 spawn in their
// designated island pond. They should also increase the bite rate"). Each island's pond holds two of its own fish
// (fishing/skyFish.js): the common, uncommon and rare islands' biggest pond, the exotic island's pool, the mythic town's
// lagoon and the huge island's harbour. One that dies comes back the next day. Fish near a bobber bring the bite sooner
// (fishing/rodRules.js fishSpeed). The game's side is fishing/pondFish.js. No engine calls here.
import { fishOfIsland } from "./skyFish.js";
import { cityOf, harbourOf } from "./islandRules.js";

/** How many of its fish an island's pond holds. */
export const POND_FISH = 2;
/** What each one carries: its island's id (a dynamic property), so they are never counted for another's. */
export const POND_P = "zoocraft:pond";
/** Every sky fish is of this family (and the game's "fish"). */
export const SKY_FISH_FAMILY = "zoocraft_sky_fish";

/** The mob of an item fish: "zoocraft:sky_perch" swims as "zoocraft:sky_perch_fish". */
export const mobId = (fishId) => `${fishId}_fish`;

/** The mob that lives at an island of that kind, or undefined. */
export function pondFishId(kind) {
  const f = fishOfIsland(kind);
  return f ? mobId(f.id) : undefined;
}

/** How each swims: the game's fish it is drawn and sized from, and how big beside it. */
export const FISH_LOOKS = Object.freeze({
  "zoocraft:sky_perch": Object.freeze({ base: "cod", scale: 1 }),
  "zoocraft:amethyst_trout": Object.freeze({ base: "salmon", scale: 0.9 }),
  "zoocraft:gilded_koi": Object.freeze({ base: "cod", scale: 1.2 }),
  "zoocraft:willow_bass": Object.freeze({ base: "cod", scale: 1.4 }),
  "zoocraft:golden_sailfin": Object.freeze({ base: "salmon", scale: 1.3 }),
  "zoocraft:harbour_herring": Object.freeze({ base: "cod", scale: 0.8 }),
});

/**
 * The pond of an island that needs no shape worked out: the mythic town's lagoon and the huge island's harbour
 * ({ x, z, r, top: the highest its water's surface can be }); undefined for the others (pondOfShape).
 */
export function pondOfPlan(isl) {
  if (isl.kind === "mythic") {
    const c = cityOf(isl);
    return { x: isl.x, z: isl.z, r: c.L, top: c.G };
  }
  if (isl.kind === "huge") {
    const h = harbourOf(isl);
    return { x: h.hx, z: h.hz, r: h.B, top: h.G };
  }
  return undefined;
}

/** The pond of an island from its shape: the exotic pool, or the biggest pond; `top` from the island's own height. */
export function pondOfShape(isl, sh) {
  let best;
  for (const p of sh.ponds) if (!best || p.pool || (!best.pool && p.r > best.r)) best = p;
  return best ? { x: best.x, z: best.z, r: best.r, top: isl.y + 12 } : undefined;
}

/**
 * Where in the pond its fish are put, best first: either side of the middle, then round it, then the middle (a
 * fountain, a boat or a dock may stand on some of them; the game's side takes the first two that are water).
 */
export function pondSpots(pond) {
  const d = Math.max(1, Math.min(6, Math.floor(pond.r * 0.45)));
  const out = [];
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0, 0]]) {
    out.push({ x: Math.floor(pond.x + dx * d) + 0.5, z: Math.floor(pond.z + dz * d) + 0.5 });
  }
  return out;
}

/**
 * How many fish to put in now: up to POND_FISH less those swimming there; none when some were already put in today
 * (one that died, or was taken, comes back the next day), except the first time ever.
 */
export function fishDue(swimming, lastDay, today) {
  const missing = Math.max(0, POND_FISH - swimming);
  if (!missing) return 0;
  if (lastDay === undefined || lastDay === null) return missing;
  return today > lastDay ? missing : 0;
}
