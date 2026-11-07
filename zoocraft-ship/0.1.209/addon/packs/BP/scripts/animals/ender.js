import { system } from "@minecraft/server";
import { heldItem, onlinePlayers } from "../platform/mc.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { CARRIERS } from "../data/items.js";
import { SPECIES, baitItems } from "../data/species.js";
import { allAnimals, liveEntity } from "./animals.js";
import { cellsOf } from "../exhibits/exhibits.js";
import { ENDER, nextBlink, blinkSpot, roomFor } from "./enderRules.js";
import { reportError } from "../core/log.js";

// Endermen in the zoo (0.1.209; the rules are animals/enderRules.js, research/vanilla_plan.md "0.1.209 the enderman and
// the shulker: the design"). The game walks the zoo copy (its stroll); every second, each loaded zoo enderman whose blink
// is due vanishes in a puff of purple and turns up at another spot of its own pen (the pen's last measure), with the
// game's teleport sound at both ends (mob.endermen.portal): the game's random teleports, kept inside the pen. Not while a
// player close by holds a Mob Cage or Chorus Browse.

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Dimension} Dimension */

const due = new Map(); // animal id -> the tick its next blink is due
const reported = new Set();

function tell(error) {
  const why = String(error);
  if (reported.has(why) || reported.size > 20) return;
  reported.add(why);
  reportError("ender", error);
}

/** @param {Dimension} d @param {{ x: number, y: number, z: number }} p */
function kindAt(d, p) {
  let b;
  try {
    b = d.getBlock(p);
  } catch {
    return undefined;
  }
  if (!b) return undefined;
  if (b.isAir) return "air";
  if (b.isLiquid) return "liquid";
  if (PASSABLE_PATTERNS.some((r) => r.test(b.typeId))) return "passable";
  return "solid";
}

// The portal puff up its body and the game's teleport sound.
/** @param {Dimension} d @param {{ x: number, y: number, z: number }} at */
function fx(d, at) {
  for (const up of [0.4, 1.4, 2.4]) {
    try {
      d.spawnParticle("minecraft:mob_portal", { x: at.x, y: at.y + up, z: at.z });
    } catch {
      // cosmetic only
    }
  }
  try {
    d.playSound("mob.endermen.portal", at, { volume: 0.6, pitch: 1 });
  } catch {
    // cosmetic only
  }
}

/** @param {Entity} e @param {string} speciesId */
function held(e, speciesId) {
  const hold = new Set([CARRIERS.mob.empty, CARRIERS.mob.occupied, ...baitItems(SPECIES[speciesId])]);
  for (const p of onlinePlayers()) {
    try {
      if (p.dimension.id !== e.dimension.id || !hold.has(heldItem(p)?.typeId ?? "")) continue;
      const a = p.location, b = e.location;
      if (Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z) < ENDER.holdDist) return true;
    } catch {
      // gone
    }
  }
  return false;
}

/** @param {Entity} e @param {string} exId @param {string} speciesId */
function blink(e, exId, speciesId) {
  const cells = cellsOf(exId);
  if (!cells || held(e, speciesId)) return;
  const d = e.dimension;
  const from = e.location;
  const at = { x: Math.floor(from.x), y: Math.floor(from.y), z: Math.floor(from.z) };
  const fits = (/** @type {{ x: number, y: number, z: number }} */ c) => roomFor(Array.from({ length: ENDER.body }, (_, i) => kindAt(d, { x: c.x, y: c.y + i, z: c.z })), kindAt(d, { x: c.x, y: c.y - 1, z: c.z }));
  const spot = blinkSpot(cells, at, fits);
  if (!spot) return;
  const to = { x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 };
  fx(d, from);
  e.teleport(to, { keepVelocity: false });
  fx(d, to);
}

// Every second: each loaded zoo enderman in its exhibit.
export function tickEndermen() {
  const now = system.currentTick;
  const live = new Set();
  for (const a of allAnimals()) {
    if (!SPECIES[a.speciesId]?.enderBlink || a.location.kind !== "exhibit" || a.outside) continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    live.add(a.id);
    const when = due.get(a.id);
    if (when === undefined) {
      due.set(a.id, nextBlink(now)); // met (again): its first blink a while on
      continue;
    }
    if (now < when) continue;
    due.set(a.id, nextBlink(now));
    try {
      blink(e, a.location.id, a.speciesId);
    } catch (error) {
      tell(error);
    }
  }
  for (const id of [...due.keys()]) if (!live.has(id)) due.delete(id);
}
