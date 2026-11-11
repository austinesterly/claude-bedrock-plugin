// The Full Healing Serum's use (0.1.250; the rules serum/healingRules.js). Used on a living thing it restores its
// health to its maximum (the health component's own top value: nothing is raised, nothing else is given). Used with
// nothing aimed at, or while sneaking, it heals the player. A use that heals takes one serum (none in Creative).
import { system, GameMode } from "@minecraft/server";
import { ITEMS } from "../data/items.js";
import { message, takeItem } from "../platform/mc.js";
import { serumCheck, targetName, serumText, freshUse } from "./healingRules.js";

const used = new Map(); // player id -> the tick of their last use

function once(player) {
  const tick = system.currentTick;
  if (!freshUse(used.get(player.id), tick)) return false;
  used.set(player.id, tick);
  return true;
}

function healthOf(entity) {
  try {
    return entity.getComponent("minecraft:health");
  } catch {
    return undefined;
  }
}

/** Whether the serum has anything to say to this entity: it has health and is a living thing (not an armor stand, a boat). */
export function healable(entity) {
  if (!entity?.isValid || !healthOf(entity)) return false;
  try {
    return !entity.matches({ families: ["inanimate"] });
  } catch {
    return true;
  }
}

/** The serum used by `player` on `target` (themself too). Returns serumCheck's word, or "gone". */
export function healWith(player, target) {
  if (!player?.isValid || !target?.isValid) return "gone";
  const h = healable(target) ? healthOf(target) : undefined;
  const what = serumCheck(h ? { current: h.currentValue, max: h.effectiveMax } : undefined);
  const self = target.id === player.id;
  const name = self ? undefined : targetName(target.typeId, target.name, target.nameTag);
  if (what !== "heal") {
    message(player, serumText(what, name));
    return what;
  }
  let creative = false;
  try {
    creative = player.getGameMode() === GameMode.Creative;
  } catch {
    // survival rules
  }
  if (!creative && !takeItem(player, ITEMS.healingSerum, 1)) return "gone";
  h.resetToMaxValue();
  try {
    const l = target.location;
    target.dimension.spawnParticle("minecraft:heart_particle", { x: l.x, y: l.y + 1, z: l.z });
    target.dimension.playSound("random.levelup", l, { volume: 0.6, pitch: 1.4 });
  } catch {
    // out of sight
  }
  message(player, serumText(what, name));
  if (!self && target.typeId === "minecraft:player") message(target, `§a${player.name} restored you to full health with a Full Healing Serum.`);
  return what;
}

/** The item's own use: the living thing the player looks at (within 5 blocks), else, or while sneaking, themself. */
export function useHealingSerum(player) {
  if (!player?.isValid || !once(player)) return undefined;
  let target;
  if (!player.isSneaking) {
    try {
      target = player.getEntitiesFromViewDirection({ maxDistance: 5 }).map((hit) => hit.entity).find((e) => e.id !== player.id && healable(e));
    } catch {
      target = undefined;
    }
  }
  return healWith(player, target ?? player);
}

/** The serum used straight on an entity (the game's entity interaction): that entity, or the player while sneaking. */
export function useHealingSerumOn(player, target) {
  if (!player?.isValid || !once(player)) return undefined;
  return healWith(player, player.isSneaking ? player : target);
}
