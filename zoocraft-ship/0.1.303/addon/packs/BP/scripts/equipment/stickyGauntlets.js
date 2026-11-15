// Sticky Gauntlets (0.1.237; remade in 0.1.251 and again in 0.1.303: the rules are in world/gooRules.js). Austin,
// 2026-11-11: "I do not want potion effects and levetation for sticky gloves, I want the player to be able to parqour
// around with sticky gloves equipped, they should have to click the block above to climb, and you should be able to
// hop off the wall to jump to another, no slow falling or potion effects". 2026-11-15, from his playtest video:
// "Screen shakes often when using sticky gloves on the walls. Player can only jump opposite of walls ... I want
// players to be able to climb up walls, an alternative is that the player gets a boost wherever they are looking".
// Worn in the off hand. Use (click) a wall block beside you to take hold of it. Click a block higher up to be thrown
// up to it, the top block of a wall to climb onto it, a block overhead to hang under it. Jump leaps the way you look
// (straight up the wall when you look up), and the wall you are beside when the leap tops out holds you; sneak lets go.
// 0.1.303, the shake: until now a hold was a push every tick that cancelled the game's gravity. The player's own game
// works out gravity for itself between those pushes, so the view shook. Now nothing is pushed while holding on: an
// unseen foothold (the block zoocraft:grip_step, no picture, no outline, a top at one of 16 heights) is put in the
// air under the wearer's feet and the game itself keeps them still. Only air is ever replaced, the footholds follow
// the wearer along the wall and are taken away the moment they let go; one left behind by a crash takes itself away.
// A pull up and a leap are one push each. Falls are the game's own: a foothold is ground.
// Who is wearing them is looked up twice a second; only wearers holding on or in a leap are read every tick.
import { world, InputButton, ButtonState, EquipmentSlot, BlockPermutation, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { GOO, STICKY_GAUNTLETS, GRIP_STEP, gripTarget, leapPush, riseSpeed, speedNow, stepAt, stepCells } from "../world/gooRules.js";

const C = BALANCE.gauntlets;
// player id -> { player, mode ("hold" | "pull" | "leap" | undefined), top, target, ledge, t, jumpWas, kick, steps, dim, told }
const wearers = new Map();
// every foothold standing now: "dimension|x,y,z" -> how many wearers stand on it
const live = new Map();
const SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const open = new Map(); // block id -> true when it is no wall (plants, torches, goo, a foothold)

function isWall(block) {
  if (!block || block.isAir || block.isLiquid) return false;
  const id = block.typeId;
  let free = open.get(id);
  if (free === undefined) {
    free = id === GRIP_STEP || PASSABLE_PATTERNS.some((r) => r.test(id));
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

const ceilingOver = (d, at) => isWall(d.getBlock({ x: at.x, y: at.y + C.tall + C.headRoom + 0.3, z: at.z }));

function wearing(player) {
  return player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand)?.typeId === STICKY_GAUNTLETS;
}

function fresh(player) {
  return { player, mode: undefined, top: 0, target: 0, ledge: undefined, t: 0, jumpWas: true, kick: undefined, steps: new Map(), dim: undefined, told: false };
}

// ---- the footholds
const liveKey = (dimId, k) => `${dimId}|${k}`;

function dropStep(dimId, k, c) {
  const key = liveKey(dimId, k);
  const n = (live.get(key) ?? 1) - 1;
  if (n > 0) return void live.set(key, n);
  live.delete(key);
  try {
    const b = world.getDimension(dimId).getBlock(c);
    if (b?.typeId === GRIP_STEP) b.setType("minecraft:air");
  } catch {
    // not loaded: the foothold takes itself away when it next ticks
  }
}

/** Takes away every foothold of a wearer. */
function clearSteps(st) {
  if (!st.dim) return;
  for (const [k, c] of st.steps) dropStep(st.dim, k, c);
  st.steps.clear();
}

/** Footholds under the wearer's feet at the height `st.top`, wherever there is air; the ones left behind go. */
function setSteps(st, d, at) {
  if (st.dim && st.dim !== d.id) clearSteps(st);
  st.dim = d.id;
  const { y, h } = stepAt(st.top);
  const want = new Map();
  for (const c of stepCells(at, y, C.stepHalf)) want.set(`${c.x},${c.y},${c.z}`, c);
  for (const [k, c] of want) {
    if (st.steps.has(k)) continue;
    let b;
    try {
      b = d.getBlock(c);
    } catch {
      b = undefined;
    }
    if (!b) continue;
    if (b.isAir) b.setPermutation(BlockPermutation.resolve(GRIP_STEP, { "zoocraft:h": h }));
    else if (b.typeId !== GRIP_STEP || b.permutation.getState("zoocraft:h") !== h) continue; // something of the world's: stood on as it is
    st.steps.set(k, c);
    live.set(liveKey(d.id, k), (live.get(liveKey(d.id, k)) ?? 0) + 1);
  }
  for (const [k, c] of [...st.steps]) {
    if (want.has(k)) continue;
    st.steps.delete(k);
    dropStep(d.id, k, c);
  }
}

/** The foothold block's own tick (main.js registers it): one no wearer stands on (left by a crash) takes itself away. */
export function gripStepComponent() {
  return {
    onTick(e) {
      const b = e.block;
      if (!live.has(liveKey(b.dimension.id, `${b.location.x},${b.location.y},${b.location.z}`))) b.setType("minecraft:air");
    },
  };
}

function let_go(st) {
  clearSteps(st);
  st.mode = undefined;
  st.ledge = undefined;
  st.kick = undefined;
  st.t = 0;
}

function hold(st, d, at, y) {
  st.mode = "hold";
  st.top = Math.floor(y * 16 + 1e-6) / 16;
  st.ledge = undefined;
  st.kick = undefined;
  st.t = 0;
  setSteps(st, d, at);
  d.playSound("step.honey_block", at, { volume: 0.4, pitch: 1.2 });
  if (!st.told) {
    st.told = true;
    message(st.player, "§7Sticky Gauntlets: click a block higher up to climb, jump to leap the way you look (look up to go straight up), sneak to let go.");
  }
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
  for (const [id, st] of wearers) {
    if (seen.has(id)) continue;
    let_go(st); // took them off, or left the game: their footholds go
    wearers.delete(id);
  }
}

function busy(player) {
  return player.isFlying || player.isGliding || player.isSwimming || player.isInWater || player.isSleeping || !!player.getComponent("minecraft:riding")?.entityRidingOn;
}

/**
 * A wearer used a block (main.js, the game's interact event, before the game acts on it): true when the gauntlets
 * take the click. Nothing in the world may be changed here; the footholds and pushes are tickClimb's.
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
  if (st.mode === "pull") return true; // one pull at a time (the key held down repeats the click)
  if (grip.y > at.y + 0.02) {
    st.mode = "pull";
    st.target = grip.y;
    st.ledge = grip.kind === "ledge" ? { x: b.x + 0.5, z: b.z + 0.5 } : undefined;
    st.kick = "pull";
  } else {
    st.mode = "leap"; // take hold where they are: the next tick's catch
    st.kick = "grab";
  }
  st.t = 0;
  return true;
}

/** Every tick, for the wearers holding on, pulling up or in a leap only. */
export function tickClimb() {
  if (!wearers.size) return;
  for (const st of wearers.values()) {
    if (!st.mode) {
      st.jumpWas = true; // (a jump key still down when they next take hold is not a new press)
      continue;
    }
    const player = st.player;
    try {
      if (!player.isValid) continue;
      // hasTag: the test server's stand-in player can't hold a key down, so the bench presses jump for it with a tag.
      const jump = player.isJumping || player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed || player.hasTag("zoocraft_hold_jump");
      const pressed = jump && !st.jumpWas;
      st.jumpWas = jump;
      const at = player.location;
      const d = player.dimension;
      if (!wearing(player) || busy(player) || player.isSneaking || d.getBlock(at)?.typeId === GOO) {
        let_go(st); // water, goo, wings, a mount, or sneak: the game's own rules from here
        continue;
      }
      st.t += 1;
      const v = player.getVelocity();
      if (st.mode === "hold") {
        if (pressed) {
          // the leap: the footholds go, and next tick (once the game's own jump is in) one push the way they look
          clearSteps(st);
          st.mode = "leap";
          st.kick = "leap";
          st.t = 0;
          d.playSound("step.honey_block", at, { volume: 0.5, pitch: 0.9 });
          continue;
        }
        const off = at.y - st.top;
        if ((st.t > C.catchSafe && (off > C.stepLeave || off < -C.stepLeave)) || !(wallAround(d, at) || ceilingOver(d, at))) {
          let_go(st); // walked off the wall, or carried off the foothold
          continue;
        }
        setSteps(st, d, at);
        continue;
      }
      if (st.mode === "pull") {
        if (st.kick === "pull") {
          st.kick = undefined;
          clearSteps(st);
          player.applyImpulse({ x: 0, y: riseSpeed(st.target - at.y + (st.ledge ? C.overRise : C.pullRise), C) - v.y, z: 0 }); // (measured: right as read, from the ground and from a foothold)
          d.playSound("step.honey_block", at, { volume: 0.4, pitch: 1.2 });
          continue;
        }
        if (st.t < 2 || (v.y > C.catchSpeed && st.t <= C.pullTicks)) continue; // still on the way up
        if (st.ledge && at.y >= st.target - 0.05) {
          // over the top of the wall: one push toward the middle of its top block, then the game's own footing
          const dx = st.ledge.x - at.x;
          const dz = st.ledge.z - at.z;
          const far = Math.hypot(dx, dz) || 1;
          player.applyImpulse({ x: (dx / far) * C.overPush - v.x, y: 0, z: (dz / far) * C.overPush - v.z });
          st.ledge = undefined;
          st.mode = "leap";
          st.t = 0;
          continue;
        }
        if (wallAround(d, at) || ceilingOver(d, at)) hold(st, d, at, Math.min(at.y, st.target + C.pullRise));
        else let_go(st);
        continue;
      }
      // a leap (or a hold asked for in mid-air): the wall beside them when it tops out holds them; the ground ends it
      if (st.kick === "leap") {
        st.kick = undefined;
        const p = leapPush(player.getViewDirection(), C);
        player.applyImpulse({ x: p.x, y: p.y - speedNow(v.y, C), z: p.z });
        continue;
      }
      const grab = st.kick === "grab";
      if (grab || (st.t >= C.hopFree && v.y <= C.catchSpeed)) {
        if (wallAround(d, at) || ceilingOver(d, at)) {
          hold(st, d, at, at.y + Math.min(0, v.y));
          continue;
        }
        if (grab) {
          let_go(st);
          continue;
        }
      }
      if ((player.isOnGround && st.t > C.liftOff) || st.t > C.hopCatch) let_go(st);
    } catch {
      // Left, or in a chunk not loaded: next tick.
    }
  }
}

/**
 * The game's hurt event (before it lands). 0.1.303: a foothold is ground, so the game's own count of a fall is right
 * but for one case: a wall that catches a falling wearer does them no harm (they took hold; they did not land).
 */
export function gauntletHurt(e) {
  if (e.damageSource.cause !== EntityDamageCause.fall) return;
  const st = wearers.get(e.hurtEntity?.id);
  if (st?.mode === "hold" && st.t <= C.catchSafe) e.cancel = true;
}

/** For the test server: each wearer's mode, height and footholds. */
export function climbDebug() {
  return [...wearers.values()].map((st) => ({ name: st.player?.name, mode: st.mode, top: st.top, steps: [...st.steps.keys()], live: live.size }));
}
