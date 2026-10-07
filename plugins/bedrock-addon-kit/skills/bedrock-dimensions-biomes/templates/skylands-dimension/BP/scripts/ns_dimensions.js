// Custom dimensions: registration, a /ns:travel command and a travel item.
// Add this line to BP/scripts/main.js:   import "./ns_dimensions.js";
// Needs only stable @minecraft/server (2.8.0 or newer; written against 2.10.0). No experiments.
import {
  system,
  world,
  Player,
  BlockVolume,
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
} from "@minecraft/server";

// ns:void is registered from script below (always the void generator, default heights).
// ns:skylands is defined by BP/dimensions/skylands.json (custom heights + default biome),
// so it is NOT registered here. Never define the same id both ways.
const VOID_ID = "ns:void";
const SKYLANDS_ID = "ns:skylands";
const VANILLA = new Set(["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]);

// Where players land and what gets built there the first time anyone arrives.
const DESTINATIONS = {
  [VOID_ID]: {
    label: "the Void",
    center: { x: 0, y: 64, z: 0 },
    radius: 3,
    floor: "minecraft:crying_obsidian",
  },
  [SKYLANDS_ID]: {
    label: "the Skylands",
    center: { x: 0, y: 100, z: 0 },
    radius: 7,
    floor: "minecraft:grass_block",
    under: "minecraft:dirt",
    feature: "ns:skylands_flower_patch_feature",
  },
};
const DEST_BY_NAME = { void: VOID_ID, skylands: SKYLANDS_ID, home: "home" };

// ---- startup: registries only exist here --------------------------------------------
system.beforeEvents.startup.subscribe((init) => {
  try {
    init.dimensionRegistry.registerCustomDimension(VOID_ID);
  } catch (e) {
    // CustomDimensionNameError, CustomDimensionAlreadyRegisteredError,
    // CustomDimensionReloadNewDimensionError (a new id added before /reload), ...
    console.warn(`[ns] could not register ${VOID_ID}: ${e}`);
  }

  init.customCommandRegistry.registerEnum("ns:destination", Object.keys(DEST_BY_NAME));
  init.customCommandRegistry.registerCommand(
    {
      name: "ns:travel",
      description: "Travel to a custom dimension (void, skylands) or back home",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: true,
      mandatoryParameters: [{ name: "ns:destination", type: CustomCommandParamType.Enum }],
    },
    (origin, destination) => {
      const player = origin.sourceEntity;
      if (!(player instanceof Player)) {
        return { status: CustomCommandStatus.Failure, message: "Run this command as a player." };
      }
      // Command callbacks run in restricted mode: teleport and ticking areas must wait a tick.
      system.run(() => travel(player, DEST_BY_NAME[destination]));
      return { status: CustomCommandStatus.Success };
    },
  );

  // Item custom component (V2): "ns:dimension_key": { "target": "ns:skylands" } in the item JSON.
  init.itemComponentRegistry.registerCustomComponent("ns:dimension_key", {
    onUse(event, { params }) {
      const player = event.source;
      const target = String(/** @type {{ target?: string }} */ (params)?.target ?? SKYLANDS_ID);
      system.run(() => travel(player, player.dimension.id === target ? "home" : target));
    },
  });
});

// ---- world events ---------------------------------------------------------------------
world.afterEvents.playerDimensionChange.subscribe(({ player, toDimension }) => {
  const cfg = DESTINATIONS[toDimension.id];
  if (cfg && player.isValid) player.onScreenDisplay.setActionBar(`Entering ${cfg.label}`);
});

// ---- travel ---------------------------------------------------------------------------
const busy = new Set();

async function travel(player, targetId) {
  if (!player.isValid || busy.has(player.id)) return;
  busy.add(player.id);
  try {
    if (targetId === "home") await goHome(player);
    else await goTo(player, targetId);
  } catch (e) {
    // Entity.teleport throws across dimensions while the entity has passengers (26.50+).
    if (player.isValid) player.sendMessage(`§cTravel failed: ${e}`);
  } finally {
    busy.delete(player.id);
  }
}

function getDimension(id) {
  try {
    return world.getDimension(id);
  } catch {
    return undefined; // not registered: bad JSON, missing script registration, or wrong id
  }
}

async function goTo(player, id) {
  const cfg = DESTINATIONS[id];
  if (!cfg) throw new Error(`unknown destination ${id}`);
  const dim = getDimension(id);
  if (!dim) {
    player.sendMessage(`§c${id} does not exist in this world. Check the content log.`);
    return;
  }
  if (VANILLA.has(player.dimension.id)) rememberReturnPoint(player);

  const c = cfg.center;
  const r = cfg.radius + 2;
  // Chunks in a dimension nobody is in are not loaded: keep them ticking while we build and land.
  await withLoadedArea(
    `ns_arrive_${id.replace(":", "_")}`,
    dim,
    { x: c.x - r, y: c.y - 3, z: c.z - r },
    { x: c.x + r, y: c.y + 4, z: c.z + r },
    () => {
      buildPlatformOnce(dim, id, cfg);
      if (player.isValid) player.teleport({ x: c.x + 0.5, y: c.y + 1, z: c.z + 0.5 }, { dimension: dim });
    },
  );
}

async function goHome(player) {
  const dimId = player.getDynamicProperty("ns:return_dim");
  const pos = player.getDynamicProperty("ns:return_pos");
  if (typeof dimId === "string" && pos && typeof pos === "object") {
    player.teleport(pos, { dimension: getDimension(dimId) ?? world.getDimension("minecraft:overworld") });
    return;
  }
  const spawn = player.getSpawnPoint();
  if (spawn) {
    player.teleport({ x: spawn.x + 0.5, y: spawn.y, z: spawn.z + 0.5 }, { dimension: spawn.dimension });
    return;
  }
  // No saved point: land on the surface at 0, 0 in the Overworld.
  const overworld = world.getDimension("minecraft:overworld");
  await withLoadedArea("ns_home", overworld, { x: -8, y: -64, z: -8 }, { x: 8, y: 319, z: 8 }, () => {
    const top = overworld.getTopmostBlock({ x: 0, z: 0 });
    player.teleport({ x: 0.5, y: (top?.location.y ?? 100) + 1, z: 0.5 }, { dimension: overworld });
  });
}

function rememberReturnPoint(player) {
  player.setDynamicProperty("ns:return_dim", player.dimension.id);
  player.setDynamicProperty("ns:return_pos", player.location);
}

// createTickingArea resolves when every chunk in the box is loaded and ticking.
async function withLoadedArea(name, dimension, from, to, fn) {
  const areas = world.tickingAreaManager;
  const options = { dimension, from, to };
  if (areas.hasTickingArea(name)) areas.removeTickingArea(name);
  if (!areas.hasCapacity(options)) throw new Error("this pack has no ticking-area capacity left");
  await areas.createTickingArea(name, options);
  try {
    fn();
  } finally {
    if (areas.hasTickingArea(name)) areas.removeTickingArea(name);
  }
}

// Builds once per world; a world dynamic property remembers it across sessions.
function buildPlatformOnce(dim, id, cfg) {
  const key = `ns:built_${id.replace(":", "_")}`;
  if (world.getDynamicProperty(key) === true) return;
  const { x, y, z } = cfg.center;
  const r = cfg.radius;
  dim.fillBlocks(new BlockVolume({ x: x - r, y, z: z - r }, { x: x + r, y, z: z + r }), cfg.floor);
  if (cfg.under) {
    dim.fillBlocks(new BlockVolume({ x: x - r + 1, y: y - 1, z: z - r + 1 }, { x: x + r - 1, y: y - 1, z: z + r - 1 }), cfg.under);
    dim.fillBlocks(new BlockVolume({ x: x - r + 3, y: y - 2, z: z - r + 3 }, { x: x + r - 3, y: y - 2, z: z + r - 3 }), cfg.under);
  }
  if (cfg.feature) {
    try {
      dim.placeFeature(cfg.feature, { x, y: y + 1, z });
    } catch (e) {
      console.warn(`[ns] placeFeature ${cfg.feature} failed: ${e}`);
    }
  }
  world.setDynamicProperty(key, true);
}
