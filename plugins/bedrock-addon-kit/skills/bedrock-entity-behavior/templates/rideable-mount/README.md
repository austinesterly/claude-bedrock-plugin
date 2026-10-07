# rideable-mount: `ns:steed`

A horse-like mount. Use a saddle on it, then ride it and steer with movement keys; hold jump to power jump. Shears take the saddle back off. The saddle bone only shows while saddled.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/steed.json` | Behavior, format 1.26.50 |
| BP | `spawn_rules/ns_steed.json` | Daytime spawns on grass in `animal` + `plains` biomes |
| BP | `loot_tables/entities/ns_steed.json` | Leather on death |
| BP | `loot_tables/entities/ns_steed_saddle.json` | The saddle dropped when sheared |
| RP | `entity/steed.entity.json` | Client entity; head look turns off while ridden |
| RP | `models/entity/steed.geo.json` | Quadruped Box UV rig with a `saddle` bone, 128x64 |
| RP | `animations/steed.animation.json` | idle (tail, head), walk |
| RP | `render_controllers/steed.render_controllers.json` | `part_visibility` shows `saddle` when `q.is_saddled` |
| RP | `textures/entity/ns_steed.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla horse audio, including `saddle` and `unsaddle` events |
| RP | `texts/en_US.lang` | Names and subtitle |

## How it works

The pattern combines two vanilla mobs:
- Pig: an `interact` entry in the unsaddled group that needs a saddle in hand, consumes it (`use_item`) and fires `ns:on_saddled`; a shears interaction in the saddled group drops the saddle from a loot table and fires `ns:on_unsaddled`.
- Camel: always tamed (`is_tamed` in the base components), and the saddled group holds `is_saddled`, `input_ground_controlled`, `behavior.player_ride_tamed` and `rideable`.

Jumping: `horse.jump_strength` (base) plus `can_power_jump` (saddled group), as on the vanilla horse.

Seat: `rideable.seats` uses the array form, which 1.26.60 requires. Position `[0, 0.95, 0.1]` sits about 0.2 blocks under the saddle top (1.19 blocks).

## Try it

```
/summon ns:steed
/give @s saddle
/give @s shears
```

## Customize

- Two riders: raise `seat_count` and add a second seat entry with `min_rider_count` / `max_rider_count` (see the vanilla camel).
- Taming first: copy the horse's `tamemount` group and move `is_tamed` into a tamed group.
- The death loot does not include the saddle. Add it with a loot condition if you need that.

## Not verified in game

Steering and power jump on a custom entity that is tamed from spawn (the camel setup) and saddled by `interact` (the pig setup) has not been ridden in game. Seat height and the `0.6-0.8` jump strength range are starting values to tune.
