// How the habitat validator reads blocks (spec section 6: "allowlist relevant block categories
// through data"). The Script API has no "is solid" query, so blocks are classified by id here.
//
// Categories:
//   air        animals walk through it
//   barrier    blocks movement and can't be stood on from the ground (fences, walls, bars, panes)
//   gate_open  an open fence gate or door: a containment gap
//   water      swimmable, not usable floor for land animals
//   lava       dangerous, never traversable (Clear Lava too: see-through lava, Austin 0.1.47)
//   solid      floor or wall

export const BARRIER_PATTERNS = [
  /_fence$/, // oak_fence, nether_brick_fence ...
  /^minecraft:fence$/,
  /^zoocraft:end_fence(_top)?$/, // End Fence (0.1.56): a block and a half high, both halves
  /_wall$/, // cobblestone_wall ... (wall_sign / wall_torch don't end in _wall)
  /^minecraft:cobblestone_wall$/,
  /^minecraft:border_block$/,
  /^minecraft:barrier$/,
  /^zoocraft:scent_post$/, // a thin post (0.1.75): walked round, never stood on, so its top is no lion's ledge
  /iron_bars$/,
  /glass_pane$/,
  /_bars$/,
];

export const GATE_PATTERNS = [/fence_gate$/, /_door$/, /^minecraft:wooden_door$/, /^minecraft:iron_door$/, /^zoocraft:keeper_gate(_top)?$/];

// Blocks without a collision box worth standing on: plants, torches, signs, carpets (thin).
export const PASSABLE_PATTERNS = [
  /^zoocraft:ember_den$/, // no collision: a fox trots in and curls up, so its cell is still floor
  /^zoocraft:rift_tunnel$/, // no collision: a Rift Ferret trots in and hides, so its cell is still floor
  /^zoocraft:burrow_shelter$/, // no collision: a hedgehog trots in and sleeps, so its cell is still floor
  /^zoocraft:flamingo_nest$/, // no collision: a flamingo stands on its mud nest and sits on the egg, so its cell is still floor (and a nest site)
  /^minecraft:(short_grass|tall_grass|fern|large_fern|deadbush|dead_bush|short_dry_grass|tall_dry_grass|bush|leaf_litter|wildflowers|firefly_bush)$/,
  /^minecraft:(dandelion|poppy|blue_orchid|allium|azure_bluet|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|pink_petals|sunflower|lilac|rose_bush|peony|pitcher_plant|open_eyeblossom|closed_eyeblossom|cactus_flower)$/,
  /_tulip$/,
  /_sapling$/,
  /torch$/,
  /_sign$/,
  /^minecraft:(standing_sign|wall_sign)$/,
  /_banner$/,
  /_button$/,
  /^minecraft:lever$/,
  /rail$/,
  /_carpet$/,
  /^minecraft:carpet$/,
  /pressure_plate$/,
  /^minecraft:(vine|glow_lichen|sculk_vein|cave_vines|cave_vines_body_with_berries|cave_vines_head_with_berries|weeping_vines|twisting_vines|hanging_roots|spore_blossom)$/,
  /^minecraft:(red_mushroom|brown_mushroom|crimson_fungus|warped_fungus|crimson_roots|warped_roots|nether_sprouts)$/,
  /^minecraft:(snow_layer|redstone_wire|tripwire|string|web|sweet_berry_bush|sugar_cane|reeds)$/,
  /^minecraft:(wheat|carrots|potatoes|beetroot|melon_stem|pumpkin_stem|torchflower_crop|pitcher_crop)$/,
  /^minecraft:(seagrass|kelp|kelp_plant|tall_seagrass|light_block|structure_void)$/,
  /^minecraft:light_block_\d+$/,
  /^zoocraft:park_entrance_gate$/, // the threshold under the entrance arch: guests walk over it
];

// Tree leaves (natural or placed). Only readers that ask for them (exhibit measuring, for deer cover)
// get a separate "leaves" category; everyone else sees them as solid.
export const LEAF_PATTERNS = [/_leaves$/, /^minecraft:(leaves|leaves2|azalea_leaves|azalea_leaves_flowered)$/];

// Mud (vanilla, made with a water bottle on dirt): readers that ask for it (exhibit measuring, for
// elephants' mud wallow and flamingos' nest sites) get a separate "mud" category; everyone else sees it as solid.
export const MUD_PATTERNS = [/^minecraft:mud$/];

// Grass blocks (vanilla; Bedrock's old id for the block was minecraft:grass): grazers (zebras, 0.1.74)
// graze them. Readers that ask for them (exhibit measuring, for grazers) get a separate "grass"
// category; everyone else sees them as solid. Grass plants on top are passable, as before.
export const GRASS_PATTERNS = [/^minecraft:(grass_block|grass)$/];

// Magma blocks (vanilla; Bedrock calls the block minecraft:magma): basking pads for Basalt Tortoises.
// Readers that ask for them get a separate "hot" category; everyone else sees them as solid.
export const HOT_PATTERNS = [/^minecraft:magma$/, /^minecraft:magma_block$/];

// Warm Ash (zoocraft, 0.1.45): the Ember Fox's ash bed. Readers that ask for it get "ash".
export const ASH_PATTERNS = [/^zoocraft:warm_ash$/];

// End stone (vanilla): the Chorus Deer's End ground (spec 5.4 "End ground | vanilla end stone").
// Readers that ask for it get a separate "end" category; everyone else sees it as solid.
export const END_PATTERNS = [/^minecraft:end_stone$/];

// Void Perch (zoocraft, 0.1.51): the floating ledge Void Rays rest on. Readers that ask for it get
// "perch" (flight measuring links perches by the air above them); everyone else sees it as solid.
export const PERCH_PATTERNS = [/^zoocraft:void_perch$/];

// Climbing (raccoons, 0.1.71): readers that ask for it (the climb measure, exhibits/geometry.js
// floodClimb) get "log" for tree trunks (logs, wood, stems and hyphae: a column of three or more is a
// climbing tree), "glass" for glass blocks and "pane" for glass panes, which give a climber nothing to
// grip. The invisible barrier and border blocks are as smooth as glass. Everyone else sees logs and
// glass as solid and panes as barriers.
export const LOG_PATTERNS = [/_log$/, /_wood$/, /_stem$/, /_hyphae$/];
export const GLASS_PATTERNS = [/glass$/, /^minecraft:(barrier|border_block)$/];
export const PANE_PATTERNS = [/glass_pane$/];
// The Climbing Frame (0.1.71): "frame" for climb readers, so a raccoon knows it from a wall.
export const FRAME_PATTERNS = [/^zoocraft:climbing_frame$/];

// Clear Lava, still or flowing (zoocraft:clear_lava, zoocraft:clear_lava_flowing_1 to 7).
const CLEAR_LAVA = /^zoocraft:clear_lava(_flowing_[1-7])?$/;

export function classifyBlock(typeId, { isAir, isLiquid, open, leaves = false, mud = false, hot = false, ash = false, end = false, perch = false, climb = false, grass = false }) {
  if (isAir) return "air";
  if (typeId === "minecraft:lava" || typeId === "minecraft:flowing_lava" || CLEAR_LAVA.test(typeId)) return "lava";
  if (isLiquid || typeId === "minecraft:water" || typeId === "minecraft:flowing_water") return "water";
  if (GATE_PATTERNS.some((r) => r.test(typeId))) return open ? "gate_open" : "barrier";
  if (climb && PANE_PATTERNS.some((r) => r.test(typeId))) return "pane";
  if (climb && GLASS_PATTERNS.some((r) => r.test(typeId))) return "glass";
  if (BARRIER_PATTERNS.some((r) => r.test(typeId))) return "barrier";
  if (PASSABLE_PATTERNS.some((r) => r.test(typeId))) return "air";
  if (leaves && LEAF_PATTERNS.some((r) => r.test(typeId))) return "leaves";
  if (climb && LOG_PATTERNS.some((r) => r.test(typeId))) return "log";
  if (climb && FRAME_PATTERNS.some((r) => r.test(typeId))) return "frame";
  if (mud && MUD_PATTERNS.some((r) => r.test(typeId))) return "mud";
  if (grass && GRASS_PATTERNS.some((r) => r.test(typeId))) return "grass";
  if (hot && HOT_PATTERNS.some((r) => r.test(typeId))) return "hot";
  if (ash && ASH_PATTERNS.some((r) => r.test(typeId))) return "ash";
  if (end && END_PATTERNS.some((r) => r.test(typeId))) return "end";
  if (perch && PERCH_PATTERNS.some((r) => r.test(typeId))) return "perch";
  return "solid";
}

// Sightlines (Viewing Points, spec section 12): guests see through glass, water and Clear Lava (so a glass
// tunnel through a pool works), over fences, bars and walls (all lower than eye height or
// see-through), past coral fans and sea pickles, and past small zoo fixtures. Anything else solid,
// leaves included, hides what's behind it.
export const VIEW_THROUGH_PATTERNS = [/glass$/, /^zoocraft:clear_lava(_flowing_[1-7])?$/, /coral_fan$/, /coral_wall_fan$/, /^minecraft:(tube|brain|bubble|fire|horn|dead_tube|dead_brain|dead_bubble|dead_fire|dead_horn)_coral$/, /^minecraft:(sea_pickle|conduit|bubble_column)$/, /^zoocraft:(water_trough|lava_trough|hanging_food_basket|viewing_point|keeper_gate|keeper_gate_top|snack_stand|snack_stand_part|bench|bench_part|litter_bin|donation_box|elevated_feeder|void_perch|puzzle_feeder|climbing_frame|flock_mirror|hay_rack)$/];

export function blocksView(typeId, { isAir, isLiquid }) {
  if (isAir || isLiquid) return false;
  if (VIEW_THROUGH_PATTERNS.some((r) => r.test(typeId))) return false;
  const kind = classifyBlock(typeId, { isAir, isLiquid, open: false });
  return kind === "solid" || kind === "lava";
}

// Guest paths (spec section 12; item list: "vanilla dirt path, gravel, bricks; allowlisted in data").
// Boardwalk planks and paving count too, and any slab or stairs.
export const PATH_PATTERNS = [
  /^minecraft:(grass_path|dirt_path|gravel|smooth_stone|cobblestone|mossy_cobblestone|packed_mud|brick_block|bricks)$/,
  /_bricks$/, // stone_bricks, mud_bricks, deepslate_bricks ...
  /_tiles$/, // deepslate_tiles ...
  /^minecraft:polished_[a-z_]+$/,
  /_concrete$/,
  /_planks$/,
  /_slab$/,
  /_stairs$/,
];
// Matched above, but not something to walk along.
const NOT_PATH = [/_wall$/, /^minecraft:polished_[a-z_]+_(wall|button|pressure_plate)$/];

export function isPathBlock(typeId) {
  return PATH_PATTERNS.some((r) => r.test(typeId)) && !NOT_PATH.some((r) => r.test(typeId));
}
