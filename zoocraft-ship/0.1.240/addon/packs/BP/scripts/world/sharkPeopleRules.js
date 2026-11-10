// Shark People (0.1.240): the rules, kept apart from the game so the tests can read them. Austin, 2026-11-10: "This
// biome should be dangerous and have shark people as the enemy mob". The Exotic Formation is made of features, not a
// biome the game knows, so its monsters can't come from a spawn rule: a slow loop (world/sharkPeople.js) keeps a few
// in each hall that has a player in it, more on harder worlds and none on Peaceful, each put down on the hall's
// floor well away from the players; the game takes them away again once nobody is near, as it does its own monsters.
export const SHARK_PERSON = "zoocraft:shark_person";

/** The world's difficulty as the balance table spells it: "peaceful", "easy", "normal" or "hard". */
export function difficultyKey(difficulty) {
  const k = String(difficulty).toLowerCase();
  return ["peaceful", "easy", "normal", "hard"].includes(k) ? k : "normal";
}

/** How many more Shark People the hall takes at this difficulty. */
export function sharksWanted(have, difficulty, P) {
  return Math.max(0, (P.perHall[difficultyKey(difficulty)] ?? 0) - have);
}

/**
 * A place to look for a floor: `P.near[0]` to `P.near[1]` blocks from the player at (px, pz), any way round, and
 * inside the hall's inner part; undefined when that lands outside it. `r1`, `r2`: two random numbers from 0 to 1.
 */
export function sharkSpot(f, px, pz, r1, r2, P) {
  const a = r1 * Math.PI * 2;
  const d = P.near[0] + r2 * (P.near[1] - P.near[0]);
  const x = Math.floor(px + Math.cos(a) * d);
  const z = Math.floor(pz + Math.sin(a) * d);
  return Math.hypot(x + 0.5 - f.x, z + 0.5 - f.z) <= f.radius * P.inner ? { x, z } : undefined;
}

/**
 * The push for a Shark Person at goo, so it swims where a player sinks. `at`: { inGoo: its feet are in goo, over: it
 * was swimming and goo is still right under it (clearing a pit's rim), deep: its head is under too }; dx, dy, dz: the
 * way to the nearest player; v: its speed now. With a player within `P.sense` blocks it comes their way at `P.lunge`
 * (blocks a tick) and rises at `P.swim`, out of the pit on their side; or dives at that speed when they are more
 * than `P.dive` blocks under it (sunk in the same pit). With nobody near it only keeps its head at the top.
 * undefined: leave it be.
 */
export function gooPush(at, dx, dy, dz, v, P) {
  if (!at.inGoo && !at.over) return undefined;
  const far = Math.hypot(dx, dz);
  if (Number.isFinite(far) && far <= P.sense) {
    const under = dy < -P.dive;
    if (under && !at.inGoo) return undefined; // over the goo with its prey under it: it drops back in
    const k = far > 0.01 ? Math.min(P.lunge, far) / far : 0;
    return { x: dx * k - v.x, y: (under ? -P.swim : P.swim) - v.y, z: dz * k - v.z };
  }
  return at.inGoo && at.deep ? { x: 0, y: P.tread - v.y, z: 0 } : undefined;
}
