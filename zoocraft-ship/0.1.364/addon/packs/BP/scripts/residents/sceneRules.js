// Scenes (0.1.364; Austin, 23 Nov: "make them more authentic to their personality and what they are doing at the
// moment, and how your friendship is with them ... a lot of different things they can say depending on what's
// happening in the world, and around them, and who is by them, and what is by them"). Pure. A scene is something
// true of the moment a resident is spoken to: what they're doing, the weather and the moon, where they are, who and
// what stands near, what the player holds or wears, how the zoo is doing. Each resident has lines of their own for
// every scene (data/residentScenes.js): two for anyone, one for someone they hardly know (`lo`: Stranger,
// Acquaintance) and one for a close friend (`hi`: Close Friend, Best Friend), and lines about three neighbours of
// their choosing (`near`). The picker follows the rule "say the most specific true thing you haven't said lately":
// every scene that holds is a candidate, weighted by how telling it is (a creeper beside you outweighs the time of
// day), and a line said lately isn't said again while another fits. The facts are gathered by sceneFacts.js.

/**
 * The scenes: key -> { w: how telling (the picker's weight), when(f): whether it holds for the facts }.
 * Facts `f`: doing ("home", "to_zoo", "zoo", "to_home", "work", "follow", "stay", "other"), part ("morning",
 * "afternoon", "evening", "night"), t (time of day), weather ("Clear", "Rain", "Thunder"), outside, moon (0 full to
 * 4 new, as world.getMoonPhase), place ("overworld", "nether", "the_end", "fishing", "acufend"), deep, high,
 * near { hostile, creeper, villager, pet, farm, species, guests, residents: [ids], others: [names], players: [names] },
 * blocks { water, lava, flowers, fire, crops, books, snow }, held { kind, item }, armored, hurt, wet, sneaking,
 * daysAway, firstToday, park { open, guests, litter, stars, coins, sick }.
 */
export const SCENES = {
  home_morning: { w: 2, when: (f) => f.doing === "home" && f.part === "morning" },
  home_evening: { w: 2, when: (f) => f.doing === "home" && (f.part === "evening" || f.part === "night") },
  walking_to_zoo: { w: 3, when: (f) => f.doing === "to_zoo" },
  at_zoo: { w: 2, when: (f) => f.doing === "zoo" },
  walking_home: { w: 3, when: (f) => f.doing === "to_home" },
  at_work: { w: 3, when: (f) => f.doing === "work" },
  following: { w: 2, when: (f) => f.doing === "follow" && f.part !== "night" },
  following_night: { w: 3, when: (f) => f.doing === "follow" && f.part === "night" },
  staying: { w: 3, when: (f) => f.doing === "stay" },
  rain: { w: 3, when: (f) => f.weather === "Rain" && f.outside },
  thunder: { w: 4, when: (f) => f.weather === "Thunder" && f.place === "overworld" },
  full_moon: { w: 3, when: (f) => f.part === "night" && f.moon === 0 && f.outside && f.weather === "Clear" },
  dark_moon: { w: 3, when: (f) => f.part === "night" && f.moon === 4 && f.outside },
  dawn: { w: 3, when: (f) => f.place === "overworld" && (f.t >= 23000 || f.t < 800) },
  dusk: { w: 3, when: (f) => f.place === "overworld" && f.t >= 11600 && f.t < 13000 },
  nether: { w: 5, when: (f) => f.place === "nether" },
  the_end: { w: 5, when: (f) => f.place === "the_end" },
  fishing_sky: { w: 5, when: (f) => f.place === "fishing" },
  acufend: { w: 5, when: (f) => f.place === "acufend" },
  cave: { w: 4, when: (f) => f.place === "overworld" && f.deep },
  high_up: { w: 4, when: (f) => f.place === "overworld" && f.high },
  hostile_near: { w: 6, when: (f) => f.near.hostile && !f.near.creeper },
  creeper_near: { w: 7, when: (f) => f.near.creeper },
  villager_near: { w: 4, when: (f) => f.near.villager },
  pet_near: { w: 4, when: (f) => f.near.pet },
  farm_animal_near: { w: 3, when: (f) => f.near.farm && f.doing !== "zoo" },
  zoo_animal_near: { w: 4, when: (f) => Boolean(f.near.species) },
  guests_crowd: { w: 3, when: (f) => f.near.guests >= 3 },
  residents_crowd: { w: 4, when: (f) => f.near.others.length >= 2 },
  other_resident: { w: 4, when: (f) => f.near.others.length === 1 },
  other_player: { w: 4, when: (f) => f.near.players.length >= 1 },
  alone_night: { w: 2, when: (f) => f.part === "night" && f.outside && f.doing !== "home" && !f.near.others.length && !f.near.players.length && !f.near.guests && !f.near.hostile },
  by_water: { w: 3, when: (f) => f.blocks.water && f.doing !== "zoo" },
  by_lava: { w: 4, when: (f) => f.blocks.lava && f.place !== "nether" },
  by_flowers: { w: 3, when: (f) => f.blocks.flowers },
  by_fire: { w: 3, when: (f) => f.blocks.fire },
  by_crops: { w: 3, when: (f) => f.blocks.crops },
  by_books: { w: 3, when: (f) => f.blocks.books },
  in_snow: { w: 3, when: (f) => f.blocks.snow },
  holding_gift: { w: 5, when: (f) => f.held.kind === "gift" },
  holding_weapon: { w: 3, when: (f) => f.held.kind === "weapon" },
  holding_food: { w: 3, when: (f) => f.held.kind === "food" },
  holding_rod: { w: 3, when: (f) => f.held.kind === "rod" },
  holding_tool: { w: 3, when: (f) => f.held.kind === "tool" },
  armored: { w: 3, when: (f) => f.armored },
  hurt: { w: 6, when: (f) => f.hurt },
  wet: { w: 4, when: (f) => f.wet },
  sneaking: { w: 4, when: (f) => f.sneaking },
  long_time: { w: 6, when: (f) => f.daysAway >= 3 },
  first_today: { w: 3, when: (f) => f.firstToday && f.daysAway < 3 },
  zoo_busy: { w: 2, when: (f) => f.park.open && f.park.guests >= 40 && f.doing === "zoo" },
  zoo_empty: { w: 3, when: (f) => f.park.open && f.park.guests === 0 && f.doing === "zoo" },
  zoo_closed: { w: 3, when: (f) => f.park.open === false && f.place === "overworld" },
  litter_bad: { w: 3, when: (f) => f.park.litter >= 30 && f.doing === "zoo" },
  stars_high: { w: 2, when: (f) => f.park.stars >= 4 && f.place === "overworld" },
  stars_low: { w: 2, when: (f) => f.park.stars <= 1 && f.park.open === true && f.place === "overworld" },
  coins_low: { w: 3, when: (f) => f.park.coins !== undefined && f.park.coins < 100 && f.place === "overworld" },
  animal_sick: { w: 4, when: (f) => f.park.sick && f.place === "overworld" },
};
export const SCENE_KEYS = Object.keys(SCENES);

/** Facts as they are with nothing known: every scene false. (sceneFacts.js fills them in; tests start from this.) */
export function noFacts() {
  return { doing: "other", part: "morning", t: 3000, weather: "Clear", outside: true, moon: 2, place: "overworld", deep: false, high: false, near: { hostile: false, creeper: false, villager: false, pet: false, farm: false, species: undefined, guests: 0, residents: [], others: [], players: [] }, blocks: {}, held: { kind: undefined, item: undefined }, armored: false, hurt: false, wet: false, sneaking: false, daysAway: 0, firstToday: false, park: { open: undefined, guests: undefined, litter: 0, stars: undefined, coins: undefined, sick: false } };
}

/** The scenes that hold now, most telling first. */
export function scenesNow(f) {
  return SCENE_KEYS.filter((k) => SCENES[k].when(f)).sort((a, b) => SCENES[b].w - SCENES[a].w);
}

/** The friendship band a tier (0 Stranger to 4 Best Friend) speaks in: "lo", "mid" or "hi". */
export const bandOf = (tier) => (tier <= 1 ? "lo" : tier >= 3 ? "hi" : "mid");

/** Their lines for a scene at a friendship tier: the two for anyone, and the band's own (said twice as readily). */
export function linesFor(entry, tier) {
  if (!entry) return [];
  const band = bandOf(tier);
  const own = band === "mid" ? undefined : entry[band];
  return [...(entry.any ?? []), ...(own ? [own, own] : [])];
}

/** A line with its names put in: {player}, {other}, {species}, {item}. Undefined when it needs one that isn't known. */
export function fill(line, names) {
  let ok = true;
  const out = line.replace(/\{(player|other|species|item)\}/g, (_, k) => {
    if (!names?.[k]) ok = false;
    return names?.[k] ?? "";
  });
  return ok ? out : undefined;
}

/**
 * A line for the moment, or undefined when nothing fits (their everyday chat is said instead). `talk` is the
 * resident's { scenes, near }; `tier` the friendship; `recent` the lines said to this player lately; `names`
 * { player, other, species, item }. A neighbour they have words about, standing by, counts as a scene of weight
 * g.nearWeight. One candidate scene is drawn by weight to the power g.sharp (so the telling ones win most of the
 * time but not always), then one of its lines not said lately.
 */
export function scenePick(talk, f, tier, recent, names, random, g) {
  if (!talk) return undefined;
  const said = new Set(recent ?? []);
  const cands = [];
  for (const k of scenesNow(f)) {
    const lines = linesFor(talk.scenes?.[k], tier).map((l) => fill(l, names)).filter((l) => l && !said.has(l));
    if (lines.length) cands.push({ scene: k, w: SCENES[k].w ** g.sharp, lines });
  }
  for (const id of f.near.residents) {
    const lines = (talk.near?.[id] ?? []).map((l) => fill(l, names)).filter((l) => l && !said.has(l));
    if (lines.length) cands.push({ scene: `near:${id}`, w: g.nearWeight ** g.sharp, lines });
  }
  if (!cands.length) return undefined;
  let roll = random() * cands.reduce((a, c) => a + c.w, 0);
  let pick = cands[cands.length - 1];
  for (const c of cands) {
    roll -= c.w;
    if (roll < 0) {
      pick = c;
      break;
    }
  }
  return { line: pick.lines[Math.floor(random() * pick.lines.length)], scene: pick.scene, weight: SCENES[pick.scene]?.w ?? g.nearWeight };
}

/**
 * Whether this chat is a line for the moment rather than their everyday talk: surely when something striking holds
 * (weight g.strikingAt or more: a creeper, the Nether, you're hurt, days apart), else g.chance of the time.
 */
export function sceneTurn(f, random, g) {
  const top = scenesNow(f)[0];
  if (!top) return false;
  return SCENES[top].w >= g.strikingAt ? random() < g.strikingChance : random() < g.chance;
}

/** An item's name from its id, for {item}: "minecraft:diamond_sword" -> "Diamond Sword". */
export function itemName(typeId) {
  return String(typeId ?? "").replace(/^[a-z0-9_]+:/, "").split("_").filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const WEAPON = /_(sword|axe|bow|crossbow|trident|mace|spear)$|:(bow|crossbow|trident|mace)$/;
const TOOL = /_(pickaxe|shovel|hoe)$/;
const ROD = /fishing_rod$|_rod$/;
/** What the player holds, as a scene: "gift" (one this resident likes), "rod", "weapon", "tool", "food" or undefined. */
export function heldKind(typeId, liked, isFood) {
  if (!typeId) return undefined;
  if (liked) return "gift";
  if (ROD.test(typeId) && !/blaze_rod|end_rod|lightning_rod|breeze_rod/.test(typeId)) return "rod";
  if (WEAPON.test(typeId)) return "weapon";
  if (TOOL.test(typeId)) return "tool";
  if (isFood) return "food";
  return undefined;
}
