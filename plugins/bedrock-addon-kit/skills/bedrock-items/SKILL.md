---
name: bedrock-items
description: Use when creating or debugging custom Minecraft Bedrock items of any kind - basic items, food and drinks, tools and diggers, swords and other weapons, bows/shooters, throwables, armor and wearables, 3D held items (attachables), item icons (item_texture.json), names and lang files, enchantability, repair, cooldowns and item tags.
---

# Custom items

Checked 2026-10-06 against the Microsoft Learn item reference (schema `minecraft:item` v1.26.0), the 1.26.0-1.26.40 creator changelogs and Mojang's vanilla files 1.26.50.4. Target: stable 26.52, no experiments. Exhaustive field lists are in `../bedrock-json-reference/references/items.md`; this skill is about which components to combine and how the files chain together.

## Core rules

1. **Item files** go in `BP/items/*.json`. Use `"format_version": "1.26.50"` (the newest format in the vanilla 1.26.50.4 item files). If you write 1.26.30 or newer, keep two things in mind:
   - `components` must hold at least one entry, or the item fails to register (1.26.40 changelog).
   - `minecraft:use_modifiers.start_using` defaults to `if_first` instead of `always`.
2. **Use the object form for every component**, the way vanilla 1.26.30+ files do: `{"value": true}`, `{"value": 64}`, `{"textures": {"default": "key"}}`. Scalar shorthands still parse, but don't mix the two styles.
3. **Identifier** is `ns:name`, lowercase. Never use `minecraft:` unless you are overriding a vanilla item on purpose.
4. **Icon chain:** the item has `minecraft:icon.textures.default = "ns:ruby"`. `RP/textures/item_texture.json` maps the `texture_data` key `"ns:ruby"` to `"textures/items/ruby"`, which is the path without `.png`, with forward slashes and exact case. If the key is missing, the icon renders as the magenta/black missing texture.
5. **Name chain:** set `minecraft:display_name.value = "item.ns:ruby.name"` and add `item.ns:ruby.name=Ruby` to `RP/texts/en_US.lang`. The lang file must be UTF-8 without a BOM. A literal string in `value` also works, but it can't be translated.
6. **Creative menu:** set `description.menu_category.category` to `construction`, `equipment`, `items` or `nature`. Leave it out (or use `none`) to hide the item from the creative menu. `group` must be namespaced (`minecraft:itemGroup.name.sword`) and must be an existing group, or a custom group declared in `BP/item_catalog/crafting_item_catalog.json`.
7. **No item-file effects or events.** The legacy `food.effects`, `on_use` and `minecraft:custom_components` are gone. Effects, abilities and right-click actions all come from a Script API custom component:
   - In the item JSON, put `"ns:my_comp": { ...params }` under `components` (format 1.21.90+).
   - In script, register it in `system.beforeEvents.startup` with `itemComponentRegistry.registerCustomComponent`.
   - Hooks and code are in `bedrock-scripting/references/code-patterns.md`.
   - Register every custom component id the item JSON uses.
8. **One behavior per item.** Use priority: `entity_placer`, then `block_placer` (use-on), then food / wearable / shooter / throwable (use). Combining several "use" components gives undefined behavior (Learn: ItemUsePriority).
9. **Attachables** (`RP/attachables/*.json`, `minecraft:attachable`, format `1.10.0` like vanilla) control how an item looks when held or worn. Without one, a held item renders as its flat icon. Armor always needs one.
10. Strict JSON: no comments and no trailing commas. Vanilla files contain `//` comments, so don't paste them as-is. Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP> <RP>` before every in-game test.

## File chain per item kind

| Kind | BP | RP | Key components |
|---|---|---|---|
| Basic item | `items/x.json` | `item_texture.json` entry + PNG, lang line | `icon`, `display_name`, `max_stack_size`, `tags` |
| Food / drink | same | same | `food`, `use_modifiers` (`use_duration`), `use_animation` `eat`/`drink`, `using_converts_to` for bottles/bowls |
| Sword / melee | same | same, optional attachable for 3D | `damage`, `durability`, `repairable`, `enchantable` `sword`, `hand_equipped`, `can_destroy_in_creative: false`, tag `minecraft:is_sword` |
| Pickaxe / axe / shovel / hoe | same | same | `digger` (`destroy_speeds` with block-tag queries, `use_efficiency`), tool tags, `enchantable` slot `pickaxe`/`axe`/`shovel`/`hoe` |
| Spear-style reach weapon | same | same | `piercing_weapon`, `kinetic_weapon`, `cooldown` `type: attack`, `swing_duration` (1.21.130+) |
| Throwable | item + `entities/proj.json` (`minecraft:projectile`) | item icon; client entity, geo, render controller for the projectile | `throwable` + `projectile.projectile_entity`, optional `cooldown` |
| Bow / shooter | bow item + ammo item (with `projectile`) + arrow entity | attachable with pull frames, render controller, arrow client entity | `shooter.ammunition`, `use_modifiers` (`use_duration` 72000, `start_using: if_first`) |
| Armor piece | `items/x.json` | **attachable** (vanilla armor geometry + `controller.render.armor`), 64x32 layer texture, icon | `wearable` (`slot`, `protection`), `durability`, `repairable`, `enchantable` `armor_*`, tag `minecraft:is_armor` |
| 3D held item | item | attachable bound with `q.item_slot_to_bone_name(context.item_slot)`, geo, first/third person animations | `hand_equipped` |
| Potion-like drink | item + script component | icon, lang | `food` (`can_always_eat`, `using_converts_to`), `use_animation: drink`, custom component `onConsume` adds the effect |

## Common mistakes

| Symptom | Cause |
|---|---|
| Item missing from `/give`, content log "failed to register" | Empty `components` at format ≥1.26.30; a misspelled component; a field in the wrong shape; or the BP isn't applied |
| Magenta/black icon | `item_texture.json` key doesn't match `icon.textures.default`, or the path has `.png`, backslashes or the wrong case |
| Name shows `item.ns:x.name` | Lang line missing, or the lang file is in the BP instead of `RP/texts/` |
| Food can't be eaten | `use_modifiers.use_duration` missing (food needs it), or the player isn't hungry and `can_always_eat` is false |
| Bow draws but never fires, or fires without ammo | Ammo item lacks `minecraft:projectile`, or `use_modifiers` is missing. Use `start_using: "if_first"` (1.26.30+) |
| Armor invisible or untextured when worn | No attachable, a wrong layer texture (leggings use layer 2), or a missing `parent_setup` |
| Armor stacks to 64 | At format ≥1.26.30 `wearable` no longer forces a stack size of 1, so set `max_stack_size: {"value": 1}` |
| Custom pickaxe mines slowly | `destroy_speeds` tag doesn't match the block's tags (check `VanillaBlockTags`); speed too low; Efficiency is ignored unless `use_efficiency` is true |
| Two items share a cooldown | They share a `cooldown.category`. Give each item its own namespaced category |

More in `references/troubleshooting.md`.

## References and templates

| Need | Read |
|---|---|
| Which components to combine for each goal, with exact JSON (food, durability, repair, enchanting, cooldowns, use modifiers, tags, creative menu, lang, misc) | `references/components-by-purpose.md` |
| Swords, all digger tools, spears, bows, crossbow-style charging, throwables, custom arrows | `references/tools-and-weapons.md` |
| Armor sets, attachables, held 3D models, bow pull frames, trims, dyeable armor, elytra status | `references/armor-and-attachables.md` |
| Something doesn't work in game | `references/troubleshooting.md` |
| Every field of every component | `../bedrock-json-reference/references/items.md` |
| Script hooks (`onUse`, `onConsume`, `onHitEntity`, `onMineBlock`, ...) | `../bedrock-scripting/references/code-patterns.md` |
| Modelling attachables in Blockbench | `../bedrock-blockbench/references/wiring-and-debugging.md` |
| Projectile entity components | `../bedrock-entity-behavior/SKILL.md` |

Templates (`templates/<name>/BP` and `RP`; manifests are added by the plugin's generator). Each RP has its own `item_texture.json` and `en_US.lang`. When you combine templates, **merge** their `texture_data` entries and lang lines; don't overwrite one file with another.

| Template | Contents |
|---|---|
| `basic-item` | `ns:ruby`: icon, name, stack size, custom tag |
| `food-item` | `ns:ruby_apple` (eat) and `ns:ruby_tonic` (drink, returns a glass bottle) |
| `sword` | `ns:ruby_sword`: damage, durability, repair, enchantable, cobweb digger |
| `pickaxe` | `ns:ruby_pickaxe`: digger on `minecraft:is_pickaxe_item_destructible`, efficiency, tier tags |
| `armor-set` | 4 armor items + 8 attachables (wearer + `.player`, vanilla pattern), `ruby_1`/`ruby_2` 64x32 layers |
| `throwable` | `ns:ruby_shard` item + `ns:ruby_shard_projectile` entity (BP + RP) |
| `bow` | `ns:ruby_bow` shooter with 4 pull frames, `ns:ruby_arrow` ammo + arrow entity |
| `held-3d` | `ns:ruby_staff` 3D held model via an attachable |

The sword, pickaxe and armor templates repair with `minecraft:diamond` so that each one works on its own. Swap in `ns:ruby` when you also use `basic-item`. All PNGs are flat placeholders: replace them, keeping the same sizes.
