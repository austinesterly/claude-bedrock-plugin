// Mooshrooms (0.1.191, module 12; research/vanilla_plan.md "0.1.191 mooshrooms: the design"): the rules, kept apart from
// the game so the tests can run them. The zoo copy is the game's own mooshroom (entities/zoo_mooshroom.json): red or brown
// (minecraft:variant, carried as the coat), milk with a bucket, stew with a bowl, a suspicious stew from a brown one fed a
// flower, a lightning strike swapping its colour. It lives in the Farmyard with the farm animals and their hay bedding
// (animals/farmRules.js). Here:
// - Mycelium underfoot, the Mushroom Fields' floor: species.mycelium.perAnimal blocks for each (a calf half), counted by the
//   measure (ex.myceliumCells). With enough they graze it for up to species.mycelium.share of their food, as cows graze
//   grass (a game choice: the game's mooshrooms eat nothing); short of it comfort is capped as a grazer's without grass.
// - The coat: 0 red, 1 brown; a lightning strike swaps it (the copy's zoocraft:become_brown and zoocraft:become_red).
import { grassNeeded, grazeShare } from "./zebraRules.js";

export const COATS = ["red", "brown"];
export const LIGHTNING_EVENTS = { "zoocraft:become_brown": 1, "zoocraft:become_red": 0 };

export function myceliumNeeded(animals, species, juvenileWeight) {
  return species.mycelium ? grassNeeded(animals, species.mycelium, juvenileWeight) : 0;
}

// Mycelium enough underfoot (true until it's measured, and for everyone else).
export function hasMycelium(species, ex, animals, juvenileWeight) {
  if (!species.mycelium || ex.myceliumCells === undefined) return true;
  return ex.myceliumCells >= myceliumNeeded(animals, species, juvenileWeight);
}

// The share of their food they graze off the mycelium (0 before it's counted).
export function myceliumShare(species, ex, animals, juvenileWeight) {
  if (!species.mycelium) return 0;
  return grazeShare(ex.myceliumCells, myceliumNeeded(animals, species, juvenileWeight), species.mycelium);
}

export function mooshroomWarnings(ex, plural, species, animals, juvenileWeight, cap) {
  if (hasMycelium(species, ex, animals, juvenileWeight)) return [];
  const need = myceliumNeeded(animals, species, juvenileWeight);
  return [{ severity: 2, text: `${plural} graze mycelium, their Mushroom Fields' floor: at least ${need} mycelium blocks in the exhibit floor (${ex.myceliumCells ?? 0} now), ${species.mycelium.perAnimal} for each (a ${species.breeding?.young ?? "young one"} half). Mycelium spreads onto dirt beside it, and Silk Touch picks it up. Without it comfort can't rise above ${cap}. Measure again with the Habitat Marker after.` }];
}

// The Exhibit Clipboard's line: the mycelium, and the colours in the herd.
export function mooshroomLine(ex, species, animals, juvenileWeight) {
  const need = myceliumNeeded(animals, species, juvenileWeight);
  const have = ex.myceliumCells === undefined ? "mycelium not measured yet" : `${ex.myceliumCells} mycelium blocks, ${need} needed${ex.myceliumCells < need ? " §e(too little)§7" : ""}`;
  const brown = animals.filter((a) => a.coat === 1).length;
  return `§fMycelium: §7${have}; ${animals.length - brown} red, ${brown} brown`;
}

// The Field Journal's care notes.
export function mooshroomCareLines(sp, cap) {
  if (!sp.mycelium) return [];
  return [
    `Mycelium: ${sp.mycelium.perAnimal} mycelium blocks in the floor for each (a ${sp.breeding.young} half), their Mushroom Fields' floor. With enough they graze it for up to ${Math.round(sp.mycelium.share * 100)}% of their food, so the feeders last longer. Without it comfort can't rise above ${cap}`,
    "Red or brown: a caught one keeps its colour. A lightning strike near one turns a red one brown and a brown one red, and does it no harm. A calf takes a parent's colour, and 1 time in 1024 the other",
    "No shears: on the game's own mooshroom they cut off its mushrooms and it turns into a cow, so a zoo mooshroom isn't shorn",
  ];
}
