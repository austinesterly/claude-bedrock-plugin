# Functions, tick.json, world commands and game rules

Command syntax below comes from the 1.26.50 `mojang-commands.json` metadata. Full command list: `../../bedrock-json-reference/references/commands.md`. Working files: `../templates/tick-function/`.

## .mcfunction files

- BP folder `functions/`. `functions/ns/setup.mcfunction` runs as `/function ns/setup`.
- One command per line, **no leading `/`**. Lines starting with `#` are comments. Blank lines are fine.
- A function runs all its lines in the same tick. One `/function` call (including nested calls) may run at most 10,000 commands (game rule `functioncommandlimit`).
- Functions run as and at whoever called them: `execute as @a at @s run function ns/x` gives `@s` and `~ ~ ~` per player.
- Reload after editing with `/reload` (BP changes) instead of restarting the world.

## tick.json

`functions/tick.json` lists functions to run every tick (20 per second):
```json
{ "values": [ "ns/tick" ] }
```
- Names without `.mcfunction`. Every pack's `tick.json` is merged, so namespace your function paths.
- Tick functions start before the world (and players) have fully loaded; code that needs a player must select one and do nothing when there is none.
- Keep tick functions tiny. Filter with tags/scores and hand real work to other functions, or use `/schedule` or script `system.runInterval`.

Template pair (`../templates/tick-function/BP/functions/ns/`):
```
# tick.mcfunction
execute as @a[tag=!ns_init] at @s run function ns/setup
```
```
# setup.mcfunction
scoreboard objectives add ns_coins dummy Coins
scoreboard players add @s ns_coins 0
tellraw @s {"rawtext":[{"translate":"ns.welcome"}]}
playsound ns.ui.chime @s
tag @s add ns_init
```
`scoreboard objectives add` fails harmlessly if the objective exists. The tag makes setup run once per player.

## Scheduling

```
schedule delay add ns/spawn_wave 30s
schedule delay add ns/spawn_wave 600t replace
schedule delay add ns/day_two 1d append
schedule delay clear ns/spawn_wave
schedule clear ns/spawn_wave
schedule on_area_loaded add 0 0 0 31 0 31 ns/build_arena
schedule on_area_loaded add circle 0 64 0 2 ns/build_arena
schedule on_area_loaded add tickingarea ns_arena ns/build_arena
schedule on_area_loaded clear tickingarea ns_arena
schedule on_area_loaded clear function ns/build_arena
```
- Time: plain int (ticks) or suffix `t`, `s`, `d` (days). Mode `replace` (default) or `append`.
- `on_area_loaded` runs once when the area's chunks are loaded, which makes it the safe way to build or place things at world start.

## Ticking areas

```
tickingarea add 0 0 0 31 255 31 ns_arena true
tickingarea add circle 0 64 0 4 ns_hub
tickingarea preload ns_arena true
tickingarea remove ns_arena
tickingarea list all-dimensions
```
The last bool on `add` is `preload` (load before the world finishes loading). Ticking areas keep chunks running without players; there is a per-world limit, so remove ones you don't need.

## Structures and features from commands

```
structure save ns:arena 0 64 0 31 80 31 true disk
structure load ns:arena 100 64 100 90_degrees none true true
structure load ns:arena 100 64 100 0_degrees x block_by_block 2
structure delete ns:arena
place feature ns:ruby_ore_feature ~ ~ ~
place featurerule ns:ruby_ore_feature_rule ~ ~ ~
place structure ns:ruins ~ ~ ~
place jigsaw ns:ruins/start ns:start 7 ~ ~ ~
```
- `structure save`: `includeEntities` bool, then `disk` (saved into the world) or `memory`. A saved `.mcstructure` can be exported with a structure block and shipped in BP `structures/` (see `worldgen.md`).
- `structure load`: rotation `0_degrees|90_degrees|180_degrees|270_degrees`, mirror `none|x|z|xz`, optional animation `block_by_block|layer_by_layer` + seconds, then `includeEntities`, `includeBlocks`, `waterlogged`, `integrity` (0-100), `seed`.
- `place structure` takes a jigsaw structure id; `place jigsaw <pool> <jigsawTarget> <maxDepth>`. Both accept `[keepJigsaws] [includeEntities] [apply_waterlogging|ignore_waterlogging]`.
- `place feature` / `place featurerule` are the fastest way to test worldgen files.

## Other world-content commands

| Command | Syntax |
|---|---|
| Fog | `fog @a push ns:haze ns_storm` / `fog @a pop ns_storm` / `fog @a remove ns_storm` |
| Music | `music play music.ns.theme 1 2 loop`, `music queue <track> [volume] [fadeSeconds] [play_once/loop]`, `music stop 3`, `music volume 0.5` |
| Sound | `playsound <sound> [player] [x y z] [volume] [pitch] [minimumVolume]`, `stopsound @a [sound]` |
| Particle | `particle ns:sparkle ~ ~1 ~` (no error for an unknown id; particles are client-side) |
| Loot | see `loot-and-trades.md` |
| Recipe | `recipe give @p <recipe>` / `recipe take` (vanilla unlockable recipes) |
| Locate | `locate structure <id> [useNewChunksOnly]`, `locate biome <id>` |
| Camera | `camera @s set ns:overhead ...`, `camera @s fade time 0.5 1 0.5 color 0 0 0`, `camera @s clear` (see `camera-fog-text.md`) |
| Script hook | `scriptevent ns:open_shop {"tier":2}` fires `system.afterEvents.scriptEventReceive` |

## Game rules

`gamerule <rule> [value]`; with no value it prints the current value.

| Bool rules (1.26.50) | |
|---|---|
| World | `dodaylightcycle`, `doweathercycle`, `dofiretick`, `domobspawning`, `doinsomnia`, `tntexplodes`, `tntexplosiondropdecay`, `respawnblocksexplode`, `mobgriefing`, `projectilescanbreakblocks` |
| Drops | `doentitydrops`, `domobloot`, `dotiledrops`, `keepinventory` |
| Damage | `drowningdamage`, `falldamage`, `firedamage`, `freezedamage`, `pvp`, `naturalregeneration`, `doimmediaterespawn` |
| Crafting | `recipesunlock`, `dolimitedcrafting`, `showrecipemessages` |
| UI | `showcoordinates`, `showdaysplayed`, `showdeathmessages`, `showtags`, `showbordereffect` |
| Commands | `commandblockoutput`, `commandblocksenabled`, `sendcommandfeedback` |

Int rules: `maxcommandchainlength`, `randomtickspeed`, `functioncommandlimit`, `spawnradius`, `playerssleepingpercentage`.
Enum rule: `playerwaypoints` `everyone|off` (replaced `locatorbar` in 1.26.30).

Script: `world.gameRules.doDayLightCycle = false;`, `world.gameRules.keepInventory`, `world.gameRules.randomTickSpeed` (camelCase properties). See `bedrock-scripting`.

## Common mistakes

- Leading `/` inside `.mcfunction` lines: the line fails.
- `tick.json` value with `.mcfunction` or a path starting with `functions/`.
- Heavy commands every tick (`execute as @e ... run particle`): lag. Throttle with a scoreboard timer or `/schedule`.
- Building at world start without `schedule on_area_loaded` or a ticking area: the chunks aren't loaded and commands do nothing.
- Function errors only show in the content log; turn on content log in settings when testing.
