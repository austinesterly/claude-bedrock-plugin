# Experiment toggles and what they unlock

Curated 2026-10-06 against official changelogs through Minecraft Preview 26.60.30 (stable game 26.52). Toggle names are as they appear in world settings > Experiments. Exact wording and history: `../../bedrock-whats-new/references/experimental-changelog.md`. Script names: `../../bedrock-whats-new/references/preview-api.md`.

## Rules that apply to every toggle

- An experiment can't be turned off in a world once on. Always use a copy or a dedicated test world.
- Marketplace add-ons may not use experiments (Learn's cooperative add-on guidelines). Whether Realms accepts worlds with experiments is not confirmed by an official source; test before promising it. Shipped add-ons should have none.
- Experimental JSON and beta APIs can change or disappear in any weekly Preview. Re-test after each Preview build.
- Beta module versions are tied to one game build. A pack that requests `@minecraft/server` `2.12.0-beta` (Preview 26.60) won't load in 26.52 stable, where the beta is `2.11.0-beta`. Pin the beta that matches the build you test on (`current-versions.md` lists it).
- Beta typings: `npm i -D @minecraft/server@beta @minecraft/server-ui@beta` in the project folder (official Mojang npm packages). Ask before installing anything on the user's computer.

## Beta APIs

Unlocks beta versions of the script modules. What's in beta now (as of `@minecraft/server` 2.13.0-beta and `server-ui` 2.5.0-beta, Preview 26.70.21):

- **Blocks:** named ticks (`Block.scheduleNamedTick`, `hasScheduledNamedTick`, `removeScheduledNamedTicks`, `getScheduledNamedTickCount`, `getAllScheduledNamedTicks`, the `onNamedTick` custom component event; up to 4 per block, names up to 31 characters). **26.70.20 broke this beta API:** `removeScheduledNamedTick` became `removeScheduledNamedTicks`, and the event's `isName` was split into a `name` string and an `isMine()` method; `onNeighborChanged` with `BlockComponentNeighborChangedAfterEvent.getChanges` (needs the `minecraft:neighbor_change` component for direction filtering); `Block.canPlace`, `isSolid`, `getMapColor`, `trySetPermutation`; `BlockBoundingBoxUtils`.
- **Block storage and crafting:** `BlockEntityStorageComponent` (`store`, `transfer`, `release`, `getEntities`, `size`; up to 4 entities per block); `ItemBlockEntityStorageComponent` on item stacks (same methods, `release` takes a position; filled by the `carry_over_block_entity_data` loot function with `entity_storage: true`); `BlockInventoryComponent` now covers the vanilla chiseled bookshelf; `BlockRecipeCraftingComponent` (stonecutter), `BlockRecipeProcessingComponent` (crafter), `BlockVibrationPropertiesComponent`.
- **Events:** `world.beforeEvents.chatSend` / `afterEvents.chatSend`, `playerPlaceBlock` (before, cancellable), `playerItemAttackEntity` (before, cancellable), `playerCraftRecipe`, `playerCursorItemGrab` / `Release`, `playerUseNameTag`, `packSettingChange`, `system.beforeEvents.watchdogTerminate`.
- **Points of interest:** `PoiManager`, `PoiBlockManager`, `PoiBlockType` (`hasTag`), filters by name, tag and occupancy. The block POI APIs move to stable 2.12.0 with 26.70 (Preview 26.70.21).
- **Raycasts:** `usePreciseRaycast` on `BlockRaycastOptions` and `EntityRaycastOptions` keeps fractional distances and checks the full ray (26.70.21; negative `maxDistance` throws for entity raycasts).
- **Entities:** `Entity.startPassengerOfBlock(blockPosition, offset, rotation, rotationLimit, emote)` with `PassengerOfBlockEmoteType` Standing, Riding or Laying, `stopPassengerOfBlock()`, `isPassengerOfBlock` (26.70.20; sit or lie an entity on a block, with `query.is_laying` for animation; scripts must stop it when the block changes).
- **Music:** `Player.playMusic` / `World.playMusic` return a `SoundInstance` when there is no fade, and accept a sound definition as `trackId` (26.70.20).
- **Other:** `EntityNpcComponent`, `PlayerWaypointsMode`, debug and primitive shape visibility (`hiddenFrom`, `defaultVisibleToAll`).
- **Forms (`server-ui` 2.5.0-beta):** `MessageBoxBodyOptions`, `CustomFormOptions.topCloseButtonVisible`, `SliderOptions.fixedFormatDigits`. `CustomForm.multiButtonRow`, `ButtonData`, `MessageBoxOptions.showHorizontalButtons` and `button3WithOptions` left beta in 26.70.21 (rc 2.4.0).
- **Beta modules:** `@minecraft/server-gametest` (automated tests, simulated players), `@minecraft/server-admin` and `@minecraft/server-net` (Bedrock Dedicated Server: secrets, server variables, HTTP requests, level storage), `@minecraft/debug-utilities` (debug shapes and diagnostics).

## Upcoming Creator Features

The main toggle for new JSON. Current contents (format version 1.26.60 unless noted):

- `minecraft:block_entity` `container` (block inventories, up to 54 slots) with an optional `title` and, from 26.70.20, `show_ui_on_interaction: false` (no built-in UI, so `onPlayerInteract` runs instead), and `entity_storage: true` (entities stored inside a block). Custom containers follow chest open permissions.
- Entity filters `speed`, `horizontal_speed` and `vertical_speed` (meters per second) appeared under Experimental Technical Updates in Preview 26.70.21 with no toggle named: treat them as experimental.
- `carry_over_block_entity_data` loot function `entity_storage: true` (26.70.20): stored entities travel with the dropped item and come back when it is placed.
- Entity `minecraft:time_marker_sensor` (26.70.20, beta entity format version): runs an entity event each time a named time marker fires on a named world clock.
- `minecraft:collision_box` `min`/`max` corner form. The `origin`/`size` form works without the toggle. From 1.26.60 the component must be an **array** of boxes in every case (a breaking change, not experimental).
- `minecraft:enchantment_power_transmitter`, `minecraft:vibration_properties` (`dampen_vibrations`, `occlude_vibrations`; the Preview changelog spells it `dampen_vibrations` but Mojang's docs schema from 2026-10-19 says `damper_vibrations`, so check the content log for whichever one the game rejects), `minecraft:neighbor_change` (`neighbor_directions`).
- Point-of-interest types and hierarchical tags in behavior packs, plus `/locate poi`. **Released in Preview 26.70.20**, so they leave the toggle when 26.70 ships; still experimental in stable 26.52 and 26.60.
- Item `minecraft:storage_item` and `minecraft:bundle_interaction`, and block `destructible_by_mining.item_specific_speeds`, which Mojang's definitions still mark experimental.

## RenderDragon Features for Creators

Unlocks Vibrant Visuals creator features: point lights and their quality sliders, block light quality options, and lighting tweaks. Some of these options moved to the normal video settings in 26.50.

## Voxel Shapes

Unlocks `culling_shape` and voxel-shape culling for custom blocks. Since 26.50, vanilla blocks with shapes cull against custom voxel shapes without the toggle.

## Game drop previews

Each upcoming game drop has its own toggle. "Drop 4 of 2026" (Preview 26.60.29 onward) adds the Ice Cave biome, ice crystals, icicles, the Freezing effect, the Frostbite zombie variant and the ice ball. Vanilla ids from a drop preview may change before release, so don't reference them from shipped packs. "Villager Trade Rebalancing" changes villager trades. Preview 26.70.20 adds brittle ice and crevasses to Drop 4, plus a "Nether Spawning Rebalancing" toggle (lower Nether mob density, fortress spawning closer to Java Edition) that changes gameplay, not creator content.

## Custom dimensions and biomes

- Script-registered custom dimensions (`dimensionRegistry.registerCustomDimension` in `system.beforeEvents.startup`) were **Beta API** in 26.20 and are **Stable** since 26.30 (`@minecraft/server` 2.8.0). Add-ons built on the 26.20 beta should follow the migration section in `bedrock-dimensions-biomes/references/dimensions.md`.
- JSON dimension files and `minecraft:default_biome` are **Stable** since 26.50 (void generator only).
- `minecraft:clouds` for dimensions appeared under Experimental Technical Updates in Preview 26.60.21 with no toggle named: treat it as experimental until the release notes say otherwise.
- Custom biomes through `minecraft:replace_biomes` are **Stable**. Biome `environment_attributes` appears only in the beta biome schema. `Dimension.getWeather`, `getGeneratedStructures` and `poiManager` are **Beta API**.

## Recently graduated (now stable or next stable)

- **26.70 (in Preview, `@minecraft/server` 2.12.0, `server-ui` 2.4.0):** point-of-interest types with hierarchical tags and `/locate poi`, block POI script APIs, primitive shape `hiddenFrom` / `defaultVisibleToAll`, `server-ui` `multiButtonRow` and `MessageBoxOptions`; new stable block component `minecraft:jukebox_playlist_source`; entity component `minecraft:can_stand_on_brittle_ice`.
- **26.60 (next stable, `@minecraft/server` 2.11.0):** world clocks (`WorldClockRegistry`, `World.getClock`, time markers, `/time` overloads; the Creator World Clocks Features toggle was removed), `SoundInstance` controls, `loopCount`, `Dimension.spawnXp`, `EntityIsTamedComponent.tamedToPlayer`, `TextPrimitive.lineGapHeight`, server sound definitions at format 1.26.60; `server-ui` 2.3.0 (`MessageBox`, `ImageDetails`, option objects).
- **26.50 (stable, 2.10.0):** `cloneBlocks`, `BlockQueryOptions`, camera shake, `entityTamed` events, sneaking events, `Player.fogSettings`, block dynamic properties, `server-graphics` 1.0.0, horizontal multi-blocks, `minecraft:sound` block component, custom `sound_event` names (format 1.26.50).
- **Earlier:** `minecraft:block_entity` without the toggle from format 1.26.20, the `minecraft:multi_block` trait, `minecraft:instrument_sound`.
