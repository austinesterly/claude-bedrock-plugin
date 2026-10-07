# Quests

A quest system is three parts: **definitions** in code, **per-player state** in dynamic properties, and **trackers** on stable events. Checked against stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0. Working code: `templates/quest-giver` (`BP/scripts/ns_quests/`).

## Definitions

Keep quest data in a script module, keyed by a stable id:
```js
export const QUESTS = {
  zombie_hunt:   { title: "Zombie Hunt", kind: "kill", targets: ["minecraft:zombie", "minecraft:husk"], count: 5,
                   reward: { items: [{ id: "minecraft:emerald", count: 5 }], xp: 30 }, repeatable: true, cooldownTicks: 24000 },
  wheat_harvest: { title: "Wheat Harvest", kind: "collect", item: "minecraft:wheat", count: 16,
                   reward: { items: [{ id: "minecraft:bread", count: 6 }], xp: 15 }, repeatable: false },
  visit_tower:   { title: "The Old Tower", kind: "visit", dimension: "overworld", at: { x: 120, y: 70, z: -340 }, radius: 6,
                   reward: { items: [{ id: "minecraft:compass", count: 1 }] } },
};
```
- The id is saved in player data. Never rename a shipped id; add a new one and retire the old.
- Put text in lang keys (`{ translate: "ns.quest.zombie_hunt.title" }`) if you localize; forms accept `RawMessage`.
- Prerequisites: `requires: ["wheat_harvest"]`, checked in the status function.

## Saved state

One player dynamic property holding versioned JSON:
```js
{ v: 2, active: { zombie_hunt: { n: 3, at: 120400 } }, done: { wheat_harvest: { times: 1, last: 98000 } } }
```

| Concern | Rule |
|---|---|
| Where | `player.setDynamicProperty("ns:quests", json)`. Per-player data on the player, keyed implicitly by the player; world-wide data (a server-wide event goal) in `world` properties |
| Size | String values cap at 32,767 bytes (`../../bedrock-scripting/references/code-patterns.md` section 5). Guard the length before saving; `getDynamicPropertyTotalByteCount()` reports what an entity or world uses |
| Chunking | When one record can grow past the cap (journals, many quests), split into `ns:quests:0..n` plus a count key, as in code-patterns' `saveJson`/`loadJson`. Keep chunked text ASCII or chunk well under the cap (characters are not bytes) |
| Versioning | A `v` field; `migrate(s)` upgrades step by step (`if (s.v === 1) { ...; s.v = 2 }`) and is the only place that knows old shapes |
| Removed quests | `migrate` drops ids that no longer exist in `QUESTS` |
| Changed quests | If `count` goes down, clamp progress; if a quest's meaning changes, give it a new id instead |
| Caching | Parse once per player into a `Map` by `player.id`; write on change; drop the cache entry on `world.afterEvents.playerLeave` (`playerId`) |
| Time | `world.getAbsoluteTime()` for cooldowns (survives restarts); `system.currentTick` restarts each session; `world.getDay()` for "once per day" |
| Never | Change the BP header UUID (dynamic properties are keyed to it), key by `player.name` |

## Flows

| Step | What happens | Where |
|---|---|---|
| Offer | NPC lists quests by status: available, active (with progress), ready to turn in | `ActionFormData` root |
| Accept | `MessageFormData` with goal and reward; selection 0 accepts; then `accept()` re-checks status and saves | `offer()` |
| Progress | Trackers update state and show `onScreenDisplay.setActionBar("Zombie Hunt: 3/5")` | event handlers |
| Turn in | `turnIn()` in one synchronous block: re-check ready, remove collected items, mark done, **save**, then pay | `logic.js` |
| Abandon | Confirm with a MessageForm, then delete the active entry | quest log |

Save before paying. If something throws after the save, the player loses a reward instead of getting it twice.

## Tracking with stable events

| Objective | Event (2.10.0) | How |
|---|---|---|
| Kill | `world.afterEvents.entityDie` (`deadEntity`, `damageSource`) | `damageSource.damagingEntity` is the killer (for arrows the shooter; `damagingProjectile` is the arrow). Check `typeId === "minecraft:player"`. Subscribe options `entityTypes` filter the dead entity |
| Collect | Count live: scan `inventory.container` at check time | Don't count pickups (players can drop and re-pick). For progress messages use `world.afterEvents.playerInventoryItemChange` (`player`, `itemStack`, `beforeItemStack`, `slot`, `inventoryType`) with options `includeItems: [...]` |
| Collect (consumed on pickup) | `world.afterEvents.entityItemPickup` | When the item should count once, even if dropped later |
| Visit | `system.runInterval` every 20-40 ticks: distance from `player.location` to the target in the right `player.dimension.id` | Alternative: an invisible marker entity whose `minecraft:target_nearby_sensor` fires an event that script sees through `world.afterEvents.dataDrivenEntityTrigger` (the event carries no player; find the nearest one) |
| Talk to NPC | `world.afterEvents.playerInteractWithEntity` | Check `target.typeId` (and a tag or dynamic property for a specific NPC) |
| Craft | Not in stable 2.10.0. `world.afterEvents.playerCraftRecipe` (`PlayerCraftRecipeAfterEvent`) is beta-only (`../../bedrock-whats-new/references/preview-api.md`) | Count the crafted item as a collect objective instead |
| Break / place blocks | `world.afterEvents.playerBreakBlock` (`brokenBlockPermutation`), `playerPlaceBlock` | |
| Reach a level | `player.level` on an interval or at turn-in | |

Avoid per-tick work: trackers should run on events, and interval checks should be coarse and limited to players who have that quest active.

## Quest log

- A custom command is the cleanest entry point: `init.customCommandRegistry.registerCommand({ name: "ns:quests", permissionLevel: CommandPermissionLevel.Any, ... })` in `system.beforeEvents.startup`. The callback is read-only and runs while chat is still closing, so defer with `system.run` and let the form helper retry `UserBusy`.
- Also open it from an item (custom component `onUse`) or an NPC button (`/scriptevent ns:quests log`).
- `ActionFormData`: active quests as buttons with progress on line two, finished and cooling-down quests as a `label`, a detail page with "Abandon".
- For a log that updates while open (kills ticking up), use `CustomForm` with `ObservableString` labels and clear the interval when it closes (`../../bedrock-ui/templates/live-dashboard`).

## Multiplayer

- All state is per player. Kill credit goes to the killing player only; for party credit, also credit players within N blocks who have the quest active.
- Collect quests read the turning-in player's own inventory.
- Two players can talk to the same NPC at once: the NPC holds no conversation state. If it freezes while talking (`ns:start_talking`), unfreeze only when the last talker finishes (count talkers per NPC id), or accept that the first to finish restarts wandering.
- Shared world goals ("the village needs 500 wheat") go in a `world` dynamic property with contributions per player id.
- Per-player visuals on the NPC (a "!" over its head only for players with a quest to collect): `player.setPropertyOverrideForEntity(npc, "ns:marker", value)` is stable in 2.10.0 and overrides a `client_sync` entity property for that player only. The model then needs a bone or render controller reading `q.property('ns:marker')` (not in the template).

## Rewards and cooldowns

| Reward | API |
|---|---|
| Items | `new ItemStack(id, n)` split into `maxAmount` stacks; `container.addItem` returns the leftover; drop it with `dimension.spawnItem` |
| XP | `player.addExperience(n)` or `addLevels(n)` |
| Currency | Your shop wallet (`shops-and-traders.md`) |
| Unlock | A tag, a dynamic property flag, or `/dialogue change @s <scene> @initiator` for story NPCs |
| Loot table roll | `/loot give @s loot "ns/quest_reward"` via `player.runCommand` |

Cooldowns: store `last` as `world.getAbsoluteTime()` at turn-in; available again when `now - last >= cooldownTicks` (24000 ticks = one in-game day). Daily resets: compare `world.getDay()`.

## Migration checklist when quests change

1. Bump `v` only when the saved shape changes; add an upgrade step for the old shape.
2. Removing a quest: delete it from `QUESTS`; `migrate` drops it from saves. Refund collected items if your design took them at accept time.
3. Changing targets or counts of an active quest: clamp progress, or ship it as a new id and retire the old.
4. Test by loading an old world: keep a copy of a save made with the previous pack version.
