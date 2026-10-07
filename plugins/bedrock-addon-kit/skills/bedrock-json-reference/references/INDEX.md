# JSON reference index

Generated 2026-10-06.

| File | Covers | Size |
|---|---|---|
| [items.md](items.md) | Item components | 51 components, 31 sub-objects |
| [blocks.md](blocks.md) | Block components | 37 components, 55 sub-objects |
| [entity-components.md](entity-components.md) | Entity components (non-AI) | 210 components, 78 sub-objects |
| [entity-ai-goals.md](entity-ai-goals.md) | Entity AI goals (minecraft:behavior.*) | 194 components, 0 sub-objects |
| [entity-filters-and-events.md](entity-filters-and-events.md) | Entity filters, events and actions | 0 components, 145 sub-objects |
| [worldgen.md](worldgen.md) | Features, biomes, jigsaw, structures, dimensions | 70 components, 143 sub-objects |
| [recipes-spawn-trade.md](recipes-spawn-trade.md) | Recipes, spawn rules, trades | 0 components, 41 sub-objects |
| [client-visuals.md](client-visuals.md) | Particles, cameras, visuals, resource files | 12 components, 99 sub-objects |
| [manifest.md](manifest.md) | Pack manifest | 0 components, 15 sub-objects |
| [molang.md](molang.md) | Molang queries and functions | 0 components, 380 sub-objects |
| [commands.md](commands.md) | Commands | 0 components, 139 sub-objects |
| [json-ui.md](json-ui.md) | JSON UI elements | 0 components, 4 sub-objects |
| [misc.md](misc.md) | Shared sub-objects | 64 components, 104 sub-objects |

## Marked experimental in the official definitions

These need an experiment toggle in world settings (usually Upcoming Creator Features). The definitions lag the changelogs, so also check `bedrock-whats-new/references/experimental-changelog.md`.

| Component | Field | Toggle or note | File |
|---|---|---|---|
| `components v1.21.80` | `minecraft:bundle_interaction` | [EXPERIMENTAL] Adds bundle-specific interactions and tooltip to the item. Requires a "minecraft:storage_item" component. | items.md |
| `components v1.21.80` | `minecraft:storage_item` | [EXPERIMENTAL] Storage Items can be used by other components to store other items within this item. | items.md |
| `Detailed Geometry` | `culling_shape` | Currently only available with the VoxelShape experiment on. The voxel shape used for culling adjacent block faces. Voxel shapes work togeth… | blocks.md |
| `minecraft:destructible_by_mining` | `item_specific_speeds` | Optional array of objects to describe item specific block destroy speeds, each object contains an 'item' ItemDescriptor and a 'destroy_spee… | blocks.md |
| `minecraft:geometry` | `culling_layer` | [Experimental] - A string that allows culling rule to group multiple blocks together when comparing them. When using the minecraft namespac… | blocks.md |
| `minecraft:instrument_sound` | (whole component) | Upcoming Creator Features | blocks.md |
| `Multi Block` | (whole component) | Upcoming Creator Features | blocks.md |
| `minecraft:reflect_projectiles` | (whole component) | experimental | entity-components.md |
| `minecraft:reflect_projectiles` | `azimuth_angle` | [EXPERIMENTAL] A Molang expression defining the angle in degrees to add to the projectile's y axis rotation. | entity-components.md |
| `minecraft:reflect_projectiles` | `elevation_angle` | [EXPERIMENTAL] A Molang expression defining the angle in degrees to add to the projectile's x axis rotation. | entity-components.md |
| `minecraft:reflect_projectiles` | `reflected_projectiles` | [EXPERIMENTAL] An array of strings defining the types of projectiles that are reflected when they hit the entity. | entity-components.md |
| `minecraft:reflect_projectiles` | `reflection_scale` | [EXPERIMENTAL] A Molang expression defining the velocity scaling of the reflected projectile. Values below 1 decrease the projectile's velo… | entity-components.md |
| `minecraft:reflect_projectiles` | `reflection_sound` | [EXPERIMENTAL] A string defining the name of the sound event to be played when a projectile is reflected. "reflect" unless specified. | entity-components.md |
| `cmd_gametest` | (whole component) | experimental | commands.md |
| `minecraft:bundle_interaction` | (whole component) | experimental | misc.md |
| `minecraft:storage_item` | (whole component) | experimental | misc.md |
