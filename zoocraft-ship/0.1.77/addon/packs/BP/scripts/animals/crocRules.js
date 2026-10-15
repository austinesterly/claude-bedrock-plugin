// Crocodiles (0.1.77, Big predators), pure: what a crocodile is doing, its length and rank, its day (basking,
// in the shade, half out at the waterline, floating, resting on the bottom, swimming, a male's display), what
// its exhibit has to have (a sunny basking bank in size order, deep water for all to go under at once, the
// shore kept clear, sand to nest in), its meals about once a week, the sand nest whose warmth sets the
// hatchlings' sex, a wild one's ambush from the water, and what to tell players. Spec 5.2: "crocodile |
// Crocodile | Basking and submerged resting | Secure keeper access, shore clearance". The game side is
// animals/croc.js; the dens, the service gates and the danger to players are animals/predatorRules.js and
// animals/predators.js (every `dangerous` species). Facts and sources: research/predators_facts.md and
// research/predators_plan.md ("Crocodile (0.1.77)").

// The crocodile mobs, found by type (0.1.70: never by family alone).
export const CROC_TYPES = ["zoocraft:crocodile", "zoocraft:wild_crocodile"];

// What a crocodile is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/croc_anim.py) and the Field Journal watches for it. The lion's and tiger's numbers where it does the
// same thing (animals/predators.js asks every dangerous species the same way: 1 alert, 2 the warning, 3 the
// swipe, which for a crocodile is the sideways snap of the jaws).
export const ACT = {
  none: 0,
  alert: 1,
  warn: 2, // the threat gape: reared up on its legs, puffed up, the jaws wide, hissing
  snap: 3,
  display: 4, // a grown male's, in the water at dawn and dusk: head up, tail arched, the jaw slap, a bellow
  lie: 5,
  bask: 6, // lying with the jaws gaping
  halfout: 7, // lying at the waterline, the back end in the water
  float: 8, // at the surface, only the eyes, nostrils and a line of scutes out
  under: 9, // resting on the bottom
  swim: 10,
  walk: 11, // the high walk where the script takes it
  belly: 12, // the belly run (the charge on land)
  slide: 13, // the belly slide down the bank into the water
  lunge: 14, // out of the water at a player
  drag: 15, // walking backward, gripping
  roll: 16, // the death roll
  swallow: 17, // the head toss
  snoutLift: 18, // submission to a bigger one
  dig: 19, // digging the nest with the hind feet
  guard: 20, // lying by the nest, head up
  carry: 21, // a hatchling in its jaws, walking
  chirp: 22, // a hatchling calling
  sink: 23, // sinking backward, tail first (diving)
  feed: 24, // snapping the meat off a feeder
  gallop: 25, // a hatchling's gallop
  sleep: 26,
  rub: 27, // courtship: rubbing jaws with its mate in the water
  carried: 28, // a hatchling being carried (limp)
  rise: 29, // surfacing nose first
  swimFast: 30, // a chase in the water
  doze: 31, // dozing afloat at night
};
// Lying down (the client lies down, holds it, and gets up when the act changes).
export const DOWN_ACTS = [ACT.lie, ACT.bask, ACT.halfout, ACT.slide, ACT.dig, ACT.guard, ACT.sleep, ACT.under];
// In the water (the client's water posture: no lying down or getting up in between).
export const WATER_ACTS = [ACT.display, ACT.float, ACT.swim, ACT.roll, ACT.swallow, ACT.snoutLift, ACT.sink, ACT.rub, ACT.rise, ACT.swimFast, ACT.doze];
// The client's lying down (1.0 s) and getting up (1.2 s), rearing into the threat (0.3 s) and dropping out of
// it (0.35 s), the snap (0.6 s) and the lunge (0.7 s), in ticks (gen/croc_poses.py, gen/croc_anim.py).
export const TICKS = { down: 20, up: 24, rear: 6, drop: 7, snap: 12, lunge: 14, sink: 40, rise: 30 };

// ---------------- size ----------------
// A crocodile's scale (the client's: gen/croc_anim.py SIZE_Q): a female of the middle size class 0.5 (3.05 m),
// a male 0.655 of the same class (4.0 m), each class (`size` 0 to 4) 4% apart; a young one by its growth stage
// (`grow` 0 to 4), 0.05 at hatching (0.3 m) to 0.25 (1.5 m).
export function scaleOf(c) {
  if (c.juvenile) return 0.05 * (1 + (c.grow ?? 0));
  return (c.male ? 0.655 : 0.5) * (1 + 0.04 * ((c.size ?? 2) - 2));
}
// Its length in metres (a female of scale 0.5 is 3.05 m long).
export function lengthOf(c) {
  return Math.round(((3.05 * scaleOf(c)) / 0.5) * 10) / 10;
}
// The record (or a wild one's look) as scaleOf takes it. A young one's growth stage is from the park days it has
// left to grow up (matureDays: its species' breeding.matureDays; without it, a hatchling's).
export function bodyOf(a, matureDays = undefined) {
  const grow = a.grow ?? (a.juvenile && matureDays ? growStage(a.juvenileDaysLeft ?? matureDays, matureDays) : 0);
  return { juvenile: Boolean(a.juvenile), male: a.sex === "male", size: a.size ?? 2, grow };
}
// A young one's growth stage (0 to 4) from the park days it has left to grow up: hatching at 0, nearly
// grown at 4.
export function growStage(daysLeft, matureDays) {
  const done = 1 - Math.max(0, Math.min(1, daysLeft / Math.max(1, matureDays)));
  return Math.max(0, Math.min(4, Math.floor(done * 5 + 1e-9))); // 1e-9: 1 - 8/10 is a hair under 0.2
}

// How fast the script moves a crocodile, in blocks a tick, at its size: the client's strides (gen/croc_anim.py:
// the high walk 0.44 blocks a stride at 0.9 strides a second, the belly run 0.81 at 4.3, a hatchling's gallop
// 0.88 at 4, each scaled by its size, the strides slower for a bigger one: variable.leg_rate) so the feet keep
// time with the ground. Swimming is the tail's, so any speed: 0.8 blocks a second cruising, 5 in a chase (you
// can't outswim one). The lunge 8 blocks a second; dragging a catch 2.
export function paceOf(kind, scale) {
  const k = Math.sqrt(scale / 0.5);
  switch (kind) {
    case "walk":
      return (0.398 * k) / 20;
    case "belly":
      return (3.49 * k) / 20;
    case "gallop":
      return (((28 * scale) / 16) * 4 * Math.sqrt(0.5 / scale)) / 20;
    case "swim":
      return 0.8 / 20;
    case "swimFast":
      return 5 / 20;
    case "lunge":
      return 8 / 20;
    case "drag":
      return 2 / 20;
    default:
      return (0.398 * k) / 20;
  }
}

// Floating at the surface: where it stands (its origin) so its eyes are just out of the water. cellY: the top
// water block's y (the surface is 0.89 up it); the eyes are 12.4 model units over its origin in the float pose
// (gen/croc_poses.py FLOAT_LINE), 16 units a block at scale 1.
export function floatY(cellY, scale) {
  return cellY + 0.89 + 0.03 - (12.4 * scale) / 16;
}

// ---------------- who's who and rank ----------------
// Biggest first: the order they feed in and take the basking bank (large, old males top the hierarchy). A tie
// goes to the one with the earlier id, so the order holds still.
export function sizeOrder(crocs) {
  return [...crocs].sort((a, b) => lengthOf(bodyOf(b)) - lengthOf(bodyOf(a)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// Meeting another: the smaller one lifts its snout (submission) and moves off; two grown males of about one
// size face up (head lifted, hissing) and the smaller backs away. Returns { yields: id of the one giving way,
// show: "snout" | "face" }, or undefined (young ones don't bother).
export function meet(a, b) {
  if (a.juvenile || b.juvenile) return undefined;
  const la = lengthOf(bodyOf(a));
  const lb = lengthOf(bodyOf(b));
  const small = la < lb || (la === lb && a.id > b.id) ? a : b;
  const males = a.sex === "male" && b.sex === "male";
  return { yields: small.id, show: males && Math.abs(la - lb) <= 0.4 ? "face" : "snout" };
}

// The clipboard's line: "Rank: Kubwa 4.2 m, Mara 3.1 m, ..." (grown ones; the young follow, "and 3 young").
export function rankLine(crocs) {
  const grown = sizeOrder(crocs.filter((a) => !a.juvenile));
  const young = crocs.length - grown.length;
  if (!grown.length) return young ? `Rank: ${young} young` : undefined;
  return `Rank: ${grown.map((a) => `${a.name} ${lengthOf(bodyOf(a)).toFixed(1)} m`).join(", ")}${young ? `, and ${young} young` : ""}`;
}

// ---------------- the day ----------------
/**
 * A crocodile's mood for a while: "bask" (on the sunny bank, the jaws gaping), "shade" (gaping in the shade at
 * the hottest time), "halfout" (lying at the waterline, the back end in the water), "float" (at the surface,
 * the eyes out), "submerge" (resting on the bottom of the deep water), "swim" (cruising along the shore) or
 * "display" (a grown male at dawn and dusk with a female about). Rain keeps them in the water (no basking or
 * lying out). No bank, no basking; no deep water, nothing in it; no shade, no shade.
 * @param {string} part dayPart() (animals/lionRules.js)
 * @param {{ bank?: boolean, deep?: boolean, shade?: boolean, display?: boolean, rain?: boolean }} has
 */
export function pickMood(part, has, T, random = Math.random) {
  const w = { ...T.moods[part] };
  if (!has.bank) w.bask = 0;
  if (!has.shade) w.shade = 0;
  if (!has.deep) {
    w.float = 0;
    w.submerge = 0;
    w.swim = 0;
    w.halfout = 0;
  }
  if (!has.display) w.display = 0;
  if (has.rain) {
    w.bask = 0;
    w.shade = 0;
    w.halfout = 0;
  }
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  if (total <= 0) return has.deep ? "float" : "bask";
  let r = random() * total;
  for (const [mood, v] of Object.entries(w)) {
    if ((r -= v) < 0) return mood;
  }
  return has.deep ? "float" : "bask";
}

// The basking bank in size order: the biggest takes the spot nearest the water. spots: [{ x, y, z, d }] (d: its
// distance from the water); returns Map id -> spot, a crocodile's own spot clear of the others' (a 3 to 4 m
// crocodile lies across 3 or 4 blocks: spots T.bankGap apart). The smallest go without when there aren't
// enough.
export function bankPlaces(crocs, spots, T) {
  const order = sizeOrder(crocs);
  const left = [...spots].sort((a, b) => a.d - b.d || a.x - b.x || a.z - b.z);
  const out = new Map();
  const taken = [];
  for (const c of order) {
    const at = left.find((s) => taken.every((t) => Math.hypot(t.x - s.x, t.z - s.z) >= T.bankGap));
    if (!at) break;
    taken.push(at);
    out.set(c.id, at);
  }
  return out;
}

// ---------------- what the exhibit needs ----------------
// Sunny bank blocks the crocodiles need: T.bankPerCroc for each grown one ("at least one land basking area per
// crocodile": SA DENR).
export function bankNeeded(crocs, T) {
  return crocs.filter((a) => !a.juvenile).length * T.bankPerCroc;
}
// Who goes without a basking spot when there are too few: the smallest grown ones (the biggest take the bank
// first). Returns a Set of ids.
export function shortOfBank(crocs, sunBank, T) {
  const grown = sizeOrder(crocs.filter((a) => !a.juvenile));
  const room = Math.floor((sunBank ?? Infinity) / T.bankPerCroc);
  return new Set(grown.slice(Math.max(0, room)).map((a) => a.id));
}
// Deep water spots so all can go under at once without touching (SA DENR; GB 2025 A3.40): T.deepPerCroc for
// each grown one and T.deepPerYoung for each young one.
export function deepNeeded(crocs, T) {
  const grown = crocs.filter((a) => !a.juvenile).length;
  return grown * T.deepPerCroc + (crocs.length - grown) * T.deepPerYoung;
}

// Is a bank block sunny (open to the sky: nothing but air or plants over it) and smooth (grass, sand, mud,
// concrete; not gravel, rock or logs)? cat(dy): the category dy blocks above the floor block (-1: the floor
// block itself; 0: its feet), from a croc reader.
export function openSky(cat, sky) {
  for (let dy = 0; dy <= sky; dy++) {
    const c = cat(dy);
    if (c === "unloaded") return true; // out of the loaded world: the sky
    if (c !== "air" && c !== "plant") return false;
  }
  return true;
}
export function sunnyBank(cat, sky) {
  return cat(-1) !== "rough" && openSky(cat, sky);
}

/**
 * The crocodile's ground (exhibits/exhibits.js measures it with the walk): the sunny basking bank (usable floor
 * within T.bankReach of the water, open to the sky, not rough ground: ex.sunBankCells; where the first 128 are,
 * nearest the water first, ex.sunBankSpots [x, y, z, d]), the shore ring (floor right beside the water:
 * ex.shoreCells) and how much of it is cluttered (plants at foot or head height, or a zoocraft fixture right at
 * the edge: ex.shoreBlocked; the first 8, ex.shoreSpots), and the sand nest sites (sand or red sand floor
 * T.nestNear to T.nestFar blocks from the water: ex.sandSites; the first 64, ex.sandSpots [x, y, z, red]), and
 * shaded floor near the water to lie in at the hottest time (ex.shadeSpots [x, y, z, d], the first 64).
 * read: a croc reader (categories "air", "plant", "fixture", "sand", "red_sand", "rough", "water", "solid",
 * ...); cells: the walk's cells (key "x,y,z" -> "land" | "water").
 * @param {(x: number, y: number, z: number) => string} read
 * @param {Map<string, string>} cells
 * @param {{ bankReach: number, sky: number, nestNear: number, nestFar: number, cellsPerYield: number }} opts
 */
export function* measureCroc(read, cells, opts, out) {
  const water = [];
  for (const [k, v] of cells) if (v === "water") water.push(k.split(",").map(Number));
  // Distance (across the ground) from each land cell to the nearest water: a flood out from the water's
  // columns, 4 ways, up to nestFar blocks.
  const cols = new Map(); // "x,z" -> distance
  let front = [];
  for (const [x, , z] of water) {
    const k = `${x},${z}`;
    if (!cols.has(k)) {
      cols.set(k, 0);
      front.push([x, z]);
    }
  }
  const far = Math.max(opts.bankReach, opts.nestFar);
  for (let d = 1; d <= far && front.length; d++) {
    const next = [];
    for (const [x, z] of front) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = `${x + dx},${z + dz}`;
        if (cols.has(k)) continue;
        cols.set(k, d);
        next.push([x + dx, z + dz]);
      }
    }
    front = next;
  }
  const r = { sunBankCells: 0, sunBankSpots: [], shoreCells: 0, shoreBlocked: 0, shoreSpots: [], shadeSpots: [], sandSites: 0, sandSpots: [] };
  let work = 0;
  for (const [k, v] of cells) {
    if (v !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    const d = cols.get(`${x},${z}`);
    if (d === undefined) continue;
    const beside = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => cells.get(`${x + dx},${y},${z + dz}`) === "water" || cells.get(`${x + dx},${y - 1},${z + dz}`) === "water");
    if (beside) {
      r.shoreCells++;
      if (read(x, y, z) === "plant" || read(x, y + 1, z) === "plant") {
        r.shoreBlocked++;
        if (r.shoreSpots.length < 8) r.shoreSpots.push([x, y, z]);
      }
    }
    const cat = (dy) => read(x, y + dy, z);
    if (d >= 1 && d <= opts.bankReach && sunnyBank(cat, opts.sky)) {
      r.sunBankCells++;
      r.sunBankSpots.push([x, y, z, d]);
    } else if (d >= 1 && d <= opts.bankReach + 3 && r.shadeSpots.length < 64 && !openSky(cat, opts.sky)) r.shadeSpots.push([x, y, z, d]); // shade near the water, to gape in at midday
    if (d >= opts.nestNear && d <= opts.nestFar) {
      const floor = read(x, y - 1, z);
      if (floor === "sand" || floor === "red_sand") {
        r.sandSites++;
        if (r.sandSpots.length < 64) r.sandSpots.push([x, y, z, floor === "red_sand" ? 1 : 0]);
      }
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  // A zoocraft fixture (a feeder, a trough, a toy...) standing right at the edge: the block beside the water,
  // level with it or a block up, where the shore ring would be.
  const seen = new Set();
  for (const [x, y, z] of water) {
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      for (const dy of [0, 1]) {
        const k = `${x + dx},${y + dy},${z + dz}`;
        if (seen.has(k) || cells.has(k)) continue;
        seen.add(k);
        if (read(x + dx, y + dy, z + dz) === "fixture") {
          r.shoreBlocked++;
          if (r.shoreSpots.length < 8) r.shoreSpots.push([x + dx, y + dy, z + dz]);
        }
      }
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  r.sunBankSpots.sort((a, b) => a[3] - b[3]);
  r.sunBankSpots = r.sunBankSpots.slice(0, 128);
  Object.assign(out, r);
  return out;
}

// The inner Keeper Gate's distance from the nearest water (ex.gateToWater): across the ground, the nearest
// water cell to the gate block of the pair nearest the water. pairs: ex.service; water: [[x, y, z]].
export function gateToWater(pairs, water) {
  let best = Infinity;
  for (const p of pairs ?? []) {
    const g = p.innerPos;
    for (const [x, , z] of water) best = Math.min(best, Math.hypot(x + 0.5 - (g.x + 0.5), z + 0.5 - (g.z + 0.5)));
  }
  return best === Infinity ? undefined : Math.round(best * 10) / 10;
}

// Shore clearance (SA DENR: gates "well away from the water's edge", "areas near the water should be clear to
// enable visual contact", a 1 m apron clear round the pond): what stops keepers going in, or undefined. Not a
// comfort cap: the keepers' safety.
export function shoreBlock(ex, T) {
  if (ex.shoreBlocked) {
    const [x, y, z] = ex.shoreSpots?.[0] ?? [];
    return `Shore clearance: ${ex.shoreBlocked} ${ex.shoreBlocked === 1 ? "block" : "blocks"} of the water's edge ${ex.shoreBlocked === 1 ? "is" : "are"} cluttered${x !== undefined ? ` (first at ${x} ${y} ${z})` : ""}: keepers must see into the water. Clear grass, flowers, reeds and bushes from the floor right beside the water, and move anything standing at the edge`;
  }
  if (ex.gateToWater !== undefined && ex.gateToWater < T.gateToWater) return `Shore clearance: the inner Keeper Gate is ${ex.gateToWater} blocks from the water: keepers won't go in through a gate under ${T.gateToWater} blocks from it (a crocodile can be lying right there)`;
  return undefined;
}

// The clipboard's shore line.
export function shoreLine(ex, T) {
  const why = shoreBlock(ex, T);
  if (why) return why;
  const gate = ex.gateToWater !== undefined ? `, the Keeper Gate ${Math.round(ex.gateToWater)} blocks from the water` : "";
  return `Shore clearance: clear${gate}`;
}

// What the crocodiles need, for the clipboard's warnings: [{ severity, text }].
export function crocWarnings(ex, crocs, T) {
  const out = [];
  const need = bankNeeded(crocs, T);
  const have = ex.sunBankCells;
  if (need && have !== undefined && have < need) {
    const without = sizeOrder(crocs.filter((a) => shortOfBank(crocs, have, T).has(a.id))).map((a) => a.name);
    out.push({ severity: 2, text: `Crocodiles need a sunny bank to bask on: ${have} of ${need} sunny bank blocks (${T.bankPerCroc} for each grown crocodile, within ${T.bankReach} blocks of the water, open to the sky, on grass, sand, mud or smooth stone, not gravel, rock or logs). The biggest take the bank first${without.length ? `: ${without.join(", ")} ${without.length === 1 ? "goes" : "go"} without` : ""}` });
  }
  const deepNeed = deepNeeded(crocs, T);
  const deep = ex.deepWaterCells;
  if (deepNeed && deep !== undefined && deep < deepNeed) out.push({ severity: 2, text: `Crocodiles need deep water to go under all at once: ${deep} of ${deepNeed} spots 2 blocks deep (${T.deepPerCroc} for each grown crocodile, ${T.deepPerYoung} for each young one)` });
  // Shore clearance stops the keepers going in: animals/predators.js keeperStop warns of it with the dens.
  return out;
}

// ---------------- meals ----------------
// Grown crocodiles eat about once a week (Perth Zoo's 4.2 m crocodile: one Sunday feed): their satiety drains
// at a seventh of the usual rate (species.meals.every), and one eats only when it's down to meals.at, then
// until it's full. Young ones eat every day. `eating`: it started a meal and hasn't finished.
export function mealDrain(a, species) {
  return !a.juvenile && species.meals ? 1 / species.meals.every : 1;
}
export function wantsMeal(a, species) {
  if (a.juvenile || !species.meals) return true;
  return Boolean(a.eating) || (a.needs?.satiety ?? 100) <= species.meals.at;
}
// Park days until its next meal, as satiety drains (grown ones): undefined for the young.
export function daysToMeal(a, species, drainPerDay) {
  if (a.juvenile || !species.meals) return undefined;
  const s = a.needs?.satiety ?? 100;
  if (s <= species.meals.at) return 0;
  return Math.ceil((s - species.meals.at) / (drainPerDay / species.meals.every));
}
// The clipboard's meals line: "Meals: about once a week. Kubwa ate 2 park days ago; Mara eats next in about 4."
export function mealsLine(crocs, species, day, drainPerDay) {
  const grown = sizeOrder(crocs.filter((a) => !a.juvenile));
  if (!grown.length) return "Meals: young crocodiles eat every day";
  const parts = grown.map((a) => {
    const ago = a.lastMeal !== undefined ? day - a.lastMeal : undefined;
    const next = daysToMeal(a, species, drainPerDay);
    if (a.eating) return `${a.name} is eating`;
    if (ago !== undefined && ago <= 1) return `${a.name} ate ${ago === 0 ? "today" : "yesterday"}`;
    return next === 0 ? `${a.name} is hungry` : `${a.name} eats next in about ${next} park ${next === 1 ? "day" : "days"}`;
  });
  return `Meals: about once a week, biggest first. ${parts.join("; ")}.`;
}

// ---------------- the nest ----------------
// A crocodile's sand nest (its "nests" record { id, exhibitId, motherId, pos, day, hatchDay? }) and the Crocodile
// Nest block's stage: 0 the hole dug and the eggs laid in it (her first park day expecting), 1 filled in flush
// (the incubation), 2 hatched, dug open with the shells about (from the hatching for T.nestHatchedDays). Undefined:
// the nest has had its day (back to sand), or the mother isn't in the exhibit any more before it hatched.
export function crocNestStage(rec, mother, day, gestationDays, T) {
  if (rec.hatchDay !== undefined) return day - rec.hatchDay < T.nestHatchedDays ? 2 : undefined;
  const e = mother?.expecting;
  if (!e || e.nestId !== rec.id || mother.location?.kind !== "exhibit" || mother.location.id !== rec.exhibitId) return undefined;
  return e.daysLeft < gestationDays ? 1 : 0;
}

// The nest site for a female that starts expecting: the free one nearest her (spots [x, y, z, red]), not right
// beside another nest. Returns { x, y, z, red } or undefined.
export function pickSandSpot(spots, taken, near) {
  let best;
  let bestD = Infinity;
  for (const [x, y, z, red] of spots ?? []) {
    if (taken.some((t) => Math.abs(t.x - x) <= 2 && Math.abs(t.z - z) <= 2 && Math.abs(t.y - y) <= 1)) continue;
    const d = (x + 0.5 - near.x) ** 2 + (z + 0.5 - near.z) ** 2 + ((y - near.y) * 2) ** 2;
    if (d < bestD) {
      best = { x, y, z, red: Boolean(red) };
      bestD = d;
    }
  }
  return best;
}

// Temperature sets the sex (Hutton 1987): a nest in full sun is warm, and about 4 hatchlings in 5 are males
// (34 C gives about 81% males); a shaded nest is cooler, and they all hatch female (28 to 31 C).
export function hatchSex(sunny, T, random = Math.random) {
  return sunny && random() < T.sunMales ? "male" : "female";
}
export function hatchLine(sexes, sunny) {
  const males = sexes.filter((s) => s === "male").length;
  const females = sexes.length - males;
  const what = [males ? `${males} ${males === 1 ? "male" : "males"}` : "", females ? `${females} ${females === 1 ? "female" : "females"}` : ""].filter(Boolean).join(" and ");
  return sunny ? `The nest was in full sun, so it was warm: ${what} (a warm nest hatches mostly males)` : `The nest was shaded, so it was cool: ${what} (a cool nest hatches females)`;
}

// ---------------- the wild ----------------
/**
 * A hunting wild crocodile, each half second (animals/croc.js moves it, holds the catch and lands the bites:
 * the entity never attacks by the engine). From the water: it lurks floating, eyes up; spotting someone it
 * sinks and swims under toward the bank nearest them ("stalk"), surfacing eyes-only to check now and then
 * ("check"); when they're within T.hunt.lungeRange of it and within T.hunt.lungeWater of the water it lunges
 * ("lunge"); within reach at the end it grabs them ("grab": the bite) and drags them into the water ("drag")
 * and rolls ("roll", T.hunt.rolls times), then lets go and backs off under the water ("retreat"). Hitting it
 * makes it let go (see.hurt while it holds them). A swimmer is chased under the water ("chase") and grabbed.
 * On land (basking): within T.hunt.landSnap it lunges and snaps; within T.hunt.landWarn it gapes and hisses
 * ("warn"); further, it slides into the water ("slide") and hunts from there. Hurt by them on land, it chases
 * ("landChase", up to T.hunt.landChaseTicks, no further than T.hunt.landReach from the water), then goes back.
 * @param {object|undefined} H the hunt so far
 * @param {{ dist: number, playerToWater: number, inWater: boolean, toWater: number, swimming: boolean, hurt?: boolean }} see
 *   dist: from it to them; playerToWater: from them to the nearest water; inWater: it is in the water;
 *   toWater: from it to the nearest water (0 in it); swimming: they're in the water; hurt: they hit it lately
 * @returns {object} the hunt now; .step is what to do
 */
export function huntStepCroc(H, see, now, T) {
  const t = T.hunt;
  const h = { phase: "lurk", since: now, rolls: 0, retreatUntil: 0, checkAt: now + t.checkEvery, landFrom: undefined, ...(H ?? {}) };
  const go = (phase, step, more = {}) => ({ ...h, phase, since: phase === h.phase ? h.since : now, ...more, step });
  // Holding them: dragging into the water, then the roll; hit, it lets go.
  if (h.phase === "grab" || h.phase === "drag" || h.phase === "roll") {
    if (see.hurt) return go("retreat", "release", { retreatUntil: now + t.letGoTicks, rolls: 0 });
    if (h.phase === "grab") return go("drag", "drag");
    if (h.phase === "drag") {
      if (see.inWater && see.toWater === 0) return go("roll", "roll", { rolls: 0, rollAt: now });
      if (now - h.since > t.dragTicks) return go("roll", "roll", { rolls: 0, rollAt: now }); // couldn't get them to the water: it rolls where it is
      return go("drag", "drag");
    }
    if (h.rolls >= t.rolls) return go("retreat", "release", { retreatUntil: now + t.letGoTicks, rolls: 0 });
    if (now - (h.rollAt ?? now) >= t.rollEvery) return go("roll", "rollBite", { rolls: h.rolls + 1, rollAt: now });
    return go("roll", "roll");
  }
  if (h.phase === "retreat") {
    if (now < h.retreatUntil) return go("retreat", "retreat");
    return go("lurk", "lurk");
  }
  if (h.phase === "lunge") {
    if (now - h.since < t.lungeTicks) return go("lunge", "lunge");
    if (see.dist <= t.grabReach) return go("grab", "grab");
    // Missed: back into the water, and a while before it tries again.
    return go("retreat", "miss", { retreatUntil: now + t.missTicks });
  }
  if (h.phase === "landChase") {
    if (see.dist <= t.grabReach) return go("grab", "grab");
    if (now - h.since > t.landChaseTicks || see.toWater > t.landReach) return go("slide", "slide");
    return go("landChase", "landChase");
  }
  // On land.
  if (!see.inWater) {
    if (see.hurt && see.toWater <= t.landReach) return go("landChase", "landChase");
    if (see.dist <= t.landSnap) return go("lunge", "lunge");
    if (see.dist <= t.landWarn) return go("warn", "warn");
    return go("slide", "slide");
  }
  // In the water.
  if (see.swimming) {
    if (see.dist <= t.grabReach) return go("grab", "grab");
    return go("chase", "chase");
  }
  if (see.dist <= t.lungeRange && see.playerToWater <= t.lungeWater) return go("lunge", "lunge");
  if (now >= h.checkAt) return go("stalk", "check", { checkAt: now + t.checkEvery });
  return go("stalk", "stalk");
}

// Damage in a full grab: the bite, then a roll's bite T.hunt.rolls times (17 by default: enough to kill anyone
// under 9 hearts who doesn't fight back).
export function grabDamage(T) {
  return T.hunt.biteDamage + T.hunt.rolls * T.hunt.rollDamage;
}

// The Field Journal and the clipboard: how dangerous wild crocodiles are.
export function wildLine(T) {
  const h = T.hunt;
  return `Wild crocodiles lurk in swamp water with only their eyes showing and hunt anyone at the edge: one spots you within ${h.spotDay} blocks by day and ${h.spotNight} at dusk and by night (half that sneaking), swims under toward you, and when you're within ${h.lungeRange} blocks of it and ${h.lungeWater} of the water it lunges out, bites (${h.biteDamage / 2} hearts), drags you in and rolls (${h.rollDamage / 2} hearts a roll). Hit it and it lets go. You can't outswim one. Keep back from the water's edge; throw a Meat Ration down near one: while it eats it's calm, and can be crated.`;
}

// The first time one fixes on someone, the action bar's line.
export const SPOTTED_LINE = "§cSomething is watching you from the water: keep back from the edge (crocodiles lunge from the water and drag you in)";
