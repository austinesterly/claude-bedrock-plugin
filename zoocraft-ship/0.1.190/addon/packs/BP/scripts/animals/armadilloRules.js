// Armadillos (0.1.190, module 12; research/vanilla_plan.md "0.1.190 armadillos: the design"): the rules, kept apart from
// the game so the tests can run them. The zoo copy rolls up, peeks and unrolls by the game's own sensor, timers and
// events (entities/zoo_armadillo.json), so nothing here moves it. Here:
// - Its state, as the copy's property (zoocraft:armadillo_state) or the game's own (minecraft:armadillo_state) says it:
//   rolled up (any of the four rolled states), peeking out.
// - Sand underfoot: sand or red sand under species.sandFloor.share of the usable floor (the game's savanna and badlands
//   ground; zoos' sand-and-mulch digging pools), counted by the camels' sand measure (ex.sandFloorCells).
// - Warmth: armadillos can't keep themselves warm (San Diego Zoo: they "cannot maintain their internal temperature"), so
//   in a snowy or frozen biome (the game's biome tags, ex.coldBiome) a fuelled Thermal Regulator beside the floor.

export const STATE = "zoocraft:armadillo_state"; // the copy's
export const WILD_STATE = "minecraft:armadillo_state"; // the game's
export const STATES = ["unrolled", "rolled_up", "rolled_up_peeking", "rolled_up_relaxing", "rolled_up_unrolling"];

// Rolled up: any state but unrolled (the client draws the ball for all four).
export function isRolledUp(state) {
  return typeof state === "string" && state !== "unrolled" && STATES.includes(state);
}

export function isPeeking(state) {
  return state === "rolled_up_peeking";
}

// A cold biome: one of T.coldTags (the game's biome files: "cold" on the snowy taigas, beaches, groves and cold oceans,
// "frozen" on the snowy plains, peaks, slopes and frozen rivers and oceans), or failing the tags, such an id.
export function isColdBiome(biome, T) {
  if (!biome) return false;
  if (biome.tags?.length) return biome.tags.some((t) => T.coldTags.includes(t));
  return /frozen|ice_|snowy|cold_|grove|_peaks|_slopes/.test(biome.id ?? "");
}

export function sandNeeded(species, ex) {
  return Math.ceil((ex.usableArea ?? 0) * (species.sandFloor?.share ?? 0));
}

// Sand enough underfoot (true until it's measured, and for everyone else).
export function hasSandFloor(species, ex) {
  if (!species.sandFloor || ex.sandFloorCells === undefined) return true;
  return ex.sandFloorCells >= sandNeeded(species, ex);
}

// Warm enough: not a cold biome (or not measured yet), or a Thermal Regulator with fuel in it.
export function hasWarmth(species, ex, heaters) {
  if (!species.coldWarmth || !ex.coldBiome) return true;
  return heaters.some((h) => h.units > 0);
}

export function armadilloWarnings(ex, plural, species, T, heaters) {
  const out = [];
  if (!hasSandFloor(species, ex))
    out.push({ severity: 2, text: `${plural} need soft ground to dig in: sand or red sand under at least ${Math.round(species.sandFloor.share * 100)}% of the floor (${sandNeeded(species, ex)} of the ${ex.usableArea} blocks here; ${ex.sandFloorCells ?? 0} now). Without it comfort can't rise above ${T.sandComfortCap}. Measure again with the Habitat Marker after.` });
  if (species.coldWarmth && ex.coldBiome && !hasWarmth(species, ex, heaters)) {
    const why = heaters.length ? "the Thermal Regulator is out of fuel: add charcoal, coal, coal blocks or blaze rods" : "put a Thermal Regulator beside the floor and fuel it with charcoal or coal";
    out.push({ severity: 2, text: `${plural} are cold: this is a snowy biome and they can't keep themselves warm, so ${why}. Until then comfort can't rise above ${T.coldComfortCap}.` });
  }
  return out;
}

// The Exhibit Clipboard's line: the sand, and the warmth in a cold biome.
export function armadilloLine(ex, species, heaters) {
  const need = sandNeeded(species, ex);
  const sand = ex.sandFloorCells === undefined ? "sand not measured yet" : `${ex.sandFloorCells} floor blocks sand, ${need} needed${ex.sandFloorCells < need ? " §e(too little)§7" : ""}`;
  const warm = !ex.coldBiome ? "" : hasWarmth(species, ex, heaters) ? "; a snowy biome, kept warm" : "; a snowy biome: §ecold (a fuelled Thermal Regulator)§7";
  return `§fGround: §7${sand}${warm}`;
}

// The Field Journal's care notes.
export function armadilloCareLines(sp, T, soilMin) {
  if (!sp.sandFloor) return [];
  return [
    "Rolling up: one rolls up into its shell when someone sprints or rides by within 7 blocks, when it's hit, or when undead come near; it peeks out now and then and unrolls a few seconds after they've gone. Walk, don't run, past them",
    `Ground: sand or red sand under at least ${Math.round(sp.sandFloor.share * 100)}% of the floor, soft to dig in (the savanna's and the badlands'), and ${soilMin} or more blocks of Burrow Soil make a digging spot. Without the sand comfort can't rise above ${T.sandComfortCap}`,
    "Den: a Burrow Shelter on the floor to sleep in (they rest in burrows)",
    `Warmth: they can't keep themselves warm, so in a snowy biome a Thermal Regulator beside the floor, fuelled with charcoal or coal. Without it comfort can't rise above ${T.coldComfortCap}`,
    "Scutes: a grown one sheds a scute every 5 to 10 minutes, and a brush gets one more (16 of the brush's uses), as in the game",
    `Breeding: one pup at a time (${sp.breeding.litter}); they're mostly alone, up to ${sp.social.recommendedMax} together`,
  ];
}

export function armadilloCatchLine(sp, carrier) {
  return `Catching: find them in savannas and badlands; with a spider eye or an Insect Ration in your inventory, use an empty ${carrier} on one`;
}
