// The sea portal in the game (0.1.272; the rules are fishing/portalRules.js): Jack's Flint and Steel lights a
// prismarine frame, a player standing in the portal goes through, and one who falls off an island is caught before
// the void. The game has no "standing in a block" event, so every 4 ticks each player's feet and head are looked at.
import { world, system, GameMode, ListBlockVolume, BlockPermutation, EquipmentSlot } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { PORTAL, AXIS, FRAME, BACK_KEY, lightPortal, fishingSpot, portalStep, neighbours, portalStillWhole, readBack, writeBack } from "./portalRules.js";
import { FISHING, skyArrival } from "./islandRules.js";
import { worldSeed, fishingDimension, ensureIsland, ensureReturnPortal, islandRecord } from "./islands.js";
import { paidWear } from "./rodRules.js";

const K = () => BALANCE.fishingSky;
/** An island already built (it has its landing): a portal near it keeps opening onto it (0.1.275). */
const linked = (isl) => Boolean(islandRecord(isl)?.landing);
/** player id -> { t, held, going (a trip under way), told (the "finding the island" line said) } */
const states = new Map();
/** players told once this session that the lighter only lights a prismarine frame */
const toldFrame = new Set();

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

/** The lighter's custom component (zoocraft:sea_lighter): use it on a prismarine frame to light it. */
export function lighterComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseOnEvent} e */
    onUseOn(e) {
      const player = /** @type {import("@minecraft/server").Player} */ (e.source);
      const block = e.block;
      if (!player || !block) return;
      const d = block.dimension;
      if (d.id !== "minecraft:overworld" && d.id !== FISHING) {
        if (!toldFrame.has(`${player.id}:dim`)) message(player, "§7The sea portal only opens from the Overworld.");
        toldFrame.add(`${player.id}:dim`);
        return;
      }
      const f = /** @type {any} */ (e.blockFace);
      const step = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] }[f] ?? [0, 1, 0];
      const start = { x: block.location.x + step[0], y: block.location.y + step[1], z: block.location.z + step[2] };
      if (!FRAME.has(block.typeId)) return frameHint(player);
      let look;
      try {
        look = player.getViewDirection();
      } catch {
        look = { x: 0, y: 0, z: 1 };
      }
      const portal = lightPortal((x, y, z) => blockId(d, x, y, z), start, look, K().frame);
      if (!portal) return frameHint(player);
      system.run(() => {
        try {
          d.fillBlocks(new ListBlockVolume(portal.cells), BlockPermutation.resolve(PORTAL, { [AXIS]: portal.axis }), { blockFilter: { includeTypes: ["minecraft:air"] } });
          d.playSound("fire.ignite", start, { volume: 1, pitch: 0.9 });
          d.playSound("portal.trigger", start, { volume: 0.4, pitch: 1.4 });
          wearLighter(player);
        } catch (error) {
          reportError("sea portal", error);
        }
      });
    },
  };
}

function frameHint(player) {
  if (toldFrame.has(player.id)) return;
  toldFrame.add(player.id);
  message(player, "§7Jack's Flint and Steel lights a sea portal: an upright frame of prismarine, 4 by 5 or bigger, empty in the middle.");
}

function wearLighter(player) {
  if (creative(player)) return;
  system.run(() => {
    try {
      const eq = player.getComponent("minecraft:equippable");
      const item = eq?.getEquipment(EquipmentSlot.Mainhand);
      if (!item || item.typeId !== "zoocraft:jacks_flint_and_steel") return;
      const dur = item.getComponent("minecraft:durability");
      if (!dur) return;
      let unbreaking = 0;
      try {
        unbreaking = item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;
      } catch {
        unbreaking = 0;
      }
      const cost = paidWear(1, unbreaking, Math.random);
      if (!cost) return;
      if (dur.damage + cost > dur.maxDurability) {
        eq?.setEquipment(EquipmentSlot.Mainhand, undefined);
        play(player, "random.break");
        return;
      }
      dur.damage += cost;
      eq?.setEquipment(EquipmentSlot.Mainhand, item);
    } catch {
      // the player let go of it
    }
  });
}

function inPortal(player) {
  try {
    const d = player.dimension;
    const l = player.location;
    const x = Math.floor(l.x);
    const z = Math.floor(l.z);
    return blockId(d, x, Math.floor(l.y), z) === PORTAL || blockId(d, x, Math.floor(l.y + 1.2), z) === PORTAL;
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
    player.camera.fade({ fadeColor: { red: 0.12, green: 0.62, blue: 0.55 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.4, fadeOutTime: 0.8 } });
  } catch {
    // no camera control here
  }
}

/** Where a player with no way back stored comes out in the Overworld: their spawn point, or the world's. */
function spawnBack(player) {
  let sp;
  try {
    sp = player.getSpawnPoint();
  } catch {
    sp = undefined;
  }
  if (sp) return { d: sp.dimension.id, x: sp.x + 0.5, y: sp.y, z: sp.z + 0.5, ry: 0 };
  const w = world.getDefaultSpawnLocation();
  return { d: "minecraft:overworld", x: w.x + 0.5, y: w.y > 320 ? undefined : w.y, z: w.z + 0.5, ry: 0 };
}

async function toOverworld(player, why) {
  let back;
  try {
    back = readBack(player.getDynamicProperty(BACK_KEY));
  } catch {
    back = undefined;
  }
  back ??= spawnBack(player);
  const d = world.getDimension(back.d);
  let y = back.y;
  if (y === undefined) {
    // the world's spawn with no height: the ground there, once its chunk is loaded
    y = 100;
    const tam = world.tickingAreaManager;
    const name = `zoocraft_back_${player.id}`;
    try {
      const at = { x: Math.floor(back.x), y: 0, z: Math.floor(back.z) };
      await tam.createTickingArea(name, { dimension: d, from: at, to: at });
      const top = d.getTopmostBlock({ x: back.x, z: back.z });
      if (top) y = top.location.y + 1;
      else why = "fell";
    } catch {
      // no room to load it: from up high, falling slowly
      why = "fell";
    } finally {
      try {
        if (tam.hasTickingArea(name)) tam.removeTickingArea(name);
      } catch {
        // gone
      }
    }
  }
  unmount(player);
  fade(player);
  player.teleport({ x: back.x, y, z: back.z }, { dimension: d, rotation: { x: 0, y: back.ry } });
  if (why === "fell") {
    try {
      player.addEffect("slow_falling", 200, { showParticles: false });
    } catch {
      // none
    }
  }
  play(player, "portal.travel", 0.35);
}

async function toFishing(player) {
  const from = player.dimension;
  const spot = fishingSpot(player.location.x, player.location.z, K());
  const isl = skyArrival(worldSeed(), spot.x, spot.z, linked);
  if (!isl) throw new Error(`no island near ${spot.x} ${spot.z}`);
  await ensureIsland(isl, true);
  const arrive = await ensureReturnPortal(isl);
  if (!inPortal(player) || player.dimension.id !== from.id) return false; // stepped out while it was made
  const d = fishingDimension();
  if (!d) return false;
  let ry = 0;
  try {
    ry = player.getRotation().y;
  } catch {
    ry = 0;
  }
  player.setDynamicProperty(BACK_KEY, writeBack(from.id, player.location, ry));
  unmount(player);
  fade(player);
  player.teleport(arrive, { dimension: d, rotation: { x: 0, y: 180 } });
  play(player, "portal.travel", 0.35);
  return true;
}

function go(player, st) {
  st.going = true;
  const fishing = player.dimension.id === FISHING;
  const trip = fishing ? toOverworld(player, "portal").then(() => true) : toFishing(player);
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
      log(`sea portal: ${player.name} couldn't go through: ${error}`);
      message(player, "§7The portal flickers. Step out and in again to try once more.");
    });
}

/** Every 4 ticks: each player in a sea portal (going through once they've stood there long enough), or falling out of the fishing sky. */
export function tickPortals() {
  const k = K();
  for (const player of world.getAllPlayers()) {
    let st = states.get(player.id);
    if (!st) states.set(player.id, (st = { t: 0, held: false, going: false, told: false }));
    if (st.going) continue;
    let dimId;
    try {
      dimId = player.dimension.id;
    } catch {
      continue;
    }
    if (dimId === FISHING && player.location.y < k.voidY) {
      st.going = true;
      toOverworld(player, "fell")
        .catch((error) => reportError("sea portal", error))
        .finally(() => {
          // back where they went in: in that portal, so held until they step out of it
          st.going = false;
          st.held = true;
          st.t = 0;
        });
      continue;
    }
    const inside = inPortal(player);
    const was = st.t;
    const r = portalStep(st, inside, creative(player), 4, k);
    st.t = r.st.t;
    st.held = r.st.held;
    if (inside && !st.held && was === 0) play(player, "portal.trigger", 0.25);
    if (inside && !st.held && dimId !== FISHING && was === 0) {
      // start building the island it opens onto while they wait
      try {
        const spot = fishingSpot(player.location.x, player.location.z, k);
        const isl = skyArrival(worldSeed(), spot.x, spot.z, linked);
        if (isl) ensureIsland(isl, true).catch(() => {});
      } catch {
        // tried again when they go
      }
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
    if (perm?.type.id !== PORTAL) continue;
    const axis = /** @type {string} */ (perm.getState(/** @type {any} */ (AXIS)) ?? "x");
    const { cells, whole } = portalStillWhole(get, n, axis, K().frame);
    if (!whole) {
      try {
        d.fillBlocks(new ListBlockVolume(cells), "minecraft:air", { blockFilter: { includeTypes: [PORTAL] } });
      } catch (error) {
        reportError("sea portal", error);
      }
    }
  }
}

export function wirePortals() {
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    const id = e.brokenBlockPermutation.type.id;
    if (id !== PORTAL && !FRAME.has(id)) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.blockExplode.subscribe((e) => {
    const id = e.explodedBlockPermutation.type.id;
    if (id !== PORTAL && !FRAME.has(id)) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.playerLeave.subscribe((e) => states.delete(e.playerId));
}

/** For the test server: each player's portal state. */
export function portalsDebug() {
  return [...states.entries()].map(([id, s]) => ({ id, ...s }));
}
