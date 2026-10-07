# Spawn rules (natural spawning)

BP folder: `spawn_rules/`. One file per entity; `description.identifier` must equal the entity's identifier. Vanilla files use `"format_version": "1.8.0"` (bat uses `1.17.0`); use `1.8.0` unless you need something newer. Field tables: `../../bedrock-json-reference/references/recipes-spawn-trade.md`. Working file: `../templates/spawn-rule/BP/spawn_rules/ns_critter.json`.

The entity also has to be spawnable: in its BP entity file set `"is_spawnable": true` and `"is_summonable": true` in `description` (see `bedrock-entity-behavior`). Without a spawn rule file the mob only appears through eggs, commands or scripts.

## Example

```json
{
  "format_version": "1.8.0",
  "minecraft:spawn_rules": {
    "description": { "identifier": "ns:critter", "population_control": "animal" },
    "conditions": [
      {
        "minecraft:spawns_on_surface": {},
        "minecraft:spawns_on_block_filter": "minecraft:grass_block",
        "minecraft:brightness_filter": { "min": 7, "max": 15, "adjust_for_weather": false },
        "minecraft:weight": { "default": 8 },
        "minecraft:herd": { "min_size": 2, "max_size": 3 },
        "minecraft:density_limit": { "surface": 5 },
        "minecraft:biome_filter": {
          "all_of": [
            { "test": "has_biome_tag", "operator": "==", "value": "animal" },
            { "test": "has_biome_tag", "operator": "==", "value": "forest" }
          ]
        }
      }
    ]
  }
}
```
Each object in `conditions` is one independent way to spawn; the game tries them separately. Inside one object every component must pass.

## population_control

`animal`, `water_animal`, `monster`, `ambient`, `cat`, `pillager`. This picks which mob cap the entity counts against. Monsters also need darkness by convention (`brightness_filter` max 7).

## Components (all seen in vanilla 1.26.50 unless marked)

| Component | Fields | Notes |
|---|---|---|
| `minecraft:spawns_on_surface` | `{}` | Surface spawn pass |
| `minecraft:spawns_underground` | `{}` | Caves; vanilla zombie uses both surface and underground |
| `minecraft:spawns_underwater` | `{}` | Water mobs |
| `minecraft:spawns_lava` | `{}` | Strider |
| `minecraft:spawns_on_block_filter` | block id string or list | Block below the feet |
| `minecraft:spawns_on_block_prevented_filter` | list | Blocks it may not spawn on |
| `minecraft:spawns_above_block_filter` | `blocks`, `distance` | Docs only; not in vanilla files |
| `minecraft:brightness_filter` | `min`, `max` (0-15), `adjust_for_weather` | |
| `minecraft:difficulty_filter` | `min`, `max`: `peaceful`, `easy`, `normal`, `hard` | |
| `minecraft:height_filter` | `min`, `max` (Y) | |
| `minecraft:distance_filter` | `min`, `max` from the player | |
| `minecraft:weight` | `default`, `rarity` | Relative chance among candidates |
| `minecraft:herd` | `min_size`, `max_size`, `event`, `event_skip_count`, `initial_event`, `initial_event_count` | Can be a list of herds |
| `minecraft:density_limit` | `surface`, `underground` | Max of this mob nearby |
| `minecraft:permute_type` | list of `{ "weight", "entity_type"? }` | Swap for another entity (zombie: 9% zombie villager) |
| `minecraft:spawn_event` | `event` | Entity event run on spawn (stray: `change_to_skeleton`) |
| `minecraft:biome_filter` | filter with `has_biome_tag` | `test`, `operator`, `value`; `all_of` / `any_of` |
| `minecraft:delay_filter` | `min`, `max`, `identifier`, `spawn_chance` | Timed spawns (patrols) |
| `minecraft:world_age_filter` | `min` (ticks) | |
| `minecraft:mob_event_filter` | `event` | Tied to a `/mobevent` toggle |
| `minecraft:player_in_village_filter` | `distance`, `village_border_tolerance` | |
| `minecraft:disallow_spawns_in_bubble` | `{}` | Axolotl |
| `minecraft:is_persistent`, `minecraft:is_experimental` | | Docs only; not in vanilla files |

## Biome tags to filter on

Tags found in vanilla 1.26.50 biome files include `animal`, `monster`, `overworld`, `nether`, `the_end`, `forest`, `birch`, `plains`, `taiga`, `jungle`, `desert`, `mesa`, `savanna`, `swamp`, `ocean`, `deep`, `warm`, `lukewarm`, `cold`, `frozen`, `river`, `beach`, `mountains`, `hills`, `caves`, `lush_caves`, `deep_dark`, `cherry_grove`, `pale_garden`, plus many `spawns_*` tags vanilla mobs test (`spawns_jungle_mobs`, `spawns_warm_variant_farm_animals`, ...). Read the vanilla biome files for the full list (`bedrock-dimensions-biomes` covers biome JSON). Custom biomes can add their own tags, which your spawn rules can then test.

## Other ways to spawn

- `/summon ns:critter ~ ~ ~` or `dimension.spawnEntity("ns:critter", location)` in script.
- Spawn eggs come from the entity's client file (`spawn_egg`) and its BP `is_spawnable`.
- Jigsaw structures can place entities saved in `.mcstructure` files.

## Common mistakes

- Identifier in the spawn rule doesn't match the entity identifier.
- `is_spawnable` false in the entity description.
- No `spawns_on_*` component: the condition never fires.
- Biome tag misspelled: no error, just no spawns. Test with `/locate biome` and a high `weight`.
- Very high weight with no `density_limit`: the mob floods the cap and other mobs stop spawning.
