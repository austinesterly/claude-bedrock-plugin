# Item components

Generated 2026-10-12 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/item). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Components (51)

`minecraft:allow_off_hand`, `minecraft:block_placer`, `minecraft:bundle_interaction`, `minecraft:can_destroy_in_creative`, `minecraft:compostable`, `minecraft:cooldown`, `minecraft:custom_components`, `minecraft:damage`, `minecraft:damage_absorption`, `minecraft:digger`, `minecraft:display_name`, `minecraft:durability`, `minecraft:durability_sensor`, `minecraft:durability_sensor durability_threshold`, `minecraft:dyeable`, `minecraft:enchantable`, `minecraft:entity_placer`, `minecraft:fire_resistant`, `minecraft:food`, `minecraft:fuel`, `minecraft:glint`, `minecraft:hand_equipped`, `minecraft:hover_text_color`, `minecraft:icon`, `minecraft:interact_button`, `minecraft:item v1.21.90`, `minecraft:item v1.26.0`, `minecraft:item v1.26.0`, `minecraft:kinetic_weapon`, `minecraft:kinetic_weapon kinetic_effect_conditions`, `minecraft:liquid_clipped`, `minecraft:max_stack_size`, `minecraft:piercing_weapon`, `minecraft:projectile`, `minecraft:rarity`, `minecraft:record`, `minecraft:repairable`, `minecraft:seed`, `minecraft:shooter`, `minecraft:should_despawn`, `minecraft:stacked_by_data`, `minecraft:storage_item`, `minecraft:storage_weight_limit`, `minecraft:storage_weight_modifier`, `minecraft:swing_duration`, `minecraft:swing_sounds`, `minecraft:tags`, `minecraft:throwable`, `minecraft:use_animation`, `minecraft:use_modifiers`, `minecraft:wearable`

### minecraft:allow_off_hand

_since 1.20.30_

The allow_off_hand component determines whether the item can be placed in the off hand slot of the inventory.

### minecraft:block_placer

_since 1.21.50_

Sets the item as a placer item component for blocks. Items with this component will place a block when used.

> This component can also be used instead of the minecraft:icon component to render the block this item will place as the icon.

| Field | Type | Default | Notes |
|---|---|---|---|
| `aligned_placement` | boolean | `false` | since 1.26.10. When true, block placement through this item is aligned while the interaction button is held down. Supported from `format_version` 1.26.0 onward. |
| `block` | string |  | **required**. Defines the block that will be placed. |
| `replace_block_item` | boolean | `false` | If true, the item will be registered as the item for this block. This item will be returned by default when the block is broken/picked. Note: the identifier for this item must match the block's identifier for this field to be valid. Defaults to false. |
| `use_on` | objectArray | `[]` | List of block descriptors of the blocks that this item can be used on. If left empty, all blocks will be allowed. |

Example (/minecraft:item/components/minecraft:block_placer/):
```json
{
 "block": "seeds",
 "use_on": [
  "dirt",
  "grass"
 ],
 "replace_block_item": true
}
```

### minecraft:bundle_interaction

_since 1.21.40_

Enables the bundle-specific interaction scheme and tooltip for an item.

> To use this component, the item must have a minecraft:storage_item item component defined.

> In `/textures/textures_list.json`, the following code needs to be added for an item named `my_custom_bundle`: [ '<resource pack>/textures/items/my_custom_bundle.png', '<resource pack>/textures/items/my_custom_bundle_open_front.png','<resource pack>/textures/items/my_custom_bundle_open_back.png']. The respective icon textures would need to be added: my_custom_bundle.png, my_custom_bundle_open_front.png, my_custom_bundle_open_back.png. Note that it's important that the filenames are the item name, plus `_open_front` and `_open_back` respectively.

> Available without experimental toggle in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `num_viewable_slots` | int | `12` | The maximum number of slots in the bundle viewable by the plater. Can be from 1 to 64. Default is 12. |

Example (sample):
```json
{
 "format_version": "1.21.30",
 "minecraft:item": {
  "description": {
   "identifier": "minecraft:bundle"
  },
  "components": {
   "minecraft:icon": {
    "textures": {
     "default": "bundle"
    }
   },
   "minecraft:max_stack_size": 1,
   "minecraft:storage_item": {
    "max_slots": 64,
    "max_weight_limit": 64,
    "weight_in_storage_item": 4,
    "allow_nested_storage_items": true,
    "banned_items": [
     "minecraft:shulker_box"
    ]
   },
   "minecraft:bundle_interaction": {
    "num_viewable_slots": 8
   }
  }
 }
}
```

### minecraft:can_destroy_in_creative

_since 1.20.10_

The can_destroy_in_creative component determines if the item can be used by a player to break blocks when in creative mode.

### minecraft:compostable

_since 1.21.60_

Specifies that an item is compostable and provides the chance of creating a composting layer in the composter

| Field | Type | Default | Notes |
|---|---|---|---|
| `composting_chance` | int |  | **required**. The chance of this item to create a layer upon composting with the composter. Valid value range is 1 - 100 inclusive |

Example (/minecraft:item/components/minecraft:compostable/):
```json
{
 "composting_chance": 30
}
```

### minecraft:cooldown

_since 1.20.10_

Adds a cooldown to an item, preventing it from being used again for a specified duration. Items sharing the same category will enter cooldown together when any one of them is used.

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` | string |  | **required**. A string identifier that groups items together. When an item with a cooldown is used, all items sharing the same category also enter cooldown. |
| `duration` | float |  | **required**. The duration of time in seconds that items with the matching category will spend cooling down before becoming usable again. |
| `type` | string | `"use"` | since 1.21.130. The type of action that triggers the cooldown. Use 'use' for items consumed on use, or 'attack' for weapons. Default is 'use'. Values: `attack`, `use`. |

Example (sample):
```json
{
 "category": "attack",
 "duration": 0.2
}
```

### minecraft:custom_components

_**deprecated**_

Specifies an array of custom components defined in a script that should be added to this item.

### minecraft:damage

_since 1.20.30_

The damage component determines how much extra damage the item does on attack.

> From 1.26.0 onward, `value` supports the full int16 range of 0 to 32767.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` |  |  | The amount of extra damage this item deals when attacking. This value is added to the base attack damage. Must be a positive integer. |

Example (sample):
```json
{
 "minecraft:damage": 2
}
```

### minecraft:damage_absorption

_since 1.21.20_

It allows an item to absorb damage that would otherwise be dealt to its wearer. For this to happen, the item needs to be equipped in an armor slot. The absorbed damage reduces the item's durability, with any excess damage being ignored. Because of this, the item also needs a `minecraft:durability` component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `absorbable_causes` | stringArray |  | **required**. List of damage causes that can be absorbed by the item. By default, no damage cause is absorbed. |

### minecraft:digger

_since 1.20.30_

Configures an item as a digging tool, allowing it to break specific blocks faster than normal. Define which blocks are affected and the speed multiplier for each.

| Field | Type | Default | Notes |
|---|---|---|---|
| `destroy_speeds` | objectArray | `[]` | An array of objects that define which blocks this item can dig and at what speed. Each entry specifies a block (by ID or tag query) and a speed multiplier. See `item/blockinfo`. |
| `use_efficiency` | boolean | `false` | When true, the Efficiency enchantment will increase the dig speed of this item. Default is false. |

Example (digger):
```json
{
 "minecraft:digger": {
  "use_efficiency": true,
  "destroy_speeds": [
   {
    "speed": 6,
    "block": {
     "tags": "query.any_tag( 'wood' )"
    }
   },
   {
    "block": "minecraft:coal_ore",
    "speed": 2
   }
  ]
 }
}
```

### minecraft:display_name

_since 1.20.0_

Sets the item display name within Minecraft: Bedrock Edition. This component may also be used to pull from the localization file by referencing a key from it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | string | `""` | Name shown for an item. |

Example (sample):
```json
{
 "value": "secret_weapon"
}
```

### minecraft:durability

_since 1.20.0_

Sets how much damage the item can take before breaking, and allows the item to be combined at an anvil, grindstone, or crafting table.

| Field | Type | Default | Notes |
|---|---|---|---|
| `damage_chance` | object | `{"max":100,"min":100}` | Specifies the percentage chance of this item losing durability. Default is set to 100. Defined as an int range with min and max value. See `block/intrange`. |
| `max_durability` | int |  | **required**. Max durability is the amount of damage that this item can take before breaking. This is a required parameter and has a minimum of 0. |

Example (sample):
```json
{
 "damage_chance": {
  "min": 10,
  "max": 50
 },
 "max_durability": 36
}
```

### minecraft:durability_sensor

_since 1.21.20_

Enables an item to emit effects when it receives damage. Because of this, the item also needs a `minecraft:durability` component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `durability_thresholds` | objectArray |  | **required**. The list of both durability thresholds and effects emitted when each threshold is met. When multiple thresholds are met, only the threshold with the lowest durability after applying the damage is considered. See `item/minecraft_durability_sensor_durability_threshold`. |
| `sound_event` | string |  | Sound effect to emit when the threshold is met. |

### minecraft:durability_sensor durability_threshold

Defines both the durability threshold, and the effects emitted when that threshold is met.

| Field | Type | Default | Notes |
|---|---|---|---|
| `durability` | int | `0` | The effects are emitted when the item durability value is less than or equal to this value. |
| `particle_type` | stringEnum | `"none"` | Particle effect to emit when the threshold is met. Values: `balloongas`, `bleach`, `blockforcefield`, `blueflame`, `breezewindexplosion`, `bubble`, `bubblecolumndown`, `bubblecolumnup`, `bubblemanual`, `campfiresmoke`, `campfiresmoketall`, `candleflame`, `carrotboost`, `coloredflame`, `conduit`, `creakingcrumble`, `crit`, `dragonbreath`, `dragonbreathfire`, `dragonbreathtrail`, `dragondestroyblock`, `driphoney`, `driplava`, `dripwater`, …. |
| `sound_event` | string | `"undefined"` | Sound effect to emit when the threshold is met. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |

### minecraft:dyeable

_since 1.21.30_

Enables players to dye this item using dyes in a crafting grid, like leather armor. Configure the default color when undyed. The item stores its color in NBT data and renders with the player-chosen tint, enabling customizable cosmetic appearances for armor and equipment.

| Field | Type | Default | Notes |
|---|---|---|---|
| `default_color` | string | `[255,255,255]` | Default Color |

Example (sample):
```json
{
 "default_color": "#175882"
}
```

### minecraft:enchantable

_since 1.20.30_

Determines what enchantments can be applied to the item. Not all enchantments will have an effect on all item components.

> The following enchantment slot types that can be set for the value of `slot`: sword, bow, pickaxe, armor_head, armor_torso, armor_legs, armor_feet

| Field | Type | Default | Notes |
|---|---|---|---|
| `slot` | string |  | **required**. Specifies which types of enchantments can be applied. For example, `bow` would allow this item to be enchanted as if it were a bow. |
| `value` | int |  | **required**. Specifies the value of the enchantment (minimum of 0). |

### minecraft:entity_placer

_since 1.20.10_

Allows an item to place entities into the world. Additionally, in version 1.19.80 and above, the component allows the item to set the spawn type of a monster spawner.

| Field | Type | Default | Notes |
|---|---|---|---|
| `dispense_on` | objectArray | `[]` | List of block descriptors of the blocks that this item can be dispensed on. If left empty, all blocks will be allowed. |
| `entity` | string | `""` | The entity to be placed in the world. |
| `use_on` | objectArray | `[]` | List of block descriptors of the blocks that this item can be used on. If left empty, all blocks will be allowed. |

Example (sample):
```json
{
 "entity": "minecraft:spider",
 "dispense_on": [
  "minecraft:web"
 ],
 "use_on": [
  "minecraft:web"
 ]
}
```

### minecraft:fire_resistant

Determines whether the item is immune to burning when dropped in fire or lava.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | boolean | `true` | Determines whether the item is immune to burning when dropped in fire or lava. |

### minecraft:food

_since 1.20.30_

Sets the item as a food component, allowing it to be edible to the player.

| Field | Type | Default | Notes |
|---|---|---|---|
| `can_always_eat` | boolean | `false` | If true you can always eat this item (even when not hungry). Default is set to false. |
| `nutrition` | int | `0` | Value that is added to the entity's nutrition when the item is used. Default is set to 0. |
| `saturation_modifier` | float | `0.6000000238418579` | saturation_modifier is used in this formula: (nutrition * saturation_modifier * 2) when applying the saturation buff. Default is set to 0.6. |
| `using_converts_to` | string | `{}` | When used, converts to the item specified by the string in this field. Default does not convert item. |
| `remove_effects` | stringArray |  | deprecated. Array of effect names to remove when eating this food. This property was deprecated and is no longer supported in newer versions. |

Example (sample):
```json
{
 "can_always_eat": false,
 "nutrition": 3,
 "saturation_modifier": 0.6,
 "using_converts_to": "bowl"
}
```

### minecraft:fuel

_since 1.20.0_

Allows this item to be used as fuel in a furnace to 'cook' other items.

| Field | Type | Default | Notes |
|---|---|---|---|
| `duration` |  |  | How long in seconds will this fuel cook items for. |

Example (/minecraft:item/components/minecraft:fuel/):
```json
{
 "duration": 3
}
```

### minecraft:glint

_since 1.20.30_

Determines whether the item has the enchanted glint render effect on it.

> Renamed from `foil` and released without an experimental toggle in 1.20.30.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | boolean |  | Whether the item has the enchanted glint render effect. |

Example (/minecraft:item/components/minecraft:glint/):
```json
true
```

### minecraft:hand_equipped

_since 1.20.30_

The hand_equipped component determines if an item is rendered like a tool while it is in a player's hand.

Example (/minecraft:item/components/minecraft:hand_equipped/):
```json
false
```

### minecraft:hover_text_color

_since 1.20.10_

Determines the color of the item name when hovering over it.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | string |  | The color of the item hover text. |

### minecraft:icon

_since 1.20.0_

Determines the icon to represent the item in the UI and elsewhere.

| Field | Type | Default | Notes |
|---|---|---|---|
| `texture` | string |  | deprecated. This contains a single texture for the items icon. |
| `textures` | keyedStringCollection |  | This map contains the different textures that can be used for the item's icon. Default will contain the actual icon texture. Armor trim textures and palettes can be specified here as well. The icon textures are the keys from the resource_pack/textures/item_te… |

Example (sample):
```json
"oak_slab"
```

### minecraft:interact_button

A boolean or string that determines if the interact button is shown in touch controls, and what text is displayed on the button. When set to 'true', the default 'Use Item' text will be used.

### minecraft:item v1.21.90

Item definition includes the "description" and "components" sections.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` |  | `{"minecraft:allow_off_hand":null,"minecraft:block_placer":n…` | List of all components used in this item. See `item/components`. |
| `description` |  |  | **required**. Contains the required identifier for the item. May contain optional fields like menu_category. See `item/description`. |

### minecraft:item v1.26.0

Refers to the item definition, which includes the 'description' and 'components' sections of the file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object | `{"minecraft:allow_off_hand":null,"minecraft:block_placer":n…` | List of all components used in this item. See `item/components`. |
| `description` | object |  | **required**. Contains the required identifier for the item. May contain optional fields like menu_category. See `item/description`. |

### minecraft:item v1.26.0

Item definition includes the "description" and "components" sections.

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` |  | `{"minecraft:allow_off_hand":null,"minecraft:block_placer":n…` | List of all components used in this item. See `item/components`. |
| `description` |  |  | **required**. Contains the required identifier for the item. May contain optional fields like menu_category. See `item/description`. |

### minecraft:kinetic_weapon

_since 1.21.130_

Allows an item to deal kinetic damage and its effects. This happens every tick while in use, in a straight line along the user's view vector, with damage computed based on both the user's and the target's velocity projected onto the view vector (via a dot product). The more the user and target move toward each other, and the more this movement is aligned with the user's view vector, the higher the damage. After "damage_multiplier" and "damage_modifier" are applied, the resulting damage is floored to the nearest lower integer.

| Field | Type | Default | Notes |
|---|---|---|---|
| `creative_reach` | object |  | Defines the reach used when the user is in Creative Mode. Defaults to "reach" if unspecified. See `legacy/floatrange`. |
| `damage_conditions` | object |  | Conditions that need to be satisfied for damage to be applied. If not specified, damage is not applied. See `item/minecraft_kinetic_weapon_kinetic_effect_conditions`. |
| `damage_modifier` | float | `0` | Value added to the the scaled dot product (after applying "damage_multiplier"). |
| `damage_multiplier` | float | `1` | Value multiplied to sum of the dot products of the user and target's velocity vectors projected onto the view vector. |
| `delay` | int | `0` | Time, in ticks, after which kinetic damage and its effects start being applied. |
| `dismount_conditions` | object |  | Conditions that need to be satisfied for riders to be dismounted. If not specified, riders cannot be dismounted. See `item/minecraft_kinetic_weapon_kinetic_effect_conditions`. |
| `hitbox_margin` | float | `0` | Added tolerance to the view vector raycast for detecting entity collisions. |
| `knockback_conditions` | object |  | Conditions that need to be satisfied for knockback to be applied. If not specified, knockback is not applied. See `item/minecraft_kinetic_weapon_kinetic_effect_conditions`. |
| `reach` | object | `{"max":3,"min":0}` | Defines the range (in blocks) along the user's view vector where entities can be hit. Only targets within this distance are considered. Block collisions between the user and target block damage and its effects. See `legacy/floatrange`. |

### minecraft:kinetic_weapon kinetic_effect_conditions

Conditions that need to be satisfied for a specific effect of a kinetic weapon to be applied.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_duration` | int | `-1` | Time, in ticks, during which the effect can be applied after "delay" elapses. If negative, the effect is applied indefinitely. |
| `min_relative_speed` | float | `0` | Minimum relative speed of the user with respect to the target (projected onto the view vector via a dot product) required for the effect to be applied. |
| `min_speed` | float | `0` | Minimum user's speed (projected onto the view vector via a dot product) required for the effect to be applied. |

### minecraft:liquid_clipped

_since 1.20.30_

The liquid_clipped component determines whether the item interacts with liquid blocks on use. To allow placement of blocks on liquids, see the 'placement_filter' block component.

### minecraft:max_stack_size

_since 1.20.10_

Determines how many of an item can be stacked together.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | int | `64` | How many of an item that can be stacked together. |

Example (/minecraft:item/components/minecraft:max_stack_size/):
```json
1
```

### minecraft:piercing_weapon

_since 1.21.130_

Allows an item to deal damage to all entities detected in a straight line along the user's view vector. Items with this component cannot destroy blocks, as the attack action always takes priority, regardless of what the user is looking at.

| Field | Type | Default | Notes |
|---|---|---|---|
| `creative_reach` | object |  | Defines the reach used when the user is in Creative Mode. Defaults to "reach" if unspecified. See `legacy/floatrange`. |
| `hitbox_margin` | float | `0` | Added tolerance to the view vector raycast for detecting entity collisions. |
| `reach` | object | `{"max":3,"min":0}` | Defines the range (in blocks) along the user's view vector where entities can be hit. Only targets within this distance are considered. Block collisions between the user and target block damage and its effects. See `legacy/floatrange`. |

### minecraft:projectile

_since 1.20.10_

Defines an item as a projectile that can be shot from dispensers or used as ammunition with minecraft:shooter. When combined with minecraft:throwable, this component specifies which entity is spawned when the item is thrown.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minimum_critical_power` | float | `0` | Specifies how long a player must charge a projectile for it to critically hit. |
| `projectile_entity` | string |  | **required**. Which entity is to be fired as a projectile. |

Example (sample):
```json
{
 "minimum_critical_power": 1.25,
 "projectile_entity": "arrow"
}
```

### minecraft:rarity

_since 1.21.30_

Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | string |  | Sets the base rarity of the item. The rarity of an item automatically increases when enchanted, either to Rare when the base rarity is Common or Uncommon, or Epic when the base rarity is Rare. Values: `common`, `uncommon`, `rare`, `epic`. |

Example (sample):
```json
{
 "minecraft:rarity": "rare"
}
```

### minecraft:record

_since 1.20.10_

Used by record items to play music.

| Field | Type | Default | Notes |
|---|---|---|---|
| `comparator_signal` | int | `1` | Specifies signal strength for comparator blocks to use, from 1 - 13. |
| `duration` | float | `0` | Specifies duration of sound event in seconds, float value. |
| `sound_event` | string | `"undefined"` | Sound event type: 13, cat, blocks, chirp, far, mall, mellohi, stal, strad, ward, 11, wait, pigstep, otherside, 5, relic. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |

Example (sample):
```json
{
 "comparator_signal": 1,
 "duration": 5,
 "sound_event": "ambient.tame"
}
```

### minecraft:repairable

_since 1.20.10_

Defines the items that can be used to repair a defined item, and the amount of durability each item restores upon repair. Each entry needs to define a list of strings for 'items' that can be used for the repair and an optional 'repair_amount' for how much durability is repaired.

| Field | Type | Default | Notes |
|---|---|---|---|
| `repair_items` | string | `[]` | List of repair item entries. Each entry needs to define a list of strings for `items` that can be used for the repair and an optional `repair_amount` for how much durability is gained. |

Example (sample):
```json
{
 "on_repaired": "minecraft:celebrate",
 "repair_items": [
  "anvil"
 ]
}
```

### minecraft:seed

_since 1.10.0_

Sets the item as a seed that can be planted to grow crops. When used on valid ground, the seed will place the specified crop block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `crop_result` | string |  | **required**. The block identifier that will be placed when the seed is planted (e.g., 'wheat', 'beetroot', 'cave_vines'). |
| `plant_at` | stringArray |  | Array of block identifiers that this seed can be planted on or attached to. If not specified, standard farmland rules apply. |
| `plant_at_any_solid_surface` | boolean | `false` | deprecated, since 1.16.0. If true, the seed can be planted on any solid surface, not just farmland or specified blocks. This property was deprecated and removed in versions after 1.18. |
| `plant_at_face` | stringEnum |  | deprecated, since 1.16.0. The face of a block where this seed can be planted. Values: 'UP' for top of blocks (normal crops), 'DOWN' for bottom (hanging plants like glow berries). This property was deprecated and removed in versions after 1.18. |

Example (/minecraft:item/components/minecraft:seed/):
```json
{
 "crop_result": "beetroot"
}
```

### minecraft:shooter

_since 1.20.10_

Compels an item to shoot projectiles, similarly to a bow or crossbow. Must have the minecraft:use_modifiers component in order to function properly.

> Ammunition used by minecraft:shooter must have the minecraft:projectile component in order to function properly.

> Items equipped with the shooter component will only sustain damage while shooting. Durability will remain unaffected if the item is used for melee attacks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ammunition` | objectArray | `[]` | A list of ammunition entries that define which items can be used as projectiles for this shooter. Each entry specifies the item, whether to search the offhand, inventory, and whether to use in creative mode. See `item/ammunition`. |
| `charge_on_draw` | boolean | `false` | **required**. When true, the shooter begins charging when the player starts drawing, similar to a crossbow. Default is false. |
| `max_draw_duration` | float | `0` | **required**. The maximum time in seconds that a player can draw the shooter before it automatically fires or reaches maximum power. Default is 0. |
| `scale_power_by_draw_duration` | boolean | `false` | **required**. When true, the projectile's launch power increases based on how long the player holds the use button before releasing. Default is false. |

Example (sample):
```json
{
 "ammunition": [
  {
   "item": "custom_projectile",
   "use_offhand": true,
   "search_inventory": true,
   "use_in_creative": true
  }
 ],
 "max_draw_duration": 1,
 "scale_power_by_draw_duration": true,
 "charge_on_draw": false
}
```

### minecraft:should_despawn

_since 1.20.30_

Should_despawn component determines if the item should eventually despawn while floating in the world

### minecraft:stacked_by_data

_since 1.20.30_

The stacked_by_data component determines whether the same items with different aux values can stack. Also defines whether the item entities can merge while floating in the world.

Example (/minecraft:item/components/minecraft:stacked_by_data/):
```json
true
```

### minecraft:storage_item

_since 1.21.40_

Enables an item to store data of the dynamic container associated with it. A dynamic container is a container for storing items that is linked to an item instead of a block or an entity.

> While this component can be defined on its own, to be able to interact with the item's storage container the item must have a `minecraft:bundle_interaction` item component defined.

> Available without experimental toggle in 1.21.110.

> In 1.26.0, equipping an item with this component into an armor or hand slot no longer deletes the storage contents.

| Field | Type | Default | Notes |
|---|---|---|---|
| `allow_nested_storage_items` | boolean | `true` | Determines whether another Storage Item is allowed inside of this item. Default is true. |
| `allowed_items` | string | `[]` | List of items that are exclusively allowed in this Storage Item. If empty all items are allowed. |
| `banned_items` | string | `[]` | List of items that are not allowed in this Storage Item. |
| `max_slots` | int | `64` | The maximum allowed weight of the sum of all contained items. Maximum is 64. Default is 64. |

Example (/minecraft:item/components/minecraft:storage_item/):
```json
{
 "max_slots": 64,
 "allow_nested_storage_items": true,
 "banned_items": [
  "minecraft:shulker_box",
  "minecraft:undyed_shulker_box"
 ]
}
```

### minecraft:storage_weight_limit

_since 1.21.110_

Specifies the maximum weight limit that a storage item can hold

> Available without experimental toggle in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max_weight_limit` | int | `64` | The maximum allowed weight of the sum of all contained items. Maximum is 64. Default is 64. |

Example (/minecraft:item/components/minecraft:storage_weight_limit/):
```json
{
 "max_weight_limit": 64
}
```

### minecraft:storage_weight_modifier

_since 1.21.110_

Specifies the maximum weight limit that a storage item can hold

> Available without experimental toggle in 1.21.110.

| Field | Type | Default | Notes |
|---|---|---|---|
| `weight_in_storage_item` | int | `4` | The weight of this item when inside another Storage Item. Default is 4. 0 means item is not allowed in another Storage Item. |

Example (/minecraft:item/components/minecraft:storage_weight_modifier/):
```json
{
 "weight_in_storage_item": 4
}
```

### minecraft:swing_duration

_since 1.21.120_

Duration, in seconds, of the item's swing animation played when mining or attacking. Affects visuals only and does not impact attack frequency or other gameplay mechanics.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float | `0.30000001192092896` | Duration, in seconds, of the item's swing animation played when mining or attacking. Affects visuals only and does not impact attack frequency or other gameplay mechanics. |

### minecraft:swing_sounds

_since 1.21.130_

Overrides the swing sounds emitted by the user.

| Field | Type | Default | Notes |
|---|---|---|---|
| `attack_critical_hit` | stringEnum |  | Sound played when an attack hits and deals critical damage. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |
| `attack_hit` | stringEnum |  | Sound played when an attack hits. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |
| `attack_miss` | stringEnum |  | Sound played when an attack misses or deals no damage due to invulnerability. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |

### minecraft:tags

_since 1.20.50_

Determines which tags are included on a given item

| Field | Type | Default | Notes |
|---|---|---|---|
| `tags` | stringArray | `[]` | An array that can contain multiple item tags. |

Example (sample):
```json
{
 "do_swing_animation": false,
 "launch_power_scale": 1,
 "max_draw_duration": 0,
 "max_launch_power": 1,
 "min_draw_duration": 0,
 "scale_power_by_draw_duration": false
}
```

### minecraft:throwable

_since 1.20.10_

Makes an item throwable by the player, similar to a snowball or ender pearl. Use with minecraft:projectile to specify which entity is spawned when thrown.

> Combine with minecraft:projectile to define the projectile entity. For charged throws (like tridents), set scale_power_by_draw_duration to true and configure min/max draw durations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `do_swing_animation` | boolean | `false` | Determines whether the item should use the swing animation when thrown. Default is set to false. |
| `launch_power_scale` | float | `1` | The scale at which the power of the throw increases. Default is set to 1.0. |
| `max_draw_duration` | float | `0` | The maximum duration to draw a throwable item. Default is set to 0.0. |
| `max_launch_power` | float | `1` | The maximum power to launch the throwable item. Default is set to 1.0. |
| `min_draw_duration` | float | `0` | The minimum duration to draw a throwable item. Default is set to 0.0. |
| `scale_power_by_draw_duration` | boolean | `false` | Whether or not the power of the throw increases with duration charged. Default is set to false. |

Example (/minecraft:item/components/minecraft:throwable/):
```json
{
 "do_swing_animation": true,
 "launch_power_scale": 1.5,
 "max_launch_power": 1.5
}
```

### minecraft:use_animation

_since 1.20.30_

Use_animation specifies which animation is played when the player uses the item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | string |  | Specifies which animation to play when the item is used. |

Example (/minecraft:item/components/minecraft:use_animation/):
```json
"eat"
```

### minecraft:use_modifiers

_since 1.20.50_

Determines how long an item takes to use in combination with components such as Shooter, Throwable, or Food.

> Renamed from `chargeable` in 1.20.50 and available without an experimental toggle.

| Field | Type | Default | Notes |
|---|---|---|---|
| `emit_vibrations` | boolean | `true` | Whether vibrations are emitted when the item starts or stops being used. |
| `movement_modifier` | float |  | Multiplier applied to the player's movement speed while the item is in use. |
| `start_sound` | stringEnum |  | Sound played when the item starts being used. Values: `absorb_block`, `activate`, `add.chest`, `admire`, `agitated`, `ambient`, `ambient.aggressive`, `ambient.baby`, `ambient.basalt_deltas.additions`, `ambient.basalt_deltas.loop`, `ambient.basalt_deltas.mood`, `ambient.candle`, `ambient.cave`, `ambient.crimson_forest.additions`, `ambient.crimson_forest.loop`, `ambient.crimson_forest.mood`, `ambient.in.air`, `ambient.in.raid`, `ambient.in.water`, `ambient.nether_wastes.additions`, `ambient.nether_wastes.loop`, `ambient.nether_wastes.mood`, `ambient.pollinate`, `ambient.screamer`, …. |
| `start_using` | string | `"always"` | since 1.26.30. When the player begins using the item. Use `always` to start as soon as the use action is triggered (default), or `on_attack` to start using only when an attack input is received while the item is selected. Values: `always`, `if_first`. |
| `use_duration` | float | `0` | Time, in seconds, that the item takes to use. |

Example (/minecraft:item/components/minecraft:use_modifiers/):
```json
{
 "start_using": "always",
 "use_duration": 1.6,
 "movement_modifier": 0.35
}
```

### minecraft:wearable

_since 1.20.30_

Sets the wearable item component, which allows an item to be worn by a player in a specified equipment slot.

> Valid equipment slots are: slot.armor.head, slot.armor.chest, slot.armor.legs, slot.armor.feet, slot.armor.body, and slot.weapon.offhand. When a non-hand armor slot is used, the max stack size is automatically set to 1.

> Fixed in format version 1.26.30: when a non-hand slot is selected, `minecraft:wearable` no longer silently overrides an explicit `minecraft:max_stack_size` of 1. Custom items can again declare their own stack size alongside an armor slot without producing inconsistent behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `hides_player_location` | boolean | `false` | Determines whether the Player's location is hidden on Locator Maps and the Locator Bar when the wearable item is worn. Default is false. |
| `protection` | int | `0` | How much protection the wearable item provides. Default is set to 0. |
| `slot` | stringEnum |  | **required**. Specifies where the item can be worn. If any non-hand slot is chosen, the max stack size is set to 1. Values: `slot.armor.body`, `slot.armor.chest`, `slot.armor.feet`, `slot.armor.head`, `slot.armor.legs`, `slot.weapon.mainhand`, `slot.weapon.offhand`. |
| `dispensable` | boolean |  | deprecated |

## Documents and sub-objects (31)

### components v1.21.80 (80)

List of all components used in this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:allow_off_hand` | boolean |  | The allow_off_hand component determines whether the item can be placed in the off hand slot of the inventory. |
| `minecraft:block_placer` |  |  | Items with the block_placer component will place a block when used. This component can also be used instead of the "minecraft:icon" component to render the referenced block as the item icon. See `item_components/minecraft_block_placer`. |
| `minecraft:bundle_interaction` |  |  | [EXPERIMENTAL] Adds bundle-specific interactions and tooltip to the item. Requires a "minecraft:storage_item" component. See `item_components/minecraft_bundle_interaction`. |
| `minecraft:can_destroy_in_creative` | boolean |  | The can_destroy_in_creative component determines if the item can be used by a player to break blocks when in creative mode. |
| `minecraft:compostable` |  |  | Specifies that an item is compostable and provides the chance of creating a composting layer in the composter See `item_components/minecraft_compostable`. |
| `minecraft:cooldown` |  |  | Adds a cooldown to the item so that, after performing an action of the specified "type", all items with a "minecraft:cooldown" component in the same "category" become unable to perform that same type of action for the number of seconds defined in "duration". See `item_components/minecraft_cooldown`. |
| `minecraft:custom_components` |  |  | Specifies an array of custom components defined in a script that should be added to this item. |
| `minecraft:damage` | int |  | The damage component determines how much extra damage the item does on attack. |
| `minecraft:damage_absorption` |  |  | It allows an item to absorb damage that would otherwise be dealt to its wearer. For this to happen, the item needs to be equipped in an armor slot. The absorbed damage reduces the item's durability, with any excess damage being ignored. Because of this, the i… See `item_components/minecraft_damage_absorption`. |
| `minecraft:digger` |  |  | Digger item component specifies how quickly this item can dig specific blocks. See `item_components/minecraft_digger`. |
| `minecraft:display_name` |  |  | The display_name item component specifies the text shown whenever an item's name is displayed, like in hover text. See `item_components/minecraft_display_name`. |
| `minecraft:durability` |  |  | The durability item component specifies how much damage the item takes before breaking, and allows the item to be combined to repair or augment them. See `item_components/minecraft_durability`. |
| `minecraft:durability_sensor` |  |  | Enables an item to emit effects when it receives damage. Because of this, the item also needs a `minecraft:durability` component. See `item_components/minecraft_durability_sensor`. |
| `minecraft:dyeable` |  |  | Minecraft Dyeable See `item_components/minecraft_dyeable`. |
| `minecraft:enchantable` |  |  | The enchantable component specifies what enchantments can be applied to the item. Not all enchantments will have an effect on all item components. See `item_components/minecraft_enchantable`. |
| `minecraft:entity_placer` |  |  | The entity_placer item component specifies the blocks that the item can be placed on. See `item_components/minecraft_entity_placer`. |
| `minecraft:food` |  |  | When an item has a food component, it becomes edible to the player. Must have the 'minecraft:use_duration' component in order to function properly. See `item_components/minecraft_food`. |
| `minecraft:fuel` | float |  | Fuel item component allows this item to be used as fuel in a furnace to 'cook' other items. |
| `minecraft:glint` | boolean |  | The glint component determines whether the item has the enchanted glint render effect on it. |
| `minecraft:hand_equipped` | boolean |  | The hand_equipped component determines if an item is rendered like a tool while it is in a player's hand. |
| `minecraft:hover_text_color` | string |  | The hover_text_color component specifies the color of the item name when the players hovers the cursor over the item. |
| `minecraft:icon` | string |  | Icon item component determines which icon graphic will be used to represent the item in the UI and elsewhere. |
| `minecraft:interact_button` | boolean |  | This component is a boolean or string that determines if the interact button is shown in touch controls and what text is displayed on the button. When set as true, default "Use Item" text will be displayed. |
| `minecraft:liquid_clipped` | boolean |  | The liquid_clipped component determines whether the item interacts with liquid blocks on use. |
| `minecraft:max_stack_size` | int |  | The max_stack_size component specifies how many of the item can be stacked together. |
| `minecraft:projectile` |  |  | Projectile items shoot out, like an arrow. See `item_components/minecraft_projectile`. |
| `minecraft:rarity` | string |  | Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item. |
| `minecraft:record` |  |  | Record Item Component. Used by record items to play music. See `item_components/minecraft_record`. |
| `minecraft:repairable` |  |  | The repairable item component specifies which items can be used to repair this item, along with how much durability is gained. See `item_components/minecraft_repairable`. |
| `minecraft:shooter` |  |  | Shooter Item Component. See `item_components/minecraft_shooter`. |
| `minecraft:should_despawn` | boolean |  | Should_despawn component determines if the item should eventually despawn while floating in the world |
| `minecraft:stacked_by_data` | boolean |  | The stacked_by_data component determines whether the same items with different aux values can stack. Also defines whether the item entities can merge while floating in the world. |
| `minecraft:storage_item` |  |  | [EXPERIMENTAL] Storage Items can be used by other components to store other items within this item. See `item_components/minecraft_storage_item`. |
| `minecraft:storage_weight_limit` |  |  | Specifies the maximum weight limit that a storage item can hold See `item_components/minecraft_storage_weight_limit`. |
| `minecraft:storage_weight_modifier` |  |  | Specifies the maximum weight limit that a storage item can hold See `item_components/minecraft_storage_weight_modifier`. |
| `minecraft:tags` |  |  | The tags component specifies which tags an item has on it. See `item_components/minecraft_tags`. |
| `minecraft:throwable` |  |  | Throwable items can be thrown by the player, such as a snowball. See `item_components/minecraft_throwable`. |
| `minecraft:use_animation` | string |  | Use_animation specifies which animation is played when the player uses the item. |
| `minecraft:use_modifiers` |  |  | Modifies use behavior, including how long the item takes to use and the player's movement speed. See `item_components/minecraft_use_modifiers`. |
| `minecraft:wearable` |  |  | Wearable items can be worn by a player in the head, chest, legs, feet, or off-hand slots. See `item_components/minecraft_wearable`. |

### Ammunition (ammunition)

Configures this item as ammunition consumed by ranged weapons like bows and crossbows. Reference compatible shooter items and specify search behavior for inventory slots. When players use the associated weapon, this item is consumed and its projectile is launched.

| Field | Type | Default | Notes |
|---|---|---|---|
| `item` | string |  | **required**. Ammunition item description identifier. |
| `search_inventory` | boolean | `false` | Can search inventory? Default is set to false. |
| `use_in_creative` | boolean | `false` | Can use in creative mode? Default is set to false. |
| `use_offhand` | boolean | `false` | Can use off-hand? Default is set to false. |

### block (block)

Has block name, states, and tags.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### BlockDescriptorProxy (blockdescriptorproxy)

References a block type with optional state values and tags for item components. Used by components like minecraft:block_placer to specify which block an item places, or by mining behaviors to identify blocks the tool affects. Enables items that interact with specific block types.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### BlockInfo (blockinfo)

Associates a block type with a custom digging speed multiplier for the minecraft:digger component. Map blocks to speed values so pickaxes mine stone quickly, axes chop wood faster, and custom tools excel at specific materials. Enables tool specialization matching vanilla Minecraft conventions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` | object |  | **required**. Block to be dug. |
| `speed` | int |  | **required**. Digging speed for the correlating block(s). |

### components v1.21.80 (components)

List of all components used in this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:allow_off_hand` | boolean |  | The allow_off_hand component determines whether the item can be placed in the off hand slot of the inventory. |
| `minecraft:block_placer` | object |  | Items with the block_placer component will place a block when used. See `item/minecraft_block_placer`. |
| `minecraft:can_destroy_in_creative` | boolean |  | The can_destroy_in_creative component determines if the item can be used by a player to break blocks when in creative mode. |
| `minecraft:cooldown` | object |  | Adds a cooldown to the item so that, after performing an action of the specified "type", all items with a "minecraft:cooldown" component in the same "category" become unable to perform that same type of action for the number of seconds defined in "duration". See `item/minecraft_cooldown`. |
| `minecraft:damage` | int |  | The damage component determines how much extra damage the item does on attack. |
| `minecraft:digger` | object |  | Digger item component specifies how quickly this item can dig specific blocks. See `item/minecraft_digger`. |
| `minecraft:display_name` | object |  | The display_name item component specifies the text shown whenever an item's name is displayed, like in hover text. See `item/minecraft_display_name`. |
| `minecraft:durability` | object |  | The durability item component specifies how much damage the item takes before breaking, and allows the item to be combined to repair or augment them. See `item/minecraft_durability`. |
| `minecraft:enchantable` | object |  | The enchantable component specifies what enchantments can be applied to the item. Not all enchantments will have an effect on all item components. See `item/minecraft_enchantable`. |
| `minecraft:entity_placer` | object |  | The entity_placer item component specifies the blocks that the item can be placed on. See `item/minecraft_entity_placer`. |
| `minecraft:food` | object |  | When an item has a food component, it becomes edible to the player. Must have the 'minecraft:use_duration' component in order to function properly. See `item/minecraft_food`. |
| `minecraft:fuel` | float |  | Fuel item component allows this item to be used as fuel in a furnace to 'cook' other items. |
| `minecraft:glint` | boolean |  | The glint component determines whether the item has the enchanted glint render effect on it. |
| `minecraft:hand_equipped` | boolean |  | The hand_equipped component determines if an item is rendered like a tool while it is in a player's hand. |
| `minecraft:hover_text_color` | string |  | The hover_text_color component specifies the color of the item name when the players hovers the cursor over the item. |
| `minecraft:icon` | string |  |  |
| `minecraft:interact_button` | boolean |  | This component is a boolean or string that determines if the interact button is shown in touch controls and what text is displayed on the button. When set as true, default "Use Item" text will be displayed. |
| `minecraft:liquid_clipped` | boolean |  | The liquid_clipped component determines whether the item interacts with liquid blocks on use. |
| `minecraft:max_stack_size` | int |  | The max_stack_size component specifies how many of the item can be stacked together. |
| `minecraft:projectile` | object |  | Projectile items shoot out, like an arrow. See `item/minecraft_projectile`. |
| `minecraft:record` | object |  | Record Item Component. Used by record items to play music. See `item/minecraft_record`. |
| `minecraft:repairable` | object |  | The repairable item component specifies which items can be used to repair this item, along with how much durability is gained. See `item/minecraft_repairable`. |
| `minecraft:shooter` | object |  | Shooter Item Component. See `item/minecraft_shooter`. |
| `minecraft:should_despawn` | boolean |  | Should_despawn component determines if the item should eventually despawn while floating in the world |
| `minecraft:stacked_by_data` | boolean |  | The stacked_by_data component determines whether the same items with different aux values can stack. Also defines whether the item entities can merge while floating in the world. |
| `minecraft:tags` | object |  | The tags component specifies which tags an item has on it. See `item/minecraft_tags`. |
| `minecraft:throwable` | object |  | Throwable items can be thrown by the player, such as a snowball. See `item/minecraft_throwable`. |
| `minecraft:use_animation` | string |  | Use_animation specifies which animation is played when the player uses the item. |
| `minecraft:use_modifiers` | object |  | Modifies use behavior, including how long the item takes to use and the player's movement speed. See `item/minecraft_use_modifiers`. |
| `minecraft:wearable` | object |  | Wearable items can be worn by a player in the head, chest, legs, feet, or off-hand slots. See `item/minecraft_wearable`. |

### description (description)

Contains the required identifier for the item. May contain optional fields like menu_category.

| Field | Type | Default | Notes |
|---|---|---|---|
| `identifier` | string |  | **required**. Unique name for the item that must include a namespace and must not use the Minecraft namespace unless overriding a Vanilla item. |
| `menu_category` | object | `{"category":"none","group":null,"is_hidden_in_commands":nul…` | menu_category contains the creative group name and category for this item. See `item/menu_category`. |

### diggeritemcomponent_blockinfo (diggeritemcomponent_blockinfo)

DiggerItemComponent BlockInfo

| Field | Type | Default | Notes |
|---|---|---|---|
| `block` |  |  | Block to be dug. |
| `speed` | int |  | Digging speed for the correlating block(s). |

### diggerlegacyblockinfo (diggerlegacyblockinfo)

DiggerLegacyBlockInfo

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_dig` |  |  | In format versions before 1.20.20, trigger for when you dig a block that matches this filter |
| `block` |  |  | Block to be dug. |
| `speed` | int |  | Digging speed for the correlating block(s). |

### dispense_on (dispense_on)

Can be dispensed on specified blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |

### FloatRange (floatrange)

Specifies a numeric range between minimum and maximum values for randomized item properties. Used for variable durability, damage ranges, or timing intervals. The game picks a random value within the range when the property is evaluated, adding natural variation to item behavior.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | float | `0` | Max |
| `min` | float | `0` | Min |

### iitemcomponentlegacyfactorydata_components (iitemcomponentlegacyfactorydata_components)

IItemComponentLegacyFactoryData Components

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:armor` |  |  | The armor item component determines the amount of protection you have in your armor item. |
| `minecraft:durability` |  |  | The durability item component specifies how much damage the item takes before breaking, and allows the item to be combined to repair or augment them. |
| `minecraft:chargeable` |  |  | Event trigger for when the item has completed its use duration. |
| `minecraft:throwable` |  |  | Throwable items can be thrown by the player, such as a snowball. |
| `minecraft:display_name` |  |  | The display_name item component specifies the text shown whenever an item's name is displayed, like in hover text. |
| `minecraft:cooldown` |  |  | After you use an item, all items specified with the same `cool down category` setting becomes unusable for the duration specified by the 'cool down time' setting in this component. |
| `minecraft:digger` |  |  | Digger item component specifies how quickly this item can dig specific blocks. |
| `minecraft:use_animation` |  |  | Use_animation specifies which animation is played when the player uses the item. |
| `minecraft:dyeable` |  |  | Dyeable item. You can set a default dye color for this dyeable item. |
| `minecraft:entity_placer` |  |  | The entity_placer item component specifies the blocks that the item can be placed on. |
| `minecraft:food` |  |  | When an item has a food component, it becomes edible to the player. |
| `minecraft:use_duration` |  |  | This component determines how long the item takes to use when used in combination with components like "shooter", "throwable", or "food". |
| `minecraft:fuel` |  |  | Fuel item component allows this item to be used as fuel in a furnace to 'cook' other items. |
| `minecraft:weapon` |  |  | Weapon Item Component. Added to every weapon item such as axe, sword, trident, bow, crossbow. |
| `minecraft:glint` |  |  | The glint component determines whether the item has the enchanted glint render effect on it. |
| `minecraft:icon` |  |  | Icon item component determines which icon graphic will be used to represent the item in the UI and elsewhere. |
| `minecraft:on_use` |  |  | The on_use item component allows you to receive an event when the item is used. |
| `minecraft:record` |  |  | Record Item Component. Used by record items to play music. |
| `minecraft:damage` |  |  | The damage component determines how much extra damage the item does on attack. |
| `minecraft:on_use_on` |  |  | The on_use_on item component allows you to receive an event when the item is used on a block in the world. |
| `minecraft:block_placer` |  |  | Items with the block_placer component will place a block when used. |
| `minecraft:projectile` |  |  | Projectile items shoot out, like an arrow. |
| `minecraft:render_offsets` |  |  | Render offsets component: optional values can be given to offset the way the item is rendered. |
| `minecraft:repairable` |  |  | The repairable item component specifies which items can be used to repair this item, along with how much durability is gained. |
| `minecraft:shooter` |  |  | Shooter Item Component. Must have the 'minecraft:use_duration' component in order to function properly. |
| `minecraft:wearable` |  |  | Wearable item component. |
| `minecraft:max_stack_size` |  |  | The max_stack_size component specifies how many of the item can be stacked together. |
| `minecraft:bundle_interaction` |  |  | [EXPERIMENTAL] Adds bundle-specific interactions and tooltip to the item. Requires a "minecraft:storage_item" component. |
| `minecraft:rarity` |  |  | Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item. |
| `minecraft:can_destroy_in_creative` |  |  | The can_destroy_in_creative component determines if the item can be used by a player to break blocks when in creative mode. |
| `minecraft:hover_text_color` |  |  | The hover_text_color component specifies the color of the item name when the players hovers the cursor over the item. |
| `minecraft:stacked_by_data` |  |  | The stacked_by_data component determines whether the same items with different aux values can stack. Also defines whether the item entities can merge while floating in the world. |
| `minecraft:hand_equipped` |  |  | The hand_equipped component determines if an item is rendered like a tool while it is in a player's hand. |
| `minecraft:should_despawn` |  |  | Should_despawn component determines if the item should eventually despawn while floating in the world |
| `minecraft:allow_off_hand` |  |  | The allow_off_hand component determines whether the item can be placed in the off hand slot of the inventory. |
| `minecraft:tags` |  |  | The tags component specifies which tags an item has on it. |
| `minecraft:liquid_clipped` |  |  | The liquid_clipped component determines whether the item interacts with liquid blocks on use. |
| `minecraft:enchantable` |  |  | The enchantable component specifies what enchantments can be applied to the item. Not all enchantments will have an effect on all item components. |
| `minecraft:interact_button` |  |  | This component is a boolean or string that determines if the interact button is shown in touch controls and what text is displayed on the button. When set as true, default "Use Item" text will be displayed. |
| `minecraft:storage_item` |  |  | [EXPERIMENTAL] Storage Items can be used by other components to store other items within this item. |
| `minecraft:compostable` |  |  | Specifies that an item is compostable and provides the chance of creating a composting layer in the composter. |
| `minecraft:storage_weight_limit` |  |  | Controls the maximum weight a storage item can hold. |
| `minecraft:storage_weight_modifier` |  |  | Controls the maximum weight a storage item can hold. |

### IntRange (intrange)

Specifies an integer range between minimum and maximum values for item properties requiring whole numbers. Used for stack count variations, discrete charge levels, or quantity ranges in loot tables. Ensures values stay within valid bounds for countable item properties.

| Field | Type | Default | Notes |
|---|---|---|---|
| `max` | int | `0` | Max |
| `min` | int | `0` | Min |

### item_behavior_document (item_behavior_document)

A behavior pack item definition document for Minecraft Bedrock Edition. This describes the complete JSON file structure including format_version and the minecraft:item wrapper. Items define the properties, components, and behaviors of custom items that can be obtained and used by players.

| Field | Type | Default | Notes |
|---|---|---|---|
| `format_version` | version |  | **required**. The format version of this item behavior file. Determines which features and component schemas are available. Use '1.20.20' or later for the latest item component system. |
| `minecraft:item` | object |  | **required**. The item definition container with description and components sections. |

### Item Components (item_components)

List of all components used in this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `minecraft:allow_off_hand` | boolean |  | The allow_off_hand component determines whether the item can be placed in the off hand slot of the inventory. |
| `minecraft:block_placer` | object |  | Items with the block_placer component will place a block when used. This component can also be used instead of the "minecraft:icon" component to render the referenced block as the item icon. See `item/minecraft_block_placer`. |
| `minecraft:bundle_interaction` | object |  | [EXPERIMENTAL] Adds bundle-specific interactions and tooltip to the item. Requires a "minecraft:storage_item" component. See `item/minecraft_bundle_interaction`. |
| `minecraft:can_destroy_in_creative` | boolean |  | The can_destroy_in_creative component determines if the item can be used by a player to break blocks when in creative mode. |
| `minecraft:compostable` | object |  | Specifies that an item is compostable and provides the chance of creating a composting layer in the composter See `item/minecraft_compostable`. |
| `minecraft:cooldown` | object |  | Adds a cooldown to the item so that, after performing an action of the specified "type", all items with a "minecraft:cooldown" component in the same "category" become unable to perform that same type of action for the number of seconds defined in "duration". See `item/minecraft_cooldown`. |
| `minecraft:damage` | int |  | The damage component determines how much extra damage the item does on attack. |
| `minecraft:damage_absorption` | object |  | It allows an item to absorb damage that would otherwise be dealt to its wearer. For this to happen, the item needs to be equipped in an armor slot. The absorbed damage reduces the item's durability, with any excess damage being ignored. Because of this, the i… See `item/minecraft_damage_absorption`. |
| `minecraft:digger` | object |  | Digger item component specifies how quickly this item can dig specific blocks. See `item/minecraft_digger`. |
| `minecraft:display_name` | object |  | The display_name item component specifies the text shown whenever an item's name is displayed, like in hover text. See `item/minecraft_display_name`. |
| `minecraft:durability` | object |  | The durability item component specifies how much damage the item takes before breaking, and allows the item to be combined to repair or augment them. See `item/minecraft_durability`. |
| `minecraft:durability_sensor` | object |  | Enables an item to emit effects when it receives damage. Because of this, the item also needs a `minecraft:durability` component. See `item/minecraft_durability_sensor`. |
| `minecraft:dyeable` | object |  | Minecraft Dyeable See `item/minecraft_dyeable`. |
| `minecraft:enchantable` | object |  | The enchantable component specifies what enchantments can be applied to the item. Not all enchantments will have an effect on all item components. See `item/minecraft_enchantable`. |
| `minecraft:entity_placer` | object |  | The entity_placer item component specifies the blocks that the item can be placed on. See `item/minecraft_entity_placer`. |
| `minecraft:fire_resistant` | object |  | Determines whether the item is immune to burning when dropped in fire or lava. See `item/minecraft_fire_resistant`. |
| `minecraft:food` | object |  | When an item has a food component, it becomes edible to the player. Must have the 'minecraft:use_duration' component in order to function properly. See `item/minecraft_food`. |
| `minecraft:fuel` | float |  | Fuel item component allows this item to be used as fuel in a furnace to 'cook' other items. |
| `minecraft:glint` | boolean |  | The glint component determines whether the item has the enchanted glint render effect on it. |
| `minecraft:hand_equipped` | boolean |  | The hand_equipped component determines if an item is rendered like a tool while it is in a player's hand. |
| `minecraft:hover_text_color` | string |  | The hover_text_color component specifies the color of the item name when the players hovers the cursor over the item. |
| `minecraft:icon` | string |  | Icon item component determines which icon graphic will be used to represent the item in the UI and elsewhere. |
| `minecraft:interact_button` | boolean |  | This component is a boolean or string that determines if the interact button is shown in touch controls and what text is displayed on the button. When set as true, default "Use Item" text will be displayed. |
| `minecraft:kinetic_weapon` | object |  | Allows an item to deal kinetic damage and its effects. This happens every tick while in use, in a straight line along the user's view vector, with damage computed based on both the user's and the target's velocity projected onto the view vector (via a dot pro… See `item/minecraft_kinetic_weapon`. |
| `minecraft:liquid_clipped` | boolean |  | The liquid_clipped component determines whether the item interacts with liquid blocks on use. |
| `minecraft:max_stack_size` | int |  | The max_stack_size component specifies how many of the item can be stacked together. |
| `minecraft:piercing_weapon` | object |  | Allows an item to deal damage to all entities detected in a straight line along the user's view vector. Items with this component cannot destroy blocks, as the attack action always takes priority, regardless of what the user is looking at. See `item/minecraft_piercing_weapon`. |
| `minecraft:projectile` | object |  | Projectile items shoot out, like an arrow. See `item/minecraft_projectile`. |
| `minecraft:rarity` | string |  | Specifies the base rarity and subsequently color of the item name when the player hovers the cursor over the item. |
| `minecraft:record` | object |  | Record Item Component. Used by record items to play music. See `item/minecraft_record`. |
| `minecraft:repairable` | object |  | The repairable item component specifies which items can be used to repair this item, along with how much durability is gained. See `item/minecraft_repairable`. |
| `minecraft:shooter` | object |  | Shooter Item Component. See `item/minecraft_shooter`. |
| `minecraft:should_despawn` | boolean |  | Should_despawn component determines if the item should eventually despawn while floating in the world |
| `minecraft:stacked_by_data` | boolean |  | The stacked_by_data component determines whether the same items with different aux values can stack. Also defines whether the item entities can merge while floating in the world. |
| `minecraft:storage_item` | object |  | [EXPERIMENTAL] Storage Items can be used by other components to store other items within this item. See `item/minecraft_storage_item`. |
| `minecraft:storage_weight_limit` | object |  | Specifies the maximum weight limit that a storage item can hold See `item/minecraft_storage_weight_limit`. |
| `minecraft:storage_weight_modifier` | object |  | Specifies the maximum weight limit that a storage item can hold See `item/minecraft_storage_weight_modifier`. |
| `minecraft:swing_duration` | object |  | Duration, in seconds, of the item's swing animation played when mining or attacking. Affects visuals only and does not impact attack frequency or other gameplay mechanics. See `item/minecraft_swing_duration`. |
| `minecraft:swing_sounds` | object |  | Overrides the swing sounds emitted by the user. See `item/minecraft_swing_sounds`. |
| `minecraft:tags` | object |  | The tags component specifies which tags an item has on it. See `item/minecraft_tags`. |
| `minecraft:throwable` | object |  | Throwable items can be thrown by the player, such as a snowball. See `item/minecraft_throwable`. |
| `minecraft:use_animation` | string |  | Use_animation specifies which animation is played when the player uses the item. |
| `minecraft:use_modifiers` | object |  | Modifies use behavior, including how long the item takes to use and the player's movement speed. See `item/minecraft_use_modifiers`. |
| `minecraft:wearable` | object |  | Wearable items can be worn by a player in a specified slot. See `item/minecraft_wearable`. |

### Item Document (item_document)

| Field | Type | Default | Notes |
|---|---|---|---|
| `components` | object |  | **required**. List of all components used in this item. See `item/item_components`. |
| `description` | object |  | **required**. Contains the required identifier for the item. May contain optional fields like menu_category. See `item/description`. |

### item_transforms (item_transforms)

Item Transforms

| Field | Type | Default | Notes |
|---|---|---|---|
| `first_person` |  |  | First person transforms data |
| `third_person` |  |  | Third person transforms data |

### menu_category (menu_category)

menu_category contains the creative group name and category for this item.

| Field | Type | Default | Notes |
|---|---|---|---|
| `category` | string | `"none"` | Creative category where this item belongs. Defaults to "none". Values: `construction`, `equipment`, `items`, `nature`, `none`. |
| `group` | string |  | The Creative Group that this item belongs to. Group name is limited to 256 characters. The name also must start with a namespace. |
| `is_hidden_in_commands` | boolean |  | Determines whether or not this item can be used with commands. Defaults to false. |

### minecraft_chargeable (minecraft_chargeable)

_since 1.20.30 · **deprecated**_

Event trigger for when the item has completed its use duration.

> Released without an experimental toggle in 1.20.30; renamed to `minecraft:use_modifiers` in 1.20.50.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_complete` | object |  | Event trigger for when the item has completed its use duration. |
| `movement_modifier` | float |  | Modifier value to scale the players movement speed when item is in use. |

### minecraft_on_use (minecraft_on_use)

_**deprecated**_

The on_use_on item component allows you to receive an event when the item is used on a block in the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_use_on` |  |  | Event trigger for when the item is used. |

### minecraft_on_use_on (minecraft_on_use_on)

_**deprecated**_

The on_use_on item component allows you to receive an event when the item is used on a block in the world.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_use_on` |  |  | Event trigger for when the item is used. |

### minecraft_render_offsets (minecraft_render_offsets)

_**deprecated**_

Render offsets component: optional values can be given to offset the way the item is rendered.

| Field | Type | Default | Notes |
|---|---|---|---|
| `main_hand` |  |  | Main hand transform data. |
| `off_hand` |  |  | Offhand hand transform data. |

### minecraft_use_duration (minecraft_use_duration)

_**deprecated**_

This component determines how long the item takes to use when used in combination with components like "shooter", "throwable", or "food".

| Field | Type | Default | Notes |
|---|---|---|---|
| `value` | float |  | How long the item takes to use in seconds. |

Example (/minecraft:item/components/minecraft:use_duration/):
```json
32
```

### minecraft_weapon (minecraft_weapon)

_**deprecated**_

Deprecated weapon item component. This component is automatically added to vanilla weapon items like swords, axes, and bows.

> This component is deprecated. For custom weapons, use minecraft:damage to set attack damage, minecraft:cooldown for attack speed, and minecraft:durability for durability.

| Field | Type | Default | Notes |
|---|---|---|---|
| `on_hurt_entity` |  |  | An event trigger that fires when this item successfully damages another entity. |
| `on_not_hurt_entity` |  |  | An event trigger that fires when this item hits an entity but deals no damage (e.g., due to invincibility frames or immunity). |
| `on_hit_block` |  |  | An event trigger that fires when this item is used to strike a block. |

### Molang expression (molang_expression)

| Field | Type | Default | Notes |
|---|---|---|---|
| `expression` | string |  | **required**. Expression |
| `version` | int |  | **required**. Version |

### renderoffsetsitemcomponent_trs (renderoffsetsitemcomponent_trs)

RenderOffsetsItemComponent TRS

| Field | Type | Default | Notes |
|---|---|---|---|
| `position` |  |  | Position (x, y, z) data |
| `rotation` |  |  | Rotation (x, y, z) data |
| `scale` |  |  | Scale (x, y, z) data |

### repair_items (repair_items)

Repair Items

| Field | Type | Default | Notes |
|---|---|---|---|
| `items` |  |  | Items that may be used to repair an item. |
| `repair_amount` |  |  | How much the item is repaired. |

### repairableitemcomponent_repairitementry (repairableitemcomponent_repairitementry)

:RepairItemEntry

| Field | Type | Default | Notes |
|---|---|---|---|
| `items` |  |  | Items that may be used to repair an item. |
| `repair_amount` |  |  | How much the item is repaired. |

### shooteritemcomponent_ammunition (shooteritemcomponent_ammunition)

ShooterItemComponent Ammunition

| Field | Type | Default | Notes |
|---|---|---|---|
| `use_in_creative` | boolean |  | Can use in creative mode? Default is set to false. |
| `search_inventory` | boolean |  | Can search inventory? Default is set to false. |
| `item` |  |  | Ammunition item description identifier. |
| `use_offhand` | boolean |  | Can use off-hand? Default is set to false. |

### shooteritemcomponentlegacyfactorydata_shooterammunitionentry (shooteritemcomponentlegacyfactorydata_shooterammunitionentry)

ShooterItemComponentLegacyFactoryData ShooterAmmunitionEntry

| Field | Type | Default | Notes |
|---|---|---|---|
| `use_in_creative` | boolean |  | Can use in creative mode? Default is set to false. |
| `search_inventory` | boolean |  | Can search inventory? Default is set to false. |
| `item` |  |  | Ammunition item description identifier. |
| `use_offhand` | boolean |  | Can use off-hand? Default is set to false. |

### use_on (use_on)

Can be used on specified blocks.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `""` | Name |
| `states` | int | `{}` | States |
| `tags` | string | `""` | Tags |
