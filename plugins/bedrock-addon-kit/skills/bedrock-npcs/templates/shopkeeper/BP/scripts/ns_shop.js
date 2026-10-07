// Vendor NPC shop: entry point. Imported from main.js (new-addon.mjs --add does this for you).
// Shop:   interact with ns:vendor
// Coins:  /ns:coins <players> <amount>   (operators; negative amounts take coins away)
// Other entry points (a block, an item, an NPC dialogue button) can import openShop from ./ns_shop/ui.js.
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import {
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus,
  DisplaySlotId,
  system,
  world,
} from "@minecraft/server";
import { isBusy } from "./ns_shop/forms.js";
import { openShop } from "./ns_shop/ui.js";
import { CURRENCY, earn, initWallet, pay } from "./ns_shop/wallet.js";

const NPC_TYPE = "ns:vendor";

world.afterEvents.worldLoad.subscribe(() => {
  initWallet();
  // Show coins on the sidebar if nothing else uses it. Remove this if your map has its own sidebar.
  if (CURRENCY.mode === "score" && !world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar)) {
    world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.Sidebar, { objective: world.scoreboard.getObjective(CURRENCY.objective) });
  }
});

world.afterEvents.playerInteractWithEntity.subscribe(({ player, target }) => {
  if (target.typeId !== NPC_TYPE || isBusy(player)) return;
  target.lookAt(player.getHeadLocation());
  player.playSound("mob.villager.haggle");
  openShop(player).catch((e) => console.warn(`[ns:shop] ${e?.stack ?? e}`));
});

world.afterEvents.entitySpawn.subscribe(({ entity }) => {
  if (entity.typeId === NPC_TYPE && entity.isValid && !entity.nameTag) entity.nameTag = "§6Vendor";
});

system.beforeEvents.startup.subscribe((init) => {
  init.customCommandRegistry.registerCommand(
    {
      name: "ns:coins",
      description: "Give or take shop coins",
      permissionLevel: CommandPermissionLevel.GameDirectors,
      cheatsRequired: false,
      mandatoryParameters: [
        { name: "players", type: CustomCommandParamType.PlayerSelector },
        { name: "amount", type: CustomCommandParamType.Integer },
      ],
    },
    (origin, players, amount) => {
      if (!Number.isInteger(amount) || amount === 0) return { status: CustomCommandStatus.Failure, message: "amount must be a non-zero whole number" };
      // Command callbacks are read-only: do the writes next tick.
      system.run(() => {
        for (const p of players) {
          if (!p.isValid) continue;
          if (amount > 0) earn(p, amount);
          else if (!pay(p, -amount)) p.sendMessage("§cCouldn't take that many coins.");
        }
      });
      return { status: CustomCommandStatus.Success };
    },
  );
});
