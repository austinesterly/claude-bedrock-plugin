// Subject 10's cure (0.1.299; Austin's NPC #23 spec, sections 4, 12 and 13). At maximum friendship a Potion of Life
// used on her turns her fully human for good: the same resident (her record, home, work, friendships all as they
// were) with her true name, Aurora, her human look and words that no longer speak of her piglin half. The potion does
// nothing to anyone else: it reverses only this documented transformation. No engine calls here.

export const CURE = {
  resident: "subject_10",
  item: "zoocraft:potion_of_life",
  portrait: "aurora",
};

let cured = false;
/** Whether she has been cured in this world (residents/cure.js reads it from the save as the world loads). */
export const isCured = () => cured;

/** What using the potion on her does: "already" (cured before), "notYet" (below maximum friendship) or "cure". */
export function cureCheck(state, max) {
  if (state.cured) return "already";
  return (state.points ?? 0) >= max ? "cure" : "notYet";
}

/** A reward's extra condition: `needs: "cured"` waits for the cure, `until: "cured"` is no longer told after it. */
export function cureGate(reward, isCuredNow = cured) {
  if (reward.needs === "cured") return isCuredNow;
  if (reward.until === "cured") return !isCuredNow;
  return true;
}

const OLD = /piglin|\bhalf\b|\bhalves\b|Subject 10/i;

/** Her chats without the ones about her piglin half or her old name (a list is never emptied). */
export function scrubChats(node) {
  if (Array.isArray(node)) {
    const kept = node.filter((x) => !(typeof x === "string" && OLD.test(x)) && !(x && typeof x === "object" && typeof x.text === "string" && OLD.test(x.text)));
    if (kept.length && kept.length !== node.length) node.splice(0, node.length, ...kept);
    for (const x of node) scrubChats(x);
  } else if (node && typeof node === "object") for (const v of Object.values(node)) scrubChats(v);
  return node;
}

/**
 * Makes the resident's entry the cured one, in place (every page, sign and line reads the entry): the name, look,
 * bio and lines under its `cured`, and her chats scrubbed. Done once; safe to call again.
 */
export function applyCure(entry, chats) {
  cured = true;
  const c = entry?.cured;
  if (!c || entry.name === c.name) return entry;
  entry.name = c.name;
  entry.look = c.look;
  entry.bio = c.bio;
  entry.lines = { ...entry.lines, ...c.lines, giftTags: { ...entry.lines.giftTags, ...(c.lines.giftTags ?? {}) } };
  if (chats) scrubChats(chats);
  return entry;
}

/** For tests only: as a world where she has not been cured. */
export function resetCure() {
  cured = false;
}
