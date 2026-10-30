// The Mythical Glade (0.1.147, module 9), pure: a rare Overworld biome (biomes/mythical_glade.biome.json) on parts of
// flower forests, meadows, cherry groves, birch forests and forests, made with the world: mint grass, amethyst patches,
// glowing flowers and the Mythwood and Moonwillow trees (structure files, features/ mythic_*). Its sky, fog, water and
// grass colours come from its client biome; world/glade.js adds the rest of its feel while a player is in it: motes
// drifting round them, an amethyst chime now and then, and its name on screen on walking in. The Places page finds it
// (world/trenchRules.js PLACES.mythical_glade).

export const GLADE = "zoocraft:mythical_glade";
export const NAME = "Mythical Glade";
export const MOTE = "zoocraft:glade_mote";
export const OVERWORLD = "minecraft:overworld";
export const MOTES = 6; // particles a second round a player in the glade
export const MOTE_RANGE = 12; // blocks out from the player

// Whether the glade's feel runs for a player: in the Overworld, standing in the glade's biome (`biome`: its id, or
// undefined where it can't be read).
/** @param {string} dimension @param {string | undefined} biome */
export function inGlade(dimension, biome) {
  return dimension === OVERWORLD && biome === GLADE;
}

// The glade's sounds (vanilla), about one every 7 seconds: an amethyst chime, high or low, now and then the amethyst
// block's soft resonance. `rand` returns numbers in [0, 1). Undefined when nothing plays this second.
/** @param {() => number} rand */
export function gladeAmbience(rand) {
  if (rand() >= 1 / 7) return undefined;
  return rand() < 0.75
    ? { sound: "chime.amethyst_block", volume: 0.35, pitch: 0.8 + rand() * 0.8 }
    : { sound: "resonate.amethyst_block", volume: 0.3, pitch: 0.9 + rand() * 0.3 };
}

// Where this second's motes start: MOTES points within MOTE_RANGE blocks round the player, from a block under their
// feet to 5 over.
/** @param {{ x: number, y: number, z: number }} loc @param {() => number} rand */
export function gladeMotes(loc, rand) {
  const out = [];
  for (let i = 0; i < MOTES; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * MOTE_RANGE;
    out.push({ x: loc.x + Math.cos(a) * r, y: loc.y - 1 + rand() * 6, z: loc.z + Math.sin(a) * r });
  }
  return out;
}
