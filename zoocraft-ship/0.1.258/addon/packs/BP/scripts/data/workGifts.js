// Work gifts (0.1.226, stage E of Austin's residents spec, section 9: research/npc_spec_plan.md section 10; every table
// our default, Austin's to change). What a happy, friendly worker sometimes keeps for a player, by their job (a
// resident's `giftTable`, else their occupation). Each entry: [item, fewest, most, weight, { skill, tier }]: skill, the
// work skill it needs (0 Apprentice, 1 Skilled, 2 Expert; only for a worker at a Work Anchor site), tier, the friendship
// it needs (2 Friend, 3 Close Friend, 4 Best Friend). Plain vanilla items, nothing that isn't got in survival.

export const WORK_GIFTS = {
  // Dave: coal, copper and iron, gold, redstone and lapis when Skilled, now and then a diamond or emerald when Expert.
  miner: [
    ["minecraft:coal", 3, 6, 30],
    ["minecraft:raw_copper", 2, 5, 20],
    ["minecraft:raw_iron", 1, 3, 25],
    ["minecraft:raw_gold", 1, 2, 12, { skill: 1 }],
    ["minecraft:redstone", 3, 6, 10, { skill: 1 }],
    ["minecraft:lapis_lazuli", 2, 5, 10, { skill: 1 }],
    ["minecraft:diamond", 1, 1, 4, { skill: 2 }],
    ["minecraft:emerald", 1, 1, 3, { skill: 2 }],
    ["minecraft:diamond", 1, 2, 3, { skill: 2, tier: 4 }],
  ],
  // Paola: logs and saplings, apples and sticks; dark oak when Skilled; four big-tree saplings when Expert.
  "tree chopper": [
    ["minecraft:oak_log", 4, 8, 20],
    ["minecraft:birch_log", 4, 8, 15],
    ["minecraft:spruce_log", 4, 8, 15],
    ["minecraft:cherry_log", 3, 6, 8],
    ["minecraft:oak_sapling", 1, 3, 8],
    ["minecraft:birch_sapling", 1, 3, 6],
    ["minecraft:cherry_sapling", 1, 2, 4],
    ["minecraft:apple", 1, 3, 12],
    ["minecraft:dark_oak_log", 4, 8, 8, { skill: 1 }],
    ["minecraft:jungle_sapling", 1, 2, 5, { skill: 1 }],
    ["minecraft:dark_oak_sapling", 4, 4, 6, { skill: 2 }],
    ["minecraft:jungle_sapling", 4, 4, 3, { skill: 2, tier: 3 }],
  ],
  // Ron: the harvest, bread and baked potatoes; pumpkin pie when Skilled; golden carrots when Expert; a cake for a
  // best friend.
  farmer: [
    ["minecraft:wheat", 3, 6, 15],
    ["minecraft:carrot", 3, 6, 15],
    ["minecraft:potato", 3, 6, 15],
    ["minecraft:beetroot", 3, 5, 10],
    ["minecraft:bread", 2, 4, 15],
    ["minecraft:baked_potato", 3, 5, 10],
    ["minecraft:pumpkin_pie", 1, 2, 8, { skill: 1 }],
    ["minecraft:golden_carrot", 1, 3, 5, { skill: 2 }],
    ["minecraft:cake", 1, 1, 2, { tier: 4 }],
  ],
  // Amanda: what a geologist picks up: amethyst, quartz, flint, calcite; now and then an emerald for a close friend.
  geologist: [
    ["minecraft:amethyst_shard", 2, 4, 25],
    ["minecraft:quartz", 2, 4, 20],
    ["minecraft:flint", 2, 4, 20],
    ["minecraft:calcite", 2, 4, 15],
    ["minecraft:tuff", 2, 4, 10],
    ["minecraft:emerald", 1, 1, 4, { tier: 3 }],
  ],
  // Carrot: carrots and dandelions for the bunnies; a golden carrot for a close friend.
  "bunny rehabilitator": [
    ["minecraft:carrot", 3, 6, 35],
    ["minecraft:dandelion", 2, 4, 25],
    ["minecraft:hay_block", 1, 1, 15],
    ["minecraft:golden_carrot", 1, 2, 5, { tier: 3 }],
  ],
  // Zach and Jared: a note block; a music disc for a close friend.
  singer: [
    ["minecraft:noteblock", 1, 2, 30],
    ["minecraft:music_disc_cat", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_blocks", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_chirp", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_far", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_mall", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_mellohi", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_stal", 1, 1, 3, { tier: 3 }],
    ["minecraft:music_disc_strad", 1, 1, 3, { tier: 3 }],
    ["minecraft:jukebox", 1, 1, 2, { tier: 4 }],
  ],
  // Austin: what a zoo influencer has spare: paper, a book, a lead, a name tag; a spyglass for a close friend.
  "zoo influencer": [
    ["minecraft:paper", 3, 6, 25],
    ["minecraft:book", 1, 2, 20],
    ["minecraft:lead", 1, 2, 20],
    ["minecraft:name_tag", 1, 1, 10],
    ["minecraft:spyglass", 1, 1, 5, { tier: 3 }],
  ],
  // Teddy: the mayor's emeralds and gold nuggets, bread from a town feast; a bell for a best friend.
  mayor: [
    ["minecraft:emerald", 1, 2, 20],
    ["minecraft:gold_nugget", 3, 6, 25],
    ["minecraft:bread", 2, 4, 20],
    ["minecraft:paper", 2, 4, 15],
    ["minecraft:bell", 1, 1, 2, { tier: 4 }],
  ],
  // 0.1.243, Ailing Bot: a teacher's paper, books and his own baking; a book and quill for a close friend.
  teacher: [
    ["minecraft:paper", 3, 6, 25],
    ["minecraft:book", 1, 2, 20],
    ["minecraft:cookie", 3, 6, 20],
    ["minecraft:bread", 2, 4, 15],
    ["minecraft:writable_book", 1, 1, 5, { tier: 3 }],
  ],
  // 0.1.243, Terra: seeds, saplings, flowers and bone meal from her research; moss for a close friend.
  "environmental researcher": [
    ["minecraft:wheat_seeds", 3, 6, 25],
    ["minecraft:oak_sapling", 1, 3, 20],
    ["minecraft:bone_meal", 3, 6, 20],
    ["minecraft:poppy", 2, 4, 15],
    ["minecraft:moss_block", 2, 4, 5, { tier: 3 }],
  ],
  // 0.1.248, Dr. Pollo: what keeps an animal well, and nothing that came off one; a golden apple for a close friend.
  "zoo veterinarian": [
    ["minecraft:apple", 2, 4, 25],
    ["minecraft:carrot", 3, 6, 20],
    ["minecraft:hay_block", 1, 2, 20],
    ["minecraft:glistering_melon_slice", 1, 2, 15],
    ["minecraft:golden_apple", 1, 1, 5, { tier: 3 }],
  ],
  // 0.1.258 (ours), Clian: what keeps things hygienic (bottles, a bucket, white towels); a sponge for a close friend.
  "sanitation specialist": [
    ["minecraft:glass_bottle", 2, 4, 25],
    ["minecraft:white_dye", 2, 4, 20],
    ["minecraft:white_wool", 1, 2, 20],
    ["minecraft:bucket", 1, 1, 15],
    ["minecraft:sponge", 1, 1, 5, { tier: 3 }],
  ],
  // Carrie: what a guide carries (light, bread, a compass); a map for a close friend.
  "community guide": [
    ["minecraft:torch", 4, 8, 25],
    ["minecraft:bread", 2, 3, 20],
    ["minecraft:lantern", 1, 1, 15],
    ["minecraft:compass", 1, 1, 10, { tier: 2 }],
    ["minecraft:empty_map", 1, 1, 5, { tier: 3 }],
  ],
  // Guido: arrows and string for the collection's bows (never a bow), and fries (a baked potato); spectral arrows for a friend.
  "bow collector": [
    ["minecraft:arrow", 4, 8, 30],
    ["minecraft:string", 2, 4, 25],
    ["minecraft:baked_potato", 2, 4, 20],
    ["minecraft:spectral_arrow", 2, 4, 10, { tier: 2 }],
  ],
};
