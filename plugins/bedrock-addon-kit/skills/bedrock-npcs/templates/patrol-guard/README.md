# patrol-guard template

A guard `ns:patrol_guard` that walks a loop of colored posts, fights monsters it sees, and never targets players. Movement is pure JSON (`minecraft:behavior.move_to_block` legs); script only skips a leg that can't be finished. **Stable.**

| File | What it does |
|---|---|
| `BP/entities/ns_patrol_guard.json` | Three leg groups. Leg A walks to the nearest red glazed terracotta within 24 blocks, stands on it for 3 s (`stay_duration` 60 ticks), then `on_stay_completed` starts leg B (lime), then C (light blue), then A again. Int property `ns:leg` holds the current leg. Combat: `nearest_attackable_target` (monsters except creepers, must see and reach), `melee_box_attack`, `attack` 6, `hurt_by_target` that ignores players and other NPCs. Players deal no damage; no fall damage |
| `BP/scripts/ns_patrol.js` | Every 5 s: if a guard's leg hasn't changed for 30 s and it hasn't fought, trigger the next leg. `/ns:patrol` lists guards within 48 blocks and where they're heading |
| `RP/...` | Client entity, 64x64 humanoid model and texture, animations, villager sounds, lang |

## Wire it up

1. `node <plugin>/scripts/new-addon.mjs <dir> --name "..." --ns <yourns> --add <this folder>` (imports `ns_patrol.js` into `main.js`).
2. Build the route: set posts into the floor, red, then lime, then light blue, a few to 20 blocks apart with a clear walking path between them. For a two-point patrol, place only red and lime posts: the watchdog skips the missing blue leg after 30 s (shorten `STUCK_TICKS` for snappier skips).
3. Spawn the guard near the red post.

## Notes

- The guard picks the *nearest* post of the next color within 24 blocks. Lay routes so that's always the next stop, or use more colors (add `ns:leg_d` and widen the `ns:leg` range).
- Swap the post blocks in the entity file for your own marker blocks so builds never attract the guard by accident.
- `on_stay_completed` is an array of triggers as in vanilla `bee.json`; mct validate warns that it expects a single trigger. The vanilla form is kept.
- The script can't make the guard walk to coordinates: no stable entity pathing API exists in 2.10.0. See `../../references/pathing-and-schedules.md` for the options and their limits.
- Zombies don't target the guard (it has no `irongolem` or `villager` family). Add such a family only if you want those side effects.
