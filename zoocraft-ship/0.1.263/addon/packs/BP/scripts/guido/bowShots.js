// What a ZooCraft bow does with the game's own arrow (0.1.261; 0.1.263: every bow's TwoDogs power, Austin 12 Nov: "I
// want all the abilities the same for each bow, just use vanilla arrows only instead"). Numbers: data/bows.js and
// balance.js residents.bowCase (shots, powers); the parts with no game in them: guido/bowRules.js.
//
// The player's arrow is the game's, fired by the game's bow code (minecraft:shooter), and stays theirs to pick up as
// ever. Its speed is scaled by the bow's power, which scales its damage and reach the way a stronger draw does. Then:
// - Scrap Bow: three more arrows in a 16-degree cone (four in all). Twin Fang: a second arrow beside the first.
//   Ballista: four arrows in a ring. Every arrow of one shot that strikes the same hostile mob counts in full (inside a
//   mob's hurt time the game counts only the biggest of them; what it leaves out is added straight after, as damage
//   that doesn't wait for the hurt time, the shooter's).
// - Needle Bow: a headshot on a hostile mob does double. Proximity Bow: the arrow turns toward the nearest hostile mob
//   ahead of it. Vexcaller: a hit on a hostile mob calls a vex that fights hostile mobs for a while.
// - Sonic Bow: a dead-straight shot, 64 blocks, through every hostile mob in its way, pulling zombies onto its line.
//   Scorpion: on through up to seven hostile mobs.
// - Blightbloom: a spore cloud where the arrow first lands, hurting hostile mobs in it every second. Blaze: the arrow
//   burns (as with Flame), and a hostile mob it sets burning takes more each second it burns. Panda: hearts behind it.
// The extra arrows (a volley's, and the one carrying a shot on through a mob) are the game's arrow too, made here: the
// shooter's, gone as soon as they land or after a few seconds, so none can ever be picked up. The powers only go after
// hostile mobs that aren't the zoo's (isFoe): zoo animals, zoo and calmed mobs, residents, guests and players are hit
// by an arrow just as the game's arrow hits them, never more.
import { world, system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { powerOf, unit, scaled, along, coneDirs, ringDirs, twinOffset, isHeadshot, inSeekCone, turnToward, pullToward, travelled, hurtSeen, owedDamage, arrowDamage, isFoe, NOT_FOES, overMax } from "./bowRules.js";
import { heldBow } from "./bowCase.js";

export const EXTRA_TAG = "zoocraft_bow_arrow"; // an extra arrow made here: never left lying about
export const VEX_TYPE = "zoocraft:bow_vex";
const ARROW = "minecraft:arrow";
const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
const FOES = { families: ["monster"], excludeFamilies: NOT_FOES };

const shots = new Map(); // arrow id -> what it is (shot())
const windows = new Map(); // mob id -> its hurt time { start, level } (bowRules hurtSeen)
const struck = new Map(); // arrow id -> what the game gave the mob it struck { reported, before, fresh }
let owing = new Map(); // mob id -> this tick's hits on it by the bows' arrows
let settling = false;
const clouds = []; // Blightbloom spore clouds
const burning = new Map(); // mob id -> { until, owner, more }: a Blaze arrow set it burning
const vexes = new Map(); // player id -> their called vexes' ids, oldest first

const g = () => BALANCE.residents.bowCase.shots;
const P = () => BALANCE.residents.bowCase.powers;
const speedOf = (v) => Math.hypot(v.x, v.y, v.z);

function familiesOf(e) {
  try {
    return e.getComponent("minecraft:type_family")?.getTypeFamilies() ?? [];
  } catch {
    return [];
  }
}

const foe = (e) => isFoe(familiesOf(e));

function chest(e) {
  try {
    const h = e.getHeadLocation();
    return { x: e.location.x, y: (e.location.y + h.y) / 2, z: e.location.z };
  } catch {
    return e.location;
  }
}

function playerById(id) {
  if (!id) return undefined;
  let p;
  try {
    p = world.getEntity(id) ?? world.getPlayers().find((q) => q.id === id);
  } catch {
    p = undefined;
  }
  return p?.isValid ? p : undefined;
}

/** What an arrow of a ZooCraft bow is, for as long as it's followed. */
function shot(bow, ownerId, arrow, vel, extra, from) {
  const now = system.currentTick;
  const pw = bow.power ?? {};
  return {
    bow: bow.id,
    kind: pw.kind,
    pw,
    owner: ownerId,
    extra,
    born: now,
    until: now + (extra ? P().extraTicks : g().keepTicks),
    trailUntil: now + g().trailTicks,
    vel,
    pos: arrow.location,
    from: from ?? arrow.location,
    left: pw.kind === "pierce" ? pw.through : pw.kind === "sonic" ? Infinity : 0,
    hit: new Set(),
    pulled: new Set(),
    landed: false,
  };
}

/** An extra arrow: the game's arrow, the shooter's, flying `vel` from `at`. Known here before its spawn event comes. */
function makeArrow(dim, at, vel, ownerId, bow, from) {
  let a;
  try {
    a = dim.spawnEntity(ARROW, at);
  } catch {
    return undefined;
  }
  shots.set(a.id, shot(bow, ownerId, a, vel, true, from));
  try {
    a.addTag(EXTRA_TAG);
    const pr = a.getComponent("minecraft:projectile");
    const owner = playerById(ownerId);
    if (owner) pr.owner = owner;
    if (bow.power?.kind === "sonic") pr.gravity = 0;
    pr.shoot(vel);
  } catch {
    takeAway(a.id);
    return undefined;
  }
  return a;
}

function takeAway(id) {
  shots.delete(id);
  try {
    const a = world.getEntity(id);
    if (a?.isValid) a.remove();
  } catch {
    // gone already
  }
}

/** An arrow from a player holding one of ZooCraft's bows: its power, and the shot's other arrows. */
function launched(arrow) {
  if (shots.has(arrow.id)) return; // an extra made here
  let owner;
  let pr;
  try {
    pr = arrow.getComponent("minecraft:projectile");
    owner = pr?.owner;
  } catch {
    owner = undefined;
  }
  if (owner?.typeId !== "minecraft:player") return;
  const bow = heldBow(owner);
  if (!bow) return;
  const kind = bow.power?.kind;
  const p = powerOf(bow.damage, g());
  let v;
  try {
    v = arrow.getVelocity();
  } catch {
    return; // gone this tick
  }
  const d = unit(v);
  const sp = speedOf(v) * p;
  const ring = kind === "ring" ? ringDirs(d, bow.power.arrows, P().ring.deg) : undefined;
  const vel = ring ? scaled(ring[0], sp) : scaled(d, sp);
  if (p !== 1 || ring) {
    try {
      arrow.clearVelocity();
      arrow.applyImpulse(vel);
    } catch {
      // the arrow went this tick: it flies as the game's bow sent it
    }
  }
  try {
    if (kind === "sonic") pr.gravity = 0; // dead straight
    if (kind === "burn") arrow.setOnFire(g().fireSeconds, true);
  } catch {
    // already gone
  }
  shots.set(arrow.id, shot(bow, owner.id, arrow, vel, false));
  const dim = arrow.dimension;
  const at = arrow.location;
  if (kind === "cone") for (const dir of coneDirs(d, bow.power.arrows - 1, bow.power.spreadDeg)) makeArrow(dim, at, scaled(dir, sp), owner.id, bow);
  else if (kind === "twin") for (let i = 1; i < bow.power.arrows; i++) makeArrow(dim, along(at, twinOffset(d, P().twin.apart * i)), vel, owner.id, bow);
  else if (ring) for (const dir of ring.slice(1)) makeArrow(dim, at, scaled(dir, sp), owner.id, bow);
  else if (kind === "sonic") {
    try {
      dim.playSound("mob.warden.sonic_boom", at, { volume: 0.6 });
    } catch {
      // no sound
    }
  }
}

/** A hit by one of the bows' arrows on a hostile mob: counted for the settling up next tick. */
function owe(target, h) {
  const list = owing.get(target.id) ?? [];
  list.push(h);
  owing.set(target.id, list);
  if (!settling) {
    settling = true;
    system.run(settleUp);
  }
}

/** Last tick's hits: each mob struck gets what the arrows that struck it still owe it (bowRules owedDamage). */
function settleUp() {
  settling = false;
  const todo = owing;
  owing = new Map();
  for (const [id, hits] of todo) {
    const t = world.getEntity(id);
    if (!t?.isValid) continue;
    const w = windows.get(id);
    const inWindow = Boolean(w) && system.currentTick - 1 - w.start < P().hurtTicks;
    const owed = owedDamage(hits.map((h) => ({ ...(struck.get(h.arrow) ?? {}), expected: h.expected, mult: h.mult, inWindow })));
    if (owed > 0) addDamage(t, owed, hits[0].owner);
  }
  struck.clear();
}

/**
 * `amount` more on a mob. "override" is the one kind of damage the game lands in full inside a mob's hurt time (the
 * test server: entityAttack, magic, fire and void are all held back by it), so what a power adds is never lost to it.
 * What an arrow adds as it strikes is the shooter's (`ownerId`: the kill and its drops are theirs); a cloud's or
 * burning's each second comes from no one, so it doesn't knock the mob back each time (the arrow that started it
 * still makes the kill the player's, as the game's burning does).
 */
function addDamage(t, amount, ownerId) {
  const by = ownerId ? playerById(ownerId) : undefined;
  try {
    t.applyDamage(amount, by ? { cause: "override", damagingEntity: by } : { cause: "override" });
  } catch {
    // it can't be hurt now
  }
}

/** The Vexcaller: a vex over the mob it hit, the player's, fighting hostile mobs until it fades. */
function callVex(ownerId, hit) {
  const at = { x: hit.location.x, y: hit.location.y + P().vex.above, z: hit.location.z };
  let v;
  try {
    v = hit.dimension.spawnEntity(VEX_TYPE, at);
    hit.dimension.spawnParticle("minecraft:evoker_spell", at);
    hit.dimension.playSound("mob.vex.charge", at);
  } catch {
    if (!v) return;
  }
  const list = (vexes.get(ownerId) ?? []).filter((id) => world.getEntity(id)?.isValid);
  list.push(v.id);
  for (const old of overMax(list, P().vex.maxPerPlayer)) {
    try {
      world.getEntity(old)?.remove();
    } catch {
      // gone
    }
  }
  vexes.set(ownerId, list.slice(-P().vex.maxPerPlayer));
}

/** Blightbloom: a spore cloud at `at`, the player's. */
function sporeCloud(dim, at, ownerId, perSecond) {
  const now = system.currentTick;
  const mine = clouds.filter((c) => c.owner === ownerId);
  for (const old of overMax(mine, P().spores.maxPerPlayer - 1)) clouds.splice(clouds.indexOf(old), 1);
  clouds.push({ dim, at, owner: ownerId, perSecond, until: now + P().spores.seconds * 20, next: now + 20 });
}

/** The world events: arrows leaving a bow, arrows striking and landing, hurts, and each tick's flight. */
export function wireBowShots() {
  world.afterEvents.entitySpawn.subscribe((e) => {
    const arrow = e.entity;
    try {
      if (arrow?.typeId === ARROW && arrow.isValid) launched(arrow);
    } catch {
      // gone at once
    }
  });

  // Every hurt: each mob's hurt time (so what's added lands in full), what the game gave each of the bows' arrows,
  // and a Blaze-burnt mob's burning.
  world.afterEvents.entityHurt.subscribe((e) => {
    let tid;
    try {
      tid = e.hurtEntity.id;
    } catch {
      return;
    }
    const now = system.currentTick;
    if (e.damageSource?.cause === "override") return; // what the powers add: it never counts in the hurt time
    const w = hurtSeen(windows.get(tid), now, e.damage, P().hurtTicks);
    windows.set(tid, { start: w.start, level: w.level });
    let pid;
    try {
      pid = e.damageSource?.damagingProjectile?.id;
    } catch {
      pid = undefined;
    }
    if (pid && shots.has(pid)) struck.set(pid, { reported: e.damage, before: w.before, fresh: w.fresh });
    if (e.damageSource?.cause === "fireTick") {
      const b = burning.get(tid);
      if (b && now <= b.until) {
        const t = e.hurtEntity;
        system.run(() => {
          if (t.isValid) addDamage(t, b.more);
        });
      }
    }
  });

  world.afterEvents.projectileHitEntity.subscribe((e) => {
    let id;
    try {
      id = e.projectile?.id;
    } catch {
      id = undefined;
    }
    const s = id ? shots.get(id) : undefined;
    if (!s) return;
    let hit;
    try {
      hit = e.getEntityHit()?.entity;
    } catch {
      hit = undefined;
    }
    if (s.kind === "spores" && !s.extra && !s.landed) sporeCloud(e.dimension, e.location, s.owner, s.pw.perSecond);
    s.landed = true;
    if (!hit || s.hit.has(hit.id) || !foe(hit)) return; // anything else: the game's arrow, nothing more
    s.hit.add(hit.id);
    let mult = 1;
    if (s.kind === "headshot") {
      try {
        if (isHeadshot(e.location.y, hit.getHeadLocation().y, P().headshot)) {
          mult = s.pw.times;
          e.dimension.spawnParticle("minecraft:critical_hit_emitter", e.location);
        }
      } catch {
        // no head to speak of
      }
    }
    owe(hit, { arrow: id, owner: s.owner, expected: arrowDamage(hitSpeed(s)), mult });
    if (s.kind === "vex") callVex(s.owner, hit);
    if (s.kind === "burn") {
      burning.set(hit.id, { until: system.currentTick + P().burn.seconds * 20, owner: s.owner, more: s.pw.perSecond - 1 });
      try {
        hit.setOnFire(P().burn.seconds, true);
      } catch {
        // fireproof, or gone
      }
    }
    if (s.left > 0) carryOn(e, s, hit, e.hitVector);
  });

  // An extra arrow that lands goes at once (it can't be picked up); a Blightbloom arrow's spores.
  world.afterEvents.projectileHitBlock.subscribe((e) => {
    let id;
    try {
      id = e.projectile?.id;
    } catch {
      id = undefined;
    }
    const s = id ? shots.get(id) : undefined;
    if (!s) return;
    if (s.kind === "spores" && !s.extra && !s.landed) sporeCloud(e.dimension, e.location, s.owner, s.pw.perSecond);
    s.landed = true;
    if (s.extra) system.run(() => takeAway(id));
  });

  // An extra arrow left from before a reload, or in ground that was unloaded: it goes as soon as it's seen.
  world.afterEvents.entityLoad.subscribe(({ entity }) => {
    try {
      if (entity.typeId === ARROW && !shots.has(entity.id) && entity.hasTag(EXTRA_TAG)) entity.remove();
    } catch {
      // gone
    }
  });
  system.runInterval(sweep, P().sweepTicks);
  system.runInterval(flight, 1);
}

/**
 * How fast an arrow was going when it struck: the faster of its last two ticks (the tick it struck in, an arrow that
 * bounced off is already slow).
 */
function hitSpeed(s) {
  return Math.max(speedOf(s.vel), s.prev ? speedOf(s.prev) : 0);
}

/** The shot carries on through `hit` (Scorpion, Sonic Bow): a new arrow just past the far side of it, as fast. */
function carryOn(e, s, hit, dir) {
  const d = unit(dir ?? s.vel);
  const vel = scaled(d, hitSpeed(s));
  const probe = P().probe;
  let exit = 0;
  try {
    const back = e.dimension.getEntitiesFromRay(along(e.location, d, probe), scaled(d, -1), { maxDistance: probe }).find((r) => r.entity.id === hit.id);
    exit = back ? probe - back.distance : 0;
  } catch {
    exit = 0;
  }
  // The arrow knocks the mob on along its flight: start past where it's being knocked to, or the new arrow strikes it
  // again (inside its hurt time, where it would bounce off).
  let knock = 0;
  try {
    const mv = hit.getVelocity();
    knock = Math.max(0, mv.x * d.x + mv.y * d.y + mv.z * d.z) * P().knockTicks;
  } catch {
    knock = 0;
  }
  const bow = { id: s.bow, power: s.pw, damage: 0 };
  const a = makeArrow(e.dimension, along(e.location, d, exit + P().past + knock), vel, s.owner, bow, s.from);
  const n = a ? shots.get(a.id) : undefined;
  if (n) {
    n.left = s.left - 1;
    n.hit = new Set(s.hit);
    n.pulled = s.pulled;
  }
}

/** Each tick: the Proximity Bow's turn, the Sonic Bow's reach and pull and trail, the Panda Bow's hearts, the clouds. */
function flight() {
  const now = system.currentTick;
  for (const [id, s] of shots) {
    if (now > s.until) {
      if (s.extra) takeAway(id);
      else shots.delete(id);
      continue;
    }
    const a = world.getEntity(id);
    if (!a?.isValid) {
      s.goneAt ??= now;
      if (now - s.goneAt > P().forgetTicks) shots.delete(id);
      continue;
    }
    let v;
    let pos;
    try {
      v = a.getVelocity();
      pos = a.location;
    } catch {
      continue;
    }
    if (speedOf(v) < g().stillSpeed) continue; // stuck in something
    s.prev = s.vel;
    s.vel = v;
    s.pos = pos;
    try {
      if (s.kind === "homing") home(a, s, v, pos, now);
      else if (s.kind === "sonic") sonic(id, a, s, v, pos, now);
      else if (s.kind === "hearts" && now <= s.trailUntil && (now - s.born) % 2 === 0) a.dimension.spawnParticle("minecraft:heart_particle", pos);
    } catch {
      // gone this tick
    }
  }
  for (let i = clouds.length - 1; i >= 0; i--) {
    const c = clouds[i];
    if (now > c.until) {
      clouds.splice(i, 1);
      continue;
    }
    try {
      if ((now - c.next) % P().spores.puffEvery === 0) {
        const r = P().spores.radius;
        for (let k = 0; k < P().spores.puffs; k++) {
          const ang = Math.random() * Math.PI * 2;
          const rr = r * Math.sqrt(Math.random());
          c.dim.spawnParticle("minecraft:spore_blossom_ambient_particle", { x: c.at.x + Math.cos(ang) * rr, y: c.at.y + 0.3 + Math.random(), z: c.at.z + Math.sin(ang) * rr });
        }
      }
      if (now >= c.next) {
        c.next = now + 20;
        for (const f of c.dim.getEntities({ location: c.at, maxDistance: P().spores.radius, ...FOES })) addDamage(f, c.perSecond);
      }
    } catch {
      clouds.splice(i, 1);
    }
  }
}

/** The Proximity Bow: turn toward the nearest hostile mob ahead (the one it turned to before, while it's still there). */
function home(a, s, v, pos, now) {
  const H = P().homing;
  if (now - s.born < H.fromTick) return;
  let t = s.lock ? world.getEntity(s.lock) : undefined;
  const ahead = (m) => inSeekCone(v, { x: chest(m).x - pos.x, y: chest(m).y - pos.y, z: chest(m).z - pos.z }, H.coneDeg, H.seek);
  if (!t?.isValid || !ahead(t)) {
    t = undefined;
    let best = Infinity;
    for (const m of a.dimension.getEntities({ location: pos, maxDistance: H.seek, ...FOES })) {
      if (s.hit.has(m.id) || !ahead(m)) continue;
      const dd = travelled(pos, chest(m));
      if (dd < best) {
        best = dd;
        t = m;
      }
    }
    s.lock = t?.id;
  }
  if (!t) return;
  const c = chest(t);
  const nv = turnToward(v, { x: c.x - pos.x, y: c.y - pos.y, z: c.z - pos.z }, H.turnDeg);
  a.clearVelocity();
  a.applyImpulse(nv);
  s.vel = nv;
}

/** The Sonic Bow: spent after its reach; zombies near the line ahead pulled onto it; a trail of booms. */
function sonic(id, a, s, v, pos, now) {
  const S = P().sonic;
  if (travelled(s.from, pos) > S.range) {
    takeAway(id); // the shot is spent
    return;
  }
  const d = unit(v);
  if ((now - s.born) % S.trailEvery === 0) a.dimension.spawnParticle("minecraft:sonic_explosion", pos);
  if ((now - s.born) % S.pullEvery !== 0) return;
  const mid = along(pos, d, S.pullAhead / 2);
  for (const z of a.dimension.getEntities({ location: mid, maxDistance: S.pullAhead / 2 + S.pullRadius, families: ["zombie"], excludeFamilies: NOT_FOES })) {
    if (s.pulled.has(z.id)) continue;
    const imp = pullToward(z.location, pos, d, S);
    if (!imp) continue;
    s.pulled.add(z.id);
    try {
      z.applyImpulse(imp);
    } catch {
      // can't be moved
    }
  }
}

/** Every few seconds: hurt times long over are forgotten, and any extra arrow nobody follows any more goes. */
function sweep() {
  const now = system.currentTick;
  if (!settling) struck.clear(); // what the game gave arrows that struck nothing the powers go after
  for (const [id, w] of windows) if (now - w.start >= P().hurtTicks) windows.delete(id);
  for (const [id, b] of burning) if (now > b.until) burning.delete(id);
  for (const dimId of DIMENSIONS) {
    try {
      for (const a of world.getDimension(dimId).getEntities({ type: ARROW, tags: [EXTRA_TAG] })) if (!shots.has(a.id)) a.remove();
    } catch {
      // that dimension isn't loaded
    }
  }
}

/** Bench and test only: the arrows being followed, the clouds, the burning, the vexes. */
export function shotsDebug() {
  return {
    shots: [...shots.entries()].map(([id, s]) => ({ id, bow: s.bow, kind: s.kind, extra: s.extra, left: s.left, landed: s.landed, hit: [...s.hit] })),
    clouds: clouds.length,
    burning: [...burning.keys()],
    vexes: [...vexes.entries()].map(([k, v]) => [k, v.length]),
    windows: windows.size,
  };
}
