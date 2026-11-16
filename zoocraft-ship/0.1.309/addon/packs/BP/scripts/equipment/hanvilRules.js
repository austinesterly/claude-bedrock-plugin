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
export const TECHNIQUES = [{ key: "reinforce", name: "Reinforcing" }, { key: "arrows", name: "Explosive Arrow Casings" }, { key: "ash", name: "Ash's pieces on armor" }]; // 0.1.306: arrows; 0.1.307: ash

/** The techniques for a player with this friendship: [{ key, name, at, open }]. */
export function techniques(points, g) {
  return TECHNIQUES.map((t) => ({ ...t, at: g.at[t.key], open: (points ?? 0) >= g.at[t.key] }));
}

/** Whether this friendship may use the Hanvil at all (its first technique is open). */
export const mayUse = (points, g) => techniques(points, g)[0].open;

/** Which of Han's lines "Ask about the Hanvil" gives at this friendship: "hanvil0", "hanvil20", "hanvil40", (0.1.306) "hanvil60" or (0.1.307) "hanvil80". */
export function hanvilLine(points, g) {
  const p = points ?? 0;
  return p >= g.at.ash ? "hanvil80" : p >= g.at.arrows ? "hanvil60" : p >= g.at.reinforce ? "hanvil40" : p >= g.at.teach ? "hanvil20" : "hanvil0";
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
 * What can be reinforced from what a player carries. `slots` is [{ slot, typeId, name, max, damage, level, pool, used, ash }]
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
    const k = `${it.typeId}|${it.level ?? 0}|${it.ash ?? ""}`; // 0.1.307: and the same Ash piece on both, or on neither
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
/**
 * A smithy's stations are worked only when it has a furnace in reach: else none of them. (0.1.309: his Hanvil stands in
 * his own house now, so the smithy no longer needs one; one set down there is still worked at.)
 */
export function smithyStations(targets) {
  return targets.some((t) => isFurnace(t.typeId)) ? targets : [];
}
/** How much wear the blacksmith takes off a piece in one repair: g.mend[skill] of its durability, at least 1. */
export function mendPoints(max, skill, g) {
  const s = Math.max(0, Math.min(2, skill ?? 0));
  return Math.max(1, Math.floor(max * g.mend[s]));
}

// --- Explosive Arrow Casings (0.1.309; equipment/explosiveArrows.js). Austin 2026-11-16: "instead of making explosive
// arrows with the hanvil, we create explosive arrow casings, these go in the off hand and both the casing and the arrow
// are consumed on use". (0.1.306 made whole Explosive Arrows and handed the bow's arrow back.)
export const EXPLOSIVE_ARROW = "zoocraft:explosive_arrow_casing";
export const TNT = "minecraft:tnt";
export const PAPER = "minecraft:paper";
/** How many batches of casings the TNT and paper on the Hanvil make at once: g is balance.js hanvil.arrows. A stack at most. */
export function casingBatches(tnt, paper, g) {
  return Math.max(0, Math.min(Math.floor(tnt / g.tnt), Math.floor(paper / g.paper), Math.floor(64 / g.makes)));
}
/**
 * Whether an arrow just fired is armed: Explosive Arrow Casings in the shooter's off hand, and none of theirs armed in the
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

// --- Ash's pieces combined with armor (0.1.307; Austin's NPC #26 spec, feature one). The Hanvil joins one of Ash's
// pieces to a matching piece of the game's armor; Ash's piece is used up.
//  - His shoes go onto any of the game's boots: the boots stay the very item they were (durability, armor, enchantments,
//    trim, reinforcement) and carry the shoes' name in a property and a line of lore; worn, they give the shoes' effect
//    (equipment/ashWear.js reads the property).
//  - His hats have no ability: the point is the look, and the game draws a helmet by its item, so a joined helmet is an
//    item of its own for each helmet metal: the hat's model, that helmet's armor points and durability, and what the
//    old helmet carried (wear, enchantments, name, reinforcement) moved onto it.
// Necklaces and gauntlets are not joined to anything yet (Austin: "review ... before defining").
export const ASH_MARK = "zoocraft:ash";
export const ASH_SHOES = {
  "zoocraft:ghast_js": { key: "ghast_js", name: "Ghast J's", gives: "Slow Falling" },
  "zoocraft:soul_shoes": { key: "soul_shoes", name: "Soul Shoes", gives: "Swiftness" },
};
export const ASH_HATS = {
  "zoocraft:warped_wood_sombrero": { key: "warped_wood_sombrero", name: "Warped Wood Sombrero" },
  "zoocraft:nether_wart_baseball_hat": { key: "nether_wart_baseball_hat", name: "Nether Wart Woven Baseball Hat" },
};
/** The game's helmets a hat can go on: its armor points and durability (the game's own numbers), what mends it. */
export const HELMETS = {
  "minecraft:leather_helmet": { key: "leather", name: "Leather", protection: 1, durability: 55, mend: "minecraft:leather" },
  "minecraft:copper_helmet": { key: "copper", name: "Copper", protection: 2, durability: 121, mend: "minecraft:copper_ingot" },
  "minecraft:chainmail_helmet": { key: "chainmail", name: "Chainmail", protection: 2, durability: 165, mend: "minecraft:iron_ingot" },
  "minecraft:iron_helmet": { key: "iron", name: "Iron", protection: 2, durability: 165, mend: "minecraft:iron_ingot" },
  "minecraft:golden_helmet": { key: "golden", name: "Golden", protection: 2, durability: 77, mend: "minecraft:gold_ingot" },
  "minecraft:diamond_helmet": { key: "diamond", name: "Diamond", protection: 3, durability: 363, mend: "minecraft:diamond" },
  "minecraft:netherite_helmet": { key: "netherite", name: "Netherite", protection: 3, durability: 407, mend: "minecraft:netherite_ingot" },
};
/** The joined helmet's item id and name: "zoocraft:diamond_warped_wood_sombrero", "Diamond Warped Wood Sombrero". */
export const hatItem = (helmetId, hatId) => `zoocraft:${HELMETS[helmetId].key}_${ASH_HATS[hatId].key}`;
export const hatName = (helmetId, hatId) => `${HELMETS[helmetId].name} ${ASH_HATS[hatId].name}`;
const VANILLA_BOOTS = /^minecraft:[a-z]+_boots$/;
/** The Ash piece a worn item counts as: its own id if it is one of his, else the one joined to it, else undefined. */
export const ashWareOf = (typeId, mark) => (typeof mark === "string" && mark ? `zoocraft:${mark}` : typeId);
/** The lore line joined boots carry. */
export const ashLore = (shoe) => `§r§d${shoe.name}: ${shoe.gives}`;
/** An item's lore with the joined shoes' line first (once). */
export function withAshLore(lore, shoe) {
  const line = ashLore(shoe);
  return [line, ...(lore ?? []).filter((l) => l !== line)].slice(0, 20);
}
/**
 * What can be joined from what a player carries. `slots` is [{ slot, typeId, ash (the mark on it, if any) }] for every
 * item. Returns rows [{ kind: "shoes" | "hat", ware: slot, armor: slot, wareId, armorId, name, result }]: each of
 * Ash's pieces with the first piece of armor it fits (boots with nothing of his on them; a helmet of the game's seven).
 */
export function comboPlan(slots) {
  const rows = [];
  const taken = new Set();
  for (const w of slots) {
    const shoe = ASH_SHOES[w.typeId];
    const hat = ASH_HATS[w.typeId];
    if (!shoe && !hat) continue;
    const armor = slots.find((a) => !taken.has(a.slot) && (shoe ? VANILLA_BOOTS.test(a.typeId) && !a.ash : Boolean(HELMETS[a.typeId])));
    if (!armor) continue;
    taken.add(armor.slot);
    const armorName = pieceName(armor.typeId);
    rows.push(shoe
      ? { kind: "shoes", ware: w.slot, armor: armor.slot, wareId: w.typeId, armorId: armor.typeId, name: `${shoe.name} onto ${armorName}`, result: `${armorName} giving ${shoe.gives}` }
      : { kind: "hat", ware: w.slot, armor: armor.slot, wareId: w.typeId, armorId: armor.typeId, name: `${hat.name} onto ${armorName}`, result: hatName(armor.typeId, w.typeId) });
  }
  return rows;
}

// --- The Hanvil's two slots (0.1.309). Austin 2026-11-16: "to use it players should be able to put in 2 items like a
// grindstone to create the new items". The Hanvil holds five slots in a row: the first two take what goes in, the
// last gives what comes out.
export const SLOT_IN = [0, 1];
export const SLOT_OUT = 4;
/**
 * What the two things on the Hanvil make for a player of this friendship. `a` and `b` are { slot, typeId, amount, ash,
 * piece } (`piece`: the item as reinforcing reads it, when it has durability). Returns { op: "casings", batches } |
 * { op: "join", row } | { op: "reinforce", row }, each with `at` (the friendship it needs) and `locked`; or { why }
 * when the two make nothing.
 */
export function slotPlan(a, b, points, g) {
  const p = points ?? 0;
  const gate = (key, out) => ({ ...out, at: g.at[key], locked: p < g.at[key] });
  const ids = [a.typeId, b.typeId];
  if (ids.includes(TNT) && ids.includes(PAPER)) {
    const tnt = a.typeId === TNT ? a : b;
    const paper = a.typeId === TNT ? b : a;
    return gate("arrows", { op: "casings", batches: casingBatches(tnt.amount, paper.amount, g.arrows), tnt: tnt.slot, paper: paper.slot });
  }
  const combo = comboPlan([a, b])[0];
  if (combo) return gate("ash", { op: "join", row: combo });
  if (a.piece && b.piece) {
    const plan = reinforcePlan([a.piece, b.piece]);
    if (plan.rows.length) return gate("reinforce", { op: "reinforce", row: plan.rows[0] });
    if (plan.no.length) return { why: `the ${plan.no[0].name} ${WHY_WORDS[plan.no[0].why]}` };
    return { why: "those are not two of the same piece at the same strength" };
  }
  return { why: "those two make nothing here" };
}
