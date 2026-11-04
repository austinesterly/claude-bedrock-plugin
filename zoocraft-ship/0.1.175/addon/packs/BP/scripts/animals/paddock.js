import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { db } from "../persistence/db.js";
import { parkTime, parkOfRecord } from "../park/park.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { onlinePlayers, heldItem } from "../platform/mc.js";
import { allAnimals, animalFromEntity, liveEntity, saveAnimal } from "./animals.js";
import { keptBy } from "./farmRules.js";
import { ACT, hasRun, nextAct } from "./paddockRules.js";

// Horses and donkeys in the world (0.1.175; rules in paddockRules.js). The game walks them; this script now and then
// stops one on grass to graze (zoocraft:graze: still, head down) or, with the run its paddock needs, lets one gallop round
// it a while (zoocraft:gallop: the game's stroll at a gallop), telling the client through zoocraft:act. A brush used on
// one (its interact fires zoocraft:groomed) is kept on its record: when it was groomed, in its park's time.

const GROOMED = "zoocraft:groomed";
const acts = new Map(); // animal id -> { act, until } (game ticks)

function inPaddock(species) {
  return Boolean(species?.run || species?.groom);
}

export function initPaddock() {
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const e = ev.entity;
      const a = e.isValid ? animalFromEntity(e) : undefined;
      if (!a) return;
      const ex = a.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
      a.groomedAt = parkTime(parkOfRecord(ex) ?? undefined);
      saveAnimal(a);
      // Whoever brushed it: the nearest player holding a brush.
      let near;
      let best = 49;
      for (const p of onlinePlayers()) {
        if (p.dimension.id !== e.dimension.id || heldItem(p)?.typeId !== "minecraft:brush") continue;
        const d = (p.location.x - e.location.x) ** 2 + (p.location.y - e.location.y) ** 2 + (p.location.z - e.location.z) ** 2;
        if (d < best) {
          best = d;
          near = p;
        }
      }
      try {
        near?.onScreenDisplay.setActionBar(`§aYou groom ${a.name}: it leans into the brush.`);
      } catch {
        // gone
      }
    },
    { entityTypes: Object.values(SPECIES).filter(inPaddock).map((s) => s.entityType), eventTypes: [GROOMED] },
  );
}

function setAct(e, act) {
  try {
    if (e.getProperty("zoocraft:act") !== act) e.setProperty("zoocraft:act", act);
    e.triggerEvent(act === ACT.graze ? "zoocraft:graze" : act === ACT.gallop ? "zoocraft:gallop" : "zoocraft:settle");
  } catch {
    // gone
  }
}

// Every second: each loaded horse and donkey in a paddock goes on grazing, galloping or its own life.
export function tickPaddock() {
  const now = system.currentTick;
  const b = BALANCE.paddock;
  const live = new Set();
  const staff = db.all("staff");
  for (const a of allAnimals()) {
    const species = SPECIES[a.speciesId];
    if (!inPaddock(species) || a.location.kind !== "exhibit") continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    live.add(a.id);
    const s = acts.get(a.id) ?? { act: ACT.life, until: 0 };
    if (s.act !== ACT.life && now >= s.until) {
      s.act = ACT.life;
      setAct(e, ACT.life);
    }
    const ex = getExhibit(a.location.id);
    if (!ex) continue;
    let onGrass = false;
    let inWater = false;
    try {
      inWater = e.isInWater;
      const l = e.location;
      onGrass = e.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y) - 1, z: Math.floor(l.z) })?.typeId === "minecraft:grass_block";
    } catch {
      continue;
    }
    const next = nextAct({ act: s.act, grown: !a.juvenile, run: hasRun(species, ex) && ex.runLength !== undefined, inWater, onGrass, gallopFactor: species.run?.gallop ?? 1 }, b, Math.random(), Math.random());
    if (next) {
      s.act = next.act;
      s.until = now + next.ticks[0] + Math.floor(Math.random() * (next.ticks[1] - next.ticks[0]));
      setAct(e, next.act);
    }
    acts.set(a.id, s);
    // A keeper on the paddock's round grooms them every park day.
    if (species.groom && keptBy(staff, ex.id)) {
      const t = parkTime(parkOfRecord(ex) ?? undefined);
      if (a.groomedAt === undefined || t - a.groomedAt >= BALANCE.clock.dayLength) {
        a.groomedAt = t;
        saveAnimal(a);
      }
    }
  }
  for (const id of acts.keys()) if (!live.has(id)) acts.delete(id);
}
