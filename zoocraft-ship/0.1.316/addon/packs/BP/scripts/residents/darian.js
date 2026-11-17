// Darian's quest, kept in the world (0.1.314; the rules are residents/darianRules.js). One record, "darian"/"quest".
import { world } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { info } from "../core/log.js";
import { DARIAN_ID, ABILITY_STATE, ITEM_STATE, questGate, newQuest, hasState, withState, statesReached } from "./darianRules.js";

const COL = "darian";

export function questRecord() {
  return db.get(COL, "quest") ?? newQuest();
}

/** Whether the quest has reached a state. */
export function questHas(state) {
  return hasState(questRecord(), state);
}

/** Notes something on the quest record beside its states (0.1.316: where the lit portal stands; that the island is built). */
export function setQuest(patch) {
  db.put(COL, { ...questRecord(), ...patch, id: "quest" });
}

/** Whether one of a resident's rewards may come yet, by Darian's quest (residents/residents.js asks). */
export function darianGate(reward) {
  return questGate(reward, questRecord());
}

/** Reach a state, once. Returns false when it already was. */
export function markQuest(state) {
  const rec = questRecord();
  const next = withState(rec, state, world.getDay());
  if (next === rec) return false;
  db.put(COL, next);
  info(`darian: quest reached ${state}`);
  return true;
}

/** A resident was unlocked (residents/unlocks.js, the test street): Darian's starts his quest record. */
export function noteUnlocked(resId) {
  if (resId === DARIAN_ID) markQuest("DARIAN_UNLOCKED");
}

/** A resident told a player something that comes with friendship (residents/rewards.js): Darian's legend and nightmare move the quest on. */
export function noteAbility(resId, ability) {
  const state = resId === DARIAN_ID ? ABILITY_STATE[ability] : undefined;
  if (state) markQuest(state);
}

/** A resident handed a player a thing that comes with friendship (residents/rewards.js): Darian's Melder and his book (0.1.315). */
export function noteItem(resId, item) {
  const state = resId === DARIAN_ID ? ITEM_STATE[item] : undefined;
  if (state) markQuest(state);
}

/** For the test bench and the logs. */
export function questStatus() {
  return statesReached(questRecord());
}
