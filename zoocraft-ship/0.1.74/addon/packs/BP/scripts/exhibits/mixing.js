// Mixed-species exhibits (0.1.61, spec section 5.5 "incompatible species" and M6 "mixed-species
// exhibits"), pure. A community is a named group of species that get on together; two species share
// an exhibit only when some community holds both, and everything else keeps an exhibit of its own.
// Everything here is visible to players: the Field Journal's care notes say who a species shares
// with, the clipboard's exhibit page lists every species living there, and a refused release says
// why. A shared exhibit needs more room: the biggest resident's space for everyone, times
// balance.mixing.spaceFactor (shown as "a quarter more").

export const COMMUNITIES = {
  meadow: { label: "Meadow", members: ["zoocraft:zoo_rabbit", "zoocraft:deer", "zoocraft:capybara"] },
  hedgerow: { label: "Hedgerow", members: ["zoocraft:zoo_rabbit", "zoocraft:hedgehog"] },
  wetland: { label: "Wetland", members: ["zoocraft:otter", "zoocraft:capybara"] },
  savanna: { label: "Savanna", members: ["zoocraft:giraffe", "zoocraft:elephant", "zoocraft:zebra"] },
  basalt: { label: "Basalt flats", members: ["zoocraft:basalt_tortoise", "zoocraft:ember_fox"] },
  endMeadow: { label: "End meadow", members: ["zoocraft:chorus_deer", "zoocraft:rift_ferret"] },
};

// The communities a species belongs to.
export function communitiesOf(speciesId) {
  return Object.keys(COMMUNITIES).filter((k) => COMMUNITIES[k].members.includes(speciesId));
}

// The other species it shares an exhibit with, in catalogue order.
export function companions(speciesId, SPECIES) {
  const set = new Set();
  for (const k of communitiesOf(speciesId)) for (const id of COMMUNITIES[k].members) if (id !== speciesId) set.add(id);
  return Object.keys(SPECIES).filter((id) => set.has(id));
}

export function canShare(a, b) {
  if (a === b) return true;
  return communitiesOf(a).some((k) => COMMUNITIES[k].members.includes(b));
}

const names = (ids, SPECIES) => ids.map((id) => plural(SPECIES[id])).join(", ");
const plural = (sp) => sp.plural ?? `${sp.displayName}s`;

// "Shares an exhibit with: Deer, Capybaras (Meadow)" or "Keeps an exhibit of its own" (the journal).
export function companyText(species, SPECIES) {
  const with_ = companions(species.id, SPECIES);
  if (!with_.length) return "Keeps an exhibit of its own";
  const labels = communitiesOf(species.id).map((k) => COMMUNITIES[k].label).join(", ");
  return `Shares an exhibit with: ${names(with_, SPECIES)} (${labels})`;
}

// Why `species` can't move in with the species already living there (`residentIds`), or undefined
// when it can.
export function mixProblem(residentIds, species, SPECIES) {
  const other = (residentIds ?? []).filter(Boolean).find((id) => !canShare(id, species.id));
  if (!other) return undefined;
  const with_ = companions(species.id, SPECIES);
  const company = with_.length ? `${plural(species)} share with: ${names(with_, SPECIES)}.` : `${plural(species)} keep an exhibit of their own.`;
  return `${plural(species)} don't share an exhibit with ${names([other], SPECIES)}. ${company}`;
}

// The profile a shared exhibit is measured with: the one asking the most ground.
export function widestProfile(speciesList, HABITAT_PROFILES) {
  let best;
  for (const sp of speciesList) {
    const p = HABITAT_PROFILES[sp.habitatProfile];
    if (p && (!best || p.baseArea > best.baseArea)) best = p;
  }
  return best;
}

// How much more room a shared exhibit needs: 1 for one species, balance.mixing.spaceFactor for more.
export function spaceFactor(speciesCount, balance) {
  return speciesCount > 1 ? balance.mixing.spaceFactor : 1;
}
