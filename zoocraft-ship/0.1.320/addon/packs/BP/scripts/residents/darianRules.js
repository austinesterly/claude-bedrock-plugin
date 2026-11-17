// Darian's quest (0.1.314; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, section 7: "The
// implementation must save the status of Darian's friendship rewards and the dragon quest independently"). His
// friendship rewards are each player's own (the friendship record's `rewards`, residents/rewardRules.js); the quest is
// the world's, kept apart from any friendship: a record of the spec's states, each with the world day it was reached.
// A state once reached stays reached. The names are Austin's, word for word; later versions reach the rest.
// No engine calls here.

export const DARIAN_ID = "darian";

/** The spec's quest states, in its order. */
export const QUEST_STATES = [
  "DARIAN_UNLOCKED",
  "MELDER_RECEIVED",
  "MELDING_BOOK_RECEIVED",
  "DRAGON_LEGEND_HEARD",
  "DRAGON_NIGHTMARE_HEARD",
  "VOID_PORTAL_UNLOCKED",
  "VOID_PORTAL_ACTIVATED",
  "BEEF_REQUESTED",
  "BEEF_DELIVERED",
  "GIANT_BEEF_CREATED",
  "GIANT_BEEF_PLACED",
  "DRAGON_WAIT_STARTED",
  "DRAGON_READY",
  "DRAGON_LURED_TO_VOID",
  "DRAGON_BOSS_ACTIVE",
  "DRAGON_TRANSFORMED",
  "DAMIEN_REVEALED",
  "DAMIEN_EXHIBITED",
  "DAMIEN_RECRUITED",
  "DARIAN_WAND_RECEIVED",
];

/** What he tells with friendship that moves the quest on (data/residents.js: his rewards' `ability`). */
export const ABILITY_STATE = {
  dragon_legend: "DRAGON_LEGEND_HEARD",
  dragon_nightmare: "DRAGON_NIGHTMARE_HEARD",
  void_portal_plan: "VOID_PORTAL_UNLOCKED", // 0.1.316
  beef_request: "BEEF_REQUESTED", // 0.1.317
  beef_wait: "DRAGON_WAIT_STARTED",
};

/** What he hands over with friendship that the quest keeps (0.1.315: data/residents.js, his rewards' `item`). */
export const ITEM_STATE = {
  "zoocraft:melder": "MELDER_RECEIVED",
  "zoocraft:book_of_melding": "MELDING_BOOK_RECEIVED",
  "zoocraft:freezing_wand": "DARIAN_WAND_RECEIVED", // 0.1.320
};

/** A new, empty quest record. */
export const newQuest = () => ({ id: "quest", states: {} });

/** Whether the quest has reached a state. */
export const hasState = (rec, state) => rec?.states?.[state] !== undefined;

/** The record with a state reached on `day`; the same record when it already was, or the state isn't one of the spec's. */
export function withState(rec, state, day) {
  if (!QUEST_STATES.includes(state) || hasState(rec, state)) return rec;
  return { ...rec, states: { ...(rec?.states ?? {}), [state]: day } };
}

/** Whether one of his rewards may come yet, by the quest (0.1.316: `needs: "void_portal_lit"`). */
export function questGate(reward, rec) {
  if (reward?.needs === "void_portal_lit") return hasState(rec, "VOID_PORTAL_ACTIVATED");
  if (reward?.needs === "beef_delivered") return hasState(rec, "BEEF_DELIVERED"); // 0.1.317: he has the 64 Raw Beef
  if (reward?.needs === "beef_placed") return hasState(rec, "GIANT_BEEF_PLACED") && Boolean(rec?.beef); // and the Giant Beef hangs now
  return true;
}

/** The states reached, in the spec's order. */
export function statesReached(rec) {
  return QUEST_STATES.filter((s) => hasState(rec, s));
}
