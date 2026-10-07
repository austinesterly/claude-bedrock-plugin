# Item components by purpose

How to combine item components into working items. Exact JSON, written for item `format_version` `1.26.50`. Field-by-field tables are in `../../bedrock-json-reference/references/items.md`. The "since" versions come from the Learn reference.

## 1. Skeleton every item shares

```json
{
  "format_version": "1.26.50",
  "minecraft:item": {
    "description": {
      "identifier": "ns:ruby",
      "menu_category": { "category": "items", "group": "minecraft:itemGroup.name.miscFood", "is_hidden_in_commands": false }
    },
    "components": {
      "minecraft:icon": { "textures": { "default": "ns:ruby" } },
      "minecraft:display_name": { "value": "item.ns:ruby.name" }
    }
  }
}
```

- `menu_category.category`: `construction`, `equipment`, `items`, `nature`, or `none` (the default, which hides the item from the creative menu). `group` is optional and must match `^.+:.+$`. Use a vanilla group such as `minecraft:itemGroup.name.sword`, `.pickaxe`, `.axe`, `.shovel`, `.hoe`, `.helmet`, `.chestplate`, `.leggings`, `.boots`, `.arrow`, `.potion`, `.cookedFood`, `.miscFood` or `.rawFood`. The full list is at the end of Learn's `CraftingItemCatalogDocumentation`.
- Custom groups and ordering: `BP/item_catalog/crafting_item_catalog.json` (format `1.21.60` in Learn's examples):

```json
{
  "format_version": "1.21.60",
  "minecraft:crafting_items_catalog": {
    "categories": [
      { "category_name": "equipment",
        "groups": [ { "group_identifier": { "icon": "ns:ruby_sword", "name": "ns:ruby_gear" },
                      "items": [ "ns:ruby_sword", "ns:ruby_pickaxe" ] } ] }
    ]
  }
}
```
  Add the group name to the lang file as the bare key: `ns:ruby_gear=Ruby Gear`.
- `is_hidden_in_commands: true` keeps the item out of `/give` autocomplete.

## 2. Icons, names, text colour

| Goal | JSON | Notes |
|---|---|---|
| Icon | `"minecraft:icon": {"textures": {"default": "ns:ruby"}}` | Key into `RP/textures/item_texture.json`. Learn marks the `texture` (singular) field deprecated, but vanilla `apple.json` used it until 1.26.30. Use `textures.default`. |
| Icon atlas entry | `"texture_data": {"ns:ruby": {"textures": "textures/items/ruby"}}` | Vanilla also sets `"texture_name": "atlas.items"` and `resource_pack_name`. |
| Display name | `"minecraft:display_name": {"value": "item.ns:ruby.name"}` + `item.ns:ruby.name=Ruby` in `RP/texts/en_US.lang` | A literal string also works. Learn's potion tutorial shows `item.<identifier>=` as the key when no display_name is set; setting an explicit key is the safer option. |
| Name colour by rarity | `"minecraft:rarity": {"value": "rare"}` | `common`, `uncommon`, `rare`, `epic` (1.21.30+). Enchanting raises it one step. |
| Name colour, explicit | `"minecraft:hover_text_color": {"value": "..."}` | String (1.20.10+). Learn doesn't list the accepted values, so test them. |
| Enchanted shimmer without enchantments | `"minecraft:glint": {"value": true}` | Renamed from `foil`. |
| Held like a tool (diagonal) | `"minecraft:hand_equipped": {"value": true}` | For swords, tools, rods. |
| Touch "use" button text | `"minecraft:interact_button": "Throw"` or `true` | `true` shows "Use Item". |

The lang file lives in the RP (`RP/texts/en_US.lang`), is UTF-8 without a BOM, and uses one `key=value` per line. Add `texts/languages.json` only if you ship more languages.

## 3. Stacking and world behavior

| Goal | JSON |
|---|---|
| Stack size | `"minecraft:max_stack_size": {"value": 16}` (1-64) |
| Different aux values don't stack | `"minecraft:stacked_by_data": {"value": true}` |
| Allowed in the off hand | `"minecraft:allow_off_hand": {"value": true}` |
| Survives fire/lava as a dropped item | `"minecraft:fire_resistant": {"value": true}` |
| Never despawns when dropped | `"minecraft:should_despawn": {"value": false}` |
| Can't break blocks in creative | `"minecraft:can_destroy_in_creative": {"value": false}` (swords) |
| Use interacts with liquids (bucket-like) | `"minecraft:liquid_clipped": {"value": true}` |
| Furnace fuel | `"minecraft:fuel": {"duration": 10.0}` (seconds, ≥0.05) |
| Composter input | `"minecraft:compostable": {"composting_chance": 30}` (1-100, 1.21.60+) |
| Places a block | `"minecraft:block_placer": {"block": "ns:my_block", "replace_block_item": true}` (1.21.50+; `replace_block_item` needs the item id to equal the block id) |
| Places an entity / spawn egg | `"minecraft:entity_placer": {"entity": "ns:my_mob", "use_on": ["minecraft:grass_block"]}` |
| Seeds | `"minecraft:seed": {"crop_result": "ns:my_crop"}` |
| Music disc | `"minecraft:record": {"sound_event": "...", "duration": 5, "comparator_signal": 1}` + tag `minecraft:music_disc` |
| Bundle-like storage | `minecraft:storage_item` + `minecraft:bundle_interaction` (+ `storage_weight_limit`, `storage_weight_modifier`); see items.md. Bundles also need `textures/textures_list.json` entries for the open sprites |

## 4. Food, drinks, potions

Food needs `minecraft:use_modifiers` with a `use_duration` (Learn: "Requires ... use_modifiers"). Vanilla `apple.json` at format 1.26.30:

```json
"minecraft:food": { "nutrition": 4, "saturation_modifier": 0.3 },
"minecraft:use_animation": { "value": "eat" },
"minecraft:use_modifiers": { "start_using": "always", "use_duration": 1.6, "movement_modifier": 0.35 },
"minecraft:tags": { "tags": [ "minecraft:is_food" ] }
```

| Field | Meaning |
|---|---|
| `nutrition` | Hunger points restored |
| `saturation_modifier` | Number. Saturation = nutrition x modifier x 2. Old vanilla files use words (`"poor"`, `"supernatural"`), which only work at old format versions |
| `can_always_eat` | Eat while full (golden apple, drinks) |
| `using_converts_to` | Item left after eating: `"minecraft:bowl"`, `"minecraft:glass_bottle"`, or your own empty item |
| `use_animation` | `eat` or `drink` |

**Status effects on eating:** vanilla 1.10-format files use `food.effects` and `remove_effects`, but these are not in the current schema (`remove_effects` is documented as removed after 1.20). Use a script component, as in Learn's custom potion tutorial:

```json
"minecraft:food": { "nutrition": 0, "can_always_eat": true, "using_converts_to": "ns:empty_flask" },
"minecraft:use_modifiers": { "use_duration": 1.6 },
"minecraft:use_animation": { "value": "drink" },
"ns:drink_effect": { "effect": "minecraft:fire_resistance", "ticks": 1200 }
```
```js
init.itemComponentRegistry.registerCustomComponent("ns:drink_effect", {
  onConsume(e, { params }) { e.source.addEffect(params.effect, params.ticks); },
});
```
The Learn tutorial calls `addEffect` directly in `onConsume`. If you hit a privilege error, wrap it in `system.run` (see `bedrock-scripting`).

**Vanilla potions** are not data-driven. `/give @p potion 1 <data>` picks the type (e.g. `7` invisibility, `12` fire resistance; the table is in Learn's `create-custom-potions`, valid as of 1.21.111). Learn documents no splash or lingering behavior for custom items. You could build one as a throwable with a scripted impact, but that is not documented as a pattern.

## 5. Durability, repair, enchanting

```json
"minecraft:durability": { "max_durability": 1200, "damage_chance": { "min": 100, "max": 100 } },
"minecraft:repairable": { "repair_items": [
  { "items": [ "ns:ruby_sword" ], "repair_amount": "context.other->query.remaining_durability" },
  { "items": [ "ns:ruby" ], "repair_amount": "query.max_durability * 0.25" }
] },
"minecraft:enchantable": { "slot": "sword", "value": 10 }
```

- `damage_chance` is the percentage chance of losing durability per use (default 100/100). Vanilla spears use `{min: 0, max: 100}`.
- `repair_amount` is a number or a Molang string. The two expressions above come from vanilla `iron_spear.json`: one combines two of the same item, the other repairs a quarter of durability per material.
- `enchantable.slot` accepts `none, all, g_armor, armor_head, armor_torso, armor_legs, armor_feet, sword, bow, spear, crossbow, melee_spear, g_tool, hoe, shears, flintsteel, shield, g_digging, axe, pickaxe, shovel, fishing_rod, carrot_stick, elytra, cosmetic_head`. `value` is enchantability: higher values give better table rolls. Vanilla iron spear uses 14; the Learn chestplate example uses 3.
- Effects only work if the item has a matching mechanic: Efficiency needs `digger.use_efficiency: true`, Sharpness needs a melee item, Power/Infinity need a `shooter`, Protection needs a `wearable`.
- Unbreakable: the item file has no field for it. Script API `ItemDurabilityComponent.unbreakable` was added in 1.26.10; check its stable/beta status in `bedrock-whats-new`.
- React to low durability: `minecraft:durability_sensor` with `durability_thresholds: [{ "durability": 10, "particle_type": "...", "sound_event": "..." }]` (needs `durability`; 1.21.20+).

## 6. Cooldowns and use timing

```json
"minecraft:cooldown": { "category": "ns:ruby_shard", "duration": 0.5, "type": "use" }
```
- Every item with the same `category` enters cooldown together, so namespace categories per item or per family.
- `type`: `use` (default) or `attack` (1.21.130+, used by spears to rate-limit melee). Cooldowns on custom items display correctly from 1.26.10.

```json
"minecraft:use_modifiers": { "use_duration": 1.6, "movement_modifier": 0.35, "start_using": "if_first", "emit_vibrations": true, "start_sound": "..." }
```
- `use_duration` in seconds. Use 72000 for "hold as long as you like" (bows, spears).
- `movement_modifier` ≤ 1 slows the player while using.
- `start_using` (1.26.30+): `always` or `if_first`. Below format 1.26.30 the default is `always`; at 1.26.30 and above it is `if_first`, which only starts using if no other component already handled the use. Use `if_first` with `shooter`; vanilla food sets `always`.
- `start_sound` (and `swing_sounds`, `durability_sensor.sound_event`) accept any `sound_definitions.json` event at format 1.26.50+ per the 26.60 changelog. On 26.52 stable, stick to vanilla sound event names.
- `minecraft:use_duration` and `minecraft:chargeable` are deprecated. Use `use_modifiers`.

## 7. Tags

```json
"minecraft:tags": { "tags": [ "minecraft:is_sword", "minecraft:is_tool", "ns:ruby_gear" ] }
```
Only vanilla tags may use `minecraft:`. Useful ones (Learn `vanilla-item-tags`):

| Purpose | Tags |
|---|---|
| Armor | `minecraft:is_armor`, `minecraft:trimmable_armors` |
| Tools | `minecraft:is_sword`, `is_pickaxe`, `is_axe`, `is_shovel`, `is_hoe`, `is_shears`, `is_spear`, `is_trident`, `is_tool`, `digger` |
| Tier | `minecraft:wooden_tier`, `stone_tier`, `copper_tier`, `iron_tier`, `golden_tier`, `diamond_tier`, `netherite_tier`, `leather_tier`, `chainmail_tier` |
| Food | `minecraft:is_food`, `is_meat`, `is_cooked`, `is_fish` |
| Trims / smithing | `minecraft:trim_materials`, `trim_templates`, `transformable_items`, `transform_materials`, `transform_templates` |
| Misc | `minecraft:arrow`, `music_disc`, `piglin_loved`, `coals`, `metal_nuggets`, `lectern_books`, `bookshelf_books` |

Tags are for recipes (`"tag"` ingredients), filters (`has_equipment_tag`), loot conditions and scripts (`ItemStack.hasTag`). The 26.20 changelog says block tags must not drive item behavior.

## 8. Armor-only extras

| Goal | JSON |
|---|---|
| Worn in a slot | `"minecraft:wearable": {"slot": "slot.armor.chest", "protection": 8}`. Slots: `slot.armor.head/chest/legs/feet/body`, `slot.weapon.offhand`, `slot.weapon.mainhand`. `dispensable` is deprecated |
| Hide wearer on locator map/bar | `"hides_player_location": true` in `wearable` |
| Absorb specific damage | `"minecraft:damage_absorption": {"absorbable_causes": ["<cause>", "..."]}`, using the entity damage cause names (Learn gives no list here). Must be worn in an armor slot and needs `minecraft:durability`; absorbed damage costs durability (1.21.20+) |
| Dyeable (leather style) | `"minecraft:dyeable": {"default_color": "#175882"}` (1.21.30+), plus a `"dyed"` icon key and a render controller; see `armor-and-attachables.md` |

## 9. Script custom components (short)

In item JSON at format 1.21.90+, put the component id as a key with its parameters as the value: `"ns:feeder": {"uses": 3}`. Register it in `system.beforeEvents.startup` with `init.itemComponentRegistry.registerCustomComponent(id, { onUse, onUseOn, onConsume, onCompleteUse, onHitEntity, onMineBlock, onBeforeDurabilityDamage })`. Callbacks are read-only, so defer writes with `system.run`. Full patterns, the `onUse`/`onUseOn` double-fire guard, and how to edit an equipped item stack are in `../../bedrock-scripting/references/code-patterns.md`.
