# Building a map: from dev world to release

Source keys:
- **[PARK]** Learn: Parkour World Creation Guide, https://learn.microsoft.com/en-us/minecraft/creator/documents/parkourworldguide
- **[WT]** Learn: Create a World Template, https://learn.microsoft.com/en-us/minecraft/creator/documents/createaworldtemplate
- **[EXP]** Learn: Experimental Features, https://learn.microsoft.com/en-us/minecraft/creator/documents/experimentalfeaturestoggle
- **[TICK]** Learn: Ticking Area Command, https://learn.microsoft.com/en-us/minecraft/creator/documents/tickingareacommand
- **[TJ]** Learn: Introduction to tick.json, https://learn.microsoft.com/en-us/minecraft/creator/documents/tickjsonintroduction
- **[DDOH]** Learn: Data-Driven Overworld Height and Void Generation, https://learn.microsoft.com/en-us/minecraft/creator/documents/datadrivenoverworldheight
- **[ED]** Learn: Bedrock Editor pages (Overview, Workflow, World Options, Structures, Chunk Management, Custom Dimensions), https://learn.microsoft.com/en-us/minecraft/creator/documents/bedrockeditor/editoroverview
- **[MP]** Learn: Building Multiplayer-Aware Scripts, https://learn.microsoft.com/en-us/minecraft/creator/documents/scripting/multiplayer-scripts
- **[INGAME]** Learn: Create an In-World Game with Commands, https://learn.microsoft.com/en-us/minecraft/creator/documents/createaninworldgame
- **[COOP]** Learn: Guidelines for Building Cooperative Add-Ons
- **[26.30]** Minecraft 26.30 changelog (Editor export settings)

## 1. Make the dev world

- Create it in the game: Play > Create New > Create New World. Learn's parkour guide uses a **Flat** world with **Show Coordinates** and **Activate Cheats** on [PARK]. Cheats are needed for `/function`, `/gamerule`, `/setworldspawn` and testing.
- Decide on experiments now. "If you're planning to build content that you want to share with the community, it would be best to do it in a non-experimental world" and such worlds "cannot be restored to a non-experimental state" [EXP]. Whatever is on in the dev world is on in every copy of the template. See `experiments-and-features.md`.
- Keep two worlds: the build world, and a clean copy you export. "Export the world to ensure you can share a copy with people and so that you have a clean copy of the world that doesn't have any items removed or puzzles triggered" [PARK].

## 2. Develop the packs outside the world

- Write the BP and RP in your project (`/bedrock-new`) and deploy them to `development_behavior_packs` / `development_resource_packs` (`bedrock-addon-conventions` section 6). Activate both on the dev world. Development packs reload each launch; `/reload` reloads scripts and functions.
- Only at release copy the packs **into** the world. `world-template.mjs init --packs <project>/packs` does that and writes `world_behavior_packs.json` / `world_resource_packs.json`. Don't leave both a development copy and the bundled copy installed while you test the template: 26.60 Preview says development packs "take precedence over other copies when their version is equal or newer" (see `../../bedrock-shipping/references/packaging.md`).
- Keep the pack folder names inside the world at 10 characters or less [WT]; `init` names them like `mymap_bp`.

## 3. World settings, spawn and ticking areas

Learn's release checklist for a map [PARK]:
- Turn on **Keep Inventory** "so that players will not lose items you expect them to have in the map".
- `/setworldspawn` "in the right location and facing the right direction".
- "Players will receive anything you have in your inventory." Empty it or fill it on purpose before the final save.
- Game mode **Adventure** "so players can't punch through your walls".

Other settings to fix before export: daylight and weather cycle, mob spawning, mob griefing, fire spread, TNT, natural regeneration, PvP, difficulty. Game rule names (`dodaylightcycle`, `domobspawning`, `keepinventory`, `pvp` and so on): `../../bedrock-world-content/references/functions-and-commands.md`. The Editor's export panel sets the same options in one place [ED Workflow].

Lock them for players with `"lock_template_options": true` in the template manifest ("This will lock the player from modifying the options of the world", Learn manifest reference). Exactly which options the lock covers: unverified; test it by creating a world from the template and opening its settings.

Ticking areas keep chunks running with no player near (command blocks, redstone, scripted machines):
- `/tickingarea add` "You can have up to 10 ticking areas in one world"; a circle has "a maximum radius of 4 chunks"; `preload` makes an area load before the world starts [TICK].
- Script `world.tickingAreaManager` is stable, has its own per-pack chunk limit and resolves when the chunks are loaded (`../../bedrock-dimensions-biomes/references/dimensions.md`, `../../bedrock-scripting/references/code-patterns.md` section 8).
- The cooperative guidelines tell add-ons to avoid ticking areas because they are limited and shared [COOP]. A map owns its world, so it can use them, but count them.

## 4. Terrain: generate, limit, build

- **Pre-built area only.** Build everything players should see. Chunks nobody visited generate from the seed when a player first reaches them. A tool to pre-generate a region: none documented on Learn (unverified); flying over the area in the dev world generates it.
- **Void or height-limited worlds.** A BP `dimensions/overworld.json` (or `nether.json`, `the_end.json`) with `minecraft:dimension_bounds` and `"generator_type": "void"` makes new chunks void and slices the buildable height to multiples of 16 between -512 and 512 [DDOH]. Adding it to an existing world hides what is outside the range; saved chunks are kept. Details: `../../bedrock-dimensions-biomes/references/dimensions.md`. This is a dimension file, which add-ons may not ship [COOP]; in your own world it is the documented way to make void maps.
- **Keeping players in.** Walls, barrier blocks and Adventure mode. A world border feature: none on Learn (unverified). `showbordereffect` is a game rule but its effect on custom content is unverified.
- **Structures.** Save builds with structure blocks or `/structure save ... disk`, ship `.mcstructure` files in `BP/structures/<ns>/`, place them with `/structure load` or `world.structureManager` (`../../bedrock-world-content/references/worldgen.md`, `functions-and-commands.md`). Learn's cooperative guidelines send "a starting area structure" or structures that spawn "without player interaction" to "an entire world instead" [COOP].
- **Bedrock Editor.** Brush, fill, extrude, terrain and repeater tools; a Structures panel that saves selections and stamps them with paste preview; Chunk Management to regenerate chunks to the seed or delete them ("Deleted chunks will be regenerated when a player next visits the area"); a Custom Dimensions panel (`namespace:name`, "You can't delete a dimension from your world once you add it"); Test World to play without saving changes [ED]. Export from **File > Export**: "Playable World" makes a `.mcworld` in `com.mojang/projectbackups` [ED Workflow]; since 26.30 the export types include **World Template** (`.mctemplate`) and **Shareable World** (`.mcworld`) "with all Editor settings and metadata removed" [26.30]. Exporting to `.mcworld` drops Editor extensions (Learn: Minecraft File Extensions).

## 5. Game logic in scripts

Scripts run on the host, and "your code can't assume there's just a single player in the world. Likewise, your code can't assume there are _any_ players in the world, especially during startup" [MP].

Patterns that fit maps and minigames (all **Stable** `@minecraft/server` 2.x):

| Need | Pattern | Where |
|---|---|---|
| First-time setup of the world | In `world.afterEvents.worldLoad`, check a world dynamic property such as `ns:setup_done`; if missing, create scoreboard objectives, ticking areas and structures, then set it | `../../bedrock-scripting/references/code-patterns.md` sections 1, 5 |
| Lobby | Players spawn in the lobby (world spawn). `playerSpawn` with `initialSpawn` gives each joiner the lobby kit and state; a button, item or custom command starts the round | [MP]; `bedrock-scripting` |
| Start a round | Read the players in the lobby area (bounded `getPlayers` / `getEntities` with `location` + `maxDistance`), save each one's state, teleport them with `player.teleport`, start one `system.runInterval` timer | `bedrock-addon-conventions` section 4 |
| Per-player state | `Map` keyed by `player.id` for the session; `player.setDynamicProperty("ns:score", n)` for what must survive a restart; delete map entries on `playerLeave` (only `playerId` and `playerName` are available there) | [MP]; `../../bedrock-shipping/references/multiplayer-and-servers.md` |
| Late joiners | On `initialSpawn` during a round, send them to the lobby or to spectate; never assume they saw the start | [MP] |
| Scores | Scoreboard objectives (`world.scoreboard` or `/scoreboard`); sidebar via `setObjectiveAtDisplaySlot`; fake players such as `#red` for world flags [INGAME] | `../../bedrock-ui/references/hud-and-text.md` |
| Reset | Reload the arena from a saved structure (`structureManager.place` / `/structure load`) inside a ticking area, clear dropped items in the arena bounds only, reset scores, clear the round's dynamic properties, return players to the lobby | `../../bedrock-world-content/references/functions-and-commands.md` |
| End | Stop the interval (`system.clearRun`), restore HUD, camera and input permissions, then reset | `../../bedrock-ui/SKILL.md` rule 8 |

Never run an unbounded `getEntities()` plus `kill()`: it wipes the dimension (house rules).

## 6. Functions and tick.json

- `.mcfunction` files in `BP/functions/`, one command per line, no leading `/`. `functions/tick.json` lists functions to run every game tick (20 per second): `{ "values": ["ns/tick"] }` [TJ].
- "Unlike repeating command blocks, `tick.json` will execute commands before the world has fully loaded in" and "`tick.json` files are additive" across behavior packs [TJ].
- Command blocks placed in the map also work; the Creator Tools world scan flags world-wide commands such as `weather`, `time` or `gamerule` in command blocks and functions (`WORLDDATA112`) and old syntax (`WORLDDATA212`).
- Syntax, scheduling (`/schedule on_area_loaded` to build when chunks load) and game rules: `../../bedrock-world-content/references/functions-and-commands.md`.

## 7. Test in multiplayer

Follow the test ladder in `../../bedrock-shipping/references/multiplayer-and-servers.md`: two players on LAN or a Bedrock Dedicated Server, then Realms if you target it. For a map, also check:
- Two players start, finish and reset a round; a third joins mid-round; one leaves mid-round.
- Timers and loops cope with zero players, for example on a dedicated server after everyone leaves ("your code can't assume there are _any_ players in the world" [MP]).
- Learn's parkour test list: clear path, every jump possible, enough food, checkpoints, falling off the map, all jumps working "before decorating" [PARK].
- Create a fresh world from the packed `.mctemplate` and play it end to end. That is the copy players get.
