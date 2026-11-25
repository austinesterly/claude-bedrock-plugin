// Stage 2 of the rabbits' contest: tag (0.1.383, Carrot's character pass; Austin, 25 Nov: "Stage 2 is a tag game, again
// parkour and obstacles are a huge part of this, and the player gets 2 minutes to catch as many rabbits as he can in
// the arena. He will need a certain number to qualify for the 3rd and final stage."). Rabbits are let loose on the
// parkour course, on the grass and up on the obstacles; they run from the player; touching one catches it, and
// another is let out far away, so there is always the same number to chase. No engine calls here.
import { FIELD } from "./realmRules.js";
import { courseHeights } from "./raceRules.js";

export const CONTEST_RABBIT = "zoocraft:contest_rabbit";
export const COATS = 6;

// Where rabbits are let out (feet positions, offsets from the stadium's origin): up on the course's set pieces, and
// on open grass between the obstacles, spread over the whole field.
const UP = [[-20, -12], [20, 12], [15, -11], [-16, 6], [12, -3], [18, -3], [-21, 7], [22, -4], [9, -13], [-11, -12]];
function spots() {
  const H = courseHeights();
  const h = (x, z) => H.get(`${x},${z}`) ?? 0;
  const out = UP.map(([x, z]) => ({ x, y: h(x, z), z }));
  for (let z = -14; z <= 14; z++) {
    for (let x = -22; x <= 22; x++) {
      if (h(x, z) !== 0 || (Math.abs(x) <= 3 && z <= -7)) continue; // not on the king's dais or the podium
      if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 8)) continue;
      out.push({ x, y: 0, z });
    }
  }
  return out;
}
export const RABBIT_SPOTS = spots();

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
