import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";
import { classifyBlock, blocksView, isPathBlock } from "../data/blocks.js";

// Thin adapters over the Minecraft Script API, so a version bump touches this folder only.

// Backend for persistence/store.js: world dynamic properties.
export const worldBackend = {
  get: (key) => world.getDynamicProperty(key),
  set: (key, value) => world.setDynamicProperty(key, value),
  now: () => Date.now(),
};

export function dim(id) {
  return world.getDimension(id);
}

// Block category reader for exhibits/geometry.js. Never loads chunks. With { leaves: true }, tree
// leaves come back as "leaves" instead of "solid".
export function blockReader(dimension, { leaves = false, mud = false, hot = false, ash = false, end = false, perch = false, climb = false, grass = false, croc = false, ape = false, nylium = false, stem = false } = {}) {
  return (x, y, z) => {
    const loc = { x, y, z };
    if (!dimension.isChunkLoaded(loc)) return "unloaded";
    let block;
    try {
      block = dimension.getBlock(loc);
    } catch {
      return "unloaded";
    }
    if (!block) return "unloaded";
    let open = false;
    const states = block.permutation.getAllStates();
    if (states["open_bit"] === true || states["zoocraft:open"] === true) open = true;
    return classifyBlock(block.typeId, { isAir: block.isAir, isLiquid: block.isLiquid, open, leaves, mud, hot, ash, end, perch, grass, croc, climb, ape, nylium, stem });
  };
}

// The biome at `pos` ({ id, tags }), or undefined where the chunk isn't loaded or the block is out of the world.
export function biomeAt(dimension, pos) {
  try {
    if (!dimension.isChunkLoaded(pos)) return undefined;
    const b = dimension.getBiome(pos);
    return { id: b.id, tags: b.getTags() };
  } catch {
    return undefined;
  }
}

// Sightline reader for visitors/sight.js: "clear", "blocked" or "unloaded". Never loads chunks.
export function viewReader(dimension) {
  return (x, y, z) => {
    const loc = { x, y, z };
    if (!dimension.isChunkLoaded(loc)) return "unloaded";
    try {
      const block = dimension.getBlock(loc);
      if (!block) return "unloaded";
      return blocksView(block.typeId, { isAir: block.isAir, isLiquid: block.isLiquid }) ? "blocked" : "clear";
    } catch {
      return "unloaded";
    }
  };
}

// Path reader for visitors/paths.js: "path" when the block is an allowlisted path block with two
// blocks of walking room above it, "other", or "unloaded". Never loads chunks.
export function pathReader(dimension) {
  const walkable = (x, y, z) => {
    const block = dimension.getBlock({ x, y, z });
    if (!block) return false;
    const kind = classifyBlock(block.typeId, { isAir: block.isAir, isLiquid: block.isLiquid, open: true });
    return kind === "air" || kind === "gate_open";
  };
  return (x, y, z) => {
    const loc = { x, y, z };
    if (!dimension.isChunkLoaded(loc)) return "unloaded";
    try {
      const block = dimension.getBlock(loc);
      if (!block) return "unloaded";
      if (!isPathBlock(block.typeId)) return "other";
      return walkable(x, y + 1, z) && walkable(x, y + 2, z) ? "path" : "other";
    } catch {
      return "unloaded";
    }
  };
}

export function heldItem(player) {
  const equip = player.getComponent("minecraft:equippable");
  return equip?.getEquipment(EquipmentSlot.Mainhand);
}

export function setHeldItem(player, stack) {
  const equip = player.getComponent("minecraft:equippable");
  equip?.setEquipment(EquipmentSlot.Mainhand, stack);
}

// Inventory slot holding this item, preferring the selected hotbar slot; -1 when there is none.
export function findItemSlot(player, typeId) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return -1;
  if (inv.getItem(player.selectedSlotIndex)?.typeId === typeId) return player.selectedSlotIndex;
  for (let i = 0; i < inv.size; i++) if (inv.getItem(i)?.typeId === typeId) return i;
  return -1;
}

export function setSlotItem(player, slot, stack) {
  player.getComponent("minecraft:inventory")?.container?.setItem(slot, stack);
}

// Count / remove items anywhere in the player's inventory.
export function countItem(player, typeId) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return 0;
  let n = 0;
  for (let i = 0; i < inv.size; i++) {
    const s = inv.getItem(i);
    if (s?.typeId === typeId) n += s.amount;
  }
  return n;
}

export function takeItem(player, typeId, amount) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv || countItem(player, typeId) < amount) return false;
  let left = amount;
  for (let i = 0; i < inv.size && left > 0; i++) {
    const s = inv.getItem(i);
    if (s?.typeId !== typeId) continue;
    const take = Math.min(left, s.amount);
    left -= take;
    if (take === s.amount) inv.setItem(i, undefined);
    else {
      s.amount -= take;
      inv.setItem(i, s);
    }
  }
  return true;
}

// Give items; whatever doesn't fit drops at the player's feet.
export function giveItem(player, typeId, amount = 1) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  let left = amount;
  while (left > 0) {
    const stack = new ItemStack(typeId, 1);
    const n = Math.min(left, stack.maxAmount);
    stack.amount = n;
    left -= n;
    const rest = inv?.addItem(stack);
    if (rest) player.dimension.spawnItem(rest, player.location);
  }
}

export function onlinePlayers() {
  return world.getAllPlayers();
}

// Entities of one type in a dimension, found by type alone: one search per type a tick, shared by
// everything that asks that tick. 0.1.70: the Void Rays' family search came back empty beside them
// because the rays had lost their family (animals/flight.js wakeWild); a type search doesn't depend
// on families, and it's the search guests, keepers and tours have always used.
let typeTick = -1;
const typeCache = new Map(); // `${dimension id}|${type}` -> Entity[] found this tick
export function entitiesOfType(dimension, type) {
  if (system.currentTick !== typeTick) {
    typeTick = system.currentTick;
    typeCache.clear();
  }
  const key = `${dimension.id}|${type}`;
  let list = typeCache.get(key);
  if (!list) {
    list = dimension.getEntities({ type });
    typeCache.set(key, list);
  }
  return list;
}

// Those of the given types within `range` blocks of `location` (measured here, not by the game).
export function entitiesNear(dimension, location, range, types) {
  const out = [];
  const r2 = range * range;
  for (const type of types) {
    for (const e of entitiesOfType(dimension, type)) {
      let p;
      try {
        if (!e.isValid) continue;
        p = e.location;
      } catch {
        continue; // gone this tick
      }
      const dx = p.x - location.x;
      const dy = p.y - location.y;
      const dz = p.z - location.z;
      if (dx * dx + dy * dy + dz * dz <= r2) out.push(e);
    }
  }
  return out;
}

// Minecraft's own clock (nocturnal animals follow it, not the park clock): night is from 13000 to
// 23000 of the 24000-tick day.
export function isNight() {
  const t = world.getTimeOfDay() % 24000;
  return t >= 13000 && t < 23000;
}

export function message(player, text) {
  try {
    player.sendMessage(text);
  } catch {
    // The player may have left.
  }
}

export function later(fn) {
  system.run(fn);
}

export const center = (pos) => ({ x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y), z: Math.floor(pos.z) + 0.5 });
