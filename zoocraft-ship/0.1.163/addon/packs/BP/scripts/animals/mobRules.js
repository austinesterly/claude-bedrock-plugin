// Hostile mobs in the zoo (0.1.163, module 11: research/mobhouse_plan.md), pure: plain records in, plain answers out.
// The world side is animals/mobs.js (the Passivity Serum, the zoo mobs' sounds, the spawn guard) and visitors/mobHouse.js
// (the Mob House block: its hall, its entry price).
//
// A vanilla zombie or skeleton weakened to a quarter of its health or less turns into a calmed one (its own entity,
// zoocraft:calm_zombie, the vanilla look, never hostile) when a Passivity Serum is used on it; a Mob Cage carries a calmed
// one to a pen; in the pen it is the zoo's (zoocraft:zoo_zombie). A pen is an exhibit inside a Mob House: beside its
// hall (the closed building round the Mob House block, where guests walk), shut in all round, roof included, and walled
// off from the hall (glass, glass panes or iron bars to look through).

// The vanilla mobs the serum calms, and what each becomes.
export const MOB_KINDS = { "minecraft:zombie": "zoocraft:calm_zombie", "minecraft:skeleton": "zoocraft:calm_skeleton" };
export const CALM_TYPES = new Set(Object.values(MOB_KINDS));
// The zoo's mobs, calmed or in a pen: their sounds (played by script; the entities have none of their own).
export const MOB_SOUNDS = {
  "zoocraft:calm_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:zoo_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:calm_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
  "zoocraft:zoo_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
};
export const ZOO_MOB_FAMILY = "zoocraft_mob";

export const SERUM_TEXT = {
  research: "The Passivity Serum needs Mob Taming research at the Research Desk first.",
  other: "For now the Passivity Serum works only on zombies and skeletons.",
  baby: "Leave the young ones be: the serum is too strong for a baby.",
  strong: (calmAt) => `It shakes the serum off. Weaken it first (${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less).`,
  aim: "Look at a weakened zombie or skeleton up close, then use the serum.",
};

/**
 * What the Passivity Serum does to a mob: `{ calm: typeId }` when it works (the calmed mob's type), `{ why }` when it
 * doesn't (the serum is kept), undefined for anything that isn't a monster (nothing happens).
 * @param {{ typeId: string, hostile: boolean, baby: boolean, hp: number, max: number }} m @param {number} calmAt
 */
export function serumCheck(m, calmAt) {
  const calm = MOB_KINDS[m.typeId];
  if (!calm) return m.hostile ? { why: SERUM_TEXT.other } : undefined;
  if (m.baby) return { why: SERUM_TEXT.baby };
  if (!(m.max > 0) || m.hp > m.max * calmAt + 1e-9) return { why: SERUM_TEXT.strong(calmAt) };
  return { calm };
}

// ---------------- boxes ----------------

/** @typedef {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } }} Box */

// The gap in blocks between two boxes of cells (0 when they touch or overlap).
/** @param {Box} a @param {Box} b */
export function boxGap(a, b) {
  const dx = Math.max(0, a.min.x - b.max.x, b.min.x - a.max.x);
  const dy = Math.max(0, a.min.y - b.max.y, b.min.y - a.max.y);
  const dz = Math.max(0, a.min.z - b.max.z, b.min.z - a.max.z);
  return Math.max(dx, dy, dz);
}

/** @param {Box} b @param {number} n @returns {Box} */
export function grow(b, n) {
  return { min: { x: b.min.x - n, y: b.min.y - n, z: b.min.z - n }, max: { x: b.max.x + n, y: b.max.y + n, z: b.max.z + n } };
}

/** @param {{ x: number, y: number, z: number }} p @param {Box} b */
export function inBox(p, b) {
  return p.x >= b.min.x && p.x < b.max.x + 1 && p.y >= b.min.y && p.y < b.max.y + 1 && p.z >= b.min.z && p.z < b.max.z + 1;
}

// ---------------- the pen ----------------

/**
 * The working Mob Houses (their hall measured closed: room "ok") whose hall a pen's walking box is beside, within
 * `reach` blocks (a wall or two between them), nearest first.
 * @template {{ id: string, dimension: string, room?: string, bbox?: Box }} H
 * @param {H[]} houses @param {string} dimension @param {Box | undefined} box @param {number} reach @returns {H[]}
 */
export function housesNear(houses, dimension, box, reach) {
  if (!box) return [];
  return houses
    .filter((h) => h.dimension === dimension && h.room === "ok" && h.bbox && boxGap(box, h.bbox) <= reach)
    .sort((a, b) => boxGap(box, /** @type {Box} */ (a.bbox)) - boxGap(box, /** @type {Box} */ (b.bbox)));
}

const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/**
 * The pen measure: the pen's air flood (closed all round, roof included, or where it leads out), the Mob House it is
 * beside, and whether its air is the hall's (it opens into the hall: every open block beside the Mob House block is in
 * the pen's air too).
 * @param {{ enclosed: boolean, escape?: { x: number, y: number, z: number } }} room
 * @param {{ id: string, pos: { x: number, y: number, z: number } }[]} houses (housesNear's, nearest first)
 * @param {(x: number, y: number, z: number) => boolean} open a block guests or mobs can stand in (air)
 * @param {(x: number, y: number, z: number) => boolean} inPen in the pen's air flood
 */
export function penReport(room, houses, open, inPen) {
  const house = houses[0];
  let leaks = false;
  if (house) {
    const airy = SIDES.map(([dx, dy, dz]) => [house.pos.x + dx, house.pos.y + dy, house.pos.z + dz]).filter(([x, y, z]) => open(x, y, z));
    leaks = airy.length > 0 && airy.every(([x, y, z]) => inPen(x, y, z));
  }
  return { enclosed: Boolean(room.enclosed), escape: room.escape, houseId: house?.id, leaks };
}

export const PEN_HOW = "a pen beside a Mob House's hall (the closed building round the Mob House block, where guests walk), its walls touching the hall's, shut in all round with a roof, and walled off from the hall with glass, glass panes or iron bars to look through";

/**
 * Why mobs can't live in this pen (fitFor, and an issue while they live there), or undefined.
 * @param {{ enclosed: boolean, escape?: { x: number, y: number, z: number }, houseId?: string, leaks: boolean } | undefined} pen
 * @param {string} plural @param {boolean} houseWorks the pen's Mob House still has its hall
 */
export function mobPenProblem(pen, plural, houseWorks) {
  if (!pen) return `${plural} live only in ${PEN_HOW}. Build it, then use the Habitat Marker on the ground inside again.`;
  if (!pen.houseId) return `${plural} live only in a pen beside a Mob House's hall, and no working Mob House is beside this one: put a Mob House block inside a closed hall (walls, floor and roof, at least 3 x 3 x 3 inside) whose walls touch the pen's, then use the Habitat Marker on the ground inside again.`;
  if (!houseWorks) return "The Mob House beside this pen is closed: use the Mob House block to see why, then use the Habitat Marker on the ground inside again.";
  if (pen.leaks) return "The pen opens into the Mob House's hall: wall it off (glass, glass panes or iron bars to look through), then use the Habitat Marker on the ground inside again.";
  if (!pen.enclosed) return `${plural} must be shut in all round, roof included: the pen's air leads out${pen.escape ? ` near ${pen.escape.x} ${pen.escape.y} ${pen.escape.z}` : ""}. Close the walls and the roof, then use the Habitat Marker on the ground inside again.`;
  return undefined;
}

// ---------------- the floor they like ----------------

export function newMobFloorResult() {
  return { cells: 0, ids: /** @type {Record<string, number>} */ ({}) };
}

/**
 * The floor blocks under the pen's floor cells that a mob living here likes (`opts.ids`), counted by id.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number, ids: Set<string> }} opts
 * @param {{ cells: number, ids: Record<string, number> }} out
 */
export function* measureMobFloor(idAt, cells, opts, out) {
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    out.cells++;
    const id = idAt(x, y - 1, z) ?? "";
    if (opts.ids.has(id)) out.ids[id] = (out.ids[id] ?? 0) + 1;
  }
  return out;
}

// The share of the floor a species likes (0..1), from the floor measure; undefined not measured.
/** @param {{ mobFloor?: { ids: string[] } }} species @param {{ mobFloor?: { cells: number, ids: Record<string, number> } }} ex */
export function mobFloorShare(species, ex) {
  const t = ex.mobFloor;
  if (!species.mobFloor || !t) return undefined;
  const n = species.mobFloor.ids.reduce((s, id) => s + (t.ids[id] ?? 0), 0);
  return t.cells ? n / t.cells : 0;
}

// Enough of the floor they like (cause "mobfloor"). False caps comfort. Not measured yet: passes.
/** @param {{ mobFloor?: { ids: string[], share: number } }} species @param {any} ex */
export function hasMobFloor(species, ex) {
  const share = mobFloorShare(species, ex);
  return share === undefined || share >= /** @type {{ share: number }} */ (species.mobFloor).share - 1e-9;
}

// ---------------- the clipboard, the warnings, the journal ----------------

/**
 * The Exhibit Clipboard's lines for mobs: the pen, the floor they like (each species living here), the dark (zombies).
 * @param {any} ex @param {any[]} living the mob species living here @param {boolean} houseWorks @param {{ dark?: string, floorCap: number }} o
 */
export function mobLines(ex, living, houseWorks, o) {
  const lines = [];
  const plural = living.length === 1 ? living[0].plural ?? `${living[0].displayName}s` : "Mobs";
  const problem = mobPenProblem(ex.mobPen, plural, houseWorks);
  lines.push(problem ? `§fMob pen: §c${problem}` : "§fMob pen: §abeside a working Mob House§7, shut in all round and walled off from its hall. The house keeps wild monsters from spawning inside it");
  for (const sp of living) {
    if (!sp.mobFloor) continue;
    const share = mobFloorShare(sp, ex);
    const want = Math.round(sp.mobFloor.share * 100);
    if (share === undefined) lines.push(`§f${sp.plural ?? `${sp.displayName}s`}' floor: §7not measured yet: use the Habitat Marker on the ground inside again`);
    else lines.push(`§f${sp.plural ?? `${sp.displayName}s`}' floor: ${share >= sp.mobFloor.share - 1e-9 ? "§a" : "§c"}${Math.round(share * 100)}%§7 of it ${sp.mobFloor.how} (${want}% wanted; below it comfort can't rise above ${o.floorCap})`);
  }
  if (o.dark) lines.push(o.dark);
  return lines;
}

/** Care warnings for mobs: the floor they like. @param {any} ex @param {string} plural @param {any} species @param {number} cap */
export function mobWarnings(ex, plural, species, cap) {
  if (!species.mobFloor || hasMobFloor(species, ex)) return [];
  const share = mobFloorShare(species, ex) ?? 0;
  return [{ severity: 2, text: `${plural} want ${species.mobFloor.how} under ${Math.round(species.mobFloor.share * 100)}% of their floor or more (${Math.round(share * 100)}% now). Without it comfort can't rise above ${cap}.` }];
}

// The Field Journal's line on wild ones and on calming them.
/** @param {any} species @param {number} calmAt */
export function mobWildLine(species, calmAt) {
  const one = species.displayName.toLowerCase();
  return `In the wild ${one}s are monsters: they spawn in the dark (block light 0) and hunt you. To take one for the zoo: weaken it to ${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less, then use a Passivity Serum on it (Mob Taming research). It sparkles green, stands dazed a moment and is calm from then on: it never attacks, never burns in the sun and never despawns. A calmed ${one} follows someone holding ${species.baitItem === "zoocraft:bone_ration" ? "a Bone Ration or a bone" : "a Meat Ration"}; a Mob Cage carries it to its pen`;
}

// ---------------- the Mob House's entry price ----------------

// The share of the guests who go into the Mob House at this price (a mob pen on view from its hall).
/** @param {number} price @param {any} balance */
export function mobHouseShare(price, balance) {
  const g = balance.mobHouse;
  const share = price <= g.fair ? g.shareAtFair + (g.fair - price) * g.sharePerCoinUnder : g.shareAtFair - (price - g.fair) * g.sharePerCoinOver;
  return Math.max(0, Math.min(g.shareMax, share));
}

/**
 * One visitor step at one Mob House: how many of `guests` go in and pay (none with no mob pen on view from its hall;
 * a second pen on view draws a few more), the coins, and the part of a guest carried to the next step.
 * @param {{ guests: number, price: number, carry?: number, pens: number }} s @param {any} balance
 */
export function mobHouseSales({ guests, price, carry = 0, pens }, balance) {
  if (pens <= 0 || guests <= 0) return { paid: 0, revenue: 0, carry: 0 };
  const g = balance.mobHouse;
  const variety = Math.min(1, g.varietyBase + g.varietyPerPen * pens);
  const expected = carry + guests * mobHouseShare(price, balance) * variety;
  const paid = Math.max(0, Math.floor(expected + 1e-9));
  return { paid, revenue: paid * price, carry: Math.max(0, expected - paid) };
}

export const MOB_HOUSE_TEXT = {
  outside: "It's outside the park. Guests only visit inside the park boundary.",
  inside: "It's inside an exhibit. The Mob House block goes in the hall, on the guests' side.",
  open: "It isn't in a hall yet. Build the hall: walls, a floor and a roof all round with no gaps (doors count as wall), at least 3 x 3 x 3 inside, then put the Mob House block inside it. Mob pens go beside the hall.",
  small: "The hall is too small: it needs open space at least 3 x 3 x 3 inside (furniture takes up space).",
  unloaded: "Part of the hall isn't loaded. Come closer and try again.",
  path: "No guest path reaches it. Lay a path (gravel, bricks, planks...) from the Park Entrance Gate, through the hall's door, to right beside the Mob House block.",
  unchecked: "Checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?",
};

/**
 * The pens a Mob House shows: exhibits with mobs living in them, beside this house, that a viewed Viewing Point standing
 * in its hall looks into.
 * @param {{ id: string, dimension: string, bbox?: Box }} house
 * @param {{ dimension: string, pos: { x: number, y: number, z: number }, viewed?: boolean, exhibitId?: string }[]} points
 * @param {(id: string) => ({ mobPen?: { houseId?: string } } | undefined)} penOf an exhibit with mobs living in it, else undefined
 */
export function pensOnView(house, points, penOf) {
  if (!house.bbox) return [];
  const hall = grow(house.bbox, 1);
  const out = new Set();
  for (const p of points) {
    if (!p.viewed || !p.exhibitId || p.dimension !== house.dimension || !inBox(p.pos, hall)) continue;
    if (penOf(p.exhibitId)?.mobPen?.houseId === house.id) out.add(p.exhibitId);
  }
  return [...out];
}

// ---------------- the spawn guard ----------------

/**
 * Where wild monsters may not spawn: each working Mob House's hall and each mob pen, a block round them.
 * @param {{ type: string, dimension: string, room?: string, bbox?: Box }[]} equipment
 * @param {{ dimension: string, bbox?: Box, mobPen?: { houseId?: string } }[]} exhibits
 * @returns {{ dimension: string, box: Box }[]}
 */
export function guardBoxes(equipment, exhibits) {
  const out = [];
  for (const r of equipment) if (r.type === "mobhouse" && r.room === "ok" && r.bbox) out.push({ dimension: r.dimension, box: grow(r.bbox, 1) });
  for (const ex of exhibits) if (ex.mobPen?.houseId && ex.bbox) out.push({ dimension: ex.dimension, box: grow(ex.bbox, 1) });
  return out;
}

/** @param {{ dimension: string, box: Box }[]} boxes @param {string} dimension @param {{ x: number, y: number, z: number }} pos */
export function guarded(boxes, dimension, pos) {
  return boxes.some((b) => b.dimension === dimension && inBox(pos, b.box));
}
