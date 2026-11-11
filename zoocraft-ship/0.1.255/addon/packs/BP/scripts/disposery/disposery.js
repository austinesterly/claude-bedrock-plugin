// The two Disposeries in the world (0.1.245; rules and words: disposeryRules.js).
//
// The Disposery block holds its items in an unseen entity inside it (zoocraft:disposery_store, 27 slots). The block is a
// bin 14 of 16 wide and high and the entity's box is 0.95, so the entity stands proud of the bin without reaching into
// the blocks beside it (a wider one stops building there: measured). A use opens the game's own chest screen (in the Disposery's colour: RP
// ui/chest_screen.json, by the screen's title) and a hit lands on it too. Sneak and use opens the Dispose page instead.
// Picking the block up takes two hits, and what's inside drops out first. A store that lost its block drops what it
// holds and goes; a block that lost its store gets a new one the next time it's used.
//
// The Portable Disposery's holding slots are the player's own inventory slots, marked on its page: an item held there
// never leaves the inventory until Dispose, so closing the page can't lose it.
import { world, system, GameMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { show } from "../ui/forms.js";
import { message } from "../platform/mc.js";
import { DISPOSERY, TEXT, snapshot, unchanged, totals, itemCount, canHold, toggled, stillHeld, secondHit } from "./disposeryRules.js";

const hits = new Map(); // player id -> { key, tick }: the first of two hits
const hinted = new Set(); // player ids told how to Dispose, this session

/** Gives a store its name tag (0.1.255: the chest screen's title). Returns whether it had to. */
export function nameStore(store) {
  try {
    if (!store?.isValid || store.nameTag === DISPOSERY.title) return false;
    store.nameTag = DISPOSERY.title;
    return true;
  } catch {
    return false;
  }
}

const blockCenter = (b) => ({ x: b.x + 0.5, y: b.y + 0.5, z: b.z + 0.5 });
const keyOf = (dimension, pos) => `${dimension.id}|${Math.floor(pos.x)}|${Math.floor(pos.y)}|${Math.floor(pos.z)}`;

/** The store entity of the Disposery at a block position, or undefined. */
export function storeAt(dimension, pos) {
  try {
    return dimension.getEntities({ type: DISPOSERY.store, location: { x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y) + 0.5, z: Math.floor(pos.z) + 0.5 }, maxDistance: 0.9 })[0];
  } catch {
    return undefined;
  }
}

/** The Disposery block's store, made if it has none. */
export function ensureStore(block) {
  const have = storeAt(block.dimension, block.location);
  if (have) {
    nameStore(have);
    return have;
  }
  try {
    const made = block.dimension.spawnEntity(DISPOSERY.store, block.bottomCenter());
    nameStore(made);
    return made;
  } catch {
    return undefined; // the chunk went away: the next use makes it
  }
}

const containerOf = (holder) => {
  try {
    return holder?.isValid ? holder.getComponent("minecraft:inventory")?.container : undefined;
  } catch {
    return undefined;
  }
};

/** A container's slots as a list (item or undefined). */
export function slotsOf(container) {
  const out = [];
  for (let i = 0; container && i < container.size; i++) out.push(container.getItem(i));
  return out;
}

/** Everything in a store dropped where it stands (nothing is deleted). Returns how many stacks dropped. */
export function dropAll(store) {
  const c = containerOf(store);
  if (!c) return 0;
  let n = 0;
  const at = { x: store.location.x, y: store.location.y + 0.6, z: store.location.z };
  for (let i = 0; i < c.size; i++) {
    const it = c.getItem(i);
    if (!it) continue;
    store.dimension.spawnItem(it, at);
    c.setItem(i, undefined);
    n++;
  }
  return n;
}

/** Deletes exactly a snapshot's slots, and only if each still holds what the page listed. Returns the items deleted, or undefined. */
export function disposeOf(container, snap) {
  if (!container || !snap.length || !unchanged(snap, slotsOf(container))) return undefined;
  for (const s of snap) container.setItem(s.slot, undefined);
  return itemCount(snap);
}

const itemText = (t) => (t.name ? [{ text: `${t.amount} x ${t.name}` }] : [{ text: `${t.amount} x ` }, { translate: t.lkey ?? t.typeId }]);

/** The Dispose page both Disposeries share: what will go, the warning, and the Dispose button. Resolves true on Dispose. */
async function confirmDispose(player, title, snap) {
  const kinds = totals(snap);
  /** @type {import("@minecraft/server").RawMessage[]} */
  const rawtext = [{ text: `§c${TEXT.warn}§r\n\n` }];
  kinds.slice(0, DISPOSERY.listMax).forEach((t) => rawtext.push(...itemText(t), { text: "\n" }));
  if (kinds.length > DISPOSERY.listMax) rawtext.push({ text: `and ${kinds.length - DISPOSERY.listMax} more kinds\n` });
  const n = itemCount(snap);
  const form = new ActionFormData().title(title).body({ rawtext }).button(`§4Dispose\n§8Delete ${n} item${n === 1 ? "" : "s"} for good`).button("Keep them\n§8Nothing is deleted");
  const r = await show(player, form);
  return r?.selection === 0;
}

/** Sneak and use on a Disposery: its Dispose page. */
export async function openDispose(player, store) {
  const c = containerOf(store);
  if (!c) return;
  const snap = snapshot(slotsOf(c));
  if (!snap.length) return message(player, `§7${TEXT.empty}`);
  if (!(await confirmDispose(player, "Disposery", snap))) return message(player, TEXT.kept);
  const n = disposeOf(containerOf(store), snap);
  message(player, n === undefined ? TEXT.changed : TEXT.done(n));
}

/** Using the Portable Disposery: hold or take back inventory stacks, then Dispose. */
export async function openPortable(player) {
  let held = new Set();
  for (;;) {
    const c = containerOf(player);
    if (!c) return;
    const slots = slotsOf(c);
    held = stillHeld(held, slots);
    const snap = snapshot(slots, held);
    const n = itemCount(snap);
    const form = new ActionFormData()
      .title("Portable Disposery")
      .body(`Press what you don't want to hold it here; press it again to take it back. Nothing is deleted until you press Dispose, and closing this keeps everything.\n\nHeld: ${held.size ? `${n} item${n === 1 ? "" : "s"} in ${held.size} stack${held.size === 1 ? "" : "s"}` : "nothing"}`)
      .button(held.size ? `§4Dispose\n§8Shows what will go first` : "§8Dispose\n§8Nothing is held yet")
      .button("Close\n§8Keeps everything");
    const rows = [];
    slots.forEach((it, slot) => {
      if (!canHold(it)) return;
      rows.push(slot);
      const mark = held.has(slot) ? "§2[Held] §r" : "";
      form.button(it.nameTag ? `${mark}${it.amount} x ${it.nameTag}` : { rawtext: [{ text: `${mark}${it.amount} x ` }, { translate: it.localizationKey }] });
    });
    const r = await show(player, form);
    if (r?.selection === undefined || r.selection === 1) return;
    if (r.selection >= 2) {
      held = toggled(held, rows[r.selection - 2]);
      continue;
    }
    if (!held.size) {
      message(player, `§7${TEXT.nothingHeld}`);
      continue;
    }
    if (!(await confirmDispose(player, "Portable Disposery", snap))) continue; // back to the page, everything still held
    const gone = disposeOf(containerOf(player), snap);
    message(player, gone === undefined ? TEXT.changed : TEXT.done(gone));
    if (gone !== undefined) return;
    held = new Set();
  }
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

/** Picks a Disposery up: what's inside drops out, the block drops as its item (not in Creative), the store goes. */
export function pickUp(store, player) {
  const dimension = store.dimension;
  const pos = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  dropAll(store);
  try {
    const block = dimension.getBlock(pos);
    if (block?.typeId === DISPOSERY.block) {
      if (player && creative(player)) block.setType("minecraft:air");
      else dimension.runCommand(`setblock ${pos.x} ${pos.y} ${pos.z} air destroy`);
    }
  } catch {
    // the block is out of reach: the store still goes, and its items are already out
  }
  store.remove();
}

/** What a use of a store does: "chest" (the game's chest screen), "dispose" (sneaking: its Dispose page) or "orphan" (its block is gone). */
export function useOf(store, sneaking) {
  let block;
  try {
    block = store.dimension.getBlock(store.location);
  } catch {
    block = undefined; // out of reach: leave it be
  }
  if (block && block.typeId !== DISPOSERY.block) return "orphan";
  return sneaking ? "dispose" : "chest";
}

/** A store whose block is gone (a command, say) gives back what it holds and goes. */
export function clearOrphan(store) {
  if (!store.isValid) return;
  dropAll(store);
  store.remove();
}

/** The Disposery block's own hooks. The store takes uses and hits while it's there; these cover the times it isn't. */
export function disposeryComponent() {
  return {
    onPlace(e) {
      ensureStore(e.block);
    },
    onPlayerInteract(e) {
      if (!storeAt(e.block.dimension, e.block.location) && ensureStore(e.block) && e.player) message(e.player, TEXT.ready);
    },
    onPlayerBreak(e) {
      const store = storeAt(e.block.dimension, e.block.location);
      if (!store) return;
      dropAll(store);
      store.remove();
    },
  };
}

/** The Portable Disposery's use. */
export function portableComponent() {
  return {
    onUse(e) {
      const player = e.source;
      if (player?.typeId === "minecraft:player") system.run(() => openPortable(player));
    },
  };
}

/** The world events the Disposery needs: sneak and use, and the two hits that pick it up. */
export function wireDisposery() {
  world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
    if (e.target.typeId !== DISPOSERY.store) return;
    const player = e.player;
    const store = e.target;
    const use = useOf(store, player.isSneaking);
    if (use === "chest") {
      // a plain use: the chest screen. A store from before 0.1.255 gets its name for the next opening, and the
      // player is told once how to Dispose.
      const first = !hinted.has(player.id);
      hinted.add(player.id);
      if (first || store.nameTag !== DISPOSERY.title) {
        system.run(() => {
          nameStore(store);
          if (first && player.isValid) message(player, TEXT.hint);
        });
      }
      return;
    }
    e.cancel = true;
    system.run(() => (use === "orphan" ? clearOrphan(store) : store.isValid && openDispose(player, store)));
  });
  // Stores placed before 0.1.255 have no name: name the ones near players, so the first opening is right too.
  system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
      try {
        for (const store of player.dimension.getEntities({ type: DISPOSERY.store, location: player.location, maxDistance: DISPOSERY.sweepRange })) nameStore(store);
      } catch {
        // the player left this tick
      }
    }
  }, DISPOSERY.sweepTicks);
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const store = e.hitEntity;
    const player = e.damagingEntity;
    if (store?.typeId !== DISPOSERY.store || player?.typeId !== "minecraft:player" || !store.isValid) return;
    const key = keyOf(store.dimension, store.location);
    const tick = system.currentTick;
    if (!secondHit(hits.get(player.id), key, tick)) {
      hits.set(player.id, { key, tick });
      return message(player, TEXT.hitOnce);
    }
    hits.delete(player.id);
    pickUp(store, player);
  });
}
