---
name: bedrock-debugging
description: Use when a Minecraft Bedrock add-on fails or lags - content log errors, a pack not loading, something invisible/pink/not working, script errors, the VS Code debugger, profiling, lag and performance, automated tests with GameTest, or the Bedrock Editor.
---

# Bedrock debugging, performance and fixes

Find the cause from the evidence the game gives, fix it, then confirm in game. Checked 2026-10-06 against game 26.52 / Preview 26.60, `@minecraft/server` 2.10.0, the beta `server-gametest` and `debug-utilities` typings, Microsoft Learn, the Mojang debugger README and Creator Tools 0.19.0. Testing loop and file paths: `bedrock-addon-conventions` section 6.

## First three moves, every time

1. **Static check:** `/bedrock-check` (`node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <project>`). It catches broken string joins the game never reports. Optionally Mojang's `mct validate` (`references/tools.md` 6).
2. **Content log:** Settings > Creator: Content Log File + GUI on. Re-enter the world, then read the newest file in `%APPDATA%\Minecraft Bedrock\logs\` (Preview: `Minecraft Bedrock Preview`) yourself. Match lines in `references/error-dictionary.md`.
3. **Reload correctly:** `/reload` = scripts and functions only. `/reload all` (1.21.30+) = rejoin + all behavior and resource packs. New custom commands, components or dimensions: leave and re-enter the world.

## Triage flowchart

```
What do you see?
|
+- Pack missing from the list / "can't load" / nothing at all
|     -> error-dictionary.md 1 (manifest, UUIDs) and 2 (JSON parse)
|
+- Content log shows an error line
|     -> error-dictionary.md: search the category in [brackets] and the key words
|        [Json]/parse ......... 2      format_version ......... 3
|        "not valid here" ..... 4      geometry / texture ..... 5
|        render controller / animation ...... 6    [Molang] ..... 7
|        [Recipes] / loot / spawn ........... 8    blocks / items  9
|        [Scripting] ........................ 10-11
|        custom dimension / biome ........... 13
|
+- Entity or block invisible, pink/black, in bind pose, or wrong shape
|     -> bedrock-blockbench/references/wiring-and-debugging.md 5.1 and 5.8
|        blocks: bedrock-blocks/references/troubleshooting.md
|        then error-dictionary.md 5-6
|
+- Item/block/entity "doesn't exist" (/give, /summon unknown)
|     -> the JSON failed to parse or one field is rejected: /bedrock-check,
|        then error-dictionary.md 2-4 and 9
|
+- Script does nothing / throws
|     |- "does not have required privileges" ... error-dictionary.md 10
|     |- script never starts, module/version ... error-dictionary.md 11
|     |- logic wrong, no error ................. tools.md 4 (VS Code debugger, breakpoints)
|     +- quick facts on screen ................. templates/debug-overlay
|
+- Works in my world, not for players / not in Preview
|     -> experiments or beta modules: error-dictionary.md 4 and 11, bedrock-experimental
|
+- Lag, low FPS, slow-script warnings, watchdog
|     -> performance.md 6 (profiler) first, then 1-2 (scripts), 3 (entities),
|        4 (rendering), 5 (particles, sounds); error-dictionary.md 12
|
+- Mob never spawns / despawns / stops moving far away
|     -> performance.md 3, bedrock-world-content/references/spawn-rules.md
|
+- Custom dimension or biome looks wrong or doesn't apply
|     -> error-dictionary.md 13, bedrock-dimensions-biomes "Rules that bite",
|        Bedrock Editor Fill Biomes / Chunk Management (tools.md 7)
|
+- "It broke again after my change": write a GameTest -> gametest.md, templates/gametest-starter
```

## Rules

- **Evidence before edits.** Quote the log line, the validator item or the profiler entry you're fixing. Don't guess a field name: check `bedrock-json-reference`.
- **Fix the first error of each file first.** Later lines are often side effects.
- **One bad field drops the whole file**, and newer `format_version`s are stricter. Back off to the last version that loaded, then step up (`bedrock-whats-new/references/changelog-digest.md`).
- **Restricted contexts are read-only.** Before-events, custom command callbacks and custom component hooks: wrap writes in `system.run`. Top level and `startup`: no world calls; use `world.afterEvents.worldLoad`.
- **Bound every query.** `getEntities` with `location` + `maxDistance` + `type`; never every tick.
- **Beta tools stay in test worlds.** `@minecraft/server-gametest`, `@minecraft/debug-utilities` and `-beta` server versions need the Beta APIs experiment, which a world can never turn off. Use a separate test world and, better, a separate test pack: a static import of a missing module stops all of `main.js`.
- **Measure performance.** Profile before and after; don't silence watchdog warnings to "fix" lag.
- **Never call it fixed** until it's been seen working in game with a clean content log.

## Tools at a glance (details in `references/tools.md`)

| Need | Tool | Status |
|---|---|---|
| Broken references, parse errors | `/bedrock-check` | Plugin, read-only |
| Official validation, texture budgets | `mct validate` (npm `@minecraft/creator-tools`) | Official, ask before installing |
| What the game rejected | Content log file and history (Ctrl+H) | Stable |
| Breakpoints, watches, live server stats | Minecraft Bedrock Debugger (VS Code) + `/script debugger connect` | Official extension |
| Where script time goes | `/script profiler start` / `stop` -> `.cpuprofile` | Stable |
| Shapes and labels in the world, memory stats, custom live charts | `@minecraft/debug-utilities` | **Beta module** |
| In-world text labels without beta | `world.primitiveShapesManager` + `TextPrimitive` | Stable |
| Inspect entities and block states, test world, regenerate chunks, repaint biomes | Bedrock Editor | Stable, Windows only |
| Repeatable automated tests | `@minecraft/server-gametest` + `/gametest` | **Beta module** |

## Templates

Add with `node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs" <dir> --name "X" --ns myns --add <template>`; `ns` is renamed and top-level scripts are imported into `main.js`. Templates ship no manifest.

| Template | What it gives | Needs |
|---|---|---|
| `templates/debug-overlay` | `/ns:debug` toggles a per-player action-bar overlay: TPS estimate, entity counts near you and loaded per dimension (your `ns:` ones separately), dynamic property counts and bytes. `/ns:debug props` lists dynamic properties, `/ns:debug entities` lists entity types | Stable `@minecraft/server` 2.10.0. Operator; remove or leave off in shipped packs |
| `templates/gametest-starter` | Three tests (block placement, mob survives, simulated player), README with the manifest line and structure steps | `--beta`, a manual `@minecraft/server-gametest` `1.0.0-beta` dependency, Beta APIs, a saved `ns:pen` structure |

## References

- `references/error-dictionary.md`: content log, script and validator messages with cause and fix, marked exact or paraphrased.
- `references/tools.md`: content log, Creator settings, `/reload`, `/script`, VS Code debugger, debug-utilities, Creator Tools, Bedrock Editor, `/bedrock-check`.
- `references/performance.md`: watchdog thresholds, script patterns, entities and despawn, render, particle and sound costs, reading the profiler.
- `references/gametest.md`: GameTest registration, structures, the `Test` API, simulated players, `/gametest` commands.
- Related: `bedrock-scripting/references/pitfalls.md` (short table), `bedrock-blockbench/references/wiring-and-debugging.md`, `bedrock-experimental`, `bedrock-whats-new/references/preview-api.md` (beta names).
