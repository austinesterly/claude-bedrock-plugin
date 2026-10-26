// Zoo Coins ledger (spec sections 13 and 19). Pure: works on the Store and the park record.
// The ONLY way the balance changes. Every entry carries an operation id; replaying an operation
// returns the first result and never pays or charges twice (AC-09, AC-10, AC-15).
// Money is whole coins; the balance can't go below zero.

export const LEDGER = "ledger";

/**
 * @param {import("../persistence/store.js").Store} store
 * @param {object} park the park record (holds `balance`)
 * @param {{ opId: string, amount: number, reason: string, parkTime: number, related?: string }} op
 */
export function applyLedger(store, park, op, keep = 2000) {
  if (!Number.isInteger(op.amount)) throw new Error(`ledger amount must be a whole number: ${op.amount}`);
  // 0.1.114: an operation id is one park's (the first park's entries keep their old ids; "p2" and on get ":<park>").
  const id = park.id === "main" ? op.opId : `${op.opId}:${park.id}`;
  const prior = store.get(LEDGER, id);
  if (prior) return { ok: true, duplicate: true, balance: park.balance, entry: prior };
  if (park.balance + op.amount < 0) return { ok: false, reason: "insufficient", balance: park.balance };
  park.balance += op.amount;
  park.ledgerSeq = (park.ledgerSeq ?? 0) + 1;
  const entry = { id, opId: op.opId, parkId: park.id, seq: park.ledgerSeq, amount: op.amount, reason: op.reason, parkTime: op.parkTime, related: op.related, balanceAfter: park.balance };
  store.put(LEDGER, entry);
  store.put("park", park);
  prune(store, keep);
  return { ok: true, duplicate: false, balance: park.balance, entry };
}

// Each park keeps its own `keep` newest entries (0.1.109: entries carry parkId; ones from before say "main").
function prune(store, keep) {
  const col = store.col(LEDGER);
  if (col.size <= keep) return;
  const byPark = new Map();
  for (const e of col.values()) {
    const list = byPark.get(e.parkId ?? "main") ?? [];
    list.push(e);
    byPark.set(e.parkId ?? "main", list);
  }
  for (const list of byPark.values()) {
    if (list.length <= keep) continue;
    for (const e of list.sort((a, b) => a.seq - b.seq).slice(0, list.length - keep)) store.remove(LEDGER, e.id);
  }
}

/** The newest entries of one park (every park's when parkId is undefined). */
export function recentEntries(store, count, parkId = undefined) {
  return store
    .all(LEDGER)
    .filter((e) => parkId === undefined || (e.parkId ?? "main") === parkId)
    .sort((a, b) => b.seq - a.seq)
    .slice(0, count);
}
