// The Chorus Meadow (0.1.142, module 8 biomes), pure. The meadows are made with the world on the outer End islands
// (features/ and feature_rules/ chorus_meadow_* and whitewood_*): Chorus Turf over the end stone, End Grass, ponds and
// whitewood trees. The End takes no custom biome, so the game still calls a meadow The End; its feel comes from script
// instead, as the Eternal End add-on does it (world/meadow.js): while a player is in one, its own lilac fog on their fog
// stack, motes drifting round them, soft chimes now and then and its name on screen on walking in. Endermen are sent
// away from it. A player is in a meadow while Chorus Turf is the ground under them or a few blocks round them.

export const TURF = "zoocraft:chorus_turf";
// The blocks only the meadows have: an enderman standing on any of them is in a meadow.
export const MEADOW_GROUND = [TURF, "zoocraft:end_grass", "zoocraft:whitewood_leaves", "zoocraft:whitewood_log"];
export const END = "minecraft:the_end";
export const OUTER = 780; // blocks from 0,0: the meadows start 800 out (feature_rules: r > 800); nothing nearer is looked at
export const FOG_TAG = "zoocraft_meadow"; // the fog stack entry's own id (the Diving Helmet's is zoocraft_diving)
export const FOG = "zoocraft:fog_chorus_meadow";
export const MOTE = "zoocraft:meadow_mote";
export const NAME = "Chorus Meadow";
// The columns looked down for turf (the player's own and four 4 blocks out), each down to 6 blocks under the feet.
export const PROBES = [[0, 0], [4, 0], [-4, 0], [0, 4], [0, -4]];
export const DEPTH = 6;
export const LEAVE_AFTER = 3; // looks (a second apart) with no turf found before the player has left the meadow
export const TITLE_AGAIN = 2400; // ticks: the name shows again on walking in only after 2 minutes out
export const MOTES = 5; // motes a second round a player in a meadow
export const MOTE_RANGE = 10; // blocks out from the player
export const ENDERMAN = "minecraft:enderman";
export const SEND_AWAY_RANGE = 32; // blocks: endermen this near a player in a meadow, standing on turf, are sent away
export const SPAWN_KEEP = 16; // blocks: an enderman spawned this near a player (a spawn egg) is let be

// One look: `s` the player's meadow state ({ in, miss, left }: in a meadow, looks since turf was last found, the tick
// they last left), `turf` whether turf was found this look, `now` the tick. Returns the next state, with `enter` on
// walking in (and `title` when the name should show), `leave` on leaving.
/** @param {{ in: boolean, miss: number, left: number }} s @param {boolean} turf @param {number} now */
export function meadowStep(s, turf, now) {
  if (turf) {
    const enter = !s.in;
    return { in: true, miss: 0, left: s.left, enter, leave: false, title: enter && now - s.left >= TITLE_AGAIN };
  }
  if (!s.in) return { ...s, enter: false, leave: false, title: false };
  if (s.miss + 1 < LEAVE_AFTER) return { in: true, miss: s.miss + 1, left: s.left, enter: false, leave: false, title: false };
  return { in: false, miss: 0, left: now, enter: false, leave: true, title: false };
}

// Whether a meadow is worth looking for where the player is: in the End, 780 blocks or more from 0,0.
/** @param {string} dimension @param {{ x: number, z: number }} loc */
export function mayBeMeadow(dimension, loc) {
  return dimension === END && loc.x * loc.x + loc.z * loc.z >= OUTER * OUTER;
}

// The commands that take the player's fog stack from `had` to `want` (true: the meadow's fog on; false: off; null: not
// known, so any entry left from before is removed). Every push follows a remove, so the stack holds one meadow entry.
/** @param {boolean | null} had @param {boolean} want */
export function meadowFogCommands(had, want) {
  if (had === want) return [];
  const out = [`fog @s remove ${FOG_TAG}`];
  if (want) out.push(`fog @s push ${FOG} ${FOG_TAG}`);
  return out;
}

// The meadow's sounds (vanilla): a low amethyst chime, now and then a chorus flower growing, about one every 8 seconds.
// `rand` returns numbers in [0, 1). Undefined when nothing plays this second.
/** @param {() => number} rand */
export function ambience(rand) {
  if (rand() >= 1 / 8) return undefined;
  return rand() < 0.7
    ? { sound: "chime.amethyst_block", volume: 0.35, pitch: 0.5 + rand() * 0.3 }
    : { sound: "block.chorusflower.grow", volume: 0.4, pitch: 0.8 + rand() * 0.3 };
}

// Where this second's motes start: MOTES points within MOTE_RANGE blocks round the player, from a block under their
// feet to 4 over.
/** @param {{ x: number, y: number, z: number }} loc @param {() => number} rand */
export function motePositions(loc, rand) {
  const out = [];
  for (let i = 0; i < MOTES; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * MOTE_RANGE;
    out.push({ x: loc.x + Math.cos(a) * r, y: loc.y - 1 + rand() * 5, z: loc.z + Math.sin(a) * r });
  }
  return out;
}

// Whether an enderman just spawned should be sent away: one that spawned in the End (not loaded from the save) on a
// meadow's ground (the bench: of 127 spawns in a meadow, 33 on the turf, 2 on End grass, 1 on a whitewood tree), with no
// player within SPAWN_KEEP blocks (natural spawns are 24 or more blocks from players; one nearer was put there, by a
// spawn egg).
/** @param {string} typeId @param {string} cause @param {string} dimension @param {string | undefined} ground @param {number} nearestPlayer */
export function sendAwayOnSpawn(typeId, cause, dimension, ground, nearestPlayer) {
  return typeId === ENDERMAN && cause === "Spawned" && dimension === END && MEADOW_GROUND.includes(ground ?? "") && nearestPlayer > SPAWN_KEEP;
}

// Whether an enderman near a player in a meadow is sent away: standing on the meadow's ground and not named (a name tag
// keeps it).
/** @param {string | undefined} ground @param {string | undefined} nameTag */
export function sendAwayNear(ground, nameTag) {
  return MEADOW_GROUND.includes(ground ?? "") && !nameTag;
}
