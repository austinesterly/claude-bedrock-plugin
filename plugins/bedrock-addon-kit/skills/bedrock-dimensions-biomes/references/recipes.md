# Recipes

Four worked builds. All are **Stable** (game 26.52, `@minecraft/server` 2.10.0, no experiments). Namespace `ns`; the generator renames it. Script snippets go in a module imported from `BP/scripts/main.js` and were type-checked against the 2.10.0 typings.

## 1. Void / skyblock dimension (script only)

Use when you need an empty space: lobby, arena, skyblock. One registration line, no JSON.

```js
import { system, world, BlockVolume, ItemStack } from "@minecraft/server";

const SKYBLOCK = "ns:skyblock";

system.beforeEvents.startup.subscribe((e) => {
  e.dimensionRegistry.registerCustomDimension(SKYBLOCK); // void generator, default heights
});

// Build the starter island once per world, the first time someone goes there.
export async function sendToSkyblock(player) {
  const dim = world.getDimension(SKYBLOCK);
  await world.tickingAreaManager.createTickingArea("ns_skyblock", {
    dimension: dim, from: { x: -8, y: 56, z: -8 }, to: { x: 8, y: 72, z: 8 },
  });
  if (world.getDynamicProperty("ns:skyblock_built") !== true) {
    dim.fillBlocks(new BlockVolume({ x: -2, y: 60, z: -2 }, { x: 2, y: 62, z: 2 }), "minecraft:dirt");
    dim.fillBlocks(new BlockVolume({ x: -2, y: 63, z: -2 }, { x: 2, y: 63, z: 2 }), "minecraft:grass_block");
    dim.setBlockType({ x: 0, y: 59, z: 0 }, "minecraft:bedrock");
    dim.setBlockType({ x: 2, y: 64, z: 2 }, "minecraft:chest");
    world.setDynamicProperty("ns:skyblock_built", true);
  }
  player.teleport({ x: 0.5, y: 64, z: 0.5 }, { dimension: dim });
  world.tickingAreaManager.removeTickingArea("ns_skyblock");
  player.getComponent("minecraft:inventory")?.container?.addItem(new ItemStack("minecraft:oak_sapling", 2));
}
```

Call `system.run(() => sendToSkyblock(player))` from a command, item or block callback. To make the island per player, offset the island by a player index stored in a world dynamic property (keep islands at least a few chunks apart).

## 2. Flat themed dimension with its own biome

JSON dimension (heights + default biome), a server biome, a client biome with sky/fog/water colors, and a script that lays flat ground chunk by chunk as players walk.

`BP/dimensions/meadowlands.json`:
```json
{
  "format_version": "1.26.50",
  "minecraft:dimension": {
    "description": { "identifier": "ns:meadowlands" },
    "components": {
      "minecraft:dimension_height": { "min_y": -16, "height_range": 128 },
      "minecraft:default_biome": { "biome": "ns:meadowlands" },
      "minecraft:generation": { "generator_type": "void" }
    }
  }
}
```

`BP/biomes/meadowlands.biome.json` and `RP/biomes/meadowlands.client_biome.json`: copy `templates/skylands-dimension/BP/biomes/skylands.biome.json` and `RP/biomes/skylands.client_biome.json`, change the identifier to `ns:meadowlands` and the colors. A client biome only needs the components you change.

Flat ground generator (one 16x16 column per chunk: bedrock, 3 dirt, grass):

```js
import { system, world, BlockVolume } from "@minecraft/server";

const FLAT = "ns:meadowlands";
const FLOOR_Y = 0; // top layer Y
const RADIUS = 2;   // chunks around each player

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    const dim = player.dimension;
    if (dim.id !== FLAT) continue;
    const pcx = Math.floor(player.location.x / 16), pcz = Math.floor(player.location.z / 16);
    for (let cx = pcx - RADIUS; cx <= pcx + RADIUS; cx++) {
      for (let cz = pcz - RADIUS; cz <= pcz + RADIUS; cz++) {
        const corner = { x: cx * 16, y: FLOOR_Y - 4, z: cz * 16 };
        if (!dim.isChunkLoaded(corner)) continue;
        const marker = dim.getBlock(corner);
        if (!marker || !marker.isAir) continue; // already generated
        const x0 = cx * 16, z0 = cz * 16, x1 = x0 + 15, z1 = z0 + 15;
        dim.fillBlocks(new BlockVolume({ x: x0, y: FLOOR_Y - 4, z: z0 }, { x: x1, y: FLOOR_Y - 4, z: z1 }), "minecraft:bedrock");
        dim.fillBlocks(new BlockVolume({ x: x0, y: FLOOR_Y - 3, z: z0 }, { x: x1, y: FLOOR_Y - 1, z: z1 }), "minecraft:dirt");
        dim.fillBlocks(new BlockVolume({ x: x0, y: FLOOR_Y, z: z0 }, { x: x1, y: FLOOR_Y, z: z1 }), "minecraft:grass_block");
        try { dim.placeFeature("ns:meadow_flower_patch_feature", { x: x0 + 8, y: FLOOR_Y + 1, z: z0 + 8 }); } catch {}
        return; // one chunk per tick keeps the server smooth
      }
    }
  }
}, 2);
```

The bedrock layer doubles as the "already generated" marker. Teleport the first visitor with a ticking area as in `templates/skylands-dimension` (land at `FLOOR_Y + 1` after filling the spawn chunk). `ns:meadow_flower_patch_feature` is a copy of the template's flower patch.

## 3. Portal item, portal block or command

The template `skylands-dimension` has all three entry points wired to one `travel(player, id)` function:

| Entry | JSON | Script |
|---|---|---|
| Item | `"ns:dimension_key": { "target": "ns:skylands" }` in the item's components | `itemComponentRegistry.registerCustomComponent("ns:dimension_key", { onUse(e, { params }) {...} })` |
| Command | none | `customCommandRegistry.registerEnum("ns:destination", [...])` + `registerCommand({ name: "ns:travel", mandatoryParameters: [{ name: "ns:destination", type: CustomCommandParamType.Enum }] ... })` |
| Block (step on) | block below | `blockComponentRegistry.registerCustomComponent("ns:portal_pad", { onStepOn(e, { params }) {...} })` |

Portal pad block (`BP/blocks/portal_pad.json`, format and rules from `bedrock-blocks`):
```json
{
  "format_version": "1.26.50",
  "minecraft:block": {
    "description": { "identifier": "ns:portal_pad", "menu_category": { "category": "construction" } },
    "components": {
      "minecraft:geometry": "minecraft:geometry.full_block",
      "minecraft:material_instances": { "*": { "texture": "ns_portal_pad", "render_method": "opaque" } },
      "minecraft:light_emission": 10,
      "minecraft:destructible_by_mining": { "seconds_to_destroy": 3 },
      "ns:portal_pad": { "target": "ns:skylands" }
    }
  }
}
```

```js
import { system, Player } from "@minecraft/server";

system.beforeEvents.startup.subscribe((e) => {
  e.blockComponentRegistry.registerCustomComponent("ns:portal_pad", {
    onStepOn(event, { params }) {
      const player = event.entity;
      if (!(player instanceof Player)) return;
      const target = String(/** @type {{ target?: string }} */ (params)?.target ?? "ns:skylands");
      system.run(() => travel(player, target)); // travel() from the template module
    },
  });
});
```

Add a cooldown (a player dynamic property with `system.currentTick`) so a player standing on the pad isn't sent back and forth. Riders: `teleport` throws across dimensions while the entity has passengers.

## 4. Overworld custom biome

`templates/overworld-biome`: `ns:glimmer_meadow` replaces part of `plains` and `sunflower_plains`.

```json
"minecraft:replace_biomes": {
  "replacements": [
    { "dimension": "minecraft:overworld", "targets": [ "plains", "sunflower_plains" ], "amount": 0.3, "noise_frequency_scale": 0.5 }
  ]
}
```

Checklist:
1. Surface builder with grass on top, or the biome looks like bare stone.
2. Keep vanilla tags you want (`animal`, `monster`, `overworld`, `bee_habitat`) and add a unique one (`ns_glimmer_meadow`) for your feature and spawn rules.
3. A client biome for colors; reuse a vanilla fog id (`minecraft:fog_plains`) or ship one.
4. Test in a new world or unexplored chunks; `/locate biome ns:glimmer_meadow`.
5. In the Nether use `"dimension": "minecraft:nether"`, targets such as `crimson_forest`, and a surface builder of type `overworld`, `frozen_ocean`, `capped` or `the_end`.
