# Sounds and music

Two RP files do the work. Field tables: `../../bedrock-json-reference/references/client-visuals.md`. Working files: `../templates/custom-sound/RP/`.

| File | Purpose |
|---|---|
| `RP/sounds/sound_definitions.json` | Defines **sound events** (names like `mob.ns.critter.say`) and which audio files they play |
| `RP/sounds.json` | Hooks sound events to **game events** of entities and blocks (ambient, hurt, step, place, ...) |
| `RP/sounds/ns/...ogg` | The audio files. `.ogg` is the norm; `.wav` and `.fsb` also load |

Your `sound_definitions.json` merges with vanilla and other packs; only your keys change. Use namespaced event names so you don't overwrite vanilla ones by accident (overwriting on purpose is how you replace a vanilla sound).

## sound_definitions.json

Vanilla 1.26.50 uses `"format_version": "1.26.50"` (older tutorials show `1.20.20`; both load).
```json
{
  "format_version": "1.26.50",
  "sound_definitions": {
    "ns.ui.chime": {
      "category": "ui",
      "sounds": [ { "name": "sounds/ns/ui/chime1", "volume": 0.8 }, { "name": "sounds/ns/ui/chime2", "volume": 0.8 } ]
    },
    "mob.ns.critter.say": {
      "category": "neutral",
      "max_distance": 16.0,
      "subtitle": "subtitles.ns.critter.ambient",
      "sounds": [ { "name": "sounds/ns/critter/say1", "load_on_low_memory": true }, "sounds/ns/critter/say2" ]
    },
    "music.ns.theme": {
      "category": "music",
      "sounds": [ { "name": "sounds/ns/music/theme", "stream": true, "allow_concurrent_streaming": false, "volume": 0.4 } ]
    }
  }
}
```

| Event field | Meaning |
|---|---|
| `category` | Volume slider it follows: `ambient`, `block`, `bottle`, `hostile`, `music`, `neutral`, `player`, `record`, `ui`, `weather` |
| `sounds` | List; one is picked at random each play. Entry is a path string or an object |
| `min_distance`, `max_distance` | Full-volume radius and cut-off distance (blocks) |
| `subtitle` | Lang key shown with subtitles on (`subtitles.ns.critter.ambient=Critter chirps` in `texts/en_US.lang`) |
| `__use_legacy_max_distance` | Vanilla compatibility flag; leave it out for new sounds |

| Sound entry field | Meaning |
|---|---|
| `name` | Path from the pack root, **no extension** |
| `volume`, `pitch` | Multipliers (default 1) |
| `weight` | Relative pick chance among entries |
| `stream` | Stream from disk instead of loading into memory (long music/ambience) |
| `load_on_low_memory` | Keep on low-memory devices |
| `is3D` | `false` makes it play non-positional |
| `allow_concurrent_streaming` | Whether this streamed sound may overlap itself |

At most 32 sounds play at the same time. 1.26.60 (preview) adds server-side sound definitions; not stable in 1.26.52.

## sounds.json: hooking game events

```json
{
  "entity_sounds": {
    "entities": {
      "ns:critter": {
        "volume": 1.0,
        "pitch": [ 0.8, 1.2 ],
        "events": {
          "ambient": "mob.ns.critter.say",
          "hurt": "mob.ns.critter.hurt",
          "death": { "sound": "mob.ns.critter.hurt", "pitch": 0.8, "volume": 1.0 }
        }
      }
    }
  }
}
```
- Top-level sections in vanilla: `block_sounds`, `entity_sounds` (`defaults`, `entities`), `individual_event_sounds` (`events`), `individual_named_sounds`, `interactive_sounds` (`block_sounds`, `entity_sounds`: step/fall/jump/land).
- An event value is a sound event name, or `{ "sound", "volume", "pitch" }`; `pitch` can be `[min, max]`.
- Most common entity event names in vanilla: `hurt`, `death`, `ambient`, `step`, `eat`, `attack`, `hurt.in.water`, `mad`, `shoot`, `jump`, `land`, `swim`, `splash`, `spawn`, `teleport`, `throw`. `ambient` plays only if the BP entity has `"minecraft:ambient_sound_interval": { "event_name": "ambient" }` (vanilla pig also has `event_names` with a Molang `condition`, e.g. `ambient.baby`).
- Like other merged files, adding `individual_event_sounds` entries with made-up event names does nothing, because the game never fires them.

Block sound sets: vanilla RP `blocks.json` maps a block to a set (`"amethyst_block": { "sound": "amethyst_block", ... }`) and `sounds.json` `block_sounds.<set>.events` (`break`, `hit`, `place`, `power.on`, `power.off`, `item.use.on`) plus `interactive_sounds.block_sounds.<set>.events` (`step`, `fall`, `jump`, `land`) define it. For custom blocks see `bedrock-blocks` (sound set via RP `blocks.json`).

Items: item sound fields accept any sound event from format 1.26.50 (see `bedrock-items`).

## Playing sounds

| From | How |
|---|---|
| Command | `playsound ns.ui.chime @s ~ ~ ~ 1 1.2`, `stopsound @a ns.ui.chime` |
| Script, at a spot | `dimension.playSound("mob.ns.critter.say", location, { volume: 1, pitch: 1.1 })` |
| Script, one player | `player.playSound("ns.ui.chime", { location, volume: 0.8, pitch: 1 })` |
| Entity event (BP) | `"play_sound": { "sound": "..." }` event response, added 1.21.50 (see `bedrock-entity-behavior`) |
| Animation / controller (RP) | Map `"sound_effects": { "chirp": "mob.ns.critter.say" }` in the client entity, then `"sound_effects": [ { "effect": "chirp" } ]` in a controller state, or under a time key in an animation |

## Music

Use `category: "music"` and `stream: true`.
```
music play music.ns.theme 0.6 2 loop
music queue music.ns.boss 1 3 play_once
music volume 0.3
music stop 2
```
Script: `world.playMusic("music.ns.theme", { fade: 2, loop: true, volume: 0.6 })`, `world.queueMusic(...)`, `world.stopMusic()`. Custom biome music goes in the client biome's `minecraft:biome_music` (see `bedrock-dimensions-biomes`).

## Common mistakes

- File extension in `name` (`theme.ogg`): no sound.
- Path not starting at the pack root (`ns/ui/chime1` instead of `sounds/ns/ui/chime1`).
- Mono vs stereo: positional (3D) sounds should be mono; stereo files don't fade with distance as expected.
- Music not streamed: large memory use and a hitch when it starts.
- `playsound` with the event name misspelled: no error in chat, just silence.
