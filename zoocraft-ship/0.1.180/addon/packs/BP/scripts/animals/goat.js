import { system } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { blockReader } from "../platform/mc.js";
import { allAnimals, liveEntity } from "./animals.js";
import { getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { leapWay, yawTo } from "./hopperRules.js";
import { ACT, BODY, nextMove, pickLedge, offSpots, dropSide, buttPairs } from "./goatRules.js";

// Goats in the world (0.1.180; rules in goatRules.js, research/vanilla_plan.md "0.1.180 goats: the design"). The game
// walks them. Every half second, for each loaded goat in an exhibit measured for goats and enclosed for them (ex.goat):
// now and then a grown one leaps onto a rock ledge within its reach (the highest it can reach, most often), stands there
// a while looking out over the drop, and leaps on to another or back down to the floor; two grown ones near each other
// now and then butt heads in play (they face each other and bow, the game's ram animation, then the clash, the game's
// ram sound, and both are knocked back a little). Kids do neither. The leaps are the End Hopper's arcs (hopperRules.js
// leapWay, checked clear for the goat's body): a push a tick along the arc (tickGoatMoves), carried by teleport if the
// game doesn't move it by the push. What it's doing goes to the client through zoocraft:act. The game's own leap
// (minecraft:behavior.jump_to_block) is not on the zoo goat: on the test server it took the game's goats out of pens
// walled up to 8 blocks high.

const PROP = "zoocraft:act";

const state = new Map(); // animal id -> { e, act, until, body, to, partner }
const moving = new Map(); // animal id -> { e, pts, i, to, yaw, delay, last, want, slow, done }
const carried = new Set(); // goats the game didn't move by the push: carried by teleport from then on

const key = (c) => `${c.x},${c.y},${c.z}`;
const cellOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) });

// Every 10 ticks: the goats in exhibits, near enough to be loaded.
export function tickGoats() {
  const now = system.currentTick;
  const T = BALANCE.goat;
  const live = new Set();
  const byEx = new Map(); // exhibit id -> [{ a, e, s }]
  for (const a of allAnimals()) {
    if (!SPECIES[a.speciesId]?.rockLedges || a.location.kind !== "exhibit" || a.outside) continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    live.add(a.id);
    let s = state.get(a.id);
    if (!s) {
      // Met (again): on its own life, on its feet.
      s = { e, act: ACT.life, until: 0 };
      state.set(a.id, s);
      setAct(e, ACT.life);
      body(e, s, "settle");
    }
    s.e = e;
    const list = byEx.get(a.location.id) ?? [];
    list.push({ a, e, s });
    byEx.set(a.location.id, list);
  }
  for (const [exId, goats] of byEx) {
    const ex = getExhibit(exId);
    if (!ex) continue;
    try {
      herd(ex, goats, now, T);
    } catch {
      // a goat gone mid-way: met again next time
    }
  }
  for (const id of [...state.keys()]) if (!live.has(id)) forget(id);
}

function herd(ex, goats, now, T) {
  const G = ex.goat;
  // Leaps only in an exhibit measured for goats and enclosed for them, onto the ledges that measure found inside.
  const ok = Boolean(G?.enclosed && G.spots?.length);
  const spots = ok ? G.spots : [];
  const ledgeKeys = new Set(spots.map(([x, y, z]) => `${x},${y},${z}`));
  // Where each goat stands, or is leaping to: no other leaps there.
  const held = new Set();
  for (const g of goats) held.add(g.s.to ?? key(cellOf(g.e.location)));
  const free = []; // grown ones on their own life on the ground: the head-butts are between them
  for (const g of goats) {
    const { a, e, s } = g;
    if (moving.has(a.id)) continue;
    if (s.act !== ACT.life && now >= s.until) {
      if (s.act === ACT.butt && s.partner) clash(g, goats.find((o) => o.a.id === s.partner), T);
      s.act = ACT.life;
      setAct(e, ACT.life);
      body(e, s, "settle");
    }
    if (s.act !== ACT.life) continue;
    let inWater;
    let onGround;
    try {
      inWater = e.isInWater;
      onGround = e.isOnGround;
    } catch {
      continue;
    }
    const grown = !a.juvenile;
    const here = cellOf(e.location);
    const onLedge = ledgeKeys.has(key(here));
    const move = onGround ? nextMove({ act: s.act, grown, onLedge, ledges: ok, inWater }, T, Math.random(), Math.random()) : undefined;
    if (move === "leap") {
      const read = leapReader(e);
      const tried = new Set(held);
      for (let i = 0; i < 3; i++) {
        const spot = pickLedge(spots, here, tried, T);
        if (!spot) break;
        const to = { x: spot[0], y: spot[1], z: spot[2] };
        if (leap(g, to, read, held, ledgeKeys, now, T)) break;
        tried.add(key(to));
      }
    } else if (move === "off") {
      const cells = cellsOf(ex.id);
      if (cells) {
        const read = leapReader(e);
        for (const to of offSpots(cells, here, ledgeKeys, held, T).slice(0, 6)) if (leap(g, to, read, held, ledgeKeys, now, T)) break;
      }
    }
    if (!moving.has(a.id) && grown && onGround && !inWater && !onLedge) free.push({ id: a.id, x: e.location.x, y: e.location.y, z: e.location.z, g });
  }
  for (const [p, q] of buttPairs(free, T)) if (Math.random() < T.buttChance) butt(p.g, q.g, now, T);
}

// A leap to the cell `to` (where its feet land): the arc clear for its body, ground under all of it. A short pause
// facing the way (crouchTicks), then off. True when it goes.
function leap(g, to, read, held, ledgeKeys, now, T) {
  const { e, s } = g;
  const from = { x: e.location.x, y: e.location.y, z: e.location.z };
  const dest = { x: to.x + 0.5, y: to.y, z: to.z + 0.5 };
  const pts = leapWay(from, dest, read, T, BODY);
  if (!pts) return false;
  const yaw = yawTo(dest.x - from.x, dest.z - from.z);
  s.to = key(to);
  held.add(s.to);
  s.act = ACT.leap;
  setAct(e, ACT.leap);
  body(e, s, "still");
  e.setRotation({ x: 0, y: yaw });
  moving.set(g.a.id, { e, pts, i: 0, to: dest, yaw, delay: T.crouchTicks, slow: 0, done: () => landed(g, ledgeKeys, T) });
  return true;
}

// Down: on a ledge it stands looking out over the drop a while; on the floor it goes about its business.
function landed(g, ledgeKeys, T) {
  const { e, s } = g;
  s.to = undefined;
  sound(e, "land.stone", 0.5, 1.1);
  const here = cellOf(e.location);
  if (!ledgeKeys.has(key(here))) {
    s.act = ACT.life;
    setAct(e, ACT.life);
    body(e, s, "settle");
    return;
  }
  s.act = ACT.perch;
  s.until = system.currentTick + between(T.perchTicks);
  setAct(e, ACT.perch);
  const read = blockReader(e.dimension);
  const side = dropSide(here, (x, y, z) => read(x, y, z) === "air");
  if (side) e.setRotation({ x: 0, y: yawTo(side.dx, side.dz) });
}

// Two grown ones butt heads: they face each other and bow (the client's ram animation while zoocraft:act is 3).
function butt(p, q, now, T) {
  for (const [g, o] of [
    [p, q],
    [q, p],
  ]) {
    g.s.act = ACT.butt;
    g.s.until = now + T.buttTicks;
    g.s.partner = o.a.id;
    setAct(g.e, ACT.butt);
    body(g.e, g.s, "still");
    g.e.setRotation({ x: 0, y: yawTo(o.e.location.x - g.e.location.x, o.e.location.z - g.e.location.z) });
  }
  sound(p.e, p.a.coat === 1 ? "mob.goat.prepare_ram.screamer" : "mob.goat.prepare_ram", 0.6, 1);
}

// The clash: the game's ram sound, and both knocked back a little, away from each other.
function clash(g, o, T) {
  g.s.partner = undefined;
  if (!o) return;
  o.s.partner = undefined;
  sound(g.e, g.a.coat === 1 || o.a.coat === 1 ? "mob.goat.ram_impact.screamer" : "mob.goat.ram_impact", 0.7, 1);
  try {
    const dx = g.e.location.x - o.e.location.x;
    const dz = g.e.location.z - o.e.location.z;
    const d = Math.hypot(dx, dz) || 1;
    for (const [who, sign] of [
      [g, 1],
      [o, -1],
    ]) {
      // Back on its feet first, so the game moves it by the knock.
      who.s.act = ACT.life;
      setAct(who.e, ACT.life);
      body(who.e, who.s, "settle");
      who.e.applyImpulse({ x: ((sign * dx) / d) * T.buttPush, y: 0.1, z: ((sign * dz) / d) * T.buttPush });
    }
  } catch {
    // gone
  }
}

function forget(id) {
  const s = state.get(id);
  state.delete(id);
  const mv = moving.get(id);
  moving.delete(id);
  carried.delete(id);
  const e = s?.e;
  if (!e) return;
  try {
    if (!e.isValid) return;
    // Mid-leap: it lands where it was going at once (never left in the air).
    if (mv) e.teleport(mv.to, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
    setAct(e, ACT.life);
    body(e, s, "settle");
  } catch {
    // gone
  }
}

// Every tick: fly the leaping goats along their arcs.
export function tickGoatMoves() {
  const T = BALANCE.goat;
  for (const [id, mv] of [...moving]) {
    const e = mv.e;
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
      // The pause facing the way before it goes.
      if (mv.delay > 0) {
        mv.delay--;
        e.clearVelocity();
        continue;
      }
      const at = e.location;
      // Told to move last tick and moved less than movedShare of it, slowTicks ticks running: the game isn't moving it
      // by the push, so it's carried from now on (the End Hopper's rule).
      if (mv.last && mv.want >= T.minWant) {
        const got = Math.hypot(at.x - mv.last.x, at.y - mv.last.y, at.z - mv.last.z);
        mv.slow = got < mv.want * T.movedShare ? mv.slow + 1 : 0;
        if (mv.slow >= T.slowTicks) carried.add(id);
      }
      if (mv.i >= mv.pts.length) {
        // Pushed to the last point a tick ago: it settles exactly where it was going.
        moving.delete(id);
        e.teleport(mv.to, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        e.clearVelocity();
        mv.done();
        continue;
      }
      const p = mv.pts[mv.i++];
      const v = { x: p.x - at.x, y: p.y - at.y, z: p.z - at.z };
      mv.last = { x: at.x, y: at.y, z: at.z };
      mv.want = Math.hypot(v.x, v.y, v.z);
      e.setRotation({ x: 0, y: mv.yaw });
      if (carried.has(id)) {
        e.teleport(p, { rotation: { x: 0, y: mv.yaw }, keepVelocity: false });
        continue;
      }
      e.clearVelocity();
      e.applyImpulse(v);
    } catch {
      moving.delete(id);
    }
  }
  if (carried.size > 500) carried.clear();
}

// Goats in a leap now, and those being carried (for /zoocraft:status and the test server).
export function goatMoves() {
  return { leaping: moving.size, carried: carried.size };
}

// Its body: "still" (a leap, on a ledge, butting heads: the script moves it, or it stands) or "settle" (its own life,
// the game walking it). Each event swaps the other group out (zoo_goat.json zoocraft:still, zoocraft:settle).
function body(e, s, how) {
  if (s.body === how) return;
  try {
    e.triggerEvent(`zoocraft:${how}`);
    s.body = how;
  } catch {
    // gone
  }
}

function setAct(e, act) {
  try {
    if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
  } catch {
    // gone
  }
}

// What a leap reads (platform/mc.js blockReader with gecko: true, so it never lands on a slab, stairs or anything else
// that doesn't fill its space), each block once.
function leapReader(e) {
  const base = blockReader(e.dimension, { gecko: true });
  const seen = new Map();
  return (x, y, z) => {
    const k = `${x},${y},${z}`;
    let c = seen.get(k);
    if (c === undefined) seen.set(k, (c = base(x, y, z)));
    return c;
  };
}

/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}
