// Dr. Pollo's veterinary work (0.1.249; Austin's NPC Expansion spec, "Dr. Pollo"): "20 Friendship: begins working at
// the zoo veterinary building. He starts treating sick and injured zoo animals." "As friendship and experience
// increase: healing speed improves", he "learns and remembers individual animals' names faster", "competence
// improves". Austin's answer on how he treats them: "Both" (the animals in recovery at the building, and out to the
// exhibits when none wait). The spec leaves the numbers open ("still to be determined"): the ones in balance.js
// residents.vet are ours, his to change. No engine calls here; vetDuty at the end is memory only.

export const VET_ID = "dr_pollo";

/** Whether he works as the zoo's vet: from `g.from` friendship with any player. */
export function vetWorks(points, g) {
  return (points ?? 0) >= g.from;
}

/**
 * His veterinary level, 0-based (0 = level 1): the highest whose treatments (experience) and friendship are both
 * reached. -1 while he doesn't work yet.
 */
export function vetLevel(treated, points, g) {
  if (!vetWorks(points, g)) return -1;
  let level = 0;
  for (let i = 0; i < g.levelFrom.length; i++) if ((treated ?? 0) >= g.levelFrom[i] && (points ?? 0) >= g.levelFriendship[i]) level = i;
  return level;
}

export const maxLevel = (g) => g.levelFrom.length - 1;

/** What holds the next level back: { treated, friendship } still needed (each 0 when reached), or undefined at the top. */
export function nextLevel(treated, points, g) {
  const level = vetLevel(treated, points, g);
  if (level < 0 || level >= maxLevel(g)) return undefined;
  return { treated: Math.max(0, g.levelFrom[level + 1] - (treated ?? 0)), friendship: Math.max(0, g.levelFriendship[level + 1] - (points ?? 0)) };
}

const at = (list, level) => list[Math.max(0, Math.min(list.length - 1, level))];

/** How many times as fast animals in recovery holding get better while he is at the Recovery Station. */
export const holdingBoost = (level, g) => at(g.holdingBoost, level);
/** Real seconds he takes over one unwell animal at its exhibit. */
export const treatSeconds = (level, g) => at(g.treatSeconds, level);

/** Whether he knows an animal by name: after this many treatments of it, fewer at a higher level. */
export function knowsName(times, level, g) {
  return (times ?? 0) >= at(g.nameVisits, level);
}

/**
 * An unwell animal treated in its exhibit: every need under the "attention" band is lifted by his level's gain, as far
 * as that band; the count toward recovery holding starts again; and it is well again when nothing is under that band
 * (the same test the exhibit's own care uses). What made it ill is still the player's to fix. Changes `animal`;
 * returns { well, lifted (need keys he raised) }.
 */
export function treatAnimal(animal, level, g, needs, keys) {
  const gain = at(g.treatGain, level);
  const lifted = [];
  for (const k of keys) {
    const v = animal.needs[k] ?? 0;
    if (v >= needs.bands.attention) continue;
    animal.needs[k] = Math.round(Math.min(needs.bands.attention, v + gain) * 100) / 100;
    lifted.push(k);
  }
  animal.criticalSeconds = 0;
  const well = keys.every((k) => (animal.needs[k] ?? 0) >= needs.bands.attention);
  if (well) animal.ill = false;
  return { well, lifted };
}

/**
 * His record of the animals he has treated, after one more treatment of `animalId` on `day`: { known: { id: { n, day } },
 * counted } where counted says whether it adds to his experience (an animal counts once a park day, so one that keeps
 * falling ill in a bad exhibit can't be farmed). Animals no longer in `alive` are forgotten.
 */
export function noteTreated(known, animalId, day, alive = undefined) {
  const out = {};
  for (const [id, v] of Object.entries(known ?? {})) if (!alive || alive.has(id) || id === animalId) out[id] = v;
  const was = out[animalId];
  const counted = !was || was.day !== day;
  out[animalId] = { n: (was?.n ?? 0) + 1, day };
  return { known: out, counted };
}

/** How many animals he knows by name. */
export function namesKnown(known, level, g) {
  return Object.values(known ?? {}).filter((v) => knowsName(v.n, level, g)).length;
}

/** His work, for his page. */
export function vetText(treated, points, known, g) {
  const level = vetLevel(treated, points, g);
  if (level < 0) return `Not the zoo's vet yet: he starts at ${g.from} friendship.`;
  const next = nextLevel(treated, points, g);
  const names = namesKnown(known, level, g);
  const more = !next ? "the top level" : [next.treated ? `${next.treated} more animal${next.treated === 1 ? "" : "s"} treated` : "", next.friendship ? `${g.levelFriendship[level + 1]} friendship` : ""].filter(Boolean).join(" and ") + ` to level ${level + 2}`;
  return `Veterinary level ${level + 1} of ${g.levelFrom.length}: ${treated ?? 0} animal${treated === 1 ? "" : "s"} treated, ${names} known by name (${more})`;
}

// --- on duty at a park's Recovery Station (memory only; read by the animals' care step) ---
const duty = new Map(); // park id -> { until (tick), boost }

/** He is at this park's Recovery Station with animals waiting, until `untilTick`. */
export function setVetDuty(parkId, boost, untilTick) {
  duty.set(parkId, { boost, until: untilTick });
}

/** How many times as fast this park's recovery holding goes right now (1 when he isn't there). */
export function vetBoost(parkId, tick) {
  const d = duty.get(parkId);
  return d && tick <= d.until ? d.boost : 1;
}
