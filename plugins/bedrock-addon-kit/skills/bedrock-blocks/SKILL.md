---
name: bedrock-blocks
description: Use when creating, changing or debugging any custom Minecraft Bedrock block (cubes, custom models, glass, lamps, logs, rotatable blocks, slabs, stairs, doors, fences, crops, ores, multi-blocks, block entities) - block JSON, states, permutations, traits, terrain_texture.json, blocks.json, block geometry, the block's item, and wiring blocks to script custom components.
---

# Bedrock custom blocks

Checked on 2026-10-06 against the Microsoft Learn creator docs, the vanilla 1.26.50.4 block files and the official changelogs up to Preview 26.60.30 (stable game 26.52, 26.60 in Preview). Every field here comes from those sources. Things that are still experimental are marked as such. Field-by-field tables are in `../bedrock-json-reference/references/blocks.md`. This skill covers how to combine them into blocks that work.

## Core rules

1. **`format_version: "1.26.50"`** for block files. Every vanilla 1.26.50 block file uses it, and it is the newest version needed for the released features here (horizontal multi-blocks need 1.26.50, `block_entity` without an experiment needs 1.26.20). From 1.26.20 the block parser is strict: one bad field and the whole block fails to load.
2. **`minecraft:collision_box` is always an array of boxes**: `[{"origin": [-8,0,-8], "size": [16,16,16]}]`. Arrays (up to 24 px tall) work at any format since game 1.26.0. From format 1.26.60 a single box object is rejected. `true`/`false` are still documented. Don't use the `min`/`max` box form, which needs Upcoming Creator Features. `selection_box` stays a single object, at most 16 px tall.
3. **Always pair `minecraft:geometry` with `minecraft:material_instances`** (required since 1.21.80). Use them for every block, including plain cubes (`minecraft:geometry.full_block`). Once a block has them, any textures in `blocks.json` are overridden, so `blocks.json` only sets the sound.
4. **Namespace your texture keys and paths.** The keys in `terrain_texture.json` and the files under `textures/blocks/` share one space with vanilla. A key `stone` or a file `textures/blocks/stone.png` replaces the vanilla one. Use `ns_thing` → `textures/blocks/ns/thing`.
5. **`description.menu_category`** with a `category` (`construction`, `nature`, `equipment`, `items`, `none`), or the block never shows up in the creative inventory. If you set `group`, it must not be empty (strict at 1.26.20). Vanilla groups look like `minecraft:itemGroup.name.slab`.
6. **Tags go in `"minecraft:tags": ["minecraft:is_pickaxe_item_destructible", "ns:my_tag"]`** (format 1.26.20+). The old `"tag:ns:x": {}` keys are rejected at 1.26.20.
7. **Strict values at 1.26.20:** `light_emission` and `light_dampening` must be integers from 0 to 15. `ambient_occlusion` must be a float from 0.0 to 10.0 (booleans are rejected). `y_rotation_offset` must be 0, 90, 180, 270 or 360. A permutation `condition` can only use `query.block_state(...)`.
8. **Custom components:** use the component id as a key with a params object (`"ns:cycle_state": {"max": 3}`) and register it in `system.beforeEvents.startup` through `blockComponentRegistry`. `onTick` needs `minecraft:tick` on the block. `onRedstoneUpdate` needs `minecraft:redstone_consumer`. The old `minecraft:custom_components` list is deprecated. See `bedrock-scripting`.
9. **`minecraft:geometry.full_block` at format 1.26.0+ renders its DOWN face rotated 180°** to match Java Edition and vanilla. `minecraft:geometry.full_block_v1` keeps the old orientation. This matters for a bottom texture with a direction.
10. **Ship no experiments.** Still experimental in 26.52 and 26.60: block containers (`block_entity.container`, `entity_storage`), `collision_box` min/max, `culling_layer`, `minecraft:neighbor_change`, `minecraft:vibration_properties`, `minecraft:enchantment_power_transmitter`, and the named-tick script API (beta). The docs still list `destructible_by_mining.item_specific_speeds` as experimental. Use the `minecraft:is_*_item_destructible` tags for tool speed.

## The file chain

| File | Holds | Must match |
|---|---|---|
| `BP/blocks/<name>.json` | `minecraft:block`: description (identifier, menu_category, states, traits), components, permutations | identifier `ns:name` everywhere |
| `RP/textures/terrain_texture.json` | `"texture_data": { "ns_name": { "textures": "textures/blocks/ns/name" } }` (path without `.png`) | each `material_instances.*.texture` |
| `RP/textures/blocks/ns/*.png` | 16x16 per face (flipbook strips are 16 px wide, 16 x frames tall) | the path above, exact case |
| `RP/models/blocks/*.geo.json` | custom block geometry (`geometry.ns.name`). Block geometry is only read from `models/blocks` | the `minecraft:geometry` identifier |
| `RP/blocks.json` | `"ns:name": { "sound": "stone" }` (vanilla file: `"format_version": "1.21.40"`) | identifier |
| `RP/texts/en_US.lang` | `tile.ns:name.name=Display Name` | identifier |
| `BP/loot_tables/...json` | only if the drop isn't the block itself (no `minecraft:loot` = drops itself) | `minecraft:loot` path from the BP root |
| `BP/scripts/main.js` | custom component registration (manifest needs a script module and `@minecraft/server`) | component ids used as keys |

Minimal working block (the `templates/simple_cube` files):

```json
{
  "format_version": "1.26.50",
  "minecraft:block": {
    "description": { "identifier": "ns:simple_cube", "menu_category": { "category": "construction" } },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": { "*": { "texture": "ns_simple_cube", "render_method": "opaque" } },
      "minecraft:destructible_by_mining": { "seconds_to_destroy": 1.5 },
      "minecraft:destructible_by_explosion": { "explosion_resistance": 6 },
      "minecraft:tags": ["minecraft:is_pickaxe_item_destructible"],
      "minecraft:map_color": "#7d7d7d"
    }
  }
}
```

## How blocks are put together

- **Description:** `identifier`, `menu_category`, `states` (custom, namespaced, values listed in an array or given as `{"values": {"min": 0, "max": 3}}`), `traits` (built-in states the game sets for you: `placement_direction`, `placement_position`, `connection`, `multi_block`).
- **Components:** the base behavior and look.
- **Permutations:** `[{ "condition": "query.block_state('ns:lit') == true", "components": {...} }]`. A matching permutation's component replaces the base component with the same name. The game caps the whole world at 65,536 permutations, so keep the number of state combinations small.
- **Rotation** is `minecraft:transformation` in permutations, in steps of 90 degrees. Cardinal: north 0, south 180, west 90, east 270 (y axis). For 16-way or other visual-only rotation, use `n_way_visual_rotation` on the geometry (stable since 26.40, see the states reference).
- **Visual layers:** `render_method` decides transparency and render distance. `opaque` blocks render to the full render distance. Every other method renders to half of it.

## Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| Block missing or "unknown block" | one invalid field at format 1.26.20+ (old `tag:` key, boolean `ambient_occlusion`, light 16, empty menu group) | read the content log, fix the field |
| Magenta/black checker texture | texture key missing from `terrain_texture.json`, a wrong path or wrong case, or `.png` written in the path | key must match exactly; path has no extension |
| Block looks like a vanilla block, or vanilla changed | non-namespaced texture key or path collided with vanilla | `ns_` keys, `textures/blocks/ns/` paths |
| Invisible or the wrong shape | geometry id not in `RP/models/blocks`, or geometry set without `material_instances` | keep geometry files in `models/blocks`; always set both |
| Not in the creative menu | no `menu_category` | add it (`/give @s ns:x` still works without it) |
| Rotations wrong by 180° | `cardinal_direction` stores the direction the player faces | `y_rotation_offset: 180.0` so the front faces the player (`templates/facing_machine`) |
| Script never fires | component not registered, `onTick` without `minecraft:tick`, `onRedstoneUpdate` without `redstone_consumer`, component listed in `minecraft:custom_components` | see `references/troubleshooting.md` |
| Pack breaks in 26.60 Preview | object-form `collision_box` at format 1.26.60 | array form now |

## References and templates

| Need | Read |
|---|---|
| Geometry ids, Blockbench block models, size limits, material instances, render methods, AO, tint, culling, voxel shapes, flipbooks, texture variations, `blocks.json`, the block item (`item_visual`, display transforms, block_placer item) | `references/geometry-and-materials.md` |
| States, permutations, every trait and its states, rotation tables (cardinal, facing, 16-way), multi-block rules | `references/states-permutations-traits.md` |
| Behavior components in practice: collision/selection, mining and tool tags, explosions, friction, light, map color, loot, fire, placement, liquids and waterlogging, redstone, ticking, sounds, block entities and dynamic properties, script events | `references/components-in-practice.md` |
| Doors, trapdoors, stairs, fences, double slabs, torches, ores, crops with seeds, leaves, lamps, levers and pressure plates, crafting tables, flower-pot plants, storage blocks | `references/recipes-for-common-blocks.md` |
| "Why doesn't it load / render / fire" | `references/troubleshooting.md` |
| All fields, defaults and types | `../bedrock-json-reference/references/blocks.md` |

Templates (namespace `ns`, each `templates/<name>/BP` + `/RP`, no manifests; validated with `scripts/check-pack.mjs`):

| Template | Shows |
|---|---|
| `simple_cube` | one texture on all faces, tool tag, map color |
| `pillar_log` | per-face textures, axis from `placement_position` → `minecraft:block_face` |
| `facing_machine` | `placement_direction` + `y_rotation_offset` + four rotation permutations, front texture |
| `custom_model` | Blockbench-style `.geo.json` in `RP/models/blocks`, named material instance, multi-box collision |
| `glow_glass` | `alpha_test_single_sided`, light emission, no light dampening, drops nothing |
| `state_lamp` | integer state, per-state texture and light, `ns:cycle_state` custom component (`BP/scripts/main.js`) |
| `berry_crop` | cross geometry, 4 growth stages from `onRandomTick`, farmland placement filter, per-stage loot |
| `half_slab` | `placement_position` → `minecraft:vertical_half`, two geometries, waterloggable |

To use a template, copy its BP/RP folders into your packs. Merge its `terrain_texture.json` `texture_data`, `blocks.json` entries and lang lines into your existing files, because overwriting would drop your other blocks. Add the manifests from `bedrock-addon-conventions`. Then run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP> <RP>` and test in game.
