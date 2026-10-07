// Shop: ActionForm item list -> MessageBox confirm -> re-check and buy.
// Opened by interacting with an ns:shopkeeper entity or a block with the ns:shop custom component.
// Needs ./ui/forms.js from templates/form-helper. Import this file from main.js: import "./shop.js";
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import { ItemStack, system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { confirm, openLater, showForm } from "./ui/forms.js";

const COINS = "ns:coins"; // player dynamic property (number)

const STOCK = [
  { id: "bread", item: "minecraft:bread", count: 4, price: 5, icon: "textures/items/bread", name: "Bread x4" },
  { id: "apple", item: "minecraft:golden_apple", count: 1, price: 40, icon: "textures/items/apple_golden", name: "Golden apple" },
  { id: "sword", item: "minecraft:diamond_sword", count: 1, price: 120, icon: "textures/items/diamond_sword", name: "Diamond sword" },
];

export function getCoins(player) {
  const v = player.getDynamicProperty(COINS);
  return typeof v === "number" ? v : 0;
}
function setCoins(player, n) {
  player.setDynamicProperty(COINS, Math.max(0, Math.floor(n)));
}

export async function openShop(player) {
  for (;;) {
    const coins = getCoins(player);
    const form = new ActionFormData()
      .title("Shop")
      .body(`You have §e${coins}§r coins.`);
    for (const s of STOCK) {
      const color = coins >= s.price ? "§2" : "§c";
      form.button(`${s.name}\n${color}${s.price} coins`, s.icon);
    }
    form.button("Close");

    const r = await showForm(player, form);
    if (!r || r.canceled || r.selection === undefined || r.selection >= STOCK.length) return;
    if (!player.isValid) return;

    const offer = STOCK[r.selection];
    const ok = await confirm(
      player,
      "Confirm purchase",
      `Buy ${offer.name} for ${offer.price} coins?`,
      "Buy",
      "Cancel",
    );
    if (!player.isValid) return;
    if (ok) buy(player, offer);
    // loop: show the shop again with the new balance
  }
}

// All checks again after the confirm (time passed), then one synchronous block.
function buy(player, offer) {
  const coins = getCoins(player);
  if (coins < offer.price) {
    player.sendMessage(`§cNot enough coins (${coins}/${offer.price}).`);
    player.playSound("note.bass");
    return;
  }
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv || inv.emptySlotsCount === 0) {
    player.sendMessage("§cYour inventory is full.");
    return;
  }
  setCoins(player, coins - offer.price);
  const left = inv.addItem(new ItemStack(offer.item, offer.count));
  if (left) player.dimension.spawnItem(left, player.location);
  player.sendMessage(`§aBought ${offer.name}.`);
  player.playSound("random.orb");
}

// ---------- entry points ----------

// Entity: cancel the vanilla interaction for our shopkeeper, then open in the next tick.
world.beforeEvents.playerInteractWithEntity.subscribe((e) => {
  if (e.target.typeId !== "ns:shopkeeper") return;
  e.cancel = true;
  openLater(e.player, openShop);
});

// Block: add "ns:shop": {} to a custom block's components.
system.beforeEvents.startup.subscribe((init) => {
  init.blockComponentRegistry.registerCustomComponent("ns:shop", {
    onPlayerInteract(e) {
      if (e.player) openLater(e.player, openShop);
    },
  });
});

// Demo income so the shop can be tested: /scriptevent ns:coins 100
system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:coins") return;
    const player = e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    setCoins(player, getCoins(player) + (Number(e.message) || 0));
    player.sendMessage(`Coins: ${getCoins(player)}`);
  },
  { namespaces: ["ns"] },
);
