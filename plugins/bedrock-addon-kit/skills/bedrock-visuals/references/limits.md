# Limits: what add-ons can and can't do with Vibrant Visuals

Checked 2026-10-06 against Microsoft Learn (`DifferencesBetweenBedrockAndJava.md`, `material-files.md`, `ExperimentalFeaturesToggle.md`, `EnablingDeferredTechnicalPreview.md`, `VibrantVisuals/*.md`, `TextureBudgets.md`, MCTools validation rules), and the changelogs 1.21.90 to 26.60.30.

## Can I write shaders?

**No.** Learn: "Java can create custom fonts and GLSL shaders, while Bedrock cannot." There is no way for an add-on or resource pack to ship shader code or a RenderDragon material for Vibrant Visuals. What you can change is data:

| You can | With |
|---|---|
| Surface look per pixel | texture sets (color, MER/MERS, normal, heightmap) |
| Sun, moon, ambient, sky light, by time of day and biome | `lighting/` |
| Sky colors and scattering | `atmospherics/` |
| Final image look | `color_grading/` (grading, temperature, one of six tone mappers) |
| Water | `water/` |
| Shadow style | `shadows/global.json` |
| Fog | `fogs/` volumetric settings |
| Colored block light | `local_lighting/` `static_light` |
| Runtime changes | `@minecraft/server-graphics` |

You can't: alter the filmic tone curves, write custom post effects, control reflections directly (only through roughness and metalness), reflect off-screen objects, give glass screen-space reflections, or make a first-person mirror. Legacy `.material` files still exist for entities and particles, but Learn warns custom materials "might be deprecated or removed", `vertexShader` and `geometryShader` keys are deprecated and ignored, and they are not a Vibrant Visuals feature. The 1.21.120 `material_instances` `emissive` field (Upcoming Creator Features) was renamed `shaded` and then removed in 1.21.130: per-face emissive comes from the texture set, not the block JSON.

## Stability

| Feature | Label | Source |
|---|---|---|
| Vibrant Visuals graphics mode | **Stable** | released 1.21.90; default on supported devices |
| `pbr` capability, texture sets, lighting, atmospherics, color grading, water, shadows, PBR fallback, per-biome identifiers | **Stable** | no experiment named in Learn's current pages or any changelog since 1.21.90; MCTools validates them for Marketplace; Vibrant Visuals Marketplace content since 1.21.120 |
| Cubemap settings | **Stable** | 1.21.130 |
| Lighting keyframes for ambient and sky, `biome_water_color_contribution` | **Stable** | 26.0 (format 1.26.0) |
| Atmospherics format 1.26.20 | **Stable** | 26.20 |
| Colored static block light (`static_light`) | **Stable** | 26.10: "no longer restricted to the Render Dragon Features for Creator Experiment"; "no longer restricted to Preview builds" |
| `@minecraft/server-graphics` 1.0.0 | **Stable** | 26.50 |
| Block Light Quality video setting | **Stable** | 26.50 moved it out of the experiment; "some options still require" it |
| Point lights (`light_type: point_light`), Point Light Quality slider | **Experimental**: RenderDragon Features for Creators | 1.21.120 onward; 26.40 "available only when the RenderDragon Features for Creators experiment toggle is enabled" |
| Colored block lights affecting volumetrics, GPU light storage | **Experimental**: RenderDragon Features for Creators | 26.20 "Under the RenderDragon Features for Creators Experiment" |
| Point light ranking, block light phase-out as point lights phase in | **Experimental** in 26.60 Preview | 26.60.28 |
| `@minecraft/server-graphics` 1.1.0-beta | **Beta API** (Beta APIs experiment) | 26.60 Preview; only peer dependency changes |
| New Vibrant Visuals JSON fields in 26.60 | none found | 26.60.21 to 26.60.30 changelogs list fixes and player settings only |

Old docs: `EnablingDeferredTechnicalPreview.md`, the Blockbench tutorial and `ExperimentalFeaturesToggle.md` ("Render Dragon Features for Creators: Enable the deferred rendering pipeline") date from the Deferred Technical Preview era (2025). They tell you to turn the experiment on for any PBR pack. In 26.52 that's only needed for point lights and the other rows marked Experimental. The experiment also auto-loads a built-in resource pack (1.21.120), which can change what you see while testing.

## Devices

| Device | Status | Source |
|---|---|---|
| Most modern Windows GPUs | supported; no ray tracing card needed | Learn (deferred preview page) |
| Xbox One, Xbox One S, PlayStation 4, some Android | must be selected by hand; "Performance may degrade" | 1.21.90 |
| Android | GLES 3.1 and Android 9 or newer was the 2025 requirement; supported device lists change per release (Adreno 700 series added 1.21.130; updated again 26.40) | Learn, changelogs |
| iOS, Nintendo Switch 2, PlayStation, Xbox | appear in Vibrant Visuals fixes and device-list updates (1.21.130 iOS and Android, 26.60.29 Switch 2); exact supported models unverified | changelogs |
| Point lights | disabled on Android, PS4 and Xbox One even with the experiment | 26.30 |
| Dedicated servers | can disallow Vibrant Visuals for connected players (1.21.90; property name unverified) | 1.21.90 |
| Education Edition features | no longer disable Vibrant Visuals (26.50) | 26.50 |

Vibrant Visuals runs locally and is cosmetic: players with it on and off can share a world or Realm.

## What falls back

| Situation | Result |
|---|---|
| Player uses Simple or Fancy | only `color` is drawn; all other layers and all Vibrant Visuals JSON are ignored |
| Ray tracing mode | texture sets on blocks only; MERS subsurface ignored; needs `raytraced` capability; `pbr`-only features aren't backwards-compatible with RTX |
| No texture set for an object | `pbr/global.json` value for its type, else the built-in default |
| Invalid texture set | `CONTENT_ERROR`, set unused, plain color texture |
| Heightmap on an item | invalid set |
| No client biome identifier | pack global file (reserved name) for custom biomes; vanilla per-biome files for vanilla biomes |
| `point_light` without the experiment | unverified whether it falls back to static light; ship `static_light` |
| Block in `local_lighting.json` without `light_color` | fallback light color |
| Block with no `local_lighting` entry | standard uniform light color |
| `point_lights/global.json` | not loaded since 26.10 |
| Biome settings that can't blend (tone mapping, orbital offset, caustics, waves on/off) | must match across files or you get a jump at the border |

## Marketplace

| Rule | Source |
|---|---|
| Submissions that use "Vibrant Visuals Enhanced" must meet **Tier 2** texture budgets (Add-On 225 MB, Resource Pack 450 MB, World 1 GB) | `TextureBudgets.md` |
| Budgets count all texels x 4 bytes, PBR maps included; subpacks with `memory_performance_tier` scale content | `TextureBudgets.md` |
| `pbr` packs need `min_engine_version` >= 1.21.120 (error); PBR files without the `pbr` capability (warning); any other capability, `raytraced` included, is an "Invalid Capability" error | MCTools CHKMANIF134, CHKMANIF135, CHKMANIF117 |
| Subpack tiering must be compatible with Vibrant Visuals (TEXTUREIMAGE410) | MCTools |
| Marketplace has Graphics filters for RTX and Vibrant Visuals (1.21.120); Vibrant Visuals content is hidden in the Marketplace Pass tab on unsupported devices (26.60 Preview, **Next stable**) | changelogs |
| Other Vibrant Visuals Marketplace art rules | unverified (not in the official sources checked) |

## Known gotchas

- Learn's mirror tutorial says to put the texture set in "your behavior pack"; it belongs in the resource pack.
- Learn's subsurface page spells the key `metalness_emissiveness_roughness_subsurface`; the real key (schema and vanilla) is `metalness_emissive_roughness_subsurface`.
- Learn's `point_lights/global.json` example has a doubled `minecraft:minecraft:` key; that file is no longer loaded anyway.
- Learn's `pbr/global.json` example is missing its last closing brace.
