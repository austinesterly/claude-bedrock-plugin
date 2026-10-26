# JSON UI elements

Generated 2026-10-26 by `scripts/build-json-reference.mjs` from Mojang's official form definitions in the Microsoft Learn docs repo (content/forms/ui). Search for the component id. Field types come from the schema; when a type is blank, check the example or the linked sub-object.

## Documents and sub-objects (4)

### ui_defs (ui_defs)

The _ui_defs.json file that lists all UI screen files that should be loaded by Minecraft. This file is required for custom UI screens to be recognized.

| Field | Type | Default | Notes |
|---|---|---|---|
| `ui_defs` | stringArray |  | **required**. An array of paths to UI JSON files that should be loaded. Paths are relative to the resource pack root and typically start with 'ui/'. |

Example (Basic _ui_defs.json):
```json
{
 "ui_defs": [
  "ui/my_screen.json",
  "ui/my_common_elements.json"
 ]
}
```

### ui_element (ui_element)

A UI element definition in a Minecraft Bedrock UI screen file. UI elements define the visual and interactive components of Minecraft's user interface.

| Field | Type | Default | Notes |
|---|---|---|---|
| `type` | stringEnum |  | The type of UI element. Determines how the element is rendered and behaves. Values: `panel`, `stack_panel`, `image`, `label`, `button`, `toggle`, `slider`, `slider_box`, `edit_box`, `grid`, `scroll_view`, `scrollbar_box`, `dropdown`, `input_panel`, `screen`, `custom`, `factory`, `selection_wheel`. |
| `renderer` | string |  | The renderer to use for custom element types. Examples include 'hud_player_renderer', 'inventory_item_renderer', etc. |
| `layer` | int |  | The rendering layer for this element. Higher values render on top of lower values. |
| `size` | numberArray |  | The size of the UI element. Can be specified as [width, height] where each can be a number (pixels), percentage string ('100%'), or special value ('fill', '100%c', '100%cm'). |
| `offset` | numberArray |  | The offset of the UI element from its anchor position. Specified as [x, y] in pixels. |
| `min_size` | numberArray |  | The minimum size constraints for the UI element. |
| `max_size` | numberArray |  | The maximum size constraints for the UI element. |
| `anchor_from` | stringEnum |  | The anchor point on the parent element from which this element is positioned. Values: `top_left`, `top_middle`, `top_right`, `left_middle`, `center`, `right_middle`, `bottom_left`, `bottom_middle`, `bottom_right`. |
| `anchor_to` | stringEnum |  | The anchor point on this element used for positioning. Values: `top_left`, `top_middle`, `top_right`, `left_middle`, `center`, `right_middle`, `bottom_left`, `bottom_middle`, `bottom_right`. |
| `orientation` | stringEnum |  | The orientation for stack panels, determining the direction children are laid out. Values: `horizontal`, `vertical`. |
| `texture` | string |  | The texture path for image elements. Relative to the resource pack textures folder. |
| `uv` | numberArray |  | UV coordinates for texture mapping, specified as [u, v]. |
| `uv_size` | numberArray |  | The size of the UV region to sample from the texture. |
| `color` | numberArray |  | The color tint applied to the element, specified as [r, g, b] with values 0.0-1.0. |
| `alpha` | float |  | The opacity of the element, from 0.0 (transparent) to 1.0 (opaque). |
| `visible` | boolean |  | Whether this element is visible by default. |
| `enabled` | boolean |  | Whether this element is enabled and can be interacted with. |
| `ignored` | boolean |  | If true, this element is ignored during layout and rendering. |
| `text` | string |  | The text content for label elements. Can include localization keys. |
| `text_alignment` | stringEnum |  | The horizontal alignment of text within a label. Values: `left`, `center`, `right`. |
| `shadow` | boolean |  | Whether to render a shadow behind text. |
| `font_type` | stringEnum |  | The font to use for text rendering. Values: `default`, `smooth`, `rune`, `unicode`, `MinecraftTen`. |
| `font_size` | stringEnum |  | The size of the font for text rendering. Values: `small`, `normal`, `large`, `extra_large`. |
| `font_scale_factor` | boolean |  | A multiplier for the font size. |
| `controls` | objectArray |  | Child elements contained within this element. |
| `bindings` | objectArray |  | Data bindings that connect UI element properties to game data. |
| `button_mappings` | objectArray |  | Mappings from input buttons to actions. |
| `anims` | stringArray |  | Animation references to apply to this element. |
| `animation_reset_name` | string |  | The name of the animation state to reset to. |
| `variables` | keyedObjectCollection |  | Variable definitions for conditional logic. |
| `clips_children` | boolean |  | Whether child elements are clipped to this element's bounds. |
| `allow_clipping` | boolean |  | Whether this element can be clipped by parent elements. |
| `propagate_alpha` | boolean |  | Whether alpha transparency is propagated to child elements. |
| `grid_rescaling_type` | stringEnum |  | How the grid resizes its cells. Values: `none`, `horizontal`, `vertical`. |
| `grid_item_template` | int |  | The template element to use for grid items. |
| `grid_dimension_binding` | string |  | The binding for determining grid dimensions. |
| `collection_name` | string |  | The name of the collection to use for grid or stack panel items. |
| `factory` | string |  | The factory configuration for dynamic element creation. |
| `focus_enabled` | boolean |  | Whether this element can receive focus. |
| `default_focus_precedence` | boolean |  | Priority for receiving default focus. |
| `focus_change_up` | stringEnum |  | The element to focus when navigating up. |
| `focus_change_down` | stringEnum |  | The element to focus when navigating down. |
| `focus_change_left` | stringEnum |  | The element to focus when navigating left. |
| `focus_change_right` | stringEnum |  | The element to focus when navigating right. |
| `tts_ignore_count` | boolean |  | Whether to ignore this element when counting for text-to-speech. |
| `tts_skip_message` | boolean |  | Whether to skip this element in text-to-speech narration. |
| `tts_control_type_order_priority` | string |  | The priority for ordering elements in text-to-speech. |
| `consume_event` | boolean |  | Whether input events are consumed by this element. |
| `always_handle_pointer` | boolean |  | Whether pointer events are always handled by this element. |
| `modal` | boolean |  | Whether this element acts as a modal overlay. |
| `prevent_touch_input` | boolean |  | Whether touch input is blocked by this element. |
| `locked_control` | boolean |  | The control to display when this element is locked. |
| `slider_range` | float |  | The range for slider elements. |
| `slider_steps` | float |  | The number of discrete steps in a slider. |
| `slider_select_on_hover` | string |  | Whether the slider value changes on hover. |
| `max_length` | int |  | Maximum character length for text input elements. |
| `text_box_name` | string |  | The name identifier for a text box. |
| `place_holder_text` | string |  | Placeholder text shown when an input is empty. |
| `virtual_keyboard_buffer_control` | boolean |  | Whether this input uses a virtual keyboard buffer. |
| `nine_slice_buttom` | int |  | The bottom size for nine-slice image rendering. |
| `nine_slice_top` | int |  | The top size for nine-slice image rendering. |
| `nine_slice_left` | int |  | The left size for nine-slice image rendering. |
| `nine_slice_right` | int |  | The right size for nine-slice image rendering. |
| `tiled` | boolean |  | Whether the texture is tiled when rendering. |
| `fill` | stringEnum |  | Whether image fills its container. |
| `grayscale` | boolean |  | Whether the element is rendered in grayscale. |
| `keep_ratio` | boolean |  | Whether to maintain aspect ratio when scaling. |
| `bilinear` | boolean |  | Whether to use bilinear filtering for textures. |
| `clip_pixelperfect` | boolean |  | Whether clipping is pixel-perfect. |
| `scroll_speed` | stringEnum |  | The speed of scrolling in scroll views. |
| `scrollbar_touch_button` | boolean |  | Whether the scrollbar responds to touch. |
| `jump_to_bottom_on_update` | boolean |  | Whether to auto-scroll to bottom when content updates. |
| `scrollbar_box` | string |  | Reference to the scrollbar box element. |
| `scrollbar_track` | string |  | Reference to the scrollbar track element. |
| `scroll_view_port` | string |  | Reference to the scroll viewport element. |
| `scroll_content` | string |  | Reference to the scrollable content element. |
| `scroll_box_and_track_panel` | string |  | Reference to the panel containing scrollbar box and track. |

### ui_global_variables (ui_global_variables)

The _global_variables.json file that defines global variables used across all UI screens in Minecraft. Variables are defined with '$' prefix and can include colors, sizes, and other values.

> Variable names must start with '$'. Colors are typically specified as [r, g, b] or [r, g, b, a] arrays with values between 0.0 and 1.0.

| Field | Type | Default | Notes |
|---|---|---|---|
| `$button_text_color` | string |  | $button Text Color |
| `$background_color` | string |  | $background Color |
| `$highlight_color` | string |  | $highlight Color |

Example (Color variable examples):
```json
{
 "$button_text_color": [
  1,
  1,
  1
 ],
 "$background_color": [
  0.2,
  0.2,
  0.2,
  0.8
 ],
 "$highlight_color": [
  1,
  0.84,
  0
 ]
}
```

### ui_screen (ui_screen)

A UI screen definition file for Minecraft Bedrock Edition. UI screens define complete interface layouts including namespaces, element definitions, and global variables.

> UI screen files use a namespace-based structure where each JSON key (except 'namespace') defines a UI element. Elements can inherit from other elements using the '@' syntax (e.g., 'my_button@common.button'). Variables are defined with '$' prefix and can be overridden.

| Field | Type | Default | Notes |
|---|---|---|---|
| `namespace` | string |  | The namespace for this UI screen. Used to reference elements from other UI files using the 'namespace.element_name' syntax. |
