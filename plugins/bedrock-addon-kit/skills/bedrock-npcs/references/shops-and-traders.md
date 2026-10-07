# Shops and traders

Two ways to sell things through an NPC: a **script shop** (forms, any currency, any rules) or the vanilla **trade screen** (`minecraft:trade_table` / `minecraft:economy_trade_table` with a trade file). Sources: stable `@minecraft/server` 2.10.0 / `@minecraft/server-ui` 2.2.0 typings, vanilla `villager_v2.json`, `wandering_trader.json` and `trading/` (v1.26.50.4), Learn "Create a Trade Table" and the trade table reference. Trade file format in depth: `../../bedrock-world-content/references/loot-and-trades.md`.

## Which one

| | Script shop (`templates/shopkeeper`) | Trade table (`../../bedrock-entity-behavior/templates/npc-trader`) |
|---|---|---|
| UI | ActionForm / ModalForm / MessageForm (or DDUI) | Vanilla trade screen |
| Currency | Anything: scoreboard, dynamic property, any item | Items only (1 or 2 `wants`, 1 `gives`) |
| Quantity | Slider, bundles, bulk | One trade per click, `max_uses` per restock |
| Categories, sell-back, receipts, discounts by rule | Yes | Tiers and groups only |
| Needs script | Yes | No |
| Restock | Your rules | `minecraft:trade_resupply` (vanilla adds it while working) |
| Usable from command blocks and functions | Through `/scriptevent` | Yes |

Pick trade tables for a villager-like feel with no code. Pick a script shop for anything with balances, quantities or rules.

## Script shop building blocks (stable 2.10.0)

| Need | API |
|---|---|
| Player inventory | `player.getComponent("minecraft:inventory").container` (`Container`) |
| Read slots | `container.size`, `getItem(slot)` (a **copy**), `emptySlotsCount`, `find(itemStack)`, `contains(itemStack)` |
| Write slots | `setItem(slot, stack?)` (undefined clears), `addItem(stack)` returns the leftover or `undefined` |
| Make items | `new ItemStack(typeId, amount?)`; `amount` (settable up to `maxAmount`), `isStackableWith(other)`, `nameTag`, `setLore()` |
| Drop overflow | `player.dimension.spawnItem(stack, player.location)` |
| Scoreboard money | `world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, display)`; `getScore(player)` (`undefined` if none), `addScore(player, n)`, `setScore(player, n)` |
| Sidebar | `world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective })` |
| Dynamic-property money | `player.getDynamicProperty("ns:coins")` / `setDynamicProperty` |

### Currency choices

| Currency | Pros | Cons |
|---|---|---|
| Scoreboard objective | Visible on the sidebar, usable from commands, functions and other packs | Operators can edit it with `/scoreboard`; code-patterns treats scoreboards as display data, so keep anti-cheat elsewhere |
| Player dynamic property | Private to your pack, survives anything but a BP UUID change | Invisible unless you show it (action bar, form body) |
| Item (emeralds, a custom coin) | Physical, tradeable, works with trade tables too | Needs inventory scans, can be lost on death |

`templates/shopkeeper/BP/scripts/ns_shop/wallet.js` hides the choice behind `balance`, `canPay`, `pay`, `earn`; switch `CURRENCY.mode` between `"score"` and `"item"`.

### Transactions

Script runs one handler at a time, so a transaction is "atomic" if all its checks and writes happen in one synchronous block after the last `await`:

```js
function buy(player, offer, qty) {             // called right after the confirm form resolves
  const total = qty * offer.price, items = qty * offer.count;
  if (!canPay(player, total)) return fail(player, "Not enough coins.");
  if (roomFor(player, offer.item) < items) return fail(player, "Inventory full.");
  pay(player, total);                           // take first
  const lost = giveItem(player, offer.item, items);
  if (lost) earn(player, Math.ceil(lost / items * total));   // refund anything that didn't fit
  receipt(player, "bought", offer, items - lost, total);
}
function sell(player, offer, qty) {
  const items = qty * offer.count;
  if (countItem(player, offer.item) < items) return fail(player, "You no longer have them.");
  removeItem(player, offer.item, items);        // remove first...
  earn(player, qty * offer.price);              // ...then pay: a failure can't create money
}
```
Rules:
- **Re-check after every await.** The confirm screen can sit open for minutes; the player can drop the items or spend the coins in another shop.
- **Take, then give.** Remove the payment (coins or items) before handing out the goods, and refund on failure. Never give first.
- **Count space properly.** Empty slots hold `maxAmount`; partly filled stacks that `isStackableWith` the item hold the rest. `emptySlotsCount === 0` is not "full" for stackables.
- **Write copies back.** `getItem` returns a copy; change `amount` then `setItem`.
- **Never trust form values.** Clamp slider results and recompute prices server-side.
- **Receipts:** send a chat line, play a sound, and keep the last few entries in a player dynamic property (`ns:receipts`, a bounded JSON array) for a "My receipts" page.
- **Writable context only.** Scoreboard, inventory and dynamic property writes fail in before-events and custom command callbacks; wrap them in `system.run`.

Opening the shop from an NPC dialogue button: `"/scriptevent ns:shop open"` plus a `scriptEventReceive` handler that checks `ScriptEventSource.NPCDialogue` and uses `e.initiator` (see `../../bedrock-ui/references/npc-dialogue.md`). A simpler single-screen shop with a DDUI MessageBox confirm is `../../bedrock-ui/templates/shop-messagebox`.

## Trade table traders

Entity side (vanilla wandering trader):
```json
"minecraft:economy_trade_table": {
  "display_name": "entity.ns:merchant.name",
  "table": "trading/ns_merchant_trades.json",
  "new_screen": true,
  "persist_trades": true
},
"minecraft:behavior.trade_with_player": { "priority": 1 },
"minecraft:behavior.look_at_trading_player": { "priority": 4, "look_time": { "min": 1, "max": 2 } }
```

| Component | Fields (Learn tables) |
|---|---|
| `minecraft:trade_table` | `display_name`, `table`, `new_screen`, `persist_trades`, `convert_trades_economy`. Schema stricter at 1.26.50 |
| `minecraft:economy_trade_table` | The same plus `cured_discount`, `max_cured_discount`, `nearby_cured_discount`, `max_nearby_cured_discount`, `hero_demand_discount`, `show_trade_screen` (default true), `use_legacy_price_formula`. Stricter at 1.26.60 (preview) |
| `minecraft:trade_resupply` | No fields. Adding it restocks trades |
| `minecraft:behavior.trade_with_player` | `priority`, `filters` (vanilla: on ground, not in water) |
| `minecraft:behavior.trade_interest` | Looks at a player holding a tradable item and shows its trade items (`within_radius`, `interest_time`, `cooldown`) |

Trade file (BP `trading/...json`): `tiers[] { total_exp_required, groups[] { num_to_select, trades[] } }` or `tiers[].trades[]`. A trade: `wants` (1-2 items), `gives` (1), `trader_exp` (default 1), `max_uses` (default 7), `reward_exp` (default true), `weight`. An item: `item`, `quantity` (int or `{min,max}`), `price_multiplier`, `functions`, `filters`, or a `choice` list.

### Tiers and refreshing

- **Tiers** unlock by the **trader's** experience (Learn), in order; the first tier is always open, `total_exp_required` must ascend. Each completed trade gives the trader `trader_exp`.
- **Groups** pick `num_to_select` random trades from their list when the tier unlocks, so two traders of the same table differ. With `persist_trades`, the picks survive transformation.
- **Restock** is `minecraft:trade_resupply`. Vanilla villagers add `trade_resupply_component_group` from `behavior.work`'s `on_arrival` event (`minecraft:resupply_trades`) and remove it again on the next schedule change, so the next add restocks again. A custom trader can do the same with a timer:
  ```json
  "component_groups": { "ns:restock": { "minecraft:trade_resupply": {} } },
  "components": { "minecraft:timer": { "looping": true, "randomInterval": false, "time": { "min": 600, "max": 600 }, "time_down_event": { "event": "ns:restock_now", "target": "self" } } },
  "events": {
    "ns:restock_now": { "sequence": [ { "remove": { "component_groups": [ "ns:restock" ] } }, { "add": { "component_groups": [ "ns:restock" ] } } ] }
  }
  ```
  Whether a remove and add in the same event restocks (rather than needing a tick between them) is unverified; vanilla separates them across schedule events. Use two timer events if it doesn't.
- The wandering trader has no resupply and despawns (`minecraft:managed_wandering_trader`); don't copy those parts to a permanent shop.
- Molang `query.trade_tier` / `query.max_trade_tier` exist for visuals (Learn form list).

The plain `trade_table` example with tiers is `../../bedrock-entity-behavior/templates/npc-trader`; the trade file with groups and enchant functions is `../../bedrock-world-content/templates/loot-and-trades`.

## Common mistakes

- An item id in `wants` or `gives` that doesn't exist: the trade silently disappears.
- `table` paths without `trading/` or with the wrong folder.
- A trader without `behavior.trade_with_player`: it walks away mid-trade.
- Script shop that gives first, then fails to take: free items.
- Checking `emptySlotsCount` only: bundles of stackable items fail although they would fit.
