# tameable-pet: `ns:pup`

A wolf-like pet. Tame it with a bone, make it sit, it follows its owner, heals from meat, breeds into babies that grow up, and can be leashed.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/pup.json` | Behavior, format 1.26.50, groups for baby/adult and wild/tame |
| BP | `spawn_rules/ns_pup.json` | Daytime spawns on grass in `animal` + `forest` biomes |
| BP | `loot_tables/entities/ns_pup.json` | Up to one bone |
| RP | `entity/pup.entity.json` | Client entity, spawn egg colours |
| RP | `models/entity/pup.geo.json` | Quadruped Box UV rig (root > body > head, legs on root), 64x32 |
| RP | `animations/pup.animation.json` | idle (tail wag), walk, sit |
| RP | `render_controllers/pup.render_controllers.json` | Shows the `collar` bone only when tamed |
| RP | `textures/entity/ns_pup.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla wolf audio |
| RP | `texts/en_US.lang` | Names and subtitle |

## How it works

| Feature | Components | Group |
|---|---|---|
| Taming | `tameable` (`tame_items`, `probability` 0.33, `tame_event` -> `ns:on_tame`) | `ns:pup_wild` |
| Owner bond | `is_tamed`, `behavior.follow_owner`, `owner_hurt_by_target`, `owner_hurt_target`, `melee_attack` | `ns:pup_tame` |
| Sitting | `sittable` + `behavior.stay_while_sitting`; the player toggles it by interacting | `ns:pup_tame` |
| Healing | `healable` with `{ item, heal_amount }` objects | always |
| Breeding | `breedable` (`breeds_with: { "ns:pup": {} }`, `require_tame`) + `behavior.breed`, plus `minecraft:offspring` (`offspring_pairs`) | `ns:pup_adult` / always |
| Babies | `is_baby`, `scale` 0.5, `ageable` (`grow_up` -> `minecraft:ageable_grow_up`), `behavior.follow_parent` | `ns:pup_baby` |
| Leash | `leashable` | always |

Health lives in the wild and tame groups (8 and 20), so each state has its own value; removing a group does not restore a base component.

Since 1.26.0 vanilla puts the child type in `minecraft:offspring.offspring_pairs` and `breeds_with` is keyed by mate type, as in this file. Older guides show `breeds_with: { mate_type, baby_type }`; vanilla 1.26.50 files no longer use that shape.

## Try it

```
/summon ns:pup
/give @s bone 8
/give @s beef 8
```
Feed bones until hearts appear, interact to sit or stand, feed two tamed adults beef to breed.

## Customize

- Change the tame item in `tameable.tame_items` and `behavior.tempt.items`, and the food in `healable`, `breed_items` and `ageable.feed_items`.
- The sit pose is a simple placeholder; tune it in Blockbench.
