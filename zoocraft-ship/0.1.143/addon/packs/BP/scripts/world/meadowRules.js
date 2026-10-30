// The End's patches (module 8 biomes), pure: the Chorus Meadows (0.1.142) and the Rift Willows (0.1.143). Both are made
// with the world on the outer End islands (features/ and feature_rules/ chorus_meadow_*, whitewood_*, rift_willows_* and
// *willow*): a turf over the end stone, its grass and its trees. The End takes no custom biome, so the game still calls
// them The End; their feel comes from script instead, as the Eternal End add-on does it (world/meadow.js): while a player
// is in one, its own fog on their fog stack, particles drifting round them, sounds now and then and its name on screen on
// walking in. Endermen are sent away from the meadows. A player is in a patch while its turf is the ground under them or
// a few blocks round them.

export const TURF = "zoocraft:chorus_turf";
export const RIFT_TURF = "zoocraft:rift_turf";
// The blocks only the meadows have: an enderman standing on any of them is in a meadow.
export const MEADOW_GROUND = [TURF, "zoocraft:end_grass", "zoocraft:whitewood_leaves", "zoocraft:whitewood_log"];
export const END = "minecraft:the_end";
export const OUTER = 780; // blocks from 0,0: the patches start 800 out (feature_rules: r > 800); nothing nearer is looked at
export const FOG_TAG = "zoocraft_meadow"; // the meadow's fog stack entry's own id (the Diving Helmet's is zoocraft_diving)
export const FOG = "zoocraft:fog_chorus_meadow";
export const MOTE = "zoocraft:meadow_mote";
export const NAME = "Chorus Meadow";
// Each patch: its turf, its name on screen (and the colour it shows in), its fog and that fog's own stack entry, and its
// particle. The ids are the Places entries' too (world/trenchRules.js PLACES).
export const PATCHES = {
  chorus_meadow: { turf: TURF, name: NAME, colour: "§d", fog: FOG, fogTag: FOG_TAG, mote: MOTE },
  rift_willows: { turf: RIFT_TURF, name: "Rift Willows", colour: "§b", fog: "zoocraft:fog_rift_willows", fogTag: "zoocraft_willows", mote: "zoocraft:rift_spark" },
};
// The columns looked down for turf (the player's own and four 4 blocks out), each down to 6 blocks under the feet.
export const PROBES = [[0, 0], [4, 0], [-4, 0], [0, 4], [0, -4]];
export const DEPTH = 6;
export const LEAVE_AFTER = 3; // looks (a second apart) with no turf found before the player has left the patch
export const TITLE_AGAIN = 2400; // ticks: the name shows again on walking back into the same patch only after 2 minutes out
export const MOTES = 5; // particles a second round a player in a patch
export const MOTE_RANGE = 10; // blocks out from the player
export const ENDERMAN = "minecraft:enderman";
export const SEND_AWAY_RANGE = 32; // blocks: endermen this near a player in a meadow, standing on its ground, are sent away
export const SPAWN_KEEP = 16; // blocks: an enderman spawned this near a player (a spawn egg) is let be

// The patch whose turf a block is ("" for none).
/** @param {string | undefined} typeId */
export function patchOf(typeId) {
  for (const [id, p] of Object.entries(PATCHES)) if (p.turf === typeId) return id;
  return "";
}

// One look: `s` the player's patch state ({ in, miss, left, last }: the patch they are in or "", looks since its turf was
// last found, the tick they last left one and which), `found` the patch whose turf was found this look ("" for none),
// `now` the tick. Returns the next state, with `enter` on walking in (and `title` when the name should show: a patch
// other than the last one left, or the same after 2 minutes out), `leave` on leaving.
/** @param {{ in: string, miss: number, left: number, last: string }} s @param {string} found @param {number} now */
export function meadowStep(s, found, now) {
  if (found) {
    if (found === s.in) return { ...s, miss: 0, enter: false, leave: false, title: false };
    return { in: found, miss: 0, left: s.left, last: s.last, enter: true, leave: false, title: found !== s.last || now - s.left >= TITLE_AGAIN };
  }
  if (!s.in) return { ...s, enter: false, leave: false, title: false };
  if (s.miss + 1 < LEAVE_AFTER) return { ...s, miss: s.miss + 1, enter: false, leave: false, title: false };
  return { in: "", miss: 0, left: now, last: s.in, enter: false, leave: true, title: false };
}

// Whether a patch is worth looking for where the player is: in the End, 780 blocks or more from 0,0.
/** @param {string} dimension @param {{ x: number, z: number }} loc */
export function mayBeMeadow(dimension, loc) {
  return dimension === END && loc.x * loc.x + loc.z * loc.z >= OUTER * OUTER;
}

// The commands that take the player's fog stack from `had` to `want` (a patch's id: its fog on; "": none; `had` null: not
// known, so any patch's entry left from before is removed). Every push follows a remove of its own entry, so the stack
// holds one entry a patch at most.
/** @param {string | null} had @param {string} want */
export function meadowFogCommands(had, want) {
  if (had === want) return [];
  const tags = had === null ? Object.values(PATCHES).map((p) => p.fogTag) : had ? [PATCHES[had].fogTag] : [];
  if (want && !tags.includes(PATCHES[want].fogTag)) tags.push(PATCHES[want].fogTag);
  const out = tags.map((t) => `fog @s remove ${t}`);
  if (want) out.push(`fog @s push ${PATCHES[want].fog} ${PATCHES[want].fogTag}`);
  return out;
}

// A patch's sounds (vanilla), about one every 8 seconds. The meadow: a low amethyst chime, now and then a chorus flower
// growing. The willows: a low hum (the beacon's), now and then a high chime. `rand` returns numbers in [0, 1).
// Undefined when nothing plays this second.
/** @param {string} patch @param {() => number} rand */
export function ambience(patch, rand) {
  if (rand() >= 1 / 8) return undefined;
  if (patch === "rift_willows") {
    return rand() < 0.6
      ? { sound: "beacon.ambient", volume: 0.25, pitch: 0.5 + rand() * 0.2 }
      : { sound: "chime.amethyst_block", volume: 0.3, pitch: 1.3 + rand() * 0.3 };
  }
  return rand() < 0.7
    ? { sound: "chime.amethyst_block", volume: 0.35, pitch: 0.5 + rand() * 0.3 }
    : { sound: "block.chorusflower.grow", volume: 0.4, pitch: 0.8 + rand() * 0.3 };
}

// Where this second's particles start: MOTES points within MOTE_RANGE blocks round the player, from a block under their
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
