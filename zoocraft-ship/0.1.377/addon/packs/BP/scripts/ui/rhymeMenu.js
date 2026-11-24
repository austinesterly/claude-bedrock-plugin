// Jared's rhymes (0.1.377; rules residents/rhymeRules.js). Once he has asked (friendship 100), "Give Jared a rhyming
// pair" on his menu: the player picks two things they carry; a pair that rhymes he keeps (one of each), any other he
// hands back with a word. After four pairs he performs a freestyle with the eight words in it, line by line in chat,
// and "Hear my freestyle" plays it again any time.
import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { db } from "../persistence/db.js";
import { bondOf } from "../residents/bonds.js";
import { bondLine } from "../residents/bondRules.js";
import { JAMMER } from "../residents/jamRules.js";
import { RHYME_ABILITY, PAIRS_NEEDED, wordOf, pairWhy, freestyle } from "../residents/rhymeRules.js";
import { message, countItem, takeItem } from "../platform/mc.js";

const COL = "jaredRhymes";
const record = (player) => db.get(COL, player.id) ?? { id: player.id, pairs: [] };
const res = () => residentById(JAMMER);
const say = (player, key, vars = {}) => {
  let line = bondLine(res(), key);
  for (const [k, v] of Object.entries(vars)) line = line.split(`{${k}}`).join(v);
  message(player, `§f${res().name}: §7"${line}"`);
};
const pretty = (typeId) => String(typeId).split(":").pop().split("_").join(" ");

/** Whether he has asked this player for rhymes; and what their menu button reads. */
export const rhymesAsked = (player) => bondOf(JAMMER, player.id)?.rewards?.[RHYME_ABILITY] !== undefined;
export function rhymeButton(player) {
  if (!rhymesAsked(player)) return undefined;
  const rec = record(player);
  return rec.done ? "Hear my freestyle" : `Give Jared a rhyming pair (${rec.pairs.length} of ${PAIRS_NEEDED})`;
}

// What the player carries: one entry a kind, in inventory order.
function carried(player) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  const out = [];
  if (!inv) return out;
  for (let i = 0; i < inv.size; i++) {
    const id = inv.getItem(i)?.typeId;
    if (id && !out.includes(id)) out.push(id);
  }
  return out;
}

async function pick(player, title, body, kinds) {
  const form = new ActionFormData().title(title).body(body);
  for (const id of kinds) form.button(pretty(id));
  form.button("Never mind");
  const a = await show(player, form);
  return a?.selection !== undefined && a.selection < kinds.length ? kinds[a.selection] : undefined;
}

/** The freestyle, a line at a time, slow enough to read. */
export function perform(player, lines) {
  const gap = BALANCE.residents.jam.lineTicks;
  lines.forEach((line, i) => {
    system.runTimeout(() => {
      try {
        if (player.isValid) message(player, i === 0 || i === lines.length - 1 ? `§f${res().name}: §7"${line}"` : `§b  ${line}`);
      } catch {
        // they left
      }
    }, 20 + i * gap);
  });
}

/** His rhymes page for this player. */
export async function rhymeMenu(player) {
  if (!rhymesAsked(player)) return;
  const rec = record(player);
  if (rec.done) {
    perform(player, rec.lines ?? freestyle(rec.pairs, player.name));
    return;
  }
  const kinds = carried(player);
  if (kinds.length < 2) {
    say(player, "rhymeEmpty");
    return;
  }
  const first = await pick(player, res().name, `Pair ${rec.pairs.length + 1} of ${PAIRS_NEEDED}. Which is the first item? He keeps one of each when they rhyme.`, kinds);
  if (!first) return;
  const second = await pick(player, res().name, `The first is ${pretty(first)}. Which item rhymes with it?`, kinds.filter((k) => k !== first));
  if (!second) return;
  const names = { a: wordOf(first).split("_").join(" "), b: wordOf(second).split("_").join(" ") };
  const why = pairWhy(first, second, rec.pairs);
  if (why) {
    say(player, why === "had" ? "rhymeHad" : "rhymeNo", names);
    return;
  }
  if (countItem(player, first) < 1 || countItem(player, second) < 1 || !takeItem(player, first, 1)) return;
  if (!takeItem(player, second, 1)) return;
  rec.pairs = [...rec.pairs, [first, second]];
  if (rec.pairs.length < PAIRS_NEEDED) {
    db.put(COL, rec);
    say(player, "rhymeYes", { ...names, n: String(rec.pairs.length), left: String(PAIRS_NEEDED - rec.pairs.length) });
    return;
  }
  rec.done = true;
  rec.lines = freestyle(rec.pairs, player.name);
  db.put(COL, rec);
  say(player, "rhymeDone", names);
  perform(player, rec.lines);
}

/** For the test server. */
export function rhymeDebug(player) {
  return record(player);
}
