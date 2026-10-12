# Entity components (non-AI)

Generated 2026-10-12 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/entity). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (210)

`minecraft:addrider`, `minecraft:admire_item`, `minecraft:ageable`, `minecraft:ambient_sound_interval`, `minecraft:anger_level`, `minecraft:angry`, `minecraft:annotation.break_door`, `minecraft:annotation.open_door`, `minecraft:apply_knockback_rules`, `minecraft:apply_knockback_rules_instance`, `minecraft:area_attack`, `minecraft:attack`, `minecraft:attack_cooldown`, `minecraft:barter`, `minecraft:block_climber`, `minecraft:block_movement_slowdown_immunity`, `minecraft:block_sensor`, `minecraft:body_rotation_always_follows_head`, `minecraft:body_rotation_axis_aligned`, `minecraft:body_rotation_blocked`, `minecraft:body_rotation_locked_to_vehicle`, `minecraft:boostable`, `minecraft:boss`, `minecraft:break_blocks`, `minecraft:breathable`, `minecraft:breedable`, `minecraft:bribeable`, `minecraft:buoyant`, `minecraft:burns_in_daylight`, `minecraft:can_climb`, `minecraft:can_fly`, `minecraft:can_join_raid`, `minecraft:can_power_jump`, `minecraft:cannot_be_attacked`, `minecraft:celebrate_hunt`, `minecraft:collision_box`, `minecraft:color`, `minecraft:color2`, `minecraft:combat_regeneration`, `minecraft:conditional_bandwidth_optimization`, `minecraft:custom_hit_test`, `minecraft:damage_over_time`, `minecraft:damage_sensor`, `minecraft:dash`, `minecraft:dash_action`, `minecraft:default_look_angle`, `minecraft:despawn`, `minecraft:dimension_bound`, `minecraft:drying_out_timer`, `minecraft:dweller`, `minecraft:economy_trade_table`, `minecraft:entity_armor_equipment_slot_mapping`, `minecraft:entity_sensor`, `minecraft:environment_sensor`, `minecraft:equip_item`, `minecraft:equipment`, `minecraft:equippable`, `minecraft:exhaustion_values`, `minecraft:experience_reward`, `minecraft:explode`, `minecraft:fire_immune`, `minecraft:floats_in_liquid`, `minecraft:flocking`, `minecraft:flying_speed`, `minecraft:follow_range`, `minecraft:free_camera_controlled`, `minecraft:friction_modifier`, `minecraft:game_event_movement_tracking`, `minecraft:genetics`, `minecraft:giveable`, `minecraft:ground_offset`, `minecraft:group_size`, `minecraft:grows_crop`, `minecraft:healable`, `minecraft:heartbeat`, `minecraft:hide`, `minecraft:home`, `minecraft:horse.jump_strength`, `minecraft:hurt_on_condition`, `minecraft:ignore_cannot_be_attacked`, `minecraft:input_air_controlled`, `minecraft:input_ground_controlled`, `minecraft:inside_block_notifier`, `minecraft:insomnia`, `minecraft:instant_despawn`, `minecraft:interact`, `minecraft:inventory`, `minecraft:is_baby`, `minecraft:is_charged`, `minecraft:is_chested`, `minecraft:is_collidable`, `minecraft:is_dyeable`, `minecraft:is_hidden_when_invisible`, `minecraft:is_ignited`, `minecraft:is_illager_captain`, `minecraft:is_pregnant`, `minecraft:is_saddled`, `minecraft:is_shaking`, `minecraft:is_sheared`, `minecraft:is_stackable`, `minecraft:is_stunned`, `minecraft:is_tamed`, `minecraft:item_controllable`, `minecraft:item_hopper`, `minecraft:jump.dynamic`, `minecraft:jump.static`, `minecraft:knockback_resistance`, `minecraft:lava_movement`, `minecraft:leashable`, `minecraft:leashable_to`, `minecraft:looked_at`, `minecraft:loot`, `minecraft:managed_wandering_trader`, `minecraft:mark_variant`, `minecraft:memory_behavior.move_to_position`, `minecraft:mob_effect`, `minecraft:mob_effect_immunity`, `minecraft:movement`, `minecraft:movement_sound_distance_offset`, `minecraft:movement.amphibious`, `minecraft:movement.basic`, `minecraft:movement.fly`, `minecraft:movement.generic`, `minecraft:movement.hover`, `minecraft:movement.jump`, `minecraft:movement.skip`, `minecraft:movement.sway`, `minecraft:nameable`, `minecraft:navigation.climb`, `minecraft:navigation.float`, `minecraft:navigation.fly`, `minecraft:navigation.generic`, `minecraft:navigation.hover`, `minecraft:navigation.swim`, `minecraft:navigation.walk`, `minecraft:offspring`, `minecraft:on_death`, `minecraft:on_equipment_changed`, `minecraft:on_friendly_anger`, `minecraft:on_hurt`, `minecraft:on_hurt_by_player`, `minecraft:on_ignite`, `minecraft:on_start_landing`, `minecraft:on_start_takeoff`, `minecraft:on_target_acquired`, `minecraft:on_target_escape`, `minecraft:on_wake_with_owner`, `minecraft:out_of_control`, `minecraft:peek`, `minecraft:persistent`, `minecraft:physics`, `minecraft:player.exhaustion`, `minecraft:player.experience`, `minecraft:player.level`, `minecraft:player.saturation`, `minecraft:preferred_path`, `minecraft:projectile`, `minecraft:push_through`, `minecraft:pushable`, `minecraft:pushable_by_block`, `minecraft:pushable_by_entity`, `minecraft:raid_trigger`, `minecraft:rail_movement`, `minecraft:rail_sensor`, `minecraft:ravager_blocked`, `minecraft:reflect_projectiles`, `minecraft:remove_in_peaceful`, `minecraft:renders_when_invisible`, `minecraft:rideable`, `minecraft:rotation_axis_aligned`, `minecraft:rotation_locked_to_vehicle`, `minecraft:scaffolding_climber`, `minecraft:scale`, `minecraft:scale_by_age`, `minecraft:scheduler`, `minecraft:shareables`, `minecraft:shooter`, `minecraft:sittable`, `minecraft:skin_id`, `minecraft:sound_volume`, `minecraft:spawn_egg_interaction`, `minecraft:spawn_entity`, `minecraft:spawn_on_death`, `minecraft:spell_effects`, `minecraft:strength`, `minecraft:suspect_tracking`, `minecraft:tameable`, `minecraft:tamemount`, `minecraft:target_nearby_sensor`, `minecraft:teleport`, `minecraft:tick_world`, `minecraft:timer`, `minecraft:trade_table`, `minecraft:trail`, `minecraft:transformation`, `minecraft:transient`, `minecraft:trusting`, `minecraft:type_family`, `minecraft:underwater_mount_breathing`, `minecraft:underwater_movement`, `minecraft:uses_legacy_friction`, `minecraft:variable_max_auto_step`, `minecraft:variant`, `minecraft:vertical_movement_action`, `minecraft:vibration_damper`, `minecraft:vibration_listener`, `minecraft:walk_animation_speed`, `minecraft:wants_jockey`, `minecraft:water_movement`, `minecraft:wither_target_highest_damage`

### minecraft:addrider

_since 1.8.0_

Adds a rider to the entity.

> From 1.21.130, this component accepts an array of riders via the `riders` field (each with mandatory `entity_type` and optional `spawn_event`). The legacy single `entity_type` / `spawn_event` form remains supported for backward compatibility.

| Field | Type | Default | Notes |
|---|---|---|---|
| `riders` | objectArray | `[]` | List of riders to be added to the entity. Can only spawn as many riders as "minecraft:rideable" has "seat_count". See `entity/rider_data`. |
| `entity_type` | stringLookup |  | Type of entity to acquire as a rider |
| `spawn_event` | minecraftEventReference |  | Trigger event when a rider is acquired |

Example (/minecraft:entity/component_groups/minecraft:spider_bogged_jockey/minecraft:addrider/):
```json
{
 "riders": [
  {
   "entity_type": "minecraft:bogged"
  }
 ]
}
```

### minecraft:admire_item

Allows an entity to ignore attackable targets for a given duration

| Field | Type | Default | Notes |
|---|---|---|---|
| `cooldown_after_being_attacked` | int | `10` | Duration, in seconds, for which mob won't admire items if it was hurt |
| `duration` | int | `10` | Duration, in seconds, that the mob admires an item. |

### minecraft:ageable

Adds a timer for the entity to grow up. It can be accelerated by giving the entity the items it likes as defined by feed_items.

> In 1.21.130 the `transform_to_item` field on each entry of `feed_items` was renamed to `result_item`. The new field is defined per-item, so different feed items can transform into different result items on use.

| Field | Type | Default | Notes |
|---|---|---|---|
| `drop_items` | stringArray |  | List of items that are dropped when an entity grows up |
| `duration` | float | `1200` | Length of time before an entity grows up (-1 to always stay a baby) |
| `feed_items` | objectArray |  | List of items that can be fed to an entity to age them up. Can be a single item string, an array of strings, or an array of objects with item and growth properties. |
| `grow_up` | object |  | Event to fire when an entity grows up. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `interact_filters` | minecraftFilter |  | List of conditions to meet so that the entity can be fed. |
| `pause_growth_items` | stringArray |  | since 1.26.10. List of items that can be fed to a baby entity to pause its growth. |
| `reset_growth_items` | stringArray |  | since 1.26.10. List of items that can be fed to a baby entity to reset its growth timer. |
| `pause_growth` | object |  | since 1.26.10. Event triggered when a baby entity's growth is paused (via a `pause_growth_items` feed). Can be an object with `event` and `target` properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `reset_growth` | object |  | since 1.26.10. Event triggered when a baby entity's growth is reset (via a `reset_growth_items` feed). Can be an object with `event` and `target` properties, or a simple event string. See `ActorDefinitionTrigger`. |

Example (/minecraft:entity/component_groups/minecraft:chicken_baby/minecraft:ageable/):
```json
{
 "duration": 1200,
 "feed_items": [
  "wheat_seeds",
  "beetroot_seeds",
  "melon_seeds",
  "pumpkin_seeds",
  "pitcher_pod",
  "torchflower_seeds"
 ],
 "pause_growth_items": [
  "golden_dandelion"
 ],
 "reset_growth_items": [
  "golden_dandelion"
 ],
 "grow_up": {
  "event": "minecraft:ageable_grow_up",
  "target": "self"
 }
}
```

### minecraft:ambient_sound_interval

Delay for an entity playing its sound

| Field | Type | Default | Notes |
|---|---|---|---|
| `event_name` | string | `"ambient"` | Level sound event to be played as the ambient sound. |
| `event_names` | objectArray |  | List of dynamic level sound events, with conditions for choosing between them. Evaluated in order, first one wins. If none evaluate to true, 'event_name' will take precedence. |
| `range` | float | `16` | Maximum time in seconds to randomly add to the ambient sound delay time. |
| `value` | float | `8` | Minimum time in seconds before the entity plays its ambient sound again. |

Example (/minecraft:entity/components/minecraft:ambient_sound_interval/):
```json
{
 "event_name": "ambient",
 "event_names": [
  {
   "condition": "query.is_using_item",
   "event_name": "ambient.tame"
  },
  {
   "condition": "!query.is_using_item",
   "event_name": "ambient"
  }
 ],
 "range": 5,
 "value": 5
}
```

### minecraft:anger_level

Compels the entity to track anger towards a set of nuisances.

| Field | Type | Default | Notes |
|---|---|---|---|
| `anger_decrement_interval` | float | `1` | Anger level will decay over time. Defines how often anger towards all nuisances will decrease by one. |
| `angry_boost` | int | `20` | Anger boost applied to angry threshold when mob gets angry. |
| `angry_threshold` | int | `80` | Threshold that define when the mob is considered angry at a nuisance. |
| `default_annoyingness` | int | `0` | The default amount of annoyingness for any given nuisance. Specifies how much to raise anger level on each provocation. |
| `default_projectile_annoyingness` | int | `0` | The default amount of annoyingness for any given nuisance that is a projectile. Specifies how much to raise anger level on each provocation. |
| `max_anger` | int | `100` | The maximum anger level that can be reached. Applies to any nuisance. |
| `nuisance_filter` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filter that is applied to determine if a mob can be a nuisance. |
| `on_increase_sounds` | objectArray | `[]` | Sounds to play when the entity is getting provoked. Evaluated in order. First matching condition wins See `entity/sounddefinition`. |
| `remove_targets_below_angry_threshold` | boolean | `true` | Defines if the mob should remove target if it falls below 'angry' threshold. |
| `sound_interval` | intRange |  | Anger boost applied to angry threshold when the entity gets angry. |
| `duration` | int |  | The amount of time in seconds that the entity will be angry. |
| `duration_delta` | int |  | Variance in seconds added to the duration [-delta, delta]. |
| `filters` | minecraftFilter |  | Filter out mob types that it should not attack while angry (other Piglins) |
| `broadcast_anger` | boolean | `false` | If set, other entities of the same entity definition within the broadcastRange will also become angry |
| `broadcast_anger_on_attack` | boolean | `false` | If set, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob attacks |
| `broadcast_range` | int | `20` | Distance in blocks within which other entities of the same entity type will become angry |
| `broadcast_targets` | stringArray |  | A list of entity families to broadcast anger to |
| `broadcast_filters` | minecraftFilter |  | Conditions that make this entry in the list valid |
| `calm_event` | stringLookup |  | Event to fire when this entity is calmed down |

Example (/minecraft:entity/components/minecraft:anger_level/):
```json
{
 "angry_threshold": 80,
 "angry_boost": 20,
 "anger_decrement_interval": 1,
 "default_annoyingness": 35,
 "default_projectile_annoyingness": 10,
 "max_anger": 150,
 "on_increase_sounds": [
  {
   "condition": "query.anger_level(this) >= 40",
   "sound": "listening_angry"
  },
  {
   "condition": "query.anger_level(this) >= 0",
   "sound": "listening"
  }
 ],
 "nuisance_filter": {
  "all_of": [
   {
    "operator": "not",
    "test": "is_family",
    "subject": "other",
    "value": "warden"
   },
   {
    "operator": "not",
    "test": "is_family",
    "subject": "other",
    "value": "inanimate"
   }
  ]
 },
 "remove_targets_below_angry_threshold": true
}
```

### minecraft:angry

Defines an entity's 'angry' state using a timer.

| Field | Type | Default | Notes |
|---|---|---|---|
| `angry_sound` | string |  | The sound event to play when the mob is angry |
| `broadcast_anger` | boolean | `false` | If set, other entities of the same entity definition within the broadcastRange will also become angry |
| `broadcast_anger_on_attack` | boolean | `false` | If set, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob attacks |
| `broadcast_anger_on_being_attacked` | boolean | `false` | If true, other entities of the same entity definition within the broadcastRange will also become angry whenever this mob is attacked |
| `broadcast_anger_when_dying` | boolean | `true` | If false, when this mob is killed it does not spread its anger to other entities of the same entity definition within the broadcastRange |
| `broadcast_filters` | minecraftFilter |  | Conditions that make this entry in the list valid |
| `broadcast_range` | int | `20` | Distance in blocks within which other entities of the same entity type will become angry |
| `broadcast_targets` | stringArray |  | A list of entity families to broadcast anger to |
| `calm_event` | object |  | Event to fire when this entity is calmed down. Can be a simple event name string or an object with event and target properties. See `ActorDefinitionTrigger`. |
| `duration` | int | `25` | The amount of time in seconds that the entity will be angry. |
| `duration_delta` | int | `0` | Variance in seconds added to the duration [-delta, delta]. |
| `filters` | minecraftFilter |  | Filter out mob types that it should not attack while angry (other Piglins) |
| `sound_interval` | intRange | `0` | The range of time in seconds to randomly wait before playing the sound again. |

### minecraft:annotation.break_door

Allows an entity to break doors, assuming that that flags set up for the component to use in navigation.

> Requires the entity's `navigation` component to have the parameter `can_break_doors` set to `true`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `break_time` | int | `12` | The time in seconds required to break through doors. |
| `min_difficulty` | stringLookup | `"hard"` | The minimum difficulty that the world must be on for this entity to break doors. |

Example (/minecraft:entity/component_groups/minecraft:can_break_doors/minecraft:annotation.break_door/):
```json
{}
```

### minecraft:annotation.open_door

Allows the entity to open doors.

> Requires the entity's `navigation` component to have the parameter `can_open_doors` set to `true`.

### minecraft:apply_knockback_rules

_since 1.26.30_

Defines how an entity applies knockback.

> Released out of beta in format version 1.26.30. The preset field `extra_knockback_approach` controls how knockback from enchantments, sprinting, and swimming combines with the preset's power (`reapply_default` preserves the prior behavior; `multiply` multiplies the preset's power by the extra-knockback factor).

| Field | Type | Default | Notes |
|---|---|---|---|
| `presets` | objectArray | `[]` | Array of rules instances defining how knockback should be applied to the entity. See `entity/minecraft_apply_knockback_rules_instance`. |

Example (/minecraft:entity/components/minecraft:apply_knockback_rules/):
```json
{
 "presets": [
  {
   "horizontal_power": 0.6,
   "vertical_power": -0.6,
   "vertical_velocity_cap": -0.4,
   "check_if_target_is_immersed_in_water": true
  }
 ]
}
```

### minecraft:apply_knockback_rules_instance

Intance of rules definition.

| Field | Type | Default | Notes |
|---|---|---|---|
| `check_if_target_is_immersed_in_water` | boolean | `false` | Whether or not the target should be fully immersed in water for the knockback rules to apply. |
| `extra_knockback_approach` | stringEnum | `"reapply_default"` | Defines the approach for combining extra knockback from enchantments or sprinting: - "reapply_default": Reapplies knockback again with default knockback parameters, i.e. values not defined by this component. - "multiply_reduced": Multiplies the extra knockbac… Values: `multiply_reduced`, `reapply_default`. |
| `filter` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filter for the entity type that will be affected by these knockback rules. |
| `horizontal_power` | float | `1` | Power with which a target should be knocked backwards. |
| `knockback_mode` | stringEnum | `"relative_horizontal"` | Defines how knockback is applied to the target: - "relative_horizontal": Applies knockback along the horizontal direction from the attacker to the target. - "hit_direction": Applies knockback based on the hit direction and the point of impact (e.g. hits to th… Values: `hit_direction`, `relative_horizontal`. |
| `scale_with_damage` | boolean | `false` | Scaling factor to the magnitude of knockback based on the inverse square of the damage. |
| `slowdown_scale` | float | `0.5` | Scaling factor to apply to the target's velocity before applying knockback. |
| `vertical_power` | float | `0.4000000059604645` | Power with which a target should be knocked upwards. |
| `vertical_velocity_cap` | float | `0.4000000059604645` | Maximum allowed Y velocity after target's knockback rules have been evaluated. |

### minecraft:area_attack

A component that does damage to entities that get within range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `cause` | stringLookup |  | The type of damage that is applied to entities that enter the damage range. A list of available damage sources can be found at [Entity Damage Sources located in the Vanilla Listings Documentation](../../../VanillaListingsReference/AddonEntityDamageSources.md). |
| `damage_cooldown` | float | `0` | Attack cooldown (in seconds) for how often this entity can attack a target. |
| `damage_per_tick` | int | `2` | How much damage per tick is applied to entities that enter the damage range. |
| `damage_range` | float | `0.2` | How close a hostile entity must be to have the damage applied. |
| `death_message_override` | string |  | A localization key to use as the death message when the area attack kills an entity. If empty, the default death message for the damage cause is used. |
| `entity_filter` | minecraftFilter |  | The set of entities that are valid to apply the damage to when within range. |
| `play_attack_sound` | boolean | `true` | If the entity should play their attack sound when attacking a target. |
| `use_self_as_damage_source` | boolean | `true` | since 1.26.30. Whether the entity is treated as the source of the area damage. When true (default), other entities can retaliate against the attacking entity. Set to false to apply damage without making the attacker a valid retaliation target. |

Example (/minecraft:entity/component_groups/minecraft:slime_large/minecraft:area_attack/):
```json
{
 "cause": "entity_attack",
 "damage_cooldown": 0.5,
 "damage_per_tick": 6,
 "damage_range": 0.15,
 "entity_filter": {
  "any_of": [
   {
    "subject": "other",
    "test": "is_family",
    "value": "player"
   },
   {
    "subject": "other",
    "test": "is_family",
    "value": "irongolem"
   }
  ]
 }
}
```

### minecraft:attack

Defines an entity's melee attack damage and any additional status effects applied on hit. Typical damage values range from 3 (zombie, creeper) to 7-21 (iron golem).

| Field | Type | Default | Notes |
|---|---|---|---|
| `damage` | floatRange |  | Range of the random amount of damage the melee attack deals. A negative value can heal the entity instead of hurting it. Can be a number, an array [min, max], or an object with range_min and range_max properties. Range: -50..50. |
| `effect_amplifier` | int | `0` | Amplifier level (potion tier) of the status ailment applied to the damaged entity. Higher values increase the strength of the effect. |
| `effect_duration` | float | `0` | Duration in seconds of the status ailment applied to the damaged entity. |
| `effect_name` | string |  | Identifier of the status ailment to apply to an entity attacked by this entity's melee attack. |

### minecraft:attack_cooldown

Adds a cooldown to an entity. The intention of this cooldown is to be used to prevent the entity from attempting to acquire new attack targets.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_cooldown_complete_event` | object |  | Event to be run when the cooldown is complete. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `attack_cooldown_time` | floatRange |  | Amount of time in seconds for the cooldown. Can be specified as a number or a pair of numbers (min and max). Range: 0..1. |

### minecraft:barter

Enables the component to drop an item as a barter exchange.

| Field | Type | Default | Notes |
|---|---|---|---|
| `barter_table` | stringLookup | `""` | Loot table that's used to drop a random item. |
| `cooldown_after_being_attacked` | intRange | `10` | Duration, in seconds, for which mob won't barter items if it was hurt. Range: 0..60. |

### minecraft:block_climber

Allows the player to detect and manuever on the scaffolding block.

Example (/minecraft:entity/components/minecraft:block_climber/):
```json
{}
```

### minecraft:block_movement_slowdown_immunity

Prevents specified blocks from contributing to this entity's block movement slowdown. It does not cause other blocks to apply slowdown.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` | objectArray | `[]` | List of block descriptors whose existing movement slowdown contribution should be ignored. If omitted or empty, no contributions are ignored. |

Example (/minecraft:entity/components/minecraft:block_movement_slowdown_immunity/):
```json
{
 "blocks": [
  "minecraft:web"
 ]
}
```

### minecraft:block_sensor

Fires off a specified event when a block in the block list is broken within the sensor range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_break` | objectArray |  | List of blocks to watch for being broken to fire off a specified event. If a block is in multiple lists, multiple events will fire. |
| `sensor_radius` | float | `16` | The maximum radial distance in which a specified block can be detected. The biggest radius is 32.0. |
| `sources` | minecraftFilter |  | List of sources that break the block to listen for. If none are specified, all block breaks will be detected. |

### minecraft:body_rotation_always_follows_head

_since 1.21.90_

Causes the entity's body rotation to match the one of their head. Does not override the "minecraft:body_rotation_blocked" component.

### minecraft:body_rotation_axis_aligned

Causes the entity's body to automatically rotate to align with the nearest cardinal direction based on its current facing direction. Combining this with the "minecraft:body_rotation_blocked" component will cause the entity to align to the nearest cardinal direction and remain fixed in that orientation, regardless of future changes in its facing direction.

Example (/minecraft:entity/component_groups/minecraft:adult_immobile/minecraft:body_rotation_axis_aligned/):
```json
{}
```

### minecraft:body_rotation_blocked

_since 1.20.80_

When set, the entity will no longer visually rotate their body to match their facing direction.

### minecraft:body_rotation_locked_to_vehicle

Causes the entity's body rotation to match their vehicle's facing direction.

> In 1.21.130 this component was renamed to `minecraft:rotation_locked_to_vehicle`, which now locks both body and overall entity rotation to the vehicle. Existing usages should migrate to the new identifier.

Example (/minecraft:entity/components/minecraft:body_rotation_locked_to_vehicle/):
```json
{}
```

### minecraft:boostable

Defines the conditions and behavior of a rideable entity's boost.

| Field | Type | Default | Notes |
|---|---|---|---|
| `boost_items` | objectArray |  | List of items that can be used to boost while riding this entity. |
| `duration` | float | `3` | Time in seconds for the boost. |
| `speed_multiplier` | float | `1` | Factor by which the entity's normal speed increases. E.g. 2.0 means go twice as fast. |

Example (/minecraft:entity/component_groups/minecraft:pig_saddled/minecraft:boostable/):
```json
{
 "speed_multiplier": 1.35,
 "duration": 3,
 "boost_items": [
  {
   "item": "carrotOnAStick",
   "damage": 2,
   "replace_item": "fishing_rod"
  }
 ]
}
```

### minecraft:boss

Defines the current state of the boss for updating the boss HUD.

| Field | Type | Default | Notes |
|---|---|---|---|
| `hud_range` | int | `55` | The max distance from the boss at which the boss's health bar is present on the players screen. |
| `name` | string | `55` | The name that will be displayed above the boss's health bar. |
| `should_darken_sky` | boolean | `false` | Whether the sky should darken in the presence of the boss. |

### minecraft:break_blocks

Specifies the blocks that the entity can break as it moves around.

| Field | Type | Default | Notes |
|---|---|---|---|
| `breakable_blocks` | stringArray |  | A list of the blocks that can be broken as this entity moves around. |

### minecraft:breathable

Defines what blocks this entity can breathe in and gives them the ability to suffocate.

| Field | Type | Default | Notes |
|---|---|---|---|
| `breathe_blocks` | stringArray |  | List of blocks this entity can breathe in, in addition to the selected items above. |
| `breathes_air` | boolean | `true` | If set, this entity can breathe in air. |
| `breathes_lava` | boolean | `true` | If set, this entity can breathe in lava. |
| `breathes_solids` | boolean | `false` | If set, this entity can breathe in solid blocks. |
| `breathes_water` | boolean | `false` | If set, this entity can breathe in water. |
| `generates_bubbles` | boolean | `true` | If set, this entity will have visible bubbles while in water. |
| `inhale_time` | number | `0` | Time in seconds to recover breath to maximum. |
| `non_breathe_blocks` | stringArray |  | List of blocks this entity cannot breathe in, in addition to the selected items above. |
| `suffocate_time` | int | `-20` | Time in seconds between suffocation damage. |
| `total_supply` | int | `15` | Time in seconds the entity can hold its breath. Range: 0... |
| `suffocateTime` | number |  | SuffocateTime |
| `totalSupply` | number |  | TotalSupply |
| `can_dehydrate` | boolean | `false` | since 1.21.130. If true, entities that only breathe water (for example, fish) will take dehydration damage when out of water. |

Example (/minecraft:entity/components/minecraft:breathable/):
```json
{
 "suffocateTime": 0,
 "totalSupply": 15
}
```

### minecraft:breedable

Allows an entity to establish a way to get into the love state used for breeding.

> This component is commonly used in conjunction with the 'minecraft:behavior.breed' component.

> In 1.21.130 the `transform_to_item` field on each entry of `breed_items` was renamed to `result_item`. The new field is defined per-item, so different breed items can transform into different result items on use.

> In 1.26.0 the offspring-related fields were split out into the separate `minecraft:offspring_data` component. `minecraft:breedable` now contains only love-state, taming/health requirements, and pregnancy-flow data; the new `minecraft:offspring_data` component is required to actually spawn the child entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_sitting` | boolean | `false` | If true, entities can breed while sitting |
| `breed_cooldown` | float | `60` | Time in seconds before the Entity can breed again. |
| `breed_items` | stringArray |  | The list of items that can be used to get the entity into the 'love' state. Can be a single item or an array. |
| `breeds_with` | objectArray |  | The entity definitions that this entity can breed with. Can be a single object or an array. |
| `causes_pregnancy` | boolean | `false` | If true, the entity will become pregnant instead of spawning a baby. |
| `environment_requirements` | objectArray |  | The list of nearby block requirements to get the entity into the 'love' state. |
| `extra_baby_chance` | percentRange | `0` | Chance that up to 16 babies will spawn. |
| `love_filters` | minecraftFilter |  | The filters to run when attempting to fall in love. |
| `require_full_health` | boolean | `false` | If true, the entity needs to be at full health before it can breed. |
| `require_tame` | boolean | `true` | If true, the entities need to be tamed first before they can breed. |
| `blend_attributes` | boolean | `true` | If true, the entities will blend their attributes in the offspring after they breed. For example, horses blend their health, movement, and jump_strength in their offspring. |
| `combine_parent_colors` | boolean | `false` | since 1.21.60. If true and no color mutation occurs, the baby's `minecraft:color` is set to a blend of the parents' colors (following DyeItem combination rules). If the parents' colors aren't compatible, the baby inherits one parent's color at random. |
| `deny_parents_variant` | object |  | Determines how likely the baby of parents with the same variant will deny that variant and take a random variant within the given range instead. |
| `inherit_tamed` | boolean |  | If true, the babies will be automatically tamed if its parents are. |
| `mutation_factor` | object |  | Determines how likely the babies are to NOT inherit one of their parent's variances. |

Example (/minecraft:entity/component_groups/minecraft:chicken_adult/minecraft:breedable/):
```json
{
 "require_tame": false,
 "breeds_with": {
  "minecraft:chicken": {}
 },
 "breed_items": [
  "wheat_seeds",
  "beetroot_seeds",
  "melon_seeds",
  "pumpkin_seeds",
  "pitcher_pod",
  "torchflower_seeds"
 ]
}
```

### minecraft:bribeable

Defines the way an entity can get into the 'bribed' state.

| Field | Type | Default | Notes |
|---|---|---|---|
| `bribe_cooldown` | float | `2` | Time in seconds before the Entity can be bribed again. |
| `bribe_items` | stringArray |  | The list of items that can be used to bribe the entity. Can be an array or a single item string. |

Example (/minecraft:entity/component_groups/dolphin_adult/minecraft:bribeable/):
```json
{
 "bribe_items": [
  "fish",
  "salmon"
 ]
}
```

### minecraft:buoyant

Enables an entity to float on the specified liquid blocks.

> In 1.26.10 the `simulate_waves` boolean was replaced with the `movement_type` string field (`waves` / `bobbing` / `none`). `big_wave_probability` and `big_wave_speed` only apply when `movement_type` is `waves`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `apply_gravity` | boolean | `true` | Applies gravity each tick. Causes "movement_type" to be more impactful, but also gravity to be applied more intensely outside liquids. |
| `base_buoyancy` | float | `1` | Base buoyancy used to calculate how much will a entity float. |
| `big_wave_probability` | float | `0.03` | Probability for a big wave hitting the entity. Only used if "movement_type" is "waves". |
| `big_wave_speed` | float | `10` | Multiplier for the speed to make a big wave. Triggered depending on "big_wave_probability". |
| `can_auto_step_from_liquid` | boolean | `false` | since 1.26.10. Whether the entity can step out of a liquid block onto a neighboring solid block when pushed against it. |
| `drag_down_on_buoyancy_removed` | float | `0` | How much an entity will be dragged down when the component is removed. |
| `liquid_blocks` | stringArray |  | List of blocks this entity can float on. Must be a liquid block. |
| `movement_type` | string | `"waves"` | since 1.26.10. Type of vertical movement applied to the entity. `waves` simulates wave movement based on the entity's speed (default). `bobbing` moves the entity up and down at a constant pace. `none` disables wave movement. Replaces the previous `simulate_waves` boolean. |

Example (/minecraft:entity/components/minecraft:buoyant/):
```json
{
 "apply_gravity": false,
 "liquid_blocks": [
  "minecraft:flowing_water",
  "minecraft:water"
 ]
}
```

### minecraft:burns_in_daylight

Specifies that this entity takes fire damage when exposed to direct sunlight. This component is used by undead mobs like zombies, skeletons, and phantoms. The entity will catch fire when in sunlight unless it is wearing armor in the protection slot, standing in water, or in a shaded area.

| Field | Type | Default | Notes |
|---|---|---|---|
| `protection_slot` | string | `"slot.armor.head"` | since 1.21.130. The equipment slot that provides protection from burning in sunlight. If armor is equipped in this slot, the entity will not burn. Commonly set to 'slot.armor.head' for helmets or 'slot.armor.body' for horse armor. Values: `slot.armor.body`, `slot.armor.chest`, `slot.armor.feet`, `slot.armor.head`, `slot.armor.legs`, `slot.weapon.mainhand`, `slot.weapon.offhand`. |

Example (/minecraft:entity/components/minecraft:burns_in_daylight/):
```json
{}
```

### minecraft:can_climb

Allows an entity to climb ladders.

Example (/minecraft:entity/components/minecraft:can_climb/):
```json
{}
```

### minecraft:can_fly

Marks the entity as being able to fly, the pathfinder won't be restricted to paths where a solid block is required underneath it.

Example (/minecraft:entity/components/minecraft:can_fly/):
```json
{}
```

### minecraft:can_join_raid

Specifies if an entity can join a raid.

### minecraft:can_power_jump

Allows the entity to power jump like the Horse does in Vanilla.

### minecraft:cannot_be_attacked

_since 1.21.50_

When set, blocks entities from attacking the owner entity unless they have the "minecraft:ignore_cannot_be_attacked" component.

### minecraft:celebrate_hunt

Specifies hunt celebration behaviour.

| Field | Type | Default | Notes |
|---|---|---|---|
| `broadcast` | boolean | `true` | If true, celebration will be broadcasted to other entities in the radius. |
| `celeberation_targets` | minecraftFilter |  | The list of conditions that target of hunt must satisfy to initiate celebration. |
| `celebrate_sound` | string |  | The sound event to play when the mob is celebrating |
| `duration` | int | `4` | Duration, in seconds, of celebration |
| `radius` | float | `16` | If broadcast is enabled, specifies the radius in which it will notify other entities for celebration. |
| `sound_interval` | intRange | `0` | The range of time in seconds to randomly wait before playing the sound again |

### minecraft:collision_box

Sets the width and height of the Entity's collision box.

| Field | Type | Default | Notes |
|---|---|---|---|
| `height` | float | `1.7999999523162842` | Height of the collision box in blocks. A negative value will be assumed to be 0. |
| `width` | float | `0.6000000238418579` | Width and Depth of the collision box in blocks. A negative value will be assumed to be 0. |

Example (/minecraft:entity/components/minecraft:collision_box/):
```json
{
 "height": 0.6,
 "width": 0.35
}
```

### minecraft:color

Defines the entity's main color.

> This attribute only works on vanilla entities that have predefined color values (sheep, llama, shulker).

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `0` | The Palette Color value of the entity. |

### minecraft:color2

Defines the entity's second texture color.

> Only works on vanilla entities that have a second predefined color values (tropical fish).

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `0` | The second Palette Color value of the entity. |

### minecraft:combat_regeneration

Gives `Regeneration I` and removes `Mining Fatigue` from the mob that kills the entity's attack target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `apply_to_family` | boolean | `false` | Determines if the mob will grant mobs of the same type combat buffs if they kill the target. |
| `apply_to_self` | boolean | `false` | Determines if the mob will grant itself the combat buffs if it kills the target. |
| `regeneration_duration` | int | `5` | The duration in seconds of Regeneration I added to the mob. Can also be set to "infinite" |

### minecraft:conditional_bandwidth_optimization

Defines the Conditional Spatial Update Bandwidth Optimizations of this entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `conditional_values` | objectArray |  | The object containing the conditional bandwidth optimization values. |
| `default_values` | object |  | The object containing the default bandwidth optimization values. |

Example (/minecraft:entity/components/minecraft:conditional_bandwidth_optimization/):
```json
{}
```

### minecraft:custom_hit_test

List of hitboxes for melee and ranged hits against the entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `hitboxes` | objectArray |  | List of hitboxes for melee and ranged hits against the entity. |

### minecraft:damage_over_time

Applies defined amount of damage to the entity at specified intervals.

| Field | Type | Default | Notes |
|---|---|---|---|
| `damage_per_hurt` | int | `1` | Amount of damage caused each hurt. |
| `time_between_hurt` | float | `0` | Time in seconds between damage. |

Example (/minecraft:entity/component_groups/dolphin_dried/minecraft:damage_over_time/):
```json
{
 "damage_per_hurt": 1,
 "time_between_hurt": 0
}
```

### minecraft:damage_sensor

Defines what events to call when this entity is damaged by specific entities or items.

| Field | Type | Default | Notes |
|---|---|---|---|
| `triggers` | minecraftEventTriggerArray |  | List of triggers with the events to call when taking specific kinds of damage. |
| `deals_damage` | boolean | `false` | Defines how received damage affects the entity. Values: `yes`, `no`, `no_but_side_effects_apply`, `no_but_entity_effects_apply`. |

Example (/minecraft:entity/components/minecraft:damage_sensor/):
```json
{
 "triggers": [
  {
   "deals_damage": "no",
   "on_damage": {
    "filters": {
     "all_of": [
      {
       "subject": "other",
       "test": "is_family",
       "value": "player"
      },
      {
       "subject": "other",
       "test": "is_owner"
      }
     ]
    }
   }
  }
 ]
}
```

### minecraft:dash

_since 1.20.40_

Ability for a rideable entity to dash.

| Field | Type | Default | Notes |
|---|---|---|---|
| `cooldown_time` | float | `1` | The dash cooldown in seconds. Default value is 1.000000. |
| `horizontal_momentum` | float | `1` | Horizontal momentum of the dash. |
| `vertical_momentum` | float | `1` | Vertical momentum of the dash. |

Example (/minecraft:entity/component_groups/minecraft:camel_saddled/minecraft:dash/):
```json
{
 "cooldown_time": 2.75,
 "horizontal_momentum": 20,
 "vertical_momentum": 0.6
}
```

### minecraft:dash_action

Ability for a rideable entity to dash.

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_dash_underwater` | boolean | `false` | Whether the entity can dash underwater. Default value is false. |
| `cooldown_time` | float | `1` | The dash cooldown in seconds. Default value is 1.000000. |
| `direction` | string | `"entity"` | Should the momentum be applied in the direction of the 'entity' or 'passenger'. When 'entity' is used the momentum is applied horizontally according to the direction the entity is looking, using only the entity's yaw. When 'passenger' is used the momentum wil… |
| `horizontal_momentum` | float | `1` | Horizontal momentum of the dash. |
| `vertical_momentum` | float | `1` | Vertical momentum of the dash. |

### minecraft:default_look_angle

Sets this entity's default head rotation angle.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `0` | Angle in degrees. |

### minecraft:despawn

Despawns the Actor when the despawn rules or optional filters evaluate to true.

| Field | Type | Default | Notes |
|---|---|---|---|
| `despawn_from_chance` | boolean | `true` | Determines if "min_range_random_chance" is used in the standard despawn rules |
| `despawn_from_distance` | object |  | Specifies if the 'min_distance' and 'max_distance' are used in the standard despawn rules. |
| `despawn_from_inactivity` | boolean | `true` | Determines if the "min_range_inactivity_timer" is used in the standard despawn rules. |
| `despawn_from_simulation_edge` | boolean | `true` | Determines if the mob is instantly despawned at the edge of simulation distance in the standard despawn rules. |
| `filters` | minecraftFilter |  | The list of conditions that must be satisfied before the Actor is despawned. If a filter is defined then standard despawn rules are ignored. |
| `min_range_inactivity_timer` | int | `30` | The amount of time in seconds that the mob must be inactive. |
| `min_range_random_chance` | int | `800` | A random chance between 1 and the given value. |
| `remove_child_entities` | boolean | `false` | If true, all entities linked to this entity in a child relationship (eg. leashed) will also be despawned. |

Example (/minecraft:entity/components/minecraft:despawn/):
```json
{
 "despawn_from_distance": {}
}
```

### minecraft:dimension_bound

_since 1.21.40_

Prevents the entity from changing dimension through portals.

Example (/minecraft:entity/components/minecraft:dimension_bound/):
```json
{}
```

### minecraft:drying_out_timer

Adds a timer for drying out that will count down and fire 'dried_out_event' or will stop as soon as the entity will get under rain or water and fire 'stopped_drying_out_event'

| Field | Type | Default | Notes |
|---|---|---|---|
| `dried_out_event` | object |  | Event to fire when the drying out time runs out. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `recover_after_dried_out_event` | object |  | Event to fire when entity was already dried out but received increase in water supply. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `stopped_drying_out_event` | object |  | Event to fire when entity stopped drying out. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `total_time` | float | `0` | Amount of time in seconds to dry out fully. |
| `water_bottle_refill_time` | float | `0` | Optional amount of additional time in seconds given by using splash water bottle on entity. |

Example (/minecraft:entity/component_groups/dolphin_on_land/minecraft:drying_out_timer/):
```json
{
 "total_time": 120,
 "water_bottle_refill_time": 0,
 "dried_out_event": {
  "event": "dried_out"
 },
 "stopped_drying_out_event": {
  "event": "stop_dryingout"
 },
 "recover_after_dried_out_event": {
  "event": "recover_after_dried_out"
 }
}
```

### minecraft:dweller

Compels an entity to join and migrate between villages and other dwellings.

| Field | Type | Default | Notes |
|---|---|---|---|
| `dwelling_type` | string |  | The type of dwelling the entity wishes to join. Current Types: village. |
| `dwelling_role` | string |  | The role of which the entity plays in the dwelling. Current Roles: inhabitant, defender, hostile, passive. |
| `update_interval_base` | float |  | How often the entity checks on their dwelling status in ticks. Positive values only. |
| `update_interval_variant` | float |  | The variant value in ticks that will be added to the update_interval_base. |
| `can_find_poi` | boolean |  | Whether or not the entity can find and add POIs to the dwelling. |
| `first_founding_reward` | int |  | Determines how much reputation players are rewarded on first founding. |
| `can_migrate` | boolean |  | Determines whether the entity can migrate between dwellings, or only have its initial dwelling. |
| `dwelling_bounds_tolerance` | float |  | A padding distance for checking if the entity is within the dwelling. |
| `preferred_profession` | string |  | Allows the user to define a starting profession for this particular Dweller, instead of letting them choose organically. (They still need to gain experience from trading before this takes effect.) |

### minecraft:economy_trade_table

Defines this entity's ability to trade with players.

| Field | Type | Default | Notes |
|---|---|---|---|
| `convert_trades_economy` | boolean | `false` | Determines when the mob transforms, if the trades should be converted when the new mob has a economy_trade_table. When the trades are converted, the mob will generate a new trade list with their new trade table, but then it will try to convert any of the same… |
| `cured_discount` | intRange |  | How much should the discount be modified by when the player has cured the Zombie Villager. Can be specified as a pair of numbers (When use_legacy_price_formula is true this is the low-tier trade discount and high-tier trade discount, otherwise it is the minor… |
| `display_name` | string |  | Name to be displayed while trading with this entity |
| `hero_demand_discount` | int | `-4` | Used in legacy prices to determine how much should Demand be modified by when the player has the Hero of the Village mob effect |
| `max_cured_discount` | intRange |  | The max the discount can be modified by when the player has cured the Zombie Villager. Can be specified as a pair of numbers (When use_legacy_price_formula is true this is the low-tier trade discount and high-tier trade discount, otherwise it is the minor pos… |
| `max_nearby_cured_discount` | int | `-200` | The max the discount can be modified by when the player has cured a nearby Zombie Villager. Only used when use_legacy_price_formula is true, otherwise max_cured_discount (low) is used. |
| `nearby_cured_discount` | int | `-20` | How much should the discount be modified by when the player has cured a nearby Zombie Villager |
| `new_screen` | boolean | `false` | Used to determine if trading with entity opens the new trade screen |
| `persist_trades` | boolean | `false` | Determines if the trades should persist when the mob transforms. This makes it so that the next time the mob is transformed to something with a trade_table or economy_trade_table, then it keeps their trades. |
| `show_trade_screen` | boolean | `true` | Show an in game trade screen when interacting with the mob. |
| `table` | string |  | File path relative to the resource pack root for this entity's trades |
| `use_legacy_price_formula` | boolean | `false` | Determines whether the legacy formula is used to determines the trade prices. |

### minecraft:entity_armor_equipment_slot_mapping

It defines to which armor slot an item equipped to 'minecraft:equippable''s second slot should be equipped to. It is automatically applied to all entities for worlds with a version greater than or equal to 1.21.10. For older worlds, 'slot.armor.torso' will be used. It is strongly advised not to explicitly use this component, as no backwards compatibility for it will be provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `armor_slot` | string |  | The armor slot an item equipped to 'minecraft:equippable''s second slot should be equipped to. It defaults to 'slot.armor.torso' for entities with a format version prior to 1.21.10, and to 'slot.armor.body' otherwise. |

### minecraft:entity_sensor

A component that owns multiple subsensors, each one firing an event when a set of conditions are met by other entities within the defined range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `find_players_only` | boolean | `false` | Limits the search to Players only for all subsensors. |
| `relative_range` | boolean | `true` | If true the subsensors' range is additive on top of the entity's size. |
| `subsensors` | objectArray |  | The list of subsensors which sense for entities and emit events when all their conditions are met. |

Example (/minecraft:entity/component_groups/minecraft:parrot_not_riding_player/minecraft:entity_sensor/):
```json
{
 "relative_range": false,
 "subsensors": [
  {
   "event": "minecraft:on_riding_player",
   "event_filters": {
    "all_of": [
     {
      "test": "is_riding",
      "operator": "equals",
      "subject": "self",
      "value": true
     },
     {
      "test": "has_component",
      "operator": "equals",
      "subject": "self",
      "value": "minecraft:behavior.look_at_player"
     }
    ]
   },
   "range": [
    2,
    2
   ]
  }
 ]
}
```

### minecraft:environment_sensor

Creates a trigger based on environment conditions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `triggers` | objectArray |  | The list of triggers that fire when the environment conditions match the given filter criteria. Can be an array of trigger objects or a single trigger object. |

Example (/minecraft:entity/components/minecraft:environment_sensor/):
```json
{
 "triggers": [
  {
   "event": "minecraft:stop_playing_idle_ground_sound",
   "filters": {
    "all_of": [
     {
      "subject": "self",
      "test": "on_ground",
      "value": true
     },
     {
      "subject": "self",
      "test": "has_target",
      "value": true
     },
     {
      "domain": "minecraft:is_playing_idle_ground_sound",
      "operator": "==",
      "test": "bool_property"
     }
    ]
   }
  },
  {
   "event": "minecraft:start_playing_idle_ground_sound",
   "filters": {
    "all_of": [
     {
      "domain": "minecraft:is_playing_idle_ground_sound",
      "operator": "!=",
      "test": "bool_property"
     },
     {
      "any_of": [
       {
        "subject": "self",
        "test": "on_ground",
        "value": false
       },
       {
        "subject": "self",
        "test": "has_target",
        "value": false
       }
      ]
     }
    ]
   }
  }
 ]
}
```

### minecraft:equip_item

The entity puts on the desired equipment.

| Field | Type | Default | Notes |
|---|---|---|---|
| `excluded_items` | objectArray |  | List of items that the entity should not equip. |
| `can_wear_armor` | boolean | `false` | If true, the entity can pick up and wear armor items from the ground. |

Example (/minecraft:entity/components/minecraft:equip_item/):
```json
{
 "excluded_items": [
  {
   "item": "minecraft:banner:15"
  }
 ]
}
```

### minecraft:equipment

Sets the Equipment table to use for this Entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `slot_drop_chance` | stringArray |  | A list of slots with the chance to drop an equipped item from that slot. Can be an array of slot name strings or an array of objects with slot and drop_chance properties. |
| `table` | string |  | The file path to the equipment table, relative to the behavior pack's root. |

### minecraft:equippable

Defines an entity's behavior for having items equipped to it.

> In 1.26.0, `on_equip` and `on_unequip` events on each slot no longer fire on world load; they now run only as a result of an in-game equip or unequip interaction.

| Field | Type | Default | Notes |
|---|---|---|---|
| `slots` | objectArray |  | List of slots and the item that can be equipped. |

Example (/minecraft:entity/component_groups/minecraft:llama_tamed/minecraft:equippable/):
```json
{
 "slots": [
  {
   "slot": 1,
   "item": "carpet",
   "accepted_items": [
    "carpet"
   ]
  }
 ]
}
```

### minecraft:exhaustion_values

Defines how much exhaustion each player action should take.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack` | float | `0.10000000149011612` | Amount of exhaustion applied when attacking. |
| `damage` | float | `0.10000000149011612` | Amount of exhaustion applied when taking damage. |
| `heal` | float | `6` | Amount of exhaustion applied when healed through food regeneration. |
| `jump` | float | `0.05000000074505806` | Amount of exhaustion applied when jumping. |
| `lunge` | float | `4` | since 1.21.130. Amount of exhaustion applied when triggering the Lunge enchantment, multiplied by the enchantment level. |
| `mine` | float | `0.004999999888241291` | Amount of exhaustion applied when mining. |
| `sprint` | float | `0.009999999776482582` | Amount of exhaustion applied when sprinting. |
| `sprint_jump` | float | `0.20000000298023224` | Amount of exhaustion applied when sprint jumping. |
| `swim` | float | `0.009999999776482582` | Amount of exhaustion applied when swimming. |
| `walk` | float | `0` | Amount of exhaustion applied when walking. |

Example (/minecraft:entity/components/minecraft:exhaustion_values/):
```json
{
 "sprint": 0.1,
 "jump": 0.05,
 "attack": 0.1,
 "damage": 0.1,
 "heal": 6,
 "lunge": 4,
 "sprint_jump": 0.2,
 "mine": 0.005,
 "swim": 0.01,
 "walk": 0
}
```

### minecraft:experience_reward

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_bred` | molang | `""` | A Molang expression defining the amount of experience rewarded when this entity is successfully bred. |
| `on_death` | molang | `""` | A Molang expression defining the amount of experience rewarded when this entity dies. |

Example (/minecraft:entity/components/minecraft:experience_reward/):
```json
{
 "on_death": "query.last_hit_by_player ? 10 : 0"
}
```

### minecraft:explode

Defines how the entity explodes.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_underwater` | boolean | `false` | since 1.21.40. If true, the explosion will affect blocks and entities under water. |
| `breaks_blocks` | boolean | `true` | If true, the explosion will destroy blocks in the explosion radius. |
| `causes_fire` | boolean | `false` | If true, blocks in the explosion radius will be set on fire. |
| `damage_scaling` | float | `1` | since 1.21.40. A scale factor applied to the explosion's damage to entities. A value of 0 prevents the explosion from dealing any damage. Negative values cause the explosion to heal entities instead. |
| `destroy_affected_by_griefing` | boolean | `false` | If true, whether the explosion breaks blocks is affected by the mob griefing game rule. |
| `fire_affected_by_griefing` | boolean | `false` | If true, whether the explosion causes fire is affected by the mob griefing game rule. |
| `fuse_length` | intRange |  | The range for the random amount of time the fuse will be lit before exploding, a negative value means the explosion will be immediate. |
| `fuse_lit` | boolean | `false` | If true, the fuse is already lit when this component is added to the entity. |
| `knockback_scaling` | float | `1` | since 1.21.40. A scale factor applied to the knockback force caused by the explosion. |
| `max_resistance` | float | `3.40282e+38` | A blocks explosion resistance will be capped at this value when an explosion occurs. |
| `negates_fall_damage` | boolean | `false` | since 1.21.40. Defines whether the explosion should apply fall damage negation to Players above the point of collision. |
| `particle_effect` | string | `"explosion"` | since 1.21.40. The name of the particle effect to use. The accepted strings are 'explosion', 'wind_burst', or 'breeze_wind_burst'. |
| `power` | float | `3` | The radius of the explosion in blocks and the amount of damage the explosion deals. |
| `sound_effect` | string | `"explode"` | since 1.21.40. The name of the sound effect played when the explosion triggers. |
| `toggles_blocks` | boolean | `false` | since 1.21.40. If true, the explosion will toggle blocks in the explosion radius. |
| `add` | object |  | Add |

Example (/minecraft:entity/components/minecraft:explode/):
```json
{
 "knockback_scaling": 0.6,
 "damage_scaling": 0,
 "allow_underwater": true,
 "breaks_blocks": false,
 "causes_fire": false,
 "max_resistance": 0,
 "negates_fall_damage": false,
 "particle_effect": "breeze_wind_burst",
 "toggles_blocks": true,
 "power": 3,
 "sound_effect": "breeze_wind_charge.burst"
}
```

### minecraft:fire_immune

Sets that this entity doesn't take damage from fire.

Example (/minecraft:entity/components/minecraft:fire_immune/):
```json
{}
```

### minecraft:floats_in_liquid

Sets that this entity can float in liquid blocks.

### minecraft:flocking

Allows entities to flock in groups in water or not.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_distance` | float | `0` | The amount of blocks away the entity will look at to push away from. |
| `block_weight` | float | `0` | The weight of the push back away from blocks. |
| `breach_influence` | float | `0` | The amount of push back given to a flocker that breaches out of the water. |
| `cohesion_threshold` | float | `1` | The threshold in which to start applying cohesion. |
| `cohesion_weight` | float | `1` | The weight applied for the cohesion steering of the flock. |
| `goal_weight` | float | `0` | The weight on which to apply on the goal output. |
| `high_flock_limit` | int | `0` | Determines the high bound amount of entities that can be allowed in the flock. |
| `in_water` | boolean | `false` | Tells the Flocking Component if the entity exists in water. |
| `influence_radius` | float | `0` | The area around the entity that allows others to be added to the flock. |
| `innner_cohesion_threshold` | float | `0` | The distance in which the flocker will stop applying cohesion. |
| `loner_chance` | float | `0` | The percentage chance between 0-1 that a fish will spawn and not want to join flocks. Invalid values will be capped at the end points. |
| `low_flock_limit` | int | `0` | Determines the low bound amount of entities that can be allowed in the flock. |
| `match_variants` | boolean | `false` | Tells the flockers that they can only match similar entities that also match the variant, mark variants, and color data of the other potential flockers. |
| `max_height` | float | `0` | The max height allowable in the air or water. |
| `min_height` | float | `0` | The min height allowable in the air or water. |
| `separation_threshold` | float | `2` | The distance that is determined to be to close to another flocking and to start applying separation. |
| `separation_weight` | float | `1` | The weight applied to the separation of the flock. |
| `use_center_of_mass` | boolean | `false` | Tells the flockers that they will follow flocks based on the center of mass. |

Example (/minecraft:entity/components/minecraft:flocking/):
```json
{
 "in_water": false,
 "match_variants": false,
 "use_center_of_mass": false,
 "low_flock_limit": 4,
 "high_flock_limit": 8,
 "goal_weight": 2,
 "loner_chance": 0.1,
 "influence_radius": 6,
 "breach_influence": 0,
 "separation_weight": 1.75,
 "separation_threshold": 3,
 "cohesion_weight": 1.85,
 "cohesion_threshold": 6.5,
 "innner_cohesion_threshold": 3.5,
 "min_height": 4,
 "max_height": 4,
 "block_distance": 1,
 "block_weight": 0
}
```

### minecraft:flying_speed

Speed in Blocks that this entity flies at.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `0.02` | Flying speed in blocks per tick. |

Example (/minecraft:entity/components/minecraft:flying_speed/):
```json
{
 "value": 0.1
}
```

### minecraft:follow_range

Defines the maximum range, in blocks, that a mob will pursue a target. This affects AI behaviors like chasing players or attacking.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int |  | The default follow range in blocks. Entities will attempt to stay within this radius of their target. |
| `max` | int |  | Maximum follow distance in blocks. The entity will not pursue targets beyond this range. |

### minecraft:free_camera_controlled

When configured as a rideable entity, the entity will be controlled using WASD controls and mouse to move in three dimensions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `backwards_movement_modifier` | float | `0.5` | Modifies speed going backwards. |
| `strafe_speed_modifier` | float | `0.4` | Modifies the strafe speed. |

### minecraft:friction_modifier

Defines how much friction affects this entity.

> In format version 1.26.20, the component's behavior was corrected to match its description: higher values cause more friction (0.0 = no friction, 1.0 = regular, 2.0 = double). It now affects ground friction only (no longer partially affecting air or liquid drag) and works correctly on players and other client-predicted entities. Add `minecraft:uses_legacy_friction` to opt back into the legacy behavior; entities authored against format versions older than 1.26.20 receive it automatically.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `1` | The higher the number, the more friction affects this entity. A value of 1.0 means regular friction, while 2.0 means twice as much. |

### minecraft:game_event_movement_tracking

Allows an entity to emit `entityMove`, `swim` and `flap` game events, depending on the block the entity is moving through. It is added by default to every mob. Add it again to override its behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `emit_flap` | boolean | `false` | If true, the `flap` game event will be emitted when the entity moves through air. |
| `emit_move` | boolean | `true` | If true, the `entityMove` game event will be emitted when the entity moves on ground or through a solid. |
| `emit_swim` | boolean | `true` | If true, the `swim` game event will be emitted when the entity moves through a liquid. |

Example (/minecraft:entity/components/minecraft:game_event_movement_tracking/):
```json
{
 "emit_flap": true
}
```

### minecraft:genetics

Defines the way a mob's genes and alleles are passed on to its offspring, and how those traits manifest in the child. Compatible parent genes are crossed together, the alleles are handed down from the parents to the child, and any matching genetic variants fire off JSON events to modify the child and express the traits.

| Field | Type | Default | Notes |
|---|---|---|---|
| `genes` | objectArray |  | The list of genes that this entity has and will cross with a partner during breeding. |
| `mutation_rate` | float | `0.03125` | Chance that an allele will be replaced with a random one instead of the parent's allele during birth. |

Example (/minecraft:entity/components/minecraft:genetics/):
```json
{
 "mutation_rate": 0.02,
 "genes": [
  {
   "name": "goat_variant",
   "use_simplified_breeding": true,
   "allele_range": {
    "range_min": 1,
    "range_max": 100
   },
   "genetic_variants": [
    {
     "main_allele": {
      "range_min": 1,
      "range_max": 2
     },
     "birth_event": {
      "event": "minecraft:born_screamer",
      "target": "self"
     }
    },
    {
     "main_allele": {
      "range_min": 3,
      "range_max": 100
     },
     "birth_event": {
      "event": "minecraft:born_default",
      "target": "self"
     }
    }
   ]
  }
 ]
}
```

### minecraft:giveable

Defines sets of items that can be used to trigger events when used on this entity. The item will also be taken and placed in the entity's inventory.

| Field | Type | Default | Notes |
|---|---|---|---|
| `cooldown` | float | `0` | An optional cool down in seconds to prevent spamming interactions. |
| `items` | stringArray |  | The list of items that can be given to the entity to place in their inventory. Can be an array or a single item string. |
| `on_give` | object |  | Event to fire when the correct item is given. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |

### minecraft:ground_offset

Sets the offset from the ground that the entity is actually at.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `0` | The value of the entity's offset from the terrain, in blocks. |

### minecraft:group_size

Keeps track of entity group size in the given radius.

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | minecraftFilter |  | The list of conditions that must be satisfied for other entities to be counted towards group size. |
| `radius` | float | `16` | Radius from center of entity. |

### minecraft:grows_crop

Could increase crop growth when entity walks over crop

| Field | Type | Default | Notes |
|---|---|---|---|
| `chance` | float | `0` | Value between 0-1. Chance of success per tick |
| `charges` | int | `10` | Number of charges |

### minecraft:healable

How entities heal

> From 1.21.130, each entry in `items` accepts an optional `result_item` field. On a successful heal, the consumed item is replaced in the player's inventory with the specified item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | minecraftFilter |  | The filter group that defines the conditions for using this item to heal the entity. |
| `force_use` | boolean | `false` | Determines if item can be used regardless of entity being at full health. |
| `items` | objectArray |  | The array of items that can be used to heal this entity. |

Example (/minecraft:entity/components/minecraft:healable/):
```json
{
 "items": [
  {
   "item": "wheat",
   "heal_amount": 2
  },
  {
   "item": "hay_block",
   "heal_amount": 10
  }
 ]
}
```

### minecraft:heartbeat

Defines the entity's heartbeat.

| Field | Type | Default | Notes |
|---|---|---|---|
| `interval` | string | `"1.00"` | A Molang expression defining the inter-beat interval in seconds. A value of zero or less means no heartbeat. |
| `sound_event` | minecraftEventTrigger | `"heartbeat"` | Level sound event to be played as the heartbeat sound. |

Example (/minecraft:entity/components/minecraft:heartbeat/):
```json
{
 "interval": "2.0 - math.clamp(query.anger_level / 80 * 1.5, 0, 1.5)"
}
```

### minecraft:hide

Moves to and hides at their owned POI or the closest nearby.

### minecraft:home

Saves a home position for when the entity is spawned. This component allows entities like bees to remember and return to a specific location such as a hive or nest.

| Field | Type | Default | Notes |
|---|---|---|---|
| `home_block_list` | stringArray | `[]` | Optional list of blocks that can be considered a valid home. If no such block longer exists at that position, the home restriction is removed. Example syntax: minecraft:sand. Not supported: minecraft:sand:1. |
| `restriction_radius` | int | `0` | Optional radius that the entity will be restricted to in relation to its home. |
| `restriction_type` | stringEnum | `"none"` | since 1.21.40. Defines how the entity will be restricted to its home position. Valid values are: 'none' (no restriction), 'random_movement' (restricts random wandering to be near home), and 'all_movement' (restricts all movement to be near home, though entities can always m… Values: `all_movement`, `none`, `random_movement`. |

### minecraft:horse.jump_strength

Determines the jump height for a horse or similar entity, like a donkey.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | object |  | Value of jump strength the entity has when spawned. |

### minecraft:hurt_on_condition

Defines a set of conditions under which an entity should take damage.

| Field | Type | Default | Notes |
|---|---|---|---|
| `damage_conditions` | objectArray |  | List of damage conditions that when met can cause damage to the entity. |

Example (/minecraft:entity/components/minecraft:hurt_on_condition/):
```json
{
 "damage_conditions": [
  {
   "cause": "lava",
   "damage_per_tick": 4,
   "filters": {
    "subject": "self",
    "test": "in_lava"
   }
  }
 ]
}
```

### minecraft:ignore_cannot_be_attacked

_since 1.21.50_

Allows the owner entity to ignore the "minecraft:cannot_be_attacked" component on entities that fulfill the filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Defines which entities are exceptions and are allowed to be attacked by the owner entity, potentially attacked entity is subject "other". If this is not specified then all attacks by the owner are allowed. |

### minecraft:input_air_controlled

_since 1.21.90_

When configured as a rideable entity, the entity will be controlled using WASD controls and mouse to move in three dimensions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `backwards_movement_modifier` | float | `0.5` | Modifies speed going backwards. |
| `strafe_speed_modifier` | float | `0.4` | Modifies the strafe speed. |

Example (/minecraft:entity/component_groups/minecraft:adult_harnessed/minecraft:input_air_controlled/):
```json
{
 "strafe_speed_modifier": 1,
 "backwards_movement_modifier": 0.5
}
```

### minecraft:input_ground_controlled

When configured as a rideable entity, the entity will be controlled using WASD controls. Beginning with 1.19.50 the default auto step height for rideable entities is half a block. Consider adding the "minecraft:variable_max_auto_step" component to increase it.

### minecraft:inside_block_notifier

Verifies whether the entity is inside any of the listed blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_list` | objectArray |  | List of blocks, with certain block states, that we are monitoring to see if the entity is inside. |

Example (/minecraft:entity/components/minecraft:inside_block_notifier/):
```json
{
 "block_list": [
  {
   "block": {
    "name": "minecraft:bubble_column",
    "states": {
     "drag_down": true
    }
   },
   "entered_block_event": {
    "event": "minecraft:entered_bubble_column_down",
    "target": "self"
   },
   "exited_block_event": {
    "event": "minecraft:exited_bubble_column",
    "target": "self"
   }
  },
  {
   "block": {
    "name": "minecraft:bubble_column",
    "states": {
     "drag_down": false
    }
   },
   "entered_block_event": {
    "event": "minecraft:entered_bubble_column_up",
    "target": "self"
   },
   "exited_block_event": {
    "event": "minecraft:exited_bubble_column",
    "target": "self"
   }
  }
 ]
}
```

### minecraft:insomnia

Adds a timer since last rested to see if phantoms should spawn.

| Field | Type | Default | Notes |
|---|---|---|---|
| `days_until_insomnia` | float | `3` | Number of days the mob has to stay up until the insomnia effect begins. |

Example (/minecraft:entity/components/minecraft:insomnia/):
```json
{
 "days_until_insomnia": 3
}
```

### minecraft:instant_despawn

Despawns the Actor immediately.

| Field | Type | Default | Notes |
|---|---|---|---|
| `remove_child_entities` | boolean | `false` | If true, all entities linked to this entity in a child relationship (eg. leashed) will also be despawned. |

### minecraft:interact

Defines interactions with this entity.

> In 1.26.0, the `swing` field on each interaction entry defaults to `true` (it previously defaulted to `false`). Set it explicitly to `false` to opt out of the player's swing animation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `interactions` | objectArray | `[]` | The list of interactions for this entity. See `entity/interactiondata`. |
| `add_items` |  |  | removed |
| `particle_on_start` |  |  | removed |
| `play_sounds` |  |  | removed |
| `spawn_entities` |  |  | removed |
| `spawn_items` |  |  | removed |
| `repair_entity_item` |  |  | removed |
| `swing` |  |  | removed |
| `transform_to_item` |  |  | removed |
| `use_item` |  |  | removed |
| `vibration` |  |  | removed |
| `on_interact` |  |  | removed |

### minecraft:inventory

Defines this entity's inventory properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `additional_slots_per_strength` | int | `0` | Number of slots that this entity can gain per extra strength |
| `can_be_siphoned_from` | boolean | `false` | If true, the contents of this inventory can be removed by a hopper |
| `container_type` | string | `"none"` | Type of container this entity has. Can be horse, minecart_chest, chest_boat, minecart_hopper, inventory, container or hopper |
| `inventory_size` | int | `5` | Number of slots the container has |
| `private` | boolean | `false` | If true, the entity will not drop its inventory on death |
| `restrict_to_owner` | boolean | `false` | If true, the entity's inventory can only be accessed by its owner or itself |

### minecraft:is_baby

Sets that this entity is a baby. This is used to set the is_baby value for use in query functions like Molang and Filters.

Example (/minecraft:entity/component_groups/minecraft:chicken_baby/minecraft:is_baby/):
```json
{}
```

### minecraft:is_charged

Sets that this entity is charged. This is used to set the is_charged value for use in query functions like Molang and Filters.

### minecraft:is_chested

Sets that this entity is currently carrying a chest.

Example (/minecraft:entity/component_groups/minecraft:llama_chested/minecraft:is_chested/):
```json
{}
```

### minecraft:is_collidable

Allows other mobs to have vertical and horizontal collisions with this mob. For a collision to occur, both mobs must have a "minecraft:collision_box" component. This component can only be used on mobs and enables collisions exclusively between mobs. Please note that this type of collision is unreliable for moving collidable mobs. It is recommended to use this component only in scenarios where the collidable mob remains stationary. Collidable behavior is closely related to stackable behavior. While the "minecraft:is_collidable" component governs how other mobs interact with the component's owner, the "minecraft:is_stackable" component describes how an entity interacts with others of its own kind.

Example (/minecraft:entity/components/minecraft:is_collidable/):
```json
{}
```

### minecraft:is_dyeable

Allows dyes to be used on this entity to change its color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `interact_text` | string |  | The text that will display when interacting with this entity with a dye when playing with Touch-screen controls. |

Example (/minecraft:entity/component_groups/minecraft:sheep_dyeable/minecraft:is_dyeable/):
```json
{
 "interact_text": "action.interact.dye"
}
```

### minecraft:is_hidden_when_invisible

The entity can hide from hostile mobs while invisible.

Example (/minecraft:entity/components/minecraft:is_hidden_when_invisible/):
```json
{}
```

### minecraft:is_ignited

Sets that this entity is currently on fire.

Example (/minecraft:entity/component_groups/minecraft:instant_explode_tnt/minecraft:is_ignited/):
```json
{}
```

### minecraft:is_illager_captain

Sets that this entity is an Illager Captain.

### minecraft:is_pregnant

Sets that this entity is currently pregnant.

Example (/minecraft:entity/component_groups/sniffer_pregnant/minecraft:is_pregnant/):
```json
{}
```

### minecraft:is_saddled

Sets that this entity is currently saddled.

Example (/minecraft:entity/component_groups/minecraft:pig_saddled/minecraft:is_saddled/):
```json
{}
```

### minecraft:is_shaking

Sets that this entity is currently shaking.

Example (/minecraft:entity/component_groups/in_powder_snow/minecraft:is_shaking/):
```json
{}
```

### minecraft:is_sheared

Sets that this entity is currently sheared.

Example (/minecraft:entity/component_groups/minecraft:bogged_sheared/minecraft:is_sheared/):
```json
{}
```

### minecraft:is_stackable

Allows instances of this entity to have vertical and horizontal collisions with each other. For a collision to occur, both instances must have a "minecraft:collision_box" component. Stackable behavior is closely related to collidable behavior. While the "minecraft:is_stackable" component describes how an entity interacts with others of its own kind, the "minecraft:is_collidable" component governs how other mobs interact with the component's owner.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | boolean | `true` | Whether this entity is stackable. |

Example (/minecraft:entity/components/minecraft:is_stackable/):
```json
{}
```

### minecraft:is_stunned

Sets that this entity is currently stunned.

### minecraft:is_tamed

Sets that this entity is currently tamed.

Example (/minecraft:entity/component_groups/minecraft:llama_tamed/minecraft:is_tamed/):
```json
{}
```

### minecraft:item_controllable

Defines what items can be used to control this entity while ridden.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_items` | stringArray |  | List of items that can be used to control this entity while ridden. Can be a single string or an array of strings. |

Example (/minecraft:entity/component_groups/minecraft:pig_saddled/minecraft:item_controllable/):
```json
{
 "control_items": "carrotOnAStick"
}
```

### minecraft:item_hopper

Determines that this entity is an item hopper.

Example (/minecraft:entity/component_groups/minecraft:hopper_active/minecraft:item_hopper/):
```json
{}
```

### minecraft:jump.dynamic

Defines a dynamic type jump control that will change jump properties based on the speed modifier of the mob.Requires `minecraft:movement.skip` to be used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `fast_skip_data` | object | `{"animation_duration":1,"distance_scale":1,"height":0.10000…` | since 1.26.0. Jump data used while traveling quickly with skip movement. Object with the same shape as `regular_skip_data`. See `entity/jumpdatadefinition`. |
| `regular_skip_data` | object | `{"animation_duration":1,"distance_scale":1,"height":0.10000…` | since 1.26.0. Jump data used during normal skip movement. Object with optional `distance_scale` (horizontal velocity multiplier), `height` (vertical force), `jump_delay` (ticks between jumps), and `animation_duration` (jump animation length). See `entity/jumpdatadefinition`. |

### minecraft:jump.static

Gives the entity the ability to jump.

| Field | Type | Default | Notes |
|---|---|---|---|
| `jump_power` | float | `0.41999998688697815` | The initial vertical velocity for the jump. |

Example (/minecraft:entity/components/minecraft:jump.static/):
```json
{}
```

### minecraft:knockback_resistance

Determines an entity's resistance to knockback from melee attacks. A value of 0.0 means no resistance, while 1.0 provides full immunity to knockback (like iron golems).

> In format version 1.26.20, `value` now accepts negative numbers down to a minimum of `-2`. Negative values amplify knockback applied to the entity instead of diminishing it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float |  | The amount of knockback resistance, from 0.0 (none) to 1.0 (full immunity). |
| `max` | float |  | Maximum potential knockback resistance for this entity. |

### minecraft:lava_movement

Allows a custom movement speed across lava blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float |  | The speed the mob moves over a lava block. |

### minecraft:leashable

Describes how this mob can be leashed to other items

> In 1.21.90, the `can_be_cut` root field and the `spring_type` and `rotation_adjustment` fields within `presets` were added.

> From 1.21.80 onward, supports multiple presets via the `presets` array. Each preset has its own `filter`, `hard_distance`, `soft_distance`, and `max_distance` — replacing the flat root fields previously used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_be_cut` | boolean | `true` | since 1.21.90. If true, players can cut both incoming and outgoing leashes by using shears on the entity. |
| `can_be_stolen` | boolean | `false` | If true, players can leash this entity even if it is already leashed to another entity. |
| `on_leash` | object |  | Event to call when this entity is leashed. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `on_unleash` | object |  | Event to call when this entity is unleashed. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `on_unleash_interact_only` | boolean | `false` | When set to true, "on_unleash" does not trigger when the entity gets unleashed for reasons other than the player directly interacting with it. |
| `presets` | objectArray |  | Defines how this entity behaves when leashed to another entity. The first preset which "filter" conditions are met will be applied; if none match, a default configuration is used instead. |
| `unleash_on_removal` | boolean | `true` | since 1.26.30. If true, the entity is unleashed when this component is removed. Defaults to true. |
| `hard_distance` | int | `6` | Distance in blocks at which the leash stiffens, restricting movement. Range: 0... |
| `soft_distance` | int | `4` | Distance in blocks at which the 'spring' effect starts acting to keep this entity close to the entity that leashed it. Range: 0... |
| `max_distance` | int | `0` | Distance in blocks it which the leash breaks. Range: 0... |

Example (/minecraft:entity/components/minecraft:leashable/):
```json
{}
```

### minecraft:leashable_to

_since 1.21.90_

Allows players to leash entities to this entity, retrieve entities already leashed to it, or free them using shears. For the last interaction to work, the leashed entities must have "can_be_cut" set to true in their "minecraft:leashable" component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_retrieve_from` | boolean | `false` | Allows players to retrieve entities that are leashed to this entity. |
| `unleash_on_removal` | boolean | `true` | since 1.26.30. If true, all entities leashed to this entity are automatically unleashed when this component is removed. Defaults to true. |

Example (/minecraft:entity/components/minecraft:leashable_to/):
```json
{}
```

### minecraft:looked_at

Defines the behavior when another entity looks at the owner entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `field_of_view` | float | `26` | Defines, in degrees, the width of the field of view for entities looking at the owner entity. If "scale_fov_by_distance" is set to true, this value corresponds to the field of view at a distance of one block between the entities. |
| `filters` | minecraftFilter |  | Defines which entities are considered when searching for entities looking at the owner entity. |
| `find_players_only` | boolean | `false` | Limits the search to only the nearest Player that meets the specified "filters" rather than all nearby entities. |
| `line_of_sight_obstruction_type` | string | `"collision"` | Defines the type of block shape used to check for line of sight obstructions. Valid values: "outline", "collision", "collision_for_camera". |
| `look_at_locations` | stringArray |  | A list of locations on the owner entity towards which line of sight checks are performed. At least one location must be unobstructed for the entity to be considered as looked at. |
| `looked_at_cooldown` | intRange |  | Specifies the range for the random number of seconds that must pass before the owner entity can check again for entities looking at it, after detecting an entity looking at it. |
| `looked_at_event` | minecraftEventTrigger |  | Defines the event to trigger when an entity is detected looking at the owner entity. |
| `min_looked_at_duration` | float | `0` | Defines the minimum, continuous time the owner entity has to be looked at before being considered as such. Defaults to 0 if not explicitly specified. |
| `not_looked_at_event` | minecraftEventTrigger |  | Defines the event to trigger when no entity is found looking at the owner entity. |
| `scale_fov_by_distance` | boolean | `true` | When true, the field of view narrows as the distance between the owner entity and the entity looking at it increases. This ensures that the width of the view cone remains somewhat constant towards the owner entity position, regardless of distance. |
| `search_radius` | float | `10` | Maximum distance the owner entity will search for entities looking at it. |
| `set_target` | string | `false` | Defines if and how the owner entity will set entities that are looking at it as its combat targets. Valid values: 'never', 'once_and_stop_scanning', 'once_and_keep_scanning'. Values: `never`, `once_and_stop_scanning`, `once_and_keep_scanning`. |

### minecraft:loot

Specifies the loot table that determines what items this entity drops upon death. The table path is relative to the behavior pack's root folder.

> Requires a loot table to be used when dropping items upon death.

| Field | Type | Default | Notes |
|---|---|---|---|
| `table` | string |  | Path to the loot table JSON file, relative to the behavior pack's root (e.g., 'loot_tables/entities/zombie.json'). |

### minecraft:managed_wandering_trader

Manages the entity's ability to trade.

### minecraft:mark_variant

Mark Variant is typically used as an additional per-type way (besides `variant`) to express a different visual form of the same mob.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `0` | The Id of the mark_variant. By convention, 0 is the Id of the base entity. |

Example (/minecraft:entity/components/minecraft:mark_variant/):
```json
{
 "value": 0
}
```

### minecraft:memory_behavior.move_to_position

Allows the mob to move to a target position. Using memories, the mob will try to stick to the original target position it chose until that position is removed. Requires a FindBlockSensor.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |

### minecraft:mob_effect

A component that applies a mob effect to entities that get within range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ambient` | boolean | `false` | since 1.21.130. If true, the effect renders with the ambient effect background (like Beacons or Conduits) and does not pulse as it nears expiration. |
| `cooldown_time` | int | `0` | Time in seconds to wait between each application of the effect. |
| `effect_range` | float | `0.2` | How close a hostile entity must be to have the mob effect applied. |
| `effect_time` | int | `10` | How long the applied mob effect lasts in seconds. Can also be set to "infinite" |
| `entity_filter` | minecraftFilter |  | The set of entities that are valid to apply the mob effect to. |
| `mob_effect` | string |  | The mob effect that is applied to entities that enter this entities effect range. |

### minecraft:mob_effect_immunity

Entities with this component will have an immunity to the provided mob effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `mob_effects` | stringArray |  | List of names of effects the entity is immune to. |

Example (/minecraft:entity/components/minecraft:mob_effect_immunity/):
```json
{
 "mob_effects": [
  "weakness"
 ]
}
```

### minecraft:movement

Defines the base movement speed of an entity. Typical values: creeper (0.2), cow (0.25), zombie baby (0.35).

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float |  | The base movement speed value. Higher values result in faster movement. Can be a single number or a range object with range_min and range_max properties. |
| `max` | float |  | Maximum movement speed this entity can have. |

### minecraft:movement_sound_distance_offset

Sets the offset used to determine the next step distance for playing a movement sound.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `1` | The higher the number, the less often the movement sound will be played. |

### minecraft:movement.amphibious

This move control allows the mob to swim in water and walk on land.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

Example (/minecraft:entity/components/minecraft:movement.amphibious/):
```json
{}
```

### minecraft:movement.basic

This component accents the movement of an entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

Example (/minecraft:entity/components/minecraft:movement.basic/):
```json
{}
```

### minecraft:movement.fly

This move control causes the mob to fly.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |
| `start_speed` | float | `0.1` | Initial speed of the mob when it starts gliding. |
| `speed_when_turning` | float | `0.2` | Speed that the mob adjusts to when it has to turn quickly. |

Example (/minecraft:entity/components/minecraft:movement.fly/):
```json
{}
```

### minecraft:movement.generic

This move control allows a mob to fly, swim, climb, etc.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

Example (/minecraft:entity/components/minecraft:movement.generic/):
```json
{}
```

### minecraft:movement.hover

This move control causes the mob to hover.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

Example (/minecraft:entity/components/minecraft:movement.hover/):
```json
{}
```

### minecraft:movement.jump

Move control that causes the mob to jump as it moves with a specified delay between jumps.

> In order to follow targets, this entity must have the `minecraft:behavior.slime_attack` component, otherwise the entity will jump in the direction it's looking in.

| Field | Type | Default | Notes |
|---|---|---|---|
| `jump_delay` | floatRange |  | Delay in seconds after landing when using the slime move control. Can be a single number, an array [min, max], or an object with range_min and range_max. |
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

### minecraft:movement.skip

This move control causes the mob to hop as it moves.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |

### minecraft:movement.sway

This move control causes the mob to sway side to side giving the impression it is swimming.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |
| `sway_amplitude` | float | `0.05` | Strength of the sway movement. |
| `sway_frequency` | float | `0.5` | Multiplier for the frequency of the sway movement. |

Example (/minecraft:entity/components/minecraft:movement.sway/):
```json
{}
```

### minecraft:nameable

Allows this entity to be named (e.g. using a name tag).

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_name_tag_renaming` | boolean | `true` | If true, this entity can be renamed with name tags |
| `always_show` | boolean | `false` | If true, the name will always be shown |
| `default_trigger` | string |  | Trigger to run when the entity gets named |
| `name_actions` | objectArray |  | Describes the special names for this entity and the events to call when the entity acquires those names |

Example (/minecraft:entity/components/minecraft:nameable/):
```json
{}
```

### minecraft:navigation.climb

Allows this entity to generate paths that include vertical walls like the vanilla Spiders do.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |

Example (/minecraft:entity/components/minecraft:navigation.climb/):
```json
{
 "can_path_over_water": true
}
```

### minecraft:navigation.float

Allows this entity to generate paths by flying around the air like the regular Ghast.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |
| `using_door_annotation` | string |  | Using Door Annotation |

Example (/minecraft:entity/components/minecraft:navigation.float/):
```json
{
 "can_path_over_water": true,
 "using_door_annotation": true
}
```

### minecraft:navigation.fly

Allows this entity to generate paths in the air like the vanilla Parrots do.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |

Example (/minecraft:entity/components/minecraft:navigation.fly/):
```json
{
 "can_path_from_air": true,
 "can_path_over_water": true
}
```

### minecraft:navigation.generic

Allows this entity to generate paths by walking, swimming, flying and/or climbing around and jumping up and down a block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |
| `using_door_annotation` | string |  | Using Door Annotation |

Example (/minecraft:entity/components/minecraft:navigation.generic/):
```json
{
 "can_breach": true,
 "can_walk": false,
 "can_path_over_water": false,
 "can_swim": true,
 "is_amphibious": true,
 "using_door_annotation": true
}
```

### minecraft:navigation.hover

Allows this entity to generate paths in the air like the vanilla Bees do. Keeps them from falling out of the skies and doing predictive movement.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |

Example (/minecraft:entity/components/minecraft:navigation.hover/):
```json
{
 "avoid_damage_blocks": true,
 "can_pass_doors": false,
 "can_path_from_air": true,
 "avoid_sun": false,
 "avoid_water": true,
 "can_path_over_water": true,
 "can_sink": false
}
```

### minecraft:navigation.swim

Allows this entity to generate paths that include water.

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | Tells the pathfinder which blocks to avoid when creating a path |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |

### minecraft:navigation.walk

Walking style of the mob

| Field | Type | Default | Notes |
|---|---|---|---|
| `avoid_damage_blocks` | boolean | `false` | Tells the pathfinder to avoid blocks that cause damage when finding a path |
| `avoid_portals` | boolean | `false` | Tells the pathfinder to avoid portals (like nether portals) when finding a path |
| `avoid_sun` | boolean | `false` | Whether or not the pathfinder should avoid tiles that are exposed to the sun when creating paths |
| `avoid_water` | boolean | `false` | Tells the pathfinder to avoid water when creating a path |
| `blocks_to_avoid` | stringArray |  | List of block descriptors that the pathfinder should avoid. Items can be block identifier strings or objects with name/tags properties. |
| `can_breach` | boolean | `false` | Tells the pathfinder whether or not it can jump out of water (like a dolphin) |
| `can_break_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door and break it |
| `can_jump` | boolean | `true` | Tells the pathfinder whether or not it can jump up blocks |
| `can_open_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed door assuming the AI will open the door |
| `can_open_iron_doors` | boolean | `false` | Tells the pathfinder that it can path through a closed iron door assuming the AI will open the door |
| `can_pass_doors` | boolean | `true` | Whether a path can be created through a door |
| `can_path_from_air` | boolean | `false` | Tells the pathfinder that it can start pathing when in the air |
| `can_path_over_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the lava |
| `can_path_over_water` | boolean | `false` | Tells the pathfinder whether or not it can travel on the surface of the water |
| `can_sink` | boolean | `true` | Tells the pathfinder whether or not it will be pulled down by gravity while in water |
| `can_swim` | boolean | `false` | Tells the pathfinder whether or not it can path anywhere through water and plays swimming animation along that path |
| `can_walk` | boolean | `true` | Tells the pathfinder whether or not it can walk on the ground outside water |
| `can_walk_in_lava` | boolean | `false` | Tells the pathfinder whether or not it can travel in lava like walking on ground |
| `is_amphibious` | boolean | `false` | Tells the pathfinder whether or not it can walk on the ground underwater |
| `using_door_annotation` | string |  | Using Door Annotation |
| `can_float` | boolean |  | Tells the pathfinder that it can path through through the air. |

Example (/minecraft:entity/components/minecraft:navigation.walk/):
```json
{
 "avoid_damage_blocks": true,
 "avoid_water": true,
 "can_path_over_water": true,
 "using_door_annotation": true
}
```

### minecraft:offspring

Defines the way an entity can create a born offspring.

| Field | Type | Default | Notes |
|---|---|---|---|
| `blend_attributes` | boolean | `true` | If true, the entities will blend their attributes in the offspring after they breed. |
| `deny_parents_variant` | objectArray |  | Determines how likely the baby of parents with the same variant will deny that variant and take a random variant within the given range instead. |
| `inherit_tamed` | boolean | `true` | If true, the babies will be automatically tamed if its parents are |
| `mutation_factor` | objectArray |  | Determines how likely the babies are to NOT inherit one of their parent's variances. Values are between 0.0 and 1.0, with a higher number meaning more likely to mutate. |
| `offspring_pairs` | stringArray |  | The map of entity to offspring definitions that this entity can make offspring with. |
| `parent_centric_attribute_blending` | stringArray |  | List of attributes that should benefit from parent centric attribute blending. For example, horses blend their health, movement, and jump_strength in their offspring. |
| `property_inheritance` | stringArray |  | List of Entity Properties that should be inherited from the parent entities and potentially mutated. |
| `random_extra_variant_mutation_interval` | intRange | `0` | Range used to determine random extra variant. |
| `random_variant_mutation_interval` | intRange | `0` | Range used to determine random variant. |

Example (/minecraft:entity/components/minecraft:offspring/):
```json
{
 "offspring_pairs": {
  "minecraft:chicken": "minecraft:chicken"
 },
 "property_inheritance": {
  "minecraft:climate_variant": {}
 }
}
```

### minecraft:on_death

Adds a trigger to call on this entity's death.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

### minecraft:on_equipment_changed

_since 1.26.20_

Allows to specify events to execute when equipment is set in the entity's default equipment slots. Doesn't apply to "minecraft:inventory", use "minecraft:equippable" instead.

> Added in 1.26.20. Defines a list of `slots`, each pairing an equipment `slot` with an `on_equip` event (fired when a non-empty item is placed) and `on_unequip` event (fired when the slot is cleared). When equipment changes, only the first matching slot entry is used. Does not apply to `minecraft:inventory` slots — use `minecraft:equippable` for those.

| Field | Type | Default | Notes |
|---|---|---|---|
| `slots` | objectArray | `[]` | A list of slot-specific events to execute when the entity's equipment changes in those slots. See `entity/onequipmentchangedslotentrydescriptor`. |

### minecraft:on_friendly_anger

Adds a trigger that will run when a nearby entity of the same type as this entity becomes Angry.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/component_groups/minecraft:adult_wild/minecraft:on_friendly_anger/):
```json
{
 "event": "minecraft:on_anger",
 "target": "self"
}
```

### minecraft:on_hurt

Adds a trigger to call when this entity takes damage.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/components/minecraft:on_hurt/):
```json
{
 "event": "minecraft:on_hurt_event",
 "target": "self"
}
```

### minecraft:on_hurt_by_player

Adds a trigger to call when this entity is attacked by the player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/components/minecraft:on_hurt_by_player/):
```json
{
 "event": "minecraft:on_hurt_event",
 "target": "self"
}
```

### minecraft:on_ignite

Adds a trigger to call when this entity is set on fire.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

### minecraft:on_start_landing

Only usable by the Ender Dragon. Adds a trigger to call when this entity lands.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/components/minecraft:on_start_landing/):
```json
{
 "event": "minecraft:start_land",
 "target": "self"
}
```

### minecraft:on_start_takeoff

Only usable by the Ender Dragon. Adds a trigger to call when this entity starts flying.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/components/minecraft:on_start_takeoff/):
```json
{
 "event": "minecraft:start_fly",
 "target": "self"
}
```

### minecraft:on_target_acquired

Adds a trigger to call when this entity finds a target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/component_groups/minecraft:spider_neutral/minecraft:on_target_acquired/):
```json
{
 "event": "minecraft:become_angry"
}
```

### minecraft:on_target_escape

Adds a trigger to call when this entity loses the target it currently has.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | The event to run when the conditions for this trigger are met. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

Example (/minecraft:entity/components/minecraft:on_target_escape/):
```json
{
 "target": "self"
}
```

### minecraft:on_wake_with_owner

A trigger when a mob's tamed onwer wakes up.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | The event to run when the conditions for this trigger are met. |
| `filters` | minecraftFilter |  | The list of conditions for this trigger to execute. |
| `target` | string | `"self"` | The target of the event. |

### minecraft:out_of_control

Defines the entity's 'out of control' state.

Example (/minecraft:entity/component_groups/minecraft:above_bubble_column_down/minecraft:out_of_control/):
```json
{}
```

### minecraft:peek

Defines the entity's 'peek' behavior, defining the events that should be called during it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_close` | minecraftEventTrigger |  | Event to call when the entity is done peeking. |
| `on_open` | minecraftEventTrigger |  | Event to call when the entity starts peeking. |
| `on_target_open` | minecraftEventTrigger |  | Event to call when the entity's target entity starts peeking. |

Example (/minecraft:entity/components/minecraft:peek/):
```json
{
 "on_close": {
  "event": "minecraft:on_close"
 },
 "on_open": {
  "event": "minecraft:on_open"
 },
 "on_target_open": {
  "event": "minecraft:on_open"
 }
}
```

### minecraft:persistent

Defines whether an entity should be persistent in the game world.

Example (/minecraft:entity/components/minecraft:persistent/):
```json
{}
```

### minecraft:physics

Defines physics properties of an actor, including if it is affected by gravity or if it collides with objects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `has_collision` | boolean | `true` | Whether or not the entity collides with things. |
| `has_gravity` | boolean | `true` | Whether or not the entity is affected by gravity. |
| `push_towards_closest_space` | boolean | `false` | Whether or not the entity should be pushed towards the nearest open area when stuck inside a block. |

Example (/minecraft:entity/components/minecraft:physics/):
```json
{
 "has_gravity": false
}
```

### minecraft:player.exhaustion

Defines the player's exhaustion level.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int |  | The initial value of a player's exhaustion level. |
| `max` | int |  | A maximum value for a player's exhaustion. |

### minecraft:player.experience

Defines how much experience each player action should take.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `1` | The initial value of the player experience. |
| `max` | int | `5` | The maximum player experience of this entity. |

### minecraft:player.level

Defines the player's level.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int |  | The initial value of the player level. |
| `max` | int |  | The maximum player level value of the entity. |

### minecraft:player.saturation

Defines the player's need for food.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int |  | The initial value of player saturation. |
| `max` | int |  | The maximum player saturation value. |

### minecraft:preferred_path

Specifies costing information for mobs that prefer to walk on preferred paths.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default_block_cost` | float | `0` | Cost for non - preferred blocks |
| `jump_cost` | float | `0` | Added cost for jumping up a node |
| `max_fall_blocks` | int | `3` | Distance mob can fall without taking damage |
| `preferred_path_blocks` | objectArray | `[]` | A list of block types with their associated pathfinding costs. Each entry specifies blocks and their cost value. See `entity/preferredpath_blockset`. |

### minecraft:projectile

Turns the entity into a projectile: a thrown or shot entity that flies along a ballistic arc and reacts when it impacts a block, a fluid, or another entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `anchor` | stringEnum | `"origin"` | Reference point on the shooter used to position the projectile at spawn: `0` = origin (feet), `1` = eye height, `2` = middle of the bounding box. Values: `eye_height`, `middle`, `origin`. |
| `angle_offset` | float | `0` | Additional upwards pitch (in degrees) applied to the shooter's aim direction at launch. Negative values aim downward. |
| `catch_fire` | boolean | `false` | Determines whether the entity hit will be set on fire. Note: the presence of this field in the component definition causes targets to catch fire regardless of the value set. To prevent fire, remove this field entirely from the component. |
| `crit_particle_on_hurt` | boolean | `false` | If `true`, critical-hit particles are spawned on the projectile when it is struck. |
| `destroy_on_hurt` | boolean | `false` | If `true`, the projectile is removed from the world when struck. |
| `gravity` | float | `0.05000000074505806` | Downward acceleration (blocks per tick squared) applied each tick while in flight. Higher values make the projectile fall faster. |
| `hit_ground_sound` | string | `""` | Identifier of the sound to play when the projectile hits a block. Defaults to `hit_sound` when empty. |
| `hit_nearest_passenger` | boolean | `false` | If `true`, when the projectile hits a vehicle with at least one passenger, the on-hit behavior is applied to the passenger closest to the impact point instead of the vehicle itself. |
| `hit_sound` | string | `""` | Identifier of the sound to play when the projectile hits an entity. Also used for block hits when `hit_ground_sound` is not specified. |
| `hit_water` | boolean | `false` | If `true`, the projectile treats water as a hit surface and stops on contact. |
| `homing` | boolean | `false` | If `true`, the projectile steers towards an active target while in flight. |
| `ignored_entities` | stringArray | `[]` | Array of entity identifiers that the projectile will pass through without registering a hit. |
| `inertia` | float | `0.9900000095367432` | Fraction of the projectile's velocity preserved each tick while traveling through air. Values below `1.0` cause it to slow down over time. |
| `is_dangerous` | boolean | `false` | If `true`, the projectile is flagged as dangerous, affecting AI reactions and certain client-side behaviors. |
| `isolated_physics` | boolean | `true` | since 1.26.20. If true, this projectile is not affected by outside forces such as friction and drag. |
| `lightning` | boolean | `false` | If `true`, the projectile can channel a lightning bolt when it hits an entity during a thunderstorm. |
| `liquid_inertia` | float | `0.6000000238418579` | Fraction of the projectile's velocity preserved each tick while traveling through a fluid. |
| `multiple_targets` | boolean | `false` | If `true`, the projectile can hit more than one entity over the course of its flight; if `false`, it stops at the first entity it hits. Projectiles launched with the Piercing enchantment have this value set to `true`. |
| `offset` | numberArray | `[0,0,0]` | Offset, relative to the `anchor`, at which the projectile is spawned when fired by the shooter. |
| `on_fire_time` | float | `5` | Duration in seconds for which an entity set on fire by this projectile remains burning. Applied both by the legacy top-level `catch_fire` flag and by the `catch_fire` on-hit subcomponent. |
| `on_hit` | object |  | Map of on-hit subcomponents that drive what happens when the projectile impacts a block, fluid, or entity. Each key is a subcomponent name and its value is that subcomponent's configuration. See `entity/onhitcommandsstorage`. |
| `particle` | stringEnum | `"iconcrack"` | Particle effect emitted at the impact location when the projectile hits something. Values: `balloongas`, `bleach`, `blockforcefield`, `blueflame`, `breezewindexplosion`, `bubble`, `bubblecolumndown`, `bubblecolumnup`, `bubblemanual`, `campfiresmoke`, `campfiresmoketall`, `candleflame`, `carrotboost`, `coloredflame`, `conduit`, `creakingcrumble`, `crit`, `dragonbreath`, `dragonbreathfire`, `dragonbreathtrail`, `dragondestroyblock`, `driphoney`, `driplava`, `dripwater`, …. |
| `potion_effect` | int | `-1` | Default potion aux value associated with the projectile. Normally set programmatically by potion items; rarely useful at authoring time. A value matching the water potion is required for the `douse_fire` on-hit subcomponent to extinguish fires. |
| `power` | float | `1.2999999523162842` | Initial speed (in blocks per tick) at which the projectile is launched. |
| `reflect_immunity` | float | `0` | Duration in seconds after launch during which the projectile cannot be reflected by being struck. |
| `reflect_on_hurt` | boolean | `false` | If true, this projectile will be reflected back when hit by another projectile or by taking damage. |
| `shoot_sound` | string | `""` | Identifier of the sound to play when the projectile is fired. |
| `shoot_target` | boolean | `true` | If `true`, the projectile is aimed at the shooter's current target (when one exists) rather than straight ahead. |
| `should_bounce` | stringEnum | `"no"` | Controls whether the projectile bounces off entities on impact. `no` disables bouncing, `if_invulnerable` bounces only off invulnerable entities, and `if_no_damage_dealt` bounces whenever no damage is dealt to the target. Values: `if_invulnerable`, `if_no_damage_dealt`, `no`. |
| `splash_range` | float | `4` | Splash radius (in blocks) used when applying potion effects via the splash/lingering potion code path. |
| `stop_on_hurt` | boolean | `false` | If `true`, the projectile has its velocity zeroed out when struck. |
| `uncertainty_base` | float | `0` | Base inaccuracy added to the launch direction. The total inaccuracy is `uncertainty_base - difficultyLevel * uncertainty_multiplier`. |
| `uncertainty_multiplier` | float | `0` | Per-difficulty-level reduction in inaccuracy. See `uncertainty_base` for the full formula. |

### minecraft:push_through

Sets the distance through which the entity can push through.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `0` | The value of the entity's push-through, in blocks. |

### minecraft:pushable

Defines what can push an entity between other entities and pistons.

> In 1.26.10 this component was split into `minecraft:pushable_by_block` (pistons and Shulker Boxes, equivalent to `is_pushable_by_piston: true`) and `minecraft:pushable_by_entity` (other entities, equivalent to `is_pushable: true`). The original `minecraft:pushable` component is no longer parsed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `is_pushable` | boolean | `true` | Whether the entity can be pushed by other entities. |
| `is_pushable_by_piston` | boolean | `true` | Whether the entity can be pushed by pistons safely. |

Example (/minecraft:entity/components/minecraft:pushable/):
```json
{
 "is_pushable": true,
 "is_pushable_by_piston": true
}
```

### minecraft:pushable_by_block

_since 1.26.10_

Allows the entity to be pushed by certain blocks, like Shulker Boxes and Pistons.

> Added in 1.26.10 as part of the split of `minecraft:pushable` into `minecraft:pushable_by_block` (pistons and Shulker Boxes) and `minecraft:pushable_by_entity` (other entities). The legacy `minecraft:pushable` component is no longer parsed.

Example (/minecraft:entity/components/minecraft:pushable_by_block/):
```json
{}
```

### minecraft:pushable_by_entity

_since 1.26.10_

Allows an entity to be pushed by other entities.

> Added in 1.26.10 as part of the split of `minecraft:pushable` into `minecraft:pushable_by_block` (pistons and Shulker Boxes) and `minecraft:pushable_by_entity` (other entities). The legacy `minecraft:pushable` component is no longer parsed.

> Released out of beta in format version 1.26.30. The `presets` field replaces the previous flat property layout; the preset field `max_distance` was renamed from `kick_distance_threshold`.

| Field | Type | Default | Notes |
|---|---|---|---|
| `presets` | objectArray | `[]` | Defines how this entity behaves when pushed by another entity. The first preset whose "filter" conditions are met will be applied; if none match, a default configuration is used instead. See `entity/pushablebyentitypreset`. |

Example (/minecraft:entity/components/minecraft:pushable_by_entity/):
```json
{}
```

### minecraft:raid_trigger

Attempts to trigger a raid at the entity's location.

| Field | Type | Default | Notes |
|---|---|---|---|
| `triggered_event` | minecraftEventTrigger |  | Event to run when a raid is triggered on the village. |
| `minecraft:raid_trigger` | object |  | Raid Trigger |

Example (/minecraft:entity/component_groups/minecraft:raid_trigger/):
```json
{
 "minecraft:raid_trigger": {
  "triggered_event": {
   "event": "minecraft:remove_raid_trigger",
   "target": "self"
  }
 }
}
```

### minecraft:rail_movement

Defines the entity's movement on the rails. An entity with this component is only allowed to move on the rail.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_speed` | float | `0.4` | Maximum speed that this entity will move at when on the rail. |

Example (/minecraft:entity/components/minecraft:rail_movement/):
```json
{}
```

### minecraft:rail_sensor

Enables minecart-type entities to detect powered rails and respond to activation state changes. Triggers events when the entity passes over activated or deactivated rails, enabling custom minecart behaviors like launching at boosted speed, stopping at braking rails, or triggering special effects at detector rails.

| Field | Type | Default | Notes |
|---|---|---|---|
| `check_block_types` | boolean | `false` | If true, on tick this entity will trigger its on_deactivate behavior |
| `eject_on_activate` | boolean | `true` | If true, this entity will eject all of its riders when it passes over an activated rail |
| `eject_on_deactivate` | boolean | `false` | If true, this entity will eject all of its riders when it passes over a deactivated rail |
| `on_activate` | minecraftEventTrigger |  | Event to call when the rail is activated |
| `on_deactivate` | minecraftEventTrigger |  | Event to call when the rail is deactivated |
| `tick_command_block_on_activate` | boolean | `true` | If true, command blocks will start ticking when passing over an activated rail |
| `tick_command_block_on_deactivate` | boolean | `false` | If false, command blocks will stop ticking when passing over a deactivated rail |

Example (/minecraft:entity/component_groups/minecraft:command_block_active/minecraft:rail_sensor/):
```json
{
 "check_block_types": true,
 "on_deactivate": {
  "event": "minecraft:command_block_deactivate"
 },
 "eject_on_activate": false,
 "eject_on_deactivate": false,
 "tick_command_block_on_activate": true,
 "tick_command_block_on_deactivate": false
}
```

### minecraft:ravager_blocked

Defines the ravager's response to their melee attack being blocked.

| Field | Type | Default | Notes |
|---|---|---|---|
| `knockback_strength` | float | `3` | The strength with which blocking entities should be knocked back |
| `reaction_choices` | stringArray | `"[ ]"` | A list of weighted responses to the melee attack being blocked |

### minecraft:reflect_projectiles

[EXPERIMENTAL] Allows an entity to reflect projectiles.

| Field | Type | Default | Notes |
|---|---|---|---|
| `azimuth_angle` | string | `"0"` | [EXPERIMENTAL] A Molang expression defining the angle in degrees to add to the projectile's y axis rotation. |
| `elevation_angle` | string | `"0"` | [EXPERIMENTAL] A Molang expression defining the angle in degrees to add to the projectile's x axis rotation. |
| `reflected_projectiles` | stringArray |  | [EXPERIMENTAL] An array of strings defining the types of projectiles that are reflected when they hit the entity. |
| `reflection_scale` | string | `"1"` | [EXPERIMENTAL] A Molang expression defining the velocity scaling of the reflected projectile. Values below 1 decrease the projectile's velocity, and values above 1 increase it. |
| `reflection_sound` | string | `"reflect"` | [EXPERIMENTAL] A string defining the name of the sound event to be played when a projectile is reflected. "reflect" unless specified. |

Example (/minecraft:entity/components/minecraft:reflect_projectiles/):
```json
{
 "azimuth_angle": "180.0 + Math.random(-20.0, 20.0)",
 "reflected_projectiles": [
  "xp_bottle",
  "thrown_trident",
  "shulker_bullet",
  "dragon_fireball",
  "arrow",
  "snowball",
  "egg",
  "fireball",
  "splash_potion",
  "ender_pearl",
  "wither_skull",
  "wither_skull_dangerous",
  "small_fireball",
  "lingering_potion",
  "llama_spit",
  "fireworks_rocket",
  "fishing_hook"
 ],
 "reflection_scale": "0.5"
}
```

### minecraft:remove_in_peaceful

_since 1.21.90_

Denotes entities that are not allowed to exist in "Peaceful" difficulty.

Example (/minecraft:entity/components/minecraft:remove_in_peaceful/):
```json
{}
```

### minecraft:renders_when_invisible

When set, the entity will render even when invisible. Appropriate rendering behavior can then be specified in the corresponding "minecraft:client_entity".

Example (/minecraft:entity/components/minecraft:renders_when_invisible/):
```json
{}
```

### minecraft:rideable

This entity can be ridden

| Field | Type | Default | Notes |
|---|---|---|---|
| `controlling_seat` | int | `0` | The seat that designates the driver of the entity. Entities with the "minecraft:behavior.controlled_by_player" goal ignore this field and give control to any player in any seat. |
| `crouching_skip_interact` | boolean | `true` | If true, this entity can't be interacted with if the entity interacting with it is crouching. |
| `dismount_mode` | string | `"default"` | since 1.21.80. Defines where riders are placed when dismounting this entity: - "default", riders are placed on a valid ground position around the entity, or at the center of the entity's collision box if none is found. - "on_top_center", riders are placed at the center of t… Values: `default`, `on_top_center`. |
| `family_types` | stringArray |  | List of entities that can ride this entity. |
| `interact_text` | string |  | The text to display when the player can interact with the entity when playing with touch-screen controls. |
| `on_rider_enter_event` | minecraftEventReference |  | since 1.21.80. Event to execute on the owner entity when an entity starts riding it. |
| `on_rider_exit_event` | minecraftEventReference |  | since 1.21.80. Event to execute on the owner entity when an entity stops riding it. |
| `passenger_max_width` | float | `0` | The max width a mob can have to be a rider. A value of 0 ignores this parameter. |
| `priority` | int |  | This field may exist in old data but isn't used by "minecraft:rideable". |
| `pull_in_entities` | boolean | `false` | If true, this entity will pull entities matching the specified "family_types" into any available seats. Entities that are leashed will only be pulled in if their distance to their leash holder is less than the "hard_distance" defined in their own "minecraft:l… |
| `rider_can_interact` | boolean | `false` | If true, this entity will be picked when looked at by the rider. |
| `seat_count` | int | `1` | The number of entities that can ride this entity at the same time. |
| `seats` | objectArray |  | The list of positions and number of riders for each position for entities riding this entity. |
| `pulls_in_entities` | boolean |  | deprecated. This entity will pull in nearby entities. |

Example (/minecraft:entity/component_groups/minecraft:chicken_adult/minecraft:rideable/):
```json
{
 "seat_count": 1,
 "family_types": [
  "baby_undead"
 ],
 "seats": {
  "position": [
   0,
   0.48,
   0
  ]
 }
}
```

### minecraft:rotation_axis_aligned

Causes the entity to automatically rotate to align with the nearest cardinal direction based on its current facing direction. Combining this with the "minecraft:body_rotation_blocked" component will cause the entity's body to align with the nearest cardinal direction and remain fixed in that orientation, regardless of changes in its facing direction.

### minecraft:rotation_locked_to_vehicle

_since 1.21.130_

Causes the entity's rotation to match their vehicle's facing direction.

> Introduced in 1.21.130 as a rename of `minecraft:body_rotation_locked_to_vehicle`. Locks both the entity's body rotation and overall rotation to its mounted vehicle's facing direction.

Example (/minecraft:entity/components/minecraft:rotation_locked_to_vehicle/):
```json
{}
```

### minecraft:scaffolding_climber

_**deprecated**_

Allows the player to detect and manuever on the scaffolding block.

> `minecraft:scaffolding_climber` has been deprecated and replaced for minecraft:block_climber.

### minecraft:scale

Sets the entity's visual size multiplier. A value of 1.0 means normal size, 0.5 is half size (commonly used for baby mobs), and values above 1.0 make the entity larger.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `1` | The scale multiplier for visual size. 1.0 = normal, 0.5 = half (babies), 2.0 = double size. |

### minecraft:scale_by_age

Defines the entity's size interpolation based on the entity's age.

| Field | Type | Default | Notes |
|---|---|---|---|
| `end_scale` | float | `1` | Ending scale of the entity when it's fully grown. |
| `start_scale` | float | `1` | Initial scale of the newborn entity. |

### minecraft:scheduler

Fires off scheduled mob events at time of day events.

| Field | Type | Default | Notes |
|---|---|---|---|
| `scheduled_events` | objectArray |  | The list of triggers that fire when the conditions match the given filter criteria. Can be an array of event objects or a single event object. |
| `min_delay_secs` | float |  | The minimum the scheduler will be delayed. |
| `max_delay_secs` | float |  | The maximum the scheduler will be delayed. |

### minecraft:shareables

Defines a list of items the mob wants to share or pick up. Items can be configured with optional parameters to control pickup, sharing, and inventory behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `all_items` | boolean | `false` | A bucket for all other items in the game. Note this category is always least priority items. |
| `all_items_max_amount` | int | `-1` | Maximum number of this item the mob will hold. |
| `all_items_surplus_amount` | int | `-1` | Number of this item considered extra that the entity wants to share. |
| `all_items_want_amount` | int | `-1` | Number of this item this entity wants to share. |
| `items` | objectArray |  | List of items or item tags that the entity wants to share. Items in-game will match to this list from top to bottom, meaning that the first occurance of a match, be it name or tag, will shadow those coming after. |
| `singular_pickup` | boolean | `false` | Boolean value that controls if the mob is able to pick up more of the same item if it is already holding that item |

### minecraft:shooter

Defines the entity's ranged attack behavior. The "minecraft:behavior.ranged_attack" goal uses this component to determine which projectiles to shoot.

> Ammunition used by minecraft:shooter must have the minecraft:projectile component in order to function properly.

> Expanded in 1.19.60: the `projectiles` list can now specify multiple projectile definitions with condition filters, and `power`, `magic`, and `sound` are exposed for per-shooter customization.

| Field | Type | Default | Notes |
|---|---|---|---|
| `aux_val` | int | `-1` | ID of the Potion effect for the default projectile to be applied on hit. |
| `def` | string |  | Actor definition to use as the default projectile for the ranged attack. The actor definition must have the projectile component to be able to be shot as a projectile. |
| `magic` | boolean | `false` | since 1.19.60. If set, the projectiles are flagged as magic and the ranged attack goal will not run at the same time as other magic goals (for example, drink_potion). |
| `power` | float | `0` | since 1.19.60. Velocity at which projectiles will be shot. A power of 0 falls back to the default projectile throw power. |
| `projectiles` | objectArray |  | since 1.19.60. List of projectiles that can be used by the shooter. Each entry can specify its own projectile definition and condition filters; entries are evaluated in order and the first match is used. |
| `sound` | string |  | Sound that is played when the shooter shoots a projectile. |

Example (/minecraft:entity/component_groups/ranged_mode/minecraft:shooter/):
```json
{
 "def": "minecraft:small_fireball"
}
```

### minecraft:sittable

Defines the entity's 'sit' state.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sit_event` | object |  | Event to run when the entity enters the 'sit' state. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `stand_event` | object |  | Event to run when the entity exits the 'sit' state. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |

Example (/minecraft:entity/component_groups/minecraft:parrot_tame/minecraft:sittable/):
```json
{}
```

### minecraft:skin_id

Skin ID value. Can be used to differentiate skins, such as base skins for villagers.

> Requires multiple texture sets to be set up for the entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `0` | The ID of the skin. By convention, 0 is the ID of the base skin. |

### minecraft:sound_volume

Sets the entity's base volume for sound effects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `1` | The value of the volume the entity uses for sound effects. |

### minecraft:spawn_egg_interaction

Enables interacting with this entity using its own spawn egg to spawn a born child. Runs the "minecraft:entity_born" event on the created entity as well as the defined "on_spawn" event.

Example (/minecraft:entity/components/minecraft:spawn_egg_interaction/):
```json
{}
```

### minecraft:spawn_entity

Adds a timer after which this entity will spawn another entity or item (similar to vanilla's chicken's egg-laying behavior).

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | minecraftFilter |  | If present, the specified entity will only spawn if the filter evaluates to true. |
| `max_wait_time` | int | `600` | Maximum amount of time to randomly wait in seconds before another entity is spawned. |
| `min_wait_time` | int | `300` | Minimum amount of time to randomly wait in seconds before another entity is spawned. |
| `num_to_spawn` | int | `1` | The number of entities of this type to spawn each time that this triggers. |
| `should_leash` | boolean | `false` | If true, this the spawned entity will be leashed to the parent. |
| `single_use` | boolean | `false` | If true, this component will only ever spawn the specified entity once. |
| `spawn_entity` | string |  | Identifier of the entity to spawn, leave empty to spawn the item defined by "spawn_item" instead. |
| `spawn_event` | minecraftEventTrigger | `"minecraft:entity_born"` | Event to call on the spawned entity when it spawns. |
| `spawn_item` | string | `"egg"` | Item identifier of the item to spawn. |
| `spawn_item_event` | minecraftEventTrigger |  | Event to call on this entity when the item is spawned. |
| `spawn_method` | string | `"born"` | Method to use to spawn the entity. |
| `spawn_sound` | string | `"plop"` | Identifier of the sound effect to play when the entity is spawned. |
| `entities` | objectArray |  | List of entity spawn definitions. Can be a single object or an array of objects. |

Example (/minecraft:entity/component_groups/minecraft:chicken_adult/minecraft:spawn_entity/):
```json
{
 "entities": [
  {
   "min_wait_time": 300,
   "max_wait_time": 600,
   "spawn_sound": "plop",
   "spawn_item": "egg",
   "filters": [
    {
     "test": "rider_count",
     "subject": "self",
     "operator": "==",
     "value": 0
    },
    {
     "test": "enum_property",
     "subject": "self",
     "domain": "minecraft:climate_variant",
     "value": "temperate"
    }
   ]
  },
  {
   "min_wait_time": 300,
   "max_wait_time": 600,
   "spawn_sound": "plop",
   "spawn_item": "brown_egg",
   "filters": [
    {
     "test": "rider_count",
     "subject": "self",
     "operator": "==",
     "value": 0
    },
    {
     "test": "enum_property",
     "subject": "self",
     "domain": "minecraft:climate_variant",
     "value": "warm"
    }
   ]
  },
  {
   "min_wait_time": 300,
   "max_wait_time": 600,
   "spawn_sound": "plop",
   "spawn_item": "blue_egg",
   "filters": [
    {
     "test": "rider_count",
     "subject": "self",
     "operator": "==",
     "value": 0
    },
    {
     "test": "enum_property",
     "subject": "self",
     "domain": "minecraft:climate_variant",
     "value": "cold"
    }
   ]
  }
 ]
}
```

### minecraft:spawn_on_death

_since 1.26.20_

Component for spawning entities when an entity perishes.

> Added in 1.26.20. Spawns one or more entities when the owning entity perishes. `entity_to_spawn` defaults to the owning entity, `spawn_method` defaults to `spawned` (also accepts `born` and `summoned`), `spawn_amount` defaults to 1, `inherit_parent_name` defaults to true, and `additional_spawn_range` adds optional random offset. `filters` gates whether the spawn is triggered at all.

| Field | Type | Default | Notes |
|---|---|---|---|
| `additional_spawn_range` | object | `{"max":0,"min":0}` | Additional random range of entities to spawn, defaults to 0, 0 when not set See `block/intrange`. |
| `entity_to_spawn` | string | `"self"` | What entity to spawn, defaults to owning entity when not set |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Conditions that need to be met for the behavior to start. |
| `inherit_parent_name` | boolean | `true` | If true, the entity will inherit the name of the parent entity, defaults to true when not set |
| `spawn_amount` | int | `1` | How many entities to spawn, defaults to 1 when not set |
| `spawn_method` | string | `"spawned"` | Spawn method. born, spawned, or summoned, defaults to spawned when not set |

### minecraft:spell_effects

Allows an entity to add or remove status effects from itself. Similarly to `addrider`, this component performs a one-time operation on the entity when added. Removing the component will not change the entity's current effects. Adding different versions of the component multiple times will perform each one in turn. Once the component has been added, it will not provide any further functionality. There is one exception to this behavior: if this component is present on a player, its effects will be re-applied every time the player enters the world. To avoid this, remove the component shortly after adding it, or add an empty component to replace it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `add_effects` | objectArray |  | List of effects to add to this entity. |
| `remove_effects` | string |  | List of identifiers of effects to be removed from this entity after adding this component |

Example (/minecraft:entity/component_groups/minecraft:add_raid_omen/minecraft:spell_effects/):
```json
{
 "add_effects": [
  {
   "display_on_screen_animation": true,
   "duration": 30,
   "effect": "raid_omen"
  }
 ],
 "remove_effects": "bad_omen"
}
```

### minecraft:strength

Defines the entity's strength to carry items.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `5` | The maximum strength of this entity |
| `value` | int | `1` | The initial value of the strength |

### minecraft:suspect_tracking

Allows this entity to remember suspicious locations.

Example (/minecraft:entity/components/minecraft:suspect_tracking/):
```json
{}
```

### minecraft:tameable

This entity can be tamed

> From 1.21.130, each entry in `tame_items` accepts an optional `result_item` field. On a successful tame interaction, the consumed item is replaced in the player's inventory with the specified item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `probability` | float | `1` | The chance of taming the entity with each item use between 0.0 and 1.0, where 1.0 is 100% |
| `tame_event` | object |  | Event to fire when the entity is tamed. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `tame_items` | stringArray |  | The list of items that can be used to tame this entity |
| `tameItems` |  |  | List of items that can be fed to an entity to tame them |

Example (/minecraft:entity/component_groups/minecraft:parrot_wild/minecraft:tameable/):
```json
{
 "probability": 0.33,
 "tame_items": [
  "wheat_seeds",
  "pumpkin_seeds",
  "melon_seeds",
  "beetroot_seeds",
  "pitcher_pod",
  "torchflower_seeds"
 ],
 "tame_event": {
  "event": "minecraft:on_tame",
  "target": "self"
 }
}
```

### minecraft:tamemount

Allows entities to flock in groups in water or not.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attempt_temper_mod` | int | `5` | The amount the entity's temper will increase when mounted. |
| `auto_reject_items` | objectArray | `[]` | The list of items that, if carried while interacting with the entity, will anger it. See `entity/mounttamingcomponentrejectitem`. |
| `feed_items` | objectArray | `[]` | The list of items that can be used to increase the entity's temper and speed up the taming process. See `entity/mounttamingcomponentfeeditem`. |
| `feed_text` | string | `""` | The text that shows in the feeding interact button. |
| `max_temper` | int | `100` | The maximum value for the entity's random starting temper. |
| `min_temper` | int | `0` | The minimum value for the entity's random starting temper. |
| `ride_text` | string | `""` | The text that shows in the riding interact button. |
| `tame_event` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event that triggers when the entity becomes tamed. See `entity/actordefinitiontrigger`. |

Example (/minecraft:entity/component_groups/minecraft:llama_wild/minecraft:tamemount/):
```json
{
 "min_temper": 0,
 "max_temper": 30,
 "feed_text": "action.interact.feed",
 "ride_text": "action.interact.mount",
 "feed_items": [
  {
   "item": "wheat",
   "temper_mod": 3
  },
  {
   "item": "hay_block",
   "temper_mod": 6
  }
 ],
 "tame_event": {
  "event": "minecraft:on_tame",
  "target": "self"
 }
}
```

### minecraft:target_nearby_sensor

Defines the entity's range within which it can see or sense other entities to target them.

| Field | Type | Default | Notes |
|---|---|---|---|
| `inside_range` | float | `1` | Maximum distance in blocks that another entity will be considered in the 'inside' range |
| `must_see` | boolean | `false` | Whether the other entity needs to be visible to trigger 'inside' events |
| `on_inside_range` | object |  | Event to call when an entity gets in the inside range. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `on_outside_range` | object |  | Event to call when an entity gets outside the outside range. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `on_vision_lost_inside_range` | minecraftEventTrigger |  | Event to call when an entity exits visual range. Can specify 'event' for the name of the event and 'target' for the target of the event |
| `outside_range` | float | `5` | Maximum distance in blocks that another entity will be considered in the 'outside' range |

Example (/minecraft:entity/component_groups/mode_switcher/minecraft:target_nearby_sensor/):
```json
{
 "on_inside_range": {
  "event": "switch_to_melee",
  "target": "self"
 },
 "inside_range": 2,
 "must_see": true,
 "outside_range": 3,
 "on_outside_range": {
  "event": "switch_to_ranged",
  "target": "self"
 }
}
```

### minecraft:teleport

Defines an entity's teleporting behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `dark_teleport_chance` | float | `0.01` | Modifies the chance that the entity will teleport if the entity is in darkness |
| `light_teleport_chance` | float | `0.01` | Modifies the chance that the entity will teleport if the entity is in daylight |
| `max_random_teleport_time` | float | `20` | Maximum amount of time in seconds between random teleports |
| `min_random_teleport_time` | float | `0` | Minimum amount of time in seconds between random teleports |
| `projectile_filter` | minecraftFilter |  | Conditions that determine which projectiles cause the entity to attempt to teleport. If omitted, all projectiles cause a teleport attempt |
| `random_teleport_cube` | point3 | `[32,16,32]` | Entity will teleport to a random position within the area defined by this cube |
| `random_teleports` | boolean | `true` | If true, the entity will teleport randomly |
| `target_distance` | float | `16` | Maximum distance the entity will teleport when chasing a target |
| `target_teleport_chance` | float | `1` | The chance that the entity will teleport between 0.0 and 1.0. 1.0 means 100% |
| `teleports_on_projectile_hit` | boolean | `false` | If true, the entity will attempt to teleport away from projectiles about to hit it |

### minecraft:tick_world

Defines if the entity ticks the world and the radius around it to tick.

| Field | Type | Default | Notes |
|---|---|---|---|
| `distance_to_players` | float | `128` | The distance at which the closest player has to be before this entity despawns. This option will be ignored if never_despawn is true. |
| `never_despawn` | boolean | `true` | If true, this entity will not despawn even if players are far away. If false, distance_to_players will be used to determine when to despawn. |
| `radius` | int | `2` | The area around the entity to tick. |

### minecraft:timer

Adds a timer after which an event will fire.

| Field | Type | Default | Notes |
|---|---|---|---|
| `looping` | boolean | `true` | If true, the timer will restart every time after it fires. |
| `randomInterval` | boolean | `true` | If true, the amount of time on the timer will be random between the min and max values specified in time. |
| `random_time_choices` | stringArray | `"[ ]"` | This is a list of objects, representing one value in seconds that can be picked before firing the event and an optional weight. Incompatible with time. |
| `time` | floatRange |  | Amount of time in seconds for the timer. Can be specified as a number or a pair of numbers (min and max). Incompatible with random_time_choices. |
| `time_down_event` | object |  | Event to fire when the time on the timer runs out. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |

### minecraft:trade_table

Defines this entity's ability to trade with players.

| Field | Type | Default | Notes |
|---|---|---|---|
| `convert_trades_economy` | boolean | `false` | Determines when the mob transforms, if the trades should be converted when the new mob has a economy_trade_table. When the trades are converted, the mob will generate a new trade list with their new trade table, but then it will try to convert any of the same… |
| `display_name` | string | `""` | Name to be displayed while trading with this entity. |
| `new_screen` | boolean | `false` | Used to determine if trading with entity opens the new trade screen. |
| `persist_trades` | boolean | `false` | Determines if the trades should persist when the mob transforms. This makes it so that the next time the mob is transformed to something with a trade_table or economy_trade_table, then it keeps their trades. |
| `table` | string | `""` | File path relative to the behavior pack root for this entity's trades. |

### minecraft:trail

Causes an entity to leave a trail of blocks as it moves about the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block_type` | string | `"air"` | The type of block you wish to be spawned by the entity as it move about the world. Solid blocks may not be spawned at an offset of (0,0,0). |
| `spawn_filter` | minecraftFilter |  | One or more conditions that must be met in order to cause the chosen block type to spawn. |
| `spawn_offset` | point3 | `[0,0,0]` | The distance from the entities current position to spawn the block. Capped at up to 16 blocks away. The X value is left/right(-/+), the Z value is backward/forward(-/+), the Y value is below/above(-/+). |

### minecraft:transformation

Defines an entity's transformation from the current definition into another

| Field | Type | Default | Notes |
|---|---|---|---|
| `add` | objectArray |  | List of components to add to the entity after the transformation |
| `begin_transform_sound` | string |  | Sound to play when the transformation starts |
| `delay` | object |  | Defines the properties of the delay for the transformation. Can be a simple number (seconds) or a complex object. |
| `drop_equipment` | boolean | `false` | Cause the entity to drop all equipment upon transformation |
| `drop_inventory` | boolean | `false` | Cause the entity to drop all items in inventory upon transformation |
| `into` | string |  | Entity Definition that this entity will transform into |
| `keep_level` | boolean | `false` | If this entity has trades and has leveled up, it should maintain that level after transformation. |
| `keep_owner` | boolean | `false` | If this entity is owned by another entity, it should remain owned after transformation. |
| `preserve_equipment` | boolean | `false` | Cause the entity to keep equipment after going through transformation |
| `transformation_sound` | string |  | Sound to play when the entity is done transforming |

Example (/minecraft:entity/component_groups/minecraft:pig_transform/minecraft:transformation/):
```json
{
 "into": "minecraft:pig_zombie",
 "transformation_sound": "mob.pig.death",
 "delay": 0.5
}
```

### minecraft:transient

_since 1.21.40_

An entity with this component will NEVER persist, and forever disappear when unloaded.

Example (/minecraft:entity/components/minecraft:transient/):
```json
{}
```

### minecraft:trusting

Defines the rules for a mob to trust players.

| Field | Type | Default | Notes |
|---|---|---|---|
| `probability` | float | `1` | The chance of the entity trusting with each item use between 0.0 and 1.0, where 1.0 is 100%. |
| `trust_event` | object |  | Event to run when this entity becomes trusting. Can be an object with event and target properties, or a simple event string. See `ActorDefinitionTrigger`. |
| `trust_items` | stringArray |  | The list of items that can be used to get the entity to trust players. Can be an array or a single item string. |

### minecraft:type_family

Defines the family categories this entity belongs to. Type families are used by filters and other game systems to group entities (e.g., 'mob', 'monster', 'undead', 'zombie').

| Field | Type | Default | Notes |
|---|---|---|---|
| `family` | stringArray |  | A set of tags that describe the categories of this entity. In addition to typically having a tag for the type of mob, entities frequently have additional type family tags that modify how the rest of the Minecraft world reacts to them. Values: `mob`, `inanimate`, `aquatic`, `monster`, `undead`, `skeleton`, `arthropod`, `zombie`, `lightweight`, `fish`, `player`. |

Example (/minecraft:entity/components/minecraft:type_family/):
```json
{
 "family": [
  "allay",
  "mob"
 ]
}
```

### minecraft:underwater_mount_breathing

Pauses this entity's breathing under water.

### minecraft:underwater_movement

Defines the speed with which an entity can move through water.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float |  | Movement speed of the entity under water. |

### minecraft:uses_legacy_friction

_since 1.26.20_

When set, legacy calculations are used when applying "minecraft:friction_modifier". This component is automatically added to legacy content to preserve existing behavior. The legacy calculations are incorrect and should not be used for new content.

> Added in 1.26.20 alongside the `minecraft:friction_modifier` behavior fix. Adding this component opts an entity back into the legacy (pre-1.26.20) friction calculations, which also partially affected air and liquid drag. Entities whose `format_version` is older than 1.26.20 receive this component automatically so that existing content keeps its prior behavior.

Example (/minecraft:entity/components/minecraft:uses_legacy_friction/):
```json
{}
```

### minecraft:variable_max_auto_step

Entities with this component will have a maximum auto step height that is different depending on whether they are on a block that prevents jumping. Incompatible with "runtime_identifier": "minecraft:horse".

| Field | Type | Default | Notes |
|---|---|---|---|
| `base_value` | float | `0.5625` | The maximum auto step height when on any other block. |
| `controlled_value` | float | `0.5625` | The maximum auto step height when on any other block and controlled by the player. |
| `jump_prevented_value` | float | `0.5625` | The maximum auto step height when on a block that prevents jumping. |

### minecraft:variant

Variant is typically used as a per-type way to express a different visual form of the same mob. For example, for cats, variant is a number that defines the breed of cat.

> This behavior is a requirement for setting up multiple types of variants for an entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `0` | The Id of the variant. By convention, 0 is the Id of the base entity/default appearance. |

Example (/minecraft:entity/components/minecraft:variant/):
```json
{
 "value": 15
}
```

### minecraft:vertical_movement_action

When configured as a rideable entity, the entity will move upwards or downwards when the player uses the jump action.

| Field | Type | Default | Notes |
|---|---|---|---|
| `vertical_velocity` | float | `0.5` | Vertical velocity to apply when jump action is issued. |

### minecraft:vibration_damper

Vibrations emitted by an entity with this component will be ignored.

Example (/minecraft:entity/components/minecraft:vibration_damper/):
```json
{}
```

### minecraft:vibration_listener

Allows the entity to listen to vibration events. This is a largely-internal component, that is only supported on the Warden and Allay mobs.

### minecraft:walk_animation_speed

Sets the speed multiplier for this entity's walk animation speed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `1` | The higher the number, the faster the animation for walking plays. A value of 1.0 means normal speed, while 2.0 means twice as fast. |

### minecraft:wants_jockey

Sets that this entity wants to become a jockey.

### minecraft:water_movement

Customizes how the entity moves through water by adjusting drag coefficient. Lower values let entities glide through water easily like fish, while higher values create resistance for entities that struggle in water. Essential for aquatic mobs, boats, and any entity needing custom underwater physics.

| Field | Type | Default | Notes |
|---|---|---|---|
| `drag_factor` | float | `0.8` | Drag factor to determine movement speed when in water. |

Example (/minecraft:entity/components/minecraft:water_movement/):
```json
{
 "drag_factor": 0.98
}
```

### minecraft:wither_target_highest_damage

Allows the wither to focus its attacks on whichever mob has dealt the most damage to it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `entity_types` | objectArray | `[]` | List of entity types the wither takes into account to find who dealt the most damage to it |
| `priority` | int | `0` | Priority |

## Documents and sub-objects (78)

### Actor Document (actor_document)

The root structure for entity behavior definitions in behavior packs. Contains the entity's unique identifier, components that define its capabilities, component groups for state variations, and events that trigger state changes. Every custom mob, NPC, or creature requires an actor document defining its AI, health, movement, and interactions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `component_groups` | keyedObjectCollection | `{}` | Named groups of components that can be dynamically added/removed via events. Each key is a group name (e.g., 'minecraft:baby'), and the value contains components for that state. See `entity/entity_component_definitions`. |
| `components` | object |  | The base components always active on this entity, defining its default behavior, attributes, and AI. See `entity/entity_component_definitions`. |
| `description` | object |  | **required**. Contains the entity's unique identifier and runtime_identifier for spawn egg and other behaviors. |
| `events` | keyedObjectCollection |  | Named events that can add/remove component groups and trigger actions. Events are invoked by component logic or spawning. |
| `upgrades` | object |  | Dynamic value |

### ActorDefinitionEventSubcomponentDefinition (actordefinitioneventsubcomponentdefinition)

Fires an entity event on the shooter, the projectile, the entity hit, and/or all entities in a splash radius.

| Field | Type | Default | Notes |
|---|---|---|---|
| `affect_projectile` | boolean | `false` | If `true`, the event is fired on the projectile entity itself. |
| `affect_shooter` | boolean | `false` | If `true`, the event is fired on the projectile's shooter. |
| `affect_splash_area` | boolean | `false` | If `true`, the event is fired on every entity within `splash_area` blocks of the impact. |
| `affect_target` | boolean | `false` | If `true`, the event is fired on the entity hit by the projectile. |
| `event_trigger` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event trigger (with optional filters) to fire on the selected target(s). See `entity/actordefinitiontrigger`. |
| `splash_area` | float | `0` | Radius (in blocks) used by `affect_splash_area`. |

### ActorDefinitionTrigger (actordefinitiontrigger)

Triggers an entity event when specified conditions are met. Events activate component groups that change entity behavior—transforming villagers into zombie villagers, switching mobs to aggressive mode, or triggering growth stages. Combine with filters to create conditional state machines that respond to gameplay.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string | `""` | Event |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `target` | stringEnum | `"self"` | Target Values: `baby`, `block`, `damager`, `holder`, `item`, `other`, `parent`, `player`, `self`, `target`. |

### AddItemsData (additemsdata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `table` | string |  | **required**. File path, relative to the Behavior Pack's path, to the loot table file. |

### ArrowEffectSubcomponentDefinition (arroweffectsubcomponentdefinition)

Variant of `mob_effect` that derives the effects from the arrow's tipped-potion data and splits durations across the standard eight-arrow stack.

| Field | Type | Default | Notes |
|---|---|---|---|
| `apply_effect_to_blocking_targets` | boolean | `true` | If `true`, effects are still applied to targets that blocked the projectile. |

### Base Memory Goal Definition (base_memory_goal_definition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |

### BaseGenericGoal (basegenericgoal)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |

### BaseGoal (basegoal)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |

### BaseMoveToBlockDefinition (basemovetoblockdefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |
| `search_count` | int | `10` | The number of randomly selected blocks each tick that the mob will check within its search range and height for a valid block to move to. A value of 0 will have the mob check every block within range in one tick. |
| `speed_multiplier` | float | `1` | Movement speed multiplier of the mob when using this goal. |

### BaseMoveToBlockGoalDefinition (basemovetoblockgoaldefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |
| `search_count` | int | `10` | The number of randomly selected blocks each tick that the mob will check within its search range and height for a valid block to move to. A value of 0 will have the mob check every block within range in one tick. |
| `speed_multiplier` | float | `1` | Movement speed multiplier of the mob when using this goal. |

### BaseMoveToDefinition (basemovetodefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |
| `speed_multiplier` | float | `1` | Movement speed multiplier of the mob when using this goal. |

### BaseMoveToGoalDefinition (basemovetogoaldefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `priority` | int | `0` | Priority |
| `speed_multiplier` | float | `1` | Movement speed multiplier of the mob when using this goal. |

### BlockDescriptorProxy (blockdescriptorproxy)

References a specific block type for entity components that interact with blocks. Used by behaviors like dig, place, or break blocks to specify which blocks the entity targets. Can match by block identifier or by block state properties for precise block selection.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### CatchFireSubcomponentDefinition (catchfiresubcomponentdefinition)

Causes the projectile to embed itself in the block it hits.

| Field | Type | Default | Notes |
|---|---|---|---|
| `fire_affected_by_griefing` | boolean | `false` | If `true`, the block-ignition behavior is suppressed when the shooter is a mob and the `mobGriefing` game rule is off. |
| `on_fire_time` | float | `0` | Duration in seconds for which entity remains on fire |

### core (core)

Defines common entity component properties that are frequently exposed as core flags or values.

| Field | Type | Default | Notes |
|---|---|---|---|
| `burns_in_daylight` | boolean | `false` | Whether this entity burns in daylight |
| `can_climb` | boolean | `false` | Whether this entity can climb ladders |
| `can_fly` | boolean | `false` | Whether this entity can fly |
| `can_power_jump` | boolean | `false` | Whether this entity can power jump |
| `chested` | int | `false` | Whether this entity has a chest |
| `color` | int | `0` | Palette color of the entity |
| `color2` | int | `0` | Second palette color of the entity |

### DragonBaseGoalDefinition (dragonbasegoaldefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `active_speed` | float | `1` | The speed this entity moves when this behavior has started or while it's active. |
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `flight_speed` | float | `0.6000000238418579` | The speed this entity moves while this behavior is not active. |
| `priority` | int | `0` | Priority |
| `target_zone` | object | `{"max":150,"min":10}` | Minimum and maximum distance, from the target, this entity can use this behavior. See `legacy/floatrange`. |
| `turn_speed` | float | `0.699999988079071` | The speed at which this entity turns while using this behavior. |

### DrinkPotionGoalDefinition_PotionData (drinkpotiongoaldefinition_potiondata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `chance` | float | `1` | The percent chance (from 0.0 to 1.0) of this potion being selected when searching for a potion to use. |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | The filters to use when determining if this potion can be selected. |
| `id` | int | `-1` | The registry ID of the potion to use |

### EatAndReplaceBlockPair (eatandreplaceblockpair)

| Field | Type | Default | Notes |
|---|---|---|---|
| `eat_block` | string | `""` | The block the entity should eat. |
| `replace_block` | string | `""` | The block that should replace the eaten block. |

### entity_behavior_document (entity_behavior_document)

A behavior pack entity definition document for Minecraft Bedrock Edition. This describes the complete JSON file structure including format_version and the minecraft:entity wrapper.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this entity behavior file. Determines which features and component schemas are available. |
| `minecraft:entity` | object |  | **required**. The entity definition container with all behavior pack entity data. See `entity/actor_document`. |

### Entity component definitions (entity_component_definitions)

Registry of all available entity components that define mob capabilities. Components cover health, movement, combat, AI goals, interactions, physics, sensing, and rendering. Entities combine components to create unique creatures—adding minecraft:health for durability, minecraft:behavior.melee_attack for combat, or minecraft:rideable for mounts.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:absorption` | object |  | Dynamic value See `entity/minecraft_absorption`. |
| `minecraft:addrider` | object |  | Dynamic value See `entity/minecraft_addrider`. |
| `minecraft:admire_item` | object |  | Dynamic value See `entity/minecraft_admire_item`. |
| `minecraft:ageable` | object |  | Dynamic value See `entity/minecraft_ageable`. |
| `minecraft:air_drag_modifier` | object |  | Dynamic value |
| `minecraft:ambient_sound_interval` | object |  | Dynamic value See `entity/minecraft_ambient_sound_interval`. |
| `minecraft:anger_level` | object |  | Dynamic value See `entity/minecraft_anger_level`. |
| `minecraft:angry` | object |  | Dynamic value See `entity/minecraft_angry`. |
| `minecraft:annotation.break_door` | object |  | Dynamic value See `entity/minecraft_annotation_break_door`. |
| `minecraft:annotation.open_door` | object |  | Dynamic value See `entity/minecraft_annotation_open_door`. |
| `minecraft:apply_knockback_rules` | object |  | Defines how an entity applies knockback. See `entity/minecraft_apply_knockback_rules`. |
| `minecraft:area_attack` | object |  | Dynamic value See `entity/minecraft_area_attack`. |
| `minecraft:attack` | object |  | Dynamic value See `entity/minecraft_attack`. |
| `minecraft:attack_cooldown` | object |  | Dynamic value See `entity/minecraft_attack_cooldown`. |
| `minecraft:attack_damage` | object |  | Dynamic value See `entity/minecraft_attack_damage`. |
| `minecraft:balloon` | object |  | Dynamic value See `entity/minecraft_balloon`. |
| `minecraft:balloonable` | object |  | Dynamic value See `entity/minecraft_balloonable`. |
| `minecraft:barter` | object |  | Dynamic value See `entity/minecraft_barter`. |
| `minecraft:behavior.admire_item` | object |  | Dynamic value See `entity/minecraft_behavior_admire_item`. |
| `minecraft:behavior.aquatic_charge_attack` | object |  | Enables an aquatic mob to dash at its target with knockback; includes overshoot and cooldown settings. See `entity/minecraft_behavior_aquatic_charge_attack`. |
| `minecraft:behavior.avoid_block` | object |  | Allows this entity to avoid certain blocks. See `entity/minecraft_behavior_avoid_block`. |
| `minecraft:behavior.avoid_mob_type` | object |  | Allows the entity to run away from other entities that meet the criteria specified. See `entity/minecraft_behavior_avoid_mob_type`. |
| `minecraft:behavior.barter` | object |  | Dynamic value See `entity/minecraft_behavior_barter`. |
| `minecraft:behavior.beg` | object |  | Dynamic value See `entity/minecraft_behavior_beg`. |
| `minecraft:behavior.break_door` | object |  | Dynamic value See `entity/minecraft_behavior_break_door`. |
| `minecraft:behavior.breed` | object |  | Dynamic value See `entity/minecraft_behavior_breed`. |
| `minecraft:behavior.celebrate` | object |  | Allows this entity to celebrate surviving a raid by making celebration sounds and jumping. See `entity/minecraft_behavior_celebrate`. |
| `minecraft:behavior.celebrate_survive` | object |  | Allows the player to trade with this mob. When the goal starts, it will stop the mob's navigation. See `entity/minecraft_behavior_celebrate_survive`. |
| `minecraft:behavior.charge_attack` | object |  | Allows this entity to damage a target by using a running attack. See `entity/minecraft_behavior_charge_attack`. |
| `minecraft:behavior.charge_held_item` | object |  | Allows an entity to charge and use their held item. See `entity/minecraft_behavior_charge_held_item`. |
| `minecraft:behavior.circle_around_anchor` | object |  | Causes an entity to circle around an anchor point placed near a point or target. See `entity/minecraft_behavior_circle_around_anchor`. |
| `minecraft:behavior.controlled_by_player` | object |  | Allows the entity to be controlled by a player which is holding the item specified in "minecraft:item_controllable" component's "control_items" field (required). Also requires the "minecraft:movement" component, and the "minecraft:rideable" component. On ever… See `entity/minecraft_behavior_controlled_by_player`. |
| `minecraft:behavior.croak` | object |  | Allows the entity to croak at a random time interval with configurable conditions. See `entity/minecraft_behavior_croak`. |
| `minecraft:behavior.defend_trusted_target` | object |  | Dynamic value See `entity/minecraft_behavior_defend_trusted_target`. |
| `minecraft:behavior.defend_village_target` | object |  | Allows the entity to stay in a village and defend the village from aggressors. If a player is in bad standing with the village this goal will cause the entity to attack the player regardless of filter conditions. See `entity/minecraft_behavior_defend_village_target`. |
| `minecraft:behavior.delayed_attack` | object |  | Allows an entity to attack, while also delaying the damage-dealt until a specific time in the attack animation. See `entity/minecraft_behavior_delayed_attack`. |
| `minecraft:behavior.dig` | object |  | Allows this entity to dig into the ground before despawning. See `entity/minecraft_behavior_dig`. |
| `minecraft:behavior.door_interact` | object |  | Dynamic value See `entity/minecraft_behavior_door_interact`. |
| `minecraft:behavior.dragonchargeplayer` | object |  | Allows this entity to attack a player by charging at them. The player is chosen by the "minecraft:behavior.dragonscanning". Can only be used by the Ender Dragon. See `entity/minecraft_behavior_dragonchargeplayer`. |
| `minecraft:behavior.dragondeath` | object |  | Dynamic value See `entity/minecraft_behavior_dragondeath`. |
| `minecraft:behavior.dragonflaming` | object |  | Allows this entity to use a flame-breath attack. Can only be used by the Ender Dragon. See `entity/minecraft_behavior_dragonflaming`. |
| `minecraft:behavior.dragonholdingpattern` | object |  | Dynamic value See `entity/minecraft_behavior_dragonholdingpattern`. |
| `minecraft:behavior.dragonlanding` | object |  | Dynamic value See `entity/minecraft_behavior_dragonlanding`. |
| `minecraft:behavior.dragonscanning` | object |  | Dynamic value See `entity/minecraft_behavior_dragonscanning`. |
| `minecraft:behavior.dragonstrafeplayer` | object |  | Allows this entity to fly around looking for a player to shoot fireballs at. Can only be used by the Ender Dragon. See `entity/minecraft_behavior_dragonstrafeplayer`. |
| `minecraft:behavior.dragontakeoff` | object |  | Dynamic value See `entity/minecraft_behavior_dragontakeoff`. |
| `minecraft:behavior.drink_milk` | object |  | Allows the mob to drink milk based on specified environment conditions. See `entity/minecraft_behavior_drink_milk`. |
| `minecraft:behavior.drink_potion` | object |  | Dynamic value See `entity/minecraft_behavior_drink_potion`. |
| `minecraft:behavior.drop_item_for` | object |  | Allows the entity to move toward a target, and drop an item near the target. This goal requires a "minecraft:navigation" to execute. See `entity/minecraft_behavior_drop_item_for`. |
| `minecraft:behavior.eat_block` | object |  | Allows the entity to consume a block, replace the eaten block with another block, and trigger an event as a result. See `entity/minecraft_behavior_eat_block`. |
| `minecraft:behavior.eat_carried_item` | object |  | Dynamic value See `entity/minecraft_behavior_eat_carried_item`. |
| `minecraft:behavior.eat_mob` | object |  | Allows the entity to eat a specified Mob. See `entity/minecraft_behavior_eat_mob`. |
| `minecraft:behavior.emerge` | object |  | Allows this entity to emerge from the ground See `entity/minecraft_behavior_emerge`. |
| `minecraft:behavior.enderman_leave_block` | object |  | Dynamic value See `entity/minecraft_behavior_enderman_leave_block`. |
| `minecraft:behavior.enderman_take_block` | object |  | Dynamic value See `entity/minecraft_behavior_enderman_take_block`. |
| `minecraft:behavior.equip_item` | object |  | The entity puts on the desired equipment. See `entity/minecraft_behavior_equip_item`. |
| `minecraft:behavior.explore_outskirts` | object |  | Allows the entity to first travel to a random point on the outskirts of the village, and then explore random points within a small distance. This goal requires "minecraft:dweller" and "minecraft:navigation" to execute. See `entity/minecraft_behavior_explore_outskirts`. |
| `minecraft:behavior.fertilize_farm_block` | object |  | Allows the mob to search within an area for a growable crop block. If found, the mob will use any available fertilizer in their inventory on the crop. This goal will not execute if the mob does not have a fertilizer item in its inventory. See `entity/minecraft_behavior_fertilize_farm_block`. |
| `minecraft:behavior.find_cover` | object |  | Dynamic value See `entity/minecraft_behavior_find_cover`. |
| `minecraft:behavior.find_mount` | object |  | Dynamic value See `entity/minecraft_behavior_find_mount`. |
| `minecraft:behavior.find_underwater_treasure` | object |  | Dynamic value See `entity/minecraft_behavior_find_underwater_treasure`. |
| `minecraft:behavior.fire_at_target` | object |  | Allows an entity to attack by firing a shot with a delay. Anchor and offset parameters of this component overrides the anchor and offset from projectile component. See `entity/minecraft_behavior_fire_at_target`. |
| `minecraft:behavior.flee_sun` | object |  | Dynamic value See `entity/minecraft_behavior_flee_sun`. |
| `minecraft:behavior.float` | object |  | Dynamic value See `entity/minecraft_behavior_float`. |
| `minecraft:behavior.float_tempt` | object |  | Dynamic value See `entity/minecraft_behavior_float_tempt`. |
| `minecraft:behavior.float_wander` | object |  | Dynamic value See `entity/minecraft_behavior_float_wander`. |
| `minecraft:behavior.follow_caravan` | object |  | Dynamic value See `entity/minecraft_behavior_follow_caravan`. |
| `minecraft:behavior.follow_mob` | object |  | Dynamic value See `entity/minecraft_behavior_follow_mob`. |
| `minecraft:behavior.follow_owner` | object |  | Dynamic value See `entity/minecraft_behavior_follow_owner`. |
| `minecraft:behavior.follow_parent` | object |  | Dynamic value See `entity/minecraft_behavior_follow_parent`. |
| `minecraft:behavior.follow_target_leader` | object |  | Allows mob to move towards its target leader. See `entity/minecraft_behavior_follow_target_leader`. |
| `minecraft:behavior.go_and_give_items_to_noteblock` | object |  | The entity will attempt to toss the items from its inventory to a nearby recently played noteblock. See `entity/minecraft_behavior_go_and_give_items_to_noteblock`. |
| `minecraft:behavior.go_and_give_items_to_owner` | object |  | The entity will attempt to toss the items from its inventory to its owner. See `entity/minecraft_behavior_go_and_give_items_to_owner`. |
| `minecraft:behavior.go_home` | object |  | Allows the mob to move back to the position they were spawned. See `entity/minecraft_behavior_go_home`. |
| `minecraft:behavior.guardian_attack` | object |  | Allows this entity to use a laser beam attack. Can only be used by Guardians and Elder Guardians. See `entity/minecraft_behavior_guardian_attack`. |
| `minecraft:behavior.harvest_farm_block` | object |  | Allows the entity to search within an area for farmland with air above it. If found, the entity will replace the air block by planting a seed item from its inventory on the farmland block. This goal requires "minecraft:inventory" and "minecraft:navigation" to… See `entity/minecraft_behavior_harvest_farm_block`. |
| `minecraft:behavior.hide` | object |  | Dynamic value See `entity/minecraft_behavior_hide`. |
| `minecraft:behavior.hold_ground` | object |  | Dynamic value See `entity/minecraft_behavior_hold_ground`. |
| `minecraft:behavior.hover` | object |  | Dynamic value See `entity/minecraft_behavior_hover`. |
| `minecraft:behavior.hurt_by_target` | object |  | Dynamic value See `entity/minecraft_behavior_hurt_by_target`. |
| `minecraft:behavior.inspect_bookshelf` | object |  | Dynamic value See `entity/minecraft_behavior_inspect_bookshelf`. |
| `minecraft:behavior.investigate_suspicious_location` | object |  | Allows this entity to move towards a "suspicious" position based on data gathered in minecraft:suspect_tracking See `entity/minecraft_behavior_investigate_suspicious_location`. |
| `minecraft:behavior.jump_around_target` | object |  | Allows an entity to jump around a target. See `entity/minecraft_behavior_jump_around_target`. |
| `minecraft:behavior.jump_to_block` | object |  | Allows an entity to jump to another random block. See `entity/minecraft_behavior_jump_to_block`. |
| `minecraft:behavior.knockback_roar` | object |  | Allows the mob to perform a damaging knockback that affects all nearby entities. See `entity/minecraft_behavior_knockback_roar`. |
| `minecraft:behavior.lay_down` | object |  | Dynamic value See `entity/minecraft_behavior_lay_down`. |
| `minecraft:behavior.lay_egg` | object |  | Dynamic value See `entity/minecraft_behavior_lay_egg`. |
| `minecraft:behavior.leap_at_target` | object |  | Dynamic value See `entity/minecraft_behavior_leap_at_target`. |
| `minecraft:behavior.look_at_entity` | object |  | Dynamic value See `entity/minecraft_behavior_look_at_entity`. |
| `minecraft:behavior.look_at_player` | object |  | Dynamic value See `entity/minecraft_behavior_look_at_player`. |
| `minecraft:behavior.look_at_target` | object |  | Dynamic value See `entity/minecraft_behavior_look_at_target`. |
| `minecraft:behavior.look_at_trading_player` | object |  | Dynamic value See `entity/minecraft_behavior_look_at_trading_player`. |
| `minecraft:behavior.make_love` | object |  | Dynamic value See `entity/minecraft_behavior_make_love`. |
| `minecraft:behavior.melee_attack` | object |  | Allows an entity to deal damage through a melee attack. See `entity/minecraft_behavior_melee_attack`. |
| `minecraft:behavior.melee_box_attack` | object |  | Allows an entity to deal damage through a melee attack with reach calculations based on bounding boxes. See `entity/minecraft_behavior_melee_box_attack`. |
| `minecraft:behavior.mingle` | object |  | Dynamic value See `entity/minecraft_behavior_mingle`. |
| `minecraft:behavior.mount_pathing` | object |  | Dynamic value See `entity/minecraft_behavior_mount_pathing`. |
| `minecraft:behavior.move_around_target` | object |  | Allows an entity to move around a target.If the entity is too close(i.e.closer than destination range min and height difference limit) it will try to move away from its target.If the entity is too far away from its target it will try to move closer to a rando… See `entity/minecraft_behavior_move_around_target`. |
| `minecraft:behavior.move_indoors` | object |  | Allows this entity to move indoors. See `entity/minecraft_behavior_move_indoors`. |
| `minecraft:behavior.move_outdoors` | object |  | Allows this entity to move outdoors. See `entity/minecraft_behavior_move_outdoors`. |
| `minecraft:behavior.move_through_village` | object |  | Dynamic value See `entity/minecraft_behavior_move_through_village`. |
| `minecraft:behavior.move_to_block` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_block`. |
| `minecraft:behavior.move_to_land` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_land`. |
| `minecraft:behavior.move_to_lava` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_lava`. |
| `minecraft:behavior.move_to_liquid` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_liquid`. |
| `minecraft:behavior.move_to_poi` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_poi`. |
| `minecraft:behavior.move_to_random_block` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_random_block`. |
| `minecraft:behavior.move_to_village` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_village`. |
| `minecraft:behavior.move_to_water` | object |  | Dynamic value See `entity/minecraft_behavior_move_to_water`. |
| `minecraft:behavior.move_towards_dwelling_restriction` | object |  | Allows entities with the "minecraft:dweller" component to move toward their village area that the entity should be restricted to. See `entity/minecraft_behavior_move_towards_dwelling_restriction`. |
| `minecraft:behavior.move_towards_home_restriction` | object |  | Allows entities with a "minecraft:home" component to move towards their home position. If "restriction_radius" is set, entities will be able to run this behavior only if outside of it. See `entity/minecraft_behavior_move_towards_home_restriction`. |
| `minecraft:behavior.move_towards_target` | object |  | Dynamic value See `entity/minecraft_behavior_move_towards_target`. |
| `minecraft:behavior.nap` | object |  | Dynamic value See `entity/minecraft_behavior_nap`. |
| `minecraft:behavior.nearest_attackable_target` | object |  | Dynamic value See `entity/minecraft_behavior_nearest_attackable_target`. |
| `minecraft:behavior.nearest_prioritized_attackable_target` | object |  | Dynamic value See `entity/minecraft_behavior_nearest_prioritized_attackable_target`. |
| `minecraft:behavior.ocelot_sit_on_block` | object |  | Dynamic value See `entity/minecraft_behavior_ocelot_sit_on_block`. |
| `minecraft:behavior.ocelotattack` | object |  | Controls specific attack behavior for Ocelots. See `entity/minecraft_behavior_ocelotattack`. |
| `minecraft:behavior.offer_flower` | object |  | Allows the mob to offer a flower to another mob with the minecraft:take_flower behavior. See `entity/minecraft_behavior_offer_flower`. |
| `minecraft:behavior.open_door` | object |  | Dynamic value See `entity/minecraft_behavior_open_door`. |
| `minecraft:behavior.owner_hurt_by_target` | object |  | Dynamic value See `entity/minecraft_behavior_owner_hurt_by_target`. |
| `minecraft:behavior.owner_hurt_target` | object |  | Dynamic value See `entity/minecraft_behavior_owner_hurt_target`. |
| `minecraft:behavior.panic` | object |  | Dynamic value See `entity/minecraft_behavior_panic`. |
| `minecraft:behavior.pet_sleep_with_owner` | object |  | Dynamic value See `entity/minecraft_behavior_pet_sleep_with_owner`. |
| `minecraft:behavior.pickup_items` | object |  | Dynamic value See `entity/minecraft_behavior_pickup_items`. |
| `minecraft:behavior.place_block` | object |  | Allows the entity to place a block. See `entity/minecraft_behavior_place_block`. |
| `minecraft:behavior.play` | object |  | Allows the mob to offer a flower to another mob with the minecraft:take_flower behavior. See `entity/minecraft_behavior_play`. |
| `minecraft:behavior.play_dead` | object |  | Allows this entity to pretend to be dead to avoid being targeted by attackers. See `entity/minecraft_behavior_play_dead`. |
| `minecraft:behavior.player_ride_tamed` | object |  | Dynamic value See `entity/minecraft_behavior_player_ride_tamed`. |
| `minecraft:behavior.raid_garden` | object |  | Dynamic value See `entity/minecraft_behavior_raid_garden`. |
| `minecraft:behavior.ram_attack` | object |  | Allows this entity to damage a target by using a running attack. See `entity/minecraft_behavior_ram_attack`. |
| `minecraft:behavior.random_breach` | object |  | Dynamic value See `entity/minecraft_behavior_random_breach`. |
| `minecraft:behavior.random_fly` | object |  | Dynamic value See `entity/minecraft_behavior_random_fly`. |
| `minecraft:behavior.random_hover` | object |  | Dynamic value See `entity/minecraft_behavior_random_hover`. |
| `minecraft:behavior.random_look_around` | object |  | Dynamic value See `entity/minecraft_behavior_random_look_around`. |
| `minecraft:behavior.random_look_around_and_sit` | object |  | Dynamic value See `entity/minecraft_behavior_random_look_around_and_sit`. |
| `minecraft:behavior.random_search_and_dig` | object |  | Allows this entity to locate a random target block that it can path find to. Once found, the entity will move towards it and dig up an item. [Default target block types: Dirt, Grass, Podzol, DirtWithRoots, MossBlock, Mud, MuddyMangroveRoots]. See `entity/minecraft_behavior_random_search_and_dig`. |
| `minecraft:behavior.random_sitting` | object |  | Dynamic value See `entity/minecraft_behavior_random_sitting`. |
| `minecraft:behavior.random_stroll` | object |  | Dynamic value See `entity/minecraft_behavior_random_stroll`. |
| `minecraft:behavior.random_swim` | object |  | Dynamic value See `entity/minecraft_behavior_random_swim`. |
| `minecraft:behavior.ranged_attack` | object |  | Allows an entity to attack by using ranged shots. "charge_shoot_trigger" must be greater than 0 to enable charged up burst-shot attacks. Requires minecraft:shooter to define projectile behaviour. See `entity/minecraft_behavior_ranged_attack`. |
| `minecraft:behavior.receive_love` | object |  | Dynamic value See `entity/minecraft_behavior_receive_love`. |
| `minecraft:behavior.restrict_open_door` | object |  | Dynamic value See `entity/minecraft_behavior_restrict_open_door`. |
| `minecraft:behavior.restrict_sun` | object |  | Dynamic value See `entity/minecraft_behavior_restrict_sun`. |
| `minecraft:behavior.rise_to_liquid_level` | object |  | Dynamic value See `entity/minecraft_behavior_rise_to_liquid_level`. |
| `minecraft:behavior.roar` | object |  | Allows this entity to roar at another entity based on data in minecraft:anger_level. Once the anger threshold specified in minecraft:anger_level has been reached, this entity will roar for the specified amount of time, look at the other entity, apply anger bo… See `entity/minecraft_behavior_roar`. |
| `minecraft:behavior.roll` | object |  | Dynamic value See `entity/minecraft_behavior_roll`. |
| `minecraft:behavior.run_around_like_crazy` | object |  | Dynamic value See `entity/minecraft_behavior_run_around_like_crazy`. |
| `minecraft:behavior.scared` | object |  | Dynamic value See `entity/minecraft_behavior_scared`. |
| `minecraft:behavior.send_event` | object |  | Dynamic value See `entity/minecraft_behavior_send_event`. |
| `minecraft:behavior.share_items` | object |  | Dynamic value See `entity/minecraft_behavior_share_items`. |
| `minecraft:behavior.silverfish_merge_with_stone` | object |  | Dynamic value See `entity/minecraft_behavior_silverfish_merge_with_stone`. |
| `minecraft:behavior.silverfish_wake_up_friends` | object |  | Dynamic value See `entity/minecraft_behavior_silverfish_wake_up_friends`. |
| `minecraft:behavior.skeleton_horse_trap` | object |  | Dynamic value See `entity/minecraft_behavior_skeleton_horse_trap`. |
| `minecraft:behavior.sleep` | object |  | Dynamic value See `entity/minecraft_behavior_sleep`. |
| `minecraft:behavior.slime_attack` | object |  | Causes the entity to grow tired every once in a while, while attacking. See `entity/minecraft_behavior_slime_attack`. |
| `minecraft:behavior.slime_float` | object |  | Allow slimes to float in water / lava. Can only be used by Slime and Magma Cubes. See `entity/minecraft_behavior_slime_float`. |
| `minecraft:behavior.slime_keep_on_jumping` | object |  | Allows the entity to continuously jump around like a slime. See `entity/minecraft_behavior_slime_keep_on_jumping`. |
| `minecraft:behavior.slime_random_direction` | object |  | Allows the entity to move in random directions like a slime. See `entity/minecraft_behavior_slime_random_direction`. |
| `minecraft:behavior.snacking` | object |  | Dynamic value See `entity/minecraft_behavior_snacking`. |
| `minecraft:behavior.sneeze` | object |  | Dynamic value See `entity/minecraft_behavior_sneeze`. |
| `minecraft:behavior.sniff` | object |  | Allows this entity to detect the nearest player within "sniffing_radius" and update its "minecraft:suspect_tracking" component state See `entity/minecraft_behavior_sniff`. |
| `minecraft:behavior.sonic_boom` | object |  | Allows this entity to perform a 'sonic boom' ranged attack See `entity/minecraft_behavior_sonic_boom`. |
| `minecraft:behavior.squid_dive` | object |  | Dynamic value See `entity/minecraft_behavior_squid_dive`. |
| `minecraft:behavior.squid_flee` | object |  | Dynamic value See `entity/minecraft_behavior_squid_flee`. |
| `minecraft:behavior.squid_idle` | object |  | Dynamic value See `entity/minecraft_behavior_squid_idle`. |
| `minecraft:behavior.squid_move_away_from_ground` | object |  | Dynamic value See `entity/minecraft_behavior_squid_move_away_from_ground`. |
| `minecraft:behavior.squid_out_of_water` | object |  | Dynamic value See `entity/minecraft_behavior_squid_out_of_water`. |
| `minecraft:behavior.stalk_and_pounce_on_target` | object |  | Dynamic value See `entity/minecraft_behavior_stalk_and_pounce_on_target`. |
| `minecraft:behavior.stay_near_noteblock` | object |  | The entity will attempt to toss the items from its inventory to a nearby recently played noteblock. See `entity/minecraft_behavior_stay_near_noteblock`. |
| `minecraft:behavior.stay_while_sitting` | object |  | Dynamic value See `entity/minecraft_behavior_stay_while_sitting`. |
| `minecraft:behavior.stomp_attack` | object |  | Allows an entity to attack using stomp AoE damage behavior. See `entity/minecraft_behavior_stomp_attack`. |
| `minecraft:behavior.stomp_turtle_egg` | object |  | Dynamic value See `entity/minecraft_behavior_stomp_turtle_egg`. |
| `minecraft:behavior.stroll_towards_village` | object |  | Dynamic value See `entity/minecraft_behavior_stroll_towards_village`. |
| `minecraft:behavior.summon_entity` | object |  | Dynamic value See `entity/minecraft_behavior_summon_entity`. |
| `minecraft:behavior.swell` | object |  | Dynamic value See `entity/minecraft_behavior_swell`. |
| `minecraft:behavior.swim_idle` | object |  | Allows the entity go idle, if swimming. Entity must be in water. See `entity/minecraft_behavior_swim_idle`. |
| `minecraft:behavior.swim_up_for_breath` | object |  | Allows the mob to try to move to air once it is close to running out of its total breathable supply. Requires "minecraft:breathable". See `entity/minecraft_behavior_swim_up_for_breath`. |
| `minecraft:behavior.swim_wander` | object |  | Allows the entity to wander around while swimming, when not path-finding. See `entity/minecraft_behavior_swim_wander`. |
| `minecraft:behavior.swim_with_entity` | object |  | Allows this entity to locate a random target block that it can path find to. Once found, the entity will move towards it and dig up an item. [Default target block types: Dirt, Grass, Podzol, DirtWithRoots, MossBlock, Mud, MuddyMangroveRoots]. See `entity/minecraft_behavior_swim_with_entity`. |
| `minecraft:behavior.swoop_attack` | object |  | Allows an entity to attack using swoop attack behavior; Ideal for use with flying mobs. The behavior ends if the entity has a horizontal collision or gets hit. See `entity/minecraft_behavior_swoop_attack`. |
| `minecraft:behavior.take_block` | object |  | Allows the entity to take a block from the world and carry it around. See `entity/minecraft_behavior_take_block`. |
| `minecraft:behavior.take_flower` | object |  | Allows the mob to accept flowers from another mob with the minecraft:offer_flower behavior. See `entity/minecraft_behavior_take_flower`. |
| `minecraft:behavior.target_when_pushed` | object |  | Dynamic value See `entity/minecraft_behavior_target_when_pushed`. |
| `minecraft:behavior.teleport_to_owner` | object |  | Allows an entity to teleport to its owner. See `entity/minecraft_behavior_teleport_to_owner`. |
| `minecraft:behavior.tempt` | object |  | Dynamic value See `entity/minecraft_behavior_tempt`. |
| `minecraft:behavior.timer_flag_1` | object |  | Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_1 will return 1.0 on both the client and server when … See `entity/minecraft_behavior_timer_flag_1`. |
| `minecraft:behavior.timer_flag_2` | object |  | Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_2 will return 1.0 on both the client and server when … See `entity/minecraft_behavior_timer_flag_2`. |
| `minecraft:behavior.timer_flag_3` | object |  | Fires an event when this behavior starts, then waits for a duration before stopping. When stopping due to that timeout or due to being interrupted by another behavior, fires another event. query.timer_flag_3 will return 1.0 on both the client and server when … See `entity/minecraft_behavior_timer_flag_3`. |
| `minecraft:behavior.trade_interest` | object |  | Dynamic value See `entity/minecraft_behavior_trade_interest`. |
| `minecraft:behavior.trade_with_player` | object |  | Allows the player to trade with this mob. When the goal starts, it will stop the mob's navigation. See `entity/minecraft_behavior_trade_with_player`. |
| `minecraft:behavior.transport_items` | object |  | A behavior that enables a mob to transport items from and to containers. See `entity/minecraft_behavior_transport_items`. |
| `minecraft:behavior.use_kinetic_weapon` | object |  | Enables a mob to use kinetic weaponry by intermittently charging at its target and repositioning afterward. See `entity/minecraft_behavior_use_kinetic_weapon`. |
| `minecraft:behavior.vex_copy_owner_target` | object |  | Dynamic value See `entity/minecraft_behavior_vex_copy_owner_target`. |
| `minecraft:behavior.vex_random_move` | object |  | Dynamic value See `entity/minecraft_behavior_vex_random_move`. |
| `minecraft:behavior.wither_random_attack_pos_goal` | object |  | Dynamic value See `entity/minecraft_behavior_wither_random_attack_pos_goal`. |
| `minecraft:behavior.wither_target_highest_damage` | object |  | Dynamic value See `entity/minecraft_behavior_wither_target_highest_damage`. |
| `minecraft:behavior.work` | object |  | Allows the NPC to use the POI See `entity/minecraft_behavior_work`. |
| `minecraft:behavior.work_composter` | object |  | Allows the NPC to use the composter POI to convert excess seeds into bone meal. See `entity/minecraft_behavior_work_composter`. |
| `minecraft:block_climber` | object |  | Dynamic value See `entity/minecraft_block_climber`. |
| `minecraft:block_movement_slowdown_immunity` | object |  | Prevents specified blocks from contributing to this entity's block movement slowdown. It does not cause other blocks to apply slowdown. See `entity/minecraft_block_movement_slowdown_immunity`. |
| `minecraft:block_sensor` | object |  | Dynamic value See `entity/minecraft_block_sensor`. |
| `minecraft:body_rotation_always_follows_head` | object |  | Dynamic value See `entity/minecraft_body_rotation_always_follows_head`. |
| `minecraft:body_rotation_blocked` | object |  | Dynamic value See `entity/minecraft_body_rotation_blocked`. |
| `minecraft:boostable` | object |  | Dynamic value See `entity/minecraft_boostable`. |
| `minecraft:boss` | object |  | Dynamic value See `entity/minecraft_boss`. |
| `minecraft:bounciness` | object |  | Dynamic value |
| `minecraft:break_blocks` | object |  | Dynamic value See `entity/minecraft_break_blocks`. |
| `minecraft:breathable` | object |  | Dynamic value See `entity/minecraft_breathable`. |
| `minecraft:breedable` | object |  | Dynamic value See `entity/minecraft_breedable`. |
| `minecraft:bribeable` | object |  | Dynamic value See `entity/minecraft_bribeable`. |
| `minecraft:bucketable` | object |  | Dynamic value See `entity/minecraft_bucketable`. |
| `minecraft:buoyant` | object |  | Dynamic value See `entity/minecraft_buoyant`. |
| `minecraft:burns_in_daylight` | object |  | Dynamic value See `entity/minecraft_burns_in_daylight`. |
| `minecraft:can_climb` | object |  | Dynamic value See `entity/minecraft_can_climb`. |
| `minecraft:can_fly` | object |  | Dynamic value See `entity/minecraft_can_fly`. |
| `minecraft:can_join_raid` | object |  | Dynamic value See `entity/minecraft_can_join_raid`. |
| `minecraft:can_power_jump` | object |  | Dynamic value See `entity/minecraft_can_power_jump`. |
| `minecraft:can_stand_on_powder_snow` | object |  | Defines whether an entity can stand on powder snow without sinking. |
| `minecraft:cannot_be_attacked` | object |  | Dynamic value See `entity/minecraft_cannot_be_attacked`. |
| `minecraft:celebrate_hunt` | object |  | Dynamic value See `entity/minecraft_celebrate_hunt`. |
| `minecraft:collision_box` | object |  | Dynamic value See `entity/minecraft_collision_box`. |
| `minecraft:color` | object |  | Dynamic value See `entity/minecraft_color`. |
| `minecraft:color2` | object |  | Dynamic value See `entity/minecraft_color2`. |
| `minecraft:combat_regeneration` | object |  | Dynamic value See `entity/minecraft_combat_regeneration`. |
| `minecraft:conditional_bandwidth_optimization` | object |  | Dynamic value See `entity/minecraft_conditional_bandwidth_optimization`. |
| `minecraft:custom_hit_test` | object |  | Dynamic value See `entity/minecraft_custom_hit_test`. |
| `minecraft:damage_over_time` | object |  | Dynamic value See `entity/minecraft_damage_over_time`. |
| `minecraft:damage_sensor` | object |  | Dynamic value See `entity/minecraft_damage_sensor`. |
| `minecraft:dash_action` | object |  | Dynamic value |
| `minecraft:default_look_angle` | object |  | Dynamic value See `entity/minecraft_default_look_angle`. |
| `minecraft:despawn` | object |  | Dynamic value See `entity/minecraft_despawn`. |
| `minecraft:dimension_bound` | object |  | Dynamic value See `entity/minecraft_dimension_bound`. |
| `minecraft:drying_out_timer` | object |  | Dynamic value See `entity/minecraft_drying_out_timer`. |
| `minecraft:dweller` | object |  | Dynamic value See `entity/minecraft_dweller`. |
| `minecraft:economy_trade_table` | object |  | Dynamic value See `entity/minecraft_economy_trade_table`. |
| `minecraft:entity_armor_equipment_slot_mapping` | object |  | Dynamic value See `entity/minecraft_entity_armor_equipment_slot_mapping`. |
| `minecraft:entity_sensor` | object |  | Dynamic value See `entity/minecraft_entity_sensor`. |
| `minecraft:environment_sensor` | object |  | Dynamic value See `entity/minecraft_environment_sensor`. |
| `minecraft:equip_item` | object |  | Dynamic value See `entity/minecraft_equip_item`. |
| `minecraft:equipment` | object |  | Dynamic value See `entity/minecraft_equipment`. |
| `minecraft:equippable` | object |  | Dynamic value See `entity/minecraft_equippable`. |
| `minecraft:exhaustion_values` | object |  | Dynamic value See `entity/minecraft_exhaustion_values`. |
| `minecraft:experience_reward` | object |  | Dynamic value See `entity/minecraft_experience_reward`. |
| `minecraft:explode` | object |  | Dynamic value See `entity/minecraft_explode`. |
| `minecraft:fire_immune` | object |  | Sets that this entity doesn't take damage from fire. Can be an empty object {} or boolean true. See `entity/minecraft_fire_immune`. |
| `minecraft:floats_in_liquid` | object |  | Dynamic value See `entity/minecraft_floats_in_liquid`. |
| `minecraft:flocking` | object |  | Dynamic value See `entity/minecraft_flocking`. |
| `minecraft:flying_speed` | object |  | Dynamic value See `entity/minecraft_flying_speed`. |
| `minecraft:follow_range` | object |  | Dynamic value See `entity/minecraft_follow_range`. |
| `minecraft:free_camera_controlled` | object |  | Dynamic value |
| `minecraft:freezing_immune` | object |  | Defines whether an entity should be affected by freezing. |
| `minecraft:freezing_vulnerable` | object |  | Defines whether an entity should take increased damage from freezing. |
| `minecraft:friction_modifier` | object |  | Dynamic value See `entity/minecraft_friction_modifier`. |
| `minecraft:game_event_movement_tracking` | object |  | Dynamic value See `entity/minecraft_game_event_movement_tracking`. |
| `minecraft:genetics` | object |  | Dynamic value See `entity/minecraft_genetics`. |
| `minecraft:giveable` | object |  | Dynamic value See `entity/minecraft_giveable`. |
| `minecraft:ground_offset` | object |  | Dynamic value See `entity/minecraft_ground_offset`. |
| `minecraft:group_size` | object |  | Dynamic value See `entity/minecraft_group_size`. |
| `minecraft:grows_crop` | object |  | Dynamic value See `entity/minecraft_grows_crop`. |
| `minecraft:healable` | object |  | Dynamic value See `entity/minecraft_healable`. |
| `minecraft:health` | object |  | Dynamic value See `entity/minecraft_health`. |
| `minecraft:heartbeat` | object |  | Dynamic value See `entity/minecraft_heartbeat`. |
| `minecraft:hide` | object |  | Dynamic value See `entity/minecraft_hide`. |
| `minecraft:home` | object |  | Dynamic value See `entity/minecraft_home`. |
| `minecraft:horse.jump_strength` | object |  | Dynamic value See `entity/minecraft_horse_jump_strength`. |
| `minecraft:hurt_on_condition` | object |  | Dynamic value See `entity/minecraft_hurt_on_condition`. |
| `minecraft:ignore_cannot_be_attacked` | object |  | Dynamic value See `entity/minecraft_ignore_cannot_be_attacked`. |
| `minecraft:input_ground_controlled` | object |  | Dynamic value See `entity/minecraft_input_ground_controlled`. |
| `minecraft:inside_block_notifier` | object |  | Dynamic value See `entity/minecraft_inside_block_notifier`. |
| `minecraft:insomnia` | object |  | Dynamic value See `entity/minecraft_insomnia`. |
| `minecraft:instant_despawn` | object |  | Dynamic value See `entity/minecraft_instant_despawn`. |
| `minecraft:interact` | object |  | Dynamic value See `entity/minecraft_interact`. |
| `minecraft:inventory` | object |  | Dynamic value See `entity/minecraft_inventory`. |
| `minecraft:is_baby` | object |  | Dynamic value See `entity/minecraft_is_baby`. |
| `minecraft:is_charged` | object |  | Dynamic value See `entity/minecraft_is_charged`. |
| `minecraft:is_chested` | object |  | Dynamic value See `entity/minecraft_is_chested`. |
| `minecraft:is_collidable` | object |  | Dynamic value See `entity/minecraft_is_collidable`. |
| `minecraft:is_dyeable` | object |  | Dynamic value See `entity/minecraft_is_dyeable`. |
| `minecraft:is_hidden_when_invisible` | object |  | Dynamic value See `entity/minecraft_is_hidden_when_invisible`. |
| `minecraft:is_ignited` | object |  | Dynamic value See `entity/minecraft_is_ignited`. |
| `minecraft:is_illager_captain` | object |  | Dynamic value See `entity/minecraft_is_illager_captain`. |
| `minecraft:is_pregnant` | object |  | Dynamic value See `entity/minecraft_is_pregnant`. |
| `minecraft:is_saddled` | object |  | Dynamic value See `entity/minecraft_is_saddled`. |
| `minecraft:is_shaking` | object |  | Dynamic value See `entity/minecraft_is_shaking`. |
| `minecraft:is_sheared` | object |  | Dynamic value See `entity/minecraft_is_sheared`. |
| `minecraft:is_stackable` | object |  | Dynamic value See `entity/minecraft_is_stackable`. |
| `minecraft:is_stunned` | object |  | Dynamic value See `entity/minecraft_is_stunned`. |
| `minecraft:is_tamed` | object |  | Dynamic value See `entity/minecraft_is_tamed`. |
| `minecraft:item_controllable` | object |  | Dynamic value See `entity/minecraft_item_controllable`. |
| `minecraft:item_hopper` | object |  | Dynamic value See `entity/minecraft_item_hopper`. |
| `minecraft:jump.dynamic` | object |  | Dynamic value See `entity/minecraft_jump_dynamic`. |
| `minecraft:jump.static` | object |  | Dynamic value See `entity/minecraft_jump_static`. |
| `minecraft:knockback_resistance` | object |  | Dynamic value See `entity/minecraft_knockback_resistance`. |
| `minecraft:lava_movement` | object |  | Dynamic value See `entity/minecraft_lava_movement`. |
| `minecraft:leashable` | object |  | Dynamic value See `entity/minecraft_leashable`. |
| `minecraft:leashable_to` | object |  | Dynamic value See `entity/minecraft_leashable_to`. |
| `minecraft:looked_at` | object |  | Dynamic value See `entity/minecraft_looked_at`. |
| `minecraft:loot` | object |  | Dynamic value See `entity/minecraft_loot`. |
| `minecraft:luck` | object |  | Dynamic value See `entity/minecraft_luck`. |
| `minecraft:managed_wandering_trader` | object |  | Dynamic value See `entity/minecraft_managed_wandering_trader`. |
| `minecraft:mark_variant` | object |  | Dynamic value See `entity/minecraft_mark_variant`. |
| `minecraft:memory_behavior.flee_threat` | object |  | Dynamic value |
| `minecraft:memory_behavior.follow_target` | object |  | Dynamic value |
| `minecraft:memory_sensor.game_event` | object |  | Game Event Minecraft Memory Sensor |
| `minecraft:memory_sensor.in_range_of_entity` | object |  | Dynamic value |
| `minecraft:mob_effect` | object |  | Dynamic value See `entity/minecraft_mob_effect`. |
| `minecraft:mob_effect_immunity` | object |  | Dynamic value See `entity/minecraft_mob_effect_immunity`. |
| `minecraft:movement` | object |  | Dynamic value See `entity/minecraft_movement`. |
| `minecraft:movement.amphibious` | object |  | Dynamic value See `entity/minecraft_movement_amphibious`. |
| `minecraft:movement.basic` | object |  | Dynamic value See `entity/minecraft_movement_basic`. |
| `minecraft:movement.dolphin` | object |  | Dynamic value See `entity/minecraft_movement_dolphin`. |
| `minecraft:movement.fly` | object |  | Dynamic value See `entity/minecraft_movement_fly`. |
| `minecraft:movement.generic` | object |  | Dynamic value See `entity/minecraft_movement_generic`. |
| `minecraft:movement.glide` | object |  | Dynamic value See `entity/minecraft_movement_glide`. |
| `minecraft:movement.hover` | object |  | Dynamic value See `entity/minecraft_movement_hover`. |
| `minecraft:movement.jump` | object |  | Dynamic value See `entity/minecraft_movement_jump`. |
| `minecraft:movement.skip` | object |  | Dynamic value See `entity/minecraft_movement_skip`. |
| `minecraft:movement.sway` | object |  | Dynamic value See `entity/minecraft_movement_sway`. |
| `minecraft:movement_sound_distance_offset` | object |  | Dynamic value See `entity/minecraft_movement_sound_distance_offset`. |
| `minecraft:nameable` | object |  | Dynamic value See `entity/minecraft_nameable`. |
| `minecraft:navigation.climb` | object |  | Dynamic value See `entity/minecraft_navigation_climb`. |
| `minecraft:navigation.float` | object |  | Dynamic value See `entity/minecraft_navigation_float`. |
| `minecraft:navigation.fly` | object |  | Dynamic value See `entity/minecraft_navigation_fly`. |
| `minecraft:navigation.generic` | object |  | Dynamic value See `entity/minecraft_navigation_generic`. |
| `minecraft:navigation.hover` | object |  | Dynamic value See `entity/minecraft_navigation_hover`. |
| `minecraft:navigation.swim` | object |  | Dynamic value See `entity/minecraft_navigation_swim`. |
| `minecraft:navigation.walk` | object |  | Dynamic value See `entity/minecraft_navigation_walk`. |
| `minecraft:not_pickable_from_inside` | object |  | Minecraft Not Pickable From Inside |
| `minecraft:npc` | object |  | Dynamic value See `entity/minecraft_npc`. |
| `minecraft:offspring` | object |  | Dynamic value |
| `minecraft:on_death` | object |  | Dynamic value See `entity/minecraft_on_death`. |
| `minecraft:on_equipment_changed` | object |  | Allows to specify events to execute when equipment is set in the entity's default equipment slots. Doesn't apply to "minecraft:inventory", use "minecraft:equippable" instead. See `entity/minecraft_on_equipment_changed`. |
| `minecraft:on_friendly_anger` | object |  | Dynamic value See `entity/minecraft_on_friendly_anger`. |
| `minecraft:on_hurt` | object |  | Dynamic value See `entity/minecraft_on_hurt`. |
| `minecraft:on_hurt_by_player` | object |  | Dynamic value See `entity/minecraft_on_hurt_by_player`. |
| `minecraft:on_ignite` | object |  | Dynamic value See `entity/minecraft_on_ignite`. |
| `minecraft:on_start_landing` | object |  | Dynamic value See `entity/minecraft_on_start_landing`. |
| `minecraft:on_start_takeoff` | object |  | Dynamic value See `entity/minecraft_on_start_takeoff`. |
| `minecraft:on_target_acquired` | object |  | Dynamic value See `entity/minecraft_on_target_acquired`. |
| `minecraft:on_target_escape` | object |  | Dynamic value See `entity/minecraft_on_target_escape`. |
| `minecraft:on_wake_with_owner` | object |  | Dynamic value See `entity/minecraft_on_wake_with_owner`. |
| `minecraft:out_of_control` | object |  | Dynamic value See `entity/minecraft_out_of_control`. |
| `minecraft:peek` | object |  | Dynamic value See `entity/minecraft_peek`. |
| `minecraft:persistent` | object |  | Dynamic value See `entity/minecraft_persistent`. |
| `minecraft:physics` | object |  | Dynamic value See `entity/minecraft_physics`. |
| `minecraft:player.exhaustion` | object |  | Dynamic value See `entity/minecraft_player_exhaustion`. |
| `minecraft:player.experience` | object |  | Dynamic value See `entity/minecraft_player_experience`. |
| `minecraft:player.hunger` | object |  | Dynamic value See `entity/minecraft_player_hunger`. |
| `minecraft:player.level` | object |  | Dynamic value See `entity/minecraft_player_level`. |
| `minecraft:player.saturation` | object |  | Dynamic value See `entity/minecraft_player_saturation`. |
| `minecraft:preferred_path` | object |  | Dynamic value See `entity/minecraft_preferred_path`. |
| `minecraft:projectile` | object |  | Dynamic value See `entity/minecraft_projectile`. |
| `minecraft:push_through` | object |  | Dynamic value See `entity/minecraft_push_through`. |
| `minecraft:pushable_by_block` | object |  | Dynamic value |
| `minecraft:pushable_by_entity` | object |  | Allows an entity to be pushed by other entities. See `entity/minecraft_pushable_by_entity`. |
| `minecraft:raid_trigger` | object |  | Dynamic value See `entity/minecraft_raid_trigger`. |
| `minecraft:rail_movement` | object |  | Dynamic value See `entity/minecraft_rail_movement`. |
| `minecraft:rail_sensor` | object |  | Dynamic value See `entity/minecraft_rail_sensor`. |
| `minecraft:ravager_blocked` | object |  | Dynamic value See `entity/minecraft_ravager_blocked`. |
| `minecraft:reflect_projectiles` | object |  | Dynamic value See `entity/minecraft_reflect_projectiles`. |
| `minecraft:renders_when_invisible` | object |  | Dynamic value See `entity/minecraft_renders_when_invisible`. |
| `minecraft:rideable` | object |  | Dynamic value See `entity/minecraft_rideable`. |
| `minecraft:rotation_axis_aligned` | object |  | Dynamic value See `entity/minecraft_rotation_axis_aligned`. |
| `minecraft:rotation_locked_to_vehicle` | object |  | Minecraft Rotation Locked To Vehicle |
| `minecraft:scale` | object |  | Dynamic value See `entity/minecraft_scale`. |
| `minecraft:scale_by_age` | object |  | Dynamic value See `entity/minecraft_scale_by_age`. |
| `minecraft:scheduler` | object |  | Dynamic value See `entity/minecraft_scheduler`. |
| `minecraft:shareables` | object |  | Dynamic value See `entity/minecraft_shareables`. |
| `minecraft:shooter` | object |  | Dynamic value See `entity/minecraft_shooter`. |
| `minecraft:sittable` | object |  | Dynamic value See `entity/minecraft_sittable`. |
| `minecraft:skin_id` | object |  | Dynamic value See `entity/minecraft_skin_id`. |
| `minecraft:sound_volume` | object |  | Dynamic value See `entity/minecraft_sound_volume`. |
| `minecraft:spawn_egg_interaction` | object |  | Dynamic value |
| `minecraft:spawn_entity` | object |  | Dynamic value See `entity/minecraft_spawn_entity`. |
| `minecraft:spawn_on_death` | object |  | Component for spawning entities when an entity perishes. See `entity/minecraft_spawn_on_death`. |
| `minecraft:spell_effects` | object |  | Dynamic value See `entity/minecraft_spell_effects`. |
| `minecraft:strength` | object |  | Dynamic value See `entity/minecraft_strength`. |
| `minecraft:suspect_tracking` | object |  | Dynamic value See `entity/minecraft_suspect_tracking`. |
| `minecraft:tameable` | object |  | Dynamic value See `entity/minecraft_tameable`. |
| `minecraft:tamemount` | object |  | Dynamic value See `entity/minecraft_tamemount`. |
| `minecraft:target_nearby_sensor` | object |  | Dynamic value See `entity/minecraft_target_nearby_sensor`. |
| `minecraft:teleport` | object |  | Dynamic value See `entity/minecraft_teleport`. |
| `minecraft:tick_world` | object |  | Defines if the entity ticks the world and the radius around it to tick. See `entity/minecraft_tick_world`. |
| `minecraft:timer` | object |  | Dynamic value See `entity/minecraft_timer`. |
| `minecraft:trade_resupply` | object |  | Dynamic value See `entity/minecraft_trade_resupply`. |
| `minecraft:trade_table` | object |  | Dynamic value See `entity/minecraft_trade_table`. |
| `minecraft:trail` | object |  | Dynamic value See `entity/minecraft_trail`. |
| `minecraft:transformation` | object |  | Dynamic value See `entity/minecraft_transformation`. |
| `minecraft:transient` | object |  | Dynamic value See `entity/minecraft_transient`. |
| `minecraft:trust` | object |  | Dynamic value See `entity/minecraft_trust`. |
| `minecraft:trusting` | object |  | Dynamic value See `entity/minecraft_trusting`. |
| `minecraft:type_family` | object |  | Dynamic value See `entity/minecraft_type_family`. |
| `minecraft:underwater_mount_breathing` | object |  | Dynamic value |
| `minecraft:underwater_movement` | object |  | Dynamic value See `entity/minecraft_underwater_movement`. |
| `minecraft:uses_legacy_ambient_sounds` | object |  | deprecated. Allows the entity to automatically determine which ambient sound to play: \n - `ambient.in.air` when not on the ground \n - `ambient.in.water` when its head is in water \n - `ambient.baby` if it is a baby \n - `ambient` otherwise |
| `minecraft:uses_legacy_friction` | object |  | Minecraft Uses Legacy Friction |
| `minecraft:uses_uniform_air_drag` | object |  | Minecraft Uses Uniform Air Drag |
| `minecraft:variable_max_auto_step` | object |  | Dynamic value See `entity/minecraft_variable_max_auto_step`. |
| `minecraft:variant` | object |  | Dynamic value See `entity/minecraft_variant`. |
| `minecraft:vertical_movement_action` | object |  | Dynamic value |
| `minecraft:vibration_damper` | object |  | Dynamic value See `entity/minecraft_vibration_damper`. |
| `minecraft:vibration_listener` | object |  | Dynamic value See `entity/minecraft_vibration_listener`. |
| `minecraft:walk_animation_speed` | object |  | Dynamic value See `entity/minecraft_walk_animation_speed`. |
| `minecraft:wants_jockey` | object |  | Dynamic value See `entity/minecraft_wants_jockey`. |
| `minecraft:water_movement` | object |  | Dynamic value See `entity/minecraft_water_movement`. |
| `minecraft:wither_target_highest_damage` | object |  | Dynamic value See `entity/minecraft_wither_target_highest_damage`. |
| `minecraft:behavior.follow_target_captain` | object |  | Dynamic value See `entity/minecraft_behavior_follow_target_captain`. |
| `minecraft:dash` | object |  | Dynamic value See `entity/minecraft_dash`. |
| `minecraft:input_air_controlled` | object |  | Dynamic value See `entity/minecraft_input_air_controlled`. |
| `minecraft:pushable` | object |  | Dynamic value See `entity/minecraft_pushable`. |

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

A single condition test used in entity filters to evaluate entity state or environment. Tests check properties like health level, time of day, biome type, or nearby entities. Combine tests with AND/OR logic to create complex conditions that control when events fire, which targets are valid, or when behaviors activate.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | object |  | The domain the test should be performed in. |
| `operator` | object |  | The comparison to apply with 'value'. |
| `subject` | object |  | The subject of this filter test. |
| `test` | string |  | **required**. The name of the test to apply. |
| `value` | object |  | The value being compared with the test. |

### FloatRange (floatrange)

Specifies a minimum and maximum numeric range for randomized values. Used throughout entity components for variable timing, distances, and quantities—like random attack cooldowns, spawn heights, or movement speeds. The game picks a random value within the range each time the property is evaluated.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | float | `0` | Max |
| `min` | float | `0` | Min |

### FreezeOnHitSubcomponentDefinition (freezeonhitsubcomponentdefinition)

Freezes nearby water blocks to ice in a configurable volume around the impact (Education Edition chemistry feature).

| Field | Type | Default | Notes |
|---|---|---|---|
| `shape` | stringEnum | `"cube"` | Shape of the freezing volume. Allowed values: `cube`, `sphere`. Values: `cube`, `sphere`. |
| `size` | float | `0` | Half-extent of the freezing volume (in blocks). |
| `snap_to_block` | boolean | `false` | If `true`, the freezing volume is centered on the hit block's center instead of the precise impact point. |

### GrantXPSubcomponentDefinition (grantxpsubcomponentdefinition)

Drops experience orbs at the impact location.

| Field | Type | Default | Notes |
|---|---|---|---|
| `maxXP` | int | `0` | Maximum amount of experience to drop. |
| `minXP` | int | `0` | Minimum amount of experience to drop. |

### HurtOwnerSubcomponentDefinition (hurtownersubcomponentdefinition)

Damages the projectile's owner when the projectile lands.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ignite` | boolean | `false` | If `true`, the damage sets the owner on fire. |
| `knockback` | boolean | `false` | If `true`, the damage applies knockback to the owner. |
| `owner_damage` | float | `0` | Amount of damage to deal to the owner. |

### ImpactDamageSubcomponentDefinition (impactdamagesubcomponentdefinition)

Deals damage to the entity that was hit and optionally applies knockback, fire, channeling, and critical-hit scaling.

| Field | Type | Default | Notes |
|---|---|---|---|
| `apply_knockback_to_blocking_targets` | boolean | `false` | If `true`, knockback is still applied to targets that successfully blocked the hit. |
| `catch_fire` | boolean | `false` | If `true`, the entity hit is set on fire (uses the projectile's `on_fire_time`). |
| `ceil_pre_critical_damage` | boolean | `false` | If `true`, rounds the projectile's damage up to the next integer before the critical-hit multiplier is applied. |
| `channeling` | boolean | `false` | If `true`, the projectile can call down a lightning bolt on the entity hit during a thunderstorm. |
| `damage` | object | `{"max":0,"min":0}` | Range of damage to apply on impact. A random value in `[min, max]` is rolled per hit and the velocity-scaled `power_multiplier` term is added to it to define the projectile's base damage. See `legacy/floatrange`. |
| `destroy_on_hit` | boolean | `false` | If `true`, the projectile is removed when it deals damage to an entity. |
| `destroy_on_hit_requires_damage` | boolean | `true` | If `true`, `destroy_on_hit` only triggers when at least one point of damage is actually dealt (targets that fully absorb damage will not destroy the projectile). |
| `difficulty_randomization` | stringEnum | `"none"` | Controls how world difficulty contributes to the rolled damage. `none` ignores difficulty, `additive` adds a difficulty-driven term on top of the base damage, and `multiplicative` folds the difficulty term into `power_multiplier` before scaling by velocity. Values: `additive`, `multiplicative`, `none`. |
| `filter` | string | `""` | Entity family or type that the projectile is restricted to damaging. Entities outside the filter are not damaged. |
| `knockback` | boolean | `false` | If `true`, the entity hit is knocked back away from the projectile. |
| `max_critical_damage` | int | `2147483647` | If specified, sets the maximum damage after critical damage has been applied. Enchantments have already been applied at this point, so this clamps the final damage value of critical hits. |
| `min_critical_damage` | int | `0` | If specified, sets the minimum damage after critical damage has been applied. Enchantments have already been applied at this point, so this clamps the final damage value of critical hits. |
| `power_multiplier` | float | `0` | Multiplied by the projectile's velocity and added to the rolled `damage` to define the projectile's base damage, so it can be used on its own to scale damage by the projectile's velocity. |
| `set_last_hurt_requires_damage` | boolean | `true` | If `true`, the projectile only registers as the last hurt-by source on the target when at least one point of damage is actually dealt. |

### instance (instance)

Defines a single entity instance entry used in documentation and tooling.

| Field | Type | Default | Notes |
|---|---|---|---|
| `fallDistance` | float |  | Current max fall distance of the entity |
| `fire` | int |  | Fire time |
| `air` | int |  | Air time |
| `attackTime` | int |  | Attack time |
| `hurtTime` | int |  | Hurt time |
| `invulnerable` | int | `0` | Invulnerable time |
| `bodyRot` | float |  | Body Rotation |
| `dead` | intBoolean | `false` | Dead |
| `deathTime` | int |  | Death Time |
| `inventoryVersion` | string |  | Inventory version |
| `isAngry` | intBoolean | `0` | Whether an entity is angry |
| `isAutonomous` | intBoolean | `0` | Entity is autonomous |
| `isBaby` | intBoolean | `0` | Entity is a baby |
| `isEating` | intBoolean | `0` | Entity is eating |
| `isGliding` | intBoolean | `0` | Entity is gliding |
| `isGlobal` | intBoolean | `0` | Entity is global |
| `isIllagerCaptain` | intBoolean | `0` | Entity is an illager captain |
| `isOrphaned` | intBoolean | `0` | Entity is orphaned |
| `isPregnant` | intBoolean | `0` | Entity is pregnant |
| `isOutOfControl` | intBoolean | `0` | Entity is out of control |
| `isRoaring` | intBoolean | `0` | Entity is roaring |
| `isScared` | intBoolean | `0` | Entity is scared |
| `isStunned` | intBoolean | `0` | Entity is stunned |
| `isSwimming` | intBoolean | `0` | Entity is swimming |
| `isTamed` | intBoolean | `0` | Entity is tamed |
| `isTrusting` | intBoolean | `0` | Entity is trusting |
| `lastDimensionId` | int | `0` | Last dimension ID |
| `leasherId` | long | `0` | Leasher ID |
| `lootDropped` | int | `0` | Whether loot was dropped |
| `markVariant` | int | `0` | Last dimension ID |
| `naturalSpawn` | intBoolean | `0` | Natural spawn |
| `onGround` | intBoolean | `0` | Entity is on ground |
| `persistent` | intBoolean | `0` | Persistent |
| `motion` | float |  | Motion |
| `ownerNew` | long | `0` | Owner New |
| `portalCooldown` | int | `0` | Portal Cooldown |
| `breedCooldown` | int | `0` | Breed Cooldown |
| `inLove` | int | `0` | In Love |
| `loveCause` | long | `0` | Love Cause |
| `saddled` | intBoolean | `0` | Saddled |
| `sheared` | intBoolean | `0` | Sheared |
| `showBottom` | intBoolean | `0` | Show bottom |
| `sitting` | intBoolean | `0` | Sitting |
| `skinId` | int | `0` | Skin ID |
| `strength` | int | `0` | Strength |
| `strengthMax` | int | `0` | Max Strength |
| `surface` | intBoolean | `0` | Surface |
| `targetId` | long | `0` | Target Id |
| `temper` | int | `0` | Temper |
| `tradeExperience` | int | `0` | Trade Experience |
| `tradeTier` | int | `0` | Trade Tier |
| `uniqueId` | long | `0` | Unique Id |
| `variant` | int | `0` | Variant |
| `boundX` | int | `0` | Bound X |
| `boundY` | int | `0` | Bound Y |
| `boundZ` | int | `0` | Bound Z |
| `canPickupItems` | intBoolean | `0` | Can pickup items |
| `hasBoundOrigin` | intBoolean | `false` | Has a bounding origin |
| `hasSetCanPickupItems` | intBoolean | `false` | Can Pickup Items was set |
| `limitedLife` | int | `0` | Limited life |

### InteractionData (interactiondata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `add_items` | object | `{"table":""}` | Loot table with items to add to the player's inventory upon successful interaction. See `entity/additemsdata`. |
| `admire` | boolean | `false` | If true, the mob that's interacted with will try to do an admire action after interaction. For this to be successful the mob has to have an Admire component and an Admire goal in place. |
| `barter` | boolean | `false` | If true, the mob that's interacted with will try to do a barter action after interaction. For this to be successful the mob has to have a Barter component and a Barter goal in place. |
| `cooldown` | float | `0` | Time in seconds before this entity can be interacted with again. |
| `cooldown_after_being_attacked` | float | `0` | Time in seconds before this entity can be interacted with after being attacked. |
| `drop_item_slot` | string |  | The entity's slot to remove and drop the item from, if any, upon successful interaction. Inventory slots are denoted by positive numbers. Equipment slots are denoted by 'slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.armor.head', 'slot.armor.chest', 'slo… |
| `drop_item_y_offset` | float | `0` | Will offset the item drop position this amount in the y direction. Requires "drop_item_slot" to be specified. |
| `equip_item_slot` | string |  | The entity's slot to equip the item to, if any, upon successful interaction. Inventory slots are denoted by positive numbers. Equipment slots are denoted by 'slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.armor.head', 'slot.armor.chest', 'slot.armor.legs… |
| `give_item` | boolean | `false` | If true, the mob that's interacted with will try to replace its current main-hand item with the interactable item after interaction. |
| `health_amount` | int | `0` | The amount of health this entity will recover or lose when interacting with this item. Negative values will harm the entity. |
| `hurt_item` | int | `0` | The amount of damage the item will take when used to interact with this entity. A value of 0 means the item won't lose durability. |
| `interact_text` | string | `""` | Text to show when the player is able to interact in this way with this entity when playing with touch-screen controls. |
| `on_interact` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event to fire when the interaction occurs. See `entity/actordefinitiontrigger`. |
| `particle_on_start` | object | `{"copper_event":"none","particle_offset_towards_interactor"…` | Particle effect that will be triggered at the start of the interaction. See `entity/interactparticledata`. |
| `play_sounds` | stringArray | `[]` | List of sounds to play when the interaction occurs. |
| `repair_entity_item` | object | `{"amount":1,"slot":null}` | Allows to repair one of the entity's items. See `entity/repairentityitemdata`. |
| `spawn_entities` | stringArray | `[]` | List of entities to spawn when the interaction occurs. |
| `spawn_items` | object | `{"table":"","y_offset":1}` | Loot table with items to drop on the ground upon successful interaction. See `entity/spawnitemsdata`. |
| `swing` | boolean | `true` | If true, the player will do the 'swing' animation when interacting with this entity. |
| `take_item` | boolean | `false` | If true, the mob that's interacted with will try to replace its current main-hand item with an empty item, and its current main-hand item will occupy the empty selected slot of the player. |
| `transform_to_item` | string | `""` | The item used will transform to this item upon successful interaction. Format: itemName:auxValue |
| `use_item` | boolean | `false` | If true, the interaction will use an item. |
| `vibration` | stringEnum | `"entity_interact"` | Vibration to emit when the interaction occurs. Values: `entity_act`, `entity_die`, `entity_interact`, `none`, `shear`. |

### InteractParticleData (interactparticledata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `copper_event` | stringEnum | `"none"` | Copper Event Values: `none`, `scrape`, `wax_off`, `wax_on`. |
| `particle_offset_towards_interactor` | boolean | `false` | Whether or not the particle will appear closer to who performed the interaction. |
| `particle_type` | stringEnum | `"none"` | The type of particle that will be spawned. Values: `balloongas`, `bleach`, `blockforcefield`, `blueflame`, `breezewindexplosion`, `bubble`, `bubblecolumndown`, `bubblecolumnup`, `bubblemanual`, `campfiresmoke`, `campfiresmoketall`, `candleflame`, `carrotboost`, `coloredflame`, `conduit`, `creakingcrumble`, `crit`, `dragonbreath`, `dragonbreathfire`, `dragonbreathtrail`, `dragondestroyblock`, `driphoney`, `driplava`, `dripwater`, …. |
| `particle_y_offset` | float | `0` | Will offset the particle this amount in the y direction. |

### IntRange (intrange)

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `0` | Max |
| `min` | int | `0` | Min |

### JumpDataDefinition (jumpdatadefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `animation_duration` | int | `1` | Duration of the jump animation. |
| `distance_scale` | float | `1` | The multiplier applied to horizontal velocity when jumping. |
| `height` | float | `0.10000000149011612` | The force applied vertically when jumping. |
| `jump_delay` | int | `30` | Amount of ticks between sequential jumps. |

### LookAtActorBaseDefinition (lookatactorbasedefinition)

Causes the entity to look at nearby actors that match the specified filter criteria.

| Field | Type | Default | Notes |
|---|---|---|---|
| `angle_of_view_horizontal` | int | `360` | The angle in degrees that the mob can see rotated on the Y-axis (left-right). |
| `angle_of_view_vertical` | int | `360` | The angle in degrees that the mob can see rotated on the X-axis (up-down). |
| `control_flags` |  | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `look_distance` | float | `8` | The distance in blocks from which the entity will look at the nearest entity. |
| `look_time` |  | `{"max":4,"min":2}` | Time range to look at the nearest entity. See `item_components/floatrange`. |
| `priority` | int | `0` | Priority |
| `probability` | float | `0.019999999552965164` | The probability of looking at the target. A value of 1.00 is 100%. |

### LookAtActorBaseGoalDefinition (lookatactorbasegoaldefinition)

Causes the entity to look at nearby actors that match the specified filter criteria.

| Field | Type | Default | Notes |
|---|---|---|---|
| `angle_of_view_horizontal` | int | `360` | The angle in degrees that the mob can see rotated on the Y-axis (left-right). |
| `angle_of_view_vertical` | int | `360` | The angle in degrees that the mob can see rotated on the X-axis (up-down). |
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `look_distance` | float | `8` | The distance in blocks from which the entity will look at the nearest entity. |
| `look_time` | object | `{"max":4,"min":2}` | Time range to look at the nearest entity. See `legacy/floatrange`. |
| `priority` | int | `0` | Priority |
| `probability` | float | `0.019999999552965164` | The probability of looking at the target. A value of 1.00 is 100%. |

### MeleeAttackBaseDefinition (meleeattackbasedefinition)

Allows a mob to deal damage through a melee attack.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_once` | boolean | `false` | Allows the mob to perform this melee attack behavior only once during its lifetime. |
| `attack_types` | string | `""` | Defines the entity types this entity will attack. |
| `can_spread_on_fire` | boolean | `false` | Allows the mob, if on fire and empty handed, to ignite its target upon a successful attack. |
| `control_flags` |  | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `cooldown_time` | float | `1` | Cooldown time, in seconds, between consecutive attacks. |
| `inner_boundary_time_increase` | float | `0.25` | Time, in seconds, added to the attack path recalculation interval when the target is beyond "path_inner_boundary". |
| `max_path_time` | float | `0.550000011920929` | Maximum base time, in seconds, before recalculating a new attack path to the target (before increases are applied). |
| `melee_fov` | float | `90` | Field of view, in degrees, used by the hard-coded sensing component to detect a valid attack target. |
| `min_path_time` | float | `0.20000000298023224` | Minimum base time, in seconds, before recalculating a new attack path to the target (before increases are applied). |
| `on_attack` |  | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Defines the event to trigger when this entity successfully attacks. See `entity/actordefinitiontrigger`. |
| `on_kill` |  | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Defines the event to trigger when this entity kills the target. See `entity/actordefinitiontrigger`. |
| `outer_boundary_time_increase` | float | `0.5` | Time, in seconds, added to the attack path recalculation interval when the target is beyond "path_outer_boundary". |
| `path_fail_time_increase` | float | `0.75` | Time, in seconds, added to the attack path recalculation interval when the mob cannot move along the current path. |
| `path_inner_boundary` | float | `16` | Distance at which to increase attack path recalculation by "inner_boundary_time_increase". |
| `path_outer_boundary` | float | `32` | Distance at which to increase attack path recalculation by "outer_boundary_time_increase". |
| `priority` | int | `0` | Priority |
| `random_stop_interval` | int | `0` | Defines a 1-in-N chance for the mob to stop its current attack, where N equals "random_stop_interval". |
| `require_complete_path` | boolean | `false` | Specifies whether a full navigation path from the mob to the target is required. |
| `speed_multiplier` | float | `1` | Multiplier applied to the mob's movement speed when moving toward its target. |
| `track_target` | boolean | `false` | Allows the mob to track its target even if it lacks a hard-coded sensing component. |
| `x_max_rotation` | float | `30` | Maximum rotation, in degrees, on the X-axis while the mob is trying to look at its target. |
| `y_max_head_rotation` | float | `30` | Maximum rotation, in degrees, on the Y-axis while the mob is trying to look at its target. |

### MeleeAttackBaseGoalDefinition (meleeattackbasegoaldefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_once` | boolean | `false` | Allows the mob to perform this melee attack behavior only once during its lifetime. |
| `attack_types` | string | `""` | Defines the entity types this entity will attack. |
| `can_spread_on_fire` | boolean | `false` | Allows the mob, if on fire and empty handed, to ignite its target upon a successful attack. |
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `cooldown_time` | float | `1` | Cooldown time, in seconds, between consecutive attacks. |
| `inner_boundary_time_increase` | float | `0.25` | Time, in seconds, added to the attack path recalculation interval when the target is beyond "path_inner_boundary". |
| `max_path_time` | float | `0.550000011920929` | Maximum base time, in seconds, before recalculating a new attack path to the target (before increases are applied). |
| `melee_fov` | float | `90` | Field of view, in degrees, used by the hard-coded sensing component to detect a valid attack target. |
| `min_path_time` | float | `0.20000000298023224` | Minimum base time, in seconds, before recalculating a new attack path to the target (before increases are applied). |
| `on_attack` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Defines the event to trigger when this entity successfully attacks. See `entity/actordefinitiontrigger`. |
| `on_kill` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Defines the event to trigger when this entity kills the target. See `entity/actordefinitiontrigger`. |
| `outer_boundary_time_increase` | float | `0.5` | Time, in seconds, added to the attack path recalculation interval when the target is beyond "path_outer_boundary". |
| `path_fail_time_increase` | float | `0.75` | Time, in seconds, added to the attack path recalculation interval when the mob cannot move along the current path. |
| `path_inner_boundary` | float | `16` | Distance at which to increase attack path recalculation by "inner_boundary_time_increase". |
| `path_outer_boundary` | float | `32` | Distance at which to increase attack path recalculation by "outer_boundary_time_increase". |
| `priority` | int | `0` | Priority |
| `random_stop_interval` | int | `0` | Defines a 1-in-N chance for the mob to stop its current attack, where N equals "random_stop_interval". |
| `require_complete_path` | boolean | `false` | Specifies whether a full navigation path from the mob to the target is required. |
| `speed_multiplier` | float | `1` | Multiplier applied to the mob's movement speed when moving toward its target. |
| `track_target` | boolean | `false` | Allows the mob to track its target even if it lacks a hard-coded sensing component. |
| `x_max_rotation` | float | `30` | Maximum rotation, in degrees, on the X-axis while the mob is trying to look at its target. |
| `y_max_head_rotation` | float | `30` | Maximum rotation, in degrees, on the Y-axis while the mob is trying to look at its target. |

### minecraft_attack_damage (minecraft_attack_damage)

Specifies how much damage is dealt by the entity when it attacks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | intRange |  | How much an attack should damage a target. Range: -50..50. |

### minecraft_balloonable (minecraft_balloonable)

Allows this entity to have a balloon attached and defines the conditions and events for this entity when is ballooned.

| Field | Type | Default | Notes |
|---|---|---|---|
| `soft_distance` | float | `2` | Distance in blocks at which the 'spring' effect that lifts it. Range: 0..30. |
| `max_distance` | float | `10` | Distance in blocks at which the balloon breaks. Range: 0..30. |
| `on_balloon` | minecraftEventTrigger |  | Event to call when this entity is ballooned. |
| `on_unballoon` | minecraftEventTrigger |  | Event to call when this entity is unballooned. |
| `mass` | float | `1` | Mass that this entity will have when computing balloon pull forces. Range: 0..30. |

### minecraft_health (minecraft_health)

Defines the health pool for an entity, measured in health points (1 point = half a heart). Typical values: cow (10), zombie (20), iron golem (100), wither (600).

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `20` | Starting health for this entity in health points (1 point = half a heart). Range: 0... |
| `max` | int | `20` | Maximum health this entity can have. Can be higher than the starting value to allow healing beyond initial health. Range: 0... |

### minecraft_movement_dolphin (minecraft_movement_dolphin)

This component can control how dolphins move, in a dolphin-esque style.

> This movement is not currently being used in game.

### minecraft_movement_glide (minecraft_movement_glide)

This move control causes the mob to glide.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_turn` | float | `30` | The maximum number in degrees the mob can turn per tick. |
| `speed_when_turning` | float | `0.2` | Speed that the mob adjusts to when it has to turn quickly. |

### minecraft_trade_resupply (minecraft_trade_resupply)

Resupplies an entity's trade.

### minecraft_trust (minecraft_trust)

Allows this entity to trust multiple players.

### MobDescriptor (mobdescriptor)

Identifies a mob type for AI targeting and interaction behaviors. Used in components like behavior.nearest_attackable_target to specify valid targets by family type, with optional filters for additional conditions. Configure which creature families an entity hunts, fears, follows, or interacts with.

| Field | Type | Default | Notes |
|---|---|---|---|
| `check_if_outnumbered` | boolean | `false` | If true, the mob will check if its outnumbered |
| `cooldown` | int | `0` | The amount of time in seconds that the mob has to wait before selecting a target of the same type again |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Conditions that make this entry in the list valid |
| `max_dist` | float | `16` | Maximum distance this mob can be away to be a valid choice |
| `max_flee` | float | `10` | Maximum distance this mob can be from the target to stop fleeing |
| `max_height` | float | `-1` | Maximum height this mob can be away to be a valid choice |
| `must_see` | boolean |  | If true, the mob has to be visible to be a valid choice |
| `must_see_forget_duration` | int | `3` | Determines the amount of time in seconds that this mob will look for a target before forgetting about it and looking for a new one when the target isn't visible any more |
| `priority` | int | `0` | Priority for this mob type |
| `reevaluate_description` | boolean | `false` | If true, the mob will stop being targeted if it stops meeting any conditions. |
| `sprint_speed_multiplier` | float | `1` | Multiplier for the sprinting speed. A value of 1.0 means the speed is unchanged |
| `walk_speed_multiplier` | float | `1` | Multiplier for the walking speed. A value of 1.0 means the speed is unchanged |

### MobEffectInstance (mobeffectinstance)

| Field | Type | Default | Notes |
|---|---|---|---|
| `amplifier` | int | `1` | Amplifier |
| `durationeasy` | int |  | Durationeasy |
| `durationhard` | int |  | Durationhard |
| `durationnormal` | int |  | Durationnormal |
| `effect` | string | `""` | Effect |

### MobEffectSubcomponentDefinition (mobeffectsubcomponentdefinition)

Applies one or more mob effects to the entity hit. Effects are described with an `effects` array of effect objects.

| Field | Type | Default | Notes |
|---|---|---|---|
| `effects` | objectArray | `[]` | Array of effect objects. Each element may specify `effect` (name), `amplifier`, and per-difficulty durations `durationeasy`, `durationnormal`, `durationhard`. See `entity/mobeffectinstance`. |

### Molang expression (molang_expression)

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | **required**. Expression |
| `version` | int |  | **required**. Version |

### MountTamingComponentFeedItem (mounttamingcomponentfeeditem)

| Field | Type | Default | Notes |
|---|---|---|---|
| `item` | string | `{}` | Name of the item this entity likes and can be used to increase this entity's temper. |
| `temper_mod` | int | `0` | The amount of temper this entity gains when fed this item. |

### MountTamingComponentRejectItem (mounttamingcomponentrejectitem)

| Field | Type | Default | Notes |
|---|---|---|---|
| `item` | string | `{}` | Name of the item this entity dislikes and will cause it to get angry if used while untamed. |

### OnEquipmentChangedSlotEntryDescriptor (onequipmentchangedslotentrydescriptor)

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_equip` | string | `""` | Event to execute when the slot is changed to a non-empty item. |
| `on_unequip` | string | `""` | Event to execute when the slot is changed to an empty item. |
| `slot` | stringEnum | `"slot.weapon.mainhand"` | The equipment slot to monitor for changes. Values: `slot.armor.body`, `slot.armor.chest`, `slot.armor.feet`, `slot.armor.head`, `slot.armor.legs`, `slot.weapon.mainhand`, `slot.weapon.offhand`. |

### OnHitCommandsStorage (onhitcommandsstorage)

| Field | Type | Default | Notes |
|---|---|---|---|
| `arrow_effect` | object |  | Variant of `mob_effect` that derives the effects from the arrow's tipped-potion data and splits durations across the standard eight-arrow stack. See `entity/arroweffectsubcomponentdefinition`. |
| `catch_fire` | object |  | Causes the projectile to embed itself in the block it hits. See `entity/catchfiresubcomponentdefinition`. |
| `definition_event` | object |  | Fires an entity event on the shooter, the projectile, the entity hit, and/or all entities in a splash radius. See `entity/actordefinitioneventsubcomponentdefinition`. |
| `douse_fire` | object |  | When the projectile is a water-effect potion, extinguishes fires and campfires at and around the hit block. |
| `freeze_on_hit` | object |  | Freezes nearby water blocks to ice in a configurable volume around the impact (Education Edition chemistry feature). See `entity/freezeonhitsubcomponentdefinition`. |
| `grant_xp` | object |  | Drops experience orbs at the impact location. See `entity/grantxpsubcomponentdefinition`. |
| `hurt_owner` | object |  | Damages the projectile's owner when the projectile lands. See `entity/hurtownersubcomponentdefinition`. |
| `ignite` | object |  | Triggers the entity's `on_ignite` definition when the projectile hits. |
| `impact_damage` | object |  | Deals damage to the entity that was hit and optionally applies knockback, fire, channeling, and critical-hit scaling. See `entity/impactdamagesubcomponentdefinition`. |
| `mob_effect` | object |  | Applies one or more mob effects to the entity hit. Effects are described with an `effects` array of effect objects. See `entity/mobeffectsubcomponentdefinition`. |
| `particle_on_hit` | object |  | Emits a particle effect at the impact location, optionally only for entity hits or only for non-entity hits. See `entity/particleonhitsubcomponentdefinition`. |
| `remove_on_hit` | object |  | Removes the projectile from the world when it hits a block, entity, or (if `hit_water` is set) water. |
| `spawn_aoe_cloud` | object |  | Spawns an area effect cloud at the impact point that applies potion effects to entities inside it over time See `entity/spawnaoecloudsubcomponentdefinition`. |
| `spawn_chance` | object |  | Conditionally spawns one or two groups of entities at the impact location and optionally fires events on each spawned entity. See `entity/spawnchancesubcomponentdefinition`. |
| `stick_in_ground` | object |  | Causes the projectile to embed itself in the block it hits. See `entity/stickingroundsubcomponentdefinition`. |
| `teleport_owner` | object |  | Teleports the projectile's owner to the impact location. |
| `thrown_potion_effect` | object |  | Applies the splash-potion effects of a thrown potion to nearby entities at the impact point. See `entity/thrownpotioneffectsubcomponentdefinition`. |
| `wind_burst_on_hit` | object |  | Releases an outward wind burst at the impact point that pushes nearby entities away. |

### ParticleOnHitSubcomponentDefinition (particleonhitsubcomponentdefinition)

Emits a particle effect at the impact location, optionally only for entity hits or only for non-entity hits.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_particles` | int | `1` | Number of particles to spawn per hit. |
| `on_entity_hit` | boolean | `false` | If `true`, particles are spawned when the projectile hits an entity. |
| `on_other_hit` | boolean | `false` | If `true`, particles are spawned when the projectile hits something that is not an entity. |
| `particle_item_name` | object |  | Map from item identifier to a filter group, used to select an item icon for `iconcrack`-style particles based on context (e.g. the projectile's owner). |
| `particle_type` | stringEnum | `"none"` | Particle type to spawn at the impact point. Values: `balloongas`, `bleach`, `blockforcefield`, `blueflame`, `breezewindexplosion`, `bubble`, `bubblecolumndown`, `bubblecolumnup`, `bubblemanual`, `campfiresmoke`, `campfiresmoketall`, `candleflame`, `carrotboost`, `coloredflame`, `conduit`, `creakingcrumble`, `crit`, `dragonbreath`, `dragonbreathfire`, `dragonbreathtrail`, `dragondestroyblock`, `driphoney`, `driplava`, `dripwater`, …. |

### PlaceBlockGoalWeightedBlockDescriptor (placeblockgoalweightedblockdescriptor)

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | object | `{"name":"","states":{},"tags":""}` | Block descriptor for this entry. |
| `filter` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filter for if this entry should be randomly selected from. Self, Target, and Block are set. |
| `weight` | int | `1` | Weight for this entry. |

### PreferredPath BlockSet (preferredpath_blockset)

| Field | Type | Default | Notes |
|---|---|---|---|
| `blocks` | objectArray | `[]` | List of preferred blocks |
| `cost` | float |  | Cost for preferred blocks |

### PushableByEntityPreset (pushablebyentitypreset)

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Conditions that must be met for this preset to be applied. |
| `kick_speed_scale` | float | `2` | Multiplier applied to the pushing entity's movement speed to determine kick force. Only used when push_mode is "ball". |
| `max_distance` | float | `3.4028234663852886e+38` | Maximum horizontal distance between the center of the pushed entity and the collision of the pushing entity for push forces to be applied. Entities further apart than this will not push each other. |
| `max_kick_speed` | float | `0.5` | Maximum speed the entity can be pushed back at, regardless of how fast the pushing entity is moving. Only used when push_mode is "ball". |
| `min_distance` | float | `0.009999999776482582` | Minimum horizontal distance between the centers of the two entities for push forces to be applied. Entities closer than this will not push each other. |
| `min_kick_speed` | float | `0` | Minimum speed the the entity will be pushed back at, regardless of how slowly the pushing entity is moving. Only used when push_mode is "ball". |
| `play_sound` | boolean | `false` | If the "pushed_by_player" sound should be played when the entity is pushed by any other entity (despite the sound name). |
| `play_sound_cooldown_in_seconds` | float | `0.20000000298023224` | Cooldown in seconds between sounds. A lower number results in more sounds. |
| `play_sound_impulse_threshold` | float | `0.20000000298023224` | Minimum change of velocity needed to trigger the push sound. A lower value means higher sensitivity. |
| `push_mode` | stringEnum | `"default"` | Defines the type of push vector calculation applied to the entity: - "none": The entity cannot be pushed. - "default": Standard push calculations used by most entities. - "legacy_boat": Legacy push calculations historically used by boats. Includes dampened fo… Values: `ball`, `default`, `legacy_boat`, `legacy_minecart`, `none`. |
| `push_scale_other` | float | `1` | Scales how much push force this entity applies to the other entity when colliding. A value of 1.0 applies full force, 0.5 applies half. |
| `push_scale_self` | float | `1` | Scales how much this entity pushes itself away when colliding with another entity. A value of 1.0 applies full force, 0.5 applies half. |
| `require_collision_overlap` | boolean | `true` | When true, entities will not push each other unless their collision boxes overlap. |
| `strength_multiplier` | float | `0.05000000074505806` | Multiplier applied to the push strength. Higher values result in stronger pushes. |
| `vertical_kick_multiplier` | float | `0.30000001192092896` | Multiplier for the upward force applied when the entity is pushed while on the ground. A value of 0 keeps the entity flat. Only used when push_mode is "ball". |

### RepairEntityItemData (repairentityitemdata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `amount` | int | `1` | How much of the item durability should be restored upon interaction. |
| `slot` | string |  | The entity's slot containing the item to be repaired. Inventory slots are denoted by positive numbers. Equipment slots are denoted by 'slot.weapon.mainhand', 'slot.weapon.offhand', 'slot.armor.head', 'slot.armor.chest', 'slot.armor.legs', 'slot.armor.feet' an… |

### resource (resource)

Defines resource pack rendering resources for an entity (materials, textures, geometry, and animations), keyed by an identifier.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | A targeted identifier this visual/audio description uses. |
| `materials` | keyedStringCollection |  | A list of identified models that this entity uses. |
| `textures` | keyedStringCollection |  | A list of identified textures that this entity uses. |
| `geometry` | keyedStringCollection |  | A list of identified models that this entity uses. |
| `animations` | keyedStringCollection |  | A list of identified animation that this entity uses. |

### resource_animations (resource_animations)

Defines animation references for an entity's client resources.

| Field | Type | Default | Notes |
|---|---|---|---|
| `animations` | keyedStringCollection |  | A list of identified animation that this entity uses. |

### resource_geometry (resource_geometry)

Defines geometry model references for an entity's client resources.

| Field | Type | Default | Notes |
|---|---|---|---|
| `geometry` | keyedStringCollection |  | A list of identified models that this entity uses. |

### resource_materials (resource_materials)

Defines material references for an entity's client resources.

| Field | Type | Default | Notes |
|---|---|---|---|
| `materials` | keyedStringCollection |  | A list of identified models that this entity uses. |

### resource_textures (resource_textures)

Defines texture references for an entity's client resources.

| Field | Type | Default | Notes |
|---|---|---|---|
| `textures` | keyedStringCollection |  | A list of identified textures that this entity uses. |

### Rider Data (rider_data)

List of riders to be added to the entity. Must have no more riders than "minecraft:rideable" has "seat_count".

| Field | Type | Default | Notes |
|---|---|---|---|
| `entity_type` | string |  | **required**. The entity type that will be riding this entity. |
| `spawn_event` | string | `""` | The spawn event that will be used when the riding entity is created. |

### sound_event (sound_event)

Maps gameplay events to sound effects for the entity, enabling custom audio for actions like attacking, being hurt, dying, or ambient idle sounds. Reference sounds defined in sound_definitions.json to give custom mobs distinctive audio identities that match their visual design and behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `volume` | float |  | Overall adjustment to the volume level of the set of sounds Range: 0..1. |
| `pitch` | float |  | Overall adjustment to the pitch level of the set of sounds |
| `events` | keyedStringCollection |  | A set of associated events. |

### SoundDefinition (sounddefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `condition` | keyedStringCollection |  | **required**. A Molang expression describing under which conditions to play this sound, given that the entity was provoked. |
| `sound` | string |  | **required**. The sound to play. |

### SpawnAoECloudSubcomponentDefinition (spawnaoecloudsubcomponentdefinition)

Spawns an area effect cloud at the impact point that applies potion effects to entities inside it over time

| Field | Type | Default | Notes |
|---|---|---|---|
| `affect_owner` | boolean | `true` | If `true`, the projectile's owner can be affected by the cloud. |
| `duration` | int | `0` | How long, in seconds, the cloud persists before disappearing. |
| `particle` | stringEnum | `"mobspellambient"` | Particle effect emitted by the cloud. Values: `balloongas`, `bleach`, `blockforcefield`, `blueflame`, `breezewindexplosion`, `bubble`, `bubblecolumndown`, `bubblecolumnup`, `bubblemanual`, `campfiresmoke`, `campfiresmoketall`, `candleflame`, `carrotboost`, `coloredflame`, `conduit`, `creakingcrumble`, `crit`, `dragonbreath`, `dragonbreathfire`, `dragonbreathtrail`, `dragondestroyblock`, `driphoney`, `driplava`, `dripwater`, …. |
| `potion` | int | `-1` | Aux value of the potion whose effects the cloud applies. When `-1`, the potion is taken from the projectile entity itself. |
| `radius` | float | `0` | Initial radius (in blocks) of the cloud. |
| `radius_on_use` | float | `-1` | Amount the radius shrinks (or grows) each time the cloud applies its effects. `-1` keeps the radius unchanged. |
| `reapplication_delay` | int | `0` | Number of ticks the cloud waits before re-applying its effects to the same entity. |

### SpawnChanceSubcomponentDefinition (spawnchancesubcomponentdefinition)

Conditionally spawns one or two groups of entities at the impact location and optionally fires events on each spawned entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `first_spawn_chance` | float | `0` | Percent chance (0-1.0) that the first group spawns. |
| `first_spawn_count` | int | `0` | Number of entities spawned when the first roll succeeds. |
| `on_spawn` | objectArray | `[]` | Array of entity event triggers to fire on each spawned entity. See `entity/actordefinitiontrigger`. |
| `second_spawn_chance` | float | `0` | Percent chance (0-1.0) that the second group spawns (rolled independently of the first). |
| `second_spawn_count` | int | `0` | Number of entities spawned when the second roll succeeds. |
| `spawn_baby` | boolean | `false` | If `true`, spawned entities start as babies (where applicable). |
| `spawn_definition` | string | `""` | Identifier of the entity definition to spawn. |

### SpawnItemsData (spawnitemsdata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `table` | string | `""` | File path, relative to the Behavior Pack's path, to the loot table file. |
| `y_offset` | float | `1` | Will offset the items spawn position this amount in the y direction. |

### StickInGroundSubcomponentDefinition (stickingroundsubcomponentdefinition)

Causes the projectile to embed itself in the block it hits.

| Field | Type | Default | Notes |
|---|---|---|---|
| `shake_time` | float | `0` | Duration in seconds for which the projectile visually shakes after sticking. |

### SummonActorGoalDefinition_SpellData (summonactorgoaldefinition_spelldata)

| Field | Type | Default | Notes |
|---|---|---|---|
| `cast_duration` | float | `-1` | Time in seconds the spell casting will take |
| `cooldown_time` | float | `0` | Time in seconds the mob has to wait before using the spell again |
| `do_casting` | boolean | `true` | If true, the mob will do the casting animations and render spell particles |
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `max_activation_range` | float | `32` | Upper bound of the activation distance in blocks for this spell, must not be negative. |
| `min_activation_range` | float | `1` | Lower bound of the activation distance in blocks for this spell, must not be negative. |
| `particle_color` | string | `[255,255,255,255]` | The color of the particles for this spell |
| `sequence` | objectArray | `[]` | List of steps for the spell. Each step has the following parameters: See `entity/summonactorgoaldefinition_spellstage`. |
| `start_sound_event` | stringEnum | `"undefined"` | The sound event to play when using this spell Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |
| `weight` | float | `0` | The weight of this spell. Controls how likely the mob is to choose this spell when casting one |

### SummonActorGoalDefinition_SpellStage (summonactorgoaldefinition_spellstage)

| Field | Type | Default | Notes |
|---|---|---|---|
| `base_delay` | float | `0` | Amount of time in seconds to wait before this step starts |
| `delay_per_summon` | float | `0` | Amount of time in seconds before each entity is summoned in this step |
| `entity_lifespan` | float | `-1` | Amount of time in seconds that the spawned entity will be alive for. A value of -1.0 means it will remain alive for as long as it can |
| `entity_type` | string | `""` | The entity type of the entities we will spawn in this step |
| `num_entities_spawned` | int | `1` | Number of entities that will be spawned in this step |
| `shape` | stringEnum | `"line"` | The base shape of this step. Valid values are circle and line Values: `circle`, `line`. |
| `size` | float | `1` | The base size of the entity |
| `sound_event` | stringEnum | `"undefined"` | The sound event to play for this step Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |
| `summon_cap` | int | `0` | Maximum number of summoned entities at any given time |
| `summon_cap_radius` | float | `0` | Summon Cap Radius |
| `summon_event` | string | `""` | Event to invoke on each summoned entity on spawn |
| `target` | stringEnum | `"self"` | The target of the spell. This is where the spell will start (line will start here, circle will be centered here) Values: `self`, `target`. |

### TargetGoalDefinition (targetgoaldefinition)

Configures conditions for AI targeting goals like nearest_attackable_target or hurt_by_target. Defines filters that potential targets must pass, reselection timing, and target persistence. Controls which entities the mob will aggro on, how long it remembers targets, and when it switches to new threats.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_owner` | boolean | `false` | If true, this entity can attack its owner. |
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `entity_types` | objectArray | `[]` | Filters which types of targets are valid for this entity. |
| `must_reach` | boolean | `false` | If true, this entity requires a path to the target. |
| `must_see` | boolean | `false` | Determines if target-validity requires this entity to be in range only, or both in range and in sight. |
| `must_see_forget_duration` | float | `3` | Time (in seconds) the target must not be seen by this entity to become invalid. Used only if "must_see" is true. |
| `persist_time` | float | `0` | Time (in seconds) this entity can continue attacking the target after the target is no longer valid. |
| `priority` | int | `0` | Priority |
| `within_radius` | float | `0` | Maximum distance this entity can be from the target when following it, otherwise the target becomes invalid. This value is only used if the entity doesn't declare "minecraft:follow_range". |

### ThrownPotionEffectSubcomponentDefinition (thrownpotioneffectsubcomponentdefinition)

Applies the splash-potion effects of a thrown potion to nearby entities at the impact point.

| Field | Type | Default | Notes |
|---|---|---|---|
| `effect` | int | `-1` | Aux value of the potion to apply. |

### TimerActorFlagBaseDefinition (timeractorflagbasedefinition)

Base configuration for timer-triggered actor flag changes. Flags are boolean states that track entity conditions like 'is_baby' or 'is_charged'. Timer-based flags enable automatic state transitions after duration expires—such as baby animals growing up, temporary buffs wearing off, or delayed transformations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` |  | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `cooldown_range` |  | `{"max":0,"min":0}` | Goal cooldown range in seconds. If specified, the cooldown will have to elapse even before the goal can be selected for the first time. See `item_components/floatrange`. |
| `duration_range` |  | `{"max":0,"min":0}` | Goal duration range in seconds. See `item_components/floatrange`. |
| `on_end` |  | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event(s) to run when the goal ends. See `entity/actordefinitiontrigger`. |
| `on_start` |  | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event(s) to run when the goal starts. See `entity/actordefinitiontrigger`. |
| `priority` | int | `0` | Priority |

### TimerActorFlagBaseGoalDefinition (timeractorflagbasegoaldefinition)

| Field | Type | Default | Notes |
|---|---|---|---|
| `control_flags` | stringArray | `[]` | Control Flags Values: `jump`, `look`, `move`. |
| `cooldown_range` | object | `{"max":0,"min":0}` | Goal cooldown range in seconds. If specified, the cooldown will have to elapse even before the goal can be selected for the first time. See `legacy/floatrange`. |
| `duration_range` | object | `{"max":0,"min":0}` | Goal duration range in seconds. See `legacy/floatrange`. |
| `on_end` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event(s) to run when the goal ends. See `entity/actordefinitiontrigger`. |
| `on_start` | object | `{"event":"","filters":{"AND":null,"NOT":null,"OR":null,"all…` | Event(s) to run when the goal starts. See `entity/actordefinitiontrigger`. |
| `priority` | int | `0` | Priority |

### Trade (trade)

Defines a single trade offer an entity can present to players. Specifies the input items the player must provide and the output item received in exchange. Configure trade counts, XP rewards, and price adjustments. Used in villager-style trading systems with the minecraft:economy_trade_table component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `gives` | objectArray |  | **required** |
| `max_uses` | int | `7` | Max Uses |
| `reward_exp` | boolean | `true` | Reward Exp |
| `trader_exp` | int | `1` | Trader Exp |
| `wants` | objectArray |  | **required** |
| `weight` | int | `1` | Weight |

### TradeGroup (tradegroup)

Groups related trade offers that may be randomly selected from within a tier. When an entity unlocks a tier, trades are chosen from groups within that tier. Configure how many trades to select from the group. Enables variety in merchant inventories so not every villager of the same profession offers identical goods.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_to_select` | int | `0` | Num To Select |
| `trades` | objectArray |  | **required**. Trades See `entity/trade`. |

### TradeItem (tradeitem)

Specifies an item stack used in trading—either as input (what players pay) or output (what players receive). Configure the item type, quantity range, enchantment probability, and function modifiers. Supports emeralds, resources, tools, armor, enchanted books, and any registered item as tradeable goods.

| Field | Type | Default | Notes |
|---|---|---|---|
| `filters` | object | `{"AND":null,"NOT":null,"OR":null,"all":null,"all_of":null,"…` | Filters allow data objects to specify test criteria which allows their use. Filters can be defined by a single object of type (Filter Test), an array of tests, collection groups, or a combination of these objects. |
| `functions` | stringArray |  | Functions |
| `item` | string |  | **required**. Item |
| `price_multiplier` | float | `0` | Price Multiplier |
| `quantity` | int | `{"max":1,"min":1}` | Quantity |

### TradeTier (tradetier)

Defines a tier of trades that unlock as the trading entity gains experience. Villagers start at tier 1 (novice) and unlock higher tiers through player trades, offering progressively better items. Each tier contains trade groups that determine available offers at that merchant level.

| Field | Type | Default | Notes |
|---|---|---|---|
| `groups` | objectArray |  | **required**. Groups See `entity/tradegroup`. |
| `total_exp_required` | int |  | **required**. Total Exp Required |
