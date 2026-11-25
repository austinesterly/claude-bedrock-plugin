// Stage 2 of the rabbits' contest: tag (0.1.383, Carrot's character pass; Austin, 25 Nov: "Stage 2 is a tag game, again
// parkour and obstacles are a huge part of this, and the player gets 2 minutes to catch as many rabbits as he can in
// the arena. He will need a certain number to qualify for the 3rd and final stage."). Rabbits are let loose on the
// parkour course, on the grass and up on the obstacles; they run from the player; touching one catches it, and
// another is let out far away, so there is always the same number to chase. No engine calls here.
import { FIELD } from "./realmRules.js";

export const CONTEST_RABBIT = "zoocraft:contest_rabbit";
export const COATS = 6;

/** Where rabbits are let out (feet positions, offsets from the stadium's origin): half on the grass, half up on the course. */
export const RABBIT_SPOTS = [
  { x: -20, y: 3, z: -12 }, // the west hill
  { x: 20, y: 3, z: 12 }, // the east hill
  { x: 15, y: 2, z: -11 }, // the platform
  { x: -16, y: 3, z: 6 }, // the bridge
  { x: 12, y: 3, z: -3 }, // the middle pillar
  { x: 18, y: 5, z: -3 }, // the tallest pillar
  { x: -21, y: 3, z: 7 }, // the bridge's west tower
  { x: -10, y: 0, z: -3 },
  { x: 10, y: 0, z: 8 },
  { x: -21, y: 0, z: 13 },
  { x: 21, y: 0, z: -8 },
  { x: -4, y: 0, z: 4 },
  { x: 6, y: 0, z: 13 },
  { x: -14, y: 0, z: -14 },
  { x: 8, y: 0, z: -12 },
  { x: 22, y: 0, z: 3 },
];

const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;

/**
 * The spots to let `n` rabbits out at: the ones farthest from `from` (the player) that have no rabbit of `rabbits`
 * (positions) within `clear` blocks. Always the same for the same positions.
 */
export function freeSpots(from, rabbits, n, clear = 3) {
  return RABBIT_SPOTS.map((s, i) => ({ s, i, d: dist2({ x: s.x + 0.5, z: s.z + 0.5 }, from) }))
    .filter(({ s }) => !rabbits.some((r) => dist2({ x: s.x + 0.5, z: s.z + 0.5 }, r) < clear * clear))
    .sort((a, b) => b.d - a.d || a.i - b.i)
    .slice(0, n)
    .map(({ s }) => s);
}

/** Whether a rabbit at `r` is caught by a player at `p` (feet positions). */
export function caught(p, r, reach) {
  return dist2(p, r) <= reach * reach && Math.abs(p.y - r.y) <= 2.2;
}

/** Whether a rabbit has got off the field (onto the stands, or under it). */
export const strayed = (r) => Math.abs(r.x - 0.5) > FIELD.halfX + 0.4 || Math.abs(r.z - 0.5) > FIELD.halfZ + 0.4 || r.y < -0.5;

/**
 * One look at the game: `game` { caught, warned }, `ticks` since the horn, `k` { seconds, need, warnAt }.
 * Returns { done: "won" | "lost" | undefined, warn, left }.
 */
export function tagStep(game, ticks, k) {
  const left = Math.max(0, Math.ceil(k.seconds - ticks / 20));
  if (ticks >= k.seconds * 20) return { done: game.caught >= k.need ? "won" : "lost", warn: undefined, left: 0 };
  return { done: undefined, warn: k.warnAt.find((s) => left <= s && !game.warned.includes(s)), left };
}
