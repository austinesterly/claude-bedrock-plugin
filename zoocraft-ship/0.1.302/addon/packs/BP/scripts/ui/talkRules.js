// The residents' talk screen (0.1.229, Austin: "I also want a custom UI for NPC interactions. Make it similar to
// stardew valleys"), pure. The screen itself is drawn by the resource pack (RP ui/server_form.json): a wide box of
// their words with their portrait and name on its right and the choices in a frame above it. The pack shows it in
// place of the game's plain menu for any menu whose title starts with TALK_FLAG, and takes the portrait from the
// first button's icon. A menu without the flag, or a game that stops reading the pack's layout, gets the plain menu
// with the same words and buttons. The art is the add-on's own (scratch gen229/art229.py).

/** What a talk-screen title starts with: formatting codes only, so nothing of it is ever drawn. The same text is in RP ui/server_form.json three times. */
export const TALK_FLAG = "§t§a§l§k§r";

/** How many hearts the talk screen can show (RP textures hearts_0 to hearts_5, each named in ui/server_form.json). */
export const HEARTS = 5;

/** A friendship's hearts (0.1.232): none to HEARTS, one for each fifth of the way to `max`. */
export function heartsOf(points, max) {
  return Math.max(0, Math.min(HEARTS, Math.floor(((points ?? 0) / max) * HEARTS)));
}

/**
 * The title of a resident's menu: flagged for the talk screen, or plain. With `hearts` (0 to HEARTS) the flag is
 * followed by "§<hearts>§r", which the pack reads to show that many hearts; both are formatting codes, so only the
 * name is ever drawn.
 */
export function talkTitle(name, story, hearts) {
  if (!story) return name;
  return `${TALK_FLAG}${Number.isInteger(hearts) && hearts >= 0 && hearts <= HEARTS ? `§${hearts}§r` : ""}${name}`;
}

/** The portraits a resident has besides the plain one (0.1.232). */
export const MOODS = ["happy", "cross", "creeped"]; // creeped: 0.1.233, asked to follow a near stranger

/**
 * A resident's portrait (RP textures/ui/zoocraft/talk/portraits/<id>.png, or <id>_<mood>.png for a mood in MOODS),
 * as a button's icon path.
 */
const PORTRAIT_AS = new Map();
/** 0.1.299: a resident drawn with another set of portraits from here on (Subject 10 cured: Aurora's). */
export function setPortraitAs(id, as) {
  PORTRAIT_AS.set(id, as);
}

export function portraitOf(id, mood) {
  return `textures/ui/zoocraft/talk/portraits/${PORTRAIT_AS.get(id) ?? id}${MOODS.includes(mood) ? `_${mood}` : ""}`;
}

/**
 * The face for an answer (0.1.232): cross when they tell the player off or dislike a gift, happy when friendship
 * grew, they like a gift, or they hand over one of their own; else the plain one (undefined).
 * @param {{ status?: string, gain?: number, kind?: string, gift?: boolean }} [what]
 */
export function moodFor(what) {
  const { status, gain, kind, gift } = what ?? {};
  if (status === "toldOff" || kind === "disliked" || (gain ?? 0) < 0) return "cross";
  if (gift || (gain ?? 0) > 0 || kind === "liked") return "happy";
  return undefined;
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

// ---- 0.1.294: answers that fit the box (Austin, 15 Nov: "Screen is cut off") ----
// The talk screen's box is a fixed size and can't scroll: it shows TALK_BOX.lines lines of about TALK_BOX.chars
// letters (measured from Austin's screenshot: 42 to 44 letters filled a line, and the seventh line was cut). A longer
// answer is told over several pages, whole sentences and whole notes to a page.
export const TALK_BOX = { chars: 38, lines: 6 };

/** How many lines of the box a text takes (formatting codes aren't drawn; every paragraph starts a line). */
export function boxLines(text, chars = TALK_BOX.chars) {
  return String(text).replace(/§./g, "").split("\n").reduce((n, p) => n + Math.max(1, Math.ceil(p.length / chars)), 0);
}

/** Their words in pieces that each fit `lines` lines: cut between sentences, or between words when one sentence is too long. */
export function splitSay(line, chars = TALK_BOX.chars, lines = TALK_BOX.lines) {
  const room = chars * lines - 2; // the quotation marks
  if (line.length <= room) return [line];
  const units = [];
  for (const sentence of line.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) ?? [line]) {
    let rest = sentence.trim();
    while (rest.length > room) {
      const cut = rest.lastIndexOf(" ", room);
      const at = cut > 0 ? cut : room;
      units.push(rest.slice(0, at));
      rest = rest.slice(at).trim();
    }
    if (rest) units.push(rest);
  }
  const out = [];
  for (const u of units) {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + 1 + u.length <= room) out[out.length - 1] = `${last} ${u}`;
    else out.push(u);
  }
  return out;
}

/**
 * Paragraphs ({ lines } each, in order) laid out over pages of at most `lines` lines: a list of pages, each a list
 * of the paragraphs on it. Nothing is dropped; a paragraph longer than a page has a page to itself.
 */
export function talkPages(paras, lines = TALK_BOX.lines) {
  const pages = [];
  let used = 0;
  for (const p of paras) {
    if (!pages.length || used + p.lines > lines) {
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push(p);
    used += p.lines;
  }
  return pages;
}

/** (0.1.302) A quick gift's chat line: their words, then what it did for the friendship (green, red or grey). */
export function quickGiftLine(name, said, gainText, friendship, gain) {
  return `§f${name}: §7"${said}" ${gain > 0 ? "§a" : gain < 0 ? "§c" : "§7"}${gainText} §8(${friendship})`;
}
