// Frogs (0.1.184, module 12; research/vanilla_plan.md "0.1.184 frogs and tadpoles: the design"): the game's own kept
// in a frog pond. Pure rules: the lily pads to sit on (ex.frog.pads: lily pads and big dripleaf on the water, counted by
// exhibits/exhibits.js), where she lays her frogspawn (ex.frog.spawnSpots: open water, beside a pad first), the look a
// tadpole grows up with (the pond's climate, the game's rule), what the journal sees, and the clipboard, journal and
// warning lines. animals/nursery.js keeps the Frog Spawn on the water and hatches the tadpoles.
// Sources: EAZA Best Practice Guidelines for the natterjack toad (2025), 2.1.5 Dimensions: Copenhagen Zoo's breeding
// enclosure is 227 x 310 cm, land 75% and water 25%, the water 20 cm deep, 8 to 20 toads; 2.1.3: large stones in the
// water as islands to sit on, branches, bark and stones on land to hide among; 2.2.2: fed on the land area every 1 to 2
// days; 2.4.1: the males croak to start breeding, and "rain" stimulates it; 1.7.4: eggs "usually hatch within 10 days",
// metamorphosis about six weeks after hatching. The game's frog (Mojang's 1.26.50 files): jump_to_block prefers
// waterlily and big_dripleaf; frogspawn hatches 2 to 6 tadpoles; a tadpole grows up in 20 minutes into the frog of the
// biome it is in (its entity_transformed event).

// What a frog sits on out on the water: the game's frog's preferred blocks.
export const PAD_BLOCKS = new Set(["minecraft:waterlily", "minecraft:big_dripleaf"]);

// The game's three looks (minecraft:variant): 0 temperate (orange), 1 cold (green), 2 warm (white).
export const LOOK = { temperate: 0, cold: 1, warm: 2 };

// The look a tadpole grows up with, from the biome tags where it grows (the game's frog entity_transformed event: warm
// first, then cold over it, else temperate).
export function frogLookFor(tags) {
  const has = (t) => tags.includes(t);
  const cold =
    has("mountain") ||
    (has("mountains") && !has("meadow") && !has("cherry_grove") && !has("stony_peaks")) ||
    has("ice") ||
    has("cold") ||
    has("frozen") ||
    has("the_end") ||
    has("deep_dark");
  if (cold) return LOOK.cold;
  const warm = has("desert") || has("jungle") || has("savanna") || has("mesa") || has("nether") || (has("warm") && has("ocean")) || (has("lukewarm") && has("ocean")) || has("mangrove_swamp");
  return warm ? LOOK.warm : LOOK.temperate;
}

// Lily pads (or big dripleaf) on the water for n grown frogs: one for every T.frogsPerPad, T.minPads at least.
export function padsNeeded(n, T) {
  return Math.max(T.minPads, Math.ceil(Math.max(0, n) / T.frogsPerPad));
}

// Whether a frog pond has its lily pads (true until it's measured, and for everyone else).
export function hasLilyPads(species, ex, n, T) {
  if (!species.lilyPads || ex.frog === undefined) return true;
  return ex.frog.pads >= padsNeeded(n, T);
}

// The pond's open water a frog can lay on: from its top water cells ([x, y, z] of the water) with air over them, and
// whether a pad floats beside it (padAt(x, y, z): the block at that spot is a pad). Beside a pad first, then the rest; at
// most `keep`. Returns [[x, y, z, beside], ...] of the air cells the spawn lies in (beside: 1 next to a pad, else 0).
export function spawnSpotsOf(waterTops, airAt, padAt, keep) {
  const beside = [];
  const open = [];
  for (const [x, y, z] of waterTops) {
    const up = y + 1;
    if (!airAt(x, up, z)) continue;
    const near = padAt(x + 1, up, z) || padAt(x - 1, up, z) || padAt(x, up, z + 1) || padAt(x, up, z - 1);
    (near ? beside : open).push([x, up, z, near ? 1 : 0]);
  }
  return [...beside, ...open].slice(0, keep);
}

// Where she lays: the free spawn spot beside a pad nearest her (`near`), else the nearest free one; not one already taken
// (`taken`: [{ x, y, z }]). Returns { x, y, z } (the air cell over the water), or undefined.
export function pickSpawnSpot(spots, taken, near) {
  const free = (spots ?? []).filter(([x, y, z]) => !taken.some((t) => t.x === x && t.y === y && t.z === z));
  const d = ([x, , z]) => Math.hypot(x + 0.5 - near.x, z + 0.5 - near.z);
  const nearest = (list) => list.reduce((b, s) => (b === undefined || d(s) < d(b) ? s : b), undefined);
  const best = nearest(free.filter((s) => s[3])) ?? nearest(free);
  return best ? { x: best[0], y: best[1], z: best[2] } : undefined;
}

// What the journal sees of a frog: sitting on a pad (the block its feet are in, or the one under them, is a pad) and a
// leap (up off the ground, not in the water, rising).
export function onPad(typeAtFeet, typeBelow) {
  return PAD_BLOCKS.has(typeAtFeet) || PAD_BLOCKS.has(typeBelow);
}

export function isLeaping(onGround, inWater, vy, T) {
  return !onGround && !inWater && vy > T.leapRise;
}

// A pair mates sooner in the rain (the guideline: "rain" stimulates breeding): the run of good days a frog pond needs.
export function goodDaysNeeded(species, raining, goodDays) {
  return species.rainBreeds && raining ? 1 : goodDays;
}

// Not enclosed for frogs: the walls they'd leap over.
export function frogWallsIssue(plural, at, T) {
  return `Not enclosed for frogs: ${plural.toLowerCase()} leap ${T.leapUp} blocks up onto the top of anything up to ${T.leapReach} blocks away, so walls, fences and gates need ${T.leapUp + 1} blocks of height over anything a frog can sit on within ${T.leapReach} blocks of them (the floor, a lily pad, a filter, a feeder).${at ? ` They could get out near ${at.x} ${at.y} ${at.z}.` : ""}`;
}

export function padWarning(plural, n, ex, T, cap) {
  return { severity: 2, text: `${plural} need lily pads to sit on: a lily pad or big dripleaf on the water for every ${T.frogsPerPad} frogs (${padsNeeded(n, T)} for the ${n} here; ${ex.frog?.pads ?? 0} now). Place lily pads on the pond's open water. Without them comfort can't rise above ${cap}, and the tadpoles have nothing to graze.` };
}

// The clipboard's line for a frog pond.
export function pondLine(ex, n, T) {
  if (!ex.frog) return "§fFrog pond: §7lily pads not measured yet";
  const need = padsNeeded(n, T);
  const spots = ex.frog.spawnSpots?.length ?? 0;
  const spawn = spots ? `${spots} spot${spots === 1 ? "" : "s"} of open water to lay on` : "§eno open water to lay on§7";
  return `§fFrog pond: §7${ex.frog.pads} lily pad${ex.frog.pads === 1 ? "" : "s"}, ${need} needed${ex.frog.pads < need ? " §e(too few)§7" : ""}; ${spawn}`;
}

// The Field Journal's care notes.
export function frogCareLines(sp, T, cap) {
  if (!sp.lilyPads) return [];
  return [
    `A pond: at least a quarter of the exhibit water (1 deep is enough) and half of it dry land, with a gentle edge to climb out`,
    `Lily pads to sit on: a lily pad or big dripleaf on the water for every ${T.frogsPerPad} frogs. Without them comfort can't rise above ${cap}`,
    "Cover on land: a fifth of the floor under tree leaves or a roof, to hide",
    "Food: Insect Rations from a feeder on the land",
    `Enrichment: a Hanging Food Basket of Insect Rations hung up to ${T.leapUp} blocks over the floor (they leap up at it; under a tree's canopy is best, where a frog can't sit on it and leap higher), or a Floating Toy in the pool`,
    `Breeding: she lays frogspawn on the open water, beside a lily pad if there is one; it hatches into tadpoles in ${sp.breeding?.gestationDays ?? 2} park days. Rain gets them mating sooner. The tadpoles graze the pond and grow into frogs in ${sp.breeding?.matureDays ?? 4} park days, with the look of the pond's climate (warm white, cold green, else orange)`,
  ];
}

export function frogCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild ones live in swamps and mangrove swamps, a few together; the look (orange, green or white) is the climate's`;
}
