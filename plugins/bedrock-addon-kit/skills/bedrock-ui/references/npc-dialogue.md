# NPC dialogue as UI

Sources: Learn "NPC Dialogue" (`Documents/NPCDialogue.md`), "Create NPC dialogue with DialogueDesigner" (`Documents/NPCDialogueDesigner.md`), stable `@minecraft/server` 2.10.0 typings.

The NPC dialogue screen is a vanilla screen with a portrait of the speaking entity, a name, body text and up to several buttons that run commands. It needs no JSON UI and no script, and it is the most "story-like" UI an add-on can show. It's command-driven, so for logic-heavy screens combine it with script forms (below).

## Pieces

| Piece | Where | What |
|---|---|---|
| NPC entity | BP entity with `"minecraft:npc"` and a type family `"npc"` (Learn), or the vanilla `minecraft:npc` | The speaker; its model renders in the portrait |
| Scene files | BP `dialogue/*.json` (any file names; all are read) | `minecraft:npc_dialogue.scenes[]` |
| Commands | `/dialogue open`, `/dialogue change` | Show a scene / set what the NPC says next |

Scene file:
```json
{
  "format_version": "1.17",
  "minecraft:npc_dialogue": {
    "scenes": [
      {
        "scene_tag": "ns_guide_intro",
        "npc_name": { "rawtext": [ { "translate": "ns.npc.guide.name" } ] },
        "text": { "rawtext": [ { "translate": "ns.npc.guide.intro" } ] },
        "on_open_commands": [ "/playsound random.orb @initiator" ],
        "on_close_commands": [],
        "buttons": [
          { "name": "Shop", "commands": [ "/scriptevent ns:npc shop" ] },
          { "name": "Tell me more", "commands": [ "/dialogue open @s @initiator ns_guide_more" ] }
        ]
      }
    ]
  }
}
```

| Scene field | Type | Notes |
|---|---|---|
| `scene_tag` | string, required | Id used by `/dialogue` |
| `npc_name` | string or rawtext | Name shown on the dialogue box |
| `text` | string or rawtext | Body; empty if omitted |
| `on_open_commands` / `on_close_commands` | command array | Run when the box opens / closes |
| `buttons` | array of `{ name, commands }` | A button only appears if it has commands |

Commands:
```
/dialogue open <npc: target> <player: target> [sceneName: string]
/dialogue change <npc: target> <sceneName: string> [player: target]
```
- `open` forces the box open for the player. The NPC must exist in a loaded chunk within ticking distance of that player; it can be hidden (underground, invisible).
- `change` sets which scene the NPC shows on the player's next interaction (all players if `player` is omitted). It doesn't open anything.
- `@initiator` (only valid inside NPC dialogue commands) is the player using the dialogue. Use it instead of `@p` in multiplayer.
- Scene and button commands run with the NPC as the source, so `@s` is the NPC (community-tested behavior, not stated on the Learn page; check once in game).
- Branching: a button's command opens the next scene (`/dialogue open @s @initiator next_scene`).

## Connecting dialogue to scripts

NPC buttons can run `/scriptevent`, which reaches scripts with `sourceType === ScriptEventSource.NPCDialogue`:

```js
import { system, ScriptEventSource } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe((e) => {
  if (e.id !== "ns:npc") return;
  if (e.sourceType !== ScriptEventSource.NPCDialogue) return;
  const player = e.initiator;          // typings: "the entity that initiated the NPC dialogue"
  const npc = e.sourceEntity;          // the NPC
  if (player?.typeId !== "minecraft:player") return;
  if (e.message === "shop") openShop(player);   // open a script form, see templates/shop-messagebox
}, { namespaces: ["ns"] });
```

Opening dialogue from script (no stable `dialogue` API exists, so run the command from the NPC):
```js
function openScene(npc, player, scene) {
  player.addTag("ns_talk");
  try { npc.runCommand(`dialogue open @s @a[tag=ns_talk,c=1] ${scene}`); }
  finally { player.removeTag("ns_talk"); }
}
```
A tag avoids quoting problems with player names that contain spaces. Script `runCommand` runs synchronously in 2.x.

## When to use NPC dialogue

| Good fit | Poor fit |
|---|---|
| Story, quests, tutorials, characters with faces | Inputs (no text fields, sliders, toggles) |
| Map-making with command blocks and no scripts | Dynamic lists (shops with many items) |
| Short choice trees | Anything per-player that must change every second |

Typical hybrid: NPC dialogue for the conversation, a `/scriptevent` button that opens an ActionForm shop or a CustomForm quest log.

## Tools

- DialogueDesigner (community web tool by JannisX11, linked from Learn): visual scene editor, exports `dialogue/*.json`. Community-made; check its output against the table above.
- The in-game NPC editor (creative, interact with an NPC) edits the same dialogue and button commands, but changes live in the world, not your pack.

## Pitfalls

- Scene tags are global across packs: prefix them (`ns_...`).
- The NPC must be loaded. For "pop-up" dialogue far from spawn, keep a hidden NPC near the player or in a ticking area.
- Players in creative can edit vanilla-style NPCs by interacting. For custom NPC entities, test what interaction does in each game mode before shipping.
- Commands in scenes run with the NPC as source and normal command permissions; keep them simple and push logic into script via `/scriptevent`.
