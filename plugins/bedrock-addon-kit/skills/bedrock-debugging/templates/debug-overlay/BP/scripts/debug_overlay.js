// Debug overlay: stable @minecraft/server APIs only (checked against 2.10.0).
//   /ns:debug          toggle the action-bar overlay for yourself
//   /ns:debug props    list this add-on's world and player dynamic properties in chat
//   /ns:debug entities print entity counts by type (near you, then loaded per dimension)
// The overlay shows a TPS estimate, entity counts and dynamic property usage, refreshed once a second.
// It only costs anything while at least one player has it on. Remove it (or leave it off) in shipped packs.
import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  MemoryTier,
  Player,
  system,
  world,
} from "@minecraft/server";

const NS = "ns:"; // your add-on's ids start with this
const MODE_ENUM = "ns:debug_mode";
const NEAR_RADIUS = 64; // blocks
const REFRESH_TICKS = 20;
const TOTALS_EVERY = 5; // refreshes between whole-dimension counts (5 x 20 ticks = 5 s)

const enabled = new Set(); // player ids with the overlay on (memory only; resets on /reload)
let lastMs = 0;
let lastTick = 0;
let tps = 20;
let refreshes = 0;
let totals = new Map(); // dimension id -> { all, ours }

const tierName = (v) => Object.keys(MemoryTier).find((k) => MemoryTier[k] === v) ?? String(v);
const short = (v) => {
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > 40 ? `${s.slice(0, 37)}...` : s;
};

function countTypes(entities) {
  const byType = new Map();
  let ours = 0;
  for (const e of entities) {
    byType.set(e.typeId, (byType.get(e.typeId) ?? 0) + 1);
    if (e.typeId.startsWith(NS)) ours++;
  }
  return { all: entities.length, ours, byType };
}

function dimensionsToCount() {
  const ids = new Set(["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]);
  for (const p of world.getAllPlayers()) ids.add(p.dimension.id); // includes custom dimensions players are in
  return [...ids];
}

function refreshTotals() {
  totals = new Map();
  for (const id of dimensionsToCount()) {
    try {
      const c = countTypes(world.getDimension(id).getEntities());
      totals.set(id, { all: c.all, ours: c.ours });
    } catch (e) {
      console.warn(`[ns debug] could not count ${id}: ${e}`);
    }
  }
}

function overlayFor(player) {
  const near = countTypes(player.dimension.getEntities({ location: player.location, maxDistance: NEAR_RADIUS }));
  const here = totals.get(player.dimension.id);
  return [
    `§eTPS ~${tps.toFixed(1)}§r  tick ${system.currentTick}  mem ${tierName(system.serverSystemInfo.memoryTier)}`,
    `near ${near.all} (${NS}* ${near.ours})  loaded ${here ? `${here.all} (${NS}* ${here.ours})` : "?"}`,
    `dynprops world ${world.getDynamicPropertyIds().length} / ${world.getDynamicPropertyTotalByteCount()} B  you ${player.getDynamicPropertyIds().length} / ${player.getDynamicPropertyTotalByteCount()} B`,
  ].join("\n");
}

function tick() {
  const now = Date.now();
  if (lastMs) {
    const ticks = system.currentTick - lastTick;
    const sec = (now - lastMs) / 1000;
    if (sec > 0 && ticks > 0) tps = Math.min(20, ticks / sec);
  }
  lastMs = now;
  lastTick = system.currentTick;
  if (!enabled.size) return;
  if (refreshes++ % TOTALS_EVERY === 0) refreshTotals();
  for (const player of world.getAllPlayers()) {
    if (!enabled.has(player.id)) continue;
    player.onScreenDisplay.setActionBar(overlayFor(player));
  }
}

function printProps(player) {
  const lines = [`§e${NS} world dynamic properties (${world.getDynamicPropertyTotalByteCount()} bytes):`];
  for (const id of world.getDynamicPropertyIds().slice(0, 30)) lines.push(`  ${id} = ${short(world.getDynamicProperty(id))}`);
  lines.push(`§eyour dynamic properties (${player.getDynamicPropertyTotalByteCount()} bytes):`);
  for (const id of player.getDynamicPropertyIds().slice(0, 30)) lines.push(`  ${id} = ${short(player.getDynamicProperty(id))}`);
  player.sendMessage(lines.join("\n"));
}

function printEntities(player) {
  refreshTotals();
  const near = countTypes(player.dimension.getEntities({ location: player.location, maxDistance: NEAR_RADIUS }));
  const top = [...near.byType].sort((a, b) => b[1] - a[1]).slice(0, 15);
  const lines = [`§eentities within ${NEAR_RADIUS} blocks: ${near.all}`, ...top.map(([t, n]) => `  ${n} x ${t}`)];
  for (const [id, c] of totals) lines.push(`§eloaded in ${id}: ${c.all} (${NS}* ${c.ours})`);
  player.sendMessage(lines.join("\n"));
}

system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerEnum(MODE_ENUM, ["toggle", "props", "entities"]);
  init.customCommandRegistry.registerCommand(
    {
      name: "ns:debug",
      description: "Toggle the debug overlay, or list dynamic properties or entity counts",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: false,
      optionalParameters: [{ name: MODE_ENUM, type: CustomCommandParamType.Enum }],
    },
    (origin, mode) => {
      const player = origin.sourceEntity;
      if (!(player instanceof Player)) return { status: CustomCommandStatus.Failure, message: "Run this as a player." };
      // Command callbacks are read-only: do the work on the next tick.
      system.run(() => {
        if (!player.isValid) return;
        if (mode === "props") return printProps(player);
        if (mode === "entities") return printEntities(player);
        if (enabled.delete(player.id)) {
          player.onScreenDisplay.setActionBar("debug overlay off");
        } else {
          enabled.add(player.id);
          refreshes = 0; // count totals on the next refresh
        }
      });
      return { status: CustomCommandStatus.Success };
    },
  );
});

world.afterEvents.worldLoad.subscribe(() => {
  system.runInterval(() => {
    try {
      tick();
    } catch (e) {
      console.warn(`[ns debug] ${e instanceof Error ? e.stack : e}`);
    }
  }, REFRESH_TICKS);
});

world.afterEvents.playerLeave.subscribe((e) => enabled.delete(e.playerId));
