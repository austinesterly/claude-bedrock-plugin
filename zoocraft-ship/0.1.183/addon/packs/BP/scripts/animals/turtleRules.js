// Sea turtles (0.1.183, module 12; research/vanilla_plan.md "0.1.183 sea turtles: the design"): the game's own turtle kept
// on a turtle beach (a pool, a sand beach to nest on, seagrass in the water). Pure rules: the acts the client reads, a
// nesting female's next step (carrying her eggs by day, up the beach at night, digging, back to the water), the nest's
// look by the days, the hatchlings' sexes by the nest's warmth, basking on the sand by day (pickBaskSpot, nextBaskPhase),
// the scute a young one sheds as it grows up, and the clipboard, journal and catching lines. animals/turtle.js applies them in the world; animals/nursery.js keeps the nests.
// Sources: USFWS, Standard Conditions for Care and Maintenance of Captive Sea Turtles (2019), tank sizes for a turtle over
// 65 cm: water "at least nine times the shell length by two times the straight carapace width", 1.2 m deep, doubled for each
// more; transport out of the water, kept moist. Japan for Sustainability (2003) on the Port of Nagoya Public Aquarium's
// green turtle, the first to nest indoors: laid "on artificial sands adjacent to the water tank", 117 eggs and then 100,
// hatching "about two months later"; green turtles "mainly feed on marine algae ... and seaweed (such as turtle grass)".
// SWOT, "How Temperature Determines Sex in Sea Turtles": warmer nests hatch more females, the pivotal temperature about
// 29 C; a Cape York trial (Cape York NRM 2024) measured shaded nests 1.8 C cooler on average.

// The act the client reads (the entity property zoocraft:act): 0 its own life, 1 carrying her eggs (the egg belly), 2
// digging her nest (the egg belly and the game's digging flippers).
export const ACT = { life: 0, gravid: 1, dig: 2 };

// Night by the game's clock: when sea turtles (and the game's) come up the beach to nest.
export function isNestingTime(time, T) {
  return time >= T.night[0] && time < T.night[1];
}

/**
 * A nesting female's next step, each second. s: { phase: "life" | "seek" | "dig" | "home", until, retryAt } (game ticks);
 * f: { now, night, hasNest (an unlaid nest waits for her), walking (her walk is under way), arrived (her walk got to the
 * nest), stuck (it stuck or ran out of time), inWater, laidLate (the eggs are due: lay where she is) }. Returns
 * { phase, ticks?, lay?, retry? } to change, or undefined to go on. "home" is her walk back to the water.
 */
export function nextNestPhase(s, f, T) {
  if (s.phase === "life") {
    // By night; on the day the eggs are due, by day too (so a world that sleeps the nights away still sees her lay: and
    // Kemp's ridleys nest by day).
    if (f.hasNest && (f.night || f.laidLate) && f.now >= (s.retryAt ?? 0)) return { phase: "seek", ticks: T.seekTicks };
    return undefined;
  }
  if (s.phase === "seek") {
    if (!f.hasNest) return { phase: "life" };
    if (f.arrived) return { phase: "dig", ticks: T.digTicks };
    if (f.stuck || f.now >= s.until) return f.laidLate ? { phase: "dig", ticks: T.digTicks } : { phase: "life", retry: T.retryTicks };
    return undefined;
  }
  if (s.phase === "dig") {
    if (!f.hasNest) return { phase: "life" };
    if (f.now >= s.until) return { phase: "home", ticks: T.homeTicks, lay: true };
    return undefined;
  }
  if (s.phase === "home") {
    if (f.inWater || f.arrived || f.stuck || f.now >= s.until) return { phase: "life" };
    return undefined;
  }
  return { phase: "life" };
}

// The act for her phase and whether she still carries her eggs.
export function nestAct(phase, gravid) {
  if (phase === "dig") return ACT.dig;
  return gravid ? ACT.gravid : ACT.life;
}

/**
 * The Turtle Nest block's look for a nest record: "wait" (not laid yet: nothing on the sand), "gone" (it has hatched and
 * its young are out, or the mother no longer carries these eggs), or the cracks, 0 (none) to 2 (very cracked) as the
 * days pass: none at first, slightly cracked two days before they hatch, very cracked on the last.
 * @param {{ id: string, laid?: number, hatchDay?: number, exhibitId: string }} rec
 * @param {any} mother the mother's record (or undefined)
 * @param {boolean} youngOut every hatchling is placed in the world
 * @param {number} gestationDays the days the eggs take
 */
export function turtleNestLook(rec, mother, youngOut, gestationDays) {
  if (rec.hatchDay !== undefined) return youngOut ? "gone" : 2;
  const e = mother?.expecting;
  if (!e || e.nestId !== rec.id || mother.location?.kind !== "exhibit" || mother.location.id !== rec.exhibitId) return "gone";
  if (rec.laid === undefined) return "wait";
  return Math.max(0, Math.min(2, gestationDays - e.daysLeft));
}

// Sea turtles' sex by the nest's warmth (the opposite of the crocodile's): a nest in full sun is warm and hatches mostly
// females (T.warmShare of them), a shaded one mostly males.
export function turtleHatchSex(sunny, T, random = Math.random) {
  const r = random() < T.warmShare;
  return sunny ? (r ? "female" : "male") : r ? "male" : "female";
}
export function turtleHatchLine(sexes, sunny) {
  const males = sexes.filter((s) => s === "male").length;
  const females = sexes.length - males;
  const what = [females ? `${females} ${females === 1 ? "female" : "females"}` : "", males ? `${males} ${males === 1 ? "male" : "males"}` : ""].filter(Boolean).join(" and ");
  return sunny ? `The nest was in full sun, so it was warm: ${what} (a warm nest hatches mostly females)` : `The nest was shaded, so it was cool: ${what} (a cool nest hatches mostly males)`;
}

// The eggs a nest shows: the clutch, 1 to 4 (the game's turtle lays 1 to 4).
export function eggsShown(litter) {
  return Math.max(1, Math.min(4, Math.round(litter || 1)));
}

/**
 * One tick of her walk along the points `pts` (turtle.js pushes her): on land the camels' walk (the push that brings her
 * speed over the ground to `pace`, a hop when the next point is a block up); in the water she swims, rising or sinking
 * toward the next point's level too. Returns { i, done, push, dx, dz }.
 * @param {{x: number, y: number, z: number}[]} pts
 */
export function turtleStep(pts, i, pos, vel, onGround, inWater, pace, reach = 0.45, endReach = 0.3) {
  while (i < pts.length && Math.hypot(pts[i].x - pos.x, pts[i].z - pos.z) < (i === pts.length - 1 ? endReach : reach) && (!inWater || Math.abs(pts[i].y - pos.y) < 1.2)) i++;
  if (i >= pts.length) return { i, done: true, push: { x: -vel.x, y: 0, z: -vel.z }, dx: 0, dz: 0 };
  const t = pts[i];
  const dx = t.x - pos.x, dz = t.z - pos.z;
  const d = Math.hypot(dx, dz) || 1;
  const sp = Math.min(pace, d);
  let y = 0;
  if (inWater) y = Math.max(-0.08, Math.min(0.1, (t.y - 0.2 - pos.y) * 0.3)) - vel.y; // swim up (or down) toward it
  else if (onGround && t.y - pos.y > 0.4) y = 0.42; // a step up out of the water or the beach
  return { i, done: false, push: { x: (dx / d) * sp - vel.x, y, z: (dz / d) * sp - vel.z }, dx, dz };
}

/**
 * A step of a turtle carried along her way while she's in the water (each tick; the test server: a push a tick hardly
 * moves a led turtle in the water, and one pushed toward the beach stuck at its edge). `to`: the next spot, pace across
 * toward the next point and up or down toward its height (at most rise a tick); `up`: the rise alone. `tries`: the spots
 * to try in turn, `to`, then sliding along x alone, along z alone, then `up`: she's 1.2 wide, so beside a wall or the
 * beach's edge a point at a block's middle has her overlap the block (the test server: a teleport there is refused and she
 * stuck), and she slides along it instead, as a push would. When the next point is a step up (more than 0.3 above her:
 * the beach from the water), the second try is a climb, up to `climb` a tick: she rises out of the water at the beach's
 * edge to its height (inferred: a slow rise could lose to her weight once she's out of the water), then goes over onto it. Points
 * are passed as turtleStep passes them in the water (within reach across and 1.2 up or down).
 */
export function turtleCarry(pts, i, pos, pace, rise, climb = 0.3, reach = 0.45, endReach = 0.3) {
  while (i < pts.length && Math.hypot(pts[i].x - pos.x, pts[i].z - pos.z) < (i === pts.length - 1 ? endReach : reach) && Math.abs(pts[i].y - pos.y) < 1.2) i++;
  if (i >= pts.length) return { i, done: true, dx: 0, dz: 0 };
  const t = pts[i];
  const dx = t.x - pos.x, dz = t.z - pos.z;
  const d = Math.hypot(dx, dz) || 1;
  const sp = Math.min(pace, d);
  const vy = Math.max(-rise, Math.min(rise, t.y + 0.02 - pos.y));
  const to = { x: pos.x + (dx / d) * sp, y: pos.y + vy, z: pos.z + (dz / d) * sp };
  const up = { x: pos.x, y: pos.y + vy, z: pos.z };
  const slides = [{ x: to.x, y: to.y, z: pos.z }, { x: pos.x, y: to.y, z: to.z }];
  const step = t.y + 0.02 - pos.y;
  const tries = step > 0.3 ? [to, { x: pos.x, y: pos.y + Math.min(climb, step), z: pos.z }, ...slides] : [to, ...slides, up];
  return { i, done: false, to, up, tries, dx, dz };
}

/**
 * Whether a carried turtle is stalled short of her point (each tick, after the tries): she got no nearer it across and no
 * higher or lower, and it's within `near` blocks. The way's corners are cut (smoothWay), so a point just short of the
 * beach can lie where her 1.2-wide body can't go at the water's height (the test server: one stuck 0.47 from a point at
 * the edge, every try refused); she then goes on to the next point, the one up on the sand, and climbs to it.
 */
export function carryStalled(t, before, after, near = 1) {
  const d0 = Math.hypot(t.x - before.x, t.z - before.z);
  const d1 = Math.hypot(t.x - after.x, t.z - after.z);
  return d1 > d0 - 0.005 && d1 < near && Math.abs(after.y - before.y) < 0.01;
}

// The water cell nearest `from` among the exhibit's walked cells (key "x,y,z" -> "land" | "water"): where she goes back
// to after laying. Its top: the water cell with no water over it.
export function nearestWater(cells, from, limit = 4096) {
  let best;
  let bestD = Infinity;
  let n = 0;
  for (const [k, v] of cells) {
    if (++n > limit) break;
    if (v !== "water") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (cells.get(`${x},${y + 1},${z}`) === "water") continue;
    const d = (x + 0.5 - from.x) ** 2 + (z + 0.5 - from.z) ** 2 + (y - from.y) ** 2;
    if (d < bestD) {
      best = { x, y, z };
      bestD = d;
    }
  }
  return best;
}

// ---------------- basking: up on the sand by day ----------------
// The test server (0.1.183): the game's own move_to_land goal never once brought a turtle out of the test zoo's pool 2
// deep, not even the game's own turtle, so the script walks each one up onto the sand now and then by day to bask (green
// turtles haul out onto beaches to bask, in Hawaii and the Galapagos), lies there a while, and walks back to the water.

/**
 * A spot on the sand near the water's edge for a turtle at `from` to bask on: one of the exhibit's walked land cells within
 * `reach` blocks of it (across) with water within 2 blocks of it (at its level or the one below), picked at random.
 * cells: key "x,y,z" -> "land" | "water". Undefined when there's none.
 */
export function pickBaskSpot(cells, from, random = Math.random, reach = 10, limit = 4096) {
  const out = [];
  let n = 0;
  for (const [k, v] of cells) {
    if (++n > limit) break;
    if (v !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    if (Math.hypot(x + 0.5 - from.x, z + 0.5 - from.z) > reach) continue;
    let wet = false;
    for (let dx = -2; dx <= 2 && !wet; dx++) for (let dz = -2; dz <= 2 && !wet; dz++) wet = cells.get(`${x + dx},${y},${z + dz}`) === "water" || cells.get(`${x + dx},${y - 1},${z + dz}`) === "water";
    if (wet) out.push({ x, y, z });
  }
  return out.length ? out[Math.floor(random() * out.length) % out.length] : undefined;
}

/**
 * A turtle's next step when she has no nest waiting (each second). s: { phase: "life" | "ashore" | "bask" | "home",
 * until, retryAt }; f: { now, night, inWater, bask (this second's roll came up), arrived, stuck }. Returns { phase,
 * ticks? , retry? } to change, or undefined to go on. "ashore" is her walk up onto the sand, "bask" lying there, "home" the
 * walk back (as after laying).
 */
export function nextBaskPhase(s, f, T) {
  if (s.phase === "life") {
    if (!f.night && f.bask && f.inWater && f.now >= (s.retryAt ?? 0)) return { phase: "ashore", ticks: T.ashoreTicks };
    return undefined;
  }
  if (s.phase === "ashore") {
    if (f.arrived) return { phase: "bask", ticks: T.baskTicks[0] + Math.floor((f.r ?? 0) * (T.baskTicks[1] - T.baskTicks[0])) };
    if (f.stuck || f.now >= s.until) return { phase: "life", retry: T.retryTicks };
    return undefined;
  }
  if (s.phase === "bask") {
    if (f.now >= s.until) return { phase: "home", ticks: T.homeTicks };
    return undefined;
  }
  if (s.phase === "home") {
    if (f.inWater || f.arrived || f.stuck || f.now >= s.until) return { phase: "life", retry: T.baskRest };
    return undefined;
  }
  return { phase: "life" };
}

// ---------------- the clipboard, the journal, catching ----------------
// The clipboard's line for a turtle beach: sand to nest in.
export function beachLine(ex, n) {
  const sites = ex.sandSites;
  if (sites === undefined) return "§fNesting beach: §7measure the exhibit again so its sand can be counted";
  if (sites >= 1) return `§fNesting beach: §ayes §7(${sites} spots of sand 2 to 5 blocks from the water${n > 1 ? `; ${n} turtles` : ""}): a female crawls up at night and lays her eggs there`;
  return "§fNesting beach: §7no sand 2 to 5 blocks from the water: lay sand or red sand in the beach a few blocks back from the water's edge for a female to nest in";
}

export function turtleCareLines(sp, T, cap) {
  if (!sp.seaTurtle) return [];
  return [
    `A turtle beach: water (${T.waterEach} blocks of it for each turtle, 2 deep) with a dry beach beside it, measured from the beach. USFWS asks a tank 9 shell lengths long and 2 shell widths wide for each sea turtle, 1.2 m deep`,
    `Seagrass: seagrass or kelp growing in ${sp.seagrass.perAnimal} water blocks for each (bone meal on sand under the water grows seagrass). Green turtles graze it: with enough, ${Math.round(sp.seagrass.share * 100)}% of their food. Without it comfort can't rise above ${cap}`,
    "Food: Leafy Rations, or seagrass, in an Aquarium Feeder over the water (zoos feed them greens in the water)",
    "Nesting: sand or red sand 2 to 5 blocks from the water. A female that has mated crawls up the beach at night, digs a nest and lays her eggs, then goes back to the water; nobody guards it. The eggs crack as the days pass and hatch in a few park days; the hatchlings crawl to the water. A nest in full sun hatches mostly females, a shaded one mostly males",
    "A young one sheds a Turtle Scute as it grows up: five make a Turtle Shell",
  ];
}

export function turtleCatchLine(sp) {
  return `Catching: a Livestock Crate with seagrass or a Leafy Ration in your inventory (it follows seagrass). Sea turtles travel out of the water`;
}
