// Goo (0.1.234; drowning and bubbles 0.1.237; the rules are in world/formationRules.js and world/gooRules.js). An
// add-on can't make a liquid, so goo is a block with no collision that looks like one. Every 2 ticks, for each player
// standing in it: they are slowed (wading), sink slowly instead of dropping, and rise while they hold jump. With the
// head under they run out of breath as in water, and then it starts to drown them (Austin, 2026-11-10: "Goo should
// start to drown you"). A slower loop makes the pools near each player bubble and pop.
import { InputButton, ButtonState, EquipmentSlot, GameMode } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { runTimeoutLater } from "../park/park.js";
import { BALANCE } from "../data/balance.js";
import { gooMove, insideFormation } from "./formationRules.js";
import { GOO, airStep, airLine, gooSurface } from "./gooRules.js";

const G = BALANCE.formation.goo;
const B = G.bubbles;
const STEP = 2; // the goo loop's ticks
const wading = new Set(); // player ids in the goo (or rising out of it) last time: the line on the action bar shows once
const air = new Map(); // player id -> breath left (ticks); only players who have been under
const shown = new Map(); // player id -> the air line last put on the action bar

function breath(player, headIn) {
  const had = air.get(player.id);
  if (had === undefined && !headIn) return;
  let safe = false;
  try {
    const mode = player.getGameMode();
    safe = mode === GameMode.Creative || mode === GameMode.Spectator;
  } catch {
    // unknown: treat as survival
  }
  if (safe) return void air.delete(player.id);
  const breathes = !!(player.getEffect("water_breathing") || player.getEffect("conduit_power"));
  let respiration = 0;
  if (headIn && !breathes) {
    try {
      respiration = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.getComponent("minecraft:enchantable")?.getEnchantment("respiration")?.level ?? 0;
    } catch {
      // no helmet, or one that can't be enchanted
    }
  }
  const next = airStep(had ?? G.air, headIn, breathes, respiration, STEP, G);
  if (next.hurt) {
    player.applyDamage(G.drownHarm, { cause: "drowning" });
    player.dimension.playSound("bubble.up", player.getHeadLocation(), { volume: 0.6 });
  }
  if (!headIn && next.air >= G.air) {
    air.delete(player.id);
    shown.delete(player.id);
    return;
  }
  air.set(player.id, next.air);
  const line = airLine(next.air, G);
  if (shown.get(player.id) !== line || next.hurt) player.onScreenDisplay.setActionBar(line);
  shown.set(player.id, line);
}

export function tickGoo() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    try {
      const d = player.dimension;
      const at = player.location;
      const id = (dy) => d.getBlock({ x: at.x, y: at.y + dy, z: at.z })?.typeId;
      const around = [id(0), id(1.5)];
      const inGoo = around.includes(GOO);
      if (!inGoo && !wading.has(player.id) && !air.has(player.id)) continue; // most players, most of the time: two looks
      breath(player, inGoo && d.getBlock(player.getHeadLocation())?.typeId === GOO);
      const jumping = player.isJumping || player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed;
      const move = gooMove(around, [id(-1), id(-2)], jumping);
      if (!move) continue;
      seen.add(player.id);
      if (inGoo) player.addEffect("slowness", G.ticks, { amplifier: G.slowness, showParticles: false });
      if (move === "rise") {
        player.removeEffect("slow_falling");
        player.addEffect("levitation", G.riseTicks, { amplifier: G.rise, showParticles: false });
      } else {
        player.removeEffect("levitation");
        player.addEffect("slow_falling", G.ticks, { amplifier: 0, showParticles: false });
      }
      if (!wading.has(player.id) && !air.has(player.id)) player.onScreenDisplay.setActionBar("Goo: hold jump to wade up and out.");
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  wading.clear();
  for (const id of seen) wading.add(id);
}

// --- Bubbles (0.1.237): "Let's make goo bubble as well, and pop and stuff" ---
// Each look, a few random columns near each player are read for an open goo surface; the ones found are remembered
// (a short list a player), and a couple of them bubble: a bubble swells on the goo and pops, with the game's own pop
// sound as it does. Far from any goo this costs one short column a player a look.
const pools = new Map(); // player id -> [{x, y, z}] goo surfaces seen near them
const rand = (a, b) => a + Math.random() * (b - a);

function surfaceIn(d, x, top, z) {
  const ids = [];
  const range = d.heightRange; // reading past the world's floor or roof throws
  top = Math.min(top, range.max - 1);
  for (let i = 0; i <= B.depth && top - i >= range.min; i++) {
    const b = d.getBlock({ x, y: top - i, z });
    if (!b) return undefined;
    ids.push(b.typeId);
  }
  const i = gooSurface(ids);
  return i < 0 ? undefined : { x, y: top - i, z };
}

export function bubbleAt(d, s) {
  const pos = { x: s.x + rand(0.15, 0.85), y: s.y + 1.02, z: s.z + rand(0.15, 0.85) };
  d.spawnParticle("zoocraft:goo_bubble", pos);
  if (Math.random() < B.popShare) {
    runTimeoutLater(() => {
      try {
        d.playSound("bubble.pop", pos, { volume: rand(0.25, 0.5), pitch: rand(0.6, 1.1) });
      } catch {
        // unloaded meanwhile
      }
    }, B.popTicks);
  }
}

export function tickGooBubbles() {
  const here = new Set();
  for (const player of onlinePlayers()) {
    here.add(player.id);
    try {
      const d = player.dimension;
      const at = player.location;
      const px = Math.floor(at.x);
      const py = Math.floor(at.y);
      const pz = Math.floor(at.z);
      let seen = pools.get(player.id) ?? [];
      const looks = d.id === "minecraft:overworld" && insideFormation(at.x, at.z) ? B.looks : seen.length ? B.looksNear : B.looksIdle;
      for (let n = 0; n < looks; n++) {
        const s = surfaceIn(d, px + Math.round(rand(-B.reach, B.reach)), py + B.up, pz + Math.round(rand(-B.reach, B.reach)));
        if (s && !seen.some((o) => o.x === s.x && o.y === s.y && o.z === s.z)) seen.push(s);
      }
      seen = seen.filter((s) => Math.abs(s.x - px) <= B.reach + 4 && Math.abs(s.z - pz) <= B.reach + 4 && Math.abs(s.y - py) <= B.depth + 2);
      if (seen.length > B.keep) seen = seen.slice(seen.length - B.keep);
      for (let n = 0; n < Math.min(B.each, seen.length); n++) {
        const i = Math.floor(Math.random() * seen.length);
        const s = seen[i];
        const still = d.getBlock(s)?.typeId === GOO && d.getBlock({ x: s.x, y: s.y + 1, z: s.z })?.isAir;
        if (!still) seen.splice(i, 1);
        else bubbleAt(d, s);
      }
      if (wading.has(player.id)) {
        // A player wading stirs it up: bubbles on the surface over and beside them.
        for (let n = 0; n < B.wade; n++) {
          const s = surfaceIn(d, px + Math.round(rand(-1, 1)), py + 3, pz + Math.round(rand(-1, 1)));
          if (s) bubbleAt(d, s);
        }
      }
      if (seen.length) pools.set(player.id, seen);
      else pools.delete(player.id);
    } catch {
      // Left, or in a chunk not loaded: next time.
    }
  }
  for (const id of pools.keys()) if (!here.has(id)) pools.delete(id);
  for (const id of air.keys()) if (!here.has(id)) (air.delete(id), shown.delete(id));
}
