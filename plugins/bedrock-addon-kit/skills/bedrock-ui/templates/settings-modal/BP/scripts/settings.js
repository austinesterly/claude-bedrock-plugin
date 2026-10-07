// Per-player settings screen: ModalFormData with defaults from, and results saved to, a player
// dynamic property (versioned JSON). Open with /scriptevent ns:settings.
// Needs ./ui/forms.js from templates/form-helper. Import from main.js: import "./settings.js";
// @minecraft/server 2.10.0, @minecraft/server-ui 2.2.0 (2.x option-object signatures).

import { system } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { showForm, valuesByKey } from "./ui/forms.js";

const KEY = "ns:settings";
const VERSION = 1;
const HUD_STYLES = ["Compact", "Detailed", "Off"];

const DEFAULTS = Object.freeze({
  showHud: true,
  hudStyle: 0,     // index into HUD_STYLES
  volume: 80,      // 0-100
  nickname: "",
  confirmBuys: true,
});

/** Settings for a player, merged over defaults. Cheap: cache it if you call it every tick. */
export function getSettings(player) {
  try {
    const raw = player.getDynamicProperty(KEY);
    if (typeof raw !== "string") return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...(parsed?.data ?? {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(player, s) {
  player.setDynamicProperty(KEY, JSON.stringify({ v: VERSION, data: s }));
}

// Validation on the server side: never trust form values blindly.
function clean(input, prev) {
  const s = { ...prev };
  if (typeof input.showHud === "boolean") s.showHud = input.showHud;
  if (typeof input.hudStyle === "number") s.hudStyle = Math.min(HUD_STYLES.length - 1, Math.max(0, Math.floor(input.hudStyle)));
  if (typeof input.volume === "number") s.volume = Math.min(100, Math.max(0, Math.round(input.volume)));
  if (typeof input.nickname === "string") s.nickname = input.nickname.replace(/§./g, "").trim().slice(0, 16);
  if (typeof input.confirmBuys === "boolean") s.confirmBuys = input.confirmBuys;
  return s;
}

export async function openSettings(player) {
  const cur = getSettings(player);

  // Build the form and the key list together, so values are read by name.
  // No label/header/divider here: every control is an input, so indexes line up.
  const keys = [];
  const form = new ModalFormData().title("Settings");
  form.toggle("Show HUD", { defaultValue: cur.showHud });                                  keys.push("showHud");
  form.dropdown("HUD style", HUD_STYLES, { defaultValueIndex: cur.hudStyle });             keys.push("hudStyle");
  form.slider("Sound volume", 0, 100, { defaultValue: cur.volume, valueStep: 5 });         keys.push("volume");
  form.textField("Nickname (max 16)", "Leave empty for none", { defaultValue: cur.nickname }); keys.push("nickname");
  form.toggle("Confirm purchases", { defaultValue: cur.confirmBuys, tooltip: "Ask before buying in shops" }); keys.push("confirmBuys");
  form.submitButton("Save");

  const r = await showForm(player, form);
  if (!r || r.canceled || !player.isValid) return; // closed without saving
  const next = clean(valuesByKey(r, keys), cur);
  saveSettings(player, next);
  player.sendMessage("§aSettings saved.");
  player.playSound("random.click", { volume: next.volume / 100 });
}

system.afterEvents.scriptEventReceive.subscribe(
  (e) => {
    if (e.id !== "ns:settings") return;
    const player = e.sourceEntity;
    if (player?.typeId !== "minecraft:player") return;
    openSettings(player).catch((err) => console.warn(`[ns:settings] ${err}`));
  },
  { namespaces: ["ns"] },
);
