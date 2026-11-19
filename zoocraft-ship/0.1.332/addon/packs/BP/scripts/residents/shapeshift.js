// 0.1.331: the dragon shape at work (rules: residents/shapeshiftRules.js). Drinking a Shapeshifting Potion or a Dragon
// Seeker (residents/potions.js) puts the player on a small dragon of ours, hidden on its back; the game itself steers it
// from their look and their move keys (as it steers the Happy Ghast), so its flight is the game's own, smooth on every
// client. Here: its lean and pose, the blue fire on a swing of the arm, a new dragon under a player the game put off
// theirs (a teleport, a new dimension, rejoining), the player turned back when they sneak off it or the time runs out,
// and Slow Falling till a player turned back in the air is down. Words come in chat only.
import { world, system, MolangVariableMap, EntityDamageCause } from "@minecraft/server";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { exhibitAt } from "../exhibits/exhibits.js";
import { SHIFTED_DRAGON, viewDir, fireTargets, poseOf, turnOf, offDragon, invisibilityBack, stillFalling } from "./shapeshiftRules.js";

const G = () => BALANCE.potions.shape;
const RID = "zoocraft:rid"; // a zoo animal's record id (animals/animals.js)
const COL = "shapeshift"; // who has been a dragon: { id: player id, first: the day }

/** The players who are dragons now: player id -> { dragon, since, tries, invis, yaw, pose, breathUntil, lastBurn }. */
const shifted = new Map();
/** Players turned back in the air: player id -> the tick they were. */
const landing = new Map();
/** The tick each player last pressed sneak (the game's way off a mount: a quick tap may be over before we look). */
const sneaks = new Map();
/** 0.1.332: playerId -> the tick a landing ended (its Slow Falling is still on them a little). */
const landed = new Map();
let stats = { shifts: 0, mounts: 0, breaths: 0, burned: 0, ended: 0 };
/** residents/potions.js: what to do when a player turns back on their own (it ends the potion's time). */
/** @type {(p: any) => void} */
let onEnd = () => {};
/** @param {(p: any) => void} fn */
export function setDragonEnd(fn) {
  onEnd = fn ?? (() => {});
}

/**
 * 0.1.332: the effects the dragon shape has put on a player (its hiding, a landing's Slow Falling, still on them for
 * a little after they land): not potions, so Damien's Wand leaves them be.
 */
export function shapeEffects(p) {
  const recent = system.currentTick - (landed.get(p.id) ?? -1000) < 60;
  return shifted.has(p.id) || landing.has(p.id) || recent ? ["invisibility", "slow_falling"] : [];
}

/** Whether a player has been a dragon (Damien's and Darian's thanks wait for it: residents/residents.js). */
export function hasShifted(playerId) {
  return Boolean(playerId) && db.get(COL, playerId) !== undefined;
}

function ridingOn(p) {
  try {
    return p.getComponent("minecraft:riding")?.entityRidingOn;
  } catch {
    return undefined;
  }
}

/**
 * Standing on something: the game's own flag AND a block under the feet. A dragon with no gravity keeps the flag it had
 * when it last stood (the bench: true while hovering over air), and a rider who just got off has the dragon's.
 */
function standing(e) {
  try {
    if (!e.isOnGround) return false;
    const l = e.location;
    const b = e.dimension.getBlock({ x: l.x, y: l.y - 0.25, z: l.z });
    return Boolean(b && !b.isAir && !b.isLiquid);
  } catch {
    return false;
  }
}

function invisibleTicks(p) {
  try {
    return p.getEffect("invisibility")?.duration ?? 0;
  } catch {
    return 0;
  }
}

function hide(p) {
  try {
    if (invisibleTicks(p) < 200) p.addEffect("invisibility", 600, { amplifier: 0, showParticles: false });
  } catch {
    // gone
  }
}

/** A new dragon under the player, where they are. Returns true when they are on it. */
function mount(p, rec) {
  const old = rec.dragon;
  rec.dragon = undefined;
  try {
    if (old?.isValid) old.remove();
  } catch {
    // gone already
  }
  try {
    const d = p.dimension.spawnEntity(SHIFTED_DRAGON, { x: p.location.x, y: p.location.y, z: p.location.z });
    try {
      d.setRotation({ x: 0, y: p.getRotation().y });
    } catch {
      // only a start
    }
    rec.dragon = d;
    const ok = Boolean(d.getComponent("minecraft:rideable")?.addRider(p));
    if (ok) stats.mounts += 1;
    return ok;
  } catch (e) {
    reportError("shapeshift.mount", e);
    return false;
  }
}

/** Drinking: the player becomes a small dragon (or, a dragon already, just keeps on: the potion's time starts again). */
export function becomeDragon(p) {
  let rec = shifted.get(p.id);
  if (!rec) {
    rec = { dragon: undefined, since: system.currentTick, tries: 0, lastTry: -100, invis: invisibleTicks(p), yaw: undefined, pose: {}, breathUntil: 0, nextBurn: 0, lastBurn: new Map() };
    shifted.set(p.id, rec);
    landing.delete(p.id);
    stats.shifts += 1;
  }
  hide(p);
  if (ridingOn(p)?.typeId !== SHIFTED_DRAGON) {
    try {
      ridingOn(p)?.getComponent("minecraft:rideable")?.ejectRider(p); // off a horse, a boat: onto the dragon
    } catch {
      // nothing to get off
    }
    rec.lastTry = system.currentTick;
    if (!mount(p, rec)) rec.tries += 1;
  }
}

/** Each second the potion runs (residents/potions.js): a player who joined as a dragon is one again. */
export function keepDragon(p) {
  if (!shifted.has(p.id)) becomeDragon(p);
  else hide(p);
}

/**
 * The player turns back: off the dragon, which goes; their own Invisibility back as it was; Slow Falling till they land.
 * `why`: "time", "sneak", "milk", "death" or "giveup". The first time, Damien and Darian are told (their thanks).
 */
export function endDragon(p, why) {
  const rec = shifted.get(p.id);
  shifted.delete(p.id);
  if (!rec) return;
  stats.ended += 1;
  try {
    rec.dragon?.getComponent("minecraft:rideable")?.ejectRider(p);
  } catch {
    // off already
  }
  try {
    if (rec.dragon?.isValid) rec.dragon.remove();
  } catch {
    // gone already
  }
  if (why === "death") return;
  try {
    p.removeEffect("invisibility");
    const back = invisibilityBack(rec.invis, system.currentTick - rec.since);
    if (back > 0) p.addEffect("invisibility", back, { amplifier: 0, showParticles: true });
  } catch {
    // gone
  }
  landing.set(p.id, system.currentTick);
  fall(p);
  const first = !hasShifted(p.id);
  if (first) db.put(COL, { id: p.id, first: world.getDay() });
  const g = G();
  message(p, `§7${why === "sneak" ? g.words.sneak : why === "giveup" ? g.words.giveup : g.words.ended}${first ? ` ${g.words.first}` : ""}`);
}

function fall(p) {
  try {
    p.addEffect("slow_falling", 40, { amplifier: 0, showParticles: false });
  } catch {
    // gone
  }
}

/** Every 2 ticks: each dragon's rider still on it (or a new one under them), its pose, the fire; and the landings. */
export function tickShapeshift() {
  const now = system.currentTick;
  const g = G();
  for (const [id, rec] of shifted) {
    const p = world.getEntity(id);
    if (!p?.isValid) {
      shifted.delete(id); // left the world: the dragon vanishes by itself (its entity file), and they are one again when they're back
      continue;
    }
    try {
      if ((p.getComponent("minecraft:health")?.currentValue ?? 1) <= 0) continue; // dying: the potion ends with them
      const on = ridingOn(p);
      if (!on || on.id !== rec.dragon?.id) {
        const what = offDragon(p.isSneaking || now - (sneaks.get(id) ?? -100) <= g.sneakTicks, rec.tries, g.mountTries);
        if (what === "end" || what === "giveup") {
          endDragon(p, what === "end" ? "sneak" : "giveup");
          onEnd(p);
          continue;
        }
        if (now - rec.lastTry >= 10) {
          rec.lastTry = now;
          if (mount(p, rec)) rec.tries = 0;
          else rec.tries += 1;
        }
        continue;
      }
      rec.tries = 0;
      pose(p, rec, now);
      if (now < rec.breathUntil) breathe(p, rec, now);
    } catch (e) {
      reportError("shapeshift.tick", e);
    }
  }
  for (const [id, since] of landing) {
    const p = world.getEntity(id);
    if (!p?.isValid) {
      landing.delete(id);
      continue;
    }
    const ground = standing(p);
    let water = false;
    try {
      water = p.isInWater;
    } catch {
      // gone
    }
    if (!stillFalling(ground, water, since, now, g.fallSeconds * 20)) {
      landing.delete(id);
      landed.set(id, now);
    }
    else if ((now - since) % 20 === 0) fall(p);
  }
}

function pose(p, rec, now) {
  const d = rec.dragon;
  const r = p.getRotation();
  const turn = rec.yaw === undefined ? 0 : turnOf(rec.yaw, r.y) / 2; // a look every 2 ticks
  rec.yaw = r.y;
  const ground = standing(d);
  const want = poseOf(r.x, turn, ground, now < rec.breathUntil);
  for (const k of ["act", "pitch", "bank"]) {
    if (rec.pose[k] === want[k]) continue;
    rec.pose[k] = want[k];
    try {
      d.setProperty(`zoocraft:${k}`, want[k]);
    } catch {
      // unloaded under them
    }
  }
}

/** A swing of the arm (an attack, even at nothing): the dragon breathes its blue fire a little while. */
function swing(p) {
  const rec = shifted.get(p.id);
  if (!rec || ridingOn(p)?.id !== rec.dragon?.id) return;
  const g = G().breath;
  const now = system.currentTick;
  if (now < rec.breathUntil - g.ticks + g.every) return; // still breathing the last
  rec.breathUntil = now + g.ticks;
  rec.nextBurn = now;
  stats.breaths += 1;
  try {
    p.dimension.playSound("mob.blaze.shoot", p.location, { volume: 0.7, pitch: 1.5 });
  } catch {
    // only for show
  }
  breathe(p, rec, now);
}

function breathe(p, rec, now) {
  const g = G().breath;
  const r = p.getRotation();
  const dir = viewDir(r.x, r.y);
  const at = rec.dragon.location;
  const mouth = { x: at.x + dir.x * g.mouthAhead, y: at.y + g.mouthUp + dir.y * g.mouthAhead, z: at.z + dir.z * g.mouthAhead };
  const d = p.dimension;
  try {
    const vars = new MolangVariableMap();
    vars.setFloat("variable.dx", dir.x);
    vars.setFloat("variable.dy", dir.y);
    vars.setFloat("variable.dz", dir.z);
    vars.setFloat("variable.r", g.colour.r);
    vars.setFloat("variable.g", g.colour.g);
    vars.setFloat("variable.b", g.colour.b);
    for (const k of g.puffsAt) d.spawnParticle("zoocraft:dragon_fire", { x: mouth.x + dir.x * k, y: mouth.y + dir.y * k, z: mouth.z + dir.z * k }, vars);
  } catch {
    // only for show
  }
  if (now < rec.nextBurn) return;
  rec.nextBurn = now + g.burnEvery;
  let near = [];
  try {
    near = d.getEntities({ location: mouth, maxDistance: g.range + 1, families: ["mob"], excludeFamilies: ["inanimate", "player"] });
  } catch {
    near = [];
  }
  const mobs = near.filter((e) => e.id !== rec.dragon.id).map((e) => mobOf(e, mouth));
  for (const m of fireTargets(mobs, mouth, dir, g)) {
    if (now - (rec.lastBurn.get(m.e.id) ?? -1000) < g.burnEvery) continue;
    rec.lastBurn.set(m.e.id, now);
    try {
      m.e.applyDamage(g.damage, { cause: EntityDamageCause.fire, damagingEntity: p });
      m.e.setOnFire(g.burnSeconds, true);
      stats.burned += 1;
    } catch {
      // gone, or the fire can't touch it
    }
  }
}

function mobOf(e, mouth) {
  let leashed = false;
  let tamed = false;
  let zoo = false;
  let seen = true;
  try {
    leashed = Boolean(e.getComponent("minecraft:leashable")?.isLeashed);
  } catch {
    leashed = false;
  }
  try {
    tamed = Boolean(e.getComponent("minecraft:tameable")?.isTamed);
  } catch {
    tamed = false;
  }
  try {
    zoo = e.getDynamicProperty(RID) !== undefined || exhibitAt(e.dimension.id, e.location) !== undefined;
  } catch {
    zoo = true; // can't tell: leave it be
  }
  try {
    const to = { x: e.location.x - mouth.x, y: e.location.y + 0.6 - mouth.y, z: e.location.z - mouth.z };
    const dist = Math.hypot(to.x, to.y, to.z);
    if (dist > 0.5) {
      const hit = e.dimension.getBlockFromRay(mouth, { x: to.x / dist, y: to.y / dist, z: to.z / dist }, { maxDistance: dist, includeLiquidBlocks: false, includePassableBlocks: false });
      seen = !hit;
    }
  } catch {
    seen = true;
  }
  return { e, typeId: e.typeId, pos: e.location, named: Boolean(e.nameTag), leashed, tamed, zoo, seen };
}

/** The events: the arm's swing (the fire), the sneak key (getting off), leaving. */
export function wireShapeshift() {
  world.afterEvents.playerButtonInput.subscribe((e) => {
    if (e.button === "Sneak" && e.newButtonState === "Pressed" && shifted.has(e.player.id)) sneaks.set(e.player.id, system.currentTick);
  });
  world.afterEvents.playerLeave.subscribe((e) => {
    sneaks.delete(e.playerId);
    landing.delete(e.playerId);
  });
  world.afterEvents.playerSwingStart.subscribe((e) => {
    try {
      if (e.swingSource === "Attack" && shifted.has(e.player.id)) swing(e.player);
    } catch (err) {
      reportError("shapeshift.swing", err);
    }
  });
}

/** For the test server. */
export function shapeshiftDebug(p) {
  const rec = p ? shifted.get(p.id) : undefined;
  let on;
  try {
    on = p ? ridingOn(p)?.typeId : undefined;
  } catch {
    on = undefined;
  }
  return { shifted: Boolean(rec), riding: on, dragon: rec?.dragon?.isValid ? rec.dragon.id : undefined, tries: rec?.tries, pose: rec?.pose, landing: p ? landing.has(p.id) : undefined, hasShifted: p ? hasShifted(p.id) : undefined, invis: p ? invisibleTicks(p) : undefined, ...stats };
}

export function resetShapeshiftStats() {
  stats = { shifts: 0, mounts: 0, breaths: 0, burned: 0, ended: 0 };
}
