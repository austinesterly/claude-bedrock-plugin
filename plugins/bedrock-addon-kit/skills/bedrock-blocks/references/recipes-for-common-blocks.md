# Recipes for common block types

Each recipe combines released features at format 1.26.50 (namespace `ns`). The templates folder has eight complete, validated examples. These recipes are the next step up. Snippets show only the parts that differ from a basic block (`geometry` + `material_instances` + mining + map color + `menu_category`). Recipes marked **(untested pattern)** follow the documented fields but haven't been seen working in game. Test those before you ship them.

Index: [door](#door-two-part-multi-block) · [trapdoor](#trapdoor) · [stairs](#stairs) · [fence](#fence) · [double slab](#double-slab) · [torch / wall attachment](#torch-and-wall-attachment) · [ore](#ore) · [crop with seeds](#crop-with-a-seeds-item) · [leaves](#leaves) · [redstone lamp](#redstone-lamp) · [lever / pressure plate](#lever-and-pressure-plate) · [timer block](#timer-block) · [crafting station](#crafting-station) · [flower-pot plant](#flower-pot-plant) · [sixteen-way statue](#sixteen-way-statue) · [oversized decoration](#oversized-decoration)

## Door (two-part multi-block)

Built the way the official multi-block light post is: the trait places both parts, a state holds open/closed, and a script flips every part.

`RP/models/blocks/door.geo.json`:

```json
{
  "format_version": "1.12.0",
  "minecraft:geometry": [
    {
      "description": { "identifier": "geometry.ns.door_closed", "texture_width": 16, "texture_height": 16 },
      "bones": [{ "name": "panel", "pivot": [0, 0, 0], "cubes": [{ "origin": [-8, 0, -8], "size": [16, 16, 3], "uv": {
        "north": { "uv": [0, 0], "uv_size": [16, 16] }, "south": { "uv": [0, 0], "uv_size": [16, 16] },
        "east": { "uv": [0, 0], "uv_size": [3, 16] }, "west": { "uv": [0, 0], "uv_size": [3, 16] },
        "up": { "uv": [0, 0], "uv_size": [16, 3] }, "down": { "uv": [0, 0], "uv_size": [16, 3] } } }] }]
    },
    {
      "description": { "identifier": "geometry.ns.door_open", "texture_width": 16, "texture_height": 16 },
      "bones": [{ "name": "panel", "pivot": [0, 0, 0], "cubes": [{ "origin": [-8, 0, -8], "size": [3, 16, 16], "uv": {
        "north": { "uv": [0, 0], "uv_size": [3, 16] }, "south": { "uv": [0, 0], "uv_size": [3, 16] },
        "east": { "uv": [0, 0], "uv_size": [16, 16] }, "west": { "uv": [0, 0], "uv_size": [16, 16] },
        "up": { "uv": [0, 0], "uv_size": [3, 16] }, "down": { "uv": [0, 0], "uv_size": [3, 16] } } }] }]
    }
  ]
}
```

`BP/blocks/door.json` (the four part/open permutations each set the look and the boxes; the four direction permutations only rotate):

```json
{
  "format_version": "1.26.50",
  "minecraft:block": {
    "description": {
      "identifier": "ns:door",
      "menu_category": { "category": "construction" },
      "states": { "ns:open": [false, true] },
      "traits": {
        "minecraft:placement_direction": { "enabled_states": ["minecraft:cardinal_direction"], "y_rotation_offset": 180.0 },
        "minecraft:multi_block": { "enabled_states": ["minecraft:multi_block_part"], "parts": 2, "direction": "up" }
      }
    },
    "components": {
      "minecraft:geometry": "geometry.ns.door_closed",
      "minecraft:material_instances": { "*": { "texture": "ns_door_lower", "render_method": "alpha_test" } },
      "minecraft:collision_box": [{ "origin": [-8, 0, -8], "size": [16, 16, 3] }],
      "minecraft:selection_box": { "origin": [-8, 0, -8], "size": [16, 16, 3] },
      "minecraft:movable": { "movement_type": "popped" },
      "minecraft:light_dampening": 0,
      "minecraft:destructible_by_mining": { "seconds_to_destroy": 3 },
      "minecraft:tags": ["minecraft:is_hatchet_item_destructible"],
      "ns:door_toggle": {}
    },
    "permutations": [
      { "condition": "q.block_state('minecraft:multi_block_part') == 0 && !q.block_state('ns:open')", "components": {
        "minecraft:geometry": "geometry.ns.door_closed",
        "minecraft:material_instances": { "*": { "texture": "ns_door_lower", "render_method": "alpha_test" } } } },
      { "condition": "q.block_state('minecraft:multi_block_part') == 1 && !q.block_state('ns:open')", "components": {
        "minecraft:geometry": "geometry.ns.door_closed",
        "minecraft:material_instances": { "*": { "texture": "ns_door_upper", "render_method": "alpha_test" } } } },
      { "condition": "q.block_state('minecraft:multi_block_part') == 0 && q.block_state('ns:open')", "components": {
        "minecraft:geometry": "geometry.ns.door_open",
        "minecraft:material_instances": { "*": { "texture": "ns_door_lower", "render_method": "alpha_test" } },
        "minecraft:collision_box": [{ "origin": [-8, 0, -8], "size": [3, 16, 16] }],
        "minecraft:selection_box": { "origin": [-8, 0, -8], "size": [3, 16, 16] } } },
      { "condition": "q.block_state('minecraft:multi_block_part') == 1 && q.block_state('ns:open')", "components": {
        "minecraft:geometry": "geometry.ns.door_open",
        "minecraft:material_instances": { "*": { "texture": "ns_door_upper", "render_method": "alpha_test" } },
        "minecraft:collision_box": [{ "origin": [-8, 0, -8], "size": [3, 16, 16] }],
        "minecraft:selection_box": { "origin": [-8, 0, -8], "size": [3, 16, 16] } } },
      { "condition": "q.block_state('minecraft:cardinal_direction') == 'south'", "components": { "minecraft:transformation": { "rotation": [0, 180, 0] } } },
      { "condition": "q.block_state('minecraft:cardinal_direction') == 'west'",  "components": { "minecraft:transformation": { "rotation": [0, 90, 0] } } },
      { "condition": "q.block_state('minecraft:cardinal_direction') == 'east'",  "components": { "minecraft:transformation": { "rotation": [0, 270, 0] } } }
    ]
  }
}
```

```js
blockComponentRegistry.registerCustomComponent("ns:door_toggle", {
  onPlayerInteract(e) {
    const open = e.block.permutation.getState("ns:open");
    for (const part of e.block.getParts() ?? [e.block]) {
      part.setPermutation(part.permutation.withState("ns:open", !open));
    }
  },
});
```

- Hinge side, sounds on toggle (`dimension.playSound`) and opening on a redstone signal (`redstone_consumer` + `onRedstoneUpdate`, as the light post does) are extensions on top of this.

## Trapdoor

States: `placement_position` → `minecraft:vertical_half` (whether it hangs from the top or sits on the bottom), `placement_direction` → `minecraft:cardinal_direction` (which edge the hinge is on), and `ns:open`. Boxes before rotation:

| State | Collision / selection box |
|---|---|
| closed, bottom | `origin [-8, 0, -8]`, `size [16, 3, 16]` |
| closed, top | `origin [-8, 13, -8]`, `size [16, 3, 16]` |
| open (either half) | `origin [-8, 0, -8]`, `size [16, 16, 3]` (against the north edge, then rotated per direction) |

Use one geometry per row (or one geometry plus Molang `bone_visibility` on three bones). Rotate with the cardinal table and toggle `ns:open` with the same component as the door (without `getParts`). **(Untested pattern.)**

## Stairs

```json
"traits": {
  "minecraft:placement_position": { "enabled_states": ["minecraft:vertical_half"] },
  "minecraft:placement_direction": {
    "enabled_states": ["minecraft:corner_and_cardinal_direction"],
    "blocks_to_corner_with": [{ "tags": "q.any_tag('minecraft:cornerable_stairs')" }]
  }
},
"components": {
  "minecraft:geometry": "geometry.ns.stairs_bottom",
  "minecraft:material_instances": { "*": { "texture": "ns_stairs", "render_method": "opaque" } },
  "minecraft:collision_box": [
    { "origin": [-8, 0, -8], "size": [16, 8, 16] },
    { "origin": [-8, 8, -8], "size": [16, 8, 8] }
  ],
  "minecraft:support": { "shape": "stair" },
  "minecraft:liquid_detection": { "detection_rules": [{ "liquid_type": "water", "can_contain_liquid": true, "on_liquid_touches": "blocking" }] },
  "minecraft:light_dampening": 0
}
```

- The base shape has its step at the north half (-Z), which is the direction a player walks to climb it. With offset 0, `cardinal_direction` is the player's facing, so rotate north 0, south 180, west 90, east 270.
- `vertical_half == 'top'`: swap to an upside-down geometry and boxes `[{"origin": [-8,8,-8], "size": [16,8,16]}, {"origin": [-8,0,-8], "size": [16,8,8]}]`.
- `minecraft:corner` (`none`, `inner_left`, `inner_right`, `outer_left`, `outer_right`): each value needs its own geometry and box set (inner adds a quarter block, outer removes one). That's 5 corners x 4 directions x 2 halves = 40 combinations, so use one permutation per corner and half for the look and keep rotation in four direction permutations. Custom stairs corner with vanilla stairs outside Beta since 26.40. `blocks_to_corner_with` needs `corner_and_cardinal_direction` enabled (strict at 1.26.20). The default is to corner with the same block. The `minecraft:cornerable_stairs` tag comes from the official example.
- Vanilla 1.26.50 stairs also set `"minecraft:chest_obstruction": {"obstruction_rule": "never"}` and `"minecraft:redstone_conductivity": {"redstone_conductor": false, "allows_wire_to_step_down": true}`. **(Corner shapes are an untested pattern.)**

## Fence

```json
"traits": { "minecraft:connection": { "enabled_states": ["minecraft:cardinal_connections"] } },
"components": {
  "minecraft:geometry": {
    "identifier": "geometry.ns.fence",
    "bone_visibility": {
      "arm_north": "query.block_state('minecraft:connection_north')",
      "arm_south": "query.block_state('minecraft:connection_south')",
      "arm_east":  "query.block_state('minecraft:connection_east')",
      "arm_west":  "query.block_state('minecraft:connection_west')"
    }
  },
  "minecraft:material_instances": { "*": { "texture": "ns_fence", "render_method": "opaque" } },
  "minecraft:collision_box": [{ "origin": [-2, 0, -2], "size": [4, 24, 4] }],
  "minecraft:selection_box": { "origin": [-2, 0, -2], "size": [4, 16, 4] },
  "minecraft:support": { "shape": "fence" },
  "minecraft:connection_rule": { "accepts_connections_from": "only_fences" },
  "minecraft:light_dampening": 0
}
```

- The geometry has a `post` bone plus `arm_north/south/east/west` bones reaching to the block edges. Bone visibility uses Molang because booleans regressed in 26.50.
- Collision here covers only the 24 px post. For arms that block players, add permutations whose `collision_box` arrays include an arm box per connected side. A permutation replaces the whole array, so each combination of connections needs its own complete list.
- The docs don't say which neighbours the `connection` trait connects to. Test against your own fence, vanilla fences and full blocks. **(Untested pattern.)**

## Double slab

Custom slabs (`templates/half_slab`) don't merge into a double slab. One documented way to build it: add `"ns:double": [false, true]` and a permutation with a full-block geometry and a full collision box. Then, in `beforeOnPlayerPlace` of the slab, detect that the player is placing the slab into a half that already holds a slab: set `event.cancel = true` and switch the existing block to `ns:double = true`. Make the double version drop two slabs with a permutation loot table (`set_count` 2). **(Untested pattern.)** Check carefully which block and face the event reports before writing code.

## Torch and wall attachment

From the official placement_position torch, updated to array collision:

```json
"traits": { "minecraft:placement_position": { "enabled_states": ["minecraft:block_face"] } },
"components": {
  "minecraft:geometry": "geometry.ns.torch",
  "minecraft:material_instances": { "*": { "texture": "ns_torch", "render_method": "alpha_test_single_sided", "ambient_occlusion": 0.0 } },
  "minecraft:collision_box": false,
  "minecraft:selection_box": { "origin": [-1, 0, -1], "size": [2, 10, 2] },
  "minecraft:placement_filter": { "conditions": [{ "allowed_faces": ["up", "side"] }] },
  "minecraft:light_emission": 14,
  "minecraft:light_dampening": 0
},
"permutations": [
  { "condition": "query.block_state('minecraft:block_face') == 'south'", "components": { "minecraft:transformation": { "rotation": [0, 180, 0] } } },
  { "condition": "query.block_state('minecraft:block_face') == 'west'",  "components": { "minecraft:transformation": { "rotation": [0, 90, 0] } } },
  { "condition": "query.block_state('minecraft:block_face') == 'east'",  "components": { "minecraft:transformation": { "rotation": [0, -90, 0] } } },
  { "condition": "query.block_state('minecraft:block_face') != 'up' && query.block_state('minecraft:block_face') != 'down'", "components": {
    "minecraft:geometry": "geometry.ns.wall_torch",
    "minecraft:material_instances": { "*": { "texture": "ns_torch", "render_method": "alpha_test_single_sided", "ambient_occlusion": 0.0 } },
    "minecraft:selection_box": { "origin": [-2, 3, 4], "size": [4, 10, 4] } } }
]
```

The wall geometry leans toward +Z (the side touching the block it was placed against when `block_face` is `north`). The placement filter pops the torch if its support is removed.

## Ore

```json
"minecraft:destructible_by_mining": { "seconds_to_destroy": 3 },
"minecraft:destructible_by_explosion": { "explosion_resistance": 3 },
"minecraft:tags": ["minecraft:is_pickaxe_item_destructible"],
"minecraft:loot": "loot_tables/blocks/ns_gem_ore.json"
```

The loot table drops the gem with `set_count` `{min, max}` and `explosion_decay` (see `components-in-practice.md`). Tool tiers and "no drop without a pickaxe" aren't data-driven for custom blocks (see components-in-practice, Mining). Generating ores in the world is a features/feature-rules job, outside this skill.

## Crop with a seeds item

Start from `templates/berry_crop`. To plant it from a seeds item instead of the block item:

```json
{
  "format_version": "1.26.50",
  "minecraft:item": {
    "description": { "identifier": "ns:berry_seeds", "menu_category": { "category": "nature" } },
    "components": {
      "minecraft:icon": { "textures": { "default": "ns_berry_seeds" } },
      "minecraft:block_placer": { "block": "ns:berry_crop", "use_on": ["minecraft:farmland"] }
    }
  }
}
```

- Set the crop block's `menu_category` to `{"category": "none"}` so only the seeds appear in the menu. Change the loot tables to drop `ns:berry_seeds`.
- `use_on` takes block names or descriptors (empty = any block; the item reference's sample is `["dirt", "grass"]`). The crop's placement filter enforces farmland either way. Vanilla 1.26.50 items such as `red_shrub` use `block_placer` with `replace_block_item: true` at item format 1.26.50.
- Harvest without breaking: add an `onPlayerInteract` that, at the last stage, spawns the produce and sets the state back to 0. Bone meal: in `onPlayerInteract`, check the held item (`player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand)`) and advance a stage. Consuming the bone meal is inventory code (see `bedrock-scripting`).
- Vanilla has the `minecraft:crop` block tag. The docs don't say what it changes for custom blocks.

## Leaves

```json
"minecraft:geometry": "minecraft:geometry.full_block",
"minecraft:material_instances": { "*": { "texture": "ns_leaves", "render_method": "alpha_test_to_opaque", "tint_method": "default_foliage" } },
"minecraft:map_color": { "color": "#ffffff", "tint_method": "default_foliage" },
"minecraft:light_dampening": 1,
"minecraft:flammable": { "catch_chance_modifier": 30, "destroy_chance_modifier": 60 },
"minecraft:tags": ["minecraft:leaves", "minecraft:is_shears_item_destructible", "minecraft:is_hoe_item_destructible"]
```

- Paint the texture in greyscale when you use a `tint_method`.
- Since 26.50, vanilla tree features grow through any block tagged `minecraft:leaves`. Decay and leaf drops need script (`onRandomTick` + a distance search).
- Grouping leaves for culling (`culling_layer: "minecraft:culling_layer.leaves"`) is still experimental.

## Redstone lamp

```json
"description": { "identifier": "ns:redstone_lamp", "states": { "ns:lit": [false, true] } },
"components": {
  "minecraft:redstone_consumer": { "min_power": 0 },
  "minecraft:redstone_conductivity": { "redstone_conductor": true },
  "ns:redstone_lit": {}
},
"permutations": [
  { "condition": "q.block_state('ns:lit')", "components": {
    "minecraft:light_emission": 15,
    "minecraft:geometry": "minecraft:geometry.full_block",
    "minecraft:material_instances": { "*": { "texture": "ns_lamp_on", "render_method": "opaque" } } } }
]
```
```js
blockComponentRegistry.registerCustomComponent("ns:redstone_lit", {
  onRedstoneUpdate(e) {
    const lit = e.powerLevel > 0;
    if (e.block.permutation.getState("ns:lit") !== lit) {
      e.block.setPermutation(e.block.permutation.withState("ns:lit", lit));
    }
  },
});
```

`redstone_consumer` only goes in root components. Whether an unpowering update arrives with `powerLevel` 0 at `min_power` 0 follows from the field description, but it hasn't been checked in game.

## Lever and pressure plate

```json
"states": { "ns:on": [false, true] },
"permutations": [
  { "condition": "q.block_state('ns:on')", "components": {
    "minecraft:redstone_producer": { "power": 15, "strongly_powered_face": "down", "transform_relative": true } } }
]
```

- Lever: `onPlayerInteract` toggles `ns:on`.
- Pressure plate: `onStepOn` sets it true, `onStepOff` sets it false (give the plate a thin collision box, `[{"origin": [-7,0,-7], "size": [14,1,14]}]`, so entities step on it).
- **(Untested pattern:** the docs don't say whether `redstone_producer` may appear only in a permutation.)

## Timer block

```json
"minecraft:tick": { "interval_range": [100, 100], "looping": true },
"ns:pulse": {}
```
```js
blockComponentRegistry.registerCustomComponent("ns:pulse", {
  onTick(e) { e.dimension.spawnParticle("minecraft:villager_happy", e.block.center()); },
});
```

Ticking blocks cost server time, so prefer long intervals and random ticks for anything placed in bulk.

## Crafting station

```json
"minecraft:crafting_table": { "crafting_tags": ["ns:workbench"], "table_name": "tile.ns:workbench.name" }
```

Recipes list `"tags": ["ns:workbench"]` to be crafted only on it. Include `"crafting_table"` in `crafting_tags` to also allow vanilla table recipes.

## Flower-pot plant

```json
"minecraft:geometry": "minecraft:geometry.cross",
"minecraft:material_instances": { "*": { "texture": "ns_bloom", "render_method": "alpha_test_single_sided", "ambient_occlusion": 0.0 } },
"minecraft:flower_pottable": {},
"minecraft:embedded_visual": {
  "geometry": "minecraft:geometry.cross",
  "material_instances": { "*": { "texture": "ns_bloom_potted", "render_method": "alpha_test_single_sided" } }
},
"minecraft:collision_box": false,
"minecraft:replaceable": {},
"minecraft:placement_filter": { "conditions": [{ "allowed_faces": ["up"], "block_filter": ["minecraft:grass_block", "minecraft:dirt"] }] },
"minecraft:liquid_detection": { "detection_rules": [{ "liquid_type": "water", "can_contain_liquid": false, "on_liquid_touches": "popped" }] },
"minecraft:precipitation_interactions": { "precipitation_behavior": "snowlogging" },
"minecraft:light_dampening": 0
```

This copies vanilla `red_shrub`, which also sets `movable: popped` and `connection_rule: none`. `flower_pottable` goes in root components only.

## Sixteen-way statue

`placement_direction` with `minecraft:sixteen_way_rotation` plus `n_way_visual_rotation` on the geometry. The JSON shape question is covered in `states-permutations-traits.md` section 5. Keep collision symmetric (or a centred box), because n-way rotation is visual only.

## Oversized decoration

Model up to 30 px (for example a 30x30 umbrella), keep at least 1 px inside the base block on each axis, collision at most 16x24x16 and selection at most 16x16x16 inside the block. Add `culling` rules if parts sit flush with neighbours. Use `item_display_transforms` (geometry format 1.21.0) to shrink it in the hotbar. That field's experiment status is unclear (see geometry-and-materials section 7), and parts outside the base cube overlap neighbouring blocks.
