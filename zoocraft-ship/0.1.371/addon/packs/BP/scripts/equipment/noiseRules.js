// The Redstone Noise Maker (0.1.371; Austin's notes for Zach, level 40: "redstone noise maker, it can mimic any animal
// sound you set it to"). A block: use it to pick an animal, and it makes that animal's call when it is used or when
// redstone power reaches it. The calls are the game's own. No engine calls here.

export const NOISE_BLOCK = "zoocraft:noise_maker";

/** Every animal it can mimic: [key, name, the game's sound]. Kept in this order on its menu. */
export const NOISES = [
  ["cow", "Cow", "mob.cow.say"],
  ["pig", "Pig", "mob.pig.say"],
  ["sheep", "Sheep", "mob.sheep.say"],
  ["chicken", "Chicken", "mob.chicken.say"],
  ["horse", "Horse", "mob.horse.idle"],
  ["donkey", "Donkey", "mob.horse.donkey.idle"],
  ["goat", "Goat", "mob.goat.ambient"],
  ["llama", "Llama", "mob.llama.idle"],
  ["camel", "Camel", "mob.camel.ambient"],
  ["wolf", "Wolf (bark)", "mob.wolf.bark"],
  ["wolf_growl", "Wolf (growl)", "mob.wolf.growl"],
  ["fox", "Fox", "mob.fox.ambient"],
  ["cat", "Cat (meow)", "mob.cat.straymeow"],
  ["cat_purr", "Cat (purr)", "mob.cat.purr"],
  ["ocelot", "Ocelot", "mob.ocelot.idle"],
  ["rabbit", "Rabbit", "mob.rabbit.idle"],
  ["panda", "Panda", "mob.panda.idle"],
  ["polar_bear", "Polar Bear", "mob.polarbear.idle"],
  ["armadillo", "Armadillo", "mob.armadillo.ambient"],
  ["sniffer", "Sniffer", "mob.sniffer.idle"],
  ["parrot", "Parrot", "mob.parrot.idle"],
  ["bat", "Bat", "mob.bat.idle"],
  ["frog", "Frog", "mob.frog.ambient"],
  ["turtle", "Turtle", "mob.turtle.ambient"],
  ["axolotl", "Axolotl", "mob.axolotl.idle"],
  ["dolphin", "Dolphin", "mob.dolphin.idle"],
  ["nautilus", "Nautilus", "mob.nautilus.ambient"],
  ["allay", "Allay", "mob.allay.idle"],
  ["happy_ghast", "Happy Ghast", "mob.happy_ghast.ambient"],
  ["skeleton_horse", "Skeleton Horse", "mob.horse.skeleton.idle"],
  ["zombie_horse", "Zombie Horse", "mob.horse.zombie.idle"],
].map(([key, name, sound]) => ({ key, name, sound }));

export const DEFAULT_NOISE = NOISES[0].key;
export const noiseOf = (key) => NOISES.find((n) => n.key === key) ?? NOISES[0];

/** Its record with another animal set. */
export const withNoise = (rec, key) => ({ ...rec, noise: noiseOf(key).key });

/** Whether a change of redstone power sets it off: only as the power arrives, not while it stays or as it goes. */
export const risingEdge = (power, before) => power > 0 && !(before > 0);

/** The pitch of one call: a little different each time, as animals are. */
export const pitchOf = (random, g) => g.pitch[0] + random() * (g.pitch[1] - g.pitch[0]);

/** Its menu: the body line, and a button for every animal (the one set is marked). */
export function noiseMenu(rec) {
  const cur = noiseOf(rec?.noise);
  return { body: `§7It sounds like: §f${cur.name}§7.\nPick an animal. Redstone power sets it off.`, buttons: ["Play it now", ...NOISES.map((n) => (n.key === cur.key ? `§2${n.name}\n§8set` : n.name))] };
}
