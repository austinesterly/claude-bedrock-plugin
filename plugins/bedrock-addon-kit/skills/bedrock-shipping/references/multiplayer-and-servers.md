# Multiplayer, Realms and Bedrock Dedicated Server testing

Sources: Microsoft Learn "Getting Started with Bedrock Dedicated Server" (BedrockServer/getting-started.md), "Bedrock Dedicated Server Properties" (server-properties.md), "Scripting Bedrock Dedicated Server" (BedrockServer/scripting.md), "Pack Optimization with Bedrock Dedicated Server" (pack-optimization.md), "Building Multiplayer-Aware Scripts" (scripting/multiplayer-scripts.md), "Getting Started with Add-On Development" (Realms tab), "Introduction to Entity Properties", the cooperative guidelines, MCTools `PACKSIZE401`, `@minecraft/server` 2.10.0 typings, and the changelogs 26.40 to 26.60.30. Script patterns in depth: `../../bedrock-scripting/`.

## Where scripts run

"Scripts run on the _server_ side, not the _client_ side" (Learn: multiplayer scripts). In a hosted world the server is the host's game; on BDS or Realms it is the server. Consequences from the same page:
- World state is shared between players; the script sees every entity, including every player.
- Never assume one player (`world.getAllPlayers()[0]` is a bug) and never assume any player exists, especially at startup.
- Resource packs, client entity files, animations and lang files run on each client. Joining players download the host's resource packs (BDS `texturepack-required=true` forces them to use them).

## Test ladder

| Step | How | What it catches |
|---|---|---|
| 1. Single player | development pack folders (house rules section 6) | content log errors |
| 2. Two players, hosted | host opens the world with packs active; a second device on the same network joins | per-player state, late joins, host-only assumptions, RP download |
| 3. Bedrock Dedicated Server | below | no local player at startup, server-only config, console, restarts |
| 4. Realms | "upload the world with Add-Ons active to your realm" (Learn: Getting Started, Realms/Console tab) | console players, Realms limits |
| 5. Stacked | your add-on plus one other cooperative add-on | conflicts (cooperative guidelines require this test) |

Realms facts with an official source:
- The experimental BDS modules (`@minecraft/server-admin`, `@minecraft/server-net`) "cannot" be used "on gameplay servers provided as part of Minecraft Realms" (Learn: Scripting BDS).
- Large add-ons "may have issues on mobile platforms or with Realms uploads" (MCTools `PACKSIZE401`).
- Realms render distance can differ, "with a typical maximum of 20 chunks" (Learn: Simulation and Render Distance).
- 26.40 fixed "a bug where some pack configurations would load locally but not when uploaded to Realms"; 26.60 Preview (26.60.21) added active packs to the world slot view in Realms Hub.

Unverified for Realms: whether worlds with experiments or Beta APIs can be uploaded or played (community feedback posts say no; no official page states it), the Realms pack size limit, and whether a pack update needs the world re-uploaded.

## Bedrock Dedicated Server for testing

### Get and run it

- Download only from the official page: https://www.minecraft.net/download/server/bedrock. Ask the user to download and unzip it; never download or run it for them.
- Runs on Windows 10 (1703+), Windows Server 2016+, Ubuntu 18+ ("Ubuntu is the only officially supported Linux distribution").
- Unzip into an empty folder; keep one folder per version for testing (`C:\MinecraftServer\1.26.50`).
- Start: Windows `bedrock_server`; Ubuntu `LD_LIBRARY_PATH=. ./bedrock_server`.
- Client and server versions must match; a protocol mismatch shows "Outdated Client" or "Outdated Server". A Preview server needs a Preview client.
- Connecting from the same Windows PC needs a loopback exemption (Learn gives the `CheckNetIsolation.exe LoopbackExempt` command with the release and Preview package SIDs). Then Play > Add Server, address `127.0.0.1`, port `19132`.
- Linux firewall: allow `server-port` (19132) and `server-portv6` (19133).

### Folders

| Folder | Use |
|---|---|
| `worlds/<level-name>/` | one folder per world; `level-name` in server.properties picks the active one (exact match, case included) |
| `behavior_packs/`, `resource_packs/` (server root) | packs available to every world on the server |
| `worlds/<level-name>/behavior_packs/`, `resource_packs/` | packs available only to that world |
| `config/default/` | script module permissions, variables, secrets |

### Getting your add-on onto the server

Learn's documented route: make the world in the game with the packs active (and any experiments already set), then copy the world folder from `%appdata%\Minecraft Bedrock\users\<user id>\games\com.mojang\minecraftWorlds\<folder>` (the name is in `levelname.txt`) into `worlds/`, rename it, and set `level-name`. The world folder carries `behavior_packs/`, `resource_packs/` and `world_behavior_packs.json` / `world_resource_packs.json` (see `packaging.md`).

To test a new build: replace the pack folders (in the world or the shared folders) with the new version, update `version` in `world_*_packs.json` if the header version changed, restart the server. Learn does not document turning experiments on from server.properties; set them in the world before copying (unverified that any other route exists).

### server.properties fields that matter for add-on testing

| Field | Default | Why |
|---|---|---|
| `level-name` | `Bedrock level` | which `worlds/` folder loads |
| `allow-cheats` | `false` | `true` to run `/give`, `/summon`, `/function` while testing |
| `default-player-permission-level` | `member` | `visitor`, `member` or `operator` for new players |
| `texturepack-required` | `false` | `true` forces clients to use the world's resource packs |
| `content-log-file-enabled` | `false` | write content errors to a file (fixed in 26.40 to actually create the file) |
| `max-players` | `10` | invite enough testers |
| `online-mode`, `allow-list` | `true`, `false` | `allow-list=true` uses `allowlist.json` (`name`, optional `xuid`, `ignoresPlayerLimit`); 26.60 Preview exits on incompatible combinations |
| `view-distance`, `tick-distance` | `32`, `4` | tick-distance 4 to 12; logic outside it doesn't tick |
| `script-watchdog-*` | see Learn | `script-watchdog-memory-limit` (250 MB) saves and shuts down the world when exceeded; `-hang-threshold`, `-spike-threshold`, `-slow-threshold` warn about slow scripts |
| `allow-inbound-script-debugging`, `allow-outbound-script-debugging`, `script-debugger-auto-attach`, `force-inbound-debug-port` (19144), `script-debugger-passcode` | off | attach the VS Code Minecraft debugger to the server |
| `diagnostics-capture-auto-start` | `false` | capture diagnostics from level load |
| `disable-client-vibrant-visuals` | `true` | set `false` to test Vibrant Visuals resource packs |
| `server-authoritative-block-breaking`, `server-authoritative-movement-strict` | `false` | test custom blocks and movement under strict server checks |

26.60 Preview also added server settings for ticking area limits and entity attack request compatibility; their key names are not on Learn yet (unverified). Console commands: `op`, `deop`, `gamerule`, `stop`, `help`.

### Script modules only BDS can grant: permissions.json, variables, secrets

From Learn "Scripting Bedrock Dedicated Server". These modules are **experimental, part of Beta APIs**: the world needs the Beta APIs experiment, so they belong in server tooling or a separate test pack, not in a shipped add-on.

`config/default/permissions.json` (default contents):
```json
{
  "allowed_modules": [
    "@minecraft/server-gametest",
    "@minecraft/server",
    "@minecraft/server-ui",
    "@minecraft/server-admin",
    "@minecraft/server-editor"
  ]
}
```

- Per-pack permissions: create `config/<script module uuid>/permissions.json`, where the folder name is the `uuid` of the BP's `script` module (not the header uuid). Keep `default` minimal and grant extras per module.
- `@minecraft/server-net` (HTTP) is not in the default list; add it to the module's `allowed_modules` to use it (inferred from the list mechanism; exact need unverified).
- `variables.json` in `config/default/` or `config/<module uuid>/`: `{ "mobSpawnRate": 22 }`, read with `variables.get("mobSpawnRate")` from `@minecraft/server-admin`.
- `secrets.json` in the same folders: read with `secrets.get()`; secret values resolve only in constrained places such as `HttpHeader` in `@minecraft/server-net`, not as plain strings.
- Recent beta changes (26.40 to 26.60): `AllowList` and `AllowListEntry` in `@minecraft/server-admin`, `splitScreenSlot` on `AsyncPlayerJoinBeforeEvent`, `LevelStorage.saveHold/saveQuery/saveResume` now return Promises. Check `bedrock-whats-new` before using them.

### Pack optimization (26.40+)

Run the server once in optimization mode to "package the loose files in your resource and behavior packs into archives" and minify JSON:

```json
{ "input_directory": "D:/work/packs_input", "output_directory": "D:/work/packs_output", "verbose_logging": false }
```
```
./bedrock_server.exe PackOptimizerConfigPath=D:/work/pack_optimizer_config.json
```
- Each subfolder of `input_directory` is one pack; output contains `__brarchive/`. The server exits when done; exit code `7` (`ResourceProcessingError`) on failure.
- Optimized packs need client **1.26.40 or newer**; older clients fail to load them. Set `min_engine_version` accordingly if you ship optimized packs.
- Learn documents the Windows build (`bedrock_server.exe`); Linux support: unverified. 26.50 added a server option to unpack optimized packs into loose files (its name: unverified). The manifest header has a `pack_optimization_version` field (manifest reference; meaning unverified).

## Per-player data and late joins

From Learn "Building Multiplayer-Aware Scripts" (adapted to Script API 2.x: `isValid` is a property, not a method):

```js
import { world, system } from "@minecraft/server";

const session = new Map();                     // keyed by player.id, never by name or index

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn) return;                   // respawn after death: don't re-run setup
  session.set(player.id, { joinedAt: system.currentTick });
  const seen = player.getDynamicProperty("ns:seen_intro");   // persists with the world
  // Wait before teleporting or giving items: the player may not be fully loaded
  system.runTimeout(() => {
    if (!player.isValid) return;
    if (!seen) { /* give the guide book once */ player.setDynamicProperty("ns:seen_intro", true); }
  }, 20);
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  session.delete(playerId);                    // the Player object is gone; only playerId/playerName remain
});
```

- Also set up every player in `world.getAllPlayers()` inside `world.afterEvents.worldLoad`. Whether `playerSpawn` with `initialSpawn` fires again for players already in the world when scripts restart (for example after `/reload`): unverified; doing both, guarded by a dynamic property, is safe.
- Store per-player progress in player dynamic properties, world-wide state in world dynamic properties; both "are retained across server restarts". In-memory maps are lost on restart and `/reload`.
- Clean up per-player maps on leave, or they grow forever.
- Check `player.isValid` in every delayed callback; the player may have left.
- Target the player from the event (`event.source`, `event.player`), not "the" player.
- First-join messages once per player, 28 characters or less (cooperative guidelines).

## Network-heavy patterns to avoid

Documented:
- Entity properties with `"client_sync": true` are sent to clients (Learn: Introduction to Entity Properties). Sync only what the RP reads; change synced values only when they really change.
- More players and more ticking chunks cost more: `max-players` and `tick-distance` both "have a performance impact" (server.properties reference).
- Many entities playing sounds at once, long or numerous sounds triggered by small inputs (performance guide).
- Joining players download every resource pack; big RPs slow joins and can fail on low storage (26.40 changelog changed how low-storage downloads work). Keep the RP small and use subpacks for high-detail assets.

Inferred, unverified (no official page measures them):
- Updating `onScreenDisplay` (action bar, title) or sending chat every tick for every player.
- Spawning particles or playing sounds per player per tick from scripts.
- Teleporting or setting velocity on many entities every tick.
- Rewriting large dynamic property strings every tick (they are saved state, not a message bus).

Spread periodic work over `system.runInterval` loops of 5, 20 or 100 ticks and `system.runJob` (house rules section 4), and send only changed values to the players near them.
