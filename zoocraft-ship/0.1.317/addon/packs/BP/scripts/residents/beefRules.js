// The dragon's bait (0.1.317; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, friendship 80:
// "He requests 64 Raw Beef ... All 64 pieces of beef magically float above Darian's head. Darian combines them into one
// enormous 3x3 block of beef. Player receives or gains access to the giant beef bait. Player hangs the bait near the
// activated Void Portal. Darian moves near the portal ... instructs the player to return after two in-game days.").
// Pure, so the tests can run them; residents/beef.js is the game side.

export const BEEF = "minecraft:beef";
export const GIANT_BEEF = "zoocraft:giant_beef"; // the item Darian makes
export const GIANT_BEEF_BLOCK = "zoocraft:giant_beef_block"; // what it is made of once hung: 3 by 3 by 3 of these
export const BEEF_PIECE = "zoocraft:beef_piece";
export const BEEF_SHOW = "zoocraft:giant_beef_show";

/** How many of an item a list of stacks ({ typeId, amount } or undefined) holds. */
export const countOf = (stacks, id) => stacks.reduce((n, s) => n + (s?.typeId === id ? s.amount : 0), 0);

/**
 * Taking `want` of an item out of a list of stacks: what each slot holds after ({ slot, amount }; 0 = emptied), or
 * undefined when there aren't that many (nothing is taken then).
 */
export function takePlan(stacks, id, want) {
  if (countOf(stacks, id) < want) return undefined;
  const plan = [];
  let left = want;
  for (let slot = 0; slot < stacks.length && left > 0; slot++) {
    const s = stacks[slot];
    if (s?.typeId !== id) continue;
    const take = Math.min(left, s.amount);
    plan.push({ slot, amount: s.amount - take });
    left -= take;
  }
  return plan;
}

const STEP = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] };

/** The middle of the Giant Beef hung against a block's face: it lies wholly beyond that face. */
export function beefCentre(block, face) {
  const s = STEP[face] ?? STEP.Up;
  return { x: block.x + 2 * s[0], y: block.y + 2 * s[1], z: block.z + 2 * s[2] };
}

/** Its 27 blocks. */
export function beefCells(c) {
  const cells = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) cells.push({ x: c.x + x, y: c.y + y, z: c.z + z });
  return cells;
}

/**
 * How far a spot is from the lit Void Portal (`portal`: the quest's { x, y, z, axis, size }: the middle of its bottom
 * row and its inside), measured to the nearest part of the portal itself.
 */
export function portalDistance(c, portal) {
  const half = Math.floor(portal.size / 2);
  const along = portal.axis === "x" ? "x" : "z";
  const across = along === "x" ? "z" : "x";
  const gap = (v, lo, hi) => (v < lo ? lo - v : v > hi ? v - hi : 0);
  const da = gap(c[along], portal[along] - half, portal[along] - half + portal.size - 1);
  const dy = gap(c.y, portal.y, portal.y + portal.size - 1);
  const dc = Math.abs(c[across] - portal[across]);
  return Math.hypot(da, dy, dc);
}

/**
 * Whether the Giant Beef may hang with its middle at `c`: "ok", or why not: "created" (Darian hasn't made it),
 * "portal" (no lit Void Portal), "dimension", "far" (not near the portal), "room" (its 27 blocks aren't all air).
 * `o`: { created, portal, dimension, air(cell) -> boolean | undefined }, `k`: { reach }.
 */
export function hangCheck(c, o, k) {
  if (!o.created) return "created";
  if (!o.portal) return "portal";
  if (o.portal.d !== o.dimension) return "dimension";
  if (portalDistance(c, o.portal) > k.reach) return "far";
  if (!beefCells(c).every((p) => o.air(p) === true)) return "room";
  return "ok";
}

/** Where Darian stands by the portal: the first spot of the 7 by 7 around `near` (not `near` itself) that `stand(x, y, z)` allows, nearest first; else `near`. */
export function postSpot(near, stand) {
  const b = { x: Math.floor(near.x), y: Math.floor(near.y), z: Math.floor(near.z) };
  const spots = [];
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) if (Math.abs(x) + Math.abs(z) >= 2) spots.push([x, z]);
  spots.sort((p, q) => Math.hypot(p[0], p[1]) - Math.hypot(q[0], q[1]) || p[0] - q[0] || p[1] - q[1]);
  for (const [x, z] of spots) for (const y of [0, 1, -1]) if (stand(b.x + x, b.y + y, b.z + z)) return { x: b.x + x + 0.5, y: b.y + y, z: b.z + z + 0.5 };
  return { x: b.x + 0.5, y: b.y, z: b.z + 0.5 };
}

/** The cutscene's parts, in ticks: the pieces rise, circle, draw together; then the Giant Beef shows before it is handed over. */
export const CUT = { rise: 40, circle: 70, gather: 30, show: 50 };
export const CUT_PIECES = 64;

/**
 * Where piece `i` of the 64 is `t` ticks in, over `head` (the top of Darian's head): up out of his hands into three
 * rings turning over his head, then all into one point above them. Undefined once they have joined.
 */
export function piecePos(i, t, head, k = CUT) {
  if (t >= k.rise + k.circle + k.gather) return undefined;
  const ring = i % 3;
  const n = Math.floor(i / 3);
  const perRing = Math.ceil(CUT_PIECES / 3);
  const turn = (t / 20) * (0.9 + 0.25 * ring) * (ring === 1 ? -1 : 1);
  const a = (n / perRing) * Math.PI * 2 + turn;
  const radius = 1.3 + 0.55 * ring;
  const ringPos = { x: head.x + Math.cos(a) * radius, y: head.y + 0.9 + 0.7 * ring + 0.15 * Math.sin(t / 7 + i), z: head.z + Math.sin(a) * radius };
  const core = corePos(head);
  const mix = (p, q, f) => ({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, z: p.z + (q.z - p.z) * f });
  const ease = (f) => f * f * (3 - 2 * f);
  if (t < k.rise) {
    const start = Math.floor((i / CUT_PIECES) * (k.rise * 0.6)); // they leave his hands one after another
    const f = Math.max(0, Math.min(1, (t - start) / (k.rise - start)));
    return mix({ x: head.x, y: head.y - 0.6, z: head.z }, ringPos, ease(f));
  }
  if (t < k.rise + k.circle) return ringPos;
  return mix(ringPos, core, ease((t - k.rise - k.circle) / k.gather));
}

/** Where the pieces join and the Giant Beef shows (its middle). */
export const corePos = (head) => ({ x: head.x, y: head.y + 3.4, z: head.z });

/** Whether the wait Darian asks for is over: `days` whole in-game days since he said so. */
export const waitOver = (startDay, day, days) => startDay !== undefined && day - startDay >= days;
