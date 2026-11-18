// Han Lock's Hanvil and Hammer in the world (0.1.305; the rules: equipment/hanvilRules.js). Austin's NPC #26 spec: "a
// custom, advanced crafting workstation ... an anvil and hammer constructed using bedrock ... indestructible ... uses a
// dedicated interaction or crafting interface", and "the player gains permission to use his Hanvil and Hammer" with
// friendship.
//  - The block can't be mined, blown up or pushed. 0.1.309 (Austin 2026-11-16): Han sets his own down in his house when
//    he moves in (residents/furnish.js); it stays there. Another one (handed over before 0.1.309) is picked up by
//    hitting it twice.
//  - 0.1.309: it is used "like a grindstone": the block holds an unseen store (zoocraft:hanvil_store, five slots in a
//    row, the game's own screen). Put two things in the first two slots; what they make appears in the last, for a
//    player Han lets do that (the nearest player's own friendship with him). Nothing is made any other way.
//  - Reinforcing: two matching unused pieces become one, a level higher. Ash's shoes, hats and (0.1.328) necklaces are joined to armor.
//    TNT and paper make Explosive Arrow Casings.
//  - A reinforced piece held or worn has its wear paid back from its reserve (tickReinforced); a piece seen with wear
//    on it is marked as used for good (there, and in a slower look through everything carried: tickUsed).
import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";
import { message, giveItem, onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "../residents/bondRules.js";
import { bondOf } from "../residents/bonds.js";
import { parkAt, can, denyText } from "../park/park.js";
import { isOwnStation, bringsStation } from "../residents/furnish.js";
import { reportError } from "../core/log.js";
import { HAN_ID, HANVIL, RF_LEVEL, RF_POOL, USED, mayUse, hanvilLine, reinforced, refund, withLore, loreShows, levelText, maxAt, pieceName, whyNot, EXPLOSIVE_ARROW, ASH_MARK, ASH_SHOES, ASH_NECKLACES, hatItem, withAshLore, slotPlan, SLOT_IN, SLOT_OUT } from "./hanvilRules.js";

const H = () => BALANCE.hanvil;
const SLOTS = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

const containerOf = (holder) => {
  try {
    return holder.getComponent("minecraft:inventory")?.container;
  } catch {
    return undefined;
  }
};

/** A piece as the rules read it, or undefined when it has no durability. */
function read(it, slot) {
  if (!it) return undefined;
  let dur;
  try {
    dur = it.getComponent("minecraft:durability");
  } catch {
    return undefined;
  }
  if (!dur) return undefined;
  const level = it.getDynamicProperty(RF_LEVEL);
  const pool = it.getDynamicProperty(RF_POOL);
  const ash = it.getDynamicProperty(ASH_MARK);
  return { slot, typeId: it.typeId, name: pieceName(it.typeId), max: dur.maxDurability, damage: dur.damage, level: typeof level === "number" ? level : 0, pool: typeof pool === "number" ? pool : 0, used: it.getDynamicProperty(USED) === true, ash: typeof ash === "string" ? ash : undefined };
}

/** Every piece with durability a player carries (their inventory, not what they wear). */
function carried(player) {
  const c = containerOf(player);
  const out = [];
  for (let i = 0; c && i < c.size; i++) {
    const r = read(c.getItem(i), i);
    if (r) out.push(r);
  }
  return out;
}

const pointsOf = (player) => bondOf(HAN_ID, player.id).points ?? 0;
const say = (key) => {
  const res = residentById(HAN_ID);
  return `§f${res.name}: §7"${bondLine(res, key)}"`;
};

/** Reinforces the pair in a plan's row, in a container (0.1.309: the Hanvil's own). Returns { ok, text }. */
export function reinforce(c, row) {
  if (!c) return { ok: false, text: "" };
  const a = c.getItem(row.a);
  const b = c.getItem(row.b);
  const ra = read(a, row.a);
  const rb = read(b, row.b);
  // read again as it is done: the same two pieces, still matching, still unused
  if (!ra || !rb || row.a === row.b || ra.typeId !== row.typeId || rb.typeId !== row.typeId || ra.level !== row.level || rb.level !== row.level || whyNot(ra) || whyNot(rb)) {
    return { ok: false, text: "§7Those two pieces aren't both there as they were. Nothing was changed." };
  }
  const next = reinforced(ra);
  a.setDynamicProperty(RF_LEVEL, next.level);
  a.setDynamicProperty(RF_POOL, next.pool);
  a.setLore(withLore(a.getLore(), next.level, ra.max, next.pool));
  c.setItem(row.b, undefined); // the second piece goes into the first
  c.setItem(row.a, a);
  return { ok: true, text: `§6Hanvil and Hammer: §ftwo ${ra.name}s ${row.level ? `(${levelText(row.level)}) ` : ""}folded into one, §6Reinforced ${levelText(next.level)}§f: durability ${maxAt(ra.max, next.level)} in place of ${ra.max}.` };
}

/**
 * 0.1.307: joins one of Ash's pieces to a piece of armor (a row of hanvilRules.js comboPlan). His shoes: the boots
 * stay the item they were and gain the shoes' mark. His hats: the helmet becomes the joined helmet's own item, with
 * the old helmet's wear, enchantments, name and properties moved onto it. Ash's piece is used up. Returns { ok, text }.
 */
export function combine(c, row) {
  if (!c) return { ok: false, text: "" };
  const ware = c.getItem(row.ware);
  const armor = c.getItem(row.armor);
  if (ware?.typeId !== row.wareId || armor?.typeId !== row.armorId || (row.kind !== "hat" && armor.getDynamicProperty(ASH_MARK) !== undefined)) {
    return { ok: false, text: "§7Those two pieces aren't both there as they were. Nothing was changed." };
  }
  let made;
  if (row.kind === "shoes" || row.kind === "necklace") {
    const shoe = row.kind === "shoes" ? ASH_SHOES[row.wareId] : ASH_NECKLACES[row.wareId]; // 0.1.328: a necklace onto a chestplate
    armor.setDynamicProperty(ASH_MARK, shoe.key);
    armor.setLore(withAshLore(armor.getLore(), shoe));
    made = armor;
  } else {
    made = new ItemStack(hatItem(row.armorId, row.wareId), 1);
    try {
      const from = armor.getComponent("minecraft:durability");
      const to = made.getComponent("minecraft:durability");
      if (from && to) to.damage = Math.min(to.maxDurability - 1, from.damage);
    } catch {
      // as new
    }
    try {
      const to = made.getComponent("minecraft:enchantable");
      for (const e of armor.getComponent("minecraft:enchantable")?.getEnchantments() ?? []) {
        try {
          to?.addEnchantment(e);
        } catch {
          // one the joined helmet can't take
        }
      }
    } catch {
      // none to move
    }
    if (armor.nameTag) made.nameTag = armor.nameTag;
    for (const id of armor.getDynamicPropertyIds()) made.setDynamicProperty(id, armor.getDynamicProperty(id));
    const lore = armor.getLore();
    if (lore.length) made.setLore(lore);
  }
  c.setItem(row.ware, undefined); // Ash's piece goes into it
  c.setItem(row.armor, made);
  return { ok: true, text: `§6Hanvil and Hammer: §f${row.name}: §d${row.result}§f.` };
}

// --- the Hanvil's store and its two slots (0.1.309) ---

const STORE = "zoocraft:hanvil_store";
// 0.1.311: the game titles an unnamed entity's screen "Unknown". The store's name tag is its lang key (shown translated,
// and what RP/ui/redstone_screen.json looks for); its nameplate is drawn out to 0 blocks so nothing floats over the block.
export const HANVIL_TITLE = "entity.zoocraft:hanvil_store.name";
const SLOTS_SHUT = [2, 3]; // under the picture of the hammer on its screen: nothing stays there

/** Gives a store its title and hides its nameplate. Returns whether anything had to change. */
export function nameStore(store) {
  try {
    if (!store?.isValid) return false;
    let changed = false;
    if (store.nameplateRenderDistance !== 0) {
      store.nameplateRenderDistance = 0;
      changed = true;
    }
    if (store.nameTag !== HANVIL_TITLE) {
      store.nameTag = HANVIL_TITLE;
      changed = true;
    }
    return changed;
  } catch {
    return false;
  }
}

/** What was put in the two covered slots goes back to the player (or drops at their feet). Returns how many stacks. */
export function clearShut(store, player) {
  const c = containerOf(store);
  if (!c) return 0;
  let n = 0;
  for (const i of SLOTS_SHUT) {
    const it = c.getItem(i);
    if (!it) continue;
    c.setItem(i, undefined);
    let left = it;
    try {
      left = containerOf(player)?.addItem(it);
    } catch {
      left = it;
    }
    if (left) (player?.isValid ? player : store).dimension.spawnItem(left, (player?.isValid ? player : store).location);
    n++;
  }
  return n;
}
const said = new Map(); // store id -> what was last said about what lies on it
const hits = new Map(); // player id -> { key, tick } of a first hit

/** The store entity of the Hanvil at a block position, or undefined. */
export function storeAt(dimension, pos) {
  try {
    return dimension.getEntities({ type: STORE, location: { x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y) + 0.5, z: Math.floor(pos.z) + 0.5 }, maxDistance: 0.9 })[0];
  } catch {
    return undefined;
  }
}

/** The Hanvil block's store, made if it has none. */
export function ensureStore(block) {
  const have = storeAt(block.dimension, block.location);
  if (have) {
    nameStore(have);
    return have;
  }
  try {
    const made = block.dimension.spawnEntity(STORE, block.bottomCenter());
    nameStore(made);
    return made;
  } catch {
    return undefined; // the chunk went away: the next look makes it
  }
}

/** Everything on a Hanvil dropped where it stands (nothing is deleted). */
export function dropAll(store) {
  const c = containerOf(store);
  if (!c) return 0;
  let n = 0;
  const at = { x: store.location.x, y: store.location.y + 1.1, z: store.location.z };
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    store.dimension.spawnItem(it, at);
    c.setItem(i, undefined);
    n++;
  }
  return n;
}

const slotRec = (it, slot) => {
  let ash;
  try {
    ash = it.maxAmount === 1 ? it.getDynamicProperty(ASH_MARK) : undefined;
  } catch {
    ash = undefined;
  }
  return { slot, typeId: it.typeId, amount: it.amount, ash: typeof ash === "string" ? ash : undefined, piece: it.maxAmount === 1 ? read(it, slot) : undefined };
};

/**
 * One look at what lies on a Hanvil, for the player at it: two things in its first two slots that make something, with
 * its last slot free, are made into it there and then. Says why not, once, when they make nothing or Han has not
 * taught it. Returns what happened (for the test server).
 */
export function workStore(store, player) {
  const c = containerOf(store);
  if (!c) return "none";
  const a = c.getItem(SLOT_IN[0]);
  const b = c.getItem(SLOT_IN[1]);
  if (!a || !b) {
    said.delete(store.id);
    return "waiting";
  }
  const tell = (text) => {
    const key = `${a.typeId}:${a.amount}|${b.typeId}:${b.amount}|${text}`;
    if (said.get(store.id) === key) return;
    said.set(store.id, key);
    message(player, text);
  };
  const g = H();
  const points = pointsOf(player);
  if (!mayUse(points, g)) {
    tell(`${say("hanvilNo")} §8(${g.at.reinforce} friendship with Han Lock to use it)`);
    return "locked";
  }
  const plan = slotPlan(slotRec(a, SLOT_IN[0]), slotRec(b, SLOT_IN[1]), points, g);
  if (!plan.op) {
    tell(`§6Hanvil and Hammer: §7${plan.why}.`);
    return "nothing";
  }
  if (plan.locked) {
    tell(`§6Hanvil and Hammer: §7Han has not taught you that yet (${plan.at} friendship with him).`);
    return "locked";
  }
  if (c.getItem(SLOT_OUT)) {
    tell("§6Hanvil and Hammer: §7take what lies on its last slot first.");
    return "full";
  }
  let out;
  if (plan.op === "casings") {
    if (plan.batches < 1) return "nothing";
    const n = plan.batches;
    for (const [slot, each] of [[plan.tnt, g.arrows.tnt], [plan.paper, g.arrows.paper]]) {
      const it = c.getItem(slot);
      if (it.amount <= n * each) c.setItem(slot, undefined);
      else {
        it.amount -= n * each;
        c.setItem(slot, it);
      }
    }
    c.setItem(SLOT_OUT, new ItemStack(EXPLOSIVE_ARROW, n * g.arrows.makes));
    out = { ok: true, text: `§6Hanvil and Hammer: §f${n * g.arrows.makes} Explosive Arrow Casings made. Hold them in your off hand and shoot any bow: the arrow blows up where it lands, and one casing goes with it.` };
  } else {
    out = plan.op === "reinforce" ? reinforce(c, plan.row) : combine(c, plan.row);
    if (out.ok) {
      const from = plan.op === "reinforce" ? plan.row.a : plan.row.armor;
      const made = c.getItem(from);
      c.setItem(from, undefined);
      c.setItem(SLOT_OUT, made);
    }
  }
  if (out.text) message(player, out.text);
  if (!out.ok) return "failed";
  said.delete(store.id);
  try {
    store.dimension.playSound("random.anvil_use", store.location);
  } catch {
    // no sound, no matter
  }
  return plan.op;
}

/** Twice a second: each Hanvil near a player is looked at for the nearest player; a store whose block is gone gives back what it holds and goes. */
export function tickHanvils() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let stores;
    try {
      stores = player.dimension.getEntities({ type: STORE, location: player.location, maxDistance: 7 });
    } catch {
      continue;
    }
    for (const store of stores) {
      if (seen.has(store.id)) continue;
      seen.add(store.id);
      try {
        const block = store.dimension.getBlock(store.location);
        if (!block) continue;
        if (block.typeId !== HANVIL) {
          dropAll(store);
          store.remove();
          continue;
        }
        nameStore(store);
        clearShut(store, player);
        workStore(store, player);
      } catch (error) {
        reportError("hanvil", error);
      }
    }
  }
}

/** Picks a Hanvil up: what lies on it drops, the block comes back as its item. Not Han's own. */
export function pickUp(store, player) {
  const pos = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  if (isOwnStation(HAN_ID, store.dimension.id, pos)) return message(player, "§7That is Han's own Hanvil and Hammer. It stays in his house.");
  const park = parkAt(store.dimension.id, pos);
  if (park && !can(player, "build", park)) return message(player, denyText("build", park));
  const block = store.dimension.getBlock(pos);
  dropAll(store);
  store.remove();
  if (block?.typeId === HANVIL) {
    block.setType("minecraft:air");
    giveItem(player, HANVIL, 1);
  }
  message(player, "§6Hanvil and Hammer: §fpicked up.");
}

/** The block's own hooks: a Hanvil set down gets its store; one used while it has none gets it then. */
export function hanvilComponent() {
  return {
    onPlace(e) {
      ensureStore(e.block);
    },
    onPlayerInteract(e) {
      const block = e.block;
      const player = e.player;
      system.run(() => {
        try {
          if (block.isValid && block.typeId === HANVIL && !storeAt(block.dimension, block.location) && ensureStore(block) && player) message(player, "§6Hanvil and Hammer: §fready. Use it again and put two things in its first two slots.");
        } catch (error) {
          reportError("hanvil use", error);
        }
      });
    },
  };
}

/** The world events the Hanvil needs: two hits pick one up; Han brings his own to his house. */
export function wireHanvil() {
  // 0.1.311: a store coming back into the world is named at once, so its screen never reads "Unknown"
  world.afterEvents.entityLoad.subscribe((e) => {
    if (e.entity?.typeId === STORE) nameStore(e.entity);
  });
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const store = e.hitEntity;
    const player = e.damagingEntity;
    if (store?.typeId !== STORE || player?.typeId !== "minecraft:player" || !store.isValid) return;
    try {
      const key = `${store.dimension.id}|${store.id}`;
      const tick = system.currentTick;
      const first = hits.get(player.id);
      if (!first || first.key !== key || tick - first.tick > 60) {
        hits.set(player.id, { key, tick });
        if (!isOwnStation(HAN_ID, store.dimension.id, store.location)) message(player, "§7Hit it again to pick the Hanvil and Hammer up. What lies on it drops out.");
        return;
      }
      hits.delete(player.id);
      pickUp(store, player);
    } catch (error) {
      reportError("hanvil hit", error);
    }
  });
  bringsStation({
    id: HAN_ID,
    block: HANVIL,
    name: "Hanvil and Hammer",
    placed: (block) => ensureStore(block),
    cleared: (dimension, pos) => {
      const s = storeAt(dimension, pos);
      if (s) {
        dropAll(s);
        s.remove();
      }
    },
  });
}

/** Han on his Hanvil, by this player's friendship (his menu's "Ask about the Hanvil"). */
export function askHanvil(player) {
  message(player, say(hanvilLine(pointsOf(player), H())));
}

/**
 * Every half second, for what each player holds and wears: a reinforced piece's wear is paid back from its reserve
 * (and its lore put right if something else rewrote it); a plain piece with wear on it is marked as used, once.
 */
export function tickReinforced() {
  const g = H();
  for (const player of onlinePlayers()) {
    let eq;
    try {
      eq = player.getComponent("minecraft:equippable");
    } catch {
      continue;
    }
    if (!eq) continue;
    for (const slot of SLOTS) {
      try {
        const it = eq.getEquipment(slot);
        if (!it || it.maxAmount !== 1) continue;
        const r = read(it, 0);
        if (!r) continue;
        if (r.level > 0) {
          const back = refund(r.damage, r.pool, r.max, g);
          const mark = r.damage > 0 && !r.used;
          const pool = r.pool - back;
          if (!back && !mark && loreShows(it.getLore(), r.level, r.max, pool)) continue;
          if (back) {
            it.getComponent("minecraft:durability").damage = r.damage - back;
            it.setDynamicProperty(RF_POOL, pool);
          }
          if (mark) it.setDynamicProperty(USED, true);
          it.setLore(withLore(it.getLore(), r.level, r.max, pool));
          eq.setEquipment(slot, it);
        } else if (r.damage > 0 && !r.used) {
          it.setDynamicProperty(USED, true);
          eq.setEquipment(slot, it);
        }
      } catch (error) {
        reportError("reinforced", error);
      }
    }
  }
}

/** Every few seconds, everything each player carries: a piece with wear on it is marked as used, once. */
export function tickUsed() {
  for (const player of onlinePlayers()) {
    const c = containerOf(player);
    for (let i = 0; c && i < c.size; i++) {
      try {
        const it = c.getItem(i);
        if (!it || it.maxAmount !== 1) continue;
        const r = read(it, i);
        if (!r || !(r.damage > 0) || r.used) continue;
        it.setDynamicProperty(USED, true);
        c.setItem(i, it);
      } catch (error) {
        reportError("used", error);
      }
    }
  }
}

/** For the test server: what lies on a Hanvil as the rules read it. */
export function hanvilDebug(store, player) {
  const c = containerOf(store);
  const list = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    const r = it.maxAmount === 1 ? read(it, i) : undefined;
    list.push(`${i}:${it.typeId.replace("minecraft:", "")} x${it.amount}${r ? ` d${r.damage}/${r.max} L${r.level} p${r.pool}${r.used ? " used" : ""}${r.ash ? ` ash:${r.ash}` : ""}` : ""}`);
  }
  return { points: player ? pointsOf(player) : undefined, slots: list };
}
