import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { applyLedger, recentEntries } from "./ledger.js";
import { getPark } from "../park/park.js";
import { sandboxOn } from "../park/rules.js";

// Spending and earning Zoo Coins. Every call carries an operation id (see ledger.js).
// Sandbox mode (park/rules.js): spending and wages cost nothing; the entry is still written, at 0,
// under the same operation id, so the Finances page shows what was taken and nothing runs twice.

const free = (reason) => `${reason} §8(sandbox: free)`;

export function spend(player, amount, reason, opId) {
  const park = getPark();
  if (!park) return { ok: false, reason: "no park" };
  if (sandboxOn(park)) return applyLedger(db, park, { opId, amount: 0, reason: free(reason), parkTime: park.clock.seconds, related: player.id }, BALANCE.economy.ledgerKeep);
  return applyLedger(db, park, { opId, amount: -amount, reason, parkTime: park.clock.seconds, related: player.id }, BALANCE.economy.ledgerKeep);
}

// A charge the park makes by itself (keeper wages): no player involved.
export function charge(amount, reason, opId) {
  const park = getPark();
  if (!park) return { ok: false, reason: "no park" };
  if (sandboxOn(park)) return applyLedger(db, park, { opId, amount: 0, reason: free(reason), parkTime: park.clock.seconds }, BALANCE.economy.ledgerKeep);
  return applyLedger(db, park, { opId, amount: -amount, reason, parkTime: park.clock.seconds }, BALANCE.economy.ledgerKeep);
}

export function earn(amount, reason, opId) {
  const park = getPark();
  if (!park || amount <= 0) return { ok: false };
  return applyLedger(db, park, { opId, amount, reason, parkTime: park.clock.seconds }, BALANCE.economy.ledgerKeep);
}

export function recent(count = 8, park = getPark()) {
  return recentEntries(db, count, park?.id);
}
