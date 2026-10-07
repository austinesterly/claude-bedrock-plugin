# Camera presets, fog, and text/lang files

Script control of the camera and the fog stack (`player.camera`, `player.fogSettings`, `RawMessage`) is covered in `../../bedrock-ui/references/hud-and-text.md`. This file covers the JSON files and commands. Working files: `../templates/camera-preset/`, `../templates/fog/`.

## Camera presets

BP file `cameras/presets/ns_overhead.json` (folder taken from the Learn "Control Schemes" sample; the full Camera System pages are not in the cloned sources):
```json
{
  "format_version": "1.19.50",
  "minecraft:camera_preset": {
    "identifier": "ns:overhead",
    "inherit_from": "minecraft:free",
    "control_scheme": "camera_relative"
  }
}
```
- Built-in presets (command enum, 1.26.50): `minecraft:first_person`, `minecraft:third_person`, `minecraft:third_person_front`, `minecraft:free`, `minecraft:follow_orbit`, `minecraft:fixed_boom`, `minecraft:control_scheme_camera`.
- `control_scheme`: `camera_relative`, `camera_relative_strafe`, `player_relative`, `player_relative_strafe`, `locked_player_relative_strafe`.
- Presets have more fields (position, rotation, offsets, listener, player effects); copy them from the Learn Camera System reference, not from memory.

Commands (forms from the 1.26.50 command metadata):
```
camera @s set ns:overhead pos ~ ~20 ~ rot 90 0
camera @s set minecraft:free ease 2 in_out_sine pos 0 100 0 facing @e[type=ns:critter,c=1]
camera @s set minecraft:free pos 10 80 10 facing 0 64 0
camera @s set minecraft:third_person view_offset 1 0.5
camera @s set minecraft:follow_orbit entity_offset 0 1 0
camera @s fade time 0.5 1 0.5 color 0 0 0
camera @s fov_set 50 1 in_out_sine
camera @s fov_clear
camera @s attach_to_entity @e[type=ns:drone,c=1]
camera @s detach_from_entity
camera @s target_entity @e[type=ns:boss,c=1]
camera @s remove_target
camera @s clear
```
- `ease <seconds> <easing>`: `linear`, `spring`, and `in_`/`out_`/`in_out_` + `quad`, `cubic`, `quart`, `quint`, `sine`, `expo`, `circ`, `bounce`, `back`, `elastic`.
- `fade time <in> <hold> <out> color <r> <g> <b>`: seconds, colour 0-255.
- `play_spline` and camera splines are behind the Creator Camera experiment (see `bedrock-experimental`).
- `target_entity <entity> [target_center_offset x y z]` keeps the camera aimed at an entity; `remove_target` stops it.
- Always end a cutscene with `camera @s clear` (and restore HUD/input permissions).

## Fog

RP folder `fogs/`, one `minecraft:fog_settings` per file. Minimum format `1.16.100`; vanilla 1.26.50 fog files use `1.21.90` (which adds Vibrant Visuals volumetric fields).
```json
{
  "format_version": "1.21.90",
  "minecraft:fog_settings": {
    "description": { "identifier": "ns:haze" },
    "distance": {
      "air":     { "fog_start": 0.2, "fog_end": 0.6, "fog_color": "#8FA39B", "render_distance_type": "render" },
      "weather": { "fog_start": 0.1, "fog_end": 0.4, "fog_color": "#6E7F78", "render_distance_type": "render" },
      "water": {
        "fog_start": 0.0, "fog_end": 30.0, "fog_color": "#2E6B5A", "render_distance_type": "fixed",
        "transition_fog": {
          "init_fog": { "fog_start": 0.0, "fog_end": 0.01, "fog_color": "#2E6B5A", "render_distance_type": "fixed" },
          "min_percent": 0.25, "mid_seconds": 5, "mid_percent": 0.6, "max_seconds": 30
        }
      }
    },
    "volumetric": {
      "density": { "air": { "max_density": 0.08, "zero_density_height": 320.0, "max_density_height": 320.0 } },
      "media_coefficients": { "air": { "scattering": [ 0.06, 0.06, 0.06 ], "absorption": [ 0.0, 0.0, 0.0 ] } }
    }
  }
}
```

| Key | Meaning |
|---|---|
| `distance.<medium>` | Medium: `air`, `weather` (rain/snow), `water`, `lava`, `lava_resistance` |
| `fog_start`, `fog_end` | With `render_distance_type: "render"` they are fractions of the render distance (0-1); with `"fixed"` they are blocks |
| `fog_color` | `"#RRGGBB"` |
| `transition_fog` | Water only: the fog right after entering water, easing to the normal value |
| `volumetric.density.<medium>` | `max_density`, `uniform` (bool), `zero_density_height`, `max_density_height` |
| `volumetric.media_coefficients.<medium>` | `scattering`, `absorption` (RGB 0-1) |
| `volumetric.henyey_greenstein_g` | Light scattering direction (1.21.90, Vibrant Visuals) |

Using a fog:
- Per biome: the client biome's `minecraft:fog_appearance` `{ "fog_identifier": "ns:haze" }` (see `bedrock-dimensions-biomes`).
- Per player, temporary: `fog @a push ns:haze ns_storm`, then `fog @a pop ns_storm` or `fog @a remove ns_storm`. Script: `player.fogSettings.push("ns:haze", "ns_storm")`.
- Which fog wins: command/script stack, then biome fog, then the pack's default, then the engine default.
- Pushed fog is saved per player, so always use a tag (`ns_storm`) and remove by tag.

## Text and lang files

| File | Content |
|---|---|
| `RP/texts/en_US.lang` | `key=value`, one per line, UTF-8 without BOM, no quotes. `##` starts a comment |
| `RP/texts/languages.json` | `[ "en_US" ]` plus any other language files you ship |
| `BP/texts/en_US.lang` | Only `pack.name` / `pack.description` for the BP (same keys work in the RP) |

Common keys:
```
pack.name=Ruby Add-On
pack.description=Rubies, critters and ruins.
item.ns:ruby.name=Ruby
tile.ns:ruby_block.name=Block of Ruby
entity.ns:critter.name=Critter
item.spawn_egg.entity.ns:critter.name=Spawn Critter
ns:itemGroup.name.ruby_blocks=Ruby Blocks
subtitles.ns.critter.ambient=Critter chirps
ns.welcome=Welcome! Your coin counter is ready.
ns.hud.coins=Coins: %s
```
- Blocks: `tile.<id>.name`. Entities: `entity.<id>.name`. Spawn eggs: `item.spawn_egg.entity.<id>.name`. Items: set `minecraft:display_name` to an explicit key like `item.ns:ruby.name` (the default key without display_name is `item.<id>` per one Learn tutorial; `bedrock-items` recommends the explicit key).
- Manifest `name`/`description` may be `pack.name` / `pack.description`; those are looked up in the pack's own lang file.
- Text from commands: `tellraw @a {"rawtext":[{"translate":"ns.hud.coins","with":["5"]}]}`. `titleraw @a actionbar {...}` takes the same form. `%s` (or numbered `%1$s`, `%2$s`, as vanilla uses) inserts `with` values.

## Common mistakes

- Fog files in the BP, or camera presets in the RP.
- `render_distance_type: "render"` with block values such as 30: the fog is pushed past the world.
- Fog pushed without a tag and never removed: players are stuck with it after the event.
- Lang file saved with a BOM or as UTF-16: the first key breaks or every key shows raw.
- Lang values in quotes, or trailing spaces after the value (they show).
