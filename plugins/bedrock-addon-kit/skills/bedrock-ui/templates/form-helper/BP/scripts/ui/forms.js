// ui/forms.js - shared form helpers for @minecraft/server 2.10.0 + @minecraft/server-ui 2.2.0.
// Copy into BP/scripts/ui/forms.js. The other templates import it from "./ui/forms.js".
//
// What it does:
//  - one form at a time per player (a second request while one is open returns undefined)
//  - retries UserBusy (chat, inventory or another screen still open), then gives up
//  - swallows FormRejectError (player left / server shutdown) and returns undefined
//  - works for classic forms (ActionFormData / MessageFormData / ModalFormData)
//    and Data-Driven UI (CustomForm / MessageBox, passed as a builder function)

import { system } from "@minecraft/server";
import {
  DataDrivenScreenClosedReason,
  FormCancelationReason,
  FormRejectError,
  MessageBox,
  uiManager,
} from "@minecraft/server-ui";

const open = new Set(); // player.id of players with a form from this helper on screen

const DEFAULTS = { tries: 8, delayTicks: 10 };

/** True while this helper is showing a form to the player. */
export function hasOpenForm(player) {
  return open.has(player.id);
}

/**
 * Show a classic form (ActionFormData, MessageFormData, ModalFormData).
 * Resolves to the response, or undefined if busy too long, already open, or the player left.
 * A canceled response (player closed it) is returned as-is: check `r.canceled`.
 */
export async function showForm(player, form, options = {}) {
  const { tries, delayTicks } = { ...DEFAULTS, ...options };
  if (!player?.isValid || open.has(player.id)) return undefined;
  open.add(player.id);
  try {
    for (let i = 0; i < tries; i++) {
      const r = await form.show(player);
      if (r.canceled && r.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(delayTicks);
        if (!player.isValid) return undefined;
        continue;
      }
      return r;
    }
    return undefined;
  } catch (e) {
    if (e instanceof FormRejectError) return undefined; // PlayerQuit, ServerShutdown, MalformedResponse
    throw e;
  } finally {
    open.delete(player.id);
  }
}

/**
 * Show a Data-Driven UI screen. `build` is a function returning a fresh CustomForm or MessageBox,
 * because a retry needs a new form object.
 * Resolves to the show() result (a DataDrivenScreenClosedReason for CustomForm,
 * a MessageBoxResult for MessageBox), or undefined if busy too long / already open / player left.
 * `onClosed()` always runs at the end, whatever happened (clear intervals there).
 */
export async function showDdui(player, build, options = {}) {
  const { tries, delayTicks, onClosed } = { ...DEFAULTS, ...options };
  if (!player?.isValid || open.has(player.id)) return undefined;
  open.add(player.id);
  try {
    for (let i = 0; i < tries; i++) {
      const form = build();
      const r = await form.show();
      const reason = typeof r === "string" ? r : r?.closeReason;
      if (reason === DataDrivenScreenClosedReason.UserBusy) {
        await system.waitTicks(delayTicks);
        if (!player.isValid) return undefined;
        continue;
      }
      return r;
    }
    return undefined;
  } catch (e) {
    console.warn(`[ns:forms] DDUI show failed: ${e?.message ?? e}`);
    return undefined;
  } finally {
    open.delete(player.id);
    if (onClosed) {
      try { onClosed(); } catch (e) { console.warn(`[ns:forms] onClosed: ${e}`); }
    }
  }
}

/** Yes/no confirm with a MessageBox. Resolves true only if the player picked button 1. */
export async function confirm(player, title, body, yes = "Yes", no = "No") {
  const r = await showDdui(player, () => new MessageBox(player, title).body(body).button1(yes).button2(no));
  return r?.selection === 1; // MessageBox: 1 = button1, 2 = button2, undefined = closed
}

/**
 * Open a form from a read-only context (custom component callback, custom command callback,
 * before-event). Defers to the next tick, re-checks the player, and logs errors.
 */
export function openLater(player, fn) {
  system.run(() => {
    if (!player?.isValid) return;
    Promise.resolve()
      .then(() => fn(player))
      .catch((e) => console.warn(`[ns:forms] ${e?.stack ?? e}`));
  });
}

/** Close the player's open forms (uiManager.closeAllForms). */
export function closeAll(player) {
  if (player?.isValid) uiManager.closeAllForms(player);
}

/**
 * Read ModalFormData values by key. `keys` lists one key per control in the order added
 * (use null for a display-only control if you added one).
 */
export function valuesByKey(response, keys) {
  const out = {};
  const values = response?.formValues ?? [];
  keys.forEach((k, i) => { if (k) out[k] = values[i]; });
  return out;
}
