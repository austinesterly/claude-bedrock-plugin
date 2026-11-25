// Who has won the rabbits' contest (0.1.384): kept with the world, so the prize waits at the podium and Carrot knows.
import { db } from "../persistence/db.js";

const COL = "contestWins";

export const winsOf = (playerId) => (playerId ? db.get(COL, playerId) : undefined);
/** Whether this player has ever won (Carrot's trophy waits for it). */
export const contestWon = (playerId) => (winsOf(playerId)?.wins ?? 0) > 0;
/** Whether a prize waits for them at the podium. */
export const prizeOwed = (playerId) => Boolean(winsOf(playerId)?.owed);

export function recordWin(playerId) {
  const r = winsOf(playerId) ?? { id: playerId, wins: 0, owed: false };
  db.put(COL, { ...r, id: playerId, wins: (r.wins ?? 0) + 1, owed: true });
}

export function prizeGiven(playerId) {
  const r = winsOf(playerId);
  if (r) db.put(COL, { ...r, owed: false });
}

/** Carrot's trophy and her pride wait for a win (a reward's `needs: "contestWon"`). */
export const contestNeeds = (reward, bond) => reward.needs !== "contestWon" || contestWon(bond?.player);
