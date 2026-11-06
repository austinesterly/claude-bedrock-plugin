// Dolphins (0.1.186, module 12; research/vanilla_plan.md "0.1.186 dolphins: the design"): the game's own kept in a dolphin
// pool. Pure rules: the pool's depth and width (each column of water read down from its top, ex.dolphin, counted by
// exhibits/exhibits.js), the open water they breathe at, what the journal sees, and the clipboard, journal and warning
// lines. Every rule here is by the species' flags, never by name.
// Sources: the European Association for Aquatic Mammals' recommended dolphin housing standards (as the Wikipedia article
// "Dolphinarium" gives them): a pool for five dolphins 275 square metres of surface and 75 more for each more, 3.5 m deep,
// 1,000 cubic metres and 200 more each (two of the three met, the third within 10%, is acceptable). The US rules for
// marine mammals (9 CFR 3.104, Group I cetaceans, bottlenose dolphins 2.74 to 3.05 m long): a pool at least 7.32 m across
// in its narrowest direction (or twice the longest animal's length) and 1.83 m deep (or half its length). The game's
// dolphin (Mojang's 1.26.50 files): about 2.6 blocks long (its model), it breathes air (240 seconds under), swims up for
// breath, swims alongside a player, leaps out of the water now and then, and lives in groups (its flocking: 4 to 8).

// What a column of a pool holds: water, and the plants growing in it.
const IN_WATER = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:seagrass", "minecraft:kelp", "minecraft:kelp_plant"]);
// What can be right over the water's surface and still let a dolphin breathe there.
const OPEN = new Set(["minecraft:air", "minecraft:light_block", "minecraft:structure_void"]);

// Each column of a pool from its top water cells ([x, y, z]): how deep its water is (the top block and every water block
// under it, at most `maxDepth`), and how many of the tops are open to the air (nothing right over them). An unread block
// (unloaded) ends a column and counts as covered. Returns { depths: Map "x,z" -> depth, open }.
export function poolColumns(waterTops, typeAt, maxDepth) {
  const depths = new Map();
  let open = 0;
  for (const [x, y, z] of waterTops) {
    let d = 1;
    while (d < maxDepth && IN_WATER.has(typeAt(x, y - d, z))) d++;
    const k = `${x},${z}`;
    depths.set(k, Math.max(depths.get(k) ?? 0, d));
    if (OPEN.has(typeAt(x, y + 1, z))) open++;
  }
  return { depths, open };
}

// The side of the largest square of columns at least `minDepth` deep: the pool's widest stretch of deep water.
export function widestStretch(depths, minDepth) {
  const deep = new Set();
  let x0 = Infinity;
  let x1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  for (const [k, d] of depths) {
    if (d < minDepth) continue;
    deep.add(k);
    const [x, z] = k.split(",").map(Number);
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    z0 = Math.min(z0, z);
    z1 = Math.max(z1, z);
  }
  if (!deep.size) return 0;
  let best = 0;
  /** @type {Map<string, number>} */
  const side = new Map();
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      if (!deep.has(`${x},${z}`)) continue;
      const s = 1 + Math.min(side.get(`${x - 1},${z}`) ?? 0, side.get(`${x},${z - 1}`) ?? 0, side.get(`${x - 1},${z - 1}`) ?? 0);
      side.set(`${x},${z}`, s);
      if (s > best) best = s;
    }
  }
  return best;
}

// What the measure keeps for a dolphin pool: the widest stretch at the dive depth, the columns that deep, the deepest,
// and the open tops.
export function poolSummary(columns, T) {
  let deep = 0;
  let deepest = 0;
  for (const d of columns.depths.values()) {
    if (d >= T.diveDepth) deep++;
    if (d > deepest) deepest = d;
  }
  return { stretch: widestStretch(columns.depths, T.diveDepth), deep, deepest, open: columns.open };
}

// Room to dive and turn? A species without the need, or a pool not measured yet, always has it.
export function hasDeepStretch(species, ex, T) {
  if (!species.deepPool || ex.dolphin === undefined) return true;
  return (ex.dolphin.stretch ?? 0) >= T.stretch;
}

// Enough of the water open to the air to come up and breathe?
export function hasOpenWater(species, ex, T) {
  if (!species.deepPool || ex.dolphin === undefined) return true;
  return (ex.dolphin.open ?? 0) >= Math.ceil(T.openShare * (ex.waterCells ?? 0));
}

// The warnings for a dolphin pool: no stretch deep and wide enough, and water covered over.
export function dolphinWarnings(ex, plural, species, T) {
  if (!species.deepPool || ex.dolphin === undefined) return [];
  const out = [];
  if (!hasDeepStretch(species, ex, T)) {
    const s = ex.dolphin.stretch ?? 0;
    out.push({ severity: 2, text: `${plural} need room to dive and turn: a stretch of water ${T.stretch} by ${T.stretch} blocks and ${T.diveDepth} deep (the widest now is ${s ? `${s} by ${s}` : "none"}; ${ex.dolphin.deepest ?? 0} deep at most). Dig the pool deeper or wider, then measure again with the Habitat Marker. Until then comfort can't rise above ${T.depthComfortCap}.` });
  }
  if (!hasOpenWater(species, ex, T)) {
    const open = ex.dolphin.open ?? 0;
    out.push({ severity: open ? 2 : 3, text: `${plural} breathe air: they come up to the surface to breathe, but ${open ? `only ${open}` : "none"} of the pool's ${ex.waterCells ?? 0} water blocks ${open === 1 ? "is" : "are"} open to the air (nothing right over ${open === 1 ? "it" : "them"}). Leave at least ${Math.round(T.openShare * 100)}% of the water open, then measure again. Until then comfort can't rise above ${T.depthComfortCap}.` });
  }
  return out;
}

// The clipboard's line for a dolphin pool.
export function poolLine(ex, T) {
  if (ex.dolphin === undefined) return "§fDolphin pool: §7not measured yet";
  const s = ex.dolphin.stretch ?? 0;
  const deep = s >= T.stretch ? `§a${s} by ${s} of water ${T.diveDepth} deep§7 (${T.stretch} by ${T.stretch} needed)` : `${s ? `${s} by ${s}` : "no stretch"} of water ${T.diveDepth} deep, ${T.stretch} by ${T.stretch} needed §e(too small)§7`;
  const water = ex.waterCells ?? 0;
  const open = ex.dolphin.open ?? 0;
  return `§fDolphin pool: §7${deep}; ${open >= Math.ceil(T.openShare * water) ? `${open} of ${water} water blocks open to the air` : `§eonly ${open} of ${water} water blocks open to the air§7`}`;
}

// The Field Journal's care notes.
export function dolphinCareLines(sp, T, prof) {
  if (!sp.deepPool) return [];
  return [
    `A pool: ${prof.baseArea} blocks of water for up to ${prof.firstGroup ?? 1} and ${prof.extraArea} more for each more, with a bank inside the walls to stand on`,
    `Deep and wide: a stretch of water ${T.stretch} by ${T.stretch} blocks and ${T.diveDepth} deep, to dive and turn. Without it comfort can't rise above ${T.depthComfortCap}`,
    `Air: they breathe at the surface, so keep at least ${Math.round(T.openShare * 100)}% of the water open (nothing right over it)`,
    "Company: they live in groups (pods), so keep at least two together",
    "Food: Fish Rations from an Aquarium Feeder over the water",
    "Play: a Floating Toy on the water (aim at the pool and use it) to push about, and a Hanging Food Basket of Fish Rations to forage from. With neither they get bored, and in a few park days unwell",
    `Breeding: one calf, born in the water ${sp.breeding?.gestationDays ?? 5} park days after mating, grown in ${sp.breeding?.matureDays ?? 6}`,
  ];
}

export function dolphinCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild ones swim in pods in the oceans (not frozen or deep cold ones); let one go and it's the game's own again`;
}

// What the journal sees: a leap (out of the water, over water, rising).
export function leaping(inWater, onGround, vy, waterBelow, T) {
  return !inWater && !onGround && waterBelow && vy > T.leapRise;
}

// Swimming alongside a player: both in the water, close, and the dolphin moving.
export function swimmingAlongside(distance, playerInWater, speed, T) {
  return playerInWater && distance <= T.alongside && speed > T.alongsideSpeed;
}

// ---------------- the leap (animals/dolphin.js) ----------------
// The zoo copy has movement.basic, under which the game's own breach (random_breach) never lifts it out (the test
// server, 0.1.186: the game's dolphins leapt now and then, the copies never), so the script gives it the leap: from just
// under the surface, out along an arc that tops `leapPeak` over the water (the game's own, measured: about half a
// block), `leapLength` blocks on, in `leapTicks` ticks, back in under the surface.

// How far under the surface its feet are, if it's close enough to it to leap (else undefined). `surface` is the y of
// the air block over the water (the water's top).
export function underSurface(feetY, surface, T) {
  const d = surface - feetY;
  return d > 0 && d <= T.leapFrom ? d : undefined;
}

// The arc's points, one a tick: from `from` (its feet, under the surface) heading `yaw` (degrees, the game's: 0 south,
// 90 west), up out of the water to leapPeak over its top halfway, and down to leapStart under it at the end. Each point
// carries its pitch (degrees, nose up negative), for the look.
export function leapPath(from, yaw, surface, T) {
  const r = (yaw * Math.PI) / 180;
  const dx = -Math.sin(r) * T.leapLength;
  const dz = Math.cos(r) * T.leapLength;
  const peak = surface + T.leapPeak;
  const end = surface - T.leapStart;
  const yAt = (s) => (s <= 0.5 ? from.y + (peak - from.y) * Math.sin(Math.PI * s) : end + (peak - end) * Math.sin(Math.PI * s));
  const out = [];
  for (let i = 1; i <= T.leapTicks; i++) {
    const s = i / T.leapTicks;
    const y = yAt(s);
    const dy = y - yAt((i - 1) / T.leapTicks);
    out.push({ x: from.x + dx * s, y, z: from.z + dz * s, pitch: -Math.round((Math.atan2(dy, T.leapLength / T.leapTicks) * 180) / Math.PI) });
  }
  return out;
}

// Clear: every point in water or open air, never through a wall, glass or anything else, and it comes down in open
// water of the pool (the landing's column water at the surface, with air over it). `read(x, y, z)` gives a block's
// class ("water", "air", "seagrass", ...), as platform/mc.js blockReader does.
export function leapClear(pts, surface, read) {
  const ok = (c) => c === "water" || c === "air" || c === "seagrass";
  for (const p of pts) {
    const x = Math.floor(p.x);
    const z = Math.floor(p.z);
    if (!ok(read(x, Math.floor(p.y), z)) || !ok(read(x, Math.floor(p.y + 0.6), z))) return false;
  }
  const end = pts[pts.length - 1];
  const x = Math.floor(end.x);
  const z = Math.floor(end.z);
  return read(x, surface - 1, z) === "water" && read(x, surface, z) === "air";
}
