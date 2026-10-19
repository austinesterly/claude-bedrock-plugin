// Warped Geckos (0.1.85, the Nether trio; spec 5.3 "warped_gecko | Blue-green luminous climber | Wall clinging and
// vertical hunting | Registered climbing surfaces and insect feed"), pure. A fantasy animal built on the New
// Caledonian giant gecko (research/nether_facts.md): it climbs walls and glass, hides in cracks by day, calls at
// dusk, hunts moths at night and stares down a rival male. The game side is animals/gecko.js.
//
// Where a gecko can be: a spot is an open block ("air", or an open gate) and the face it holds, the floor under it
// ("f") or one of the four walls beside it ("e" +x, "w" -x, "s" +z, "n" -z). It holds a whole block's face, stone,
// wood, leaves or glass (a gecko reader, blockReader(..., { leaves: true, gecko: true }), gives "partial" for blocks
// that aren't a full cube: slabs, stairs, fences, zoo equipment), and it never hangs under a roof. From a spot it
// moves (movesFrom) along the floor; up, down and sideways along a wall; from the floor onto a wall in the same
// block and back; round an inside corner; over the top of a wall onto it; off the edge of a ledge, down its side;
// and round an outside corner. Routes are a breadth-first search (explore) on that graph inside a box.

// The gecko mobs, found by type (0.1.70: never by family alone).
export const GECKO_TYPES = ["zoocraft:warped_gecko", "zoocraft:wild_warped_gecko"];
export const WILD_GECKO = "zoocraft:wild_warped_gecko";

// What a gecko is doing (its zoocraft:act entity property; gen/gecko.py ACT_STATES): 0 nothing in particular (the
// engine walking it when someone tempts it), walking or running along a route, still (clinging or sitting),
// stalking a moth, the snap, calling, licking an eye, head-bobbing at a rival, the threat, tucked into its hide,
// asleep. The Field Journal watches for them.
export const ACT = { none: 0, walk: 1, run: 2, still: 3, stalk: 4, snap: 5, call: 6, lick: 7, bob: 8, threat: 9, hide: 10, sleep: 11 };
// How it sits (its zoocraft:pose entity property): on the floor; on a wall head up (facing it); head down (facing
// away from it); crossing a wall that is on its left; crossing one on its right.
export const POSE = { floor: 0, up: 1, down: 2, sideL: 3, sideR: 4 };
// How far a grown gecko's middle sits from the wall it clings to, in blocks: gen/gecko.py WALL (5.5 model units, at
// 32 a block). The pose bone turns about a point that far above its soles, so the soles lie on the wall.
export const WALL_GAP = 5.5 / 32;

export const DIR = { e: { x: 1, z: 0 }, w: { x: -1, z: 0 }, s: { x: 0, z: 1 }, n: { x: 0, z: -1 } };
const FACES = ["e", "w", "s", "n"];
const OPPOSITE = { e: "w", w: "e", s: "n", n: "s" };
const ACROSS = { e: ["s", "n"], w: ["s", "n"], s: ["e", "w"], n: ["e", "w"] };

// What a gecko makes of a gecko reader's categories.
export const geckoOpen = (c) => c === "air" || c === "gate_open";
export const geckoGrips = (c) => c === "solid" || c === "leaves";

export const spotKey = (s) => `${s.x},${s.y},${s.z},${s.f}`;

// The face letter for a step (dx, dz) along one axis.
export function faceOf(dx, dz) {
  if (Math.abs(dx) >= Math.abs(dz)) return dx >= 0 ? "e" : "w";
  return dz >= 0 ? "s" : "n";
}

// Which way an animal faces to look along (dx, dz), as a Minecraft yaw in degrees.
export function yawTo(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
}

/**
 * Can a gecko be at this spot: its block open, and the face it holds solid?
 * @param {(x: number, y: number, z: number) => string} read a gecko reader
 * @param {{x:number,y:number,z:number,f:string}} s
 */
export function validSpot(read, s) {
  if (!geckoOpen(read(s.x, s.y, s.z))) return false;
  if (s.f === "f") return geckoGrips(read(s.x, s.y - 1, s.z));
  const d = DIR[s.f];
  return Boolean(d) && geckoGrips(read(s.x + d.x, s.y, s.z + d.z));
}

/**
 * The moves from a spot (see the note at the top), each { to, kind }: "walk" (floor to floor), "onto" (the floor to
 * a wall of the same block), "off" (a wall to the floor of the same block), "turn" (round an inside corner, in the
 * same block), "up", "down", "along" (sideways along a wall), "top" (over the top of a wall onto it), "edge" (off the
 * edge of a ledge and down its side) and "round" (round an outside corner).
 * @param {(x: number, y: number, z: number) => string} read
 * @param {{x:number,y:number,z:number,f:string}} s
 * @returns {{ to: {x:number,y:number,z:number,f:string}, kind: string }[]}
 */
export function movesFrom(read, s) {
  const out = [];
  const open = (x, y, z) => geckoOpen(read(x, y, z));
  const grips = (x, y, z) => geckoGrips(read(x, y, z));
  const { x, y, z } = s;
  if (s.f === "f") {
    for (const f of FACES) {
      const d = DIR[f];
      const nx = x + d.x;
      const nz = z + d.z;
      if (grips(nx, y, nz)) out.push({ to: { x, y, z, f }, kind: "onto" });
      else if (open(nx, y, nz)) {
        if (grips(nx, y - 1, nz)) out.push({ to: { x: nx, y, z: nz, f: "f" }, kind: "walk" });
        else if (open(nx, y - 1, nz)) out.push({ to: { x: nx, y: y - 1, z: nz, f: OPPOSITE[f] }, kind: "edge" });
      }
    }
    return out;
  }
  const d = DIR[s.f];
  if (open(x, y + 1, z)) {
    if (grips(x + d.x, y + 1, z + d.z)) out.push({ to: { x, y: y + 1, z, f: s.f }, kind: "up" });
    else if (open(x + d.x, y + 1, z + d.z)) out.push({ to: { x: x + d.x, y: y + 1, z: z + d.z, f: "f" }, kind: "top" });
  }
  if (grips(x, y - 1, z)) out.push({ to: { x, y, z, f: "f" }, kind: "off" });
  else if (open(x, y - 1, z) && grips(x + d.x, y - 1, z + d.z)) out.push({ to: { x, y: y - 1, z, f: s.f }, kind: "down" });
  for (const p of ACROSS[s.f]) {
    const q = DIR[p];
    const nx = x + q.x;
    const nz = z + q.z;
    if (grips(nx, y, nz)) out.push({ to: { x, y, z, f: p }, kind: "turn" });
    else if (open(nx, y, nz)) {
      if (grips(nx + d.x, y, nz + d.z)) out.push({ to: { x: nx, y, z: nz, f: s.f }, kind: "along" });
      else if (open(nx + d.x, y, nz + d.z)) out.push({ to: { x: nx + d.x, y, z: nz + d.z, f: OPPOSITE[p] }, kind: "round" });
    }
  }
  return out;
}

/**
 * Every spot a gecko can get to from `start`, nearest first (a breadth-first search, at most `limit` spots),
 * keeping to the blocks inside `box` ({ min, max }, inclusive). Each entry: { s, prev (the key of the spot it came
 * from), kind (the move that got it there), d (moves from the start) }.
 * @param {(x: number, y: number, z: number) => string} read
 * @param {{x:number,y:number,z:number,f:string}} start
 * @param {{ min: {x:number,y:number,z:number}, max: {x:number,y:number,z:number} }} box
 * @param {number} limit
 * @returns {Map<string, { s: {x:number,y:number,z:number,f:string}, prev: string | undefined, kind: string | undefined, d: number }>}
 */
export function explore(read, start, box, limit) {
  const memo = new Map();
  const r = (x, y, z) => {
    const k = `${x},${y},${z}`;
    let c = memo.get(k);
    if (c === undefined) {
      c = read(x, y, z);
      memo.set(k, c);
    }
    return c;
  };
  const inBox = (s) => s.x >= box.min.x && s.x <= box.max.x && s.y >= box.min.y && s.y <= box.max.y && s.z >= box.min.z && s.z <= box.max.z;
  const seen = new Map();
  seen.set(spotKey(start), { s: start, prev: undefined, kind: undefined, d: 0 });
  const queue = [start];
  for (let head = 0; head < queue.length && seen.size < limit; head++) {
    const s = queue[head];
    const here = seen.get(spotKey(s));
    for (const m of movesFrom(r, s)) {
      const k = spotKey(m.to);
      if (seen.has(k) || !inBox(m.to)) continue;
      seen.set(k, { s: m.to, prev: spotKey(s), kind: m.kind, d: here.d + 1 });
      queue.push(m.to);
      if (seen.size >= limit) break;
    }
  }
  return seen;
}

/**
 * The route from the search's start to the spot `key`: [{ s, kind }], the start first (its kind undefined).
 * @param {ReturnType<typeof explore>} seen
 * @param {string} key
 */
export function routeTo(seen, key) {
  const out = [];
  let k = key;
  while (k !== undefined) {
    const n = seen.get(k);
    if (!n) return [];
    out.push({ s: n.s, kind: n.kind });
    k = n.prev;
  }
  return out.reverse();
}

// Where a gecko at this spot sits (its entity position): the middle of the block's floor, or `gap` from the wall
// with its middle halfway up the block.
export function spotPos(s, gap = WALL_GAP) {
  if (s.f === "f") return { x: s.x + 0.5, y: s.y, z: s.z + 0.5 };
  const d = DIR[s.f];
  return { x: s.x + 0.5 + d.x * (0.5 - gap), y: s.y + 0.5 - gap, z: s.z + 0.5 + d.z * (0.5 - gap) };
}

/**
 * How it sits holding the face `f` going the way `t` ("up", "down" or a face letter for a way across): its pose and
 * yaw. On the floor it faces the way it goes. On a wall going up it faces the wall head up; going down, away from
 * it head down (as it does going straight out from the wall); going across, it faces that way with the wall on its
 * left or its right (a mob's left, facing (fx, fz), is (fz, -fx)).
 * @returns {{ pose: number, yaw: number }}
 */
export function poseFor(f, t) {
  if (f === "f") {
    const q = DIR[t] ?? DIR.s;
    return { pose: POSE.floor, yaw: yawTo(q.x, q.z) };
  }
  const d = DIR[f];
  if (t === "up" || t === f) return { pose: POSE.up, yaw: yawTo(d.x, d.z) };
  if (t === "down" || t === OPPOSITE[f]) return { pose: POSE.down, yaw: yawTo(-d.x, -d.z) };
  const q = DIR[t];
  const leftWall = q.z === d.x && -q.x === d.z;
  return { pose: leftWall ? POSE.sideL : POSE.sideR, yaw: yawTo(q.x, q.z) };
}

/**
 * The legs of a route for the mover: [{ to, ticks, act, pose, yaw, spot }], each a glide to `to` (a position) over
 * `ticks` ticks, at `speed` blocks a tick, doing `act` and sitting `pose`, facing `yaw`; the last leg of each move
 * carries the route's `spot` it ends on (so a route can stop short there). Going over the top of a wall
 * it climbs to the lip first; off the edge of a ledge it goes to the edge first; round an outside corner it goes to
 * the corner first, so it never cuts through a block.
 * @param {{ s: {x:number,y:number,z:number,f:string}, kind: string | undefined }[]} route
 */
export function legsAlong(route, gap, speed, act) {
  const legs = [];
  if (!route.length) return legs;
  let at = spotPos(route[0].s, gap);
  const go = (to, p, a = act) => {
    const ticks = Math.max(2, Math.round(Math.hypot(to.x - at.x, to.y - at.y, to.z - at.z) / speed));
    legs.push({ to, ticks, act: a, pose: p.pose, yaw: p.yaw });
    at = to;
  };
  for (let i = 1; i < route.length; i++) {
    const a = route[i - 1].s;
    const b = route[i].s;
    switch (route[i].kind) {
      case "walk":
        go(spotPos(b, gap), poseFor("f", faceOf(b.x - a.x, b.z - a.z)));
        break;
      case "onto":
        go(spotPos(b, gap), poseFor(b.f, "up"));
        break;
      case "off":
        go(spotPos(b, gap), poseFor("f", OPPOSITE[a.f]));
        break;
      case "turn":
        go(spotPos(b, gap), poseFor(b.f, OPPOSITE[a.f]));
        break;
      case "up":
      case "down":
        go(spotPos(b, gap), poseFor(a.f, route[i].kind));
        break;
      case "along":
        go(spotPos(b, gap), poseFor(a.f, faceOf(b.x - a.x, b.z - a.z)));
        break;
      case "top": {
        // Up the wall until its feet are level with the top, then over onto it (never through the lip).
        const p = spotPos(a, gap);
        go({ x: p.x, y: a.y + 1, z: p.z }, poseFor(a.f, "up"));
        go(spotPos(b, gap), poseFor("f", a.f));
        break;
      }
      case "edge": {
        // Out over the edge with its feet level with the top, then head down the side.
        const t = OPPOSITE[b.f]; // the way it walked off
        const q = DIR[t];
        go({ x: a.x + 0.5 + q.x * (0.5 + gap), y: a.y, z: a.z + 0.5 + q.z * (0.5 + gap) }, poseFor("f", t));
        go(spotPos(b, gap), poseFor(b.f, "down"));
        break;
      }
      case "round": {
        const d = DIR[a.f];
        const t = faceOf(b.x - a.x - d.x, b.z - a.z - d.z); // the way across it went
        const q = DIR[t];
        go({ x: a.x + 0.5 + d.x * (0.5 - gap) + q.x * (0.5 + gap), y: a.y + 0.5 - gap, z: a.z + 0.5 + d.z * (0.5 - gap) + q.z * (0.5 + gap) }, poseFor(a.f, t));
        go(spotPos(b, gap), poseFor(b.f, a.f));
        break;
      }
      default:
        go(spotPos(b, gap), poseFor(b.f, "up"));
    }
    legs[legs.length - 1].spot = b; // the move's last leg ends on the route's spot
  }
  return legs;
}

/**
 * Is this block a crack: open, with solid blocks a gecko holds on three of its four sides and the fourth open? The
 * way out (a face letter), or undefined.
 * @param {(x: number, y: number, z: number) => string} read
 */
export function crackAt(read, x, y, z) {
  if (!geckoOpen(read(x, y, z))) return undefined;
  let out;
  let held = 0;
  for (const f of FACES) {
    const d = DIR[f];
    const c = read(x + d.x, y, z + d.z);
    if (geckoGrips(c)) held++;
    else if (geckoOpen(c)) out = f;
  }
  return held === 3 && out ? out : undefined;
}

/**
 * How a gecko sits tucked into a crack whose way out is `out`, at the spot `s` in it: on the crack's floor facing
 * out, or clinging to a side of it with its head toward the way out (on the back of it, facing out head down).
 */
export function hidePose(s, out) {
  return s.f === "f" ? poseFor("f", out) : poseFor(s.f, out);
}

/**
 * The wall measure (exhibits/exhibits.js, for Warped Geckos): over the air the flight flood found (cells: key
 * "x,y,z" -> kind), the wall faces a gecko can cling to (an open block beside a solid one it holds, glass too: one
 * for each side) and the cracks (crackAt): how many, and where the first `keep` are ([x, y, z, way out]).
 * @param {(x: number, y: number, z: number) => string} read a gecko reader
 * @param {Map<string, string>} cells
 * @param {{ cellsPerYield: number, keep: number }} opts
 * @param {ReturnType<typeof newWallsResult>} out
 */
export function* measureWalls(read, cells, opts, out) {
  let work = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const f of FACES) {
      const d = DIR[f];
      if (geckoGrips(read(x + d.x, y, z + d.z))) out.faces++;
    }
    const way = crackAt(read, x, y, z);
    if (way) {
      out.cracks++;
      if (out.crackSpots.length < opts.keep) out.crackSpots.push([x, y, z, way]);
    }
    if (++work % opts.cellsPerYield === 0) yield;
  }
  return out;
}

// A new wall measure result; the exhibit adds whether its air leads out (enclosed, escape) and the air's box.
/** @returns {{ faces: number, cracks: number, crackSpots: (number|string)[][], enclosed?: boolean, escape?: { x: number, y: number, z: number }, box?: { min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } }} */
export function newWallsResult() {
  return { faces: 0, cracks: 0, crackSpots: [] };
}

// The part of a gecko's day (world.getTimeOfDay(): 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight): "dusk", when
// it wakes and calls; "night", when it climbs and hunts; "dawn", when it goes back to its hide; "day", asleep in it.
// In a nocturnal house (`house`) it is turned round, a half-day on, so guests see it by day.
export function phaseOf(t, T, house = false) {
  const p = T.phases;
  const time = (((t + (house ? 12000 : 0)) % 24000) + 24000) % 24000;
  const within = ([a, b]) => (a <= b ? time >= a && time < b : time >= a || time < b);
  if (within(p.dusk)) return "dusk";
  if (within(p.night)) return "night";
  if (within(p.dawn)) return "dawn";
  return "day";
}

// Where it likes to be at night (the height above the floor `h` of a spot): a grown male keeps low, within T.maleLow
// blocks of the floor (the males hold the lower branches); a female or a youngster goes higher, any height.
export function heightOk(h, male, adult, T) {
  return male && adult ? h <= T.maleLow : true;
}

/**
 * Where it goes next at night, from a search round it (explore): a spot `T.wanderMin` to `T.wanderMax` moves away
 * at a height it likes (heightOk, from `floorY`), a wall rather than the floor three times in four; picked by
 * `random`. Undefined when nowhere suits.
 * @param {ReturnType<typeof explore>} seen
 */
export function pickWander(seen, floorY, male, adult, T, random = Math.random) {
  const ok = [];
  const walls = [];
  for (const [k, n] of seen) {
    if (n.d < T.wanderMin || n.d > T.wanderMax) continue;
    if (!heightOk(n.s.y - floorY, male, adult, T)) continue;
    ok.push(k);
    if (n.s.f !== "f") walls.push(k);
  }
  const pool = walls.length && random() < 0.75 ? walls : ok;
  return pool.length ? pool[Math.floor(random() * pool.length)] : undefined;
}

/**
 * Where it hides for the day, from a search round it: the nearest crack (`crack(x, y, z)`: its way out, or
 * undefined), else the nearest spot on a Burrow Shelter's floor (`shelters`: "x,y,z" keys), else the highest wall
 * spot it reached (asleep up there). { key, how: "crack" | "shelter" | "wall", out } or undefined.
 * @param {ReturnType<typeof explore>} seen
 * @param {(x: number, y: number, z: number) => string | undefined} crack
 * @param {Set<string>} shelters
 */
export function pickHide(seen, crack, shelters) {
  let shelter;
  let high;
  for (const [k, n] of seen) {
    const { x, y, z } = n.s;
    const out = crack(x, y, z);
    if (out) return { key: k, how: "crack", out };
    if (!shelter && n.s.f === "f" && shelters.has(`${x},${y},${z}`)) shelter = k;
    if (n.s.f !== "f" && (!high || n.s.y > seen.get(high).s.y)) high = k;
  }
  if (shelter) return { key: shelter, how: "shelter", out: undefined };
  return high ? { key: high, how: "wall", out: undefined } : undefined;
}

/**
 * The spot to snap up a moth sitting at the spot `m` from: on the same wall a block above, below or beside it (it
 * then faces the moth: see facingSpot), else any spot whose middle is within 1.5 blocks of the moth's. The nearest
 * such in the search, or undefined.
 * @param {ReturnType<typeof explore>} seen
 */
export function pickStalk(seen, m, gap = WALL_GAP) {
  const at = spotPos(m, gap);
  let near;
  for (const [k, n] of seen) {
    const s = n.s;
    if (s.f === m.f && Math.abs(s.x - m.x) + Math.abs(s.y - m.y) + Math.abs(s.z - m.z) === 1) return k;
    if (!near && !(s.x === m.x && s.y === m.y && s.z === m.z)) {
      const p = spotPos(s, gap);
      if (Math.hypot(p.x - at.x, p.y - at.y, p.z - at.z) <= 1.5) near = k;
    }
  }
  return near;
}

// How it sits at the spot `s` to face something at the spot `t` (a moth, a rival): on the same wall, up, down or
// across toward it; on the floor, toward it; else as `fallback` ({ pose, yaw }).
export function facingSpot(s, t, fallback) {
  if (s.f === "f") {
    const dx = t.x - s.x;
    const dz = t.z - s.z;
    return dx || dz ? poseFor("f", faceOf(dx, dz)) : fallback;
  }
  if (t.f === s.f) {
    if (t.y > s.y) return poseFor(s.f, "up");
    if (t.y < s.y) return poseFor(s.f, "down");
    const dx = t.x - s.x;
    const dz = t.z - s.z;
    if (dx || dz) return poseFor(s.f, faceOf(dx, dz));
  }
  return fallback;
}

// Pairs of rival males: grown males (each { id, x, y, z }) within `range` blocks of each other, each in one pair at
// most, nearest first.
export function rivalPairs(males, range) {
  const pairs = [];
  for (let i = 0; i < males.length; i++) {
    for (let j = i + 1; j < males.length; j++) {
      const a = males[i];
      const b = males[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (d <= range) pairs.push({ a: a.id, b: b.id, d });
    }
  }
  pairs.sort((p, q) => p.d - q.d);
  const used = new Set();
  const out = [];
  for (const p of pairs) {
    if (used.has(p.a) || used.has(p.b)) continue;
    used.add(p.a);
    used.add(p.b);
    out.push(p);
  }
  return out;
}

// Wall spots for a moth near an Insect Feeder (or near a wild gecko): every spot on a wall (validSpot) in the open
// blocks within `r` blocks of `at`, the block itself left out, inside `inside` when it's given.
export function mothSpots(read, at, r, inside = undefined) {
  const out = [];
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -1; dy <= r; dy++) {
      for (let dz = -r; dz <= r; dz++) {
        if (!dx && !dy && !dz) continue;
        if (Math.hypot(dx, dy, dz) > r) continue;
        const x = at.x + dx;
        const y = at.y + dy;
        const z = at.z + dz;
        if (inside && !inside(x, y, z)) continue;
        if (!geckoOpen(read(x, y, z))) continue;
        for (const f of FACES) {
          const d = DIR[f];
          if (geckoGrips(read(x + d.x, y, z + d.z))) out.push({ x, y, z, f });
        }
      }
    }
  }
  return out;
}

// Where a moth sits on the wall of its spot (the particle's place): nearly against the wall, halfway up.
export function mothPos(m) {
  const d = DIR[m.f] ?? { x: 0, z: 0 };
  return { x: m.x + 0.5 + d.x * 0.42, y: m.y + 0.55, z: m.z + 0.5 + d.z * 0.42 };
}

// ---------------- the exhibit ----------------
// The clipboard's line about the walls, for an exhibit geckos live in or might move into (`n` geckos).
export function wallsLine(ex, n, plural, T) {
  const w = ex.walls;
  if (!w) return "§fClimbing walls: §7not measured yet: put an Insect Feeder inside, then use the Habitat Marker on the ground inside again";
  const need = T.wallFaces * Math.max(1, n);
  const roof = w.enclosed ? "§aclosed§7" : `§copen§7 (${plural.toLowerCase()} climb glass and walls: the air leads out${w.escape ? ` near ${w.escape.x} ${w.escape.y} ${w.escape.z}` : ""}, so roof it over)`;
  const faces = w.faces >= need ? `§a${w.faces}§7` : `§e${w.faces}§7 (${need} for ${Math.max(1, n)})`;
  return `§fClimbing walls: ${faces} wall faces to cling to, ${w.cracks} crack${w.cracks === 1 ? "" : "s"} to hide in; roof ${roof}`;
}

// The issue an exhibit shows when its air leads out and geckos live in it (they'd climb out).
export function roofIssue(plural, walls) {
  const v = walls.escape;
  return `${plural} climb glass and walls: the air leads out of the exhibit${v ? ` near ${v.x} ${v.y} ${v.z}` : ""}, so they could climb out. Roof it over (glass is fine) and close every gap.`;
}

// Too few wall faces for this many geckos (comfort is capped, cause "walls")? Never before the measure.
export function wallsShort(ex, n, T) {
  return ex.walls ? ex.walls.faces < T.wallFaces * Math.max(1, n) : false;
}

// Places to hide: the cracks the measure counted and the Burrow Shelters in the exhibit (`shelters`).
export function hidesIn(ex, shelters) {
  return (ex.walls?.cracks ?? 0) + shelters;
}

// The comfort checks (animals/welfare.js; true when all is well, and always for a species without the need or an
// exhibit not measured yet): wall enough to climb for `n` geckos; a hide each; one grown male.
export function hasWalls(species, ex, n, T) {
  return !species.clings || !wallsShort(ex, n, T);
}
export function hasHides(species, ex, shelters, n) {
  return !species.clings || !ex.walls || hidesIn(ex, shelters) >= n;
}
export function oneMale(species, animals) {
  return !species.oneMale || animals.filter((a) => !a.juvenile && a.sex === "male").length <= 1;
}

// The care warnings for geckos in an exhibit (`shelters`: its Burrow Shelters).
export function geckoWarnings(ex, residents, shelters, plural, T) {
  const out = [];
  const n = residents.length;
  if (ex.walls && wallsShort(ex, n, T)) out.push({ severity: 1, text: `${plural} want wall to climb: ${T.wallFaces} wall faces for each (${ex.walls.faces} now for ${n}). Make the exhibit taller, or add pillars or blocks to climb round inside.` });
  if (ex.walls && hidesIn(ex, shelters) < n) out.push({ severity: 2, text: `${plural} hide by day: a crack for each (a one-block gap in a wall, open on one side only) or a Burrow Shelter on the floor (${hidesIn(ex, shelters)} now for ${n}).` });
  const males = residents.filter((a) => !a.juvenile && a.sex === "male").length;
  if (males > 1) out.push({ severity: 2, text: `${males} grown male ${plural.toLowerCase()} share the exhibit: at night they square up to each other. Keep one grown male (move the others to an exhibit of their own).` });
  return out;
}

// The clipboard's lines: the walls, the hides, the males.
export function geckoLines(ex, residents, shelters, plural, T) {
  const males = residents.filter((a) => !a.juvenile && a.sex === "male").length;
  return [
    wallsLine(ex, residents.length, plural, T),
    `§fHides: §7${ex.walls ? `${ex.walls.cracks} crack${ex.walls.cracks === 1 ? "" : "s"}` : "cracks not measured yet"}, ${shelters} Burrow Shelter${shelters === 1 ? "" : "s"} for ${residents.length}`,
    `§fGrown males: §7${males}${males > 1 ? " §c(keep one)" : ""}`,
  ];
}
