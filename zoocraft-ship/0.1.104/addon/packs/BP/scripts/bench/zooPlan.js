// The test zoo (0.1.104, Austin: "can you make a zoocrsft build command with the aluminum fences and a 100 x 100 zoo
// so I can test easier"): the ring of Aluminum Fence that /zoocraft:build puts round the Park Deed's spot, as a plan
// of columns, and what the build says at the end. Pure: nothing from Minecraft, so the tests run it in plain Node.
// The exhibits inside it are laid out by bench/parkPlan.js planZoo.

export const ZOO_SIZE = { min: 10, max: 250, default: 100 }; // columns a side, the least the ring may be

const FACING = "minecraft:cardinal_direction";
const NORTH = { [FACING]: "north" };
const EAST = { [FACING]: "east" };

/** The ring's box: `size` columns a side, with the spot at its middle (just south-east of it when size is even). */
export function ringBox(center, size) {
  const half = Math.floor(size / 2);
  const min = { x: center.x - half, z: center.z - half };
  return { min, max: { x: min.x + size - 1, z: min.z + size - 1 } };
}

/**
 * Every column of the ring, west to east along the north side, then the east side, the south side and the west
 * side: { x, z, kind, block, states }. kind "fence" is an Aluminum Fence; "gate" an Aluminum Fence Gate in the middle
 * of the north, east and west sides (facing along the side, so it spans it); "entrance" the Park Entrance Gate's
 * threshold in the middle of the south side, facing north into the park; and "part" one of the four columns beside
 * it that the gate's own pillars, beam and walkway take (nothing is placed there). Nothing stands twice in a column.
 */
export function ringPlan(center, size) {
  const { min, max } = ringBox(center, size);
  const out = [];
  const seen = new Set();
  const add = (x, z, kind, block, states) => {
    const k = `${x},${z}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ x, z, kind, block, states });
  };
  const fence = (x, z) => add(x, z, "fence", "zoocraft:aluminum_fence", undefined);
  const gate = (x, z, states) => add(x, z, "gate", "zoocraft:aluminum_fence_gate", states);
  for (let x = min.x; x <= max.x; x++) x === center.x ? gate(x, min.z, NORTH) : fence(x, min.z);
  for (let z = min.z; z <= max.z; z++) z === center.z ? gate(max.x, z, EAST) : fence(max.x, z);
  for (let x = max.x; x >= min.x; x--) {
    const d = x - center.x;
    if (d === 0) add(x, max.z, "entrance", "zoocraft:park_entrance_gate", NORTH);
    else if (Math.abs(d) <= 2) add(x, max.z, "part", undefined, undefined);
    else fence(x, max.z);
  }
  for (let z = max.z; z >= min.z; z--) z === center.z ? gate(min.x, z, EAST) : fence(min.x, z);
  return out;
}

/**
 * What /zoocraft:build says once the zoo stands: `plan` from planZoo (size, asked, viewing, services), `c` the counts
 * (exhibits, occupied, unsafe, animals, keepers), `center` the ring's middle and `edge` the park's fence line.
 */
export function zooBuiltText(plan, c, center, edge) {
  const grew = plan.asked < plan.size ? ` (${plan.asked} x ${plan.asked} wouldn't hold them)` : "";
  return [
    `§aTest zoo built: §f${c.exhibits} exhibits (${c.occupied} occupied${c.unsafe ? `, §c${c.unsafe} unsafe§f` : ""}) with ${c.animals} animals, ${c.keepers} keepers, ${plan.viewing.length} Viewing Points and ${plan.services.length} guest services, inside a ${plan.size} x ${plan.size} Aluminum Fence round ${center.x} ${center.z}${grew}: a gate in the middle of the north, east and west sides, the Park Entrance Gate in the middle of the south side. The park is open: guests arrive over the next minute.`,
    `§7Park edge: ${edge}`,
  ];
}
