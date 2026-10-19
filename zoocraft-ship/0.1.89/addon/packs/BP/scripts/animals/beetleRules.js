// Quartz Beetles (0.1.89, the Nether pair's second; spec 5.3 "quartz_beetle | Chunky beetle with quartz plates |
// Burrows through mineral substrate | Heated cave, mineral bed"), pure: the beetle's day, the ground it buries itself
// in, a male's horn, the males' wrestling (who backs off, who wins, where they stand), the grubs, and what a cave
// needs. The game side is animals/beetle.js; the Mineral Substrate count is the walking measure's (exhibits/geometry.js
// summarize), the cave roof its cover.
// Sources (research/nether_facts.md, research/nether_pair_plan.md): rhinoceros beetles (Dynastinae) are night animals
// that spend the day dug into the soil or the litter, eat fruit and sap at night, and hiss by rubbing their wing covers
// on their abdomen when they're disturbed; two males that meet face off and shove, and the one that gets its horn under
// the other pries it up and flips it, so the loser falls off (the Japanese rhinoceros beetle; the longer horn usually
// wins, and a much smaller male backs off without a fight); the grubs live in the soil and feed in it, and pupate there
// in a cell, and the new beetle digs its way out.

import { yawTo, stepsAlong, rushTo } from "./grazerRules.js";

export { yawTo, stepsAlong, rushTo };

// The beetle mobs, found by type (0.1.70: never by family alone).
export const BEETLE_TYPES = ["zoocraft:quartz_beetle", "zoocraft:wild_quartz_beetle"];
export const WILD_BEETLE = "zoocraft:wild_quartz_beetle";

// What a beetle is doing (its zoocraft:act entity property): the client plays the matching animation (gen/beetle.py
// ACT_STATES) and the Field Journal watches for it. 0 is a grown beetle standing or walking where the engine takes it.
// "scurry" is the script moving it along (backing off, a chase, walking off); grub, peek, crawl and pupa are the young.
export const ACT = { none: 0, buried: 1, tunnel: 2, dig: 3, emerge: 4, eat: 5, hiss: 6, face: 7, shove: 8, pry: 9, flipped: 10, righting: 11, scurry: 12, grub: 13, peek: 14, crawl: 15, pupa: 16 };

// The acts it is buried in (the client draws it sunk into the block it stands on).
export const BURIED = [ACT.buried, ACT.tunnel, ACT.grub, ACT.pupa];

// ---------------- the day ----------------

// The part of its day (world.getTimeOfDay(): 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight): "dusk" it digs out
// and goes to the feeder, "night" out walking, eating and wrestling, "dawn" it digs back in, "day" buried. A dark cave
// (a nocturnal house) turns it a half-day round, so guests see it out by day.
export function phaseOf(t, T, house = false) {
  const p = T.phases;
  const time = (((t + (house ? 12000 : 0)) % 24000) + 24000) % 24000;
  const within = ([a, b]) => (a <= b ? time >= a && time < b : time >= a || time < b);
  if (within(p.dusk)) return "dusk";
  if (within(p.night)) return "night";
  if (within(p.dawn)) return "dawn";
  return "day";
}

// Out of the ground: dusk and night. Buried (or going to be): dawn and day.
export function isOut(phase) {
  return phase === "dusk" || phase === "night";
}

// ---------------- the ground ----------------

// What it buries itself in: Mineral Substrate in a zoo; a wild one in netherrack, soul soil, soul sand and gravel too
// (the entity files' seek_bed blocks).
const BED_ZOO = /^zoocraft:mineral_substrate$/;
const BED_WILD = /^(zoocraft:mineral_substrate|minecraft:(netherrack|soul_soil|soul_sand|gravel))$/;
export function burrowable(blockId, wild) {
  return (wild ? BED_WILD : BED_ZOO).test(blockId ?? "");
}

// The sound of digging into a block (Mojang's dig sounds; Mineral Substrate has gravel's).
export function digSound(blockId) {
  const m = /^minecraft:(netherrack|soul_soil|soul_sand)$/.exec(blockId ?? "");
  return m ? `dig.${m[1]}` : "dig.gravel";
}

// Somewhere else in the bed to tunnel to: one of `cells` ({ x, z }, the bed cells round it it could tunnel to in a
// straight line) between `near` and `far` blocks off, any of them; undefined if none.
export function pickTunnel(cells, here, near, far, random = Math.random) {
  const ok = cells.filter((c) => {
    const d = Math.hypot(c.x - here.x, c.z - here.z);
    return d >= near && d <= far;
  });
  return ok.length ? ok[Math.floor(random() * ok.length)] : undefined;
}

// ---------------- the males ----------------

// A male's horn (zoocraft:horn): 1 short, 2, 3 long; fixed for him, from his id (his zoo record's, or the mob's).
export function hornOf(id) {
  let h = 2166136261;
  for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 1274126177) >>> 0;
  return 1 + ((h >>> 0) % 3);
}

// Two grown males that meet: horns of a different size, a "standoff" (they face off, tapping horns, and the smaller
// backs off, chased a few blocks); matched, a "fight" (they face off, shove, and one pries the other up and flips it).
export function wrestleKind(hornA, hornB) {
  return hornA === hornB ? "fight" : "standoff";
}

// Who wins: the longer horn in a standoff; in a fight between matched horns, either.
export function winnerOf(hornA, hornB, random = Math.random) {
  if (hornA !== hornB) return hornA > hornB ? "a" : "b";
  return random() < 0.5 ? "a" : "b";
}

// Where two males face off: about their middle, `gap` blocks apart along the line between them, facing each other.
// a, b: { x, z }. Returns { a: { x, z, yaw }, b: { x, z, yaw } }.
export function facePlaces(a, b, gap) {
  const mx = (a.x + b.x) / 2;
  const mz = (a.z + b.z) / 2;
  let dx = b.x - a.x;
  let dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) {
    dx = 1;
    dz = 0;
  } else {
    dx /= len;
    dz /= len;
  }
  const h = gap / 2;
  return {
    a: { x: mx - dx * h, z: mz - dz * h, yaw: yawTo(dx, dz) },
    b: { x: mx + dx * h, z: mz + dz * h, yaw: yawTo(-dx, -dz) },
  };
}

// Where one going off from `other` goes: straight away from it, `far` blocks. Returns { x, z, yaw }.
export function awayFrom(from, other, far) {
  let dx = from.x - other.x;
  let dz = from.z - other.z;
  const len = Math.hypot(dx, dz);
  if (len < 1e-6) {
    dx = 1;
    dz = 0;
  } else {
    dx /= len;
    dz /= len;
  }
  return { x: from.x + dx * far, z: from.z + dz * far, yaw: yawTo(dx, dz) };
}

// Where one going off from `other` tries to go, in turn: straight away, `far` blocks (awayFrom), then turned 30, 60 and
// 90 degrees to either side, so a wall or a feeder in the way doesn't keep it where it is. Returns [{ x, z, yaw }].
export function awayTargets(from, other, far) {
  const straight = awayFrom(from, other, far);
  const dx = straight.x - from.x;
  const dz = straight.z - from.z;
  return [0, 30, -30, 60, -60, 90, -90].map((turn) => {
    const r = (turn * Math.PI) / 180;
    const x = dx * Math.cos(r) - dz * Math.sin(r);
    const z = dx * Math.sin(r) + dz * Math.cos(r);
    return { x: from.x + x, z: from.z + z, yaw: yawTo(x, z) };
  });
}

// The key of a pair of males, the same either way round.
export function pairKey(idA, idB) {
  return idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
}

// ---------------- the feeder ----------------

// The cells it can eat at a feeder from (the 8 round the feeder block `pos`, at its level, as tryEat looks), nearest `at`
// first. The feeder seek's goal_radius (gen/beetle.py) is under 1.5 so the engine's walk ends in one of them.
export function besideCells(pos, at) {
  const out = [];
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) if (dx || dz) out.push({ x: pos.x + dx, y: pos.y, z: pos.z + dz });
  const d = (c) => Math.hypot(c.x + 0.5 - at.x, c.z + 0.5 - at.z);
  return out.sort((p, q) => d(p) - d(q));
}

// ---------------- the grubs ----------------

// Where a grub hatches: of `cells` ([{ x, y, z }], the cells over the Mineral Substrate near its mother), the one nearest
// `near` that's not in `taken` (a Set of "x,y,z", where the other beetles lie), so no two lie in one cell; with every
// one taken, the nearest; undefined with none.
export function grubCell(cells, near, taken) {
  const d = (c) => (c.x + 0.5 - near.x) ** 2 + (c.y - Math.floor(near.y + 0.01)) ** 2 * 4 + (c.z + 0.5 - near.z) ** 2;
  const sorted = [...cells].sort((p, q) => d(p) - d(q));
  return sorted.find((c) => !taken.has(`${c.x},${c.y},${c.z}`)) ?? sorted[0];
}

// On its pupa days (the last breeding.pupaDays of growing up) a grub lies in its pupal cell in the substrate.
export function pupaNow(a, species) {
  const br = species.breeding;
  return Boolean(a.juvenile && br?.pupaDays && (a.juvenileDaysLeft ?? br.matureDays) <= br.pupaDays);
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live in the Nether wastes and basalt deltas, 1 to 3 together. By day they lie buried in netherrack, soul soil, soul sand or gravel, only the quartz-plated back showing; at night they come out to walk and eat, and two males that meet wrestle. Hold a Mineral Pellet or a nether quartz near one and it comes over; walk right up to one on its feet (within ${T.hissRange} blocks) and it rears and hisses, then digs itself in or walks off. It does no harm`;
}

// ---------------- what a cave needs ----------------

// Mineral Substrate enough (species.substrate.minCells blocks in the floor). An exhibit not measured for it yet passes.
export function hasSubstrate(species, ex) {
  if (!species.substrate || ex.substrateCells === undefined) return true;
  return ex.substrateCells >= species.substrate.minCells;
}

// The Exhibit Clipboard's lines for Quartz Beetles: the Mineral Substrate, the cave roof, the grubs.
export function beetleLines(ex, residents, species, coverNeed) {
  const lines = [];
  const need = species.substrate.minCells;
  const eggs = species.breeding?.substrate ?? need;
  if (ex.substrateCells === undefined) lines.push("§fMineral Substrate: §7not measured yet: use the Habitat Marker on the ground inside again");
  else lines.push(`§fMineral Substrate: ${ex.substrateCells >= need ? "§a" : "§c"}${ex.substrateCells}§7 of ${need} blocks to bury themselves in by day${ex.substrateCells < eggs ? ` (a female lays her eggs only with ${eggs} or more)` : ""}`);
  if (ex.coveredCells !== undefined) lines.push(`§fCave roof: ${ex.coveredCells >= coverNeed ? "§a" : "§e"}${ex.coveredCells}§7 of ${ex.usableArea} blocks of floor roofed over (${coverNeed} wanted)`);
  const grubs = residents.filter((a) => a.juvenile).length;
  if (grubs) lines.push(`§fGrubs: §7${grubs} in the substrate`);
  return lines;
}

// Care warnings for Quartz Beetles: Mineral Substrate to bury themselves in, and for the grubs while breeding is on.
export function beetleWarnings(ex, residents, plural, species, T) {
  const out = [];
  const need = species.substrate.minCells;
  if (ex.substrateCells !== undefined && ex.substrateCells < need) out.push({ severity: 2, text: `${plural} bury themselves in Mineral Substrate by day: at least ${need} blocks in the floor (${ex.substrateCells} now; comfort can't rise above ${T.bedComfortCap} without it). Craft it from gravel, a nether quartz and bone meal.` });
  const eggs = species.breeding?.substrate ?? 0;
  if (ex.breeding?.on && eggs && (ex.substrateCells ?? 0) < eggs) out.push({ severity: 1, text: `Breeding is on, but a female lays her eggs only in Mineral Substrate: ${eggs} or more blocks in the floor (${ex.substrateCells ?? 0} now). The grubs live and feed in it.` });
  return out;
}
