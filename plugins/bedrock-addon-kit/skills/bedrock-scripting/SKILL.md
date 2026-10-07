---
name: bedrock-scripting
description: Use when writing or debugging Minecraft Bedrock Script API code (@minecraft/server, @minecraft/server-ui): events, custom item/block components, custom slash commands, forms and Data-Driven UI (CustomForm, MessageBox), dynamic properties, runJob/runInterval scheduling, and performance.
---

# Bedrock Script API (2.x)

Before using any API, confirm it is **stable** in the version the pack targets: check `../bedrock-whats-new/references/api-surface.md` (generated from the official npm typings) and `../bedrock-whats-new/references/current-versions.md`. Tutorials often use beta-only APIs; a beta API needs the Beta APIs experiment, which a shipped add-on should not need.

References:
- `references/code-patterns.md`: copy-ready, typings-checked code for startup, commands, custom components, forms, persistence, scheduling, entity indexing.
- `references/pitfalls.md`: the read-only contexts, privilege errors, v1 -> v2 renames, and other traps, with their fixes.

## Core model

- **Load order.** Top-level module code and `system.beforeEvents.startup` run before the world exists. Startup holds every registry: `blockComponentRegistry`, `itemComponentRegistry`, `customCommandRegistry`, `dimensionRegistry`. Game state starts in `world.afterEvents.worldLoad`.
- **Read-only contexts.** Before-events, `before*` custom component hooks (such as `beforeOnPlayerPlace`) and custom command callbacks can't change the world. Other custom component callbacks (`onPlayerInteract`, `onUseOn`, `onRandomTick`, `onTick`, `onRedstoneUpdate` and similar) can write directly, as Mojang's samples do; if one throws a privilege error, fall back to `system.run`. Wrap writes in `system.run(() => ...)` and re-fetch entities by id inside it.
- **Tick flush.** Promise continuations, `system.run*` callbacks and after-events drain together, so an `await` chain that never yields runs in one tick. Spread heavy work with `system.runJob(generator)` or `await system.waitTicks(n)`.
- **No pathing API.** Scripts can't make a mob walk to a point. Movement comes from JSON AI goals switched by events (`entity.triggerEvent("ns:go_home")`) and properties (`entity.setProperty`). See `bedrock-entity-behavior`.
- **State lives in data, not entities.** Long-lived game state goes in world dynamic properties as versioned JSON; entities carry only an id that points at their record.

## Defaults to apply

- Cadence: 2-4 `system.runInterval` loops at 5 / 20 / 100 ticks, offset so they don't share a tick; each loop body in try/catch with logging so one error doesn't kill the loop. Keep the reschedule outside the try.
- Budget: aim for under ~30 ms of script per tick (the watchdog warns on spikes over ~100 ms and terminates scripts that hang for seconds).
- Entity queries: always `dimension.getEntities({ location, maxDistance, type })`, around players only. Look up a known entity with `world.getEntity(id)`, never by scanning.
- Chunks: check `dimension.isChunkLoaded(loc)` before `getBlock`; fills into unloaded chunks are silently dropped.
- Forms: one helper per player that retries `UserBusy` (forms opened from chat or a command always hit it first) and never stacks two forms. `CustomForm` for live screens, `ActionFormData` for simple menus, `MessageBox` for a two-button confirm.
- Commands: `customCommandRegistry.registerCommand` slash commands (namespaced), not chat parsing.
- Identity: key player data by `player.id`, never the name. Payments and rewards carry an operation id so a retry can't pay twice.
- Tooling: plain JS checked by `tsc --checkJs` against the `@minecraft/server` typings, or TypeScript with Mojang's `@minecraft/core-build-tasks`. Source maps plus the official Minecraft Bedrock Debugger (VS Code) for breakpoints.

## Debug loop

1. `/reload` picks up script changes (not JSON, RP, or new commands: re-enter the world for those).
2. Read `ContentLog*.txt` (`%APPDATA%\Minecraft Bedrock\logs\`) for stack traces; `console.warn` lines appear there too.
3. "does not have required privileges": you called a world API from startup, top level or a read-only callback. Move it to `worldLoad` or `system.run`.
4. A module-not-found error in the content log (wording varies; see `bedrock-debugging/references/error-dictionary.md`) or the script never runs: manifest `dependencies` version doesn't match an available module version, or the `script` module/entry path is wrong.
