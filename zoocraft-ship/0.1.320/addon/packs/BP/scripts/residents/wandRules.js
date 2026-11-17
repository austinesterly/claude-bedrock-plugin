// Darian's Freezing Wand (0.1.320; Austin's NPC #27 spec, "Friendship 100 - Darian's Lost Friend": "Right-click to
// activate. Fires a visible white magical beam toward the targeted entity. Can target any mob or player. Freezes the
// target in place for 5 seconds. Target cannot move during the freezing effect."). Its range (24 blocks) and cooldown
// (10 seconds) are the ones Austin approved on 17 Nov 2026 (BALANCE.darian.wand). No engine calls here.

export const WAND = "zoocraft:freezing_wand";
export const BEAM = "zoocraft:frost_beam";
export const DRAGON = "zoocraft:void_dragon";
export const DRAGON_EYE = "zoocraft:void_dragon_eye";

/** Whether the wand may be used again: `last` is the tick of this player's last beam, if any. */
export const mayCast = (now, last, k) => last === undefined || now - last >= k.cooldown || now < last;

/** Ticks until it may be used again (0 when it may). */
export const waitLeft = (now, last, k) => (mayCast(now, last, k) ? 0 : k.cooldown - (now - last));

/**
 * What the beam freezes among what the caster looks at, nearest first: the first mob or player (anything alive: it
 * has health) that isn't the caster. `hits`: [{ id, typeId, distance, alive }]. Undefined when there is none in range.
 */
export function pickTarget(hits, casterId, k) {
  return [...hits].sort((a, b) => a.distance - b.distance).find((h) => h.id !== casterId && h.alive && h.distance <= k.range);
}

/** The beam's points from `from` to `to`, one every `step` blocks (at most `max`): where its light is drawn. */
export function beamPoints(from, to, step = 0.4, max = 80) {
  const len = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  const n = Math.max(1, Math.min(max, Math.ceil(len / step)));
  const out = [];
  for (let i = 1; i <= n; i++) out.push({ x: from.x + ((to.x - from.x) * i) / n, y: from.y + ((to.y - from.y) * i) / n, z: from.z + ((to.z - from.z) * i) / n });
  return out;
}

/** Where a beam that meets nothing ends: `range` blocks along the look, or at the block looked at when that is nearer. */
export function beamEnd(from, dir, range, blockDistance) {
  const d = blockDistance !== undefined && blockDistance < range ? blockDistance : range;
  return { x: from.x + dir.x * d, y: from.y + dir.y * d, z: from.z + dir.z * d };
}

/** A new hold on something: where it stays and until when. */
export const holdOf = (pos, rotation, now, k) => ({ pos: { x: pos.x, y: pos.y, z: pos.z }, rotation, until: now + k.freeze });

/** Whether a hold is over. */
export const holdOver = (hold, now) => now >= hold.until;

/** Which telling of his lost friend Darian gives at 100, by where Damien's story stands (residents/damienRules.js damienStage). */
export function lostFriendLine(stage) {
  if (stage === "village") return "story100Village";
  if (stage === "exhibit") return "story100Exhibit";
  if (stage === "none") return "story100Before";
  return "story100Found"; // the dragon is beaten and he stands frozen by the portal, his fate not yet settled
}
