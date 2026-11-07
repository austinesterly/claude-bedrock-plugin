import { ItemStack } from "@minecraft/server";
import { onlinePlayers, entitiesNear } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity, saveAnimal } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { OXIDATION, WAXED, STATUE, POSE, FLOWER, stageIndex, copperChange } from "./golemRules.js";
import { reportError } from "../core/log.js";

// Copper golems in the game (0.1.195; the rules are animals/golemRules.js, research/vanilla_plan.md "0.1.195 iron, snow
// and copper golems: the design"). The copy keeps the game's oxidising (its timer, a stage about every 7 hours of play),
// waxing (a honeycomb), scraping (an axe, or lightning), its chests (transport_items) and the poppy an iron golem holds out
// (take_flower). The game's statue is a block that takes the golem's place; the zoo's is the copy itself, standing still
// in one of the game's four poses (its zoocraft:statue and zoocraft:pose), so it stays on the zoo's books.
// Here, every second, the zoo copper golems near players: their record follows their copper (its stage is the record's
// coat, so a respawned one gets it back), whether they're waxed, a statue and its pose, and the poppy; one that just
// turned into a statue drops its poppy (the game's statue does), and the players near are told.

const TYPES = Object.values(SPECIES).filter((s) => s.copper).map((s) => s.entityType);
const reported = new Set();

function tell(error) {
  const why = String(error);
  if (reported.has(why) || reported.size > 20) return;
  reported.add(why);
  reportError("copperGolem", error);
}

function near(e, text) {
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id === e.dimension.id && Math.hypot(p.location.x - e.location.x, p.location.z - e.location.z) < 24) p.sendMessage(text);
    } catch {
      // gone
    }
  }
}

function sync(e) {
  const a = animalFromEntity(e);
  if (!a || a.location.kind !== "exhibit") return;
  const seen = { coat: stageIndex(e.getProperty(OXIDATION)), waxed: e.getProperty(WAXED) === true, statue: e.getProperty(STATUE) === true, pose: Number(e.getProperty(POSE) ?? 0), flower: e.getProperty(FLOWER) === true };
  const change = copperChange(a, seen);
  if (!change.changed) return;
  if (change.dropFlower) {
    // The game's statue drops the poppy it wore.
    try {
      e.dimension.spawnItem(new ItemStack("minecraft:poppy", 1), e.location);
    } catch {
      // the poppy is lost
    }
    e.triggerEvent("minecraft:on_sheared"); // off its head
    seen.flower = false;
  }
  Object.assign(a, { coat: seen.coat, waxed: seen.waxed, statue: seen.statue, pose: seen.pose, flower: seen.flower });
  saveAnimal(a);
  const ex = getExhibit(a.location.id);
  const where = ex ? ` in ${ex.name}` : "";
  if (change.becameStatue) near(e, `§6${a.name} turned into a copper statue${where}. §fScrape it with an axe a stage at a time: scraped back to bright copper, it comes back to life. Wax it with a honeycomb to keep it as it is.`);
  else if (change.cameBack) near(e, `§a${a.name} came back to life${where}!`);
}

// Every 20 ticks: each zoo copper golem near a player.
export function tickCopperGolems() {
  if (!TYPES.length) return;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, BALANCE.golem.range, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        sync(e);
      } catch (error) {
        tell(error);
      }
    }
  }
}
