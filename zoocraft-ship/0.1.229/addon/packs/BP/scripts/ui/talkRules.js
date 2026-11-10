// The residents' talk screen (0.1.229, Austin: "I also want a custom UI for NPC interactions. Make it similar to
// stardew valleys"), pure. The screen itself is drawn by the resource pack (RP ui/server_form.json): a wide box of
// their words with their portrait and name on its right and the choices in a frame above it. The pack shows it in
// place of the game's plain menu for any menu whose title starts with TALK_FLAG, and takes the portrait from the
// first button's icon. A menu without the flag, or a game that stops reading the pack's layout, gets the plain menu
// with the same words and buttons. The art is the add-on's own (scratch gen229/art229.py).

/** What a talk-screen title starts with: formatting codes only, so nothing of it is ever drawn. The same text is in RP ui/server_form.json three times. */
export const TALK_FLAG = "§t§a§l§k§r";

/** The title of a resident's menu: flagged for the talk screen, or plain. */
export function talkTitle(name, story) {
  return story ? `${TALK_FLAG}${name}` : name;
}

/** A resident's portrait (RP textures/ui/zoocraft/talk/portraits/<id>.png), as a button's icon path. */
export function portraitOf(id) {
  return `textures/ui/zoocraft/talk/portraits/${id}`;
}

/**
 * The colours of a menu's words: the plain menu is dark with light words, the talk screen is cream with dark ones
 * (its own words are the box's brown: no code). say (their words), plain, dim, good, bad.
 */
export function talkInk(story) {
  return story ? { say: "", plain: "§8", dim: "§8", good: "§2", bad: "§4", name: "§0" } : { say: "§f", plain: "§7", dim: "§8", good: "§a", bad: "§c", name: "§f" };
}

/**
 * A button's label. The plain menu has room for a second line (`note`); the talk screen's rows are one line: a button
 * that can't be used yet is dimmed (pressing it says why in full), and a `good` note is put after the label, short.
 */
export function talkButton(label, note, story, short) {
  if (!note) return label;
  if (!story) return `${label}\n${note.good ? "§a" : "§8"}${note.text}`;
  return note.good ? `${label} §2(${short ?? note.text})` : `§8${label}`;
}
