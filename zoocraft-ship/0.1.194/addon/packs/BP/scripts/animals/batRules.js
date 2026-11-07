// Bats (0.1.194, module 12; research/vanilla_plan.md "0.1.194 bats and allays: the design"): the rules, kept apart from the
// game so the tests can run them. The game flies the zoo copy (its own float_wander, entities/zoo_bat.json); the game's
// bat hangs by its engine (the client's query.is_resting), which a copy doesn't get, so the zoo hangs it (animals/bat.js):
// - Roosts: an open block of the house's air with a solid block over it (not glass, a pane, leaves, a fence or anything
//   see-through: the game's bats can't hang from those), counted by the measure (ex.bats.roosts); one for each bat.
// - Flight: the longest straight line of open air at one height (ex.bats.flight), at least species.flight.length (8
//   wingspans: the AZA Bat TAG).
// - When it hangs: in a dark house (the nocturnal house's test, species.lowLight) out in bouts at any hour, flying a while,
//   hanging a while; in a bright one it hangs all day and flies at night. Someone who isn't sneaking within
//   BALANCE.bat.wakeRange of a hanging one sends it off for a while (the game's: anyone).

export const ROOST = "zoocraft:roost"; // the copy's: hanging
export const BODY_HEIGHT = 0.9; // the game's bat's collision box: hanging, its top is against the block

// What a bat can hang from, by the measure's reader (blockReader with climb, leaves and gecko on): a full solid block or
// a log; never glass, a pane, leaves, a fence or wall ("barrier"), a slab or a zoo fixture ("partial").
export function roostable(kind) {
  return kind === "solid" || kind === "log";
}

export function newBatResult() {
  return { roosts: 0, roostSpots: [], flight: 0 };
}

const key = (x, y, z) => `${x},${y},${z}`;

/**
 * The bat house's roosts and its longest straight flight. `read(x, y, z)` gives the block's kind; `cells` the measure's
 * air (keys "x,y,z").
 * @param {(x: number, y: number, z: number) => string} read
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {{ roosts: number, roostSpots: { x: number, y: number, z: number }[], flight: number }} out
 */
export function* measureBats(read, cells, opts, out) {
  let n = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    if (++n % opts.cellsPerYield === 0) yield;
    if (cells.has(key(x, y + 1, z)) || !roostable(read(x, y + 1, z))) continue;
    out.roosts++;
    if (out.roostSpots.length < opts.keep) out.roostSpots.push({ x, y, z });
  }
  out.flight = longestFlight(cells);
}

/**
 * The longest straight line of open air (cells in a row along x or along z at one height).
 * @param {Iterable<string> | Map<string, string>} cells
 */
export function longestFlight(cells) {
  const set = cells instanceof Map ? cells : new Set(cells);
  let best = 0;
  for (const k of set.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    // Count from the start of each run only.
    if (!set.has(key(x - 1, y, z))) {
      let n = 1;
      while (set.has(key(x + n, y, z))) n++;
      if (n > best) best = n;
    }
    if (!set.has(key(x, y, z - 1))) {
      let n = 1;
      while (set.has(key(x, y, z + n))) n++;
      if (n > best) best = n;
    }
  }
  return best;
}

// Roosts wanted: one for each bat (pups hang with their mothers).
export function roostsNeeded(species, grown) {
  return Math.max(1, grown) * (species.batRoost?.per ?? 1);
}

// Roosts enough (true until it's measured, and for everyone else).
export function hasRoosts(species, ex, grown) {
  if (!species.batRoost || !ex.bats) return true;
  return ex.bats.roosts >= roostsNeeded(species, grown);
}

// Flight room enough (true until it's measured, and for everyone else).
export function hasFlight(species, ex) {
  if (!species.flight || !ex.bats) return true;
  return ex.bats.flight >= species.flight.length;
}

// Where a bat hangs at a roost: in the middle of the block, its top against the one over it.
export function roostPos(spot) {
  return { x: spot.x + 0.5, y: spot.y + 1 - BODY_HEIGHT, z: spot.z + 0.5 };
}

export function spotKey(spot) {
  return `${spot.x},${spot.y},${spot.z}`;
}

// The nearest free roost within `reach` blocks of `pos`, or undefined.
export function pickRoost(spots, pos, used, reach) {
  let best;
  let bestD = reach;
  for (const s of spots) {
    if (used.has(spotKey(s))) continue;
    const p = roostPos(s);
    const d = Math.hypot(p.x - pos.x, p.y - pos.y, p.z - pos.z);
    if (d <= bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

// The points of a short flight up to a roost, `speed` blocks a tick, the last one the roost itself.
export function glidePath(from, to, speed) {
  const d = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  const steps = Math.max(1, Math.ceil(d / speed));
  const out = [];
  for (let i = 1; i <= steps; i++) out.push({ x: from.x + ((to.x - from.x) * i) / steps, y: from.y + ((to.y - from.y) * i) / steps, z: from.z + ((to.z - from.z) * i) / steps });
  return out;
}

// What a bat wants now: "bouts" (flying a while, hanging a while) or "hang". In a dark house any hour is its night.
export function batHours(night, darkHouse) {
  return darkHouse || night ? "bouts" : "hang";
}

// How long the next bout lasts, in ticks: `mode` "fly" or "hang".
export function boutTicks(mode, T, r = Math.random()) {
  const [lo, hi] = mode === "fly" ? T.flyTicks : T.hangTicks;
  return Math.round(lo + (hi - lo) * r);
}

// Is someone who'd wake it close to a hanging bat? `players`: [{ x, y, z, sneaking, dimension }]. The zoo lets someone
// sneaking up watch it (the hedgehogs' rule; the game's bat flies from anyone, the wiki: "even if the player is invisible").
export function wakes(players, pos, dimension, T) {
  return players.some((p) => p.dimension === dimension && !p.sneaking && Math.hypot(p.x - pos.x, p.y - pos.y, p.z - pos.z) <= T.wakeRange);
}

// A wild bat resting (the game's, by its engine): still in the air with a block over it it can hang from. `still`: it
// hasn't moved; `onGround`; `above`: the kind of the block over its head.
export function wildResting(still, onGround, above) {
  return Boolean(still && !onGround && roostable(above));
}

// The Exhibit Clipboard's lines: the roosts, the flight, the dark.
export function batLines(ex, species, grown, darkHouse, T) {
  if (!ex.bats) return ["§fRoosts: §7not measured yet (use the Habitat Marker on the floor inside)"];
  const need = roostsNeeded(species, grown);
  const lines = [
    `§fRoosts: §7${ex.bats.roosts} blocks under the roof to hang from, ${need} needed${ex.bats.roosts < need ? " §e(too few: a solid roof, not glass or leaves)§7" : ""}`,
    `§fFlight: §7a straight ${ex.bats.flight} blocks of open air, ${species.flight.length} needed${ex.bats.flight < species.flight.length ? " §e(too short)§7" : ""}`,
  ];
  if (ex.house) lines.push(darkHouse ? "§fDark house: §ayes§7: out in bouts at any hour, flying a while and hanging a while" : "§fDark house: §7no: they hang all day and fly only at night, and comfort can't rise high (daylight or bright light inside)");
  return lines;
}

// `darkHouse`: the house is dark (undefined until it's measured); `dimCap`: comfort's cap in a bright one (welfare's dim).
export function batWarnings(ex, plural, species, grown, T, darkHouse = undefined, dimCap = 55, maxLight = 7) {
  const out = [];
  if (darkHouse === false) out.push({ severity: 2, text: `${plural} live in the dark: roof the house with solid blocks, wall it with solid blocks or tinted glass so no daylight reaches the floor, and light it with Nocturnal Lamps or glow lichen (nothing brighter than light ${maxLight}). In a bright house they hang all day and fly only at night, and comfort can't rise above ${dimCap}. Measure again with the Habitat Marker after.` });
  if (!hasRoosts(species, ex, grown)) out.push({ severity: 2, text: `${plural} need somewhere to hang: a roof of solid blocks (stone, planks, logs: not glass, leaves or slabs), a block of it over open air for each (${roostsNeeded(species, grown)} needed, ${ex.bats.roosts} now). Without it comfort can't rise above ${T.roostComfortCap}. Measure again with the Habitat Marker after.` });
  if (!hasFlight(species, ex)) out.push({ severity: 2, text: `${plural} need room to fly: a straight ${species.flight.length} blocks of open air (8 wingspans; ${ex.bats.flight} now). Without it comfort can't rise above ${T.flightComfortCap}. Measure again with the Habitat Marker after.` });
  return out;
}

// The Field Journal's care notes.
export function batCareLines(sp, T, balance) {
  if (!sp.batRoost) return [];
  return [
    `Roosting: they hang upside down under a solid block (not glass or leaves, as in the game) and fly off when someone comes within ${T.wakeRange} blocks; sneak up to watch one hang. A roof of solid blocks gives one roost for each block over open air; ${sp.batRoost.per} each. Without enough comfort can't rise above ${T.roostComfortCap}`,
    `Flight: a straight ${sp.flight.length} blocks of open air at least (8 wingspans, the AZA's rule for bat flights). Without it comfort can't rise above ${T.flightComfortCap}`,
    `The dark: a dark house (no daylight on the floor, nothing brighter than light ${balance.nocturnal.maxLight}: solid walls and roof, tinted glass to see in, Nocturnal Lamps) and they're out at any hour, flying and hanging in turns. In a bright one they hang all day, fly at night, and comfort stays low. Zoos keep their bats this way so guests see them about`,
    "Food: fruit, as zoos feed their fruit bats (sweet or glow berries, Fruit Rations), or Insect Rations, from a feeder; a Hanging Food Basket of them to forage from (zoos hang the fruit up)",
    `Company: a colony, ${sp.social.minGroup} at least and up to ${sp.social.recommendedMax}. Breeding: one pup at a time (the game's bats never breed: these are the zoo's)`,
  ];
}

export function batCatchLine(sp, carrier) {
  return `Catching: caves and dark places underground, in colonies of 8. With ${sp.baitText} in your inventory, use an empty ${carrier} on one as it flies (one hanging flies off as you come)`;
}
