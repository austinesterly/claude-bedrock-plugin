import { world, MolangVariableMap } from "@minecraft/server";
import { onlinePlayers, entitiesNear, heldItem, blockReader } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { dayFor } from "../park/park.js";
import { animalFromEntity, saveAnimal } from "./animals.js";
import { getExhibit, validate } from "../exhibits/exhibits.js";
import { yawTo } from "./climbRules.js";
import { gritColour } from "./crabRules.js";
import { ACT, LYING_ACTS, MOLEBEAR_TYPES, WILD_GROUND, BURROW_SOIL, SOIL_GRIT, isDay, pickInterest, canDig, tunnelStart, walkSteps, digsLeft, crawlSteps, laneColumns, laneCentre, bodyIn, facesBeside, lineClear } from "./molebearRules.js";

// Earth Molebears (0.1.138, the cave wing; the rules are in animals/molebearRules.js). Every half second, for the
// molebears near players only. The engine walks them (zoocraft:moving: a stroll, the Insect Ration they're tempted by,
// the way home in a zoo); this picks what each does next and plays it: in a zoo, to a bank of Burrow Soil (the entity's
// zoocraft:seek_soil, a move_to_block) to dig a tunnel into it with the breaststroke of its spade hands, a block deeper at
// a time (0.1.140: twice the size, its tunnels T.tunnelWide blocks wide and T.tunnelHigh high; each slice only where
// molebearRules.js canDig allows: Burrow Soil, inside the exhibit, leaving a dead end), snapping up a grub as each slice
// comes away and crawling in, up to T.tunnelMax blocks deep and T.digsPerDay a park day; then a rest
// curled up in the den at the end, and back out the way it came (a mole's velvet lies either way, so it backs up). To
// its feeder for Insect Rations, snapped up in a blink. Sniffing with its star nose, standing up on its hind legs to sniff
// the air, curled up for a rest by day and through the night. A wild one does the same where it is, and for a rest sinks
// into the cave floor with only its back and star showing (the client's dig_down: the ground isn't touched); someone
// coming close without sneaking and it digs itself in; a little farther and it stands up to sniff at them. What it's
// doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const SEEKS = { dig: "soil", feeder: "feeder" };
const GRIT = "zoocraft:crab_grit";

const state = new Map(); // entity id -> state (see step)

// Every 10 ticks: the molebears near players.
export function tickMolebears(now) {
  const seen = new Set();
  const players = onlinePlayers();
  let day = true;
  try {
    day = isDay(world.getTimeOfDay(), BALANCE.molebear);
  } catch {
    // keep it day
  }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, MOLEBEAR_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        step(e, now, players, day);
      } catch {
        state.delete(e.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
}

// Anywhere from range[0] to range[1] ticks.
/** @param {number[]} range */
function between(range) {
  return range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

// Its body: "move" (the engine walks it) or "still" (it stands or lies put). Each event swaps the other group out.
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks a zoo one toward: "soil", "feeder" or "none" (a wild one has no seeking).
function seek(e, s, what) {
  if (s.seek === what || s.wild) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function sound(e, id, volume, pitch) {
  try {
    e.dimension.playSound(id, e.location, { volume, pitch });
  } catch {
    // Cosmetic only.
  }
}

// A puff of soil the colour of the block (the crab's grit, tinted).
function grit(e, p, typeId) {
  try {
    const c = typeId === BURROW_SOIL ? SOIL_GRIT : gritColour(typeId);
    const vars = new MolangVariableMap();
    vars.setFloat("variable.r", c.r);
    vars.setFloat("variable.g", c.g);
    vars.setFloat("variable.b", c.b);
    e.dimension.spawnParticle(GRIT, p, vars);
  } catch {
    // Cosmetic only.
  }
}

// What a block is (its typeId), for the rules; undefined where it can't be read.
function typeReader(e) {
  const d = e.dimension;
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}

// The exhibit reader's kinds (platform/mc.js blockReader with gecko, thin and leaves, so a slab, stairs, a zoo fixture,
// a fence or leaves is never "solid": only a full block is firm ground round a tunnel).
function kindReader(e) {
  return blockReader(e.dimension, { gecko: true, thin: true, leaves: true });
}

const survival = (p) => {
  const m = String(p.getGameMode()).toLowerCase();
  return m === "survival" || m === "adventure";
};

function holdsBait(p, T) {
  const id = heldItem(p)?.typeId ?? "";
  return T.bait.includes(id) || carrierByItem(id)?.full === false;
}

// Someone close by holding its food or an empty carrier: it lets the engine's tempt bring it over.
function tempted(e, players, T) {
  return players.some((p) => p.dimension.id === e.dimension.id && dist(p.location, e.location) <= T.baitRange && holdsBait(p, T));
}

// The nearest player in its dimension, with the distance: { p, d }, or undefined.
function nearest(e, players) {
  let best;
  for (const p of players) {
    if (p.dimension.id !== e.dimension.id) continue;
    const d = dist(p.location, e.location);
    if (!best || d < best.d) best = { p, d };
  }
  return best;
}

// A feeder in its exhibit with food it eats.
function feederIn(ex) {
  return Boolean(ex && (ex.feederIds ?? []).some((id) => edible(db.get("equipment", id))));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:molebear"].dietTags.includes(RATIONS[rec.item]?.diet));
}

function step(e, now, players, day) {
  const T = BALANCE.molebear;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", wild: e.typeId === "zoocraft:wild_molebear", body: undefined, seek: undefined, interest: "wander", interestUntil: 0, act: ACT.none, actUntil: 0, cool: now + T.coolTicks, alertCool: 0 };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it is never stranded without its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  const a = s.wild ? undefined : animalFromEntity(e);
  const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
  if (s.tunnel) return tunnelling(e, s, now, a, ex, T);
  const near = nearest(e, players);
  const close = near && survival(near.p) && !holdsBait(near.p, T) ? near : undefined; // someone it minds
  const startled = Boolean(s.wild && close && close.d <= T.hideRange && !close.p.isSneaking);
  // A wild one digs itself in from someone coming close in Survival, not sneaking or holding its food (from a rest it
  // sinks straight in), and stays in while they're there; a little farther off, or sneaking up, it stands up to sniff at
  // them. In a zoo someone sprinting close has it stand up to look.
  if (startled && !(s.phase === "act" && s.act === ACT.buried) && now >= s.alertCool) {
    s.alertCool = now + T.alertCool;
    if (s.phase === "act" && s.act !== ACT.rest) finish(e, s, now);
    if ((s.phase === "idle" || s.phase === "act") && bury(e, s, now, T.hideTicks)) return;
  } else if (close && !startled && now >= s.alertCool && (s.wild ? close.d <= T.standRange : close.d <= T.alertRange && close.p.isSprinting) && s.phase !== "up" && !(s.phase === "act" && (LYING_ACTS.includes(s.act) || s.act === ACT.stand))) {
    s.alertCool = now + T.alertCool;
    if (s.phase === "act") finish(e, s, now);
    if (s.phase === "idle") {
      sound(e, "mob.sniffer.long_sniff", 0.4, 1.5);
      return void startAct(e, s, now, ACT.stand, T.standTicks, yawTo(close.p.location.x - e.location.x, close.p.location.z - e.location.z));
    }
  }
  if (s.phase === "act") {
    if (s.act === ACT.buried && startled) {
      s.actUntil = Math.max(s.actUntil, now + 40); // still there: it stays in
      return acting(e, s);
    }
    if (tempted(e, players, T)) return finish(e, s, now); // held food: up and over
    if (now < s.actUntil) return acting(e, s);
    if (LYING_ACTS.includes(s.act) && !day) {
      s.actUntil = now + between(T.restTicks); // it sleeps on through the night
      return;
    }
    return finish(e, s, now);
  }
  if (s.phase === "up") {
    if (now < s.actUntil) return; // getting up (or climbing out): the client's animation
    s.phase = "idle";
    body(e, s, "move");
  }
  if (tempted(e, players, T)) return void seek(e, s, "none");
  if (Math.random() < T.ambientChance) sound(e, a?.juvenile ? "mob.polarbear_baby.idle" : "mob.polarbear.idle", 0.3, a?.juvenile ? 1.3 : 1.05); // a low huff
  if (now >= s.interestUntil) choose(e, s, now, a, ex, day, T);
  if (now < s.cool || !e.isOnGround) return;
  const here = cellOf(e.location);
  if (s.interest === "dig") tryTunnel(e, s, now, here, a, ex, T);
  else if (s.interest === "feeder") tryFeeder(e, s, now, here, ex, T);
  else if (s.interest === "sniff") {
    sound(e, "mob.sniffer.sniffsniff", 0.35, 1.6);
    startAct(e, s, now, ACT.sniff, T.sniffTicks, undefined);
  } else if (s.interest === "stand") {
    sound(e, "mob.sniffer.long_sniff", 0.35, 1.5);
    startAct(e, s, now, ACT.stand, T.standTicks, undefined);
  } else if (s.interest === "rest") {
    const ticks = day ? T.dayRestTicks : T.restTicks;
    // A wild one sinks into the cave floor for its rest; a zoo one (or on other ground) curls up.
    if (!(s.wild && bury(e, s, now, ticks))) startAct(e, s, now, ACT.rest, ticks, undefined);
  }
}

// What it heads for next (molebearRules.js pickInterest), from what its exhibit has (a wild one: no soil or feeder).
function choose(e, s, now, a, ex, day, T) {
  const soil = Boolean(a && !a.juvenile && ex?.molebear?.bank > 0 && ex.bbox && digsLeft(a, dayFor(a), T) > 0); // cubs don't dig
  s.interest = pickInterest({ day, soil, feeder: feederIn(ex) }, T);
  s.interestSince = now;
  s.interestUntil = now + between(T.interestTicks);
  seek(e, s, SEEKS[s.interest] ?? "none");
}

function startAct(e, s, now, act, ticks, yaw) {
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  if (LYING_ACTS.includes(act)) s.lastDown = act;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// Holding its pose, with the sounds of what it's doing.
function acting(e, s) {
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  const r = Math.random();
  if (s.act === ACT.sniff && r < 0.3) sound(e, "mob.sniffer.sniffsniff", 0.3, 1.7);
  else if (s.act === ACT.snap && r < 0.5) sound(e, "mob.armadillo.eat", 0.35, 1.5);
  else if (s.act === ACT.buried && r < 0.08) sound(e, "mob.sniffer.sniffsniff", 0.2, 1.8);
  else if (s.act === ACT.dig && r < 0.5) digPuff(e, s);
}

// Done: on its feet again (after resting or climbing out, still a moment while it gets up), wandering a while before
// the next thing.
function finish(e, s, now) {
  const T = BALANCE.molebear;
  const was = s.act;
  const down = LYING_ACTS.includes(was);
  if (was === ACT.buried) sound(e, "mob.sniffer.digging", 0.4, 1.4);
  s.act = ACT.none;
  setAct(e, ACT.none);
  s.cool = now + T.coolTicks;
  s.interest = "wander";
  s.interestUntil = now + between(T.wanderTicks);
  if (down) {
    s.phase = "up";
    s.actUntil = now + (was === ACT.buried ? T.climbTicks : T.getUpTicks);
  } else {
    s.phase = "idle";
    body(e, s, "move");
  }
}

// A wild one sinks into the natural cave floor under it (only to look at); false on any other ground.
function bury(e, s, now, ticks) {
  const here = cellOf(e.location);
  const under = typeReader(e)(here.x, here.y - 1, here.z);
  if (!under || !WILD_GROUND.has(under)) return false;
  sound(e, "mob.sniffer.digging", 0.45, 1.3);
  grit(e, { x: e.location.x, y: here.y + 0.1, z: e.location.z }, under);
  return startAct(e, s, now, ACT.buried, ticks, undefined);
}

// At a feeder of its exhibit with Insect Rations in it: it snaps them up.
function tryFeeder(e, s, now, here, ex, T) {
  // Its body 1.8 blocks across (0.1.140), a feeder beside it can be two cells from the one it's in.
  for (let dx = -2; dx <= 2; dx++) {
    for (let dz = -2; dz <= 2; dz++) {
      if (!dx && !dz) continue;
      for (const dy of [0, 1]) {
        const rec = db.get("equipment", posKey(e.dimension.id, { x: here.x + dx, y: here.y + dy, z: here.z + dz }));
        if (rec?.type !== "feeder" || !(ex?.feederIds ?? []).includes(rec.id) || !edible(rec)) continue;
        return startAct(e, s, now, ACT.snap, T.feedTicks, yawTo(dx, dz));
      }
    }
  }
  return false;
}

// ---------------- tunnels ----------------

// Beside a bank of Burrow Soil it can dig (molebearRules.js tunnelStart: from where it stands or a cell round it, with
// the floor it stands on open, T.tunnelRoom slices deep, for its body; the face it has least far to go to), with digging
// left today: it shuffles over to the slice and starts a tunnel. Its lane: T.tunnelWide columns toward the side tunnelStart found, T.tunnelHigh rows.
function tryTunnel(e, s, now, here, a, ex, T) {
  if (!a || a.juvenile || !ex?.bbox || digsLeft(a, dayFor(a), T) <= 0) return false;
  const kindAt = kindReader(e);
  const size = { w: T.tunnelWide, h: T.tunnelHigh };
  const open = (x, y, z) => {
    if (kindAt(x, y - 1, z) !== "solid") return false;
    for (let dy = 0; dy < size.h; dy++) if (kindAt(x, y + dy, z) !== "air") return false;
    return true;
  };
  const start = tunnelStart(typeReader(e), kindAt, open, e.location, ex.bbox, size, T.startReach, T.tunnelRoom, T.bodyBack);
  if (!start) return approach(e, s, now, ex, T, size, kindAt, open);
  const c = start.cell;
  const lane = { side: start.dir.side, w: size.w, h: size.h };
  const at = bodyIn(c, lane, start.dir.dx, start.dir.dz, T.bodyBack);
  return startTunnel(e, s, c, start.dir, lane, walkSteps(e.location, c, T.shuffleStep, at));
}

function startTunnel(e, s, c, dir, lane, steps) {
  s.phase = "tunnel";
  s.tunnel = { start: c, from: c, dir, lane, cells: [], stage: "walk", until: 0, steps };
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, ACT.crawl);
  return true;
}

// Not by a face after T.approachTicks of the engine's walk to the soil (with a body this big it stops short, or never
// sets off: the bench, research/cave_plan.md): it creeps over to the nearest face the measure found (ex.molebear.faces)
// that it can still dig, T.approachRange blocks at most, in a straight line over open floor; a look every 2 seconds.
function approach(e, s, now, ex, T, size, kindAt, open) {
  if (now - (s.interestSince ?? now) < T.approachTicks || now < (s.approachAt ?? 0)) return false;
  s.approachAt = now + 40;
  const idAt = typeReader(e);
  const p = e.location;
  const y = Math.floor(p.y + 0.01);
  const near = [];
  for (const f of ex.molebear?.faces ?? []) {
    if (f.y !== y) continue;
    const lane = { side: { x: f.sx, z: f.sz }, w: size.w, h: size.h };
    const at = bodyIn(f, lane, f.dx, f.dz, T.bodyBack);
    const d = Math.hypot(at.x - p.x, at.z - p.z);
    if (d <= T.approachRange) near.push({ f, lane, at, d });
  }
  near.sort((a, b) => a.d - b.d);
  for (const n of near) {
    const { f } = n;
    const still = facesBeside(idAt, kindAt, f, ex.bbox, size, open, T.tunnelRoom).some((g) => g.dx === f.dx && g.dz === f.dz && g.side.x === f.sx && g.side.z === f.sz);
    if (!still || !lineClear(open, p, n.at)) continue;
    return startTunnel(e, s, { x: f.x, y: f.y, z: f.z }, { dx: f.dx, dz: f.dz, side: n.lane.side }, n.lane, walkSteps(p, f, T.approachStep, n.at));
  }
  return false;
}

// The slice in front of the tunnel's end (by its lane's base cell).
function ahead(t) {
  return { x: t.from.x + t.dir.dx, y: t.from.y, z: t.from.z + t.dir.dz };
}

// Where its body stands in a slice of the tunnel (by the slice's base cell).
function bodyAt(t, c) {
  return bodyIn(c, t.lane, t.dir.dx, t.dir.dz, BALANCE.molebear.bodyBack);
}

// Soil flying from the face it's digging, somewhere across it.
function digPuff(e, s) {
  const t = s.tunnel;
  if (!t) return;
  const m = laneCentre(ahead(t), t.lane);
  const across = (Math.random() - 0.5) * (t.lane.w - 0.4);
  grit(e, { x: m.x - t.dir.dx * 0.45 + t.lane.side.x * across, y: m.y + 0.3 + Math.random() * (t.lane.h - 0.6), z: m.z - t.dir.dz * 0.45 + t.lane.side.z * across }, "zoocraft:burrow_soil");
}

// A tunnel, stage by stage: dig the slice ahead (the breaststroke, T.digTicks), snap up the grub it turned up, crawl
// into the hole (a step each half second); on while it may (canDig again, T.tunnelMax, digging left today), then a rest
// curled up in the den, then back out the way it came, and the exhibit is measured again (the soil it dug is gone).
// Moved off its line (pushed, carried, a keeper's teleport) and it leaves off where it is.
function tunnelling(e, s, now, a, ex, T) {
  const t = s.tunnel;
  const yaw = yawTo(t.dir.dx, t.dir.dz);
  const at = bodyAt(t, t.cells.length ? t.cells[t.cells.length - 1] : t.start);
  if (t.stage !== "walk" && t.stage !== "crawl" && t.stage !== "back" && Math.hypot(e.location.x - at.x, e.location.z - at.z) > 1.2) return endTunnel(e, s, now, ex);
  if (t.stage === "walk") {
    // A shuffle to the cell it digs from, then round to face the soil.
    setAct(e, ACT.crawl);
    const p = t.steps.shift();
    if (p) {
      const dx = p.x - e.location.x;
      const dz = p.z - e.location.z;
      e.teleport({ x: p.x, y: e.location.y, z: p.z }, { rotation: { x: 0, y: Math.hypot(dx, dz) > 0.05 ? yawTo(dx, dz) : yaw } });
      return;
    }
    t.stage = "dig";
    t.until = now + T.digTicks;
    setAct(e, ACT.dig);
    sound(e, "mob.sniffer.digging", 0.45, 1.3);
    return;
  }
  if (t.stage === "dig") {
    setAct(e, ACT.dig);
    e.setRotation({ x: 0, y: yaw });
    if (Math.random() < 0.6) digPuff(e, s);
    if (Math.random() < 0.35) sound(e, "dig.gravel", 0.4, 0.9);
    if (now < t.until) return;
    const to = ahead(t);
    if (!a || !ex?.bbox || digsLeft(a, dayFor(a), T) <= 0 || !canDig(typeReader(e), kindReader(e), t.from, to, ex.bbox, t.lane)) return toDen(e, s, now, T);
    // The whole slice comes away: its columns, each T.tunnelHigh blocks up. canDig read every one as Burrow Soil just now.
    const blocks = [];
    for (const c of laneColumns(to, t.lane)) for (let dy = 0; dy < t.lane.h; dy++) blocks.push({ x: c.x, y: c.y + dy, z: c.z });
    try {
      for (const b of blocks) e.dimension.getBlock(b)?.setType("minecraft:air");
    } catch {
      return toDen(e, s, now, T);
    }
    const day = dayFor(a);
    a.dug = { day, n: (a.dug?.day === day ? a.dug.n : 0) + 1 };
    saveAnimal(a);
    for (const b of blocks) for (let i = 0; i < 2; i++) grit(e, { x: b.x + 0.2 + Math.random() * 0.6, y: b.y + 0.2 + Math.random() * 0.6, z: b.z + 0.2 + Math.random() * 0.6 }, "zoocraft:burrow_soil");
    sound(e, "dig.gravel", 0.6, 0.8);
    t.cells.push(to);
    t.stage = "snap";
    t.until = now + T.snapTicks;
    setAct(e, ACT.snap);
    sound(e, "mob.armadillo.eat", 0.4, 1.6); // a grub, gone in a blink
    return;
  }
  if (t.stage === "snap") {
    setAct(e, ACT.snap);
    if (now < t.until) return;
    t.stage = "crawl";
    t.steps = crawlSteps(t.from, t.cells[t.cells.length - 1], T.crawlSteps, offIn(t));
    return;
  }
  if (t.stage === "crawl" || t.stage === "back") {
    setAct(e, ACT.crawl);
    const p = t.steps.shift();
    if (p) {
      e.teleport({ x: p.x, y: e.location.y, z: p.z }, { rotation: { x: 0, y: yaw } });
      return;
    }
    if (t.stage === "back") return endTunnel(e, s, now, ex);
    t.from = t.cells[t.cells.length - 1];
    if (t.cells.length < T.tunnelMax && digsLeft(a, dayFor(a), T) > 0 && canDig(typeReader(e), kindReader(e), t.from, ahead(t), ex?.bbox, t.lane)) {
      t.stage = "dig";
      t.until = now + T.digTicks;
      setAct(e, ACT.dig);
      return;
    }
    return toDen(e, s, now, T);
  }
  if (t.stage === "den") {
    setAct(e, ACT.rest);
    if (now < t.until) return;
    t.stage = "up";
    t.until = now + T.getUpTicks;
    setAct(e, ACT.none);
    return;
  }
  if (t.stage === "up") {
    if (now < t.until) return;
    // Back out, slice by slice, to where it started.
    const path = [...t.cells].reverse().slice(1).concat([t.start]);
    let from = t.cells[t.cells.length - 1];
    t.steps = [];
    for (const c of path) {
      t.steps.push(...crawlSteps(from, c, T.crawlSteps, offIn(t)));
      from = c;
    }
    t.stage = "back";
  }
}

// Where in a slice's base cell its body stands ({ x, z } from the cell's corner): the same in every slice of the lane.
function offIn(t) {
  const p = bodyAt(t, { x: 0, y: 0, z: 0 });
  return { x: p.x, z: p.z };
}

// At the end of its tunnel (or none dug): a rest curled up in the den, then back out.
function toDen(e, s, now, T) {
  const t = s.tunnel;
  if (!t.cells.length) return endTunnel(e, s, now, undefined);
  t.stage = "den";
  t.until = now + between(T.denTicks);
  setAct(e, ACT.rest);
  sound(e, "mob.polarbear.idle", 0.2, 1.5);
}

// Out (or left off): on its feet and walking again; the exhibit measured again when it dug.
function endTunnel(e, s, now, ex) {
  const dug = s.tunnel?.cells.length;
  s.tunnel = undefined;
  s.act = ACT.none;
  setAct(e, ACT.none);
  s.phase = "idle";
  s.cool = now + BALANCE.molebear.coolTicks;
  s.interest = "wander";
  s.interestUntil = now + between(BALANCE.molebear.wanderTicks);
  body(e, s, "move");
  if (dug && ex) validate(ex.id).catch(() => undefined);
}
