// Quest giver NPC: entry point. Imported from main.js (new-addon.mjs --add does this for you).
// Talk:   interact with ns:quest_giver (minecraft:interact makes the interaction succeed).
// Log:    /ns:quests
// Reset:  /scriptevent ns:quests reset   (testing; resets your own quest data)
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import { CommandPermissionLevel, CustomCommandStatus, ScriptEventSource, system, world } from "@minecraft/server";
import { isBusy, openLater } from "./ns_quests/forms.js";
import { QUESTS } from "./ns_quests/quests.js";
import { forget, resetState } from "./ns_quests/state.js";
import { creditKill, noteCollect } from "./ns_quests/logic.js";
import { questLog, talk } from "./ns_quests/ui.js";

const NPC_TYPE = "ns:quest_giver";
const COLLECT_ITEMS = [...new Set(Object.values(QUESTS).filter((q) => q.kind === "collect").map((q) => q.item))];

// ---------- talking ----------

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (target.typeId !== NPC_TYPE || isBusy(player)) return;
  const npcId = target.id;
  target.triggerEvent("ns:start_talking"); // stop wandering, keep eye contact
  target.lookAt(player.getHeadLocation());
  player.playSound("mob.villager.haggle");
  talk(player)
    .catch((e) => console.warn(`[ns:quests] ${e?.stack ?? e}`))
    .finally(() => {
      const npc = world.getEntity(npcId); // the NPC may have unloaded while the form was open
      if (npc?.isValid) npc.triggerEvent("ns:stop_talking");
    });
});

// Name tag for new quest givers (nameTag is plain text, not a lang key).
world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (entity.typeId === NPC_TYPE && entity.isValid && !entity.nameTag) entity.nameTag = "§eQuest Giver";
});

// ---------- progress tracking ----------

// Kills: credit the player who dealt the killing blow (arrows report their shooter as damagingEntity).
world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
  const killer = damageSource.damagingEntity;
  if (killer?.typeId !== "minecraft:player" || !killer.isValid) return;
  creditKill(killer, deadEntity.typeId);
});

// Collects: only show progress; the count is read live at turn-in.
world.afterEvents.playerInventoryItemChange.subscribe(
  ({ player, itemStack }) => {
    if (itemStack && COLLECT_ITEMS.includes(itemStack.typeId)) noteCollect(player, itemStack.typeId);
  },
  { includeItems: COLLECT_ITEMS },
);

world.afterEvents.playerLeave.subscribe(({ playerId }) => forget(playerId));

// ---------- commands ----------

system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerCommand(
    { name: "ns:quests", description: "Open your quest log", permissionLevel: CommandPermissionLevel.Any, cheatsRequired: false },
    (origin) => {
      const player = origin.sourceEntity;
      if (player?.typeId !== "minecraft:player") return { status: CustomCommandStatus.Failure, message: "Run this as a player." };
      openLater(player, questLog); // the callback is read-only; the helper defers and retries UserBusy
      return { status: CustomCommandStatus.Success };
    },
  );
});

system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:quests" || e.message !== "reset") return;
    const player = e.sourceType === ScriptEventSource.NPCDialogue ? e.initiator : e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    resetState(player);
    player.sendMessage("§7Quest data reset.");
  },
  { namespaces: ["ns"] },
);
