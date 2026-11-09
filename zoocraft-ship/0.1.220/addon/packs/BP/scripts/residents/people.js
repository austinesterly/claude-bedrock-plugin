// Who has been unlocked (0.1.220, Austin's residents: research/npc_spec_plan.md section 2), kept apart from where they
// live (the "residents" collection), so moving out, a broken home or a lost body never loses it, and a resident once
// unlocked stays unlocked. Records in "people", keyed by the resident's id: { id, seq (the order they were unlocked in),
// day (the world day it happened) }.
import { db } from "../persistence/db.js";

const COL = "people";

export function isUnlocked(id) {
  return Boolean(db.get(COL, id));
}

/** Everyone unlocked, the first unlocked first. */
export function unlockedPeople() {
  return db.all(COL).sort((a, b) => a.seq - b.seq);
}

/** Unlock a resident for good. Returns false when they already were. */
export function markUnlocked(id, day) {
  if (db.get(COL, id)) return false;
  const seq = db.all(COL).reduce((n, rec) => Math.max(n, rec.seq), 0) + 1;
  db.put(COL, { id, seq, day });
  return true;
}
