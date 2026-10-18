# Creator-relevant changes by release

Curated from the official changelogs on feedback.minecraft.net (links in `current-versions.md`). Newest first. Each entry keeps only what changes how add-ons are built: new stable APIs and components, things that left experiments, and stricter parsing that can break existing files. The refresh routine appends new releases here.

Last curated: 2026-10-06 (through Preview 26.60.30).

## 26.60 (in Preview since 2026-09-02; stable expected late October 2026)

Script API: `@minecraft/server` 2.11.0 and `@minecraft/server-ui` 2.3.0 become stable; 2.12.0-beta / 2.4.0-beta added.
- **World clocks leave experiments**: `StartupEvent.worldClockRegistry.registerClock`, `World.getClock`, `WorldClock` (time, isPaused, set, skipTo, rewindTo, add/removeTimeMarker), `TimeMarker`, clock after-events and `worldClockOnRestart` before-event. Commands `/time of <clock> ...`, `/time pause|resume|query time`, `/time set <TimeMarker> next|previous|stay` no longer need the Creator World Clocks experiment (26.60.29).
- Sound control: `SoundInstance.setVolume/setPitch/fade/seekTo/pause/resume`, `loopCount` on Player/WorldSoundOptions (`-1` loops until the last handle is dropped), `WorldSoundOptions.isBroadcast`; server sound definitions released at format 1.26.60.
- `Dimension.spawnXp`, `TextPrimitive.lineGapHeight`, `EntityIsTamedComponent.tamedToPlayer` / `tamedToPlayerId`.
- DDUI (server-ui 2.3.0): `tooltip` on dropdown/slider/textField/text/toggle options; button icons via `ButtonOptions.imageDetails`, `MessageBox.button1WithOptions`/`button2WithOptions`.
- Rideables: new `dismount_mode: "look_direction"`.
- Loot tables at format 1.26.60 keep applying functions after a count reaches 0.
- Trail component: `replaceable_blocks`, `radius`, `force_replace_matched_blocks`.
- Item sound fields (`durability_sensor.sound_event`, `swing_sounds.*`, `use_modifiers.start_sound`) accept any sound_definitions event at format 1.26.50+, no experiment.
- Geometry: boolean bone visibility restored. Development packs now take precedence over other copies with an equal or older version.
- JSON documents capped at 128 MB; invalid JSON UI expressions now raise content errors.
- **Stricter at format 1.26.60 (file fails to load if wrong):** `movement.basic/sway/skip/generic/amphibious/fly/hover/dolphin/glide`, `movement.jump` (`jump_delay` float range), `behavior.tempt`, `float_tempt`, `panic`, `send_event`, `attack` (`damage` scalar or `{min,max}`, no arrays), `inventory`, `spell_effects`, `transformation` (`delay` object form, sound fields arrays), `healable` (`items` objects only, `effects` arrays), `buoyant` (`movement_type` none/waves/bobbing), `economy_trade_table`, `strength`, `teleport`, `rideable` (`seats` array only), `dash_action`, `rail_movement`, `scale_by_age`, `shareables` (`items` array only), `trail`, `annotation.break_door`. Blocks: `minecraft:collision_box` array only.
- Still experimental in 26.60: block containers (`block_entity.container`, `entity_storage`), points of interest and `/locate poi`, collision_box min/max form, several RenderDragon features.

## 26.50 "Wilderness Bound" (stable 2026-09-11; hotfixes 26.51, 26.52)

Script API: `@minecraft/server` 2.10.0 stable.
- New stable: `Dimension.cloneBlocks` + `CloneMode`; `BlockQueryOptions` for `Dimension.getBlocks`; `BlockVolumeBase.getClosest/getFarthest`; `Camera.addShake/stopShaking`; `entityTamed` before/after events; `entityStartSneaking/StopSneaking` after-events; `Player.fogSettings`; `BlockDynamicPropertiesComponent` and `ItemBlockDynamicPropertiesComponent` (block dynamic properties); `BlockInstrumentComponent`; `PrimitiveShapesManager.getShapes`; sound tracking (`SoundInstance.id/soundEventId/recipient/durationInfo`, `world.afterEvents.soundCompleted`, `world.soundDefinitionRegistry`, `Player.playSound` accepts a `SoundDefinition`); `DimensionTypes` includes custom dimensions.
- `@minecraft/server-graphics` 1.0.0 stable (needs server 2.3.0+).
- `@minecraft/server-ui` 2.2.0 stable: `CustomForm.image` + `ImageOptions`, `fixedFormatDigits` on sliders; DDUI works in split screen; hiding one CustomForm and showing another no longer returns UserBusy.
- `Entity.teleport` throws across dimensions while the entity has passengers.
- Custom dimensions can be defined in JSON with custom heights and `minecraft:default_biome`.
- `minecraft:block_entity` no longer needs an experiment from format 1.26.20; horizontal multi-blocks released at format 1.26.50; `minecraft:sound` block component out of experimental. Replacing a custom block that has a block entity with a different block creates a new block entity (its dynamic properties don't carry over).
- Vanilla fences, panes, iron bars, tripwire, chorus, fire and stairs expose connection/corner block states.
- Pack settings: new `multiselect` type, `query.is_pack_setting_selected`.
- Structure files v2 (smaller, faster). Loot conditions take `operator`.
- New entity components: `can_stand_on_powder_snow`, `block_movement_slowdown_immunity`, `freezing_immune`, `freezing_vulnerable`; `teleport` gains `teleports_on_projectile_hit`. `ambient_sound_interval` is now taken literally (no implicit water/air/baby event swaps). Projectiles: `multiple_targets` defaults false; owner immunity is spatial.
- `behavior.ranged_attack`: `attack_range` float range, `in_range_movement_mode` (hold_position / follow_target).
- Molang: `query.head_is_in_water`, `query.has_all_biome_tags`, `query.has_any_biome_tags`.
- Script debugger listens on loopback by default.
- **Stricter at format 1.26.50:** `anger_level`, `barter`, `boss`, `collision_box`, `damage_over_time`, `exhaustion_values`, `flocking`, `game_event_movement_tracking`, `grows_crop`, `home`, `trade_table`, `physics`, `interact` (`interactions`, `spawn_entities`, `play_sounds` arrays only), `projectile` (string `anchor`, `impact_damage.damage` `{min,max}`, `mob_effects.effects` array, chances 0-1), `tamemount`, `preferred_path`, `behavior.follow_mob`, `insomnia`, `instant_despawn`, `timer` (`time` `{min,max}`).
- Experimental in 26.50: world clocks (stable in 26.60), DDUI tooltips and button icons (stable in 26.60), block containers, POI, debugger live diagnostics, `chatSend` can edit `targets` (still beta).

## 26.40 (stable 2026-07-31)

- `@minecraft/server` 2.9.0: `Block.getParts`, `playerStartBreakingBlock` / `playerCancelBreakingBlock` after-events, `Dimension.calculateClosestBiomeFromSeed` (renamed from findClosestBiome), `LootItem.conditions`.
- `minecraft:multi_block` trait released (vertical; horizontal needed the experiment until 26.50). N-way rotation on geometry and `sixteen_way_rotation` no longer need the experiment. `minecraft:instrument_sound` released. New `minecraft:not_pickable_from_inside`.

## 26.30 (2026; from the official 1.26.30 creator video, not re-checked against its changelog)

- `@minecraft/server-ui` 2.1.0: **Data-Driven UI** (`CustomForm`, `MessageBox`, `ObservableBoolean/Number/String`) stable.
- **Custom dimensions** stable (`dimensionRegistry.registerCustomDimension`), with `world.tickingAreaManager` for preloading.
- Custom projectiles without `runtime_identifier`; `isolated_physics` defaults true for format 1.26.30+.
- Physics: `bounciness`, `air_drag_modifier`, `uses_uniform_air_drag`, `pushable_by_entity` presets (graduated from experimental). Items need at least one component.
- `apply_knockback_rules` still in progress; avoid.

## 26.20 and 26.10 (from official creator videos)

- 26.20: `minecraft:on_equipment_changed`; `friction_modifier` fixed (`uses_legacy_friction` to opt out); `damage_sensor.deals_damage` is a string (`yes` / `no` / `no_but_entity_effects_apply`).
- 26.10 (official update notes, learn.microsoft.com/minecraft/creator/documents/update1.26.10): `minecraft:pushable` split into `pushable_by_block` (was `is_pushable_by_piston`) and `pushable_by_entity` (was `is_pushable`); the old component is no longer parsed and the entity fails to load. Stricter AI goal schemas (ram_attack, celebrate, lay_egg, play_dead and more); `buoyant.simulate_waves` replaced by `movement_type`.
- 26.10: cancellable `world.beforeEvents.entityHurt`; `entityHeal` before/after; `entityItemPickup` before/after and `entityItemDrop` after; `world.tickingAreaManager`; `world.seed`, `containsBiomes`, `BiomeFilter`; camera spline animations (`CatmullRomSpline`, `camera.playAnimation`).

## Earlier milestones still relevant

- 1.21.100: custom slash commands stable (`customCommandRegistry`); 1.26 added `cheatsRequired` and the `origin` first callback argument.
- 1.21.90: custom components V2 (component ids as keys with params; the `minecraft:custom_components` list is rejected); `leashable_to`.
- 1.21.50: entity events can `play_sound` and `emit_particle`.
- Script API 2.0: `system.beforeEvents.startup` replaces `worldInitialize`; `runCommandAsync` removed; `isValid` is a property; new `applyKnockback` signature.
- 1.21.120: Windows moved to the GDK build; packs live under `%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang`.

## Announced but not shipped (as of 2026-10-06)

From Mojang's creator talks (unverified until they appear in a changelog): entity-block links (bee/hive style), AI transition improvements, entity lights, audio instancing, more custom-dimension features, block entities with inventories (experimental now). No client-side scripting is planned in the short or medium term.
