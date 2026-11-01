// Polar bears in the game (0.1.174, module 12: research/vanilla_plan.md "0.1.174 polar bears: the design"; the rules are
// animals/polarRules.js). The zoo polar bear is the game's own bear as a zoo copy, kept like the big cats: most of the
// time the game walks and swims it (the zoocraft:free group's stroll and look goals). When animals/predators.js gives
// it something to do (go to a Holding Den, warn a player inside its exhibit, charge, back off), this holds it
// (zoocraft:hold takes the goals away) and steps it there itself a tick at a time over its exhibit's floor and through
// its pool, with its act for the client: up on its hind legs facing them for the warning, the run, the strike (up and
// down onto them: predators.js lands the blow). When there's nothing more to do it is let go (zoocraft:free).
// A wild one is the game's own polar bear, left as it is, except that a Fish Ration or raw cod or salmon thrown down
// near a grown one draws it over to eat (predators.js: calm, it can be crated while it eats); hurt, it stops.
import { system, world } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { fixturesOf } from "../equipment/fixtures.js";
import { findWay, smoothWay, wayLength, pointAlong, yawTo, turnToward } from "./zebraRules.js";
import { intentOf, clearIntent, arrivedAtDen, ateBait, baitUnreachable, hurtWild, isDenned } from "./predators.js";
import { ACT, PACE, STRIKE_TICKS, LOOK, ZOO_INTENTS, actFor, swimY, backGoal, walkerFor } from "./polarRules.js";
import { reportError } from "../core/log.js";

export const ZOO_BEAR = "zoocraft:zoo_polar_bear";
export const WILD_BEAR = "minecraft:polar_bear";
const RANGE = 48; // blocks from a player: polar bears this close are stepped
const ACT_PROP = "zoocraft:act";
const WAY_STEPS = 48; // the longest walk it takes (blocks), in its exhibit or out to a thrown fish
const WILD_NODES = 900; // blocks looked at to find a wild one's way (the open world: no measured floor to keep to)

const held = new Map(); // zoo entity id -> { e, struck, backed, strikeUntil }
const moving = new Map(); // entity id -> a glide
const reported = new Set(); // errors already in the content log (one line each)

const keyOf = (c) => `${c.x},${c.y},${c.z}`;
function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.5), z: Math.floor(p.z) };
}
function dist(p, q) {
  return Math.hypot(p.x - q.x, p.z - q.z);
}

const FLOORLESS = new Set(["air", "water", "lava", "barrier", "gate_open", "unloaded"]);
// Standing: open at its feet and head, on a floor (a grown polar bear stands 1.4 blocks).
function standable(read, c) {
  return read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && !FLOORLESS.has(read(c.x, c.y - 1, c.z));
}
// The water's surface block: water, open over it.
function surface(read, c) {
  return read(c.x, c.y, c.z) === "water" && read(c.x, c.y + 1, c.z) === "air";
}
// Deep enough to swim (2 deep).
function deepAt(read, c) {
  return surface(read, c) && read(c.x, c.y - 1, c.z) === "water";
}
function headroom(read, c) {
  return read(c.x, c.y + 2, c.z) === "air" || read(c.x, c.y + 1, c.z) === "water";
}
function openAt(read) {
  return (c) => (read(c.x, c.y, c.z) === "air" || read(c.x, c.y, c.z) === "water") && read(c.x, c.y + 1, c.z) === "air";
}
function memoRead(dimension) {
  const read = blockReader(dimension);
  const memo = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let v = memo.get(k);
    if (v === undefined) {
      v = read(x, y, z);
      memo.set(k, v);
    }
    return v;
  };
}

function setAct(e, act) {
  try {
    if (e.getProperty(ACT_PROP) !== act) e.setProperty(ACT_PROP, act);
  } catch {
    // gone
  }
}

function hold(e) {
  let h = held.get(e.id);
  if (!h) {
    h = { e, struck: undefined, backed: undefined, strikeUntil: 0, striking: false, lookUntil: 0 };
    held.set(e.id, h);
    try {
      e.triggerEvent("zoocraft:hold");
    } catch {
      // gone
    }
  }
  return h;
}

function free(id) {
  const h = held.get(id);
  held.delete(id);
  moving.delete(id);
  if (!h) return;
  try {
    if (h.e.isValid) {
      h.e.triggerEvent("zoocraft:free"); // its own stroll and look back
      setAct(h.e, ACT.life);
    }
  } catch {
    // gone
  }
}

// Where a zoo one may go (its measured floor and pool), or a wild one (open ground and water).
function zooWalker(e, a, read) {
  const ex = getExhibit(a.location.id);
  const all = ex ? [...ex.feederIds.map((id) => db.get("equipment", id)).filter(Boolean), ...fixturesOf(ex)] : [];
  const onTop = new Set(all.map((f) => keyOf({ x: f.pos.x, y: f.pos.y + 1, z: f.pos.z })));
  return walkerFor(cellsOf(a.location.id), onTop, (c) => standable(read, c) || surface(read, c));
}
function wildWalker(read) {
  return (c) => standable(read, c) || surface(read, c);
}

// Every 10 ticks: each polar bear near a player, zoo or wild, by what predators.js asks of it.
export function tickPolarBears(now) {
  const players = onlinePlayers();
  const seen = new Set();
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, [ZOO_BEAR, WILD_BEAR]);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        if (e.typeId === WILD_BEAR) wildStep(e, now);
        else zooStep(e, players, now);
      } catch (error) {
        moving.delete(e.id);
        const why = String(error);
        if (!reported.has(why)) {
          reported.add(why);
          reportError("polarbear", error);
        }
      }
    }
  }
  // Out of everyone's range: let go, back to its own life.
  for (const id of [...held.keys()]) if (!seen.has(id)) free(id);
  for (const id of [...moving.keys()]) if (!seen.has(id)) moving.delete(id);
}

function zooStep(e, players, now) {
  const a = animalFromEntity(e);
  const it = intentOf(e.id);
  if (!a || a.location.kind !== "exhibit" || !it || !ZOO_INTENTS.includes(it.kind)) {
    if (lookAbout(e, a, now)) return;
    if (held.has(e.id)) free(e.id);
    return;
  }
  const look = held.get(e.id);
  if (look) look.lookUntil = 0; // what predators.js asks comes first
  const h = hold(e);
  const read = memoRead(e.dimension);
  const can = zooWalker(e, a, read);
  if (it.kind === "den") {
    // Called into a Holding Den: a walk to the door, and in (predators.js shuts it in: zoocraft:den_in).
    if (moving.get(e.id)?.why === "den") return;
    const to = { x: it.to.x + 0.5, y: it.to.y, z: it.to.z + 0.5 };
    if (dist(e.location, to) < 0.9) return inDen(e);
    const ok = walkTo(e, can, read, it.to, { act: ACT.walk, pace: PACE.walk, to, why: "den", young: a.juvenile }, (done) => {
      if (done) inDen(e);
    });
    if (!ok) clearIntent(e.id, "den"); // no way to it: the call lapses (the keeper can call again)
    return;
  }
  const p = players.find((q) => q.id === it.playerId);
  if (!p) {
    moving.delete(e.id);
    setAct(e, ACT.life);
    return;
  }
  const yaw = yawTo(p.location.x - e.location.x, p.location.z - e.location.z);
  const face = () => {
    try {
      e.setRotation({ x: 0, y: turnToward(e.getRotation().y, yaw, 30) });
    } catch {
      // gone
    }
  };
  // back: the swipe that landed (predators.js lands the blow 11 ticks after it decided, this step 2 ticks after that):
  // up on its hind legs and down onto them, coming down as the blow lands.
  if (it.kind === "back" && it.swiped && h.struck !== it.since) {
    h.struck = it.since;
    moving.delete(e.id);
    h.strikeUntil = now + STRIKE_TICKS;
    h.striking = true;
    setAct(e, ACT.strike);
    face();
    return;
  }
  if (now < h.strikeUntil) {
    face(); // the strike plays out first
    return;
  }
  if (it.kind === "warn") {
    // Up on its hind legs, facing them, and the warning (predators.js plays it).
    moving.delete(e.id);
    setAct(e, actFor("warn"));
    face();
    return;
  }
  if (it.kind === "charge") {
    const D = BALANCE.predators.danger;
    if (dist(e.location, p.location) <= D.reach) {
      // Within reach: it rears up over them (predators.js decides the swipe on its next step; the strike is above).
      moving.delete(e.id);
      setAct(e, ACT.stand);
      face();
      return;
    }
    chase(e, can, read, p, a.juvenile);
    return;
  }
  // back: after the strike, a walk away and it stands watching them.
  if (moving.has(e.id)) return;
  if (h.backed === it.since) {
    setAct(e, ACT.life);
    face();
    return;
  }
  h.backed = it.since;
  const goal = backGoal(e.location, p.location, [6, 4, 3], can);
  if (!goal || !walkTo(e, can, read, goal, { act: ACT.walk, pace: PACE.walk, face: yaw, young: a.juvenile }, () => setAct(e, ACT.life))) setAct(e, ACT.life);
}

// Its own life: now and then a grown one stands up to look about (held still, up on its hind legs), then back to it.
function lookAbout(e, a, now) {
  const h = held.get(e.id);
  if (h?.lookUntil) {
    if (now < h.lookUntil) return true;
    h.lookUntil = 0;
    return false; // free() lets it go
  }
  if (!a || a.location.kind !== "exhibit" || a.juvenile || h || moving.has(e.id) || isDenned(a.id)) return false;
  if (Math.random() >= LOOK.chance) return false;
  try {
    if (e.isInWater) return false; // not while it swims
  } catch {
    return false;
  }
  const lh = hold(e);
  lh.lookUntil = now + LOOK.ticks;
  setAct(e, ACT.stand);
  return true;
}

function inDen(e) {
  moving.delete(e.id);
  if (arrivedAtDen(e)) {
    held.delete(e.id); // shut in, its group is zoocraft:denned (let out: zoocraft:den_out gives it its own life back)
    setAct(e, ACT.life);
  } else free(e.id); // the den was taken meanwhile: its own life again
}

// A run at them: a way to where they stand (each half second a fresh one when they've moved), stopping within reach.
function chase(e, can, read, p, young) {
  const g = moving.get(e.id);
  const target = cellOf(p.location);
  if (g?.why === "chase" && Math.hypot(g.aim.x - p.location.x, g.aim.z - p.location.z) < 0.6 && g.s < g.end) return;
  let goal = target;
  if (!can(goal)) goal = [1, -1].map((dy) => ({ ...target, y: target.y + dy })).find(can) ?? target;
  const way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(read, c), cellOf(e.location), goal, 24, 1200);
  if (!way || !way.length) return;
  glide(e, way, { act: ACT.run, pace: PACE.run, why: "chase", to: { x: p.location.x, y: goal.y, z: p.location.z }, stopShort: BALANCE.predators.danger.reach * 0.8, young }, () => {});
  const ng = moving.get(e.id);
  if (ng) ng.aim = { x: p.location.x, z: p.location.z };
}

// ---------------- the wild: a thrown fish ----------------
function wildStep(e, now) {
  const it = intentOf(e.id);
  if (it?.kind === "eat") {
    moving.delete(e.id); // eating where it stands: the game's own bear goes on from there
    return;
  }
  if (it?.kind !== "bait") {
    if (moving.get(e.id)?.why === "bait") moving.delete(e.id);
    return;
  }
  if (moving.get(e.id)?.why === "bait") return;
  let item;
  try {
    item = world.getEntity(it.itemId);
  } catch {
    item = undefined;
  }
  if (!item?.isValid) {
    baitUnreachable(e.id); // gone (picked up, or despawned)
    return;
  }
  const eat = () => {
    if (ateBait(e, system.currentTick)) {
      try {
        e.dimension.playSound("random.eat", e.location, { volume: 0.8, pitch: 0.7 });
      } catch {
        // cosmetic
      }
    }
  };
  if (dist(e.location, item.location) < 1.6) return eat();
  const read = memoRead(e.dimension);
  const to = cellOf(item.location);
  const failed = () => {
    const tries = (wildTries.get(e.id) ?? 0) + 1;
    wildTries.set(e.id, tries);
    if (tries >= 3) {
      wildTries.delete(e.id);
      baitUnreachable(e.id); // no way to it: it leaves that one be
    }
  };
  // It stops with its nose over the fish (a grown bear's head is about a block ahead of its feet).
  const ok = walkTo(e, wildWalker(read), read, to, { act: ACT.walk, pace: PACE.walk, why: "bait", stopShort: 1, wild: true }, (done) => (done ? eat() : failed()));
  if (!ok) {
    wildTries.delete(e.id);
    baitUnreachable(e.id);
  }
}
const wildTries = new Map(); // wild entity id -> walks to the fish cut short

// ---------------- gliding ----------------
// Every tick: each steered bear a step along its way: walking on the floor, swimming low through deep water.
export function tickPolarBearMoves() {
  // The strike's end, to the tick: down again (the client's stand eases down over 6 ticks, so the blow 11 ticks after
  // the swipe began lands as the paws come down).
  const now = system.currentTick;
  for (const h of held.values()) {
    if (!h.striking || now < h.strikeUntil) continue;
    h.striking = false;
    setAct(h.e, ACT.life);
  }
  for (const [id, m] of [...moving]) {
    if (moving.get(id) !== m) continue;
    const e = m.e;
    let valid = false;
    try {
      valid = e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      held.delete(id);
      continue;
    }
    try {
      if (m.s < m.end) {
        let p = pointAlong(m.pts, m.s);
        let c = cellOf(p);
        const deep = deepAt(m.read, c) || deepAt(m.read, { ...c, y: c.y - 1 });
        const s = Math.min(m.end, m.s + (deep ? Math.min(m.pace, PACE.swim) : m.pace));
        p = pointAlong(m.pts, s);
        c = cellOf(p);
        const dc = deepAt(m.read, c) ? c : deepAt(m.read, { ...c, y: c.y - 1 }) ? { ...c, y: c.y - 1 } : undefined;
        if (dc) p = { ...p, y: swimY(dc.y, m.young) };
        else if (m.read(c.x, c.y, c.z) !== "air" && m.read(c.x, c.y, c.z) !== "water" && standable(m.read, { x: c.x, y: c.y + 1, z: c.z })) {
          // Never into a block: stepping up it gets up onto the block it's over.
          p = { ...p, y: c.y + 1 };
          c = { x: c.x, y: c.y + 1, z: c.z };
        }
        const k = keyOf(c);
        if (k !== m.cell) {
          const ok = (q) => standable(m.read, q) || surface(m.read, q);
          if (!dc && !ok(c) && !ok({ x: c.x, y: c.y - 1, z: c.z })) {
            finish(id, m, false);
            continue;
          }
          m.cell = k;
        }
        m.s = s;
        if (p.dx || p.dz) m.yaw = turnToward(m.yaw, yawTo(p.dx, p.dz), m.turn);
        if (!m.wild) setAct(e, m.act);
        e.teleport({ x: p.x, y: p.y, z: p.z }, { rotation: { x: 0, y: m.yaw }, keepVelocity: false });
        continue;
      }
      if (m.face !== undefined && Math.abs(((((m.face - m.yaw) % 360) + 540) % 360) - 180) > 2) {
        m.yaw = turnToward(m.yaw, m.face, 12);
        e.setRotation({ x: 0, y: m.yaw });
        continue;
      }
      finish(id, m, true);
    } catch {
      moving.delete(id);
    }
  }
}

function finish(id, m, ok) {
  moving.delete(id);
  m.done(ok);
}

/**
 * Glide a bear through the blocks `cells` from where it stands, then `done(ok)`. opts: act, pace (blocks a tick), to
 * (an exact end point), face (a yaw to turn to there), stopShort (blocks short of the end), why, young, wild.
 */
function glide(e, cells, opts, done) {
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const read = blockReader(e.dimension);
  const pts = smoothWay(from, cells, openAt(read));
  if (opts.to) {
    const to = { x: opts.to.x, y: pts[pts.length - 1].y, z: opts.to.z };
    if (pts.length === 1) pts.push(to);
    else pts[pts.length - 1] = to;
  }
  moving.set(e.id, {
    e,
    pts,
    s: 0,
    end: Math.max(0, wayLength(pts) - (opts.stopShort ?? 0)),
    pace: opts.pace ?? PACE.walk,
    act: opts.act ?? ACT.walk,
    turn: opts.pace >= PACE.run ? 20 : 12,
    yaw: e.getRotation().y,
    face: opts.face,
    why: opts.why,
    young: Boolean(opts.young),
    wild: Boolean(opts.wild),
    read,
    cell: keyOf(cellOf(from)),
    done,
  });
}

function walkTo(e, can, read, to, opts, then) {
  const goal = { x: to.x, y: to.y, z: to.z };
  const way = findWay((c) => can(c) || keyOf(c) === keyOf(goal), (c) => headroom(read, c), cellOf(e.location), goal, WAY_STEPS, opts.wild ? WILD_NODES : Infinity);
  if (!way) return false;
  if (!way.length && !opts.to && opts.face === undefined) {
    then(true);
    return true;
  }
  glide(e, way, opts, then);
  return true;
}

// What a zoo polar bear is doing, for the Field Journal and tests (its zoocraft:act).
export function polarBearAct(entity) {
  try {
    return entity.getProperty(ACT_PROP) ?? 0;
  } catch {
    return 0;
  }
}

// A wild one hurt by a player stops going to (or eating) a thrown fish.
export function initPolarBears() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        if (ev.damageSource?.damagingEntity?.typeId !== "minecraft:player") return;
        moving.delete(ev.hurtEntity.id);
        hurtWild(ev.hurtEntity.id);
      } catch {
        // gone
      }
    },
    { entityTypes: [WILD_BEAR] },
  );
}
