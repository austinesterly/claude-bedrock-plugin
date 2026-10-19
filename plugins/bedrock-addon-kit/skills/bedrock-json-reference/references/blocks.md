# Block components

Generated 2026-10-19 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/block). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (37)

`minecraft:block_light_absorption`, `minecraft:block_light_emission`, `minecraft:breathability`, `minecraft:chest_obstruction`, `minecraft:collision_box`, `minecraft:connection_rule`, `minecraft:crafting_table`, `minecraft:custom_components`, `minecraft:destroy_time`, `minecraft:destructible_by_explosion`, `minecraft:destructible_by_mining`, `minecraft:display_name`, `minecraft:embedded_visual`, `minecraft:entity_fall_on`, `minecraft:explosion_resistance`, `minecraft:flammable`, `minecraft:flower_pottable`, `minecraft:friction`, `minecraft:geometry`, `minecraft:instrument_sound`, `minecraft:light_dampening`, `minecraft:light_emission`, `minecraft:loot`, `minecraft:map_color`, `minecraft:material_instances`, `minecraft:movable`, `minecraft:precipitation_interactions`, `minecraft:queued_ticking`, `minecraft:random_offset`, `minecraft:random_ticking`, `minecraft:redstone_consumer`, `minecraft:redstone_producer`, `minecraft:replaceable`, `minecraft:selection_box`, `minecraft:support`, `minecraft:tick`, `minecraft:unit_cube`

### minecraft:block_light_absorption

Legacy component (format_version < 1.19.40). The amount light is dampened when passing through this block (0-15). Use minecraft:light_dampening in newer format versions.

### minecraft:block_light_emission

Legacy component (format_version < 1.19.40). The amount of light this block emits (0-15). Use minecraft:light_emission in newer format versions.

### minecraft:breathability

_**deprecated**_

Determines whether the block is breathable by defining if the block is treated as a `solid` or as `air`. The default is `solid` if this component is omitted.

### minecraft:chest_obstruction

_since 1.26.10_

This defines how a block reacts to a chest being opened underneath it.

> Added in 1.26.10 behind the Upcoming Creator Features experiment and released without the experimental toggle for block format versions 1.26.20 and newer. Controls how a block placed above a chest affects the chest's ability to open: `always` always obstructs, `never` never obstructs, and `shape` (the default) uses the block's AABB.

| Field | Type | Default | Notes |
|---|---|---|---|
| `obstruction_rule` | stringEnum | `"shape"` | Obstruction Rule Values: `always`, `never`, `shape`. |

### minecraft:collision_box

_since 1.19.50_

Defines the area of the block that collides with entities. If set to true, default values are used (a full 16x16x16 block). If set to false, the block's collision with entities is disabled, allowing entities to pass through. If this component is omitted, default values are used.

> Released from the Holiday Creator Features experiment in 1.19.50. Pairs with the custom geometry component so creators can author bespoke collision shapes.

> Supports an array of collision boxes (for multi-part collision shapes) and a maximum collision box height of 24 units (up from 16). Available without the Upcoming Creator Features experiment and without the format_version 1.21.130 requirement starting in 1.26.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | point3 | `[16,24,16]` | Maximum position of the bounds of the collision box. "max" is specified as [x, y, z] and must be in the range (0, 0, 0) to (16, 24, 16), inclusive. |
| `min` | point3 | `[0,0,0]` | Minimal position of the bounds of the collision box. "min" is specified as [x, y, z] and must be in the range (0, 0, 0) to (16, 24, 16), inclusive. |

Example (JSON (object)):
```json
{
 "origin": [
  -8,
  0,
  -8
 ],
 "size": [
  16,
  16,
  16
 ]
}
```

### minecraft:connection_rule

_since 1.21.130_

Defines whether other blocks such as fences, walls, bars, and glass panes are allowed to connect to this block.

> Lets a custom block control whether other blocks with connection behavior (fences, walls, bars, glass panes) may visually connect to it. Released alongside the new `minecraft:has_fence_connections` VanillaBlockTag.

> Available without the Upcoming Creator Features experimental toggle for block format versions 1.26.0 or higher.

| Field | Type | Default | Notes |
|---|---|---|---|
| `accepts_connections_from` | stringEnum | `"all"` | The type of block allowed to connect to this block. Note that the "only_fences" option allows connections from all Vanilla fences excluding NetherBrick. Values: `all`, `none`, `only_fences`. |
| `enabled_directions` | stringArray | `["south","north","east","west"]` | The cardinal directions that connection is enabled for. Note that if "none" is specified for "accepts_connections_from", this field will not be used. Values: `east`, `north`, `south`, `west`. |

### minecraft:crafting_table

_since 1.19.50_

Makes your block into a custom crafting table which enables the crafting table UI and the ability to craft recipes.

> Released from the Holiday Creator Features experiment in 1.19.50.

| Field | Type | Default | Notes |
|---|---|---|---|
| `crafting_tags` | stringArray |  | **required**. Defines the tags recipes should define to be crafted on this table. Limited to 64 tags. Each tag is limited to 64 characters. |
| `table_name` | string | `""` | Specifies the language file key that maps to what text will be displayed in the UI of this table. If the string given can not be resolved as a loc string, the raw string given will be displayed. If this field is omitted, the name displayed will default to the… |

Example (Crafting Table):
```json
{
 "crafting_tags": [
  "crafting_table",
  "custom_crafting_tag"
 ],
 "table_name": "My Crafting Table"
}
```

### minecraft:custom_components

_**deprecated**_

Sets an ordered list of custom component names which are bound in script to be executed upon a block event.

> See the [Scripting 2.0.0 Overview](https://learn.microsoft.com/minecraft/creator/documents/scriptingv2.0.0overview) article for an overview of upcoming changes to custom components functionality.

Example (https://github.com/microsoft/minecraft-samples/tree/main/lucky_block/version_1/behavior_packs/mike_luck/blocks/luckyblock.json):
```json
[
 "mike_luck:luckyblock_actions"
]
```

### minecraft:destroy_time

Legacy component (format_version < 1.19.40). Time in seconds to destroy the block with base equipment. Use minecraft:destructible_by_mining in newer format versions.

### minecraft:destructible_by_explosion

Describes the destructible by explosion properties for this block. If set to true, the block will have the default explosion resistance. If set to false, this block is indestructible by explosion. If the component is omitted, the block will have the default explosion resistance.

| Field | Type | Default | Notes |
|---|---|---|---|
| `explosion_resistance` | float | `0` | Sets the explosion resistance for the block. Greater values result in greater resistance to explosions. The scale will be different for different explosion power levels. A value of 0 means it will easily explode; larger numbers increase level of resistance. |

Example (Boolean):
```json
true
```

### minecraft:destructible_by_mining

_since 1.21.50_

Describes the destructible by mining properties for this block. If set to true, the block will take the default number of seconds to destroy. If set to false, this block is indestructible by mining. If the component is omitted, the block will take the default number of seconds to destroy.

| Field | Type | Default | Notes |
|---|---|---|---|
| `item_specific_speeds` | objectArray |  | Optional array of objects to describe item specific block destroy speeds, each object contains an 'item' ItemDescriptor and a 'destroy_speed' float. This array currently requires UpcomingFeatures experiment to be enabled. |
| `seconds_to_destroy` | float | `0` | Sets the number of seconds it takes to destroy the block with base equipment. Greater numbers result in greater mining times. |

Example (JSON Object (Item Tags)):
```json
{
 "seconds_to_destroy": 10,
 "item_specific_speeds": [
  {
   "item": {
    "tags": "q.any_tag('minecraft:is_pickaxe', 'my_pack:custom_tool') "
   },
   "destroy_speed": 5
  }
 ]
}
```

### minecraft:display_name

_since 1.19.60_

Specifies the language file key that maps to what text will be displayed when you hover over the block in your inventory and hotbar. If the string given can not be resolved as a loc string, the raw string given will be displayed. If this component is omitted, the name of the block will be used as the display name.

Example (https://github.com/microsoft/minecraft-samples/tree/main/chill_oasis_blocks_and_features/chill_oasis_assets/behavior_packs/chill_oasis_assets/blocks/white_sand.block.json):
```json
"White Sand"
```

### minecraft:embedded_visual

_since 1.21.120_

The description identifier of the geometry and material used to render this block when it it is embedded inside of another block (for example, a flower inside of a flower pot).

| Field | Type | Default | Notes |
|---|---|---|---|
| `geometry` | objectArray |  | **required**. The "minecraft:geometry" component that will be used when rendered inside of another block. |
| `material_instances` | objectArray |  | **required**. The "minecraft:material_instances" component that will be used when rendered inside of another block. |

### minecraft:entity_fall_on

Configures what distance an entity must fall onto this block to cause the `onEntityFallOn` block custom component event to be sent to script. Custom components subscribed to the `onEntityFallOn` event on a block without the `minecraft:entity_fall_on` component use the default fall distance of 1 block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `min_fall_distance` | float | `0` | The minimum distance in blocks that an actor needs to fall before events are triggered. |
| `minimum_fall_distance` | float | `1` | The minimum distance in blocks that an entity needs to fall before events are raised. |

Example (default):
```json
{
 "minimum_fall_distance": 2
}
```

### minecraft:explosion_resistance

Legacy component (format_version < 1.19.40). The block's resistance to explosions. Use minecraft:destructible_by_explosion in newer format versions.

### minecraft:flammable

Describes the flammable properties for this block. If set to true, default values are used (catch: 5, destroy: 20). Note that the default value of lava_flammable is false for backwards compatibility. If set to false, or if this component is omitted, the block will not be able to catch on fire naturally from neighbors, but it can still be directly ignited.

| Field | Type | Default | Notes |
|---|---|---|---|
| `catch_chance_modifier` | int | `5` | A modifier affecting the chance that this block will catch flame when next to a fire. Values are greater than or equal to 0, with a higher number meaning more likely to catch on fire. For a "catch_chance_modifier" greater than 0, the fire will continue to bur… |
| `destroy_chance_modifier` | int | `20` | A modifier affecting the chance that this block will be destroyed by flames when on fire. Values are greater than or equal to 0, with a higher number meaning more likely to be destroyed by fire. For a "destroy_chance_modifier" of 0, the block will never be de… |
| `lava_flammable` | boolean | `false` | since 1.26.30. Whether the block can be ignited by adjacent lava. Defaults to false for backwards compatibility; set to true to allow lava to set the block on fire the way it does Planks and other vanilla flammable blocks. |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
{
 "destroy_chance_modifier": 20,
 "catch_chance_modifier": 5
}
```

### minecraft:flower_pottable

_since 1.21.120_

When added to a block type, indicates that this block can be placed inside a flower pot.

> In format version 1.26.20, validation enforces that `minecraft:flower_pottable` may only appear in the root `components` object; placing it under `permutations` is rejected.

### minecraft:friction

Describes the friction for this block in a range of 0.0 to 0.9. Friction affects an entity's movement speed when it travels on the block. Higher values result in more friction (less sliding). The default value is 0.4, which is used by most blocks. Ice uses 0.02 for its slippery surface.

Example (https://github.com/microsoft/minecraft-samples/tree/main/chill_oasis_blocks_and_features/chill_oasis_assets/behavior_packs/chill_oasis_assets/blocks/palm_leave.block.json):
```json
0.38
```

### minecraft:geometry

_since 1.19.40_

The description identifier of the geometry to use to render this block. This identifier must either match an existing geometry identifier in any of the loaded resource packs or be one of the currently supported Vanilla identifiers: "minecraft:geometry.full_block" or "minecraft:geometry.cross".

> From 1.21.80 onward, when using a minecraft:geometry component or minecraft:material_instances component, you must include both.

> In format_version 1.26.0 and higher, the `minecraft:geometry.full_block` identifier renders its DOWN face rotated 180° to match non-data-driven full blocks and Java Edition. The new `minecraft:geometry.full_block_v1` identifier preserves the original orientation. Blocks using `full_block` with format_version older than 1.26.0 continue to render unchanged.

> Fixed in 1.26.10: rotation for blocks displayed in item frames using `minecraft:geometry.full_block` is now correct for `format_version` >= 1.26.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `bone_visibility` | keyedBooleanCollection |  | since 1.19.80. An optional list of true/false values that define the visibility of individual bones in the geometry file. |
| `culling` | string |  | since 1.20.60. An optional identifer of a culling definition. The culling definition is used to determine which faces of the block should be culled when rendering. The culling definition can be used to optimize rendering performance by reducing the number of faces that need… |
| `culling_layer` | string | `"minecraft:culling_layer.undefined"` | [Experimental] - A string that allows culling rule to group multiple blocks together when comparing them. When using the minecraft namespace, the only allowed culling layer identifiers are : "minecraft:culling_layer.undefined" or "minecraft:culling_layer.leav… |
| `culling_shape` | string | `"minecraft:empty"` | since 1.26.30. The voxel shape used for culling adjacent block faces. Voxel shapes work together with culling rules and will not function if there is no culling rule defined for the block. Only adjacent blocks with voxel shapes will occlude using this shape. Blocks using "m… |
| `identifier` | string |  | Specifies the geometry description identifier to use to render this block. |
| `uv_lock` | string |  | since 1.21.100. A Boolean locking UV orientation of all bones in the geometry, or an array of strings locking UV orientation of specific bones in the geometry. For performance reasons it is recommended to use the Boolean. Note that for cubes using Box UVs, rather than Per-fa… |
| `n_way_visual_rotation` | string |  | since 1.26.30. The name of a block state that drives visual-only rotation of this block. The renderer reads the current value of the named state at runtime and rotates the geometry accordingly without changing collision or interaction. Supported states are `minecraft:cardin… |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
"geometry.mikeamm_gwve_fabricator"
```

### minecraft:instrument_sound

_**experimental (Upcoming Creator Features)**_

[Note: This component is currently experimental]. This defines what sound will play based on above or below relative position to a note block. An instrument can be assigned to the "up" and "down" block faces. If either face is undefined, or the component is omitted, it will use its default value ("up" = "note.harp" and "down" = "note.none"). While both faces do not need to be defined, at least one face needs to be defined for the component to be valid. "note.none" can be used to specify no sound for a face.

| Field | Type | Default | Notes |
|---|---|---|---|
| `up` | stringEnum | `"note.harp"` | The instrument sound that plays when the note block is below this block (the block's up face is exposed to the note block). Use "note.none" to specify no sound for this face. |
| `down` | stringEnum | `"note.none"` | The instrument sound that plays when the note block is above this block (the block's down face is exposed to the note block). Use "note.none" to specify no sound for this face. |

Example (default):
```json
{
 "up": "note.bassattack",
 "down": "note.bit"
}
```

### minecraft:light_dampening

The amount that light will be dampened when it passes through the block, in a range of 0-15. Higher value means the light will be dampened more. A value of 15 means fully opaque (like stone), while 0 means fully transparent (like glass). Leaves use 1, water uses 2.

> In format version 1.26.20, validation strictly enforces that the value must be an integer between 0 and 15 inclusive; out-of-range values are rejected at load time.

### minecraft:light_emission

The amount of light this block will emit in a range of 0-15. Higher value means more light will be emitted. Reference values: torch (14), glowstone (15), redstone torch (7), soul torch (10). Monsters cannot spawn on blocks with light level 8 or higher.

> In format version 1.26.20, validation strictly enforces that the value must be an integer between 0 and 15 inclusive; out-of-range values are rejected at load time.

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
7
```

### minecraft:loot

Specifies the path to the loot table that determines what items are dropped when the block is destroyed. The path is relative to the behavior pack's root folder (e.g., 'loot_tables/blocks/my_block.json'). Path string is limited to 256 characters. If this component is omitted, the block drops itself.

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
"loot_tables/mikeamm/gray_wave/fabricator.loot.json"
```

### minecraft:map_color

Sets the color of the block when rendered to a map. If this component is omitted, the block will not show up on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | string |  | The color is represented as a hex value in the format "#RRGGBB". May also be expressed as an array of [R, G, B] from 0 to 255. |
| `tint_method` | string |  | since 1.21.80. Tint multiplier applied to the map color. Typically references the biome's "rain" and "temperature" to compute the tint. Supported values: "none", "default_foliage", "birch_foliage", "evergreen_foliage", "dry_foliage", "grass", "water". |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
"#5f4a2b"
```

### minecraft:material_instances

_since 1.19.40_

The material instances for a block. Maps face or material_instance names in a geometry file to an actual material instance. Material instance can either be a full material instance or a name to another already defined instance. Limited to 64 instances.

> From 1.21.80 onward, when using a minecraft:geometry component or minecraft:material_instances component, you must include both.

> In format version 1.26.20, `ambient_occlusion` no longer accepts boolean values — it must be a float between 0.0 and 10.0 inclusive, and defaults to 1.0 when omitted.

| Field | Type | Default | Notes |
|---|---|---|---|
| `*` | object |  | Default settings for all faces (*) See `block/materialinstanceface`. |
| `north` | object |  | North See `block/materialinstanceface`. |
| `south` | object |  | South See `block/materialinstanceface`. |
| `east` | object |  | East See `block/materialinstanceface`. |
| `west` | object |  | West See `block/materialinstanceface`. |
| `up` | object |  | Up See `block/materialinstanceface`. |
| `down` | object |  | Down See `block/materialinstanceface`. |
| `Material Instance` | object |  | removed. <Example Custom Material Instance> See `block/materialinstanceface`. |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
{
 "*": {
  "texture": "mikeamm_gwve_fabricator",
  "render_method": "alpha_test",
  "ambient_occlusion": 1
 }
}
```

### minecraft:movable

_since 1.21.100_

Defines whether the block can be pushed or pulled by a piston. Use movement_type to declare the block as push_pull, push, popped, or immovable; use sticky to opt into same-block grouping similar to slime blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `movement_type` | stringEnum |  | **required**. How the block reacts to being pushed by another block like a piston. The options are: "push_pull" - The default value for this field. The block will be pushed and pulled by a piston. "push" - The block will only be pulled by a piston and will ignore a sticky … Values: `immovable`, `popped`, `push`, `push_pull`. |
| `sticky` | stringEnum | `"none"` | How the block should handle adjacent blocks around it when being pushed by another block like a piston. The options are: "same" - Adjacent blocks to this block will be moved when moved. This excludes other blocks with the "same" property. This will only work … Values: `none`, `same`. |

### minecraft:precipitation_interactions

_since 1.21.120_

Determines interactions the block will have with different precipitations. Three possible values: obrain, obstruct_rain_accumulate_snow and none

> In format version 1.26.30, the `snow_log_no_collision` value for `precipitation_behavior` was renamed to `snowlogging` (the legacy value still parses but is deprecated). Snow logging itself requires `format_version` 1.21.120 or newer.

> The `snow_log_no_collision` value for `precipitation_behavior` (which lets custom blocks be covered by snow) was first added in 1.26.20 under the Upcoming Creator Features experiment, then renamed to `snowlogging` in 1.26.30.

| Field | Type | Default | Notes |
|---|---|---|---|
| `precipitation_behavior` | stringEnum |  | **required**. What behavior should the block have. Possible values: obrain, obstruct_rain_accumulate_snow, snowlogging, and none Values: `none`, `obstruct_rain`, `obstruct_rain_accumulate_snow`, `snowlogging`. |

### minecraft:queued_ticking

_**deprecated**_

Triggers the specified event, either once, or at a regular interval equal to a number of ticks randomly chosen from the interval_range provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `interval_range` | stringArray |  | A range of values, specified in ticks, that will be used to decide the interval between times this event triggers. Each interval will be chosen randomly from the range, so the times between this event triggering will differ given an interval_range of two diff… |
| `looping` | boolean | `true` | Does the event loop? If false, the event will only be triggered once, after a delay equal to a number of ticks randomly chosen from the interval_range. If true, the event will loop, and each interval between events will be equal to a number of ticks randomly … |
| `on_tick` | minecraftEventTrigger |  | The event that will be triggered once or on an interval. |

### minecraft:random_offset

_since 1.21.100_

This component defines a random offset for the block, seeded based on the block's position and the specified range and steps. It affects the block's rendered position, outline, and collision. If the random offset causes the collision box to extend beyond the bounds of a cube, the offset range will automatically adjust to keep the collision box within the cube. Culling for this block is performed without considering the random offset.

| Field | Type | Default | Notes |
|---|---|---|---|
| `x` | object | `{"range":{"max":0,"min":0},"steps":0}` | X coordinate See `block/offset_range`. |
| `y` | object | `{"range":{"max":0,"min":0},"steps":0}` | Y coordinate See `block/offset_range`. |
| `z` | object | `{"range":{"max":0,"min":0},"steps":0}` | Z coordinate See `block/offset_range`. |

### minecraft:random_ticking

_**deprecated**_

Triggers the specified event randomly based on the random tick speed gamerule. The random tick speed determines how often blocks are updated. Some other examples of game mechanics that use random ticking are crop growth and fire spreading.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_tick` | minecraftEventTrigger |  | The event that will be triggered on random ticks. |

### minecraft:redstone_consumer

_since 1.21.130_

A component describing how a block can consume and potentially propagate a redstone signal. This component is not available for block permutations.

> Lets a custom block consume and optionally propagate a redstone signal. Pairs with the `BlockComponentRedstoneUpdateEvent` script API for custom redstone behavior. Not available on block permutations.

> Available without the Upcoming Creator Features experimental toggle for block format versions 1.26.0 or higher. In 1.26.0 the field was renamed from the original `propogates_power` spelling to `propagates_power`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `min_power` | int | `0` | Optional minimum value for incoming signal strength. If signal strength is greater than or equal to this value then the 'onRedstoneUpdate' event is sent to Scripts. Defaults to 0 meaning event is always emitted. |
| `propagates_power` | boolean | `false` | Optional Boolean to control whether a signal can pass through this block or not, defaults to false. |

### minecraft:redstone_producer

_since 1.21.120_

If added to a block, indicates that it produces a redstone signal.

| Field | Type | Default | Notes |
|---|---|---|---|
| `connected_faces` | stringEnum | `["down","up","north","south","west","east"]` | The list of faces that are considered connected to the circuit. If a face is not connected, it will not provide power to the block touching that face. By default, all faces are connected. Values: `north`, `east`, `south`, `west`, `up`, `down`. |
| `power` | int |  | **required**. The strength of the redstone signal produced by this block. Valid values are from 0 to 15, where 0 means no signal and 15 is the maximum signal strength. |
| `strongly_powered_face` | string |  | The block touching this face will become strongly powered with the signal level strength of 'power'. Strongly powered blocks will power adjacent blocks. By default, the block will not strongly power any face. Values: `down`, `east`, `north`, `south`, `up`, `west`. |
| `transform_relative` | boolean | `false` | If true, the `strongly_powered_face` and `connected_faces` properties will be rotated according to the 'minecraft:transformation' component. |

### minecraft:replaceable

_since 1.21.70_

A block with this component can be replaced when another block is placed in the same block position. Experimental toggles required: Upcoming Creator Features (in format versions before 1.21.60)

Example (/minecraft:block/components/minecraft:replaceable/):
```json
{}
```

### minecraft:selection_box

_since 1.19.60_

Defines the area of the block that is selected by the player's cursor (the outline shown when looking at the block). If set to true, default values are used (a full 16x16x16 block). If set to false, this block is not selectable by the player's cursor. If this component is omitted, default values are used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `origin` | point3 | `[-8,0,-8]` | Minimal position of the bounds of the selection box. "origin" is specified as [x, y, z] and must be in the range (-8, 0, -8) to (8, 16, 8), inclusive. |
| `size` | point3 | `[16,16,16]` | Size of each side of the selection box. Size is specified as [x, y, z]. "origin" + "size" must be in the range (-8, 0, -8) to (8, 16, 8), inclusive. |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
true
```

### minecraft:support

_since 1.21.130_

Defines the support shape of the block. Currently only allows for blocks to have the same shape as a Vanilla fence and Vanilla stair. To work with custom stairs, requires the use of "minecraft:vertical_half" and "minecraft:cardinal_direction" or "minecraft:facing_direction" which can be set through the "minecraft:placement_direction" block trait. Custom blocks without this component will default to unit cube support. The type of support shape for this block. Currently, the options are: "fence" and "stair".

> Defines how this block provides structural support. Currently accepts shape `fence` or `stair`. Pair with the `minecraft:placement_direction` trait (and `minecraft:vertical_half`) for custom stair-shaped supports.

> Available without the Upcoming Creator Features experimental toggle for block format versions 1.26.0 or higher.

| Field | Type | Default | Notes |
|---|---|---|---|
| `shape` | stringEnum |  | **required**. Required field. The type of support shape for this block. Values: `fence`, `stair`. |

### minecraft:tick

Causes the block to tick based on a regular interval equal to a number of ticks randomly chosen from the internal_range parameter. This ticking will send the onTick event to blocks with custom components subscribed for the event. Custom components listening to the onTick event that are added to a block that does not have the minecraft:tick component will cause a content error.

| Field | Type | Default | Notes |
|---|---|---|---|
| `interval_range` | numberArray | `[0,0]` | **required**. A range of values, specified in ticks, to decide the next tick interval for a block. After each block tick, a new value will be chosen from within the range to determine the next tick interval. If the values in the interval_range are the same, the block will … |
| `looping` | boolean | `true` | If false, the block will only be ticked once after a delay equal to a number of ticks randomly chosen from the interval_range and no further ticking will occur. If true, after the block ticks, a new random value will be chosen from the interval_range for when… |

Example (default):
```json
{
 "interval_range": [
  20,
  60
 ],
 "looping": true
}
```

### minecraft:unit_cube

_**deprecated**_

Specifies that a unit cube is to be used with tessellation.

## Documents and sub-objects (56)

### block_behavior_document (block_behavior_document)

A behavior pack block definition document for Minecraft Bedrock Edition. This describes the complete JSON file structure including format_version and the minecraft:block wrapper.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this block behavior file. Determines which features and component schemas are available. |
| `minecraft:block` | object |  | **required**. The block definition container with all behavior pack block data. See `block/blockdefinitiondocument`. |

### block_filter (block_filter)

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### block_resource_nonvisual (block_resource_nonvisual)

Defines properties related to a solid unit cube's audio.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sound` | string |  | Sound item to use. |

### block_resource_visual (block_resource_visual)

Defines properties related to a solid unit cube's visuals.

| Field | Type | Default | Notes |
|---|---|---|---|
| `textures` | string |  | Texture to use. |
| `carried_textures` | string |  | Texture that represents the item when carried. |
| `isotropic` | float |  | Whether to randomize which side to use when displaying a side of a unit cube. |

### block_specifier (block_specifier)

Specifies a particular block. Can be a string block name or a JSON object

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | Name of the block |
| `states` | keyedStringCollection |  | Contains members named after each state, with boolean, integer, or string values. |

### BlockDefinitionDocument (blockdefinitiondocument)

Is a block definition with description, components, and permutations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | Components See `block/components`. |
| `description` | object |  | **required**. Information about the block, must have at minimum an "identifier" and can have also the following optional field "menu_category", "states" and/or "traits" See `block/description`. |
| `permutations` | objectArray | `[]` | Array of conditional component overrides. Each permutation has a Molang condition and components that override the base components when the condition is true. See `block/permutation`. |

### BlockDescriptorProxy (blockdescriptorproxy)

Identifies a specific block by name, block states, and optional tags for matching. Used in block components and entity behaviors that need to reference other blocks—like specifying which blocks can support placement, what blocks drop when mined, or which blocks an entity can walk through.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### blockdescriptorserializer_blockdescriptorproxy (blockdescriptorserializer_blockdescriptorproxy)

BlockDescriptorSerializer BlockDescriptorProxy

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | name |
| `tags` | string |  | tags |
| `states` |  |  | states |

### blockstate_boolean (blockstate_boolean)

This is a property that can be true or false.

### blockstate_number (blockstate_number)

This is a property that can be one of a set of defined numeric (integer) values.

| Field | Type | Default | Notes |
|---|---|---|---|
| `values` | numberArray | `[0,1,2]` | The set of allowed text values for this state. |

### blockstate_string (blockstate_string)

This is a property that can be one of a set of defined text (string) values.

| Field | Type | Default | Notes |
|---|---|---|---|
| `values` | stringArray | `["value1","value2"]` | The set of allowed text values for this state. |

### Bounding Box Data (bounding_box_data)

Information for the collision box.

| Field | Type | Default | Notes |
|---|---|---|---|
| `origin` | numberArray | `[-8,0,-8]` | Minimal position of the bounds of the collision box. |
| `size` | numberArray | `[16,16,16]` | Size of each side of the collision box. |

### Components (components)

Container for all components that define custom block behavior and properties. Components control collision, selection boxes, destruction time, light emission, flammability, placement rules, crafting table functionality, and more. Combine components to create unique blocks with specific gameplay characteristics.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:block_entity` | object |  | Adds per-instance metadata for this block. See `block/minecraft_block_entity`. |
| `minecraft:breathability` | object |  | deprecated. Minecraft Breathability |
| `minecraft:chest_obstruction` | object |  | This defines how a block reacts to a chest being opened underneath it. See `block/minecraft_chest_obstruction`. |
| `minecraft:collision_box` | boolean |  | Defines the area of the block that collides with entities. If set to true, default values are used. If set to false, the block's collision with entities is disabled. If this component is omitted, default values are used. |
| `minecraft:connection_rule` | object |  | Defines whether other blocks such as fences, walls, bars, and glass panes are allowed to connect to this block. See `block/minecraft_connection_rule`. |
| `minecraft:crafting_table` | object |  | Makes your block into a custom crafting table which enables the crafting table UI and the ability to craft recipes. See `block/minecraft_crafting_table`. |
| `minecraft:destructible_by_explosion` | boolean |  | Describes the destructible by explosion properties for this block. If set to true, the block will have the default explosion resistance. If set to false, this block is indestructible by explosion. If the component is omitted, the block will have the default e… |
| `minecraft:destructible_by_mining` | boolean |  | Describes the destructible by mining properties for this block. If set to true, the block will take the default number of seconds to destroy. If set to false, this block is indestructible by mining. If the component is omitted, the block will take the default… |
| `minecraft:destruction_particles` | object |  | Sets the particles that will be used when block is destroyed. This component can be omitted. See `block/minecraft_destruction_particles`. |
| `minecraft:display_name` | string |  | Specifies the language file key that maps to what text will be displayed when you hover over the block in your inventory and hotbar. If the string given can not be resolved as a loc string, the raw string given will be displayed. If this component is omitted,… |
| `minecraft:embedded_visual` | object |  | This defines how a block embedded into an other block renders. Eg. a block in a flowerpot. See `block/minecraft_embedded_visual`. |
| `minecraft:entity_fall_on` | object |  | Configures the behavior of an entity falling on this block. The minimum distance in blocks that an actor needs to fall before events are triggered. See `block/minecraft_entity_fall_on`. |
| `minecraft:flammable` | boolean |  | Describes the flammable properties for this block. If set to true, default values are used. If set to false, or if this component is omitted, the block will not be able to catch on fire naturally from neighbors, but it can still be directly ignited. |
| `minecraft:flower_pottable` | object |  | This component allows the held item version of this block to be interacted with an empty flowerpot to place the block in it. |
| `minecraft:friction` | number |  | Describes the friction for this block in a range of (0.0-0.9). Friction affects an entity's movement speed when it travels on the block. Greater value results in more friction. |
| `minecraft:geometry` | string |  | The component that describes the geometry to use to render this block. It can be specified as a JSON object with the following fields, or simply as a string containing the description identifier of the geometry to use to render this block. This identifier mus… |
| `minecraft:instrument_sound` | object |  | This defines what sound will play based on above or below relative position to a note block. An instrument can be assigned to the "up" and "down" faces where at least one face needs to be defined for the component to be valid. If either face is undefined, or … |
| `minecraft:item_visual` | object |  | The "minecraft:geometry" component and "minecraft:material_instances" component of an item. Can be used instead of having separated component for each. See `block/minecraft_item_visual`. |
| `minecraft:leashable` | object |  | Allows a block to have a lead tied to it. See `block/leashable`. |
| `minecraft:light_dampening` | int |  | The amount that light will be dampened when it passes through the block. Higher value means the light will be dampened more. |
| `minecraft:light_emission` | int |  | The amount of light this block will emit. Higher value means more light will be emitted. |
| `minecraft:liquid_detection` | object |  | The definitions for how a block behaves when detecting liquid. Only one rule definition is allowed per liquid type - if multiple are specified, the first will be used and the rest will be ignored. See `block/minecraft_liquid_detection`. |
| `minecraft:loot` | object |  | The path to the loot table, relative to the behavior pack. Path string is limited to 256 characters. |
| `minecraft:map_color` | string |  | Sets the color of the block when rendered to a map.Can be a direct color representation or an object with a "color" and "tint_method" field. |
| `minecraft:material_instances` | object |  | The material instances for a block. Maps face or material_instance names in a geometry file to an actual material instance. Material instance can either be a full material instance or a name to another already defined instance. Limited to 64 instances. |
| `minecraft:movable` | object |  | This defines how a block reacts to being moved by another block like a piston. See `block/minecraft_movable`. |
| `minecraft:on_fall_on` | object |  | deprecated. Minecraft On Fall On |
| `minecraft:on_interact` | object |  | deprecated. Minecraft On Interact |
| `minecraft:on_placed` | object |  | deprecated. Minecraft On Placed |
| `minecraft:on_player_destroyed` | object |  | deprecated. Minecraft On Player Destroyed |
| `minecraft:on_player_placing` | object |  | deprecated. Minecraft On Player Placing |
| `minecraft:on_step_off` | object |  | deprecated. Minecraft On Step Off |
| `minecraft:on_step_on` | object |  | deprecated. Minecraft On Step On |
| `minecraft:placement_filter` | object |  | Minecraft Placement Filter See `block/minecraft_placement_filter`. |
| `minecraft:precipitation_interactions` | object |  | Determines interactions the block will have with different precipitations. Three possible values: obrain, obstruct_rain_accumulate_snow and none See `block/minecraft_precipitation_interactions`. |
| `minecraft:queued_ticking` | object |  | deprecated. Minecraft Queued Ticking |
| `minecraft:random_offset` | object |  | This component defines a random offset for the block, seeded based on the block's position and the specified range and steps. It affects the block's rendered position, outline, and collision. If the random offset causes the collision box to extend beyond the … See `block/minecraft_random_offset`. |
| `minecraft:random_ticking` | object |  | deprecated. Minecraft Random Ticking |
| `minecraft:redstone_conductivity` | object |  | The basic redstone properties of a block. If the component is not provided the default values are used. See `block/minecraft_redstone_conductivity`. |
| `minecraft:redstone_consumer` | object |  | A component describing how a block can consume and potentially propagate a redstone signal. This component is not available for block permutations. See `block/minecraft_redstone_consumer`. |
| `minecraft:redstone_producer` | object |  | The definitions for how a block can produce a redstone signal. See `block/minecraft_redstone_producer`. |
| `minecraft:replaceable` | object |  | A block with this component can be replaced when another block is placed in the same block position. |
| `minecraft:selection_box` | boolean |  | Defines the area of the block that is selected by the player's cursor. If set to true, default values are used. If set to false, this block is not selectable by the player's cursor. If this component is omitted, default values are used. |
| `minecraft:sound` | object |  | Defines a sound type for the block. See `block/sound_block_component`. |
| `minecraft:support` | object |  | Defines the support shape of the block. Currently only allows for blocks to have the same shape as a Vanilla fence and Vanilla stair. To work with custom stairs, requires the use of "minecraft:vertical_half" and "minecraft:cardinal_direction" or "minecraft:fa… See `block/minecraft_support`. |
| `minecraft:tags` | object |  | Use this component to define tags, vanilla or custom. Valid tags are of the format "namespace:tag_name". The array of tags must be non-empty. |
| `minecraft:tick` | object |  | Minecraft Tick See `block/minecraft_tick`. |
| `minecraft:transformation` | object |  | Minecraft Transformation See `block/minecraft_transformation`. |
| `minecraft:unit_cube` | object |  | deprecated. Minecraft Unit Cube |
| `minecraft:vibration_properties` | object |  | Minecraft Vibration Properties See `block/vibration_properties`. |

### Connection (connection)

_since 1.21.130_

Adds connection states to the block. The values of these states are updated when the block or neighboring blocks change.

> `minecraft:connection` block trait exposes connection states (e.g. `minecraft:cardinal_connections`) that update when neighboring blocks change. Used by blocks that visually connect like fences or glass panes.

> Available without the Upcoming Creator Features experimental toggle in 1.26.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` | stringArray |  | **required**. Which connection states to enable. Options: ["minecraft:cardinal_connections"]. Must specify at least one. Values: `minecraft:cardinal_connections`. |

### container (container)

| Field | Type | Default | Notes |
|---|---|---|---|
| `slot_count` | int |  | **required**. Sets the number of slots in the container. |

### culling_layer (culling_layer)

A string that allows culling rule to group multiple blocks together when comparing them. When using the minecraft namespace, the only allowed culling layer identifiers are : "minecraft:culling_layer.undefined" or "minecraft:culling_layer.leaves". When using no namespaces or a custom one, the names must start and end with an alpha-numeric character. Additionally, the feature is currently only usable behind the "upcoming creator features" toggle.

### Description (description)

Information about the block, must have at minimum an "identifier" and can have also the following optional field "menu_category", "states" and/or "traits"

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Must have a namespace and can't use the "minecraft" one. Example: "namespace:my_block" |
| `menu_category` | object | `{"category":"none","group":null,"is_hidden_in_commands":fal…` | Configures the block behavior in inventory and menu category See `block/menu_category`. |
| `states` | object | `{}` | Define custom states for a block that can be referenced in permutation. Each state must contain an array or a "values" with an array or a "min"/"max" range |
| `traits` | object | `{"minecraft:connection":null,"minecraft:multi_block":null,"…` | Change the connection, multiblock state, placement position and/or direction behaviors of a block See `block/traits`. |

### Detailed Flammable (detailed_flammable)

Describes the flammable properties for this block. If this component is omitted, the block will not be able to catch on fire naturally from neighbors, but it can still be directly ignited.

| Field | Type | Default | Notes |
|---|---|---|---|
| `catch_chance_modifier` | int | `5` | A modifier affecting the chance that this block will catch flame when next to a fire. Values are greater than or equal to 0, with a higher number meaning more likely to catch on fire. For a catch_chance_modifier greater than 0, the fire will continue to burn … |
| `destroy_chance_modifier` | int | `20` | A modifier affecting the chance that this block will be destroyed by flames when on fire. Values are greater than or equal to 0, with a higher number meaning more likely to be destroyed by fire. For a destroy_chance_modifier of 0, the block will never be dest… |
| `lava_flammable` | stringEnum | `"never"` | Determines lava fire consideration. "always" includes this block when lava attempts to spread fire" " (triggered by adjacent block changes), but normal fire-placement rules still apply. "never" excludes" " this block from that check. Values: `always`, `never`. |

### Detailed Geometry (detailed_geometry)

References custom block geometry with advanced rendering options. Specify the geometry identifier from models in the resource pack, configure bone visibility for multi-part models, and set up block culling rules to hide faces when adjacent to other blocks. Enables complex shapes like stairs, fences, and decorative blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `bone_visibility` | object | `{}` | A JSON object that contains a list of key/value pairs that map from bone name in the specified geometry file (key) to a Molang expression that tells whether the bone should be visible or not (value). The expression is limited to using the "query.block_state()… |
| `culling` | string | `""` | Which block_culling .json file to use when rendering this block. |
| `culling_layer` | string |  | A string that allows culling rule to group multiple blocks together when comparing them. When using the minecraft namespace, the only allowed culling layer identifiers are : "minecraft:culling_layer.undefined" or "minecraft:culling_layer.leaves". When using n… |
| `culling_shape` | string | `""` | Currently only available with the VoxelShape experiment on. The voxel shape used for culling adjacent block faces. Voxel shapes work together with culling rules and will not function if there is no culling rule defined for the block. Only adjacent blocks with… |
| `identifier` | string |  | **required**. The description identifier of the geometry to use to render this block. This identifier must either match an existing geometry identifier in any of the loaded resource packs or be one of the currently supported Vanilla identifiers: "minecraft:geometry.full_bl… |
| `n_way_visual_rotation` | object |  | Optional object that maps x/y/z axes to block state names that drive visual-only geometry rotation. See `block/nwayvisualrotation`. |
| `uv_lock` | object | `false` | A field that is either a Boolean or an array of strings, max size 64 strings. This field locks UV orientation for all/some bones in the geometry, regardless of how the block is rotated using "minecraft:transformation" component. For performance reasons it's r… |

### Detailed Map Color (detailed_map_color)

Sets the color and optional tint of the block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `color` | string |  | **required**. Sets the color of the block when rendered to a map. |
| `tint_method` | stringEnum | `"none"` | Sets the tint method of the block when rendered to a map. Tint method logic varies, but often refers to the "rain" and "temperature" of the biome the block is placed in to compute the tint. Supported tint methods are "none", "default_foliage", "birch_foliage"… Values: `birch_foliage`, `default_foliage`, `dry_foliage`, `evergreen_foliage`, `grass`, `none`, `water`. |

### Detailed Mining Speed (detailed_mining_speed)

Customizes how quickly players can mine the block with different tools. Configure base destruction time and per-item speed modifiers so pickaxes mine stone faster, axes break wood faster, and so on. Essential for creating blocks that follow Minecraft's tool progression and harvesting conventions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `item_specific_speeds` | objectArray | `[]` | Optional array with item specific mining speeds. See `block/item_specific_speed`. |
| `seconds_to_destroy` | float |  | **required**. Sets the number of seconds it takes to mine the block with base equipment. Greater numbers result in greater mining times. A negative number means the block can't be mined |

### Detailed Resistance (detailed_resistance)

Sets the block's resistance to explosions from TNT, creepers, and other sources. Higher values make blocks harder to destroy—bedrock has near-infinite resistance while glass shatters easily. Configure appropriate resistance to match the block's intended durability in survival gameplay.

| Field | Type | Default | Notes |
|---|---|---|---|
| `explosion_resistance` | float |  | **required**. Sets the explosion resistance for the block. Greater values result in greater resistance to explosions. The scale will be different for different explosion power levels. A negative value or 0 means it will easily explode; larger numbers increase level of resi… |

### Detection Rule (detection_rule)

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_contain_liquid` | boolean | `false` | Whether this block can contain the liquid. For example, if the liquid type is `water`, this means the block can be waterlogged. |
| `liquid_type` | stringEnum | `"water"` | The type of liquid this detection rule is for. Currently, `water` is the only supported liquid type. If this field is omitted, `water` will be the liquid type by default. Values: `water`. |
| `on_liquid_touches` | stringEnum | `"blocking"` | How the block reacts to flowing water. Must be one of the following options: "blocking" - The default value for this field. The block stops the liquid from flowing. "broken" - The block is destroyed completely. "popped" - The block is destroyed and its item i… Values: `blocking`, `broken`, `no_reaction`, `popped`. |
| `stops_liquid_flowing_from_direction` | object | `[]` | When a block contains a liquid, controls the directions in which the liquid can't flow out from the block. Also controls the directions in which a block can stop liquid flowing into it if `no_reaction` is set for the `on_liquid_touches` field. Can be a list o… |
| `use_liquid_clipping` | boolean | `false` | since 1.26.0. If true, the block uses its collision box to visually clip the liquid (reducing the visible water volume to match the block's shape). If false, the liquid renders as a full square across the whole block regardless of the collision shape. |

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

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | object |  | The domain the test should be performed in. |
| `operator` | object |  | The comparison to apply with 'value'. |
| `subject` | object |  | The subject of this filter test. |
| `test` | string |  | **required**. The name of the test to apply. |
| `value` | object |  | The value being compared with the test. |

### FloatRange (floatrange)

Specifies a range between minimum and maximum float values for randomized block properties. Used for features like random tick intervals, variable light flicker rates, or loot table quantities. The game picks a random value within the range when the property is evaluated.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | float | `0` | Max |
| `min` | float | `0` | Min |

### IntRange (intrange)

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `0` | Max |
| `min` | int | `0` | Min |

### Item Specific Speed (item_specific_speed)

Defines mining speed bonuses for specific tool items when breaking this block. Map item identifiers to speed multipliers so diamond pickaxes mine faster than stone, or custom tools have specialized efficiency. Enables proper tool tier progression and specialized harvesting tools.

| Field | Type | Default | Notes |
|---|---|---|---|
| `destroy_speed` | float |  | **required**. Mining speed for that specific item. A negative number means the block can't be mined with that item. |
| `item` | string |  | **required**. The item with a specific mining speed. |

### leashable (leashable)

_since 1.21.130_

Allows a block to have a lead tied to it.

> `minecraft:leashable` block component added in 1.21.130. Lets a custom block receive a lead attachment; `offset` controls the position of the leash knot relative to the block.

> In 1.26.0 and higher, this component is available without the Upcoming Creator Features experimental toggle for `format_version` 1.26.0+.

| Field | Type | Default | Notes |
|---|---|---|---|
| `offset` | numberArray | `[0,0.25,0]` | Offset |

### Material Instance (material_instance)

A material instance definition to map to a material instance in a geometry file. The material instance "*" will be used for any materials that don't have a match.

| Field | Type | Default | Notes |
|---|---|---|---|
| `alpha_masked_tint` | boolean | `false` | since 1.26.0. If true, the tint is multiplied by the alpha channel of the texture (similar to grass_block's sides). Requires a `tint_method` other than `none` and a `render_method` set to `opaque`. |
| `ambient_occlusion` | float | `1` | Should this material have ambient occlusion applied when lighting? If true, shadows will be created around and underneath the block. Optionally can be constructed with float to control exponent applied to ao value after lighting. |
| `face_dimming` | boolean | `true` | Is this material dimmed by the direction it's facing |
| `isotropic` | boolean | `false` | Is the faces that this material is applied to randomize their UVs |
| `render_method` | stringEnum | `"opaque"` | The render method to use. Each material of the block must use the same. The render method can be one of these options: "opaque" - Used for a regular block texture without an alpha layer. Does not allow for transparency or translucency. "double_sided" - Used f… Values: `alpha_test`, `alpha_test_single_sided`, `alpha_test_single_sided_to_opaque`, `alpha_test_to_opaque`, `blend`, `blend_to_opaque`, `double_sided`, `opaque`. |
| `texture` | string | `""` | Texture name for the material. |
| `tint_method` | stringEnum | `"none"` | Tint multiplied to the color. Tint method logic varies, but often refers to the "rain" and "temperature" of the biome the block is placed in to compute the tint. Supported tint methods are "none", "default_foliage", "birch_foliage", "evergreen_foliage", "dry_… Values: `birch_foliage`, `default_foliage`, `dry_foliage`, `evergreen_foliage`, `grass`, `none`, `water`. |

### material_instance_face (materialinstanceface)

Configures how a block face renders its texture, including transparency, culling, and lighting. Set the texture reference, choose render method (opaque, alpha_test, blend, or double_sided), control face culling, and configure ambient occlusion. Enables glass-like transparency, leaf rendering, and custom visual effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `texture` | string |  | Texture name for the material. |
| `ambient_occlusion` | float |  | If this material has ambient occlusion applied when lighting, shadows will be created around and underneath the block. Decimal value controls exponent applied to a value after lighting. |
| `render_method` | string |  | The render method to use. Values: `opaque`, `double_sided`, `blend`, `alpha_test`, `alpha_test_single_sided`, `blend_to_opaque`, `alpha_test_to_opaque`, `alpha_test_single_sided_to_opaque`. |
| `tint_method` | boolean | `false` | since 1.21.80. Tint multiplied to the color. Tint method logic varies, but often refers to the "rain" and "temperature" of the biome the block is placed in to compute the tint. Supported tint methods are "none", "default_foliage", "birch_foliage", "evergreen_foliage", "dry_… |
| `isotropic` | boolean | `false` | since 1.21.80. Should the faces that this material is applied to randomize their UVs? |
| `face_dimming` | string |  | This material should be dimmed by the direction its facing. |

Example (/minecraft:block/components/minecraft:material_instances/):
```json
{
 "texture": "bubble_fish_blue",
 "render_method": "blend",
 "face_dimming": true
}
```

### Menu Category (menu_category)

Configures the block behavior in inventory and menu category

> In format version 1.26.20, validation is strictly enforced: `category` is required when `menu_category` is present, and `group`, if provided, must be a non-empty string. Either omit `group` entirely or set it to a non-empty namespace.

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` | stringEnum |  | **required**. The creative inventory or recipe book tab that the block is placed into. Default to "none". Values: `construction`, `equipment`, `items`, `nature`, `none`. |
| `group` | string |  | The expandable group that the block is a part of. Must be a namespace and can use vanilla ones |
| `is_hidden_in_commands` | boolean | `false` | Is the block hidden from use in commands. |

### block_entity (minecraft_block_entity)

Adds per-instance metadata for this block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `container` | object |  | Adds a container to this block. See `block/container`. |
| `dynamic_properties` | boolean | `false` | Dynamic-properties can store and retrieve variables on a block via scripting, more at https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server/blockdynamicpropertiescomponent. |

### bone_visibility (minecraft_bone_visibility)

_**deprecated**_

A JSON object that contains a list of key/value pairs that map from bone name in the specified geometry file (key) to a boolean that tells whether the bone should be visible or not (value).

### Destruction Particles (minecraft_destruction_particles)

_since 1.21.80_

Sets the particles that will be used when block is destroyed.

> Available without experimental toggle in 1.21.100. The particle_count field controls how many particles spawn when the block is broken.

| Field | Type | Default | Notes |
|---|---|---|---|
| `particle_count` | int | `100` | Sets number of particles to spawn on block destruction. |
| `texture` | string | `""` | The texture name used for the particle. |
| `tint_method` | string | `"none"` | Tint multiplied to the color. Tint method logic varies, but often refers to the "rain" and "temperature" of the biome the block is placed in to compute the tint. Values: `none`, `default_foliage`, `birch_foliage`, `evergreen_foliage`, `dry_foliage`, `grass`, `water`. |

### Item Visual (minecraft_item_visual)

_since 1.21.60_

The description identifier of the geometry and material used to render the item of this block.

> Fixed in 1.26.10: a client crash on world load caused by an out-of-bounds `minecraft:geometry` value inside `minecraft:item_visual` no longer occurs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `geometry` | string |  | **required**. The "minecraft:geometry" component of the item. |
| `material_instances` | object |  | **required**. The "minecraft:material_instances" component of the item. |

Example (Full Block Example):
```json
{
 "geometry": {
  "identifier": "minecraft:geometry.full_block"
 },
 "material_instances": {
  "*": {
   "texture": "dirt",
   "render_method": "opaque"
  }
 }
}
```

### Liquid Detection (minecraft_liquid_detection)

_since 1.21.60_

The definitions for how a block behaves when detecting liquid. Only one rule definition is allowed per liquid type - if multiple are specified, the first will be used and the rest will be ignored.

> In 1.26.10, defining `minecraft:liquid_detection` with an empty `detection_rules` array fails to load and produces a content error.

| Field | Type | Default | Notes |
|---|---|---|---|
| `detection_rules` | objectArray |  | **required**. Detection Rules See `block/detection_rule`. |

Example (https://github.com/microsoft/minecraft-samples/tree/main/casual_creator/gray_wave/behavior_packs/mikeamm_gwve/blocks/fabricator.block.json):
```json
{
 "detection_rules": [
  {
   "liquid_type": "water",
   "on_liquid_touches": "broken"
  }
 ]
}
```

### Placement Filter (minecraft_placement_filter)

_since 1.19.60_

Sets rules for under what conditions the block can be placed and survive. If the placement conditions are not met, the block cannot be placed. If the block is already placed and the conditions become invalid (e.g., the supporting block is removed), the block will pop off and drop as an item. If the blocks in the filter are liquid blocks, ensure that an item block is created with a 'liquid_clipped' component set to 'true' and a 'block_placer' component with 'replace_block_item' set to 'true'.

> Fixed in 1.26.10: `minecraft:placement_filter` and `minecraft:block_placer` now correctly support placing on liquid blocks when the item uses `liquid_clipped`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditions` | objectArray | `[]` | List of conditions where the block can be placed/survive See `block/placement_condition`. |

### Redstone Conductivity (minecraft_redstone_conductivity)

_since 1.21.40_

The basic redstone properties of a block. If the component is not provided the default values are used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allows_wire_to_step_down` | boolean | `true` | Specifies if redstone wire can stair-step downward on the block. |
| `redstone_conductor` | boolean | `false` | Specifies if the block can be powered by redstone. |

### Transformation (minecraft_transformation)

_since 1.19.80_

> Added in 1.19.80 as a replacement for the previous block rotation component, adding support for scaling and translation in addition to rotation. May be added to the whole block and/or to individual block permutations.

> Added rotation_pivot and scale_pivot attributes in 1.21.0 to support pivoted rotation and scale operations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `rotation` | numberArray | `[0,0,0]` | The block's rotation in increments of 90 degrees |
| `rotation_pivot` | point3 | `[0,0,0]` | since 1.21.0. The point to apply rotation around. |
| `scale` | numberArray | `[1,1,1]` | The block's scale |
| `scale_pivot` | point3 | `[0,0,0]` | since 1.21.0. The point to apply scale around. |
| `translation` | numberArray | `[0,0,0]` | The block's translation |

### Molang expression (molang_expression)

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | **required**. Expression |
| `version` | int |  | **required**. Version |

### Multi Block (multi_block)

_since 1.26.10 · **experimental (Upcoming Creator Features)**_

Adds the "minecraft:multi_block_part" state and multi block functionality to the block.

> Added in 1.26.10 behind the Upcoming Creator Features experiment. Lets a single block definition span multiple block positions (2-4 parts) and treats all parts as a unified block (like Doors). Enables the `minecraft:multi_block_part` state; `direction` controls whether parts stack `up` or `down`. When `minecraft:selection_box` is `true`, individual part AABBs are combined into one outline. Requires `minecraft:movable` defined outside permutations (with `movement_type` set to `popped` or `immovable`); `minecraft:placement_filter` cannot be defined in permutations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `direction` | stringEnum |  | **required**. The direction the block parts are placed starting from 'minecraft:multi_block_part' permutation '0' to permutation 'parts'. Default value is 'up'. Values: `down`, `east`, `north`, `south`, `up`, `west`. |
| `enabled_states` | stringArray |  | **required**. Which state to enable. Must specify at least one. Options: ["minecraft:multi_block_part"]. Values: `minecraft:multi_block_part`. |
| `parts` | int | `2` | The number of block parts, this sets the value for state 'minecraft:multi_block_part'. Default value is '2'. |

### NWayVisualRotation (nwayvisualrotation)

| Field | Type | Default | Notes |
|---|---|---|---|
| `x` | string | `""` | Block state name that controls visual rotation around the x axis. |
| `y` | string | `""` | Block state name that controls visual rotation around the y axis. |
| `z` | string | `""` | Block state name that controls visual rotation around the z axis. |

### offset_range (offset_range)

Specifies a range of values between two numbers, with a defined number of steps. This is used to control the variation in block properties such as offset, color, or other attributes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `range` | object |  | Range of values |
| `steps` | int |  | Number of steps between the range |

### Permutation (permutation)

Defines conditional component overrides based on block state values using Molang conditions. When the condition evaluates true, the permutation's components replace or merge with base components. Enables blocks that change appearance or behavior based on direction, power state, age, or custom properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. Components See `block/components`. |
| `condition` | keyedStringCollection |  | **required**. Condition |

### Placement Condition (placement_condition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `allowed_faces` | object | `["down","up","north","south","west","east"]` | List of any of the following strings describing which face(s) this block can be placed on |
| `block_filter` | objectArray | `[]` | List of blocks that this block can be placed against in the "allowed_faces" direction. Each block in this list can either be specified as a String (block name) or as a BlockDescriptor. |

### Placement Direction (placement_direction)

_since 1.20.30_

Adds the "minecraft:cardinal_direction", "minecraft:facing_direction", "minecraft:corner_and_cardinal_direction" and/or "minecraft:sixteen_way_rotation" states and setter function to the block.

> The `minecraft:sixteen_way_rotation` value for `enabled_states` was released out of beta in format version 1.26.30. Use it (together with the corresponding block state) to rotate blocks in 22.5° increments around the Y axis based on the player's yaw at placement time.

> The `minecraft:corner_and_cardinal_direction` value for `enabled_states` is available without the Beta APIs toggle starting in 1.26.0. When enabled, set `blocks_to_corner_with` to the block descriptors that should trigger the corner shape (commonly paired with the `minecraft:placement_position` trait's `minecraft:vertical_half` state).

> In format version 1.26.20, validation tightened: the rotation offset must be an exact multiple of 90.0 in the range 0.0–360.0 (the previous 0.5 tolerance was removed), and `blocks_to_corner_with` now requires `minecraft:corner_and_cardinal_direction` to be present in `enabled_states`.

> Fixed in 1.26.10: blocks using `minecraft:corner_and_cardinal_direction` now correctly form inner corners when adjacent to other stairs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks_to_corner_with` | objectArray | `[]` | A list of block descriptors that define the blocks to connect with the corner shape. |
| `enabled_states` | stringArray |  | **required**. Which states to enable. Must specify at least one. Options: ["minecraft:cardinal_direction", "minecraft:facing_direction", "minecraft:corner_and_cardinal_direction", "minecraft:sixteen_way_rotation"]. Values: `minecraft:cardinal_direction`, `minecraft:corner_and_cardinal_direction`, `minecraft:facing_direction`, `minecraft:sixteen_way_rotation`. |
| `y_rotation_offset` | float |  | The y rotation offset to apply to the block. Must be [0.0, 90.0, 180.0, 270.0, 360.0]. Default is 0, meaning if the player is facing north, the "minecraft:cardinal_direction", "minecraft:facing_direction", and/or "minecraft:sixteen_way_rotation" state will be… |

### Placement Position (placement_position)

_since 1.20.30_

Adds the "minecraft:block_face" and/or "minecraft:vertical_half" states and setter function to the block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` | stringArray |  | **required**. Which states to enable. Must specify at least one. Options: ["minecraft:block_face", "minecraft:vertical_half"]. Values: `minecraft:block_face`, `minecraft:vertical_half`. |

### Range (range)

Define a range of integer value using a "min" and "max" limit and must be assigned to "values"

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | **required**. Max |
| `min` | int |  | **required**. Min |

### Range And Steps (range_and_steps)

Defines an integer block state with a range of valid values and optional step increment. Used for block properties like growth stages (0-7 for crops), signal strength (0-15 for redstone), or rotation angles. The game only allows values within the specified min/max range at the given step intervals.

| Field | Type | Default | Notes |
|---|---|---|---|
| `range` | object |  | **required**. The range of the random offset. See `legacy/floatrange`. |
| `steps` | int | `0` | The number of steps between the range. Specify 0 for all possible values between the range. |

### Sound Block Component (sound_block_component)

Defines a sound type for the block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sound` | string | `""` | Sound |

### trait_placement_direction (trait_placement_direction)

_since 1.20.30_

Add states containing information about the player's rotation when the block is placed. For example, if a block using placement direction is placed while the player is facing south, the state value will be 'south'. This will allow a data-driven block to replicate the rotation behavior of a furnace, pumpkin, or terracotta block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` | checkboxListAsStringArray |  | Enabled States Values: `minecraft:cardinal_direction`, `minecraft:facing_direction`. |
| `y_rotation_offset` | float |  | Y rotation offset |

### trait_placement_position (trait_placement_position)

_since 1.20.30_

Contains information about where the player placed the block. This allows a block to replicate the upside-down placement of slabs and stairs, as well as the attachment behavior of torches and vines.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` | checkboxListAsStringArray |  | Enabled States Values: `minecraft:block_face`, `minecraft:vertical_half`. |

### Traits (traits)

Change the connection, multiblock state, placement position and/or direction behaviors of a block

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:connection` | object |  | Adds connection states to the block. The values of these states are updated when the block or neighboring blocks change. See `block/connection`. |
| `minecraft:multi_block` | object |  | Adds the "minecraft:multi_block_part" state and multi block functionality to the block. See `block/multi_block`. |
| `minecraft:placement_direction` | object |  | Adds the "minecraft:cardinal_direction", "minecraft:facing_direction", "minecraft:corner_and_cardinal_direction" and/or "minecraft:sixteen_way_rotation" states and setter function to the block. See `block/placement_direction`. |
| `minecraft:placement_position` | object |  | Adds the "minecraft:block_face" and/or "minecraft:vertical_half" states and setter function to the block. See `block/placement_position`. |

### Values (values)

Must be assigned an array or a "range"

| Field | Type | Default | Notes |
|---|---|---|---|
| `values` | object |  | **required**. Values |

### Vibration Properties (vibration_properties)

| Field | Type | Default | Notes |
|---|---|---|---|
| `damper_vibrations` | boolean | `false` | Damper Vibrations |
| `occlude_vibrations` | boolean | `false` | Occlude Vibrations |
