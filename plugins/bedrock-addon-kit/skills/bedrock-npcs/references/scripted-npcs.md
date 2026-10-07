# Scripted NPCs (custom entity + script forms)

Checked against the stable `@minecraft/server` 2.10.0 and `@minecraft/server-ui` 2.2.0 typings and the Learn entity reference tables in `../../bedrock-json-reference/references/`. Form APIs are covered in depth in `../../bedrock-ui/references/script-forms.md` and `ddui-customform.md`; this file covers the NPC around them. Working code: `templates/quest-giver` and `templates/shopkeeper`.

## The entity

A scripted NPC is a normal custom entity **without** `minecraft:npc` (so interacting never opens the vanilla NPC editor or dialogue) and with an interaction script can hook.

```json
"components": {
  "minecraft:type_family": { "family": [ "ns_npc", "mob" ] },
  "minecraft:health": { "value": 20, "max": 20 },
  "minecraft:collision_box": { "width": 0.6, "height": 1.9 },
  "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": "no" } },
  "minecraft:fire_immune": {},
  "minecraft:persistent": {},
  "minecraft:physics": {},
  "minecraft:nameable": { "allow_name_tag_renaming": false, "always_show": true },
  "minecraft:loot": { "table": "loot_tables/empty.json" },
  "minecraft:behavior.look_at_player": { "priority": 7, "look_distance": 8, "look_time": { "min": 2, "max": 4 } },
  "minecraft:interact": {
    "interactions": [ {
      "interact_text": "action.interact.ns.talk",
      "swing": false,
      "cooldown": 0.5,
      "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" }, "event": "ns:interacted", "target": "self" }
    } ]
  }
},
"events": { "ns:interacted": {} }
```

| Need | Component | Notes |
|---|---|---|
| Invulnerable | `minecraft:damage_sensor` `{ "triggers": { "cause": "all", "deals_damage": "no" } }` | `deals_damage` is a string: `yes`, `no`, `no_but_side_effects_apply`, `no_but_entity_effects_apply`. Add `minecraft:fire_immune` too (vanilla NPC does) |
| Players can't hurt it, mobs can | `damage_sensor` trigger with `on_damage.filters` `is_family other player` and `deals_damage: "no"` | See `templates/patrol-guard` |
| Never despawns | `minecraft:persistent` (`{}`) | Schema stricter at 1.26.40. Don't add `minecraft:despawn` |
| Not pushable | Leave out `minecraft:pushable_by_entity` and `minecraft:pushable_by_block` | Since 1.26.10 these replace `minecraft:pushable` (no longer parsed). Add `minecraft:knockback_resistance { "value": 1 }` for a shop counter NPC |
| Gravity and collisions | `minecraft:physics` (`has_gravity`, `has_collision`, `push_towards_closest_space`) | Without it the entity floats and passes through blocks |
| Stays in place | No movement goals, or `minecraft:movement { "value": 0 }` | `look_at_player` still turns the head |
| Faces the player | `minecraft:behavior.look_at_player` (`look_distance`, `look_time {min,max}`, `probability`, `angle_of_view_horizontal`) | `min_look_time` / `max_look_time` are deprecated since 1.26.0. Script: `npc.lookAt(player.getHeadLocation())` when talking starts |
| Touch-screen label | `interact_text` in the interaction | A lang key, as vanilla uses (`action.interact.*`) |
| Name above the head | `minecraft:nameable { "always_show": true }` plus a name tag | `entity.nameTag = "..."` in script; it is plain text, not a lang key |
| Villager voice | RP `sounds.json` `entity_sounds.entities["ns:x"].events` = `mob.villager.idle` / `hit` / `death`, plus BP `minecraft:ambient_sound_interval` | Vanilla sound events need no audio files |

`minecraft:interact` at 1.26.50: `interactions`, `spawn_entities` and `play_sounds` take arrays only; `swing` defaults to `true` since 1.26.0.

## Hooking the interaction

```js
import { world } from "@minecraft/server";

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (target.typeId !== "ns:quest_giver") return;
  target.triggerEvent("ns:start_talking");      // optional: freeze wandering (see below)
  target.lookAt(player.getHeadLocation());
  talk(player).finally(() => { /* re-find the NPC by id, then ns:stop_talking */ });
});
```

| Event (stable 2.10.0) | Fields | Use |
|---|---|---|
| `world.afterEvents.playerInteractWithEntity` | `player`, `target`, `itemStack?`, `beforeItemStack?` | Writable context: open forms directly |
| `world.beforeEvents.playerInteractWithEntity` | `player`, `target`, `itemStack?`, `cancel` | Cancel the vanilla action (feeding, trading, name tags). Read-only: open the form in `system.run` |
| `world.afterEvents.dataDrivenEntityTrigger` | `entity`, `eventId`, `getModifiers()`; options `entityTypes`, `eventTypes` | Sees `ns:interacted` from JSON, but carries no player |

The typings only say the after-event "fires when a player interacts with an entity". Whether it fires for an entity with no `minecraft:interact` is not documented, so the templates add one (unverified either way; test both if you care).

## Dialogue trees with forms

| Form | Best for | Result |
|---|---|---|
| `ActionFormData` | The conversation root, topic lists, quest lists | `selection` (0-based, buttons only) |
| `MessageFormData` | Accept / decline, confirm | `selection` 0 = `button1`, 1 = `button2` |
| `ModalFormData` | Quantity sliders, name entry | `formValues` in control order |
| `CustomForm` (DDUI) | A screen that updates while open: live balance, a quest log that ticks | Observables, callbacks; see `ddui-customform.md` |

Pattern (`templates/quest-giver/BP/scripts/ns_quests/ui.js`):
1. One async function per node (`talk`, `offer`, `remind`, `finish`). A node shows one form, awaits it, re-checks `player.isValid`, then calls the next node or returns to its parent's loop.
2. Build buttons and a parallel `actions` array together; never hard-code indexes.
3. Treat `canceled` as "back". `UserBusy` is retried by the form helper; `FormRejectError` (player left) resolves to `undefined`.
4. Do state changes in synchronous functions called after the last await (`accept`, `turnIn`), so nothing changes between the check and the write.
5. Use `body` for the NPC's line and `title` for its name. For a portrait, use NPC dialogue instead (`vanilla-npc-and-dialogue.md`) or a CustomForm `image()`.

## Per-player conversation state

- Store it on the **player**: `player.setDynamicProperty("ns:npc_state", JSON.stringify(obj))`. Key by quest or NPC id, never by `player.name`.
- One NPC talking to many players: keep no per-player state on the NPC entity. If an NPC must remember players (for example "met before"), store `{ [playerId]: ... }` on the NPC or in a world property, and bound its size.
- String dynamic properties cap at 32,767 bytes; see `quests.md` for versioning and chunking.
- Tags (`player.addTag("ns_met_guide")`) are fine for simple flags that commands also read.

## Freezing a wandering NPC while it talks

Put the movement goals in a group (`ns:wander`) and swap it for a `ns:talking` group on `ns:start_talking`. The talking group holds a high-priority `look_at_player` and a one-shot `minecraft:timer` (`time` is `{min,max}` at 1.26.50) that fires `ns:stop_talking` as a safety net if the script never does. Don't remove a base component to freeze; removing a group doesn't restore what it overrode (`../../bedrock-entity-behavior/SKILL.md`).

## Names

| Want | Do |
|---|---|
| Name in the spawn egg and kill messages | RP lang `entity.ns:x.name=...`, `item.spawn_egg.entity.ns:x.name=...` |
| Floating name | `nameTag` set on `entitySpawn`, plus `nameable.always_show` |
| Localized floating name | Not possible with `nameTag` (plain string). Use a world text primitive (`../../bedrock-ui/references/hud-and-text.md`) or accept one language |
| Name inside forms | Any `RawMessage` (`{ translate: "ns.npc.name" }`) |

## Common mistakes

- Using `minecraft:npc` on a scripted NPC: creative operators get the NPC editor instead of your form.
- Opening a form from `beforeEvents.playerInteractWithEntity` without `system.run`: read-only context, the call throws.
- Holding the `Entity` object across a long await: re-find it with `world.getEntity(id)` and check `isValid`.
- Forgetting `minecraft:persistent` on an NPC placed in a remote village.
- Making NPCs "immune" with huge `minecraft:health` instead of a damage sensor: enough damage still kills them.
