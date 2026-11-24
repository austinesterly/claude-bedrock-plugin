// The Prank Cam block and the VR Headset (0.1.366; rules equipment/camRules.js). A cam is a block anyone may place
// anywhere; "prankcams" keeps { id: posKey, dimension, x, y, z, n, face }. Using the headset lists the cams within
// range; picking one puts the player's camera at its lens. While watching, the player stands still, turns the cam by
// looking around, and sneaks to stop. Nothing is recorded and nothing in the world changes.
import { system, world, InputPermissionCategory } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { BLOCKS } from "../data/items.js";
import { db } from "../persistence/db.js";
import { posKey } from "../core/ids.js";
import { reportError } from "../core/log.js";
import { runLater } from "../park/park.js";
import { message } from "../platform/mc.js";
import { show } from "../ui/forms.js";
import { CAM_YAW, lensOf, camsFor, nextCamNumber, viewEnds, VIEW_TEXT } from "./camRules.js";

const COL = "prankcams";
const WATCHING = "zoocraft:cam_watching"; // on a watching player, so a view cut short by leaving the world is lifted on return
const views = new Map(); // player id -> { cam, health }

export const allCams = () => db.all(COL);

function lock(player, on) {
  try {
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, !on);
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, !on);
    player.setDynamicProperty(WATCHING, on ? true : undefined);
  } catch (error) {
    reportError("cam lock", error);
  }
}

function camBlockThere(cam) {
  try {
    const b = world.getDimension(cam.dimension).getBlock({ x: cam.x, y: cam.y, z: cam.z });
    return b ? b.typeId === BLOCKS.prankCam : true; // unloaded: it is taken to be there still
  } catch {
    return true;
  }
}

function healthOf(player) {
  try {
    return player.getComponent("minecraft:health")?.currentValue;
  } catch {
    return undefined;
  }
}

function aim(player, cam) {
  const rot = player.getRotation();
  player.camera.setCamera("minecraft:free", { location: lensOf(cam, BALANCE.prankCam), rotation: { x: rot.x, y: rot.y } });
}

function stopView(player, why) {
  views.delete(player.id);
  try {
    player.camera.clear();
  } catch {
    // no camera to give back
  }
  lock(player, false);
  if (why) message(player, VIEW_TEXT[why]);
}

function startView(player, cam) {
  if (!camBlockThere(cam)) {
    db.remove(COL, cam.id);
    return message(player, VIEW_TEXT.gone);
  }
  try {
    // turn the player to the way the cam looks (the same spot: nothing to load), so the view opens on its own aim
    player.teleport(player.location, { rotation: { x: 0, y: CAM_YAW[cam.face] ?? 0 }, keepVelocity: false });
    lock(player, true);
    views.set(player.id, { cam, health: healthOf(player) });
    aim(player, cam);
    message(player, VIEW_TEXT.on.replace("{n}", String(cam.n)));
  } catch (error) {
    reportError("cam view", error);
    stopView(player);
  }
}

/** Every 2 ticks: each watcher's camera follows their look, and the view ends when it should. */
export function tickCamViews() {
  if (!views.size) return;
  const g = BALANCE.prankCam;
  for (const [id, v] of views) {
    const player = world.getEntity(id);
    if (!player?.isValid) {
      views.delete(id);
      continue;
    }
    const health = healthOf(player);
    const why = viewEnds({ cam: v.cam, camThere: camBlockThere(v.cam), sneaking: player.isSneaking, dimension: player.dimension.id, pos: player.location, hurt: health !== undefined && v.health !== undefined && health < v.health }, g);
    v.health = health;
    if (why) {
      if (why === "gone") db.remove(COL, v.cam.id);
      stopView(player, why);
      continue;
    }
    try {
      aim(player, v.cam);
    } catch (error) {
      reportError("cam aim", error);
      stopView(player);
    }
  }
}

async function headsetMenu(player) {
  const g = BALANCE.prankCam;
  const list = camsFor(allCams(), player.dimension.id, player.location, g);
  if (!list.length) return message(player, VIEW_TEXT.none.replace("{range}", String(g.range)));
  if (list.length === 1) return startView(player, list[0].cam);
  const form = new ActionFormData().title("VR Headset").body("§7Which Prank Cam do you want to look through?");
  for (const x of list) form.button(x.text);
  form.button("Not now");
  const r = await show(player, form);
  if (r?.selection === undefined || r.selection >= list.length) return;
  if (!player.isValid) return;
  startView(player, list[r.selection].cam);
}

/** The VR Headset's use: on while off, off while on. */
export function headsetComponent() {
  return {
    /** @param {import("@minecraft/server").ItemComponentUseEvent} e */
    onUse(e) {
      const player = e.source;
      if (!player) return;
      runLater(() => {
        if (!player.isValid) return;
        if (views.has(player.id)) return stopView(player, "off");
        headsetMenu(player).catch((error) => reportError("headset", error));
      });
    },
  };
}

/** The Prank Cam block: placed, it is on the list; broken, it is off it. */
export function prankCamComponent() {
  return {
    /** @param {import("@minecraft/server").BlockComponentOnPlaceEvent} e */
    onPlace(e) {
      const b = e.block;
      const dimension = b.dimension.id;
      const pos = { x: b.x, y: b.y, z: b.z };
      let face = "south";
      try {
        face = String(b.permutation.getState("minecraft:cardinal_direction") ?? "south");
      } catch {
        // no such state: looks south
      }
      runLater(() => {
        const id = posKey(dimension, pos);
        const old = db.get(COL, id);
        db.put(COL, { id, dimension, ...pos, face, n: old?.n ?? nextCamNumber(allCams()) });
      });
    },
    /** @param {import("@minecraft/server").BlockComponentPlayerBreakEvent} e */
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, { x: e.block.x, y: e.block.y, z: e.block.z });
      runLater(() => db.remove(COL, id));
    },
  };
}

/** A view cut short by leaving the world: the player may move again. */
export function camSpawn(player) {
  try {
    if (player.getDynamicProperty(WATCHING) && !views.has(player.id)) {
      lock(player, false);
      player.camera.clear();
    }
  } catch (error) {
    reportError("cam spawn", error);
  }
}

/** For the test server: the headset's list for a player, and a look through the nth of it. */
export function camTry(player, nth) {
  const list = camsFor(allCams(), player.dimension.id, player.location, BALANCE.prankCam);
  if (nth !== undefined && list[nth]) startView(player, list[nth].cam);
  return list.map((x) => x.text.replace("\n", " "));
}

/** For the test server. */
export function camDebug() {
  return { cams: allCams(), views: [...views.keys()].length, tick: system.currentTick };
}
