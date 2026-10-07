---
name: bedrock-dimensions-biomes
description: Use when building or debugging custom dimensions or custom biomes in a Minecraft Bedrock add-on - dimension JSON (minecraft:dimension, dimension_height, default_biome, generation, clouds), dimensionRegistry / registerCustomDimension, teleporting players between dimensions, ticking areas and chunk preloading, biome JSON (climate, surface builders, replace_biomes, tags), client_biome files (sky, fog, water, grass and foliage colors, ambient sounds, music), world generation and features inside a custom dimension or biome, and migrating beta-era custom dimension add-ons.
---

# Custom dimensions and custom biomes

Checked 2026-10-06 against `@minecraft/server` 2.10.0 typings, Mojang bedrock-samples 1.26.50.4 schemas and vanilla biomes (plus the Preview 1.26.60.29 dimension schemas), the Microsoft Learn creator docs and forms, and the official changelogs 26.20 to 26.60.30. Target: stable game 26.52, no experiments.

## Stability at a glance

| Feature | Label | Since / source |
|---|---|---|
| `dimensionRegistry.registerCustomDimension(id)` in `system.beforeEvents.startup` | **Stable** | Beta in 26.20; stable in 26.30, `@minecraft/server` 2.8.0 ("Released DimensionRegistry from beta to v2.8.0") |
| JSON dimension `BP/dimensions/*.json`: `minecraft:dimension_height`, `minecraft:default_biome`, `minecraft:generation` (`void` only) | **Stable** | 26.50 ("Added support for defining custom dimensions with JSON and configuring custom dimension heights") |
| `minecraft:clouds` (`height`) in dimension JSON | **Next stable**, unverified | 26.60.21, listed under Experimental Technical Updates with no toggle named; not in the 26.52 schema |
| `world.tickingAreaManager` | **Stable** | 26.10 (beta in 1.21.130) |
| `DimensionTypes.get/getAll` include custom dimensions | **Stable** | 26.50 / 2.10.0 |
| Custom biome via `minecraft:replace_biomes` (Overworld) | **Stable** | 1.21.110 ("available without experimental toggle in 1.21.110") |
| `replace_biomes` in the Nether | **Stable** | 1.26.0 |
| `surface_builder` / `subsurface_builder` (incl. `noise_gradient`) | **Stable** | format 1.26.30 ("taken out of beta") |
| `village_type` biome component | **Stable** | 1.26.0 |
| client_biome components, Vibrant Visuals identifiers | **Stable** | 1.21.40 schema; cubemap 1.21.130 |
| Biome Script APIs (`getBiome`, `BiomeTypes`, `containsBiomes`, `calculateClosestBiomeFromSeed`) | **Stable** | 2.10.0 typings |
| `query.has_all_biome_tags` / `has_any_biome_tags` (worldgen Molang) | **Stable** | 26.50 |
| `Dimension.getGeneratedStructures`, `getWeather`, `poiManager` | **Beta API** | 2.12.0-beta |
| Biome `environment_attributes` (placeholder attributes) | **Experimental** | `beta` biome schema only; toggle unverified |
| Points of interest, `/locate poi` | **Experimental** (Upcoming Creator Features) | 26.50 / 26.60 |
| "Custom Biomes" experiment toggle | unverified | Listed for 1.21.80/1.21.90; no 26.x source mentions it and nothing here needs it |

## Decide first

| You want | Use | Reference | Template |
|---|---|---|---|
| An empty arena, lobby, skyblock | `registerCustomDimension` in startup (void generator, default heights) | `references/dimensions.md` | `templates/skylands-dimension` (`ns:void`) |
| A dimension with its own height range, sky, fog and biome | JSON dimension + BP biome + RP client biome + fog | `dimensions.md`, `biomes.md` | `templates/skylands-dimension` (`ns:skylands`) |
| Terrain in a custom dimension | Script: `fillBlocks`, `placeFeature`, structures, jigsaw, behind a ticking area. The generator is void only | `references/worldgen-in-dimensions.md` | `references/recipes.md` #1, #2 |
| A new biome in normal worlds | BP biome with `minecraft:replace_biomes` + client biome + feature rules on its tag | `biomes.md` | `templates/overworld-biome` |
| Recolor or retune a vanilla biome | BP biome with the vanilla identifier, or a client_biome for that id | `biomes.md` | |
| A way in: item, block, command | Custom components / custom command calling `player.teleport(loc, { dimension })` | `recipes.md` #3 | `templates/skylands-dimension` |
| Old beta add-on (`"version": "beta"`, Learn tutorial code) | Switch to `@minecraft/server` 2.8.0+; same call | `dimensions.md` Migration | |

## Workflow

1. **Pick the id once.** `ns:name`, lowercase. The id is the save key for the dimension's chunks; renaming it orphans what players built.
2. **Create the dimension** in exactly one place: a JSON file in `BP/dimensions/` (needed for heights or a default biome) or `registerCustomDimension` in `system.beforeEvents.startup`. Not both for the same id.
3. **Add the biome** (optional): `BP/biomes/<name>.biome.json` with climate and a unique tag such as `ns_name`; `RP/biomes/<name>.client_biome.json` for sky, fog, water, grass, foliage, sounds; `RP/fogs/` if you ship a fog. Point the dimension's `minecraft:default_biome` at it.
4. **Build the landing area** from script after the world loads: `await world.tickingAreaManager.createTickingArea(...)`, then `fillBlocks` / `placeFeature` / `structureManager.place`. Store "already built" in a world dynamic property.
5. **Teleport** with `player.teleport(location, { dimension })` from `system.run(...)` (commands, item and block callbacks run in restricted mode). Keep the ticking area until the teleport is done, then remove it. Dismount riders first.
6. **Return trip**: save the player's origin (dimension id + location dynamic properties) before leaving a vanilla dimension.
7. **Check**: `/bedrock-check packs` (or `node <plugin>/scripts/check-pack.mjs packs`), then Mojang's validator (`npx mct validate -i packs --single -o report`), then in game read the content log. Biomes and feature rules only affect newly generated chunks.

## Rules that bite

- Custom dimensions have **void generation only**. Surface builders, noise and `overworld_generation_rules` do nothing there. Whether feature rules run during void generation is unverified; place features from script.
- `replace_biomes.targets` are vanilla names **without** a namespace; `dimension` is `minecraft:overworld` or `minecraft:nether`. Append new replacements; reordering changes seeds.
- `overworld_generation_rules`, `multinoise_generation_rules` and `overworld_height` are vanilla-only ("unused for custom biomes"; height only affects map rendering).
- `minecraft:default_biome` on a vanilla dimension file is a content error (26.50).
- `/reload` can't add a newly registered dimension (`CustomDimensionReloadNewDimensionError`): restart the world.
- `DimensionTypes` and `world.getDimension` see custom dimensions only after startup has finished.
- Ticking areas from script share a per-pack chunk budget (`maxChunkCount`, `hasCapacity`); keep them small and temporary.
- Pets don't follow owners into or out of custom dimensions (26.50).
- Feature and feature rule file names should equal the identifier's name part (`features/skylands_flower_feature.json` = `ns:skylands_flower_feature`).

## Files in this skill

- `references/dimensions.md`: history, JSON fields with ranges, script API, ticking areas, teleporting, persistence, limits, migration from beta.
- `references/biomes.md`: where custom biomes can appear, every BP biome component and surface builder, client_biome components, tags and everything that reads them, vanilla examples.
- `references/worldgen-in-dimensions.md`: what runs in replacement biomes vs custom dimensions, decorating from script, features and feature rules, possible vs not.
- `references/recipes.md`: void/skyblock, flat themed dimension with a biome, portal item/block/command, Overworld biome.
- `templates/skylands-dimension/`: JSON dimension + biome + client biome + fog + flower features + travel item + `BP/scripts/ns_dimensions.js` (registers `ns:void`, `/ns:travel`, item component). The generator adds `import "./<ns>_dimensions.js";` to `main.js`; when copying by hand, add it yourself (see its README).
- `templates/overworld-biome/`: replacement biome with surface, tints, client colors and a tagged flower feature rule.

Related: `bedrock-world-content` (features, jigsaw, fog, spawn rules), `bedrock-scripting` (startup, events, custom commands), `bedrock-json-reference/references/worldgen.md` (generated field tables), `bedrock-whats-new` (what changed since this check).
