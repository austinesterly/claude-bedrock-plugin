import { world, system, EntityDamageCause, BlockPermutation, BlockVolume } from "@minecraft/server";
import { onlinePlayers, entitiesNear, biomeAt } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { allParks, memberOfAny, parkAt } from "../park/park.js";
import { findPlace } from "../world/places.js";
import { log } from "../core/log.js";
import { jobQueue } from "../core/jobs.js";
import { timedJob } from "../core/perf.js";
import {
  YETI, YETI_ACT, WILD_YETI, SNOWBALL, BOSS_TYPES, BOSSES, LAIR_PROP, LAIR,
  hurtOutcome, provoker, fights, targetOf, fightOver, pickMove, moveHits, throwVelocity, regen, aheadOf, yawOf,
  lairAllowed, groundY, siteLevel, siteCandidates, farFromParks, lairBlocks, lairColumns, denSpot, denFacing,
  missingLooks,
  restedSince,
} from "./bossRules.js";
import {
  SLOTH, SLOTH_ACT, WILD_SLOTH, SOUL_CLUMP, nextHang, netherGroundY, slothSiteLevel, slothLairSite, slothLairBlocks,
  slothLairColumns, SLOTH_LAIR,
} from "./slothRules.js";
import { gliding, stopGlide, climbUp, climbDown, walkTo, putAtPost, keepHanging, atHang } from "./slothMoves.js";
import {
  DRAKE, DRAKE_ACT, WILD_DRAKE, VOID_BOLT, outerEnd, endGroundY, drakeSiteLevel, drakeLairSite, drakeLairBlocks,
  drakeLairColumns, DRAKE_LAIR,
} from "./babyDragonRules.js";
import { drakeMeet, drakeStep, guardKnock } from "./babyDragon.js";
import { stopSteer } from "./babyDragonMoves.js";

// The bosses' fights and lairs (module 10; the rules are in animals/bossRules.js and animals/slothRules.js, the design in
// research/boss_plan.md): the Giant Yeti (0.1.159), the Soul Sloth (0.1.161) and the Baby Dragon (0.1.162: it flies, so
// its calm and its fight are in animals/babyDragon.js, handed each look from here). A wild boss is never killed: its energy
// is its health, shown on its boss bar while it fights; a player's hits wear it down to the tired floor and no further
// (the before-hurt event cuts them), and nothing else hurts it (its damage sensor, and this). Calm in its lair (the yeti
// wanders, sleeps in its den at night and roars now and then; the sloth hangs under its arch's beam, asleep much of the
// time, and now and then climbs down to amble and rake the soul soil); hit, or walked right up to by someone in Survival
// who isn't sneaking, it fights (the sloth drops from its beam first): it walks at them (the engine's chase), and every
// few seconds it stops for a move you can see coming (the yeti's swipe, slam and snowball; the sloth's claw rake, soul
// wail and soul clump) that this plays: the wind-up, then the hits and the knock back. At half energy it gives an angry
// roar or howl that slows and pushes everyone near, and is quicker after. Tired out it slumps (curls) down panting,
// can't be hurt, and its carrier works on it (transport/carriers.js pack, with bossCatchBlock below); left alone a minute
// it gets up rested. A fight ends when no one it fights is near its lair, or a minute goes by without a hit; it goes home
// and gets its energy back. Lairs: a park member walking in a taiga (a yeti's) or a soul sand valley (a sloth's) with no
// lair of that boss within 800 blocks gets one made nearby, the boss put in it; the "bosses" collection keeps each lair
// (wild or caught), and a lair's missing boss is put back. Walking near a lair finds it (Places).

const PROP = "zoocraft:act";
const HOME_PROP = "zoocraft:home"; // "x,y,z": where a boss not from a lair (a spawn egg's) first was
const TIRED_PROP = "zoocraft:tired_at"; // when it was tired out, or last had a player near while tired (Date.now() ms)
const RANGE = 64; // blocks from a player: the bosses looked after
const OVERWORLD = "minecraft:overworld";
const NETHER = "minecraft:nether";
const END = "minecraft:the_end";

/** @typedef {import("@minecraft/server").Entity} Entity */
/** @typedef {import("@minecraft/server").Player} Player */
/** @typedef {{ id: string, x: number, y: number, z: number, mode: string, sneaking: boolean, player: Player, dim: string }} Who */

// Each boss: its rules, its acts, the place its lairs are found under, where they are made, how it looks and sounds.
const KINDS = {
  [WILD_YETI]: { key: "yeti", type: WILD_YETI, R: YETI, ACT: YETI_ACT, species: "zoocraft:giant_yeti", place: "yeti_lair", dim: OVERWORLD, tag: "taiga", name: "Giant Yeti",
    caught: "A Giant Yeti only goes into its cage once it is tired out: wear it down in a fight till it slumps down panting." },
  [WILD_SLOTH]: { key: "sloth", type: WILD_SLOTH, R: SLOTH, ACT: SLOTH_ACT, species: "zoocraft:soul_sloth", place: "sloth_lair", dim: NETHER, tag: "soulsand_valley", name: "Soul Sloth",
    caught: "A Soul Sloth only goes into its cage once it is tired out: wear it down in a fight till it curls up panting." },
  [WILD_DRAKE]: { key: "drake", type: WILD_DRAKE, R: DRAKE, ACT: DRAKE_ACT, species: "zoocraft:baby_dragon", place: "drake_lair", dim: END, tag: "the_end", name: "Baby Dragon",
    caught: "A Baby Dragon only goes into its crate once it is tired out: wear it down in a fight till it lies down panting." },
};
const KIND_LIST = Object.values(KINDS);

const state = new Map(); // boss id -> its state (see meet)
const hits = new Map(); // boss id -> { by: player id, tick }: a player's hit seen in the before-hurt event, for the loop
let applying = false; // the script's own hit on a player is landing (the boss's melee_box_attack hits are cancelled)
const misses = new Map(); // lair id -> looks in a row with its den loaded, a player near, and no boss
const nextLairLook = new Map(); // player id -> tick
const building = new Set(); // lair ids whose blocks are being placed
const buildTries = new Map(); // lair id -> builds started since load (a lair left half built is built again, 3 times at most)
const jobs = jobQueue((gen) => system.runJob(timedJob("lairs", gen)), (error) => log(`lairs: building a lair failed: ${error}`));

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

/** @param {Entity} e */
function health(e) {
  return /** @type {import("@minecraft/server").EntityHealthComponent | undefined} */ (e.getComponent("minecraft:health"));
}

// --- Hits ---------------------------------------------------------------------------------------------------------
// A wild boss hurt: a player's hit lands, cut at the tired floor; anything else (fire, mobs, wolves, its own snowball)
// is cancelled; /kill and the void go through. Read-only here (a before event): the hit is noted for the loop.
world.beforeEvents.entityHurt.subscribe(
  (ev) => {
    try {
      const e = ev.hurtEntity;
      const src = ev.damageSource;
      const by = src.damagingEntity;
      const fromPlayer = by?.typeId === "minecraft:player";
      const hp = health(e);
      const s = state.get(e.id);
      const k = s?.k ?? KINDS[e.typeId];
      const tired = s?.phase === "tired" || s?.phase === "rise" || s?.phase === "tiredfall";
      const out = hurtOutcome({ current: hp?.currentValue ?? YETI.energy, damage: ev.damage, fromPlayer, cause: String(src.cause), tired, floor: k?.R.tiredAt });
      if (out.cancel) ev.cancel = true;
      else if (out.damage !== undefined) ev.damage = out.damage;
      if (fromPlayer && !out.cancel && by) hits.set(e.id, { by: by.id, tick: system.currentTick });
    } catch {
      // never stop a hit for an error here
    }
  },
  { entityFilter: { families: ["zoocraft_boss"] } },
);

// A player hurt by a boss's own melee (the engine's chase hits for 0): cancelled. The script's moves land while
// `applying` is set; its snowball or clump comes as a projectile and lands.
world.beforeEvents.entityHurt.subscribe(
  (ev) => {
    if (applying) return;
    try {
      const src = ev.damageSource;
      if (BOSS_TYPES.includes(src.damagingEntity?.typeId ?? "") && !src.damagingProjectile) ev.cancel = true;
    } catch {
      // let it be
    }
  },
  { entityFilter: { type: "minecraft:player" } },
);

// The thrown things' hits: a push back and a puff on a player; a puff where they land on the ground.
const THROWN = {
  [SNOWBALL]: { puff: "zoocraft:yeti_snow_puff", sound: "dig.snow", knock: YETI.moves.hurl.knock },
  [SOUL_CLUMP]: { puff: "zoocraft:sloth_clump_puff", sound: "dig.soul_sand", knock: SLOTH.moves.hurl.knock },
  [VOID_BOLT]: { puff: "zoocraft:drake_bolt_puff", sound: "mob.shulker.bullet.hit", knock: DRAKE.moves.bolt.knock, guard: true },
};
world.afterEvents.projectileHitEntity.subscribe((ev) => {
  try {
    const t = THROWN[ev.projectile?.typeId ?? ""];
    if (!t) return;
    const hit = ev.getEntityHit()?.entity;
    const at = ev.location;
    particle(ev.dimension, t.puff, at);
    sound(ev.dimension, t.sound, at, 1.2, 0.7);
    if (hit?.typeId !== "minecraft:player") return;
    const v = ev.projectile.getVelocity();
    const len = Math.hypot(v.x, v.z) || 1;
    const dir = { x: v.x / len, z: v.z / len };
    // The Baby Dragon's bolt never throws anyone off an End island (the void guard).
    const h = t.guard ? guardKnock(ev.dimension, hit.location, dir, t.knock.h) : t.knock.h;
    hit.applyKnockback({ x: dir.x * h, z: dir.z * h }, h < t.knock.h ? Math.min(t.knock.v, 0.15) : t.knock.v);
  } catch {
    // cosmetic and the push only
  }
});
world.afterEvents.projectileHitBlock.subscribe((ev) => {
  try {
    const t = THROWN[ev.projectile?.typeId ?? ""];
    if (!t) return;
    particle(ev.dimension, t.puff, ev.location);
    sound(ev.dimension, t.sound, ev.location, 1.2, 0.7);
  } catch {
    // cosmetic only
  }
});

// --- Small helpers ------------------------------------------------------------------------------------------------
function sound(dimension, id, at, volume = 1, pitch = 1) {
  try {
    dimension.playSound(id, at, { volume, pitch });
  } catch {
    // cosmetic only
  }
}

function particle(dimension, id, at) {
  try {
    dimension.spawnParticle(id, at);
  } catch {
    // cosmetic only
  }
}

/** @param {Entity} e @param {number} act */
function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its walking (the entity's groups: the yeti's calm, seek_den, rest, chase, chase_angry, hold; the sloth's calm, hang,
// rest, chase, chase_angry, hold), each event swapping the others out.
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// The boss bar: on while it fights, off otherwise (its own group, so it doesn't flicker as the walking changes).
function bar(e, s, on) {
  if (s.bar === on) return;
  e.triggerEvent(on ? "zoocraft:bar_on" : "zoocraft:bar_off");
  s.bar = on;
}

function face(e, yaw) {
  try {
    e.setRotation({ x: 0, y: yaw });
  } catch {
    // next time
  }
}

// What animals/babyDragon.js is lent: a script hit on a player that lands, the boss bar, whether a state is still the
// boss's, and the tired stamp.
/** @type {import("./babyDragon.js").Ctx} */
const CTX = {
  hurt(p, damage, by) {
    try {
      applying = true;
      p.applyDamage(damage, { cause: EntityDamageCause.entityAttack, damagingEntity: by });
    } catch {
      // gone
    } finally {
      applying = false;
    }
  },
  bar: (e, s, on) => bar(e, s, on),
  live: (e, s) => state.get(e.id) === s,
  tiredProp: TIRED_PROP,
  clock: () => clock(),
};

// Everyone online, as the rules take them.
/** @returns {Who[]} */
function everyone() {
  const out = [];
  for (const p of onlinePlayers()) {
    try {
      const l = p.location;
      out.push({ id: p.id, x: l.x, y: l.y, z: l.z, mode: String(p.getGameMode()), sneaking: p.isSneaking, player: p, dim: p.dimension.id });
    } catch {
      // left
    }
  }
  return out;
}

// Its lair, if it has one.
function lairOf(e) {
  const lairId = e.getDynamicProperty(LAIR_PROP);
  return typeof lairId === "string" ? db.get(BOSSES, lairId) : undefined;
}

// Its home: its lair's den (the sloth's: its hanging spot), else where it first was (a spawn egg's).
function homeOf(e, s) {
  if (s.home) return s.home;
  const lair = lairOf(e);
  if (lair) {
    s.lairId = lair.id;
    s.home = { x: lair.den.x, y: lair.den.y, z: lair.den.z, bed: lair.den.bed };
    if (lair.hang) s.site = lair.hang;
    if (lair.nest) s.site = { nest: lair.nest, rest: lair.rest };
    return s.home;
  }
  const kept = e.getDynamicProperty(HOME_PROP);
  if (typeof kept === "string") {
    const [x, y, z] = kept.split(",").map(Number);
    s.home = { x, y, z };
    return s.home;
  }
  const l = e.location;
  s.home = { x: Math.floor(l.x) + 0.5, y: Math.floor(l.y), z: Math.floor(l.z) + 0.5 };
  e.setDynamicProperty(HOME_PROP, `${s.home.x},${s.home.y},${s.home.z}`);
  return s.home;
}

// First met (or met again after a reload): calm, its bar off; or still tired out, if it was. A sloth found at its
// hanging spot goes on hanging (asleep); one anywhere else is on the ground and goes back up after a while.
function meet(e, now) {
  const k = KINDS[e.typeId] ?? KINDS[WILD_YETI];
  const s = { k, phase: "calm", body: undefined, bar: undefined, angry: false, until: 0, lastHit: now, nextMove: 0, quietSince: now, denSince: 0, target: undefined, move: undefined, home: undefined, lairId: undefined, regenAt: now, site: undefined, cycle: "ground", cycleUntil: now + 200 };
  state.set(e.id, s);
  const hp = health(e);
  bar(e, s, false);
  homeOf(e, s);
  if (k.key === "drake") {
    drakeMeet(e, s, now, hp, CTX);
    return s;
  }
  if (hp && hp.currentValue <= k.R.tiredAt) {
    // Tired out when last looked after: up rested if nobody has been near it (it isn't looked after with no player
    // within 64 blocks) for the time it takes to recover; else still tired.
    const at = e.getDynamicProperty(TIRED_PROP);
    if (restedSince(at, clock())) {
      hp.resetToMaxValue();
      calmBody(e, s, now);
    } else tire(e, s, now, typeof at === "number");
  } else calmBody(e, s, now);
  return s;
}

// Calm on meeting: the yeti on its feet; the sloth hanging if it is at its spot, else on its feet.
function calmBody(e, s, now) {
  if (s.k.key === "sloth" && s.site && atHang(e.location, s.site)) {
    body(e, s, "hang");
    keepHanging(e, s.site);
    s.cycle = "sleep";
    s.cycleUntil = now + nextHang("awake", () => 0.99).ticks; // a sleep
    setAct(e, SLOTH_ACT.sleep);
    return;
  }
  body(e, s, "calm");
  setAct(e, s.k.ACT.none);
  s.cycle = "ground";
  s.cycleUntil = now + 200;
}

// --- The loop -----------------------------------------------------------------------------------------------------
// Every 2 ticks: the wild bosses near players.
export function tickBosses(now) {
  const who = everyone();
  const seen = new Set();
  for (const p of who) {
    let list;
    try {
      list = entitiesNear(p.player.dimension, p, RANGE, BOSS_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, who.filter((w) => w.dim === p.dim));
      } catch (error) {
        state.delete(e.id);
        stopGlide(e.id);
        stopSteer(e.id, e);
        log(`boss: ${error}`);
      }
    }
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    stopGlide(id);
    stopSteer(id);
  }
  for (const id of [...hits.keys()]) if (!seen.has(id)) hits.delete(id);
}

function step(e, now, who) {
  const s = state.get(e.id) ?? meet(e, now);
  const hp = health(e);
  if (!hp) return;
  const energy = hp.currentValue;
  const home = homeOf(e, s);
  const hit = hits.get(e.id);
  if (hit) {
    hits.delete(e.id);
    s.lastHit = now;
    if (!s.target) s.target = hit.by;
  }
  if (s.k.key === "drake") return drakeStep(e, s, now, who, energy, hp, hit, CTX);
  switch (s.phase) {
    case "calm":
    case "den":
    case "sleep":
    case "wake":
    case "calmroar":
      return s.k.key === "sloth" ? slothCalm(e, s, now, who, energy, hp, hit) : calm(e, s, now, who, energy, hp, home, hit);
    case "drop":
      return dropping(e, s, now, who);
    case "roar":
      return roaring(e, s, now, who);
    case "fight":
      return fighting(e, s, now, who, energy, home);
    case "move":
      return moving(e, s, now, who, energy);
    case "angry":
      return angry(e, s, now, who);
    case "tired":
      return tired(e, s, now, who, home, hp);
    case "rise":
      if (now >= s.until) toCalm(e, s, now);
      return;
    default:
      toCalm(e, s, now);
  }
}

// Calm: energy coming back, wandering (or to its den and asleep at night), a roar now and then; provoked, it fights.
function calm(e, s, now, who, energy, hp, home, hit) {
  if (energy < YETI.energy && now > s.regenAt) {
    hp.setCurrentValue(regen(energy, now - s.regenAt));
  }
  s.regenAt = now;
  const p = hit ? who.find((w) => w.id === hit.by) : provoker(e.location, who);
  if (p && fights(p.mode)) {
    s.target = p.id;
    s.lastHit = now;
    if (s.phase === "sleep") {
      // Up first (the client's get-up), then the roar.
      s.phase = "wake";
      s.until = now + 24;
      setAct(e, YETI_ACT.none);
      body(e, s, "hold");
      return;
    }
    if (s.phase !== "wake") return startRoar(e, s, now, who);
  }
  if (s.phase === "wake") {
    if (now >= s.until) startRoar(e, s, now, who);
    return;
  }
  if (s.phase === "calmroar") {
    if (now >= s.until) {
      setAct(e, YETI_ACT.none);
      s.phase = "calm";
      body(e, s, "calm");
    }
    return;
  }
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 5) return; // the rest every half second (the loop runs every 2 ticks)
  const night = isNight();
  if (s.phase === "sleep") {
    if (!night) {
      s.phase = "rise";
      s.until = now + 24;
      setAct(e, YETI_ACT.none);
    }
    return;
  }
  if (night && home.bed) {
    if (s.phase !== "den") {
      s.phase = "den";
      s.denSince = now;
      body(e, s, "seek_den");
    }
    const d = dist2(e.location, home.bed);
    if (d <= YETI.denArrive || now - s.denSince >= YETI.denGiveUp) {
      s.phase = "sleep";
      body(e, s, "rest");
      setAct(e, YETI_ACT.sleep);
    }
    return;
  }
  if (s.phase === "den") {
    s.phase = "calm";
    body(e, s, "calm");
  }
  if (Math.random() < YETI.calmRoarChance) {
    s.phase = "calmroar";
    s.until = now + YETI.calmRoarTicks;
    body(e, s, "hold");
    setAct(e, YETI_ACT.roar);
    roarSounds(e, s, now, 0.6, 0.9);
  }
}

function isNight() {
  try {
    const t = world.getTimeOfDay() % 24000;
    return t >= 13000 && t < 23000;
  } catch {
    return false;
  }
}

// --- The sloth's calm: hanging, climbing, the ground ---------------------------------------------------------------
// Hanging under its beam (asleep, or awake looking about) by its own clock; at the end of an awake spell now and then
// down the post to amble round its lair (raking the soul soil, yawning) and back up. Hit or walked up to: it drops.
function slothCalm(e, s, now, who, energy, hp, hit) {
  const H = SLOTH.hang;
  if (energy < SLOTH.energy && now > s.regenAt) hp.setCurrentValue(regen(energy, now - s.regenAt, SLOTH));
  s.regenAt = now;
  const l = e.location;
  // Who walks up to it: measured from the floor under it while it hangs or climbs (it is up out of reach of the yeti's
  // height check).
  const from = s.site && (s.cycle === "sleep" || s.cycle === "awake" || s.cycle === "climb") ? { x: l.x, y: s.site.floor, z: l.z } : l;
  const p = hit ? who.find((w) => w.id === hit.by) : provoker(from, who, SLOTH.provoke);
  if (p && fights(p.mode)) {
    s.target = p.id;
    s.lastHit = now;
    return provoked(e, s, now, who);
  }
  if (gliding(e.id)) return; // climbing or walking: its end moves the cycle on
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 5) return; // every half second
  if (s.cycle === "sleep" || s.cycle === "awake") {
    if (s.site) keepHanging(e, s.site);
    if (now < s.cycleUntil) return;
    const n = nextHang(s.cycle);
    if (n.next === "ground" && s.site) return goDown(e, s, n.ticks);
    s.cycle = n.next === "ground" ? "sleep" : n.next;
    s.cycleUntil = now + (n.next === "ground" ? n.ticks : n.ticks);
    setAct(e, s.cycle === "sleep" ? SLOTH_ACT.sleep : SLOTH_ACT.hang);
    return;
  }
  if (s.cycle === "doing") {
    if (now < s.doUntil) return;
    s.cycle = "ground";
    setAct(e, SLOTH_ACT.none);
    body(e, s, "calm");
    return;
  }
  if (s.cycle !== "ground") return;
  if (now >= s.cycleUntil && s.site) return goUp(e, s);
  if (!e.isOnGround) return;
  const r = Math.random();
  if (r < H.rakeChance) doThing(e, s, now, SLOTH_ACT.rake, SLOTH.rakeTicks, () => {
    particle(e.dimension, "zoocraft:sloth_sand_burst", aheadOf(e.location, e.getRotation().y, 2.2, 0.1));
    sound(e.dimension, "dig.soul_soil", e.location, 1.0, 0.7);
  });
  else if (r < H.rakeChance + H.yawnChance) doThing(e, s, now, SLOTH_ACT.yawn, SLOTH.yawnTicks, () => sound(e.dimension, "mob.polarbear.idle", e.location, 0.8, 0.35));
}

// A one-off on the ground (a rake of the soul soil, a yawn): still while it plays.
function doThing(e, s, now, act, ticks, fx) {
  s.cycle = "doing";
  s.doUntil = now + ticks;
  body(e, s, "hold");
  setAct(e, act);
  system.runTimeout(() => {
    try {
      if (e.isValid && state.get(e.id)?.cycle === "doing") fx();
    } catch {
      // cosmetic only
    }
  }, Math.round(ticks * 0.4));
}

// Down off the beam and the post, then on its feet for a while.
function goDown(e, s, ticks) {
  s.cycle = "climb";
  climbDown(e, s.site, () => {
    const st = state.get(e.id);
    if (st !== s) return;
    body(e, s, "calm");
    setAct(e, SLOTH_ACT.none);
    s.cycle = "ground";
    s.cycleUntil = system.currentTick + ticks;
  });
}

// Back to the foot of its post (a walk), up it and over onto the beam; asleep there.
function goUp(e, s) {
  s.cycle = "climb";
  body(e, s, "hold");
  walkTo(e, s.site, (ok) => {
    if (state.get(e.id) !== s) return;
    if (!ok) putAtPost(e, s.site); // the way was blocked: put at the post's foot
    body(e, s, "hang");
    climbUp(e, s.site, (up) => {
      if (state.get(e.id) !== s) return;
      if (!up) {
        body(e, s, "calm");
        s.cycle = "ground";
        s.cycleUntil = system.currentTick + 400;
        return;
      }
      s.cycle = "sleep";
      s.cycleUntil = system.currentTick + nextHang("awake", () => 0.99).ticks;
      setAct(e, SLOTH_ACT.sleep);
    });
  });
}

// Provoked: down from the beam (or the post) first if it is up; then the howl and the fight.
function provoked(e, s, now, who) {
  stopGlide(e.id);
  const up = s.cycle === "sleep" || s.cycle === "awake" || s.cycle === "climb" || !e.isOnGround;
  s.cycle = "ground";
  if (!up) return startRoar(e, s, now, who);
  s.phase = "drop";
  s.until = now + SLOTH.hang.dropTicks;
  s.from = now;
  body(e, s, "hold");
  setAct(e, SLOTH_ACT.drop);
  sound(e.dimension, "mob.ghast.moan", e.location, 1.0, 0.5);
}

// Falling: on the ground (or after the drop's time), a thud and a burst of soul sand; then the howl.
function dropping(e, s, now, who) {
  if (now - s.from < 6 || (!e.isOnGround && now < s.until)) return;
  const at = e.location;
  particle(e.dimension, "zoocraft:sloth_sand_burst", { x: at.x, y: at.y + 0.1, z: at.z });
  sound(e.dimension, "land.soul_sand", at, 2.0, 0.5);
  sound(e.dimension, "mob.ravager.stun", at, 1.2, 0.6);
  startRoar(e, s, now, who);
}

// --- The fight -----------------------------------------------------------------------------------------------------
// The opening and the angry roar's sounds, at their moments in the art (the yeti: chest beats at 0.15 to 0.6 s, the roar
// at 0.8 s; the sloth: ground beats at 0.15 to 0.9 s, the howl at 1.05 s).
function roarSounds(e, s, now, volume, pitch) {
  const d = e.dimension;
  const l = e.location;
  if (s.k.key === "sloth") {
    for (const t of [3, 9, 15]) system.runTimeout(() => sound(d, "land.soul_sand", l, volume * 1.5, 0.5), t);
    system.runTimeout(() => {
      sound(d, "mob.ravager.roar", l, volume * 2, pitch * 0.8);
      sound(d, "mob.ghast.moan", l, volume * 1.5, pitch * 0.7);
    }, 21);
    return;
  }
  for (const t of [3, 6, 9, 12]) system.runTimeout(() => sound(d, "mob.ravager.step", l, volume, 0.6), t);
  system.runTimeout(() => sound(d, "mob.ravager.roar", l, volume * 2, pitch), 16);
}

// Rearing up with a roar (the sloth: beating the ground and howling), then the fight.
function startRoar(e, s, now, who) {
  s.phase = "roar";
  s.until = now + s.k.R.roarTicks;
  body(e, s, "hold");
  setAct(e, s.k.ACT.roar);
  const t = who.find((w) => w.id === s.target);
  if (t) face(e, yawOf(t.x - e.location.x, t.z - e.location.z));
  roarSounds(e, s, now, 1.0, 0.75);
}

function roaring(e, s, now, who) {
  if (now < s.until) return;
  setAct(e, s.k.ACT.none);
  bar(e, s, true);
  s.phase = "fight";
  s.nextMove = now + s.k.R.firstMove;
  body(e, s, s.angry ? "chase_angry" : "chase");
}

function fighting(e, s, now, who, energy, home) {
  const R = s.k.R;
  if (energy <= R.tiredAt) return tire(e, s, now);
  if (fightOver({ home, players: who, now, lastHit: s.lastHit }, R)) return endFight(e, s, now);
  if (!s.angry && energy <= R.angryAt) return startAngry(e, s, now);
  const at = e.location;
  const t = targetOf(at, home, who, R.ring);
  if (!t) return endFight(e, s, now);
  s.target = t.id;
  if (now < s.nextMove) return;
  const d = dist2(at, t);
  const near = who.filter((w) => fights(w.mode) && dist2(at, w) <= R.moves.slam.reach && Math.abs(w.y - at.y) <= R.moves.slam.high).length;
  const move = pickMove(d, near, Math.random, R);
  if (!move) return;
  s.phase = "move";
  s.move = move;
  s.from = now;
  s.struck = false;
  s.yaw = yawOf(t.x - at.x, t.z - at.z);
  body(e, s, "hold");
  face(e, s.yaw);
  setAct(e, s.k.ACT[move]);
  windUp(e, s, at, move);
}

// A move's wind-up sound.
function windUp(e, s, at, move) {
  const d = e.dimension;
  if (s.k.key === "sloth") {
    if (move === "hurl") sound(d, "dig.soul_sand", at, 1.2, 0.6); // the scoop
    else if (move === "slam") sound(d, "mob.ghast.moan", at, 1.4, 0.7);
    else sound(d, "mob.polarbear.warning", at, 1.0, 0.5);
    return;
  }
  if (move === "hurl") sound(d, "dig.snow", at, 1.0, 0.6); // the scoop
  else if (move === "slam") sound(d, "mob.polarbear.warning", at, 1.2, 0.6);
  else sound(d, "mob.polarbear.warning", at, 0.8, 0.8);
}

// A move: the wind-up (turned to its target, tracking them till a moment before), the strike, then back to the chase.
function moving(e, s, now, who, energy) {
  const R = s.k.R;
  const M = R.moves[s.move];
  const t = now - s.from;
  const at = e.location;
  const target = who.find((w) => w.id === s.target);
  if (!s.struck && target && t < M.strikeAt - 4) {
    s.yaw = yawOf(target.x - at.x, target.z - at.z);
  }
  face(e, s.yaw);
  if (!s.struck && t >= M.strikeAt) {
    s.struck = true;
    if (s.move === "hurl") hurl(e, s, target);
    else strike(e, s, who);
  }
  if (t < M.ticks) return;
  setAct(e, s.k.ACT.none);
  s.phase = "fight";
  s.nextMove = now + (s.angry ? R.everyAngry : R.every);
  body(e, s, s.angry ? "chase_angry" : "chase");
  if (energy <= R.tiredAt) tire(e, s, now);
}

// The near moves' hits (the yeti's swipe and slam, the sloth's rake and soul wail): damage (the game scales a mob's hits
// by difficulty) and the knock back; the sloth's wail slows too.
function strike(e, s, who) {
  const R = s.k.R;
  const at = e.location;
  const list = moveHits(s.move, at, s.yaw, who, R);
  const d = e.dimension;
  if (s.k.key === "sloth") {
    if (s.move === "slam") {
      particle(d, "zoocraft:sloth_soul_burst", { x: at.x, y: at.y + 0.3, z: at.z });
      sound(d, "mob.ghast.scream", at, 1.2, 0.5);
      sound(d, "ambient.soulsand_valley.additions", at, 2.0, 0.8);
    } else {
      sound(d, "mob.ravager.bite", at, 1.2, 0.6);
    }
  } else if (s.move === "slam") {
    const fists = aheadOf(at, s.yaw, 3.3, 0.2);
    particle(d, "zoocraft:yeti_snow_burst", fists);
    particle(d, "zoocraft:yeti_snow_burst", { x: at.x, y: at.y + 0.2, z: at.z });
    sound(d, "mob.ravager.stun", fists, 1.4, 0.7);
    sound(d, "dig.snow", fists, 1.5, 0.5);
  } else {
    sound(d, "mob.irongolem.throw", at, 1.2, 0.6);
  }
  const M = R.moves[s.move];
  for (const h of list) {
    const w = who.find((x) => x.id === h.id);
    if (!w) continue;
    try {
      applying = true;
      w.player.applyDamage(M.damage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    } catch {
      // gone
    } finally {
      applying = false;
    }
    try {
      w.player.applyKnockback({ x: h.x, z: h.z }, h.v);
      if (M.slowTicks) w.player.addEffect("slowness", M.slowTicks, { amplifier: M.slowLevel ?? 0, showParticles: true });
    } catch {
      // gone
    }
  }
}

// The thrown thing (the yeti's snowball from over its head, the sloth's clump from its hands), at the target's chest
// (where they stand now: step aside and it misses).
function hurl(e, s, target) {
  const R = s.k.R;
  const d = e.dimension;
  const from = aheadOf(e.location, s.yaw, R.throwFrom.ahead, R.throwFrom.up);
  const sloth = s.k.key === "sloth";
  sound(d, sloth ? "mob.irongolem.throw" : "mob.snowgolem.shoot", from, 1.4, 0.5);
  if (!target) return;
  try {
    const ball = d.spawnEntity(sloth ? SOUL_CLUMP : SNOWBALL, from);
    const proj = /** @type {import("@minecraft/server").EntityProjectileComponent | undefined} */ (ball.getComponent("minecraft:projectile"));
    if (!proj) return void ball.remove();
    proj.owner = e;
    proj.shoot(throwVelocity(from, { x: target.x, y: target.y + 1.2, z: target.z }, R.moves.hurl.speed, R.moves.hurl.gravity), { uncertainty: 0 });
  } catch (error) {
    log(`boss: the ${sloth ? "soul clump" : "snowball"}: ${error}`);
  }
}

// Angry at half: the yeti's chest beat and frost roar, the sloth's ground beats and howl; everyone near slowed and
// pushed back.
function startAngry(e, s, now) {
  s.angry = true;
  s.phase = "angry";
  s.from = now;
  s.blasted = false;
  body(e, s, "hold");
  setAct(e, s.k.ACT.roar);
  roarSounds(e, s, now, 1.4, 0.55);
}

function angry(e, s, now, who) {
  const R = s.k.R;
  const A = R.angry;
  const t = now - s.from;
  if (!s.blasted && t >= A.blastAt) {
    s.blasted = true;
    const at = e.location;
    if (s.k.key === "sloth") {
      particle(e.dimension, "zoocraft:sloth_howl", at);
      sound(e.dimension, "mob.ghast.scream", at, 1.0, 0.4);
    } else {
      particle(e.dimension, "zoocraft:yeti_frost_roar", at);
      sound(e.dimension, "random.glass", at, 1.0, 0.5);
    }
    for (const h of moveHits("angry", at, 0, who, R)) {
      const w = who.find((x) => x.id === h.id);
      if (!w) continue;
      try {
        w.player.addEffect("slowness", A.slowTicks, { amplifier: A.slowLevel, showParticles: true });
        w.player.applyKnockback({ x: h.x, z: h.z }, h.v);
      } catch {
        // gone
      }
    }
  }
  if (t < A.ticks) return;
  setAct(e, s.k.ACT.none);
  s.phase = "fight";
  s.nextMove = now + R.everyAngry;
  body(e, s, "chase_angry");
}

// The tired stamp's clock: real time, so it goes on while the boss's chunk is unloaded or the world is shut, and doesn't
// stop with the daylight cycle off or jump with /time set (the world's absolute time did both on the bench).
function clock() {
  return Date.now();
}

// Tired out: slumped (the sloth curled) down panting, its bar gone; it can't be hurt (the before-hurt event) and its
// carrier works.
function tire(e, s, now, kept = false) {
  if (!kept) e.setDynamicProperty(TIRED_PROP, clock());
  stopGlide(e.id);
  s.phase = "tired";
  s.cycle = "ground";
  s.quietSince = now;
  bar(e, s, false);
  body(e, s, "rest");
  setAct(e, s.k.ACT.tired);
  sound(e.dimension, "mob.polarbear.idle", e.location, 1.0, s.k.key === "sloth" ? 0.4 : 0.5);
}

function tired(e, s, now, who, home, hp) {
  const R = s.k.R;
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 20 === 0) sound(e.dimension, "mob.polarbear.idle", e.location, 0.5, s.k.key === "sloth" ? 0.38 : 0.45); // panting, every 2 seconds
  const near = who.some((w) => dist2(w, e.location) <= R.ring);
  if (near) {
    s.quietSince = now;
    if (s.ticks % 20 === 0) e.setDynamicProperty(TIRED_PROP, clock()); // every 2 seconds is close enough
  }
  if (now - s.quietSince < R.recoverTicks) return;
  // Rested: up with its energy back, and home.
  hp.resetToMaxValue();
  s.angry = false;
  s.phase = "rise";
  s.until = now + 24;
  setAct(e, s.k.ACT.none);
}

function endFight(e, s, now) {
  bar(e, s, false);
  s.angry = false;
  s.target = undefined;
  toCalm(e, s, now);
}

// Calm again: the yeti wanders; the sloth is on its feet a little while, then goes back up to its beam.
function toCalm(e, s, now) {
  s.phase = "calm";
  s.regenAt = now;
  setAct(e, s.k.ACT.none);
  body(e, s, "calm");
  s.cycle = "ground";
  s.cycleUntil = now + 100;
}

// Whether a wild boss can be caught now: undefined if it can, else why not (transport/carriers.js pack).
/** @param {Entity} e */
export function bossCatchBlock(e) {
  const k = KINDS[e.typeId];
  if (!k) return undefined;
  const s = state.get(e.id);
  const hp = health(e);
  const tiredOut = s ? s.phase === "tired" : (hp?.currentValue ?? k.R.energy) <= k.R.tiredAt;
  if (!tiredOut) return k.caught;
  return undefined;
}

// A wild boss caught: its lair turns caught, so that area never gets another.
/** @param {Entity} e */
export function bossCaught(e) {
  try {
    const lair = lairOf(e);
    if (lair && lair.state !== "caught") db.put(BOSSES, { ...lair, state: "caught" });
  } catch {
    // no lair: a spawn egg's
  }
  state.delete(e.id);
  hits.delete(e.id);
  stopGlide(e.id);
  stopSteer(e.id, e);
}

// --- Lairs --------------------------------------------------------------------------------------------------------
function lairs() {
  return [...db.col(BOSSES).values()];
}

// Every 20 ticks: lairs made for park members walking in a taiga, a soul sand valley or the outer End islands, lairs
// found; every other time, missing bosses put back.
let lairTicks = 0;
export function tickLairs(now) {
  const all = lairs();
  for (const p of onlinePlayers()) {
    try {
      lookAround(p, now, all);
    } catch {
      // unloaded round them; next time
    }
  }
  if (++lairTicks % 2 === 0) keepLairs(now, all);
}

function lookAround(p, now, all) {
  const d = p.dimension;
  const loc = p.location;
  const kinds = KIND_LIST.filter((k) => k.dim === d.id);
  if (!kinds.length) return;
  for (const l of all) {
    if (l.dimension !== d.id || dist2(l, loc) > YETI.findRange) continue;
    const k = KIND_LIST.find((x) => x.species === l.species);
    if (k) findPlace(p, k.place, l);
  }
  if ((nextLairLook.get(p.id) ?? 0) > now) return;
  nextLairLook.set(p.id, now + YETI.lairEvery);
  if (!memberOfAny(p)) return;
  const tags = biomeAt(d, loc)?.tags ?? [];
  for (const k of kinds) {
    if (!tags.includes(k.tag)) continue;
    const mine = all.filter((l) => l.species === k.species);
    if (!lairAllowed(mine, d.id, loc, k.R.spacing)) continue;
    if (k.key === "sloth") makeSlothLair(p, d, loc, all, k);
    else if (k.key === "drake") makeDrakeLair(p, d, loc, all, k);
    else makeLair(p, d, loc, all);
  }
}

// A reader of block ids that never loads a chunk (undefined where unloaded).
function idReader(d) {
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}

function makeLair(p, d, loc, all) {
  const idAt = idReader(d);
  const tops = new Map();
  const groundAt = (x, z) => {
    const k = `${x},${z}`;
    if (tops.has(k)) return tops.get(k);
    let g;
    try {
      const top = d.getTopmostBlock({ x, z });
      g = top ? groundY(idAt, x, z, top.location.y) : undefined;
    } catch {
      g = undefined;
    }
    tops.set(k, g);
    return g;
  };
  const parks = allParks().filter((k) => k.dimension === d.id && k.center).map((k) => k.center);
  for (const c of siteCandidates(loc)) {
    if (!farFromParks(parks, c) || parkAt(d.id, c)) continue;
    if (!(biomeAt(d, { x: c.x, y: loc.y, z: c.z })?.tags ?? []).includes("taiga")) continue;
    const y = siteLevel(groundAt, c);
    if (y === undefined) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const den = denSpot(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    /** @type {import("./bossRules.js").Lair} */
    const lair = { id, species: "zoocraft:giant_yeti", dimension: d.id, x: c.x, y, z: c.z, den, facing, state: "wild", madeAt: Date.now(), built: false };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return;
  }
}

// A Soul Sloth's lair in a soul sand valley: the ground found going down under the Nether's roof (slothSiteLevel), in
// the valley, away from parks; the arch on the far side from the player.
function makeSlothLair(p, d, loc, all, k) {
  const idAt = idReader(d);
  const cache = new Map();
  const groundAt = (x, z, from, to) => {
    const key = `${x},${z},${from},${to}`;
    if (!cache.has(key)) cache.set(key, netherGroundY(idAt, x, z, from, to));
    return cache.get(key);
  };
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  for (const c of siteCandidates(loc, Math.random, SLOTH.site)) {
    if (!farFromParks(parks, c, SLOTH.site.parks) || parkAt(d.id, c)) continue;
    const y = slothSiteLevel(groundAt, c, loc.y);
    if (y === undefined) continue;
    if (!(biomeAt(d, { x: c.x, y: y + 1, z: c.z })?.tags ?? []).includes(k.tag)) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const { site } = slothLairSite(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    const lair = { id, species: k.species, dimension: d.id, x: c.x, y, z: c.z, den: { x: site.x, y: site.hangY, z: site.z }, hang: site, facing, state: "wild", madeAt: Date.now(), built: false };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return;
  }
}

// A Baby Dragon's lair on the outer End islands (more than 800 blocks out): level end stone under open sky
// (drakeSiteLevel: the ground read down from the topmost block through chorus to the end stone; an End city's purpur is
// no place for it), away from parks; the nest's front facing the way the player came.
function makeDrakeLair(p, d, loc, all, k) {
  if (!outerEnd(loc)) return;
  const idAt = idReader(d);
  const tops = new Map();
  const groundAt = (x, z) => {
    const key = `${x},${z}`;
    if (tops.has(key)) return tops.get(key);
    let g;
    try {
      const top = d.getTopmostBlock({ x, z });
      g = top ? endGroundY(idAt, x, z, top.location.y) : undefined;
    } catch {
      g = undefined;
    }
    tops.set(key, g);
    return g;
  };
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  for (const c of siteCandidates(loc, Math.random, DRAKE.site)) {
    if (!outerEnd(c) || !farFromParks(parks, c, DRAKE.site.parks) || parkAt(d.id, c)) continue;
    const y = drakeSiteLevel(groundAt, c);
    if (y === undefined) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const { nest, rest } = drakeLairSite(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    const lair = { id, species: k.species, dimension: d.id, x: c.x, y, z: c.z, den: { x: nest.x, y: nest.y, z: nest.z }, nest, rest, facing, state: "wild", madeAt: Date.now(), built: false };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return;
  }
}

function startBuild(d, lair) {
  const n = (buildTries.get(lair.id) ?? 0) + 1;
  if (n > 3) return;
  buildTries.set(lair.id, n);
  building.add(lair.id);
  jobs.push(buildLair(d, lair));
}

// The lair's blocks, a slice at a time: the clearing's trees and plants cleared, dips filled, then the floor and the
// rest; then its boss, at home. Marked built at the end: one left half built (the world closed, or a chunk unloaded) is
// built again when a player is next near it (keepLairs).
function* buildLair(d, lair) {
  try {
    yield* buildBlocks(d, lair);
  } finally {
    building.delete(lair.id);
  }
}

function* buildBlocks(d, lair) {
  const c = { x: lair.x, y: lair.y, z: lair.z };
  const sloth = lair.species === KINDS[WILD_SLOTH].species;
  const drake = lair.species === KINDS[WILD_DRAKE].species;
  const air = BlockPermutation.resolve("minecraft:air");
  const fill = BlockPermutation.resolve(drake ? "minecraft:end_stone" : sloth ? "minecraft:soul_soil" : "minecraft:dirt");
  const up = drake ? DRAKE_LAIR.clearUp : sloth ? SLOTH_LAIR.clearUp : LAIR.clearUp;
  const down = drake ? DRAKE_LAIR.fillDown : sloth ? SLOTH_LAIR.fillDown : LAIR.fillDown;
  const seed = lair.x * 31 + lair.z;
  const columns = drake ? drakeLairColumns(c, lair.facing) : sloth ? slothLairColumns(c, lair.facing) : lairColumns(c, lair.facing);
  const blocks = drake ? drakeLairBlocks(c, lair.facing, seed) : sloth ? slothLairBlocks(c, lair.facing, seed) : lairBlocks(c, lair.facing, seed);
  let n = 0;
  for (const col of columns) {
    d.fillBlocks(new BlockVolume({ x: col.x, y: c.y + 1, z: col.z }, { x: col.x, y: c.y + up, z: col.z }), air);
    for (let y = c.y - down; y < c.y; y++) {
      const b = d.getBlock({ x: col.x, y, z: col.z });
      if (b && (b.isAir || b.isLiquid || !b.isSolid)) b.setPermutation(fill);
    }
    if (++n % 12 === 0) yield;
  }
  n = 0;
  for (const b of blocks) {
    const block = d.getBlock(b);
    if (block) block.setPermutation(BlockPermutation.resolve(b.id, b.states ?? {}));
    if (++n % 40 === 0) yield;
  }
  db.put(BOSSES, { ...lair, built: true });
  lair.built = true;
  putBoss(d, lair);
}

// Its boss put in the lair: the yeti in its den facing out of its door; the sloth hanging under its beam, asleep; the
// Baby Dragon on its nest, asleep, facing out over the clearing.
function putBoss(d, lair) {
  if (lair.nest) {
    const n = lair.nest;
    const e = d.spawnEntity(WILD_DRAKE, { x: n.x, y: n.y, z: n.z }, { initialPersistence: true });
    e.setDynamicProperty(LAIR_PROP, lair.id);
    try {
      e.setProperty(PROP, DRAKE_ACT.sleep);
      e.setRotation({ x: 0, y: n.yaw });
    } catch {
      // as it is
    }
    return e;
  }
  if (lair.hang) {
    const site = lair.hang;
    const e = d.spawnEntity(WILD_SLOTH, { x: site.x, y: site.hangY, z: site.z }, { initialPersistence: true });
    e.setDynamicProperty(LAIR_PROP, lair.id);
    try {
      e.triggerEvent("zoocraft:hang");
      e.setProperty(PROP, SLOTH_ACT.sleep);
      e.setRotation({ x: 0, y: site.yaw });
    } catch {
      // as it is
    }
    return e;
  }
  const e = d.spawnEntity(WILD_YETI, { x: lair.den.x, y: lair.den.y, z: lair.den.z }, { initialPersistence: true });
  e.setDynamicProperty(LAIR_PROP, lair.id);
  try {
    e.setRotation({ x: 0, y: (lair.facing * 90 + 180) % 360 }); // facing out of its door
  } catch {
    // as it is
  }
  return e;
}

// Wild lairs near players: a boss missing three looks running is put back; a second one by the same den is taken away.
function keepLairs(now, all) {
  const players = onlinePlayers();
  for (const lair of all) {
    if (lair.state !== "wild" || building.has(lair.id)) continue;
    const near = players.some((p) => {
      try {
        return p.dimension.id === lair.dimension && dist2(p.location, lair) <= YETI.respawn.near;
      } catch {
        return false;
      }
    });
    if (!near) continue;
    const d = world.getDimension(lair.dimension);
    let loaded = false;
    try {
      loaded = d.isChunkLoaded(lair.den) && d.getBlock(lair.den) !== undefined;
    } catch {
      loaded = false;
    }
    if (lair.built === false) {
      if (loaded) startBuild(d, lair);
      continue;
    }
    let mine = [];
    try {
      mine = entitiesNear(d, lair.den, YETI.respawn.missing, BOSS_TYPES).filter((e) => e.getDynamicProperty(LAIR_PROP) === lair.id);
    } catch {
      mine = [];
    }
    for (const extra of mine.slice(1)) {
      try {
        extra.remove();
      } catch {
        // gone
      }
    }
    const m = missingLooks(misses.get(lair.id) ?? 0, { playerNear: near, denLoaded: loaded, yetis: mine.length });
    if (m >= YETI.respawn.looks) {
      misses.delete(lair.id);
      putBoss(d, lair);
    } else misses.set(lair.id, m);
  }
}
