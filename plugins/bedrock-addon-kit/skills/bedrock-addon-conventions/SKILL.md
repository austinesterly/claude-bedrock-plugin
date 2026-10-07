---
name: bedrock-addon-conventions
description: Use when creating, reviewing or debugging any Minecraft Bedrock add-on (behavior/resource packs, manifests, format versions, namespaces, Script API setup, testing loop). The house rules every other bedrock-* skill builds on.
---

# Bedrock add-on conventions

These are the baseline rules for any Bedrock add-on. The other skills in this plugin go deeper:
- `bedrock-blockbench`: models, rigs, animations, textures, and wiring them into the resource pack.
- `bedrock-scripting`: Script API 2.x code patterns, forms, commands, custom components, persistence, performance.
- `bedrock-entity-behavior`: behavior-pack entity JSON (components, groups, events, AI goals, animal behaviors).
- `bedrock-items`: custom items, tools, weapons, armor (attachables), food, throwables.
- `bedrock-blocks`: custom blocks, states, permutations, geometry, ores, crops, doors and other interactive blocks.
- `bedrock-ui`: script forms (Action/Modal/Message/CustomForm), HUD text, and JSON UI resource-pack edits.
- `bedrock-world-content`: recipes, loot tables, spawn rules, trades, features and feature rules, jigsaw structures, particles, sounds, cameras, fog, pack settings.
- `bedrock-dimensions-biomes`: custom dimensions (JSON and Script API), custom biomes and client biomes, worldgen inside a custom dimension, travelling between dimensions.
- `bedrock-json-reference`: every component's exact fields, types and defaults, generated from Mojang's form definitions. Check it instead of guessing a field name.
- `bedrock-experimental`: upcoming features, beta APIs and experiment toggles, labelled stable / next stable / beta / experimental, and how to build a separate beta pack (`/bedrock-new --beta`).
- `bedrock-npcs`: NPCs with dialogue, quest givers, shopkeepers, patrols and schedules.
- `bedrock-visuals`: Vibrant Visuals, PBR texture sets, lighting, atmosphere, color grading, and what isn't possible (no custom shaders).
- `bedrock-shipping`: packaging (.mcpack, .mcaddon, world templates, skin packs), translations, Marketplace rules, multiplayer, Realms and dedicated server testing.
- `bedrock-debugging`: the content log error dictionary, the VS Code debugger and profiler, performance budgets, GameTest.
- `bedrock-whats-new`: the current game and module versions and what each release added. **Read its `references/current-versions.md` before pinning any version number**, because the numbers below go stale every 6 to 7 weeks.
- `bedrock-world-templates`: World templates and maps (.mctemplate, .mcworld, adventure and minigame worlds): bundling packs into a world, the template manifest, `base_game_version`, locked options, what a world may contain that an add-on may not, and `/bedrock-world`.

Start a new add-on with `/bedrock-new` (or `node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs"`), which writes both packs with fresh UUIDs, the script entry, lang files and a deploy helper; check any pack with `/bedrock-check`, and build `.mcpack` / `.mcaddon` files with `npm run package` in a generated add-on (or `node "${CLAUDE_PLUGIN_ROOT}/scripts/package-addon.mjs" <packs dir>`; see `bedrock-shipping`).

Version facts here were checked on 2026-10-06 (stable game 26.52, `@minecraft/server` 2.10.0, `@minecraft/server-ui` 2.2.0).

## 1. Target platform

- Target the current **stable** release. Set `min_engine_version` to the stable version you test on (for example `[1, 26, 50]`). Game version "26.50" is `1.26.50` inside files.
- Script modules: use the `latest` npm tag of `@minecraft/server` and `@minecraft/server-ui`. Never ship `-beta` modules in content meant for normal worlds.
- **No experiments in shipped content** unless the project explicitly accepts it. A world can never turn an experiment off again, and Marketplace content may not rely on experiments. Beta APIs, Upcoming Creator Features and other toggles are for separate test worlds.
- Check the stable/beta split in `bedrock-whats-new` before using an API a tutorial shows. Common trap: `world.beforeEvents.chatSend` is beta-only; use `customCommandRegistry` slash commands or an item's `onUse` instead.
- Avoid JSON UI in shipped packs (Marketplace rule, and Ore UI is replacing it). Use `@minecraft/server-ui` forms. If you add a JSON UI restyle, keep a plain fallback.
- Never override vanilla files (`minecraft:player`, vanilla mobs, vanilla loot tables) unless the project's whole point is a vanilla tweak. Copy a vanilla mob under your own namespace instead. New entities don't need `runtime_identifier`; custom projectiles no longer need it either.

## 2. Pack layout

```
<project>/
  packs/BP/  manifest.json, entities/, items/, blocks/, loot_tables/, spawn_rules/, recipes/, functions/, scripts/, texts/
  packs/RP/  manifest.json, entity/, models/entity/, models/blocks/, animations/, animation_controllers/,
             render_controllers/, textures/, sounds/, sounds.json, sound_definitions.json (in sounds/), particles/, texts/
  tools/     build/deploy scripts
```
- One namespace everywhere (`ns:`), never `minecraft:` for custom content. Ids: `ns:thing` -> `geometry.ns.thing` -> `animation.ns.thing.walk` -> `controller.animation.ns.thing.general` -> `controller.render.ns.thing`.
- Manifest `format_version: 2`. BP modules: `data` (+ `script` with `"language": "javascript"`, `"entry": "scripts/main.js"`). RP module: `resources`. The BP depends on the RP's **header** UUID, plus the script modules by `module_name` and version.
- Generate every UUID once and never change it. World dynamic-property data is keyed to the BP header UUID, so a new UUID silently orphans saved data. Bump `version` on each public release.
- Keep pack JSON strict: no BOMs, trailing commas, smart quotes or comment keys (`__comment`); a file that fails to parse is skipped and the log may not say which one. The game does tolerate `//` line comments (208 vanilla 1.26.50 files carry them), but editors, Creator Tools and other parsers often don't, so leave them out of your own files.
- Don't write `.js`/`.json` from PowerShell with `Set-Content -Encoding utf8` on Windows PowerShell 5 (adds a BOM). Use `-Encoding utf8NoBOM` (PowerShell 7) or Node.
- No hardcoded user paths in build scripts; read `%APPDATA%`/`$env:APPDATA` or a config file.

Manifest template (BP):
```json
{
  "format_version": 2,
  "header": { "name": "My Add-on BP", "description": "", "uuid": "<uuid-1>", "version": [1, 0, 0], "min_engine_version": [1, 26, 50] },
  "modules": [
    { "type": "data", "uuid": "<uuid-2>", "version": [1, 0, 0] },
    { "type": "script", "language": "javascript", "entry": "scripts/main.js", "uuid": "<uuid-3>", "version": [1, 0, 0] }
  ],
  "dependencies": [
    { "uuid": "<RP header uuid>", "version": [1, 0, 0] },
    { "module_name": "@minecraft/server", "version": "2.10.0" },
    { "module_name": "@minecraft/server-ui", "version": "2.2.0" }
  ]
}
```

## 3. JSON format versions

- Every release makes schemas stricter **at the newest format_version**, and one bad field stops the whole file loading. Older format versions keep the old parsing (and get auto-upgraded). Safe approach: start from a format version you know loads, get it working in game, then raise it and fix what the content log reports.
- Copy file shapes from the current Mojang `bedrock-samples` vanilla files, not from old tutorials.
- Client entity files: `1.10.0` (`scripts.animate` needs it; the `animation_controllers` field is 1.8.0-only). Animations `1.8.0`, animation controllers `1.10.0`, render controllers `1.8.0`/`1.10.0`, geometry `1.12.0`/`1.16.0`.
- Known breaking changes by format version are listed in `bedrock-whats-new/references/changelog-digest.md` (for example: `interact` arrays-only at 1.26.50; block `collision_box` array-only and `rideable.seats` array-only at 1.26.60; `minecraft:pushable` gone at 1.26.30).
- `sounds.json` entity events must be real level sound events; custom sounds go in `sounds/sound_definitions.json` and must be `.ogg`.

## 4. Script API basics (details in `bedrock-scripting`)

- `system.beforeEvents.startup` registers things (custom components, commands, dimensions, enums). Start game logic in `world.afterEvents.worldLoad`. World/entity calls at top level or in startup throw "does not have required privileges".
- Before-events, custom-component callbacks and command callbacks are read-only: defer writes with `system.run(() => ...)`.
- v1 -> v2 renames: `worldInitialize` -> `startup`/`worldLoad`; `runCommandAsync` -> `runCommand`; `isValid()` -> `isValid` property; the `minecraft:custom_components` list -> component ids as keys.
- Never run work every tick: use a few `system.runInterval` loops (5/20/100 ticks), offset from each other, and `system.runJob` generators for heavy work.
- Always bound entity queries with `location` + `maxDistance` (an unbounded `getEntities()` + `kill()` wipes the dimension).

## 5. Budgets (Microsoft Learn performance guide)

- At most ~25 MB uncompressed and 2,500 files per add-on (Learn's performance guide; the cooperative add-on guidelines allow 3,500, so aim for the lower number); under 800 texture handles (hard limit 4,000, then pink textures).
- Textures load uncompressed (1024x1024 = 1 MB in memory). Vanilla-sized mobs use 64x64 or 128x128. Each texture variant costs a full copy.
- Server cost of entities is pathfinding/AI; client cost is rendering. Keep the number of live entities low and simulate the rest in data.
- Many entities playing sounds is costly; cap simultaneous sounds.

## 6. Testing loop

1. Deploy to the development pack folders. Windows GDK builds (1.21.120+): `%APPDATA%\Minecraft Bedrock\Users\Shared\games\com.mojang\development_behavior_packs` and `development_resource_packs`. Minecraft Preview: `%APPDATA%\Minecraft Bedrock Preview\...`. The old `Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang` path in older videos is out of date.
2. `/reload` reloads scripts and functions only. `/reload all` (1.21.30+) reloads every behavior and resource pack and makes players rejoin. Otherwise JSON, resource pack changes and new custom commands need the world re-entered. More in `bedrock-debugging/references/tools.md`.
3. Turn on Content Log File + Content Log GUI in Creator settings, and read `%APPDATA%\Minecraft Bedrock\logs\ContentLog*.txt` directly instead of asking for screenshots.
4. Run the plugin's checker before every in-game test: `node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <BP dir> <RP dir>` (or `/bedrock-check`). It catches the string joins the game never reports. Mojang's Minecraft Creator Tools (`mct validate`, from the npm package `@minecraft/creator-tools`, only if the user has installed it) is the official second check.
5. Test in Minecraft Preview before the next release ships; schema tightening lands there first.
6. Never call a feature done until it has been seen working in game.

## 7. Safety with the user's machine

- Install nothing on the user's device without their explicit OK, and only from official sources (npm `@minecraft/*` packages from Mojang, Blockbench's built-in plugin store, VS Code Marketplace, Microsoft Store/minecraft.net). Flag anything community-made as such.
- Don't download or run unknown executables, and don't open links from comments or unofficial mirrors.

## Official references

- Microsoft Learn creator docs: https://learn.microsoft.com/en-us/minecraft/creator/
- Script API reference: https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/
- Vanilla files and samples: https://github.com/Mojang/bedrock-samples and https://github.com/Mojang/minecraft-scripting-samples
- Changelogs: https://feedback.minecraft.net/hc/en-us/sections/360001186971 (release) and https://feedback.minecraft.net/hc/en-us/sections/360001185332 (beta and preview)
- Typings: https://www.npmjs.com/package/@minecraft/server
