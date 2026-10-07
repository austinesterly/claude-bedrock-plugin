// Minimal form helper for this template: one form per player, UserBusy retry, quit-safe.
// The full shared helper is bedrock-ui/templates/form-helper (BP/scripts/ui/forms.js).
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import { system } from "@minecraft/server";
import { FormCancelationReason, FormRejectError } from "@minecraft/server-ui";

const open = new Set();

/** Show a classic form. Resolves to the response, or undefined (busy too long, already open, player left). */
export async function showForm(player, form, tries = 8) {
  if (!player?.isValid || open.has(player.id)) return undefined;
  open.add(player.id);
  try {
    for (let i = 0; i < tries; i++) {
      const r = await form.show(player);
      if (r.canceled && r.cancelationReason === FormCancelationReason.UserBusy) {
        await system.waitTicks(10);
        if (!player.isValid) return undefined;
        continue;
      }
      return r;
    }
    return undefined;
  } catch (e) {
    if (e instanceof FormRejectError) return undefined;
    throw e;
  } finally {
    open.delete(player.id);
  }
}

/** True while this helper shows the player a form. */
export function isBusy(player) {
  return open.has(player.id);
}

/** Run an async UI flow from a read-only context (command callback, before-event). */
export function openLater(player, fn) {
  system.run(() => {
    if (!player?.isValid) return;
    Promise.resolve()
      .then(() => fn(player))
      .catch((e) => console.warn(`[ns:quests] ${e?.stack ?? e}`));
  });
}
