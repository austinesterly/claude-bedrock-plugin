---
name: bedrock-world-content
description: Use when adding world-level content to a Minecraft Bedrock add-on - crafting/furnace/brewing/smithing recipes and the item catalog, loot tables and villager trade tables, natural spawn rules, functions and tick.json, game rules and world commands, features and feature rules (ores, plants, structures), jigsaw structures, particles, sounds and music, fog, camera presets, lang files, pack settings, subpacks and world templates.
---

# World content

Checked 2026-10-06 against Mojang's vanilla files 1.26.50, the 1.26.50 JSON schemas and command/script metadata (server 2.10.0), and the Microsoft Learn creator docs and changelogs up to 1.26.50 / 1.26.60 preview. Target: stable 26.52, no experiments unless marked. Exhaustive field lists live in `../bedrock-json-reference/references/`; this skill is about working combinations and exact JSON. Templates use the namespace `ns` and the items/blocks from `bedrock-items` and `bedrock-blocks` (`ns:ruby`, `ns:ruby_block`, `ns:ruby_ore`, `ns:ruby_sword`, ...).

Custom **biomes and dimensions** are covered by `bedrock-dimensions-biomes`. This skill covers features and feature rules, which also work inside custom biomes.

## What goes where

| Content | Pack / folder | format_version (vanilla 1.26.50 or docs) | Reference | Template |
|---|---|---|---|---|
| Shaped / shapeless / furnace recipe | BP `recipes/` | `1.26.50` | `references/recipes.md` | `templates/recipes/` |
| Brewing mix / container recipe | BP `recipes/` | `1.20.10` | `recipes.md` | |
| Smithing transform / trim | BP `recipes/` | `1.21.110` / `1.20.10` | `recipes.md` | `templates/recipes/` |
| Item catalog (creative groups) | BP `item_catalog/crafting_item_catalog.json` | `1.21.60` | `recipes.md` | `templates/recipes/` |
| Loot table | BP `loot_tables/` | none | `references/loot-and-trades.md` | `templates/loot-and-trades/` |
| Trade table | BP `trading/` | none | `loot-and-trades.md` | `templates/loot-and-trades/` |
| Spawn rules | BP `spawn_rules/` | `1.8.0` | `references/spawn-rules.md` | `templates/spawn-rule/` |
| Functions, tick.json | BP `functions/` | n/a | `references/functions-and-commands.md` | `templates/tick-function/` |
| Feature | BP `features/` | `1.21.40` (docs; ≥1.20.30) | `references/worldgen.md` | `templates/ore-feature/`, `templates/scatter-feature/` |
| Feature rule | BP `feature_rules/` | `1.21.60` | `worldgen.md` | same |
| Structure file | BP `structures/ns/*.mcstructure` | binary (exported in game) | `worldgen.md` | |
| Jigsaw structure / pool / processors / set | BP `worldgen/...` | `1.21.20` | `worldgen.md` | |
| Particle | RP `particles/` | `1.26.10` | `references/particles.md` | `templates/particle/` |
| Sound definitions | RP `sounds/sound_definitions.json` | `1.26.50` | `references/sounds.md` | `templates/custom-sound/` |
| Entity/block sound hooks | RP `sounds.json` | none | `sounds.md` | `templates/custom-sound/` |
| Fog | RP `fogs/` | `1.21.90` | `references/camera-fog-text.md` | `templates/fog/` |
| Camera preset | BP `cameras/presets/` | `1.19.50` | `camera-fog-text.md` | `templates/camera-preset/` |
| Lang / languages.json | RP (and BP) `texts/` | n/a | `camera-fog-text.md` | in several templates |
| Pack settings, subpacks | RP/BP `manifest.json` | manifest `3` | `references/pack-settings.md` | `templates/pack-settings/` |
| World template | `.mctemplate` zip | manifest | `../bedrock-world-templates/SKILL.md` | |

Templates are laid out as `templates/<topic>/BP/...` and `templates/<topic>/RP/...`; copy the files into the same paths in your packs.

## Core rules

1. **Namespace every identifier** (`ns:`), including recipe ids, loot/trade file names, feature ids, particle ids, sound event names, fog ids, pack setting names and function folders. Shared files (`tick.json`, `sound_definitions.json`, `sounds.json`, lang files, the item catalog) are merged across packs.
2. **Strict JSON only.** No comments, no trailing commas. Vanilla loot tables and a few vanilla particles have `//` comments; don't copy them.
3. **Recipes need station `tags`** (`crafting_table`, `stonecutter`, `furnace`, `smoker`, `blast_furnace`, `campfire`, `soul_campfire`, `brewing_stand`, `smithing_table`) and should have `unlock`.
4. **Loot paths**: components and nested entries use `loot_tables/....json`; the `/loot` command uses the path after `loot_tables/` without `.json`, in quotes.
5. **Spawn rule identifier = entity identifier**, and the entity must be `is_spawnable`.
6. **Features need a feature rule** to generate, and only generate in new chunks. Test with `/place feature` and `/place featurerule`.
7. **`.mcfunction` lines have no leading `/`**. Tick functions run 20 times a second; keep them tiny.
8. **Particles and sounds are client-only.** A wrong id gives no error, just nothing. Sound paths have no file extension.
9. **Pushed fog and cameras persist per player.** Tag fog entries and clear cameras when you're done.
10. **Pack-setting Molang queries are RP only.** Server logic reads `world.getPackSettings()`.

## Stable vs experimental (26.52)

| Feature | Status |
|---|---|
| Recipes, item catalog, loot, trades, spawn rules, functions, features, feature rules, particles, sounds, fog, camera presets, pack settings (incl. multiselect, 1.26.50) | Stable |
| Jigsaw structures (custom) | Stable since 1.21.120 |
| Editing vanilla jigsaw structures (Trail Ruins) | Experiment |
| Camera splines, `/camera ... play_spline` | Experiment (Creator Camera) |
| Furnace recipes unlocking on material pickup | Experiment (1.26.20) |
| Server sound definitions, stricter `economy_trade_table`, loot format 1.26.60 | 1.26.60 preview only |
| Custom biomes / dimensions | Stable; see `bedrock-dimensions-biomes` |

## Recent changes that matter

- 1.26.10: feature / feature rule file names no longer have to match the identifier, subfolders allowed. 1.26.40: duplicate feature ids are an error.
- 1.26.20: `snap_to_surface_feature.embed_in_surface`, `structure_template_feature.rotate_around_center`.
- 1.26.30: loot condition `biome_has_tag`; `height_difference_filter` feature; `structure_template_feature.ground_level`; game rule `playerwaypoints` replaced `locatorbar`.
- 1.26.40: `multi_block_feature`; custom items allowed in the smithing `addition` slot (needs `minecraft:transform_materials`); vanilla furnace recipes carry explicit `priority`.
- 1.26.50: `operator` on loot conditions; multiselect pack setting; structure files v2; item sound fields accept any sound event.

## Common mistakes

| Symptom | Likely cause |
|---|---|
| Recipe never shows | Missing/wrong `tags`, no `unlock` with limited crafting, or a duplicate identifier |
| Item won't go into a smithing slot | Missing `minecraft:transformable_items` / `transform_templates` / `transform_materials` item tag |
| Mob drops nothing | Loot path wrong or JSON comment in the table; condition like `killed_by_player` not met |
| `/loot` errors | Path written with `loot_tables/` or `.json`, or not quoted |
| Mob never spawns naturally | Identifier mismatch, `is_spawnable` false, no `spawns_on_*`, biome tag typo |
| Ore/plant doesn't generate | No feature rule, wrong `placement_pass`, biome filter never true, or testing in old chunks |
| Function line fails | Leading `/`, or a typo that only shows in the content log |
| Particle or sound silent | Identifier/event name mismatch, file extension in the sound path |
| Fog stuck on players | Pushed without a tag and never removed |
| Lang text shows the raw key | Key typo, missing `languages.json`, lang file with BOM |

## Related skills

`bedrock-json-reference` (all field tables), `bedrock-items` and `bedrock-blocks` (the things recipes and loot produce), `bedrock-entity-behavior` (loot/trade/spawn components on entities), `bedrock-scripting` (script versions of commands), `bedrock-ui` (camera and fog scripting, HUD text), `bedrock-blockbench` (particle and sound keyframes), `bedrock-dimensions-biomes`, `bedrock-addon-conventions` (manifests, packaging), `bedrock-whats-new` (version changes), `bedrock-experimental`.
