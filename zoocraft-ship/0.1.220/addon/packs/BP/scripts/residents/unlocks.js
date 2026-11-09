// Austin's residents unlocking and moving in (0.1.220, research/npc_spec_plan.md sections 2 and 3). Every few seconds
// each resident's zoo goal (data/residents.js `unlock`) is checked against what the zoo has on display, world-wide
// (residentRules.js displayStats); once met they're unlocked for good (residents/people.js) and every player is told.
// An unlocked resident with no home moves into an empty home that works and whose Resident Mailbox is set to ON
// (homes.js homeAvailable), by day, one at a time, the first unlocked first. The mailbox's owner can still pick one of
// those waiting from the mailbox instead.
import { world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { RESIDENTS, KIND_SPECIES, residentById, unlockWords } from "../data/residents.js";
import { allAnimals } from "../animals/animals.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { allHomes, homeWorks, homeWay, homeAvailable } from "./homes.js";
import { allResidents, residentOfHome, moveIn } from "./residents.js";
import { displayStats, unlockProgress, arrivalTime } from "./residentRules.js";
import { isUnlocked, unlockedPeople, markUnlocked } from "./people.js";
import { onlinePlayers, message } from "../platform/mc.js";
import { info } from "../core/log.js";

/** What the whole zoo has on display now (every park in the world). */
export function zooOnDisplay() {
  return displayStats(allAnimals(), allExhibits());
}

/** How far the zoo is towards a resident's goal: { have, need, met }. */
export function progressOf(res, stats = zooOnDisplay()) {
  return unlockProgress(res.unlock, stats, KIND_SPECIES);
}

/** Unlocked residents with no home yet, the first unlocked first. */
export function waitingResidents() {
  const housed = new Set(allResidents().map((r) => r.id));
  return unlockedPeople()
    .filter((p) => !housed.has(p.id))
    .map((p) => residentById(p.id))
    .filter(Boolean);
}

/** Homes a newcomer can move into: working, with a way to the zoo, a door, Move-in ON and nobody in them. */
export function freeHomes() {
  return allHomes()
    .filter((h) => homeAvailable(h) && homeWorks(h) && homeWay(h.id) && h.door && !residentOfHome(h.id))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

function tell(text) {
  for (const p of onlinePlayers()) message(p, text);
}

/** Every few seconds: new unlocks, then one arrival if anyone's waiting and a home is free. */
export function tickUnlocks() {
  const stats = zooOnDisplay();
  for (const res of RESIDENTS) {
    if (isUnlocked(res.id) || !progressOf(res, stats).met) continue;
    if (!markUnlocked(res.id, world.getDay())) continue;
    info(`residents: ${res.name} unlocked (${unlockWords(res.unlock)})`);
    tell(`§6${res.name} can move in now! §f(${unlockWords(res.unlock)}.) §7Give them a home: a house with a bed and a door, a Resident Mailbox set to Move-in ON, and a path to the zoo.`);
  }
  if (!arrivalTime(world.getTimeOfDay(), BALANCE.residents)) return;
  const res = waitingResidents()[0];
  const home = res ? freeHomes()[0] : undefined;
  if (!res || !home || !moveIn(home, res.id)) return;
  info(`residents: ${res.name} moved into ${home.id}`);
  tell(`§a${res.name} has moved into the house at ${home.pos.x}, ${home.pos.y}, ${home.pos.z}!`);
}
