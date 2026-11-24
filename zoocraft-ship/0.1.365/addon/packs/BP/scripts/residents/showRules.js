// Austin the resident's show (0.1.365; his words 2026-11-23: "a selfie stick that he carries around the zoo and records
// the animals and acts like hes talking to the audience, he should always have a crowd of 3+ basic NPCS with him").
// Pure rules: how big the crowd is, where each fan stands on his trail, and what he says to his stream.

/** Fans behind him: never fewer than g.fans, one more for each of the park's stars from g.starFrom, up to g.maxFans. */
export function crowdSize(stars, g) {
  const extra = Math.max(0, Math.floor((stars ?? 0) - g.starFrom + 1));
  return Math.min(g.maxFans, g.fans + extra);
}

/** His trail grows only when he has moved g.step blocks; it keeps what the biggest crowd needs. */
export function trailPush(trail, pos, yaw, g) {
  const last = trail[trail.length - 1];
  if (last && Math.hypot(pos.x - last.x, pos.z - last.z) < g.step && Math.abs(pos.y - last.y) < 0.5) return false;
  trail.push({ x: pos.x, y: pos.y, z: pos.z, yaw });
  const keep = g.gap * (g.maxFans + 1) + 1;
  if (trail.length > keep) trail.splice(0, trail.length - keep);
  return true;
}

/** Where fan `i` (0 first) stands: g.gap trail points behind the one before, or undefined while the trail is short. */
export function fanSpot(trail, i, g) {
  return trail[trail.length - 1 - g.gap * (i + 1)];
}

/** A line to his stream: with animals in front of him any line, else only those that name none. */
export function streamLine(lines, species, random = Math.random) {
  const pool = (lines ?? []).filter((l) => species || !l.includes("{species}"));
  if (!pool.length) return undefined;
  return pool[Math.floor(random() * pool.length)].replaceAll("{species}", species ?? "");
}
