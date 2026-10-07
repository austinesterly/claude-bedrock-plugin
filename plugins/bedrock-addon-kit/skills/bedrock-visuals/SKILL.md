---
name: bedrock-visuals
description: Use when making a Minecraft Bedrock add-on or resource pack look good in Vibrant Visuals - PBR textures, texture sets (*.texture_set.json), MER/MERS maps, normal maps, heightmaps, emissive and glowing blocks, point lights and colored block light (local_lighting.json), sun and moon lighting, atmospherics and sky color, fog in Vibrant Visuals, color grading and tone mapping, water, shadows, cubemaps, per-biome visuals, @minecraft/server-graphics, devices and fallbacks, and questions like "can I write shaders".
---

# Vibrant Visuals, PBR textures and lighting

Checked 2026-10-06 against the Microsoft Learn creator docs (VibrantVisuals pages, texture set and deferred rendering references, client biome references, MCTools rules), Mojang bedrock-samples 1.26.50.4 (3,130 vanilla texture sets, `lighting/`, `atmospherics/`, `color_grading/`, `water/`, `fogs/`, `biomes/`), npm `@minecraft/server-graphics` 1.0.0, and the changelogs 1.21.70 to Preview 26.60.30. Target: stable game 26.52, no experiments.

Labels: **Stable** = 26.52 with no experiment. **Next stable** = in 26.60 Preview. **Experimental** = needs the named world toggle.

## Decide first

| You want | Use | Label | Reference |
|---|---|---|---|
| A block, item, mob or particle that looks metallic, rough, smooth or bumpy | texture set next to its texture: `color` + `metalness_emissive_roughness` (+ `normal`) | **Stable** | `references/texture-sets.md` |
| Leaves, wax, skin that glow through | MERS (`metalness_emissive_roughness_subsurface`, format 1.21.30) | **Stable** | `texture-sets.md` |
| Pixels that glow | emissive (MER green channel) | **Stable** | `texture-sets.md` |
| A block that actually lights its surroundings | BP `minecraft:light_emission` + emissive texture | **Stable** | `bedrock-blocks` |
| Colored block light | `local_lighting/local_lighting.json`, `"light_type": "static_light"` | **Stable** (26.10) | `references/lighting-and-atmosphere.md` |
| Real point lights with shadows | `"light_type": "point_light"` | **Experimental**: RenderDragon Features for Creators | `lighting-and-atmosphere.md` |
| Sun, moon, ambient light by time of day | `lighting/*.json` with keyframes | **Stable** | `lighting-and-atmosphere.md` |
| Sky colors, sunsets | `atmospherics/*.json` | **Stable** | `lighting-and-atmosphere.md` |
| Overall mood, saturation, warmth | `color_grading/*.json` (temperature needs format 1.21.90) | **Stable** | `lighting-and-atmosphere.md` |
| Water color, waves, caustics | `water/*.json` | **Stable** | `lighting-and-atmosphere.md` |
| Blocky or soft shadows | `shadows/global.json` | **Stable** | `lighting-and-atmosphere.md` |
| Volumetric fog, light shafts | `fogs/*.json` `volumetric` (+ `henyey_greenstein_g`, format 1.21.90) | **Stable** | `lighting-and-atmosphere.md` |
| Skybox lighting | `cubemaps/*.json` (Overworld only, 1.21.130) | **Stable** | `lighting-and-atmosphere.md` |
| Different look per biome, custom biome or dimension | client biome `minecraft:*_identifier` components | **Stable** | `lighting-and-atmosphere.md`, `bedrock-dimensions-biomes` |
| Change lighting, sky, grading or water from script, per player | `@minecraft/server-graphics` 1.0.0 | **Stable** (26.50) | `lighting-and-atmosphere.md` |
| Custom shaders or RenderDragon materials | not possible | | `references/limits.md` |

## Rules

1. **Declare `"capabilities": ["pbr"]`** in the RP manifest with `min_engine_version` 1.21.120 or higher. Without it MCTools warns (CHKMANIF135) and the PBR assets aren't treated as Vibrant Visuals content. Don't add `raytraced` to Marketplace packs (CHKMANIF117 error).
2. **Texture sets live next to the color image and name layers without paths**: `textures/blocks/ns/glow_ore.texture_set.json` with `"color": "glow_ore"`. Layers must be in the same pack. `color` is required.
3. **Use texture set `format_version` `1.21.30`** (every vanilla set does). Never MER and MERS together, never `normal` and `heightmap` together, no heightmap on items. Any of these makes the whole set invalid (`CONTENT_ERROR`).
4. **Emissive is visual only.** Light that spreads comes from `minecraft:light_emission` (0 to 15) on the block. Its color comes from `local_lighting.json`.
5. **Ship `static_light`, not `point_light`.** Point lights need the RenderDragon Features for Creators experiment and are off on Android, PS4 and Xbox One.
6. **Restyle biomes through client biome files.** Since 1.21.90 vanilla per-biome settings beat your `lighting/global.json` and the other reserved global files. Point each biome at your identifiers.
7. **Namespace every identifier and file name** (`ns:glimmer_lighting` in `lighting/ns_glimmer_lighting.json`). Identifiers must be unique across files.
8. **Keep non-blendable settings identical in every file of a pack:** tone mapping operator, `orbital_offset_degrees`, caustics, `waves.enabled`. Vanilla uses `generic`, 0.0, caustics on, waves off.
9. **Lighting format matters:** current files (vanilla 1.21.80, Learn 1.26.0) wrap sun and moon in `directional_lights.orbital`; 1.26.0 adds keyframes for `ambient` and `sky`. Older vanilla files (1.21.70) put `sun` directly under `directional_lights`.
10. **Design for both modes.** The color texture alone must look right: Simple and Fancy ignore every PBR layer and every Vibrant Visuals file.

## Workflow

1. Finish the color texture. Paint MER (and normal) at the same size: Blockbench Create Material > Generate PBR map, or channel-pack layers in an image editor. See `references/workflow.md`.
2. Add the texture set, the `pbr` capability, and for glowing blocks `light_emission` + a `static_light` entry.
3. For a biome look, copy `templates/vv_biome_visuals`, then tune live in the Bedrock Editor's Vibrant Visuals pane and export.
4. Check: `node <plugin>/scripts/check-pack.mjs packs`, then `npx mct validate -i packs --single -o report`. Expected noise: terrain_texture string-vs-array, `local_lighting.json` "unknown JSON", keyframed `ambient` "not a decimal number".
5. Test: Settings > Video > Graphics Mode > Vibrant Visuals; content log; `/time set` noon, sunset, midnight; dark cave for emissive; water or sky nearby for reflections; then Vibrant Visuals off.

## Templates (RP only; the generator renames `ns`)

| Template | What | Pairs with |
|---|---|---|
| `templates/pbr_glow_ore` | `ns:glow_ore` texture set (color + MER + normal, 16x16), terrain texture, teal `static_light`, `pbr` capability fragment | `bedrock-blocks/templates/simple_cube` (copy it to `glow_ore`, see README) |
| `templates/vv_biome_visuals` | lighting, atmospherics, color grading, water, volumetric fog, client biome wiring, blocky shadows, PBR fallback | `bedrock-dimensions-biomes/templates/overworld-biome` (`ns:glimmer_meadow`) |

Add with `node <plugin>/scripts/new-addon.mjs <dir> --name "X" --ns myns --add <template>`. Each template's `RP/manifest.json` is a fragment holding only `capabilities`, which the generator merges.

## Links

- `references/texture-sets.md`: format versions, fields, channel values, where sets work, invalid sets
- `references/lighting-and-atmosphere.md`: every Vibrant Visuals JSON file, keyframes, local lights, fog, biome wiring, server-graphics API
- `references/workflow.md`: making maps in Blockbench or an editor, Editor pane, testing, performance
- `references/limits.md`: no shaders, stability table, devices, fallbacks, Marketplace rules, doc errata
- Learn: https://learn.microsoft.com/minecraft/creator/documents/vibrantvisuals/introvibrantvisuals
- Learn texture sets: https://learn.microsoft.com/minecraft/creator/reference/content/texturesetsreference/texturesetsconcepts/texturesetsintroduction
- Related skills: `bedrock-blocks` (light_emission, material_instances), `bedrock-dimensions-biomes` (custom biomes and dimensions), `bedrock-blockbench`, `bedrock-scripting`
