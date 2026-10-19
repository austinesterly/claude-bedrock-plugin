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
  /^zoocraft:nest_box$/, // no collision: a red panda climbs in and curls up, so its cell is still open (floor, or beside the canopy)
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

// Thermal Mud (zoocraft, 0.1.87): the Cinder Boar's wallow. Readers that ask for it (exhibit measuring, for boars) get
// "thermal_mud"; everyone else sees it as solid.
export const THERMAL_MUD_PATTERNS = [/^zoocraft:thermal_mud$/];

// End stone (vanilla): the Chorus Deer's End ground (spec 5.4 "End ground | vanilla end stone").
// Readers that ask for it get a separate "end" category; everyone else sees it as solid.
export const END_PATTERNS = [/^minecraft:end_stone$/];

// Crimson nylium (vanilla): the Crimson Grazer's crimson ground (0.1.84, spec 5.3 "Crimson ground"). Readers that
// ask for it get a separate "nylium" category; everyone else sees it as solid.
export const NYLIUM_PATTERNS = [/^minecraft:crimson_nylium$/];
// Crimson stems and hyphae (vanilla, stripped or not): the trunk of a huge crimson fungus, which grazers rub their
// flanks on (0.1.84). Readers that ask for it get "stem"; everyone else sees it as solid (a climb reader as a log).
export const STEM_PATTERNS = [/^minecraft:(stripped_)?crimson_(stem|hyphae)$/];

// Void Perch (zoocraft, 0.1.51): the floating ledge Void Rays rest on, and the wooden Perch owls sit on (0.1.81).
// Readers that ask for it get "perch" (flight measuring links perches by the air above them); everyone else sees
// it as solid.
export const PERCH_PATTERNS = [/^zoocraft:void_perch$/, /^zoocraft:perch$/];

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
// Fences (0.1.80): "rail" for readers that ask for it (the ape measure, exhibits/geometry.js floodApe): a gorilla
// climbs a wooden or nether brick fence as a real one climbs chain-link (EAZA 2024: never chain-link). Stone walls,
// bars and the End Fence stay barriers, which it can't grip. Everyone else sees fences as barriers.
export const RAIL_PATTERNS = [/^minecraft:([a-z_]+_)?fence$/];
// Wood (0.1.87): "weak" for readers that ask for it (the boar measure, exhibits/geometry.js floodBoar): a Cinder Boar
// breaks through wooden fences, fence gates and doors, as a zombie breaks a wooden door (a shut gate or door; an open
// one is a gap to anyone). Nether brick fences, walls, bars, iron and copper doors and the Keeper Gate hold it.
// Everyone else sees them as barriers (fences, shut gates and doors) as before.
const WOODS = "oak|spruce|birch|jungle|acacia|dark_oak|mangrove|cherry|bamboo|crimson|warped|pale_oak";
export const WEAK_PATTERNS = [new RegExp(`^minecraft:((${WOODS})_)?fence$`), new RegExp(`^minecraft:((${WOODS})_)?fence_gate$`), /^minecraft:wooden_door$/, new RegExp(`^minecraft:(${WOODS})_door$`)];

// Clear Lava, still or flowing (zoocraft:clear_lava, zoocraft:clear_lava_flowing_1 to 7).
const CLEAR_LAVA = /^zoocraft:clear_lava(_flowing_[1-7])?$/;

// Crocodiles (0.1.77): readers that ask for it (the exhibit's croc measure, animals/crocRules.js measureCroc)
// get "plant" for plants standing on the floor (grass, flowers, ferns, bushes, reeds: they clutter the shore
// and hide a crocodile), "fixture" for zoo equipment standing on the floor, "sand" and "red_sand" for sand to
// nest in (the Crocodile Nest block is sand dug up), and "rough" for ground no crocodile basks on (gravel,
// cobblestone, raw stone, logs: SA DENR, "smooth concrete; grass or fine sand, not rock or wood chips").
export const PLANT_PATTERNS = [
  /^minecraft:(short_grass|tall_grass|fern|large_fern|deadbush|dead_bush|short_dry_grass|tall_dry_grass|bush|firefly_bush|sweet_berry_bush|sugar_cane|reeds|azalea|flowering_azalea)$/,
  /^minecraft:(dandelion|poppy|blue_orchid|allium|azure_bluet|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|pink_petals|sunflower|lilac|rose_bush|peony|pitcher_plant|open_eyeblossom|closed_eyeblossom|cactus_flower|wildflowers)$/,
  /_tulip$/,
  /_sapling$/,
];
export const FIXTURE_PATTERNS = [/^zoocraft:(basic_feeder|elevated_feeder|thermal_feeder|puzzle_feeder|insect_feeder|water_trough|lava_trough|hay_rack|flock_mirror|climbing_frame|scent_post|water_filter|cooling_unit|thermal_regulator|containment_anchor)$/];
export const SAND_PATTERNS = [/^minecraft:sand$/, /^minecraft:suspicious_sand$/, /^zoocraft:croc_nest$/];
export const RED_SAND_PATTERNS = [/^minecraft:red_sand$/];
// Warped Geckos (0.1.85): readers that ask for it (gecko: true; animals/gecko.js and the exhibit's wall measure) get
// "partial" for blocks that don't fill their space, which a gecko can't cling to or stand in: slabs (a double slab
// is whole), stairs, trapdoors, chests, beds, lanterns, candles, pots, heads, anvils and the like; and every zoocraft
// block but the full cubes (the Basic Feeder, the Zoo Workshop and the rest drawn as a whole block). Fences, walls,
// bars and panes are barriers already. Glass is solid to a gecko: it climbs glass.
export const PARTIAL_PATTERNS = [
  /^(?!.*double).*_slab\d?$/,
  /^minecraft:wooden_slab$/,
  /_stairs$/,
  /trapdoor$/,
  /chest$/,
  /_bed$/,
  /^minecraft:bed$/,
  /lantern$/,
  /candle$/,
  /candle_cake$/,
  /_head$/,
  /_skull$/,
  /amethyst_cluster$/,
  /_amethyst_bud$/,
  /_coral(_fan|_wall_fan)?$/,
  /_shelf$/,
  /^minecraft:(cake|flower_pot|decorated_pot|anvil|chipped_anvil|damaged_anvil|enchanting_table|brewing_stand|cauldron|hopper|lectern|grindstone|stonecutter_block|bell|campfire|soul_campfire|end_rod|lightning_rod|chain|iron_chain|scaffolding|ladder|daylight_detector|daylight_detector_inverted|composter|turtle_egg|sniffer_egg|dragon_egg|skull|pointed_dripstone|bamboo|cactus|waterlily|big_dripleaf|small_dripleaf_block|cocoa|frog_spawn|end_portal_frame|heavy_core|sculk_sensor|calibrated_sculk_sensor|sculk_shrieker|conduit|sea_pickle|azalea|flowering_azalea|unpowered_repeater|powered_repeater|unpowered_comparator|powered_comparator|piston_arm_collision|sticky_piston_arm_collision)$/,
];
// The zoocraft blocks drawn as a whole cube, which a gecko holds like stone.
export const FULL_ZOOCRAFT = /^zoocraft:(basic_feeder|cooling_unit|exhibit_controller|gift_shop|lava_filter|recovery_station|research_desk|staff_room|thermal_feeder|thermal_mud|thermal_regulator|warm_ash|water_filter|zoo_workshop)$/;
export const ROUGH_PATTERNS = [/^minecraft:(gravel|suspicious_gravel|cobblestone|mossy_cobblestone|stone|andesite|diorite|granite|tuff|deepslate|cobbled_deepslate|blackstone|basalt|calcite|dripstone_block|pointed_dripstone|coarse_dirt|rooted_dirt)$/, /_log$/, /_wood$/];

export function classifyBlock(typeId, { isAir, isLiquid, open, leaves = false, mud = false, hot = false, ash = false, end = false, perch = false, climb = false, grass = false, croc = false, ape = false, nylium = false, stem = false, gecko = false, thermalMud = false, boar = false }) {
  if (isAir) return "air";
  if (typeId === "minecraft:lava" || typeId === "minecraft:flowing_lava" || CLEAR_LAVA.test(typeId)) return "lava";
  if (isLiquid || typeId === "minecraft:water" || typeId === "minecraft:flowing_water") return "water";
  if (boar && WEAK_PATTERNS.some((r) => r.test(typeId))) return open ? "gate_open" : "weak";
  if (GATE_PATTERNS.some((r) => r.test(typeId))) return open ? "gate_open" : "barrier";
  if (croc && PLANT_PATTERNS.some((r) => r.test(typeId))) return "plant";
  if (croc && FIXTURE_PATTERNS.some((r) => r.test(typeId))) return "fixture";
  if (croc && SAND_PATTERNS.some((r) => r.test(typeId))) return "sand";
  if (croc && RED_SAND_PATTERNS.some((r) => r.test(typeId))) return "red_sand";
  if (croc && ROUGH_PATTERNS.some((r) => r.test(typeId))) return "rough";
  if (climb && PANE_PATTERNS.some((r) => r.test(typeId))) return "pane";
  if (climb && GLASS_PATTERNS.some((r) => r.test(typeId))) return "glass";
  if (ape && RAIL_PATTERNS.some((r) => r.test(typeId))) return "rail";
  if (BARRIER_PATTERNS.some((r) => r.test(typeId))) return "barrier";
  if (PASSABLE_PATTERNS.some((r) => r.test(typeId))) return "air";
  if (gecko && (PARTIAL_PATTERNS.some((r) => r.test(typeId)) || (typeId.startsWith("zoocraft:") && !FULL_ZOOCRAFT.test(typeId)))) return "partial";
  if (leaves && LEAF_PATTERNS.some((r) => r.test(typeId))) return "leaves";
  if (stem && STEM_PATTERNS.some((r) => r.test(typeId))) return "stem";
  if (climb && LOG_PATTERNS.some((r) => r.test(typeId))) return "log";
  if (climb && FRAME_PATTERNS.some((r) => r.test(typeId))) return "frame";
  if (mud && MUD_PATTERNS.some((r) => r.test(typeId))) return "mud";
  if (grass && GRASS_PATTERNS.some((r) => r.test(typeId))) return "grass";
  if (hot && HOT_PATTERNS.some((r) => r.test(typeId))) return "hot";
  if (ash && ASH_PATTERNS.some((r) => r.test(typeId))) return "ash";
  if (thermalMud && THERMAL_MUD_PATTERNS.some((r) => r.test(typeId))) return "thermal_mud";
  if (end && END_PATTERNS.some((r) => r.test(typeId))) return "end";
  if (nylium && NYLIUM_PATTERNS.some((r) => r.test(typeId))) return "nylium";
  if (perch && PERCH_PATTERNS.some((r) => r.test(typeId))) return "perch";
  return "solid";
}

// Sightlines (Viewing Points, spec section 12): guests see through glass, water and Clear Lava (so a glass
// tunnel through a pool works), over fences, bars and walls (all lower than eye height or
// see-through), past coral fans and sea pickles, and past small zoo fixtures. Anything else solid,
// leaves included, hides what's behind it.
export const VIEW_THROUGH_PATTERNS = [/glass$/, /^zoocraft:clear_lava(_flowing_[1-7])?$/, /coral_fan$/, /coral_wall_fan$/, /^minecraft:(tube|brain|bubble|fire|horn|dead_tube|dead_brain|dead_bubble|dead_fire|dead_horn)_coral$/, /^minecraft:(sea_pickle|conduit|bubble_column)$/, /^zoocraft:(water_trough|lava_trough|hanging_food_basket|viewing_point|keeper_gate|keeper_gate_top|snack_stand|snack_stand_part|bench|bench_part|litter_bin|donation_box|elevated_feeder|void_perch|perch|puzzle_feeder|climbing_frame|flock_mirror|hay_rack|insect_feeder)$/];

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
