// Zebras (0.1.74, the Animal wave), pure: the harem and its rank, grazing, feeding places, single file,
// the herd's moods and what to tell players about them. Spec 5.2: "zebra | Zebra | Coordinated herd
// movement | Savanna mixing and broad grazing | Expansion". The game side is animals/zebra.js; the grass
// comes from the exhibit measure (exhibits/geometry.js countGrass), and the rivals rule for breeding is in
// animals/breeding.js (rivalStallions).

import { sexOf, populationWeight, rivalStallions } from "./breeding.js";

// The zebra mobs, found by type (0.1.70: never by family alone).
export const ZEBRA_TYPES = ["zoocraft:zebra", "zoocraft:wild_zebra"];

// What a zebra is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/zebra_anim.py) and the Field Journal watches for it. 0 nothing in particular (standing, or
// walking where the engine takes it); grazing; alert (head up, ears pricked, staring); barking the alarm;
// dozing on its feet; lying on its chest; asleep flat out; grooming a partner; resting its chin on a
// partner's back; rolling in the dust; shaking it off; nursing; a foal at play; sparring; fighting;
// drinking at a Water Trough; eating from a Hay Rack hung a block up; greeting nose to nose; herding (the
// stallion driving a straggler); kicking out behind; walking in single file; trotting; galloping; eating
// at a feeder; walking where the script takes it; standing watch at night; eating from a Hay Rack on the
// ground.
export const ACT = {
  none: 0,
  graze: 1,
  alert: 2,
  bark: 3,
  doze: 4,
  lie: 5,
  sleep: 6,
  groom: 7,
  rest: 8,
  roll: 9,
  shake: 10,
  nurse: 11,
  play: 12,
  spar: 13,
  fight: 14,
  drink: 15,
  rack: 16,
  greet: 17,
  herd: 18,
  kick: 19,
  file: 20,
  trot: 21,
  gallop: 22,
  feed: 23,
  step: 24,
  watch: 25,
  rackLow: 26,
};
// Lying down: the client plays lying down, then holds it, and plays getting up when the act changes.
export const DOWN_ACTS = [ACT.lie, ACT.sleep, ACT.roll];

// How fast the script walks, trots and gallops a zebra, in blocks a tick: the strides of the client's
// file walk, trot and gallop (gen/zebra_anim.py: 0.94, 2.25 and 4.95 blocks a second), so the hooves
// keep time with the ground.
export const PACE = { walk: 0.94 / 20, trot: 2.25 / 20, gallop: 4.95 / 20 };

// ---------------- the harem ----------------
// A zebra's role in its herd: "stallion" (a grown male), "mare" (a grown female) or "foal".
export function roleOf(a, species) {
  if (a.juvenile) return "foal";
  return sexOf(a, species) === "male" ? "stallion" : "mare";
}

/**
 * Rank at the food (species.feedRank): the stallion first, then the mares in the order they came to
 * the exhibit (`order`, the exhibit's animalIds); a second stallion after the mares, a newcomer at the
 * bottom. Foals don't take a place: they eat with their mothers. Grown-ups only, best first.
 * @param {{ id: string, juvenile?: boolean, sex?: string, coat?: number }[]} animals
 * @param {string[]} order
 */
export function rankOrder(animals, species, order) {
  const at = (a) => {
    const i = order.indexOf(a.id);
    return i < 0 ? order.length : i;
  };
  const grown = animals.filter((a) => !a.juvenile).sort((p, q) => at(p) - at(q));
  const males = grown.filter((a) => sexOf(a, species) === "male");
  const mares = grown.filter((a) => sexOf(a, species) !== "male");
  // The first stallion to come leads the harem; any other stallion comes after the mares.
  return mares.length ? [...males.slice(0, 1), ...mares, ...males.slice(1)] : grown;
}

// Feeding places at the feeders holding food they eat: a Basic Feeder has room for places.feeder, a
// Puzzle Feeder places.puzzle, a Hay Rack places.rack (equid guidance: forage in several places, so the
// low-ranking ones get theirs).
/** @param {{ rack?: boolean, puzzle?: boolean }[]} feeders */
export function feedingPlaces(feeders, places) {
  return feeders.reduce((n, f) => n + (f.rack ? places.rack : f.puzzle ? places.puzzle : places.feeder), 0);
}

// The grown-ups that get pushed off the food: the lowest-ranking ones beyond the places.
export function pushedOff(rank, places) {
  return rank.slice(Math.max(0, places));
}

// ---------------- grazing ----------------
// Grass blocks the herd needs to graze: graze.perAnimal each (a foal half: juvenileWeight).
export function grassNeeded(animals, graze, juvenileWeight) {
  return Math.ceil(graze.perAnimal * populationWeight(animals, juvenileWeight));
}

// The share of their food they get from grazing: up to graze.share with enough grass, less with less;
// nothing before the grass has been counted.
export function grazeShare(grassCells, needed, graze) {
  if (grassCells === undefined || needed <= 0) return 0;
  return graze.share * Math.min(1, grassCells / needed);
}

// Enough grass to graze? An exhibit not counted yet always has (like mud).
export function hasGrass(grassCells, needed) {
  return grassCells === undefined || grassCells >= needed;
}

// ---------------- the herd, for players ----------------
// "Ziggy", "Ziggy and Zola", "Ziggy, Zola and 2 more".
export function namesOf(list) {
  const n = list.map((a) => a.name);
  if (n.length <= 2) return n.join(" and ");
  return `${n[0]}, ${n[1]} and ${n.length - 2} more`;
}

/**
 * Care warnings about the herd: rival stallions with the mares, zebras pushed off the food, and grass.
 * @param {{ name: string, id: string, juvenile?: boolean, sex?: string }[]} herd the zebras living there
 * @param {{ places: number, grassCells?: number, order: string[], plural: string }} ctx places: feeding
 *   places at feeders holding food they eat; order: the exhibit's animalIds
 */
export function herdWarnings(herd, species, ctx, Z, juvenileWeight) {
  const out = [];
  const plural = ctx.plural;
  const rivals = species.harem ? rivalStallions(herd, species) : [];
  if (rivals.length) out.push({ severity: 2, text: `${namesOf(rivals)} fight over the mares: ${plural.toLowerCase()} live in harems, one stallion with his mares and their foals. Move the other stallions to a bachelor group of their own (an exhibit with no mares). Until then nobody here is settled, and none of them breeds.` });
  if (species.feedRank && ctx.places > 0) {
    const off = pushedOff(rankOrder(herd, species, ctx.order), ctx.places);
    if (off.length) out.push({ severity: 2, text: `${namesOf(off)} ${off.length === 1 ? "gets" : "get"} pushed off the food by higher-ranking ${plural.toLowerCase()}: ${plural.toLowerCase()} feed in rank order, and there's room for ${ctx.places} at the feeders. Add feeding places: a Basic Feeder has room for ${Z.places.feeder}, a Hay Rack for ${Z.places.rack}.` });
  }
  if (species.graze) {
    const need = grassNeeded(herd, species.graze, juvenileWeight);
    if (!hasGrass(ctx.grassCells, need)) out.push({ severity: 2, text: `${plural} graze: at least ${need} grass blocks in the exhibit floor (${ctx.grassCells} now), ${species.graze.perAnimal} for each (a ${species.breeding?.young ?? "young one"} half). Grass spreads onto dirt beside it in the light, and grazing never wears it away.` });
  }
  return out;
}

/**
 * The clipboard's herd line: the stallion, mares and foals, rivals, feeding places against the
 * grown-ups, and the grass against what they need.
 * @param {{ grassCells?: number, animalIds: string[] }} ex
 */
export function herdLine(ex, herd, species, places, juvenileWeight) {
  const ok = (good) => (good ? "§a" : "§c");
  const males = herd.filter((a) => roleOf(a, species) === "stallion");
  const mares = herd.filter((a) => roleOf(a, species) === "mare");
  const foals = herd.length - males.length - mares.length;
  const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const young = species.breeding?.young ?? "foal";
  const rivals = species.harem && rivalStallions(herd, species).length > 0;
  const who = mares.length ? `${ok(!rivals)}${count(males.length, "stallion", "stallions")}${rivals ? " (rivals!)" : ""}§7, ${count(mares.length, "mare", "mares")}` : `${count(males.length, "stallion", "stallions")} (a bachelor group)`;
  const grown = males.length + mares.length;
  const need = species.graze ? grassNeeded(herd, species.graze, juvenileWeight) : 0;
  const grass = species.graze ? `; grass ${ok(hasGrass(ex.grassCells, need))}${ex.grassCells ?? "not counted yet"}§7 (${need} to graze)` : "";
  return `§fHerd: §7${who}${foals ? `, ${count(foals, young, species.breeding?.youngPlural ?? "foals")}` : ""}; feeding places ${ok(places >= grown)}${places}§7 for ${grown} grown${grass}`;
}

// The animal page's line: where it ranks at the food, and whether it gets pushed off.
export function rankLine(a, herd, species, order, places) {
  if (a.juvenile) return "§fAt the food: §7eats with its mother";
  const rank = rankOrder(herd, species, order);
  const i = rank.findIndex((b) => b.id === a.id);
  if (i < 0) return "§fAt the food: §7not ranked yet";
  // No feeding places at all is the empty-feeder warning, not a pushing match.
  const pushed = places > 0 && places < rank.length && i >= places;
  return `§fAt the food: §7${i + 1} of ${rank.length} in rank${pushed ? `, §cpushed off§7: room for ${places} at the feeders` : ""}`;
}

// ---------------- moods ----------------
/**
 * A herd's mood for a while (animals/zebra.js keeps one for each exhibit's zebras and each wild herd):
 * "graze" (spread out, heads down, stepping slowly on), "trek" (off somewhere in single file), "rest"
 * (dozing on their feet, grooming and resting in pairs, one lying down, a roll) or "night" (lying down,
 * some flat out asleep, one standing watch). Around midday they rest more.
 * @param {{ night: boolean, midday: boolean }} c
 */
export function pickMood({ night, midday }, Z, random = Math.random) {
  if (night) return "night";
  const r = random();
  const rest = midday ? Z.restChance.midday : Z.restChance.day;
  if (r < rest) return "rest";
  return r < rest + Z.trekChance ? "trek" : "graze";
}

// Is it around midday (world time of day, 0 to 24000; noon is 6000)?
export function isMidday(timeOfDay) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  return t >= 4000 && t < 8000;
}

// ---------------- single file ----------------
/**
 * The order a herd walks in single file (Mpala; Britannica; Fischhoff et al. 2007): the lead is the
 * mare with the youngest foal (mothers lead more often), else the top mare; then the mares by rank,
 * each with her foals right behind her; any foal without its mother here; the stallion at the rear. A
 * bachelor group follows its top male. `gap`: how far behind the one before it walks (a foal closer).
 * @param {{ id: string, role: string, motherId?: string, born?: number }[]} members in rank order
 * @returns {{ id: string, gap: number }[]}
 */
export function fileOrder(members, gaps = { adult: 3, foal: 2 }) {
  const foals = members.filter((m) => m.role === "foal");
  const mares = members.filter((m) => m.role === "mare");
  const males = members.filter((m) => m.role === "stallion");
  if (!mares.length) {
    // A bachelor group (or foals with no mothers here): the top male leads.
    return [...males, ...foals].map((m, i) => ({ id: m.id, gap: i === 0 ? 0 : m.role === "foal" ? gaps.foal : gaps.adult }));
  }
  const youngest = foals.filter((f) => mares.some((m) => m.id === f.motherId)).sort((p, q) => (q.born ?? 0) - (p.born ?? 0))[0];
  const lead = youngest ? mares.find((m) => m.id === youngest.motherId) : mares[0];
  const out = [];
  const put = (m, gap) => out.push({ id: m.id, gap: out.length ? gap : 0 });
  for (const mare of [lead, ...mares.filter((m) => m !== lead)]) {
    put(mare, gaps.adult);
    for (const f of foals.filter((f) => f.motherId === mare.id)) put(f, gaps.foal);
  }
  for (const f of foals.filter((f) => !mares.some((m) => m.id === f.motherId))) put(f, gaps.adult);
  // The stallion walks at the rear; a second stallion just ahead of him.
  for (const m of [...males.slice(1), ...males.slice(0, 1)]) put(m, gaps.adult);
  return out;
}

/**
 * Where a follower in single file should be along its own way (its walk up to where the lead set off,
 * then the lead's way), `t` ticks after the lead set off: as far as the lead has walked, less the gaps
 * in front of it. Before that it waits.
 * @param {number} approach blocks of its walk up to the lead's starting block
 * @param {number} behind blocks of gaps in front of it
 */
export function fileTarget(approach, behind, t, pace) {
  return Math.max(0, approach + pace * t - behind);
}

// How a follower keeps its place: trotting when it has fallen behind (more than `far` blocks), walking
// back down once it has caught up (within `near`), standing when it's ahead.
export function filePace(have, want, trotting, far = 1.5, near = 0.3) {
  const lag = want - have;
  if (lag <= 0) return "wait";
  if (lag > far || (trotting && lag > near)) return "trot";
  return "walk";
}

// ---------------- ways ----------------
/**
 * A way for a zebra to walk from the block `from` to the block `to`: a shortest way over standable
 * blocks (`can(cell)`), level, a step up or a step down at a time, with room over its head for the step
 * up (`clear(cell)`, the block two up). The blocks it walks through in order, ending at `to` ([] when
 * it's already there); undefined when there's no way within `maxSteps`, or none found after looking at
 * `maxNodes` blocks (in the wild every block looked at is read from the world).
 * 0.1.96: an A* search toward `to` (the blocks still to go across, which a step can cut by one at most, so the way is
 * as short as the breadth-first one was) rather than breadth first: a walk across a big exhibit looked at every
 * block of it, 15 to 60 ms in the game's script engine for one gorilla. Blocks go by number, and `can` and `clear`
 * are asked once a block.
 * @param {(c: {x: number, y: number, z: number}) => boolean} can
 * @param {(c: {x: number, y: number, z: number}) => boolean} clear
 */
export function findWay(can, clear, from, to, maxSteps, maxNodes = Infinity) {
  if (from.x === to.x && from.y === to.y && from.z === to.z) return [];
  const steps = Math.min(maxSteps, WAY_OFF - 1); // a way this long stays within the numbering
  const ox = from.x - WAY_OFF;
  const oy = from.y - WAY_OFF;
  const oz = from.z - WAY_OFF;
  const no = (x, y, z) => ((x - ox) * WAY_SPAN + (y - oy)) * WAY_SPAN + (z - oz);
  const goal = no(to.x, to.y, to.z);
  const cells = new Map(); // number -> the block
  const g = new Map(); // number -> steps from `from`
  const prev = new Map(); // number -> the block it was reached from, by number
  const canAt = new Map();
  const clearAt = new Map();
  const ok = (k, c) => {
    let v = canAt.get(k);
    if (v === undefined) canAt.set(k, (v = Boolean(can(c))));
    return v;
  };
  const roomAt = (k, c) => {
    let v = clearAt.get(k);
    if (v === undefined) clearAt.set(k, (v = Boolean(clear(c))));
    return v;
  };
  // A goal it can't stand on is never reached: no need to look through the whole exhibit to find that out.
  if (!ok(goal, { x: to.x, y: to.y, z: to.z })) return undefined;
  const start = no(from.x, from.y, from.z);
  cells.set(start, from);
  g.set(start, 0);
  const heap = wayHeap();
  heap.push(start, Math.abs(to.x - from.x) + Math.abs(to.z - from.z), 0);
  const done = new Set();
  while (heap.size()) {
    const k = heap.pop();
    if (done.has(k)) continue;
    done.add(k);
    const c = cells.get(k);
    const gc = g.get(k);
    const ng = gc + 1;
    for (let d = 0; d < 4; d++) {
      const x = c.x + DIRS4[d][0];
      const z = c.z + DIRS4[d][1];
      const h = Math.abs(to.x - x) + Math.abs(to.z - z);
      if (ng + h > steps) continue;
      for (let e = 0; e < 3; e++) {
        const dy = WAY_DY[e];
        const y = c.y + dy;
        const nk = no(x, y, z);
        const known = g.get(nk);
        if (known !== undefined && known <= ng) continue;
        let n = cells.get(nk);
        if (!n) n = { x, y, z };
        if (!ok(nk, n)) continue;
        if (dy === 1 && !roomAt(k, c)) continue;
        if (dy === -1 && !roomAt(nk, n)) continue;
        cells.set(nk, n);
        g.set(nk, ng);
        prev.set(nk, k);
        if (nk === goal) {
          const path = [];
          for (let p = nk; p !== start; p = /** @type {number} */ (prev.get(p))) path.push(cells.get(p));
          return path.reverse();
        }
        if (g.size > maxNodes) return undefined;
        heap.push(nk, ng + h, ng);
      }
    }
  }
  return undefined;
}
const WAY_OFF = 65536;
const WAY_SPAN = 131072;
const WAY_DY = [0, 1, -1];

// The blocks waiting in findWay, nearest the goal first (the fewest steps there and still to go), the furthest along
// of those first (it heads on rather than widening out), then the first put in: a binary heap.
function wayHeap() {
  const keys = [];
  const pri = [];
  let n = 0;
  let seq = 0;
  return {
    size: () => n,
    push(k, f, g) {
      const p = (f * 65536 + (65535 - g)) * 2097152 + (seq++ % 2097152);
      let i = n++;
      while (i > 0) {
        const up = (i - 1) >> 1;
        if (pri[up] <= p) break;
        keys[i] = keys[up];
        pri[i] = pri[up];
        i = up;
      }
      keys[i] = k;
      pri[i] = p;
    },
    pop() {
      const top = keys[0];
      n--;
      if (n > 0) {
        const k = keys[n];
        const p = pri[n];
        let i = 0;
        for (;;) {
          let c = 2 * i + 1;
          if (c >= n) break;
          if (c + 1 < n && pri[c + 1] < pri[c]) c++;
          if (pri[c] >= p) break;
          keys[i] = keys[c];
          pri[i] = pri[c];
          i = c;
        }
        keys[i] = k;
        pri[i] = p;
      }
      return top;
    },
  };
}
const DIRS4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * The points a zebra glides through along a way of blocks (from where it stands): the block centres
 * with each corner cut (Chaikin, twice), so it turns through a bend instead of on the spot. Every point
 * stays inside the blocks of the way. With `open`, a corner is cut only where the block inside the bend
 * is open too (nothing at a zebra's feet or head there): going round a fence post, a feeder or a trough
 * the way bends in the middle of its block, so the body (0.9 wide) keeps clear of it; and from where it
 * stands off the middle of its block, it steps to the middle first if the straight line on would take its
 * body across a closed block.
 * @param {{x: number, y: number, z: number}} start where it stands
 * @param {{x: number, y: number, z: number}[]} cells the way
 * @param {(c: {x: number, y: number, z: number}) => boolean} [open]
 */
export function smoothWay(start, cells, open = undefined) {
  let pts = [{ x: start.x, y: start.y, z: start.z }, ...cells.map((c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 }))];
  if (open && cells.length && !clearLine(pts[0], pts[1], open)) pts.splice(1, 0, { x: Math.floor(start.x) + 0.5, y: start.y, z: Math.floor(start.z) + 0.5 });
  let sharp = pts.map((p, i) => Boolean(open) && i > 0 && i < pts.length - 1 && !open(inside(pts[i - 1], p, pts[i + 1])));
  for (let pass = 0; pass < 2 && pts.length > 2; pass++) {
    const out = [pts[0]];
    const kept = [false];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      // A step up or down keeps its own height at both cuts, so it climbs within the step.
      const lerp = (f) => ({ x: p.x + (q.x - p.x) * f, y: f < 0.5 ? p.y : q.y, z: p.z + (q.z - p.z) * f });
      if (i > 0) {
        out.push(lerp(0.25));
        kept.push(false);
      }
      if (i < pts.length - 2) {
        out.push(lerp(0.75));
        kept.push(false);
        // A bend kept: the way goes through the block's middle.
        if (sharp[i + 1]) {
          out.push(q);
          kept.push(true);
        }
      }
    }
    out.push(pts[pts.length - 1]);
    kept.push(false);
    pts = out;
    sharp = kept;
  }
  return pts;
}
// The block inside the bend at `b` on the way from `a` to `c` (b's own block where the way runs straight).
// Could a zebra's body (its collision box, `half` a block each side of it) go straight from a to b past
// only open blocks (at a's height)?
export function clearLine(a, b, open, half = 0.45) {
  const y = Math.floor(a.y + 0.5);
  const n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.1));
  for (let i = 0; i <= n; i++) {
    const x = a.x + ((b.x - a.x) * i) / n;
    const z = a.z + ((b.z - a.z) * i) / n;
    for (const [dx, dz] of [
      [-half, -half],
      [half, -half],
      [-half, half],
      [half, half],
    ]) {
      if (!open({ x: Math.floor(x + dx), y, z: Math.floor(z + dz) })) return false;
    }
  }
  return true;
}

function inside(a, b, c) {
  return { x: Math.floor(a.x + c.x - b.x), y: b.y, z: Math.floor(a.z + c.z - b.z) };
}

// Blocks along a glide: the length of a polyline.
export function wayLength(pts) {
  let n = 0;
  for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z) + Math.abs(pts[i].y - pts[i - 1].y) * 0.5;
  return n;
}

// The point `s` blocks along a polyline (the last point past its end), and the way it heads there.
export function pointAlong(pts, s) {
  let left = Math.max(0, s);
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const q = pts[i];
    const len = Math.hypot(q.x - p.x, q.z - p.z) + Math.abs(q.y - p.y) * 0.5;
    if (left <= len || i === pts.length - 1) {
      const f = len > 0 ? Math.min(1, left / len) : 1;
      return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, z: p.z + (q.z - p.z) * f, dx: q.x - p.x, dz: q.z - p.z };
    }
    left -= len;
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, z: last.z, dx: 0, dz: 0 };
}

// Which way an animal faces to look along ({ dx, dz }), as a Minecraft yaw in degrees.
export function yawTo(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
}

// Turn from `yaw` toward `want` by at most `step` degrees, the short way round.
export function turnToward(yaw, want, step) {
  const d = ((((want - yaw) % 360) + 540) % 360) - 180;
  return Math.abs(d) <= step ? want : yaw + Math.sign(d) * step;
}

// A spot beside a zebra standing at `p` facing `yaw`: `left` blocks to its left, `ahead` blocks forward.
export function besideOf(p, yaw, left, ahead) {
  const r = (yaw * Math.PI) / 180;
  const fx = -Math.sin(r);
  const fz = Math.cos(r);
  // Facing (fx, fz), its left hand points to (fz, -fx)... in Minecraft's axes (+x east, +z south), facing
  // south (yaw 0) the left is east: (fz, -fx) = (1, 0).
  return { x: p.x + fz * left + fx * ahead, y: p.y, z: p.z - fx * left + fz * ahead };
}

// ---------------- room ----------------
// The ground a zebra covers, seen from above, in blocks from where it stands: [back, front] along its
// facing and [right, left] across it. Measured off the client entity in each act (gen/zeb_footprint.py:
// the union over the act once it has blended in, lying down and over included): its body (the torso;
// lying down, its folded legs too; asleep flat out or rolling, its legs stretched out to its left) and
// its neck and head (reaching forward to the ground grazing, laid on the ground to its right asleep);
// bucking in play, its hind legs kicked out behind and its forelegs thrown forward. A foal's are its own
// (smaller, a bigger head).
export const FOOTPRINT = {
  adult: {
    stand: { body: [-0.69, 0.66, -0.24, 0.24], head: [0.13, 1.27, -0.24, 0.24] },
    buck: { body: [-1.36, 0.94, -0.25, 0.25], head: [0.06, 1.27, -0.3, 0.3] },
    lie: { body: [-1.06, 0.73, -0.29, 0.42], head: [-0.23, 1.38, -0.3, 0.22] },
    sleep: { body: [-1.06, 0.87, -0.41, 0.98], head: [-0.23, 1.38, -0.88, 0.26] },
  },
  foal: {
    stand: { body: [-0.41, 0.39, -0.15, 0.15], head: [0.06, 0.76, -0.15, 0.15] },
    buck: { body: [-0.9, 0.61, -0.16, 0.16], head: [0.02, 0.77, -0.19, 0.19] },
    lie: { body: [-0.64, 0.45, -0.17, 0.25], head: [-0.16, 0.83, -0.19, 0.15] },
    sleep: { body: [-0.64, 0.52, -0.25, 0.59], head: [-0.16, 0.83, -0.54, 0.16] },
  },
};
// Up to this deep (blocks), two zebras are only touching coats.
export const ROOM_TOUCH = 0.05;

// A footprint's rectangle placed at (x, z) facing yaw: its middle, its forward and left axes, and half
// its length and breadth. Facing south (yaw 0) its left is east, as besideOf has it.
export function placeRect([back, front, right, left], x, z, yaw) {
  const r = (yaw * Math.PI) / 180;
  const f = [-Math.sin(r), Math.cos(r)];
  const l = [Math.cos(r), Math.sin(r)];
  const mf = (back + front) / 2;
  const ml = (right + left) / 2;
  return { x: x + f[0] * mf + l[0] * ml, z: z + f[1] * mf + l[1] * ml, f, l, hf: (front - back) / 2, hl: (left - right) / 2 };
}

// How deep two placed rectangles cross: the least overlap along their four sides' directions (0 when
// one of them parts them).
export function overlapDepth(a, b) {
  const d = [b.x - a.x, b.z - a.z];
  let depth = Infinity;
  for (const ax of [a.f, a.l, b.f, b.l]) {
    const half = (q) => Math.abs(q.hf * (q.f[0] * ax[0] + q.f[1] * ax[1])) + Math.abs(q.hl * (q.l[0] * ax[0] + q.l[1] * ax[1]));
    const gap = half(a) + half(b) - Math.abs(d[0] * ax[0] + d[1] * ax[1]);
    if (gap <= 0) return 0;
    depth = Math.min(depth, gap);
  }
  return depth;
}

// A zebra's body and head at (x, z) facing yaw: standing ("stand"), bucking ("buck"), lying ("lie") or
// asleep or rolling ("sleep"); grown or a foal.
export function footprintOf(x, z, yaw, how = "stand", foal = false) {
  const fp = FOOTPRINT[foal ? "foal" : "adult"][how] ?? FOOTPRINT.adult.stand;
  return { body: placeRect(fp.body, x, z, yaw), head: placeRect(fp.head, x, z, yaw) };
}

// How far two zebras crowd each other: a body through the other's body, or a head through it (two heads
// together are fine: noses meeting, grooming). 0 when they're clear.
export function crowding(a, b) {
  return Math.max(overlapDepth(a.body, b.body), overlapDepth(a.head, b.body), overlapDepth(a.body, b.head));
}

// The blocks a placed rectangle covers (keys "x,y,z" at height y): sampled every 0.2 of a block, edges
// included.
export function cellsUnder(rect, y) {
  const out = new Set();
  const nf = Math.max(1, Math.ceil((rect.hf * 2) / 0.2));
  const nl = Math.max(1, Math.ceil((rect.hl * 2) / 0.2));
  for (let i = 0; i <= nf; i++) {
    for (let j = 0; j <= nl; j++) {
      const a = -rect.hf + (i * 2 * rect.hf) / nf;
      const b = -rect.hl + (j * 2 * rect.hl) / nl;
      out.add(`${Math.floor(rect.x + rect.f[0] * a + rect.l[0] * b)},${y},${Math.floor(rect.z + rect.f[1] * a + rect.l[1] * b)}`);
    }
  }
  return out;
}

// ---------------- startle ----------------
/**
 * Who the herd startles at: the nearest player within `range` blocks of any of them who is sprinting
 * and not sneaking. Undefined when there's nobody.
 * @param {{ x: number, z: number }[]} herd
 * @param {{ x: number, z: number, sprinting: boolean, sneaking: boolean }[]} players
 */
export function threatOf(herd, players, range) {
  let best;
  let bestD = range;
  for (const p of players) {
    if (!p.sprinting || p.sneaking) continue;
    for (const z of herd) {
      const d = Math.hypot(p.x - z.x, p.z - z.z);
      if (d <= bestD) {
        best = p;
        bestD = d;
      }
    }
  }
  return best;
}

// The eight ways to run, as one-block steps, in yaw order from south.
export const HEADINGS = [
  { x: 0, z: 1 },
  { x: -1, z: 1 },
  { x: -1, z: 0 },
  { x: -1, z: -1 },
  { x: 0, z: -1 },
  { x: 1, z: -1 },
  { x: 1, z: 0 },
  { x: 1, z: 1 },
];

// The heading straight away from (`from` to `at`), then the ones either side of it, then the next
// ones out: the order to try them in when running off.
export function headingsAway(at, from) {
  const i = headingIndex(at.x - from.x, at.z - from.z);
  return [0, 1, -1, 2, -2].map((d) => HEADINGS[(i + d + 8) % 8]);
}

// Which of the eight HEADINGS is nearest the way (dx, dz).
export function headingIndex(dx, dz) {
  return ((Math.round(yawTo(dx, dz) / 45) % 8) + 8) % 8;
}

/**
 * A run in a straight line from the block `start` along `dir`, up to `n` blocks, while each block is
 * standable (`can`) with room for a step up (`clear`). The blocks it runs through, fewer where it's
 * blocked.
 */
export function runLine(can, clear, start, dir, n) {
  const path = [];
  let at = start;
  for (let i = 0; i < n; i++) {
    const x = at.x + dir.x;
    const z = at.z + dir.z;
    // Diagonally, both blocks it cuts between must be open too.
    if (dir.x && dir.z && !(can({ x: at.x + dir.x, y: at.y, z: at.z }) || can({ x: at.x + dir.x, y: at.y + 1, z: at.z }) || can({ x: at.x + dir.x, y: at.y - 1, z: at.z }))) break;
    if (dir.x && dir.z && !(can({ x: at.x, y: at.y, z: at.z + dir.z }) || can({ x: at.x, y: at.y + 1, z: at.z + dir.z }) || can({ x: at.x, y: at.y - 1, z: at.z + dir.z }))) break;
    const next = [0, 1, -1].map((dy) => ({ x, y: at.y + dy, z })).find((c) => can(c) && (c.y <= at.y || clear(at)) && (c.y >= at.y || clear(c)));
    if (!next) break;
    path.push(next);
    at = next;
  }
  return path;
}

// ---------------- wild herds ----------------
// Wild zebras in herds: a zebra and every zebra within `reach` blocks of it are one herd, and so on
// through the herd (a herd strung out grazing across a plain, each a few blocks from the next, is still
// one herd). `zebras` are [{ x, z }]; returns the herd index of each, in the same order, the herds
// numbered in the order their first zebra comes.
export function herdsOf(zebras, reach) {
  const up = zebras.map((_, i) => i);
  const top = (i) => {
    while (up[i] !== i) i = up[i] = up[up[i]];
    return i;
  };
  for (let i = 0; i < zebras.length; i++) {
    for (let j = i + 1; j < zebras.length; j++) {
      if (Math.hypot(zebras[i].x - zebras[j].x, zebras[i].z - zebras[j].z) > reach) continue;
      const a = top(i);
      const b = top(j);
      if (a !== b) up[Math.max(a, b)] = Math.min(a, b);
    }
  }
  const number = new Map();
  return zebras.map((_, i) => {
    const t = top(i);
    if (!number.has(t)) number.set(t, number.size);
    return number.get(t);
  });
}

// A wild zebra has no record, so its sex comes from its entity id (fixed for that zebra).
export function wildSex(entityId) {
  let h = 0;
  for (const c of String(entityId)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 3 === 0 ? "male" : "female";
}
