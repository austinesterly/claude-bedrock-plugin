// The fishing sky's own fish (0.1.282). Jack's spec: at 100 friendship he unlocks "different custom fishing rods, a new
// fishing dimension, new custom fishing mechanics, new custom fish". One fish for each kind of island, caught there with
// Jack's rods (the Steel Rod and the Deep Sea Rod: the game's own rod catches the game's fish everywhere). A share of
// the fish an island gives are its own (loot_tables/gameplay/fishing/zoocraft_<set>_fish.json, the set as
// fishing/islandRules.js FISH_SETS names it), the rest the game's.
// Each one eats raw like the game's cod, or cooks (furnace, smoker, campfire) into a meal like its cooked salmon; the
// Gilded Koi, like a tropical fish, isn't for cooking; the mythic Golden Sailfin cooks into the best meal of them, as
// filling as a steak. The pictures are the game's own fish pictures in new colours (scratchpad gen282/art282.py).
// No engine calls here.

/** Each fish: its id, name, the kind of island it lives at, and [nutrition, saturation modifier] raw and cooked. */
export const SKY_FISH = Object.freeze([
  Object.freeze({ id: "zoocraft:sky_perch", name: "Sky Perch", island: "common", raw: [2, 0.1], cooked: [6, 0.8] }),
  Object.freeze({ id: "zoocraft:amethyst_trout", name: "Amethyst Trout", island: "uncommon", raw: [2, 0.1], cooked: [6, 0.8] }),
  Object.freeze({ id: "zoocraft:gilded_koi", name: "Gilded Koi", island: "rare", raw: [1, 0.1] }),
  Object.freeze({ id: "zoocraft:willow_bass", name: "Willow Bass", island: "exotic", raw: [2, 0.1], cooked: [6, 0.8] }),
  Object.freeze({ id: "zoocraft:golden_sailfin", name: "Golden Sailfin", island: "mythic", raw: [2, 0.1], cooked: [8, 0.8] }),
  Object.freeze({ id: "zoocraft:harbour_herring", name: "Harbour Herring", island: "huge", raw: [2, 0.1], cooked: [6, 0.8] }),
]);

/** Out of every 100 fish an island gives, how many are its own (the rest are the game's cod, salmon and the rest). */
export const SKY_FISH_SHARE = 25;

/** The cooked one's id ("zoocraft:cooked_sky_perch"), or undefined for a fish that isn't cooked. */
export const cookedId = (f) => (f?.cooked ? f.id.replace("zoocraft:", "zoocraft:cooked_") : undefined);

/** The fish of an island of that kind, or undefined. */
export const fishOfIsland = (kind) => SKY_FISH.find((f) => f.island === kind);

/** Every id: the six fish and the five cooked ones. */
export const SKY_FISH_IDS = Object.freeze(SKY_FISH.flatMap((f) => [f.id, cookedId(f)].filter(Boolean)));
