// Pandas (0.1.170, module 12: research/vanilla_plan.md "0.1.170 pandas: the design"), pure. The zoo copy of the game's
// panda keeps the game's own looks and ways (entities/zoo_panda.json): the gene that shows (minecraft:variant 0-6) and
// what it does, sitting about, snacking on bamboo dropped near it. What a script decides is here: the bamboo grove (the
// bamboo measure: stalks growing in the floor or beside it; forage enrichment, and they breed only with one), the
// clipboard's line, the Field Journal's care and catching notes, and what the journal sees on a panda.

const BAMBOO = "minecraft:bamboo";
const SIDES = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// What each gene that shows does (minecraft:variant 1-6; 0 is a normal panda), for the journal and the clipboard.
export const GENE_WAYS = [
  "a normal panda: it sits about and snacks",
  "lazy: it lies down, sits and snacks more, and ambles slowly",
  "worried: it keeps away from people (not keepers or guests) and hides from thunderstorms",
  "playful: in the wild it rolls about; a zoo one only has the playful look (the game's roll flings it out of its pen)",
  "brown: a rare brown coat (two copies of the gene)",
  "weak: half the health (10), and it sneezes as a cub (two copies of the gene)",
  "aggressive: in the wild it swats back if hit; in a zoo it never does",
];

// The game's own event giving a wild panda each gene that shows (its behaviour file: minecraft:panda_lazy and the rest), so
// a panda let back into the wild keeps its gene (transport/carriers.js releaseToWild). A normal one needs none.
export const GENE_EVENTS = [undefined, "minecraft:panda_lazy", "minecraft:panda_worried", "minecraft:panda_playful", "minecraft:panda_brown", "minecraft:panda_weak", "minecraft:panda_aggressive"];

// The Exhibit Clipboard's line on one panda: the gene that shows on it and what that does.
/** @param {number | undefined} coat */
export function geneLine(coat) {
  const way = GENE_WAYS[coat ?? 0] ?? GENE_WAYS[0];
  return `§fGene: §7${way}`;
}

// ---------------- the bamboo measure ----------------

/** @returns {{ stalks: number }} */
export function newBambooResult() {
  return { stalks: 0 };
}

/**
 * The bamboo measure (exhibits/exhibits.js, for pandas living here), over the floor the walking measure found (cells: key
 * "x,y,z" -> kind; the "land" ones): the bamboo stalks growing in the floor or beside it, each stalk (a column of bamboo
 * at the floor's level) counted once. A stalk is solid, so it stands where the floor isn't: the cell itself and its four
 * sides are read at the floor's level. `idAt(x, y, z)`: a block's typeId, undefined unloaded. A generator, a slice of
 * `opts.cellsPerYield` floor cells a time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number }} opts
 * @param {ReturnType<typeof newBambooResult>} out
 */
export function* measureBamboo(idAt, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dz] of SIDES) {
      const col = `${x + dx},${z + dz}`;
      if (seen.has(col)) continue;
      if (idAt(x + dx, y, z + dz) === BAMBOO) {
        seen.add(col);
        out.stalks++;
      }
    }
  }
  return out;
}

// ---------------- what an exhibit gives ----------------

// A bamboo grove (species.grove: { min }): enough stalks growing. Not measured yet: no.
/**
 * @param {{ grove?: { min: number } }} species
 * @param {{ bamboo?: { stalks: number } }} ex
 */
export function hasGrove(species, ex) {
  return Boolean(species.grove && ex.bamboo && ex.bamboo.stalks >= species.grove.min);
}

// Forage enrichment from a bamboo grove, for a species that browses one (species.toys includes "grove"): a pseudo fixture
// the enrichment rules count like a toy.
/**
 * @param {{ toys?: string[], grove?: { min: number } }} species
 * @param {{ bamboo?: { stalks: number } }} ex
 */
export function groveFixtures(species, ex) {
  if (!species.toys?.includes("grove")) return [];
  return hasGrove(species, ex) ? [{ type: "grove" }] : [];
}

// The Exhibit Clipboard's line for pandas: the bamboo grove.
/**
 * @param {{ bamboo?: { stalks: number } }} ex
 * @param {{ grove: { min: number } }} species
 */
export function bambooLine(ex, species) {
  const min = species.grove.min;
  if (!ex.bamboo) return "§fBamboo grove: §7not measured yet: use the Habitat Marker on the ground inside again";
  const n = ex.bamboo.stalks;
  return `§fBamboo grove: ${n >= min ? "§a" : "§e"}${n}§7 of ${min} stalks growing in the floor or beside it${n >= min ? " (they browse it, and breed)" : ": with fewer there's no grove to browse, and no cubs"}`;
}

// ---------------- the Field Journal ----------------

// Care notes for pandas (without the colour codes).
/**
 * @param {{ grove?: { min: number }, genes?: boolean }} sp
 */
export function bambooCareLines(sp) {
  const lines = [];
  if (sp.grove) lines.push(`A bamboo grove: ${sp.grove.min} or more stalks of bamboo growing in the floor or beside it (plant it on grass or dirt; it grows tall on its own). They browse it, and pandas have cubs only with a grove`);
  if (sp.genes) {
    lines.push("Genes: each keeps the gene that shows on it (the Exhibit Clipboard says which), and a cub takes after a parent");
    for (let i = 1; i < GENE_WAYS.length; i++) lines.push(`  ${GENE_WAYS[i][0].toUpperCase()}${GENE_WAYS[i].slice(1)}`);
    lines.push("Bamboo: it counts as a Leafy Ration in a feeder. Bamboo dropped in by hand one picks up and sits to eat, as the game's pandas do (a treat: it doesn't fill the feeders). A Climbing Frame is something to climb; a Puzzle Feeder something to work at");
  }
  return lines;
}

// How a wild one is coaxed in, for the journal.
/**
 * @param {{ baitText?: string }} sp
 * @param {string} carrier the carrier's label
 */
export function bambooCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild pandas are calm; an aggressive one swats back if hit, and a worried one keeps away from people: hold bamboo and it comes to you`;
}

// What the journal sees on a panda: bamboo growing within 2 blocks of it (at its feet and a block up), and whether its
// gene shows (minecraft:variant 1-6). `idAt(x, y, z)`: a block's typeId.
/**
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {{ x: number, y: number, z: number }} at the panda's location
 * @param {number | undefined} variant
 */
export function pandaSeen(idAt, at, variant) {
  const bx = Math.floor(at.x), by = Math.floor(at.y), bz = Math.floor(at.z);
  let among = false;
  for (let dx = -2; dx <= 2 && !among; dx++) {
    for (let dz = -2; dz <= 2 && !among; dz++) {
      if (idAt(bx + dx, by, bz + dz) === BAMBOO || idAt(bx + dx, by + 1, bz + dz) === BAMBOO) among = true;
    }
  }
  return { amongBamboo: among, geneShows: typeof variant === "number" && variant >= 1 && variant <= 6 };
}
