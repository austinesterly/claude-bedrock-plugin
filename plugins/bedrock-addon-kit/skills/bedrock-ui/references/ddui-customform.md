# Data-Driven UI: CustomForm, MessageBox, observables

Stable since `@minecraft/server-ui` 2.1.0 (`image()` added in 2.2.0). Checked against the 2.2.0 typings and the Learn guide "Introduction to the Data-Driven UI (DDUI) Framework" (`Documents/scripting/intro-to-ddui.md`). Channel status of newer members comes from `../../bedrock-whats-new/references/api-surface.md` (rc 2.3.0-rc.1.26.60-preview.30, beta 2.4.0-beta.1.26.60-preview.30).

What DDUI adds over classic forms:
- Controls bind to **observables**; calling `setData` updates the open screen live.
- Buttons take **callbacks** and the form stays open after a click, so one screen can take many actions.
- Any control can be shown/hidden (`visible`) or greyed out (`disabled`) at runtime.
- The player is passed to the constructor, and `show()` takes no argument.

DDUI screens are not drawn by the JSON UI `server_form.json` file, and no vanilla JSON UI file references them, so JSON UI restyles don't apply to them (see `json-ui.md`).

## CustomForm (stable 2.2.0)

`new CustomForm(player: Player, title: ObservableString | ObservableUIRawMessage | string | UIRawMessage)`

Below, `Text` = `ObservableString | ObservableUIRawMessage | string | UIRawMessage`.

| Method | Signature | Notes |
|---|---|---|
| `button` | `button(label: Text, onClick: () => void, options?: ButtonOptions): CustomForm` | Callback runs while the form stays open |
| `closeButton` | `closeButton(): CustomForm` | Adds a close button at the bottom and an X in the corner |
| `divider` | `divider(options?: DividerOptions): CustomForm` | |
| `dropdown` | `dropdown(label: Text, value: ObservableNumber, items: DropdownItemData[], options?: DropdownOptions): CustomForm` | `value` holds the selection |
| `header` | `header(text: Text, options?: TextOptions): CustomForm` | |
| `image` | `image(src: ObservableString \| string, pack: ObservableString \| string, options?: ImageOptions): CustomForm` | Since 2.2.0. `src` is a path relative to the pack; `pack` is "the resource pack identifier" (docs wording; use your RP's header UUID and test). GIFs work but load slowly |
| `label` | `label(text: Text, options?: TextOptions): CustomForm` | |
| `slider` | `slider(label: Text, value: ObservableNumber, min: number \| ObservableNumber, max: number \| ObservableNumber, options?: SliderOptions): CustomForm` | |
| `spacer` | `spacer(options?: SpacingOptions): CustomForm` | |
| `textField` | `textField(label: Text, text: ObservableString, options?: TextFieldOptions): CustomForm` | |
| `toggle` | `toggle(label: Text, toggled: ObservableBoolean, options?: ToggleOptions): CustomForm` | |
| `show` | `show(): Promise<DataDrivenScreenClosedReason>` | Throws `EngineError`, `FormVisibilityError`, `InvalidEntityError` |
| `close` | `close(): void` | Throws `FormVisibilityError` if not showing |
| `isShowing` | `isShowing(): boolean` | |

Builder methods throw `InvalidFormModificationError` when the form is modified after it has been shown ("form properties cannot be changed while the form is active"). Build the whole layout first, and use `visible` observables for parts that appear later. `show()` on a form that is already showing throws `FormVisibilityError` (`AlreadyShowing`); `close()` on one that isn't throws `FormVisibilityError` (`NotShowing`).

### Option interfaces (stable 2.2.0)

| Interface | Fields |
|---|---|
| `ButtonOptions` | `disabled?: boolean \| ObservableBoolean`, `tooltip?: Text`, `visible?: boolean \| ObservableBoolean` |
| `DividerOptions`, `SpacingOptions` | `visible?` |
| `TextOptions` | `visible?` |
| `DropdownOptions` | `description?: Text`, `disabled?`, `visible?` |
| `DropdownItemData` | `label: Text`, `value: number`, `description?: Text` |
| `SliderOptions` | `description?`, `disabled?`, `step?: number \| ObservableNumber`, `visible?` |
| `TextFieldOptions` | `description?`, `disabled?`, `visible?` |
| `ToggleOptions` | `description?`, `disabled?`, `visible?` |
| `ImageOptions` | `onClick?: () => void`, `tooltip?: Text`, `visible?`, `width?: number \| ObservableNumber` |

Dropdown: the docs say the `ObservableNumber` "holds the index of the currently selected item", while each item also carries a `value`. Give items `value` equal to their index (0, 1, 2, ...) and the two readings agree.

### Closing and busy

`show()` resolves with `DataDrivenScreenClosedReason`:

| Value | Meaning |
|---|---|
| `ClientClosed` | The player closed it (X, close button, Esc) |
| `ServerClosed` | Your script called `form.close()` or `uiManager.closeAllForms(player)` |
| `UserBusy` | It never opened because another screen was up. Retry later |

There is no `UserClosed` value here (that name belongs to classic `FormCancelationReason`).

## MessageBox (stable 2.2.0)

`new MessageBox(player: Player, title: Text)`

| Method | Signature |
|---|---|
| `body` | `body(body: Text): MessageBox` |
| `button1` | `button1(label: Text, tooltip?: Text): MessageBox` |
| `button2` | `button2(label: Text, tooltip?: Text): MessageBox` |
| `show` | `show(): Promise<MessageBoxResult>` |
| `close` / `isShowing` | as CustomForm |

`MessageBoxResult` = `{ closeReason: DataDrivenScreenClosedReason, selection?: number }`. Per the Learn guide, `selection` is **1** for button1, **2** for button2, and `undefined` if closed without a choice. (Classic `MessageFormData` uses 0 and 1. Don't mix them up.)

## Observables (stable 2.2.0)

| Class | Constructor | Methods |
|---|---|---|
| `ObservableBoolean` | `new ObservableBoolean(data: boolean, options?: ObservableOptions)` | `getData()`, `setData(v)`, `subscribe(cb)` returns `cb`, `unsubscribe(cb): boolean` |
| `ObservableNumber` | `new ObservableNumber(data: number, options?)` | same |
| `ObservableString` | `new ObservableString(data: string, options?)` | same, plus `getFilteredText(player): Promise<TextFilteringError[] \| string>` |
| `ObservableUIRawMessage` | `new ObservableUIRawMessage(data: UIRawMessage, options?)` | same |

- `ObservableOptions` = `{ clientWritable: boolean }`. **Inputs need `clientWritable: true`** (toggle, slider, dropdown, textField values) or the player's changes don't reach the server. Display-only text, `visible` and `disabled` flags stay server-only (omit the option).
- `subscribe` fires when the value changes, from either side. Use it for live previews and dependent controls (`advanced.subscribe(v => notAdvanced.setData(!v))`).
- `getFilteredText(player)` runs the platform text filter. It resolves to the filtered string, or to an array of `TextFilteringError` (`DisabledByPlayer`, `TextProcessorServiceUnreachable`, `Unknown`). Use it for any text other players will see.
- `UIRawMessage` = `{ text?, translate?, with?: string[] | UIRawMessage, rawtext?: UIRawMessage[] }`. Unlike server `RawMessage` it has no `score`.
- An observable can be shared by several forms and several players. Per-player values need per-player observables.
- `InvalidObservableError` is "thrown when an observable value is expected to be writable, but it is not": an input control given an observable without `clientWritable: true`.

## Coming next (not in stable 2.2.0)

| Member | Channel | What it does |
|---|---|---|
| `ButtonOptions.imageDetails` (`ImageDetails` = `{ imageSrc, imagePackId }`) | rc 2.3.0 (game 26.60) | Icon on a CustomForm button |
| `tooltip` on `DropdownOptions`, `SliderOptions`, `TextFieldOptions`, `TextOptions`, `ToggleOptions` | rc 2.3.0 | Hover tooltips on controls (buttons already have `tooltip` in 2.2.0) |
| `MessageBox.button1WithOptions(label, options?: MessageBoxButtonOptions)`, `button2WithOptions` | rc 2.3.0 | `MessageBoxButtonOptions` = `{ tooltip?, imageDetails? }` |
| `CustomForm.multiButtonRow(buttons: ButtonData[], options?: MultiButtonRowOptions)` (max 3), `ButtonData` = `{ label, onClick, options? }`, `MultiButtonRowOptions` = `{ visible? }` | rc 2.4.0 (game 26.70) | Row of buttons |
| `CustomForm` constructor `options?: CustomFormOptions` (`topCloseButtonVisible`) | beta 2.5.0 | Hide the top close button |
| `MessageBox` constructor `options?: MessageBoxOptions` (`showHorizontalButtons`), `button3WithOptions` | rc 2.4.0 (game 26.70) | Three-button, horizontal message boxes |
| `body(body, options?: MessageBoxBodyOptions)` | beta 2.5.0 | |
| `SliderOptions.fixedFormatDigits` | beta 2.5.0 | |

The 2.3.0 members become stable when 26.60 ships with `@minecraft/server-ui` 2.3.0, and the 2.4.0 members when 26.70 ships with 2.4.0 (Preview 26.70.21 moved them out of beta). Until then, a pack pinned to 2.2.0 must not use them; check `../../bedrock-whats-new/references/current-versions.md` before raising the dependency.

## Patterns

**Live dashboard.** Observables updated from a `system.runInterval`; clear the interval when `show()` resolves (any reason) and when the player leaves. `templates/live-dashboard`.

**Action panel.** Several buttons whose callbacks change state and update a status label; the form stays open. Disable buttons that can't be used right now (`disabled: someObservable`).

**Settings with live preview.** Client-writable observables + `subscribe` to preview (play a sound, show actionbar text); save on close.

**Confirm.** `MessageBox` with `selection === 1` meaning yes. `templates/shop-messagebox`.

**Callback safety.** Button callbacks run in normal (writable) script context, but the player can click fast: make actions idempotent or disable the button while work runs. Re-check `player.isValid`.

**Busy retry.** Same as classic forms: `UserBusy` resolves immediately. Whether the same `CustomForm` object can be shown again after a `UserBusy` result isn't documented, so the helper in `templates/form-helper/BP/scripts/ui/forms.js` takes a **builder function** and builds a fresh form for each try.

## Migration (from the Learn guide)

| Classic | DDUI |
|---|---|
| `new ActionFormData()` / `new ModalFormData()` | `new CustomForm(player, title)` |
| `new MessageFormData()` | `new MessageBox(player, title)` |
| `.show(player)` | `.show()` |
| `.button("text")` + `response.selection` | `.button("text", () => ...)` |
| `response.formValues[i]` | `observable.getData()` |
