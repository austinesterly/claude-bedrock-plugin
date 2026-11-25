// The Diamond-Plated Shulker Box (0.1.386): the Rabbit King's prize.
// Austin, 25 Nov 2026: "the shulker box wasnt even diamond plated, you cheated and used a light blue one. I need it
// like a diamond block almost, it will have to be custom".
//
// A block of its own that looks like a diamond block with a shulker's lid. Its 27 slots are in an unseen entity inside
// it (zoocraft:diamond_shulker_store), which opens as a chest does when it is used. Like a shulker box it keeps what
// is in it when it is picked up: two hits pack the store away as a saved structure named by an id, and the id rides
// on the item (the item never stacks). Setting the box down again brings the same store back with everything in it.
// Should the packing ever fail, everything drops out instead: nothing is lost.
import { world, system, ItemStack, EquipmentSlot, GameMode, StructureSaveMode } from "@minecraft/server";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { newId, posKey } from "../core/ids.js";
import { secondHit } from "../disposery/disposeryRules.js";

export const BOX_BLOCK = "zoocraft:diamond_shulker";
export const BOX_STORE = "zoocraft:diamond_shulker_store";
export const BOX_KEY = "zoocraft:box";
export const BOX_SLOTS = 27;

const pending = new Map(); // where a box is being set down -> the id its item carried
const hits = new Map(); // player id -> { key, tick }: the first of two hits
let lastPacked; // for the bench

/** The saved structure's name for a box id. */
export const structureOf = (id) => `zoocraft:${id}`;
/** What a packed box's item says under its name. */
export const boxLore = (stacks) => [`§r§7Holds ${stacks} ${stacks === 1 ? "stack" : "stacks"}`];

const cell = (pos) => ({ x: Math.floor(pos.x), y: Math.floor(pos.y), z: Math.floor(pos.z) });

/** The store of the box at a block position, or undefined. */
export function boxStoreAt(dimension, pos) {
  try {
    return dimension.getEntities({ type: BOX_STORE, location: { x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y) + 0.5, z: Math.floor(pos.z) + 0.5 }, maxDistance: 0.9 })[0];
  } catch {
    return undefined;
  }
}

/** The box block's store, made if it has none. */
export function ensureBoxStore(block) {
  const have = boxStoreAt(block.dimension, block.location);
  if (have) return have;
  try {
    return block.dimension.spawnEntity(BOX_STORE, block.bottomCenter());
  } catch {
    return undefined; // the chunk went away: the next use makes it
  }
}

export const boxContainer = (store) => {
  try {
    return store?.isValid ? store.getComponent("minecraft:inventory")?.container : undefined;
  } catch {
    return undefined;
  }
};

function dropAll(store) {
  const c = boxContainer(store);
  if (!c) return 0;
  let n = 0;
  const at = { x: store.location.x, y: store.location.y + 1.1, z: store.location.z };
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    store.dimension.spawnItem(it, at);
    c.setItem(i, undefined);
    n++;
  }
  return n;
}

/**
 * Packs a store away and returns the box item that carries it. An empty box is a plain item. If the world will not
 * save it, everything drops out and the item is a plain one.
 */
export function packBox(store) {
  const item = new ItemStack(BOX_BLOCK, 1);
  const c = boxContainer(store);
  const stacks = c ? c.size - c.emptySlotsCount : 0;
  if (stacks === 0) return item;
  const id = newId("dbox");
  try {
    const at = cell(store.location);
    world.structureManager.createFromWorld(structureOf(id), store.dimension, at, at, { includeBlocks: false, includeEntities: true, saveMode: StructureSaveMode.World });
    if (!world.structureManager.get(structureOf(id))) throw new Error("the box was not saved");
    item.setDynamicProperty(BOX_KEY, id);
    item.setLore(boxLore(stacks));
    lastPacked = id;
  } catch (error) {
    reportError("diamond box pack", error);
    try {
      world.structureManager.delete(structureOf(id));
    } catch {
      // nothing was saved
    }
    dropAll(store);
    return new ItemStack(BOX_BLOCK, 1);
  }
  return item;
}

/** Brings a packed store back into the box block just set down; a new empty store when there is nothing to bring. */
export function unpackBox(block, id) {
  const d = block.dimension;
  const at = cell(block.location);
  let placed = false;
  try {
    if (id && world.structureManager.get(structureOf(id))) {
      world.structureManager.place(structureOf(id), d, at, { includeBlocks: false, includeEntities: true });
      placed = true;
    }
  } catch (error) {
    reportError("diamond box unpack", error);
  }
  system.runTimeout(() => {
    try {
      const b = d.getBlock(at);
      if (b?.typeId !== BOX_BLOCK) return;
      const store = boxStoreAt(d, at);
      if (store && placed) world.structureManager.delete(structureOf(id)); // it is back in the world: the copy goes
      if (!store) ensureBoxStore(b);
    } catch (error) {
      reportError("diamond box unpack", error);
    }
  }, 2);
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

/** Picks a box up: its store is packed onto the item, the block goes, the item lies where it stood. */
export function pickUpBox(store) {
  const d = store.dimension;
  const at = cell(store.location);
  const item = packBox(store);
  try {
    store.remove();
    const block = d.getBlock(at);
    if (block?.typeId === BOX_BLOCK) block.setType("minecraft:air");
    d.spawnItem(item, { x: at.x + 0.5, y: at.y + 0.3, z: at.z + 0.5 });
  } catch (error) {
    reportError("diamond box pick up", error);
  }
}

/** The box block's own hooks. */
export function diamondBoxComponent() {
  return {
    beforeOnPlayerPlace(e) {
      try {
        const held = e.player?.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
        const id = held?.typeId === BOX_BLOCK ? held.getDynamicProperty(BOX_KEY) : undefined;
        const key = posKey(e.block.dimension.id, e.block.location);
        if (typeof id === "string" && !(e.player && creative(e.player) && !world.structureManager.get(structureOf(id)))) pending.set(key, id);
        else pending.delete(key);
      } catch {
        // an empty box then
      }
    },
    onPlace(e) {
      const key = posKey(e.block.dimension.id, e.block.location);
      const id = pending.get(key);
      pending.delete(key);
      if (id) unpackBox(e.block, id);
      else ensureBoxStore(e.block);
    },
    onPlayerBreak(e) {
      // (a creative player breaks the block itself; everyone else's hits land on the store)
      const store = boxStoreAt(e.block.dimension, e.block.location);
      if (!store) return;
      const at = cell(store.location);
      const item = packBox(store);
      store.remove();
      if (item.getDynamicProperty(BOX_KEY)) e.block.dimension.spawnItem(item, { x: at.x + 0.5, y: at.y + 0.3, z: at.z + 0.5 });
    },
  };
}

/** The world events the box needs: a use opens it (sneaking empties it out), two hits pick it up. */
export function wireDiamondBox() {
  world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    if (e.target.typeId !== BOX_STORE) return;
    const player = e.player;
    const store = e.target;
    let block;
    try {
      block = store.dimension.getBlock(store.location);
    } catch {
      block = undefined;
    }
    const orphan = block && block.typeId !== BOX_BLOCK; // its block is gone (a command, say)
    if (!orphan && !player.isSneaking) return; // it opens like a chest
    e.cancel = true;
    system.run(() => {
      if (!store.isValid) return;
      const n = dropAll(store);
      if (orphan) store.remove();
      else message(player, n ? "§7You tip the box out: everything in it lies on top." : "§7The box is empty.");
    });
  });
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const store = e.hitEntity;
    const player = e.damagingEntity;
    if (store?.typeId !== BOX_STORE || player?.typeId !== "minecraft:player" || !store.isValid) return;
    const key = posKey(store.dimension.id, store.location);
    const tick = system.currentTick;
    if (!secondHit(hits.get(player.id), key, tick)) {
      hits.set(player.id, { key, tick });
      return message(player, "§7Hit it again to pick the box up. What is in it stays in it.");
    }
    hits.delete(player.id);
    pickUpBox(store);
  });
}

/** For the bench: `pack` picks up the box at a place, `unpack` sets one down there from the last one packed. */
export function boxDebug(dimension, pos, what) {
  const at = cell(pos);
  if (what === "pack") {
    const s = boxStoreAt(dimension, at);
    if (s) pickUpBox(s);
  }
  if (what === "unpack") {
    const b = dimension.getBlock(at);
    b.setType(BOX_BLOCK);
    pending.delete(posKey(dimension.id, at));
    system.run(() => {
      for (const s of dimension.getEntities({ type: BOX_STORE, location: { x: at.x + 0.5, y: at.y + 0.5, z: at.z + 0.5 }, maxDistance: 0.9 })) s.remove(); // the one onPlace made
      unpackBox(dimension.getBlock(at), lastPacked);
    });
  }
  const s = boxStoreAt(dimension, at);
  const c = boxContainer(s);
  let items = 0;
  if (c) for (let i = 0; i < c.size; i++) items += c.getItem(i)?.amount ?? 0;
  let saved;
  try {
    saved = lastPacked ? Boolean(world.structureManager.get(structureOf(lastPacked))) : undefined;
  } catch (error) {
    saved = String(error);
  }
  return { block: dimension.getBlock(at)?.typeId, stores: dimension.getEntities({ type: BOX_STORE }).length, slots: c ? c.size - c.emptySlotsCount : -1, items, lastPacked, saved };
}
