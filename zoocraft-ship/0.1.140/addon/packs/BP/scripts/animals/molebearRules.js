// Earth Molebears (0.1.138, the cave wing: research/cave_plan.md "0.1.138 Earth Molebear"), pure: the molebear measure
// (the Burrow Soil beside an exhibit's floor), what a tunnel may dig, what an exhibit needs, the day, and what one does
// next. The game side is animals/molebear.js.
// Sources (research/cave_facts.md): a black bear's body (it digs its own den into a hillside, and digs into stumps and
// logs for grubs, licking them up); a mole's spade hands, palms turned out, swimming through the soil in a breaststroke,
// pushing the loose soil up; the star-nosed mole's star, touched to the ground a dozen times a second, and the fastest
// eater of any mammal. Every rule here is by the species' flags, never by name.

// The molebear mobs, found by type (0.1.70: never by family alone).
export const MOLEBEAR_TYPES = ["zoocraft:molebear", "zoocraft:wild_molebear"];

// What a molebear is doing (its zoocraft:act entity property): the client plays the matching animation and the Field
// Journal watches for it.
export const ACT = { none: 0, dig: 1, sniff: 2, snap: 3, stand: 4, rest: 5, buried: 6, crawl: 7 };
// Down (resting curled up, or sunk into the ground): the client's getting-up animation takes a moment, so the script
// holds it still that long after (BALANCE.molebear.getUpTicks).
export const LYING_ACTS = [ACT.rest, ACT.buried];

// The only block a zoo molebear digs.
export const BURROW_SOIL = "zoocraft:burrow_soil";
export const SOIL_HOW = "Burrow Soil (2 dirt, a gravel and a clay ball make 4): a bank of it inside the exhibit, three blocks high and four wide, to tunnel into from the floor";
// The grit a molebear's digging throws up, for Burrow Soil (its texture's earth, gen138/ents138.py); other ground takes
// the crab's colours (crabRules.js gritColour).
export const SOIL_GRIT = { r: 0x7a / 255, g: 0x5a / 255, b: 0x3c / 255 };
// A block that falls when what's under it goes: never left over a tunnel.
const FALLING = [/^minecraft:(sand|red_sand|gravel|suspicious_sand|suspicious_gravel|anvil|chipped_anvil|damaged_anvil|dragon_egg|pointed_dripstone|scaffolding)$/, /_concrete_powder$/];
// The natural cave floor a wild one burrows into for a rest (only to look at: the ground isn't touched).
export const WILD_GROUND = new Set(["minecraft:stone", "minecraft:deepslate", "minecraft:tuff", "minecraft:cobbled_deepslate", "minecraft:andesite", "minecraft:diorite", "minecraft:granite", "minecraft:gravel", "minecraft:dirt", "minecraft:coarse_dirt", "minecraft:dirt_with_roots"]);

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

// ---------------- a tunnel's lane ----------------
// A tunnel is `w` blocks wide and `h` high (0.1.140: Austin's 2 by 2 for the molebear at twice the size; 0.1.138's was
// 1 by 1). Its lane runs from a base cell `w` columns toward `side` (a unit step across the way it digs; none when
// `w` is 1), `h` rows up. A lane: { side: { x, z }, w, h }.
/** @typedef {{ side: { x: number, z: number }, w: number, h: number }} Lane */
/** @type {Lane} */
export const LANE1 = { side: { x: 0, z: 0 }, w: 1, h: 1 };

// The sides a lane `w` wide can lie toward, across the way it digs ({ dx, dz }): either hand, or none for one column.
export function laneSides(dx, dz, w) {
  return w > 1 ? [{ x: 0 - dz, z: dx }, { x: dz, z: 0 - dx }] : [{ x: 0, z: 0 }]; // (0 - 0 is 0; -0 isn't)
}

// The columns of a lane's slice at the base cell `c` (at c's height).
/** @param {{ x: number, y: number, z: number }} c @param {Lane} lane */
export function laneColumns(c, lane) {
  const out = [];
  for (let k = 0; k < lane.w; k++) out.push({ x: c.x + lane.side.x * k, y: c.y, z: c.z + lane.side.z * k });
  return out;
}

// The middle of a lane's slice at the base cell `c`, across its columns (on the floor).
/** @param {{ x: number, y: number, z: number }} c @param {Lane} lane */
export function laneCentre(c, lane) {
  return { x: c.x + 0.5 + (lane.side.x * (lane.w - 1)) / 2, y: c.y, z: c.z + 0.5 + (lane.side.z * (lane.w - 1)) / 2 };
}

// Where its body stands in a slice of the lane, facing the way it digs ({ dx, dz }): the slice's middle, drawn back
// `back` blocks (half its body's length less half a block) so its front stays in the slice and never in the soil ahead.
/** @param {Lane} lane */
export function bodyIn(c, lane, dx, dz, back) {
  const m = laneCentre(c, lane);
  return { x: m.x - dx * back, y: m.y, z: m.z - dz * back };
}

// ---------------- the molebear measure ----------------

/** @returns {{ soil: number, bank: number, tunnels: number, faces: { x: number, y: number, z: number, dx: number, dz: number, sx: number, sz: number }[] }} */
export function newMolebearResult() {
  return { soil: 0, bank: 0, tunnels: 0, faces: [] };
}

/**
 * The molebear measure (exhibits/exhibits.js, for Earth Molebears living here), over the floor the walking measure found
 * (cells: key "x,y,z" -> kind; the "land" ones) and its box:
 * - soil: the Burrow Soil blocks under a floor cell, or beside one from its level to `size.h` above, each counted once;
 * - bank: the faces it can start a tunnel into (canDig) from floor beside them: a lane's slice of floor cells, `size.w`
 *   wide, and `size.room` slices of it deep for its body to stand on (0.1.140), each face counted once;
 * - tunnels: the floor cells in its tunnels (0.1.140: 2 high, so they're floor, with Burrow Soil `size.h` over them):
 *   their low roof is no fault of the exhibit's;
 * - faces: where to dig them from, the first `opts.keep` (16 unless given): { x, y, z } the floor cell (a lane's base),
 *   dx, dz the way in, sx, sz the lane's side (0.1.140: a molebear far off creeps over to one).
 * `idAt(x, y, z)`: a block's typeId, undefined unloaded; `kindAt`: the exhibit reader's kind. A generator, a slice of
 * `opts.cellsPerYield` floor cells at a time.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {(x: number, y: number, z: number) => string} kindAt
 * @param {Map<string, string>} cells
 * @param {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } | undefined} box
 * @param {{ cellsPerYield: number, keep?: number }} opts
 * @param {ReturnType<typeof newMolebearResult>} out
 * @param {{ w: number, h: number, room?: number }} [size] the tunnel's width and height (1 by 1 unless given), and the
 *   slices of floor it stands on to start one (1 unless given)
 */
export function* measureMolebear(idAt, kindAt, cells, box, opts, out, size = LANE1) {
  const seen = new Set();
  const banks = new Set();
  let work = 0;
  const count = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (seen.has(k) || idAt(x, y, z) !== BURROW_SOIL) return;
    seen.add(k);
    out.soil++;
  };
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    count(x, y - 1, z);
    if (size.h > 1 && idAt(x, y + size.h, z) === BURROW_SOIL) {
      let low = true;
      for (let dy = 0; dy < size.h && low; dy++) low = kindAt(x, y + dy, z) === "air";
      if (low) out.tunnels++;
    }
    for (const [dx, dz] of DIRS) {
      for (let dy = 0; dy <= size.h; dy++) count(x + dx, y + dy, z + dz);
      if (idAt(x + dx, y, z + dz) !== BURROW_SOIL) continue; // no face here
      for (const side of laneSides(dx, dz, size.w)) {
        const lane = { side, w: size.w, h: size.h };
        const to = { x: x + dx, y, z: z + dz };
        // The face by its columns (whichever end the lane is named from) and the way in.
        const cols = laneColumns(to, lane).map((c) => `${c.x},${c.z}`).sort();
        const bk = `${cols.join(";")},${y}|${dx},${dz}`;
        if (banks.has(bk)) continue;
        let room = true;
        for (let r = 0; r < (size.room ?? 1) && room; r++) room = laneColumns({ x: x - dx * r, y, z: z - dz * r }, lane).every((c) => cells.get(`${c.x},${c.y},${c.z}`) === "land");
        if (!room) continue;
        if (canDig(idAt, kindAt, { x, y, z }, to, box, lane)) {
          banks.add(bk);
          out.bank++;
          if (out.faces.length < (opts.keep ?? 16)) out.faces.push({ x, y, z, dx, dz, sx: side.x, sz: side.z });
        }
      }
    }
  }
  return out;
}

// ---------------- what a tunnel may dig ----------------

// Firm ground round a tunnel: Burrow Soil, or a full solid block (the exhibit reader's "solid") that doesn't fall.
// Unloaded is never firm.
function firm(idAt, kindAt, x, y, z) {
  const id = idAt(x, y, z);
  if (!id) return false;
  if (id === BURROW_SOIL) return true;
  return kindAt(x, y, z) === "solid" && !FALLING.some((r) => r.test(id));
}

/**
 * Whether it may dig the slice of its lane at `to` from `from` (the slice it stands in, or the tunnel's last: beside it,
 * at its level; both named by the lane's base cell). The slice is `lane.w` columns toward `lane.side` and `lane.h` rows
 * up (a block for 0.1.138's 1 by 1, four for 0.1.140's 2 by 2). Only Burrow Soil, every block of the slice; only inside
 * its exhibit's reach (`box`: the measured floor's box, a block wider each way, at the floor's heights); and only where
 * digging leaves a dead end: firm ground under it, over it, ahead of it and on both sides. So a tunnel never breaks into
 * the open, into another tunnel, under a wall or out of the exhibit, and nothing can fall into it.
 * `idAt(x, y, z)`: a block's typeId; `kindAt(x, y, z)`: the exhibit reader's kind ("solid", "air", ...).
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {(x: number, y: number, z: number) => string} kindAt
 * @param {{ x: number, y: number, z: number }} from
 * @param {{ x: number, y: number, z: number }} to
 * @param {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } } | undefined} box
 * @param {Lane} [lane]
 */
export function canDig(idAt, kindAt, from, to, box, lane = LANE1) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  if (to.y !== from.y || Math.abs(dx) + Math.abs(dz) !== 1) return false;
  const { side, w, h } = lane;
  if (w > 1 && Math.abs(side.x) + Math.abs(side.z) !== 1) return false;
  if (w > 1 && side.x * dx + side.z * dz !== 0) return false; // across the way it digs
  if (!box || to.y < box.min.y || to.y > box.max.y) return false;
  const cols = laneColumns(to, lane);
  for (const c of cols) {
    if (c.x < box.min.x - 1 || c.x > box.max.x + 1 || c.z < box.min.z - 1 || c.z > box.max.z + 1) return false;
    for (let dy = 0; dy < h; dy++) if (idAt(c.x, c.y + dy, c.z) !== BURROW_SOIL) return false;
  }
  for (const c of cols) {
    if (!firm(idAt, kindAt, c.x, c.y - 1, c.z) || !firm(idAt, kindAt, c.x, c.y + h, c.z)) return false; // under and over
    for (let dy = 0; dy < h; dy++) if (!firm(idAt, kindAt, c.x + dx, c.y + dy, c.z + dz)) return false; // ahead
  }
  // Both sides: across from the first column and past the last (for one column, its two neighbours across).
  const sx = w > 1 ? side.x : dz;
  const sz = w > 1 ? side.z : dx;
  for (let dy = 0; dy < h; dy++) {
    if (!firm(idAt, kindAt, to.x - sx, to.y + dy, to.z - sz)) return false;
    if (!firm(idAt, kindAt, to.x + sx * w, to.y + dy, to.z + sz * w)) return false;
  }
  return true;
}

// The faces it can start a tunnel into from the slice at the base cell `c`: [{ dx, dz, side }]. `size`: the tunnel's
// { w, h }; `open(x, y, z)`: whether a cell of the floor it stands on is open (the slice at `c` and, for a `room` of 2 or
// more, the slices behind it: room for its body). Cheapest first: the soil ahead, then canDig, then the room.
/** @param {{ w: number, h: number }} [size] @param {(x: number, y: number, z: number) => boolean} [open] */
export function facesBeside(idAt, kindAt, c, box, size = LANE1, open = () => true, room = 1) {
  const out = [];
  for (const [dx, dz] of DIRS) {
    if (idAt(c.x + dx, c.y, c.z + dz) !== BURROW_SOIL) continue;
    for (const side of laneSides(dx, dz, size.w)) {
      const lane = { side, w: size.w, h: size.h };
      if (!canDig(idAt, kindAt, c, { x: c.x + dx, y: c.y, z: c.z + dz }, box, lane)) continue;
      let ok = true;
      for (let r = 0; r < room && ok; r++) ok = laneColumns({ x: c.x - dx * r, y: c.y, z: c.z - dz * r }, lane).every((q) => open(q.x, q.y, q.z));
      if (ok) out.push({ dx, dz, side });
    }
  }
  return out;
}

// The first of those, or undefined.
/** @param {{ w: number, h: number }} [size] @param {(x: number, y: number, z: number) => boolean} [open] */
export function faceBeside(idAt, kindAt, c, box, size = LANE1, open = () => true, room = 1) {
  return facesBeside(idAt, kindAt, c, box, size, open, room)[0];
}

/**
 * Where it starts a tunnel from, standing at `p` (where the engine's walk to the soil left it): the cell it's in, or one
 * round it (out to `reach` blocks each way, at its level), the nearest first, with the floor it stands on open
 * (`open(x, y, z)`: room for it there on firm ground; the slice it starts from and `room` - 1 behind it) and a face it
 * can dig into. { cell, dir: { dx, dz, side } }, or undefined. `size`: the tunnel's { w, h } (1 by 1, a block round,
 * one slice deep, unless given). Given `back` (0.1.140: where its body stands, drawn back from a slice's middle, bodyIn),
 * the face it has least far to shuffle to; else the first face from the nearest cell.
 * @param {(x: number, y: number, z: number) => boolean} open
 * @param {{ w: number, h: number }} [size]
 * @param {number} [back]
 */
export function tunnelStart(idAt, kindAt, open, p, box, size = LANE1, reach = 1, room = 1, back = undefined) {
  const here = { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
  const cells = [];
  for (let dx = -reach; dx <= reach; dx++) for (let dz = -reach; dz <= reach; dz++) cells.push({ x: here.x + dx, y: here.y, z: here.z + dz });
  cells.sort((a, b) => Math.hypot(a.x + 0.5 - p.x, a.z + 0.5 - p.z) - Math.hypot(b.x + 0.5 - p.x, b.z + 0.5 - p.z));
  const openOrHere = (x, y, z) => (x === here.x && z === here.z) || open(x, y, z);
  let best;
  for (const c of cells) {
    if (!openOrHere(c.x, c.y, c.z)) continue;
    if (back === undefined) {
      const dir = faceBeside(idAt, kindAt, c, box, size, openOrHere, room);
      if (dir) return { cell: c, dir };
      continue;
    }
    for (const dir of facesBeside(idAt, kindAt, c, box, size, openOrHere, room)) {
      const b = bodyIn(c, { side: dir.side, w: size.w, h: size.h }, dir.dx, dir.dz, back);
      const d = Math.hypot(b.x - p.x, b.z - p.z);
      if (!best || d < best.d - 1e-9) best = { cell: c, dir, d };
    }
  }
  return best ? { cell: best.cell, dir: best.dir } : undefined;
}

// Whether its body (`half` a block each side of its middle) can creep in a straight line from `p` to `to` over open floor
// (`open(x, y, z)`, at p's level): the cells under the line and `half` to either side of it, every `step` along it. The
// cell it's in now counts as open.
export function lineClear(open, p, to, half = 0.85, step = 0.5) {
  const y = Math.floor(p.y + 0.01);
  const len = Math.hypot(to.x - p.x, to.z - p.z);
  if (len < 1e-6) return true;
  const ux = (to.x - p.x) / len;
  const uz = (to.z - p.z) / len;
  const here = `${Math.floor(p.x)},${Math.floor(p.z)}`;
  const seen = new Set([here]);
  const n = Math.ceil(len / step);
  for (let i = 1; i <= n; i++) {
    const k = Math.min(len, i * step);
    for (const o of [-half, 0, half]) {
      const x = Math.floor(p.x + ux * k - uz * o);
      const z = Math.floor(p.z + uz * k + ux * o);
      const key = `${x},${z}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (!open(x, y, z)) return false;
    }
  }
  return true;
}

// Steps from the point `p` to the centre of the cell `c` (at p's height), none longer than `size`, the last at the centre;
// or, given `at` (0.1.140), to that point.
/** @param {{ x: number, z: number }} [at] */
export function walkSteps(p, c, size, at) {
  const to = at ? { x: at.x, z: at.z } : { x: c.x + 0.5, z: c.z + 0.5 };
  const n = Math.max(1, Math.ceil(Math.hypot(to.x - p.x, to.z - p.z) / size));
  const out = [];
  for (let i = 1; i < n; i++) out.push({ x: p.x + ((to.x - p.x) * i) / n, y: p.y, z: p.z + ((to.z - p.z) * i) / n });
  out.push({ x: to.x, y: p.y, z: to.z });
  return out;
}

// ---------------- what an exhibit needs ----------------
const grown = (animals) => animals.filter((a) => !a.juvenile).length;

// Burrow Soil (cause "burrow"): soil enough beside the floor. False caps comfort. Not measured yet: passes.
export function hasBurrowSoil(species, ex) {
  if (!species.burrowSoil || !ex.molebear) return true;
  return ex.molebear.soil >= species.burrowSoil.min;
}

// The share of its food it digs up as grubs: up to burrowSoil.share with a bank face for each grown one, less with
// fewer; nothing before the exhibit has been measured (as the okapi's browsing).
export function grubShare(species, ex, n) {
  const g = species.burrowSoil;
  if (!g || !ex.molebear) return 0;
  return g.share * Math.min(1, ex.molebear.bank / Math.max(1, n));
}

// Digging left today, of T.digsPerDay a park day (its record's dug: { day, n }).
export function digsLeft(a, day, T) {
  const d = a?.dug;
  return d && d.day === day ? Math.max(0, T.digsPerDay - d.n) : T.digsPerDay;
}

// The Exhibit Clipboard's lines for Earth Molebears: the Burrow Soil, the banks to dig, the cubs.
export function molebearLines(ex, residents, species) {
  const lines = [];
  const n = Math.max(1, grown(residents));
  const t = ex.molebear;
  if (!t) {
    lines.push("§fBurrow Soil: §7not measured yet: use the Habitat Marker on the ground inside again");
  } else {
    const min = species.burrowSoil.min;
    lines.push(`§fBurrow Soil: ${t.soil >= min ? "§a" : "§c"}${t.soil}§7 of ${min} (${SOIL_HOW})`);
    lines.push(`§fFaces to tunnel into: ${t.bank >= n ? "§a" : "§e"}${t.bank}§7: grubs dug up are ${Math.round(grubShare(species, ex, n) * 100)}% of their food. Fill dug tunnels with Burrow Soil again to keep it up`);
  }
  const young = residents.filter((a) => a.juvenile).length;
  if (young) lines.push(`§fCubs: §7${young}: they follow their mother about`);
  return lines;
}

// Care warnings for Earth Molebears: Burrow Soil to dig.
export function molebearWarnings(ex, residents, plural, species, T) {
  const out = [];
  const t = ex.molebear;
  if (t && !hasBurrowSoil(species, ex)) out.push({ severity: 2, text: `${plural} need ${species.burrowSoil.min} or more blocks of ${SOIL_HOW} (${t.soil} now; their tunnels use it up, so fill them in again now and then; comfort can't rise above ${T.soilComfortCap} without it).` });
  return out;
}

// The Field Journal's line on wild ones.
export function wildLine(T) {
  return `In the wild they live in ordinary caves below y 0, alone: not in the lush caves or the deep dark. They wander the cave floor sniffing with their pink star noses, stand up on their hind legs to sniff the air, and sink into the ground for a rest with only the back and the star showing. Come within ${T.hideRange} blocks without sneaking and one digs itself in; within ${T.standRange} it stands up to sniff at you. Hold an Insect Ration: within ${T.baitRange} blocks one comes over to you`;
}

// ---------------- the day and what it does ----------------
// World time of day: 0 sunrise, 6000 noon, 12000 sunset, 18000 midnight; a range may run past the wrap (a > b).
function within(t, [a, b]) {
  return a <= b ? t >= a && t < b : t >= a || t < b;
}

// Out by day (T.day), resting curled up at night.
export function isDay(timeOfDay, T) {
  return within(((timeOfDay % 24000) + 24000) % 24000, T.day);
}

/**
 * What it heads for next: "dig" (a bank of Burrow Soil, with digging left today), "feeder", "sniff", "stand", "wander"
 * or "rest". At night always "rest". `o`: { day, soil, feeder }: what there is (in its exhibit; a wild one has no soil or
 * feeder). Weights T.weights.
 * @param {{ day: boolean, soil?: boolean, feeder?: boolean }} o
 */
export function pickInterest(o, T, random = Math.random) {
  if (!o.day) return "rest";
  const W = T.weights;
  const options = [
    ["dig", o.soil ? W.dig : 0],
    ["feeder", o.feeder ? W.feeder : 0],
    ["sniff", W.sniff],
    ["stand", W.stand],
    ["wander", W.wander],
    ["rest", W.rest],
  ];
  let r = random() * options.reduce((n, [, w]) => n + w, 0);
  for (const [what, w] of options) {
    if (r < w) return what;
    r -= w;
  }
  return "wander";
}

// The steps of a crawl from `a` to `b` (block cells: their centres at floor level), `n` of them, the last at `b`; `off`
// (0.1.140): where in each cell, { x, z } from its corner (its centre unless given).
/** @param {{ x: number, z: number }} [off] */
export function crawlSteps(a, b, n, off = { x: 0.5, z: 0.5 }) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const k = i / n;
    out.push({ x: a.x + off.x + (b.x - a.x) * k, y: a.y, z: a.z + off.z + (b.z - a.z) * k });
  }
  return out;
}
