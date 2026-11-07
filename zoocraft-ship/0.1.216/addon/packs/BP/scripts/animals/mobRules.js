// Hostile mobs in the zoo (0.1.163, module 11: research/mobhouse_plan.md), pure: plain records in, plain answers out.
// The world side is animals/mobs.js (the Passivity Serum, the zoo mobs' sounds, the spawn guard) and visitors/mobHouse.js
// (the Mob House block: its hall, its entry price).
//
// A vanilla zombie or skeleton weakened to a quarter of its health or less turns into a calmed one (its own entity,
// zoocraft:calm_zombie, the vanilla look, never hostile) when a Passivity Serum is used on it; a Mob Cage carries a calmed
// one to a pen; in the pen it is the zoo's (zoocraft:zoo_zombie). A pen is an exhibit inside a Mob House: beside its
// hall (the closed building round the Mob House block, where guests walk), shut in all round, roof included, and walled
// off from the hall (glass, glass panes or iron bars to look through; tinted glass for the mobs that like the dark: in
// Bedrock daylight comes into a hall through its door, even shut, and on through plain glass and iron bars, the 0.1.164
// bench found, and tinted glass alone keeps it out of the pen while the guests still see in).

// The vanilla mobs the serum calms, and what each becomes (0.1.164: the creeper and the spider too).
import { UNDEAD_MOUNTS, MOUNT_SERUM, MOUNT_PEN_LIFE, MOUNT_FOOD, UNDEAD_STABLE } from "./undeadMountRules.js";

export const MOB_KINDS = {
  "minecraft:zombie": "zoocraft:calm_zombie",
  "minecraft:skeleton": "zoocraft:calm_skeleton",
  "minecraft:creeper": "zoocraft:calm_creeper",
  "minecraft:spider": "zoocraft:calm_spider",
  // The husk and the zombie villager (0.1.199).
  "minecraft:husk": "zoocraft:calm_husk",
  "minecraft:zombie_villager_v2": "zoocraft:calm_zombie_villager",
  // The drowned (0.1.200).
  "minecraft:drowned": "zoocraft:calm_drowned",
  // The skeleton kin (0.1.201).
  "minecraft:stray": "zoocraft:calm_stray",
  "minecraft:bogged": "zoocraft:calm_bogged",
  "minecraft:parched": "zoocraft:calm_parched",
  "minecraft:wither_skeleton": "zoocraft:calm_wither_skeleton",
  // The small arthropods (0.1.202).
  "minecraft:cave_spider": "zoocraft:calm_cave_spider",
  "minecraft:silverfish": "zoocraft:calm_silverfish",
  "minecraft:endermite": "zoocraft:calm_endermite",
  // The slime and the magma cube (0.1.203).
  "minecraft:slime": "zoocraft:calm_slime",
  "minecraft:magma_cube": "zoocraft:calm_magma_cube",
  // The witch (0.1.204).
  "minecraft:witch": "zoocraft:calm_witch",
  // The phantom (0.1.205).
  "minecraft:phantom": "zoocraft:calm_phantom",
  // The piglins (0.1.206).
  "minecraft:piglin": "zoocraft:calm_piglin",
  "minecraft:piglin_brute": "zoocraft:calm_piglin_brute",
  "minecraft:zombie_pigman": "zoocraft:calm_zombified_piglin",
  // The hoglin and the zoglin (0.1.207).
  "minecraft:hoglin": "zoocraft:calm_hoglin",
  "minecraft:zoglin": "zoocraft:calm_zoglin",
  // The blaze and the ghast (0.1.208).
  "minecraft:blaze": "zoocraft:calm_blaze",
  "minecraft:ghast": "zoocraft:calm_ghast",
  // The enderman and the shulker (0.1.209).
  "minecraft:enderman": "zoocraft:calm_enderman",
  "minecraft:shulker": "zoocraft:calm_shulker",
  // The pillager, the vindicator, the evoker and the vex (0.1.210).
  "minecraft:pillager": "zoocraft:calm_pillager",
  "minecraft:vindicator": "zoocraft:calm_vindicator",
  "minecraft:evocation_illager": "zoocraft:calm_evoker",
  "minecraft:vex": "zoocraft:calm_vex",
  "minecraft:ravager": "zoocraft:calm_ravager", // 0.1.211
  "minecraft:guardian": "zoocraft:calm_guardian", // 0.1.212
  "minecraft:elder_guardian": "zoocraft:calm_elder_guardian", // 0.1.212
  "minecraft:breeze": "zoocraft:calm_breeze", // 0.1.213
  "minecraft:creaking": "zoocraft:calm_creaking", // 0.1.213
  "minecraft:warden": "zoocraft:calm_warden", // 0.1.214
  "minecraft:wither": "zoocraft:calm_wither", // 0.1.215
  "minecraft:ender_dragon": "zoocraft:calm_ender_dragon", // 0.1.216
  // The Cyclops (0.1.165): a rare mob, worn down in a fight as the bosses are (animals/boss.js) till it sits down panting.
  "zoocraft:wild_cyclops": "zoocraft:calm_cyclops",
  // The Necromancer (0.1.166): the second rare mob, worn down the same way till it kneels down panting.
  "zoocraft:wild_necromancer": "zoocraft:calm_necromancer",
  // The Voidling (0.1.167): the third rare mob, worn down the same way till it crouches down panting.
  "zoocraft:wild_voidling": "zoocraft:calm_voidling",
};
export const CALM_TYPES = new Set(Object.values(MOB_KINDS));
// The zoo's mobs, calmed or in a pen: their sounds (played by script; the entities have none of their own). `say` now
// and then (BALANCE.mobs.sayChance a second, times `chance`), at `volume` and about `pitch`; `hurt` when a player hits
// one. A creeper has no sound of its own but its hurt one and its fuse: a zoo creeper hisses softly and seldom (the
// fuse, quiet and low), and never swells.
export const MOB_SOUNDS = {
  "zoocraft:calm_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:zoo_zombie": { say: "mob.zombie.say", hurt: "mob.zombie.hurt" },
  "zoocraft:calm_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
  "zoocraft:zoo_skeleton": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt" },
  // The husk's and the zombie villager's own (0.1.199: the game's sounds.json gives them these).
  "zoocraft:calm_husk": { say: "mob.husk.ambient", hurt: "mob.husk.hurt" },
  "zoocraft:zoo_husk": { say: "mob.husk.ambient", hurt: "mob.husk.hurt" },
  "zoocraft:calm_zombie_villager": { say: "mob.zombie_villager.say", hurt: "mob.zombie_villager.hurt" },
  "zoocraft:zoo_zombie_villager": { say: "mob.zombie_villager.say", hurt: "mob.zombie_villager.hurt" },
  // The drowned's own (0.1.200), with its calls under water (`sayWater`, `hurtWater`: the game's say_water and hurt_water).
  "zoocraft:calm_drowned": { say: "mob.drowned.say", hurt: "mob.drowned.hurt", sayWater: "mob.drowned.say_water", hurtWater: "mob.drowned.hurt_water" },
  "zoocraft:zoo_drowned": { say: "mob.drowned.say", hurt: "mob.drowned.hurt", sayWater: "mob.drowned.say_water", hurtWater: "mob.drowned.hurt_water" },
  // The skeleton kin's own (0.1.201: the game's sounds.json gives them these).
  "zoocraft:calm_stray": { say: "mob.stray.ambient", hurt: "mob.stray.hurt" },
  "zoocraft:zoo_stray": { say: "mob.stray.ambient", hurt: "mob.stray.hurt" },
  "zoocraft:calm_bogged": { say: "mob.bogged.ambient", hurt: "mob.bogged.hurt" },
  "zoocraft:zoo_bogged": { say: "mob.bogged.ambient", hurt: "mob.bogged.hurt" },
  "zoocraft:calm_parched": { say: "mob.parched.ambient", hurt: "mob.parched.hurt" },
  "zoocraft:zoo_parched": { say: "mob.parched.ambient", hurt: "mob.parched.hurt" },
  "zoocraft:calm_wither_skeleton": { say: "entity.wither_skeleton.ambient", hurt: "entity.wither_skeleton.hurt" },
  "zoocraft:zoo_wither_skeleton": { say: "entity.wither_skeleton.ambient", hurt: "entity.wither_skeleton.hurt" },
  // The small arthropods' own (0.1.202: the game's sounds.json gives them these; the cave spider the spider's).
  "zoocraft:calm_cave_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:zoo_cave_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:calm_silverfish": { say: "mob.silverfish.say", hurt: "mob.silverfish.hit" },
  "zoocraft:zoo_silverfish": { say: "mob.silverfish.say", hurt: "mob.silverfish.hit" },
  "zoocraft:calm_endermite": { say: "mob.endermite.say", hurt: "mob.endermite.hit" },
  "zoocraft:zoo_endermite": { say: "mob.endermite.say", hurt: "mob.endermite.hit" },
  // The witch's own (0.1.204: the game's sounds.json gives it these).
  "zoocraft:calm_witch": { say: "mob.witch.ambient", hurt: "mob.witch.hurt" },
  "zoocraft:zoo_witch": { say: "mob.witch.ambient", hurt: "mob.witch.hurt" },
  // The phantom's own (0.1.205: the game's sounds.json gives it these; its wings' flap is the client's, as the game's).
  "zoocraft:calm_phantom": { say: "mob.phantom.idle", hurt: "mob.phantom.hurt" },
  "zoocraft:zoo_phantom": { say: "mob.phantom.idle", hurt: "mob.phantom.hurt" },
  // The piglins' own (0.1.206: the game's sounds.json gives them these; a piglin's admiring sound is the game's, sounds.json).
  "zoocraft:calm_piglin": { say: "mob.piglin.ambient", hurt: "mob.piglin.hurt" },
  "zoocraft:zoo_piglin": { say: "mob.piglin.ambient", hurt: "mob.piglin.hurt" },
  "zoocraft:calm_piglin_brute": { say: "mob.piglin_brute.ambient", hurt: "mob.piglin_brute.hurt" },
  "zoocraft:zoo_piglin_brute": { say: "mob.piglin_brute.ambient", hurt: "mob.piglin_brute.hurt" },
  "zoocraft:calm_zombified_piglin": { say: "mob.zombiepig.zpig", hurt: "mob.zombiepig.zpighurt" },
  "zoocraft:zoo_zombified_piglin": { say: "mob.zombiepig.zpig", hurt: "mob.zombiepig.zpighurt" },
  // The hoglin's and the zoglin's own (0.1.207: the game's sounds.json gives them these).
  "zoocraft:calm_hoglin": { say: "mob.hoglin.ambient", hurt: "mob.hoglin.hurt" },
  "zoocraft:zoo_hoglin": { say: "mob.hoglin.ambient", hurt: "mob.hoglin.hurt" },
  "zoocraft:calm_zoglin": { say: "mob.zoglin.idle", hurt: "mob.zoglin.hurt" },
  "zoocraft:zoo_zoglin": { say: "mob.zoglin.idle", hurt: "mob.zoglin.hurt" },
  // The blaze's and the ghast's own (0.1.208: the game's sounds.json gives them these).
  "zoocraft:calm_blaze": { say: "mob.blaze.breathe", hurt: "mob.blaze.hit" },
  "zoocraft:zoo_blaze": { say: "mob.blaze.breathe", hurt: "mob.blaze.hit" },
  "zoocraft:calm_ghast": { say: "mob.ghast.moan", hurt: "mob.ghast.scream" },
  "zoocraft:zoo_ghast": { say: "mob.ghast.moan", hurt: "mob.ghast.scream" },
  // The enderman's and the shulker's own (0.1.209: the game's sounds.json gives them these).
  "zoocraft:calm_enderman": { say: "mob.endermen.idle", hurt: "mob.endermen.hit" },
  "zoocraft:zoo_enderman": { say: "mob.endermen.idle", hurt: "mob.endermen.hit" },
  "zoocraft:calm_shulker": { say: "mob.shulker.ambient", hurt: "mob.shulker.hurt" },
  "zoocraft:zoo_shulker": { say: "mob.shulker.ambient", hurt: "mob.shulker.hurt" },
  // The illagers' and the vex's own (0.1.210: the game's sounds.json gives them these).
  "zoocraft:calm_pillager": { say: "mob.pillager.idle", hurt: "mob.pillager.hurt" },
  "zoocraft:zoo_pillager": { say: "mob.pillager.idle", hurt: "mob.pillager.hurt" },
  "zoocraft:calm_vindicator": { say: "mob.vindicator.idle", hurt: "mob.vindicator.hurt" },
  "zoocraft:zoo_vindicator": { say: "mob.vindicator.idle", hurt: "mob.vindicator.hurt" },
  "zoocraft:calm_evoker": { say: "mob.evocation_illager.ambient", hurt: "mob.evocation_illager.hurt" },
  "zoocraft:zoo_evoker": { say: "mob.evocation_illager.ambient", hurt: "mob.evocation_illager.hurt" },
  "zoocraft:calm_vex": { say: "mob.vex.ambient", hurt: "mob.vex.hurt" },
  "zoocraft:zoo_vex": { say: "mob.vex.ambient", hurt: "mob.vex.hurt" },
  // The ravager's own (0.1.211: the game's sounds.json gives it these).
  "zoocraft:calm_ravager": { say: "mob.ravager.ambient", hurt: "mob.ravager.hurt" },
  "zoocraft:zoo_ravager": { say: "mob.ravager.ambient", hurt: "mob.ravager.hurt" },
  // The guardians' own (0.1.212: the game's sounds.json gives them these, on land and in the water; the elder's own
  // calls under water).
  "zoocraft:calm_guardian": { say: "mob.guardian.land_idle", hurt: "mob.guardian.land_hit", sayWater: "mob.guardian.ambient", hurtWater: "mob.guardian.hit" },
  "zoocraft:zoo_guardian": { say: "mob.guardian.land_idle", hurt: "mob.guardian.land_hit", sayWater: "mob.guardian.ambient", hurtWater: "mob.guardian.hit" },
  "zoocraft:calm_elder_guardian": { say: "mob.guardian.land_idle", hurt: "mob.guardian.land_hit", sayWater: "mob.elderguardian.idle", hurtWater: "mob.elderguardian.hit" },
  "zoocraft:zoo_elder_guardian": { say: "mob.guardian.land_idle", hurt: "mob.guardian.land_hit", sayWater: "mob.elderguardian.idle", hurtWater: "mob.elderguardian.hit" },
  // The breeze's and the creaking's own (0.1.213: the game's sounds.json; a creaking has no hurt sound, it sways when hit).
  "zoocraft:calm_breeze": { say: "mob.breeze.idle_ground", hurt: "mob.breeze.hurt" },
  "zoocraft:zoo_breeze": { say: "mob.breeze.idle_ground", hurt: "mob.breeze.hurt" },
  "zoocraft:calm_creaking": { say: "mob.creaking.ambient", hurt: "mob.creaking.sway" },
  "zoocraft:zoo_creaking": { say: "mob.creaking.ambient", hurt: "mob.creaking.sway" },
  // The warden's own (0.1.214: the game's sounds.json; its heartbeat and steps are the client's, sounds.json).
  "zoocraft:calm_warden": { say: "mob.warden.idle", hurt: "mob.warden.hurt" },
  "zoocraft:zoo_warden": { say: "mob.warden.idle", hurt: "mob.warden.hurt" },
  "zoocraft:calm_wither": { say: "mob.wither.ambient", hurt: "mob.wither.hurt" }, // 0.1.215
  "zoocraft:zoo_wither": { say: "mob.wither.ambient", hurt: "mob.wither.hurt" },
  "zoocraft:calm_ender_dragon": { say: "mob.enderdragon.growl", hurt: "mob.enderdragon.hit", volume: 0.2, chance: 0.4 }, // 0.1.216: the game's growl is heard 128 blocks off
  "zoocraft:zoo_ender_dragon": { say: "mob.enderdragon.growl", hurt: "mob.enderdragon.hit", volume: 0.2, chance: 0.4 },
  "zoocraft:calm_creeper": { say: "random.fuse", hurt: "mob.creeper.say", volume: 0.3, pitch: 0.6, chance: 0.5 },
  "zoocraft:zoo_creeper": { say: "random.fuse", hurt: "mob.creeper.say", volume: 0.3, pitch: 0.6, chance: 0.5 },
  "zoocraft:calm_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:zoo_spider": { say: "mob.spider.say", hurt: "mob.spider.say" },
  "zoocraft:calm_cyclops": { say: "mob.ravager.ambient", hurt: "mob.hoglin.angry", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:zoo_cyclops": { say: "mob.ravager.ambient", hurt: "mob.hoglin.angry", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:calm_necromancer": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:zoo_necromancer": { say: "mob.skeleton.say", hurt: "mob.skeleton.hurt", volume: 0.6, pitch: 0.7, chance: 0.5 },
  "zoocraft:calm_voidling": { say: "mob.endermen.idle", hurt: "mob.endermen.hit", volume: 0.5, pitch: 0.6, chance: 0.5 },
  "zoocraft:zoo_voidling": { say: "mob.endermen.idle", hurt: "mob.endermen.hit", volume: 0.5, pitch: 0.6, chance: 0.5 },
};
export const ZOO_MOB_FAMILY = "zoocraft_mob";

// A calmed mob, as the serum's message names it, and the food it follows.
export const MOB_INFO = {
  "zoocraft:calm_zombie": { one: "zombie", bait: "a Meat Ration" },
  "zoocraft:calm_skeleton": { one: "skeleton", bait: "a Bone Ration" },
  "zoocraft:calm_husk": { one: "husk", bait: "a Meat Ration" },
  "zoocraft:calm_zombie_villager": { one: "zombie villager", bait: "a Meat Ration", note: " (it keeps its job and its home's clothes)" },
  "zoocraft:calm_drowned": { one: "drowned", bait: "a Meat Ration" },
  "zoocraft:calm_stray": { one: "stray", bait: "a Bone Ration" },
  "zoocraft:calm_bogged": { one: "bogged", bait: "a Bone Ration", note: " (it keeps its mushrooms, or its bare head if it was sheared)" },
  "zoocraft:calm_parched": { one: "parched", bait: "a Bone Ration" },
  "zoocraft:calm_wither_skeleton": { one: "wither skeleton", bait: "a Bone Ration", note: " (its sword never strikes)" },
  "zoocraft:calm_cave_spider": { one: "cave spider", bait: "a Meat Ration", note: " (and it never climbs or bites)" },
  "zoocraft:calm_silverfish": { one: "silverfish", bait: "a Grain Ration", note: " (and it never hides in the stone)" },
  "zoocraft:calm_endermite": { one: "endermite", bait: "Chorus Browse", note: " (and it never vanishes)" },
  "zoocraft:calm_slime": { one: "slime", bait: "a slimeball", note: " (and it keeps its size: small, medium or large)" },
  "zoocraft:calm_magma_cube": { one: "magma cube", bait: "some magma cream", note: " (and it keeps its size: small, medium or large)" },
  "zoocraft:calm_witch": { one: "witch", bait: "a Grain Ration", note: " (it never throws or drinks a potion)" },
  "zoocraft:calm_phantom": { one: "phantom", bait: "a Meat Ration", note: " (it never swoops at you or bites, and circles low)" },
  "zoocraft:calm_piglin": { one: "piglin", bait: "a Meat Ration", note: " (it keeps its weapon but never uses it, never turns into a zombified piglin, and still barters for a gold ingot)" },
  "zoocraft:calm_piglin_brute": { one: "piglin brute", bait: "a Meat Ration", note: " (its golden axe never strikes, and it never turns into a zombified piglin)" },
  "zoocraft:calm_zombified_piglin": { one: "zombified piglin", bait: "a Meat Ration", note: " (it keeps its weapon but never uses it)" },
  "zoocraft:calm_hoglin": { one: "hoglin", bait: "a Fungal Ration", note: " (it never charges you or knocks you back, and never turns into a zoglin)" },
  "zoocraft:calm_zoglin": { one: "zoglin", bait: "a Meat Ration", note: " (it never charges you or knocks you back, and goes for no other mob)" },
  "zoocraft:calm_blaze": { one: "blaze", bait: "an Ember Ration", note: " (it never shoots fireballs or sets you alight)" },
  "zoocraft:calm_ghast": { one: "ghast", bait: "a Meat Ration", note: " (it never shoots fireballs, and floats down to a Meat Ration held up)" },
  "zoocraft:calm_enderman": { one: "enderman", bait: "Chorus Browse", note: " (it never comes for you when you look at it, and never teleports away or takes blocks)" },
  // A shulker never moves on its own (0.1.209): only a Mob Cage moves it.
  "zoocraft:calm_shulker": { one: "shulker", bait: "Chorus Browse", note: " (it never shoots its bullets, and never teleports away)", stays: true },
  "zoocraft:calm_pillager": { one: "pillager", bait: "a Grain Ration", note: " (its crossbow never shoots, and a captain keeps its ominous banner)" },
  "zoocraft:calm_vindicator": { one: "vindicator", bait: "a Grain Ration", note: " (its arms stay crossed and its axe stowed, and a captain keeps its ominous banner)" },
  "zoocraft:calm_evoker": { one: "evoker", bait: "a Grain Ration", note: " (it never raises fangs or calls up vexes)" },
  "zoocraft:calm_vex": { one: "vex", bait: "a Grain Ration", note: " (its sword never strikes, it never flies through walls, and it never fades away)" },
  "zoocraft:calm_ravager": { one: "ravager", bait: "a Grain Ration", note: " (it never rams, bites or roars, and never tramples crops or leaves)" },
  "zoocraft:calm_guardian": { one: "guardian", bait: "a Fish Ration", note: " (it never fires its laser)" },
  "zoocraft:calm_elder_guardian": { one: "elder guardian", bait: "a Fish Ration", note: " (it never fires its laser or puts Mining Fatigue on anyone)" },
  "zoocraft:calm_breeze": { one: "breeze", bait: "a wind charge", note: " (it never leaps at you or fires a wind charge)" },
  "zoocraft:calm_creaking": { one: "creaking", bait: "a resin clump", note: " (it never creeps up on you or crumbles away at dawn, but a single hit still kills it)" },
  "zoocraft:calm_warden": { one: "warden", bait: "a Meat Ration", note: " (it never roars, strikes or fires a sonic boom, puts Darkness on no one, and never digs back into the ground)" },
  "zoocraft:calm_wither": { one: "wither", bait: "a Bone Ration", note: " (it never fires a skull, blows up, breaks a block or calls up wither skeletons, and it withers no one)" },
  "zoocraft:calm_ender_dragon": { one: "ender dragon", bait: "a Meat Ration", note: " (it never breathes fire, fires a fireball, perches or knocks anyone about, no crystal heals it, and it circles low)" },
  "zoocraft:calm_creeper": { one: "creeper", bait: "a Grain Ration", note: " (it never swells or explodes)" },
  "zoocraft:calm_spider": { one: "spider", bait: "a Meat Ration", note: " (and it never climbs)" },
  "zoocraft:calm_cyclops": { one: "Cyclops", bait: "a Meat Ration", note: " (no more club, stomps or rocks)" },
  "zoocraft:calm_necromancer": { one: "Necromancer", bait: "a Bone Ration", note: " (no more bolts, and it raises nothing)" },
  "zoocraft:calm_voidling": { one: "Voidling", bait: "Chorus Browse", note: " (no more grabs, rakes or orbs)" },
};

export const SERUM_TEXT = {
  research: "The Passivity Serum needs Mob Taming research at the Research Desk first.",
  other: "For now the Passivity Serum works only on zombies, husks, zombie villagers, drowned, skeletons, strays, bogged, parched, wither skeletons, creepers, spiders, cave spiders, silverfish, endermites, slimes, magma cubes, witches, phantoms, piglins, piglin brutes, zombified piglins, hoglins, zoglins, blazes, ghasts, endermen, shulkers, pillagers, vindicators, evokers, vexes, ravagers, guardians, elder guardians, breezes, creakings, wardens, withers, ender dragons, the Cyclops, the Necromancer and the Voidling.",
  baby: "Leave the young ones be: the serum is too strong for a baby.",
  strong: (calmAt) => `It shakes the serum off. Weaken it first (${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less).`,
  aim: "Look at a weakened zombie, husk, zombie villager, drowned, skeleton, stray, bogged, parched, wither skeleton, creeper, spider, cave spider, silverfish, endermite, slime, magma cube, witch, phantom, piglin, piglin brute, zombified piglin, hoglin, zoglin, blaze, ghast, enderman, shulker, pillager, vindicator, evoker, vex, ravager, guardian, elder guardian, breeze, creaking, warden, wither, ender dragon, Cyclops, Necromancer or Voidling up close, then use the serum.",
};
// A mob that shakes the serum off has its own words (the Cyclops: worn down in a fight till it sits down panting; the
// Necromancer, till it kneels).
const STRONG = {
  "minecraft:piglin": "It shakes the serum off. Weaken it first (a quarter of its health or less): every piglin and brute near it comes for you when you hit it.",
  "minecraft:piglin_brute": "It shakes the serum off. Weaken it first (a quarter of its health or less, 12 of 50): brutes hit hard with their golden axes.",
  "minecraft:zombie_pigman": "It shakes the serum off. Weaken it first (a quarter of its health or less): every zombified piglin near it comes for you when you hit it.",
  "minecraft:hoglin": "It shakes the serum off. Weaken it first (a quarter of its health or less, 10 of 40): hoglins charge and knock you back, but back away from a warped fungus planted near them.",
  "minecraft:zoglin": "It shakes the serum off. Weaken it first (a quarter of its health or less, 10 of 40): zoglins charge and knock you back, and nothing keeps them off.",
  "minecraft:blaze": "It shakes the serum off. Weaken it first (a quarter of its health or less, 5 of 20): blazes shoot fireballs that set you alight, but snowballs hurt them.",
  "minecraft:ghast": "It shakes the serum off. Weaken it first (a quarter of its health or less, 2.5 of 10): weak hits only, as a fireball hit back at a ghast kills it.",
  "minecraft:enderman": "It shakes the serum off. Weaken it first (a quarter of its health or less, 10 of 40): an enderman you look in the eyes comes for you (not while you wear a carved pumpkin on your head), and arrows never hit one.",
  "minecraft:shulker": "It shakes the serum off. Weaken it first (a quarter of its health or less, 7.5 of 30): hit it while its shell is open (shut, it shrugs off most hits), and dodge its bullets: they make you float up.",
  "minecraft:pillager": "It shakes the serum off. Weaken it first (a quarter of its health or less, 6 of 24): pillagers shoot crossbow bolts from up to 8 blocks off, and a hurt one calls the rest of its patrol on you.",
  "minecraft:vindicator": "It shakes the serum off. Weaken it first (a quarter of its health or less, 6 of 24): vindicators run at you with an iron axe, and hit hard.",
  "minecraft:evocation_illager": "It shakes the serum off. Weaken it first (a quarter of its health or less, 6 of 24): evokers raise fangs from the ground under you and call up vexes, and keep their distance.",
  "minecraft:vex": "It shakes the serum off. Weaken it first (a quarter of its health or less, 3.5 of 14): vexes fly through walls and lunge with their swords, and one an evoker calls up fades away within 2 minutes, so be quick.",
  "minecraft:guardian": "It shakes the serum off. Weaken it first (a quarter of its health or less, 7.5 of 30): guardians fire a laser at you from up to 16 blocks off.",
  "minecraft:elder_guardian": "It shakes the serum off. Weaken it first (a quarter of its health or less, 20 of 80): elder guardians fire a stronger laser and put Mining Fatigue on you.",
  "minecraft:breeze": "It shakes the serum off. Weaken it first (a quarter of its health or less, 7.5 of 30): breezes leap about and fire wind charges that knock you back, and bat arrows and tridents away, so hit one up close.",
  "minecraft:ender_dragon": "It shakes the serum off. Weaken it first (a quarter of its health or less: 50 of 200): break the end crystals on the pillars first (they heal it), then hit it up close as it perches on the exit portal.",
  "minecraft:wither": "It shakes the serum off. Weaken it first (a quarter of its health or less: 75 on Easy, 112.5 on Normal, 150 on Hard): withers fire exploding skulls that wither you, and below half health shrug off arrows and dash at you, so hit one up close.",
  "minecraft:warden": "It shakes the serum off. Weaken it first (a quarter of its health or less, 125 of 500): wardens hit for half your health and more and fire sonic booms through walls and shields; they are blind, but find you by sound and smell.",
  "minecraft:ravager": "It shakes the serum off. Weaken it first (a quarter of its health or less, 25 of 100): ravagers ram and bite hard and throw you back; block a bite with a shield and it may be stunned for 2 seconds, then it roars.",
  "minecraft:phantom": "It shakes the serum off. Weaken it first (a quarter of its health or less): hit it as it swoops at you, then use the serum when it swoops again.",
  "minecraft:witch": "It shakes the serum off. Weaken it first (a quarter of its health or less), and be quick: a hurt witch drinks a Potion of Healing.",
  "zoocraft:wild_cyclops": "It shakes the serum off. Wear it down first, till it sits down panting (a quarter of its health).",
  "zoocraft:wild_necromancer": "It shakes the serum off. Wear it down first, till it kneels down panting (a quarter of its health).",
  "zoocraft:wild_voidling": "It shakes the serum off. Wear it down first, till it crouches down panting (a quarter of its health).",
};

// A calmed one keeps the wild one's look (0.1.199: a zombie villager's job, the game's minecraft:variant 0 to 14, and its
// home's clothes, minecraft:mark_variant 0 to 6; 0.1.201 a bogged sheared of its mushrooms, the game's is_sheared): the
// calmed mob's events for them (zoocraft:coat_N, zoocraft:mark_N), none for a mob of one look; anything out of range is
// the first.
// 0.1.203: a slime's or magma cube's size (the game's minecraft:variant 1, 2 or 4: coat 0, 1 or 2; `sizes`).
// 0.1.206: a piglin's or zombified piglin's weapon (the item in its hand, `gear`: coat N is gear[N]) and golden armour
// (`gold`: animals/gold.js).
export const MOB_LOOKS = { "zoocraft:calm_piglin": { coats: 3, gear: ["minecraft:golden_sword", "minecraft:crossbow", "minecraft:golden_spear"], gold: true }, "zoocraft:calm_zombified_piglin": { coats: 4, gear: ["minecraft:golden_sword", "minecraft:golden_spear", "minecraft:crossbow", "minecraft:golden_axe"], gold: true }, "zoocraft:calm_zombie_villager": { coats: 15, marks: 7 }, "zoocraft:calm_bogged": { coats: 2, sheared: true }, "zoocraft:calm_slime": { coats: 3, sizes: true }, "zoocraft:calm_magma_cube": { coats: 3, sizes: true }, "zoocraft:calm_shulker": { coats: 17 }, "zoocraft:calm_pillager": { coats: 2, captain: true }, "zoocraft:calm_vindicator": { coats: 2, captain: true } };
// A slime's or magma cube's size from the game's variant (1 small, 2 medium, 4 large: coat 0, 1 or 2); none read, the
// large one (the game's and the zoo copy's spawn without a size give it).
/** @param {number | undefined} variant */
export function sizeCoat(variant) {
  const v = Number(variant);
  if (!Number.isFinite(v)) return 2;
  return v >= 3 ? 2 : v >= 2 ? 1 : 0;
}
/** @param {string} calmType @param {number | undefined} variant @param {number | undefined} mark @param {boolean} [sheared] @param {string} [held] @returns {string[]} */
export function lookEvents(calmType, variant, mark, sheared = false, held = undefined) {
  const L = /** @type {{ coats: number, marks?: number, sheared?: boolean, sizes?: boolean, gear?: string[] }} */ (MOB_LOOKS[calmType]);
  if (!L) return [];
  if (L.gear) return [`zoocraft:coat_${Math.max(0, L.gear.indexOf(held ?? ""))}`]; // a piglin's weapon (0.1.206); nothing known, the first
  if (L.sizes) return [`zoocraft:coat_${sizeCoat(variant)}`]; // a slime or magma cube: its size (0.1.203)
  if (L.sheared) return [`zoocraft:coat_${sheared ? 1 : 0}`]; // a bogged: bare or with its mushrooms
  const pick = (/** @type {number | undefined} */ v, /** @type {number} */ n) => (Number.isInteger(v) && /** @type {number} */ (v) >= 0 && /** @type {number} */ (v) < n ? /** @type {number} */ (v) : 0);
  // A zombie villager's job and its home's clothes; a shulker's colour alone (0.1.209: it has no mark events).
  const coat = `zoocraft:coat_${pick(variant, L.coats)}`;
  return L.marks ? [coat, `zoocraft:mark_${pick(mark, L.marks)}`] : [coat];
}

// Golden armour a piglin or zombified piglin wore in the wild (0.1.206): kept on the calmed one and in the zoo, as a mask
// (1 the helmet, 2 the chestplate, 4 the leggings, 8 the boots; animals/gold.js reads and puts it on).
export const GOLD_ARMOR = [
  { slot: "slot.armor.head", item: "minecraft:golden_helmet", word: "helmet" },
  { slot: "slot.armor.chest", item: "minecraft:golden_chestplate", word: "chestplate" },
  { slot: "slot.armor.legs", item: "minecraft:golden_leggings", word: "leggings" },
  { slot: "slot.armor.feet", item: "minecraft:golden_boots", word: "boots" },
];
/** The mask of the golden armour `has(slot, item)` finds. @param {(slot: string, item: string) => boolean} has */
export function goldMask(has) {
  return GOLD_ARMOR.reduce((m, g, i) => (has(g.slot, g.item) ? m | (1 << i) : m), 0);
}
/** The commands that put a mask's golden armour on a mob (run as it). @param {number} mask */
export function goldCommands(mask) {
  return GOLD_ARMOR.filter((_, i) => mask & (1 << i)).map((g) => `replaceitem entity @s ${g.slot} 0 ${g.item}`);
}
/** "golden helmet and boots", or "" for none. @param {number} mask */
export function goldWords(mask) {
  const w = GOLD_ARMOR.filter((_, i) => mask & (1 << i)).map((g) => g.word);
  return w.length ? `golden ${listWords(w, "and")}` : "";
}
/** The test that finds an item in a mob's slot (run as it). @param {string} slot @param {string} item */
export function hasItemCommand(slot, item) {
  return `testfor @s[hasitem={item=${item},location=${slot}}]`;
}
/** "a, b and c". @param {string[]} xs @param {string} last */
export function listWords(xs, last) {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${last} ${xs[xs.length - 1]}`;
}

// The serum's message once a mob is calmed.
/** @param {string} calmType */
export function calmedText(calmType) {
  const m = MOB_INFO[calmType] ?? { one: "mob", bait: "its food" };
  // A shulker (0.1.209) never moves on its own: it can't be led.
  const lead = m.stays ? ". It never moves on its own" : ", or lead it holding one";
  return `§aThe ${m.one} sparkles green and calms down. §fIt never attacks now${m.note ?? ""}. Bring it to a pen in a Mob House: a Mob Cage carries it (with ${m.bait} in your inventory)${lead}.`;
}

/**
 * What the Passivity Serum does to a mob: `{ calm: typeId }` when it works (the calmed mob's type), `{ why }` when it
 * doesn't (the serum is kept), undefined for anything that isn't a monster (nothing happens).
 * @param {{ typeId: string, hostile: boolean, baby: boolean, hp: number, max: number }} m @param {number} calmAt
 */
// A wither just built (0.1.215) charges up for 11 seconds (nothing hurts it) while its health climbs from almost nothing
// to full (3 a tick on the 1.26.62.1 server: under a quarter for its first second), then blows up. The serum waits out
// the charge: the add-on stamps a new one's spawn time (CHARGE_STAMP, Date.now(): animals/mobs.js) and the serum is
// refused for CHARGE_MS after it.
export const CHARGE_STAMP = "zoocraft:spawned_at";
export const CHARGE_MS = { "minecraft:wither": 12000 };
const CHARGING = {
  "minecraft:wither": "It shakes the serum off: a wither just built is still charging up (the 11 seconds before it blows up, while nothing hurts it). Wait for its blast, then weaken it.",
};
/** Is a mob of this type, spawned at `spawnedAt` (ms), still charging up at `now`? */
export function stillCharging(typeId, spawnedAt, now) {
  const ms = CHARGE_MS[typeId];
  return Boolean(ms) && typeof spawnedAt === "number" && now >= spawnedAt && now - spawnedAt < ms;
}
// The mobs that hover the vex's way (0.1.210) and the pen each lives in (0.1.215: the wither in the giant's tall pen).
export const HOVER_PENS = { "minecraft:vex": "mob_pen", "minecraft:wither": "mob_pen_giant" };

export function serumCheck(m, calmAt) {
  if (UNDEAD_MOUNTS[m.typeId]) return { why: MOUNT_SERUM[m.typeId] }; // the undead mounts (0.1.198): calm on their own
  const calm = MOB_KINDS[m.typeId];
  if (!calm) return m.hostile ? { why: SERUM_TEXT.other } : undefined;
  if (m.baby) return { why: SERUM_TEXT.baby };
  if (m.charging) return { why: CHARGING[m.typeId] ?? SERUM_TEXT.strong(calmAt) }; // a wither just built (0.1.215)
  // A quarter of its health or less, or 1 health (0.1.203: a small slime or magma cube has 1 at most, and no hit leaves it weaker).
  if (!(m.max > 0) || m.hp > Math.max(m.max * calmAt, 1) + 1e-9) return { why: STRONG[m.typeId] ?? SERUM_TEXT.strong(calmAt) };
  return { calm };
}

// ---------------- boxes ----------------

/** @typedef {{ min: { x: number, y: number, z: number }, max: { x: number, y: number, z: number } }} Box */

// The gap in blocks between two boxes of cells (0 when they touch or overlap).
/** @param {Box} a @param {Box} b */
export function boxGap(a, b) {
  const dx = Math.max(0, a.min.x - b.max.x, b.min.x - a.max.x);
  const dy = Math.max(0, a.min.y - b.max.y, b.min.y - a.max.y);
  const dz = Math.max(0, a.min.z - b.max.z, b.min.z - a.max.z);
  return Math.max(dx, dy, dz);
}

/** @param {Box} b @param {number} n @returns {Box} */
export function grow(b, n) {
  return { min: { x: b.min.x - n, y: b.min.y - n, z: b.min.z - n }, max: { x: b.max.x + n, y: b.max.y + n, z: b.max.z + n } };
}

/** @param {{ x: number, y: number, z: number }} p @param {Box} b */
export function inBox(p, b) {
  return p.x >= b.min.x && p.x < b.max.x + 1 && p.y >= b.min.y && p.y < b.max.y + 1 && p.z >= b.min.z && p.z < b.max.z + 1;
}

// ---------------- the pen ----------------

/**
 * The working Mob Houses (their hall measured closed: room "ok") whose hall a pen's walking box is beside, within
 * `reach` blocks (a wall or two between them), nearest first.
 * @template {{ id: string, dimension: string, room?: string, bbox?: Box }} H
 * @param {H[]} houses @param {string} dimension @param {Box | undefined} box @param {number} reach @returns {H[]}
 */
export function housesNear(houses, dimension, box, reach) {
  if (!box) return [];
  return houses
    .filter((h) => h.dimension === dimension && h.room === "ok" && h.bbox && boxGap(box, h.bbox) <= reach)
    .sort((a, b) => boxGap(box, /** @type {Box} */ (a.bbox)) - boxGap(box, /** @type {Box} */ (b.bbox)));
}

const SIDES = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

/**
 * The pen measure: the pen's air flood (closed all round, roof included, or where it leads out), the Mob House it is
 * beside, and whether its air is the hall's (it opens into the hall: every open block beside the Mob House block is in
 * the pen's air too).
 * @param {{ enclosed: boolean, escape?: { x: number, y: number, z: number } }} room
 * @param {{ id: string, pos: { x: number, y: number, z: number } }[]} houses (housesNear's, nearest first)
 * @param {(x: number, y: number, z: number) => boolean} open a block guests or mobs can stand in (air)
 * @param {(x: number, y: number, z: number) => boolean} inPen in the pen's air flood
 */
export function penReport(room, houses, open, inPen) {
  const house = houses[0];
  let leaks = false;
  if (house) {
    const airy = SIDES.map(([dx, dy, dz]) => [house.pos.x + dx, house.pos.y + dy, house.pos.z + dz]).filter(([x, y, z]) => open(x, y, z));
    leaks = airy.length > 0 && airy.every(([x, y, z]) => inPen(x, y, z));
  }
  return { enclosed: Boolean(room.enclosed), escape: room.escape, houseId: house?.id, leaks };
}

export const PEN_HOW = "a pen beside a Mob House's hall (the closed building round the Mob House block, where guests walk), its walls touching the hall's, shut in all round with a roof, and walled off from the hall with glass, glass panes or iron bars to look through (tinted glass for mobs that like the dark: daylight comes into the hall through its door, even shut, and on through plain glass and bars)";

/**
 * Why mobs can't live in this pen (fitFor, and an issue while they live there), or undefined.
 * @param {{ enclosed: boolean, escape?: { x: number, y: number, z: number }, houseId?: string, leaks: boolean } | undefined} pen
 * @param {string} plural @param {boolean} houseWorks the pen's Mob House still has its hall
 */
export function mobPenProblem(pen, plural, houseWorks) {
  if (!pen) return `${plural} live only in ${PEN_HOW}. Build it, then use the Habitat Marker on the ground inside again.`;
  if (!pen.houseId) return `${plural} live only in a pen beside a Mob House's hall, and no working Mob House is beside this one: put a Mob House block inside a closed hall (walls, floor and roof, at least 3 x 3 x 3 inside) whose walls touch the pen's, then use the Habitat Marker on the ground inside again.`;
  if (!houseWorks) return "The Mob House beside this pen is closed: use the Mob House block to see why, then use the Habitat Marker on the ground inside again.";
  if (pen.leaks) return "The pen opens into the Mob House's hall: wall it off (glass, glass panes or iron bars to look through), then use the Habitat Marker on the ground inside again.";
  if (!pen.enclosed) return `${plural} must be shut in all round, roof included: the pen's air leads out${pen.escape ? ` near ${pen.escape.x} ${pen.escape.y} ${pen.escape.z}` : ""}. Close the walls and the roof, then use the Habitat Marker on the ground inside again.`;
  return undefined;
}

// ---------------- the floor they like ----------------

// The sea floor (0.1.200): what a column of water holds above it, and how far down it is looked for (the stingrays' sand
// count's, exhibits/geometry.js SAND_DEPTH).
const WATERY = new Set(["minecraft:water", "minecraft:flowing_water", "minecraft:seagrass", "minecraft:kelp", "minecraft:bubble_column"]);
const FOOT_DEPTH = 24;

export function newMobFloorResult() {
  return { cells: 0, ids: /** @type {Record<string, number>} */ ({}) };
}

/**
 * The floor blocks under the pen's floor cells that a mob living here likes (`opts.ids`), counted by id. With
 * `opts.water` (0.1.200, a mob that walks the bottom of its water: species.mobFloor.underWater) the foot of the water is
 * floor too: the block under each column of it (the flood keeps to the top of the water), seagrass and kelp passed.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number, ids: Set<string>, water?: boolean }} opts
 * @param {{ cells: number, ids: Record<string, number> }} out
 */
export function* measureMobFloor(idAt, cells, opts, out) {
  let work = 0;
  for (const [k, kind] of cells) {
    if (kind !== "land" && !(opts.water && kind === "water")) continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    let fy = y - 1;
    if (kind === "water") while (fy > y - 1 - FOOT_DEPTH && WATERY.has(idAt(x, fy, z) ?? "")) fy--;
    out.cells++;
    const id = idAt(x, fy, z) ?? "";
    if (opts.ids.has(id)) out.ids[id] = (out.ids[id] ?? 0) + 1;
  }
  return out;
}

// The share of the floor a species likes (0..1), from the floor measure; undefined not measured.
/** @param {{ mobFloor?: { ids: string[] } }} species @param {{ mobFloor?: { cells: number, ids: Record<string, number> } }} ex */
export function mobFloorShare(species, ex) {
  const t = ex.mobFloor;
  if (!species.mobFloor || !t) return undefined;
  const n = species.mobFloor.ids.reduce((s, id) => s + (t.ids[id] ?? 0), 0);
  return t.cells ? n / t.cells : 0;
}

// ---------------- what they like in the pen (0.1.164) ----------------

export function newMobDecorResult() {
  return { ids: /** @type {Record<string, number>} */ ({}) };
}

const AROUND = [[0, 0, 0], ...SIDES];

/**
 * The blocks in the pen's air and round it (its walls, floor and roof) that a mob living here likes (`opts.ids`),
 * counted by id, each block once: cobwebs hung in the corners (they stand in the air), leaves in a wall or as a bush on
 * the floor, ferns on the grass.
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells the pen's air flood @param {{ cellsPerYield: number, ids: Set<string> }} opts
 * @param {{ ids: Record<string, number> }} out
 */
export function* measureMobDecor(idAt, cells, opts, out) {
  const seen = new Set();
  let work = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of AROUND) {
      const p = `${x + dx},${y + dy},${z + dz}`;
      if (seen.has(p)) continue;
      seen.add(p);
      if (++work % opts.cellsPerYield === 0) yield;
      const id = idAt(x + dx, y + dy, z + dz) ?? "";
      if (opts.ids.has(id)) out.ids[id] = (out.ids[id] ?? 0) + 1;
    }
  }
  return out;
}

// How many of what a species likes are in its pen (species.mobDecor: Creepers' leaves or ferns, Spiders' cobwebs);
// undefined not measured.
/** @param {{ mobDecor?: { ids: string[] } }} species @param {{ mobFloor?: { decor?: { ids: Record<string, number> } } }} ex */
export function mobDecorCount(species, ex) {
  const d = ex.mobFloor?.decor;
  if (!species.mobDecor || !d) return undefined;
  return species.mobDecor.ids.reduce((s, id) => s + (d.ids[id] ?? 0), 0);
}

// Enough of the floor they like and of what they like in the pen (cause "mobfloor"). False caps comfort. Not measured
// yet: passes.
/** @param {{ mobFloor?: { ids: string[], share: number }, mobDecor?: { ids: string[], min: number } }} species @param {any} ex */
export function hasMobFloor(species, ex) {
  const share = mobFloorShare(species, ex);
  const floor = share === undefined || share >= /** @type {{ share: number }} */ (species.mobFloor).share - 1e-9;
  const n = mobDecorCount(species, ex);
  return floor && (n === undefined || n >= /** @type {{ min: number }} */ (species.mobDecor).min);
}

// What a mob wants in its pen, in words (the comfort cause's text): its floor, and what it likes in the pen.
/** @param {any} s */
export function mobLikesText(s) {
  const parts = [];
  if (s?.mobFloor) parts.push(`${s.mobFloor.how} under ${Math.round(s.mobFloor.share * 100)}% of the floor or more`);
  if (s?.mobDecor) parts.push(`${s.mobDecor.min} or more ${s.mobDecor.how} in the pen`);
  return parts.join(", and ") || "the floor they like";
}

// ---------------- the dark (zombies, spiders) ----------------

// The brightest light a mob that likes the dark allows on its floor: the Nocturnal Lamps' (7), or its own (Spiders: 4).
/** @param {{ darkLight?: number }} species @param {any} balance */
export function darkLimit(species, balance) {
  return species.darkLight ?? balance.nocturnal.maxLight;
}

// How to light a pen for mobs that like the dark, to `max`.
/** @param {number} max @param {number} lamps the Nocturnal Lamps' light */
export function darkHow(max, lamps) {
  return max >= lamps ? `Nocturnal Lamps or glow lichen at most (nothing brighter than light ${max})` : `nothing brighter than light ${max} on the floor: a Nocturnal Lamp hung 3 blocks above the floor gives ${lamps - 3} right under it (torches and lanterns are far too bright)`;
}

/**
 * The Exhibit Clipboard's dark line for mobs that like the dark (species.lowLight), or undefined.
 * @param {any} ex @param {any[]} living the mob species living here
 * @param {{ house: boolean, problems: string[] }} h is it a nocturnal house, and why not (animals/nightRules.js)
 * @param {any} balance
 */
export function mobDarkLine(ex, living, h, balance) {
  const dark = living.filter((sp) => sp.lowLight);
  if (!dark.length) return undefined;
  const who = dark.map((sp) => sp.plural ?? `${sp.displayName}s`).join(" and ");
  if (!ex.house) return "§fDark: §7not measured yet: use the Habitat Marker on the ground inside again";
  const max = Math.min(...dark.map((sp) => darkLimit(sp, balance)));
  const lamps = balance.nocturnal.maxLight;
  const own = `too bright, brightest spot ${ex.house.brightest} of ${max} allowed (${darkHow(max, lamps)})`;
  // A mob with its own darker dark (spiders, cave spiders: 4): the house's "too bright" says its own limit (0.1.202).
  const problems = h.house ? [] : h.problems.map((p) => (max < lamps && p.startsWith("too bright") ? own : p));
  if (!problems.length && ex.house.brightest > max) problems.push(own);
  if (!problems.length) return `§fDark: §ayes§7 (${who.toLowerCase()} like it; Nocturnal Lamps let the guests see them)`;
  return `§fDark: §cno§7: ${problems.join("; ")}. ${who.endsWith("s") ? `${who}'` : `${who}'s`} comfort can't rise above ${balance.chorusMoth.dimComfortCap}`;
}

/** The care warning for mobs that like the dark, out of it. @param {any} species @param {string} plural @param {any} balance */
export function mobDarkWarning(species, plural, balance) {
  return { severity: 2, text: `${plural} like the dark: roof the pen, wall it with solid blocks and use tinted glass to the hall (daylight comes into the hall through its door, even shut, and on through plain glass, glass panes and iron bars; tinted glass keeps it out and the guests still see in), and light it with ${darkHow(darkLimit(species, balance), balance.nocturnal.maxLight)}. In daylight comfort can't rise above ${balance.chorusMoth.dimComfortCap}. Measure again with the Habitat Marker after.` };
}

// ---------------- the clipboard, the warnings, the journal ----------------

const pluralOf = (/** @type {any} */ sp) => sp.plural ?? `${sp.displayName}s`;
// "Zombies'", "Drowned's" (0.1.200: a plural without an s).
const possessive = (/** @type {string} */ p) => (p.endsWith("s") ? `${p}'` : `${p}'s`);

/**
 * The Exhibit Clipboard's lines for mobs: the pen, the floor they like and what they like in the pen (each species
 * living here), the dark (zombies, spiders).
 * @param {any} ex @param {any[]} living the mob species living here @param {boolean} houseWorks @param {{ dark?: string, floorCap: number }} o
 */
export function mobLines(ex, living, houseWorks, o) {
  const lines = [];
  const plural = living.length === 1 ? pluralOf(living[0]) : "Mobs";
  const problem = mobPenProblem(ex.mobPen, plural, houseWorks);
  lines.push(problem ? `§fMob pen: §c${problem}` : "§fMob pen: §abeside a working Mob House§7, shut in all round and walled off from its hall. The house keeps wild monsters from spawning inside it");
  for (const sp of living) {
    if (sp.mobFloor) {
      const share = mobFloorShare(sp, ex);
      const want = Math.round(sp.mobFloor.share * 100);
      if (share === undefined) lines.push(`§f${possessive(pluralOf(sp))} floor: §7not measured yet: use the Habitat Marker on the ground inside again`);
      else lines.push(`§f${possessive(pluralOf(sp))} floor: ${share >= sp.mobFloor.share - 1e-9 ? "§a" : "§c"}${Math.round(share * 100)}%§7 of it ${sp.mobFloor.how} (${want}% wanted; below it comfort can't rise above ${o.floorCap})`);
    }
    if (sp.mobDecor) {
      const n = mobDecorCount(sp, ex);
      const what = sp.mobDecor.how.charAt(0).toUpperCase() + sp.mobDecor.how.slice(1);
      if (n === undefined) lines.push(`§f${what}: §7not measured yet: use the Habitat Marker on the ground inside again`);
      else lines.push(`§f${what}: ${n >= sp.mobDecor.min ? "§a" : "§c"}${n}§7 in the pen (${sp.mobDecor.min} or more for ${pluralOf(sp).toLowerCase()}; fewer and comfort can't rise above ${o.floorCap})`);
    }
  }
  if (o.dark) lines.push(o.dark);
  return lines;
}

/** Care warnings for mobs: the floor they like, and what they like in the pen. @param {any} ex @param {string} plural @param {any} species @param {number} cap */
export function mobWarnings(ex, plural, species, cap) {
  const out = [];
  const share = mobFloorShare(species, ex);
  if (species.mobFloor && share !== undefined && share < species.mobFloor.share - 1e-9) out.push({ severity: 2, text: `${plural} want ${species.mobFloor.how} under ${Math.round(species.mobFloor.share * 100)}% of their floor or more (${Math.round(share * 100)}% now). Without it comfort can't rise above ${cap}.` });
  const n = mobDecorCount(species, ex);
  if (species.mobDecor && n !== undefined && n < species.mobDecor.min) out.push({ severity: 2, text: `${plural} want ${species.mobDecor.min} or more ${species.mobDecor.how} in their pen (${n} now)${species.mobDecor.where ? `: ${species.mobDecor.where}` : ""}. Without them comfort can't rise above ${cap}.` });
  return out;
}

// How each one lives in the wild, and how it lives in a pen (the Field Journal).
const WILD_HOW = {
  "minecraft:ender_dragon": "one waits on the End's main island for whoever comes through the End portal. It circles the obsidian pillars (the end crystals on top heal it), dives at you and knocks you flying, fires dragon fireballs that leave clouds of purple breath, and now and then perches on the exit portal and breathes over it; a kill lights the portal home, and four end crystals on the portal's sides bring another. Break the crystals and hit it up close as it perches; the End sends another at once when one is calmed",
  "minecraft:wither": "they come only when someone builds one: four soul sand or soul soil in a T with three wither skeleton skulls on top. It charges up for 11 seconds, blows up, then flies about firing exploding skulls that wither you, breaks the blocks round it when hurt, and below half health shrugs off arrows, calls up wither skeletons (not on Easy) and dashes at you, smashing through blocks",
  "minecraft:warden": "they come only in the deep dark, deep underground: one digs up out of the ground when sculk shriekers have been set off four times near you, and digs back down after a minute without hearing anything. Blind, they find you by sound and smell, hit for half your health and more, fire sonic booms through walls and shields, and put Darkness on you",
  "minecraft:breeze": "they come only from the trial spawners in trial chambers (set in chiseled tuff in the combat rooms). They leap about, up to 15 blocks at a time, fire wind charges that knock you back from up to 16 blocks off, and bat arrows and tridents away (a wind charge hits them)",
  "minecraft:creaking": "an active creaking heart (one set between two pale oak logs) makes one at night in a pale garden. While its heart stands nothing hurts it (a hit only makes it sway and grows resin on the logs near the heart); it stands still while you look at it, creeps up on you when you don't, and crumbles away at dawn. One from a spawn egg stays, and dies to a single hit",
  "minecraft:guardian": "they live only at ocean monuments, in the water in and around them. They swim in quick charges and fire a laser from up to 16 blocks off at players, squid and axolotls; out of the water they flop about but never suffocate",
  "minecraft:elder_guardian": "there are only three in each ocean monument, made with it and never again: one in the top room and one in each wing. They fire a stronger laser and now and then put Mining Fatigue on every player nearby (you see one's ghost)",
  "minecraft:ravager": "they come only with raids, from the third wave, now and then with a pillager, a vindicator or an evoker riding them. They trample crops and leaves, ram and bite anything in their way and throw it back, and roar when a shield stuns them",
  "minecraft:pillager": "they roam the Overworld in patrols of 2 to 5 after the fifth day, led by a captain with an ominous banner, keep coming at their outposts (up to 8 at a time) and raid villages. They shoot crossbow bolts from up to 8 blocks off, and a hurt one calls the rest of its patrol on you",
  "minecraft:vindicator": "they live in the woodland mansions of dark forests, 1 to 3 to a room, there from the start (no more ever come), and come with raids. Arms crossed till they see you, then they run at you with an iron axe; name one Johnny and it goes for every mob but illagers",
  "minecraft:evocation_illager": "they live on the upper floors of the woodland mansions, there from the start, and come with raids from the fifth wave. They keep their distance, raise fangs from the ground under you, call up vexes three at a time and turn blue sheep red",
  "minecraft:vex": "an evoker calls them up three at a time. They fly through walls and anything else, glow red as they lunge with their swords, and start to fade away 30 seconds to 2 minutes after they come",
  "minecraft:enderman": "they walk the whole End in fours, the Overworld in the dark (light 0) 1 or 2 at a time, and the Nether's warped forests (most), Nether wastes and soul sand valleys alone. Look one in the eyes and it screams and comes for you (not while you wear a carved pumpkin on your head). They teleport about, away from arrows and out of the water and rain that hurt them, and pick up blocks",
  "minecraft:shulker": "they sit on the walls of the End cities and in their End ships, out on the End's outer islands (through an End gateway), shut in their shells to look like purpur; now and then one peeks out. Come near and it opens to shoot bullets that home in on you and make you float up; shut, it shrugs off most hits. They never despawn",
  "minecraft:blaze": "they guard the Nether fortresses, 1 to 3 at a time in the dim (light 11 or less), and come from the fortresses' blaze spawners. With nobody to fight they wander over the ground, their rods spinning about them; at you they float up and shoot volleys of three fireballs that set you alight. Water, rain and snowballs hurt them, fire and lava never",
  "minecraft:ghast": "they float over the Nether wastes, soul sand valleys and basalt deltas, always alone, crying now and then (you hear it far off). One that sees you opens its eyes and shoots a fireball every 3 seconds; hit the fireball back and it kills the ghast. Fire and lava never hurt them",
  "minecraft:hoglin": "they roam the Nether's crimson forests, 3 or 4 at a time, and the hoglin stables of bastion remnants, and charge you and knock you back; they back away from warped fungus, Nether portals and respawn anchors (and piglins hunt them). Taken out of the Nether one shakes and turns into a zoglin after 15 seconds, so calm it in the Nether. The game's breed with crimson fungus",
  "minecraft:zoglin": "there are none but the hoglins taken out of the Nether: after 15 seconds one shakes and turns into a zoglin. They go for you and any mob near them but creepers and other zoglins, and knock you back; nothing keeps them off, and fire and lava never hurt them. They never breed",
  "minecraft:piglin": "they live in the Nether's crimson forests and wastes, 3 or 4 at a time, and in bastion remnants, with a golden sword, a crossbow or (now and then) a golden spear, and sometimes golden armour. They leave you be while you wear a piece of golden armour and barter for gold ingots (hand one an ingot: it looks it over and tosses you something), but hit one, open a chest or break gold near them and they all come for you. Taken out of the Nether one shakes and turns into a zombified piglin after 15 seconds, so calm it in the Nether. A calmed one keeps its weapon and armour",
  "minecraft:piglin_brute": "a few live in some rooms of the bastion remnants, there from the start (no more ever come), swing a golden axe and go for you whatever you wear; they never take gold. Taken out of the Nether one turns into a zombified piglin after 15 seconds, so calm it in the Nether",
  "minecraft:zombie_pigman": "they wander the Nether wastes, crimson forests and fortresses, 2 to 4 at a time, with a golden sword (now and then a golden spear); in the Overworld they come out of Nether portals, from a pig that lightning strikes and from piglins that leave the Nether (keeping their crossbows and axes). They leave you be till you hit one: then every one near it comes for you. Fire and lava never hurt them. A calmed one keeps its weapon and armour",
  "minecraft:phantom": "they come in the night sky, 1 to 4 at a time, over a player who hasn't slept in a bed for three days or more and has only open sky over them (sleep and they stop coming). They circle high, swoop down every 10 to 20 seconds to bite, and burn in the daylight; they keep away from cats and ocelots. Hit one as it swoops, and use the serum on it as it swoops again",
  "minecraft:witch": "they come one at a time anywhere dark in the Overworld (not mushroom fields, the deep dark, rivers or snowy plains), live in swamp huts, come with raids, and a villager struck by lightning turns into one. They throw splash potions at you (harming, poison, slowness and weakness) and drink potions to heal, to breathe under water, against fire and to run, so weaken one and use the serum quickly, before it drinks a Potion of Healing",
  "minecraft:slime": "they come out in swamps on dark nights (most on a full moon) and deep underground in slime chunks in any light, hop straight at you and hurt you by touch; killed, a large one splits into medium ones and a medium one into small ones (the small ones are harmless). Punch a medium one down (a sword splits it); a small one has 1 health and calms as it is",
  "minecraft:magma_cube": "they hop about the Nether in any light, most in the basalt deltas, leap high and straight at you and hurt you by touch; fire, lava and falls never hurt them. Killed, a large one splits into medium ones and a medium one into small ones. Punch a medium one down (a sword splits it); a small one has 1 health and calms as it is",
  "minecraft:cave_spider": "they come from the monster spawners of abandoned mineshafts, among the cobwebs, and in sulfur caves every spider is one. Smaller than a spider, they slip through gaps a block wide, climb walls and their bite poisons you. A skeleton riding one jumps off when it is calmed",
  "minecraft:silverfish": "they hide in infested stone, cobblestone, deepslate and stone bricks (in strongholds, under mountains and windswept hills, in igloo basements and woodland mansions) and break out when the block is mined; hit one and more break out round it, and idle ones creep back into the stone. Punch one down: a sword kills it",
  "minecraft:endermite": "now and then one comes out where an ender pearl a player throws lands, goes for you, and vanishes after two minutes unless it is named; endermen hunt them. Punch one down: a sword kills it",
  "minecraft:stray": "they spawn in snowy places at night, out under the open sky, in place of most of the skeletons there, and shoot arrows that slow you; a skeleton kept in powder snow shakes and becomes one",
  "minecraft:bogged": "they spawn in swamps and mangrove swamps at night, in place of some of the skeletons there, and shoot poison arrows; mushrooms grow on their heads (shears take them off for good, and a calmed one keeps its look)",
  "minecraft:parched": "they spawn in deserts at night, out under the open sky, in place of a third of the skeletons there, never burn in the sun, and shoot arrows that weaken you. One riding behind a husk on a camel husk comes down off it when it is calmed",
  "minecraft:wither_skeleton": "they spawn in Nether fortresses, two or three at a time, and strike with a stone sword whose hits wither you; fire and lava don't hurt them",
  "minecraft:drowned": "they spawn in water in the dark (block light 0), in oceans, rivers and dripstone caves, keep to the bottom by day and come out to hunt at night; some carry a trident to throw. A zombie that stays under water too long becomes one. One riding a zombie nautilus comes off it when it is calmed",
  "minecraft:husk": "they spawn in deserts at night (most of the zombies there are husks), never burn in the sun, and a hit from one leaves you hungry. One riding a camel husk comes down off it when it is calmed",
  "minecraft:zombie_villager_v2": "now and then a group of them comes in place of zombies in the dark (block light 0), and they live in abandoned villages; a villager a zombie kills may rise as one (half the time on Normal, always on Hard). Each wears the clothes of its job and of the place it came from, and a calmed one keeps them. Cured instead (a golden apple while it has Weakness) it turns back into a villager",
  "minecraft:creeper": "they spawn in the dark (block light 0) and creep up on you to explode. Use the serum from a few blocks away: within about 2.5 blocks one hisses and explodes a moment later (step back and it stops)",
  "minecraft:spider": "they spawn in the dark (block light 0), climb walls and hunt you at night (by day they leave you be unless you hit them). A skeleton riding one jumps off when it is calmed",
  "zoocraft:wild_cyclops": "one lives alone in a camp of boulders round a campfire in the windswept hills or the stony peaks, very rarely (once Mob Taming is done the first walk there finds one, then only far from it). It goes for anyone who comes within 12 blocks (sneaking, 4): it smashes its club down in front, stomps the ground to throw you up and back, and throws rocks from far off (step aside). It can't be killed: worn down to a quarter of its health it sits down panting, and then the serum takes",
  "zoocraft:wild_necromancer": "one lives alone in a crypt of soul soil and blackstone in the Nether, in a soul sand valley or beside a fortress, very rarely (once Mob Taming is done the first walk there finds one, then only far from it). It goes for anyone who comes within 12 blocks (sneaking, 4): it swings its staff, strikes the ground for a ring of soul fire that slows you, throws soul bolts from far off (step aside: they set you alight) and raises skeletons from the ground, three at most, that crumble when the fight is over. It can't be killed: worn down to a quarter of its health it kneels down panting on its staff, and then the serum takes",
  "zoocraft:wild_voidling": "one lives alone in a rift of end stone and obsidian on the outer End islands, by an island's edge, very rarely (once Mob Taming is done the first walk out there finds one, then only far from it). It is very slow, but it goes for anyone who comes within 10 blocks (sneaking, 4): it rakes with its long arms, throws slow void orbs that blind you, and when you are close it shrieks for a second and grabs you, then walks you to the island's edge and drops you into the void. Step back out of its reach when it shrieks; held, hit it and it lets go (an ender pearl or a chorus fruit gets you free too). It can't be killed: worn down to a quarter of its health it crouches down panting, and then the serum takes",
};
const PEN_LIFE = {
  "zoocraft:zoo_zombie": "they shamble about with their arms out, groaning now and then",
  "zoocraft:zoo_skeleton": "they wander about rattling now and then",
  "zoocraft:zoo_husk": "they shamble about with their arms out, rasping now and then; dry as the desert, they never burn in the sun",
  "zoocraft:zoo_zombie_villager": "they shamble about with their arms out in their old work clothes, groaning and snorting now and then",
  "zoocraft:zoo_drowned": "they walk slowly along the bottom of their water with their arms out, gurgling now and then, and wade out onto the bank",
  "zoocraft:zoo_stray": "they wander about in their ragged frosted clothes, rattling with an icy echo now and then",
  "zoocraft:zoo_bogged": "they wander about rattling softly, moss and mushrooms on their bones",
  "zoocraft:zoo_parched": "they wander about rattling dryly; bleached by the sun, they never burn in it",
  "zoocraft:zoo_wither_skeleton": "they stalk about their pen, tall and black, a stone sword in hand; fire never hurts them",
  "zoocraft:zoo_creeper": "they creep about on their four short legs and hiss softly now and then, but never swell or explode",
  "zoocraft:zoo_spider": "they scuttle about the floor, eyes glowing red; in the zoo they never climb",
  "zoocraft:zoo_cave_spider": "they scuttle about the floor, small and blue, eyes glowing red; in the zoo they never climb or bite",
  "zoocraft:zoo_silverfish": "they wriggle about the floor, hissing softly now and then; in the zoo they never creep into the stone",
  "zoocraft:zoo_endermite": "they skitter about the floor, purple and twitchy, chittering now and then; in the zoo they never vanish",
  "zoocraft:zoo_slime": "they hop about the pen with a squelch, stretching as they leave the ground and squashing flat as they land; in the zoo they never chase anyone or split",
  "zoocraft:zoo_piglin": "they wander about snorting now and then, a weapon in hand, and never turn into zombified piglins; hand one a gold ingot (use it on the piglin) and it holds it up and looks it over for a few seconds, then tosses you something in trade, as in the Nether",
  "zoocraft:zoo_piglin_brute": "they stomp about grunting now and then, a golden axe in hand; in the zoo they never swing it, and never turn into zombified piglins",
  "zoocraft:zoo_zombified_piglin": "they shuffle about grunting now and then, a weapon in hand; fire never hurts them",
  "zoocraft:zoo_hoglin": "they root about the pen together, snorting now and then, and never charge or turn into zoglins; with breeding on a pair has a baby hoglin (half the size, with a big head) that follows the grown ones about and grows up in a few park days",
  "zoocraft:zoo_zoglin": "they stomp about growling now and then, and never charge; fire never hurts them, and they never breed",
  "zoocraft:zoo_blaze": "they wander about the pen, their rods spinning about them, breathing now and then, and never shoot; they drink lava, not water, and fire never hurts them",
  "zoocraft:zoo_ghast": "they float about the pen slowly, eyes shut, their tentacles swaying, crying now and then, and never shoot; fire never hurts them",
  "zoocraft:zoo_enderman": "they wander about the pen and now and then vanish in a puff of purple, to turn up somewhere else in it; they never take blocks, and never come for you when you look at them",
  "zoocraft:zoo_shulker": "they sit still in their shells, peeking out for a second or two now and then and turning their heads to watch you; they never shoot",
  "zoocraft:zoo_pillager": "they wander about the pen, crossbows at their sides, grunting now and then; in the zoo they never aim or shoot, and a captain keeps its ominous banner",
  "zoocraft:zoo_vindicator": "they stride about the pen with their arms crossed, muttering now and then; in the zoo they never draw their axes",
  "zoocraft:zoo_evoker": "they amble about the pen with their arms crossed, muttering now and then; in the zoo they never cast a spell",
  "zoocraft:zoo_vex": "they hover about the pen on their little wings, from the floor up to the roof, swords in hand; in the zoo they never charge or glow red, never fly through the walls and never fade away",
  "zoocraft:zoo_ravager": "they lumber about the pen, snorting and working their jaws; in the zoo they never ram, bite or roar, and never trample a thing",
  "zoocraft:zoo_guardian": "they swim about the water in quick charges, tails whipping, and sink slowly with their spikes out when they stop, their one eye following you; in the zoo they never fire their lasers",
  "zoocraft:zoo_breeze": "they glide about the pen on their whirling winds, the dust swirling under them, their eyes glowing; in the zoo they never leap at you or fire a wind charge",
  "zoocraft:zoo_creaking": "they creak slowly about the pen, tall and gnarled, their eyes dim; in the zoo they never stalk you, freeze when you look or crumble away at dawn",
  "zoocraft:zoo_ender_dragon": "it circles round and round under the roof on its great wings, growling now and then, and every 15 to 30 seconds dives down low over the floor and climbs back up; it never lands, and in the zoo it never breathes fire, fires a fireball, perches or knocks anyone about",
  "zoocraft:zoo_wither": "they drift about low in the pen, just over the floor, their three heads looking about and their ribs swaying; in the zoo they never fire a skull, blow up, break a block or call up wither skeletons, and they wither no one",
  "zoocraft:zoo_warden": "they lumber slowly about the pen, heads up, their hearts and spots pulsing in the dark; in the zoo they never roar, strike or fire a sonic boom, put Darkness on no one, and never dig back into the ground",
  "zoocraft:zoo_elder_guardian": "they drift about the water slowly, big and pale, sinking with their spikes out when they stop, their eye following you; in the zoo they never fire their lasers or put Mining Fatigue on anyone",
  "zoocraft:zoo_phantom": "they glide round and round under the roof on their long wings, trailing grey smoke, and every 10 to 20 seconds swoop down low over the floor and climb back up, screeching now and then; they never land, and in the zoo they never bite",
  "zoocraft:zoo_witch": "they wander about cackling now and then, their noses twitching, and now and then purple sparkles rise over their hats; in the zoo they never throw or drink a potion",
  "zoocraft:zoo_magma_cube": "they wait, then spring up high (the large ones 4 blocks), their layers pulling apart over the glowing core, and land with a squelch; fire never hurts them, and in the zoo they never chase anyone or split",
  "zoocraft:zoo_cyclops": "it stomps about its pen, eats at its feeder, picks up a rock and tosses it up to catch it, bellows now and then, sits down to rest and sleeps sitting at night; it never smashes, stomps or throws at anyone",
  "zoocraft:zoo_necromancer": "it paces its pen, eats at its feeder, holds its staff up and lets a soul flame float off it, chants softly now and then, kneels to rest and kneels head bowed at night; it never strikes, throws bolts or raises anything",
  "zoocraft:zoo_voidling": "it wanders slowly round its pen, eats at its feeder, stretches its long arms up and lets a violet wisp float off its fingers, hums now and then, crouches to rest and crouches head bowed at night; it never grabs, rakes or throws anything",
};
const CRYPT = "Zombies, zombie villagers and skeletons share a pen"; // the Crypt (exhibits/mixing.js; 0.1.199 the zombie villagers)
const SUNKEN = "Drowned and zombie nautiluses share a pen"; // the Sunken Crypt (exhibits/mixing.js, 0.1.200)
const DESERT_TOMB = "Husks and parched share a pen"; // the Desert Tomb (exhibits/mixing.js, 0.1.201)
const SPIDER_DEN = "Spiders and cave spiders share a pen"; // the Spider Den (exhibits/mixing.js, 0.1.202)
const BASTION = "Piglins and piglin brutes share a pen"; // the Bastion (exhibits/mixing.js, 0.1.206)
const MONUMENT = "Guardians and elder guardians share a pen"; // the Ocean Monument (exhibits/mixing.js, 0.1.212)
const CAMP = "Pillagers, vindicators, evokers, vexes and ravagers share a pen"; // the Illager Camp (exhibits/mixing.js, 0.1.210; the ravager 0.1.211)
const MATES = {
  "zoocraft:zoo_zombie": CRYPT,
  "zoocraft:zoo_skeleton": CRYPT,
  "zoocraft:zoo_zombie_villager": CRYPT,
  "zoocraft:zoo_skeleton_horse": UNDEAD_STABLE,
  "zoocraft:zoo_zombie_horse": UNDEAD_STABLE,
  "zoocraft:zoo_drowned": SUNKEN,
  "zoocraft:zoo_zombie_nautilus": SUNKEN,
  "zoocraft:zoo_husk": DESERT_TOMB,
  "zoocraft:zoo_parched": DESERT_TOMB,
  "zoocraft:zoo_spider": SPIDER_DEN,
  "zoocraft:zoo_cave_spider": SPIDER_DEN,
  "zoocraft:zoo_piglin": BASTION,
  "zoocraft:zoo_piglin_brute": BASTION,
  "zoocraft:zoo_pillager": CAMP,
  "zoocraft:zoo_vindicator": CAMP,
  "zoocraft:zoo_evoker": CAMP,
  "zoocraft:zoo_vex": CAMP,
  "zoocraft:zoo_ravager": CAMP,
  "zoocraft:zoo_guardian": MONUMENT,
  "zoocraft:zoo_elder_guardian": MONUMENT,
};
const FOOD = { "zoocraft:bone_ration": "Bone Rations (bones and bone meal)", "zoocraft:grain_ration": "Grain Rations", "zoocraft:meat_ration": "Meat Rations", "zoocraft:fish_ration": "Fish Rations", "minecraft:wind_charge": "wind charges (or breeze rods, 4 to a rod)", "minecraft:resin_clump": "resin clumps (or blocks of resin, 9 to a block)", "zoocraft:fungal_ration": "Fungal Rations (crimson and warped fungus with nether wart)", "zoocraft:ember_ration": "Ember Rations (meat with blaze powder and charcoal)", "zoocraft:chorus_browse": "Chorus Browse (crafted from chorus fruit)", "minecraft:slime_ball": "slimeballs", "minecraft:magma_cream": "magma cream (a slimeball and blaze powder)", ...MOUNT_FOOD };
const BAIT = { "zoocraft:bone_ration": "a Bone Ration or a bone", "zoocraft:grain_ration": "a Grain Ration", "zoocraft:meat_ration": "a Meat Ration", "zoocraft:fish_ration": "a Fish Ration", "minecraft:wind_charge": "a wind charge", "minecraft:resin_clump": "a resin clump", "zoocraft:fungal_ration": "a Fungal Ration", "zoocraft:ember_ration": "an Ember Ration", "zoocraft:chorus_browse": "Chorus Browse", "minecraft:slime_ball": "a slimeball", "minecraft:magma_cream": "some magma cream" };

// A mob the serum calms as it is (0.1.213: a creaking has 1 health, and hits never hurt one its heart guards).
const CALM_AS_IT_IS = { "minecraft:creaking": "there's no need to weaken it (1 health is little enough, and nothing hurts one its heart guards), just" };

// The Field Journal's line on wild ones and on calming them.
/** @param {any} species @param {number} calmAt */
export function mobWildLine(species, calmAt) {
  const one = species.displayName.toLowerCase();
  return `In the wild ${pluralOf(species).toLowerCase()} are monsters: ${WILD_HOW[species.mobSource] ?? "they spawn in the dark (block light 0) and hunt you"}. To take one for the zoo: ${CALM_AS_IT_IS[species.mobSource] ?? `weaken it to ${Math.round(calmAt * 100) === 25 ? "a quarter" : `${Math.round(calmAt * 100)}%`} of its health or less, then`} use a Passivity Serum on it (Mob Taming research). It sparkles green, stands dazed a moment and is calm from then on: it never attacks, never burns in the sun and never despawns. A calmed ${one} follows someone holding ${BAIT[species.baitItem] ?? "its food"}; a Mob Cage carries it to its pen`;
}

/**
 * The Field Journal's lines on a mob in the zoo: the pen, what it likes there (its floor, what it likes in the pen, the
 * dark), how it lives there and its food. `prof`: its habitat profile (the Cyclops's pen is bigger and taller: 0.1.165; a
 * water pen's space is its water, 0.1.200).
 * @param {any} sp @param {any} balance @param {{ baseArea: number, extraArea: number, minHeight: number, aquatic?: boolean, minDeepWater?: number }} [prof]
 */
export function mobJournalLines(sp, balance, prof = { baseArea: 25, extraArea: 10, minHeight: 3 }) {
  const side = Math.round(Math.sqrt(prof.baseArea));
  const room = prof.aquatic
    ? `a pool in it: at least ${prof.baseArea} blocks of water for the first (${prof.extraArea} more for each more), ${prof.minDeepWater === prof.baseArea ? "all of them" : `${prof.minDeepWater} of them`} 2 deep or more, and a bank beside the water inside to use the Habitat Marker on, ${prof.minHeight} blocks of headroom over it`
    : `At least ${side} x ${side} of floor for the first (${prof.extraArea} more blocks for each more), ${prof.minHeight} blocks of headroom`;
  const out = [`§7The pen: ${PEN_HOW}${prof.aquatic ? `, with ${room}` : `. ${room}`}. Guests pay the Mob House's entry price to go into its hall once they can see a mob in a pen from a Viewing Point standing in the hall (a guest path through the hall's door to it). No wild monster spawns in the hall or the pens`];
  const likes = [];
  if (sp.mobFloor) likes.push(`${sp.mobFloor.how} under ${Math.round(sp.mobFloor.share * 100)}% of the floor${sp.mobFloor.underWater ? " (the bottom of the water and the bank)" : ""} or more`);
  if (sp.mobDecor) likes.push(`${sp.mobDecor.min} or more ${sp.mobDecor.how} in the pen${sp.mobDecor.where ? ` (${sp.mobDecor.where})` : ""}`);
  // A mob that likes nothing but the dark (0.1.200, the zombie nautilus): the dark's line alone.
  let line = likes.length ? `§7${sp.mobFloor ? "The floor" : "The pen"}: ${likes.join(", and ")}. Without ${sp.mobFloor && !sp.mobDecor ? "it" : "them"} comfort can't rise above ${balance.mobs.floorComfortCap}` : "";
  if (sp.lowLight) line += `${line ? ". And the dark" : "§7The dark"}: no daylight in the pen and nothing brighter than light ${darkLimit(sp, balance)}${sp.darkLight !== undefined ? ` on the floor (a Nocturnal Lamp hung 3 blocks above the floor gives ${balance.nocturnal.maxLight - 3} right under it, and lets the guests see them)` : " (Nocturnal Lamps for the guests to see them by)"}; tinted glass to the hall keeps the daylight out (it comes in through the hall's door, even shut, and on through plain glass and iron bars); in light comfort can't rise above ${balance.chorusMoth.dimComfortCap}`;
  if (line) out.push(line);
  out.push(`§7In the pen: ${PEN_LIFE[sp.id] ?? MOUNT_PEN_LIFE[sp.id] ?? "they wander about"}. They never attack, never burn in the sun and never despawn, and nothing hurts them but a player's hits. Food: ${FOOD[sp.baitItem] ?? "their food"} in ${sp.aquariumFeeder ? "an Aquarium Feeder over the water" : "a Basic Feeder"}; a Hanging Food Basket gives them something to forage. ${MATES[sp.id] ?? `${pluralOf(sp)} keep a pen to themselves`}`);
  if (MOB_LOOKS[sp.wildSource]?.sizes) out.push(`§7Size: each keeps the size it had in the wild (small, medium or large) once calmed and caught; in the zoo it never grows or splits`); // slimes and magma cubes (0.1.203)
  if (MOB_LOOKS[sp.wildSource]?.sheared) out.push("§7Looks: a bogged sheared of its mushrooms in the wild stays bare once calmed and caught; the rest keep their mushrooms"); // bogged (0.1.201)
  // Piglins and zombified piglins (0.1.206): the weapon and golden armour they had in the wild.
  const gear = MOB_LOOKS[sp.wildSource]?.gear;
  if (gear) out.push(`§7Looks: each keeps the weapon it held in the wild (${listWords(sp.coats.map((c) => `a ${c.toLowerCase()}`), "or")})${MOB_LOOKS[sp.wildSource].gold ? " and any golden armour it wore" : ""}, calmed and caught; in the zoo it never uses it`);
  if (MOB_LOOKS[sp.wildSource]?.captain) out.push("§7Looks: a captain (a patrol's or a raid's leader) keeps its ominous banner, calmed and caught; in the zoo it never leads anyone"); // pillagers and vindicators (0.1.210)
  if (sp.markNames) out.push(`§7Looks: each keeps the job it had as a villager (its clothes show which of the ${sp.coats.length}) and the clothes of where it came from (${sp.markNames.join(", ")}). Calmed and caught, it keeps both`); // zombie villagers (0.1.199)
  return out;
}

// ---------------- the Mob House's entry price ----------------

// The share of the guests who go into the Mob House at this price (a mob pen on view from its hall).
/** @param {number} price @param {any} balance */
export function mobHouseShare(price, balance) {
  const g = balance.mobHouse;
  const share = price <= g.fair ? g.shareAtFair + (g.fair - price) * g.sharePerCoinUnder : g.shareAtFair - (price - g.fair) * g.sharePerCoinOver;
  return Math.max(0, Math.min(g.shareMax, share));
}

/**
 * One visitor step at one Mob House: how many of `guests` go in and pay (none with no mob pen on view from its hall;
 * a second pen on view draws a few more), the coins, and the part of a guest carried to the next step.
 * @param {{ guests: number, price: number, carry?: number, pens: number }} s @param {any} balance
 */
export function mobHouseSales({ guests, price, carry = 0, pens }, balance) {
  if (pens <= 0 || guests <= 0) return { paid: 0, revenue: 0, carry: 0 };
  const g = balance.mobHouse;
  const variety = Math.min(1, g.varietyBase + g.varietyPerPen * pens);
  const expected = carry + guests * mobHouseShare(price, balance) * variety;
  const paid = Math.max(0, Math.floor(expected + 1e-9));
  return { paid, revenue: paid * price, carry: Math.max(0, expected - paid) };
}

export const MOB_HOUSE_TEXT = {
  outside: "It's outside the park. Guests only visit inside the park boundary.",
  inside: "It's inside an exhibit. The Mob House block goes in the hall, on the guests' side.",
  open: "It isn't in a hall yet. Build the hall: walls, a floor and a roof all round with no gaps (doors count as wall), at least 3 x 3 x 3 inside, then put the Mob House block inside it. Mob pens go beside the hall.",
  small: "The hall is too small: it needs open space at least 3 x 3 x 3 inside (furniture takes up space).",
  unloaded: "Part of the hall isn't loaded. Come closer and try again.",
  path: "No guest path reaches it. Lay a path (gravel, bricks, planks...) from the Park Entrance Gate, through the hall's door, to right beside the Mob House block.",
  unchecked: "Checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?",
};

/**
 * The pens a Mob House shows: exhibits with mobs living in them, beside this house, that a viewed Viewing Point standing
 * in its hall looks into.
 * @param {{ id: string, dimension: string, bbox?: Box }} house
 * @param {{ dimension: string, pos: { x: number, y: number, z: number }, viewed?: boolean, exhibitId?: string }[]} points
 * @param {(id: string) => ({ mobPen?: { houseId?: string } } | undefined)} penOf an exhibit with mobs living in it, else undefined
 */
export function pensOnView(house, points, penOf) {
  if (!house.bbox) return [];
  const hall = grow(house.bbox, 1);
  const out = new Set();
  for (const p of points) {
    if (!p.viewed || !p.exhibitId || p.dimension !== house.dimension || !inBox(p.pos, hall)) continue;
    if (penOf(p.exhibitId)?.mobPen?.houseId === house.id) out.add(p.exhibitId);
  }
  return [...out];
}

// ---------------- the spawn guard ----------------

/**
 * Where wild monsters may not spawn: each working Mob House's hall and each mob pen, a block round them.
 * @param {{ type: string, dimension: string, room?: string, bbox?: Box }[]} equipment
 * @param {{ dimension: string, bbox?: Box, mobPen?: { houseId?: string } }[]} exhibits
 * @returns {{ dimension: string, box: Box }[]}
 */
export function guardBoxes(equipment, exhibits) {
  const out = [];
  for (const r of equipment) if (r.type === "mobhouse" && r.room === "ok" && r.bbox) out.push({ dimension: r.dimension, box: grow(r.bbox, 1) });
  for (const ex of exhibits) if (ex.mobPen?.houseId && ex.bbox) out.push({ dimension: ex.dimension, box: grow(ex.bbox, 1) });
  return out;
}

/** @param {{ dimension: string, box: Box }[]} boxes @param {string} dimension @param {{ x: number, y: number, z: number }} pos */
export function guarded(boxes, dimension, pos) {
  return boxes.some((b) => b.dimension === dimension && inBox(pos, b.box));
}
