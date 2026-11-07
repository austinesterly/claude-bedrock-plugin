import { system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, isNight } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { isNocturnalHouse } from "./nightRules.js";
import { ROOST, BODY_HEIGHT, roostable, roostPos, spotKey, pickRoost, glidePath, batHours, boutTicks, wakes } from "./batRules.js";
import { reportError } from "../core/log.js";

// Bats in the game (0.1.194; the rules are animals/batRules.js, research/vanilla_plan.md "0.1.194 bats and allays: the
// design"). The game flies the zoo copy (its own float_wander). The game's bat hangs by its engine, which a copy doesn't
// get, so every half second, for each zoo bat near a player: when it's time to hang (all day in a bright house; between
// flights in a dark one, at any hour) it flies up to the nearest free roost of its house (the measure's, ex.bats) a push a
// tick and hangs there (the copy's zoocraft:roost event: no wander, no gravity, the property the client draws as the
// game's resting pose), turning about now and then; it flies off when its time is up, when someone who isn't sneaking
// comes within wakeRange, or when the block it hangs from goes (the game's bat).

const TYPES = Object.values(SPECIES).filter((s) => s.batRoost).map((s) => s.entityType);
const state = new Map(); // entity id -> { mode: "fly" | "glide" | "hang", until, spot }
const glides = new Map(); // entity id -> { e, pts, i, spot }: a flight up to a roost, a point a tick
const used = new Map(); // roost key -> entity id
const reported = new Set();

function tell(error) {
  const why = String(error);
  if (reported.has(why) || reported.size > 20) return;
  reported.add(why);
  reportError("bat", error);
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}

// Every 10 ticks: each zoo bat near a player.
export function tickBats(now) {
  if (!TYPES.length) return;
  const T = BALANCE.bat;
  const players = onlinePlayers();
  const seen = new Set();
  const night = isNight();
  const near = [];
  for (const p of players) {
    try {
      near.push({ x: p.location.x, y: p.location.y, z: p.location.z, sneaking: p.isSneaking, dimension: p.dimension.id });
    } catch {
      // gone
    }
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, T.range, TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        stepBat(e, now, near, night, T);
      } catch (error) {
        tell(error);
      }
    }
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    glides.delete(id);
    for (const [k, owner] of used) if (owner === id) used.delete(k);
  }
}

function free(id) {
  for (const [k, owner] of used) if (owner === id) used.delete(k);
}

function takenByOthers(id) {
  const out = new Set();
  for (const [k, owner] of used) if (owner !== id) out.add(k);
  return out;
}

function stepBat(e, now, near, night, T) {
  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const hanging = e.getProperty(ROOST) === true;
  let s = state.get(e.id);
  if (!s) {
    // First met (or after a reload): as it is now, its roost (if hanging) taken.
    s = { mode: hanging ? "hang" : "fly", until: now + boutTicks(hanging ? "hang" : "fly", T) };
    if (hanging) {
      s.spot = { x: Math.floor(e.location.x), y: Math.floor(e.location.y + BODY_HEIGHT + 0.05) - 1, z: Math.floor(e.location.z) };
      used.set(spotKey(s.spot), e.id);
    }
    state.set(e.id, s);
  }
  if (s.mode === "glide") return; // tickBatMoves has it
  const dark = Boolean(ex?.house) && isNocturnalHouse(ex, BALANCE);
  const hours = batHours(night, dark);
  if (hanging) {
    const above = blockReader(e.dimension, { climb: true, leaves: true, gecko: true });
    const top = { x: Math.floor(e.location.x), y: Math.floor(e.location.y + BODY_HEIGHT + 0.05), z: Math.floor(e.location.z) };
    const lost = !roostable(above(top.x, top.y, top.z)); // its block went
    if (lost || wakes(near, e.location, e.dimension.id, T)) return takeOff(e, s, now, boutTicks("fly", { ...T, flyTicks: T.startleTicks }));
    if (!ex || (hours === "bouts" && now >= s.until)) return takeOff(e, s, now, boutTicks("fly", T));
    // Turning about now and then, as the game's does.
    if (Math.random() < T.turnChance * (10 / T.turnEvery)) e.setRotation({ x: 0, y: Math.random() * 360 - 180 });
    return;
  }
  if (!ex || !ex.bats?.roostSpots?.length) return; // a zoo bat outside a measured house just flies
  if (hours === "bouts" && now < s.until) return;
  const spot = pickRoost(ex.bats.roostSpots, e.location, takenByOthers(e.id), T.reach);
  if (!spot) return; // none near: flies on and tries again
  free(e.id);
  used.set(spotKey(spot), e.id);
  s.mode = "glide";
  s.spot = spot;
  glides.set(e.id, { e, pts: glidePath(e.location, roostPos(spot), T.glideSpeed), i: 0, spot });
}

function takeOff(e, s, now, ticks) {
  free(e.id);
  s.spot = undefined;
  s.mode = "fly";
  s.until = now + ticks;
  e.triggerEvent("zoocraft:fly");
  sound(e, "mob.bat.takeoff", 0.3, 0.8 + Math.random() * 0.4);
}

// Every tick: the bats flying up to a roost; at the last point it hangs.
export function tickBatMoves() {
  for (const [id, g] of [...glides]) {
    const e = g.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    const s = state.get(id);
    if (!valid || !s) {
      glides.delete(id);
      continue;
    }
    try {
      const p = g.pts[g.i++];
      e.teleport(p, { keepVelocity: false });
      if (g.i >= g.pts.length) {
        glides.delete(id);
        e.clearVelocity();
        e.triggerEvent("zoocraft:roost");
        e.setRotation({ x: 0, y: Math.random() * 360 - 180 });
        s.mode = "hang";
        s.until = system.currentTick + boutTicks("hang", BALANCE.bat);
      }
    } catch {
      glides.delete(id);
      if (s) s.mode = "fly";
      free(id);
    }
  }
}

// Hanging now (the Field Journal's "watch one hanging", the clipboard's page)?
export function batHanging(e) {
  try {
    return e.getProperty(ROOST) === true;
  } catch {
    return false;
  }
}
