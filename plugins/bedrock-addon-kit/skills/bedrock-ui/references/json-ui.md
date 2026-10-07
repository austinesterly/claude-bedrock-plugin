# JSON UI (resource-pack UI files)

**Read the risks first.** JSON UI is the legacy UI system that draws many vanilla screens from `RP/ui/*.json`. Mojang has never published it as a stable creator feature: the Learn "JSON UI Documentation" pages are short, generated ("ai-usage: ai-assisted" in their headers) and list properties without semantics. Screens move to Ore UI (a different, non-moddable system) one by one, and vanilla UI files change every release. Treat every JSON UI edit as something that can break on the next update.

| Risk | What it means for you |
|---|---|
| Not a stable creator API | No compatibility promise. Elements, bindings and variable names can be renamed or removed in any release |
| Ore UI migration | When a screen moves to Ore UI, your edits to it stop doing anything. Several screens have already moved, and Mojang's stated direction is more Ore UI |
| Marketplace | Marketplace content guidelines restrict UI modifications; the house rule in `bedrock-addon-conventions` is "avoid JSON UI in shipped packs". Check the current Marketplace guidelines before submitting anything that touches `ui/` |
| Pack conflicts | Two packs editing the same vanilla element: the higher pack wins, the other pack's edits vanish |
| Platforms | Pocket vs desktop layouts differ (`$pocket_screen`, `$desktop_screen`). Test on touch and controller |

**Always keep a working fallback**: the add-on must still be fully usable with the JSON UI part removed or broken. For server forms that means the plain vanilla form still shows and still works (the template in `templates/json-ui-form-layout` is built that way).

What is documented vs community practice is labeled in each section below: **[Learn]** = official JSON UI reference pages, **[vanilla]** = seen in the 1.26.50.4 vanilla `resource_pack/ui` files, **[community]** = widely used by creators but not documented by Mojang.

## Files

| File | Shape | Source |
|---|---|---|
| `RP/ui/_ui_defs.json` | `{ "ui_defs": ["ui/ns_forms.json", ...] }` lists extra UI files to load. Paths are relative to the RP root | [Learn] |
| `RP/ui/_global_variables.json` | `{ "$ns_accent": [1, 0.84, 0] }`: variables visible to every screen. Names start with `$`; colors are `[r,g,b]` or `[r,g,b,a]` in 0-1 | [Learn] |
| `RP/ui/<screen>.json` | `{ "namespace": "ns_forms", "<element>": { ... }, ... }`: every key except `namespace` is an element | [Learn] |
| A file with the same path as a vanilla file (e.g. `ui/server_form.json`) | Its elements are merged over the vanilla file's elements of the same name | [community] |

Your `_ui_defs.json` only needs your new files; the game combines it with vanilla's list [community: that the lists are combined rather than replaced; vanilla's own `_ui_defs.json` lists ~200 files]. Vanilla files contain `//` and `/* */` comments [vanilla], but write your own files as strict JSON.

## Elements

Element key syntax [Learn, vanilla]:
- `"name": { ... }` defines an element.
- `"name@namespace.base": { ... }` defines an element that inherits from `base` in `namespace`, then overrides properties.
- Children go in `"controls": [ { "child_name": { ... } }, { "other@ns.base": {} } ]`, an array of one-key objects.

`type` values [Learn schema]: `panel`, `stack_panel`, `image`, `label`, `button`, `toggle`, `slider`, `slider_box`, `edit_box`, `grid`, `scroll_view`, `scrollbar_box`, `dropdown`, `input_panel`, `screen`, `custom`, `factory`, `selection_wheel`.

Most used properties (full table with types: `../../bedrock-json-reference/references/json-ui.md`):

| Property | Notes |
|---|---|
| `size`, `offset`, `min_size`, `max_size` | `[w, h]`; numbers are pixels, plus strings like `"100%"`, `"100% - 4px"`, `"100%c"` (fit children), `"100%cm"`, `"100%sm"`, `"fill"`, `"default"` [Learn, vanilla] |
| `anchor_from`, `anchor_to` | `top_left`, `top_middle`, `top_right`, `left_middle`, `center`, `right_middle`, `bottom_left`, `bottom_middle`, `bottom_right` [Learn] |
| `layer` | Draw order; higher on top [Learn] |
| `visible`, `ignored`, `enabled`, `alpha`, `propagate_alpha` | `ignored: true` removes the element from layout entirely; `visible` only hides it [Learn]. Both accept expressions like `"(not $is_editor_mode_enabled)"` [vanilla] |
| `text`, `color`, `font_type`, `font_size`, `font_scale_factor`, `shadow`, `text_alignment`, `localize` | Labels. `font_type`: `default`, `smooth`, `rune`, `unicode`, `MinecraftTen`; `font_size`: `small`, `normal`, `large`, `extra_large` [Learn] |
| `texture`, `uv`, `uv_size`, `nine_slice_*`, `tiled`, `keep_ratio`, `bilinear`, `grayscale` | Images; `texture` is a path like `"textures/ui/hud_tip_text_background"` [Learn, vanilla] |
| `orientation` | `stack_panel` direction: `horizontal` / `vertical` [Learn] |
| `factory`, `collection_name`, `grid_item_template`, `grid_rescaling_type` | Generated children (see below) [Learn, vanilla] |
| `renderer` | For `type: "custom"`: e.g. `inventory_item_renderer`, `paper_doll_renderer`, `progress_bar_renderer`, `gradient_renderer`, `name_tag_renderer` [vanilla] |
| `button_mappings` | `[{ from_button_id, to_button_id, mapping_type }]`, `mapping_type`: `pressed`, `double_pressed`, `global`, `focused` [Learn] |
| `anims` / `alpha: "@ns.anim_name"` | Animation elements with `anim_type` `alpha`, `offset`, `size`, `color`, `uv`, `flip_book`, `aseprite_flip_book`, `wait`; fields like `duration`, `from`, `to`, `easing`, `next`, `destroy_at_end`, `end_event` [vanilla `hud_screen.json`] |

## Variables

- `"$name": value` inside an element sets a variable for that element and its children; a child created with `@` can override it [Learn note on ui_screen, vanilla].
- `"$name|default": value` sets it only if nothing above set it [vanilla, e.g. `"$title_size|default"` in `ui_template_dialogs.json`].
- Conditional overrides [vanilla]:
```json
"variables": [
  { "requires": "$pocket_screen", "$panel_size": [ 200, 150 ] },
  { "requires": "(not $pocket_screen)", "$panel_size": [ 260, 200 ] }
]
```
  The Learn schema lists `requires` as the only documented key. Vanilla `requires` conditions include `$desktop_screen`, `$pocket_screen`, `$education_edition`, `$is_editor_mode_enabled`, button states `$default_state`/`$hover_state`/`$pressed_state`/`$locked_state`.

## Bindings

A binding copies data from the game (or from another control) into a property [Learn fields, vanilla usage]:

| Field | Values / use |
|---|---|
| `binding_name` | Source name, e.g. `#title_text`, `#form_text`, `#hud_title_text_string` |
| `binding_name_override` | Target property, e.g. `#text`, `#visible`, `#texture`, `#collection_length` |
| `binding_type` | `global` (default), `collection`, `collection_details`, `view`, `none` |
| `binding_collection_name` | For `collection` bindings, e.g. `form_buttons` |
| `binding_condition` | `always`, `always_when_visible`, `visible`, `once`, `visibility_changed`, `none` |
| `source_control_name`, `source_property_name`, `target_property_name`, `resolve_sibling_scope` | `view` bindings: compute from another control's properties |

`view` bindings accept expressions in `source_property_name` [vanilla]: `"(not (#texture = ''))"`, `"(not ((#texture = '') or (#texture = 'loading')))"`, `"(#texture = 'loading')"`. Operators seen in vanilla: `=`, `not`, `and`, `or`, parentheses, string literals in single quotes.

**String contains check [community]:** `(not ((#title_text - 'marker') = #title_text))` is true when `#title_text` contains `marker`. `-` on strings removes the substring. It's the basis of every "custom form layout by title" trick, and it isn't documented anywhere official.

## Factories and collections [vanilla]

A `factory` creates children from game data. `server_form.json` uses them twice:
- `main_screen_content` has a `factory` with `control_ids: { "long_form": "@server_form.long_form", "custom_form": "@server_form.custom_form" }`: `long_form` draws `ActionFormData` (title, body, button list) and `custom_form` draws `ModalFormData` (toggles, sliders, dropdowns, inputs, submit). This mapping is inferred from what each layout contains.
- `long_form_dynamic_buttons_panel` has `factory.name: "buttons"`, `control_ids` for `button`, `label`, `header`, `divider`, `collection_name: "form_buttons"`, and binds `#form_button_contents` to `#collection_length`.

Each generated button binds `#form_button_text`, `#form_button_texture` and `#form_button_texture_file_system` from the `form_buttons` collection and presses `button.form_button_click`. The ActionForm title binds `#title_text`, the body `#form_text`.

The vanilla 1.26.50 factory only lists `long_form` and `custom_form`; how `MessageFormData` is drawn is not visible in these files (unverified). `CustomForm` and `MessageBox` (DDUI) are not referenced by any vanilla JSON UI file, so treat them as not restylable.

## Editing vanilla screens

Three ways, safest first:

1. **Add your own file and namespace** (`ui/ns_forms.json` + `_ui_defs.json`), and change one small vanilla element to point at it. Least conflict, smallest blast radius. Used by the template.
2. **Override an element in a same-named file** (`ui/server_form.json` with `"namespace": "server_form"` and only the elements you change) [community]. Properties you give replace vanilla's for that element; arrays such as `controls` and `bindings` are replaced whole, so copy the vanilla array and edit it.
3. **`modifications` array** [community, undocumented; not used in any vanilla 1.26.50 file]. Creators edit vanilla arrays in place instead of replacing them, e.g.
   ```json
   "root_panel": { "modifications": [ { "array_name": "controls", "operation": "insert_back", "value": [ { "ns_panel@ns_hud.panel": {} } ] } ] }
   ```
   Operations used in community packs: `insert_back`, `insert_front`, `insert_after`, `insert_before`, `move_back`, `move_front`, `move_after`, `move_before`, `swap`, `replace`, `remove` (with `where` / `target` / `control_name` selectors). Nothing official describes it; verify every operation in the current game.

Never copy a whole vanilla screen file into your pack: it freezes that screen at today's version and breaks the next update.

## Restyling server forms by title [community]

Script side: put an invisible marker in the title. `§v`-`§z` formatting codes have no visible effect (Learn Raw Message page), so `"§v§wShop"` shows as "Shop" in the vanilla layout.
```js
new ActionFormData().title("§v§wShop").body("...").button("Bread", "textures/items/bread")
```
UI side: route `long_form` to a panel that holds both the vanilla layout and yours, each made visible by a title check. With the JSON UI removed or broken the vanilla form still shows the same buttons. Full files: `templates/json-ui-form-layout/`.

Rules for title-keyed layouts:
- Reuse vanilla's `server_form.long_form_panel` / `long_form_dynamic_buttons_panel` for the buttons, so clicks keep working. Change size, background and title, not the button wiring.
- One marker per layout; keep markers out of localized text and add them in code. The template uses a plain string title. With a rawtext title (`{ rawtext: [{ text: "§v§w" }, { translate: "ns.shop.title" }] }`) the check should see the resolved text, but that isn't documented: test it.
- Both layouts exist at once (one hidden). Keep yours light.

## HUD screen [vanilla, community]

`hud_screen.json` (`namespace: "hud"`): `root_panel` holds factories `hud_actionbar_text_area` and `hud_title_text_area`; the title label binds `#hud_title_text_string` (global), the subtitle `#hud_subtitle_text_string`, and the action bar label uses `$actionbar_text`. Community HUD mods hide the normal title when it contains a marker and draw custom panels from the title string (for example bars or icons), driven by `setTitle` from script. It works, but every HUD edit is high-risk: the HUD changes often, and a broken HUD affects every screen of play. Prefer script-only HUD (`hud-and-text.md`) and keep any JSON UI HUD purely cosmetic.

## Debugging

- The content log reports UI parse errors with the file name; turn on Content Log GUI.
- An element that silently doesn't appear is usually a bad `@namespace.element` reference or a size of 0 (a parent with `"size": [0, 0]` is fine for anchored children with fixed sizes, but percentage sizes of 0 are 0).
- Change one thing at a time and re-enter the world (UI files load with the resource pack; `/reload` does not reload them).
- Re-test every JSON UI edit on each new release and Preview.
