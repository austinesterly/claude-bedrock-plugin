// Manatees (0.1.129, module 6b part 5; research/trench_plan.md "0.1.129", trench_facts.md §8), pure: a mammal of the water
// (species.aquaticMammal) in a lagoon. It grazes the seagrass and kelp growing in its water (species.seagrass: perAnimal
// columns of water with seagrass or kelp in them for each, a calf a share; with enough, up to `share` of its food comes
// from grazing, and without it comfort can't rise above BALANCE.manatee.seagrassComfortCap), and every few minutes it
// rises to the surface and holds its nostrils just out of the water to breathe, then sinks back (animals/manatee.js).
// In zoos they graze on the bottom and rise every 3 to 5 minutes to breathe, the nose just breaking the surface
// (trench_facts.md §8: Save the Manatee Club, SeaWorld). Every rule here is by the species' flags, never by name.
import { populationWeight } from "./breeding.js";

// What a manatee is doing (its zoocraft:act entity property): the client plays the matching animation.
export const ACT = {
  cruise: 0,
  graze: 1, // head down at the seagrass
  rise: 2, // gliding up to breathe (or back down)
  breathe: 3, // at the surface, the nostrils out of the water
};

// Columns of water with seagrass or kelp needed for these animals: perAnimal each, a young one its share.
export function seagrassNeeded(animals, species, juvenileWeight) {
  if (!species.seagrass) return 0;
  return Math.ceil(species.seagrass.perAnimal * populationWeight(animals, juvenileWeight));
}

// Enough seagrass? A species without the need, or a lagoon not counted yet, always has enough.
export function hasSeagrass(species, ex, animals, juvenileWeight) {
  if (!species.seagrass || ex.seagrassCells === undefined) return true;
  return ex.seagrassCells >= seagrassNeeded(animals, species, juvenileWeight);
}

// The share of their food they get from grazing: up to seagrass.share with enough, less with less; nothing before the
// lagoon has been counted.
export function seagrassShare(species, ex, animals, juvenileWeight) {
  const need = seagrassNeeded(animals, species, juvenileWeight);
  if (!species.seagrass || ex.seagrassCells === undefined || need <= 0) return 0;
  return species.seagrass.share * Math.min(1, ex.seagrassCells / need);
}

// The clipboard's line for a lagoon: how much seagrass grows in the water, against what its manatees need.
export function seagrassLine(ex, plural, species, animals, juvenileWeight, cap) {
  const who = plural.toLowerCase();
  const need = seagrassNeeded(animals, species, juvenileWeight);
  const have = ex.seagrassCells ?? 0;
  if (have >= need) return `§fSeagrass: §ayes §7(${have} water blocks with seagrass or kelp, ${need} needed): ${who} graze it between breaths, ${Math.round(species.seagrass.share * 100)}% of their food`;
  return `§fSeagrass: §7${have} of ${need} water blocks with seagrass or kelp: ${who} graze it, and without enough comfort can't rise above ${cap}. Plant seagrass or kelp on the floor of the lagoon (bone meal on the sand under the water grows it) and measure again`;
}

// The lagoon's warnings.
export function manateeWarnings(ex, residents, plural, species, juvenileWeight, cap) {
  if (hasSeagrass(species, ex, residents, juvenileWeight)) return [];
  const need = seagrassNeeded(residents, species, juvenileWeight);
  return [{ severity: 2, text: `${plural} graze seagrass: seagrass or kelp growing in at least ${need} of the lagoon's water blocks (${ex.seagrassCells ?? 0} now). Plant it on the floor under the water (bone meal on sand or dirt under water grows seagrass), then measure again with the Habitat Marker. Without it comfort can't rise above ${cap}.` }];
}

const WATER = new Set(["water", "seagrass"]);

// The top of the water over (x, y, z): the y of the first block above that isn't water (the surface is its bottom), or
// undefined when (x, y, z) isn't in water or the surface is more than `up` blocks above.
export function surfaceAbove(read, x, y, z, up) {
  if (!WATER.has(read(x, y, z))) return undefined;
  for (let d = 1; d <= up; d++) {
    const c = read(x, y + d, z);
    if (WATER.has(c)) continue;
    return c === "air" ? y + d : undefined; // under ice or a roof it can't breathe there
  }
  return undefined;
}

// Where it holds itself to breathe: its feet `depth` under the surface (the nostrils on top of its snout just clear it).
export function breathSpot(pos, surface, depth) {
  return { x: pos.x, y: surface - depth, z: pos.z };
}

// The seagrass in a column, from the water block (x, y, z) down: the y of the highest seagrass or kelp block in it (where it
// grazes), or undefined when there is none before the floor or within `depth` blocks.
export function seagrassUnder(read, x, y, z, depth) {
  for (let d = 0; d <= depth; d++) {
    const c = read(x, y - d, z);
    if (c === "seagrass") return y - d;
    if (c !== "water") return undefined;
  }
  return undefined;
}
