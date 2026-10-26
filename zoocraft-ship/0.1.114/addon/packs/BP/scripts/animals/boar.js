import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem, message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { getPark, parkOfRecord } from "../park/park.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit, blockChanged } from "../exhibits/exhibits.js";
import { rubYaw } from "./grazerRules.js";
import { ACT, BOAR_TYPES, LEAD_TAG, moodAt, pickInterest, wallowStep, leadOf, mothersOf, herdsOf, defenceStep, guardPlaces, backTo, walkOffTo, chargeDamage, rushTo, stepsAlong, yawTo, rootable, wallowable, rubbable } from "./boarRules.js";

// Cinder Boars (0.1.87, the Nether trio; spec 5.3 "Ash-colored rooting animal | Digs and uses cooling mud pockets |
// Ash, thermal mud, strong barrier"; the rules are in animals/boarRules.js). Every half second, for the boars near
// players. A sounder is a zoo exhibit's boars, or wild sows and young within balance.boar.sounderRange of each other (a
// wild grown boar lives alone, untagged). Its lead
// (the oldest grown sow, else the oldest boar) carries the tag zoocraft:sounder_lead and the others follow it (the
// entity's zoocraft:following group, a follow_mob goal: zoocraft:follow / zoocraft:lead); piglets follow their mother
// (follow_parent). The day sets the mood (boarRules.js moodAt): morning and from the afternoon into the night they
// forage (rooting in Warm Ash, snout down, at the feeder, now and then a wander); in the heat of the day each goes to
// the mud and wallows, rolling on its side, comes out wearing the mud coat (zoocraft:muddy), rubs it off against a
// rock or a wall at its flank, then lies down with the others; late at night they sleep together. The coat dries and
// flakes off by itself after balance.boar.muddyTicks.
// The sow's defence: a player in Survival or Adventure near her piglets (inside the exhibit, for a zoo sounder) and
// their mother steps between them and the piglets, bristles up, huffing, and the piglets bunch behind her; closer, and
// she charges and stops short; closer still, or at someone who hurt one of a wild sounder, she charges for real (a
// hit and a knockback; nothing in Peaceful) and backs off to her piglets. A wild boar or a sow without piglets trots
// off from someone; hurt one and it charges them for real. Someone holding its food or an empty carrier isn't a threat.
// Getting out: in an exhibit whose boar measure (exhibits/geometry.js floodBoar) found wood leading out, a grown one
// near the start of the way out now and then takes it: it butts the wooden block and, with the mobGriefing game rule
// on, breaks it (it drops as an item, like a door a zombie breaks) and trots out; park members hear where.
// Walking is the engine's; the steps between, the charges, walking off and going out are the script's, a teleport a
// tick (tickBoarMoves). What it's doing goes to the client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const MUDDY = "zoocraft:muddy";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it leaves them to it
const RUB_REACH = 6; // how far it looks for a rock or a wall to rub its mud off on
const RUB_LOOK = 40; // and how often, while it finds none

const state = new Map(); // entity id -> { body, seek, role, phase, act, actUntil, yaw, restMood, interest, interestUntil, cool, restWait, wallowed, muddyUntil, mudBy, rubBy, rubLook, shyUntil, chargedAt }
const moving = new Map(); // entity id -> { e, pts, i, face, act, done, each }
const sounders = new Map(); // sounder key -> { guard: { calmAt, sowId, playerId } | undefined, chargeCool }
const grudges = new Map(); // player id -> { until, ids: Map of the boar ids they hurt -> the tick they last hurt it }
const toldAt = new Map(); // `${player id}|${kind}` -> tick

// Every 10 ticks: the sounders near players.
export function tickBoars(now) {
  const T = BALANCE.boar;
  const players = onlinePlayers();
  let mood = "forage";
  try {
    mood = moodAt(world.getTimeOfDay(), T);
  } catch {
    // keep foraging
  }
  const seen = new Map(); // id -> { e, a }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, BOAR_TYPES);
    } catch {
      continue;
    }
    for (const e of list) {
      if (seen.has(e.id)) continue;
      try {
        seen.set(e.id, { e, a: animalFromEntity(e) });
      } catch {
        // gone
      }
    }
  }
  const groups = new Map(); // sounder key -> members
  const wild = [];
  for (const b of seen.values()) {
    if (b.a?.location.kind === "exhibit") {
      const k = `ex:${b.a.location.id}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(b);
    } else if (b.a) groups.set(`solo:${b.e.id}`, [b]);
    else wild.push(b);
  }
  const byDim = new Map();
  for (const b of wild) {
    const d = b.e.dimension.id;
    if (!byDim.has(d)) byDim.set(d, []);
    byDim.get(d).push(b);
  }
  for (const list of byDim.values()) {
    // A grown boar lives alone outside the mating season (nether_facts.md): each its own; the sows and young within
    // sounderRange of one another are one sounder.
    const herd = [];
    for (const b of list) {
      if (!isBaby(b.e) && markOf(b.e) === 1) groups.set(`wild:${b.e.id}`, [b]);
      else herd.push(b);
    }
    const at = new Map(herd.map((b) => [b.e.id, b]));
    for (const ids of herdsOf(herd.map((b) => ({ id: b.e.id, x: b.e.location.x, z: b.e.location.z })), T.sounderRange)) {
      const k = `wild:${[...ids].sort()[0]}`;
      groups.set(k, ids.map((id) => at.get(id)));
    }
  }
  for (const [k, list] of groups) {
    try {
      sounderStep(k, list, now, players, mood, T);
    } catch {
      for (const b of list) forget(b.e.id);
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
  for (const k of [...sounders.keys()]) if (!groups.has(k)) sounders.delete(k);
  for (const [id, g] of [...grudges]) if (now > g.until) grudges.delete(id);
}

function forget(id) {
  const s = state.get(id);
  state.delete(id);
  moving.delete(id);
  // No one near any more: back on its feet with its own walking, so it isn't left rooting or lying where it was for
  // as long as no one comes (met again, it carries on from there).
  const e = s?.e;
  if (!e) return;
  try {
    if (!e.isValid) return;
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  } catch {
    // gone
  }
}

// Every tick: glide the boars stepping between, charging, walking off or going out along their steps.
export function tickBoarMoves() {
  for (const [id, m] of [...moving]) {
    let valid = false;
    try {
      valid = m.e.isValid;
    } catch {
      // gone
    }
    if (!valid) {
      moving.delete(id);
      continue;
    }
    try {
      const p = m.pts[m.i++];
      m.e.teleport({ x: p.x, y: p.y ?? m.e.location.y, z: p.z }, { rotation: { x: 0, y: p.yaw ?? m.face }, keepVelocity: false });
      setAct(m.e, m.act);
      m.each?.(m.i);
      if (m.i < m.pts.length) continue;
      moving.delete(id);
      m.done();
    } catch {
      moving.delete(id);
    }
  }
}

// ---------------- the sounder ----------------
function member(b, now, T) {
  const { e, a } = b;
  let s = state.get(e.id);
  if (!s) {
    s = { e, phase: "idle", interest: "root", interestUntil: 0, actUntil: 0, cool: now + T.coolTicks, wallowed: false, muddyUntil: 0, shyUntil: 0, chargedAt: -1 };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it's never stuck still without its walking; still muddy, the
    // coat dries in its time from now.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
    if (isMuddy(e)) s.muddyUntil = now + T.muddyTicks;
  }
  s.e = e;
  const adult = a ? !a.juvenile : !isBaby(e);
  const male = a ? a.sex === "male" : markOf(e) === 1;
  // Older is larger: born on an earlier park day; one caught grown (no birth day) counts as the oldest.
  const age = a ? (a.bornDay === undefined ? 1e9 : -a.bornDay) : adult ? 0 : -1;
  return { id: e.id, e, a, s, adult, male, age, motherId: a?.parents?.[0], x: e.location.x, z: e.location.z };
}

function markOf(e) {
  try {
    return e.getComponent("minecraft:mark_variant")?.value ?? 0;
  } catch {
    return 0;
  }
}

function isBaby(e) {
  try {
    return Boolean(e.getComponent("minecraft:is_baby"));
  } catch {
    return false;
  }
}

function sounderStep(k, list, now, players, mood, T) {
  const members = list.map((b) => member(b, now, T)).sort((p, q) => (p.id < q.id ? -1 : 1));
  const ex = members[0].a?.location.kind === "exhibit" ? getExhibit(members[0].a.location.id) : undefined;
  let h = sounders.get(k);
  if (!h) {
    h = { guard: undefined, chargeCool: 0 };
    sounders.set(k, h);
  }
  // Zoo animals' records: a zoo animal is matched to its record by its own id (a.id); a wild one has none.
  for (const m of members) if (m.a && m.motherId) m.motherId = members.find((o) => o.a?.id === m.motherId)?.id;
  // The lead: the tag on it, the others following it. One on its own (a lone boar) has neither, so no sounder near
  // it takes it for their lead.
  const leadId = leadOf(members);
  for (const m of members) role(m, members.length === 1 ? "alone" : m.id === leadId ? "lead" : "follow");
  const lead = members.find((m) => m.id === leadId);
  // The mud coat dries.
  for (const m of members) if (isMuddy(m.e) && now >= m.s.muddyUntil && m.s.phase !== "act") setMuddy(m.e, false);
  const piglets = members.filter((m) => !m.adult);
  const mothers = mothersOf(members);
  const zoo = k.startsWith("ex:");
  const threat = threatTo(members, piglets, ex, players, k, h, T);
  // The sow guarding her piglets and the piglets behind her are busy with that; the rest of the sounder carries on.
  let busy = new Set();
  if (threat && mothers.size) busy = defend(h, members, piglets, mothers, threat, zoo, now, T);
  else if (h.guard) {
    const guarding = members.filter((m) => m.s.phase === "guard" || m.s.phase === "charge");
    if (now < h.guard.calmAt || guarding.some((m) => moving.has(m.id))) busy = new Set(guarding.map((m) => m.id));
    else {
      h.guard = undefined;
      for (const m of guarding) settle(m, now, T);
    }
  }
  // A wild sounder without piglets, or a lone boar: it charges someone who hurt it, else trots off from someone near.
  if (k.startsWith("wild:") && !piglets.length) for (const m of members) shy(h, m, members, players, now, T);
  for (const m of members) {
    if (busy.has(m.id)) continue;
    try {
      step(m, members, lead, ex, now, players, mood, T);
    } catch {
      forget(m.id);
    }
    if (Math.random() < T.gruntChance) sound(m.e, "mob.pig.say", 0.6, !m.adult ? 1.4 : m.male ? 0.55 : 0.7);
  }
}

// "lead" (tagged, no follow goal), "follow" (the follow goal on, no tag) or "alone" (neither).
function role(m, want) {
  const { e, s } = m;
  if (want === "lead" ? !e.hasTag(LEAD_TAG) : e.hasTag(LEAD_TAG)) {
    if (want === "lead") e.addTag(LEAD_TAG);
    else e.removeTag(LEAD_TAG);
  }
  if (s.role === want) return;
  e.triggerEvent(want === "follow" ? "zoocraft:follow" : "zoocraft:lead");
  s.role = want;
}

const survival = (p) => {
  try {
    const m = String(p.getGameMode()).toLowerCase();
    return m === "survival" || m === "adventure";
  } catch {
    return false;
  }
};

function peaceful() {
  try {
    return String(world.getDifficulty()).toLowerCase() === "peaceful";
  } catch {
    return false;
  }
}

// Someone holding its food or an empty carrier: they're tempting or catching it, not a threat.
function tempting(p) {
  const id = heldItem(p)?.typeId ?? "";
  return BALANCE.boar.bait.includes(id) || carrierByItem(id)?.full === false;
}

// Inside the exhibit's box (with a little headroom), for a zoo sounder.
function insideBox(ex, l) {
  const b = ex?.bbox;
  if (!b) return false;
  return l.x >= b.min.x && l.x < b.max.x + 1 && l.z >= b.min.z && l.z < b.max.z + 1 && l.y >= b.min.y - 1 && l.y < b.max.y + 4;
}

// Has this player hurt one of the sounder (a wild one)?
function hurtOne(p, members) {
  const g = grudges.get(p.id);
  return Boolean(g && members.some((m) => g.ids.has(m.id)));
}

// The player a sow guards her piglets against, if any: the nearest one in Survival or Adventure within alertRange of
// a piglet (inside the exhibit and within alertRangeZoo, for a zoo sounder), not tempting it; or, for a wild one,
// someone who hurt one of it, within grudgeRange. Once she's guarding against someone she keeps on while they stay
// within the range and the step her piglets took back (guardGap + huddle) more, so it doesn't flicker on and off.
function threatTo(members, piglets, ex, players, k, h, T) {
  if (!piglets.length) return undefined;
  const zoo = k.startsWith("ex:");
  const wild = k.startsWith("wild:");
  const d0 = members[0].e.dimension.id;
  let best;
  let bestD = Infinity;
  for (const p of players) {
    try {
      if (p.dimension.id !== d0 || !survival(p)) continue;
      const l = p.location;
      const d = Math.min(...piglets.map((m) => Math.hypot(m.x - l.x, m.z - l.z)));
      const keep = h.guard?.playerId === p.id ? T.guardGap + T.huddle : 0;
      let near;
      if (wild && hurtOne(p, members)) near = d <= T.grudgeRange;
      else if (tempting(p)) near = false;
      else if (zoo) near = insideBox(ex, l) && d <= T.alertRangeZoo + keep;
      else near = d <= T.alertRange + keep;
      if (near && d < bestD) {
        bestD = d;
        best = p;
      }
    } catch {
      // gone
    }
  }
  return best;
}

// ---------------- the sow's defence ----------------
// The mother of the piglet nearest the threat stands between them; her other piglets bunch behind her; then the
// bluff or the real charge (boarRules.js defenceStep), at most one charge every chargeCool. Returns the ids of the
// sow and her piglets, busy with it.
function defend(h, members, piglets, mothers, p, zoo, now, T) {
  const at = { x: p.location.x, z: p.location.z };
  const near = piglets.filter((q) => mothers.has(q.id)).sort((a, b) => Math.hypot(a.x - at.x, a.z - at.z) - Math.hypot(b.x - at.x, b.z - at.z))[0];
  const sow = members.find((m) => m.id === h.guard?.sowId) ?? members.find((m) => m.id === mothers.get(near?.id));
  if (!sow) return new Set();
  // Her piglets as they were when she stood up: a wild piglet's mother is the nearest sow (mothersOf), and standing in
  // front of them she may not be the nearest any more.
  const kept = h.guard ? piglets.filter((q) => h.guard.broodIds.includes(q.id)) : [];
  const brood = kept.length ? kept : piglets.filter((q) => mothers.get(q.id) === sow.id);
  const busy = new Set([sow.id, ...brood.map((q) => q.id)]);
  if (!brood.length) return busy;
  const range = zoo ? T.alertRangeZoo : T.alertRange;
  const dPiglet = Math.min(...brood.map((q) => Math.hypot(q.x - at.x, q.z - at.z)));
  const dSow = Math.hypot(sow.x - at.x, sow.z - at.z);
  const stage = defenceStep({ dPiglet, dSow, hurt: !zoo && hurtOne(p, members) }, range, T);
  if (!h.guard) {
    h.guard = { calmAt: 0, sowId: sow.id, playerId: p.id, placeAt: now + T.coolTicks, broodIds: brood.map((q) => q.id) };
    guard(sow, brood, at, T);
    tell(p, "alert", T);
  }
  h.guard.calmAt = now + T.calmTicks;
  h.guard.playerId = p.id;
  if (moving.has(sow.id) || sow.s.phase === "charge") return busy;
  if ((stage === "bluff" || stage === "real") && now >= h.chargeCool) {
    h.chargeCool = now + T.chargeCool;
    charge(sow, p, stage === "real" && !peaceful(), () => {
      // Back to her piglets, facing the threat again.
      try {
        if (!p.isValid) return settle(sow, system.currentTick, T);
      } catch {
        return settle(sow, system.currentTick, T);
      }
      const back = backTo(brood.map((q) => ({ id: q.id, x: q.e.location.x, z: q.e.location.z })), { x: p.location.x, z: p.location.z }, T);
      trotTo(sow, back, ACT.trot, () => {
        sow.s.phase = "guard";
        standAlert(sow, back.yaw);
      }, T);
    }, T);
    return busy;
  }
  // Come round her piglets to a side she isn't on (nearer them than she is): she goes back between, at most each
  // coolTicks.
  if (sow.s.phase === "guard" && dSow > dPiglet && now >= h.guard.placeAt) {
    h.guard.placeAt = now + T.coolTicks;
    guard(sow, brood, at, T);
    return busy;
  }
  // Standing her ground: facing them, bristles up, huffing now and then.
  if (sow.s.phase === "guard") {
    standAlert(sow, yawTo(at.x - sow.x, at.z - sow.z));
    if (Math.random() < 0.15) sound(sow.e, "mob.hoglin.ambient", 0.7, 0.8);
  }
  return busy;
}

// Into place: the sow trots between the threat and her piglets and turns to face it, alert; the piglets bunch behind
// her. Someone with no level way there turns where it stands.
function guard(sow, brood, at, T) {
  const places = guardPlaces(brood.map((q) => ({ id: q.id, x: q.x, z: q.z })), at, T);
  sound(sow.e, "mob.hoglin.ambient", 1, 0.75);
  sow.s.phase = "guard";
  sow.s.restMood = undefined;
  seek(sow.e, sow.s, "none");
  body(sow.e, sow.s, "still");
  trotTo(sow, places.sow, ACT.trot, () => standAlert(sow, places.sow.yaw), T);
  for (const q of brood) {
    const spot = places.piglets.get(q.id);
    q.s.phase = "guard";
    seek(q.e, q.s, "none");
    body(q.e, q.s, "still");
    trotTo(q, spot, ACT.trot, () => {
      setAct(q.e, ACT.none);
      try {
        q.e.setRotation({ x: 0, y: spot.yaw });
      } catch {
        // gone
      }
    }, T);
  }
}

function standAlert(m, yaw) {
  try {
    m.e.setRotation({ x: 0, y: yaw });
    setAct(m.e, ACT.alert);
  } catch {
    // gone
  }
}

// The charge: head down at them, stopping short (a bluff: bluffShort off, never nearer than realShort + 0.4) or
// right up to them (a real one: the hit and the knockback, if they're within reach), then `after`. With no level way
// at them it stamps where it stands (alert, a second).
function charge(m, p, isReal, after, T) {
  const { e, s } = m;
  const from = { x: e.location.x, z: e.location.z };
  const at = { x: p.location.x, z: p.location.z };
  const d = Math.hypot(at.x - from.x, at.z - from.z);
  const to = rushTo(from, at, isReal ? T.realShort : Math.min(T.bluffShort, Math.max(d - 1, T.realShort + 0.4)));
  const way = to.length >= 0.5 ? routeTo(m, from, to, T.chargePace) : { pts: [], whole: false };
  let pts = way.pts;
  let act = ACT.charge;
  if (!way.whole) {
    pts = Array.from({ length: 20 }, () => from);
    act = ACT.alert;
  }
  s.phase = "charge";
  body(e, s, "still");
  seek(e, s, "none");
  sound(e, "mob.hoglin.angry", 1, m.male ? 0.6 : 0.75);
  tell(p, isReal ? "real" : "bluff", T);
  glide(m, pts, to.yaw, act, () => {
    if (isReal) hit(m, p, T);
    after();
  });
}

// Where it trots off to from `at`: walkOff blocks straight away or, with something in the way, the first way clear
// turned up to 90 degrees either side (with the way ahead clear, each ends farther than shyRange); boxed in, the way
// that gets it farthest from `at`, or undefined when none gets it half a block farther.
function awayFrom(m, at, T) {
  const from = { x: m.e.location.x, z: m.e.location.z };
  const straight = walkOffTo(from, at, T.walkOff);
  const dx = straight.x - from.x;
  const dz = straight.z - from.z;
  let best;
  let most = Math.hypot(from.x - at.x, from.z - at.z) + 0.5;
  for (const turn of [0, 30, -30, 60, -60, 90, -90]) {
    const r = (turn * Math.PI) / 180;
    const to = { x: from.x + dx * Math.cos(r) - dz * Math.sin(r), z: from.z + dx * Math.sin(r) + dz * Math.cos(r) };
    const all = stepsAlong(from, to, T.trotPace);
    let n = 0;
    while (n < all.length && levelWay(m.e, [all[n]], halfOf(m))) n++;
    if (n === all.length) return to;
    const end = n ? all[n - 1] : from;
    const d = Math.hypot(end.x - at.x, end.z - at.z);
    if (d > most) {
      most = d;
      best = to;
    }
  }
  return best;
}

// Trots off from `at` (awayFrom); with nowhere to go, it stays where it is.
function walkOff(m, at, T) {
  const to = awayFrom(m, at, T);
  if (to) trotTo(m, to, ACT.trot, () => settle(m, system.currentTick, T), T);
  else settle(m, system.currentTick, T);
}

function hit(m, p, T) {
  const e = m.e;
  try {
    if (!e.isValid || !p.isValid || !survival(p) || peaceful()) return;
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > T.reach + 0.75) return; // it didn't get there after all
    p.applyDamage(chargeDamage(m.male, T), { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * T.knock, z: (dz / len) * T.knock }, T.lift);
    sound(e, "mob.hoglin.attack", 1, m.male ? 0.6 : 0.75);
  } catch {
    // gone
  }
}

// A wild one without piglets about: hurt by someone within grudgeRange, it charges them for real, once for each time
// they hurt it, then trots off; from anyone in Survival or Adventure within shyRange (not tempting it) it trots off,
// and again each time they're that near once shyAgain has gone by (it keeps its distance). True when it's busy.
function shy(h, m, members, players, now, T) {
  const { e, s } = m;
  if (!m.adult || moving.has(m.id) || s.phase === "charge") return false;
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !survival(p)) continue;
      const d = Math.hypot(p.location.x - m.x, p.location.z - m.z);
      const at = { x: p.location.x, z: p.location.z };
      const hurtAt = grudges.get(p.id)?.ids.get(m.id);
      if (hurtAt !== undefined && hurtAt > s.chargedAt && d <= T.grudgeRange) {
        if (now < h.chargeCool) return true;
        h.chargeCool = now + T.chargeCool;
        s.chargedAt = now;
        charge(m, p, !peaceful(), () => walkOff(m, at, T), T);
        return true;
      }
      if (now < s.shyUntil || d > T.shyRange || tempting(p)) continue;
      s.shyUntil = now + T.shyAgain;
      const to = awayFrom(m, at, T);
      if (!to) return false; // boxed in: it carries on where it is
      s.phase = "trot";
      body(e, s, "still");
      seek(e, s, "none");
      sound(e, "mob.pig.say", 0.5, m.male ? 0.5 : 0.65);
      trotTo(m, to, ACT.trot, () => settle(m, system.currentTick, T), T);
      return true;
    } catch {
      // gone
    }
  }
  return false;
}

// What the player is told (at most once in tellEvery for each kind).
function tell(p, kind, T) {
  const text = kind === "real" ? "§cThe sow is charging you for real: get away from her piglets!" : kind === "bluff" ? "§eThe sow charged and stopped short: back away from her piglets and she lets you be" : "§eA sow is standing between you and her piglets, bristles up: keep back";
  const k = `${p.id}|${kind}`;
  const now = system.currentTick;
  if (now - (toldAt.get(k) ?? -100000) < T.tellEvery) return;
  toldAt.set(k, now);
  try {
    p.onScreenDisplay.setActionBar(text);
  } catch {
    // gone
  }
}

// A boar hurt by a player (initBoars, world.afterEvents.entityHurt): its sounder remembers them a while.
export function boarHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const T = BALANCE.boar;
  const g = grudges.get(damager.id) ?? { until: 0, ids: new Map() };
  g.until = system.currentTick + T.grudgeTicks;
  g.ids.set(entity.id, system.currentTick);
  grudges.set(damager.id, g);
}

// Every cell its body covers along the way open at the feet and the head, at the level it stands on, and the cell
// under its middle a floor. `half`: half its width.
function levelWay(e, pts, half = 0.4) {
  const read = blockReader(e.dimension);
  const y = Math.floor(e.location.y + 0.01);
  const h = half - 0.01;
  const seen = new Set();
  for (const p of pts) {
    for (let x = Math.floor(p.x - h); x <= Math.floor(p.x + h); x++) {
      for (let z = Math.floor(p.z - h); z <= Math.floor(p.z + h); z++) {
        const k = `${x},${z}`;
        if (seen.has(k)) continue;
        seen.add(k);
        if (read(x, y, z) !== "air" || read(x, y + 1, z) !== "air") return false;
      }
    }
    const below = read(Math.floor(p.x), y - 1, Math.floor(p.z));
    if (below === "air" || below === "water" || below === "lava" || below === "unloaded" || below === "gate_open") return false;
  }
  return true;
}

// Half its body's width: a boar's box is 0.75 wide, a sow's 0.68, a piglet's 0.35 of a sow's (the entity files).
function halfOf(m) {
  return m.adult ? (m.male ? 0.38 : 0.34) : 0.12;
}

function glide(m, pts, face, act, done) {
  if (!pts.length) return done();
  moving.set(m.id, { e: m.e, pts, i: 0, face, act, done });
}

// The way from `from` to `to` ({ x, z }) at `pace` a tick over open, level ground: straight or, with something in the
// way (a basalt pillar), round it by one corner off to a side of where the straight way is blocked; else straight as
// far as it gets. { pts, whole }: whole when it gets all the way. The steps round a corner face along their leg.
function routeTo(m, from, to, pace) {
  const half = halfOf(m);
  const all = stepsAlong(from, to, pace);
  let n = 0;
  while (n < all.length && levelWay(m.e, [all[n]], half)) n++;
  if (n === all.length) return { pts: all, whole: true };
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  const blocked = all[n];
  for (const off of [1, -1, 1.5, -1.5, 2, -2, 3, -3]) {
    const c = { x: blocked.x - (dz / len) * off, z: blocked.z + (dx / len) * off };
    const a = stepsAlong(from, c, pace);
    const b = stepsAlong(c, to, pace);
    if (!levelWay(m.e, a, half) || !levelWay(m.e, b, half)) continue;
    const ya = yawTo(c.x - from.x, c.z - from.z);
    const yb = yawTo(to.x - c.x, to.z - c.z);
    return { pts: [...a.map((q) => ({ ...q, yaw: ya })), ...b.map((q) => ({ ...q, yaw: yb }))], whole: true };
  }
  return { pts: all.slice(0, n), whole: false };
}

// A trot to `to` ({ x, z }) over open, level ground (routeTo), as far as it gets; then `done`.
function trotTo(m, to, act, done, T) {
  const from = { x: m.e.location.x, z: m.e.location.z };
  const pts = Math.hypot(to.x - from.x, to.z - from.z) > 0.3 ? routeTo(m, from, to, T.trotPace).pts : [];
  glide(m, pts, yawTo(to.x - from.x, to.z - from.z), act, done);
}

// ---------------- the day ----------------
function step(m, members, lead, ex, now, players, mood, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  if (s.phase === "act") {
    const woke = s.restMood && mood !== s.restMood;
    if (now < s.actUntil && !woke) return acting(m);
    finished(m, now, T);
  }
  if (s.phase !== "idle") settle(m, now, T);
  if (mood !== "wallow") s.wallowed = false;
  if (now < s.cool || !e.isOnGround || tempted(e, players)) return;
  if (ex && m.adult && m.a && !m.a.outside && breakOut(m, ex, now, players, T)) return;
  if (mood === "forage") {
    s.restWait = undefined;
    return foraging(m, lead, ex, now, T);
  }
  if (!isMuddy(e)) s.rubBy = undefined;
  if (mood === "wallow") {
    const next = wallowStep({ wallowed: s.wallowed, muddy: isMuddy(e) && s.rubBy !== -1, mud: !ex || (ex.thermalMudCells ?? 0) > 0 });
    if (next === "mud") return toMud(m, now, T, !ex);
    if (next === "rub") return toRub(m, now, T);
  }
  seek(e, s, "none");
  // Lying down together: near the lead (a piglet near its mother), or anywhere once it has waited a while to get there.
  const mother = m.motherId && members.find((o) => o.id === m.motherId);
  const by = m.adult ? lead : mother || lead;
  const near = !by || by.id === m.id || Math.hypot(by.x - m.x, by.z - m.z) <= T.restNear;
  if (s.restWait === undefined) s.restWait = now + T.interestTicks;
  if (near || now >= s.restWait) {
    s.restWait = undefined;
    startAct(m, now, mood === "sleep" ? ACT.sleep : ACT.rest, mood === "sleep" ? T.sleepTicks : T.restTicks, undefined, mood);
  }
}

function foraging(m, lead, ex, now, T) {
  const { e, s } = m;
  const wild = !ex;
  if (now >= s.interestUntil) {
    s.interest = pickInterest({ feeder: wild || feederIn(ex), ground: wild || (ex.ashCells ?? 0) > 0, muddy: isMuddy(e) });
    // Now and then a grown one goes to try the wood the boar measure found leading out: pigs test their fences.
    if (m.adult && m.a && !m.a.outside && ex?.boarWalls?.proof === false && ex.boarWalls.path?.length && Math.random() < T.probeChance) s.interest = "probe";
    s.interestUntil = now + T.interestTicks + Math.floor(Math.random() * T.interestTicks);
  }
  // Strayed from the lead: nothing to walk off to (the engine's walk to one outranks following), so the sounder's
  // follow goal brings it back; it roots on the way.
  const strayed = lead && lead.id !== m.id && Math.hypot(lead.x - m.x, lead.z - m.z) > T.strayRange;
  seek(e, s, strayed ? "none" : s.interest === "feeder" ? "feeder" : s.interest === "root" ? "root" : "none");
  const here = cellOf(e.location);
  if (s.interest === "feeder" && tryEat(m, here, ex, now, T)) return;
  if (s.interest === "rub" && !strayed && goRub(m, here, now, T)) return;
  if (s.interest === "probe" && !strayed && ex && probe(m, ex, here, T)) return;
  if (!(s.interest === "root" || strayed) || Math.random() >= T.actChance) return;
  // Snout down in the ground it stands on, or in the ground at its side it stopped beside (facing it).
  const at = rootCell(e, here, wild);
  if (at) startAct(m, now, ACT.root, T.rootTicks, at === here ? undefined : yawTo(at.x + 0.5 - e.location.x, at.z + 0.5 - e.location.z));
}

// In the heat of the day: off to the mud (Thermal Mud in a zoo), and into it once it's standing in or on it, or at
// its edge (a step onto it first). Mud it can't get to in seekTicks: it gives up for this heat and lies down with the
// others.
function toMud(m, now, T, wild) {
  const { e, s } = m;
  seek(e, s, "mud");
  if (s.mudBy === undefined) s.mudBy = now + T.seekTicks;
  const here = cellOf(e.location);
  const mud = mudCell(e, here, wild);
  if (mud) {
    const wallow = () => {
      s.mudBy = undefined;
      sound(e, "block.mud.step", 0.8, 0.8);
      startAct(m, system.currentTick, ACT.wallow, T.wallowTicks, Math.floor(Math.random() * 360) - 180);
    };
    if (mud === here) return wallow();
    s.phase = "trot";
    body(e, s, "still");
    trotTo(m, { x: mud.x + 0.5, z: mud.z + 0.5 }, ACT.trot, () => (cellOf(e.location).x === mud.x && cellOf(e.location).z === mud.z ? wallow() : settle(m, system.currentTick, T)), T);
  } else if (now >= s.mudBy) {
    s.mudBy = undefined;
    s.wallowed = true;
  }
}

// Muddy: off to a rock or a wall to rub it off against. None in seekTicks: it lets the coat dry (rubBy -1; step()
// clears rubBy once it's clean).
function toRub(m, now, T) {
  const { e, s } = m;
  seek(e, s, "none");
  if (s.rubBy === undefined) s.rubBy = now + T.seekTicks;
  if (goRub(m, cellOf(e.location), now, T)) return;
  if (now >= s.rubBy) s.rubBy = -1;
}

// Rubbing the mud off: against a rock or a wall at its flank now, else off at a trot to the nearest open floor beside
// one (rubSpot), rubbing when it gets there. True when it's rubbing or on its way.
function goRub(m, here, now, T) {
  if (tryRub(m, here, now, T)) return true;
  const { e, s } = m;
  if (now < (s.rubLook ?? 0)) return false;
  s.rubLook = now + RUB_LOOK;
  const to = rubSpot(m, here, T);
  if (!to) return false;
  s.phase = "trot";
  body(e, s, "still");
  trotTo(m, to, ACT.trot, () => {
    const t = system.currentTick;
    if (!tryRub(m, cellOf(e.location), t, T)) settle(m, t, T);
  }, T);
  return true;
}

// The nearest open floor cell at its own level within RUB_REACH, beside a rock or a wall it rubs on (at its feet), that
// it can trot to in a straight line over level ground: the cell's middle { x, z }, or undefined. (Not a move_to_block
// goal: basalt, blackstone or stone bricks are as often the floor it stands on.)
function rubSpot(m, here, T) {
  const e = m.e;
  const plain = blockReader(e.dimension);
  const memo = new Map();
  const read = (x, y, z) => {
    const k = `${x},${y},${z}`;
    if (!memo.has(k)) memo.set(k, plain(x, y, z));
    return memo.get(k);
  };
  const spots = [];
  for (let dx = -RUB_REACH; dx <= RUB_REACH; dx++) {
    for (let dz = -RUB_REACH; dz <= RUB_REACH; dz++) {
      if ((!dx && !dz) || dx * dx + dz * dz > RUB_REACH * RUB_REACH) continue;
      const cell = { x: here.x + dx, y: here.y, z: here.z + dz };
      if (read(cell.x, cell.y, cell.z) !== "air" || read(cell.x, cell.y + 1, cell.z) !== "air") continue;
      const below = read(cell.x, cell.y - 1, cell.z);
      if (below === "air" || below === "water" || below === "lava" || below === "unloaded" || below === "gate_open") continue;
      if (rubSide(e, read, cell)) spots.push({ x: cell.x + 0.5, z: cell.z + 0.5, d: dx * dx + dz * dz });
    }
  }
  spots.sort((a, b) => a.d - b.d);
  const from = { x: e.location.x, z: e.location.z };
  for (const p of spots.slice(0, 6)) if (levelWay(e, stepsAlong(from, p, T.trotPace), halfOf(m))) return { x: p.x, z: p.z };
  return undefined;
}

// The side of `cell` with a rock or a wall it rubs on at its feet ({ x, z }, one of the four), or undefined.
function rubSide(e, read, cell) {
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const kind = read(cell.x + dx, cell.y, cell.z + dz);
    if (kind !== "solid" && kind !== "barrier") continue;
    let id;
    try {
      id = e.dimension.getBlock({ x: cell.x + dx, y: cell.y, z: cell.z + dz })?.typeId;
    } catch {
      continue;
    }
    if (rubbable(id, kind)) return { x: dx, z: dz };
  }
  return undefined;
}

// The cells its body is over: the one it stands in, and those at its side within EDGE of its middle (a move_to_block
// goal ends goal_radius from the block's middle, which can be on the block beside it).
const EDGE = 0.45;
function cellsUnder(e, here) {
  const l = e.location;
  const out = [here];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const c = { x: here.x + dx, y: here.y, z: here.z + dz };
      const nx = Math.max(c.x, Math.min(l.x, c.x + 1));
      const nz = Math.max(c.z, Math.min(l.z, c.z + 1));
      if (Math.hypot(nx - l.x, nz - l.z) <= EDGE) out.push(c);
    }
  }
  return out;
}

const idAt = (e, pos) => {
  try {
    return e.dimension.getBlock(pos)?.typeId;
  } catch {
    return undefined;
  }
};

// A cell at its side it could put its snout or step into: open at its feet (or mud it stands in) and its head.
function openBeside(e, c, wild) {
  const read = blockReader(e.dimension);
  return (read(c.x, c.y, c.z) === "air" || wallowable(idAt(e, c), wild)) && read(c.x, c.y + 1, c.z) === "air";
}

// Ground to root in under it: the cell, or undefined.
function rootCell(e, here, wild) {
  return cellsUnder(e, here).find((c) => rootable(idAt(e, { ...c, y: c.y - 1 }), wild) && (c === here || openBeside(e, c, wild)));
}

// Mud to wallow in under it (a mud block is lower than a full one: it can stand in it): the cell, or undefined.
function mudCell(e, here, wild) {
  return cellsUnder(e, here).find((c) => (wallowable(idAt(e, { ...c, y: c.y - 1 }), wild) || wallowable(idAt(e, c), wild)) && (c === here || openBeside(e, c, wild)));
}

// Head down at a feeder in its exhibit with food it eats, or (wild) at a crimson fungus growing beside it.
function tryEat(m, here, ex, now, T) {
  const e = m.e;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const pos = { x: here.x + dx, y: here.y, z: here.z + dz };
      const rec = db.get("equipment", posKey(e.dimension.id, pos));
      let food = rec?.type === "feeder" && (!ex || (ex.feederIds ?? []).includes(rec.id)) && edible(rec);
      if (!food && !ex) {
        try {
          food = /^minecraft:(crimson_fungus|crimson_roots)$/.test(e.dimension.getBlock(pos)?.typeId ?? "");
        } catch {
          // unloaded
        }
      }
      if (food) return startAct(m, now, ACT.root, T.eatTicks, yawTo(dx, dz));
    }
  }
  return false;
}

// Side on to a rock or a wall beside it (at its feet), the block at its left, rubbing the mud off.
function tryRub(m, here, now, T) {
  const dir = rubSide(m.e, blockReader(m.e.dimension), here);
  return dir ? startAct(m, now, ACT.rub, T.rubTicks, rubYaw(dir)) : false;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:cinder_boar"].dietTags.includes(RATIONS[rec.item]?.diet));
}

// Someone close by holding its food or an empty carrier: it lets them tempt or catch it.
function tempted(e, players) {
  for (const p of players) {
    try {
      if (p.dimension.id !== e.dimension.id || !tempting(p)) continue;
      if (Math.hypot(p.location.x - e.location.x, p.location.y - e.location.y, p.location.z - e.location.z) <= TEMPT_RANGE) return true;
    } catch {
      // gone
    }
  }
  return false;
}

function startAct(m, now, act, ticks, yaw, restMood = undefined) {
  const { e, s } = m;
  s.phase = "act";
  s.act = act;
  s.actUntil = now + (Array.isArray(ticks) ? between(ticks) : ticks);
  s.yaw = yaw;
  s.restMood = restMood;
  body(e, s, "still");
  seek(e, s, "none");
  setAct(e, act);
  if (yaw !== undefined) e.setRotation({ x: 0, y: yaw });
  return true;
}

// While it roots, wallows, rubs, rests or sleeps: keep facing the way it was, with the sounds that go with it.
function acting(m) {
  const { e, s } = m;
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.root && Math.random() < 0.15) sound(e, "dig.soul_soil", 0.3, 0.9);
  else if (s.act === ACT.wallow && Math.random() < 0.25) sound(e, Math.random() < 0.5 ? "block.mud.step" : "block.mud.hit", 0.6, 0.8);
  else if (s.act === ACT.rub && Math.random() < 0.25) sound(e, "dig.gravel", 0.3, 0.8);
}

// An act run its time: out of the wallow wearing the mud coat; rubbed clean after a rub.
function finished(m, now, T) {
  const { e, s } = m;
  if (s.act === ACT.wallow) {
    s.wallowed = true;
    setMuddy(e, true);
    s.muddyUntil = now + T.muddyTicks;
  } else if (s.act === ACT.rub) setMuddy(e, false);
}

// Back on its feet, walking where the engine takes it.
function settle(m, now, T) {
  const { e, s } = m;
  s.phase = "idle";
  s.act = ACT.none;
  s.yaw = undefined;
  s.restMood = undefined;
  s.cool = now + T.coolTicks;
  body(e, s, "move");
  setAct(e, ACT.none);
}

// ---------------- out through the wood ----------------
// Near the start of the way out the boar measure found, now and then it takes it: it trots to the wooden block, butts
// it (buttTicks) and, with mobGriefing on, breaks it and trots on out (outRun blocks past it, so it is clear of the
// exhibit before it stops to forage); the park members hear where. With mobGriefing
// off it only butts it, and the members hear that the wood won't hold a boar.
function breakOut(m, ex, now, players, T) {
  const w = ex.boarWalls;
  if (!w || w.proof !== false || !w.path?.length || !w.via) return false;
  const path = w.path.map(([x, y, z]) => ({ x, y, z }));
  const start = path[0];
  const here = cellOf(m.e.location);
  if (start.y !== here.y || Math.hypot(start.x - here.x, start.z - here.z) > T.escapeReach) return false;
  if (Math.random() >= T.escapeChance) return false;
  const v = w.via;
  // The path up to the block before the wood, then the rest.
  const at = path.findIndex((p) => p.x === v.x && p.z === v.z);
  if (at < 1) return false;
  const { e, s } = m;
  s.phase = "out";
  body(e, s, "still");
  seek(e, s, "none");
  const centre = (p) => ({ x: p.x + 0.5, y: p.y, z: p.z + 0.5 });
  const along = (list) => {
    const pts = [];
    let from = { x: e.location.x, y: e.location.y, z: e.location.z };
    for (const p of list.map(centre)) {
      const n = Math.max(1, Math.ceil(Math.hypot(p.x - from.x, p.z - from.z) / T.trotPace));
      const yaw = yawTo(p.x - from.x, p.z - from.z);
      for (let k = 1; k <= n; k++) pts.push({ x: from.x + ((p.x - from.x) * k) / n, y: k === n ? p.y : Math.max(from.y, p.y), z: from.z + ((p.z - from.z) * k) / n, yaw });
      from = p;
    }
    return pts;
  };
  const face = yawTo(v.x - path[at - 1].x, v.z - path[at - 1].z);
  const gap = centre(path[at]);
  const dir = { x: v.x - path[at - 1].x, z: v.z - path[at - 1].z };
  const on = { x: gap.x + dir.x * T.outRun, z: gap.z + dir.z * T.outRun };
  const away = () => trotTo(m, on, ACT.trot, () => settle(m, system.currentTick, T), T);
  glide(m, along(path.slice(0, at)), face, ACT.trot, () => butt(m, ex, path, at, face, players, T, () => glide(m, along(path.slice(at)), face, ACT.trot, away)));
  return true;
}

// Trying the wood: off at a trot to the start of the way out the boar measure found (breakOut takes it from there).
// Something in the way and it gets no nearer: it gives up and forages. True when it's on its way.
function probe(m, ex, here, T) {
  const start = ex.boarWalls?.path?.[0];
  if (!start || start[1] !== here.y) return false;
  const far = () => Math.hypot(start[0] + 0.5 - m.e.location.x, start[2] + 0.5 - m.e.location.z);
  if (far() <= T.escapeReach) return false;
  const { e, s } = m;
  const was = far();
  s.phase = "trot";
  body(e, s, "still");
  seek(e, s, "none");
  trotTo(m, { x: start[0] + 0.5, z: start[2] + 0.5 }, ACT.trot, () => {
    if (far() > T.escapeReach && far() > was - 1) s.interest = "root";
    settle(m, system.currentTick, T);
  }, T);
  return true;
}

// Butting: the snout shoved at it where it stands, a thump every half second.
function butt(m, ex, path, at, face, players, T, out) {
  const e = m.e;
  const pts = Array.from({ length: T.buttTicks }, () => ({ x: e.location.x, y: e.location.y, z: e.location.z, yaw: face }));
  const each = (i) => {
    if (i % 10 === 1) sound(e, "mob.zombie.wood", 1, 0.8);
  };
  moving.set(m.id, { e, pts, i: 0, face, act: ACT.root, done: () => broke(m, ex, path, at, players, T, out), each });
}

function broke(m, ex, path, at, players, T, out) {
  const e = m.e;
  let griefing = false;
  try {
    griefing = world.gameRules.mobGriefing;
  } catch {
    // keep the wood
  }
  const v = ex.boarWalls.via;
  const park = parkOfRecord(ex) ?? getPark();
  const tellAll = (text) => {
    for (const p of players) if (park?.members[p.id] && p.dimension.id === e.dimension.id) message(p, text);
  };
  if (!griefing) {
    settle(m, system.currentTick, T);
    const now = system.currentTick;
    if (now - (toldAt.get(`ex|${ex.id}`) ?? -100000) >= T.buttTellEvery) {
      toldAt.set(`ex|${ex.id}`, now);
      tellAll(`§e${m.a.name} the Cinder Boar is butting the wood at ${v.x} ${v.y} ${v.z} in ${ex.name}. §7Boars break wooden fences, gates and doors (the mobGriefing game rule is off, so it holds for now): build the walls of stone, brick or nether brick, iron bars or glass.`);
    }
    return;
  }
  // Every wooden block in the way at the next steps, at its feet and its head.
  const read = blockReader(e.dimension, { boar: true });
  const broken = [];
  for (const p of path.slice(at, at + 2)) {
    for (const y of [p.y, p.y + 1]) {
      if (read(p.x, y, p.z) !== "weak") continue;
      try {
        e.dimension.runCommand(`setblock ${p.x} ${y} ${p.z} air destroy`);
        broken.push({ x: p.x, y, z: p.z });
      } catch {
        // can't
      }
    }
  }
  if (!broken.length) return settle(m, system.currentTick, T);
  sound(e, "mob.zombie.woodbreak", 1, 0.9);
  for (const b of broken) blockChanged(e.dimension.id, b);
  tellAll(`§c${m.a.name} the Cinder Boar broke through the wood at ${v.x} ${v.y} ${v.z} and is getting out of ${ex.name}! §7Boars break wooden fences, gates and doors: build the walls of stone, brick or nether brick, iron bars or glass (the clipboard says where). To bring it back, catch it in a Thermal Carrier, or lead it back with an Ember Ration.`);
  out();
}

// ---------------- the mob ----------------
// Its body: "move" (walking) or "still" (standing put, lying down, wallowing, glided by the script). Each event swaps
// the other group out, and both hold the walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "feeder", "root", "mud" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
}

function isMuddy(e) {
  try {
    return e.getProperty(MUDDY) === true;
  } catch {
    return false;
  }
}

function setMuddy(e, on) {
  try {
    if (e.getProperty(MUDDY) !== on) e.setProperty(MUDDY, on);
  } catch {
    // gone
  }
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.01), z: Math.floor(p.z) };
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

export function initBoars() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        boarHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_cinder_boar"] },
  );
}
