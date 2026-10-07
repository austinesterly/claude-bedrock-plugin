# shopkeeper template

A stationary NPC `ns:vendor` with a script shop: categories, a quantity slider, a confirm step, buy and sell-back transactions, receipts, and a currency that is either a scoreboard objective or an item. **Stable** (`@minecraft/server` 2.10.0, `@minecraft/server-ui` 2.2.0).

| File | What it does |
|---|---|
| `BP/entities/ns_vendor.json` | Invulnerable, persistent, not pushable, full knockback resistance, movement 0, looks at players, `minecraft:interact` |
| `BP/scripts/ns_shop.js` | Entry: opens the shop on interaction, name tag, creates the `ns_coins` objective and shows it on the sidebar if the sidebar is free, `/ns:coins <players> <amount>` for operators |
| `BP/scripts/ns_shop/catalog.js` | Categories (Food, Tools, Building), offers, and what the vendor buys back |
| `BP/scripts/ns_shop/wallet.js` | Currency adapter (`CURRENCY.mode` `"score"` or `"item"`), inventory count, remove, room check, give |
| `BP/scripts/ns_shop/ui.js` | Screens and the synchronous `buy` / `sell` transactions, receipts in a player dynamic property |
| `BP/scripts/ns_shop/forms.js` | Small form helper (UserBusy retry, one form per player) |
| `RP/...` | Client entity, 64x64 humanoid model and texture, animations, villager sounds, lang |

## Wire it up

1. `node <plugin>/scripts/new-addon.mjs <dir> --name "..." --ns <yourns> --add <this folder>` (imports `ns_shop.js` into `main.js`).
2. Give yourself money: `/ns:coins @s 100` (scoreboard mode) or hold emeralds (item mode).
3. Interact with the vendor. Buy a few bundles, sell wheat back, open "My receipts".

## Notes

- Transactions re-check after the confirm screen and run in one synchronous block: buying takes money first and refunds anything that didn't fit; selling removes items first, then pays.
- The room check counts partly filled stacks, not just empty slots.
- Scoreboard currency can be edited by operators with `/scoreboard`; use item mode or a dynamic property wallet if that matters.
- For the vanilla trade screen instead, see `../../../bedrock-entity-behavior/templates/npc-trader`. A one-screen shop with a DDUI MessageBox is `../../../bedrock-ui/templates/shop-messagebox` (it uses the entity id `ns:shopkeeper`, so the two can live side by side).
- Design notes: `../../references/shops-and-traders.md`.
