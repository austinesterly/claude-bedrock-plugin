import { ItemStack } from "@minecraft/server";
import { LAYOUTS, cellsOf, mainOf, mainTypeOfPart } from "./multiblock.js";
import { message } from "../platform/mc.js";
import { runLater } from "../park/park.js";

// World side of the multi-block furniture in multiblock.js: checking the space before placing,
// filling in the hidden part blocks, finding the main block from a part, and taking the whole
// structure down when any block of it breaks.

/** @type {any} Custom block states aren't in the vanilla typings. */
export const DIR = "minecraft:cardinal_direction";
/** @type {any} */
export const PART = "zoocraft:part";

// beforeOnPlayerPlace: cancel unless every cell the structure needs is air.
export function needsClearSpace(e) {
  const type = e.permutationToPlace.type.id;
  const layout = LAYOUTS[type];
  if (!layout) return;
  const cells = cellsOf(type, e.block.location, e.permutationToPlace.getState(DIR)).slice(1);
  const clear = cells.every((c) => {
    try {
      return e.dimension.getBlock(c.pos)?.isAir === true;
    } catch {
      return false;
    }
  });
  if (!clear) {
    e.cancel = true;
    if (e.player) runLater(() => message(e.player, `§eA ${layout.name} needs ${layout.size}.`));
  }
}

// Place any missing part around a main block (structures built before they were widened, or parts
// lost to an explosion). Only ever places into air. Returns the main block's direction.
export function fillParts(d, mainType, pos) {
  const layout = LAYOUTS[mainType];
  if (!layout) return undefined;
  try {
    const main = d.getBlock(pos);
    if (!main || main.typeId !== mainType) return undefined;
    const dir = main.permutation.getState(DIR);
    for (const cell of cellsOf(mainType, pos, dir).slice(1)) {
      if (!d.isChunkLoaded(cell.pos)) continue;
      const b = d.getBlock(cell.pos);
      if (!b || b.typeId === layout.part || !b.isAir) continue;
      b.setType(layout.part);
      b.setPermutation(b.permutation.withState(DIR, dir).withState(PART, cell.part));
    }
    return dir;
  } catch {
    // Unloaded or out of the world; tried again later.
    return undefined;
  }
}

// Every block of a structure, main first, that is still in place.
export function structureBlocks(d, mainType, origin, dir) {
  const layout = LAYOUTS[mainType];
  const out = [];
  for (const cell of cellsOf(mainType, origin, dir)) {
    try {
      const b = d.getBlock(cell.pos);
      if (!b) continue;
      if (cell.part === 0 ? b.typeId === mainType : layout && b.typeId === layout.part && b.permutation.getState(PART) === cell.part) out.push(b);
    } catch {
      // Unloaded.
    }
  }
  return out;
}

// The main block a part belongs to, if it's still there.
export function mainBlockOf(block, perm) {
  const mainType = mainTypeOfPart(perm.type.id);
  const origin = mainType && mainOf(perm.type.id, block.location, perm.getState(DIR), perm.getState(PART));
  if (!origin) return undefined;
  try {
    const main = block.dimension.getBlock(origin);
    return main?.typeId === mainType ? main : undefined;
  } catch {
    return undefined;
  }
}

// The main block broke: take the other parts with it (they drop nothing; the main block drops the item).
export function mainBroken(e) {
  const d = e.block.dimension;
  const pos = { x: e.block.x, y: e.block.y, z: e.block.z };
  const type = e.brokenBlockPermutation.type.id;
  const dir = e.brokenBlockPermutation.getState(DIR);
  if (!LAYOUTS[type]) return;
  runLater(() => {
    for (const b of structureBlocks(d, type, pos, dir)) if (b.typeId !== type) b.setType("minecraft:air");
  });
}

// A part broke: take the whole structure down and drop one item (none in Creative). `forget(d,
// origin)` runs when the main block was still there. Returns the main block's position.
export function partBroken(e, forget) {
  const d = e.block.dimension;
  const perm = e.brokenBlockPermutation;
  const mainType = mainTypeOfPart(perm.type.id);
  const dir = perm.getState(DIR);
  const origin = mainOf(perm.type.id, e.block.location, dir, perm.getState(PART));
  const creative = e.player?.getGameMode() === "Creative";
  if (!mainType || !origin) return undefined;
  runLater(() => {
    const blocks = structureBlocks(d, mainType, origin, dir);
    const hadMain = blocks.some((b) => b.typeId === mainType);
    for (const b of blocks) b.setType("minecraft:air");
    if (!hadMain) return;
    forget?.(d, origin);
    if (!creative) d.spawnItem(new ItemStack(mainType, 1), { x: origin.x + 0.5, y: origin.y + 0.5, z: origin.z + 0.5 });
  });
  return origin;
}
