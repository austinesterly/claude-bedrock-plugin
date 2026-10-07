# Loot tables and trade tables

BP folders: `loot_tables/` and `trading/` (any subfolder). Neither file type has a `format_version` in most vanilla files; leave it out unless you need a feature added at a specific version (the 1.26.60 preview adds behaviour gated on `"format_version": "1.26.60"`). Vanilla loot tables contain `//` comments; yours must not. Field tables: `../../bedrock-json-reference/references/recipes-spawn-trade.md` and `misc.md`. Working files: `../templates/loot-and-trades/`.

## Loot table shape

```
{ "pools": [ { "rolls", "bonus_rolls"?, "conditions"?, "tiers"?, "entries": [ { "type", "name", "weight", "quality"?, "functions"?, "conditions"? } ] } ] }
```

| Key | Value |
|---|---|
| `rolls` | Int, or `{ "min": 1, "max": 3 }`. How many entries the pool picks |
| `bonus_rolls` | Extra rolls (scaled by luck) |
| `conditions` | All must pass for the pool (or entry, or function) to apply |
| `entries[].type` | `item`, `loot_table` (nested; `name` is the full path `loot_tables/chests/x.json`), `empty` (a "nothing" slot with weight) |
| `entries[].weight` | Relative chance inside the pool |
| `tiers` | Vanilla tiered pools (`initial_range`, `bonus_rolls`, `bonus_chance`), rarely needed |

## Example: mob drops (templates/loot-and-trades/BP/loot_tables/entities/ns_critter.json)

Four pools: always some leather, beef that comes out cooked if the mob was on fire, a 5% rare ruby (plus 1% per Looting level) only when a player or pet kills it, and a 1-in-4 roll on a nested chest table outside the End.
```json
{
  "pools": [
    { "rolls": 1, "entries": [ { "type": "item", "name": "minecraft:leather", "weight": 1, "functions": [
      { "function": "set_count", "count": { "min": 0, "max": 2 } },
      { "function": "looting_enchant", "count": { "min": 0, "max": 1 } } ] } ] },
    { "rolls": 1, "entries": [ { "type": "item", "name": "minecraft:beef", "weight": 1, "functions": [
      { "function": "set_count", "count": { "min": 1, "max": 3 } },
      { "function": "furnace_smelt", "conditions": [ { "condition": "entity_properties", "entity": "this", "properties": { "on_fire": true } } ] },
      { "function": "looting_enchant", "count": { "min": 0, "max": 1 } } ] } ] },
    { "conditions": [
        { "condition": "killed_by_player_or_pets" },
        { "condition": "random_chance_with_looting", "chance": 0.05, "looting_multiplier": 0.01 } ],
      "rolls": 1, "entries": [ { "type": "item", "name": "ns:ruby", "weight": 1 } ] },
    { "conditions": [
        { "condition": "killed_by_player" },
        { "condition": "biome_has_tag", "operator": "!=", "tag": "the_end" },
        { "condition": "random_difficulty_chance", "default_chance": 0.1, "peaceful": 0, "hard": 0.25 } ],
      "rolls": 1, "entries": [
        { "type": "loot_table", "name": "loot_tables/chests/ns_critter_treasure.json", "weight": 1 },
        { "type": "empty", "weight": 3 } ] }
  ]
}
```

## Functions

| Function | Fields (as used in vanilla) |
|---|---|
| `set_count` | `count`: int or `{min,max}` |
| `looting_enchant` | `count`: `{min,max}` added per Looting level |
| `set_damage` | `damage`: `{min,max}` fraction 0-1 of durability left |
| `set_data` | `data`: int or `{min,max}` (legacy aux value) |
| `furnace_smelt` | none; smelts the drop (pair with an `on_fire` condition) |
| `explosion_decay` | none; drops fewer when blown up |
| `enchant_randomly` | `treasure`: bool |
| `enchant_with_levels` | `levels`: int or `{min,max}`, `treasure`: bool |
| `enchant_random_gear` | `chance` (mob equipment tables) |
| `specific_enchants` | `enchants`: list of ids or `{ "id": "knockback", "level": 1 }` |
| `set_name` / `set_lore` | `name`: string / `lore`: array of strings |
| `set_potion` | `id`: potion id |
| `exploration_map` | `destination`: e.g. `buriedtreasure`, `mansion`, `monument`, `trial_chambers`, `village_taiga`, `swamp_hut` |
| `set_armor_trim`, `set_banner_details`, `set_book_contents`, `set_stew_effect`, `set_ominous_bottle_amplifier`, `set_actor_id`, `set_data_from_color_index`, `random_aux_value`, `random_block_state`, `random_dye`, `fill_container` | Specialised vanilla functions; copy their fields from the matching vanilla table before using |
| `enchant_book_for_trading` | Trade tables only (`base_cost`, `base_random_cost`, `per_level_cost`, `per_level_random_cost`) |

Functions run in order and each can carry its own `conditions`.

## Conditions

| Condition | Fields |
|---|---|
| `killed_by_player`, `killed_by_player_or_pets` | none |
| `killed_by_entity`, `entity_killed`, `damaged_by_entity`, `passenger_of_entity` | `entity_type` |
| `is_baby` | none |
| `random_chance` | `chance` 0-1 |
| `random_chance_with_looting` | `chance`, `looting_multiplier` |
| `random_difficulty_chance` | `default_chance`, plus per-difficulty `peaceful`, `easy`, `normal`, `hard` |
| `random_regional_difficulty_chance` | `max_chance` |
| `has_variant`, `has_mark_variant` | `value` (int) |
| `entity_properties` | `entity`: `this`, `attacker`, `attacking_player`; `properties`: `{ "on_fire": true }` (only `this` + `on_fire` appear in vanilla) |
| `bool_property` | `domain` (entity property name), `value` |
| `match_tool` | `item`, `count`, `durability` `{range_min, range_max}`, `enchantments` `[{enchantment, levels: {range_min, range_max}}]`, tag lists `minecraft:match_tool_filter_any` / `_all` / `_none` |
| `biome_has_tag` | `tag` (added 1.26.30) |

`operator` on loot conditions arrived in 1.26.50; vanilla only uses it as `"operator": "!="` on `biome_has_tag`. Other conditions may accept it but that's not documented, so test before relying on it.

## Wiring a loot table

| Source | Where | Value |
|---|---|---|
| Entity death drops | entity `components` | `"minecraft:loot": { "table": "loot_tables/entities/ns_critter.json" }` |
| Entity equipment on spawn | entity `components` | `"minecraft:equipment": { "table": "loot_tables/equipment/ns_guard.json" }` |
| Block drops | block `components` | `"minecraft:loot": "loot_tables/blocks/ns_ruby_ore.json"` |
| Command | `/loot` | path relative to `loot_tables/`, quoted, no extension |
| Chest in a structure | jigsaw processor `append_loot`, or `/loot replace block` | see `worldgen.md` |

Command forms (examples from the command docs):
```
loot spawn ~ ~1 ~ loot "chests/ns_critter_treasure"
loot give @p loot "entities/ns_critter"
loot replace block 0 0 0 slot.container 0 1 loot "chests/abandoned_mineshaft"
loot replace block 0 0 0 slot.container 0 1 kill @e[type=blaze]
loot replace block 0 0 0 slot.container 0 1 mine 0 0 0
```
An empty block loot table (`{ "pools": [] }`) makes a block drop nothing; leaving out `minecraft:loot` makes it drop itself.

## Trade tables

Wire with the entity component (vanilla villager_v2):
```json
"minecraft:economy_trade_table": {
  "display_name": "entity.ns:ruby_merchant.name",
  "table": "trading/ns_ruby_merchant_trades.json",
  "new_screen": true,
  "persist_trades": true,
  "cured_discount": [ -25, -20 ],
  "max_cured_discount": [ -25, -20 ]
}
```
Vanilla traders also have the goal `"minecraft:behavior.trade_with_player": {}` (vanilla gives it filters) so they stop and face the player while trading; add it to custom traders (see `bedrock-entity-behavior`). `minecraft:trade_table` is the older, simpler component (vanilla `villager.json`) with `display_name`, `table`, `convert_trades_economy`. The 1.26.60 preview makes `economy_trade_table` stricter; check `bedrock-whats-new` before upgrading.

File shape:
```
{ "tiers": [ { "total_exp_required": 0, "groups": [ { "num_to_select": 1, "trades": [ ... ] } ] } ] }
```
- Tiers unlock in order as the trader gains `trader_exp`; the first tier is always unlocked and `total_exp_required` must ascend.
- A tier holds `groups` (each picks `num_to_select` random trades) or a plain `trades` array (all shown).
- A trade: `wants` (1 or 2 items), `gives` (1 item), `trader_exp`, `max_uses`, `reward_exp`.
- A want/give item: `item`, `quantity` (int or `{min,max}`), `price_multiplier`, `functions` (same loot functions, e.g. `enchant_with_levels`), and `filters` (entity filter on the trader, e.g. `in_overworld`).
- `"choice": [ {item...}, {item...} ]` inside `gives` picks one option whose `filters` pass (vanilla cartographer picks a biome-specific explorer map).

Example tier (from `../templates/loot-and-trades/BP/trading/ns_ruby_merchant_trades.json`):
```json
{
  "total_exp_required": 10,
  "groups": [ { "num_to_select": 1, "trades": [ {
    "wants": [ { "item": "minecraft:emerald", "quantity": 12, "price_multiplier": 0.2 }, { "item": "ns:ruby", "quantity": 2 } ],
    "gives": [ { "item": "ns:ruby_sword", "quantity": 1, "functions": [ { "function": "enchant_with_levels", "treasure": false, "levels": { "min": 5, "max": 19 } } ] } ],
    "trader_exp": 5, "max_uses": 3, "reward_exp": true
  } ] } ]
}
```

## Common mistakes

- Comments copied from vanilla loot tables: the file fails to parse.
- `/loot` with `loot_tables/` or `.json` in the path, or unquoted path.
- Nested `loot_table` entry without the `loot_tables/` prefix and `.json`.
- Forgetting the `killed_by_player` condition on valuable drops, so farms and lava get them too.
- Trade tiers out of order, or an item id in `wants` that doesn't exist (the trade silently disappears).
