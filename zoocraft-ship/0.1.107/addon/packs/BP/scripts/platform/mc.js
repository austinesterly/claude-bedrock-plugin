import { world, system, EquipmentSlot, ItemStack, MolangVariableMap } from "@minecraft/server";
import { classifyBlock, blocksView, isPathBlock, readsOpen, LIQUID_TYPES } from "../data/blocks.js";

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
// 0.1.96 (the performance check): a read is one getBlock and one to three property reads (it was seven native calls):
// getBlock itself says when the chunk isn't loaded (undefined, or LocationInUnloadedChunkError), an air block needs
// no more, water and lava are told by their type (Bedrock has no other liquids), and only a gate or door has its
// states read. `memo` (a Map), shared by the readers of one measurement, keeps what each block is, so a block read by
// the flood, the headroom check and the cover count is fetched once; a block changed meanwhile is caught by the
// re-measure its edit queues (exhibits.js blockChanged).
export function blockReader(dimension, { leaves = false, mud = false, hot = false, ash = false, end = false, perch = false, climb = false, grass = false, croc = false, ape = false, nylium = false, stem = false, gecko = false, thermalMud = false, boar = false, substrate = false, thin = false, rock = false } = {}, memo = undefined) {
  const opts = { isAir: false, isLiquid: false, open: false, leaves, mud, hot, ash, end, perch, grass, croc, climb, ape, nylium, stem, gecko, thermalMud, boar, substrate, thin, rock };
  // Every reader asking the same questions shares one table of block type (and "#open") -> category, so
  // classifyBlock's pattern tests run once a type for the whole session.
  const sig = FLAGS.map((f) => (opts[f] ? 1 : 0)).join("");
  let kinds = KINDS.get(sig);
  if (!kinds) KINDS.set(sig, (kinds = new Map()));
  return (x, y, z) => {
    let f;
    if (memo) {
      const k = `${x},${y},${z}`;
      f = memo.get(k);
      if (f === undefined) {
        f = blockFacts(dimension, x, y, z);
        if (f) memo.set(k, f);
      }
    } else f = blockFacts(dimension, x, y, z);
    if (!f) return "unloaded";
    if (f === AIR_FACTS) return "air";
    const k = f.open ? `${f.typeId}#open` : f.typeId;
    let kind = kinds.get(k);
    if (kind === undefined) {
      opts.isLiquid = LIQUID_TYPES.has(f.typeId);
      opts.open = f.open;
      kind = classifyBlock(f.typeId, opts);
      kinds.set(k, kind);
    }
    return kind;
  };
}

const FLAGS = ["leaves", "mud", "hot", "ash", "end", "perch", "climb", "grass", "croc", "ape", "nylium", "stem", "gecko", "thermalMud", "boar", "substrate", "thin", "rock"];
const KINDS = new Map(); // the readers' flags -> Map(block type -> category)
const AIR_FACTS = { typeId: "minecraft:air", open: false };
const OPENS = new Map(); // block type -> whether its open state is read (data/blocks.js readsOpen)
// What a block is, for the readers: undefined where it can't be read (an unloaded chunk, outside the world).
function blockFacts(dimension, x, y, z) {
  let block;
  try {
    block = dimension.getBlock({ x, y, z });
    if (!block) return undefined;
    if (block.isAir) return AIR_FACTS;
    const typeId = block.typeId;
    let open = false;
    let opens = OPENS.get(typeId);
    if (opens === undefined) OPENS.set(typeId, (opens = readsOpen(typeId)));
    if (opens) {
      const states = block.permutation.getAllStates();
      open = states["open_bit"] === true || states["zoocraft:open"] === true;
    }
    return { typeId, open };
  } catch {
    return undefined;
  }
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

const VIEWS = new Map(); // block type -> whether it blocks a sightline (data/blocks.js blocksView)
const WALKS = new Map(); // block type -> walking room above a path (classifyBlock with open gates)
const PATHS = new Map(); // block type -> a path block (data/blocks.js isPathBlock)

// Sightline reader for visitors/sight.js: "clear", "blocked" or "unloaded". Never loads chunks (as blockReader: air
// is clear without its type read, liquids are told by type). `memo` (a Map) shares the answers between the sightlines
// of one check, which cross the same blocks many times.
export function viewReader(dimension, memo = undefined) {
  const read = (x, y, z) => {
    try {
      const block = dimension.getBlock({ x, y, z });
      if (!block) return "unloaded";
      if (block.isAir) return "clear";
      const typeId = block.typeId;
      let blocks = VIEWS.get(typeId);
      if (blocks === undefined) VIEWS.set(typeId, (blocks = blocksView(typeId, { isAir: false, isLiquid: LIQUID_TYPES.has(typeId) })));
      return blocks ? "blocked" : "clear";
    } catch {
      return "unloaded";
    }
  };
  if (!memo) return read;
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let v = memo.get(k);
    if (v === undefined) memo.set(k, (v = read(x, y, z)));
    return v;
  };
}

// Path reader for visitors/paths.js: "path" when the block is an allowlisted path block with two
// blocks of walking room above it, "other", or "unloaded". Never loads chunks. `memo` (a Map) keeps the loaded answers
// for one walk, which asks after the blocks beside a path from both sides (0.1.96); a block changed meanwhile makes the
// park walk again (network.js pathsDirty).
export function pathReader(dimension, memo = undefined) {
  const walkable = (x, y, z) => {
    const block = dimension.getBlock({ x, y, z });
    if (!block) return false;
    if (block.isAir) return true;
    const typeId = block.typeId;
    let walks = WALKS.get(typeId);
    if (walks === undefined) {
      const kind = classifyBlock(typeId, { isAir: false, isLiquid: LIQUID_TYPES.has(typeId), open: true });
      WALKS.set(typeId, (walks = kind === "air" || kind === "gate_open"));
    }
    return walks;
  };
  const read = (x, y, z) => {
    try {
      const block = dimension.getBlock({ x, y, z });
      if (!block) return "unloaded";
      const typeId = block.typeId;
      let path = PATHS.get(typeId);
      if (path === undefined) PATHS.set(typeId, (path = isPathBlock(typeId)));
      if (!path) return "other";
      return walkable(x, y + 1, z) && walkable(x, y + 2, z) ? "path" : "other";
    } catch {
      return "unloaded";
    }
  };
  if (!memo) return read;
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let v = memo.get(k);
    if (v === undefined) {
      v = read(x, y, z);
      if (v !== "unloaded") memo.set(k, v);
    }
    return v;
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

// Vanilla's minecraft:water_splash_particle reads variable.direction, a vector the engine sets when it splashes an
// entity; spawned by script without it the content log fills with "unable to find member variable .x" (0.1.107,
// Austin's log). Straight up, a little spread, so it reads as a splash.
export function splashVars() {
  const vars = new MolangVariableMap();
  vars.setVector3("variable.direction", { x: (Math.random() - 0.5) * 0.4, y: 1, z: (Math.random() - 0.5) * 0.4 });
  return vars;
}
