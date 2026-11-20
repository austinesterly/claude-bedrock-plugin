// 0.1.340: the Frequency Friends' hidden jungle villages (Austin's NPC #29 spec, sections 6 and 8; his card pick
// "Shared reveal", 2026-11-20). Pure rules; the runtime is world/jungleVillage.js, the numbers BALANCE.jungleVillage.
// Bedrock can't show a block to one player and hide it from another, so a village is built in the canopy of the
// tallest jungle tree around while a player with Transcending Vision is near (everyone near sees it then), and taken
// away again, every block put back as it was, when none is. It only ever fills air, leaves and vines. The Frequency
// Friends themselves are drawn only for players with the vision (a per-player entity property).

export const FF_ENTITY = "zoocraft:frequency_friend";
export const PLANKS = "zoocraft:frequency_planks";
export const ROOF = "zoocraft:frequency_roof";
export const LANTERN = "zoocraft:frequency_lantern";
export const MONUMENT = "zoocraft:frequency_monument";
export const FF_BLOCKS = [PLANKS, ROOF, LANTERN, MONUMENT];
export const SEEN = "zoocraft:seen";
export const AIR = "minecraft:air";

/** What a village may take the place of: air, leaves of any tree, vines. Nothing anyone built. */
export function canFill(typeId) {
  return typeId === "minecraft:air" || /^minecraft:\w*leaves$/.test(typeId ?? "") || typeId === "minecraft:vine";
}

/** A jungle, by the biome's tags or name. */
export const isJungle = (biome) => Boolean(biome) && ((biome.tags ?? []).includes("jungle") || /jungle/.test(biome.id ?? ""));

/**
 * The tallest trees among column samples [{ x, z, y, typeId }] (the topmost block of each column as the game gives it,
 * which looks through leaves: over a trunk it is the trunk's top log). Jungle log tops, highest first, at most `n`.
 */
export function tallestTrunks(samples, n = 8) {
  return samples.filter((s) => s.typeId === "minecraft:jungle_log").sort((a, b) => b.y - a.y).slice(0, n);
}

/**
 * The village's blocks around a trunk at (0, 0), its floor at dy 0: a round deck about the trunk, four huts out at
 * the four sides with doors facing in and lanterns inside, railing posts with lanterns at the corners, and the
 * monument (where Dr. Foss took his egg). Then air: the leaves and vines of the crown cleared from over the deck and
 * out of the huts, 3 high, so there is room to walk. [dx, dy, dz, block] in the order they go up; no place twice.
 */
export function villagePlan() {
  const ops = [];
  const add = (dx, dy, dz, b) => ops.push([dx, dy, dz, b]);
  // the deck, round, about the trunk
  for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) if (dx * dx + dz * dz <= 30) add(dx, 0, dz, PLANKS);
  // railing posts along its edge between the huts' openings, a lantern on one post in each quarter
  for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) {
    const r = dx * dx + dz * dz;
    if (r >= 21 && r <= 30 && Math.abs(dx) >= 2 && Math.abs(dz) >= 2) add(dx, 1, dz, PLANKS);
  }
  for (const [dx, dz] of [[4, 3], [-4, -3], [3, -4], [-3, 4]]) add(dx, 2, dz, LANTERN);
  // four huts, 5 by 5, out from the deck on each side; the door (2 high) faces the trunk
  for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const at = (a, b) => [ux * a - uz * b, uz * a + ux * b]; // a: out from the trunk, b: across
    for (let a = 6; a <= 10; a++) for (let b = -2; b <= 2; b++) {
      const [dx, dz] = at(a, b);
      add(dx, 0, dz, PLANKS);
      const wall = a === 6 || a === 10 || Math.abs(b) === 2;
      for (let dy = 1; dy <= 3; dy++) {
        if (!wall) continue;
        if (a === 6 && b === 0 && dy <= 2) continue; // the door
        if (a === 10 && b === 0 && dy === 2) continue; // a window out
        add(dx, dy, dz, PLANKS);
      }
      add(dx, 4, dz, ROOF);
      if (a >= 7 && a <= 9 && Math.abs(b) <= 1) add(dx, 5, dz, ROOF);
    }
    const [lx, lz] = at(9, 1);
    add(lx, 1, lz, LANTERN);
  }
  // the monument, on a plank plinth on the deck
  add(-3, 1, -3, PLANKS);
  add(-3, 2, -3, MONUMENT);
  // room to walk: over the deck and inside the huts, whatever of the crown is there is cleared
  const taken = new Set(ops.map(([dx, dy, dz]) => `${dx},${dy},${dz}`));
  const clear = (dx, dz) => {
    for (let dy = 1; dy <= 3; dy++) if (!taken.has(`${dx},${dy},${dz}`)) {
      taken.add(`${dx},${dy},${dz}`);
      add(dx, dy, dz, AIR);
    }
  };
  for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) if (dx * dx + dz * dz <= 30) clear(dx, dz);
  for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let a = 6; a <= 10; a++) for (let b = -2; b <= 2; b++) clear(ux * a - uz * b, uz * a + ux * b);
  return ops;
}

/** Where the Frequency Friends stand, [dx, dy, dz] from the trunk on the floor: one in each hut, two on the deck. */
export const FRIEND_SPOTS = [[8, 1, 0], [-8, 1, 0], [0, 1, 8], [0, 1, -8], [3, 1, 2], [-2, 1, 3]];

/** The box a village takes, from its trunk at (x, y, z) (y: the floor): for checks and for who might fall. */
export function villageBox(v) {
  return { min: { x: v.x - 11, y: v.y - 1, z: v.z - 11 }, max: { x: v.x + 11, y: v.y + 6, z: v.z + 11 } };
}

/** The blocks of the plan where a player's feet or head are now ("dx,dy,dz" from the trunk): left empty when it goes up. */
export function occupied(v, players) {
  const out = new Set();
  for (const p of players) {
    if (p.dim !== v.dim) continue;
    const x = Math.floor(p.x) - v.x, y = Math.floor(p.y) - v.y, z = Math.floor(p.z) - v.z;
    out.add(`${x},${y},${z}`).add(`${x},${y + 1},${z}`);
  }
  return out;
}

export const inBox = (p, box) => p.x >= box.min.x && p.x <= box.max.x + 1 && p.y >= box.min.y && p.y <= box.max.y + 1 && p.z >= box.min.z && p.z <= box.max.z + 1;

/** Whether any of `players` [{ x, y, z, dim, vision }] with the vision is within `reach` of village `v` (flat distance). */
export function visionNear(v, players, reach) {
  return players.some((p) => p.vision && p.dim === v.dim && Math.hypot(p.x - v.x, p.z - v.z) <= reach);
}

/** The village nearest (x, z) within `reach` in that dimension, or undefined. */
export function villageNear(villages, dim, x, z, reach) {
  let best, bd = Infinity;
  for (const v of villages) {
    if (v.dim !== dim) continue;
    const d = Math.hypot(v.x - x, v.z - z);
    if (d <= reach && d < bd) { best = v; bd = d; }
  }
  return best;
}

/** A block put back: the original kept as a short code, "a" for air or "typeId|{states}" otherwise. */
export function keepCode(typeId, states) {
  if (typeId === "minecraft:air") return "a";
  return `${typeId}|${JSON.stringify(states ?? {})}`;
}
export function fromCode(code) {
  if (code === "a") return { typeId: "minecraft:air", states: {} };
  const i = code.indexOf("|");
  return { typeId: code.slice(0, i), states: JSON.parse(code.slice(i + 1)) };
}

/**
 * The block to put back for a kept code. Leaves come back as leaves that never decay: putting the village up and
 * taking it down stirs the crown, and a leaf the game then finds too far from a log would fall away, a few more each
 * time; a leaf that stays is what was there.
 */
export function restoreOf(code) {
  const o = fromCode(code);
  if (/leaves$/.test(o.typeId) && "persistent_bit" in o.states) o.states = { ...o.states, persistent_bit: true };
  return o;
}

/** What a Frequency Friend says when a player with the vision talks to one (chat). */
export const FRIEND_LINES = [
  "The Frequency Friend hums a long, low note. It sounds a lot like a question.",
  "The Frequency Friend tilts its head, as if it's surprised you can see it.",
  "The Frequency Friend waves a glowing hand. The air around it buzzes.",
  "The Frequency Friend points at the monument, then back at you, and hums sternly.",
];
