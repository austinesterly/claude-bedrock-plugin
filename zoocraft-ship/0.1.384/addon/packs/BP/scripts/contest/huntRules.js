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
import { courseBoxes } from "./raceRules.js";

export const OTHERS = 19;
export const HUNT_TAG = "zc_hunt";
export const FUR_NAMES = ["gray", "white", "brown", "black", "cream", "pink"];
export const PRIZE_BOX = "minecraft:light_blue_shulker_box"; // the game's diamond-coloured shulker box
export const PRIZE_ITEM = "zoocraft:diamond_carrot";
export const PRIZE_STACKS = 27;
export const TROPHY = "zoocraft:rabbit_trophy";

/** How far out from the middle the others run (inside the field's white line, clear of the way home). */
export const RUN = { halfX: 22, halfZ: 13 };

const SOLID = new Set();
for (const b of courseBoxes()) if (b.a[1] === 0) for (let x = b.a[0]; x <= b.b[0]; x++) for (let z = b.a[2]; z <= b.b[2]; z++) SOLID.add(`${x},${z}`);
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
  for (const z of [-11, -6, -1, 4, 9, 12]) {
    for (const x of [-21, -15, -9, -3, 3, 9, 15, 21]) {
      if (out.length >= OTHERS) break;
      const s = { x: x + 0.5, z: z + 0.5 };
      if (blocked(s.x, s.z)) continue;
      if (Math.hypot(s.x - SPOTS.arrive.x, s.z - SPOTS.arrive.z) < 7) continue;
      out.push(s);
    }
  }
  return out;
}

const TURNS = [0, 35, -35, 70, -70, 110, -110, 160, -160].map((d) => (d * Math.PI) / 180);

/**
 * One step of `len` blocks from `pos` in the direction (dx, dz), turning aside round what is in the way.
 * Returns { x, z, yaw, moved }.
 */
export function stepToward(pos, dx, dz, len) {
  const n = Math.hypot(dx, dz);
  if (n < 1e-6) return { x: pos.x, z: pos.z, yaw: undefined, moved: false };
  const ux = dx / n;
  const uz = dz / n;
  for (const t of TURNS) {
    const c = Math.cos(t);
    const s = Math.sin(t);
    const vx = ux * c - uz * s;
    const vz = ux * s + uz * c;
    const x = pos.x + vx * len;
    const z = pos.z + vz * len;
    if (blocked(x, z) || blocked(pos.x + vx * (len + 0.4), pos.z + vz * (len + 0.4))) continue;
    return { x, z, yaw: (Math.atan2(-vx, vz) * 180) / Math.PI + 0, moved: true };
  }
  return { x: pos.x, z: pos.z, yaw: undefined, moved: false };
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
 * second, `every` ticks between looks. Returns { x, z, yaw, moved }.
 */
export function otherMove(me, index, hunter, prey, tick, k, every = 2) {
  if (!hunter) {
    // the hunter: after whoever is nearest
    let best;
    for (const p of prey) {
      const d = Math.hypot(p.x - me.x, p.z - me.z);
      if (!best || d < best.d) best = { p, d };
    }
    if (!best) return { x: me.x, z: me.z, yaw: undefined, moved: false };
    return stepToward(me, best.p.x - me.x, best.p.z - me.z, Math.min(best.d, (k.hunter * every) / 20));
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
  if (far < 1.5) return { x: me.x, z: me.z, yaw: undefined, moved: false };
  return stepToward(me, to.x - me.x, to.z - me.z, (k.runner * 0.5 * every) / 20);
}

/** Whether a hunter at `h` tags someone at `o` (feet positions; y only counts against the player, up on the course). */
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
