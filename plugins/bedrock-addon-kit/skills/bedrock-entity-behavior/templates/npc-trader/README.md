# npc-trader: `ns:merchant`

A villager-like trader with its own two-tier trade table. Players right-click to open the trade screen. It flees zombies and illagers and never despawns.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/merchant.json` | Behavior, format 1.26.50 |
| BP | `trading/ns_merchant_trades.json` | Trades, same shape as the bedrock-world-content `loot-and-trades` template |
| BP | `loot_tables/entities/ns_merchant.json` | Up to one emerald |
| RP | `entity/merchant.entity.json` | Client entity, spawn egg colours |
| RP | `models/entity/merchant.geo.json` | Villager-style rig (head, nose, crossed arms, legs), 64x64 |
| RP | `animations/merchant.animation.json` | idle, walk |
| RP | `textures/entity/ns_merchant.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla villager audio, including `haggle`, `haggle.yes`, `haggle.no` |
| RP | `texts/en_US.lang` | Names and subtitle |

Render controller: vanilla `controller.render.default`. No spawn rule: place it with the spawn egg, a command or a script.

## How it works

- `minecraft:trade_table { table, display_name, new_screen: true, persist_trades: true }` plus `behavior.trade_with_player` (with the vanilla `in_water` / `on_ground` filters) and `behavior.look_at_trading_player`.
- Trade file: `tiers[]` unlock by `total_exp_required`; each group offers `num_to_select` random trades; each trade has `wants` (one or two items), `gives`, `trader_exp`, `max_uses`, `reward_exp`. `quantity` can be a number or `{min,max}`, and `gives` entries take loot functions such as `enchant_with_levels`.
- `minecraft:persistent` keeps it from despawning; no `minecraft:despawn`.

## Try it

```
/summon ns:merchant
```

## Customize

- Swap the vanilla items in the trade file for your own (`ns:...`) items.
- Vanilla `villager_v2` and the wandering trader use `minecraft:economy_trade_table` with `trading/economy_trades/*.json`, which adds demand-based pricing. Use that component instead if you want prices to move.
