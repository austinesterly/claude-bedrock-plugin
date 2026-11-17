// Melding Solute, the wizard's secret ingredient (0.1.322). Austin, 17 Nov 2026: "Let's have the secret ingredient be
// melding solute, it is created with a bucket of milk, and a bucket of goo both poured into a cauldron togehter. The
// cauldron liquid turns bright green and the player can use bottles to get 16 bottles out of it." The game's cauldron
// can hold neither milk nor goo, so a cauldron with milk in it is a Milk Cauldron of ours (as the Goo Cauldron is),
// and the two together are a Solute Cauldron. No engine calls here.

export const SOLUTE = "zoocraft:melding_solute";
export const MILK_CAULDRON = "zoocraft:milk_cauldron";
export const SOLUTE_CAULDRON = "zoocraft:solute_cauldron";
export const MILK_BUCKET = "minecraft:milk_bucket";
export const GOO_BUCKET_ID = "zoocraft:goo_bucket";
export const GOO_CAULDRON_ID = "zoocraft:goo_cauldron";
/** Bottles in one cauldron of solute (Austin: 16). */
export const BOTTLES = 16;
/** A Goo Cauldron holds a whole bucket of goo at this level. */
export const GOO_FULL = 3;

/**
 * What using `held` on a cauldron does for the solute. `block` is the cauldron's id, `empty` whether a plain cauldron
 * holds nothing, `gooLevel` a Goo Cauldron's level, `bottles` a Solute Cauldron's. Returns undefined (not ours) or
 * { to, bottles?, give?, back? }: the block it becomes (with how many bottles), what the player is handed, and what
 * the thing in their hand turns into.
 */
export function soluteUse(held, block, { empty = false, gooLevel = 0, bottles = 0 } = {}) {
  if (block === "minecraft:cauldron") return held === MILK_BUCKET && empty ? { to: MILK_CAULDRON, back: "minecraft:bucket", sound: "cauldron.fillwater" } : undefined;
  if (block === MILK_CAULDRON) {
    if (held === GOO_BUCKET_ID) return { to: SOLUTE_CAULDRON, bottles: BOTTLES, back: "minecraft:bucket", sound: "random.fizz", made: true };
    if (held === "minecraft:bucket") return { to: "minecraft:cauldron", back: MILK_BUCKET, sound: "cauldron.takewater" };
    return undefined;
  }
  if (block === GOO_CAULDRON_ID) return held === MILK_BUCKET && gooLevel >= GOO_FULL ? { to: SOLUTE_CAULDRON, bottles: BOTTLES, back: "minecraft:bucket", sound: "random.fizz", made: true } : undefined;
  if (block === SOLUTE_CAULDRON) {
    if (held !== "minecraft:glass_bottle" || bottles < 1) return undefined;
    return bottles > 1 ? { to: SOLUTE_CAULDRON, bottles: bottles - 1, give: SOLUTE, sound: "cauldron.takepotion" } : { to: "minecraft:cauldron", give: SOLUTE, sound: "cauldron.takepotion" };
  }
  return undefined;
}

/** How full a Solute Cauldron looks: 3 (11 to 16 bottles), 2 (6 to 10) or 1 (1 to 5). */
export const soluteLook = (bottles) => (bottles >= 11 ? 3 : bottles >= 6 ? 2 : 1);

/** The hint a cauldron of ours gives when it is used with something else. */
export function soluteHint(block, { gooLevel = 0, bottles = 0 } = {}) {
  if (block === MILK_CAULDRON) return "§fMilk Cauldron: §7pour a Goo Bucket into it to make Melding Solute. An empty bucket takes the milk back.";
  if (block === SOLUTE_CAULDRON) return `§aMelding Solute §7(${bottles} of ${BOTTLES} bottles left): §ffill Glass Bottles from it.`;
  if (block === GOO_CAULDRON_ID && gooLevel < GOO_FULL) return "§7The goo must fill the cauldron before milk will turn it to Melding Solute: add a Goo Bucket.";
  return undefined;
}
