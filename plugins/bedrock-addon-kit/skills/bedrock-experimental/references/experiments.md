# Experiment toggles and what they unlock

Curated 2026-10-06 against official changelogs through Minecraft Preview 26.60.30 (stable game 26.52). Toggle names are as they appear in world settings > Experiments. Exact wording and history: `../../bedrock-whats-new/references/experimental-changelog.md`. Script names: `../../bedrock-whats-new/references/preview-api.md`.

## Rules that apply to every toggle

- An experiment can't be turned off in a world once on. Always use a copy or a dedicated test world.
- Marketplace add-ons may not use experiments (Learn's cooperative add-on guidelines). Whether Realms accepts worlds with experiments is not confirmed by an official source; test before promising it. Shipped add-ons should have none.
- Experimental JSON and beta APIs can change or disappear in any weekly Preview. Re-test after each Preview build.
- Beta module versions are tied to one game build. A pack that requests `@minecraft/server` `2.12.0-beta` (Preview 26.60) won't load in 26.52 stable, where the beta is `2.11.0-beta`. Pin the beta that matches the build you test on (`current-versions.md` lists it).
- Beta typings: `npm i -D @minecraft/server@beta @minecraft/server-ui@beta` in the project folder (official Mojang npm packages). Ask before installing anything on the user's computer.

## Beta APIs

Unlocks beta versions of the script modules. What's in beta now (as of `@minecraft/server` 2.12.0-beta and `server-ui` 2.4.0-beta):

- **Blocks:** named ticks (`Block.scheduleNamedTick`, `hasScheduledNamedTick`, `removeScheduledNamedTick`, the `onNamedTick` custom component event; up to 4 per block, names up to 31 characters); `onNeighborChanged` with `BlockComponentNeighborChangedAfterEvent.getChanges` (needs the `minecraft:neighbor_change` component for direction filtering); `Block.canPlace`, `isSolid`, `getMapColor`, `trySetPermutation`; `BlockBoundingBoxUtils`.
- **Block storage and crafting:** `BlockEntityStorageComponent` (`store`, `transfer`, `release`, `getEntities`, `size`; up to 4 entities per block); `BlockRecipeCraftingComponent` (stonecutter), `BlockRecipeProcessingComponent` (crafter), `BlockVibrationPropertiesComponent`.
- **Events:** `world.beforeEvents.chatSend` / `afterEvents.chatSend`, `playerPlaceBlock` (before, cancellable), `playerItemAttackEntity` (before, cancellable), `playerCraftRecipe`, `playerCursorItemGrab` / `Release`, `playerUseNameTag`, `packSettingChange`, `system.beforeEvents.watchdogTerminate`.
- **Points of interest:** `PoiManager`, `PoiBlockManager`, `PoiBlockType` (`hasTag`), filters by name, tag and occupancy.
- **Other:** `EntityNpcComponent`, `PlayerWaypointsMode`, debug and primitive shape visibility (`hiddenFrom`, `defaultVisibleToAll`).
- **Forms (`server-ui` beta):** `CustomForm.multiButtonRow` (up to 3 buttons per row, `ButtonData`), `MessageBox` options (`showHorizontalButtons`, `button3WithOptions`), `MessageBoxBodyOptions`, `CustomFormOptions`.
- **Beta modules:** `@minecraft/server-gametest` (automated tests, simulated players), `@minecraft/server-admin` and `@minecraft/server-net` (Bedrock Dedicated Server: secrets, server variables, HTTP requests, level storage), `@minecraft/debug-utilities` (debug shapes and diagnostics).

## Upcoming Creator Features

The main toggle for new JSON. Current contents (format version 1.26.60 unless noted):

- `minecraft:block_entity` `container` (block inventories, up to 54 slots) with an optional `title`, and `entity_storage: true` (entities stored inside a block).
- `minecraft:collision_box` `min`/`max` corner form. The `origin`/`size` form works without the toggle. From 1.26.60 the component must be an **array** of boxes in every case (a breaking change, not experimental).
- `minecraft:enchantment_power_transmitter`, `minecraft:vibration_properties` (`dampen_vibrations`, `occlude_vibrations`), `minecraft:neighbor_change` (`neighbor_directions`).
- Point-of-interest types and hierarchical tags in behavior packs, plus `/locate poi`.
- Item `minecraft:storage_item` and `minecraft:bundle_interaction`, and block `destructible_by_mining.item_specific_speeds`, which Mojang's definitions still mark experimental.

## RenderDragon Features for Creators

Unlocks Vibrant Visuals creator features: point lights and their quality sliders, block light quality options, and lighting tweaks. Some of these options moved to the normal video settings in 26.50.

## Voxel Shapes

Unlocks `culling_shape` and voxel-shape culling for custom blocks. Since 26.50, vanilla blocks with shapes cull against custom voxel shapes without the toggle.

## Game drop previews

Each upcoming game drop has its own toggle. "Drop 4 of 2026" (Preview 26.60.29 onward) adds the Ice Cave biome, ice crystals, icicles, the Freezing effect, the Frostbite zombie variant and the ice ball. Vanilla ids from a drop preview may change before release, so don't reference them from shipped packs. "Villager Trade Rebalancing" changes villager trades.

## Custom dimensions and biomes

- Script-registered custom dimensions (`dimensionRegistry.registerCustomDimension` in `system.beforeEvents.startup`) were **Beta API** in 26.20 and are **Stable** since 26.30 (`@minecraft/server` 2.8.0). Add-ons built on the 26.20 beta should follow the migration section in `bedrock-dimensions-biomes/references/dimensions.md`.
- JSON dimension files and `minecraft:default_biome` are **Stable** since 26.50 (void generator only).
- `minecraft:clouds` for dimensions appeared under Experimental Technical Updates in Preview 26.60.21 with no toggle named: treat it as experimental until the release notes say otherwise.
- Custom biomes through `minecraft:replace_biomes` are **Stable**. Biome `environment_attributes` appears only in the beta biome schema. `Dimension.getWeather`, `getGeneratedStructures` and `poiManager` are **Beta API**.

## Recently graduated (now stable or next stable)

- **26.60 (next stable, `@minecraft/server` 2.11.0):** world clocks (`WorldClockRegistry`, `World.getClock`, time markers, `/time` overloads; the Creator World Clocks Features toggle was removed), `SoundInstance` controls, `loopCount`, `Dimension.spawnXp`, `EntityIsTamedComponent.tamedToPlayer`, `TextPrimitive.lineGapHeight`, server sound definitions at format 1.26.60; `server-ui` 2.3.0 (`MessageBox`, `ImageDetails`, option objects).
- **26.50 (stable, 2.10.0):** `cloneBlocks`, `BlockQueryOptions`, camera shake, `entityTamed` events, sneaking events, `Player.fogSettings`, block dynamic properties, `server-graphics` 1.0.0, horizontal multi-blocks, `minecraft:sound` block component, custom `sound_event` names (format 1.26.50).
- **Earlier:** `minecraft:block_entity` without the toggle from format 1.26.20, the `minecraft:multi_block` trait, `minecraft:instrument_sound`.
