// Sheila's beef with Ron (0.1.378; Austin, 24 Nov: "at level 100 she wants you to settle some beef she had with an old
// friend of hers who was being rude to her, she says her friend is Ron ... she tells you to slap him and tell him that
// was from sheila. When you do that, Ron just says okay and laughs. Sheila thanks you though and gives you 1 carrot in
// return."). Her diamonds come from her retirement fund at 40, 60, 80 and 100 (1, 3, 10, 30).
// No engine calls here.

export const SLAP_SENDER = "sheila";
export const SLAP_TARGET = "ron";
export const SLAP_ABILITY = "slap";
export const SLAP_NEEDS = "slapped";
/** Her retirement fund: friendship -> diamonds. */
export const FUND = [
  [40, 1],
  [60, 3],
  [80, 10],
  [100, 30],
];

/** Whether she has asked this player (their friendship record with her). */
export const slapAsked = (bond) => bond?.rewards?.[SLAP_ABILITY] !== undefined;

/** Whether a hit on a resident is the slap: she asked, it is Ron, and it has not been done yet. */
export function isSlap(o) {
  return Boolean(o.asked) && !o.done && o.hitId === SLAP_TARGET;
}

/** For rewardRules.js: her carrot waits for the slap. */
export function slapGate(reward, done) {
  return reward?.needs !== SLAP_NEEDS || Boolean(done);
}
