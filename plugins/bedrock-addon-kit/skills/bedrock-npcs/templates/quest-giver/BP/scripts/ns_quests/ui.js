// Dialogue tree (ActionFormData + MessageFormData) and the quest log.
// Pattern: build a form, await it, re-check player.isValid, then call synchronous logic.

import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { showForm } from "./forms.js";
import { QUESTS, QUEST_IDS, rewardText } from "./quests.js";
import { Status, abandon, accept, activeIds, cooldownLeft, progressOf, statusOf, turnIn } from "./logic.js";

const NPC_NAME = "Quest Giver";

function progressLine(player, id) {
  const q = QUESTS[id];
  const n = progressOf(player, id);
  const what = q.kind === "kill" ? "defeated" : `${q.itemName} in your bag`;
  return `${n}/${q.count} ${what}`;
}

/** Root of the conversation. Loops until the player says goodbye or closes the form. */
export async function talk(player) {
  for (;;) {
    const actions = [];
    const form = new ActionFormData().title(NPC_NAME).body("Hello there! Looking for work?");
    for (const id of QUEST_IDS) {
      const q = QUESTS[id];
      const st = statusOf(player, id);
      if (st === Status.Ready) { form.button(`§2Turn in§r\n${q.title}`, "textures/items/emerald"); actions.push(["turnin", id]); }
      else if (st === Status.Available) { form.button(`§6New quest§r\n${q.title}`, "textures/items/book_writable"); actions.push(["offer", id]); }
      else if (st === Status.Active) { form.button(`${q.title}\n§8${progressLine(player, id)}`); actions.push(["remind", id]); }
    }
    form.button("Quest log", "textures/items/book_normal"); actions.push(["log"]);
    form.button("Goodbye"); actions.push(["bye"]);

    const r = await showForm(player, form);
    if (!player.isValid || !r || r.canceled || r.selection === undefined) return;
    const [action, id] = actions[r.selection] ?? ["bye"];
    if (action === "bye") return;
    if (action === "log") await questLog(player);
    else if (action === "offer") await offer(player, id);
    else if (action === "remind") await remind(player, id);
    else if (action === "turnin") await finish(player, id);
    if (!player.isValid) return;
  }
}

async function offer(player, id) {
  const q = QUESTS[id];
  const form = new MessageFormData()
    .title(q.title)
    .body(`${q.offer}\n\n§7Goal:§r ${q.count} ${q.kind === "kill" ? "kills" : q.itemName}\n§7Reward:§r ${rewardText(q)}`)
    .button1("Accept")
    .button2("Not now");
  const r = await showForm(player, form);
  if (!player.isValid || !r || r.canceled || r.selection !== 0) return;
  if (accept(player, id)) {
    player.sendMessage(`§eQuest accepted: ${q.title}`);
    player.playSound("mob.villager.yes");
  }
}

async function remind(player, id) {
  const q = QUESTS[id];
  const form = new ActionFormData()
    .title(q.title)
    .body(`${q.offer}\n\n§7Progress:§r ${progressLine(player, id)}`)
    .button("Back")
    .button("§cAbandon quest");
  const r = await showForm(player, form);
  if (!player.isValid || !r || r.canceled || r.selection !== 1) return;
  await confirmAbandon(player, id);
}

async function finish(player, id) {
  const res = turnIn(player, id); // synchronous: re-checks and pays in one go
  player.playSound(res.ok ? "random.levelup" : "mob.villager.no");
  const form = new ActionFormData().title(QUESTS[id].title).body(res.text).button("Thanks");
  await showForm(player, form);
}

async function confirmAbandon(player, id) {
  const q = QUESTS[id];
  const r = await showForm(
    player,
    new MessageFormData().title("Abandon quest?").body(`Progress on "${q.title}" will be lost.`).button1("Abandon").button2("Keep it"),
  );
  if (!player.isValid || !r || r.canceled || r.selection !== 0) return;
  if (abandon(player, id)) player.sendMessage(`§7Abandoned: ${q.title}`);
}

/** Quest log: active quests with progress, plus finished and cooling-down ones. Opened by /ns:quests too. */
export async function questLog(player) {
  for (;;) {
    const ids = activeIds(player);
    const form = new ActionFormData().title("Quest log");
    const lines = [];
    for (const id of QUEST_IDS) {
      const st = statusOf(player, id);
      if (st === Status.Finished) lines.push(`§a+ ${QUESTS[id].title}§r (done)`);
      else if (st === Status.Cooldown) lines.push(`§8${QUESTS[id].title}: again in ${Math.ceil(cooldownLeft(player, id) / 1200)} min`);
    }
    form.body(ids.length ? "Active quests:" : "No active quests. Find a quest giver!");
    for (const id of ids) {
      const ready = statusOf(player, id) === Status.Ready;
      form.button(`${ready ? "§2" : ""}${QUESTS[id].title}§r\n§8${progressLine(player, id)}`);
    }
    if (lines.length) form.label(lines.join("\n"));
    form.button("Close");

    const r = await showForm(player, form);
    if (!player.isValid || !r || r.canceled || r.selection === undefined || r.selection >= ids.length) return;
    const id = ids[r.selection];
    const detail = new ActionFormData()
      .title(QUESTS[id].title)
      .body(`${QUESTS[id].offer}\n\n§7Progress:§r ${progressLine(player, id)}\n§7Reward:§r ${rewardText(QUESTS[id])}`)
      .button("Back")
      .button("§cAbandon quest");
    const d = await showForm(player, detail);
    if (!player.isValid) return;
    if (d && !d.canceled && d.selection === 1) await confirmAbandon(player, id);
  }
}
