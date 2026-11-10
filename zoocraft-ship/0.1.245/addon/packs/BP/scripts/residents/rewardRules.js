// A resident's friendship rewards (0.1.243; Austin's NPC Expansion spec: Sophia's book at 80 friendship; 0.1.245:
// Terra's plans at 40 and 60). A resident's `reward` (data/residents.js) is { at (friendship points), book (a
// data/lore.js book's id) or item (an item id), name, line (their words handing it over; "reward" if not given) }; one
// with several has `rewards`, a list of them in the order they come. Once handed over a reward is the player's for
// good: the friendship record keeps `rewards[<book or item id>]` (the day), whatever friendship does later.
// No engine calls here.

/** What a reward is filed under in the friendship record. */
export const rewardKey = (r) => r.book ?? r.item;

/** A resident's rewards, in the order they come. */
export function rewardsOf(res) {
  return res?.rewards ?? (res?.reward ? [res.reward] : []);
}

/** The reward a resident has ready for this friendship record and hasn't handed over yet (the first of them), or undefined. */
export function rewardDue(res, bond) {
  return rewardsOf(res).find((r) => (bond?.points ?? 0) >= r.at && bond?.rewards?.[rewardKey(r)] === undefined);
}

/** The rewards this player already earned from a resident (to ask for another of). */
export function rewardsEarned(res, bond) {
  return rewardsOf(res).filter((r) => bond?.rewards?.[rewardKey(r)] !== undefined);
}

/** The first reward this player already earned from a resident, or undefined. */
export function rewardEarned(res, bond) {
  return rewardsEarned(res, bond)[0];
}

/** The friendship record with the reward marked as handed over on `day`. */
export function withReward(bond, reward, day) {
  return { ...bond, rewards: { ...(bond.rewards ?? {}), [rewardKey(reward)]: day } };
}

/** What a resident's page says about their rewards: locked with the friendship it takes, ready, or earned. */
export function rewardText(res, bond) {
  const all = rewardsOf(res);
  if (!all.length) return undefined;
  const earned = rewardsEarned(res, bond);
  const lines = earned.map((r) => `Their gift to you: ${r.name} (yours; ask them for another ${r.book ? "copy if you lose it" : "if you carry none"}).`);
  if (rewardDue(res, bond)) lines.push(`They have something for you: talk to them.`);
  else {
    const next = all.find((r) => !earned.includes(r));
    if (next) lines.push(`At ${next.at} friendship they have something special for you.`);
  }
  return lines.join("\n");
}
