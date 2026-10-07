# Vanilla NPCs and dialogue files

Sources: vanilla `behavior_pack/entities/npc.json`, `resource_pack/entity/npc.entity.json` and `render_controllers/npc.render_controllers.json` (bedrock-samples v1.26.50.4); Learn "Create a Custom NPC" (`CreateNPCs.md`), "NPC Dialogue Command" (`NPCDialogue.md`), the dialogue reference (`DialogueReference/.../dialogue_document.md`) and the `/dialogue` command page; stable `@minecraft/server` 2.10.0 typings. The UI-side view (scene table, script bridge) is in `../../bedrock-ui/references/npc-dialogue.md`; this file adds the entity side.

## The `minecraft:npc` component

There is no Learn field table for `minecraft:npc` (the generated reference lists it as "Dynamic value"). The fields below are the ones the vanilla NPC uses:

```json
"minecraft:npc": {
  "npc_data": {
    "picker_offsets":   { "scale": [ 1.7, 1.7, 1.7 ],    "translate": [ 0, 20, 0 ] },
    "portrait_offsets": { "scale": [ 1.75, 1.75, 1.75 ], "translate": [ -7, 50, 0 ] },
    "skin_list": [ { "variant": 0 }, { "variant": 1 } ]
  }
}
```

| Field | What it does (from the vanilla file and the in-game editor) |
|---|---|
| `npc_data.picker_offsets` | `scale` / `translate` of the model in the editor's skin picker |
| `npc_data.portrait_offsets` | `scale` / `translate` of the model in the dialogue portrait. Tune it if your model isn't 2 blocks tall |
| `npc_data.skin_list` | The skins the editor offers, each `{ "variant": n }`. Vanilla lists 60 entries (variants 0-59) |

How skins render in vanilla: the client entity defines textures `npc_1` ... and `controller.render.npc` picks one with `"textures": [ "Array.skins[query.variant]" ]`. For a custom NPC with one texture, give `skin_list` a single `{ "variant": 0 }` and use `controller.render.default` (as `templates/dialogue-npc` does). For several skins, copy that render controller pattern with your own texture array, one `skin_list` entry per index.

The rest of the vanilla NPC entity: `type_family` `["npc", "mob"]`, `damage_sensor` all causes `deals_damage: "no"`, `fire_immune`, `persistent`, `physics`, `nameable` (`allow_name_tag_renaming: false`), `loot` `loot_tables/empty.json`, `movement` 0.5 with no movement goals, `behavior.look_at_player` (`look_time {min 1, max 2}`, distance 6), collision 0.6 x 2.1. `"events": null`.

Script: `EntityNpcComponent` (`defaultScene`, `name`, `skinIndex`) is **beta only** (not in stable 2.10.0; see `../../bedrock-whats-new/references/preview-api.md`). In stable script you set scenes with the `/dialogue` command.

## Getting an NPC

| Way | Notes |
|---|---|
| Vanilla `minecraft:npc` | `/give @p spawn_egg 1 51` (Learn), or `/summon npc`. Edit name, skin, text and buttons in game |
| Custom NPC entity | Your BP entity with `minecraft:npc` and family `npc` (Learn says `/dialogue` needs "an entity with type NPC"). Your own model renders in the portrait |
| Scripted NPC without `minecraft:npc` | Any custom entity plus script forms; see `scripted-npcs.md` |

Editing in game (Learn "Create a Custom NPC"): needs **Creative mode, cheats enabled and operator permission**. Right-click opens the editor (name up to 32 characters; dialogue text about 307 characters before it runs off screen; Advanced Settings for commands with Button Mode, On Enter, On Exit). To test what players see, switch to Survival or Adventure. Edits made in game live in the world, not in your pack. Education Edition rules for NPCs aren't covered by the official pages read here (unverified).

## Dialogue files

BP `dialogue/*.json`; every file in the folder is read, organize them as you like. Scene tags are global across all packs, so prefix them (`ns_...`).

```json
{
  "format_version": "1.20.80",
  "minecraft:npc_dialogue": {
    "scenes": [
      {
        "scene_tag": "ns_storyteller_intro",
        "npc_name": { "rawtext": [ { "translate": "ns.storyteller.name" } ] },
        "text": { "rawtext": [ { "translate": "ns.storyteller.intro" } ] },
        "on_open_commands": [ "/playsound mob.villager.idle @initiator" ],
        "on_close_commands": [ "/tag @initiator add ns_heard_story" ],
        "buttons": [
          { "name": "Tell me a story", "commands": [ "/dialogue open @s @initiator ns_storyteller_lore" ] }
        ]
      }
    ]
  }
}
```

| Field | Type | Notes |
|---|---|---|
| `format_version` | string | The dialogue reference says "Use '1.20.80' or later"; the Learn tutorial and Microsoft's sample use `"1.17"`. Both are official; the templates use 1.20.80 (bedrock-ui's uses 1.17) |
| `scene_tag` | string, required | The id `/dialogue` uses |
| `npc_name` | string or rawtext | Name on the dialogue box; overrides the NPC's own name |
| `text` | string or rawtext | Body. Empty if omitted |
| `on_open_commands` | command array | Run when the box opens |
| `on_close_commands` | command array | Run when the box closes |
| `buttons` | array of `{ name, commands }` | A button only appears if it has `commands`. Button `name` is shown as a plain string in Learn's examples; rawtext there is unverified |

Rawtext: `{ "rawtext": [ { "text": "Hi " }, { "translate": "ns.key", "with": [ "x" ] } ] }`, keys in RP `texts/en_US.lang` (`key=value<TAB>#`). See `../../bedrock-ui/references/hud-and-text.md`.

mct validate reports `scenes[n]: object value found, but a string is required` for every scene. That's a known false positive of its schema (the reference table also types `scenes` as "Array of strings" while describing objects).

## `/dialogue`

From the Learn command page: permission level **Game Directors**, **requires cheats: yes**.
```
/dialogue open <npc: target> <player: target> [sceneName: string]
/dialogue change <npc: target> <sceneName: string> [players: target]
```
- `open` forces the box open for the player. No `sceneName` keeps whatever the NPC last said. The NPC must exist in a loaded chunk within ticking distance of the player; it may be hidden (underground, invisible).
- `change` sets the scene for the player's next interaction (all players when `players` is omitted). It shows nothing. Run it before the player talks.
- `@initiator`: only valid in NPC dialogue commands; it is the player using the dialogue. Use it in every scene and button command in multiplayer. Learn: with `@initiator` "NPCs can remember each player's dialogue state", so `/dialogue change @s <scene> @initiator` gives per-player progress.
- Commands in scenes run with the NPC as source, so `@s` is the NPC (community-tested, not stated on Learn).
- Cheats: the command page says cheats are required. Whether scene/button commands, `queue_command` and script `runCommand` also need cheats on is not stated (unverified; test in a world with cheats off before shipping).

## Opening dialogue

| From | How |
|---|---|
| Player interacts with an NPC entity | Opens the NPC's current scene (survival/adventure); opens the editor for creative operators |
| First scene of a pack NPC | Set it once on spawn: `"minecraft:entity_spawned": { "queue_command": { "command": "dialogue change @s ns_intro" } }` (`queue_command` is an event action since 1.20.60) |
| A button | `/dialogue open @s @initiator ns_next` (branching) |
| A command block or function | `/dialogue open @e[type=ns:storyteller,c=1] @p ns_intro` |
| Script | No stable dialogue API. Run the command from the NPC: `npc.runCommand("dialogue open @s @a[tag=x,c=1] ns_intro")` with a temporary tag on the player (see `openScene` in `../../bedrock-ui/templates/npc-dialogue/BP/scripts/npc.js`) |
| Back to script | Button `/scriptevent ns:npc <action>`; script reads `e.sourceType === ScriptEventSource.NPCDialogue`, `e.initiator` (player), `e.sourceEntity` (NPC) |

## Limits and gotchas

- Scene tags, lang keys and tags are global: prefix them.
- Clicking a button runs its commands; whether the box closes before a chained `/dialogue open` reopens it is engine behavior (it works in Microsoft's sample).
- The editor is open to any creative operator. On servers, keep operators away from story NPCs or use a scripted NPC (no `minecraft:npc`) so interaction can't open the editor.
- An NPC must be loaded for `/dialogue open`. Keep a hidden NPC near the player or in a ticking area for "pop-up" dialogue (`pathing-and-schedules.md`).
- Dialogue has no inputs, no lists that change, and no per-tick updates. Hand off to script forms for shops and quest logs.
