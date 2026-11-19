// 0.1.332 (Austin 2026-11-18 21:41Z, answer 5.4): Damien's wand, his gift at 100. "The wand stops time from working on
// potion effects, so it makes them last forever, which is how he got stuck originally. To undo the wand effects, the
// player can zap themselves again and time resumes on the potion effects." The rules, pure; the game side is
// residents/timeWand.js.

export const DAMIEN_WAND = "zoocraft:damien_wand";
/** On the player while time is stopped for them: JSON of the effects held, [{ id, ticks, amp }]. */
export const STOPPED = "zoocraft:time_stopped";

/** Zapping again so soon does nothing (a double click is one zap). */
export const mayZap = (now, last, cooldown) => last === undefined || now - last >= cooldown || now < last;

/** An effect with a time on it (the game's endless ones, -1, need no holding). */
export const holdable = (f, most) => f.ticks > 0 && f.ticks <= most;

/**
 * Each look while time is stopped for a player. `held`: the effects as they were (their time then); `now`: what the
 * player has now. One gone from them (milk, a totem) is let go. One new since (a potion drunk meanwhile) is held at the
 * time it has, unless `skipNew(f)` (one of ours that is not a potion: the dragon's hiding, a landing's Slow Falling, the
 * Freezing Wand's hold). One the game has replaced with another strength, or given more time (the same potion drunk
 * again), is held as it is now. One that has ticked down is given its time back. Nothing is held for less than
 * `least` ticks, so a look never comes too late.
 * Returns { held, renew: [the effects to put back on at their held time] }.
 */
/** @param {(f: { id: string, ticks: number, amp: number }) => boolean} [skipNew] */
export function keepPlan(held, now, least, most, skipNew = (f) => false) {
  const out = [];
  const renew = [];
  for (const f of now) {
    if (!holdable(f, most)) continue;
    const h = held.find((x) => x.id === f.id);
    if (!h || h.amp !== f.amp) {
      if (!h && skipNew(f)) continue;
      const k = { id: f.id, ticks: Math.max(f.ticks, least), amp: f.amp };
      out.push(k);
      if (f.ticks < k.ticks) renew.push(k);
      continue;
    }
    if (f.ticks > h.ticks) {
      out.push({ id: f.id, ticks: f.ticks, amp: f.amp }); // more time put on: held from there
      continue;
    }
    out.push(h);
    if (f.ticks < h.ticks) renew.push(h);
  }
  return { held: out, renew };
}

/** Effects of ours that are not a potion, never newly held: the Freezing Wand's hold (Slowness at 255). */
export const notAPotion = (f) => f.amp >= 255;
