// Townsfolk: the schedule is pure JSON (minecraft:scheduler + hourly_clock_time filters swap the
// ns:work_shift and ns:night_home groups). This script only gives them names and small talk that
// reads the ns:activity property, so you can see which state an NPC is in.
// @minecraft/server 2.10.0.

import { system, world } from "@minecraft/server";

const TYPE = "ns:townsfolk";
const NAMES = ["Ada", "Bram", "Cora", "Dell", "Edda", "Finn", "Gwen", "Hale"];
const LINES = {
  work: ["Busy day at the forge.", "Can't stop now, the orders are piling up.", "Fine weather for working."],
  home: ["It's late. I'm heading home.", "Good night, neighbor.", "Mind the monsters out there."],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (entity.typeId === TYPE && entity.isValid && !entity.nameTag) entity.nameTag = pick(NAMES);
});

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (target.typeId !== TYPE) return;
  const activity = target.getProperty("ns:activity") === "home" ? "home" : "work";
  const name = target.nameTag || "Townsfolk";
  target.lookAt(player.getHeadLocation());
  player.sendMessage(`§e${name}:§r ${pick(LINES[activity])}`);
  player.playSound(activity === "home" ? "mob.villager.no" : "mob.villager.yes");
});

// Debug: /scriptevent ns:townsfolk status  -> lists townsfolk within 32 blocks and their state.
system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:townsfolk" || e.message !== "status") return;
    const player = e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    const time = world.getTimeOfDay();
    player.sendMessage(`Time of day: ${time} (work before 11000, home after)`);
    for (const t of player.dimension.getEntities({ type: TYPE, location: player.location, maxDistance: 32 })) {
      player.sendMessage(` ${t.nameTag || t.id}: ${t.getProperty("ns:activity")}`);
    }
  },
  { namespaces: ["ns"] },
);
