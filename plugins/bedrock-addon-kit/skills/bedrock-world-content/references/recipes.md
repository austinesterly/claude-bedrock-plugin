# Recipes and the item catalog

BP folder: `recipes/` (any subfolder, any file name; one recipe per file). The identifier in `description.identifier` must be unique across all packs; use your namespace (`ns:ruby_block`). Full field tables: `../../bedrock-json-reference/references/recipes-spawn-trade.md`. Working files: `../templates/recipes/`.

## Which type, which station

| Recipe type key | Station `tags` seen in vanilla 1.26.50 | Newest vanilla format_version | Main fields |
|---|---|---|---|
| `minecraft:recipe_shaped` | `crafting_table` | `1.26.50` | `pattern`, `key`, `result`, `unlock`, `priority`, `group`, `assume_symmetry` |
| `minecraft:recipe_shapeless` | `crafting_table`, `stonecutter`, `cartography_table` | `1.26.50` | `ingredients`, `result`, `unlock`, `priority`, `group` |
| `minecraft:recipe_furnace` | `furnace`, `blast_furnace`, `smoker`, `campfire`, `soul_campfire` | `1.26.50` | `input`, `output`, `unlock`, `priority` |
| `minecraft:recipe_brewing_mix` | `brewing_stand` | `1.20.10` | `input`, `reagent`, `output` (potion types) |
| `minecraft:recipe_brewing_container` | `brewing_stand` | `1.20.10` | `input`, `reagent`, `output` (container items) |
| `minecraft:recipe_smithing_transform` | `smithing_table` | `1.21.110` | `template`, `base`, `addition`, `result` |
| `minecraft:recipe_smithing_trim` | `smithing_table` | `1.20.10` | `template`, `base`, `addition` (usually tags) |

There is no separate stonecutter recipe type: vanilla stonecutter recipes are `recipe_shapeless` with `"tags": ["stonecutter"]` and one ingredient. Vanilla also uses the tag `deprecated` to hide old recipes.

## Shaped

```json
{
  "format_version": "1.26.50",
  "minecraft:recipe_shaped": {
    "description": { "identifier": "ns:ruby_sword" },
    "tags": [ "crafting_table" ],
    "pattern": [ "R", "R", "S" ],
    "key": {
      "R": { "item": "ns:ruby" },
      "S": { "item": "minecraft:stick" }
    },
    "unlock": [ { "item": "ns:ruby" } ],
    "result": { "item": "ns:ruby_sword" }
  }
}
```
- Pattern is at most 3 rows of at most 3 characters. A space is an empty slot. A smaller pattern (1 column, 2x2) can be placed anywhere in the grid.
- A key entry is `{ "item": "id" }` or `{ "tag": "minecraft:planks" }`. `data` is deprecated from format 1.20.0; use the flattened id.
- `result` is one object (`item`, `count`) or an array; vanilla `cake.json` returns the cake plus 3 buckets: `[{"item":"minecraft:cake"},{"item":"minecraft:bucket","count":3}]`.
- `assume_symmetry` (format 1.20.80+) lets the mirrored pattern match too. Default false.
- `priority`: lower wins when two recipes match the same grid (vanilla `barrel_with_planks` uses `-1`).
- `group` is a recipe-book grouping string (vanilla `wooden_door`).

## Shapeless

```json
{
  "format_version": "1.26.50",
  "minecraft:recipe_shapeless": {
    "description": { "identifier": "ns:ruby_from_block" },
    "tags": [ "crafting_table" ],
    "ingredients": [ { "item": "ns:ruby_block" } ],
    "unlock": [ { "item": "ns:ruby_block" } ],
    "result": { "item": "ns:ruby", "count": 9 }
  }
}
```
Ingredients are objects with `item` or `tag` (vanilla `mushroom_stew` uses `{"tag":"minecraft:mushrooms_for_stew"}`). Repeat an entry to need two of it.

Stonecutter: same shape, `"tags": ["stonecutter"]`, one ingredient, `result.count` for the yield.

## Furnace family

```json
{
  "format_version": "1.26.50",
  "minecraft:recipe_furnace": {
    "description": { "identifier": "ns:furnace_ruby_ore" },
    "unlock": [ { "item": "ns:ruby_ore" } ],
    "tags": [ "furnace", "blast_furnace" ],
    "input": "ns:ruby_ore",
    "output": "ns:ruby"
  }
}
```
- `input` and `output` are plain id strings. One file can serve several stations by listing several tags (vanilla beef: `furnace`, `smoker`, `campfire`, `soul_campfire`).
- Vanilla furnace recipes carry explicit `priority` values since 1.26.40; set your own `priority` if your input also matches a vanilla recipe.
- No XP field exists in the recipe; don't invent one.

## Brewing

```json
{
  "format_version": "1.20.10",
  "minecraft:recipe_brewing_mix": {
    "description": { "identifier": "ns:brew_awkward_ruby" },
    "tags": [ "brewing_stand" ],
    "input": "minecraft:potion_type:awkward",
    "reagent": "ns:ruby",
    "output": "minecraft:potion_type:strength"
  }
}
```
- `brewing_mix` changes the potion type (`minecraft:potion_type:<name>`); the reagent can be a custom item. You can't define new potion effects here.
- `brewing_container` changes the container: vanilla `brew_potion_sulphur` is `input: minecraft:potion`, `reagent: minecraft:gunpowder`, `output: minecraft:splash_potion`.

## Smithing

Transform (keeps enchantments and durability of the base):
```json
{
  "format_version": "1.21.110",
  "minecraft:recipe_smithing_transform": {
    "description": { "identifier": "ns:smithing_ruby_sword_upgrade" },
    "tags": [ "smithing_table" ],
    "template": "minecraft:netherite_upgrade_smithing_template",
    "base": "ns:ruby_sword",
    "addition": "minecraft:netherite_ingot",
    "result": "ns:ruby_netherite_sword"
  }
}
```
The smithing UI only accepts items with the right item tags in each slot: base needs `minecraft:transformable_items`, template `minecraft:transform_templates`, addition `minecraft:transform_materials` (accepted in `addition` since 1.26.40). Give custom items these through the item's `minecraft:tags` component (see `bedrock-items`).

Trim (vanilla uses tags in all three slots):
```json
{
  "format_version": "1.20.10",
  "minecraft:recipe_smithing_trim": {
    "description": { "identifier": "minecraft:smithing_armor_trim" },
    "tags": [ "smithing_table" ],
    "template": { "tag": "minecraft:trim_templates" },
    "base": { "tag": "minecraft:trimmable_armors" },
    "addition": { "tag": "minecraft:trim_materials" }
  }
}
```
Custom armor becomes trimmable by adding the `minecraft:trimmable_armors` tag; you don't need your own trim recipe.

## Unlocking (recipe book)

`unlock` is an array of `{ "item": "id" }` or `{ "tag": "tag" }` entries (any one held item unlocks it), or an object `{ "context": "..." }`:

| context | Meaning |
|---|---|
| `AlwaysUnlocked` | Known from the start |
| `PlayerInWater` | First time the player enters water |
| `PlayerHasManyItems` | Player is carrying many items (threshold not documented) |
| `None` | Seen in vanilla; never unlocks by context |

Without `unlock`, the recipe still crafts, but with the `recipesunlock` / `dolimitedcrafting` game rules it may never be usable. Always add it. 1.26.20 put "furnace recipes unlock when you collect the material" behind an experiment.

## Item catalog (creative inventory and recipe book groups)

BP file `item_catalog/crafting_item_catalog.json`:
```json
{
  "format_version": "1.21.60",
  "minecraft:crafting_items_catalog": {
    "categories": [
      {
        "category_name": "construction",
        "groups": [
          {
            "group_identifier": { "icon": "ns:ruby_block", "name": "ns:itemGroup.name.ruby_blocks" },
            "items": [ "ns:ruby_block", "ns:ruby_block_slab" ]
          }
        ]
      },
      {
        "category_name": "equipment",
        "groups": [
          { "group_identifier": { "name": "minecraft:itemGroup.name.sword" }, "items": [ "ns:ruby_sword" ] }
        ]
      }
    ]
  }
}
```
- Categories: `construction`, `nature`, `equipment`, `items` only. You can't add categories or reorder vanilla entries; your entries go at the end.
- A group with `group_identifier` is collapsible. `name` doubles as its lang key (`ns:itemGroup.name.ruby_blocks=Ruby Blocks` in RP `texts/en_US.lang`). Two groups with the same name in a category merge, which is how you add to a vanilla group (`minecraft:itemGroup.name.helmet`, `.sword`, `.ore`, `.log`, ...).
- A group without `group_identifier` adds loose items.
- Items can be strings or `{ "name": "ns:item" }`.
- Alternative: set `menu_category: { category, group }` in the item/block `description`. If you set it there **and** move the item in the catalog you get a content warning, so leave `menu_category` empty for catalog-placed items.

## Common mistakes

- `tags` missing or misspelled: the recipe loads but no station shows it.
- Pattern rows of different lengths, or a key character not in `key`.
- Using `data` values at format 1.20+.
- Two packs using the same recipe identifier: only one survives, so always namespace identifiers.
- Smithing recipe that loads but the item won't go into the slot: missing item tag.
- Comments (`//`) in recipe files: vanilla files sometimes have them, yours must not (no comments anywhere in pack JSON).
