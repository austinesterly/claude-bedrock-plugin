# GameTest: automated tests in the world

> **Beta module, test worlds only.** `@minecraft/server-gametest` has no stable release (npm `1.0.0-beta.1.26.52-stable` for game 26.52, `1.0.0-beta.1.26.60-preview.30` for Preview 26.60; the two typings match apart from comments). It needs the **Beta APIs** experiment, which a world can never turn off. Keep tests in a separate test world, and ideally a separate test pack. Never ship them.

Checked 2026-10-06 against those typings, Learn *Introduction to the GameTest Framework*, *Building your first GameTest* and the `/gametest` command page. Starter: `../templates/gametest-starter` (three tests, README with the manifest and structure steps). Other beta names: `../../bedrock-whats-new/references/preview-api.md` under `@minecraft/server-gametest`.

## What a GameTest is

A structure (a `.mcstructure` pen holding the setup) plus a test function. The framework places the structure, runs the function, and the test passes when a success condition is met or fails on an assert, `fail`, or `maxTicks` timeout. Good uses: "my mob still attacks chickens", "my block drops its loot", "my machine outputs an item when powered", run again after every change.

## Setup

1. Manifest dependencies (BP): `{ "module_name": "@minecraft/server-gametest", "version": "1.0.0-beta" }` plus `@minecraft/server` at the beta version for your game (26.52: `2.11.0-beta`; Preview 26.60: `2.12.0-beta`). `/bedrock-new --beta` writes the Preview one.
2. World: Beta APIs on, cheats on; Learn recommends Creative, Flat and Normal difficulty.
3. Structures in `BP/structures/<namespace>/<name>.mcstructure`. `structureName("xyz:bar")` loads `structures/xyz/bar.mcstructure` from the behavior pack stack. Save one with a structure block (Save mode, **Export**) and keep the case lower.
4. Changing scripts: `/reload`. Adding tests or structures: re-enter the world (Learn).

## Registering tests

```js
import { register, registerAsync, Tags } from "@minecraft/server-gametest";

register("ns_tests", "block_place", (test) => {
  test.setBlockType("minecraft:stone", { x: 1, y: 2, z: 1 });
  test.succeedWhenBlockPresent("minecraft:stone", { x: 1, y: 2, z: 1 }, true);
})
  .structureName("ns:pen")
  .maxTicks(40)
  .tag("ns_tests")
  .tag(Tags.suiteDefault);
```
- `register(className, testName, fn)` and `registerAsync(className, testName, async fn)` return a `RegistrationBuilder`. Both may run in early execution, so top level is fine.
- Builder: `structureName`, `structureLocation(location, dimension?)` (fixed placement; y = `heightRange.max` snaps to the ground), `maxTicks`, `setupTicks`, `padding`, `maxAttempts`, `requiredSuccessfulAttempts`, `required`, `rotateTest` (all four rotations with `runset`), `batch`, `tag`.
- `setBeforeBatchCallback(batch, fn)` / `setAfterBatchCallback(batch, fn)`: setup and teardown per batch.
- `Tags`: `suite:default`, `suite:all`, `suite:debug`, `suite:disabled`, `suite:nextupdate`.

## Writing tests: the `Test` object

All locations are relative to the structure block (`test.worldBlockLocation(rel)` / `relativeBlockLocation(world)` convert).
- **Setup:** `spawn(id, loc)`, `spawnAtLocation`, `spawnWithoutBehaviors` (no AI; pair with `walkTo(mob, loc)`), `spawnItem(itemStack, loc)`, `setBlockType`, `setBlockPermutation`, `pullLever`, `pressButton`, `pulseRedstone`, `setTntFuse`, `getBlock`, `getDimension`, `killAllEntities`.
- **Asserts** (throw `GameTestError`): `assert(cond, msg)`, `assertBlockPresent`, `assertBlockState`, `assertEntityPresent(id, loc, searchDistance?, isPresent?)`, `assertEntityPresentInArea`, `assertEntityInstancePresent(InArea)`, `assertEntityHasComponent`, `assertEntityHasArmor`, `assertEntityState`, `assertEntityTouching`, `assertItemEntityPresent`, `assertItemEntityCountIs`, `assertContainerContains`, `assertContainerEmpty`, `assertRedstonePower`, `assertIsWaterlogged`, `assertCanReachLocation`.
- **Finish:** `succeed()`, `succeedIf(fn)`, `succeedWhen(fn)` (re-runs `fn` every tick until it stops throwing), `succeedOnTick`, `succeedOnTickWhen`, `succeedWhenBlockPresent`, `succeedWhenEntityPresent`, `succeedWhenEntityHasComponent`, `fail(msg)`, `failIf(fn)`.
- **Timing:** `runAfterDelay(ticks, fn)`, `runAtTickTime(tick, fn)`, `runOnFinish(fn)`, async `await test.idle(ticks)` and `await test.until(fn)`.
- **Sequences:** `test.startSequence().thenExecute(fn).thenExecuteAfter(ticks, fn).thenExecuteFor(ticks, fn).thenWait(fn).thenWaitAfter(ticks, fn).thenIdle(ticks).thenSucceed()` (or `.thenFail(msg)`).
- `print(text)` shows a message during the test.

## Simulated players

`test.spawnSimulatedPlayer(loc, name?, gameMode?)` returns a `SimulatedPlayer` (a real `Player` subclass, so player events and APIs see it). It can `move` / `moveRelative` / `moveToLocation` / `moveToBlock`, `navigateToLocation` / `navigateToEntity` (returns a `NavigationResult` with `isFullPath`), `jump`, `fly`, `glide`, `swim`, `lookAtBlock` / `lookAtEntity` / `lookAtLocation` (`LookDuration`), `attack`, `attackEntity`, `breakBlock`, `interact`, `interactWithBlock`, `interactWithEntity`, `useItem`, `useItemInSlot`, `useItemOnBlock`, `giveItem(itemStack, selectSlot?)`, `setItem`, `dropSelectedItem`, `chat`, `respawn`, `disconnect`. `test.removeSimulatedPlayer(p)` removes one. A bot that leaves the test area fails with `SimulatedPlayerOutOfBounds`. Outside a test, `spawnSimulatedPlayer(dimensionLocation, name, gameMode)` (module function) creates a free-standing bot.

## `/gametest` commands

| Command | Does |
|---|---|
| `/gametest run <class:test> [rotationSteps]` | Run one test (Learn: `/gametest run startertests:simpleMobTest`) |
| `/gametest run <class:test> <stopOnFailure> <repeatCount> [rotationSteps]` | Repeat a test, optionally stopping at the first failure (flaky-test hunting) |
| `/gametest runset [tag] [rotationSteps]` | Run every test with a tag (default suite without one) |
| `/gametest runsetuntilfail [tag] [rotationSteps]` | Repeat a set until something fails |
| `/gametest runthese` | Run tests near you |
| `/gametest runthis` | Internal variant used by command blocks |
| `/gametest create <name> [width] [height] [depth]` | Create a new test area |
| `/gametest pos` | Show the relative position of a test's origin (helps when writing coordinates) |
| `/gametest stopall` / `clearall` | Stop running tests / clear existing tests and their side effects |

Permission level Game Directors, cheats required, Beta APIs required.

## Failures

`GameTestError.type` (`GameTestErrorType`): `Assert`, `AssertAtPosition`, `ExecutionTimeout` (hit `maxTicks`), `ExhaustedAttempts`, `FailConditionsMet`, `LevelStateModificationFailed`, `MethodNotImplemented`, `SimulatedPlayerOutOfBounds`, `Unknown`, `Waiting`. `context` has `absolutePosition`, `relativePosition` and `tickCount`; `messageParameters` holds the message arguments. `GameTestCompletedError` (`Done`, `Cleanup`) means you called into a test that already finished.

Common causes: the structure file is missing or its name case differs; coordinates inside the floor or walls (Learn's samples spawn at y 2; check with `/gametest pos`); mobs on Peaceful; `maxTicks` too short for the behavior; spawned mobs wander out of an open pen.

## Not in this module

Test frameworks outside the game, CI runs and Dedicated Server automation aren't covered by these docs. Creator Tools has an `--ensure-world` option that syncs a flat GameTest world with a project (`mct --help`); it was not tried here.
