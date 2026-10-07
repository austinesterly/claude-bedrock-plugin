// Per-player quest state, saved as versioned JSON in one player dynamic property.
// Shape (v2): { v: 2, active: { [questId]: { n, at } }, done: { [questId]: { times, last } } }
//   n    kill count so far (collect quests read the inventory instead)
//   at   world.getAbsoluteTime() when accepted
//   last world.getAbsoluteTime() of the last turn-in (cooldowns)
// One player's state stays small (a few hundred bytes per quest), far under the 32,767-byte
// string cap. If you add long free-text fields or hundreds of quests, split into several keys.

import { world } from "@minecraft/server";
import { QUESTS } from "./quests.js";

const KEY = "ns:quests";
const VERSION = 2;
const MAX_CHARS = 30000;

const cache = new Map(); // player.id -> state object

function fresh() {
  return { v: VERSION, active: {}, done: {} };
}

/** Upgrade old saves step by step, then drop quests that no longer exist. */
function migrate(s) {
  if (!s || typeof s !== "object") return fresh();
  if (s.v === 1) {
    // v1 kept active quests as an array of ids and had no history.
    const active = {};
    for (const id of Array.isArray(s.active) ? s.active : []) active[id] = { n: 0, at: 0 };
    s = { v: 2, active, done: {} };
  }
  if (s.v !== VERSION) return fresh();
  if (!s.active || typeof s.active !== "object") s.active = {};
  if (!s.done || typeof s.done !== "object") s.done = {};
  for (const id of Object.keys(s.active)) if (!QUESTS[id]) delete s.active[id];
  for (const id of Object.keys(s.done)) if (!QUESTS[id]) delete s.done[id];
  return s;
}

export function getState(player) {
  let s = cache.get(player.id);
  if (s) return s;
  const raw = player.getDynamicProperty(KEY);
  try {
    s = migrate(typeof raw === "string" ? JSON.parse(raw) : undefined);
  } catch {
    console.warn(`[ns:quests] unreadable save for ${player.name}, starting fresh`);
    s = fresh();
  }
  cache.set(player.id, s);
  return s;
}

export function saveState(player, s) {
  cache.set(player.id, s);
  const json = JSON.stringify(s);
  if (json.length > MAX_CHARS) {
    console.warn(`[ns:quests] save for ${player.name} is ${json.length} chars; not saved`);
    return false;
  }
  player.setDynamicProperty(KEY, json);
  return true;
}

export function forget(playerId) {
  cache.delete(playerId);
}

/** Wipe one player's quest data (testing). */
export function resetState(player) {
  cache.delete(player.id);
  player.setDynamicProperty(KEY, undefined);
}

export const now = () => world.getAbsoluteTime();
