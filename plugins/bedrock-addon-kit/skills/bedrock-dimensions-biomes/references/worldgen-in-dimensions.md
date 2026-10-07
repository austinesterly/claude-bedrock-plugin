# World generation in custom biomes and custom dimensions

What generates where, and how to decorate a dimension whose generator is void. Feature, feature rule and jigsaw file formats are covered in `../../bedrock-world-content/references/worldgen.md`; field tables in `../../bedrock-json-reference/references/worldgen.md`.

## What runs where

| Step | Overworld / Nether with a replacement biome | Custom dimension (void generator) |
|---|---|---|
| Base terrain (noise, caves, oceans) | Vanilla. Not customizable ("The terrain generation pass doesn't offer much customization", world-generation.md) | None. Void is the only generator (Preview schema: "Only allows void generator") |
| Biome placement | `minecraft:replace_biomes` swaps part of the target biomes | One biome everywhere: `minecraft:default_biome` (default `minecraft:ocean`) |
| Surface builder, subsurface builder, `surface_material_adjustments`, `mountain_parameters` | Apply to your biome's columns | Nothing to act on: no terrain is generated |
| Feature rules (`minecraft:biome_filter`) | Run in new chunks of matching biomes | Attach to the default biome's tags. Whether the void generator runs the placement passes is **unverified**; even if it does, `query.heightmap` has no ground to find |
| Jigsaw structures (`biome_filters`, structure sets) | Generate in matching biomes | Worldgen placement unverified. Script placement works (below) |
| Mob spawning (spawn rules `has_biome_tag`) | Normal | Unverified |
| Client visuals (sky, fog, water, grass, sounds) | From your client_biome | From the default biome's client_biome |

So in a custom dimension, script is the reliable way to put things in the world.

## Decorating a void dimension from script (all Stable, 2.10.0)

Always load the target chunks first (`world.tickingAreaManager.createTickingArea` and `await` it), and only build in startup-registered or JSON-defined dimensions after `world.afterEvents.worldLoad` or later.

| Tool | Call | Good for |
|---|---|---|
| Fill | `dim.fillBlocks(new BlockVolume(from, to), "minecraft:grass_block", { blockFilter })` | Floors, layers, flat worlds near spawn |
| Clone | `dim.cloneBlocks(...)` with `CloneMode` `Copy`, `ForceCopy`, `Move` (2.10.0) | Repeating a built section |
| Single blocks | `dim.setBlockType(loc, type)`, `dim.getBlock(loc)?.setPermutation(perm)` | Details |
| Features | `dim.placeFeature("ns:skylands_flower_patch_feature", loc, shouldThrow)` | Trees, flowers, ores, any JSON feature |
| Feature rules | `dim.placeFeatureRule("ns:skylands_flowers", loc)` | Re-use a rule's distribution at one spot |
| Structures | `world.structureManager.place("ns:island", dim, loc, options)` | Builds saved with structure blocks (`BP/structures/ns/island.mcstructure`) |
| Jigsaw | `world.structureManager.placeJigsawStructure("ns:ruins", dim, loc, options)`, `placeJigsaw(pool, targetJigsaw, maxDepth, dim, loc, options)` | Multi-piece structures |
| Commands | `/place feature`, `/place featurerule`, `/place jigsaw`, `/structure load` via `dim.runCommand` | Same, from functions |

Generating terrain as players explore: watch `world.afterEvents.playerDimensionChange` and poll player positions with `system.runInterval`, fill new areas ahead of the player (the Creator Tools `custom_dimensions` sample's endless runner extends a ledge this way). Keep each tick's work small; `fillBlocks` throws `UnloadedChunksError` outside loaded chunks.

## Features and feature rules for custom biomes

| Piece | Rule | Label |
|---|---|---|
| Target a biome | `"minecraft:biome_filter": [{"test": "has_biome_tag", "operator": "==", "value": "ns_glimmer_meadow"}]` | Stable |
| Placement passes | `first_pass`, `before_underground_pass`, `underground_pass`, `after_underground_pass`, `before_surface_pass`, `surface_pass`, `after_surface_pass`, `before_sky_pass`, `sky_pass`, `after_sky_pass`, `final_pass` | Stable |
| Distribution | `iterations`, `scatter_chance` {`numerator`, `denominator`}, `x`/`y`/`z` (number, Molang, or {`distribution`, `extent`}), `coordinate_eval_order` | Stable |
| Ground height | `"y": "query.heightmap(variable.worldx, variable.worldz)"` | Stable |
| Tag checks inside features | `query.has_all_biome_tags(...)`, `query.has_any_biome_tags(...)` | Stable (26.50) |
| Conditional placement | `minecraft:conditional_list` (`conditional_features` with Molang `condition`, `early_out_scheme`) | Stable (added 26.50; the Learn intro page still lists it as removed) |
| Multi-block plants | `minecraft:multi_block_feature` (26.40), `minecraft:multipart_block_column_feature` (26.50) | Stable |
| Snap to walls | `snap_to_surface_feature` `surface: "wall"`, `allow_non_air_placement`; `vertical_search_range` renamed `search_range` (26.50) | Stable |

Feature types available (forms): `aggregate_feature`, `cave_carver_feature`, `conditional_list`, `fossil_feature`, `geode_feature`, `growing_plant_feature`, `height_difference_filter_feature`, `horizontal_tree_decoration_feature`, `multi_block_feature`, `multiface_feature`, `multipart_block_column_feature`, `nether_cave_carver_feature`, `ore_feature`, `partially_exposed_blob_feature`, `scatter_feature`, `sculk_patch_feature`, `search_feature`, `sequence_feature`, `single_block_feature`, `snap_to_surface_feature`, `structure_template_feature`, `surface_relative_threshold_feature`, `tree_feature`, `underwater_cave_carver_feature`, `vegetation_patch_feature`, `weighted_random_feature`. The forms also list `beards_and_shavers`, `rect_layout` and `scan_surface`; the Learn intro says those "are no longer available".

Feature identifiers: keep the name part equal to the file name (`features/skylands_flower_feature.json` holds `ns:skylands_flower_feature`). The namespace is ignored in that match.

## Surface builders and noise (replacement biomes only)

- `minecraft:surface_builder` picks the column materials. Types: `overworld`, `frozen_ocean`, `mesa`, `swamp`, `capped`, `the_end`, `noise_gradient` (fields in biomes.md). Stable at format 1.26.30.
- `minecraft:subsurface_builder` applies a builder below the surface for cave biomes; prefer `noise_gradient` there (the others weren't updated for sub-terrain ranges).
- `noise_gradient`: `noise_descriptor` {`name`, `first_octave`, `amplitudes`} plus `noise_block_specifiers` with `range` {min, max} in [-1, 1] (clamped since 1.26.30) or `threshold`. `name` only seeds the noise.
- `surface_material_adjustments` swaps materials where its noise falls in `noise_range` (and optional `height_range`).
- Nether replacements accept only `overworld`, `frozen_ocean`, `capped`, `the_end` surface builders (1.26.0).

## Possible vs not (26.52)

| Want | Possible? | How |
|---|---|---|
| A new biome covering part of the Overworld or Nether | Yes, Stable | `replace_biomes` |
| A new biome placed by its own climate/noise rules | No | `overworld_generation_rules` and `multinoise_generation_rules` are ignored for custom biomes |
| Change vanilla terrain shape or height noise | No | `overworld_height` only affects map rendering |
| Custom End biomes | No | `replace_biomes` dimensions are overworld and nether only |
| A dimension with real generated terrain | No | Void generator only. Build with script, structures and features |
| A flat or themed dimension | Yes, Stable | JSON dimension with heights + default biome, then fill/structures from script |
| Several biomes in one custom dimension | No (one `default_biome`) | Fake it with client fog per player (`Player.fogSettings`, 2.10.0) or by building different blocks; the Editor Biome Data Assignment tool can paint biomes in Editor |
| Vanilla Overworld void or shorter | Yes (older feature) | `BP/dimensions/overworld.json` with `minecraft:dimension_bounds` and void generator; status unverified (dimensions.md) |
| Portals into a custom dimension | Script only | Item, block (`onStepOn`, `onPlayerInteract` custom components) or command calls `teleport` |
