// Sticky Gauntlets (0.1.237; the rule is climbMove in world/gooRules.js). Austin: "they allow players to climb up
// walls ... You can equip sticky gauntlets by putting them in your off hand ... optomize it for seamless transitions".
// Who is wearing them is looked up twice a second; only those players are read every tick, and only while they are off
// the ground or holding jump. Beside a wall: hold jump to climb, sneak to hang still, neither to slide down slowly. A
// fall past a wall is caught; a hop beside one is not. At the top of the wall one push carries the player over the
// edge. The push is worked out from the player's own speed each tick, so moving sideways along the wall, jumping onto
// it and stepping off it all stay the game's own movement, and Slow Falling while on the wall means letting go or
// sliding to the floor never hurts.
import { InputButton, ButtonState, EquipmentSlot } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { GOO, STICKY_GAUNTLETS, climbMove } from "../world/gooRules.js";

const C = BALANCE.gauntlets;
const wearers = new Map(); // player id -> { player, clung, held, since, told }
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

function wallBeside(d, at, dy) {
  for (const [dx, dz] of SIDES) {
    if (isWall(d.getBlock({ x: at.x + dx * C.reach, y: at.y + dy, z: at.z + dz * C.reach }))) return true;
  }
  return false;
}

/** Twice a second: who has Sticky Gauntlets in the off hand. */
export function tickGauntletWearers() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    try {
      if (player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand)?.typeId !== STICKY_GAUNTLETS) continue;
      seen.add(player.id);
      if (!wearers.has(player.id)) wearers.set(player.id, { player, clung: false, held: false, since: 0, told: false });
      else wearers.get(player.id).player = player;
    } catch {
      // left meanwhile
    }
  }
  for (const id of wearers.keys()) if (!seen.has(id)) wearers.delete(id);
}

/** Every tick, for the wearers only. */
export function tickClimb() {
  if (!wearers.size) return;
  for (const st of wearers.values()) {
    const player = st.player;
    try {
      if (!player.isValid) continue;
      // hasTag: the test server's stand-in player can't hold a key down, so the bench holds jump for it with a tag.
      const jump = player.isJumping || player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed || player.hasTag("zoocraft_hold_jump");
      if ((player.isOnGround && !jump) || player.isFlying || player.isGliding || player.isSwimming || player.isInWater || player.isSleeping) {
        st.clung = st.held = false;
        continue;
      }
      const d = player.dimension;
      const at = player.location;
      if (d.getBlock(at)?.typeId === GOO || player.getComponent("minecraft:riding")?.entityRidingOn) {
        st.clung = st.held = false; // wading is goo's own movement; a rider goes where the mount goes
        continue;
      }
      const touching = wallBeside(d, at, C.heights[0]) || wallBeside(d, at, C.heights[1]);
      const ledge = !touching && st.clung && jump && wallBeside(d, at, C.ledge);
      const vy = player.getVelocity().y;
      const sneak = player.isSneaking;
      const move = climbMove({ touching, ledge, clung: st.clung, held: st.held, jump, sneak, vy, slow: !!player.getEffect("slow_falling") }, C);
      if (!move) {
        st.clung = st.held = false;
        continue;
      }
      if (move.lift > 0) player.applyImpulse({ x: 0, y: move.lift, z: 0 });
      player.addEffect("slow_falling", C.safeTicks, { amplifier: 0, showParticles: false });
      if (!st.clung) st.since = 0;
      st.clung = !move.mantle;
      st.since += 1;
      if (st.since >= C.commit || (!jump && !sneak)) st.held = true; // climbed or hung for a moment, or a fall was caught
      if (Math.abs(vy) > 0.02 && st.since % C.soundEvery === 1) d.playSound("step.honey_block", at, { volume: 0.35, pitch: 1.2 });
      if (!st.told) {
        st.told = true;
        player.onScreenDisplay.setActionBar("Sticky Gauntlets: hold jump to climb, sneak to hang on.");
      }
    } catch {
      // Left, or in a chunk not loaded: next tick.
    }
  }
}
