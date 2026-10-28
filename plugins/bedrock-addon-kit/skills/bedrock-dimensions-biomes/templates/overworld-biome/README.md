# overworld-biome template

A custom biome `ns:glimmer_meadow` that takes over about 30% of Plains and Sunflower Plains in new Overworld chunks, with its own surface, map tint, client colors and a flower feature. **Stable** since game 1.21.110 (partial biome replacement left the experiment). No script needed.

| File | What it does |
|---|---|
| `BP/biomes/glimmer_meadow.biome.json` | Server biome: climate, overworld surface builder, moss patches, map tints, `minecraft:replace_biomes`, village type, tags |
| `RP/biomes/glimmer_meadow.client_biome.json` | Sky, fog (vanilla `minecraft:fog_plains`), water, grass and foliage colors |
| `BP/features/glimmer_flower_feature.json`, `glimmer_flower_patch_feature.json` | Allium and cornflower patches |
| `BP/feature_rules/glimmer_meadow_flowers.json` | Attaches the patch to biomes tagged `ns_glimmer_meadow` |

## Wire it up

1. Copy the template in with `new-addon.mjs ... --add <this folder>`. No `main.js` import is needed.
2. Create a **new** world (or travel to unexplored chunks). Replacement only affects chunks generated after the pack is on.
3. Find it with `/locate biome ns:glimmer_meadow` (after renaming, your namespace).

## Notes

- `targets` take full vanilla biome ids (`minecraft:plains`, not `plains`). The docs still say no namespace, but the game rejects a bare name ("No biome found with name", "Missing referenced asset") and drops the whole biome. `/bedrock-check` flags it.
- Add new replacements to the end of `replacements`: changing the order changes generation of seeds already in use.
- The tags `animal` and `monster` keep vanilla spawn rules working here. The tag `ns_glimmer_meadow` is what your own feature rules and spawn rules should test.
