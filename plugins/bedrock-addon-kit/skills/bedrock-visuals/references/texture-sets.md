# Texture sets (`*.texture_set.json`)

Checked 2026-10-06 against Microsoft Learn (`TextureSetsIntroduction.md`, `PBROverview.md`, `VVResourcePacks.md`, `SubSurfaceScatteringCustomization.md`, `VisualReference/texture_set.v1.21.30.md`), the 3,130 texture sets in vanilla bedrock-samples 1.26.50.4, and the official changelogs 1.21.70 to 26.60.30.

Everything on this page is **Stable** in game 26.52 with no experiment, unless a row says otherwise.

## What a texture set is

A JSON file next to a texture that adds PBR layers to it. The classic renderer (Simple, Fancy) reads only the color image and ignores the set. Vibrant Visuals reads all layers. Ray tracing reads color, MER, normal and heightmap, and ignores subsurface.

The pack must declare `"capabilities": ["pbr"]` in its RP manifest with `min_engine_version` 1.21.120 or higher (MCTools rules CHKMANIF134 error and CHKMANIF135 warning). `"raytraced"` also turns Vibrant Visuals on, but Learn recommends `"pbr"`. Learn notes the new capabilities are not backwards-compatible with the RTX pipeline.

## File naming and location

| Rule | Detail |
|---|---|
| File name | `<texture name>.texture_set.json`, in the same folder as the color image. Vanilla: `textures/blocks/glowstone.png` + `textures/blocks/glowstone.texture_set.json` |
| Layer values | Bare texture names in the **same folder** (`"glow_ore_mer"`), no path, no extension |
| Same pack only | A set can only reference images in its own resource pack. A higher pack's image does not replace the set's reference |
| No merging | Two packs defining a set for the same texture don't merge: the higher-priority pack's set wins |
| Extension priority | `.tga` > `.png` > `.jpg` > `.jpeg` when two files share a name |
| Vanilla suffixes | `_mers` (vanilla uses MERS everywhere, mostly `.tga`), `_normal`. Learn examples use `_mer` and `_heightmap`. Suffixes are convention, the JSON value is what counts |

## Format versions

| `format_version` | What it adds | Source |
|---|---|---|
| `1.16.100` | `color`, `metalness_emissive_roughness`, `normal`, `heightmap` | Learn examples (`PBROverview.md`, `TextureSetsIntroduction.md`) |
| `1.21.30` | adds `metalness_emissive_roughness_subsurface` (MERS) | Learn schema "Texture set JSON schema version 1.21.30"; every vanilla 1.26.50.4 set uses 1.21.30 |

Use `1.21.30` for new sets. Whether MERS is rejected under `1.16.100` is unverified; the only MERS example uses 1.21.30.

## Fields

| Field | Image form | Uniform form | Notes |
|---|---|---|---|
| `color` | RGB (alpha defaults to 1.0) or RGBA image | 4 values `[r, g, b, a]` 0 to 255, or ARGB hex | **Required.** Lighting is usually baked into it |
| `metalness_emissive_roughness` (MER) | RGB (4th channel ignored) | 3 values or hex `"#RRGGBB"` | R = metalness, G = emissive, B = roughness |
| `metalness_emissive_roughness_subsurface` (MERS) | RGBA, 4 channels required | 4 values, or 8-digit ARGB hex (which hex digit pair maps to subsurface is unverified; use arrays) | A = subsurface. Vibrant Visuals only. Not with MER in the same set |
| `normal` | RGB (4th ignored) | none | Flat = (128, 128, 255). Not with `heightmap` |
| `heightmap` | 1-channel (grayscale) image | 1 value or 2 hex digits | Not with `normal`. Not allowed on texture-based objects such as items |

Uniform values: integers 0 to 255 per channel, or hex (RGB/ARGB, or 2 digits for one channel). Image and uniform layers can be mixed in one set.

```json
{
  "format_version": "1.21.30",
  "minecraft:texture_set": {
    "color": "glow_ore",
    "metalness_emissive_roughness": "glow_ore_mer",
    "normal": "glow_ore_normal"
  }
}
```

Uniform example from vanilla (`textures/particle/flame_atlas.texture_set.json`): `"metalness_emissive_roughness_subsurface": [0, 255, 255, 0]`.

## Channel values

| Channel | 0 (black) | 255 (white) | Tips |
|---|---|---|---|
| Metalness | non-metal (dirt, bark) | full metal (iron, gold, copper) | Treat as on/off; partial metal is allowed but not physically accurate |
| Emissive | no glow | brightest glow | Glows visually only. Real block light comes from `minecraft:light_emission` |
| Roughness | mirror smooth | fully rough (brick, stone) | Screen-space reflections fade above 0.3 (~76) and stop at 0.4 (102) |
| Subsurface | none | most light passes through (about 1 block deep) | Leaves, wax, skin. Only for non-metals |
| Height | pushed in | pushed out | 0.5 (127) = flat |

Metalness vs subsurface: per pixel, the larger of the two wins and the other becomes 0. A tie goes to subsurface. `[64, 0, 0, 128]` is a non-metal with subsurface 128; `[255, 0, 0, 64]` is a metal with no subsurface.

Mirror recipe from Learn: MER with metalness 255 and roughness 0.

## Where texture sets work

| Object | Put the set next to | Since / source |
|---|---|---|
| Blocks | the texture a `terrain_texture.json` entry points to (`textures/blocks/...`) | Ray tracing era; Vibrant Visuals |
| Items | the `item_texture.json` texture (`textures/items/...`). Use `normal`, never `heightmap` | Vibrant Visuals (Learn `VVResourcePacks.md`) |
| Entities / mobs | the client entity `textures` path (`textures/entity/...`). Vanilla: `textures/entity/pig/pig.texture_set.json` | Vibrant Visuals |
| Attachables | the attachable `textures` path. Vanilla bow attachable uses `textures/items/bow_standby`, which has `bow_standby.texture_set.json` | vanilla 1.26.50.4 |
| Armor models | `textures/models/armor/...` (vanilla has sets there) | vanilla 1.26.50.4 |
| Particles | the particle texture (`textures/particle/...`). Particles glow in Vibrant Visuals through MERS emissive values (1.21.120 changelog) | Vibrant Visuals |

Ray tracing only supports texture sets on blocks. Vibrant Visuals supports all of the above.

Custom blocks rendered as items (held, dropped, item frames) show their MER/emissive in Vibrant Visuals since 26.40 (MCPE-237517 fix). Heightmaps on actors corrupted visuals until a 26.30/26.40 fix; prefer normals for entities.

## Invalid sets

An invalid set logs `CONTENT_ERROR` and is not used at all. It's invalid when:

- the JSON doesn't parse or doesn't match the schema
- `color` is missing
- both `heightmap` and `normal` are set, or both MER and MERS
- a heightmap is applied to a texture-based object (items)
- a referenced image is missing from the same pack or can't be parsed
- a layer has the wrong channel count (images: color, MER, normal 3 or 4; MERS 4; heightmap 1. Uniform: color 4, MER 3, MERS 4)

Texture variations (a `terrain_texture.json` `variations` array) don't support MERS **uniform** values: give an image-based MERS.

## Fallback when there's no set

`pbr/global.json` (`minecraft:pbr_fallback_settings`) sets one MERS value for all blocks, actors, particles and items without a set. See `lighting-and-atmosphere.md`.
