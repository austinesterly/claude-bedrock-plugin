// Soul Moths (0.1.88, the Nether pair's first; spec 5.3 "soul_moth | Pale blue moth | Gathers around soul light |
// Enclosed airspace, soul lights, nectar"), pure: the moth's day, the soul lights and the host plants in a moth house,
// the circle it flies round a light, the wall spots it rests on, where it hovers to sip, and what a moth house needs.
// The game side is animals/moth.js; the house's air is the flight measure's (exhibits/geometry.js floodAerial), as for
// owls and Void Rays.
// Sources (research/nether_facts.md, research/nether_pair_plan.md): hawk moths (Sphingidae) fly at dusk and through
// the night, hover at flowers and sip nectar through a long proboscis, and rest by day on bark and walls with their
// wings swept back; at a light they keep their backs turned toward it (the dorsal light response), so they circle it
// (orbiting), climb steeply under it until they stall, or flip over above it (inversion) (Fabian et al. 2024, Nature
// Communications). The eyed hawk-moth flashes the eyespots on its hindwings when disturbed. Hornworm caterpillars eat
// the leaves of their host plants, then burrow into the soil to pupate, and the new moth pumps its wings out.

import { yawTo } from "./zebraRules.js";
import { heightAbove } from "./owlRules.js";

// The moth mobs, found by type (0.1.70: never by family alone).
export const MOTH_TYPES = ["zoocraft:soul_moth", "zoocraft:wild_soul_moth"];
export const WILD_MOTH = "zoocraft:wild_soul_moth";

// What a moth is doing (its zoocraft:act entity property): the client plays the matching animation (gen/moth.py
// ACT_STATES) and the Field Journal watches for it. 0 is a grown moth settled on the ground (a caterpillar: still).
export const ACT = { none: 0, fly: 1, rest: 2, flash: 3, orbit_l: 4, orbit_r: 5, stall: 6, invert: 7, sip: 8, emerge: 9, crawl: 10, munch: 11, burrow: 12, pupa: 13 };

// At rest up a wall, its position is this far (blocks) from the wall's face: half its collision box. The model draws
// it the rest of the way in (gen/moth.py WALL_IN).
export const WALL_GAP = 0.2;

// Its body round its position (blocks): a female's collision box (0.4 across, 0.3 up) and a hair more.
export const BODY = { half: 0.22, height: 0.32 };

const key = (x, y, z) => `${x},${y},${z}`;

// The part of its day (world.getTimeOfDay(): 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight): "dusk" out to the
// feeder, "night" at the lights, "dawn" back to a wall, "day" at rest. A moth house turns it a half-day round.
export function phaseOf(t, T, house = false) {
  const p = T.phases;
  const time = (((t + (house ? 12000 : 0)) % 24000) + 24000) % 24000;
  const within = ([a, b]) => (a <= b ? time >= a && time < b : time >= a || time < b);
  if (within(p.dusk)) return "dusk";
  if (within(p.night)) return "night";
  if (within(p.dawn)) return "dawn";
  return "day";
}

// ---------------- soul lights and host plants ----------------

const SOUL_LIGHTS = ["minecraft:soul_torch", "minecraft:soul_lantern", "minecraft:soul_campfire", "minecraft:soul_fire"];
// The caterpillars' host plants: the Nether's small plants, growing in the floor.
export const HOST_PLANTS = ["minecraft:crimson_roots", "minecraft:warped_roots", "minecraft:nether_sprouts", "minecraft:crimson_fungus", "minecraft:warped_fungus"];

export function isSoulLight(id) {
  return SOUL_LIGHTS.includes(id);
}

export function isHostPlant(id) {
  return HOST_PLANTS.includes(id);
}

// Where a soul light sits for a moth circling it: "above" it (a lantern hanging from the ceiling: it circles below and
// stalls climbing to it), "below" (a campfire, fire, a lantern or a torch standing on the floor: it circles above and
// flips over), or "wall" (a torch on a wall: it circles in front of it). Undefined when it isn't lit soul light (a soul
// campfire put out). `states` are the block's states (@minecraft/vanilla-data 1.26.52: a soul lantern's hanging, a
// soul campfire's extinguished, a soul torch's torch_facing_direction: "top" standing, "unknown" read as standing, or
// a side when it's on a wall).
export function lightKind(id, states = {}) {
  if (id === "minecraft:soul_lantern") return states.hanging ? "above" : "below";
  if (id === "minecraft:soul_campfire") return states.extinguished ? undefined : "below";
  if (id === "minecraft:soul_fire") return "below";
  if (id === "minecraft:soul_torch") return ["west", "east", "north", "south"].includes(states.torch_facing_direction) ? "wall" : "below";
  return undefined;
}

export function newMothResult() {
  return { lights: [], plants: 0, plantSpots: [] };
}

const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/**
 * The soul lights and host plants of a moth house, from its flight measure's cells. A soul torch and the plants are
 * open blocks, so they're in the cells (a plant only counts on the floor, a "land" cell); a lantern, a campfire and fire
 * are blocks the air stops at, so the cells' neighbours are read for them. Each light is { x, y, z, kind } (lightKind);
 * the first `opts.keep` plant blocks are kept. `typeAt(x, y, z)` gives { id, states } for a block, or undefined
 * unloaded. A generator, a slice of `opts.cellsPerYield` reads at a time.
 * @param {(x: number, y: number, z: number) => ({ id: string, states?: any } | undefined)} typeAt
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {ReturnType<typeof newMothResult>} out
 */
export function* measureMoth(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  const tick = function* () {
    if (++n % opts.cellsPerYield === 0) yield;
  };
  const light = (x, y, z, b) => {
    const kind = b && lightKind(b.id, b.states);
    if (kind) out.lights.push({ x, y, z, kind });
  };
  for (const [k, kind] of cells) {
    const [x, y, z] = k.split(",").map(Number);
    const b = typeAt(x, y, z);
    yield* tick();
    if (b && b.id === "minecraft:soul_torch") light(x, y, z, b);
    if (b && kind === "land" && isHostPlant(b.id)) {
      out.plants++;
      if (out.plantSpots.length < opts.keep) out.plantSpots.push([x, y, z]);
    }
    for (const [dx, dy, dz] of SIDES) {
      const nk = key(x + dx, y + dy, z + dz);
      if (cells.has(nk) || seen.has(nk)) continue;
      seen.add(nk);
      const nb = typeAt(x + dx, y + dy, z + dz);
      yield* tick();
      if (nb && nb.id !== "minecraft:soul_torch") light(x + dx, y + dy, z + dz, nb);
    }
  }
}

// Soul light enough (species.soulLight): one or more in the measured house. An exhibit not measured yet passes.
export function hasSoulLight(species, ex) {
  if (!species.soulLight || ex.soul === undefined) return true;
  return ex.soul.lights.length >= 1;
}

// Host plants enough for the caterpillars (breeding.hostPlants of them in the floor).
export function hasHostPlants(species, ex) {
  const need = species.breeding?.hostPlants;
  return !need || (ex.soul?.plants ?? 0) >= need;
}

// ---------------- the circle round a light ----------------

// Does its body fit at `p` (open blocks round its position and at the top of it)?
export function fits(open, p, body = BODY) {
  for (const oy of [0.02, body.height]) {
    for (const [ox, oz] of [[-body.half, -body.half], [body.half, -body.half], [-body.half, body.half], [body.half, body.half]]) {
      if (!open(Math.floor(p.x + ox), Math.floor(p.y + oy), Math.floor(p.z + oz))) return false;
    }
  }
  return true;
}

// The point at angle `a` (radians) round the circle `o`.
export function orbitAt(o, a, dy = 0) {
  return { x: o.c.x + o.r * Math.cos(a), y: o.c.y + dy, z: o.c.z + o.r * Math.sin(a) };
}

function circleFits(open, o, dy, steps = 16) {
  for (let i = 0; i < steps; i++) if (!fits(open, orbitAt(o, (i / steps) * Math.PI * 2, dy))) return false;
  return true;
}

/**
 * The circle a moth flies round the soul light `light` ({ x, y, z, kind }): its middle `c`, radius `r` (the widest of
 * T.orbitRadius that fits the open air, down to the narrowest), and whether it can stall (circling under a light above
 * it: room T.stallRise higher) or flip over (above one below it: room T.invertDrop lower). Below a hanging light it
 * circles T.under blocks down; over one on the floor T.over up; a wall torch's circle stands T.out out from the wall,
 * level with it. Undefined when no circle fits.
 */
export function orbitFor(open, light, T) {
  const centres = [];
  if (light.kind === "above") centres.push({ x: light.x + 0.5, y: light.y - T.under, z: light.z + 0.5 });
  else if (light.kind === "below") centres.push({ x: light.x + 0.5, y: light.y + T.over, z: light.z + 0.5 });
  else {
    // A wall torch: out from the wall, the way that's open with a block behind it the other way.
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (open(light.x + dx, light.y, light.z + dz) && !open(light.x - dx, light.y, light.z - dz)) centres.push({ x: light.x + 0.5 + dx * T.out, y: light.y + 0.1, z: light.z + 0.5 + dz * T.out });
    }
  }
  for (const c of centres) {
    for (let r = T.orbitRadius[1]; r >= T.orbitRadius[0] - 1e-9; r -= 0.1) {
      const o = { c, r: Math.round(r * 100) / 100, kind: light.kind, light: { x: light.x, y: light.y, z: light.z } };
      if (!circleFits(open, o, 0)) continue;
      return { ...o, stall: light.kind === "above" && circleFits(open, o, T.stallRise), invert: light.kind === "below" && circleFits(open, o, -T.invertDrop) };
    }
  }
  return undefined;
}

// The angle of the point on the circle nearest `p`.
export function angleOf(o, p) {
  return Math.atan2(p.z - o.c.z, p.x - o.c.x);
}

// Flying round with the angle growing (`dir` 1) the light is on its right; the other way (-1), on its left. It banks
// with its back toward the light: orbit_r or orbit_l.
export function orbitAct(dir) {
  return dir > 0 ? ACT.orbit_r : ACT.orbit_l;
}

// The way it faces at angle `a` going round `dir`.
export function orbitYaw(a, dir) {
  return yawTo(-Math.sin(a) * dir, Math.cos(a) * dir);
}

// Which way round to go: the way the others at this light already go (so they never meet head on), else either.
export function orbitDir(others, random = Math.random) {
  if (others.length) return others[0];
  return random() < 0.5 ? 1 : -1;
}

// Where on the circle to join: the point nearest it, moved round to the middle of the widest gap if another moth is
// within `gap` radians of it (several moths share a light, spread round the circle).
export function joinAngle(o, from, taken, gap = 1) {
  const a = angleOf(o, from);
  const tau = Math.PI * 2;
  const off = (x, y) => Math.abs(((((x - y) % tau) + tau * 1.5) % tau) - Math.PI);
  if (!taken.length || taken.every((t) => off(t, a) >= gap)) return a;
  const sorted = [...taken].map((t) => ((t % tau) + tau) % tau).sort((x, y) => x - y);
  let best = sorted[0] + Math.PI;
  let width = 0;
  for (let i = 0; i < sorted.length; i++) {
    const s = sorted[i];
    const e = i + 1 < sorted.length ? sorted[i + 1] : sorted[0] + tau;
    if (e - s > width) {
      width = e - s;
      best = s + (e - s) / 2;
    }
  }
  return best;
}

// Whether `p` (where one hovers or rests) is on the circle `o`, in the way of those going round it.
export function onCircle(o, p, slack = 0.4) {
  return Math.abs(Math.hypot(p.x - o.c.x, p.z - o.c.z) - o.r) < slack && Math.abs(p.y - o.c.y) < slack + 0.1;
}

// How fast it may go round its circle of radius `r` (blocks a tick, `speed` at most): it keeps `gap` blocks behind the
// next one ahead going round the same way `dir` (`angles`: the others' angles on the circle), slowing as it closes and
// stopped at half `gap`, so it never runs into the back of one slowed by a stall or an inversion, or of one it came in
// beside, and goes round on top of it.
export function orbitPace(a, dir, r, angles, speed, gap) {
  const tau = Math.PI * 2;
  let ahead = Infinity;
  for (const b of angles) {
    const d = ((((b - a) * dir) % tau) + tau) % tau;
    if (d > 0) ahead = Math.min(ahead, d * r);
  }
  return speed * Math.min(1, Math.max(0, (ahead - gap / 2) / (gap / 2)));
}

// The rise and fall of a stall (`f` 0 to 1 through it): up toward the light, a hang, back down.
export function stallLift(f, T) {
  return Math.sin(Math.min(1, Math.max(0, f)) * Math.PI) * T.stallRise;
}

// The drop of an inversion (`f` 0 to 1 through it): it flips and falls, then climbs back.
export function invertDrop(f, T) {
  return -Math.sin(Math.min(1, Math.max(0, f)) * Math.PI) * T.invertDrop;
}

// ---------------- resting on a wall ----------------

/**
 * The spots up a wall a moth can rest on in its house: an open block beside a wall block (a whole block it can hold
 * to, `wallAt`) T.restMin or more over the floor. Each is { cell, dir (toward the wall), score }: higher up scores
 * more, and within T.lightNear of a soul light T.lightBonus more. At most `max` are looked at.
 */
export function restSpots(cells, wallAt, lights, T, max = 4000) {
  const out = [];
  let n = 0;
  for (const [k] of cells) {
    if (++n > max) break;
    const [x, y, z] = k.split(",").map(Number);
    const h = heightAbove(cells, { x, y, z });
    if (h === undefined || h < T.restMin) continue;
    const near = lights.some((l) => Math.hypot(l.x - x, l.y - y, l.z - z) <= T.lightNear);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (cells.has(key(x + dx, y, z + dz)) || !wallAt(x + dx, y, z + dz)) continue;
      out.push({ cell: { x, y, z }, dir: { x: dx, z: dz }, score: h + (near ? T.lightBonus : 0) });
    }
  }
  return out.sort((p, q) => q.score - p.score);
}

// Where it holds at rest on a spot: against the wall (WALL_GAP off its face), a little over the block's floor, facing it.
export function restPos(spot) {
  return { x: spot.cell.x + 0.5 + spot.dir.x * (0.5 - WALL_GAP), y: spot.cell.y + 0.3, z: spot.cell.z + 0.5 + spot.dir.z * (0.5 - WALL_GAP), yaw: yawTo(spot.dir.x, spot.dir.z) };
}

export function spotKey(spot) {
  return `${spot.cell.x},${spot.cell.y},${spot.cell.z},${spot.dir.x},${spot.dir.z}`;
}

// One of the best free spots (the top `top` by score, any of them), or undefined.
export function pickRest(spots, used, top = 6, random = Math.random) {
  const free = spots.filter((s) => !used.has(spotKey(s))).slice(0, top);
  return free.length ? free[Math.floor(random() * free.length)] : undefined;
}

// ---------------- sipping ----------------

// The four sides of a Nectar Feeder at `pos` it can hover at to sip from the dish: the hover point (its proboscis
// reaches the dish), facing it. The open ones only, nearest `from` first; `used` holds the sides taken.
export function sipSpots(open, pos, from, used = new Set()) {
  const out = [];
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const at = { x: pos.x + 0.5 + dx * 0.78, y: pos.y + 0.52, z: pos.z + 0.5 + dz * 0.78 };
    const side = `${pos.x},${pos.y},${pos.z},${dx},${dz}`;
    if (used.has(side) || !fits(open, at)) continue;
    out.push({ at, yaw: yawTo(-dx, -dz), side });
  }
  return out.sort((p, q) => Math.hypot(p.at.x - from.x, p.at.z - from.z) - Math.hypot(q.at.x - from.x, q.at.z - from.z));
}

// In front of someone holding a Nectar Ration: `gap` blocks from them toward the moth, at the height of their hands.
export function besideHand(p, m, gap) {
  const dx = m.x - p.x;
  const dz = m.z - p.z;
  const d = Math.hypot(dx, dz) || 1;
  return { x: p.x + (dx / d) * gap, y: p.y + 1.1, z: p.z + (dz / d) * gap };
}

// Round someone's hands, `gap` out at their hands' height: toward the moth first, then further round either way, an
// eighth of a turn at a time (a pillar or a wall beside them in the way, 0.1.90).
export function handSpots(p, m, gap) {
  const a0 = Math.atan2(m.z - p.z, m.x - p.x);
  return [0, 1, -1, 2, -2, 3, -3, 4].map((k) => {
    const a = a0 + (k * Math.PI) / 4;
    return { x: p.x + Math.cos(a) * gap, y: p.y + 1.1, z: p.z + Math.sin(a) * gap };
  });
}

// What to do next at night (dusk: the feeder first): "sip" while there's nectar and it hasn't sipped for a while,
// "orbit" with a light to go to, else "flit".
export function nightChoice({ dusk, nectar, sippedAgo, light }, T, random = Math.random) {
  if (nectar && (dusk ? sippedAgo >= T.sipGap / 2 : sippedAgo >= T.sipGap && random() < T.sipChance)) return "sip";
  if (light && random() < T.orbitChance) return "orbit";
  return "flit";
}

// ---------------- caterpillars ----------------

// On its pupa days (the last breeding.pupaDays of growing up) a caterpillar is a pupa in the floor.
export function pupaNow(a, species) {
  const br = species.breeding;
  return Boolean(a.juvenile && br?.pupaDays && (a.juvenileDaysLeft ?? br.matureDays) <= br.pupaDays);
}

// The host plant to crawl to next: one within `range` of it that no other caterpillar is at, nearest first.
export function pickPlant(spots, here, used, range) {
  let best;
  let bestD = Infinity;
  for (const [x, y, z] of spots) {
    if (used.has(key(x, y, z))) continue;
    const d = Math.hypot(x + 0.5 - here.x, y - here.y, z + 0.5 - here.z);
    if (d > range || d < 0.4 || d >= bestD) continue;
    best = { x, y, z };
    bestD = d;
  }
  return best;
}

// ---------------- what a moth house needs ----------------

// The Exhibit Clipboard's lines for Soul Moths: the soul lights, the Nectar Feeders, the host plants.
export function mothLines(ex, residents, nectarFeeders, species, T) {
  const s = ex.soul;
  const need = species.breeding?.hostPlants ?? 0;
  const lines = [];
  if (!s) {
    lines.push("§fSoul lights: §7not measured yet (put a Nectar Feeder inside, then measure with the Habitat Marker)");
    return lines;
  }
  const kinds = { above: 0, below: 0, wall: 0 };
  for (const l of s.lights) kinds[l.kind]++;
  const which = [kinds.above ? `${kinds.above} hanging` : "", kinds.below ? `${kinds.below} standing` : "", kinds.wall ? `${kinds.wall} on the walls` : ""].filter(Boolean).join(", ");
  lines.push(`§fSoul lights: ${s.lights.length ? `§a${s.lights.length}§7 (${which})` : `§c0§7 (a soul lantern, soul torch, soul campfire or soul fire inside; without one comfort can't rise above ${T.soulComfortCap})`}`);
  lines.push(`§fNectar Feeders: ${nectarFeeders ? `§a${nectarFeeders}` : "§c0§7 (they sip only from a Nectar Feeder)"}`);
  lines.push(`§fHost plants: ${s.plants >= need ? "§a" : "§e"}${s.plants}§7 (${need} or more Nether roots, sprouts or fungi in the floor, for the caterpillars; a moth lays her eggs only where there are)`);
  return lines;
}

// Care warnings for Soul Moths.
export function mothWarnings(ex, residents, plural, species, T) {
  const out = [];
  if (ex.soul && !ex.soul.lights.length) out.push({ severity: 2, text: `${plural} gather round soul light: put a soul lantern, soul torch or soul campfire inside (comfort can't rise above ${T.soulComfortCap} without one). Measure again with the Habitat Marker after.` });
  const need = species.breeding?.hostPlants ?? 0;
  if (ex.breeding?.on && need && (ex.soul?.plants ?? 0) < need) out.push({ severity: 1, text: `Breeding is on, but a moth lays her eggs only on host plants: ${need} or more crimson or warped roots, nether sprouts or fungi in the floor (${ex.soul?.plants ?? 0} now).` });
  return out;
}

// The Field Journal's line on a wild one.
export function wildLine(T) {
  return `In the wild they live in soul sand valleys, 2 to 4 together. At night they circle the soul fire burning on the soul soil; by day they rest flat against a basalt pillar or the valley wall, wings swept back. Hold a Nectar Ration within ${T.baitRange} blocks and one flies over to hover and sip from it; walk right up to one at rest and it flashes its eyespots at you and flies off`;
}
