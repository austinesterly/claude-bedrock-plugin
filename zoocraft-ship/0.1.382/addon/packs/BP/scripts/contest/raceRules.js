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
export function kingSays({ ticket, racing, busy }) {
  if (racing) return "kingRun";
  if (busy) return "kingBusy";
  return ticket ? "kingEnter" : "kingNoTicket";
}

/** Whether Carrot hands out another ticket: she gave one before, she knows the way, and they carry none now. */
export const anotherTicket = ({ hadTicket, wayKnown, carried, racing }) => hadTicket && wayKnown && carried === 0 && !racing;
