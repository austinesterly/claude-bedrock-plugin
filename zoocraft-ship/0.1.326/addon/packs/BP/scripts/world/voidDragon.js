// The Void Dragon in the game (0.1.318; the rules are world/voidDragonRules.js; Austin's NPC #27 spec, section 5).
// Its arrival: after the two days Darian asks if the player is ready; on yes it comes down out of the sky in a wide
// turn, seen from far off, sits by the bait looking at it (0.1.325), Darian sends the beef through the Void Portal and
// the dragon follows. From then on it is in the void whenever a
// player is: flying round the island, breathing crimson fire, biting whoever comes to its face, resting on the island
// to burn all of it; a purple beam from half health, white with a black fireball from a quarter. A blow to an eye
// counts three times. A player's death there makes it whole again. At a tenth of its health the fight ends: it is not
// killed. It moves by the script alone (the void has nothing to fly into), and nothing is written on the screen.
import { world, system, ListBlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { log, reportError } from "../core/log.js";
import { message } from "../platform/mc.js";
import { residentById } from "../data/residents.js";
import { bondLine } from "../residents/bondRules.js";
import { questHas, markQuest, questRecord, setQuest } from "../residents/darian.js";
import { DARIAN_ID } from "../residents/darianRules.js";
import { getResident } from "../residents/residents.js";
import { beefCells, GIANT_BEEF_BLOCK, BEEF_SHOW } from "../residents/beefRules.js";
import { VOID, ISLE } from "./voidPortalRules.js";
import { ensureIsle } from "./voidPortal.js";
import { wandHolds } from "../residents/wand.js";
import { VOID_DRAGON, DRAGON_EYE, DRAGON_BALL, PARTS, ARRIVAL, partPos, ahead, yawTo, phaseOf, floorHealth, eyeDamage, biteHits, inCone, lineDistance, unit, inFirestorm, circlePoint, perchPoint, nextAttack, steer, turnTo, arrivalNext, landingSpots, descentPath, mayAsk, leanOf, turnBetween, STAND } from "./voidDragonRules.js";

const K = () => BALANCE.voidDragon;
const ACT = { fly: 0, fire: 1, perch: 2, charge: 3, storm: 4, sit: 5 };

/** The fight: { e, eyes, pos, v, yaw, mode, t, wp, until, sinceStorm, biteAt, hp, target, dir, hit, balls } */
let fight;
/** The arrival under way: { part, t, wp, e, show, seat, path, wide, pos, v, yaw, from, handle, playerId } */
let arrival;
let flags = { at: -1000, lured: false, done: false };
// The arena: the island and the sky the dragon flies in are kept loaded while a player is in the void, so it is never
// flown into land that isn't there (a player on an Elytra may be far from the island).
const ARENA = "zoocraft_void_arena";
const ARENA_REACH = 72;
/** "off", "loading" or "on" */
let arena = "off";
let lastLog = -1000;
let isleChecked = false;

function arenaOn(d) {
  if (arena !== "off") return;
  const tam = world.tickingAreaManager;
  const options = { dimension: d, from: { x: ISLE.x - ARENA_REACH, y: 0, z: ISLE.z - ARENA_REACH }, to: { x: ISLE.x + ARENA_REACH, y: 0, z: ISLE.z + ARENA_REACH } };
  try {
    if (tam.hasTickingArea(ARENA)) tam.removeTickingArea(ARENA);
    if (!tam.hasCapacity(options)) return; // tried again next tick
    arena = "loading";
    tam.createTickingArea(ARENA, options).then(
      () => {
        if (arena === "loading") arena = "on";
      },
      () => {
        arena = "off";
      },
    );
  } catch {
    arena = "off";
  }
}

function arenaOff() {
  if (arena === "off") return;
  arena = "off";
  try {
    const tam = world.tickingAreaManager;
    if (tam.hasTickingArea(ARENA)) tam.removeTickingArea(ARENA);
  } catch {
    // gone already
  }
}

function refresh(now) {
  if (now - flags.at < 20) return;
  flags = { at: now, lured: questHas("DRAGON_LURED_TO_VOID"), done: questHas("DRAGON_TRANSFORMED") };
}

function voidDim() {
  try {
    return world.getDimension(VOID);
  } catch {
    return undefined;
  }
}

function gone(e) {
  try {
    if (e?.isValid) e.remove();
  } catch {
    // gone already
  }
}

function particle(d, id, at) {
  try {
    d.spawnParticle(id, at);
  } catch {
    // out of sight
  }
}

function sound(d, id, at, volume = 2, pitch = 1) {
  try {
    d.playSound(id, at, { volume, pitch });
  } catch {
    // nobody to hear it
  }
}

/** 0.1.326: it leans into its turns and tips with its climbs and dives; told to the client only when it changes. */
function setLean(o, e, turn, v) {
  const l = leanOf(turn, v);
  if (o.bank === l.bank && o.pitch === l.pitch) return;
  o.bank = l.bank;
  o.pitch = l.pitch;
  try {
    e.setProperty("zoocraft:bank", l.bank);
    e.setProperty("zoocraft:pitch", l.pitch);
  } catch {
    // unloaded under it
  }
}

function setLook(e, act, white) {
  try {
    if (act !== undefined) e.setProperty("zoocraft:act", act);
    if (white !== undefined) e.setProperty("zoocraft:white", white);
  } catch {
    // unloaded under it
  }
}

function hurt(player, amount, by) {
  try {
    player.applyDamage(amount, by?.isValid ? { cause: /** @type {any} */ ("entityAttack"), damagingEntity: by } : undefined);
  } catch {
    // the player left
  }
}

function health(e) {
  return /** @type {any} */ (e.getComponent("minecraft:health"));
}

function endFight(keep = true) {
  const f = fight;
  if (!f) return;
  if (keep) setQuest({ dragonHp: f.hp });
  for (const x of [f.e, ...f.eyes, ...f.balls.map((b) => b.e)]) gone(x);
  fight = undefined;
}

function startFight(d) {
  const k = K();
  for (const id of [VOID_DRAGON, DRAGON_EYE, DRAGON_BALL]) for (const x of d.getEntities({ type: id })) gone(x); // strays from a closed world
  const pos = { x: ISLE.x, y: ISLE.y + k.fly.height + 30, z: ISLE.z + k.fly.radius };
  const e = d.spawnEntity(VOID_DRAGON, pos);
  const hp = Math.min(k.health, Math.max(Math.ceil(k.health * k.phases.transform) + 1, questRecord().dragonHp ?? k.health));
  health(e).setCurrentValue(hp);
  const eyes = [d.spawnEntity(DRAGON_EYE, pos), d.spawnEntity(DRAGON_EYE, pos)];
  fight = { e, eyes, pos, v: { x: 0, y: 0, z: 0 }, yaw: 180, mode: "circle", t: 0, wp: 0, until: 160, sinceStorm: 0, biteAt: 0, hp, target: undefined, dir: undefined, hit: new Set(), balls: [] };
  e.triggerEvent("zoocraft:fight"); // 0.1.325: its health bar, "Crimson Dragon", for as long as it is fought
  setLook(e, ACT.fly, phaseOf(hp, k.health, k) >= 3);
  markQuest("DRAGON_BOSS_ACTIVE");
  sound(d, "mob.enderdragon.growl", pos, 6, 0.6);
}

function setMode(f, mode, until) {
  f.mode = mode;
  f.t = 0;
  f.until = until;
  f.hit.clear();
}

function nearest(players, at) {
  let best;
  let bd = Infinity;
  for (const p of players) {
    const l = p.location;
    const dd = Math.hypot(l.x - at.x, l.y - at.y, l.z - at.z);
    if (dd < bd) {
      bd = dd;
      best = p;
    }
  }
  return best;
}

function move(f, goal, speed, face) {
  const k = K().fly;
  f.v = steer(f.pos, f.v, goal, speed, k.accel);
  f.pos = { x: f.pos.x + f.v.x, y: f.pos.y + f.v.y, z: f.pos.z + f.v.z };
  const want = face ? yawTo(face.x - f.pos.x, face.z - f.pos.z) : Math.hypot(f.v.x, f.v.z) > 0.02 ? yawTo(f.v.x, f.v.z) : f.yaw;
  const was = f.yaw;
  f.yaw = turnTo(f.yaw, want, k.turn);
  setLean(f, f.e, turnBetween(was, f.yaw), f.v);
}

function place(f) {
  f.e.teleport(f.pos, { rotation: { x: 0, y: f.yaw }, keepVelocity: false });
  const up = (f.mode === "storm" && f.until ? STAND : 0) - 0.6; // standing on the island its head is carried higher
  f.eyes[0].teleport(partPos(f.pos, f.yaw, { ...PARTS.eyeL, y: PARTS.eyeL.y + up }));
  f.eyes[1].teleport(partPos(f.pos, f.yaw, { ...PARTS.eyeR, y: PARTS.eyeR.y + up }));
}

function fireAlong(d, from, dir, range, id, every = 2.2) {
  for (let s = 1.5; s <= range; s += every) particle(d, id, { x: from.x + dir.x * s, y: from.y + dir.y * s, z: from.z + dir.z * s });
}

function stepBalls(f, d, players, k) {
  for (const b of [...f.balls]) {
    b.t += 1;
    b.pos = { x: b.pos.x + b.dir.x * k.fireball.speed, y: b.pos.y + b.dir.y * k.fireball.speed, z: b.pos.z + b.dir.z * k.fireball.speed };
    let burst = b.t >= k.fireball.life;
    for (const p of players) if (Math.hypot(p.location.x - b.pos.x, p.location.y + 0.9 - b.pos.y, p.location.z - b.pos.z) <= 2.2) burst = true;
    if (!burst && b.pos.y <= ISLE.y + 1 && Math.abs(b.pos.x - ISLE.x) <= ISLE.rx && Math.abs(b.pos.z - ISLE.z) <= ISLE.rz) burst = true;
    try {
      if (!burst) {
        b.e.teleport(b.pos);
        if (b.t % 2 === 0) particle(d, "zoocraft:void_black_fire", b.pos);
        continue;
      }
    } catch {
      burst = true;
    }
    for (const p of players) if (Math.hypot(p.location.x - b.pos.x, p.location.y + 0.9 - b.pos.y, p.location.z - b.pos.z) <= k.fireball.radius) hurt(p, k.fireball.damage, f.e);
    particle(d, "zoocraft:void_black_burst", b.pos);
    sound(d, "random.explode", b.pos, 4, 0.6);
    gone(b.e);
    f.balls.splice(f.balls.indexOf(b), 1);
  }
}

function transformed(f, d, players) {
  particle(d, "minecraft:huge_explosion_emitter", f.pos);
  sound(d, "mob.endermen.portal", f.pos, 6, 0.5);
  endFight(false);
  setQuest({ dragonHp: undefined });
  markQuest("DRAGON_TRANSFORMED");
  flags.at = -1000;
  for (const p of players) message(p, "§7The dragon folds in on itself. Where it was, a man all in black and white drops to the island and flees through the portal.");
}

function stepFight(f, d, players, now) {
  if (wandHolds(f.e.id)) return place(f); // 0.1.320: held by the Freezing Wand
  const k = K();
  const phase = phaseOf(f.hp, k.health, k);
  const mouth = () => partPos(f.pos, f.yaw, PARTS.mouth);
  f.t += 1;
  f.sinceStorm += 1;
  if (f.mode === "transform") {
    const goal = { x: ISLE.x, y: ISLE.y + 8, z: ISLE.z };
    move(f, goal, k.fly.speed, undefined);
    place(f);
    if (Math.hypot(f.pos.x - goal.x, f.pos.y - goal.y, f.pos.z - goal.z) < 3 || f.t > 600) transformed(f, d, players);
    return;
  }
  const target = players.find((p) => p.id === f.target) ?? nearest(players, f.pos);
  const tl = target.location;
  const aim = { x: tl.x, y: tl.y + 0.9, z: tl.z };
  if (f.mode === "circle") {
    const goal = circlePoint(f.wp, ISLE, k);
    if (Math.hypot(goal.x - f.pos.x, goal.y - f.pos.y, goal.z - f.pos.z) < 8) f.wp = (f.wp + 1) % k.fly.points;
    move(f, goal, k.fly.speed, undefined);
    if (f.t >= f.until) {
      const next = nextAttack(phase, f.sinceStorm, Math.random, k);
      f.target = players[Math.floor(Math.random() * players.length)].id;
      setMode(f, next, 0);
    }
  } else if (f.mode === "breath") {
    // flies at the player, and breathes once they are in range ahead of it
    const m = mouth();
    const far = Math.hypot(aim.x - m.x, aim.y - m.y, aim.z - m.z);
    move(f, { x: aim.x, y: aim.y + 1, z: aim.z }, far < 10 ? k.fly.speed * 0.4 : k.fly.speed, aim);
    if (!f.until && (far <= k.fire.range * 0.8 || f.t > 240)) {
      f.until = f.t + k.fire.ticks;
      setLook(f.e, ACT.fire);
      sound(d, "mob.enderdragon.growl", m, 5, 0.8);
    }
    if (f.until) {
      const f2 = ahead(f.yaw);
      const flat = Math.hypot(aim.x - m.x, aim.z - m.z);
      const pitch = Math.max(-0.9, Math.min(0.9, (aim.y - m.y) / Math.max(flat, 4)));
      const n = Math.hypot(1, pitch);
      const dir = { x: f2.x / n, y: pitch / n, z: f2.z / n };
      if (f.t % 2 === 0) fireAlong(d, m, dir, k.fire.range, "zoocraft:void_crimson_fire");
      if (f.t % k.fire.every === 0) for (const p of players) if (inCone(m, dir, { x: p.location.x, y: p.location.y + 0.9, z: p.location.z }, k.fire.range, k.fire.cos)) hurt(p, k.fire.damage, f.e);
      if (f.t >= f.until) {
        setLook(f.e, ACT.fly);
        setMode(f, "circle", k.fly.circle[0] + Math.floor(Math.random() * (k.fly.circle[1] - k.fly.circle[0])));
      }
    }
  } else if (f.mode === "beam" || f.mode === "ball") {
    // slows, faces the player, gathers the fire in its mouth, then looses it
    const c = f.mode === "beam" ? k.beam : k.fireball;
    move(f, { x: f.pos.x, y: Math.max(f.pos.y, aim.y), z: f.pos.z }, k.fly.speed * 0.2, f.t <= c.charge ? aim : undefined);
    const m = mouth();
    if (f.t === 1) {
      setLook(f.e, ACT.charge);
      sound(d, "mob.enderdragon.growl", m, 5, 0.5);
    }
    if (f.t <= c.charge) {
      if (f.t % 3 === 0) particle(d, f.mode === "beam" ? "zoocraft:void_purple_fire" : "zoocraft:void_black_fire", m);
      if (f.t === c.charge) f.dir = unit(m, aim);
    } else if (f.mode === "beam") {
      const end = { x: m.x + f.dir.x * k.beam.range, y: m.y + f.dir.y * k.beam.range, z: m.z + f.dir.z * k.beam.range };
      if (f.t % 2 === 0) fireAlong(d, m, f.dir, k.beam.range, "zoocraft:void_purple_fire", 1.6);
      if (f.t === c.charge + 1) sound(d, "mob.warden.sonic_boom", m, 6, 0.7);
      for (const p of players) {
        if (f.hit.has(p.id) || lineDistance(m, end, { x: p.location.x, y: p.location.y + 0.9, z: p.location.z }) > k.beam.width) continue;
        f.hit.add(p.id);
        hurt(p, k.beam.damage, f.e);
      }
      if (f.t >= c.charge + k.beam.ticks) {
        setLook(f.e, ACT.fly);
        setMode(f, "circle", k.fly.circle[0]);
      }
    } else {
      f.balls.push({ e: d.spawnEntity(DRAGON_BALL, m), pos: m, dir: f.dir, t: 0 });
      sound(d, "mob.ghast.fireball", m, 5, 0.5);
      setLook(f.e, ACT.fly);
      setMode(f, "circle", k.fly.circle[0]);
    }
  } else if (f.mode === "storm") {
    // rests its wings on the island and burns all of it: only the air above is safe
    const perch = perchPoint(ISLE);
    const s = k.firestorm;
    if (!f.until) {
      move(f, perch, k.fly.speed, undefined);
      if (Math.hypot(perch.x - f.pos.x, perch.y - f.pos.y, perch.z - f.pos.z) < 1.5 || f.t > 500) {
        f.until = f.t + s.warn + s.ticks;
        f.v = { x: 0, y: 0, z: 0 };
        setLook(f.e, ACT.perch);
        sound(d, "mob.enderdragon.growl", perch, 8, 0.5);
      }
    } else {
      f.yaw = turnTo(f.yaw, 180, 4);
      const left = f.until - f.t;
      if (left <= s.ticks) {
        if (left === s.ticks) setLook(f.e, ACT.storm);
        if (f.t % 4 === 0) for (let i = 0; i < 10; i++) particle(d, "zoocraft:void_crimson_fire", { x: ISLE.x + (Math.random() * 2 - 1) * ISLE.rx, y: ISLE.y + 1 + Math.random() * s.height, z: ISLE.z + (Math.random() * 2 - 1) * ISLE.rz });
        if (left % s.tick === 0) {
          for (const p of players) if (inFirestorm(p.location, ISLE, k)) hurt(p, s.damage, f.e);
          sound(d, "mob.blaze.shoot", perch, 4, 0.6);
        }
      }
      if (left <= 0) {
        f.sinceStorm = 0;
        setLook(f.e, ACT.fly);
        setMode(f, "circle", k.fly.circle[0]);
      }
    }
  }
  place(f);
  // the bite: whoever comes to its face
  if (f.mode !== "storm" && now >= f.biteAt) {
    for (const p of players) {
      if (!biteHits(f.pos, f.yaw, { x: p.location.x, y: p.location.y + 0.9, z: p.location.z }, k)) continue;
      f.biteAt = now + k.bite.cooldown;
      hurt(p, k.bite.damage, f.e);
      try {
        const a = ahead(f.yaw);
        p.applyKnockback({ x: a.x * k.bite.knock.h, z: a.z * k.bite.knock.h }, k.bite.knock.v); // one blow, out of the air
        p.addEffect("blindness", k.bite.blindness, { showParticles: false });
      } catch {
        // the player left
      }
      sound(d, "mob.ravager.bite", p.location, 4, 0.6);
      break;
    }
  }
  stepBalls(f, d, players, k);
}

/** Every tick: the dragon in the void while a player is there. */
export function tickVoidDragon(now) {
  refresh(now);
  if (!flags.lured || flags.done) {
    if (fight) endFight();
    arenaOff();
    return;
  }
  const d = voidDim();
  if (!d) return;
  let players;
  try {
    players = d.getPlayers();
  } catch {
    return;
  }
  if (!players.length) {
    if (fight) endFight(); // it keeps its health for when they come back
    arenaOff();
    return;
  }
  arenaOn(d);
  if (arena !== "on") return;
  if (!isleChecked) {
    // 0.1.325: a player already in the void when the island's portal became the small one
    isleChecked = true;
    if ((questRecord().isle ?? 0) < 2) ensureIsle().catch(() => {});
  }
  try {
    if (fight && !(fight.e.isValid && fight.eyes[0].isValid && fight.eyes[1].isValid)) endFight(); // flown out of the loaded land: it comes back
    if (!fight) startFight(d);
    stepFight(/** @type {any} */ (fight), d, players, now);
  } catch (error) {
    if (now - lastLog > 600) log(`void dragon: ${error}`);
    lastLog = now;
    endFight();
  }
}

function struck(f, k, before) {
  if (f.mode === "transform") return;
  const was = phaseOf(before, k.health, k);
  f.hp = floorHealth(f.hp, k.health, k);
  try {
    if (f.e.isValid && health(f.e).currentValue < f.hp) health(f.e).setCurrentValue(f.hp);
  } catch {
    // gone
  }
  const phase = phaseOf(f.hp, k.health, k);
  if (phase === 4) {
    // normal combat ends: it is not killed
    try {
      f.e.triggerEvent("zoocraft:spent");
    } catch {
      // gone
    }
    for (const b of f.balls) gone(b.e);
    f.balls = [];
    setLook(f.e, ACT.fly);
    setMode(f, "transform", 0);
  } else if (phase !== was && phase === 3) {
    setLook(f.e, undefined, true); // white from a quarter of its health
    sound(f.e.dimension, "mob.enderdragon.growl", f.pos, 8, 1.4);
  }
}

export function wireVoidDragon() {
  world.afterEvents.entityHurt.subscribe((e) => {
    const f = fight;
    if (!f) return;
    const k = K();
    try {
      if (e.hurtEntity.id === f.e.id) {
        const before = f.hp;
        f.hp = Math.max(0, health(f.e).currentValue);
        struck(f, k, before);
      } else if (f.eyes.some((x) => x.id === e.hurtEntity.id)) {
        // an eye: three times the blow, taken by the dragon
        health(e.hurtEntity).resetToMaxValue();
        if (f.mode === "transform") return;
        const by = e.damageSource.damagingEntity;
        f.e.applyDamage(eyeDamage(e.damage, k), by?.isValid ? { cause: /** @type {any} */ ("entityAttack"), damagingEntity: by } : undefined);
      }
    } catch (error) {
      reportError("void dragon", error);
    }
  });
  world.afterEvents.entityDie.subscribe((e) => {
    const f = fight;
    if (!f) return;
    try {
      if (e.deadEntity.id === f.e.id) {
        // a blow past its last tenth all at once: the fight ends the same way
        const d = voidDim();
        if (d) transformed(f, d, d.getPlayers());
      } else if (e.deadEntity.typeId === "minecraft:player" && f.mode !== "transform") {
        // it takes that player's life force: whole again
        const k = K();
        f.hp = k.health;
        health(f.e).resetToMaxValue();
        setLook(f.e, undefined, false);
        const d = voidDim();
        for (const p of d ? d.getPlayers() : []) message(p, "§7The dragon drinks in the life that was lost. It is whole again.");
      }
    } catch (error) {
      reportError("void dragon", error);
    }
  });
}

// ---- the arrival

function say(player, key) {
  const res = residentById(DARIAN_ID);
  message(player, `§f${res?.name ?? "Darian"}: §7"${bondLine(res, key)}"`);
}

/** Whether Darian asks this player if they are ready (ui/residentMenu.js): the bait hangs, the two days have passed. */
export function dragonAskDue() {
  if (arrival) return false;
  const q = questRecord();
  const due = mayAsk({ waitStarted: questHas("DRAGON_WAIT_STARTED"), beef: q.beef, lured: questHas("DRAGON_LURED_TO_VOID") }, world.getDay(), BALANCE.darian.beef);
  if (due) markQuest("DRAGON_READY");
  return due;
}

// The land the dragon comes down over is kept loaded for its arrival, so it can be seen from far off.
const ARRIVAL_AREA = "zoocraft_dragon_arrival";
const ARRIVAL_REACH = 72;

function arrivalAreaOff() {
  try {
    const tam = world.tickingAreaManager;
    if (tam.hasTickingArea(ARRIVAL_AREA)) tam.removeTickingArea(ARRIVAL_AREA);
  } catch {
    // gone already
  }
}

/** The ground a seat would be on: the top of the highest block there, or undefined if it can't be read. */
function groundAt(d, x, z) {
  try {
    const top = d.getTopmostBlock({ x: Math.floor(x), z: Math.floor(z) });
    return top ? top.y + 1 : undefined;
  } catch {
    return undefined;
  }
}

/** Where it sits: the spot whose ground is nearest the bait's own height (not up a tree, not down a pit). */
function pickSeat(d, b, mid) {
  let best;
  for (const s of landingSpots(b, mid)) {
    const y = groundAt(d, s.x, s.z);
    if (y === undefined) continue;
    const off = Math.abs(y - (b.y - 2)) + (y > b.y + 1 ? 20 : 0);
    if (!best || off < best.off) best = { ...s, y, off };
  }
  return best ?? { ...landingSpots(b, mid)[0], y: b.y - 2 };
}

function endArrival(player) {
  const a = arrival;
  if (!a) return;
  if (a.handle !== undefined) system.clearRun(a.handle);
  gone(a.e);
  gone(a.show);
  arrival = undefined;
  arrivalAreaOff();
  const b = a.bait ?? questRecord().beef;
  if (b) {
    try {
      world.getDimension(b.d).fillBlocks(new ListBlockVolume(beefCells(b)), "minecraft:air", { blockFilter: { includeTypes: [GIANT_BEEF_BLOCK] } });
    } catch {
      // unloaded: the blocks stay, the bait is spent all the same
    }
  }
  if (a.replay) return; // shown again for a look (/zoocraft:dragonarrival): the quest stands as it stood
  setQuest({ beef: undefined, dragonHp: undefined });
  markQuest("DRAGON_LURED_TO_VOID");
  flags.at = -1000;
  if (player) {
    say(player, "dragonTrapped");
    say(player, "dragonWarn");
  }
}

function stepArrival() {
  const a = arrival;
  if (!a) return;
  const player = world.getAllPlayers().find((p) => p.id === a.playerId);
  try {
    const q = questRecord();
    const b = a.bait ?? q.beef;
    const portal = q.portal;
    if (!b || !portal) return endArrival(player);
    const d = world.getDimension(b.d);
    const k = K().fly;
    const mid = { x: portal.x + 0.5, y: portal.y + portal.size / 2, z: portal.z + 0.5 };
    const food = { x: b.x + 0.5, y: b.y, z: b.z + 0.5 };
    if (!a.e) {
      a.seat = pickSeat(d, b, mid);
      a.path = descentPath(b, a.seat, a.wide ? 1 : 0.55);
      a.pos = { ...a.path.start, y: Math.min(a.path.start.y, d.heightRange.max - 6) };
      a.yaw = yawTo(a.path.points[0].x - a.pos.x, a.path.points[0].z - a.pos.z);
      a.e = d.spawnEntity(VOID_DRAGON, a.pos);
      a.e.triggerEvent("zoocraft:spent"); // nothing hurts it here
      setLook(a.e, ACT.fly, false);
      sound(d, "mob.enderdragon.growl", food, 16, 0.5);
    }
    let landed = false;
    let through = false;
    if (a.part === "descend") {
      const last = a.wp === a.path.points.length - 1;
      const goal = a.path.points[a.wp];
      a.v = steer(a.pos, a.v, goal, last ? k.speed * 0.8 : k.speed * 1.2, k.accel * 1.5, last ? 14 : 6);
      const far = Math.hypot(goal.x - a.pos.x, goal.y - a.pos.y, goal.z - a.pos.z);
      if (!last && far < 8) a.wp += 1;
      landed = last && far < 1.2;
      if (a.t % 100 === 60) sound(d, "mob.enderdragon.flap", a.pos, 12, 0.7);
    } else if (a.part === "sit") {
      // settles the last of the way down and turns its head to the food
      a.v = { x: (a.seat.x - a.pos.x) * 0.15, y: (a.seat.y - a.pos.y) * 0.15, z: (a.seat.z - a.pos.z) * 0.15 };
      a.yaw = turnTo(a.yaw, yawTo(food.x - a.pos.x, food.z - a.pos.z), 4);
      if (a.t === 0) {
        setLook(a.e, ACT.sit);
        sound(d, "mob.enderdragon.growl", a.pos, 10, 0.7);
      }
      if (a.t === 70) sound(d, "mob.ravager.roar", a.pos, 6, 0.6);
    } else if (a.part === "push") {
      if (!a.show) {
        // Darian sends the beef through the portal
        d.fillBlocks(new ListBlockVolume(beefCells(b)), "minecraft:air", { blockFilter: { includeTypes: [GIANT_BEEF_BLOCK] } });
        a.from = { x: b.x + 0.5, y: b.y - 1, z: b.z + 0.5 };
        a.show = d.spawnEntity(BEEF_SHOW, a.from);
        const rec = getResident(DARIAN_ID);
        if (rec) for (const up of [0.5, 1.2, 1.9]) particle(d, "minecraft:mob_portal", { x: rec.pos.x, y: rec.pos.y + up, z: rec.pos.z });
        sound(d, "mob.evocation_illager.cast_spell", food, 3, 1);
      }
      const f = Math.min(1, a.t / ARRIVAL.push);
      const to = { x: mid.x, y: mid.y - 1.5, z: mid.z };
      const at = { x: a.from.x + (to.x - a.from.x) * f, y: a.from.y + (to.y - a.from.y) * f, z: a.from.z + (to.z - a.from.z) * f };
      if (a.show?.isValid) a.show.teleport(at);
      // its eyes follow the meat
      a.v = { x: 0, y: 0, z: 0 };
      a.yaw = turnTo(a.yaw, yawTo(at.x - a.pos.x, at.z - a.pos.z), 5);
    } else if (a.part === "follow") {
      if (a.show) {
        particle(d, "minecraft:mob_portal", mid);
        gone(a.show);
        a.show = undefined;
        sound(d, "portal.travel", mid, 1, 1.2);
        setLook(a.e, ACT.fly);
        sound(d, "mob.enderdragon.growl", a.pos, 12, 0.9);
      }
      a.v = steer(a.pos, a.v, mid, k.speed * 1.2, k.accel * 2.5, 2);
      through = Math.hypot(a.pos.x - mid.x, a.pos.y - mid.y, a.pos.z - mid.z) < 2.5;
    }
    const next = arrivalNext(a.part, a.t, { landed, through });
    if (next === "done") {
      sound(d, "portal.travel", mid, 1.5, 0.7);
      return endArrival(player);
    }
    a.pos = { x: a.pos.x + a.v.x, y: a.pos.y + a.v.y, z: a.pos.z + a.v.z };
    const was = a.yaw;
    if (a.part !== "sit" && a.part !== "push" && Math.hypot(a.v.x, a.v.z) > 0.02) a.yaw = turnTo(a.yaw, yawTo(a.v.x, a.v.z), 8);
    setLean(a, a.e, a.part === "sit" || a.part === "push" ? 0 : turnBetween(was, a.yaw), a.part === "sit" || a.part === "push" ? { x: 0, y: 0, z: 0 } : a.v);
    a.e.teleport(a.pos, { rotation: { x: 0, y: a.yaw }, keepVelocity: false });
    if (next !== a.part) {
      a.part = next;
      a.t = 0;
    } else a.t += 1;
  } catch (error) {
    // the land went from under it: the dragon is through all the same
    log(`void dragon: the arrival was cut short: ${error}`);
    endArrival(player);
  }
}

function launch(player, b, replay) {
  const a = { part: "descend", t: 0, wp: 0, e: undefined, show: undefined, seat: undefined, path: undefined, wide: false, pos: { x: 0, y: 0, z: 0 }, v: { x: 0, y: 0, z: 0 }, yaw: 0, from: undefined, playerId: player.id, bait: replay ? b : undefined, replay, handle: /** @type {number | undefined} */ (undefined) };
  arrival = a;
  const begin = (wide) => {
    if (arrival !== a || a.handle !== undefined) return;
    a.wide = wide;
    a.handle = system.runInterval(stepArrival, 1);
  };
  // the sky it comes down through is loaded first, so it is seen from far off; without it, it comes from nearer
  try {
    const tam = world.tickingAreaManager;
    const options = { dimension: world.getDimension(b.d), from: { x: b.x - ARRIVAL_REACH, y: 0, z: b.z - ARRIVAL_REACH }, to: { x: b.x + ARRIVAL_REACH, y: 0, z: b.z + ARRIVAL_REACH } };
    if (tam.hasTickingArea(ARRIVAL_AREA)) tam.removeTickingArea(ARRIVAL_AREA);
    if (!tam.hasCapacity(options)) begin(false);
    else tam.createTickingArea(ARRIVAL_AREA, options).then(() => begin(true), () => begin(false));
  } catch {
    begin(false);
  }
}

/** The player said yes: the dragon comes for the bait. Returns whether it began. */
export function startArrival(player) {
  if (arrival || !dragonAskDue()) return false;
  launch(player, questRecord().beef, false);
  return true;
}

/**
 * For testing (/zoocraft:dragonarrival): the arrival shown again at the lit Void Portal, with a Giant Beef hung for it
 * on the runner's side of the portal (only into air). Nothing of the quest changes. Returns what to tell them.
 */
export function replayArrival(player) {
  if (arrival) return "The dragon is already on its way.";
  const q = questRecord();
  const portal = q.portal;
  if (!portal || portal.d !== player.dimension.id) return "There is no lit Void Portal in this dimension. Light one first.";
  if (q.beef && !questHas("DRAGON_LURED_TO_VOID")) return "The Giant Beef still hangs for the real thing: talk to Darian when the two days have passed.";
  const across = portal.axis === "x" ? "z" : "x";
  const side = player.location[across] >= portal[across] + 0.5 ? 1 : -1;
  const b = { d: portal.d, x: portal.x, y: portal.y + 4, z: portal.z };
  b[across] += side * 9;
  try {
    player.dimension.fillBlocks(new ListBlockVolume(beefCells(b)), GIANT_BEEF_BLOCK, { blockFilter: { includeTypes: ["minecraft:air"] } });
  } catch {
    return "The land in front of the portal isn't loaded. Stand nearer and try again.";
  }
  launch(player, b, true);
  return "A Giant Beef hangs in front of the portal. Step back and look up: the dragon is coming.";
}

/** For the test server. */
export function voidDragonDebug() {
  const f = fight;
  return {
    arrival: arrival ? { t: arrival.t, part: arrival.part, wp: arrival.wp, wide: arrival.wide, seat: arrival.seat, pos: [arrival.pos.x, arrival.pos.y, arrival.pos.z].map((n) => Math.round(n)), yaw: Math.round(arrival.yaw), act: arrival.e?.isValid ? arrival.e.getProperty("zoocraft:act") : undefined } : undefined,
    fight: f ? { mode: f.mode, t: f.t, hp: f.hp, health: f.e.isValid ? health(f.e).currentValue : undefined, pos: [f.pos.x, f.pos.y, f.pos.z].map((n) => Math.round(n)), yaw: Math.round(f.yaw), balls: f.balls.length, sinceStorm: f.sinceStorm, white: f.e.isValid ? f.e.getProperty("zoocraft:white") : undefined } : undefined,
  };
}

/** For the test server: its next move, or its health. */
export function voidDragonForce(what, value) {
  const f = fight;
  if (!f) return false;
  if (what === "hp") {
    const before = f.hp;
    health(f.e).setCurrentValue(value);
    f.hp = value;
    struck(f, K(), before);
  } else setMode(f, what, 0);
  return true;
}
