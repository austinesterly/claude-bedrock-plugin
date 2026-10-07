// Quest definitions. The id (object key) is saved in player data: never rename a shipped id.
// To retire a quest, delete it here; state.js drops saved progress for ids that no longer exist.
//
// kind "kill":    progress is counted in saved state (entityDie).
// kind "collect": progress is the live item count in the player's inventory; turn-in removes the items.

export const QUESTS = {
  zombie_hunt: {
    title: "Zombie Hunt",
    kind: "kill",
    targets: ["minecraft:zombie", "minecraft:husk", "minecraft:drowned", "minecraft:zombie_villager_v2"],
    count: 5,
    offer: "Zombies keep breaking my fences at night. Put down five of them and I will pay you in emeralds.",
    done: "Five fewer zombies. The fences thank you, and so do I.",
    reward: { items: [{ id: "minecraft:emerald", count: 5 }], xp: 30 },
    repeatable: true,
    cooldownTicks: 24000, // one in-game day before it can be taken again
  },
  wheat_harvest: {
    title: "Wheat Harvest",
    kind: "collect",
    item: "minecraft:wheat",
    itemName: "Wheat",
    count: 16,
    offer: "The bakery is out of flour. Bring me sixteen wheat and I will share the first batch of bread.",
    done: "Plenty of wheat. Here, still warm from the oven.",
    reward: { items: [{ id: "minecraft:bread", count: 6 }, { id: "minecraft:cake", count: 1 }], xp: 15 },
    repeatable: false,
  },
};

export const QUEST_IDS = Object.keys(QUESTS);

/** One-line description of the reward. */
export function rewardText(q) {
  const items = q.reward.items.map((i) => `${i.count} x ${i.id.replace("minecraft:", "").replace(/_/g, " ")}`);
  if (q.reward.xp) items.push(`${q.reward.xp} XP`);
  return items.join(", ");
}
