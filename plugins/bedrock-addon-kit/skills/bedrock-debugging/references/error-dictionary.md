# Error dictionary: content log, script and validator messages

The full version of `../../bedrock-scripting/references/pitfalls.md` (short table) and the model checklist in `../../bedrock-blockbench/references/wiring-and-debugging.md` section 5.8. Checked 2026-10-06 against game 26.52 / Preview 26.60, `@minecraft/server` 2.10.0, Creator Tools 0.19.0.

## How to read this

Content log lines look roughly like `[Category][Severity]-<file or id> | <JSON path> | <message>` (Creator Tools docs; the Learn example is `[Scripting][Error]-Script threw an exception: ...`). The category names the system (`[Scripting]`, `[Molang]`, `[Recipes]`, `[Json]`...). Fix the first error for a file first: later lines are often side effects. Since 1.21.20 Molang errors include the expression, and since 26.30 the log trims your personal path prefix.

**Src** says where the text comes from. Everything except **P** is verbatim:
- **MCT**: a message string in the Creator Tools 0.19.0 validator (`mct validate`), copied from its code.
- **MCT-doc**: a fragment of a game log line quoted in Creator Tools' own `debug-addon` docs.
- **CL x.y**: quoted in the official changelog for that version.
- **Learn**: quoted on a Microsoft Learn page (some of those pages are marked AI-assisted, so treat the text as an example).
- **Typ**: an error class or enum name from the official typings. The class name shows in the log; the message after it varies.
- **Game**: seen verbatim in a real content log (the date says when).
- **P**: paraphrased. No official source gives the exact text. Search the log for the *idea*, not the words.

Placeholders: `<id>`, `<uuid>`, `<file>`.

## 1. Manifests, UUIDs, pack loading

| Message | Src | Cause | Fix |
|---|---|---|---|
| `All new content targeting published client version must conform to format version [2].` | MCT | Manifest `format_version` isn't 2 (the message doesn't name the file) | Set `"format_version": 2` in every manifest |
| `Header property is required for format version 2 and above` | MCT | Manifest has no `header` | Add `header` with name, uuid, version, min_engine_version |
| `Duplicate UUID found. All UUIDs must be unique` | MCT | Two packs, or a header and a module, share a UUID (copied manifest) | New UUIDs for the copy. Never change the UUIDs of a pack already in worlds |
| `Dependencies should be expressed by 'module_name' or UUID, not both` | MCT | A dependency has both keys | Packs: `uuid` + `version`. Script modules: `module_name` + `version` |
| `Dependency is invalid, no 'module_name' or 'uuid' identifier found` | MCT | Empty or misspelled dependency entry | As above |
| `Dependency with uuid [<uuid>] specified but uuid is not located in any included resource or behavior packs.` | MCT | BP points at an RP header UUID that doesn't exist (often a module UUID) | Use the RP **header** uuid and version |
| `Packs must have exactly one manifest` / `Pack has an unexpected structure, multiple manifests detected. Nested manifests are not allowed.` | MCT | Zip made one folder too deep, or a stray copy inside the pack | `manifest.json` sits directly in the pack folder |
| `Use of [base_game_version] requires [format_version] [2] or higher` | MCT | World template manifest on format 1 | Format 2 |
| Pack missing from the list, no error | P | `min_engine_version` newer than the game; duplicate header UUID; manifest one level too deep | Lower `min_engine_version`; unique UUIDs; fix the folder |
| Pack listed but changes never show | P | World uses an imported `.mcpack` copy, not the development folder | Develop from `development_*_packs`, or bump `header.version` and re-import |
| Behavior works but nothing looks right (or the reverse) | P | Only one pack active | BP depends on the RP header UUID (one direction only) |
| `pack_icon image file not found` / `Found multiple pack icon files` | MCT-doc | Icon missing or duplicated | One square power-of-two `pack_icon.png` per pack |

## 2. JSON parsing

| Message | Src | Cause | Fix |
|---|---|---|---|
| `This file has a syntax error and can't be read as JSON. Check for missing commas, brackets, or quotes. Details: ...` | MCT | Trailing comma, missing comma or bracket, smart quotes, comment keys | Fix at the reported position. The game skips the whole file |
| `JSON file is not JSON compliant` / `JSON file is empty` | MCT | Same, or a zero-byte file | Fix or delete the file |
| `No Byte Order Mark allowed in json file.` / `Byte Order Marks found in file: <file>` | MCT | UTF-8 BOM (Windows PowerShell 5 `-Encoding utf8`) | Re-save without BOM (Node, or `utf8NoBOM`) |
| File silently ignored, entity/item/block "doesn't exist" | P | Parse failure; the game log may not name the file | Run `/bedrock-check`: it reports parse errors, BOMs, smart quotes and comment keys per file |
| JSON over 128 MB fails to load | CL 26.60 (P) | Huge generated file | Split it |
| `(format_version) does not have a value in the enumeration ...` | MCT-doc | `format_version` not one this file type accepts | Use a listed value |
| `is not one of enum values` | MCT | A field value outside its allowed set | Use an allowed value (`bedrock-json-reference`) |

## 3. format_version

| Message | Src | Cause | Fix |
|---|---|---|---|
| Component or field rejected only after raising `format_version` | P | Each release makes schemas stricter **at the newest version** only; one bad field stops the whole file | Go back to the last version that loaded, then raise it and fix each reported field. Breaking changes per version: `../../bedrock-whats-new/references/changelog-digest.md` |
| Spawn rules: format newer than supported | MCT-doc (FORMATVER) | Spawn rules accept `1.8.0`, `1.10.0`, `1.12.0` | Use one of those |
| Item with empty `components` fails to register | CL 26.40 (P) | Items at format 1.26.30+ need at least one component (no legacy fallback) | Add a component (`minecraft:icon`, `max_stack_size`...) |
| `minecraft:custom_components` list rejected | CL 1.21.90 (P) | Removed at format 1.21.90 | Component ids as keys with params |
| `blocks.json` override error | CL 1.21.30 (P) | `blocks.json` `format_version` >= the block names it overrides | Lower the file's `format_version` |
| Works in Preview, fails in release | MCT-doc | `min_engine_version`, `format_version` or a module version newer than the release | Lower them to the stable versions (`current-versions.md`) |

## 4. Unknown or misplaced components

| Message | Src | Cause | Fix |
|---|---|---|---|
| `child 'minecraft:<x>' not valid here` | MCT-doc | Misspelled component, wrong section (BP vs RP, `components` vs `description`), or not valid at this `format_version` | Check spelling and placement in `bedrock-json-reference`; raise `format_version` only if the component needs it |
| `requires the experimental toggle` / "is experimental" | MCT-doc | Feature behind Upcoming Creator Features, Beta APIs or another toggle | Turn the toggle on in a **test** world, or drop the feature for release (`bedrock-experimental`) |
| `Using beta features flag in custom definitions is not allowed` | MCT | JSON uses the beta-features flag | Remove it from shipped content |
| `Experimental gameplay is or was enabled in this world. Shareable content should not use experimental features.` | MCT | Validating a world that ever had experiments | Ship from a world that never had them |
| Unrecognized field in a component | CL 1.20.60 (P) | Typo or field from another format version (warning for item JSON) | Fix the name |
| `Unsupported or out of bounds value.` | CL 1.20.60 | A number outside its range (newer builds print the bounds) | Use a value inside the printed range |
| `minecraft:balloonable` on the player | CL 1.20.10 (P) | Not supported on `minecraft:player` | Remove |

## 5. Geometry and textures (invisible, pink, black)

Start with the string-join checklist in `../../bedrock-blockbench/references/wiring-and-debugging.md` 5.1 and 5.8, and `../../bedrock-blocks/references/troubleshooting.md` for blocks.

| Message | Src | Cause | Fix |
|---|---|---|---|
| `... not found` / `unable to find geometry` | MCT-doc | `geometry.default` (or `minecraft:geometry`) doesn't match any `.geo.json` `description.identifier` | Make the names match exactly; block geometry lives in `RP/models/blocks` |
| `could not find texture` / texture missing | MCT-doc | Path has `.png`, backslashes, wrong case, or the key isn't in `item_texture.json` / `terrain_texture.json` | Path from the RP root without extension; register the key |
| Validator `UNLINK` warning: `Linked <type> Not Found in Pack` / `link target not found in this pack` | MCT | A reference to your namespace that resolves to nothing | Treat as a real bug unless it's a `minecraft:` id |
| `Failed to parse JSON for geometry file. Error: ...` | MCT | Broken `.geo.json` | Fix JSON |
| `Restricted poly_mesh Geometry Found` | MCT | `poly_mesh` geometry | Use cubes |
| `More than <n> cubes in custom blocks may lead to degraded performance.` | MCT | Heavy block model (Learn: aim for 50 cubes or fewer) | Simplify |
| Pink and black everywhere, no error | P | Over the texture handle limit (4,000 hard; Learn recommends under 800 per add-on) | Fewer, atlased textures. MCT: `Uses more than 800 texture handles, which could impact overall Minecraft usage` |
| Missing `minecraft:icon` texture | CL 1.21.80 (P) | Icon key not in `item_texture.json` | Register it |
| Missing `material_instances` texture | CL 1.21.90 (P) | Texture key not in `terrain_texture.json` | Register it (a missing `*` instance is no longer an error) |
| `trying to override the Geometry component with blocks.json settings for a custom block` | CL 1.21.60 | Spurious, fixed in 1.21.60 | Ignore on old builds; on current builds remove the `blocks.json` geometry entry for that block |
| `Block needs both a geometry and material instances component` | CL 1.21.60 | Removed in 1.21.60 | Only seen on old builds |
| Flower-pottable block content error | CL 26.20 (P) | `flower_pottable` without `geometry` and `material_instances` | Add both |

## 6. Render controllers and animations

| Message | Src | Cause | Fix |
|---|---|---|---|
| Unknown render controller id | CL 1.16.220 (P) | `render_controllers` names one that doesn't exist | Define it or use `controller.render.default` |
| Render controller ignored, no textures | CL 1.20.30 (P) | Controller has no `textures` | Add `textures` |
| Material needs more textures | CL 1.17.40 (P) | Material expects N textures, controller gives fewer | Supply the textures the material needs |
| Bind pose only, no error | P | Animation names a missing bone, `scripts.animate` uses a short name not in `animations`, controller state names unknown | `/bedrock-check` catches each of these |
| Animated block stops animating with a content error | CL 1.21.100 (P) | Bad animated-block JSON (used to crash) | Fix the block's animation data |
| `scripts.animate` ignored | P | Client entity below format 1.10.0 | Use 1.10.0 |
| Invalid sound event in `sounds.json` | CL 1.21.30 (P) | Event isn't a real level sound event | Use a real event; custom sounds go in `sound_definitions.json` |

## 7. Molang

| Message | Src | Cause | Fix |
|---|---|---|---|
| `unhandled request for unknown variable` | CL 1.16.220 | Reads a `variable.*` nothing set (on this entity, or before it's set) | Initialize in `scripts.initialize` / `pre_animation`, or use `v.x ?? 0` |
| Content error: undefined variable stops the expression | Learn (P) | Same | `??` works for variables, not for textures, geometry or materials |
| Content error on an entity property default | CL 1.19.30 (P) | `default` or `set_property` expression has side effects (assignment) | Make it a pure expression |
| `query.property` returns 0 with a content error | Learn (P) | Property name not defined on the entity | Define it in `minecraft:properties`, full name with namespace |
| Molang syntax error | MCT-doc | Missing `q.`/`v.` prefix, quotes, or `;` in a multi-statement script | Fix at the reported location; every statement in a multi-statement script ends with `;` |

## 8. Loot tables, recipes, spawn rules

| Message | Src | Cause | Fix |
|---|---|---|---|
| Unknown item in a loot entry | CL 1.17.10 / 1.17.30 (P) | Typo, missing namespace, unknown entry type (used to crash) | Correct the id; check `type` is `item`, `loot_table` or `empty` |
| `item_table` errors | CL 1.20.40 (P) | Behavior can't find or read its item table | Fix the path |
| `Unknown ... identifier` in loot, spawn rule or feature | MCT-doc | Typo or wrong namespace | Correct it; confirm the file exists |
| `[Recipes]` error | MCT-doc | Unknown item in `key`/`result`, pattern rows of different lengths | Fix ids and pattern shape |
| Shaped recipe: pattern key not defined | CL 1.21.50 (P) | A pattern character has no `key` entry, or no key matches the pattern | Every pattern character needs a key |
| Duplicate recipe inputs | CL 1.19.50 (P) | Two recipes with the same inputs and different outputs | Change one |
| Spawn rule: missing entity | CL 1.21.100 (P) | Spawn rule identifier isn't an entity | Same id as the BP entity |
| Mob never spawns naturally, `/summon` works | MCT-doc | Biome tag typo, brightness/height/population limits, wrong cap | Loosen filters one at a time (`bedrock-world-content/references/spawn-rules.md`) |
| Experience orb warning | CL 26.10 (P) | More than 512 orbs requested in one tick | Spread over ticks |

## 9. Blocks and items

| Message | Src | Cause | Fix |
|---|---|---|---|
| Block uses the `minecraft` namespace | CL 1.19.40 (P) | Custom block id `minecraft:...` | Your namespace |
| Permutation / state bit limit | CL 1.20.60, 1.19.70 (P) | Too many states on one block, or over 65,536 custom permutations in a world | Fewer states; split blocks |
| `minecraft:liquid_detection` with empty `detection_rules` fails to load | CL 26.10 | Empty array | Remove the component or add a rule |
| `collision_box` must be an array | P (changelog digest) | Format 1.26.60 | Array of boxes |
| `Menu Category should not have an empty value` | CL 26.20 | Missing `menu_category` was briefly rejected; accepted again from 26.20 | Update the game, or add `menu_category` |
| Entity placer / projectile missing entity | CL 1.21.80 (P) | `minecraft:entity_placer` or `projectile` names an unknown entity | Fix the id |
| `durability_sensor` `particle_type` warning | CL 1.21.60 (P) | Invalid particle type | Use a valid one |
| Custom component never fires | P | Id in JSON but never registered in `startup`, or registered under another name | Register in `system.beforeEvents.startup`; `/bedrock-check` flags unregistered ids |
| `Invalid Particle Identifier. Particle identifier requires a namespace.` | MCT | Particle id without `ns:` | Add the namespace |
| Raw names like `item.ns:thing` | MCT-doc | No lang line | RP `texts/en_US.lang`, or `minecraft:display_name` |

## 10. Script errors: privileges, early execution, read-only

The privilege model is documented in Learn (*Scripting Execution Privilege*): before-events and custom command callbacks run in **restricted execution**; the first load of the file, `startup` callbacks and custom component registration run in **early execution**; after-events and `system.run*` run with full privileges. Typings mark each API `no-restricted-execution`, `early-execution-allowed` or `early-execution-readable`.

| Message | Src | Cause | Fix |
|---|---|---|---|
| `... does not have required privileges` | P (fragment widely seen; not in an official source checked) | A write API (setBlock, spawn, setDynamicProperty, sendMessage on some objects, form `show`) in a before-event, command callback or custom component hook | Wrap the write in `system.run(() => ...)` |
| Same, at load time | P | World, dimension, player or dynamic-property call at top level or in `startup` (early execution) | Move it into `world.afterEvents.worldLoad` |
| `[Scripting][Error]-Script threw an exception: TypeError: ...` | Learn (AI-assisted page) | Any uncaught exception; the stack trace follows with `scripts/main.js:<line>` | Read the first stack line; try/catch inside every loop body |
| `CustomComponentNameError` (`NoNamespace`, `DisallowedNamespace`) | Typ | Component id without namespace, or `minecraft:` | `ns:name` |
| `NamespaceNameError` | Typ | Command, enum or dimension name without a valid namespace | `ns:name` |
| `ItemCustomComponentAlreadyRegisteredError` / `BlockCustomComponentAlreadyRegisteredError` | Typ | Same id registered twice (two files, or a template copied twice) | Register once |
| `...CustomComponentReloadNewComponentError` / `ReloadNewEventError` / `ReloadVersionError` | Typ | `/reload` after adding a component, adding an event hook, or changing the module version | Re-enter the world |
| `CustomDimensionReloadNewDimensionError` | Typ | `/reload` after adding a custom dimension | Re-enter the world |
| `CustomCommandError` | Typ | Bad command definition (name, parameter, enum not registered first) | Register the enum before the command; names need a namespace |
| `InvalidEntityError` (has `id`, `type`) | Typ | Entity died, unloaded or left | Check `entity.isValid` after every await or delay |
| `InvalidItemStackError`, `InvalidContainerSlotError`, `InvalidContainerError` | Typ | Stale item or slot handle | Re-read the container |
| `LocationInUnloadedChunkError` / `UnloadedChunksError` | Typ | Block or area in an unloaded chunk | `dimension.isChunkLoaded`, a ticking area, or retry later |
| `LocationOutOfWorldBoundariesError` | Typ | Y outside the dimension's height range | Clamp to `dimension.heightRange` |
| `EntitySpawnError` | Typ | Spawning an unknown, unspawnable or blocked entity | Check the id and `is_spawnable`/`is_summonable` |
| `CommandError` | Typ | `runCommand` text invalid or failed | Test the command in chat first |
| `InvalidArgumentError` / `ArgumentOutOfBoundsError` / `PropertyOutOfBoundsError` / `EngineError` | Typ (`@minecraft/common`) | Bad argument, out-of-range value, engine failure | Validate inputs; read the message |
| `Entity.teleport` throws | CL 26.50 (P) | Cross-dimension teleport with passengers | Dismount first |
| `TypeError: not a function` / `cannot read property ... of undefined` | P (QuickJS wording varies) | 1.x API on 2.x (`runCommandAsync`, `isValid()`), or a missing object | See pitfalls.md renames; optional chaining |
| `world.beforeEvents.chatSend` is undefined | P | Beta-only API on a stable module | `customCommandRegistry` or an item `onUse` |

## 11. Module versions

| Message | Src | Cause | Fix |
|---|---|---|---|
| Script never runs, `[Scripting]` module or version error | MCT-doc / P | Manifest `module_name` version not provided by this game build, or a `-beta` version without the Beta APIs experiment | Stable: exact version from `current-versions.md`. Beta: matching `-beta` version and the experiment |
| Validator `Script Module Beta Version Out of Date` / `Script Module Not Registered on NPM` | MCT (titles) | Beta version older than the latest, or an unknown module | Use the current beta for your build, or a stable version |
| Whole `main.js` dead after adding one import | P | Static import of a module missing from the manifest (common with `server-gametest`, `debug-utilities`) | Add the dependency, or keep beta code in a separate test pack |
| Works in a test world, fails for players | P | The test world had Beta APIs on | Ship stable modules only |

## 12. Watchdog and performance warnings

| Message | Src | Cause | Fix |
|---|---|---|---|
| Slow-script and spike warnings in the content log | CL 1.19.20 (P) | Script time over the slow (multi-tick average) or spike (single tick, default 100 ms) threshold | `performance.md`: runJob, cadence, bounded queries |
| Script runtime terminated: `Hang` | Typ (`WatchdogTerminateReason`) | One tick ran past the hang threshold (infinite loop, huge sync loop) | Break work up; never `while (true)` without a yield |
| Script runtime terminated: `StackOverflow` | Typ | Unbounded recursion | Iterate instead |
| Memory warning / world saved and shut down | CL 1.19.30 (P) | Script memory over `script-watchdog-memory-warning` / `-limit` (Dedicated Server) | Release caches and maps; clean up on `playerLeave` |

Warnings can be silenced per pack in **test worlds** with `disableWatchdogTimingWarnings(true)` from beta `@minecraft/debug-utilities`. Hide the symptom only after you've read the profiler.

## 13. Custom dimensions and biomes

| Message | Src | Cause | Fix |
|---|---|---|---|
| `minecraft:default_biome` on a vanilla dimension | CL 26.50 (P) | Only custom dimensions accept it | Remove it from vanilla dimension files |
| Snow accumulation min above max | CL 1.21.20 (P) | Biome `snow_accumulation` range reversed | Swap them |
| `overworld_generation_rules` / `multinoise_generation_rules` error in a custom biome | CL 1.21.110 (P) | Vanilla-only components | Remove; use `minecraft:replace_biomes` |
| Missing block or biome reference in biome or client biome JSON | CL 1.21.90 / 1.21.100 (P) | Typo | Fix the id |
| `[BiomeRegistry][error]-minecraft:replace_biomes \| No biome found with name: 'deep_ocean'` and `[Json][error]- -> components -> minecraft:replace_biomes -> replacements[0] -> targets[0]: Missing referenced asset deep_ocean` | Game 2026-10-28 | A bare target name. The docs say "Target biomes must not contain namespaces", but the game wants full ids, and one bad target drops the whole biome | `"targets": ["minecraft:deep_ocean"]` |
| `[BiomeRegistry][error]-Loaded client biome but no biome with that name exists: <id>` | Game 2026-10-28 | The BP biome was rejected (see the line before it) or its identifier differs from the client biome's | Fix the BP biome's errors first |
| `CustomDimensionAlreadyRegisteredError` / `CustomDimensionNameError` | Typ | Same id in JSON and script, or a bad name | Define each dimension once; `ns:name`, lower case |

More: `../../bedrock-dimensions-biomes/SKILL.md` "Rules that bite".

## 14. GameTest and debugger messages

| Message | Src | Meaning |
|---|---|---|
| `GameTestError` with `type` `Assert`, `AssertAtPosition`, `ExecutionTimeout`, `ExhaustedAttempts`, `FailConditionsMet`, `LevelStateModificationFailed`, `MethodNotImplemented`, `SimulatedPlayerOutOfBounds`, `Waiting` | Typ | Assert failed, test hit `maxTicks`, out of attempts, `failIf` met, world edit failed, bot left the area; `Waiting` is normal inside `succeedWhen` |
| `GameTestCompletedError` (`Done`, `Cleanup`) | Typ | Calling into a finished test; ignore in `runOnFinish` cleanup |
| `Debugger connected to host` | Learn / Mojang README | `/script debugger connect` worked |
| `Debugger listening` | Learn / Mojang README | `/script debugger listen <port>` worked (Dedicated Server) |
| `DiagnosticsError` (`AlreadyRegistered`, `InvalidData`, `InvalidName`) | Typ (debug-utilities) | Live diagnostics tab or view registered twice, bad stats, empty name |
