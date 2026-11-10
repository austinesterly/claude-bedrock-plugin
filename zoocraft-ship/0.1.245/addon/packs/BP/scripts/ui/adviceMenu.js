// A resident's advice page (0.1.245; residents/adviceRules.js, data/residentAdvice.js): what they've taught this player
// so far, and their friendship rewards that are things (Terra's plans) to ask for again when none is carried.
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { residentById } from "../data/residents.js";
import { ADVICE } from "../data/residentAdvice.js";
import { adviceText } from "../residents/adviceRules.js";
import { bondOf } from "../residents/bonds.js";
import { rewardDue, rewardsEarned } from "../residents/rewardRules.js";
import { carries, copyAgain } from "../residents/rewards.js";
import { message } from "../platform/mc.js";

export async function advicePage(player, id) {
  const res = residentById(id);
  const advice = ADVICE[id];
  if (!res || !advice) return;
  for (;;) {
    const b = bondOf(id, player.id);
    const asks = rewardsEarned(res, b).filter((r) => r.item && !carries(player, r));
    const due = rewardDue(res, b);
    const body = `${adviceText(advice, b.points)}${due ? `\n\n§aThey have something for you: talk to them.` : ""}`;
    const form = new ActionFormData().title(advice.title).body(body);
    for (const r of asks) form.button(`Ask for ${r.name}\n§8You carry none`);
    form.button("Back");
    const r = await show(player, form);
    if (r?.selection === undefined || r.selection >= asks.length) return;
    const again = copyAgain(player, res, asks[r.selection]);
    if (again) message(player, `§f${res.name}: §7"${again.line}" §aThey give you ${again.name}${again.dropped ? " §8(at your feet: your inventory is full)" : ""}§a.`);
  }
}
