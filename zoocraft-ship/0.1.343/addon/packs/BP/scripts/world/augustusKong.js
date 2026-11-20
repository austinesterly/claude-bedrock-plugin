// 0.1.343: Augustus Kong, Protector of Gods, in the game (the rules are world/kongRules.js; Austin's NPC #29 spec,
// section 13). He is in the great cave of Acufend (world/acufend.js) whenever a player is near it: put there when one
// comes near (never saved with the world: entity transient), taken away when none is. The floor round the statue is
// kept loaded while he is there (a ticking area), so he never steps into land that isn't there. He moves by the script
// alone, on the flat floor round the statue; he changes no block. His defeat is kept in the "augustusKong" collection
// ({ id: "kong", beaten, at, by }): from then on he sits by the cave wall, calm, and is never fought again. Nothing is
// written on the screen; what happens is said in chat.
import { world, system, GameMode, MolangVariableMap, EntityDamageCause } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { message } from "../platform/mc.js";
import { acuCave, acufendDimension } from "./acufend.js";
import { RELIC_STONE } from "./acufendCaveRules.js";
import {
  KONG, KONG_SPIKE, KONG_ACT as ACT, yawTo, turnTo, aheadOf, arenaMiddle, inRing, guardSpot, restSpot, walkStep,
  phaseOf, slamOf, leapPlan, leapAt, slamHits, nextMove, restFor, handAt, spikeThrows, spikeStep, spikePitch,
  pathPoints, spikeHit, hurtCut, inChamber, beatenRecord,
} from "./kongRules.js";

const K = () => BALANCE.kong;
const COL = "augustusKong";
const AREA = "zoocraft_kong_arena";
const SEE_THROUGH = new Set(["minecraft:glow_lichen", "minecraft:light_block"]);

/** The fight: { e, c, L, pos, y, yaw, mode, t, until, act, hp, max, phase, last, plan, aim, spikes, target, lost, told, beatenDue, hitBy, roared, roarDue, placed } */
let fight;
/** Left mid-fight: { hp, tick }; he has it back if a player comes back before the fight is forgotten. */
let kept;
/** "off", "loading" or "on" */
let area = "off";
let areaAt = "";
let lastLog = -1e9;
/** His defeat as read from the store: undefined not read yet, null none. */
let record;

/** His defeat, or undefined (0.1.344's artifact retrieval asks this). */
export function kongBeaten() {
  if (record === undefined) record = beatenRecord(db.get(COL, "kong")) ?? null;
  return record ?? undefined;
}

function gone(e) {
  try {
    if (e?.isValid) e.remove();
  } catch {
    // already gone
  }
}

function sound(d, id, at, volume = 2, pitch = 1) {
  try {
    d.playSound(id, at, { volume, pitch });
  } catch {
    // cosmetic only
  }
}

function particle(d, id, at, radius) {
  try {
    if (radius === undefined) d.spawnParticle(id, at);
    else {
      const vars = new MolangVariableMap();
      vars.setFloat("variable.radius", radius);
      d.spawnParticle(id, at, vars);
    }
  } catch {
    // cosmetic only
  }
}

function shake(players, at, reach, most) {
  for (const p of players) {
    try {
      const l = p.location;
      const dd = Math.hypot(l.x - at.x, l.y - at.y, l.z - at.z);
      if (dd > reach) continue;
      p.runCommand(`camerashake add @s ${(0.1 + most * (1 - dd / reach)).toFixed(2)} 0.6 positional`);
    } catch {
      // cosmetic only
    }
  }
}

function health(e) {
  return /** @type {any} */ (e.getComponent("minecraft:health"));
}

function hurt(player, amount, by) {
  try {
    player.applyDamage(amount, by?.isValid ? { cause: EntityDamageCause.entityAttack, damagingEntity: by } : { cause: EntityDamageCause.entityAttack });
  } catch {
    // the player left
  }
}

function setAct(f, act) {
  if (f.act === act) return;
  try {
    f.e.setProperty("zoocraft:act", act);
    f.act = act;
  } catch {
    // next tick
  }
}

function playing(p) {
  try {
    const m = p.getGameMode();
    return m !== GameMode.Creative && m !== GameMode.Spectator;
  } catch {
    return false;
  }
}

// ---- the floor round the statue kept loaded while a player is near

function areaOn(d, c) {
  if (area !== "off") return;
  const r = K().areaReach;
  const tam = world.tickingAreaManager;
  const options = { dimension: d, from: { x: Math.floor(c.x - r), y: 0, z: Math.floor(c.z - r) }, to: { x: Math.ceil(c.x + r), y: 0, z: Math.ceil(c.z + r) } };
  try {
    if (tam.hasTickingArea(AREA)) tam.removeTickingArea(AREA);
    if (!tam.hasCapacity(options)) return; // tried again next tick
    area = "loading";
    areaAt = `${Math.floor(c.x)},${Math.floor(c.z)}`;
    tam.createTickingArea(AREA, options).then(
      () => {
        if (area === "loading") area = "on";
      },
      () => {
        area = "off";
      },
    );
  } catch {
    area = "off";
  }
}

function areaOff() {
  if (area === "off") return;
  area = "off";
  try {
    const tam = world.tickingAreaManager;
    if (tam.hasTickingArea(AREA)) tam.removeTickingArea(AREA);
  } catch {
    // gone with the world
  }
}

// ---- the fight

function endFight() {
  const f = fight;
  if (!f) return;
  if (f.mode !== "calm" && f.mode !== "beaten" && f.mode !== "guard" && f.hp < f.max) kept = { hp: f.hp, tick: system.currentTick };
  for (const s of f.spikes) gone(s.e);
  gone(f.e);
  fight = undefined;
}

function statueThere(d, L) {
  try {
    return d.getBlock(L.statue)?.typeId === RELIC_STONE;
  } catch {
    return false;
  }
}

function startFight(d, L, now) {
  const k = K();
  for (const x of d.getEntities({ type: KONG })) gone(x); // strays
  for (const x of d.getEntities({ type: KONG_SPIKE })) gone(x);
  const beaten = !!kongBeaten();
  const spot = beaten ? restSpot(L, k) : guardSpot(L, k);
  const c = arenaMiddle(L);
  const pos = { x: spot.x, y: spot.y, z: spot.z };
  const e = d.spawnEntity(KONG, pos);
  e.teleport(pos, { rotation: { x: 0, y: spot.yaw }, keepVelocity: false });
  const max = k.health;
  let hp = max;
  if (!beaten && kept && now - kept.tick < k.forget) hp = Math.max(1, Math.min(max, kept.hp));
  kept = undefined;
  if (hp < max) health(e).setCurrentValue(hp);
  const phase = phaseOf(hp, max, k);
  fight = {
    e, c, L, pos, y: spot.y, yaw: spot.yaw, mode: beaten ? "calm" : hp < max ? "rest" : "guard", t: 0, until: 20, act: -1, hp, max, phase,
    last: [], plan: undefined, aim: undefined, spikes: [], target: undefined, lost: 0, told: new Set(), beatenDue: false, hitBy: undefined,
    roared: phase === 2, roarDue: false, placed: { x: pos.x, y: pos.y, z: pos.z, yaw: spot.yaw, at: now },
  };
  setAct(fight, beaten ? ACT.sit : ACT.idle);
}

/** Who he fights: players in Survival or Adventure in the great chamber. */
function fightersOf(f, players) {
  const k = K();
  const out = [];
  for (const p of players) {
    try {
      const l = p.location;
      if (!playing(p) || !inChamber(f.L, l, k)) continue;
      out.push({ p, id: p.id, x: l.x, y: l.y, z: l.z });
    } catch {
      // left
    }
  }
  return out;
}

function pickTarget(f, fs) {
  const held = f.target && fs.find((w) => w.id === f.target);
  if (held) return held;
  let best;
  let bd = Infinity;
  for (const w of fs) {
    const dd = Math.hypot(w.x - f.pos.x, w.z - f.pos.z);
    if (dd < bd) {
      bd = dd;
      best = w;
    }
  }
  f.target = best?.id;
  return best;
}

function setMode(f, mode, until = 0) {
  f.mode = mode;
  f.t = 0;
  f.until = until;
}

function rest(f) {
  setMode(f, "rest", restFor(K(), f.phase, Math.random()));
}

function roar(f, d, fs, line) {
  const k = K();
  setMode(f, "roar", k.roar);
  setAct(f, ACT.roar);
  sound(d, "mob.ravager.roar", f.pos, 5, 0.5);
  particle(d, "zoocraft:kong_roar", { x: f.pos.x, y: f.y + 4.2, z: f.pos.z });
  shake(fs.map((w) => w.p), f.pos, 40, 0.5);
  for (const w of fs) {
    if (line === "wake" && f.told.has(w.id)) continue;
    f.told.add(w.id);
    message(w.p, line === "wake"
      ? "§6Augustus Kong, Protector of Gods, rises beside the statue. The cavern shakes as he beats his chest."
      : "§6Augustus Kong roars and beats his chest. He is quicker now, and angrier.");
  }
}

function crouch(f, d, tg) {
  const k = K();
  setMode(f, "crouch", slamOf(k, f.phase).warn);
  f.plan = leapPlan(f.c, f.pos, tg, k);
  setAct(f, ACT.crouch);
  sound(d, "mob.polarbear.warning", f.pos, 3, 0.45);
}

function ring(f, d) {
  const k = K();
  if (f.t % k.slam.ringEvery !== 0 || !f.plan) return;
  particle(d, "zoocraft:kong_warn_ring", { x: f.plan.land.x, y: f.y + 0.15, z: f.plan.land.z }, slamOf(k, f.phase).radius);
}

function land(f, d, fs, players) {
  const k = K();
  const at = { x: f.pos.x, y: f.y, z: f.pos.z };
  for (const h of slamHits(at, fs, k, f.phase)) {
    const w = fs.find((x) => x.id === h.id);
    if (!w) continue;
    hurt(w.p, h.damage, f.e);
    try {
      w.p.applyKnockback({ x: h.knock.x, z: h.knock.z }, h.knock.v);
    } catch {
      // left
    }
  }
  const R = slamOf(k, f.phase).radius;
  particle(d, "zoocraft:kong_slam_burst", { x: at.x, y: at.y + 0.2, z: at.z }, R);
  particle(d, "zoocraft:kong_slam_dust", { x: at.x, y: at.y + 0.4, z: at.z }, R);
  sound(d, "random.explode", at, 3, 0.55);
  sound(d, "mob.ravager.stun", at, 3, 0.6);
  sound(d, "dig.stone", at, 3, 0.5);
  shake(players, at, k.slam.shake, 0.6);
  setMode(f, "slam", k.slam.recover);
  setAct(f, ACT.slam);
}

function rip(f, d, tg) {
  const k = K();
  setMode(f, "rip", f.phase === 2 ? k.spike.rip2 : k.spike.rip);
  f.aim = { x: tg.x, y: tg.y, z: tg.z, id: tg.id };
  setAct(f, ACT.rip);
}

function launch(f, d) {
  const k = K();
  const from = handAt(f.pos, f.yaw, k);
  sound(d, "mob.irongolem.throw", from, 3, 0.5);
  for (const v of spikeThrows(from, f.aim, k, f.phase)) {
    try {
      const e = d.spawnEntity(KONG_SPIKE, from);
      e.setProperty("zoocraft:pitch", spikePitch(v));
      e.teleport(from, { rotation: { x: 0, y: yawTo(v.x, v.z) }, keepVelocity: false });
      f.spikes.push({ e, pos: from, v, t: 0, pitch: spikePitch(v) });
    } catch (error) {
      if (system.currentTick - lastLog > 600) log(`augustus kong: a spike: ${error}`);
      lastLog = system.currentTick;
    }
  }
}

function solidAt(d, q) {
  try {
    const b = d.getBlock({ x: Math.floor(q.x), y: Math.floor(q.y), z: Math.floor(q.z) });
    if (!b) return true; // out of the loaded land: it breaks there
    return !(b.isAir || b.isLiquid || SEE_THROUGH.has(b.typeId));
  } catch {
    return true;
  }
}

function stepSpikes(f, d, fs) {
  const k = K();
  for (const s of [...f.spikes]) {
    s.t += 1;
    const next = spikeStep(s.pos, s.v, k);
    const hit = spikeHit(s.pos, next.pos, fs, k);
    let stop = hit?.at;
    if (!stop) {
      for (const q of pathPoints(s.pos, next.pos, 0.5)) {
        if (solidAt(d, q)) {
          stop = q;
          break;
        }
      }
    }
    if (!stop && s.t >= k.spike.life) stop = next.pos;
    if (!stop) {
      s.pos = next.pos;
      s.v = next.v;
      try {
        s.e.teleport(s.pos, { rotation: { x: 0, y: yawTo(s.v.x, s.v.z) }, keepVelocity: false });
        const pitch = spikePitch(s.v);
        if (pitch !== s.pitch) {
          s.e.setProperty("zoocraft:pitch", pitch);
          s.pitch = pitch;
        }
        continue;
      } catch {
        stop = s.pos;
      }
    }
    if (hit) {
      const w = /** @type {any} */ (hit.player);
      hurt(w.p, k.spike.damage, f.e);
      try {
        const len = Math.hypot(s.v.x, s.v.z) || 1;
        w.p.applyKnockback({ x: (s.v.x / len) * k.spike.knock.h, z: (s.v.z / len) * k.spike.knock.h }, k.spike.knock.v);
      } catch {
        // left
      }
    }
    particle(d, "zoocraft:kong_spike_shatter", stop);
    sound(d, "dig.stone", stop, 2, 1.3);
    sound(d, "random.anvil_land", stop, 0.6, 1.8);
    gone(s.e);
    f.spikes.splice(f.spikes.indexOf(s), 1);
  }
}

function beat(f, d, players, fs) {
  for (const s of f.spikes) gone(s.e);
  f.spikes = [];
  f.pos = { x: f.pos.x, y: f.y, z: f.pos.z };
  setMode(f, "beaten", 0);
  setAct(f, ACT.sit);
  const by = fs.map((w) => w.p.name);
  record = { id: "kong", beaten: true, at: Date.now(), by };
  db.put(COL, record);
  sound(d, "mob.ravager.stun", f.pos, 4, 0.4);
  sound(d, "mob.polarbear.idle", f.pos, 3, 0.4);
  shake(players, f.pos, 30, 0.3);
  for (const p of players) message(p, "§6Augustus Kong sinks down, spent. The Protector of Gods will guard the statue no more.");
}

function face(f, at, step) {
  f.yaw = turnTo(f.yaw, yawTo(at.x - f.pos.x, at.z - f.pos.z), step);
}

function stepFight(f, d, players, now) {
  const k = K();
  const fs = fightersOf(f, players);
  f.t += 1;
  stepSpikes(f, d, fs);
  if (f.beatenDue && f.mode !== "beaten" && f.mode !== "calm") return beat(f, d, players, fs);
  const turn = f.phase === 2 ? k.turn2 : k.turn;
  switch (f.mode) {
    case "calm":
    case "beaten":
      setAct(f, ACT.sit);
      face(f, f.c, 3);
      break;
    case "guard": {
      const g = guardSpot(f.L, k);
      setAct(f, ACT.idle);
      f.yaw = turnTo(f.yaw, g.yaw, 3);
      const near = fs.find((w) => Math.hypot(w.x - f.c.x, w.z - f.c.z) <= k.wake || w.id === f.hitBy);
      if (near) {
        f.target = near.id;
        roar(f, d, fs, "wake");
      }
      break;
    }
    case "home": {
      const g = guardSpot(f.L, k);
      const next = walkStep(f.c, f.pos, g, k.walk, k);
      const moved = Math.hypot(next.x - f.pos.x, next.z - f.pos.z) > 0.01;
      if (moved) f.yaw = turnTo(f.yaw, yawTo(next.x - f.pos.x, next.z - f.pos.z), turn);
      f.pos = { x: next.x, y: f.y, z: next.z };
      setAct(f, moved ? ACT.walk : ACT.idle);
      if (!moved) setMode(f, "guard");
      else if (fs.some((w) => w.id === f.hitBy)) {
        f.target = f.hitBy;
        rest(f);
      }
      break;
    }
    case "roar":
      if (f.t >= f.until) rest(f);
      break;
    case "rest": {
      const tg = pickTarget(f, fs);
      if (!tg) {
        f.lost += 1;
        setAct(f, ACT.idle);
        if (f.lost >= k.forget) {
          // nobody in the chamber for a while: the fight is over
          f.hp = f.max;
          try {
            health(f.e).resetToMaxValue();
          } catch {
            // next time
          }
          f.phase = 1;
          f.roared = false;
          f.last = [];
          f.target = undefined;
          f.hitBy = undefined;
          f.told.clear();
          setMode(f, "home");
        }
        break;
      }
      f.lost = 0;
      if (f.roarDue) {
        f.roarDue = false;
        roar(f, d, fs, "half");
        break;
      }
      const dd = Math.hypot(tg.x - f.pos.x, tg.z - f.pos.z);
      let moved = false;
      if (dd > k.close) {
        const next = walkStep(f.c, f.pos, tg, f.phase === 2 ? k.walk2 : k.walk, k);
        moved = Math.hypot(next.x - f.pos.x, next.z - f.pos.z) > 0.01;
        if (moved) f.yaw = turnTo(f.yaw, yawTo(next.x - f.pos.x, next.z - f.pos.z), turn);
        f.pos = { x: next.x, y: f.y, z: next.z };
      }
      if (!moved) face(f, tg, turn);
      setAct(f, moved ? ACT.walk : ACT.idle);
      if (f.t >= f.until) {
        const m = nextMove(f.c, f.pos, tg, f.y, k, f.phase, Math.random(), f.last);
        f.last.unshift(m);
        f.last.length = Math.min(f.last.length, 3);
        if (m === "slam") crouch(f, d, tg);
        else rip(f, d, tg);
      }
      break;
    }
    case "crouch":
      ring(f, d);
      if (f.plan) face(f, f.plan.land, turn * 1.5);
      if (f.t >= f.until && f.plan) {
        setMode(f, "leap", f.plan.air);
        setAct(f, ACT.leap);
        sound(d, "mob.enderdragon.flap", f.pos, 3, 0.5);
        particle(d, "zoocraft:kong_slam_dust", { x: f.pos.x, y: f.y + 0.3, z: f.pos.z }, 3);
      }
      break;
    case "leap": {
      ring(f, d);
      const p = leapAt(/** @type {any} */ (f.plan), f.t);
      f.pos = { x: p.x, y: f.y + p.y, z: p.z };
      if (f.t >= f.until) {
        f.pos = { x: p.x, y: f.y, z: p.z };
        land(f, d, fs, players);
      }
      break;
    }
    case "slam":
      if (f.t >= f.until) rest(f);
      break;
    case "rip": {
      const tg = fs.find((w) => w.id === f.aim?.id);
      if (tg) f.aim = { x: tg.x, y: tg.y, z: tg.z, id: tg.id };
      if (f.aim) face(f, f.aim, turn);
      if (f.t === Math.round(f.until * 0.55)) {
        const at = aheadOf(f.pos, f.yaw, k.spike.dig.ahead, 0.1, k.spike.dig.side);
        at.y = f.y + 0.1;
        particle(d, "zoocraft:kong_rock_chips", at);
        sound(d, "dig.stone", at, 3, 0.55);
        sound(d, "hit.bone_block", at, 2, 0.5);
      }
      if (f.t >= f.until) {
        setMode(f, "aim", k.spike.aim);
        setAct(f, ACT.aim);
      }
      break;
    }
    case "aim": {
      const tg = fs.find((w) => w.id === f.aim?.id);
      if (tg) f.aim = { x: tg.x, y: tg.y, z: tg.z, id: tg.id };
      if (f.aim) face(f, f.aim, turn * 2);
      if (f.t >= f.until) {
        setMode(f, "throw", k.spike.recover);
        setAct(f, ACT.throw);
      }
      break;
    }
    case "throw":
      if (f.t === k.spike.release && f.aim) launch(f, d);
      if (f.t >= f.until) rest(f);
      break;
    default:
      setMode(f, "rest", 20);
  }
  place(f, now);
}

function place(f, now) {
  const p = f.placed;
  if (Math.abs(p.x - f.pos.x) < 1e-3 && Math.abs(p.y - f.pos.y) < 1e-3 && Math.abs(p.z - f.pos.z) < 1e-3 && Math.abs(p.yaw - f.yaw) < 0.05 && now - p.at < 20) return;
  f.e.teleport(f.pos, { rotation: { x: 0, y: f.yaw }, keepVelocity: false });
  f.placed = { x: f.pos.x, y: f.pos.y, z: f.pos.z, yaw: f.yaw, at: now };
}

/** Every tick: him in the great cave while a player is near it (nobody in Acufend: nothing). */
export function tickKong(now) {
  const d = acufendDimension();
  let players;
  try {
    players = d ? d.getPlayers() : [];
  } catch {
    return;
  }
  if (!players.length) {
    if (fight) endFight();
    areaOff();
    return;
  }
  const L = acuCave();
  if (!L || !d) return;
  const k = K();
  const c = arenaMiddle(L);
  const near = players.some((p) => {
    try {
      return Math.hypot(p.location.x - c.x, p.location.z - c.z) <= k.near;
    } catch {
      return false;
    }
  });
  if (!near) {
    if (fight) endFight();
    areaOff();
    return;
  }
  if (area !== "off" && areaAt !== `${Math.floor(c.x)},${Math.floor(c.z)}`) areaOff();
  areaOn(d, c);
  if (area !== "on") return;
  try {
    if (fight && !fight.e.isValid) endFight(); // gone some other way: put back
    if (!fight) {
      if (!statueThere(d, L)) return; // the cave not built there yet
      startFight(d, L, now);
    }
    stepFight(/** @type {any} */ (fight), d, players, now);
  } catch (error) {
    if (now - lastLog > 600) log(`augustus kong: ${error}`);
    lastLog = now;
    endFight();
  }
}

export function wireKong() {
  // A hit on him: never his last point of health (that hit beats him instead); none at all once he is beaten; his own
  // spikes and slams never hurt him. Read-only here (a before event): what happens is noted for the tick.
  world.beforeEvents.entityHurt.subscribe(
    (ev) => {
      try {
        const f = fight;
        if (!f || ev.hurtEntity.id !== f.e.id) return;
        const cause = String(ev.damageSource.cause);
        if (cause === "selfDestruct" || cause === "void") return; // /kill: he is put back next tick (it does not beat him)
        if (f.mode === "beaten" || f.mode === "calm" || f.beatenDue || ev.damageSource.damagingEntity?.typeId === KONG) {
          ev.cancel = true;
          return;
        }
        // (in a before event his health already has this hit taken off: bench 2026-11-20, as animals/boss.js has it)
        const out = hurtCut(health(ev.hurtEntity).currentValue + ev.damage, ev.damage, cause);
        if (out.damage <= 0) ev.cancel = true;
        else if (out.damage !== ev.damage) ev.damage = out.damage;
        if (out.beaten) f.beatenDue = true;
        const by = ev.damageSource.damagingEntity;
        if (by?.typeId === "minecraft:player") f.hitBy = by.id;
      } catch {
        // never stop a hit for an error here
      }
    },
    { entityFilter: { type: KONG } },
  );
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      const f = fight;
      if (!f) return;
      try {
        if (ev.hurtEntity.id !== f.e.id) return;
        f.hp = Math.max(0, health(f.e).currentValue);
        const phase = phaseOf(f.hp, f.max, K());
        if (phase !== f.phase) f.phase = phase;
        if (phase === 2 && !f.roared) {
          f.roared = true;
          f.roarDue = true;
        }
      } catch {
        // gone
      }
    },
    { entityFilter: { type: KONG } },
  );
  world.afterEvents.entityDie.subscribe(
    (ev) => {
      const f = fight;
      if (!f) return;
      try {
        if (ev.deadEntity.id !== f.e.id) return;
        // /kill: he is put back next tick, whole (it does not beat him)
        for (const s of f.spikes) gone(s.e);
        fight = undefined;
        kept = undefined;
      } catch {
        // gone
      }
    },
    { entityTypes: [KONG] },
  );
}

/** For testing (/zoocraft:kongreset): he guards the statue again, whole, as if never beaten. */
export function resetKong() {
  db.remove(COL, "kong");
  record = null;
  kept = undefined;
  endFight();
}

export function kongDebug() {
  const f = fight;
  return {
    area,
    beaten: kongBeaten() ?? null,
    fight: f ? { mode: f.mode, t: f.t, until: f.until, act: f.act, hp: f.hp, max: f.max, phase: f.phase, pos: f.pos, yaw: Math.round(f.yaw), c: f.c, last: f.last, spikes: f.spikes.length, target: f.target ?? null, plan: f.plan ?? null } : null,
  };
}
