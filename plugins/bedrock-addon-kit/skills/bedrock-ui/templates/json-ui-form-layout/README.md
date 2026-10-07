# JSON UI example: a custom ActionForm layout chosen by title

> **WARNING: JSON UI is not a stable creator feature.**
> Mojang documents it only as a short generated property list, changes vanilla UI files every release, and is moving screens to Ore UI, which can't be modded. Marketplace guidelines restrict UI modifications. This example can stop working, or break every ActionForm in the world, after any update.
> Keep it optional: the add-on must work with `RP/ui/` deleted. If forms stop appearing after an update, delete `RP/ui/server_form.json` first.
> Built against vanilla 1.26.50.4 `resource_pack/ui/server_form.json` and `ui_template_dialogs.json`. Re-check both files on every release.

## What it does

`BP/scripts/wide_menu.js` shows a normal `ActionFormData` whose title starts with `§v§w`. Those formatting codes have no visible effect, so without this resource pack the vanilla form shows "Wide menu" as usual. With it, that form is drawn in a wider panel (340x240, 300x210 on pocket screens) with a gold title. Every other ActionForm keeps the vanilla look.

## Files

| File | Role | Source of the shapes |
|---|---|---|
| `RP/ui/_ui_defs.json` | Loads `ui/ns_forms.json` | Learn ui_defs reference |
| `RP/ui/server_form.json` | Overrides one vanilla element, `server_form.main_screen_content`, so the `long_form` factory entry points at `ns_forms.long_form_router`. Everything else is a copy of vanilla 1.26.50 | vanilla `server_form.json` |
| `RP/ui/ns_forms.json` | `long_form_router` holds the vanilla `server_form.long_form` and `wide_form`, each shown by a title check. `wide_form` reuses vanilla `common_dialogs.main_panel_no_buttons` and vanilla `server_form.long_form_panel`, so the button list, icons, scrolling and clicks are vanilla | vanilla `server_form.json`, `ui_template_dialogs.json`, `hud_screen.json` (variables pattern) |
| `BP/scripts/wide_menu.js` | Opens the marked form (`/scriptevent ns:wide`) | `@minecraft/server-ui` 2.2.0 |

## Documented vs community

| Piece | Status |
|---|---|
| `_ui_defs.json`, `namespace`, `@` inheritance, `controls`, `bindings` fields, `type` values | Learn JSON UI reference |
| `factory` + `control_ids`, `$var` overrides, `variables` + `requires` + `$pocket_screen`, `view` bindings with expressions | Seen in vanilla files, not explained by Learn |
| A same-named RP file (`ui/server_form.json`) merging over the vanilla file element by element | Community practice |
| `(#title_text - 'marker')` string removal as a "contains" test | Community practice, undocumented |
| `§v`/`§w` as invisible markers | Learn Raw Message page lists `§v`-`§z` as "no effect"; using them as markers is community practice |

## Install

1. Copy `RP/ui/*` into your resource pack, `BP/scripts/wide_menu.js` into your behavior pack scripts, and `templates/form-helper/BP/scripts/ui/forms.js` to `BP/scripts/ui/forms.js`.
2. `import "./wide_menu.js";` from `main.js`.
3. Re-enter the world (UI files load with the resource pack; `/reload` won't pick them up).
4. `/scriptevent ns:wide`. Then open any other ActionForm and check it still looks vanilla.

## Test checklist (every release and Preview)

- Marked form shows the wide layout; buttons click and return the right index.
- Unmarked ActionForms look and work like vanilla.
- ModalForms (`custom_form`) still open.
- Touch (pocket) layout fits; controller focus moves through the buttons.
- With `RP/ui/` removed, everything still works.
- Content log shows no UI errors.
