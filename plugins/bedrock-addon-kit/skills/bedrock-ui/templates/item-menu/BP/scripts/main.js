// Multi-page ActionForm menu opened by an item (ns:guide_book), a slash command (/ns:menu)
// and /scriptevent ns:menu <page>. Needs ./ui/forms.js from templates/form-helper.
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0.

import {
  CommandPermissionLevel,
  CustomCommandStatus,
  ItemStack,
  system,
  world,
} from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { openLater, showForm } from "./ui/forms.js";

// ---------- pages ----------
// A page is a function (player, arg) -> { title, body, buttons: [{ text, icon?, go?, run? }] }.
// go: next page id ("main", "help:2"), run: action before going. No go = close the menu.

const TIPS = Array.from({ length: 23 }, (_, i) => `Tip ${i + 1}: replace with your own text.`);
const TIPS_PER_PAGE = 8;

const PAGES = {
  main: (player) => ({
    title: { translate: "ns.menu.title" },
    body: { translate: "ns.menu.body", with: [player.name] },
    buttons: [
      { text: "Player info", icon: "textures/items/book_normal", go: "info" },
      { text: "Tools", icon: "textures/items/compass_item", go: "tools" },
      { text: "Tips", icon: "textures/items/paper", go: "tips:0" },
      { text: "Close" },
    ],
  }),

  info: (player) => {
    const l = player.location;
    return {
      title: "Player info",
      body: [
        `Dimension: ${player.dimension.id}`,
        `Position: ${Math.floor(l.x)} ${Math.floor(l.y)} ${Math.floor(l.z)}`,
        `Level: ${player.level}`,
      ].join("\n"),
      buttons: [{ text: "Back", go: "main" }],
    };
  },

  tools: () => ({
    title: "Tools",
    body: "Pick an item.",
    buttons: [
      { text: "Compass", icon: "textures/items/compass_item", run: give("minecraft:compass"), go: "tools" },
      { text: "Clock", icon: "textures/items/clock_item", run: give("minecraft:clock"), go: "tools" },
      { text: "Back", go: "main" },
    ],
  }),

  // Paged list: "tips:<page>"
  tips: (_player, arg) => {
    const page = Math.max(0, Number(arg) || 0);
    const pages = Math.ceil(TIPS.length / TIPS_PER_PAGE);
    const slice = TIPS.slice(page * TIPS_PER_PAGE, (page + 1) * TIPS_PER_PAGE);
    const buttons = [];
    if (page > 0) buttons.push({ text: "< Previous", go: `tips:${page - 1}` });
    if (page < pages - 1) buttons.push({ text: "Next >", go: `tips:${page + 1}` });
    buttons.push({ text: "Back", go: "main" });
    return { title: `Tips (${page + 1}/${pages})`, body: slice.join("\n\n"), buttons };
  },
};

function give(typeId) {
  return (player) => {
    const inv = player.getComponent("minecraft:inventory")?.container;
    const left = inv?.addItem(new ItemStack(typeId, 1));
    if (left) player.dimension.spawnItem(left, player.location); // inventory full: drop it
    player.playSound("random.pop");
  };
}

// ---------- router ----------
// One loop instead of nested awaits: each iteration shows one page.
export async function openMenu(player, start = "main") {
  let next = start;
  for (let guard = 0; next && guard < 50; guard++) {
    const [id, arg] = next.split(":");
    const build = PAGES[id];
    if (!build) return;
    const page = build(player, arg);

    const form = new ActionFormData().title(page.title).body(page.body ?? "");
    for (const b of page.buttons) form.button(b.text, b.icon);

    const r = await showForm(player, form);
    if (!r || r.canceled || r.selection === undefined) return; // closed, busy too long, or left
    if (!player.isValid) return;

    const choice = page.buttons[r.selection];
    if (!choice) return;
    try { choice.run?.(player); } catch (e) { console.warn(`[ns:menu] ${e}`); }
    next = choice.go;
  }
}

// ---------- entry points ----------
system.beforeEvents.startup.subscribe((init) => {
  // 1. Item: custom component on ns:guide_book. Callbacks are read-only, so defer.
  init.itemComponentRegistry.registerCustomComponent("ns:open_menu", {
    onUse(e, { params }) {
      const page = typeof params?.page === "string" ? params.page : "main";
      openLater(e.source, (p) => openMenu(p, page));
    },
  });

  // 2. Slash command: /ns:menu. Chat is still open, so the first show is UserBusy; forms.js retries.
  init.customCommandRegistry.registerCommand(
    {
      name: "ns:menu",
      description: "Open the guide menu",
      permissionLevel: CommandPermissionLevel.Any,
      cheatsRequired: false,
    },
    (origin) => {
      const player = origin.sourceEntity;
      if (player?.typeId !== "minecraft:player") {
        return { status: CustomCommandStatus.Failure, message: "Run this as a player." };
      }
      openLater(player, (p) => openMenu(p));
      return { status: CustomCommandStatus.Success };
    },
  );
});

// 3. /scriptevent ns:menu <page>  (command blocks, functions, NPC buttons)
system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:menu") return;
    const player = e.initiator ?? e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    openMenu(player, e.message || "main").catch((err) => console.warn(`[ns:menu] ${err}`));
  },
  { namespaces: ["ns"] },
);

// 4. Give the book on first join (optional).
world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (!initialSpawn || player.getDynamicProperty("ns:got_guide")) return;
  player.setDynamicProperty("ns:got_guide", true);
  player.getComponent("minecraft:inventory")?.container?.addItem(new ItemStack("ns:guide_book", 1));
});
