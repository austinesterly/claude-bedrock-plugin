# Entity filters, events and actions

Generated 2026-10-19 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/entityfilters, entityevents, action, action_set). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (145)

### actor_has_item_with_enchantment_in_slot (actor_has_item_with_enchantment_in_slot)

Tests that an actor has an item equipped with a given enchantment.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) A string value. |

Example (Full..):
```json
"{ \"test\": \"actor_has_item_with_enchantment_in_slot\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"\" }"
```

### actor_health (actor_health)

Tests the health of the subject.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"actor_health\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### all_slots_empty (all_slots_empty)

Returns true when the designated equipment location for the subject entity is completely empty.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |

Example (Full..):
```json
"{ \"test\": \"all_slots_empty\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"any\" }"
```

### any_slot_empty (any_slot_empty)

Returns true when the designated equipment location for the subject entity has any empty slot.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |

Example (Full..):
```json
"{ \"test\": \"any_slot_empty\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"any\" }"
```

### bool_property (bool_property)

Returns true when the bool actor property matches the value provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | (Required) The property name to look for |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"bool_property\", \"subject\": \"self\", \"domain\": \"minecraft:can_climb\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### clock_time (clock_time)

Compares the current time with a float value in the range (0.0, 1.0). 0.0= Noon 0.25= Sunset 0.5= Midnight 0.75= Sunrise

> `hourly_clock_time` an updated version of the clock_time filter that uses an Integer in a range of 0 to 24000 based on the in-game time.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"clock_time\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### distance_to_nearest_player (distance_to_nearest_player)

Compares the distance to the nearest Player with a float value.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"distance_to_nearest_player\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### enum_property (enum_property)

Returns true when the actor property matches the value provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | (Required) The property name to look for |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) A string value. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"enum_property\", \"subject\": \"self\", \"domain\": \"minecraft:can_climb\", \"operator\": \"equals\", \"value\": \"\" }"
```

### float_property (float_property)

Returns true when the float actor property matches the value provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | (Required) The property name to look for |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"float_property\", \"subject\": \"self\", \"domain\": \"minecraft:can_climb\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### has_ability (has_ability)

Returns true when the subject entity has the named ability.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Ability type to test Values: `flySpeed`, `flying`, `instabuild`, `invulnerable`, `lightning`, `mayfly`, `mute`, `noclip`, `verticalFlySpeed`, `walkSpeed`, `worldbuilder`. |

Example (Full..):
```json
"{ \"test\": \"has_ability\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"instabuild\" }"
```

### has_biome_tag (has_biome_tag)

Tests whether the biome the subject is in has the specified tag.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The tag to look for |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"has_biome_tag\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \" \" }"
```

### has_component (has_component)

Returns true when the subject entity contains the named component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The component name to look for |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"has_component\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"minecraft:explode\" }"
```

### has_container_open (has_container_open)

Returns true when the subject Player entity has opened a container.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_container_open\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_damage (has_damage)

Returns true when the subject entity receives the named damage type.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Damage type to test Values: `anvil`, `attack`, `block_explosion`, `contact`, `drowning`, `entity_explosion`, `fall`, `falling_block`, `fatal`, `fire`, `fire_tick`, `fly_into_wall`, `lava`, `magic`, `none`, `override`, `piston`, `projectile`, `self_destruct`, `sonic_boom`, `stalactite`, `stalagmite`, `starve`, `suffocation`, …. |

Example (Full..):
```json
"{ \"test\": \"has_damage\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"fatal\" }"
```

### has_damaged_equipment (has_damaged_equipment)

_since 1.20.80_

Tests for the presence of a damaged named item in the designated slot of the subject entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The item name to look for |

Example (Full..):
```json
"{ \"test\": \"has_damaged_equipment\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"dirt\" }"
```

### has_equipment (has_equipment)

Tests for the presence of a named item in the designated slot of the subject entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | The equipment location to test. Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The item name to look for |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"has_equipment\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"dirt\" }"
```

### has_equipment_block_tag (has_equipment_block_tag)

Tests for the presence of a block item with the specified block tag in the specified slot of the entity.

> Removed in format version 1.26.20. Block tags should not be used to drive item or equipment behavior decisions — use item-side conditions (such as `has_equipment` combined with item tags) instead.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The component name to look for |

Example (Full..):
```json
"{ \"test\": \"has_equipment_block_tag\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"minecraft:explode\" }"
```

### has_equipment_tag (has_equipment_tag)

_since 1.21.80_

Tests for the presence of an item with the named tag in the designated slot of the subject entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The item name to look for |

Example (Full..):
```json
"{ \"test\": \"has_equipment_tag\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"dirt\" }"
```

### has_item_with_component (has_item_with_component)

_since 1.21.130_

Returns true when the subject entity is holding a item with the specified component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The component name to look for |

Example (Full..):
```json
"{ \"test\": \"has_item_with_component\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"minecraft:explode\" }"
```

### has_mob_effect (has_mob_effect)

Tests whether the Subject has the specified mob effect.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Optional) A string value. |

Example (Full..):
```json
"{ \"test\": \"has_mob_effect\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"\" }"
```

### has_nametag (has_nametag)

Tests if the subject has been given a custom name.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_nametag\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_property (has_property)

Tests for the presence of a property of the subject entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The property name to look for |

Example (Full..):
```json
"{ \"test\": \"has_property\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"minecraft:can_climb\" }"
```

### has_ranged_weapon (has_ranged_weapon)

Returns true when the subject entity is holding a ranged weapon like a bow or crossbow.

> dandelion not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"has_ranged_weapon\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_same_equipment_in_slot_as (has_same_equipment_in_slot_as)

_since 1.26.20_

Returns whether the subject entity has the same item equipped in the specified slot as calling entity. Only supports specified slots: "main_hand", "head", "torso", "leg", "feet", and "body".

> Added in 1.26.20. Returns true when the subject entity has the same item equipped in the specified equipment slot as the referenced target (calling) entity. Supports the `main_hand`, `head`, `torso`, `leg`, `feet`, and `body` slots.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string | `"any"` | (Optional) The equipment location to test Values: `any`, `armor`, `body`, `feet`, `hand`, `head`, `inventory`, `leg`, `main_hand`, `torso`. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean |  | (Required) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_same_equipment_in_slot_as\", \"subject\": \"self\", \"domain\": \"any\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_silk_touch (has_silk_touch)

Tests if the subject is holding an item with silk touch.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_silk_touch\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_tag (has_tag)

Returns true if the subject entity has the tag provided.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Optional) A string value. |

Example (Full..):
```json
"{ \"test\": \"has_tag\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"\" }"
```

### has_target (has_target)

Returns true if the subject entity has a valid target.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_target\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### has_trade_supply (has_trade_supply)

Tests whether the target has any trade supply left. Will return false if the target cannot be traded with.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"has_trade_supply\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### home_distance (home_distance)

_since 1.21.60_

Tests the distance between the subject and its home. Returns false if the subject has no home or if their home is in a different dimension.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"home_distance\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### hourly_clock_time (hourly_clock_time)

Compares the current 24 hour time with an int value in the range[0, 24000]

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"hourly_clock_time\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### in_block (in_block)

Returns true when the subject entity is inside a specified Block type.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Optional) A string value. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_block\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"\" }"
```

### in_caravan (in_caravan)

Returns true if the subject entity is in a caravan.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `minecraft:damage_sensor` | object |  | Damage Sensor |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_caravan\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_clouds (in_clouds)

Returns true when the subject entity is in the clouds.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"in_clouds\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_contact_with_water (in_contact_with_water)

Returns true when the subject entity in contact with any water: water, rain, splash water bottle.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_contact_with_water\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_lava (in_lava)

Returns true when the subject entity is in lava.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_lava\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_nether (in_nether)

Returns true when the subject entity is in Nether.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"in_nether\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_overworld (in_overworld)

Returns true when the subject entity is in Overworld.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"in_overworld\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_water (in_water)

Returns true when the subject entity is in water.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_water\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### in_water_or_rain (in_water_or_rain)

Returns true when the subject entity is in water or rain.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"in_water_or_rain\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### inactivity_timer (inactivity_timer)

Tests if the specified duration in seconds of inactivity for despawning has been reached.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"inactivity_timer\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### int_property (int_property)

Returns true when the int actor property matches the value provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | (Required) The property name to look for |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"int_property\", \"subject\": \"self\", \"domain\": \"minecraft:can_climb\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### is_altitude (is_altitude)

Tests the current altitude against a provided value. 0= bedrock elevation.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) The altitude value to compare with |

Example (Full..):
```json
"{ \"test\": \"is_altitude\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### is_avoiding_mobs (is_avoiding_mobs)

Returns true if the subject entity is fleeing from other mobs.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_avoiding_mobs\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_baby (is_baby)

Returns true when the subject entity is a baby.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_baby\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_biome (is_biome)

Tests whether the Subject is currently in the named biome.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Biome type to test Values: `beach`, `desert`, `extreme_hills`, `flat`, `forest`, `ice`, `jungle`, `mesa`, `mushroom_island`, `ocean`, `plain`, `river`, `savanna`, `stone_beach`, `swamp`, `taiga`, `the_end`, `the_nether`. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_biome\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"beach\" }"
```

### is_block (is_block)

Returns true when the block has the given name.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"is_block\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### is_bound_to_creaking_heart (is_bound_to_creaking_heart)

_since 1.21.60_

Tests that the Creaking Heart that spawned the subject Creaking still exists.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_bound_to_creaking_heart\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_brightness (is_brightness)

Tests the current brightness against a provided value in the range (0.0f, 1.0f).

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) The brightness value to compare with. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_brightness\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.50\" }"
```

### is_climbing (is_climbing)

Returns true if the subject entity is climbing.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_climbing\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_color (is_color)

Returns true if the subject entity is the named color.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Palette Color to test Values: `black`, `blue`, `brown`, `cyan`, `gray`, `green`, `light_blue`, `light_green`, `magenta`, `orange`, `pink`, `purple`, `red`, `silver`, `white`, `yellow`. |

Example (Full..):
```json
"{ \"test\": \"is_color\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"white\" }"
```

### is_controlling_passenger_family (is_controlling_passenger_family)

_since 1.21.130_

Returns true when the subject entity's controlling passenger is a member of the named family.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"is_controlling_passenger_family\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### is_daytime (is_daytime)

Returns true during the daylight hours.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_daytime\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_difficulty (is_difficulty)

Tests the current difficulty level of the game.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The game's difficulty level to test Values: `easy`, `hard`, `normal`, `peaceful`. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_difficulty\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"normal\" }"
```

### is_family (is_family)

Returns true when the subject entity is a member of the named family.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_family\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### is_game_rule (is_game_rule)

Tests whether a named game rule is active.

| Field | Type | Default | Notes |
|---|---|---|---|
| `domain` | string |  | (Required) The Game Rule to test. |
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_game_rule\", \"subject\": \"self\", \"domain\": \"domobspawning\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_humid (is_humid)

Tests whether the Subject is in an area with humidity

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_humid\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_immobile (is_immobile)

Returns true if the subject entity is immobile. An entity is immobile if it lacks AI goals, has just changed dimensions or if it is a mob and has no health.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_immobile\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_in_same_vehicle (is_in_same_vehicle)

Returns whether the subject entity is in the same vehicle as the calling entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean |  | (Required) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_in_same_vehicle\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_in_village (is_in_village)

Tests whether the Subject is inside the bounds of a village.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_in_village\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_leashed (is_leashed)

Returns true if the subject entity is leashed.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_leashed\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_leashed_to (is_leashed_to)

Returns true if the subject entity leashed to the calling entity.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_leashed_to\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_mark_variant (is_mark_variant)

Returns true if the subject entity is the mark variant number provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"is_mark_variant\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### is_missing_health (is_missing_health)

Tests if the subject is not at full health.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_missing_health\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_moving (is_moving)

Returns true if the subject entity is moving.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_moving\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_navigating (is_navigating)

Tests if the subject is currently pathfinding. Requires a "minecraft:navigation" component.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_navigating\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_owner (is_owner)

Returns true if the subject entity is the owner of the calling entity.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_owner\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_panicking (is_panicking)

Tests if the subject is panicking.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_panicking\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_persistent (is_persistent)

Tests if the subject's persistence matches the bool value passed in.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_persistent\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_raider (is_raider)

Tests if the subject is a raider.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_raider\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_riding (is_riding)

Returns true if the subject entity is riding on another entity.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_riding\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_riding_self (is_riding_self)

_since 1.21.90_

Returns true if the subject entity is riding the calling entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_riding_self\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_sitting (is_sitting)

_since 1.20.80_

Tests if the subject is sitting.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_sitting\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_skin_id (is_skin_id)

Returns true if the subject entity is the skin id number provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"is_skin_id\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### is_sleeping (is_sleeping)

Tests whether the Subject is sleeping.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_sleeping\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_sneak_held (is_sneak_held)

Returns true if the subject entity has the sneak input held.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_sneak_held\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_sneaking (is_sneaking)

Returns true if the subject entity is sneaking.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_sneaking\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_snow_covered (is_snow_covered)

Tests whether the Subject is in an area with snow cover

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_snow_covered\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_sprinting (is_sprinting)

Tests if the subject is sprinting.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_sprinting\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_tamed (is_tamed)

_since 1.26.10_

Tests whether the Subject is tamed.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_tamed\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_target (is_target)

Returns true if the subject entity is the target of the calling entity.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_target\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_temperature_type (is_temperature_type)

Tests whether the current temperature is a given type.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Biome temperature catagory to test Values: `cold`, `mild`, `ocean`, `warm`. |

Example (Full..):
```json
"{ \"test\": \"is_temperature_type\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"cold\" }"
```

### is_temperature_value (is_temperature_value)

Tests the current temperature against a provided value in the range (0.0, 1.0) where 0.0f is the coldest temp and 1.0f is the hottest.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) The Biome temperature value to compare with. |

Example (Full..):
```json
"{ \"test\": \"is_temperature_value\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.50\" }"
```

### is_underground (is_underground)

Returns true when the subject entity is underground. An entity is considered underground if there are non-solid blocks above it.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_underground\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_underwater (is_underwater)

Returns true when the subject entity is under water. An entity is considered underwater if it is completely submerged in water blocks.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_underwater\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_variant (is_variant)

Returns true if the subject entity is the variant number provided.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |
| `test` | string |  | Test |

Example (Full..):
```json
"{ \"test\": \"is_variant\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### is_vehicle_family (is_vehicle_family)

_since 1.21.90_

Returns true when the subject entity's vehicle is a member of the named family.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"is_vehicle_family\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### is_visible (is_visible)

Returns true if the subject entity is visible.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_visible\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_waterlogged (is_waterlogged)

Tests if the subject block is submerged in water.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean |  | (Required) true or false. |

Example (Full..):
```json
"{ \"test\": \"is_waterlogged\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### is_weather (is_weather)

DEPRECATED

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"is_weather\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### light_level (light_level)

Tests is the mob is outside of the specified light level range (0, 16).

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"light_level\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### moon_intensity (moon_intensity)

Compares the current moon intensity with a float value in the range (0.0, 1.0)

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"moon_intensity\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### moon_phase (moon_phase)

Compares the current moon phase with an integer value in the range (0, 7).

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"moon_phase\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### on_fire (on_fire)

Tests if the subject is on fire.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"on_fire\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### on_ground (on_ground)

Returns true when the subject entity is on ground.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"on_ground\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### on_hot_block (on_hot_block)

Tests if the subject is on a hot block.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"on_hot_block\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### on_ladder (on_ladder)

Returns true when the subject entity is on a ladder.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"on_ladder\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### owner_distance (owner_distance)

_since 1.21.20_

Tests the distance between the subject and its owner. Returns false if there is no owner.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"owner_distance\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### random_chance (random_chance)

Returns true if the random chance rolls 0 out of a specified max range.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"random_chance\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### redstone_strength_at_position (redstone_strength_at_position)

_since 1.26.30_

Tests the redstone strength at the subject's position.

> Introduced in 1.26.30. Tests the redstone signal strength at the subject's position. Reads the same composed level as redstone components (e.g. comparator, observer) and returns 0 when the position is unloaded.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"redstone_strength_at_position\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### rider_count (rider_count)

Returns the number of riders on this entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | int |  | (Required) An integer value. |

Example (Full..):
```json
"{ \"test\": \"rider_count\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0\" }"
```

### surface_mob (surface_mob)

Tests if the subject is a surface mob.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"surface_mob\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### taking_fire_damage (taking_fire_damage)

Tests if the subject is taking fire damage. Requires the damage_sensor component

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"taking_fire_damage\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### target_distance (target_distance)

Tests the distance between the calling entity and its target.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"target_distance\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### trusts (trusts)

Returns true if the subject is trusted by entity.

> Does not require any parameters to work properly. It can be used as a standalone filter.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"trusts\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### was_last_hurt_by (was_last_hurt_by)

Tests if the subject is the last player who attacked the entity in the last 400 seconds, or the last mob to do so in the last 60 seconds.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | boolean | `true` | (Optional) true or false. |

Example (Full..):
```json
"{ \"test\": \"was_last_hurt_by\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"true\" }"
```

### weather (weather)

Tests the current weather in the dimension against a provided weather value.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"weather\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### weather_at_position (weather_at_position)

Tests the current weather, at the actor's position, against a provided weather value.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | string |  | (Required) The Family name to look for |

Example (Full..):
```json
"{ \"test\": \"weather_at_position\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"player\" }"
```

### y_rotation (y_rotation)

Returns the Y rotation of this entity.

| Field | Type | Default | Notes |
|---|---|---|---|
| `operator` | string | `"equals"` | (Optional) The comparison to apply with 'value'. Values: `!=`, `<`, `<=`, `<>`, `=`, `==`, `>`, `>=`, `equals`, `not`. |
| `subject` | string | `"self"` | (Optional) The subject of this filter test. Values: `block`, `damager`, `other`, `parent`, `player`, `self`, `target`. |
| `value` | float |  | (Required) A floating point value. |

Example (Full..):
```json
"{ \"test\": \"y_rotation\", \"subject\": \"self\", \"operator\": \"equals\", \"value\": \"0.00\" }"
```

### add_component_group (add_component_group)

Adds component groups to the current entity. These groups must be defined in the 'component_groups' section of the file. As entities can only have one component of each type active, any components in a group that is being added will replace previously added components. Additionally, adding a component group that is already active will cause those components to be re-initialized. For some types of components like minecraft:is_baby, re-initializing an already active component has no effect, but for other component types the associated logic will start over. For example, an already-added minecraft:timer that is added again will start its timing logic over.

| Field | Type | Default | Notes |
|---|---|---|---|
| `component_groups` | string |  | List of component groups to add to the entity. |

Example (Example:):
```json
"\t\t\"sequence\": [\r\n\t\t\t{\r\n\t\t\t\t\"add\": { \"component_groups\": [ \"one\" ] }\r\n\t\t\t},\r\n\t\t\t{\r\n\t\t\t\t\"add\": { \"component_groups\": [ \"two\", \"five\", \"etc..\" ] }\r\n\t\t\t}\r\n\t\t]\r\n\t"
```

### emit_particle (emit_particle)

_since 1.21.50_

Emits a particle specified via the particle attribute.

| Field | Type | Default | Notes |
|---|---|---|---|
| `particle` | string |  | Identifier of the particle to emit. |

Example (Example:):
```json
"{\r\n\t\"emit_particle\": {\r\n\t\t\"particle\": \"creakingcrumble\"\r\n\t}\r\n}"
```

### emit_vibration (emit_vibration)

Allows the entity to emit a vibration having the entity itself as its source.

| Field | Type | Default | Notes |
|---|---|---|---|
| `vibration` | string |  | Type of vibration to emit. Values: `entity_interact`, `entity_act`, `entity_die`. |

Example (Example:):
```json
"{\r\n\t\"emit_vibration\": {\r\n\t\t\"vibration\": \"entity_act\"\r\n\t}\r\n}"
```

### Overview (overview)

Entity events can be structured by a combination of 'sequence' and 'randomize' nodes. 'sequence' nodes are array nodes and will execute all entries in order from first element to last. 'randomize' nodes are array nodes that will pick one entry to execute, based on a weight. 'filters' can also be added within 'sequence' and 'randomize' nodes to restrict execution. Within 'randomize' and 'sequence' nodes, you can specify a few operations. 'trigger', 'filters', 'add', and 'remove'. You can read about 'filters' in the 'Filters' section of the documentation. 'trigger' can be used to fire additional entity events when an event is hit. 'add' can be used to add component groups to your entity. 'remove' can be used to remove component groups from your entity. When an event is received, the effects of that event are determined immediately, but those changes are not applied to the entity until the entity ticks on the server side of the game. This means filters in later entries in a 'sequence' array won't see changes from earlier in that array. It also means that when one entity sends an event to another entity, it could take effect on the same game tick or on the next tick, depending on whether the target entity has already been updated.

### play_sound (play_sound)

_since 1.21.50_

Plays a sound as part of an entity event response.

| Field | Type | Default | Notes |
|---|---|---|---|
| `sound` | string |  | The identifier of the sound to play. |

Example (Example:):
```json
"{\r\n\t\"play_sound\": {\r\n\t\t\"sound\": \"death\"\r\n\t}\r\n}"
```

### queue_command (queue_command)

_since 1.20.60_

Will queue a slash command or a series of slash commands set in an array to trigger at the end of the tick. Due to being queued as opposed to triggering instantly, any immediate side-effects of the command may not be observable by other molang queries, commands, or scripts until later in the tick. Note that commands executed via queue_command are guaranteed to run in order with respect to other queued commands. Additionally, if an entity is removed before a queued command has the chance to execute, for example removed on the same tick that the command was queued, the command will not execute.

| Field | Type | Default | Notes |
|---|---|---|---|
| `command` | string |  | Slash command to run. |
| `target` | string |  | The target context to execute against. Values: `self`. |

Example (Example:):
```json
"\t\t\"queue_command\": {\r\n\t\t\t\"command\": \"say I have died!\"\r\n\t\t}\r\n\t"
```

### randomize_node (randomize_node)

The 'randomize' node is an array node that will pick one entry to execute, based on a weight. If no weight is specified, a node will have a weight of 1.0. If you add a weight of 4.0 in one node, and 8.0 in another, then those nodes will have a 33.33% (4 / (4 + 8)) and 66.66% (8 / (4 + 8)) chance of executing, respectively.

Example (Example:):
```json
"\t\t\"randomize\": [\r\n\t\t\t{\r\n\t\t\t\t\"weight\": <float>\r\n\t\t\t\t// actions like 'add' or 'remove'\r\n\t\t\t}\r\n\t\t]\r\n\t"
```

### remove_component_group (remove_component_group)

Removes component groups from the current entity. This can be any group you have defined in the 'component_groups' section of the file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `component_groups` | string |  | List of component groups to remove from the entity. |

Example (Example:):
```json
"\t\t\"sequence\": [\r\n\t\t\t{\r\n\t\t\t\t\"remove\": { \"component_groups\": [ \"one\" ] }\r\n\t\t\t},\r\n\t\t\t{\r\n\t\t\t\t\"remove\": { \"component_groups\": [ \"two\", \"five\", \"etc..\" ] }\r\n\t\t\t}\r\n\t\t]\r\n\t"
```

### reset_target (reset_target)

Resets the entities' target (the focus of its gaze, attacking behavior, etc.).

Example (Example:):
```json
"{\r\n\t\"reset_target\": {}\r\n}"
```

### sequence_node (sequence_node)

Executes actions in sequence.

Example (Example:):
```json
"\t\t\"sequence\": [\r\n\t\t\t{\r\n\t\t\t\t// I will execute first! c:\r\n\t\t\t},\r\n\t\t\t{\r\n\t\t\t\t// I will execute last! :c\r\n\t\t\t}\r\n\t\t]\r\n\t"
```

### Set Entity Property (set_entity_property)

Sets the value of an entity property. The property must be defined in the 'properties' section of the file.

Example (Example:):
```json
"\t\t\"set_property\": {\n\t\t\t\"minecraft:has_nectar\": false\n\t\t}\n\t"
```

### set_property (set_property)

Sets the value of an entity property. The property must be defined in the 'properties' section of the file.

| Field | Type | Default | Notes |
|---|---|---|---|
| `property` | string |  | The property to set on the entity. |
| `value` | string |  | The value to assign to the property. |

Example (Example:):
```json
"\t\t\"set_property\": {\r\n\t\t\t\"minecraft:has_nectar\": false\r\n\t\t}\r\n\t"
```

### This describes the structure of the Events section. (this_describes_the_structure_of_the_events_section)

Describes the structure of the events section.

### trigger (trigger)

Triggers additional entity events when hit. For example, you could use a randomize node in minecraft:entity_spawned to choose either an adult or baby event for adding component groups.

| Field | Type | Default | Notes |
|---|---|---|---|
| `event` | string |  | The event to trigger on the entity. |
| `target` | string |  | The target entity for the trigger. Values: `self`, `other`, `player`, `target`, `baby`, `parent`. |

Example (Example:):
```json
"\t\t\"sample:spawn_adult\": {\r\n\t\t\t// add adult component groups\r\n\t\t},\r\n\t\t\"sample:spawn_baby\": {\r\n\t\t\t// add baby component groups\r\n\t\t},\r\n\t\t\"minecraft:entity_spawned\": {\r\n\t\t\t\"randomize\": [\r\n\t\t\t\t{\r\n\t\t\t\t\t\"weight\": 50.0,\r\n\t\t\t\t\t\"trigger\": \"sample:spawn_adult\"\r\n\t\t\t\t},\r\n\t\t\t\t{\r\n\t\t\t\t\t\"weight\": 50.0,\r\n\t\t\t\t\t\"trigger\": \"sample:spawn_baby\"\r\n\t\t\t\t}\r\n\t\t\t]\r\n\t\t}\r\n\t"
```

### versioned_changes (versioned_changes)

A 'format_version' of '1.19.20' or higher is required to properly evaluate filters specified on an entity event definition at the root level of the event, that is any filter that is not underneath a 'sequence' or 'randomize' node. Content with a lower version will use the old behavior, which was to ignore root level filters.

### block_break (block_break)

Triggers the destruction of a block at a specified world location. When executed, the block is removed and any associated loot tables or block events are processed. Commonly used in automated testing scenarios or scripted world modifications.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |

### block_explode (block_explode)

Creates an explosion centered on a block location, destroying nearby blocks based on explosion power and applying knockback and damage to entities within the blast radius. Similar to TNT or creeper explosions but triggered programmatically.

### block_set (block_set)

Places or replaces a block at a specified world location with a new block type. This action can set any valid block identifier and optionally include block states (such as facing direction or open/closed state). Useful for building structures or modifying terrain programmatically.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `blockType` | string |  | **required**. Block to place |

### entity_die (entity_die)

Immediately kills a target entity, triggering its death sequence including death animations, loot drops from loot tables, and any on_death events defined in the entity's behavior. The entity is removed from the world after processing.

### entity_spawn (entity_spawn)

Spawns a new entity of the specified type at a world location. The entity identifier can be any valid mob, item entity, or custom entity defined in behavior packs. Spawned entities initialize with their default components and can optionally be given a name tag or initial event.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `entityType` | string |  | **required**. Entity Type |

### item_spawn (item_spawn)

Creates a dropped item entity at a specified world location. The item appears as a floating, collectible object that players or hoppers can pick up. Supports specifying item type, stack count, and custom data values.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `particleName` | string |  | **required**. Particle to place |

### music_play (music_play)

Plays a music track for one or more players. Music tracks are longer audio files defined in sound_definitions.json under the music category. Unlike short sound effects, music respects the Music volume slider and can fade in/out smoothly.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `trackName` | string |  | **required**. Play Track |

### particle_spawn (particle_spawn)

Emits a particle effect at a specified world location. Particle effects are defined in resource pack particle JSON files and can include complex behaviors like physics, color gradients, and collision. Common uses include visual feedback for abilities, environmental effects, and UI highlights.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `particleName` | string |  | **required**. Particle to place |

### player_join (player_join)

Simulates or responds to a player joining the world. This triggers the same events and initialization logic that occurs when a real player connects, allowing tests to verify join-time behaviors like welcome messages or starter kit distribution.

### sound_play (sound_play)

Plays a sound effect at a location or for specific players. Sounds are short audio clips defined in sound_definitions.json and respect the player's Sound volume setting. Supports pitch and volume modifiers, and sounds attenuate with distance from the source location.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | locationOffset |  | Location Offset |
| `soundName` | string |  | **required**. Play Sound |

### test_idle (test_idle)

Pauses test execution for a specified number of ticks, allowing time for world state to update. Essential for tests that need to wait for entity AI decisions, block updates, redstone propagation, or animation completion before asserting results.

| Field | Type | Default | Notes |
|---|---|---|---|
| `idle` | string |  | Ticks |

### test_simulated_player_move (test_simulated_player_move)

Commands a simulated player to navigate to a target location using pathfinding. The simulated player moves like a real player, triggering pressure plates, opening doors, and interacting with the world. Used in GameTest Framework to verify player-centric behaviors.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | point3 |  | Location |

### test_simulated_player_spawn (test_simulated_player_spawn)

Creates a simulated player entity for automated testing. Simulated players can move, interact with blocks, attack entities, and use items just like real players, but are controlled programmatically. Essential for testing player-facing features in the GameTest Framework.

| Field | Type | Default | Notes |
|---|---|---|---|
| `location` | point3 |  | Location |

### tick (tick)

Advances the game by a specified number of ticks (each tick is 1/20th of a second). Each tick processes entity AI, physics, redstone updates, and scheduled events. Use this for precise timing control when testing tick-sensitive mechanics like hoppers, observers, or mob pathfinding.

| Field | Type | Default | Notes |
|---|---|---|---|
| `everyNTicks` | int |  | Every N Ticks |

### world_send_message (world_send_message)

Broadcasts a chat message to all players in the world. The message appears in the chat log and can include formatting codes for colors and styles. Useful for debugging, test status updates, or simulating in-game announcements during automated testing.

| Field | Type | Default | Notes |
|---|---|---|---|
| `message` | string |  | Message |

### action (action)

Represents a single action that can be executed as part of an action set. Actions include spawning entities, breaking blocks, playing sounds, and other world modifications. Each action has a type that determines its behavior and required arguments.

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | string |  | **required**. Action Identifier |
| `type` |  |  | **required**. Type Values: `block_break`, `block_explode`, `block_set`, `entity_die`, `entity_spawn`, `item_spawn`, `music_play`, `particle_spawn`, `player_join`, `sound_play`, `test_idle`, `test_simulated_player_move`, `test_simulated_player_spawn`, `tick`, `world_send_message`. |
| `args` | object |  | Arguments |
| `value` | string |  | Value |
| `withId` | string |  | With Id |
| `setId` | string |  | Set Id |

### group (action_group)

Groups multiple actions together to be executed as a sequence. Action groups enable complex multi-step behaviors by chaining actions like entity spawns, block modifications, and effects into a single reusable unit.

| Field | Type | Default | Notes |
|---|---|---|---|
| `id` | string |  | Group Identifier |
| `name` | string |  | Name |
| `canvasX` | float |  | Canvas X |
| `canvasY` | float |  | Canvas Y |
| `actions` | objectArray |  | Actions |

### block_volume (block_volume)

Defines a 3D volume of blocks in the world using a layered ASCII-art style format. Each character in the pattern maps to a block type through a key lookup, enabling efficient representation of structures like buildings, obstacles, or test arenas.

| Field | Type | Default | Notes |
|---|---|---|---|
| `southWestBottom` | object |  | **required**. South West Bottom of the volume See `action_set/vector3`. |
| `size` | object |  | **required**. Size of the volume See `action_set/vector3`. |
| `blockPlanes` | twoDStringArray |  | A 2D array representing planes of blocks within the volume, where each character represents a lookup into the key. |
| `key` | keyedObjectCollection |  | key |

### entity (entity)

References an entity by type identifier for use in action sets. This allows actions to target specific entity types like 'minecraft:zombie' or custom entities from behavior packs when spawning, killing, or manipulating entities.

| Field | Type | Default | Notes |
|---|---|---|---|
| `typeId` | string | `""` | Entity Type Id |

### player_state (player_state)

Captures information about a player's current state including position, rotation, inventory, and game mode. Used in automated testing to verify player conditions or to set up test scenarios with specific player configurations.

| Field | Type | Default | Notes |
|---|---|---|---|
| `name` | string |  | **required**. Name |
| `blockPlanesInViewFrontToBack` | object |  | Block planes in view (front to back) See `action_set/block_volume`. |
| `entitiesAroundPlayer` | objectArray |  | Entities around player See `action_set/entity`. |

### vector3 (vector3)

A 3D coordinate (x, y, z) representing a position or direction in the Minecraft world. Y is the vertical axis (up/down), while X and Z form the horizontal plane. Used for specifying locations, offsets, and movement directions.

| Field | Type | Default | Notes |
|---|---|---|---|
| `x` | float |  | **required**. x |
| `y` | float |  | **required**. y |
| `z` | float |  | **required**. z |

### world state (world_state)

Captures the current state of the world including time of day, weather, game rules, and other global settings. Used in automated testing to verify world conditions or establish consistent test environments.

| Field | Type | Default | Notes |
|---|---|---|---|
| `players` | keyedObjectCollection |  | **required**. Players See `action_set/player_state`. |
