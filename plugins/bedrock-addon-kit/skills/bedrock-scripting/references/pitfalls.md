# Script API pitfalls and fixes

| Symptom or trap | Cause | Fix |
|---|---|---|
| "does not have required privileges" | World, dimension, player, scoreboard or dynamic-property call at top level, in `startup`, in a before-event, a `before*` custom component hook or a command callback | Do it in `world.afterEvents.worldLoad`, or wrap it in `system.run(() => ...)` |
| Item change doesn't stick | The `ItemStack` from an event or `getEquipment`/`getItem` is a copy | Modify it, then `setEquipment`/`container.setItem` it back |
| Tutorial "chat commands" do nothing | `world.beforeEvents.chatSend` is beta-only (not in stable 2.10.0) | `customCommandRegistry.registerCommand`, or open a menu from an item's `onUse` |
| `worldInitialize is undefined` | v1 API | `system.beforeEvents.startup` (registries) and `world.afterEvents.worldLoad` (state) |
| `runCommandAsync is not a function` | Removed in 2.0 | `dimension.runCommand(...)` / `entity.runCommand(...)` |
| `isValid is not a function` | Became a property in 2.0 | `if (entity.isValid)` |
| `applyKnockback` arity error | 2.0 signature | `applyKnockback({ x, z }, verticalStrength)` |
| Item JSON with `minecraft:custom_components` rejected | Removed at format 1.21.90 | Put each custom component id as a key with its params |
| Form never appears when opened from chat or a command | Chat screen still open: `UserBusy` | Retry helper (code-patterns.md section 4) |
| Whole dimension's mobs vanish | Unbounded `getEntities()` + `kill()`/`remove()` from a sample | Always pass `location`, `maxDistance` and `type` |
| Loop stops forever after one error | Exception escaped a self-rescheduling loop, or the reschedule was inside the try | try/catch per loop body; reschedule outside it |
| `getBlock` throws / returns undefined | Chunk not loaded | `dimension.isChunkLoaded(loc)` first |
| Fill silently does nothing | Target in an unloaded chunk | Ticking area, or retry when loaded |
| Watchdog "slow script" warnings | Too much work in one tick (often one big await chain) | `system.runJob` generators; `await system.waitTicks(1)` between batches |
| Saved data gone after an update | BP header UUID changed | Never change UUIDs; bump `version` instead |
| Mob duplicates after reload | Spawned twice for one record | Reconcile on `entityLoad` (code-patterns.md section 7) |
| Player data lost on rename | Keyed by `player.name` | Key by `player.id` |
| Teleport across dimensions throws | Entity has passengers (26.50+) | Dismount first |
| Removing a component group breaks movement | Removing a group that overrode a base component deletes the component | Give each state its own explicit group; freeze with `minecraft:is_stunned` |
| Can't make mob walk to X | No pathing API | JSON goals (`behavior.move_to_*`, `minecraft:home`), switched with `triggerEvent` |
| Beta API works in test, crashes for players | Test world had Beta APIs on | Check api-surface.md; ship only stable modules |
| `.js` file fails with a strange first-character error | UTF-8 BOM from Windows PowerShell 5 `Set-Content -Encoding utf8` | Write files with Node or `-Encoding utf8NoBOM` |
