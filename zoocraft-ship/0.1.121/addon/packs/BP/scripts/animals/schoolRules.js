// Schools of fish (0.1.119, module 6, Austin's idea 9: "Players can gather fish in large numbers, and fish need less
// watching than the animals"), pure. A school is ONE animal record with `count` fish in it (species.school says how
// many at most): the record has the name, the needs and the welfare; the fish have nothing of their own. The game shows
// at most species.school.shown of them (zoo copies of the vanilla fish tagged with the record id and a fish index), so a
// tank of 60 fish costs the game a couple of dozen mobs. Space, food and the keepers' feeding count the fish, not the
// records (fishWeight). Plan: research/aquarium_plan.md.

import { key } from "../exhibits/geometry.js";

// How many fish a list of residents is, for space and food: a school counts its fish, anything else counts as the
// usual population weight (a young one `juvenileWeight`, a grown one 1).
export function fishWeight(animals, SPECIES, juvenileWeight) {
  return animals.reduce((n, a) => n + (SPECIES[a.speciesId]?.school ? a.count ?? 1 : a.juvenile ? juvenileWeight : 1), 0);
}

// The fish of a school that are shown as mobs: the smaller of its count and the species' shown limit.
export function shownOf(count, species) {
  return Math.max(0, Math.min(count ?? 0, species.school?.shown ?? 0));
}

// "11 Cod", "1 Tropical Fish": what a school is called by its fish.
export function schoolLabel(species, count) {
  return `${count} ${species.plural ?? species.displayName}`;
}

// Water cells to spawn `n` shown fish on, spread out from `near`: the nearest first, then each at least `gap` blocks
// from the ones already picked (falling back to the nearest left when the pool is small). [x, y, z] each.
export function spreadWater(cells, near, n, gap = 1.5) {
  const water = [];
  for (const [k, kind] of cells) {
    if (kind !== "water") continue;
    const [x, y, z] = k.split(",").map(Number);
    water.push({ x, y, z, d: (x - near.x) ** 2 + (y - near.y) ** 2 * 4 + (z - near.z) ** 2 });
  }
  water.sort((a, b) => a.d - b.d);
  const out = [];
  const far = (c) => out.every((o) => (o.x - c.x) ** 2 + (o.z - c.z) ** 2 >= gap * gap);
  for (const c of water) {
    if (out.length >= n) break;
    if (far(c)) out.push(c);
  }
  for (const c of water) {
    if (out.length >= n) break;
    if (!out.includes(c)) out.push(c);
  }
  return out.map((c) => [c.x, c.y, c.z]);
}

// How many of `wanted` fish an exhibit has room for: the most n (down from wanted) with required(n) <= usable, else 0.
export function roomFor(wanted, usable, required) {
  for (let n = wanted; n >= 1; n--) if (required(n) <= usable) return n;
  return 0;
}

// A tropical fish's look, read off a mob's components (the wild one's, or a bucket's fish): the body shape (variant 0 or
// 1), the pattern (mark_variant 0 to 5) and the two dye colours (color, color2: 0 to 15). Anything missing is 0.
export function tropicalLook(entity) {
  const val = (name, max) => {
    let v;
    try {
      v = entity.getComponent(name)?.value;
    } catch {
      v = undefined;
    }
    return Number.isInteger(v) && v >= 0 && v <= max ? v : 0;
  };
  return { shape: val("minecraft:variant", 1), pattern: val("minecraft:mark_variant", 5), base: val("minecraft:color", 15), pat: val("minecraft:color2", 15) };
}

// The 22 named looks a zoo tropical fish can wear (0.1.121; gen121/tropical121.py bakes a texture each): the game
// paints its own tropical fish with a two-colour material it feeds only for minecraft:tropicalfish, so a zoo copy
// can't be tinted (Austin's purple fish, 0.1.120). [name, shape (0 small, 1 large), pattern 0-5, base dye, pattern dye]
// in the order of the zoocraft:look property: keep it (a saved school remembers its look by the four numbers, not
// the index, so the index can change; the texture names can't).
export const TROPICAL_LOOKS = [
  ["Clownfish", 0, 0, 1, 0], ["Triggerfish", 0, 1, 7, 0], ["Tomato Clownfish", 0, 0, 14, 0], ["Red Snapper", 1, 3, 14, 0], ["Red Cichlid", 1, 4, 14, 0],
  ["Ornate Butterflyfish", 1, 5, 0, 1], ["Queen Angelfish", 0, 4, 5, 3], ["Cotton Candy Betta", 0, 5, 6, 3], ["Threadfin", 1, 0, 0, 4], ["Goatfish", 0, 5, 0, 4],
  ["Yellow Tang", 1, 0, 4, 4], ["Yellowtail Parrotfish", 0, 3, 9, 4], ["Dottyback", 1, 3, 10, 4], ["Parrotfish", 0, 3, 9, 6], ["Moorish Idol", 1, 2, 0, 7],
  ["Butterflyfish", 1, 5, 0, 7], ["Anemone", 1, 1, 1, 7], ["Black Tang", 1, 0, 7, 7], ["Cichlid", 0, 1, 11, 7], ["Blue Tang", 1, 0, 7, 11],
  ["Emperor Red Snapper", 1, 5, 0, 14], ["Red Lipped Blenny", 0, 2, 7, 14],
];
// The 16 dyes (r, g, b), to judge which named look is nearest a wild fish's colours.
const DYE_RGB = [[249, 255, 254], [249, 128, 29], [199, 78, 189], [58, 179, 218], [254, 216, 61], [128, 199, 31], [243, 139, 170], [71, 79, 82], [157, 157, 151], [22, 156, 156], [137, 50, 184], [60, 68, 170], [131, 84, 50], [94, 124, 22], [176, 46, 38], [29, 29, 33]];
function dyeDistance(a, b) {
  const [r1, g1, b1] = DYE_RGB[a] ?? DYE_RGB[0];
  const [r2, g2, b2] = DYE_RGB[b] ?? DYE_RGB[0];
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

// The named look nearest a fish's four numbers: its own shape always; then the same pattern if any look has it in
// colours near enough, else the closest colours of that shape (the base colour counts double: it is most of the fish).
export function lookIndex(look) {
  const l = { shape: 0, pattern: 0, base: 1, pat: 0, ...(look ?? {}) };
  let best = 0;
  let bestScore = Infinity;
  for (const [i, [, shape, pattern, base, pat]] of TROPICAL_LOOKS.entries()) {
    if (shape !== l.shape) continue;
    const score = 2 * dyeDistance(base, l.base) + dyeDistance(pat, l.pat) + (pattern === l.pattern ? 0 : 120);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

// "Clownfish": what a look is called.
export function lookName(look) {
  return TROPICAL_LOOKS[lookIndex(look)][0];
}

// The events that give a zoo tropical fish its look: the model's shape and the baked texture nearest its colours.
export function lookEvents(look) {
  const l = { shape: 0, ...(look ?? {}) };
  return [`zoocraft:shape_${l.shape === 1 ? 1 : 0}`, `zoocraft:look_${lookIndex(look)}`];
}

// The mob's index in its school (0 to shown - 1), or undefined.
export function fishIndex(entity, prop) {
  const v = entity.getDynamicProperty(prop);
  return Number.isInteger(v) && v >= 0 ? v : undefined;
}

// Whether a cell key is water in a cells map.
export function isWaterCell(cells, x, y, z) {
  return cells.get(key(x, y, z)) === "water";
}
