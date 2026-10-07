---
name: bedrock-npcs
description: Use when a Minecraft Bedrock add-on needs NPCs or talking characters - dialogue, quest givers, shopkeepers, traders, guards, villager-like day and night schedules, NPCs that walk routes or stay at a home spot.
---

# Bedrock NPCs

How to build non-player characters for Bedrock add-ons, checked against vanilla 1.26.50.4 files, the Microsoft Learn NPC and dialogue pages, and the stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 typings (2026-10-06). Anything marked unverified isn't confirmed by an official source.

## Which kind of NPC

| You want | Build | Stable? | Reference / template |
|---|---|---|---|
| Story character with a portrait, branching lines, no code | Entity with `minecraft:npc` + BP `dialogue/*.json` scenes + `/dialogue` | Yes | `references/vanilla-npc-and-dialogue.md`, `templates/dialogue-npc` |
| Dialogue that calls script (shop button, flags) | Same, buttons run `/scriptevent` | Yes | `../bedrock-ui/references/npc-dialogue.md`, `../bedrock-ui/templates/npc-dialogue` |
| Quest giver, menus, per-player choices | Custom entity (no `minecraft:npc`) + `minecraft:interact` + script forms | Yes | `references/scripted-npcs.md`, `references/quests.md`, `templates/quest-giver` |
| Shop with balances, quantities, categories, sell-back | Custom entity + script shop | Yes | `references/shops-and-traders.md`, `templates/shopkeeper` |
| Villager-style trade screen | `minecraft:trade_table` / `economy_trade_table` + `trading/*.json` | Yes | `references/shops-and-traders.md`, `../bedrock-entity-behavior/templates/npc-trader` |
| Guard that walks a route and fights monsters | Marker blocks + `move_to_block` legs + combat goals, script watchdog | Yes | `references/pathing-and-schedules.md`, `templates/patrol-guard` |
| Works by day, goes home at night | `minecraft:scheduler` + `hourly_clock_time` + `go_home` | Yes | `references/pathing-and-schedules.md`, `templates/town-schedule` |
| Set an NPC's scene/name/skin from script | `EntityNpcComponent` | **Beta only** | Use `/dialogue change` from script or JSON instead |
| Make a mob walk to coordinates from script | No API in 2.10.0 | No | Goals + events, or teleport stepping (`pathing-and-schedules.md`) |

Rule of thumb: dialogue files for story, script forms for anything with state, trade tables for vanilla-feeling barter.

## Rules

1. **Pick one interaction owner.** `minecraft:npc` means the vanilla dialogue (and the editor for creative operators). A scripted NPC leaves it out and adds `minecraft:interact`, then handles `world.afterEvents.playerInteractWithEntity`.
2. **Make NPCs safe.** `damage_sensor` (`cause: all`, `deals_damage: "no"`), `fire_immune`, `persistent`, `physics`, empty loot. Leave out `pushable_by_entity` / `pushable_by_block` for NPCs that must stay put.
3. **`@initiator`, never `@p`,** in every scene and button command. `/dialogue change @s <scene> @initiator` gives per-player story progress.
4. **Prefix everything** with the namespace: scene tags, lang keys, tags, objectives, dynamic property keys, scriptevent ids.
5. **State lives on the player.** Versioned JSON in a player dynamic property, keyed by stable ids, under the 32,767-byte string cap. The NPC holds no conversation state.
6. **Read-only contexts write nothing.** Before-events and custom command callbacks can't change the world, scoreboards, inventories or dynamic properties: wrap writes and form opens in `system.run`.
7. **Re-check after every await,** then do the transaction in one synchronous block: check, take, give, save. Take payment before giving goods; save quest completion before paying rewards.
8. **Movement is JSON.** Script switches goal groups (`triggerEvent`, `setProperty`) and listens (`dataDrivenEntityTrigger`); it can't path a mob.
9. **Swap groups, don't strip components.** Freeze a talking NPC by swapping its wander group for a talking group; removing a group doesn't restore base components.
10. **Loaded or nothing.** NPCs in unloaded chunks don't walk, follow schedules or open dialogue. Use a ticking area for hubs, not one per NPC.
11. **Vanilla sounds are free:** map `ambient` / `hurt` / `death` to `mob.villager.*` in RP `sounds.json`; `player.playSound("mob.villager.yes")` in script.
12. **Ship stable only.** Beta members (`EntityNpcComponent`, `Entity.target`, `playerCraftRecipe`) wait for a stable module.

## Workflow

1. Choose the row in the table above. Generate or open an add-on and copy the template in: `node <plugin>/scripts/new-addon.mjs <dir> --name "My Town" --ns myns --add <plugin>/skills/bedrock-npcs/templates/<template>`. The generator renames `ns`, merges `sounds.json` and lang files, and imports top-level `BP/scripts/*.js` into `main.js`.
2. Replace the placeholder model: the templates share a 64x64 Box UV humanoid (bones `root`, `body`, `head`, `rightArm`, `leftArm`, `rightLeg`, `leftLeg`; `head` drives `animation.common.look_at_target`). See `bedrock-blockbench` for modeling.
3. Write the content: scenes in `BP/dialogue/`, quests in `ns_quests/quests.js`, offers in `ns_shop/catalog.js`, post blocks and work blocks in the entity JSON.
4. Check: `/bedrock-check packs` (or `node <plugin>/scripts/check-pack.mjs packs`), then `node --check` your scripts.
5. Test in game in **Survival or Adventure** (creative operators get the NPC editor on `minecraft:npc` entities). Test with two players: per-player state, two people talking to one NPC, the NPC unloading mid-conversation.
6. Before release: no beta modules in the manifest, no `//` comments in JSON, BP header UUID unchanged (saved quest and shop data depends on it).

## Templates (`templates/`, namespace `ns`)

| Folder | What | Script |
|---|---|---|
| `dialogue-npc` | `ns:storyteller`: custom model + `minecraft:npc`, two linked scenes, per-player `/dialogue change`, first scene set by `queue_command` on spawn | None |
| `quest-giver` | `ns:quest_giver`: ActionForm/MessageForm dialogue tree, kill quest (repeatable, cooldown) and collect quest, turn-in rewards, versioned per-player save, `/ns:quests` log | `ns_quests.js` + `ns_quests/` |
| `shopkeeper` | `ns:vendor`: categories, quantity slider, confirm, buy and sell-back transactions, receipts, scoreboard or item currency, `/ns:coins` | `ns_shop.js` + `ns_shop/` |
| `patrol-guard` | `ns:patrol_guard`: walks red, lime, light blue glazed terracotta posts in a loop, fights monsters, ignores players, stuck-leg watchdog, `/ns:patrol` | `ns_patrol.js` |
| `town-schedule` | `ns:townsfolk`: works near the nearest smithing table by day, walks to its spawn point at night, prefers paths, small talk | `ns_townsfolk.js` |

Each has BP entity, RP client entity, geometry, PNG, idle and walk animations, spawn egg, lang lines, `sounds.json` and a README. No manifests: use the generator or your own.

## References

- `references/vanilla-npc-and-dialogue.md`: `minecraft:npc` fields, skins, dialogue file fields, `/dialogue open` and `change`, `@initiator`, editing rights, limits.
- `references/scripted-npcs.md`: entity components for scripted NPCs, interaction events, form dialogue trees, per-player state, names, freezing.
- `references/shops-and-traders.md`: script shop transactions and currency, trade tables, tiers and restocking.
- `references/quests.md`: quest data model, saving, migration, trackers (kill, collect, visit), quest log, multiplayer, rewards and cooldowns.
- `references/pathing-and-schedules.md`: route goals, navigation options, what script can and can't do, schedules, ticking areas, homes.

Related skills: `bedrock-ui` (forms, DDUI, dialogue UI, form helper), `bedrock-entity-behavior` (components, groups, events, `npc-trader`), `bedrock-scripting` (events, commands, persistence patterns, pitfalls), `bedrock-world-content` (trade and loot files, ticking functions), `bedrock-json-reference` (exact field tables), `bedrock-whats-new` (what is stable now).
