# skylands-dimension template

Two custom dimensions, one custom biome with client visuals, and a script that moves players between them. Everything here is **Stable** (game 26.50+, `@minecraft/server` 2.8.0+). No experiments.

| File | What it does |
|---|---|
| `BP/dimensions/skylands.json` | JSON dimension `ns:skylands`: Y 0 to 255, default biome `ns:skylands`, void generator |
| `BP/biomes/skylands.biome.json` | Server biome `ns:skylands`: climate, map tints, tag `ns_skylands` |
| `RP/biomes/skylands.client_biome.json` | Sky, fog, water, grass and foliage colors, ambient loop, music volume |
| `RP/fogs/skylands_fog.json` | Fog `ns:skylands_fog` used by the client biome |
| `BP/features/skylands_flower_feature.json`, `skylands_flower_patch_feature.json` | Flowers the script places on the landing island |
| `BP/feature_rules/skylands_flowers.json` | Same patch attached to the biome tag, for any generation pass that runs in the dimension (unverified for the void generator) |
| `BP/items/dimension_key.json` | `ns:dimension_key`: use it to go to the Skylands, use it there to go home |
| `RP/textures/item_texture.json` | Icon key `ns_dimension_key` for `RP/textures/items/ns_dimension_key.png` |
| `BP/scripts/ns_dimensions.js` | Registers `ns:void` in `system.beforeEvents.startup`, adds `/ns:travel <void|skylands|home>`, builds landing platforms behind a ticking area, teleports |

## Wire it up

1. Generate or open an add-on and copy this template in (`new-addon.mjs ... --add <this folder>`). The generator renames `ns` to your namespace in names and file paths.
2. `BP/scripts/main.js` must import the module. `new-addon.mjs --add` adds the import for you. When copying by hand, add this line to the top of `main.js`:

   ```js
   import "./ns_dimensions.js";
   ```

   (after renaming it reads `import "./<yourns>_dimensions.js";`)
3. The manifest needs a script module and `@minecraft/server` 2.8.0 or newer. The generator writes 2.10.0.
4. In game: `/give @s ns:dimension_key`, then use it. Or `/ns:travel skylands`, `/ns:travel void`, `/ns:travel home` (operator, cheats on).

## Notes

- Do not also call `registerCustomDimension("ns:skylands")`: the JSON file defines it. Pick one way per id.
- Script-registered dimensions always use the void generator with default heights. Use a JSON file when you need heights or a default biome.
- The platform is built once per world (world dynamic property `ns:built_<dim>`). Delete the property or change the key to rebuild.
- The first trip back home uses the spot the player left from (player dynamic properties), then the player's spawn point, then the Overworld surface at 0, 0.
- A player with passengers can't be teleported across dimensions; the script reports the error.
