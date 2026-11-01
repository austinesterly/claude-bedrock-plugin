import { world, system, EntityDamageCause, BlockPermutation, BlockVolume } from "@minecraft/server";
import { onlinePlayers, entitiesNear, biomeAt } from "../platform/mc.js";
import { db } from "../persistence/db.js";
import { allParks, memberOfAny, parkAt, withPark } from "../park/park.js";
import { researched } from "../research/research.js";
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
import { CYCLOPS, CYCLOPS_ACT, WILD_CYCLOPS, CYCLOPS_ROCK, CAMP, campBlocks, campColumns, campDen, inCyclopsBiome } from "./cyclopsRules.js";
import {
  NECRO, NECRO_ACT, WILD_NECRO, SOUL_BOLT, RAISED_TYPE, RAISED_TAG, RAISED_PROP, NECRO_BIOME_TAG, inNecroBiome, FORTRESS,
  fortressBox, cryptBox, clampBox, fortressNear, CRYPT, CRYPT_APART, cryptDen, cryptBlocks, cryptColumns, mayRaise,
  raiseSpots, raiseFloor, cryptGroundY, cryptSiteLevel, CRYPT_PATH, CRYPT_CUT, cryptPath,
} from "./necroRules.js";
import {
  VOID, VOID_ACT, WILD_VOID, VOID_ORB, VOID_BIOME_TAG, outerIslands, RIFT, RIFT_APART, riftDen, riftBlocks, riftColumns,
  riftNearEdgeSteps, dryRound, pickVoidMove, inGrabReach, edgeRoute,
} from "./voidRules.js";
import { startGrab, grabbing, grabHit, takeGrab, endGrab } from "./voidling.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";

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
// The Cyclops (0.1.165, module 11's first rare mob; animals/cyclopsRules.js) is fought the same way, with the yeti's
// calm: but it is hostile (anyone within 12 blocks, or 4 sneaking, starts a fight, and it goes on while they stay that
// near), it smashes its club down, stomps and throws rocks, and tired out (a quarter of its health) it is calmed with the
// Passivity Serum (animals/mobs.js, which calls bossCaught) instead of being caged. Its camps, in the windswept hills and
// stony peaks, are made only for a park member whose park has done Mob Taming, none within 1,500 blocks of another.
// The Necromancer (0.1.166, module 11's second rare mob; animals/necroRules.js) is fought as the Cyclops is: its staff
// swung across the front, its foot struck down for a ring of soul fire that slows, soul bolts from far off, a wail at half
// health; and every 10 seconds of a fight it raises a skeleton from the ground while fewer than 3 it raised stand
// (tagged, with its id). They crumble when its fight is over, when it tires or is calmed, and when it is gone (a sweep
// finds any left after a reload); its bolts and their fire never hurt them. Its crypts are made in the soul sand valleys,
// or beside a Nether fortress anywhere in the Nether (40 of its blocks round the player), never with a fortress block in
// the crypt's box, never within 40 blocks of another lair.
// The Voidling (0.1.167, module 11's third rare mob; animals/voidRules.js) is fought as the Cyclops is, and very slow: a
// long arm raked across its front, a slow void orb from far off (Darkness on a hit), a void shriek at half health, none
// of their pushes ever throwing anyone off an island (the void guard); and its grab: a one second shriek, then whoever is
// still within its reach in front of it is held out in front of it and walked to the island's edge it found, and let go
// over the void (animals/voidling.js). Any player's hit on it breaks the grab. Its rifts are made on the outer End
// islands, near an island's edge, never within 40 blocks of another lair.

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
  [WILD_YETI]: { key: "yeti", type: WILD_YETI, R: YETI, ACT: YETI_ACT, ball: SNOWBALL, species: "zoocraft:giant_yeti", place: "yeti_lair", dim: OVERWORLD, tag: "taiga", name: "Giant Yeti",
    caught: "A Giant Yeti only goes into its cage once it is tired out: wear it down in a fight till it slumps down panting." },
  [WILD_SLOTH]: { key: "sloth", type: WILD_SLOTH, R: SLOTH, ACT: SLOTH_ACT, ball: SOUL_CLUMP, species: "zoocraft:soul_sloth", place: "sloth_lair", dim: NETHER, tag: "soulsand_valley", name: "Soul Sloth",
    caught: "A Soul Sloth only goes into its cage once it is tired out: wear it down in a fight till it curls up panting." },
  [WILD_DRAKE]: { key: "drake", type: WILD_DRAKE, R: DRAKE, ACT: DRAKE_ACT, species: "zoocraft:baby_dragon", place: "drake_lair", dim: END, tag: "the_end", name: "Baby Dragon",
    caught: "A Baby Dragon only goes into its crate once it is tired out: wear it down in a fight till it lies down panting." },
  // The Cyclops (0.1.165): its camps in windswept hills (the tag) and stony peaks (by id), only for parks with Mob
  // Taming done; calmed with the serum, not caged.
  [WILD_CYCLOPS]: { key: "cyclops", type: WILD_CYCLOPS, R: CYCLOPS, ACT: CYCLOPS_ACT, ball: CYCLOPS_ROCK, species: "zoocraft:zoo_cyclops", place: "cyclops_camp", dim: OVERWORLD, tag: "extreme_hills", inBiome: inCyclopsBiome, research: "mob_taming", name: "Cyclops",
    caught: "A Cyclops is calmed with a Passivity Serum once it is tired out: wear it down in a fight till it sits down panting." },
  // The Necromancer (0.1.166): its crypts in the soul sand valleys (the tag) or beside a Nether fortress anywhere in the
  // Nether (`near`: the fortress's blocks counted round the player), only for parks with Mob Taming done; calmed with the
  // serum, not caged.
  [WILD_NECRO]: { key: "necro", type: WILD_NECRO, R: NECRO, ACT: NECRO_ACT, ball: SOUL_BOLT, species: "zoocraft:zoo_necromancer", place: "necro_crypt", dim: NETHER, tag: NECRO_BIOME_TAG, inBiome: inNecroBiome, near: fortressAround, research: "mob_taming", name: "Necromancer",
    caught: "A Necromancer is calmed with a Passivity Serum once it is tired out: wear it down in a fight till it kneels down panting." },
  // The Voidling (0.1.167): its rifts on the outer End islands (the End is one biome: the outer islands are told by how
  // far out they are, in makeRift), only for parks with Mob Taming done; calmed with the serum, not caged.
  [WILD_VOID]: { key: "void", type: WILD_VOID, R: VOID, ACT: VOID_ACT, ball: VOID_ORB, species: "zoocraft:zoo_voidling", place: "void_rift", dim: END, tag: VOID_BIOME_TAG, research: "mob_taming", name: "Voidling",
    caught: "A Voidling is calmed with a Passivity Serum once it is tired out: wear it down in a fight till it crouches down panting." },
};
const KIND_LIST = Object.values(KINDS);
// Whether a biome ({ id, tags }) is one a kind's lairs are made in.
const inKindBiome = (k, b) => Boolean(b) && (k.inBiome ? k.inBiome(b) : (b.tags ?? []).includes(k.tag));

const state = new Map(); // boss id -> its state (see meet)
const hits = new Map(); // boss id -> { by: player id, tick }: a player's hit seen in the before-hurt event, for the loop
let applying = false; // the script's own hit on a player is landing (the boss's melee_box_attack hits are cancelled)
const misses = new Map(); // lair id -> looks in a row with its den loaded, a player near, and no boss
const nextLairLook = new Map(); // player id -> tick
const building = new Set(); // lair ids whose blocks are being placed
const buildTries = new Map(); // lair id -> builds started since load (a lair left half built is built again, 3 times at most)
const jobs = jobQueue((gen) => system.runJob(timedJob("lairs", gen)), (error) => log(`lairs: building a lair failed: ${error}`));
let sweepTicks = 0; // the raised skeletons' sweep (every 100 ticks)
const nextKindLook = new Map(); // "player id|kind" -> tick: a kind's next look round them, after one that found no site

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
      if (fromPlayer && !out.cancel && by) {
        hits.set(e.id, { by: by.id, tick: system.currentTick });
        grabHit(e.id); // a Voidling holding someone lets go (0.1.167)
      }
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

// A skeleton the Necromancer raised (0.1.166): its soul bolts, its own hits, the other raised skeletons' arrows (they
// shoot past each other at the player) and fire never hurt it (a player's hits do).
world.beforeEvents.entityHurt.subscribe(
  (ev) => {
    try {
      const src = ev.damageSource;
      const cause = String(src.cause);
      const by = src.damagingEntity;
      if (src.damagingProjectile?.typeId === SOUL_BOLT || by?.typeId === WILD_NECRO || (by?.typeId === RAISED_TYPE && by.hasTag(RAISED_TAG)) || cause === "fire" || cause === "fireTick") ev.cancel = true;
    } catch {
      // let it be
    }
  },
  { entityFilter: { type: RAISED_TYPE, tags: [RAISED_TAG] } },
);

// The thrown things' hits: a push back and a puff on a player; a puff where they land on the ground.
const THROWN = {
  [SNOWBALL]: { puff: "zoocraft:yeti_snow_puff", sound: "dig.snow", knock: YETI.moves.hurl.knock },
  [SOUL_CLUMP]: { puff: "zoocraft:sloth_clump_puff", sound: "dig.soul_sand", knock: SLOTH.moves.hurl.knock },
  [VOID_BOLT]: { puff: "zoocraft:drake_bolt_puff", sound: "mob.shulker.bullet.hit", knock: DRAKE.moves.bolt.knock, guard: true },
  [CYCLOPS_ROCK]: { puff: "zoocraft:cyclops_rock_puff", sound: "dig.stone", knock: CYCLOPS.moves.hurl.knock },
  [SOUL_BOLT]: { puff: "zoocraft:necro_bolt_puff", sound: "fire.ignite", knock: NECRO.moves.hurl.knock },
  // The Voidling's void orb (0.1.167): guarded as the Baby Dragon's bolt, and Darkness on whom it hits.
  [VOID_ORB]: { puff: "zoocraft:voidling_orb_puff", sound: "mob.shulker.bullet.hit", knock: VOID.moves.hurl.knock, guard: true, dark: VOID.moves.hurl.darkTicks },
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
    if (t.dark) hit.addEffect("darkness", t.dark, { amplifier: 0, showParticles: false });
    // The thrown thing is already gone (its remove_on_hit): the way it flew is the event's hitVector. The yeti's, the
    // Soul Sloth's, the Cyclops's and the Necromancer's push with the game's own impact knockback; the guarded ones
    // (the Baby Dragon's bolt, the Voidling's orb: their projectiles push nothing) are pushed here, never off an End
    // island (the void guard).
    if (!t.guard) return;
    const v = ev.hitVector;
    const len = Math.hypot(v.x, v.z) || 1;
    const dir = { x: v.x / len, z: v.z / len };
    const h = guardKnock(ev.dimension, hit.location, dir, t.knock.h);
    hit.applyKnockback({ x: dir.x * h, z: dir.z * h }, h < t.knock.h ? Math.min(t.knock.v, 0.15) : t.knock.v);
  } catch {
    // cosmetic, Darkness and the push only
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
        crumble(state.get(e.id));
        endGrab(e.id);
        state.delete(e.id);
        stopGlide(e.id);
        stopSteer(e.id, e);
        log(`boss: ${error}`);
      }
    }
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    crumble(state.get(id));
    endGrab(id);
    state.delete(id);
    stopGlide(id);
    stopSteer(id);
  }
  for (const id of [...hits.keys()]) if (!seen.has(id)) hits.delete(id);
  if (++sweepTicks % 50 === 0) sweepRaised(who); // every 100 ticks (the loop runs every 2)
}

// --- The Necromancer's raised skeletons (0.1.166) -------------------------------------------------------------------
// Those it raised still standing (dead or gone ones dropped).
function raisedStanding(s) {
  s.raised = (s.raised ?? []).filter((x) => x.isValid);
  return s.raised.length;
}

// Its raised skeletons crumble (its fight over, it tired out or calmed, or it gone): a puff of soul fire, a rattle, and
// they are gone (nothing dropped).
function crumble(s) {
  if (!s?.raised?.length) return;
  for (const sk of s.raised) {
    try {
      if (!sk.isValid) continue;
      const l = sk.location;
      particle(sk.dimension, "zoocraft:necro_raise_burst", { x: l.x, y: l.y + 0.2, z: l.z });
      sound(sk.dimension, "mob.skeleton.death", l, 0.8, 0.8);
      sk.remove();
    } catch {
      // gone
    }
  }
  s.raised = [];
}

// Raised skeletons whose Necromancer no longer counts them (the world reloaded mid-fight, it was taken away, or its fight
// ended while they were out of reach): crumbled.
function sweepRaised(who) {
  for (const dim of new Set(who.map((w) => w.dim))) {
    let list = [];
    try {
      list = world.getDimension(dim).getEntities({ type: RAISED_TYPE, tags: [RAISED_TAG] });
    } catch {
      continue;
    }
    for (const sk of list) {
      try {
        const by = sk.getDynamicProperty(RAISED_PROP);
        const s = typeof by === "string" ? state.get(by) : undefined;
        if (s?.raised?.some((x) => x.id === sk.id)) continue;
        crumble({ raised: [sk] });
      } catch {
        // gone
      }
    }
  }
}

// A skeleton raised: at the first spot near it (toward its target first) with a floor and room over it, a burst of
// soul fire there and the summoning sounds. Tagged, with the Necromancer's id: it crumbles when the fight is over.
function raiseOne(e, s) {
  const d = e.dimension;
  const at = e.location;
  const idAt = idReader(d);
  const y0 = Math.floor(at.y) - 1;
  sound(d, "mob.evocation_illager.cast_spell", at, 1.2, 0.7);
  for (const c of raiseSpots(at, s.yaw ?? 0, Math.random, s.k.R)) {
    const y = raiseFloor(idAt, c.x, y0, c.z);
    if (y === undefined) continue;
    const spot = { x: c.x + 0.5, y: y + 1, z: c.z + 0.5 };
    try {
      const sk = d.spawnEntity(RAISED_TYPE, spot);
      sk.addTag(RAISED_TAG);
      sk.setDynamicProperty(RAISED_PROP, e.id);
      (s.raised ??= []).push(sk);
    } catch (error) {
      log(`boss: the Necromancer's raising: ${error}`);
      return;
    }
    particle(d, "zoocraft:necro_raise_burst", { x: spot.x, y: spot.y + 0.1, z: spot.z });
    sound(d, "dig.soul_soil", spot, 1.4, 0.6);
    sound(d, "mob.skeleton.say", spot, 1.0, 0.6);
    return;
  }
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
    case "grab":
      return grabbed(e, s, now);
    case "aftergrab":
      if (now >= s.until) backToFight(e, s, now);
      return;
    case "rise":
      if (now >= s.until) toCalm(e, s, now);
      return;
    default:
      toCalm(e, s, now);
  }
}

// Calm: energy coming back, wandering (or to its den and asleep at night), a roar now and then; provoked, it fights.
function calm(e, s, now, who, energy, hp, home, hit) {
  if (energy < s.k.R.energy && now > s.regenAt) {
    hp.setCurrentValue(regen(energy, now - s.regenAt, s.k.R));
  }
  s.regenAt = now;
  const p = hit ? who.find((w) => w.id === hit.by) : provoker(e.location, who, s.k.R.provoke, s.k.R.sneakProvoke ?? 0);
  if (p && fights(p.mode)) {
    s.target = p.id;
    s.lastHit = now;
    if (s.phase === "sleep") {
      // Up first (the client's get-up), then the roar.
      s.phase = "wake";
      s.until = now + 24;
      setAct(e, s.k.ACT.none);
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
      setAct(e, s.k.ACT.none);
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
      setAct(e, s.k.ACT.none);
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
    if (d <= s.k.R.denArrive || now - s.denSince >= s.k.R.denGiveUp) {
      s.phase = "sleep";
      body(e, s, "rest");
      setAct(e, s.k.ACT.sleep);
    }
    return;
  }
  if (s.phase === "den") {
    s.phase = "calm";
    body(e, s, "calm");
  }
  if (Math.random() < s.k.R.calmRoarChance) {
    s.phase = "calmroar";
    s.until = now + s.k.R.calmRoarTicks;
    body(e, s, "hold");
    setAct(e, s.k.ACT.roar);
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
  if (s.k.key === "void") {
    // Its arms thrown wide, a low murmur, then the shriek (the art's: the cry at 0.6 s).
    system.runTimeout(() => sound(d, "mob.endermen.idle", l, volume * 1.2, 0.5), 3);
    system.runTimeout(() => {
      sound(d, "mob.endermen.scream", l, volume * 1.4, pitch * 0.75);
      sound(d, "shriek.sculk_shrieker", l, volume * 1.2, pitch * 1.1);
    }, 12);
    return;
  }
  if (s.k.key === "necro") {
    // Its staff raised, a rattle, then the wail (the art's: the cry at 0.8 s).
    for (const t of [4, 10]) system.runTimeout(() => sound(d, "mob.skeleton.say", l, volume * 1.2, 0.5), t);
    system.runTimeout(() => {
      sound(d, "mob.wither.ambient", l, volume * 0.6, pitch * 1.6);
      sound(d, "mob.ghast.moan", l, volume * 1.2, pitch * 0.8);
    }, 16);
    return;
  }
  if (s.k.key === "cyclops") {
    for (const t of [3, 9]) system.runTimeout(() => sound(d, "mob.ravager.step", l, volume * 1.2, 0.5), t);
    system.runTimeout(() => {
      sound(d, "mob.ravager.roar", l, volume * 2, pitch * 0.85);
      sound(d, "mob.hoglin.angry", l, volume * 1.5, pitch * 0.6);
    }, 16);
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
  if (s.k.R.raise) s.nextRaise = now + s.k.R.raise.first; // the Necromancer's first skeleton
  body(e, s, s.angry ? "chase_angry" : "chase");
}

function fighting(e, s, now, who, energy, home) {
  const R = s.k.R;
  if (energy <= R.tiredAt) return tire(e, s, now);
  // The Cyclops is hostile: the fight goes on while someone is within its reach, hit or not.
  if (R.hostile && provoker(e.location, who, R.provoke, R.sneakProvoke ?? 0)) s.lastHit = now;
  if (fightOver({ home, players: who, now, lastHit: s.lastHit }, R)) return endFight(e, s, now);
  if (!s.angry && energy <= R.angryAt) return startAngry(e, s, now);
  const at = e.location;
  const t = targetOf(at, home, who, R.ring);
  if (!t) return endFight(e, s, now);
  s.target = t.id;
  // The Necromancer (0.1.166): when its time comes, a skeleton raised while fewer than its most stand (else the next);
  // straight away, between its other moves (not kept for the next one's turn, so the times hold: 5 seconds, then 10).
  if (R.raise && now >= (s.nextRaise ?? Infinity)) {
    const go = mayRaise(now, s.nextRaise, raisedStanding(s), R);
    s.nextRaise = now + R.raise.every;
    if (go) return startMove(e, s, now, at, t, "raise");
  }
  if (now < s.nextMove) return;
  const d = dist2(at, t);
  if (s.k.key === "void") {
    const vm = pickVoidMove(d, () => grabWay(e, s, now, t), Math.random, R);
    if (vm) startMove(e, s, now, at, t, vm);
    return;
  }
  const near = who.filter((w) => fights(w.mode) && dist2(at, w) <= R.moves.slam.reach && Math.abs(w.y - at.y) <= R.moves.slam.high).length;
  const move = pickMove(d, near, Math.random, R);
  if (!move) return;
  startMove(e, s, now, at, t, move);
}

// A move begun: held still, turned to its target, the act and the wind-up sound.
function startMove(e, s, now, at, t, move) {
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
  if (s.k.key === "void") {
    if (move === "grab") {
      // The grab's warning: a shriek of a second, its arms thrown wide.
      sound(d, "shriek.sculk_shrieker", at, 1.6, 0.8);
      sound(d, "mob.endermen.scream", at, 1.2, 0.6);
      particle(d, "zoocraft:voidling_wisp", { x: at.x, y: at.y + 1.6, z: at.z });
    } else if (move === "hurl") sound(d, "mob.evocation_illager.prepare_attack", at, 1.0, 0.5); // the orb grown between its hands
    else sound(d, "mob.endermen.idle", at, 1.2, 0.5);
    return;
  }
  if (s.k.key === "necro") {
    if (move === "hurl") sound(d, "mob.evocation_illager.prepare_attack", at, 1.0, 0.7); // the flame drawn back
    else if (move === "raise") sound(d, "mob.evocation_illager.prepare_summon", at, 1.2, 0.7);
    else if (move === "slam") sound(d, "mob.wither.ambient", at, 0.5, 1.5);
    else sound(d, "mob.skeleton.say", at, 1.2, 0.6);
    return;
  }
  if (s.k.key === "cyclops") {
    if (move === "hurl") sound(d, "dig.stone", at, 1.2, 0.6); // the rock picked up
    else if (move === "slam") sound(d, "mob.hoglin.angry", at, 1.2, 0.6);
    else sound(d, "mob.polarbear.warning", at, 1.0, 0.55);
    return;
  }
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
    else if (s.move === "raise") raiseOne(e, s);
    else if (s.move === "grab") {
      if (grabNow(e, s, now, target)) return;
    } else strike(e, s, who);
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
  if (s.k.key === "void") {
    // A long arm swept across its front: a puff of violet where its claws pass.
    particle(d, "zoocraft:voidling_orb_puff", aheadOf(at, s.yaw, 2.4, 1.2));
    sound(d, "mob.warden.attack", at, 0.8, 1.3);
  } else if (s.k.key === "necro") {
    if (s.move === "slam") {
      // The staff's foot struck on the ground: a ring of soul fire out round it.
      particle(d, "zoocraft:necro_soul_ring", { x: at.x, y: at.y + 0.15, z: at.z });
      sound(d, "mob.blaze.shoot", at, 1.2, 0.5);
      sound(d, "fire.ignite", at, 1.4, 0.6);
    } else {
      // The staff swung across the front: a puff of soul fire where its head passes.
      particle(d, "zoocraft:necro_bolt_puff", aheadOf(at, s.yaw, 2.2, 1.2));
      sound(d, "mob.evocation_fangs.attack", at, 1.0, 0.8);
    }
  } else if (s.k.key === "cyclops") {
    if (s.move === "slam") {
      // The stomp: a ring of dust thrown out along the ground round its feet.
      particle(d, "zoocraft:cyclops_stomp_burst", { x: at.x, y: at.y + 0.2, z: at.z });
      sound(d, "mob.ravager.stun", at, 1.4, 0.6);
      sound(d, "dig.stone", at, 1.5, 0.5);
    } else {
      // The club's head on the ground 3 blocks out in front.
      const club = aheadOf(at, s.yaw, 3.1, 0.2);
      particle(d, "zoocraft:cyclops_rock_puff", club);
      sound(d, "random.anvil_land", club, 0.7, 0.5);
      sound(d, "dig.stone", club, 1.4, 0.6);
    }
  } else if (s.k.key === "sloth") {
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
      knock(e, s, w, h);
      if (M.slowTicks) w.player.addEffect("slowness", M.slowTicks, { amplifier: M.slowLevel ?? 0, showParticles: true });
    } catch {
      // gone
    }
  }
}

// The thrown thing (the yeti's snowball from over its head, the sloth's clump from its hands, the Cyclops's rock from
// over its head), at the target's chest (where they stand now: step aside and it misses).
function hurl(e, s, target) {
  const R = s.k.R;
  const d = e.dimension;
  const from = aheadOf(e.location, s.yaw, R.throwFrom.ahead, R.throwFrom.up);
  if (s.k.key === "void") sound(d, "mob.endermen.portal", from, 1.2, 0.6); // its void orb flung from its hands
  else if (s.k.key === "necro") sound(d, "mob.blaze.shoot", from, 1.2, 0.7); // its soul bolt flung from the staff
  else sound(d, s.k.key === "yeti" ? "mob.snowgolem.shoot" : "mob.irongolem.throw", from, 1.4, 0.5);
  if (!target) return;
  try {
    const ball = d.spawnEntity(s.k.ball, from);
    const proj = /** @type {import("@minecraft/server").EntityProjectileComponent | undefined} */ (ball.getComponent("minecraft:projectile"));
    if (!proj) return void ball.remove();
    proj.owner = e;
    proj.shoot(throwVelocity(from, { x: target.x, y: target.y + 1.2, z: target.z }, R.moves.hurl.speed, R.moves.hurl.gravity), { uncertainty: 0 });
  } catch (error) {
    log(`boss: the ${s.k.name}'s throw: ${error}`);
  }
}

// A push on a player ({ x, z, h, v } from the rules). The Voidling's are guarded (animals/babyDragon.js guardKnock): none
// of its pushes ever throws anyone off an island; only its grab takes them to the edge.
function knock(e, s, w, h) {
  if (s.k.key !== "void") return w.player.applyKnockback({ x: h.x, z: h.z }, h.v);
  const len = Math.hypot(h.x, h.z);
  if (len < 1e-6) return w.player.applyKnockback({ x: 0, z: 0 }, h.v);
  const dir = { x: h.x / len, z: h.z / len };
  const f = guardKnock(e.dimension, w, dir, h.h);
  w.player.applyKnockback({ x: dir.x * f, z: dir.z * f }, f < h.h ? Math.min(h.v, 0.15) : h.v);
}

// --- The Voidling's grab (0.1.167) ----------------------------------------------------------------------------------
// What a column is for its way to the edge (animals/voidRules.js edgeRoute): the height of the ground in it (under any
// grass or the like on top, walked through: data/blocks.js PASSABLE_PATTERNS), "void" (no block in it at all, its chunk
// loaded), or undefined (unloaded, liquid, or a chorus plant or an end rod on top: no way through). (Block.isSolid is not
// in the stable script API: it read undefined, so no column was ground and no way was ever found, bench 0.1.167.)
const NOT_FLOOR = /^minecraft:(chorus_plant|chorus_flower|end_rod)$/;
const walkedThrough = (b) => b.isAir || PASSABLE_PATTERNS.some((r) => r.test(b.typeId));
function columnReader(d) {
  const seen = new Map();
  return (x, z) => {
    const k = `${x},${z}`;
    if (seen.has(k)) return seen.get(k);
    let v;
    try {
      if (!d.isChunkLoaded({ x, y: 64, z })) v = undefined;
      else {
        const top = d.getTopmostBlock({ x, z });
        let b = top;
        for (let i = 0; i < 3 && b && walkedThrough(b); i++) b = b.below();
        v = top === undefined ? "void" : b && !b.isLiquid && !walkedThrough(b) && !NOT_FLOOR.test(b.typeId) ? b.location.y : undefined;
      }
    } catch {
      v = undefined;
    }
    seen.set(k, v);
    return v;
  };
}

// Its way to the nearest island edge from where it stands, or undefined.
function routeFrom(e) {
  const at = e.location;
  const floorY = Math.floor(at.y + 0.01) - 1;
  const r = edgeRoute(columnReader(e.dimension), { x: at.x, z: at.z }, floorY, VOID.route);
  return r ? { ...r, from: { x: at.x, z: at.z }, floorY } : undefined;
}

// Whether it can make a grab at its target now (the move's pick): not within its cooldown, the target in Survival or
// Adventure, and a way to an edge from where it stands (kept for the lunge).
function grabWay(e, s, now, t) {
  if (now < (s.grabReady ?? 0) || !fights(t.mode)) return false;
  s.route = routeFrom(e);
  return Boolean(s.route);
}

// The lunge, once the shriek is over: whoever is still within its reach in front of it is grabbed and walked to the
// edge (animals/voidling.js). Whether it grabbed them (if not, the lunge plays out).
function grabNow(e, s, now, target) {
  const R = s.k.R;
  s.grabReady = now + R.grab.cooldown;
  const route = s.route;
  s.route = undefined;
  if (!route || !target || !inGrabReach(e.location, s.yaw, target, R)) {
    sound(e.dimension, "mob.endermen.idle", e.location, 1.0, 0.7);
    return false;
  }
  try {
    if (target.player.getComponent("minecraft:riding")) return false;
  } catch {
    return false;
  }
  if (!startGrab(e, target.player, route)) return false;
  s.phase = "grab";
  s.target = target.id;
  return true;
}

// Holding someone: animals/voidling.js walks them; once it has let go (at the edge, or a hit broke the grab, or they got
// free), it lets go or staggers back for a moment, then fights on.
function grabbed(e, s, now) {
  if (grabbing(e.id)) return;
  const how = takeGrab(e.id);
  const R = s.k.R;
  s.grabReady = now + R.grab.cooldown;
  s.phase = "aftergrab";
  s.until = now + (how === "broken" ? R.grab.staggerTicks : R.grab.letgoTicks);
  if (how === "edge" || how === "lost") s.target = undefined;
}

function backToFight(e, s, now) {
  setAct(e, s.k.ACT.none);
  s.phase = "fight";
  s.nextMove = now + (s.angry ? s.k.R.everyAngry : s.k.R.every);
  body(e, s, s.angry ? "chase_angry" : "chase");
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
    } else if (s.k.key === "cyclops") {
      particle(e.dimension, "zoocraft:cyclops_bellow", at);
      sound(e.dimension, "mob.ravager.stun", at, 1.0, 0.5);
    } else if (s.k.key === "necro") {
      particle(e.dimension, "zoocraft:necro_wail", at);
      sound(e.dimension, "mob.ghast.scream", at, 1.0, 0.5);
    } else if (s.k.key === "void") {
      particle(e.dimension, "zoocraft:voidling_shriek", at);
      sound(e.dimension, "shriek.sculk_shrieker", at, 1.6, 0.7);
    } else {
      particle(e.dimension, "zoocraft:yeti_frost_roar", at);
      sound(e.dimension, "random.glass", at, 1.0, 0.5);
    }
    for (const h of moveHits("angry", at, 0, who, R)) {
      const w = who.find((x) => x.id === h.id);
      if (!w) continue;
      try {
        w.player.addEffect("slowness", A.slowTicks, { amplifier: A.slowLevel, showParticles: true });
        if (A.darkTicks) w.player.addEffect("darkness", A.darkTicks, { amplifier: 0, showParticles: false });
        knock(e, s, w, h);
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
  crumble(s); // the Necromancer's skeletons
  endGrab(e.id); // whom a Voidling holds
  stopGlide(e.id);
  s.phase = "tired";
  s.cycle = "ground";
  s.quietSince = now;
  bar(e, s, false);
  body(e, s, "rest");
  setAct(e, s.k.ACT.tired);
  pant(e, s, 1.0);
}

// Its panting (the Necromancer's: a low rattle).
function pant(e, s, volume) {
  if (s.k.key === "void") sound(e.dimension, "mob.endermen.idle", e.location, volume, 0.45);
  else if (s.k.key === "necro") sound(e.dimension, "mob.skeleton.say", e.location, volume, 0.55);
  else sound(e.dimension, "mob.polarbear.idle", e.location, volume, s.k.key === "sloth" ? 0.4 : 0.5);
}

function tired(e, s, now, who, home, hp) {
  const R = s.k.R;
  s.ticks = (s.ticks ?? 0) + 1;
  if (s.ticks % 20 === 0) pant(e, s, 0.5); // panting, every 2 seconds
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
  crumble(s);
  endGrab(e.id);
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
  crumble(state.get(e.id)); // the Necromancer's skeletons
  endGrab(e.id);
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
  const biome = biomeAt(d, loc);
  for (const k of kinds) {
    const inBiome = inKindBiome(k, biome);
    if (!inBiome && !k.near) continue;
    if (k.research && !memberResearched(p, k.research)) continue;
    const mine = all.filter((l) => l.species === k.species);
    if (!lairAllowed(mine, d.id, loc, k.R.spacing)) continue;
    if (k.R.lookAgain && (nextKindLook.get(`${p.id}|${k.key}`) ?? 0) > now) continue; // no site last time: not yet
    if (!inBiome && !k.near(d, loc)) continue; // the Necromancer: beside a fortress (the dearer look last)
    if (k.key === "sloth") makeSlothLair(p, d, loc, all, k);
    else if (k.key === "drake") makeDrakeLair(p, d, loc, all, k);
    else if (k.key === "cyclops") makeCamp(p, d, loc, all, k);
    else if (k.key === "necro") {
      if (!makeCrypt(p, d, loc, all, k, inBiome)) nextKindLook.set(`${p.id}|${k.key}`, now + k.R.lookAgain);
    } else if (k.key === "void") {
      if (!riftLooks.has(p.id)) {
        riftLooks.add(p.id);
        jobs.push(riftLook(p.id, d, { x: loc.x, y: loc.y, z: loc.z }, k));
      }
    } else makeLair(p, d, loc, all);
  }
}

// Whether a Nether fortress is round a player (the Necromancer's crypts, 0.1.166): FORTRESS.min of its blocks in the box
// round them. The stable API has no structure lookup, so its blocks are counted (the native block filter). Unloaded or
// out of the world: no.
function fortressAround(d, loc) {
  try {
    const box = clampBox(fortressBox(loc), d.heightRange);
    const list = d.getBlocks(new BlockVolume(box.from, box.to), { includeTypes: FORTRESS.blocks }, false);
    let n = 0;
    for (const _p of list.getBlockLocationIterator()) {
      if (fortressNear(++n)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Whether a player is a member of a park that has done a research project (the Cyclops's camps: Mob Taming).
function memberResearched(p, id) {
  return allParks().some((park) => park.members[p.id] && withPark(park, () => researched(id)));
}

// A reader of block ids that never loads a chunk (undefined where unloaded).
// Whether a column has water (or lava) over its topmost block: getTopmostBlock reads under liquid (bench 0.1.167: the end
// stone under a Chorus Meadow's pond). Unloaded or out of the world: no.
function wetReader(d) {
  return (x, z) => {
    try {
      return Boolean(d.getTopmostBlock({ x, z })?.above()?.isLiquid);
    } catch {
      return false;
    }
  };
}

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

// A Cyclops's camp (0.1.165) in the windswept hills or stony peaks: level ground under the trees (the yeti's way, a
// little rougher: the hills are cut flat), in its biomes, away from parks; the bed at the back, on the far side from the
// player.
function makeCamp(p, d, loc, all, k) {
  const idAt = idReader(d);
  const tops = new Map();
  const groundAt = (x, z) => {
    const key = `${x},${z}`;
    if (tops.has(key)) return tops.get(key);
    let g;
    try {
      const top = d.getTopmostBlock({ x, z });
      g = top ? groundY(idAt, x, z, top.location.y) : undefined;
    } catch {
      g = undefined;
    }
    tops.set(key, g);
    return g;
  };
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  const S = k.R.site;
  for (const c of siteCandidates(loc, Math.random, S)) {
    if (!farFromParks(parks, c, S.parks) || parkAt(d.id, c)) continue;
    if (!inKindBiome(k, biomeAt(d, { x: c.x, y: loc.y, z: c.z }))) continue;
    const y = siteLevel(groundAt, c, CAMP.radius, S.level);
    if (y === undefined) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const den = campDen(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    const lair = { id, species: k.species, dimension: d.id, x: c.x, y, z: c.z, den, facing, state: "wild", madeAt: Date.now(), built: false, camp: true };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return;
  }
}

// A Necromancer's crypt (0.1.166): ground found going down under the Nether's roof (the sloth's way, rougher), in a soul sand
// valley or (`inBiome` false: a fortress round the player) any biome; never with a fortress block in its box (cut into
// the fortress, or under its bridges), never within 40 blocks of another lair, away from parks; the altar at the back,
// on the far side from the player. The ground: cryptGroundY (the Nether's small plants count as open). Whether it made one.
function makeCrypt(p, d, loc, all, k, inBiome) {
  const idAt = idReader(d);
  const S = k.R.site;
  const cache = new Map();
  const groundAt = (x, z, from, to) => {
    const key = `${x},${z},${from},${to}`;
    if (!cache.has(key)) cache.set(key, cryptGroundY(idAt, x, z, from, to, S.air));
    return cache.get(key);
  };
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  for (const c of siteCandidates(loc, Math.random, S)) {
    if (!farFromParks(parks, c, S.parks) || parkAt(d.id, c)) continue;
    if (!lairAllowed(all, d.id, c, CRYPT_APART)) continue;
    const y = cryptSiteLevel(groundAt, c, loc.y, S);
    if (y === undefined) continue;
    if (inBiome && !inKindBiome(k, biomeAt(d, { x: c.x, y: y + 1, z: c.z }))) continue;
    const centre = { x: c.x, y, z: c.z };
    try {
      const box = clampBox(cryptBox(centre), d.heightRange);
      if (d.containsBlock(new BlockVolume(box.from, box.to), { includeTypes: FORTRESS.blocks }, false)) continue;
    } catch {
      continue; // not all loaded
    }
    const facing = denFacing(centre, loc);
    const den = cryptDen(centre, facing);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    const lair = { id, species: k.species, dimension: d.id, x: c.x, y, z: c.z, den, facing, state: "wild", madeAt: Date.now(), built: false, crypt: true };
    db.put(BOSSES, lair);
    all.push(lair);
    startBuild(d, lair);
    return true;
  }
  return false;
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
// no place for it), with no pond on its clearing or within 3 of it (dryRound, 0.1.167), away from parks; the nest's front
// facing the way the player came.
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
  const wetAt = wetReader(d);
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  for (const c of siteCandidates(loc, Math.random, DRAKE.site)) {
    if (!outerEnd(c) || !farFromParks(parks, c, DRAKE.site.parks) || parkAt(d.id, c)) continue;
    const y = drakeSiteLevel(groundAt, c);
    if (y === undefined || !dryRound(wetAt, c, DRAKE_LAIR.radius + RIFT.dry)) continue;
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

// A Voidling's rift (0.1.167) on the outer End islands: level end stone under open sky (the Baby Dragon's ground,
// drakeSiteLevel, over the rift's radius) with no pond on it or round it (dryRound), near an island's edge (the void within VOID.site.edge of its middle), away
// from parks and never within 40 blocks of another lair. A look is a job on the lairs' queue, a slice a site and a way
// round it (bench 0.1.167: on a big island a look that found no site took 0.47 seconds when it was done in one tick);
// one look a player at a time, and one that found no site waits (as the Necromancer's).
const riftLooks = new Set(); // ids of players with a rift look running
function* riftLook(pid, d, loc, k) {
  try {
    const made = yield* makeRift(d, loc, k);
    if (!made) nextKindLook.set(`${pid}|${k.key}`, system.currentTick + k.R.lookAgain);
  } finally {
    riftLooks.delete(pid);
  }
}

// Whether it made one. The lairs are read afresh for each site (the look takes several ticks).
function* makeRift(d, loc, k) {
  if (!outerIslands(loc, k.R.site.outer)) return false;
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
  const colAt = columnReader(d);
  const wetAt = wetReader(d);
  const parks = allParks().filter((q) => q.dimension === d.id && q.center).map((q) => q.center);
  const S = k.R.site;
  for (const c of siteCandidates(loc, Math.random, S)) {
    if (!outerIslands(c, S.outer) || !farFromParks(parks, c, S.parks) || parkAt(d.id, c)) continue;
    if (!lairAllowed(lairs(), d.id, c, RIFT_APART)) continue;
    const y = drakeSiteLevel(groundAt, c, RIFT.radius, S.level);
    yield;
    if (y === undefined || !dryRound(wetAt, c)) continue;
    if (!(yield* riftNearEdgeSteps(colAt, c, S.edge))) continue;
    if (!lairAllowed(lairs(), d.id, c, RIFT_APART)) continue;
    const centre = { x: c.x, y, z: c.z };
    const facing = denFacing(centre, loc);
    const den = riftDen(centre);
    const id = `lair_${d.id.split(":")[1]}_${c.x}_${c.z}`;
    const lair = { id, species: k.species, dimension: d.id, x: c.x, y, z: c.z, den, facing, state: "wild", madeAt: Date.now(), built: false, rift: true };
    db.put(BOSSES, lair);
    startBuild(d, lair);
    return true;
  }
  return false;
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
  const camp = lair.species === KINDS[WILD_CYCLOPS].species;
  const crypt = lair.species === KINDS[WILD_NECRO].species;
  const rift = lair.species === KINDS[WILD_VOID].species;
  const air = BlockPermutation.resolve("minecraft:air");
  const fill = BlockPermutation.resolve(drake || rift ? "minecraft:end_stone" : sloth || crypt ? "minecraft:soul_soil" : camp ? "minecraft:stone" : "minecraft:dirt");
  const up = drake ? DRAKE_LAIR.clearUp : sloth ? SLOTH_LAIR.clearUp : camp ? CAMP.clearUp : crypt ? CRYPT.clearUp : rift ? RIFT.clearUp : LAIR.clearUp;
  const down = drake ? DRAKE_LAIR.fillDown : sloth ? SLOTH_LAIR.fillDown : camp ? CAMP.fillDown : crypt ? CRYPT.fillDown : rift ? RIFT.fillDown : LAIR.fillDown;
  const seed = lair.x * 31 + lair.z;
  const columns = drake ? drakeLairColumns(c, lair.facing) : sloth ? slothLairColumns(c, lair.facing) : camp ? campColumns(c, lair.facing) : crypt ? cryptColumns(c, lair.facing) : rift ? riftColumns(c, lair.facing) : lairColumns(c, lair.facing);
  const blocks = drake ? drakeLairBlocks(c, lair.facing, seed) : sloth ? slothLairBlocks(c, lair.facing, seed) : camp ? campBlocks(c, lair.facing, seed) : crypt ? cryptBlocks(c, lair.facing, seed) : rift ? riftBlocks(c, lair.facing, seed) : lairBlocks(c, lair.facing, seed);
  let n = 0;
  for (const col of columns) {
    d.fillBlocks(new BlockVolume({ x: col.x, y: c.y + 1, z: col.z }, { x: col.x, y: c.y + up, z: col.z }), air);
    for (let y = c.y - down; y < c.y; y++) {
      const b = d.getBlock({ x: col.x, y, z: col.z });
      if (b && (b.isLiquid || walkedThrough(b))) b.setPermutation(fill);
    }
    if (++n % 12 === 0) yield;
  }
  // The crypt's way out (0.1.166, animals/necroRules.js CRYPT_PATH): only the Nether's own ground and plants are cut
  // (the block filter), never a fortress's or a bastion's blocks.
  if (crypt) {
    for (const col of cryptPath(c, lair.facing)) {
      try {
        d.fillBlocks(new BlockVolume({ x: col.x, y: c.y + 1, z: col.z }, { x: col.x, y: c.y + CRYPT_PATH.up, z: col.z }), air, { blockFilter: { includeTypes: CRYPT_CUT } });
      } catch {
        // unloaded: left as it is
      }
      if (++n % 12 === 0) yield;
    }
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
  // The yeti in its den, the Cyclops on its bed of hides (0.1.165), the Necromancer on its carpet before the altar
  // (0.1.166), the Voidling on its rift's crying obsidian (0.1.167), each facing out over its clearing.
  const k = KIND_LIST.find((x) => x.species === lair.species) ?? KINDS[WILD_YETI];
  const e = d.spawnEntity(k.type, { x: lair.den.x, y: lair.den.y, z: lair.den.z }, { initialPersistence: true });
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
