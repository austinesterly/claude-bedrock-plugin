import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { parkById, parkName } from "../park/park.js";
import { getHome, homeWorks, queueHomeCheck, homeAvailable, setHomeAvailable } from "../residents/homes.js";
import { HOME_TEXT, homeComfort, comfortHints, COMFORT_WORDS, FURNISHING_NAMES } from "../residents/homeRules.js";
import { BALANCE } from "../data/balance.js";
import { offersFor, residentOfHome, moveIn, moveOut, residentState, getResident, todayMet, moodNow, comfortOf, liftOf, workState, classState, vetState } from "../residents/residents.js";
import { vetText } from "../residents/vetRules.js";
import { TEACHER_ID, teachText, classText, hasJob } from "../residents/classRules.js";
import { skillOf, SKILL_NAMES } from "../residents/workRules.js";
import { skillText, WORK_KINDS , jobWords } from "../residents/workRules.js";
import { stopText } from "./workMenu.js";
import { doingText, tagList, moodText, dayText, nearestGoals, jobText, routineText, commuteText } from "../residents/residentRules.js";
import { waitingResidents, progressOf, zooOnDisplay } from "../residents/unlocks.js";
import { RESIDENTS, residentById, unlockWords, LIKE_NAMES, MOOD_WORDS, GIFT_NAMES } from "../data/residents.js";
import { bondOf } from "../residents/bonds.js";
import { friendshipText, nextTierText, bondPoints, TIER_NAMES } from "../residents/bondRules.js";
import { world } from "@minecraft/server";
import { isUnlocked } from "../residents/people.js";
import { message } from "../platform/mc.js";
import { giftFor } from "../residents/workGifts.js";
import { rewardText } from "../residents/rewardRules.js";
import { giftTableOf } from "../residents/giftRules.js";
import { WORK_GIFTS } from "../data/workGifts.js";
import { workKindOf } from "../residents/workRules.js";

// The Resident Mailbox menu (0.1.182, module 6c: research/npc_plan.md): how the home stands (room, bed, door, path to
// a zoo), who lives there, and, for a working home with nobody in it, the residents who'd like to move in. Only the
// player who placed the mailbox picks a resident or asks one to move out (a mailbox placed by the test zoo's builder,
// with no owner, lets anyone).
// 0.1.220 (Austin's spec: the mailbox is the Home Anchor, research/npc_spec_plan.md section 2): Move-in ON / OFF, the
// owner's to switch; only unlocked residents are offered; with nobody unlocked, the zoo goals nearest to done.
// 0.1.222 (stage B): the home's comfort out of 10 and what would make it cosier; on a resident's page their routine,
// favourites, their home's comfort for them and why they're in today.
// 0.1.223 (stage C): on a resident's page, the reader's friendship with them: its tier, today's chat and gift, the gifts
// they've liked or not, and how friendship grows. Using a resident opens their menu (ui/residentMenu.js).
// 0.1.224 (stage D): on a resident's page with work, their work site, skill and shift (ui/workMenu.js the anchor's).

const ok = (yes, text) => `${yes ? "§a+" : "§c-"} §f${text}`;

function mayChange(player, home) {
  return !home.owner || home.owner === player.id;
}

export async function mailboxMenu(player, homeId) {
  const home = getHome(homeId);
  if (!home) return;
  const park = home.parkId ? parkById(home.parkId) : undefined;
  const p = home.problem;
  const houseOk = home.space !== undefined && !["open", "small", "unloaded", "unchecked", "dimension"].includes(p);
  const lines = [
    homeWorks(home) ? `§aThis home is ready.${park ? ` §7Its path goes to ${parkName(park)}.` : ""}` : `§e${HOME_TEXT[p] ?? HOME_TEXT.unchecked}`,
    "",
    ok(houseOk, houseOk ? `A closed house with ${home.space} blocks of space inside` : "A closed house, at least 3 x 3 x 3 inside"),
    ok(Boolean(home.bed) && p !== "taken", "A bed of its own"),
    ok(Boolean(home.door), "A door to the outside"),
    ok(!p || (p !== "path" && p !== "unchecked" && Boolean(park)), park ? `A path from the door to ${parkName(park)}` : "A path from the front door to a zoo"),
    "",
  ];
  if (houseOk && home.comfort) lines.push(...comfortLines(home), "");
  const rec = residentOfHome(home.id);
  const res = rec ? residentById(rec.id) : undefined;
  if (rec) {
    const s = residentState(rec);
    lines.push(`§f${res?.name ?? "Someone"} lives here. §7Right now they're ${doingText(s.state, s.phase, { ...s, you: s.leaderId === player.id })}.`);
  } else if (homeWorks(home)) {
    const waiting = waitingResidents();
    if (waiting.length) lines.push(`§7Nobody lives here yet. ${tagList(waiting.map((w) => w.name), {})} can move in: ${homeAvailable(home) ? "with Move-in ON the first one comes by day by themselves, or pick one below." : "turn Move-in ON, or pick one below."}`);
    else lines.push("§7Nobody lives here yet, and nobody can move in yet. Residents unlock as the zoo grows:", ...goalLines());
  } else lines.push("§7Nobody lives here yet. Once the home is ready, residents can move in.");
  lines.push("", `§fMove-in: ${homeAvailable(home) ? "§aON" : "§cOFF"}${rec ? " §8(turning it off never makes anyone move out)" : homeAvailable(home) ? " §8(unlocked residents may move in by themselves)" : " §8(nobody new moves in by themselves)"}`);
  const form = new ActionFormData().title("Resident Mailbox").body(lines.join("\n"));
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  const changer = mayChange(player, home);
  if (!rec && homeWorks(home) && changer) {
    for (const offer of offersFor(home)) add(`${offer.name}\n§8${offer.bio}`, () => invite(player, home.id, offer.id));
  }
  if (rec && res) add(`About ${res.name}`, () => residentPage(player, rec.id));
  if (rec && res && changer) add(`Ask ${res.name} to move out`, () => askOut(player, home.id, rec.id));
  if (changer) {
    const on = homeAvailable(home);
    add(on ? "Turn Move-in OFF" : "Turn Move-in ON", () => {
      setHomeAvailable(home.id, !on);
      message(player, on ? "§7Move-in is OFF: nobody new will move in here by themselves." : "§aMove-in is ON: an unlocked resident may move in here by themselves, by day.");
    });
  }
  add("Check the home again", () => {
    queueHomeCheck(home.id);
    message(player, "§7Checking the house and its path. Use the mailbox again in a moment.");
  });
  add("Close", () => {});
  if (!changer && !rec && homeWorks(home)) form.body(`${lines.join("\n")}\n§8Only ${home.ownerName ?? "the player who placed the mailbox"} can pick who moves in.`);
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

// Up to three zoo goals nearest to done, for residents not yet unlocked (0.1.220).
function goalLines() {
  const stats = zooOnDisplay();
  return nearestGoals(RESIDENTS.filter((r) => !isUnlocked(r.id)), (r) => progressOf(r, stats), 3).map((x) => `§7- §f${x.res.name}: §7${unlockWords(x.res.unlock)} (${x.have} of ${x.need})`);
}

// The home's comfort out of 10 (0.1.222, homeRules.js homeComfort): its parts, and what would make it cosier.
function comfortLines(home) {
  const g = BALANCE.residents;
  const c = homeComfort(home.comfort, g);
  const hints = comfortHints(c, g);
  const kinds = home.comfort.kinds.map((k) => FURNISHING_NAMES[k] ?? k);
  return [
    `§7Comfort: §f${cap(COMFORT_WORDS[c.tier])} (${c.score} of 10) §8room ${c.space}/${g.comfortSpace.length}, light ${c.light}/2, windows ${c.windows}/1, furnishings ${c.furnish}/${g.comfortFurnish}${kinds.length ? ` (${tagList(kinds, {})})` : ""}`,
    hints.length ? `§8Cosier with ${tagList(hints, {})}. Comfortable homes bring their resident to the zoo more often and they tip more; in a nice or grand one each visit starts a heart up.` : "§8As cosy as a home gets.",
  ];
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// Their work, for their page (0.1.224): where, how skilled, and this shift (or the last).
function workLines(rec, res) {
  const ws = workState(rec);
  if (!ws) return [];
  const g = BALANCE.residents.work;
  const kind = WORK_KINDS[ws.kind];
  const out = [];
  if (!ws.site) out.push(`§7Work: §fno ${kind.site} yet §8(build a fenced site with a gate outside the zoo, put a Work Anchor and a chest in it, and choose ${res.name} there)`);
  else out.push(`§7Work: §fthe ${kind.site} at ${ws.site.pos.x}, ${ws.site.pos.y}, ${ws.site.pos.z}${ws.works ? "" : " §e(needs fixing: use its Work Anchor)"}`);
  out.push(`§7Skill: §f${skillText(ws.goodShifts, g)}`);
  if (ws.job) out.push(`§7This shift: §f${jobWords(ws.kind, ws.job)}${ws.job.over && ws.job.why ? ` §8(${stopText(ws.kind, ws.job.why) ?? "done"})` : ""}`);
  else if (ws.last) out.push(`§7Last shift: §f${jobWords(ws.kind, ws.last)}${ws.last.good ? " §a(a good shift)" : ""}`);
  return out;
}

// Class, for their page (0.1.247): the teacher's teaching skill; a student's lessons, and their skill at a job with no work site.
function classLines(rec, res) {
  const g = BALANCE.residents;
  const c = classState(rec);
  if (c.teacher) return [`§7Teaching: §f${teachText(c.given, g.class, SKILL_NAMES)}`, "§8Residents with a job come to his house for lessons, one at a time, when he is home and they are free."];
  const teacher = residentById(TEACHER_ID);
  const text = classText(res, c.taken, teacher?.name ?? "the teacher");
  if (!text || !c.teacherHere) return [];
  const out = [`§7Class: §f${text}${c.noWay ? " §e(no path from their front door to his today)" : c.went ? " §8(had today's lesson)" : c.wants ? " §8(wants a lesson today)" : ""}`];
  if (hasJob(res) && !workKindOf(res) && c.studied > 0) out.push(`§7Skill: §f${SKILL_NAMES[skillOf(c.studied, g.work)]} ${res.occupation} §8(from lessons)`);
  return out;
}

// The vet's work, for his page (0.1.249).
function vetLines(rec) {
  const v = vetState(rec);
  if (!v.vet) return [];
  const out = [`§7Veterinary work: §f${vetText(v.treated, v.points, v.known, BALANCE.residents.vet)}`];
  out.push(v.works ? "§8On his visits he starts at a Recovery Station in the zoo, stays while unwell animals wait in recovery, and otherwise walks out to treat unwell animals at their exhibits." : "§8Until then he visits the zoo like everyone else.");
  return out;
}

// Austin's own words for a resident (0.1.220): their likes, dislikes and attributes as he wrote them.
const said = (list, none) => (list?.length ? list.join(", ") : none);

async function invite(player, homeId, id) {
  const res = residentById(id);
  if (!res) return;
  const body = [`§f${res.bio}`, res.occupation ? `§7Job: §f${jobText(res)}` : undefined, "", `§7Likes: §f${said(res.spec?.likes, "nothing in particular")}`, `§7Doesn't like: §f${said(res.spec?.dislikes, "not known yet")}`, "", `§7${res.name} will move in straight away, ${commuteText(res)}.`].filter((x) => x !== undefined).join("\n");
  const r = await show(player, new MessageFormData().title(`Invite ${res.name}?`).body(body).button1("Not now").button2("Invite"));
  if (r?.selection !== 1) return;
  const home = getHome(homeId);
  if (!home || !homeWorks(home)) return message(player, "§eThe home isn't ready any more. Use the mailbox to see why.");
  if (!moveIn(home, id)) return message(player, `§e${res.name} can't move in here now.`);
  message(player, `§a${res.name} is moving in!`);
}

async function askOut(player, homeId, id) {
  const res = residentById(id);
  const r = await show(player, new MessageFormData().title("Move out?").body(`§fAsk ${res?.name ?? "them"} to move out? They'll leave the house, and someone else can move in.`).button1("Keep them").button2("Move out"));
  if (r?.selection !== 1) return;
  const home = getHome(homeId);
  const rec = home ? residentOfHome(home.id) : undefined;
  if (!rec || rec.id !== id) return;
  moveOut(rec);
  message(player, `§7${res?.name ?? "They"} moved out.`);
}

/** A resident's page: who they are, where they live, what they're doing, how they feel, and a word from them. */
// 0.1.226: their work gifts for the reader: one waiting, or how one comes (residents/giftRules.js).
function workGiftLine(res, b, playerId, gb) {
  if (!giftTableOf(res, WORK_GIFTS)) return undefined;
  const gg = BALANCE.residents.gifts;
  const site = Boolean(workKindOf(res));
  if (!site && !gg.dayGifts) return undefined;
  if (giftFor(res.id, playerId)) return `§7Work gift: §athey have one for you: talk to them`;
  const when = site ? "after a good shift at work" : "after a happy day at the zoo";
  return `§7Work gift: §fnone waiting §8(now and then ${when}, for a ${TIER_NAMES[gg.minTier]} or closer; handed over when you talk)`;
}

export async function residentPage(player, id, line = undefined) {
  const rec = getResident(id);
  const res = residentById(id);
  if (!rec || !res) return;
  const home = getHome(rec.homeId);
  const s = residentState(rec);
  // 0.1.217: their mood (their latest visit's) and what pleased or bothered them today, or on their last visit.
  const today = todayMet(rec);
  const day = dayText(today ?? rec.met, LIKE_NAMES);
  // 0.1.222: their routine, favourites, and their home's comfort for them.
  const [when, rain, storm] = routineText(res);
  const comfort = comfortOf(rec);
  const loves = (res.homeLikes ?? []).map((k) => FURNISHING_NAMES[k] ?? k);
  const homeLine = home?.comfort
    ? `§7Home: §f${cap(COMFORT_WORDS[comfort.tier])} (${comfort.score} of 10)${comfort.loved.length ? ` §7with the ${tagList(comfort.loved.map((k) => FURNISHING_NAMES[k] ?? k), {}).replace(/^a /, "")} ${res.name} loves` : loves.length ? ` §8(${res.name} would love ${tagList(loves, {})} in it)` : ""}`
    : undefined;
  const g = BALANCE.residents;
  const start = Math.min(g.moodMax, g.moodBase + liftOf(rec));
  const work = workLines(rec, res);
  const gb = g.bonds;
  const b = bondOf(id, player.id);
  const next = nextTierText(b.points, gb);
  const worldDay = world.getDay();
  const pts = (k) => bondPoints(res, k, gb);
  const sign = (n) => (n > 0 ? `+${n}` : `${n}`);
  const body = [
    line ? `§f"${line}"` : "",
    line ? "" : undefined,
    `§7${res.bio}`,
    home ? `§7Lives at the house at ${home.pos.x}, ${home.pos.y}, ${home.pos.z}.` : "",
    `§7Right now: ${doingText(s.state, s.phase, { ...s, you: s.leaderId === player.id })}.`,
    `§7Mood: §f${moodText(moodNow(rec), MOOD_WORDS)}`,
    // 0.1.223: the reader's friendship with them.
    `§7Friendship with you: §f${friendshipText(b.points, gb)}${next ? ` §8(${next})` : ""}`,
    `§7Today: §f${b.talkDay === worldDay ? "a chat with you" : "no chat with you yet"}, ${b.giftDay === worldDay ? "a gift from you" : "no gift from you yet"}`,
    workGiftLine(res, b, player.id, gb),
    res.reward ? `§7${rewardText(res, b)}` : undefined, // 0.1.243
    b.liked?.length ? `§7Gifts they liked from you: §f${tagList(b.liked.map((x) => GIFT_NAMES[x] ?? x), {})}` : undefined,
    b.disliked?.length ? `§7Gifts they didn't like: §f${tagList(b.disliked.map((x) => GIFT_NAMES[x] ?? x), {})}` : undefined,
    day ? `§7${today ? "Today" : "Last visit"}: §f${day}` : today ? "§7Today: §fnothing much yet" : "§7No visit to the zoo yet.",
    `§7Likes: §f${said(res.spec?.likes, "nothing in particular")}`,
    `§7Doesn't like: §f${said(res.spec?.dislikes, "not known yet")}`,
    res.spec?.attributes?.length ? `§7Known for being: §f${said(res.spec.attributes, "")}` : undefined,
    res.occupation ? `§7Job: §f${jobText(res)}` : undefined,
    ...work,
    ...classLines(rec, res),
    ...vetLines(rec),
    `§7Zoo visits: §f${when} §7Rain: §f${rain} §7Storms: §f${storm}`,
    res.favourites?.length ? `§7Favourite exhibits: §f${tagList(res.favourites.map((t) => LIKE_NAMES[t] ?? t), {})}` : undefined,
    homeLine,
    "",
    `§8Each visit starts at ${start} hearts${comfort.lift && rec.proud ? " (their home's comfort adds one, and a good shift at work another)" : comfort.lift ? " (their home's comfort adds one)" : rec.proud ? " (a good shift at work adds one)" : ""}: a heart up for each like they come across, one down for each dislike. Happy residents tip at the Donation Boxes and lift the park's rating a little.`,
    `§8Friendship grows with the first chat each day (${sign(pts("talk"))}) and a gift a day: one they like ${sign(pts("liked"))}, anything else ${sign(pts("neutral"))}, one they don't like ${sign(pts("disliked"))}. At ${TIER_NAMES[gb.followFrom]} (${gb.tiers[gb.followFrom]}) they'll follow you in their free time (Follow Me). Good friends visit the zoo a little more often and tip a little more.`,
  ].filter((x) => x !== undefined).join("\n");
  await show(player, new ActionFormData().title(res.name).body(body).button("Goodbye"));
}
