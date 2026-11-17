// The Void Portal's rules (0.1.316; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, friendship 70:
// "Portal dimensions: 25x25 blocks. Frame material: End Stone. Activation item: Ender Flame ... Enormous dark-purple
// portal ... A separate dimension of pure void. A small island at the portal's arrival point. The surrounding
// environment is otherwise empty void."). Pure, so the tests can run them; world/voidPortal.js is the game side.
//
// A frame is built like the Nether's, upright, of End Stone, the corners optional. "25x25" is read as the frame
// measured outside, as the Nether's "4 by 5" is (23 by 23 inside); a frame 25 by 25 inside is lit too, so neither
// reading of the number is refused. The island in the void is the same every time: End Stone, with the same great
// frame standing on it as the way back.

export const VOID = "zoocraft:void";
export const VOID_PORTAL = "zoocraft:void_portal";
export const VOID_AXIS = "zoocraft:axis";
export const VOID_FRAME = "minecraft:end_stone";
/** The player's way back: where they stood when they last went through into the void. */
export const VOID_BACK_KEY = "zoocraft:void_back";

const SIDES = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Whether an inside this wide and tall is the Void Portal's: square, one of k.sizes. */
export const sizeOk = (width, height, k) => width === height && k.sizes.includes(width);

/**
 * The portal an Ender Flame makes from `start` (an empty block), in the upright plane along `axis` ("x": the frame runs
 * along x; "z": along z), or undefined if that isn't the inside of a whole End Stone frame of the right size.
 * `get(x, y, z)` is the block's id, or undefined where the world isn't loaded. Returns { axis, cells, width, height, min }.
 */
export function findFrame(get, start, axis, k) {
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
      } else if (id !== VOID_FRAME) return undefined;
    }
  }
  const width = maxA - minA + 1;
  const height = maxY - minY + 1;
  if (!sizeOk(width, height, k) || seen.size !== width * height) return undefined;
  const cells = [...seen].map((s) => {
    const [a, y] = s.split(",").map(Number);
    return pos(a, y);
  });
  return { axis, cells, width, height, min: pos(minA, minY) };
}

/** The portal from `start`, trying the plane the player faces first (`look`: their view direction). */
export function lightFrame(get, start, look, k) {
  const first = Math.abs(look?.x ?? 0) > Math.abs(look?.z ?? 0) ? "z" : "x";
  return findFrame(get, start, first, k) ?? findFrame(get, start, first === "x" ? "z" : "x", k);
}

/**
 * Whether the portal blocks connected to `start` (all of one axis) still sit in a whole frame: each one's four
 * neighbours in its plane are portal or End Stone. Returns { cells, whole }.
 */
export function frameStillWhole(get, start, axis, k) {
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
      if (id === VOID_PORTAL) {
        if (!seen.has(`${a + da},${y + dy}`)) {
          seen.add(`${a + da},${y + dy}`);
          todo.push([a + da, y + dy]);
        }
      } else if (id !== VOID_FRAME) whole = false;
    }
  }
  return { cells, whole };
}

/**
 * An upright frame and its inside: `c` is the middle of its bottom row, `axis` the way it runs, `n` its inside
 * (23: 25 by 25 outside). Returns { frame, inside } as block positions.
 */
export function framePlan(c, axis, n = 23) {
  const half = (n + 1) / 2;
  const pos = (i, j) => (axis === "x" ? { x: c.x + i, y: c.y + j, z: c.z } : { x: c.x, y: c.y + j, z: c.z + i });
  const frame = [];
  const inside = [];
  for (let i = -half; i <= half; i++) {
    for (let j = 0; j <= n + 1; j++) {
      if (Math.abs(i) === half || j === 0 || j === n + 1) frame.push(pos(i, j));
      else inside.push(pos(i, j));
    }
  }
  return { frame, inside };
}

/** The island in the void: where it is, how far it reaches each way from its middle. */
export const ISLE = { x: 0, y: 64, z: 0, rx: 17, rz: 11 };

function h(x, z) {
  let v = (Math.imul(x, 374761393) + Math.imul(z, 668265263)) | 0;
  v = Math.imul(v ^ (v >>> 13), 1274126177);
  return (v ^ (v >>> 16)) >>> 0;
}

/**
 * The island, the same every time: an oval of End Stone, thickest in the middle, with the great frame standing across
 * it (its bottom row level with the ground) and the portal in it. Returns { ground, frame, inside, axis, arrive (where
 * a player comes out, in the portal), from, to (the columns it covers) }.
 */
export function islePlan(k = ISLE) {
  const ground = [];
  for (let x = -k.rx; x <= k.rx; x++) {
    for (let z = -k.rz; z <= k.rz; z++) {
      const r2 = (x / (k.rx + 0.5)) ** 2 + (z / (k.rz + 0.5)) ** 2;
      if (r2 >= 1) continue;
      const depth = 1 + Math.round(5 * (1 - r2)) + (h(x, z) % 2);
      for (let j = 0; j < depth; j++) ground.push({ x: k.x + x, y: k.y - j, z: k.z + z });
    }
  }
  const { frame, inside } = framePlan({ x: k.x, y: k.y, z: k.z }, "x");
  return { ground, frame, inside, axis: "x", arrive: { x: k.x + 0.5, y: k.y + 1, z: k.z + 0.5 }, from: { x: k.x - k.rx, z: k.z - k.rz }, to: { x: k.x + k.rx, z: k.z + k.rz } };
}
