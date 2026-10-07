# boss: `ns:titan`

A large boss with a boss bar, 300 health and three phases. The phase is an int entity property switched by an `environment_sensor`; each phase swaps a component group (faster, harder hitting), plays a roar, and a script announces it in chat.

## Files

| Side | File | What it does |
|---|---|---|
| BP | `entities/titan.json` | Behavior, format 1.26.50, property `ns:phase` (int 1-3) |
| BP | `loot_tables/entities/ns_titan.json` | Diamonds and a nether star |
| BP | `scripts/ns_boss.js` | Phase, spawn and death announcements (stable `@minecraft/server` 2.10.0) |
| RP | `entity/titan.entity.json` | Client entity, spawn egg colours |
| RP | `models/entity/titan.geo.json` | Humanoid at twice vanilla scale with a `crown` bone, 128x64 |
| RP | `animations/titan.animation.json` | idle, walk, attack |
| RP | `animation_controllers/titan.animation_controllers.json` | `attack` while `v.attack_time > 0` |
| RP | `render_controllers/titan.render_controllers.json` | Crown from phase 2, red overlay in phase 3 |
| RP | `textures/entity/ns_titan.png` | Placeholder texture |
| RP | `sounds/sound_definitions.json`, `sounds.json` | Vanilla ravager and iron golem audio; `roar` event |
| RP | `texts/en_US.lang` | Names, phase messages, subtitles |

No spawn rule: summon the boss or spawn it from a script or structure.

## How it works

1. `minecraft:boss { hud_range, should_darken_sky }` shows the bar. The bar uses the entity's name.
2. `description.properties.ns:phase` is an int with `range [1, 3]` and `client_sync: true`, so the resource pack can read `q.property('ns:phase')`.
3. `minecraft:environment_sensor` checks every tick: phase 1 and health <= 200 fires `ns:enter_phase_2`; phase 2 and health <= 100 fires `ns:enter_phase_3`. The property test stops each trigger from firing twice.
4. Each phase event removes the old group, adds the new one, sets the property and runs `play_sound: { sound: "roar" }`.
5. Movement, attack damage and `melee_attack` live only in the phase groups, never in the base components, so swapping groups never leaves the boss without them.
6. `ns_boss.js` subscribes to `world.afterEvents.dataDrivenEntityTrigger` filtered to the titan and its two phase events, `entitySpawn` (cause `Spawned`) and `entityDie`. It only reads and sends messages, so it needs no `system.run`.

`damage_sensor` cancels fall damage. To switch phases on hits instead, give `damage_sensor` a trigger with `on_damage { filters, event }` using the same property and health filters.

## Try it

```
/summon ns:titan
/damage @e[type=ns:titan] 120
```
The generator adds `import "./ns_boss.js";` to `main.js` (after renaming `ns`).

## Customize

- Change thresholds in the two `actor_health` filters and the health in `minecraft:health`.
- Add a fourth phase: widen `range` to `[1, 4]`, add a group, an event and a sensor trigger.
- An enum property works the same way: `type: "enum"`, `values`, and the `enum_property` filter.

## Not verified in game

The order of `set_property` and the after-event is not documented, so the script maps the event id to its message and does not read the property.
