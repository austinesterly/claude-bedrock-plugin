# Debugging tools

Every official tool for finding out what an add-on is doing, checked 2026-10-06 against Microsoft Learn, the Mojang `minecraft-debugger` README and `package.json`, the `@minecraft/debug-utilities` typings (`1.0.0-beta.1.26.52-stable` and `1.0.0-beta.1.26.60-preview.30`), Creator Tools 0.19.0 and the changelogs. Install nothing on the user's device without asking; all tools below are Mojang or Microsoft.

## 1. Content log

**Turn it on:** Settings > Creator > Content Log Settings.
- **Content Log File**: write everything to a file. Turn this on: it's what you read.
- **Content Log GUI**: show errors on screen as they happen.
- **GUI Log Level** (since 1.21.30): Verbose, Info or Warn for the on-screen view.

`console.warn()` always reaches the log. `console.log()` only shows at Verbose or Info. Errors and warnings appear on screen and in the file; info and verbose lines only in the file.

**History:** the Profile screen has a **Content Log History** button (also **Ctrl+H** while the GUI is on), with a copy-all button.

**File location** (the Profile screen shows the exact path of the current log):
- Windows GDK builds (1.21.120+): `%APPDATA%\Minecraft Bedrock\logs\`
- Minecraft Preview: `%APPDATA%\Minecraft Bedrock Preview\logs\`
- Older UWP builds: see `bedrock-addon-conventions` section 6 and Learn *GDK Migration on Windows*.
- Android: `<storage>/games/com.mojang/logs`; iOS: `<storage>/Minecraft/game/com.mojang/logs`.
- Bedrock Dedicated Server: `content-log-file-enabled=true` in `server.properties` (fixed to actually create the file in 26.40).

The file name is not documented consistently (the conventions skill says `ContentLog*.txt`; Learn says "the most recent `.log` file"). List the folder and open the newest file. Read it yourself instead of asking for screenshots. Error lines and what they mean: `error-dictionary.md`.

## 2. Creator settings and `/reload`

Other switches in Settings > Creator (names as given in changelogs and the debugger README; they move between builds):
- Automatically connect the script debugger on world load or `/reload` (1.20.80+).
- **Enable client diagnostics**: needed for client-side stats (FPS, client memory, entity systems, CPU) in the debugger's diagnostics panel.
- Copy-coordinate UI; command key mappings (26.0: ten keys that each run a command you type).

| Command | Reloads | Doesn't reload |
|---|---|---|
| `/reload` | Function (`.mcfunction`) and script files of all behavior packs (Learn) | Any JSON (entities, items, blocks, recipes, loot), resource packs, new custom commands, newly added custom components or component events, new custom dimensions (`...ReloadNewComponentError`, `CustomDimensionReloadNewDimensionError`) |
| `/reload all` (1.21.30+) | "This causes players to quit the world and rejoin, as well as reloading all behavior and resource packs" (changelog 1.21.30). Since 26.10 also packs outside the development folders | Treat it as a fast re-enter. Whether every JSON type and newly added files are picked up was not verified: if in doubt, leave and re-enter the world |

Both need cheats and operator level. Script state (variables, intervals) is rebuilt on each reload; dynamic properties survive.

## 3. `/script` commands

From Learn (*Developer Tools*; the auto-generated `/script` command page has its headings shuffled, so trust this list):

| Command | Does |
|---|---|
| `/script debugger connect [host] [port]` | Client connects out to VS Code waiting in listen mode (defaults: `localhost`, 19144) |
| `/script debugger listen <port>` | Server waits for VS Code to connect (Dedicated Server; needs `allow-inbound-script-debugging`) |
| `/script debugger close` | Drop the debugger connection |
| `/script profiler start` / `stop` | Record a CPU profile; `stop` writes a timestamped `.cpuprofile` into the log folder |
| `/script diagnostics startcapture` / `stopcapture` | Capture diagnostics over a session (output format not documented; the debugger has **Minecraft Diagnostics: Open Stats Replay**, unverified that it opens these) |

`/script watchdog exportstats` was removed in 1.21.60; use `collectRuntimeStats()` (section 5).

## 4. Minecraft Bedrock Debugger (VS Code)

Official extension by Mojang Studios (publisher `mojang-studios`, id `minecraft-debugger`), from the VS Code Marketplace: https://aka.ms/vscodescriptdebugger. Source and issues: https://github.com/Mojang/minecraft-debugger. Supports breakpoints, stepping, locals, watches, live diagnostics and running slash commands. It can't change variable values and has no immediate mode.

**Setup (game client on the same PC):**
1. Open VS Code on the folder that holds the behavior pack's scripts (your project or the development pack folder).
2. Add `.vscode/launch.json`:
   ```json
   {
     "version": "0.3.0",
     "configurations": [
       {
         "type": "minecraft-js",
         "request": "attach",
         "name": "Debug with Minecraft",
         "mode": "listen",
         "localRoot": "${workspaceFolder}/packs/BP/scripts/",
         "port": 19144
       }
     ]
   }
   ```
   `mode: "listen"` makes VS Code wait for the game; this is what the extension's own schema and the Mojang README use for clients. The Learn page shows `"connect"` here, which is the Dedicated Server mode: if connecting fails, check this first. Learn's sample also has `"preLaunchTask": "build"`; delete it unless you have a task named `build`.
3. Press F5 (VS Code shows it is waiting), load the world, run `/script debugger connect`. Success prints "Debugger connected to host". Or turn on auto-connect in Creator settings.
4. Set breakpoints in the source files. If several packs have scripts, add `"targetModuleUuid": "<the script module uuid from the BP manifest>"` (the module's uuid, not the header's).

**Other launch.json fields** (extension schema): `host` (default `localhost`), `inputPort` (prompt for the port), `sourceMapRoot` + `generatedSourceRoot` (TypeScript or bundled output: the folders with the `.map` files and the generated `.js`), `moduleMapping` (map import names), `passcode`.

**Loopback:** for the UWP package, Learn and the README say to exempt the game once, as administrator:
```
CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436
```
(Preview: `-p=S-1-15-2-424268864-5579737-879501358-346833251-474568803-887069379-4040235476`). Whether GDK builds (1.21.120+) still need it is not documented: try without first.

**Dedicated Server:** in `server.properties` set `allow-inbound-script-debugging=true` (for `listen`) or `allow-outbound-script-debugging=true` (for `connect`); `force-inbound-debug-port` (default 19144); `script-debugger-auto-attach` = `disabled` / `connect` / `listen` with `script-debugger-auto-attach-connect-address` (default `localhost:19144`) and `-timeout` (seconds); `script-debugger-passcode`. Run `/script debugger listen 19144` ("Debugger listening") and use `"mode": "connect"` in launch.json. Since 26.50 listen mode binds to loopback; 26.60 adds `script-debugger-listen-address`, and a non-loopback address needs a passcode.

**Extension extras:** the creeper icon in the Activity Bar opens a home panel with command shortcuts and **Start/Stop Profiler** (set a capture folder first). Commands: **Minecraft Diagnostics: Show Live Stats**, **Open Stats Replay**, **Minecraft Reload**, **Minecraft Run Command**. Settings: `minecraft-debugger.reloadOnSourceChanges.enabled` (+ `.delay`, `.globPattern`) runs `/reload` when you save, `minecraft-debugger.showDiagnosticViewOnConnect`.

**Live diagnostics** (game 1.21.10+): entity count, loaded chunks per dimension, commands per tick, game and script memory, server tick time against the 50 ms target, network bandwidth and packet counts, script handle counts per pack (handle leaks), and with client diagnostics on: FPS, client memory, entity systems, CPU profiling. Push your own charts and tables with `diagnosticsManager` (section 5).

**Won't connect / breakpoints not hit:** mode backwards; port blocked or different; loopback exemption (UWP); wrong `localRoot` or source map paths; several script packs without `targetModuleUuid`; code already ran before you connected (reconnect, then `/reload`).

## 5. `@minecraft/debug-utilities` (beta module)

No stable release. Needs `{ "module_name": "@minecraft/debug-utilities", "version": "1.0.0-beta" }`, a `-beta` `@minecraft/server`, and the Beta APIs experiment: **test worlds only**. Names are listed in `../../bedrock-whats-new/references/preview-api.md`.

```js
import { system, world } from "@minecraft/server";
import { debugDrawer, DebugBox, DebugText, collectRuntimeStats } from "@minecraft/debug-utilities";

world.afterEvents.worldLoad.subscribe(() => {
  const box = new DebugBox({ x: 0, y: 64, z: 0 }); // centre
  box.bound = { x: 10, y: 10, z: 10 };              // size (times box.scale)
  box.color = { red: 1, green: 0, blue: 0, alpha: 1 };
  box.timeLeft = 30;                                // seconds, then removed
  debugDrawer.addShape(box, world.getDimension("overworld"));

  system.runInterval(() => {
    const s = collectRuntimeStats();
    console.warn(`script mem ${s.memoryUsedSize} / ${s.memoryAllocatedSize} B, objects ${s.objectCount}`);
  }, 200);
});
```
- Shapes: `DebugBox` (`bound`), `DebugSphere`, `DebugCircle`, `DebugLine` / `DebugArrow` (`endLocation`, constructor `(location, endLocation)`), `DebugCone`, `DebugCylinder`, `DebugEllipsoid`, `DebugPyramid`, `DebugText` (`(location, text)`, `depthTest`, `backgroundColorOverride`). Common: `color`, `scale`, `rotation`, `timeLeft`, `attachedTo` (follow an entity), `visibleTo` (players; `hiddenFrom` and `defaultVisibleToAll` are new in the 26.60 typings), `maximumRenderDistance`, `remove()`, `setLocation()`. `debugDrawer.removeAll()` clears them.
- Learn's sample `new DebugBox(min, max, color)` with `drawer.draw(box)` doesn't match the typings; use the form above.
- `collectRuntimeStats()`: QuickJS memory and object counts. `collectPluginStats()`: handle counts per pack (find leaks). `disableWatchdogTimingWarnings(true)`: silence slow/spike warnings for this pack.
- `diagnosticsManager.createTab(name)`, `createView(statName, { chartType: DiagnosticsChartDisplayType.LineChart })` or table options, `tab.addView(view)`, `view.pushStats([{ name, values }])`: your own live charts in the VS Code diagnostics panel.
- Stable alternative for in-world labels: `world.primitiveShapesManager.addText(new TextPrimitive(location, text))` in `@minecraft/server` 2.10.0 (text only).

## 6. Minecraft Creator Tools (`mct`)

Mojang's validator and toolkit (npm `@minecraft/creator-tools`, https://github.com/Mojang/minecraft-creator-tools, web version https://mctools.dev). Ask before installing; `npx` downloads it.

```
npx -y @minecraft/creator-tools@latest validate -i <project or packs folder> --single -o <temp folder> --json --force
```
- `-o` keeps the report files (`<name>.report.html`, `.csv`, `.mcr.json`) out of the project. Without `--force` a re-run can return the cached earlier result.
- Suites: `main` (default), `addon` (packaging), `currentplatform`, `all`. Exclude checks: `validate main PATHLENGTH,PACKSIZE`. `--isolated` skips downloading vanilla resources (CI). `--warn-only` keeps the exit code 0.
- `--json` prints `{ errors, warnings, recommendations, projects: [{ items: [{ type, message, generatorId }] }] }`. Most items are `testPass`, `info`, `featureAggregate` or `unknown` ("No applicable items found"); act on `error`, then `warning`, then `recommendation`.
- Check ids to know: `CHKMANIF` manifest, `CPACKICON` icons, `UNLINK` broken references, `COMJSON`/`JSON` schema, `FORMATVER`, `MINENGINEVER`, `NOBOM`, `PATHLENGTH`, `TEXTURE` (handles and memory budgets), `GEOMETRY` (cube count), `SCRIPTMODULE`. Each has a page: `https://learn.microsoft.com/minecraft/creator/reference/content/mctoolsvalreference/<id in lower case>`.
- Also: `mct info`, `mct fix --list` (edits files in place; `randomizealluids` breaks existing worlds), `mct view -i <folder>` (read-only browser view), `mct deploy`, `mct exportaddon`. Never accept the EULA for the user.
- Its texture memory numbers drive Marketplace texture budgets (`performance.md`).

A clean run on a plugin-generated add-on (2026-10-06): 0 errors, 0 warnings, 0 recommendations.

## 7. Bedrock Editor

Built into Bedrock on Windows (PC only, keyboard and mouse). Start it from the Minecraft Launcher's Creator Tools tab (**Create**), or a shortcut to `minecraft://creator/?Editor=true` (Preview: `minecraft-preview://creator/?Editor=true`). Docs: Learn *Bedrock Editor*; extensions and starter kit: https://github.com/Mojang/minecraft-editor (`@minecraft/server-editor`, beta).

Useful for debugging:
- **Entity Inspector** (Ctrl+Shift+I): type id, entity id, location, dimension, tags, effects, components.
- **Block Inspector**: block id, tags, components and editable block states; changing a state applies a new permutation at once.
- **World Options**: pause entities (freeze AI to inspect), **Test World** (play the project, Esc > Return to Editor; nothing you do in the test is saved), change dimension, time, weather.
- **Custom Dimensions** panel: create (`namespace:name`, can't be deleted) and teleport between dimensions.
- **Fill Biomes**: repaint a region's biome (visible after re-entering the world) to test client biomes, fog and spawn rules.
- **Chunk Management**: regenerate chunks from the seed, or delete them, to retest biomes and feature rules (they only apply to newly generated chunks).
- `/reload` and the **Reload Scripts** action work in Editor sessions; since 26.50 `/reload all` reloads the Test World.

## 8. The plugin's `/bedrock-check`

`node "${CLAUDE_PLUGIN_ROOT}/scripts/check-pack.mjs" <pack or project dir> [--json]`, read-only, Node 18+. Run it before every in-game test; it finds the string joins the game never reports:
- JSON that doesn't parse, BOMs, smart quotes, comment keys; manifest UUIDs (missing, invalid, duplicate), missing script entry (exact case), beta modules, BP without the RP dependency.
- Client entity vs BP entity ids, geometry ids, texture paths (extension, backslashes, exact case), render controller `Texture.`/`Geometry.`/`Material.` keys, `scripts.animate` names, animation bones vs geometry, controller states and transitions, particle and sound effect keys, box UVs off the sheet, negative cube sizes.
- Items: icon keys, empty components, the removed `minecraft:custom_components` list. Blocks: geometry location, `material_instances` keys, collision box form, experiment-only components, custom components never registered in scripts.

It can't see runtime behavior, Molang values, spawn conditions or script logic: after it passes, load the world and read the content log.
