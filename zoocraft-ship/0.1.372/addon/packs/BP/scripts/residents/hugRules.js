// Hugging (0.1.372; Austin's notes for Zach, level 60: "he tells you a story of how the wardens sang the most beautiful
// song of all the mobs, you just have to give them a hug, and they become passive, and will sing the classic minecraft
// song for you, hugging unlocks only if players talk with zach here. You can now hug any mob."). No engine calls here.

export const HUG_GIVER = "zach";
export const HUG_ABILITY = "hug";
export const WARDEN = "minecraft:warden";
export const CALM_WARDEN = "zoocraft:calm_warden";
export const WARDEN_SONG = "zoocraft.warden.song";
/** The wardens that sing when hugged: a wild one (it turns passive first), a passive one, one living in the zoo. */
export const SINGERS = [WARDEN, CALM_WARDEN, "zoocraft:zoo_warden"];

/** Whether Zach has told this player the story (their friendship record with him). */
export const hasHug = (bond) => bond?.rewards?.[HUG_ABILITY] !== undefined;

/** A hug is: sneaking, an empty hand, used on a living thing, by a player who has heard the story. */
export function isHug(o) {
  return Boolean(o.sneaking && !o.held && o.alive && !o.inanimate && o.unlocked);
}

/** What a hug does to this kind of mob: "calm" a wild warden and it sings, "sing" for a passive one, else just "hug". */
export function hugKind(typeId) {
  if (typeId === WARDEN) return "calm";
  return SINGERS.includes(typeId) ? "sing" : "hug";
}

/** The name key the game shows for a kind of mob ("entity.warden.name", "entity.zoocraft:crocodile.name"). */
export function nameKey(typeId) {
  return `entity.${String(typeId).replace(/^minecraft:/, "")}.name`;
}

/** Whether a player may hug again yet, and whether a warden is still mid-song. */
export const hugReady = (last, now, g) => last === undefined || now - last >= g.cooldown;
export const stillSinging = (until, now) => until !== undefined && now < until;
