// Chasm's void work, the rules (0.1.290; Austin's NPC #22 spec, research/ZooCraft_Tycoon_NPC_22_Chasm.md). Pure: no
// game calls here, so the tests can run them.
//
// 50 friendship: "Volatile Void Essence trading: 1 diamond = 1 Volatile Void Essence". The trade takes whole diamonds
// out of the player's own stacks first and hands over exactly as many essences as it took, so nothing is ever made
// from nothing (Austin: "no duplication").

export const CHASM_ID = "chasm";
export const DIAMOND = "minecraft:diamond";
export const ESSENCE = "zoocraft:volatile_void_essence";
/** The ability (a resident's `rewards` entry) that opens the trade: kept for good once he has offered it. */
export const TRADE_ABILITY = "essence_trade";

/** How many plain diamonds the slots hold. `slots`: [{ typeId, amount } | undefined]. */
export function diamondsIn(slots) {
  let n = 0;
  for (const s of slots) if (s && s.typeId === DIAMOND && s.amount > 0) n += s.amount;
  return n;
}

/**
 * The stacks a trade of `want` diamonds takes from: { total (at most want and at most what is carried), take:
 * [{ slot, n }] in slot order }. A want of less than one, or one that isn't a whole number, takes nothing.
 */
export function tradePlan(slots, want) {
  const take = [];
  let left = Number.isInteger(want) && want > 0 ? want : 0;
  let total = 0;
  for (let slot = 0; slot < slots.length && left > 0; slot++) {
    const s = slots[slot];
    if (!s || s.typeId !== DIAMOND || !(s.amount > 0)) continue;
    const n = Math.min(left, s.amount);
    take.push({ slot, n });
    left -= n;
    total += n;
  }
  return { total, take };
}

/** The amounts his page offers for someone carrying `have` diamonds: 1, 8 (from 8) and all of them (from 2, if not 8). */
export function tradeOffers(have) {
  const out = [];
  if (have >= 1) out.push(1);
  if (have >= 8) out.push(8);
  if (have >= 2 && have !== 8) out.push(have);
  return out;
}

/** Whether this friendship record has the trade (the ability, once offered, is kept even if friendship drops). */
export function hasTrade(bond) {
  return bond?.rewards?.[TRADE_ABILITY] !== undefined;
}
