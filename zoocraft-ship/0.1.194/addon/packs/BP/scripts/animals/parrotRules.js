// Parrots (0.1.188, module 12; research/vanilla_plan.md "0.1.188 parrots: the design"): the rules, kept apart from the
// game so the tests can run them. The game's parrot dances to a jukebox and imitates monsters by its own engine (its
// entity file has no component for either), so the zoo copy does both through animals/parrot.js:
// - Dancing: while a jukebox beside the aviary's air plays, each parrot within BALANCE.parrot.danceRadius blocks of it
//   dances (the game's 3, the Minecraft Wiki), and the dance is music enrichment for that park day and the next.
// - Imitating: a monster within imitateRange (the game's 20) now and then, its sound with the game's own pitch and volume
//   (Mojang's sounds.json, the parrot's imitate.<mob> entries, 1.26 resource pack); now and then one that isn't there.

// The game's parrot imitations: [sound, pitch, volume], by the mob's id (Mojang's sounds.json "parrot" events).
export const IMITATE = {
  blaze: ["mob.imitate.blaze", 1.8, 0.4],
  bogged: ["mob.imitate.bogged", 1.7, 0.7],
  breeze: ["mob.imitate.breeze", 1.7, 0.7],
  camel_husk: ["mob.imitate.camel_husk", 1.7, 0.7],
  cave_spider: ["mob.imitate.spider", 1.8, 0.6],
  creaking: ["mob.imitate.creaking", 1.0, 1.0],
  creeper: ["imitate.fuse", 1.8, 0.6],
  drowned: ["mob.imitate.drowned", 1.8, 0.6],
  elder_guardian: ["mob.imitate.guardian", 1.7, 0.7],
  ender_dragon: ["mob.imitate.enderdragon", 1.8, 0.2],
  enderman: ["mob.imitate.endermen", 1.7, 0.5],
  endermite: ["mob.imitate.endermite", 1.8, 0.7],
  evocation_illager: ["mob.imitate.evocation_illager", 1.8, 0.6],
  ghast: ["mob.imitate.ghast", 1.8, 0.7],
  guardian: ["mob.imitate.guardian", 1.8, 0.7],
  husk: ["mob.imitate.husk", 1.8, 0.6],
  magma_cube: ["mob.imitate.magmacube", 1.8, 0.6],
  parched: ["mob.imitate.parched", 1.7, 0.7],
  phantom: ["mob.imitate.phantom", 1.5, 0.7],
  pillager: ["mob.imitate.pillager", 1.8, 0.7],
  polar_bear: ["mob.imitate.polarbear", 0.8, 0.7],
  ravager: ["mob.imitate.ravager", 1.7, 0.7],
  shulker: ["mob.imitate.shulker", 1.7, 0.4],
  silverfish: ["mob.imitate.silverfish", 1.8, 0.7],
  skeleton: ["mob.imitate.skeleton", 1.7, 1.0],
  slime: ["mob.imitate.slime", 1.8, 0.6],
  spider: ["mob.imitate.spider", 1.8, 0.6],
  stray: ["mob.imitate.stray", 1.6, 0.6],
  vex: ["mob.imitate.vex", 1.6, 0.8],
  vindication_illager: ["mob.imitate.vindicator", 1.7, 0.6],
  warden: ["mob.imitate.warden", 1.8, 0.8],
  witch: ["mob.imitate.witch", 1.8, 0.5],
  wither: ["mob.imitate.wither", 1.8, 0.2],
  wither_skeleton: ["mob.imitate.wither_skeleton", 1.8, 0.7],
  wolf: ["mob.imitate.wolf", 1.8, 0.6],
  zoglin: ["mob.imitate.zoglin", 1.7, 0.7],
  zombie: ["mob.imitate.zombie", 1.8, 0.6],
  zombie_pigman: ["mob.imitate.zombiepig", 1.8, 0.4],
  zombie_villager: ["mob.imitate.zombie_villager", 1.8, 0.6],
};
// The game's ids that its sounds file names otherwise.
const ALIAS = { vindicator: "vindication_illager", zombie_villager_v2: "zombie_villager" };
// Imitated when no monster is near: the monsters only (not the wolves, polar bears, endermen and zombified piglins Bedrock's
// parrots imitate too when they're near, nor the camel husk).
export const FAR_POOL = Object.keys(IMITATE).filter((k) => !["wolf", "polar_bear", "enderman", "zombie_pigman", "camel_husk"].includes(k));
export const JUKEBOX = "minecraft:jukebox";
export const HEARD = "zoocraft:imitated"; // when a parrot last imitated (Date.now(), a dynamic property)

// The Field Journal hears one that imitated a moment ago.
export function heardLately(at, nowMs, T) {
  return typeof at === "number" && nowMs - at >= 0 && nowMs - at <= T.heardMs;
}

// The imitation for a mob near a parrot: the game's own (minecraft:zombie) or the zoo's copy of it (zoocraft:zoo_zombie).
/** @param {string} typeId @returns {{ mob: string, sound: string, pitch: number, volume: number } | undefined} */
export function imitationFor(typeId) {
  const [ns, raw] = String(typeId).split(":");
  if (!raw) return undefined;
  const name = ns === "minecraft" ? raw : ns === "zoocraft" && raw.startsWith("zoo_") ? raw.slice(4) : undefined;
  if (!name) return undefined;
  const mob = ALIAS[name] ?? name;
  const s = IMITATE[mob];
  return s ? { mob, sound: s[0], pitch: s[1], volume: s[2] } : undefined;
}

// One of the monsters that isn't there, by a number from 0 to 1.
export function farImitation(r) {
  const mob = FAR_POOL[Math.min(FAR_POOL.length - 1, Math.floor(r * FAR_POOL.length))];
  const s = IMITATE[mob];
  return { mob, sound: s[0], pitch: s[1], volume: s[2] };
}

// Within the dance's reach of a jukebox: from the jukebox's middle, the radius and half a block (the jukebox's own).
export function nearJukebox(p, spot, T) {
  return Math.hypot(p.x - (spot.x + 0.5), p.y - (spot.y + 0.5), p.z - (spot.z + 0.5)) <= T.danceRadius + 0.5;
}

// Music enrichment: the parrots danced this park day or the one before (musicDays).
export function musicLately(ex, day, T) {
  return ex?.musicDay !== undefined && day - ex.musicDay >= 0 && day - ex.musicDay <= T.musicDays;
}

export function newParrotResult() {
  return { jukeboxes: 0, jukeboxSpots: [] };
}

const SIDES = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];
const key = (x, y, z) => `${x},${y},${z}`;

// The aviary's jukeboxes: in its air or beside it (on the floor, on a ledge, in a wall). typeAt(x, y, z) gives the
// block's { id } or undefined.
export function* measureParrots(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of SIDES) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      const nk = key(nx, ny, nz);
      if (seen.has(nk) || cells.has(nk)) continue;
      seen.add(nk);
      if (++n % opts.cellsPerYield === 0) yield;
      if (typeAt(nx, ny, nz)?.id !== JUKEBOX) continue;
      out.jukeboxes++;
      if (out.jukeboxSpots.length < opts.jukeboxKeep) out.jukeboxSpots.push({ x: nx, y: ny, z: nz });
    }
  }
}

// The Exhibit Clipboard's line: the jukeboxes, and whether one is playing.
export function parrotLines(ex, playing, T) {
  if (!ex.parrots) return ["§fJukebox: §7not measured yet (use the Habitat Marker on the floor inside)"];
  const n = ex.parrots.jukeboxes;
  if (!n) return ["§fJukebox: §70 (put one in the aviary and play a disc: they dance to it, and it's enrichment)"];
  return [`§fJukebox${n === 1 ? "" : "es"}: §a${n}§7${playing ? ` playing: they dance within ${T.danceRadius} blocks of it` : " (play a disc: they dance to it, and it's enrichment)"}`];
}

// The Field Journal's care notes (the aviary, the Perches, the Puzzle Feeder and company have the journal's own lines).
export function parrotCareLines(sp, T) {
  if (!sp.dances || sp.duplicates) return []; // allays: animals/allayRules.js
  return [
    "Flight: they fly from Perch to Perch and rest on each a while",
    "Food: seeds (wheat, beetroot, melon or pumpkin) or Fruit Rations from a feeder, and a Hanging Food Basket of them to forage from. Never a cookie: chocolate is poison to parrots, and the zoo's won't take one",
    `Music: within ${T.danceRadius} blocks of a jukebox that's playing they dance (enrichment, that park day and the next). They stop when the track ends`,
    `They imitate: one near a monster (within ${T.imitateRange} blocks: the Mob House's too) makes its sound now and then, and once in a while one that isn't there`,
    `Breeding: a pair lays ${sp.breeding.litter} or ${sp.breeding.litterMax} eggs, only in a Nest Box in the aviary (the game's parrots never breed: these are the zoo's)`,
  ];
}

export function parrotCatchLine(sp, carrier) {
  return `Catching: find wild ones in a jungle; with seeds in your inventory, use an empty ${carrier} on one`;
}
