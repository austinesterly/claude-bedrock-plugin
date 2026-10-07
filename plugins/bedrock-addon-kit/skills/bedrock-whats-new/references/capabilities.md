# What creators can do (as of 26.52 stable, 26.60 in Preview)

Curated 2026-10-06. "Stable" = works in a world with no experiments. Check `api-surface.md` for exact Script API names.

## Works with no experiments

| Area | What you can do | How |
|---|---|---|
| Custom mobs | Any model, texture, animation, AI goal set, properties, events | BP entity + RP client entity; `bedrock-entity-behavior`, `bedrock-blockbench` |
| Custom items | Tools, food, wearables, throwables, custom use/hit/mine behaviour | Item JSON + V2 custom components |
| Custom blocks | Shapes up to ~50 cubes, states, permutations, rotation (incl. n-way / 16-way), multi-blocks (vertical and horizontal at 1.26.50), block entities with dynamic properties, per-permutation sounds | Block JSON + block custom components |
| Projectiles | Fully custom projectiles with own physics | `minecraft:projectile`, no `runtime_identifier` |
| Commands | Real namespaced slash commands with typed parameters and enums | `customCommandRegistry` |
| UI | Action/Message/Modal forms; live Data-Driven UI (`CustomForm` with observables, `MessageBox`); images in forms; tooltips and button icons from 26.60 | `@minecraft/server-ui` |
| HUD | Action bar, titles, floating text primitives, camera presets, camera shake, fog per player | `onScreenDisplay`, `primitiveShapesManager`, `camera`, `fogSettings` |
| World | Custom dimensions (script or JSON, custom heights, default biome), custom biomes (`replace_biomes` in the Overworld and Nether, or a dimension's default biome), ticking areas, clone/fill blocks, structures | `dimensionRegistry`, `tickingAreaManager`, `cloneBlocks`, `fillBlocks`, structureManager |
| Saving | World, entity, item (non-stackable) and block dynamic properties; entity properties for render state | `setDynamicProperty`, `minecraft:properties` |
| Sound | Custom .ogg sounds, tracked sound instances, completion events; volume/pitch/fade/seek/pause and looping from 26.60 | `sound_definitions.json`, `SoundInstance` |
| Time | Custom world clocks and time markers from 26.60 | `worldClockRegistry` |
| Events | Hurt (cancellable), heal, tame, sneak, pickup/drop, interact, break/place, containers, projectiles, etc. | `world.beforeEvents` / `afterEvents` |
| Settings | Pack settings (toggle, slider, multiselect) players change in the pack menu | Manifest `settings`, `world.getPackSettings()` |
| Physics | Bounciness, air drag, pushability presets, friction | Entity physics components |

## Needs an experiment (avoid in shipped content)

| Feature | Toggle | Status |
|---|---|---|
| `world.beforeEvents.chatSend` (chat parsing) | Beta APIs | Beta only. Use slash commands |
| Block containers (`block_entity.container`, up to 54 slots) and `entity_storage` | Upcoming Creator Features | Experimental in 26.50/26.60 |
| Points of interest, `/locate poi` | Upcoming Creator Features | Experimental |
| `collision_box` min/max form | Upcoming Creator Features | Experimental in 26.60 |
| Debugger live diagnostics API, `server-admin`, `server-net`, `server-gametest` | Beta APIs | Beta / dedicated server only |
| Biome `environment_attributes` | Beta biome schema only | Experimental (custom biomes themselves are stable via `minecraft:replace_biomes` and dimension `minecraft:default_biome`; see `bedrock-dimensions-biomes`) |
| Some Vibrant Visuals / RenderDragon creator features | RenderDragon Features for Creators | Experimental |

## Not possible (and the workaround)

| Want | Workaround |
|---|---|
| Script tells a mob "walk to X" | JSON goals: `minecraft:home` + `move_towards_home_restriction`, `behavior.move_to_*`, tempt, follow; switch with events |
| Client-side scripting | None planned. Everything runs on the server; render state goes through entity properties and Molang |
| Change one item stack's icon | Swap to a different item type |
| Fully custom screens beyond forms | DDUI forms; JSON UI only as optional restyle (Marketplace rules and Ore UI migration) |
| Change the rider's pose | `rotate_rider_by`, lower seat, or hide the rider and draw a posed stand-in |
| Set an entity's home position from script (2.10.0) | Spawn the mob where its home should be |
| Override vanilla mobs safely alongside other add-ons | Copy the mob under your namespace |
