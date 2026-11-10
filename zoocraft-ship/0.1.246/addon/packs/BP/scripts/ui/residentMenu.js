import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { residentById, PLEASED, BOTHERED } from "../data/residents.js";
import { getResident, residentState, todayMet, followWhy, followMe, stayHere, stopFollowing, sendHome, canSendHome, talkStart, talkEnd, lookingAt } from "../residents/residents.js";
import { CHATS } from "../data/residentChats.js";
import { CREEPED } from "../data/residentCreeped.js";
import { dayPart, lookArea, chatStatus, chatPick, remember, freshOf } from "../residents/chatRules.js";
import { bondOf, haveChat, giveGift, giftedToday } from "../residents/bonds.js";
import { tierOf, friendshipText, nextTierText, tierUpText, followLockText, followLockLong, followLockNote, bondLine, giftLine, gainText, canGift } from "../residents/bondRules.js";
import { doingText, talkLine } from "../residents/residentRules.js";
import { weatherNow } from "../core/weather.js";
import { residentPage } from "./mailboxMenu.js";
import { message } from "../platform/mc.js";
import { giftFor, handOver } from "../residents/workGifts.js";
import { rewardFor, handReward, copyAgain, carriesBook } from "../residents/rewards.js";
import { rewardsEarned } from "../residents/rewardRules.js";
import { ADVICE } from "../data/residentAdvice.js";
import { advicePage } from "./adviceMenu.js";
import { lessonsMenu, TEACHER } from "./lessonMenu.js";
import { talkTitle, portraitOf, talkInk, talkButton, heartsOf, moodFor } from "./talkRules.js";

// A resident's menu (0.1.223, stage C of Austin's residents spec, section 7: research/npc_spec_plan.md section 7),
// opened by using them: a word from them, your friendship, and Talk, Give a Gift, Follow Me (Stay Here, Stop
// Following), Go Home and their page (Friendship and About). A button that can't be used yet says why on it, and
// pressing it says so in full. Each answer is re-checked before anything happens (the resident may have moved on).

// 0.1.229 (Austin: "I also want a custom UI for NPC interactions. Make it similar to stardew valleys"): the menu, a
// chat and a gift's answer are shown on the talk screen (ui/talkRules.js; RP ui/server_form.json): their words in a
// wide box, their portrait and name beside them, the choices above. /zoocraft:talkscreen false puts the plain menus
// back for the world (a way out if a game update ever breaks the screen).
const CLASSIC = "zoocraft:talk_classic";

/** Whether residents' menus use the talk screen in this world (true unless it was switched off). */
export function talkScreenOn() {
  try {
    return world.getDynamicProperty(CLASSIC) !== true;
  } catch {
    return true;
  }
}

/** The talk screen on or off for the world. */
export function setTalkScreen(on) {
  world.setDynamicProperty(CLASSIC, on ? undefined : true);
}

const quote = (line, ink) => `${ink.say}"${line}"`;

// 0.1.230: what each resident said to each player lately (`${resident}|${player}` -> lines), so a chat isn't the line
// they just said. Kept while the world is open.
const said = new Map();

/**
 * The line for a chat that counted (0.1.230; `c` is haveChat's answer, `tier` the friendship before it): their
 * introduction the first time ever; "that's plenty for today" on the last chat of the day and a telling-off past it
 * (chatRules.js chatStatus); else one for what they're looking at, the time of day, the friendship, the rain or their
 * day (chatPick). Returns { line, status }.
 */
export function chatFor(player, res, rec, c, tier, everyday) {
  const gc = BALANCE.residents.chats;
  const key = `${res.id}|${player.id}`;
  const recent = said.get(key) ?? [];
  const chats = CHATS[res.id];
  const status = c.first ? "ok" : chatStatus(c.bond.dayTalks ?? 1, res, gc);
  let line;
  if (c.first) line = bondLine(res, "intro");
  else if (status !== "ok") line = freshOf(chats?.[status], recent, Math.random) ?? everyday();
  else {
    const w = weatherNow();
    const area = lookArea(lookingAt(res.id), Math.random, gc);
    line = chatPick(chats, res.lines, { part: dayPart(world.getTimeOfDay(), gc), tier, area, raining: (w === "Rain" || w === "Thunder") && (rec.state === "inside" || rec.state === "visiting"), recent }, Math.random, gc, everyday).line;
  }
  said.set(key, remember(recent, line, gc));
  return { line, status };
}

// 0.1.228 (Austin: "NPCs should stop when they talk to you"): while a page of their menu is open they stand still,
// facing the player (residents/residents.js talkStart, talkEnd).
async function held(player, id, open) {
  talkStart(id, player);
  try {
    return await open();
  } finally {
    talkEnd(id, player);
  }
}
const showTo = (player, id, form) => held(player, id, () => show(player, form));

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
  const story = talkScreenOn();
  const ink = talkInk(story);
  // The talk screen's box holds seven lines: no blank line, and the next tier is on their Friendship page.
  const body = (story
    ? [quote(line, ink), `${ink.plain}Friendship: ${friendshipText(b.points, gb)}`, `${ink.plain}Right now: ${doingText(s.state, s.phase, { ...s, you })}.`]
    : [quote(line, ink), "", `${ink.plain}Friendship: ${ink.name}${friendshipText(b.points, gb)}${next ? ` §8(${next})` : ""}`, `${ink.plain}Right now: ${doingText(s.state, s.phase, { ...s, you })}.`]
  ).join("\n");
  const form = new ActionFormData().title(talkTitle(res.name, story, heartsOf(b.points, gb.max))).body(body);
  const actions = [];
  // A button: `note` { text, good } is its second line on the plain menu; on the talk screen see talkRules.js talkButton.
  // The first button carries their portrait for the talk screen.
  const add = (label, fn, note, short) => {
    form.button(talkButton(label, note, story, short), story && !actions.length ? portraitOf(id) : undefined);
    actions.push(fn);
  };
  const asleep = rec.state === "asleep";
  add("Talk", () => talkTo(player, id), asleep ? { text: "They're asleep" } : (giftFor(id, player.id) || rewardFor(res, player.id)) ? { text: "They have something for you", good: true } : undefined, "a gift for you!");
  add("Give a Gift", () => giftMenu(player, id), asleep ? { text: "They're asleep" } : giftedToday(id, player.id, day) ? { text: "Already had one from you today" } : undefined);
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
    add("Follow Me", () => askFollow(player, id), why ? { text: followLockText(why, { points: b.points, leaderName: s.leader }, gb) } : undefined);
    if (rec.state === "staying") {
      add(story ? "Stop Following" : "Stop Following\n§8Back to their day", () => {
        const now = getResident(id);
        if (now && stopFollowing(player, now)) message(player, `§f${res.name}: §7"${bondLine(res, "stop")}"`);
      });
    }
  }
  if (canSendHome(rec) && !(rec.state === "following" && !you)) add("Go Home", () => askHome(player, id));
  // 0.1.243: a friendship reward they've earned and don't carry: another copy for the asking
  const earned = rewardsEarned(res, b).find((r) => r.book); // a reward that is a thing is asked for on their advice page
  if (earned && !asleep && !carriesBook(player, earned.book)) {
    add(story ? "Ask for the book" : "Ask for the book\n§8Another copy", () => {
      const again = copyAgain(player, res);
      if (again) message(player, `§f${res.name}: §7"${again.line}" §aThey give you ${again.name}${again.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.`);
    });
  }
  // 0.1.245: what they teach by friendship (Terra), and their plans to ask for again
  if (res.advice && ADVICE[id] && !asleep) add(ADVICE[id].button, () => held(player, id, () => advicePage(player, id)));
  // 0.1.246: the teacher's lessons for the player
  if (res.lessons && id === TEACHER && !asleep) add("Lessons", () => held(player, id, () => lessonsMenu(player)));
  add(`Friendship and About`, () => held(player, id, () => residentPage(player, id)));
  add("Goodbye", () => {});
  const r = await showTo(player, id, form);
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
    let got; // 0.1.226: a work gift they kept for you, handed over as the first chat starts
    let status = "ok"; // 0.1.230: "enough" on the day's last chat, "toldOff" past it
    let gain = 0; // 0.1.232: for their face
    if (rec.state === "asleep") line = everyday();
    else {
      if (!counted) got = handOver(player, res) ?? handReward(player, res); // 0.1.243: or their friendship reward
      const before = bondOf(id, player.id);
      const c = haveChat(player, res, day);
      ({ line, status } = chatFor(player, res, rec, c, tierOf(before.points, g.bonds), everyday));
      if (!counted) note = c.gain ? `§a${gainText(c.gain)} §8(${friendshipText(c.bond.points, g.bonds)})` : "§8You've had today's chat: friendship grows with the first each day.";
      counted = true;
      gain = c.gain ?? 0;
      if (c.tierUp !== undefined) message(player, `§a${tierUpText(res.name, c.tierUp, g.bonds)}`);
    }
    if (got) line = got.line;
    const story = talkScreenOn();
    const ink = talkInk(story);
    if (story) note = note.replace("§a", ink.good);
    const gap = story ? "" : "\n"; // the blank line the plain menu has room for
    const text = [quote(line, ink), note && !story ? "" : undefined, note || undefined].filter((x) => x !== undefined).join("\n");
    const body = got
      ? { rawtext: [{ text: `${quote(line, ink)}\n${gap}${ink.good}They give you ${got.name ? "" : `${got.count} `}` }, got.name ? { text: got.name } : { translate: got.key }, { text: `${got.dropped ? " §8(at your feet: your inventory is full)" : ""}${note ? `\n${note}` : ""}` }] }
      : text;
    const form = new ActionFormData().title(talkTitle(res.name, story, heartsOf(bondOf(id, player.id).points, g.bonds.max))).body(body);
    // Told off: there's no Keep Talking until tomorrow.
    const more = status !== "toldOff";
    const face = story ? portraitOf(id, moodFor({ status, gain, gift: Boolean(got) })) : undefined; // 0.1.232: happy, cross or plain
    if (more) form.button("Keep Talking", face);
    form.button("Back", more ? undefined : face);
    form.button("Goodbye");
    const r = await showTo(player, id, form);
    if (r?.selection === undefined) return;
    const pick = r.selection + (more ? 0 : 1);
    if (pick === 0) continue;
    if (pick === 1) return residentMenu(player, id);
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
  const r = await showTo(player, id, form);
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
  const story = talkScreenOn();
  const ink = talkInk(story);
  const note = `${answer.gain > 0 ? ink.good : answer.gain < 0 ? ink.bad : ink.plain}${gainText(answer.gain)} §8(${friendshipText(answer.bond.points, g.bonds)})`;
  if (answer.tierUp !== undefined) message(player, `§a${tierUpText(res.name, answer.tierUp, g.bonds)}`);
  const done = new ActionFormData().title(talkTitle(res.name, story, heartsOf(answer.bond.points, g.bonds.max))).body([quote(giftLine(res, answer.kind, answer.tags), ink), ...(story ? [] : [""]), note].join("\n"));
  done.button("Back", story ? portraitOf(id, moodFor({ gain: answer.gain, kind: answer.kind })) : undefined);
  done.button("Goodbye");
  const d = await showTo(player, id, done);
  if (d?.selection === 0) return residentMenu(player, id);
}

// Follow Me: they come along, or say why not.
async function askFollow(player, id) {
  const res = residentById(id);
  const rec = getResident(id);
  if (!rec || !res) return;
  const why = followMe(player, rec);
  if (!why) return message(player, `§f${res.name}: §7"${bondLine(res, "follow")}" §8(they follow you until you ask them to stop, or until their bedtime)`);
  const b = bondOf(id, player.id);
  const s = residentState(rec);
  if (why === "friendship") {
    // 0.1.233 (Austin: "a creeped out face ... and they should also say, something like \"thats weird\""): asked by
    // someone they hardly know, they're creeped out, in their own words; the talk screen shows the face for it.
    const said = CREEPED[id];
    const line = said?.length ? said[Math.floor(Math.random() * said.length)] : bondLine(res, "followNo");
    const gb = BALANCE.residents.bonds;
    if (talkScreenOn()) {
      const ink = talkInk(true);
      const form = new ActionFormData().title(talkTitle(res.name, true, heartsOf(b.points, gb.max))).body(`${quote(line, ink)}\n${ink.dim}${followLockNote({ points: b.points }, gb)}`);
      form.button("Back", portraitOf(id, "creeped"));
      form.button("Goodbye");
      const r = await showTo(player, id, form);
      if (r?.selection === 0) return residentMenu(player, id);
      return;
    }
    message(player, `§f${res.name}: §7"${line}"`);
  }
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
