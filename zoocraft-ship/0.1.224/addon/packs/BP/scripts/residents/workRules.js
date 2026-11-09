// Work (0.1.224, stage D of Austin's residents spec: research/npc_spec_plan.md section 8), pure. A resident with a job
// works it in a work site the player builds: ground fenced in all round (fences, walls or solid blocks), a fence gate in
// its edge, a Work Anchor on its floor, a chest or barrel beside the anchor for what they bring in, and a path from their
// front door to the gate. They walk to work for their shift (balance.js residents.work), work it, and walk home after.
// The miner (Dave: a mine) works only the ores within reach of the site's own floor, and leaves the rock they sat in
// where they were, so a mine keeps its shape: nothing is dug through and nothing else is ever broken or placed. Good
// shifts make them more skilled (Apprentice, Skilled, Expert): quicker, and able to work rarer ores. Work brings no zoo
// money (the spec): what they mine goes into the work chest.

/** "Apprentice", "Skilled", "Expert". */
export const SKILL_NAMES = ["Apprentice", "Skilled", "Expert"];

/**
 * The ores a miner works (vanilla blocks only): the rock each leaves behind, what it gives (as a pickaxe without
 * enchantments would: the item, and how many from min to max) and the skill it takes (0 Apprentice, 1 Skilled, 2 Expert).
 */
const ore = (rock, item, min, max, skill) => ({ rock, item, min, max, skill });
const STONE = "minecraft:stone";
const DEEP = "minecraft:deepslate";
const NETHER = "minecraft:netherrack";
export const ORES = {
  "minecraft:coal_ore": ore(STONE, "minecraft:coal", 1, 1, 0),
  "minecraft:deepslate_coal_ore": ore(DEEP, "minecraft:coal", 1, 1, 0),
  "minecraft:copper_ore": ore(STONE, "minecraft:raw_copper", 2, 5, 0),
  "minecraft:deepslate_copper_ore": ore(DEEP, "minecraft:raw_copper", 2, 5, 0),
  "minecraft:iron_ore": ore(STONE, "minecraft:raw_iron", 1, 1, 0),
  "minecraft:deepslate_iron_ore": ore(DEEP, "minecraft:raw_iron", 1, 1, 0),
  "minecraft:gold_ore": ore(STONE, "minecraft:raw_gold", 1, 1, 1),
  "minecraft:deepslate_gold_ore": ore(DEEP, "minecraft:raw_gold", 1, 1, 1),
  "minecraft:redstone_ore": ore(STONE, "minecraft:redstone", 4, 5, 1),
  "minecraft:lit_redstone_ore": ore(STONE, "minecraft:redstone", 4, 5, 1),
  "minecraft:deepslate_redstone_ore": ore(DEEP, "minecraft:redstone", 4, 5, 1),
  "minecraft:lit_deepslate_redstone_ore": ore(DEEP, "minecraft:redstone", 4, 5, 1),
  "minecraft:lapis_ore": ore(STONE, "minecraft:lapis_lazuli", 4, 9, 1),
  "minecraft:deepslate_lapis_ore": ore(DEEP, "minecraft:lapis_lazuli", 4, 9, 1),
  "minecraft:nether_gold_ore": ore(NETHER, "minecraft:gold_nugget", 2, 6, 1),
  "minecraft:quartz_ore": ore(NETHER, "minecraft:quartz", 1, 1, 1),
  "minecraft:diamond_ore": ore(STONE, "minecraft:diamond", 1, 1, 2),
  "minecraft:deepslate_diamond_ore": ore(DEEP, "minecraft:diamond", 1, 1, 2),
  "minecraft:emerald_ore": ore(STONE, "minecraft:emerald", 1, 1, 2),
  "minecraft:deepslate_emerald_ore": ore(DEEP, "minecraft:emerald", 1, 1, 2),
  "minecraft:ancient_debris": ore(NETHER, "minecraft:ancient_debris", 1, 1, 2),
};

/** The ores in words by the skill they take, for the anchor's page. */
export const ORE_WORDS = ["coal, copper and iron", "gold, redstone, lapis, Nether quartz and Nether gold", "diamonds, emeralds and ancient debris"];

/** Whether a block is an ore at all (any skill). */
export const isOre = (typeId) => Object.prototype.hasOwnProperty.call(ORES, typeId);

/** Whether a worker of this skill can mine it. */
export function canMine(typeId, skill) {
  const o = isOre(typeId) ? ORES[typeId] : undefined;
  return Boolean(o) && o.skill <= skill;
}

/** What mining it gives: { item, count, rock (what's left in its place) }, or undefined for anything that isn't an ore. */
export function oreDrop(typeId, random = Math.random) {
  const o = isOre(typeId) ? ORES[typeId] : undefined;
  if (!o) return undefined;
  return { item: o.item, count: o.min + Math.floor(random() * (o.max - o.min + 1)), rock: o.rock };
}

/** The work each job does (data/residents.js `work`). Only the miner's is built in 0.1.224. */
export const WORK_KINDS = {
  mine: { site: "mine", worker: "miner", verb: "mining", things: "ores", needsChest: true },
};

/** A resident's work kind ("mine"), or undefined when their job has no work yet (or they have no job). */
export function workKindOf(res) {
  return res?.work && WORK_KINDS[res.work] ? res.work : undefined;
}

/** Their skill (0 Apprentice, 1 Skilled, 2 Expert) by their good shifts, from g.skillFrom's lower bounds. */
export function skillOf(goodShifts, g) {
  let s = 0;
  for (let i = 0; i < g.skillFrom.length; i++) if ((goodShifts ?? 0) >= g.skillFrom[i]) s = i;
  return s;
}

/** "Apprentice (4 of 10 good shifts to Skilled)", "Expert (34 good shifts)". */
export function skillText(goodShifts, g) {
  const n = goodShifts ?? 0;
  const s = skillOf(n, g);
  if (s + 1 >= g.skillFrom.length) return `${SKILL_NAMES[s]} (${n} good shift${n === 1 ? "" : "s"})`;
  return `${SKILL_NAMES[s]} (${n} of ${g.skillFrom[s + 1]} good shifts to ${SKILL_NAMES[s + 1]})`;
}

/** Real seconds a worker of this skill takes over one ore. */
export function mineSeconds(skill, g) {
  return g.mineSeconds[Math.max(0, Math.min(g.mineSeconds.length - 1, skill))];
}

/**
 * A resident's work shift as times of day ({ from, to }): a day worker's from their own leaving time (`leaveAt`) to
 * g.dayTo, a night worker's from g.nightFrom to g.nightTo. Undefined with no work kind (Sheila is retired; the other
 * jobs' work comes later).
 */
export function shiftOf(res, leaveAt, g) {
  if (!workKindOf(res)) return undefined;
  return res.shift === "night" ? { from: g.nightFrom, to: g.nightTo } : { from: leaveAt, to: g.dayTo };
}

/** Whether time of day `t` is within a shift (one running past midnight too). */
export function inShift(t, s) {
  if (!s) return false;
  return s.from <= s.to ? t >= s.from && t < s.to : t >= s.from || t < s.to;
}

/**
 * Which shift time of day `t` on world day `day` belongs to, as a key: the day it started (a night shift running past
 * midnight belongs to the day before). For counting each shift once.
 */
export function shiftKey(t, day, s) {
  return s && s.from > s.to && t < s.to ? day - 1 : day;
}

/** How much work a shift can hold in a site this size (floor blocks): g.perCell a block, from g.capMin to g.capMax. */
export function capacityOf(cells, g) {
  return Math.max(g.capMin, Math.min(g.capMax, Math.round((cells ?? 0) * g.perCell)));
}

/** Whether a shift with this much done counts as a good one (for skill, and a happier visit after). */
export function goodShift(done, g) {
  return (done ?? 0) >= g.goodShift;
}

// Where a worker standing with their feet at (x, y, z) reaches to work a block: beside them at their feet and at their
// head, under their feet, and over their head.
export const REACH = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 0, 1],
  [0, 0, -1],
  [1, 1, 0],
  [-1, 1, 0],
  [0, 1, 1],
  [0, 1, -1],
  [0, -1, 0],
  [0, 2, 0],
];

const k3 = (x, y, z) => `${x},${y},${z}`;
const parse = (k) => k.split(",").map(Number);

/**
 * The blocks a site's worker could work, each once, with where to stand for it (the first floor cell found that reaches
 * it). cells: the site's floor (keys "x,y,z" of feet cells); typeAt(x, y, z): the block's id there, or undefined when it
 * can't be read; isTarget(typeId). At most `max`. Returns [{ pos: {x, y, z}, stand: {x, y, z}, typeId }].
 */
export function workTargets(cells, typeAt, isTarget, max = 256) {
  const out = [];
  const seen = new Set();
  for (const key of cells) {
    const [x, y, z] = parse(key);
    for (const [dx, dy, dz] of REACH) {
      const p = { x: x + dx, y: y + dy, z: z + dz };
      const k = k3(p.x, p.y, p.z);
      if (seen.has(k) || cells.has(k)) continue;
      seen.add(k);
      const typeId = typeAt(p.x, p.y, p.z);
      if (typeId && isTarget(typeId)) {
        out.push({ pos: p, stand: { x, y, z }, typeId });
        if (out.length >= max) return out;
      }
    }
  }
  return out;
}

/** Whether a worker standing at feet cell `stand` reaches the block at `pos`. */
export function reaches(stand, pos) {
  return REACH.some(([dx, dy, dz]) => stand.x + dx === pos.x && stand.y + dy === pos.y && stand.z + dz === pos.z);
}

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * The gates in a site's edge: a fence gate (isGate) beside a floor cell at the feet, whose far side isn't the site's
 * floor. Returns [{ gate, inside (the floor cell by it), outside (the feet spot past it) }], each gate once.
 */
export function siteGates(cells, isGate) {
  const out = [];
  const seen = new Set();
  for (const key of cells) {
    const [x, y, z] = parse(key);
    for (const [dx, dz] of SIDES) {
      const g = { x: x + dx, y, z: z + dz };
      const k = k3(g.x, g.y, g.z);
      if (seen.has(k) || !isGate(g.x, g.y, g.z)) continue;
      const outside = { x: x + 2 * dx, y, z: z + 2 * dz };
      if (cells.has(k3(outside.x, outside.y, outside.z))) continue; // a gate between two parts of the site
      seen.add(k);
      out.push({ gate: g, inside: { x, y, z }, outside });
    }
  }
  return out;
}

/** The gate nearest a spot (the worker's front door), or undefined. */
export function nearestGate(gates, spot) {
  let best;
  let bd = Infinity;
  for (const g of gates) {
    const d = spot ? Math.hypot(g.outside.x - spot.x, g.outside.z - spot.z) : 0;
    if (d < bd) {
      bd = d;
      best = g;
    }
  }
  return best;
}

/**
 * A walk over a site's floor (cells: keys of feet cells) from cell `from` to the nearest of `goals` (keys of cells),
 * stepping to the four sides, up one block or down as far as `maxDrop`. Returns the cells walked, `from` first, or
 * undefined when none is reachable within `limit` cells.
 */
export function siteWalk(cells, from, goals, maxDrop, limit = 20000) {
  const start = k3(from.x, from.y, from.z);
  if (!cells.has(start)) return undefined;
  const ys = new Map(); // column -> its cells' y
  for (const key of cells) {
    const [x, y, z] = parse(key);
    const c = `${x},${z}`;
    const l = ys.get(c);
    if (l) l.push(y);
    else ys.set(c, [y]);
  }
  const prev = new Map([[start, undefined]]);
  const queue = [start];
  let head = 0;
  let found;
  while (head < queue.length && head < limit) {
    const k = queue[head++];
    if (goals.has(k)) {
      found = k;
      break;
    }
    const [x, y, z] = parse(k);
    for (const [dx, dz] of SIDES) {
      for (const ny of ys.get(`${x + dx},${z + dz}`) ?? []) {
        if (ny - y > 1 || y - ny > maxDrop) continue;
        const nk = k3(x + dx, ny, z + dz);
        if (prev.has(nk)) continue;
        prev.set(nk, k);
        queue.push(nk);
      }
    }
  }
  if (!found) return undefined;
  const path = [];
  for (let k = found; k !== undefined; k = prev.get(k)) {
    const [x, y, z] = parse(k);
    path.push({ x, y, z });
  }
  return path.reverse();
}

/** Feet positions to walk for a walk over cells (each cell's middle, standing on its floor). */
export function cellFeet(path) {
  return path.map((c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 }));
}

/**
 * Why a work site doesn't work, or undefined when it does. o: { dimension, inPark, seed (open ground by the anchor),
 * flood: { unloaded, enclosed, escape, openGates, error }, cells (floor blocks), gate, chest, kind (its worker's work
 * kind), worker, home ("ok", "broken", "inPark"), way (the path from home: true, false, undefined: not known yet) }.
 */
export function siteProblem(o, g) {
  if (o.dimension && o.dimension !== "minecraft:overworld") return "dimension";
  if (o.inPark) return "park";
  if (!o.seed) return "seed";
  if (o.flood?.unloaded) return "unloaded";
  if (o.flood?.openGates?.length) return "gateOpen";
  if (o.flood && !o.flood.enclosed) return "open";
  if ((o.cells ?? 0) < g.minCells) return "small";
  if (!o.gate) return "noGate";
  if (o.kind && WORK_KINDS[o.kind]?.needsChest && !o.chest) return "noChest";
  if (!o.worker) return "noWorker";
  if (o.home === "inPark") return "homeInPark";
  if (o.home !== "ok") return "workerHome";
  if (o.way === false) return "noPath";
  if (o.way === undefined) return "unchecked";
  return undefined;
}

/** What a site's problem means, for the Work Anchor's page. o: { at (a spot to name: { x, y, z }), who (the worker's name), minCells }. */
export function siteText(problem, o = {}) {
  const at = o.at ? ` at ${o.at.x} ${o.at.y} ${o.at.z}` : "";
  const whose = o.who ? `${o.who}'s` : "Their";
  switch (problem) {
    case "dimension":
      return "Work sites are in the Overworld only.";
    case "park":
      return "This is inside a zoo's fence. Jobs are outside the zoo: build the work site outside the park.";
    case "seed":
      return "The Work Anchor needs open floor beside it, inside the work site.";
    case "unloaded":
      return "Part of the work site isn't loaded. Stand closer and use the Work Anchor again.";
    case "gateOpen":
      return `A gate or door in the fence is open${at}. Close it.`;
    case "open":
      return `It isn't fenced in all round: there's a way out${at}. Close it with fences, walls or blocks two high.`;
    case "small":
      return `It needs at least ${o.minCells ?? 9} blocks of floor inside.`;
    case "noGate":
      return "It needs a fence gate in its fence, for the worker to come in by.";
    case "noChest":
      return "It needs a chest or barrel beside the Work Anchor, for what the worker brings in.";
    case "noWorker":
      return "Nobody works here yet. Choose a worker.";
    case "homeInPark":
      return `${whose} home is inside a zoo's fence, and paths inside the fence don't lead out to work. A worker needs a home outside the zoo.`;
    case "workerHome":
      return `${whose} home needs fixing first (use its Resident Mailbox).`;
    case "noPath":
      return `There's no path from ${o.who ? `${o.who}'s` : "their"} front door to the gate. Lay path blocks from the door up to the gate.`;
    case "unchecked":
      return "Checking the path from home to the gate...";
    default:
      return "Ready for work.";
  }
}

/**
 * Whether a chest's slots (each { typeId, amount, max } or undefined for an empty one) have room for `count` of an item
 * (max: how many stack in one slot).
 */
export function roomFor(slots, typeId, count, max = 64) {
  let left = count;
  for (const s of slots) {
    if (!s) left -= max;
    else if (s.typeId === typeId) left -= Math.max(0, (s.max ?? max) - s.amount);
    if (left <= 0) return true;
  }
  return left <= 0;
}
