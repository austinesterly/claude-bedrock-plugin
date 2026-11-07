import { world, system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { ITEMS } from "../data/items.js";
import { getPark, can, denyText } from "../park/park.js";
import { researched } from "../research/research.js";
import { takeItem, message } from "../platform/mc.js";
import { serumCheck, SERUM_TEXT, MOB_KINDS, MOB_SOUNDS, ZOO_MOB_FAMILY, guardBoxes, guarded, calmedText, lookEvents } from "./mobRules.js";
import { BOSS_TYPES } from "./bossRules.js";
import { UNDEAD_MOUNTS } from "./undeadMountRules.js";
import { bossCaught } from "./boss.js";

// Hostile mobs in the zoo (0.1.163, module 11; the rules are in animals/mobRules.js): the Passivity Serum on a weakened
// vanilla zombie, skeleton, creeper or spider (0.1.164; it becomes a calmed one, zoocraft:calm_zombie: a creeper about to
// explode is calmed before it does, a skeleton riding a spider jumps off; 0.1.165 the Cyclops, sitting tired out after a
// fight: its camp is caught then, as a boss's lair is when it is caged), the zoo mobs' groans, rattles and hisses (their
// entities have no sounds of their own), and the spawn guard: a wild monster spawning in a Mob House's hall or a mob pen
// (they are dark buildings, and monsters spawn at block light 0) is taken away at once.

const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

function isMonster(e) {
  try {
    return Boolean(e.getComponent("minecraft:type_family")?.hasTypeFamily("monster"));
  } catch {
    return false;
  }
}

// What the serum would do to `target`: undefined for anything that isn't a monster.
function check(target) {
  let hp = 0;
  let max = 0;
  try {
    const h = target.getComponent("minecraft:health");
    hp = h?.currentValue ?? 0;
    max = h?.effectiveMax ?? h?.defaultValue ?? 0;
  } catch {
    // no health: never calmed
  }
  let baby = false;
  try {
    baby = Boolean(target.getComponent("minecraft:is_baby"));
  } catch {
    // not a mob with young
  }
  return serumCheck({ typeId: target.typeId, hostile: isMonster(target), baby, hp, max }, BALANCE.mobs.calmAt);
}

// Is this a mob the serum talks about (a monster)? For the entity interaction: anything else is left to the game.
export function serumTarget(target) {
  return Boolean(MOB_KINDS[target.typeId] || UNDEAD_MOUNTS[target.typeId]) || isMonster(target); // the undead mounts (0.1.198): the serum says they're calm on their own
}

// The Passivity Serum used on `target` (the entity interaction, or the item's use aimed by the player's view).
export function useSerum(player, target) {
  const what = check(target);
  if (!what) return;
  if (!getPark()) return message(player, "§eClaim a park with a Park Deed first.");
  if (!can(player, "care")) return message(player, denyText("care"));
  if (!researched("mob_taming")) return message(player, `§e${SERUM_TEXT.research}`);
  if (what.why) return message(player, `§e${what.why}`);
  if (!takeItem(player, ITEMS.passivitySerum, 1)) return;
  const d = target.dimension;
  const at = { ...target.location };
  let rot;
  let hp = 1;
  try {
    rot = target.getRotation();
    hp = Math.max(1, Math.ceil(target.getComponent("minecraft:health")?.currentValue ?? 1));
  } catch {
    // keep the defaults
  }
  const name = target.nameTag;
  // A zombie villager (0.1.199) keeps its job and its home's clothes; a sheared bogged (0.1.201) stays bare.
  let look = [];
  try {
    look = lookEvents(what.calm, target.getComponent("minecraft:variant")?.value, target.getComponent("minecraft:mark_variant")?.value, target.hasComponent("minecraft:is_sheared"));
  } catch {
    // one look
  }
  try {
    target.getComponent("minecraft:rideable")?.ejectRiders();
  } catch {
    // nothing rides it
  }
  if (BOSS_TYPES.includes(target.typeId)) bossCaught(target); // the Cyclops: its camp turns caught, its fight forgotten
  target.remove();
  let calm;
  try {
    calm = d.spawnEntity(what.calm, at);
    if (rot) calm.setRotation(rot);
    calm.getComponent("minecraft:health")?.setCurrentValue(hp);
    if (name) calm.nameTag = name;
    for (const ev of look) calm.triggerEvent(ev);
    // A slime's or magma cube's size (0.1.203) comes with that size's health: the wild one's again once it is on.
    if (look.length)
      system.run(() => {
        try {
          const h = calm.isValid ? calm.getComponent("minecraft:health") : undefined;
          if (h) h.setCurrentValue(Math.min(hp, h.effectiveMax));
        } catch {
          // gone
        }
      });
    calm.addEffect("slowness", BALANCE.mobs.dazeTicks, { amplifier: 4, showParticles: false });
  } catch (err) {
    log(`mobs: calming failed: ${err}`);
  }
  try {
    for (let i = 0; i < 6; i++) d.spawnParticle("minecraft:villager_happy", { x: at.x + (Math.random() - 0.5), y: at.y + 0.6 + Math.random() * 1.2, z: at.z + (Math.random() - 0.5) });
    d.playSound("mob.zombie.remedy", at, { volume: 0.7, pitch: 1.2 });
  } catch {
    // effects are only for show
  }
  message(player, calmedText(what.calm));
}

// The serum's item use (the game sends no entity interaction for a mob that offers none): the mob the player looks at.
export function useSerumAimed(player) {
  let target;
  try {
    target = player.getEntitiesFromViewDirection({ maxDistance: 5 }).map((hit) => hit.entity).find((e) => e.isValid && serumTarget(e));
  } catch {
    return;
  }
  if (!target) return message(player, `§e${SERUM_TEXT.aim}`);
  useSerum(player, target);
}

// ---------------- sounds ----------------

// Every second: now and then a zoo or calmed mob groans, rattles or hisses (BALANCE.mobs.sayChance a second each, times
// its sound's chance; a creeper's hiss is quiet, low and half as often).
export function tickMobSounds() {
  for (const id of DIMENSIONS) {
    let mobs;
    try {
      mobs = world.getDimension(id).getEntities({ families: [ZOO_MOB_FAMILY] });
    } catch {
      continue;
    }
    for (const e of mobs) {
      const s = MOB_SOUNDS[e.typeId];
      if (!s || Math.random() >= BALANCE.mobs.sayChance * (s.chance ?? 1)) continue;
      try {
        // The drowned (0.1.200) calls differently under water.
        e.dimension.playSound(s.sayWater && e.isInWater ? s.sayWater : s.say, e.location, { volume: s.volume ?? 0.8, pitch: (s.pitch ?? 1) * (0.9 + Math.random() * 0.2) });
      } catch {
        // gone
      }
    }
  }
}

// ---------------- the spawn guard ----------------

let boxes = [];

// The halls and pens, from the records (every park's): refreshed every few seconds, and after a Mob House is checked.
export function refreshMobGuard() {
  boxes = guardBoxes(db.all("equipment"), db.all("exhibits"));
}

export function initMobs() {
  refreshMobGuard();
  world.afterEvents.entitySpawn.subscribe(({ entity, cause }) => {
    if (cause === "Loaded" || !boxes.length) return;
    try {
      if (!isMonster(entity) || !guarded(boxes, entity.dimension.id, entity.location)) return;
    } catch {
      return;
    }
    system.run(() => {
      try {
        if (entity.isValid) entity.remove();
      } catch {
        // gone already
      }
    });
  });
  // A zoo or calmed mob hurt by a player (only a player's hits hurt a calmed one; a zoo one takes none): its hurt sound.
  world.afterEvents.entityHurt.subscribe(
    ({ hurtEntity }) => {
      const s = MOB_SOUNDS[hurtEntity.typeId];
      if (!s) return;
      try {
        hurtEntity.dimension.playSound(s.hurtWater && hurtEntity.isInWater ? s.hurtWater : s.hurt, hurtEntity.location);
      } catch {
        // gone
      }
    },
    { entityTypes: Object.keys(MOB_SOUNDS) },
  );
}
