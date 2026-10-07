---
name: bedrock-ui
description: Use when a Minecraft Bedrock add-on needs any custom UI - menus, script forms (ActionFormData, ModalFormData, MessageFormData, Data-Driven UI CustomForm/MessageBox), shops, settings screens, live dashboards, HUD/action bar/title text, cutscene camera and HUD hiding, NPC dialogue, chest-style containers, or JSON UI resource-pack restyles.
---

# Bedrock UI

Every way an add-on can put UI on screen, checked against the stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 typings, the Microsoft Learn docs and the vanilla 1.26.50.4 `resource_pack/ui` files (2026-10-06). Before pinning a version or using anything marked rc/beta, read `../bedrock-whats-new/references/current-versions.md`.

## Which UI tech for which need

| Need | Use | Stable? | Reference / template |
|---|---|---|---|
| Menu, list of choices, multi-page navigation | `ActionFormData` | Yes | `references/script-forms.md`, `templates/item-menu` |
| Yes/no confirm | `MessageBox` (DDUI) or `MessageFormData` | Yes | `templates/shop-messagebox` |
| Settings / text input, read once on submit | `ModalFormData` | Yes | `templates/settings-modal` |
| Screen that updates while open, many actions without closing, show/hide/disable controls | `CustomForm` + observables (DDUI) | Yes (2.1.0+) | `references/ddui-customform.md`, `templates/live-dashboard` |
| Icons on DDUI buttons, tooltips on DDUI inputs | `ButtonOptions.imageDetails`, `*Options.tooltip` | **rc only** (2.3.0, game 26.60) | `references/ddui-customform.md` |
| Status line (coins, timer, objective) | `onScreenDisplay.setActionBar` through one owner module | Yes | `references/hud-and-text.md`, `templates/hud-actionbar` |
| Event banner | `onScreenDisplay.setTitle` / `updateSubtitle` | Yes | `references/hud-and-text.md` |
| Hide hunger, hotbar, crosshair... | `setHudVisibility`, `hideAllExcept`, `resetHudElementsVisibility` | Yes | `references/hud-and-text.md` |
| Cutscene / cinematic | `player.camera` + `inputPermissions` + HUD hiding + fade | Yes (splines files: experiment) | `references/hud-and-text.md` |
| Floating labels in the world | `world.primitiveShapesManager` + `TextPrimitive` | Yes | `references/hud-and-text.md` |
| Shared leaderboard | Scoreboard sidebar (`setObjectiveAtDisplaySlot`) | Yes | `references/hud-and-text.md` |
| Story conversation with a character portrait | NPC dialogue scenes + `/dialogue` (+ `/scriptevent` to scripts) | Yes | `references/npc-dialogue.md`, `templates/npc-dialogue` |
| Real item slots (storage, backpack) | Entity `minecraft:inventory` container | Yes | `references/containers.md` |
| Custom chest block | `minecraft:block_entity.container` | **Experimental** | `references/containers.md` |
| "Chest GUI" menu | ActionForm with item icons (default) or community tricks | Form: yes | `references/containers.md` |
| Different look for a server form, custom HUD art | JSON UI in the resource pack | **Not a stable creator feature** | `references/json-ui.md`, `templates/json-ui-form-layout` |

Default: script forms. Reach for JSON UI only for looks, and only with a working fallback.

## Core rules

1. **One form at a time per player, with busy retry.** `UserBusy` (chat, inventory, another screen, the loading screen) resolves immediately; retry with `system.waitTicks`. Use `templates/form-helper/BP/scripts/ui/forms.js` (`showForm`, `showDdui`, `confirm`, `openLater`, `closeAll`, `valuesByKey`).
2. **Open forms from writable context.** Item/block custom component callbacks, custom command callbacks and before-events are read-only: wrap the open in `system.run` (`openLater`). Never call `show()` at top level or in `startup`.
3. **Re-check after every await.** `player.isValid`, balances, inventory space. A form can stay open for minutes.
4. **Read by key, not by guessed index.** ActionForm `selection` counts buttons only; keep a parallel array. ModalForm `formValues` has one slot per control; build a key list as you add controls and keep display-only controls out.
5. **Know the result shapes.** Classic: `{ canceled, cancelationReason: UserBusy | UserClosed, selection | formValues }`. CustomForm: `DataDrivenScreenClosedReason` (`ClientClosed`, `ServerClosed`, `UserBusy`). MessageBox: `{ closeReason, selection }` with selection **1 or 2**. MessageFormData selection is **0 or 1**.
6. **DDUI inputs need `clientWritable: true`** on their observables, or the player's changes never arrive (and `InvalidObservableError` is thrown for non-writable inputs). Display values and `visible`/`disabled` flags don't.
7. **Clean up live screens.** Clear `runInterval`s when `show()` resolves for any reason (`showDdui`'s `onClosed`).
8. **One owner per screen channel.** Action bar, title and HUD visibility go through one module; restore HUD, camera, input permissions and fog (by tag) when a sequence ends and on `playerSpawn`.
9. **Validate everything the client sends.** Clamp numbers, strip `§` codes, cap lengths; run `ObservableString.getFilteredText(player)` on text other players will see.
10. **Localize with `{ translate, with }`** and RP `texts/en_US.lang` (`key=value<TAB>#`), not concatenated English.
11. **JSON UI is optional decoration.** Not stable, restricted for Marketplace, replaced screen by screen by Ore UI. The pack must work with `RP/ui/` deleted. Never copy whole vanilla UI files.
12. **Stable channel only** in shipped packs. rc/beta members (`multiButtonRow`, `button3WithOptions`, `imageDetails`, control tooltips) wait for the module version that makes them stable.

## Common mistakes

| Mistake | Fix |
|---|---|
| Opening a form from a custom command and it never appears | Expected `UserBusy` while chat closes: use the retry helper |
| `formValues[2]` reads the wrong control after adding a label | Key list per control; keep labels out of read-by-index modals |
| 1.x signatures: `slider(label, min, max, step, default)`, `dropdown(label, opts, idx)`, `toggle(label, true)` | 2.x option objects: `{ valueStep, defaultValue }`, `{ defaultValueIndex }`, `{ defaultValue }` |
| Treating MessageBox `selection === 0` as button 1 | MessageBox is 1/2; MessageFormData is 0/1 |
| CustomForm slider/toggle never changes the value | Observable created without `{ clientWritable: true }` |
| Dashboard keeps running after close | Clear the interval in `onClosed` / after `show()` resolves |
| Two systems writing the action bar (flicker) or every tick (spam) | One HUD module; send on change + 40-tick heartbeat |
| Checking a DDUI result for `UserClosed` | DDUI has `ClientClosed`; `UserClosed` is classic only |
| HUD left hidden after a crash mid-cutscene | `resetHudElementsVisibility()` and `camera.clear()` on `playerSpawn` |
| Using `ButtonOptions.imageDetails` / control `tooltip` on server-ui 2.2.0 | rc-only until 2.3.0 is stable; use ActionFormData icons meanwhile |
| JSON UI file copied wholesale from vanilla | Override the one element you need, or add your own namespace |
| Restyling `CustomForm` with JSON UI | DDUI screens aren't drawn by `server_form.json`; restyle classic ActionForms only |
| Building a "chest GUI" from an entity inventory for a simple menu | Use an ActionForm with item icons; entity containers are for real storage |
| NPC dialogue commands with `@p` in multiplayer | `@initiator` |
| Scene tags, lang keys, scriptevent ids without a namespace | Prefix everything with `ns` |

## Templates (`templates/`)

| Folder | What | Files |
|---|---|---|
| `form-helper` | Shared helper every other template imports as `./ui/forms.js` | `BP/scripts/ui/forms.js` |
| `item-menu` | Multi-page ActionForm router opened by an item component, `/ns:menu` and `/scriptevent ns:menu <page>`; paged list | `BP/items/guide_book.json`, `BP/scripts/main.js`, RP `item_texture.json`, `en_US.lang` |
| `shop-messagebox` | Shop list, MessageBox confirm, re-check and buy; opened from an entity or a block component | `BP/scripts/shop.js` |
| `live-dashboard` | CustomForm with live labels, disabled button, toggle/slider/dropdown, cleanup | `BP/scripts/dashboard.js` |
| `settings-modal` | ModalForm with defaults from and saves to a versioned player dynamic property | `BP/scripts/settings.js` |
| `hud-actionbar` | Single action bar owner with providers, flash messages, titles, HUD element hiding | `BP/scripts/ui/hud.js`, `BP/scripts/main.js`, `RP/texts/en_US.lang` |
| `npc-dialogue` | Two linked scenes, a button that calls script, `openScene` helper | `BP/dialogue/ns_guide.json`, `BP/scripts/npc.js`, `RP/texts/en_US.lang` |
| `json-ui-form-layout` | Title-keyed wide ActionForm layout with vanilla fallback (read its README warning) | `README.md`, `RP/ui/_ui_defs.json`, `RP/ui/server_form.json`, `RP/ui/ns_forms.json`, `BP/scripts/wide_menu.js` |

Replace `ns` with the project namespace. Manifests: BP depends on `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 (see `bedrock-addon-conventions`).

## Pointers

- `references/script-forms.md`: ActionForm/MessageForm/ModalForm API tables, responses, errors, entry points (item, command, entity, block, scriptevent, buttons), patterns.
- `references/ddui-customform.md`: CustomForm, MessageBox, observables, option interfaces, rc/beta table, migration.
- `references/hud-and-text.md`: ScreenDisplay, HUD elements, scoreboard, text primitives, camera, input permissions, fog, RawMessage, formatting codes, `.lang` files.
- `references/npc-dialogue.md`: scene files, `/dialogue`, `@initiator`, the scriptevent bridge.
- `references/containers.md`: entity and block containers, container events, chest-GUI approaches.
- `references/json-ui.md`: files, elements, variables, bindings, factories, editing vanilla screens, server form restyles, HUD, risks; labeled Learn vs vanilla vs community.
- Related skills: `bedrock-scripting` (events, commands, custom components, persistence), `bedrock-items` and `bedrock-blocks` (the items and blocks that open UI), `bedrock-entity-behavior` (NPC and container entities), `bedrock-json-reference` (exact JSON UI, entity component and command fields), `bedrock-whats-new` (what is stable now).
