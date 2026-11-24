// Zach's show with the player (0.1.374; Austin's notes for Zach, level 100: "zach asks you to join him to play at one of
// his shows at the zoo, if you join him, all NPCS and basic NPCS will gather around as you play, and you will get 500 zoo
// coins when you decide to be done, it has to be at night when the concert takes place. This is the quest.").
// No engine calls here.

export const CONCERT_ABILITY = "concert";
export const CONCERT_WHY = "concert";
export const CONCERT_ID = "concert";

/** Whether Zach has asked this player (their friendship record with him). */
export const hasInvite = (bond) => bond?.rewards?.[CONCERT_ABILITY] !== undefined;

/**
 * Why a show cannot start now, or undefined when it can: he must have asked, it must be night with him out singing,
 * no show may be on, and there is one show a night.
 */
export function startWhy(o) {
  if (!o.invited) return "uninvited";
  if (o.running) return "running";
  if (!o.night || !o.singing) return "night";
  if (o.lastDay === o.day) return "played";
  return undefined;
}

/**
 * Where the audience stands: rings round the stage, nearest first, each spot facing the middle. `g.rings` is
 * [{ r, n }]: n spots on a ring r blocks out.
 */
export function ringSpots(center, g) {
  const out = [];
  for (const ring of g.rings) {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2 + (ring.turn ?? 0);
      const x = center.x + Math.cos(a) * ring.r;
      const z = center.z + Math.sin(a) * ring.r;
      const yaw = (Math.atan2(-(center.x - x), center.z - z) * 180) / Math.PI;
      out.push({ x: Math.floor(x) + 0.5, y: center.y, z: Math.floor(z) + 0.5, yaw: Math.round(yaw) + 0 });
    }
  }
  // two rings may round to the same block: one listener a block
  const seen = new Set();
  return out.filter((p) => {
    const k = `${p.x},${p.z}`;
    if (seen.has(k) || (Math.abs(p.x - center.x) < 1.5 && Math.abs(p.z - center.z) < 1.5)) return false;
    seen.add(k);
    return true;
  });
}

/** Whether the player has played enough for it to count as a show. */
export const enoughPlayed = (notes, g) => notes >= g.minNotes;
/** The Zoo Coins the player's park gets when they call it done. */
export const payFor = (notes, g) => (enoughPlayed(notes, g) ? g.coins : 0);
/** Whether this note brings a cheer from the crowd. */
export const cheerAt = (notes, g) => notes > 0 && notes % g.cheerEvery === 0;

/** What ends a show by itself: the player gone, wandered off, or the night over. */
export function endWhy(o, g) {
  if (!o.playerHere) return "gone";
  if (o.distance > g.leash) return "far";
  if (!o.night || !o.singing) return "day";
  return undefined;
}
