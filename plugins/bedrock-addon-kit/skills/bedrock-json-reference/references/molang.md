# Molang queries and functions

Generated 2026-10-19 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/molang). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (380)

### `math.abs(value)` (math_abs)

Absolute value of value

### `math.acos(value)` (math_acos)

arccos of value

### `math.asin(value)` (math_asin)

arcsin of value

### `math.atan(value)` (math_atan)

arctan of value

### `math.atan2(y, x)` (math_atan2)

arctan of y/x. NOTE: the order of arguments!

### `math.ceil(value)` (math_ceil)

Round value up to nearest integral number

### `math.clamp(value, min, max)` (math_clamp)

Clamp value to between min and max inclusive

### `math.copy_sign(A, B)` (math_copy_sign)

Compose a floating-point value with the magnitude of `x` and the sign of `y`.

### `math.cos(value)` (math_cos)

Cosine (in degrees) of value

### `math.die_roll(num, low, high)` (math_die_roll)

Returns the sum of 'num' random numbers, each with a value from low to high. Note: the generated random numbers are not integers like normal dice. For that, use `math.die_roll_integer`.

> The difference between `math.die_roll` and `math.die_roll_integer` is that the former uses floating point and can return non-integer numbers; the latter works only with integers. If you're really trying to simulate actual dice, use `math.die_roll_integer`.

### `math.die_roll_integer(num, low, high)` (math_die_roll_integer)

Returns the sum of 'num' random integer numbers, each with a value from low to high. Note: the generated random numbers are integers like normal dice.

> The difference between `math.die_roll` and `math.die_roll_integer` is that the former uses floating point and can return non-integer numbers; the latter works only with integers. If you're really trying to simulate actual dice, use `math.die_roll_integer`.

### `math.ease_in_back(start, end, 0_to_1)` (math_ease_in_back)

_since 1.21.120_

Output goes from start to end via 0_to_1, overshooting backward before accelerating into the end

### `math.ease_in_bounce(start, end, 0_to_1)` (math_ease_in_bounce)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting with bounce oscillations and settling into the end

### `math.ease_in_circ(start, end, 0_to_1)` (math_ease_in_circ)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating along a circular curve toward the end

### `math.ease_in_cubic(start, end, 0_to_1)` (math_ease_in_cubic)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating rapidly toward the end

### `math.ease_in_elastic(start, end, 0_to_1)` (math_ease_in_elastic)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting with elastic oscillations before accelerating into the end

### `math.ease_in_expo(start, end, 0_to_1)` (math_ease_in_expo)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating extremely rapidly toward the end

### `math.ease_in_out_back(start, end, 0_to_1)` (math_ease_in_out_back)

_since 1.21.120_

Output goes from start to end via 0_to_1, overshooting at both start and end, with smoother change in the middle

### `math.ease_in_out_bounce(start, end, 0_to_1)` (math_ease_in_out_bounce)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting and ending with bounce oscillations, smoother in the middle

### `math.ease_in_out_circ(start, end, 0_to_1)` (math_ease_in_out_circ)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting and ending slow, with circular acceleration and deceleration in the middle

### `math.ease_in_out_cubic(start, end, 0_to_1)` (math_ease_in_out_cubic)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow, accelerating rapidly in the middle, then slowing again at the end

### `math.ease_in_out_elastic(start, end, 0_to_1)` (math_ease_in_out_elastic)

_since 1.21.120_

Output goes from start to end via 0_to_1, oscillating elastically at both start and end, with stable change in the middle

### `math.ease_in_out_expo(start, end, 0_to_1)` (math_ease_in_out_expo)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting and ending slow, with extremely rapid change in the middle

### `math.ease_in_out_quad(start, end, 0_to_1)` (math_ease_in_out_quad)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow, accelerating in the middle, then slowing again at the end

### `math.ease_in_out_quart(start, end, 0_to_1)` (math_ease_in_out_quart)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow, accelerating very rapidly in the middle, then slowing again at the end

### `math.ease_in_out_quint(start, end, 0_to_1)` (math_ease_in_out_quint)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow, accelerating extremely rapidly in the middle, then slowing again at the end

### `math.ease_in_out_sine(start, end, 0_to_1)` (math_ease_in_out_sine)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting and ending slow, with smoother change in the middle

### `math.ease_in_quad(start, end, 0_to_1)` (math_ease_in_quad)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating toward the end

### `math.ease_in_quart(start, end, 0_to_1)` (math_ease_in_quart)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating very rapidly toward the end

### `math.ease_in_quint(start, end, 0_to_1)` (math_ease_in_quint)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating extremely rapidly toward the end

### `math.ease_in_sine(start, end, 0_to_1)` (math_ease_in_sine)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting slow and accelerating smoothly toward the end

### `math.ease_out_back(start, end, 0_to_1)` (math_ease_out_back)

_since 1.21.120_

Output goes from start to end via 0_to_1, overshooting past the end before settling into it

### `math.ease_out_bounce(start, end, 0_to_1)` (math_ease_out_bounce)

_since 1.21.120_

Output goes from start to end via 0_to_1, approaching the end with bounce oscillations that diminish over time

### `math.ease_out_circ(start, end, 0_to_1)` (math_ease_out_circ)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating along a circular curve toward the end

### `math.ease_out_cubic(start, end, 0_to_1)` (math_ease_out_cubic)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating rapidly toward the end

### `math.ease_out_elastic(start, end, 0_to_1)` (math_ease_out_elastic)

_since 1.21.120_

Output goes from start to end via 0_to_1, overshooting the end with elastic oscillations before settling

### `math.ease_out_expo(start, end, 0_to_1)` (math_ease_out_expo)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting extremely fast and decelerating gradually toward the end

### `math.ease_out_quad(start, end, 0_to_1)` (math_ease_out_quad)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating toward the end

### `math.ease_out_quart(start, end, 0_to_1)` (math_ease_out_quart)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating very rapidly toward the end

### `math.ease_out_quint(start, end, 0_to_1)` (math_ease_out_quint)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating extremely rapidly toward the end

### `math.ease_out_sine(start, end, 0_to_1)` (math_ease_out_sine)

_since 1.21.120_

Output goes from start to end via 0_to_1, starting fast and decelerating smoothly toward the end

### `math.exp(value)` (math_exp)

Returns _e_ raised to the `value` power

### `math.floor(value)` (math_floor)

Round value down to nearest integral number

### `math.hermite_blend(value)` (math_hermite_blend)

Interpolate points on a smooth curve using one of the Hermite Basis functions: `3t^2 - 2t^3`. While any valid float is a valid input, this function works best in the range `[0, 1]`.

### `math.inverse_lerp(start, end, value)` (math_inverse_lerp)

_since 1.21.120_

Returns the normalized progress between start and end given value

### `math.lerp(start, end, 0_to_1)` (math_lerp)

Computes the linear interpolation between `a` and `b` with interpolation weighting factor `t` in the range `[0, 1]`, where `0 = a` and `1 = b`.

### `math.lerprotate(start, end, 0_to_1)` (math_lerprotate)

Computes a linear interpolation around a circle in the shortest direction from `a` degrees to `b` degrees with interpolation weighting factor `t` (see `math.lerp`).

### `math.ln(value)` (math_ln)

Natural logarithm of value

### `math.max(A, B)` (math_max)

Return highest value of A or B

### `math.min(A, B)` (math_min)

Return lowest value of A or B

### `math.min_angle(value)` (math_min_angle)

Minimize angle magnitude (in degrees) into the range [-180, 180)

### `math.mod(value, denominator)` (math_mod)

Return the remainder of value / denominator

### `math.pi` (math_pi)

Returns the float representation of the constant pi.

### `math.pow(base, exponent)` (math_pow)

Elevates `base` to the `exponent`'th power

### `math.random(low, high)` (math_random)

Random value between low and high inclusive

### `math.random_integer(low, high)` (math_random_integer)

Random integer value between low and high inclusive

### `math.round(value)` (math_round)

Round value to nearest integral number

### `math.sign(value)` (math_sign)

Returns 1 if value is positive, -1 otherwise

### `math.sin(value)` (math_sin)

Sine (in degrees) of value

### `math.sqrt(value)` (math_sqrt)

Square root of value

### `math.trunc(value)` (math_trunc)

Round value towards zero

### query.above_top_solid (query_above_top_solid)

Returns the height of the block immediately above the highest solid block at the input (x,z) position.

Example (Example):
```json
"query.above_top_solid(variable.x, variable.z)"
```

### query.actor_count (query_actor_count)

Returns the number of entities (actors) rendered in the last frame.

### query.all (query_all)

Evaluates the first argument, then returns 1.0 if all of the following arguments evaluate to the same value as the first. Otherwise it returns 0.0. Requires at least 3 arguments.

### query.all_animations_finished (query_all_animations_finished)

Returns 1.0 if all animations in the current animation controller state have played through at least once, else it returns 0.0. Only valid in an animation controller.

### query.all_tags (query_all_tags)

Returns if the item or block has all of the tags specified.

### query.anger_level (query_anger_level)

Returns the anger level of the entity [0,n). On errors or if the actor has no anger level, returns 0. Available in behavior pack animation contexts only.

### query.anim_time (query_anim_time)

Returns the time in seconds since the current animation started, else 0.0 if not called within an animation.

### query.any (query_any)

Evaluates the first argument, then returns 1.0 if any of the following arguments evaluate to the same value as the first. Otherwise it returns 0.0. Requires at least 3 arguments.

### query.any_animation_finished (query_any_animation_finished)

Returns 1.0 if any animation in the current animation controller state has played through at least once, else it returns 0.0. Only valid in an animation controller.

### query.any_tag (query_any_tag)

Returns if the item or block has any of the tags specified.

### query.approx_eq (query_approx_eq)

Returns 1.0 if all of the arguments are within the smallest unit of measurement possible for the computer running this query of each other, else 0.0.

### query.armor_color_slot (query_armor_color_slot)

Takes the armor slot index as a parameter, and returns the color of the armor in the requested slot. The valid values for the armor slot index are 0 (head), 1 (chest), 2 (legs), 3 (feet) and 4 (body).

### query.armor_damage_slot (query_armor_damage_slot)

_since 1.20.80_

Takes the armor slot index as a parameter, and returns the damage value of the requested slot. The valid values for the armor slot index are 0 (head), 1 (chest), 2 (legs), 3 (feet) and 4 (body). Support for entities other than players may be limited, as the damage value is not always available on clients.

### query.armor_material_slot (query_armor_material_slot)

Takes the armor slot index as a parameter, and returns the armor material type in the requested armor slot. The valid values for the armor slot index are 0 (head), 1 (chest), 2 (legs) and 3 (feet).

### query.armor_texture_slot (query_armor_texture_slot)

Takes the armor slot index as a parameter, and returns the texture type of the requested slot. The valid values for the armor slot index are 0 (head), 1 (chest), 2 (legs), 3 (feet) and 4 (body).

### query.average_frame_time (query_average_frame_time)

Returns the time in *seconds* of the average frame time over the last 'n' frames. If an argument is passed, it is assumed to be the number of frames in the past that you wish to query. 'query.average_frame_time' (or the equivalent 'query.average_frame_time(0)') will return the frame time of the frame before the current one. 'query.average_frame_time(1)' will return the average frame time of the previous two frames. Currently we store the history of the last 30 frames, although note that this may change in the future. Asking for more frames will result in only sampling the number of frames stored.

### query.base_swing_duration (query_base_swing_duration)

_since 1.21.120_

Returns the duration of the mob's swing/attack animation, determined by the carried item and unmodified by effects applied on the mob. To access the swing/attack animation progress, use "variable.attack_time" instead.

### query.block_face (query_block_face)

Returns the block face for this (only valid for certain triggers such as placing blocks, or interacting with block) (Down=0.0, Up=1.0, North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0).

### query.block_has_all_tags (query_block_has_all_tags)

_since 1.20.60_

Takes a world-origin-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has all of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.block_has_any_tag (query_block_has_any_tag)

_since 1.20.60_

Takes a world-origin-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has any of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.block_neighbor_has_all_tags (query_block_neighbor_has_all_tags)

_since 1.20.60_

Takes a block-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has all of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.block_neighbor_has_any_tag (query_block_neighbor_has_any_tag)

_since 1.20.60_

Takes a block-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has any of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.block_property (query_block_property)

_**deprecated**_

Returns the value of the associated block's block state. (No longer available in pack min_engine_version 1.20.40.)

### query.block_state (query_block_state)

Returns the value of the associated block's block state.

### query.blocking (query_blocking)

Returns 1.0 if the entity is blocking, else it returns 0.0.

### query.body_x_rotation (query_body_x_rotation)

Returns the body pitch rotation if called on an entity, else it returns 0.0.

### query.body_y_rotation (query_body_y_rotation)

Returns the body yaw rotation if called on an entity, else it returns 0.0.

### query.bone_aabb (query_bone_aabb)

Returns the axis aligned bounding box of a bone as a structure with members '.min', '.max', along with '.x', '.y', and '.z' values for each.

### query.bone_orientation_matrix (query_bone_orientation_matrix)

_since 1.20.60_

Returns the bone orientation (as a matrix) of the desired bone provided it exists in the queryable geometry of the mob, else this returns the identity matrix and throws a content error. Takes the name of the bone as an argument.

> Available without an experimental toggle starting in 1.20.60.

### query.bone_orientation_trs (query_bone_orientation_trs)

_since 1.20.60_

Returns the bone orientation matrix decomposed into the component translation/rotation/scale (TRS) parts of the desired bone provided it exists in the queryable geometry of the mob, else this returns the identity matrix and throws a content error. The returned value is returned as a variable of type 'struct' with members '.t', '.r', and '.s', each with members '.x', '.y', and '.z', and can be accessed as per the following example: v.my_variable = q.bone_orientation_trs('rightarm'); return v.my_variable.r.x; Takes the name of the bone as an argument.

> Available without an experimental toggle starting in 1.20.60.

### query.bone_origin (query_bone_origin)

Returns the initial (from the .geo) pivot of a bone as a structure with members '.x', '.y', and '.z'.

### query.bone_rotation (query_bone_rotation)

Returns the initial (from the .geo) rotation of a bone as a structure with members '.x', '.y', and '.z' in degrees.

### query.camera_distance_range_lerp (query_camera_distance_range_lerp)

Takes two distances (any order) and return a number from 0 to 1 based on the camera distance between the two ranges clamped to that range. For example, 'query.camera_distance_range_lerp(10, 20)' will return 0 for any distance less than or equal to 10, 0.2 for a distance of 12, 0.5 for 15, and 1 for 20 or greater. If you pass in (20, 10), a distance of 20 will return 0.0.

### query.camera_rotation (query_camera_rotation)

Returns the rotation of the camera. Requires one argument representing the rotation axis you would like (0 for x, 1 for y).

### query.can_climb (query_can_climb)

Returns 1.0 if the entity can climb, else it returns 0.0.

### query.can_damage_nearby_mobs (query_can_damage_nearby_mobs)

Returns 1.0 if the entity can damage nearby mobs, else it returns 0.0.

### query.can_dash (query_can_dash)

Returns 1.0 if the entity can dash, else it returns 0.0

### query.can_fly (query_can_fly)

Returns 1.0 if the entity can fly, else it returns 0.0.

### query.can_power_jump (query_can_power_jump)

Returns 1.0 if the entity can power jump, else it returns 0.0.

### query.can_swim (query_can_swim)

Returns 1.0 if the entity can swim, else it returns 0.0.

### query.can_walk (query_can_walk)

Returns 1.0 if the entity can walk, else it returns 0.0.

### query.cape_flap_amount (query_cape_flap_amount)

Returns value between 0.0 and 1.0 with 0.0 meaning cape is fully down and 1.0 is cape is fully up.

### query.cardinal_block_face_placed_on (query_cardinal_block_face_placed_on)

_**deprecated**_

Returns the block face for this (only valid for on_placed_by_player trigger) (Down=0.0, Up=1.0, North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0). Deprecated; please use query.block_face instead.

### query.cardinal_facing (query_cardinal_facing)

Returns the current facing of the player (Down=0.0, Up=1.0, North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0).

### query.cardinal_facing_2d (query_cardinal_facing_2d)

Returns the current facing of the player ignoring up/down part of the direction (North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0).

### query.cardinal_player_facing (query_cardinal_player_facing)

Returns the current facing of the player (Down=0.0, Up=1.0, North=2.0, South=3.0, West=4.0, East=5.0, Undefined=6.0).

### query.client_max_render_distance (query_client_max_render_distance)

_since 1.21.50_

Returns the max render distance in chunks of the current client. Available on the Client (Resource Packs) only.

### query.client_memory_tier (query_client_memory_tier)

_since 1.21.50_

Returns a number representing the client RAM memory tier, 0 = 'SuperLow', 1 = 'Low', 2 = 'Mid', 3 = 'High', or 4 = 'SuperHigh'. Available on the Client (Resource Packs) only.

### query.combine_entities (query_combine_entities)

Combines any valid entity references from all arguments into a single array. Note that order is not preserved, and duplicates and invalid values are removed.

### query.cooldown_time (query_cooldown_time)

_since 1.20.60_

Returns the total cooldown time in seconds for the item held or worn by the specified equipment slot name (and if required second numerical slot id), otherwise returns 0. Uses the same name and id that the replaceitem command takes when querying entities.

> Available without an experimental toggle starting in 1.20.60.

### query.cooldown_time_remaining (query_cooldown_time_remaining)

_since 1.20.60_

Returns the cooldown time remaining in seconds for specified cooldown type or the item held or worn by the specified equipment slot name (and if required second numerical slot id), otherwise returns 0. Uses the same name and id that the replaceitem command takes when querying entities. Returns highest cooldown if no parameters are supplied.

> Available without an experimental toggle starting in 1.20.60.

### query.count (query_count)

Counts the number of things passed to it (arrays are counted as the number of elements they contain; non-arrays count as 1).

### query.current_squish_value (query_current_squish_value)

Returns the squish value for the current entity, or 0.0 if this doesn't make sense. Applies to slimes and magma cubes.

### query.dash_cooldown_progress (query_dash_cooldown_progress)

_**deprecated**_

Returns dash cooldown progress if the entity can dash, else it returns 0.0. Deprecated; no longer available in pack min_engine_version 1.20.50. Please see camel.entity.json script.pre_animation for example of how to now process dash cooldown.

### query.day (query_day)

Returns the day of the current world. When the world is first created, that is day `1`.

### query.death_ticks (query_death_ticks)

Returns the elapsed ticks since the mob started dying.

### query.debug_output (query_debug_output)

Debug log a value to the output debug window for builds that have one.

### query.delta_time (query_delta_time)

Returns the time in seconds since the previous frame.

### query.distance_from_camera (query_distance_from_camera)

Returns the distance of the root of this entity or particle emitter from the camera.

### query.effect_emitter_count (query_effect_emitter_count)

Returns the total number of active emitters of the callee's particle effect type.

### query.effect_particle_count (query_effect_particle_count)

Returns the total number of active particles of the callee's particle effect type.

### query.entity_biome_has_all_tags (query_entity_biome_has_all_tags)

_since 1.21.130_

Compares the biome the entity is standing in with one or more tag names, and returns either 0 or 1 based on if all of the tag names match. Only supported in resource packs (client-side).

> Available without an experimental toggle in 1.21.130. Only supported in resource packs (client-side).

### query.entity_biome_has_any_identifier (query_entity_biome_has_any_identifier)

_since 1.21.130_

Compares the biome the entity is standing in with one or more identifier names, and returns either 0 or 1 based on if any of the identifier names match. Only supported in resource packs (client-side).

> Available without an experimental toggle in 1.21.130. Only supported in resource packs (client-side).

### query.entity_biome_has_any_tags (query_entity_biome_has_any_tags)

_since 1.21.130_

Compares the biome the entity is standing in with one or more tag names, and returns either 0 or 1 based on if any of the tag names match. Only supported in resource packs (client-side).

> Available without an experimental toggle in 1.21.130. Only supported in resource packs (client-side).

### query.equipment_count (query_equipment_count)

Returns the number of equipped armor pieces for an entity from 0 to 5, not counting items held in hands. (To query for hand slots, use `query.is_item_equipped` or `query.is_item_name_any`).

### query.equipped_item_all_tags (query_equipped_item_all_tags)

Takes a slot name followed by any tag you want to check for in the form of 'tag_name' and returns 1 if all of the tags are on that equipped item, 0 otherwise.

Example (Example):
```json
"query.equipped_item_any_tag('slot.weapon.mainhand', 'minecraft:is_shovel')"
```

### query.equipped_item_any_tag (query_equipped_item_any_tag)

Takes a slot name followed by any tag you want to check for in the form of 'tag_name' and returns 0 if none of the tags are on that equipped item or 1 if at least 1 tag exists.

### query.equipped_item_is_attachable (query_equipped_item_is_attachable)

Takes the desired hand slot as a parameter (0 or 'main_hand' for main hand, 1 or 'off_hand' for off hand), and returns whether the item is an attachable or not.

### query.eye_target_x_rotation (query_eye_target_x_rotation)

Returns the X eye rotation of the entity, else it returns 0.0. Applies to the guardian.

### query.eye_target_y_rotation (query_eye_target_y_rotation)

Returns the Y eye rotation of the entity, else it returns 0.0. Applies to the guardian.

### query.facing_target_to_range_attack (query_facing_target_to_range_attack)

Returns 1.0 if the entity is attacking from range (i.e. `minecraft:behavior.ranged_attack`), else it returns 0.0.

### query.frame_alpha (query_frame_alpha)

Returns the ratio (from 0 to 1) of how much between AI ticks this frame is being rendered.

### query.fuse_time (query_fuse_time)

_since 1.26.30_

Returns the remaining fuse time of the entity. Returns -1 if the entity doesn't have a "minecraft:explode" component.

### query.get_actor_info_id (query_get_actor_info_id)

Returns the integer id of an entity (actor) by its string name. Relates to item data fields in recipes. Applies to game versions 1.19.80 and higher.

### query.get_animation_frame (query_get_animation_frame)

Returns the current texture of an item whose appearance can change (such as a drawn bow).

### query.get_default_bone_pivot (query_get_default_bone_pivot)

Gets specified axis of the specified bone orientation pivot.

### query.get_equipped_item_name (query_get_equipped_item_name)

_**deprecated**_

Takes one optional hand slot as a parameter (0 or 'main_hand' for main hand, 1 or 'off_hand' for off hand), and a second parameter (0=default) if you would like the equipped item or any non-zero number for the currently rendered item, and returns the name of the item in the requested slot (defaulting to the main hand if no parameter is supplied) if there is one, otherwise returns ''. DEPRECATED (Use query.is_item_name_any instead if possible so names can be changed later without breaking content.)

### query.get_level_seed_based_fraction (query_get_level_seed_based_fraction)

_since 1.26.10_

Returns a value in range [0.0, 1.0] based on the level seed.

> Introduced in 1.26.0 behind the Upcoming Creator Features experimental toggle. Available without the experimental toggle in 1.26.10.

### query.get_locator_offset (query_get_locator_offset)

Gets specified axis of the specified locator offset.

### query.get_name (query_get_name)

_**deprecated**_

Get the name of the mob if there is one, otherwise return ''. Deprecated; use `query.is_name_any` instead if possible so names can be changed later without breaking content.

### query.get_pack_setting (query_get_pack_setting)

_since 1.21.130_

Returns value of Pack Setting slider, parameter is name of slider. Available on the Client (Resource Packs) only.

> Pack settings (sliders/toggles/dropdowns) are read-only at runtime via this and related queries. Available on the Client (Resource Packs) only.

### query.get_root_locator_offset (query_get_root_locator_offset)

Gets specified axis of the specified locator offset of the root model.

### query.graphics_mode_is_any (query_graphics_mode_is_any)

_since 1.21.80_

If the graphics mode of the client matches any of the arguments, return 1.0. Takes in one or more arguments ('simple', 'fancy', 'deferred', 'raytraced'). Available on the Client (Resource Packs) only.

### query.ground_speed (query_ground_speed)

Returns the ground speed of the entity in meters/second.

### query.had_component_group (query_had_component_group)

If the entity is being loaded from data that was last saved with a component_group with the specified name, returns 1.0, otherwise returns 0.0. The purpose of this query is to allow entity definitions to change and still be able to load the correct state of entities. Usable only in behavior packs when determining the default value for an entity's Property. Requires one string argument.

### query.has_all_biome_tags (query_has_all_biome_tags)

Returns 1.0 if the biome at the current placement position has all of the specified tags, else 0.0. Takes (tag1, tag2, ...).

### query.has_any_biome_tags (query_has_any_biome_tags)

Returns 1.0 if the biome at the current placement position has at least one of the specified tags, else 0.0. Takes (tag1, tag2, ...).

### query.has_any_family (query_has_any_family)

Returns 1 if the entity has any of the specified type families, else 0.

### query.has_any_leashed_entity_of_type (query_has_any_leashed_entity_of_type)

_since 1.21.80_

Returns whether or not the entity is currently leashing other entities of the designated types.

### query.has_armor_slot (query_has_armor_slot)

Takes the armor slot index as a parameter, and returns 1.0 if the entity has armor in the requested slot, else it returns 0.0. The valid values for the armor slot index are 0 (head), 1 (chest), 2 (legs) and 3 (feet).

### query.has_biome_tag (query_has_biome_tag)

Returns whether or not a block placement target has a specific biome tag.

### query.has_block_property (query_has_block_property)

_**deprecated**_

Returns 1.0 if the associated block has the given block state or 0.0 if not. (No longer available in packs with `min_engine_version` >= 1.20.40.)

### query.has_block_state (query_has_block_state)

Returns 1.0 if the associated block has the given block state or 0.0 if not.

### query.has_cape (query_has_cape)

Returns 1.0 if the player has a cape, else it returns 0.0.

### query.has_collision (query_has_collision)

Returns 1.0 if the entity has collisions enabled, else it returns 0.0.

### query.has_dash_cooldown (query_has_dash_cooldown)

Returns 1.0 if the entity has cooldown on its dash, else it returns 0.0

### query.has_gravity (query_has_gravity)

Returns 1.0 if the entity is affected by gravity, else it returns 0.0.

### query.has_head_gear (query_has_head_gear)

Returns boolean whether an entity has an item in their head armor slot or not, or false if no entity in current context

### query.has_owner (query_has_owner)

Returns true if the entity has an owner ID else it returns false. Pertains to wolf.

### query.has_player_rider (query_has_player_rider)

_since 1.20.70_

Returns 1 if the entity has a player riding it in any seat, else it returns 0.

> Available without experimental toggle in 1.20.70.

### query.has_property (query_has_property)

Returns 1.0 if a property with the given name exists, 0 otherwise. Takes one argument: the name of the property on the entity.

### query.has_rider (query_has_rider)

Returns 1.0 if the entity has a rider, else it returns 0.0

### query.has_target (query_has_target)

Returns 1.0 if the entity has a target, else it returns 0.0

### query.head_is_in_water (query_head_is_in_water)

Returns 1.0 if the entity's head is in water, else it returns 0.0.

### query.head_roll_angle (query_head_roll_angle)

Returns the roll angle of the head of the entity if it makes sense, else it returns 0.0. Applies to how a wolf looks at a player holding food.

### query.head_x_rotation (query_head_x_rotation)

Returns the nth head x rotation of the entity if it makes sense, else it returns 0.0. Takes one argument as a parameter.

### query.head_y_rotation (query_head_y_rotation)

Returns the nth head y rotation of the entity if it makes sense, else it returns 0.0. Takes one argument as a parameter, but horses, zombie horses, skeleton horses, donkeys and mules require a second parameter that clamps rotation in degrees.

### query.health (query_health)

Returns the health of the entity, or 0.0 if it doesn't make sense to call on this entity.

### query.heartbeat_interval (query_heartbeat_interval)

Returns the heartbeat interval of the entity in seconds. Returns 0 when the entity has no heartbeat.

### query.heartbeat_phase (query_heartbeat_phase)

Returns the heartbeat phase of the entity. 0.0 if at start of current heartbeat, 1.0 if at the end. Returns 0 on errors or when the entity has no heartbeat. Available on the client (resource packs) only.

### query.heightmap (query_heightmap)

Returns the world height (Y value) of the terrain at the specified position. Takes two arguments: X and Z world values.

### query.hurt_direction (query_hurt_direction)

Returns the hurt direction for the entity, otherwise returns 0.

### query.hurt_time (query_hurt_time)

Returns the hurt time for the entity, otherwise returns 0.

### query.in_range (query_in_range)

If the first argument is between the minimum and maximum (inclusive), returns 1.0. Otherwise returns 0.0. Requires 3 numerical arguments: a value, a minimum, and a maximum.

### query.invulnerable_ticks (query_invulnerable_ticks)

Returns the number of ticks of invulnerability the entity has left if it makes sense, else it returns 0.0. Applies to wither.

### query.is_admiring (query_is_admiring)

Returns 1.0 if the entity is admiring, else it returns 0.0. Applies to piglin.

### query.is_alive (query_is_alive)

Returns 1.0 if the entity is alive, and 0.0 if it's dead.

### query.is_angry (query_is_angry)

Returns 1.0 if the entity is angry, else it returns 0.0.

### query.is_attached (query_is_attached)

_since 1.20.70_

Returns 1.0 if the entity is attached to another entity (such as being held or worn), else it will return 0.0. Available only with resource packs.

> Available without experimental toggle in 1.20.70.

### query.is_attached_to_entity (query_is_attached_to_entity)

Returns 1.0 if the entity is attached to another entity, else it will return 0.0. Pertains to a player holding a fireworks rocket.

### query.is_avoiding_block (query_is_avoiding_block)

Returns 1.0 if the entity is fleeing from a block, else it returns 0.0.

### query.is_avoiding_mobs (query_is_avoiding_mobs)

Returns 1.0 if the entity is fleeing from mobs, else it returns 0.0. Pertains to wandering trader.

### query.is_baby (query_is_baby)

Returns 1.0 if the entity has a `is_baby` component, else it returns 0.0.

### query.is_breathing (query_is_breathing)

Returns 1.0 if the entity is breathing, else it returns 0.0.

### query.is_bribed (query_is_bribed)

Returns 1.0 if the entity has been bribed, else it returns 0.0. Pertains to bribing a dolphin with a fish.

### query.is_carrying_block (query_is_carrying_block)

Returns 1.0 if the entity is carrying a block, else it returns 0.0. Pertains to an Enderman carrying a block.

### query.is_casting (query_is_casting)

Returns 1.0 if the entity is casting, else it returns 0.0. Pertains to evoker.

### query.is_celebrating (query_is_celebrating)

Returns 1.0 if the entity is celebrating, else it returns 0.0.

### query.is_celebrating_special (query_is_celebrating_special)

Returns 1.0 if the entity is doing a special celebration, else it returns 0.0. Pertains to a piglin celebrating a special hunt.

### query.is_charged (query_is_charged)

Returns 1.0 if the entity has the `is_charged` component, else it returns 0.0.

### query.is_charging (query_is_charging)

Returns 1.0 if the entity is charging, else it returns 0.0. Applies to animation controller for player, vex, and drowned.

### query.is_chested (query_is_chested)

Returns 1.0 if the entity has chests attached to it (has the `is_chested` component), else it returns 0.0.

### query.is_cooldown_category (query_is_cooldown_category)

_since 1.20.60_

Returns 1.0 if the specified held or worn item has the specified cooldown category, otherwise returns 0.0. First argument is the cooldown name to check for, second argument is the equipment slot name, and if required third argument is the numerical slot id. For second and third arguments, uses the same name and id that the replaceitem command takes when querying entities.

> Available without an experimental toggle starting in 1.20.60. Referenced as `query.is_cooldown_type` in some early 1.20.60 release notes.

### query.is_crawling (query_is_crawling)

Returns 1.0 if the entity is crawling, else it returns 0.0

### query.is_critical (query_is_critical)

Returns 1.0 if the entity is at a critical level of damage, else it returns 0.0.

### query.is_croaking (query_is_croaking)

Returns 1.0 if the entity is croaking, else it returns 0.0.

### query.is_dancing (query_is_dancing)

Returns 1.0 if the entity is dancing, else it returns 0.0. Applies to parrot and allay.

### query.is_delayed_attacking (query_is_delayed_attacking)

Returns 1.0 if the entity is attacking using the delayed attack, else it returns 0.0. Applies to ravager.

### query.is_digging (query_is_digging)

Returns 1.0 if the entity is digging, else it returns 0.0.

### query.is_eating (query_is_eating)

Returns 1.0 if the entity is eating, else it returns 0.0. Applies to the panda.

### query.is_eating_mob (query_is_eating_mob)

Returns 1.0 if the entity is eating a mob, else it returns 0.0.

### query.is_elder (query_is_elder)

Returns 1.0 if the entity is an elder version of it, else it returns 0.0. Applies to the guardian.

### query.is_emerging (query_is_emerging)

Returns 1.0 if the entity is emerging, else it returns 0.0.

### query.is_emoting (query_is_emoting)

Returns 1.0 if the entity is emoting, else it returns 0.0. Applies to a player.

### query.is_enchanted (query_is_enchanted)

Returns 1.0 if the entity is enchanted, else it returns 0.0. Applies to armor, bows, crossbows, and shields.

### query.is_feeling_happy (query_is_feeling_happy)

_**deprecated**_

Returns 1.0 if behavior.timer_flag_2 is running, else it returns 0.0. Deprecated; no longer available in packs with `min_engine_version` >= 1.20.50.

### query.is_fire_immune (query_is_fire_immune)

Returns 1.0 if the entity is immune to fire (has the `fire_immune` component), else it returns 0.0.

### query.is_first_person (query_is_first_person)

Returns 1.0 if the entity is being rendered in first person mode, else it returns 0.0.

### query.is_ghost (query_is_ghost)

Returns 1.0 if an entity is a ghost, else it returns 0.0. Applies to the guardian.

### query.is_gliding (query_is_gliding)

Returns 1.0 if the entity is gliding, else it returns 0.0. Applies to the elytra.

### query.is_grazing (query_is_grazing)

Returns 1.0 if the entity is grazing, or 0.0 if not. Applies to the horse and sheep grazing animations.

### query.is_idling (query_is_idling)

Returns 1.0 if the entity is idling, else it returns 0.0.

### query.is_ignited (query_is_ignited)

Returns 1.0 if the entity is ignited (has the `is_ignited` component), else it returns 0.0.

### query.is_illager_captain (query_is_illager_captain)

Returns 1.0 if the entity is an illager captain (has the `is_illager_captain` component), else it returns 0.0.

### query.is_in_contact_with_water (query_is_in_contact_with_water)

Returns 1.0 if the entity is in contact with any water (water, rain, splash water bottle), else it returns 0.0.

### query.is_in_lava (query_is_in_lava)

Returns 1.0 if the entity is in lava, else it returns 0.0.

### query.is_in_love (query_is_in_love)

Returns 1.0 if the entity is in love (has a love-hearts animation), else it returns 0.0.

### query.is_in_ui (query_is_in_ui)

Returns 1.0 if the entity is rendered as part of the UI, else it returns 0.0.

### query.is_in_water (query_is_in_water)

Returns 1.0 if the entity is in water, else it returns 0.0.

### query.is_in_water_or_rain (query_is_in_water_or_rain)

Returns 1.0 if the entity is in water or rain, else it returns 0.0.

### query.is_interested (query_is_interested)

Returns 1.0 if the entity is interested, else it returns 0.0. Applies typically to the fox and the wolf.

### query.is_invisible (query_is_invisible)

Returns 1.0 if the entity is invisible (using render controllers), else it returns 0.0. Applies typically to the spider, Enderman, and phantom.

### query.is_item_equipped (query_is_item_equipped)

Takes one optional hand slot as a parameter (0 or 'main_hand' for main hand, 1 or 'off_hand' for off hand), and returns 1.0 if there is an item in the requested slot (defaulting to the main hand if no parameter is supplied), otherwise returns 0.0.

### query.is_item_name_any (query_is_item_name_any)

Returns 1.0 if an item in the specified slot has any of the specified names, otherwise returns 0.0. Takes an equipment slot name (see the replaceitem command) and an optional slot index value. (The slot index is required for slot names that have multiple slots, for example 'slot.hotbar'.) After that, takes one or more full name (with 'namespace:') strings to check for. An empty string '' can be specified to check for an empty slot. Note that querying slot.enderchest, slot.saddle, slot.armor, or slot.chest will only work in behavior packs. A preferred query to query.get_equipped_item_name, as it can be adjusted by Mojang to avoid breaking content if names are changed.

### query.is_jump_goal_jumping (query_is_jump_goal_jumping)

Returns 1.0 if the entity is doing a jump goal jump, else it returns 0.0.

### query.is_jumping (query_is_jumping)

Returns 1.0 if the entity is jumping, else it returns 0.0.

### query.is_laying_down (query_is_laying_down)

Returns 1.0 if the entity is laying down, else it returns 0.0.

### query.is_laying_egg (query_is_laying_egg)

Returns 1.0 if the entity is laying an egg, else it returns 0.0.

### query.is_leashed (query_is_leashed)

Returns 1.0 if the entity is leashed to something, else it returns 0.0. Applies generally to the wandering trader and associated llamas.

### query.is_levitating (query_is_levitating)

Returns 1.0 if the entity is levitating, else it returns 0.0.

### query.is_lingering (query_is_lingering)

Returns 1.0 if the potion type or effect is lingering, else it returns 0.0.

### query.is_local_player (query_is_local_player)

_since 1.19.60_

Returns 1.0 if the entity is the local player for the current game window, else it returns 0.0. In splitscreen returns 0.0 for the other local players for other views. Always returns 0.0 if used in a behavior pack. Takes no arguments.

### query.is_moving (query_is_moving)

Returns 1.0 if the entity is moving, else it returns 0.0.

### query.is_name_any (query_is_name_any)

Takes one or more arguments. If the entity's name is any of the specified string values, returns 1.0. Otherwise returns 0.0. A preferred query to query.get_name, as it can be adjusted by Mojang to avoid breaking content if names are changed.

### query.is_on_fire (query_is_on_fire)

Returns 1.0 if the entity is on fire, else it returns 0.0.

### query.is_on_ground (query_is_on_ground)

Returns 1.0 if the entity is on the ground, else it returns 0.0.

### query.is_on_screen (query_is_on_screen)

Returns 1.0 if this is called on an entity at a time when it is known if it is on screen, else it returns 0.0.

### query.is_onfire (query_is_onfire)

Returns 1.0 if the entity is on fire, else it returns 0.0.

### query.is_orphaned (query_is_orphaned)

Returns 1.0 if the entity is orphaned, else it returns 0.0. This is part of the 'sittable' component.

### query.is_owner_identifier_any (query_is_owner_identifier_any)

Returns whether the root entity identifier is any of the specified strings. A preferred query to `query.owner_identifier`, as it can be adjusted by Mojang to avoid breaking content if names are changed. Takes one or more arguments.

### query.is_pack_setting_enabled (query_is_pack_setting_enabled)

_since 1.21.130_

Returns 1.0 if the Pack Setting toggle is enabled, parameter is name of toggle. Available on the Client (Resource Packs) only.

### query.is_pack_setting_selected (query_is_pack_setting_selected)

_since 1.21.130_

Returns 1.0 if the Pack Setting dropdown or multiselect (first parameter) matches the string value of the second parameter (selection). Available on the Client (Resource Packs) only.

### query.is_persona_or_premium_skin (query_is_persona_or_premium_skin)

Returns 1.0 if the player has a persona or premium skin, else it returns 0.0.

### query.is_playing_dead (query_is_playing_dead)

Returns 1.0 if the entity is playing dead, else it returns 0.0. Applies generally to the axolotl.

### query.is_powered (query_is_powered)

Returns 1.0 if the entity is powered, else it returns 0.0. Applies generally to the bee.

### query.is_pregnant (query_is_pregnant)

Returns 1.0 if the entity is pregnant, else it returns 0.0. Applies generally to turtles and frogs.

### query.is_ram_attacking (query_is_ram_attacking)

Returns 1.0 if the entity is using a ram attack, else it returns 0.0. Applies generally to goats.

### query.is_resting (query_is_resting)

Returns 1.0 if the entity is resting, else it returns 0.0. Applies generally to the bat.

### query.is_riding (query_is_riding)

Returns 1.0 if the entity is riding, else it returns 0.0.

### query.is_riding_any_entity_of_type (query_is_riding_any_entity_of_type)

Returns whether or not the entity is currently riding an entity of any of the designated types.

### query.is_rising (query_is_rising)

Returns 1.0 if behavior.timer_flag_2 is running, else it returns 0.0. Deprecated. No longer available in pack `min_engine_version` >= 1.20.50.

### query.is_roaring (query_is_roaring)

Returns 1.0 if the entity is currently roaring, else it returns 0.0. Applies generally to the ravager and warden.

### query.is_rolling (query_is_rolling)

Returns 1.0 if the entity is rolling, else it returns 0.0. Applies generally to the panda.

### query.is_saddled (query_is_saddled)

Returns 1.0 if the entity has a saddle (has the `is_saddled` component), else it returns 0.0.

### query.is_scared (query_is_scared)

Returns 1.0 if the entity is scared, else it returns 0.0. Applies generally to a panda being startled by a baby panda sneeze.

### query.is_scenting (query_is_scenting)

Returns 1.0 if behavior.timer_flag_1 is running, else it returns 0.0. Deprecated; no longer available in packs with a `min_engine_version` >= 1.20.50.

### query.is_searching (query_is_searching)

Returns 1.0 if the entity is searching, else it returns 0.0.

### query.is_selected_item (query_is_selected_item)

Returns true if the player has selected an item in the inventory, else it returns 0.0.

### query.is_shaking (query_is_shaking)

Returns 1.0 if the entity is shaking, else it returns 0.0. Applies generally to a hoglin, piglin, piglin brute, skeleton, strider, villager, or zombie villager.

### query.is_shaking_wetness (query_is_shaking_wetness)

Returns 1.0 if the entity is shaking water off, else it returns 0.0. Applies generally to wet wolves.

### query.is_sheared (query_is_sheared)

Returns 1.0 if the entity is able to be sheared and is sheared, else it returns 0.0. Applies generally to sheep and the snow golem.

### query.is_shield_powered (query_is_shield_powered)

Returns 1.0 if the entity has an active powered shield if it makes sense, else it returns 0.0. Applies generally to wither boss armor.

### query.is_silent (query_is_silent)

Returns 1.0 if the entity is silent, else it returns 0.0.

### query.is_sitting (query_is_sitting)

Returns 1.0 if the entity is sitting, else it returns 0.0. Applies generally to the fox, parrot, and wolf.

### query.is_sleeping (query_is_sleeping)

Returns 1.0 if the entity is sleeping, else it returns 0.0. Applies generally to the fox.

### query.is_sneaking (query_is_sneaking)

Returns 1.0 if the entity is sneaking, else it returns 0.0.

### query.is_sneezing (query_is_sneezing)

Returns 1.0 if the entity is sneezing, else it returns 0.0. Applies generally to the baby panda.

### query.is_sniffing (query_is_sniffing)

Returns 1.0 if the entity is sniffing, else it returns 0.0. Applies generally to the sniffer.

### query.is_sonic_boom (query_is_sonic_boom)

Returns 1.0 if the entity is using sonic boom, else it returns 0.0.

### query.is_spectator (query_is_spectator)

Returns 1.0 if the entity (player) is in spectator mode, else it returns 0.0.

### query.is_sprinting (query_is_sprinting)

Returns 1.0 if the entity is sprinting, else it returns 0.0. Applies generally to players, piglins, and rabbits.

### query.is_stackable (query_is_stackable)

Returns 1.0 if the entity is stackable (has the `is_stackable` component), else it returns 0.0.

### query.is_stalking (query_is_stalking)

Returns 1.0 if the entity is stalking, else it returns 0.0. Applies generally to the fox.

### query.is_standing (query_is_standing)

Returns 1.0 if the entity is standing, else it returns 0.0. Applies generally to the non-grazing animations of the donkey, mule, horse, skeleton horse, and zombie horse.

### query.is_stunned (query_is_stunned)

Returns 1.0 if the entity is currently stunned, else it returns 0.0. Applies generally to the ravager.

### query.is_swimming (query_is_swimming)

Returns 1.0 if the entity is swimming, else it returns 0.0.

### query.is_tamed (query_is_tamed)

Returns 1.0 if the entity is tamed, else it returns 0.0.

### query.is_transforming (query_is_transforming)

Returns 1.0 if the entity is transforming, else it returns 0.0. Applies generally to the husk or zombie.

### query.is_using_item (query_is_using_item)

Returns 1.0 if the entity is using an item, else it returns 0.0. Applies generally to the allay.

### query.is_wall_climbing (query_is_wall_climbing)

Returns 1.0 if the entity is climbing a wall, else it returns 0.0.

### query.item_in_use_duration (query_item_in_use_duration)

Returns the amount of time an item has been in use in seconds up to the maximum duration, else 0.0 if it doesn't make sense.

### query.item_is_charged (query_item_is_charged)

Takes one optional hand slot as a parameter (0 or 'main_hand' for main hand, 1 or 'off_hand' for off hand), and returns 1.0 if the item is charged in the requested slot (defaulting to the main hand if no parameter is supplied), otherwise returns 0.0. Applies generally to the crossbow.

### query.item_max_use_duration (query_item_max_use_duration)

Returns the maximum amount of time the item can be used, else 0.0 if it doesn't make sense. Applies generally to the brush.

### query.item_remaining_use_duration (query_item_remaining_use_duration)

Returns the amount of time an item has left to use, else 0.0 if it doesn't make sense. Item queried is specified by the slot name 'main_hand' or 'off_hand'. Time remaining is normalized using the normalization value, only if one is given, else it is returned in seconds. Applies generally to the crossbow.

### query.item_slot_to_bone_name (query_item_slot_to_bone_name)

This function returns the name of the bone this entity has mapped to that slot. Requires one parameter: the name of the equipment slot.

### query.key_frame_lerp_time (query_key_frame_lerp_time)

Returns the ratio between the previous and next key frames.

### query.kinetic_weapon_damage_duration (query_kinetic_weapon_damage_duration)

_since 1.21.130_

Returns the "max_duration" value of "damage_conditions" from the main-hand item's "minecraft:kinetic_weapon" component, or 0 if the component is not present.

### query.kinetic_weapon_delay (query_kinetic_weapon_delay)

_since 1.21.130_

Returns the "delay" value from the main-hand item's "minecraft:kinetic_weapon" component, or 0 if the component is not present.

### query.kinetic_weapon_dismount_duration (query_kinetic_weapon_dismount_duration)

_since 1.21.130_

Returns the "max_duration" value of "dismount_conditions" from the main-hand item's "minecraft:kinetic_weapon" component, or 0 if the component is not present.

### query.kinetic_weapon_knockback_duration (query_kinetic_weapon_knockback_duration)

_since 1.21.130_

Returns the "max_duration" value of "knockback_conditions" from the main-hand item's "minecraft:kinetic_weapon" component, or 0 if the component is not present.

### query.last_frame_time (query_last_frame_time)

Returns the time in *seconds* of the last frame. If an argument is passed, it is assumed to be the number of frames in the past that you wish to query. 'query.last_frame_time' (or the equivalent 'query.last_frame_time(0)') will return the frame time of the frame before the current one. 'query.last_frame_time(1)' will return the frame time of two frames ago. Currently we store the history of the last 30 frames, although note that this may change in the future. Passing an index more than the available data will return the oldest frame stored.

### query.last_hit_by_player (query_last_hit_by_player)

Returns 1.0 if the entity was last hit by the player, else it returns 0.0. If called by the client always returns 0.0. Relates to the `on_death` component.

### query.last_input_mode_is_any (query_last_input_mode_is_any)

_since 1.21.60_

Takes one or more arguments ('keyboard_and_mouse', 'touch', or 'gamepad'). If the last input used is any of the specified string values, returns 1.0. Otherwise returns 0.0. Available on the Client (Resource Packs) only.

### query.leashed_entity_count (query_leashed_entity_count)

_since 1.21.80_

Returns the number of entities for which this entity is the leash holder.

### query.lie_amount (query_lie_amount)

Returns the lie down amount for the entity. Applies generally to the panda.

### query.life_span (query_life_span)

Returns the limited life span of an entity, or 0.0 if it lives forever. Applies generally to the evocation fang.

### query.life_time (query_life_time)

Returns the time in seconds since the current animation started, else 0.0 if not called within an animation.

### query.lod_index (query_lod_index)

Takes an array of distances and returns the zero - based index of which range the actor is in based on distance from the camera. For example, 'query.lod_index(10, 20, 30)' will return 0, 1, or 2 based on whether the mob is less than 10, 20, or 30 units away from the camera, or it will return 3 if it is greater than 30.

### query.log (query_log)

Debug log a value to the content file.

### query.main_hand_item_max_duration (query_main_hand_item_max_duration)

Returns the use time maximum duration for the main hand item if it makes sense, else it returns 0.0. Used for item use computations.

### query.main_hand_item_use_duration (query_main_hand_item_use_duration)

Returns the use time for the main hand item. Used for item use computations.

### query.mark_variant (query_mark_variant)

Returns the entity's mark variant value, if the entity has the `mark_variant` component.

### query.max_durability (query_max_durability)

Returns the max durability an item can take.

### query.max_health (query_max_health)

Returns the maximum health of the entity, or 0.0 if it doesn't make sense to call on this entity.

### query.max_trade_tier (query_max_trade_tier)

Returns the maximum trade tier of the entity if it can perform trades, else it returns 0.0

### query.maximum_frame_time (query_maximum_frame_time)

Returns the time in *seconds* of the most expensive frame over the last 'n' frames. If an argument is passed, it is assumed to be the number of frames in the past that you wish to query. 'query.maximum_frame_time' (or the equivalent 'query.maximum_frame_time(0)') will return the frame time of the frame before the current one. 'query.maximum_frame_time(1)' will return the maximum frame time of the previous two frames. Currently we store the history of the last 30 frames, although note that this may change in the future. Asking for more frames will result in only sampling the number of frames stored.

### query.minimum_frame_time (query_minimum_frame_time)

Returns the time in *seconds* of the least expensive frame over the last 'n' frames. If an argument is passed, it is assumed to be the number of frames in the past that you wish to query. 'query.minimum_frame_time' (or the equivalent 'query.minimum_frame_time(0)') will return the frame time of the frame before the current one. 'query.minimum_frame_time(1)' will return the minimum frame time of the previous two frames. Currently we store the history of the last 30 frames, although note that this may change in the future. Asking for more frames will result in only sampling the number of frames stored.

### query.model_scale (query_model_scale)

Returns the scale of the current entity. Can be used with the `is_baby` component.

### query.modified_distance_moved (query_modified_distance_moved)

Returns the total distance the entity has moved horizontally in meters (since the entity was last loaded, not necessarily since it was originally created). Distance can be affected by status flags such as `is_baby` or `on_fire`.

### query.modified_move_speed (query_modified_move_speed)

Returns the current walk speed of the entity. Can be modified by status flags such as `is_baby` or `on_fire`.

### query.modified_swing_duration (query_modified_swing_duration)

_since 1.21.120_

Returns the duration of the mob's swing/attack animation, determined by the carried item and modified by effects applied on the mob. To access the swing/attack animation progress, use "variable.attack_time" instead.

### query.moon_brightness (query_moon_brightness)

Returns the brightness of the moon (FULL_MOON=1.0, WANING_GIBBOUS=0.75, FIRST_QUARTER=0.5, WANING_CRESCENT=0.25, NEW_MOON=0.0, WAXING_CRESCENT=0.25, LAST_QUARTER=0.5, WAXING_GIBBOUS=0.75).

### query.moon_phase (query_moon_phase)

Returns the phase of the moon (FULL_MOON=0, WANING_GIBBOUS=1, FIRST_QUARTER=2, WANING_CRESCENT=3, NEW_MOON=4, WAXING_CRESCENT=5, LAST_QUARTER=6, WAXING_GIBBOUS=7).

### query.movement_direction (query_movement_direction)

Returns the specified axis of the normalized position delta of the entity. Applies generally to the elytra.

### query.noise (query_noise)

Queries a Perlin Noise Map. Pertains to terrain generation. Takes x and z coordinates and generates a number that emulates a random noise pattern seen in nature.

### query.on_fire_time (query_on_fire_time)

Returns the time that the entity is on fire, else it returns 0.0.

### query.out_of_control (query_out_of_control)

Returns 1.0 if the entity is out of control (has the `out_of_control` component), else it returns 0.0. Applies generally to boats and chest boats.

### query.overlay_alpha (query_overlay_alpha)

_**deprecated**_

Deprecated; this function is deprecated and will be removed.

### query.owner_identifier (query_owner_identifier)

_**deprecated**_

Returns the root entity identifier. Deprecated; use `query.is_owner_identifier_any` instead if possible so names can be changed later without breaking content.

### query.player_level (query_player_level)

Returns the players level if the entity is a player, otherwise returns 0.

### query.position (query_position)

Returns the absolute position of an entity. Takes one argument that represents the desired axis (0 == x-axis, 1 == y-axis, 2 == z-axis).

### query.position_delta (query_position_delta)

Returns the position delta for an entity. Takes one argument that represents the desired axis (0 == x-axis, 1 == y-axis, 2 == z-axis). Applies to player animation.

### query.previous_squish_value (query_previous_squish_value)

Returns the previous squish value for the current entity, or 0.0 if this doesn't make sense. Applies generally to slimes and magma cubes.

### query.property (query_property)

Returns the value of that property if it exists, else 0.0 if not. Takes one argument: the name of the property on the entity.

### query.relative_block_has_all_tags (query_relative_block_has_all_tags)

_since 1.20.60_

Takes an entity-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has all of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.relative_block_has_any_tag (query_relative_block_has_any_tag)

_since 1.20.60_

Takes an entity-relative position and one or more tag names, and returns either 0 or 1 based on if the block at that position has any of the tags provided.

> Available without an experimental toggle starting in 1.20.60.

### query.remaining_durability (query_remaining_durability)

Returns how much durability an item has remaining.

### query.ride_body_x_rotation (query_ride_body_x_rotation)

_since 1.20.70_

Returns the body pitch world-rotation of the ride an entity, else it returns 0.0.

> Available without experimental toggle in 1.20.70.

### query.ride_body_y_rotation (query_ride_body_y_rotation)

_since 1.20.70_

Returns the body yaw world-rotation of the ride of on an entity, else it returns 0.0.

> Available without experimental toggle in 1.20.70.

### query.ride_head_x_rotation (query_ride_head_x_rotation)

_since 1.20.70_

Returns the head x world-rotation of the ride of an entity, else it returns 0.0.

> Available without experimental toggle in 1.20.70.

### query.ride_head_y_rotation (query_ride_head_y_rotation)

_since 1.20.70_

Returns the head y world-rotation of the ride of an entity, else it returns 0.0. First parameter only for horses, zombie horses, skeleton horses, donkeys and mules that clamps rotation in degrees. Takes one optional argument as a parameter.

> Available without experimental toggle in 1.20.70.

### query.rider_body_x_rotation (query_rider_body_x_rotation)

_since 1.20.70_

Returns the body pitch world-rotation of a valid rider at the provided index if called on an entity, else it returns 0.0.

> Available without experimental toggle in 1.20.70.

### query.rider_body_y_rotation (query_rider_body_y_rotation)

_since 1.20.70_

Returns the body yaw world-rotation of a valid rider at the provided index if called on an entity, else it returns 0.0.

> Available without experimental toggle in 1.20.70.

### query.rider_head_x_rotation (query_rider_head_x_rotation)

_since 1.20.70_

Returns the head x world-rotation of the rider entity at the provided index, else it returns 0.0. Takes one argument as a parameter.

> Available without experimental toggle in 1.20.70.

### query.rider_head_y_rotation (query_rider_head_y_rotation)

_since 1.20.70_

Returns the head y world-rotation of the rider entity at the provided index, else it returns 0.0. Horses, zombie horses, skeleton horses, donkeys and mules require a second parameter that clamps rotation in degrees. Takes one or two arguments as parameters.

> Available without experimental toggle in 1.20.70.

### query.roll_counter (query_roll_counter)

Returns the roll counter of the entity. Generally applies to the panda.

### query.rotation_to_camera (query_rotation_to_camera)

Returns the rotation required to aim at the camera. Requires one argument representing the rotation axis you would like (0 for x, 1 for y).

### query.scoreboard (query_scoreboard)

_since 1.20.70_

Returns the specified scoreboard value for this entity. Available only with behavior packs. Takes one argument - the name of the scoreboard entry for this entity.

> Available without experimental toggle in 1.20.70. Limited to server-side queries only.

### query.server_memory_tier (query_server_memory_tier)

_since 1.21.50_

Returns a number representing the server RAM memory tier, 0 = 'SuperLow', 1 = 'Low', 2 = 'Mid', 3 = 'High', or 4 = 'SuperHigh'. Available on the server side (Behavior Packs) only.

### query.shake_angle (query_shake_angle)

Returns the shaking angle of the entity if it makes sense, else it returns 0.0. Generally applies to the wolf.

### query.shake_time (query_shake_time)

Returns the shake time of the entity.

### query.shield_blocking_bob (query_shield_blocking_bob)

Returns the how much the offhand shield should translate down when blocking and being hit.

### query.show_bottom (query_show_bottom)

Returns 1.0 if we render the entity's bottom, else it returns 0.0.

### query.sit_amount (query_sit_amount)

Returns the current sit amount of the entity. Applies generally to the panda.

### query.skin_id (query_skin_id)

Returns the entity's skin ID (related to the `skin_id` component).

### query.sleep_rotation (query_sleep_rotation)

Returns the rotation of the bed the player is sleeping on.

### query.sneeze_counter (query_sneeze_counter)

Returns the sneeze counter of the entity. Applies generally to the panda.

### query.spellcolor (query_spellcolor)

Returns a struct representing the entity spell color for the specified entity. The struct contains '.r' '.g' '.b' and '.a' members, each 0.0 to 1.0. If no actor is specified, each member value will be 0.0. Generally applies to evoker spell particles.

### query.standing_scale (query_standing_scale)

Returns the scale of how standing up the entity is. Generally applies to the polar bear.

### query.state_time (query_state_time)

_since 1.21.20_

Returns the time in seconds in the current animation controller state. Only valid in an animation controller.

### query.structural_integrity (query_structural_integrity)

Returns the structural integrity for the entity, otherwise returns 0. Generally applies to the minecart.

### query.surface_particle_color (query_surface_particle_color)

Returns the particle color for the block located in the surface below the entity (scanned up to 10 blocks down). The struct contains '.r' '.g' '.b' and '.a' members, each 0.0 to 1.0. If no entity is specified or if no surface is found, each member value is set to 0.0. Available on the Client (Resource Packs) only.

### query.surface_particle_texture_coordinate (query_surface_particle_texture_coordinate)

Returns the texture coordinate for generating particles for the block located in the surface below the entity (scanned up to 10 blocks down) in a structure with 'u' and 'v' keys. If no entity is specified or if no surface is found, u and v will be 0.0. Available on the Client (Resource Packs) only.

### query.surface_particle_texture_size (query_surface_particle_texture_size)

Returns the texture size for generating particles for the block located in the surface below the entity (scanned up to 10 blocks down). If no entity is specified or if no surface is found, each member value will be 0.0. Available on the Client (Resource Packs) only.

### query.swell_amount (query_swell_amount)

Returns how swollen an entity is. Generally applies to the creeper and wither.

### query.swelling_dir (query_swelling_dir)

Returns the swelling direction of the entity if it makes sense, else it returns 0.0. Applies generally to the overlay color of creeper preparing to explode.

### query.swim_amount (query_swim_amount)

Returns the amount the current entity is swimming.

### query.tail_angle (query_tail_angle)

Returns the angle of the tail of the entity if it makes sense, else it returns 0.0. Generally applies to the donkey, horse, mule, skeleton horse, wolf, zombie horse.

### query.target_x_rotation (query_target_x_rotation)

Returns the x rotation required to aim at the entity's current target if it has one, else it returns 0.0.

### query.target_y_rotation (query_target_y_rotation)

Returns the y rotation required to aim at the entity's current target if it has one, else it returns 0.0.

### query.texture_frame_index (query_texture_frame_index)

Returns the icon index of the experience orb.

### query.ticks_since_last_kinetic_weapon_hit (query_ticks_since_last_kinetic_weapon_hit)

_since 1.21.130_

Returns the number of ticks elapsed since the user last hit something while using a kinetic weapon. Returns -1.0 if no kinetic weapon is being used or if nothing has been hit yet. Hits that occur while the user is unloaded are not counted.

### query.time_of_day (query_time_of_day)

Returns the time of day (midnight=0.0, sunrise=0.25, noon=0.5, sunset=0.75) of the dimension the entity is in.

### query.time_since_last_vibration_detection (query_time_since_last_vibration_detection)

Returns the time in seconds since the last vibration detected by the entity. On errors or if no vibration has been detected yet, returns -1. Available on the Client (Resource Packs) only.

### query.time_stamp (query_time_stamp)

Returns the current time stamp of the level. Generally applies to cod, piglin, pufferfish, tropical fish, salmon.

### query.timer_flag_1 (query_timer_flag_1)

Returns 1.0 if behavior.timer_flag_1 is running, else it returns 0.0.

### query.timer_flag_2 (query_timer_flag_2)

Returns 1.0 if behavior.timer_flag_2 is running, else it returns 0.0.

### query.timer_flag_3 (query_timer_flag_3)

Returns 1.0 if behavior.timer_flag_3 is running, else it returns 0.0.

### query.total_emitter_count (query_total_emitter_count)

Returns the total number of active emitters in the world.

### query.total_particle_count (query_total_particle_count)

Returns the total number of active particles in the world.

### query.touch_only_affects_hotbar (query_touch_only_affects_hotbar)

_since 1.21.60_

Returns 1.0 if the touch input only affects the touchbar, otherwise returns 0.0. Available on the Client (Resource Packs) only.

### query.trade_tier (query_trade_tier)

Returns the trade tier of the entity if it makes sense, else it returns 0.0. Generaly applies to the villager.

### query.unhappy_counter (query_unhappy_counter)

_**deprecated**_

Always returns zero. (Was originally meant to indicate Panda unhappiness but due to an early code change it has always only returned zero)

### query.variant (query_variant)

Returns the entity's variant index. Relates to `variant` component.

### query.vertical_speed (query_vertical_speed)

Returns the speed of the entity up or down in meters/second, where positive is up.

### query.walk_distance (query_walk_distance)

Returns the total distance traveled by an entity while on the ground and not sneaking.

### query.wing_flap_position (query_wing_flap_position)

Returns the wing flap position of the entity, or 0.0 if this doesn't make sense. Pertains to the dragon and parrot.

### query.wing_flap_speed (query_wing_flap_speed)

Returns the wing flap speed of the entity, or 0.0 if this doesn't make sense. Pertains to the parrot.

### query.yaw_speed (query_yaw_speed)

Returns the entity's yaw speed.
