import { system } from "@minecraft/server";
import { onlinePlayers, biomeAt } from "../platform/mc.js";
import { meadowStep } from "./meadowRules.js";
import { NAME, MOTE, inGlade, gladeAmbience, gladeMotes } from "./gladeRules.js";

// The Mythical Glade's feel (0.1.147; the rules are in world/gladeRules.js). Every 20 ticks, for each player: whether
// they stand in the glade's biome, and while they do: motes drifting round them, an amethyst chime now and then, and
// its name on screen on walking in (again only after 2 minutes out: the End patches' rule, meadowRules.js meadowStep).
// The biome's own sky, fog, water and grass colours need nothing from here; the Places page finds it (world/places.js).

const state = new Map(); // player id -> { in, miss, left, last }

/** @param {import("@minecraft/server").Player} player @param {number} now */
function step(player, now) {
  let s = state.get(player.id);
  if (!s) {
    s = { in: "", miss: 0, left: -Infinity, last: "" };
    state.set(player.id, s);
  }
  const d = player.dimension;
  const loc = player.location;
  const next = meadowStep(s, inGlade(d.id, biomeAt(d, loc)?.id) ? "mythical_glade" : "", now);
  Object.assign(s, { in: next.in, miss: next.miss, left: next.left, last: next.last });
  if (!next.in) return;
  if (next.title) player.onScreenDisplay.setTitle(`§d${NAME}`, { subtitle: "§7The Overworld", fadeInDuration: 10, stayDuration: 50, fadeOutDuration: 20 });
  for (const p of gladeMotes(loc, Math.random)) {
    try {
      d.spawnParticle(MOTE, p);
    } catch {
      // out of the loaded area
    }
  }
  const a = gladeAmbience(Math.random);
  if (a) player.playSound(a.sound, { volume: a.volume, pitch: a.pitch });
}

export function tickGlade() {
  const now = system.currentTick;
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      step(player, now);
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}
