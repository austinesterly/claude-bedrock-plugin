// Stage 2 of the rabbits' contest: tag (0.1.383, Carrot's character pass; Austin, 25 Nov: "Stage 2 is a tag game, again
// parkour and obstacles are a huge part of this, and the player gets 2 minutes to catch as many rabbits as he can in
// the arena. He will need a certain number to qualify for the 3rd and final stage."). Rabbits are let loose on the
// parkour course, on the grass and up on the obstacles; they run from the player; touching one catches it, and
// another is let out far away, so there is always the same number to chase. No engine calls here.
import { FIELD } from "./realmRules.js";
import { courseHeights } from "./raceRules.js";

export const CONTEST_RABBIT = "zoocraft:contest_rabbit";
export const COATS = 6;

// Where rabbits are let out (feet positions, offsets from the stadium's origin): on open grass all over the field,
// and up on the lower parts of the course (the stairs, the landings, Carrot Top), never on the high hops and spires.
function spots() {
  const H = courseHeights();
  const h = (x, z) => H.get(`${x},${z}`) ?? 0;
  const out = [];
  const far = (x, z, d) => !out.some((o) => Math.hypot(o.x - x, o.z - z) < d);
  for (let z = -14; z <= 14; z++) {
    for (let x = -22; x <= 22; x++) {
      if (h(x, z) !== 0 || (Math.abs(x) <= 3 && z <= -7)) continue; // not on the king's dais or the podium
      if (far(x, z, 7)) out.push({ x, y: 0, z });
    }
  }
  const ground = out.length;
  for (let z = -14; z <= 14; z++) {
    for (let x = -22; x <= 22; x++) {
      const y = h(x, z);
      if (y < 2 || y > 5 || h(x + 1, z) !== y || h(x, z + 1) !== y) continue; // somewhere with room to stand
      if (!out.slice(ground).some((o) => Math.hypot(o.x - x, o.z - z) < 6)) out.push({ x, y, z });
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
