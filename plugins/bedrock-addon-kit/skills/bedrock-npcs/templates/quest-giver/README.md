# quest-giver template

A custom NPC `ns:quest_giver` with a script dialogue tree, one kill quest and one collect quest, progress tracking, turn-in rewards and a quest log. Per-player state is saved as versioned JSON in a player dynamic property. **Stable** (`@minecraft/server` 2.10.0, `@minecraft/server-ui` 2.2.0).

| File | What it does |
|---|---|
| `BP/entities/ns_quest_giver.json` | Invulnerable, persistent, not pushable. Wanders within 6 blocks of its spawn (`minecraft:home`). `minecraft:interact` makes the interaction succeed. `ns:start_talking` / `ns:stop_talking` swap the wander group for a talking group (looks at you, 60 s safety timer) |
| `BP/scripts/ns_quests.js` | Entry: interaction, name tag, kill tracking (`entityDie`), collect progress (`playerInventoryItemChange`), `/ns:quests`, `/scriptevent ns:quests reset` |
| `BP/scripts/ns_quests/quests.js` | Quest definitions: `zombie_hunt` (kill 5 zombie types, repeatable once per in-game day) and `wheat_harvest` (bring 16 wheat, once) |
| `BP/scripts/ns_quests/state.js` | Load, migrate (v1 to v2 example), cache and save per-player state |
| `BP/scripts/ns_quests/logic.js` | Status, accept, abandon, kill credit, and the synchronous turn-in transaction |
| `BP/scripts/ns_quests/ui.js` | ActionForm root, MessageForm accept and abandon, turn-in screen, quest log |
| `BP/scripts/ns_quests/forms.js` | Small form helper (UserBusy retry, one form per player) |
| `RP/...` | Client entity, 64x64 humanoid model and texture, animations, villager sounds, lang |

## Wire it up

1. `node <plugin>/scripts/new-addon.mjs <dir> --name "..." --ns <yourns> --add <this folder>`. The generator imports `ns_quests.js` into `main.js`; when copying by hand add `import "./ns_quests.js";` to `main.js`.
2. The BP manifest needs `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0.
3. Spawn the NPC, talk to it, accept both quests, kill zombies, gather wheat, come back. `/ns:quests` opens the log from anywhere. A new custom command needs a world re-entry, not just `/reload`.

## Notes

- Kill credit goes to the player who dealt the killing blow (arrows count for their shooter).
- Collect quests count the inventory at turn-in and remove exactly the required amount.
- Turn-in saves completion before giving rewards, so an error can't pay twice.
- Add a quest: add an entry to `QUESTS` with a new id. Never rename shipped ids; `state.js` drops progress for ids you delete.
- The NPC freezes while one player talks; if two players talk at once, the first to finish restarts its wandering.
- Design notes: `../../references/quests.md` and `../../references/scripted-npcs.md`.
