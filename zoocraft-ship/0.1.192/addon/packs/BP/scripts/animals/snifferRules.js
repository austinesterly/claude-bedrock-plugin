// Sniffers (0.1.192, module 12; research/vanilla_plan.md "0.1.192 sniffers: the design"): the rules, kept apart from the
// game so the tests can run them. The zoo copy sniffs, searches, digs up a seed and stands up again by the game's own
// scenting timer, dig goal and events (entities/zoo_sniffer.json), so nothing here moves it. Here:
// - What it's doing, as the copy's property (zoocraft:sniffer_act) says it: the long sniff ("sniffing"), walking nose down
//   to a spot ("searching"), digging, standing up again after ("rising").
// - Digging beds: the ground the game's sniffer digs in (data/blocks.js DIG_PATTERNS: dirt, coarse dirt, grass, podzol,
//   rooted dirt, moss, pale moss, mud, muddy mangrove roots) under species.digBed.share of the usable floor, counted by
//   the measure (ex.digCells).

export const ACT = "zoocraft:sniffer_act"; // the copy's
export const STATES = ["idle", "sniffing", "searching", "digging", "rising"];
export const DIG_GROUND = "dirt, coarse dirt, grass, podzol, rooted dirt, moss, pale moss, mud or muddy mangrove roots";

// Sniffing out a spot: the long sniff, then the walk nose down.
export function isScenting(act) {
  return act === "sniffing" || act === "searching";
}

export function isDigging(act) {
  return act === "digging";
}

export function digNeeded(species, ex) {
  return Math.ceil((ex.usableArea ?? 0) * (species.digBed?.share ?? 0));
}

// Ground enough to dig in (true until it's measured, and for everyone else).
export function hasDigBed(species, ex) {
  if (!species.digBed || ex.digCells === undefined) return true;
  return ex.digCells >= digNeeded(species, ex);
}

export function snifferWarnings(ex, plural, species, T) {
  if (hasDigBed(species, ex)) return [];
  return [{ severity: 2, text: `${plural} need ground to dig in: ${DIG_GROUND} under at least ${Math.round(species.digBed.share * 100)}% of the floor (${digNeeded(species, ex)} of the ${ex.usableArea} blocks here; ${ex.digCells ?? 0} now). Sand, gravel, mycelium and stone they can't dig. Without it comfort can't rise above ${T.digComfortCap}. Measure again with the Habitat Marker after.` }];
}

// The Exhibit Clipboard's line: the digging beds.
export function snifferLine(ex, species) {
  const need = digNeeded(species, ex);
  const have = ex.digCells === undefined ? "ground not measured yet" : `${ex.digCells} floor blocks to dig in, ${need} needed${ex.digCells < need ? " §e(too little)§7" : ""}`;
  return `§fDigging beds: §7${have}`;
}

// The Field Journal's care notes.
export function snifferCareLines(sp, T) {
  if (!sp.digBed) return [];
  return [
    "Digging: every 7 or 8 minutes a grown one stops for a long sniff, walks about nose down to a spot, digs at it for 8 to 10 seconds and turns up a torchflower seed or a pitcher pod (half and half), then stands up again, pleased with itself, as in the game. A snifflet can't dig yet",
    `Digging beds: ${DIG_GROUND} under at least ${Math.round(sp.digBed.share * 100)}% of the floor (not sand, gravel, mycelium or stone). Without it comfort can't rise above ${T.digComfortCap}`,
    "The seeds: plant a torchflower seed or a pitcher pod on farmland and it grows into a flower found nowhere else, or put them in the feeder: sniffers (and chickens) eat both",
    `Company: alone or a few together, up to ${sp.social.recommendedMax}. Breeding: one snifflet at a time (${sp.breeding.litter})`,
  ];
}

export function snifferCatchLine(sp, carrier) {
  return `Catching: none live in the wild; they hatch from sniffer eggs, brushed out of the suspicious sand in warm ocean ruins. With torchflower seeds or a Grain Ration in your inventory, use an empty ${carrier} on a grown one`;
}
