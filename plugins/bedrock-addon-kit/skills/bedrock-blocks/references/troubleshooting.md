# Troubleshooting custom blocks

Turn on Content Log File and Content Log GUI (Creator settings) and read the log first. A block JSON that fails at format 1.26.20+ is dropped whole, and only the log says why. Re-enter the world after any JSON or resource-pack change (`/reload` only reloads scripts and functions). Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP> <RP>` before every test. It catches missing terrain keys, geometry outside `models/blocks`, unregistered custom components and object-form `collision_box` at format 1.26.60.

## The block doesn't exist (`/give` says unknown, or it's missing from the menu)

| Check | Detail |
|---|---|
| Parse | no comments, trailing commas, BOM or smart quotes. One bad file can hide only that block, so it's easy to miss |
| Strict fields (format 1.26.20+) | `"tag:..."` keys → move to `minecraft:tags`; boolean `ambient_occlusion` → float; light values outside 0 to 15; empty `menu_category.group`; `menu_category` without `category`; `y_rotation_offset` not a multiple of 90; `blocks_to_corner_with` without `corner_and_cardinal_direction`; `flower_pottable` in permutations; a `culling_shape` with a bad name |
| Experiments | a field that still needs Upcoming Creator Features (`collision_box` min/max, `item_specific_speeds`, `culling_layer`, `block_entity.container`, `neighbor_change`, ...) fails or is ignored in a normal world |
| Identifier | it has a namespace that isn't `minecraft:`; states and menu groups also need valid namespaces |
| Not in creative menu but `/give` works | add `description.menu_category` |
| Permutation count | content log warning above 65,536 world-wide permutations: cut state combinations |

## It renders wrong

| Symptom | Likely cause |
|---|---|
| Missing-texture checkerboard | `material_instances.texture` isn't a key in `terrain_texture.json`; the key's path is wrong, has the wrong case or includes `.png`; two RPs each ship a `terrain_texture.json` and you edited the other one |
| Vanilla block textures changed | your key or file path reuses a vanilla name (`stone`, `textures/blocks/stone.png`). Use `ns_` keys and `textures/blocks/ns/` |
| Invisible block | the geometry id isn't found (the file isn't in `RP/models/blocks/`, or the identifier is misspelled); geometry with no `material_instances`; all faces transparent with `alpha_test` |
| Black or very dark block | a non-full shape with default lighting: set `"minecraft:light_dampening": 0`; check the `ambient_occlusion` and `face_dimming` values |
| Transparent pixels show as solid colour | `render_method` is `opaque`: use `alpha_test_single_sided` (glass, plants), `alpha_test` (see-through cages) or `blend` (translucent) |
| Inner faces visible through glass | `alpha_test` or `double_sided` turn backface culling off; use `alpha_test_single_sided` |
| Block vanishes at half the render distance | every method except `opaque` is a "near" block (half distance). That's by design. The `*_to_opaque` methods render opaque far away |
| Bottom texture upside down | format 1.26.0+ rotates the DOWN face of `minecraft:geometry.full_block` by 180°. Use `minecraft:geometry.full_block_v1` or flip the PNG |
| Faces wrong after rotation | `minecraft:transformation` rotates the model and its faces. Add `"uv_lock": true` in the geometry object to keep UVs world-aligned |
| Model cut off or not loading | the model is over 30 px, or no part is inside the base 16x16x16 block |
| Animated texture still | the `flipbook_textures.json` entry's `atlas_tile` must equal the terrain key; the PNG must be a vertical strip of square frames |
| Bone visibility ignored on 26.52 | boolean values regressed in 26.50 (fixed in 26.60). Use a Molang string such as `"query.block_state('ns:open')"` |
| Held item looks wrong | use `minecraft:item_visual`, or `item_display_transforms` in the geometry (its experiment status is unclear) |

## Shape and interaction

| Symptom | Likely cause |
|---|---|
| Walk through it, or stuck on air | `collision_box` disagrees with the model. Collision is never taken from geometry; write the boxes yourself |
| Load error at format 1.26.60 | `collision_box` written as a single object. Wrap it in an array |
| Can't target or break it | `selection_box: false` |
| Content log "selection_box: Invalid box size ... Vec3(-8,0,-8) and Vec3(8,16,8)", then the block's recipe "missing or invalid" and blocks.json "does not exist in the registry" | A selection box taller than 16 or outside the block: the game refuses the whole block. Keep it inside; collision may still be 24 tall |
| Breaks instantly / takes forever | `seconds_to_destroy` is 0 or too large. Tool speed needs an `is_*_item_destructible` tag |
| Drops nothing / the wrong item | a wrong `minecraft:loot` path (it's relative to the BP root); `{}` drops nothing; no `loot` drops itself |
| Pops off right after placing | the `placement_filter` condition isn't met (wrong `allowed_faces`, block id not in `block_filter`) |
| Water deletes it or flows through | set `liquid_detection` (`can_contain_liquid`, `on_liquid_touches`) |
| Faces the wrong way | `cardinal_direction` stores the player's facing. Add `y_rotation_offset: 180.0` or swap 0 and 180 in the permutations |
| Two permutations fight | conditions overlap and both set the same component. Make the conditions exclusive |

## Scripts never run

| Check | Detail |
|---|---|
| Registration | `system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => blockComponentRegistry.registerCustomComponent("ns:id", {...}))`. The id must match the JSON key exactly |
| JSON attachment | `"ns:id": {}` inside `components` or a permutation's `components`, not in `minecraft:custom_components` |
| Manifest | the BP has a `script` module with `entry` and a dependency on `@minecraft/server` 2.x (see `bedrock-addon-conventions`) |
| Event prerequisites | `onTick` needs `minecraft:tick` (content error without it); `onRedstoneUpdate` needs `minecraft:redstone_consumer` and power ≥ `min_power`; `onStepOn` needs collision to stand on; `onEntityFallOn` defaults to 1 block of fall |
| Params per state | a permutation that sets the same custom component key replaces its params for that state; permutations that don't mention it keep the base one |
| State writes | `perm.withState("ns:x", v)` throws if the block lacks that state or the value isn't in its list. `getState` returns `undefined` for unknown states |
| Privilege error | a write in a restricted callback (before-events): use `event.cancel` / `permutationToPlace`, or defer with `system.run` |
| Multi-block | only the first-broken part gets `onBreak`; use `block.getParts()` to act on all parts |

## Data and saving

- Block dynamic properties need `"minecraft:block_entity": {"dynamic_properties": true}` (format 1.26.20+). They're limited to 1 KB per pack per block. Replacing the block with a different block wipes them, while changing its state keeps them.
- Dynamic property data is keyed to the BP manifest UUID. A new UUID orphans existing saves.

## Before release

- Set the format to `1.26.50` and use array `collision_box` throughout. The blocks then load in 26.52 and in 26.60 Preview. Test once in Preview.
- No experimental fields, and no `minecraft:` namespace on custom ids, texture keys or texture paths.
- Each block has a lang line `tile.ns:x.name=...`, a `blocks.json` sound, a map colour, sensible mining and explosion values, and a loot table if it shouldn't drop itself.
