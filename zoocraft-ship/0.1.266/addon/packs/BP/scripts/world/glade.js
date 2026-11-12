import { system, BlockVolume } from "@minecraft/server";
import { onlinePlayers, biomeAt } from "../platform/mc.js";
import { meadowStep } from "./meadowRules.js";
import { MOTE, CRYSTALS, STRAIGHTEN_RANGE, STRAIGHTEN_HEIGHT, inGlade, gladeAmbience, gladeMotes, lyingCrystal } from "./gladeRules.js";

// The Mythical Glade's feel (0.1.147; the rules are in world/gladeRules.js). Every 20 ticks, for each player: whether
// they stand in the glade's biome, and while they do: motes drifting round them and an amethyst chime now and then.
// (0.1.266: its name no longer shows on screen on walking in: Austin wants no titles, ever; the Field Journal's line in the
// chat on finding it stays.)
// The biome's own sky, fog, water and grass colours need nothing from here; the Places page finds it (world/places.js).
// Since 0.1.154 it also stands up the amethyst buds and clusters the game had laid on their sides (straighten).

const state = new Map(); // player id -> { in, miss, left, last, straightAt }

/** @param {import("@minecraft/server").Player} player @param {number} now */
function step(player, now) {
  let s = state.get(player.id);
  if (!s) {
    s = { in: "", miss: 0, left: -Infinity, last: "", straightAt: 0 };
    state.set(player.id, s);
  }
  const d = player.dimension;
  const loc = player.location;
  const next = meadowStep(s, inGlade(d.id, biomeAt(d, loc)?.id) ? "mythical_glade" : "", now);
  Object.assign(s, { in: next.in, miss: next.miss, left: next.left, last: next.last });
  if (!next.in) return;
  for (const p of gladeMotes(loc, Math.random)) {
    try {
      d.spawnParticle(MOTE, p);
    } catch {
      // out of the loaded area
    }
  }
  const a = gladeAmbience(Math.random);
  if (a) player.playSound(a.sound, { volume: a.volume, pitch: a.pitch });
  if (now >= s.straightAt) {
    s.straightAt = now + 100;
    try {
      straighten(d, loc);
    } catch {
      // part of the box not loaded: next time
    }
  }
}

// The buds and clusters round a player in the glade that the game laid on their sides (made before 0.1.154: the
// features turned them to face west), stood up as the patches meant them. One box of 33 x 13 x 33 blocks every 5
// seconds; only the four amethyst crystals are read.
/** @param {import("@minecraft/server").Dimension} d @param {import("@minecraft/server").Vector3} loc */
function straighten(d, loc) {
  const x = Math.floor(loc.x), y = Math.floor(loc.y), z = Math.floor(loc.z);
  const from = { x: x - STRAIGHTEN_RANGE, y: y - STRAIGHTEN_HEIGHT, z: z - STRAIGHTEN_RANGE };
  const to = { x: x + STRAIGHTEN_RANGE, y: y + STRAIGHTEN_HEIGHT, z: z + STRAIGHTEN_RANGE };
  const found = d.getBlocks(new BlockVolume(from, to), { includeTypes: CRYSTALS }, false);
  for (const at of found.getBlockLocationIterator()) {
    const b = d.getBlock(at);
    if (!b) continue;
    if (!lyingCrystal(b.typeId, b.permutation.getState("minecraft:block_face"), b.below()?.typeId, b.east()?.typeId)) continue;
    b.setPermutation(b.permutation.withState("minecraft:block_face", "up"));
  }
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
