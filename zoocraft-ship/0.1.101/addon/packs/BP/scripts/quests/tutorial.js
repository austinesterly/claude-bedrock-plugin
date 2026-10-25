import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { ITEMS, BLOCKS } from "../data/items.js";
import { on } from "../core/events.js";
import { dayOf } from "../core/clock.js";
import { TUTORIAL_STEPS, completeSteps, currentStep, kitOffer } from "./steps.js";
import { getPark, parkTime, parkEdge } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { allFeeders } from "../equipment/feeder.js";
import { allAnimals } from "../animals/animals.js";
import { allPoints } from "../visitors/points.js";
import { pathSummary } from "../visitors/network.js";
import { countItem, giveItem, message, onlinePlayers } from "../platform/mc.js";

// Caretaker tutorial: one shared progress record for the park (the zoo is shared), checked every
// two seconds against the park's real state, so it can't be skipped or lost by losing items.
// Only this module writes the "quests" collection.

const Q = "quests";
const ID = "tutorial";

function quest() {
  return db.get(Q, ID) ?? { id: ID, completed: {}, flags: {}, kitClaims: 0, kitDay: undefined, finished: false };
}

function members() {
  const park = getPark();
  return onlinePlayers().filter((p) => park?.members[p.id]);
}

function facts(q) {
  const park = getPark();
  if (!park) return {};
  const exhibits = allExhibits();
  const feeders = allFeeders();
  const carriesTools = members().some((p) => [BLOCKS.controller, ITEMS.habitatMarker, BLOCKS.feeder].every((id) => countItem(p, id) > 0));
  return {
    claim: true,
    workshop: Boolean(q.flags.workshop),
    fence: parkEdge(park) !== "none",
    tools: carriesTools || (exhibits.length > 0 && feeders.length > 0),
    exhibit: exhibits.some((ex) => ex.state === "ready" || ex.state === "occupied"),
    food: feeders.some((f) => f.units > 0),
    animal: allAnimals().some((a) => a.location.kind === "exhibit"),
    care: Boolean(q.flags.care),
    path: (pathSummary()?.size ?? 0) >= BALANCE.paths.tutorialBlocks,
    viewing: allPoints("viewpoint").some((v) => v.viewed),
    open: park.open && Boolean(park.entrance),
    income: park.today.revenue > 0 || park.lastDay.revenue > 0,
  };
}

export function tickTutorial() {
  const park = getPark();
  if (!park) return;
  const q = quest();
  if (q.finished) return;
  // A park claimed before 0.1.101, already past its workshop, has its circle: the fence step is done without a word.
  if (q.completed.workshop !== undefined && q.completed.fence === undefined && parkEdge(park) === "circle") {
    q.completed.fence = q.completed.workshop;
    db.put(Q, q);
  }
  const newly = completeSteps(q.completed, facts(q));
  if (!newly.length) return;
  const now = parkTime();
  for (const id of newly) q.completed[id] = now;
  const next = currentStep(q.completed);
  q.finished = !next;
  db.put(Q, q);
  if (!next) earn(BALANCE.tutorial.reward, "Tutorial complete", "grant:tutorial");
  db.flush();
  const last = TUTORIAL_STEPS.find((s) => s.id === newly[newly.length - 1]);
  for (const p of members()) {
    message(p, `§aTutorial: ${newly.length > 1 ? `${newly.length} steps done` : `${last.title} done`}!`);
    if (next) message(p, `§fNext: §b${next.title}§f. §7${next.hint}`);
    else message(p, `§6Tutorial complete! §f+${BALANCE.tutorial.reward} Zoo Coins. Spend them on supplies or a second habitat.`);
    try {
      p.playSound("random.levelup");
    } catch {
      // Cosmetic only.
    }
  }
}

// For the sidebar and the Park Ledger journal.
export function tutorialStatus() {
  const q = quest();
  const next = currentStep(q.completed);
  return { done: TUTORIAL_STEPS.filter((s) => q.completed[s.id] !== undefined).length, total: TUTORIAL_STEPS.length, next, steps: TUTORIAL_STEPS, completed: q.completed, kitClaims: q.kitClaims };
}

export function claimKit(player) {
  if (!getPark()?.members[player.id]) return message(player, "§eOnly park members can take the replacement kit.");
  const q = quest();
  const day = dayOf(parkTime(), BALANCE.clock.dayLength);
  const owned = {};
  for (const { item } of BALANCE.tutorial.kit) owned[item] = countItem(player, item) > 0;
  const offer = kitOffer(q, day, owned, BALANCE.tutorial.kit, BALANCE.tutorial.maxKitClaims);
  if (!offer.ok) return message(player, `§e${offer.reason}`);
  q.kitClaims += 1;
  q.kitDay = day;
  db.put(Q, q);
  db.flush();
  for (const { item, amount } of offer.items) giveItem(player, item, amount);
  message(player, `§aReplacement kit received. §7${BALANCE.tutorial.maxKitClaims - q.kitClaims} left.`);
}

function setFlag(name) {
  const q = quest();
  if (q.finished || q.flags[name]) return;
  q.flags[name] = true;
  db.put(Q, q);
}

export function initTutorial() {
  on("workshopPlaced", () => setFlag("workshop"));
  on("careGiven", () => setFlag("care"));
}
