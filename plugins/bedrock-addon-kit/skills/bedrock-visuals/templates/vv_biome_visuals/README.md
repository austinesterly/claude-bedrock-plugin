# vv_biome_visuals template

A Vibrant Visuals look for one custom biome: its own sun and moon, sky colors, color grading, water and volumetric fog, plus pack-wide blocky shadows and PBR fallbacks. All **Stable** in game 26.52 with no experiment.

| File | Identifier | What it does |
|---|---|---|
| `RP/lighting/ns_glimmer_lighting.json` | `ns:glimmer_lighting` | Sun, moon, End flash, emissive desaturation, ambient (keyframed, format 1.26.0), sky intensity |
| `RP/atmospherics/ns_glimmer_atmospherics.json` | `ns:glimmer_atmospherics` | Sky zenith and horizon colors, Rayleigh and Mie scattering by time of day |
| `RP/color_grading/ns_glimmer_color_grading.json` | `ns:glimmer_color_grading` | Midtones, highlights, temperature (format 1.21.90), tone mapping `generic` |
| `RP/water/ns_glimmer_water.json` | `ns:glimmer_water` | Greener water, vanilla caustics, `biome_water_color_contribution` (format 1.26.0) |
| `RP/fogs/ns_glimmer_fog.json` | `ns:glimmer_fog` | Distance fog plus volumetric fog with `henyey_greenstein_g` (format 1.21.90) |
| `RP/biomes/glimmer_meadow.client_biome.json` | `ns:glimmer_meadow` | Points the biome at all of the above |
| `RP/shadows/global.json` | none (pack-wide) | Blocky shadows snapped to 16 texels |
| `RP/pbr/global.json` | none (pack-wide) | MERS used for blocks, actors, particles and items that have no texture set |
| `RP/manifest.json` | | Fragment only: the generator merges `"capabilities": ["pbr"]` into the generated RP manifest |

## Pairs with

The `overworld-biome` template in the `bedrock-dimensions-biomes` skill, which defines the biome `ns:glimmer_meadow`. Add it **first**, then this one, so this client biome file replaces that template's copy (same colors and sky, plus the Vibrant Visuals identifiers). The generator prints a "template file replaced an existing file" warning for it; that is expected.

```
node <plugin>/scripts/new-addon.mjs <dir> --name "My Add-on" --ns myns --starter none \
  --add <plugin>/skills/bedrock-dimensions-biomes/templates/overworld-biome \
  --add <plugin>/skills/bedrock-visuals/templates/vv_biome_visuals
```

For any other biome (custom or vanilla), copy the four `minecraft:*_identifier` components into its client biome file and set `fog_identifier`.

## Notes

- Keep the tone mapping operator (`generic`), `orbital_offset_degrees`, caustics settings and `waves.enabled` the same in every file of a pack: those can't blend between biomes. They match the vanilla values here.
- Lighting, atmospherics and color grading blend by camera position. Water blends per water block, so you can see the change from a distance.
- `shadows/global.json` and `pbr/global.json` apply to the whole world while the pack is on. Delete them if you only want the biome look.
- Test with Settings > Video > Graphics Mode > Vibrant Visuals in a **new** world, then `/locate biome myns:glimmer_meadow`. The Editor's Vibrant Visuals pane edits these values live and exports JSON.
