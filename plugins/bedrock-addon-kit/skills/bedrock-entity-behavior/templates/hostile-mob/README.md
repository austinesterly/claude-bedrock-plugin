# hostile-mob: `ns:ghoul`

A zombie-like melee mob that hunts players, golems and villagers, burns in daylight, despawns when far away, and spawns at night in overworld biomes tagged `monster`.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/ghoul.json` | Behavior, format 1.26.50 |
| BP | `spawn_rules/ns_ghoul.json` | Night spawning (brightness 0-7), overworld + monster biome tags, easy to hard |
| BP | `loot_tables/entities/ns_ghoul.json` | Rotten flesh, rare iron ingot on a player kill |
| RP | `entity/ghoul.entity.json` | Client entity, spawn egg colours |
| RP | `models/entity/ghoul.geo.json` | Humanoid Box UV rig, 64x32 (vanilla zombie layout) |
| RP | `animations/ghoul.animation.json` | idle (arms forward), walk, attack |
| RP | `animation_controllers/ghoul.animation_controllers.json` | Plays `attack` while `v.attack_time > 0` |
| RP | `textures/entity/ns_ghoul.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Ambient, hurt, death, step, pointing at vanilla zombie audio |
| RP | `texts/en_US.lang` | Entity, spawn egg and subtitle names |

Render controller: vanilla `controller.render.default`.

## How it works

- Targeting: `behavior.nearest_attackable_target` (copied from the vanilla zombie, minus turtles) picks players, snow and iron golems, then villagers and wandering traders. `behavior.hurt_by_target` makes it fight back.
- Damage: `minecraft:attack` sets the damage; `behavior.melee_attack` walks to the target and swings. Without `minecraft:attack` the goal does nothing.
- Daylight: `minecraft:burns_in_daylight`. Delete it for a mob that lives in the day.
- Despawn: `minecraft:despawn` with `despawn_from_distance`. Remove it if players will keep this mob.
- Families `undead` and `monster` have side effects: smite and healing potions treat it as undead, iron golems attack it.

## Try it

```
/summon ns:ghoul
/time set night
```

## Customize

- Rename: the generator renames `ns`. To make a second mob from this one, rename `ghoul` in every file name and id.
- Biomes: edit `minecraft:biome_filter` in the spawn rule. `has_biome_tag` values come from the biome files (`overworld`, `monster`, `forest`, `desert`, ...). Custom biomes from the bedrock-dimensions-biomes skill can carry their own tag for this filter.
- Sounds: the definitions point at vanilla audio paths, so no .ogg files ship. Put your own files under `RP/sounds/ns/ghoul/` and change the `name` entries.

## Not verified in game

`v.attack_time` drives the attack swing. Vanilla hoglin, zoglin and creaking read it, but it has not been tested on this rig.
