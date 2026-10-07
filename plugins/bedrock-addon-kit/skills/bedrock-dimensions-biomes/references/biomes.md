# Custom biomes: server JSON, client JSON, tags

Checked 2026-10-06 against Mojang bedrock-samples 1.26.50.4 (89 vanilla `behavior_pack/biomes/*.biome.json`, schemas `server/biome/{1.21.110,1.26.0,1.26.30,beta}`, `client/biome/1.21.40`), the Microsoft Learn forms `content/forms/{biome,client_biome}`, Update1.21.110/1.26.0/1.26.30 notes and the 26.x changelogs. Full field tables generated from the same forms: `../../bedrock-json-reference/references/worldgen.md` (search `### minecraft:<component>`).

## Where a custom biome can appear

| Place | How | Label |
|---|---|---|
| Overworld, part of vanilla biomes | `minecraft:replace_biomes` with `"dimension": "minecraft:overworld"` | **Stable** since 1.21.110 ("Custom partial biome replacement is available without experimental toggle in 1.21.110") |
| Nether, part of vanilla biomes | same, `"dimension": "minecraft:nether"`. Surface builder must be `minecraft:overworld`, `frozen_ocean`, `capped` or `the_end` | **Stable** since 1.26.0 |
| The End | `replace_biomes` accepts only overworld and nether | Not possible |
| A whole custom dimension | `minecraft:default_biome` in the dimension JSON (see dimensions.md) | **Stable** since 26.50 |
| Change a vanilla biome everywhere | A BP biome file whose identifier is the vanilla one (`minecraft:beach`); world-generation.md shows one | **Stable** |
| Painted by hand | Editor "Biome Data Assignment" tool (26.30+) | Editor only |
| A brand-new biome placed by climate | `minecraft:overworld_generation_rules` / `multinoise_generation_rules`: the forms say "pre-Caves and Cliffs component and is unused for custom biomes" | Not possible |

The "Custom Biomes" experiment toggle is listed in ExperimentalFeaturesToggle.md (1.21.80/1.21.90 era). No 26.x changelog mentions it and nothing above needs it. Whether the toggle still exists, and what it still unlocks, is unverified.

## Files

| File | Root | Holds |
|---|---|---|
| `BP/biomes/<name>.biome.json` | `minecraft:biome` | Generation and gameplay: climate, surface, replacement, tags |
| `RP/biomes/<name>.client_biome.json` | `minecraft:client_biome` | Rendering and sound: sky, fog, water, grass and foliage colors, ambient sounds, music |
| `RP/fogs/<name>.json` | `minecraft:fog_settings` | Fog referenced by `minecraft:fog_appearance` |
| `RP/biomes_client.json` | legacy | Old per-biome client settings. Not loaded from vanilla packs since base game 1.21.40; still read for other content. Use client_biome files |

Identifiers: lowercase, namespaced (`ns:skylands`). The client biome `description.identifier` must match a biome defined by the game or a BP.

## BP biome document

```json
{
  "format_version": "1.26.50",
  "minecraft:biome": {
    "description": { "identifier": "ns:glimmer_meadow" },
    "components": { }
  }
}
```

`format_version`: vanilla files use 1.21.110, 1.26.0, 1.26.30 and 1.26.50. Use **1.26.50** (or at least 1.26.30 for `surface_builder`/`subsurface_builder` and the [-1, 1] `noise_gradient` range, 1.26.0 for `village_type`, 1.21.110 for `replace_biomes`). `minecraft:biome` needs `description` and `components`. No component is required.

### Components (all **Stable** at the format version given)

| Component | Fields | Notes |
|---|---|---|
| `minecraft:climate` | `temperature` (float), `downfall` (float; 0 stops rain), `snow_accumulation` ([min, max], steps of 0.125 = one snow layer) | Every vanilla biome has it. Temperature drives snow/ice, sponge drying, sky color |
| `minecraft:creature_spawn_probability` | `probability` (0.0 to 0.75) | Chance creatures spawn on chunk generation. Vanilla mesa_bryce: 0.03 |
| `minecraft:humidity` | `is_humid` (bool, **required**) | Fire spread chance and rate |
| `minecraft:map_tints` | `grass` (**required**): `{"type": "tint", "tint": "#rrggbb"}` or `{"type": "noise"}`; `foliage` ("#rrggbb") | Map item colors only |
| `minecraft:mountain_parameters` | `steep_material_adjustment` {`material`, `north_slopes`, `south_slopes`, `east_slopes`, `west_slopes`}; `top_slide` {`enabled` **required**} | Overworld mountains (frozen_peaks uses packed ice on north/east slopes) |
| `minecraft:surface_builder` | `builder` (**required**): one of the builder objects below | Format 1.26.30+ (left beta in 26.30). Bedrock floor and ceiling are placed regardless |
| `minecraft:subsurface_builder` | `builder` (**required**) | Format 1.26.30+. Applies a builder to biomes under the terrain surface (cave biomes). Older builder types weren't updated for sub-terrain ranges; `minecraft:noise_gradient` was. vanilla sulfur_caves uses both |
| `minecraft:surface_material_adjustments` | `adjustments`: array of {`materials` **required** {`top_material`, `mid_material`, `sea_floor_material`, `foundation_material`, `sea_material`}, `noise_range` [min, max], `noise_frequency_scale`, `height_range` [min, max]} | Applied in order; all matches apply. Blocks can be `"minecraft:dirt"` or `{"name": "minecraft:dirt", "states": {"dirt_type": "coarse"}}` (dappled_forest) |
| `minecraft:replace_biomes` | `replacements` (**required**): array of {`dimension` "minecraft:overworld" or "minecraft:nether", `targets` (vanilla names **without** namespace, at least 1), `amount` (0 < x ≤ 1), `noise_frequency_scale` (0 < x ≤ 100)} | Lower frequency = bigger, rarer areas. Append new entries at the end; reordering changes existing seeds |
| `minecraft:village_type` | `type`: `default`, `desert`, `ice`, `savanna`, `taiga` | Format 1.26.0+ |
| `minecraft:tags` | `tags` (string array, **required**) | See Tags below |
| `minecraft:partially_frozen` | `{}` | Patchy ice and snow in frozen biomes |
| `minecraft:overworld_generation_rules` | `generate_for_climates` [[climate, weight]], `hills_transformation`, `mutate_transformation`, `river_transformation`, `shore_transformation` | Vanilla only: "unused for custom biomes" |
| `minecraft:multinoise_generation_rules` | `target_temperature`, `target_humidity`, `target_altitude`, `target_weirdness`, `weight` | Vanilla only: "unused for custom biomes" |
| `minecraft:overworld_height` | `noise_type` (`beach`, `deep_ocean`, `default`, `default_mutated`, `extreme`, `highlands`, `less_extreme`, `lowlands`, `mountains`, `mushroom`, `ocean`, `river`, `stone_beach`, `swamp`, `taiga`) or `noise_params` [depth, scale] | "Does not change overworld height, and currently only affects map item rendering" |

### Surface builder types (`builder.type`)

| Type | Required fields | Optional | Vanilla example |
|---|---|---|---|
| `minecraft:overworld` | `top_material`, `mid_material`, `foundation_material`, `sea_floor_material`, `sea_material`, `sea_floor_depth` (int) | | plains |
| `minecraft:frozen_ocean` | same as overworld | | frozen_ocean (adds icebergs) |
| `minecraft:mesa` | overworld fields + `clay_material`, `hard_clay_material`, `bryce_pillars` (bool), `has_forest` (bool) | | mesa_bryce |
| `minecraft:swamp` | overworld fields + `max_puddle_depth_below_sea_level` (int 0 to 127) | | swampland, mangrove_swamp |
| `minecraft:capped` | `floor_materials` (array), `ceiling_materials` (array), `foundation_material`, `sea_material` | `beach_material` | Nether-style floors and ceilings |
| `minecraft:the_end` | none | | the_end |
| `minecraft:noise_gradient` | `noise_descriptor` {`name`, `first_octave` (int), `amplitudes` (number array)}, `noise_block_specifiers` [{`block` **required**, `range` {min, max} or `threshold`, `noise`}] | `non_replaceable_blocks` | sulfur_caves. Since format 1.26.30 noise is clamped to [-1, 1] |

### Beta format only

The `beta` biome schema adds `environment_attributes` beside `description` and `components`, with placeholder entries `minecraft:experimental_bool_attr`, `minecraft:experimental_color_attr`, `minecraft:experimental_float_attr_1`, `minecraft:experimental_float_attr_2` (each `{operation, value}`; float operations `override`, `alpha_blend`, `add`, `subtract`, `multiply`, `minimum`, `maximum`). **Experimental**: toggle unverified, no documented effect. Don't ship it.

## Client biome document

```json
{
  "format_version": "1.21.40",
  "minecraft:client_biome": {
    "description": { "identifier": "ns:skylands" },
    "components": { }
  }
}
```

All **Stable** (schema `client/biome/1.21.40`; the Vibrant Visuals identifiers come from the Learn forms). Colors are `"#rrggbb"` or `[r, g, b]`.

| Component | Fields | Notes |
|---|---|---|
| `minecraft:sky_color` | `sky_color` (**required**) | |
| `minecraft:fog_appearance` | `fog_identifier` (**required**) | A `minecraft:fog_settings` id: yours (`ns:skylands_fog`) or vanilla (`minecraft:fog_plains`, `minecraft:fog_warped_forest`, `minecraft:fog_default`) |
| `minecraft:water_appearance` | `surface_color`, `surface_opacity` (0 to 1) | Vibrant Visuals scales it by `biome_water_color_contribution` (1.26.0) |
| `minecraft:grass_appearance` | `color`: a color, or `{"color_map": "grass" or "swamp_grass"}` | |
| `minecraft:foliage_appearance` | `color`: a color, or `{"color_map": "birch", "dry_foliage", "evergreen", "foliage", "mangrove_swamp_foliage" or "swamp_foliage"}` | |
| `minecraft:dry_foliage_color` | `color` (**required**) | |
| `minecraft:ambient_sounds` | `loop`, `addition`, `mood` (sound names from `individual_named_sounds` in `sounds.json`) | Vanilla names: `ambient.warped_forest.loop`, `ambient.crimson_forest.additions`, `ambient.basalt_deltas.mood`, `ambient.cave`, `ambient.underwater.loop`. No `mood` = `ambient.cave` |
| `minecraft:biome_music` | `music_definition` (string; empty = no music; missing = dimension default), `volume_multiplier` (0 to 1) | Since 1.21.50 |
| `minecraft:atmosphere_identifier` | `atmosphere_identifier` (**required**) | Vibrant Visuals; id from RP `atmospherics/` |
| `minecraft:lighting_identifier` | `lighting_identifier` (**required**) | Vibrant Visuals; RP `lighting/` |
| `minecraft:color_grading_identifier` | `color_grading_identifier` (**required**) | Vibrant Visuals; RP `color_grading/` |
| `minecraft:water_identifier` | `water_identifier` (**required**) | Vibrant Visuals; RP `water/` |
| `minecraft:cubemap_identifier` | `cubemap_identifier` (**required**) | Vibrant Visuals skybox, since 1.21.130; RP `cubemaps/` |
| `minecraft:precipitation` | `ash`, `blue_spores`, `red_spores`, `white_ash` (density floats; at most one) | In the Learn forms; not in the 1.21.40 client schema (unverified which file reads it) |

Script overrides for these Vibrant Visuals settings (`BiomeWater`, `BiomeColorGrading`, `BiomeLighting`) were added **in beta** in 26.30 under "Graphics Override APIs" (module not named there). They are **Stable** in `@minecraft/server-graphics` 1.0.0 (released in 26.50): its typings include `BiomeWater`, `BiomeColorGrading`, `BiomeLighting` and `BiomeAtmospherics`, plus per-player overrides. See `bedrock-visuals/references/lighting-and-atmosphere.md`.

## Tags and what reads them

`minecraft:tags` is how everything else finds a biome. Give each custom biome one tag unique to your pack (`ns_skylands`) plus the vanilla tags whose behavior you want.

| Reader | Syntax | Label |
|---|---|---|
| Feature rules | `"minecraft:biome_filter": [{"test": "has_biome_tag", "operator": "==", "value": "ns_skylands"}]` (also `all_of`, `any_of`, `none_of`, `AND`, `OR`, `NOT` groups) | Stable |
| Spawn rules | same `minecraft:biome_filter` (vanilla cow: `has_biome_tag == animal`) | Stable |
| Jigsaw structures | `biome_filters` | Stable |
| Loot tables | condition `{"condition": "biome_has_tag", "tag": "plains"}` | Stable (26.30) |
| Worldgen Molang | `query.has_all_biome_tags(...)`, `query.has_any_biome_tags(...)` at the placement position | Stable (26.50) |
| Client Molang | `query.entity_biome_has_all_tags`, `entity_biome_has_any_tags`, `entity_biome_has_any_identifier` | Stable (1.21.130; were Upcoming Creator Features) |
| Script | `dimension.getBiome(loc).getTags()` / `.hasTags([...])`, `BiomeTypes.get(id)`, `BiomeTypes.getAll()`, `dimension.containsBiomes(volume, {includeTags, excludeTags, includeBiomes, excludeBiomes}, isSuperset)`, `dimension.calculateClosestBiomeFromSeed(pos, biome, {boundingSize})` | Stable (2.10.0). `getBiome` throws in unloaded chunks |
| Commands | `/locate biome <id>` (current dimension) | Stable |

Tags with built-in meaning (from the `minecraft:tags` form): `birch`, `meadow`, `pale_garden`, `plains`, `forest`, `flower_forest`, `swamp` (flower sets, mutually exclusive), `cold` and `frozen` (villagers dress for snow), `desert` and `mesa` (sand ambience), `jungle` (mossy ruined portals), `ocean`, `deep`, `ice`, `ice_plains`, `mutated`, `rare`, `extreme_hills`, `mountain`, `taiga`, `hills`, `no_legacy_worldgen`. Added in 1.26.0: `slime`, `swamp_water_huge_mushroom`, `fast_fishing`, `high_seas`, `surface_mineshaft`. Common spawn tags in vanilla files: `animal` (46 biomes), `monster` (51), `overworld`, `nether`, `the_end`, `caves`, `bee_habitat`, `spawns_cold_variant_farm_animals`, `spawns_warm_variant_farm_animals`, `spawn_endermen`, `spawn_ghast`, `has_structure_abandoned_camp`.

## Vanilla shapes worth copying

| Want | Vanilla file | Key parts |
|---|---|---|
| Grassland | `plains.biome.json` (1.26.0) | climate 0.8/0.4, overworld builder grass/dirt/stone, tags `animal monster overworld plains bee_habitat` |
| Coarse-dirt patches | `dappled_forest.biome.json` (1.26.50) | `surface_material_adjustments` with a block-state material |
| Badlands pillars | `mesa_bryce.biome.json` | mesa builder `bryce_pillars: true`, `map_tints` grass tint + foliage |
| Puddles | `swampland.biome.json` | swamp builder `max_puddle_depth_below_sea_level`, `map_tints` grass `{"type": "noise"}` |
| Cave biome with banded stone | `sulfur_caves.biome.json` (1.26.30) | `subsurface_builder` + `surface_builder` of type `noise_gradient` |
| Icy slopes | `frozen_peaks.biome.json` | `mountain_parameters.steep_material_adjustment`, four ice adjustments |
| Nether floor variation | `crimson_forest.biome.json` | overworld builder with lava sea, two adjustments |
| End | `the_end.biome.json` | `{"builder": {"type": "minecraft:the_end"}}` |

Working examples: `templates/skylands-dimension` (biome for a custom dimension) and `templates/overworld-biome` (replacement biome with features).
