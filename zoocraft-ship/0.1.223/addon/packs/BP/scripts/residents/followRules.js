// Following a player (0.1.223, stage C: Austin's spec section 8; research/npc_spec_plan.md section 7), pure. A
// resident following someone walks where that player walked: the player's footsteps, taken a block apart while they're
// on safe ground, a step behind them (balance.js residents.follow). Nothing is ever broken or placed, and the resident
// is never put anywhere the player hasn't stood. Footsteps that can't be walked from the one before (a jump across a
// gap, a long drop, a climb, a swim, a ride, flying, a teleport) are a gap: the resident waits there, and if the player
// comes back they carry on; if the player goes on far away, they wait where they are (and head home at bedtime).
// What they walked is kept too (`back`, its loops cut out), so when the walk ends they go back the way they came, to
// where they set off from (home, or the zoo), and get on with their day.

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/**
 * Whether a player's spot is a footstep a resident can walk to: on the ground, standing (not flying, gliding,
 * swimming, climbing, riding or in bed), room for a head above, nothing burning or sinking at their feet, and at most
 * wading in water. f: { onGround, flying, gliding, swimming, climbing, riding, sleeping, inWater, headOpen, headDry,
 * feetBad }.
 */
export function footstepOk(f) {
  return Boolean(f.onGround) && !f.flying && !f.gliding && !f.swimming && !f.climbing && !f.riding && !f.sleeping && Boolean(f.headOpen) && !f.feetBad && (!f.inWater || Boolean(f.headDry));
}

/** The blocks at a resident's feet that are never a footstep: fire, lava, powder snow (by id). */
export const FEET_BAD = /^minecraft:(fire|soul_fire|lava|flowing_lava|powder_snow)$/;

/**
 * A player in the air (a jump, a step up, sprint-jumping along, a short fall) leaves their footstep on the ground under
 * them: `below` is what each cell is from their feet down ("open", "liquid" or "solid"). Returns the ground's height
 * (their own when the cell at their feet is solid: just above it), or undefined when there's no ground in reach or
 * there's water under them (a jump across a gap, into a pond: no footstep).
 */
export function groundUnder(y, below) {
  const base = Math.floor(y);
  for (let k = 0; k < below.length; k++) {
    if (below[k] === "open") continue;
    if (below[k] === "liquid") return undefined;
    return k === 0 ? y : base - k + 1;
  }
  return undefined;
}

/** A new trail: { ahead (footsteps still to walk), broken (the player left safe ground since the last), last }. */
export function newTrail() {
  return { ahead: [], broken: false, last: undefined };
}

/**
 * The player at `pos` (feet), standing somewhere a resident can walk (`ok`) or not, with the resident at `at`: adds a
 * footstep to the trail (in place) when the player has gone g.step on. A footstep back where the resident stands
 * starts the trail afresh; one back on an earlier footstep cuts the loop between; one that can't be walked to from the
 * last (further than g.join, more than g.up higher or g.down lower, or after leaving safe ground) is a gap. Returns
 * "added", "cut", "met" (back to the resident), "gap" (added, as a gap), "off" (moved off safe ground) or undefined.
 */
export function addFootstep(trail, at, pos, ok, g) {
  const last = trail.ahead[trail.ahead.length - 1] ?? trail.last ?? at;
  const d = flat(pos, last);
  const dy = pos.y - last.y;
  if (d < g.step && Math.abs(dy) < 0.5) return undefined;
  if (!ok) {
    trail.broken = true;
    return "off";
  }
  const p = { x: pos.x, y: pos.y, z: pos.z };
  trail.last = p;
  if (flat(p, at) <= g.loop * 2 && Math.abs(p.y - at.y) < 1) {
    trail.ahead = [];
    trail.broken = false;
    return "met";
  }
  for (let i = 0; i < trail.ahead.length - 1; i++) {
    const s = trail.ahead[i];
    if (flat(s, p) <= g.loop && Math.abs(s.y - p.y) < 0.5) {
      trail.ahead.length = i + 1;
      trail.broken = false;
      return "cut";
    }
  }
  const gap = trail.broken || d > g.join || dy > g.up || dy < -g.down;
  trail.ahead.push({ ...p, gap });
  trail.broken = false;
  return gap ? "gap" : "added";
}

/** How far the trail runs from `at` through the footsteps ahead, counted only as far as `limit`. */
export function wayLeft(at, ahead, limit = Infinity) {
  let n = 0;
  let from = at;
  for (const s of ahead) {
    n += Math.hypot(s.x - from.x, s.y - from.y, s.z - from.z);
    if (n > limit) return n;
    from = s;
  }
  return n;
}

/** Where they've walked (in place): a step reaching an earlier one cuts the loop between, so the way back is short. */
export function addBack(back, pos, g) {
  for (let i = 0; i < back.length - 1; i++) {
    const s = back[i];
    if (flat(s, pos) <= g.loop && Math.abs(s.y - pos.y) < 0.5) {
      back.length = i + 1;
      return "cut";
    }
  }
  back.push({ x: pos.x, y: pos.y, z: pos.z });
  return "added";
}

/** The way back: what they walked, last first (each a waypoint), ending where they set off. */
export function backRoute(back) {
  return [...back].reverse().map((p) => ({ x: p.x, y: p.y, z: p.z }));
}

/** Their pace following: g.speed times their own (`walk`, Sheila's 0.7), g.jog times that when over g.jogFrom behind. */
export function followPace(res, left, g) {
  const own = res?.routine?.walk ?? 1;
  return g.speed * own * (left > g.jogFrom ? g.jog : 1);
}

/**
 * What a following resident does this tick. o: { next (the footstep ahead, or undefined), left (the way left to the
 * player, counted to g.gap), shut (a shut iron door or fence gate in that footstep), stuck (ticks waited), apart (blocks
 * to the player) }. "wait" (close enough: stand and face them), "walk", "blocked" (a gap or a shut gate ahead: wait),
 * or "lost" (blocked a while with the player far off: they wait there instead).
 */
export function followMove(o, g) {
  if (!o.next || o.left <= g.gap) return "wait";
  if (o.next.gap || o.shut) return o.stuck >= g.waitSeconds * 20 && o.apart > g.leash ? "lost" : "blocked";
  return "walk";
}
