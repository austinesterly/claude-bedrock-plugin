// The Guitar (0.1.373; Austin's notes for Zach, level 80: "the player is given a guitar body, they can now craft a
// guitar with the body in the middle bottom, and 6 strings, 3 on each side of it. The guitar can play sounds like a
// noteblock with just right click, and left click changes the note that you are playing."). No engine calls here.

export const GUITAR = "zoocraft:guitar";
export const GUITAR_BODY = "zoocraft:guitar_body";
export const GUITAR_SOUND = "note.guitar"; // the game's own note block guitar
/** A note block's 25 notes, two octaves from F sharp. */
export const NOTE_COUNT = 25;
const NAMES = ["F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F"];

export const noteOf = (n) => (Number.isInteger(n) && n >= 0 && n < NOTE_COUNT ? n : 0);
export const noteName = (n) => NAMES[noteOf(n) % 12];
/** The pitch a note block gives that note: half speed at the lowest, double at the highest. */
export const notePitch = (n) => 2 ** ((noteOf(n) - 12) / 12);
/** The next note up (a left click), or down (a left click while sneaking); round again at either end. */
export const nextNote = (n, down = false) => (noteOf(n) + (down ? NOTE_COUNT - 1 : 1)) % NOTE_COUNT;
/** What chat says when the note changes. */
export const noteText = (n) => `§7Guitar note: §f${noteName(n)}§7 (${noteOf(n) + 1} of ${NOTE_COUNT})`;
/** A left click: an attack or mining swing, not placing, dropping or using. */
export const isLeftClick = (source) => source === "Attack" || source === "Mine";
export const changeReady = (last, now, g) => last === undefined || now - last >= g.changeTicks;
