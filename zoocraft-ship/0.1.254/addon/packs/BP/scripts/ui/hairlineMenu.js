// Jaylen's Hairline Painting (0.1.254): "Paint my hairline" on his menu, for a player at 100 friendship (kept for
// good once reached): a style, then a colour, and it is on the player's head; "Wipe it off" takes it away.
import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { residentById } from "../data/residents.js";
import { HAIRLINE, HAIRLINE_STYLES, HAIRLINE_COLOURS, canPaint, hairlineOf } from "../data/hairlines.js";
import { bondOf, saveBond } from "../residents/bonds.js";
import { bondLine } from "../residents/bondRules.js";
import { rewardsOf, withReward } from "../residents/rewardRules.js";
import { paintHairline, wipeHairline, wornHairline } from "../equipment/hairline.js";
import { message } from "../platform/mc.js";

const say = (player, res, key, extra = "") => message(player, `§f${res.name}: §7"${bondLine(res, key)}"${extra}`);

/** Whether the player's menu for this resident shows "Paint my hairline". */
export function paintsHairlines(res, bond) {
  return res?.id === HAIRLINE.resident && canPaint(bond, HAIRLINE.at);
}

/** The painting menu. Reaching it the first time makes the reward the player's for good. */
export async function hairlineMenu(player, id) {
  const res = residentById(id);
  if (!res) return;
  let b = bondOf(id, player.id);
  if (!paintsHairlines(res, b)) return;
  let first = false;
  const reward = rewardsOf(res).find((r) => r.ability === HAIRLINE.ability);
  if (reward && b.rewards?.[HAIRLINE.ability] === undefined) {
    b = withReward(b, reward, world.getDay());
    saveBond(b, player);
    first = true;
  }
  const worn = hairlineOf(wornHairline(player));
  const form = new ActionFormData()
    .title("Hairline Painting")
    .body([`§7"${bondLine(res, first ? "reward" : "paintAsk")}"`, "", worn ? `§7You wear: §f${worn.style.name}, ${worn.colour.name}` : "§7You wear no painted hairline.", "§8It sits in your helmet slot. Take it off like a helmet, or have it wiped off here."].join("\n"));
  for (const s of HAIRLINE_STYLES) form.button(s.name);
  if (worn) form.button("Wipe it off");
  form.button("Back");
  const r = await show(player, form);
  if (r?.selection === undefined) return;
  if (r.selection < HAIRLINE_STYLES.length) return colourMenu(player, id, HAIRLINE_STYLES[r.selection]);
  if (worn && r.selection === HAIRLINE_STYLES.length) {
    if (wipeHairline(player)) say(player, res, "paintWipe");
  }
}

async function colourMenu(player, id, style) {
  const res = residentById(id);
  if (!res) return;
  const form = new ActionFormData().title(style.name).body("§7Which colour?");
  for (const c of HAIRLINE_COLOURS) form.button(c.name);
  form.button("Back");
  const r = await show(player, form);
  if (r?.selection === undefined) return;
  if (r.selection >= HAIRLINE_COLOURS.length) return hairlineMenu(player, id);
  const colour = HAIRLINE_COLOURS[r.selection];
  if (!paintsHairlines(res, bondOf(id, player.id))) return; // checked again: the menu was open a while
  const done = paintHairline(player, style.id, colour.id);
  if (done.ok) say(player, res, "paintDone", ` §aYou now wear a ${style.name} in ${colour.name}.${done.moved ? " §8(Your helmet is in your inventory.)" : ""}`);
  else if (done.why === "full") say(player, res, "paintHelmet", " §8(Your inventory is full: take your helmet off first.)");
}
