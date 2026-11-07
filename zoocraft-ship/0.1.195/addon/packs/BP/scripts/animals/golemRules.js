// Golems (0.1.195, module 12; research/vanilla_plan.md "0.1.195 iron, snow and copper golems: the design"): the rules,
// kept apart from the game so the tests can run them. The game's iron, snow and copper golems as zoo copies
// (entities/zoo_*_golem.json): built, not born (species.built); they drink nothing (species.drinksNothing); the zoo feeds
// them iron, snow or copper (a game choice: the game's eat nothing).
// - Iron golems: village paving under a share of the floor (species.mobFloor: the game's golem keeps to those blocks).
// - Snow golems: a roof over all of the yard (species.cover: rain melts them) and a biome no warmer than 1.0
//   (species.melts: the game's would melt; the zoo's don't, but their comfort is capped).
// - Copper golems: a copper chest and a chest in or beside the yard (enrichment: they carry items from one to the other, the
//   game's transport_items); they oxidise a stage at a time (the game's timer), a honeycomb waxes them, an axe scrapes a
//   stage off; fully oxidized and unwaxed one turns into a statue (the zoo's, animals/copperGolem.js), and an axe brings an
//   unoxidized statue back.

export const OXIDATION = "zoocraft:oxidation";
export const WAXED = "zoocraft:waxed";
export const CHEST = "zoocraft:chest_interaction";
export const FLOWER = "zoocraft:has_flower";
export const STATUE = "zoocraft:statue";
export const POSE = "zoocraft:pose";
export const STAGES = ["unoxidized", "exposed", "weathered", "oxidized"];
export const STAGE_NAMES = ["Copper", "Exposed", "Weathered", "Oxidized"];
export const POSES = ["standing", "sitting", "running", "star"];
// The game's own copper golem's properties (a wild one caught, one let go).
export const WILD_OXIDATION = "minecraft:oxidation_level";
export const WILD_WAXED = "minecraft:is_waxed";
export const WILD_CHEST = "minecraft:chest_interaction";
// Let go: the game's own events for a player-built golem at each stage (its from_player_* events).
export const RELEASE_EVENTS = ["minecraft:from_player_default", "minecraft:from_player_exposed", "minecraft:from_player_weathered", "minecraft:from_player_oxidized"];

export const COPPER_CHESTS = ["copper_chest", "exposed_copper_chest", "weathered_copper_chest", "oxidized_copper_chest", "waxed_copper_chest", "waxed_exposed_copper_chest", "waxed_weathered_copper_chest", "waxed_oxidized_copper_chest"].map((n) => `minecraft:${n}`);
export const CHESTS = ["minecraft:chest", "minecraft:trapped_chest"];

// Biomes warmer than 1.0, where the game's snow golem melts (the 1.26.62.1 server's biome files: deserts and badlands 2.0,
// savannas 1.2 and 2.0 but not their plateaus, 1.0), and the whole Nether (2.0, the wiki: its biomes aren't in the files).
export const HOT_BIOMES = ["desert", "desert_hills", "desert_mutated", "mesa", "mesa_bryce", "mesa_plateau", "mesa_plateau_mutated", "mesa_plateau_stone", "mesa_plateau_stone_mutated", "savanna", "savanna_mutated"].map((n) => `minecraft:${n}`);

// What a player builds each from (the game's).
export const BUILT_FROM = {
  iron: "four iron blocks in a T with a carved pumpkin on top",
  snow: "two snow blocks with a carved pumpkin on top",
  copper: "a copper block with a carved pumpkin on top (the block turns into a copper chest)",
};

// The stage of a copper golem from the property's value (0 copper .. 3 oxidized).
export function stageIndex(value) {
  const i = STAGES.indexOf(String(value ?? ""));
  return i < 0 ? 0 : i;
}

export const CARRYING = "zoocraft:carrying";

// What changed on a zoo copper golem since its record (animals/copperGolem.js): seen is what the copy shows now.
/**
 * @param {{ coat?: number, waxed?: boolean, statue?: boolean, pose?: number, flower?: boolean }} a
 * @param {{ coat: number, waxed: boolean, statue: boolean, pose: number, flower: boolean }} seen
 */
export function copperChange(a, seen) {
  const was = { coat: a.coat ?? 0, waxed: Boolean(a.waxed), statue: Boolean(a.statue), pose: a.pose ?? 0, flower: Boolean(a.flower) };
  const changed = Object.keys(seen).some((k) => seen[k] !== was[k]);
  return { changed, becameStatue: seen.statue && !was.statue, cameBack: !seen.statue && was.statue, dropFlower: seen.statue && seen.flower };
}

// A zoo copper golem spawned again (animals/animals.js spawnInExhibit, after its coat_N: its stage) gets back its wax, its
// statue and pose, and its poppy. An unwaxed fully oxidized one starts turning into a statue again (the game's
// maximum_oxidation: its own spawn starts the timer that oxidises it a stage, which does nothing past oxidized).
/** @param {{ triggerEvent(ev: string): void, setProperty(p: string, v: any): void }} e @param {any} a */
export function restoreCopper(e, a) {
  if (a.waxed) e.triggerEvent("minecraft:wax_on");
  if (a.statue) {
    e.triggerEvent("zoocraft:become_statue");
    e.setProperty(POSE, Math.max(0, Math.min(3, a.pose ?? 0)));
    return;
  }
  if (a.flower) e.triggerEvent("minecraft:on_take_flower");
  if (!a.waxed && (a.coat ?? 0) >= 3) e.triggerEvent("minecraft:maximum_oxidation");
}

// Catching one that may hold an item it's carrying between chests (a wild one's hand can't be seen; a zoo one says so by
// its zoocraft:carrying): the crate would lose it.
export function copperHoldText(name) {
  return `§eIf this ${name} is carrying an item between chests, take it first (use it with an empty hand): the crate would lose it. Use the crate on it again to catch it.`;
}

// ---------------- the chests (copper golems) ----------------

export function newChestResult() {
  return { copper: 0, chests: 0 };
}

// Beside a floor cell (in a wall, standing on the floor) or under it.
const AROUND = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
  [0, -1, 0],
];
const key = (x, y, z) => `${x},${y},${z}`;

// The copper chests and chests beside the yard's floor cells (standing on the floor, in a wall, sunk in the floor), each
// once. typeAt(x, y, z) gives { id } or undefined; cells: the floor flood (kind "land" for a floor cell).
/**
 * @param {(x: number, y: number, z: number) => ({ id: string } | undefined)} typeAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number }} opts @param {{ copper: number, chests: number }} out
 */
export function* measureChests(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++n % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of AROUND) {
      const nk = key(x + dx, y + dy, z + dz);
      if (seen.has(nk) || cells.has(nk)) continue;
      seen.add(nk);
      const id = typeAt(x + dx, y + dy, z + dz)?.id ?? "";
      if (COPPER_CHESTS.includes(id)) out.copper++;
      else if (CHESTS.includes(id)) out.chests++;
    }
  }
  return out;
}

// A copper chest and a chest there (enrichment: they carry from one to the other).
export function hasChests(species, ex) {
  return Boolean(species.chestSorting && ex.golemChests && ex.golemChests.copper > 0 && ex.golemChests.chests > 0);
}

// ---------------- the warmth (snow golems) ----------------

// Too warm for a snow golem: a biome warmer than 1.0, or the Nether; undefined while the biome can't be read (its chunk
// isn't loaded).
/** @param {{ id: string } | undefined} biome @param {string} dimensionId */
export function isWarmBiome(biome, dimensionId) {
  if (dimensionId === "minecraft:nether") return true;
  if (!biome) return undefined;
  return HOT_BIOMES.includes(biome.id);
}

// Cool enough (cause "coolBiome"): true until it's measured, and for everyone else.
export function isCoolEnough(species, ex) {
  if (!species.melts || ex.warmBiome === undefined) return true;
  return !ex.warmBiome;
}

// ---------------- words ----------------

// A breeding check's answer: they're built.
export function builtText(plural, sp) {
  return `${plural} aren't born: build another (${BUILT_FROM[sp.built] ?? "as in the game"}) and catch it.`;
}

// The warnings on the clipboard and the Habitat Marker.
export function golemWarnings(ex, plural, species, T) {
  const out = [];
  if (species.melts && ex.warmBiome) out.push({ severity: 2, text: `${plural} melt in warm places: this yard is in a biome warmer than they can stand (deserts, badlands, savannas, the Nether). Build their yard somewhere cooler; here their comfort can't rise above ${T.warmComfortCap}.` });
  return out;
}

// The Exhibit Clipboard's lines.
export function golemLines(ex, living) {
  const out = [];
  if (living.some((sp) => sp.chestSorting)) {
    const c = ex.golemChests;
    if (!c) out.push("§fChests: §7not measured yet (use the Habitat Marker on the floor inside)");
    else out.push(c.copper > 0 && c.chests > 0 ? `§fChests: §a${c.copper} copper, ${c.chests} wooden§7 (enrichment: they carry items from a copper chest to a chest holding the same item, or an empty one)` : `§fChests: §7${c.copper} copper, ${c.chests} wooden (a copper chest and a chest on the floor or in a wall: they carry items from one to the other)`);
  }
  if (living.some((sp) => sp.melts) && ex.warmBiome !== undefined) out.push(ex.warmBiome ? "§fWarmth: §ctoo warm here for snow golems (build their yard in a cooler biome)" : "§fWarmth: §acool enough for snow golems");
  return out;
}

// The clipboard's animal page: a copper golem's copper.
export function copperLine(a) {
  const stage = STAGE_NAMES[a.coat ?? 0] ?? STAGE_NAMES[0];
  if (a.statue) return `§fStatue: §7${POSES[a.pose ?? 0] ?? POSES[0]}, ${stage.toLowerCase()}${a.waxed ? ", waxed" : ""}. ${a.waxed ? "Scrape the wax off with an axe, then scrape" : "Scrape"} it with an axe a stage at a time; scraped back to copper, it comes back to life (an empty hand turns it to another pose)`;
  return `§fCopper: §7${stage}${a.waxed ? ", waxed (it stays this way)" : a.coat >= 3 ? " (it soon turns into a statue: wax it with a honeycomb, or scrape it with an axe)" : " (it greens over in time: a honeycomb waxes it, an axe scrapes a stage off)"}`;
}

// The Field Journal's care notes.
export function golemCareLines(sp) {
  if (!sp.built) return [];
  const out = [];
  if (sp.built === "iron") out.push("Their yard: village paving (dirt path, cobblestone, stone, stone bricks, bricks or planks) under a quarter of the floor or more, as the game's keep to their village's paths", "They go for monsters that get into reach (not creepers), never people or the zoo's own animals, and hold out a poppy to copper golems");
  if (sp.built === "snow") out.push("Their yard: a roof over all of it (rain melts the game's), and somewhere no warmer than they can stand: not a desert, badlands, a savanna or the Nether. Out of the warmth and the rain their comfort is capped", "They leave a trail of snow as they walk (shovel it up for snowballs) and throw snowballs at monsters within 6 blocks");
  if (sp.built === "copper") out.push("Their yard: a copper chest and a chest on the floor or in a wall (enrichment): they carry items from the copper chest to a chest with the same item, or an empty one", "Copper: they green over a stage at a time as the game's (exposed, weathered, oxidized), about 7 hours of play each. A honeycomb waxes one (it stays as it is), an axe scrapes a stage off (or the wax). Fully oxidized and unwaxed, one turns into a statue: scrape it with an axe a stage at a time, and scraped back to copper it comes back to life", "An iron golem in the same yard holds out poppies to them: one takes it and wears it on its head (shears take it off)");
  out.push(`Food and drink: the game's golems eat and drink nothing; the zoo keeps them ${sp.built === "snow" ? "topped up with snow" : `in repair with ${sp.built}`} from a feeder (a game choice). No Water Trough`);
  out.push(`Young: none. ${builtText(sp.plural ?? `${sp.displayName}s`, sp)}`);
  return out;
}

export function golemCatchLine(sp, carrier) {
  const where = sp.built === "iron" ? "In villages (their defenders) and the cages by pillager outposts, or build one" : sp.built === "copper" ? "Build one, or bring a statue back to life with an axe (abandoned camps have them)" : "Never wild: build one";
  return `Catching: ${where} (${BUILT_FROM[sp.built]}). With ${sp.baitText} in your inventory, use an empty ${carrier} on it${sp.built === "copper" ? ". Its copper and wax come with it" : ""}`;
}
