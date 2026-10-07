# pbr_glow_ore template

Resource pack side of a glowing ore block `ns:glow_ore` with a full PBR texture set (color + MER + normal) and a colored static block light for Vibrant Visuals. All **Stable** in game 26.52 with no experiment.

| File | What it does |
|---|---|
| `RP/textures/blocks/ns/glow_ore.png` | 16x16 color (albedo) image. The only layer the classic renderer uses |
| `RP/textures/blocks/ns/glow_ore_mer.png` | 16x16 MER: red = metalness 0, green = emissive (255 on the ore specks), blue = roughness (225 stone, 70 ore) |
| `RP/textures/blocks/ns/glow_ore_normal.png` | 16x16 normal map. Flat is (128, 128, 255); the specks are raised |
| `RP/textures/blocks/ns/glow_ore.texture_set.json` | Texture set (format 1.21.30) that ties the three layers to the `glow_ore` texture |
| `RP/textures/terrain_texture.json` | `ns_glow_ore` → `textures/blocks/ns/glow_ore` (merged by the generator) |
| `RP/local_lighting/local_lighting.json` | Gives `ns:glow_ore` a teal `static_light` color in Vibrant Visuals (stable since 26.10) |
| `RP/blocks.json`, `RP/texts/en_US.lang` | Sound and display name for `ns:glow_ore` |
| `RP/manifest.json` | Fragment only: the generator merges `"capabilities": ["pbr"]` into the generated RP manifest. Not a full manifest |

## Pairs with

The `simple_cube` template in the `bedrock-blocks` skill. This template has no BP. Make the block:

1. Add both templates: `node <plugin>/scripts/new-addon.mjs <dir> --name "My Add-on" --ns myns --add <plugin>/skills/bedrock-blocks/templates/simple_cube --add <plugin>/skills/bedrock-visuals/templates/pbr_glow_ore`
2. Copy `BP/blocks/simple_cube.json` to `BP/blocks/glow_ore.json` and change three things:
   - `"identifier": "myns:glow_ore"`
   - `"texture": "myns_glow_ore"` in `minecraft:material_instances`
   - add `"minecraft:light_emission": 7` to `components` (needed for the colored light; emissive pixels alone light nothing)
3. Check the RP manifest has `"capabilities": ["pbr"]` and `min_engine_version` 1.21.120 or higher (the generator default is 1.26.50).
4. In game: Settings > Video > Graphics Mode > Vibrant Visuals, then place the block in a dark cave. The specks glow (emissive), the stone is matte, and nearby blocks get a teal tint (static light).

## Variations

- **Subsurface (MERS):** replace the MER image with a 4-channel RGBA `glow_ore_mers.png` (alpha = subsurface) and rename the key to `metalness_emissive_roughness_subsurface`. Don't define both keys.
- **Uniform values:** `"metalness_emissive_roughness": [0, 0, 230]` instead of an image when the whole texture is one material.
- **Point light instead of static light:** `"light_type": "point_light"` needs the **RenderDragon Features for Creators** experiment and supported hardware. Keep `static_light` for anything you ship.
- **Heightmap instead of normal:** a 1-channel grayscale image under `heightmap`. Never with `normal` in the same set.
