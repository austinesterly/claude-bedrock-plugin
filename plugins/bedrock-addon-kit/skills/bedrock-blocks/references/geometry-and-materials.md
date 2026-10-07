# Block geometry, materials and textures

Sources: MS Learn `minecraftBlock_geometry`, `minecraftBlock_material_instances`, `minecraftBlock_item_visual`, `AdvancedCustomBlocks`, `CustomBlockRenderLighting`, `CustomBlockRenderDistance`, `CustomBlockOversized`, `VoxelShapes`, `VariationsBlockTexture`, `CreateAnimatedBlockTexture`, `ItemDisplayTransforms`, `CustomizingItemForABlock`, update notes 1.21.20 to 1.26.40, and vanilla 1.26.50.4 `resource_pack/` files. For modelling technique and per-face UV export details see `bedrock-blockbench` (`references/geometry-and-textures.md`).

## 1. `minecraft:geometry`

String form `"minecraft:geometry": "geometry.ns.thing"`, or object form:

```json
"minecraft:geometry": {
  "identifier": "geometry.ns.thing",
  "bone_visibility": { "door_open": "query.block_state('ns:open')" },
  "culling": "ns:culling.thing",
  "culling_shape": "ns:thing_shape",
  "uv_lock": true
}
```

| Built-in identifier | Use |
|---|---|
| `minecraft:geometry.full_block` | plain cube with per-face material instances. At format 1.26.0+ the DOWN face is rotated 180° (it now matches vanilla and Java) |
| `minecraft:geometry.full_block_v1` | the pre-1.26.0 orientation of the down face |
| `minecraft:geometry.cross` | two crossed planes (flowers, crops, shrubs) |
| `minecraft:geometry.full_cube` | listed in the geometry docs as "the most efficient rendering path for 1x1x1 blocks" (added 1.20.60). Vanilla and the tutorials use `full_block`, so prefer that unless you've measured a difference |

| Field | Notes |
|---|---|
| `bone_visibility` | Bone name → visibility. The value can be a Molang expression limited to `query.block_state(...)`. If permutations set `bone_visibility`, the base `components` must also set it. Boolean values regressed in 26.50 (MCPE-238524) and are restored in 26.60, so on 26.52 use Molang strings such as `"query.block_state('ns:open') == false"` |
| `culling` | id of a `minecraft:block_culling_rules` file in `RP/block_culling/` (see section 6) |
| `culling_shape` | voxel shape id from `BP/shapes/` (released at format 1.26.30). `minecraft:empty` (the default) or `minecraft:unit_cube` are the only `minecraft:` ids. `full_block` always uses `unit_cube` |
| `culling_layer` | **experimental** (Upcoming Creator Features) |
| `uv_lock` | `true` or an array of bone names (format 1.21.100+). Keeps UVs fixed while `minecraft:transformation` rotates the block. Prefer the boolean |
| `n_way_visual_rotation` | visual-only rotation driven by a state (format 1.26.30+, no experiment since 26.40). See `states-permutations-traits.md` section 5 for the open question about its JSON shape. Not allowed on multi-blocks |

## 2. Custom geometry (Blockbench models)

- Put the file in **`RP/models/blocks/`**. The block geometry loader only reads that folder. Blockbench exports `format_version` `1.12.0`, as do the official tutorials. `1.21.0` is needed for `item_display_transforms`. One file may hold several geometries (`templates/half_slab` keeps two).
- Coordinates: 16 units = 1 block, origin at the bottom centre, so a full block is `origin [-8,0,-8]`, `size [16,16,16]`. North is -Z.
- Size limits: the model can be at most 30 px on each axis and must stay within 30 px of the origin in every direction. At least 1 px on each axis must overlap the base 16x16x16 block. Blockbench's Block Wizard enforces "16 px plus up to 14 px of growth" by default. Parts outside the base cube overlap neighbouring blocks and don't get culled.
- Keep block models small (the Blockbench skill uses about 50 cubes as its budget).
- `texture_width`/`texture_height` are the UV space. With one 16x16 texture per material instance, set both to 16 and give each face `"uv": [u, v], "uv_size": [w, h]`.
- **Named material instances:** a per-face UV may carry `"material_instance": "top"`. The block then maps that name in `material_instances`. `templates/custom_model` uses this:

```json
"up": { "uv": [0, 0], "uv_size": [12, 12], "material_instance": "top" }
```
```json
"minecraft:material_instances": {
  "*":   { "texture": "ns_pedestal_stone", "render_method": "opaque" },
  "top": { "texture": "ns_pedestal_top",   "render_method": "opaque" }
}
```

- Collision and selection don't follow the model. Set `minecraft:collision_box` (an array, up to 24 px tall, x/z from -8 to 8) and `minecraft:selection_box` (one box, up to 16 px tall) yourself.
- Oversized decorative blocks can be up to 30 px across, but collision stops at 16x24x16, so put the solid part inside the block.

## 3. `minecraft:material_instances`

Keys: `*` (default for every face or instance), `up`, `down`, `north`, `south`, `east`, `west`, plus any instance name the geometry uses. A value can be a full instance object or the name of another key (an alias):

```json
"minecraft:material_instances": {
  "north": "sushi_side",
  "south": "sushi_side",
  "*": { "texture": "ns_sushi_wrap" },
  "sushi_side": { "texture": "ns_tuna_roll" }
}
```

The tutorial says to always define `*`. Some official examples (the die, the horizontal log) define all six faces without it, which also works, but defining `*` is the safe default. The limit is 64 instances.

| Instance field | Values / notes |
|---|---|
| `texture` | key from `RP/textures/terrain_texture.json` |
| `render_method` | see the table below; `opaque` is the default |
| `ambient_occlusion` | float 0.0 to 10.0 (default 1.0). Booleans are rejected at format 1.26.20+. Plants and glass in vanilla use `0.0` |
| `face_dimming` | boolean. When true the face is shaded by the direction it faces |
| `isotropic` | boolean (format 1.21.80+). Randomizes the face UVs, like grass tops |
| `tint_method` | `none`, `default_foliage`, `birch_foliage`, `evergreen_foliage`, `dry_foliage`, `grass`, `water` (format 1.21.80+). Biome tint for leaves and grass |
| `alpha_masked_tint` | named in the 1.26.0 notes as no longer needing Upcoming Creator Features. The block docs have no field table for it, so check `bedrock-json-reference` before using it |

| `render_method` | Transparency | Backface culling | Render distance | Vanilla-like use |
|---|---|---|---|---|
| `opaque` | none (alpha shows as the nearest opaque colour) | on | full ("far") | stone, planks |
| `double_sided` | none | off (inside faces visible) | half | thin panels seen from both sides |
| `alpha_test` | on/off pixels only | off | half | spawner, see-through cages |
| `alpha_test_single_sided` | on/off pixels only | on | half | glass, plants (`red_shrub` uses it) |
| `blend` | true translucency | on | half | stained glass, ice |
| `alpha_test_to_opaque` | on/off near, opaque far | off | switches | leaves |
| `alpha_test_single_sided_to_opaque` | on/off near, opaque far | on | switches | sugar cane |
| `blend_to_opaque` | translucent near, opaque far | on | switches | |

Water is a special "far" blend block, and custom blocks can't copy that. The `*_to_opaque` methods are listed in the component reference but not in the render-distance tutorial. They look like the way to keep transparent blocks visible at long range, but that's untested here.

## 4. `terrain_texture.json`, flipbooks, variations

```json
{
  "resource_pack_name": "ns",
  "texture_name": "atlas.terrain",
  "padding": 8,
  "num_mip_levels": 4,
  "texture_data": {
    "ns_ore": { "textures": "textures/blocks/ns/ore" },
    "ns_tinted": { "textures": [{ "path": "textures/blocks/ns/tinted", "overlay_color": "#79c05a" }] }
  }
}
```

- Paths have no extension, are relative to the RP root and are case-exact. One `terrain_texture.json` per RP: merge entries, never keep two copies.
- Vanilla's own file starts with a comment line ("Do not copy this file directly"), so don't copy it as a starter.

**Flipbook (animated) textures:** vanilla's file is `RP/textures/flipbook_textures.json` (plural). The animation tutorial calls it `flipbook_texture.json`, but use the vanilla name. It is a top-level array:

```json
[
  { "flipbook_texture": "textures/blocks/ns/glow_core", "atlas_tile": "ns_glow_core", "ticks_per_frame": 10 },
  { "flipbook_texture": "textures/blocks/ns/pulse", "atlas_tile": "ns_pulse", "frames": [0, 1, 2, 3, 2, 1], "ticks_per_frame": 4, "blend_frames": false }
]
```

| Field | Meaning |
|---|---|
| `flipbook_texture` | the PNG: a vertical strip of square frames (16x64 = 4 frames) |
| `atlas_tile` | the `terrain_texture.json` key the animation replaces. That key must also exist there, pointing at the same file |
| `ticks_per_frame` | game ticks (1/20 s) per frame |
| `frames` | optional order of frame indexes |
| `blend_frames` | optional, default blends between frames |
| `atlas_index`, `atlas_tile_variant`, `replicate` | used by vanilla entries with texture arrays. Rarely needed for custom blocks |

**Texture variations** (random texture per position), for blocks at format 1.21.110+ with no experiment from 1.21.120. Up to 256 entries, each with `weight` 0.05 to 1000000. Without weights the first texture is always used. Entries can themselves be flipbooks:

```json
"ns_rocky": { "textures": { "variations": [
  { "path": "textures/blocks/ns/rocky_0", "weight": 10 },
  { "path": "textures/blocks/ns/rocky_1", "weight": 10 },
  { "path": "textures/blocks/ns/rocky_2", "weight": 3 }
] } }
```

The tutorial's block example uses a material instance key `"*north*"`, which looks like a typo. Use `"*"`.

## 5. `RP/blocks.json`

```json
{
  "format_version": "1.21.40",
  "ns:simple_cube": { "sound": "stone" },
  "ns:glow_glass":  { "sound": "glass" }
}
```

- `sound` is a vanilla block sound set name (`stone`, `wood`, `glass`, `grass`, `gravel`, `metal`, `sand`, `snow`, `mud`, ...; copy one from the vanilla `blocks.json` entry of a similar block). It sets the break, place, step and dig sounds.
- `textures`, `carried_textures` and `isotropic` exist, but `minecraft:geometry` + `minecraft:material_instances` override them. Don't rely on them for new blocks.
- The BP component `minecraft:sound` (`{"sound": "glass"}`, format 1.26.20+, released in 26.50) can set sounds per permutation. If the same block also has a `blocks.json` sound, `blocks.json` wins, including over permutation values.

## 6. Culling and voxel shapes

Culling removes faces hidden by neighbours. A culling rules file in the RP (`RP/block_culling/thing.json`):

```json
{
  "format_version": "1.20.60",
  "minecraft:block_culling_rules": {
    "description": { "identifier": "ns:culling.thing" },
    "rules": [
      { "geometry_part": { "bone": "bb_main", "cube": 0, "face": "north" }, "direction": "north" },
      { "geometry_part": { "bone": "bb_main", "cube": 0, "face": "south" }, "direction": "south" }
    ]
  }
}
```

`cube` and `face` are optional. Leave them out to cull the whole bone. `direction` is the neighbour to test, and it rotates with `minecraft:transformation`. Reference it from `minecraft:geometry.culling`.

Voxel shapes describe the block's occluding shape for culling. They only take part when the block also has culling rules. They live in the BP:

```json
{
  "format_version": "1.21.110",
  "minecraft:voxel_shape": {
    "description": { "identifier": "ns:slab_bottom" },
    "shape": { "boxes": [ { "min": [0, 0, 0], "max": [16, 8, 16] } ] }
  }
}
```

`BP/shapes/slab_bottom.json`. Voxel coordinates are corner-based (0 to 16, boxes from -30 to 30), unlike the centre-based geometry and collision coordinates. Each shape holds up to 32 boxes, and the registry holds 4,500 unique shapes. Reference it with `"culling_shape": "ns:slab_bottom"`.

## 7. The block's item

Every block automatically gets an item with the same id, shown in the menu if `menu_category` is set. It renders the block geometry by default.

**`minecraft:item_visual`** (format 1.21.60+) gives the item a different look. It needs both fields:

```json
"minecraft:item_visual": {
  "geometry": "minecraft:geometry.full_block",
  "material_instances": { "*": { "texture": "ns_die_red", "render_method": "opaque" } }
}
```

Since 26.30 a block's own `material_instances` no longer overrides the ones inside `item_visual`.

**A 2D icon or extra item components:** make an item with the same identifier as the block, `minecraft:block_placer` with `"replace_block_item": true`, and a `minecraft:icon`. That item becomes the block's default item (it's picked, dropped and shown in the menu). This is the pattern from the official multi-block sample and from vanilla 1.26.50 items such as `red_shrub`:

```json
{
  "format_version": "1.26.50",
  "minecraft:item": {
    "description": { "identifier": "ns:light_post" },
    "components": {
      "minecraft:icon": { "textures": { "default": "ns_light_post_item" } },
      "minecraft:block_placer": { "block": "ns:light_post", "replace_block_item": true },
      "minecraft:max_stack_size": 64
    }
  }
}
```

The icon key goes in `RP/textures/item_texture.json`, not `terrain_texture.json`. The 2024 "CustomizingItemForABlock" page still says `replace_block_item` and `item_visual` need Upcoming Creator Features. Newer official samples use both without it, and `item_visual` has a format requirement (1.21.60) instead of an experiment. `block_placer` also has `aligned_placement` (format 1.26.0+), which keeps placement aligned while the use button is held.

**`item_display_transforms`** (in the geometry file, geometry format 1.21.0+): per-context `translation`, `rotation`, `scale`, `rotation_pivot`, `scale_pivot` for `gui`, `firstperson_righthand`, `firstperson_lefthand`, `thirdperson_righthand`, `thirdperson_lefthand`, `ground`, `fixed` (item frame), `head`, `embedded`, `shelf` (`shelf` added in 26.40; for older content `fixed` is copied to `shelf`). `gui` also takes `fit_to_frame` (default true; it can't be turned off to draw larger than the slot from 1.21.130). Ranges: translation and pivots ±80, rotation ±360, scale 0 to 4. Vanilla defaults:

```json
"item_display_transforms": {
  "gui": { "translation": [0, 0, 0], "rotation": [30, 225, 0], "scale": [0.625, 0.625, 0.625] },
  "firstperson_righthand": { "translation": [0, 0, 0], "rotation": [0, 45, 0], "scale": [0.4, 0.4, 0.4] },
  "thirdperson_righthand": { "translation": [0, 2.5, 0], "rotation": [75, 45, 0], "scale": [0.375, 0.375, 0.375] },
  "ground": { "translation": [0, 3.0, 0], "rotation": [0, 0, 0], "scale": [0.25, 0.25, 0.25] },
  "fixed": { "translation": [0, 0, 0], "rotation": [0, 0, 0], "scale": [0.5, 0.5, 0.5] }
}
```

The docs page and the 1.21.20 notes say `item_display_transforms` needs Upcoming Creator Features. Later notes (1.21.130, 26.40, 26.50) change and fix it in the normal technical sections without mentioning an experiment, and no changelog says it was released. Treat it as unconfirmed for shipped content and test it in a world without experiments.

**`minecraft:embedded_visual`** (format 1.21.120+): `geometry` + `material_instances` used when the block is drawn inside another block (a flower pot). Pair it with `"minecraft:flower_pottable": {}` (root components only, never in permutations).

## 8. `minecraft:transformation`

```json
"minecraft:transformation": { "rotation": [0, 90, 0], "translation": [0, 0, 0], "scale": [1, 1, 1], "rotation_pivot": [0, 0, 0], "scale_pivot": [0, 0, 0] }
```

Rotation is in steps of 90 degrees. Pivots need format 1.21.0+. It moves the rendered geometry. The official torch example also relies on it rotating the collision and selection boxes: it defines one wall-torch box and rotates it per face. Voxel shapes rotate with it too, and `redstone_producer.transform_relative` rotates the producer's faces with it.
