import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { parkById, parkName } from "../park/park.js";
import { getHome, homeWorks, queueHomeCheck, homeAvailable, setHomeAvailable } from "../residents/homes.js";
import { HOME_TEXT, homeComfort, comfortHints, COMFORT_WORDS, FURNISHING_NAMES } from "../residents/homeRules.js";
import { BALANCE } from "../data/balance.js";
import { offersFor, residentOfHome, moveIn, moveOut, residentState, getResident, todayMet, moodNow, comfortOf } from "../residents/residents.js";
import { doingText, tagList, moodText, dayText, nearestGoals, jobText, routineText, commuteText } from "../residents/residentRules.js";
import { waitingResidents, progressOf, zooOnDisplay } from "../residents/unlocks.js";
import { RESIDENTS, residentById, unlockWords, LIKE_NAMES, MOOD_WORDS } from "../data/residents.js";
import { isUnlocked } from "../residents/people.js";
import { message } from "../platform/mc.js";

// The Resident Mailbox menu (0.1.182, module 6c: research/npc_plan.md): how the home stands (room, bed, door, path to
// a zoo), who lives there, and, for a working home with nobody in it, the residents who'd like to move in. Only the
// player who placed the mailbox picks a resident or asks one to move out (a mailbox placed by the test zoo's builder,
// with no owner, lets anyone).
// 0.1.220 (Austin's spec: the mailbox is the Home Anchor, research/npc_spec_plan.md section 2): Move-in ON / OFF, the
// owner's to switch; only unlocked residents are offered; with nobody unlocked, the zoo goals nearest to done.
// 0.1.222 (stage B): the home's comfort out of 10 and what would make it cosier; on a resident's page their routine,
// favourites, their home's comfort for them and why they're in today.

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
    lines.push(`§f${res?.name ?? "Someone"} lives here. §7Right now they're ${doingText(s.state, s.phase, s)}.`);
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
  const start = Math.min(g.moodMax, g.moodBase + comfort.lift);
  const body = [
    line ? `§f"${line}"` : "",
    line ? "" : undefined,
    `§7${res.bio}`,
    home ? `§7Lives at the house at ${home.pos.x}, ${home.pos.y}, ${home.pos.z}.` : "",
    `§7Right now: ${doingText(s.state, s.phase, s)}.`,
    `§7Mood: §f${moodText(moodNow(rec), MOOD_WORDS)}`,
    day ? `§7${today ? "Today" : "Last visit"}: §f${day}` : today ? "§7Today: §fnothing much yet" : "§7No visit to the zoo yet.",
    `§7Likes: §f${said(res.spec?.likes, "nothing in particular")}`,
    `§7Doesn't like: §f${said(res.spec?.dislikes, "not known yet")}`,
    res.spec?.attributes?.length ? `§7Known for being: §f${said(res.spec.attributes, "")}` : undefined,
    res.occupation ? `§7Job: §f${jobText(res)}` : undefined,
    `§7Zoo visits: §f${when} §7Rain: §f${rain} §7Storms: §f${storm}`,
    res.favourites?.length ? `§7Favourite exhibits: §f${tagList(res.favourites.map((t) => LIKE_NAMES[t] ?? t), {})}` : undefined,
    homeLine,
    "",
    `§8Each visit starts at ${start} hearts${comfort.lift ? " (their home's comfort adds one)" : ""}: a heart up for each like they come across, one down for each dislike. Happy residents tip at the Donation Boxes and lift the park's rating a little.`,
  ].filter((x) => x !== undefined).join("\n");
  await show(player, new ActionFormData().title(res.name).body(body).button("Goodbye"));
}
