// Sheila's beef with Ron (0.1.378; rules residents/slapRules.js). Once she has asked (friendship 100), the player's
// next hit on Ron is the slap: the player says who it was from, Ron says okay and laughs (residents take no damage),
// and Sheila's thanks and her carrot wait at her next Talk.
import { world } from "@minecraft/server";
import { reportError } from "../core/log.js";
import { residentById } from "../data/residents.js";
import { db } from "../persistence/db.js";
import { bondOf } from "./bonds.js";
import { bondLine } from "./bondRules.js";
import { message } from "../platform/mc.js";
import { SLAP_SENDER, SLAP_TARGET, slapAsked, isSlap, slapGate } from "./slapRules.js";

const COL = "sheilaSlap";

/** Whether this player has slapped Ron for her. */
export const slapDone = (playerId) => Boolean(playerId) && Boolean(db.get(COL, playerId)?.done);

/** For rewardRules.js. */
export const slapNeeds = (reward, bond) => slapGate(reward, slapDone(bond?.player));

function slap(player) {
  db.put(COL, { id: player.id, done: true, day: world.getDay() });
  const ron = residentById(SLAP_TARGET);
  const sheila = residentById(SLAP_SENDER);
  message(player, `§7You slap ${ron.name}. §fYou: §7"That was from ${sheila.name}."`);
  message(player, `§f${ron.name}: §7"${bondLine(ron, "slapped")}"`);
  message(player, `§7${ron.name} laughs. ${sheila.name} will want to hear about it.`);
}

/** The world event: `residentAt` (residents.js) says which resident an entity is. */
export function wireSlap(residentType, residentAt) {
  world.afterEvents.entityHitEntity.subscribe((e) => {
    const player = e.damagingEntity;
    const hit = e.hitEntity;
    if (player?.typeId !== "minecraft:player" || hit?.typeId !== residentType || !hit.isValid) return;
    try {
      const hitId = residentAt(hit)?.id;
      if (hitId !== SLAP_TARGET) return;
      if (isSlap({ asked: slapAsked(bondOf(SLAP_SENDER, player.id)), done: slapDone(player.id), hitId })) slap(player);
    } catch (error) {
      reportError("slap", error);
    }
  });
}

/** Bench only. */
export const slapDebug = (player, force) => ({ forced: force ? slap(player) ?? true : false, asked: slapAsked(bondOf(SLAP_SENDER, player.id)), done: slapDone(player.id) });
