// Live dashboard: a Data-Driven UI CustomForm whose labels and buttons update while it is open.
// Open with /scriptevent ns:dashboard. Needs ./ui/forms.js from templates/form-helper.
// Import from main.js: import "./dashboard.js";
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0 (CustomForm stable since 2.1.0).

import { system, world } from "@minecraft/server";
import {
  CustomForm,
  ObservableBoolean,
  ObservableNumber,
  ObservableString,
} from "@minecraft/server-ui";
import { closeAll, showDdui } from "./ui/forms.js";

export async function openDashboard(player) {
  // Server-written values: no options (the client can't change them).
  const timeText = new ObservableString("...");
  const healthText = new ObservableString("...");
  const nearbyText = new ObservableString("Scanning...");
  const status = new ObservableString("");
  const healDisabled = new ObservableBoolean(true);
  const nearbyVisible = new ObservableBoolean(true);

  // Player-written values: clientWritable so slider/toggle changes reach the script.
  const radius = new ObservableNumber(16, { clientWritable: true });
  const showNearby = new ObservableBoolean(true, { clientWritable: true });
  const sortMode = new ObservableNumber(0, { clientWritable: true });

  showNearby.subscribe((v) => nearbyVisible.setData(v));
  radius.subscribe((v) => status.setData(`Scan radius set to ${v} blocks`));

  const refresh = () => {
    if (!player.isValid) return;
    const t = world.getTimeOfDay(); // 0-23999
    timeText.setData(`Day ${world.getDay()}  ·  ${String(Math.floor(((t / 1000 + 6) % 24))).padStart(2, "0")}:00`);

    const hp = player.getComponent("minecraft:health");
    if (hp) {
      healthText.setData(`Health: ${Math.ceil(hp.currentValue)} / ${hp.effectiveMax}`);
      healDisabled.setData(hp.currentValue >= hp.effectiveMax);
    }

    if (showNearby.getData()) {
      const counts = new Map();
      for (const e of player.dimension.getEntities({
        location: player.location,
        maxDistance: radius.getData(),
        excludeTypes: ["minecraft:player", "minecraft:item"],
      })) {
        counts.set(e.typeId, (counts.get(e.typeId) ?? 0) + 1);
      }
      const rows = [...counts.entries()];
      if (sortMode.getData() === 0) rows.sort((a, b) => b[1] - a[1]);
      else rows.sort((a, b) => a[0].localeCompare(b[0]));
      nearbyText.setData(
        rows.length ? rows.slice(0, 8).map(([id, n]) => `${n}x ${id.replace("minecraft:", "")}`).join("\n") : "Nothing nearby",
      );
    }
  };

  refresh();
  const loop = system.runInterval(() => {
    try { refresh(); } catch (e) { console.warn(`[ns:dashboard] ${e}`); }
  }, 20);

  const build = () =>
    new CustomForm(player, "Dashboard")
      .header("World")
      .label(timeText)
      .divider()
      .header("You")
      .label(healthText)
      .button(
        "Heal me",
        () => {
          player.getComponent("minecraft:health")?.resetToMaxValue();
          status.setData("Healed.");
          refresh();
        },
        { disabled: healDisabled, tooltip: "Only when you are hurt" },
      )
      .divider()
      .header("Nearby mobs")
      .toggle("Show nearby", showNearby)
      .slider("Radius", radius, 4, 48, { step: 4, visible: nearbyVisible })
      .dropdown("Sort", sortMode, [
        { label: "By count", value: 0 },
        { label: "By name", value: 1 },
      ], { visible: nearbyVisible })
      .label(nearbyText, { visible: nearbyVisible })
      .spacer()
      .label(status)
      .closeButton();

  await showDdui(player, build, {
    onClosed: () => system.clearRun(loop), // always runs: closed, busy too long, error, player left
  });
}

system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:dashboard") return;
    const player = e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    if (e.message === "close") { closeAll(player); return; }
    openDashboard(player).catch((err) => console.warn(`[ns:dashboard] ${err}`));
  },
  { namespaces: ["ns"] },
);
