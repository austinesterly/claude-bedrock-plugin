// Hostile mobs in the zoo (0.1.163, module 11: research/mobhouse_plan.md), pure: plain records in, plain answers out.
// The world side is animals/mobs.js (the Passivity Serum, the zoo mobs' sounds, the spawn guard) and visitors/mobHouse.js
// (the Mob House block: its hall, its entry price).
//
// A vanilla zombie or skeleton weakened to a quarter of its health or less turns into a calmed one (its own entity,
// zoocraft:calm_zombie, the vanilla look, never hostile) when a Passivity Serum is used on it; a Mob Cage carries a calmed
// one to a pen; in the pen it is the zoo's (zoocraft:zoo_zombie). A pen is an exhibit inside a Mob House: beside its
// hall (the closed building round the Mob House block, where guests walk), shut in all round, roof included, and walled
// off from the hall (glass, glass panes or iron bars to look through; tinted glass for the mobs that like the dark: in
// Bedrock daylight comes into a hall through its door, even shut, and on through plain glass and iron bars, the 0.1.164
// bench found, and tinted glass alone keeps it out of the pen while the guests still see in).

// The vanilla mobs the serum calms, and what each becomes (0.1.164: the creeper and the spider too).
export const MOB_KINDS = {
  "minecraft:zombie": "zoocraft:calm_zombie",
  "minecraft:skeleton": "zoocraft:calm_skeleton",
  "minecraft:creeper": "zoocraft:calm_creeper",
  "minecraft:spider": "zoocraft:calm_spider",
  // The Cyclops (0.1.165): a rare mob, worn down in a fight as the bosses are (animals/boss.js) till it sits down panting.
  "zoocraft:wild_cyclops": "zoocraft:calm_cyclops",
  // The Necromancer (0.1.166): the second rare mob, worn down the same way till it kneels down panting.
  "zoocraft:wild_necromancer": "zoocraft:calm_necromancer",
  // The Voidling (0.1.167): the third rare mob, worn down the same way till it crouches down panting.
  "zoocraft:wild_voidling": "zoocraft:calm_voidling",
};
export const CALM_TYPES = new Set(Object.values(MOB_KINDS));
// The zoo's mobs, calmed or in a pen: their sounds (played by script; the entities have none of their own). `say` now
// and then (BALANCE.mobs.sayChance a second, times `chance`), at `volume` and about `pitch`; `hurt` when a player hits
// one. A creeper has no sound of its own but its hurt one and its fuse: a zoo creeper hisses softly and seldom (the
// fuse, quiet and low), and never swells.
export const MOB_SOUNDS = {
  "zoocraft:calm_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:zoo_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:calm_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
  "zoocraft:zoo_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
  "zoocraft:calm_creeper": { say: "random.fuse", hurt: "mob.creeper.say", volume: 0.3, pitch: 0.6, chance: 0.5 },
  "zoocraft:zoo_creeper": { say: "random.fuse", hurt: "mob.creeper.say", volume: 0.3, pitch: 0.6, chance: 0.5 },
  "zoocraft:calm_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:zoo_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:calm_cyclops": { say: "mob.ravager.ambient", hurt: "mob.hoglin.angry", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:zoo_cyclops": { say: "mob.ravager.ambient", hurt: "mob.hoglin.angry", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:calm_necromancer": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:zoo_necromancer": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:calm_voidling": { say: "mob.endermen.idle", hurt: "mob.endermen.hit", volume: 0.5, pitch: 0.6, chance: 0.5 },
  "zoocraft:zoo_voidling": { say: "mob.endermen.idle", hurt: "mob.endermen.hit", volume: 0.5, pitch: 0.6, chance: 0.5 },
};
export const ZOO_MOB_FAMILY = "zoocraft_mob";

// A calmed mob, as the serum's message names it, and the food it follows.
export const MOB_INFO = {
  "zoocraft:calm_zombie": { one: "zombie", bait: "a Meat Ration" },
  "zoocraft:calm_skeleton": { one: "skeleton", bait: "a Bone Ration" },
  "zoocraft:calm_creeper": { one: "creeper", bait: "a Grain Ration", note: " (it never swells or explodes)" },
  "zoocraft:calm_spider": { one: "spider", bait: "a Meat Ration", note: " (and it never climbs)" },
  "zoocraft:calm_cyclops": { one: "Cyclops", bait: "a Meat Ration", note: " (no more club, stomps or rocks)" },
  "zoocraft:calm_necromancer": { one: "Necromancer", bait: "a Bone Ration", note: " (no more bolts, and it raises nothing)" },
  "zoocraft:calm_voidling": { one: "Voidling", bait: "Chorus Browse", note: " (no more grabs, rakes or orbs)" },
};

export const SERUM_TEXT = {
  research: "The Passivity Serum needs Mob Taming research at the Research Desk first.",
  other: "For now the Passivity Serum works only on zombies, skeletons, creepers, spiders, the Cyclops, the Necromancer and the Voidling.",
  baby: "Leave the young ones be: the serum is too strong for a baby.",
  strong: (calmAt) => `It shakes the serum off. Weaken it first (${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less).`,
  aim: "Look at a weakened zombie, skeleton, creeper, spider, Cyclops, Necromancer or Voidling up close, then use the serum.",
};
// A mob that shakes the serum off has its own words (the Cyclops: worn down in a fight till it sits down panting; the
// Necromancer, till it kneels).
const STRONG = {
  "zoocraft:wild_cyclops": "It shakes the serum off. Wear it down first, till it sits down panting (a quarter of its health).",
  "zoocraft:wild_necromancer": "It shakes the serum off. Wear it down first, till it kneels down panting (a quarter of its health).",
  "zoocraft:wild_voidling": "It shakes the serum off. Wear it down first, till it crouches down panting (a quarter of its health).",
};

// The serum's message once a mob is calmed.
/** @param {string} calmType */
export function calmedText(calmType) {
  const m = MOB_INFO[calmType] ?? { one: "mob", bait: "its food" };
  return `§aThe ${m.one} sparkles green and calms down. §fIt never attacks now${m.note ?? ""}. Bring it to a pen in a Mob House: a Mob Cage carries it (with ${m.bait} in your inventory), or lead it holding one.`;
}

/**
 * What the Passivity Serum does to a mob: `{ calm: typeId }` when it works (the calmed mob's type), `{ why }` when it
 * doesn't (the serum is kept), undefined for anything that isn't a monster (nothing happens).
 * @param {{ typeId: string, hostile: boolean, baby: boolean, hp: number, max: number }} m @param {number} calmAt
 */
export function serumCheck(m, calmAt) {
  const calm = MOB_KINDS[m.typeId];
  if (!calm) return m.hostile ? { why: SERUM_TEXT.other } : undefined;
  if (m.baby) return { why: SERUM_TEXT.baby };
  if (!(m.max > 0) || m.hp > m.max * calmAt + 1e-9) return { why: STRONG[m.typeId] ?? SERUM_TEXT.strong(calmAt) };
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

export const PEN_HOW = "a pen beside a Mob House's hall (the closed building round the Mob House block, where guests walk), its walls touching the hall's, shut in all round with a roof, and walled off from the hall with glass, glass panes or iron bars to look through (tinted glass for mobs that like the dark: daylight comes into the hall through its door, even shut, and on through plain glass and bars)";

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

// ---------------- what they like in the pen (0.1.164) ----------------

export function newMobDecorResult() {
  return { ids: /** @type {Record<string, number>} */ ({}) };
}

const AROUND = [[0, 0, 0], ...SIDES];

/**
 * The blocks in the pen's air and round it (its walls, floor and roof) that a mob living here likes (`opts.ids`),
 * counted by id, each block once: cobwebs hung in the corners (they stand in the air), leaves in a wall or as a bush on
 * the floor, ferns on the grass.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells the pen's air flood @param {{ cellsPerYield: number, ids: Set<string> }} opts
 * @param {{ ids: Record<string, number> }} out
 */
export function* measureMobDecor(idAt, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of AROUND) {
      const p = `${x + dx},${y + dy},${z + dz}`;
      if (seen.has(p)) continue;
      seen.add(p);
      if (++work % opts.cellsPerYield === 0) yield;
      const id = idAt(x + dx, y + dy, z + dz) ?? "";
      if (opts.ids.has(id)) out.ids[id] = (out.ids[id] ?? 0) + 1;
    }
  }
  return out;
}

// How many of what a species likes are in its pen (species.mobDecor: Creepers' leaves or ferns, Spiders' cobwebs);
// undefined not measured.
/** @param {{ mobDecor?: { ids: string[] } }} species @param {{ mobFloor?: { decor?: { ids: Record<string, number> } } }} ex */
export function mobDecorCount(species, ex) {
  const d = ex.mobFloor?.decor;
  if (!species.mobDecor || !d) return undefined;
  return species.mobDecor.ids.reduce((s, id) => s + (d.ids[id] ?? 0), 0);
}

// Enough of the floor they like and of what they like in the pen (cause "mobfloor"). False caps comfort. Not measured
// yet: passes.
/** @param {{ mobFloor?: { ids: string[], share: number }, mobDecor?: { ids: string[], min: number } }} species @param {any} ex */
export function hasMobFloor(species, ex) {
  const share = mobFloorShare(species, ex);
  const floor = share === undefined || share >= /** @type {{ share: number }} */ (species.mobFloor).share - 1e-9;
  const n = mobDecorCount(species, ex);
  return floor && (n === undefined || n >= /** @type {{ min: number }} */ (species.mobDecor).min);
}

// What a mob wants in its pen, in words (the comfort cause's text): its floor, and what it likes in the pen.
/** @param {any} s */
export function mobLikesText(s) {
  const parts = [];
  if (s?.mobFloor) parts.push(`${s.mobFloor.how} under ${Math.round(s.mobFloor.share * 100)}% of the floor or more`);
  if (s?.mobDecor) parts.push(`${s.mobDecor.min} or more ${s.mobDecor.how} in the pen`);
  return parts.join(", and ") || "the floor they like";
}

// ---------------- the dark (zombies, spiders) ----------------

// The brightest light a mob that likes the dark allows on its floor: the Nocturnal Lamps' (7), or its own (Spiders: 4).
/** @param {{ darkLight?: number }} species @param {any} balance */
export function darkLimit(species, balance) {
  return species.darkLight ?? balance.nocturnal.maxLight;
}

// How to light a pen for mobs that like the dark, to `max`.
/** @param {number} max @param {number} lamps the Nocturnal Lamps' light */
export function darkHow(max, lamps) {
  return max >= lamps ? `Nocturnal Lamps or glow lichen at most (nothing brighter than light ${max})` : `nothing brighter than light ${max} on the floor: a Nocturnal Lamp hung 3 blocks above the floor gives ${lamps - 3} right under it (torches and lanterns are far too bright)`;
}

/**
 * The Exhibit Clipboard's dark line for mobs that like the dark (species.lowLight), or undefined.
 * @param {any} ex @param {any[]} living the mob species living here
 * @param {{ house: boolean, problems: string[] }} h is it a nocturnal house, and why not (animals/nightRules.js)
 * @param {any} balance
 */
export function mobDarkLine(ex, living, h, balance) {
  const dark = living.filter((sp) => sp.lowLight);
  if (!dark.length) return undefined;
  const who = dark.map((sp) => sp.plural ?? `${sp.displayName}s`).join(" and ");
  if (!ex.house) return "§fDark: §7not measured yet: use the Habitat Marker on the ground inside again";
  const max = Math.min(...dark.map((sp) => darkLimit(sp, balance)));
  const problems = h.house ? [] : [...h.problems];
  if (!problems.length && ex.house.brightest > max) problems.push(`too bright, brightest spot ${ex.house.brightest} of ${max} allowed (${darkHow(max, balance.nocturnal.maxLight)})`);
  if (!problems.length) return `§fDark: §ayes§7 (${who.toLowerCase()} like it; Nocturnal Lamps let the guests see them)`;
  return `§fDark: §cno§7: ${problems.join("; ")}. ${who}' comfort can't rise above ${balance.chorusMoth.dimComfortCap}`;
}

/** The care warning for mobs that like the dark, out of it. @param {any} species @param {string} plural @param {any} balance */
export function mobDarkWarning(species, plural, balance) {
  return { severity: 2, text: `${plural} like the dark: roof the pen, wall it with solid blocks and use tinted glass to the hall (daylight comes into the hall through its door, even shut, and on through plain glass, glass panes and iron bars; tinted glass keeps it out and the guests still see in), and light it with ${darkHow(darkLimit(species, balance), balance.nocturnal.maxLight)}. In daylight comfort can't rise above ${balance.chorusMoth.dimComfortCap}. Measure again with the Habitat Marker after.` };
}

// ---------------- the clipboard, the warnings, the journal ----------------

const pluralOf = (/** @type {any} */ sp) => sp.plural ?? `${sp.displayName}s`;

/**
 * The Exhibit Clipboard's lines for mobs: the pen, the floor they like and what they like in the pen (each species
 * living here), the dark (zombies, spiders).
 * @param {any} ex @param {any[]} living the mob species living here @param {boolean} houseWorks @param {{ dark?: string, floorCap: number }} o
 */
export function mobLines(ex, living, houseWorks, o) {
  const lines = [];
  const plural = living.length === 1 ? pluralOf(living[0]) : "Mobs";
  const problem = mobPenProblem(ex.mobPen, plural, houseWorks);
  lines.push(problem ? `§fMob pen: §c${problem}` : "§fMob pen: §abeside a working Mob House§7, shut in all round and walled off from its hall. The house keeps wild monsters from spawning inside it");
  for (const sp of living) {
    if (sp.mobFloor) {
      const share = mobFloorShare(sp, ex);
      const want = Math.round(sp.mobFloor.share * 100);
      if (share === undefined) lines.push(`§f${pluralOf(sp)}' floor: §7not measured yet: use the Habitat Marker on the ground inside again`);
      else lines.push(`§f${pluralOf(sp)}' floor: ${share >= sp.mobFloor.share - 1e-9 ? "§a" : "§c"}${Math.round(share * 100)}%§7 of it ${sp.mobFloor.how} (${want}% wanted; below it comfort can't rise above ${o.floorCap})`);
    }
    if (sp.mobDecor) {
      const n = mobDecorCount(sp, ex);
      const what = sp.mobDecor.how.charAt(0).toUpperCase() + sp.mobDecor.how.slice(1);
      if (n === undefined) lines.push(`§f${what}: §7not measured yet: use the Habitat Marker on the ground inside again`);
      else lines.push(`§f${what}: ${n >= sp.mobDecor.min ? "§a" : "§c"}${n}§7 in the pen (${sp.mobDecor.min} or more for ${pluralOf(sp).toLowerCase()}; fewer and comfort can't rise above ${o.floorCap})`);
    }
  }
  if (o.dark) lines.push(o.dark);
  return lines;
}

/** Care warnings for mobs: the floor they like, and what they like in the pen. @param {any} ex @param {string} plural @param {any} species @param {number} cap */
export function mobWarnings(ex, plural, species, cap) {
  const out = [];
  const share = mobFloorShare(species, ex);
  if (species.mobFloor && share !== undefined && share < species.mobFloor.share - 1e-9) out.push({ severity: 2, text: `${plural} want ${species.mobFloor.how} under ${Math.round(species.mobFloor.share * 100)}% of their floor or more (${Math.round(share * 100)}% now). Without it comfort can't rise above ${cap}.` });
  const n = mobDecorCount(species, ex);
  if (species.mobDecor && n !== undefined && n < species.mobDecor.min) out.push({ severity: 2, text: `${plural} want ${species.mobDecor.min} or more ${species.mobDecor.how} in their pen (${n} now)${species.mobDecor.where ? `: ${species.mobDecor.where}` : ""}. Without them comfort can't rise above ${cap}.` });
  return out;
}

// How each one lives in the wild, and how it lives in a pen (the Field Journal).
const WILD_HOW = {
  "minecraft:creeper": "they spawn in the dark (block light 0) and creep up on you to explode. Use the serum from a few blocks away: within about 2.5 blocks one hisses and explodes a moment later (step back and it stops)",
  "minecraft:spider": "they spawn in the dark (block light 0), climb walls and hunt you at night (by day they leave you be unless you hit them). A skeleton riding one jumps off when it is calmed",
  "zoocraft:wild_cyclops": "one lives alone in a camp of boulders round a campfire in the windswept hills or the stony peaks, very rarely (once Mob Taming is done the first walk there finds one, then only far from it). It goes for anyone who comes within 12 blocks (sneaking, 4): it smashes its club down in front, stomps the ground to throw you up and back, and throws rocks from far off (step aside). It can't be killed: worn down to a quarter of its health it sits down panting, and then the serum takes",
  "zoocraft:wild_necromancer": "one lives alone in a crypt of soul soil and blackstone in the Nether, in a soul sand valley or beside a fortress, very rarely (once Mob Taming is done the first walk there finds one, then only far from it). It goes for anyone who comes within 12 blocks (sneaking, 4): it swings its staff, strikes the ground for a ring of soul fire that slows you, throws soul bolts from far off (step aside: they set you alight) and raises skeletons from the ground, three at most, that crumble when the fight is over. It can't be killed: worn down to a quarter of its health it kneels down panting on its staff, and then the serum takes",
  "zoocraft:wild_voidling": "one lives alone in a rift of end stone and obsidian on the outer End islands, by an island's edge, very rarely (once Mob Taming is done the first walk out there finds one, then only far from it). It is very slow, but it goes for anyone who comes within 10 blocks (sneaking, 4): it rakes with its long arms, throws slow void orbs that blind you, and when you are close it shrieks for a second and grabs you, then walks you to the island's edge and drops you into the void. Step back out of its reach when it shrieks; held, hit it and it lets go (an ender pearl or a chorus fruit gets you free too). It can't be killed: worn down to a quarter of its health it crouches down panting, and then the serum takes",
};
const PEN_LIFE = {
  "zoocraft:zoo_zombie": "they shamble about with their arms out, groaning now and then",
  "zoocraft:zoo_skeleton": "they wander about rattling now and then",
  "zoocraft:zoo_creeper": "they creep about on their four short legs and hiss softly now and then, but never swell or explode",
  "zoocraft:zoo_spider": "they scuttle about the floor, eyes glowing red; in the zoo they never climb",
  "zoocraft:zoo_cyclops": "it stomps about its pen, eats at its feeder, picks up a rock and tosses it up to catch it, bellows now and then, sits down to rest and sleeps sitting at night; it never smashes, stomps or throws at anyone",
  "zoocraft:zoo_necromancer": "it paces its pen, eats at its feeder, holds its staff up and lets a soul flame float off it, chants softly now and then, kneels to rest and kneels head bowed at night; it never strikes, throws bolts or raises anything",
  "zoocraft:zoo_voidling": "it wanders slowly round its pen, eats at its feeder, stretches its long arms up and lets a violet wisp float off its fingers, hums now and then, crouches to rest and crouches head bowed at night; it never grabs, rakes or throws anything",
};
const MATES = {
  "zoocraft:zoo_zombie": "Zombies and skeletons share a pen",
  "zoocraft:zoo_skeleton": "Zombies and skeletons share a pen",
};
const FOOD = { "zoocraft:bone_ration": "Bone Rations (bones and bone meal)", "zoocraft:grain_ration": "Grain Rations", "zoocraft:meat_ration": "Meat Rations" };
const BAIT = { "zoocraft:bone_ration": "a Bone Ration or a bone", "zoocraft:grain_ration": "a Grain Ration", "zoocraft:meat_ration": "a Meat Ration" };

// The Field Journal's line on wild ones and on calming them.
/** @param {any} species @param {number} calmAt */
export function mobWildLine(species, calmAt) {
  const one = species.displayName.toLowerCase();
  return `In the wild ${pluralOf(species).toLowerCase()} are monsters: ${WILD_HOW[species.mobSource] ?? "they spawn in the dark (block light 0) and hunt you"}. To take one for the zoo: weaken it to ${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less, then use a Passivity Serum on it (Mob Taming research). It sparkles green, stands dazed a moment and is calm from then on: it never attacks, never burns in the sun and never despawns. A calmed ${one} follows someone holding ${BAIT[species.baitItem] ?? "its food"}; a Mob Cage carries it to its pen`;
}

/**
 * The Field Journal's lines on a mob in the zoo: the pen, what it likes there (its floor, what it likes in the pen, the
 * dark), how it lives there and its food. `prof`: its habitat profile (the Cyclops's pen is bigger and taller: 0.1.165).
 * @param {any} sp @param {any} balance @param {{ baseArea: number, extraArea: number, minHeight: number }} [prof]
 */
export function mobJournalLines(sp, balance, prof = { baseArea: 25, extraArea: 10, minHeight: 3 }) {
  const side = Math.round(Math.sqrt(prof.baseArea));
  const out = [`§7The pen: ${PEN_HOW}. At least ${side} x ${side} of floor for the first (${prof.extraArea} more blocks for each more), ${prof.minHeight} blocks of headroom. Guests pay the Mob House's entry price to go into its hall once they can see a mob in a pen from a Viewing Point standing in the hall (a guest path through the hall's door to it). No wild monster spawns in the hall or the pens`];
  const likes = [];
  if (sp.mobFloor) likes.push(`${sp.mobFloor.how} under ${Math.round(sp.mobFloor.share * 100)}% of the floor or more`);
  if (sp.mobDecor) likes.push(`${sp.mobDecor.min} or more ${sp.mobDecor.how} in the pen${sp.mobDecor.where ? ` (${sp.mobDecor.where})` : ""}`);
  let line = `§7${sp.mobFloor ? "The floor" : "The pen"}: ${likes.join(", and ")}. Without ${sp.mobFloor && !sp.mobDecor ? "it" : "them"} comfort can't rise above ${balance.mobs.floorComfortCap}`;
  if (sp.lowLight) line += `. And the dark: no daylight in the pen and nothing brighter than light ${darkLimit(sp, balance)}${sp.darkLight !== undefined ? ` on the floor (a Nocturnal Lamp hung 3 blocks above the floor gives ${balance.nocturnal.maxLight - 3} right under it, and lets the guests see them)` : " (Nocturnal Lamps for the guests to see them by)"}; tinted glass to the hall keeps the daylight out (it comes in through the hall's door, even shut, and on through plain glass and iron bars); in light comfort can't rise above ${balance.chorusMoth.dimComfortCap}`;
  out.push(line);
  out.push(`§7In the pen: ${PEN_LIFE[sp.id] ?? "they wander about"}. They never attack, never burn in the sun and never despawn, and nothing hurts them but a player's hits. Food: ${FOOD[sp.baitItem] ?? "their food"} in a Basic Feeder; a Hanging Food Basket gives them something to forage. ${MATES[sp.id] ?? `${pluralOf(sp)} keep a pen to themselves`}`);
  return out;
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
