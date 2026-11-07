// The undead mounts (0.1.198, module 12: research/vanilla_plan.md "0.1.198 undead mounts: the design"), pure: plain
// records in, plain answers out. The game's skeleton horse, zombie horse and camel husk as zoo mobs (species.mob with
// species.undeadMount): a Mob House stable pen, the Mob Cage, no Passivity Serum (alone each is calm: the game's are
// passive till a monster rides one). The world side is transport/carriers.js (the catch), animals/mobs.js (the serum's
// word on one), animals/camel.js (a zoo camel husk kneels now and then as the zoo camel does), discovery/discovery.js
// (mountSight) and ui/fieldJournal.js (mountWildLine).

// The game's undead mounts and the zoo's copy of each.
export const UNDEAD_MOUNTS = {
  "minecraft:skeleton_horse": "zoocraft:zoo_skeleton_horse",
  "minecraft:zombie_horse": "zoocraft:zoo_zombie_horse",
  "minecraft:camel_husk": "zoocraft:zoo_camel_husk",
};

// The monsters the game puts on them (a skeleton trap's skeletons, a zombie horseman's zombie, a camel husk jockey's husk
// and parched, a baby zombie that jumped on), as a rider's name.
const RIDER_NAMES = {
  "minecraft:skeleton": "a skeleton",
  "minecraft:zombie": "a zombie",
  "minecraft:husk": "a husk",
  "minecraft:parched": "a parched",
  "minecraft:zombie_villager": "a zombie villager",
  "minecraft:zombie_villager_v2": "a zombie villager",
  "minecraft:drowned": "a drowned",
  "minecraft:stray": "a stray",
  "minecraft:bogged": "a bogged",
};

/** "a zombie", "a husk and a parched": the riders by name (any other, "a monster"). @param {string[]} types */
export function riderWords(types) {
  const names = types.map((t) => RIDER_NAMES[t] ?? "a monster");
  return names.length <= 1 ? names[0] ?? "" : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * Why a Mob Cage can't take this undead mount for its riders, or undefined (none, or only the player catching it: the
 * cage's ride fix sets them down first). A monster on it has to go first; another player has to get off.
 * @param {{ typeId: string, id?: string }[]} riders @param {string} name the species' display name @param {string} [playerId]
 */
export function riderBlock(riders, name, playerId) {
  const others = riders.filter((r) => r.id === undefined || r.id !== playerId);
  if (!others.length) return undefined;
  const mobs = others.filter((r) => r.typeId !== "minecraft:player");
  if (!mobs.length) return `Someone is riding this ${name}: they have to get off first.`;
  const who = riderWords(mobs.map((r) => r.typeId));
  return `This ${name} has ${who} riding it: ${mobs.length === 1 ? "its rider has" : "its riders have"} to go first. Defeat ${mobs.length === 1 ? "it" : "them"}, then use the Mob Cage on the ${name.toLowerCase()}.`;
}

/** The Passivity Serum used on one: calm on its own. @param {string} one "skeleton horse" @param {string} bait */
export function calmAloneText(one, bait) {
  return `A ${one} is calm on its own: with no monster on its back it never attacks, so the serum isn't needed. With ${bait} in your inventory a Mob Cage catches it (Mob Taming research) once its rider is gone.`;
}

/** Breeding switched on: the game's undead mounts never have foals. @param {string} plural */
export function mountBreedText(plural) {
  return `${plural} can't be bred: in the game no undead mount has foals (skeleton horses, zombie horses and camel husks alike). Catch more.`;
}

// How each lives in the wild (the Field Journal).
const WILD = {
  "minecraft:skeleton_horse": "they come only with a skeleton trap: in a thunderstorm lightning now and then leaves a skeleton horse standing alone, and when you come within 10 blocks of it more lightning turns it into four skeleton horsemen (skeletons with bows and iron helmets on skeleton horses). Alone one never attacks and never burns in the sun; in water it sinks and walks along the bottom, breathing there. Every one is tame from birth (anyone can ride one)",
  "minecraft:zombie_horse": "they come only as a zombie horseman's mount (a zombie with a spear riding it), at night on plains, snowy plains and savannas, one at a time. Alone one never attacks, but it burns in the sun and floats in water. A red mushroom heals one and it follows someone holding one",
  "minecraft:camel_husk": "they come only as a camel husk jockey's mount (a husk in front, a parched with a bow behind), at night in deserts, one at a time. Alone one never attacks and never burns in the sun; it kneels now and then, and dashes when ridden. A rabbit's foot heals one and it follows someone holding one. Every one is tame from birth (anyone can saddle one)",
};

/**
 * The Field Journal's line on wild ones and on catching one (no serum: they're calm alone).
 * @param {{ displayName: string, plural?: string, wildSource: string, baitText?: string }} species @param {string} bait
 */
export function mountWildLine(species, bait) {
  const plural = (species.plural ?? `${species.displayName}s`).toLowerCase();
  const one = species.displayName.toLowerCase();
  return `In the wild ${plural} are monsters' mounts: ${WILD[species.wildSource] ?? "a monster rides one"}. To take one for the zoo: defeat its rider, then, with ${bait} in your inventory, use a Mob Cage on the ${one} (Mob Taming research; no Passivity Serum: alone it's calm). If it lets you climb on instead, you're set down and it's caught. Not someone's own (a zombie horse a player tamed) or a young one`;
}

// How one lives in a stable (the Field Journal's pen line), its food and who shares its pen.
export const MOUNT_PEN_LIFE = {
  "zoocraft:zoo_skeleton_horse": "they wander about the stable, rattling now and then, and look round at the guests",
  "zoocraft:zoo_zombie_horse": "they wander about the stable, groaning now and then, and look round at the guests",
  "zoocraft:zoo_camel_husk": "it plods about the stable, kneels down to rest now and then and gets up again, and looks round at the guests",
};
export const MOUNT_FOOD = {
  "minecraft:red_mushroom": "red mushrooms (the game's zombie horse food) or Fungal Rations",
  "minecraft:rabbit_foot": "Meat Rations (a rabbit's foot coaxes one, as in the game)",
};
export const MOUNT_BAIT = {
  "zoocraft:bone_ration": "a Bone Ration",
  "minecraft:red_mushroom": "a red mushroom or a Fungal Ration",
  "minecraft:rabbit_foot": "a rabbit's foot or a Meat Ration",
};
// The serum's word on each of the game's (animals/mobRules.js serumCheck).
export const MOUNT_SERUM = {
  "minecraft:skeleton_horse": calmAloneText("skeleton horse", MOUNT_BAIT["zoocraft:bone_ration"]),
  "minecraft:zombie_horse": calmAloneText("zombie horse", MOUNT_BAIT["minecraft:red_mushroom"]),
  "minecraft:camel_husk": calmAloneText("camel husk", MOUNT_BAIT["minecraft:rabbit_foot"]),
};
export const UNDEAD_STABLE = "Skeleton horses and zombie horses share a stable";
