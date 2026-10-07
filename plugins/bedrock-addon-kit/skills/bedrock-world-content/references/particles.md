# Particles

RP folder `particles/` (any subfolder; file name free, `ns_sparkle.particle.json` is a common convention). Vanilla 1.26.50 has 179 particle files at `"format_version": "1.26.10"`, a few at `1.26.30` / `1.26.50` and some old `1.10.0` ones. Field tables: `../../bedrock-json-reference/references/client-visuals.md`; Molang: `molang.md` there. Working file: `../templates/particle/RP/particles/ns_sparkle.particle.json`.

Particles are client-only visuals: no collisions with entities, no damage, no server state. Units are blocks (meters) and seconds.

## File shape

```
{ "format_version": "1.26.10",
  "particle_effect": {
    "description": { "identifier": "ns:sparkle", "basic_render_parameters": { "material": "...", "texture": "..." } },
    "curves": { ... }?,
    "events": { ... }?,
    "components": { emitter_* and particle_* components } } }
```
- `material`: vanilla uses `particles_alpha` (cut-out, 164 files), `particles_blend` (translucent, 26) and `particles_opaque` (1).
- `texture`: path without extension. `textures/particle/particles` is the vanilla 128x128 atlas; a custom texture goes in `RP/textures/particle/ns_sparkle.png`.

## Component groups

| Group | Components (all seen in vanilla) |
|---|---|
| Emitter start | `emitter_initialization` (`creation_expression`, `per_update_expression`), `emitter_local_space` |
| Emitter lifetime (pick one) | `emitter_lifetime_once` (`active_time`), `emitter_lifetime_looping` (`active_time`; docs also list `sleep_time`), `emitter_lifetime_expression` (`activation_expression`, `expiration_expression`) |
| Emitter rate (pick one) | `emitter_rate_instant` (`num_particles`), `emitter_rate_steady` (`spawn_rate`, `max_particles`), `emitter_rate_manual` (`max_particles`) |
| Emitter shape (pick one) | `emitter_shape_point`, `_sphere`, `_box`, `_disc`, `_entity_aabb`, `_custom` (`offset`, `radius`/`half_dimensions`, `surface_only`, `direction`: `outwards`, `inwards` or a vector) |
| Particle start | `particle_initialization`, `particle_initial_speed`, `particle_initial_spin`, `particle_lifetime_expression` (`max_lifetime`; docs also list `expiration_expression`) |
| Particle motion | `particle_motion_dynamic` (`linear_acceleration`, `linear_drag_coefficient`, rotation), `particle_motion_parametric`, `particle_motion_collision` (`enabled`, `collision_radius`, `collision_drag`, `coefficient_of_restitution`, `expire_on_contact`, `events`) |
| Particle look | `particle_appearance_billboard` (`size`, `facing_camera_mode`, `uv`), `particle_appearance_tinting` (`color`), `particle_appearance_lighting` (`{}` = lit by the world) |
| Particle end | `particle_kill_plane`, `particle_expire_if_not_in_blocks`, `particle_lifetime_events` |

All component keys carry the `minecraft:` prefix.

## Example: a sparkle burst

From the template (1.26.10): emits 20 particles/s for 1 second from a sphere, they drift up, flip through 8 frames of the vanilla atlas and fade from red to clear.
```json
"components": {
  "minecraft:emitter_initialization": { "creation_expression": "variable.size = variable.sparkle_size ?? 0.1;" },
  "minecraft:emitter_lifetime_once": { "active_time": 1 },
  "minecraft:emitter_rate_steady": { "spawn_rate": 20, "max_particles": 40 },
  "minecraft:emitter_shape_sphere": { "radius": 0.4, "surface_only": false, "direction": "outwards" },
  "minecraft:particle_lifetime_expression": { "max_lifetime": "Math.random(0.6, 1.2)" },
  "minecraft:particle_initial_speed": "Math.random(0.5, 1.5)",
  "minecraft:particle_motion_dynamic": { "linear_acceleration": [ 0, 1.5, 0 ], "linear_drag_coefficient": 2 },
  "minecraft:particle_appearance_billboard": {
    "size": [ "variable.size", "variable.size" ],
    "facing_camera_mode": "lookat_xyz",
    "uv": {
      "texture_width": 128, "texture_height": 128,
      "uv": [ 0, 0 ], "uv_size": [ 8, 8 ],
      "flipbook": { "base_UV": [ 56, 0 ], "size_UV": [ 8, 8 ], "step_UV": [ -8, 0 ], "max_frame": 8, "stretch_to_lifetime": true }
    }
  },
  "minecraft:particle_appearance_tinting": {
    "color": {
      "gradient": { "0.000000": [ 1, 0.25, 0.35, 1 ], "1.000000": [ 1, 0.85, 0.9, 0 ] },
      "interpolant": "variable.particle_age / variable.particle_lifetime"
    }
  },
  "minecraft:particle_appearance_lighting": {}
}
```
`variable.sparkle_size ?? 0.1` reads a value passed in by the caller (below) and falls back to 0.1.

Built-in variables used in vanilla: `variable.particle_age`, `variable.particle_lifetime`, `variable.particle_random_1` to `_4`, `variable.emitter_age`, `variable.emitter_random_1` to `_3`.

## 1.26.50 expression objects

Newer vanilla files (1.26.50, e.g. `orange_poplar_leaves_particle.json`) write Molang as objects with a Molang version:
```json
"creation_expression": { "expression": "v.fall_acc = -0.3; v.wind_acc = 10;", "version": 12 }
```
Plain strings still work at 1.26.10; only use the object form if you set the file to a format that vanilla uses it with.

## Ways to emit

| From | How |
|---|---|
| Command | `particle ns:sparkle ~ ~1 ~` (unknown ids give no error, since the server doesn't know particles) |
| Script, everyone nearby | `dimension.spawnParticle("ns:sparkle", { x, y, z }, molangVars)` |
| Script, one player | `player.spawnParticle("ns:sparkle", location, molangVars)` |
| Client entity animation | Map a short name in the client entity file, then trigger it from an animation timeline or an animation controller state |
| Entity event (BP) | `"emit_particle": { "particle": "creakingcrumble" }` (added 1.21.50; vanilla uses a built-in particle name; custom ids are not documented, so test) |
| Block / item visuals | `bedrock-blocks` / `bedrock-items` (scripted custom components calling `spawnParticle`) |

Script with variables:
```js
import { world, MolangVariableMap } from "@minecraft/server";
const vars = new MolangVariableMap();
vars.setFloat("variable.sparkle_size", 0.2);
vars.setColorRGBA("variable.tint", { red: 1, green: 0.2, blue: 0.3, alpha: 1 });
world.getDimension("overworld").spawnParticle("ns:sparkle", { x: 0, y: 70, z: 0 }, vars);
```
`MolangVariableMap` also has `setVector3` and `setSpeedAndDirection`.

Client entity (RP `entity/ns_critter.entity.json`):
```json
"particle_effects": { "sparkle": "ns:sparkle" }
```
Animation controller state:
```json
"states": {
  "happy": {
    "particle_effects": [ { "effect": "sparkle", "locator": "head", "pre_effect_script": "variable.sparkle_size = 0.15;" } ],
    "transitions": [ { "default": "!query.is_sitting" } ]
  }
}
```
`locator` (optional) must exist in the geometry; `pre_effect_script` sets variables before the emitter starts. In animations the same object goes under a time key: `"particle_effects": { "0.5": [ { "effect": "sparkle" } ] }`. Blockbench's effect keyframes write this for you (`bedrock-blockbench`).

## Gating by pack setting

Wrap the emitter in `emitter_lifetime_expression` with `"activation_expression": "query.is_pack_setting_enabled('ns:show_sparkles')"` so players can turn it off (see `pack-settings.md`).

## Common mistakes

- Particle id in a command or script that doesn't match `description.identifier`: silently nothing.
- `max_particles` too low with `emitter_rate_steady`: the emitter stalls.
- Huge `spawn_rate` or long-lived looping emitters on every mob: frame drops. Keep particles short and few.
- `uv` sizes not matching `texture_width`/`texture_height`: wrong part of the atlas shows.
- Comments copied from vanilla (`guardian_water_move.json` has invalid JSON for strict parsers).
