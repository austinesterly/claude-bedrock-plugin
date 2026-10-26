# Behavior components in practice

How to use each behavior component, with values that load at format 1.26.50. For every field and default see `../../bedrock-json-reference/references/blocks.md`. Sources: the MS Learn `BlockComponents/*.md` pages and component schemas, vanilla 1.26.50.4 `behavior_pack/blocks`, update notes 1.26.0 to 1.26.40, and changelogs 26.40 to 26.60.30.

## Shape: collision and selection

```json
"minecraft:collision_box": [
  { "origin": [-8, 0, -8], "size": [16, 2, 16] },
  { "origin": [-2, 2, -2], "size": [4, 14, 4] }
],
"minecraft:selection_box": { "origin": [-8, 0, -8], "size": [16, 16, 16] }
```

| | `collision_box` | `selection_box` |
|---|---|---|
| Purpose | what entities bump into | the outline and what the cursor can hit |
| Forms | `true` (full), `false` (walk through), **array of boxes** | `true`, `false` (can't be targeted), one box |
| Range | origin+size within x/z -8 to 8 and y 0 to 24 | x/z -8 to 8, y 0 to 16 |
| Format | arrays at any format since game 1.26.0. At **format 1.26.60 a single object is rejected** | unchanged |

- The `min`/`max` box form (corner coordinates 0 to 16) needs Upcoming Creator Features in 26.60. Stay on `origin`/`size`.
- Vanilla 1.26.50 files still use the single-object form. Don't copy that shape into new files.
- `minecraft:transformation` rotates the boxes along with the model (the official torch example relies on this).
- `collision_box: false` with the default selection box gives a plant you can walk through and still break.

## Mining, tools and explosions

```json
"minecraft:destructible_by_mining": { "seconds_to_destroy": 3 },
"minecraft:destructible_by_explosion": { "explosion_resistance": 6 },
"minecraft:tags": ["minecraft:is_pickaxe_item_destructible"]
```

- `seconds_to_destroy` is the time with base equipment. `0` breaks instantly. `false` means it can't be mined at all (like bedrock); `true` uses the default. Vanilla reference values: concrete slab 1.8, wool 0.8, plants 0.
- `explosion_resistance`: 0 explodes easily. Vanilla concrete is 1.8, wool 0.8. `false` makes the block immune to explosions.
- **Tool speed comes from tags.** `minecraft:is_pickaxe_item_destructible`, `is_hatchet_item_destructible` (axes), `is_shovel_item_destructible`, `is_hoe_item_destructible`, `is_sword_item_destructible`, `is_shears_item_destructible` and `is_mace_item_destructible` make that tool mine the block faster. The 26.50 changelog confirms this for shears, "matching the behavior of the other is_*_item_destructible tags". Tier tags exist (`minecraft:stone_tier_destructible`, `iron_tier_destructible`, `diamond_tier_destructible`, `netherite_tier_destructible`, `is_item_tier_destructible`), but the docs don't describe what they change, so test before relying on them.
- Vanilla's "needs the right tool to drop" (`requires_correct_tool_for_drops`) lives in `internal_vanilla_data` and isn't available to custom blocks. Get the same effect in script: give the block an empty loot table (`{}`), then in `onPlayerBreak` check the held tool and spawn the drop yourself.
- `item_specific_speeds` (per item or item-tag destroy speed) is still marked "requires Upcoming Creator Features" in the docs, and no changelog has released it. Leave it out of shipped content.
- `minecraft:destroy_time` and `minecraft:explosion_resistance` are legacy components for format < 1.19.40. Don't use them.

## Movement and physics

| Component | Example | Notes |
|---|---|---|
| `minecraft:friction` | `0.4` | range 0.0 to 0.9, default 0.4. The docs give lower = slipperier (ice uses 0.02) |
| `minecraft:movable` | `{"movement_type": "push_pull", "sticky": "none"}` | `push_pull` (default), `push`, `popped` (breaks and drops), `immovable`. `sticky: "same"` moves neighbours like slime (only with `push_pull`). Format 1.21.100+. Required on multi-blocks (`popped`/`immovable`) |
| `minecraft:entity_fall_on` | `{"minimum_fall_distance": 2}` | only sets when `onEntityFallOn` fires (default 1 block). The field table lists both `min_fall_distance` and `minimum_fall_distance`, but the sample uses `minimum_fall_distance` |
| `minecraft:random_offset` | `{"x": {"range": {"min": -4, "max": 4}, "steps": 0}, "z": {"range": {"min": -4, "max": 4}, "steps": 0}}` | position-seeded offset of the visual, outline and collision (format 1.21.100+). Clamped to stay in the cube. Units assumed to be pixels (the docs don't say) |
| `minecraft:support` | `{"shape": "stair"}` or `"fence"` | support shape other blocks see. Without it a block gives full-cube support. Stable at format 1.26.0+ |
| `minecraft:replaceable` | `{}` | other blocks can be placed into this one, like grass. Root components only on multi-blocks. Replacing it doesn't fire `onBreak` |
| `minecraft:leashable` | schema field `offset` (number array) | leads can tie to it (format 1.26.0+). The docs have no example, so check `bedrock-json-reference` |

## Light

```json
"minecraft:light_emission": 15,
"minecraft:light_dampening": 0
```

- `light_emission` 0 to 15, an integer (strict at 1.26.20). Reference values: torch 14, glowstone 15, redstone torch 7, soul torch 10. Monsters can't spawn on blocks at light 8 or above.
- `light_dampening` 0 to 15: 15 blocks light fully (stone), 0 lets it through (glass), leaves use 1, water 2. The docs don't state the default for custom blocks. Set it to 0 on glass, plants, slabs and anything that isn't a full opaque cube, or the block casts a full-block shadow.
- `minecraft:block_light_emission` and `minecraft:block_light_absorption` are the legacy (< 1.19.40) names.
- Per-state light (a lamp) means putting `light_emission` in permutations (`templates/state_lamp`).

## Map, particles, name, sound

```json
"minecraft:map_color": "#5f4a2b",
"minecraft:destruction_particles": { "texture": "ns_ore", "tint_method": "none", "particle_count": 48 },
"minecraft:display_name": "tile.ns:ore.name",
"minecraft:sound": { "sound": "metal" }
```

- Without `map_color` the block doesn't show on maps. It also accepts `[R, G, B]` or `{"color": "#639f28", "tint_method": "default_foliage"}` (biome-tinted, format 1.21.80+).
- `destruction_particles`: `particle_count` up to 255 (default 100), `texture` is a terrain key, `tint_method` as in material instances (format 1.21.80+).
- Names: without `minecraft:display_name` the block uses `tile.<id>.name` from `en_US.lang`. `display_name` takes a lang key or literal text. Since 26.50, blocks without `display_name` whose lang value chains to another key show the raw text, so use `display_name` if you chain keys.
- `minecraft:sound` (format 1.26.20+, released in 26.50) sets the sound set per block or per permutation. A `blocks.json` `sound` for the same block overrides it.
- `minecraft:instrument_sound` (released in 26.40): `{"up": "note.xylophone", "down": "note.none"}` is what a note block plays when it's above or below this block. Values run from `note.harp` to `note.piglin` (see the reference).

## Loot

```json
"minecraft:loot": "loot_tables/blocks/ns_ore.json"
```

The path is from the BP root, at most 256 characters. With no `minecraft:loot` the block drops itself. `{}` as the table drops nothing (vanilla `loot_tables/empty.json`). Ore-style table:

```json
{
  "pools": [{
    "rolls": 1,
    "entries": [{
      "type": "item", "name": "ns:raw_gem", "weight": 1,
      "functions": [{ "function": "set_count", "count": { "min": 1, "max": 3 } }, { "function": "explosion_decay" }]
    }]
  }]
}
```

Loot can differ per permutation (crop stages, `templates/berry_crop`). Loot tables written at format 1.26.60 keep applying functions after a count reaches 0.

## Fire

```json
"minecraft:flammable": { "catch_chance_modifier": 30, "destroy_chance_modifier": 60, "lava_flammable": "always" }
```

`true` uses the plank defaults (5/20). `false` or leaving it out means neighbouring fire can't spread to it, though it can still be lit directly. `destroy_chance_modifier: 0` with catch > 0 burns forever, like netherrack. `lava_flammable` takes `"always"` or `"never"` (default `never`, format 1.26.30+). The field table says "Boolean", but the 1.26.30 notes and vanilla wool use the strings.

## Placement rules

```json
"minecraft:placement_filter": {
  "conditions": [
    { "allowed_faces": ["up"], "block_filter": ["minecraft:farmland", { "tags": "query.any_tag('minecraft:crop')" }] }
  ]
}
```

- If no condition is met, the block can't be placed. If the condition stops being true later (the support block is removed), the block pops off as an item.
- `allowed_faces`: `up`, `down`, `north`, `south`, `east`, `west`, plus `side` (any horizontal face, used by the torch example).
- `block_filter` entries are block names or block descriptors (`{"name": ..., "states": {...}}` or `{"tags": "query.any_tag(...)"}`). Up to 64 conditions and 64 filters.
- To place on water (a lily-pad-like block), the item needs `minecraft:liquid_clipped: true` plus `minecraft:block_placer` with `replace_block_item: true` (fixed in 26.10).

## Liquids and waterlogging

```json
"minecraft:liquid_detection": {
  "detection_rules": [
    { "liquid_type": "water", "can_contain_liquid": true, "on_liquid_touches": "blocking", "use_liquid_clipping": true }
  ]
}
```

- Only `water` is supported. `can_contain_liquid: true` makes the block waterloggable. Vanilla slabs and stairs set it, and so does `templates/half_slab`.
- `on_liquid_touches`: `blocking` (default), `broken`, `popped` (breaks and drops, like plants), `no_reaction` (water flows through it visually).
- `stops_liquid_flowing_from_direction`: directions the contained water can't flow out of.
- `use_liquid_clipping` (format 1.26.0+, default **false** at 1.26.0+): clips the water's surface to the collision shape.
- An empty `detection_rules` array is a load error since 26.10.
- Snow: `"minecraft:precipitation_interactions": {"precipitation_behavior": "snowlogging"}` lets snow layers share the block (format 1.21.120+, renamed from `snow_log_no_collision` at 1.26.30). Other values: `obstruct_rain`, `obstruct_rain_accumulate_snow`, `none`.

## Redstone

```json
"minecraft:redstone_conductivity": { "redstone_conductor": true, "allows_wire_to_step_down": true },
"minecraft:redstone_consumer": { "min_power": 0, "propagates_power": false },
"minecraft:redstone_producer": { "power": 15, "connected_faces": ["north", "south", "east", "west"], "strongly_powered_face": "down", "transform_relative": true }
```

- `redstone_conductivity`: whether the block can be powered like stone. Defaults are conductor false and step-down true.
- `redstone_consumer` (root components only, stable at format 1.26.0+): it sends `onRedstoneUpdate` to custom components when the signal is at least `min_power`. With `min_power` above 0 you never hear about power going off, so use 0 and read `event.powerLevel`. The field was renamed from `propogates_power` to `propagates_power` in 1.26.0.
- `redstone_producer` (format 1.21.120+): `power` 0 to 15, `connected_faces`, `strongly_powered_face`, and `transform_relative` (rotate those faces with `minecraft:transformation`). Put it in a permutation to make the output depend on a state (see the lever and pressure plate recipes).

## Ticking

| Need | JSON | Script hook |
|---|---|---|
| Regular timer | `"minecraft:tick": {"interval_range": [20, 60], "looping": true}` | `onTick`. A block with an `onTick` component but no `minecraft:tick` is a content error |
| One delayed tick | `"minecraft:tick": {"interval_range": [40, 40], "looping": false}` | `onTick` once |
| Random growth like crops | nothing in JSON | `onRandomTick`, driven by the `randomTickSpeed` game rule |
| Named, scheduled ticks | n/a | `Block.scheduleNamedTick` + `onNamedTick` are **beta** in 26.60 |
| Reacting to neighbours | `minecraft:neighbor_change` is **experimental** (format 1.26.60 + Upcoming Creator Features) | `onNeighborChanged` is beta |

`interval_range` is in game ticks (20 per second), both values min ≤ max. `minecraft:queued_ticking` and `minecraft:random_ticking` (event-trigger versions) are deprecated. 26.40 fixed blocks placed from structures ticking too often.

## Containers and crafting

- `"minecraft:crafting_table": {"crafting_tags": ["crafting_table", "ns:workbench"], "table_name": "tile.ns:workbench.name"}` opens the crafting grid. Recipes whose `tags` include one of these strings are craftable on it. Up to 64 tags of up to 64 characters each.
- `minecraft:chest_obstruction` (format 1.26.20+): `{"obstruction_rule": "never"}` lets a chest below it open. Other values are `always` and `shape` (the default, which uses the block's box).
- Storage containers (`block_entity.container`, up to 54 slots, and the `title` field) are **experimental** in 26.50/26.60. For storage in a stable pack, a common workaround (not from the block docs) is an invisible entity with `minecraft:inventory` placed on the block (see `bedrock-entity-behavior`).

## Connections to vanilla fences and panes

`"minecraft:connection_rule": {"accepts_connections_from": "only_fences", "enabled_directions": ["north", "south"]}` (format 1.26.0+) controls which vanilla connecting blocks (fences, walls, bars, panes) attach to this block. Values are `all` (default), `none` and `only_fences` (every vanilla fence except nether brick). `enabled_directions` is ignored when the value is `none`. Vanilla plants use `none`. For your own block to connect, use the `minecraft:connection` trait.

## Block entities and block dynamic properties

```json
"minecraft:block_entity": { "dynamic_properties": true }
```

- No experiment needed from **format 1.26.20**. It gives each placed block its own storage. Script: `block.getComponent("minecraft:dynamic_properties")` returns `BlockDynamicPropertiesComponent` with `get(key)`, `set(key, value)` (boolean, number, string, Vector3; `undefined` deletes) and `totalByteCount()`. The `@minecraft/server` API is stable in 2.10.0.
- The limit is **1 KB per content pack per block entity**. Keys are private to each pack. Changing only the block's state keeps the data. Replacing it with a different block creates a new, empty block entity (26.50).
- Multi-blocks: each part has its own block entity (26.50). On item stacks, `ItemBlockDynamicPropertiesComponent` (`minecraft:block_actor_dynamic_properties`, renamed `minecraft:block_dynamic_properties` in Preview 26.70.21, where it also stops working on vanilla items) reads and writes a block item's stored properties.
- Use it for per-block counters, owners and settings. Each block entity costs memory, so don't add it to terrain blocks placed by the thousand.

```js
blockComponentRegistry.registerCustomComponent("ns:remember_visitor", {
  onPlayerInteract(e) {
    const props = e.block.getComponent("minecraft:dynamic_properties");
    if (!props || !e.player) return;
    const last = props.get("last_visitor");
    e.player.sendMessage(typeof last === "string" ? `Last visitor: ${last}` : "First visitor!");
    props.set("last_visitor", e.player.name);
  },
});
```

## Script events (block custom components)

Register in `system.beforeEvents.startup` with `blockComponentRegistry.registerCustomComponent("ns:id", {...})` and attach with `"ns:id": { ...params }` in `components` or a permutation. Each callback gets `(event, { params })`. Full patterns are in `bedrock-scripting`.

| Hook (`@minecraft/server` 2.10.0) | Fires when | Needs in JSON |
|---|---|---|
| `beforeOnPlayerPlace` | before a player places it. Set `event.cancel = true` or change `event.permutationToPlace` | - |
| `onPlace` | placed by any means | - |
| `onPlayerInteract` | a player uses the block (`event.player`, `face`, `faceLocation`) | - |
| `onPlayerBreak` / `onBreak` | a player breaks it / it's destroyed (not by state changes; `/fill`/`/setblock` only in destroy mode; not when a `replaceable` block is replaced) | - |
| `onStepOn` / `onStepOff` | an entity steps on or off | a collision box to stand on |
| `onEntityFallOn` | an entity lands on it | optional `minecraft:entity_fall_on` |
| `onTick` | the timer fires | `minecraft:tick` |
| `onRandomTick` | a random tick | - |
| `onRedstoneUpdate` | the signal changes (`event.powerLevel`) | `minecraft:redstone_consumer` |
| `onBlockStateChange` | the block's permutation changes (`previousPermutation`) | - |
| `onEntity` | an entity sends an event to the block | - |

Official samples call `block.setPermutation(...)` and `dynamicProperties.set(...)` straight from `onPlayerInteract`, `onRedstoneUpdate` and `onRandomTick`, and `set` is marked as not callable in restricted execution, so those callbacks can write. `beforeOnPlayerPlace` is a before-event: change the outcome through its fields. If a write in any callback throws a privilege error, defer it with `system.run(() => ...)`.
