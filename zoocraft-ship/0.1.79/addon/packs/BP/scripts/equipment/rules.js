// Exhibit equipment rules (spec sections 7 and 10). Pure: plain records in, plain answers out.
// Equipment records live in the "equipment" collection: { id, type, dimension, pos, exhibitId,
// item?, units? }. Feeders keep their own module; this covers troughs, baskets, toys, filters,
// Cooling Units, Thermal Regulators and Recovery Stations.

import { key } from "../exhibits/geometry.js";

// End Fence arms (0.1.56): which of its four sides an End Fence block reaches out to. `kinds` is
// { n, e, s, w }, each "fence" (another End Fence), "solid" (a block, wall, fence or closed gate to
// join) or "open" (air, water, plants). An arm goes toward anything that isn't open.
export function fenceLinks(kinds) {
  const out = {};
  for (const k of ["n", "e", "s", "w"]) out[k] = kinds[k] === "fence" || kinds[k] === "solid";
  return out;
}

// Is there a cell of one of `kinds` within one block sideways of `pos`, between dyMin and dyMax
// blocks below it? (pos.y - cell.y in [dyMin, dyMax])
function near(cells, pos, kinds, dyMin, dyMax) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      for (let dy = dyMin; dy <= dyMax; dy++) {
        if (kinds.includes(cells.get(key(pos.x + dx, pos.y - dy, pos.z + dz)))) return true;
      }
    }
  }
  return false;
}

// Whether a piece of equipment at `pos` serves the exhibit whose reachable cells are `cells`.
// Troughs stand beside the floor; baskets may hang up to two blocks above it; filters sit at the
// pool edge or under the water; Cooling Units and Thermal Regulators stand beside the floor or the pool;
// an Ember Den or a Rift Tunnel stands on the floor (no collision, so its own cell is floor); a
// Containment Anchor stands beside the floor like a Thermal Regulator. Baskets also hang over a
// Lava Ray's lava pool, or anywhere in a Void Ray's flight room. A Void Perch serves when the air
// above it is part of the flight room (a "perch" cell, from the flight measurement) and there is
// flight room under it too, so it floats up in the air rather than sitting on the floor. A Climbing
// Frame (0.1.71) stands on the floor beside open ground, like a tree trunk. A Flock Mirror (0.1.72) stands
// at the water's edge: water right beside it, level with it or a block lower. A Scent Post (0.1.75)
// stands on the floor beside open ground, like a tree trunk. A Nest Box (0.1.79) on the floor serves like a
// Burrow Shelter; one up in the trees serves when it stands beside the canopy (the climb measure finds it,
// exhibits/geometry.js floodClimb). (A Holding Den is set in the fence with its door facing in: exhibits.js asks
// animals/predatorRules.js denServes.)
export function serves(type, cells, pos) {
  if (type === "trough") return near(cells, pos, ["land"], -1, 0);
  if (type === "anchor") return near(cells, pos, ["land"], -1, 1);
  if (type === "tunnel") return near(cells, pos, ["land"], 0, 0);
  if (type === "basket") return near(cells, pos, ["land", "water", "lava", "air"], -1, 2);
  if (type === "perch") return cells.get(key(pos.x, pos.y + 1, pos.z)) === "perch" && cells.get(key(pos.x, pos.y - 1, pos.z)) === "air";
  if (type === "filter") return near(cells, pos, ["water"], -2, 1);
  if (type === "cooler" || type === "heater") return near(cells, pos, ["land", "water"], -1, 1);
  if (type === "den" || type === "burrow") return near(cells, pos, ["land"], 0, 0);
  if (type === "frame") return near(cells, pos, ["land"], 0, 0);
  if (type === "mirror") return near(cells, pos, ["water"], 0, 1);
  if (type === "scent") return near(cells, pos, ["land"], 0, 0);
  if (type === "nest") return near(cells, pos, ["land"], 0, 0);
  return false;
}

// Kinds of enrichment the exhibit's equipment offers that this species enjoys. A basket only
// counts while it holds food the species eats. Several copies of one kind count once (spec 7).
// A Nether toy (Blaze Bone, Wither Skull Ball) counts only for the species whose favourite it is.
// A Puzzle Feeder (passed in as { type: "puzzle" } with its stock) counts like a basket, only while it
// holds food the species eats; climbing trees on the floor (`trees`, from the climb measure) count as
// something to climb, like a Climbing Frame.
export function enrichmentKinds(fixtures, species, balance, diets, trees = 0) {
  const kinds = new Set();
  for (const f of fixtures) {
    const kind = balance.enrichment.fromEquipment[f.type];
    if (!kind || !species.enrichmentTags.includes(kind) || !likesToy(species, f.type, balance)) continue;
    if ((f.type === "basket" || f.type === "puzzle") && !(f.units > 0 && species.dietTags.includes(diets[f.item]))) continue;
    kinds.add(kind);
  }
  if (trees > 0 && species.enrichmentTags.includes("climb")) kinds.add("climb");
  return [...kinds];
}

// The kinds this species could get from equipment that exists, for advice when it has none.
export function enrichmentOptions(species, balance) {
  return Object.entries(balance.enrichment.fromEquipment)
    .filter(([type, kind]) => species.enrichmentTags.includes(kind) && likesToy(species, type, balance))
    .map(([type]) => type);
}

// Equipment types only some species play with (balance.enrichment.speciesToys) need that species
// to list them in species.toys; everything else is for anyone.
export function likesToy(species, type, balance) {
  return !(balance.enrichment.speciesToys ?? []).includes(type) || Boolean(species.toys?.includes(type));
}

// Do the animals drink from their own pool? Amphibious animals from the water, Lava Rays and Striders
// from the lava they live on, raccoons from the water they wash their food in; lava drinkers never
// from water.
export function drinksFromPool(species, profile, ex) {
  if (species?.lavaSwimmer || species?.lavaWalker) return (ex.lavaCells ?? 0) > 0;
  return !species?.drinksLava && Boolean(profile.amphibious || species?.wash) && (ex.waterCells ?? 0) > 0;
}

// Animals drink from a pool when their habitat has one, otherwise from a trough with water.
export function hasDrinkingWater(profile, ex, troughs, species) {
  if (drinksFromPool(species, profile, ex)) return true;
  return troughs.some((t) => t.units > 0 && drinksFrom(species, t));
}

// What a species drinks: lava for Basalt Tortoises (species.drinksLava, from a Lava Trough), water for
// everyone else. A trough record's liquid is "lava" for a Lava Trough; unset means water.
export function drinkOf(species) {
  return species?.drinksLava ? "lava" : "water";
}
export function drinksFrom(species, trough) {
  return (trough.liquid ?? "water") === drinkOf(species);
}

// Giraffes eat only from an Elevated Browse Feeder, Lava Rays only from a Thermal Feeder; those are
// out of reach for everyone else. A Hay Rack (0.1.74) feeds only the species that eat from one
// (species.rack: zebras, deer and elephants).
export function reachesFeeder(species, feeder) {
  if (feeder.rack) return Boolean(species.rack);
  return Boolean(species.browsesHigh) === Boolean(feeder.high) && Boolean(species.lavaSwimmer) === Boolean(feeder.thermal);
}

// A cold species is comfortable only with a Cooling Unit that still has ice; others don't care.
export function isCold(species, coolers) {
  return !species.cold || coolers.some((c) => c.units > 0);
}

// Cold units one item of ice adds to a Cooling Unit (0: not ice).
export function coolingValue(typeId, balance) {
  return balance.cooler.ice[typeId] ?? 0;
}

// A Nether species (species.heat) is comfortable only with a Thermal Regulator that still has fuel.
export function isWarm(species, heaters) {
  return !species.heat || heaters.some((h) => h.units > 0);
}

// Which fixture is a species' den: an Ember Den (species.den true, Ember Foxes) or a Burrow
// Shelter (species.den "burrow", hedgehogs).
export function denType(species) {
  return species.den === true ? "den" : species.den;
}

// A species with a den (species.den) is comfortable only with that den in the exhibit.
export function hasDen(species, fixtures) {
  return !species.den || fixtures.some((f) => f.type === denType(species));
}

// Warm units one item of fuel adds to a Thermal Regulator (0: not fuel).
export function heatValue(typeId, balance) {
  return balance.heater.fuel[typeId] ?? 0;
}

// A rift species (species.anchor, Rift Ferrets) is settled only with a Containment Anchor that still
// has charge; its blinks stop without one (animals/rift.js).
export function isAnchored(species, anchors) {
  return !species.anchor || anchors.some((a) => a.units > 0);
}

// Rift Ferrets (species.tunnels) want enough Rift Tunnels on the floor to blink between and hide in.
export function hasTunnels(species, fixtures) {
  return !species.tunnels || fixtures.filter((f) => f.type === "tunnel").length >= species.tunnels.min;
}

// Charge one item adds to a Containment Anchor (0: not a charge).
export function chargeValue(typeId, balance) {
  return balance.anchor.charge[typeId] ?? 0;
}

// Extra cleanliness drain from a pool with no working filter: the water share of the habitat.
export function waterDirtFactor(ex, filters, balance) {
  const water = ex.waterCells ?? 0;
  if (water <= 0 || filters.length) return 0;
  return balance.filter.unfilteredWaterDirt * (water / (water + (ex.usableArea ?? 0)));
}

// Take `wanted` units from a list of stocked records, in order. Returns how many were taken.
export function drawUnits(records, wanted) {
  let left = wanted;
  for (const r of records) {
    if (left <= 0) break;
    const take = Math.min(left, r.units ?? 0);
    r.units -= take;
    if (r.units === 0 && "item" in r) r.item = undefined;
    left -= take;
  }
  return wanted - left;
}
