// ui/hud.js - the single owner of the action bar. Other modules register text providers
// instead of calling setActionBar themselves (two writers = flicker).
// @minecraft/server 2.10.0.
//
// Usage:
//   import { addHudProvider, hudFlash, announce, startHud } from "./ui/hud.js";
//   addHudProvider("coins", (p) => `§e${getCoins(p)} coins`, 10);   // lower order = further left
//   hudFlash(player, "§aQuest complete!", 60);                        // overrides for 60 ticks
//   world.afterEvents.worldLoad.subscribe(() => startHud());

import { system, world } from "@minecraft/server";

const UPDATE_EVERY = 5;   // ticks between recomputes
const HEARTBEAT = 40;     // re-send unchanged text this often so it doesn't fade
const SEPARATOR = "  §7|§r  ";

const providers = [];               // { id, order, fn }
const state = new Map();            // player.id -> { last, lastSentTick, flash, flashUntil, enabled }

/** fn(player) returns a string, a RawMessage, or "" / undefined to skip. */
export function addHudProvider(id, fn, order = 100) {
  const i = providers.findIndex((p) => p.id === id);
  if (i >= 0) providers.splice(i, 1);
  providers.push({ id, order, fn });
  providers.sort((a, b) => a.order - b.order);
}

export function removeHudProvider(id) {
  const i = providers.findIndex((p) => p.id === id);
  if (i >= 0) providers.splice(i, 1);
}

function st(player) {
  let s = state.get(player.id);
  if (!s) { s = { last: "", lastSentTick: -HEARTBEAT, flash: undefined, flashUntil: 0, enabled: true }; state.set(player.id, s); }
  return s;
}

/** Show a one-off message in the action bar for `ticks`, then go back to the providers. */
export function hudFlash(player, text, ticks = 60) {
  const s = st(player);
  s.flash = text;
  s.flashUntil = system.currentTick + ticks;
  s.last = "";             // force a send on the next update
}

/** Turn the provider HUD on/off for one player (e.g. from settings). */
export function setHudEnabled(player, enabled) {
  const s = st(player);
  s.enabled = enabled;
  if (!enabled && player.isValid) player.onScreenDisplay.setActionBar("");
}

/** Title + subtitle for events. Durations in ticks. */
export function announce(player, title, subtitle = "", stay = 50) {
  player.onScreenDisplay.setTitle(title, { fadeInDuration: 5, stayDuration: stay, fadeOutDuration: 10, subtitle });
}

function compose(player) {
  const parts = [];
  for (const p of providers) {
    try {
      const v = p.fn(player);
      if (v === undefined || v === null || v === "") continue;
      parts.push(v);
    } catch (e) {
      console.warn(`[ns:hud] provider ${p.id}: ${e}`);
    }
  }
  if (parts.length === 0) return "";
  if (parts.every((x) => typeof x === "string")) return parts.join(SEPARATOR);
  // Mixed strings and RawMessages: one rawtext.
  const rawtext = [];
  parts.forEach((x, i) => {
    if (i > 0) rawtext.push({ text: SEPARATOR });
    rawtext.push(typeof x === "string" ? { text: x } : x);
  });
  return { rawtext };
}

function update() {
  const now = system.currentTick;
  for (const player of world.getAllPlayers()) {
    const s = st(player);
    if (!s.enabled) continue;
    let content = s.flash !== undefined && now < s.flashUntil ? s.flash : compose(player);
    if (s.flash !== undefined && now >= s.flashUntil) s.flash = undefined;
    const key = typeof content === "string" ? content : JSON.stringify(content);
    if (key === "" && s.last === "") continue;  // nothing to show, nothing shown
    if (key === s.last && now - s.lastSentTick < HEARTBEAT) continue;
    player.onScreenDisplay.setActionBar(content);
    s.last = key;
    s.lastSentTick = now;
  }
}

let started = false;
/** Call once, after world load. */
export function startHud() {
  if (started) return;
  started = true;
  system.runInterval(() => {
    try { update(); } catch (e) { console.warn(`[ns:hud] ${e}`); }
  }, UPDATE_EVERY);
  world.afterEvents.playerLeave.subscribe(({ playerId }) => state.delete(playerId));
}
