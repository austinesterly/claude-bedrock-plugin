// Han Lock's Hanvil and Hammer in the world (0.1.305; the rules: equipment/hanvilRules.js). Austin's NPC #26 spec: "a
// custom, advanced crafting workstation ... an anvil and hammer constructed using bedrock ... indestructible ... uses a
// dedicated interaction or crafting interface", and "the player gains permission to use his Hanvil and Hammer" with
// friendship.
//  - The block can't be mined, blown up or pushed. Han hands it over to be set down in his smithy; whoever may build
//    where it stands moves it by sneaking and using it with an empty hand (it comes back as the item).
//  - Its page opens only at the block, and only for a player Han lets use it (their own friendship with him).
//  - Reinforcing: two matching unused pieces from the player's own inventory become one, a level higher.
//  - A reinforced piece held or worn has its wear paid back from its reserve (tickReinforced); a piece seen with wear
//    on it is marked as used for good (there, and in a slower look through everything carried: tickUsed).
import { system, EquipmentSlot, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message, giveItem, onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "../residents/bondRules.js";
import { bondOf } from "../residents/bonds.js";
import { parkAt, can, denyText } from "../park/park.js";
import { reportError } from "../core/log.js";
import { HAN_ID, HANVIL, RF_LEVEL, RF_POOL, USED, techniques, mayUse, hanvilLine, reinforcePlan, reinforced, refund, withLore, loreShows, levelText, maxAt, pieceName, WHY_WORDS, whyNot, EXPLOSIVE_ARROW, arrowBatches, ASH_MARK, ASH_SHOES, comboPlan, hatItem, withAshLore } from "./hanvilRules.js";

const H = () => BALANCE.hanvil;
const SLOTS = [EquipmentSlot.Mainhand, EquipmentSlot.Offhand, EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet];

const containerOf = (player) => {
  try {
    return player.getComponent("minecraft:inventory")?.container;
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

/** Reinforces the pair in a plan's row for the player. Returns { ok, text }. */
export function reinforce(player, row, at = undefined) {
  const c = containerOf(player);
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
  try {
    if (at) player.dimension.playSound("random.anvil_use", at);
  } catch {
    // no sound, no matter
  }
  return { ok: true, text: `§6Hanvil and Hammer: §ftwo ${ra.name}s ${row.level ? `(${levelText(row.level)}) ` : ""}folded into one, §6Reinforced ${levelText(next.level)}§f: durability ${maxAt(ra.max, next.level)} in place of ${ra.max}.` };
}

/** How many of each item a player carries. */
function countsOf(player) {
  const c = containerOf(player);
  const out = {};
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (it) out[it.typeId] = (out[it.typeId] ?? 0) + it.amount;
  }
  return out;
}

/** Takes n of an item from a container. False, and nothing taken, when there aren't n. */
function takeItems(c, id, n) {
  let have = 0;
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (it?.typeId === id) have += it.amount;
  }
  if (have < n) return false;
  let need = n;
  for (let i = 0; i < c.size && need > 0; i++) {
    const it = c.getItem(i);
    if (it?.typeId !== id) continue;
    const k = Math.min(need, it.amount);
    if (k >= it.amount) c.setItem(i, undefined);
    else {
      it.amount -= k;
      c.setItem(i, it);
    }
    need -= k;
  }
  return true;
}

/** 0.1.306: makes `batches` batches of Explosive Arrows from the TNT and arrows the player carries. Returns { ok, text }. */
export function makeArrows(player, batches, at = undefined) {
  const g = H().arrows;
  const c = containerOf(player);
  const n = Math.min(batches, arrowBatches(countsOf(player), g));
  if (!c || n < 1) return { ok: false, text: `§7That takes ${g.tnt} TNT and ${g.arrows} arrows for every ${g.makes} Explosive Arrows.` };
  if (!takeItems(c, "minecraft:tnt", n * g.tnt) || !takeItems(c, "minecraft:arrow", n * g.arrows)) return { ok: false, text: "§7The TNT and arrows aren't there as they were. Nothing was made." };
  let left = n * g.makes;
  while (left > 0) {
    const k = Math.min(64, left);
    const rest = c.addItem(new ItemStack(EXPLOSIVE_ARROW, k));
    if (rest) player.dimension.spawnItem(rest, player.location);
    left -= k;
  }
  try {
    if (at) player.dimension.playSound("random.anvil_use", at);
  } catch {
    // no sound, no matter
  }
  return { ok: true, text: `§6Hanvil and Hammer: §f${n * g.makes} Explosive Arrows made from ${n * g.tnt} TNT and ${n * g.arrows} arrows. §7Hold them in your off hand and shoot any bow: the arrow it fires blows up where it lands.` };
}

/** 0.1.307: everything a player carries, for joining Ash's pieces to armor. */
function everything(player) {
  const c = containerOf(player);
  const out = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    let ash;
    try {
      ash = it.maxAmount === 1 ? it.getDynamicProperty(ASH_MARK) : undefined;
    } catch {
      ash = undefined;
    }
    out.push({ slot: i, typeId: it.typeId, ash: typeof ash === "string" ? ash : undefined });
  }
  return out;
}

/**
 * 0.1.307: joins one of Ash's pieces to a piece of armor (a row of hanvilRules.js comboPlan). His shoes: the boots
 * stay the item they were and gain the shoes' mark. His hats: the helmet becomes the joined helmet's own item, with
 * the old helmet's wear, enchantments, name and properties moved onto it. Ash's piece is used up. Returns { ok, text }.
 */
export function combine(player, row, at = undefined) {
  const c = containerOf(player);
  if (!c) return { ok: false, text: "" };
  const ware = c.getItem(row.ware);
  const armor = c.getItem(row.armor);
  if (ware?.typeId !== row.wareId || armor?.typeId !== row.armorId || (row.kind === "shoes" && armor.getDynamicProperty(ASH_MARK) !== undefined)) {
    return { ok: false, text: "§7Those two pieces aren't both there as they were. Nothing was changed." };
  }
  let made;
  if (row.kind === "shoes") {
    const shoe = ASH_SHOES[row.wareId];
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
  try {
    if (at) player.dimension.playSound("random.anvil_use", at);
  } catch {
    // no sound, no matter
  }
  return { ok: true, text: `§6Hanvil and Hammer: §f${row.name}: §d${row.result}§f.` };
}

/** The Hanvil's page for a player who may use it. */
async function hanvilPage(player, at) {
  const g = H();
  const plan = reinforcePlan(carried(player));
  const lines = [
    "§fReinforcing: two of the same tool or armor piece, both never used and both at the same reinforcement, become one that lasts a tenth longer. Ten times over, it lasts twice as long.",
    "§7It adds durability only. A reinforced piece keeps its enchantments and its name; the second piece is used up, with anything on it.",
  ];
  if (!plan.rows.length) lines.push("§7You carry no two matching unused pieces now.");
  if (plan.alone.length) lines.push(`§8One of a kind (bring a second): ${plan.alone.slice(0, 6).map((x) => `${x.name}${x.level ? ` ${levelText(x.level)}` : ""}`).join(", ")}${plan.alone.length > 6 ? ", ..." : ""}`);
  if (plan.no.length) lines.push(`§8Can't be reinforced: ${plan.no.slice(0, 6).map((x) => `${x.name} (${WHY_WORDS[x.why]})`).join(", ")}${plan.no.length > 6 ? ", ..." : ""}`);
  const techs = techniques(pointsOf(player), g);
  const arrowsOpen = techs.find((t) => t.key === "arrows")?.open;
  const batches = arrowsOpen ? arrowBatches(countsOf(player), g.arrows) : 0;
  if (arrowsOpen) lines.push(`§fExplosive Arrows: ${g.arrows.tnt} TNT and ${g.arrows.arrows} arrows make ${g.arrows.makes}. Held in your off hand, they arm the arrow any bow fires: it blows up where it lands and breaks blocks (never in or beside a zoo). Each shot uses one.${batches ? "" : " §7You carry too little TNT or too few arrows now."}`);
  const ashOpen = techs.find((t) => t.key === "ash")?.open;
  const combos = ashOpen ? comboPlan(everything(player)).slice(0, g.maxRows) : [];
  if (ashOpen) lines.push(`§fAsh's pieces on armor: his shoes go onto any of the game's boots, which then give the shoes' effect while worn and stay the boots they were. His hats go onto a helmet, which keeps its armor and durability and looks like the hat. Ash's piece is used up.${combos.length ? "" : " §7You carry no piece of his with armor it fits now."}`);
  const next = techs.find((t) => !t.open);
  if (next) lines.push(`§8Han has more to teach at ${next.at} friendship.`);
  const form = new ActionFormData().title("Hanvil and Hammer").body(lines.join("\n\n"));
  const rows = plan.rows.slice(0, g.maxRows);
  for (const r of rows) form.button(`Reinforce ${r.name}\n§8${r.level ? levelText(r.level) : "plain"} to ${levelText(r.next)}, uses both`);
  const makes = [];
  if (batches >= 1) makes.push(1);
  if (batches >= 2) makes.push(batches);
  for (const n of makes) form.button(`Make ${n * g.arrows.makes} Explosive Arrows\n§8${n * g.arrows.tnt} TNT and ${n * g.arrows.arrows} arrows`);
  for (const r of combos) form.button(`Join ${r.name}\n§8${r.result}`);
  form.button("Close");
  const res = await show(player, form);
  const pick = res.selection;
  if (res.canceled || pick === undefined || pick >= rows.length + makes.length + combos.length) return;
  const out = pick < rows.length ? reinforce(player, rows[pick], at) : pick < rows.length + makes.length ? makeArrows(player, makes[pick - rows.length], at) : combine(player, combos[pick - rows.length - makes.length], at);
  if (out.text) message(player, out.text);
  if (out.ok) await hanvilPage(player, at);
}

/** The Hanvil used by a player: its page, or Han's refusal. Returns what happened (for the test server). */
export function useHanvil(player, block) {
  const g = H();
  const at = { x: block.x + 0.5, y: block.y + 0.5, z: block.z + 0.5 };
  let hand;
  try {
    hand = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  } catch {
    hand = undefined;
  }
  if (player.isSneaking && !hand) {
    const park = parkAt(block.dimension.id, block.location);
    if (park && !can(player, "build", park)) {
      message(player, denyText("build", park));
      return "denied";
    }
    block.setType("minecraft:air");
    giveItem(player, HANVIL, 1);
    message(player, "§6Hanvil and Hammer: §fpicked up. Set it down again where it should stand.");
    return "picked up";
  }
  if (!mayUse(pointsOf(player), g)) {
    message(player, `${say("hanvilNo")} §8(${g.at.reinforce} friendship with Han Lock to use it)`);
    return "locked";
  }
  hanvilPage(player, at).catch((error) => reportError("hanvil", error));
  return "open";
}

export function hanvilComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const block = e.block;
      system.run(() => {
        try {
          if (block.isValid && block.typeId === HANVIL) useHanvil(player, block);
        } catch (error) {
          reportError("hanvil use", error);
        }
      });
    },
  };
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

/** For the test server: what a player carries as the rules read it, and the plan. */
export function hanvilDebug(player) {
  const list = carried(player);
  return { combos: comboPlan(everything(player)), points: pointsOf(player), carried: list.map((r) => `${r.slot}:${r.typeId.replace("minecraft:", "")} d${r.damage}/${r.max} L${r.level} p${r.pool}${r.used ? " used" : ""}${r.ash ? ` ash:${r.ash}` : ""}`), plan: reinforcePlan(list) };
}
