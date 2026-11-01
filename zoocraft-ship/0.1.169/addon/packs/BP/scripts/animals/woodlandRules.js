// Wolves and foxes (0.1.169, module 12: research/vanilla_plan.md), pure. The zoo copies of the game's wolves and foxes
// keep the game's own looks and ways (entities/zoo_wolf.json, zoo_fox.json): a wolf begs and, in the zoo, walks over to a
// Scent Post now and then and noses it (species.scentTrail); a fox naps by day on the ground under a roof or leaves, as the
// game's fox does (species.naps; the journal reads it from the entity's sleeping flag). What a script decides is here: the
// Burrow Soil a fox digs in (species.toys "soil": dig enrichment while the exhibit has enough of it), and the care notes.

// Dig enrichment from Burrow Soil (the molebear measure's count of it in the floor or beside it: ex.molebear.soil) for a
// species that digs in it (species.toys includes "soil"): a pseudo fixture the enrichment rules count like a toy.
/**
 * @param {{ toys?: string[] }} species
 * @param {{ molebear?: { soil: number } }} ex
 * @param {{ soilMin: number }} b BALANCE.woodland
 */
export function soilFixtures(species, ex, b) {
  if (!species.toys?.includes("soil")) return [];
  return (ex.molebear?.soil ?? 0) >= b.soilMin ? [{ type: "soil" }] : [];
}

// The Field Journal's care notes for wolves and foxes.
/**
 * @param {{ scentTrail?: boolean, naps?: boolean, toys?: string[], cover?: { minFraction: number }, displayName: string }} sp
 * @param {{ soilMin: number }} b BALANCE.woodland
 */
export function woodlandCareLines(sp, b) {
  const lines = [];
  if (sp.scentTrail) {
    lines.push(`Den: tree leaves or a roof over a corner, at least ${Math.round((sp.cover?.minFraction ?? 0) * 100)}% of the ground, where the pack lies up together`);
    lines.push("Scent Posts on the floor (a log, string and a fern at the Zoo Workshop): now and then one trots over to a post and noses it for a while. Posts spread round the exhibit make a scent trail to follow");
    lines.push("A pack: 3 or more together. They beg as the game's wolves do, head tilted at someone holding meat or a bone. Zoo wolves never attack anything");
  }
  if (sp.naps) {
    lines.push(`Naps: by day they curl up asleep on the ground under a roof or leaves (cover over ${Math.round((sp.cover?.minFraction ?? 0) * 100)}% of the ground), and are about at night. Someone walking up without sneaking wakes one; keepers, guests and the zoo's animals don't`);
  }
  if (sp.toys?.includes("soil")) lines.push(`Digging: ${b.soilMin} or more blocks of Burrow Soil in the floor or beside it (2 dirt, a gravel and a clay ball make 4) to dig in`);
  return lines;
}

// How a wild one is coaxed in, for the journal (the carrier and every bait it takes).
/**
 * @param {{ baitText?: string, scentTrail?: boolean, naps?: boolean }} sp
 * @param {string} carrier the carrier's label
 */
export function woodlandCatchLine(sp, carrier) {
  if (sp.scentTrail) return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild wolves leave you be unless one is hit; then the pack turns on you. A tamed wolf is someone's pet: leave it with them`;
  if (sp.naps) return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. A wild fox runs from anyone who isn't sneaking: sneak up holding berries and it comes to you, or find one napping`;
  return "";
}
