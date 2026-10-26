import { ItemStack, BlockPermutation, GameMode } from "@minecraft/server";
import { BLOCKS } from "../data/items.js";
import { classifyBlock } from "../data/blocks.js";
import { fenceLinks } from "./rules.js";
import { blockChanged } from "../exhibits/exhibits.js";
import { heldItem, setHeldItem, message } from "../platform/mc.js";
import { runLater } from "../park/park.js";

// End Fence (0.1.56, Austin: "special 'end fences' that can keep the rift ferret and other end animals
// inside so they can't teleport outside the zoo area"). Two blocks tall and a half: zoocraft:end_fence
// (post and rails, a full block of collision) with zoocraft:end_fence_top (the rift crystal spire and
// the beams, half a block) put on top of it, so it stands like a vanilla fence and nothing jumps it.
// Its four link states (zoocraft:n/e/s/w) draw the arms toward End Fences, solid blocks, walls and
// other fences beside it; they are set here on placing and whenever a block beside one changes
// (main.js calls fenceBlockChanged from the place and break events). Rift Ferrets never blink across
// one, wild or in a zoo (animals/riftRules.js crossesFence); the exhibit validator reads both blocks
// as a barrier (data/blocks.js), so the fence closes a pen like any other.
// Placing (0.1.59, Austin: "Fences glitch a bit, and they are hard to place while holding down the
// trigger"): the arms are set in the placed permutation itself, so a fence appears already joined;
// the crystal top goes on with its beams in one go; and a fence placed against the crystal top of a
// standing fence lands on the ground beside it, not floating beside the top. The blocks' selection
// boxes hug the post and arms (gen/endfence.py), so aiming beside a fence line hits the ground.

const DIRS = { n: [0, -1], e: [1, 0], s: [0, 1], w: [-1, 0] };
// From the face a block is placed on to the block that was aimed at.
const FACE_BACK = { Up: [0, -1, 0], Down: [0, 1, 0], North: [0, 0, 1], South: [0, 0, -1], East: [-1, 0, 0], West: [1, 0, 0] };
/** @type {Record<string, any>} Custom block states aren't in the vanilla typings. */
const LINK = Object.fromEntries(Object.keys(DIRS).map((k) => [k, `zoocraft:${k}`]));

export function isEndFence(typeId) {
  return typeId === BLOCKS.endFence || typeId === BLOCKS.endFenceTop;
}

// The fences whose arms are set here: the End Fence's two blocks and, since 0.1.110 (as in 0.1.101 and 0.1.102; from
// 0.1.103 to 0.1.109 it was a full block of pickets with no arms), the Aluminum Fence: a thin panel half a block wide
// with an arm out to each neighbour (Austin, 2026-10-26: "it should be half a block wide").
function linksItself(typeId) {
  return isEndFence(typeId) || typeId === BLOCKS.aluminumFence;
}

function blockAt(dimension, pos) {
  try {
    return dimension.getBlock(pos);
  } catch {
    return undefined;
  }
}

// What a neighbour is to a fence arm: another End Fence, something solid to join (a block, a wall,
// a vanilla fence, a closed gate), or open air. An Aluminum Fence Gate joins only the fences at its ends, as a
// vanilla gate does: one facing north or south spans east to west.
function kindOf(block, side) {
  if (!block) return "open";
  if (isEndFence(block.typeId) || block.typeId === BLOCKS.aluminumFence) return "fence";
  if (block.isAir || block.isLiquid) return "open";
  if (block.typeId === BLOCKS.aluminumGate) {
    const facing = block.permutation.getState(/** @type {any} */ ("minecraft:cardinal_direction"));
    const spansX = facing === "north" || facing === "south";
    return spansX === (side === "e" || side === "w") ? "fence" : "open";
  }
  const c = classifyBlock(block.typeId, { isAir: false, isLiquid: false, open: false });
  return c === "solid" || c === "barrier" ? "solid" : "open";
}

// The link states a fence at `pos` should have, from what stands beside it.
function linksAt(dimension, pos) {
  const kinds = {};
  for (const [k, [dx, dz]] of Object.entries(DIRS)) kinds[k] = kindOf(blockAt(dimension, { x: pos.x + dx, y: pos.y, z: pos.z + dz }), k);
  return fenceLinks(kinds);
}

// A fence block's permutation with its arms already set.
export function linkedPermutation(typeId, dimension, pos) {
  const links = linksAt(dimension, pos);
  return BlockPermutation.resolve(typeId, Object.fromEntries(Object.keys(DIRS).map((k) => [LINK[k], links[k]])));
}

// Set one fence block's link states from what stands beside it.
function relink(block) {
  if (!block || !linksItself(block.typeId)) return;
  const links = linksAt(block.dimension, block.location);
  let p = block.permutation;
  let changed = false;
  for (const k of Object.keys(DIRS)) {
    if (p.getState(LINK[k]) !== links[k]) {
      p = p.withState(LINK[k], links[k]);
      changed = true;
    }
  }
  if (changed) block.setPermutation(p);
}

// The four fence blocks beside a position (if any) take a fresh look at it.
function relinkAround(dimension, pos) {
  for (const [dx, dz] of Object.values(DIRS)) relink(blockAt(dimension, { x: pos.x + dx, y: pos.y, z: pos.z + dz }));
}

/** The fence at `pos` (if any) and the fences beside it set their arms afresh (a fence placed, broken or turned). */
export function relinkAt(dimension, pos) {
  relink(blockAt(dimension, pos));
  relinkAround(dimension, pos);
}

// A block was placed or broken at `pos` (any block, by a player): the End Fences beside it relink.
export function fenceBlockChanged(dimensionId, pos) {
  runLater(() => {
    try {
      const d = dimensionOf(dimensionId);
      if (!d) return;
      relink(blockAt(d, pos));
      relinkAround(d, pos);
    } catch {
      // unloaded
    }
  });
}

let getDimension;
export function initEndFence(worldDimension) {
  getDimension = worldDimension;
}
function dimensionOf(id) {
  return getDimension ? getDimension(id) : undefined;
}

// A fence block has just been set at `block`: put the crystal top on it (with its beams), and join
// the arms of everything beside both halves. Safe to run more than once.
function finishFence(block) {
  const d = block.dimension;
  const above = block.above();
  if (above?.isAir) above.setPermutation(linkedPermutation(BLOCKS.endFenceTop, d, above.location));
  relink(block);
  relinkAround(d, block.location);
  const top = block.above();
  if (top && isEndFence(top.typeId)) {
    relink(top);
    relinkAround(d, top.location);
    blockChanged(d.id, top.location);
  }
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

// A fence placed against the crystal top of a standing fence goes on the ground beside it (where the
// player meant it), the item is used up as for any placing, and the usual placing sound plays.
function placeBeside(player, dimension, ground) {
  const block = blockAt(dimension, ground);
  if (!block?.isAir || !block.above()?.isAir) return;
  if (player && !creative(player)) {
    const held = heldItem(player);
    if (held?.typeId !== BLOCKS.endFence) return;
    if (held.amount > 1) {
      held.amount -= 1;
      setHeldItem(player, held);
    } else setHeldItem(player, undefined);
  }
  block.setPermutation(linkedPermutation(BLOCKS.endFence, dimension, ground));
  try {
    dimension.playSound("dig.stone", { x: ground.x + 0.5, y: ground.y + 0.5, z: ground.z + 0.5 });
  } catch {
    // sound is cosmetic
  }
  finishFence(block);
  blockChanged(dimension.id, ground);
}

export function endFenceComponent() {
  return {
    beforeOnPlayerPlace(e) {
      const block = e.block;
      const back = FACE_BACK[e.face];
      // Aimed at the crystal top of a standing fence (the natural way to run a line with the trigger
      // held): the new fence belongs on the ground beside it, at the same height as that fence.
      if (back && back[1] === 0) {
        const aimed = blockAt(block.dimension, { x: block.x + back[0], y: block.y, z: block.z + back[2] });
        const ground = block.below();
        if (aimed?.typeId === BLOCKS.endFenceTop && ground?.isAir) {
          e.cancel = true;
          const player = e.player;
          const dimension = block.dimension;
          const pos = { x: ground.x, y: ground.y, z: ground.z };
          runLater(() => placeBeside(player, dimension, pos));
          return;
        }
      }
      const above = block.above();
      if (!above?.isAir) {
        e.cancel = true;
        if (e.player) runLater(() => message(e.player, "§eAn End Fence stands a block and a half high: it needs the block above it free."));
        return;
      }
      // The arms are part of the placed block, so the fence appears already joined to its neighbours.
      try {
        e.permutationToPlace = linkedPermutation(BLOCKS.endFence, block.dimension, block.location);
      } catch {
        // older script versions: the arms are set a tick later by onPlace instead
      }
    },
    onPlace(e) {
      const block = e.block;
      if (block.typeId !== BLOCKS.endFence) return;
      runLater(() => finishFence(block));
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player || heldItem(player)) return;
      runLater(() => message(player, "§6End Fence: §fa block and a half high, so End animals can't jump it, and Rift Ferrets never blink across one, wild or in a zoo: ring a pen with End Fences and their blinks stay inside it. It links to End Fences, walls, fences and solid blocks beside it. End stone bricks and end rods at the Zoo Workshop."));
    },
    onPlayerBreak(e) {
      // Breaking either half removes the other; the fence item comes back once either way.
      const brokeTop = e.brokenBlockPermutation.type.id === BLOCKS.endFenceTop;
      const other = brokeTop ? e.block.below() : e.block.above();
      const dimension = e.block.dimension;
      const here = { x: e.block.x, y: e.block.y, z: e.block.z };
      const pos = other ? { x: other.x, y: other.y, z: other.z } : undefined;
      runLater(() => {
        if (pos) {
          const b = blockAt(dimension, pos);
          if (b && isEndFence(b.typeId)) {
            b.setType("minecraft:air");
            if (brokeTop && e.player?.getGameMode() !== "Creative") dimension.spawnItem(new ItemStack(BLOCKS.endFence, 1), b.center());
          }
          relinkAround(dimension, pos);
          blockChanged(dimension.id, pos);
        }
        relinkAround(dimension, here);
      });
    },
  };
}
