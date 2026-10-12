# Bedrock Add-on Kit (Claude Code plugin)

A Claude Code plugin for Minecraft Bedrock add-on work: everything needed to build an add-on from scratch (custom items, tools, armor, blocks, entities, NPCs, UIs, recipes, worldgen, dimensions, biomes, Vibrant Visuals) and ship it, plus Blockbench and Script API guidance and a weekly-refreshed record of what each release lets creators do. It works for any add-on.

## What's inside

Skills (Claude loads each one automatically when a task needs it):

| Skill | Covers |
|---|---|
| `bedrock-addon-conventions` | Pack layout, manifests, UUIDs, format versions, no-experiments rule, budgets, the test loop, safety rules |
| `bedrock-blockbench` | Rigs, pivots, file-space sign rules, Box UV, texture ramps and shading, 10 animation recipes (idle, biped/quadruped/spider walk, wings, glide, attack, impact, chains, mounts), client entity and controller wiring, "why is my model invisible/pink/frozen", Entity Wizard and mctools.dev |
| `bedrock-scripting` | Script API 2.x: startup/worldLoad, slash commands, custom item/block components, classic forms and CustomForm/MessageBox, dynamic-property saves, scheduling, entity index, pitfalls table |
| `bedrock-entity-behavior` | Entity JSON: components, groups, events, properties, AI goals; walkers, swimmers, amphibians, flyers, grazing, breeding, taming, leashing, mounts, projectiles |
| `bedrock-items` | Custom items, tools, weapons, armor and attachables, food, throwables, with working templates |
| `bedrock-blocks` | Custom blocks, states, permutations, custom geometry, ores, crops, doors, interactive blocks, with templates |
| `bedrock-ui` | Script forms (Action, Modal, Message, CustomForm), HUD text, JSON UI resource-pack edits, with templates |
| `bedrock-world-content` | Recipes, loot tables, spawn rules, trades, features and feature rules, jigsaw structures, particles, sounds, cameras, fog, pack settings, with templates |
| `bedrock-dimensions-biomes` | Custom dimensions (JSON and Script API), custom biomes and client biomes, worldgen in a custom dimension, travel between dimensions, migrating from the old beta dimension API, with templates |
| `bedrock-json-reference` | Exact fields, types, defaults and allowed values for every item, block and entity component, AI goal, filter, worldgen file, Molang query, command and JSON UI element, generated from Mojang's official form definitions |
| `bedrock-entity-behavior` templates | Hostile mob, tameable pet, rideable mount, flyer, ranged mob with projectile, boss with phases and bossbar, trader |
| `bedrock-npcs` | Vanilla NPCs and dialogue files, scripted dialogue trees, quest givers with saved progress, shopkeepers, patrol guards, day and night schedules, with templates |
| `bedrock-visuals` | Vibrant Visuals: PBR texture sets, lighting, atmosphere, color grading, water, shadows, point lights, and what isn't possible (no custom shaders) |
| `bedrock-world-templates` | World templates and .mcworld maps: folder structure, template manifest, bundling packs into a world, locking options, what a world allows that a Marketplace add-on doesn't, packaging and updates |
| `bedrock-shipping` | Packaging (.mcpack, .mcaddon, .mcworld, .mctemplate), versioning, translations, Marketplace rules with sources, skin packs, world templates, multiplayer, Realms and dedicated server testing |
| `bedrock-debugging` | A 112-entry content log and script error dictionary with fixes, the official VS Code debugger and profiler, performance budgets, GameTest automated tests, a debug overlay template |
| `bedrock-experimental` | Every upcoming creator feature, beta Script API and experiment toggle, labelled stable / next stable / beta / experimental, with what each toggle unlocks today and how to build a separate beta pack |
| `bedrock-whats-new` | Current game and module versions, which APIs are stable / coming next / beta-only, per-release creator changes, what creators can and can't do today |

Commands:
- `/bedrock-world`: turns your add-on plus a world you made in game into a `.mctemplate` (or `.mcworld`) with `scripts/world-template.mjs`.
- `/bedrock-new <folder> [name] [namespace]`: starts a new add-on (both packs, fresh UUIDs, script entry, lang, deploy helper), optionally with starter content or any skill template.
- `/bedrock-check [folder]`: runs the pack checker and fixes what it finds.
- `/bedrock-refresh`: re-pulls versions and changelogs from official sources, updates the "what's new" files and rebuilds the JSON reference.

Scripts (Node 18+, no dependencies, nothing to install):
- `scripts/new-addon.mjs <folder> --name <Name> --ns <namespace>`: the generator behind `/bedrock-new`. Writes only into the new folder.
- `scripts/check-pack.mjs <folder>`: read-only checker for the links the game never reports (BP/RP ids, geometry, texture paths and sizes, bones, animation names, controller states, effects, manifests, UUIDs, BOMs, comment keys, loop seams, item icons, block textures and geometry, custom components that are never registered, attachables, lang keys).
- `scripts/package-addon.mjs <packs dir>`: builds `<name>_BP.mcpack`, `<name>_RP.mcpack` and `<name>.mcaddon` (also `npm run package` in a generated add-on).
- `scripts/build-vanilla-ids.mjs <bedrock-samples>/resource_pack`: rebuilds the list of vanilla resources the checker accepts.
- `scripts/build-json-reference.mjs <content/forms>`: rebuilds the JSON reference from the official Microsoft Learn docs repo.
- `scripts/fetch-updates.mjs`: regenerates `current-versions.md`, `api-surface.md`, `preview-api.md` (beta and next-stable APIs with signatures) and `experimental-changelog.md` (experimental sections of Preview and release changelogs) from the npm registry (`@minecraft/*`), feedback.minecraft.net and Blockbench's GitHub.

## Install

You need Claude Code (the terminal app or the desktop app's Code tab). The plugin itself installs nothing else and runs no installers.

**From GitHub (once it's in a repo):** in Claude Code, run
```
/plugin marketplace add austinesterly/claude-bedrock-plugin
/plugin install bedrock-addon-kit@bedrock-creator-tools
```

**From a folder:** download this whole `claude-bedrock-plugin` folder (or unzip `claude-bedrock-plugin-0.4.1.zip` from the project files) to somewhere like `C:\Users\<you>\claude-plugins\claude-bedrock-plugin`, then in Claude Code run
```
/plugin marketplace add C:\Users\<you>\claude-plugins\claude-bedrock-plugin
/plugin install bedrock-addon-kit@bedrock-creator-tools
```
Run `/reload-plugins` (or restart Claude Code), then check with `/plugin` that "bedrock-addon-kit" is enabled.

**Try it without installing:** `claude --plugin-dir C:\path\to\claude-bedrock-plugin\plugins\bedrock-addon-kit`

## Keeping it current

The "what's new" files carry the date they were generated. A weekly routine in the ZooCraft project refreshes them from official sources and records new releases. Installed from GitHub, `/plugin marketplace update bedrock-creator-tools` pulls the latest copy; installed from a folder, re-download the folder. You can also run `/bedrock-refresh` yourself at any time.

## Sources

Built from Austin's Conquest Craft notes (36 ArtsByKev Blockbench videos, 56 Minecraft Creator Channel videos), new video notes, Mojang's vanilla files (bedrock-samples 1.26.50), Mojang's Creator Tools form definitions (MicrosoftDocs/minecraft-creator), the official `@minecraft/server` 2.10.0 / `server-ui` 2.2.0 typings, Microsoft Learn, and the official changelogs through Preview 26.60.30 (checked 2026-10-06).
