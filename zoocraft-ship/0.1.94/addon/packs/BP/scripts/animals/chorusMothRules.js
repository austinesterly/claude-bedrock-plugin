// Chorus Moths (0.1.94, the End pair's first; spec 5.4 "Purple angular wings | Hovers around chorus flowers | Flight
// space, chorus nectar, low light"), pure: the chorus flowers and the chorus on the floor of a moth house, where it
// hovers to sip at a flower or a Nectar Feeder, the wall spots it rests on, its bouts, and what a moth house needs. The
// game side is animals/chorusMoth.js; the house's air is the flight measure's (exhibits/geometry.js floodAerial), as
// for Soul Moths.
// Sources (research/end_pair_facts.md, research/end_pair_plan.md): the elephant hawk-moth (Deilephila elpenor) feeds
// at dusk by hovering at flowers, and sees colour in near darkness (Kelber et al. 2002); a hawk moth hovers a little way
// off a flower and reaches in only with its proboscis, holding station as the flower sways (Sponberg et al. 2015); it
// shivers its flight muscles warm before it can fly (Heinrich and Bartholomew 1971); at rest it folds its forewings
// over the hindwings into a triangle (EDIS EENY-652). Its caterpillar swells its front to show two big eyespots when
// disturbed, and pupates in the soil.

import { yawTo } from "./zebraRules.js";
import { heightAbove } from "./owlRules.js";
import { fits } from "./mothRules.js";
import { isNocturnalHouse, houseProblems } from "./nightRules.js";

// The moth mobs, found by type (0.1.70: never by family alone).
export const CHORUS_MOTH_TYPES = ["zoocraft:chorus_moth", "zoocraft:wild_chorus_moth"];
export const WILD_CHORUS_MOTH = "zoocraft:wild_chorus_moth";

// What a moth is doing (its zoocraft:act entity property): the client plays the matching animation (gen/chorusmoth.py
// ACT_STATES) and the Field Journal watches for it. 0 is a grown moth settled on the ground (a caterpillar: still).
export const ACT = { none: 0, fly: 1, rest: 2, warm: 3, hover: 4, sip: 5, emerge: 6, crawl: 7, munch: 8, burrow: 9, pupa: 10, rear: 11, warm_flat: 12 };

// The model's scale (gen/chorusmoth.py SIZE_SCALE: 1 the big moth, 0.1 the real elephant hawk-moth). Where it holds
// at a flower, a dish or a wall goes with it.
export const SCALE = 1;
// At rest up a wall, its position is this far (blocks) from the wall's face: half its collision box. The model draws
// it the rest of the way in (gen/chorusmoth.py WALL_IN).
export const WALL_GAP = 0.16 * SCALE;
// Its body round its position (blocks): its collision box (0.32 across, 0.25 up) and a hair more.
export const BODY = { half: 0.18 * SCALE, height: 0.27 * SCALE };
// The tip of its uncoiled proboscis, ahead of its position (6 model units: gen/chorusmoth.py's tongue).
export const TONGUE = 0.37 * SCALE;

const key = (x, y, z) => `${x},${y},${z}`;
const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const FLAT = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------------- the chorus in a moth house ----------------

export function isChorusFlower(id) {
  return id === "minecraft:chorus_flower";
}

// Chorus, a plant or a flower: what the caterpillars eat.
export function isChorus(id) {
  return id === "minecraft:chorus_plant" || id === "minecraft:chorus_flower";
}

export function newChorusResult() {
  return { flowers: [], flowerCount: 0, plants: 0, plantSpots: [], lowTops: 0 };
}

/**
 * The chorus flowers and the chorus standing on the floor of a moth house, from its flight measure's cells. Chorus is
 * a block the air stops at, so the cells' neighbours are read for it. A flower counts once it has an open side (a cell
 * beside it, over it or under it: in the house or on its walls), any age; the first `opts.flowerKeep` are kept as
 * { x, y, z }. Chorus on the floor is the lowest block of a chorus plant or flower beside a floor ("land") cell at its
 * level, standing on something that isn't chorus; each counts once, and the first `opts.keep` are kept as the floor
 * cell beside it and the way to it, [x, y, z, dx, dz] (where a caterpillar munches it). lowTops counts the "land" cells
 * on top of chorus with less than `opts.minHeight` blocks of air (a flower on the floor under a 4-high roof): the flight
 * measure counts them low floor, but no moth wants to stand there, so they're taken off it. `typeAt(x, y, z)` gives
 * { id } for a block, or undefined unloaded. A generator, a slice of `opts.cellsPerYield` reads at a time.
 * @param {(x: number, y: number, z: number) => ({ id: string } | undefined)} typeAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number, flowerKeep: number, minHeight: number }} opts
 * @param {ReturnType<typeof newChorusResult>} out
 */
export function* measureChorus(typeAt, cells, opts, out) {
  const seen = new Set();
  const bases = new Set();
  let n = 0;
  const tick = function* () {
    if (++n % opts.cellsPerYield === 0) yield;
  };
  for (const [k, kind] of cells) {
    const [x, y, z] = k.split(",").map(Number);
    if (kind === "land" && !roomOver(cells, x, y, z, opts.minHeight)) {
      const below = typeAt(x, y - 1, z);
      yield* tick();
      if (below && isChorus(below.id)) out.lowTops++;
    }
    for (const [dx, dy, dz] of SIDES) {
      const nk = key(x + dx, y + dy, z + dz);
      if (cells.has(nk)) continue;
      const nb = typeAt(x + dx, y + dy, z + dz);
      yield* tick();
      if (!nb || !isChorus(nb.id)) continue;
      if (isChorusFlower(nb.id) && !seen.has(nk)) {
        seen.add(nk);
        out.flowerCount++;
        if (out.flowers.length < opts.flowerKeep) out.flowers.push({ x: x + dx, y: y + dy, z: z + dz });
      }
      // Chorus beside the floor at its level, standing on the ground (not on more chorus).
      if (kind !== "land" || dy !== 0 || bases.has(nk)) continue;
      const under = typeAt(x + dx, y - 1, z + dz);
      yield* tick();
      if (!under || isChorus(under.id) || under.id === "minecraft:air") continue;
      bases.add(nk);
      out.plants++;
      if (out.plantSpots.length < opts.keep) out.plantSpots.push([x, y, z, dx, dz]);
    }
  }
}

// `height` - 1 blocks of air (or a perch) over the cell, as the flight measure's headroom.
function roomOver(cells, x, y, z, height) {
  for (let h = 1; h < height; h++) {
    const c = cells.get(key(x, y + h, z));
    if (c !== "air" && c !== "perch") return false;
  }
  return true;
}

// Chorus flowers enough (species.chorusFlowers): one for each grown moth, `min` at least. Not measured yet: passes.
export function flowersNeeded(species, moths) {
  const c = species.chorusFlowers;
  return c ? Math.max(c.min, Math.ceil(moths * c.perMoth)) : 0;
}

export function hasChorusFlowers(species, ex, moths) {
  if (!species.chorusFlowers || ex.chorus === undefined) return true;
  return ex.chorus.flowerCount >= flowersNeeded(species, moths);
}

// Chorus enough on the floor for the caterpillars (breeding.hostPlants of it).
export function hasChorusHosts(species, ex) {
  const need = species.breeding?.hostPlants;
  return !need || (ex.chorus?.plants ?? 0) >= need;
}

// A dim house (species.lowLight): the nocturnal house's test (no daylight on the floor, nothing brighter than the
// Nocturnal Lamps' light), from the light measure. Not measured yet: passes.
export function hasLowLight(species, ex, balance) {
  if (!species.lowLight || !ex.house) return true;
  return isNocturnalHouse(ex, balance);
}

// ---------------- at a flower ----------------

/**
 * Where it can hover at the chorus flower `f` to sip: in front of an open side, its proboscis reaching into the
 * flower's face, or else over its top (the proboscis reaching down onto it), facing it. The ones its body fits at,
 * the sides nearest `from` first and over the top last.
 */
export function hoverSpots(open, f, from) {
  const out = [];
  for (const [dx, dz] of FLAT) {
    const at = { x: f.x + 0.5 + dx * (0.5 + TONGUE), y: f.y + 0.42, z: f.z + 0.5 + dz * (0.5 + TONGUE) };
    if (!fits(open, at, BODY)) continue;
    out.push({ at, yaw: yawTo(-dx, -dz), top: false });
  }
  out.sort((p, q) => Math.hypot(p.at.x - from.x, p.at.z - from.z) - Math.hypot(q.at.x - from.x, q.at.z - from.z));
  if (open(f.x, f.y + 1, f.z)) {
    // Over the top, the proboscis tip over the flower's middle, facing the way it came from.
    const dx = f.x + 0.5 - from.x;
    const dz = f.z + 0.5 - from.z;
    const d = Math.hypot(dx, dz) || 1;
    const at = { x: f.x + 0.5 - (dx / d) * TONGUE, y: f.y + 1.03, z: f.z + 0.5 - (dz / d) * TONGUE };
    if (fits(open, at, BODY)) out.push({ at, yaw: yawTo(dx / d, dz / d), top: true });
  }
  return out;
}

export function flowerKey(f) {
  return key(f.x, f.y, f.z);
}

/**
 * The flower to go to next: it works its way round them, the nearest first, one of the `recent` it has visited only
 * when there's no other, and never straight back to the one it has just left (`fromFlower`: it's leaving that one now;
 * after a flit or a rest it may go back to it), nor one another moth is at (`used`). The flower, or undefined.
 */
export function pickFlower(flowers, here, recent, used, fromFlower = true) {
  const last = recent[recent.length - 1];
  const free = flowers.filter((f) => !used.has(flowerKey(f)) && !(fromFlower && flowerKey(f) === last));
  if (!free.length) return undefined;
  const fresh = free.filter((f) => !recent.includes(flowerKey(f)));
  const pool = fresh.length ? fresh : free;
  let best;
  let bestD = Infinity;
  for (const f of pool) {
    const d = Math.hypot(f.x + 0.5 - here.x, f.y + 0.5 - here.y, f.z + 0.5 - here.z);
    if (d < bestD) {
      best = f;
      bestD = d;
    }
  }
  return best;
}

// The flowers it has just visited, the newest last: `keep` of them (one fewer than there are flowers, so it always has
// one to go to).
export function remember(recent, k, keep) {
  const out = [...recent.filter((r) => r !== k), k];
  return out.slice(Math.max(0, out.length - Math.max(1, keep)));
}

// ---------------- its bouts ----------------

// Whether it's out and about: always in a dim house (and in the wild: the End has no day or night); in a bright one
// only at dusk and through the night (phase from mothRules.js phaseOf).
export function awake(dim, phase) {
  return dim || phase === "dusk" || phase === "night";
}

// What to do next while out (between hovers): "sip" at the feeder when it hasn't for a while (a chance once sipGap ticks
// have passed), "flower" when there's one to go to (flowerChance), else "flit" across the house.
export function flyingChoice({ nectar, sippedAgo, flower }, T, random = Math.random) {
  if (nectar && sippedAgo >= T.sipGap && random() < T.sipChance) return "sip";
  if (flower && random() < T.flowerChance) return "flower";
  return "flit";
}

// ---------------- resting on a wall ----------------

// Where it holds at rest on a spot (mothRules.js restSpots: an open block beside a whole block): against the wall
// (WALL_GAP off its face), a little over the block's floor, facing it.
export function restPos(spot) {
  return { x: spot.cell.x + 0.5 + spot.dir.x * (0.5 - WALL_GAP), y: spot.cell.y + 0.3, z: spot.cell.z + 0.5 + spot.dir.z * (0.5 - WALL_GAP), yaw: yawTo(spot.dir.x, spot.dir.z) };
}

// The wall spots of a house: open blocks restMin or more over the floor beside a whole block (`wallAt`: a wall or a
// face of end stone; never a chorus stalk, too thin to rest flat on), higher first. Each is { cell, dir, score }.
export function wallSpots(cells, wallAt, T, max = 4000) {
  const out = [];
  let n = 0;
  for (const [k] of cells) {
    if (++n > max) break;
    const [x, y, z] = k.split(",").map(Number);
    const h = heightAbove(cells, { x, y, z });
    if (h === undefined || h < T.restMin) continue;
    for (const [dx, dz] of FLAT) {
      if (cells.has(key(x + dx, y, z + dz)) || !wallAt(x + dx, y, z + dz)) continue;
      out.push({ cell: { x, y, z }, dir: { x: dx, z: dz }, score: h });
    }
  }
  return out.sort((p, q) => q.score - p.score);
}

// ---------------- sipping at a feeder ----------------

// The four sides of a Nectar Feeder at `pos` it can hover at to sip from the dish (its proboscis reaching it), facing
// it. The open ones only, nearest `from` first; `used` holds the sides taken.
export function dishSpots(open, pos, from, used = new Set()) {
  const out = [];
  for (const [dx, dz] of FLAT) {
    const at = { x: pos.x + 0.5 + dx * (0.5 + TONGUE * 0.8), y: pos.y + 0.52, z: pos.z + 0.5 + dz * (0.5 + TONGUE * 0.8) };
    const side = `${pos.x},${pos.y},${pos.z},${dx},${dz}`;
    if (used.has(side) || !fits(open, at, BODY)) continue;
    out.push({ at, yaw: yawTo(-dx, -dz), side });
  }
  return out.sort((p, q) => Math.hypot(p.at.x - from.x, p.at.z - from.z) - Math.hypot(q.at.x - from.x, q.at.z - from.z));
}

// ---------------- someone coming ----------------

// Someone who startles it: in Survival or Adventure (`vulnerable`), not sneaking, within `range` blocks of their body
// (feet `p` to head, BODY_TALL up: one at rest at head height beside them is startled, one up under a high roof isn't).
export const BODY_TALL = 1.8;
export function startles(p, at, range) {
  const y = Math.min(Math.max(at.y, p.y), p.y + BODY_TALL);
  return p.vulnerable && !p.sneaking && Math.hypot(p.x - at.x, y - at.y, p.z - at.z) <= range;
}

// ---------------- the wild ----------------

// Never out over the void: ground (any block but air, a liquid or unloaded) within `look` blocks under every point
// along the flight `pts`, a point about every block.
export function overGround(pts, read, look) {
  const ground = (c) => c !== "air" && c !== "water" && c !== "lava" && c !== "unloaded";
  const under = (p) => {
    const x = Math.floor(p.x);
    const z = Math.floor(p.z);
    const y = Math.floor(p.y + 0.01);
    for (let d = 0; d <= look; d++) if (ground(read(x, y - d, z))) return true;
    return false;
  };
  if (!pts.length) return true;
  if (!under(pts[0])) return false;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    const steps = Math.max(1, Math.ceil(len));
    for (let j = 1; j <= steps; j++) {
      const f = j / steps;
      if (!under({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f })) return false;
    }
  }
  return true;
}

// ---------------- caterpillars ----------------

// The chorus to crawl to next: a plant on the floor within `range` that no other caterpillar is at (`used`: the plants'
// block keys), nearest first. `spots` are the measure's [x, y, z, dx, dz] (the floor cell beside the plant, the way to
// it). Returns { cell, dir, plant } or undefined.
export function pickHost(spots, here, used, range) {
  let best;
  let bestD = Infinity;
  for (const [x, y, z, dx, dz] of spots) {
    const plant = key(x + dx, y, z + dz);
    if (used.has(plant)) continue;
    const d = Math.hypot(x + 0.5 - here.x, y - here.y, z + 0.5 - here.z);
    if (d > range || d >= bestD) continue;
    best = { cell: { x, y, z }, dir: { x: dx, z: dz }, plant };
    bestD = d;
  }
  return best;
}

// Where a caterpillar munches at the foot of a plant: on its floor block, a little toward the plant, facing it.
export function munchPos(host) {
  return { x: host.cell.x + 0.5 + host.dir.x * 0.18, y: host.cell.y, z: host.cell.z + 0.5 + host.dir.z * 0.18, yaw: yawTo(host.dir.x, host.dir.z) };
}

// ---------------- what a moth house needs ----------------

// The Exhibit Clipboard's lines for Chorus Moths: the chorus flowers, the Nectar Feeders, the light (the nocturnal
// house's test, animals/nightRules.js), the chorus on the floor.
export function chorusMothLines(ex, residents, nectarFeeders, species, T, balance) {
  const c = ex.chorus;
  const lines = [];
  if (!c) {
    lines.push("§fChorus flowers: §7not measured yet (put a Nectar Feeder inside, then measure with the Habitat Marker)");
    return lines;
  }
  const need = flowersNeeded(species, residents.filter((a) => !a.juvenile).length);
  lines.push(`§fChorus flowers: ${c.flowerCount >= need ? "§a" : "§c"}${c.flowerCount}§7 of ${need} (one for each moth, ${species.chorusFlowers.min} at least; any age, on end stone or a chorus plant, in the house or on its walls; too few and comfort can't rise above ${T.flowerComfortCap})`);
  lines.push(`§fNectar Feeders: ${nectarFeeders ? `§a${nectarFeeders}` : "§c0§7 (they eat only from a Nectar Feeder)"}`);
  if (species.lowLight && ex.house) {
    const h = ex.house;
    lines.push(isNocturnalHouse(ex, balance) ? `§fLow light: §ayes§7 (no daylight, brightest spot ${h.brightest} of ${h.max ?? balance.nocturnal.maxLight} allowed): out in bouts at any hour` : `§fLow light: §cno§7: ${houseProblems(h, balance).join("; ")}: they fly only at night, and comfort can't rise above ${T.dimComfortCap}. Fix it and measure again`);
  }
  const hosts = species.breeding?.hostPlants ?? 0;
  lines.push(`§fChorus on the floor: ${c.plants >= hosts ? "§a" : "§e"}${c.plants}§7 (${hosts} or more chorus plants or flowers standing on the floor, for the caterpillars; a moth lays her eggs only where there are)`);
  return lines;
}

// Care warnings for Chorus Moths. `dim` is whether the house is dim (undefined: not measured yet).
export function chorusMothWarnings(ex, residents, plural, species, T, dim) {
  const out = [];
  const moths = residents.filter((a) => !a.juvenile).length;
  if (ex.chorus && !hasChorusFlowers(species, ex, moths)) out.push({ severity: 2, text: `${plural} hover at chorus flowers to sip: ${flowersNeeded(species, moths)} or more inside (one for each, ${species.chorusFlowers.min} at least; ${ex.chorus.flowerCount} now), on end stone or a chorus plant. Comfort can't rise above ${T.flowerComfortCap} without them. Measure again with the Habitat Marker after.` });
  if (dim === false) out.push({ severity: 2, text: `${plural} want low light: no daylight on the floor and nothing brighter than the Nocturnal Lamps (purple suits them). In a bright house they fly only at night, and comfort can't rise above ${T.dimComfortCap}.` });
  const need = species.breeding?.hostPlants ?? 0;
  if (ex.breeding?.on && need && (ex.chorus?.plants ?? 0) < need) out.push({ severity: 1, text: `Breeding is on, but a moth lays her eggs only on chorus: ${need} or more chorus plants or flowers standing on the floor (${ex.chorus?.plants ?? 0} now).` });
  return out;
}

// The Field Journal's line on a wild one.
export function wildLine(T) {
  return `In the wild they live on the outer End islands where chorus grows, 2 to 4 together, out in bouts at any hour (the End has no day or night): a few minutes working from chorus flower to chorus flower, hovering at each to sip, then a rest on an end stone face with the wings folded into an arrowhead. Before each flight one shivers its wings warm. Hold a Nectar Ration within ${T.baitRange} blocks and one flies over to sip from it; walk right up to one at rest and it gives a quick shiver and flies off`;
}
