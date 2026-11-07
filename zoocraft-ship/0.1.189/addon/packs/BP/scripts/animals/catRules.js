// Ocelots and cats (0.1.189, module 12; research/vanilla_plan.md "0.1.189 ocelots and cats: the design"): the rules, kept
// apart from the game so the tests can run them.
// - Shy until they trust: a caught one runs from players (the game's avoid goal) until one feeds it raw cod or salmon (the
//   game's trusting, one time in three); then the zoo copy's zoocraft:on_trust event, the record keeps it (animals/cats.js)
//   and the mob trusts again wherever it's put. One born in the zoo trusts from the start.
// - Resting spots: an ocelot rests up on a log (one for each), a cat sits on a chest, the foot of a bed or a lit furnace
//   (one for each 2: the game's tamed cats' places). The copies' own goals take them there (entities/zoo_ocelot.json and
//   zoo_cat.json move_to_block), and a cat that sits down by a seat is moved onto its middle (seatFor, animals/cats.js);
//   the measure counts the ones they can get onto: under the floor they walk, or beside it at their feet with open air
//   over it.

// What the copies' goals go to (the entities' move_to_block target_blocks; a test holds them equal).
const WOODS = ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak", "mangrove", "cherry", "pale_oak"];
export const OCELOT_LOGS = [...WOODS.map((w) => `minecraft:${w}_log`), ...WOODS.map((w) => `minecraft:stripped_${w}_log`)];
export const CAT_SEATS = ["minecraft:chest", "minecraft:bed", "minecraft:lit_furnace"];
export const COLD_FURNACE = "minecraft:furnace";
export const TRUSTS = "zoocraft:trusts"; // the copies' property: it trusts people
export const SITTING = "zoocraft:sitting"; // the cat's: sitting on a seat

const LOG_SET = new Set(OCELOT_LOGS);

export function newRestResult() {
  return { logs: 0, seats: 0, chests: 0, beds: 0, furnaces: 0, coldFurnaces: 0, spots: [] };
}

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const key = (x, y, z) => `${x},${y},${z}`;

// One block a cat or ocelot could rest on: what it is, or undefined. A bed counts by its foot (the half a cat sits on),
// so a bed is one seat.
function restKind(b) {
  const id = b?.id;
  if (!id) return undefined;
  if (LOG_SET.has(id)) return "log";
  if (id === "minecraft:chest") return "chest";
  if (id === "minecraft:bed") return b.states?.head_piece_bit === true ? undefined : "bed";
  if (id === "minecraft:lit_furnace") return "furnace";
  if (id === COLD_FURNACE) return "cold";
  return undefined;
}

// The logs and seats of a walking measure's floor. typeAt(x, y, z) gives the block's { id, states } (states for beds);
// cells are the standing cells (feet), keys "x,y,z". A block counts once, under a cell or beside one at its feet with
// air (or a cell) over it.
/** @param {(x: number, y: number, z: number) => ({ id: string, states?: Record<string, unknown> } | undefined)} typeAt */
export function* measureRest(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  const look = (x, y, z, needOpen) => {
    const k = key(x, y, z);
    if (seen.has(k)) return;
    seen.add(k);
    const kind = restKind(typeAt(x, y, z));
    if (!kind) return;
    if (needOpen && !cells.has(key(x, y + 1, z)) && typeAt(x, y + 1, z)?.id !== "minecraft:air") return;
    if (kind === "log") out.logs++;
    else if (kind === "cold") out.coldFurnaces++;
    else {
      out.seats++;
      if (kind === "chest") out.chests++;
      else if (kind === "bed") out.beds++;
      else out.furnaces++;
    }
    if (kind !== "cold" && out.spots.length < opts.keep) out.spots.push({ x, y, z });
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++n % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    look(x, y - 1, z, false);
    for (const [dx, dz] of SIDES) look(x + dx, y, z + dz, true);
  }
  return out;
}

// Where a cat sits on a seat: the goal that takes it there stops it at the edge (its goal radius from the block over the
// middle; the test server: a cat 0.7 across from a chest's middle, standing half over the floor), so once it sits the
// script moves it onto the middle (animals/cats.js). The heights it sits at: Bedrock's chest is 0.95 high (the test
// server: a cat on one stood at 0.95), a bed 0.5625, a furnace a full block.
export const SEAT_TOP = { "minecraft:chest": 0.95, "minecraft:bed": 0.5625, "minecraft:lit_furnace": 1 };
const SEAT_KINDS = ["chest", "bed", "furnace"];
export const BED_ONLY = ["bed"];

// The seat a cat that has just sat down is by: the nearest chest, bed (its foot) or lit furnace with air over it whose
// middle is within T.seatReach blocks across of the cat, level with its feet or just under them. on: it's on the middle of
// it already. undefined: none (it sat down away from a seat). kinds: the seats looked for (the bed hop: beds only).
/** @param {(x: number, y: number, z: number) => ({ id: string, states?: Record<string, unknown> } | undefined)} typeAt @param {{ x: number, y: number, z: number }} at @param {{ seatReach: number }} T */
export function seatFor(typeAt, at, T, kinds = SEAT_KINDS) {
  const fx = Math.floor(at.x);
  const fy = Math.floor(at.y);
  const fz = Math.floor(at.z);
  const reach = Math.ceil(T.seatReach);
  let best;
  for (let dx = -reach; dx <= reach; dx++)
    for (let dz = -reach; dz <= reach; dz++)
      for (const y of [fy, fy - 1]) {
        const x = fx + dx;
        const z = fz + dz;
        const b = typeAt(x, y, z);
        const kind = restKind(b);
        if (!kinds.includes(kind)) continue;
        if (typeAt(x, y + 1, z)?.id !== "minecraft:air") continue;
        const d = Math.hypot(at.x - (x + 0.5), at.z - (z + 0.5));
        if (d > T.seatReach || (best && d >= best.d)) continue;
        best = { x, y, z, d, top: SEAT_TOP[b.id] };
      }
  if (!best) return undefined;
  return { x: best.x, y: best.y, z: best.z, top: best.top, on: best.d <= 0.25 && Math.abs(at.y - (best.y + best.top)) < 0.2 };
}

// How many it needs: a log for each ocelot, a seat for each 2 cats (species.restSpots), at least one.
export function restNeeded(species, n) {
  if (!species.restSpots) return 0;
  return Math.max(1, Math.ceil(Math.max(1, n) / species.restSpots.per));
}

export function restHave(species, ex) {
  if (!species.restSpots || !ex.cats) return 0;
  return species.restSpots.kind === "log" ? ex.cats.logs : ex.cats.seats;
}

// Enough of them (cause "restSpots"). Not measured yet: passes.
export function hasRestSpots(species, ex, n) {
  if (!species.restSpots || ex.cats === undefined) return true;
  return restHave(species, ex) >= restNeeded(species, n);
}

export function restWarnings(ex, n, plural, species, T) {
  if (!species.restSpots || !ex.cats || hasRestSpots(species, ex, n)) return [];
  const need = restNeeded(species, n);
  const have = restHave(species, ex);
  if (species.restSpots.kind === "log")
    return [{ severity: 2, text: `${plural} rest up on a log: a log (or stripped log) on the floor for each, with open air over it to lie on (${need} needed, ${have} now). Until then comfort can't rise above ${T.restComfortCap}. Measure again with the Habitat Marker after.` }];
  const cold = ex.cats.coldFurnaces ? ` (${ex.cats.coldFurnaces} cold furnace${ex.cats.coldFurnaces === 1 ? "" : "s"}: a cat sits on one only while it burns)` : "";
  return [{ severity: 2, text: `${plural} sit up on things: a chest, a bed or a lit furnace for each ${species.restSpots.per}, with open air over it (${need} needed, ${have} now${cold}). Until then comfort can't rise above ${T.restComfortCap}. Measure again with the Habitat Marker after.` }];
}

// The Exhibit Clipboard's lines: the resting spots, and how many trust people.
export function catLines(ex, residents, species, T) {
  const lines = [];
  const grown = residents.filter((a) => !a.juvenile).length;
  if (!ex.cats) lines.push(`§f${species.restSpots.kind === "log" ? "Logs to rest on" : "Seats"}: §7not measured yet (use the Habitat Marker on the floor inside)`);
  else {
    const need = restNeeded(species, grown || residents.length);
    const have = restHave(species, ex);
    const what = species.restSpots.kind === "log" ? "Logs to rest on" : "Seats (chest, bed, lit furnace)";
    lines.push(`§f${what}: ${have >= need ? "§a" : "§e"}${have}§7 of ${need} needed${species.restSpots.kind !== "log" && ex.cats.coldFurnaces ? `, ${ex.cats.coldFurnaces} furnace${ex.cats.coldFurnaces === 1 ? "" : "s"} not lit` : ""}`);
  }
  if (residents.length) {
    const trusting = residents.filter((a) => a.trusts).length;
    lines.push(`§fTrust people: ${trusting === residents.length ? "§a" : "§e"}${trusting} of ${residents.length}§7${trusting < residents.length ? ` (feed a shy one raw cod or salmon by hand: it trusts you one time in ${T.trustOdds})` : ""}`);
  }
  return lines;
}

// The Field Journal's care notes.
export function catCareLines(sp, T) {
  if (!sp.restSpots) return [];
  const shy = `Shy: a new one runs from people until one feeds it raw cod or salmon by hand (it trusts one time in ${T.trustOdds}, with hearts). It keeps that trust when it's moved, and a kitten born in the zoo trusts from the start`;
  if (sp.restSpots.kind === "log")
    return [
      "Sleep: by day they sleep (dawn to late afternoon), and they're about at dusk and at night",
      "Rest: a log on the floor for each, to lie up on (ocelots rest on branches and in hollow trees)",
      "Cover: leaves or a roof over part of the exhibit (they keep to thick cover)",
      shy,
      `Breeding: a pair has ${sp.breeding.litter} or ${sp.breeding.litterMax} kittens (they live alone otherwise: a pair and their kittens at most)`,
    ];
  return [
    "Sleep: they nap on and off all day and night, curled up, purring",
    `Seats: a chest, a bed or a lit furnace for each ${sp.restSpots.per} to sit on (the game's cats' places), and sometimes they nap there`,
    `Company: a few together get on (up to ${sp.social.recommendedMax} to a room), with a roofed corner to sleep in`,
    shy,
    `Breeding: a pair has ${sp.breeding.litter} to ${sp.breeding.litterMax} kittens`,
  ];
}

export function catCatchLine(sp, carrier) {
  return sp.restSpots?.kind === "log"
    ? `Catching: find wild ones in a jungle; with raw cod or salmon (or a Meat or Fish Ration) in your inventory, use an empty ${carrier} on one`
    : `Catching: find stray cats in a village or a black cat at a swamp hut; with raw cod or salmon (or a Meat or Fish Ration) in your inventory, use an empty ${carrier} on one. A tamed cat is someone's pet: leave it with them`;
}

// A zoo cat's or ocelot's trust (the record's: one born in the zoo has it from birth, animals/nursery.js).
export function trustsOf(a) {
  return Boolean(a?.trusts);
}

// A kitten's voice (cats: classic or royal): one parent's or the other's, by a number from 0 to 1.
export function kittenRoyal(mother, father, r) {
  return Boolean(r < 0.5 || !father ? mother?.royal : father.royal);
}
