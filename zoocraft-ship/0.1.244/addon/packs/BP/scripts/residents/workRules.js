// Work (0.1.224, stage D of Austin's residents spec: research/npc_spec_plan.md section 8; the woodlot and the field
// 0.1.225), pure. A resident with a job
// works it in a work site the player builds: ground fenced in all round (fences, walls or solid blocks), a fence gate in
// its edge, a Work Anchor on its floor, a chest or barrel beside the anchor for what they bring in, and a path from their
// front door to the gate. They walk to work for their shift (balance.js residents.work), work it, and walk home after.
// The miner (Dave: a mine) works only the ores within reach of the site's own floor, and leaves the rock they sat in
// where they were, so a mine keeps its shape: nothing is dug through and nothing else is ever broken or placed. Good
// shifts make them more skilled (Apprentice, Skilled, Expert): quicker, and able to work rarer ores. Work brings no zoo
// money (the spec): what they mine goes into the work chest.
// 0.1.225: the tree chopper (Paola: a woodlot) cuts only trees that grew (their leaves grew with them: a player's
// placed leaves are kept), whole, inside the site, and replants the stump from saplings in the chest; the farmer (Ron:
// a field) harvests only ripe crops and replants them, as a farmer would. Skilled, they plant and sow from the chest too.

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

/**
 * The work each job does (data/residents.js `work`): the miner's (0.1.224), the tree chopper's and the farmer's
 * (0.1.225). words: what each skill adds, for the Work Anchor and the worker's page; skillUp: what the next two skills
 * bring, when they reach them; stop: why a shift ended early, where it isn't the same for every kind.
 */
export const WORK_KINDS = {
  mine: {
    site: "mine",
    worker: "miner",
    verb: "mining",
    things: "ores",
    needsChest: true,
    words: ["coal, copper and iron", "gold, redstone, lapis, Nether quartz and Nether gold", "diamonds, emeralds and ancient debris"],
    skillUp: ["Quicker at it, and gold, redstone, lapis and Nether ores now too.", "Quicker still, and diamonds, emeralds and ancient debris now too."],
    stop: { none: "nothing left in reach to mine: put ores in the walls, or wait for mined ones to grow back", skill: "nothing left in reach they're skilled enough to mine yet" },
  },
  woodlot: {
    site: "woodlot",
    worker: "tree chopper",
    verb: "cutting trees",
    things: "trees",
    needsChest: true,
    words: ["grown trees with one trunk (oak, birch, spruce, jungle, acacia and cherry), each stump replanted from the chest", "planting the chest's saplings on bare ground, and picking up the saplings, sticks and apples that fall", "big trees with four trunks (dark oak, and giant spruce and jungle)"],
    skillUp: ["Quicker at it, and planting saplings on bare ground and picking up what falls now too.", "Quicker still, and big four-trunk trees now too."],
    stop: { none: "no grown tree to cut and nothing to plant: plant saplings, or leave some in the chest, and give them time to grow", skill: "the trees left are too big for their skill (four-trunk trees need an Expert)" },
  },
  field: {
    site: "field",
    worker: "farmer",
    verb: "farming",
    things: "crops",
    needsChest: true,
    words: ["ripe wheat, carrots, potatoes and beetroot, each replanted", "sowing bare farmland from the chest's seeds", "a bigger harvest: one more of each crop"],
    skillUp: ["Quicker at it, and sowing bare farmland from the chest now too.", "Quicker still, and a bigger harvest."],
    stop: { none: "nothing ripe and nothing to sow: crops take a while to grow, and seeds in the chest let a Skilled farmer sow", skill: "nothing left they're skilled enough to do yet" },
  },
  // 0.1.244 (Austin's NPC Expansion spec: Terra's "environmental research area"): studies at the site's composters,
  // and the chest's plant waste turned into bone meal. No block is ever changed.
  research: {
    site: "research site",
    worker: "environmental researcher",
    verb: "researching",
    things: "studies",
    needsChest: true,
    words: ["studies at the site's composters, and plant waste from the chest (seeds, saplings, leaves, flowers and the like) turned into bone meal", "quicker studies", "twice the bone meal from the same waste"],
    skillUp: ["Quicker at it now.", "Quicker still, and twice the bone meal from the same waste."],
    stop: { none: "no composter in reach of the floor: put a composter inside the site for the research", skill: "nothing left they're skilled enough to do yet" },
  },
};

/** The balance for a kind of work: residents.work, with its own (residents.work.woodlot, .field) over it. */
export function kindBalance(kind, g) {
  return kind && g?.[kind] && typeof g[kind] === "object" ? { ...g, ...g[kind] } : g;
}

/** Real seconds a worker of this skill takes over a task: g is kindBalance's; act the task's ("mine", "cut", ...). */
export function taskSeconds(act, skill, g) {
  const s = Math.max(0, Math.min(2, skill ?? 0));
  if (act === "plant") return g.plantSeconds ?? 3;
  if (act === "gather") return g.gatherSeconds ?? 1;
  if (act === "sow") return g.sowSeconds ?? 2;
  const list = act === "cut" || act === "harvest" ? g.workSeconds ?? g.mineSeconds : g.mineSeconds;
  return list[Math.min(list.length - 1, s)];
}

/** How much of the shift's work a task done counts: gathering what fell counts nothing (it's tidying). */
export const TASK_UNITS = { mine: 1, cut: 1, plant: 1, gather: 0, harvest: 1, sow: 1, research: 1, compost: 1 };

/** Whether a worker of this skill does a task (a kind's tasks; skill 0 Apprentice, 1 Skilled, 2 Expert). */
export function canDo(task, skill) {
  switch (task?.act ?? "mine") {
    case "mine":
      return canMine(task.typeId, skill);
    case "cut":
      return !task.big || skill >= 2;
    case "plant":
    case "gather":
    case "sow":
      return skill >= 1;
    case "harvest":
    case "research":
      return true;
    default:
      return false;
  }
}

/** A shift's work in words: "3 ores", "2 trees cut, 1 sapling planted", "12 crops harvested, 4 sown". */
export function jobWords(kind, job) {
  const c = job?.counts ?? {};
  const n = (k) => c[k] ?? 0;
  const pl = (x, one, many = `${one}s`) => `${x} ${x === 1 ? one : many}`;
  if (kind === "woodlot") {
    const parts = n("cut") || !(n("plant") || n("gather")) ? [`${pl(n("cut"), "tree")} cut`] : [];
    if (n("plant")) parts.push(`${pl(n("plant"), "sapling")} planted`);
    if (n("gather")) parts.push(`${pl(n("gather"), "thing")} picked up`);
    return parts.join(", ");
  }
  if (kind === "field") {
    if (!n("harvest") && n("sow")) return `${pl(n("sow"), "crop")} sown`;
    const parts = [`${pl(n("harvest"), "crop")} harvested`];
    if (n("sow")) parts.push(`${n("sow")} sown`);
    return parts.join(", ");
  }
  if (kind === "research") {
    const all = n("research") + n("compost");
    return `${pl(all, "study", "studies")}${n("compost") ? `, ${n("compost")} making bone meal` : ""}`;
  }
  return pl(job?.done ?? 0, "ore");
}

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

/** Whether a chest's slots have room for all of these ({ typeId, count } each), put in one after another. */
export function roomForAll(slots, items, max = 64) {
  const s = slots.map((x) => (x ? { ...x } : undefined));
  for (const it of items) {
    let left = it.count;
    for (let i = 0; i < s.length && left > 0; i++) {
      const x = s[i];
      if (!x) {
        const n = Math.min(left, max);
        s[i] = { typeId: it.typeId, amount: n, max };
        left -= n;
      } else if (x.typeId === it.typeId) {
        const n = Math.min(left, Math.max(0, (x.max ?? max) - x.amount));
        x.amount += n;
        left -= n;
      }
    }
    if (left > 0) return false;
  }
  return true;
}

/** How many of an item the slots hold. */
export function countIn(slots, typeId) {
  let n = 0;
  for (const s of slots) if (s?.typeId === typeId) n += s.amount;
  return n;
}

// --- the woodlot (0.1.225): the tree chopper's work ---

/**
 * The trees a tree chopper cuts, by their log (vanilla only): the sapling that grows them, and whether they grow with
 * one trunk (small) or four (big). Mangrove (its roots) and pale oak (a creaking heart can sit in its trunk) aren't cut.
 */
const tree = (sapling, small, big) => ({ sapling, small, big });
export const TREES = {
  "minecraft:oak_log": tree("minecraft:oak_sapling", true, false),
  "minecraft:birch_log": tree("minecraft:birch_sapling", true, false),
  "minecraft:spruce_log": tree("minecraft:spruce_sapling", true, true),
  "minecraft:jungle_log": tree("minecraft:jungle_sapling", true, true),
  "minecraft:acacia_log": tree("minecraft:acacia_sapling", true, false),
  "minecraft:cherry_log": tree("minecraft:cherry_sapling", true, false),
  "minecraft:dark_oak_log": tree("minecraft:dark_oak_sapling", false, true),
};

/** Each sapling's log. */
export const SAPLING_LOG = Object.fromEntries(Object.entries(TREES).map(([log, t]) => [t.sapling, log]));

/** Saplings that grow into a tree on their own (a dark oak needs four in a square). */
export const ALONE = new Set(Object.values(TREES).filter((t) => t.small).map((t) => t.sapling));

/** What a tree's trunk stands in, and what a sapling is planted in. */
export const SOILS = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:rooted_dirt", "minecraft:moss_block", "minecraft:mud", "minecraft:mycelium"]);
export const PLANT_SOILS = new Set(["minecraft:grass_block", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:rooted_dirt", "minecraft:moss_block"]);

/** What a Skilled tree chopper picks up off the woodlot's floor: what falls from the trees. */
export const GATHER = new Set([...Object.keys(SAPLING_LOG), "minecraft:stick", "minecraft:apple"]);

const inBox = (p, box) => !box || (p.x >= box.min.x && p.x <= box.max.x && p.z >= box.min.z && p.z <= box.max.z);

/**
 * A tree to cut, read from its trunk's foot `base` (a spot a sapling grew from: the woodlot keeps where it saw them).
 * typeAt(x, y, z): a block's id; leafAt(x, y, z): "natural" (leaves that grew), "placed" (a player's) or undefined;
 * box: the site's floor area ({ min, max }; every log must be over it). g: the woodlot's balance (lowLogs, branchReach,
 * maxLogs, maxBigLogs, minLeaves). Returns { ok: true, type, big, foot (its trunk's foot blocks, lowest corner first),
 * logs (every log of it, highest first), sapling } or { ok: false, why }: "notTree" (no grown tree's trunk here),
 * "touching" (a log beside its trunk low down, or reaching too far: it may be part of a build), "edge" (a log over or
 * past the site's edge), "tooBig", "leaves" (too few leaves that grew with it: logs someone placed).
 */
export function treeAt(base, typeAt, leafAt, box, g) {
  const type = typeAt(base.x, base.y, base.z);
  const kind = TREES[type];
  if (!kind || !SOILS.has(typeAt(base.x, base.y - 1, base.z) ?? "")) return { ok: false, why: "notTree" };
  let foot = [base];
  for (const [ox, oz] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
    const sq = [[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b]) => ({ x: base.x + ox + a, y: base.y, z: base.z + oz + b }));
    if (sq.every((p) => typeAt(p.x, p.y, p.z) === type && SOILS.has(typeAt(p.x, p.y - 1, p.z) ?? ""))) {
      foot = sq;
      break;
    }
  }
  const big = foot.length === 4;
  if (big ? !kind.big : !kind.small) return { ok: false, why: "notTree" };
  const cols = new Set(foot.map((p) => `${p.x},${p.z}`));
  const max = big ? g.maxBigLogs : g.maxLogs;
  const seen = new Set();
  const logs = [];
  const queue = foot.map((p) => ({ ...p }));
  let leaves = 0;
  while (queue.length) {
    const p = queue.pop();
    const k = k3(p.x, p.y, p.z);
    if (seen.has(k)) continue;
    seen.add(k);
    if (p.y < base.y || typeAt(p.x, p.y, p.z) !== type) continue;
    if (p.y < base.y + g.lowLogs && !cols.has(`${p.x},${p.z}`)) return { ok: false, why: "touching" };
    if (foot.every((f) => Math.max(Math.abs(p.x - f.x), Math.abs(p.z - f.z)) > g.branchReach)) return { ok: false, why: "touching" };
    if (!inBox(p, box)) return { ok: false, why: "edge" };
    logs.push(p);
    if (logs.length > max) return { ok: false, why: "tooBig" };
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) if (leafAt(p.x + dx, p.y + dy, p.z + dz) === "natural") leaves++;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) if (dx || dy || dz) queue.push({ x: p.x + dx, y: p.y + dy, z: p.z + dz });
  }
  if (leaves < g.minLeaves) return { ok: false, why: "leaves" };
  logs.sort((a, b) => b.y - a.y);
  return { ok: true, type, big, foot, logs, sapling: kind.sapling };
}

/**
 * What replants a cut tree's stump, from the chest's slots: four of its own sapling for a four-trunk tree when the chest
 * has them, else one of its own when it grows alone, else one of any sapling that grows alone. { item, n } or undefined.
 */
export function pickSapling(slots, want, big) {
  if (big && countIn(slots, want) >= 4) return { item: want, n: 4 };
  if (ALONE.has(want) && countIn(slots, want) >= 1) return { item: want, n: 1 };
  for (const s of slots) if (s && ALONE.has(s.typeId) && s.amount > 0) return { item: s.typeId, n: 1 };
  return undefined;
}

/**
 * Bare ground a Skilled tree chopper plants a sapling in: a floor block of the woodlot with soil under it, floor all
 * round it (not against the fence), and no trunk or sapling within g.spacing of it (nor of another spot picked);
 * `avoid`: [{ pos, r }] kept clear (the gate's way in, the anchor, the chest). At most `max`. [{ pos, stand }].
 */
export function plantSpots(cells, typeAt, avoid, g, max = 16) {
  const out = [];
  const sp = g.spacing;
  for (const key of cells) {
    if (out.length >= max) break;
    const [x, y, z] = parse(key);
    if (!PLANT_SOILS.has(typeAt(x, y - 1, z) ?? "") || typeAt(x, y, z) !== "minecraft:air") continue;
    let ok = true;
    for (let dx = -1; dx <= 1 && ok; dx++) for (let dz = -1; dz <= 1 && ok; dz++) if (!cells.has(k3(x + dx, y, z + dz))) ok = false;
    for (let dx = -sp; dx <= sp && ok; dx++) for (let dz = -sp; dz <= sp && ok; dz++) if (/_log$|_sapling$/.test(typeAt(x + dx, y, z + dz) ?? "")) ok = false;
    if (!ok) continue;
    if (avoid.some((a) => Math.max(Math.abs(a.pos.x - x), Math.abs(a.pos.z - z)) <= a.r && Math.abs(a.pos.y - y) <= 2)) continue;
    if (out.some((o) => Math.max(Math.abs(o.pos.x - x), Math.abs(o.pos.z - z)) <= sp)) continue;
    const stand = SIDES.map(([dx, dz]) => ({ x: x + dx, y, z: z + dz })).find((p) => cells.has(k3(p.x, p.y, p.z)));
    if (stand) out.push({ pos: { x, y, z }, stand });
  }
  return out;
}

// --- the field (0.1.225): the farmer's work ---

/**
 * The crops a farmer harvests (vanilla, on farmland): ripe at `ripe` growth, what one gives once it's replanted (one of
 * its own seeds kept back: [item, min, max]) and the seed that sows it.
 */
export const CROPS = {
  "minecraft:wheat": { ripe: 7, seed: "minecraft:wheat_seeds", items: [["minecraft:wheat", 1, 1], ["minecraft:wheat_seeds", 0, 2]] },
  "minecraft:carrots": { ripe: 7, seed: "minecraft:carrot", items: [["minecraft:carrot", 1, 4]] },
  "minecraft:potatoes": { ripe: 7, seed: "minecraft:potato", items: [["minecraft:potato", 1, 4]], rare: ["minecraft:poisonous_potato", 0.02] },
  "minecraft:beetroot": { ripe: 7, seed: "minecraft:beetroot_seeds", items: [["minecraft:beetroot", 1, 1], ["minecraft:beetroot_seeds", 0, 2]] },
};

/** Each seed's crop. */
export const SEED_CROP = Object.fromEntries(Object.entries(CROPS).map(([crop, c]) => [c.seed, crop]));

/** Whether a block is a ripe crop (its growth state read). */
export function isRipe(typeId, growth) {
  const c = CROPS[typeId];
  return Boolean(c) && typeof growth === "number" && growth >= c.ripe;
}

/** What harvesting a ripe crop gives (replanted: one seed kept back); an Expert gets `bonus` more of its first item. */
export function harvestDrops(typeId, bonus = 0, random = Math.random) {
  const c = CROPS[typeId];
  if (!c) return [];
  const out = [];
  c.items.forEach(([item, min, max], i) => {
    const count = min + Math.floor(random() * (max - min + 1)) + (i === 0 ? bonus : 0);
    if (count > 0) out.push({ typeId: item, count });
  });
  if (c.rare && random() < c.rare[1]) out.push({ typeId: c.rare[0], count: 1 });
  return out;
}

/** The first seed the chest holds, and the crop it sows: { item, crop } or undefined. */
export function seedIn(slots) {
  for (const s of slots) if (s && SEED_CROP[s.typeId] && s.amount > 0) return { item: s.typeId, crop: SEED_CROP[s.typeId] };
  return undefined;
}

/**
 * The field's work, from its floor: ripe crops (harvested from beside them) and, where `sow`, bare farmland (sown).
 * typeAt; growthAt(x, y, z): a crop's growth; `all`: the whole floor, when `cells` is a slice of it. Returns { tasks:
 * [{ act, pos, stand, typeId }], growing }.
 */
export function fieldTasks(cells, typeAt, growthAt, sow, max = 256, all = cells) {
  const tasks = [];
  let growing = 0;
  for (const key of cells) {
    if (tasks.length >= max) break;
    const [x, y, z] = parse(key);
    const t = typeAt(x, y, z);
    const stand = SIDES.map(([dx, dz]) => ({ x: x + dx, y, z: z + dz })).find((p) => all.has(k3(p.x, p.y, p.z))) ?? { x, y, z };
    if (CROPS[t]) {
      if (isRipe(t, growthAt(x, y, z))) tasks.push({ act: "harvest", pos: { x, y, z }, stand, typeId: t });
      else growing++;
    } else if (sow && t === "minecraft:air" && typeAt(x, y - 1, z) === "minecraft:farmland") tasks.push({ act: "sow", pos: { x, y, z }, stand });
  }
  return { tasks, growing };
}

/**
 * Whether a tree chopper standing at `stand` reaches a trunk's foot block `pos`: within `reach` blocks across and one
 * up or down (a spruce's or an oak's low leaves can fill the ground beside its trunk, so they swing from further off).
 */
export function reachesTree(stand, pos, reach) {
  return Math.abs(stand.y - pos.y) <= 1 && Math.max(Math.abs(stand.x - pos.x), Math.abs(stand.z - pos.z)) <= reach;
}

/** Whether a worker standing at `stand` reaches a field task's or a planting spot's block (beside them, or under their feet). */
export function reachesBeside(stand, pos) {
  if (stand.y !== pos.y) return false;
  const d = Math.abs(stand.x - pos.x) + Math.abs(stand.z - pos.z);
  return d <= 1;
}

// --- the research site (0.1.244): the environmental researcher's work ---

/** A research station: the block a researcher studies at. */
export const isStation = (typeId) => typeId === "minecraft:composter";

const WASTE = new Set(
  [
    "wheat_seeds", "beetroot_seeds", "melon_seeds", "pumpkin_seeds", "torchflower_seeds", "pitcher_pod", "short_grass", "tall_grass", "fern", "large_fern",
    "vine", "kelp", "seagrass", "cactus", "sugar_cane", "bamboo", "wheat", "carrot", "potato", "beetroot", "apple", "melon_slice", "pumpkin", "sweet_berries",
    "glow_berries", "moss_block", "moss_carpet", "hanging_roots", "nether_wart", "cocoa_beans", "dried_kelp", "lily_pad", "dandelion", "poppy", "blue_orchid", "allium",
    "azure_bluet", "red_tulip", "orange_tulip", "white_tulip", "pink_tulip", "oxeye_daisy", "cornflower", "lily_of_the_valley", "sunflower", "lilac", "rose_bush",
    "peony", "torchflower", "pitcher_plant", "pink_petals", "spore_blossom", "brown_mushroom", "red_mushroom", "poisonous_potato",
  ]
    .map((i) => `minecraft:${i}`),
);
/** Plant waste a researcher composts: seeds, saplings, leaves, flowers, crops and the like. Never an animal product. */
export function isPlantWaste(typeId) {
  return WASTE.has(typeId) || /^minecraft:[a-z_]+_(sapling|leaves|propagule)$/.test(typeId ?? "") || typeId === "minecraft:azalea" || typeId === "minecraft:flowering_azalea";
}

/** How much plant waste a chest's slots hold. */
export function wasteIn(slots) {
  let n = 0;
  for (const s of slots) if (s && isPlantWaste(s.typeId)) n += s.amount;
  return n;
}

/** `cost` of plant waste to take from a chest's slots, from its first such stacks: [{ typeId, n }], or undefined. */
export function wastePick(slots, cost) {
  const out = [];
  let left = cost;
  for (const s of slots) {
    if (left <= 0) break;
    if (!s || !isPlantWaste(s.typeId)) continue;
    const k = Math.min(left, s.amount);
    const have = out.find((x) => x.typeId === s.typeId);
    if (have) have.n += k;
    else out.push({ typeId: s.typeId, n: k });
    left -= k;
  }
  return left <= 0 && cost > 0 ? out : undefined;
}

/** The bone meal a batch of waste makes at this skill (g.meal, Apprentice to Expert). */
export function mealFor(skill, g) {
  const list = g.meal ?? [1];
  return list[Math.max(0, Math.min(list.length - 1, skill ?? 0))];
}
