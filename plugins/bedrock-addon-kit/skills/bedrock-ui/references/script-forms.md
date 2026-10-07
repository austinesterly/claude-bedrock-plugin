# Classic script forms (`@minecraft/server-ui` 2.2.0)

Checked against the official stable typings: `@minecraft/server-ui` 2.2.0 and `@minecraft/server` 2.10.0 (npm `latest`, 2026-10-06). Data-Driven UI (`CustomForm`, `MessageBox`, observables) is in `ddui-customform.md`.

Manifest dependency: `{ "module_name": "@minecraft/server-ui", "version": "2.2.0" }`.

## The three classic forms

| Class | Shows | Result | Use for |
|---|---|---|---|
| `ActionFormData` | Title, body, list of buttons (optional icons), labels, headers, dividers | `ActionFormResponse.selection` (0-based button index) | Menus, shops, pickers |
| `MessageFormData` | Title, body, exactly two buttons | `MessageFormResponse.selection` (0 = `button1`, 1 = `button2`) | Yes/no |
| `ModalFormData` | Title, input controls, submit button | `ModalFormResponse.formValues` (array, in control order) | Settings, text input |

The content is fixed once shown. For text that updates while the screen is open, use `CustomForm`.

### ActionFormData

| Method | Signature | Notes |
|---|---|---|
| `title` | `title(titleText: RawMessage \| string): ActionFormData` | |
| `body` | `body(bodyText: RawMessage \| string): ActionFormData` | Text above the buttons |
| `button` | `button(text: RawMessage \| string, iconPath?: string): ActionFormData` | `iconPath` is a texture path in a resource pack, no extension: `"textures/items/emerald"` |
| `header` | `header(text: RawMessage \| string): ActionFormData` | Since 2.0.0 |
| `label` | `label(text: RawMessage \| string): ActionFormData` | Since 2.0.0 |
| `divider` | `divider(): ActionFormData` | Since 2.0.0 |
| `show` | `show(player: Player): Promise<ActionFormResponse>` | Throws `EngineError`, `InvalidEntityError`, `RawMessageError` |

`selection` counts **buttons only**. Labels, headers and dividers don't take an index. Keep a parallel array of actions instead of hard-coding indexes (see `templates/item-menu`).

### MessageFormData

| Method | Signature |
|---|---|
| `title` | `title(titleText: RawMessage \| string): MessageFormData` |
| `body` | `body(bodyText: RawMessage \| string): MessageFormData` |
| `button1` | `button1(text: RawMessage \| string): MessageFormData` |
| `button2` | `button2(text: RawMessage \| string): MessageFormData` |
| `show` | `show(player: Player): Promise<MessageFormResponse>` |

`selection` is 0 for button1 and 1 for button2; closing the form gives `canceled: true` and no selection.

### ModalFormData

| Method | Signature |
|---|---|
| `title` | `title(titleText: RawMessage \| string): ModalFormData` |
| `toggle` | `toggle(label: RawMessage \| string, toggleOptions?: ModalFormDataToggleOptions): ModalFormData` |
| `slider` | `slider(label: RawMessage \| string, minimumValue: number, maximumValue: number, sliderOptions?: ModalFormDataSliderOptions): ModalFormData` |
| `dropdown` | `dropdown(label: RawMessage \| string, items: (RawMessage \| string)[], dropdownOptions?: ModalFormDataDropdownOptions): ModalFormData` |
| `textField` | `textField(label: RawMessage \| string, placeholderText: RawMessage \| string, textFieldOptions?: ModalFormDataTextFieldOptions): ModalFormData` |
| `header` / `label` / `divider` | same shapes as ActionFormData (since 2.0.0) |
| `submitButton` | `submitButton(submitButtonText: RawMessage \| string): ModalFormData` |
| `show` | `show(player: Player): Promise<ModalFormResponse>` |

Option objects (all fields optional):

| Interface | Fields |
|---|---|
| `ModalFormDataToggleOptions` | `defaultValue?: boolean`, `tooltip?: RawMessage \| string` |
| `ModalFormDataSliderOptions` | `defaultValue?: number`, `valueStep?: number`, `tooltip?` |
| `ModalFormDataDropdownOptions` | `defaultValueIndex?: number`, `tooltip?` |
| `ModalFormDataTextFieldOptions` | `defaultValue?: RawMessage \| string`, `tooltip?` |

`formValues` is `(boolean | number | string | undefined)[]`, one entry per control in the order added. `undefined` was added to the type in 2.0.0, together with `label`/`header`/`divider`; those display-only controls are expected to occupy an `undefined` slot, but test it before relying on it. The safe habit: keep display-only controls out of a ModalForm you read by index, and read values through a key list built alongside the form (see `templates/settings-modal`). Dropdown values are the selected index; text fields are strings; sliders are numbers.

Old 1.x signatures (`dropdown(label, options, defaultIndex)`, `slider(label, min, max, step, default)`, `toggle(label, default)`, `textField(label, placeholder, default)`) were removed in 2.0.0. Tutorials still use them; they throw or misbehave on 2.x.

## Responses and errors

| Type | Members |
|---|---|
| `FormResponse` (base) | `canceled: boolean`, `cancelationReason?: FormCancelationReason` |
| `FormCancelationReason` | `UserBusy` (another screen was open, so the form never showed), `UserClosed` |
| `ActionFormResponse` | `selection?: number` |
| `MessageFormResponse` | `selection?: number` |
| `ModalFormResponse` | `formValues?: (boolean \| number \| string \| undefined)[]` |
| `FormRejectError` (promise rejects) | `reason: FormRejectReason` = `MalformedResponse`, `PlayerQuit`, `ServerShutdown` |
| `uiManager.closeAllForms(player)` | Closes the player's open forms (the typings give no detail; test it on DDUI screens too) |

Rules:
- `UserBusy` is normal. A form opened from chat (custom command), while the inventory or pause menu is open, or in the same tick another screen opened, resolves immediately with `canceled: true, cancelationReason: "UserBusy"`. Retry a few times with `await system.waitTicks(...)`. The shared helper in `templates/form-helper` does this.
- Treat `UserClosed` as "back" or "cancel", not as an error.
- Always `.catch` (or `try/await`) a `show()`: a player who leaves mid-form rejects the promise with `FormRejectError` (`PlayerQuit`).
- `show()` is `no-restricted-execution`: it can't run during early execution (top-level module code, `system.beforeEvents.startup`). Call it from after-events, `system.run`, intervals, or a command/component callback wrapped in `system.run`.
- Re-check `player.isValid` after every `await` before you touch the player again.

## Where forms are opened from

| Trigger | Stable API | Notes |
|---|---|---|
| Use an item | `world.afterEvents.itemUse` (`e.source`, `e.itemStack`) or a custom item component `onUse` (wrap in `system.run`) | Most common. Filter by `itemStack.typeId` |
| Slash command | `init.customCommandRegistry.registerCommand(...)` in `system.beforeEvents.startup` | Callback is read-only: `system.run(() => open(origin.sourceEntity))`. Chat is still closing, so the first try is always `UserBusy` |
| Interact with an entity | `world.afterEvents.playerInteractWithEntity` (`e.player`, `e.target`) | Cancel the vanilla interaction with `world.beforeEvents.playerInteractWithEntity` (`cancel = true`), then open in `system.run` |
| Interact with a block | Block custom component `onPlayerInteract(e)` (`e.player`, `e.block`) or `world.afterEvents.playerInteractWithBlock` (check `e.isFirstEvent`) | The component callback is read-only; wrap the open in `system.run` |
| `/scriptevent ns:open menu` | `system.afterEvents.scriptEventReceive.subscribe(cb, { namespaces: ["ns"] })` | `e.sourceEntity`, `e.initiator` (NPC dialogue), `e.sourceType`. Lets command blocks, functions and NPC buttons open script forms |
| Sneak, jump or other buttons | `world.afterEvents.playerButtonInput` (`e.button`, `e.newButtonState`) | For "hold sneak + jump to open" style menus |
| Join | `world.afterEvents.playerSpawn` with `e.initialSpawn` | Wait a few seconds first; while the world is still loading the form tends to come back `UserBusy` |

Item custom component JSON (item format 1.21.90+ takes component ids as keys):
```json
"components": { "ns:open_menu": { "menu": "main" }, "minecraft:max_stack_size": 1 }
```

## Patterns

**Multi-page menu.** One function per page; each page returns after showing the next. A "Back" button re-opens the parent. Don't nest `await` chains deeper than a few pages; pass a `page` id to a router instead (`templates/item-menu/BP/scripts/main.js`).

**Paging long lists.** Keep about 10-20 buttons per page and add "Next"/"Previous" buttons. ActionForms scroll, but very long lists are slow to build and hard to use on touch.

**Shop.** List items with price in the button text, confirm with a `MessageFormData` or `MessageBox`, then re-check the balance and inventory **after** confirmation (time passed). Do the purchase in one synchronous block. See `templates/shop-messagebox`.

**Settings.** `ModalFormData` with defaults from dynamic properties; validate and clamp on submit; save per player with `player.setDynamicProperty`. See `templates/settings-modal`.

**Admin vs player menus.** Gate buttons by `player.commandPermissionLevel` or a tag; never trust that a hidden button can't be pressed (always re-check on the server side of the handler, which is the same script).

**Text entry is not filtered.** `ModalFormData` text fields return raw player text. If other players will see it (signs, names, chat), use `CustomForm` + `ObservableString.getFilteredText(player)` (see `ddui-customform.md`) or keep it private.

## Limits and habits

- Button text: short (about 16-20 characters per line on phones). Use `\n` for a second line, or `§7` gray small detail on line two.
- Button icons: resource-pack texture paths (`textures/items/diamond`, `textures/blocks/stone`, or your own `textures/ui/ns/...`). Your own icon PNGs go in your RP; no `item_texture.json` entry is needed for form icons.
- Use `§` formatting codes sparingly; they are part of the text and break JSON UI title checks if you add them inconsistently.
- Localize with `{ translate: "ns.menu.title" }` objects instead of strings (see `hud-and-text.md`).
- One form per player at a time. Opening a second classic form while one is open gives `UserBusy` for the new one.
