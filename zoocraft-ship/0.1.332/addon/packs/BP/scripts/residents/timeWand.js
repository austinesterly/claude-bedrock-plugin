// 0.1.332: Damien's Wand at work (rules: residents/timeWandRules.js). Using it zaps the player holding it: time stops for
// every potion effect on them (the game's effects are put back to the time they had, ZooCraft's potions stop counting
// down in residents/potions.js), until they zap themselves again. It is how Damien stayed a dragon. Words in chat only.
import { world, system } from "@minecraft/server";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { STOPPED, mayZap, keepPlan, notAPotion } from "./timeWandRules.js";
import { shapeEffects } from "./shapeshift.js";

const K = () => BALANCE.potions.timeWand;
const lastZap = new Map();
/** The effects held while hidden, as the game added them (no swirl round an invisible player). */
const QUIET = new Set(["invisibility"]);

function readHeld(p) {
  try {
    const s = p.getDynamicProperty(STOPPED);
    return typeof s === "string" ? JSON.parse(s) : undefined;
  } catch {
    return undefined;
  }
}

function writeHeld(p, held) {
  try {
    p.setDynamicProperty(STOPPED, held === undefined ? undefined : JSON.stringify(held));
  } catch (e) {
    reportError("timeWand.write", e);
  }
}

function effectsOf(p) {
  try {
    return p.getEffects().map((e) => ({ id: e.typeId.replace("minecraft:", ""), ticks: e.duration, amp: e.amplifier }));
  } catch {
    return [];
  }
}

/** Effects on them that are not a potion's: the Freezing Wand's hold; the dragon shape's hiding and its landing. */
function skipFor(p) {
  const ours = new Set(shapeEffects(p));
  return (f) => notAPotion(f) || ours.has(f.id);
}

/** Whether time is stopped for this player's potion effects. */
export function timeStopped(p) {
  return readHeld(p) !== undefined;
}

function show(p, stopping) {
  const d = p.dimension;
  const at = p.location;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    try {
      d.spawnParticle("zoocraft:void_spell_burst", { x: at.x + Math.cos(a) * 0.8, y: at.y + 1 + (i % 3) * 0.3, z: at.z + Math.sin(a) * 0.8 });
    } catch {
      break; // only for show
    }
  }
  try {
    d.playSound(stopping ? "beacon.deactivate" : "beacon.activate", at, { volume: 0.8, pitch: 1.2 });
  } catch {
    // only for show
  }
}

/** The wand used: the player zaps themselves. Returns "wait", "stopped" or "started". */
export function zapSelf(p, now = system.currentTick) {
  const k = K();
  if (!mayZap(now, lastZap.get(p.id), k.cooldown)) return "wait";
  lastZap.set(p.id, now);
  try {
    p.startItemCooldown("zoocraft_damien_wand", k.cooldown); // the held wand's flick (RP attachables/damien_wand.json)
  } catch {
    // no flick
  }
  const stopping = !timeStopped(p);
  writeHeld(p, stopping ? keepPlan([], effectsOf(p), k.least, k.most, skipFor(p)).held : undefined);
  show(p, stopping);
  message(p, `§7${stopping ? k.words.stop : k.words.start}`);
  return stopping ? "stopped" : "started";
}

/** Every `every` ticks: each player whose time is stopped has their effects' time put back. */
export function tickTimeWand() {
  const k = K();
  for (const p of world.getAllPlayers()) {
    const held = readHeld(p);
    if (held === undefined) continue;
    try {
      if ((p.getComponent("minecraft:health")?.currentValue ?? 1) <= 0) continue;
      const plan = keepPlan(held, effectsOf(p), k.least, k.most, skipFor(p));
      for (const f of plan.renew) p.addEffect(f.id, f.ticks, { amplifier: f.amp, showParticles: !QUIET.has(f.id) });
      if (JSON.stringify(plan.held) !== JSON.stringify(held)) writeHeld(p, plan.held);
    } catch (e) {
      reportError("timeWand.tick", e);
    }
  }
}

/** Dying takes every effect, as the game does, and time runs again for them. */
export function wireTimeWand() {
  world.afterEvents.entityDie.subscribe(
    (e) => {
      try {
        if (e.deadEntity.typeId === "minecraft:player" && timeStopped(e.deadEntity)) writeHeld(e.deadEntity, undefined);
      } catch (err) {
        reportError("timeWand.die", err);
      }
    },
    { entityTypes: ["minecraft:player"] }
  );
}

/** The wand's custom component (zoocraft:damien_wand): right-click zaps the one holding it. */
export function damienWandComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseEvent} e */
    onUse(e) {
      const player = e.source;
      if (!player) return;
      system.run(() => {
        try {
          if (player.isValid) zapSelf(player);
        } catch (error) {
          reportError("damien wand", error);
        }
      });
    },
  };
}

/** For the test server. */
export function timeWandDebug(p) {
  return { stopped: p ? timeStopped(p) : undefined, held: p ? readHeld(p) : undefined, fx: p ? effectsOf(p) : undefined };
}
