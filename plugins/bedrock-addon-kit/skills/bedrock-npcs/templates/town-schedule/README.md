# town-schedule template

A villager-like NPC `ns:townsfolk` that goes to work by day and home at night, using the same JSON pattern as vanilla villagers: `minecraft:scheduler` with `hourly_clock_time` filters swapping component groups. **Stable.** The script only adds names and small talk.

| File | What it does |
|---|---|
| `BP/entities/ns_townsfolk.json` | `ns:work_shift` (time 0-11000): `move_to_block` to the nearest smithing table within 32 blocks, short strolls, looks at players. `ns:night_home` (11000-24000): `go_home` back to where it spawned and stays there. `minecraft:home` with `restriction_type: none` only records the spawn point. Enum property `ns:activity` (`work` / `home`). Prefers dirt paths and stone roads (`minecraft:preferred_path`, vanilla villager costs), opens doors |
| `BP/scripts/ns_townsfolk.js` | Random name tag on spawn, a line of small talk that depends on `ns:activity`, `/scriptevent ns:townsfolk status` debug list |
| `RP/...` | Client entity, 64x64 humanoid model and texture, animations, villager sounds, lang |

## Wire it up

1. `node <plugin>/scripts/new-addon.mjs <dir> --name "..." --ns <yourns> --add <this folder>` (imports `ns_townsfolk.js` into `main.js`).
2. **Spawn it inside its house**: the home is the spawn point and script can't move it. Place a smithing table (the "workplace") within 32 blocks, with a walkable path and doors it can open.
3. Speed up a test: `/time set 10500`, wait, then `/time set 13000`.

## Notes

- Change the work block in `ns:work_shift` (`target_blocks`) to any block id; give different townsfolk different work blocks with separate entity files or property-gated groups.
- The scheduler checks within 0-10 s (`min_delay_secs` / `max_delay_secs`). How often it re-fires a matching event isn't documented; the events are safe to repeat.
- NPCs only follow the schedule in loaded chunks. Use a ticking area for a town square (`../../references/pathing-and-schedules.md`).
- To move an NPC's home, spawn a new one at the new place and remove the old one.
