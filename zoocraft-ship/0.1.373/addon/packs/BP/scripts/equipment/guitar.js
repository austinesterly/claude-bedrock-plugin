// The Guitar item (0.1.373; rules equipment/guitarRules.js). Using it plays its note; a left click moves to the next
// note (the one before, while sneaking). The note is the player's own (a dynamic property), so it stays set.
import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { reportError } from "../core/log.js";
import { GUITAR, GUITAR_SOUND, noteOf, notePitch, nextNote, noteText, isLeftClick, changeReady } from "./guitarRules.js";

const NOTE = "zoocraft:guitar_note";
const lastChange = new Map(); // player id -> tick
const listeners = []; // called with (player, note) on every note played (0.1.374: Zach's concert)

const noteFor = (player) => noteOf(player.getDynamicProperty(NOTE));

/** Another module hears every note a player plays. */
export function onGuitarNote(fn) {
  listeners.push(fn);
}

/** Plays the player's note where they stand. */
export function strum(player) {
  const n = noteFor(player);
  try {
    const at = player.location;
    player.dimension.playSound(GUITAR_SOUND, at, { volume: BALANCE.guitar.volume, pitch: notePitch(n) });
    player.dimension.spawnParticle("minecraft:note_particle", { x: at.x, y: at.y + 2.1, z: at.z });
  } catch {
    // unloaded
  }
  for (const fn of listeners) {
    try {
      fn(player, n);
    } catch (error) {
      reportError("guitar listener", error);
    }
  }
  return n;
}

/** A left click with the guitar in hand: the next note. */
export function changeNote(player, down) {
  const now = system.currentTick;
  if (!changeReady(lastChange.get(player.id), now, BALANCE.guitar)) return undefined;
  lastChange.set(player.id, now);
  const n = nextNote(noteFor(player), down);
  player.setDynamicProperty(NOTE, n);
  player.sendMessage(noteText(n));
  return n;
}

export function guitarComponent() {
  return {
    onUse(e) {
      if (e.source?.typeId === "minecraft:player") strum(e.source);
    },
  };
}

export function wireGuitar() {
  world.afterEvents.playerSwingStart.subscribe((e) => {
    try {
      if (e.heldItemStack?.typeId === GUITAR && isLeftClick(e.swingSource)) changeNote(e.player, e.player.isSneaking);
    } catch (error) {
      reportError("guitar.swing", error);
    }
  });
}

/** For the test server. */
export function guitarDebug(player) {
  return { note: noteFor(player), text: noteText(noteFor(player)), pitch: notePitch(noteFor(player)) };
}
