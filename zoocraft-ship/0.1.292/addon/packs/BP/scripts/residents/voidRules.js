// Chasm's void work, the rules (0.1.290; Austin's NPC #22 spec, research/ZooCraft_Tycoon_NPC_22_Chasm.md). Pure: no
// game calls here, so the tests can run them.
//
// 50 friendship: "Volatile Void Essence trading: 1 diamond = 1 Volatile Void Essence". The trade takes whole diamonds
// out of the player's own stacks first and hands over exactly as many essences as it took, so nothing is ever made
// from nothing (Austin: "no duplication").

export const CHASM_ID = "chasm";
export const DIAMOND = "minecraft:diamond";
export const ESSENCE = "zoocraft:volatile_void_essence";
/** The ability (a resident's `rewards` entry) that opens the trade: kept for good once he has offered it. */
export const TRADE_ABILITY = "essence_trade";

/** How many plain diamonds the slots hold. `slots`: [{ typeId, amount } | undefined]. */
export function diamondsIn(slots) {
  let n = 0;
  for (const s of slots) if (s && s.typeId === DIAMOND && s.amount > 0) n += s.amount;
  return n;
}

/**
 * The stacks a trade of `want` diamonds takes from: { total (at most want and at most what is carried), take:
 * [{ slot, n }] in slot order }. A want of less than one, or one that isn't a whole number, takes nothing.
 */
export function tradePlan(slots, want) {
  const take = [];
  let left = Number.isInteger(want) && want > 0 ? want : 0;
  let total = 0;
  for (let slot = 0; slot < slots.length && left > 0; slot++) {
    const s = slots[slot];
    if (!s || s.typeId !== DIAMOND || !(s.amount > 0)) continue;
    const n = Math.min(left, s.amount);
    take.push({ slot, n });
    left -= n;
    total += n;
  }
  return { total, take };
}

/** The amounts his page offers for someone carrying `have` diamonds: 1, 8 (from 8) and all of them (from 2, if not 8). */
export function tradeOffers(have) {
  const out = [];
  if (have >= 1) out.push(1);
  if (have >= 8) out.push(8);
  if (have >= 2 && have !== 8) out.push(have);
  return out;
}

/** Whether this friendship record has the trade (the ability, once offered, is kept even if friendship drops). */
export function hasTrade(bond) {
  return bond?.rewards?.[TRADE_ABILITY] !== undefined;
}

// ---- The Volatile Totems (0.1.291; the spec's section 5) ----
// Four totems, each eight Volatile Void Essence round one thing at a crafting table (BP/recipes). A recipe can't be
// kept from one player and given to another, so the knowledge is the player's own: Chasm teaches each totem at its
// friendship (an ability, kept for good: "Previously earned crafting knowledge should remain available even if
// friendship later decreases"), and a totem wakes only for a player he has taught.
export const TOTEMS = {
  dwelling: { id: "zoocraft:volatile_totem_dwelling", name: "Volatile Totem of Dwelling", at: 60, ability: "totem_dwelling", centre: "minecraft:bed", centreName: "a bed" },
  zoo: { id: "zoocraft:volatile_totem_zoo", name: "Volatile Totem of Zoo", at: 70, ability: "totem_zoo", centre: "minecraft:egg", centreName: "an egg" },
  nether: { id: "zoocraft:volatile_totem_nether", name: "Volatile Totem of Nether", at: 80, ability: "totem_nether", centre: "minecraft:blaze_rod", centreName: "a blaze rod" },
  end: { id: "zoocraft:volatile_totem_end", name: "Volatile Totem of End", at: 90, ability: "totem_end", centre: "minecraft:ender_eye", centreName: "an eye of ender" },
};

/** Which totem an item is ("dwelling", "zoo", "nether", "end"), or undefined. */
export function totemKey(typeId) {
  return Object.keys(TOTEMS).find((k) => TOTEMS[k].id === typeId);
}

/** Whether this friendship record has been taught that totem. */
export function knowsTotem(bond, key) {
  const t = TOTEMS[key];
  return Boolean(t) && bond?.rewards?.[t.ability] !== undefined;
}

// A safe place to arrive (the spec: "Teleportation must place the player at a safe, valid location", not "inside
// portal frames, lava, or solid blocks", not "over the void").
const HAZARDS = /^minecraft:(lava|flowing_lava|fire|soul_fire|magma|campfire|soul_campfire|cactus|sweet_berry_bush|wither_rose|powder_snow|pointed_dripstone|end_portal|end_gateway)$|^zoocraft:clear_lava$/;
const PORTALS = /^minecraft:portal$|^zoocraft:sea_portal$/;
const OPEN = /^minecraft:(short_grass|tall_grass|fern|large_fern|deadbush|dead_bush|snow_layer|light_block\w*|structure_void|torch|soul_torch|redstone_torch|rail|golden_rail|detector_rail|activator_rail|vine|glow_lichen|dandelion|poppy|leaf_litter|pink_petals|wildflowers)$|_carpet$|_tulip$|_sign$|_button$|_pressure_plate$|_sapling$/;

/**
 * What a block is to someone arriving: "open" (stood in), "solid" (stood on), "water", "hazard" (hurts to stand in, on
 * or beside) or "portal" (never stood in: it would carry them off).
 */
export function standKind(typeId, isAir = false, isLiquid = false) {
  if (isAir || typeId === "minecraft:air") return "open";
  if (HAZARDS.test(typeId)) return "hazard";
  if (PORTALS.test(typeId)) return "portal";
  if (isLiquid || typeId === "minecraft:water" || typeId === "minecraft:flowing_water") return "water";
  if (OPEN.test(typeId)) return "open";
  return "solid";
}

/** Whether (x, y, z) is a safe place for feet: solid under, open at feet and head, no hazard beside them or beside the floor. */
export function safeAt(read, x, y, z) {
  if (read(x, y - 1, z) !== "solid" || read(x, y, z) !== "open" || read(x, y + 1, z) !== "open") return false;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (const dy of [-1, 0, 1]) if (read(x + dx, y + dy, z + dz) === "hazard") return false;
  }
  return true;
}

/**
 * The safe place nearest `c`: within `reach` blocks across, `up` above and `down` below. A block of height counts as
 * two across, so the ground beside a thing is taken before its top. `read(x, y, z)` gives standKind's answer (undefined
 * where the world isn't loaded: never safe). Returns { x, y, z } (whole numbers: the block the feet are in) or undefined.
 */
export function safeSpot(read, c, { reach = 4, up = 4, down = 4 } = {}) {
  const cx = Math.floor(c.x);
  const cy = Math.floor(c.y);
  const cz = Math.floor(c.z);
  const cells = [];
  for (let dx = -reach; dx <= reach; dx++) for (let dz = -reach; dz <= reach; dz++) for (let dy = -down; dy <= up; dy++) cells.push([dx * dx + dz * dz + 4 * dy * dy, Math.abs(dy), dy, dx, dz]);
  cells.sort((a, b) => a[0] - b[0] || a[1] - b[1] || b[2] - a[2] || a[3] - b[3] || a[4] - b[4]);
  for (const [, , dy, dx, dz] of cells) if (safeAt(read, cx + dx, cy + dy, cz + dz)) return { x: cx + dx, y: cy + dy, z: cz + dz };
  return undefined;
}

// The Totem of Nether: "the nearest valid Nether portal". The game keeps no list a script can read, so ZooCraft keeps
// its own: every Nether portal a player goes through (either end) is remembered, and checked to be still standing
// before anyone is sent to it.
export const OVERWORLD = "minecraft:overworld";
export const NETHER = "minecraft:nether";
export const THE_END = "minecraft:the_end";

/** The portal list with one more remembered: one within `apart` blocks of it (the same portal) is moved to the end instead; the oldest go past `max`. */
export function addPortal(list, p, apart = 6, max = 64) {
  const at = { d: p.d, x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
  const rest = (list ?? []).filter((q) => q.d !== at.d || Math.abs(q.x - at.x) > apart || Math.abs(q.y - at.y) > apart || Math.abs(q.z - at.z) > apart);
  rest.push(at);
  return rest.slice(Math.max(0, rest.length - max));
}

/** The portal list without that one. */
export function dropPortal(list, p) {
  return (list ?? []).filter((q) => !(q.d === p.d && q.x === p.x && q.y === p.y && q.z === p.z));
}

/**
 * The remembered portals in the order a totem tries them, from `here` { d, x, y, z }: the nearest in this dimension
 * first; then, from the Overworld or the Nether, the other one's by where they'd be here (8 blocks of the Overworld
 * to 1 of the Nether); from anywhere else, the Overworld's nearest `home` { x, z } (the player's spawn), then the
 * Nether's.
 */
export function portalOrder(list, here, home = { x: 0, z: 0 }) {
  const all = list ?? [];
  const flat = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
  const full = (a, b) => flat(a, b) + (a.y - b.y) ** 2;
  const by = (d, dist) => all.filter((p) => p.d === d).map((p) => [dist(p), p]).sort((a, b) => a[0] - b[0]).map(([, p]) => p);
  const out = by(here.d, (p) => full(p, here));
  if (here.d === OVERWORLD) out.push(...by(NETHER, (p) => flat({ x: p.x * 8, z: p.z * 8 }, here)));
  else if (here.d === NETHER) out.push(...by(OVERWORLD, (p) => flat({ x: p.x / 8, z: p.z / 8 }, here)));
  else {
    out.push(...by(OVERWORLD, (p) => flat(p, home)));
    out.push(...by(NETHER, (p) => flat({ x: p.x * 8, z: p.z * 8 }, home)));
  }
  return out;
}

/** Where the game puts anyone who comes into the End: on the obsidian platform (its top at y 48), at 100, 49, 0. */
export const END_ARRIVAL = { x: 100, y: 49, z: 0 };
/** The platform as the game builds it: 5 by 5 of obsidian, and 3 blocks of air over it. */
export const END_PLATFORM = { from: { x: 98, y: 48, z: -2 }, to: { x: 102, y: 48, z: 2 }, airFrom: { x: 98, y: 49, z: -2 }, airTo: { x: 102, y: 51, z: 2 } };

// ---- 0.1.292: the Voidologist Core and the Volatile Pump (the spec's section 6) ----
// "Maximum one active Volatile Pump per player", only in the End, one essence "every 120 seconds" of loaded running,
// "No production while unloaded", "No offline or unloaded catch-up production", progress kept ("If the pump has
// completed 90 seconds and becomes unloaded, it needs only 30 more seconds after reloading").

export const CORE = "zoocraft:voidologist_core";
export const PUMP = "zoocraft:volatile_pump";
/** A player's one pump is filed under their own id, so there is never room for a second. */
export const pumpId = (owner) => `pump:${owner}`;
export const isPumpRecord = (r) => typeof r?.id === "string" && r.id.startsWith("pump:");

/** The record of a pump just set down: whose, where, nothing made yet. */
export function newPump(owner, ownerName, dimensionId, loc) {
  return { id: pumpId(owner), owner, ownerName, d: dimensionId, x: loc.x, y: loc.y, z: loc.z, progress: 0, stored: 0 };
}

/** Whether a pump's record is of this block. */
export const pumpIsAt = (rec, dimensionId, loc) => Boolean(rec) && rec.d === dimensionId && rec.x === loc.x && rec.y === loc.y && rec.z === loc.z;

/**
 * Whether a player may set a pump down in `dimensionId`. `existing` is their pump's record (if any), `standing` what
 * is at its place now: "pump", "gone" (the place is loaded and no pump is there) or "unloaded" (can't be seen, so it
 * counts as standing). Returns { ok: true, clear? (the old record is stale) } or { ok: false, why: "dimension" | "one",
 * at? }.
 */
export function mayPlacePump(dimensionId, existing, standing) {
  if (dimensionId !== THE_END) return { ok: false, why: "dimension" };
  if (!existing) return { ok: true };
  if (standing === "gone") return { ok: true, clear: true };
  return { ok: false, why: "one", at: { x: existing.x, y: existing.y, z: existing.z } };
}

/**
 * A pump's record after `ticks` more of loaded running. `B`: { seconds (per essence), cap (the most it stores) }. A
 * full pump stands still. Returns the same record when nothing changed.
 */
export function pumpTick(rec, ticks, B) {
  const per = B.seconds * 20;
  let stored = rec.stored ?? 0;
  if (stored >= B.cap || !(ticks > 0)) return rec;
  let progress = (rec.progress ?? 0) + ticks;
  while (progress >= per && stored < B.cap) {
    progress -= per;
    stored += 1;
  }
  if (stored >= B.cap) progress = 0;
  return { ...rec, progress, stored };
}

/** Whole seconds of loaded running until a pump's next essence. */
export const pumpSecondsLeft = (rec, B) => Math.max(1, Math.ceil((B.seconds * 20 - (rec.progress ?? 0)) / 20));

/** Emptying a pump: { rec (with nothing stored, its progress kept), n (what came out) }. */
export function pumpCollect(rec) {
  const n = Math.max(0, Math.floor(rec.stored ?? 0));
  return { rec: n ? { ...rec, stored: 0 } : rec, n };
}

/** Whether this player may break that pump: its owner, or anyone when nobody owns it. */
export const mayBreakPump = (rec, playerId) => !rec || rec.owner === playerId;
