// Hugging (0.1.372; rules residents/hugRules.js). Once Zach has told a player his story of the wardens (60 friendship),
// that player hugs any mob by sneaking and using an empty hand on it. A wild warden hugged turns into the passive
// warden the game already has (zoocraft:calm_warden) and sings the classic Minecraft song; a passive one sings again.
import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { bondOf } from "./bonds.js";
import { onlinePlayers, noteVars } from "../platform/mc.js";
import { HUG_GIVER, WARDEN, CALM_WARDEN, WARDEN_SONG, hasHug, isHug, hugKind, nameKey, hugReady, stillSinging } from "./hugRules.js";

const G = () => BALANCE.hug;
const lastHug = new Map(); // player id -> tick
const singing = new Map(); // entity id -> the tick its song ends

/** Whether this use of an entity is a hug (read-only: safe in a before event). */
export function hugTry(player, target, held) {
  try {
    if (!player.isSneaking || held) return false;
    const alive = Boolean(target.getComponent("minecraft:health"));
    const inanimate = target.typeId === "minecraft:player" || Boolean(target.getComponent("minecraft:type_family")?.hasTypeFamily("inanimate"));
    return isHug({ sneaking: true, held, alive, inanimate, unlocked: hasHug(bondOf(HUG_GIVER, player.id)) });
  } catch {
    return false;
  }
}

function hearts(entity) {
  try {
    const at = entity.getHeadLocation();
    for (let i = 0; i < G().hearts; i++) entity.dimension.spawnParticle("minecraft:heart_particle", { x: at.x + (Math.random() - 0.5) * 0.8, y: at.y + 0.4 + Math.random() * 0.4, z: at.z + (Math.random() - 0.5) * 0.8 });
  } catch {
    // unloaded
  }
}

// A wild warden turns passive where it stands: the same health, name and facing.
function calmed(warden) {
  const d = warden.dimension;
  const at = { ...warden.location };
  let rot;
  let hp;
  try {
    rot = warden.getRotation();
    hp = warden.getComponent("minecraft:health")?.currentValue;
  } catch {
    // the defaults
  }
  const name = warden.nameTag;
  warden.remove();
  const calm = d.spawnEntity(CALM_WARDEN, at);
  try {
    if (rot) calm.setRotation(rot);
    if (name) calm.nameTag = name;
    const h = calm.getComponent("minecraft:health");
    if (h && hp) h.setCurrentValue(Math.max(1, Math.min(hp, h.effectiveMax)));
  } catch {
    // as it spawned
  }
  return calm;
}

function sing(player, warden) {
  const now = system.currentTick;
  if (stillSinging(singing.get(warden.id), now)) return;
  singing.set(warden.id, now + G().songTicks);
  try {
    warden.dimension.playSound(WARDEN_SONG, warden.location, { volume: G().volume });
  } catch {
    // unloaded
  }
  player.sendMessage("§7The warden hums, low and slow, and begins to sing.");
}

/** The hug itself. */
export function hug(player, target) {
  try {
    const now = system.currentTick;
    if (!hugReady(lastHug.get(player.id), now, G())) return;
    lastHug.set(player.id, now);
    const kind = hugKind(target.typeId);
    const named = target.nameTag;
    const key = nameKey(target.typeId);
    let who = target;
    if (kind === "calm") who = calmed(target);
    hearts(who);
    player.sendMessage({ rawtext: [{ text: "§dYou hug " }, named ? { text: named } : { translate: key }, { text: kind === "calm" ? ". §7It goes still. It is gentle now." : "." }] });
    if (kind !== "hug") sing(player, who);
  } catch (error) {
    reportError("hug", error);
  }
}

/** Every second: notes rise from a singing warden. */
export function tickHugs() {
  if (!singing.size) return;
  const now = system.currentTick;
  for (const [id, until] of [...singing]) {
    const e = world.getEntity(id);
    if (!stillSinging(until, now) || !e?.isValid) {
      singing.delete(id);
      continue;
    }
    try {
      const at = e.getHeadLocation();
      e.dimension.spawnParticle("minecraft:note_particle", { x: at.x, y: at.y + 0.8, z: at.z }, noteVars());
    } catch {
      // unloaded
    }
  }
}

/** For the test server. */
export function hugDebug() {
  return { singing: [...singing].map(([id, until]) => [world.getEntity(id)?.typeId, until - system.currentTick]), players: onlinePlayers().map((p) => hasHug(bondOf(HUG_GIVER, p.id))), warden: WARDEN };
}
