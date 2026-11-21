// 0.1.347: the Frequency Friends' tree house village (Austin, 2026-11-21: "Take your time to research and design a tree
// house civilization. There should be bridges that lead to other trees, and detailed designed homes."). Pure rules:
// where it goes in the jungle (chooseLayout, which reads the world through a function) and every block of it
// (villagePlan). The runtime is world/jungleVillage.js; the numbers BALANCE.jungleVillage.
//
// The great tree (the tallest around) gets a spiral stair round its trunk from the ground, a round deck partway up with
// railings, lamp posts, benches and planters, homes on the deck's edge, and high up the Council Hall round the trunk
// (the monument inside, a purple-glass lantern roof rising out of the canopy). Trees round it get a home each, built
// round their trunks, and rope bridges run from the great deck to every one of them (and between neighbours).
// Everything is vanilla blocks; the runtime makes them unbreakable while the village stands.

export const PLAN_V = 2;
const M = (n) => `minecraft:${n}`;
export const AIR = M("air");

// ---- Bedrock block states, as the test server showed them (0.1.347 bench, rays and dropped items) ----
const STAIR_W = { e: 0, w: 1, s: 2, n: 3 }; // weirdo_direction: the side a stair's tall part is on (the way it goes up)
const TRAP_D = { w: 0, e: 1, n: 2, s: 3 }; // direction: the side of its cell an open trapdoor lies against
const LADDER_F = { s: 2, n: 3, e: 4, w: 5 }; // facing_direction: by the side of its cell the ladder is fixed to
const DOOR_C = { n: "west", e: "north", s: "east", w: "south" }; // cardinal_direction: by the side a shut door is on
const GATE_C = { x: "north", z: "east" }; // a fence gate across the x axis faces north (or south); across z, east

export const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
export const OPP = { n: "s", s: "n", e: "w", w: "e" };
const RIGHT = { s: "e", e: "n", n: "w", w: "s" }; // standing outside a front that faces this way, your right hand

const stairs = (id, up, top = false) => [id, { weirdo_direction: STAIR_W[up], upside_down_bit: top }];
const slab = (id, top = false) => [id, { "minecraft:vertical_half": top ? "top" : "bottom" }];
const log = (id, axis = "y") => [id, { pillar_axis: axis }];
const trap = (id, side, open = true, top = false) => [id, { direction: TRAP_D[side], open_bit: open, upside_down_bit: top }];
const ladder = (side) => [M("ladder"), { facing_direction: LADDER_F[side] }];
const door = (id, side, upper, hinge = false) => [id, { "minecraft:cardinal_direction": DOOR_C[side], door_hinge_bit: hinge, open_bit: false, upper_block_bit: upper }];
const gate = (id, across) => [id, { "minecraft:cardinal_direction": GATE_C[across], open_bit: false, in_wall_bit: false }];
const lantern = (hanging = false) => [M("lantern"), { hanging }];
const leaves = (id) => [id, { persistent_bit: true, update_bit: false }];
const candle = (id, n = 1) => [id, { candles: n - 1, lit: true }];
const plain = (id) => [id, {}];
const AIRB = plain(AIR);
const axisOf = (d) => (d === "e" || d === "w" ? "x" : "z");

/** The village's look (Austin may pick another; both are here so the preview can show them side by side). */
export const PALETTES = {
  timber: {
    floor: M("jungle_planks"),
    rim: M("stripped_jungle_wood"),
    post: M("jungle_log"),
    beam: M("stripped_jungle_log"),
    wall: [M("stripped_jungle_wood"), M("jungle_planks")],
    foot: M("spruce_planks"),
    footLog: true, // the walls' bottom row: bark logs lying along the wall
    step: M("spruce_slab"), // the spiral stair (it stands out against the bark)
    roof: [M("dark_oak_stairs"), M("spruce_stairs")],
    roofSlab: [M("dark_oak_slab"), M("spruce_slab")],
    hallRoof: [M("crimson_stairs"), M("crimson_stairs")],
    hallSlab: M("crimson_slab"),
    stairs: M("jungle_stairs"),
    slab: [M("jungle_slab"), M("spruce_slab")],
    fence: M("jungle_fence"),
    gate: M("jungle_fence_gate"),
    door: M("jungle_door"),
    trap: M("spruce_trapdoor"),
    plate: M("jungle_pressure_plate"),
  },
  bamboo: {
    floor: M("jungle_planks"),
    rim: M("stripped_jungle_wood"),
    post: M("stripped_jungle_log"),
    beam: M("stripped_jungle_log"),
    wall: [M("bamboo_planks"), M("bamboo_planks")],
    foot: M("jungle_planks"),
    step: M("bamboo_slab"),
    roof: [M("bamboo_mosaic_stairs"), M("bamboo_mosaic_stairs")],
    roofSlab: [M("bamboo_mosaic_slab"), M("bamboo_mosaic_slab")],
    hallRoof: [M("crimson_stairs"), M("crimson_stairs")],
    hallSlab: M("crimson_slab"),
    stairs: M("jungle_stairs"),
    slab: [M("bamboo_slab"), M("jungle_slab")],
    fence: M("bamboo_fence"),
    gate: M("bamboo_fence_gate"),
    door: M("bamboo_door"),
    trap: M("jungle_trapdoor"),
    plate: M("bamboo_pressure_plate"),
  },
};

/** A number in [0, 1) for a place: the same every time (so the village is the same every time it goes up). */
export function hash(x, y, z, salt = 0) {
  let h = (x * 374761393 + y * 668265263 + z * 2147483647 + salt * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
/** One of a pair, in clumps of about 2 blocks (one colour family, no long runs of one block). */
const pick = (pair, x, y, z, salt = 0) => pair[hash(x >> 1, y >> 1, z >> 1, salt) < 0.5 ? 0 : 1];

// ---- what each block is for the order things go up and come down ----
const ATTACH = /(lantern|ladder|_door$|trapdoor|carpet|candle|pressure_plate|amethyst_cluster|spore_blossom)/;
/** 0: air (clearing), 1: blocks that stand by themselves, 2: blocks that hang on, or stand on, another. */
export const stage = (id) => (id === AIR ? 0 : ATTACH.test(id) ? 2 : 1);

// priorities: a later, higher job overwrites a lower one
const P = { clear: 0, deck: 1, rail: 2, house: 3, furn: 4, path: 5 };

class Plan {
  constructor(pal) {
    this.pal = pal;
    this.m = new Map();
    this.n = 0;
    this.friends = [];
  }
  put(x, y, z, b, p) {
    const k = `${x},${y},${z}`;
    const o = this.m.get(k);
    if (o && (o.p > p || (o.p === p && b[0] === AIR && o.b[0] !== AIR))) return;
    this.m.set(k, { x, y, z, b, p, n: this.n++ });
  }
  air(x, y, z, p = P.clear) {
    this.put(x, y, z, AIRB, p);
  }
  at(x, y, z) {
    return this.m.get(`${x},${y},${z}`)?.b;
  }
}

// ---- shapes (cells are [x, z]; a trunk's centre is a point between cells for a 2 by 2 trunk) ----
const cellKey = (x, z) => `${x},${z}`;
/** Cells whose middle is within r of (cx, cz). */
export function disc(cx, cz, r) {
  const out = [];
  for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
    for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++) if (Math.hypot(x + 0.5 - cx, z + 0.5 - cz) <= r) out.push([x, z]);
  }
  return out;
}
/** An octagon of "radius" r about (cx, cz): a square with its corners cut. */
export function octagon(cx, cz, r) {
  const out = [];
  for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
    for (let z = Math.floor(cz - r - 1); z <= Math.ceil(cz + r + 1); z++) {
      const dx = Math.abs(x + 0.5 - cx), dz = Math.abs(z + 0.5 - cz);
      if (dx <= r && dz <= r && dx + dz <= r * 1.45) out.push([x, z]);
    }
  }
  return out;
}
const setOf = (cells) => new Set(cells.map(([x, z]) => cellKey(x, z)));
/** The cells of a shape on its edge (a side neighbour outside it), each with the sides that are outside. */
function edge(cells, set = setOf(cells)) {
  const out = [];
  for (const [x, z] of cells) {
    const outs = Object.entries(DIRS).filter(([, [dx, dz]]) => !set.has(cellKey(x + dx, z + dz))).map(([d]) => d);
    if (outs.length) out.push({ x, z, outs });
  }
  return out;
}

/** A trunk: { x0, z0, s, b, h } (its corner, 1 or 2 wide, the y of its lowest log, how many logs tall). */
export const trunkCentre = (t) => [t.x0 + t.s / 2, t.z0 + t.s / 2];
const inTrunk = (t, x, y, z) => x >= t.x0 && x < t.x0 + t.s && z >= t.z0 && z < t.z0 + t.s && y >= t.b && y < t.b + t.h;

// ---- the parts ----

/** Clear the crown's leaves 3 high over a floor of cells at y (so there is room to walk). */
function clearOver(pl, cells, y, h = 3, p = P.clear) {
  for (const [x, z] of cells) for (let dy = 1; dy <= h; dy++) pl.air(x, y + dy, z, p);
}

/**
 * A deck at y (an octagon round a trunk): planks with a rim of upside-down stairs (a moulding round the edge), a fence
 * railing on it, and under it `under` layers stepping in towards the trunk, each edged with upside-down stairs (no flat
 * bottom hanging in the air: the videos' "inverted cone"). `hole`: the trunk's cells (no edge round them).
 */
function deck(pl, cells, y, opts = {}) {
  const P0 = pl.pal;
  const set = setOf(cells);
  const ed = edge(cells, opts.hole ? new Set([...set, ...opts.hole]) : set); // a trunk in it is no edge
  const rim = new Map(ed.map((e) => [cellKey(e.x, e.z), e]));
  for (const [x, z] of cells) pl.put(x, y, z, moulding(P0, rim.get(cellKey(x, z))), P.deck);
  if (!opts.noRail) for (const e of ed) pl.put(e.x, y + 1, e.z, [P0.fence, {}], P.rail);
  if (opts.under) underside(pl, opts.under, y, opts.hole);
  clearOver(pl, cells, y);
  return { set, edge: ed };
}
/** A deck's block: planks inside; on the edge an upside-down stair with its step under the edge (a corner: wood). */
function moulding(P0, e) {
  if (!e) return [P0.floor, {}];
  return e.outs.length === 1 ? stairs(P0.stairs, OPP[e.outs[0]], true) : log(P0.rim);
}
/** The layers under a deck { cx, cz, r, n }: each 1.5 narrower and 1 lower than the last, edged with upside-down stairs. */
function underside(pl, u, y, hole) {
  for (let k = 1; k <= u.n; k++) {
    const cells = octagon(u.cx, u.cz, u.r - 1.5 * k).filter(([x, z]) => !hole?.has(cellKey(x, z)));
    if (!cells.length) break;
    const set = setOf(cells);
    const rim = new Map(edge(cells, hole ? new Set([...set, ...hole]) : set).map((e) => [cellKey(e.x, e.z), e]));
    for (const [x, z] of cells) pl.put(x, y - k, z, moulding(pl.pal, rim.get(cellKey(x, z))), P.deck);
  }
}

/**
 * Posts in a deck's railing: stripped logs 2 high every `every` cells round the edge (and at the corners of the
 * octagon), a lantern on every other one.
 */
function railPosts(pl, ed, y, cx, cz, every = 4) {
  const ang = (e) => Math.atan2(e.z + 0.5 - cz, e.x + 0.5 - cx);
  const ring = [...ed].sort((p, q) => ang(p) - ang(q));
  let n = 0;
  ring.forEach((e, i) => {
    if (i % every !== 0 || (i > 0 && ring.length - i < every / 2)) return;
    pl.put(e.x, y + 1, e.z, log(pl.pal.beam), P.rail);
    pl.put(e.x, y + 2, e.z, log(pl.pal.beam), P.rail);
    if (n++ % 2 === 0) pl.put(e.x, y + 3, e.z, lantern(false), P.rail);
  });
}

/** Struts under a deck or a house: diagonal beams of upside-down stairs from (x, z) at y down towards the trunk. */
function strut(pl, x, z, y, toward, steps) {
  const [dx, dz] = DIRS[toward];
  for (let k = 0; k < steps; k++) pl.put(x + dx * k, y - k, z + dz * k, stairs(pl.pal.stairs, toward, true), P.deck);
}

/**
 * The spiral stair round a trunk: slabs a half block apart going round the ring of cells next to the trunk, from the
 * ground to each floor. Floors it passes through are opened over it; a fence railing on its outside where the drop is
 * 2 or more. Returns the arrival cell index of each floor.
 */
function spiral(pl, t, floors, ground) {
  const s = t.s;
  const ring = [];
  for (let x = t.x0 - 1; x <= t.x0 + s; x++) ring.push([x, t.z0 - 1]);
  for (let z = t.z0; z <= t.z0 + s; z++) ring.push([t.x0 + s, z]);
  for (let x = t.x0 + s - 1; x >= t.x0 - 1; x--) ring.push([x, t.z0 + s]);
  for (let z = t.z0 + s - 1; z >= t.z0; z--) ring.push([t.x0 - 1, z]);
  const n = ring.length;
  const top = floors[floors.length - 1];
  const last = 2 * (top.y + 1 - ground);
  const [cx, cz] = trunkCentre(t);
  const stepsAt = new Map();
  for (let i = 1; i <= last; i++) {
    const [x, z] = ring[i % n];
    const surf = ground + i / 2;
    const half = surf % 1 !== 0;
    const y = half ? Math.floor(surf) : surf - 1;
    pl.put(x, y, z, slab(pl.pal.step, !half), P.path);
    if (half && y > ground) pl.put(x, y - 1, z, stairs(pl.pal.stairs, sideOf(cx - x - 0.5, cz - z - 0.5), true), P.deck); // a bracket under it
    for (let dy = 1; dy <= 3; dy++) pl.air(x, y + dy, z, P.path); // headroom (and the hole through any floor over it)
    stepsAt.set(i, { x, z, surf });
    // the railing on the outside, where it is high over whatever is under it
    const below = floors.filter((f) => f.y + 1 < surf && f.cells.has(cellKey(x + Math.sign(x + 0.5 - cx) * 1, z))).map((f) => f.y + 1);
    const floorUnder = Math.max(ground, ...below);
    if (surf - floorUnder < 2) continue;
    const rail = Math.ceil(surf);
    let lit = i % Math.round(n / 4) !== 0; // a lantern on the railing every quarter turn
    for (const [ox, oz] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const rx = x + ox, rz = z + oz;
      const cheb = Math.max(Math.abs(rx + 0.5 - cx), Math.abs(rz + 0.5 - cz));
      if (cheb < s / 2 + 1.9) continue; // only cells on the next ring out
      if (pl.at(rx, rail, rz)?.[0] && pl.at(rx, rail, rz)[0] !== AIR) continue;
      pl.put(rx, rail, rz, [pl.pal.fence, {}], P.rail);
      if (!lit && !pl.at(rx, rail + 1, rz) && !pl.at(rx, rail + 2, rz)) {
        pl.put(rx, rail + 1, rz, [pl.pal.fence, {}], P.rail);
        pl.put(rx, rail + 2, rz, lantern(false), P.rail);
        lit = true;
      }
    }
  }
  // two lamp posts at its foot
  const [fx, fz] = ring[1 % n];
  const [ox, oz] = [Math.sign(fx + 0.5 - cx), Math.sign(fz + 0.5 - cz)];
  pl.put(fx + ox, ground, fz + oz, [pl.pal.fence, {}], P.rail);
  pl.put(fx + ox, ground + 1, fz + oz, lantern(false), P.rail);
  return { ring, stepsAt };
}

// ---- a house: a frame (local a across the front from the left, b from the front to the back) ----
function frame(cells, face) {
  const xs = cells.map(([x]) => x), zs = cells.map(([, z]) => z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const R = RIGHT[face], Bk = OPP[face];
  const o = { s: [minX, maxZ], n: [maxX, minZ], e: [maxX, maxZ], w: [minX, minZ] }[face];
  const w = R === "e" || R === "w" ? maxX - minX + 1 : maxZ - minZ + 1;
  const d = Bk === "e" || Bk === "w" ? maxX - minX + 1 : maxZ - minZ + 1;
  const at = (a, b) => [o[0] + a * DIRS[R][0] + b * DIRS[Bk][0], o[1] + a * DIRS[R][1] + b * DIRS[Bk][1]];
  const dir = (l) => ({ front: face, back: Bk, right: R, left: OPP[R] })[l];
  return { w, d, at, dir, face };
}

/**
 * Walls round a floor (cells) at y: posts (bark logs) at the corners, beside doors and every few blocks; a top plate
 * (stripped log) on top; a darker foot; infill in one colour family; windows; doors. Returns the wall cells.
 */
function walls(pl, cells, y, h, opts) {
  const P0 = pl.pal;
  const set = setOf(cells);
  const ed = edge(cells, set);
  const doors = new Set((opts.doors ?? []).map((c) => cellKey(c.x, c.z)));
  const windows = new Map((opts.windows ?? []).map((c) => [cellKey(c.x, c.z), c]));
  const posts = new Set();
  for (const e of ed) {
    const corner = (e.outs.includes("n") || e.outs.includes("s")) && (e.outs.includes("e") || e.outs.includes("w"));
    const k = cellKey(e.x, e.z);
    const nearDoor = Object.values(DIRS).some(([dx, dz]) => doors.has(cellKey(e.x + dx, e.z + dz)));
    const every = opts.postEvery && (((e.x + e.z) % opts.postEvery) + opts.postEvery) % opts.postEvery === 0;
    if ((corner || nearDoor || every) && !doors.has(k) && !windows.has(k)) posts.add(k);
  }
  for (const e of ed) {
    const k = cellKey(e.x, e.z);
    const along = e.outs.includes("n") || e.outs.includes("s") ? "x" : "z";
    for (let dy = 1; dy <= h; dy++) {
      const yy = y + dy;
      let b;
      if (posts.has(k)) b = log(P0.post);
      else if (dy === h) b = log(P0.beam, along);
      else if (doors.has(k) && dy <= 2) continue; // the door goes in later
      else if (doors.has(k)) b = log(P0.beam, along); // a lintel over it
      else if (windows.has(k) && dy >= 2 && dy <= (windows.get(k).tall ? 3 : 2)) b = [opts.glass ?? M("glass_pane"), {}];
      else if (dy === 1) b = P0.footLog && !opts.foot ? log(P0.post, along) : [opts.foot ?? P0.foot, {}];
      else b = [pick(opts.wall ?? P0.wall, e.x, yy, e.z, 5), {}];
      pl.put(e.x, yy, e.z, b, P.house);
    }
  }
  return { set, edge: ed };
}

/**
 * A roof over a footprint (cells), its eaves at y one block out all round: rings of stairs going up and in (a hip roof
 * on a rectangle, a cone on an octagon), or with `ridge` ("x" or "z") a gable roof whose ridge runs that way. A slab
 * caps the top. Returns the highest y.
 */
function roof(pl, cells, y, mats, opts = {}) {
  let shape = [];
  const s0 = setOf(cells);
  // one block of overhang all round
  for (const [x, z] of cells) for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    if (opts.ridge === "x" && dx !== 0 && dz === 0 && !s0.has(cellKey(x + dx, z))) { /* gable ends: overhang too */ }
    shape.push([x + dx, z + dz]);
  }
  shape = [...setOf(shape)].map((k) => k.split(",").map(Number));
  let yy = y, top = y;
  const gableWall = opts.ridge ? new Set() : undefined;
  while (shape.length) {
    const set = setOf(shape);
    const ring = [];
    for (const [x, z] of shape) {
      const ins = Object.entries(DIRS).filter(([d, [dx, dz]]) => {
        if (opts.ridge === "x" && (d === "e" || d === "w")) return false;
        if (opts.ridge === "z" && (d === "n" || d === "s")) return false;
        return set.has(cellKey(x + dx, z + dz));
      }).map(([d]) => d);
      const outsAll = Object.entries(DIRS).filter(([d, [dx, dz]]) => {
        if (opts.ridge === "x" && (d === "e" || d === "w")) return false;
        if (opts.ridge === "z" && (d === "n" || d === "s")) return false;
        return !set.has(cellKey(x + dx, z + dz));
      }).map(([d]) => d);
      if (!outsAll.length) continue;
      ring.push([x, z]);
      const m = pick(mats.stairs, x, yy, z, 7);
      if (!ins.length) pl.put(x, yy, z, slab(mats.slab[0] ?? mats.slab, false), P.house); // the ridge
      else pl.put(x, yy, z, stairs(m, ins.length === 1 ? ins[0] : ins.includes(OPP[outsAll[0]]) ? OPP[outsAll[0]] : ins[0]), P.house);
    }
    if (!ring.length) break;
    if (yy === y) {
      for (const [x, z] of ring) {
        if (s0.has(cellKey(x, z))) continue;
        const ins = Object.entries(DIRS).filter(([, [dx, dz]]) => s0.has(cellKey(x + dx, z + dz))).map(([d]) => d);
        // under the eave, against the wall: an upside-down stair (its step under the eave's edge)
        if (ins.length === 1 && !pl.at(x, y - 1, z)) pl.put(x, y - 1, z, stairs(pl.pal.stairs, ins[0], true), P.house);
        // the jungle growing over the roof's edge, here and there
        if (hash(x, y, z, 21) < (opts.leafy ?? 0.12)) pl.put(x, y + 1, z, leaves(M("jungle_leaves")), P.house);
      }
    }
    top = yy;
    const rset = setOf(ring);
    shape = shape.filter(([x, z]) => !rset.has(cellKey(x, z)));
    yy++;
  }
  return top;
}

/** Air inside a building, from the floor up to the roof (so the crown's leaves are out of the rooms). */
function hollow(pl, cells, y, h) {
  for (const [x, z] of cells) for (let dy = 1; dy <= h; dy++) pl.air(x, y + dy, z, P.house);
}

/** Furniture and lights in a room (local spots from the house's frame). */
function furnish(pl, f, y, kind, trunkSet) {
  const P0 = pl.pal;
  const put = (a, b, dy, blk, p = P.furn) => {
    const [x, z] = f.at(a, b);
    if (trunkSet?.has(cellKey(x, z))) return;
    pl.put(x, y + dy, z, blk, p);
  };
  const W = f.w, D = f.d;
  const rug = [M("purple_carpet"), M("magenta_carpet"), M("lime_carpet")][Math.floor(hash(W, y, D, 2) * 3)];
  // a rug in the middle of the room
  for (let a = 2; a <= W - 3; a++) for (let b = 2; b <= D - 3; b++) put(a, b, 1, [rug, {}]);
  if (kind === "home" || kind === "pod") {
    // a bed: two raised trapdoor boards with a blanket and a white pillow, along the back wall's left side
    put(1, D - 2, 1, trap(P0.trap, "n", false, true));
    put(1, D - 3, 1, trap(P0.trap, "n", false, true));
    put(1, D - 2, 2, [M("white_carpet"), {}]);
    put(1, D - 3, 2, [M("purple_carpet"), {}]);
    // a table with a candle, and a chair
    put(W - 2, D - 2, 1, [P0.fence, {}]);
    put(W - 2, D - 2, 2, [P0.plate, {}]);
    put(W - 3, D - 2, 1, stairs(P0.stairs, f.dir("left")));
    put(W - 2, D - 3, 1, [M("purple_candle"), { candles: 1, lit: true }]);
    // a bookshelf and a crafting table by the front wall
    put(1, 1, 1, [M("bookshelf"), {}]);
    put(W - 2, 1, 1, [M("crafting_table"), {}]);
    put(W - 2, 1, 2, leaves(M("azalea_leaves_flowered")));
  } else if (kind === "workshop") {
    const tools = [M("crafting_table"), M("fletching_table"), M("cartography_table"), M("smithing_table"), [M("loom"), { direction: 0 }], M("stonecutter_block")];
    let i = 0;
    for (const [a, b] of [[1, D - 2], [2, D - 2], [W - 2, D - 2], [W - 3, D - 2], [1, 1], [W - 2, 1]]) {
      const t = tools[i++ % tools.length];
      put(a, b, 1, Array.isArray(t) ? t : [t, {}]);
    }
  }
}

/** A hanging lantern over the room's middle, on fence links from the roof. */
function hangLamp(pl, x, z, yFrom, yTo) {
  let y = yTo;
  while (y < yFrom && !pl.at(x, y + 1, z)?.[0]?.match(/stairs|slab|planks|log|wood/)) y++;
  if (y >= yFrom) return;
  for (let yy = y; yy > yTo; yy--) pl.put(x, yy, z, [pl.pal.fence, {}], P.furn);
  pl.put(x, yTo, z, lantern(true), P.furn);
}

/**
 * A home: a rectangle of `w` by `d` round (or beside) a trunk, its front facing `face`: walls 4 high with posts, a door
 * (double for a wide house) under a lantern on the eaves, windows with open shutters and flower boxes, a gable roof
 * whose ridge runs front to back, furniture inside. `trunk` (optional) passes up through it.
 */
function home(pl, cells, y, face, kind, trunk) {
  const P0 = pl.pal;
  const f = frame(cells, face);
  const trunkSet = trunk ? setOf(trunkCellsOf(trunk)) : new Set();
  const h = 4;
  // floor
  for (const [x, z] of cells) if (!trunkSet.has(cellKey(x, z))) pl.put(x, y, z, [P0.floor, {}], P.house);
  hollow(pl, cells.filter(([x, z]) => !trunkSet.has(cellKey(x, z))), y, h + 6);
  // the door: in the middle of the front (two wide when the house is an even number across)
  const mid = (f.w - 1) / 2;
  const doorAs = f.w % 2 ? [mid] : [Math.floor(mid), Math.ceil(mid)];
  const doors = doorAs.map((a) => { const [x, z] = f.at(a, 0); return { x, z }; });
  // windows: one on each side wall, two on the back
  const winAt = [[0, Math.floor(f.d / 2)], [f.w - 1, Math.floor(f.d / 2)], [Math.floor(f.w / 2) - 1 - (f.w % 2 ? 0 : 0), f.d - 1], [Math.ceil(f.w / 2) + (f.w % 2 ? 0 : 0), f.d - 1]];
  const windows = winAt.filter(([a]) => a >= 0 && a < f.w).map(([a, b]) => { const [x, z] = f.at(a, b); return { x, z, a, b }; });
  walls(pl, cells, y, h, { doors, windows, postEvery: 4 });
  for (const [i, c] of doors.entries()) {
    const side = f.dir("back"); // the shut door lies against the inside of the wall
    pl.put(c.x, y + 1, c.z, door(P0.door, side, false, doors.length === 2 && i === 1), P.furn);
    pl.put(c.x, y + 2, c.z, door(P0.door, side, true, doors.length === 2 && i === 1), P.furn);
    // the step out of the door is kept clear
    const [dx, dz] = DIRS[f.face];
    for (let dy = 1; dy <= 2; dy++) pl.air(c.x + dx, y + dy, c.z + dz, P.path);
  }
  // shutters (open trapdoors flat to the wall either side of each window) and a flower box under it
  for (const [wi, wnd] of windows.entries()) {
    const out = wnd.b === f.d - 1 ? f.dir("back") : wnd.a === 0 ? f.dir("left") : f.dir("right");
    const [ox, oz] = DIRS[out];
    const along = out === "n" || out === "s" ? ["e", "w"] : ["n", "s"];
    for (const s of along) {
      const [sx, sz] = DIRS[s];
      pl.put(wnd.x + ox + sx, y + 2, wnd.z + oz + sz, trap(P0.trap, OPP[out]), P.furn);
    }
    pl.put(wnd.x + ox, y + 1, wnd.z + oz, wi % 2 ? stairs(P0.stairs, OPP[out], true) : leaves(M("azalea_leaves_flowered")), P.furn);
  }
  // the roof: a gable whose ridge runs front to back
  const ridge = f.face === "n" || f.face === "s" ? "z" : "x";
  const top = roof(pl, cells, y + h, { stairs: P0.roof, slab: P0.roofSlab }, { ridge });
  gableEnds(pl, cells, y + h, ridge, P0);
  // a lantern either side of the door, hanging from a short fence arm out of the top of the wall
  for (const a of [doorAs[0] - 1, doorAs[doorAs.length - 1] + 1]) {
    const [x, z] = f.at(a, -1);
    if ((pl.at(x, y + h, z)?.[0] ?? AIR) === AIR) pl.put(x, y + h, z, [P0.fence, {}], P.furn);
    pl.put(x, y + h - 1, z, lantern(true), P.furn);
  }
  furnish(pl, f, y, kind, trunkSet);
  // a lamp from the roof over the middle of the room
  const [lx, lz] = f.at(Math.floor(f.w / 2), Math.floor(f.d / 2) + (trunk ? 2 : 0));
  if (!trunkSet.has(cellKey(lx, lz))) hangLamp(pl, lx, lz, top, y + 3);
  // the Frequency Friends living here
  const [px, pz] = f.at(Math.floor(f.w / 2) - 1, 1);
  pl.friends.push([px, y + 1, pz]);
  return { f, doors, top };
}

/** The triangles under a gable roof, at its two ends, filled with wall (and a little round window). */
function gableEnds(pl, cells, y, ridge, P0) {
  const xs = cells.map(([x]) => x), zs = cells.map(([, z]) => z);
  const [lo, hi] = ridge === "z" ? [Math.min(...xs), Math.max(...xs)] : [Math.min(...zs), Math.max(...zs)];
  const ends = ridge === "z" ? [Math.min(...zs), Math.max(...zs)] : [Math.min(...xs), Math.max(...xs)];
  const mid = (lo + hi) / 2;
  for (const e of ends) for (let u = lo; u <= hi; u++) {
    const rise = Math.floor(Math.min(u - lo, hi - u)); // how far up the roof is over this column (from the eaves)
    for (let dy = 1; dy <= rise; dy++) {
      const [x, z] = ridge === "z" ? [u, e] : [e, u];
      const centre = Math.abs(u - mid) < 1 && dy === Math.max(1, rise - 1);
      pl.put(x, y + dy, z, centre ? [M("glass_pane"), {}] : [pick(P0.wall, x, y + dy, z, 5), {}], P.house);
    }
  }
}

const trunkCellsOf = (t) => {
  const out = [];
  for (let x = t.x0; x < t.x0 + t.s; x++) for (let z = t.z0; z < t.z0 + t.s; z++) out.push([x, z]);
  return out;
};

/** A round hut round a trunk: octagon walls, purple-glass windows, a cone roof with a lantern at the top. */
function hut(pl, t, y, face) {
  const P0 = pl.pal;
  const [cx, cz] = trunkCentre(t);
  const r = t.s === 2 ? 4 : 3.5;
  const cells = octagon(cx, cz, r);
  const trunkSet = setOf(trunkCellsOf(t));
  for (const [x, z] of cells) if (!trunkSet.has(cellKey(x, z))) pl.put(x, y, z, [P0.floor, {}], P.house);
  hollow(pl, cells.filter(([x, z]) => !trunkSet.has(cellKey(x, z))), y, 10);
  const ed = edge(cells);
  // the door on the side facing `face`; windows on the other three
  const pickEdge = (d) => {
    const [dx, dz] = DIRS[d];
    let best, bv = -Infinity;
    for (const e of ed) {
      const v = (e.x + 0.5 - cx) * dx + (e.z + 0.5 - cz) * dz - 0.01 * Math.abs((e.x + 0.5 - cx) * dz + (e.z + 0.5 - cz) * dx);
      if (v > bv && e.outs.includes(d)) { bv = v; best = e; }
    }
    return best;
  };
  const dc = pickEdge(face);
  const doors = [{ x: dc.x, z: dc.z }];
  const windows = ["n", "s", "e", "w"].filter((d) => d !== face).map((d) => { const e = pickEdge(d); return { x: e.x, z: e.z, tall: true }; });
  walls(pl, cells, y, 4, { doors, windows, glass: M("purple_stained_glass_pane") });
  pl.put(dc.x, y + 1, dc.z, door(P0.door, OPP[face], false), P.furn);
  pl.put(dc.x, y + 2, dc.z, door(P0.door, OPP[face], true), P.furn);
  const [fx, fz] = DIRS[face];
  for (let dy = 1; dy <= 2; dy++) pl.air(dc.x + fx, y + dy, dc.z + fz, P.path);
  const top = roof(pl, cells, y + 4, { stairs: P0.roof, slab: P0.roofSlab });
  // inside: a ring rug, two beds of boards, a cauldron, a bookshelf, and lamps from the roof
  for (const [x, z] of cells) {
    const d = Math.max(Math.abs(x + 0.5 - cx), Math.abs(z + 0.5 - cz));
    if (!trunkSet.has(cellKey(x, z)) && d <= r - 1.2 && d >= t.s / 2 + 0.4) pl.put(x, y + 1, z, [M("purple_carpet"), {}], P.furn);
  }
  const inner = edge(cells.filter(([x, z]) => Math.max(Math.abs(x + 0.5 - cx), Math.abs(z + 0.5 - cz)) <= r - 0.9), undefined).filter((e) => !trunkSet.has(cellKey(e.x, e.z)));
  const behind = inner.filter((e) => !e.outs.includes(face) && !(Math.abs(e.x - dc.x) <= 1 && Math.abs(e.z - dc.z) <= 1));
  const things = [M("bookshelf"), M("cauldron"), M("bookshelf"), M("crafting_table")];
  behind.slice(0, 4).forEach((e, i) => pl.put(e.x, y + 1, e.z, [things[i], {}], P.furn));
  for (const [ax, az] of [[cx - 2.5, cz], [cx + 1.5, cz]]) hangLamp(pl, Math.floor(ax), Math.floor(az), top, y + 3);
  // a lantern crowning the cone
  pl.put(Math.floor(cx), top + 1, Math.floor(cz), lantern(false), P.furn);
  pl.friends.push([dc.x - fx * 2, y + 1, dc.z - fz * 2]);
  return { doors, top };
}

/** An open workshop round a trunk: posts and a hip roof, railings between the posts, work tables. */
function workshop(pl, t, y, face) {
  const P0 = pl.pal;
  const [cx, cz] = trunkCentre(t);
  const half = t.s === 2 ? 4 : 3;
  const cells = [];
  for (let x = Math.floor(cx - half); x < Math.ceil(cx + half); x++) for (let z = Math.floor(cz - half); z < Math.ceil(cz + half); z++) cells.push([x, z]);
  const trunkSet = setOf(trunkCellsOf(t));
  for (const [x, z] of cells) if (!trunkSet.has(cellKey(x, z))) pl.put(x, y, z, [P0.floor, {}], P.house);
  hollow(pl, cells.filter(([x, z]) => !trunkSet.has(cellKey(x, z))), y, 9);
  const ed = edge(cells);
  for (const e of ed) {
    const corner = e.outs.length >= 2;
    if (corner || hash(e.x, 1, e.z, 4) < 0.0) {
      for (let dy = 1; dy <= 3; dy++) pl.put(e.x, y + dy, e.z, log(P0.post), P.house);
    } else {
      pl.put(e.x, y + 3, e.z, log(P0.beam, e.outs.includes("n") || e.outs.includes("s") ? "x" : "z"), P.house);
      const d = e.outs[0];
      const facingIn = (e.x + 0.5 - cx) * DIRS[face][0] + (e.z + 0.5 - cz) * DIRS[face][1] > half - 0.6 && d === face;
      if (!facingIn) pl.put(e.x, y + 1, e.z, [P0.fence, {}], P.house);
    }
  }
  const top = roof(pl, cells, y + 3, { stairs: P0.roof, slab: P0.roofSlab });
  const f = frame(cells, face);
  furnish(pl, f, y, "workshop", trunkSet);
  hangLamp(pl, ...f.at(1, Math.floor(f.d / 2)), top, y + 2);
  hangLamp(pl, ...f.at(f.w - 2, Math.floor(f.d / 2)), top, y + 2);
  const [px, pz] = f.at(2, f.d - 3);
  pl.friends.push([px, y + 1, pz]);
  return { top };
}

/**
 * The Council Hall round the great trunk: octagon walls 5 high with tall purple windows, two doors out onto a railed
 * balcony, a cone roof of crimson rising out of the canopy, a glowing crown on top; inside, the monument on a mossy
 * pedestal ringed with candles, bookshelves, and lights in the floor.
 */
function hall(pl, t, y, avoid) {
  const P0 = pl.pal;
  const [cx, cz] = trunkCentre(t);
  const r = t.s === 2 ? 5 : 4;
  const cells = octagon(cx, cz, r);
  const trunkSet = setOf(trunkCellsOf(t));
  const balcony = octagon(cx, cz, r + 2);
  const bd = deck(pl, balcony, y, { under: { cx, cz, r: r + 2, n: 2 } });
  railPosts(pl, bd.edge, y, cx, cz, 5);
  for (const [x, z] of cells) if (!trunkSet.has(cellKey(x, z))) pl.put(x, y, z, [(hash(x, y, z, 6) < 0.1 ? M("pearlescent_froglight") : P0.floor), {}], P.house);
  hollow(pl, cells.filter(([x, z]) => !trunkSet.has(cellKey(x, z))), y, 12);
  const ed = edge(cells);
  const side = (d) => {
    const [dx, dz] = DIRS[d];
    return ed.filter((e) => e.outs.includes(d) && Math.abs((e.x + 0.5 - cx) * dz + (e.z + 0.5 - cz) * dx) < 1.2);
  };
  const doorDirs = ["n", "s", "e", "w"].filter((d) => d !== avoid && d !== OPP[avoid]); // the monument stands at the far side
  const doors = doorDirs.flatMap((d) => side(d).map((e) => ({ x: e.x, z: e.z, d })));
  const windows = [];
  for (const e of ed) {
    if (doors.some((q) => q.x === e.x && q.z === e.z)) continue;
    if ((e.x + e.z) % 2 === 0 || e.outs.length > 1) continue;
    windows.push({ x: e.x, z: e.z, tall: true });
  }
  walls(pl, cells, y, 5, { doors, windows, glass: M("purple_stained_glass_pane"), postEvery: 0 });
  for (const [i, q] of doors.entries()) {
    pl.put(q.x, y + 1, q.z, door(P0.door, OPP[q.d], false, i % 2 === 1), P.furn);
    pl.put(q.x, y + 2, q.z, door(P0.door, OPP[q.d], true, i % 2 === 1), P.furn);
    const [dx, dz] = DIRS[q.d];
    for (let dy = 1; dy <= 2; dy++) pl.air(q.x + dx, y + dy, q.z + dz, P.path);
  }
  const top = roof(pl, cells, y + 5, { stairs: P0.hallRoof, slab: [P0.hallSlab] });
  // the crown: a glowing block and a crystal on top
  pl.put(Math.floor(cx), top + 1, Math.floor(cz), [M("pearlescent_froglight"), {}], P.furn);
  pl.put(Math.floor(cx), top + 2, Math.floor(cz), [M("amethyst_cluster"), { "minecraft:block_face": "up" }], P.furn);
  // the monument on its pedestal, opposite the way up, candles round it
  const away = OPP[avoid];
  const [ax, az] = DIRS[away];
  const mx = Math.floor(cx + ax * (r - 1.5)), mz = Math.floor(cz + az * (r - 1.5));
  pl.put(mx, y + 1, mz, [M("mossy_stone_bricks"), {}], P.furn);
  pl.put(mx, y + 2, mz, ["zoocraft:frequency_monument", {}], P.furn);
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = mx + dx, z = mz + dz;
    if (pl.at(x, y + 1, z)?.[0] === AIR || !pl.at(x, y + 1, z)) pl.put(x, y + 1, z, candle(M("purple_candle"), 3), P.furn);
  }
  // bookshelves against the wall either side of the monument
  for (const e of ed) {
    const ix = e.x - DIRS[e.outs[0]][0], iz = e.z - DIRS[e.outs[0]][1];
    if (Math.hypot(ix - mx, iz - mz) > 1.5 && Math.hypot(ix - mx, iz - mz) <= 3.2 && !trunkSet.has(cellKey(ix, iz))) {
      pl.put(ix, y + 1, iz, [M("bookshelf"), {}], P.furn);
      pl.put(ix, y + 2, iz, [M("bookshelf"), {}], P.furn);
    }
  }
  // lamps hanging in the hall
  for (const [dx, dz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) hangLamp(pl, Math.floor(cx + dx * (r - 2)), Math.floor(cz + dz * (r - 2)), top, y + 4);
  pl.friends.push([mx - ax * 2, y + 1, mz - az * 2]);
  pl.friends.push([Math.floor(cx + DIRS[doorDirs[0]][0] * (r - 1.5)), y + 1, Math.floor(cz + DIRS[doorDirs[0]][1] * (r - 1.5))]);
  return { top, cells };
}

// ---- bridges ----
/**
 * A rope bridge from the deck round A (radius rA, its walking surface sA) to the deck round B: a walkway of slabs two
 * or three wide, sagging a little in the middle, fence railings with posts every 4 blocks (a lantern on every other
 * one), a log post with a lantern at each end, and the leaves cleared out of the way.
 */
export function bridgeCells(A, rA, sA, B, rB, sB, onDeck) {
  const [ax, az] = A, [bx, bz] = B;
  const D = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / D, uz = (bz - az) / D;
  const S = [ax + ux * (rA - 1), az + uz * (rA - 1)], E = [bx - ux * (rB - 1), bz - uz * (rB - 1)];
  const L = Math.hypot(E[0] - S[0], E[1] - S[1]);
  const span = D - rA - rB; // open air between the decks
  const sag = Math.max(0, Math.min(2.5, span / 10, (0.45 * Math.max(span, 1) - Math.abs(sB - sA)) / 4)); // about a tenth of the span
  const surf = (t) => Math.round((sA + (sB - sA) * t - sag * 4 * t * (1 - t)) * 2) / 2;
  const walk = [], rails = [];
  const x0 = Math.floor(Math.min(S[0], E[0]) - 3), x1 = Math.ceil(Math.max(S[0], E[0]) + 3);
  const z0 = Math.floor(Math.min(S[1], E[1]) - 3), z1 = Math.ceil(Math.max(S[1], E[1]) + 3);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const px = x + 0.5 - S[0], pz = z + 0.5 - S[1];
    const t = (px * ux + pz * uz) / L;
    const dp = Math.abs(px * uz - pz * ux);
    if (t < -0.05 || t > 1.05) continue;
    const inDeck = onDeck ? onDeck(x, z) : Math.hypot(x + 0.5 - ax, z + 0.5 - az) <= rA || Math.hypot(x + 0.5 - bx, z + 0.5 - bz) <= rB;
    const tc = Math.min(1, Math.max(0, t));
    if (dp <= 1.0) walk.push({ x, z, t: tc, s: surf(tc), inDeck });
    else if (dp <= 1.75 && !inDeck) rails.push({ x, z, t: tc, s: surf(tc), along: tc * L });
  }
  return { walk, rails, L, sag, span };
}

function bridge(pl, A, rA, sA, B, rB, sB, onDeck) {
  const P0 = pl.pal;
  const { walk, rails, L } = bridgeCells(A, rA, sA, B, rB, sB, onDeck);
  const along = Math.abs(B[0] - A[0]) >= Math.abs(B[1] - A[1]) ? "x" : "z";
  for (const c of walk) {
    const half = c.s % 1 !== 0;
    const y = half ? Math.floor(c.s) : c.s - 1;
    if (!c.inDeck) pl.put(c.x, y, c.z, slab(pick(P0.slab, c.x, 0, c.z, 11), !half), P.path);
    for (let dy = 1; dy <= 3; dy++) pl.air(c.x, Math.ceil(c.s) - 1 + dy, c.z, P.path);
    if (c.inDeck) pl.air(c.x, Math.ceil(c.s), c.z, P.path); // through the deck's railing
  }
  const walkSet = setOf(walk.map((c) => [c.x, c.z]));
  // railings, posts every 4 blocks, a lantern on every other post; the end posts are logs with lanterns
  let postN = 0;
  const sorted = [...rails].sort((a, b) => a.along - b.along);
  const endA = sorted.slice(0, 2), endB = sorted.slice(-2);
  for (const c of rails) {
    if (walkSet.has(cellKey(c.x, c.z))) continue;
    const y = Math.ceil(c.s);
    const end = endA.includes(c) || endB.includes(c);
    pl.put(c.x, y - 1, c.z, log(P0.beam, along), P.rail); // the kerb the railing stands on (the walkway half a block lower)
    if (end) {
      for (let dy = 0; dy <= 2; dy++) pl.put(c.x, y + dy, c.z, log(P0.post), P.path);
      pl.put(c.x, y + 3, c.z, lantern(false), P.path);
      continue;
    }
    pl.put(c.x, y, c.z, [P0.fence, {}], P.rail);
    const k = Math.round(c.along);
    if (k % 4 === 0 && k > 2 && k < L - 2) {
      pl.put(c.x, y + 1, c.z, [P0.fence, {}], P.rail);
      if ((postN++ + k) % 2 === 0) pl.put(c.x, y + 2, c.z, lantern(false), P.rail);
    }
  }
}

// ---- the whole village ----
/** Cells of the great deck, and of each home's deck (shared by the plan and the layout's checks). */
export function deckR(s) {
  return s === 2 ? 7.5 : 5.5;
}
export function satR(s) {
  return s === 2 ? 6.5 : 5.5;
}

/**
 * Every block of a village from its layout (see chooseLayout), relative to the great trunk's corner at its foot:
 * { pal: [[typeId, states]], ops: [[dx, dy, dz, palette index, may-replace-branch-log 0|1]], friends: [[dx, dy, dz]],
 * box: { min, max } } in the order they go up (clearing, then blocks, then what hangs or stands on them).
 */
export function villagePlan(L, palette = "timber") {
  const pl = new Plan(PALETTES[palette] ?? PALETTES.timber);
  const main = { x0: 0, z0: 0, s: L.s, b: 0, h: L.h };
  const [cx, cz] = trunkCentre(main);
  const R1 = deckR(L.s);
  const trees = [main, ...L.sats.map((q) => ({ x0: q.x, z0: q.z, s: q.s, b: q.b, h: q.h }))];
  const deckSets = []; // each tree's deck cells (where a bridge lands on it)
  // the great deck, stepping in underneath
  const mainHole = setOf(trunkCellsOf(main));
  const deckCells = octagon(cx, cz, R1).filter(([x, z]) => !inTrunk(main, x, L.f1, z));
  const dk = deck(pl, deckCells, L.f1, { hole: mainHole, under: { cx, cz, r: R1, n: 3 } });
  railPosts(pl, dk.edge, L.f1, cx, cz, 4);
  deckSets[0] = dk.set;
  // benches and planters round the deck, inside the railing, between the lamp posts
  for (const e of dk.edge) {
    const h = hash(e.x, L.f1, e.z, 12);
    const inX = e.x - DIRS[e.outs[0]][0], inZ = e.z - DIRS[e.outs[0]][1];
    if (h < 0.16 && e.outs.length === 1) pl.put(inX, L.f1 + 1, inZ, stairs(pl.pal.stairs, e.outs[0]), P.furn);
    else if (h > 0.9) pl.put(inX, L.f1 + 1, inZ, leaves(M("azalea_leaves_flowered")), P.furn);
  }
  // homes on the deck's edge
  const podW = L.s === 2 ? 8 : 7, podD = 6;
  for (const d of L.pods) {
    const [dx, dz] = DIRS[d];
    const front = Math.floor(R1) - 1; // the front wall stands just inside the deck's edge
    const cells = [];
    for (let a = 0; a < podW; a++) for (let b = 0; b < podD; b++) {
      const across = a - Math.floor((podW - L.s) / 2);
      const out = front + b;
      const x = dx ? (dx > 0 ? L.s - 1 + out : -out) : across;
      const z = dz ? (dz > 0 ? L.s - 1 + out : -out) : across;
      cells.push([x, z]);
    }
    const hm = home(pl, cells, L.f1, OPP[d], "pod");
    // a strut under its back to the trunk
    const back = front + podD - 1;
    for (const j of [1, podW - 2]) {
      const across = j - Math.floor((podW - L.s) / 2);
      const x = dx ? (dx > 0 ? L.s - 1 + back : -back) : across;
      const z = dz ? (dz > 0 ? L.s - 1 + back : -back) : across;
      strut(pl, x, z, L.f1 - 1, OPP[d], Math.min(back - 1, L.f1 - 2));
    }
    void hm;
  }
  // the Council Hall
  const floors = [{ y: L.f1, cells: setOf(deckCells) }];
  if (L.f2) {
    const hl = hall(pl, main, L.f2, L.arrive2 ?? "s");
    floors.push({ y: L.f2, cells: setOf(hl.cells) });
  }
  spiral(pl, main, floors, 0);
  // the homes on the trees round about
  for (const [i, q] of L.sats.entries()) {
    const t = trees[i + 1];
    const [qx, qz] = trunkCentre(t);
    const cells = octagon(qx, qz, satR(q.s)).filter(([x, z]) => !inTrunk(t, x, q.f, z));
    const dq = deck(pl, cells, q.f, { hole: setOf(trunkCellsOf(t)), under: { cx: qx, cz: qz, r: satR(q.s), n: Math.min(2, q.f - q.b - 2) } });
    deckSets[i + 1] = dq.set;
    railPosts(pl, dq.edge, q.f, qx, qz, 4);
    const half = q.s === 2 ? 4 : 3;
    const hc = [];
    for (let x = Math.floor(qx - half + (q.s === 2 ? 0 : 0.5)); x < Math.floor(qx - half + (q.s === 2 ? 0 : 0.5)) + 2 * half + (q.s === 2 ? 0 : 1); x++) {
      for (let z = Math.floor(qz - half + (q.s === 2 ? 0 : 0.5)); z < Math.floor(qz - half + (q.s === 2 ? 0 : 0.5)) + 2 * half + (q.s === 2 ? 0 : 1); z++) hc.push([x, z]);
    }
    if (q.kind === "hut") hut(pl, t, q.f, q.face);
    else if (q.kind === "workshop") workshop(pl, t, q.f, q.face);
    else home(pl, hc, q.f, q.face, "home", t);
  }
  // the bridges
  for (const [a, b] of L.links) {
    const ta = trees[a + 1], tb = trees[b + 1];
    const fa = a < 0 ? L.f1 : L.sats[a].f, fb = L.sats[b].f;
    bridge(pl, trunkCentre(ta), a < 0 ? R1 : satR(ta.s), fa + 1, trunkCentre(tb), satR(tb.s), fb + 1, (x, z) => deckSets[a + 1].has(cellKey(x, z)) || deckSets[b + 1].has(cellKey(x, z)));
  }
  // finish: never into a trunk; order: clearing, blocks, then what hangs or stands on them
  const zones = trees.map((t) => ({ c: trunkCentre(t), r: t.s === 2 ? 7 : 5.5 }));
  const pal = [], palIx = new Map(), ops = [];
  const list = [...pl.m.values()].filter((o) => !trees.some((t) => inTrunk(t, o.x, o.y, o.z)));
  list.sort((p, q) => stage(p.b[0]) - stage(q.b[0]) || p.y - q.y || p.n - q.n);
  const box = { min: { x: Infinity, y: Infinity, z: Infinity }, max: { x: -Infinity, y: -Infinity, z: -Infinity } };
  for (const o of list) {
    const k = `${o.b[0]}|${JSON.stringify(o.b[1])}`;
    let i = palIx.get(k);
    if (i === undefined) {
      i = pal.push(o.b) - 1;
      palIx.set(k, i);
    }
    const branch = zones.some((zn) => Math.hypot(o.x + 0.5 - zn.c[0], o.z + 0.5 - zn.c[1]) <= zn.r) ? 1 : 0;
    ops.push([o.x, o.y, o.z, i, branch]);
    for (const a of ["x", "y", "z"]) {
      box.min[a] = Math.min(box.min[a], o[a]);
      box.max[a] = Math.max(box.max[a], o[a]);
    }
  }
  return { pal, ops, friends: pl.friends, box };
}

// ---- where it goes ----
const LOG = M("jungle_log");
/** What a village may take the place of: air, leaves of any tree, vines, grass and ferns. Nothing anyone built. */
export function canFill(typeId) {
  return typeId === AIR || /^minecraft:\w*leaves\w*$/.test(typeId ?? "") || typeId === M("vine") || typeId === M("short_grass") || typeId === M("fern");
}

/**
 * The trunk a jungle log top (x, y, z) belongs to, or undefined: down to its lowest log, which must stand on the
 * ground (not a branch); 2 by 2 when its neighbours are logs too. { x0, z0, s, b, h }.
 */
export function trunkAt(read, x, y, z) {
  if (read(x, y, z) !== LOG) return undefined;
  let b = y;
  while (y - b < 80 && read(x, b - 1, z) === LOG) b--;
  const under = read(x, b - 1, z);
  if (!under || canFill(under)) return undefined;
  let x0 = x, z0 = z, s = 1;
  for (const [ox, oz] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
    const ax = x + ox, az = z + oz;
    if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, c]) => read(ax + a, b, az + c) === LOG && read(ax + a, b + 2, az + c) === LOG && read(ax + a, b - 1, az + c) !== LOG)) {
      x0 = ax; z0 = az; s = 2;
      break;
    }
  }
  let top = b;
  for (let a = 0; a < s; a++) for (let c = 0; c < s; c++) {
    let yy = b;
    while (yy - b < 80 && read(x0 + a, yy + 1, z0 + c) === LOG) yy++;
    top = Math.max(top, yy);
  }
  return { x0, z0, s, b, h: top - b + 1 };
}

const angle = (dx, dz) => Math.atan2(dz, dx);
const angDiff = (a, b) => {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return Math.min(d, Math.PI * 2 - d);
};
const CARD = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 };
/** The side of a point (dx, dz) from a centre, as n/s/e/w. */
export const sideOf = (dx, dz) => (Math.abs(dx) >= Math.abs(dz) ? (dx >= 0 ? "e" : "w") : dz >= 0 ? "s" : "n");

/** The levels of the great tree for a trunk h tall: the deck's floor f1, the Council Hall's floor f2 (0: none). */
export function levels(h) {
  const f1 = Math.max(6, Math.min(12, Math.round(h * 0.42)));
  const f2 = h >= 20 ? Math.max(f1 + 11, h - 9) : 0;
  return { f1, f2 };
}

/**
 * Lay a village out round the great trunk `main` (from trunkAt), among the jungle log tops round it ([{ x, y, z }],
 * as the game's topmost blocks give them): the trees round it that get a home (tall enough, near enough, a bridge's
 * way clear to them through only leaves, vines and air), homes on the great deck where no bridge leaves, bridges
 * between near neighbours. A generator (it reads a lot of blocks; it yields now and then). Returns the layout,
 * relative to the great trunk's corner at its foot.
 */
export function* chooseLayout(read, main, tops, g) {
  const { f1, f2 } = levels(main.h);
  const O = { x: main.x0, y: main.b, z: main.z0 };
  const [mcx, mcz] = trunkCentre(main);
  const R1 = deckR(main.s);
  // the trunks round about
  const trunks = [];
  const seen = new Set(trunkCellsOf(main).map(([x, z]) => cellKey(x, z)));
  let n = 0;
  for (const t of [...tops].sort((a, b) => b.y - a.y)) {
    if (seen.has(cellKey(t.x, t.z))) continue;
    const tr = trunkAt(read, t.x, t.y, t.z);
    if (++n % 8 === 0) yield;
    if (!tr) continue;
    for (const [x, z] of trunkCellsOf(tr)) seen.add(cellKey(x, z));
    trunks.push(tr);
  }
  const trunkCols = new Map();
  for (const t of [main, ...trunks]) for (const [x, z] of trunkCellsOf(t)) trunkCols.set(cellKey(x, z), t);
  // is the way for a bridge between two trees clear (only what a village may fill, or branches of those two trees)?
  const zoneOf = (t) => ({ c: trunkCentre(t), r: t.s === 2 ? 7 : 5.5 });
  function* clear(ta, ra, fa, tb, rb, fb) {
    const { walk, span } = bridgeCells(trunkCentre(ta), ra, fa + 1, trunkCentre(tb), rb, fb + 1);
    if (span < 2 || span > g.bridgeMax || Math.abs(fa - fb) > 0.45 * span) return false;
    const zones = [zoneOf(ta), zoneOf(tb)];
    let k = 0;
    for (const c of walk) {
      if (c.inDeck) continue;
      const other = trunkCols.get(cellKey(c.x, c.z));
      if (other && other !== ta && other !== tb) return false;
      const y0 = Math.ceil(c.s) - 1;
      for (let y = y0; y <= y0 + 3; y++) {
        const id = read(c.x, O.y + y, c.z);
        if (++k % 64 === 0) yield;
        if (canFill(id)) continue;
        if (id === LOG && zones.some((zn) => Math.hypot(c.x + 0.5 - zn.c[0], c.z + 0.5 - zn.c[1]) <= zn.r)) continue;
        return false;
      }
    }
    return true;
  }
  // the trees that could have a home, best first
  const cands = [];
  for (const t of trunks) {
    if (t.h < g.satTrunk) continue;
    const [cx, cz] = trunkCentre(t);
    const D = Math.hypot(cx - mcx, cz - mcz);
    const span = D - R1 - satR(t.s);
    if (span < 2 || span > g.bridgeMax) continue;
    // no other tree's trunk inside its deck
    if ([main, ...trunks].some((o) => o !== t && Math.hypot(trunkCentre(o)[0] - cx, trunkCentre(o)[1] - cz) < satR(t.s) + 1)) continue;
    // each home at its own height (the videos: "height variety is the key"), its roof under its own crown where the
    // tree is tall enough, and never steeper than a bridge can climb
    const off = [-3, 3, -2, 4][Math.floor(hash(t.x0, 0, t.z0, 9) * 4)];
    const top = t.b + t.h - O.y, lo = t.b + 5 - O.y, hi = top - 2, slack = Math.floor(0.45 * span);
    let f = Math.max(lo, Math.min(Math.max(lo, top - 8), f1 + off));
    f = Math.max(f1 - slack, Math.min(f1 + slack, f));
    if (f < lo || f > hi) continue;
    cands.push({ t, D, span, f, a: angle(cx - mcx, cz - mcz), score: Math.min(t.h, 20) / 20 - Math.abs(span - 9) / 12 });
  }
  cands.sort((p, q) => q.score - p.score);
  const sats = [];
  for (const c of cands) {
    if (sats.length >= g.maxHomes) break;
    if (sats.some((q) => angDiff(q.a, c.a) < (g.spread * Math.PI) / 180)) continue;
    const [cx, cz] = trunkCentre(c.t);
    if (sats.some((q) => Math.hypot(trunkCentre(q.t)[0] - cx, trunkCentre(q.t)[1] - cz) < satR(q.t.s) + satR(c.t.s) + 2)) continue;
    if (!(yield* clear(main, R1, f1, c.t, satR(c.t.s), c.f))) continue;
    sats.push(c);
  }
  // homes on the great deck: on the sides no bridge leaves from, at most 3
  const pods = [];
  for (const d of ["s", "e", "n", "w"]) {
    if (pods.length >= 3) break;
    if (sats.some((q) => angDiff(q.a, CARD[d]) < (g.podClear * Math.PI) / 180)) continue;
    const [dx, dz] = DIRS[d];
    const far = R1 + 6;
    if ([...trunkCols.values()].some((o) => o !== main && (() => {
      const [ox, oz] = trunkCentre(o);
      const along = (ox - mcx) * dx + (oz - mcz) * dz, across = Math.abs((ox - mcx) * dz - (oz - mcz) * dx);
      return along > R1 - 2 && along < far + 1 && across < 6;
    })())) continue;
    pods.push(d);
  }
  // bridges between neighbours too (at most 2), where their way is clear and crosses no other bridge
  const links = sats.map((_, i) => [-1, i]);
  const seg = (q) => [[mcx, mcz], trunkCentre(q.t)];
  const crosses = (p1, p2, p3, p4) => {
    const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
    return o(p1, p2, p3) !== o(p1, p2, p4) && o(p3, p4, p1) !== o(p3, p4, p2);
  };
  let extra = 0;
  for (let i = 0; i < sats.length && extra < 2; i++) for (let j = i + 1; j < sats.length && extra < 2; j++) {
    const a = sats[i], b = sats[j];
    const [ax, az] = trunkCentre(a.t), [bx, bz] = trunkCentre(b.t);
    if (Math.hypot(bx - ax, bz - az) > g.linkMax) continue;
    // not past the great deck, and not across another bridge
    const ux = bx - ax, uz = bz - az, L2 = ux * ux + uz * uz;
    const tt = Math.max(0, Math.min(1, ((mcx - ax) * ux + (mcz - az) * uz) / L2));
    if (Math.hypot(ax + ux * tt - mcx, az + uz * tt - mcz) < R1 + 3) continue;
    if (sats.some((q, k) => k !== i && k !== j && crosses([ax, az], [bx, bz], ...seg(q)))) continue;
    if (!(yield* clear(a.t, satR(a.t.s), a.f, b.t, satR(b.t.s), b.f))) continue;
    links.push([i, j]);
    extra++;
  }
  const kinds = ["home", "hut", "workshop", "home", "hut"];
  return {
    v: PLAN_V,
    s: main.s,
    h: main.h,
    f1,
    f2,
    pods,
    sats: sats.map((q, i) => {
      const [cx, cz] = trunkCentre(q.t);
      return { x: q.t.x0 - O.x, z: q.t.z0 - O.z, s: q.t.s, b: q.t.b - O.y, h: q.t.h, f: q.f, kind: kinds[i % kinds.length], face: sideOf(mcx - cx, mcz - cz) };
    }),
    links,
  };
}

// ---- what a village replaced, written down compactly ----
/** The most characters in one world property of a village's record. */
export const KEPT_PART = 30000;
const B36 = (v, w) => v.toString(36).padStart(w, "0");
const OFF = 648; // offsets -648..647 in 2 characters
/** One replaced block, 11 characters: where (from the trunk's corner), what was there (code index), what we put (type index). */
export function packEntry(dx, dy, dz, c, t) {
  return B36(dx + OFF, 2) + B36(dy + OFF, 2) + B36(dz + OFF, 2) + B36(c, 3) + B36(t, 2);
}
export function unpackEntries(s) {
  const out = [];
  for (let i = 0; i + 11 <= s.length; i += 11) {
    const n = (a, w) => parseInt(s.slice(i + a, i + a + w), 36);
    out.push([n(0, 2) - OFF, n(2, 2) - OFF, n(4, 2) - OFF, n(6, 3), n(9, 2)]);
  }
  return out;
}
