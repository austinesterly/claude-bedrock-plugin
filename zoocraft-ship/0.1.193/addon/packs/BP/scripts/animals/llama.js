import { world, ItemStack } from "@minecraft/server";
import { SPECIES } from "../data/species.js";
import { onlinePlayers, heldItem, giveItem } from "../platform/mc.js";
import { animalFromEntity, saveAnimal } from "./animals.js";
import { DECOR, CARPETS, carpetItem } from "./llamaRules.js";

// Llamas and trader llamas in the world (0.1.193; rules in llamaRules.js). A carpet used on a grown zoo one dresses it (the
// copy's own interact sets zoocraft:decor and takes the carpet); here the record keeps it, so a respawned one wears it
// again, and one carpet over another hands the first back. Shears used on a dressed one (the copy's interact fires
// zoocraft:undress, the property unchanged): the carpet goes back to whoever used them (or drops beside it), and the
// property is cleared.

const EVENTS = [...CARPETS.map((_, i) => `zoocraft:decor_${i + 1}`), "zoocraft:undress"];

// The nearest player within 7 blocks holding `item` (the one who used it: the event doesn't say).
function user(e, test) {
  let near;
  let best = 49;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== e.dimension.id || !test(heldItem(p)?.typeId)) continue;
    const d = (p.location.x - e.location.x) ** 2 + (p.location.y - e.location.y) ** 2 + (p.location.z - e.location.z) ** 2;
    if (d < best) {
      best = d;
      near = p;
    }
  }
  return near;
}

export function initLlamas() {
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const e = ev.entity;
      const a = e.isValid ? animalFromEntity(e) : undefined;
      if (!a) return;
      if (ev.eventId === "zoocraft:undress") {
        let n = 0;
        try {
          n = Number(e.getProperty(DECOR) ?? 0);
          e.setProperty(DECOR, 0);
        } catch {
          return;
        }
        a.decor = 0;
        saveAnimal(a);
        const item = carpetItem(n);
        if (!item) return;
        const p = user(e, (t) => t === "minecraft:shears");
        try {
          if (p) {
            giveItem(p, item, 1);
            p.onScreenDisplay.setActionBar(`§aYou take the ${CARPETS[n - 1]} carpet off ${a.name}.`);
          } else e.dimension.spawnItem(new ItemStack(item, 1), e.location);
        } catch {
          // gone
        }
        return;
      }
      const n = Number(ev.eventId.split("_").pop());
      // One carpet over another (the game swaps them): the one it wore comes back (the test server: it was lost).
      const was = a.decor && a.decor !== n ? carpetItem(a.decor) : undefined;
      a.decor = n;
      saveAnimal(a);
      try {
        const p = user(e, (t) => Boolean(t?.endsWith("_carpet")) || t === undefined);
        if (was && p) giveItem(p, was, 1);
        else if (was) e.dimension.spawnItem(new ItemStack(was, 1), e.location);
        p?.onScreenDisplay.setActionBar(`§aYou dress ${a.name} in the ${CARPETS[n - 1]} carpet.`);
      } catch {
        // gone
      }
    },
    { entityTypes: Object.values(SPECIES).filter((s) => s.decor).map((s) => s.entityType), eventTypes: EVENTS },
  );
}
