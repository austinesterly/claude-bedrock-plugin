// End Hoppers (0.1.91, the End trio's first; spec 5.4 "Small creature with long angular legs | High jumps between
// platforms | Jump clearance, roof, landing pads"), pure: the leap's arc and the checks on it (clear for its body,
// never out over the void), where a wild one leaps, the zigzag escape, the Landing Pads (which count, which are free),
// and what an exhibit needs. The game side is animals/hopper.js; the roof and the pads are measured by exhibits.js (the
// jump measure: the flight measure's flood through the air, then padReport here).
// Sources (research/end_facts.md, research/end_plan.md): the springhare hops on its hind legs, the tail balancing it, in
// slow hops of about 20 cm and leaps of about 2 m (2 to 3 m, erratic, when alarmed); it sits up on its haunches to look
// round, rests with its head and ears on the ground (it seems to feel vibrations), and sleeps standing with its head
// between its hind legs and its tail round its feet; it forages in groups without fighting. A jerboa's escape is
// unpredictable: hops, leaps and hairpin turns (Moore et al. 2017). Rock-wallabies leap from rock to rock and land from
// drops twice their leap's height; a klipspringer lands on a spot the size of a coin, all four feet together.

import { yawTo } from "./grazerRules.js";

export { yawTo };

// The hopper mobs, found by type (0.1.70: never by family alone).
export const HOPPER_TYPES = ["zoocraft:end_hopper", "zoocraft:wild_end_hopper"];
export const WILD_HOPPER = "zoocraft:wild_end_hopper";
export const PAD_BLOCK = "zoocraft:landing_pad";

// What a hopper is doing (its zoocraft:act entity property): the client plays the matching animation (gen/hopper.py
// ACT_STATES) and the Field Journal watches for it. 0 is on its feet, standing or hopping where the engine walks it.
export const ACT = { none: 0, crouch: 1, leap: 2, land: 3, sit: 4, listen: 5, sleep: 6, forage: 7, sniff: 8, dart: 9 };

// Its body: 0.35 wide, 0.45 high (gen/hopper.py BOX); a leap's arc is checked clear for this much.
export const BODY = { half: 0.18, height: 0.45 };

// ---------------- the leap ----------------

// How many ticks a leap of `d` blocks across takes: baseTicks and ticksPerBlock more for each block, within leapTicks.
export function leapTicks(d, T) {
  return Math.max(T.leapTicks[0], Math.min(T.leapTicks[1], Math.round(T.baseTicks + d * T.ticksPerBlock)));
}

// The arc from `from` to `to` ({ x, y, z }, where its feet are): one point a tick, the last at `to`. It goes across at
// an even pace and rises to arcPeak above the higher end, plus arcPeakPerBlock for each block across: a parabola
// y(s) = y0 + D s + 4 k s (1 - s), k solved so its top is that high.
export function arc(from, to, T) {
  const d = Math.hypot(to.x - from.x, to.z - from.z);
  const n = leapTicks(d, T);
  const D = to.y - from.y;
  const H = Math.max(from.y, to.y) + T.arcPeak + T.arcPeakPerBlock * d - from.y;
  // The top of y(s) is y0 + (D + 4k)^2 / (16 k) for k >= |D| / 4: set it to y0 + H.
  const b = 16 * H - 8 * D;
  const k = (b + Math.sqrt(Math.max(0, b * b - 64 * D * D))) / 32;
  const out = [];
  for (let i = 1; i <= n; i++) {
    const s = i / n;
    out.push({ x: from.x + (to.x - from.x) * s, y: from.y + D * s + 4 * k * s * (1 - s), z: from.z + (to.z - from.z) * s });
  }
  return out;
}

// The highest point of an arc.
export function arcTop(pts) {
  return Math.max(...pts.map((p) => p.y));
}

// The cells its body covers at `p` ("x,y,z" keys): half wide each way, from its feet up its height. Feet on a block's
// top stand on it; a hundredth of a block lower they're in it (0.1.91 mock world: an arc over a rock's edge that
// low clipped it).
export function bodyCells(p, body = BODY) {
  const out = [];
  const y0 = Math.floor(p.y + 1e-6);
  const y1 = Math.floor(p.y + body.height);
  for (let x = Math.floor(p.x - body.half); x <= Math.floor(p.x + body.half); x++)
    for (let z = Math.floor(p.z - body.half); z <= Math.floor(p.z + body.half); z++) for (let y = y0; y <= y1; y++) out.push([x, y, z]);
  return out;
}

// Is the arc clear for its body all the way? `read(x, y, z)` gives a block's category (platform/mc.js blockReader):
// only "air" is clear. Checked at every point and half way between them, from `from`, and along the way the game
// moves it a tick: up or down first where it was, then across one way and the other, either first (0.1.91 mock
// world: dropping off a rock, its body caught the rock's corner on the way down, between two points that cleared it).
export function arcClear(from, pts, read, body = BODY) {
  const seen = new Set();
  let prev = from;
  for (const p of pts) {
    const mid = { x: (prev.x + p.x) / 2, y: (prev.y + p.y) / 2, z: (prev.z + p.z) / 2 };
    const upDown = { x: prev.x, y: p.y, z: prev.z };
    const xFirst = { x: p.x, y: p.y, z: prev.z };
    const zFirst = { x: prev.x, y: p.y, z: p.z };
    for (const q of [mid, upDown, xFirst, zFirst, p]) {
      for (const [x, y, z] of bodyCells(q, body)) {
        const k = `${x},${y},${z}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (read(x, y, z) !== "air") return false;
      }
    }
    prev = p;
  }
  return true;
}

// Never out over the void: ground (a block that isn't air, liquid or unloaded) within `look` blocks under every point
// of the arc, and solid ground under where it lands.
export function overGround(pts, read, look) {
  const ground = (c) => c !== "air" && c !== "water" && c !== "lava" && c !== "unloaded" && c !== "gate_open";
  for (const p of pts) {
    const x = Math.floor(p.x);
    const z = Math.floor(p.z);
    const y = Math.floor(p.y + 0.01);
    let found = false;
    for (let d = 1; d <= look + 1 && !found; d++) found = ground(read(x, y - d, z));
    if (!found) return false;
  }
  const end = pts[pts.length - 1];
  return standsOn(read(Math.floor(end.x), Math.floor(end.y + 0.01) - 1, Math.floor(end.z)));
}

// What it lands on: solid ground (not a fence or a wall top, a liquid or air).
export function standsOn(c) {
  return c === "solid";
}

// A leap from `from` to `to` it can take: the arc clear for its body, ground under all of it, solid ground where it
// lands. Returns the arc's points, or undefined.
export function leapWay(from, to, read, T, body = BODY) {
  const pts = arc(from, to, T);
  if (!arcClear(from, pts, read, body) || !overGround(pts, read, T.voidLook)) return undefined;
  return pts;
}

// ---------------- where a wild one leaps ----------------

// The top of the ground in column (x, z) it could land on, from `lo` to `hi` (feet heights, whole blocks): the
// highest cell with solid ground under it and `clear` blocks of air over that ground; undefined if there's none.
export function landingIn(read, x, z, lo, hi, clear) {
  for (let y = hi; y >= lo; y--) {
    if (!standsOn(read(x, y - 1, z))) continue;
    let ok = true;
    for (let h = 0; h < clear && ok; h++) ok = read(x, y + h, z) === "air";
    if (ok) return y;
  }
  return undefined;
}

// A leap out in the wild from `here` ({ x, y, z }, its feet cell): onto ground 1 to 3 blocks higher (wildUp) 2 to 5
// blocks off (wildAcross) best, else down off a height, else across flat ground 2 to 4 blocks (flatAcross, a superflat
// field). `tries` columns looked at, at random; each leap checked (leapWay). Returns { to, pts, kind } or undefined.
export function wildLeap(here, read, T, random = Math.random, tries = 14) {
  const found = { up: undefined, down: undefined, flat: undefined };
  const from = { x: here.x + 0.5, y: here.y, z: here.z + 0.5 };
  for (let i = 0; i < tries; i++) {
    const a = random() * Math.PI * 2;
    const d = T.wildAcross[0] + random() * (T.wildAcross[1] - T.wildAcross[0]);
    const x = Math.floor(from.x + Math.cos(a) * d);
    const z = Math.floor(from.z + Math.sin(a) * d);
    if (x === here.x && z === here.z) continue;
    const y = landingIn(read, x, z, here.y - T.dropMax, here.y + T.wildUp[1], T.wildClear);
    if (y === undefined) continue;
    const dy = y - here.y;
    const across = Math.hypot(x + 0.5 - from.x, z + 0.5 - from.z);
    const kind = dy >= T.wildUp[0] ? "up" : dy < 0 ? "down" : across >= T.flatAcross[0] && across <= T.flatAcross[1] ? "flat" : undefined;
    if (!kind || found[kind]) continue;
    const to = { x: x + 0.5, y, z: z + 0.5 };
    const pts = leapWay(from, to, read, T);
    if (!pts) continue;
    found[kind] = { to, pts, kind };
    if (kind === "up") break;
  }
  return found.up ?? found.down ?? found.flat;
}

// ---------------- the zigzag ----------------

// The headings (yaw, degrees) of a zigzag of `n` darts away from a threat in direction `away` (yaw): each turned
// dartTurn[0] to dartTurn[1] degrees off the straight way, left and right by turns, the first side at random.
export function zigzag(away, n, T, random = Math.random) {
  const out = [];
  let side = random() < 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    out.push(away + side * (T.dartTurn[0] + random() * (T.dartTurn[1] - T.dartTurn[0])));
    side = -side;
  }
  return out;
}

// The point `d` blocks from `p` ({ x, z }) along heading `yaw` (Minecraft's: 0 is +z, 90 is -x).
export function along(p, yaw, d) {
  const r = (yaw * Math.PI) / 180;
  return { x: p.x - Math.sin(r) * d, z: p.z + Math.cos(r) * d };
}

// ---------------- the Landing Pads ----------------

// A pad's spot, the cell over it where a hopper stands ("x,y,z").
export const padSpot = (pos) => ({ x: pos.x, y: pos.y + 1, z: pos.z });
export const spotKey = (p) => `${p.x},${p.y},${p.z}`;

// Within a leap of `from` (a cell a hopper stands in) to `to`: reachUp blocks up, dropMax down, reachAcross across
// (cell to cell), and not straight up or down.
export function withinLeap(from, to, T) {
  const across = Math.hypot(to.x - from.x, to.z - from.z);
  const dy = to.y - from.y;
  return across >= 1 && across <= T.reachAcross && dy <= T.reachUp && dy >= -T.dropMax;
}

// The jump measure's count of the Landing Pads. `pads`: [{ id, pos }] the pads inside the exhibit; `floor`: the cells
// its floor is (where a hopper stands on it, [{ x, y, z }]); `airAt(x, y, z)`: is that cell open air inside the
// exhibit. A pad counts when it has padClear blocks of air over it and is within a leap of the floor or of another pad
// that counts; one is high when it stands highMin or more over the floor beside it (or under it, the nearest floor).
// Returns { pads, counted, high, noClear, outOfReach, ids, spots: [[x, y, z, height]] } (spots: the counted pads' spots).
export function padReport(pads, floor, airAt, T) {
  const out = { pads: pads.length, counted: 0, high: 0, noClear: 0, outOfReach: 0, ids: pads.map((p) => p.id), spots: [] };
  const clear = [];
  for (const p of pads) {
    const s = padSpot(p.pos);
    let ok = true;
    for (let h = 0; h < T.padClear && ok; h++) ok = airAt(s.x, s.y + h, s.z);
    if (ok) clear.push({ ...p, spot: s });
    else out.noClear++;
  }
  // Spread out from the floor: a pad is reached from the floor, then from the pads reached, and so on.
  const reached = [];
  let left = clear;
  let grew = true;
  while (grew && left.length) {
    grew = false;
    const next = [];
    for (const p of left) {
      const from = floor.some((f) => withinLeap(f, p.spot, T)) || reached.some((q) => withinLeap(q.spot, p.spot, T));
      if (from) {
        reached.push(p);
        grew = true;
      } else next.push(p);
    }
    left = next;
  }
  out.outOfReach = left.length;
  for (const p of reached) {
    const h = p.spot.y - floorBeside(p.spot, floor);
    if (h >= T.highMin) out.high++;
    out.spots.push([p.spot.x, p.spot.y, p.spot.z, h]);
  }
  out.counted = reached.length;
  return out;
}

// The floor's height by a pad's spot: the lowest floor cell next to its column (the 8 round it), else the nearest floor
// cell's; the spot's own height with no floor at all.
export function floorBeside(spot, floor) {
  let low;
  let near;
  let best = Infinity;
  for (const f of floor) {
    if (f.y > spot.y) continue;
    const dx = Math.abs(f.x - spot.x);
    const dz = Math.abs(f.z - spot.z);
    if (dx <= 1 && dz <= 1 && (dx || dz)) low = low === undefined ? f.y : Math.min(low, f.y);
    const d = dx * dx + dz * dz;
    if (d < best) {
      best = d;
      near = f.y;
    }
  }
  return low ?? near ?? spot.y;
}

// How many pads the exhibit needs: minPads, or one for each hopper over that.
export function padsNeeded(n, T) {
  return Math.max(T.minPads, n);
}

// What's wrong with the pads for `n` hoppers (ex.hops, the jump measure's): "few" (fewer counting than needed), "high"
// (none of them high), or undefined when they're fine or the exhibit hasn't been measured for them yet.
export function padProblem(ex, n, T) {
  const h = ex.hops;
  if (!h) return undefined;
  if (h.counted < padsNeeded(n, T)) return "few";
  if (!h.high) return "high";
  return undefined;
}

// Pads enough (species.pads): false caps comfort (cause "pads"). Not measured yet: passes.
export function hasPads(species, ex, n, T) {
  if (!species.pads) return true;
  return !padProblem(ex, n, T);
}

// A pad free for one hopper to leap to: no other hopper stands on it or is leaping to it (`held`: Map of spot key ->
// hopper id).
export function padFree(spot, held, id) {
  const who = held.get(spotKey(spot));
  return !who || who === id;
}

// The next pad of a circuit: of `spots` ([x, y, z, height]), the free ones within a leap of `here` (not the one it's
// on), the higher first at random (a weight of 1 + its height). Returns { x, y, z } or undefined.
export function pickPad(spots, here, held, id, T, random = Math.random) {
  const ok = spots.map(([x, y, z, h]) => ({ x, y, z, h })).filter((p) => !(p.x === here.x && p.y === here.y && p.z === here.z) && withinLeap(here, p, T) && padFree(p, held, id));
  if (!ok.length) return undefined;
  const total = ok.reduce((n, p) => n + 1 + Math.max(0, p.h), 0);
  let r = random() * total;
  for (const p of ok) {
    r -= 1 + Math.max(0, p.h);
    if (r <= 0) return { x: p.x, y: p.y, z: p.z };
  }
  return { x: ok[0].x, y: ok[0].y, z: ok[0].z };
}

// Startled: the free pad within a leap that's farthest from `threat` ({ x, z }), or undefined.
export function farthestPad(spots, here, held, id, threat, T) {
  let best;
  let most = -1;
  for (const [x, y, z] of spots) {
    const p = { x, y, z };
    if ((x === here.x && y === here.y && z === here.z) || !withinLeap(here, p, T) || !padFree(p, held, id)) continue;
    const d = Math.hypot(x + 0.5 - threat.x, z + 0.5 - threat.z);
    if (d > most) {
      most = d;
      best = p;
    }
  }
  return best;
}

// ---------------- what it does ----------------

// What it does next when it's up and about (balance.hopper.choices: weights): "circuit" (leaps to the pads, or across
// the floor), "forage", "sit" (sitting up to look round), "listen" or "walk" (hopping about where the engine takes it).
// A pup doesn't leap.
export function pickChoice(T, pup, random = Math.random) {
  const list = Object.entries(T.choices).filter(([k]) => !(pup && k === "circuit"));
  const total = list.reduce((n, [, w]) => n + w, 0);
  let r = random() * total;
  for (const [k, w] of list) {
    r -= w;
    if (r <= 0) return k;
  }
  return list[list.length - 1][0];
}

// ---------------- what an exhibit needs ----------------

// The way out, when the air of an exhibit with hoppers in it leads out (ex.hops, the jump measure's).
export function hopIssue(plural, hops) {
  const v = hops.escape;
  return `${plural} leap 3 blocks high: the air leads out of the exhibit${v ? ` near ${v.x} ${v.y} ${v.z}` : ""}, so they could leap out over the fence. Roof it over (glass is fine) and close every gap.`;
}

// The Exhibit Clipboard's lines for End Hoppers: the roof and the Landing Pads.
export function hopperLines(ex, residents, T) {
  const lines = [];
  const h = ex.hops;
  if (!h) return ["§fLanding Pads: §7not measured yet: put a Landing Pad inside, then use the Habitat Marker on the ground inside again"];
  lines.push(`§fRoof: ${h.enclosed ? "§aclosed§7 (they can't leap out)" : "§copen§7: they could leap out"}`);
  const need = padsNeeded(residents.filter((a) => !a.juvenile).length, T);
  lines.push(`§fLanding Pads: ${h.counted >= need ? "§a" : "§c"}${h.counted}§7 of ${need} counting, ${h.high ? `§a${h.high}§7 high` : "§cnone§7 high"} (${T.highMin} or more blocks over the floor)`);
  if (h.noClear) lines.push(`§7${h.noClear} without ${T.padClear} blocks of air over them`);
  if (h.outOfReach) lines.push(`§7${h.outOfReach} out of a leap's reach (${T.reachUp} up and ${T.reachAcross} across from the floor or another pad)`);
  return lines;
}

// Care warnings for End Hoppers: the Landing Pads.
export function hopperWarnings(ex, residents, plural, T) {
  const out = [];
  const h = ex.hops;
  if (!h) return out;
  const grown = residents.filter((a) => !a.juvenile).length;
  const need = padsNeeded(grown, T);
  const p = padProblem(ex, grown, T);
  const why = [h.noClear ? `${h.noClear} without ${T.padClear} blocks of air over them` : "", h.outOfReach ? `${h.outOfReach} out of a leap's reach` : ""].filter(Boolean).join(", ");
  if (p === "few") out.push({ severity: 2, text: `${plural} leap between Landing Pads: ${need} or more that count (${h.counted} now${why ? `; ${why}` : ""}). A pad counts with ${T.padClear} blocks of air over it, within ${T.reachUp} blocks up and ${T.reachAcross} across of the floor or another pad. Comfort can't rise above ${T.padComfortCap} without them.` });
  else if (p === "high") out.push({ severity: 2, text: `${plural} want a high leap: put at least one Landing Pad ${T.highMin} or more blocks over the floor (on a pillar, within ${T.reachUp} blocks up of the floor or another pad). Comfort can't rise above ${T.padComfortCap} without one.` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live on the end stone of the outer End islands, 1 to 3 together, out and about at any hour (the End has no day or night) and napping between. They leap up onto blocks ${T.wildUp[0]} to ${T.wildUp[1]} higher and across the ground, never out over the void. Come within ${T.fleeRange} blocks in Survival without sneaking and one gets away in zigzag leaps, then sits up to watch you. Hold Chorus Browse and one comes to sniff it`;
}
