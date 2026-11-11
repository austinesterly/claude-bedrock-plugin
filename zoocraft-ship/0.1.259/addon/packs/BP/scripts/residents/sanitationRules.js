// Clian's sanitation work (0.1.259; Austin's NPC Expansion #16-20 spec, "Occupation — Sanitation Specialist": "Reduces
// or eliminates germs in designated areas. Helps maintain sanitary conditions. Does not collect litter. Does not remove
// visible dirt, mud, or animal waste." and "If the add-on has an existing germ or disease system, integrate his
// sanitation work with it"). The zoo's disease system is the illness clock: an animal kept in critical care (any need
// under the "urgent" band) for balance.js needs.illAfterCriticalSeconds of park time falls ill (animals/welfare.js).
// Germs are what turns that neglect into illness, so an exhibit he has sanitised runs the clock slower for a while
// (balance.js residents.sanitation, all ours). Nothing he does changes an exhibit's cleanliness, its litter, the blocks
// in it or the animals' needs: the keepers still have to clean and feed. Pure rules here; the round he walks is in
// residents/residents.js, the record of sanitised exhibits in residents/germs.js. Pure: no game imports.

export const SANITATION_ID = "clian";

/**
 * How fast the illness clock runs in an exhibit sanitised until `until` (park seconds), at park time `now`: the
 * sanitation's `germFactor` while it lasts, else 1.
 */
export function germFactor(until, now, g) {
  return (until ?? 0) > now ? g.germFactor : 1;
}

/** Until when (park seconds) an exhibit sanitised now stays sanitised. */
export function sanitisedUntil(now, g) {
  return now + g.protectSeconds;
}

/**
 * The exhibits for his round, the most in need first (their ids): exhibits with animals in them (state "occupied"
 * and an animal located there) that stay sanitised for less than `g.renewSeconds` more, and that he hasn't just
 * done or failed to reach (`skip`, a Set of ids). First those with an animal in critical care (its illness clock
 * running), the longest-running first; then the rest, the soonest to run out first (never-sanitised ones before any).
 * `untilOf(id)` gives an exhibit's sanitised-until (0 when never).
 */
export function roundOrder(exhibits, animals, untilOf, now, g, skip = new Set()) {
  const clock = new Map(); // exhibit id -> the longest-running illness clock of an animal in it
  for (const a of animals) {
    if (a.location?.kind !== "exhibit") continue;
    const id = a.location.id;
    clock.set(id, Math.max(clock.get(id) ?? 0, a.criticalSeconds ?? 0));
  }
  const due = exhibits
    .filter((e) => e.state === "occupied" && clock.has(e.id) && !skip.has(e.id))
    .map((e) => ({ id: e.id, left: Math.max(0, (untilOf(e.id) ?? 0) - now), crit: clock.get(e.id) }))
    .filter((x) => x.left < g.renewSeconds);
  due.sort((a, b) => Number(b.crit > 0) - Number(a.crit > 0) || b.crit - a.crit || a.left - b.left || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return due.map((x) => x.id);
}

/** What his page says about his work: how many exhibits he has sanitised, and how many are sanitised now. */
export function sanitationText(done, sanitisedNow) {
  const n = done ?? 0;
  return `${n} exhibit${n === 1 ? "" : "s"} sanitised so far; ${sanitisedNow} sanitised now`;
}
