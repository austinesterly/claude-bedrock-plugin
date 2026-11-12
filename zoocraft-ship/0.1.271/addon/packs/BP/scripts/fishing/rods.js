// ZooCraft's own fishing rods in the game (0.1.269: the Steel Rod; the rules and numbers: fishing/rodRules.js and
// data/balance.js `rods`). The game's hook only stays out for the game's own rod, so this does the whole of fishing:
//
// - Use the rod: the bobber flies out as the game's does (the cast sound, its flight, measured from the game's rod).
//   Use it again: reel in. Switching away from the rod, going 32 blocks off, or another dimension: the line is gone,
//   no wear.
// - In water it settles at the top and waits (100 to 600 ticks less Lure, twice as long with no open sky, rain as the
//   game's). A fish's ripples come in for 1 to 4 seconds, then it bites: the bobber dips with the splash. Reel within
//   half a second (the game's Bedrock window) for the catch; too early or too late, nothing, and the wait starts again.
// - The catch is the game's own: junk, treasure or fish by the game's odds (Luck of the Sea as the game's), from the
//   game's own fishing tables (a jungle's own), thrown to the player with 1 to 6 XP (Mending takes its share first).
//   A catch wears the rod 1, the bobber caught in a block 2, a hooked mob 5 (pulled toward the player); Unbreaking as
//   the game's. Nothing wears a rod in Creative.
// - The line: the bobber carries where the rod's tip is (zoocraft:tip_x/y/z), and its model draws a line to it.
// - 0.1.271: a lure on the rod (put on at the Tackle Box, fishing/tackleBox.js) adds its levels of Lure and Luck of the
//   Sea to the rod's own. The Deep Sea Rod casts three times as far; its line goes at 64 blocks.
import { world, system, GameMode, MolangVariableMap, EquipmentSlot } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { weatherNow } from "../core/weather.js";
import { reportError } from "../core/log.js";
import {
  BOBBER,
  rodOf,
  castStart,
  restPoint,
  waitTicks,
  waitScale,
  covers,
  approachTicks,
  rippleAt,
  catchKind,
  lootPath,
  wearOf,
  paidWear,
  catchXp,
  mend,
  lineTooLong,
  throwToward,
  pullToward,
  tipOf,
  lineMoved,
  onUse,
  reelOutcome,
  fishingLevels,
  lureOf,
  LURE_KEY,
} from "./rodRules.js";

const R = () => BALANCE.rods;
const fishing = new Map(); // player id -> { player, bobber, rod, reach, phase, ... }
const lastUse = new Map(); // player id -> tick of the last cast or reel (a held button repeats)
let ticker;
let lootPaths; // which way the game names its loot tables: "short" or "long" (found on the first catch)

const isWater = (id) => id === "minecraft:water" || id === "minecraft:flowing_water";
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const rand = Math.random;

function held(player) {
  try {
    return player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
  } catch {
    return undefined;
  }
}

function level(item, id) {
  try {
    return item?.getComponent("minecraft:enchantable")?.getEnchantment(id)?.level ?? 0;
  } catch {
    return 0;
  }
}

/** The lure on a rod item (0.1.271), or undefined. */
function tackleOf(item) {
  try {
    return lureOf(item?.getDynamicProperty(LURE_KEY));
  } catch {
    return undefined;
  }
}

/** The levels the rod in hand fishes at: its Lure and Luck of the Sea, and its lure's. */
function levelsOf(rod) {
  return fishingLevels(level(rod, "lure"), level(rod, "luck_of_the_sea"), tackleOf(rod), R().lures);
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function particle(dimension, id, at, dir = { x: 0, y: 0, z: 0 }) {
  try {
    const vars = new MolangVariableMap();
    vars.setVector3("variable.direction", dir);
    dimension.spawnParticle(id, at, vars);
  } catch {
    // an unloaded spot
  }
}

function blockAt(dimension, at) {
  try {
    return dimension.getBlock({ x: Math.floor(at.x), y: Math.floor(at.y), z: Math.floor(at.z) });
  } catch {
    return undefined;
  }
}

/** The custom component on every ZooCraft rod: use to cast, use again to reel in. */
export function rodComponent() {
  const use = (e) => {
    const player = e.source;
    if (player?.typeId !== "minecraft:player") return;
    const typeId = e.itemStack?.typeId;
    system.run(() => {
      try {
        useRod(player, typeId);
      } catch (error) {
        reportError("rod", error);
      }
    });
  };
  return { onUse: use, onUseOn: use };
}

function useRod(player, typeId) {
  if (!player.isValid) return;
  const rod = rodOf(typeId);
  if (!rod || held(player)?.typeId !== typeId) return;
  const now = system.currentTick;
  if (now - (lastUse.get(player.id) ?? -99) < R().useGap) return;
  lastUse.set(player.id, now);
  const state = fishing.get(player.id);
  if (onUse(state) === "reel") reel(player, state);
  else cast(player, rod);
}

function cast(player, rod) {
  const c = R().cast;
  const eye = player.getHeadLocation();
  const { pos, vel } = castStart(eye, player.getViewDirection(), c, rod.reach);
  const dimension = player.dimension;
  let bobber;
  try {
    bobber = dimension.spawnEntity(BOBBER, pos);
  } catch {
    return;
  }
  const state = { player, bobber, rod, reach: rod.reach, phase: "flying", since: system.currentTick, dim: dimension.id, tip: undefined, start: { pos, vel } };
  fishing.set(player.id, state);
  try {
    const pr = bobber.getComponent("minecraft:projectile");
    pr.owner = player;
    pr.shoot(vel, { uncertainty: 0 });
  } catch (error) {
    reportError("rod cast", error);
    drop(player.id);
    return;
  }
  try {
    dimension.playSound("random.bow", eye, { volume: 0.5, pitch: c.pitchMin + rand() * (c.pitchMax - c.pitchMin) });
  } catch {
    // no sound
  }
  sendTip(state);
  start();
}

function start() {
  if (ticker !== undefined) return;
  ticker = system.runInterval(() => {
    try {
      tick();
    } catch (error) {
      reportError("rods", error);
    }
  }, 1);
}

function drop(playerId) {
  const s = fishing.get(playerId);
  fishing.delete(playerId);
  try {
    if (s?.bobber?.isValid) s.bobber.remove();
  } catch {
    // gone already
  }
  if (!fishing.size && ticker !== undefined) {
    system.clearRun(ticker);
    ticker = undefined;
  }
}

function sendTip(s) {
  const t = R().tip;
  const p = s.player;
  const tip = tipOf(p.getHeadLocation(), p.getViewDirection(), t);
  if (!lineMoved(s.tip, tip, t.step)) return;
  try {
    s.bobber.setProperty("zoocraft:tip_x", tip.x);
    s.bobber.setProperty("zoocraft:tip_y", tip.y);
    s.bobber.setProperty("zoocraft:tip_z", tip.z);
    if (!s.tip) s.bobber.setProperty("zoocraft:line", true);
    s.tip = tip;
  } catch {
    // out of range: the line holds where it was
  }
}

function tick() {
  const now = system.currentTick;
  for (const [id, s] of [...fishing]) {
    const p = s.player;
    if (!p?.isValid || !s.bobber?.isValid || p.dimension.id !== s.dim || held(p)?.typeId !== s.rod.id) {
      drop(id);
      continue;
    }
    const at = s.bobber.location;
    if (lineTooLong(dist(p.location, at), s.reach, R())) {
      drop(id);
      continue;
    }
    sendTip(s);
    step(s, now);
  }
}

function step(s, now) {
  const b = s.bobber;
  const d = b.dimension;
  const at = b.location;
  if (s.phase === "stuck") return;
  if (s.phase === "flying") {
    if (s.hooked || s.stuck) return;
    const block = blockAt(d, at);
    if (isWater(block?.typeId)) return land(s, block, now);
    if (now - s.since > R().flyMax) drop(s.player.id);
    return;
  }
  if (s.phase === "hooked") {
    const m = s.hooked;
    if (!m?.isValid) return drop(s.player.id);
    try {
      const h = m.getHeadLocation();
      b.teleport({ x: h.x, y: h.y + 0.2, z: h.z });
    } catch {
      drop(s.player.id);
    }
    return;
  }
  if (s.phase === "settling") {
    const f = R().float;
    const y = at.y + (s.floatY - at.y) * f.rise;
    // on toward where the game's hook would come to rest, never back the way it came, and only over water
    const left = { x: s.rest.x - at.x, z: s.rest.z - at.z };
    const ahead = left.x * s.rest.dir.x + left.z * s.rest.dir.z > 0;
    const next = ahead ? { x: at.x + left.x * f.slide, y, z: at.z + left.z * f.slide } : { x: at.x, y, z: at.z };
    if (!isWater(blockAt(d, { x: next.x, y: s.floatY - 0.5, z: next.z })?.typeId)) {
      next.x = at.x;
      next.z = at.z;
      s.rest = { x: at.x, z: at.z, dir: s.rest.dir };
    }
    try {
      b.teleport(next);
    } catch {
      // stays
    }
    if (now - s.since >= f.ticks) {
      try {
        b.teleport({ x: next.x, y: s.floatY, z: next.z });
      } catch {
        // stays
      }
      wait(s, now);
    }
    return;
  }
  if (!isWater(blockAt(d, { x: at.x, y: s.floatY - 0.5, z: at.z })?.typeId)) {
    // the water went (drained, frozen): the bobber lies where it is, as if in a block
    s.phase = "stuck";
    s.stuck = true;
    return;
  }
  if (s.phase === "waiting") {
    if (rand() < R().splashChance) particle(d, "minecraft:water_splash_particle", { x: at.x + (rand() - 0.5) * 2, y: s.floatY, z: at.z + (rand() - 0.5) * 2 }, { x: 0, y: 0.1, z: 0 });
    if (--s.left <= 0) {
      s.phase = "coming";
      s.total = approachTicks(rand, R().approach);
      s.left = s.total;
      s.angle = rand() * Math.PI * 2;
    }
    return;
  }
  if (s.phase === "coming") {
    s.left--;
    const r = rippleAt({ x: at.x, y: s.floatY + 0.1, z: at.z }, s.angle, s.left, s.total);
    const ahead = rippleAt({ x: at.x, y: s.floatY + 0.1, z: at.z }, s.angle, s.left - 1, s.total);
    particle(d, "minecraft:water_wake_particle", r, { x: (ahead.x - r.x) * 4, y: 0, z: (ahead.z - r.z) * 4 });
    if (s.left <= 0) bite(s, now);
    return;
  }
  if (s.phase === "bite" && now > s.biteEnds) {
    try {
      b.setProperty("zoocraft:bite", false);
    } catch {
      // gone
    }
    wait(s, now); // too late: the game's timer starts again
  }
}

function land(s, block, now) {
  const b = s.bobber;
  const d = b.dimension;
  let top = block;
  for (let i = 0; i < 16; i++) {
    const up = blockAt(d, { x: top.location.x, y: top.location.y + 1, z: top.location.z });
    if (!isWater(up?.typeId)) break;
    top = up;
  }
  try {
    b.triggerEvent("zoocraft:float");
  } catch {
    // stays a projectile: it sinks, and the settle below holds it up
  }
  s.phase = "settling";
  s.since = now;
  s.floatY = top.location.y + R().float.surface;
  s.rest = restPoint(s.start, s.floatY, R().cast, R().float.rest);
  try {
    b.setProperty("zoocraft:floating", true);
  } catch {
    // no bob
  }
  particle(d, "minecraft:water_splash_particle", { x: b.location.x, y: s.floatY, z: b.location.z }, { x: 0, y: 0.2, z: 0 });
}

function openSky(d, at) {
  const x = Math.floor(at.x);
  const z = Math.floor(at.z);
  const y0 = Math.floor(at.y);
  let top;
  try {
    top = d.getTopmostBlock({ x, z });
  } catch {
    return true;
  }
  if (!top || top.location.y <= y0) return true;
  for (let y = y0 + 1; y <= top.location.y; y++) if (covers(blockAt(d, { x, y, z })?.typeId)) return false;
  return true;
}

function raining(d, at) {
  if (d.id !== "minecraft:overworld" || weatherNow() === "Clear") return false;
  try {
    const biome = d.getBiome(at)?.id ?? "";
    return !/desert|savanna|badlands|mesa/.test(biome);
  } catch {
    return true;
  }
}

function wait(s, now) {
  s.levels = levelsOf(held(s.player));
  const lure = s.levels.lure;
  const at = s.bobber.location;
  const d = s.bobber.dimension;
  const base = waitTicks(lure, rand, R().wait);
  s.phase = "waiting";
  s.since = now;
  s.left = base === undefined ? Infinity : Math.max(1, Math.round(base * waitScale(openSky(d, at), raining(d, at), R().wait)));
}

function bite(s, now) {
  const b = s.bobber;
  const d = b.dimension;
  const at = { x: b.location.x, y: s.floatY, z: b.location.z };
  s.phase = "bite";
  s.biteEnds = now + R().window;
  try {
    b.setProperty("zoocraft:bite", true);
  } catch {
    // no dip
  }
  try {
    d.playSound("random.splash", at, { volume: 0.25, pitch: 0.6 + rand() * 0.8 });
  } catch {
    // no sound
  }
  for (let i = 0; i < 6; i++) particle(d, "minecraft:basic_bubble_particle", { x: at.x + (rand() - 0.5) * 0.4, y: at.y - 0.2, z: at.z + (rand() - 0.5) * 0.4 }, { x: 0, y: 0.6, z: 0 });
  for (let i = 0; i < 4; i++) particle(d, "minecraft:water_splash_particle", { x: at.x + (rand() - 0.5) * 0.6, y: at.y, z: at.z + (rand() - 0.5) * 0.6 }, { x: 0, y: 0.3, z: 0 });
}

function reel(player, s) {
  const now = system.currentTick;
  const outcome = reelOutcome(s, now);
  const b = s.bobber;
  const from = b?.isValid ? b.location : player.location;
  if (outcome === "catch") landCatch(player, s, from);
  if (outcome === "entity" && s.hooked?.isValid) {
    const v = pullToward(s.hooked.location, player.location, R());
    try {
      if (s.hooked.typeId === "minecraft:player") s.hooked.applyKnockback({ x: v.x, z: v.z }, Math.max(0, v.y));
      else s.hooked.applyImpulse(v);
    } catch {
      // can't be moved
    }
  }
  drop(player.id);
  wearRod(player, s.rod.id, wearOf(outcome, R()));
}

function lootTable(path) {
  const m = world.getLootTableManager();
  const ways = { short: path, long: `loot_tables/${path}.json` };
  if (lootPaths) return m.getLootTable(ways[lootPaths]);
  for (const k of ["short", "long"]) {
    let t;
    try {
      t = m.getLootTable(ways[k]);
    } catch {
      t = undefined;
    }
    if (t) {
      lootPaths = k;
      return t;
    }
  }
  return undefined;
}

function landCatch(player, s, from) {
  const d = s.bobber.dimension;
  const rod = held(player);
  const kind = catchKind(levelsOf(rod).luck, rand, R());
  let jungle = false;
  try {
    jungle = /jungle/.test(d.getBiome(from)?.id ?? "");
  } catch {
    // not a jungle
  }
  let items = [];
  try {
    const table = lootTable(lootPath(kind, jungle));
    items = (table && world.getLootTableManager().generateLootFromTable(table, rod)) ?? [];
  } catch (error) {
    reportError("rod catch", error);
  }
  const to = player.location;
  for (const it of items) {
    try {
      const e = d.spawnItem(it, from);
      e.clearVelocity(); // the game gives a dropped item a little hop of its own
      const v = throwToward(from, to, R().toss);
      e.applyImpulse({ x: v.x, y: v.y, z: v.z });
    } catch {
      // a spot it can't be
    }
  }
  let xp = catchXp(rand, R());
  if (level(rod, "mending") > 0 && rod) {
    const dur = rod.getComponent("minecraft:durability");
    if (dur && dur.damage > 0) {
      const m = mend(xp, dur.damage, R().mendPerXp);
      dur.damage -= m.repair;
      xp = m.xp;
      try {
        player.getComponent("minecraft:equippable")?.setEquipment(EquipmentSlot.Mainhand, rod);
      } catch {
        // kept
      }
    }
  }
  try {
    if (xp > 0) player.addExperience(xp);
    player.playSound("random.orb", { volume: 0.1, pitch: 0.5 + rand() });
  } catch {
    // none
  }
}

/** Wear `n` off the rod in the player's hand (each point only sometimes, with Unbreaking); it breaks at the end. */
function wearRod(player, typeId, n) {
  if (!(n > 0) || creative(player)) return;
  const eq = player.getComponent("minecraft:equippable");
  const item = eq?.getEquipment(EquipmentSlot.Mainhand);
  if (!item || item.typeId !== typeId) return;
  const d = item.getComponent("minecraft:durability");
  if (!d) return;
  const cost = paidWear(n, level(item, "unbreaking"), rand);
  if (!cost) return;
  if (d.damage + cost > d.maxDurability) {
    eq.setEquipment(EquipmentSlot.Mainhand, undefined);
    try {
      player.dimension.playSound("random.break", player.location, { volume: 1, pitch: 0.9 });
    } catch {
      // none
    }
    return;
  }
  d.damage += cost;
  eq.setEquipment(EquipmentSlot.Mainhand, item);
}

/** Events: a bobber caught in a block or on a mob; a player leaving; bobbers left from before a reload. */
export function wireRods() {
  world.afterEvents.projectileHitBlock.subscribe((e) => {
    if (e.projectile?.typeId !== BOBBER) return;
    for (const s of fishing.values()) {
      if (s.bobber?.id !== e.projectile.id || s.phase !== "flying") continue;
      if (isWater(blockAt(e.dimension, e.location)?.typeId)) return;
      s.stuck = true;
      s.phase = "stuck";
    }
  });
  world.afterEvents.projectileHitEntity.subscribe((e) => {
    if (e.projectile?.typeId !== BOBBER) return;
    const hit = e.getEntityHit()?.entity;
    for (const s of fishing.values()) {
      if (s.bobber?.id !== e.projectile.id || s.phase !== "flying" || !hit?.isValid || hit.id === s.player.id) continue;
      if (hit.typeId === BOBBER || hit.typeId === "minecraft:item" || hit.typeId === "minecraft:xp_orb") continue;
      s.hooked = hit;
      s.phase = "hooked";
      try {
        s.bobber.triggerEvent("zoocraft:float");
      } catch {
        // it follows anyway
      }
    }
  });
  world.afterEvents.playerLeave.subscribe((e) => drop(e.playerId));
  system.runTimeout(() => {
    for (const id of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
      try {
        for (const b of world.getDimension(id).getEntities({ type: BOBBER })) if (![...fishing.values()].some((s) => s.bobber?.id === b.id)) b.remove();
      } catch {
        // none
      }
    }
  }, 40);
}

/** For the test server: what each player's fishing is doing. */
export function rodDebug() {
  return [...fishing.values()].map((s) => ({
    player: s.player.name,
    rod: s.rod.id,
    phase: s.phase,
    levels: s.levels,
    left: s.left,
    floatY: s.floatY,
    at: s.bobber?.isValid ? s.bobber.location : undefined,
    hooked: s.hooked?.typeId,
    stuck: !!s.stuck,
  }));
}
