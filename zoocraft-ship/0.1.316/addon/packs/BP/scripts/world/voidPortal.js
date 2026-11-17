// The Void Portal in the game (0.1.316; the rules are world/voidPortalRules.js): an Ender Flame lights a great End
// Stone frame once Darian has told of it; a player standing in the portal goes through to the island in the void, and
// back by the frame standing there. The game has no "standing in a block" event, so every 4 ticks each player's feet
// and head are looked at (as the sea portal, fishing/portal.js). Austin, 2026-11-15: "load the area you are
// teleporting to before the teleport": the island's chunks, or the way back's, are loaded first.
import { world, system, GameMode, ListBlockVolume, BlockPermutation, EquipmentSlot } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { portalStep, neighbours, readBack, writeBack } from "../fishing/portalRules.js";
import { withLoadedIn } from "../fishing/islands.js";
import { questHas, markQuest, questRecord, setQuest } from "../residents/darian.js";
import { ENDER_FLAME } from "../residents/melderRules.js";
import { VOID, VOID_PORTAL, VOID_AXIS, VOID_FRAME, VOID_BACK_KEY, lightFrame, frameStillWhole, framePlan, islePlan } from "./voidPortalRules.js";

const K = () => BALANCE.voidPortal;
const AIR_ONLY = { blockFilter: { includeTypes: ["minecraft:air"] } };
const LIT_IN = new Set(["minecraft:overworld", VOID]);
/** player id -> { t, held, going } */
const states = new Map();
const told = new Set();

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function blockId(d, x, y, z) {
  try {
    return d.getBlock({ x, y, z })?.typeId;
  } catch {
    return undefined;
  }
}

function play(player, sound, volume = 1) {
  try {
    player.playSound(sound, { volume });
  } catch {
    // none
  }
}

function tellOnce(player, key, text) {
  if (told.has(`${player.id}:${key}`)) return;
  told.add(`${player.id}:${key}`);
  message(player, text);
}

export function voidDimension() {
  try {
    return world.getDimension(VOID);
  } catch {
    return undefined;
  }
}

function fill(d, cells, block, options) {
  for (let i = 0; i < cells.length; i += 2000) d.fillBlocks(new ListBlockVolume(cells.slice(i, i + 2000)), block, options);
}

/**
 * Lights the frame a player points an Ender Flame into: `block` the End Stone used on, `face` its face. Returns
 * "lit", or why not ("locked", "place", "frame"). One Ender Flame is used up (none in creative).
 */
export function lightVoidPortal(player, block, face) {
  const d = block.dimension;
  if (!questHas("VOID_PORTAL_UNLOCKED")) {
    tellOnce(player, "locked", "§7The Ender Flame gutters and will not catch. Darian has not yet said what it is for.");
    return "locked";
  }
  if (!LIT_IN.has(d.id)) {
    tellOnce(player, "place", "§7The Void Portal only opens from the Overworld.");
    return "place";
  }
  const step = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] }[face] ?? [0, 1, 0];
  const start = { x: block.location.x + step[0], y: block.location.y + step[1], z: block.location.z + step[2] };
  let look;
  try {
    look = player.getViewDirection();
  } catch {
    look = { x: 0, y: 0, z: 1 };
  }
  const portal = block.typeId === VOID_FRAME ? lightFrame((x, y, z) => blockId(d, x, y, z), start, look, K().frame) : undefined;
  if (!portal) {
    tellOnce(player, "frame", "§7An Ender Flame lights the Void Portal: an upright frame of End Stone, 25 by 25 blocks, empty in the middle. Use it on the inside of the frame.");
    return "frame";
  }
  fill(d, portal.cells, BlockPermutation.resolve(VOID_PORTAL, { [VOID_AXIS]: portal.axis }), AIR_ONLY);
  try {
    d.playSound("fire.ignite", start, { volume: 1, pitch: 0.7 });
    d.playSound("portal.trigger", start, { volume: 0.6, pitch: 0.6 });
  } catch {
    // no sound, no matter
  }
  if (d.id !== VOID) {
    // the world's quest: the portal is lit, and where (the bait and the dragon come to it in later versions)
    const mid = Math.floor(portal.width / 2);
    const at = portal.axis === "x" ? { x: portal.min.x + mid, y: portal.min.y, z: portal.min.z } : { x: portal.min.x, y: portal.min.y, z: portal.min.z + mid };
    setQuest({ portal: { d: d.id, ...at, axis: portal.axis, size: portal.width } });
    markQuest("VOID_PORTAL_ACTIVATED");
  }
  if (!creative(player)) {
    try {
      const eq = player.getComponent("minecraft:equippable");
      const item = eq?.getEquipment(EquipmentSlot.Mainhand);
      if (item?.typeId === ENDER_FLAME) {
        if (item.amount <= 1) eq.setEquipment(EquipmentSlot.Mainhand, undefined);
        else {
          item.amount -= 1;
          eq.setEquipment(EquipmentSlot.Mainhand, item);
        }
      }
    } catch {
      // the player let go of it
    }
  }
  return "lit";
}

/** The Ender Flame's custom component (zoocraft:ender_flame): use it on the inside of an End Stone frame. */
export function enderFlameComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseOnEvent} e */
    onUseOn(e) {
      const player = /** @type {import("@minecraft/server").Player} */ (e.source);
      const block = e.block;
      const face = /** @type {any} */ (e.blockFace);
      if (!player || !block) return;
      system.run(() => {
        try {
          if (block.isValid) lightVoidPortal(player, block, face);
        } catch (error) {
          reportError("void portal", error);
        }
      });
    },
  };
}

function inPortal(player) {
  try {
    const d = player.dimension;
    const l = player.location;
    const x = Math.floor(l.x);
    const z = Math.floor(l.z);
    return blockId(d, x, Math.floor(l.y), z) === VOID_PORTAL || blockId(d, x, Math.floor(l.y + 1.2), z) === VOID_PORTAL;
  } catch {
    return false;
  }
}

/** Off any mount, and nothing riding them: the game won't take a player with riders to another dimension. */
function unmount(player) {
  try {
    const on = player.getComponent("minecraft:riding")?.entityRidingOn;
    on?.getComponent("minecraft:rideable")?.ejectRider(player);
  } catch {
    // not riding
  }
  try {
    player.getComponent("minecraft:rideable")?.ejectRiders();
  } catch {
    // nothing riding them
  }
}

function fade(player) {
  try {
    player.camera.fade({ fadeColor: { red: 0.08, green: 0.0, blue: 0.14 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.4, fadeOutTime: 0.8 } });
  } catch {
    // no camera control here
  }
}

/**
 * The island in the void, loaded, built the first time, its frame and portal mended every time (only where there is
 * air, so a player's blocks stay). Returns where a player arrives.
 */
export async function ensureIsle() {
  const d = voidDimension();
  if (!d) throw new Error("no void dimension");
  const plan = islePlan();
  await withLoadedIn(d, "zoocraft_void_isle", plan.from, plan.to, (dim) => {
    if (!questRecord().isle) {
      fill(dim, plan.ground, VOID_FRAME, AIR_ONLY);
      setQuest({ isle: 1 });
      log("void portal: the island in the void built");
    }
    fill(dim, plan.frame, VOID_FRAME, AIR_ONLY);
    fill(dim, plan.inside, BlockPermutation.resolve(VOID_PORTAL, { [VOID_AXIS]: plan.axis }), AIR_ONLY);
  });
  return plan.arrive;
}

async function toVoid(player) {
  const from = player.dimension;
  const arrive = await ensureIsle();
  if (!inPortal(player) || player.dimension.id !== from.id) return false; // stepped out while it was made
  const d = voidDimension();
  if (!d) return false;
  let ry = 0;
  try {
    ry = player.getRotation().y;
  } catch {
    ry = 0;
  }
  player.setDynamicProperty(VOID_BACK_KEY, writeBack(from.id, player.location, ry));
  unmount(player);
  fade(player);
  // the island's chunks are held loaded while they cross
  await withLoadedIn(d, `zoocraft_void_in_${player.id}`, { x: arrive.x - 8, z: arrive.z - 8 }, { x: arrive.x + 8, z: arrive.z + 8 }, () => {
    player.teleport(arrive, { dimension: d, rotation: { x: 0, y: 180 } });
  });
  play(player, "portal.travel", 0.35);
  return true;
}

/** Where a player goes back to: where they came through, else the world's lit portal, else their spawn point or the world's. */
function wayBack(player) {
  let back;
  try {
    back = readBack(player.getDynamicProperty(VOID_BACK_KEY));
  } catch {
    back = undefined;
  }
  if (back) return back;
  const p = questRecord().portal;
  if (p) return { d: p.d, x: p.x + 0.5, y: p.y + 1, z: p.z + 0.5, ry: 0 };
  let sp;
  try {
    sp = player.getSpawnPoint();
  } catch {
    sp = undefined;
  }
  if (sp) return { d: sp.dimension.id, x: sp.x + 0.5, y: sp.y, z: sp.z + 0.5, ry: 0 };
  const w = world.getDefaultSpawnLocation();
  return { d: "minecraft:overworld", x: w.x + 0.5, y: w.y > 320 ? 100 : w.y, z: w.z + 0.5, ry: 0 };
}

async function toOverworld(player) {
  const back = wayBack(player);
  const d = world.getDimension(back.d);
  unmount(player);
  fade(player);
  await withLoadedIn(d, `zoocraft_void_out_${player.id}`, { x: Math.floor(back.x) - 8, z: Math.floor(back.z) - 8 }, { x: Math.floor(back.x) + 8, z: Math.floor(back.z) + 8 }, () => {
    player.teleport({ x: back.x, y: back.y, z: back.z }, { dimension: d, rotation: { x: 0, y: back.ry } });
  });
  play(player, "portal.travel", 0.35);
  return true;
}

function go(player, st) {
  st.going = true;
  const trip = player.dimension.id === VOID ? toOverworld(player) : toVoid(player);
  trip
    .then((went) => {
      st.going = false;
      if (went) st.held = true;
      st.t = 0;
    })
    .catch((error) => {
      st.going = false;
      st.t = 0;
      st.held = true;
      log(`void portal: ${player.name} couldn't go through: ${error}`);
      message(player, "§7The portal flickers. Step out and in again to try once more.");
    });
}

/** Every 4 ticks: each player in a Void Portal goes through once they've stood there long enough. */
export function tickVoidPortals() {
  const k = K();
  for (const player of world.getAllPlayers()) {
    let st = states.get(player.id);
    if (!st) states.set(player.id, (st = { t: 0, held: false, going: false }));
    if (st.going) continue;
    let dimId;
    try {
      dimId = player.dimension.id;
    } catch {
      continue;
    }
    const inside = inPortal(player);
    const was = st.t;
    const r = portalStep(st, inside, creative(player), 4, k);
    st.t = r.st.t;
    st.held = r.st.held;
    if (inside && !st.held && was === 0) {
      play(player, "portal.trigger", 0.25);
      // start on the island while they wait
      if (dimId !== VOID && !questRecord().isle) ensureIsle().catch(() => {});
    }
    if (r.go) go(player, st);
  }
}

/** A frame or portal block broken (by a player or a blast): a portal no longer in a whole frame goes out. */
function checkAround(d, p) {
  const get = (x, y, z) => blockId(d, x, y, z);
  for (const n of neighbours(p)) {
    let perm;
    try {
      perm = d.getBlock(n)?.permutation;
    } catch {
      continue;
    }
    if (perm?.type.id !== VOID_PORTAL) continue;
    const axis = /** @type {string} */ (perm.getState(/** @type {any} */ (VOID_AXIS)) ?? "x");
    const { cells, whole } = frameStillWhole(get, n, axis, K().frame);
    if (!whole) {
      try {
        fill(d, cells, "minecraft:air", { blockFilter: { includeTypes: [VOID_PORTAL] } });
      } catch (error) {
        reportError("void portal", error);
      }
    }
  }
}

export function wireVoidPortals() {
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    const id = e.brokenBlockPermutation.type.id;
    if (id !== VOID_PORTAL && id !== VOID_FRAME) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.blockExplode.subscribe((e) => {
    const id = e.explodedBlockPermutation.type.id;
    if (id !== VOID_PORTAL && id !== VOID_FRAME) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.playerLeave.subscribe((e) => states.delete(e.playerId));
}

/**
 * For testing (/zoocraft:voidframe): an End Stone frame, 25 by 25, set up in front of a player, across the way they
 * face, only where there is air. Returns what to tell them.
 */
export function buildTestFrame(player) {
  const d = player.dimension;
  if (!LIT_IN.has(d.id)) return "The Void Portal only opens from the Overworld.";
  const look = player.getViewDirection();
  const alongX = Math.abs(look.z) >= Math.abs(look.x); // facing north or south: the frame runs east to west
  const ahead = 4;
  const c = { x: Math.floor(player.location.x) + (alongX ? 0 : Math.sign(look.x) * ahead), y: Math.floor(player.location.y), z: Math.floor(player.location.z) + (alongX ? Math.sign(look.z) * ahead : 0) };
  if (c.y + 25 > d.heightRange.max) return "Too high up for a frame 25 blocks tall.";
  const plan = framePlan(c, alongX ? "x" : "z");
  try {
    fill(d, plan.frame, VOID_FRAME, AIR_ONLY);
  } catch {
    return "The frame reaches into land that isn't loaded. Stand somewhere open and try again.";
  }
  return `An End Stone frame stands ${ahead} blocks in front of you, standing on the ground. Use an Ender Flame on the inside of it.`;
}

/** For the test server: each player's portal state, and the quest's portal. */
export function voidPortalDebug() {
  return { states: [...states.entries()].map(([id, s]) => ({ id, ...s })), quest: questRecord() };
}
