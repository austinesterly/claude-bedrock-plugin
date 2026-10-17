// Owls (0.1.81, the Treetop trio), pure: the night bird's day, its way through the aviary's air, the speed and
// the wingbeats of a flight, the Perches and what an aviary needs. Spec 5.2: "owl | Owl | Nocturnal flight and
// perch watching | Enclosed airspace, nesting boxes"; the items list's "Perch | Resting and landing point for
// parrots, owls, Void Rays". The game side is animals/owl.js; the aviary's air is the flight measure's
// (exhibits/geometry.js floodAerial), as for the Void Ray.
// Sources (research/treetop_facts.md): the Eurasian eagle-owl roosts still on high perches by day, is about at
// dusk and before dawn, hunts by watching from a perch, then flying silently onto prey in flight or on the
// ground; hoots deep at twilight (a pair answers each other), coughs up pellets, and threatens with the wings
// spread in a half-circle, feathers puffed, the bill snapping (ADW; Mikkola 2012; König & Weick 2008). A pair
// shares an aviary of at least 6 x 3.9 x 3.7 m, with perches at varied heights and a nest box (AZA Eagle Owl
// Care Guidelines 2019). 1 to 4 eggs, incubated by the female; the young leave the nest at 5 to 7 weeks and
// make short flights at 7 to 8 (König & Weick 2008).

// The heading (degrees, the game's yaw) of a step dx, dz.
function yawTo(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
}

// The owl mobs, found by type (0.1.70: never by family alone).
export const OWL_TYPES = ["zoocraft:owl", "zoocraft:wild_owl"];
export const WILD_OWL = "zoocraft:wild_owl";

// What an owl is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/owl.py ACT_STATES) and the Field Journal watches for it. 0 is perched (or stood on the ground), awake.
export const ACT = { none: 0, fly: 1, glide: 2, land: 3, watch: 4, roost: 5, hoot: 6, eat: 7, pellet: 8, preen: 9, display: 10, nestbox: 11, beg: 12 };

// The part of the night bird's day (world.getTimeOfDay(): 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight):
// "dusk" and "dawn" are the twilights, when it hoots and goes out or comes back; "night" between them; "day"
// the rest, roosting.
export function phaseOf(t, T) {
  const p = T.phases;
  const time = ((t % 24000) + 24000) % 24000;
  const within = ([a, b]) => (a <= b ? time >= a && time < b : time >= a || time < b);
  if (within(p.dusk)) return "dusk";
  if (within(p.night)) return "night";
  if (within(p.dawn)) return "dawn";
  return "day";
}

// The two notes of a hoot ("oo-HU": the second a little higher), deep and carrying; the female's higher.
export function hootPitch(sex) {
  return sex === "male" ? [0.5, 0.53] : [0.6, 0.63];
}

// ---------------- the way through the air ----------------

const key = (x, y, z) => `${x},${y},${z}`;
const cellOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y + 0.05), z: Math.floor(p.z) });

// The 26 ways from a block to the blocks round it; a diagonal one only through open blocks (no cutting a corner).
const DIRS = [];
for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) if (dx || dy || dz) DIRS.push([dx, dy, dz]);

function cornersOpen(open, x, y, z, d) {
  // Every block on the way: each part of the step taken alone (one axis, or two of three).
  const axes = [0, 1, 2].filter((i) => d[i]);
  for (let mask = 1; mask < (1 << axes.length) - 1; mask++) {
    const s = [0, 0, 0];
    axes.forEach((a, i) => {
      if (mask & (1 << i)) s[a] = d[a];
    });
    if (!open(x + s[0], y + s[1], z + s[2])) return false;
  }
  return true;
}

/**
 * The shortest way through open blocks from the block `from` to the block `to` (a breadth-first search, 26 ways,
 * never cutting a corner): the blocks in order, both ends included, or undefined when there's none within
 * `maxNodes` blocks searched. `open(x, y, z)` says whether a block is flight room (an aviary's measured air).
 */
export function airWay(open, from, to, maxNodes = 6000) {
  const start = key(from.x, from.y, from.z);
  const goal = key(to.x, to.y, to.z);
  if (!open(to.x, to.y, to.z)) return undefined;
  if (start === goal) return [{ ...from }];
  const prev = new Map([[start, ""]]);
  const queue = [[from.x, from.y, from.z]];
  for (let head = 0; head < queue.length && prev.size <= maxNodes; head++) {
    const [x, y, z] = queue[head];
    for (const [dx, dy, dz] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      const k = key(nx, ny, nz);
      if (prev.has(k) || !open(nx, ny, nz)) continue;
      if (((dx && dy) || (dx && dz) || (dy && dz)) && !cornersOpen(open, x, y, z, [dx, dy, dz])) continue;
      prev.set(k, key(x, y, z));
      if (k === goal) {
        const out = [];
        for (let c = goal; c; c = prev.get(c)) {
          const [a, b, d] = c.split(",").map(Number);
          out.push({ x: a, y: b, z: d });
        }
        return out.reverse();
      }
      queue.push([nx, ny, nz]);
    }
  }
  return undefined;
}

/**
 * A way through open air in the wild, where the air has no edge (an A* search, 26 ways, never cutting a corner,
 * heading for `to` first): the blocks in order, both ends included, or undefined when there's none within
 * `maxNodes` blocks looked at. The search keeps to a box round the two ends (`spread` blocks beyond them, up to
 * `over` blocks above the higher), so it never wanders off into the sky.
 */
export function seekWay(open, from, to, maxNodes = 3000, spread = 6, over = 10) {
  if (!open(to.x, to.y, to.z) || !open(from.x, from.y, from.z)) return undefined;
  const lo = { x: Math.min(from.x, to.x) - spread, y: Math.min(from.y, to.y) - 3, z: Math.min(from.z, to.z) - spread };
  const hi = { x: Math.max(from.x, to.x) + spread, y: Math.max(from.y, to.y) + over, z: Math.max(from.z, to.z) + spread };
  const inside = (x, y, z) => x >= lo.x && x <= hi.x && y >= lo.y && y <= hi.y && z >= lo.z && z <= hi.z && open(x, y, z);
  const h = (x, y, z) => Math.hypot(x - to.x, y - to.y, z - to.z);
  const start = key(from.x, from.y, from.z);
  const goal = key(to.x, to.y, to.z);
  if (start === goal) return [{ ...from }];
  const prev = new Map([[start, ""]]);
  const cost = new Map([[start, 0]]);
  // A binary heap of [f, x, y, z].
  const heap = [[h(from.x, from.y, from.z), from.x, from.y, from.z]];
  const push = (n) => {
    heap.push(n);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  const done = new Set();
  while (heap.length && done.size <= maxNodes) {
    const [, x, y, z] = pop();
    const here = key(x, y, z);
    if (done.has(here)) continue;
    done.add(here);
    if (here === goal) {
      const out = [];
      for (let c = goal; c; c = prev.get(c)) {
        const [a, b, d] = c.split(",").map(Number);
        out.push({ x: a, y: b, z: d });
      }
      return out.reverse();
    }
    const g = cost.get(here);
    for (const [dx, dy, dz] of DIRS) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      const k = key(nx, ny, nz);
      if (done.has(k) || !inside(nx, ny, nz)) continue;
      if (((dx && dy) || (dx && dz) || (dy && dz)) && !cornersOpen(inside, x, y, z, [dx, dy, dz])) continue;
      const ng = g + Math.hypot(dx, dy, dz);
      if (ng >= (cost.get(k) ?? Infinity)) continue;
      cost.set(k, ng);
      prev.set(k, here);
      push([ng + h(nx, ny, nz), nx, ny, nz]);
    }
  }
  return undefined;
}

// Is the straight line from `a` to `b` (an owl's feet) clear for its body: `body.half` blocks to each side and
// `body.height` up, through open blocks only? Checked every `step` blocks along it.
export function clearLine(open, a, b, body, step = 0.2) {
  const len = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  const n = Math.max(1, Math.ceil(len / step));
  const h = body.half;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = a.x + (b.x - a.x) * f;
    const y = a.y + (b.y - a.y) * f;
    const z = a.z + (b.z - a.z) * f;
    for (const oy of [0.02, body.height]) {
      for (const [ox, oz] of [[-h, -h], [h, -h], [-h, h], [h, h]]) {
        if (!open(Math.floor(x + ox), Math.floor(y + oy), Math.floor(z + oz))) return false;
      }
    }
  }
  return true;
}

// A way of blocks made into a flight: the middle of each block (feet `lift` above its floor), then straightened
// (each point joined to the furthest one after it with a clear line, so it flies straight across open air and
// bends only round what's in the way). `start` and `end` replace the first and last points (where it is, where
// it lands).
export function smoothWay(open, cells, start, end, body, lift = 0.1) {
  const pts = cells.map((c) => ({ x: c.x + 0.5, y: c.y + lift, z: c.z + 0.5 }));
  pts[0] = { ...start };
  pts[pts.length - 1] = { ...end };
  if (pts.length <= 2) return pts;
  const out = [pts[0]];
  let i = 0;
  while (i < pts.length - 1) {
    let j = i + 1;
    while (j + 1 < pts.length && clearLine(open, pts[i], pts[j + 1], body)) j++;
    out.push(pts[j]);
    i = j;
  }
  return out;
}

// A flight along `pts`: its length, for the speed and the point along it.
export function flightOf(pts) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y, pts[i].z - pts[i - 1].z));
  return { pts, lens, total: lens[lens.length - 1] };
}

// The point `s` blocks along a flight (its end past the end), and the way it's heading there (dx, dy, dz).
export function along(f, s) {
  const { pts, lens } = f;
  if (pts.length === 1) return { ...pts[0], dx: 0, dy: 0, dz: 0 };
  let i = 1;
  while (i < pts.length - 1 && lens[i] < s) i++;
  const p = pts[i - 1];
  const q = pts[i];
  const len = lens[i] - lens[i - 1];
  const t = len > 0 ? Math.max(0, Math.min(1, (s - lens[i - 1]) / len)) : 1;
  return { x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t, z: p.z + (q.z - p.z) * t, dx: q.x - p.x, dy: q.y - p.y, dz: q.z - p.z };
}

// How fast it flies `s` blocks into a flight `total` long (blocks a tick): it takes off slowly and gathers speed,
// cruises, and slows to land; `fly.cruise` at most, `fly.slow` at the very start and end.
export function speedAt(s, total, fly) {
  const up = fly.slow + Math.sqrt(2 * fly.accel * Math.max(0, s));
  const down = fly.slow + Math.sqrt(2 * fly.brake * Math.max(0, total - s));
  return Math.min(fly.cruise, up, down);
}

// What its wings do `s` blocks into a flight (the act): flapping to take off and to climb, landing (feet forward,
// wings up) over the last stretch, and between, now flapping, now gliding, `tick` keeping the rhythm (a few
// wingbeats, then a glide). `dy` is how much the flight climbs along this stretch, of `len`.
export function wingsAt(s, total, dy, len, tick, fly) {
  if (total - s <= fly.landStretch) return ACT.land;
  if (s < fly.takeoffStretch) return ACT.fly;
  if (len > 0 && dy / len > 0.25) return ACT.fly; // climbing
  if (len > 0 && dy / len < -0.15) return ACT.glide; // down
  return tick % (fly.flapTicks + fly.glideTicks) < fly.flapTicks ? ACT.fly : ACT.glide;
}

// ---------------- the Perches ----------------

// The Perches an owl lands on: each one's record with the block it stands on (the one above the Perch, which
// the flight measure calls a perch cell). `fixtures`: the exhibit's linked fixtures.
export function roostsOf(fixtures) {
  return fixtures.filter((f) => f.type === "roost").map((f) => ({ id: f.id, pos: f.pos, cell: { x: f.pos.x, y: f.pos.y + 1, z: f.pos.z } }));
}

// How far apart in height its Perches are (blocks: the highest less the lowest), 0 with one or none.
export function perchSpread(roosts) {
  if (roosts.length < 2) return 0;
  const ys = roosts.map((r) => r.pos.y);
  return Math.max(...ys) - Math.min(...ys);
}

// Perches at varied heights (AZA 2019): two or more blocks between the highest and the lowest. An exhibit not
// measured yet (no count) passes.
export function hasPerchSpread(species, ex, T) {
  if (!species.roosts || ex.roostSpread === undefined) return true;
  return ex.roostSpread >= T.perchSpread;
}

// The highest free Perch (an owl roosts high by day), or undefined. `used` holds the ids taken by other owls.
export function highestFree(roosts, used) {
  let best;
  for (const r of roosts) if (!used.has(r.id) && (!best || r.pos.y > best.pos.y)) best = r;
  return best;
}

// How high the block `c` is over the floor (blocks): the floor is the nearest flight-measure "land" cell below
// it, in its own column or beside it. Undefined with no floor within `depth`.
export function heightAbove(cells, c, depth = 16) {
  for (let dy = 0; dy <= depth; dy++) {
    for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (cells.get(key(c.x + dx, c.y - dy, c.z + dz)) === "land") return dy;
    }
  }
  return undefined;
}

// A floor block beside the feeder at `pos` for an owl to land on and mantle over the food (the nearest to `from`).
export function feederSpot(cells, pos, from) {
  let best;
  let bestD = Infinity;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (const dy of [0, 1]) {
      const c = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
      if (cells.get(key(c.x, c.y, c.z)) !== "land") continue;
      const d = Math.hypot(c.x + 0.5 - from.x, c.z + 0.5 - from.z);
      if (d < bestD) {
        best = { cell: c, yaw: yawTo(-dx, -dz) };
        bestD = d;
      }
    }
  }
  return best;
}

// ---------------- the wild ----------------

// A treetop in a column (the top block of it, between `top` and `bottom`, is leaves with open air above): where
// its feet go, or undefined. `read` gives block categories with leaves.
export function treetopAt(read, x, z, top, bottom) {
  for (let y = top; y >= bottom; y--) {
    const c = read(x, y, z);
    if (c === "air") continue;
    if (c !== "leaves") return undefined;
    return read(x, y + 1, z) === "air" && read(x, y + 2, z) === "air" ? { x, y: y + 1, z } : undefined;
  }
  return undefined;
}

// The ground in a column: open air over a floor that isn't leaves or water, or undefined.
export function groundAt(read, x, z, top, bottom) {
  for (let y = top; y >= bottom; y--) {
    const c = read(x, y, z);
    if (c === "air") continue;
    if (c === "leaves" || c === "water" || c === "lava" || c === "unloaded") return undefined;
    return read(x, y + 1, z) === "air" ? { x, y: y + 1, z } : undefined;
  }
  return undefined;
}

// A flight through open air from `a` to `b` in the wild (feet points): straight, or up over what's in the way
// (up to `rise` blocks over the higher end, across, and down onto it). The points, or undefined.
export function wildRoute(open, a, b, body, rise = [2, 4, 7]) {
  if (clearLine(open, a, b, body)) return [a, b];
  for (const r of rise) {
    const y = Math.max(a.y, b.y) + r;
    const up = { x: a.x, y, z: a.z };
    const over = { x: b.x, y, z: b.z };
    if (clearLine(open, a, up, body) && clearLine(open, up, over, body) && clearLine(open, over, b, body)) return [a, up, over, b];
  }
  return undefined;
}

// Someone holding the bait, or an empty carrier with the bait on them: it comes down to them and stays.
export function tempts(heldId, emptyCarrier, baitOnThem, bait) {
  return heldId === bait || (emptyCarrier && baitOnThem);
}

// The spot `gap` blocks from the player at `p`, toward the owl at `o` (feet level with the player's).
export function besidePlayer(p, o, gap) {
  const dx = o.x - p.x;
  const dz = o.z - p.z;
  const d = Math.hypot(dx, dz) || 1;
  return { x: p.x + (dx / d) * gap, y: p.y, z: p.z + (dz / d) * gap };
}

// The Field Journal's line on a wild one.
export function wildLine(T) {
  return `In the wild an owl roosts in a treetop by day and flies from tree to tree at night, swooping onto prey on the ground. Hold a Meat Ration within ${T.baitRange} blocks and it comes down to land by you; it stays while you hold the ration, or an empty Small Carrier with one on you. Come right up to one on the ground and it spreads its wings, hissing and snapping its bill; keep coming and it flies off`;
}

// ---------------- what an aviary needs ----------------

// The Exhibit Clipboard's lines for owls: the Perches and their heights, and the Nest Box.
export function owlLines(ex, residents, fixtures, T) {
  const roosts = roostsOf(fixtures);
  const spread = perchSpread(roosts);
  const nests = fixtures.filter((f) => f.type === "nest").length;
  const lines = [];
  lines.push(`§fPerches: ${roosts.length >= T.minPerches ? "§a" : "§c"}${roosts.length}§7 (${T.minPerches} or more)${roosts.length >= 2 ? `, ${spread >= T.perchSpread ? "§a" : "§e"}${spread} block${spread === 1 ? "" : "s"} between the highest and the lowest§7 (${T.perchSpread} or more)` : ""}`);
  lines.push(`§fNest Box: ${nests ? `§a${nests}§7: they lay their eggs in it` : "§7none (they lay their eggs only in a Nest Box)"}`);
  return lines;
}

// Care warnings for owls (exhibit, residents, its fixtures).
export function owlWarnings(ex, residents, fixtures, T) {
  const out = [];
  const roosts = roostsOf(fixtures);
  if (roosts.length >= 2 && perchSpread(roosts) < T.perchSpread) out.push({ severity: 1, text: `The Perches are all about one height: put one ${T.perchSpread} or more blocks higher or lower than another (owls use high and low perches; comfort can't rise above ${T.perchComfortCap} until then).` });
  if (ex.breeding?.on && !fixtures.some((f) => f.type === "nest")) out.push({ severity: 1, text: "Breeding is on, but owls lay their eggs only in a Nest Box: place one in the aviary (on the floor or a ledge)." });
  return out;
}

// For the threat display: is an owl at `c` low enough to feel cornered (on the ground or a low perch)?
export function isLow(height, T) {
  return height !== undefined && height <= T.lowPerch;
}

export { cellOf as owlCell };
