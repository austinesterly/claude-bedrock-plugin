import { system } from "@minecraft/server";
import { getPark, setEntrance, insidePark } from "./park.js";
import { BLOCKS } from "../data/items.js";
import { walkwayOf } from "../equipment/multiblock.js";
import { needsClearSpace, fillParts, mainBlockOf, mainBroken, partBroken } from "../equipment/structures.js";
import { standSpot } from "../visitors/sight.js";
import { gateMenu } from "../ui/parkMenu.js";
import { dim, blockReader } from "../platform/mc.js";
import { noteEntranceGate, fenceTouched } from "./fence.js";

// The Park Entrance Gate: placing it builds a zoo entrance arch (equipment/multiblock.js). The
// placed block is the threshold in the middle of the walkway; using any block of the arch opens
// or closes the park, and breaking any block takes the whole arch down.

// A gate placed inside the park becomes the entrance straight away when the park has none (or its
// recorded gate is gone), so a Ticket Booth beside it works before the park is first opened.
function claimEntrance(d, pos) {
  const park = getPark();
  if (!park || !insidePark(d.id, pos)) return;
  const ent = park.entrance;
  if (ent) {
    const e = dim(ent.dimension);
    if (!e.isChunkLoaded(ent)) return;
    if (e.getBlock(ent)?.typeId === BLOCKS.entranceGate) return;
  }
  setEntrance(d.id, pos);
}

// For a Ticket Booth when the park has no entrance: a gate within `range` becomes it.
export function adoptGateNear(dimensionId, pos, range) {
  const d = dim(dimensionId);
  for (let dy = -range; dy <= range; dy++)
    for (let dx = -range; dx <= range; dx++)
      for (let dz = -range; dz <= range; dz++) {
        const p = { x: pos.x + dx, y: pos.y + dy, z: pos.z + dz };
        try {
          if (d.getBlock(p)?.typeId !== BLOCKS.entranceGate) continue;
        } catch {
          continue;
        }
        claimEntrance(d, p);
        return !!getPark()?.entrance;
      }
  return false;
}

function forgetEntrance(d, pos) {
  system.run(() => {
    const ent = getPark()?.entrance;
    if (ent && ent.dimension === d.id && ent.x === pos.x && ent.y === pos.y && ent.z === pos.z) setEntrance(undefined, undefined);
  });
}

export function gateComponent() {
  return {
    beforeOnPlayerPlace: needsClearSpace,
    onPlace(e) {
      const d = e.block.dimension;
      const pos = { x: e.block.x, y: e.block.y, z: e.block.z };
      system.run(() => {
        fillParts(d, BLOCKS.entranceGate, pos);
        // The arch is part of the park's fence (0.1.101): the fence can run up to its pillars.
        const gate = d.getBlock(pos);
        if (gate?.typeId === BLOCKS.entranceGate) noteEntranceGate(gate);
        try {
          claimEntrance(d, pos);
        } catch {
          // The old gate's chunk misbehaved; using the new gate still sets the entrance.
        }
      });
    },
    onPlayerInteract(e) {
      const player = e.player;
      const block = e.block;
      if (!player) return;
      system.run(() => {
        fillParts(block.dimension, BLOCKS.entranceGate, block.location); // a gate from before the arch
        gateMenu(player, block);
      });
    },
    onPlayerBreak(e) {
      forgetEntrance(e.block.dimension, { x: e.block.x, y: e.block.y, z: e.block.z });
      mainBroken(e);
      fenceTouched(e.block.dimension.id, e.player?.id); // its blocks drop off the fence list
    },
  };
}

// The pillars, beam and sign: a click opens the gate menu of the threshold block.
export function gatePartComponent() {
  return {
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const main = mainBlockOf(e.block, e.block.permutation);
      system.run(() => {
        if (main) gateMenu(player, main);
        else if (e.block.isValid) e.block.setType("minecraft:air"); // a leftover part
      });
    },
    onPlayerBreak(e) {
      partBroken(e, forgetEntrance);
      fenceTouched(e.block.dimension.id, e.player?.id);
    },
  };
}

// Where arriving guests appear: on the walkway under the arch (beside the gate if the walkway is
// blocked). Also builds the arch of a gate placed before it existed, when there's room.
export function arrivalSpots() {
  const ent = getPark()?.entrance;
  if (!ent) return [];
  const d = dim(ent.dimension);
  if (!d.isChunkLoaded(ent)) return [];
  try {
    if (d.getBlock(ent)?.typeId !== BLOCKS.entranceGate) return [];
    const dir = fillParts(d, BLOCKS.entranceGate, ent);
    const read = blockReader(d);
    const spots = walkwayOf(ent, dir).filter((p) => read(p.x, p.y - 1, p.z) === "solid" && read(p.x, p.y, p.z) === "air" && read(p.x, p.y + 1, p.z) === "air");
    if (!spots.length) {
      const s = standSpot(read, ent);
      if (s) spots.push(s);
    }
    return spots.map((p) => ({ dimension: ent.dimension, ...p }));
  } catch {
    return [];
  }
}
