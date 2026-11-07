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
  // Fish (0.1.119): one tank can hold every school.
  reef: { label: "Reef", members: ["zoocraft:zoo_cod", "zoocraft:zoo_salmon", "zoocraft:zoo_tropical_fish", "zoocraft:zoo_pufferfish", "zoocraft:zoo_squid", "zoocraft:zoo_glow_squid"] },
  // The zoo's mobs (0.1.163): zombies and skeletons share a pen, and zombie villagers (0.1.199; husks share with parched).
  crypt: { label: "Crypt", members: ["zoocraft:zoo_zombie", "zoocraft:zoo_skeleton", "zoocraft:zoo_zombie_villager"] },
  // Skeleton horses and zombie horses (0.1.198) share a stable (a camel husk keeps its own).
  undeadStable: { label: "Undead Stable", members: ["zoocraft:zoo_skeleton_horse", "zoocraft:zoo_zombie_horse"] },
  // The drowned and the zombie nautilus (0.1.200) share a water pen: the game's drowned ride them.
  sunkenCrypt: { label: "Sunken Crypt", members: ["zoocraft:zoo_drowned", "zoocraft:zoo_zombie_nautilus"] },
  // Husks and parched (0.1.201) share a pen: the game's camel husk jockey carries one of each.
  desertTomb: { label: "Desert Tomb", members: ["zoocraft:zoo_husk", "zoocraft:zoo_parched"] },
  // Spiders and cave spiders (0.1.202) share a pen: a mineshaft has both.
  spiderDen: { label: "Spider Den", members: ["zoocraft:zoo_spider", "zoocraft:zoo_cave_spider"] },
  // Piglins and piglin brutes (0.1.206) share a pen: a bastion has both (zombified piglins keep their own: piglins flee them).
  bastion: { label: "Bastion", members: ["zoocraft:zoo_piglin", "zoocraft:zoo_piglin_brute"] },
  // Pillagers, vindicators, evokers and vexes (0.1.210) and ravagers (0.1.211) share a pen: the game's raids bring
  // them all, the ravagers ridden by the illagers.
  // Guardians and elder guardians (0.1.212) share a water pen: an ocean monument has both.
  monument: { label: "Ocean Monument", members: ["zoocraft:zoo_guardian", "zoocraft:zoo_elder_guardian"] },
  camp: { label: "Illager Camp", members: ["zoocraft:zoo_pillager", "zoocraft:zoo_vindicator", "zoocraft:zoo_evoker", "zoocraft:zoo_vex", "zoocraft:zoo_ravager"] },
  // The farmyard four (0.1.168) share a yard, rabbits too.
  farmyard: { label: "Farmyard", members: ["zoocraft:zoo_sheep", "zoocraft:zoo_cow", "zoocraft:zoo_pig", "zoocraft:zoo_chicken", "zoocraft:zoo_rabbit", "zoocraft:zoo_mooshroom"] }, // and mooshrooms (0.1.191)
  // Horses and donkeys (0.1.175) share a paddock, and llamas, trader llamas and mules (0.1.193).
  paddock: { label: "Paddock", members: ["zoocraft:zoo_horse", "zoocraft:zoo_donkey", "zoocraft:zoo_llama", "zoocraft:zoo_trader_llama", "zoocraft:zoo_mule"] },
  // Iron, snow and copper golems (0.1.195) share a yard: the game's iron golems hold out poppies to copper golems.
  golems: { label: "Golem Yard", members: ["zoocraft:zoo_iron_golem", "zoocraft:zoo_snow_golem", "zoocraft:zoo_copper_golem"] },
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
