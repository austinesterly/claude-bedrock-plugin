import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { CARRIERS } from "../data/items.js";
import { PROJECTS } from "../data/research.js";
import { EXPEDITION_STEPS, expeditionFacts } from "./expeditionSteps.js";
import { stepsDone, nextStep } from "./steps.js";
import { tutorialStatus } from "./tutorial.js";
import { getPark, parkTime, parkRecordId } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { allAnimals } from "../animals/animals.js";
import { allFixtures } from "../equipment/fixtures.js";
import { parkLevels } from "../discovery/discovery.js";
import { researched } from "../research/research.js";
import { countItem, message, onlinePlayers } from "../platform/mc.js";

// The End expedition (spec section 4 stages; phase 4 "End research quests"): the campaign chain
// after the caretaker tutorial, with the steps in quests/expeditionSteps.js. One shared record for
// the park, checked every two seconds against the park's real state like the tutorial, so nothing
// can be skipped or lost by losing items. The reward is paid once, by operation id (AC-15). This
// module writes only its own record in the "quests" collection (the tutorial writes its own).

const Q = "quests";
const ID = "end_expedition";

// 0.1.114: one expedition a park (park/park.js parkRecordId).
function quest() {
  const id = parkRecordId(ID);
  return db.get(Q, id) ?? { id, completed: {}, flags: {}, finished: false };
}

function members() {
  const park = getPark();
  return onlinePlayers().filter((p) => park?.members[p.id]);
}

function view(q, people) {
  const stab = CARRIERS.stabilized;
  return {
    researched: PROJECTS.filter((p) => researched(p.id)).map((p) => p.id),
    carrying: people.some((p) => countItem(p, stab.empty) > 0 || countItem(p, stab.occupied) > 0),
    inEnd: Boolean(q.flags.end),
    levels: parkLevels(getPark()), // 0.1.117: what any member knows
    exhibits: allExhibits(),
    animals: allAnimals(),
    anchors: allFixtures().filter((f) => f.type === "anchor"),
  };
}

export function tickExpedition() {
  if (!getPark()) return;
  const q = quest();
  if (q.finished || tutorialStatus().next) return; // the tutorial comes first
  const people = members();
  if (!q.flags.end && people.some((p) => p.dimension.id === "minecraft:the_end")) {
    q.flags.end = true;
    db.put(Q, q);
  }
  const newly = stepsDone(EXPEDITION_STEPS, q.completed, expeditionFacts(view(q, people)));
  if (!newly.length) return;
  const now = parkTime();
  for (const id of newly) q.completed[id] = now;
  const next = nextStep(EXPEDITION_STEPS, q.completed);
  q.finished = !next;
  db.put(Q, q);
  if (!next) earn(BALANCE.expedition.reward, "End expedition complete", "grant:end_expedition");
  db.flush();
  const last = EXPEDITION_STEPS.find((s) => s.id === newly[newly.length - 1]);
  for (const p of people) {
    message(p, `§dEnd expedition: ${newly.length > 1 ? `${newly.length} steps done` : `${last.title} done`}!`);
    if (next) message(p, `§fNext: §d${next.title}§f. §7${next.hint}`);
    else message(p, `§6End expedition complete! §f+${BALANCE.expedition.reward} Zoo Coins. The End wing is open to your guests.`);
    try {
      p.playSound("random.levelup");
    } catch {
      // Cosmetic only.
    }
  }
}

// For the sidebar and the Park Ledger. `open`: the tutorial is done, so the chain is on the Journal
// page; `started`: at least one step is done, so the sidebar and the overview carry it too.
export function expeditionStatus() {
  const q = quest();
  const done = EXPEDITION_STEPS.filter((s) => q.completed[s.id] !== undefined).length;
  return { open: !tutorialStatus().next, started: done > 0, done, total: EXPEDITION_STEPS.length, next: nextStep(EXPEDITION_STEPS, q.completed), steps: EXPEDITION_STEPS, completed: q.completed, finished: q.finished };
}
