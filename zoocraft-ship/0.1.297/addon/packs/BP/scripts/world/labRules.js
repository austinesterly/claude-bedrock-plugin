// The Skeleton Scientist's laboratories (0.1.297; Austin's NPC #23 spec, sections 5 to 9:
// research/ZooCraft_Tycoon_NPC_23_Subject_10_Aurora.md). The rules, with no engine calls; the game side is world/lab.js,
// the numbers data/balance.js `lab`.
//
// The game gives add-ons no way to ask where a Nether Fortress is (Austin chose, 2026-11-15: a laboratory is made
// "On first visit"). So a fortress is known by what a player stands in: enough nether brick close round them
// (senseCount, inFortress). The first time that is so, the fortress gets its laboratory: the nearest one already
// recorded within `radius` blocks is that fortress's (labNear), and with none a new one is laid out straight under the
// player near the bottom of the Nether (labOrigin), every block of it a list of fills (labOps): a bedrock box with no
// way in, holding a cell, a research corner, a hall to fight in, a barred vault with the chest, a cage and a marked
// floor to build a portal on. One for each fortress, kept for good.

export const NETHER = "minecraft:nether";
export const OVERWORLD = "minecraft:overworld";
export const SCIENTIST = "zoocraft:skeleton_scientist";
export const WISH_BONE = "zoocraft:wither_wish_bone";
export const GUARD = "minecraft:wither_skeleton";
export const LAB_PREFIX = "lab:";
export const CAP_PREFIX = "cap:";
export const isLabRecord = (r) => typeof r?.id === "string" && r.id.startsWith(LAB_PREFIX);
export const capId = (playerId) => `${CAP_PREFIX}${playerId}`;

/** A fortress's own blocks (the game's ids). */
export const isFortBlock = (typeId) => /^minecraft:(nether_brick|nether_brick_fence|nether_brick_stairs|nether_brick_slab|nether_brick_double_slab)$/.test(typeId ?? "");

/** The places sampled round a player's feet: every `step` blocks through a box `reach` out and `down`..`up`. */
export function sensePoints(at, g) {
  const out = [];
  const x0 = Math.floor(at.x), y0 = Math.floor(at.y), z0 = Math.floor(at.z);
  for (let dx = -g.reach; dx <= g.reach; dx += g.step) for (let dz = -g.reach; dz <= g.reach; dz += g.step) for (let dy = -g.down; dy <= g.up; dy++) out.push({ x: x0 + dx, y: y0 + dy, z: z0 + dz });
  return out;
}

/** Whether what was read round a player is a fortress: `min` of its blocks or more. */
export const inFortress = (count, g) => count >= g.min;

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** The laboratory a place in a fortress belongs to: the nearest recorded one within `radius` (level distance), or undefined. */
export function labNear(labs, at, radius) {
  let best;
  for (const l of labs) {
    const d = flat({ x: l.x + SIZE.x / 2, z: l.z + SIZE.z / 2 }, at);
    if (d <= radius && (!best || d < best.d)) best = { d, l };
  }
  return best?.l;
}

// The box, outside measure: 25 x 8 x 17. y 0 is the bedrock under the floor, 1 the floor, 2 to 6 the room, 7 the roof.
export const SIZE = { x: 25, y: 8, z: 17 };
/** Places inside the laboratory, from its origin (its lowest north-west corner). */
export const SPOTS = {
  seat: { x: 3, y: 2, z: 3 }, // the chair in the cell
  cellDoor: [{ x: 6, y: 2, z: 3 }, { x: 6, y: 3, z: 3 }],
  boss: { x: 15, y: 2, z: 10 },
  guards: [{ x: 11, y: 2, z: 8 }, { x: 19, y: 2, z: 8 }, { x: 15, y: 2, z: 13 }, { x: 11, y: 2, z: 12 }, { x: 19, y: 2, z: 12 }],
  chest: { x: 22, y: 2, z: 1 },
  vaultGate: [{ x: 22, y: 2, z: 4 }, { x: 22, y: 3, z: 4 }],
  cage: { x: 3, y: 2, z: 13 }, // the middle of the animal cage
  cageDoor: [{ x: 6, y: 2, z: 13 }, { x: 6, y: 3, z: 13 }],
  portal: { from: { x: 9, y: 1, z: 13 }, to: { x: 14, y: 1, z: 15 } }, // the marked floor to build a portal on
  arrive: { x: 12, y: 2, z: 12 }, // where someone coming back by their portal is set down when the portal can't be found
};
export const BARS = "minecraft:iron_bars";
const BEDROCK = "minecraft:bedrock";
const AIR = "minecraft:air";
const FLOOR = "minecraft:polished_blackstone_bricks";
const MARK = "minecraft:chiseled_polished_blackstone";

/**
 * A laboratory's blocks, in the order to place them: [{ from, to, block }] in the world's own coordinates. The whole
 * outside is bedrock, six sides, with no gap; nothing reaches outside the box.
 */
export function labOps(o) {
  const ops = [];
  const P = (x, y, z) => ({ x: o.x + x, y: o.y + y, z: o.z + z });
  const fill = (a, b, block) => ops.push({ from: P(a[0], a[1], a[2]), to: P(b[0], b[1], b[2]), block });
  const set = (a, block) => fill(a, a, block);
  const X = SIZE.x - 1, Y = SIZE.y - 1, Z = SIZE.z - 1;
  // the shell: the floor's and the roof's slabs of bedrock, then the four walls, each a layer at a time
  fill([0, 0, 0], [X, 0, Z], BEDROCK);
  fill([0, Y, 0], [X, Y, Z], BEDROCK);
  for (let y = 1; y < Y; y++) {
    fill([0, y, 0], [X, y, 0], BEDROCK);
    fill([0, y, Z], [X, y, Z], BEDROCK);
    fill([0, y, 0], [0, y, Z], BEDROCK);
    fill([X, y, 0], [X, y, Z], BEDROCK);
  }
  // the floor and the room
  fill([1, 1, 1], [X - 1, 1, Z - 1], FLOOR);
  for (let y = 2; y < Y; y++) fill([1, y, 1], [X - 1, y, Z - 1], AIR);
  // the cell (north-west): bars to the roof, its door two bars in the east side
  for (let y = 2; y < Y; y++) {
    fill([6, y, 1], [6, y, 5], BARS);
    fill([1, y, 6], [6, y, 6], BARS);
  }
  set([3, 1, 3], "minecraft:spruce_planks"); // under the chair
  // the animal cage (south-west): the same, its door in the east side
  for (let y = 2; y < Y; y++) {
    fill([6, y, 10], [6, y, 15], BARS);
    fill([1, y, 9], [6, y, 9], BARS);
  }
  fill([1, 1, 10], [5, 1, 15], "minecraft:moss_block");
  // the research corner (north wall): benches of brewing stands and cauldrons, shelves, a lectern
  fill([8, 2, 1], [9, 4, 1], "minecraft:bookshelf");
  set([10, 2, 1], "minecraft:brewing_stand");
  set([11, 2, 1], "minecraft:cauldron");
  set([12, 2, 1], "minecraft:brewing_stand");
  set([13, 2, 1], "minecraft:cauldron");
  set([14, 2, 1], "minecraft:lectern");
  fill([15, 2, 1], [16, 4, 1], "minecraft:bookshelf");
  set([18, 2, 1], "minecraft:bone_block");
  set([18, 3, 1], "minecraft:skeleton_skull");
  // the vault (north-east): barred to the roof, its gate two bars in the south side; the chest inside
  for (let y = 2; y < Y; y++) {
    fill([20, y, 1], [20, y, 4], BARS);
    fill([21, y, 4], [23, y, 4], BARS);
  }
  fill([21, 1, 1], [23, 1, 3], "minecraft:gilded_blackstone");
  // the portal floor (south wall of the hall)
  fill([SPOTS.portal.from.x, 1, SPOTS.portal.from.z], [SPOTS.portal.to.x, 1, SPOTS.portal.to.z], MARK);
  // light: soul lanterns on the floor in the corners and along the hall, glowstone let into the floor of each cage
  for (const [x, z] of [[1, 1], [5, 5], [8, 5], [23, 6], [7, 15], [23, 15], [15, 6], [19, 5], [1, 15]]) set([x, 2, z], "minecraft:soul_lantern");
  set([1, 1, 5], "minecraft:glowstone");
  set([21, 1, 1], "minecraft:glowstone");
  return ops;
}

/** Whether a place is inside a laboratory's box (its walls included). */
export function inLab(lab, at) {
  return Boolean(lab) && at.x >= lab.x && at.x < lab.x + SIZE.x && at.y >= lab.y && at.y < lab.y + SIZE.y && at.z >= lab.z && at.z < lab.z + SIZE.z;
}

/** A spot of SPOTS in the world, for this laboratory. */
export const labSpot = (lab, s) => ({ x: lab.x + s.x, y: lab.y + s.y, z: lab.z + s.z });

/**
 * Where a new laboratory goes for a fortress found at `at`: straight under it, its floor `g.above` blocks over the
 * bottom of the Nether (the bedrock there is up to five thick). `min`: the dimension's lowest block.
 */
export function labOrigin(at, min, g) {
  return { x: Math.floor(at.x) - Math.floor(SIZE.x / 2), y: min + g.above, z: Math.floor(at.z) - Math.floor(SIZE.z / 2) };
}

/** A new laboratory's record. */
export function newLab(n, origin, day) {
  return { id: `${LAB_PREFIX}${n}`, x: origin.x, y: origin.y, z: origin.z, day, built: false, looted: {}, links: [] };
}

/** The number a new laboratory takes: one more than the highest so far. */
export const nextLabNumber = (labs) => labs.reduce((m, l) => Math.max(m, Number(l.id.slice(LAB_PREFIX.length)) || 0), 0) + 1;

// --- the Skeleton Scientist in a fortress ---

/** Whether one appears on this look at a fortress: none there already, none lately, and a rare roll (g.chance). */
export function scientistDue(o, g, random = Math.random) {
  if (o.alive > 0) return false;
  if (o.lastSpawn !== undefined && o.now - o.lastSpawn < g.apart) return false;
  return random() < g.chance;
}

/** Whether a floor is one the Scientist can appear on: a fortress block under two open blocks. */
export const scientistFloor = (below, feet, head) => isFortBlock(below) && feet === "minecraft:air" && head === "minecraft:air";

/** Being caught: the Scientist within `reach` of the player on `need` looks running. `had`: the count so far. Returns the new count. */
export const grabCount = (had, distance, g) => (distance <= g.grabReach ? (had ?? 0) + 1 : 0);
export const grabbed = (count, g) => count >= g.grabLooks;

// --- the ropes ---

/** A capture's record: tied in the cell until the ropes break. */
export function newCapture(playerId, labId, day) {
  return { id: capId(playerId), player: playerId, lab: labId, phase: "tied", presses: 0, day };
}

/**
 * The ropes, a look at a time: a new crouch (not held from the last look) is a pull. Returns the record with its
 * presses counted, `sneaking` as it is now, and `phase` "fight" once the ropes break (g.presses pulls).
 */
export function ropeStep(cap, sneaking, g) {
  if (cap.phase !== "tied") return cap;
  const pull = sneaking && !cap.sneaking;
  const presses = cap.presses + (pull ? 1 : 0);
  return { ...cap, sneaking, presses, phase: presses >= g.presses ? "fight" : "tied" };
}

/** What the ropes say after a pull: at the first, the half and the last; undefined between. */
export function ropeWords(presses, g) {
  if (presses === 1) return "§7The ropes creak. Keep crouching to pull at them!";
  if (presses === Math.ceil(g.presses / 2)) return "§7The ropes are fraying. Keep going!";
  if (presses >= g.presses) return "§aThe ropes snap. You are free! The cell door swings open.";
  return undefined;
}

/** How many guards stand with the Scientist: g.guards, and one more for each player past the first, up to the spots there are. */
export const guardCount = (players, g) => Math.min(SPOTS.guards.length, g.guards + Math.max(0, players - 1));

// --- the chest ---

/** What the chest holds for one captured player: Austin's list ("at least one Wither Wish Bone", "exactly 42 obsidian", "one flint and steel"). */
/** @type {[string, number][]} */
export const LOOT = [[WISH_BONE, 1], ["minecraft:obsidian", 42], ["minecraft:flint_and_steel", 1]];

/** Whether this player's share goes in the chest now: once for each player in each laboratory, ever. */
export const lootDue = (lab, playerId) => lab.looted?.[playerId] === undefined;
export const withLoot = (lab, playerId, day) => ({ ...lab, looted: { ...(lab.looted ?? {}), [playerId]: day } });

// --- the way back ---

/** The laboratory with a link (where its portal let out in the Overworld) within `reach` of a place there, or undefined. */
export function labByLink(labs, at, reach) {
  return labs.find((l) => (l.links ?? []).some((k) => Math.hypot(k.x - at.x, k.y - at.y, k.z - at.z) <= reach));
}

/** A laboratory with one more link kept (the newest `keep` of them, none twice). */
export function withLink(lab, at, apart, keep) {
  const links = (lab.links ?? []).filter((k) => Math.hypot(k.x - at.x, k.y - at.y, k.z - at.z) > apart);
  links.push({ x: at.x, y: at.y, z: at.z });
  return { ...lab, links: links.slice(-keep) };
}
