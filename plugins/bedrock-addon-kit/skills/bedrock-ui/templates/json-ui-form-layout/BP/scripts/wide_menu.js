// Opens an ActionForm whose title carries the invisible marker "§v§w".
// With RP/ui from this template: drawn in the wide, gold-title layout.
// Without it (or if JSON UI breaks): the normal vanilla form, same buttons, same behavior.
// Open with /scriptevent ns:wide. Needs ./ui/forms.js from templates/form-helper.
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import { system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { showForm } from "./ui/forms.js";

// Keep the marker in code, outside translated text. §v-§z have no visible effect.
export const WIDE = "§v§w";

export async function openWideMenu(player) {
  const form = new ActionFormData()
    .title(WIDE + "Wide menu") // plain string: the binding sees exactly this text
    .body("Same ActionFormData as always; only the resource pack layout differs.")
    .button("Diamonds", "textures/items/diamond")
    .button("Emeralds", "textures/items/emerald")
    .button("Close");
  const r = await showForm(player, form);
  if (!r || r.canceled) return;
  player.sendMessage(`You picked button ${r.selection}`);
}

system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:wide") return;
    const player = e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    openWideMenu(player).catch((err) => console.warn(`[ns:wide] ${err}`));
  },
  { namespaces: ["ns"] },
);
