// The sea portal's rules (0.1.272): what Jack's Flint and Steel lights, how long a player stands in it before going
// through, and where it leads. Austin, 12 Nov 18:01Z: "a modified flint and steel (ruby and saffron) lights a portal
// framed like a nether portal but of prismarine". Pure, so the tests can run them; fishing/portal.js is the game side.
//
// A frame is built like the Nether's: an upright rectangle of prismarine (plain, bricks or dark, mixed as you like),
// 2 to 21 blocks wide and 3 to 21 tall inside, the corners optional. The lighter on any frame block's face that
// looks into the empty middle fills it with portal. Standing in it 4 seconds (at once in creative) takes a player
// through; from the Overworld they come out in the fishing dimension at an eighth of the distance, as the Nether does,
// on the nearest island, by a portal built there to take them back.

export const PORTAL = "zoocraft:fishing_portal";
export const LIGHTER = "zoocraft:jacks_flint_and_steel";
export const AXIS = "zoocraft:axis";
export const FRAME = new Set(["minecraft:prismarine", "minecraft:prismarine_bricks", "minecraft:dark_prismarine"]);
/** The player's way back: where they stood when they last went through from outside the fishing dimension. */
export const BACK_KEY = "zoocraft:fishing_back";

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/**
 * The portal the lighter makes from `start` (an empty block), in the upright plane along `axis` ("x": the frame runs
 * along x; "z": along z), or undefined if that isn't the inside of a whole frame. `get(x, y, z)` is the block's id, or
 * undefined where the world isn't loaded. Returns { axis, cells, width, height }.
 */
export function findPortal(get, start, axis, k) {
  const open = (id) => id === "minecraft:air";
  if (!open(get(start.x, start.y, start.z))) return undefined;
  const a0 = axis === "x" ? start.x : start.z;
  const pos = (a, y) => (axis === "x" ? { x: a, y, z: start.z } : { x: start.x, y, z: a });
  const seen = new Set([`${a0},${start.y}`]);
  const todo = [[a0, start.y]];
  let minA = a0;
  let maxA = a0;
  let minY = start.y;
  let maxY = start.y;
  while (todo.length) {
    const [a, y] = /** @type {[number, number]} */ (todo.pop());
    minA = Math.min(minA, a);
    maxA = Math.max(maxA, a);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    if (maxA - minA + 1 > k.max || maxY - minY + 1 > k.max) return undefined;
    for (const [da, dy] of SIDES) {
      const na = a + da;
      const ny = y + dy;
      if (seen.has(`${na},${ny}`)) continue;
      const p = pos(na, ny);
      const id = get(p.x, p.y, p.z);
      if (id === undefined) return undefined;
      if (open(id)) {
        seen.add(`${na},${ny}`);
        todo.push([na, ny]);
      } else if (!FRAME.has(id)) return undefined;
    }
  }
  const width = maxA - minA + 1;
  const height = maxY - minY + 1;
  if (width < k.minWidth || height < k.minHeight || seen.size !== width * height) return undefined;
  const cells = [...seen].map((s) => {
    const [a, y] = s.split(",").map(Number);
    return pos(a, y);
  });
  return { axis, cells, width, height };
}

/** The portal from `start`, trying the plane the player faces first (`look`: their view direction). */
export function lightPortal(get, start, look, k) {
  const first = Math.abs(look?.x ?? 0) > Math.abs(look?.z ?? 0) ? "z" : "x";
  return findPortal(get, start, first, k) ?? findPortal(get, start, first === "x" ? "z" : "x", k);
}

/** Where a portal at x z in the Overworld leads in the fishing dimension: an eighth of the way, as the Nether. */
export function fishingSpot(x, z, k) {
  return { x: Math.floor(x / k.scale), z: Math.floor(z / k.scale) };
}

/**
 * One poll of a player against the portals: `st` is { t (ticks stood in one), held (they came out of one and haven't
 * stepped out yet) }. Returns the new state and whether they go through now.
 */
export function portalStep(st, inPortal, creative, dt, k) {
  if (!inPortal) return { st: { t: 0, held: false }, go: false };
  if (st?.held) return { st: { t: 0, held: true }, go: false };
  const t = (st?.t ?? 0) + dt;
  return { st: { t, held: false }, go: t >= (creative ? k.creativeTicks : k.ticks) };
}

/** The portal blocks to check when one at `p` (frame or portal) is broken: its six neighbours that are portal. */
export function neighbours(p) {
  return [
    { x: p.x + 1, y: p.y, z: p.z },
    { x: p.x - 1, y: p.y, z: p.z },
    { x: p.x, y: p.y + 1, z: p.z },
    { x: p.x, y: p.y - 1, z: p.z },
    { x: p.x, y: p.y, z: p.z + 1 },
    { x: p.x, y: p.y, z: p.z - 1 },
  ];
}

/**
 * Whether the portal blocks connected to `start` (all of one axis) still sit in a whole frame: each one's four
 * neighbours in its plane are portal or frame. Returns { cells, whole }; `get` as for findPortal.
 */
export function portalStillWhole(get, start, axis, k) {
  const pos = (a, y) => (axis === "x" ? { x: a, y, z: start.z } : { x: start.x, y, z: a });
  const a0 = axis === "x" ? start.x : start.z;
  const seen = new Set([`${a0},${start.y}`]);
  const todo = [[a0, start.y]];
  const cells = [];
  let whole = true;
  while (todo.length && seen.size <= k.max * k.max) {
    const [a, y] = /** @type {[number, number]} */ (todo.pop());
    cells.push(pos(a, y));
    for (const [da, dy] of SIDES) {
      const p = pos(a + da, y + dy);
      const id = get(p.x, p.y, p.z);
      if (id === PORTAL) {
        if (!seen.has(`${a + da},${y + dy}`)) {
          seen.add(`${a + da},${y + dy}`);
          todo.push([a + da, y + dy]);
        }
      } else if (!FRAME.has(id ?? "")) whole = false;
    }
  }
  return { cells, whole };
}

/** A way back as stored on the player, or undefined if it isn't one. */
export function readBack(text) {
  try {
    const b = JSON.parse(String(text));
    if (typeof b?.d !== "string" || ![b.x, b.y, b.z].every(Number.isFinite)) return undefined;
    return { d: b.d, x: b.x, y: b.y, z: b.z, ry: Number.isFinite(b.ry) ? b.ry : 0 };
  } catch {
    return undefined;
  }
}

/** A way back to store on the player (rounded, short). */
export function writeBack(d, loc, ry) {
  const r = (n) => Math.round(n * 100) / 100;
  return JSON.stringify({ d, x: r(loc.x), y: r(loc.y), z: r(loc.z), ry: Math.round(ry ?? 0) });
}
