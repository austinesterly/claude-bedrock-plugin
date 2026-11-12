// What a ZooCraft bow adds to the game's own arrow as it leaves the bow (0.1.261; numbers: data/bows.js, balance.js
// residents.bowCase.shots). The arrow is the game's, fired by the game's bow code (minecraft:shooter). Here its speed
// is scaled by the bow's power, which scales its damage and reach the way a stronger draw does. Blaze arrows are set
// alight (as with Flame), Blightbloom arrows poison what they hit, and Panda arrows leave a trail of hearts. Nothing
// else is touched, and no arrow is ever made here.
import { world, system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { powerOf } from "./bowRules.js";
import { heldBow } from "./bowCase.js";

const shots = new Map(); // arrow id -> { bow, until, trail }
const g = () => BALANCE.residents.bowCase.shots;

/** An arrow from a player holding one of ZooCraft's bows: its power, fire and trail. */
function launched(arrow) {
  let owner;
  try {
    owner = arrow.getComponent("minecraft:projectile")?.owner;
  } catch {
    owner = undefined;
  }
  if (owner?.typeId !== "minecraft:player") return;
  const bow = heldBow(owner);
  if (!bow) return;
  const p = powerOf(bow.damage, g());
  if (p !== 1) {
    try {
      const v = arrow.getVelocity();
      arrow.clearVelocity();
      arrow.applyImpulse({ x: v.x * p, y: v.y * p, z: v.z * p });
    } catch {
      // the arrow went this tick: it flies as the game's bow sent it
    }
  }
  if (bow.touch === "fire") {
    try {
      arrow.setOnFire(g().fireSeconds, true);
    } catch {
      // already gone
    }
  }
  shots.set(arrow.id, { bow: bow.id, touch: bow.touch, until: system.currentTick + g().keepTicks, trailUntil: system.currentTick + g().trailTicks });
}

/** The world events: arrows leaving a bow, arrows hitting, and the hearts trail. */
export function wireBowShots() {
  world.afterEvents.entitySpawn.subscribe((e) => {
    const arrow = e.entity;
    try {
      if (arrow?.typeId === "minecraft:arrow" && arrow.isValid) launched(arrow);
    } catch {
      // gone at once
    }
  });
  // The hit: the arrow is still readable in the hurt event (it isn't always in projectileHitEntity).
  world.afterEvents.entityHurt.subscribe((e) => {
    const p = e.damageSource?.damagingProjectile;
    let id;
    try {
      id = p?.id;
    } catch {
      id = undefined;
    }
    const s = id ? shots.get(id) : undefined;
    if (!s || s.touch !== "poison") return;
    try {
      if (e.hurtEntity.isValid) e.hurtEntity.addEffect("poison", g().poisonTicks, { amplifier: 0 });
    } catch {
      // it died of the arrow
    }
  });
  system.runInterval(() => {
    const now = system.currentTick;
    for (const [id, s] of shots) {
      if (now > s.until) {
        shots.delete(id);
        continue;
      }
      if (s.touch !== "hearts" || now > s.trailUntil) continue;
      const arrow = world.getEntity(id);
      if (!arrow?.isValid) {
        shots.delete(id);
        continue;
      }
      try {
        const v = arrow.getVelocity();
        if (Math.hypot(v.x, v.y, v.z) < g().stillSpeed) continue; // stuck in something: no more hearts
        arrow.dimension.spawnParticle("minecraft:heart_particle", arrow.location);
      } catch {
        shots.delete(id);
      }
    }
  }, 2);
}

/** Bench and test only: the arrows being followed. */
export function shotsDebug() {
  return [...shots.entries()].map(([id, s]) => ({ id, ...s }));
}
