// Endermen in the zoo (0.1.209; research/vanilla_plan.md "0.1.209 the enderman and the shulker: the design"; the script is
// animals/ender.js). The game's enderman teleports at random every so often (its minecraft:teleport: up to 30 s apart,
// anywhere within 32 blocks), which would take a copy out of its pen, so the zoo copy has no teleport component and blinks
// by script instead: 20 to 45 s apart, to a spot of its own pen's last measure 3 to 10 blocks off, 3 up or down at most,
// where its body fits (2.9 tall: three open blocks over solid ground). Never while a player close by holds a Mob Cage or
// its Chorus Browse (to catch or feed it), and never the calmed one in the wild (it is led to its pen).

export const ENDER = {
  blinkTicks: [400, 900], // 20 to 45 s between blinks
  minDist: 3, // blocks across: a blink goes at least this far
  maxDist: 10, // and at most this far
  maxRise: 3, // and at most this far up or down
  tries: 16,
  body: 3, // open blocks its body needs (2.9 tall)
  holdDist: 6, // blocks: no blink while a player this close holds a Mob Cage or Chorus Browse
};

// When the next blink is due, from `now` (ticks).
/** @param {number} now @param {() => number} [random] */
export function nextBlink(now, random = Math.random) {
  const [lo, hi] = ENDER.blinkTicks;
  return now + lo + Math.floor(random() * (hi - lo + 1));
}

const lists = new WeakMap(); // a measure's cells Map -> its land cells as [{x, y, z}]
/** @param {Map<string, string>} cells */
function landOf(cells) {
  let list = lists.get(cells);
  if (!list) {
    list = [];
    for (const [k, kind] of cells) {
      if (kind !== "land") continue;
      const [x, y, z] = k.split(",").map(Number);
      list.push({ x, y, z });
    }
    lists.set(cells, list);
  }
  return list;
}

// Where a zoo enderman blinks to from `at` (its block): a random land cell of its pen's last measure (`cells`: "x,y,z" ->
// kind; the cell it stands in) within the distances above that `fits` (its body's room, read on the spot); undefined
// when none turns up in `tries` picks. Only cells of that measure are ever returned, so a blink can't leave the pen.
/**
 * @param {Map<string, string>} cells @param {{ x: number, y: number, z: number }} at
 * @param {(c: { x: number, y: number, z: number }) => boolean} fits @param {() => number} [random]
 */
export function blinkSpot(cells, at, fits, random = Math.random) {
  const land = landOf(cells);
  if (!land.length) return undefined;
  for (let i = 0; i < ENDER.tries; i++) {
    const c = land[Math.floor(random() * land.length)];
    const across = Math.hypot(c.x - at.x, c.z - at.z);
    if (across < ENDER.minDist || across > ENDER.maxDist || Math.abs(c.y - at.y) > ENDER.maxRise) continue;
    if (fits(c)) return { x: c.x, y: c.y, z: c.z };
  }
  return undefined;
}

// Room for its body: `kinds` are the blocks from the landing cell up ("air", "passable", "solid", "liquid", or undefined
// unloaded), `below` the block under it. Every one of the body's blocks open (no water: the game's hates it) and solid
// ground under it.
/** @param {(string | undefined)[]} kinds @param {string | undefined} below */
export function roomFor(kinds, below) {
  return kinds.length >= ENDER.body && kinds.slice(0, ENDER.body).every((k) => k === "air" || k === "passable") && below === "solid";
}
