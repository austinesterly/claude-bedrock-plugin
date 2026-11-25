// The contest flyer (0.1.380; rules residents/contestRules.js): used, it shows what it reads.
import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { reportError } from "../core/log.js";
import { show } from "../ui/forms.js";
import { FLYER_TEXT } from "../residents/contestRules.js";

async function flyerPage(player) {
  const [head, ...rest] = FLYER_TEXT;
  const last = rest.pop();
  const form = new ActionFormData().title("Contest Flyer").body([`§l${head}§r`, "", ...rest, "", `§c§l${last}§r`].join("\n")).button("Close");
  await show(player, form);
}

/** The item's use: "zoocraft:contest_flyer". */
export function flyerComponent() {
  return {
    onUse(e) {
      const player = e.source;
      if (player?.typeId !== "minecraft:player") return;
      system.runTimeout(() => flyerPage(player).catch((error) => reportError("contest flyer", error)), 1);
    },
  };
}
