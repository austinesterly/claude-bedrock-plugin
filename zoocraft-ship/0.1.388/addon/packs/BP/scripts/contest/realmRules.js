// The contest realm (0.1.381, Carrot's character pass; Austin, 25 Nov: "at level 100, shes got it! The rabbites gave
// her some blocks that can make a portal to the contest realm. She gives you the blocks (bunny blocks, they look like
// bunny fur) if you make them into a 4X5 or bigger, it will open your way to the contest realm. just light the inside
// and youre in. Whats inside, a stadium with a jumbotron, and a bunch of people in rabbit costumes watching, this is a
// secret society, you have to talk to the main guy with a crown and give him your ticket to enter the contest").
// A frame of Bunny Blocks is built and lit like a Nether portal's (fishing/portalRules.js finds it). The stadium is one
// fixed building in its own empty dimension, described here as boxes to fill; contest/realm.js builds it once.
// No engine calls here.
import { courseBoxes } from "./raceRules.js";

export const CONTEST = "zoocraft:contest";
export const BUNNY_BLOCK = "zoocraft:bunny_block";
export const CONTEST_PORTAL = "zoocraft:contest_portal";
export const CONTEST_FRAME = new Set([BUNNY_BLOCK]);
export const RABBIT_PERSON = "zoocraft:rabbit_person";
export const LIGHTERS = new Set(["minecraft:flint_and_steel", "minecraft:fire_charge"]);
export const CONTEST_BACK = "zoocraft:contest_back";
/** The stadium's plan: raise it when the boxes change, and worlds that have the old one get the new one built over it. */
export const STADIUM_V = 4; // 2: the parkour course on the field (0.1.382); 3: far more of it (0.1.385)
export const FURS = 6; // rabbit costumes: 0 gray, 1 white, 2 brown, 3 black, 4 cream, 5 pink
export const KING_FUR = 1;

/** The field: where the games are played. Standing height y0; x and z from its middle. */
export const FIELD = { halfX: 24, halfZ: 16 };
export const TIERS = 6;

const box = (x1, y1, z1, x2, y2, z2, id) => ({ a: [Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2)], b: [Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2)], id });

// The four sides of a rectangle `hx` by `hz` out from the middle, from y1 to y2.
function ring(hx, hz, y1, y2, id) {
  return [box(-hx, y1, -hz, hx, y2, -hz, id), box(-hx, y1, hz, hx, y2, hz, id), box(-hx, y1, -hz + 1, -hx, y2, hz - 1, id), box(hx, y1, -hz + 1, hx, y2, hz - 1, id)];
}

/** The jumbotron's picture: 21 by 11, top row first. "." dark, "w" lit white, "p" pink, "y" lit yellow. */
export const SCREEN_FACE = [
  ".....ww.....ww.......",
  ".....wpw...wpw.......",
  ".....wpw...wpw.......",
  ".....wpw...wpw.......",
  "....wwwwwwwwwww......",
  "....ww.wwwww.ww......",
  "....wwwwwpwwwww......",
  "....wwww.w.wwww......",
  ".....wwwwwwwww.......",
  "......wwwwwww........",
  ".....................",
];
const SCREEN_BLOCKS = { ".": "minecraft:black_concrete", w: "minecraft:sea_lantern", p: "minecraft:pink_concrete", y: "minecraft:glowstone" };
export const SCREEN = { width: 21, height: 11, left: -10, top: 21, z: -25 };

/** The boxes that draw a picture on the jumbotron (rows as SCREEN_FACE), runs of one block merged. Offsets from the origin. */
export function screenBoxes(rows) {
  const out = [];
  for (let r = 0; r < SCREEN.height; r++) {
    const row = (rows[r] ?? "").padEnd(SCREEN.width, ".");
    let c = 0;
    while (c < SCREEN.width) {
      let e = c;
      while (e + 1 < SCREEN.width && row[e + 1] === row[c]) e++;
      out.push(box(SCREEN.left + c, SCREEN.top - r, SCREEN.z, SCREEN.left + e, SCREEN.top - r, SCREEN.z, SCREEN_BLOCKS[row[c]] ?? SCREEN_BLOCKS["."]));
      c = e + 1;
    }
  }
  return out;
}

/** Where things are, as offsets from the origin (feet positions; the field's floor is at y -1). */
export const SPOTS = {
  arrive: { x: 0.5, y: 0, z: 11.5, ry: 180 }, // facing north, the king ahead
  king: { x: 0.5, y: 1, z: -13.5, ry: 0 },
  podium: { x: 0.5, y: 2, z: -8.5 },
  // the way back: a frame in the plane z = 14, its inside two wide and three tall
  portal: { axis: "x", z: 14, inside: [-1, 0], y: [0, 2] },
};

/** The way back's frame and inside cells (offsets). */
export function returnPortal() {
  const p = SPOTS.portal;
  const frame = [];
  const inside = [];
  for (let x = p.inside[0] - 1; x <= p.inside[1] + 1; x++) {
    for (let y = p.y[0] - 1; y <= p.y[1] + 1; y++) {
      const isIn = x >= p.inside[0] && x <= p.inside[1] && y >= p.y[0] && y <= p.y[1];
      (isIn ? inside : frame).push({ x, y, z: p.z });
    }
  }
  return { axis: p.axis, frame, inside };
}

/** The whole stadium as boxes to fill, in order (later ones overwrite earlier ones). Offsets from the origin. */
export function stadiumBoxes() {
  const { halfX: fx, halfZ: fz } = FIELD;
  const out = [];
  const ox = fx + 2 + TIERS + 1; // the outer wall
  const oz = fz + 2 + TIERS + 1;
  // the ground under everything, and the open air over it (an old stadium is cleared away), a half at a time
  out.push(box(-ox, 0, -oz, -1, TIERS + 8, oz, "minecraft:air"));
  out.push(box(0, 0, -oz, ox, TIERS + 8, oz, "minecraft:air"));
  out.push(box(-ox, -3, -oz, ox, -2, oz, "minecraft:smooth_stone"));
  out.push(box(-ox, -1, -oz, ox, -1, oz, "minecraft:quartz_block"));
  // the field: grass, a white line round it, a low wall of bunny fur
  out.push(box(-fx, -1, -fz, fx, -1, fz, "minecraft:grass_block"));
  out.push(...ring(fx, fz, -1, -1, "minecraft:white_concrete"));
  out.push(box(0, -1, -fz, 0, -1, fz, "minecraft:white_concrete"));
  out.push(...ring(fx + 1, fz + 1, 0, 0, BUNNY_BLOCK));
  // lights in the floor at the corners and the middles
  for (const [x, z] of [[-fx, -fz], [fx, -fz], [-fx, fz], [fx, fz], [0, -fz], [0, fz], [-fx, 0], [fx, 0]]) out.push(box(x, -1, z, x, -1, z, "minecraft:sea_lantern"));
  // the stands: each row a block higher and a block further out, pink and white by turns
  for (let t = 0; t < TIERS; t++) out.push(...ring(fx + 2 + t, fz + 2 + t, 0, t, t % 2 ? "minecraft:pink_concrete" : "minecraft:quartz_block"));
  out.push(...ring(ox, oz, 0, TIERS + 2, "minecraft:white_concrete"));
  out.push(...ring(ox, oz, TIERS + 3, TIERS + 3, BUNNY_BLOCK));
  // the king's dais at the north end, a red carpet up to it
  out.push(box(-3, 0, -fz + 1, 3, 0, -fz + 4, "minecraft:gold_block"));
  out.push(box(-2, 0, -fz + 1, 2, 0, -fz + 3, "minecraft:quartz_block"));
  out.push(box(-1, 1, -fz + 2, 1, 1, -fz + 3, "minecraft:red_carpet"));
  out.push(box(0, 0, -fz + 5, 0, 0, -fz + 6, "minecraft:red_carpet"));
  // the winners' podium in front of it: second, first, third
  out.push(box(-2, 0, -9, -1, 0, -8, "minecraft:quartz_block"));
  out.push(box(0, 0, -9, 0, 1, -8, "minecraft:gold_block"));
  out.push(box(1, 0, -9, 2, 0, -8, "minecraft:quartz_block"));
  // the jumbotron over the north stand: two legs, a dark frame, the screen
  for (const x of [-9, 9]) out.push(box(x, TIERS, SCREEN.z, x, SCREEN.top - SCREEN.height, SCREEN.z, "minecraft:quartz_block"));
  out.push(box(SCREEN.left - 1, SCREEN.top - SCREEN.height, SCREEN.z - 1, SCREEN.left + SCREEN.width, SCREEN.top + 1, SCREEN.z - 1, "minecraft:black_concrete"));
  out.push(box(SCREEN.left - 1, SCREEN.top - SCREEN.height, SCREEN.z, SCREEN.left + SCREEN.width, SCREEN.top + 1, SCREEN.z, "minecraft:iron_block"));
  out.push(...screenBoxes(SCREEN_FACE));
  out.push(...courseBoxes()); // 0.1.382: the parkour course
  return out;
}

/** The crowd's seats (feet positions and the way they face), offsets: on the long sides' second and fourth rows. */
export function crowdSeats() {
  const { halfX: fx, halfZ: fz } = FIELD;
  const out = [];
  for (const side of [-1, 1]) {
    for (const t of [1, 3]) {
      for (let i = 0; i < 8; i++) {
        const x = -fx + 3 + i * 6 + (t === 3 ? 3 : 0);
        if (Math.abs(x) > fx) continue;
        out.push({ x: x + 0.5, y: t + 1, z: side * (fz + 2 + t) + 0.5, ry: side > 0 ? 180 : 0, fur: (i * 5 + t + (side > 0 ? 3 : 0)) % FURS });
      }
    }
  }
  return out;
}

/** The area the stadium covers (offsets), for loading it. */
export function stadiumArea() {
  const ox = FIELD.halfX + 2 + TIERS + 1;
  const oz = FIELD.halfZ + 2 + TIERS + 1;
  return { from: { x: -ox, z: -oz - 2 }, to: { x: ox, z: oz } }; // the jumbotron stands just behind the north wall
}

/** Whether Carrot has remembered the way for this player: she has handed over the Bunny Blocks. */
export const wayKnown = (bond) => bond?.rewards?.[BUNNY_BLOCK] !== undefined;

/** What the king says to a player who cannot enter: `ticket` whether they carry one (with one, contest/raceRules.js). */
export function kingLine(ticket) {
  return ticket ? "kingEnter" : "kingNoTicket";
}
