// Explosive Arrows (0.1.306; the rules: equipment/hanvilRules.js). Austin's NPC #26 spec: "Explosive Arrows detonate
// when they strike a surface or valid target. Block destruction is intentional ... Use the existing Minecraft
// explosion system ... must support ordinary vanilla Minecraft bows [and] custom bows from Guido's bow collection ...
// respect any existing world-protection or zoo-protection rules".
//
// The game's bows fire only the game's own arrow, so an Explosive Arrow is not shot as itself: held in the off hand,
// it arms the arrow a bow fires. Any bow that fires the game's arrow works the same way (the game's bow and crossbow,
// Guido's fifteen, another add-on's). One Explosive Arrow is used up for the shot, and the ordinary arrow the bow took
// is handed back (none was taken with Infinity or in creative, so none is handed back then): the shot costs exactly
// one Explosive Arrow. Where it lands it blows up with the game's own explosion and is gone.
// Inside a zoo, or within reach of one, the blast breaks no block.
import { system, world, EquipmentSlot, GameMode } from "@minecraft/server";
import { giveItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { parkAt } from "../park/park.js";
import { reportError } from "../core/log.js";
import { EXPLOSIVE_ARROW, armsShot, blastPlan, blastCorners } from "./hanvilRules.js";

const ARROW = "minecraft:arrow";
const A = () => BALANCE.hanvil.arrows;
// armed arrow id -> { owner: player, tick }
const blasts = { by: 0, plain: 0 }; // for the test server: blasts with their shooter named, and without
const armed = new Map();
// player id -> the tick of their last armed arrow
const last = new Map();

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function arm(arrow, owner) {
  const now = system.currentTick;
  const eq = owner.getComponent("minecraft:equippable");
  const off = eq?.getEquipment(EquipmentSlot.Offhand);
  if (!armsShot(off?.typeId, last.get(owner.id), now, A())) return false;
  last.set(owner.id, now);
  for (const [id, s] of armed) if (now - s.tick > 2400) armed.delete(id); // arrows that flew off for good
  armed.set(arrow.id, { owner, tick: now });
  if (!creative(owner)) {
    if (off.amount <= 1) eq.setEquipment(EquipmentSlot.Offhand, undefined);
    else {
      off.amount -= 1;
      eq.setEquipment(EquipmentSlot.Offhand, off);
    }
    let free = false;
    try {
      free = Boolean(eq.getEquipment(EquipmentSlot.Mainhand)?.getComponent("minecraft:enchantable")?.getEnchantment("infinity"));
    } catch {
      free = false;
    }
    if (!free) giveItem(owner, ARROW, 1); // the ordinary arrow the bow took
  }
  try {
    arrow.dimension.playSound("random.fuse", arrow.location);
  } catch {
    // no sound, no matter
  }
  return true;
}

const ownerOf = (arrow) => {
  try {
    const o = arrow.getComponent("minecraft:projectile")?.owner;
    return o?.typeId === "minecraft:player" ? o : undefined;
  } catch {
    return undefined;
  }
};

/** world.afterEvents.entitySpawn: an arrow a player fired with Explosive Arrows in the off hand is armed. */
export function explosiveArrowSpawn(e) {
  const arrow = e.entity;
  let isArrow;
  try {
    isArrow = arrow?.typeId === ARROW && arrow.isValid;
  } catch {
    isArrow = false;
  }
  if (!isArrow) return;
  const owner = ownerOf(arrow);
  if (owner) {
    arm(arrow, owner);
    return;
  }
  // an arrow a script launched gets its owner a moment later
  system.run(() => {
    try {
      if (!arrow.isValid || armed.has(arrow.id)) return;
      const late = ownerOf(arrow);
      if (late) arm(arrow, late);
    } catch (error) {
      reportError("explosive arrow", error);
    }
  });
}

function blast(projectile, dimension, at) {
  let id;
  try {
    id = projectile?.id;
  } catch {
    return;
  }
  const s = id ? armed.get(id) : undefined;
  if (!s) return;
  armed.delete(id);
  const g = A();
  let inPark = false;
  try {
    inPark = blastCorners(at, g.radius).some((p) => parkAt(dimension.id, p));
  } catch {
    inPark = true; // can't tell: break nothing
  }
  const plan = blastPlan(inPark, g);
  system.run(() => {
    try {
      if (projectile.isValid) projectile.remove();
    } catch {
      // gone already
    }
    const how = { breaksBlocks: plan.breaksBlocks, causesFire: plan.causesFire };
    let by;
    try {
      by = world.getEntity(s.owner.id); // asked for afresh: the one read off the arrow is not always one the game takes
    } catch {
      by = undefined;
    }
    try {
      dimension.createExplosion(at, plan.radius, by ? { ...how, source: by } : how);
      blasts.by += by ? 1 : 0;
      blasts.plain += by ? 0 : 1;
    } catch {
      try {
        dimension.createExplosion(at, plan.radius, how); // without saying whose it was
        blasts.plain += 1;
      } catch (error) {
        reportError("explosive arrow blast", error);
      }
    }
  });
}

/** world.afterEvents.projectileHitBlock / projectileHitEntity: an armed arrow blows up where it lands. */
export function explosiveArrowHitBlock(e) {
  blast(e.projectile, e.dimension, e.location);
}
export function explosiveArrowHitEntity(e) {
  blast(e.projectile, e.dimension, e.location);
}

/** For the test server. */
export function explosiveDebug() {
  return { armed: armed.size, ...blasts };
}
