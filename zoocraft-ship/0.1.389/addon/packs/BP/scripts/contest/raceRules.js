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

// 0.1.388 (Austin, 26 Nov: "The arena just feels like a bunch of junk thrown onto the ground. I want things to flow
// together more, and I want some taller pillars out there as well. Make it a lot better."): the course is one run,
// the Rabbit Run, the same on the west and the east side of the field, every part leading on to the next:
//   Carrot Top (the stepped hill in the middle) -> the stone steps north -> the high beam -> the corner tower ->
//   the three spires (10, 11 and 12 blocks, the tallest things in the stadium) -> back over the tower -> the hops
//   south -> the landing -> the grand stairs down to the start. Hay hurdles cross the open ground on each side.
// With the One with the Rabbits potion (jumps of three blocks) there is a short way up beside each tower: 3, 6, 9, 12.
// Every piece has a white body and a coloured top: orange for stairs and towers, pink for hops and spires.

/** A piece `h` blocks high: a white body under a top of `top`. */
function piece(x1, z1, x2, z2, h, top) {
  return h > 1 ? [box(x1, 0, z1, x2, h - 2, z2, WHITE), box(x1, h - 1, z1, x2, h - 1, z2, top)] : [box(x1, 0, z1, x2, 0, z2, top)];
}

/** The west half of the run (the east half is its mirror image). */
function westRun() {
  const out = [];
  // the grand stairs: from beside the start lane up to the south-west landing, a step every two blocks
  for (let i = 0; i < 4; i++) out.push(...piece(-7 - i * 2, 10, -6 - i * 2, 11, i + 1, ORANGE));
  out.push(...piece(-17, 9, -14, 12, 5, ORANGE)); // the landing
  // the hops north: three stones, each a block higher, two blocks of air between
  out.push(...piece(-16, 5, -15, 6, 6, PINK), ...piece(-16, 1, -15, 2, 7, PINK), ...piece(-16, -3, -15, -2, 8, PINK));
  // the corner tower, and the three spires round the corner beyond it
  out.push(...piece(-17, -9, -14, -6, 9, ORANGE));
  out.push(...piece(-21, -8, -20, -7, 10, PINK), ...piece(-21, -12, -20, -11, 11, PINK), ...piece(-17, -13, -16, -12, 12, PINK));
  // 0.1.389 (Austin, 26 Nov: "the player cannot get to them with the rabbits potion, they can only jump 3 at a time,
  // fix that to add pillars closer that are shorter so they can go from 3 to 6 to 9 to 12"): the potion steps, each
  // touching the next: 3, then 6, then the tower (9), then the tallest spire (12), which now reaches the tower
  out.push(...piece(-11, -7, -10, -6, 3, PINK), ...piece(-13, -7, -12, -6, 6, PINK), ...piece(-17, -11, -16, -10, 12, PINK));
  // the high beam east from the tower, one block wide, and the stone steps down from it to Carrot Top
  out.push(box(-13, 8, -8, -9, 8, -8, PLANKS));
  out.push(...piece(-8, -8, -7, -7, 9, ORANGE), ...piece(-8, -6, -7, -5, 8, PINK), ...piece(-8, -4, -7, -3, 7, PINK), ...piece(-6, -3, -5, -2, 6, PINK), ...piece(-4, -2, -3, -1, 5, PINK));
  // the hurdles: three rows of hay across the open ground
  for (const x of [-12, -10, -8]) out.push(box(x, 0, 2, x, 0, 7, HAY));
  return out;
}

/** The parkour course: boxes on the field (offsets from the stadium's origin; the field's grass is at y -1). */
export function courseBoxes() {
  const out = [];
  // Carrot Top: the stepped hill in the middle, orange and white like a carrot's rings, four high
  for (let s = 0; s < 4; s++) out.push(box(-4 + s, s, -3 + s, 4 - s, s, 5 - s, s % 2 ? WHITE : ORANGE));
  const west = westRun();
  out.push(...west, ...west.map((b) => box(-b.a[0], b.a[1], b.a[2], -b.b[0], b.b[1], b.b[2], b.id)));
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
  { x: -10, y: 0, z: 0, where: "on the grass north of the west hurdles" },
  { x: -15, y: 5, z: 10, where: "on the south-west landing, up the grand stairs" },
  { x: -15, y: 9, z: -7, where: "on the north-west tower, up the hops" },
  { x: -17, y: 12, z: -13, where: "on the tallest spire, north-west" },
  { x: -11, y: 9, z: -8, where: "in the middle of the west beam" },
  { x: 11, y: 9, z: -8, where: "in the middle of the east beam" },
  { x: 17, y: 12, z: -13, where: "on the tallest spire, north-east" },
  { x: 15, y: 5, z: 10, where: "on the south-east landing, down the hops" },
  { x: 10, y: 0, z: 0, where: "on the grass north of the east hurdles" },
  { x: 0, y: 4, z: 1, where: "on Carrot Top, in the very middle of the field" },
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
