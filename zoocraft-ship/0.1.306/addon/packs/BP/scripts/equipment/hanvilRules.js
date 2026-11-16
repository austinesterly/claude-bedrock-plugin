// Han Lock's Hanvil and Hammer (0.1.305; Austin's NPC #26 spec: research/ZooCraft_Tycoon_NPC_26_Han_Lock.md). The rules
// of who may use it and of reinforcing; the engine side is equipment/hanvil.js. No engine calls here.
//
// Reinforcing (Austin's rules, kept as written): two of the same piece, both the same reinforcement level, both never
// used, become one a level higher; each level adds a tenth of the piece's own durability, to level 10 (+100%, twice
// the durability). Durability only: nothing else about the piece changes.
//
// How it is kept (the game gives scripts no way to raise an item's durability): a reinforced piece keeps its level and
// the extra durability it has left ("the reserve") on the item itself, with two lines of lore to show them. While the
// piece is held or worn, the wear it takes is paid back out of the reserve, so it wears through the reserve first and
// its own durability after: in all, exactly Austin's number of uses.
// "Never used": no wear on it now, and never seen with wear on it (a piece seen worn while carried is marked for good,
// so one mended back to full, by Mending, an anvil or Han's own repairs, still counts as used).

export const HAN_ID = "han_lock";
export const HANVIL = "zoocraft:hanvil_and_hammer";
/** Item properties: the reinforcement level (1 to 10), the reserve left, and "has been used". */
export const RF_LEVEL = "zoocraft:rf";
export const RF_POOL = "zoocraft:rf_pool";
export const USED = "zoocraft:used";
export const MAX_LEVEL = 10;

/** What the Hanvil does, in the order Han teaches it; `at` (friendship) is balance.js hanvil.at[key]. */
export const TECHNIQUES = [{ key: "reinforce", name: "Reinforcing" }, { key: "arrows", name: "Explosive Arrows" }]; // 0.1.306: arrows

/** The techniques for a player with this friendship: [{ key, name, at, open }]. */
export function techniques(points, g) {
  return TECHNIQUES.map((t) => ({ ...t, at: g.at[t.key], open: (points ?? 0) >= g.at[t.key] }));
}

/** Whether this friendship may use the Hanvil at all (its first technique is open). */
export const mayUse = (points, g) => techniques(points, g)[0].open;

/** Which of Han's lines "Ask about the Hanvil" gives at this friendship: "hanvil0", "hanvil20", "hanvil40" or (0.1.306) "hanvil60". */
export function hanvilLine(points, g) {
  const p = points ?? 0;
  return p >= g.at.arrows ? "hanvil60" : p >= g.at.reinforce ? "hanvil40" : p >= g.at.teach ? "hanvil20" : "hanvil0";
}

/** A piece's durability at a reinforcement level: its own, and a tenth more for each level, rounded down. */
export const maxAt = (base, level) => Math.floor((base * (10 + level)) / 10);
/** The reserve a piece of this level starts with. */
export const reserveAt = (base, level) => maxAt(base, level) - base;

/**
 * Why a piece can't be reinforced, or undefined when it can. `it` is { max (its own durability; 0 or none: it has
 * none), damage, level, pool, used }.
 */
export function whyNot(it) {
  if (!it || !(it.max > 0)) return "plain";
  const level = it.level ?? 0;
  if (level >= MAX_LEVEL) return "maxed";
  if ((it.damage ?? 0) > 0 || it.used) return "used";
  if (level > 0 && (it.pool ?? 0) < reserveAt(it.max, level)) return "used";
  return undefined;
}

export const WHY_WORDS = { used: "has been used", maxed: "is at +100%, as far as it goes", plain: "has no durability to add to" };

/**
 * What can be reinforced from what a player carries. `slots` is [{ slot, typeId, name, max, damage, level, pool, used }]
 * (only pieces with durability). Returns { rows: [{ typeId, name, level, next, a, b, max, newMax }] (the first two
 * matching pieces of each kind and level, in slot order), alone: [{ name, level }] (fit, but with no second one like
 * it), no: [{ name, level, why }] }.
 */
export function reinforcePlan(slots) {
  const groups = new Map();
  const no = [];
  for (const it of slots) {
    const why = whyNot(it);
    if (why) {
      no.push({ name: it.name, level: it.level ?? 0, why });
      continue;
    }
    const k = `${it.typeId}|${it.level ?? 0}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(it);
  }
  const rows = [];
  const alone = [];
  for (const list of groups.values()) {
    list.sort((p, q) => p.slot - q.slot);
    const [a, b] = list;
    const level = a.level ?? 0;
    if (!b) alone.push({ name: a.name, level });
    else rows.push({ typeId: a.typeId, name: a.name, level, next: level + 1, a: a.slot, b: b.slot, max: a.max, newMax: maxAt(a.max, level + 1) });
  }
  return { rows, alone, no };
}

/** The level and reserve of the piece two matching ones make. */
export function reinforced(it) {
  const level = (it.level ?? 0) + 1;
  return { level, pool: reserveAt(it.max, level) };
}

/**
 * How much wear to pay back from the reserve now: none until the wear reaches g.batch (or a quarter of a small piece's
 * durability), so the piece in hand is not rewritten at every use; then all of it the reserve can cover.
 */
export function refund(damage, pool, max, g) {
  if (!(pool > 0) || !(damage > 0)) return 0;
  const from = Math.max(1, Math.min(g.batch, Math.ceil(max / 4)));
  return damage >= from ? Math.min(damage, pool) : 0;
}

const commas = (n) => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const LORE_A = "§r§6Reinforced +";
const LORE_B = "§r§7Durability ";
/** "+30%" for a level. */
export const levelText = (level) => `+${level * 10}%`;
/** The two lines a reinforced piece shows. */
export function loreLines(level, max, pool) {
  return [`${LORE_A}${level * 10}%`, `${LORE_B}${commas(maxAt(max, level))}${pool > 0 ? ` (${commas(pool)} extra left)` : " (extra used up)"}`];
}
/** An item's lore with the reinforcement's lines put last (and any older ones of ours taken out); at most 20 lines. */
export function withLore(lore, level, max, pool) {
  const rest = (lore ?? []).filter((l) => !l.startsWith(LORE_A) && !l.startsWith(LORE_B));
  return [...rest.slice(0, 18), ...loreLines(level, max, pool)];
}
/** Whether an item's lore already shows this level and reserve. */
export function loreShows(lore, level, max, pool) {
  const want = loreLines(level, max, pool);
  return want.every((l) => (lore ?? []).includes(l));
}

/** "Diamond Pickaxe" from "minecraft:diamond_pickaxe" (the pages are in English, as the rest of ZooCraft's). */
export function pieceName(typeId) {
  return String(typeId).replace(/^\w+:/, "").split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// --- Han's smithy (residents/workRules.js WORK_KINDS.smithy)
const FURNACES = new Set(["minecraft:furnace", "minecraft:lit_furnace", "minecraft:blast_furnace", "minecraft:lit_blast_furnace"]);
/** A furnace or a blast furnace, lit or not. */
export const isFurnace = (typeId) => FURNACES.has(typeId);
/** What the blacksmith works at: his Hanvil and Hammer, or a furnace. */
export const isForge = (typeId) => typeId === HANVIL || FURNACES.has(typeId);
/** A smithy's stations are worked only when it has both a Hanvil and a furnace in reach: else none of them. */
export function smithyStations(targets) {
  return targets.some((t) => t.typeId === HANVIL) && targets.some((t) => isFurnace(t.typeId)) ? targets : [];
}
/** How much wear the blacksmith takes off a piece in one repair: g.mend[skill] of its durability, at least 1. */
export function mendPoints(max, skill, g) {
  const s = Math.max(0, Math.min(2, skill ?? 0));
  return Math.max(1, Math.floor(max * g.mend[s]));
}

// --- Explosive Arrows (0.1.306; equipment/explosiveArrows.js)
export const EXPLOSIVE_ARROW = "zoocraft:explosive_arrow";
/** How many batches of Explosive Arrows a player can make: g is balance.js hanvil.arrows, counts { typeId: n }. */
export function arrowBatches(counts, g) {
  return Math.min(Math.floor((counts["minecraft:tnt"] ?? 0) / g.tnt), Math.floor((counts["minecraft:arrow"] ?? 0) / g.arrows));
}
/**
 * Whether an arrow just fired is armed: Explosive Arrows in the shooter's off hand, and none of theirs armed in the
 * last g.gap ticks (so a bow that looses several arrows at once arms the first only).
 */
export function armsShot(offhand, lastTick, now, g) {
  return offhand === EXPLOSIVE_ARROW && (lastTick === undefined || now - lastTick >= g.gap);
}
/** The blast: the game's explosion of g.radius; inside or beside a zoo it breaks no block. */
export function blastPlan(inPark, g) {
  return { radius: g.radius, breaksBlocks: !inPark, causesFire: Boolean(g.fire) };
}
/** Where to look for a zoo round a blast: its middle and the four sides at its radius. */
export function blastCorners(at, radius) {
  return [at, { x: at.x + radius, y: at.y, z: at.z }, { x: at.x - radius, y: at.y, z: at.z }, { x: at.x, y: at.y, z: at.z + radius }, { x: at.x, y: at.y, z: at.z - radius }];
}
