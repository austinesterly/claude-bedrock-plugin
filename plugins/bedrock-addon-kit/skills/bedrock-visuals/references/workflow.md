# Workflow: making PBR textures and testing Vibrant Visuals

Checked 2026-10-06 against Microsoft Learn (`PBROverview.md`, `UseBlockbenchToCreateModelsWithTextures.md`, `BedrockEditor/EditorVibrantVisuals.md`, `IntroVibrantVisuals.md`, `TextureBudgets.md`, `ReflectionsCustomization.md`) and the changelogs 1.21.90 to 26.60.30. blockbench.net's wiki has no PBR or texture set page (checked the guide list on 2026-10-06), so the Blockbench steps come from the Microsoft Learn tutorial only.

## 1. Start from the color texture

1. Finish the normal 16x16 (or 32x32) color texture first. That's what players without Vibrant Visuals see.
2. Decide the material per pixel: which pixels are metal, which glow, how rough each area is, which let light through (leaves, wax, skin).
3. Make every layer the same size as the color image. Learn never states that sizes may differ; same size is the safe choice (unverified whether mismatched sizes load).

## 2a. In an image editor (any editor with layers)

Learn suggests Paint (Windows 11), Photoshop or PaintTool SAI.

| Map | How |
|---|---|
| MER | Paint three grayscale layers: metalness, emissive, roughness. Put metalness in the red channel, emissive in green, roughness in blue of one RGB image. Save as `<name>_mer.png` |
| MERS | Same plus subsurface in the alpha channel. Save as 32-bit RGBA PNG or TGA (`<name>_mers.png` / `.tga`). Watch that the editor doesn't drop or premultiply alpha |
| Normal | Learn advises against painting normal maps by hand; generate one with a normal map tool from a grayscale height image. Flat = (128, 128, 255) |
| Heightmap | Grayscale, 8-bit single channel. 127 = flat. Blocks only, not items |

Quick starting values (0 to 255):

| Material | Metalness | Emissive | Roughness | Subsurface |
|---|---|---|---|---|
| Stone, dirt, wood | 0 | 0 | 200 to 240 | 0 |
| Polished metal | 255 | 0 | 40 to 90 | 0 |
| Mirror | 255 | 0 | 0 | 0 |
| Glowing gem or lamp | 0 | 200 to 255 | 60 to 120 | 0 |
| Leaves | 0 | 0 | 200 | 80 to 160 |

Reflections: screen-space reflections only appear below roughness ~76 (0.3) and are gone at 102 (0.4).

## 2b. In Blockbench (from the Learn tutorial)

| Step | Where |
|---|---|
| Make a texture set | Textures panel, right-click the texture > **Create Material**. Creates `<texture>.texture_set.json` |
| Add MER | Right-click the texture set > **Generate PBR map** > **PBR Channel**: Metalness > Confirm. Creates the MER file |
| Add the other channels | Repeat for Emissive and Roughness. They are added as colored layers in the same MER texture |
| Paint a channel | Paint mode, Layers palette: hide the other layers, paint with a pure red (metalness), green (emissive) or blue (roughness) color |
| Preview | View (top right) > **Material Preview** |
| Save | Ctrl+S, save the new PNG as `<texture>_mer` |

Blockbench writes the texture set; check the result against `texture-sets.md` (format version, no `heightmap` with `normal`, bare names in the same folder). The tutorial also tells you to enable the RenderDragon Features for Creators experiment: that step is from 2025 and is not needed for texture sets in 26.52 (see `limits.md`).

## 2c. In the Bedrock Editor (lighting, sky, water)

Editor's **Vibrant Visuals** action bar pane edits lighting, atmospherics, color grading, tone mapping, water, shadows, cubemaps and local lights live, with time-of-day timelines and per-biome editing (26.0). **Generate Resource Pack** exports the edited settings to a resource pack (26.20 changelog; the Learn page calls it a mctools.dev template). **Export to Clipboard** copies one file's JSON. This is the fastest way to tune keyframes.

## 3. Wire it

1. Put `<name>.texture_set.json` next to the color image (`RP/textures/blocks/ns/glow_ore.*`).
2. Add `"capabilities": ["pbr"]` to the RP manifest; `min_engine_version` at least 1.21.120.
3. For a glowing block, add `minecraft:light_emission` in the BP and, for a colored light, a `local_lighting/local_lighting.json` entry (`static_light`).
4. For biome looks, point client biome identifiers at your lighting, atmospherics, color grading and water files.
5. Run `node <plugin>/scripts/check-pack.mjs packs` and `npx mct validate -i packs --single -o report`. Known validator noise in Creator Tools: terrain_texture "string vs array" warnings, `local_lighting/local_lighting.json` reported as an unknown JSON file, and keyframed `ambient` values (lighting format 1.26.0) flagged as "not a decimal number". All three are documented formats.

## 4. Test in game

1. Settings > Video > Graphics Mode > **Vibrant Visuals**. On Xbox One, PS4 and some Android devices it must be picked by hand, and may run slowly.
2. Turn the pack on in a world. Check the content log: an invalid texture set logs `CONTENT_ERROR` and the block falls back to the plain color texture.
3. `/time set noon`, `/time set 13000`, `/time set midnight` to check keyframes. Learn's key times: 0 noon, 0.25 sunset, 0.5 midnight, 0.75 sunrise.
4. Test emissive in a dark cave; test metal and roughness next to water or sky (reflections are screen-space, so the reflected thing must be on screen).
5. Compare with Vibrant Visuals off: the color texture alone must still look right.
6. For a biome, use a new world or unexplored chunks and `/locate biome ns:name`.

## Performance

| Cost | Advice |
|---|---|
| Point lights | "considerably more resource-intensive". Experimental anyway; prefer `static_light` + emissive texture |
| Light colors | Reuse a few `light_color` values across blocks |
| Tone mapping | Filmic (`hable`, `aces`, `generic`) costs more than Reinhard |
| Heightmap vs normal | Learn: heightmaps are less efficient than normal maps |
| Texture memory | MER/MERS/normal images count toward texture budgets (texels x 4 bytes). Use subpacks with `memory_performance_tier`, and fewer or smaller PBR maps on low tiers |
| Render distance | Vibrant Visuals has its own max render distance (28 on PC in 1.21.111, 48 on Windows in 26.50) |
