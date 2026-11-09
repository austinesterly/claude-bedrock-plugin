import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { residentById, PLEASED, BOTHERED } from "../data/residents.js";
import { getResident, residentState, todayMet, followWhy, followMe, stayHere, stopFollowing, sendHome, canSendHome } from "../residents/residents.js";
import { bondOf, haveChat, giveGift, giftedToday } from "../residents/bonds.js";
import { tierOf, friendshipText, nextTierText, tierUpText, followLockText, followLockLong, chatLine, bondLine, giftLine, gainText, canGift } from "../residents/bondRules.js";
import { doingText, talkLine } from "../residents/residentRules.js";
import { weatherNow } from "../core/weather.js";
import { residentPage } from "./mailboxMenu.js";
import { message } from "../platform/mc.js";

// A resident's menu (0.1.223, stage C of Austin's residents spec, section 7: research/npc_spec_plan.md section 7),
// opened by using them: a word from them, your friendship, and Talk, Give a Gift, Follow Me (Stay Here, Stop
// Following), Go Home and their page (Friendship and About). A button that can't be used yet says why on it, and
// pressing it says so in full. Each answer is re-checked before anything happens (the resident may have moved on).

const quote = (line) => `§f"${line}"`;

/** The menu for a resident, for one player. */
export async function residentMenu(player, id) {
  const rec = getResident(id);
  const res = residentById(id);
  if (!rec || !res) return;
  const g = BALANCE.residents;
  const gb = g.bonds;
  const day = world.getDay();
  const b = bondOf(id, player.id);
  const s = residentState(rec);
  const you = s.leaderId === player.id;
  const line = talkLine(res, rec.state, todayMet(rec), Math.random, g, PLEASED, BOTHERED);
  const next = nextTierText(b.points, gb);
  const body = [
    quote(line),
    "",
    `§7Friendship: §f${friendshipText(b.points, gb)}${next ? ` §8(${next})` : ""}`,
    `§7Right now: ${doingText(s.state, s.phase, { ...s, you })}.`,
  ].join("\n");
  const form = new ActionFormData().title(res.name).body(body);
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  const asleep = rec.state === "asleep";
  add(asleep ? "Talk\n§8They're asleep" : "Talk", () => talkTo(player, id));
  add(asleep ? "Give a Gift\n§8They're asleep" : giftedToday(id, player.id, day) ? "Give a Gift\n§8Already had one from you today" : "Give a Gift", () => giftMenu(player, id));
  if (rec.state === "following" && you) {
    add("Stay Here", () => {
      const now = getResident(id);
      if (now && stayHere(player, now)) message(player, `§f${res.name}: §7"${bondLine(res, "stay")}"`);
    });
    add("Stop Following", () => {
      const now = getResident(id);
      if (now && stopFollowing(player, now)) message(player, `§f${res.name}: §7"${bondLine(res, "stop")}"`);
    });
  } else {
    const why = followWhy(player, rec);
    add(why ? `Follow Me\n§8${followLockText(why, { points: b.points, leaderName: s.leader }, gb)}` : "Follow Me", () => askFollow(player, id));
    if (rec.state === "staying") {
      add("Stop Following\n§8Back to their day", () => {
        const now = getResident(id);
        if (now && stopFollowing(player, now)) message(player, `§f${res.name}: §7"${bondLine(res, "stop")}"`);
      });
    }
  }
  if (canSendHome(rec) && !(rec.state === "following" && !you)) add("Go Home", () => askHome(player, id));
  add(`Friendship and About`, () => residentPage(player, id));
  add("Goodbye", () => {});
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

// Talk: a chat (the first of the day counts for friendship), as long as they like.
async function talkTo(player, id) {
  const res = residentById(id);
  let rec = getResident(id);
  if (!rec || !res) return;
  const g = BALANCE.residents;
  const day = world.getDay();
  let counted = false;
  for (;;) {
    rec = getResident(id);
    if (!rec) return;
    const everyday = () => talkLine(res, rec.state, todayMet(rec), Math.random, g, PLEASED, BOTHERED);
    let note = "";
    let line;
    if (rec.state === "asleep") line = everyday();
    else {
      const before = bondOf(id, player.id);
      const c = haveChat(player, res, day);
      line = chatLine(res, { state: rec.state, tier: tierOf(before.points, g.bonds), first: c.first, weather: weatherNow() }, Math.random, g.bonds, everyday);
      if (!counted) note = c.gain ? `§a${gainText(c.gain)} §8(${friendshipText(c.bond.points, g.bonds)})` : "§8You've had today's chat: friendship grows with the first each day.";
      counted = true;
      if (c.tierUp !== undefined) message(player, `§a${tierUpText(res.name, c.tierUp, g.bonds)}`);
    }
    const form = new ActionFormData().title(res.name).body([quote(line), note ? "" : undefined, note || undefined].filter((x) => x !== undefined).join("\n"));
    form.button("Keep Talking");
    form.button("Back");
    form.button("Goodbye");
    const r = await show(player, form);
    if (r?.selection === 0) continue;
    if (r?.selection === 1) return residentMenu(player, id);
    return;
  }
}

// The kinds of item a player could give (one of each kind in the list; their amounts summed), the order they're carried.
export function giftable(player) {
  const out = new Map();
  let c;
  try {
    c = player.getComponent("minecraft:inventory")?.container;
  } catch {
    c = undefined;
  }
  if (!c) return [];
  for (let i = 0; i < c.size; i++) {
    let it;
    try {
      it = c.getItem(i);
    } catch {
      it = undefined;
    }
    if (!it || !canGift(it.typeId)) continue;
    const had = out.get(it.typeId);
    if (had) had.amount += it.amount;
    else out.set(it.typeId, { typeId: it.typeId, key: it.localizationKey, name: it.nameTag, amount: it.amount });
  }
  return [...out.values()];
}

// Takes one of an item from a player, from the first stack of it they carry. False when they don't have one any more.
export function takeOne(player, typeId) {
  const c = player.getComponent("minecraft:inventory")?.container;
  if (!c) return false;
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it || it.typeId !== typeId) continue;
    if (it.amount > 1) {
      it.amount -= 1;
      c.setItem(i, it);
    } else c.setItem(i, undefined);
    return true;
  }
  return false;
}

// Give a Gift: pick one of the things you carry; one is given, and how they take it shows.
async function giftMenu(player, id) {
  const res = residentById(id);
  const rec = getResident(id);
  if (!rec || !res) return;
  const g = BALANCE.residents;
  const day = world.getDay();
  if (rec.state === "asleep") return message(player, `§7${res.name} is asleep. Bring it when they're up.`);
  if (giftedToday(id, player.id, day)) return message(player, `§f${res.name}: §7"${bondLine(res, "again")}" §8(one gift a day from each player)`);
  const items = giftable(player).slice(0, g.bonds.giftsShown);
  if (!items.length) return message(player, `§7You have nothing to give ${res.name}.`);
  const form = new ActionFormData().title(`A gift for ${res.name}`).body(`§7Pick something to give ${res.name}. One of it is given. Things they like count most for friendship, things they don't like count against it.`);
  for (const it of items) form.button(it.name ? `${it.name}\n§8x${it.amount}` : { rawtext: [{ translate: it.key }, { text: `\n§8x${it.amount}` }] });
  form.button("Back");
  const r = await show(player, form);
  if (!r || r.selection === undefined) return;
  if (r.selection >= items.length) return residentMenu(player, id);
  const pick = items[r.selection];
  // Re-checked: still awake, not given today, and still carried.
  const now = getResident(id);
  if (!now || now.state === "asleep" || giftedToday(id, player.id, world.getDay())) return;
  const has = giftable(player).some((x) => x.typeId === pick.typeId);
  if (!has) return message(player, "§7You don't have that any more.");
  const answer = giveGift(player, res, pick.typeId, world.getDay());
  if (!answer.ok) return message(player, `§f${res.name}: §7"${bondLine(res, "again")}"`);
  if (!takeOne(player, pick.typeId)) return;
  const note = `${answer.gain > 0 ? "§a" : answer.gain < 0 ? "§c" : "§7"}${gainText(answer.gain)} §8(${friendshipText(answer.bond.points, g.bonds)})`;
  if (answer.tierUp !== undefined) message(player, `§a${tierUpText(res.name, answer.tierUp, g.bonds)}`);
  const done = new ActionFormData().title(res.name).body([quote(giftLine(res, answer.kind, answer.tags)), "", note].join("\n"));
  done.button("Back");
  done.button("Goodbye");
  const d = await show(player, done);
  if (d?.selection === 0) return residentMenu(player, id);
}

// Follow Me: they come along, or say why not.
function askFollow(player, id) {
  const res = residentById(id);
  const rec = getResident(id);
  if (!rec || !res) return;
  const why = followMe(player, rec);
  if (!why) return message(player, `§f${res.name}: §7"${bondLine(res, "follow")}" §8(they follow you until you ask them to stop, or until their bedtime)`);
  const b = bondOf(id, player.id);
  const s = residentState(rec);
  if (why === "friendship") message(player, `§f${res.name}: §7"${bondLine(res, "followNo")}"`);
  message(player, `§7${followLockLong(why, res.name, { points: b.points, leaderName: s.leader }, BALANCE.residents.bonds)}`);
}

// Go Home: home now, or why not.
function askHome(player, id) {
  const res = residentById(id);
  const rec = getResident(id);
  if (!rec || !res) return;
  const why = sendHome(player, rec);
  if (!why) return message(player, `§f${res.name}: §7"${bondLine(res, "goHome")}"`);
  message(player, why === "house" ? `§e${res.name}'s home needs fixing first. Use their Resident Mailbox to see what it needs.` : why === "other" ? `§7${res.name} is with someone else just now.` : `§7${res.name} isn't out just now.`);
}
