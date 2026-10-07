---
name: bedrock-entity-behavior
description: Use when writing or debugging Minecraft Bedrock behavior-pack entity JSON (components, component groups, events, properties, AI goals) — mobs, animals, pets, mounts, projectiles, spawn rules and loot — or when choosing which vanilla mob to copy behavior from.
---

# Bedrock entity behavior JSON

`references/recipes.md` has copy-ready component sets for walkers, swimmers, amphibians, flyers, hoverers, grazers, breeders, predators, pets, mounts, leashing, enclosures and projectiles, taken from vanilla 1.26.50 files.

## Structure

An entity file has three parts:
- `components`: the base set that is always on.
- `component_groups`: named bundles that events add or remove (baby/adult, calm/angry, wild/tamed).
- `events`: `add`/`remove` groups, `set_property`, `trigger`, `sequence`/`randomize`, plus `play_sound` and `emit_particle` (stable since 1.21.50).

Triggers (sensors such as `environment_sensor`, `target_nearby_sensor`, `damage_sensor`, and `on_*` fields) pass through filters and fire events. Scripts fire them with `entity.triggerEvent("ns:event")`; commands with `/event entity @e[type=ns:x] ns:event`.

```json
{
  "format_version": "1.26.50",
  "minecraft:entity": {
    "description": {
      "identifier": "ns:critter", "is_spawnable": true, "is_summonable": true,
      "properties": { "ns:mood": { "type": "enum", "values": ["calm", "hungry", "sleepy"], "default": "calm", "client_sync": true } }
    },
    "component_groups": {
      "ns:calm":   { "minecraft:behavior.random_stroll": { "priority": 6, "speed_multiplier": 0.8 } },
      "ns:hungry": { "minecraft:behavior.tempt": { "priority": 4, "speed_multiplier": 1.1, "items": ["minecraft:wheat"] } }
    },
    "components": {
      "minecraft:type_family": { "family": ["ns_critter", "mob"] },
      "minecraft:health": { "value": 10, "max": 10 },
      "minecraft:collision_box": { "width": 0.9, "height": 1.3 },
      "minecraft:movement": { "value": 0.23 },
      "minecraft:movement.basic": {},
      "minecraft:navigation.walk": { "can_path_over_water": true, "avoid_damage_blocks": true },
      "minecraft:jump.static": {},
      "minecraft:physics": {},
      "minecraft:pushable_by_entity": {},
      "minecraft:pushable_by_block": {},
      "minecraft:breathable": { "total_supply": 15, "suffocate_time": 0 },
      "minecraft:behavior.float": { "priority": 0 },
      "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
      "minecraft:behavior.look_at_player": { "priority": 7, "look_distance": 6 },
      "minecraft:behavior.random_look_around": { "priority": 8 }
    },
    "events": {
      "minecraft:entity_spawned": { "add": { "component_groups": ["ns:calm"] } },
      "ns:get_hungry": { "remove": { "component_groups": ["ns:calm"] }, "add": { "component_groups": ["ns:hungry"] }, "set_property": { "ns:mood": "hungry" } },
      "ns:fed":        { "remove": { "component_groups": ["ns:hungry"] }, "add": { "component_groups": ["ns:calm"] }, "set_property": { "ns:mood": "calm" } }
    }
  }
}
```
The `format_version` above is the target; if a component fails at it, see the format notes below. The resource pack reads the property with `q.property('ns:mood')`.

## Rules

- **Priority:** lower number runs first. Mutually exclusive goals at the same priority take turns.
- **Removing a group does not restore a base component it overrode;** the component is just gone. Give each state an explicit sibling group instead of overriding base components.
- **Freeze a mob** with a group holding `minecraft:is_stunned` / zero movement, not by deleting movement.
- **type_family has side effects:** `player` makes hostiles target it and fires player-keyed behaviours; `monster` makes iron golems attack it; `inanimate` makes mobs ignore it. Use your own families in your own filters.
- **Predators need three things:** `minecraft:attack { damage }`, `behavior.nearest_attackable_target { entity_types, must_see, scan_interval }`, and `behavior.melee_box_attack` (vanilla) or `behavior.melee_attack`. Without `attack` the melee goal does no damage.
- **Keep wanted mobs from despawning:** many vanilla mobs (all fish) carry `minecraft:despawn`. Leave it off anything players own.
- **Contain mobs** with `minecraft:home` (`restriction_type`: `random_movement` or `all_movement`, `restriction_radius`) plus `behavior.move_towards_home_restriction`. Script can't set the home position in 2.10.0, so the home is where the mob spawned: spawn it where it should live.
- **Pathfinding is short-range.** Mobs won't step onto a carpet laid on a block, and long routes fail; give every area a short ground route from its neighbours.
- **Scale with `minecraft:scale`,** not by remodelling; collision_box is in blocks and doesn't scale with it.
- **Entities as pseudo-blocks or state holders** are expensive; prefer block entities, dynamic properties or data records.
- MCTools.dev and the Entity Wizard insert every default value; trim them.

## Format-version notes (stricter parsing; full list in `../bedrock-whats-new/references/changelog-digest.md`)

- 1.26.30: `minecraft:pushable` removed (use `pushable_by_entity` / `pushable_by_block`). Items need at least one component.
- 1.26.50: stricter collision_box, home, flocking, physics, interact (`interactions`, `spawn_entities`, `play_sounds` arrays only), projectile (`anchor` is a string, `impact_damage.damage` is `{min,max}`), tamemount, timer (`time` is `{min,max}`), follow_mob, ranged_attack (`attack_range` float range). `multiple_targets` on projectiles defaults to false.
- 1.26.60 (in preview): stricter movement.* components, tempt, float_tempt, panic, send_event, attack (`damage` scalar or `{min,max}`), inventory, healable (`items` entries must be objects), buoyant, transformation, rideable (`seats` array only), shareables (`items` array only), trail, scale_by_age, strength, teleport.
- `damage_sensor.deals_damage` is a string: `yes` / `no` / `no_but_entity_effects_apply`.
- `apply_knockback_rules` is still changing; avoid it.
- Not in any vanilla file, so don't rely on them: `spawn_on_death`, `ignore_cannot_be_attacked`, `input_air_controlled`.

## When the docs are thin

Copy from the vanilla behaviour file of the closest mob in Mojang's `bedrock-samples` (`behavior_pack/entities/<mob>.json`) at the current release tag, then rename to your namespace. Microsoft Learn's entity component reference lists every component with its fields: https://learn.microsoft.com/en-us/minecraft/creator/reference/content/entityreference/

## Templates

Complete custom entities in `templates/`, each with BP and RP: behavior file, client entity with spawn egg, Box UV geometry, idle and walk animations (attack where it fights), render controller, placeholder texture, lang lines, loot table, and sounds that point at vanilla audio so no .ogg files ship. Each folder has a README with the components used, test commands and what is unverified. Add one or more with `node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs" <dir> --name "X" --ns myns --add <template> --add <template>`; the generator renames `ns` and imports template scripts from `main.js`.

| Template | Entity | Shows | Spawn rule |
|---|---|---|---|
| `hostile-mob` | `ns:ghoul` | nearest_attackable_target, melee_attack, hurt_by_target, despawn, burns_in_daylight, attack animation controller | night, overworld + monster |
| `tameable-pet` | `ns:pup` | tameable, sittable, follow_owner, healable, breedable + offspring, ageable baby, leashable, collar shown when tamed | day, forest |
| `rideable-mount` | `ns:steed` | saddle by interact, input_ground_controlled, horse.jump_strength + can_power_jump, seat array, saddle bone via part_visibility | day, plains |
| `flying-mob` | `ns:wisp` | can_fly, navigation.hover, random_hover, no fall damage | day, overworld forest |
| `ranged-mob` | `ns:spitter`, `ns:spitter_spit` | shooter, ranged_attack, custom projectile entity | night, desert |
| `boss` | `ns:titan` | minecraft:boss, int property phases switched by environment_sensor, phase groups, `scripts/ns_boss.js` announcements | none |
| `npc-trader` | `ns:merchant` | trade_table with a trade file, trade_with_player | none |

Entity file names are unique per template, so all seven can go into one add-on. BP entities use format 1.26.50, client entities 1.10.0, geometry 1.12.0, animations 1.8.0. Vanilla 1.26.50 breeding puts the child in `minecraft:offspring.offspring_pairs` and keys `breeds_with` by mate type; the pet template follows that shape.
