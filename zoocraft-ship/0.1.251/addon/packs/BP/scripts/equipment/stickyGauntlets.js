// Sticky Gauntlets (0.1.237; remade in 0.1.251: the rules are in world/gooRules.js). Austin, 2026-11-11: "I do not want
// potion effects and levetation for sticky gloves, I want the player to be able to parqour around with sticky gloves
// equipped, they should have to click the block above to climb, and you should be able to hop off the wall to jump to
// another, no slow falling or potion effects, change it with the script".
// Worn in the off hand. Use (click) a wall block beside you to take hold of it: you hang there. Click a block higher
// up to pull yourself up to it, the top block of a wall to climb onto it, a block overhead to hang under it. Jump hops
// off the way you look, and the next wall you touch in that hop holds you; sneak lets go. Nothing here is an effect:
// hanging and pulling are pushes that cancel the game's gravity exactly, tick by tick. The game still counts the whole
// way down as one fall, so the harm for landing is put right in its hurt event (fairFallHarm).
// Who is wearing them is looked up twice a second; only those players are read every tick, and a wearer walking
// about costs one look at their jump key.
import { InputButton, ButtonState, EquipmentSlot, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { GOO, STICKY_GAUNTLETS, holdPush, holdSpeed, gripTarget, pullSpeed, hopPush, fairFallHarm } from "../world/gooRules.js";

const C = BALANCE.gauntlets;
// player id -> { player, mode, target, ledge, roof, t, jumpWas, hop, guard, peak, ground, told, sound }
const wearers = new Map();
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const open = new Map(); // block id -> true when it is no wall (plants, torches, goo)

function isWall(block) {
  if (!block || block.isAir || block.isLiquid) return false;
  const id = block.typeId;
  let free = open.get(id);
  if (free === undefined) {
    free = PASSABLE_PATTERNS.some((r) => r.test(id));
    open.set(id, free);
  }
  return !free;
}

/** The walls beside a player at one height: the sum of their outward directions, or undefined when there is none. */
function wallBeside(d, at, dy) {
  let out;
  for (const [dx, dz] of SIDES) {
    if (!isWall(d.getBlock({ x: at.x + dx * C.reach, y: at.y + dy, z: at.z + dz * C.reach }))) continue;
    out ??= { x: 0, z: 0 };
    out.x -= dx;
    out.z -= dz;
  }
  return out;
}

function wallAround(d, at) {
  let out;
  for (const dy of C.heights) {
    const w = wallBeside(d, at, dy);
    if (!w) continue;
    out ??= { x: 0, z: 0 };
    out.x += w.x;
    out.z += w.z;
  }
  return out;
}

const ceilingOver = (d, at) => isWall(d.getBlock({ x: at.x, y: at.y + C.tall + C.headRoom + 0.1, z: at.z }));

function wearing(player) {
  return player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand)?.typeId === STICKY_GAUNTLETS;
}

function fresh(player) {
  return { player, mode: undefined, target: 0, ledge: undefined, roof: false, t: 0, jumpWas: true, hop: -1, guard: false, peak: 0, ground: 0, told: false, sound: false };
}

/** Twice a second: who has Sticky Gauntlets in the off hand. */
export function tickGauntletWearers() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    try {
      if (!wearing(player)) continue;
      seen.add(player.id);
      if (!wearers.has(player.id)) wearers.set(player.id, fresh(player));
      else wearers.get(player.id).player = player;
    } catch {
      // left meanwhile
    }
  }
  // Someone who took them off in mid-air keeps their fair landing; everyone else is forgotten.
  for (const [id, st] of wearers) if (!seen.has(id) && !(st.guard && st.player?.isValid)) wearers.delete(id);
}

function busy(player) {
  return player.isFlying || player.isGliding || player.isSwimming || player.isInWater || player.isSleeping || !!player.getComponent("minecraft:riding")?.entityRidingOn;
}

/**
 * A wearer used a block (main.js, the game's interact event, before the game acts on it): true when the gauntlets
 * take the click. Nothing in the world may be changed here; the pushes are tickClimb's.
 */
export function gripClick(player, block) {
  let st = wearers.get(player.id);
  if (!st) {
    if (!wearing(player)) return false;
    st = fresh(player);
    wearers.set(player.id, st);
  } else if (!wearing(player)) return false;
  if (busy(player) || !isWall(block)) return false;
  const at = player.location;
  const d = player.dimension;
  if (d.getBlock(at)?.typeId === GOO) return false;
  const b = block.location;
  const grip = gripTarget(at, b, (n) => !isWall(d.getBlock({ x: b.x, y: b.y + n, z: b.z })), C);
  if (!grip) return false;
  if (player.isOnGround && !st.mode && grip.y <= at.y + 0.05) return false; // standing by a wall, clicking it: a plain click
  if (st.mode === "pull" || st.mode === "over") return true; // one pull at a time (the key held down repeats the click)
  st.mode = grip.y > at.y + 0.02 ? "pull" : "hang";
  st.target = grip.y;
  st.ledge = grip.kind === "ledge" ? { x: b.x + 0.5, z: b.z + 0.5 } : undefined;
  st.roof = grip.kind === "ceiling";
  st.t = 0;
  st.hop = -1;
  st.sound = true;
  st.guard = true;
  st.peak = at.y;
  st.ground = 0;
  return true;
}

function let_go(st, y) {
  st.mode = undefined;
  st.ledge = undefined;
  st.roof = false;
  st.t = 0;
  st.peak = y;
}

/** Every tick, for the wearers only. */
export function tickClimb() {
  if (!wearers.size) return;
  for (const st of wearers.values()) {
    const player = st.player;
    try {
      if (!player.isValid) continue;
      // hasTag: the test server's stand-in player can't hold a key down, so the bench presses jump for it with a tag.
      const jump = player.isJumping || player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed || player.hasTag("zoocraft_hold_jump");
      const pressed = jump && !st.jumpWas;
      st.jumpWas = jump;
      const ground = player.isOnGround;
      if (!st.mode && st.hop < 0) {
        if (!st.guard) continue; // walking about: nothing more is read
        if (ground && ++st.ground > C.landKeep) st.guard = false; // landed: the fall is settled
        else if (!ground) st.peak = Math.max(st.peak, player.location.y);
        continue;
      }
      const at = player.location;
      const d = player.dimension;
      if (busy(player) || d.getBlock(at)?.typeId === GOO) {
        let_go(st, at.y);
        st.hop = -1;
        st.guard = false; // water, goo, wings, a mount: the game's own rules from here
        continue;
      }
      const vy = player.getVelocity().y;
      if (!st.mode) {
        // In a hop off a wall: the next wall touched holds the player (sticky), the ground ends the hop.
        st.hop += 1;
        st.peak = Math.max(st.peak, at.y);
        if (ground || st.hop > C.hopCatch) st.hop = -1;
        else if (st.hop >= C.hopFree && !player.isSneaking && wallAround(d, at)) {
          st.mode = "hang";
          st.target = at.y;
          st.t = 0;
          st.hop = -1;
          st.sound = true;
        }
        continue;
      }
      st.t += 1;
      st.peak = at.y;
      st.ground = 0;
      if (st.sound) {
        st.sound = false;
        d.playSound("step.honey_block", at, { volume: 0.4, pitch: 1.2 });
        if (!st.told) {
          st.told = true;
          player.onScreenDisplay.setActionBar("Sticky Gauntlets: click a block higher up to climb, jump to hop off, sneak to let go.");
        }
      }
      if (player.isSneaking) {
        let_go(st, at.y);
        continue;
      }
      if (st.mode === "over") {
        // On top of the wall: carried over the block's edge, then the game's own footing.
        const dx = st.ledge.x - at.x;
        const dz = st.ledge.z - at.z;
        const far = Math.hypot(dx, dz);
        if (ground || far < C.overDone || st.t > C.overTicks) {
          let_go(st, at.y);
          continue;
        }
        const v = player.getVelocity();
        player.applyImpulse({ x: (dx / far) * C.overSpeed - v.x, y: holdPush(0, vy, C), z: (dz / far) * C.overSpeed - v.z });
        continue;
      }
      const side = wallAround(d, at);
      const held = side || ceilingOver(d, at) || (st.mode === "pull" && (st.ledge || st.roof));
      if (!held || (ground && (st.mode === "hang" || st.t > C.liftOff))) {
        let_go(st, at.y); // walked off the wall, or standing again
        continue;
      }
      if (pressed) {
        const view = player.getViewDirection();
        player.applyImpulse(hopPush(view, side ?? { x: 0, z: 0 }, C));
        d.playSound("step.honey_block", at, { volume: 0.5, pitch: 0.9 });
        let_go(st, at.y);
        st.hop = 0;
        continue;
      }
      if (st.mode === "pull") {
        if (at.y >= st.target - 0.005) {
          if (st.ledge) {
            st.mode = "over";
            st.t = 0;
          } else st.mode = "hang";
          player.applyImpulse({ x: 0, y: holdPush(holdSpeed(at.y, st.target, C), vy, C), z: 0 });
          continue;
        }
        if (st.t > C.pullTicks) {
          st.mode = "hang"; // something in the way overhead: hold on where they got to
          st.ledge = undefined;
          st.target = at.y;
        } else {
          player.applyImpulse({ x: 0, y: holdPush(pullSpeed(at.y, st.target, C), vy, C), z: 0 });
          continue;
        }
      }
      player.applyImpulse({ x: 0, y: holdPush(holdSpeed(at.y, st.target, C), vy, C), z: 0 });
    } catch {
      // Left, or in a chunk not loaded: next tick.
    }
  }
}

/** The game's hurt event (before it lands): a climber's fall is counted from where they let go. */
export function gauntletHurt(e) {
  if (e.damageSource.cause !== EntityDamageCause.fall) return;
  const st = wearers.get(e.hurtEntity?.id);
  if (!st?.guard) return;
  if (st.mode) return void (e.cancel = true); // holding on: no landing happened
  const harm = fairFallHarm(st.peak - e.hurtEntity.location.y, e.damage, C);
  if (harm <= 0) e.cancel = true;
  else e.damage = harm;
}
