// Welfare math (spec section 7). Pure: takes plain records, returns new values; no Minecraft calls.
// Needs run 0-100, higher is better. Satiety and enrichment drain over park time; cleanliness
// belongs to the exhibit; comfort and social drift toward a target set by the exhibit's conditions.

import { RATIONS, rationPlural } from "../data/items.js";

export const NEED_KEYS = ["satiety", "comfort", "cleanliness", "enrichment", "social"];
const clamp = (v) => Math.max(0, Math.min(100, v));

export function welfareScore(needs, weights) {
  let w = 0;
  for (const k of NEED_KEYS) w += weights[k] * needs[k];
  return Math.round(w);
}

export function band(value, bands) {
  if (value >= bands.healthy) return "healthy";
  if (value >= bands.attention) return "attention";
  if (value >= bands.urgent) return "urgent";
  return "critical";
}

export function lowestNeed(needs) {
  let worst = NEED_KEYS[0];
  for (const k of NEED_KEYS) if (needs[k] < needs[worst]) worst = k;
  return worst;
}

export function comfortTarget(spaceRatio) {
  // spaceRatio = usable area / required area. A crowded exhibit is safe but uncomfortable.
  return spaceRatio >= 1 ? 90 : Math.round(90 * Math.max(0, spaceRatio));
}

export function socialTarget(social, groupSize) {
  if (groupSize < social.minGroup) return 40;
  if (groupSize > social.recommendedMax) return 55;
  if (social.prefersCompany && groupSize < 2) return 65;
  return 90;
}

const toward = (value, target, maxStep) => (value < target ? Math.min(target, value + maxStep) : Math.max(target, value - maxStep));

/**
 * Advance one animal by `seconds` of park time.
 * @param {object} animal  record with needs, health and criticalSeconds
 * @param {object} species species entry
 * @param {{ exhibitCleanliness: number, spaceRatio: number, groupSize: number, feederUnits: number, water?: boolean, cover?: boolean, cold?: boolean, mud?: boolean, heat?: boolean, bask?: boolean, ash?: boolean, den?: boolean, end?: boolean, anchor?: boolean, tunnel?: boolean, tree?: boolean, wash?: boolean, graze?: boolean, harem?: boolean, dens?: boolean, ledge?: boolean, coalition?: boolean, privacy?: boolean, solitary?: boolean, bank?: boolean, submerge?: boolean, canopy?: boolean, nestbox?: boolean, shade?: boolean, troop?: boolean, deep?: boolean, perches?: boolean, nylium?: boolean, rub?: boolean, drainFactor?: number, grazeShare?: number, satietyCap?: number, enrichmentPerDay?: number }} ctx
 *   water: false when the animals have nothing to drink (comfort is capped); cover: false when a
 *   species that wants quiet cover hasn't enough (comfort is capped); heat: false when a Nether
 *   species has no working Thermal Regulator; bask: false without enough basking pads; ash: false
 *   without a big enough Warm Ash bed; den: false without an Ember Den; end: false without enough
 *   end stone in the floor (End ground); anchor: false when a rift species has no charged Containment
 *   Anchor; tunnel: false without enough Rift Tunnels; tree: false when a climber has no climbing tree or
 *   Climbing Frame; wash: false without water to wash food in; graze: false when grazers haven't enough
 *   grass; harem: false while rival stallions share the mares; dens: false when a dangerous species has
 *   too few Holding Dens; ledge: false when lions have too few ledges; coalition: false with more grown
 *   males than a coalition; privacy: false when tigers have too little screened floor; solitary: false
 *   with two grown tigers loose together (but a pair on their introduction day); bank: false for a crocodile
 *   left without a spot on the sunny basking bank (the smallest, when it's short); submerge: false when the
 *   crocodiles haven't deep water enough to go under all at once; canopy: false when red pandas haven't canopy
 *   enough reached by climbing; nestbox: false without a Nest Box each; shade: false in a hot biome without shade
 *   over enough of the floor; perches: false while an owl aviary's Perches are all about one height; nylium: false
 *   when Crimson Grazers haven't crimson nylium enough in the floor; rub: false without a crimson stem to rub on; troop: false
 *   while two silverbacks share the females (gorillas); deep: false with
 *   water 2 or more deep in the exhibit for a species that can't swim; drainFactor: the satiety drain's share today (a planned fast day); grazeShare: the share of its food it gets
 *   grazing (0 to 1: the satiety drain is that much lower, so it eats that much less from the feeders);
 *   satietyCap: how high the feeders can bring its satiety (a zebra pushed off the food by higher-ranking
 *   ones); enrichmentPerDay: enrichment restored by the exhibit's equipment
 * @returns {{ unitsEaten: number }} feeder units consumed; the caller takes them off the feeder
 */
export function simulateAnimal(animal, species, ctx, seconds, balance) {
  const days = seconds / balance.clock.dayLength;
  const n = animal.needs;
  const drain = balance.needs.drainPerDay;

  n.satiety = clamp(n.satiety - drain.satiety * days * (1 - (ctx.grazeShare ?? 0)) * (ctx.drainFactor ?? 1));
  // Eat from real feeder stock: each unit restores exactly one share of a day's drain, so an
  // animal eating its daily ration holds steady (a grazer needs that much less of it).
  const perUnit = drain.satiety / species.rationUnitsPerParkDay;
  const cap = ctx.satietyCap ?? 100;
  let unitsEaten = 0;
  let units = ctx.feederUnits;
  while (units > 0 && n.satiety <= cap - perUnit) {
    n.satiety = clamp(n.satiety + perUnit);
    units--;
    unitsEaten++;
  }

  n.enrichment = clamp(n.enrichment - drain.enrichment * days + (ctx.enrichmentPerDay ?? 0) * days);
  n.cleanliness = clamp(ctx.exhibitCleanliness);
  const step = balance.needs.adjustPerDay * days;
  let comfortGoal = comfortTarget(ctx.spaceRatio);
  if (ctx.water === false) comfortGoal = Math.min(comfortGoal, balance.trough.dryComfortCap);
  if (ctx.cover === false) comfortGoal = Math.min(comfortGoal, balance.cover.comfortCap);
  if (ctx.cold === false) comfortGoal = Math.min(comfortGoal, balance.cooler.warmComfortCap);
  if (ctx.mud === false) comfortGoal = Math.min(comfortGoal, balance.mud.comfortCap);
  if (ctx.heat === false) comfortGoal = Math.min(comfortGoal, balance.heater.coldComfortCap);
  if (ctx.bask === false) comfortGoal = Math.min(comfortGoal, balance.bask.comfortCap);
  if (ctx.ash === false) comfortGoal = Math.min(comfortGoal, balance.ash.comfortCap);
  if (ctx.den === false) comfortGoal = Math.min(comfortGoal, balance.den.comfortCap);
  if (ctx.end === false) comfortGoal = Math.min(comfortGoal, balance.endGround.comfortCap);
  if (ctx.anchor === false) comfortGoal = Math.min(comfortGoal, balance.anchor.comfortCap);
  if (ctx.tunnel === false) comfortGoal = Math.min(comfortGoal, balance.tunnel.comfortCap);
  if (ctx.tree === false) comfortGoal = Math.min(comfortGoal, balance.climbTree.comfortCap);
  if (ctx.wash === false) comfortGoal = Math.min(comfortGoal, balance.wash.comfortCap);
  if (ctx.graze === false) comfortGoal = Math.min(comfortGoal, balance.graze.comfortCap);
  if (ctx.harem === false) comfortGoal = Math.min(comfortGoal, balance.zebra.rivalComfortCap);
  if (ctx.dens === false) comfortGoal = Math.min(comfortGoal, balance.predators.dens.comfortCap);
  if (ctx.ledge === false) comfortGoal = Math.min(comfortGoal, balance.lion.ledgeComfortCap);
  if (ctx.coalition === false) comfortGoal = Math.min(comfortGoal, balance.lion.coalitionComfortCap);
  if (ctx.privacy === false) comfortGoal = Math.min(comfortGoal, balance.tiger.privacyComfortCap);
  if (ctx.solitary === false) comfortGoal = Math.min(comfortGoal, balance.tiger.solitaryComfortCap);
  if (ctx.bank === false) comfortGoal = Math.min(comfortGoal, balance.croc.bankComfortCap);
  if (ctx.submerge === false) comfortGoal = Math.min(comfortGoal, balance.croc.submergeComfortCap);
  if (ctx.canopy === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.canopyComfortCap);
  if (ctx.nestbox === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.nestComfortCap);
  if (ctx.shade === false) comfortGoal = Math.min(comfortGoal, balance.redpanda.shadeComfortCap);
  if (ctx.troop === false) comfortGoal = Math.min(comfortGoal, balance.gorilla.rivalComfortCap);
  if (ctx.deep === false) comfortGoal = Math.min(comfortGoal, balance.gorilla.deepComfortCap);
  if (ctx.perches === false) comfortGoal = Math.min(comfortGoal, balance.owl.perchComfortCap);
  if (ctx.nylium === false) comfortGoal = Math.min(comfortGoal, balance.grazer.nyliumComfortCap);
  if (ctx.rub === false) comfortGoal = Math.min(comfortGoal, balance.grazer.rubComfortCap);
  n.comfort = clamp(toward(n.comfort, comfortGoal, step));
  n.social = clamp(toward(n.social, socialTarget(species.social, ctx.groupSize), step));

  // Sustained critical care makes the animal ill; it never dies of neglect in default mode.
  const critical = NEED_KEYS.some((k) => n[k] < balance.needs.bands.urgent);
  animal.criticalSeconds = critical ? (animal.criticalSeconds ?? 0) + seconds : 0;
  if (animal.criticalSeconds >= balance.needs.illAfterCriticalSeconds) animal.ill = true;
  if (animal.ill && !critical && NEED_KEYS.every((k) => n[k] >= balance.needs.bands.attention)) animal.ill = false;

  for (const k of NEED_KEYS) n[k] = Math.round(n[k] * 100) / 100;
  return { unitsEaten };
}

// Quiet cover: how many covered blocks the exhibit needs, and whether it has them. A species
// without a cover need, or an exhibit not measured for cover yet, always has enough.
export function coverNeeded(species, usableArea) {
  return species.cover ? Math.ceil(usableArea * species.cover.minFraction) : 0;
}

export function hasCover(species, ex) {
  if (!species.cover || ex.coveredCells === undefined) return true;
  return ex.coveredCells >= coverNeeded(species, ex.usableArea);
}

// Mud wallow (elephants): enough blocks of mud in the floor. Like cover, a species without the need,
// or an exhibit not measured for it yet, always has enough.
export function hasMud(species, ex) {
  if (!species.mud || ex.mudCells === undefined) return true;
  return ex.mudCells >= species.mud.minCells;
}

// Basking pads (Basalt Tortoises): enough magma blocks in the floor. Like mud, a species without the
// need, or an exhibit not measured for it yet, always has enough.
export function hasBask(species, ex) {
  if (!species.bask || ex.hotCells === undefined) return true;
  return ex.hotCells >= species.bask.minCells;
}

// Warm Ash bed (Ember Foxes): enough Warm Ash blocks in the floor to dig in. Like mud, a species
// without the need, or an exhibit not measured for it yet, always has enough.
export function hasAsh(species, ex) {
  if (!species.ash || ex.ashCells === undefined) return true;
  return ex.ashCells >= species.ash.minCells;
}

// End ground (Chorus Deer): enough end stone in the floor. Like mud, a species without the need, or
// an exhibit not measured for it yet, always has enough.
export function hasEnd(species, ex) {
  if (!species.endGround || ex.endCells === undefined) return true;
  return ex.endCells >= species.endGround.minCells;
}

// What is holding an exhibit's comfort down right now, as keys for adviceFor: everything that caps
// the comfort target below healthy. Empty means nothing is wrong and comfort is only catching up.
export function comfortCauses(ctx, balance) {
  const out = [];
  if (comfortTarget(ctx.spaceRatio) < balance.needs.bands.healthy) out.push("space");
  for (const k of ["water", "cover", "cold", "mud", "heat", "bask", "ash", "den", "end", "anchor", "tunnel", "tree", "wash", "graze", "harem", "dens", "ledge", "coalition", "privacy", "solitary", "bank", "submerge", "canopy", "nestbox", "shade", "troop", "deep", "perches", "nylium", "rub"]) if (ctx[k] === false) out.push(k);
  return out;
}

// Recovery holding at a Recovery Station: every need climbs back toward healthy, and the animal is
// well again once nothing is low. Without a station, animals in holding just wait unchanged.
export function recoverInHolding(animal, seconds, balance) {
  const step = (balance.recovery.perDay * seconds) / balance.clock.dayLength;
  const goal = balance.needs.startNeeds;
  for (const k of NEED_KEYS) animal.needs[k] = Math.round(toward(animal.needs[k], Math.max(animal.needs[k], goal[k]), step) * 100) / 100;
  animal.criticalSeconds = 0;
  if (NEED_KEYS.every((k) => animal.needs[k] >= balance.needs.bands.healthy)) animal.ill = false;
}

// Exhibit cleanliness drains faster with more residents, and with an unfiltered pool
// (waterDirt is the extra share from equipment/rules.js waterDirtFactor).
export function dirtyExhibit(exhibit, population, seconds, balance, waterDirt = 0) {
  if (population <= 0) return;
  const days = seconds / balance.clock.dayLength;
  const rate = balance.needs.drainPerDay.cleanliness * (1 + balance.care.exhibitDirtPerExtraAnimal * Math.max(0, population - 1)) * (1 + waterDirt);
  exhibit.cleanliness = Math.round(clamp((exhibit.cleanliness ?? 100) - rate * days) * 100) / 100;
}

const NEED_ADVICE = {
  satiety: "Fill the feeder with rations",
  cleanliness: "Clean the exhibit with a Cleaning Rake",
  enrichment: "Play with the animal (empty hand) or add enrichment equipment",
  comfort: "Measure the exhibit again with the Habitat Marker to see what it needs",
  social: "Animals of this species like company",
};

// What each comfort cause asks for (Austin, 0.1.45: name only what applies to this animal).
const COMFORT_FIX = {
  space: () => "more room",
  water: (s) => (s?.lavaSwimmer || s?.lavaWalker ? "a lava pool" : s?.drinksLava ? "lava to drink in a Lava Trough" : "drinking water"),
  cover: () => "trees or a roof over part of the ground",
  cold: () => "a Cooling Unit with ice",
  mud: () => "a mud wallow",
  heat: () => "a fuelled Thermal Regulator",
  bask: (s) => (s?.bask?.rest ? "magma blocks to rest on" : "magma blocks to bask on"),
  ash: () => "a Warm Ash bed to dig in",
  den: (s) => (s?.den === "burrow" ? "a Burrow Shelter" : "an Ember Den"),
  end: () => "end stone in the floor",
  anchor: () => "a charged Containment Anchor",
  tunnel: (s) => `${s?.tunnels?.min ?? 2} or more Rift Tunnels to blink between`,
  tree: () => "a climbing tree (3 or more logs high) or a Climbing Frame",
  wash: () => "water to wash their food in (a pool, even one block)",
  graze: (s) => `grass to graze (${s?.graze?.perAnimal ?? 30} grass blocks in the floor for each)`,
  harem: () => "one stallion with the mares (keep the other stallions together in a bachelor group)",
  dens: (s) => `a Holding Den for each grown ${s?.displayName?.toLowerCase() ?? "animal"}${s?.dens?.spare ? `, and ${s.dens.spare} spare` : ""}`,
  ledge: () => "a ledge to rest up high for each (a floor block 1 or 2 higher than the floor beside it)",
  coalition: () => "no more than two grown males (a coalition)",
  privacy: () => "screened floor to get out of sight (rock, earth, leaves or a tree trunk round a floor block at head height)",
  bank: () => "a bigger sunny bank to bask on (4 blocks for each, within 3 of the water, open to the sky, not gravel, rock or logs)",
  submerge: () => "deeper water for all to go under at once (4 spots 2 deep for each grown one)",
  solitary: () => "one grown tiger loose at a time (a Holding Den each: they take turns out)",
  canopy: () => "more canopy to travel and rest on (leaves, logs or a Climbing Frame 2 or more blocks up, reached from a trunk)",
  nestbox: () => "a Nest Box for each grown one (on the floor, or up beside the canopy)",
  shade: () => "shade from the heat over a third of the floor (leaves or a roof): it's a hot biome",
  troop: () => "one silverback with the females (move the other grown males to a bachelor group of their own)",
  deep: () => "no water 2 or more deep: they can't swim (fill it to 1 block deep, or fence the deep part off)",
  perches: () => "Perches at different heights (one 2 or more blocks higher than another)",
  nylium: () => "crimson nylium in the floor (16 blocks or more)",
  rub: () => "a crimson stem to rub against (standing on the floor, back from the walls)",
};

const listOf = (parts) => (parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`);

/**
 * What to do about a low need. With the species and the exhibit's comfort causes (comfortCauses),
 * the advice names only what applies; with no causes left, comfort is just recovering. `pushed`: this
 * one gets pushed off the food by higher-ranking ones (zebras), with the feeding places each feeder has.
 * @param {string} need
 * @param {any} [species]
 * @param {string[]} [causes]
 * @param {{ feeder: number, rack: number }} [pushed]
 */
export function adviceFor(need, species, causes, pushed = undefined) {
  if (need === "comfort" && causes) {
    if (!causes.length) return "Nothing to fix: everything it needs is in place, and comfort is recovering a little every park day";
    return `Give the animals ${listOf(causes.map((c) => COMFORT_FIX[c]?.(species) ?? c))}`;
  }
  if (need === "satiety" && species && pushed) return `Add feeding places: ${(species.plural ?? `${species.displayName}s`).toLowerCase()} feed in rank order, and this one gets pushed off the food by higher-ranking ones (a Basic Feeder has room for ${pushed.feeder}, a Hay Rack for ${pushed.rack})`;
  if (need === "satiety" && species) return `Fill the ${species.lavaSwimmer ? "Thermal Feeder" : species.rack ? "feeder or Hay Rack" : "feeder"} with ${rationPlural(species.baitItem)}`;
  if (need === "social" && species) {
    const plural = species.plural ?? `${species.displayName}s`;
    const s = species.social;
    return s.prefersCompany ? `${plural} like company: keep ${Math.max(2, s.minGroup)} or more together, up to ${s.recommendedMax}` : `${plural} are happy alone: keep no more than ${s.recommendedMax} together`;
  }
  return NEED_ADVICE[need];
}
