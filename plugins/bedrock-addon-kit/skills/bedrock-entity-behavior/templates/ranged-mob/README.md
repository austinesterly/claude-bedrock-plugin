# ranged-mob: `ns:spitter` and `ns:spitter_spit`

A night mob for desert biomes that keeps its distance and spits a custom projectile at players.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/spitter.json` | Shooter, format 1.26.50 |
| BP | `entities/spitter_spit.json` | Projectile entity, format 1.26.50 (shape copied from the vanilla snowball) |
| BP | `spawn_rules/ns_spitter.json` | Night spawns, `monster` + `desert` biome tags |
| BP | `loot_tables/entities/ns_spitter.json` | Slime balls |
| RP | `entity/spitter.entity.json`, `entity/spitter_spit.entity.json` | Client entities (only the shooter has a spawn egg) |
| RP | `models/entity/spitter.geo.json` | Biped with a `snout` bone, 64x32 |
| RP | `models/entity/spitter_spit.geo.json` | 4x4x4 cube, 16x16 |
| RP | `animations/spitter.animation.json` | idle, walk, attack (head bob and snout pump) |
| RP | `animations/spitter_spit.animation.json` | Spin |
| RP | `animation_controllers/spitter.animation_controllers.json` | `attack` while `q.has_target` |
| RP | `textures/entity/ns_spitter.png`, `ns_spitter_spit.png` | Placeholder textures |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla llama audio; `shoot` plays the spit sound |
| RP | `texts/en_US.lang` | Names and subtitles |

Render controller: vanilla `controller.render.default` for both.

## How it works

- `minecraft:shooter { def: "ns:spitter_spit", sound: "shoot" }` names the projectile entity. The projectile must have `minecraft:projectile`.
- `behavior.ranged_attack` with `attack_interval {min,max}` (reload, seconds) and `attack_range {min,max}` as float ranges (stricter at 1.26.50).
- Projectile at 1.26.50: `anchor` is a string (`eye_height`), `impact_damage.damage` is `{min,max}`, `remove_on_hit` removes it on impact, `uncertainty_base` / `uncertainty_multiplier` set the aim spread. Custom projectiles do not need `runtime_identifier` (1.26.30+), and `isolated_physics` defaults to true for them.

## Try it

```
/summon ns:spitter
/time set night
```

## Customize

- Burst fire: `burst_shots`, `burst_interval` and `charge_shoot_trigger` on `ranged_attack` (the vanilla blaze uses them).
- Status effect on hit: add `mob_effect` to `on_hit` (see the vanilla `wither_skull.json` and `shulker_bullet.json`).
