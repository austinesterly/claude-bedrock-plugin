// Darian's Freezing Wand in the world (0.1.320; the rules are residents/wandRules.js). Used, it sends a white beam
// along the caster's look; the first mob or player it meets within range is held where it is for five seconds.
// A mob is put back in its place each tick (and slowed to nothing); a player's walking and jumping are switched off
// for the time (no pushing about: Austin's rule) and they are slowed to nothing too.
import { system, InputPermissionCategory } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { WAND, BEAM, DRAGON, DRAGON_EYE, mayCast, pickTarget, beamPoints, beamEnd, holdOf, holdOver } from "./wandRules.js";

const K = () => BALANCE.darian.wand;
const HELD = "zoocraft:wand_held"; // on a held player, so a hold cut short by leaving the world is lifted on return
/** @type {Map<string, number>} */
const lastCast = new Map();
/** @type {Map<string, { e: import("@minecraft/server").Entity, pos: any, rotation: any, until: number, player: boolean, scripted: boolean }>} */
const holds = new Map();

/** Whether the wand holds this entity now (the Void Dragon's own flying asks). */
export const wandHolds = (id) => holds.has(id);

function lock(player, on) {
  try {
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, !on);
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, !on);
    player.setDynamicProperty(HELD, on ? true : undefined);
  } catch (error) {
    reportError("wand lock", error);
  }
}

function glint(e) {
  try {
    const at = e.location;
    e.dimension.spawnParticle("zoocraft:frost_glint", { x: at.x, y: at.y + 1, z: at.z });
  } catch {
    // out of sight
  }
}

/** Holds an entity for the wand's five seconds (again from now if it is held already). */
export function freeze(target, now = system.currentTick) {
  const k = K();
  const player = target.typeId === "minecraft:player";
  let rotation;
  try {
    rotation = target.getRotation();
  } catch {
    rotation = undefined;
  }
  const old = holds.get(target.id);
  holds.set(target.id, { e: target, ...holdOf(old?.pos ?? target.location, rotation, now, k), player, scripted: target.typeId === DRAGON });
  try {
    target.addEffect("slowness", k.freeze, { amplifier: 255, showParticles: false });
  } catch {
    // it takes no effects: it is put back in its place all the same
  }
  if (player && !old) lock(/** @type {any} */ (target), true);
  try {
    target.dimension.playSound("random.glass", target.location, { volume: 0.8, pitch: 1.4 });
  } catch {
    // nobody hears it
  }
  glint(target);
}

function release(id, h) {
  holds.delete(id);
  try {
    if (h.player && h.e.isValid) lock(/** @type {any} */ (h.e), false);
  } catch (error) {
    reportError("wand release", error);
  }
}

/** Every tick while anything is held: mobs kept in their place, holds ended on time. */
export function tickWand(now = system.currentTick) {
  if (!holds.size) return;
  for (const [id, h] of [...holds]) {
    let valid = false;
    try {
      valid = h.e.isValid;
    } catch {
      valid = false;
    }
    if (!valid || holdOver(h, now)) {
      release(id, h);
      continue;
    }
    if (now % 10 === 0) glint(h.e);
    if (h.player || h.scripted) continue;
    try {
      h.e.teleport(h.pos, h.rotation ? { rotation: h.rotation, keepVelocity: false } : { keepVelocity: false });
    } catch {
      // unloaded: the hold runs out by itself
    }
  }
}

function eye(player) {
  const h = player.getHeadLocation();
  const v = player.getViewDirection();
  return { from: { x: h.x + v.x * 0.6, y: h.y + v.y * 0.6 - 0.15, z: h.z + v.z * 0.6 }, dir: v };
}

/** A player uses the wand. Returns "wait" (still cooling), "hit" or "miss". */
export function castWand(player, now = system.currentTick) {
  const k = K();
  if (!mayCast(now, lastCast.get(player.id), k)) return "wait";
  lastCast.set(player.id, now);
  try {
    player.startItemCooldown("zoocraft_wand", k.cooldown); // 0.1.321: the held wand's flick runs off this (RP attachables/freezing_wand.json)
  } catch {
    // no flick
  }
  const d = player.dimension;
  const { from, dir } = eye(player);
  let hits = [];
  try {
    hits = player.getEntitiesFromViewDirection({ maxDistance: k.range }).map((h) => ({ e: h.entity, id: h.entity.id, typeId: h.entity.typeId, distance: h.distance, alive: h.entity.getComponent("minecraft:health") !== undefined }));
  } catch {
    hits = [];
  }
  const hit = pickTarget(hits, player.id, k);
  let target = hit ? hits.find((h) => h.id === hit.id)?.e : undefined;
  let end;
  if (target) {
    const at = target.location;
    end = { x: at.x, y: at.y + (target.typeId === DRAGON_EYE ? 0.8 : 0.9), z: at.z };
    // an eye of the Void Dragon is the dragon
    if (target.typeId === DRAGON_EYE) target = d.getEntities({ type: DRAGON, location: at, maxDistance: 24, closest: 1 })[0] ?? target;
  } else {
    let far;
    try {
      const b = player.getBlockFromViewDirection({ maxDistance: k.range });
      if (b) far = Math.hypot(b.block.x + 0.5 - from.x, b.block.y + 0.5 - from.y, b.block.z + 0.5 - from.z);
    } catch {
      far = undefined;
    }
    end = beamEnd(from, dir, k.range, far);
  }
  for (const p of beamPoints(from, end)) {
    try {
      d.spawnParticle(BEAM, p);
    } catch {
      break; // out of loaded land
    }
  }
  try {
    d.playSound("beacon.power", from, { volume: 0.7, pitch: 1.8 });
  } catch {
    // nobody hears it
  }
  if (!target) return "miss";
  freeze(target, now);
  return "hit";
}

/** The wand's custom component (zoocraft:freezing_wand): right-click sends the beam. */
export function freezingWandComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseEvent} e */
    onUse(e) {
      const player = e.source;
      if (!player) return;
      system.run(() => {
        try {
          if (player.isValid) castWand(player);
        } catch (error) {
          reportError("freezing wand", error);
        }
      });
    },
  };
}

/** A player comes into the world: a hold that never ended (they left while held) is lifted. */
export function wandSpawn(player) {
  try {
    if (player.getDynamicProperty(HELD) && !holds.has(player.id)) lock(player, false);
  } catch (error) {
    reportError("wand spawn", error);
  }
}

/** For the test bench. */
export function wandDebug() {
  return { holds: [...holds].map(([id, h]) => ({ type: h.e.isValid ? h.e.typeId : "gone", until: h.until, player: h.player })), now: system.currentTick, wand: WAND };
}
