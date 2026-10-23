// Who comes to the park (0.1.98, research/guests_plan.md; spec section 12: "dimensional explorers", a behaviour profile
// rather than a separate economy): besides the everyday guests, Nether and End visitors, explorers dressed for the trip.
// The share of Nether visitors is the share of the park's on-show species that come from the Nether, the same for the
// End, the two together capped (BALANCE.guests.themedCap) so everyday guests always come too. A themed visitor wears
// one of its own looks (guest skins 6-8 Nether, 9-11 End), has its own lines (data/guestLines.js), and counts an
// exhibit with an animal from its dimension double when it picks where to walk (BALANCE.guests.themedPull). They pay,
// spend and complain like everyone else. Pure, so tests can run it.

export const VISITOR_TYPES = {
  any: { looks: [0, 1, 2, 3, 4, 5], label: "Guest" },
  nether: { dimension: "minecraft:nether", looks: [6, 7, 8], label: "Nether visitor" },
  end: { dimension: "minecraft:the_end", looks: [9, 10, 11], label: "End visitor" },
};
export const THEMED = ["nether", "end"];
export const LOOK_COUNT = 12; // guest.json's zoocraft:look range is 0..LOOK_COUNT-1

/** The species on show: every species in an exhibit with animals in it (as the park rating counts them). */
export function speciesOnShow(exhibits) {
  const ids = new Set();
  for (const ex of exhibits) {
    if (!ex.animalIds?.length) continue;
    for (const id of ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : [])) ids.add(id);
  }
  return [...ids];
}

/**
 * The share of each kind of visitor for the species on show: { nether, end, any, counts: { nether, end, total } }.
 * @param {string[]} speciesIds
 * @param {Record<string, any>} species SPECIES
 * @param {number} cap the Nether and End shares together at most
 */
export function visitorMix(speciesIds, species, cap) {
  const counts = { nether: 0, end: 0, total: speciesIds.length };
  for (const id of speciesIds) {
    for (const t of THEMED) if (species[id]?.homeDimension === VISITOR_TYPES[t].dimension) counts[t]++;
  }
  let nether = counts.total ? counts.nether / counts.total : 0;
  let end = counts.total ? counts.end / counts.total : 0;
  if (nether + end > cap) {
    const k = cap / (nether + end);
    nether *= k;
    end *= k;
  }
  return { nether, end, any: 1 - nether - end, counts };
}

/** Which kind of visitor comes next, for a mix from visitorMix. */
export function pickVisitorType(mix, random = Math.random) {
  const r = random();
  if (r < mix.nether) return "nether";
  if (r < mix.nether + mix.end) return "end";
  return "any";
}

/** One of a kind of visitor's looks (the guest skin number). */
export function lookFor(type, random = Math.random) {
  const looks = (VISITOR_TYPES[type] ?? VISITOR_TYPES.any).looks;
  return looks[Math.floor(random() * looks.length)];
}

/** The kind of visitor a look belongs to, so a guest whose record is gone (a tour follower, a rider) still talks like one. */
export function typeOfLook(look) {
  for (const t of THEMED) if (VISITOR_TYPES[t].looks.includes(look)) return t;
  return "any";
}

/** The exhibits a themed visitor heads for first: the ones with an animal from its dimension on show. */
export function favouredExhibits(type, exhibits, species) {
  const ids = new Set();
  const want = VISITOR_TYPES[type]?.dimension;
  if (!want || type === "any") return ids;
  for (const ex of exhibits) {
    if (!ex.animalIds?.length) continue;
    if ((ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : [])).some((id) => species[id]?.homeDimension === want)) ids.add(ex.id);
  }
  return ids;
}

/** The Park Ledger's line: who comes and why. */
export function mixText(mix) {
  const { counts } = mix;
  if (!counts.nether && !counts.end) return "everyday guests §8(Nether and End animals on show bring Nether and End visitors)";
  const pct = (x) => `${Math.round(x * 100)}%`;
  const parts = [];
  if (counts.nether) parts.push(`${pct(mix.nether)} from the Nether`);
  if (counts.end) parts.push(`${pct(mix.end)} from the End`);
  const why = [counts.nether ? `${counts.nether} Nether` : "", counts.end ? `${counts.end} End` : ""].filter(Boolean).join(" and ");
  return `${parts.join(", ")}, the rest everyday guests §8(${why} of ${counts.total} species on show)`;
}
