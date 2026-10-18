import { system, world, EntityDamageCause } from "@minecraft/server";
import { onlinePlayers, entitiesNear, blockReader, heldItem } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, carrierByItem } from "../data/items.js";
import { posKey } from "../core/ids.js";
import { db } from "../persistence/db.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { ACT, GRAZER_TYPES, LEAD_TAG, moodAt, pickInterest, restAct, leadOf, herdsOf, ringPlaces, rusherOf, rushTo, stepsAlong, yawTo, rubYaw, grazeable, isRubStem } from "./grazerRules.js";

// Crimson Grazers (0.1.84, the Nether trio; spec 5.3 "Herd browsing and fungus rubbing | Crimson ground, fungal
// feed, herd shelter"; the rules are in animals/grazerRules.js). Every half second, for the grazers near players.
// A herd is a zoo exhibit's grazers, or wild ones within balance.grazer.herdRange of each other. Its lead (the
// oldest grown bull, else the oldest grown cow) carries the tag zoocraft:herd_lead and the others follow it (the
// entity's zoocraft:following group, a follow_mob goal: zoocraft:follow / zoocraft:lead). The day sets the mood
// (grazerRules.js moodAt): morning and afternoon they graze (cropping nylium, roots and fungus head down, at the
// feeder, now and then one rubs its flank on a crimson stem); round noon and through the night they lie down
// together near the lead, chewing the cud or asleep, a calf by its mother. A player in Survival or Adventure near
// the herd (inside the exhibit, for a zoo herd) makes it form a ring, the grown ones round the outside facing out,
// the bulls toward them, the young in the middle (the musk ox's defence); come closer and the nearest grown one
// (a bull before a cow) rushes out, stopping short, and goes back. Only someone who hurt one of a wild herd gets a
// real rush: a shove for 2 hearts. Someone holding its food or an empty carrier isn't a threat. Walking is the engine's; the glides
// into the ring and the rush are the script's, a teleport a tick (tickGrazerMoves). What it's doing goes to the
// client through zoocraft:act.

const RANGE = 48; // blocks from a player
const PROP = "zoocraft:act";
const TEMPT_RANGE = 8; // someone this close holding its food or a carrier: it leaves them to it

const state = new Map(); // entity id -> { body, seek, role, phase, act, actUntil, yaw, restMood, interest, interestUntil, cool, restWait, spot }
const moving = new Map(); // entity id -> { e, pts, i, yaw, face, act, done }
const herds = new Map(); // herd key -> { ring: { calmAt, places: Map id -> { x, z, yaw } } | undefined, rushCool }
const grudges = new Map(); // player id -> { until, ids: Set of grazer ids they hurt }
const toldAt = new Map(); // `${player id}|${kind}` -> tick

// Every 10 ticks: the herds near players.
export function tickGrazers(now) {
  const T = BALANCE.grazer;
  const players = onlinePlayers();
  let mood = "graze";
  try {
    mood = moodAt(world.getTimeOfDay(), T);
  } catch {
    // keep grazing
  }
  const seen = new Map(); // id -> { e, a }
  for (const player of players) {
    let list;
    try {
      list = entitiesNear(player.dimension, player.location, RANGE, GRAZER_TYPES);
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
  const groups = new Map(); // herd key -> members
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
    const at = new Map(list.map((b) => [b.e.id, b]));
    for (const ids of herdsOf(list.map((b) => ({ id: b.e.id, x: b.e.location.x, z: b.e.location.z })), T.herdRange)) {
      const k = `wild:${[...ids].sort()[0]}`;
      groups.set(k, ids.map((id) => at.get(id)));
    }
  }
  for (const [k, list] of groups) {
    try {
      herdStep(k, list, now, players, mood, T);
    } catch {
      for (const b of list) forget(b.e.id);
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) forget(id);
  for (const k of [...herds.keys()]) if (!groups.has(k)) herds.delete(k);
  for (const [id, g] of [...grudges]) if (now > g.until) grudges.delete(id);
}

function forget(id) {
  state.delete(id);
  moving.delete(id);
}

// Every tick: glide the grazers going into the ring or rushing along their steps.
export function tickGrazerMoves() {
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
      m.e.teleport({ x: p.x, y: m.e.location.y, z: p.z }, { rotation: { x: 0, y: m.face }, keepVelocity: false });
      setAct(m.e, m.act);
      if (m.i < m.pts.length) continue;
      moving.delete(id);
      m.done();
    } catch {
      moving.delete(id);
    }
  }
}

// ---------------- the herd ----------------
function member(b, now, T) {
  const { e, a } = b;
  let s = state.get(e.id);
  if (!s) {
    s = { phase: "idle", interest: "graze", interestUntil: 0, actUntil: 0, cool: now + T.coolTicks };
    state.set(e.id, s);
    // Met (again): on its feet wherever it was left, so it's never stuck still without its walking.
    body(e, s, "move");
    seek(e, s, "none");
    setAct(e, ACT.none);
  }
  const adult = a ? !a.juvenile : true; // wild grazers are all grown
  const male = a ? a.sex === "male" : markOf(e) === 1;
  // Older is larger: born on an earlier park day; one caught grown (no birth day) counts as the oldest.
  const age = a ? (a.bornDay === undefined ? 1e9 : -a.bornDay) : 0;
  return { id: e.id, e, a, s, adult, male, age, x: e.location.x, z: e.location.z };
}

function markOf(e) {
  try {
    return e.getComponent("minecraft:mark_variant")?.value ?? 0;
  } catch {
    return 0;
  }
}

function herdStep(k, list, now, players, mood, T) {
  const members = list.map((b) => member(b, now, T)).sort((p, q) => (p.id < q.id ? -1 : 1));
  const ex = members[0].a?.location.kind === "exhibit" ? getExhibit(members[0].a.location.id) : undefined;
  let h = herds.get(k);
  if (!h) {
    h = { ring: undefined, rushCool: 0 };
    herds.set(k, h);
  }
  // The lead: the tag on it, the others following it.
  const leadId = leadOf(members);
  for (const m of members) role(m, m.id === leadId ? "lead" : "follow");
  const lead = members.find((m) => m.id === leadId);
  const threat = threatTo(members, ex, players, k, Boolean(h.ring), T);
  if (threat) {
    if (!h.ring) formRing(h, members, threat, T);
    h.ring.calmAt = now + T.ringCalmTicks;
    for (const m of members) if (h.ring.places.has(m.id) && m.s.phase === "ring" && !moving.has(m.id)) holdRing(m);
    if (now >= h.rushCool && !members.some((m) => m.s.phase === "rush")) {
      const ringed = members.filter((m) => m.s.phase === "ring" && !moving.has(m.id));
      const id = rusherOf(ringed, threat.location, T.rushRange);
      if (id) {
        h.rushCool = now + T.rushCool;
        rush(h, ringed.find((m) => m.id === id), threat, real(threat, members), T);
      }
    }
    return;
  }
  if (h.ring) {
    if (now < h.ring.calmAt || members.some((m) => moving.has(m.id))) {
      for (const m of members) if (m.s.phase === "ring" && !moving.has(m.id)) holdRing(m);
      return;
    }
    h.ring = undefined;
    for (const m of members) if (m.s.phase === "ring" || m.s.phase === "rush") settle(m, now, T);
  }
  for (const m of members) {
    try {
      step(m, members, lead, ex, now, players, mood, T);
    } catch {
      forget(m.id);
    }
    if (Math.random() < T.gruntChance) sound(m.e, "mob.hoglin.ambient", 0.5, m.adult ? 0.6 : 1.1);
  }
}

// "lead" (tagged, no follow goal) or "follow" (the follow goal on, no tag).
function role(m, want) {
  const { e, s } = m;
  if (want === "lead" ? !e.hasTag(LEAD_TAG) : e.hasTag(LEAD_TAG)) {
    if (want === "lead") e.addTag(LEAD_TAG);
    else e.removeTag(LEAD_TAG);
  }
  if (s.role === want) return;
  e.triggerEvent(want === "lead" ? "zoocraft:lead" : "zoocraft:follow");
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
  return BALANCE.grazer.bait.includes(id) || carrierByItem(id)?.full === false;
}

// Inside the exhibit's box (with a little headroom), for a zoo herd.
function insideBox(ex, l) {
  const b = ex?.bbox;
  if (!b) return false;
  return l.x >= b.min.x && l.x < b.max.x + 1 && l.z >= b.min.z && l.z < b.max.z + 1 && l.y >= b.min.y - 1 && l.y < b.max.y + 4;
}

// The player the herd rings up against, if any: the nearest one in Survival or Adventure within ringRange of a
// grown one (inside the exhibit and within ringRangeZoo, for a zoo herd), not tempting it; or, for a wild herd,
// someone who hurt one of it, within grudgeRange. Once ringed they hold it while the threat stays within ringHold
// more (gliding into the ring can take them a step or two back from someone who stopped at the edge).
function threatTo(members, ex, players, k, ringed, T) {
  const zoo = k.startsWith("ex:");
  const wild = k.startsWith("wild:");
  const d0 = members[0].e.dimension.id;
  const more = ringed ? T.ringHold : 0;
  let best;
  let bestD = Infinity;
  for (const p of players) {
    try {
      if (p.dimension.id !== d0 || !survival(p)) continue;
      const l = p.location;
      const d = Math.min(...members.map((m) => Math.hypot(m.x - l.x, m.z - l.z)));
      const g = wild ? grudges.get(p.id) : undefined;
      const hurtOne = Boolean(g && members.some((m) => g.ids.has(m.id)));
      let near;
      if (hurtOne) near = d <= T.grudgeRange;
      else if (tempting(p)) near = false;
      else if (zoo) near = insideBox(ex, l) && d <= T.ringRangeZoo + more;
      else near = d <= T.ringRange + more;
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

// Does the rush mean it? Only at someone who hurt one of this herd (a wild one), and not in Peaceful.
function real(p, members) {
  const g = grudges.get(p.id);
  return Boolean(g && members.some((m) => g.ids.has(m.id))) && !peaceful();
}

// Into the ring: each to its place (grazerRules.js ringPlaces), a short glide over open, level ground; one with
// no clear way there turns where it stands to face out.
function formRing(h, members, threat, T) {
  const places = ringPlaces(members, threat.location, T);
  h.ring = { calmAt: 0, places };
  const cx = members.reduce((n, m) => n + m.x, 0) / members.length;
  const cz = members.reduce((n, m) => n + m.z, 0) / members.length;
  sound(members[0].e, "mob.hoglin.angry", 0.7, 0.6);
  for (const m of members) {
    const p = places.get(m.id);
    if (!p) continue;
    const { e, s } = m;
    s.phase = "ring";
    s.act = ACT.ring;
    s.restMood = undefined;
    body(e, s, "still");
    seek(e, s, "none");
    const from = { x: e.location.x, z: e.location.z };
    // As far toward its place as it can get (a trunk or a wall in the way stops it there).
    const all = stepsAlong(from, p, T.ringPace);
    let n = 0;
    while (n < all.length && levelWay(e, [all[n]], halfOf(m))) n++;
    const pts = all.slice(0, n);
    const to = pts[pts.length - 1];
    const clear = Boolean(to) && Math.hypot(to.x - from.x, to.z - from.z) > 0.3;
    s.spot = clear ? { x: to.x, z: to.z } : from;
    // No clear way to its place: it turns where it stands, a grown one facing out from the herd (unless it
    // stands in the middle of it), a calf toward the threat.
    const at = s.spot;
    const there = n === all.length;
    const outFrom = m.adult && Math.hypot(at.x - cx, at.z - cz) > 0.5;
    s.yaw = there || !outFrom ? p.yaw : yawTo(at.x - cx, at.z - cz);
    setAct(e, ACT.ring);
    if (!clear) {
      e.setRotation({ x: 0, y: s.yaw });
      continue;
    }
    glide(m, pts, yawTo(p.x - from.x, p.z - from.z), ACT.ring, () => {
      try {
        e.setRotation({ x: 0, y: s.yaw });
      } catch {
        // gone
      }
    });
  }
}

// Standing in the ring: facing out, head low.
function holdRing(m) {
  const { e, s } = m;
  e.setRotation({ x: 0, y: s.yaw ?? 0 });
  setAct(e, ACT.ring);
}

// The rush: head down at them, stopping short (a bluff: rushShort off, or a lunge of a block at someone already
// closer, never nearer than realShort + 0.4) or right up to them (a real one, with the shove), then back to its
// place in the ring. With no room to lunge (they're right there, or something's in the way) it stamps and tosses
// its head where it stands (the same act, a second long).
function rush(h, m, p, isReal, T) {
  const { e, s } = m;
  const from = { x: e.location.x, z: e.location.z };
  const at = { x: p.location.x, z: p.location.z };
  const d = Math.hypot(at.x - from.x, at.z - from.z);
  const to = rushTo(from, at, isReal ? T.realShort : Math.min(T.rushShort, Math.max(d - 1, T.realShort + 0.4)));
  let out = to.length >= 0.5 ? stepsAlong(from, to, T.rushPace) : [];
  if (!out.length || !levelWay(e, out, halfOf(m))) {
    out = Array.from({ length: T.stampTicks }, () => from);
    Object.assign(to, { x: from.x, z: from.z, yaw: yawTo(at.x - from.x, at.z - from.z) });
  }
  s.phase = "rush";
  sound(e, "mob.hoglin.angry", 1, 0.7);
  tell(p, isReal ? "real" : "bluff", T);
  glide(m, out, to.yaw, ACT.rush, () => {
    if (isReal) shove(e, p, T);
    const back = stepsAlong(to, s.spot ?? from, T.ringPace);
    glide(m, back, yawTo((s.spot ?? from).x - to.x, (s.spot ?? from).z - to.z), ACT.ring, () => {
      s.phase = h.ring ? "ring" : "idle";
      try {
        e.setRotation({ x: 0, y: s.yaw ?? to.yaw });
      } catch {
        // gone
      }
    });
  });
}

function shove(e, p, T) {
  try {
    if (!e.isValid || !p.isValid || !survival(p)) return;
    const dx = p.location.x - e.location.x;
    const dz = p.location.z - e.location.z;
    const len = Math.hypot(dx, dz) || 1;
    if (len > T.reach + 0.75) return; // it didn't get there after all
    p.applyDamage(T.shoveDamage, { cause: EntityDamageCause.entityAttack, damagingEntity: e });
    p.applyKnockback({ x: (dx / len) * T.knock, z: (dz / len) * T.knock }, T.lift);
    sound(e, "mob.hoglin.attack", 1, 0.7);
  } catch {
    // gone
  }
}

// What the player is told (at most once in tellEvery for each kind).
function tell(p, kind, T) {
  const text = kind === "real" ? "§cThe herd is charging you for hurting one of them: get away!" : "§eA Crimson Grazer rushed you and stopped short: give the herd room and they settle";
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

// A grazer hurt by a player (initGrazers, world.afterEvents.entityHurt): its herd remembers them a while.
export function grazerHurt(entity, damager) {
  if (damager?.typeId !== "minecraft:player") return;
  const T = BALANCE.grazer;
  const g = grudges.get(damager.id) ?? { until: 0, ids: new Set() };
  g.until = system.currentTick + T.grudgeTicks;
  g.ids.add(entity.id);
  grudges.set(damager.id, g);
}

// Every cell its body covers along the way open at the feet and the head, at the level it stands on, and the
// cell under its middle a floor. `half`: half its width (a bull's 1.3-block body brushed a crimson stem it glided
// past when only the middle was checked).
function levelWay(e, pts, half = 0.5) {
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

// Half its body's width: a bull's box is 1.3 wide, a cow's 1.1, a calf's 0.4 of a cow's (the entity files).
function halfOf(m) {
  return m.adult ? (m.male ? 0.65 : 0.55) : 0.2;
}

function glide(m, pts, face, act, done) {
  if (!pts.length) return done();
  moving.set(m.id, { e: m.e, pts, i: 0, face, act, done });
}

// ---------------- the day ----------------
function step(m, members, lead, ex, now, players, mood, T) {
  const { e, s } = m;
  if (moving.has(m.id)) return;
  if (s.phase === "act") {
    const woke = s.restMood && mood !== s.restMood;
    if (now < s.actUntil && !woke) return acting(m);
    settle(m, now, T);
  }
  if (s.phase !== "idle") settle(m, now, T);
  if (now < s.cool || !e.isOnGround || tempted(e, players)) return;
  if (mood === "graze") {
    s.restWait = undefined;
    return grazing(m, lead, ex, now, T);
  }
  seek(e, s, "none");
  // Lying down together: near the lead (a calf near its mother), or anywhere once it has waited a while to get there.
  const mother = m.a?.parents?.[0] && members.find((o) => o.a?.id === m.a.parents[0]);
  const by = m.adult ? lead : mother || lead;
  const near = !by || by.id === m.id || Math.hypot(by.x - m.x, by.z - m.z) <= T.restNear;
  if (s.restWait === undefined) s.restWait = now + T.interestTicks;
  if (near || now >= s.restWait) {
    s.restWait = undefined;
    startAct(m, now, restAct(mood), T.restTicks, undefined, mood);
  }
}

function grazing(m, lead, ex, now, T) {
  const { e, s, a } = m;
  if (now >= s.interestUntil) {
    const wild = !ex;
    s.interest = pickInterest({ feeder: wild || feederIn(ex), stem: wild || (ex.stemCount ?? 0) > 0, calf: Boolean(a?.juvenile) });
    s.interestUntil = now + T.interestTicks + Math.floor(Math.random() * T.interestTicks);
  }
  // Strayed from the lead: no feeder or stem to walk off to (the engine's walk to one outranks following), so
  // the herd's follow goal brings it back; it crops on the way.
  const strayed = lead && lead.id !== m.id && Math.hypot(lead.x - m.x, lead.z - m.z) > T.strayRange;
  seek(e, s, !strayed && (s.interest === "feeder" || s.interest === "rub") ? s.interest : "none");
  const here = cellOf(e.location);
  if (s.interest === "feeder" && tryEat(m, here, ex, now, T)) return;
  if (s.interest === "rub" && tryRub(m, here, now, T)) return;
  if ((s.interest === "graze" || strayed) && Math.random() < T.actChance && onGrazing(e, here)) startAct(m, now, ACT.graze, T.grazeTicks, undefined);
}

function onGrazing(e, here) {
  try {
    return grazeable(e.dimension.getBlock(here)?.typeId) || grazeable(e.dimension.getBlock({ ...here, y: here.y - 1 })?.typeId);
  } catch {
    return false;
  }
}

// Head down at a feeder in its exhibit with food it eats, or (wild) at fungus or roots growing beside it.
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
          food = grazeable(e.dimension.getBlock(pos)?.typeId);
        } catch {
          // unloaded
        }
      }
      if (food) return startAct(m, now, ACT.graze, T.eatTicks, yawTo(dx, dz));
    }
  }
  return false;
}

// Side on to a crimson stem beside it (at its feet or its shoulder), the stem at its left, rubbing.
function tryRub(m, here, now, T) {
  const e = m.e;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (const dy of [0, 1]) {
      let id;
      try {
        id = e.dimension.getBlock({ x: here.x + dx, y: here.y + dy, z: here.z + dz })?.typeId;
      } catch {
        continue;
      }
      if (isRubStem(id)) return startAct(m, now, ACT.rub, T.rubTicks, rubYaw({ x: dx, z: dz }));
    }
  }
  return false;
}

function feederIn(ex) {
  return (ex?.feederIds ?? []).some((id) => edible(db.get("equipment", id)));
}

function edible(rec) {
  return Boolean(rec?.units > 0 && SPECIES["zoocraft:crimson_grazer"].dietTags.includes(RATIONS[rec.item]?.diet));
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

// While it grazes, rubs, chews or sleeps: keep facing the way it was, with the sounds that go with it.
function acting(m) {
  const { e, s } = m;
  if (s.yaw !== undefined) e.setRotation({ x: 0, y: s.yaw });
  setAct(e, s.act);
  if (s.act === ACT.rub && Math.random() < 0.25) sound(e, "hit.stem", 0.35, 0.8);
  else if (s.act === ACT.graze && Math.random() < 0.15) sound(e, "dig.nylium", 0.25, 0.9);
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

// ---------------- the mob ----------------
// Its body: "move" (walking) or "still" (standing put, lying down, in the ring). Each event swaps the other group
// out, and both hold the walking speed and physics the entity's base also has (0.1.70).
function body(e, s, how) {
  if (s.body === how) return;
  e.triggerEvent(`zoocraft:${how}`);
  s.body = how;
}

// What the engine walks it toward: "feeder", "rub" or "none".
function seek(e, s, what) {
  if (s.seek === what) return;
  e.triggerEvent(`zoocraft:seek_${what}`);
  s.seek = what;
}

function setAct(e, act) {
  if (e.getProperty(PROP) !== act) e.setProperty(PROP, act);
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

export function initGrazers() {
  world.afterEvents.entityHurt.subscribe(
    (ev) => {
      try {
        grazerHurt(ev.hurtEntity, ev.damageSource?.damagingEntity);
      } catch {
        // gone
      }
    },
    { entityTypes: ["zoocraft:wild_crimson_grazer"] },
  );
}
