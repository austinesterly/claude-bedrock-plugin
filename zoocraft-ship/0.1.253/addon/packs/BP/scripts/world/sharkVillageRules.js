// The Shark People's cave villages (0.1.241; by the square since 0.1.253): where they are. Austin, 2026-11-10: "shark
// people as the enemy mob, they can also have little cave villages in these biomes". The world builds them as it
// generates (BP structures/zoocraft/shark_*.mcstructure, placed by feature_rules/formation_shark_*_rule.json): each
// square of the map has one place for a village, a plaza with a soul campfire in one chunk and a hut in each of the
// four chunks beside it, and each building is only built if a hall of the Exotic Formation is open and high enough
// right there. Where the places are is whole-number arithmetic on the square, so this file repeats it. No engine
// calls here: the tests run it against the world's own files.
import { BALANCE } from "../data/balance.js";
import { mod } from "./formationRules.js";

const F = BALANCE.formation;
const V = BALANCE.sharkVillage;
/** The huts round the plaza: which side they stand on, the chunk beside the plaza's, and the column in that chunk. */
export const HUT_SIDES = [
  { side: "west", chunk: [-1, 0], local: [10, 8] },
  { side: "east", chunk: [1, 0], local: [6, 8] },
  { side: "north", chunk: [0, -1], local: [8, 10] },
  { side: "south", chunk: [0, 1], local: [8, 6] },
];

/**
 * The village place of square (i, j): { plaza: { x, z }, huts: [{ side, kind, x, z }] }, each the middle column of a
 * 9 by 9 building. A building is only there if a hall is open and high enough at its place and nothing else (a goo
 * pit, a geode) is in its way.
 */
export function villageIn(i, j) {
  const chunks = F.cell / 16;
  // the plaza's chunk: picked by the square, at least two chunks in from its edge, so the huts stay in the square
  const cx = i * chunks + V.inset + mod(i * 5 + j * 3, chunks - 2 * V.inset);
  const cz = j * chunks + V.inset + mod(i * 3 + j * 7 + 1, chunks - 2 * V.inset);
  const store = mod(i * 3 + j * 5, 4); // one hut is the storehouse
  return {
    plaza: { x: cx * 16 + V.plazaLocal[0], z: cz * 16 + V.plazaLocal[1] },
    huts: HUT_SIDES.map((h, k) => ({ side: h.side, kind: k === store ? "store" : "home", x: (cx + h.chunk[0]) * 16 + h.local[0], z: (cz + h.chunk[1]) * 16 + h.local[1] })),
  };
}

/** A place on the plaza for a Shark Person: a ring round the campfire, clear of it and its four posts. */
export function plazaSpot(village, r1, r2) {
  const a = r1 * Math.PI * 2;
  const d = V.guard[0] + r2 * (V.guard[1] - V.guard[0]);
  return { x: Math.floor(village.plaza.x + 0.5 + Math.cos(a) * d), z: Math.floor(village.plaza.z + 0.5 + Math.sin(a) * d) };
}

/** Whether a column is inside one of the village's huts (roofs are no place to put a Shark Person down). */
export function inHut(village, x, z) {
  return village.huts.some((h) => Math.max(Math.abs(x - h.x), Math.abs(z - h.z)) <= V.half);
}
