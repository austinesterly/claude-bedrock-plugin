// Allays (0.1.194, module 12; research/vanilla_plan.md "0.1.194 bats and allays: the design"): the rules, kept apart from
// the game so the tests can run them. The game hovers the zoo copy and keeps its item goals (entities/zoo_allay.json). Its dancing and splitting in two are the game's engine's, so the zoo does them:
// - Dancing: the parrots' way (animals/parrot.js), within BALANCE.allay.danceRadius of a jukebox that's playing.
// - Splitting in two: an amethyst shard used on a dancing one that isn't resting from the last time (the copy's own
//   interaction: the shard used up, its event zoocraft:duplicate) makes a new zoo allay beside it (animals/allay.js); both
//   rest BALANCE.allay.dupTicks (the game's 6000, 5 minutes), kept on their records in real time (dupUntil, Date.now()'s
//   milliseconds: the world's time stands still with the daylight cycle off, the test server showed).
// - What it holds: the copy's give and take interactions set zoocraft:holding, so the crate can ask for it back first (a
//   script can't see its hand: no equippable component, its inventory reads empty, hasitem finds nothing; the test
//   server). It picks up more of the same, as the game's, but keeps them: the game's brings them to the player who gave it
//   the item, by its engine (the test server: the game's brought a dropped diamond back, the copy didn't).
// - Note blocks in or beside the room (ex.allays.noteBlocks): enrichment. (The game's allays hear one play by their
//   vibration listener, which the game keeps to its own allay and warden: the copy goes without, the test server.)

export const DANCING = "zoocraft:dancing";
export const DUP_READY = "zoocraft:dup_ready";
export const HOLDING = "zoocraft:holding";
export const NOTE_BLOCK = "minecraft:noteblock";

export function newAllayResult() {
  return { noteBlocks: 0, noteSpots: [] };
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

// The room's note blocks: beside its air (on the floor, in a wall, under the roof). typeAt(x, y, z) gives { id } or undefined.
export function* measureAllays(typeAt, cells, opts, out) {
  const seen = new Set();
  let n = 0;
  for (const k of cells.keys()) {
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dy, dz] of SIDES) {
      const nk = key(x + dx, y + dy, z + dz);
      if (seen.has(nk) || cells.has(nk)) continue;
      seen.add(nk);
      if (++n % opts.cellsPerYield === 0) yield;
      if (typeAt(x + dx, y + dy, z + dz)?.id !== NOTE_BLOCK) continue;
      out.noteBlocks++;
      if (out.noteSpots.length < opts.keep) out.noteSpots.push({ x: x + dx, y: y + dy, z: z + dz });
    }
  }
}

// A note block there (enrichment).
export function hasNoteBlock(species, ex) {
  return Boolean(species.noteBlock && ex.allays?.noteBlocks > 0);
}

// Resting from splitting in two: until a.dupUntil (Date.now()'s milliseconds; `now` the same).
export function dupResting(a, now) {
  return typeof a?.dupUntil === "number" && now < a.dupUntil;
}

// The rest in milliseconds (the game's ticks, 20 a second).
export function dupRestMs(T) {
  return T.dupTicks * 50;
}

// How long it rests yet, in whole seconds (for the clipboard).
export function dupSecondsLeft(a, now) {
  return dupResting(a, now) ? Math.ceil((a.dupUntil - now) / 1000) : 0;
}

// The Exhibit Clipboard's lines: the note blocks (the jukeboxes are the parrots' line).
export function allayLines(ex) {
  if (!ex.allays) return ["§fNote block: §7not measured yet (use the Habitat Marker on the floor inside)"];
  const n = ex.allays.noteBlocks;
  return [n ? `§fNote block${n === 1 ? "" : "s"}: §a${n}§7 (enrichment)` : "§fNote block: §70 (put one in the room or its wall: it's enrichment)"];
}

// The clipboard's animal page: whether it can split in two now.
export function dupLine(a, now) {
  const s = dupSecondsLeft(a, now);
  return s > 0 ? `§fSplitting in two: §7resting, ${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} to go` : "§fSplitting in two: §7ready (give it an amethyst shard while it dances to a jukebox)";
}

// The Field Journal's care notes.
export function allayCareLines(sp, T, parrotT) {
  if (!sp.duplicates) return [];
  return [
    `Music: within ${T.danceRadius} blocks of a jukebox that's playing they dance (enrichment, that park day and the next), and stop when the track ends`,
    `Splitting in two: give a dancing one an amethyst shard and it splits into two, as in the game; both rest ${Math.round(T.dupTicks / 1200)} minutes before they can again. It's the only way they have young: no sexes, no babies, no Breeding switch`,
    "Note blocks: one in the room or its wall is enrichment for them",
    "Items: give one an item and it holds it, and picks up more of the same it finds dropped in the room (the game's brings them to you; the zoo's keep them). Use it with an empty hand to take them back. Take them back before you crate it",
    "Food: the game's allays eat nothing; in the zoo they're given fruit (sweet and glow berries, Fruit Rations) from a feeder, and a Hanging Food Basket of them to forage from",
    `Company: alone or up to ${sp.social.recommendedMax}. They glow, so guests see them in the dark`,
  ];
}

export function allayCatchLine(sp, carrier) {
  return `Catching: 1 to 3 shut in the dark oak cages by pillager outposts and in the cells of woodland mansions (break in). With ${sp.baitText} in your inventory, use an empty ${carrier} on one. One holding an item someone gave it: take it back first (use it with an empty hand)`;
}

// The crate's first try on a wild allay: it may hold an item (the zoo can't see its hand, so it would be lost).
export function allayHoldText(name) {
  return `§eIf this ${name} holds an item someone gave it, take it back first (use it with an empty hand): the crate can't hold it. Use the crate on it again to catch it.`;
}
