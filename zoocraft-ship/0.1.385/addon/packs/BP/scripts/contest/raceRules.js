// Stage 1 of the rabbits' contest: the parkour race (0.1.382, Carrot's character pass; Austin, 25 Nov: "you have to
// talk to the main guy with a crown and give him your ticket to enter the contest, the contest has 3 stages, parkour
// race is stage 1, you have to get within a certain time to qualify for stage 2. During stage 1, a random
// waypoint/flag pops up on your screen, you have to get to it and touch it as fast as you can, there will be 10
// different waypoints, keep the same pattern every contest. If at any point you lose a stage, you are removed from the
// contest, and cannot rejoin without another ticket, to get another ticket, you have to always go back through
// carrot."). The course stands on the stadium's field for good; the flags come up one at a time, always in the same
// order. Nothing is put on the screen (no titles): a flag is a pole with an orange flag and a column of sparkles, and
// chat says where it is. No engine calls here.

const box = (x1, y1, z1, x2, y2, z2, id) => ({ a: [Math.min(x1, x2), Math.min(y1, y2), Math.min(z1, z2)], b: [Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2)], id });

const ORANGE = "minecraft:orange_concrete";
const WHITE = "minecraft:white_concrete";
const HAY = "minecraft:hay_block";
const PLANKS = "minecraft:oak_planks";
const PINK = "minecraft:pink_concrete";

// A stepped pyramid: `steps` layers, the lowest `hx` by `hz` out from its middle.
function pyramid(cx, cz, hx, hz, steps) {
  const out = [];
  for (let s = 0; s < steps; s++) out.push(box(cx - hx + s, s, cz - hz + s, cx + hx - s, s, cz + hz - s, s % 2 ? WHITE : ORANGE));
  return out;
}

/** The parkour course: boxes on the field (offsets from the stadium's origin; the field's grass is at y -1). */
export function courseBoxes() {
  const out = [];
  // the west hill and the east hill: stepped, three high
  out.push(...pyramid(-20, -12, 3, 2, 3));
  out.push(...pyramid(20, 12, 3, 2, 3));
  // the pillars: five, each a block higher than the last, a block apart
  for (let i = 0; i < 5; i++) out.push(box(6 + i * 3, 0, -4, 7 + i * 3, i, -3, i % 2 ? WHITE : ORANGE));
  // the hurdles: three low walls of hay
  for (const x of [-12, -9, -6]) out.push(box(x, 0, -6, x, 0, 0, HAY));
  // the bridge: steps up, two towers, a beam one block wide between them
  out.push(box(-23, 0, 6, -23, 0, 7, PLANKS));
  out.push(box(-22, 0, 6, -22, 1, 7, PLANKS));
  out.push(box(-21, 0, 6, -20, 2, 7, PLANKS));
  out.push(box(-19, 2, 6, -13, 2, 6, PLANKS));
  out.push(box(-12, 0, 6, -11, 2, 7, PLANKS));
  out.push(box(-10, 0, 6, -10, 1, 7, PLANKS));
  out.push(box(-9, 0, 6, -9, 0, 7, PLANKS));
  // the north-east platform: two high, a step on its west side
  out.push(box(14, 0, -13, 17, 1, -10, WHITE));
  out.push(box(13, 0, -13, 13, 0, -10, ORANGE));
  // 0.1.385 (Austin, 25 Nov: "The stadium needs way more parkour, and way more obstables, it feels very open"):
  // the stair tower and its far pillar, north-west
  out.push(box(-14, 0, -13, -14, 0, -12, PINK), box(-13, 0, -13, -13, 1, -12, WHITE), box(-12, 0, -13, -11, 2, -12, PINK), box(-8, 0, -13, -7, 2, -12, WHITE));
  // the wall to run along, north-east of the king
  out.push(box(5, 0, -12, 5, 0, -12, PINK), box(6, 0, -13, 6, 1, -12, WHITE), box(7, 0, -13, 11, 2, -13, PINK));
  // the tables, west of the middle
  out.push(box(-5, 0, 2, -3, 0, 4, PINK), box(-4, 1, 3, -4, 1, 3, WHITE));
  // the stepping stones, east of the middle
  out.push(box(3, 0, 3, 3, 0, 3, WHITE), box(5, 0, 5, 5, 1, 5, PINK), box(7, 0, 3, 7, 1, 3, WHITE), box(9, 0, 5, 9, 0, 5, PINK));
  // two more rows of hay hurdles and a wall, east
  out.push(box(14, 0, 1, 20, 0, 1, HAY), box(14, 0, 4, 20, 0, 4, HAY), box(12, 0, 6, 12, 1, 9, WHITE));
  // the east bridge: steps, a tower, a beam one block wide, a tower
  out.push(box(20, 0, -9, 20, 0, -8, PLANKS), box(21, 0, -9, 21, 1, -8, PLANKS), box(22, 0, -9, 22, 2, -8, PLANKS), box(22, 2, -7, 22, 2, -1, PLANKS), box(21, 0, 0, 22, 2, 0, PLANKS));
  // the crates, south-west
  out.push(box(-16, 0, 10, -15, 1, 11, PLANKS), box(-13, 0, 12, -12, 0, 13, HAY), box(-10, 0, 10, -9, 2, 11, PLANKS), box(-18, 0, 13, -17, 0, 14, HAY));
  // the low maze, south-east
  out.push(box(5, 0, 11, 5, 1, 14, WHITE), box(7, 0, 10, 11, 1, 10, PINK), box(13, 0, 12, 13, 1, 15, WHITE), box(9, 0, 13, 11, 0, 13, PINK));
  // pillars of three heights, west
  out.push(box(-20, 0, -4, -19, 1, -3, ORANGE), box(-17, 0, -1, -16, 2, 0, WHITE), box(-21, 0, 1, -20, 0, 2, ORANGE));
  // steps toward the pillars, north of the middle
  out.push(box(6, 0, -9, 7, 0, -8, ORANGE), box(9, 0, -8, 10, 1, -7, WHITE), box(-4, 0, -4, -3, 1, -3, ORANGE), box(2, 0, -4, 3, 0, -3, WHITE));
  // blocks to hop, south of the middle
  out.push(box(-7, 0, 8, -6, 1, 9, PINK), box(-6, 0, 12, -5, 0, 13, ORANGE));
  out.push(...forest(out));
  return out;
}

// The open grass between the set pieces, filled with a forest of 2 by 2 pillars one to three blocks high, two blocks
// apart, always the same. Kept clear: the lane to the king, the start line and the way home, and round every flag.
function forest(set) {
  const taken = new Set();
  for (const b of set) for (let x = b.a[0] - 1; x <= b.b[0] + 1; x++) for (let z = b.a[2] - 1; z <= b.b[2] + 1; z++) taken.add(`${x},${z}`);
  const clear = (x, z) => (Math.abs(x) <= 5 && (z <= -6 || z >= 7)) || FLAGS.some((f) => Math.abs(f.x - x) <= 2 && Math.abs(f.z - z) <= 2);
  const out = [];
  let n = 0;
  for (let z = -15; z <= 14; z++) {
    for (let x = -23; x <= 22; x++) {
      let free = true;
      for (let i = 0; i < 2 && free; i++) for (let j = 0; j < 2 && free; j++) if (taken.has(`${x + i},${z + j}`) || clear(x + i, z + j)) free = false;
      if (!free) continue;
      const h = 1 + (n * 7 + (n >> 2) * 3) % 4;
      out.push(box(x, 0, z, x + 1, h - 1, z + 1, [ORANGE, WHITE, PINK, WHITE][h - 1]));
      for (let i = -2; i <= 3; i++) for (let j = -2; j <= 3; j++) taken.add(`${x + i},${z + j}`); // two blocks of grass between pillars
      n++;
    }
  }
  return out;
}

/** How high the course stands over each cell of the field: "x,z" -> blocks (the grass is 0). */
export function courseHeights() {
  const out = new Map();
  for (const b of courseBoxes()) {
    for (let x = b.a[0]; x <= b.b[0]; x++) for (let z = b.a[2]; z <= b.b[2]; z++) out.set(`${x},${z}`, Math.max(out.get(`${x},${z}`) ?? 0, b.b[1] + 1));
  }
  return out;
}

/** The ten flags, in the order they come up, every contest the same. Feet positions (offsets); `where` is for chat. */
export const FLAGS = [
  { x: -20, y: 3, z: -12, where: "on top of the west hill, north-west" },
  { x: 10, y: 0, z: 8, where: "on the grass, south-east" },
  { x: 18, y: 5, z: -4, where: "on the tallest pillar, east" },
  { x: -16, y: 3, z: 6, where: "in the middle of the bridge, south-west" },
  { x: 15, y: 2, z: -12, where: "on the platform, north-east" },
  { x: -10, y: 0, z: -3, where: "between the hay hurdles, west" },
  { x: 20, y: 3, z: 12, where: "on top of the east hill, south-east" },
  { x: -21, y: 0, z: 13, where: "in the south-west corner" },
  { x: 12, y: 3, z: -4, where: "on the middle pillar, east" },
  { x: 0, y: 0, z: 0, where: "in the very middle of the field" },
];

export const FLAG_POLE = "minecraft:oak_fence";
export const FLAG_CLOTH = "minecraft:orange_wool";
/** The cells a flag takes up (offsets from its feet cell): a pole three high, the cloth on top and beside it. */
export const flagCells = (f) => [
  { x: f.x, y: f.y, z: f.z, id: FLAG_POLE },
  { x: f.x, y: f.y + 1, z: f.z, id: FLAG_POLE },
  { x: f.x, y: f.y + 2, z: f.z, id: FLAG_POLE },
  { x: f.x, y: f.y + 3, z: f.z, id: FLAG_CLOTH },
  { x: f.x + 1, y: f.y + 3, z: f.z, id: FLAG_CLOTH },
];

/** Whether a player at `pos` (feet, offsets) touches the flag: `reach` blocks across, a little under to well over. */
export function touches(pos, f, reach) {
  const dx = pos.x - (f.x + 0.5);
  const dz = pos.z - (f.z + 0.5);
  const dy = pos.y - f.y;
  return dx * dx + dz * dz <= reach * reach && dy >= -1.5 && dy <= 4;
}

/** Seconds left of `seconds`, `ticks` after the horn (never under 0). */
export const secondsLeft = (ticks, seconds) => Math.max(0, Math.ceil(seconds - ticks / 20));

/**
 * One look at the race. `race` { i: the flag that is up, warned: seconds already called }, `ticks` since the horn,
 * `touching` whether the runner touches the flag now, `k` { seconds, warnAt }.
 * Returns { i, done: "won" | "lost" | undefined, touched, warn: a number of seconds to call out, or undefined }.
 */
export function raceStep(race, ticks, touching, k) {
  const left = secondsLeft(ticks, k.seconds);
  if (touching) {
    const i = race.i + 1;
    return { i, touched: true, done: i >= FLAGS.length ? "won" : undefined, warn: undefined, left };
  }
  if (ticks >= k.seconds * 20) return { i: race.i, touched: false, done: "lost", warn: undefined, left: 0 };
  const warn = k.warnAt.find((s) => left <= s && !race.warned.includes(s));
  return { i: race.i, touched: false, done: undefined, warn, left };
}

// The jumbotron's digits: 3 by 5, drawn twice the size.
const DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111"];

/** The jumbotron's picture for a count (0 to 99): 21 wide, 11 high, lit yellow on dark. */
export function countRows(n) {
  const text = String(Math.max(0, Math.min(99, Math.floor(n))));
  const width = text.length * 6 + (text.length - 1) * 2;
  const left = Math.floor((21 - width) / 2);
  const rows = [];
  for (let r = 0; r < 11; r++) {
    let row = ".".repeat(left);
    for (let d = 0; d < text.length; d++) {
      const bits = DIGITS[Number(text[d])];
      for (let c = 0; c < 3; c++) row += (r < 10 && bits[Math.floor(r / 2) * 3 + c] === "1" ? "yy" : "..");
      if (d < text.length - 1) row += "..";
    }
    rows.push(row.padEnd(21, "."));
  }
  return rows;
}

/** What the king has to say to someone who talks to him. */
export function kingSays({ ticket, racing, busy, next = undefined, owed = false }) {
  if (racing) return "kingRun";
  if (busy) return "kingBusy";
  if (owed) return "kingPodium"; // 0.1.384: the champion's prize waits at the podium
  if (next === 2) return "kingStage2"; // 0.1.383: qualified, and not yet started
  if (next === 3) return "kingStage3";
  return ticket ? "kingEnter" : "kingNoTicket";
}

/** Whether Carrot hands out another ticket: she gave one before, she knows the way, and they carry none now. */
export const anotherTicket = ({ hadTicket, wayKnown, carried, racing }) => hadTicket && wayKnown && carried === 0 && !racing;
