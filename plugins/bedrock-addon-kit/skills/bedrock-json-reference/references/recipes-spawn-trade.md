# Recipes, spawn rules, trades

Generated 2026-10-06 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/recipe, spawn, trade). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (41)

### recipe_brewing_mix (recipe_brewing_mix)

A brewing recipe for Minecraft Bedrock Edition. Brewing recipes define how potions are created by combining a base potion with a reagent in a brewing stand.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. |
| `minecraft:recipe_brewing_mix` |  |  | **required**. The brewing mix recipe definition container. |

Example (Strength potion recipe):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_brewing_mix": {
  "description": {
   "identifier": "minecraft:brew_awkward_blaze_powder"
  },
  "tags": [
   "brewing_stand"
  ],
  "input": "minecraft:potion_type:awkward",
  "reagent": "minecraft:blaze_powder",
  "output": "minecraft:potion_type:strength"
 }
}
```

### recipe_furnace (recipe_furnace)

A smelting/cooking recipe for Minecraft Bedrock Edition. Furnace recipes define input items that can be smelted in furnaces, smokers, blast furnaces, or campfires.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. |
| `minecraft:recipe_furnace` |  |  | **required**. The furnace recipe definition container. |

Example (Cooked beef recipe example):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_furnace": {
  "description": {
   "identifier": "minecraft:furnace_beef"
  },
  "tags": [
   "furnace",
   "smoker",
   "campfire"
  ],
  "input": "minecraft:beef",
  "output": "minecraft:cooked_beef"
 }
}
```

### recipe_shaped (recipe_shaped)

A shaped crafting recipe for Minecraft Bedrock Edition. Shaped recipes require ingredients to be placed in a specific pattern on the crafting grid.

> The 'data' field for items is deprecated in versions 1.20.0 and later. Use flattened item identifiers instead.

> Starting in 1.19.40, pattern key entries may specify a 'tag' instead of an 'item', allowing the recipe to accept any item that belongs to the named item tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. Common versions include '1.12' and '1.20.10'. |
| `minecraft:recipe_shaped` |  |  | **required**. The shaped recipe definition container. |

Example (Anvil recipe example):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_shaped": {
  "description": {
   "identifier": "minecraft:anvil"
  },
  "tags": [
   "crafting_table"
  ],
  "pattern": [
   "III",
   " i ",
   "iii"
  ],
  "key": {
   "I": {
    "item": "minecraft:iron_block"
   },
   "i": {
    "item": "minecraft:iron_ingot"
   }
  },
  "result": {
   "item": "minecraft:anvil"
  }
 }
}
```

### recipe_shapeless (recipe_shapeless)

A shapeless crafting recipe for Minecraft Bedrock Edition. Shapeless recipes allow ingredients to be placed in any order and position on the crafting grid, unlike shaped recipes that require specific patterns.

> Starting in 1.19.40, ingredient entries may specify a 'tag' instead of an 'item', allowing the recipe to accept any item that belongs to the named item tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. |
| `minecraft:recipe_shapeless` |  |  | **required**. The shapeless recipe definition container. |

Example (Andesite recipe example):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_shapeless": {
  "description": {
   "identifier": "minecraft:andesite"
  },
  "tags": [
   "crafting_table"
  ],
  "ingredients": [
   {
    "item": "minecraft:stone",
    "data": 3
   },
   {
    "item": "minecraft:cobblestone"
   }
  ],
  "result": {
   "item": "minecraft:stone",
   "data": 5,
   "count": 2
  }
 }
}
```

### recipe_smithing_transform (recipe_smithing_transform)

_since 1.20.0_

A smithing table transformation recipe for Minecraft Bedrock Edition. Smithing transform recipes define how items are upgraded using a smithing template, base item, and addition material.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. |
| `minecraft:recipe_smithing_transform` |  |  | **required**. The smithing transform recipe definition container. |

Example (Netherite axe upgrade):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_smithing_transform": {
  "description": {
   "identifier": "minecraft:smithing_netherite_axe"
  },
  "tags": [
   "smithing_table"
  ],
  "template": "minecraft:netherite_upgrade_smithing_template",
  "base": "minecraft:diamond_axe",
  "addition": "minecraft:netherite_ingot",
  "result": "minecraft:netherite_axe"
 }
}
```

### recipe_smithing_trim (recipe_smithing_trim)

_since 1.20.0_

A smithing table armor trim recipe for Minecraft Bedrock Edition. Smithing trim recipes define how armor items are decorated with trim patterns using trim templates and materials.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` |  |  | **required**. The format version of this recipe file. |
| `minecraft:recipe_smithing_trim` |  |  | **required**. The smithing trim recipe definition container. |

Example (Armor trim recipe):
```json
{
 "format_version": "1.12",
 "minecraft:recipe_smithing_trim": {
  "description": {
   "identifier": "minecraft:smithing_armor_trim"
  },
  "tags": [
   "smithing_table"
  ],
  "template": {
   "tag": "minecraft:trim_templates"
  },
  "base": {
   "tag": "minecraft:trimmable_armors"
  },
  "addition": {
   "tag": "minecraft:trim_materials"
  }
 }
}
```

### BiomeConditions (biomeconditions)

Biome specific rules for spawning

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome_filter` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filter to limit spawns to specific biomes. Can be a single filter object or an array of filter objects. |
| `herds` | objectArray | `[]` | Configurations for size and events when spawning groups of entities See `spawn/herd`. |
| `mob_event_filter` | string | `""` | Filter to exclude entities if the event is disabled. |
| `permute_types` | objectArray | `[]` | List of randomly choosable permutations of the entity See `spawn/permutetype`. |
| `weight` | int |  | **required**. The weight used when comparing other entities that can spawn within a biome |

### BlockDescriptorProxy (blockdescriptorproxy)

References a block type by name, states, or tags for use in spawn conditions. Used with spawn_above_block_filter to restrict spawning to locations above specific block types like grass_block or stone.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### Description (description)

Contains the entity identifier that these spawn rules apply to. The identifier must match an entity defined in a behavior pack (e.g., 'minecraft:creeper' or 'mypack:custom_mob').

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |

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

A single filter condition used to test entity or world properties. Filters check things like biome type, weather, time of day, or entity attributes. Multiple filters can be combined with all_of, any_of, and none_of operators.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | The domain the test should be performed in. |
| `operator` | string |  | The comparison to apply with 'value'. |
| `subject` | string |  | The subject of this filter test. |
| `test` | string |  | **required**. The name of the test to apply. |
| `value` | int |  | The value being compared with the test. |

### Herd (herd)

Configures group spawning behavior with min/max herd sizes. Allows running events on the first N entities spawned (initial_event) or after skipping M entities (event). Common for pack animals like wolves or swarm mobs like silverfish.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | An event to run after 'event_skip_count' number of entities in the group have spawned |
| `event_skip_count` | int | `0` | Number of entities spawned in the group to skip before running the event |
| `initial_event` | string | `""` | Event run for the first 'initial_event_count' number of the group are placed. |
| `initial_event_count` | int | `0` | Number of times that 'initial_event' can run |
| `max` | int | `1` | Maximum number of entities in this group to attempt to spawn |
| `min` | int | `1` | Minimum number of entities in this group to attempt to spawn |

### legacy_spawn_contents (legacy_spawn_contents)

Struct Legacy Spawn Contents Spawn

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` |  |  | description |
| `conditions` |  |  | conditions |

### PermuteType (permutetype)

Defines a weighted spawn variant that may be selected when the spawn rule triggers. Configure the entity to spawn and its weight relative to other permutations—higher weights mean that variant spawns more frequently. Enables mob variety like zombie villagers occasionally replacing regular zombies.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity_type` | string | `""` | Specifies the entity type to spawn when selected |
| `min_guaranteed` | int | `0` | The minimum number of this permutation's entity to spawn |
| `weight` | int |  | **required**. The likelihood of this to be selected over the combined weight of all the entities in the permutation |

### Placement (placement)

Placement rule defintions

| Field | Type | Default | Notes |
|---|---|---|---|
| `heightmap` | string | `""` | Defines the heightmap filter for initial entity placement during chunk loading. |
| `spawn_obstruction_predicate` | string | `""` | Checks for obstructions that might prevent entity spawning. |
| `spawn_predicate` | string | `""` | Determines if an entity is valid to spawn based on specific conditions. |
| `type` | string | `""` | Specifies the environment where the entity can spawn (e.g., on ground, in water, etc.). |

### Spawn BiomeConditions (spawn_biomeconditions)

Defines the conditions under which an entity can spawn, including biome filters, brightness, height, and herd settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:biome_filter` | minecraftFilter | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `minecraft:brightness_filter` | object |  | Restricts spawning based on light level. Hostile mobs typically spawn in darkness (0-7), passive mobs in brighter areas. See `spawn/spawn_brightnessfilter`. |
| `minecraft:delay_filter` | object |  | Delays entity spawning by a configurable time after conditions are met. Useful for cooldowns after mob deaths. See `spawn/spawn_delayfilter`. |
| `minecraft:density_limit` | object |  | Limits how many of this entity can exist in an area, with separate caps for surface and underground. Set -1 for unlimited. See `spawn/spawn_densitylimit`. |
| `minecraft:difficulty_filter` | object |  | Restricts spawning to specific difficulty levels (Peaceful, Easy, Normal, Hard). See `spawn/spawn_difficultyfilter`. |
| `minecraft:disallow_spawns_in_bubble` | object |  | Prevents spawning inside bubble columns. |
| `minecraft:distance_filter` | object |  | Controls spawning based on distance from the nearest player. Mobs typically spawn 24-128 blocks from players. See `spawn/spawn_distancefilter`. |
| `minecraft:height_filter` | object |  | Restricts spawning to specific Y-coordinate ranges. Useful for depth-based mob distribution. See `spawn/spawn_heightfilter`. |
| `minecraft:herd` | object | `[]` | Specifies herd spawning configuration. Can be a single herd object or an array of herd objects. |
| `minecraft:is_experimental` | object |  | Marks this spawn rule as experimental. Only active when the corresponding experiment toggle is enabled. |
| `minecraft:is_persistent` | object |  | When enabled, spawned entities will not despawn naturally. Used for mobs like villagers. |
| `minecraft:mob_event_filter` | object |  | Controls spawning based on whether a specific mob event (like raids or wandering traders) is active. See `spawn/spawn_mobeventfilter`. |
| `minecraft:permute_type` | object | `[]` | Specifies permutation types for spawning. Can be a single object or an array of permutation objects. |
| `minecraft:player_in_village_filter` | object |  | Restricts spawning to when a player is near a village. Used for iron golems, cats, and raid mobs. See `spawn/spawn_playerinvillagefilter`. |
| `minecraft:spawn_event` | object | `{"event":""}` | Triggers a specific entity event when the mob spawns. Commonly used to initialize entity behavior. See `spawn/spawn_mobeventfilter`. |
| `minecraft:spawns_above_block_filter` | object | `{"blocks":[],"distance":1}` | Filters spawning based on blocks above the spawn point. See `spawn/spawn_spawnaboveblockfilter`. |
| `minecraft:spawns_lava` | object |  | Indicates the entity can spawn in lava. |
| `minecraft:spawns_on_block_filter` | objectArray | `[]` | Specifies blocks on which this entity can spawn. Can be a single block name string, an array of block objects with name property, or an array of strings representing block names. |
| `minecraft:spawns_on_block_prevented_filter` | stringArray | `[]` | Specifies blocks on which this entity cannot spawn. Can be an array of block name strings. |
| `minecraft:spawns_on_surface` | object |  | When enabled, this entity can spawn on the world surface. |
| `minecraft:spawns_underground` | object |  | When enabled, this entity can spawn underground (below the surface). |
| `minecraft:spawns_underwater` | object |  | When enabled, this entity can spawn in water. |
| `minecraft:weight` | object |  | Relative spawn probability compared to other entities in the same biome. Higher values = more frequent spawns. 100 is typical for common mobs. See `spawn/spawn_weight`. |
| `minecraft:world_age_filter` | object |  | Restricts spawning based on world age (in ticks). Useful for progressive difficulty where certain mobs appear later. See `spawn/spawn_worldagefilter`. |

### Spawn BrightnessFilter (spawn_brightnessfilter)

Restricts mob spawning based on light level at the spawn location. Hostile mobs typically spawn in darkness (light level 0-7), while passive mobs spawn in brighter areas. Allows setting min/max brightness thresholds and whether to adjust for spawning on a block surface.

| Field | Type | Default | Notes |
|---|---|---|---|
| `adjust_for_weather` | boolean | `false` | When true, brightness is adjusted for the current weather (rain/thunder reduce light levels). |
| `max` | int | `15` | Maximum light level (0-15) at which this entity can spawn. |
| `min` | int | `0` | Minimum light level (0-15) at which this entity can spawn. |

### Spawn DelayFilter (spawn_delayfilter)

Delays entity spawning by a configurable amount of time after spawn conditions are met. Useful for preventing immediate respawning after mob deaths or creating spawn cooldowns for rare creatures.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string | `""` | Identifier |
| `max` | int | `0` | Max |
| `min` | int | `0` | Min |
| `spawn_chance` | int | `100` | Spawn Chance |

### Spawn DensityLimit (spawn_densitylimit)

Limits how many of this entity type can exist in an area, with separate caps for surface and underground spawning. This prevents overpopulation and controls mob density for performance and gameplay balance.

| Field | Type | Default | Notes |
|---|---|---|---|
| `surface` | int | `-1` | Surface |
| `underground` | int | `-1` | Underground |

### Spawn Description (spawn_description)

The description block that identifies which entity these spawn rules apply to, via the entity identifier (e.g., 'minecraft:zombie'). Also specifies the population control group for managing spawn caps.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |
| `population_control` | string | `""` | Population Control |

### Spawn DifficultyFilter (spawn_difficultyfilter)

Restricts mob spawning to specific difficulty levels (Peaceful, Easy, Normal, Hard). For example, hostile mobs don't spawn on Peaceful, and some dangerous variants only appear on Hard difficulty.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | stringEnum | `"hard"` | Max Values: `easy`, `hard`, `normal`, `peaceful`. |
| `min` | stringEnum | `"peaceful"` | Min Values: `easy`, `hard`, `normal`, `peaceful`. |

### Spawn DistanceFilter (spawn_distancefilter)

Controls spawning based on distance from the nearest player. Mobs typically spawn within a certain radius around players (24-128 blocks) and despawn when players move too far away.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `128` | Max |
| `min` | int | `24` | Min |

### Spawn HeightFilter (spawn_heightfilter)

Restricts entity spawning to specific Y-coordinate ranges. Useful for creating depth-based mob distribution like slimes in swamps (below Y=40), or limiting surface mobs from spawning underground.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `128` | Max |
| `min` | int | `24` | Min |

### Spawn Herd (spawn_herd)

Configures group spawning behavior, including minimum and maximum herd size. Mobs like wolves, chickens, and zombies spawn in groups rather than individually. Also allows running events on the first N spawns or after M spawns.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | An event to run after M number of the herd have spawned |
| `event_skip_count` | int | `0` | Number of the herd to skip before running the event |
| `initial_event` | string | `""` | Event run for the first N of the herd are placed. |
| `initial_event_count` | int | `0` | Number of times that the initial event will run |
| `max_size` | int | `1` | Maximum number in this group to attempt to spawn |
| `min_size` | int | `1` | Minimum number in this group to attempt to spawn |

### Spawn MobEventFilter (spawn_mobeventfilter)

Controls spawning based on whether a specific mob event is active. Mob events are world-level toggles (like raids or wandering traders) that can enable or disable certain spawn behaviors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | Event |

### Spawn PermuteType (spawn_permutetype)

Weighted spawn permutation that selects which entity variant to spawn. Each permutation has an entity identifier and weight—the game randomly chooses between permutations based on relative weights when the spawn rule activates. Creates natural mob variety in spawn distributions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity_type` | string | `""` | Permutation to spawn when selected |
| `min_guaranteed` | int | `0` | The minimum number of this permutation to spawn |
| `weight` | int |  | **required**. The ratio of all of the entities that are in the permutation |

### Spawn PlayerInVillageFilter (spawn_playerinvillagefilter)

Restricts spawning based on whether a player is within village boundaries. Used for village-specific spawns like iron golems, cats, and raid mobs that should only appear when players are near villages.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distance` | int |  | **required**. Distance |
| `village_border_tolerance` | int | `10` | Village Border Tolerance |

### Spawn Rules (spawn_rules)

Defines the complete spawn rules for an entity type, including population control group, spawn conditions (biome, light, difficulty, etc.), and herd configuration. This is the root structure of a spawn_rules JSON file in behavior packs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditions` | objectArray | `[]` | Array of spawn condition objects that define when and how this entity spawns. See `spawn/spawn_biomeconditions`. |
| `description` | object |  | **required**. Description See `spawn/spawn_description`. |

### spawn_rules_document (spawn_rules_document)

A spawn rules definition document for Minecraft Bedrock Edition. This describes the complete JSON file structure including format_version and the minecraft:spawn_rules wrapper.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this spawn rules file. |
| `minecraft:spawn_rules` | object |  | **required**. The spawn rules definition container. See `spawn/spawn_rules`. |

### spawn_rules_header (spawn_rules_header)

Defines the header fields for a spawn_rules document.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Id |
| `population_control` | string |  | Specifies a group that this mob is connected with, of which only so many mobs in the group can be spawned |

### Spawn SpawnAboveBlockFilter (spawn_spawnaboveblockfilter)

_**deprecated**_

Filters spawning based on blocks above the spawn location. This component appears to have been deprecated or changed in versions after 1.17.20.

> This spawn condition was used in versions 1.17.20 and earlier but appears to have been removed or replaced in newer versions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` | object | `[]` | Blocks |
| `distance` | int | `1` | Distance |

### Spawn Weight (spawn_weight)

Defines the relative probability of this entity spawning compared to other entities in the same biome and spawn pool. Higher weight values mean more frequent spawns. A weight of 100 is typical for common mobs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default` | int |  | **required**. Default |
| `rarity` | int | `0` | Rarity |

### Spawn WorldAgeFilter (spawn_worldagefilter)

Restricts spawning based on how long the world has existed (measured in ticks). Useful for progressive difficulty where certain mobs only start appearing after the world has been played for a minimum amount of time.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `-1` | Max |
| `min` | int | `0` | Min |

### TradeTable (trade)

Defines a trade table with tiers of trades for villagers or other trading entities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `56017534` |  |  | struct SharedTypes_v1_21_30_TradeItem |
| `315535208` |  |  | class Json_Value |
| `943617905` |  |  | struct SharedTypes_v1_21_30_TradeTier |
| `1088251937` |  |  | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `1093643626` |  |  | struct SharedTypes_v1_21_30_TradeItemList |
| `2298823339` |  |  | struct SharedTypes_v1_21_30_TradeItem_Quantity |
| `3153354884` |  |  | struct SharedTypes_v1_21_30_TradeGroup |
| `3738829565` |  |  | struct SharedTypes_v1_21_30_Trade |
| `4150989894` |  |  | Filter Test |
| `tiers` | objectArray |  | **required**. Array of trade tiers. Each tier unlocks as the villager gains experience. Novice (tier 1) is always available. See `trade/tradetier`. |
| `weight` | int |  | The weight/probability of this trade being selected. |
| `format_version` | string |  | The format version of this trade table. |

### TradeGroup (tradegroup)

A group of trades from which one or more can be randomly selected for a villager to offer.

| Field | Type | Default | Notes |
|---|---|---|---|
| `trades` | objectArray |  | Array of possible trades in this group. The specified number will be randomly chosen. See `trade/tradesingle`. |
| `num_to_select` | int | `1` | The number of trades to randomly select from this group to offer to the player. Typically 1-2. Range: 1... |

### TradeItem (tradeitem)

Defines an item used in a trade, either as input (wants) or output (gives).

| Field | Type | Default | Notes |
|---|---|---|---|
| `__DEP_fnctns` |  |  | __DEP_fnctns |
| `functions` | objectArray |  | Array of functions to apply to the trade item, such as enchantments. |
| `item` | string |  | **required**. The item identifier, e.g., 'minecraft:emerald' or 'minecraft:coal'. Can include data value suffix like 'minecraft:coal:0'. |
| `__DEP_fltrs` |  |  | __DEP_fltrs |
| `quantity` | int | `1` | Number of this item involved in the trade. Can be a fixed number or an object with min/max for random quantity. Range: 1... |
| `price_multiplier` | float | `0.05` | Multiplier applied to price increases when supply/demand changes. Higher values mean prices fluctuate more. Typical value is 0.05. |
| `filters` | object |  | Optional filters that must pass for this item to be included in the trade. See `entityfilters/filter_group`. |
| `choice` | objectArray |  | Alternative items that can be traded. |

### TradeItemQuantity (tradeitem_quantity)

Defines a random quantity range for a trade item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `1` | Maximum number of items for this trade. Range: 1... |
| `min` | int | `1` | Minimum number of items for this trade. Range: 1... |

### TradeItemList (tradeitemlist)

Defines a list of alternative items that can satisfy a trade requirement. When used with the choice property, any one of the listed items can be used to complete the trade. This provides flexibility in what items a player can offer or receive.

| Field | Type | Default | Notes |
|---|---|---|---|
| `choice` |  |  | choice |

### TradeSingle (tradesingle)

Defines a single trade offered by a villager or wandering trader.

| Field | Type | Default | Notes |
|---|---|---|---|
| `wants` | objectArray |  | **required**. Array of items the villager wants to receive from the player in exchange. Usually 1-2 items. See `trade/tradeitem`. |
| `gives` | objectArray |  | **required**. Array of items the villager gives to the player in exchange. Usually 1 item. See `trade/tradeitem`. |
| `trader_exp` | int | `1` | Amount of experience the villager gains when this trade is used. Contributes to villager leveling up. Range: 0... |
| `max_uses` | int | `12` | Maximum number of times this trade can be used before it becomes locked. Trade refreshes when villager restocks at workstation. Range: 1... |
| `reward_exp` | boolean | `true` | Whether the player receives experience orbs when completing this trade. |

### TradeTableData (tradetabledata)

Contains internal metadata and type definitions for trade table structures. This form defines the data types used by trade tables, including TradeItem, TradeTier, TradeGroup, and other supporting structures.

| Field | Type | Default | Notes |
|---|---|---|---|
| `56017534` |  |  | TradeItem |
| `315535208` |  |  | class Json_Value |
| `943617905` |  |  | TradeTier |
| `1088251937` |  |  | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `1093643626` |  |  | TradeItemList |
| `2298823339` |  |  | TradeItem_Quantity |
| `3153354884` |  |  | TradeGroup |
| `3738829565` |  |  | Trade |
| `4150989894` |  |  | Filter Test |

### TradeTier (tradetier)

Defines a tier of trades that becomes available as a villager levels up.

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` | objectArray |  | Array of trade groups available at this tier. Each group can randomly select one or more trades to offer. See `trade/tradegroup`. |
| `total_exp_required` | int | `0` | The total experience points required for this tier to unlock. For novice (tier 1), this is typically 0. Higher tiers require more XP (e.g., 10, 70, 150, 250). Range: 0... |
| `trades` | objectArray |  | Array of trades directly in this tier, without grouping. Alternative to using groups. See `trade/tradesingle`. |
