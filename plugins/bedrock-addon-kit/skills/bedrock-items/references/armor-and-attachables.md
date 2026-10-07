# Armor, wearables and attachables

An attachable (`RP/attachables/*.json`, root `minecraft:attachable`) is a small client model shown when an entity holds or wears an item. Fields (Learn attachable reference):
- `identifier`
- `item`: a map of item id to a Molang condition. When absent, the identifier is used as the item.
- `materials`, `textures`, `geometry`, `animations`, `scripts` (`parent_setup`, `pre_animation`, `animate`, `scale`)
- `render_controllers`, `particle_effects`, `sound_effects`, `enable_attachables`, `min_engine_version`

Vanilla 1.26.50.4 attachables use format `1.8.0` (wearer variants) and `1.10.0` (`.player` variants, bow). At format 1.26.0+, `pre_animation` and `initialize` may use multi-line `{}` scopes.

## 1. Armor set: the file chain

For each piece (`templates/armor-set`):

| File | Content |
|---|---|
| `BP/items/ruby_helmet.json` | `wearable` slot + protection, `durability`, `repairable`, `enchantable` `armor_head`, `max_stack_size` 1, tag `minecraft:is_armor` |
| `RP/attachables/ruby_helmet.json` | Wearer variant: armor stands, zombies and others. Vanilla `geometry.humanoid.armor.helmet` |
| `RP/attachables/ruby_helmet.player.json` | Player variant: `item` condition `query.owner_identifier == 'minecraft:player'`, vanilla `geometry.player.armor.helmet`, `animation.armor.helmet.offset` |
| `RP/textures/models/armor/ruby_1.png` | 64x32 armor layer 1 (helmet, chestplate, boots) |
| `RP/textures/models/armor/ruby_2.png` | 64x32 armor layer 2 (leggings) |
| `RP/textures/items/ruby_helmet.png` + `item_texture.json` entry | Inventory icon |
| `RP/texts/en_US.lang` | `item.ns:ruby_helmet.name=Ruby Helmet` |

This mirrors vanilla `diamond_helmet.json` + `diamond_helmet.player.json` exactly. The armor geometries, offset animations and `controller.render.armor` are vanilla resources, so your pack only references them.

| Piece | `wearable.slot` | `enchantable.slot` | Geometry suffix | Layer | `parent_setup` |
|---|---|---|---|---|---|
| Helmet | `slot.armor.head` | `armor_head` | `helmet` | `_1` | `variable.helmet_layer_visible = 0.0;` |
| Chestplate | `slot.armor.chest` | `armor_torso` | `chestplate` | `_1` | `variable.chest_layer_visible = 0.0;` |
| Leggings | `slot.armor.legs` | `armor_legs` | `leggings` | `_2` | `variable.leg_layer_visible = 0.0;` |
| Boots | `slot.armor.feet` | `armor_feet` | `boots` | `_1` | `variable.boot_layer_visible = 0.0;` |

`parent_setup` hides the wearer's default armor layer for that slot. The template's protection and durability numbers match diamond (3/8/6/3; 363/528/495/429).

Player variant (helmet):
```json
{
  "format_version": "1.10.0",
  "minecraft:attachable": {
    "description": {
      "identifier": "ns:ruby_helmet.player",
      "item": { "ns:ruby_helmet": "query.owner_identifier == 'minecraft:player'" },
      "materials": { "default": "armor", "enchanted": "armor_enchanted" },
      "textures": { "default": "textures/models/armor/ruby_1", "enchanted": "textures/misc/enchanted_actor_glint" },
      "geometry": { "default": "geometry.player.armor.helmet" },
      "scripts": { "parent_setup": "variable.helmet_layer_visible = 0.0;", "animate": [ "offset" ] },
      "animations": { "offset": "animation.armor.helmet.offset" },
      "render_controllers": [ "controller.render.armor" ]
    }
  }
}
```

Render controllers in 1.26:
- 1.26.10 added `controller.render.armor.player` for player armor attachables, listed under that release's experimental section.
- 1.26.20 says new vanilla attachables use `controller.render.armor.v2` (adds baby geometry/texture) instead of a changed `controller.render.armor`.
- The 1.26.50.4 vanilla diamond/iron attachables still use `controller.render.armor`, and its definition is unchanged. Keep `controller.render.armor` for custom armor.

**Custom-shaped armor** (crown, hood, pauldrons): replace the vanilla geometry with your own `.geo.json`. The bones must use the wearer's bone names, or bind to them:
- Learn's crown binds each bone with `"binding": "q.item_slot_to_bone_name(context.item_slot)"`.
- Learn's chestplate uses `"binding": "'body'"`, `"'rightarm'"` and `"'leftarm'"` on child bones.
- Keep `parent_setup` so the vanilla layer is hidden.

The geometry's `texture_width`/`texture_height` must match the PNG.

## 2. Armor trims and dyeing

- **Trims** (Learn AddCustomItems, format ≥1.20.60 on both the item and the attachable):
  - Add tags `minecraft:is_armor` and `minecraft:trimmable_armors`.
  - Use a render controller that reads `variable.has_trim` / `variable.trim_path`. `controller.render.armor` already does.
  - Optionally override a trim pattern for your shape by adding textures to the attachable, for example `"wild_trim": "textures/models/armor/custom_wild"` and `"iron_palette": "textures/trims/color_palettes/diamond_darker"`.
- **Dyeable** (format ≥1.21.30):
  - Add `"minecraft:dyeable": {"default_color": "#175882"}`.
  - Give the icon two keys: `"minecraft:icon": {"textures": {"default": "x_icon", "dyed": "x_icon_gray"}}`, where the dyed icon is a grayscale TGA.
  - The attachable gets `"dyed": "entity_alphatest_change_color"` in materials, a grayscale `dyed` texture, and `pre_animation`: `"variable.is_dyed = query.armor_color_slot(1, 0) != 1.0 || query.armor_color_slot(1, 1) != 1.0 || query.armor_color_slot(1, 2) != 1.0"`.
  - Use a custom render controller: `"materials": [{"*": "variable.is_dyed ? Material.dyed : Material.default"}]`, `"textures": ["variable.is_dyed ? Texture.dyed : Texture.default"]`.
  - Learn's tutorial contradicts itself here: the step list says to switch to the custom controller and format 1.21.30, but its "final version" still shows `controller.render.armor` at 1.20.60. Use the custom controller.
- Learn's tutorial writes texture paths with `.png`/`.tga` extensions in places. Paths are extension-less everywhere, and the checker flags extensions.

## 3. Other wearables

- **Head-slot cosmetic** (hat, crown): `wearable` `slot.armor.head`, `protection` 0, enchant slot `cosmetic_head` if wanted, plus an attachable with `parent_setup` hiding the helmet layer.
- **Off-hand item**: `wearable` `slot.weapon.offhand` (and/or `allow_off_hand`).
- **Body slot** (`slot.armor.body`): it appears in the `wearable` slot list, but Learn doesn't describe what it is for custom items. Test before relying on it.
- **Elytra-like gliding**: vanilla has an elytra attachable (geometry `geometry.elytra`, `controller.animation.elytra.default`) and the enchant slot `elytra`. Learn documents **no item component that grants gliding** to a custom item. A custom chest item can look like wings, but it won't glide. Don't promise gliding.
- `hides_player_location: true` on `wearable` hides the wearer on locator maps and the locator bar.

## 4. Held 3D models

Template `held-3d` (`ns:ruby_staff`):

```json
{
  "format_version": "1.10.0",
  "minecraft:attachable": {
    "description": {
      "identifier": "ns:ruby_staff",
      "materials": { "default": "entity_alphatest", "enchanted": "entity_alphatest_glint" },
      "textures": { "default": "textures/entity/attachable/ruby_staff", "enchanted": "textures/misc/enchanted_item_glint" },
      "geometry": { "default": "geometry.ns.ruby_staff" },
      "animations": {
        "hold_first_person": "animation.ns.ruby_staff.hold_first_person",
        "hold_third_person": "animation.ns.ruby_staff.hold_third_person"
      },
      "scripts": { "animate": [
        { "hold_first_person": "context.is_first_person == 1.0" },
        { "hold_third_person": "context.is_first_person == 0.0" } ] },
      "render_controllers": [ "controller.render.item_default" ]
    }
  }
}
```

- **Binding:** the root bone of the geometry gets `"binding": "q.item_slot_to_bone_name(context.item_slot)"`, which attaches it to `rightItem` or `leftItem` of whoever holds it. This is the approach Learn recommends. Copying the holder's bones into your geometry and parenting to `rightItem` instead only works for one entity and one hand.
- **Animations:** you need a first-person pose and a third-person pose that move your root bone.
  - Learn's wrench example references `animation.steve_head.hold_first_person` / `hold_third_person`. Those are not in the vanilla 1.26.50.4 `animations/` folder, so they come from that sample pack. Define your own, as the template does.
  - The template's rotation/position numbers are **starting values**. Pose them in Blockbench's attachable preview (first- and third-person modes) and copy the numbers back.
  - Test one attachable animation in game before building many.
- Materials: `entity_alphatest` for cut-out pixels. The enchanted pair is `entity_alphatest_glint` + `textures/misc/enchanted_item_glint`. `controller.render.item_default` swaps between them on `variable.is_enchanted`.
- Inventory and ground rendering still use the flat icon from `item_texture.json`.
- The item should have `hand_equipped: true` so the third-person grip matches a tool.

## 5. Bow pull frames

Template `bow`, from Learn's custom projectile tutorial:
- **Geometry:** four geometries (`standby`, `pulling_0..2`), each a single `texture_meshes` bone named `rightitem` that points at a texture key.
- **Attachable textures:** `default` + `ruby_bow_pulling_0..2` + `enchanted`.
- **Animations:** the vanilla `animation.bow.wield` and `animation.bow.wield_first_person_pull`.
- **Selecting the frame:** `pre_animation` computes `variable.charge_amount` from `query.main_hand_item_max_duration` / `query.main_hand_item_use_duration`, then `variable.bow_tex_idx` (0 at rest, otherwise 1-3).
- **Render controller:** `controller.render.ns.ruby_bow` indexes `array.bow_texture_frames` and `array.bow_geo_frames` with `variable.bow_tex_idx`.

The third-person draw pose needs a player animation controller override; see `tools-and-weapons.md` section 5.

## 6. Checker notes

The plugin checker (`scripts/check-pack.mjs`) reports some false positives on attachables that use vanilla resources:
- **Error:** "texture `enchanted` file not found" for `textures/misc/enchanted_item_glint` and `textures/misc/enchanted_actor_glint`. These are vanilla textures; don't copy them into your pack.
- **Warning:** "render controller `controller.render.armor` / `controller.render.item_default` is not defined in this RP". These are vanilla controllers.
- **Warning:** "attachable `ns:x.player` has no BP item". The `.player` attachable maps to the real item through its `item` field.

Everything else it reports is real.
