// Guido's Bow Case (0.1.261; rules and words: bowRules.js, data/bows.js; Austin's "All 15", 2026-11-12).
//
// The Bow Case block holds its bows in an unseen entity inside it (zoocraft:bow_case_store, 27 slots, private: no chest
// screen), as the Disposery does. It counts only inside Guido's own house. The first one used there becomes his and is
// stocked, once a world, with one of each of ZooCraft's fifteen bows. Its page opens only at the case: from Acquaintance
// you can look at the collection, and from Friend you can swap one of your bows for one of his, once a day, while he's
// at home and awake. A bow you give him goes into the case. A bow only ever moves (Container.swapItems / moveItem): none
// is ever made, apart from the one stocking. While he lives there his case can't be picked up; once he has moved out,
// two hits pick it up and every bow in it drops.
import { world, system, GameMode, EquipmentSlot } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { ItemStack } from "@minecraft/server";
import { show } from "../ui/forms.js";
import { message } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { getResident } from "../residents/residents.js";
import { getHome } from "../residents/homes.js";
import { bondOf, saveBond, tierWith } from "../residents/bonds.js";
import { bondLine, TIER_NAMES } from "../residents/bondRules.js";
import { BOWS } from "../data/bows.js";
import { GUIDO_ID, isCaseBow, bowOf, caseAccess, tradeOpen, fingerprint, tradeStillGood, stockList, wearText, enchantText } from "./bowRules.js";
import { secondHit } from "../disposery/disposeryRules.js";

export const CASE_BLOCK = "zoocraft:bow_case";
export const CASE_STORE = "zoocraft:bow_case_store";
const COL = "guido_case";
const CASE_ID = "case";
const hits = new Map(); // player id -> { key, tick }: the first of two hits

const g = () => BALANCE.residents.bowCase;
const keyOf = (dimensionId, pos) => `${dimensionId}|${Math.floor(pos.x)}|${Math.floor(pos.y)}|${Math.floor(pos.z)}`;
const guido = () => residentById(GUIDO_ID);
const say = (key) => `§fGuido: §7"${bondLine(guido(), key)}"`;

/** The record of Guido's case: where it is, and whether it was stocked. */
function caseRec() {
  return db.get(COL, CASE_ID) ?? { id: CASE_ID, stocked: false };
}

/** The store entity of the case at a block position, or undefined. */
export function storeAt(dimension, pos) {
  try {
    return dimension.getEntities({ type: CASE_STORE, location: { x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y) + 0.5, z: Math.floor(pos.z) + 0.5 }, maxDistance: 0.9 })[0];
  } catch {
    return undefined;
  }
}

/** The case block's store, made if it has none. */
export function ensureStore(block) {
  const have = storeAt(block.dimension, block.location);
  if (have) return have;
  try {
    return block.dimension.spawnEntity(CASE_STORE, block.bottomCenter());
  } catch {
    return undefined; // the chunk went away: the next use makes it
  }
}

export const containerOf = (holder) => {
  try {
    return holder?.isValid ? holder.getComponent("minecraft:inventory")?.container : undefined;
  } catch {
    return undefined;
  }
};

/** A slot's item as a plain record for the rules (kind, name, wear, enchantments), or undefined. */
export function recordOf(it) {
  if (!it) return undefined;
  let damage = 0;
  let max = 0;
  let enchants = [];
  try {
    const d = it.getComponent("minecraft:durability");
    damage = d?.damage ?? 0;
    max = d?.maxDurability ?? 0;
  } catch {
    // no wear on this item
  }
  try {
    enchants = (it.getComponent("minecraft:enchantable")?.getEnchantments() ?? []).map((e) => [e.type.id, e.level]);
  } catch {
    enchants = [];
  }
  return { typeId: it.typeId, nameTag: it.nameTag, damage, max, enchants, key: it.localizationKey };
}

/** Whether a block position is inside Guido's house (his home's rooms), and he lives there. */
export function inGuidosHouse(dimensionId, pos) {
  const rec = getResident(GUIDO_ID);
  const home = rec ? getHome(rec.homeId) : undefined;
  const b = home?.bbox;
  if (!b || home.dimension !== dimensionId) return false;
  return pos.x >= b.min.x - 1 && pos.x <= b.max.x + 1 && pos.y >= b.min.y - 1 && pos.y <= b.max.y + 1 && pos.z >= b.min.z - 1 && pos.z <= b.max.z + 1;
}

/** Guido's own case store, if it's there and loaded. */
export function guidosStore() {
  const c = caseRec();
  if (!c.dimension || !c.pos) return undefined;
  try {
    const d = world.getDimension(c.dimension);
    const s = storeAt(d, c.pos);
    return s && d.getBlock(c.pos)?.typeId === CASE_BLOCK ? s : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Makes a case in Guido's house his, when he has none (or his is gone), and stocks it the first time in a world: one of
 * each of the fifteen. Returns whether this store is his case now.
 */
export function claimCase(store) {
  if (!store?.isValid) return false;
  const pos = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  const dimId = store.dimension.id;
  if (!inGuidosHouse(dimId, pos)) return false;
  const c = caseRec();
  const mine = c.dimension === dimId && c.pos && keyOf(dimId, c.pos) === keyOf(dimId, pos);
  if (!mine) {
    const other = guidosStore();
    if (other && other.id !== store.id && inGuidosHouse(other.dimension.id, other.location)) return false; // he has one
  }
  let next = { ...c, dimension: dimId, pos };
  if (!c.stocked) {
    const box = containerOf(store);
    if (box && box.emptySlotsCount >= stockList().length) {
      for (const id of stockList()) box.addItem(new ItemStack(id, 1));
      next = { ...next, stocked: true, stockedDay: world.getDay() };
    }
  }
  db.put(COL, next);
  return true;
}

/** The bows in a case, slot by slot: [{ slot, rec }]. */
export function caseBows(store) {
  const c = containerOf(store);
  const out = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (it) out.push({ slot: i, rec: recordOf(it) });
  }
  return out;
}

/** A player's bows, slot by slot: [{ slot, rec }]. */
export function playerBows(player) {
  const c = containerOf(player);
  const out = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (it && isCaseBow(it.typeId)) out.push({ slot: i, rec: recordOf(it) });
  }
  return out;
}

/** A bow's name and details for a page. */
function bowRaw(rec, prefix = "") {
  const ench = rec.enchants.map(([id, lvl]) => enchantText(id, lvl)).join(", ");
  const detail = `\n§8${wearText(rec.damage, rec.max)}${ench ? `; ${ench}` : ""}`;
  const own = bowOf(rec.typeId);
  if (rec.nameTag) return { rawtext: [{ text: `${prefix}${rec.nameTag}${detail}` }] };
  if (own) return { rawtext: [{ text: `${prefix}${own.name}${detail}` }] };
  return { rawtext: [{ text: prefix }, { translate: rec.key ?? rec.typeId }, { text: detail }] };
}

/** Why Guido can't trade right now, or undefined. */
function tradeBlocker(player) {
  const rec = getResident(GUIDO_ID);
  if (!rec) return "§7Guido doesn't live here any more.";
  if (rec.state === "asleep") return "§7Guido is asleep. He trades when he's up and at home.";
  if (rec.state !== "inside") return "§7Guido is out. He trades when he's at home.";
  const b = bondOf(GUIDO_ID, player.id);
  if (!tradeOpen(b.bowTradeDay, world.getDay())) return say("tradeAgain");
  return undefined;
}

/** A trade: the two bows swap in one call, after checking both are still what the pages showed. */
export function swapBows(player, store, offer) {
  const mine = containerOf(player);
  const his = containerOf(store);
  if (!mine || !his) return false;
  const now = { mine: recordOf(mine.getItem(offer.mySlot)), his: recordOf(his.getItem(offer.hisSlot)) };
  if (!tradeStillGood({ mine: offer.mine, his: offer.his }, now)) return false;
  mine.swapItems(offer.mySlot, offer.hisSlot, his);
  const b = bondOf(GUIDO_ID, player.id);
  saveBond({ ...b, bowTradeDay: world.getDay(), bowTrades: (b.bowTrades ?? 0) + 1 }, player);
  return true;
}

async function lookPage(player, store) {
  const bows = caseBows(store);
  const form = new ActionFormData().title("Guido's Bow Case").body(`§7${bondLine(guido(), "caseLook")}\n\n§f${bows.length} bow${bows.length === 1 ? "" : "s"} in the case.`);
  for (const b of bows) form.button(bowRaw(b.rec));
  form.button("Back");
  const r = await show(player, form);
  if (r?.selection === bows.length) return casePage(player, store);
}

async function tradePage(player, store) {
  const block = tradeBlocker(player);
  if (block) return message(player, block);
  const mine = playerBows(player);
  if (!mine.length) return message(player, "§7You have no bow to trade. Guido swaps a bow for a bow.");
  const pick1 = new ActionFormData().title("Trade a bow: yours").body("§7Pick the bow you'll give Guido. It goes into his case just as it is.");
  for (const b of mine) pick1.button(bowRaw(b.rec));
  pick1.button("Back");
  const r1 = await show(player, pick1);
  if (r1?.selection === undefined) return;
  if (r1.selection >= mine.length) return casePage(player, store);
  const his = caseBows(store);
  if (!his.length) return message(player, "§7The case is empty.");
  const pick2 = new ActionFormData().title("Trade a bow: his").body("§7Pick the bow you'd like from his case.");
  for (const b of his) pick2.button(bowRaw(b.rec));
  pick2.button("Back");
  const r2 = await show(player, pick2);
  if (r2?.selection === undefined || r2.selection >= his.length) return;
  const offer = { mySlot: mine[r1.selection].slot, mine: mine[r1.selection].rec, hisSlot: his[r2.selection].slot, his: his[r2.selection].rec };
  const late = tradeBlocker(player);
  if (late) return message(player, late);
  if (!store.isValid || !swapBows(player, store, offer)) return message(player, "§7Something moved before the swap, so nothing was traded. Try again.");
  message(player, say("tradeDone"));
}

/** The case's page: what you may do there by friendship. */
export async function casePage(player, store) {
  if (!store?.isValid) return;
  const at = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  if (!getResident(GUIDO_ID)) return message(player, "§7A Bow Case. It's for Guido, once he lives here.");
  if (!inGuidosHouse(store.dimension.id, at)) return message(player, "§7A Bow Case counts only inside Guido's house. Put it in one of his rooms.");
  if (!claimCase(store)) return message(player, "§7Guido already has a Bow Case in his house. This one stays shut.");
  const tier = tierWith(GUIDO_ID, player.id);
  const can = caseAccess(tier, g());
  const n = caseBows(store).length;
  const form = new ActionFormData().title("Guido's Bow Case");
  const lines = [`§7Guido's collection: ${n} bow${n === 1 ? "" : "s"}.`, `§8You and Guido: ${TIER_NAMES[tier]}.`];
  if (!can.look) lines.push(`§7He shows his collection to acquaintances and up (${TIER_NAMES[g().lookTier]}).`);
  else if (!can.trade) lines.push(`§7At ${TIER_NAMES[g().tradeTier]}, he'll trade you a bow from it, once a day.`);
  form.body(lines.join("\n"));
  const acts = [];
  if (can.look) {
    form.button("Look at the collection");
    acts.push(() => lookPage(player, store));
  }
  if (can.trade) {
    form.button("Trade a bow\n§8One of yours for one of his, once a day");
    acts.push(() => tradePage(player, store));
  }
  form.button("Close");
  const r = await show(player, form);
  if (r?.selection !== undefined && r.selection < acts.length) await acts[r.selection]();
}

/**
 * A bow given to Guido goes into his case: the very item, from the first slot that holds that kind. Returns "ok", or why
 * not ("none": no case of his is there; "full").
 */
export function caseRoomFor() {
  const s = guidosStore();
  const c = containerOf(s);
  if (!c) return "none";
  return c.emptySlotsCount > 0 ? "ok" : "full";
}

export function moveIntoCase(player, typeId) {
  const s = guidosStore();
  const box = containerOf(s);
  const mine = containerOf(player);
  if (!box || !mine || box.emptySlotsCount < 1) return false;
  for (let i = 0; i < mine.size; i++) {
    const it = mine.getItem(i);
    if (!it || it.typeId !== typeId) continue;
    const free = [...Array(box.size).keys()].find((k) => !box.getItem(k));
    if (free === undefined) return false;
    mine.moveItem(i, free, box);
    return true;
  }
  return false;
}

/** Guido's case, for his page: how many bows, and its room. Undefined without one. */
export function caseState() {
  const s = guidosStore();
  const c = containerOf(s);
  return c ? { n: c.size - c.emptySlotsCount, size: c.size, stocked: caseRec().stocked } : undefined;
}

/** Everything in a store dropped where it stands (nothing is deleted). */
export function dropAll(store) {
  const c = containerOf(store);
  if (!c) return 0;
  let n = 0;
  const at = { x: store.location.x, y: store.location.y + 0.6, z: store.location.z };
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    store.dimension.spawnItem(it, at);
    c.setItem(i, undefined);
    n++;
  }
  return n;
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

/** Whether a case may be picked up: not Guido's own while he lives there with bows in it. */
export function mayPickUp(store) {
  const c = caseRec();
  const at = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  const his = c.pos && c.dimension === store.dimension.id && keyOf(c.dimension, c.pos) === keyOf(store.dimension.id, at);
  if (!his || !inGuidosHouse(store.dimension.id, at)) return true;
  return caseBows(store).length === 0;
}

/** Picks a case up: its bows drop, the block drops as its item (not in Creative), the store goes. */
export function pickUp(store, player) {
  const dimension = store.dimension;
  const pos = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  dropAll(store);
  try {
    const block = dimension.getBlock(pos);
    if (block?.typeId === CASE_BLOCK) {
      if (player && creative(player)) block.setType("minecraft:air");
      else dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} air destroy`);
    }
  } catch {
    // the block is out of reach: the store still goes, and its bows are already out
  }
  store.remove();
}

/** The case block's own hooks. The store takes uses and hits while it's there; these cover the times it isn't. */
export function bowCaseComponent() {
  return {
    onPlace(e) {
      ensureStore(e.block);
    },
    onPlayerInteract(e) {
      const s = storeAt(e.block.dimension, e.block.location) ?? ensureStore(e.block);
      if (s && e.player) {
        const player = e.player;
        system.run(() => casePage(player, s));
      }
    },
    onPlayerBreak(e) {
      const store = storeAt(e.block.dimension, e.block.location);
      if (!store) return;
      dropAll(store);
      store.remove();
    },
  };
}

/** The world events the case needs: a use opens its page, two hits pick it up. */
export function wireBowCase() {
  world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    if (e.target.typeId !== CASE_STORE) return;
    e.cancel = true;
    const player = e.player;
    const store = e.target;
    system.run(() => {
      if (!store.isValid) return;
      let block;
      try {
        block = store.dimension.getBlock(store.location);
      } catch {
        block = undefined;
      }
      if (block && block.typeId !== CASE_BLOCK) {
        dropAll(store); // its block is gone (a command, say): it gives back what it holds and goes
        store.remove();
        return;
      }
      casePage(player, store);
    });
  });
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const store = e.hitEntity;
    const player = e.damagingEntity;
    if (store?.typeId !== CASE_STORE || player?.typeId !== "minecraft:player" || !store.isValid) return;
    if (!mayPickUp(store)) return message(player, "§7That's Guido's collection. It stays while he lives here.");
    const key = keyOf(store.dimension.id, store.location);
    const tick = system.currentTick;
    if (!secondHit(hits.get(player.id), key, tick)) {
      hits.set(player.id, { key, tick });
      return message(player, "§7Hit it again to pick the Bow Case up. Every bow in it drops out.");
    }
    hits.delete(player.id);
    pickUp(store, player);
  });
}

/** The bows held in a hand, for bowShots.js. */
export function heldBow(player) {
  try {
    const it = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
    return it ? bowOf(it.typeId) : undefined;
  } catch {
    return undefined;
  }
}

/** Bench and test only: Guido's case record. */
export function caseDebug() {
  return { rec: caseRec(), state: caseState(), bows: BOWS.length };
}
