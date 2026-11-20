// 0.1.337: Dr. Foss's expanded archaeology (Austin's NPC #29 spec, section 3: "Players should occasionally discover
// archaeological artifacts while mining ordinary stone-based blocks ... uncommon enough to feel special ... Preserve
// ordinary mining mechanics ... Avoid excessive artifact generation"). Pure rules; the runtime is world/relics.js, the
// numbers BALANCE.relics. Our calls (Austin left the tools, the finds and the odds open): a find is an extra drop on
// top of the stone's own, rolled only for natural stone broken in survival with a pickaxe or the Rock Hammer, never
// with Silk Touch, never for a block a player set down, and at most a few a day for each player. The Sifting Pan
// sifts sand and gravel for flint, clay, nuggets, the odd find and, rarely, one of the game's own pottery sherds.

/** The natural stones a find can come out of (cobblestone and polished or cut blocks are made by players). */
export const RELIC_STONES = ["minecraft:stone", "minecraft:deepslate", "minecraft:granite", "minecraft:diorite", "minecraft:andesite", "minecraft:tuff", "minecraft:calcite", "minecraft:sandstone", "minecraft:red_sandstone"];
export const isRelicStone = (typeId) => RELIC_STONES.includes(typeId);

/**
 * The finds: Austin's examples (ancient skulls, lost weapons, ancient tools, pottery fragments, fossil fragments) and
 * two "other relics" of ours. `weight` out of the table; `deep` multiplies it in deepslate or below y 0 (older rock,
 * older things). Each is a collectible: no use, no recipe; it can sit in an item frame or a decorated pot. `about` is
 * what the Magnifying Glass says of it.
 */
export const RELICS = [
  { id: "zoocraft:fossil_fragment", name: "Fossil Fragment", weight: 30, deep: 1, stack: 64, about: "The print of a shell, turned to stone long before anyone kept a zoo." },
  { id: "zoocraft:pottery_fragment", name: "Pottery Fragment", weight: 28, deep: 1, stack: 64, about: "A piece of a painted pot. Somebody's dinner bowl, a very long time ago." },
  { id: "zoocraft:ancient_pickaxe", name: "Ancient Pickaxe", weight: 12, deep: 1.5, stack: 1, about: "Its head has gone green with age. Someone mined here long before you did." },
  { id: "zoocraft:lost_blade", name: "Lost Blade", weight: 10, deep: 1.5, stack: 1, about: "Short, worn and far too old to fight with. The gold hilt still shines." },
  { id: "zoocraft:ancient_skull", name: "Ancient Skull", weight: 8, deep: 2, stack: 16, about: "Not a creature you know. Not one anybody knows." },
  { id: "zoocraft:carved_tablet", name: "Carved Tablet", weight: 6, deep: 2, stack: 16, about: "Rows of carved marks in a language nobody reads any more." },
  { id: "zoocraft:emerald_figurine", name: "Emerald Figurine", weight: 2, deep: 3, stack: 1, about: "A small, careful carving of someone important, cut from one emerald. Very rare." },
];
export const RELIC_IDS = RELICS.map((r) => r.id);
export const relicOf = (id) => RELICS.find((r) => r.id === id);

export const ROCK_HAMMER = "zoocraft:rock_hammer";
export const SIFTING_PAN = "zoocraft:sifting_pan";
export const MAGNIFYING_GLASS = "zoocraft:magnifying_glass";
/** The game's 23 pottery sherds (a rare sift). */
export const SHERDS = ["angler", "archer", "arms_up", "blade", "brewer", "burn", "danger", "explorer", "flow", "friend", "guster", "heart", "heartbreak", "howl", "miner", "mourner", "plenty", "prize", "scrape", "sheaf", "shelter", "skull", "snort"].map((s) => `minecraft:${s}_pottery_sherd`);

/** What the tool in hand is to archaeology: "hammer", "pickaxe" (any, by its tag), or undefined. */
export function toolKind(typeId, tags = []) {
  if (typeId === ROCK_HAMMER) return "hammer";
  if (/_pickaxe$/.test(typeId ?? "") || tags.includes("minecraft:is_pickaxe")) return "pickaxe";
  return undefined;
}

/** The chance of a find in one block: g.pickaxeChance or g.hammerChance; 0 for anything else. */
export function findChance(tool, g) {
  return tool === "hammer" ? g.hammerChance : tool === "pickaxe" ? g.pickaxeChance : 0;
}

/** Deep rock: deepslate (or tuff) anywhere, or any stone below y 0. */
export const isDeep = (typeId, y) => typeId === "minecraft:deepslate" || typeId === "minecraft:tuff" || y < 0;

/** One of the finds by weight (deep rock favours the rarer ones). */
export function pickRelic(deep, random = Math.random) {
  const w = RELICS.map((r) => r.weight * (deep ? r.deep : 1));
  let x = random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < RELICS.length; i++) {
    x -= w[i];
    if (x < 0) return RELICS[i];
  }
  return RELICS[RELICS.length - 1];
}

/**
 * Whether a broken block gives a find, and which. `b`: { typeId, y, tool (toolKind), silk (Silk Touch on the tool),
 * placed (a player set it down), survival, today (finds this player has had today) }. Returns a relic or undefined.
 */
export function rollFind(b, g, random = Math.random) {
  if (!isRelicStone(b.typeId) || !b.survival || b.silk || b.placed) return undefined;
  if ((b.today ?? 0) >= g.perDay) return undefined;
  const chance = findChance(b.tool, g);
  if (!(random() < chance)) return undefined;
  return pickRelic(isDeep(b.typeId, b.y), random);
}

/** The Sifting Pan's table: [item, weight]; "" is nothing. Sherds are one of the game's 23 at random. */
export const SIFT = /** @type {[string, number][]} */ ([["minecraft:flint", 30], ["minecraft:clay_ball", 20], ["minecraft:gold_nugget", 12], ["minecraft:bone", 10], ["zoocraft:pottery_fragment", 9], ["zoocraft:fossil_fragment", 7], ["sherd", 2], ["", 10]]);
export const SIFTABLE = ["minecraft:sand", "minecraft:red_sand", "minecraft:gravel"];
export const isSiftable = (typeId) => SIFTABLE.includes(typeId);

/** One sift: the item id it gives ("" for nothing). */
export function siftOnce(random = Math.random) {
  const total = SIFT.reduce((a, [, w]) => a + w, 0);
  let x = random() * total;
  for (const [id, w] of SIFT) {
    x -= w;
    if (x < 0) return id === "sherd" ? SHERDS[Math.floor(random() * SHERDS.length)] : id;
  }
  return "";
}

/** A day's count for a player, kept as "day:n": the count for `day` (0 when it was another day). */
export function countToday(stored, day) {
  const [d, n] = String(stored ?? "").split(":").map(Number);
  return d === day && Number.isFinite(n) ? n : 0;
}

/** The kinds a player has looked over with the Magnifying Glass, kept as a comma list: the list with `id` added. */
export function noteSeen(stored, id) {
  const seen = String(stored ?? "").split(",").filter((x) => RELIC_IDS.includes(x));
  if (RELIC_IDS.includes(id) && !seen.includes(id)) seen.push(id);
  return seen;
}

/** What the Magnifying Glass says of the item in the other hand, and of the collection (`seen` after this look). */
export function examineText(id, seen) {
  const r = relicOf(id);
  if (r) {
    const all = seen.length >= RELICS.length;
    return [`\u00a76${r.name}: \u00a7f${r.about}`, all ? "\u00a77You've looked over every kind of find. Dr. Foss would be jealous." : `\u00a77Kinds of finds you've looked over: ${seen.length} of ${RELICS.length}.`];
  }
  if (/^minecraft:\w+_pottery_sherd$/.test(id ?? "")) return ["\u00a76A pottery sherd: \u00a7fone of the old painted pieces, made to be put back together into a pot."];
  return ["\u00a77Hold a find in your other hand, then use the glass to look it over."];
}
