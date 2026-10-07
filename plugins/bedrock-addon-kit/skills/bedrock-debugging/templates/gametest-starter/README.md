# gametest-starter (beta module, test worlds only)

Three automated tests written with `@minecraft/server-gametest`, a module that has **no stable release**. Use it in a separate test world or test pack, never in content you share.

Files: `BP/scripts/gametest_example.js`. The generator copies it, renames `ns` to your namespace and adds `import "./gametest_example.js";` to `main.js`.

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/new-addon.mjs" <dir> --name "My Tests" --ns myns --beta \
  --add "${CLAUDE_PLUGIN_ROOT}/skills/bedrock-debugging/templates/gametest-starter"
```

## 1. Manifest dependency (you add this; templates ship no manifest)

Add the gametest module to the BP manifest `dependencies`, next to the `@minecraft/server` entry:

```json
{ "module_name": "@minecraft/server-gametest", "version": "1.0.0-beta" }
```

- The version string is `1.0.0-beta` for every game build. The npm tag (`1.0.0-beta.1.26.52-stable`, `1.0.0-beta.1.26.60-preview.30`) only says which game build the typings match.
- `@minecraft/server` must be the **beta** version for the game you run: with `--beta` the generator writes the Preview one (for example `2.12.0-beta` on Preview 26.60). On stable 26.52 use `2.11.0-beta` (the peer dependency of `server-gametest@1.0.0-beta.1.26.52-stable`). Check `bedrock-whats-new/references/current-versions.md`.
- The `import` is static. If the dependency is missing, the world lacks the experiment, or the version doesn't match the game, the import fails and **all of `main.js` stops**, not just the tests. Keep tests in their own test pack if you also want the add-on to run in normal worlds.
- For typings in VS Code: `npm i -D @minecraft/server-gametest@beta` (types only; nothing runs from it).

## 2. World settings

New world (experiments can never be turned off again): **Beta APIs** on, cheats on, Creative, Flat, Normal difficulty (mobs act differently on Peaceful). Add the BP and RP.

## 3. The test structure `ns:pen`

Every test loads a structure. `structureName("ns:pen")` loads `BP/structures/ns/pen.mcstructure` (after renaming: `structures/<your ns>/pen.mcstructure`).

1. In the test world, build a small closed pen, for example a 5 x 4 x 5 glass box with a floor, so spawned mobs can't wander off.
2. `/give @s structure_block`, place it at one corner, set it to **Save**, frame the pen, name it `<your ns>:pen`, and press **Export**. Save the file into `BP/structures/<your ns>/pen.mcstructure` (lower case, matching the name).
3. Re-enter the world (new structures and tests are not picked up by `/reload`).

Test coordinates such as `{ x: 1, y: 2, z: 1 }` are relative to the test's structure origin (Learn's samples spawn at y 2). If a spawn lands inside the floor or a wall, check with `/gametest pos` and adjust.

## 4. Run

```
/gametest run ns_tests:block_place
/gametest run ns_tests:mob_survives
/gametest run ns_tests:sim_player
/gametest runset ns_tests
/gametest stopall
/gametest clearall
```

A failing assert reports its message, and a `GameTestError` carries the position and tick (`context`). Read the chat and the content log for results (exactly how the in-world markers look was not checked for this template). Change `MOB` to one of your own entity ids to test your content.

## What's in the file

| Test | Shows |
|---|---|
| `block_place` | `register`, `setBlockType`, `succeedWhenBlockPresent`, builder options `structureName`, `maxTicks`, `tag` |
| `mob_survives` | `registerAsync`, `spawn`, `await test.idle(ticks)`, `assertEntityPresentInArea`, `succeed` |
| `sim_player` | `spawnSimulatedPlayer`, `giveItem`, `jump`, `startSequence().thenExecuteAfter(...).thenSucceed()` |

Full API notes: `../../references/gametest.md`.
