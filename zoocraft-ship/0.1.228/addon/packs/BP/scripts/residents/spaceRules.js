// Residents keeping out of each other (0.1.228, Austin: "when all the people headed to the zoos, the NPCS walked inside
// each other without a hit box"), pure. A resident is walked by script along the middle of the paths, a step a tick
// (residents/residents.js tickResidentMoves), so nothing in the game keeps two apart. Two rules do:
// - Lanes: each one's body is drawn a little to the right of the line they walk, so two coming opposite ways pass side
//   by side (laneTarget, easeLane; where they stand in the add-on's own records stays on the line).
// - A queue: one whose next step would come within `gap` of another ahead of them, going their way or standing, waits
//   (blockerOf). After `patience` seconds behind a walker (a slower one), or `standPatience` behind someone standing
//   (watching the animals, talking), they walk on past (waitFor).
// `g` is balance.js residents.space.

const rad = (yaw) => (yaw * Math.PI) / 180;

/** Where a body is drawn from its place on the line: `lane` blocks to the right of the way it faces. { x, z }. */
export function laneTarget(yaw, lane) {
  const a = rad(yaw);
  return { x: -Math.cos(a) * lane + 0, z: -Math.sin(a) * lane + 0 };
}

/** A lane offset moved a share `k` of the way to `target` (so a corner doesn't jump the body sideways). */
export function easeLane(cur, target, k) {
  return { x: cur.x + (target.x - cur.x) * k, z: cur.z + (target.z - cur.z) * k };
}

/**
 * Who a step is held up by: me { id, pos, next, yaw, to }, others [{ id, pos, yaw, walking, to, waitsFor }] (the same dimension;
 * `to` is the point of the route each is walking to now). The
 * nearest other within g.gap of `next` who is ahead of me (or level with me, and before me by id) and not walking toward
 * me (those pass in their lane).
 * Returns that other, or undefined.
 */
export function blockerOf(me, others, g) {
  const a = rad(me.yaw);
  const fx = -Math.sin(a);
  const fz = Math.cos(a);
  let best;
  let bd = Infinity;
  for (const o of others) {
    if (o.id === me.id || Math.abs(o.pos.y - me.pos.y) > 1.5) continue;
    if (o.waitsFor === me.id) continue; // they're waiting for me to go first
    const d = Math.hypot(o.pos.x - me.next.x, o.pos.z - me.next.z);
    // Both walking to the same spot (out of facing doors onto one path): room for the first to reach it and turn.
    const same = Boolean(o.walking && me.to && o.to && Math.hypot(me.to.x - o.to.x, me.to.z - o.to.z) < g.sameSpot);
    if (d >= g.gap + (same ? g.mergeRoom : 0) || d >= bd) continue;
    const ahead = (o.pos.x - me.pos.x) * fx + (o.pos.z - me.pos.z) * fz;
    if (ahead < -g.beside) continue; // behind me: they wait for me
    // Level with me (two who came onto the path together): one of the two gives way, the later by id.
    if (ahead <= g.beside && !(o.id < me.id)) continue;
    const turn = Math.abs(((((o.yaw - me.yaw) % 360) + 540) % 360) - 180);
    if (o.walking && turn > 90) {
      // Coming the other way: they pass in their lane. Unless both are headed for the same spot (out of facing doors
      // onto one path): then the later by id lets the other reach it first.
      if (!same || !(o.id < me.id)) continue;
    }
    best = o;
    bd = d;
  }
  return best;
}

/** How many ticks to wait behind a blocker before walking past: longer behind a walker; `n` (their place in the list) staggers two who block each other. */
export function waitFor(blocker, n, g) {
  return Math.round((blocker.walking ? g.patience : g.standPatience) * 20) + (n % 5) * g.stagger;
}

/** How much of the lane to use `left` blocks from the end of a walk (they stop on the line itself). 0 to 1. */
export function laneShare(left, g) {
  return Math.max(0, Math.min(1, left / g.easeBlocks));
}
