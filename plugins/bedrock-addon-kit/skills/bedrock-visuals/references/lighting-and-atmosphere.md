# Vibrant Visuals JSON files: lighting, sky, color, water, shadows, fog

Checked 2026-10-06 against Microsoft Learn (`VibrantVisuals/*.md`, `Reference/Content/DeferredRendering/*`, `ClientBiomesReference`, `FogInResourcePacks.md`, `@minecraft/server-graphics` docs), vanilla bedrock-samples 1.26.50.4 (`lighting/`, `atmospherics/`, `color_grading/`, `water/`, `fogs/`, `biomes/`), npm `@minecraft/server-graphics` 1.0.0 typings, and the changelogs 1.21.90 to 26.60.30.

All files go in the **resource pack** and need `"capabilities": ["pbr"]` in its manifest. Stable means game 26.52 with no experiment.

## The files

| File | Root key | Latest format seen | Label | What it controls |
|---|---|---|---|---|
| `lighting/<name>.json` | `minecraft:lighting_settings` | `1.26.0` | **Stable** | sun, moon, End flash, emissive desaturation, ambient, sky light |
| `atmospherics/<name>.json` | `minecraft:atmosphere_settings` | `1.26.20` | **Stable** | sky colors, Rayleigh and Mie scattering |
| `color_grading/<name>.json` | `minecraft:color_grading_settings` | `1.21.90` | **Stable** | color grading, temperature, tone mapping |
| `water/<name>.json` | `minecraft:water_settings` | `1.26.0` | **Stable** | water color, waves, caustics |
| `cubemaps/<name>.json` | `minecraft:cubemap_settings` | `1.21.130` | **Stable** | how the Overworld skybox is lit |
| `shadows/global.json` | `minecraft:shadow_settings` | `1.21.80` | **Stable** | blocky or soft shadows |
| `pbr/global.json` | `minecraft:pbr_fallback_settings` | `1.21.40` | **Stable** | default MERS for things without a texture set |
| `local_lighting/local_lighting.json` | `minecraft:local_light_settings` | `1.21.120` | `static_light` **Stable** (26.10); `point_light` **Experimental** | per-block light color and type |
| `point_lights/global.json` | `minecraft:point_light_settings` | `1.21.40` | **Removed** | old light colors. No longer loaded since 26.10 |
| `fogs/<name>.json` | `minecraft:fog_settings` | `1.21.90` | **Stable** | distance and volumetric fog (shared with classic) |

Reserved global names: `lighting/global.json`, `atmospherics/atmospherics.json`, `color_grading/color_grading.json`, `water/water.json`. Their identifiers become the default for biomes that don't set one. A cubemap with identifier `minecraft:default_cubemap` is the default cubemap (1.21.130 changelog).

**Important since 1.21.90:** vanilla ships per-biome files, and they take precedence over a pack's global files. A `lighting/global.json` alone no longer changes vanilla biomes. To restyle a vanilla biome, ship a client biome file for it that points at your identifiers. Global files still apply to custom biomes without their own settings.

Every file except shadows, pbr and local_lighting has `description.identifier`, which must have a namespace (`ns:glimmer_lighting`). File names and identifiers must both be unique.

## Keyframes

Any field marked keyframeable takes either a value or an object of time keys `"0.0"` to `"1.0"` (0 = noon, 0.25 = sunset, 0.5 = midnight, 0.75 = sunrise, 1.0 = next noon). Linear interpolation only. Floats and colors (RGB array or hex) can be keyframed. Vanilla writes keys like `"0.282000"`, not in order.

```json
"illuminance": { "0.0": 100.0, "0.25": 1.0, "0.5": 0.0, "0.75": 1.0, "1.0": 100.0 }
```

## Lighting (`minecraft:lighting_settings`)

| Version | Change |
|---|---|
| 1.21.40 | first schema; `directional_lights.sun` / `moon` directly under `directional_lights` (vanilla 1.21.70 files still use this) |
| 1.21.60 | sun and moon colors RGB instead of RGBA |
| 1.21.70 | `sky.intensity` |
| 1.21.80 | `directional_lights.flash` for the End (Learn). `directional_lights.orbital` wrapping sun, moon and `orbital_offset_degrees` first appears in vanilla 1.21.80 files; Learn's table doesn't date it |
| 1.26.0 | keyframes for `ambient.color`, `ambient.illuminance`, `sky.intensity` |

| Field | Type | Range / default | Keyframe |
|---|---|---|---|
| `directional_lights.orbital.sun.illuminance` | float, lux | up to 110000 | yes |
| `directional_lights.orbital.sun.color` | RGB array or hex | | yes |
| `directional_lights.orbital.moon.illuminance` / `.color` | same | | yes |
| `directional_lights.orbital.orbital_offset_degrees` | float, degrees | up to 359.99 | yes; can't blend between biomes |
| `directional_lights.flash.illuminance` / `.color` | End flash peak lux / color | | no |
| `emissive.desaturation` | float | 0.0 to 1.0 | no |
| `ambient.illuminance` | float, lux | 0.0 to 5.0, default 0.02 | yes (1.26.0) |
| `ambient.color` | RGB or hex | default `#FFFFFF` | yes (1.26.0) |
| `sky.intensity` | float | 0.1 to 1.0, default 1.0 | yes (1.26.0) |

Brightness scale: Learn's examples use real-world lux (about 100000 for noon sun, 0.27 for the moon). Vanilla 1.26.50.4 `lighting/global.json` uses 100 for the noon sun and 0.4 for the moon. Tone mapping and auto-exposure rebalance either; start from the vanilla values so your biome blends with vanilla neighbours.

## Atmospherics (`minecraft:atmosphere_settings`)

Format 1.26.20 (26.20 changelog) makes `minecraft:atmosphere_settings` and its `description` required. Vanilla still uses 1.21.40. All fields keyframeable.

| Field | Max (Learn reference) |
|---|---|
| `horizon_blend_stops.min`, `.start`, `.max` | 1.0 |
| `horizon_blend_stops.mie_start` | 1.2 |
| `rayleigh_strength` | 11 |
| `sun_mie_strength` | 60 |
| `moon_mie_strength` | 20 |
| `sun_glare_shape` | 50 |
| `sky_zenith_color`, `sky_horizon_color` | RGB array or hex |

Sun and moon colors from the lighting file also tint the sky through scattering.

## Color grading and tone mapping (`minecraft:color_grading_settings`)

| Path | Fields | Ranges (tutorial schema) |
|---|---|---|
| `color_grading.midtones` | `contrast`, `gain`, `gamma`, `offset`, `saturation` (each `[r, g, b]`) | contrast 0 to 4, gain 0 to 10, gamma 0 to 4, offset -1 to 1, saturation 0 to 10 |
| `color_grading.highlights` | `enabled`, `highlightsMin` + the five above | highlightsMin 1.0 to 4.0 (the generated reference allows up to 20) |
| `color_grading.shadows` | `enabled`, `shadowsMax` + the five above | shadowsMax 0.1 to 1.0 |
| `color_grading.temperature` (format 1.21.90) | `enabled`, `temperature` (Kelvin), `type` | 1000 to 15000, default 6500; `type` `white_balance` (default) or `color_temperature` |
| `tone_mapping.operator` | | `reinhard`, `reinhard_luma`, `reinhard_luminance`, `hable`, `aces`, `generic` |

Highlights and shadows only apply with `"enabled": true` plus at least one grading value. Neutral values: contrast, gain, saturation 1.0; offset 0.0; gamma 2.2. The tone mapping operator can't blend between biomes: use one operator in every file of a pack (vanilla uses `generic`). Filmic operators (`hable`, `aces`, `generic`) cost more than Reinhard.

## Water (`minecraft:water_settings`)

| Path | Field | Range |
|---|---|---|
| `particle_concentrations` | `cdom` (yellow-brown) | 0 to 15 mg/L |
| | `chlorophyll` (green) | 0 to 10 |
| | `suspended_sediment` (red-brown) | 0 to 300 |
| `waves` | `enabled` | can't blend: same in every file |
| | `depth` 0 to 3, `direction_increment` 0 to 360, `frequency` 0.01 to 3, `frequency_scaling` 0 to 2, `mix` 0 to 1, `octaves` 1 to 30 (int), `pull` -1 to 1, `sampleWidth` 0.01 to 1, `shape` 1 to 10, `speed` 0.01 to 10, `speed_scaling` 0 to 2 | |
| `caustics` | `enabled`, `frame_length` 0.01 to 5, `power` 1 to 6 (int), `scale` 0.1 to 5, `texture` | can't blend: same in every file |
| root | `biome_water_color_contribution` (format 1.26.0) | 0 to 1, default 0: how much the client biome `water_appearance.surface_color` tints the water |

Caustics `texture`: a vertical strip of square frames (frames = height / width), under `textures/` and listed in `textures/textures_list.json`. Waves are image-based; the water surface geometry doesn't move. Vanilla has waves off.

## Cubemaps (`minecraft:cubemap_settings`, 1.21.130)

Overworld only; the End keeps its built-in cubemap. Everything sits under `lighting`:

| Field | Range / default |
|---|---|
| `ambient_light_illuminance` (keyframeable) | 0 to 100000 lux, default 5.625 |
| `sky_light_contribution` | 0 to 1, default 1.0 |
| `directional_light_contribution` | 0 to 1, default 0.0 |
| `affected_by_atmospheric_scattering` | bool, default false |
| `affected_by_volumetric_scattering` | bool, default true |

## Shadows (`minecraft:shadow_settings`)

| Field | Values |
|---|---|
| `shadow_style` | `"soft_shadows"` (default) or `"blocky_shadows"` |
| `texel_size` | integer 1 to 1024, default 16. Only matters for blocky shadows; match your block texture resolution |

## PBR fallback (`minecraft:pbr_fallback_settings`)

`blocks`, `actors`, `particles`, `items`, each with `global_metalness_emissive_roughness_subsurface` (RGBA array 0 to 255 or hex). The generated reference also lists an older `global_metalness_emissive_roughness`. Example: `[0, 0, 255, 0]` = rough, non-metal.

## Block light colors (`minecraft:local_light_settings`)

```json
{
  "format_version": "1.21.120",
  "minecraft:local_light_settings": {
    "ns:glow_ore": { "light_color": "#3FE6D8", "light_type": "static_light" }
  }
}
```

| Field | Values |
|---|---|
| key | block identifier, vanilla or custom (`minecraft:torch`, `ns:glow_ore`) |
| `light_color` | optional; RGB array or hex, sRGB space (26.0). Missing = fallback color |
| `light_type` | `"static_light"` or `"point_light"` |

| Light type | Label | Behaviour |
|---|---|---|
| `static_light` | **Stable** since 26.10 ("colored block lighting feature is no longer restricted to the Render Dragon Features for Creator Experiment") | Baked block light in that color. Follows `minecraft:light_emission` and `minecraft:light_dampening`. Additive: different overlapping colors get brighter. Not filtered by stained glass. Blocks without an entry use the standard light color |
| `point_light` | **Experimental**: RenderDragon Features for Creators (26.0, 26.20, 26.40, 26.60.28 notes) | Real light from the block center with specular highlights and shadows. Expensive; the game limits how many are active and fades them by importance. Disabled on Android, PS4 and Xbox One (26.30) |

The block still needs `minecraft:light_emission` (0 to 15) in the BP for any light to spread; an emissive texture alone lights nothing. Vanilla point-light blocks (torch `#EFE39D`, redstone torch `#FF0000`, lantern `#CE8133`, soul torch and soul lantern `#00FFFF`, end rod, sea pickle `#FFFFFF`, candles, copper torch and lantern `#B8EF8D`) stay point lights; you can only change their color. Reuse a few colors across blocks for performance. 26.60 Preview point light changes (ranking, phasing out block light as point lights phase in) are all still under the experiment.

## Fog with Vibrant Visuals

No new file: Vibrant Visuals reads the `volumetric` object of normal fog files (`fogs/*.json`, linked from a client biome's `minecraft:fog_appearance.fog_identifier`).

| Path | Fields |
|---|---|
| `volumetric.density.<air, weather, water, lava, lava_resistance>` | `max_density` (0 to 1), `uniform`, `zero_density_height`, `max_density_height` |
| `volumetric.media_coefficients.<air, water, cloud>` | `scattering`, `absorption` (3 floats 0 to 1 or hex) |
| `volumetric.henyey_greenstein_g.<air, water>` (format 1.21.90, Vibrant Visuals only) | `henyey_greenstein_g` -1 to 1; default air 0.75, water 0.6 |

Vibrant Visuals uses only the luminance of `absorption` (0.2126 R + 0.7152 G + 0.0722 B), not its tint. Learn's general fog page still says volumetric fog is "only used for Ray Tracing"; the Vibrant Visuals page and the 49 vanilla 1.26.50.4 fog files with `volumetric` and `henyey_greenstein_g` show otherwise. The `/fog` command stack applies as usual.

## Per-biome wiring (client biome)

In `RP/biomes/<name>.client_biome.json` (vanilla uses format 1.21.120):

| Component | Field | Points at |
|---|---|---|
| `minecraft:lighting_identifier` | `lighting_identifier` | `lighting/` |
| `minecraft:atmosphere_identifier` | `atmosphere_identifier` | `atmospherics/` |
| `minecraft:color_grading_identifier` | `color_grading_identifier` | `color_grading/` |
| `minecraft:water_identifier` | `water_identifier` | `water/` |
| `minecraft:cubemap_identifier` (format 1.21.130+) | `cubemap_identifier` | `cubemaps/` |
| `minecraft:fog_appearance` | `fog_identifier` | `fogs/` |

Blending: lighting, atmospherics, color grading and cubemaps blend by camera position (vertically too since 1.21.120). Water blends per water block, so distant water shows its own biome's look. Can't blend: tone mapping operator, `orbital_offset_degrees`, caustics, `waves.enabled`.

Custom biomes and dimensions: see the `bedrock-dimensions-biomes` skill for the BP biome and dimension. Any biome with a client biome file can use these identifiers.

## Script control (`@minecraft/server-graphics`)

**Stable** 1.0.0 since 26.50 (peer `@minecraft/server` ^2.3.0). Add the module to the BP manifest dependencies.

| Function | Returns | Controls |
|---|---|---|
| `getBiomeLighting(biome)` / `getPlayerLighting(biome, player)` | `BiomeLighting` | `setSunIlluminance`, `setSunColor`, `setMoonIlluminance`, `setMoonColor`, `setOrbitalOffsetDegrees`, `setFlashColor`, `setFlashIlluminance`, `setAmbientColor`, `setAmbientIlluminance`, `setEmissiveDesaturation`, `setSkyIntensity` + `reset*` |
| `getBiomeAtmospherics` / `getPlayerAtmospherics` | `BiomeAtmospherics` | horizon blend stops, Rayleigh, Mie, glare, zenith and horizon colors |
| `getBiomeColorGrading` / `getPlayerColorGrading` | `BiomeColorGrading` | midtones, highlights, shadows, temperature |
| `getBiomeWater` / `getPlayerWater` | `BiomeWater` | CDOM, chlorophyll, sediment, wave parameters |

`biome` is a `BiomeType` from `@minecraft/server`. Setters accept a value or a keyframe record (`Record<number, number>`). Not callable in restricted (before-event) execution. `1.1.0-beta` (26.60 Preview) only changes peer dependencies.

Detect the mode: `player.graphicsMode` (`GraphicsMode.Deferred` = Vibrant Visuals) in scripts, or Molang `query.graphics_mode_is_any('deferred')` in resource packs (format 1.21.80+; values `simple`, `fancy`, `deferred`, `raytraced`).
