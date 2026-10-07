# flying-mob: `ns:wisp`

A small hovering mob that wanders through the air, never takes fall damage, and spawns by day in overworld forests.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/wisp.json` | Behavior, format 1.26.50 |
| BP | `spawn_rules/ns_wisp.json` | Daytime surface spawns, `overworld` + `forest` biome tags |
| BP | `loot_tables/entities/ns_wisp.json` | Glowstone dust |
| RP | `entity/wisp.entity.json` | Client entity, spawn egg colours |
| RP | `models/entity/wisp.geo.json` | Body + head cube and two wings, 64x32 |
| RP | `animations/wisp.animation.json` | idle (bob and flap), walk (fast flap and lean while moving) |
| RP | `textures/entity/ns_wisp.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla allay audio |
| RP | `texts/en_US.lang` | Names and subtitle |

Render controller: vanilla `controller.render.default`.

## How it works

The bee and allay pattern from vanilla:
- `can_fly`, `flying_speed`, `movement.hover`, `navigation.hover` (`can_path_from_air`, `can_sink: false`).
- `behavior.random_hover` (`xz_dist`, `y_dist`, `hover_height [1, 4]`) is the air wander.
- `damage_sensor` with `cause: "fall"`, `deals_damage: "no"`.
- `game_event_movement_tracking.emit_flap` so sculk sensors hear wings, not footsteps.

For free flight that can land on trees, swap the hover set for the parrot's: `movement.fly`, `navigation.fly`, `behavior.random_fly`.

## Try it

```
/summon ns:wisp
```

## Customize

Add `minecraft:despawn` if wild wisps should clear out; leave it off for wisps players keep.
