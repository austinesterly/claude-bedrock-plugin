// The fenced park area (0.1.101, idea 12: "a 1-block-tall fence all the way round makes every X and Z position inside
// it, at any Y, workable zoo space"; research/fence_plan.md). Pure, so tests can run it.
//
// A fence column is an (x, z) with an Aluminum Fence, an Aluminum Fence Gate or a part of the Park Entrance Gate in it,
// at any height. Over the fence's bounding box and a one-block margin, the outside is everything the box's edge
// reaches without crossing a fence column, moving sideways and diagonally (fences link only along their sides, so a
// diagonal step between two fences is a gap). If the Park Deed's spot isn't reached, the fence is closed, and the park
// is every column joined to the spot that isn't outside: the ground, the fence itself, and any pocket a fence closes
// off inside. A separately fenced patch elsewhere doesn't count. Run as a job (areaSteps yields every `perYield` cells).

export const colKey = (x, z) => `${x},${z}`;

/** @returns {[number, number]} */
export function parseCol(key) {
  const i = key.indexOf(",");
  return [Number(key.slice(0, i)), Number(key.slice(i + 1))];
}

const SQUEEZES = [6, 16, 48, 160]; // how far a gap's two sides may be (each side), tried in turn: a narrow gap first

/**
 * Work out the park's area from its fence columns, as a job.
 * @param {Iterable<[number, number]>} cols the fence columns (x, z), in the park's dimension
 * @param {{x: number, z: number}} center the Park Deed's spot
 * @param {number} [perYield] cells between yields
 * @returns {Generator<void, {closed: boolean, reason?: string, gap?: {x: number, z: number}, fence: number, area?: any}>}
 */
export function* areaSteps(cols, center, perYield = 4000) {
  // 0.1.106 (Austin: "The zoo should just be where aluminum fences enclose"): every fence column counts, however far
  // from the spot; the work is the fence's own box, so a 100 x 100 park costs a 100 x 100 fill.
  const cx = Math.floor(center.x), cz = Math.floor(center.z);
  const kept = [];
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of cols) {
    kept.push(x, z);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  const fence = kept.length / 2;
  if (!fence) return { closed: false, reason: "none", fence };
  if (cx < minX || cx > maxX || cz < minZ || cz > maxZ) return { closed: false, reason: "around", fence };
  // The grid: the fence's box, a margin of one (always outside, where the outside fill starts) and round that a wall
  // (state 4) the fills never cross, so a neighbour is always in the grid and needs no bounds check.
  const x0 = minX - 2, z0 = minZ - 2;
  const W = maxX - minX + 5, H = maxZ - minZ + 5;
  const N = W * H;
  const st = new Uint8Array(N); // 0 not reached, 1 fence, 2 outside, 3 park, 4 the wall
  for (let x = 0; x < W; x++) st[x] = st[N - W + x] = 4;
  for (let z = 1; z < H - 1; z++) st[z * W] = st[z * W + W - 1] = 4;
  for (let i = 0; i < kept.length; i += 2) st[(kept[i + 1] - z0) * W + (kept[i] - x0)] = 1;
  const from = new Int32Array(N); // the outside fill's trail back to the margin, as index + 1 (0: none)
  const q = new Int32Array(N);
  let head = 0, tail = 0, work = 0;
  for (let x = 1; x < W - 1; x++) {
    st[W + x] = st[N - 2 * W + x] = 2;
    q[tail++] = W + x;
    q[tail++] = N - 2 * W + x;
  }
  for (let z = 2; z < H - 2; z++) {
    st[z * W + 1] = st[z * W + W - 2] = 2;
    q[tail++] = z * W + 1;
    q[tail++] = z * W + W - 2;
  }
  const spot = (cz - z0) * W + (cx - x0);
  const onFence = st[spot] === 1;
  // Sideways and diagonally (a diagonal step between two fences is a gap: they link only along their sides).
  const a = 1, b = -1, c = W, d = -W, e = W + 1, f = W - 1, g = 1 - W, h = -1 - W;
  while (head < tail) {
    const i = q[head++];
    const t = i + 1;
    let j;
    if (st[(j = i + a)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + b)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + c)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + d)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + e)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + f)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + g)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (st[(j = i + h)] === 0) { st[j] = 2; from[j] = t; q[tail++] = j; }
    if (!onFence && st[spot] === 2) break; // the outside reached the spot: a gap
    if (++work === perYield) {
      work = 0;
      yield;
    }
  }
  // Where the park starts: the spot, or (a fence on the spot itself) the ground beside it.
  const seeds = onFence ? [a, b, c, d, e, f, g, h].map((o) => spot + o).filter((j) => st[j] !== 1) : [spot];
  const inner = seeds.filter((j) => st[j] === 0);
  if (!inner.length) {
    const out = seeds.find((j) => st[j] === 2);
    const gap = out === undefined ? undefined : yield* gapSteps(st, from, out, W, x0, z0);
    return { closed: false, reason: "gap", gap, fence };
  }
  head = tail = 0;
  let ground = 0;
  for (const j of inner) {
    st[j] = 3;
    q[tail++] = j;
    ground++;
  }
  if (onFence) {
    st[spot] = 3;
    q[tail++] = spot;
  }
  // The park: everything joined to the spot that isn't outside (the ground, the fence, pockets the fence closes off).
  while (head < tail) {
    const i = q[head++];
    let j, s;
    if ((s = st[(j = i + a)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + b)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + c)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + d)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + e)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + f)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + g)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if ((s = st[(j = i + h)]) < 2) { if (!s) ground++; st[j] = 3; q[tail++] = j; }
    if (++work === perYield) {
      work = 0;
      yield;
    }
  }
  // The area as runs of X, a row per Z (rows[k] is the row at z0 + k: x, x, x, x, ... in pairs, first and last).
  const rows = [];
  let area = 0;
  let lo = -1, hi = -1, ax0 = Infinity, ax1 = -Infinity;
  for (let z = 1; z < H - 1; z++) {
    const runs = [];
    let start = -1;
    const row = z * W;
    for (let x = 1; x < W; x++) {
      const on = st[row + x] === 3;
      if (on && start < 0) start = x;
      else if (!on && start >= 0) {
        runs.push(start + x0, x - 1 + x0);
        area += x - start;
        start = -1;
      }
    }
    if (runs.length) {
      if (lo < 0) lo = rows.length;
      hi = rows.length;
      if (runs[0] < ax0) ax0 = runs[0];
      if (runs[runs.length - 1] > ax1) ax1 = runs[runs.length - 1];
    }
    rows.push(runs);
    work += W;
    if (work >= perYield) {
      work = 0;
      yield;
    }
  }
  return {
    closed: true,
    fence,
    area: { z0: z0 + 1 + lo, rows: rows.slice(lo, hi + 1), cells: area, ground, box: { minX: ax0, maxX: ax1, minZ: z0 + 1 + lo, maxZ: z0 + 1 + hi } },
  };
}

// Where a leaky fence lets the outside in: along the shortest way out from the spot (the outside fill's trail back to
// the margin), the first place from the edge where the way squeezes between two fence columns (on opposite sides,
// within `squeeze` blocks each), or steps diagonally between two. A wide gap (the fence left open for a long stretch)
// is looked for again with a wider squeeze. Failing that, the first place beside a fence.
function* gapSteps(st, from, start, W, x0, z0) {
  const path = [];
  for (let i = start; i >= 0; i = from[i] - 1) path.push(i);
  path.reverse(); // from the edge in toward the spot
  const at = (i) => ({ x: (i % W) + x0, z: Math.floor(i / W) + z0 });
  // How far along an axis (index step `o`) the nearest fence is from `i`, up to `max` (Infinity: none; the wall stops it).
  const fenceAlong = (i, o, max) => {
    for (let k = 1, j = i + o; k <= max; k++, j += o) {
      const s = st[j];
      if (s === 1) return k;
      if (s === 4 || s === undefined) return Infinity;
    }
    return Infinity;
  };
  const axes = [1, W, W + 1, W - 1];
  let work = 0;
  for (const squeeze of SQUEEZES) {
    for (let p = 0; p < path.length; p++) {
      const i = path[p];
      for (const o of axes) if (fenceAlong(i, o, squeeze) <= squeeze && fenceAlong(i, -o, squeeze) <= squeeze) return at(i);
      if (squeeze === SQUEEZES[0] && p + 1 < path.length) {
        const o = path[p + 1] - i;
        if (o !== 1 && o !== -1 && o !== W && o !== -W) {
          const dx = ((o % W) + W + 1) % W - 1; // -1 or 1
          if (st[i + dx] === 1 && st[i + (o - dx)] === 1) return at(i);
        }
      }
      work += squeeze;
      if (work >= 20000) {
        work = 0;
        yield;
      }
    }
  }
  for (const i of path) for (const o of [1, -1, W, -W, W + 1, W - 1, 1 - W, -1 - W]) if (st[i + o] === 1) return at(i);
  return undefined;
}

/** Is the column (x, z) inside an area from areaSteps? */
export function insideArea(area, x, z) {
  if (!area) return false;
  const k = Math.floor(z) - area.z0;
  const runs = area.rows[k];
  if (!runs) return false;
  const fx = Math.floor(x);
  for (let i = 0; i < runs.length; i += 2) {
    if (fx < runs[i]) return false;
    if (fx <= runs[i + 1]) return true;
  }
  return false;
}

/**
 * Is the column (x, z) inside the park? Its fenced area once a fence has closed round the Park Deed's spot; until
 * then the park has no ground (0.1.106: the park is exactly what its Aluminum Fence encloses, whenever it was claimed).
 */
export function insideParkEdge(park, area, x, z) {
  void park;
  return area ? insideArea(area, x, z) : false;
}

/** A compass word for where (x, z) lies from (cx, cz): north is -z. */
export function compass(cx, cz, x, z) {
  const a = (Math.atan2(x - cx, -(z - cz)) * 180) / Math.PI;
  const names = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return names[((Math.round(a / 45) % 8) + 8) % 8];
}

/** Two saved areas are the same ground (both undefined counts as the same). */
export function sameArea(a, b) {
  if (!a || !b) return !a && !b;
  return a.dimension === b.dimension && a.cx === b.cx && a.cz === b.cz && a.z0 === b.z0 && JSON.stringify(a.rows) === JSON.stringify(b.rows);
}

/**
 * How the fence stands, from an areaSteps result and the number of Aluminum Fence and gate blocks listed: "none" (no
 * Aluminum Fence at all; a Park Entrance Gate alone isn't a fence), "closed", "gap" or "around" (it doesn't go round the
 * Park Deed's spot).
 */
export function fenceState(r, aluminum) {
  if (!aluminum) return "none";
  if (r.closed) return "closed";
  return r.reason === "none" ? "around" : r.reason;
}

const thousands = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function gapWhere(st, ctx) {
  const g = st.gap;
  const d = Math.round(Math.hypot(g.x - ctx.center.x, g.z - ctx.center.z));
  return `near ${g.x} ${g.y} ${g.z} (about ${thousands(d)} blocks ${compass(ctx.center.x, ctx.center.z, g.x, g.z)} of the Park Deed's spot)`;
}

// What the park is while its fence isn't closed: its last closed edge, or nothing yet.
function meanwhile(ctx) {
  if (ctx.edge === "fence") return "the park keeps its last closed edge until it's mended";
  return "the park has no ground until it closes round the Park Deed's spot";
}

/**
 * One line on how the park's fence stands, for the Park Ledger and a fence's info (`short` false: no colour, starts in
 * lower case), or the action bar of the player who changed it (`short` true). `st` is the saved status (or undefined:
 * never worked out). `ctx`: { center, edge ("fence" | "none") }.
 */
export function statusText(st, ctx, short) {
  const state = st?.state ?? "none";
  const c = ctx.center;
  let colour = "§e";
  let text;
  if (state === "closed") {
    colour = "§a";
    text = `the park is the ground inside its Aluminum Fence: ${thousands(st.ground ?? 0)} blocks of it, at every height`;
  } else if (state === "none") {
    colour = "§7";
    text = ctx.edge === "fence"
      ? "the park is the ground inside its Aluminum Fence"
      : `no Aluminum Fence round the park yet: it has no ground until one closes round the Park Deed's spot (${c.x} ${c.y} ${c.z})`;
  } else if (state === "around") text = `the Aluminum Fence doesn't go round the Park Deed's spot (${c.x} ${c.y} ${c.z}), so ${meanwhile(ctx)}`;
  else if (state === "overlap") text = `the Aluminum Fence closes round ${st.other?.name ?? "another park"}'s Park Deed spot (${st.other?.x} ${st.other?.y} ${st.other?.z}) as well as this park's, so it isn't this park's fence (a park can't hold another park); ${meanwhile(ctx)}`;
  else text = st.gap ? `the Aluminum Fence has a gap ${gapWhere(st, ctx)}, so ${meanwhile(ctx)}` : `the Aluminum Fence doesn't close round the Park Deed's spot yet, so ${meanwhile(ctx)}`;
  if (!short) return text;
  return colour + text[0].toUpperCase() + text.slice(1);
}

/**
 * What every member is told when the fence's state changes for the park as a whole: it closed, it opened up after
 * being closed, or it's all gone. Undefined otherwise (the player building it sees statusText on the action bar).
 * `was` is the state before; `hadArea` whether the park had a fenced area before this run.
 */
export function changeText(was, st, hadArea, ctx) {
  const state = st.state;
  if (state === "closed" && was !== "closed") {
    return `§aThe Aluminum Fence closes round the park: §feverything inside it, at every height, is the park now (${thousands(st.ground ?? 0)} blocks of ground).`;
  }
  if (state === "overlap" && was !== "overlap") {
    return `§eThe Aluminum Fence closes round ${st.other?.name ?? "another park"}'s Park Deed spot (${st.other?.x} ${st.other?.y} ${st.other?.z}) too, so it isn't this park's fence: §fa park can't hold another park. Fence the two parks apart${hadArea ? "; this park keeps its last closed edge meanwhile" : ""}.`;
  }
  if (was === "closed" && state !== "closed" && state !== "none") {
    const what = state === "gap" && st.gap ? `has a gap ${gapWhere(st, ctx)}` : "doesn't close round the Park Deed's spot any more";
    return `§eThe Aluminum Fence ${what}. §fThe park keeps its last closed edge until it's mended.`;
  }
  if (state === "none" && hadArea) {
    return "§eNo Aluminum Fence is left round the park: §fit has no ground until a fence closes round the Park Deed's spot again.";
  }
  return undefined;
}

/** How far (x, z) is from the nearest of the fence columns (the park's edge), sideways. */
export function edgeDistance(cols, x, z) {
  let best = Infinity;
  for (const [cx, cz] of cols) {
    const d = (cx - x) ** 2 + (cz - z) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}
