// NPC dialogue <-> script bridge. Scenes are in BP/dialogue/ns_guide.json.
// The NPC entity needs "minecraft:npc" and the "npc" type family (or use the vanilla minecraft:npc).
// Import from main.js: import "./npc.js";  The shop needs templates/shop-messagebox.
// @minecraft/server 2.10.0.

import { ScriptEventSource, system } from "@minecraft/server";
import { openShop } from "./shop.js";

/** Open a dialogue scene for one player, spoken by `npc`. There is no stable dialogue API, so use the command. */
export function openScene(npc, player, sceneTag) {
  if (!npc?.isValid || !player?.isValid) return false;
  const tag = "ns_dialogue_target";
  player.addTag(tag);
  try {
    // A tag avoids quoting player names that contain spaces.
    return npc.runCommand(`dialogue open @s @a[tag=${tag},c=1] ${sceneTag}`).successCount > 0;
  } catch (e) {
    console.warn(`[ns:npc] ${e}`);
    return false;
  } finally {
    player.removeTag(tag);
  }
}

// Buttons in scene files run "/scriptevent ns:npc <action>".
system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:npc" || e.sourceType !== ScriptEventSource.NPCDialogue) return;
    const player = e.initiator; // the player using the dialogue
    if (player?.typeId !== "minecraft:player") return;
    switch (e.message) {
      case "shop":
        openShop(player).catch((err) => console.warn(`[ns:npc] ${err}`));
        break;
      default:
        console.warn(`[ns:npc] unknown action "${e.message}"`);
    }
  },
  { namespaces: ["ns"] },
);
