import { system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, isNight, message, heldItem, splashVars } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { getPark, parkOfRecord, parkAt } from "../park/park.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { raidBin } from "../visitors/services.js";
import { ACT, RACCOON_TYPES, climbRoute, trunkBeside, waterNear, upLegs, downLegs, escapeLegs, pickInterest, stillOpen, yawTo, centre, clingSpot, hugFor } from "./climbRules.js";

// Raccoons (0.1.71, the Animal wave; spec 5.x "raccoon | Raccoon | Manipulates puzzle feeders |
// Climbing; attracted to unsecured bins"; the rules are in animals/climbRules.js). Every half second,
// for the raccoons near players only: a raccoon goes looking for something to do (the engine walks it
// there: the entity's zoocraft:seek_* events swap in a move_to_block for logs and Climbing Frames,
// water, Puzzle Feeders, or Litter Bins), and when it is beside one it does it.
// It climbs a tree trunk or a Climbing Frame, clinging partway now and then, and looks out from the
// top by day or naps up there at night (under a leafy crown it clings below the leaves instead),
// then comes down head first. It washes at the water's edge, works a stocked Puzzle Feeder holding
// food it eats, and at night, when it's loose (wild, or out of its exhibit), it raids Litter Bins: a
// latched one it gives up on, anything else it knocks over. A zoo raccoon whose exhibit isn't
// climb-proof climbs out along the way out the measure found, now and then when it's near the start.
// Climbing is script-driven: the entity's zoocraft:climb event turns off its gravity and walking, and a
// glide a tick at a time (tickRaccoonMoves) carries it; zoocraft:move gives both back. What it is
// doing goes to the client through its zoocraft:act property for the animations, and the Field
// Journal reads the same.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it leaves them to it

const state = new Map(); // entity id -> { phase, body, seek, interest, interestUntil, actUntil, cool, climb, spot, yaw, act, target, raided }
const moving = new Map(); // entity id -> { e, legs, i, t, from, done, read }
const binWarned = new Map(); // bin record id -> tick of the last "tried the latch" message

// Every 10 ticks: the raccoons near players.
export function tickRaccoons(now) {
  const seen = new Set();
  const players = onlinePlayers();
  const night = isNight();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, RACCOON_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, night);
      } catch {
        state.delete(e.id);
        moving.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
  }
}

// Every tick: glide the climbing raccoons along their legs.
export function tickRaccoonMoves() {
  for (const [id, m] of [...moving]) {
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      const leg = m.legs[m.i];
      if (m.t === 0) {
        // Something built in the way since it set off: it lets go and drops (no fall damage).
        if (!stillOpen(m.read, cellOf(leg.to))) {
          moving.delete(id);
          letGo(e);
          continue;
        }
        setAct(e, leg.act);
      }
      m.t++;
      const f = Math.min(1, m.t / leg.ticks);
      e.teleport({ x: m.from.x + (leg.to.x - m.from.x) * f, y: m.from.y + (leg.to.y - m.from.y) * f, z: m.from.z + (leg.to.z - m.from.z) * f }, { rotation: { x: 0, y: leg.yaw }, keepVelocity: false });
      if (m.t < leg.ticks) continue;
      m.from = leg.to;
      m.i++;
      m.t = 0;
      if (m.i >= m.legs.length) {
        moving.delete(id);
        m.done();
      }
    } catch {
      moving.delete(id);
    }
  }
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

// Anywhere from range[0] to range[1] ticks.
/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

// Its tuning (balance.raccoon), with a youngster hugging nearer the bark (climbRules.js hugFor).
function tuning(a, species) {
  const T = BALANCE.raccoon;
  return a?.juvenile ? { ...T, hug: hugFor(T.hug, species.breeding.juvenileScale) } : T;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its body: "move" (walking, with gravity), "still" (standing put) or "climb" (no gravity, no walking:
// the glide carries it). Each event swaps the other two groups out, and every one holds the walking
// speed and physics the entity's base also has, so nothing is ever left without them (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "climb", "water", "puzzle", "bins" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function run(e, s, phase, legs, done) {
  s.phase = phase;
  moving.set(e.id, { e, legs, i: 0, t: 0, from: { x: e.location.x, y: e.location.y, z: e.location.z }, done, read: blockReader(e.dimension, { leaves: true, climb: true }) });
}

// Back on its feet: gravity and walking again, nothing on.
function settle(e, s) {
  s.phase = "idle";
  s.climb = undefined;
  s.target = undefined;
  s.cool = system.currentTick + BALANCE.raccoon.coolTicks;
  body(e, s, "move");
  setAct(e, ACT.none);
}

function letGo(e) {
  const s = state.get(e.id);
  if (s) settle(e, s);
  else {
    e.triggerEvent("zoocraft:move");
    setAct(e, ACT.none);
  }
}

function step(e, now, players, night) {
  const T = BALANCE.raccoon;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, interest: "idle", interestUntil: 0, actUntil: 0, cool: now + T.coolTicks };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, a climb cut short included (it drops; no fall
    // damage), so it can never be stranded without its gravity or its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  if (moving.has(e.id)) return;
  if (s.phase === "top") return now < s.actUntil ? hold(e, s) : climbDown(e, s);
  if (s.phase === "act") return now < s.actUntil ? acting(e, s, now) : endAct(e, s, now, players);
  if (s.phase !== "idle") settle(e, s); // a glide that stopped without finishing

  const a = animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  const species = SPECIES[a?.speciesId] ?? SPECIES["zoocraft:raccoon"];
  const binsOk = night && (!a || Boolean(a.outside));
  if (now >= s.interestUntil) {
    s.interest = pickInterest({ binsOk, puzzle: puzzleIn(ex, species) });
    s.interestUntil = now + T.interestTicks + Math.floor(Math.random() * T.interestTicks);
  }
  seek(e, s, s.interest === "idle" ? "none" : s.interest);
  if (now < s.cool || !e.isOnGround || tempted(e, players)) return;
  const here = cellOf(e.location);
  const read = blockReader(e.dimension, { leaves: true, climb: true });
  const fit = tuning(a, species);
  if (ex && a && !a.outside && climbOut(e, s, ex, a, here, read, players, fit)) return;
  // What's beside it: what it came for, and anything else now and then.
  for (const k of new Set([s.interest, "climb", "water", "puzzle", "bins"])) {
    if (k === "idle" || (k !== s.interest && Math.random() >= T.otherChance)) continue;
    if (k === "bins" && !binsOk) continue;
    if (TRY[k](e, s, now, here, read, species, night, fit)) return;
  }
}

// Someone close by holding its food or an empty carrier: it lets them tempt or catch it.
function tempted(e, players) {
  const bait = BALANCE.raccoon.bait;
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const id = heldItem(p)?.typeId ?? "";
    if (!(bait.includes(id) || carrierByItem(id)?.full === false)) continue;
    const l = p.location;
    if (Math.hypot(l.x - e.location.x, l.y - e.location.y, l.z - e.location.z) <= TEMPT_RANGE) return true;
  }
  return false;
}

// A stocked Puzzle Feeder holding food this species eats, linked to its exhibit.
function puzzleIn(ex, species) {
  if (!ex) return false;
  return (ex.feederIds ?? []).some((id) => stocked(db.get("equipment", id), species));
}

function stocked(rec, species) {
  return Boolean(rec?.puzzle && rec.units > 0 && species.dietTags.includes(RATIONS[rec.item]?.diet));
}

// An equipment record passing `test` on a block beside `here` (corner to corner too).
function besideRecord(e, here, test) {
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const pos = { x: here.x + dx, y: here.y, z: here.z + dz };
      const rec = db.get("equipment", posKey(e.dimension.id, pos));
      if (rec && test(rec)) return { rec, pos, dir: { x: dx, z: dz } };
    }
  }
  return undefined;
}

const TRY = {
  climb: tryClimb,
  water: tryWash,
  puzzle: tryPuzzle,
  bins: tryBin,
};

// Up a tree trunk or a Climbing Frame beside it (T: its tuning, kept for the way down).
function tryClimb(e, s, now, here, read, species, night, T) {
  const t = trunkBeside(read, here);
  if (!t) return false;
  const route = climbRoute(read, t.from, t.dir, T.maxUp);
  if (!route) return false;
  const legs = [];
  if (t.from !== here) legs.push({ to: centre(t.from), ticks: T.acrossTicks, act: ACT.scramble, yaw: yawTo(t.from.x - here.x, t.from.z - here.z) });
  const pauseAt = route.up.length >= 4 && Math.random() < T.pauseChance ? 1 + Math.floor(Math.random() * (route.up.length - 2)) : -1;
  legs.push(...upLegs(t.from, t.dir, route, T, pauseAt));
  s.climb = { from: t.from, dir: t.dir, route, night, T };
  body(e, s, "climb");
  seek(e, s, "none");
  run(e, s, "up", legs, () => atTop(e, s));
  return true;
}

// At the top: on top of the trunk or frame it looks out by day and naps by night; under a leafy crown
// it clings below the leaves a while.
function atTop(e, s) {
  const { route, dir, night, T } = s.climb;
  const act = route.onTop ? (night ? ACT.sleep : ACT.lookout) : ACT.cling;
  s.phase = "top";
  s.act = act;
  s.actUntil = system.currentTick + between(act === ACT.sleep ? T.sleepTicks : act === ACT.lookout ? T.topTicks : T.clingTicks);
  s.spot = route.onTop ? centre(route.top) : clingSpot(route.up[route.up.length - 1], dir, T.hug);
  s.yaw = route.onTop ? Math.floor(Math.random() * 8) * 45 - 180 : yawTo(dir.x, dir.z);
  setAct(e, act);
  e.teleport(s.spot, { rotation: { x: 0, y: s.yaw }, keepVelocity: false });
}

// Up there it stays put (it has no gravity while it climbs): nudged off its spot, it goes back. Clinging
// it keeps facing the bark and asleep it keeps still (someone tempting it would turn it round);
// looking out from the top it turns as it likes.
function hold(e, s) {
  const p = e.location;
  if (Math.hypot(p.x - s.spot.x, p.y - s.spot.y, p.z - s.spot.z) > 0.3) e.teleport(s.spot, { rotation: { x: 0, y: s.yaw }, keepVelocity: false });
  else if (s.act !== ACT.lookout) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
}

function climbDown(e, s) {
  const { from, dir, route, T } = s.climb;
  run(e, s, "down", downLegs(from, dir, route, T), () => settle(e, s));
}

// Washing its food at the water's edge, or paddling in the shallows.
function tryWash(e, s, now, here, read) {
  const w = waterNear(read, here);
  if (!w) return false;
  return startAct(e, s, now, ACT.wash, BALANCE.raccoon.washTicks, w.dir.x || w.dir.z ? yawTo(w.dir.x, w.dir.z) : undefined, { water: w.at });
}

// Working a Puzzle Feeder: only one with food in it that it eats.
function tryPuzzle(e, s, now, here, read, species) {
  const f = besideRecord(e, here, (r) => r.type === "feeder" && stocked(r, species));
  if (!f) return false;
  return startAct(e, s, now, ACT.puzzle, BALANCE.raccoon.puzzleTicks, yawTo(f.dir.x, f.dir.z), { pos: f.pos });
}

// At a Litter Bin at night: up on its hind legs, paws on the lid.
function tryBin(e, s, now, here) {
  const b = besideRecord(e, here, (r) => r.type === "bin" && !r.tipped);
  if (!b) return false;
  return startAct(e, s, now, ACT.rummage, BALANCE.raccoon.rummageTicks, yawTo(b.dir.x, b.dir.z), { bin: b.pos });
}

function startAct(e, s, now, act, ticks, yaw, target) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  s.target = target;
  s.raided = false;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// While it works: keep facing it, with the splashes and clicks that go with it.
function acting(e, s, now) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const d = e.dimension;
  try {
    if (s.act === ACT.wash) {
      const w = s.target.water;
      d.spawnParticle("minecraft:water_splash_particle", { x: w.x + 0.5, y: w.y + 0.9, z: w.z + 0.5 }, splashVars());
      if (now % 40 < 10) d.playSound("random.splash", e.location, { volume: 0.15, pitch: 1.6 });
    } else if (s.act === ACT.puzzle) {
      if (now % 30 < 10) d.playSound("random.click", e.location, { volume: 0.3, pitch: 1.4 });
    }
  } catch {
    // Cosmetic only.
  }
}

function endAct(e, s, now, players) {
  if (s.act === ACT.rummage && !s.raided) {
    s.raided = true;
    const r = raidBin(e.dimension.id, s.target.bin);
    if (r?.outcome === "tipped") {
      binNews(e, r, players, true);
      try {
        e.dimension.playSound("random.anvil_land", e.location, { volume: 0.25, pitch: 1.7 });
      } catch {
        // Cosmetic only.
      }
      s.actUntil = now + BALANCE.raccoon.scrapsTicks; // a while picking through the spill
      return;
    }
    if (r?.outcome === "latched") binNews(e, r, players, false);
  }
  settle(e, s);
}

// Park members nearby hear about a raid: every bin knocked over, and a raccoon giving up on a latched
// one now and then.
function binNews(e, r, players, tipped) {
  const rec = r.rec;
  const now = system.currentTick;
  if (!tipped) {
    if (now - (binWarned.get(rec.id) ?? -Infinity) < BALANCE.raccoon.warnEvery) return;
    binWarned.set(rec.id, now);
  }
  const park = parkAt(rec.dimension, rec.pos) ?? getPark();
  if (!park) return;
  const at = `${rec.pos.x} ${rec.pos.y} ${rec.pos.z}`;
  const text = tipped
    ? `§eA raccoon knocked over the Litter Bin at ${at}${r.spilled > 0 && !rec.problem ? ` and spilled ${r.spilled} litter onto the paths` : ""}. §7Use the bin to stand it up. A Bin Latch (use one on the bin) keeps raccoons out.`
    : `§7A raccoon tried the latched Litter Bin at ${at} and gave up.`;
  for (const p of players) {
    if (!park.members[p.id] || p.dimension.id !== rec.dimension) continue;
    const l = p.location;
    if (Math.hypot(l.x - rec.pos.x, l.z - rec.pos.z) <= BALANCE.raccoon.newsRange) message(p, text);
  }
}

// A zoo raccoon in an exhibit that isn't climb-proof: near the start of the way out the measure found,
// now and then it takes it, and the park members hear where. T: its tuning.
function climbOut(e, s, ex, a, here, read, players, T) {
  const c = ex.climb;
  if (!c || c.proof !== false || !c.path?.length) return false;
  const path = c.path.map(([x, y, z]) => ({ x, y, z }));
  const start = path[0];
  if (start.y !== here.y || Math.hypot(start.x - here.x, start.z - here.z) > T.escapeReach) return false;
  if (Math.random() >= T.escapeChance) return false;
  const legs = escapeLegs(read, here, path, T);
  if (!legs?.length) return false;
  body(e, s, "climb");
  seek(e, s, "none");
  run(e, s, "escape", legs, () => settle(e, s));
  const park = parkOfRecord(ex) ?? getPark();
  const v = c.via ?? path[path.length - 1];
  const text = `§c${a.name} is climbing out of ${ex.name} near ${v.x} ${v.y} ${v.z}! §7Raccoons climb: glass walls, an overhang along the top of the wall or a roof stop them (the exhibit's clipboard says where). Catch it with an empty Small Carrier: once the exhibit is climb-proof, release it back inside.`;
  for (const p of players) if (park?.members[p.id] && p.dimension.id === e.dimension.id) message(p, text);
  return true;
}
