// The Melder's rules (0.1.315; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, friendship 30 and 40:
// "Supports combining items to discover magical recipes ... Valid combinations produce their defined results. Invalid
// combinations should not create an undefined potion or item"). The spec defines one recipe so far (friendship 70:
// "Ender Flame recipe: 1 Fire Charge + 1 Ender Pearl, combined in the Melder"); the rest of the library, ingredient
// limits, brewing times, effects and invalid-recipe feedback are his to decide, so there are none: two things that
// are no recipe simply stay where they lie. No engine calls here.

export const MELDER = "zoocraft:melder";
export const MELDER_STORE = "zoocraft:melder_store";
/** The store's name tag: its lang key, which the game shows translated as the screen's title (RP/ui/redstone_screen.json looks for it). */
export const MELDER_TITLE = "entity.zoocraft:melder_store.name";
export const ENDER_FLAME = "zoocraft:ender_flame";
export const MELDING_BOOK = "zoocraft:book_of_melding";

/** The store's five slots in a row: two to put things in, two covered by the screen's picture, one for what is made. */
export const SLOT_IN = [0, 1];
export const SLOTS_SHUT = [2, 3];
export const SLOT_OUT = 4;

/** Every defined melding recipe: two different things, one of each, in either order. */
export const MELDS = [
  { id: "ender_flame", inputs: ["minecraft:fire_charge", "minecraft:ender_pearl"], words: ["Fire Charge", "Ender Pearl"], result: ENDER_FLAME, makes: 1, name: "Ender Flame" },
];

/** The recipe two things make, in either order, or undefined. */
export function meldOf(a, b, melds = MELDS) {
  if (!a || !b || a === b) return undefined;
  return melds.find((m) => (m.inputs[0] === a && m.inputs[1] === b) || (m.inputs[0] === b && m.inputs[1] === a));
}

/**
 * What a Melder makes of what lies in it: `a` and `b` are its two slots ({ typeId, amount } or undefined), `out` its
 * last slot. Returns { meld, batches, made } or undefined when the two are no recipe, or the last slot holds something
 * else or is full. Every pair that fits is joined at once.
 */
export function meldPlan(a, b, out, stack = 64, melds = MELDS) {
  const meld = meldOf(a?.typeId, b?.typeId, melds);
  if (!meld) return undefined;
  if (out && out.typeId !== meld.result) return undefined;
  const room = Math.floor((stack - (out?.amount ?? 0)) / meld.makes);
  const batches = Math.min(a.amount, b.amount, room);
  return batches >= 1 ? { meld, batches, made: batches * meld.makes } : undefined;
}

/** The Book of Melding's page: every defined recipe, a line each. */
export function bookText(melds = MELDS) {
  const lines = melds.map((m) => `${m.name}: ${m.words[0]} + ${m.words[1]}`);
  return ["What may be joined in a Melder, and what comes of it. Put one thing in each of its first two slots, in either order.", "", ...lines].join("\n");
}
