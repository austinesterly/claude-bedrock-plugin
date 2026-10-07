# World generation: features, feature rules, structures, jigsaw

Field tables: `../../bedrock-json-reference/references/worldgen.md`. Working files: `../templates/ore-feature/` and `../templates/scatter-feature/`. Custom biomes and dimensions are covered by `bedrock-dimensions-biomes` (pointer at the end).

## How the pieces connect

```
feature_rules/ns_x_rule.json  --places_feature-->  features/ns_x.json  --(may place other features)-->  ...
   (where/when: pass, biome, how often)               (what: blocks, structure, scatter)
```
- A **feature** is what gets placed. On its own it does nothing until a feature rule (or `/place feature`, or another feature) places it.
- A **feature rule** attaches a feature to world generation: which placement pass, which biomes, how many attempts per chunk and where.
- Features only run in **newly generated chunks**. Test in a new world, or with `/place feature ns:x` and `/place featurerule ns:x_rule`.

BP folders `features/` and `feature_rules/`, one definition per file. Since 1.26.10 the file name no longer has to match the identifier and subfolders are allowed; older docs still say it must match, so match it anyway for older-engine safety. Duplicate identifiers are an error (1.26.40).

## Feature format_version

The feature docs give examples at `1.13.0`, `1.21.10`, `1.21.20`, `1.21.40` and `1.26.50`, and most feature pages say "requires 1.20.30 or later". The templates use **`1.21.40`**. One real difference: `scatter_feature` needs **≥1.21.20** for the `distribution` object; older files put `iterations`, `x`, `y`, `z` at the top level.

## Example: ore (templates/ore-feature)

Feature, `features/ns_ruby_ore_feature.json`:
```json
{
  "format_version": "1.21.40",
  "minecraft:ore_feature": {
    "description": { "identifier": "ns:ruby_ore_feature" },
    "count": 6,
    "replace_rules": [
      { "places_block": "ns:ruby_ore", "may_replace": [ "minecraft:stone", "minecraft:granite", "minecraft:diorite", "minecraft:andesite" ] },
      { "places_block": "ns:deepslate_ruby_ore", "may_replace": [ "minecraft:deepslate", "minecraft:tuff" ] }
    ]
  }
}
```
Rule, `feature_rules/ns_ruby_ore_feature_rule.json`:
```json
{
  "format_version": "1.21.60",
  "minecraft:feature_rules": {
    "description": { "identifier": "ns:ruby_ore_feature_rule", "places_feature": "ns:ruby_ore_feature" },
    "conditions": {
      "placement_pass": "underground_pass",
      "minecraft:biome_filter": [ { "test": "has_biome_tag", "operator": "==", "value": "overworld" } ]
    },
    "distribution": {
      "iterations": 8,
      "coordinate_eval_order": "zyx",
      "x": { "distribution": "uniform", "extent": [ 0, 16 ] },
      "y": { "distribution": "uniform", "extent": [ -48, 32 ] },
      "z": { "distribution": "uniform", "extent": [ 0, 16 ] }
    }
  }
}
```
8 veins of up to 6 blocks per chunk between Y -48 and 32. `discard_chance_on_air_exposure` (0-1) on the ore feature makes it rarer next to caves.

## Example: surface flowers (templates/scatter-feature)

Three files: a `single_block_feature` (one flower, must sit on grass or dirt), a `scatter_feature` that tries it 12 times around a point and drops each try to the floor, and a rule that runs the patch in a quarter of forest chunks at the surface height.
```json
{
  "format_version": "1.21.40",
  "minecraft:single_block_feature": {
    "description": { "identifier": "ns:glow_flower_feature" },
    "places_block": [ { "block": "ns:glow_flower", "weight": 1 } ],
    "enforce_survivability_rules": true,
    "enforce_placement_rules": true,
    "may_attach_to": { "auto_rotate": false, "min_sides_must_attach": 1, "bottom": [ "minecraft:grass_block", "minecraft:dirt" ] },
    "may_replace": [ "minecraft:air" ]
  }
}
```
```json
{
  "format_version": "1.21.40",
  "minecraft:scatter_feature": {
    "description": { "identifier": "ns:glow_flower_patch_feature" },
    "places_feature": "ns:glow_flower_feature",
    "distribution": {
      "iterations": 12,
      "x": { "distribution": "gaussian", "extent": [ -4, 4 ] },
      "y": 0,
      "z": { "distribution": "gaussian", "extent": [ -4, 4 ] }
    },
    "project_input_to_floor": true
  }
}
```
Rule (`after_surface_pass`, forest only):
```json
"distribution": {
  "iterations": 1,
  "scatter_chance": { "numerator": 1, "denominator": 4 },
  "x": { "distribution": "uniform", "extent": [ 0, 16 ] },
  "y": "query.heightmap(variable.worldx, variable.worldz)",
  "z": { "distribution": "uniform", "extent": [ 0, 16 ] }
}
```

## Feature rule reference

| Key | Values |
|---|---|
| `placement_pass` | `first_pass`, `before_underground_pass`, `underground_pass`, `after_underground_pass`, `before_surface_pass`, `surface_pass`, `after_surface_pass`, `before_sky_pass`, `sky_pass`, `after_sky_pass`, `final_pass` |
| `minecraft:biome_filter` | Filter list or `all_of` / `any_of` with `has_biome_tag` (or `is_biome`) |
| `iterations` | Attempts per chunk (int or Molang) |
| `scatter_chance` | `{ "numerator": 1, "denominator": 4 }` or a number/Molang expression. Docs disagree on number scale (0-1 vs 0-100), so prefer the fraction form |
| `x`, `y`, `z` | Number, Molang string, or `{ "distribution", "extent": [min,max], "step_size"?, "grid_offset"? }` |
| `distribution` | `uniform`, `gaussian`, `inverse_gaussian`, `triangle`, `fixed_grid`, `jittered_grid` |
| `coordinate_eval_order` | `xyz`, `xzy` (default), `yxz`, `yzx`, `zxy`, `zyx` |

Positions in a rule are relative to the chunk corner, so `x`/`z` 0-16 cover one chunk. Molang here can use `variable.worldx` / `variable.worldz` (the column being placed) and world-gen queries such as `query.heightmap(x, z)`, `query.above_top_solid(x, z)` and `query.noise(x, z)`.

## Feature types (1.26.50)

| Type | Use |
|---|---|
| `ore_feature` | Veins replacing blocks (`count`, `replace_rules`, `discard_chance_on_air_exposure`) |
| `single_block_feature` | One block with attachment rules (`places_block`, `may_attach_to`, `may_replace`, `may_not_attach_to`, `randomize_rotation`, `enforce_*`) |
| `scatter_feature` | Repeat another feature with a distribution (`places_feature`, `distribution`, `project_input_to_floor`) |
| `aggregate_feature`, `sequence_feature`, `weighted_random_feature` | Run several features: all, all in order (stop on failure), one by weight |
| `search_feature` | Look in a volume for a valid spot, then place |
| `snap_to_surface_feature` | Move down/up to a surface (`embed_in_surface` since 1.26.20) |
| `surface_relative_threshold_feature` | Only place within a distance of the surface |
| `height_difference_filter` (1.26.30) | Only place where terrain slope fits |
| `structure_template_feature` | Place a `.mcstructure` (`structure_name`, `adjustment_radius`, `facing_direction`, `constraints`: `unburied`, `grounded`, `leveled {max_steepness}`, `block_intersection {block_allowlist, only_check_intersection_for_motion_blocking_blocks}`; `ground_level` 1.26.30; `rotate_around_center` 1.26.20) |
| `tree_feature` | Trunks, branches, canopies |
| `geode_feature`, `fossil_feature`, `growing_plant_feature`, `multiface_feature`, `vegetation_patch_feature`, `sculk_patch_feature`, `partially_exposed_blob_feature`, `multi_block_feature` (1.26.40) | Specialised shapes |
| `cave_carver_feature`, `nether_cave_carver_feature`, `underwater_cave_carver_feature` | Carvers |

Removed types (don't use): `beards_and_shavers`, `conditional_list`, `rect_layout`, `scan_surface`.

## Small structures (.mcstructure)

1. Build it, save it with a structure block (Export) or `structure save`.
2. Put the file at BP `structures/ns/ruins.mcstructure`. It is referenced as `"ns:ruins"` (folder = namespace). Keep every structure in a namespace subfolder; a file directly in `structures/` gets a default namespace (commonly `mystructure:`), which is easy to get wrong.
3. Place it from a `structure_template_feature` + feature rule, `/structure load ns:ruins ~ ~ ~`, or script `world.structureManager.place("ns:ruins", dimension, location)`.

```json
{
  "format_version": "1.21.40",
  "minecraft:structure_template_feature": {
    "description": { "identifier": "ns:ruins_feature" },
    "structure_name": "ns:ruins",
    "adjustment_radius": 4,
    "facing_direction": "random",
    "constraints": { "grounded": {}, "unburied": {}, "block_intersection": { "block_allowlist": [ "minecraft:air" ] } }
  }
}
```
Structure files v2 arrived in 1.26.50; the in-game export handles this, you never write `.mcstructure` by hand.

## Large structures: jigsaw (stable since 1.21.120)

Four JSON types, all at schema `"format_version": "1.21.20"`. They live in four BP `worldgen/` subfolders: `worldgen/structures/`, `worldgen/template_pools/`, `worldgen/processors/` and `worldgen/structure_sets/` (Microsoft Learn, Introduction to Jigsaw Structures; the `structures` folder was formerly named `jigsaw_structures`, so older tutorials use that name). The `.mcstructure` files themselves go in the BP's top-level `structures/` folder.

Structure (`worldgen/structures/ns_ruins.json`):
```json
{
  "format_version": "1.21.20",
  "minecraft:jigsaw": {
    "description": { "identifier": "ns:ruins" },
    "step": "surface_structures",
    "terrain_adaptation": "beard_thin",
    "start_pool": "ns:ruins/start",
    "max_depth": 4,
    "start_height": { "type": "constant", "value": { "absolute": 0 } },
    "heightmap_projection": "world_surface",
    "biome_filters": [ { "test": "has_biome_tag", "operator": "==", "value": "plains" } ]
  }
}
```
Template pool (`worldgen/template_pools/ns_ruins_start.json`):
```json
{
  "format_version": "1.21.20",
  "minecraft:template_pool": {
    "description": { "identifier": "ns:ruins/start" },
    "elements": [
      { "element": { "element_type": "minecraft:single_pool_element", "location": "ns:ruins_center", "processors": "ns:ruins_decay", "projection": "rigid" }, "weight": 1 }
    ],
    "fallback": "minecraft:empty"
  }
}
```
Processor list (`worldgen/processors/ns_ruins_decay.json`): crack 20% of stone bricks, and fill chests with loot.
```json
{
  "format_version": "1.21.20",
  "minecraft:processor_list": {
    "description": { "identifier": "ns:ruins_decay" },
    "processors": [
      {
        "processor_type": "minecraft:rule",
        "rules": [
          {
            "input_predicate": { "predicate_type": "minecraft:random_block_match", "block": "minecraft:stone_bricks", "probability": 0.2 },
            "output_state": { "name": "minecraft:cracked_stone_bricks" }
          },
          {
            "input_predicate": { "predicate_type": "minecraft:block_match", "block": "minecraft:chest" },
            "output_state": { "name": "minecraft:chest" },
            "block_entity_modifier": { "type": "minecraft:append_loot", "loot_table": "loot_tables/chests/ns_critter_treasure.json" }
          }
        ]
      }
    ]
  }
}
```
Structure set (`worldgen/structure_sets/ns_ruins.json`):
```json
{
  "format_version": "1.21.20",
  "minecraft:structure_set": {
    "description": { "identifier": "ns:ruins" },
    "placement": { "type": "minecraft:random_spread", "salt": 184726193, "separation": 8, "spacing": 32, "spread_type": "linear" },
    "structures": [ { "structure": "ns:ruins", "weight": 1 } ]
  }
}
```

| Jigsaw key | Values (schema 1.21.20) |
|---|---|
| `step` | `raw_generation`, `lakes`, `local_modifications`, `underground_structures`, `surface_structures`, `strongholds`, `underground_ores`, `underground_decoration`, `fluid_springs`, `vegetal_decoration`, `top_layer_modification` |
| `max_depth` | 0-20 (how many pieces deep the chain goes) |
| `start_height` | `{ "type": "constant", "value": {anchor} }` or `{ "type": "uniform", "min": {anchor}, "max": {anchor} }`; anchor is `absolute`, `above_bottom`, `below_top` or `from_sea` |
| `terrain_adaptation` | `none`, `bury`, `beard_thin`, `beard_box`, `encapsulate` |
| `heightmap_projection` | `world_surface`, `ocean_floor`, `none` (default) |
| optional | `max_distance_from_center {horizontal, vertical}` (default 80), `dimension_padding`, `pool_aliases`, `start_jigsaw_name`, `liquid_settings` (`apply_waterlogging`/`ignore_waterlogging`) |
| pool `element_type` | `minecraft:single_pool_element`, `minecraft:empty_pool_element`, `minecraft:feature_pool_element`; `weight` 1-200 |
| `processor_type` | `minecraft:rule`, `minecraft:block_ignore` (`blocks`), `minecraft:protected_blocks`, `minecraft:capped` (`limit`, `delegate`) |
| predicates | `minecraft:always_true`, `minecraft:block_match`, `minecraft:random_block_match`, `minecraft:tag_match`, `minecraft:blockstate_match`, `minecraft:random_blockstate_match`; position: `minecraft:always_true`, `minecraft:axis_aligned_linear_pos` |
| placement | `type` `minecraft:random_spread`, `salt` (unique per set), `separation` < `spacing` (chunks), `spread_type` `linear`/`triangular`; `structures[]` weight 1-200 |

- Pieces connect through **jigsaw blocks** placed in the structures (name, target name, target pool). Set these in game before exporting.
- `/place structure ns:ruins` and `/place jigsaw ns:ruins/start <target> 4` test without hunting. `/locate structure ns:ruins` finds generated ones.
- Editing vanilla jigsaw structures (Trail Ruins only so far) needs an experiment; custom ones don't.

## Biomes and dimensions

Custom biomes (stable since 1.21.120; `replace_biomes` without an experiment since 1.21.110; surface/subsurface builders out of beta at format 1.26.30), `client_biome` files, JSON custom dimensions and the `dimensionRegistry` / `registerCustomDimension` script API (server 2.10.0) are covered in depth by **`bedrock-dimensions-biomes`**. Use that skill for them. The feature rules in this file work in custom biomes as long as the `biome_filter` matches the custom biome's tags.

## Common mistakes

- Feature rule with a pass or biome tag that never matches (no error, nothing generates).
- Testing in old chunks: features only run on new terrain.
- `scatter_feature` with top-level `iterations`/`x`/`y`/`z` at format ≥1.21.20 (use `distribution`).
- Too many iterations per chunk: slow world generation.
- `.mcstructure` in the `structures/` root but referenced as `ns:name`: put it in `structures/ns/`.
- Two structure sets with the same `salt`: they line up on the same grid.
