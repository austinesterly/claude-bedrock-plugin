// A resident's friendship reward (0.1.243; Austin's NPC Expansion spec: Sophia's book at 80 friendship). A resident's
// `reward` (data/residents.js) is { at (friendship points), book (a data/lore.js book's id), name }. Once handed over it
// is the player's for good: the friendship record keeps `rewards[<book id>]` (the day), whatever friendship does later.
// No engine calls here.

/** The reward a resident has ready for this friendship record and hasn't handed over yet, or undefined. */
export function rewardDue(res, bond) {
  const r = res?.reward;
  if (!r || (bond?.points ?? 0) < r.at) return undefined;
  return bond?.rewards?.[r.book] === undefined ? r : undefined;
}

/** The reward this player already earned from a resident (to ask for another copy of), or undefined. */
export function rewardEarned(res, bond) {
  const r = res?.reward;
  return r && bond?.rewards?.[r.book] !== undefined ? r : undefined;
}

/** The friendship record with the reward marked as handed over on `day`. */
export function withReward(bond, reward, day) {
  return { ...bond, rewards: { ...(bond.rewards ?? {}), [reward.book]: day } };
}

/** What a resident's page says about their reward: locked with the friendship it takes, or earned. */
export function rewardText(res, bond) {
  const r = res?.reward;
  if (!r) return undefined;
  if (rewardEarned(res, bond)) return `Their gift to you: ${r.name} (yours; ask them for another copy if you lose it).`;
  return (bond?.points ?? 0) >= r.at ? `They have something for you: talk to them.` : `At ${r.at} friendship they have something special for you.`;
}
