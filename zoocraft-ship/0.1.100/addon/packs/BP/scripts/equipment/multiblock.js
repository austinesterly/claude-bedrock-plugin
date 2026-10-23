// Multi-block furniture (pure): the Snack Stand is a 2 x 2 kiosk, 2 blocks tall, the Bench is 2
// blocks wide and the Park Entrance Gate is an arch. The block the player places is the main part (part 0, which holds the
// record); the script fills the other cells with a "part" block that knows its place by its
// zoocraft:part state. Every part turns with the main block's cardinal direction, so each one
// rotates its own slice of the model about its own centre and the whole thing turns as one.

// Cells in the model's own frame: the front faces -z (towards the player who placed it), +x runs
// along the width, +z away from the player. Part index = position in the list.
export const LAYOUTS = {
  "zoocraft:snack_stand": {
    part: "zoocraft:snack_stand_part",
    name: "Snack Stand",
    size: "a clear space 2 blocks wide, 2 deep and 2 high",
    cells: [
      [0, 0, 0], [1, 0, 0], [0, 0, 1], [1, 0, 1],
      [0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 1, 1],
    ],
  },
  "zoocraft:bench": {
    part: "zoocraft:bench_part",
    name: "Bench",
    size: "a clear space 2 blocks wide",
    cells: [[0, 0, 0], [1, 0, 0]],
  },
  // The Restroom and the Path Lamp (0.1.100): one block across, two high.
  "zoocraft:restroom": {
    part: "zoocraft:restroom_part",
    name: "Restroom",
    size: "a clear space 2 blocks high",
    cells: [[0, 0, 0], [0, 1, 0]],
  },
  "zoocraft:path_lamp": {
    part: "zoocraft:path_lamp_part",
    name: "Path Lamp",
    size: "a clear space 2 blocks high",
    cells: [[0, 0, 0], [0, 1, 0]],
  },
  // A zoo entrance arch 5 blocks wide and 4 tall: the placed block is the threshold in the middle
  // of a 3-wide walkway (guests walk over it), with a pillar 2 blocks to each side, a beam across
  // the third row and a ZOO sign on top.
  "zoocraft:park_entrance_gate": {
    part: "zoocraft:park_entrance_gate_part",
    name: "Park Entrance Gate",
    size: "a clear space 5 blocks wide and 4 high",
    cells: [
      [0, 0, 0],
      [-2, 0, 0], [-2, 1, 0], [-2, 2, 0], [-2, 3, 0],
      [2, 0, 0], [2, 1, 0], [2, 2, 0], [2, 3, 0],
      [-1, 2, 0], [0, 2, 0], [1, 2, 0],
      [-1, 3, 0], [0, 3, 0], [1, 3, 0],
    ],
  },
};

const PARTS = Object.fromEntries(Object.entries(LAYOUTS).map(([main, l]) => [l.part, main]));

export function mainTypeOfPart(typeId) {
  return PARTS[typeId];
}

// Model frame -> world offset for a block facing `dir` (matches the blocks' transformation
// permutations: west turns the model 90 degrees, south 180, east 270).
export function turn(dir, x, z) {
  switch (dir) {
    case "south":
      return [-x, -z];
    case "west":
      return [z, -x];
    case "east":
      return [-z, x];
    default:
      return [x, z];
  }
}

// Every cell of a structure whose main block is at `origin`: { part, pos }.
export function cellsOf(mainType, origin, dir) {
  const layout = LAYOUTS[mainType];
  if (!layout) return [{ part: 0, pos: { x: origin.x, y: origin.y, z: origin.z } }];
  return layout.cells.map(([x, y, z], part) => {
    const [dx, dz] = turn(dir, x, z);
    return { part, pos: { x: origin.x + dx, y: origin.y + y, z: origin.z + dz } };
  });
}

// Where the main block of a part sits.
export function mainOf(partType, pos, dir, part) {
  const layout = LAYOUTS[PARTS[partType]];
  const cell = layout?.cells[part];
  if (!cell) return undefined;
  const [dx, dz] = turn(dir, cell[0], cell[2]);
  return { x: pos.x - dx, y: pos.y - cell[1], z: pos.z - dz };
}

// The ground cells guests walk through under the gate's arch, middle first.
export function walkwayOf(origin, dir) {
  return [0, -1, 1].map((x) => {
    const [dx, dz] = turn(dir, x, 0);
    return { x: origin.x + dx, y: origin.y, z: origin.z + dz };
  });
}
