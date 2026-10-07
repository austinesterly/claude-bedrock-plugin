# Performance: budgets, lag and how to measure it

Sources: Learn *Improving performance and resource usage*, *Texture Budgets*, *Simulation Distance, Render Distance, and Ticking Areas*, *Bedrock Dedicated Server Properties*, *Developer Tools*, the `minecraft:despawn` reference, the changelogs (1.19.20 / 1.19.30 watchdog), the `@minecraft/server` 2.10.0 typings and the debugger README (2026-10-06). Code patterns for loops and persistence live in `../../bedrock-scripting/references/code-patterns.md` sections 5 and 6; this file is about budgets and measuring.

**Measure first.** `/script profiler start` / `stop` for script time, the VS Code debugger's live diagnostics for tick time, entities and memory, the `debug-overlay` template for a quick in-game read. Change one thing, measure again.

## 1. Script budgets and the watchdog

The server ticks 20 times a second, so one tick has 50 ms for everything (entities, redstone, commands, scripts). The diagnostics panel shows server tick time against that 50 ms target. Scripts are watched by the **watchdog**:

| `server.properties` key (Dedicated Server) | Default | What it does |
|---|---|---|
| `script-watchdog-enable` | `true` | Turns the watchdog on |
| `script-watchdog-spike-threshold` | `100` (ms) | Warn when one tick of script runs longer than this |
| `script-watchdog-slow-threshold` | 2 ms (changelog 1.19.20; not on the current Learn page) | Warn when script time averaged over several ticks is above this |
| `script-watchdog-hang-threshold` | `10000` (ms, Learn; the 1.19.20 changelog said 3000) | A single tick this long counts as a hang |
| `script-watchdog-hang-exception` | `true` | Throw a critical exception on a hang, interrupting the script |
| `script-watchdog-enable-exception-handling` | `true` | Let `system.beforeEvents.watchdogTerminate` (beta) cancel the termination |
| `script-watchdog-enable-shutdown` | `true` | Shut the server down after an unhandled watchdog exception |
| `script-watchdog-memory-warning` / `-memory-limit` | (MB) | Changelog 1.19.30: content log warning / save and shut down over this combined script memory. Not on the current Learn page |

- Clients and Realms use built-in values you can't change. There is no gamerule for the watchdog. The command gamerules `functioncommandlimit` (maximum 10000) and `maxcommandchainlength` cap function and command-block chains.
- Termination reasons (`WatchdogTerminateReason`, beta): `Hang` and `StackOverflow`.
- Beta `disableWatchdogTimingWarnings(true)` (`@minecraft/debug-utilities`) silences slow and spike warnings for your pack in test worlds. It hides the warning, not the lag.

## 2. Script patterns that keep you inside the budget

- **Cadence.** Nothing every tick unless it must be. A few `system.runInterval` loops at 5 / 20 / 100 ticks, offset so they don't land on the same tick (Learn). One loop per concern, not one per entity.
- **Spread big jobs.** `system.runJob(generator)` gives the generator a time slice each tick and runs it until it yields (typings); `yield` after each unit of work (one block, one entity, one chunk). Or `await system.waitTicks(1)` between batches. A long `await` chain that never yields still runs in one tick.
- **Bounded queries.** `dimension.getEntities()` with no options walks every loaded entity. Ask the engine to filter: `{ type, families, tags, location, maxDistance, closest }` (Learn: "fetch only the objects you're interested in"). Never call it per tick per player; cache the result for the loop and refresh on an interval.
- **Cache handles.** Get `world.getDimension(...)` once and reuse it (Learn's profiler example). Keep entity references in a `Map` by `id`, and drop them on `entityRemove` / `playerLeave` so the map doesn't grow forever.
- **Events over polling.** `entityHurt`, `playerBreakBlock`, `itemUse` and custom components fire only when something happens; polling every entity every tick doesn't.
- **Commands.** Avoid `runCommand` every tick, and split big `/fill` or `/clone` work over several ticks. Prefer the API equivalent (`fillBlocks`, `cloneBlocks`).
- **Dynamic properties.** Read once into memory, write on change plus a periodic checkpoint. String values have a size cap (the scripting skill chunks at 30,000 under a 32,767-byte limit; the cap isn't stated in the typings or Learn pages checked). Block-entity dynamic properties are limited to 1 KB per pack per block (typings). `getDynamicPropertyTotalByteCount()` on world, entity and item: the typings warn that megabytes on one entity "may be slow to load on various devices". The `debug-overlay` template prints these counts.
- **Memory.** Clean caches on `playerLeave`, bound their size, unsubscribe what you no longer need. `collectRuntimeStats()` (beta) and the diagnostics panel show script memory; handle counts per pack reveal leaks.

## 3. Entities

Learn: server cost of entities is pathfinding and AI, client cost is rendering.
- Keep the number of live entities in loaded chunks low, including the full vertical space of a chunk; hidden or far ones still tick. Limit how many path-find near each other. Don't use entities for block behavior: use custom blocks.
- Store far-away or idle state in data (dynamic properties) and spawn the entity only when a player is near.
- **Simulation distance** (default 4 chunks, up to 12 on capable devices) decides what ticks. Ticking areas keep regions ticking with no player: at most 10 per world from commands, 100 chunks each; script ticking areas (`world.tickingAreaManager`) have a per-pack chunk budget (`maxChunkCount`). Keep them small and temporary.
- **Despawn** (`minecraft:despawn`): standard rules use `despawn_from_distance` (`min_distance` 32, `max_distance` 128), a random chance (`min_range_random_chance` 800), an inactivity timer (`min_range_inactivity_timer` 30 s) and instant despawn at the simulation edge (`despawn_from_simulation_edge`). Without the component, or with `minecraft:persistent`, entities pile up. Give ambient and spawned-by-rule mobs a despawn component.
- **Spawning**: spawn rules with population control and density limits (`bedrock-world-content/references/spawn-rules.md`). Experience orbs: a content warning above 512 in one tick (26.10).
- Per-component tick cost is not documented. The engine work is in navigation and AI goals (`navigation.*`, `behavior.*`, many with search radii), sensors and timers that evaluate filters, and physics. Fewer goals, smaller search ranges and less frequent sensors are the levers (derived from the Learn guidance, not measured).

## 4. Rendering (client)

- **Geometry:** aim for 50 cubes or fewer per block model, lower for blocks placed in bulk (Learn); Creator Tools warns above its cube budget. Fewer bones means fewer transforms per frame (derived). Visible bounds that are too large keep entities drawing when off screen; too small makes them pop out.
- **Textures** are loaded uncompressed. Creator Tools counts texels x 4 bytes (a 1024 x 1024 texture is about 4 MB; Learn's example counts texels, 1,048,576). Trim empty space; non-square sizes are fine. Recommended maximums: 256 x 256 for non-entity textures, 2048 x 2048 for flipbooks and hand-made atlases. Each variant (tamed collar, colors) is another full texture.
- **Texture handles:** under 800 for an add-on (2,000 for a world template); the hard limit is 4,000, after which textures turn pink and the game gets unstable. Atlas many small entity textures (UV-offset material + `uv_anim`, Learn guide).
- **Texture budgets** (Marketplace, measured by Creator Tools): add-on 150 MB at memory tier 1 up to 800 MB at tier 5; use subpacks with `memory_performance_tier` to scale. Vibrant Visuals Enhanced submissions must meet tier 2.
- **Materials and alpha:** use opaque or `entity_alphatest` (cut-out) where you can; blended transparency (`entity_alphablend`) has to be sorted and drawn back to front, so use it only where you need partial transparency (derived; not measured).
- **Pack size:** add-ons at most about 25 MB uncompressed and 2,500 files (Learn). Packs over 200 MB or 10,000 files have run out of memory on some devices.

## 5. Particles and sounds

- **Particles:** keep the number simulating at once and their complexity low (Learn). Set `max_particles` on the emitter rate (`emitter_rate_steady` / `emitter_rate_manual`, default 50), use short lifetimes, and scale density by `player.clientSystemInfo` (lower when render distance is high or the device is weak, but never change gameplay).
- **Sounds:** limit the length, size and number of sounds playing at once, especially ones triggered fast by player input. Compression doesn't help: the cost is the in-memory size. Many entities playing sounds is costly, and many simultaneous sounds can cause lock contention and freezes on some platforms (Learn). Cap concurrent sounds in script, and keep sound file counts down.

## 6. Reading the profiler

1. `/script profiler start`, play the slow part for a few minutes, `/script profiler stop`. A timestamped `.cpuprofile` lands in the log folder (or use **Start/Stop Profiler** in the debugger's home panel).
2. Open it in VS Code with the workspace at the behavior pack root so source links resolve. The default view lists functions with **self time** (inside the function), **total time** (including what it calls) and call counts; the flame-chart view (flame icon) shows call stacks over time. Since 1.19.10 core API calls appear too, so you see engine calls such as `getEntities` or `getBlock` as their own entries.
3. Look for: high total time in your loop functions, functions called far more often than expected (per entity per tick), and expensive API calls inside loops (move them out and cache).
4. The live diagnostics panel complements it: tick time split by category, entity and chunk counts, memory, and per-pack handle counts. A rising handle count with steady gameplay means a leak.

Quick checklist when it lags: profiler top entries; anything every tick; unbounded `getEntities`; entity count near the player (debug overlay); particle and sound spam; texture handles and memory (Creator Tools); then test on a low-end device early (Learn).
