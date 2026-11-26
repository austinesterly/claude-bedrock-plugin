// Stage 3 of the rabbits' contest: Rabbit Hunt (0.1.384, Carrot's character pass; Austin, 25 Nov: "Stage 3 is a game
// called \"Rabbit Hunt\" the player goes up against 19 other rabbbit people. When the horn blows, one random person is
// chosen as the hunter, the hunter has to tag other people while the other people have to avoid being tagged. If
// tagged, you lose. The player can also become the hunter, and will have to be at some point to win, a new hunter is
// selected every 15 seconds. If the player is the last one standing they win. Once the player wins, they are asked to
// go to the podium to claim their prize, the king gives the player a diamond coated shulker shell with 27 stacks of
// diamond carrots inside, they congratulate the player, and tell them, they are welcome back anytime!").
// The 19 others run on the grass of the field, round the course's obstacles; the player may use the obstacles.
// No engine calls here.
import { SPOTS } from "./realmRules.js";
import { courseHeights } from "./raceRules.js";

export const OTHERS = 19;
export const HUNT_TAG = "zc_hunt";
export const FUR_NAMES = ["gray", "white", "brown", "black", "cream", "pink"];
// 0.1.388 (Austin, 26 Nov: "Diamond plated shulker shell should look and behave just like a normal shulker shell,
// just with a diamond block textrue"): a real shulker box. The resource pack paints the light blue one as a diamond
// block and names it Diamond-Plated Shulker Box. (0.1.386's own block, zoocraft:diamond_shulker, still works where
// one was set down, but is no longer given.)
export const PRIZE_BOX = "minecraft:light_blue_shulker_box"; // the game's diamond-coloured shulker box
export const PRIZE_ITEM = "zoocraft:diamond_carrot";
export const PRIZE_STACKS = 27;
export const TROPHY = "zoocraft:rabbit_trophy";

/** How far out from the middle the others run (inside the field's white line, clear of the way home). */
export const RUN = { halfX: 22, halfZ: 13 };

// 0.1.385 (Austin, 25 Nov: "The NPCS in stage 3 also cannot climb anything so the playrer can easily win by stading on
// them. I added a jump to my zombies gamemode, we can do the same here"): the others hop up anything one block higher
// than where they stand, and a hunter leaps in an arc onto whatever its prey is standing on.
const HEIGHTS = courseHeights();
/** How high the course stands at a point of the field (0: grass). */
export const heightAt = (x, z) => HEIGHTS.get(`${Math.floor(x)},${Math.floor(z)}`) ?? 0;

const SOLID = new Set();
for (let x = -3; x <= 3; x++) for (let z = -15; z <= -12; z++) SOLID.add(`${x},${z}`); // the king's dais
for (let x = -2; x <= 2; x++) for (let z = -9; z <= -8; z++) SOLID.add(`${x},${z}`); // the podium

/** Whether the others cannot stand at this point of the field (offsets from the stadium's origin). */
export function blocked(x, z) {
  const cx = Math.floor(x);
  const cz = Math.floor(z);
  return Math.abs(x - 0.5) > RUN.halfX || Math.abs(z - 0.5) > RUN.halfZ || SOLID.has(`${cx},${cz}`);
}

/** Where the 19 others stand at the horn: spread over the field, none near the player's start line. */
export function startSpots() {
  const out = [];
  for (let z = -13; z <= 13 && out.length < OTHERS; z++) {
    for (let x = -22; x <= 22 && out.length < OTHERS; x++) {
      const s = { x: x + 0.5, z: z + 0.5 };
      if (blocked(s.x, s.z) || heightAt(s.x, s.z) !== 0) continue;
      if (Math.hypot(s.x - SPOTS.arrive.x, s.z - SPOTS.arrive.z) < 7) continue;
      if (out.some((o) => Math.hypot(o.x - s.x, o.z - s.z) < 6.5)) continue;
      out.push(s);
    }
  }
  return out;
}

const TURNS = [0, 35, -35, 70, -70, 110, -110, 160, -160].map((d) => (d * Math.PI) / 180);

/**
 * One step of `len` blocks from `pos` in the direction (dx, dz), turning aside round what is in the way: what cannot
 * be stood on, and anything more than a block higher than where it stands (a block up is hopped).
 * Returns { x, z, y, yaw, moved }.
 */
export function stepToward(pos, dx, dz, len) {
  const n = Math.hypot(dx, dz);
  const y0 = heightAt(pos.x, pos.z);
  if (n < 1e-6) return { x: pos.x, z: pos.z, y: y0, yaw: undefined, moved: false };
  const ux = dx / n;
  const uz = dz / n;
  for (const t of TURNS) {
    const c = Math.cos(t);
    const s = Math.sin(t);
    const vx = ux * c - uz * s;
    const vz = ux * s + uz * c;
    const x = pos.x + vx * len;
    const z = pos.z + vz * len;
    const ax = pos.x + vx * (len + 0.4);
    const az = pos.z + vz * (len + 0.4);
    if (blocked(x, z) || blocked(ax, az) || heightAt(x, z) - y0 > 1 || heightAt(ax, az) - y0 > 1) continue;
    return { x, z, y: heightAt(x, z), yaw: (Math.atan2(-vx, vz) * 180) / Math.PI + 0, moved: true };
  }
  return { x: pos.x, z: pos.z, y: y0, yaw: undefined, moved: false };
}

// 0.1.389: a hunter finds its way round the course (the stairs, the towers, the stone steps) instead of pushing
// against whatever stands between it and its prey: a search over the field's cells, a block up at a step, any drop.
let lastPath; // { key, next }: the search is the same while the hunter and its prey stay in their cells
/** The cell a walker at `pos` steps into next on its way to `target` (or as near as walking gets): { x, z } or undefined. */
export function nextCell(pos, target) {
  const sx = Math.floor(pos.x);
  const sz = Math.floor(pos.z);
  const tx = Math.floor(target.x);
  const tz = Math.floor(target.z);
  const key = `${sx},${sz},${tx},${tz}`;
  if (lastPath?.key === key) return lastPath.next;
  const id = (x, z) => (x + 32) * 64 + (z + 32);
  const from = new Map([[id(sx, sz), -1]]);
  const queue = [[sx, sz]];
  let best = { x: sx, z: sz, d: Math.hypot(sx - tx, sz - tz) };
  for (let q = 0; q < queue.length && best.d > 0; q++) {
    const [x, z] = queue[q];
    const y = heightAt(x, z);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx;
      const nz = z + dz;
      if (from.has(id(nx, nz)) || blocked(nx + 0.5, nz + 0.5) || heightAt(nx, nz) - y > 1) continue;
      if (dx && dz && (blocked(x + dx + 0.5, z + 0.5) || blocked(x + 0.5, z + dz + 0.5) || heightAt(x + dx, z) - y > 1 || heightAt(x, z + dz) - y > 1)) continue; // no cutting corners
      from.set(id(nx, nz), id(x, z));
      queue.push([nx, nz]);
      const d = Math.hypot(nx - tx, nz - tz);
      if (d < best.d) best = { x: nx, z: nz, d };
    }
  }
  let at = id(best.x, best.z);
  let next;
  while (from.get(at) !== -1) {
    next = at;
    at = from.get(at);
  }
  const out = next === undefined ? undefined : { x: Math.floor(next / 64) - 32, z: (next % 64) - 32 };
  lastPath = { key, next: out };
  return out;
}

/** One step of `len` blocks from `pos` toward `target` along the way round the course. Returns as stepToward does. */
export function pathToward(pos, target, len) {
  const next = nextCell(pos, target);
  const direct = stepToward(pos, target.x - pos.x, target.z - pos.z, len);
  if (!next) return direct;
  const m = stepToward(pos, next.x + 0.5 - pos.x, next.z + 0.5 - pos.z, len);
  return m.moved ? m : direct;
}

/**
 * A hunter's leap: where it lands when its prey stands two blocks or more above it, within `k.leapRange` blocks
 * across and `k.leapHigh` up: on what the prey stands on. Undefined when there is no leap to make.
 */
export function leapTo(me, prey, k) {
  const my = heightAt(me.x, me.z);
  const land = heightAt(prey.x, prey.z);
  if (land - my < 2 || land - my > k.leapHigh) return undefined;
  if (Math.abs((prey.y ?? land) - land) > 1.3) return undefined; // the prey is in the air, not standing there
  if (Math.hypot(prey.x - me.x, prey.z - me.z) > k.leapRange || blocked(prey.x, prey.z)) return undefined;
  return { x: prey.x, y: land, z: prey.z };
}

/** Where a leap is, `t` of the way through (0 to 1): a straight line across, an arc `peak` blocks over it. */
export function leapAt(from, to, t, peak = 1.5) {
  const u = Math.max(0, Math.min(1, t));
  return { x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u + 4 * peak * u * (1 - u), z: from.z + (to.z - from.z) * u };
}

// A point of the field that depends only on who asks and when: where a runner strolls to while no hunter is near.
function strollPoint(index, epoch) {
  const h = Math.abs(Math.sin(index * 12.9898 + epoch * 78.233) * 43758.5453) % 1;
  const g = Math.abs(Math.sin(index * 39.3468 + epoch * 11.135) * 24634.6345) % 1;
  return { x: (h * 2 - 1) * (RUN.halfX - 1) + 0.5, z: (g * 2 - 1) * (RUN.halfZ - 1) + 0.5 };
}

/**
 * Where one of the others goes next. `me` { x, z }, `index` its number, `hunter` { x, z } or undefined when it is the
 * hunter itself, `prey` the positions it may tag (when it hunts), `tick`, `k` { runner, hunter, flee } in blocks a
 * second, `every` ticks between looks. Returns { x, z, y, yaw, moved, leap: where a hunter leaps to, if it does }.
 */
export function otherMove(me, index, hunter, prey, tick, k, every = 2, mayLeap = true) {
  const here = heightAt(me.x, me.z);
  if (!hunter) {
    // the hunter: after whoever is nearest
    let best;
    for (const p of prey) {
      const d = Math.hypot(p.x - me.x, p.z - me.z);
      if (!best || d < best.d) best = { p, d };
    }
    if (!best) return { x: me.x, z: me.z, y: here, yaw: undefined, moved: false };
    const leap = mayLeap ? leapTo(me, best.p, k) : undefined;
    if (leap) return { x: me.x, z: me.z, y: here, yaw: (Math.atan2(-(leap.x - me.x), leap.z - me.z) * 180) / Math.PI + 0, moved: false, leap };
    return pathToward(me, best.p, Math.min(best.d, (k.hunter * every) / 20));
  }
  const d = Math.hypot(me.x - hunter.x, me.z - hunter.z);
  if (d < k.flee) {
    // away from the hunter, and in from the edges so as not to be cornered, a little to one side
    const ax = (me.x - hunter.x) / Math.max(d, 0.01);
    const az = (me.z - hunter.z) / Math.max(d, 0.01);
    const edge = Math.max(Math.abs(me.x - 0.5) / RUN.halfX, Math.abs(me.z - 0.5) / RUN.halfZ) ** 2 * 1.6;
    const side = index % 2 ? 0.35 : -0.35;
    return stepToward(me, ax - ((me.x - 0.5) / RUN.halfX) * edge - az * side, az - ((me.z - 0.5) / RUN.halfZ) * edge + ax * side, (k.runner * every) / 20);
  }
  const to = strollPoint(index, Math.floor((tick + index * 37) / 120));
  const far = Math.hypot(to.x - me.x, to.z - me.z);
  if (far < 1.5) return { x: me.x, z: me.z, y: here, yaw: undefined, moved: false };
  return stepToward(me, to.x - me.x, to.z - me.z, (k.runner * 0.5 * every) / 20);
}

/** Whether a hunter at `h` tags someone at `o` (feet positions, y their height over the grass). */
export function tags(h, o, reach) {
  return Math.hypot(h.x - o.x, h.z - o.z) <= reach && Math.abs((h.y ?? 0) - (o.y ?? 0)) <= 2.2;
}

/**
 * The next hunter: one of `standing` (keys: "player" or an other's number), at random, never the same one twice
 * running while anyone else stands.
 */
export function pickHunter(standing, current, random = Math.random) {
  const pool = standing.length > 1 ? standing.filter((s) => s !== current) : standing;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

/** What the king has to say to the champion who has not yet stood on the podium. */
export const atPodium = (pos) => Math.hypot(pos.x - SPOTS.podium.x, pos.z - SPOTS.podium.z) <= 1.3 && pos.y >= SPOTS.podium.y - 0.6;

/** Where the king's shulker box is set down: on the podium's step beside the gold one (a block cell, offsets). */
export const prizeSpot = () => ({ x: Math.floor(SPOTS.podium.x) + 1, y: SPOTS.podium.y - 1, z: Math.floor(SPOTS.podium.z) });
