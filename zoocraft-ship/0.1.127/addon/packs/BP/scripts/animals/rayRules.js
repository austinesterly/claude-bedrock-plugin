// Giant Stingrays (0.1.127, module 6b part 4; research/trench_plan.md "0.1.127", trench_facts.md §5c), pure: a harmless
// big fish of the sea floor that wants a sand floor in its tank (species.sandBed: sand under minFraction of the water, and
// minCells at least), and every so often glides down to the sand and buries itself in it, only its eyes showing, then
// bursts out, early when someone swims close (animals/ray.js steers it down and holds it there). Stingrays bury themselves
// to rest unseen and breathe through the spiracles on top of the head meanwhile (australian.museum, "Mysterious sand
// craters"). Every rule here is by the species' flags, never by name.

// What a stingray is doing (its zoocraft:act entity property): the client plays the matching animation.
export const ACT = {
  cruise: 0,
  settle: 1, // gliding down to the sand
  buried: 2, // in the sand, only the eyes above it
  burst: 3, // up out of the sand (the entity's zoocraft:bursting timer brings it back to cruise)
};

// How many of a tank's water blocks need sand under them: species.sandBed.minFraction of the water, minCells at least.
export function sandNeeded(species, waterCells) {
  const bed = species.sandBed;
  if (!bed) return 0;
  return Math.max(bed.minCells ?? 0, Math.ceil((waterCells ?? 0) * bed.minFraction));
}

// Enough sand under the water? A species without the need, or a tank not measured for it yet, always has enough.
export function hasSandBed(species, ex) {
  if (!species.sandBed || ex.sandBedCells === undefined) return true;
  return ex.sandBedCells >= sandNeeded(species, ex.waterCells);
}

// The clipboard's line for a stingray's tank: how much of the floor under the water is sand, against what it needs.
export function sandBedLine(ex, plural, species, cap) {
  const who = plural.toLowerCase();
  const need = sandNeeded(species, ex.waterCells);
  const have = ex.sandBedCells ?? 0;
  if (have >= need) return `§fSand floor: §ayes §7(${have} of ${ex.waterCells ?? 0} water blocks over sand, ${need} needed): ${who} bury themselves in it`;
  return `§fSand floor: §7no: ${have} of ${ex.waterCells ?? 0} water blocks have sand under them, ${need} needed: ${who} bury themselves in the sand to rest, and without it comfort can't rise above ${cap}. Lay sand on the floor of the tank, under the water, and measure again`;
}

// The tank's warnings.
export function rayWarnings(ex, plural, species, cap) {
  if (hasSandBed(species, ex)) return [];
  const need = sandNeeded(species, ex.waterCells);
  return [{ severity: 2, text: `${plural} need a sand floor to bury themselves in: sand under at least ${need} of the tank's ${ex.waterCells ?? 0} water blocks (${ex.sandBedCells ?? 0} now). Lay sand on the floor of the tank, under the water, then measure again with the Habitat Marker. Without it comfort can't rise above ${cap}.` }];
}

// Ticks to wait, picked at random in [lo, hi] (`rnd` in [0, 1)).
export function between([lo, hi], rnd) {
  return Math.round(lo + (hi - lo) * rnd);
}

// The bed under a column of water: from the water block (x, y, z) down through the water to the first block that isn't;
// the y of the lowest water block when that block is sand (the ray lies on the sand there), else undefined. `depth`: how
// far down it looks.
export function bedUnder(read, x, y, z, depth) {
  if (read(x, y, z) !== "water") return undefined;
  for (let d = 1; d <= depth; d++) {
    const c = read(x, y - d, z);
    if (c === "water") continue;
    return c === "sand" ? y - d + 1 : undefined;
  }
  return undefined;
}

// Where to settle: the `near` sand spots closest to it ([x, y, z] of the lowest water block over sand), one of them at
// random; undefined when there are none.
export function pickBed(spots, pos, near, rnd) {
  if (!spots?.length) return undefined;
  const d2 = (s) => (s[0] + 0.5 - pos.x) ** 2 + (s[1] - pos.y) ** 2 + (s[2] + 0.5 - pos.z) ** 2;
  const best = [...spots].sort((a, b) => d2(a) - d2(b)).slice(0, Math.max(1, near));
  const s = best[Math.min(best.length - 1, Math.floor(rnd * best.length))];
  return { x: s[0] + 0.5, y: s[1], z: s[2] + 0.5 };
}

// Whether a buried stingray bursts out now: its time is up, or someone is within R.burstRange of it.
export function shouldBurst(now, until, nearest, R) {
  return now >= until || nearest <= R.burstRange;
}
