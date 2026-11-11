// The Full Healing Serum (0.1.250; Austin's NPC Expansion spec, "Full Healing Serum"): "instantly restores the
// selected target to its maximum health"; targets: the player using it, another player, zoo animals, vanilla mobs with
// health, custom ZooCraft creatures with health, other eligible living entities. "Does not increase the target's
// maximum health. Does not grant invulnerability." The spec leaves open "The crafting recipe, item consumption
// behavior, and any cooldowns": ours, his to change, are one serum used up by each healing, none used when there is
// nothing to heal, and no cooldown. No engine calls here.

/** What a use would do to a target with this health ({ current, max }, undefined when it has none): "none", "full" or "heal". */
export function serumCheck(health) {
  if (!health || !(health.max > 0)) return "none";
  return health.current >= health.max ? "full" : "heal";
}

/** A target's name for the messages: a player's name, its name tag, else its kind ("the zombie"). */
export function targetName(typeId, name, nameTag) {
  if (typeId === "minecraft:player" && name) return name;
  if (nameTag) return String(nameTag).replace(/§./g, "");
  const kind = String(typeId ?? "").replace(/^[^:]*:/, "").replace(/^zoo_/, "").replace(/_/g, " ").trim();
  return kind ? `the ${kind}` : "it";
}

/** The message for a use: `what` from serumCheck, `name` undefined for the player themself. */
export function serumText(what, name) {
  if (what === "none") return "§eThe Full Healing Serum can't help that. §7It works on living things with health.";
  if (what === "full") return name ? `§e${cap(name)} is already at full health. §7The serum is not used. Sneak and use it to heal yourself.` : "§eYou are already at full health. §7The serum is not used.";
  return name ? `§aThe Full Healing Serum restores ${name} to full health.` : "§aThe Full Healing Serum restores you to full health.";
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** One use a click, however many events the game sends for it: true when `tick` is far enough from the last use. */
export function freshUse(lastTick, tick) {
  return lastTick === undefined || tick - lastTick >= 4;
}
