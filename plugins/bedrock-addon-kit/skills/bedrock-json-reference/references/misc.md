# Shared sub-objects

Generated 2026-10-26 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/misc). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (64)

`minecraft:behavior.breed`, `minecraft:behavior.charge_attack`, `minecraft:behavior.circle_around_anchor`, `minecraft:behavior.controlled_by_player`, `minecraft:behavior.dragonflaming`, `minecraft:behavior.eat_mob`, `minecraft:behavior.roar`, `minecraft:behavior.slime_attack`, `minecraft:behavior.slime_float`, `minecraft:behavior.slime_keep_on_jumping`, `minecraft:behavior.slime_random_direction`, `minecraft:behavior.sniff`, `minecraft:behavior.sonic_boom`, `minecraft:behavior.stay_near_noteblock`, `minecraft:behavior.swim_idle`, `minecraft:behavior.swim_up_for_breath`, `minecraft:behavior.swim_wander`, `minecraft:behavior.swoop_attack`, `minecraft:behavior.transport_items`, `minecraft:block_placer`, `minecraft:bundle_interaction`, `minecraft:capped`, `minecraft:climate`, `minecraft:compostable`, `minecraft:cooldown`, `minecraft:creature_spawn_probability`, `minecraft:damage_absorption`, `minecraft:digger`, `minecraft:display_name`, `minecraft:durability`, `minecraft:durability_sensor`, `minecraft:durability_sensor durability_threshold`, `minecraft:dyeable`, `minecraft:enchantable`, `minecraft:entity_placer`, `minecraft:experience_reward`, `minecraft:food`, `minecraft:frozen_ocean`, `minecraft:humidity`, `minecraft:jigsaw_structure_metadata`, `minecraft:map_tints`, `minecraft:mesa`, `minecraft:mountain_parameters`, `minecraft:multinoise_generation_rules`, `minecraft:overworld`, `minecraft:overworld_generation_rules`, `minecraft:overworld_height`, `minecraft:projectile`, `minecraft:record`, `minecraft:repairable`, `minecraft:replace_biomes`, `minecraft:shooter`, `minecraft:storage_item`, `minecraft:storage_weight_limit`, `minecraft:storage_weight_modifier`, `minecraft:surface_builder`, `minecraft:surface_material_adjustments`, `minecraft:swamp`, `minecraft:tags`, `minecraft:the_end`, `minecraft:throwable`, `minecraft:tick_world`, `minecraft:use_modifiers`, `minecraft:wearable`

### minecraft:behavior.breed

Allows this mob to breed with other mobs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | Movement speed multiplier applied to the mob when using this AI Goal. Default value: 1. |

### minecraft:behavior.charge_attack

Allows this entity to damage a target by using a running attack.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `max_distance` | float |  | A charge attack cannot start if the entity is farther than this distance to the target. Default value: 3. |
| `min_distance` | float |  | A charge attack cannot start if the entity is closer than this distance to the target. Default value: 2. |
| `priority` | int |  | Priority |
| `sound_event` | string |  | LevelSoundEvent |
| `speed_multiplier` | float |  | Modifies the entity's speed when charging toward the target. Default value: 1. |
| `success_rate` | float |  | Percent chance this entity will start a charge attack, if not already attacking (1.0 = 100%). Default value: 0.1428. |

### minecraft:behavior.circle_around_anchor

Causes an entity to circle around an anchor point placed near a point or target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `angle_change` | float |  | Number of degrees to change this entity's facing by, when the entity selects its next anchor point. Default value: 15.0. |
| `control_flags` |  |  | Control Flags |
| `goal_radius` | float |  | Maximum distance from the anchor-point in which this entity considers itself to have reached the anchor point. This is to prevent the entity from bouncing back and forth trying to reach a specific spot. Default value: 0.500000. |
| `height_above_target_range` |  |  | The number of blocks above the target that the next anchor point can be set. This value is used only when the entity is tracking a target. Default value: [0.0, 0.0]. See `misc/floatrange`. |
| `height_adjustment_chance` | float |  | Percent chance to determine how often to increase or decrease the current height around the anchor point. 1 = 100%. "height_change_chance" is deprecated and has been replaced with "height_adjustment_chance". Default value: 0.003. |
| `height_offset_range` |  |  | Vertical distance from the anchor point this entity must stay within, upon a successful height adjustment. Default value: [0.0, 0.0]. See `misc/floatrange`. |
| `priority` | int |  | Priority |
| `radius_adjustment_chance` | float |  | Percent chance to determine how often to increase the size of the current movement radius around the anchor point. 1 = 100%. "radius_change_chance" is deprecated and has been replaced with "radius_adjustment_chance". Default value: 0.0. |
| `radius_change` | float |  | The number of blocks to increase the current movement radius by, upon successful "radius_adjustment_chance". If the current radius increases over the range maximum, the current radius will be set back to the range minimum and the entity will change between cl… |
| `radius_range` |  |  | Horizontal distance from the anchor point this entity must stay within upon a successful radius adjustment. Default value: [5.0, 5.0]. See `misc/floatrange`. |
| `speed_multiplier` | float |  | Multiplies the speed at which this entity travels to its next desired position. Default value: 1.0. |

### minecraft:behavior.controlled_by_player

Allows the entity to be controlled by a player which is holding the item specified in "minecraft:item_controllable" component's "control_items" field (required). Also requires the "minecraft:movement" component, and the "minecraft:rideable" component. On every tick, the entity will attempt to rotate towards where the player is facing with the control item whilst simultaneously moving forward.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `fractional_rotation` | float |  | The entity will attempt to rotate to face where the player is facing each tick. The entity will target this percentage of their difference in their current facing angles each tick (from 0.0 to 1.0 where 1.0 = 100%). This is limited by "fractional_rotation_lim… |
| `fractional_rotation_limit` | float |  | Limits the total degrees the entity can rotate to face where the player is facing on each tick. Default value: 5.0. |
| `mount_speed_multiplier` | float |  | Speed multiplier of mount when controlled by player. Default value: 1.0. |
| `priority` | int |  | Priority |

### minecraft:behavior.dragonflaming

Allows this entity to use a flame-breath attack. Can only be used by the Ender Dragon.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `cooldown_time` | float |  | Time (in seconds) between each start of the cycle to roar, then breath flame. Default value: 10. |
| `flame_time` | float |  | Time (in seconds), after roar, to breath flame. Default value: 0.5. |
| `ground_flame_count` | int |  | Number of ground flame-breath attacks to use before flight-takeoff. Default value: 4. |
| `priority` | int |  | Priority |
| `roar_time` | float |  | Time (in seconds) to roar, before breathing flame. Default value: 2. |
| `smoke_color` | string |  | Default value: #DC00EF. |
| `smoke_radius` | float |  | Default value: 5. |
| `smoke_time` | float |  | Default value: 10. |

### minecraft:behavior.eat_mob

Allows the entity to eat a specified Mob.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `eat_animation_time` | float |  | Sets the time in seconds the eat animation should play for. Default value: 1.000000. |
| `eat_mob_sound` | string |  | Sets the sound that should play when eating a mob. |
| `loot_table` | string |  | The loot table for loot to be dropped when eating a mob. |
| `priority` | int |  | Priority |
| `pull_in_force` | float |  | Sets the force which the mob-to-be-eaten is pulled towards the eating mob. Default value: 1.000000. |
| `reach_mob_distance` | float |  | Sets the desired distance to be reached before eating the mob. Default value: 1.000000. |
| `run_speed` | float |  | Sets the entity's speed when running toward the target. Default value: 1.000000. |

### minecraft:behavior.roar

Allows this entity to roar at another entity based on data in minecraft:anger_level. Once the anger threshold specified in minecraft:anger_level has been reached, this entity will roar for the specified amount of time, look at the other entity, apply anger boost towards it, and finally target it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `duration` | float |  | The amount of time to roar for. Default value: 0. |
| `priority` | int |  | Priority |

### minecraft:behavior.slime_attack

Causes the entity to grow tired every once in a while, while attacking.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `grow_tired_cooldown_time` | float |  | Grow Tired Cooldown Time |
| `priority` | int |  | Priority |
| `set_persistent` | boolean |  | Allows the actor to be set to persist upon targeting a player Default value: false. |
| `speed_multiplier` | float |  | During attack behavior, this multiplier modifies the entity's speed when moving toward the target. Default value: 1. |
| `x_max_rotation` | float |  | Maximum rotation (in degrees), on the X-axis, this entity can rotate while trying to look at the target. Default value: 10. |
| `y_max_rotation` | float |  | Maximum rotation (in degrees), on the Y-axis, this entity can rotate while trying to look at the target. Default value: 10. |

### minecraft:behavior.slime_float

Allow slimes to float in water / lava. Can only be used by Slime and Magma Cubes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `jump_chance_percentage` | float |  | Percent chance a slime or magma cube has to jump while in water / lava. Default value: 0.8. |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | Determines the multiplier the entity's speed is modified by when moving through water / lava. Default value: 1.2. |

### minecraft:behavior.slime_keep_on_jumping

Allows the entity to continuously jump around like a slime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | Determines the multiplier this entity's speed is modified by when jumping around. Default value: 1. |

### minecraft:behavior.slime_random_direction

Allows the entity to move in random directions like a slime.

| Field | Type | Default | Notes |
|---|---|---|---|
| `add_random_time_range` | int |  | Additional time (in whole seconds), chosen randomly in the range of [0, "add_random_time_range"], to add to "min_change_direction_time". Default value: 3. |
| `control_flags` |  |  | Control Flags |
| `min_change_direction_time` | float |  | Constant minimum time (in seconds) to wait before choosing a new direction. Default value: 2. |
| `priority` | int |  | Priority |
| `turn_range` | int |  | Maximum rotation angle range (in degrees) when randomly choosing a new direction. Default value: 360. |

### minecraft:behavior.sniff

Allows this entity to detect the nearest player within "sniffing_radius" and update its "minecraft:suspect_tracking" component state

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `cooldown_range` |  |  | Cooldown range between sniffs in seconds Default value: [3.0, 10.0]. See `misc/floatrange`. |
| `duration` | float |  | Sniffing duration in seconds Default value: 1. |
| `priority` | int |  | Priority |
| `sniffing_radius` | float |  | Mob detection radius Default value: 5. |
| `suspicion_radius_horizontal` | float |  | Mob suspicion horizontal radius. When a player is within this radius horizontally, the anger level towards that player is increased Default value: 3. |
| `suspicion_radius_vertical` | float |  | Mob suspicion vertical radius. When a player is within this radius vertically, the anger level towards that player is increased Default value: 3. |

### minecraft:behavior.sonic_boom

Allows this entity to perform a 'sonic boom' ranged attack

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_cooldown` | float |  | Cooldown in seconds required after using this attack until the entity can use sonic boom again. Default value: 5. |
| `attack_damage` | float |  | Attack damage of the sonic boom. Default value: 30. |
| `attack_range_horizontal` | float |  | Horizontal range (in blocks) at which the sonic boom can damage the target. Default value: 15. |
| `attack_range_vertical` | float |  | Vertical range (in blocks) at which the sonic boom can damage the target. Default value: 20. |
| `attack_sound` | string |  | Sound event for the attack. |
| `charge_sound` | string |  | Sound event for the charge up. |
| `control_flags` |  |  | Control Flags |
| `duration` | float |  | Goal duration in seconds Default value: 0. |
| `duration_until_attack_sound` | float |  | Duration in seconds until the attack sound is played. Default value: 1.7. |
| `knockback_height_cap` | float |  | Height cap of the attack knockback's vertical delta. Default value: 0. |
| `knockback_horizontal_strength` | float |  | Horizontal strength of the attack's knockback applied to the attack target. Default value: 0. |
| `knockback_vertical_strength` | float |  | Vertical strength of the attack's knockback applied to the attack target. Default value: 0. |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | This multiplier modifies the attacking entity's speed when moving toward the target. Default value: 1. |

### minecraft:behavior.stay_near_noteblock

The entity will attempt to toss the items from its inventory to a nearby recently played noteblock.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `listen_time` | int |  | Sets the time an entity should stay near a noteblock after hearing it. Default value: 30. |
| `priority` | int |  | Priority |
| `speed` | float |  | Sets the entity's speed when moving toward the block. Default value: 1. |
| `start_distance` | float |  | Sets the distance the entity needs to be away from the block to attempt to start the goal. Default value: 10. |
| `stop_distance` | float |  | Sets the distance from the block the entity will attempt to reach. Default value: 2. |

### minecraft:behavior.swim_idle

Allows the entity go idle, if swimming. Entity must be in water.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `idle_time` | float |  | Amount of time (in seconds) to stay idle. Default value: 5. |
| `priority` | int |  | Priority |
| `success_rate` | float |  | Percent chance this entity will go idle, 1.0 = 100%. Default value: 0.1. |

### minecraft:behavior.swim_up_for_breath

Allows the mob to try to move to air once it is close to running out of its total breathable supply. Requires "minecraft:breathable".

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `material_type` | string |  | The material the mob is traveling in. An air block will only be considered valid to move to with a block of this material below it. Options are: "water", "lava", or "any". Default value: water. |
| `priority` | int |  | Priority |
| `search_height` | int |  | The height (in blocks) above the mob's current position that it will search for a valid air block to move to. If a valid block cannot be found, the mob will move to the position this many blocks above it. Default value: 16. |
| `search_radius` | int |  | The radius (in blocks) around the mob's current position that it will search for a valid air block to move to. Default value: 4. |
| `speed_mod` | float |  | Movement speed multiplier of the mob when using this Goal. Default value: 1.4. |

### minecraft:behavior.swim_wander

Allows the entity to wander around while swimming, when not path-finding.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `interval` | float |  | Percent chance to start wandering, when not path-finding. 1 = 100% Default value: 0.00833. |
| `look_ahead` | float |  | Distance to look ahead for obstacle avoidance, while wandering. Default value: 5. |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | This multiplier modifies the entity's speed when wandering. Default value: 1. |
| `wander_time` | float |  | Amount of time (in seconds) to wander after wandering behavior was successfully started. Default value: 5. |

### minecraft:behavior.swoop_attack

Allows an entity to attack using swoop attack behavior; Ideal for use with flying mobs. The behavior ends if the entity has a horizontal collision or gets hit.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  |  | Control Flags |
| `damage_reach` | float |  | Added to the base size of the entity, to determine the target's maximum allowable distance, when trying to deal attack damage. Default value: 0.2. |
| `delay_range` |  |  | Minimum and maximum cooldown time-range (in seconds) between each attempted swoop attack. Default value: [10.0, 20.0]. See `misc/floatrange`. |
| `priority` | int |  | Priority |
| `speed_multiplier` | float |  | During swoop attack behavior, this determines the multiplier the entity's speed is modified by when moving toward the target. Default value: 1. |

### minecraft:behavior.transport_items

A behavior that enables a mob to transport items from and to containers.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_simultaneous_interaction` | boolean |  | When true the mob will wait until a container is not used by other entities before starting to interact with it. Default value: false. |
| `allowed_items` | string |  | A list of item descriptors that are the only items the mob is allowed to transport. If this and "disallowed_items" are both empty, then all items are allowed. If non-empty "disallowed_items" must be empty. Default value: empty. |
| `control_flags` |  |  | Control Flags |
| `destination_container_types` |  |  | A list of block descriptors that should be a container type to put items in. Default value: empty. |
| `disallowed_items` | string |  | A list of item descriptors that are the mob is not allowed to transport. If non-empty "allowed_items" must be empty. Default value: emtpy. |
| `idle_cooldown` | int |  | When the mob cannot find a container in which to get or put items, the goal will stop being active for this amount of time in seconds. Default value: 20. |
| `initial_cooldown` | int |  | How long the mob will wait after spawning or getting the goal added before the goal can start. Default value: 0. |
| `interaction_time` | float |  | The amount of time in seconds spent interacting with the containers. Default value: 3. |
| `max_stack_size` | int |  | The maximum stack size that the mob will try to take from a container. Default value: 64. |
| `max_visited_containers` | int |  | The maximum number of containers that the mob will try to take/place items from before going on cooldown and starting over. Default value: 16. |
| `place_strategy` | string |  | The strategy to use for placing the transported item. Any - always place if there is room, With matching - place if there is a matching item in the container, With matching or empty - like With matching but will also place in empty containers Default value: a… |
| `priority` | int |  | Priority |
| `search_distance` |  |  | The maximum search distance horizontally and vertically at which to find containers for taking or placing items. Default value: Vec2(64,32). |
| `search_strategy` | string |  | The strategy to use for finding source or destination containers. The nearest valid container or a random valid container in range. Default value: random. |
| `source_container_types` |  |  | A list of block descriptors that should be a container type to get items from. Default value: empty. |

### minecraft:block_placer

Items with the block_placer component will place a block when used. This component can also be used instead of the "minecraft:icon" component to render the referenced block as the item icon.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | **required**. Defines the block that will be placed. |
| `replace_block_item` | boolean |  | If true, the item will be registered as the item for this block. This item will be returned by default when the block is broken/picked. Note: the identifier for this item must match the block's identifier for this field to be valid. |
| `use_on` |  |  | List of block descriptors of the blocks that this item can be used on. If left empty, all blocks will be allowed. |

### minecraft:bundle_interaction

[EXPERIMENTAL] Adds bundle-specific interactions and tooltip to the item. Requires a "minecraft:storage_item" component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_viewable_slots` | int |  | The maximum number of slots in the bundle viewable by the player. Can be from 1 to 64. Default is 12. |

### minecraft:capped

Generates surface on blocks with non-solid blocks above or below.

| Field | Type | Default | Notes |
|---|---|---|---|
| `beach_material` |  |  | Material used to decorate surface near sea level. |
| `ceiling_materials` |  |  | **required**. Materials used for the surface ceiling. |
| `floor_materials` |  |  | **required**. Materials used for the surface floor. |
| `foundation_material` |  |  | **required**. Material used to replace solid blocks that are not surface blocks. |
| `sea_material` |  |  | **required**. Material used to replace air blocks below sea level. |
| `type` | string |  | **required**. Controls the type of surface builder to use |

### minecraft:climate

Describes temperature, humidity, precipitation, and similar. Biomes without this component will have default values.

| Field | Type | Default | Notes |
|---|---|---|---|
| `downfall` | float |  | Amount that precipitation affects colors and block changes. Setting to 0 will stop rain from falling in the biome. |
| `snow_accumulation` |  |  | Minimum and maximum snow level, each multiple of 0.125 is another snow layer |
| `temperature` | float |  | Temperature affects a variety of visual and behavioral things, including snow and ice placement, sponge drying, and sky color |

### minecraft:compostable

Specifies that an item is compostable and provides the chance of creating a composting layer in the composter

| Field | Type | Default | Notes |
|---|---|---|---|
| `composting_chance` | int |  | **required**. The chance of this item to create a layer upon composting with the composter. Valid value range is 1 - 100 inclusive |

### minecraft:cooldown

After you use an item, all items with a "minecraft:cooldown" component with the same "category" become unusable for the amount of seconds specified in "duration".

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` | string |  | **required**. All items with the same "category" are put on cooldown when one is used. |
| `duration` | float |  | **required**. How long the item is on cooldown before being able to be used again. |

### minecraft:creature_spawn_probability

Probability that creatures will spawn within the biome when a chunk is generated.

| Field | Type | Default | Notes |
|---|---|---|---|
| `probability` | float |  | Probability between [0.0, 0.75] of creatures spawning within the biome on chunk generation. |

### minecraft:damage_absorption

It allows an item to absorb damage that would otherwise be dealt to its wearer. For this to happen, the item needs to be equipped in an armor slot. The absorbed damage reduces the item's durability, with any excess damage being ignored. Because of this, the item also needs a `minecraft:durability` component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `absorbable_causes` |  |  | **required**. List of damage causes that can be absorbed by the item. By default, no damage cause is absorbed. |

### minecraft:digger

Digger item component specifies how quickly this item can dig specific blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `destroy_speeds` |  |  | A list of blocks to dig with correlating speeds of digging. See `misc/blockinfo`. |
| `use_efficiency` | boolean |  | Determines whether this item should be impacted if the efficiency enchantment is applied to it. |

### minecraft:display_name

The display_name item component specifies the text shown whenever an item's name is displayed, like in hover text.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | string |  | Name shown for an item. |

### minecraft:durability

The durability item component specifies how much damage the item takes before breaking, and allows the item to be combined to repair or augment them.

| Field | Type | Default | Notes |
|---|---|---|---|
| `damage_chance` |  |  | Specifies the percentage chance of this item losing durability. Default is set to 100. Defined as an int range with min and max value. See `misc/intrange`. |
| `max_durability` | int |  | **required**. Max durability is the amount of damage that this item can take before breaking. This is a required parameter and has a minimum of 0. |

### minecraft:durability_sensor

Enables an item to emit effects when it receives damage. Because of this, the item also needs a `minecraft:durability` component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `durability_thresholds` |  |  | **required**. The list of both durability thresholds and effects emitted when each threshold is met. When multiple thresholds are met, only the threshold with the lowest durability after applying the damage is considered. See `misc/minecraft_durability_sensor_durability_threshold`. |

### minecraft:durability_sensor durability_threshold

Defines both the durability threshold, and the effects emitted when that threshold is met.

| Field | Type | Default | Notes |
|---|---|---|---|
| `durability` | int |  | The effects are emitted when the item durability value is less than or equal to this value. |
| `particle_type` | string |  | Particle effect to emit when the threshold is met. |
| `sound_event` | string |  | Sound effect to emit when the threshold is met. |

### minecraft:dyeable

Defines dyeable component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default_color` | string |  | Default Color |

### minecraft:enchantable

The enchantable component specifies what enchantments can be applied to the item. Not all enchantments will have an effect on all item components.

| Field | Type | Default | Notes |
|---|---|---|---|
| `slot` | string |  | **required**. Specifies which types of enchantments can be applied. For example, `bow` would allow this item to be enchanted as if it were a bow. |
| `value` | int |  | **required**. Specifies the value of the enchantment (minimum of 0). |

### minecraft:entity_placer

The entity_placer item component specifies the blocks that the item can be placed on.

| Field | Type | Default | Notes |
|---|---|---|---|
| `dispense_on` |  |  | List of block descriptors of the blocks that this item can be dispensed on. If left empty, all blocks will be allowed. |
| `entity` |  |  | The entity to be placed in the world. |
| `use_on` |  |  | List of block descriptors of the blocks that this item can be used on. If left empty, all blocks will be allowed. |

### minecraft:experience_reward

Defines experience reward component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_bred` |  |  | A Molang expression defining the amount of experience rewarded when this entity is successfully bred. |
| `on_bred_array` |  |  | Bred Array |
| `on_death` |  |  | A Molang expression defining the amount of experience rewarded when this entity dies. |
| `on_death_array` |  |  | Death Array |

### minecraft:food

When an item has a food component, it becomes edible to the player. Must have the 'minecraft:use_duration' component in order to function properly.

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_always_eat` | boolean |  | If true you can always eat this item (even when not hungry). Default is set to false. |
| `nutrition` | int |  | Value that is added to the entity's nutrition when the item is used. Default is set to 0. |
| `saturation_modifier` | float |  | saturation_modifier is used in this formula: (nutrition * saturation_modifier * 2) when applying the saturation buff. Default is set to 0.6. |
| `using_converts_to` | string |  | When used, converts to the item specified by the string in this field. Default does not convert item. |

### minecraft:frozen_ocean

Similar to overworld_surface. Adds icebergs.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` |  |  | **required**. Controls the block type used deep underground in this biome |
| `mid_material` |  |  | **required**. Controls the block type used in a layer below the surface of this biome |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur |
| `sea_floor_material` |  |  | **required**. Controls the block type used as a floor for bodies of water in this biome |
| `sea_material` |  |  | **required**. Controls the block type used for the bodies of water in this biome |
| `top_material` |  |  | **required**. Controls the block type used for the surface of this biome |
| `type` | string |  | **required**. Controls the type of surface builder to use |

### minecraft:humidity

Forces a biome to either always be humid or never humid. Humidity affects the spread chance and spread rate of fire in the biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `is_humid` | boolean |  | **required**. Is Humid |

### minecraft:jigsaw_structure_metadata

Defines jigsaw structure metadata component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. Format version of the contained metadata registry. |
| `minecraft:jigsaw_structure_metadata` |  |  | **required**. The Jigsaw metadata registry. See `misc/jigsaw_structure_metadata_registry`. |

### minecraft:map_tints

Sets the color grass and foliage will be tinted by in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foliage` | string |  | Sets the color foliage will be tinted by in this biome on the map. |
| `grass` |  |  | **required**. Controls whether the grass will use a custom tint color or a noise based tint color. |

### minecraft:mesa

Similar to overworld_surface. Adds colored strata and optional pillars.

| Field | Type | Default | Notes |
|---|---|---|---|
| `bryce_pillars` | boolean |  | **required**. Whether the mesa generates with pillars |
| `clay_material` |  |  | **required**. Base clay block to use |
| `foundation_material` |  |  | **required**. Controls the block type used deep underground in this biome |
| `hard_clay_material` |  |  | **required**. Hardened clay block to use |
| `has_forest` | boolean |  | **required**. Places coarse dirt and grass at high altitudes |
| `mid_material` |  |  | **required**. Controls the block type used in a layer below the surface of this biome |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur |
| `sea_floor_material` |  |  | **required**. Controls the block type used as a floor for bodies of water in this biome |
| `sea_material` |  |  | **required**. Controls the block type used for the bodies of water in this biome |
| `top_material` |  |  | **required**. Controls the block type used for the surface of this biome |
| `type` | string |  | **required**. Controls the type of surface builder to use |

### minecraft:mountain_parameters

Noise parameters used to drive mountain terrain generation in Overworld.

| Field | Type | Default | Notes |
|---|---|---|---|
| `steep_material_adjustment` |  |  | Defines surface material for steep slopes |
| `top_slide` |  |  | Controls the density tapering that happens at the top of the world to prevent terrain from reaching too high |

### minecraft:multinoise_generation_rules

Controls how this biome is instantiated (and then potentially modified) during world generation of the nether.

| Field | Type | Default | Notes |
|---|---|---|---|
| `target_altitude` | float |  | Altitude with which this biome should be generated, relative to other biomes. |
| `target_humidity` | float |  | Humidity with which this biome should be generated, relative to other biomes. |
| `target_temperature` | float |  | Temperature with which this biome should be generated, relative to other biomes. |
| `target_weirdness` | float |  | Weirdness with which this biome should be generated, relative to other biomes. |
| `weight` | float |  | Weight with which this biome should be generated, relative to other biomes. |

### minecraft:overworld

Controls the blocks used for the default Minecraft Overworld terrain generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` |  |  | **required**. Controls the block type used deep underground in this biome |
| `mid_material` |  |  | **required**. Controls the block type used in a layer below the surface of this biome |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur |
| `sea_floor_material` |  |  | **required**. Controls the block type used as a floor for bodies of water in this biome |
| `sea_material` |  |  | **required**. Controls the block type used for the bodies of water in this biome |
| `top_material` |  |  | **required**. Controls the block type used for the surface of this biome |
| `type` | string |  | **required**. Controls the type of surface builder to use |

### minecraft:overworld_generation_rules

Controls how this biome is instantiated (and then potentially modified) during world generation of the overworld.

| Field | Type | Default | Notes |
|---|---|---|---|
| `generate_for_climates` |  |  | Controls the world generation climate categories that this biome can spawn for. A single biome can be associated with multiple categories with different weightings. |
| `hills_transformation` |  |  | What biome to switch to when converting to a hilly biome |
| `mutate_transformation` |  |  | What biome to switch to when converting to a mutated biome |
| `river_transformation` |  |  | What biome to switch to when converting to a river biome (if not the Vanilla 'river' biome) |
| `shore_transformation` |  |  | What biome to switch to when adjacent to an ocean biome |

### minecraft:overworld_height

Noise parameters used to drive terrain height in the Overworld.

| Field | Type | Default | Notes |
|---|---|---|---|
| `noise_params` |  |  | First value is depth - more negative means deeper underwater, while more positive means higher. Second value is scale, which affects how much noise changes as it moves from the surface. |
| `noise_type` | string |  | Specifies a preset based on a built-in setting rather than manually using noise_params |

### minecraft:projectile

Projectile items shoot out, like an arrow.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minimum_critical_power` | float |  | Specifies how long a player must charge a projectile for it to critically hit. |
| `projectile_entity` |  |  | **required**. Which entity is to be fired as a projectile. |

### minecraft:record

Record Item Component. Used by record items to play music.

| Field | Type | Default | Notes |
|---|---|---|---|
| `comparator_signal` | int |  | Specifies signal strength for comparator blocks to use, from 1 - 13. |
| `duration` | float |  | Specifies duration of sound event in seconds, float value. |
| `sound_event` | string |  | Sound event type: 13, cat, blocks, chirp, far, mall, mellohi, stal, strad, ward, 11, wait, pigstep, otherside, 5, relic. |

### minecraft:repairable

The repairable item component specifies which items can be used to repair this item, along with how much durability is gained.

| Field | Type | Default | Notes |
|---|---|---|---|
| `repair_items` | string |  | List of repair item entries. Each entry needs to define a list of strings for `items` that can be used for the repair and an optional `repair_amount` for how much durability is gained. |

### minecraft:replace_biomes

Replaces a specified portion of one or more Minecraft biomes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `replacements` |  |  | **required**. List of biome replacement configurations. Retroactively adding a new replacement to the front of this list will cause the world generation to change. Please add any new replacements to the end of the list. See `misc/biome_replacement`. |

### minecraft:shooter

Shooter Item Component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ammunition` |  |  | Ammunition. See `misc/ammunition`. |
| `charge_on_draw` | boolean |  | Charge on draw? Default is set to false. |
| `max_draw_duration` | float |  | Draw Duration. Default is set to 0. |
| `scale_power_by_draw_duration` | boolean |  | Scale power by draw duration? Default is set to false. |

### minecraft:storage_item

[EXPERIMENTAL] Storage Items can be used by other components to store other items within this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_nested_storage_items` | boolean |  | Determines whether another Storage Item is allowed inside of this item. Default is true. |
| `allowed_items` | string |  | List of items that are exclusively allowed in this Storage Item. If empty all items are allowed. |
| `banned_items` | string |  | List of items that are not allowed in this Storage Item. |
| `max_slots` | int |  | The maximum allowed weight of the sum of all contained items. Maximum is 64. Default is 64. |

### minecraft:storage_weight_limit

Specifies the maximum weight limit that a storage item can hold

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_weight_limit` | int |  | The maximum allowed weight of the sum of all contained items. Maximum is 64. Default is 64. |

### minecraft:storage_weight_modifier

Specifies the weight of this item when stored inside another Storage Item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `weight_in_storage_item` | int |  | The weight of this item when inside another Storage Item. Default is 4. 0 means item is not allowed in another Storage Item. |

### minecraft:surface_builder

Controls the materials used for terrain generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `builder` |  |  | **required**. Controls the block types used for terrain generation. |

### minecraft:surface_material_adjustments

Specify fine-detail changes to blocks used in terrain generation (based on a noise function).

| Field | Type | Default | Notes |
|---|---|---|---|
| `adjustments` |  |  | All adjustments that match the column's noise values will be applied in the order listed. |

### minecraft:swamp

Used to add decoration to the surface of swamp biomes such as water lilies.

| Field | Type | Default | Notes |
|---|---|---|---|
| `foundation_material` |  |  | **required**. Controls the block type used deep underground in this biome. |
| `max_puddle_depth_below_sea_level` | int |  | **required**. Controls the depth at which surface level blocks can be replaced with water for puddles. The number represents the number of blocks (0, 127) below sea level that we will go down to look for a surface block. |
| `mid_material` |  |  | **required**. Controls the block type used in a layer below the surface of this biome. |
| `sea_floor_depth` | int |  | **required**. Controls how deep below the world water level the floor should occur. |
| `sea_floor_material` |  |  | **required**. Controls the block type used as a floor for bodies of water in this biome. |
| `sea_material` |  |  | **required**. Controls the block type used for the bodies of water in this biome. |
| `top_material` |  |  | **required**. Controls the block type used for the surface of this biome. |
| `type` | string |  | **required**. Controls the type of surface builder to use |

### minecraft:tags

The tags component specifies which tags an item has on it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tags` |  |  | An array that can contain multiple item tags. |

### minecraft:the_end

Defines the end component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. Use default Minecraft End terrain generation. |

### minecraft:throwable

Throwable items can be thrown by the player, such as a snowball.

| Field | Type | Default | Notes |
|---|---|---|---|
| `do_swing_animation` | boolean |  | Determines whether the item should use the swing animation when thrown. Default is set to false. |
| `launch_power_scale` | float |  | The scale at which the power of the throw increases. Default is set to 1.0. |
| `max_draw_duration` | float |  | The maximum duration to draw a throwable item. Default is set to 0.0. |
| `max_launch_power` | float |  | The maximum power to launch the throwable item. Default is set to 1.0. |
| `min_draw_duration` | float |  | The minimum duration to draw a throwable item. Default is set to 0.0. |
| `scale_power_by_draw_duration` | boolean |  | Whether or not the power of the throw increases with duration charged. Default is set to false. |

### minecraft:tick_world

Defines if the entity ticks the world and the radius around it to tick.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distance_to_players` | float |  | The distance at which the closest player has to be before this entity despawns. This option will be ignored if never_despawn is true. Default value: 128. |
| `never_despawn` | boolean |  | If true, this entity will not despawn even if players are far away. If false, distance_to_players will be used to determine when to despawn. Default value: true. |
| `radius` | int |  | The area around the entity to tick. Allowed range: 2-6. Default value: 2. |

### minecraft:use_modifiers

This component modifies use effects, including how long the item takes to use and the player's speed when used in combination with components like "shooter", "throwable", or "food".

| Field | Type | Default | Notes |
|---|---|---|---|
| `movement_modifier` | float |  | Modifier value to scale the players movement speed when item is in use. |
| `use_duration` | float |  | How long the item takes to use in seconds. |

### minecraft:wearable

Wearable items can be worn by a player in a specified slot.

| Field | Type | Default | Notes |
|---|---|---|---|
| `hides_player_location` | boolean |  | Determines whether the Player's location is hidden on Locator Maps and the Locator Bar when the wearable item is worn. Default is false. |
| `protection` | int |  | How much protection the wearable item provides. Default is set to 0. |
| `slot` | string |  | **required**. Specifies where the item can be worn. If any non-hand slot is chosen, the max stack size is set to 1. |

## Documents and sub-objects (104)

### Actor Document (actor_document)

Defines actor document configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `component_groups` |  |  | Component Groups See `misc/entity_component_definitions`. |
| `components` |  |  | Components See `misc/entity_component_definitions`. |
| `description` |  |  | **required**. Dynamic value |
| `events` |  |  | Dynamic value |

### aim_assist_categories (aim_assist_categories)

_since 1.21.50_

Defines aim assist targeting categories for different items and situations. Categories specify priority values for targeting blocks and entities based on the item being held.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of the aim assist categories file. |
| `minecraft:aim_assist_categories` | object |  | **required**. The root object containing the category definitions. |

### aim_assist_preset (aim_assist_preset)

_since 1.21.50_

Defines an aim assist preset that configures how aim assist behaves for a player. Presets specify which categories to use for different items and hands, as well as exclusion lists.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of the aim assist preset file. |
| `minecraft:aim_assist_preset` | object |  | **required**. The root object containing the preset definition. |

### AlwaysTrueBlock (alwaystrueblock)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | **required**. BlockType |

### AlwaysTruePos (alwaystruepos)

Predicate that always evaluates to true. This is the default predicate if no other predicate is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | **required**. PosType |

### Ammunition (ammunition)

Defines ammunition configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `item` | string |  | **required**. Ammunition item description identifier. |
| `search_inventory` | boolean |  | Can search inventory? Default is set to false. |
| `use_in_creative` | boolean |  | Can use in creative mode? Default is set to false. |
| `use_offhand` | boolean |  | Can use off-hand? Default is set to false. |

### AppendLoot (appendloot)

Modifier will attempt to add loot to a block entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `loot_table` |  |  | **required**. The loot table to append |
| `type` | string |  | **required**. BlockEntityModifierType |

### AxisAlignedLinear (axisalignedlinear)

Predicate that evaluates to true if the block is within the distance range along the provided axis and a random number is generated between the chance range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `axis` | string |  | PositionalBlockRuleAxis |
| `max_chance` | float |  | Max Chance |
| `max_dist` | int |  | Max Dist |
| `min_chance` | float |  | Min Chance |
| `min_dist` | int |  | Min Dist |
| `predicate_type` | string |  | **required**. PosType |

### Biome Components (biome_components)

Any components that this Biome uses

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:climate` |  |  | Describes temperature, humidity, precipitation, and similar. Biomes without this component will have default values. See `misc/minecraft_climate`. |
| `minecraft:creature_spawn_probability` |  |  | Probability that creatures will spawn within the biome when a chunk is generated. See `misc/minecraft_creature_spawn_probability`. |
| `minecraft:humidity` |  |  | Forces a biome to either always be humid or never humid. Humidity affects the spread chance and spread rate of fire in the biome. See `misc/minecraft_humidity`. |
| `minecraft:map_tints` |  |  | Sets the color grass and foliage will be tinted by in this biome on the map. See `misc/minecraft_map_tints`. |
| `minecraft:mountain_parameters` |  |  | Noise parameters used to drive mountain terrain generation in Overworld. See `misc/minecraft_mountain_parameters`. |
| `minecraft:multinoise_generation_rules` |  |  | Controls how this biome is instantiated (and then potentially modified) during world generation of the nether. See `misc/minecraft_multinoise_generation_rules`. |
| `minecraft:overworld_generation_rules` |  |  | Controls how this biome is instantiated (and then potentially modified) during world generation of the overworld. See `misc/minecraft_overworld_generation_rules`. |
| `minecraft:overworld_height` |  |  | Noise parameters used to drive terrain height in the Overworld. See `misc/minecraft_overworld_height`. |
| `minecraft:partially_frozen` |  |  | Component will impact the temperature in a frozen biome, causing some areas to not be frozen. Ex: patchy ice, patchy snow |
| `minecraft:replace_biomes` |  |  | Replaces a specified portion of one or more Minecraft biomes. See `misc/minecraft_replace_biomes`. |
| `minecraft:surface_builder` |  |  | Controls the materials used for terrain generation. See `misc/minecraft_surface_builder`. |
| `minecraft:surface_material_adjustments` |  |  | Specify fine-detail changes to blocks used in terrain generation (based on a noise function). See `misc/minecraft_surface_material_adjustments`. |
| `minecraft:tags` |  |  | Attach arbitrary string tags to this biome. Most biome tags are referenced by JSON settings, but some meanings of tags are directly implemented in the game's code. These tags are listed here: birch: Biome uses wildflowers (mutually exclusive with other flower… See `misc/minecraft_tags`. |

### Biome Definition (biome_definition)

Contains a description and components to define a Biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` |  |  | **required**. Components for this Biome. See `misc/biome_components`. |
| `description` |  |  | **required**. Non-component settings, including the Biome name. See `misc/biome_description`. |

### Biome Description (biome_description)

Contains non-component settings for a Biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` |  |  | **required**. The name of the Biome, used by other features like the '/locate biome' command. Identifiers should only be lowercase. |

### Biome JSON File (biome_json_file)

Contains a format version and a biome definition

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | string |  | **required**. Version of the JSON schema used by this file |
| `minecraft:biome` |  |  | **required**. A single biome definition See `misc/biome_definition`. |

### Biome Replacement (biome_replacement)

Represents the replacement information used to determine the placement of the overriding biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `amount` | float |  | **required**. Noise value used to determine whether or not the replacement is attempted, similar to a percentage. Must be in the range (0.0, 1.0]. |
| `dimension` | string |  | **required**. Dimension in which this replacement can happen. Must be 'minecraft:overworld'. |
| `noise_frequency_scale` | float |  | **required**. Scaling value used to alter the frequency of replacement attempts. A lower frequency will mean a bigger contiguous biome area that occurs less often. A higher frequency will mean smaller contiguous biome areas that occur more often. Must be in the range (0.0,… |
| `targets` |  |  | **required**. Biomes that are going to be replaced by the overriding biome. Target biomes must not contain namespaces. **Correction (checked in game 2026-10-28):** write full ids (`minecraft:plains`). The game rejects bare names ("No biome found with name", "Missing referenced asset") and drops the whole biome. |

### BiomeConditions (biomeconditions)

Biome specific rules for spawning

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome_filter` |  |  | Filter to limit spawns to specific biomes. |
| `herds` |  |  | Configurations for size and events when spawning groups of entities See `misc/herd`. |
| `mob_event_filter` | string |  | Filter to exclude entities if the event is disabled. |
| `permute_types` |  |  | List of randomly choosable permutations of the entity See `misc/permutetype`. |
| `weight` | int |  | **required**. The weight used when comparing other entities that can spawn within a biome |

### BlockDefinitionDocument (blockdefinitiondocument)

Defines blockdefinitiondocument configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` |  |  | **required**. Description See `misc/description`. |

### BlockDescriptorProxy (blockdescriptorproxy)

Defines blockdescriptorproxy configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | Name |
| `states` | int |  | States |
| `tags` | string |  | Tags |

### BlockIgnore (blockignore)

Specifies block types in the template that should be ignored by other processors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` |  |  | **required**. List of blocks evaluated on all blocks of a Structure Template. If a block is matched in the provided list the block will be ignored for processing. |
| `processor_type` | string |  | **required**. Jigsaw Processor Type |

### BlockInfo (blockinfo)

Defines blockinfo configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | **required**. Block to be dug. |
| `speed` | int |  | **required**. Digging speed for the correlating block(s). |

### BlockMatch (blockmatch)

Predicate that evaluates to true if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | **required**. The block to match against. |
| `predicate_type` | string |  | **required**. BlockType |

### BlockRules (blockrules)

Replaces and modifies blocks based on a series of rules

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | string |  | **required**. Jigsaw Processor Type |
| `rules` |  |  | **required**. List of block rules evaluated on all blocks of a Structure Template. Block rules are evaluated in order. If a block rule succeeds and the output_state is set, the output_state block will be used as the input_predicate block for subsequent rules. See `misc/processor_rule`. |

### BlockStateMatch (blockstatematch)

Predicate that evaluates to true if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_state` |  |  | **required**. The block state to match against. |
| `predicate_type` | string |  | **required**. BlockType |

### Bounds (bounds)

Defines bounds configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | **required**. Max |
| `min` | int |  | **required**. Min |

### Box (box)

Defines box configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` |  |  | **required**. Max |
| `min` |  |  | **required**. Min |

### Capped (capped)

Processor that wraps a processor and caps the number of times the delegated processor can be applied.

| Field | Type | Default | Notes |
|---|---|---|---|
| `delegate` |  |  | **required**. The processor that will be executed. |
| `limit` |  |  | **required**. The maximum number of times that this delegate can be applied. |
| `processor_type` | string |  | **required**. Jigsaw Processor Type |

### Components (components)

Defines components configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:dimension_bounds` |  |  | Minecraft Dimension Bounds See `misc/bounds`. |
| `minecraft:generation` |  |  | **required**. Minecraft Generation See `misc/generation`. |

### ConstantHeightProviderType (constantheightprovidertype)

Constant anchor point

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. HeightProviderType |
| `value` |  |  | **required**. Constant anchor point |

### ConstantIntProvider (constantintprovider)

Specifies a constant integer

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. IntProviderType |
| `value` | int |  | **required**. Constant value |

### Crafting Catalog Category (crafting_catalog_category)

Represents a collection of groups of items in a category..

| Field | Type | Default | Notes |
|---|---|---|---|
| `category_name` | string |  | **required**. The category that the items will go to. This is restricted to construction, nature, equipment, or items. |
| `groups` |  |  | **required**. The groups that we are adding to a category. See `misc/crafting_catalog_group`. |

### Crafting Catalog Document (crafting_catalog_document)

The root object for defining the crafting catalog

| Field | Type | Default | Notes |
|---|---|---|---|
| `categories` |  |  | **required**. The categories we are adding groups to. See `misc/crafting_catalog_category`. |

### Crafting Catalog Group (crafting_catalog_group)

Represents a group of items. A group can be collapsible if it is provided with a group identifier, or added a set of loose items without an icon.

| Field | Type | Default | Notes |
|---|---|---|---|
| `group_identifier` |  |  | Optional field to give an icon and name to a group. Otherwise the items are added as loose items. See `misc/crafting_catalog_group_icon`. |
| `items` |  |  | **required**. The items to add to the group. |

### Crafting Catalog Group Icon (crafting_catalog_group_icon)

The identifier of a group of items.

| Field | Type | Default | Notes |
|---|---|---|---|
| `icon` |  |  | The item or block that represents the group. |
| `name` | string |  | **required**. A localization key representing the name of the group that starts with a namespace. The 'minecraft' namespace is reservered for the Vanilla game. Creating new group names starting with 'minecraft' run the risk of being overwritten in later updates. |

### custom_map_tint_grass_noise (custom_map_tint_grass_noise)

Makes grass use the noise based colors for tinting in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. Controls the type of grass tint to use. |

### custom_map_tint_grass_tint (custom_map_tint_grass_tint)

Sets the color grass will be tinted by in this biome on the map.

| Field | Type | Default | Notes |
|---|---|---|---|
| `tint` | string |  | **required**. Tint color used in this biome on the map. |
| `type` | string |  | **required**. Controls the type of grass tint to use. |

### description (description)

Contains the required identifier for the item. May contain optional fields like menu_category.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` |  |  | **required**. Unique name for the item that must include a namespace and must not use the Minecraft namespace unless overriding a Vanilla item. |
| `menu_category` |  |  | menu_category contains the creative group name and category for this item. See `misc/menu_category`. |

### Dimension (dimension)

Defines dimension configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` |  |  | **required**. Components See `misc/components`. |
| `description` |  |  | **required**. Description See `misc/description`. |

### DimensionDocument (dimensiondocument)

Defines dimensiondocument configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:dimension` |  |  | **required**. Minecraft Dimension See `misc/dimension`. |

### DimensionPaddingRange (dimensionpaddingrange)

Specifies the padding for the top and bottom of the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `bottom` | int |  | The padding from the bottom of the world |
| `top` | int |  | The padding from the top of the world |

### DirectPoolAlias (directpoolalias)

Pool alias for a Direct target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Direct pool |
| `target` |  |  | **required**. Target pool |

### EmptyPoolElement (emptypoolelement)

Defines emptypoolelement configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. The type of element |

### Entity component definitions (entity_component_definitions)

Defines entity component definitions configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:absorption` |  |  | Dynamic value |
| `minecraft:addrider` |  |  | Dynamic value |
| `minecraft:admire_item` |  |  | Dynamic value |
| `minecraft:ageable` |  |  | Dynamic value |
| `minecraft:ambient_sound_interval` |  |  | Dynamic value |
| `minecraft:anger_level` |  |  | Dynamic value |
| `minecraft:angry` |  |  | Dynamic value |
| `minecraft:annotation.break_door` |  |  | Dynamic value |
| `minecraft:annotation.open_door` |  |  | Dynamic value |
| `minecraft:area_attack` |  |  | Dynamic value |
| `minecraft:attack` |  |  | Dynamic value |
| `minecraft:attack_cooldown` |  |  | Dynamic value |
| `minecraft:attack_damage` |  |  | Dynamic value |
| `minecraft:balloon` |  |  | Dynamic value |
| `minecraft:balloonable` |  |  | Dynamic value |
| `minecraft:barter` |  |  | Dynamic value |
| `minecraft:behavior.admire_item` |  |  | Dynamic value |
| `minecraft:behavior.avoid_block` |  |  | Dynamic value |
| `minecraft:behavior.avoid_mob_type` |  |  | Dynamic value |
| `minecraft:behavior.barter` |  |  | Dynamic value |
| `minecraft:behavior.beg` |  |  | Dynamic value |
| `minecraft:behavior.break_door` |  |  | Dynamic value |
| `minecraft:behavior.breed` |  |  | Allows this mob to breed with other mobs. See `misc/breed`. |
| `minecraft:behavior.celebrate` |  |  | Dynamic value |
| `minecraft:behavior.celebrate_survive` |  |  | Dynamic value |
| `minecraft:behavior.charge_attack` |  |  | Dynamic value |
| `minecraft:behavior.charge_held_item` |  |  | Dynamic value |
| `minecraft:behavior.circle_around_anchor` |  |  | Dynamic value |
| `minecraft:behavior.controlled_by_player` |  |  | Dynamic value |
| `minecraft:behavior.croak` |  |  | Dynamic value |
| `minecraft:behavior.defend_trusted_target` |  |  | Dynamic value |
| `minecraft:behavior.defend_village_target` |  |  | Dynamic value |
| `minecraft:behavior.delayed_attack` |  |  | Dynamic value |
| `minecraft:behavior.dig` |  |  | Dynamic value |
| `minecraft:behavior.door_interact` |  |  | Dynamic value |
| `minecraft:behavior.dragonchargeplayer` |  |  | Dynamic value |
| `minecraft:behavior.dragondeath` |  |  | Dynamic value |
| `minecraft:behavior.dragonflaming` |  |  | Dynamic value |
| `minecraft:behavior.dragonholdingpattern` |  |  | Dynamic value |
| `minecraft:behavior.dragonlanding` |  |  | Dynamic value |
| `minecraft:behavior.dragonscanning` |  |  | Dynamic value |
| `minecraft:behavior.dragonstrafeplayer` |  |  | Dynamic value |
| `minecraft:behavior.dragontakeoff` |  |  | Dynamic value |
| `minecraft:behavior.drink_milk` |  |  | Dynamic value |
| `minecraft:behavior.drink_potion` |  |  | Dynamic value |
| `minecraft:behavior.drop_item_for` |  |  | Dynamic value |
| `minecraft:behavior.eat_block` |  |  | Dynamic value |
| `minecraft:behavior.eat_carried_item` |  |  | Dynamic value |
| `minecraft:behavior.eat_mob` |  |  | Dynamic value |
| `minecraft:behavior.emerge` |  |  | Dynamic value |
| `minecraft:behavior.enderman_leave_block` |  |  | Dynamic value |
| `minecraft:behavior.enderman_take_block` |  |  | Dynamic value |
| `minecraft:behavior.equip_item` |  |  | Dynamic value |
| `minecraft:behavior.explore_outskirts` |  |  | Dynamic value |
| `minecraft:behavior.fertilize_farm_block` |  |  | Dynamic value |
| `minecraft:behavior.find_cover` |  |  | Dynamic value |
| `minecraft:behavior.find_mount` |  |  | Dynamic value |
| `minecraft:behavior.find_underwater_treasure` |  |  | Dynamic value |
| `minecraft:behavior.fire_at_target` |  |  | Dynamic value |
| `minecraft:behavior.flee_sun` |  |  | Dynamic value |
| `minecraft:behavior.float` |  |  | Dynamic value |
| `minecraft:behavior.float_tempt` |  |  | Dynamic value |
| `minecraft:behavior.float_wander` |  |  | Dynamic value |
| `minecraft:behavior.follow_caravan` |  |  | Dynamic value |
| `minecraft:behavior.follow_mob` |  |  | Dynamic value |
| `minecraft:behavior.follow_owner` |  |  | Dynamic value |
| `minecraft:behavior.follow_parent` |  |  | Dynamic value |
| `minecraft:behavior.follow_target_captain` |  |  | Dynamic value |
| `minecraft:behavior.go_and_give_items_to_noteblock` |  |  | Dynamic value |
| `minecraft:behavior.go_and_give_items_to_owner` |  |  | Dynamic value |
| `minecraft:behavior.go_home` |  |  | Dynamic value |
| `minecraft:behavior.guardian_attack` |  |  | Dynamic value |
| `minecraft:behavior.harvest_farm_block` |  |  | Dynamic value |
| `minecraft:behavior.hide` |  |  | Dynamic value |
| `minecraft:behavior.hold_ground` |  |  | Dynamic value |
| `minecraft:behavior.hover` |  |  | Dynamic value |
| `minecraft:behavior.hurt_by_target` |  |  | Dynamic value |
| `minecraft:behavior.inspect_bookshelf` |  |  | Dynamic value |
| `minecraft:behavior.investigate_suspicious_location` |  |  | Dynamic value |
| `minecraft:behavior.jump_around_target` |  |  | Dynamic value |
| `minecraft:behavior.jump_to_block` |  |  | Dynamic value |
| `minecraft:behavior.knockback_roar` |  |  | Dynamic value |
| `minecraft:behavior.lay_down` |  |  | Dynamic value |
| `minecraft:behavior.lay_egg` |  |  | Dynamic value |
| `minecraft:behavior.leap_at_target` |  |  | Dynamic value |
| `minecraft:behavior.look_at_entity` |  |  | Dynamic value |
| `minecraft:behavior.look_at_player` |  |  | Dynamic value |
| `minecraft:behavior.look_at_target` |  |  | Dynamic value |
| `minecraft:behavior.look_at_trading_player` |  |  | Dynamic value |
| `minecraft:behavior.make_love` |  |  | Dynamic value |
| `minecraft:behavior.melee_attack` |  |  | Dynamic value |
| `minecraft:behavior.melee_box_attack` |  |  | Dynamic value |
| `minecraft:behavior.mingle` |  |  | Dynamic value |
| `minecraft:behavior.mount_pathing` |  |  | Dynamic value |
| `minecraft:behavior.move_around_target` |  |  | Dynamic value |
| `minecraft:behavior.move_indoors` |  |  | Dynamic value |
| `minecraft:behavior.move_outdoors` |  |  | Dynamic value |
| `minecraft:behavior.move_through_village` |  |  | Dynamic value |
| `minecraft:behavior.move_to_block` |  |  | Dynamic value |
| `minecraft:behavior.move_to_land` |  |  | Dynamic value |
| `minecraft:behavior.move_to_lava` |  |  | Dynamic value |
| `minecraft:behavior.move_to_liquid` |  |  | Dynamic value |
| `minecraft:behavior.move_to_poi` |  |  | Dynamic value |
| `minecraft:behavior.move_to_random_block` |  |  | Dynamic value |
| `minecraft:behavior.move_to_village` |  |  | Dynamic value |
| `minecraft:behavior.move_to_water` |  |  | Dynamic value |
| `minecraft:behavior.move_towards_dwelling_restriction` |  |  | Dynamic value |
| `minecraft:behavior.move_towards_home_restriction` |  |  | Dynamic value |
| `minecraft:behavior.move_towards_target` |  |  | Dynamic value |
| `minecraft:behavior.nap` |  |  | Dynamic value |
| `minecraft:behavior.nearest_attackable_target` |  |  | Dynamic value |
| `minecraft:behavior.nearest_prioritized_attackable_target` |  |  | Dynamic value |
| `minecraft:behavior.ocelot_sit_on_block` |  |  | Dynamic value |
| `minecraft:behavior.ocelotattack` |  |  | Dynamic value |
| `minecraft:behavior.offer_flower` |  |  | Dynamic value |
| `minecraft:behavior.open_door` |  |  | Dynamic value |
| `minecraft:behavior.owner_hurt_by_target` |  |  | Dynamic value |
| `minecraft:behavior.owner_hurt_target` |  |  | Dynamic value |
| `minecraft:behavior.panic` |  |  | Dynamic value |
| `minecraft:behavior.pet_sleep_with_owner` |  |  | Dynamic value |
| `minecraft:behavior.pickup_items` |  |  | Dynamic value |
| `minecraft:behavior.place_block` |  |  | Dynamic value |
| `minecraft:behavior.play` |  |  | Dynamic value |
| `minecraft:behavior.play_dead` |  |  | Dynamic value |
| `minecraft:behavior.player_ride_tamed` |  |  | Dynamic value |
| `minecraft:behavior.raid_garden` |  |  | Dynamic value |
| `minecraft:behavior.ram_attack` |  |  | Dynamic value |
| `minecraft:behavior.random_breach` |  |  | Dynamic value |
| `minecraft:behavior.random_fly` |  |  | Dynamic value |
| `minecraft:behavior.random_hover` |  |  | Dynamic value |
| `minecraft:behavior.random_look_around` |  |  | Dynamic value |
| `minecraft:behavior.random_look_around_and_sit` |  |  | Dynamic value |
| `minecraft:behavior.random_search_and_dig` |  |  | Dynamic value |
| `minecraft:behavior.random_sitting` |  |  | Dynamic value |
| `minecraft:behavior.random_stroll` |  |  | Dynamic value |
| `minecraft:behavior.random_swim` |  |  | Dynamic value |
| `minecraft:behavior.ranged_attack` |  |  | Dynamic value |
| `minecraft:behavior.receive_love` |  |  | Dynamic value |
| `minecraft:behavior.restrict_open_door` |  |  | Dynamic value |
| `minecraft:behavior.restrict_sun` |  |  | Dynamic value |
| `minecraft:behavior.rise_to_liquid_level` |  |  | Dynamic value |
| `minecraft:behavior.roar` |  |  | Dynamic value |
| `minecraft:behavior.roll` |  |  | Dynamic value |
| `minecraft:behavior.run_around_like_crazy` |  |  | Dynamic value |
| `minecraft:behavior.scared` |  |  | Dynamic value |
| `minecraft:behavior.send_event` |  |  | Dynamic value |
| `minecraft:behavior.share_items` |  |  | Dynamic value |
| `minecraft:behavior.silverfish_merge_with_stone` |  |  | Dynamic value |
| `minecraft:behavior.silverfish_wake_up_friends` |  |  | Dynamic value |
| `minecraft:behavior.skeleton_horse_trap` |  |  | Dynamic value |
| `minecraft:behavior.sleep` |  |  | Dynamic value |
| `minecraft:behavior.slime_attack` |  |  | Dynamic value |
| `minecraft:behavior.slime_float` |  |  | Dynamic value |
| `minecraft:behavior.slime_keep_on_jumping` |  |  | Dynamic value |
| `minecraft:behavior.slime_random_direction` |  |  | Dynamic value |
| `minecraft:behavior.snacking` |  |  | Dynamic value |
| `minecraft:behavior.sneeze` |  |  | Dynamic value |
| `minecraft:behavior.sniff` |  |  | Dynamic value |
| `minecraft:behavior.sonic_boom` |  |  | Dynamic value |
| `minecraft:behavior.squid_dive` |  |  | Dynamic value |
| `minecraft:behavior.squid_flee` |  |  | Dynamic value |
| `minecraft:behavior.squid_idle` |  |  | Dynamic value |
| `minecraft:behavior.squid_move_away_from_ground` |  |  | Dynamic value |
| `minecraft:behavior.squid_out_of_water` |  |  | Dynamic value |
| `minecraft:behavior.stalk_and_pounce_on_target` |  |  | Dynamic value |
| `minecraft:behavior.stay_near_noteblock` |  |  | Dynamic value |
| `minecraft:behavior.stay_while_sitting` |  |  | Dynamic value |
| `minecraft:behavior.stomp_attack` |  |  | Dynamic value |
| `minecraft:behavior.stomp_turtle_egg` |  |  | Dynamic value |
| `minecraft:behavior.stroll_towards_village` |  |  | Dynamic value |
| `minecraft:behavior.summon_entity` |  |  | Dynamic value |
| `minecraft:behavior.swell` |  |  | Dynamic value |
| `minecraft:behavior.swim_idle` |  |  | Dynamic value |
| `minecraft:behavior.swim_up_for_breath` |  |  | Dynamic value |
| `minecraft:behavior.swim_wander` |  |  | Dynamic value |
| `minecraft:behavior.swim_with_entity` |  |  | Dynamic value |
| `minecraft:behavior.swoop_attack` |  |  | Dynamic value |
| `minecraft:behavior.take_block` |  |  | Dynamic value |
| `minecraft:behavior.take_flower` |  |  | Dynamic value |
| `minecraft:behavior.target_when_pushed` |  |  | Dynamic value |
| `minecraft:behavior.teleport_to_owner` |  |  | Dynamic value |
| `minecraft:behavior.tempt` |  |  | Dynamic value |
| `minecraft:behavior.timer_flag_1` |  |  | Dynamic value |
| `minecraft:behavior.timer_flag_2` |  |  | Dynamic value |
| `minecraft:behavior.timer_flag_3` |  |  | Dynamic value |
| `minecraft:behavior.trade_interest` |  |  | Dynamic value |
| `minecraft:behavior.trade_with_player` |  |  | Dynamic value |
| `minecraft:behavior.vex_copy_owner_target` |  |  | Dynamic value |
| `minecraft:behavior.vex_random_move` |  |  | Dynamic value |
| `minecraft:behavior.wither_random_attack_pos_goal` |  |  | Dynamic value |
| `minecraft:behavior.wither_target_highest_damage` |  |  | Dynamic value |
| `minecraft:behavior.work` |  |  | Dynamic value |
| `minecraft:behavior.work_composter` |  |  | Dynamic value |
| `minecraft:block_climber` |  |  | Dynamic value |
| `minecraft:block_sensor` |  |  | Dynamic value |
| `minecraft:body_rotation_always_follows_head` |  |  | Dynamic value |
| `minecraft:body_rotation_blocked` |  |  | Dynamic value |
| `minecraft:boostable` |  |  | Dynamic value |
| `minecraft:boss` |  |  | Dynamic value |
| `minecraft:break_blocks` |  |  | Dynamic value |
| `minecraft:breathable` |  |  | Dynamic value |
| `minecraft:breedable` |  |  | Dynamic value |
| `minecraft:bribeable` |  |  | Dynamic value |
| `minecraft:bucketable` |  |  | Dynamic value |
| `minecraft:buoyant` |  |  | Dynamic value |
| `minecraft:burns_in_daylight` |  |  | Dynamic value |
| `minecraft:can_climb` |  |  | Dynamic value |
| `minecraft:can_fly` |  |  | Dynamic value |
| `minecraft:can_join_raid` |  |  | Dynamic value |
| `minecraft:can_power_jump` |  |  | Dynamic value |
| `minecraft:cannot_be_attacked` |  |  | Dynamic value |
| `minecraft:celebrate_hunt` |  |  | Dynamic value |
| `minecraft:collision_box` |  |  | Dynamic value |
| `minecraft:color` |  |  | Dynamic value |
| `minecraft:color2` |  |  | Dynamic value |
| `minecraft:combat_regeneration` |  |  | Dynamic value |
| `minecraft:conditional_bandwidth_optimization` |  |  | Dynamic value |
| `minecraft:custom_hit_test` |  |  | Dynamic value |
| `minecraft:damage_over_time` |  |  | Dynamic value |
| `minecraft:damage_sensor` |  |  | Dynamic value |
| `minecraft:dash_action` |  |  | Dynamic value |
| `minecraft:default_look_angle` |  |  | Dynamic value |
| `minecraft:despawn` |  |  | Dynamic value |
| `minecraft:dimension_bound` |  |  | Dynamic value |
| `minecraft:drying_out_timer` |  |  | Dynamic value |
| `minecraft:dweller` |  |  | Dynamic value |
| `minecraft:economy_trade_table` |  |  | Dynamic value |
| `minecraft:entity_armor_equipment_slot_mapping` |  |  | Dynamic value |
| `minecraft:entity_sensor` |  |  | Dynamic value |
| `minecraft:environment_sensor` |  |  | Dynamic value |
| `minecraft:equip_item` |  |  | Dynamic value |
| `minecraft:equipment` |  |  | Dynamic value |
| `minecraft:equippable` |  |  | Dynamic value |
| `minecraft:exhaustion_values` |  |  | Dynamic value |
| `minecraft:experience_reward` |  |  | Dynamic value |
| `minecraft:explode` |  |  | Dynamic value |
| `minecraft:fire_immune` |  |  | Dynamic value |
| `minecraft:floats_in_liquid` |  |  | Dynamic value |
| `minecraft:flocking` |  |  | Dynamic value |
| `minecraft:flying_speed` |  |  | Dynamic value |
| `minecraft:follow_range` |  |  | Dynamic value |
| `minecraft:free_camera_controlled` |  |  | Dynamic value |
| `minecraft:friction_modifier` |  |  | Dynamic value |
| `minecraft:game_event_movement_tracking` |  |  | Dynamic value |
| `minecraft:genetics` |  |  | Dynamic value |
| `minecraft:giveable` |  |  | Dynamic value |
| `minecraft:ground_offset` |  |  | Dynamic value |
| `minecraft:group_size` |  |  | Dynamic value |
| `minecraft:grows_crop` |  |  | Dynamic value |
| `minecraft:healable` |  |  | Dynamic value |
| `minecraft:health` |  |  | Dynamic value |
| `minecraft:heartbeat` |  |  | Dynamic value |
| `minecraft:hide` |  |  | Dynamic value |
| `minecraft:home` |  |  | Dynamic value |
| `minecraft:horse.jump_strength` |  |  | Dynamic value |
| `minecraft:hurt_on_condition` |  |  | Dynamic value |
| `minecraft:ignore_cannot_be_attacked` |  |  | Dynamic value |
| `minecraft:input_ground_controlled` |  |  | Dynamic value |
| `minecraft:inside_block_notifier` |  |  | Dynamic value |
| `minecraft:insomnia` |  |  | Dynamic value |
| `minecraft:instant_despawn` |  |  | Dynamic value |
| `minecraft:interact` |  |  | Dynamic value |
| `minecraft:inventory` |  |  | Dynamic value |
| `minecraft:is_baby` |  |  | Dynamic value |
| `minecraft:is_charged` |  |  | Dynamic value |
| `minecraft:is_chested` |  |  | Dynamic value |
| `minecraft:is_collidable` |  |  | Dynamic value |
| `minecraft:is_dyeable` |  |  | Dynamic value |
| `minecraft:is_hidden_when_invisible` |  |  | Dynamic value |
| `minecraft:is_ignited` |  |  | Dynamic value |
| `minecraft:is_illager_captain` |  |  | Dynamic value |
| `minecraft:is_pregnant` |  |  | Dynamic value |
| `minecraft:is_saddled` |  |  | Dynamic value |
| `minecraft:is_shaking` |  |  | Dynamic value |
| `minecraft:is_sheared` |  |  | Dynamic value |
| `minecraft:is_stackable` |  |  | Dynamic value |
| `minecraft:is_stunned` |  |  | Dynamic value |
| `minecraft:is_tamed` |  |  | Dynamic value |
| `minecraft:item_controllable` |  |  | Dynamic value |
| `minecraft:item_hopper` |  |  | Dynamic value |
| `minecraft:jump.dynamic` |  |  | Dynamic value |
| `minecraft:jump.static` |  |  | Dynamic value |
| `minecraft:knockback_resistance` |  |  | Dynamic value |
| `minecraft:lava_movement` |  |  | Dynamic value |
| `minecraft:leashable` |  |  | Dynamic value |
| `minecraft:leashable_to` |  |  | Dynamic value |
| `minecraft:looked_at` |  |  | Dynamic value |
| `minecraft:loot` |  |  | Dynamic value |
| `minecraft:luck` |  |  | Dynamic value |
| `minecraft:managed_wandering_trader` |  |  | Dynamic value |
| `minecraft:mark_variant` |  |  | Dynamic value |
| `minecraft:mob_effect` |  |  | Dynamic value |
| `minecraft:mob_effect_immunity` |  |  | Dynamic value |
| `minecraft:movement` |  |  | Dynamic value |
| `minecraft:movement.amphibious` |  |  | Dynamic value |
| `minecraft:movement.basic` |  |  | Dynamic value |
| `minecraft:movement.dolphin` |  |  | Dynamic value |
| `minecraft:movement.fly` |  |  | Dynamic value |
| `minecraft:movement.generic` |  |  | Dynamic value |
| `minecraft:movement.glide` |  |  | Dynamic value |
| `minecraft:movement.hover` |  |  | Dynamic value |
| `minecraft:movement.jump` |  |  | Dynamic value |
| `minecraft:movement.skip` |  |  | Dynamic value |
| `minecraft:movement.sway` |  |  | Dynamic value |
| `minecraft:movement_sound_distance_offset` |  |  | Dynamic value |
| `minecraft:nameable` |  |  | Dynamic value |
| `minecraft:navigation.climb` |  |  | Dynamic value |
| `minecraft:navigation.float` |  |  | Dynamic value |
| `minecraft:navigation.fly` |  |  | Dynamic value |
| `minecraft:navigation.generic` |  |  | Dynamic value |
| `minecraft:navigation.hover` |  |  | Dynamic value |
| `minecraft:navigation.swim` |  |  | Dynamic value |
| `minecraft:navigation.walk` |  |  | Dynamic value |
| `minecraft:npc` |  |  | Dynamic value |
| `minecraft:on_death` |  |  | Dynamic value |
| `minecraft:on_friendly_anger` |  |  | Dynamic value |
| `minecraft:on_hurt` |  |  | Dynamic value |
| `minecraft:on_hurt_by_player` |  |  | Dynamic value |
| `minecraft:on_ignite` |  |  | Dynamic value |
| `minecraft:on_start_landing` |  |  | Dynamic value |
| `minecraft:on_start_takeoff` |  |  | Dynamic value |
| `minecraft:on_target_acquired` |  |  | Dynamic value |
| `minecraft:on_target_escape` |  |  | Dynamic value |
| `minecraft:on_wake_with_owner` |  |  | Dynamic value |
| `minecraft:out_of_control` |  |  | Dynamic value |
| `minecraft:peek` |  |  | Dynamic value |
| `minecraft:persistent` |  |  | Dynamic value |
| `minecraft:physics` |  |  | Dynamic value |
| `minecraft:player.exhaustion` |  |  | Dynamic value |
| `minecraft:player.experience` |  |  | Dynamic value |
| `minecraft:player.hunger` |  |  | Dynamic value |
| `minecraft:player.level` |  |  | Dynamic value |
| `minecraft:player.saturation` |  |  | Dynamic value |
| `minecraft:preferred_path` |  |  | Dynamic value |
| `minecraft:projectile` |  |  | Dynamic value |
| `minecraft:push_through` |  |  | Dynamic value |
| `minecraft:pushable` |  |  | Dynamic value |
| `minecraft:raid_trigger` |  |  | Dynamic value |
| `minecraft:rail_movement` |  |  | Dynamic value |
| `minecraft:rail_sensor` |  |  | Dynamic value |
| `minecraft:ravager_blocked` |  |  | Dynamic value |
| `minecraft:reflect_projectiles` |  |  | Dynamic value |
| `minecraft:renders_when_invisible` |  |  | Dynamic value |
| `minecraft:rideable` |  |  | Dynamic value |
| `minecraft:rotation_axis_aligned` |  |  | Dynamic value |
| `minecraft:scale` |  |  | Dynamic value |
| `minecraft:scale_by_age` |  |  | Dynamic value |
| `minecraft:scheduler` |  |  | Dynamic value |
| `minecraft:shareables` |  |  | Dynamic value |
| `minecraft:shooter` |  |  | Dynamic value |
| `minecraft:sittable` |  |  | Dynamic value |
| `minecraft:skin_id` |  |  | Dynamic value |
| `minecraft:sound_volume` |  |  | Dynamic value |
| `minecraft:spawn_entity` |  |  | Dynamic value |
| `minecraft:spell_effects` |  |  | Dynamic value |
| `minecraft:strength` |  |  | Dynamic value |
| `minecraft:suspect_tracking` |  |  | Dynamic value |
| `minecraft:tameable` |  |  | Dynamic value |
| `minecraft:tamemount` |  |  | Dynamic value |
| `minecraft:target_nearby_sensor` |  |  | Dynamic value |
| `minecraft:teleport` |  |  | Dynamic value |
| `minecraft:tick_world` |  |  | Dynamic value |
| `minecraft:timer` |  |  | Dynamic value |
| `minecraft:trade_resupply` |  |  | Dynamic value |
| `minecraft:trade_table` |  |  | Dynamic value |
| `minecraft:trail` |  |  | Dynamic value |
| `minecraft:transformation` |  |  | Dynamic value |
| `minecraft:transient` |  |  | Dynamic value |
| `minecraft:trust` |  |  | Dynamic value |
| `minecraft:trusting` |  |  | Dynamic value |
| `minecraft:type_family` |  |  | Dynamic value |
| `minecraft:underwater_movement` |  |  | Dynamic value |
| `minecraft:variable_max_auto_step` |  |  | Dynamic value |
| `minecraft:variant` |  |  | Dynamic value |
| `minecraft:vertical_movement_action` |  |  | Dynamic value |
| `minecraft:vibration_damper` |  |  | Dynamic value |
| `minecraft:vibration_listener` |  |  | Dynamic value |
| `minecraft:walk_animation_speed` |  |  | Dynamic value |
| `minecraft:wants_jockey` |  |  | Dynamic value |
| `minecraft:water_movement` |  |  | Dynamic value |
| `minecraft:wither_target_highest_damage` |  |  | Dynamic value |

### Feature Rule Conditions (feature_rule_conditions)

Defines feature rule conditions configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:biome_filter` |  |  | List of filter tests to determine which biomes this rule will attach to. |
| `placement_pass` | string |  | **required**. When the feature should be placed relative to others. Earlier passes in the list are guaranteed to occur before later passes. Order is not guaranteed within each pass. |

### Feature Rule Definition (feature_rule_definition)

Defines feature rule definition configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditions` |  |  | **required**. Parameters to control where and when the feature will be placed. See `misc/feature_rule_conditions`. |
| `description` |  |  | **required**. Identifier for the Feature Rule and Feature to place. See `misc/feature_rule_description`. |
| `distribution` |  |  | Parameters controlling the initial scatter of the feature. See `misc/scatter_params`. |

### Feature Rule Description (feature_rule_description)

Defines feature rule description configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. The name of this feature rule in the format 'namespace_name:rule_name'. 'rule_name' must match the filename. |
| `places_feature` | string |  | **required**. Named reference to the feature controlled by this rule. |

### Filter Test (filter_test)

Defines filter test configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` |  |  | The domain the test should be performed in. |
| `operator` |  |  | The comparison to apply with 'value'. |
| `subject` |  |  | The subject of this filter test. |
| `test` | string |  | **required**. The name of the test to apply. |
| `value` |  |  | The value being compared with the test. |

### FloatRange (floatrange)

Defines floatrange configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | float |  | Max |
| `min` | float |  | Min |

### Generation (generation)

Defines generation configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `generator_type` | string |  | **required**. Generator Type |

### Herd (herd)

Defines herd configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | An event to run after 'event_skip_count' number of entities in the group have spawned |
| `event_skip_count` | int |  | Number of entities spawned in the group to skip before running the event |
| `initial_event` | string |  | Event run when the first 'initial_event_count' entities in the group are placed. |
| `initial_event_count` | int |  | Number of times that 'initial_event' can run |
| `max` | int |  | Maximum number of entities in this group to attempt to spawn |
| `min` | int |  | Minimum number of entities in this group to attempt to spawn |

### IntRange (intrange)

Defines intrange configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | Max |
| `min` | int |  | Min |

### Jigsaw Block Metadata (jigsaw_block_metadata)

Defines jigsaw block metadata configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The serialization Id of the Jigsaw block before generation. |
| `final_block` | string |  | **required**. The serialization Id to replace the starting Jigsaw block with. |
| `joint_type` | string |  | **required**. The type of Jigsaw joint made with 'target'. |
| `name` | string |  | **required**. The name identifier referenced by the 'target' field of another Jigsaw block. |
| `placement_priority` | int |  | **required**. The priority used during target block placement. |
| `pool` | string |  | **required**. The structure template pool containing possible structures to generate. |
| `pos` |  |  | **required**. The Jigsaw block position. |
| `selection_priority` | int |  | **required**. The priority used during target block selection. |
| `target` | string |  | **required**. The name identifier of the Jigsaw block to target within the generated structure. |

### Jigsaw Structure Metadata (jigsaw_structure_metadata)

Defines jigsaw structure metadata configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `markers` |  |  | **required**. The Jigsaw blocks contained within the generated structure. See `misc/jigsaw_block_metadata`. |
| `size` |  |  | **required**. The generated structures bounding size. |

### Jigsaw Structure Metadata Registry (jigsaw_structure_metadata_registry)

Defines jigsaw structure metadata registry configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` |  |  | **required**. The registry associating structure locations with generated Jigsaw structure metadata. |

### JigsawBlockMetadata (jigsawblockmetadata)

Defines jigsawblockmetadata configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | string |  | **required**. The serialization Id of the Jigsaw block before generation. |
| `final_block` | string |  | **required**. The serialization Id to replace the starting Jigsaw block with. |
| `joint_type` | string |  | **required**. The type of Jigsaw joint made with 'target'. |
| `name` | string |  | **required**. The name identifier referenced by the 'target' field of another Jigsaw block. |
| `placement_priority` | int |  | **required**. The priority used during target block placement. |
| `pool` | string |  | **required**. The structure template pool containing possible structures to generate. |
| `pos` |  |  | **required**. The Jigsaw block position. |
| `selection_priority` | int |  | **required**. The priority used during target block selection. |
| `target` | string |  | **required**. The name identifier of the Jigsaw block to target within the generated structure. |

### JigsawDescriptionIdentifier (jigsawdescriptionidentifier)

Identifier of the Jigsaw Structure.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` |  |  | **required**. Identifier |

### JigsawStructure (jigsawstructure)

A Jigsaw Structure is a group of Structure Templates that make up a larger structure. Jigsaw Structures are placed during world generation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `biome_filters` |  |  | Biomes in which the Jigsaw Structure can generate. |
| `description` |  |  | **required**. Identifier of the Jigsaw Structure. See `misc/jigsawdescriptionidentifier`. |
| `dimension_padding` |  |  | Dimension padding prevents the structure from getting cut off at the top or bottom of the world. |
| `heightmap_projection` | string |  | Heightmap used to calculate the relative start height. For example, a heightmap_projection of ocean_floor and a start_height of 10 means the Jigsaw Structure will begin generating 10 blocks above the ocean floor. Defaults to 'none' |
| `liquid_settings` | string |  | How to handle waterloggable blocks overlapping with existing liquid. |
| `max_depth` | int |  | **required**. The maximum recursion depth for Jigsaw Structure Generation. For example, a Jigsaw Structure that builds a road with a max_depth of 5 will only have paths that are a maximum of 5 structures templates in length in any given direction from the origin. |
| `max_distance_from_center` | int |  | The max distances on the horizontal plane and optionally the vertical axis from the jigsaw pieces to the structure start. |
| `pool_aliases` |  |  | Pool Aliases are used to determine which template pool can be a substitute. |
| `start_height` |  |  | **required**. Height at which the Jigsaw Structure's start pool should begin. |
| `start_jigsaw_name` | string |  | The start jigsaw name is the name of the jigsaw block from the start pool to be placed first. |
| `start_pool` |  |  | **required**. The first Template Pool to use when generating the Jigsaw Structure. |
| `step` | string |  | **required**. Species the world generation phase in which the structure is generated. |
| `terrain_adaptation` | string |  | How the terrain should adapt relative to the generated Jigsaw Structure. |

### JigsawStructureMetadata (jigsawstructuremetadata)

Defines jigsawstructuremetadata configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `markers` |  |  | **required**. The Jigsaw blocks contained within the generated structure. See `misc/jigsawblockmetadata`. |
| `size` |  |  | **required**. The generated structures bounding size. |
| `use_legacy_rotation` | boolean |  | Unused - Previously if true would use legacy size rotation. |

### JigsawStructureMetadataRegistry (jigsawstructuremetadataregistry)

Defines jigsawstructuremetadataregistry configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `metadata` |  |  | **required**. The registry associating structure locations with generated Jigsaw structure metadata. |

### menu_category (menu_category)

menu_category contains the creative group name and category for this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` | string |  | Creative category where this item belongs. Defaults to "none". |
| `group` | string |  | The Creative Group that this item belongs to. Group name is limited to 256 characters. The name also must start with a namespace. |
| `is_hidden_in_commands` | boolean |  | Determines whether or not this item can be used with commands. Commands can use items by default if a category is set. |

### Passthrough (passthrough)

Modifier that leaves the state unchanged. This is the default block modifier if no other block modifier is specified.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | string |  | **required**. BlockEntityModifierType |

### PermuteType (permutetype)

Defines permutetype configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity_type` |  |  | Specifies the entity type to spawn when selected |
| `min_guaranteed` | int |  | The minimum number of this permutation's entity to spawn |
| `weight` | int |  | **required**. The likelihood of this to be selected over the combined weight of all the entities in the permutation |

### Placement (placement)

Placement rule defintions

| Field | Type | Default | Notes |
|---|---|---|---|
| `heightmap` | string |  | Defines the heightmap filter for initial entity placement during chunk loading. |
| `spawn_obstruction_predicate` | string |  | Checks for obstructions that might prevent entity spawning. |
| `spawn_predicate` | string |  | Determines if an entity is valid to spawn based on specific conditions. |
| `type` | string |  | Specifies the environment where the entity can spawn (e.g., on ground, in water, etc.). |

### Placement Direction (placement_direction)

Defines placement direction configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` |  |  | **required**. Enabled States |
| `y_rotation_offset` | float |  | y Rotation Offset |

### Placement Position (placement_position)

Defines placement position configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `enabled_states` |  |  | **required**. Enabled States |

### Processor List Description (processor_list_description)

Defines processor list description configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` |  |  | **required**. Identifier of the Processor List. This is referenced by Template Pools when pairing processors with Structure Templates. |

### Processor Rule (processor_rule)

A block rule that is evaluated on all blocks of a Structure Template. All predicates must evaluate to true in order for a block to be replaced by the output_state.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_entity_modifier` |  |  | A block state modifier for block entities when all predicate match. |
| `input_predicate` |  |  | A predicate evaluated on the Structure Template block. |
| `location_predicate` |  |  | A predicate evaluated on the world block. |
| `output_state` |  |  | **required**. Block to replace the world block with if all predicates evaluate to true. |
| `position_predicate` |  |  | A predicate evaluated on the distance between the structure's world origin and the world block. |

### Protected Block (protected_block)

Protect blocks from this structure's placement in the world. Ensuring that it does not replace matching blocks in the world

| Field | Type | Default | Notes |
|---|---|---|---|
| `processor_type` | string |  | **required**. Jigsaw Processor Type |
| `value` | string |  | **required**. Block tag for the blocks that will be protected |

### RandomBlockMatch (randomblockmatch)

Predicate that evaluates to true with a given probability if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | **required**. The block to match against. |
| `predicate_type` | string |  | **required**. BlockType |
| `probability` | float |  | **required**. Probability of the evaluating to true when the block matches. |

### RandomBlockStateMatch (randomblockstatematch)

Predicate that evaluates to true with a given probability if the block at the specified location matches the specified block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_state` |  |  | **required**. The block state to match against. |
| `predicate_type` | string |  | **required**. BlockType |
| `probability` | float |  | **required**. Probability of the evaluating to true when the block matches. |

### RandomGroupPoolAlias (randomgrouppoolalias)

Pool alias for a RandomGroup of aliases

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` |  |  | **required**. Aliases for a RandomGroup See `misc/weightedrandomitem`. |

### RandomPoolAlias (randompoolalias)

Pool alias for a Random list of targets

| Field | Type | Default | Notes |
|---|---|---|---|
| `alias` | string |  | **required**. Alias of Random Pool |
| `targets` |  |  | **required**. List of potential pools See `misc/weightedrandomitem`. |

### RandomSpreadPlacement (randomspreadplacement)

Defines randomspreadplacement configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `salt` | int |  | **required**. Seed used for the random generator to provide a unique scatter pattern. This is used to prevent overlap in the case where multiple structure sets use the same placement values. |
| `separation` | int |  | **required**. Padding (in chunks) within each grid cell. Structures will not generate within the padded area. |
| `spacing` | int |  | **required**. Grid cell size (in chunks) to use when generating the structure. Structures will attempt to generate at a random position within each cell. |
| `spread_type` | string |  | Randomness algorithm used when placing structures. |
| `type` | string |  | **required**. Type of placement for the Jigsaw Structure Set. |

### Range (range)

Defines range configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | **required**. Max |
| `min` | int |  | **required**. Min |

### Scatter Params (scatter_params)

Controls the scatter distribution of a particular object.

| Field | Type | Default | Notes |
|---|---|---|---|
| `coordinate_eval_order` | string |  | The order in which coordinates will be evaluated. Should be used when a coordinate depends on another. If omitted, defaults to "xzy". Supported orders are defined by "Coordinate Evaluation Order". |
| `iterations` |  |  | **required**. Number of scattered positions to generate. |
| `scatter_chance` |  |  | Probability that this scatter will occur. Not evaluated each iteration; either no iterations will run, or all will. |
| `x` |  |  | **required**. Distribution for the coordinate (evaluated each iteration). |
| `y` |  |  | **required**. Distribution for the coordinate (evaluated each iteration). |
| `z` |  |  | **required**. Distribution for the coordinate (evaluated each iteration). |

### Shape (shape)

Defines shape configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `boxes` |  |  | **required**. Boxes See `misc/box`. |

### SinglePoolElement (singlepoolelement)

Defines singlepoolelement configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element_type` | string |  | **required**. The type of element. |
| `location` |  |  | **required**. The path of the structure file. This path is relative to the behavior pack's structures folder. |
| `processors` |  |  | The identifier of the processor list to use when placing the structure. |
| `projection` | string |  | Specifies how structures should be placed relative to the terrain. |

### Spawn BiomeConditions (spawn_biomeconditions)

Defines spawn biomeconditions settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:biome_filter` |  |  | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `minecraft:brightness_filter` |  |  | Minecraft Brightness Filter See `misc/spawn_brightnessfilter`. |
| `minecraft:delay_filter` |  |  | Minecraft Delay Filter See `misc/spawn_delayfilter`. |
| `minecraft:density_limit` |  |  | Minecraft Density Limit See `misc/spawn_densitylimit`. |
| `minecraft:difficulty_filter` |  |  | Minecraft Difficulty Filter See `misc/spawn_difficultyfilter`. |
| `minecraft:disallow_spawns_in_bubble` |  |  | Minecraft Disallow Spawns In Bubble |
| `minecraft:distance_filter` |  |  | Minecraft Distance Filter See `misc/spawn_distancefilter`. |
| `minecraft:height_filter` |  |  | Minecraft Height Filter See `misc/spawn_heightfilter`. |
| `minecraft:herd` |  |  | Minecraft Herd |
| `minecraft:is_experimental` |  |  | Minecraft Is Experimental |
| `minecraft:is_persistent` |  |  | Minecraft Is Persistent |
| `minecraft:mob_event_filter` |  |  | Minecraft Mob Event Filter See `misc/spawn_mobeventfilter`. |
| `minecraft:permute_type` |  |  | Minecraft Permute Type |
| `minecraft:player_in_village_filter` |  |  | Minecraft Player In Village Filter See `misc/spawn_playerinvillagefilter`. |
| `minecraft:spawn_event` |  |  | Minecraft Spawn Event See `misc/spawn_mobeventfilter`. |
| `minecraft:spawns_above_block_filter` |  |  | Minecraft Spawns Above Block Filter See `misc/spawn_spawnaboveblockfilter`. |
| `minecraft:spawns_lava` |  |  | Minecraft Spawns Lava |
| `minecraft:spawns_on_block_filter` |  |  | Minecraft Spawns On Block Filter |
| `minecraft:spawns_on_block_prevented_filter` |  |  | Minecraft Spawns On Block Prevented Filter |
| `minecraft:spawns_on_surface` |  |  | Minecraft Spawns On Surface |
| `minecraft:spawns_underground` |  |  | Minecraft Spawns Underground |
| `minecraft:spawns_underwater` |  |  | Minecraft Spawns Underwater |
| `minecraft:weight` |  |  | Minecraft Weight See `misc/spawn_weight`. |
| `minecraft:world_age_filter` |  |  | Minecraft World Age Filter See `misc/spawn_worldagefilter`. |

### Spawn BrightnessFilter (spawn_brightnessfilter)

Defines spawn brightnessfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `adjust_for_weather` | boolean |  | Adjust For Weather |
| `max` | int |  | Max |
| `min` | int |  | Min |

### Spawn DelayFilter (spawn_delayfilter)

Defines spawn delayfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | Identifier |
| `max` | int |  | Max |
| `min` | int |  | Min |
| `spawn_chance` | int |  | Spawn Chance |

### Spawn DensityLimit (spawn_densitylimit)

Defines spawn densitylimit settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `surface` | int |  | Surface |
| `underground` | int |  | Underground |

### Spawn Description (spawn_description)

Defines spawn description settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Identifier |
| `population_control` | string |  | Population Control |

### Spawn DifficultyFilter (spawn_difficultyfilter)

Defines spawn difficultyfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | string |  | SpawnDifficulty Legacy |
| `min` | string |  | SpawnDifficulty Legacy |

### Spawn DistanceFilter (spawn_distancefilter)

Defines spawn distancefilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | Max |
| `min` | int |  | Min |

### Spawn HeightFilter (spawn_heightfilter)

Defines spawn heightfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | Max |
| `min` | int |  | Min |

### Spawn Herd (spawn_herd)

Defines spawn herd settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | An event to run after M number of the herd have spawned |
| `event_skip_count` | int |  | Number of the herd to skip before running the event |
| `initial_event` | string |  | Event run for the first N of the herd are placed. |
| `initial_event_count` | int |  | Number of times that the initial event will run |
| `max_size` | int |  | Maximum number in this group to attempt to spawn |
| `min_size` | int |  | Minimum number in this group to attempt to spawn |

### Spawn MobEventFilter (spawn_mobeventfilter)

Defines spawn mobeventfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | Event |

### Spawn PermuteType (spawn_permutetype)

Defines spawn permutetype settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity_type` |  |  | Permutation to spawn when selected |
| `min_guaranteed` | int |  | The minimum number of this permutation to spawn |
| `weight` | int |  | **required**. The ratio of all of the entities that are in the permutation |

### Spawn PlayerInVillageFilter (spawn_playerinvillagefilter)

Defines spawn playerinvillagefilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distance` | int |  | **required**. Distance |
| `village_border_tolerance` | int |  | Village Border Tolerance |

### Spawn Rules (spawn_rules)

Defines spawn rules settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditions` |  |  | Conditions See `misc/spawn_biomeconditions`. |
| `description` |  |  | **required**. Description See `misc/spawn_description`. |

### Spawn SpawnAboveBlockFilter (spawn_spawnaboveblockfilter)

Defines spawn spawnaboveblockfilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` |  |  | Blocks |
| `distance` | int |  | Distance |

### Spawn Weight (spawn_weight)

Defines spawn weight settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default` | int |  | **required**. Default |
| `rarity` | int |  | Rarity |

### Spawn WorldAgeFilter (spawn_worldagefilter)

Defines spawn worldagefilter settings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int |  | Max |
| `min` | int |  | Min |

### Structure (structure)

Defines structure configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `structure` |  |  | **required**. Identifier of the Jigsaw Structure. |
| `weight` | int |  | **required**. Weight of the Jigsaw Structure in the set. Higher weights are more likely to be selected. |

### TagMatch (tagmatch)

Predicate that evaluates to true if the block at the specified location constains the tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `predicate_type` | string |  | **required**. BlockType |
| `tag` | string |  | **required**. The tag to be matched |

### TemplatePoolElement (templatepoolelement)

Defines templatepoolelement configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `element` |  |  | **required**. A grouping of a Structure Template, the Processor List to use when placing the structure, and its weight that determines the likelihood of the element being chosen. |
| `weight` | int |  | The weighted probability of choosing the element from the pool. For example, a template pool containing 2 structures with weights of 1 and 3 will have a 25% and 75% chance of being chosen respectively. |

### Trade (trade)

Defines trade configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `gives` |  |  | **required**. Gives |
| `max_uses` | int |  | Max Uses |
| `reward_exp` | boolean |  | Reward Exp |
| `trader_exp` | int |  | Trader Exp |
| `wants` |  |  | **required**. Wants |
| `weight` | int |  | Weight |

### TradeGroup (tradegroup)

Defines tradegroup configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_to_select` | int |  | Num To Select |
| `trades` |  |  | **required**. Trades See `misc/trade`. |

### TradeItem (tradeitem)

Defines tradeitem configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `__DEP_fltrs` |  |  | DEP Fltrs |
| `__DEP_fnctns` |  |  | DEP Fnctns |
| `filters` |  |  | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `functions` |  |  | Functions |
| `item` |  |  | **required**. Item |
| `price_multiplier` | float |  | Price Multiplier |
| `quantity` | int |  | Quantity |

### TradeTier (tradetier)

Defines tradetier configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` |  |  | **required**. Groups See `misc/tradegroup`. |
| `total_exp_required` | int |  | **required**. Total Exp Required |

### Traits (traits)

Defines traits configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:placement_direction` |  |  | Minecraft Placement Direction See `misc/placement_direction`. |
| `minecraft:placement_position` |  |  | Minecraft Placement Position See `misc/placement_position`. |

### UniformHeightProviderType (uniformheightprovidertype)

Uniform distribution of possible anchor points

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` |  |  | **required**. Max value of the uniform distribution |
| `min` |  |  | **required**. Min value of the uniform distribution |
| `type` | string |  | **required**. HeightProviderType |

### UniformIntProvider (uniformintprovider)

Specifies a uniformly distributed integer

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_inclusive` | int |  | **required**. Maximum value (inclusive) |
| `min_inclusive` | int |  | **required**. Minimum value (inclusive) |
| `type` | string |  | **required**. IntProviderType |

### Values (values)

Defines values configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `values` |  |  | **required**. Values See `misc/range`. |

### VerticalAnchorType (verticalanchortype)

Specifies the vertical anchor

| Field | Type | Default | Notes |
|---|---|---|---|
| `from_sea` | int |  | **required**. Offset from anchored vertical position |

### VoxelShapeFile (voxelshapefile)

Defines voxelshapefile configuration.

| Field | Type | Default | Notes |
|---|---|---|---|
| `description` |  |  | **required**. Description See `misc/description`. |
| `shape` |  |  | **required**. Shape See `misc/shape`. |

### WeightedRandomItem (weightedrandomitem)

Weighted Random Item

| Field | Type | Default | Notes |
|---|---|---|---|
| `data` |  |  | **required**. Item's data |
| `weight` | int |  | **required**. Weight of item |
