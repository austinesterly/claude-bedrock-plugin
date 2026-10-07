# Entity behavior recipes (from vanilla 1.26.50 files)

Citations are vanilla behaviour files in Mojang/bedrock-samples, `behavior_pack/entities/<mob>.json`. Copy the exact field shapes from the current vanilla file when in doubt; the summaries below give the components and the numbers that matter.

## Movement types

**Walker (cow, pig):** `movement` 0.25, `movement.basic`, `navigation.walk` (`can_path_over_water`, `avoid_water`, `avoid_damage_blocks`), `jump.static`, `behavior.random_stroll`, `behavior.float`.

**Swimmer only (fish, dolphin):** `navigation.generic` with `can_swim: true, can_walk: false, can_sink: false`, `can_breach` true for dolphins. `movement` 0.1-0.12 plus `underwater_movement` 0.12-0.15. Goals: `behavior.random_swim` (xz_dist 16-20, y_dist 4), `behavior.swim_idle`, `behavior.swim_wander`, `behavior.move_to_water` (search_range 15) to get back if beached. *(dolphin, tropicalfish)*
- Air breathers that swim: `breathable` `breathes_air: true, breathes_water: false, total_supply: 240` + `behavior.swim_up_for_breath`. *(dolphin)*
- Schools: `minecraft:flocking` (in_water, low/high_flock_limit 4/8, cohesion/separation weights, match_variants). *(tropicalfish)*
- Vanilla fish carry `minecraft:despawn` (despawn_from_distance 32-40): remove it for owned fish.

**Amphibious (turtle, axolotl, frog):** `navigation.generic` `is_amphibious: true, can_swim: true, can_walk: true, can_sink: false, avoid_damage_blocks: true`, `movement.amphibious` (max_turn 5 turtle, 15 axolotl), `underwater_movement` 0.15-0.2, `breathable` air + water. Goals: `move_to_water`, `random_swim` (xz 30, y 15), `swim_idle`. Frog: `behavior.jump_to_block` with preferred blocks.

**Free flight (parrot):** `can_fly`, `movement.fly`, `navigation.fly` (`can_path_from_air`, `can_path_over_water`), `movement` 0.4, `behavior.float`, `game_event_movement_tracking.emit_flap`.

**Hover (bee):** `navigation.hover` + `movement.hover` + `can_fly` + `flying_speed` 0.15, `behavior.random_hover` (xz/y_dist 8, hover_height [1,4]).

## Home restriction (keep a mob in an area)

- `minecraft:home`: `restriction_type` `none` / `random_movement` (only wandering stays near home) / `all_movement` (everything stays near; it can always walk back), `restriction_radius` in blocks, optional `home_block_list` (restriction lifts if that block disappears). Needs format_version >= 1.21.40. Schema stricter at 1.26.50.
- Pair with `behavior.move_towards_home_restriction`. `behavior.go_home` (`on_home` / `on_failed`) is "return to this block", like a bee to its hive. *(bee: random_movement, radius 22)*

## Grazing

`behavior.eat_block`: `success_chance` as Molang (`query.is_baby ? 0.02 : 0.001`), `time_until_eat` 1.8, `eat_and_replace_block_pairs` (grass -> dirt, tallgrass -> air, short/tall dry grass -> air), `on_eat` -> event. The sheep's `minecraft:on_eat_block` regrows wool. Grazing turns grass to dirt over time. *(sheep)*

## Breeding and babies

- Adult group: `minecraft:breedable` (`require_tame: false`, `breed_items`, `breeds_with: { "ns:x": {} }` keyed by mate type, as vanilla 1.26.50 does), plus `minecraft:offspring` with `offspring_pairs: { "ns:x": "ns:x" }` (mate type to baby type). The older `breeds_with: { "mate_type", "baby_type", "breed_event" }` form is still in older files, `behavior.breed`, `experience_reward.on_bred`. *(cow)*
- Baby group: `minecraft:is_baby`, `minecraft:scale` 0.5, `minecraft:ageable` (`duration` 1200 s, `feed_items`, `grow_up` -> `minecraft:ageable_grow_up`), `behavior.follow_parent`. *(cow)*
- Always on: `behavior.tempt` (follows a player holding food; stricter schema at 1.26.60), `leashable`. Events: `minecraft:entity_born`, `minecraft:entity_spawned`, `minecraft:spawn_adult`, `minecraft:ageable_grow_up`.
- Egg layers: `minecraft:pregnant` and `minecraft:wants_to_lay_egg` groups. *(turtle)*
- Scripts see births through `world.afterEvents.entitySpawn` (cause `Born`).

## Taming and pets

- `minecraft:tameable` (`probability`, `tame_items`, `tame_event`), then a tamed group with `minecraft:is_tamed`, `behavior.follow_owner`, `behavior.owner_hurt_by_target`, `behavior.owner_hurt_target`, `sittable` + `behavior.sit`. *(wolf, cat)*
- Script: `world.afterEvents.entityTamed` / `beforeEvents.entityTamed` are stable in 2.10.0; `EntityIsTamedComponent.tamedToPlayer`/`tamedToPlayerId` stable from 2.11.0 (game 26.60).
- Pets no longer follow owners into or out of custom dimensions (26.50).

## Leashing

`minecraft:leashable { presets: [{ filter, soft_distance, hard_distance, max_distance, can_be_stolen }], on_unleash }`; `leashable_to` arrived in 1.21.90. Put a `lead` locator on the model.

## Mounts

- `minecraft:rideable`: `seat_count`, `family_types ["player"]`, `interact_text`, `crouching_skip_interact`, `seats` (**array only from 1.26.60**) `{ position, min_rider_count, max_rider_count, lock_rider_rotation, rotate_rider_by, third_person_camera_radius }`, `dismount_mode` (`on_top_center`; `look_direction` new in 26.60), `on_rider_enter_event` / `on_rider_exit_event`, `pull_in_entities`.
- Seat height 0.1-0.5 blocks under the saddle surface. Pig box 0.9 / seat 0.63; horse seat 1.1; camel 1.905 on a 2.375 box.
- Ground steering: `input_ground_controlled` (horse). Item steering: `item_controllable` + `behavior.controlled_by_player` + `boostable` (pig).
- Flying mounts copy the happy ghast: `free_camera_controlled` + `vertical_movement_action` + `player_ride_tamed` + `movement.hover` + `flying_speed`.

## Reacting to players nearby

`minecraft:target_nearby_sensor { inside_range, outside_range, must_see, on_inside_range, on_outside_range }`. Day/night or light-based states: the vanilla spider chain (an `environment_sensor` with `is_brightness < 0.49` firing an event that swaps groups, plus a reverse sensor).

## Projectiles (1.26.30+)

Custom projectiles no longer need `runtime_identifier`. Shooter item -> ammo item with `minecraft:projectile` -> projectile entity with its own physics. At 1.26.50: `anchor` is `"origin"`/`"eye_height"`/`"middle"`, `impact_damage.damage` is `{min,max}`, `multiple_targets` defaults false, `isolated_physics` defaults true for custom projectiles (1.26.30+).

## Physics (1.26.30)

New: `bounciness`, `air_drag_modifier`, `uses_uniform_air_drag`, `pushable_by_entity` with presets. `friction_modifier` fixed at 1.26.20 (`uses_legacy_friction` opts back).

## Sounds and ambience

- 1.26.50: ambient sounds follow `minecraft:ambient_sound_interval` exactly (no more implicit `ambient.in.water` / `ambient.baby` swaps); use its `event_names` list with conditions to keep them.
- Events can `play_sound` / `emit_particle` directly.

## Spawn rules and loot

- Spawn rules: `conditions` with `spawns_on_surface`, `weight`, `herd { min_size, max_size }`, `biome_filter`; vanilla mostly uses format 1.8.0 (58 of 60 files in 1.26.50). For content that players buy or place, spawning by script is usually better.
- Loot: `set_count`, `looting_enchant`, `furnace_smelt`; point the entity's `minecraft:loot` at your own table. 1.26.50 added `operator` (`==`/`!=`/`equals`/`not`) to every loot condition.
