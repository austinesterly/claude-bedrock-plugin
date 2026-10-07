# Features, biomes, jigsaw, structures, dimensions

Generated 2026-10-06 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/features, biome, client_biome, jigsaw, structure, dimension, world). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (70)

`minecraft:aggregate_feature`, `minecraft:ambient_sounds`, `minecraft:atmosphere_identifier`, `minecraft:beards_and_shavers`, `minecraft:biome_music`, `minecraft:capped`, `minecraft:cave_carver_feature`, `minecraft:climate`, `minecraft:color_grading_identifier`, `minecraft:conditional_list`, `minecraft:creature_spawn_probability`, `minecraft:cubemap_identifier`, `minecraft:dry_foliage_color`, `minecraft:fog_appearance`, `minecraft:foliage_appearance`, `minecraft:fossil_feature`, `minecraft:frozen_ocean`, `minecraft:geode_feature`, `minecraft:grass_appearance`, `minecraft:growing_plant_feature`, `minecraft:height_difference_filter_feature`, `minecraft:horizontal_tree_decoration_feature`, `minecraft:humidity`, `minecraft:jigsaw_structure_metadata`, `minecraft:lighting_identifier`, `minecraft:map_tints`, `minecraft:mesa`, `minecraft:mountain_parameters`, `minecraft:multi_block_feature`, `minecraft:multiface_feature`, `minecraft:multinoise_generation_rules`, `minecraft:multipart_block_column_feature`, `minecraft:nether_cave_carver_feature`, `minecraft:noise_gradient`, `minecraft:ore_feature`, `minecraft:overworld`, `minecraft:overworld_generation_rules`, `minecraft:overworld_height`, `minecraft:partially_exposed_blob_feature`, `minecraft:partially_frozen`, `minecraft:poi_block`, `minecraft:poi_description`, `minecraft:poi_tag`, `minecraft:poi_tag_description`, `minecraft:precipitation`, `minecraft:rect_layout`, `minecraft:replace_biomes`, `minecraft:scan_surface`, `minecraft:scatter_feature`, `minecraft:sculk_patch_feature`, `minecraft:search_feature`, `minecraft:sequence_feature`, `minecraft:single_block_feature`, `minecraft:sky_color`, `minecraft:snap_to_surface_feature`, `minecraft:structure_template_feature`, `minecraft:subsurface_builder`, `minecraft:surface_builder`, `minecraft:surface_material_adjustments`, `minecraft:surface_relative_threshold_feature`, `minecraft:swamp`, `minecraft:tags`, `minecraft:the_end`, `minecraft:tree_feature`, `minecraft:underwater_cave_carver_feature`, `minecraft:vegetation_patch_feature`, `minecraft:village_type`, `minecraft:water_appearance`, `minecraft:water_identifier`, `minecraft:weighted_random_feature`

### minecraft:aggregate_feature

_since 1.20.30_

Places a collection of features in an arbitrary order. All features in the collection use the same input position. Features should not depend on each other, as there is no guarantee in which order the features will be placed. Succeeds if at least one feature is placed successfully. Fails if all features fail to be placed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `features` | stringArray |  | **required**. Collection of features to be placed one by one. No guarantee of order. All features use the same input position. |
| `format_version` | string |  | Format Version |

Example (Scattering multiple different plants around a monument):
```json
{
 "format_version": "1.13.0",
 "minecraft:aggregate_feature": {
  "description": {
   "identifier": "example:monument_with_flowers_feature"
  },
  "features": [
   "example:monument_feature",
   "example:scatter_white_flowers_feature",
   "example:scatter_yellow_flower_feature"
  ]
 }
}
```

### minecraft:ambient_sounds

_since 1.21.50_

Sets the ambient sounds for the biome. These sounds must be in the 'individual_named_sounds' in a 'sounds.json' file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `addition` | string | `""` | Named sound that occasionally plays at the listener position |
| `loop` | string | `""` | Named sound that loops while the listener position is inside the biome |
| `mood` | string | `""` | Named sound that rarely plays at a nearby air block position when the light level is low. Biomes without an ambient mood sound will use the 'ambient.cave' sound. |

### minecraft:atmosphere_identifier

Set the identifier used for atmospherics in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Atmospheric Scattering JSON schemas under the "atmospherics" directory. Biomes without this component will have default atmosphere settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `atmosphere_identifier` | string |  | **required**. Identifier of atmosphere definition to use |

### minecraft:beards_and_shavers

Carves or fills terrain within a defined bounding box during world generation. 'Beard' operations add blocks below structures to connect them to ground, while 'shaver' operations remove blocks above to create clearance. Used for natural integration of structures like villages into varied terrain.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `bounding_box_min` | stringArray |  | **required**. Dimensions of the Bounding Box |
| `bounding_box_max` | stringArray |  | **required**. Dimensions of the Bounding Box |
| `format_version` | string |  | Format Version |

### minecraft:biome_music

_since 1.21.50_

Affects how music plays within the biome

| Field | Type | Default | Notes |
|---|---|---|---|
| `music_definition` | string |  | Music to be played when inside this biome. If left off or not found the default music will be determined by the dimension. Empty string will result in no music. |
| `volume_multiplier` | float |  | since 1.21.50. Multiplier gradually applied to music volume when the audio listener is inside this biome. Must be between 0 and 1, inclusive. |

### minecraft:capped

Generates surface on blocks with non-solid blocks above or below.

| Field | Type | Default | Notes |
|---|---|---|---|
| `beach_material` | string |  | Material used to decorate surface near sea level. |
| `ceiling_materials` | string |  | **required**. Materials used for the surface ceiling. |
| `floor_materials` | string |  | **required**. Materials used for the surface floor. |
| `foundation_material` | string |  | **required**. Material used to replace solid blocks that are not surface blocks. |
| `sea_material` | string |  | **required**. Material used to replace air blocks below sea level. |
| `type` | stringEnum | `"minecraft:capped"` | **required**. Controls the type of surface builder to use Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:cave_carver_feature

_since 1.20.30_

Carves a cave through the world in the current chunk, and in every chunk around the current chunk in an 8 radial pattern. This feature only works when placed in the pass "pregeneration_pass".

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `width_modifier` | molang |  | How many blocks to increase the cave radius by, from the center point of the cave. |
| `skip_carve_chance` | int |  | The chance to skip doing the carve (1 / value). |
| `height_limit` | int |  | The height limit where we attempt to carve. |
| `format_version` | string |  | Format Version |

Example (Carve caves normally.):
```json
{
 "format_version": "1.13.0",
 "minecraft:cave_carver_feature": {
  "description": {
   "identifier": "example:underground_cave_carver_feature"
  },
  "fill_with": "minecraft:air",
  "width_modifier": 0,
  "skip_carve_chance": 15
 }
}
```

### minecraft:climate

Describes temperature, humidity, precipitation, and similar climate properties for a biome. Biomes without this component will use default values. Temperature affects visual effects like snow/ice placement, sponge drying, and sky color. Downfall controls precipitation frequency and intensity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `downfall` | float |  | Amount that precipitation affects colors and block changes. Setting to 0 will stop rain from falling in the biome. |
| `snow_accumulation` | numberArray |  | Minimum and maximum snow level, each multiple of 0.125 is another snow layer |
| `temperature` | float |  | Temperature affects a variety of visual and behavioral things, including snow and ice placement, sponge drying, and sky color |

### minecraft:color_grading_identifier

Set the identifier used for color grading in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Color Grading JSON schemas under the "color_grading" directory. Biomes without this component will have default color_grading settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_grading_identifier` | string |  | **required**. Identifier of color_grading definition to use |

### minecraft:conditional_list

Evaluates conditions and places features from the first matching entry. Each entry has a condition expression and associated feature—when the condition passes, that feature generates and later entries are skipped. Enables biome-dependent variants or terrain-responsive structure selection during world generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `conditional_features` | objectArray |  |  |
| `early_out_scheme"<"condition_success", "placement_success", "none"` | string |  | Denote whether placement should end on first successful placement ('placement_success'), first passed condition ('condition_success'), or evaluate all features ('none'). Defaults to 'none'. |
| `format_version` | string |  | Format Version |

### minecraft:creature_spawn_probability

Probability that creatures will spawn within the biome when a chunk is generated.

| Field | Type | Default | Notes |
|---|---|---|---|
| `probability` | float |  | Probability between [0.0, 0.75] of creatures spawning within the biome on chunk generation. |

### minecraft:cubemap_identifier

_since 1.21.130_

Set the identifier used for cubemap in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Cubemap JSON schemas under the "cubemaps" directory. Biomes without this component will have default cubemap settings.

> Added in 1.21.130 to apply a custom cubemap (defined in the resource pack's `cubemaps/` directory) for Vibrant Visuals skybox lighting on a client biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `cubemap_identifier` | string |  | **required**. Identifier of cubemap definition to use |

### minecraft:dry_foliage_color

Set the dry foliage color used during rendering. Biomes without this component will have default dry foliage color behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | string |  | **required**. RGB color of dry foliage |

### minecraft:fog_appearance

Sets the fog settings used during rendering. Biomes without this component will have default fog settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `fog_identifier` | string |  | **required**. Identifier of fog definition to use |

### minecraft:foliage_appearance

Sets the foliage color or color map used during rendering. Biomes without this component will have default foliage appearance.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | object |  | RGB color of foliage, or a Foliage Color Map object. |

### minecraft:fossil_feature

_since 1.20.30_

Generates a skeletal structure composed of bone blocks and parametric ore blocks. Succeeds if the fossil is placed. Fails if the fossil is not placed because it overlaps with another structure or because its bounding box has too many corners occupied by air or fluid.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `max_empty_corners` | int |  | **required**. Max Empty Corners |
| `format_version` | string |  | Format Version |

Example (Fossil composed of bone blocks and coal ore blocks.):
```json
{
 "format_version": "1.13.0",
 "minecraft:fossil_feature": {
  "description": {
   "identifier": "example:fossil_feature"
  },
  "ore_block": "minecraft:coal_ore",
  "max_empty_corners": 4
 }
}
```

### minecraft:frozen_ocean

Similar to overworld_surface. Adds icebergs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` | string |  | **required**. Controls the block type used deep underground in this biome. |
| `mid_material` | string |  | **required**. Controls the block type used in a layer below the surface of this biome. |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur. |
| `sea_floor_material` | string |  | **required**. Controls the block type used as a floor for bodies of water in this biome. |
| `sea_material` | string |  | **required**. Controls the block type used for the bodies of water in this biome. |
| `top_material` | string |  | **required**. Controls the block type used for the surface of this biome. |
| `type` | stringEnum | `"minecraft:frozen_ocean"` | **required**. Controls the type of surface builder to use. Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:geode_feature

_since 1.20.30_

generates a rock formation to simulate a geode. Each layer of, and block within, the geode can be replaced. Succeeds if at least one block within the geode is placed. Fails if all blocks within the geode fail to be placed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `inner_placements` | stringArray |  | Inner Placements |
| `min_outer_wall_distance` | int |  | **required**. The minimum distance each distribution point must be from the outer wall. [0,10] |
| `max_outer_wall_distance` | int |  | **required**. The maximum distance each distribution point can be from the outer wall. [0,20] |
| `min_distribution_points` | int |  | **required**. The minimum number of points inside the distance field that can get generated. The distance field is the area consisting of all points with a minimum distance to all destribution points. [0,10] |
| `max_distribution_points` | int |  | **required**. The maximum number of points inside the distance field that can get generated. The distance field is the area consisting of all points with a minimum distance to all destribution points. [0,20] |
| `min_point_offset` | int |  | **required**. The lowest possible value of random offset applied to the position of each distribution point. [0,10] |
| `max_point_offset` | int |  | **required**. The highest possible value of random offset applied to the position of each distribution point. [0,10] |
| `max_radius` | int |  | **required**. The maximum possible radius of the geode generated. |
| `crack_point_offset` | int |  | **required**. An offset applied to each distribution point that forms the geode crack opening. [0,10] |
| `placements_require_layer0_alternate` | boolean |  | **required**. If true, the potential placement block will only be placed on the alternate layer0 blocks that get placed. Potential placement blocks are blocks that depend on the existance of another block to be placed. The latter are the layer0 alternate blocks. |
| `invalid_blocks_threshold` | int |  | **required**. The threshold of invalid blocks for a geode to have a distribution point in before it aborts generation entirely. |
| `format_version` | string |  | Format Version |

Example (Diamond geodes with emerald blocks inside and obsidian on the outside.):
```json
{
 "format_version": "1.13.0",
 "minecraft:geode_feature": {
  "description": {
   "identifier": "minecraft:diamond_geode_feature"
  },
  "filler": "minecraft:air",
  "inner_layer": "minecraft:diamond_block",
  "alternate_inner_layer": "minecraft:emerald_block",
  "middle_layer": "minecraft:calcite",
  "outer_layer": "minecraft:obsidian",
  "inner_placements": [
   {
    "name": "minecraft:amethyst_cluster",
    "states": {
     "amethyst_cluster_type": "small"
    }
   }
  ],
  "min_outer_wall_distance": 4,
  "max_outer_wall_distance": 7,
  "min_distribution_points": 3,
  "max_distribution_points": 5,
  "min_point_offset": 1,
  "max_point_offset": 3,
  "max_radius": 16,
  "crack_point_offset": 2,
  "generate_crack_chance": 0.95,
  "base_crack_size": 2,
  "noise_multiplier": 0.025,
  "use_potential_placements_chance": 0.35,
  "use_alternate_layer0_chance": 0.083,
  "placements_require_layer0_alternate": true,
  "invalid_blocks_threshold": 1
 }
}
```

### minecraft:grass_appearance

Set the grass color or color map used during rendering. Biomes without this component will have default grass appearance.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | object |  | RGB color of grass. |

### minecraft:growing_plant_feature

_since 1.20.30_

Places a growing plant in the world. A growing plant is a column that is anchored either to the ceiling or the floor, based on its growth direction. The growing plant has a body and a head, where the head is the tip of the plant, and the body consists of the remaining blocks. This feature can be used to define growing plants with variable body and head blocks, e.g. Cave Vines.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `height_distribution` | stringArray |  | **required**. Height Distribution |
| `growth_direction` | string |  | **required**. Direction that the plant grows towards. Valid values: UP and DOWN |
| `body_blocks` | stringArray |  | **required**. Body Blocks |
| `head_blocks` | stringArray |  | **required**. Head Blocks |
| `allow_water` | boolean |  | Plant blocks can be placed in water. |
| `format_version` | string |  | Format Version |

Example (Defining a growing plant feature with variable body and head blocks and height distribution):
```json
{
 "format_version": "1.13.0",
 "minecraft:growing_plant_feature": {
  "description": {
   "identifier": "example:cave_vine_feature"
  },
  "height_distribution": [
   [
    {
     "range_min": 1,
     "range_max": 13
    },
    2
   ],
   [
    {
     "range_min": 1,
     "range_max": 2
    },
    3
   ],
   [
    {
     "range_min": 1,
     "range_max": 7
    },
    10
   ]
  ],
  "growth_direction": "DOWN",
  "age": {
   "range_min": 17,
   "range_max": 26
  },
  "body_blocks": [
   [
    "minecraft:cave_vines",
    4
   ],
   [
    "minecraft:cave_vines_body_with_berries",
    1
   ]
  ],
  "head_blocks": [
   [
    "minecraft:cave_vines",
    4
   ],
   [
    "minecraft:cave_vines_head_with_berries",
    1
   ]
  ],
  "allow_water": true
 }
}
```

### minecraft:height_difference_filter_feature

_since 1.26.30_

> Introduced in 1.26.30. Conditionally places a referenced `places_feature` based on the upward and downward height differences (relative to the placement position) found within `search_radius` in each cardinal direction. Useful for placing features that only make sense on terrain with a specific shape (cliffs, gentle slopes, flat plateaus).

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `min_required_upward_height_diff` | int |  | Specifies the minimum height difference required upwards. |
| `min_required_downward_height_diff` | int |  | Specifies the minimum height difference required downwards. |
| `max_allowed_upward_height_diff` | int |  | Specifies the maximum height difference allowed upwards. |
| `max_allowed_downward_height_diff` | int |  | Specifies the maximum height difference allowed downwards. |
| `search_radius` | int |  | **required**. 'search_radius' specifies the the length in each cardinal direction the filter will check for blocks against the given differences. |

### minecraft:horizontal_tree_decoration_feature

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `allow_adjacent` | boolean |  | Whether neighbors of the same block type are allowed. Will result in blocks being placed with at least one block gap when set to false |
| `bark_side_only` | boolean |  | If true, will never place the block on the 'open' side of a block (imagine the block is a fallen tree trunk). |

### minecraft:humidity

Forces a biome to ether always be humid or never humid. Humidity effects the spread chance, and spread rate of fire in the biome

| Field | Type | Default | Notes |
|---|---|---|---|
| `is_humid` | boolean |  | **required**. Is Humid |

### minecraft:jigsaw_structure_metadata

Defines the format version and jigsaw metadata registry.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. Format version of the contained metadata registry. |
| `minecraft:jigsaw_structure_metadata` | object |  | **required**. The Jigsaw metadata registry. See `structure/jigsaw_structure_metadata_registry`. |

### minecraft:lighting_identifier

Set the identifier used for lighting in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Lighting JSON schemas under the "lighting" directory. Biomes without this component will have default lighting settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `lighting_identifier` | string |  | **required**. Identifier of lighting definition to use |

### minecraft:map_tints

Sets the color grass and foliage will be tinted by in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foliage` | string |  | Sets the color foliage will be tinted by in this biome on the map. |
| `grass` | object |  | **required**. Controls whether the grass will use a custom tint color or a noise based tint color. |

### minecraft:mesa

Similar to overworld_surface. Adds colored strata and optional pillars.

| Field | Type | Default | Notes |
|---|---|---|---|
| `bryce_pillars` | boolean |  | **required**. Whether the mesa generates with pillars |
| `clay_material` | string |  | **required**. Base clay block to use |
| `foundation_material` | string |  | **required**. Controls the block type used deep underground in this biome. |
| `hard_clay_material` | string |  | **required**. Hardened clay block to use |
| `has_forest` | boolean |  | **required**. Places coarse dirt and grass at high altitudes |
| `mid_material` | string |  | **required**. Controls the block type used in a layer below the surface of this biome. |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur. |
| `sea_floor_material` | string |  | **required**. Controls the block type used as a floor for bodies of water in this biome. |
| `sea_material` | string |  | **required**. Controls the block type used for the bodies of water in this biome. |
| `top_material` | string |  | **required**. Controls the block type used for the surface of this biome. |
| `type` | stringEnum | `"minecraft:mesa"` | **required**. Controls the type of surface builder to use. Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:mountain_parameters

Noise parameters used to drive mountain terrain generation in Overworld.

| Field | Type | Default | Notes |
|---|---|---|---|
| `steep_material_adjustment` | object |  | Defines surface material for steep slopes |
| `top_slide` | object |  | Controls the density tapering that happens at the top of the world to prevent terrain from reaching too high |

### minecraft:multi_block_feature

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `enforce_placement_rules` | boolean |  | If true, enforce the multi-blocks mayPlace checks. |
| `randomize_rotation` | boolean |  | If true, randomizes the block's cardinal orientation. |
| `may_replace` | stringArray |  | May Replace |

### minecraft:multiface_feature

_since 1.20.30_

Places multiface blocks on floors/walls/ceilings. Despite the name, any block can be placed by this feature. During placement, existing world blocks are checked to see if this feature can be applied to them based on the list in the can_place_on field. If no can_replace_on field is specified, the place_block block can be placed on any existing block. This feature will also try to spread the place_block block around the location the feature is placed. Succeeds if: At least one block is successfully placed. Fails if ll block placements fail.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `search_range` | int |  | **required**. How far, in blocks, this feature can search for a valid position to place. |
| `can_place_on_floor` | boolean |  | **required**. Can this feature be placed on the ground (top face of a block)? |
| `can_place_on_ceiling` | boolean |  | **required**. Can this feature be placed on the ceiling (bottom face of a block)? |
| `can_place_on_wall` | boolean |  | **required**. Can this feature be placed on the wall (side faces of a block)? |
| `can_place_on` | stringArray |  | Can Place On |
| `format_version` | string |  | Format Version |

Example (Blue vines in caves):
```json
{
 "format_version": "1.13.0",
 "minecraft:multiface_feature": {
  "description": {
   "identifier": "example:blue_vines_feature"
  },
  "places_block": "example:blue_vine",
  "search_range": 64,
  "can_place_on_floor": true,
  "can_place_on_ceiling": true,
  "can_place_on_wall": true,
  "chance_of_spreading": 0.5,
  "can_place_on": [
   "minecraft:stone"
  ]
 }
}
```

### minecraft:multinoise_generation_rules

Controls how this biome is instantiated (and then potentially modified) during world generation of the nether.

> This is a pre-Caves and Cliffs component and is unused for custom biomes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target_altitude` | float |  | Altitude with which this biome should be generated, relative to other biomes. |
| `target_humidity` | float |  | Humidity with which this biome should be generated, relative to other biomes. |
| `target_temperature` | float |  | Temperature with which this biome should be generated, relative to other biomes. |
| `target_weirdness` | float |  | Weirdness with which this biome should be generated, relative to other biomes. |
| `weight` | float |  | Weight with which this biome should be generated, relative to other biomes. |

### minecraft:multipart_block_column_feature

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `weighted_heights` | stringArray |  | Weighted Heights |
| `direction` | string |  | The direction of the column. If omitted then it will default to 'UP' |
| `may_place_on` | stringArray |  | May Place On |
| `may_replace` | stringArray |  | May Replace |

### minecraft:nether_cave_carver_feature

_since 1.20.30_

Carves a cave through the Nether in the current chunk, and in every chunk around the current chunk in an 8 radial pattern. This feature will also only work when placed specifically in the pass "pregeneration_pass".

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `width_modifier` | molang |  | How many blocks to increase the cave radius by, from the center point of the cave. |
| `skip_carve_chance` | int |  | The chance to skip doing the carve (1 / value). |
| `height_limit` | int |  | The height limit where we attempt to carve. |
| `format_version` | string |  | Format Version |

Example (Carve nether caves normally):
```json
{
 "format_version": "1.13.0",
 "minecraft:nether_cave_carver_feature": {
  "description": {
   "identifier": "example:nether_cave_carver_feature"
  },
  "fill_with": "minecraft:air",
  "width_modifier": 0
 }
}
```

### minecraft:noise_gradient

Places continuous bands of blocks according to a noise distribution. This surface builder's processing has been implemented with sub-terrain height ranges in mind.

> In format version 1.26.30, the noise distribution returned by `noise_descriptor` is clamped to the interval [-1, 1] before being matched against `noise_block_specifiers`. Authors that previously relied on out-of-range noise values may see different block placement after upgrading.

| Field | Type | Default | Notes |
|---|---|---|---|
| `noise_block_specifiers` | objectArray |  | **required**. The noise block specifiers defining which ranges of noise are associated with which blocks. The ranges provided are valid on the interval [-1, 1], and may overlap at their endpoints. See `biome/noiseblockspecifier`. |
| `noise_descriptor` | object |  | **required**. The Specification for the Noise used by the surface builder. See `biome/noisedescriptor`. |
| `non_replaceable_blocks` | string |  | A list of blocks that the surface builder is not allowed to replace. Leaving this list empty or unspecified will allow the replacement of any (non-air) block type. |
| `type` | stringEnum | `"minecraft:noise_gradient"` | **required**. Type Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:ore_feature

_since 1.20.30_

Places a vein of blocks to simulate ore deposits. Despite the name, any block can be placed by this feature. During placement, existing world blocks are checked to see if they can be replaced by the new ore block based on the list in the may_replace field of a replace_rules entry. If no may_replace field is specified, the ore block can replace any existing block. Succeeds if at least one ore block is successfully placed. Fails if all ore block placements fail.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `count` | int |  | **required**. The number of blocks to be placed. |
| `replace_rules` | objectArray |  |  |
| `format_version` | string |  | Format Version |

Example (Malachite ore in different materials):
```json
{
 "format_version": "1.13.0",
 "minecraft:ore_feature": {
  "description": {
   "identifier": "example:malachite_ore_feature"
  },
  "count": 12,
  "replace_rules": [
   {
    "places_block": "example:malachite_ore",
    "may_replace": [
     "minecraft:stone"
    ]
   },
   {
    "places_block": "example:granite_malachite_ore",
    "may_replace": [
     "minecraft:granite"
    ]
   },
   {
    "places_block": "example:andesite_malachite_ore",
    "may_replace": [
     "minecraft:andesite"
    ]
   }
  ]
 }
}
```

### minecraft:overworld

Controls the blocks used for the default Minecraft Overworld terrain generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` | string |  | **required**. Controls the block type used deep underground in this biome. |
| `mid_material` | string |  | **required**. Controls the block type used in a layer below the surface of this biome. |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur. |
| `sea_floor_material` | string |  | **required**. Controls the block type used as a floor for bodies of water in this biome. |
| `sea_material` | string |  | **required**. Controls the block type used for the bodies of water in this biome. |
| `top_material` | string |  | **required**. Controls the block type used for the surface of this biome. |
| `type` | stringEnum | `"minecraft:overworld"` | **required**. Controls the type of surface builder to use. Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:overworld_generation_rules

Controls how this biome is instantiated (and then potentially modified) during world generation of the overworld.

> This is a pre-Caves and Cliffs component and is unused for custom biomes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `generate_for_climates` | stringNumberTupleArray |  | Controls the world generation climate categories that this biome can spawn for. Each entry is an array of [climate_name, weight] where climate_name is 'medium', 'warm', 'lukewarm', 'cold', or 'frozen'. |
| `hills_transformation` | stringArray |  | An array of any size containing arrays of exactly two elements. For each contained array, the first element is a climate category string ('medium', 'warm', 'lukewarm', 'cold', or 'frozen'). The second element is a positive integer for how much that entry is w… |
| `mutate_transformation` | stringArray |  | What biome to switch to when converting to a mutated biome |
| `river_transformation` | stringArray |  | What biome to switch to when converting to a river biome (if not the Vanilla 'river' biome) |
| `shore_transformation` | stringArray |  | What biome to switch to when adjacent to an ocean biome |

### minecraft:overworld_height

Noise parameters used to drive terrain height in the Overworld.

> This is a pre-Caves and Cliffs component. It does not change overworld height, and currently only affects map item rendering

| Field | Type | Default | Notes |
|---|---|---|---|
| `noise_params` | numberArray |  | First value is depth - more negative means deeper underwater, while more positive means higher. Second value is scale, which affects how much noise changes as it moves from the surface. |
| `noise_type` | stringEnum |  | Specifies a preset based on a built-in setting rather than manually using noise_params Values: `beach`, `deep_ocean`, `default`, `default_mutated`, `extreme`, `highlands`, `less_extreme`, `lowlands`, `mountains`, `mushroom`, `ocean`, `river`, `stone_beach`, `swamp`, `taiga`. |

### minecraft:partially_exposed_blob_feature

_since 1.20.30_

Generates a blob of the specified block with the specified dimensions. For the most part, the blob is embedded in the specified surface, however a single side is allowed to be exposed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `placement_radius_around_floor` | int |  | **required**. Defines the cubic radius of the blob. [1, 8] |
| `exposed_face` | string |  | Defines a block face that is allowed to be exposed to air and/or water. Other faces need to be embedded for blocks to be placed by this feature. Defaults to upwards face. |
| `format_version` | string |  | Format Version |

Example (Blobs of Magma blocks partially embedded in the floors of flooded caves.):
```json
{
 "format_version": "1.13.0",
 "minecraft:partially_exposed_blob_feature": {
  "description": {
   "identifier": "example:underwater_magma_feature"
  },
  "places_block": "minecraft:magma",
  "placement_radius_around_floor": 1,
  "placement_probability_per_valid_position": 0.5,
  "exposed_face": "up"
 }
}
```

### minecraft:partially_frozen

Component will impact the temperature in a frozen biome, causing some areas to not be frozen. Ex: patchy ice, patchy snow

### minecraft:poi_block

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` | stringArray |  | **required**. List of blocks that represent this POI in a world. Care should be taken to select blocks that will be rare/infrequent in the world. |
| `description` | object |  | **required**. Description See `world/minecraft_poi_description`. |
| `tags` | stringArray | `[]` | List of tags for the POI. Tags are used to indicate functionality. E.g. minecraft:bee_home is used to indicate a valid block for a bee's home |
| `tickets` | int | `0` | The number of entities that can reserve a POI of this type. |
| `usable_distance` | int | `1` | Represents the general distnace that this POI should be usable from |

### minecraft:poi_description

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |

### minecraft:poi_tag

| Field | Type | Default | Notes |
|---|---|---|---|
| `children` | stringArray | `[]` | List of more specific tags that inherits all tags and meaning of this tag |
| `description` | object |  | **required**. Description See `world/minecraft_poi_tag_description`. |
| `parents` | stringArray | `[]` | List of more broad tags that this tag will inherit |

### minecraft:poi_tag_description

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |

### minecraft:precipitation

Describes the visuals for a biome's precipitation. Biomes without this component will have default values. At most one precipitation type can be set for a biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ash` | float |  | Density of ash precipitation visuals. Used in the soul sand valley biome. |
| `blue_spores` | float |  | Density of blue spore precipitation visuals. Used in the warped forest biome. |
| `red_spores` | float |  | Density of red spore precipitation visuals. Used in the crimson forest biome. |
| `white_ash` | float |  | Density of white ash precipitation visuals. Used in the basalt deltas biome. |

### minecraft:rect_layout

Arranges features in a rectangular grid pattern during world generation. Configure the grid dimensions, spacing, and which features to place at each position. Useful for orderly structures like crop fields, orchard trees, gravestones, or any repeating pattern that should fill a defined area.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `feature_areas` | objectArray |  |  |
| `format_version` | string |  | Format Version |

### minecraft:replace_biomes

Replaces a specified portion of one or more Minecraft biomes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `replacements` | objectArray |  | **required**. List of biome replacement configurations. Retroactively adding a new replacement to the front of this list will cause the world generation to change. Please add any new replacements to the end of the list. See `biome/biome_replacement`. |

### minecraft:scan_surface

Searches for valid terrain surface positions before placing features. Scans downward from the generation height to find solid ground, then places the referenced feature at appropriate surface level. Essential for features like flowers, grass, and decorations that must sit on top of terrain regardless of elevation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `format_version` | string |  | Format Version |

### minecraft:scatter_feature

_since 1.20.30_

Scatters a feature throughout a chunk. The x, y, and z fields are per-coordinate parameters. Coordinates represent an offset from the input position instead of an absolute position, and may be a single value, random distribution, or Molang expression that resolves to a numeric value. The coordinate_eval_order field is provided for finer control of coordinate resolution (particularly when using the grid distribution). iterations controls how many individual placements should occur if the scatter_chance check succeeds. The scatter_chance check happens once, so either all placements will run or none will. Succeeds if At least one feature placement succeeds. Fails if all feature placements fail

> In format version 1.21.20 and later, the `distribution` field was introduced to consolidate scatter parameters. Prior versions use x, y, z, iterations, and scatter_chance fields directly at the root level of the feature.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `project_input_to_floor` | boolean |  | If true, snaps the y-value of the scattered position to the terrain heightmap. If false or unset, y-value is unmodified. |
| `distribution` | object |  | **required**, since 1.21.20. Parameters controlling the scatter of the feature. Object of type ScatterParams |
| `format_version` | string |  | Format Version |

Example (Legacy format (pre-1.21.20) with scatter parameters at root level):
```json
{
 "format_version": "1.13.0",
 "minecraft:scatter_feature": {
  "description": {
   "identifier": "example:scatter_tall_grass_feature"
  },
  "places_feature": "example:tall_grass_feature",
  "iterations": 90,
  "x": {
   "distribution": "gaussian",
   "extent": [
    -8,
    8
   ]
  },
  "y": {
   "distribution": "gaussian",
   "extent": [
    -4,
    4
   ]
  },
  "z": {
   "distribution": "gaussian",
   "extent": [
    -8,
    8
   ]
  },
  "coordinate_eval_order": "zyx"
 }
}
```

### minecraft:sculk_patch_feature

Generates clusters of sculk blocks with veins spreading across surfaces, as found in Deep Dark biomes and Ancient Cities. Configure patch size, spread pattern, and catalyst generation. Creates the distinctive dark blue organic growth that defines sculk-infected underground areas.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `can_place_sculk_patch_on` | stringArray |  | **required**. Can Place Sculk Patch On |
| `cursor_count` | int |  | **required**. Cursor Count |
| `charge_amount` | int |  | **required**. Charge Amount |
| `spread_attempts` | int |  | **required**. Spread Attempts |
| `growth_rounds` | int |  | **required**. Growth Rounds |
| `spread_rounds` | int |  | **required**. Spread Rounds |
| `format_version` | string |  | Format Version |

### minecraft:search_feature

_since 1.20.30_

Sweeps a volume searching for a valid placement location for its referenced feature. The search_volume field specifies the axis-aligned bounding box that defines the boundaries of the search. The search sweeps along the axis defined by the search_axis field, layer by layer. For example, if search_axis is set to -x, blocks with greater x values will be checked before blocks with lower x values. Each layer is searched from the bottom-left to the top-right before moving to the next layer along the axis. By default, only one valid position must be found, but this can be altered by specifying the required_successes field. If fewer than the required successes are found, no placement will occur. Succeeds if the number of valid positions is equal to the value specified by required_successes. Fails if the number of valid positions is less than the value specified by required_successes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `search_volume` | object |  | **required**. Axis-aligned bounding box that will be searched for valid placement positions. Expressed as offsets from the input position. |
| `search_axis"<"-x", "+x", "-y", "+y", "-z", "+z"` | string |  | **required**. Axis that the search will sweep along through the 'search_volume' |
| `required_successes` | int |  | Number of valid positions the search must find in order to place the referenced feature |
| `format_version` | string |  | Format Version |

Example (Uses `distribution` field to define the scattering settings.):
```json
{
 "format_version": "1.13.0",
 "minecraft:search_feature": {
  "description": {
   "identifier": "example:find_valid_apples_feature"
  },
  "places_feature": "example:apple_feature",
  "search_volume": {
   "min": [
    -3,
    -3,
    -3
   ],
   "max": [
    3,
    3,
    3
   ]
  },
  "search_axis": "-y",
  "required_successes": 3
 }
}
```

### minecraft:sequence_feature

_since 1.20.30_

Places a collection of features sequentially, in the order they appear in data. The output position of the previous feature is used as the input position for the next. For example, a tree feature is placed at (0, 0, 0) and places blocks up to (0, 10, 0). The next feature in the sequence begins at (0, 10, 0). Succeeds if all features in the sequence are successfully placed. Fails if any feature in the sequence fails to be placed. Features that have not yet been placed at the time of failure are skipped.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `features` | stringArray |  | **required**. List of features to be placed in sequence. The output position of the previous feature is used as the input position to the next. |
| `format_version` | string |  | Format Version |

Example (Scattering fruit throughout the canopy of a tree):
```json
{
 "format_version": "1.13.0",
 "minecraft:sequence_feature": {
  "description": {
   "identifier": "example:oak_tree_then_apples_feature"
  },
  "features": [
   "example:oak_tree_feature",
   "example:scatter_apples_feature"
  ]
 }
}
```

### minecraft:single_block_feature

_since 1.20.30_

Places a single block in the world. The places_block field supports a single block or a list of weighted blocks, where the weight defines how likely it is for that block to be selected. The may_attach_to and may_replace fields are allowlists which specify where the block can be placed. If these fields are omitted, the block can be placed anywhere. The may_not_attach_to field is a denylist that specifies what blocks can't be close to the placement location. The randomize_rotation field will randomize the block's cardinal orientation. The block's internal survivability and placement rules can optionally be enforced with the enforce_survivability_rules and enforce_placement_rules fields. These rules are specified per-block and are typically designed to produce high quality gameplay or natural behavior. However, enabling this enforcement may make it harder to debug placement failures. Succeeds if the block is successfully placed in the world. Fails if the block fails to be placed. Example use: Placing a single pumpkin or carved pumpkin block where carved pumpkins are less likely to appear.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `places_block` | objectArray |  |  |
| `enforce_placement_rules` | boolean |  | **required**. If true, enforce the block's canPlace check. |
| `enforce_survivability_rules` | boolean |  | **required**. If true, enforce the block's canSurvive check. |
| `randomize_rotation` | boolean |  | If true, randomizes the block's cardinal orientation. |
| `may_attach_to` | object |  | Allowlist which specifies where the block can be placed. |
| `may_not_attach_to` | object |  | Denylist which specifies where the block can't be placed. |
| `may_replace` | stringArray |  | May Replace |
| `format_version` | string |  | Format Version |

Example (Placing a single pumpkin block):
```json
{
 "format_version": "1.21.40",
 "minecraft:single_block_feature": {
  "description": {
   "identifier": "example:single_pumpkin_feature"
  },
  "places_block": [
   {
    "block": "minecraft:pumpkin",
    "weight": 5
   },
   {
    "block": "minecraft:carved_pumpkin",
    "weight": 1
   }
  ],
  "randomize_rotation": true,
  "enforce_survivability_rules": true,
  "enforce_placement_rules": true,
  "may_attach_to": {
   "auto_rotate": false,
   "min_sides_must_attach": 1,
   "south": [
    "minecraft:grass",
    "minecraft:dirt"
   ]
  },
  "may_not_attach_to": {
   "south": {
    "name": "minecraft:dirt",
    "states": {
     "dirt_type": "coarse"
    }
   }
  }
 }
}
```

### minecraft:sky_color

Sets the sky color used during rendering. Biomes without this component will have default sky color behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sky_color` | string |  | **required**. RGB color of the sky |

### minecraft:snap_to_surface_feature

_since 1.20.30_

Snaps the y-value of a feature placement pos to the floor or the ceiling within the provided vertical_search_range. The placement biome is preserved. If the snap position goes outside of the placement biome, placement will fail.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `search_range` | int |  | **required**. Range to search for a valid snapping position for the feature. |
| `surface` | string |  | Defines the surface that the y-value of the placement position will be snapped to. Valid values: 'ceiling', 'floor', 'random_horizontal' and `wall` |
| `allow_air_placement` | boolean |  | Determines whether the feature can snap through air blocks. Defaults to true. |
| `allow_non_air_placement` | boolean |  | Determines whether the feature can snap through non air blocks. Defaults to false, is only used if the snap is started in a block that is not water or air. |
| `allow_underwater_placement` | boolean |  | Determines whether the feature can snap through water blocks. Defaults to false. |
| `allowed_surface_blocks` | stringArray |  | A list of blocks that the feature is permitted to snap to. Leaving this empty results in the feature snapping to blocks that can provide support for the given face (up/down/horizontal) |
| `embed_in_surface` | boolean | `false` | since 1.26.20. If true, the snapped feature is embedded into the located surface block instead of being placed on top of it. |
| `format_version` | string |  | Format Version |

Example (Scattering multiple different plants around a monument):
```json
{
 "format_version": "1.13.0",
 "minecraft:snap_to_surface_feature": {
  "description": {
   "identifier": "example:cave_vine_snapped_to_ceiling_feature"
  },
  "feature_to_snap": "example:cave_vine_feature",
  "vertical_search_range": 12,
  "surface": "ceiling",
  "allowed_surface_blocks": {
   "name": "minecraft:cobblestone"
  }
 }
}
```

### minecraft:structure_template_feature

_since 1.20.30_

Places a structure in the world. The structure must be stored as a .mcstructure file in the `structures` subdirectory of a behavior pack. It is possible to reference structures that are part of other behavior packs, they do not need to come from the same behavior pack as this feature. Constraints can be defined to specify where the structure is allowed to be placed. During placement, the feature will search for a position within the adjustment_radius that satisfies all constraints. If none are found, the structure will not be placed. Succeeds if the structure is placed in the world. Fails if the structure fails to be placed within the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `adjustment_radius` | int |  | How far the structure is allowed to move when searching for a valid placement position. Search is radial, stopping when the nearest valid position is found. Defaults to 0 if omitted. |
| `facing_direction"<"north", "south", "east", "west", "random"` | string |  | Direction the structure will face when placed in the world. Defaults to "random" if omitted. |
| `rotate_around_center` | boolean | `false` | since 1.26.20. If true, the structure is centered on the placement position before rotation is applied so it rotates around its center rather than its origin corner. |
| `ground_level` | int |  | Specifies which Y coordinate of the structure is considered its ground level. This value determines which layer of the structure is checked by the "grounded" and "leveled" constraints and is used as a downward vertical offset during placement. If the value ex… |
| `constraints` | object |  | **required**. Specific constraints that must be satisfied when placing this structure. |
| `format_version` | string |  | Format Version |

Example (Scattering multiple different plants around a monument):
```json
{
 "format_version": "1.13.0",
 "minecraft:aggregate_feature": {
  "format_version": "1.13.0",
  "minecraft:structure_template_feature": {
   "description": {
    "identifier": "example:hot_air_balloon_feature"
   },
   "structure_name": "example:hot_air_balloon",
   "adjustment_radius": 8,
   "facing_direction": "random",
   "constraints": {
    "unburied": {},
    "block_intersection": {
     "block_allowlist": [
      "minecraft:air"
     ]
    }
   }
  }
 }
}
```

### minecraft:subsurface_builder

_since 1.26.30_

Sub Surface Builders allow specifying a `minecraft:surface_builder` to be applied to biomes located underneath regular terrain surface. Note, however, that pre-existing surface builder types' processing have not been updated to accommodate the ability to specify them for sub-terrain height ranges, which may lead to unexpected results when using them.

| Field | Type | Default | Notes |
|---|---|---|---|
| `builder` | object |  | **required**. Controls block types and strategy used for terrain generation. |

### minecraft:surface_builder

_since 1.26.30_

Controls materials used for terrain generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `builder` | object |  | **required**. Controls block types and strategy used for terrain generation. See `biome/minecraft_overworld`. |

### minecraft:surface_material_adjustments

Specify fine-detail changes to blocks used in terrain generation (based on a noise function).

| Field | Type | Default | Notes |
|---|---|---|---|
| `adjustments` | objectArray |  | All adjustments that match the column's noise values will be applied in the order listed. |

### minecraft:surface_relative_threshold_feature

_since 1.20.30_

Determines whether the provided position is below the estimated surface level of the world, and places a feature if so. If the provided position is above the configured surface or the surface is not available, placement will fail. This feature only works for Overworld generators using world generation 1.18 or later.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `minimum_distance_below_surface` | int |  | The minimum number of blocks required to be between the estimated surface level and a valid place for this feature. Defaults to zero. |
| `format_version` | string |  | Format Version |

Example (Define a feature that places the underwater_magma_snap_to_surface_feature, if the given position is at least two blocks below estimated surface level.):
```json
{
 "format_version": "1.13.0",
 "minecraft:surface_relative_threshold_feature": {
  "description": {
   "identifier": "example:underwater_magma_underground_feature"
  },
  "feature_to_place": "log_decoration_feature",
  "minimum_distance_below_surface": 2
 }
}
```

### minecraft:swamp

Used to add decoration to the surface of swamp biomes such as water lilies.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` | string |  | **required**. Controls the block type used deep underground in this biome. |
| `max_puddle_depth_below_sea_level` | int |  | **required**. Controls the depth at which surface level blocks can be replaced with water for puddles. The number represents the number of blocks (0, 127) below sea level that we will go down to look for a surface block. |
| `mid_material` | string |  | **required**. Controls the block type used in a layer below the surface of this biome. |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur. |
| `sea_floor_material` | string |  | **required**. Controls the block type used as a floor for bodies of water in this biome. |
| `sea_material` | string |  | **required**. Controls the block type used for the bodies of water in this biome. |
| `top_material` | string |  | **required**. Controls the block type used for the surface of this biome. |
| `type` | stringEnum | `"minecraft:swamp"` | **required**. Controls the type of surface builder to use. Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:tags

Attach arbitrary string tags to this biome. Most biome tags are referenced by JSON settings, but some meanings of tags are directly implemented in the game's code. These tags are listed here: birch: Biome uses wildflowers (mutually exclusive with other flower biome tags). Does nothing if biome is tagged "hills". cold: Villagers will be dressed for snowy weather. deep: Pre-Caves and Cliffs, prevents an ocean from having islands or connected rivers and makes the biome less likely to have hills. desert: Allows partially-buried ruined portals to be placed in the biome. Sand blocks will play ambient sounds when the player is nearby. extreme_hills: Ruined portals can be placed higher than normal. Biomes tagged "forest" or "forest_generation" will use normal Overworld flowers instead of forest flowers. flower_forest: Biome uses forest flowers (mutually exclusive with other flower biome tags). forest: Biome uses forest flowers (mutually exclusive with other flower biome tags). Does nothing if biome is tagged tagged "taiga" or "extreme_hills". forest_generation: Equivalent to "forest". frozen: Villagers will be dressed for snowy weather. Prevents the biome from containing lava springs if it is also tagged "ocean". ice: Around ruined portals, lava is always replaced by Netherrack and Netherrack cannot be replaced by magma. ice_plains: Prevents the biome from containing lava springs if it is also tagged "mutated". jungle: Ruined portals will be very mossy. hills: Biomes tagged "meadow" or "birch" will use normal Overworld flowers instead of wildflowers. meadow: Biome uses wildflowers (mutually exclusive with other flower biome tags). Does nothing if biome is tagged "hills". mesa: Sand blocks will play ambient sounds when the player is nearby. mountain: Ruined portals can be placed higher than normal. mutated: Pre-Caves and Cliffs, prevents switching to the specified "mutate_transformation" as the biome is already considered mutated. Prevents the biome from containing lava springs if it is also tagged "ice_plains". no_legacy_worldgen: Prevents biome from using legacy world generation behavior unless the biome is being placed in the Overworld. ocean: Prevents the biome from containing lava springs if it is also tagged "frozen". Allows ruined portals to be found underwater. Pre-Caves and Cliffs, determines if shorelines and rivers should be placed at the edges of the biome and identifies the biome as a shallow ocean for placing islands, unless the "deep" tag is present. pale_garden: Biome uses closed-eye blossoms (mutually exclusive with other flower biome tags). plains: Biome uses plains flowers (mutually exclusive with other flower biome tags). rare: Pre-Caves and Cliffs, this tag flags the biome as a special biome. Oceans cannot be special. swamp: Allows ruined portals to be found underwater. Biome uses swamp flowers (mutually exclusive with other flower biome tags). taiga: Biomes tagged "forest" or "forest_generation" will use normal Overworld flowers instead of forest flowers.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tags` | stringArray |  | **required**. Array of string tags used by other systems such as entity spawning |

### minecraft:the_end

Marks a biome as using End dimension terrain generation. Biomes with this component will use the characteristic End terrain style with end stone and void generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum | `"minecraft:the_end"` | **required**. Use default Minecraft End terrain generation. Values: `minecraft:capped`, `minecraft:frozen_ocean`, `minecraft:mesa`, `minecraft:noise_gradient`, `minecraft:overworld`, `minecraft:swamp`, `minecraft:the_end`. |

### minecraft:tree_feature

_since 1.20.30_

Places a tree in the world. A tree consists of a column that is anchored to a base block with set parameters for what it can be placed on and canopy that extends from the column. The trunk height can be randomized with a min and max value, as well as the canopy offset.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `base_block` | stringArray |  | Base Block |
| `base_cluster` | object |  | Clusters of blocks randomly replaced with "base_block" around the base of the tree. |
| `may_grow_on` | stringArray |  | May Grow On |
| `may_replace` | stringArray |  | May Replace |
| `may_grow_through` | stringArray |  | May Grow Through |
| `acacia_trunk` | object |  | Acacia Trunk |
| `cherry_trunk` | object |  | Cherry Trunk |
| `fallen_trunk` | object |  | Fallen Trunk |
| `fancy_trunk` | object |  | Fancy Trunk |
| `mangrove_trunk` | object |  | Mangrove Trunk |
| `mega_trunk` | object |  | Mega Trunk |
| `trunk` | object |  | Trunk |
| `poplar_trunk` | object |  | Poplar Trunk |
| `acacia_canopy` | object |  | Acacia Canopy |
| `canopy` | object |  | Canopy |
| `cherry_canopy` | object |  | Cherry Canopy |
| `fancy_canopy` | object |  | Fancy Canopy |
| `mangrove_canopy` | keyedObjectCollection |  | Mangrove Canopy |
| `mega_canopy` | object |  | Mega Canopy |
| `mega_pine_canopy` | object |  | Mega Pine Canopy |
| `pine_canopy` | object |  | Pine Canopy |
| `poplar_canopy` | object |  | Poplar Canopy |
| `roofed_canopy` | object |  | Roofed Canopy |
| `spruce_canopy` | object |  | Spruce Canopy |
| `random_spread_canopy` | keyedObjectCollection |  | Random Spread Canopy |
| `mangrove_roots` | object |  | Mangrove Roots |
| `format_version` | string |  | Format Version |

### minecraft:underwater_cave_carver_feature

_since 1.20.30_

Carves a cave through the world in the current chunk, and in every chunk around the current chunk in an 8-block radial pattern. This feature will specifically target creating caves only below sea level. This feature will only work when placed specifically in the pass "pregeneration_pass".

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `width_modifier` | molang |  | How many blocks to increase the cave radius by, from the center point of the cave. |
| `skip_carve_chance` | int |  | The chance to skip doing the carve (1 / value). |
| `height_limit` | int |  | The height limit where we attempt to carve. |
| `format_version` | string |  | Format Version |

Example (Carve caves normally):
```json
{
 "format_version": "1.13.0",
 "minecraft:underwater_cave_carver_feature": {
  "description": {
   "identifier": "example:underground_cave_carver_feature"
  },
  "fill_with": "minecraft:water",
  "width_modifier": 0,
  "replace_air_with": "minecraft:flowing_water"
 }
}
```

### minecraft:vegetation_patch_feature

_since 1.20.30_

Scatters vegetation in an area. The vegetation feature's appearance can be modified by adjusting the radius and depth that it will generate.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `replaceable_blocks` | stringArray |  | **required**. Replaceable Blocks |
| `surface` | string |  | Determines if a vegetation patch will grow from the ceiling or the floor. |
| `vertical_range` | int |  | **required**. Vertical range used to determine a suitable surface position for the patch. |
| `waterlogged` | boolean |  | If true, waterlogs the positions occupied by the ground blocks. |
| `format_version` | string |  | Format Version |

Example (Adding a clay pool with dripleaf vegetation):
```json
{
 "format_version": "1.13.0",
 "minecraft:vegetation_patch_feature": {
  "description": {
   "identifier": "example:clay_pool_with_dripleaves_feature"
  },
  "replaceable_blocks": [
   "minecraft:clay",
   "minecraft:moss_block",
   "minecraft:sand",
   "minecraft:gravel",
   "minecraft:dirt",
   "minecraft:coarse_dirt",
   "minecraft:podzol",
   "minecraft:dirt_with_roots",
   "minecraft:grass_block",
   "minecraft:mycelium",
   "minecraft:stone",
   "minecraft:cave_vines",
   "minecraft:cave_vines_body_with_berries",
   "minecraft:cave_vines_head_with_berries"
  ],
  "ground_block": "minecraft:clay",
  "vegetation_feature": "minecraft:dripleaf_feature",
  "surface": "floor",
  "depth": 3,
  "vertical_range": 5,
  "vegetation_chance": 0.1,
  "horizontal_radius": {
   "range_min": 4,
   "range_max": 8
  },
  "extra_deep_block_chance": 0.8,
  "extra_edge_column_chance": 0.7,
  "waterlogged": true
 }
}
```

### minecraft:village_type

_since 1.26.0_

Determines the type of village for the Biome

> Biome component added in 1.26.0 that determines the type of village (default, desert, ice, savanna, or taiga) that generates in this biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum |  | **required**. Type Values: `default`, `desert`, `ice`, `savanna`, `taiga`. |

### minecraft:water_appearance

Set the water surface color used during rendering. Biomes without this component will have default water surface color behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `surface_color` | string |  | RGB color of the water surface |
| `surface_opacity` | float |  | Opacity of the water surface (must be between 0 for invisible and 1 for opaque, inclusive) |

### minecraft:water_identifier

Set the identifier used for rendering water in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Water JSON schemas under the "water" directory. Biomes without this component will have default water settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `water_identifier` | string |  | **required**. Identifier of water definition to use |

### minecraft:weighted_random_feature

_since 1.20.30_

Selects and places a feature randomly based on weighted probabilities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` | object |  | **required**. Description |
| `features` | stringArray |  | **required**. Features |
| `format_version` | string |  | Format Version |

Example (Selecting and placing a variant of a flower):
```json
{
 "format_version": "1.13.0",
 "minecraft:weighted_random_feature": {
  "description": {
   "identifier": "example:select_flower_feature"
  },
  "features": [
   [
    "example:white_flower_feature",
    1
   ],
   [
    "example:red_flower_feature",
    2
   ],
   [
    "example:blue_flower_feature",
    1
   ],
   [
    "example:yellow_flower_feature",
    4
   ]
  ]
 }
}
```

## Documents and sub-objects (143)

### features (features)

Defines a world generation feature document and its feature-specific properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. Format Version |
| `minecraft:beards_and_shavers` | object |  | Beards And Shavers |
| `minecraft:rect_layout` | object |  | Rect Layout |
| `minecraft:scan_surface` | object |  | Scan Surface |
| `minecraft:sculk_patch_feature` | object |  | Sculk Patch Feature |
| `minecraft:aggregate_feature` | object |  | Aggregate Feature |
| `minecraft:cave_carver_feature` | object |  | Cave Carver Feature |
| `minecraft:conditional_list` | object |  | Conditional List |
| `minecraft:fossil_feature` | object |  | Fossil Feature |
| `minecraft:geode_feature` | object |  | Geode Feature |
| `minecraft:growing_plant_feature` | keyedObjectCollection |  | Growing Plant Feature |
| `minecraft:height_difference_filter_feature` | object |  | Height Difference Filter Feature |
| `minecraft:horizontal_tree_decoration_feature` | object |  | Horizontal Tree Decoration Feature |
| `minecraft:multiface_feature` | object |  | Multiface Feature |
| `minecraft:nether_cave_carver_feature` | object |  | Nether Cave Carver Feature |
| `minecraft:ore_feature` | object |  | Ore Feature |
| `minecraft:partially_exposed_blob_feature` | object |  | Partially Exposed Blob Feature |
| `minecraft:scatter_feature` | object |  | Scatter Feature |
| `minecraft:search_feature` | object |  | Search Feature |
| `minecraft:sequence_feature` | object |  | Sequence Feature |
| `minecraft:single_block_feature` | object |  | Single Block Feature |
| `minecraft:snap_to_surface_feature` | object |  | Snap To Surface Feature |
| `minecraft:structure_template_feature` | object |  | Structure Template Feature |
| `minecraft:surface_relative_threshold_feature` | object |  | Surface Relative Threshold Feature |
| `minecraft:tree_feature` | object |  | Tree Feature |
| `minecraft:underwater_cave_carver_feature` | object |  | Underwater Cave Carver Feature |
| `minecraft:vegetation_patch_feature` | object |  | Vegetation Patch Feature |
| `minecraft:weighted_random_feature` | keyedObjectCollection |  | Weighted Random Feature |
| `minecraft:multi_block_feature` | object |  | Multi Block Feature |
| `minecraft:multipart_block_column_feature` | object |  | Multipart Block Column Feature |

### Biome Components (biome_components)

Any components that this Biome uses

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:climate` | object |  | Describes temperature, humidity, precipitation, and similar. Biomes without this component will have default values. See `biome/minecraft_climate`. |
| `minecraft:creature_spawn_probability` | object |  | Probability that creatures will spawn within the biome when a chunk is generated. See `biome/minecraft_creature_spawn_probability`. |
| `minecraft:humidity` | object |  | Forces a biome to ether always be humid or never humid. Humidity effects the spread chance, and spread rate of fire in the biome See `biome/minecraft_humidity`. |
| `minecraft:map_tints` | object |  | Sets the color grass and foliage will be tinted by in this biome on the map. See `biome/minecraft_map_tints`. |
| `minecraft:mountain_parameters` | object |  | Noise parameters used to drive mountain terrain generation in Overworld. See `biome/minecraft_mountain_parameters`. |
| `minecraft:multinoise_generation_rules` | object |  | Controls how this biome is instantiated (and then potentially modified) during world generation of the nether. See `biome/minecraft_multinoise_generation_rules`. |
| `minecraft:overworld_generation_rules` | object |  | Controls how this biome is instantiated (and then potentially modified) during world generation of the overworld. See `biome/minecraft_overworld_generation_rules`. |
| `minecraft:overworld_height` | object |  | Noise parameters used to drive terrain height in the Overworld. See `biome/minecraft_overworld_height`. |
| `minecraft:partially_frozen` | object |  | Component will impact the temperature in a frozen biome, causing some areas to not be frozen. Ex: patchy ice, patchy snow |
| `minecraft:replace_biomes` | object |  | Replaces a specified portion of one or more Minecraft biomes. See `biome/minecraft_replace_biomes`. |
| `minecraft:subsurface_builder` | object |  | Sub Surface Builders allow specifying a `minecraft:surface_builder` to be applied to biomes located underneath regular terrain surface. Note, however, that pre-existing surface builder types' processing have not been updated to accommodate the ability to spec… See `biome/minecraft_subsurface_builder`. |
| `minecraft:surface_builder` | object |  | Controls materials used for terrain generation. See `biome/minecraft_surface_builder`. |
| `minecraft:surface_material_adjustments` | object |  | Specify fine-detail changes to blocks used in terrain generation (based on a noise function). See `biome/minecraft_surface_material_adjustments`. |
| `minecraft:tags` | object |  | Attach arbitrary string tags to this biome. Most biome tags are referenced by JSON settings, but some meanings of tags are directly implemented in the game's code. These tags are listed here: birch: Biome uses wildflowers (mutually exclusive with other flower… See `biome/minecraft_tags`. |
| `minecraft:village_type` | object |  | Determines the type of village for the Biome See `biome/minecraft_village_type`. |

### Biome Definition (biome_definition)

Contains a description and components to define a Biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. Components for this Biome. See `biome/biome_components`. |
| `description` | object |  | **required**. Non-component settings, including the Biome name. See `biome/biome_description`. |

### Biome Description (biome_description)

Contains non-component settings for a Biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. The name of the Biome, used by other features like the '/locate biome' command. Identifiers should only be lowercase. |

### Biome JSON File (biome_json_file)

Contains a format version and a biome definition

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. Version of the JSON schema used by this file |
| `minecraft:biome` | object |  | **required**. A single biome definition See `biome/biome_definition`. |

### Biome Replacement (biome_replacement)

_since 1.21.110_

Represents the replacement information used to determine the placement of the overriding biome.

> Custom partial biome replacement is available without experimental toggle in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `amount` | float |  | **required**. Noise value used to determine whether or not the replacement is attempted, similar to a percentage. Must be in the range (0.0, 1.0]. |
| `dimension` | string |  | **required**. Dimension in which this replacement can happen. Can be either 'minecraft:overworld' or 'minecraft:nether'. |
| `noise_frequency_scale` | float |  | **required**. Scaling value used to alter the frequency of replacement attempts. A lower frequency will mean a bigger contiguous biome area that occurs less often. A higher frequency will mean smaller contiguous biome areas that occur more often. Must be in the range (0.0,… |
| `targets` | stringArray |  | **required**. Biomes that are going to be replaced by the overriding biome. Target biomes must not contain namespaces. |

### custom_map_tint_grass_noise (custom_map_tint_grass_noise)

Makes grass use the noise based colors for tinting in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum | `"noise"` | **required**. Controls the type of grass tint to use. Values: `noise`, `tint`. |

### custom_map_tint_grass_tint (custom_map_tint_grass_tint)

Sets the color grass will be tinted by in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tint` | string |  | **required**. Tint color used in this biome on the map. |
| `type` | stringEnum | `"tint"` | **required**. Controls the type of grass tint to use. Values: `noise`, `tint`. |

### FloatRange (floatrange)

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | float | `0` | Max |
| `min` | float | `0` | Min |

### grass (grass)

Sets the color grass will be tinted by in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tint` | string |  | **required**. Tint color used in this biome on the map. |
| `type` | string |  | **required**. Controls the type of grass tint to use. |

### NoiseBlockSpecifier (noiseblockspecifier)

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The block to place if the noise sample satisfies the provided threshold/range |
| `noise` | string | `""` | The string identifier of the noise associated with this NoiseBlockSpecifier. |
| `range` | object | `{"max":0,"min":0}` | The range of sampled noise value associated with the provided Block. See `legacy/floatrange`. |
| `threshold` | float | `0` | The minimum sampled noise value associated with the provided Block. |

### NoiseDescriptor (noisedescriptor)

| Field | Type | Default | Notes |
|---|---|---|---|
| `amplitudes` | numberArray |  | **required**. Governs the attenuation of the first n octaves in the generated noise. |
| `first_octave` | int |  | **required**. Governs the general frequency characteristics of the generated noise. Lower value results in noise with lower frequency content. |
| `name` | string |  | **required**. The string used to initialize the noise. Has no impact on the qualitative aspects of the generated values. |

### Client Biome Components (client_biome_components)

Any components that this Client Biome uses

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:ambient_sounds` | object |  | Set the ambient sounds for the biome. These sounds must be in the 'individual_named_sounds' in a 'sounds.json' file. See `client_biome/minecraft_ambient_sounds`. |
| `minecraft:atmosphere_identifier` | object |  | Set the identifier used for atmospherics in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Atmospheric Scattering JSON schemas under the "atmospherics" directory. Biomes without this component will have default atmosphere settings. See `client_biome/minecraft_atmosphere_identifier`. |
| `minecraft:biome_music` | object |  | Affect how music plays within the biome See `client_biome/minecraft_biome_music`. |
| `minecraft:color_grading_identifier` | object |  | Set the identifier used for color grading in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Color Grading JSON schemas under the "color_grading" directory. Biomes without this component will have default color_grading settings. See `client_biome/minecraft_color_grading_identifier`. |
| `minecraft:dry_foliage_color` | object |  | Set the dry foliage color used during rendering. Biomes without this component will have default dry foliage color behavior. See `client_biome/minecraft_dry_foliage_color`. |
| `minecraft:fog_appearance` | object |  | Set the fog settings used during rendering. Biomes without this component will have default fog settings. See `client_biome/minecraft_fog_appearance`. |
| `minecraft:foliage_appearance` | object |  | Set the foliage color or color map used during rendering. Biomes without this component will have default foliage appearance. See `client_biome/minecraft_foliage_appearance`. |
| `minecraft:grass_appearance` | object |  | Set the grass color or color map used during rendering. Biomes without this component will have default grass appearance. See `client_biome/minecraft_grass_appearance`. |
| `minecraft:lighting_identifier` | object |  | Set the identifier used for lighting in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Lighting JSON schemas under the "lighting" directory. Biomes without this component will have default lighting settings. See `client_biome/minecraft_lighting_identifier`. |
| `minecraft:sky_color` | object |  | Set the sky color used during rendering. Biomes without this component will have default sky color behavior. See `client_biome/minecraft_sky_color`. |
| `minecraft:water_appearance` | object |  | Set the water surface color used during rendering. Biomes without this component will have default water surface color behavior. See `client_biome/minecraft_water_appearance`. |
| `minecraft:water_identifier` | object |  | Set the identifier used for rendering water in Vibrant Visuals mode. Identifiers must resolve to identifiers in valid Water JSON schemas under the "water" directory. Biomes without this component will have default water settings. See `client_biome/minecraft_water_identifier`. |

### Client Biome Definition (client_biome_definition)

Defines the client-side visual and audio properties of a biome. Client biomes control fog, water color, grass tint, ambient sounds, and music within a biome. They are paired with server-side biome definitions that control gameplay behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. Components for this Client Biome. See `client_biome/client_biome_components`. |
| `description` | object |  | **required**. Non-component settings, including the Client Biome name. See `client_biome/client_biome_description`. |

### Client Biome Description (client_biome_description)

Contains non-component settings for a Client Biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. The name of the Client Biome, used by other features like the '/locate biome' command. Must match the name of a Biome defined by the game or a behavior pack. |

### Client Biome JSON File (client_biome_json_file)

Contains a format version and a Client Biome definition

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. Version of the JSON schema used by this file |
| `minecraft:client_biome` | object |  | **required**. A single Client Biome definition, containing rendering or sound settings related to a Biome defined by the game or a behavior pack See `client_biome/client_biome_definition`. |

### Foliage Color Map (foliage_color_map)

Object specifying a color map for foliage instead of a specific color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_map` | stringEnum |  | **required**. Color map from textures/colormap to determine color of foliage. Values: `birch`, `dry_foliage`, `evergreen`, `foliage`, `mangrove_swamp_foliage`, `swamp_foliage`. |

### Grass Color Map (grass_color_map)

Object specifying a color map for grass instead of a specific color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color_map` | stringEnum |  | **required**. Color map from textures/colormap to determine color of grass. Values: `grass`, `swamp_grass`. |

### Sound Addition (sound_addition)

Defines an occasional ambient sound effect.

| Field | Type | Default | Notes |
|---|---|---|---|
| `asset` | string |  | **required**. Name of the sound asset to play |
| `chance` | float |  | **required**. Probability of the sound playing each interval, between 0.0 and 1.0 |

### JigsawBlockEntityModifier (jigsaw_block_entity_modifier)

Optional modifier applied to the output block's block-entity data when all predicates in a rule match.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string | `"minecraft:passthrough"` | **required**. The kind of block entity modifier. Values: `minecraft:passthrough`, `minecraft:append_loot`, `minecraft:clear`. |
| `loot_table` | string |  | Path to the loot table JSON file (used by 'minecraft:append_loot'). |

### JigsawBlockPredicate (jigsaw_block_predicate)

A BlockRule is a predicate (test) applied to a block. The 'predicate_type' determines the test and what other fields are valid.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string | `"minecraft:always_true"` | **required**. The kind of block predicate. Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:random_block_match`, `minecraft:blockstate_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |
| `block` | string |  | Block identifier to match. Used by 'block_match' and 'random_block_match'. |
| `block_state` | object |  | BlockSpecifier to match (name plus optional states). Used by 'blockstate_match' and 'random_blockstate_match'. See `jigsaw/jigsaw_block_specifier`. |
| `tag` | string |  | Block tag to match. Used by 'tag_match'. |
| `probability` | float |  | Probability of matching, in the range [0, 1]. Used by 'random_block_match' and 'random_blockstate_match'. Range: 0..1. |

### JigsawBlockSpecifier (jigsaw_block_specifier)

Specifies a particular block state. Can be a bare block-name string, or a JSON object naming the block and (optionally) its block-state properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | **required**. Block identifier (for example 'minecraft:gravel'). |
| `states` | object |  | Block-state properties as a JSON object. Property values may be boolean, integer, or string. |

### JigsawPositionPredicate (jigsaw_position_predicate)

A PositionRule is a predicate (test) applied to the world block's position relative to the structure's world origin.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | **required**. The kind of positional predicate. Values: `minecraft:always_true`, `minecraft:axis_aligned_linear_pos`. |
| `axis` | string |  | Axis along which to measure distance. Used by 'axis_aligned_linear_pos'. Values: `x`, `y`, `z`. |
| `min_chance` | float | `0` | Lower bound of the matching probability. Must be in [0, 1). Range: 0..1. |
| `max_chance` | float | `1` | Upper bound of the matching probability. Must be in [0, 1) and greater than min_chance. Range: 0..1. |
| `min_dist` | int | `0` | Minimum distance from the structure origin along the chosen axis. Must be greater than 0. Range: 0... |
| `max_dist` | int | `1` | Maximum distance from the structure origin along the chosen axis. Must be greater than 0. Range: 1... |

### JigsawStructure (jigsaw_structure)

Defines a jigsaw structure that generates in the world using template pools and structure sets. A Jigsaw Structure is a dynamic, modular structure composed of multiple Structure Templates connected via Jigsaw Blocks. Each Structure Template contains Jigsaw Blocks that define how it can connect to other templates and where those connections should occur; these blocks act as connectors, enabling the structure to grow by attaching new pieces. Construction begins by placing a single template; any Jigsaw Blocks within it are added to a pending list, and the system recursively expands the structure by resolving those connections until the specified max_depth is reached. Examples of Jigsaw Structures include Trail Ruins and Trial Chambers.

> Currently only Trail Ruins can be modified via JSON with the Data-Driven Jigsaw Structure Experimental Toggle turned on. Other Jigsaw Structures such as Villages and Bastions use a legacy version of the Jigsaw Structure System and cannot be modified via JSON.

> This generation process can be relatively time consuming depending on the complexity and quantity of Jigsaw Blocks in any given template.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. The format version of this jigsaw structure definition. |
| `minecraft:jigsaw` | object |  | **required**. The jigsaw structure definition. |

### JigsawVerticalAnchor (jigsaw_vertical_anchor)

A vertical anchor defines a point in the dimension to offset from. Used as the 'value' (for constant height providers) or as 'min' and 'max' bounds (for uniform height providers). Exactly one of the four anchor properties below should be set.

| Field | Type | Default | Notes |
|---|---|---|---|
| `absolute` | int |  | An absolute Y coordinate. |
| `above_bottom` | int |  | A relative height above the bottom of the dimension. Must be positive. Range: 0... |
| `below_top` | int |  | A relative height below the top of the dimension. Must be positive. Range: 0... |
| `from_sea` | int |  | A relative height starting at the dimension's sea level. |

### jigsawblockmetadata (jigsawblockmetadata)

JigsawBlockMetadata

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | The name identifier referenced by the 'target' field of another Jigsaw block. |
| `pool` | string |  | The structure template pool containing possible structures to generate. |
| `target` | string |  | The name identifier of the Jigsaw block to target within the generated structure. |
| `joint_type` | string |  | The type of Jigsaw joint made with 'target'. |
| `block` | string |  | The serialization Id of the Jigsaw block before generation. |
| `selection_priority` | int |  | The priority used during target block selection. |
| `final_block` | string |  | The serialization Id to replace the starting Jigsaw block with. |
| `pos` |  |  | The Jigsaw block position. |
| `placement_priority` | int |  | The priority used during target block placement. |

### jigsawstructure_processorrule_alwaystrueblock (jigsawstructure_processorrule_alwaystrueblock)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | The type of block predicate. |

### jigsawstructure_processorrule_alwaystruepos (jigsawstructure_processorrule_alwaystruepos)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | The type of position predicate. |

### jigsawstructure_processorrule_appendloot (jigsawstructure_processorrule_appendloot)

Modifier will attempt to add loot to a block entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | The type of block entity modifier. |
| `loot_table` | string |  | The loot table to append to the block entity. |

### jigsawstructure_processorrule_axisalignedlinear (jigsawstructure_processorrule_axisalignedlinear)

Predicate that evaluates to true if the block is within the distance range along the provided axis and a random number is generated between the chance range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | PositionalBlockRuleAxis |
| `axis` | string |  | The axis along which to measure distance. |
| `min_chance` | float |  | Minimum chance value for the random probability. |
| `max_chance` | float |  | Maximum chance value for the random probability. |
| `max_dist` | int |  | Maximum distance along the axis. |
| `min_dist` | int |  | Minimum distance along the axis. |

### jigsawstructure_processorrule_blockmatch (jigsawstructure_processorrule_blockmatch)

Predicate that evaluates to true if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | The type of block predicate. |
| `block` | string |  | The block to match against. |

### jigsawstructure_processorrule_passthrough (jigsawstructure_processorrule_passthrough)

Modifier that leaves the state unchanged. This is the default block modifier if no other block modifier is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | The type of block entity modifier. |

### jigsawstructure_processorrule_randomblockmatch (jigsawstructure_processorrule_randomblockmatch)

Predicate that evaluates to true with a given probability if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | The type of block predicate. |
| `block` | string |  | The block to match against. |
| `probability` | float |  | Probability of evaluating to true when the block matches. |

### jigsawstructure_processorrule_tagmatch (jigsawstructure_processorrule_tagmatch)

Predicate that evaluates to true if the block at the specified location contains the tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tag` | string |  | The tag to be matched. |
| `predicate_type` | string |  | PositionalBlockRuleAxis |

### jigsawstructure_processors_blockignore (jigsawstructure_processors_blockignore)

Specifies block types in the template that should be ignored by other processors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | string |  | Processors Type |
| `blocks` |  |  | List of blocks evaluated on all blocks of a Structure Template. If a block is matched in the provided list the block will be ignored for processing. |

### jigsawstructure_processors_blockrules (jigsawstructure_processors_blockrules)

Replaces and modifies blocks based on a series of rules

| Field | Type | Default | Notes |
|---|---|---|---|
| `rules` |  |  | List of block rules evaluated on all blocks of a Structure Template. Block rules are evaluated in order. If a block rule succeeds and the output_state is set, the output_state block will be used as the input_predicate block for subsequent rules. |
| `processor_type` | string |  | Processors Type |

### jigsawstructure_processors_capped (jigsawstructure_processors_capped)

Processor that wraps a processor and caps the number of times the delegated processor can be applied.

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | string |  | Processors Type |
| `delegate` |  |  | The processor that will be executed. |
| `limit` |  |  | The maximum number of times that this delegate can be applied. |

### jigsawstructure_processors_protectedblock (jigsawstructure_processors_protectedblock)

Protect blocks from this structure's placement in the world. Ensuring that it does not replace matching blocks in the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | string |  | Processors Type |
| `value` | string |  | Block tag for the blocks that will be protected |

### jigsawstructure_rule (jigsawstructure_rule)

A block rule that is evaluated on all blocks of a Structure Template. All predicates must evaluate to true in order for a block to be replaced by the output_state.

| Field | Type | Default | Notes |
|---|---|---|---|
| `input_predicate` |  |  | A predicate evaluated on the Structure Template block. |
| `block_entity_modifier` |  |  | A block state modifier for block entities when all predicate match. |
| `location_predicate` |  |  | A predicate evaluated on the world block. |
| `position_predicate` |  |  | A predicate evaluated on the distance between the structure's world origin and the world block. |
| `output_state` |  |  | Block to replace the world block with if all predicates evaluate to true. |

### jigsawstructuredefinition_description (jigsawstructuredefinition_description)

Identifies the Jigsaw Structure. The identifier set here is what other definitions reference: Structure Sets list this identifier in their 'structures' weighted list, and commands such as /locate use it to find an instance in the world. Must include a namespace; the 'minecraft' namespace must not be used unless overriding a vanilla structure.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Identifier of the Jigsaw Structure. |

### jigsawstructuremetadata (jigsawstructuremetadata)

JigsawStructureMetadata

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` |  |  | The registry associating structure locations with generated Jigsaw structure metadata. |

### jigsawstructuremetadataregistry (jigsawstructuremetadataregistry)

JigsawStructureMetadataRegistry

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` |  |  | The registry associating structure locations with generated Jigsaw structure metadata. |

### jigsawstructureprocessorlist_description (jigsawstructureprocessorlist_description)

Identifies the Processor List. The identifier set here is what Template Pool elements reference in their 'processors' field to pair a set of block-processing rules with a Structure Template.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Identifier of the Processor List. This is referenced by Template Pools when pairing processors with Structure Templates. |

### jigsawstructureset_description (jigsawstructureset_description)

Identifies the Structure Set. The identifier set here groups one or more Jigsaw Structures under a shared placement strategy and is referenced when configuring world generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Identifier of the Jigsaw Structure Set. |

### jigsawstructureset_randomspreadplacement (jigsawstructureset_randomspreadplacement)

Defines random spread placement with spacing and separation for structure sets.

| Field | Type | Default | Notes |
|---|---|---|---|
| `separation` | int |  | Padding (in chunks) within each grid cell. Structures will not generate within the padded area. |
| `type` | string |  | Type of placement for the Jigsaw Structure Set. |
| `salt` | int |  | Seed used for the random generator to provide a unique scatter pattern. This is used to prevent overlap in the case where multiple structure sets use the same placement values. |
| `spacing` | int |  | Grid cell size (in chunks) to use when generating the structure. Structures will attempt to generate at a random position within each cell. |
| `spread_type` | string |  | Randomness algorithm used when placing structures. |

### jigsawstructureset_structure (jigsawstructureset_structure)

JigsawStructureSet Structure

| Field | Type | Default | Notes |
|---|---|---|---|
| `structure` | string |  | Identifier of the Jigsaw Structure. |
| `weight` | int |  | Weight of the Jigsaw Structure in the set. Higher weights are more likely to be selected. |

### jigsawstructuretemplatepool_description (jigsawstructuretemplatepool_description)

Identifies the template pool. The identifier set here is what other definitions reference: the Jigsaw Structure's start_pool, a Jigsaw Block's target pool, and any pool_aliases targets all match against this value.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Identifier of the template pool. Used by Jigsaw Structures to assign processors to Structure Templates. |

### jigsawstructuretemplatepool_singlepoolelement (jigsawstructuretemplatepool_singlepoolelement)

Defines a single structure template element for template pools.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | The type of pool element. |
| `location` | string |  | The path of the structure file. This path is relative to the behavior pack's structures folder. |
| `processors` | string |  | The identifier of the processor list to use when placing the structure. |

### jigsawstructuretemplatepool_templatepoolelement (jigsawstructuretemplatepool_templatepoolelement)

Defines a weighted template pool element with structure and processor references.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element` |  |  | A grouping of a Structure Template, the Processor List to use when placing the structure, and its weight that determines the likelihood of the element being chosen. |
| `weight` | int |  | The weighted probability of choosing the element from the pool. For example, a template pool containing 2 structures with weights of 1 and 3 will have a 25% and 75% chance of being chosen respectively. |
| `projection` | string |  | Specifies how structures should be placed relative to the terrain. |

### minecraft_jigsaw_structure_metadata (minecraft_jigsaw_structure_metadata)

Jigsaw Structure Metadata

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | Format version of the contained metadata registry. |
| `minecraft:jigsaw_structure_metadata` |  |  | The Jigsaw metadata registry. |

### PoolElementEmpty (pool_element_empty)

Pool element that places nothing when chosen. Useful as a weighted 'do nothing' option so that some attempts at jigsaw expansion deliberately leave a connection unresolved (for example, to vary structure size or to open optional branches).

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. Must be 'minecraft:empty_pool_element' for this element variant. Values: `minecraft:empty_pool_element`. |

### PoolElementFeature (pool_element_feature)

Pool element that places a Feature (from the Features Reference) as part of a Jigsaw Structure, instead of placing a structure template. Useful for inserting procedurally generated decorations such as trees, plants, or ore patches into jigsaw layouts.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. Must be 'minecraft:feature_pool_element' for this element variant. Values: `minecraft:feature_pool_element`. |
| `feature` | string |  | **required**. Identifier of the Feature to place when this element is chosen. Example: 'minecraft:eyeblossom_feature'. |
| `projection` | string | `"rigid"` | How the feature projects onto terrain. Values: `rigid`, `terrain_matching`. |

### PoolElementLegacySingle (pool_element_legacy_single)

Variant of single_pool_element used for legacy-format structure files. Same field set as Single Pool Element; differs only in how the underlying structure file is interpreted.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. Must be 'minecraft:legacy_single_pool_element' for this element variant. Values: `minecraft:legacy_single_pool_element`. |
| `location` | string |  | **required**. Path to the structure template file, relative to the behavior pack's structures folder. |
| `processors` | string |  | Identifier of the processor list to apply to this element, or an inline processor configuration. Optional. |
| `projection` | string | `"rigid"` | How the element projects onto terrain. Values: `rigid`, `terrain_matching`. |

### PoolElementList (pool_element_list)

Pool element that composes several other pool elements together. When chosen, all listed elements are placed as a group rather than picking one. Useful for bundling related pieces that must always appear together.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. Must be 'minecraft:list_pool_element' for this element variant. Values: `minecraft:list_pool_element`. |
| `elements` | objectArray |  | **required**. Nested array of pool element configurations to compose. Each entry follows the same shape as a normal pool element (Single, Legacy Single, Feature, or Empty). Nesting another List Pool Element is not supported. |
| `projection` | string | `"rigid"` | How the composed group projects onto terrain. Values: `rigid`, `terrain_matching`. |

### PoolElementSingle (pool_element_single)

Pool element that places a single Structure Template (.mcstructure file) when chosen.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. Must be 'minecraft:single_pool_element' for this element variant. Values: `minecraft:single_pool_element`. |
| `location` | string |  | **required**. Path to the structure template file, relative to the behavior pack's structures folder. Example: 'minecraft:trail_ruins/tower/tower_top_1'. |
| `processors` | string |  | Identifier of the processor list to apply to this element, or an inline processor configuration. Optional. |
| `projection` | string | `"rigid"` | How the element projects onto terrain. Values: `rigid`, `terrain_matching`. |

### ProcessorList (processor_list)

Defines a list of structure processors that modify blocks during structure generation. Processors are functions that run when placing a Structure Template in the world. For example, you might want to randomly replace half of the Cobblestone blocks with Mossy Cobblestone, or replace Gravel with Suspicious Gravel and add a loot table. A Processor List contains one or more Processors that are run in sequence on each block. Each Processor contains one or more Predicates with a given Filter; if all the filters pass, the placed block will be modified according to the Output State.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. The format version of this processor list definition. |
| `minecraft:processor_list` | object |  | **required**. The processor list definition. |

### scatter_chance (scatter_chance)

Scatter probability represented by an expression or an object with a numerator and denominator.

| Field | Type | Default | Notes |
|---|---|---|---|
| `denominator` | int |  | Denominator for scatter probability. |
| `numerator` | int |  | Numerator for scatter probability. |

### scatter_params (scatter_params)

Controls the scatter distribution of a particular object.

| Field | Type | Default | Notes |
|---|---|---|---|
| `z` |  |  | Distribution for the coordinate (evaluated each iteration). |
| `iterations` |  |  | Number of scattered positions to generate. |
| `scatter_chance` |  |  | Probability that this scatter will occur. Not evaluated each iteration; either no iterations will run, or all will. |
| `coordinate_eval_order` | string |  | The order in which coordinates will be evaluated. Should be used when a coordinate depends on another. If omitted, defaults to "xzy". Supported orders are defined by "Coordinate Evaluation Order". |
| `x` |  |  | Distribution for the coordinate (evaluated each iteration). |
| `y` |  |  | Distribution for the coordinate (evaluated each iteration). |

### StructureSet (structure_set)

Defines a structure set that controls the placement and distribution of structures in the world. A Structure Set contains a set of Jigsaw Structures and rules for how those structures should be placed in the world relative to other instances of structures from the same set. Each structure within a set is paired with a weight that influences how frequently it is chosen.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. The format version of this structure set definition. |
| `minecraft:structure_set` | object |  | **required**. The structure set definition. |

### TemplatePool (template_pool)

Defines a template pool containing structure elements that can be connected via jigsaw blocks. Template Pools are groups of related structure templates with assigned weights and processors. During world generation, the Jigsaw Structure's start_pool specifies which Template Pool to use first. A Structure Template is then randomly chosen from the pool and placed as the first structure piece. Jigsaw Blocks within the placed structure may also specify Template Pools from which subsequent structure pieces are placed recursively until the Jigsaw Structure becomes fully generated.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. The format version of this template pool definition. |
| `minecraft:template_pool` | object |  | **required**. The template pool definition. |

### AnchorAboveBottom (anchorabovebottom)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `above_bottom` | int |  | **required**. Offset from anchored vertical position |

### AnchorAbsolute (anchorabsolute)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `absolute` | int |  | **required**. Offset from anchored vertical position |

### AnchorBelowTop (anchorbelowtop)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `below_top` | int |  | **required**. Offset from anchored vertical position |

### AnchorFromSea (anchorfromsea)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `from_sea` | int |  | **required**. Offset from anchored vertical position |

### ConstantHeightProviderType (constantheightprovidertype)

Constant anchor point

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. HeightProviderType Values: `constant`, `uniform`. |
| `value` | object |  | **required**. Constant anchor point |

### DimensionPaddingRange (dimensionpaddingrange)

Specifies the padding for the top and bottom of the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `bottom` | int | `0` | The padding from the bottom of the world |
| `top` | int | `0` | The padding from the top of the world |

### DirectPoolAlias (directpoolalias)

Pool alias for a Direct target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Direct pool |
| `target` | object |  | **required**. Target pool |

### Jigsaw Block Metadata (jigsaw_block_metadata)

Defines jigsaw block connection and targeting properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The serialization Id of the Jigsaw block before generation. |
| `final_block` | string |  | **required**. The serialization Id to replace the starting Jigsaw block with. |
| `joint_type` | stringEnum |  | **required**. The type of Jigsaw joint made with 'target'. Values: `aligned`, `rollable`. |
| `name` | string |  | **required**. The name identifier referenced by the 'target' field of another Jigsaw block. |
| `placement_priority` | int |  | **required**. The priority used during target block placement. |
| `pool` | string |  | **required**. The structure template pool containing possible structures to generate. |
| `pos` | object |  | **required**. The Jigsaw block position. |
| `selection_priority` | int |  | **required**. The priority used during target block selection. |
| `target` | string |  | **required**. The name identifier of the Jigsaw block to target within the generated structure. |

### Jigsaw Structure Metadata (jigsaw_structure_metadata)

Defines jigsaw structure markers and bounding size.

| Field | Type | Default | Notes |
|---|---|---|---|
| `markers` | objectArray |  | **required**. The Jigsaw blocks contained within the generated structure. See `structure/jigsaw_block_metadata`. |
| `size` | object |  | **required**. The generated structures bounding size. |

### Jigsaw Structure Metadata Registry (jigsaw_structure_metadata_registry)

Registers jigsaw structure metadata by location.

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` | keyedObjectCollection |  | **required**. The registry associating structure locations with generated Jigsaw structure metadata. |

### JigsawBlockMetadata (jigsawblockmetadata)

Defines jigsaw block properties for structure connections.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The serialization Id of the Jigsaw block before generation. |
| `final_block` | string |  | **required**. The serialization Id to replace the starting Jigsaw block with. |
| `joint_type` | stringEnum |  | **required**. The type of Jigsaw joint made with 'target'. Values: `aligned`, `rollable`. |
| `name` | string |  | **required**. The name identifier referenced by the 'target' field of another Jigsaw block. |
| `placement_priority` | int |  | **required**. The priority used during target block placement. |
| `pool` | string |  | **required**. The structure template pool containing possible structures to generate. |
| `pos` | object |  | **required**. The Jigsaw block position. |
| `selection_priority` | int |  | **required**. The priority used during target block selection. |
| `target` | string |  | **required**. The name identifier of the Jigsaw block to target within the generated structure. |

### JigsawDescriptionIdentifier (jigsawdescriptionidentifier)

Identifier of the Jigsaw Structure.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | object |  | **required**. Identifier |

### JigsawStructureMetadata (jigsawstructuremetadata)

Defines jigsaw structure metadata including markers and size.

| Field | Type | Default | Notes |
|---|---|---|---|
| `markers` | objectArray |  | **required**. The Jigsaw blocks contained within the generated structure. See `structure/jigsawblockmetadata`. |
| `size` | object |  | **required**. The generated structures bounding size. |
| `use_legacy_rotation` | boolean | `false` | Unused - Previously if true would use legacy size rotation. |

### JigsawStructureMetadataRegistry (jigsawstructuremetadataregistry)

Associates structure locations with jigsaw metadata.

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` | keyedObjectCollection |  | **required**. The registry associating structure locations with generated Jigsaw structure metadata. |

### JigsawTemplatePool (jigsawtemplatepool)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` | object |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### RandomGroupBindings (randomgroupbindings)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` | stringArray |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### RandomGroupPoolAlias (randomgrouppoolalias)

Pool alias for a RandomGroup of aliases

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` | objectArray |  | **required**. Aliases for a RandomGroup See `world/randomgroupbindings`. |

### RandomPoolAlias (randompoolalias)

Pool alias for a Random list of targets

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Random Pool |
| `targets` | objectArray |  | **required**. List of potential pools See `world/jigsawtemplatepool`. |

### UniformHeightProviderType (uniformheightprovidertype)

Uniform distribution of possible anchor points

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | object |  | **required**. Max value of the uniform distribution |
| `min` | object |  | **required**. Min value of the uniform distribution |
| `type` | string |  | **required**. HeightProviderType Values: `constant`, `uniform`. |

### VerticalAnchorType (verticalanchortype)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `from_sea` | int |  | **required**. Offset from anchored vertical position |

### WeightedRandomItem (weightedrandomitem)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` |  |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### Bounds (bounds)

Defines the minimum and maximum vertical bounds for a dimension.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | **required**. Max |
| `min` | int |  | **required**. Min |

### Components (components)

Specifies the components that define dimension properties such as bounds and generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:default_biome` | object |  | Minecraft Default Biome See `dimension/defaultbiome`. |
| `minecraft:dimension_height` | object |  | Minecraft Dimension Height See `dimension/dimensionheight`. |
| `minecraft:generation` | object |  | **required**. Minecraft Generation See `dimension/generation`. |

### DefaultBiome (defaultbiome)

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome` | string |  | **required**. Biome |

### Description (description)

Declares the unique identifier for a custom dimension that players can travel to. The identifier must use namespace:name format (like 'mypack:custom_dimension') and is used by commands, portals, and scripts to reference this dimension. Every custom dimension requires a description with a valid identifier.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |

### Dimension (dimension)

Defines a custom dimension with its description and components.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. Components See `dimension/components`. |
| `description` | object |  | **required**. Description See `dimension/description`. |

### dimension_document (dimension_document)

A Minecraft Bedrock Edition dimension definition document. Dimensions define custom world spaces with configurable bounds and world generation settings. Custom dimensions can have their own terrain generation, height limits, and properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this dimension file. Use '1.20.0' or later. |
| `minecraft:dimension_type` | object |  | **required**. The dimension type definition containing description and components. |

### DimensionDocument (dimensiondocument)

Represents the root document for a custom dimension definition.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:dimension` | object |  | **required**. Minecraft Dimension See `dimension/dimension`. |

### DimensionHeight (dimensionheight)

| Field | Type | Default | Notes |
|---|---|---|---|
| `height_range` | int |  | **required**. Height Range |
| `min_y` | int |  | **required**. Min Y |

### Generation (generation)

Specifies the generator type used for world generation in the dimension.

| Field | Type | Default | Notes |
|---|---|---|---|
| `generator_type` | string |  | **required**. Generator Type |

### Rules used by Jigsaw Structures to determine which blocks to modify or replace when placing a Structure Template in the world. ()

Pairs block rules with Structure Templates and randomly places Structure Templates using a weighted list.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` |  |  | **required**. Description See `world/description`. |
| `elements` |  |  | **required**. List of Structure Template and processor list pairs. See `world/templatepoolelement`. |
| `fallback` |  | `"minecraft:empty"` | Fallback template pool to use if no element in the pool can be placed successfully. |

### AlwaysTrueBlock (alwaystrueblock)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | stringEnum | `"minecraft:always_true"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |

### AlwaysTruePos (alwaystruepos)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | stringEnum | `"minecraft:always_true"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:axis_aligned_linear_pos`. |

### AnchorAboveBottom (anchorabovebottom)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `above_bottom` | int |  | **required**. Offset from anchored vertical position |

### AnchorAbsolute (anchorabsolute)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `absolute` | int |  | **required**. Offset from anchored vertical position |

### AnchorBelowTop (anchorbelowtop)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `below_top` | int |  | **required**. Offset from anchored vertical position |

### AnchorFromSea (anchorfromsea)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `from_sea` | int |  | **required**. Offset from anchored vertical position |

### AppendLoot (appendloot)

Modifier will attempt to add loot to a block entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `loot_table` | string |  | **required**. The loot table to append |
| `type` | stringEnum | `"minecraft:append_loot"` | **required**. Type Values: `minecraft:append_loot`, `minecraft:passthrough`. |

### AxisAlignedLinear (axisalignedlinear)

Predicate that evaluates to true if the block is within the distance range along the provided axis and a random number is generated between the chance range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `axis` | stringEnum | `"y"` | Axis Values: `x`, `y`, `z`. |
| `max_chance` | float | `0` | Max Chance |
| `max_dist` | int | `0` | Max Dist |
| `min_chance` | float | `0` | Min Chance |
| `min_dist` | int | `0` | Min Dist |
| `predicate_type` | stringEnum | `"minecraft:axis_aligned_linear_pos"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:axis_aligned_linear_pos`. |

### BlockIgnore (blockignore)

Specifies block types in the template that should be ignored by other processors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` | stringArray |  | **required**. List of blocks evaluated on all blocks of a Structure Template. If a block is matched in the provided list the block will be ignored for processing. |
| `processor_type` | stringEnum | `"minecraft:block_ignore"` | **required**. Jigsaw Processor Type Values: `minecraft:block_ignore`, `minecraft:capped`, `minecraft:protected_blocks`, `minecraft:rule`. |

### BlockMatch (blockmatch)

Predicate that evaluates to true if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The block to match against. |
| `predicate_type` | stringEnum | `"minecraft:block_match"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |

### BlockRules (blockrules)

Replaces and modifies blocks based on a series of rules

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | stringEnum | `"minecraft:rule"` | **required**. Jigsaw Processor Type Values: `minecraft:block_ignore`, `minecraft:capped`, `minecraft:protected_blocks`, `minecraft:rule`. |
| `rules` | objectArray |  | **required**. List of block rules evaluated on all blocks of a Structure Template. Block rules are evaluated in order. If a block rule succeeds and the output_state is set, the output_state block will be used as the input_predicate block for subsequent rules. See `world/processor_rule`. |

### BlockStateMatch (blockstatematch)

Predicate that evaluates to true if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_state` | string |  | **required**. The block state to match against. |
| `predicate_type` | stringEnum | `"minecraft:blockstate_match"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |

### Capped (capped)

Processor that wraps a processor and caps the number of times the delegated processor can be applied.

| Field | Type | Default | Notes |
|---|---|---|---|
| `delegate` | object |  | **required**. The processor that will be executed. |
| `limit` | object |  | **required**. The maximum number of times that this delegate can be applied. |
| `processor_type` | stringEnum | `"minecraft:capped"` | **required**. Jigsaw Processor Type Values: `minecraft:block_ignore`, `minecraft:capped`, `minecraft:protected_blocks`, `minecraft:rule`. |

### ConstantHeightProviderType (constantheightprovidertype)

Constant anchor point

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum | `"constant"` | **required**. Type Values: `constant`, `uniform`. |
| `value` | object |  | **required**. Constant anchor point |

### ConstantIntProvider (constantintprovider)

Specifies a constant integer

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum | `"constant"` | **required**. Type Values: `constant`, `uniform`. |
| `value` | int |  | **required**. Constant value |

### Description (description)

Defines the identifier for a template pool used by Jigsaw Structures.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | object |  | **required**. Identifier of the template pool. Used by Jigsaw Structures to assign processors to Structure Templates. |

### DimensionPaddingRange (dimensionpaddingrange)

Specifies the padding for the top and bottom of the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `bottom` | int | `0` | The padding from the bottom of the world |
| `top` | int | `0` | The padding from the top of the world |

### DirectPoolAlias (directpoolalias)

Pool alias for a Direct target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Direct pool |
| `target` | string |  | **required**. Target pool |

### EmptyPoolElement (emptypoolelement)

Defines an empty pool element type for Jigsaw Structures.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | stringEnum | `"minecraft:empty_pool_element"` | **required**. The type of element Values: `minecraft:empty_pool_element`, `minecraft:feature_pool_element`, `minecraft:single_pool_element`. |

### Feature Rule Conditions (feature_rule_conditions)

Defines conditions for feature placement including biome filters and placement pass.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:biome_filter` | object |  | List of filter tests to determine which biomes this rule will attach to. |
| `placement_pass` | string |  | **required**. When the feature should be placed relative to others. Earlier passes in the list are guaranteed to occur before later passes. Order is not guaranteed within each pass. |

### Feature Rule Definition (feature_rule_definition)

Defines a feature rule with conditions, description, and distribution parameters.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditions` | object |  | **required**. Parameters to control where and when the feature will be placed. See `world/feature_rule_conditions`. |
| `description` | object |  | **required**. Identifier for the Feature Rule and Feature to place. See `world/feature_rule_description`. |
| `distribution` | object |  | Parameters controlling the initial scatter of the feature. See `world/scatter_params`. |

### Feature Rule Description (feature_rule_description)

Defines the identifier and feature reference for a feature rule.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. The name of this feature rule in the format 'namespace_name:rule_name'. 'rule_name' must match the filename. |
| `places_feature` | string |  | **required**. Named reference to the feature controlled by this rule. |

### FeaturePoolElement (featurepoolelement)

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | stringEnum | `"minecraft:feature_pool_element"` | **required**. The type of element. Values: `minecraft:empty_pool_element`, `minecraft:feature_pool_element`, `minecraft:single_pool_element`. |
| `feature` | string |  | **required**. The identifier of the feature to place. |

### Filter Group Map (filter_group_map)

Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `AND` | object |  | Evaluates all tests in the group, all must pass in order for the group to pass. |
| `NOT` | object |  | Evaluates all tests in the group, all must fail in order for the group to pass. |
| `OR` | object |  | Evaluates tests in the group, one or more must pass in order for the group to pass. |
| `all` | object |  | Evaluates all tests in the group, all must pass in order for the group to pass. |
| `all_of` | object |  | Evaluates all tests in the group, all must pass in order for the group to pass. |
| `any` | object |  | Evaluates tests in the group, one or more must pass in order for the group to pass. |
| `any_of` | object |  | Evaluates tests in the group, one or more must pass in order for the group to pass. |
| `none_of` | object |  | Evaluates all tests in the group, all must fail in order for the group to pass. |

### Filter Test (filter_test)

Defines a filter test with domain, operator, subject, and value comparisons.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | The domain the test should be performed in. |
| `operator` | string |  | The comparison to apply with 'value'. |
| `subject` | string |  | The subject of this filter test. |
| `test` | string |  | **required**. The name of the test to apply. |
| `value` | int |  | The value being compared with the test. |

### Jigsaw Structure Set Description (jigsaw_structure_set_description)

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier of the Jigsaw Structure Set. |

### Jigsaw Template Pool Description (jigsaw_template_pool_description)

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier of the template pool. Used by Jigsaw Structures to assign processors to Structure Templates. |

### JigsawDescriptionIdentifier (jigsawdescriptionidentifier)

Identifier of the Jigsaw Structure.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |

### JigsawStructure (jigsawstructure)

A Jigsaw Structure is a group of Structure Templates that make up a larger structure. Jigsaw Structures are placed during world generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome_filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Biomes in which the Jigsaw Structure can generate. |
| `description` | object |  | **required**. Identifier of the Jigsaw Structure. See `world/jigsawdescriptionidentifier`. |
| `dimension_padding` | object |  | Dimension padding prevents the structure from getting cut off at the top or bottom of the world. |
| `heightmap_projection` | stringEnum | `"none"` | Heightmap used to calculate the relative start height. For example, a heightmap_projection of ocean_floor and a start_height of 10 means the Jigsaw Structure will begin generating 10 blocks above the ocean floor. Defaults to 'none' Values: `none`, `ocean_floor`, `world_surface`. |
| `liquid_settings` | stringEnum | `"apply_waterlogging"` | How to handle waterloggable blocks overlapping with existing liquid. Values: `apply_waterlogging`, `ignore_waterlogging`. |
| `max_depth` | int |  | **required**. The maximum recursion depth for Jigsaw Structure Generation. For example, a Jigsaw Structure that builds a road with a max_depth of 5 will only have paths that are a maximum of 5 structures templates in length in any given direction from the origin. |
| `max_distance_from_center` | int | `{"horizontal":80,"vertical":2147483647}` | The max distances on the horizontal plane and optionally the vertical axis from the jigsaw pieces to the structure start. |
| `pool_aliases` | stringArray | `[]` | Pool Aliases are used to determine which template pool can be a substitute. |
| `start_height` | object |  | **required**. Height at which the Jigsaw Structure's start pool should begin. |
| `start_jigsaw_name` | string | `""` | The start jigsaw name is the name of the jigsaw block from the start pool to be placed first. |
| `start_pool` | string |  | **required**. The first Template Pool to use when generating the Jigsaw Structure. |
| `step` | stringEnum |  | **required**. Species the world generation phase in which the structure is generated. Values: `fluid_springs`, `lakes`, `local_modifications`, `raw_generation`, `strongholds`, `surface_structures`, `top_layer_modification`, `underground_decoration`, `underground_ores`, `underground_structures`, `vegetal_decoration`. |
| `terrain_adaptation` | stringEnum | `"none"` | How the terrain should adapt relative to the generated Jigsaw Structure. Values: `beard_box`, `beard_thin`, `bury`, `encapsulate`, `none`. |

### JigsawTemplatePool (jigsawtemplatepool)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` | string |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### mcworld_properties (mcworld_properties)

Defines world properties including spawn location, difficulty, and game type.

| Field | Type | Default | Notes |
|---|---|---|---|
| `spawnX` | int |  | Spawn X |
| `spawnY` | int |  | Spawn Y |
| `spawnZ` | int |  | Spawn Z |
| `difficulty` | int |  | Difficulty |
| `generator` | int |  | Generator |
| `gameType` | int |  | Game Type |
| `isEditor` | boolean |  | Editor World |

### Molang expression (molang_expression)

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | **required**. Expression |
| `version` | int |  | **required**. Version |

### Passthrough (passthrough)

Modifier that leaves the state unchanged. This is the default block modifier if no other block modifier is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum | `"minecraft:passthrough"` | **required**. Type Values: `minecraft:append_loot`, `minecraft:passthrough`. |

### Processor List Description (processor_list_description)

Defines the identifier for a Processor List referenced by Template Pools.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier of the Processor List. This is referenced by Template Pools when pairing processors with Structure Templates. |

### Processor Rule (processor_rule)

A block rule that is evaluated on all blocks of a Structure Template. All predicates must evaluate to true in order for a block to be replaced by the output_state.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_entity_modifier` | object |  | A block state modifier for block entities when all predicate match. |
| `input_predicate` | object | `{"predicate_type":"minecraft:always_true"}` | A predicate evaluated on the Structure Template block. |
| `location_predicate` | object | `{"predicate_type":"minecraft:always_true"}` | A predicate evaluated on the world block. |
| `output_state` | string |  | **required**. Block to replace the world block with if all predicates evaluate to true. |
| `position_predicate` | object |  | A predicate evaluated on the distance between the structure's world origin and the world block. |

### Protected Block (protected_block)

Protect blocks from this structure's placement in the world. Ensuring that it does not replace matching blocks in the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | stringEnum | `"minecraft:protected_blocks"` | **required**. Jigsaw Processor Type Values: `minecraft:block_ignore`, `minecraft:capped`, `minecraft:protected_blocks`, `minecraft:rule`. |
| `value` | string |  | **required**. Block tag for the blocks that will be protected |

### RandomBlockMatch (randomblockmatch)

Predicate that evaluates to true with a given probability if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The block to match against. |
| `predicate_type` | stringEnum | `"minecraft:random_block_match"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |
| `probability` | float |  | **required**. Probability of the evaluating to true when the block matches. |

### RandomBlockStateMatch (randomblockstatematch)

Predicate that evaluates to true with a given probability if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_state` | string |  | **required**. The block state to match against. |
| `predicate_type` | stringEnum | `"minecraft:random_blockstate_match"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |
| `probability` | float |  | **required**. Probability of the evaluating to true when the block matches. |

### RandomGroupBindings (randomgroupbindings)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` | stringArray |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### RandomGroupPoolAlias (randomgrouppoolalias)

Pool alias for a RandomGroup of aliases

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` | objectArray |  | **required**. Aliases for a RandomGroup See `world/randomgroupbindings`. |

### RandomPoolAlias (randompoolalias)

Pool alias for a Random list of targets

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Random Pool |
| `targets` | objectArray |  | **required**. List of potential pools See `world/jigsawtemplatepool`. |

### RandomSpreadPlacement (randomspreadplacement)

Defines random spread placement parameters for structure generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `salt` | int |  | **required**. Seed used for the random generator to provide a unique scatter pattern. This is used to prevent overlap in the case where multiple structure sets use the same placement values. |
| `separation` | int |  | **required**. Padding (in chunks) within each grid cell. Structures will not generate within the padded area. |
| `spacing` | int |  | **required**. Grid cell size (in chunks) to use when generating the structure. Structures will attempt to generate at a random position within each cell. |
| `spread_type` | stringEnum | `"linear"` | Randomness algorithm used when placing structures. Values: `linear`, `triangular`. |
| `type` | stringEnum |  | **required**. Type of placement for the Jigsaw Structure Set. Values: `minecraft:random_spread`. |

### Scatter Params (scatter_params)

Controls the scatter distribution of a particular object.

| Field | Type | Default | Notes |
|---|---|---|---|
| `coordinate_eval_order` | stringEnum | `"xzy"` | The order in which coordinates will be evaluated. Should be used when a coordinate depends on another. If omitted, defaults to "xzy". Supported orders are defined by "Coordinate Evaluation Order". Values: `xyz`, `xzy`, `yxz`, `yzx`, `zxy`, `zyx`. |
| `iterations` | keyedStringCollection |  | **required**. Number of scattered positions to generate. |
| `scatter_chance` | keyedStringCollection |  | Probability that this scatter will occur. Not evaluated each iteration; either no iterations will run, or all will. |
| `x` | keyedStringCollection |  | **required**. Distribution for the coordinate (evaluated each iteration). |
| `y` | keyedStringCollection |  | **required**. Distribution for the coordinate (evaluated each iteration). |
| `z` | keyedStringCollection |  | **required**. Distribution for the coordinate (evaluated each iteration). |

### SinglePoolElement (singlepoolelement)

Defines a single pool element with a structure location and processors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | stringEnum | `"minecraft:single_pool_element"` | **required**. The type of element. Values: `minecraft:empty_pool_element`, `minecraft:feature_pool_element`, `minecraft:single_pool_element`. |
| `location` | string |  | **required**. The path of the structure file. This path is relative to the behavior pack's structures folder. |
| `processors` | string | `""` | The identifier of the processor list to use when placing the structure. |
| `projection` | stringEnum | `"rigid"` | Specifies how structures should be placed relative to the terrain. Values: `rigid`, `terrain_matching`. |

### ure (structure)

Defines a weighted structure reference for Jigsaw Structure sets.

| Field | Type | Default | Notes |
|---|---|---|---|
| `structure` | string |  | **required**. Identifier of the Jigsaw Structure. |
| `weight` | int |  | **required**. Weight of the Jigsaw Structure in the set. Higher weights are more likely to be selected. |

### TagMatch (tagmatch)

Predicate that evaluates to true if the block at the specified location contains the tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | stringEnum | `"minecraft:tag_match"` | **required**. Predicate Type Values: `minecraft:always_true`, `minecraft:block_match`, `minecraft:blockstate_match`, `minecraft:random_block_match`, `minecraft:random_blockstate_match`, `minecraft:tag_match`. |
| `tag` | string |  | **required**. The tag to be matched |

### TemplatePoolElement (templatepoolelement)

Defines a weighted template pool element with structure and processor references.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element` | object |  | **required**. A grouping of a Structure Template, the Processor List to use when placing the structure, and its weight that determines the likelihood of the element being chosen. |
| `weight` | int | `1` | The weighted probability of choosing the element from the pool. For example, a template pool containing 2 structures with weights of 1 and 3 will have a 25% and 75% chance of being chosen respectively. |

### UniformHeightProviderType (uniformheightprovidertype)

Uniform distribution of possible anchor points

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | object |  | **required**. Max value of the uniform distribution |
| `min` | object |  | **required**. Min value of the uniform distribution |
| `type` | stringEnum | `"uniform"` | **required**. Type Values: `constant`, `uniform`. |

### UniformIntProvider (uniformintprovider)

Specifies a uniformly distributed integer

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_inclusive` | int |  | **required**. Maximum value (inclusive) |
| `min_inclusive` | int |  | **required**. Minimum value (inclusive) |
| `type` | stringEnum | `"uniform"` | **required**. Type Values: `constant`, `uniform`. |

### VerticalAnchorType (verticalanchortype)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `from_sea` | int |  | **required**. Offset from anchored vertical position |

### WeightedRandomItem (weightedrandomitem)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` |  |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |

### world_packs (world_packs)

The world_behavior_packs.json and world_resource_packs.json files define which add-on packs are active for a world. Located in the root of a world folder.

> This file is a JSON array at the root level. Each element is a pack registration with pack_id (UUID) and version (array of integers). The world_behavior_packs.json file lists behavior packs, while world_resource_packs.json lists resource packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `packs` | stringArray |  | An array of pack registrations defining which packs are active. |

Example (example):
```json
[
 {
  "pack_id": "12345678-1234-1234-1234-123456789abc",
  "version": [
   1,
   0,
   0
  ]
 }
]
```
