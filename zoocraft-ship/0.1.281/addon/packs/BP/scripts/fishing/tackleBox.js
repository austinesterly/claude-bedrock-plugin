// The Tackle Box and Jack's tackle (0.1.271; the rules: fishing/rodRules.js, the numbers: data/balance.js `rods`).
//
// Austin, 12 Nov 18:45: "a custom fishing workbench that looks like a tackle box (not a full block). In its menu you
// put a new rod in and select its lure." Its page opens only at the box: the rods you carry that take tackle (the
// Steel Rod and the Deep Sea Rod), each with the lure it has on. Pick one, then a lure you carry to put on it (the one
// it had comes back to you), or Take it off. A rod holds one lure, and a lure never wears out. The lure is kept on the
// rod itself (an item property, and a line of its lore), so it goes where the rod goes.
// The box also makes the three lures from simple things you carry (rods.make), and Jack sells them on his menu from
// Friend (rods.shop), paid from the park's Zoo Coins as Guido's upgrades are. 0.1.281: and a spare Steel Rod, once he's
// given you his at 100 friendship (nothing crafts one now).
import { system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "../residents/bondRules.js";
import { spend } from "../economy/economy.js";
import { coinsText } from "../economy/bankRules.js";
import { newId } from "../core/ids.js";
import { getPark, parkAt, withPark, can, denyText } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";
import { reportError } from "../core/log.js";
import { rodOf, LURES, LURE_KEY, lureOf, lureLore, missingFor, STEEL_ROD } from "./rodRules.js";
import { bondOf } from "../residents/bonds.js";
import { rewardsEarned } from "../residents/rewardRules.js";

const R = () => BALANCE.rods;
/** "a Spoon", "an Artificial Worm". */
const an = (name) => (/^[aeiou]/i.test(name) ? `an ${name}` : `a ${name}`);

// The things lures are made of, by name (the pages are in English, as the rest of ZooCraft's).
export const THING_NAMES = {
  "minecraft:iron_nugget": "Iron Nugget",
  "minecraft:gold_nugget": "Gold Nugget",
  "minecraft:string": "String",
  "minecraft:slime_ball": "Slimeball",
  "minecraft:pink_dye": "Pink Dye",
};

/** "2 Iron Nuggets and 1 Gold Nugget": a list of [item, n] in words. */
export function thingsText(list) {
  const words = list.map(([id, n]) => {
    const name = THING_NAMES[id] ?? id.replace(/^minecraft:/, "").replace(/_/g, " ");
    return `${n} ${n === 1 ? name : name.endsWith("s") ? name : `${name}s`}`;
  });
  return words.length > 1 ? `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}` : words[0] ?? "nothing";
}

const containerOf = (player) => {
  try {
    return player.getComponent("minecraft:inventory")?.container;
  } catch {
    return undefined;
  }
};

/** How many of each item a player carries. */
export function countsOf(player) {
  const c = containerOf(player);
  const out = {};
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (it) out[it.typeId] = (out[it.typeId] ?? 0) + it.amount;
  }
  return out;
}

/** Takes `n` of an item from a container, from the first slots on. False (and nothing taken) when there aren't n. */
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
    if (it.amount > need) {
      it.amount -= need;
      c.setItem(i, it);
      need = 0;
    } else {
      need -= it.amount;
      c.setItem(i, undefined);
    }
  }
  return true;
}

/** Puts an item in a player's pack, or at their feet when it's full. */
function give(player, id, n = 1) {
  const c = containerOf(player);
  let left = new ItemStack(id, n);
  try {
    left = c ? c.addItem(left) : left;
  } catch {
    // the pack can't take it
  }
  if (left) {
    try {
      player.dimension.spawnItem(left, player.location);
    } catch {
      // nowhere to put it
    }
  }
}

/** The lure on a rod item, or undefined. */
export function lureOn(item) {
  try {
    return lureOf(item?.getDynamicProperty(LURE_KEY));
  } catch {
    return undefined;
  }
}

/** A rod item as the page saw it: still the same rod in that slot when its answer comes back. */
function fingerprint(it) {
  let damage = 0;
  try {
    damage = it.getComponent("minecraft:durability")?.damage ?? 0;
  } catch {
    damage = 0;
  }
  return `${it.typeId}|${damage}|${lureOn(it)?.id ?? ""}|${it.nameTag ?? ""}`;
}

/** The rods a player carries that take tackle: [{ slot, rod, label, tackle, fp }]. */
export function tackleRods(player) {
  const c = containerOf(player);
  const out = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    const rod = rodOf(it?.typeId);
    if (!rod?.tackle) continue;
    out.push({ slot: i, rod, label: it.nameTag || rod.name, tackle: lureOn(it), fp: fingerprint(it) });
  }
  return out;
}

/**
 * A lure on (or, with no `pick`, off) the rod still in that slot: one taken from the pack, the one it had handed back.
 * Returns the line to show.
 */
export function putOn(player, r, pick) {
  const c = containerOf(player);
  const it = c?.getItem(r.slot);
  if (!it || fingerprint(it) !== r.fp) return "§7That rod moved before the lure went on, so nothing changed. Try again.";
  const on = lureOn(it);
  if (!pick && !on) return `§7Your ${r.label} has no lure on.`;
  if (pick && on?.id === pick.id) return `§7Your ${r.label} already has ${an(pick.name)} on.`;
  if (pick && !takeItems(c, pick.id, 1)) return `§7You have no ${pick.name} left.`;
  it.setDynamicProperty(LURE_KEY, pick ? pick.id : undefined);
  it.setLore(lureLore(pick));
  c.setItem(r.slot, it);
  if (on) give(player, on.id, 1);
  try {
    player.playSound("random.click", { volume: 0.4, pitch: 1.4 });
  } catch {
    // no sound
  }
  if (!pick) return `§7You take the ${on.name} off your ${r.label}. It's back in your pack.`;
  return `§aYour ${r.label} now has ${an(pick.name)} on.${on ? ` §7The ${on.name} is back in your pack.` : ""}`;
}

/** One lure made from what the player carries (rods.make). Returns the line to show. */
export function makeLure(player, lure) {
  const cost = R().make[lure.id];
  const c = containerOf(player);
  if (!c || !cost) return "§7Nothing to make that from.";
  const miss = missingFor(countsOf(player), cost);
  if (miss.length) return `§7To make ${an(lure.name)} you need ${thingsText(miss)} more.`;
  for (const [id, n] of cost) takeItems(c, id, n);
  give(player, lure.id, 1);
  try {
    player.playSound("random.click", { volume: 0.4, pitch: 1.1 });
  } catch {
    // no sound
  }
  return `§aYou make ${an(lure.name)}.`;
}

async function rodPage(player, r) {
  const have = countsOf(player);
  const lures = Object.values(LURES).filter((l) => (have[l.id] ?? 0) > 0);
  const body = [`§7On it now: §f${r.tackle ? r.tackle.name : "no lure"}`];
  if (r.tackle) body.push(`§8${r.tackle.does}`);
  body.push("", lures.length ? "§7Pick a lure to put on. The one it has comes back to you." : "§8You carry no lures. Make one at the box, or buy them from Jack.");
  const form = new ActionFormData().title(r.label).body(body.join("\n"));
  for (const l of lures) form.button(`${l.name} §8(${have[l.id]})\n§8${l.short}`);
  const off = Boolean(r.tackle);
  if (off) form.button("Take it off");
  form.button("Back");
  const res = await show(player, form);
  if (res?.selection === undefined) return;
  if (res.selection < lures.length) return message(player, putOn(player, r, lures[res.selection]));
  if (off && res.selection === lures.length) return message(player, putOn(player, r, undefined));
  return tackleBoxPage(player);
}

async function makePage(player) {
  const have = countsOf(player);
  const list = Object.values(LURES);
  const form = new ActionFormData().title("Make a lure").body("§7Each one is made from things you carry. A lure never wears out.");
  for (const l of list) {
    const cost = R().make[l.id];
    form.button(`${l.name}\n${missingFor(have, cost).length ? "§8" : "§2"}${thingsText(cost)}`);
  }
  form.button("Back");
  const res = await show(player, form);
  if (res?.selection === undefined) return;
  if (res.selection < list.length) {
    message(player, makeLure(player, list[res.selection]));
    return makePage(player);
  }
  return tackleBoxPage(player);
}

/** The Tackle Box's page: your rods that take tackle, and making lures. */
export async function tackleBoxPage(player) {
  const rods = tackleRods(player);
  const body = ["§7Pick a rod to change its lure. A rod holds one lure, and a lure never wears out."];
  if (!rods.length) body.push("", "§8You carry no rod that takes tackle: a Steel Rod or a Deep Sea Rod.");
  const form = new ActionFormData().title("Tackle Box").body(body.join("\n"));
  for (const r of rods) form.button(`${r.label}\n§8${r.tackle ? `Lure: ${r.tackle.name}` : "No lure"}`);
  form.button("Make a lure");
  form.button("Close");
  const res = await show(player, form);
  if (res?.selection === undefined) return;
  if (res.selection < rods.length) return rodPage(player, rods[res.selection]);
  if (res.selection === rods.length) return makePage(player);
}

/** The custom component on the Tackle Box block: use it and its page opens. */
export function tackleBoxComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      system.run(() => tackleBoxPage(player).catch((error) => reportError("tackle box", error)));
    },
  };
}

// --- Jack's tackle (on his menu from Friend)

/** The park a purchase is paid from: the one the player stands in, or the only one. */
function parkHere(player) {
  try {
    return parkAt(player.dimension.id, player.location) ?? getPark();
  } catch {
    return getPark();
  }
}

/** Whether Jack has given this player his Steel Rod (0.1.281: then he sells spares). */
export function hasJacksRod(player) {
  return rewardsEarned(residentById("jack"), bondOf("jack", player.id)).some((r) => r.item === STEEL_ROD);
}

/** A lure (0.1.281: or a spare Steel Rod) bought from Jack: paid once from the park's coins, then handed over. Returns the line to show. */
export function buyLure(player, lure, park = parkHere(player)) {
  const cost = R().shop.price[lure.id];
  if (!park) return "§7There's no park here to pay from.";
  if (!can(player, "spend", park)) return denyText("spend", park);
  const res = withPark(park, () => spend(player, cost, `Jack: ${lure.name}`, newId("lure")));
  if (!res?.ok) return `§cNot enough Zoo Coins: ${an(lure.name)} costs ${coinsText(cost)} and the park has ${coinsText(park.balance ?? 0)}.`;
  give(player, lure.id, 1);
  return `§fJack: §7"${bondLine(residentById("jack"), "tackleDone")}" §aYou buy ${an(lure.name)}.`;
}

/** Jack's tackle page: the three lures for the park's coins (0.1.281: and a spare Steel Rod once he's given you his). */
export async function tackleShop(player) {
  const park = parkHere(player);
  const free = Boolean(park && sandboxOn(park));
  const P = R().shop.price;
  const rod = hasJacksRod(player);
  const list = [...Object.values(LURES), ...(rod ? [{ ...rodOf(STEEL_ROD), short: "A spare: it lasts three times a wooden rod's uses" }] : [])];
  const body = [`§fJack: §7"${bondLine(residentById("jack"), "tackleLook")}"`, ""];
  body.push(!park ? "§7There's no park here to pay from." : free ? "§7Free in sandbox." : `§7Paid from the park's Zoo Coins. The park has ${coinsText(park.balance ?? 0)}.`);
  if (!rod) body.push("§8Lures go on a Steel Rod or a Deep Sea Rod, at a Tackle Box. Jack gives you his Steel Rod at 100 friendship.");
  const form = new ActionFormData().title("Jack's Tackle").body(body.join("\n"));
  for (const l of list) form.button(`${l.name}: ${free ? "free" : coinsText(P[l.id])}\n§8${l.short}`);
  form.button("Back");
  const res = await show(player, form);
  if (res?.selection === undefined || res.selection >= list.length) return;
  message(player, buyLure(player, list[res.selection], park));
}

/** For the test server: a player's tackle rods and lures. */
export function tackleDebug(player) {
  return { rods: tackleRods(player).map((r) => ({ slot: r.slot, rod: r.rod.id, lure: r.tackle?.id })), lures: Object.keys(LURES).map((id) => [id, countsOf(player)[id] ?? 0]) };
}

