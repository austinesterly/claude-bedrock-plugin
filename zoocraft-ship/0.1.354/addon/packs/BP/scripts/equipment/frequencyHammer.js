// The Frequency Hammer at work (0.1.354; rules in frequencyHammerRules.js). A swing at a block (left click) throws its
// holder away from the blow, as a wind charge does: one push, never a push a tick. In the air, using it (right click)
// drives them down, and where they land everything round them is hurt and thrown back, as a mace's smash; the fall
// itself does them no harm. No words on screen; nothing is broken.
import { world, system, EntityDamageCause } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { heldItem, sparkVars } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { exhibitAt } from "../exhibits/exhibits.js";
import { FREQUENCY_HAMMER, launchPush, slamDamage, slamRadius, slamAt, slamHurts, fallSpared } from "./frequencyHammerRules.js";

const K = () => BALANCE.frequencyHammer;
const RID = "zoocraft:rid";
/** Holders in the air by the hammer: id -> { p, launchY, peak, t0, slam, landed } */
const air = new Map();
const lastSwing = new Map();
const lastSlam = new Map();
const stats = { launches: 0, slams: 0, smashes: 0, hurt: 0, spared: 0, last: undefined };

const FACE = { Up: [0.5, 1, 0.5], Down: [0.5, 0, 0.5], North: [0.5, 0.5, 0], South: [0.5, 0.5, 1], West: [0, 0.5, 0.5], East: [1, 0.5, 0.5] };

function sound(d, id, at, volume = 1, pitch = 1) {
  try {
    d.playSound(id, at, { volume, pitch });
  } catch {
    // only a sound
  }
}
function sparks(d, at, r, n) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    try {
      d.spawnParticle("minecraft:electric_spark_particle", { x: at.x + Math.cos(a) * r, y: at.y + 0.2, z: at.z + Math.sin(a) * r }, sparkVars());
    } catch {
      return; // not loaded there
    }
  }
}

/** A player's blow on a block (the game's event, after it): with the hammer in hand, the launch. */
export function hammerHitBlock(e) {
  const p = e.damagingEntity;
  if (p?.typeId !== "minecraft:player" || heldItem(p)?.typeId !== FREQUENCY_HAMMER) return;
  const k = K().launch;
  const now = system.currentTick;
  if (now - (lastSwing.get(p.id) ?? -1000) < k.cooldown) return;
  const b = e.hitBlock;
  const f = FACE[e.blockFace] ?? FACE.Up;
  const hit = { x: b.x + f[0], y: b.y + f[1], z: b.z + f[2] };
  const at = p.location;
  const push = launchPush({ x: at.x - hit.x, y: at.y + k.body - hit.y, z: at.z - hit.z }, k);
  if (!push) return;
  lastSwing.set(p.id, now);
  const v = p.getVelocity();
  p.applyImpulse({ x: push.x, y: push.y - v.y, z: push.z }); // one push: upward speed set, sideways speed added to
  const st = air.get(p.id);
  air.set(p.id, { p, launchY: st && !st.landed ? Math.min(st.launchY, at.y) : at.y, peak: at.y, t0: now, slam: false, landed: 0 });
  stats.launches++;
  stats.last = { push, hit };
  sound(p.dimension, "wind_charge.burst", hit, 1, 1.1);
  sparks(p.dimension, hit, 0.8, 8);
}

function groundUnder(p, far) {
  try {
    const hit = p.dimension.getBlockFromRay(p.location, { x: 0, y: -1, z: 0 }, { maxDistance: far, includeLiquidBlocks: true, includePassableBlocks: false });
    return hit ? p.location.y - (hit.block.y + 1) : far;
  } catch {
    return 0;
  }
}

/** The hammer used (right click): in the air, the slam begins. */
export function hammerUse(p, stack) {
  if (stack?.typeId !== FREQUENCY_HAMMER || p?.typeId !== "minecraft:player") return;
  const k = K().slam;
  const now = system.currentTick;
  if (p.isOnGround || p.isFlying || p.isInWater || p.isGliding) return;
  if (now - (lastSlam.get(p.id) ?? -1000) < k.cooldown) return;
  if (air.get(p.id)?.slam) return;
  if (groundUnder(p, k.minAir + 1) < k.minAir) return;
  lastSlam.set(p.id, now);
  const v = p.getVelocity();
  p.applyImpulse({ x: -v.x * k.brake, y: -k.down - v.y, z: -v.z * k.brake }); // one push straight down
  const st = air.get(p.id);
  const y = p.location.y;
  air.set(p.id, { p, launchY: st && !st.landed ? st.launchY : y, peak: Math.max(st && !st.landed ? st.peak : y, y), t0: now, slam: true, landed: 0 });
  stats.slams++;
  sound(p.dimension, "wind_charge.burst", p.location, 0.8, 0.6);
}

function mobOf(e) {
  let leashed = false, tamed = false, zoo = false, families = [];
  try {
    leashed = Boolean(e.getComponent("minecraft:leashable")?.isLeashed);
  } catch {
    leashed = false;
  }
  try {
    tamed = Boolean(e.getComponent("minecraft:tameable")?.isTamed);
  } catch {
    tamed = false;
  }
  try {
    zoo = e.getDynamicProperty(RID) !== undefined || exhibitAt(e.dimension.id, e.location) !== undefined;
  } catch {
    zoo = true; // can't tell: leave it be
  }
  try {
    families = e.getComponent("minecraft:type_family")?.getTypeFamilies() ?? [];
  } catch {
    families = [];
  }
  return { typeId: e.typeId, families, named: Boolean(e.nameTag), leashed, tamed, zoo };
}

function smash(p, st) {
  const k = K().slam;
  const at = p.location;
  const fall = st.peak - at.y;
  if (fall < k.minFall) return;
  const d = p.dimension;
  const damage = slamDamage(fall, k), radius = slamRadius(fall, k);
  stats.smashes++;
  stats.last = { fall, damage, radius, hurt: [] };
  sound(d, fall >= k.heavy ? "mace.heavy_smash_ground" : "mace.smash_ground", at, 1, 1);
  sparks(d, at, radius * 0.5, 10);
  sparks(d, at, radius, 16);
  let near = [];
  try {
    near = d.getEntities({ location: at, maxDistance: radius + 1, excludeFamilies: ["inanimate", "player", "projectile"], excludeTypes: ["minecraft:item", "minecraft:xp_orb"] });
  } catch {
    near = [];
  }
  for (const e of near) {
    try {
      const dx = e.location.x - at.x, dz = e.location.z - at.z;
      const dist = Math.hypot(dx, e.location.y - at.y, dz);
      const hurt = slamAt(dist, damage, radius, k);
      if (!hurt || !slamHurts(mobOf(e))) {
        if (hurt) stats.spared++;
        continue;
      }
      e.applyDamage(hurt, { cause: EntityDamageCause.entityAttack, damagingEntity: p });
      stats.hurt++;
      stats.last.hurt.push([e.typeId, hurt]);
      const flat = Math.hypot(dx, dz) || 1;
      if (e.isValid) e.applyKnockback({ x: (dx / flat) * k.knock.h, z: (dz / flat) * k.knock.h }, k.knock.v);
    } catch {
      // gone, or it can't be thrown
    }
  }
}

/** Every tick, only while someone is in the air by it: their height kept, the smash where a slam lands. */
export function tickHammer() {
  if (!air.size) return;
  const now = system.currentTick;
  const k = K();
  for (const [id, st] of air) {
    try {
      const p = st.p;
      if (!p.isValid || now - st.t0 > k.forget) {
        air.delete(id);
        continue;
      }
      if (st.landed) {
        if (now - st.landed > k.safeTicks) air.delete(id);
        continue;
      }
      st.peak = Math.max(st.peak, p.location.y);
      if (now - st.t0 < 2) continue;
      if (p.isOnGround || p.isInWater || p.isFlying) {
        st.landed = now;
        if (st.slam && p.isOnGround) smash(p, st);
      }
    } catch (err) {
      air.delete(id);
      reportError("hammer.tick", err);
    }
  }
}

/** The game's hurt event (before it lands): the fall after a launch or a slam does its holder no harm. */
export function hammerHurt(e) {
  if (!air.size || e.damageSource.cause !== EntityDamageCause.fall) return;
  const st = air.get(e.hurtEntity?.id);
  if (fallSpared(st, e.hurtEntity.location.y, K())) e.cancel = true;
}

/** The events of its own: the blow on a block, the use. */
export function wireHammer() {
  world.afterEvents.entityHitBlock.subscribe((e) => {
    try {
      hammerHitBlock(e);
    } catch (err) {
      reportError("hammer.hit", err);
    }
  });
  world.afterEvents.itemUse.subscribe((e) => {
    try {
      hammerUse(e.source, e.itemStack);
    } catch (err) {
      reportError("hammer.use", err);
    }
  });
  world.afterEvents.playerLeave.subscribe((e) => {
    air.delete(e.playerId);
    lastSwing.delete(e.playerId);
    lastSlam.delete(e.playerId);
  });
}

/** For the test server. */
export function hammerDebug() {
  return { ...stats, air: [...air.values()].map((s) => ({ launchY: s.launchY, peak: s.peak, slam: s.slam, landed: s.landed })) };
}
