// The farmyard four (0.1.168, module 12; research/vanilla_plan.md "0.1.168 the farmyard four: the design"): the game's own
// sheep, cows, pigs and chickens kept as a petting farm. Pure rules: the climate looks, the hay bedding, the wool growing
// back, the petting farm, and the clipboard and journal lines. animals/farm.js applies them in the world.

// The climate a cow, pig or chicken comes from (the game's entity property minecraft:climate_variant), carried as its coat:
// the zoo copy shows it as minecraft:variant 0, 1 or 2.
export const CLIMATES = ["temperate", "warm", "cold"];

export function climateCoat(value) {
  const i = CLIMATES.indexOf(String(value));
  return i < 0 ? 0 : i;
}

// Hay bedding: hay bales under a roof (a barn corner), 1 for every `hay.per` animals in the yard, `hay.min` at least.
export function hayNeeded(count, hay) {
  return Math.max(hay.min, Math.ceil(count / hay.per));
}

// Like mud: a species without the need, or an exhibit not measured for it yet, always has enough. `count`: every animal in
// the yard that beds down on the hay (a shared farmyard shares its barn).
export function hasHay(species, ex, count) {
  if (!species.hay || ex.hayBales === undefined) return true;
  return ex.hayBales >= hayNeeded(count, species.hay);
}

// `paddock`: true for a paddock's stable corner (0.1.175), "mountain" for a goats' shelter (0.1.180).
/** @param {boolean | "mountain"} [paddock] */
export function hayWarning(ex, plural, count, hay, cap, paddock = false) {
  return { severity: 2, text: `${plural} need bedding: hay bales under a roof, ${paddock === "mountain" ? "a shelter" : paddock ? "a stable corner" : "a barn corner"} where they bed down. ${hayNeeded(count, hay)} or more for the ${count} in the ${paddock === "mountain" ? "exhibit" : paddock ? "paddock" : "yard"} (${ex.hayBales ?? 0} now): a hay bale counts on the floor beside them, or under their feet, with a roof over that spot. Without it comfort can't rise above ${cap}. Measure again with the Habitat Marker after.` };
}

// Wool grows back (sheep): `days` park days after shearing, if the yard has its grass (zoo sheep graze, but never eat the
// grass away as wild ones do).
export function woolBack(shornAt, now, grassy, days, dayLength) {
  return shornAt !== undefined && grassy && now - shornAt >= days * dayLength;
}

// A keeper with this exhibit on their round.
export function keptBy(staff, exhibitId) {
  return staff.some((s) => s.role === "keeper" && (s.exhibitIds ?? []).includes(exhibitId));
}

// A petting farm: a yard holding one of the farm animals with a keeper on its round. Guests like it as a favourite.
export function isPettingFarm(speciesIds, SPECIES, kept) {
  return Boolean(kept) && speciesIds.some((id) => SPECIES[id]?.petting);
}

// The clipboard's farmyard line.
export function farmLine(ex, count, hay, kept) {
  const need = hayNeeded(count, hay);
  const bales = ex.hayBales === undefined ? "hay not measured yet" : `${ex.hayBales} hay bale${ex.hayBales === 1 ? "" : "s"} under a roof${ex.hayBales < need ? ` §e(${need} needed)§7` : ""}`;
  return `§fFarmyard: §7${bales}; ${kept ? "a keeper on its round makes it a petting farm (guests like it a quarter more)" : "no keeper on its round (one with this exhibit on their round makes it a petting farm)"}`;
}

const PRODUCT_LINE = {
  wool: (b) => `Shearing: shears on a grown sheep give 1 to 3 wool of its colour. Its wool grows back ${b.woolDays === 1 ? "a park day" : `${b.woolDays} park days`} later if the yard has its grass (zoo sheep never eat the grass away)`,
  milk: (b, sp) => `Milking: an empty bucket on a grown ${sp.displayName.toLowerCase()} fills it with milk`,
  stew: () => "Stew: a bowl on a grown one gives mushroom stew. Feed a brown one a flower by hand first and the next bowl is a suspicious stew with that flower's effect, then plain stew again",
  eggs: () => "Eggs: a grown hen lays one every 5 to 10 minutes on the floor, brown from warm hens and blue from cold ones",
};

// The Field Journal's care lines for a farm animal (without the colour codes).
export function farmCareLines(sp, b) {
  const lines = [];
  if (sp.hay) lines.push(`Bedding: hay bales under a roof, ${sp.run ? "a stable corner" : sp.rockLedges ? "a shelter" : "a barn corner"}, ${sp.hay.per === 1 ? "1 for each animal" : `1 for every ${sp.hay.per} animals`} in the ${sp.run ? "paddock" : sp.rockLedges ? "exhibit" : "yard"} (${sp.hay.min} at least): on the floor beside them or for them to stand on. Without it comfort can't rise above ${b.hayComfortCap}`);
  for (const p of sp.products ?? []) lines.push(PRODUCT_LINE[p](b, sp));
  if (sp.petting) lines.push(`Petting farm: with a keeper on its round (a Staff Room's keeper with this exhibit on their round) guests like the ${sp.run ? "paddock" : sp.rockLedges ? "exhibit" : "yard"} a quarter more, as a favourite`);
  if (sp.coatFrom === "color") lines.push("Looks: a caught sheep keeps its wool colour, and lambs take after a parent");
  if (sp.coatFrom === "climate") lines.push("Looks: a caught one keeps the look of its climate: temperate, warm (savannas, jungles, badlands) or cold (taigas, snowy taigas, windswept hills)");
  return lines;
}
