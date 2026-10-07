import { world, EntityInitializationCause } from "@minecraft/server";

// Announces the phases of ns:titan. The behavior file owns the phase: an environment_sensor
// fires ns:enter_phase_2 / ns:enter_phase_3, and those events set the int property ns:phase.
// This script only listens (after-events), so it never writes inside a before-event.
const BOSS_ID = "ns:titan";
const PHASE_MESSAGES = {
  "ns:enter_phase_2": "ns.titan.phase_2",
  "ns:enter_phase_3": "ns.titan.phase_3",
};
const ANNOUNCE_RANGE = 64;

function tellNearby(boss, langKey) {
  if (!boss.isValid) return;
  const players = boss.dimension.getPlayers({ location: boss.location, maxDistance: ANNOUNCE_RANGE });
  for (const player of players) player.sendMessage({ translate: langKey });
}

world.afterEvents.dataDrivenEntityTrigger.subscribe(
  (event) => {
    const langKey = PHASE_MESSAGES[event.eventId];
    if (langKey) tellNearby(event.entity, langKey);
  },
  { entityTypes: [BOSS_ID], eventTypes: Object.keys(PHASE_MESSAGES) }
);

world.afterEvents.entitySpawn.subscribe((event) => {
  if (event.cause !== EntityInitializationCause.Spawned) return;
  if (event.entity.typeId === BOSS_ID) tellNearby(event.entity, "ns.titan.awake");
});

world.afterEvents.entityDie.subscribe(
  () => {
    world.sendMessage({ translate: "ns.titan.defeated" });
  },
  { entityTypes: [BOSS_ID] }
);
