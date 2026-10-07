// Patrol guard glue. The walking itself is JSON: each leg group has a minecraft:behavior.move_to_block
// goal for one post color, and on_stay_completed fires the next leg. Script only:
//  - skips a leg whose post can't be reached (no post in range, blocked path) after a timeout
//  - doesn't count time spent fighting as "stuck"
//  - /ns:patrol shows nearby guards and their current leg (operators)
// @minecraft/server 2.10.0.

import { CommandPermissionLevel, CustomCommandStatus, system, world } from "@minecraft/server";

const GUARD = "ns:patrol_guard";
const LEGS = ["a", "b", "c"];
const POST_NAMES = ["red", "lime", "light blue"]; // glazed terracotta colors in the entity file
const STUCK_TICKS = 600; // 30 s on one leg without arriving -> go to the next leg
const CHECK_EVERY = 100;
const DIMENSIONS = ["overworld", "nether", "the_end"];

const lastFight = new Map(); // entity id -> absolute time of last hit given or taken

function noteFight(entity) {
  if (entity?.typeId === GUARD) lastFight.set(entity.id, world.getAbsoluteTime());
}
world.afterEvents.entityHitEntity.subscribe(({ damagingEntity }) => noteFight(damagingEntity));
world.afterEvents.entityHurt.subscribe(({ hurtEntity }) => noteFight(hurtEntity), { entityTypes: [GUARD] });
world.afterEvents.entityRemove.subscribe(({ removedEntityId }) => lastFight.delete(removedEntityId), { entityTypes: [GUARD] });

function checkGuard(guard, t) {
  const leg = guard.getProperty("ns:leg");
  if (typeof leg !== "number") return;
  const seen = guard.getDynamicProperty("ns:leg_seen");
  if (seen !== leg) {
    // The JSON chain moved on by itself: restart the timer.
    guard.setDynamicProperties({ "ns:leg_seen": leg, "ns:leg_since": t });
    return;
  }
  const since = guard.getDynamicProperty("ns:leg_since");
  const fought = lastFight.get(guard.id) ?? 0;
  const start = Math.max(typeof since === "number" ? since : t, fought);
  if (t - start < STUCK_TICKS) return;
  const next = (leg + 1) % LEGS.length;
  guard.triggerEvent(`ns:go_leg_${LEGS[next]}`); // same event the JSON uses, so state stays consistent
  guard.setDynamicProperties({ "ns:leg_seen": next, "ns:leg_since": t });
}

world.afterEvents.worldLoad.subscribe(() => {
  system.runInterval(() => {
    const t = world.getAbsoluteTime();
    for (const id of DIMENSIONS) {
      let guards;
      try {
        guards = world.getDimension(id).getEntities({ type: GUARD });
      } catch {
        continue;
      }
      for (const g of guards) {
        try {
          if (g.isValid) checkGuard(g, t);
        } catch (e) {
          console.warn(`[ns:patrol] ${e}`);
        }
      }
    }
  }, CHECK_EVERY);
});

system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerCommand(
    { name: "ns:patrol", description: "Show nearby patrol guards and their legs", permissionLevel: CommandPermissionLevel.GameDirectors, cheatsRequired: false },
    (origin) => {
      const player = origin.sourceEntity;
      if (player?.typeId !== "minecraft:player") return { status: CustomCommandStatus.Failure, message: "Run this as a player." };
      system.run(() => {
        if (!player.isValid) return;
        const guards = player.dimension.getEntities({ type: GUARD, location: player.location, maxDistance: 48 });
        if (!guards.length) return player.sendMessage("No patrol guards within 48 blocks.");
        for (const g of guards) {
          const leg = g.getProperty("ns:leg") ?? 0;
          const p = g.location;
          player.sendMessage(`Guard at ${Math.floor(p.x)} ${Math.floor(p.y)} ${Math.floor(p.z)}: heading to the ${POST_NAMES[leg]} post`);
        }
      });
      return { status: CustomCommandStatus.Success };
    },
  );
});
