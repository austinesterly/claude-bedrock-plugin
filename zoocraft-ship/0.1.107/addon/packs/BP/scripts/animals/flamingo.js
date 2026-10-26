import { system } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, isNight, heldItem, splashVars } from "../platform/mc.js";
import { on } from "../core/events.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { carrierByItem } from "../data/items.js";
import { animalFromEntity, allAnimals, animalsIn, getAnimal, liveEntity, saveAnimal } from "./animals.js";
import { getExhibit, isInsideCells, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { nestsIn } from "./nursery.js";
import { flockFeel } from "./breeding.js";
import { ACT, FLAMINGO_TYPES, HEADINGS, shadeOf, pinkAfterDay, nestStage, sitterTurn, pickMood, pickAct, footing, standable, marchPath, walkPath, turnBack, yawTo, flocksOf } from "./flamingoRules.js";

// Flamingos (0.1.72, the Animal wave; spec 5.2 "flamingo | Flamingo | Flock wading | Shallow water and
// mud nesting"; the rules are in animals/flamingoRules.js). Every half second, for the flamingos near
// players: each flock (an exhibit's flamingos, or wild birds close together) has a mood for a while,
// and each bird does what fits it where it stands. Wading, it goes into the water and filter-feeds in
// the shallows, head upside down, or stamps to stir food up; resting, it stands on one leg or preens,
// in the shallows or on the bank; displaying, the flock head-flags and gives wing salutes, and now and
// then marches together one way, turns sharply and marches back. In the water the engine swaps wading
// (walking on the bottom) and swimming (afloat) by depth, through the entity's environment sensor
// (under water: zoocraft:swim; back on its feet: zoocraft:wade), and this loop puts right a bird left
// afloat in the shallows. Wild flocks walk away from anyone who isn't sneaking or holding their food.
// A pair expecting builds a mud nest at the water's edge (the Flamingo Nest block, kept by
// animals/nursery.js from its "nests" records), the parents sit on the egg in turns, and after it
// hatches they feed the chick crop milk, bill to bill. Walks up to the nest or the chick go through the
// exhibit's measured floor and shallows (a glide a tick at a time, tickFlamingoMoves), or the engine
// walks a bird that's further off (zoocraft:seek_nest). Once a park day each grown-up gets pinker or
// paler from what it ate (pinkDay), shown through its zoocraft:pink property. What it is doing goes to
// the client through its zoocraft:act property for the animations, and the Field Journal reads the same.

const RANGE = 48; // blocks from a player
const FLOCK_REACH = 12; // a wild bird this close to one of a flock is in it
const TEMPT_RANGE = 8; // someone this close holding its food or an empty carrier: it leaves them to it
const ACT_PROP = "zoocraft:act";
const PINK_PROP = "zoocraft:pink";
const SWIM_PROP = "zoocraft:swim";
// How long each act lasts: the balance.flamingo field for it.
const ACT_TICKS = { [ACT.feed]: "feedTicks", [ACT.stamp]: "stampTicks", [ACT.preen]: "preenTicks", [ACT.rest]: "restTicks", [ACT.sit]: "restTicks", [ACT.flag]: "flagTicks", [ACT.salute]: "saluteTicks" };

const state = new Map(); // entity id -> { phase, body, seek, act, actUntil, cool, yaw, spot, holdUntil, tending, mound }
const moving = new Map(); // entity id -> { e, legs, i, t, from, read, done }
const moods = new Map(); // flock key -> { mood, until, marchAt }
const lastFed = new Map(); // chick animal id -> tick it was last fed

/** @param {number[]} range anywhere from range[0] to range[1] */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

function centre(c) {
  return { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
}

// Every 10 ticks: the flamingos near players, by flock.
export function tickFlamingos(now) {
  const F = BALANCE.flamingo;
  const players = onlinePlayers();
  const night = isNight();
  const seen = new Set();
  const zoo = new Map(); // exhibit id -> [{ e, a }]
  const wild = []; // [{ e }]
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, FLAMINGO_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.typeId === "zoocraft:wild_flamingo") {
        wild.push({ e, a: undefined });
        continue;
      }
      const a = animalFromEntity(e);
      if (a?.location.kind !== "exhibit") continue;
      const birds = zoo.get(a.location.id) ?? [];
      birds.push({ e, a });
      zoo.set(a.location.id, birds);
    }
  }
  const keys = new Set();
  for (const [exId, birds] of zoo) {
    const ex = getExhibit(exId);
    const species = SPECIES[birds[0].a.speciesId];
    if (!ex || !species?.nest) continue;
    // Keen to display: breeding on with a flock big enough to nest, or a Flock Mirror to show off to.
    const mirrors = fixturesOf(ex).filter((f) => f.type === "mirror").length;
    const grown = animalsIn(ex).filter((a) => a.speciesId === species.id && !a.juvenile).length;
    const keen = mirrors > 0 || (Boolean(ex.breeding?.on) && flockFeel(grown, mirrors, species.nest) >= species.nest.flock);
    const key = `ex:${exId}`;
    keys.add(key);
    stepFlock(key, birds, { ex, species, keen, wild: false, nests: nestsIn(exId) }, now, players, night, F);
  }
  // Wild birds in flocks: birds close together, each flock known by its lowest entity id.
  wild.sort((p, q) => (p.e.id < q.e.id ? -1 : 1));
  const of = flocksOf(wild.map(({ e }) => ({ id: e.id, x: e.location.x, z: e.location.z })), FLOCK_REACH);
  const flocks = new Map();
  wild.forEach((b, i) => flocks.set(of[i], [...(flocks.get(of[i]) ?? []), b]));
  for (const birds of flocks.values()) {
    const key = `wild:${birds[0].e.id}`;
    keys.add(key);
    stepFlock(key, birds, { ex: undefined, species: SPECIES["zoocraft:flamingo"], keen: false, wild: true, nests: [] }, now, players, night, F);
  }
  for (const id of [...state.keys()]) {
    if (seen.has(id)) continue;
    state.delete(id);
    moving.delete(id);
  }
  for (const key of [...moods.keys()]) if (!keys.has(key)) moods.delete(key);
}

// Every tick: glide the birds walking where the script carries them (marching, or up to a nest or a
// chick) along their legs. Something built in the way since it set off: it stops there.
export function tickFlamingoMoves() {
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
        if (!standable(m.read, cellOf(leg.to))) {
          moving.delete(id);
          m.done(false);
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
        m.done(true);
      }
    } catch {
      moving.delete(id);
    }
  }
}

// Once a park day: each grown-up gets pinker or paler from what it ate since the last one
// (flamingoRules.js pinkAfterDay), and the counts start again. Chicks are grey whatever they eat.
function pinkDay({ day }) {
  const F = BALANCE.flamingo;
  for (const a of allAnimals()) {
    if (!SPECIES[a.speciesId]?.pink || a.location.kind !== "exhibit" || (a.pinkDay ?? -1) >= day) continue;
    a.pinkDay = day; // once per park day, even after a reload
    if (!a.juvenile) {
      const r = pinkAfterDay(a.pink, a.ateToday ?? 0, a.pelletsToday ?? 0, F);
      a.pink = r.pink;
      a.pinkFed = r.fed;
    }
    a.ateToday = 0;
    a.pelletsToday = 0;
    saveAnimal(a);
    const e = liveEntity(a.id);
    if (e) showPink(e, a, F);
  }
}

export function initFlamingos() {
  on("parkDay", pinkDay);
}

function setAct(e, act) {
  if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
}

// A zoo bird shows its colour (0 rosy, 1 fading, 2 pale); the client draws a chick grey whatever it is.
function showPink(e, a, F) {
  if (!SPECIES[a.speciesId]?.pink) return;
  const look = a.juvenile ? 0 : shadeOf(a.pink, F);
  if (e.getProperty(PINK_PROP) !== look) e.setProperty(PINK_PROP, look);
}

// Its body: "move" (walking) or "still" (standing put while it does something, or while a glide
// carries it). Each event swaps the other group out, and both hold the walking speed (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "water", "land", "nest" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function settle(e, s, now, F) {
  s.phase = "idle";
  s.mound = undefined; // off the nest it was building on
  s.cool = now + F.coolTicks;
  body(e, s, "move");
  setAct(e, ACT.none);
}

function stepFlock(key, birds, ctx, now, players, night, F) {
  let m = moods.get(key);
  if (!m || now >= m.until) {
    m = { mood: pickMood({ night, keen: ctx.keen, wild: ctx.wild }, F), until: now + between(F.moodTicks), marchAt: now + between(F.marchEvery) };
    moods.set(key, m);
  }
  if (m.mood === "display" && now >= m.marchAt) {
    m.marchAt = now + between(F.marchEvery);
    march(birds, ctx, players, F);
  }
  if (ctx.ex) feedChicks(birds, ctx, now, F);
  for (const b of birds) {
    try {
      stepBird(b.e, b.a, m.mood, ctx, now, players, F);
    } catch {
      state.delete(b.e.id);
      moving.delete(b.e.id);
    }
  }
}

function stepBird(e, a, mood, ctx, now, players, F) {
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", body: undefined, seek: undefined, act: ACT.none, actUntil: 0, cool: now + F.coolTicks, tending: false };
    state.set(e.id, s);
    // Met (again): on its feet, nothing on, so it can never be left standing still.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  if (a) showPink(e, a, F);
  if (moving.has(e.id)) return;
  if (s.phase === "march" || s.phase === "step") return settle(e, s, now, F); // its glide was cut short
  const read = blockReader(e.dimension);
  let where = footing(read, cellOf(e.location));
  if (a?.juvenile && where === "shallows") where = "swim"; // a chick is out of its depth even there
  water(e, where);
  if (s.phase === "hold") {
    if (now < s.holdUntil && holdStill(e, s, a, ctx)) return;
    return settle(e, s, now, F);
  }
  const shy = ctx.wild && spooked(e, players, F);
  const lured = tempted(e, players, F);
  if (s.phase === "act") {
    if (now < s.actUntil && where !== "swim" && !shy && !lured) return acting(e, s, now);
    settle(e, s, now, F);
  }
  if (lured || shy) return seek(e, s, "none"); // the engine's tempt, or walking away (wild flocks)
  if (a && ctx.ex && nestDuty(e, s, a, ctx, now, read, F)) return;
  seek(e, s, mood === "wade" && where === "land" ? "water" : mood === "rest" && where === "swim" ? "land" : "none");
  if (now < s.cool) return;
  const act = pickAct(mood, where, Boolean(a?.juvenile));
  if (act === undefined) return;
  startAct(e, s, now, act, F[ACT_TICKS[act]]);
}

// The engine swaps wading and swimming by itself (the entity's environment sensor); this puts right a
// bird it left afloat in the shallows or on the bank, or wading where it's out of its depth.
function water(e, where) {
  const swimming = e.getProperty(SWIM_PROP) === true;
  if (swimming && where !== "swim") e.triggerEvent("zoocraft:wade");
  else if (!swimming && where === "swim" && e.isInWater) e.triggerEvent("zoocraft:swim");
}

// Someone close by holding its food or an empty carrier: it lets them tempt or catch it.
function tempted(e, players, F) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const id = heldItem(p)?.typeId ?? "";
    if (!(F.bait.includes(id) || carrierByItem(id)?.full === false)) continue;
    const l = p.location;
    if (Math.hypot(l.x - e.location.x, l.y - e.location.y, l.z - e.location.z) <= TEMPT_RANGE) return true;
  }
  return false;
}

// Wild flamingos keep away from people (the entity's avoid_mob_type, out to the same range): anyone
// this close who isn't sneaking. Holding their food draws them in instead (tempted, above).
function spooked(e, players, F) {
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id || p.isSneaking) continue;
    const l = p.location;
    if (Math.hypot(l.x - e.location.x, l.y - e.location.y, l.z - e.location.z) <= F.shyRange) return true;
  }
  return false;
}

function startAct(e, s, now, act, ticks, yaw = undefined) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
}

// While it works: keep facing what it's at, with the splashes that go with stamping and feeding.
function acting(e, s, now) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  try {
    const l = e.location;
    if (s.act === ACT.stamp && now % 20 < 10) {
      e.dimension.spawnParticle("minecraft:water_splash_particle", { x: l.x, y: l.y + 0.8, z: l.z }, splashVars());
      e.dimension.playSound("random.splash", l, { volume: 0.1, pitch: 1.8 });
    } else if (s.act === ACT.feed && now % 40 < 10) {
      const yaw = (e.getRotation().y * Math.PI) / 180;
      e.dimension.spawnParticle("minecraft:water_splash_particle", { x: l.x - Math.sin(yaw) * 0.6, y: l.y + 0.85, z: l.z + Math.cos(yaw) * 0.6 }, splashVars());
    }
  } catch {
    // Cosmetic only.
  }
}

function glide(e, legs, read, done) {
  moving.set(e.id, { e, legs, i: 0, t: 0, from: { x: e.location.x, y: e.location.y, z: e.location.z }, read, done });
}

// Walk through the blocks `cells` (a walkPath) at a walk, then `done(ok)`.
function walk(e, s, cells, read, done, F) {
  s.phase = "step";
  body(e, s, "still");
  seek(e, s, "none");
  let from = e.location;
  const legs = cells.map((c) => {
    const to = centre(c);
    const leg = { to, ticks: F.walkTicks, act: ACT.walk, yaw: yawTo(to.x - from.x, to.z - from.z) };
    from = to;
    return leg;
  });
  glide(e, legs, read, done);
}

// ---------------- the display march ----------------
// The flock walks together one way, turns sharply and marches back: every grown-up on its feet that's
// idle or head-flagging or saluting gets the same heading, through open floor and the shallows (inside
// its exhibit).
function march(birds, ctx, players, F) {
  const h = Math.floor(Math.random() * 8);
  const back = turnBack(h);
  const out = between(F.marchSteps);
  for (const { e, a } of birds) {
    const s = state.get(e.id);
    if (!s || a?.juvenile || moving.has(e.id) || !(s.phase === "idle" || (s.phase === "act" && (s.act === ACT.flag || s.act === ACT.salute)))) continue;
    if (e.getProperty(SWIM_PROP) === true || (ctx.wild && spooked(e, players, F))) continue;
    const read = blockReader(e.dimension);
    const inside = ctx.ex ? (c) => isInsideCells(ctx.ex.id, c, ["land", "water"]) : undefined;
    const start = cellOf(e.location);
    const there = marchPath(read, start, HEADINGS[h], out, inside);
    const home = marchPath(read, there[there.length - 1] ?? start, HEADINGS[back], there.length, inside);
    const steps = [...there.map((c) => ({ c, d: HEADINGS[h] })), ...home.map((c) => ({ c, d: HEADINGS[back] }))];
    if (steps.length < 2) continue;
    s.phase = "march";
    body(e, s, "still");
    seek(e, s, "none");
    const legs = steps.map(({ c, d }) => ({ to: centre(c), ticks: Math.round(F.marchTicks * (d.x && d.z ? 1.41 : 1)), act: ACT.march, yaw: yawTo(d.x, d.z) }));
    glide(e, legs, read, () => settle(e, s, system.currentTick, F));
  }
}

// ---------------- nests ----------------
// The nest a bird tends: the mother's while she's expecting, and her mate's.
function nestOf(a, nests) {
  return nests.find((n) => !n.youngId && (n.motherId === a.id || getAnimal(n.motherId)?.expecting?.fatherId === a.id));
}

// Parents with a nest building or holding the egg. The first park day both build it up, now and then
// going over to scrape mud onto the mound; once the egg is in it they sit on it in turns (the one off
// duty goes about with the flock; with its mate not here, it sits every turn). A hatched nest needs
// nobody: they feed the chick instead (feedChicks).
function nestDuty(e, s, a, ctx, now, read, F) {
  const nest = nestOf(a, ctx.nests);
  const mother = nest && getAnimal(nest.motherId);
  const stage = nest ? nestStage(nest, mother, undefined, ctx.species.breeding.gestationDays) : undefined;
  if (stage !== 0 && stage !== 1) {
    s.tending = false;
    if (s.seek === "nest") seek(e, s, "none");
    return false;
  }
  const isMother = a.id === nest.motherId;
  if (stage === 1) {
    const mate = isMother ? mother?.expecting?.fatherId : nest.motherId;
    if (sitterTurn(now, 0, F.sitTicks) !== (isMother ? "mother" : "father") && mate && liveEntity(mate)) {
      s.tending = false;
      if (s.seek === "nest") seek(e, s, "none");
      return false;
    }
  } else if (!s.tending) {
    if (now < s.cool || Math.random() >= F.tendChance) return false;
    s.tending = true;
  }
  const spot = { x: nest.pos.x, y: nest.pos.y, z: nest.pos.z };
  const cells = cellsOf(ctx.ex.id);
  const path = cells ? walkPath(cells, read, cellOf(e.location), spot, F.walkSteps) : undefined;
  if (!path) {
    seek(e, s, "nest"); // further off: the engine walks it over to the nest
    return true;
  }
  seek(e, s, "none");
  const c = centre(spot);
  if (stage === 0) {
    // Flamingos build standing on the mound: up onto it, then reaching down over its edge to scrape mud
    // up with the bill and draw it in under their feet, a different side each time. With its mate up
    // there already, it works from beside the mound, facing it.
    const mateId = isMother ? mother?.expecting?.fatherId : nest.motherId;
    const mateE = mateId ? liveEntity(mateId) : undefined;
    const top = !(mateE && state.get(mateE.id)?.mound === nest.motherId);
    if (top) s.mound = nest.motherId;
    const build = (ok) => {
      s.tending = false;
      if (!ok) return settle(e, s, system.currentTick, F);
      if (!top) return startAct(e, s, system.currentTick, ACT.build, F.buildTicks, yawTo(c.x - e.location.x, c.z - e.location.z));
      const yaw = Math.floor(Math.random() * 8) * 45 - 180;
      e.teleport(c, { rotation: { x: 0, y: yaw }, keepVelocity: false });
      startAct(e, s, system.currentTick, ACT.build, F.buildTicks, yaw);
    };
    const steps = top ? path : path.slice(0, -1);
    if (steps.length) walk(e, s, steps, read, build, F);
    else build(true);
    return true;
  }
  // Onto the nest, and sitting on the egg until the turn changes.
  const sit = (ok) => {
    if (!ok) return settle(e, s, system.currentTick, F);
    s.phase = "hold";
    s.spot = c;
    s.yaw = Math.floor(Math.random() * 8) * 45 - 180;
    s.holdUntil = (Math.floor(system.currentTick / F.sitTicks) + 1) * F.sitTicks;
    body(e, s, "still");
    setAct(e, ACT.sit);
    e.teleport(c, { rotation: { x: 0, y: s.yaw }, keepVelocity: false });
  };
  if (path.length) walk(e, s, path, read, sit, F);
  else sit(true);
  return true;
}

// On the nest it stays put (nudged off, it goes back), until its turn is over or the egg has hatched.
function holdStill(e, s, a, ctx) {
  const nest = a && nestOf(a, ctx.nests);
  if (!nest || nestStage(nest, getAnimal(nest.motherId), undefined, ctx.species.breeding.gestationDays) !== 1) return false;
  const p = e.location;
  if (Math.hypot(p.x - s.spot.x, p.y - s.spot.y, p.z - s.spot.z) > 0.3) e.teleport(s.spot, { rotation: { x: 0, y: s.yaw }, keepVelocity: false });
  else e.setRotation({ x: 0, y: s.yaw });
  setAct(e, ACT.sit);
  return true;
}

// ---------------- crop milk ----------------
// Every so often a chick is fed by a parent near it: the parent walks up beside it and bends down to
// feed it bill to bill, and the chick stands still and begs, head up.
function feedChicks(birds, ctx, now, F) {
  const cells = cellsOf(ctx.ex.id);
  if (!cells) return;
  for (const chick of birds) {
    if (!chick.a.juvenile || now - (lastFed.get(chick.a.id) ?? -Infinity) < F.cropEvery) continue;
    const cs = state.get(chick.e.id);
    if (!cs || cs.phase !== "idle" || moving.has(chick.e.id) || chick.e.getProperty(SWIM_PROP) === true) continue;
    const cl = chick.e.location;
    const near = (b) => Math.hypot(b.e.location.x - cl.x, b.e.location.z - cl.z);
    const parent = birds
      .filter((b) => (chick.a.parents ?? []).includes(b.a.id) && state.get(b.e.id)?.phase === "idle" && !moving.has(b.e.id) && b.e.getProperty(SWIM_PROP) !== true && near(b) <= F.cropReach)
      .sort((p, q) => near(p) - near(q))[0];
    if (!parent) continue;
    const read = blockReader(chick.e.dimension);
    const at = cellOf(cl);
    const from = cellOf(parent.e.location);
    // The block beside the chick nearest the parent that the parent can walk to.
    const sides = [
      { x: 1, z: 0 },
      { x: -1, z: 0 },
      { x: 0, z: 1 },
      { x: 0, z: -1 },
    ].sort((p, q) => Math.hypot(at.x + p.x - from.x, at.z + p.z - from.z) - Math.hypot(at.x + q.x - from.x, at.z + q.z - from.z));
    let path;
    let spot;
    for (const side of sides) {
      for (const dy of [0, 1, -1]) {
        const c = { x: at.x + side.x, y: at.y + dy, z: at.z + side.z };
        if (!standable(read, c)) continue;
        path = walkPath(cells, read, from, c, F.walkSteps);
        if (path) {
          spot = c;
          break;
        }
      }
      if (path) break;
    }
    if (!path) continue;
    lastFed.set(chick.a.id, now);
    const meet = centre(spot);
    const ps = state.get(parent.e.id);
    startAct(chick.e, cs, now, ACT.crop, path.length * F.walkTicks + F.cropTicks, yawTo(meet.x - cl.x, meet.z - cl.z));
    const feed = (ok) => {
      if (!ok) return settle(parent.e, ps, system.currentTick, F);
      startAct(parent.e, ps, system.currentTick, ACT.crop, Math.max(20, cs.actUntil - system.currentTick), yawTo(cl.x - meet.x, cl.z - meet.z));
    };
    if (path.length) walk(parent.e, ps, path, read, feed, F);
    else feed(true);
  }
}
