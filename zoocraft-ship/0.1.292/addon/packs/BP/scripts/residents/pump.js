// The Volatile Pump (0.1.292; Austin's NPC #22 spec, section 6; the rules: residents/voidRules.js, the numbers:
// data/balance.js `void.pump`). Made from the Voidologist Core, which only Chasm gives, once, at 100 friendship.
//
// It can be set down only in the End, and a player has one at a time: their pump's record is filed under their own
// id (collection "void", `pump:<player id>`) with its place, its progress and what it has stored, so leaving the
// End, the world or the game changes nothing. While its place is loaded it makes one Volatile Void Essence every 120
// seconds and keeps it inside; unloaded it does nothing and catches nothing up, and its progress waits. Its owner
// takes the essence out by using it, and only its owner can break it: it drops itself and what it held, the record
// goes, and they may set it down again.
import { world, system, ItemStack } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { ESSENCE, PUMP, THE_END, pumpId, isPumpRecord, newPump, pumpIsAt, mayPlacePump, pumpTick, pumpSecondsLeft, pumpCollect, mayBreakPump } from "./voidRules.js";

const P = () => BALANCE.void.pump;
const COL = "void";
const missing = new Set(); // pumps seen gone once (twice running, and their record goes)

const pumps = () => db.all(COL).filter(isPumpRecord);
const here = (b) => ({ x: b.location.x, y: b.location.y, z: b.location.z });
const pumpAt = (dimensionId, loc) => pumps().find((r) => pumpIsAt(r, dimensionId, loc));

/** What stands at a pump's place now: "pump", "gone" (loaded, and no pump there) or "unloaded". */
function standing(rec) {
  try {
    const b = world.getDimension(rec.d).getBlock({ x: rec.x, y: rec.y, z: rec.z });
    if (!b) return "unloaded";
    return b.typeId === PUMP ? "pump" : "gone";
  } catch {
    return "unloaded";
  }
}

function spill(dimensionId, at, typeId, n) {
  let left = n;
  while (left > 0) {
    const k = Math.min(left, 64);
    left -= k;
    try {
      world.getDimension(dimensionId).spawnItem(new ItemStack(typeId, k), { x: at.x + 0.5, y: at.y + 0.5, z: at.z + 0.5 });
    } catch {
      return; // the place has gone
    }
  }
}

/** A pump's record ends: what it held falls where it stood (and the pump itself, if nothing else dropped it). */
function endPump(rec, withPump) {
  db.remove(COL, rec.id);
  missing.delete(rec.id);
  spill(rec.d, rec, ESSENCE, rec.stored ?? 0);
  if (withPump) spill(rec.d, rec, PUMP, 1);
}

const time = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`);

/** The pump's custom component (zoocraft:volatile_pump). */
export function pumpComponent() {
  return {
    beforeOnPlayerPlace(e) {
      const player = e.player;
      if (!player) {
        e.cancel = true; // a pump is always somebody's
        return;
      }
      const old = db.get(COL, pumpId(player.id));
      const v = mayPlacePump(e.block.dimension.id, old, old ? standing(old) : undefined);
      if (!v.ok) {
        e.cancel = true;
        const words = v.why === "dimension" ? "§7The Volatile Pump finds nothing to draw on here. §8It works only in the End." : `§7You already have a Volatile Pump, at ${v.at.x}, ${v.at.y}, ${v.at.z} in the End. §8One each: break that one first.`;
        system.run(() => message(player, words));
        return;
      }
      db.put(COL, newPump(player.id, player.name, e.block.dimension.id, here(e.block)));
      missing.delete(pumpId(player.id));
      if (v.clear && (old.stored ?? 0) > 0) system.run(() => spill(old.d, old, ESSENCE, old.stored)); // a pump lost some other way: what it held
      system.run(() => message(player, `§5Volatile Pump: §fset down. One Volatile Void Essence every ${time(P().seconds)} while this place is loaded; use it to take them out.`));
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const d = e.block.dimension.id;
      const at = here(e.block);
      system.run(() => usePump(player, d, at));
    },
    onBreak(e) {
      const rec = pumpAt(e.dimension.id, here(e.block));
      // broken by a player, the block drops itself; lost any other way (nothing blows it up or pushes it), it is given back
      if (rec) endPump(rec, e.entitySource?.typeId !== "minecraft:player");
    },
  };
}

/** A pump used: its owner takes what it holds; anyone else is told whose it is. Returns what happened (for the test server). */
export function usePump(player, dimensionId, at) {
  const rec = pumpAt(dimensionId, at);
  if (!rec) {
    message(player, "§5Volatile Pump: §7nobody's, so it draws nothing. §8Break it and set it down again to make it yours.");
    return "nobody's";
  }
  if (rec.owner !== player.id) {
    message(player, `§5Volatile Pump: §7this one is ${rec.ownerName ?? "someone else"}'s. Only they can empty it or break it.`);
    return "not yours";
  }
  const out = pumpCollect(rec);
  const full = (rec.stored ?? 0) >= P().cap;
  if (!out.n) {
    message(player, `§5Volatile Pump: §fnothing in it yet. The next Volatile Void Essence in ${time(pumpSecondsLeft(rec, P()))} of running. §8It runs only while this place is loaded.`);
    return "empty";
  }
  db.put(COL, out.rec);
  let left;
  try {
    left = player.getComponent("minecraft:inventory")?.container?.addItem(new ItemStack(ESSENCE, out.n));
  } catch {
    left = new ItemStack(ESSENCE, out.n);
  }
  if (left) spill(dimensionId, { x: at.x, y: at.y + 1, z: at.z }, ESSENCE, left.amount);
  message(player, `§5Volatile Pump: §fyou take ${out.n} Volatile Void Essence${left ? " (some fell beside it: your pockets are full)" : ""}. ${full ? "It was full and had stopped. " : ""}The next in ${time(pumpSecondsLeft(out.rec, P()))} of running.`);
  return `took ${out.n}`;
}

/** Every second: each pump whose place is loaded runs on; one found gone twice running gives up its record. */
export function tickPumps() {
  for (const rec of pumps()) {
    const st = standing(rec);
    if (st === "unloaded") continue; // "No production while unloaded": its progress waits
    if (st === "gone") {
      if (missing.has(rec.id)) endPump(rec, true);
      else missing.add(rec.id);
      continue;
    }
    missing.delete(rec.id);
    const next = pumpTick(rec, P().every, P());
    if (next !== rec) db.put(COL, next);
  }
}

/** Only a pump's owner can break it. */
export function wirePump() {
  world.beforeEvents.playerBreakBlock.subscribe((e) => {
    if (e.block.typeId !== PUMP) return;
    const rec = pumpAt(e.dimension.id, here(e.block));
    if (mayBreakPump(rec, e.player.id)) return;
    e.cancel = true;
    const player = e.player;
    system.run(() => message(player, `§5Volatile Pump: §7this one is ${rec.ownerName ?? "someone else"}'s. Only they can break it.`));
  });
}

/** For the test server: every pump's record, and what stands at its place. */
export function pumpDebug() {
  return pumps().map((r) => ({ ...r, standing: standing(r) }));
}
export { THE_END as PUMP_DIMENSION };
