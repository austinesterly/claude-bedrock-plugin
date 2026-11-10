// Residents (0.1.182, module 6c: research/npc_plan.md): the named people who live in the homes players build
// (residents/homes.js) and walk the path from their front door to the zoo each day. Their records live in the
// "residents" collection, keyed by the resident's id (data/residents.js): { id, homeId, parkId, dimension, state, pos
// (feet), leaveAt, wentDay, entityId }. State is where they are: "inside" (at home, up), "asleep", "leaving",
// "visiting", "returning" or "waiting" (outside a home that stopped working); residentRules.js nextMove decides each
// change by the time of day.
// They're walked by script the guests' way (visitors/guests.js): a route of feet positions stepped a tick at a time
// (routes.js walkStep), a waypoint now and then carrying something to do (open or shut the front door, pay at the gate).
// Their body (zoocraft:resident) is there only while a player is near; out of everyone's range the record walks on by
// itself and the body comes back where it has got to. In the zoo they go from Viewing Point to bench to snack stand
// over the park's guest paths, watch a while at each, and pay the park's admission as they come in.
// 0.1.217 (research/npc_plan.md section 9): they take the park in at the gate (residentRules.js arrivalTags) and each
// stop as they reach it (stopTags); the likes and dislikes among them are the day's (`met`: { day, liked, disliked }),
// which set their mood (`mood`, `moodDay`), pull them to what they like, and on the way home a tip (`tipDay`).
// 0.1.222 (stage B, research/npc_spec_plan.md section 6): each lives their own day (a night worker's by night,
// residentRules.js scheduleOf), plans each day's visit (`planDay`, `rest`: a day at home now and then, by their
// routine, last mood and home comfort) and stays in, or heads home, in weather they don't go out in (core/weather.js);
// they walk at their own pace, make for their favourite exhibits first and stay longer there, and take in the dark,
// sunshine and a long walk on the way. Their home's comfort (homes.js, homeRules.js homeComfort) starts each visit's
// hearts higher and sweetens their tips.
// 0.1.223 (stage C, research/npc_spec_plan.md section 7): players make friends with them (residents/bonds.js), and a
// friend can ask them to follow (the following section below); a good friend visits a little more often and tips a
// little more.
// 0.1.224 (stage D, research/npc_spec_plan.md section 8): a resident with work (Dave's mine) works their shift at a
// Work Anchor site (residents/work.js; the work section below), and a good shift makes them more skilled and their next
// visit happier.

import { system, world } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { RESIDENTS, residentById, KIND_SPECIES, SERVICE_TAGS } from "../data/residents.js";
import { SPECIES } from "../data/species.js";
import { parkById, withPark, recordVisitors } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { admission, allPoints } from "../visitors/points.js";
import { allServices, WALK_TO, coverageNow, donationBoxesWorking } from "../visitors/services.js";
import { guestDemand } from "../visitors/guests.js";
import { fairPrice } from "../visitors/demand.js";
import { currentNetwork } from "../visitors/network.js";
import { nearestNode, routeSearch, waypoints, feetAt, walkStep, pickDestination } from "../visitors/routes.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { getAnimal } from "../animals/animals.js";
import { isUnlocked } from "./people.js";
import { yawToward } from "../visitors/sight.js";
import { getHome, homeWorks, homeWay } from "./homes.js";
import { bedSpot, homeComfort } from "./homeRules.js";
import { weatherNow } from "../core/weather.js";
import { dayPhase, leaveTimeOf, nextMove, pickOffers, reversed, arrivalTags, stopTags, addMet, moodOf, tipFor, stopPull, scheduleOf, restToday, weatherStop, isFavourite, walkSpeedOf } from "./residentRules.js";
import { dim, onlinePlayers, message } from "../platform/mc.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { bestTier, tierWith } from "./bonds.js";
import { keepGifts } from "./workGifts.js";
import { followBlock, bondLine } from "./bondRules.js";
import { laneTarget, easeLane, blockerOf, waitFor, laneShare } from "./spaceRules.js";
import { newTrail, addFootstep, wayLeft, addBack, backRoute, followPace, followMove, footstepOk, groundUnder, FEET_BAD } from "./followRules.js";
import { HOUSE_GONE } from "./homeRules.js";
import { shiftOf, inShift, shiftKey, skillOf, capacityOf, goodShift, siteWalk, workKindOf, SKILL_NAMES, WORK_KINDS } from "./workRules.js";
import { kindBalance, taskSeconds, TASK_UNITS, canDo } from "./workRules.js";
import { siteOf, getSite, siteWorks, siteMemory, siteFresh, sitePassing, queueSiteCheck, workTask, gatherTasks, workerGone } from "./work.js";

const COL = "residents";
const WHO = "zoocraft:who";
const WALKING = "zoocraft:walking";
const SLEEPING = "zoocraft:sleeping";
const TAG = "zoocraft:resident";
// Home problems that keep a resident out of their house: homeRules.js HOUSE_GONE (0.1.224: their work reads it too).

// resident id -> { route, wp, then, entity, planning, until, watched, dest; 0.1.223: moving (their walking look), trail
// (following: the footsteps ahead), back (the way back), stuck (ticks waiting), doors (doors they opened); 0.1.224: work
// ({ siteId, way, gate }: the walk there), next (the ore they're walking to), dig ({ target, stand, until }: the ore
// they're at), digging (their working look) } (memory only)
const run = new Map();
function rt(id) {
  let r = run.get(id);
  if (!r) run.set(id, (r = { route: undefined, wp: 0, then: undefined, entity: undefined, planning: false, until: 0, watched: new Set(), dest: undefined, moving: false, trail: undefined, back: undefined, stuck: 0, doors: [] }));
  return r;
}

const feet = (c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 });
const blockOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });

// --- talking (0.1.228): a resident stands still while a player has their menu open (ui/residentMenu.js) ---

// resident id -> { player (id), n (pages open), since, until (the tick the hold ends, once no page is open) }
const talks = new Map();

/** A player opened a page of a resident's menu: they stop and face them. */
export function talkStart(id, player) {
  const t = talks.get(id);
  if (t && t.player === player.id) {
    t.n++;
    t.until = undefined;
  } else talks.set(id, { player: player.id, n: 1, since: system.currentTick, until: undefined });
}

/** That page closed: they walk on a moment later, unless another page opens first. */
export function talkEnd(id, player) {
  const t = talks.get(id);
  if (!t || t.player !== player.id) return;
  t.n = Math.max(0, t.n - 1);
  if (!t.n) t.until = system.currentTick + BALANCE.residents.talk.graceTicks;
}

// The player a resident is standing still for, or undefined (the menu closed, the player gone or walked off).
function talkingTo(rec) {
  const t = talks.get(rec.id);
  if (!t) return undefined;
  const g = BALANCE.residents.talk;
  const now = system.currentTick;
  const p = (t.until === undefined || now < t.until) && now - t.since < g.maxSeconds * 20 ? onlinePlayers().find((x) => x.id === t.player) : undefined;
  if (p?.isValid && p.dimension.id === rec.dimension && Math.hypot(p.location.x - rec.pos.x, p.location.y - rec.pos.y, p.location.z - rec.pos.z) <= g.reach) return p;
  talks.delete(rec.id);
  return undefined;
}

/** Whether a resident is standing still for a player's menu now (for the bench and the tests). */
export function talkHeld(id) {
  const rec = getResident(id);
  return Boolean(rec && talkingTo(rec));
}

export function allResidents() {
  return [...db.col(COL).values()];
}

export function getResident(id) {
  return db.get(COL, id);
}

/** The residents whose home's path goes to that park (0.1.217: the Park Ledger's Residents page). */
export function residentsOfPark(parkId) {
  return allResidents().filter((rec) => (getHome(rec.homeId)?.parkId ?? rec.parkId) === parkId);
}

export function residentOfHome(homeId) {
  return allResidents().find((r) => r.homeId === homeId);
}

/**
 * Who'd like to move into this home: unlocked residents (0.1.220: their zoo goal met, residents/people.js) nobody in the
 * world houses yet, the same few all day.
 */
export function offersFor(home) {
  const housed = new Set(allResidents().map((r) => r.id));
  return pickOffers(RESIDENTS.filter((r) => isUnlocked(r.id)), housed, BALANCE.residents.offers, `${home.id}|${world.getDay()}`);
}

function nearestPlayer(dimensionId, pos) {
  let best = Infinity;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== dimensionId) continue;
    const d = Math.hypot(p.location.x - pos.x, p.location.z - pos.z);
    if (d < best) best = d;
  }
  return best;
}

// --- the body ---

function bodyOf(rec, r) {
  if (r.entity?.isValid) return r.entity;
  r.entity = undefined;
  if (!rec.entityId) return undefined;
  const e = world.getEntity(rec.entityId);
  if (e?.isValid) {
    r.entity = e;
    return e;
  }
  rec.entityId = undefined; // gone (unloaded with its chunk): a stale copy is cleared when it loads (residentLoaded)
  return undefined;
}

function dropBody(rec, r) {
  const e = bodyOf(rec, r);
  if (e) {
    try {
      e.remove();
    } catch {
      // already gone
    }
  }
  r.entity = undefined;
  rec.entityId = undefined;
  db.put(COL, rec);
}

function spawnBody(rec, r) {
  const res = residentById(rec.id);
  try {
    const e = dim(rec.dimension).spawnEntity(ENTITIES.resident, rec.pos);
    e.setProperty(WHO, res?.look ?? 0);
    e.setProperty(WALKING, Boolean(r.route) || Boolean(r.moving));
    e.setProperty(SLEEPING, rec.state === "asleep");
    e.setProperty(WORKING, Boolean(r.digging)); // 0.1.224
    e.setDynamicProperty(TAG, rec.id);
    e.nameTag = res?.name ?? "Resident";
    if (rec.state === "asleep") e.triggerEvent("zoocraft:sleep");
    if (rec.yaw !== undefined) e.setRotation({ x: 0, y: rec.yaw });
    r.entity = e;
    rec.entityId = e.id;
    db.put(COL, rec);
  } catch {
    // the chunk went while we looked: next time
  }
}

// A body only while a player is near (the guests' range), the record walking on by itself otherwise.
function keepBody(rec, r) {
  const g = BALANCE.residents;
  const near = nearestPlayer(rec.dimension, rec.pos);
  const e = bodyOf(rec, r);
  if (e) {
    if (near > g.spawnRange + 16) dropBody(rec, r);
    return;
  }
  if (near <= g.spawnRange && dim(rec.dimension).isChunkLoaded(blockOf(rec.pos))) spawnBody(rec, r);
}

function setWalking(rec, r, on) {
  const e = bodyOf(rec, r);
  if (!e) return;
  try {
    e.setProperty(WALKING, on);
  } catch {
    // unloaded under it
  }
}

function setSleeping(rec, r, on) {
  const e = bodyOf(rec, r);
  if (!e) return;
  try {
    e.setProperty(SLEEPING, on);
    e.triggerEvent(on ? "zoocraft:sleep" : "zoocraft:wake");
  } catch {
    // unloaded under it
  }
}

/** A resident's body loading with its chunk: ours stays, a stale copy (from before a reload) goes. */
export function residentLoaded(entity) {
  if (entity.typeId !== ENTITIES.resident) return;
  let id;
  try {
    id = entity.getDynamicProperty(TAG);
  } catch {
    id = undefined;
  }
  const rec = typeof id === "string" ? db.get(COL, id) : undefined;
  if (!rec || rec.entityId !== entity.id) {
    try {
      entity.remove();
    } catch {
      // gone
    }
    return;
  }
  rt(rec.id).entity = entity;
}

/** The resident a body belongs to, for talking to them. */
export function residentAt(entity) {
  if (entity?.typeId !== ENTITIES.resident) return undefined;
  try {
    const id = entity.getDynamicProperty(TAG);
    return typeof id === "string" ? db.get(COL, id) : undefined;
  } catch {
    return undefined;
  }
}

// --- walking ---

function setRoute(rec, r, points, then) {
  r.route = points;
  r.wp = 0;
  r.then = then;
  r.moving = true;
  setWalking(rec, r, true);
}

function endRoute(rec, r) {
  const then = r.then;
  r.route = undefined;
  r.then = undefined;
  r.moving = false;
  setWalking(rec, r, false);
  const home = getHome(rec.homeId);
  switch (then) {
    case "rejoin": {
      // 0.1.223: back where they set off from before following someone: on with their day, or home when asked.
      const f = rec.follow ?? {};
      rec.follow = undefined;
      doorsBehind(rec, r, true);
      if (f.from === "visiting") {
        rec.state = "visiting";
        r.until = 0;
        if (f.home && home) {
          const park = parkById(home.parkId ?? rec.parkId);
          tip(rec, park);
          goHome(rec, r, home, park);
          return;
        }
      } else rec.state = f.from === "waiting" ? "waiting" : "inside";
      break;
    }
    case "home":
      rec.state = "inside";
      break;
    // 0.1.224: work (the work section below)
    case "work":
      rec.state = "working";
      break;
    case "dig":
      startDig(rec, r);
      break;
    case "fromWork":
      rec.state = "inside";
      break;
    case "bed":
      rec.state = "asleep";
      if (home?.bed) {
        const b = bedSpot(home.bed);
        rec.pos = { x: b.x, y: b.y, z: b.z };
        rec.yaw = b.yaw;
        const e = bodyOf(rec, r);
        if (e) {
          try {
            e.teleport(rec.pos, { rotation: { x: 0, y: b.yaw }, keepVelocity: false });
          } catch {
            // unloaded
          }
        }
      }
      setSleeping(rec, r, true);
      break;
    case "visit":
      rec.state = "visiting";
      r.until = 0;
      r.watched = new Set();
      break;
    case "watch":
      // Arrived at a Viewing Point, bench or stand: stay a while, facing the animals.
      if (r.dest) {
        r.watched.add(r.dest.id);
        meet(rec, r.dest.tags ?? []);
      }
      {
        const [lo, hi] = BALANCE.residents.stopSeconds;
        const stay = r.dest?.fav ? BALANCE.residents.favStay : 1; // 0.1.222: a favourite, watched longer
        r.until = system.currentTick + Math.round((lo + Math.random() * (hi - lo)) * 20 * stay);
        const b = r.dest?.exhibitId ? getExhibit(r.dest.exhibitId)?.bbox : undefined;
        const e = bodyOf(rec, r);
        if (e && b) {
          try {
            e.setRotation({ x: 0, y: yawToward(rec.pos, { x: (b.min.x + b.max.x + 1) / 2, y: rec.pos.y, z: (b.min.z + b.max.z + 1) / 2 }) });
          } catch {
            // unloaded
          }
        }
      }
      r.dest = undefined;
      break;
  }
  db.put(COL, rec);
}

// Something to do on reaching a waypoint. Returns false to stop the walk there.
function act(rec, r, what) {
  const home = getHome(rec.homeId);
  for (const a of Array.isArray(what) ? what : [what]) {
    if (a === "open" || a === "close") {
      if (a === "open" && (rec.state === "returning" || rec.state === "fromWork") && (!home || HOUSE_GONE.has(home.problem))) {
        // The house isn't there to go into: wait outside until it's fixed.
        rec.state = "waiting";
        r.route = undefined;
        r.then = undefined;
        setWalking(rec, r, false);
        db.put(COL, rec);
        return false;
      }
      door(rec, r, home, a === "open");
    } else if (a === "enter") pay(rec, home);
    else if (a && typeof a === "object" && a.gate) workGate(rec, r, a); // 0.1.224: a work site's gate
  }
  return true;
}

// Open or shut the front door: its lower half's open_bit (research/npc_facts.md), only where someone can see it (the
// resident has a body, or a player is in a body's range of the door).
function door(rec, r, home, open) {
  if (!home?.door) return;
  if (!bodyOf(rec, r) && nearestPlayer(home.dimension, home.door.lower) > BALANCE.residents.spawnRange) return;
  try {
    const d = dim(home.dimension);
    const b = d.getBlock(home.door.lower);
    if (!b || !/_door$/.test(b.typeId) || /^minecraft:iron_door$/.test(b.typeId)) return;
    if (b.permutation.getState("open_bit") === open) return;
    b.setPermutation(b.permutation.withState("open_bit", open));
    d.playSound(open ? "random.door_open" : "random.door_close", { x: home.door.lower.x + 0.5, y: home.door.lower.y + 0.5, z: home.door.lower.z + 0.5 });
  } catch {
    // unloaded, or not a door any more
  }
}

// What they come across counts for the day: the likes and dislikes among `tags`, and the mood they make (0.1.217).
function meet(rec, tags) {
  const res = residentById(rec.id);
  if (!res) return;
  const day = world.getDay();
  rec.met = addMet(rec.met, tags, res, day);
  rec.mood = moodOf(rec.met, BALANCE.residents, liftOf(rec));
  rec.moodDay = day;
  db.put(COL, rec);
}

/** The likes and dislikes a resident has met today, or undefined before today's visit. */
export function todayMet(rec) {
  return rec?.met?.day === world.getDay() ? rec.met : undefined;
}

/** A resident's mood: their latest visit's, or where every visit starts (0.1.222: with their home's lift). */
export function moodNow(rec) {
  const g = BALANCE.residents;
  return rec?.mood ?? Math.min(g.moodMax, g.moodBase + (rec ? liftOf(rec) : 0));
}

/** The hearts a visit starts higher: their home's comfort, and 0.1.224 a good shift at work since their last visit. */
export function liftOf(rec) {
  return comfortOf(rec).lift + (rec?.proud ? BALANCE.residents.work.proudLift : 0);
}

/**
 * Their home's comfort for them (0.1.222, homeRules.js homeComfort, with what they'd love in it), and what it does:
 * { ...comfort, lift (hearts each visit starts higher) }.
 */
export function comfortOf(rec) {
  const g = BALANCE.residents;
  const home = rec ? getHome(rec.homeId) : undefined;
  const c = homeComfort(home?.comfort, g, rec ? residentById(rec.id) : undefined);
  return { ...c, lift: home?.comfort ? (g.homeTiers.lift[c.tier] ?? 0) : 0 };
}

// The length of the path from their door to the gate (blocks), for a long walk.
function walkLength(home) {
  const way = home ? homeWay(home.id) : undefined;
  if (!way || way.inside || !way.toGate?.length) return 0;
  let n = 0;
  for (let i = 1; i < way.toGate.length; i++) n += Math.hypot(way.toGate[i].x - way.toGate[i - 1].x, way.toGate[i].z - way.toGate[i - 1].z);
  return n;
}

// The park as they find it on the way in (0.1.217): its lamps and planters along the paths, litter, how busy it is, the
// price against what guests think fair. Inside withPark.
function takeIn(rec, park) {
  const cover = coverageNow();
  const tags = arrivalTags({ lamps: cover.lamps, planters: cover.planters, litter: park.litter ?? 0, guestsPerDay: guestDemand(), price: admission(), fair: fairPrice(park.rating?.stars ?? 0, BALANCE), time: world.getTimeOfDay(), clear: weatherNow() === "Clear", walk: walkLength(getHome(rec.homeId)) }, BALANCE.residents);
  meet(rec, tags);
}

// In through the gate: the park's admission, once a day, and one more guest in the day's numbers.
function pay(rec, home) {
  const park = parkById(home?.parkId ?? rec.parkId);
  if (!park) return;
  withPark(park, () => {
    try {
      takeIn(rec, park);
    } catch (error) {
      log(`residents: ${rec.id}: taking in the park: ${error}`);
    }
    const price = admission();
    const res = residentById(rec.id);
    const r = price > 0 ? earn(price, `${res?.name ?? "A resident"} came in`, `resident:${rec.id}:${world.getDay()}`) : { ok: false };
    if (r.duplicate) return;
    recordVisitors({ guests: 1, revenue: r.ok ? price : 0 });
  });
}

/** Every tick: walk the residents on their way one step along it, body or not. */
export function tickResidentMoves() {
  const g = BALANCE.residents;
  const sp = g.space;
  const all = allResidents();
  // 0.1.228: where everyone is, for the queue (spaceRules.js): walking = on a route and not standing for a talk.
  const places = all.map((x) => ({ id: x.id, dimension: x.dimension, pos: x.pos, yaw: x.yaw ?? 0, walking: Boolean(run.get(x.id)?.route) && !run.get(x.id)?.held && x.state !== "asleep", to: run.get(x.id)?.route?.[run.get(x.id).wp], waitsFor: run.get(x.id)?.route ? run.get(x.id).waitsFor : undefined }));
  for (let n = 0; n < all.length; n++) {
    const rec = all[n];
    const r = run.get(rec.id);
    if (rec.state === "following") {
      // 0.1.223: walking the player's footsteps
      if (r) followStep(rec, r);
      continue;
    }
    // 0.1.228: standing still, facing the player whose menu of theirs is open; on with their walk when it closes.
    const talker = r && rec.state !== "asleep" ? talkingTo(rec) : undefined;
    if (talker) {
      if (!r.held) {
        r.held = true;
        places[n].walking = false;
        if (r.route) setWalking(rec, r, false);
      }
      if (!r.faced || system.currentTick % 10 === 0) {
        r.faced = true;
        face(rec, r, talker.location);
      }
      continue;
    }
    if (r?.held) {
      r.held = false;
      r.faced = false;
      if (r.route) setWalking(rec, r, true);
    }
    if (!r?.route) continue;
    let speed = walkSpeedOf(residentById(rec.id), g); // 0.1.222: Sheila's slow walk
    const back = rec.state === "rejoining"; // 0.1.223: on the way back from following someone
    if (back && !bodyOf(rec, r)) speed *= g.follow.backSpeed;
    if (back && system.currentTick % 5 === 0) doorsBehind(rec, r);
    const target = r.route[r.wp];
    if (!target) {
      endRoute(rec, r);
      continue;
    }
    const next = walkStep(rec.pos, target, speed);
    const e = bodyOf(rec, r);
    // 0.1.228: the queue (only where someone could see it: a resident with a body): wait behind whoever is ahead, then
    // walk past a slower or standing one.
    const blocker = blockerOf({ id: rec.id, pos: rec.pos, next, yaw: next.yaw, to: target }, places.filter((o) => o.dimension === rec.dimension), sp);
    // Someone already stands where they were going to watch the animals from: they stop here, behind them, and watch.
    const last = r.route[r.route.length - 1];
    if (blocker && !blocker.walking && r.then === "watch" && r.wp === r.route.length - 1 && !target.do && Math.hypot(blocker.pos.x - last.x, blocker.pos.z - last.z) < sp.standRoom) {
      if (r.wait >= 3) setWalking(rec, r, true);
      r.wait = 0;
      places[n].walking = false;
      endRoute(rec, r);
      continue;
    }
    if (e && !(r.passUntil > system.currentTick)) {
      if (blocker) {
        r.wait = (r.wait ?? 0) + 1;
        if (r.wait < waitFor(blocker, n, sp)) {
          if (r.wait === 3) setWalking(rec, r, false); // standing in the queue
          places[n].walking = false;
          places[n].waitsFor = blocker.id;
          r.waitsFor = blocker.id;
          continue;
        }
        r.passUntil = system.currentTick + Math.round(sp.passSeconds * 20);
      }
    }
    if (r.wait >= 3) setWalking(rec, r, true);
    r.wait = 0;
    r.waitsFor = undefined;
    if (e) {
      // their lane: drawn to the right of the line, eased round corners and in to the line where the walk ends
      const end = r.route[r.route.length - 1];
      const share = laneShare(Math.hypot(end.x - next.x, end.z - next.z), sp);
      r.lane = easeLane(r.lane ?? { x: 0, z: 0 }, laneTarget(next.yaw, sp.lane * share), sp.ease);
      try {
        e.teleport({ x: next.x + r.lane.x, y: next.y, z: next.z + r.lane.z }, { rotation: { x: 0, y: next.yaw }, keepVelocity: false });
      } catch {
        dropBody(rec, r); // the ground ahead unloaded: it walks on without a body
      }
    } else r.lane = undefined;
    rec.pos = { x: next.x, y: next.y, z: next.z };
    rec.yaw = next.yaw;
    places[n].pos = rec.pos;
    places[n].yaw = rec.yaw;
    if (!next.arrived) continue;
    if (target.do && !act(rec, r, target.do)) continue;
    r.wp++;
    if (back && r.route[r.wp]) footstepShut(rec, r, r.route[r.wp]); // a shut door on the way back, opened
    if (r.wp >= r.route.length) endRoute(rec, r);
  }
}

// --- the day ---

const searches = jobQueue((gen) => system.runJob(timedJob("residentroutes", gen)), (error) => log(`residents: a route search failed: ${error}`));

// A route over a park's paths from where the resident stands to `toNode`, as feet positions, to `done` (undefined when
// there's none).
function planRoute(rec, r, net, toNode, done) {
  const from = nearestNode(net, blockOf(rec.pos), BALANCE.guests.routeReach);
  if (!from) return done(undefined);
  r.planning = true;
  const d = dim(rec.dimension);
  searches.push((function* () {
    let route;
    try {
      route = yield* routeSearch(net, from, toNode, BALANCE.paths.maxNodes, BALANCE.guests.searchPerTick);
    } finally {
      r.planning = false;
    }
    if (!db.get(COL, rec.id)) return;
    if (!route) return done(undefined);
    const top = (x, y, z) => {
      try {
        const b = d.getBlock({ x, y, z });
        if (b && /_slab$/.test(b.typeId)) return b.permutation.getState("minecraft:vertical_half") === "top" ? 1 : 0.5;
        return 1;
      } catch {
        return 1;
      }
    };
    done(waypoints(route).map((n) => feetAt(n, top)));
  })());
}

// Out the front door and along the path to the zoo.
function leave(rec, r, home) {
  const way = homeWay(home.id);
  if (!way || !home.door) return;
  const d = home.door;
  const pts = [];
  if (home.stand) pts.push(feet(home.stand));
  pts.push({ ...feet(d.inside), do: "open" });
  if (way.inside) pts.push({ ...feet(d.outside), do: ["close", "enter"] });
  else {
    pts.push({ ...feet(d.outside), do: "close" });
    for (const p of way.toGate) pts.push(p);
    pts.push({ ...way.parkGate, do: "enter" });
  }
  rec.state = "leaving";
  rec.wentDay = world.getDay();
  setRoute(rec, r, pts, "visit");
  db.put(COL, rec);
}

// The last bit home: along the home path (reversed), in at the front door, to their spot inside.
function homeTail(home, way) {
  const d = home.door;
  const pts = [];
  if (way && !way.inside) for (const p of reversed(way.toGate)) pts.push(p);
  pts.push({ ...feet(d.outside), do: "open" });
  pts.push({ ...feet(d.inside), do: "close" });
  if (home.stand) pts.push(feet(home.stand));
  return pts;
}

// Back home: over the park's paths to the gate (or to the door, for a home in the park), then the home path.
function goHome(rec, r, home, park) {
  const way = homeWay(home.id);
  if (!home.door) return;
  rec.state = "returning";
  rec.proud = undefined; // 0.1.224: a good shift's heart lasts one visit
  db.put(COL, rec);
  const cur = park ? withPark(park, () => currentNetwork()) : undefined;
  const ent = park?.entrance;
  const target = !cur || cur.dimension !== rec.dimension ? undefined : way?.inside ? way.doorNode : ent ? nearestNode(cur.net, { x: ent.x, y: ent.y, z: ent.z }, BALANCE.paths.startRange) : undefined;
  const tail = homeTail(home, way);
  if (!target) return setRoute(rec, r, tail, "home");
  planRoute(rec, r, cur.net, target, (path) => {
    if (rec.state !== "returning" || r.route) return;
    const pts = [...(path ?? [])];
    if (way && !way.inside) pts.push({ ...way.parkGate });
    setRoute(rec, r, [...pts, ...tail], "home");
  });
}

// Where to go next in the zoo: a Viewing Point, bench, stand, restroom or fountain on the park's paths, far ones first.
function visitStep(rec, r, park) {
  const now = system.currentTick;
  if (now < r.until || r.planning) return;
  r.until = now + 100; // until the walk below is found
  withPark(park, () => {
    const cur = currentNetwork();
    if (!cur || cur.dimension !== rec.dimension) return;
    const reach = BALANCE.guests.routeReach;
    const res = residentById(rec.id);
    const g = BALANCE.residents;
    // What each stop shows (0.1.217): its pull by what they like and dislike, and the tags it adds to the day.
    const tagged = (spot, stop) => {
      const tags = stopTags(stop, SPECIES, KIND_SPECIES, SERVICE_TAGS);
      return { ...spot, tags, pull: res ? stopPull(tags, res, g) : 1, fav: isFavourite(tags, res) };
    };
    const spots = [];
    for (const p of allPoints("viewpoint")) {
      if (!p.viewed || !p.spot || p.dimension !== rec.dimension) continue;
      const node = nearestNode(cur.net, p.spot, reach);
      if (!node) continue;
      const ex = p.exhibitId ? getExhibit(p.exhibitId) : undefined;
      const shown = ex?.animalIds?.length ? (ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : [])) : [];
      const young = Boolean(ex?.animalIds?.some((id) => getAnimal(id)?.juvenile)); // 0.1.220: Paola's babies
      spots.push(tagged({ id: p.id, ...p.spot, node, exhibitId: p.exhibitId }, { speciesIds: shown, young }));
    }
    for (const s of allServices()) {
      if (!WALK_TO.has(s.type) || s.problem || !s.spot || s.dimension !== rec.dimension) continue;
      const node = nearestNode(cur.net, s.spot, reach);
      if (node) spots.push(tagged({ id: s.id, ...s.spot, node }, { type: s.type, stock: s.stock }));
    }
    const here = blockOf(rec.pos);
    const away = spots.filter((s) => Math.hypot(s.x - here.x, s.z - here.z) > 4);
    // 0.1.222: the first stop of a visit is a favourite, when the park shows one (Carrot straight to the rabbits).
    const favs = r.watched.size ? [] : away.filter((s) => s.fav);
    const dest = pickDestination(favs.length ? favs : away, here, r.watched, Math.random);
    if (!dest) return;
    planRoute(rec, r, cur.net, dest.node, (path) => {
      if (!path || path.length < 2 || rec.state !== "visiting" || r.route) return;
      r.dest = dest;
      setRoute(rec, r, path, "watch");
    });
  });
}

function toBed(rec, r, home) {
  const pts = [];
  if (home.stand) pts.push(feet(home.stand));
  if (home.bed) {
    const b = bedSpot(home.bed);
    pts.push({ x: b.x, y: b.y, z: b.z });
  }
  if (!pts.length) {
    rec.state = "asleep";
    setSleeping(rec, r, true);
    db.put(COL, rec);
    return;
  }
  setRoute(rec, r, pts, "bed");
}

function wake(rec, r, home) {
  rec.state = "inside";
  setSleeping(rec, r, false);
  db.put(COL, rec);
  if (home.stand) setRoute(rec, r, [feet(home.stand)], "home");
}

function goIn(rec, r, home) {
  if (!home.door) return;
  rec.state = "returning";
  setRoute(rec, r, homeTail(home, undefined), "home");
  db.put(COL, rec);
}

/** Every second: each resident's day by the time of day, and their body by who's near. */
export function tickResidents() {
  const g = BALANCE.residents;
  const t = world.getTimeOfDay();
  const day = world.getDay();
  for (const rec of allResidents()) {
    const home = getHome(rec.homeId);
    const r = rt(rec.id);
    if (!home) {
      moveOut(rec);
      continue;
    }
    keepBody(rec, r);
    if (rec.state === "following" || rec.state === "staying") {
      try {
        followTick(rec, r); // 0.1.223
      } catch (error) {
        log(`residents: ${rec.id}: following: ${error}`);
      }
      continue;
    }
    if (r.route || r.planning) continue;
    if (r.held) continue; // 0.1.228: a player has their menu open: their work and their next walk wait
    // 0.1.224: work, when it's their shift (or they're at work, or on the way there or back).
    try {
      if (workTick(rec, r, home, t, day)) continue;
    } catch (error) {
      log(`residents: ${rec.id}: work: ${error}`);
      continue;
    }
    const park = parkById(home.parkId ?? rec.parkId);
    const phase = dayPhase(t, leaveAt(rec), scheduleOf(residentById(rec.id), g));
    const why = phase === "out" || rec.state === "visiting" || rec.state === "leaving" ? stayWhy(rec, day) : undefined;
    const move = nextMove(rec.state, phase, { homeWorks: homeWorks(home) && Boolean(homeWay(home.id)), houseOk: Boolean(home.door) && !HOUSE_GONE.has(home.problem), parkOpen: Boolean(park?.open && park.entrance), wentToday: rec.wentDay === day, goOut: !why });
    try {
      if (move === "leave") leave(rec, r, home);
      else if (move === "return") {
        if (rec.state === "visiting") tip(rec, park);
        goHome(rec, r, home, park);
      }
      else if (move === "sleep") toBed(rec, r, home);
      else if (move === "wake") wake(rec, r, home);
      else if (move === "goIn") goIn(rec, r, home);
      else if (rec.state === "visiting" && park) visitStep(rec, r, park);
    } catch (error) {
      log(`residents: ${rec.id}: ${error}`);
    }
  }
}

/**
 * Why a resident stays in today, or heads home early (0.1.222): "rest" (a day at home: rolled once, the first time
 * today's visit comes up, by their routine, their last visit's mood and their home's comfort), or the weather keeping
 * them in ("rain", "thunder"), else undefined: off they go.
 */
export function stayWhy(rec, day = world.getDay()) {
  const res = residentById(rec.id);
  if (!res) return undefined;
  const g = BALANCE.residents;
  if (rec.planDay !== day) {
    rec.planDay = day;
    rec.rest = restToday(res, day, moodNow(rec), comfortOf(rec).tier, g, bestTier(rec.id)); // 0.1.223: a good friend's more likely to come
    db.put(COL, rec);
  }
  return rec.rest ? "rest" : weatherStop(res, day, weatherNow(), g);
}

// Heading home from a visit (0.1.217): a happy resident tips into the park's Donation Boxes, once a day, if it has a
// working one (near a Viewing Point, as for guests). 0.1.222: more from a comfortable home.
function tip(rec, park) {
  const day = world.getDay();
  // 0.1.226: someone with a job but no work site: a happy visit may keep a work gift for each friend.
  if (rec.met?.day === day && rec.giftRollDay !== day && BALANCE.residents.gifts.dayGifts && !workKindOf(residentById(rec.id))) {
    rec.giftRollDay = day;
    keepGifts(rec.id, "day", moodOf(rec.met, BALANCE.residents, liftOf(rec)), undefined);
  }
  if (!park || rec.tipDay === day || rec.met?.day !== day) return;
  const res = residentById(rec.id);
  const comfort = comfortOf(rec);
  const coins = tipFor(moodOf(rec.met, BALANCE.residents, liftOf(rec)), res, BALANCE.residents, comfort.tier, bestTier(rec.id)); // 0.1.223: and tips more
  if (coins <= 0) return;
  withPark(park, () => {
    if (!donationBoxesWorking()) return;
    rec.tipDay = day;
    const r = earn(coins, `${res?.name ?? "A resident"} gave ${coins} coins at the Donation Boxes`, `tip:${rec.id}:${day}`);
    if (r.ok && !r.duplicate) recordVisitors({ revenue: coins });
  });
}

// --- following a player (0.1.223, stage C: Austin's spec section 8; the rules residents/followRules.js) ---
// Follow Me (from Friend, in their free time: bondRules.js followBlock) turns a resident at home or at the zoo into a
// follower ("following", rec.follow: { player, name, from (the state they left), why (waiting: "asked", "lost",
// "slow", "far", "gone"), home (heading home after) }). They walk the player's footsteps a step behind; Stay Here leaves
// them waiting ("staying"); Stop Following and Go Home send them back the way they came ("rejoining") to where they set
// off from, and on with their day, or home. Their bedtime ends it, wherever they are (stage D: a work shift starting
// will too). The trail and the way back are memory only: after a reload everyone starts at home, as ever.

const DOOR = /_door$/;
const GATE = /fence_gate$/;
const woodenDoor = (id) => DOOR.test(id) && id !== "minecraft:iron_door";

// The player a resident follows or waits for, when they're on and in the resident's dimension.
function leaderOf(rec) {
  const id = rec.follow?.player;
  if (!id) return undefined;
  const p = onlinePlayers().find((x) => x.id === id);
  return p?.isValid && p.dimension.id === rec.dimension ? p : undefined;
}

// Their walking look, set only when it changes.
function moving(rec, r, on) {
  if (Boolean(r.moving) === on) return;
  r.moving = on;
  setWalking(rec, r, on);
}

function face(rec, r, pos) {
  const e = bodyOf(rec, r);
  if (!e) return;
  try {
    rec.yaw = yawToward(rec.pos, pos);
    e.setRotation({ x: 0, y: rec.yaw });
  } catch {
    // unloaded
  }
}

// A line of theirs said to a player, in the chat.
function say(p, rec, key, note = undefined) {
  const res = residentById(rec.id);
  message(p, `§f${res?.name ?? "A resident"}: §7"${bondLine(res, key)}"${note ? ` §8${note}` : ""}`);
}

const openBlock = (b) => Boolean(b && (b.isAir || DOOR.test(b.typeId) || GATE.test(b.typeId) || PASSABLE_PATTERNS.some((re) => re.test(b.typeId))));

// A player's footstep (followRules.js footstepOk): where it is (in the air, on the ground under them:
// followRules.js groundUnder) and whether a resident can walk to it: how they stand, and the blocks at its feet and head.
// Returns { pos, ok }.
function footstepOf(p) {
  let riding = false;
  try {
    riding = Boolean(p.getComponent("minecraft:riding")?.entityRidingOn);
  } catch {
    riding = false;
  }
  const pos = { x: p.location.x, y: p.location.y, z: p.location.z };
  const f = { onGround: p.isOnGround, flying: p.isFlying, gliding: p.isGliding, swimming: p.isSwimming, climbing: p.isClimbing, riding, sleeping: p.isSleeping, inWater: p.isInWater, headOpen: false, headDry: false, feetBad: false };
  try {
    const d = p.dimension;
    if (!f.onGround && !f.flying && !f.gliding && !f.swimming && !f.climbing && !riding) {
      const at = blockOf(pos);
      const below = [];
      for (let k = 0; k <= Math.ceil(BALANCE.residents.follow.down); k++) {
        const b = d.getBlock({ x: at.x, y: at.y - k, z: at.z });
        below.push(!b ? "liquid" : b.isLiquid ? "liquid" : openBlock(b) ? "open" : "solid");
      }
      const y = groundUnder(pos.y, below);
      if (y !== undefined) {
        pos.y = y;
        f.onGround = true;
      }
    }
    const at = blockOf(pos);
    const feetB = d.getBlock(at);
    const headB = d.getBlock({ x: at.x, y: at.y + 1, z: at.z });
    f.feetBad = Boolean(feetB && FEET_BAD.test(feetB.typeId));
    f.headOpen = Boolean(headB && (headB.isLiquid || openBlock(headB)));
    f.headDry = Boolean(headB && !headB.isLiquid);
  } catch {
    f.headOpen = false;
  }
  return { pos, ok: footstepOk(f) };
}

// The door or fence gate in a cell (a door's lower half), if any.
function doorIn(d, cell) {
  try {
    let b = d.getBlock(cell);
    if (!b || !(DOOR.test(b.typeId) || GATE.test(b.typeId))) return undefined;
    if (DOOR.test(b.typeId) && b.permutation.getState("upper_block_bit")) b = d.getBlock({ x: cell.x, y: cell.y - 1, z: cell.z });
    return b && (DOOR.test(b.typeId) || GATE.test(b.typeId)) ? b : undefined;
  } catch {
    return undefined;
  }
}

function setDoor(d, b, open) {
  b.setPermutation(b.permutation.withState("open_bit", open));
  d.playSound(open ? "random.door_open" : "random.door_close", { x: b.location.x + 0.5, y: b.location.y + 0.5, z: b.location.z + 0.5 });
}

// The way into a footstep (checked again each second while they wait): a shut wooden door there they open, where
// someone can see them, and shut again once past (doorsBehind); a shut iron door or fence gate stops a follower (they
// don't open gates: the animals). True when it's shut to them.
function footstepShut(rec, r, step) {
  const now = system.currentTick;
  if (step.checked !== undefined && now - step.checked < 20) return Boolean(step.shut);
  step.checked = now;
  step.shut = false;
  const d = dim(rec.dimension);
  const b = doorIn(d, blockOf(step));
  if (!b) return false;
  try {
    if (b.permutation.getState("open_bit")) return false;
    if (woodenDoor(b.typeId)) {
      if (bodyOf(rec, r)) {
        setDoor(d, b, true);
        (r.doors ??= []).push({ x: b.location.x, y: b.location.y, z: b.location.z });
      }
      return false;
    }
  } catch {
    return false;
  }
  step.shut = true;
  return true;
}

// Doors they opened on the way, shut again once they're through (all of them when `all`).
function doorsBehind(rec, r, all = false) {
  if (!r.doors?.length) return;
  const d = dim(rec.dimension);
  r.doors = r.doors.filter((p) => {
    if (!all && Math.hypot(rec.pos.x - (p.x + 0.5), rec.pos.z - (p.z + 0.5)) < 1.6 && Math.abs(rec.pos.y - p.y) < 2) return true;
    try {
      const b = d.getBlock(p);
      if (b && woodenDoor(b.typeId) && b.permutation.getState("open_bit")) setDoor(d, b, false);
    } catch {
      // unloaded, or not a door any more
    }
    return false;
  });
}

// Nothing solid between two spots at feet or head height (doors aside: a wooden one is opened on the way), half a block
// at a time.
function clearLine(dimensionId, a, b) {
  const d = dim(dimensionId);
  const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) * 2);
  for (let i = 1; i < n; i++) {
    const f = i / n;
    const x = Math.floor(a.x + (b.x - a.x) * f);
    const y = Math.floor(a.y + (b.y - a.y) * f);
    const z = Math.floor(a.z + (b.z - a.z) * f);
    for (const dy of [0, 1]) {
      let blk;
      try {
        blk = d.getBlock({ x, y: y + dy, z });
      } catch {
        return false;
      }
      if (!openBlock(blk) && !blk?.isLiquid) return false;
    }
  }
  return true;
}

// A fresh trail behind a player: where they stand is its first footstep, walked straight to when they're near, on the
// level and nothing's in the way (they were in reach to ask: across a window or a fence it's a gap), else a gap.
function startTrail(rec, r, p) {
  const g = BALANCE.residents.follow;
  const t = newTrail();
  const pos = { x: p.location.x, y: p.location.y, z: p.location.z };
  const d = Math.hypot(pos.x - rec.pos.x, pos.z - rec.pos.z);
  t.last = pos;
  if (d >= g.step) t.ahead.push({ ...pos, gap: !(d <= g.startReach && Math.abs(pos.y - rec.pos.y) <= g.up && clearLine(rec.dimension, rec.pos, pos)) });
  r.trail = t;
  r.stuck = 0;
}

// A follower waits where they are (`why`: "asked" by Stay Here, "lost" (stuck with the player far off), "slow" (too
// far behind), "far" (as far from home as they'll go), "gone" (the player left, or went to another dimension)).
function toStay(rec, r, why, p = undefined) {
  rec.state = "staying";
  rec.follow = { ...(rec.follow ?? {}), why };
  r.trail = undefined;
  r.stuck = 0;
  moving(rec, r, false);
  doorsBehind(rec, r, true);
  db.put(COL, rec);
  if (p && (why === "lost" || why === "slow")) say(p, rec, "lost", "(they'll follow you again when you come back to them)");
  else if (p && why === "far") say(p, rec, "lost", "(that's as far from home as they'll go: Stop Following or Go Home)");
}

// Back the way they came to where they set off from (followRules.js backRoute), then on with their day, or home.
function rejoin(rec, r, goHomeAfter) {
  rec.follow = { ...(rec.follow ?? {}), home: goHomeAfter };
  rec.state = "rejoining";
  r.trail = undefined;
  r.stuck = 0;
  const pts = backRoute(r.back ?? []);
  r.back = undefined;
  setRoute(rec, r, pts.length ? pts : [{ x: rec.pos.x, y: rec.pos.y, z: rec.pos.z }], "rejoin");
  db.put(COL, rec);
}

// Every tick, a follower: the player's footstep taken, and a step along the trail (or a wait).
function followStep(rec, r) {
  const g = BALANCE.residents.follow;
  const p = leaderOf(rec);
  if (!p) return toStay(rec, r, "gone");
  const t = r.trail ?? (r.trail = newTrail());
  r.back ??= [{ x: rec.pos.x, y: rec.pos.y, z: rec.pos.z }];
  const pos = p.location;
  const last = t.ahead[t.ahead.length - 1] ?? t.last ?? rec.pos;
  if (Math.hypot(pos.x - last.x, pos.z - last.z) >= g.step || Math.abs(pos.y - last.y) >= 0.5) {
    const fs = footstepOf(p);
    addFootstep(t, rec.pos, fs.pos, fs.ok, g);
  }
  if (t.ahead.length > g.aheadMax) return toStay(rec, r, "slow", p);
  const next = t.ahead[0];
  const left = next ? wayLeft(rec.pos, t.ahead, g.gap + 1) : 0;
  const apart = Math.hypot(pos.x - rec.pos.x, pos.y - rec.pos.y, pos.z - rec.pos.z);
  const shut = next && !next.gap && left > g.gap ? footstepShut(rec, r, next) : false;
  const move = followMove({ next, left, shut, stuck: r.stuck ?? 0, apart }, g);
  if (move === "lost") return toStay(rec, r, "lost", p);
  if (system.currentTick % 5 === 0) doorsBehind(rec, r);
  if (move !== "walk") {
    r.stuck = move === "blocked" ? (r.stuck ?? 0) + 1 : 0;
    moving(rec, r, false);
    if (system.currentTick % 10 === 0) face(rec, r, pos);
    return;
  }
  r.stuck = 0;
  const step = walkStep(rec.pos, next, followPace(residentById(rec.id), wayLeft(rec.pos, t.ahead, g.jogFrom + 1), g));
  moving(rec, r, true);
  const e = bodyOf(rec, r);
  if (e) {
    try {
      e.teleport({ x: step.x, y: step.y, z: step.z }, { rotation: { x: 0, y: step.yaw }, keepVelocity: false });
    } catch {
      dropBody(rec, r);
    }
  }
  rec.pos = { x: step.x, y: step.y, z: step.z };
  rec.yaw = step.yaw;
  if (!step.arrived) return;
  t.ahead.shift();
  addBack(r.back, next, g);
  if (r.back.length > g.backMax) toStay(rec, r, "far", p);
}

// Every second, a follower or a waiting resident: bedtime sends them home, whoever they're with; a resident left
// behind ("lost", "slow", "gone") follows again when their player comes back to them.
function followTick(rec, r) {
  const g = BALANCE.residents;
  const res = residentById(rec.id);
  const p = leaderOf(rec);
  const near = (n) => p && Math.hypot(p.location.x - rec.pos.x, p.location.y - rec.pos.y, p.location.z - rec.pos.z) <= n;
  if (dayPhase(world.getTimeOfDay(), leaveAt(rec), scheduleOf(res, g)) === "night") {
    if (near(g.spawnRange)) say(p, rec, "late");
    return rejoin(rec, r, true);
  }
  // 0.1.224: their work shift starting (with a work site that works) sends them home, and off to work from there.
  if (onShift(rec)) {
    if (near(g.spawnRange)) sayWork(p, rec);
    return rejoin(rec, r, true);
  }
  if (rec.state === "staying" && ["lost", "slow", "gone"].includes(rec.follow?.why) && near(g.follow.findRange)) {
    rec.state = "following";
    rec.follow = { ...rec.follow, why: undefined };
    startTrail(rec, r, p);
    db.put(COL, rec);
    say(p, rec, "found");
  }
}

/** Why a resident won't follow this player now (bondRules.js followBlock), or undefined when they will. */
export function followWhy(player, rec) {
  const g = BALANCE.residents;
  const phase = dayPhase(world.getTimeOfDay(), leaveAt(rec), scheduleOf(residentById(rec.id), g));
  const r = rt(rec.id);
  return followBlock({ state: rec.state, phase, tier: tierWith(rec.id, player.id), working: onShift(rec), leader: rec.follow?.player, me: player.id, sameDimension: player.dimension.id === rec.dimension, far: (r.back?.length ?? 0) > g.follow.backMax }, g.bonds);
}

/** Follow Me: they follow the player from here (or again, waiting). Returns followWhy's reason when they won't. */
export function followMe(player, rec) {
  const why = followWhy(player, rec);
  if (why) return why;
  const r = rt(rec.id);
  if (rec.state === "staying" || rec.state === "following") rec.follow = { ...rec.follow, player: player.id, name: player.name, why: undefined };
  else {
    rec.follow = { player: player.id, name: player.name, from: rec.state };
    r.back = [{ x: rec.pos.x, y: rec.pos.y, z: rec.pos.z }];
  }
  r.route = undefined;
  r.then = undefined;
  r.dest = undefined;
  r.wp = 0;
  rec.state = "following";
  startTrail(rec, r, player);
  moving(rec, r, false);
  db.put(COL, rec);
  return undefined;
}

/** Stay Here: their player's follower waits where they are. False when they aren't following that player. */
export function stayHere(player, rec) {
  if (rec.state !== "following" || rec.follow?.player !== player.id) return false;
  toStay(rec, rt(rec.id), "asked");
  return true;
}

/** Stop Following: back the way they came and on with their day. False when they aren't following (or waiting). */
export function stopFollowing(player, rec) {
  if (!(rec.state === "staying" || (rec.state === "following" && rec.follow?.player === player.id))) return false;
  rejoin(rec, rt(rec.id), false);
  return true;
}

/** Whether a resident can be asked to go home now: at the zoo, following or waiting, with a home to go into. */
export function canSendHome(rec) {
  const home = getHome(rec.homeId);
  return ["visiting", "following", "staying"].includes(rec.state) && Boolean(home?.door) && !HOUSE_GONE.has(home.problem);
}

/**
 * Go Home: from the zoo, home now (a tip on the way out, as any visit ends); following or waiting, back the way they
 * came and home. Returns "house" (their home needs fixing), "other" (someone else's follower), "not" (not out), or
 * undefined: off they go.
 */
export function sendHome(player, rec) {
  const home = getHome(rec.homeId);
  if (!home?.door || HOUSE_GONE.has(home.problem)) return "house";
  const r = rt(rec.id);
  if (rec.state === "following" && rec.follow?.player !== player.id) return "other";
  if (rec.state === "following" || rec.state === "staying") {
    rejoin(rec, r, true);
    return undefined;
  }
  if (rec.state !== "visiting") return "not";
  r.route = undefined;
  r.then = undefined;
  r.dest = undefined;
  const park = parkById(home.parkId ?? rec.parkId);
  tip(rec, park);
  goHome(rec, r, home, park);
  return undefined;
}

/** Bench only: a follower's trail, for the log. */
export function followDebug(rec) {
  const r = run.get(rec.id);
  return { state: rec.state, follow: rec.follow, ahead: r?.trail?.ahead?.length ?? 0, gaps: r?.trail?.ahead?.filter((s) => s.gap).length ?? 0, back: r?.back?.length ?? 0, stuck: r?.stuck ?? 0, doors: r?.doors?.length ?? 0, route: r?.route?.length ?? 0, wp: r?.wp ?? 0 };
}

// --- work (0.1.224, stage D: research/npc_spec_plan.md section 8; the rules residents/workRules.js, the sites work.js) ---
// A resident with work (data/residents.js `work`: Dave's mine) and a work site that works walks there for their shift
// ("toWork": out of the front door, along the path to the site's gate, in through it and shut behind them), works it
// ("working": over the site's floor to an ore in reach, a while at it by their skill, its ore into the work chest, then
// the next), and walks home ("fromWork") when the shift ends, the shift's work is done (the site's capacity), nothing
// is left in reach that they can work, or the work chest is full. When the site stops working while they're there they
// stop and wait, and carry on if it's put right before the shift ends. Each shift's work is `rec.job` ({ key: the
// shift, done, over, why, good }); a good shift (g.goodShift or more) counts toward their skill (`rec.goodShifts`) and
// starts their next visit a heart happier (`rec.proud`). The walk and what they're working are memory only: after a
// reload everyone starts at home, as ever, and sets off again if it's still their shift.
// 0.1.225: the work follows their kind (workRules.js WORK_KINDS): Dave's ores, Paola's trees (and, Skilled, planting and
// picking up what falls), Ron's ripe crops (and, Skilled, sowing). Each task is done by work.js workTask; a shift counts
// each kind of task in `job.counts`.

const WORKING = "zoocraft:working";
// What a worker says when their shift starting ends a follow: their own `work` line (data/residents.js), else this.
const WORK_LINES = ["My shift's starting. I have to get to work. See you later!"];

function sayWork(p, rec) {
  const res = residentById(rec.id);
  const pool = res?.lines?.work?.length ? res.lines.work : WORK_LINES;
  message(p, `§f${res?.name ?? "A resident"}: §7"${pool[Math.floor(Math.random() * pool.length)]}"`);
}
const WORK_STATES = new Set(["toWork", "working", "fromWork"]);
const k3 = (p) => `${p.x},${p.y},${p.z}`;

function workLook(rec, r, on) {
  if (Boolean(r.digging) === on) return;
  r.digging = on;
  const e = bodyOf(rec, r);
  if (!e) return;
  try {
    e.setProperty(WORKING, on);
  } catch {
    // unloaded under it
  }
}

// Their shift, when it's on now ({ from, to }), else undefined.
function shiftNow(rec, t = world.getTimeOfDay()) {
  const s = shiftOf(residentById(rec.id), leaveAt(rec), BALANCE.residents.work);
  return s && inShift(t, s) ? s : undefined;
}

// This shift's work (rec.job), a fresh one when a new shift has begun.
function jobFor(rec, s, t = world.getTimeOfDay(), day = world.getDay()) {
  const k = shiftKey(t, day, s);
  if (rec.job?.key !== k) rec.job = { key: k, done: 0 };
  return rec.job;
}

/** Whether a resident is on a work shift now: one with a site that works, this shift not over. */
export function onShift(rec) {
  if (WORK_STATES.has(rec.state)) return rec.state !== "fromWork";
  const s = shiftNow(rec);
  if (!s) return false;
  const site = siteOf(rec.id);
  if (!siteWorks(site)) return false;
  const k = shiftKey(world.getTimeOfDay(), world.getDay(), s);
  return !(rec.job?.key === k && rec.job.over);
}

/** Whether a site's worker is there or on the way (its checks come round sooner). */
export function siteBusy(site) {
  const rec = site?.worker ? db.get(COL, site.worker) : undefined;
  return Boolean(rec && WORK_STATES.has(rec.state));
}

// A gate on the way, opened or shut ({ gate, open, site }): only where someone can see it, as their front door.
function workGate(rec, r, a) {
  sitePassing(a.site, a.open);
  if (!bodyOf(rec, r) && nearestPlayer(rec.dimension, a.gate) > BALANCE.residents.spawnRange) return;
  try {
    const d = dim(rec.dimension);
    const b = d.getBlock(a.gate);
    if (!b || !GATE.test(b.typeId) || b.permutation.getState("open_bit") === a.open) return;
    setDoor(d, b, a.open);
  } catch {
    // unloaded, or not a gate any more
  }
}

// Out of the front door, along the path to the site's gate (its check's `way`), in through it and shut behind them.
function goToWork(rec, r, home, site) {
  const d = home.door;
  const gate = site.gate;
  if (!d || !gate || !site.way?.length) return false;
  const pts = [];
  if (home.stand) pts.push(feet(home.stand));
  pts.push({ ...feet(d.inside), do: "open" });
  pts.push({ ...feet(d.outside), do: "close" });
  for (const p of site.way) pts.push(p);
  pts.push({ ...feet(gate.outside), do: { gate: gate.gate, open: true, site: site.id } });
  pts.push(feet(gate.gate));
  pts.push({ ...feet(gate.inside), do: { gate: gate.gate, open: false, site: site.id } });
  r.work = { siteId: site.id, way: site.way, gate };
  rec.state = "toWork";
  setRoute(rec, r, pts, "work");
  db.put(COL, rec);
  return true;
}

// A good shift counts toward their skill and makes them proud (their next visit a heart happier), once a shift.
function creditShift(rec) {
  const g = kindBalance(workKindOf(residentById(rec.id)), BALANCE.residents.work);
  const job = rec.job;
  if (!job || job.counted || !goodShift(job.done, g)) return;
  job.counted = true;
  job.good = true;
  const before = skillOf(rec.goodShifts, g);
  rec.goodShifts = (rec.goodShifts ?? 0) + 1;
  rec.proud = true;
  const after = skillOf(rec.goodShifts, g);
  // 0.1.226: a good shift, if they're content, may keep a work gift for each friend (handed over when they talk).
  keepGifts(rec.id, "work", moodNow(rec), after);
  if (after > before) {
    const res = residentById(rec.id);
    const site = siteOf(rec.id);
    const up = WORK_KINDS[workKindOf(res) ?? "mine"]?.skillUp ?? WORK_KINDS.mine.skillUp;
    const words = `§a${res?.name ?? "A resident"} is now ${after === 2 ? "an" : "a"} ${SKILL_NAMES[after]} ${res?.occupation ?? "worker"}! §f${up[after - 1] ?? ""}`;
    for (const p of onlinePlayers()) if (p.id === site?.owner || nearestPlayer(rec.dimension, rec.pos) <= BALANCE.residents.spawnRange) message(p, words);
  }
}

// Home from work: over the site's floor to the gate, out through it and shut behind them, back along the path, in at
// the front door.
function leaveWork(rec, r, home, why) {
  const g = BALANCE.residents.work;
  workLook(rec, r, false);
  const site = getSite(r.work?.siteId) ?? siteOf(rec.id);
  const gate = r.work?.gate ?? site?.gate;
  const way = r.work?.way ?? site?.way ?? [];
  if (rec.job) {
    rec.job.over = true;
    rec.job.why = rec.job.why ?? why;
  }
  creditShift(rec);
  r.dig = undefined;
  r.next = undefined;
  const pts = [];
  if (gate) {
    const m = site ? siteMemory(site.id) : undefined;
    const walk = m ? siteWalk(m.cells, blockOf(rec.pos), new Set([k3(gate.inside)]), g.maxDrop) : undefined;
    if (walk) for (const c of walk.slice(1)) pts.push(feet(c));
    pts.push({ ...feet(gate.inside), do: { gate: gate.gate, open: true, site: site?.id ?? r.work?.siteId } });
    pts.push(feet(gate.gate));
    pts.push({ ...feet(gate.outside), do: { gate: gate.gate, open: false, site: site?.id ?? r.work?.siteId } });
  }
  for (const p of reversed(way)) pts.push(p);
  for (const p of homeTail(home, undefined)) pts.push(p);
  rec.state = "fromWork";
  setRoute(rec, r, pts, "fromWork");
  db.put(COL, rec);
}

// At a task (the walk's end: an ore, a tree, a spot to plant, a crop): a while at it, by their skill, facing it.
function startDig(rec, r) {
  const t = r.next;
  r.next = undefined;
  if (!t) return;
  const g = kindBalance(workKindOf(residentById(rec.id)), BALANCE.residents.work);
  r.dig = { task: t, target: t.pos, stand: t.stand, until: system.currentTick + Math.round(taskSeconds(t.act ?? "mine", skillOf(rec.goodShifts, g), g) * 20) };
  face(rec, r, { x: t.pos.x + 0.5, y: t.pos.y, z: t.pos.z + 0.5 });
  workLook(rec, r, t.act !== "gather");
}

// The knock of the work, each second, where someone's near to hear it: a pick on stone, an axe on wood, a hoe in soil.
const DIG_SOUNDS = { mine: "hit.stone", cut: "hit.wood", plant: "hit.grass", harvest: "hit.grass", sow: "hit.grass" };
function digSound(rec, r) {
  const s = r.dig ? DIG_SOUNDS[r.dig.task?.act ?? "mine"] : undefined;
  if (!s || !bodyOf(rec, r)) return;
  try {
    dim(rec.dimension).playSound(s, { x: r.dig.target.x + 0.5, y: r.dig.target.y + 0.5, z: r.dig.target.z + 0.5 });
  } catch {
    // unloaded
  }
}

// Every second at work: the shift over, the site stopped working, a task finished, or the next one to walk to.
function atWork(rec, r, home, t, day) {
  const kind = workKindOf(residentById(rec.id)) ?? "mine";
  const g = kindBalance(kind, BALANCE.residents.work);
  const s = shiftNow(rec, t);
  const site = getSite(r.work?.siteId) ?? siteOf(rec.id);
  if (!s || !site || site.worker !== rec.id) return leaveWork(rec, r, home, "shift");
  const job = jobFor(rec, s, t, day);
  if (job.over) return leaveWork(rec, r, home, job.why);
  // Stopped while the site isn't right (a fence or the gate broken, the chest gone): they wait, and carry on if it's put
  // right in time. Not loaded or being measured: they wait too.
  const m = siteMemory(site.id);
  if (site.problem || !m || !siteFresh(site)) {
    job.wait = site.problem ?? "unchecked";
    workLook(rec, r, false);
    if (!m || !siteFresh(site)) queueSiteCheck(site.id);
    return;
  }
  job.wait = undefined;
  const skill = skillOf(rec.goodShifts, g);
  if (r.dig) {
    if (system.currentTick < r.dig.until) return digSound(rec, r);
    const got = workTask(site.id, r.dig.task ?? { act: "mine", pos: r.dig.target, stand: r.dig.stand }, skill);
    if (got.ok) {
      const act = got.act ?? "mine";
      job.done += TASK_UNITS[act] ?? 1;
      job.counts = { ...(job.counts ?? {}), [act]: (job.counts?.[act] ?? 0) + 1 };
      job.last = got.item;
      r.dig = undefined;
      workLook(rec, r, false);
      db.put(COL, rec);
    } else if (got.why === "stale" || got.why === "unloaded") {
      queueSiteCheck(site.id);
      r.dig.until = system.currentTick + 20; // again in a second, once it's measured
      return;
    } else if (got.why === "full" || got.why === "chest") {
      job.why = got.why;
      return leaveWork(rec, r, home, got.why);
    } else {
      r.dig = undefined;
      workLook(rec, r, false);
    }
  }
  if (job.done >= capacityOf(site.cells, g)) {
    job.why = "done";
    return leaveWork(rec, r, home, "done");
  }
  // The next task they can do, the nearest over the floor (a Skilled tree chopper's tidying last).
  let can = m.targets.filter((o) => canDo(o, skill));
  if (!can.length && kind === "woodlot" && skill >= 1) can = gatherTasks(site.id);
  if (!can.length) {
    job.why = m.targets.some((o) => (o.act ?? "mine") === "mine" || o.act === "cut") ? "skill" : "none";
    return leaveWork(rec, r, home, job.why);
  }
  const here = blockOf(rec.pos);
  const atHere = can.find((o) => k3(o.stand) === k3(here));
  if (atHere) {
    r.next = atHere;
    return startDig(rec, r);
  }
  const path = siteWalk(m.cells, here, new Set(can.map((o) => k3(o.stand))), g.maxDrop);
  if (!path) {
    // Not on the site's floor (it changed under them): back in from the gate.
    if (site.gate && k3(here) !== k3(site.gate.inside)) setRoute(rec, r, [feet(site.gate.inside)], "dig");
    else {
      job.why = "none";
      leaveWork(rec, r, home, "none");
    }
    return;
  }
  const end = path[path.length - 1];
  r.next = can.find((o) => k3(o.stand) === k3(end));
  setRoute(rec, r, path.slice(1).map((c) => feet(c)), "dig");
}

// Every second, before the rest of their day: a resident on their way to or from work, at work, or at home when their
// shift's on. True when work took this second.
function workTick(rec, r, home, t, day) {
  if (rec.state === "toWork") {
    // Their walk there ended without arriving (it was cleared): back home.
    leaveWork(rec, r, home, "shift");
    return true;
  }
  if (rec.state === "working") {
    atWork(rec, r, home, t, day);
    return true;
  }
  if (rec.state === "fromWork") {
    rec.state = "inside";
    db.put(COL, rec);
    return false;
  }
  if (rec.state !== "inside" || !home.door || HOUSE_GONE.has(home.problem)) return false;
  const s = shiftNow(rec, t);
  if (!s) return false;
  const site = siteOf(rec.id);
  if (!siteWorks(site)) return false;
  const job = jobFor(rec, s, t, day);
  if (job.over) return false;
  return goToWork(rec, r, home, site);
}

/** What a resident's work is like now, for their page and the Work Anchor: their site, skill, this shift. */
export function workState(rec) {
  const g = BALANCE.residents.work;
  const res = residentById(rec.id);
  const kind = workKindOf(res);
  if (!kind) return undefined;
  const site = siteOf(rec.id);
  const s = shiftOf(res, leaveAt(rec), g);
  const t = world.getTimeOfDay();
  const key = s ? shiftKey(t, world.getDay(), s) : undefined;
  const job = rec.job?.key === key && inShift(t, s) ? rec.job : undefined;
  return { kind, site, siteId: site?.id, works: siteWorks(site), shift: s, onNow: inShift(t, s), job, last: rec.job, goodShifts: rec.goodShifts ?? 0, skill: skillOf(rec.goodShifts, g), proud: Boolean(rec.proud) };
}

/** Bench only: a worker's walk and work, for the log. */
export function workDebug(rec) {
  const r = run.get(rec.id);
  return { state: rec.state, job: rec.job, goodShifts: rec.goodShifts ?? 0, proud: rec.proud, dig: r?.dig, digging: Boolean(r?.digging), route: r?.route?.length ?? 0, wp: r?.wp ?? 0, then: r?.then, site: r?.work?.siteId };
}

// --- moving in and out (the mailbox's menu) ---

/** A resident moves into a home at once: they arrive at the front door and go in. */
export function moveIn(home, id) {
  if (!home?.door || db.get(COL, id) || residentOfHome(home.id) || !residentById(id)) return false;
  const rec = { id, homeId: home.id, parkId: home.parkId, dimension: home.dimension, state: "returning", pos: feet(home.door.outside), leaveAt: leaveTimeOf(residentById(id), BALANCE.residents), wentDay: -1 };
  db.put(COL, rec);
  const r = rt(id);
  keepBody(rec, r); // seen arriving, if anyone's near
  setRoute(rec, r, homeTail(home, undefined), "home");
  return true;
}

export function moveOut(rec) {
  workerGone(rec.id); // 0.1.224
  const r = rt(rec.id);
  dropBody(rec, r);
  db.remove(COL, rec.id);
  run.delete(rec.id);
}

/**
 * A resident's body died after all (0.1.220: nothing hurts them, but /kill still ends a body): they're back home at once,
 * as a player comes back at their bed: asleep in it by night, up beside it by day (the home's free spot), with nothing
 * about them changed.
 */
export function residentDied(entity) {
  if (entity?.typeId !== ENTITIES.resident) return;
  const id = entity.id;
  const rec = allResidents().find((x) => x.entityId === id);
  if (!rec) return;
  const r = rt(rec.id);
  r.entity = undefined;
  r.route = undefined;
  r.then = undefined;
  r.planning = false;
  r.trail = undefined; // 0.1.223: no longer following anyone
  r.back = undefined;
  r.doors = [];
  r.moving = false;
  r.work = undefined; // 0.1.224: no longer at work
  r.next = undefined;
  r.dig = undefined;
  r.digging = false;
  rec.follow = undefined;
  rec.entityId = undefined;
  const home = getHome(rec.homeId);
  const night = dayPhase(world.getTimeOfDay(), leaveAt(rec), scheduleOf(residentById(rec.id), BALANCE.residents)) === "night";
  if (home?.bed && (night || !home.stand)) {
    const b = bedSpot(home.bed);
    rec.pos = { x: b.x, y: b.y, z: b.z };
    rec.yaw = b.yaw;
  } else if (home?.stand) rec.pos = feet(home.stand);
  rec.state = night ? "asleep" : "inside";
  db.put(COL, rec);
}

/** The mailbox was broken: its resident moves out. */
export function homeRemoved(home) {
  const rec = residentOfHome(home.id);
  if (rec) moveOut(rec);
}

/** After loading: everyone starts the session at home (their walks aren't saved), and stale bodies go. */
export function initResidents() {
  for (const rec of allResidents()) {
    const home = getHome(rec.homeId);
    if (!home) {
      db.remove(COL, rec.id);
      continue;
    }
    // 0.1.220: someone no longer listed (the four stand-ins Austin's residents replace) moves out, and the home is free.
    if (!residentById(rec.id)) {
      moveOut(rec);
      continue;
    }
    // 0.1.223: following someone, waiting for them or on the way back too: the trail isn't saved.
    if (["leaving", "visiting", "returning", "following", "staying", "rejoining", "toWork", "working", "fromWork"].includes(rec.state)) {
      rec.state = "inside";
      if (home.stand) rec.pos = feet(home.stand);
      rec.follow = undefined;
      db.put(COL, rec);
    }
  }
  try {
    for (const e of dim("minecraft:overworld").getEntities({ type: ENTITIES.resident })) residentLoaded(e);
  } catch {
    // not ready
  }
}

/**
 * What the resident is doing, for their page (0.1.222: why they're in, and whether they work nights; 0.1.223: who they
 * follow or wait for, `leader` the name and `leaderId` the id, where they set off from and whether they're heading home).
 */
export function residentState(rec) {
  const g = BALANCE.residents;
  const res = residentById(rec.id);
  const phase = dayPhase(world.getTimeOfDay(), leaveAt(rec), scheduleOf(res, g));
  const went = rec.wentDay === world.getDay();
  return { state: rec.state, phase, why: phase === "out" && rec.state === "inside" && !went ? stayWhy(rec) : undefined, night: res?.shift === "night", leader: rec.follow?.name, leaderId: rec.follow?.player, from: rec.follow?.from, home: rec.follow?.home, site: WORK_KINDS[workKindOf(res)]?.site, wait: rec.state === "working" ? rec.job?.wait : undefined };
}

// Their leaving time by who they are (0.1.217: an early riser's earlier), kept up with the data as it changes.
function leaveAt(rec) {
  const res = residentById(rec.id);
  return res ? leaveTimeOf(res, BALANCE.residents) : rec.leaveAt;
}
