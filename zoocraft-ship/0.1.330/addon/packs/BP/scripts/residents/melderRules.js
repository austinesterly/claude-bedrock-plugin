// The Melder's rules (0.1.315; Austin's NPC #27 spec, research/ZooCraft_Tycoon_NPC_27_Darian.md, friendship 30 and 40:
// "Supports combining items to discover magical recipes ... Valid combinations produce their defined results. Invalid
// combinations should not create an undefined potion or item"). The spec's recipe (friendship 70: "Ender Flame recipe:
// 1 Fire Charge + 1 Ender Pearl, combined in the Melder") and, 0.1.330, Austin's three for the advanced potions
// (2026-11-18: "all melded ingrediants need to be put with an awkward potion in order for it to work"). Two things that
// are no recipe simply stay where they lie. No engine calls here.

export const MELDER = "zoocraft:melder";
export const MELDER_STORE = "zoocraft:melder_store";
/** The store's name tag: its lang key, which the game shows translated as the screen's title (RP/ui/redstone_screen.json looks for it). */
export const MELDER_TITLE = "entity.zoocraft:melder_store.name";
export const ENDER_FLAME = "zoocraft:ender_flame";
export const MELDING_BOOK = "zoocraft:book_of_melding";

/** The store's five slots in a row: two to put things in, two covered by the screen's picture, one for what is made. */
export const SLOT_IN = [0, 1];
/** 0.1.322: the third slot takes Melding Solute (Austin: "items can only be melded if there is a solute there"); the fourth shows the gauge. */
export const SLOT_SOLUTE = 2;
export const SLOT_GAUGE = 3;
export const SLOTS_SHUT = [SLOT_GAUGE];
export const SLOT_OUT = 4;
export const SOLUTE = "zoocraft:melding_solute";
export const GAUGE_STEPS = 8;
export const gaugeItem = (k) => `zoocraft:meld_gauge_${k}`;
export const isGauge = (typeId) => typeof typeId === "string" && typeId.startsWith("zoocraft:meld_gauge_");

/** Every defined melding recipe: two different things, one of each, in either order. */
export const MELDS = [
  // 0.1.329: `hint`, what the Book of Melding says of it until the reader knows it; `told`, who tells it in full (a
  // resident's id and the ability they tell it with: Darian gives the Ender Flame's at 70)
  { id: "ender_flame", inputs: ["minecraft:fire_charge", "minecraft:ender_pearl"], words: ["Fire Charge", "Ender Pearl"], result: ENDER_FLAME, makes: 1, name: "Ender Flame", hint: "a ball of fire that needs no flint, joined with what an Enderman leaves behind", told: { res: "darian", ability: "void_portal_plan" } },
  // 0.1.330: the advanced potions' ingredients; `brews`, what the melded thing makes brewed into an Awkward Potion
  { id: "unstable_eye", inputs: ["minecraft:spider_eye", "minecraft:tnt"], words: ["Spider Eye", "TNT"], result: "zoocraft:unstable_eye", makes: 1, name: "Unstable Eye", hint: "what a spider sees with, joined with a block that blows up", brews: "Potion of Explosion" },
  { id: "apple_of_growth", inputs: ["minecraft:golden_apple", "minecraft:bone_meal"], words: ["Golden Apple", "Bone Meal"], result: "zoocraft:apple_of_growth", makes: 1, name: "Apple of Growth", hint: "a fruit dipped in gold, joined with the dust that makes plants grow", brews: "Potion of Demeter's Aura" },
  { id: "gold_fruit", inputs: ["minecraft:golden_carrot", "minecraft:glistering_melon_slice"], words: ["Golden Carrot", "Glistering Melon Slice"], result: "zoocraft:gold_fruit", makes: 1, name: "Gold Fruit", hint: "a golden root, joined with a golden slice of fruit", brews: "Potion of Archer's Tempo" },
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

/**
 * 0.1.322: one melding: one of each thing and `use` bottles of Melding Solute make the recipe's result, if the last
 * slot has room for it. `a`, `b`, `solute`, `out`: { typeId, amount } or undefined. Returns { meld, made, why } with
 * why "ok", or undefined meld and why "waiting" (a slot is empty), "nothing" (no recipe), "solute" (none, or not
 * enough) or "full".
 */
export function cyclePlan(a, b, solute, out, use = 1, stack = 64, melds = MELDS) {
  if (!a || !b) return { why: "waiting" };
  const meld = meldOf(a.typeId, b.typeId, melds);
  if (!meld) return { why: "nothing" };
  if (solute?.typeId !== SOLUTE || solute.amount < use) return { why: "solute" };
  if (out && (out.typeId !== meld.result || out.amount + meld.makes > stack)) return { why: "full" };
  return { meld, made: meld.makes, why: "ok" };
}

/**
 * The melding's clock: `prev` is { id, t } or undefined, `id` the recipe lying in the Melder now (undefined: none that
 * can go on), `dt` the ticks since the last look. A new recipe starts from nothing; taking a thing out stops it.
 * Returns undefined (idle) or { id, t, done }.
 */
export function meldStep(prev, id, dt, time) {
  if (!id) return undefined;
  const t = (prev?.id === id ? prev.t : 0) + dt;
  return { id, t, done: t >= time };
}

/** Which of the gauge's pictures shows `t` of `time` ticks: 1 to GAUGE_STEPS. */
export const gaugeOf = (t, time) => Math.max(1, Math.min(GAUGE_STEPS, 1 + Math.floor((GAUGE_STEPS * t) / time)));

/**
 * The Book of Melding's page: every defined recipe, a line each. 0.1.329 (Austin: "Book of melding gives a hint for
 * every recipee"): one the reader knows (`knows(m)`: made it in a Melder, or been told it) in full, the rest as a hint.
 * @param {any[]} [melds]
 * @param {(m: any) => boolean} [knows]
 */
export function bookText(melds = MELDS, knows = (m) => false) {
  const lines = melds.map((m) => (knows(m) ? `${m.name}: ${m.words[0]} + ${m.words[1]}${m.brews ? `. Brew it into an Awkward Potion for a ${m.brews}.` : ""}` : `${m.name}: not found yet. Hint: ${m.hint}.`));
  return ["What may be joined in a Melder, and what comes of it. Put one thing in each of the two yellow slots, in either order, and a bottle of Melding Solute in the green slot between them. Each melding takes a little time and one bottle.", "", "Melding Solute: pour a bucket of milk and a bucket of goo into one cauldron, in either order, and fill Glass Bottles from it. One cauldron fills 16.", "", "A recipe you have made in a Melder, or been told, is written here in full. The rest have a hint.", "", ...lines].join("\n");
}

/** 0.1.329: the recipes a player has found, kept on them as a comma list of ids (FOUND_KEY). */
export const FOUND_KEY = "zoocraft:melds_found";
export const foundList = (s) => (typeof s === "string" && s ? s.split(",") : []);
/** The list with one more recipe found (the same string when it was already there). */
export const withFound = (s, id) => (foundList(s).includes(id) ? s : [...foundList(s), id].join(","));
