// The Redstone Noise Maker block (0.1.371; rules equipment/noiseRules.js). Anyone may place it anywhere. "noisemakers"
// keeps { id: posKey, noise } for each one set to something other than a cow. Nothing else in the world changes.
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { posKey } from "../core/ids.js";
import { reportError } from "../core/log.js";
import { runLater } from "../park/park.js";
import { show } from "../ui/forms.js";
import { NOISE_BLOCK, DEFAULT_NOISE, NOISES, noiseOf, withNoise, risingEdge, pitchOf, noiseMenu } from "./noiseRules.js";

const COL = "noisemakers";
const keyOf = (b) => posKey(b.dimension.id, { x: b.x, y: b.y, z: b.z });
const recOf = (id) => db.get(COL, id) ?? { id, noise: DEFAULT_NOISE };

function play(dimension, pos, id) {
  const g = BALANCE.noiseMaker;
  try {
    dimension.playSound(noiseOf(recOf(id).noise).sound, { x: pos.x + 0.5, y: pos.y + 0.5, z: pos.z + 0.5 }, { volume: g.volume, pitch: pitchOf(Math.random, g) });
    dimension.spawnParticle("minecraft:note_particle", { x: pos.x + 0.5, y: pos.y + 1.2, z: pos.z + 0.5 });
  } catch {
    // unloaded
  }
}

async function menu(player, dimension, pos, id) {
  const m = noiseMenu(recOf(id));
  const form = new ActionFormData().title("Redstone Noise Maker").body(m.body);
  for (const b of m.buttons) form.button(b);
  const got = await show(player, form);
  if (got?.selection === undefined) return;
  try {
    if (dimension.getBlock(pos)?.typeId !== NOISE_BLOCK) return; // broken while the menu was open
  } catch {
    return;
  }
  if (got.selection > 0) db.put(COL, withNoise(recOf(id), NOISES[got.selection - 1].key));
  play(dimension, pos, id);
}

export function noiseMakerComponent() {
  return {
    onPlayerInteract(e) {
      const b = e.block;
      const player = e.player;
      if (!player) return;
      const dimension = b.dimension;
      const pos = { x: b.x, y: b.y, z: b.z };
      const id = keyOf(b);
      runLater(() => menu(player, dimension, pos, id).catch((error) => reportError("noise maker", error)));
    },
    onRedstoneUpdate(e) {
      if (!risingEdge(e.powerLevel, e.previousPowerLevel)) return;
      const b = e.block;
      const dimension = b.dimension;
      const pos = { x: b.x, y: b.y, z: b.z };
      const id = keyOf(b);
      runLater(() => play(dimension, pos, id));
    },
    onPlayerBreak(e) {
      const id = keyOf(e.block);
      runLater(() => db.remove(COL, id));
    },
  };
}

/** For the test server: set and play the one at a spot. */
export function noiseTry(dimension, pos, key) {
  const id = posKey(dimension.id, pos);
  if (key) db.put(COL, withNoise(recOf(id), key));
  play(dimension, pos, id);
  return recOf(id);
}
