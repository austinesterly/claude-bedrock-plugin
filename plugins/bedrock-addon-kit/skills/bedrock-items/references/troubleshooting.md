# Item troubleshooting

Turn on Content Log File + GUI (Creator settings) and read the log first. Most item failures are a single bad field, and that field stops the whole file from loading. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP> <RP>` before every test.

## Item doesn't exist (`/give` says unknown item, not in creative)

1. Is the BP applied to the world, and does its manifest depend on the RP header UUID?
2. Does the JSON parse? Look for comments, trailing commas, BOMs, smart quotes. Vanilla files contain `//` comments, so don't copy them as-is.
3. At format ≥1.26.30, an empty `components` object fails to register (1.26.40 changelog).
4. Is any component name misspelled, or any field in the wrong shape? One unknown component or bad value rejects the item. Check spelling against `../../bedrock-json-reference/references/items.md`.
5. Deprecated or removed components and fields: `minecraft:custom_components` (rejected at 1.21.90+; use id keys), `minecraft:weapon`, `minecraft:use_duration`, `minecraft:chargeable`, `minecraft:foil` (now `glint`), `food.effects` / `remove_effects`, `description.category` (old tutorials; now `menu_category.category`).
6. Is it missing only from the creative menu? `menu_category.category` is `none` by default. If you set a group, it must be an existing group or one declared in `item_catalog/crafting_item_catalog.json`.
7. Is it listed but invisible in commands? Check `is_hidden_in_commands`.

## Icon wrong

| Symptom | Fix |
|---|---|
| Magenta/black | Make the `item_texture.json` key match `minecraft:icon.textures.default` exactly. The path starts with `textures/`, has no extension, uses forward slashes, and matches the case |
| Blank | The PNG is fully transparent, or `item_texture.json` itself doesn't parse |
| Two packs' icons clash | Two RPs use the same `texture_data` key. Use namespaced keys (`ns:ruby`) so they never collide |
| Combined templates lost icons | You overwrote one template's `item_texture.json` with another's. Merge the `texture_data` objects |

## Name wrong

- It shows the raw key (`item.ns:ruby.name`): the line is missing, misspelled, or in the wrong file. The lang file is `RP/texts/en_US.lang`, UTF-8 without a BOM, one `key=value` per line, no quotes.
- It shows the identifier: there's no `display_name` and no matching default key. Add `display_name` with an explicit key.

## Use / behavior

| Symptom | Likely cause |
|---|---|
| Can't eat | `use_modifiers.use_duration` missing; `can_always_eat` false while full; another use component (`throwable`, `shooter`, `wearable`) took priority |
| Eats instantly | `use_duration` is in **seconds** in `use_modifiers` (1.6 = apple). The old `minecraft:use_duration` was in ticks (32) |
| Bowl or bottle not returned | `food.using_converts_to` missing or misspelled (`minecraft:glass_bottle`) |
| No effect after eating | No JSON field does this any more. Add a custom component with `onConsume` (see `components-by-purpose.md` section 4) |
| Bow won't draw | `use_modifiers` missing; no ammo in inventory/off hand with `search_inventory`/`use_offhand` false; ammo lacks `minecraft:projectile`; at ≥1.26.30 another component consumed the use (`start_using: "if_first"` is correct for shooters) |
| Bow shoots nothing visible | The ammo's `projectile_entity` has no BP entity, the entity lacks the `minecraft:projectile` component, or the client entity / geometry / texture is missing |
| Throwable does nothing | `throwable` without `projectile`, or the projectile entity id is wrong |
| Throwable hits the thrower | Check the entity's projectile settings; 26.50 changed owner immunity to spatial |
| Cooldown shared across unrelated items | Same `cooldown.category`. Namespace it per item |
| Digger slow / Efficiency useless | Tag query doesn't match the block (use `query.any_tag('minecraft:is_pickaxe_item_destructible')` etc.); `use_efficiency` missing |
| Sword breaks blocks in creative | Add `can_destroy_in_creative: {"value": false}` |
| Spear can't mine | Expected: `piercing_weapon` items never break blocks |
| Armor stacks | At ≥1.26.30, set `max_stack_size` to 1 yourself |
| Can't enchant at the table | `enchantable` missing, `value` 0, or `slot` doesn't match a group with table enchantments |
| Can't repair in anvil | `repairable.repair_items[].items` lists the wrong id (use full `minecraft:`/`ns:` ids) |

## Worn / held rendering

| Symptom | Likely cause |
|---|---|
| Armor not visible on the player | Attachable missing or its JSON fails to parse; `item` condition misspelled; geometry id typo (`geometry.player.armor.chestplate`) |
| Visible on armor stands but not on players (or the reverse) | Only one of the two attachables (wearer / `.player`) exists |
| Vanilla armor layer shows through custom armor | `parent_setup` variable missing or wrong (`helmet_layer_visible`, `chest_layer_visible`, `leg_layer_visible`, `boot_layer_visible`) |
| Leggings textured like a chestplate | Leggings must use layer 2 (`_2`) |
| Stretched or misaligned armor | Texture not 64x32 for the vanilla armor geometry; custom geometry `texture_width`/`height` differ from the PNG |
| 3D held item floats or points the wrong way | Pose the root bone in the first/third-person animations (template values are starting points); check the `binding` on the root bone |
| 3D held item shows as a flat icon | Attachable identifier (or its `item` map) doesn't match the item id, or the attachable fails to load (see the content log) |
| Enchanted glint missing | `materials.enchanted` / `textures.enchanted` missing, or the render controller doesn't use `variable.is_enchanted` |
| Bow frames don't change | The `pre_animation` lines are missing, or the render controller array names don't match the texture/geometry keys |
| Player doesn't raise arms with a custom bow | The vanilla player animation controller only knows vanilla bows. See `tools-and-weapons.md` section 5 for the override and its cost |

## Version drift

- Copy shapes from current vanilla files (`Mojang/bedrock-samples`) or Learn's component pages, not from tutorials dated before 2025. Learn's AddCustomItems still shows `"category": "Items"` in `description` and format 1.20.30.
- Before raising a projectile entity's format_version to ≥1.26.50, check `bedrock-whats-new/references/changelog-digest.md` for the stricter shapes.
- When something worked last release and fails now, test in Preview and diff against the newest vanilla item at the same format_version.
