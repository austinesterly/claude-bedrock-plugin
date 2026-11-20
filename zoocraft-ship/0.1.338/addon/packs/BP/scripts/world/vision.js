// 0.1.338: Transcending Vision and the Lightning TNT Frequency Stick at run time (rules: world/visionRules.js; numbers:
// BALANCE.vision). The stick is thrown by the game (minecraft:throwable); its projectile is noted when it spawns, so
// its landing is known even if the projectile is gone by then.
import { world, GameMode, ItemStack, EntityDamageCause } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { message, onlinePlayers } from "../platform/mc.js";
import { STICK_ITEM, STICK_ENTITY, VISION_KEY, VISION_FOG, VISION_FOG_TAG, caught, tickVision, visionText } from "./visionRules.js";

const thrown = new Map(); // projectile id -> thrower id (or undefined)
const stats = { thrown: 0, landed: 0, shifted: 0, ended: 0 };

const leftOf = (player) => {
  try {
    return Number(player.getDynamicProperty(VISION_KEY) ?? 0) || 0;
  } catch {
    return 0;
  }
};

/** Whether a player has Transcending Vision now (0.1.339: the hidden villages and the Frequency Friends). */
export const hasVision = (player) => leftOf(player) > 0;

function fog(player, on) {
  try {
    player.runCommand(`fog @s remove ${VISION_FOG_TAG}`);
    if (on) player.runCommand(`fog @s push ${VISION_FOG} ${VISION_FOG_TAG}`);
  } catch {
    // the haze is only a look
  }
}

/** Give (or top up) the vision. */
export function startVision(player) {
  const g = BALANCE.vision;
  const again = hasVision(player);
  player.setDynamicProperty(VISION_KEY, g.seconds);
  fog(player, true);
  stats.shifted++;
  message(player, visionText("start", g, again));
}

function endVision(player, kind) {
  try {
    player.setDynamicProperty(VISION_KEY, undefined);
  } catch {
    // gone already
  }
  fog(player, false);
  stats.ended++;
  if (kind) message(player, visionText(kind, BALANCE.vision));
}

/** Every second: the vision wears down. */
export function tickVisions() {
  const g = BALANCE.vision;
  for (const p of onlinePlayers()) {
    const left = leftOf(p);
    if (!(left > 0)) continue;
    const t = tickVision(left, g);
    if (t.left <= 0) {
      endVision(p, "ended");
      continue;
    }
    p.setDynamicProperty(VISION_KEY, t.left);
    if (t.say) message(p, visionText(t.say, g));
  }
}

/** A player who dies loses the vision, as with any effect. */
export function visionDeath(dead) {
  if (dead?.typeId === "minecraft:player" && hasVision(dead)) endVision(dead, "lost");
}

/** A player who joins (or comes back) with the vision gets the haze back. */
export function visionSpawn(player) {
  if (hasVision(player)) fog(player, true);
}

/** entitySpawn: note a thrown stick and who threw it. */
export function frequencyStickSpawn(e) {
  const ent = e.entity;
  if (ent?.typeId !== STICK_ENTITY) return;
  let owner;
  try {
    owner = ent.getComponent("minecraft:projectile")?.owner?.id;
  } catch {
    owner = undefined;
  }
  thrown.set(ent.id, owner);
  stats.thrown++;
  if (thrown.size > 64) thrown.delete(thrown.keys().next().value);
}

function projectileId(e) {
  try {
    return e.projectile?.id;
  } catch {
    return undefined;
  }
}

/** projectileHitBlock / projectileHitEntity: where a stick lands, it goes off. */
export function frequencyStickHit(e) {
  const id = projectileId(e);
  if (!id || !thrown.has(id)) return;
  const ownerId = thrown.get(id);
  thrown.delete(id);
  stats.landed++;
  const g = BALANCE.vision;
  const d = e.dimension;
  const at = { ...e.location };
  try {
    d.spawnParticle("minecraft:huge_explosion_emitter", at);
    for (let i = 0; i < 6; i++) d.spawnParticle("minecraft:electric_spark_particle", { x: at.x + (Math.random() - 0.5) * 2, y: at.y + Math.random() * 1.5, z: at.z + (Math.random() - 0.5) * 2 });
    d.playSound("random.explode", at, { volume: 0.8, pitch: 1.4 });
    d.playSound("ambient.weather.thunder", at, { volume: 0.6, pitch: 1.6 });
  } catch {
    // only for show
  }
  let owner;
  let hitOwner = false;
  for (const p of onlinePlayers()) {
    if (p.id === ownerId) owner = p;
    if (p.dimension.id !== d.id || !caught(p.location, at, g)) continue;
    if (p.id === ownerId) hitOwner = true;
    try {
      p.applyDamage(g.damage, { cause: EntityDamageCause.override });
      startVision(p);
    } catch (err) {
      reportError("frequencyStick", err);
    }
  }
  if (owner && !hitOwner) message(owner, visionText("far", g));
  // it drops where it landed, to be picked up again (a creative thrower keeps theirs, so none drops)
  let creative = false;
  try {
    creative = owner?.getGameMode() === GameMode.Creative;
  } catch {
    creative = false;
  }
  if (!creative) {
    try {
      d.spawnItem(new ItemStack(STICK_ITEM, 1), { x: at.x, y: at.y + 0.3, z: at.z });
    } catch (err) {
      reportError("frequencyStickDrop", err);
    }
  }
}

/** Bench: what has happened this session. */
export function visionDebug() {
  return { ...stats, armed: thrown.size };
}
