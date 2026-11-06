// Axolotls (0.1.185, module 12; research/vanilla_plan.md "0.1.185 axolotls: the design"): the game's own kept in an
// axolotl tank. Pure rules: the water plants (seagrass or kelp growing in the tank's water, counted by exhibits/geometry.js
// as the manatees' seagrass is: ex.seagrassCells) for cover, their enrichment and to lay eggs on; the floor (never gravel:
// ex.axolotl.gravel, counted by exhibits/exhibits.js); a young one's colour (a parent's, or the game's rare blue); what the
// journal sees; and the clipboard, journal and warning lines. Every rule here is by the species' flags, never by name.
// Sources: EAZA Amphibian TAG, Best Practice Guidelines for the Lake Patzcuaro salamander (Ambystoma dumerilii, a close
// relative of the axolotl kept the same way): a densely planted 110 x 60 x 40 cm aquarium for up to 4 (2.1.7); the floor
// bare or fine sand, as gravel is swallowed and impacts (2.1.2); dimly lit, they're photophobic, and under brighter light
// need enough plant cover to keep out of it (2.1.8); invertebrates, adults fed every other day (2.2); no social structure
// (2.3); eggs laid singly on aquatic plants (2.4.2), hatching in 2 to 3 weeks (2.4.4). The game's axolotl (Mojang's
// 1.26.50 files): five colours (minecraft:variant 0 lucy, 1 cyan, 2 gold, 3 wild, 4 blue); a baby is blue 1 time in 1200
// (offspring mutation_factor variant 0.00083), else a parent's.
import { populationWeight } from "./breeding.js";

// What they mustn't have on the floor under the water.
export const GRAVEL_BLOCKS = new Set(["minecraft:gravel", "minecraft:suspicious_gravel"]);

// What a column of a tank holds above its floor: water, and the plants growing in it.
const IN_WATER = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:seagrass", "minecraft:kelp"]);

// The game's colours, by minecraft:variant: what the journal and the messages call them.
export const COLOURS = ["pink", "cyan", "gold", "brown", "blue"];

// Water blocks with seagrass or kelp growing in them needed for these axolotls: plantsPerAnimal each, a young one its share.
export function plantsNeeded(animals, T, juvenileWeight) {
  return Math.ceil(T.plantsPerAnimal * populationWeight(animals, juvenileWeight));
}

// Enough plants? A species without the need, or a tank not counted yet, always has enough.
export function hasWaterPlants(species, ex, animals, T, juvenileWeight) {
  if (!species.waterPlants || ex.seagrassCells === undefined) return true;
  return ex.seagrassCells >= plantsNeeded(animals, T, juvenileWeight);
}

// No gravel under the water? True until the tank is measured, and for everyone else.
export function noGravel(species, ex) {
  if (!species.waterPlants || ex.axolotl === undefined) return true;
  return (ex.axolotl.gravel ?? 0) === 0;
}

// The floor under each column of water: from its top water cells ([x, y, z]), down through the water and the plants (at
// most `depth` blocks) to the first block that isn't either. Returns { gravel, spots }: how many columns stand on gravel,
// and where the first `keep` of those gravel blocks are ([x, y, z]). An unread block (unloaded) counts as no gravel.
export function gravelFloors(waterTops, typeAt, depth, keep) {
  let gravel = 0;
  const spots = [];
  for (const [x, y, z] of waterTops) {
    for (let d = 1; d <= depth; d++) {
      const t = typeAt(x, y - d, z);
      if (IN_WATER.has(t)) continue;
      if (GRAVEL_BLOCKS.has(t)) {
        gravel++;
        if (spots.length < keep) spots.push([x, y - d, z]);
      }
      break;
    }
  }
  return { gravel, spots };
}

// A young one's colour: blue by the game's own rare mutation (roll under coatMutation.chance), else the parent's it takes.
export function youngCoat(species, parentCoat, roll) {
  const m = species.coatMutation;
  return m && roll < m.chance ? m.coat : parentCoat;
}

// What the journal sees: walking along the bottom (on the floor under the water, moving across it).
export function walkingOnBottom(onGround, inWater, vx, vz, T) {
  return onGround && inWater && Math.hypot(vx, vz) > T.bottomMove;
}

// The warnings for an axolotl tank: too few plants, and gravel on the floor.
export function axolotlWarnings(ex, residents, plural, species, T, juvenileWeight) {
  if (!species.waterPlants) return [];
  const out = [];
  if (!hasWaterPlants(species, ex, residents, T, juvenileWeight)) {
    const need = plantsNeeded(residents, T, juvenileWeight);
    out.push({ severity: 2, text: `${plural} need water plants to hide among and lay their eggs on: seagrass or kelp growing in at least ${need} of the tank's water blocks (${ex.seagrassCells ?? 0} now). Plant it on the floor under the water (bone meal on sand or dirt under water grows seagrass), then measure again with the Habitat Marker. Without them comfort can't rise above ${T.plantComfortCap}, and they won't breed.` });
  }
  if (!noGravel(species, ex)) {
    const at = ex.axolotl?.spots?.[0];
    out.push({ severity: 2, text: `${plural} swallow gravel and it makes them ill: there's gravel on the floor under ${ex.axolotl.gravel} of the tank's water blocks${at ? ` (one at ${at[0]} ${at[1]} ${at[2]})` : ""}. Lay sand, clay or stone in its place, or leave the floor bare, then measure again. Until then comfort can't rise above ${T.gravelComfortCap}.` });
  }
  return out;
}

// The clipboard's line for an axolotl tank.
export function tankLine(ex, residents, T, juvenileWeight) {
  if (ex.seagrassCells === undefined) return "§fAxolotl tank: §7plants not measured yet";
  const need = plantsNeeded(residents, T, juvenileWeight);
  const have = ex.seagrassCells;
  const gravel = ex.axolotl?.gravel ?? 0;
  const plants = have >= need ? `§a${have} water blocks with plants§7, ${need} needed` : `${have} water blocks with plants, ${need} needed §e(too few)§7`;
  return `§fAxolotl tank: §7${plants}; ${gravel ? `§egravel under ${gravel} of the water§7` : "no gravel"}`;
}

// The Field Journal's care notes.
export function axolotlCareLines(sp, T, cap) {
  if (!sp.waterPlants) return [];
  return [
    "A tank: water with a bank or rim round it, inside the walls (1 deep is enough: they live on the bottom)",
    `Water plants: seagrass or kelp growing in ${T.plantsPerAnimal} of the tank's water blocks for each (a young one half), to hide among out of the light and to lay their eggs on. They're also their enrichment. Without them comfort can't rise above ${cap}`,
    "The floor: bare, sand, clay or stone, never gravel (they swallow it)",
    "Food: Insect Rations from an Aquarium Feeder over the water",
    `Breeding: once the tank has its plants, she lays her eggs on them; one hatches in ${sp.breeding?.gestationDays ?? 2} park days and grows up in ${sp.breeding?.matureDays ?? 5}. A young one takes a parent's colour, or now and then (1 in 1200) it's blue`,
  ];
}

export function axolotlCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild ones live in the water of lush caves, over clay; let one go and the game picks its colour (pink, cyan, gold or brown)`;
}
