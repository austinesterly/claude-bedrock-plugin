# dialogue-npc template

A custom NPC `ns:storyteller` with its own model that speaks through vanilla NPC dialogue: two linked scenes, per-player progress with `/dialogue change ... @initiator`, and no script. **Stable.**

How it differs from `../../../bedrock-ui/templates/npc-dialogue`: that template is only a scene file plus a script bridge (`/scriptevent` buttons, an `openScene` helper) for an NPC you already have. This one is the whole character: entity, model, skin, sounds and scenes. Combine them when buttons need script.

| File | What it does |
|---|---|
| `BP/entities/ns_storyteller.json` | Entity with `minecraft:npc` (one skin, vanilla portrait offsets), family `npc`, invulnerable, persistent, looks at players. `minecraft:entity_spawned` runs `queue_command` `dialogue change @s ns_storyteller_intro` so the first talk opens the intro |
| `BP/dialogue/ns_storyteller.json` | Scenes `ns_storyteller_intro` and `ns_storyteller_lore`. The intro's button opens the lore; opening the lore remembers it for that player; "Start over" resets that player to the intro. Closing the lore tags the player `ns_heard_story` |
| `RP/entity/ns_storyteller.entity.json` | Client entity, spawn egg colors, idle, walk and look-at animations |
| `RP/models/entity/ns_storyteller.geo.json`, `RP/textures/entity/ns_storyteller.png` | 64x64 Box UV humanoid placeholder |
| `RP/animations/ns_storyteller.animation.json` | Idle arm sway, walk swing |
| `RP/sounds.json` | `ambient`, `hurt`, `death` mapped to vanilla villager sounds |
| `RP/texts/en_US.lang` | Entity, spawn egg, dialogue name and lines |

## Wire it up

1. `node <plugin>/scripts/new-addon.mjs <dir> --name "..." --ns <yourns> --add <this folder>` (or copy the files and rename `ns`).
2. In game, spawn it with its spawn egg or `/summon ns:storyteller` (your namespace).
3. Switch to **Survival or Adventure** and interact. In Creative with operator rights you get the NPC editor instead.

## Notes

- Learn lists `/dialogue` as Game Directors permission with cheats required. Whether commands run by dialogue buttons and by `queue_command` also need cheats on is not documented (unverified): test in a world with cheats off.
- The tag `ns_heard_story` is there for command blocks, functions or scripts to test (`@a[tag=ns_heard_story]`).
- Scene tags are global across packs; keep the `ns_` prefix after renaming.
- mct validate reports "object value found, but a string is required" for each scene: a known false positive.
- Field details: `../../references/vanilla-npc-and-dialogue.md`.
