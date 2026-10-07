# Custom dimensions

Checked 2026-10-06 against: `@minecraft/server` 2.10.0 typings, the 26.20, 26.30, 26.40, 26.50 changelogs and the 26.60.21 to 26.60.30 Preview changelogs (feedback.minecraft.net), Microsoft Learn (custom-dimension-api-tutorial.md, Update1.26.20/30.md, DimensionReference forms), Mojang bedrock-samples 1.26.50.4 schemas (`metadata/json_schemas/client_server/dimension/1.26.50`) and the Preview 1.26.60.29 copy of the same schemas.

## Labels used here

| Label | Meaning |
|---|---|
| **Stable** | Works with no experiment in game 26.52 with `@minecraft/server` 2.10.0 |
| **Next stable** | In 26.60 Preview / `@minecraft/server` 2.11.0-rc; ships when 26.60 releases |
| **Beta API** | Needs the Beta APIs experiment and a `-beta` script module |
| **Experimental** | Needs an experiment toggle (named when the source names it) |
| unverified | The sources don't settle it; test in game |

## History

| Version | What changed | Source |
|---|---|---|
| 26.20 | `DimensionRegistry.registerCustomDimension` added **in beta**, called from the startup event | 26.20 changelog: "Added method registerCustomDimension to allow registrations of new custom dimensions in beta." |
| 26.30 | Released to **stable** in `@minecraft/server` **2.8.0**: `DimensionRegistry`, `StartupEvent.dimensionRegistry`, the four `CustomDimension*Error` classes | 26.30 changelog: "Released DimensionRegistry from beta to v2.8.0" |
| 26.30 | Crash fix for packs with several custom dimension definitions; "Custom Dimension height range to match Overworld defaults" (Experimental section) | 26.30 changelog |
| 26.40 | Custom dimension fog color follows time-of-day brightness | 26.40 changelog |
| 26.50 | **JSON dimension files** with custom heights and `minecraft:default_biome` (Technical Updates, not experimental). `DimensionTypes.get/getAll` return custom dimensions. `Entity.teleport` throws across dimensions while the entity has passengers. Tamed pets no longer follow owners into or out of custom dimensions | 26.50 changelog |
| 26.60 Preview | `minecraft:clouds` component (26.60.21, listed under Experimental Technical Updates). Cloud height accepts -512 to 512 and the spurious format_version warning is gone (26.60.28, non-experimental section). Dedicated server properties for persistent and transient ticking area limits (26.60.28) | 26.60.21 and 26.60.28 changelogs |

The Microsoft Learn tutorial `scripting/custom-dimension-api-tutorial.md` (dated 2026-04-10) and the Creator Tools sample `custom_dimensions` still say "Beta APIs" and use `"version": "beta"`. That reflects 26.20. See Migration below.

## Two ways to create a dimension

| | Script registration | JSON file |
|---|---|---|
| Label | **Stable** since 26.30 (2.8.0) | **Stable** since 26.50 |
| Where | `system.beforeEvents.startup` → `event.dimensionRegistry.registerCustomDimension("ns:id")` | `BP/dimensions/<name>.json` |
| Generator | Void (the typings: "The dimension will be created using the void generator") | Void only (Preview schema: "Only allows void generator") |
| Heights | Default. 26.30 matched them to Overworld defaults (-64, 384 tall) | `minecraft:dimension_height` |
| Default biome | Not settable from script. The JSON default is `minecraft:ocean`; whether a script dimension uses the same is unverified | `minecraft:default_biome` |
| Clouds | Not settable | `minecraft:clouds` (26.60 Preview) |

Use one way per identifier. Whether defining the same id in JSON and in script throws `CustomDimensionAlreadyRegisteredError` is unverified, so don't do it.

## JSON dimension file

Folder: `BP/dimensions/` (the folder the Learn page DataDrivenOverworldHeight.md uses; Creator Tools reports these files as "Dimension" items). Strict JSON. Root keys from the 1.26.50 `Dimensions.json` schema.

```json
{
  "format_version": "1.26.50",
  "minecraft:dimension": {
    "description": { "identifier": "ns:skylands" },
    "components": {
      "minecraft:dimension_height": { "min_y": 0, "height_range": 256 },
      "minecraft:default_biome": { "biome": "ns:skylands" },
      "minecraft:generation": { "generator_type": "void" }
    }
  }
}
```

| Path | Type | Rules | Label |
|---|---|---|---|
| `format_version` | string | `"1.26.50"` (schema version) | Stable |
| `minecraft:dimension.description.identifier` | string | **required**. Namespaced, `ns:name` | Stable |
| `minecraft:dimension.components` | object | **required** | Stable |
| `components.minecraft:generation.generator_type` | string | **required** (the only required component). `"void"` is the only allowed value | Stable |
| `components.minecraft:dimension_height.min_y` | int | **required** in the component. -512 to 512. Default -64 when the component is omitted | Stable |
| `components.minecraft:dimension_height.height_range` | int | **required** in the component. 16 to 1024, multiple of 16. Default 384 | Stable |
| `components.minecraft:default_biome.biome` | string | **required** in the component. Namespaced biome id used everywhere in the dimension. Default `minecraft:ocean`. Only allowed on custom dimensions (a content error on vanilla ones since 26.50) | Stable |
| `components.minecraft:clouds.height` | int | **required** in the component. Y where clouds render, -512 to 512 | 26.60 Preview. Added under Experimental Technical Updates with no toggle named; the 26.60.28 fix is in a non-experimental section. Treat as **Next stable, unverified**. Not in the 26.52 schema, so leave it out of packs for 26.52 |

Notes:
- Keep the whole range inside -512..512 (26.50 fixed a cap that limited JSON heights to -64..320; that line sits in the Experimental Gameplay section of the 26.50 changelog). The schema doesn't say `min_y` must be a multiple of 16; the older `minecraft:dimension_bounds` format required it, so use multiples of 16 (unverified whether it matters now).
- Clouds without the component: the 26.60.21 changelog says "No component means clouds do not render"; the Preview schema text says "Defaults to 128 if this component is omitted". These disagree; check in game.
- The Learn pages under `Reference/Content/DimensionReference` (AI-assisted) also show `minecraft:dimension_type`, `minecraft:bounds` and a boolean `identifier`. Those shapes are not in Mojang's schemas. Follow the schema shape above.

### Older vanilla-dimension override (not a custom dimension)

DataDrivenOverworldHeight.md describes `BP/dimensions/overworld.json` with `"identifier": "minecraft:overworld"`, `minecraft:dimension_bounds` (`min`, `max`, multiples of 16 within -512..512) and `minecraft:generation` `generator_type: "void"`, to slice an Overworld and make new chunks void. The Nether and End accept only the void generator there. Schema: `dimension/1.21.60` (`Bounds.json`). This changes vanilla dimensions, not custom ones. Current status unverified (the doc names no experiment, and no 26.x changelog mentions it).

## Script API (all Stable in 2.10.0 unless marked)

| API | Notes |
|---|---|
| `system.beforeEvents.startup.subscribe(e => e.dimensionRegistry.registerCustomDimension(id))` | Early execution. Registration only works during startup (`CustomDimensionInvalidRegistryError` otherwise) |
| `CustomDimensionNameError`, `NamespaceNameError` | Bad characters or a missing/forbidden namespace |
| `CustomDimensionAlreadyRegisteredError` | Same id registered twice |
| `CustomDimensionReloadNewDimensionError` | `/reload` can't add a dimension that wasn't registered when the world started; restart the world |
| `world.getDimension("ns:id")` | Works after startup. Throws for an unknown id |
| `DimensionTypes.get(id)`, `DimensionTypes.getAll()` | Include custom dimensions after startup has completed (2.10.0) |
| `Dimension.id`, `heightRange`, `localizationKey` | `heightRange` reflects JSON heights |
| `Entity.teleport(location, { dimension })`, `tryTeleport` | No restricted execution: call from `system.run` in command, item and before-event callbacks. Throws across dimensions while the entity has passengers (dismount first). `TeleportOptions`: `dimension`, `facingLocation`, `rotation`, `keepVelocity`, `checkForBlocks`, `forceProvidedPositionOnDimensionChange` (undocumented in the typings) |
| `world.afterEvents.playerDimensionChange` | `player`, `fromDimension`, `fromLocation`, `toDimension`, `toLocation` |
| `Player.setSpawnPoint({ dimension, x, y, z })`, `getSpawnPoint()` | Takes a `DimensionLocation`. Respawning into a custom dimension is unverified; 26.30 fixed rejoining after a saved custom dimension became inactive |
| `Dimension.fillBlocks`, `cloneBlocks`, `getBlock`, `getBlocks`, `setBlockType`, `getTopmostBlock`, `isChunkLoaded` | Build terrain yourself; chunks must be loaded |
| `Dimension.placeFeature(id, location, shouldThrow?)`, `placeFeatureRule(id, location)` | Place JSON features into a loaded chunk of any dimension |
| `world.structureManager.place(structure, dimension, location)` | Paste `.mcstructure` builds (the Creator Tools custom_dimensions sample does this) |
| `Dimension.getBiome`, `containsBiomes`, `calculateClosestBiomeFromSeed` | See biomes.md |
| `Dimension.getGeneratedStructures`, `getWeather`, `poiManager` | **Beta API** (2.12.0-beta) |

### Ticking areas (load chunks nobody stands in)

`world.tickingAreaManager` is **Stable** (released in 26.10; beta in 1.21.130). A custom dimension has no players in it until someone arrives, so its chunks are unloaded. Create a ticking area, `await` it, then build or teleport.

| Member | Notes |
|---|---|
| `createTickingArea(id, { dimension, from, to })` | `Promise<void>`; resolves when every chunk is loaded and ticking (returned `TickingArea` before 26.10) |
| `hasCapacity(options)`, `chunkCount`, `maxChunkCount` | Limit is per pack and separate from `/tickingarea`. Overlapping chunks count. A side can't exceed 255 chunks |
| `getTickingArea(id)`, `getAllTickingAreas()`, `hasTickingArea(id)` | Only areas this pack made. `TickingArea`: `identifier`, `dimension`, `boundingBox`, `chunkCount`, `isFullyLoaded` |
| `removeTickingArea(id)`, `removeAllTickingAreas()` | Remove temporary areas after you teleport |
| `TickingAreaError.reason` | `IdentifierAlreadyExists`, `OverChunkLimit`, `SideLengthExceeded`, `UnknownIdentifier` |

The `/tickingarea add|remove|list|preload` command allows up to 10 areas per world (TickingAreaCommand.md); `preload` makes an area load before the world starts. Dedicated servers get properties for persistent and transient ticking area limits in 26.60 (**Next stable**).

### Teleport pattern

```js
const dim = world.getDimension("ns:void");
await world.tickingAreaManager.createTickingArea("ns_arrive", {
  dimension: dim, from: { x: -8, y: 60, z: -8 }, to: { x: 8, y: 70, z: 8 },
});
dim.fillBlocks(new BlockVolume({ x: -3, y: 64, z: -3 }, { x: 3, y: 64, z: 3 }), "minecraft:obsidian");
player.teleport({ x: 0.5, y: 65, z: 0.5 }, { dimension: dim });
world.tickingAreaManager.removeTickingArea("ns_arrive");
```

Run it from `system.run(...)` when it starts in a command, item or before-event callback. The full version, with a return trip and a build-once flag, is `templates/skylands-dimension/BP/scripts/ns_dimensions.js`.

## Persistence and identity

- Chunks you build are saved with the world. Mojang Creator Tools reads custom dimension chunks from LevelDB under numeric dimension ids from 1000 up, mapped by name in a `DimensionNameIdTable` key. So the **identifier is the save key**: renaming `ns:void` gives you a new, empty dimension.
- Removing the pack: 26.30 fixed the player's spawn position when "their previously saved custom dimension becomes inactive". What happens to the stored chunks is unverified; they are presumably kept and come back when the pack returns.
- Track one-time setup with a world dynamic property (`world.setDynamicProperty("ns:built", true)`), not a script variable.

## Limits and gotchas

| Topic | Fact | Label |
|---|---|---|
| Terrain | Void only. No noise, caves or vanilla terrain. Build with script, structures and features | Stable |
| Vanilla portals | No source documents linking Nether/End portals to custom dimensions. Use script travel | unverified |
| `/execute in`, `/tp` into a custom dimension | The commands reference only shows the vanilla dimension enum | unverified |
| Natural mob spawning | No source confirms spawn rules run in custom dimensions | unverified |
| Weather, day cycle | Fog color follows time of day (26.40), so the day cycle exists; weather unverified | Stable / unverified |
| Pets | Don't follow their owner into or out of custom dimensions (26.50) | Stable |
| `minecraft:dimension_bound` entity component | Stops an entity changing dimension through portals | Stable |
| Riders | `teleport` throws across dimensions while the entity has passengers | Stable (26.50) |
| Editor | Custom Dimensions tool (travel between dimensions) and Biome Data Assignment tool, 26.30+ Editor | Stable (Editor only) |

## Migration from the beta API (26.20 era add-ons)

1. Manifest: change `{"module_name": "@minecraft/server", "version": "beta"}` (or `2.x.0-beta`) to `"2.10.0"` (anything from `2.8.0`). Keep `min_engine_version` at 1.26.30 or newer (1.26.50 for JSON dimensions).
2. The world no longer needs Beta APIs. Experiments can't be turned off on an existing world; create a new world for a clean release, or keep testing in the old one.
3. `registerCustomDimension` keeps its name and stays in `system.beforeEvents.startup`. No code change.
4. Code that used the `TickingArea` returned by `createTickingArea` must `await` it and call `getTickingArea(id)` (return type is `Promise<void>` since 26.10).
5. `Dimension.findClosestBiome` became `calculateClosestBiomeFromSeed` (2.9.0).
6. To give a script-registered dimension custom heights or a biome, move it to a JSON file and delete the script registration for that id.
7. Dismount riders before cross-dimension teleports (26.50 throws).
8. Don't put `minecraft:default_biome` on a vanilla dimension file (content error since 26.50). Vanilla height overrides use `minecraft:dimension_bounds`; custom dimensions use `minecraft:dimension_height`.
