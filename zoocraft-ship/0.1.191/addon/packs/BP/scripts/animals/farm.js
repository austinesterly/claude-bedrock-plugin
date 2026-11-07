import { world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { parkTime, parkOfRecord } from "../park/park.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { allAnimals, animalFromEntity, animalsIn, liveEntity, saveAnimal } from "./animals.js";
import { grassNeeded, hasGrass } from "./zebraRules.js";
import { woolBack } from "./farmRules.js";
import { LIGHTNING_EVENTS } from "./mooshroomRules.js";

// The farmyard four in the world (0.1.168; rules in farmRules.js). Shearing and milking are the game's own (the zoo copies
// keep the vanilla interact: shears give wool of the sheep's colour, a bucket on a cow fills with milk) and so are the
// eggs (minecraft:spawn_entity). The script keeps a sheared sheep's record: when it was shorn, so the wool grows back a
// park day later with its grass, and a sheep that's spawned again (moved, grown up, loaded) comes back as it was.

const SHEARED = "zoocraft:on_sheared"; // the zoo sheep's interact event (entities/zoo_sheep.json)

function grows(species) {
  return Boolean(species?.products?.includes("wool"));
}

export function initFarm() {
  // Shorn: the record keeps when (in its park's time).
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const a = ev.entity.isValid ? animalFromEntity(ev.entity) : undefined;
      if (!a) return;
      const ex = a.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
      a.shornAt = parkTime(parkOfRecord(ex) ?? undefined);
      saveAnimal(a);
    },
    { entityTypes: Object.values(SPECIES).filter(grows).map((s) => s.entityType), eventTypes: [SHEARED] },
  );
  // Mooshrooms (0.1.191): a lightning strike near one swaps red and brown (the copy's own events, from the game's): the
  // record takes the new colour, so it keeps it when it's spawned again (moved, grown up, loaded).
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const a = ev.entity.isValid ? animalFromEntity(ev.entity) : undefined;
      const coat = LIGHTNING_EVENTS[ev.eventId];
      if (!a || coat === undefined || a.coat === coat) return;
      a.coat = coat;
      saveAnimal(a);
    },
    { entityTypes: Object.values(SPECIES).filter((s) => s.mycelium).map((s) => s.entityType), eventTypes: Object.keys(LIGHTNING_EVENTS) },
  );
}

// Every few seconds: wool grows back where it's time (the record), and each loaded sheep looks as its record says.
export function tickFarm() {
  for (const a of allAnimals()) {
    const species = SPECIES[a.speciesId];
    if (!grows(species) || a.location.kind !== "exhibit") continue;
    const ex = getExhibit(a.location.id);
    if (!ex) continue;
    if (a.shornAt !== undefined) {
      const flock = animalsIn(ex).filter((b) => b.speciesId === a.speciesId);
      const grassy = species.graze ? hasGrass(ex.grassCells, grassNeeded(flock, species.graze, BALANCE.breeding.juvenileWeight)) : true;
      if (woolBack(a.shornAt, parkTime(parkOfRecord(ex) ?? undefined), grassy, BALANCE.farm.woolDays, BALANCE.clock.dayLength)) {
        delete a.shornAt;
        saveAnimal(a);
      }
    }
    const e = liveEntity(a.id);
    if (!e) continue;
    try {
      const sheared = Boolean(e.getComponent("minecraft:is_sheared"));
      if (sheared !== (a.shornAt !== undefined)) e.triggerEvent(sheared ? "zoocraft:wool_back" : "zoocraft:shorn");
    } catch {
      // gone
    }
  }
}
