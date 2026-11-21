// 0.1.352: Dr. Foss leads the way to the great cave (Austin, 2026-11-21: "Dr Foss should lead the player in Acufend to
// find the cave"). He used to walk behind the player; now, until they stand in the great chamber, he walks ahead of
// them: over the moon by a way a player can walk (never up a step higher than one block, round the dripstone spikes,
// round the mountains' cliffs), to the cave's mouth, down the way in, across the side chamber, along the passage, as
// far as the edge of the great chamber (he never goes nearer the statue while Augustus Kong guards it). He waits when
// they fall behind and hurries to stay in front. Pure: residents/fossExpedition.js plays it.
import { alongTube, wayFloor } from "../world/acufendMouthRules.js";
import { wayInSide } from "./fossRules.js";

const hyp = (x, z) => Math.hypot(x, z);
const yawTo = (dx, dz) => (Math.atan2(-dx, dz) * 180) / Math.PI;

/** A small heap of [cost, key] pairs, least first. */
function heapPush(h, item) {
  h.push(item);
  let i = h.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h[p][0] <= h[i][0]) break;
    [h[p], h[i]] = [h[i], h[p]];
    i = p;
  }
}
function heapPop(h) {
  const top = h[0];
  const last = h.pop();
  if (h.length) {
    h[0] = last;
    let i = 0;
    for (;;) {
      const l = i * 2 + 1, r = l + 1;
      let m = i;
      if (l < h.length && h[l][0] < h[m][0]) m = l;
      if (r < h.length && h[r][0] < h[m][0]) m = r;
      if (m === i) break;
      [h[m], h[i]] = [h[i], h[m]];
      i = m;
    }
  }
  return top;
}

/**
 * A way over the land from `from` to `to` a player can walk: [{ x, y, z }] (y: standing there), or undefined when
 * there is none. `ground(x, z)`: the land's top block there (undefined off the land); `blocked(x, z)`: a spike stands
 * there. Looked for on a grid g.cell blocks apart, each step checked block by block: never up more than
 * g.maxStep at a time, nor down more than g.maxDrop (a drop a player takes unhurt). Longer ways round are taken sooner than climbs (g.climb for each block up or down). A
 * generator: it yields now and then (every g.slice places looked at), so the game can run it a little each tick.
 */
export function* surfaceRoute(ground, blocked, from, to, g) {
  const c = g.cell;
  const gx = (i) => i * c, key = (i, j) => (i + 2048) * 4096 + (j + 2048);
  const memo = new Map();
  const h = (x, z) => {
    const kk = (x + 8192) * 16384 + (z + 8192);
    let v = memo.get(kk);
    if (v === undefined) {
      v = blocked(x, z) ? null : (ground(x, z) ?? null);
      memo.set(kk, v);
    }
    return v;
  };
  /** the climb along a straight line between two places, or -1 when it can't be walked */
  const walk = (ax, az, bx, bz) => {
    const n = Math.max(Math.abs(bx - ax), Math.abs(bz - az));
    let prev = h(ax, az);
    if (prev === null) return -1;
    let climb = 0;
    for (let t = 1; t <= n; t++) {
      const y = h(Math.round(ax + ((bx - ax) * t) / n), Math.round(az + ((bz - az) * t) / n));
      if (y === null || y - prev > g.maxStep || prev - y > g.maxDrop) return -1;
      climb += Math.abs(y - prev);
      prev = y;
    }
    return climb;
  };
  const si = Math.round(from.x / c), sj = Math.round(from.z / c), ti = Math.round(to.x / c), tj = Math.round(to.z / c);
  // the nearest grid place to each end that can be stood on (the ends themselves may be on a spike's foot)
  const near = (i, j) => {
    for (let r = 0; r <= 3; r++) for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (Math.max(Math.abs(a), Math.abs(b)) === r && h(gx(i + a), gx(j + b)) !== null) return [i + a, j + b];
    return undefined;
  };
  const s = near(si, sj), t = near(ti, tj);
  if (!s || !t) return undefined;
  const best = new Map([[key(s[0], s[1]), 0]]);
  const came = new Map();
  const at = new Map([[key(s[0], s[1]), s], [key(t[0], t[1]), t]]);
  const open = [[hyp(s[0] - t[0], s[1] - t[1]) * c, key(s[0], s[1])]];
  const goal = key(t[0], t[1]);
  let looked = 0;
  let found = false;
  while (open.length) {
    const [, kk] = heapPop(open);
    if (kk === goal) {
      found = true;
      break;
    }
    const [i, j] = at.get(kk);
    const cost = best.get(kk);
    if (++looked > g.maxNodes) break;
    if (looked % g.slice === 0) yield;
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        if (!a && !b) continue;
        const ni = i + a, nj = j + b, nk = key(ni, nj);
        const climb = walk(gx(i), gx(j), gx(ni), gx(nj));
        if (climb < 0) continue;
        const nc = cost + hyp(a, b) * c + climb * g.climb;
        if (nc >= (best.get(nk) ?? Infinity)) continue;
        best.set(nk, nc);
        came.set(nk, kk);
        at.set(nk, [ni, nj]);
        heapPush(open, [nc + hyp(ni - t[0], nj - t[1]) * c, nk]);
      }
    }
  }
  if (!found) return undefined;
  const out = [];
  for (let kk = goal; kk !== undefined; kk = came.get(kk)) {
    const [i, j] = at.get(kk);
    out.unshift({ x: gx(i) + 0.5, y: /** @type {number} */ (h(gx(i), gx(j))) + 1, z: gx(j) + 0.5 });
  }
  return out;
}

/** A straight way from `from` to `to`, a place every g.cell blocks (when no walkable way was found: he does his best). */
export function straightRoute(ground, from, to, g) {
  const d = hyp(to.x - from.x, to.z - from.z);
  const n = Math.max(1, Math.ceil(d / g.cell));
  const out = [];
  for (let i = 0; i <= n; i++) {
    const x = from.x + ((to.x - from.x) * i) / n, z = from.z + ((to.z - from.z) * i) / n;
    out.push({ x, y: (ground(Math.round(x), Math.round(z)) ?? from.y - 1) + 1, z });
  }
  return out;
}

/**
 * The way from the cave's mouth to the edge of the great chamber: down the way in, across the side chamber it comes
 * into (round its stalagmites), along the passage from there, stopping g.stopAt short of the statue's middle.
 * [{ x, y, z }], y the floor to stand on by the rules (the game's own floor is read as he goes).
 */
export function caveRoute(L, g) {
  const out = [];
  const way = L.tubes.find((t) => t.open);
  for (let s = 0; s <= way.len; s += 2) {
    const p = alongTube(way, s);
    out.push({ x: p.x, y: wayFloor(way, s), z: p.z });
  }
  const side = wayInSide(L);
  const ch = L.chambers[side];
  const pas = L.tubes[side - 1]; // passage i - 1 goes to side chamber i: its points run from the great chamber out
  const foot = out[out.length - 1];
  const end = alongTube(pas, pas.len);
  const endY = Math.round(pas.y1);
  // across the side chamber: straight, with a place to one side of each stalagmite in the way
  const cones = L.cones.filter((cn) => cn.up && cn.chamber === side);
  const dx = end.x - foot.x, dz = end.z - foot.z;
  const len = hyp(dx, dz) || 1;
  const ux = dx / len, uz = dz / len;
  const stops = [];
  for (const cn of cones) {
    const along = (cn.x - foot.x) * ux + (cn.z - foot.z) * uz;
    if (along <= 0 || along >= len) continue;
    const off = (cn.x - foot.x) * -uz + (cn.z - foot.z) * ux; // the stalagmite's side of the line
    if (Math.abs(off) >= cn.r + g.body) continue;
    const to = (off >= 0 ? -1 : 1) * (cn.r + g.body + 0.5) + off; // past it on the nearer side
    stops.push({ along, x: foot.x + ux * along - uz * to, z: foot.z + uz * along + ux * to });
  }
  stops.sort((a, b) => a.along - b.along);
  const yAt = (f) => Math.round(foot.y + (endY - foot.y) * f);
  let last = { x: foot.x, z: foot.z, along: 0 };
  for (const p of [...stops, { along: len, x: end.x, z: end.z }]) {
    const d = hyp(p.x - last.x, p.z - last.z);
    const n = Math.max(1, Math.ceil(d / 2));
    for (let i = 1; i <= n; i++) {
      const f = (last.along + ((p.along - last.along) * i) / n) / len;
      out.push({ x: last.x + ((p.x - last.x) * i) / n, y: yAt(f), z: last.z + ((p.z - last.z) * i) / n });
    }
    last = p;
  }
  // along the passage to the great chamber, as far as he goes
  const sx = L.statue.x + 0.5, sz = L.statue.z + 0.5;
  for (let s = pas.len - 2; s >= 0; s -= 2) {
    const p = alongTube(pas, s);
    if (hyp(p.x - sx, p.z - sz) < g.stopAt) break;
    out.push({ x: p.x, y: Math.round(pas.y0 + (pas.y1 - pas.y0) * (s / pas.len)), z: p.z });
  }
  return out;
}

/** The place on a way nearest `p` (level), looked for from index lo to hi: its index. */
export function nearestOn(route, p, lo, hi) {
  let best = Math.max(0, lo), bd = Infinity;
  for (let i = Math.max(0, lo); i <= Math.min(route.length - 1, hi); i++) {
    const d = hyp(route[i].x - p.x, route[i].z - p.z) + Math.abs(route[i].y - p.y) * 0.5;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
}

/**
 * His move this tick while he leads: at `at`, walking to route[idx] next, the player's feet at `leader`, `waiting`
 * whether he was standing for them. He stands and looks back when they are more than g.wait behind (until they are
 * within g.resume); he hurries when they are close behind him or have got ahead; otherwise he walks. Returns { pos,
 * yaw, walking, idx, waiting, done } (done: at the end of the way).
 */
export function leadStep(at, route, idx, leader, waiting, g) {
  const face = yawTo(leader.x - at.x, leader.z - at.z);
  if (idx >= route.length) return { pos: at, yaw: face, walking: false, idx, waiting: false, done: true };
  const dl = Math.hypot(leader.x - at.x, leader.y - at.y, leader.z - at.z);
  const li = nearestOn(route, leader, idx - g.window, idx + g.window);
  const ahead = li >= idx && dl < g.wait; // they have caught him up, or passed him, on the way itself
  if (!ahead && (dl > g.wait || (waiting && dl > g.resume))) return { pos: at, yaw: face, walking: false, idx, waiting: true, done: false };
  let left = ahead || dl < g.close ? g.hurry : g.walk;
  let pos = { x: at.x, y: at.y, z: at.z };
  let yaw = face;
  let i = idx;
  while (left > 1e-6 && i < route.length) {
    const p = route[i];
    const d = Math.hypot(p.x - pos.x, p.z - pos.z);
    if (d > 1e-3) yaw = yawTo(p.x - pos.x, p.z - pos.z);
    if (d <= left) {
      pos = { x: p.x, y: p.y, z: p.z };
      left -= d;
      i++;
    } else {
      const f = left / d;
      pos = { x: pos.x + (p.x - pos.x) * f, y: pos.y + (p.y - pos.y) * f, z: pos.z + (p.z - pos.z) * f };
      left = 0;
    }
  }
  return { pos, yaw, walking: true, idx: i, waiting: false, done: false };
}

/** A player this far over the great chamber's floor or less is in it (its floor rises some 10 toward its wall). */
export const IN_CHAMBER_UP = 24;

/** Whether a player stands in the great chamber (then he has shown them the way: he walks behind them again). */
export function inGreatChamber(L, p) {
  const m = L.chambers[0];
  // (by its floor, not its dome: the moon's land over the chamber is within its dome's height of the floor)
  return hyp(p.x - (m.x + 0.5), p.z - (m.z + 0.5)) <= m.r * 0.9 && p.y <= m.floor + IN_CHAMBER_UP && p.y >= m.floor - 4;
}
