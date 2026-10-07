# Tools and weapons

All item JSON targets `format_version` `1.26.50`. The working files are in `../templates/` (`sword`, `pickaxe`, `throwable`, `bow`).

## 1. Melee weapons (sword)

```json
"minecraft:max_stack_size": { "value": 1 },
"minecraft:hand_equipped": { "value": true },
"minecraft:damage": { "value": 7 },
"minecraft:durability": { "max_durability": 1200 },
"minecraft:enchantable": { "slot": "sword", "value": 10 },
"minecraft:repairable": { "repair_items": [
  { "items": [ "ns:ruby_sword" ], "repair_amount": "context.other->query.remaining_durability" },
  { "items": [ "minecraft:diamond" ], "repair_amount": "query.max_durability * 0.25" } ] },
"minecraft:can_destroy_in_creative": { "value": false },
"minecraft:digger": { "use_efficiency": false, "destroy_speeds": [
  { "block": { "tags": "query.any_tag('minecraft:is_sword_item_destructible')" }, "speed": 15 } ] },
"minecraft:tags": { "tags": [ "minecraft:is_sword", "minecraft:is_tool" ] }
```

- `minecraft:damage` is extra attack damage, an integer from 0 to 32767 (range widened in 1.26.0).
- The digger entry makes cobweb-type blocks (`minecraft:is_sword_item_destructible`) break quickly, the way vanilla swords do. Leave it out if you don't want that.
- On-hit effects (fire, knockback, lifesteal) need a script: a custom component with `onHitEntity`. No JSON component applies effects on hit.
- Attack speed: the item file has no attack-speed field. `minecraft:cooldown` with `"type": "attack"` (1.21.130+) rate-limits attacks. `minecraft:swing_duration` (1.21.120+) only changes how the swing looks. Vanilla spears keep the two values equal.
- `minecraft:swing_sounds` (1.21.130+): `attack_hit`, `attack_miss`, `attack_critical_hit`.
- `minecraft:weapon` is deprecated; don't use it.
- When a custom weapon loses durability (per hit, per block mined) isn't spelled out in Learn. Test in survival. A script `onBeforeDurabilityDamage` hook can change the amount.

## 2. Digger tools (pickaxe, axe, shovel, hoe, multi-tool)

`minecraft:digger` (1.20.30+) lists blocks and speeds. Each `block` is a block id string, a descriptor `{ "name": "...", "states": { ... } }`, or a tag query `{ "tags": "query.any_tag('a', 'b')" }`.

| Tool | Block tag to target (Learn `VanillaBlockTags`) | Item tags | `enchantable.slot` |
|---|---|---|---|
| Pickaxe | `minecraft:is_pickaxe_item_destructible` (older: `stone`, `metal`, `*_pick_diggable`) | `minecraft:is_pickaxe`, `is_tool`, `digger`, a tier tag | `pickaxe` |
| Axe | `minecraft:is_hatchet_item_destructible` (older: `wood`, `log`) | `minecraft:is_axe`, `is_tool`, `digger` | `axe` |
| Shovel | `minecraft:is_shovel_item_destructible` (older: `dirt`, `sand`, `gravel`, `grass`, `snow`) | `minecraft:is_shovel`, `is_tool`, `digger` | `shovel` |
| Hoe | `minecraft:is_hoe_item_destructible` (also `minecraft:crop`, `plant`) | `minecraft:is_hoe`, `is_tool`, `digger` | `hoe` |
| Shears-like | `minecraft:is_shears_item_destructible` | `minecraft:is_shears` | `shears` |

Pickaxe (template `pickaxe`):
```json
"minecraft:digger": { "use_efficiency": true, "destroy_speeds": [
  { "block": { "tags": "query.any_tag('minecraft:is_pickaxe_item_destructible')" }, "speed": 8 } ] },
"minecraft:tags": { "tags": [ "minecraft:is_pickaxe", "minecraft:is_tool", "minecraft:digger", "minecraft:diamond_tier" ] }
```

Multi-tool (paxel): add one `destroy_speeds` entry per tag, or put several tags in one query: `"query.any_tag('minecraft:is_pickaxe_item_destructible', 'minecraft:is_hatchet_item_destructible', 'minecraft:is_shovel_item_destructible')"`. Use `g_tool` or `g_digging` as the enchant slot.

A single block at its own speed:
```json
{ "block": "minecraft:coal_ore", "speed": 2 }
```

Notes:
- `use_efficiency: true` is required for the Efficiency enchantment to have any effect.
- Learn's `minecraft:digger` sample page nests the component inside itself (`"minecraft:digger": {"minecraft:digger": {...}}`). That's a doc error; use the flat form above.
- **Harvest level / drops:** Learn doesn't say whether a custom digger satisfies vanilla tier requirements (for example, iron ore dropping only for stone tier or better). Copy the vanilla convention (tool tag + tier tag, as vanilla `iron_spear.json` does with `minecraft:iron_tier`) and test drops in survival. Your own blocks set their drop in their loot table.
- **Right-click actions** (strip logs, make paths, till soil) have no item component. Write a script custom component with `onUseOn` that sets the block permutation, and wrap writes in `system.run`.

## 3. Reach weapons (spear pattern, 1.21.130+)

Vanilla `iron_spear.json` (format 1.21.100) combines these. Strip its `//` comments if you copy it.
```json
"minecraft:use_modifiers": { "use_duration": 72000, "emit_vibrations": false, "movement_modifier": 1.0 },
"minecraft:cooldown": { "category": "ns:spear", "duration": 0.95, "type": "attack" },
"minecraft:swing_duration": { "value": 0.95 },
"minecraft:damage": { "value": 3 },
"minecraft:piercing_weapon": { "reach": { "min": 2.0, "max": 4.5 }, "creative_reach": { "min": 2.0, "max": 7.5 }, "hitbox_margin": 0.25 },
"minecraft:kinetic_weapon": {
  "delay": 12, "reach": { "min": 2.0, "max": 4.5 }, "creative_reach": { "min": 2.0, "max": 7.5 },
  "hitbox_margin": 0.25, "damage_multiplier": 0.95,
  "damage_conditions": { "max_duration": 225, "min_relative_speed": 4.6 },
  "knockback_conditions": { "max_duration": 135, "min_speed": 5.1 },
  "dismount_conditions": { "max_duration": 50, "min_speed": 11.0 } },
"minecraft:enchantable": { "slot": "melee_spear", "value": 14 }
```
- `piercing_weapon` hits every entity along the view line. Items with it **cannot break blocks**.
- `kinetic_weapon` deals damage every tick while the item is in use, based on the relative speed of user and target. Without `damage_conditions`, no damage is applied.

## 4. Throwables (snowball / wind charge pattern)

Item side (template `throwable`):
```json
"minecraft:projectile": { "projectile_entity": "ns:ruby_shard_projectile" },
"minecraft:throwable": { "do_swing_animation": true, "launch_power_scale": 1.0, "max_launch_power": 1.0 },
"minecraft:cooldown": { "category": "ns:ruby_shard", "duration": 0.5 }
```
- `projectile_entity` must be a BP entity with the entity component `minecraft:projectile`. It can share the item's id (Learn does this) or use its own, as vanilla does (`wind_charge` throws `wind_charge_projectile`).
- Each throw consumes one item. Vanilla wind charge: `launch_power_scale` 1.5, `max_launch_power` 1.5, cooldown 0.5 s.
- Charged throw (trident-style): set `scale_power_by_draw_duration: true` and `min_draw_duration` / `max_draw_duration`. The item also needs `use_modifiers` so it can be held; test the combination.
- The entity side (`on_hit` damage, particles, `remove_on_hit`, `stick_in_ground`, `isolated_physics`) is covered in `bedrock-entity-behavior`. The template entity uses format `1.26.0`, like Learn's custom projectile tutorial. Version facts:
  - The **Custom Projectiles experiment was released in 1.26.30**, so no toggle is needed.
  - `isolated_physics` defaults to true at entity format 1.26.30+.
  - At 1.26.40 `should_bounce` became an enum (`no` / `if_invulnerable` / `if_no_damage_dealt`).
  - Format 1.26.50 enforces stricter `projectile` shapes: string `anchor`, `impact_damage.damage` as `{min,max}`. Check those before you raise the entity's format_version.
- Client side: a sprite projectile needs a client entity, a one-quad geometry, a billboard animation and a render controller. The template defines its own copies so it doesn't depend on vanilla `geometry.item_sprite` and `controller.render.item_sprite`. Using the vanilla ones also works.

## 5. Bows and other shooters

```json
"minecraft:use_modifiers": { "start_using": "if_first", "use_duration": 72000, "movement_modifier": 0.35 },
"minecraft:shooter": {
  "ammunition": [ { "item": "ns:ruby_arrow", "use_offhand": true, "search_inventory": true, "use_in_creative": true } ],
  "max_draw_duration": 1.0, "scale_power_by_draw_duration": true, "charge_on_draw": false },
"minecraft:durability": { "max_durability": 384 },
"minecraft:enchantable": { "slot": "bow", "value": 1 }
```
- `shooter` requires `use_modifiers`, and every ammunition item must carry `minecraft:projectile` (the ammo's `projectile_entity` is what flies).
- 1.26.30 fixes: with `start_using: "if_first"`, a shooter with a charge duration now charges and shoots properly, and a shooter with no ammo no longer draws.
- `charge_on_draw: true` makes it charge like a crossbow. `scale_power_by_draw_duration: true` makes power grow with draw time. `minimum_critical_power` on the ammo's `projectile` sets the charge needed for a critical hit.
- Shooter items only lose durability when shooting, never from melee.
- Ammo item (template `ruby_arrow.json`): `"minecraft:projectile": {"projectile_entity": "ns:ruby_arrow"}`. It can also be fired from a dispenser.
- Can the vanilla arrow (`minecraft:arrow`) be used as ammunition? Learn only shows custom ammo, so ship your own arrow item.
- Visuals: pull frames come from an attachable plus a render controller indexed by `variable.bow_tex_idx` (see `armor-and-attachables.md` section 4).
- **Third-person draw pose:** the player only raises their arms for items the vanilla player animation controller knows about. Learn's tutorial copies the vanilla `player.animation_controllers.json` and adds `|| query.get_equipped_item_name == 'ruby_bow'` (the name without namespace) to `third_person_bow_equipped`. That overrides a vanilla file: it conflicts with other packs and must be re-copied each release. Only do it if the project accepts that (see `bedrock-addon-conventions` 1).

## 6. Shields, tridents, maces, fishing rods

Learn documents no item component that reproduces blocking, riptide/loyalty returns, mace smash, or fishing. Enchant slots exist (`shield`, `spear`, `fishing_rod`), but they only gate which enchantments apply. Build these behaviors with scripts, or say plainly that they aren't data-driven.
