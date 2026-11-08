import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { parkById, parkName } from "../park/park.js";
import { getHome, homeWorks, queueHomeCheck } from "../residents/homes.js";
import { HOME_TEXT } from "../residents/homeRules.js";
import { offersFor, residentOfHome, moveIn, moveOut, residentState, getResident, todayMet, moodNow } from "../residents/residents.js";
import { doingText, tagList, moodText, dayText } from "../residents/residentRules.js";
import { residentById, LIKE_NAMES, ATTRIBUTE_NAMES, MOOD_WORDS } from "../data/residents.js";
import { message } from "../platform/mc.js";

// The Resident Mailbox menu (0.1.182, module 6c: research/npc_plan.md): how the home stands (room, bed, door, path to
// a zoo), who lives there, and, for a working home with nobody in it, the residents who'd like to move in. Only the
// player who placed the mailbox picks a resident or asks one to move out (a mailbox placed by the test zoo's builder,
// with no owner, lets anyone).

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
  const rec = residentOfHome(home.id);
  const res = rec ? residentById(rec.id) : undefined;
  if (rec) {
    const s = residentState(rec);
    lines.push(`§f${res?.name ?? "Someone"} lives here. §7Right now they're ${doingText(s.state, s.phase)}.`);
  } else lines.push(homeWorks(home) ? "§7Nobody lives here yet. Pick who moves in below." : "§7Nobody lives here yet. Once the home is ready, residents will want to move in.");
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
  add("Check the home again", () => {
    queueHomeCheck(home.id);
    message(player, "§7Checking the house and its path. Use the mailbox again in a moment.");
  });
  add("Close", () => {});
  if (!changer && !rec && homeWorks(home)) form.body(`${lines.join("\n")}\n§8Only ${home.ownerName ?? "the player who placed the mailbox"} can pick who moves in.`);
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

async function invite(player, homeId, id) {
  const res = residentById(id);
  if (!res) return;
  const body = [`§f${res.bio}`, "", `§7Likes: §f${tagList(res.likes, LIKE_NAMES) || "nothing in particular"}`, `§7Doesn't like: §f${tagList(res.dislikes, LIKE_NAMES) || "nothing in particular"}`, "", `§7${res.name} will move in straight away, walk to the zoo each morning and come home at sunset.`].join("\n");
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
  const body = [
    line ? `§f"${line}"` : "",
    line ? "" : undefined,
    `§7${res.bio}`,
    home ? `§7Lives at the house at ${home.pos.x}, ${home.pos.y}, ${home.pos.z}.` : "",
    `§7Right now: ${doingText(s.state, s.phase)}.`,
    `§7Mood: §f${moodText(moodNow(rec), MOOD_WORDS)}`,
    day ? `§7${today ? "Today" : "Last visit"}: §f${day}` : today ? "§7Today: §fnothing much yet" : "§7No visit to the zoo yet.",
    `§7Likes: §f${tagList(res.likes, LIKE_NAMES) || "nothing in particular"}`,
    `§7Doesn't like: §f${tagList(res.dislikes, LIKE_NAMES) || "nothing in particular"}`,
    res.attributes?.length ? `§7Known for being: §f${tagList(res.attributes, ATTRIBUTE_NAMES)}` : undefined,
    "",
    "§8Each visit starts at 3 hearts: a heart up for each like they come across, one down for each dislike. Happy residents tip at the Donation Boxes and lift the park's rating a little.",
  ].filter((x) => x !== undefined).join("\n");
  await show(player, new ActionFormData().title(res.name).body(body).button("Goodbye"));
}
