// Camels (0.1.181, module 12; research/vanilla_plan.md "0.1.181 camels: the design"): the game's own kept in a desert
// exhibit. Pure rules: sand underfoot (how much, ex.sandFloorCells: geometry.js counts the usable floor on sand or red
// sand), shade (leaves or a roof over the floor, ex.coveredCells), what a camel does next (a kneel now and then, the midday
// shade, a dust bath), where in the shade it goes and its walk there, the acts the client reads, and the clipboard, journal
// and warning lines. animals/camel.js applies them in the world.
// Sources: Wild Welfare (a Cotswold Wildlife Park keeper's guest post): "Sand in their enclosures and houses are not only good for
// their feet but their overall comfort and happiness too. Camels enjoy sleeping on soft substrate and love nothing more
// than rolling in sand!"; "Camels should always have access to hay or grass". Zappaterra et al. 2021 (Animals 11:480,
// the Doha camel market at 40 to 47 C): 312 of 421 camels in pens with shade were in it, and they lay down more there.
// Scottish dangerous wild animal guidance (as a search quoted it; the page never loaded): at least 5 by 10 m for one
// camel, 10 by 20 m for a male and two females; some make a dust bath to roll in, in dry weather.

// The act the client reads (the entity property zoocraft:act): 0 its own life (the game's walk), 1 kneeling at rest (a
// while now and then, or in the shade at midday), 2 kneeling for a dust bath (sand thrown up round it).
export const ACT = { life: 0, rest: 1, bath: 2 };

// Sand under at least T.sandShare of the usable floor.
export function sandNeeded(ex, T) {
  return Math.ceil((ex.usableArea ?? 0) * T.sandShare);
}

// Shade over T.shadePerCamel floor blocks for each camel (1 at least), so all can lie in it at midday.
export function shadeNeeded(n, T) {
  return Math.max(1, n) * T.shadePerCamel;
}

// Whether a desert species has the sand it needs (true until it's measured, and for everyone else).
export function hasDesertSand(species, ex, T) {
  if (!species.desert || ex.sandFloorCells === undefined) return true;
  return ex.sandFloorCells >= sandNeeded(ex, T);
}

// Whether there's shade enough for the n camels here.
export function hasDesertShade(species, ex, n, T) {
  if (!species.desert || ex.coveredCells === undefined) return true;
  return ex.coveredCells >= shadeNeeded(n, T);
}

export function sandWarning(plural, ex, T, cap) {
  return { severity: 2, text: `${plural} need sand underfoot: sand or red sand under at least ${Math.round(T.sandShare * 100)}% of the floor (${sandNeeded(ex, T)} of the ${ex.usableArea} blocks here; ${ex.sandFloorCells ?? 0} now), soft for their feet, to kneel and roll in. Without it comfort can't rise above ${cap}.` };
}

export function shadeWarning(plural, n, ex, T, cap) {
  return { severity: 2, text: `${plural} need shade to lie in at midday: tree leaves or a roof 3 or more blocks up over ${T.shadePerCamel} blocks of floor for each (${shadeNeeded(n, T)} for the ${n} here; ${ex.coveredCells ?? 0} now). Without it comfort can't rise above ${cap}.` };
}

// The clipboard's line for a desert exhibit.
export function desertLine(ex, n, T) {
  const sand = ex.sandFloorCells === undefined ? "sand not measured yet" : `${ex.sandFloorCells} of ${sandNeeded(ex, T)} floor blocks sand${ex.sandFloorCells < sandNeeded(ex, T) ? " §e(too little)§7" : ""}`;
  const shade = ex.coveredCells === undefined ? "shade not measured yet" : `${ex.coveredCells} of ${shadeNeeded(n, T)} shaded${ex.coveredCells < shadeNeeded(n, T) ? " §e(too little)§7" : ""}`;
  return `§fDesert: §7${sand}; ${shade}`;
}

// The Field Journal's care notes.
export function camelCareLines(sp, T, cap) {
  if (!sp.desert) return [];
  return [
    `Sand underfoot: sand or red sand under at least ${Math.round(T.sandShare * 100)}% of the floor, soft for their feet, to kneel and roll in. Without it comfort can't rise above ${cap}`,
    `Shade: tree leaves or a roof 3 or more blocks up over ${T.shadePerCamel} blocks of floor for each camel. Without it comfort can't rise above ${cap}`,
    "Food: Leafy Rations (hay and browse) from a Hay Rack, a Basic Feeder or an Elevated Browse Feeder; a cactus is their food too",
    "Their day: they amble about and now and then kneel a while; at midday they go into the shade and kneel there till the heat passes; on sand one now and then kneels for a dust bath",
  ];
}

export function camelCatchLine(sp, carrier) {
  return `Catching: a ${carrier}, with ${sp.baitText} in your inventory. Wild ones live in deserts, one at a time`;
}

// The midday hours (the game's time of day), when a camel goes into the shade.
export function isMidday(timeOfDay, T) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  return t >= T.midday[0] && t < T.midday[1];
}

// Whether the floor where it stands is shaded: something other than air (leaves, a roof) from 2 to T.coverLook blocks over
// its feet. `typeAt` gives a block's typeId, or undefined where it can't be read (not shaded, then).
const OPEN = new Set(["minecraft:air", "minecraft:light_block", "minecraft:structure_void"]);
export function shadedAt(typeAt, x, y, z, T) {
  for (let h = 2; h <= T.coverLook; h++) {
    const id = typeAt(x, y + h, z);
    if (id === undefined) return false;
    if (!OPEN.has(id) && !/^minecraft:light_block/.test(id)) return true;
  }
  return false;
}

// A length of ticks from a [min, max] span.
function span(range, r) {
  return range[0] + Math.floor(r * (range[1] - range[0]));
}

/**
 * What a camel does next. s: { phase: "life" | "seek" | "rest" | "sit" | "bath", since, until, retryAt } (game ticks); ctx:
 * { now, midday, shaded (where it stands), shadeHere (the exhibit has shade), onSand, inWater, walking (on its way to its
 * spot in the shade: it goes on to lie down there, not at the shade's edge) }. Returns the new phase and
 * how long it may last (retry: when to look for shade again, after a walk that found none), or undefined to go on as it is.
 * Its own life: the game camel's now-and-then kneel (sit: the game's sitting goal does nothing for a zoo copy, so this is
 * it, at the game's rate) and, on sand, a dust bath now and then. In the midday heat, with shade in the exhibit: into the
 * shade (seek: camel.js walks it there) and at rest there till the heat passes.
 * @returns {{ phase: "life" | "seek" | "rest" | "sit" | "bath", ticks?: number, retry?: number } | undefined}
 */
export function nextPhase(s, ctx, T, r1 = Math.random(), r2 = Math.random()) {
  const { now } = ctx;
  if (ctx.inWater) return s.phase === "life" ? undefined : { phase: "life" };
  if (ctx.midday && ctx.shadeHere) {
    if (s.phase === "seek" && ctx.walking) return now - s.since >= T.seekTicks ? { phase: "life", retry: T.retryTicks } : undefined;
    if (ctx.shaded) return s.phase === "rest" ? undefined : { phase: "rest" };
    if (s.phase === "rest") return { phase: "seek", ticks: T.seekTicks }; // the shade went from over it (a roof taken down)
    if (s.phase === "seek") return now - s.since >= T.seekTicks ? { phase: "life", retry: T.retryTicks } : undefined;
    if ((s.phase === "sit" || s.phase === "bath") && now < s.until) return undefined;
    if (now >= (s.retryAt ?? 0)) return { phase: "seek", ticks: T.seekTicks };
    // No way to the shade just now: its own life till it tries again.
  } else if (s.phase === "rest" || s.phase === "seek") return { phase: "life" };
  if (s.phase === "sit" || s.phase === "bath") return now >= s.until ? { phase: "life" } : undefined;
  if (ctx.onSand && r1 < T.bathChance) return { phase: "bath", ticks: span(T.bathTicks, r2) };
  if (r1 >= 1 - T.sitChance) return { phase: "sit", ticks: span(T.sitTicks, r2) };
  return undefined;
}

// The act and the server event for each phase: kneeling (still) at rest, sitting a while or in a dust bath; walked by the
// script (led) into the shade; else its own life.
export function phaseAct(phase) {
  return phase === "rest" || phase === "sit" ? ACT.rest : phase === "bath" ? ACT.bath : ACT.life;
}
export function phaseEvent(phase) {
  return phase === "seek" ? "zoocraft:lead" : phase === "rest" || phase === "sit" || phase === "bath" ? "zoocraft:kneel" : "zoocraft:settle";
}

// The cells around one (the four beside it): a camel is 1.7 blocks wide and longer, so where it lies down the blocks beside
// it must be floor too, and shaded for all of it to lie in the shade.
export function besideCells(c) {
  return [{ x: c.x + 1, y: c.y, z: c.z }, { x: c.x - 1, y: c.y, z: c.z }, { x: c.x, y: c.y, z: c.z + 1 }, { x: c.x, y: c.y, z: c.z - 1 }];
}

/**
 * Where in the shade a camel goes: the nearest floor cell to `from` that is shaded, has floor beside it (`fits`) and isn't
 * near another camel's spot (`taken`: keys "x,y,z"), looking at no more than `maxLooks` (nearest first). `cells`: the
 * exhibit's floor cells; `shaded(c)`: whether the cell is shaded. Undefined when there's none.
 * @param {{x: number, y: number, z: number}[]} cells
 */
export function pickShadeSpot(cells, from, shaded, fits, taken, maxLooks = 96) {
  const d2 = (c) => (c.x + 0.5 - from.x) ** 2 + (c.z + 0.5 - from.z) ** 2 + (c.y - from.y) ** 2 * 4;
  const order = cells.filter((c) => !taken.has(`${c.x},${c.y},${c.z}`)).sort((a, b) => d2(a) - d2(b));
  let looks = 0;
  for (const c of order) {
    if (!fits(c)) continue;
    if (++looks > maxLooks) break;
    if (shaded(c)) return c;
  }
  return undefined;
}

// The cells kept clear round a camel's spot (its own and the eight round it): the next camel lies down beside it, not on it.
export function spotKeys(c) {
  const out = [];
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) out.push(`${c.x + dx},${c.y},${c.z + dz}`);
  return out;
}

/**
 * One tick of a walk along the points `pts` (camel.js pushes it, so the game's own walk shows): the point it heads for
 * (the next one more than `reach` away, the last more than `endReach`), the push that brings its speed over the ground to `pace` that way (its own fall
 * kept), and a hop when the next point is a block up. Returns { i, done, push, dx, dz }.
 * @param {{x: number, y: number, z: number}[]} pts
 */
export function walkStep(pts, i, pos, vel, onGround, pace, reach = 0.45, endReach = 0.2) {
  while (i < pts.length && Math.hypot(pts[i].x - pos.x, pts[i].z - pos.z) < (i === pts.length - 1 ? endReach : reach)) i++;
  if (i >= pts.length) return { i, done: true, push: { x: -vel.x, y: 0, z: -vel.z }, dx: 0, dz: 0 };
  const t = pts[i];
  const dx = t.x - pos.x, dz = t.z - pos.z;
  const d = Math.hypot(dx, dz) || 1;
  const sp = Math.min(pace, d);
  const hop = onGround && t.y - pos.y > 0.4 ? 0.42 : 0;
  return { i, done: false, push: { x: (dx / d) * sp - vel.x, y: hop, z: (dz / d) * sp - vel.z }, dx, dz };
}

// Sand's colour for the dust thrown up (the crab's grit particle, tinted): sand, or red sand.
export const SAND_DUST = { r: 0xdb / 255, g: 0xcf / 255, b: 0xa3 / 255 };
export const RED_SAND_DUST = { r: 0xbe / 255, g: 0x66 / 255, b: 0x21 / 255 };
export function isSandBlock(typeId) {
  return typeId === "minecraft:sand" || typeId === "minecraft:red_sand" || typeId === "minecraft:suspicious_sand";
}
