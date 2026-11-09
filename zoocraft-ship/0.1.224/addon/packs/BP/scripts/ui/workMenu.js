import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import { show } from "./forms.js";
import { BALANCE } from "../data/balance.js";
import { getSite, recheckSite, assignWorker, releaseWorker } from "../residents/work.js";
import { siteText, skillText, capacityOf, WORK_KINDS, workKindOf, ORE_WORDS, SKILL_NAMES } from "../residents/workRules.js";
import { allResidents, getResident, workState } from "../residents/residents.js";
import { RESIDENTS, residentById } from "../data/residents.js";
import { tagList } from "../residents/residentRules.js";
import { message } from "../platform/mc.js";

// The Work Anchor's menu (0.1.224, stage D of Austin's residents spec: research/npc_spec_plan.md section 8): what the
// work site needs and has (fenced in all round, a fence gate, a chest or barrel beside the anchor, a worker, the path
// from their front door to the gate), who works there, their skill and this shift's work. Only the player who placed the
// anchor chooses or lets go its worker (an anchor with no owner lets anyone).

const ok = (yes, text) => `${yes ? "§a+" : "§c-"} §f${text}`;

// The order a site's problems are found in (workRules.js siteProblem): everything before the problem is fine.
const ORDER = ["dimension", "park", "seed", "unloaded", "gateOpen", "open", "small", "noGate", "noChest", "noWorker", "homeInPark", "workerHome", "noPath", "unchecked"];

function mayChange(player, site) {
  return !site.owner || site.owner === player.id;
}

// Why a shift ended early, for the anchor and the worker's page.
export const STOP_TEXT = {
  done: "as much as this site holds in a shift (a bigger site holds more)",
  full: "the chest was full: empty it to make room",
  chest: "the chest or barrel beside the anchor was gone",
  none: "nothing left in reach to mine: put ores in the walls, or wait for mined ones to grow back",
  skill: "nothing left in reach they're skilled enough to mine yet",
  shift: "the shift ended",
};

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export async function workMenu(player, siteId) {
  const site = getSite(siteId);
  if (!site) return;
  const g = BALANCE.residents.work;
  const p = site.problem;
  const fine = (k) => p === undefined || ORDER.indexOf(p) > ORDER.indexOf(k);
  const rec = site.worker ? getResident(site.worker) : undefined;
  const res = site.worker ? residentById(site.worker) : undefined;
  const kind = WORK_KINDS[workKindOf(res) ?? "mine"];
  const ws = rec ? workState(rec) : undefined;
  const measured = site.cells !== undefined && !["dimension", "park", "seed", "unloaded"].includes(p);
  const lines = [
    p ? `§e${siteText(p, { at: p === "open" ? site.escape : p === "gateOpen" ? site.openGate : undefined, who: res?.name, minCells: g.minCells })}` : `§aThe ${kind.site} is ready for work.`,
    "",
    ok(fine("park"), "Outside every zoo's fence, in the Overworld"),
    ok(fine("open"), "Fenced in all round (fences, walls or blocks two high)"),
    ok(fine("small"), measured ? `Floor inside: ${site.cells} blocks (at least ${g.minCells})` : `At least ${g.minCells} blocks of floor inside`),
    ok(fine("noGate"), "A fence gate in the fence"),
    ok(fine("noChest"), "A chest or barrel beside the Work Anchor"),
    ok(Boolean(rec), rec ? `${res?.name ?? "Someone"} works here` : "A worker"),
    ok(rec ? fine("noPath") && p !== "unchecked" : false, rec ? `A path from ${res?.name ?? "their"}'s front door to the gate` : "A path from the worker's front door to the gate"),
    "",
  ];
  if (measured && site.targets !== undefined) lines.push(`§7Ores in reach of the floor: §f${site.targets}${site.spent?.length ? ` §8(${site.spent.length} more growing back)` : ""}`);
  if (rec && ws) {
    const s = ws.shift;
    lines.push(`§7${res.name}: §f${skillText(ws.goodShifts, g)}`);
    lines.push(`§7Works: §f${tagList(ORE_WORDS.slice(0, ws.skill + 1), {})}`);
    if (s) lines.push(`§7Shift: §f${res.shift === "night" ? "midnight to dawn" : "morning to noon"}, up to ${capacityOf(site.cells, g)} ores a shift here`);
    const job = ws.job;
    if (job) lines.push(`§7This shift: §f${plural(job.done, "ore")}${job.wait ? " §e(waiting: the site needs fixing)" : job.over ? ` §8(done: ${STOP_TEXT[job.why] ?? "the shift ended"})` : ""}`);
    else if (ws.last) lines.push(`§7Last shift: §f${plural(ws.last.done ?? 0, "ore")}${ws.last.good ? " §a(a good shift)" : ""}${ws.last.why ? ` §8(${STOP_TEXT[ws.last.why] ?? ""})` : ""}`);
  }
  lines.push(
    "",
    `§8Only ores within reach of the floor are mined (an ${SKILL_NAMES[0]} works ${ORE_WORDS[0]}; ${SKILL_NAMES[1]} from ${g.skillFrom[1]} good shifts adds ${ORE_WORDS[1]}; ${SKILL_NAMES[2]} from ${g.skillFrom[2]} adds ${ORE_WORDS[2]}). Each leaves its stone in its place and grows back after ${g.regrowDays} days. Nothing else is ever broken or placed. What's mined goes in the chest; work earns the zoo nothing, but a good shift (${g.goodShift} ores or more) makes them more skilled and their next zoo visit a heart happier.`,
  );
  const form = new ActionFormData().title("Work Anchor").body(lines.join("\n"));
  const actions = [];
  const add = (label, fn) => {
    form.button(label);
    actions.push(fn);
  };
  const changer = mayChange(player, site);
  if (changer) add(rec ? `Choose another worker\n§8${res?.name ?? "Someone"} works here now` : "Choose a worker", () => chooseWorker(player, site.id));
  if (rec && changer) add(`Let ${res?.name ?? "them"} go`, () => letGo(player, site.id));
  add("Check the site again", () => {
    recheckSite(site.id);
    message(player, "§7Checking the work site and the path to it. Use the Work Anchor again in a moment.");
  });
  add("Close", () => {});
  if (!changer) form.body(`${lines.join("\n")}\n§8Only ${site.ownerName ?? "the player who placed the Work Anchor"} can choose who works here.`);
  const r = await show(player, form);
  if (r && r.selection !== undefined) await actions[r.selection]?.();
}

// The residents who could work here: those who live in a home and have work (only the miner's so far).
async function chooseWorker(player, siteId) {
  const site = getSite(siteId);
  if (!site) return;
  const workers = allResidents().filter((rec) => workKindOf(residentById(rec.id)));
  if (!workers.length) {
    const who = RESIDENTS.filter((r) => workKindOf(r)).map((r) => `${r.name} the ${r.occupation}`);
    message(player, `§eNobody who lives here has work yet. ${tagList(who, {})} works a ${WORK_KINDS.mine.site}, once moved in.`);
    return;
  }
  const form = new ActionFormData().title("Choose a worker").body("§7Who works at this site? They walk the path from their front door to its gate for their shift, and home again after.");
  const ids = [];
  for (const rec of workers) {
    const res = residentById(rec.id);
    const ws = workState(rec);
    const elsewhere = ws?.site && ws.site.id !== site.id ? `works at the ${WORK_KINDS[ws.kind].site} at ${ws.site.pos.x}, ${ws.site.pos.y}, ${ws.site.pos.z}: choosing them moves them here` : ws?.site ? "works here now" : `${res.occupation}, ${res.shift === "night" ? "works nights" : "works days"}`;
    form.button(`${res.name}\n§8${elsewhere}`);
    ids.push(rec.id);
  }
  form.button("Back");
  const r = await show(player, form);
  if (r?.selection === undefined || r.selection >= ids.length) return;
  const id = ids[r.selection];
  const why = assignWorker(siteId, id);
  const name = residentById(id)?.name ?? "They";
  if (why === "gone") return message(player, "§eThe Work Anchor isn't there any more.");
  if (why === "taken") return message(player, "§eSomeone else works here. Let them go first.");
  message(player, `§a${name} works here now. §7Checking the site and the path from ${name}'s front door to its gate: use the Work Anchor again in a moment.`);
}

async function letGo(player, siteId) {
  const site = getSite(siteId);
  const res = site?.worker ? residentById(site.worker) : undefined;
  if (!site || !res) return;
  const r = await show(player, new MessageFormData().title("Let them go?").body(`§fLet ${res.name} go from this site? They stop coming here; their skill stays with them.`).button1("Keep them").button2("Let go"));
  if (r?.selection !== 1) return;
  if (getSite(siteId)?.worker !== res.id) return;
  releaseWorker(siteId);
  message(player, `§7${res.name} doesn't work here any more.`);
}
