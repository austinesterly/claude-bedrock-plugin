import { heldItem, onlinePlayers, entitiesNear } from "../platform/mc.js";
import { glideStep, facing, pitchOf } from "./glide.js";
import { animalFromEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { SPECIES } from "../data/species.js";
import { HABITAT_PROFILES } from "../data/profiles.js";
import { reportError } from "../core/log.js";
import { flyStep, forgetStep, lastStep, boxCells, passesThrough } from "./mover.js";
import { MOB_FLIGHT, FLYING_MOBS, PEN_FLYERS, ringOf, penAir, laneOf, laneRing, LANES, ringAround, ringSpeed, ringSpot, swoopStep, heightUnder, airToCount, awayFrom } from "./mobFlightRules.js";

// The zoo's flying mobs (0.1.205: the phantom; the rules are in animals/mobFlightRules.js). The game's own phantom circles
// high over a player and swoops at them; under a pen's roof its goals sit it at the roof, so the zoo's copies have no
// goals that move them and are flown from here, a tick at a time, near players only, as the Void Rays are
// (animals/flight.js: the glide maths, the pushes of animals/mover.js). A zoo one circles under its pen's roof, each in a
// lane of its own, and swoops down over the floor every 10 to 20 seconds; a calmed one circles low (2 blocks up) and slowly
// over where it was calmed, within reach of a Mob Cage (one calmed high up comes down till it finds the ground), and over
// anyone close by holding its food, so it can be led. The ender dragon (0.1.216) the same on a big ring, its whole box
// checked as it moves (F.body).

const RANGE = 48; // blocks from a player
const flying = new Map(); // entity id -> { lane, dir, swoop, trim, home, bait }
const rings = new Map(); // exhibit id -> { at (its measurement count), ring (the pen's, or undefined) }
let baitIds; // calmed type -> the food that draws it (its species' bait)

function blockAt(d, p) {
  try {
    return d.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });
  } catch {
    return undefined; // unloaded or out of the world
  }
}
function isOpen(d, p) {
  const b = blockAt(d, p);
  return Boolean(b && b.isAir);
}

const told = new Set();
function tell(error) {
  const key = String(error);
  if (told.has(key) || told.size > 20) return;
  told.add(key);
  reportError("mobflight", error);
}

function forget(id) {
  flying.delete(id);
  forgetStep(id);
}

// Every tick: fly the flying mobs near players.
export function tickMobFlight(now) {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let mobs;
    try {
      mobs = entitiesNear(player.dimension, player.location, RANGE, FLYING_MOBS);
    } catch {
      continue;
    }
    for (const e of mobs) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        steer(e, now);
      } catch (error) {
        tell(error);
        forget(e.id);
      }
    }
  }
  for (const id of [...flying.keys()]) if (!seen.has(id)) forget(id);
}

function steer(e, now) {
  const F = MOB_FLIGHT[e.typeId];
  let s = flying.get(e.id);
  if (!s) {
    const lane = laneOf(e.id);
    s = { lane, dir: LANES[lane].dir, swoop: { until: undefined, next: now + 60 + Math.floor(Math.random() * 200) }, trim: 0, home: undefined, bait: undefined, stuck: 0 };
    flying.set(e.id, s);
  }
  const pen = PEN_FLYERS.has(e.typeId);
  let ring;
  if (pen) {
    const a = animalFromEntity(e);
    const ex = a?.location.kind === "exhibit" ? getExhibit(a.location.id) : undefined;
    ring = ex ? penRing(ex, F, s.lane) : undefined;
  } else {
    // A calmed one: over a player holding its food (looked for every half second), else over where it was.
    if (now % 10 === 0 || s.bait === undefined) s.bait = baitRing(e, F) ?? null;
    if (s.bait) s.home = undefined;
    else if (!s.home || (s.home.seek && now % 20 === 0)) s.home = homeRing(e, F);
    ring = s.bait || s.home;
  }
  const pos = e.location;
  if (!ring) {
    // Nowhere to fly yet (its pen not measured since 0.1.205, or no air to read): it hangs where it is.
    flyStep(e, { x: 0, y: 0, z: 0 }, undefined, now, tell);
    return;
  }
  s.swoop = swoopStep(s.swoop, now, Math.random(), pen, F);
  const spot = ringSpot(pos, ring, s.dir, s.swoop.until !== undefined ? ring.low : ring.high, F);
  const yaw = e.getRotation().y;
  const f = facing(yaw);
  const clearAhead = isOpen(e.dimension, { x: pos.x + f.x * F.lookAhead, y: pos.y + 0.25, z: pos.z + f.z * F.lookAhead });
  const v = glideStep({ pos, yaw, spot, drifting: false, clearAhead, trim: s.trim }, ring.g ?? F);
  s.trim = v.trim;
  flyStep(e, v, { x: pitchOf(v), y: v.yaw }, now, tell, F.body);
  if (F.body && !pen && s.home) unstick(e, s, F);
}

// A big flier calmed by something in its way (0.1.216: an ender dragon by one of the End's pillars) would keep pushing
// into it: blocked for half a second (F.stuckTicks), its ring moves F.unstick blocks off what blocks it.
function unstick(e, s, F) {
  s.stuck = lastStep(e.id)?.blocked ? (s.stuck ?? 0) + 1 : 0;
  if (s.stuck < F.stuckTicks) return;
  s.stuck = 0;
  const p = e.location;
  const b = boxCells(p, { half: F.body.half + 1, height: F.body.height });
  const cells = [];
  for (let x = b.x0; x <= b.x1; x++)
    for (let y = b.y0; y <= b.y1; y++)
      for (let z = b.z0; z <= b.z1; z++) {
        const k = blockAt(e.dimension, { x, y, z });
        if (k && !passesThrough(k)) cells.push([x, y, z]);
      }
  const away = awayFrom(cells, p);
  if (away) s.home = { ...s.home, cx: s.home.cx + away.x * F.unstick, cz: s.home.cz + away.z * F.unstick };
}

// A pen's ring for a lane, worked out again whenever the pen is measured again.
function penRing(ex, F, lane) {
  let c = rings.get(ex.id);
  if (!c || c.at !== ex.validations) {
    const profile = HABITAT_PROFILES[SPECIES[ex.speciesId]?.habitatProfile] ?? HABITAT_PROFILES.mob_pen_sky;
    const base = ex.mobPen ? ringOf(penAir(ex.mobPen, ex.bbox, profile.minHeight), F) : undefined;
    const lanes = base ? LANES.map((_, k) => withSpeed(laneRing(base, k, F), F)) : undefined;
    c = { at: ex.validations, lanes };
    rings.set(ex.id, c);
  }
  return c.lanes?.[lane];
}

function withSpeed(ring, F, most = F.speed) {
  const speed = Math.min(most, ringSpeed(ring, F));
  return { ...ring, g: speed === F.speed ? F : { ...F, speed } };
}

// The ground's top under `p` (the first air over the ground, searching down), or undefined with no ground in reach.
function groundUnder(d, p, F) {
  const x = Math.floor(p.x), z = Math.floor(p.z);
  for (let y = Math.floor(p.y), n = 0; n <= F.groundBelow; y--, n++) {
    const b = blockAt(d, { x, y, z });
    if (!b) return undefined;
    if (!b.isAir) return y + 1;
  }
  return undefined;
}

// Blocks of air from `y` up over (x, z), counted up to `max`.
function airUp(d, x, y, z, max) {
  let n = 0;
  while (n < max && isOpen(d, { x, y: Math.floor(y) + n, z })) n++;
  return n;
}

// A calmed one's ring over where it is now: wildHeight over the ground (as high as fits under a roof), slowly round. With
// no ground in reach under it, a ring seekDrop lower, looked at again each second (seek) till the ground is in reach.
function homeRing(e, F) {
  const p = e.location;
  const ground = groundUnder(e.dimension, p, F);
  if (ground === undefined) return { ...withSpeed(ringAround(p, F.wildRadius, p.y - F.seekDrop), F, F.wildSpeed), seek: true };
  return withSpeed(ringAround(p, F.wildRadius, heightUnder(ground, F.wildHeight, airUp(e.dimension, p.x, ground, p.z, airToCount(6, F.wildHeight, F)), F)), F, F.wildSpeed);
}

// Over the nearest player close by holding its food, or undefined.
function baitRing(e, F) {
  if (!baitIds) {
    baitIds = new Map();
    for (const sp of Object.values(SPECIES)) if (sp.mob && MOB_FLIGHT[sp.wildSource] && sp.baitItem) baitIds.set(sp.wildSource, sp.baitItem);
  }
  const want = baitIds.get(e.typeId);
  if (!want) return undefined;
  const pos = e.location;
  let best, bestD = F.baitRange;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== e.dimension.id || heldItem(p)?.typeId !== want) continue;
    const dist = Math.hypot(p.location.x - pos.x, p.location.y - pos.y, p.location.z - pos.z);
    if (dist < bestD) {
      best = p;
      bestD = dist;
    }
  }
  if (!best) return undefined;
  const at = best.location;
  return withSpeed(ringAround(at, F.baitRadius, heightUnder(at.y, F.baitHeight, airUp(e.dimension, at.x, at.y, at.z, airToCount(5, F.baitHeight, F)), F)), F);
}

// For the test server: what the flight is doing with a mob.
export function mobFlightInfo(id) {
  return flying.get(id);
}
export function mobFlightErrors() {
  return [...told];
}
