// Damien, the village's protector (0.1.329). Austin, 2026-11-18 (research/ZooCraft_Tycoon_NPC_27_Darian_TBD_answers.md,
// answer 5.3): "Damian, when accepted by the player, works as a protector of the vilallage. All eneemy mobs he uses
// spells to insatantly kill. He moves quick around town (about the speed of a player sprinting), and patrols all homes
// to keep everyone safe." Pure: which mobs are enemies, which he strikes now, and the order he walks past the homes.
// No engine calls here; residents/protector.js casts, residents/residents.js walks him.

/**
 * The game's monsters he leaves alone: the neutral ones, which only fight back (an Enderman, a Zombified Piglin, a
 * Piglin), and the two bosses a player calls up on purpose to fight (the Wither and the Ender Dragon).
 */
export const SPARED = new Set(["minecraft:enderman", "minecraft:zombie_pigman", "minecraft:piglin", "minecraft:wither", "minecraft:ender_dragon"]);

/** An enemy mob by its type: one of the game's own (the caller asks only for the game's "monster" family), not spared. */
export function isEnemy(typeId) {
  return typeof typeId === "string" && typeId.startsWith("minecraft:") && !SPARED.has(typeId);
}

/**
 * The enemies he strikes now. `mobs`: { typeId, pos, named, leashed, tamed, zoo } (zoo: a zoo animal, or standing in an
 * exhibit, the Mob House's pens included); `me`: where he stands. A named, leashed or tamed one is somebody's, and is
 * left alone. Within g.range blocks and g.height up or down, nearest first, at most g.perPulse at a time.
 */
export function spellTargets(mobs, me, g) {
  return mobs
    .filter((m) => isEnemy(m.typeId) && !m.named && !m.leashed && !m.tamed && !m.zoo && Math.abs(m.pos.y - me.y) <= g.height)
    .map((m) => ({ m, d: Math.hypot(m.pos.x - me.x, m.pos.y - me.y, m.pos.z - me.z) }))
    .filter((x) => x.d <= g.range)
    .sort((a, b) => a.d - b.d)
    .slice(0, g.perPulse)
    .map((x) => x.m);
}

/**
 * The homes in the order he walks past them: from `from`, always on to the nearest front door he hasn't passed yet
 * (ties by id, so the round is the same each time). `homes`: { id, at }.
 */
export function patrolOrder(from, homes) {
  const left = [...homes];
  const out = [];
  let at = from;
  while (left.length) {
    let bi = 0;
    let bd = Infinity;
    for (let i = 0; i < left.length; i++) {
      const d = Math.hypot(left[i].at.x - at.x, left[i].at.z - at.z);
      if (d < bd || (d === bd && left[i].id < left[bi].id)) {
        bd = d;
        bi = i;
      }
    }
    const h = left.splice(bi, 1)[0];
    out.push(h);
    at = h.at;
  }
  return out;
}

/** Whether a round may start: he is up (not his bedtime), at home with nothing else on, and rested since his last round. o: { phase, free, tick, last }. */
export function patrolDue(o, g) {
  return o.phase !== "night" && Boolean(o.free) && (o.last === undefined || o.tick - o.last >= g.restSeconds * 20);
}

/** Whether he says something as he strikes (to players near): not more often than every g.sayGap seconds. */
export function spellSays(lastTick, tick, g) {
  return lastTick === undefined || tick - lastTick >= g.sayGap * 20;
}
