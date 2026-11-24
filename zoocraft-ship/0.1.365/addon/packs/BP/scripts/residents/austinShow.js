// Austin the resident's show (0.1.365, residents/showRules.js). While he is on a zoo visit his body holds the selfie
// stick up (the "zoocraft:prop" property), a few ordinary guests walk his trail behind him, and at each stop he says a
// line to his stream in chat to the players close by. The fans are plain guest entities this module owns: nothing of
// them is saved, and they go when he leaves the zoo, goes out of sight, or the world reloads (guests.js clearGuests).
import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { SPECIES } from "../data/species.js";
import { residentById } from "../data/residents.js";
import { getResident, residentBody, lookingAt } from "./residents.js";
import { crowdSize, trailPush, fanSpot, streamLine } from "./showRules.js";
import { newVisitor } from "../visitors/guests.js";
import { parkById } from "../park/park.js";
import { onlinePlayers, message } from "../platform/mc.js";

const WHO = "austin";
const PROP = "zoocraft:prop";
const LOOK = "zoocraft:look";
const WALKING = "zoocraft:walking";

const fans = []; // { key, look }
let trail = [];
let stood; // what he stood looking at when he last spoke to his stream
let speciesNames;

function fanEntity(f) {
  const e = f.key && world.getEntity(f.key);
  return e?.isValid ? e : undefined;
}

function dropFans() {
  for (const f of fans) {
    try {
      fanEntity(f)?.remove();
    } catch {
      // already gone
    }
  }
  fans.length = 0;
  trail = [];
}

/** Guest entities this module walks: guests.js must not clear them away. */
export function isFan(entityId) {
  return fans.some((f) => f.key === entityId);
}

function setProp(body, on) {
  try {
    if (body.getProperty(PROP) !== on) body.setProperty(PROP, on);
  } catch {
    // unloaded
  }
}

function speciesNear(body, g) {
  if (!speciesNames) speciesNames = new Map(Object.values(SPECIES).map((s) => [s.entityType, s.displayName]));
  try {
    for (const e of body.dimension.getEntities({ location: body.location, maxDistance: g.lookRange })) {
      const name = speciesNames.get(e.typeId);
      if (name) return name;
    }
  } catch {
    // unloaded
  }
  return undefined;
}

function toStream(body, g) {
  const at = lookingAt(WHO);
  if (!at) {
    stood = undefined;
    return;
  }
  if (stood === at) return;
  stood = at;
  if (Math.random() >= g.lineChance) return;
  const res = residentById(WHO);
  const line = streamLine(res?.lines?.stream, speciesNear(body, g));
  if (!line) return;
  const text = `§f${res.name} §8(to his stream)§f: §7"${line}"`;
  try {
    const at = body.location;
    for (const p of onlinePlayers()) {
      if (p.dimension.id !== body.dimension.id || Math.hypot(p.location.x - at.x, p.location.z - at.z) > g.sayRange) continue;
      message(p, text);
    }
  } catch {
    // unloaded
  }
}

export function tickAustinShow() {
  const g = BALANCE.residents.show;
  const rec = getResident(WHO);
  const body = rec ? residentBody(WHO) : undefined;
  if (!body) {
    if (fans.length) dropFans();
    return;
  }
  const filming = rec.state === "visiting";
  setProp(body, filming);
  if (!filming) {
    if (fans.length) dropFans();
    stood = undefined;
    return;
  }
  toStream(body, g);
  let loc;
  let yaw = 0;
  try {
    loc = body.location;
    yaw = body.getRotation().y;
  } catch {
    return;
  }
  const moved = trailPush(trail, loc, yaw, g);
  const want = crowdSize(parkById(rec.parkId)?.rating?.stars, g);
  while (fans.length < want) fans.push({ key: undefined, look: newVisitor().look });
  fans.forEach((f, i) => {
    const at = fanSpot(trail, i, g);
    if (!at) return; // the trail is still short: this one joins as he walks on
    let e = fanEntity(f);
    try {
      if (!e) {
        e = body.dimension.spawnEntity(ENTITIES.guest, { x: at.x, y: at.y, z: at.z });
        e.setProperty(LOOK, f.look);
        e.triggerEvent("zoocraft:travel");
        f.key = e.id;
      }
      const face = moved ? at.yaw : (Math.atan2(-(loc.x - at.x), loc.z - at.z) * 180) / Math.PI; // standing: they watch him
      e.teleport({ x: at.x, y: at.y, z: at.z }, { rotation: { x: 0, y: face }, keepVelocity: false });
      if (e.getProperty(WALKING) !== moved) e.setProperty(WALKING, moved);
    } catch {
      f.key = undefined; // unloaded: next time
    }
  });
}

/** For the test server. */
export function showDebug() {
  return { fans: fans.map((f) => Boolean(fanEntity(f))), trail: trail.length, stood: Boolean(stood), tick: system.currentTick };
}
