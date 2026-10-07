// Example wiring for ui/hud.js. @minecraft/server 2.10.0.
import { world, HudElement, HudVisibility } from "@minecraft/server";
import { addHudProvider, announce, hudFlash, startHud } from "./ui/hud.js";

const DIRS = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];

// Facing: y rotation 0 = south in Bedrock.
addHudProvider("facing", (p) => {
  const yaw = ((p.getRotation().y % 360) + 360) % 360;
  return `§b${DIRS[Math.round(yaw / 45) % 8]}`;
}, 10);

// Coins from a player dynamic property (see templates/shop-messagebox).
addHudProvider("coins", (p) => {
  const c = p.getDynamicProperty("ns:coins");
  return typeof c === "number" ? `§e${c} coins` : "";
}, 20);

// Localized segment as a RawMessage.
addHudProvider("level", (p) => ({ translate: "ns.hud.level", with: [String(p.level)] }), 30);

world.afterEvents.worldLoad.subscribe(() => startHud());

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  // Undo HUD hiding left over from a cutscene that was interrupted by a crash or leave.
  player.onScreenDisplay.resetHudElementsVisibility();
  if (initialSpawn) announce(player, "§6Welcome", "Have fun!");
});

// Example: hide hunger in a minigame area, show a flash message.
export function enterArena(player) {
  player.onScreenDisplay.setHudVisibility(HudVisibility.Hide, [HudElement.Hunger]);
  hudFlash(player, "§cArena: hunger disabled", 60);
}
export function leaveArena(player) {
  player.onScreenDisplay.setHudVisibility(HudVisibility.Reset, [HudElement.Hunger]);
}
