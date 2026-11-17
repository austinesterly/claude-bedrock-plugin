// The Deep Trench's dark caves (0.1.313, Austin 2026-11-16: "The goblin sharks do not spawn in the trenches because
// there is so much light in them. Make little caves at the bottom that lead to absolutely no light level"). Pure rules:
// which chunks get a cave and its shape. A cave is a mouth in the abyss floor, a shaft straight down, a short tunnel
// and a low chamber, all water, all inside its own chunk (one block of rock kept to every chunk side, so no chunk
// line ever shows). Light loses a level a block: 13 blocks from the mouth to the chamber, so even a sea lantern beside
// the mouth leaves the chamber's near end at 2 and the rest at 0.
import { hash } from "./trenchRules.js";

/** Whether chunk (cx, cz) has a cave, the same every session. */
export const hasCave = (cx, cz, C) => hash(cx, cz, C.salt) < C.chance;

/** A quarter turn count 0..3 for the chunk's cave. */
export const caveTurn = (cx, cz, C) => Math.floor(hash(cx, cz, C.salt + 1) * 4) % 4;

// Local shape (chunk cells 0..15, before turning), heights from the floor block's y (0 = the floor block itself).
const SHAPE = (C) => {
  const low = -C.shaft; // the tunnel's floor
  return [
    { part: "shaft", x0: 2, x1: 4, z0: 1, z1: 3, y0: low, y1: 0 },
    { part: "tunnel", x0: 2, x1: 4, z0: 4, z1: 7, y0: low, y1: low + 2 },
    { part: "chamber", x0: 2, x1: 12, z0: 8, z1: 12, y0: low - 1, y1: low + 2 },
    { part: "chamber", x0: 3, x1: 11, z0: 7, z1: 13, y0: low - 1, y1: low + 1 },
  ];
};

const turnCell = (x, z, turn) => (turn === 0 ? [x, z] : turn === 1 ? [15 - z, x] : turn === 2 ? [15 - x, 15 - z] : [z, 15 - x]);

/** The floor heights a cave fits under: its lowest rock shell stays above the bedrock. */
export const floorFits = (floorY, C) => floorY <= C.floorMax && floorY - C.shaft - 2 >= C.lowest;

/**
 * The boxes of water of chunk (cx, cz)'s cave under a floor block at floorY, in world blocks:
 * [{ part, min: {x,y,z}, max: {x,y,z} }].
 */
export function caveBoxes(cx, cz, floorY, C) {
  const turn = caveTurn(cx, cz, C);
  return SHAPE(C).map((b) => {
    const [ax, az] = turnCell(b.x0, b.z0, turn);
    const [bx, bz] = turnCell(b.x1, b.z1, turn);
    return {
      part: b.part,
      min: { x: cx * 16 + Math.min(ax, bx), y: floorY + b.y0, z: cz * 16 + Math.min(az, bz) },
      max: { x: cx * 16 + Math.max(ax, bx), y: floorY + b.y1, z: cz * 16 + Math.max(az, bz) },
    };
  });
}

/** Where the mouth's middle column is (the floor is looked for there). */
export function caveMouth(cx, cz, C) {
  const [x, z] = turnCell(3, 2, caveTurn(cx, cz, C));
  return { x: cx * 16 + x, z: cz * 16 + z };
}

/** A box grown by one block every way (its rock shell), cut off at `top`. */
export const shellOf = (box, top) => ({
  min: { x: box.min.x - 1, y: box.min.y - 1, z: box.min.z - 1 },
  max: { x: box.max.x + 1, y: Math.min(top, box.max.y + 1), z: box.max.z + 1 },
});

/** Whether a cell is inside any of the boxes. */
export const inBoxes = (boxes, x, y, z) => boxes.some((b) => x >= b.min.x && x <= b.max.x && y >= b.min.y && y <= b.max.y && z >= b.min.z && z <= b.max.z);

/** How many blocks a box holds. */
export const boxCells = (b) => (b.max.x - b.min.x + 1) * (b.max.y - b.min.y + 1) * (b.max.z - b.min.z + 1);
