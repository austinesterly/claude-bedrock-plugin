import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { PROJECTS } from "../data/research.js";
import { getPark, can, denyText, withPark } from "../park/park.js";
import { balanceText, sandboxOn } from "../park/rules.js";
import { projectState, runProject, itemName } from "../research/research.js";
import { message } from "../platform/mc.js";

// Research Desk menu (spec section 4): the projects, what each needs, and doing one.
// 0.1.114: research belongs to the park the desk stands in (`scope`); the form's answer comes back outside any
// scope, so the state reads and the project run inside withPark(scope).

const parts = (p) => Object.entries(p.items).map(([item, n]) => `${itemName(item)} x ${n}`).join(", ");

export async function researchMenu(player, scope = getPark()) {
  const park = scope && withPark(scope, getPark);
  if (!park) return message(player, "§eClaim a park with the Park Deed first.");
  const intro = sandboxOn(park) ? "§dSandbox mode: every project is open and free." : "§7Projects open as your Field Journal fills in. Each costs crafted parts from your inventory and some Zoo Coins.";
  const form = new ActionFormData().title("Research Desk").body(`${intro}\n§fZoo Coins: ${balanceText(park)}`);
  const states = withPark(park, () => PROJECTS.map((p) => projectState(p, player)));
  PROJECTS.forEach((p, i) => {
    const st = states[i];
    const line = st.done ? "§aDone" : st.locked ? `§8Needs ${st.missing.join(", ")}` : st.short.length || !st.afford ? "§eOpen: gather the parts" : "§2Ready to research";
    form.button(`${p.name}\n${line}`);
  });
  form.button("Close");
  const r = await show(player, form);
  if (!r || r.selection === undefined || !PROJECTS[r.selection]) return;
  await projectPage(player, PROJECTS[r.selection], park);
  return researchMenu(player, park);
}

async function projectPage(player, p, park) {
  const st = withPark(park, () => projectState(p, player));
  const lines = [`§f${p.text}`, ""];
  if (st.done) lines.push("§aResearched.");
  else if (st.locked) lines.push(`§7Opens with: ${st.missing.join(", ")}.`);
  else if (st.sandbox) lines.push(`§dSandbox mode: free. §8(Normally ${parts(p)} and ${p.cost} Zoo Coins.)`);
  else {
    lines.push(`§fCosts: §7${parts(p)} and §e${p.cost} Zoo Coins`);
    if (st.short.length) lines.push(`§cYou're missing ${st.short.join(", ")}.`);
  }
  if (st.done || st.locked) return show(player, new ActionFormData().title(p.name).body(lines.join("\n")).button("Back"));
  const r = await show(player, new MessageFormData().title(p.name).body(lines.join("\n")).button1("Research").button2("Back"));
  if (r?.selection !== 0) return;
  if (!can(player, "spend", park)) return message(player, denyText("spend", park));
  const res = withPark(park, () => runProject(player, p));
  message(player, res.ok ? `§aResearched ${p.name}. §f${p.text}` : `§e${res.reason}`);
}
