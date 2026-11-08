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
import { yawToward } from "../visitors/sight.js";
import { getHome, homeWorks, homeWay } from "./homes.js";
import { bedSpot } from "./homeRules.js";
import { dayPhase, leaveTimeOf, nextMove, pickOffers, reversed, arrivalTags, stopTags, addMet, moodOf, tipFor, stopPull } from "./residentRules.js";
import { dim, onlinePlayers } from "../platform/mc.js";

const COL = "residents";
const WHO = "zoocraft:who";
const WALKING = "zoocraft:walking";
const SLEEPING = "zoocraft:sleeping";
const TAG = "zoocraft:resident";
// Home problems that keep a resident out of their house (the rest, a broken path say, don't stop them going in).
const HOUSE_GONE = new Set(["open", "small", "door", "bed", "taken", "dimension"]);

// resident id -> { route, wp, then, entity, planning, until, watched, dest } (memory only)
const run = new Map();
function rt(id) {
  let r = run.get(id);
  if (!r) run.set(id, (r = { route: undefined, wp: 0, then: undefined, entity: undefined, planning: false, until: 0, watched: new Set(), dest: undefined }));
  return r;
}

const feet = (c) => ({ x: c.x + 0.5, y: c.y, z: c.z + 0.5 });
const blockOf = (p) => ({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });

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

/** Who'd like to move into this home: residents nobody in the world houses yet, the same few all day. */
export function offersFor(home) {
  const housed = new Set(allResidents().map((r) => r.id));
  return pickOffers(RESIDENTS, housed, BALANCE.residents.offers, `${home.id}|${world.getDay()}`);
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
    e.setProperty(WALKING, Boolean(r.route));
    e.setProperty(SLEEPING, rec.state === "asleep");
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
  setWalking(rec, r, true);
}

function endRoute(rec, r) {
  const then = r.then;
  r.route = undefined;
  r.then = undefined;
  setWalking(rec, r, false);
  const home = getHome(rec.homeId);
  switch (then) {
    case "home":
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
        r.until = system.currentTick + Math.round((lo + Math.random() * (hi - lo)) * 20);
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
      if (a === "open" && rec.state === "returning" && (!home || HOUSE_GONE.has(home.problem))) {
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
  rec.mood = moodOf(rec.met, BALANCE.residents);
  rec.moodDay = day;
  db.put(COL, rec);
}

/** The likes and dislikes a resident has met today, or undefined before today's visit. */
export function todayMet(rec) {
  return rec?.met?.day === world.getDay() ? rec.met : undefined;
}

/** A resident's mood: their latest visit's, or where every visit starts. */
export function moodNow(rec) {
  return rec?.mood ?? BALANCE.residents.moodBase;
}

// The park as they find it on the way in (0.1.217): its lamps and planters along the paths, litter, how busy it is, the
// price against what guests think fair. Inside withPark.
function takeIn(rec, park) {
  const cover = coverageNow();
  const tags = arrivalTags({ lamps: cover.lamps, planters: cover.planters, litter: park.litter ?? 0, guestsPerDay: guestDemand(), price: admission(), fair: fairPrice(park.rating?.stars ?? 0, BALANCE) }, BALANCE.residents);
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
  const speed = BALANCE.residents.walkSpeed;
  for (const rec of allResidents()) {
    const r = run.get(rec.id);
    if (!r?.route) continue;
    const target = r.route[r.wp];
    if (!target) {
      endRoute(rec, r);
      continue;
    }
    const next = walkStep(rec.pos, target, speed);
    const e = bodyOf(rec, r);
    if (e) {
      try {
        e.teleport({ x: next.x, y: next.y, z: next.z }, { rotation: { x: 0, y: next.yaw }, keepVelocity: false });
      } catch {
        dropBody(rec, r); // the ground ahead unloaded: it walks on without a body
      }
    }
    rec.pos = { x: next.x, y: next.y, z: next.z };
    rec.yaw = next.yaw;
    if (!next.arrived) continue;
    if (target.do && !act(rec, r, target.do)) continue;
    r.wp++;
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
      return { ...spot, tags, pull: res ? stopPull(tags, res, g) : 1 };
    };
    const spots = [];
    for (const p of allPoints("viewpoint")) {
      if (!p.viewed || !p.spot || p.dimension !== rec.dimension) continue;
      const node = nearestNode(cur.net, p.spot, reach);
      if (!node) continue;
      const ex = p.exhibitId ? getExhibit(p.exhibitId) : undefined;
      const shown = ex?.animalIds?.length ? (ex.speciesIds ?? (ex.speciesId ? [ex.speciesId] : [])) : [];
      spots.push(tagged({ id: p.id, ...p.spot, node, exhibitId: p.exhibitId }, { speciesIds: shown }));
    }
    for (const s of allServices()) {
      if (!WALK_TO.has(s.type) || s.problem || !s.spot || s.dimension !== rec.dimension) continue;
      const node = nearestNode(cur.net, s.spot, reach);
      if (node) spots.push(tagged({ id: s.id, ...s.spot, node }, { type: s.type, stock: s.stock }));
    }
    const here = blockOf(rec.pos);
    const dest = pickDestination(spots.filter((s) => Math.hypot(s.x - here.x, s.z - here.z) > 4), here, r.watched, Math.random);
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
    if (r.route || r.planning) continue;
    const park = parkById(home.parkId ?? rec.parkId);
    const phase = dayPhase(t, leaveAt(rec), g);
    const move = nextMove(rec.state, phase, { homeWorks: homeWorks(home) && Boolean(homeWay(home.id)), houseOk: Boolean(home.door) && !HOUSE_GONE.has(home.problem), parkOpen: Boolean(park?.open && park.entrance), wentToday: rec.wentDay === day });
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

// Heading home from a visit (0.1.217): a happy resident tips into the park's Donation Boxes, once a day, if it has a
// working one (near a Viewing Point, as for guests).
function tip(rec, park) {
  const day = world.getDay();
  if (!park || rec.tipDay === day || rec.met?.day !== day) return;
  const res = residentById(rec.id);
  const coins = tipFor(moodOf(rec.met, BALANCE.residents), res, BALANCE.residents);
  if (coins <= 0) return;
  withPark(park, () => {
    if (!donationBoxesWorking()) return;
    rec.tipDay = day;
    const r = earn(coins, `${res?.name ?? "A resident"} gave ${coins} coins at the Donation Boxes`, `tip:${rec.id}:${day}`);
    if (r.ok && !r.duplicate) recordVisitors({ revenue: coins });
  });
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
  const r = rt(rec.id);
  dropBody(rec, r);
  db.remove(COL, rec.id);
  run.delete(rec.id);
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
    if (rec.state === "leaving" || rec.state === "visiting" || rec.state === "returning") {
      rec.state = "inside";
      if (home.stand) rec.pos = feet(home.stand);
      db.put(COL, rec);
    }
  }
  try {
    for (const e of dim("minecraft:overworld").getEntities({ type: ENTITIES.resident })) residentLoaded(e);
  } catch {
    // not ready
  }
}

/** What the resident is doing, for their page. */
export function residentState(rec) {
  const g = BALANCE.residents;
  return { state: rec.state, phase: dayPhase(world.getTimeOfDay(), leaveAt(rec), g) };
}

// Their leaving time by who they are (0.1.217: an early riser's earlier), kept up with the data as it changes.
function leaveAt(rec) {
  const res = residentById(rec.id);
  return res ? leaveTimeOf(res, BALANCE.residents) : rec.leaveAt;
}
