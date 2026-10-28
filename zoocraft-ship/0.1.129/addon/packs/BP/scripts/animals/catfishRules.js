// Catfish (0.1.129, module 6b part 5; research/trench_plan.md "0.1.129", trench_facts.md §7), pure: a school of the river
// bottom (species.bottomFeeder). Every so often one glides down to the floor and creeps along it nose down, sweeping its
// whiskers side to side over the ground, tasting with them as it goes (trench_facts.md §7; animals/catfish.js steers it
// down and along). Every rule here is by the species' flags, never by name.

// What a catfish is doing (its zoocraft:act entity property): the client plays the matching animation.
export const ACT = {
  swim: 0,
  forage: 1, // down on the floor, nose down, whiskers sweeping
};

const WATER = new Set(["water", "seagrass"]);

// The floor under a fish: from (x, y, z) down through the water to the first block that isn't water (seagrass and kelp
// grow in the water, so they count as water); the y of the lowest water block, where its belly is on the floor, or
// undefined when that block is air or unloaded or the floor is more than `depth` down.
export function floorUnder(read, x, y, z, depth) {
  if (!WATER.has(read(x, y, z))) return undefined;
  for (let d = 1; d <= depth; d++) {
    const c = read(x, y - d, z);
    if (WATER.has(c)) continue;
    return c === "air" || c === "unloaded" || c === "lava" ? undefined : y - d + 1;
  }
  return undefined;
}

// One creeping step along the floor: `pace` blocks along `heading` (radians, 0 toward +z), the heading swinging by up to
// `swing` radians a step (`rnd` in [0, 1)).
export function creepStep(pos, heading, pace, swing, rnd) {
  const h = heading + (rnd * 2 - 1) * swing;
  return { pos: { x: pos.x + Math.sin(h) * pace, y: pos.y, z: pos.z + Math.cos(h) * pace }, heading: h };
}

// Whether a creeping catfish can go on to `next` (the same floor, at most a block up or down from `y`): the y of the
// floor there, or undefined when a wall, a drop or the edge of the water is in the way.
export function floorAhead(read, next, y) {
  const x = Math.floor(next.x);
  const z = Math.floor(next.z);
  for (const dy of [0, 1, -1]) {
    const f = floorUnder(read, x, y + dy, z, 1);
    if (f !== undefined && Math.abs(f - y) <= 1) return f;
  }
  return undefined;
}
