// The Melder in the world (0.1.315; the rules: residents/melderRules.js). Austin's NPC #27 spec: "Placeable and
// interactable block. Player opens its ingredient-mixing interface." The block holds an unseen store
// (zoocraft:melder_store, five slots in a row, the game's own screen with the Melder's own frame, as Han's Hanvil has):
// two things in its first two slots that are a recipe are joined into its last slot. Two that are no recipe stay as
// they are: nothing is made, taken or said. Hit twice, a Melder is picked up; what lies in it drops out.
// The Book of Melding is an item that opens one page: the defined recipes, read from the same list the Melder uses.
import { world, system, ItemStack } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { message, giveItem, onlinePlayers } from "../platform/mc.js";
import { parkAt, can, denyText } from "../park/park.js";
import { reportError } from "../core/log.js";
import { MELDER, MELDER_STORE, MELDER_TITLE, SLOT_IN, SLOTS_SHUT, SLOT_OUT, meldPlan, bookText } from "./melderRules.js";

const hits = new Map(); // player id -> { key, tick } of a first hit

const containerOf = (holder) => {
  try {
    return holder.getComponent("minecraft:inventory")?.container;
  } catch {
    return undefined;
  }
};

/** Gives a store its title and hides its nameplate (an unnamed store's screen reads "Unknown"; nothing may float over the block). */
export function nameStore(store) {
  try {
    if (!store?.isValid) return false;
    let changed = false;
    if (store.nameplateRenderDistance !== 0) {
      store.nameplateRenderDistance = 0;
      changed = true;
    }
    if (store.nameTag !== MELDER_TITLE) {
      store.nameTag = MELDER_TITLE;
      changed = true;
    }
    return changed;
  } catch {
    return false;
  }
}

/** The store entity of the Melder at a block position, or undefined. */
export function storeAt(dimension, pos) {
  try {
    return dimension.getEntities({ type: MELDER_STORE, location: { x: Math.floor(pos.x) + 0.5, y: Math.floor(pos.y) + 0.5, z: Math.floor(pos.z) + 0.5 }, maxDistance: 0.9 })[0];
  } catch {
    return undefined;
  }
}

/** The Melder block's store, made if it has none. */
export function ensureStore(block) {
  const have = storeAt(block.dimension, block.location);
  if (have) {
    nameStore(have);
    return have;
  }
  try {
    const made = block.dimension.spawnEntity(MELDER_STORE, block.bottomCenter());
    nameStore(made);
    return made;
  } catch {
    return undefined; // the chunk went away: the next use makes it
  }
}

/** Everything in a Melder dropped where it stands (nothing is deleted). */
export function dropAll(store) {
  const c = containerOf(store);
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

/** What was put in the two covered slots goes back to the player (or drops at their feet). */
function clearShut(store, player) {
  const c = containerOf(store);
  if (!c) return;
  for (const i of SLOTS_SHUT) {
    const it = c.getItem(i);
    if (!it) continue;
    c.setItem(i, undefined);
    let left = it;
    try {
      left = containerOf(player)?.addItem(it);
    } catch {
      left = it;
    }
    const by = player?.isValid ? player : store;
    if (left) by.dimension.spawnItem(left, by.location);
  }
}

const rec = (it) => (it ? { typeId: it.typeId, amount: it.amount } : undefined);

/** One look at what lies in a Melder: a recipe in its first two slots is joined into its last. Returns what happened (for the test server). */
export function workStore(store) {
  const c = containerOf(store);
  if (!c) return "none";
  const a = c.getItem(SLOT_IN[0]);
  const b = c.getItem(SLOT_IN[1]);
  if (!a || !b) return "waiting";
  const out = c.getItem(SLOT_OUT);
  const plan = meldPlan(rec(a), rec(b), rec(out));
  if (!plan) return "nothing";
  for (const [slot, it] of [[SLOT_IN[0], a], [SLOT_IN[1], b]]) {
    if (it.amount <= plan.batches) c.setItem(slot, undefined);
    else {
      it.amount -= plan.batches;
      c.setItem(slot, it);
    }
  }
  c.setItem(SLOT_OUT, new ItemStack(plan.meld.result, (out?.amount ?? 0) + plan.made));
  return plan.meld.id;
}

/** Twice a second: each Melder near a player is looked at; a store whose block is gone gives back what it holds and goes. */
export function tickMelders() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let stores;
    try {
      stores = player.dimension.getEntities({ type: MELDER_STORE, location: player.location, maxDistance: 7 });
    } catch {
      continue;
    }
    for (const store of stores) {
      if (seen.has(store.id)) continue;
      seen.add(store.id);
      try {
        const block = store.dimension.getBlock(store.location);
        if (!block) continue;
        if (block.typeId !== MELDER) {
          dropAll(store);
          store.remove();
          continue;
        }
        nameStore(store);
        clearShut(store, player);
        workStore(store);
      } catch (error) {
        reportError("melder", error);
      }
    }
  }
}

/** Picks a Melder up: what lies in it drops, the block comes back as its item. */
export function pickUp(store, player) {
  const pos = { x: Math.floor(store.location.x), y: Math.floor(store.location.y), z: Math.floor(store.location.z) };
  const park = parkAt(store.dimension.id, pos);
  if (park && !can(player, "build", park)) return message(player, denyText("build", park));
  const block = store.dimension.getBlock(pos);
  dropAll(store);
  store.remove();
  if (block?.typeId === MELDER) {
    block.setType("minecraft:air");
    giveItem(player, MELDER, 1);
  }
  message(player, "§bMelder: §fpicked up.");
}

/** The block's own hooks: a Melder set down gets its store; one used while it has none gets it then. */
export function melderComponent() {
  return {
    onPlace(e) {
      ensureStore(e.block);
    },
    onPlayerInteract(e) {
      const block = e.block;
      system.run(() => {
        try {
          if (block.isValid && block.typeId === MELDER) ensureStore(block);
        } catch (error) {
          reportError("melder use", error);
        }
      });
    },
  };
}

/** The Book of Melding: one page, the defined recipes. */
export function meldingBookComponent() {
  return {
    onUse(e) {
      const player = e.source;
      if (!player) return;
      system.run(() => {
        try {
          player.playSound("item.book.page_turn", { volume: 1, pitch: 0.9 });
          new ActionFormData().title("Book of Melding").body(bookText()).button("Close").show(player).catch(() => {});
        } catch (error) {
          reportError("melding book", error);
        }
      });
    },
  };
}

/** The world events the Melder needs: a store is named as it loads; two hits pick a Melder up. */
export function wireMelder() {
  world.afterEvents.entityLoad.subscribe((e) => {
    if (e.entity?.typeId === MELDER_STORE) nameStore(e.entity);
  });
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const store = e.hitEntity;
    const player = e.damagingEntity;
    if (store?.typeId !== MELDER_STORE || player?.typeId !== "minecraft:player" || !store.isValid) return;
    try {
      const key = `${store.dimension.id}|${store.id}`;
      const tick = system.currentTick;
      const first = hits.get(player.id);
      if (!first || first.key !== key || tick - first.tick > 60) {
        hits.set(player.id, { key, tick });
        message(player, "§7Hit it again to pick the Melder up. What lies in it drops out.");
        return;
      }
      hits.delete(player.id);
      pickUp(store, player);
    } catch (error) {
      reportError("melder hit", error);
    }
  });
}

/** For the test server: what lies in a Melder. */
export function melderDebug(store) {
  const c = containerOf(store);
  const list = [];
  for (let i = 0; c && i < c.size; i++) {
    const it = c.getItem(i);
    if (it) list.push(`${i}:${it.typeId.replace("minecraft:", "")} x${it.amount}`);
  }
  return list;
}
