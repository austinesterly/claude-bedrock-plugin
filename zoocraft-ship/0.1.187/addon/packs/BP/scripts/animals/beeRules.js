// Bees (0.1.187, module 12; research/vanilla_plan.md "0.1.187 bees: the design"): the game's own kept in a bee garden.
// The game flies them (the copy keeps its hover flight, its flowers, its nectar and its hive), so these are the pure
// rules: the garden's flowers and hives (read from the flight measure's cells, ex.bees, by exhibits/exhibits.js), the
// share of their food the flowers give, what the journal sees, and the clipboard, journal and warning lines. Every rule
// here is by the species' flag (species.beeGarden), never by name.
// Sources: Mojang's bee (entities/bee.json, as the 1.26.62 server has it): it looks for one of its flowers within 6
// blocks (4 up or down), sits in it 20 seconds and comes away with nectar (minecraft:has_nectar), goes home to its
// Beehive or Bee Nest with it (the hive fills with honey), and goes in at night and in the rain; a hive holds 3.
// Beekeepers' rule of an acre or more of flowers for a colony (the North American pollinator survey's beekeepers ask 1
// to 5), and sugar syrup when flowers are short; beekeeping guides on water near the hive. How many flowers for each
// bee is a game choice (balance.bee).

// The game's bee flowers (its look_for_food targets, the same file): what it gathers nectar from.
export const BEE_FLOWERS = new Set([
  "minecraft:poppy",
  "minecraft:blue_orchid",
  "minecraft:allium",
  "minecraft:azure_bluet",
  "minecraft:red_tulip",
  "minecraft:orange_tulip",
  "minecraft:white_tulip",
  "minecraft:pink_tulip",
  "minecraft:oxeye_daisy",
  "minecraft:cornflower",
  "minecraft:lily_of_the_valley",
  "minecraft:dandelion",
  "minecraft:wither_rose",
  "minecraft:sunflower",
  "minecraft:lilac",
  "minecraft:rose_bush",
  "minecraft:peony",
  "minecraft:flowering_azalea",
  "minecraft:azalea_leaves_flowered",
  "minecraft:mangrove_propagule",
  "minecraft:pitcher_plant",
  "minecraft:torchflower",
  "minecraft:cherry_leaves",
  "minecraft:pink_petals",
  "minecraft:open_eyeblossom",
  "minecraft:wildflowers",
  "minecraft:cactus_flower",
  "minecraft:chorus_flower",
  "minecraft:spore_blossom",
]);
// The two-block flowers: counted once (the lower half).
const TALL = new Set(["minecraft:sunflower", "minecraft:lilac", "minecraft:rose_bush", "minecraft:peony", "minecraft:pitcher_plant"]);
export const HIVES = new Set(["minecraft:beehive", "minecraft:bee_nest"]);
// A hive's front from its direction (the game's: 0 south, 1 west, 2 north, 3 east), as [dx, dz].
const FRONT = [
  [0, 1],
  [-1, 0],
  [0, -1],
  [1, 0],
];
const CARDINAL = { south: 0, west: 1, north: 2, east: 3 };
const SIDES = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];

const key = (x, y, z) => `${x},${y},${z}`;

export function isBeeFlower(id) {
  return BEE_FLOWERS.has(id);
}

export function isHive(id) {
  return HIVES.has(id);
}

// Where a hive's bees go in and out ([dx, dz] from it), from its block states; undefined if it can't be told.
export function hiveFront(states) {
  if (!states) return undefined;
  const c = states["minecraft:cardinal_direction"];
  const d = typeof c === "string" ? CARDINAL[c] : states.direction;
  return Number.isInteger(d) ? FRONT[d & 3] : undefined;
}

export function newBeeResult() {
  return { flowers: 0, flowerSpots: [], hives: 0, hiveSpots: [], walled: 0, honey: 0 };
}

/**
 * The bee flowers and the hives of a bee garden, from its flight measure's cells. A flower the bees fly into (a poppy,
 * a tulip: the air cells hold them) counts where a cell is one, a solid one (flowering azalea, flowered or cherry
 * leaves, a chorus flower) where it's beside a cell; a two-block flower once, by its lower half. A Beehive or Bee Nest
 * beside a cell counts when its front opens into the garden (a cell), and `walled` the ones facing a wall; `honey` sums
 * their honey. The first `opts.flowerKeep` flowers and `opts.hiveKeep` hives are kept as { x, y, z }. `typeAt(x, y, z)`
 * gives { id, states } for a block (states for a hive), or undefined unloaded. A generator, a slice of
 * `opts.cellsPerYield` reads at a time.
 * @param {(x: number, y: number, z: number) => ({ id: string, states?: Record<string, any> } | undefined)} typeAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, flowerKeep: number, hiveKeep: number }} opts
 * @param {ReturnType<typeof newBeeResult>} out
 */
export function* measureBees(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  const tick = function* () {
    if (++n % opts.cellsPerYield === 0) yield;
  };
  const flower = (x, y, z, id) => {
    const k = key(x, y, z);
    if (seen.has(k)) return;
    seen.add(k);
    if (TALL.has(id) && typeAt(x, y - 1, z)?.id === id) return; // the top half of a tall one
    out.flowers++;
    if (out.flowerSpots.length < opts.flowerKeep) out.flowerSpots.push({ x, y, z });
  };
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    const here = typeAt(x, y, z);
    yield* tick();
    if (here && BEE_FLOWERS.has(here.id)) flower(x, y, z, here.id);
    for (const [dx, dy, dz] of SIDES) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      const nk = key(nx, ny, nz);
      if (cells.has(nk) || seen.has(nk)) continue;
      const b = typeAt(nx, ny, nz);
      yield* tick();
      if (!b) continue;
      if (BEE_FLOWERS.has(b.id)) flower(nx, ny, nz, b.id);
      else if (HIVES.has(b.id)) {
        seen.add(nk);
        const f = hiveFront(b.states);
        if (f && cells.has(key(nx + f[0], ny, nz + f[1]))) {
          out.hives++;
          out.honey += Number(b.states?.honey_level ?? 0) || 0;
          if (out.hiveSpots.length < opts.hiveKeep) out.hiveSpots.push({ x: nx, y: ny, z: nz });
        } else out.walled++;
      }
    }
  }
}

// Flowers enough: flowersPer for each bee, flowersMin at least.
export function flowersNeeded(T, bees) {
  return Math.max(T.flowersMin, Math.ceil(Math.max(0, bees) * T.flowersPer));
}

// Hives enough: one for each perHive bees (the game's hive holds 3), one at least.
export function hivesNeeded(T, bees) {
  return Math.max(1, Math.ceil(Math.max(0, bees) / T.perHive));
}

// Not measured yet (or not a bee): passes.
export function hasBeeFlowers(species, ex, bees, T) {
  if (!species.beeGarden || ex.bees === undefined) return true;
  return ex.bees.flowers >= flowersNeeded(T, bees);
}

export function hasBeeHives(species, ex, bees, T) {
  if (!species.beeGarden || ex.bees === undefined) return true;
  return ex.bees.hives >= hivesNeeded(T, bees);
}

// The share of the bees' food the flowers give: all of it (T.share) with enough, less with fewer.
export function flowerShare(species, ex, bees, T) {
  if (!species.beeGarden || !ex.bees) return 0;
  return T.share * Math.min(1, ex.bees.flowers / flowersNeeded(T, Math.max(1, bees)));
}

// ---------------- what a bee garden needs ----------------

// The Exhibit Clipboard's lines for bees: the flowers, the hives (and their honey: `honeyNow`, read from the hives as the
// clipboard opens, else the measure's), the Nectar Feeders when the flowers are short.
export function beeLines(ex, bees, nectarFeeders, T, honeyNow = undefined) {
  const b = ex.bees;
  if (!b) return ["§fFlowers and hives: §7not measured yet (use the Habitat Marker on the floor inside)"];
  const fNeed = flowersNeeded(T, bees);
  const hNeed = hivesNeeded(T, bees);
  const lines = [];
  lines.push(`§fFlowers: ${b.flowers >= fNeed ? "§a" : "§c"}${b.flowers}§7 of ${fNeed} (the game's bee flowers, ${T.flowersPer} for each bee and ${T.flowersMin} at least: ${b.flowers >= fNeed ? "all the food they need" : `too few: a Nectar Feeder makes up the rest, and comfort can't rise above ${T.flowerComfortCap}`})`);
  lines.push(`§fHives: ${b.hives >= hNeed ? "§a" : "§c"}${b.hives}§7 of ${hNeed} (a Beehive or Bee Nest for each ${T.perHive}, its front opening into the garden${b.walled ? `; §e${b.walled} facing a wall§7` : ""})${b.hives ? `; honey ${honeyNow ?? b.honey} of ${b.hives * 5}` : ""}`);
  if (b.flowers < fNeed) lines.push(`§fNectar Feeders: ${nectarFeeders ? `§a${nectarFeeders}` : "§c0§7 (with too few flowers they need one)"}`);
  return lines;
}

// Care warnings for bees.
export function beeWarnings(ex, bees, plural, species, T) {
  if (!species.beeGarden || !ex.bees) return [];
  const out = [];
  const b = ex.bees;
  if (!hasBeeFlowers(species, ex, bees, T)) out.push({ severity: 2, text: `${plural} forage on flowers: ${flowersNeeded(T, bees)} or more of the game's bee flowers in the garden (${T.flowersPer} for each, ${T.flowersMin} at least; ${b.flowers} now): poppies, dandelions, tulips, cornflowers, the tall ones, flowering azalea and more. Until then a Nectar Feeder of Nectar Rations makes up their food, and comfort can't rise above ${T.flowerComfortCap}. Measure again with the Habitat Marker after.` });
  if (!hasBeeHives(species, ex, bees, T)) out.push({ severity: 2, text: `${plural} live in a hive: a Beehive or Bee Nest in the garden for each ${T.perHive} (${hivesNeeded(T, bees)} needed, ${b.hives} now), its front opening into the garden${b.walled ? ` (${b.walled} face${b.walled === 1 ? "s" : ""} a wall: turn ${b.walled === 1 ? "it" : "them"} round)` : ""}. They go in at night and in the rain; without enough comfort can't rise above ${T.hiveComfortCap}. Measure again after.` });
  return out;
}

// The Field Journal's care notes.
export function beeCareLines(sp, T, prof) {
  if (!sp.beeGarden) return [];
  return [
    `A garden: ${prof.baseArea} blocks of floor for up to ${prof.firstGroup ?? 1} and ${prof.extraArea} more for each more, roofed over ${prof.minHeight} blocks up (glass lets the guests see in): a zoo bee can't fly free`,
    `Flowers: the game's bee flowers (poppies, dandelions, tulips, cornflowers, the tall ones, flowering azalea and more), ${T.flowersPer} for each bee and ${T.flowersMin} at least. They're the bees' food: with enough they need nothing else; short of them a Nectar Feeder of Nectar Rations makes up the rest, and comfort can't rise above ${T.flowerComfortCap}. They pollinate crops in the garden too`,
    `Hives: a Beehive or Bee Nest for each ${T.perHive}, its front opening into the garden. They go in at night and in the rain, and fill it with honey as they come home with nectar. Without enough comfort can't rise above ${T.hiveComfortCap}`,
    "Honey: as in the game: shears give honeycomb, a glass bottle honey. With a campfire under the hive they stay calm; without one they come out angry and sting (a zoo bee that stings loses its stinger, lives on and never stings again)",
    "Company: a colony: keep at least 3 together",
    `Breeding: one young bee ${sp.breeding?.gestationDays ?? 1} park day after mating, grown in ${sp.breeding?.matureDays ?? 1}`,
  ];
}

export function beeCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory (hold a flower and they follow you, as the game's bees do). Wild ones live in bee nests on trees in plains, flower forests, meadows and cherry groves; let one go and it's the game's own again`;
}

// What the journal sees: one in a flower (the game's bee sits in the flower's block while it gathers), and one carrying
// nectar (pollen on its back).
export function gatheringAt(blockId) {
  return BEE_FLOWERS.has(blockId);
}

// A Beehive or Bee Nest beside an empty exhibit's floor (its walking measure's cells): a bee garden in the making, so it's
// measured for flight, flowers and hives and bees can move in. `typeAt(x, y, z)` gives a block's id, or undefined. A
// generator returning true at the first one.
export function* hiveBeside(typeAt, cells, cellsPerYield) {
  let n = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of SIDES) {
      if (cells.has(key(x + dx, y + dy, z + dz))) continue;
      if (HIVES.has(typeAt(x + dx, y + dy, z + dz) ?? "")) return true;
      if (++n % cellsPerYield === 0) yield;
    }
  }
  return false;
}
