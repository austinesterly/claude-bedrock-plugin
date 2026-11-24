import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { isZookeeper, zookeeperState, assignWork, thanksFor, markThanked, atWork } from "../staff/zookeepers.js";
import { JOBS, JOB_IDS, jobLine, percent, nextStep, sizeText } from "../staff/zookeeperRules.js";
import { statusOf } from "../staff/staff.js";
import { withPark, can, denyText } from "../park/park.js";
import { BALANCE } from "../data/balance.js";
import { residentById, PLEASED, BOTHERED } from "../data/residents.js";
import { getResident, residentState, todayMet, followWhy, followMe, stayHere, stopFollowing, sendHome, canSendHome, talkStart, talkEnd, lookingAt } from "../residents/residents.js";
import { CHATS } from "../data/residentChats.js";
import { SCENE_TALK } from "../data/residentScenes.js";
import { scenePick, sceneTurn } from "../residents/sceneRules.js";
import { sceneFacts, sceneNames } from "../residents/sceneFacts.js";
import { CREEPED } from "../data/residentCreeped.js";
import { dayPart, lookArea, chatStatus, chatPick, remember, freshOf, talkCounts } from "../residents/chatRules.js";
import { bondOf, haveChat, giveGift, giftedToday } from "../residents/bonds.js";
import { quickGiftLine } from "./talkRules.js";
import { tierOf, friendshipText, nextTierText, tierUpText, followLockText, followLockLong, followLockNote, bondLine, giftLine, gainText, canGift } from "../residents/bondRules.js";
import { doingText, talkLine } from "../residents/residentRules.js";
import { weatherNow } from "../core/weather.js";
import { residentPage } from "./mailboxMenu.js";
import { message } from "../platform/mc.js";
import { giftFor, handOver, handPoison } from "../residents/workGifts.js";
import { rewardFor, handReward, copyAgain, carriesBook, carries, beefGift } from "../residents/rewards.js";
import { rewardsEarned, askAgain } from "../residents/rewardRules.js";
import { ADVICE } from "../data/residentAdvice.js";
import { advicePage } from "./adviceMenu.js";
import { lessonsMenu, TEACHER } from "./lessonMenu.js";
import { hairlineMenu, paintsHairlines } from "./hairlineMenu.js";
import { rhymeMenu, rhymeButton } from "./rhymeMenu.js";
import { talkTitle, portraitOf, talkInk, talkButton, heartsOf, moodFor, boxLines, splitSay, talkPages, beatSplit, TALK_BOX } from "./talkRules.js";
import { GUIDO_ID, isCaseBow } from "../guido/bowRules.js";
import { caseRoomFor, moveIntoCase } from "../guido/bowCase.js";
import { tackleShop } from "../fishing/tackleBox.js";
import { essenceTrade, chasmTrades } from "../residents/voidTrade.js";
import { CHASM_ID } from "../residents/voidRules.js";
import { ashShop } from "../residents/ashShop.js";
import { buskingNow, chickenShop } from "../residents/busking.js";
import { invited as showInvited, concertOf, startConcert, finishConcert } from "../residents/concert.js";
import { miriumShop, miriumBank, miriumExchange } from "../residents/miriumShop.js";
import { MIRIUM_ID } from "../residents/miriumRules.js";
import { askHanvil } from "../equipment/hanvil.js";
import { HAN_ID } from "../equipment/hanvilRules.js";
import { ASH_ID, DON_ID } from "../residents/ashRules.js";
import { DARIAN_ID } from "../residents/darianRules.js";
import { dragonAskDue, startArrival } from "../world/voidDragon.js";
import { FOSS_ID } from "../residents/fossRules.js";
import { expeditionTold, offerUnanswered, answerOffer, expeditionLine, expeditionAnswer } from "../residents/fossExpedition.js";
import { streamNow, streamAsked, answerStream, confrontPage, unbanStream } from "../residents/livestream.js";

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
// 0.1.364: a line for the moment (residents/sceneRules.js): what they're doing, the weather, who and what is near,
// what the player holds, how the zoo is doing, in their own words and by the friendship. Undefined when it isn't the
// turn for one or nothing fits; the caller says their everyday line then. `greeting`: for their menu's opening line.
function sceneLine(player, res, rec, bond, tier, recent, greeting = false) {
  const gs = BALANCE.residents.scenes;
  const talk = SCENE_TALK[res.id];
  if (!talk || rec.state === "asleep") return undefined;
  if (greeting && Math.random() >= gs.greetChance) return undefined;
  const f = sceneFacts(player, rec, bond, { working: isZookeeper(res.id) && atWork(res.id) });
  if (!greeting && !sceneTurn(f, Math.random, gs)) return undefined;
  return scenePick(talk, f, tier, recent, sceneNames(player, f), Math.random, gs)?.line;
}

export function chatFor(player, res, rec, c, tier, everyday, before = undefined) {
  const gc = BALANCE.residents.chats;
  const key = `${res.id}|${player.id}`;
  const recent = said.get(key) ?? [];
  const chats = CHATS[res.id];
  const status = c.first ? "ok" : chatStatus(c.bond.dayTalks ?? 1, res, gc);
  let line;
  if (c.first) line = SCENE_TALK[res.id]?.intro ?? bondLine(res, "intro"); // 0.1.364: they say who they are and what they do
  else if (status !== "ok") line = freshOf(chats?.[status], recent, Math.random) ?? everyday();
  else if (rec.skunked && res.lines?.skunked?.some((l) => !recent.includes(l))) line = freshOf(res.lines.skunked, recent, Math.random); // 0.1.268: a skunked shift on his mind (each such line once, then his usual talk)
  else if ((line = sceneLine(player, res, rec, before ?? c.bond, tier, recent))) {
    // said below
  } else {
    const w = weatherNow();
    const area = lookArea(lookingAt(res.id), Math.random, gc);
    line = chatPick(chats, res.lines, { part: dayPart(world.getTimeOfDay(), gc), tier, area, raining: (w === "Rain" || w === "Thunder") && (rec.state === "inside" || rec.state === "visiting"), recent }, Math.random, gc, everyday).line;
  }
  said.set(key, remember(recent, line, { remember: BALANCE.residents.scenes.remember }));
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

// 0.1.344: Dr. Foss's offer of the Acufend expedition, answered on a page of his (`form`, his words on it already): yes,
// and he says how to get there; not yet, and the offer stands (his menu's button asks again). Returns true (yes), false
// (not yet) or undefined (closed: asked again next time).
async function askExpedition(player, id, form, face) {
  const res = residentById(id);
  form.button("I'll come with you", face);
  form.button("Not yet");
  const a = await showTo(player, id, form);
  if (!a || a.selection === undefined) return undefined;
  const yes = a.selection === 0;
  answerOffer(player, yes);
  const key = !yes ? "expNotYet" : expeditionAnswer(player) === "done" ? "expDone" : "expYes";
  message(player, `§f${res.name}: §7"${bondLine(res, key)}"`);
  return yes;
}

// 0.1.367: Austin the resident's question about his stream in the crocodile exhibit, on a page of his (`form`, his
// words on it already). Yes: the player is in the stream with him. No: he goes in anyway. Closed: it is on his menu.
async function askStream(player, id, form, face) {
  streamAsked();
  form.button("Yes, I'm in", face);
  form.button("No. Stay out of there");
  const a = await showTo(player, id, form);
  if (!a || a.selection === undefined) return;
  answerStream(player, a.selection === 0);
}

// 0.1.374: Zach's invitation to play a show with him: its answers on the page he asks on.
async function askConcert(player, id, form, face) {
  form.button("I'm in", face);
  form.button("Another night");
  const a = await showTo(player, id, form);
  if (a?.selection === 0) startConcert(player);
}

// His question on a page of its own: before his menu (told, never answered), or from its button.
function expeditionPage(player, id) {
  const res = residentById(id);
  const story = talkScreenOn();
  return new ActionFormData().title(talkTitle(res.name, story, heartsOf(bondOf(id, player.id).points, BALANCE.residents.bonds.max))).body(quote(bondLine(res, "expAsk"), talkInk(story)));
}

/** The menu for a resident, for one player. */
export async function residentMenu(player, id) {
  const rec = getResident(id);
  const res = residentById(id);
  if (!rec || !res) return;
  // 0.1.318: two days after the bait was hung Darian asks first whether the player is ready for the dragon. No: his
  // menu as ever, and he asks again next time.
  if (id === DARIAN_ID && dragonAskDue()) {
    const story0 = talkScreenOn();
    const ask = new ActionFormData().title(talkTitle(res.name, story0, heartsOf(bondOf(id, player.id).points, BALANCE.residents.bonds.max))).body(quote(bondLine(res, "readyAsk"), talkInk(story0)));
    ask.button(talkButton("Yes, I am ready", undefined, story0), story0 ? portraitOf(id) : undefined);
    ask.button(talkButton("Not yet", undefined, story0));
    const a = await showTo(player, id, ask);
    if (!a || a.selection === undefined) return;
    if (a.selection === 0) {
      startArrival(player);
      return;
    }
    message(player, `§f${res.name}: §7"${bondLine(res, "notReady")}"`);
  }
  // 0.1.344: Dr. Foss asks a player he has told of Acufend whether they'll come, till they answer. Not yet: his menu as
  // ever (its button asks again whenever they like).
  if (id === FOSS_ID && rec.state !== "asleep" && offerUnanswered(player)) {
    const yes = await askExpedition(player, id, expeditionPage(player, id), talkScreenOn() ? portraitOf(id) : undefined);
    if (yes !== false) return;
  }
  // 0.1.361 (Austin's zookeepers): the first time this player's friendship with one reaches 60, 80 and 100 they thank
  // their boss, once each, as their menu opens (in chat, like every resident's line; never while asleep).
  if (isZookeeper(id) && rec.state !== "asleep") {
    for (const at of thanksFor(player, id)) {
      markThanked(player, id, at);
      message(player, `§f${res.name}: §7"${bondLine(res, `thanks${at}`)}"`);
    }
  }
  const g = BALANCE.residents;
  const gb = g.bonds;
  const day = world.getDay();
  const b = bondOf(id, player.id);
  const s = residentState(rec);
  const you = s.leaderId === player.id;
  // 0.1.364: half the time their menu opens on a line for the moment (never before they've met: the hello stands).
  const saidKey = `${id}|${player.id}`;
  const greet = b.talks > 0 ? sceneLine(player, res, rec, b, tierOf(b.points, gb), said.get(saidKey) ?? [], true) : undefined;
  if (greet) said.set(saidKey, remember(said.get(saidKey), greet, { remember: g.scenes.remember }));
  const line = id === "austin" && streamNow() === "banned" ? bondLine(res, "bannedGreet") : greet ?? talkLine(res, rec.state, todayMet(rec), Math.random, g, PLEASED, BOTHERED); // 0.1.367: banned, at the gate
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
    // 0.1.361: a zookeeper on their shift stays at work (Austin: Follow Me "only if ... off shift")
    if (isZookeeper(id) && atWork(id)) add("Follow Me", () => message(player, `§7${res.name} is on shift. Ask when the day's work is done.`), { text: "On shift" });
    else add("Follow Me", () => askFollow(player, id), why ? { text: followLockText(why, { points: b.points, leaderName: s.leader }, gb) } : undefined);
    if (rec.state === "staying") {
      add(story ? "Stop Following" : "Stop Following\n§8Back to their day", () => {
        const now = getResident(id);
        if (now && stopFollowing(player, now)) message(player, `§f${res.name}: §7"${bondLine(res, "stop")}"`);
      });
    }
  }
  if (canSendHome(rec) && !(rec.state === "following" && !you)) add("Go Home", () => askHome(player, id));
  // 0.1.361: a hired zookeeper's job (Austin's spec section 7: Assign Job / Change Job, View Job)
  if (isZookeeper(id) && zookeeperState(id)) {
    const zs = zookeeperState(id);
    add(zs.work ? "Change Job" : "Assign Job", () => jobMenu(player, id), { text: zs.work ? JOBS[zs.work].name : "No job yet", good: Boolean(zs.work) });
    add("View Job", () => jobPage(player, id));
  }
  // 0.1.243: a friendship reward they've earned and don't carry: another copy for the asking
  const earned = rewardsEarned(res, b).find((r) => r.book); // a reward that is a thing is asked for on their advice page
  if (earned && !asleep && !carriesBook(player, earned.book)) {
    add(story ? "Ask for the book" : "Ask for the book\n§8Another copy", () => {
      const again = copyAgain(player, res);
      if (again) message(player, `§f${res.name}: §7"${again.line}" §aThey give you ${again.name}${again.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.`);
    });
  }
  // 0.1.250: a reward that is a thing, from a resident with no advice page (Dr. Pollo's formula): another for the asking
  // 0.1.281: not one they don't give twice (Jack's Steel Rod: he sells spares)
  const thing = ADVICE[id] ? undefined : rewardsEarned(res, b).find((r) => r.item && askAgain(r) && !carries(player, r));
  if (thing && !asleep) {
    const ask = `Ask for ${/^[A-Z][a-z]*'s /.test(thing.name) || /^the /i.test(thing.name) ? "" : "the "}${thing.name}`; // 0.1.344: not "the the Lightning TNT Frequency Stick". 0.1.281: "Ask for Jack's Flint and Steel"
    add(story ? ask : `${ask}\n§8You carry none`, () => {
      const again = copyAgain(player, res, thing);
      if (again) message(player, `§f${res.name}: §7"${again.line}" §aThey give you ${again.name}${again.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.`);
    });
  }
  // 0.1.245: what they teach by friendship (Terra), and their plans to ask for again
  if (res.advice && ADVICE[id] && !asleep) add(ADVICE[id].button, () => held(player, id, () => advicePage(player, id)));
  // 0.1.246: the teacher's lessons for the player
  if (res.lessons && id === TEACHER && !asleep) add("Lessons", () => held(player, id, () => lessonsMenu(player)));
  // 0.1.254: Jaylen's Hairline Painting, on his menu from 100 friendship (and for good once reached)
  // 0.1.377: Jared's rhymes, once he has asked: a pair at a time, then his freestyle to hear again
  if (id === "jared" && !asleep && rhymeButton(player)) add(rhymeButton(player), () => held(player, id, () => rhymeMenu(player)));
  if (paintsHairlines(res, b) && !asleep) add("Paint my hairline", () => held(player, id, () => hairlineMenu(player, id)));
  // 0.1.271: Jack's tackle, the three lures for the park's coins, from Friend
  if (id === "jack" && !asleep && tierOf(b.points, gb) >= BALANCE.rods.shop.tier) add("Buy Tackle", () => held(player, id, () => tackleShop(player)));
  // 0.1.290: Chasm's trade, a diamond for a Volatile Void Essence, once he has offered it (at 50 friendship; kept for good)
  if (id === CHASM_ID && !asleep && chasmTrades(player)) add("Trade Diamonds", () => held(player, id, () => essenceTrade(player)));
  // 0.1.304: Don L. on his latest failed sport (talk only: there is no sport); Ash's shop, every piece listed, locked or open
  if (id === DON_ID && !asleep) add("Ask about the new sport", () => message(player, `§f${res.name}: §7"${bondLine(res, "sport")}"`));
  if (id === ASH_ID && !asleep) add("Shop", () => held(player, id, () => ashShop(player)));
  // 0.1.374: his show with the player, once he has asked: join him on a night he is out singing; "We're done" ends it
  if (id === "zach" && showInvited(player)) {
    if (concertOf(player)) add("We're done", () => finishConcert(player));
    else add("Play a show with Zach", () => startConcert(player));
  }
  if (id === "zach" && buskingNow()) add("Fried chicken", () => held(player, id, () => chickenShop(player))); // 0.1.370: his only merchandise, while he is out singing
  // 0.1.357: Mirium the banker's three pages (Austin's NPC #30 spec, section 3)
  if (id === MIRIUM_ID && !asleep) {
    add("Banking", () => held(player, id, () => miriumBank(player)));
    add("Currency Exchange", () => held(player, id, () => miriumExchange(player)));
    add("Daily Shop", () => held(player, id, () => miriumShop(player)));
  }
  if (id === HAN_ID && !asleep) add("Ask about the Hanvil", () => askHanvil(player)); // 0.1.305: what he teaches so far, by friendship
  // 0.1.344: Dr. Foss's expedition, once he has told this player of Acufend: his offer (it stands), or how it's going
  if (id === FOSS_ID && !asleep && expeditionTold(player)) {
    add("The Acufend expedition", async () => {
      const key = expeditionLine(player);
      if (key === "expAsk") await askExpedition(player, id, expeditionPage(player, id), story ? portraitOf(id) : undefined);
      else message(player, `§f${res.name}: §7"${bondLine(res, key)}"`);
    });
  }
  // 0.1.367: Austin the resident's big stream: his question while it is unanswered, the confrontation after he went in
  // against a No, and the way back in when he is banned
  if (id === "austin" && !asleep) {
    const st = streamNow();
    if (st === "asked") {
      add("The big livestream", () => {
        const page = new ActionFormData().title(talkTitle(res.name, story, heartsOf(b.points, gb.max))).body(quote(bondLine(res, "streamAsk"), ink));
        return askStream(player, id, page, story ? portraitOf(id) : undefined);
      });
    } else if (st === "confront") add("About that stream", () => held(player, id, () => confrontPage(player)));
    else if (st === "banned") add("Let him back in the zoo", () => unbanStream(player));
  }
  if (id === "tim" && !asleep) add("Ask for a book review", () => message(player, `§f${res.name}: §7"${bondLine(res, "review")}"`)); // 0.1.335: one of his reviews
  add(`Friendship and About`, () => held(player, id, () => residentPage(player, id)));
  add("Goodbye", () => {});
  const r = await showTo(player, id, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

// Talk: a chat (the first of the day counts for friendship), as long as they like.
// --- 0.1.361: a zookeeper's job (staff/zookeepers.js) ---

async function jobMenu(player, id) {
  const res = residentById(id);
  const zs = zookeeperState(id);
  if (!res || !zs) return;
  if (!can(player, "spend", zs.park)) return message(player, denyText("spend", zs.park));
  const form = new ActionFormData().title(`${res.name}'s job`).body(`§f${res.name} does one job at a time, and any of the four as well as the others. Changing it keeps their friendship and efficiency (${percent(zs.efficiency)}).${zs.work ? `\n§7Now: §f${JOBS[zs.work].name}` : ""}`);
  for (const j of JOB_IDS) form.button(`${JOBS[j].name}${j === zs.work ? " §2(now)" : ""}\n§8${JOBS[j].short}`);
  form.button("Back");
  const r = await showTo(player, id, form);
  const pick = r?.selection !== undefined ? JOB_IDS[r.selection] : undefined;
  if (!pick || pick === zs.work) return;
  if (!assignWork(id, pick)) return;
  message(player, `§a${res.name} is now the ${JOBS[pick].name}: §7${res.name} ${JOBS[pick].does}.`);
  message(player, `§f${res.name}: §7"${bondLine(res, JOBS[pick].line)}"`);
}

/** A zookeeper's job page lines (also on the Staff menu). */
export function jobLines(id) {
  const res = residentById(id);
  const zs = zookeeperState(id);
  if (!res || !zs) return [];
  const g = BALANCE.zookeepers;
  const next = nextStep(zs.points, g);
  const status = withPark(zs.park, () => statusOf(zs.keeper)).replace(/§./g, "");
  return [
    `§f${jobLine(res.name, zs.work, zs.points, g)}`,
    "",
    zs.work ? `§7Job: §f${JOBS[zs.work].name}. §7${res.name} ${JOBS[zs.work].does}.` : "§eNo job yet. Give them one with Assign Job.",
    `§7Right now: §f${status || "Settling in"}`,
    `§7Efficiency: §f${percent(zs.efficiency)} §8(how full and how clean they leave things; by the best friendship any player has with them)`,
    next ? `§7Next: §f${percent(next.efficiency)} at ${next.at} friendship` : "§7As good as a zookeeper gets.",
    `§7Tasks done: §f${zs.done}`,
    zs.unpaid ? `§cWages owed: ${zs.unpaid} coins. They work again once the park can pay.` : `§7Wages: §f${BALANCE.zookeepers.wage} Zoo Coins a Minecraft week, paid`,
    zs.over ? `§eThe workroom is too small for ${zs.team} zookeepers: it needs ${sizeText(zs.need)} of floor inside. They wait, and keep their job and friendship.` : `§7Workroom: §fbig enough for ${zs.holds} (${zs.team} employed)`,
  ];
}

async function jobPage(player, id) {
  const res = residentById(id);
  if (!res || !zookeeperState(id)) return;
  message(player, `§f${res.name}: §7"${bondLine(res, "jobView")}"`);
  await showTo(player, id, new ActionFormData().title(`${res.name}'s job`).body(jobLines(id).join("\n")).button("Back"));
}

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
      got = handOver(player, res) ?? handReward(player, res) ?? (counted ? undefined : handPoison(player, res)); // 0.1.321: Desilva's poison still only on the first;: on every Talk and Keep Talking, not only the first; // 0.1.258: or Desilva's poison. 0.1.243: or their friendship reward
      const before = bondOf(id, player.id);
      // 0.1.321: a Talk in which they hand something over is free (chatRules.js talkCounts): never "enough", never cross
      const c = talkCounts(Boolean(got), before.talkDay, day) ? haveChat(player, res, day) : { gain: 0, bond: before, free: true };
      if (c.free) line = got.line;
      else ({ line, status } = chatFor(player, res, rec, c, tierOf(before.points, g.bonds), everyday, before));
      if (got) status = "ok";
      if (c.free) note = "";
      else if (!counted) note = c.gain ? `§a${gainText(c.gain)} §8(${friendshipText(c.bond.points, g.bonds)})` : "§8You've had today's chat: friendship grows with the first each day.";
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
    const face = story ? portraitOf(id, moodFor({ status, gain, gift: Boolean(got) })) : undefined; // 0.1.232: happy, cross or plain
    // 0.1.294: the talk screen's box holds six lines (Austin: "Screen is cut off"): a longer answer comes on pages,
    // "Go on" between them, the usual buttons on the last.
    let last = body;
    if (story) {
      const para = (raw, len) => ({ raw, lines: boxLines("x".repeat(len)) });
      // 0.1.335: a setup and its punchline (Tim's fake gift): the setup alone on the first page, "Go on", then the rest
      const beat = got?.beat ? beatSplit(line) : [line];
      const paras = beat.length > 1 ? [{ ...para([{ text: quote(beat[0], ink) }], beat[0].length + 2), lines: TALK_BOX.lines }, ...splitSay(beat[1]).map((say) => para([{ text: quote(say, ink) }], say.length + 2))] : splitSay(line).map((say) => para([{ text: quote(say, ink) }], say.length + 2));
      if (got) {
        const lead = `${ink.good}They give you ${got.name ? "" : `${got.count} `}`;
        const tail = got.dropped ? " §8(at your feet: your inventory is full)" : "";
        paras.push(para([{ text: lead }, got.name ? { text: got.name } : { translate: got.key }, { text: tail }], lead.length - 2 + (got.name?.length ?? 24) + Math.max(0, tail.length - 2)));
      }
      if (note) paras.push({ raw: [{ text: note }], lines: boxLines(note) });
      // 0.1.344: a question (Dr. Foss's offer) last of all, on the page with its answers under it
      if (got?.ask) paras.push(...paras.splice(paras.length - 2 - (note ? 1 : 0), 1));
      const pages = talkPages(paras).map((pg) => ({ rawtext: pg.flatMap((x, i) => (i ? [{ text: "\n" }, ...x.raw] : x.raw)) }));
      last = pages.pop() ?? body;
      let shut = false;
      for (const pg of pages) {
        const r = await showTo(player, id, new ActionFormData().title(talkTitle(res.name, story, heartsOf(bondOf(id, player.id).points, g.bonds.max))).body(pg).button("Go on", face));
        if (r?.selection === undefined) {
          shut = true;
          break;
        }
      }
      if (shut) return;
    }
    const form = new ActionFormData().title(talkTitle(res.name, story, heartsOf(bondOf(id, player.id).points, g.bonds.max))).body(last);
    // 0.1.344: Dr. Foss's story of Acufend ends in his offer: its answers in place of the usual buttons
    if (got?.ask === "expedition") {
      await askExpedition(player, id, form, face);
      return;
    }
    if (got?.ask === "concert") {
      await askConcert(player, id, form, face);
      return;
    }
    // 0.1.367: Austin the resident's question about his stream: its answers in place of the usual buttons
    if (got?.ask === "stream") {
      await askStream(player, id, form, face);
      return;
    }
    // Told off: there's no Keep Talking until tomorrow.
    const more = status !== "toldOff";
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
/** 0.1.336: whether an item stack has an enchantment on it (Dr. Foss likes anything enchanted). */
export function enchantedOf(stack) {
  try {
    return (stack?.getComponent("minecraft:enchantable")?.getEnchantments()?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

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
    // 0.1.267: a renamed stack is a thing of its own (to Jack, a fake), so it's listed apart from the plain ones
    // 0.1.336: and an enchanted one apart from a plain one
    const enchanted = enchantedOf(it);
    const k = `${it.typeId}|${it.nameTag ?? ""}|${enchanted ? "e" : ""}`;
    const had = out.get(k);
    if (had) had.amount += it.amount;
    else out.set(k, { typeId: it.typeId, key: it.localizationKey, name: it.nameTag, amount: it.amount, enchanted });
  }
  return [...out.values()];
}

// Takes one of an item from a player, from the first stack of it they carry. False when they don't have one any more.
// 0.1.267: given a `name` (undefined for a plain one), only a stack with that name of its own. 0.1.336: given
// `enchanted` too, only a stack that is (or isn't) enchanted.
export function takeOne(player, typeId, ...named) {
  const c = player.getComponent("minecraft:inventory")?.container;
  if (!c) return false;
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it || it.typeId !== typeId) continue;
    if (named.length && (it.nameTag || undefined) !== (named[0] || undefined)) continue;
    if (named.length > 1 && enchantedOf(it) !== Boolean(named[1])) continue;
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
  const has = giftable(player).some((x) => x.typeId === pick.typeId && x.name === pick.name && x.enchanted === pick.enchanted);
  if (!has) return message(player, "§7You don't have that any more.");
  if (beefGift(player, res, pick.typeId)) return; // 0.1.321: Darian's 64 Raw Beef is a hand-in, not a gift
  // 0.1.261: a bow for Guido goes into his Bow Case, the very item. No case of his there, or a full one: he hands it back.
  const toCase = id === GUIDO_ID && isCaseBow(pick.typeId);
  if (toCase) {
    const room = caseRoomFor();
    if (room !== "ok") return message(player, `§f${res.name}: §7"${bondLine(res, room === "full" ? "caseFull" : "caseNone")}"`);
  }
  const answer = giveGift(player, res, pick.typeId, world.getDay(), pick.name, pick.enchanted);
  if (!answer.ok) return message(player, `§f${res.name}: §7"${bondLine(res, "again")}"`);
  if (toCase ? !moveIntoCase(player, pick.typeId) : !takeOne(player, pick.typeId, pick.name, pick.enchanted)) return;
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

/**
 * 0.1.302 (Austin: "you should be able to give an NPC anything by shifting and right clicking on them ... then the
 * chat comes up with their reaction to the gift"): the item in the player's hand given at once, no menu; what they
 * say and what it did for the friendship come as one chat line. The same rules as Give a Gift (one a day from each
 * player, not while asleep, Guido's bows into his Bow Case). `held`: { typeId, nameTag, enchanted (0.1.336) }.
 */
export function quickGift(player, id, held) {
  const res = residentById(id);
  const rec = getResident(id);
  if (!rec || !res || !held) return;
  const g = BALANCE.residents;
  const day = world.getDay();
  const name = held.nameTag || undefined;
  const enchanted = Boolean(held.enchanted); // 0.1.336
  if (rec.state === "asleep") return message(player, `§7${res.name} is asleep. Bring it when they're up.`);
  if (!canGift(held.typeId)) return message(player, `§7That isn't something to give ${res.name}.`);
  if (beefGift(player, res, held.typeId)) return; // 0.1.321: before the one-a-day rule: it is not a gift
  if (giftedToday(id, player.id, day)) return message(player, `§f${res.name}: §7"${bondLine(res, "again")}" §8(one gift a day from each player)`);
  if (!giftable(player).some((x) => x.typeId === held.typeId && x.name === name && x.enchanted === enchanted)) return;
  const toCase = id === GUIDO_ID && isCaseBow(held.typeId);
  if (toCase) {
    const room = caseRoomFor();
    if (room !== "ok") return message(player, `§f${res.name}: §7"${bondLine(res, room === "full" ? "caseFull" : "caseNone")}"`);
  }
  const answer = giveGift(player, res, held.typeId, day, name, enchanted);
  if (!answer.ok) return message(player, `§f${res.name}: §7"${bondLine(res, "again")}"`);
  if (toCase ? !moveIntoCase(player, held.typeId) : !takeOne(player, held.typeId, name, enchanted)) return;
  message(player, quickGiftLine(res.name, giftLine(res, answer.kind, answer.tags), gainText(answer.gain), friendshipText(answer.bond.points, g.bonds), answer.gain));
  if (answer.tierUp !== undefined) message(player, `§a${tierUpText(res.name, answer.tierUp, g.bonds)}`);
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

/** 0.1.299: straight to Talk with a resident (after the cure: Aurora's story). */
export function talkWith(player, id) {
  return talkTo(player, id);
}
