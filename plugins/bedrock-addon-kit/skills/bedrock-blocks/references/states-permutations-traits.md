# States, permutations and traits

Sources: MS Learn `BlockStatesAndPermutations`, `BlockStateAndTraitListings` (2026-06), `traits/*.md`, `intro-block-traits`, `multi-blocks`, update notes 1.26.0 to 1.26.40, changelogs 26.40 to 26.60.30, and the trait schemas (data version 1.26.20).

## 1. Custom states

```json
"description": {
  "identifier": "ns:lamp",
  "states": {
    "ns:lit":   [false, true],
    "ns:level": { "values": { "min": 0, "max": 7 } },
    "ns:color": ["red", "green", "blue"]
  }
}
```

- State names need a namespace (`ns:`), and values are booleans, integers or strings. `{"values": {"min": 0, "max": 3}}` is the same as `[0, 1, 2, 3]`.
- List the value you want on placement first. The templates rely on this (`[0, 1, 2, 3]` places at 0), but the docs never state the default outright.
- The old note that custom states need "Holiday Creator Features" is out of date. States have been released for years, and vanilla 1.26.50 blocks use them.
- Every state multiplies the block's permutation count. A world is capped at **65,536 permutations** across all blocks, and going over blocks Marketplace ingestion (the content log lists the biggest blocks first). A block with a 16-way rotation (16) x an 8-value age (8) x a boolean (2) already has 256.
- Set a state from commands: `/setblock ~ ~ ~ ns:lamp ["ns:lit"=true,"ns:level"=3]`. The states page shows the older `["ns:lit": true]` spelling. From script:

```js
const perm = block.permutation;
block.setPermutation(perm.withState("ns:lit", !perm.getState("ns:lit")));
// new permutation from scratch:
// BlockPermutation.resolve("ns:lamp", { "ns:lit": true, "ns:level": 3 })
```

In TypeScript, `getState`/`withState` are typed against vanilla state names, so a custom state name may need a cast.

## 2. Permutations

```json
"permutations": [
  { "condition": "query.block_state('ns:lit')", "components": { "minecraft:light_emission": 15 } },
  { "condition": "query.block_state('ns:level') >= 4 && !query.block_state('ns:lit')", "components": { "minecraft:light_emission": 7 } }
]
```

- `condition` is Molang that may only use `query.block_state('<name>')` (`q.block_state` also works). Use `==`, `!=`, `<`, `>=`, `&&`, `||` and `!`. Quote strings: `== 'north'`.
- A component in a matching permutation **replaces** the base component of the same name entirely. Arrays such as a `collision_box` list are replaced, not merged. The rest of the base components stay.
- More than one permutation can match at once. Vanilla `shelf_mushroom` relies on this: a loot permutation per growth stage, plus a rotation permutation per growth and direction. Keep two matching permutations from setting the same component, because the docs don't say which one wins.
- A permutation that changes the look should set both `minecraft:geometry` and `minecraft:material_instances`, as vanilla does.
- Not allowed in permutations (root `components` only): `minecraft:redstone_consumer`, `minecraft:flower_pottable` (strict at 1.26.20), and on multi-blocks also `movable`, `placement_filter`, `replaceable`, `random_offset`, and `precipitation_interactions` for vertical multi-blocks.

## 3. Traits overview

Traits sit in `description.traits`. Each has an `enabled_states` array, and the game sets those states on placement (or, for `connection`, on neighbour changes).

| Trait | `enabled_states` | States you query | Other fields | Status |
|---|---|---|---|---|
| `minecraft:placement_direction` | `minecraft:cardinal_direction`, `minecraft:facing_direction`, `minecraft:corner_and_cardinal_direction`, `minecraft:sixteen_way_rotation` | `minecraft:cardinal_direction` (north/south/east/west), `minecraft:facing_direction` (+ up/down), `minecraft:corner` (none/inner_left/inner_right/outer_left/outer_right), `minecraft:sixteen_way_rotation` (0 to 15) | `y_rotation_offset` (0/90/180/270/360), `blocks_to_corner_with` (block descriptors, needs `corner_and_cardinal_direction` at 1.26.20+) | stable; corner since 1.26.0 (inner-corner fix 26.10); 16-way since 26.40 |
| `minecraft:placement_position` | `minecraft:block_face`, `minecraft:vertical_half` | `minecraft:block_face` (the face of the block you clicked: north/south/east/west/up/down), `minecraft:vertical_half` (bottom/top) | none | stable |
| `minecraft:connection` | `minecraft:cardinal_connections` | `minecraft:connection_north/east/south/west` (booleans, updated when neighbours change) | none | stable since 1.26.0 (older trait pages still say it needs an experiment; the 1.26.0 notes released it) |
| `minecraft:multi_block` | `minecraft:multi_block_part` | `minecraft:multi_block_part` (0 to parts-1, 0 = the part placed first) | `parts` 2 to 4 (default 2), `direction` up/down/north/south/east/west (required) | vertical stable at format 1.26.40+, horizontal at 1.26.50+ |

**`cardinal_direction` is the direction the player was facing.** With the default offset 0, a player looking north stores `north`. A model whose front is its north face then points away from the player. Add `"y_rotation_offset": 180.0` so the front faces the player (`templates/facing_machine`). The offset turns the stored direction counter-clockwise: 90 stores `east` for a player facing south. Some doc examples (the "smiley block") skip the offset and would face away, so don't copy their mapping blindly.

**`block_face` is the face of the other block you clicked.** Clicking the top of a block gives `up`, and clicking a block's north side gives `north`. The block is then on that block's north side, so it attaches toward the south. The official torch example rotates north→0, south→180, west→90, east→-90.

**`vertical_half`:** clicking a bottom face, or the upper half of a side face, gives `top`. Otherwise it's `bottom`. Custom slabs don't merge into double slabs by themselves (see recipes).

## 4. Rotation tables (file values for `minecraft:transformation.rotation`)

Positive Y rotation turns north toward west (Minecraft is X east, Y up, Z south). Rotation must be in 90-degree steps.

Cardinal (front = model north face, with `y_rotation_offset: 180.0`, so the front faces the player):

| `minecraft:cardinal_direction` | rotation |
|---|---|
| north | [0, 0, 0] |
| south | [0, 180, 0] |
| west | [0, 90, 0] |
| east | [0, 270, 0] |

Facing direction (observer-like). This is from the official "arrow block", which uses both `cardinal_direction` and `facing_direction` with `y_rotation_offset: 180.0`:

| facing | cardinal | rotation |
|---|---|---|
| north | any | [0, 180, 0] |
| south | any | [0, 0, 0] |
| west | any | [0, -90, 0] |
| east | any | [0, 90, 0] |
| up | north / south / west / east | [90, 180, 0] / [90, 0, 0] / [90, -90, 0] / [90, 90, 0] |
| down | north / south / west / east | [-90, 180, 0] / [-90, 0, 0] / [-90, -90, 0] / [-90, 90, 0] |

(Derived) With that offset, a player facing north stores `south`, and `south` means no rotation, so that example's front must be the model's south face. Swap 0 and 180 (and the two signs of 90) if your front is the north face.

Pillar axis from `block_face` (`templates/pillar_log`): up/down → none, north/south → [90, 0, 0], east/west → [0, 0, 90].

Wall-attached (torch-like) from `block_face`: north [0,0,0], south [0,180,0], west [0,90,0], east [0,-90,0], plus a different geometry and boxes for the side faces.

## 5. 16-way and other visual-only rotation

`minecraft:sixteen_way_rotation` (0 to 15, like a standing sign's 22.5-degree steps) can't be done with `minecraft:transformation`, which only rotates in 90-degree steps. Use `n_way_visual_rotation` on the geometry instead (stable since 26.40, format 1.26.30+). It rotates only the visual, not the collision or interaction. The geometry docs list its supported states as `minecraft:cardinal_direction`, `minecraft:sixteen_way_rotation` and any custom integer state. It isn't allowed on multi-blocks.

**Open question on its JSON shape.** The prose geometry page says `n_way_visual_rotation` is "String: the name of a block state". The generated schema (the one the item_visual and embedded_visual pages use) says it's an object mapping axes to state names: `{"x": "", "y": "", "z": ""}`. No official example shows either. The object form comes from the game's generated schema, so it is the more likely one:

```json
"traits": { "minecraft:placement_direction": { "enabled_states": ["minecraft:sixteen_way_rotation"], "y_rotation_offset": 180.0 } }
```
```json
"minecraft:geometry": {
  "identifier": "geometry.ns.statue",
  "n_way_visual_rotation": { "y": "minecraft:sixteen_way_rotation" }
}
```

If the content log rejects it, try the string form `"n_way_visual_rotation": "minecraft:sixteen_way_rotation"`. Test before relying on it, and record which form loaded. 26.60 fixes these states not syncing to clients in multiplayer.

## 6. Multi-blocks (doors, beds, tall plants, horizontal logs)

```json
"traits": {
  "minecraft:placement_direction": { "enabled_states": ["minecraft:cardinal_direction"] },
  "minecraft:multi_block": { "enabled_states": ["minecraft:multi_block_part"], "parts": 2, "direction": "up" }
}
```

Rules (from the trait page and the 26.40/26.50 changelogs):
- `minecraft:movable` is required in the base components, with `movement_type` `popped` or `immovable`.
- The only other trait allowed is `placement_direction`, and only with `minecraft:cardinal_direction`. That rules out `connection`, `placement_position`, `corner`, `facing` and 16-way.
- No `n_way_visual_rotation`. `placement_filter`, `replaceable` and `random_offset` are allowed only in the base components. `random_offset` only works on vertical multi-blocks, and vertical multi-blocks can't put `precipitation_interactions` in permutations.
- `minecraft:block_entity` is allowed since 26.50, and each part gets its own block entity.
- Breaking any part breaks all of them. Scripts get one `onBreak` for the part broken first. `block.getParts()` (stable in 2.9.0+) returns every part, or `undefined` for a block that isn't a multi-block. Player and redstone interactions on one part act on the whole block.
- Horizontal directions: if `placement_direction` with `cardinal_direction` is present, the player's facing overrides `direction`. Placement into an unloaded chunk is delayed and saved until both chunks load. In a rotated structure the parts only rotate correctly when `cardinal_direction` is enabled.
- Without a `minecraft:selection_box`, each part gets a full-block outline. `/fill`, `Dimension.fillBlocks` and the `minecraft:multi_block_feature` world-gen feature place all parts.
- A complete door built this way is in `recipes-for-common-blocks.md`.

## 7. Intrinsic and vanilla states

Vanilla blocks have their own states (`age`, `growth` 0 to 7, `direction` 0 to 3, `facing_direction` 0 to 5, `ground_sign_direction` 0 to 15, ...). These names can't be added to custom blocks. Custom blocks get only their own namespaced states plus the trait states above. Since 26.40 and 26.50, vanilla fences, panes, iron bars, tripwire, chorus, fire and stairs expose `minecraft:connection_*` and `minecraft:corner`, which scripts can read. That helps custom blocks react to vanilla neighbours.
