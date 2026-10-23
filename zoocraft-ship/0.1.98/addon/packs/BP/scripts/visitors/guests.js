import { system, world } from "@minecraft/server";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { log } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { SPECIES } from "../data/species.js";
import { getPark } from "../park/park.js";
import { arrivalSpots } from "../park/gate.js";
import { nearestExhibit, getExhibit, allExhibits } from "../exhibits/exhibits.js";
import { animalsIn, welfare } from "../animals/animals.js";
import { allPoints } from "./points.js";
import { allServices } from "./services.js";
import { visibleGuests } from "./demand.js";
import { yawToward } from "./sight.js";
import { currentNetwork } from "./network.js";
import { nearestNode, routeSearch, waypoints, feetAt, walkStep, pickDestination, routeTicks } from "./routes.js";
import { dim, onlinePlayers, message } from "../platform/mc.js";
import { guestLineFor, PLACES } from "../data/guestLines.js";
import { visitorMix, speciesOnShow, pickVisitorType, lookFor, typeOfLook, favouredExhibits, VISITOR_TYPES } from "./visitorMix.js";

// Visible guests (spec section 12, build plan C5): a few cosmetic people near players, standing in
// for the guests counted in numbers. They are never saved. Most arrive through the entrance gate,
// stroll along the paths from one Viewing Point, stand or bench to the next (guest.json: they
// prefer path blocks), stop at Viewing Points to watch the animals, and after a while walk back
// out through the gate. They don't pay or count; the numbers in visitors.js do that.
// Journeys (0.1.60, Austin: "allow NPCs to travel up stairs and across bridges to different far
// away exhibits"): the mob pathfinder only looks a few blocks around, so after a while strolling a
// guest picks a Viewing Point, stand or bench anywhere on the path network (far ones favoured),
// routes.js plans the way over the network (steps, stairs and bridges included, since the network
// walk already climbs them) and tickJourneys walks the guest along it a tick at a time, facing the
// way it goes, legs swinging (the zoocraft:walking property drives the walk animation). Leaving
// guests walk the network back to the entrance the same way. The vanilla strolling takes over at
// each end.
// Far travel (0.1.64, Austin: "extend further than 128 blocks ... scan within 500 blocks, do not
// take any shortcuts"): Minecraft only runs the chunks near a player, so a guest walking to the far
// side of a 500-block park would unload on the way. Out of every player's range a guest goes on as
// a ghost: its entity is taken away and its record keeps walking the route at the same pace,
// strolling, watching, setting off again and leaving on its own clock; when its spot comes back
// within range of a player (and the chunk is loaded) the entity is spawned again where the ghost
// has got to, on the same errand, in the same look. So the far exhibits get their visitors whether
// or not anyone is watching, and whoever is there sees them arrive. Routes over a big network are
// searched a slice a tick (routes.js routeSearch) so the game never stalls on one.
// Nether and End visitors (0.1.98, visitorMix.js): each new guest is an everyday guest or, as often as the park's
// Nether and End species call for, a themed visitor in its own look, with its own lines, heading for its
// dimension's exhibits first. The record (and so a ghost) keeps its type; a guest without one (a tour follower, a
// rider) is known by its look.

const LOOK = "zoocraft:look";
const WALKING = "zoocraft:walking";
// key -> guest record. The key is the entity id while the guest has an entity, a ghost token while it
// walks on out of range. { key, ghost, pos (feet), dimension, look, leaveAt, mode: "stroll" | "watch" |
// "travel" | "leave", until, watched: Set, tripAt, route, wp, then, dest, planning }
const live = new Map();
let demand = 0;
let nextArrival = 0;
let ghostSeq = 0;

export function setGuestDemand(perDay) {
  demand = perDay;
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

// The guest's entity, while it has one that is loaded.
function entityOf(s) {
  if (s.ghost) return undefined;
  // The entity from the last look while it's still there (0.1.96: a walking guest was looked up every tick).
  if (s.entity?.isValid && s.entityKey === s.key) return s.entity;
  const e = world.getEntity(s.key);
  s.entity = e;
  s.entityKey = s.key;
  return e?.isValid ? e : undefined;
}

const feetOf = (s) => ({ x: Math.floor(s.pos.x), y: Math.floor(s.pos.y), z: Math.floor(s.pos.z) });

function trigger(s, event) {
  const e = entityOf(s);
  if (!e) return;
  try {
    e.triggerEvent(event);
  } catch {
    // unloaded under it: it carries on as a ghost next tick
  }
}

function setWalking(s, on) {
  const e = entityOf(s);
  if (!e) return;
  try {
    e.setProperty(WALKING, on);
  } catch {
    // an older guest without the property
  }
}

function ghostCount() {
  let n = 0;
  for (const s of live.values()) if (s.ghost) n++;
  return n;
}

function presentCount() {
  return live.size - ghostCount();
}

// Inside the park: beside working Viewing Points, Snack Stands and Benches, away from players.
function parkSpots() {
  const spots = [];
  for (const rec of allPoints("viewpoint")) if (rec.viewed && rec.spot) spots.push({ dimension: rec.dimension, ...rec.spot });
  for (const rec of allServices()) if ((rec.type === "stand" || rec.type === "bench") && !rec.problem && rec.spot) spots.push({ dimension: rec.dimension, ...rec.spot });
  const g = BALANCE.guests;
  return spots.filter((s) => {
    const near = nearestPlayer(s.dimension, s);
    return near <= g.spawnRange && near >= g.minSpawnDistance && dim(s.dimension).isChunkLoaded(s);
  });
}

// Who's coming now: the share of each kind of visitor for the species on show.
export function currentMix() {
  return visitorMix(speciesOnShow(allExhibits()), SPECIES, BALANCE.guests.themedCap);
}

// The next guest's kind and look, for the guests here, the tour followers and the riders alike.
export function newVisitor(random = Math.random) {
  const type = pickVisitorType(currentMix(), random);
  return { type, look: lookFor(type, random) };
}

function spawnGuest() {
  const g = BALANCE.guests;
  const gate = arrivalSpots().filter((s) => nearestPlayer(s.dimension, s) <= g.spawnRange);
  const inside = parkSpots();
  const spots = gate.length && (!inside.length || Math.random() < g.atGateShare) ? gate : inside;
  if (!spots.length) return;
  const s = spots[Math.floor(Math.random() * spots.length)];
  try {
    const pos = { x: s.x + 0.5, y: s.y, z: s.z + 0.5 };
    const e = dim(s.dimension).spawnEntity(ENTITIES.guest, pos);
    const { type, look } = newVisitor();
    e.setProperty(LOOK, look);
    const [lo, hi] = g.lifetimeSeconds;
    live.set(e.id, { key: e.id, ghost: false, pos, dimension: s.dimension, look, type, bornAt: system.currentTick, leaveAt: system.currentTick + Math.round((lo + Math.random() * (hi - lo)) * 20), mode: "stroll", until: 0, watched: new Set(), tripAt: system.currentTick + tripDelay() });
  } catch {
    // The spot unloaded between the check and the spawn; try again next time.
  }
}

// Out of range: the entity goes, the record walks on as a ghost under a token key, so a stale entity
// left in an unloaded chunk is cleared when that chunk loads again (guestLoaded).
function toGhost(s) {
  const e = entityOf(s);
  if (e) {
    try {
      e.remove();
    } catch {
      // already gone
    }
  }
  live.delete(s.key);
  s.key = `ghost:${++ghostSeq}`;
  s.ghost = true;
  live.set(s.key, s);
}

// Back in range: a new entity where the ghost has got to, in the same look, on the same errand.
function materialize(s) {
  try {
    const e = dim(s.dimension).spawnEntity(ENTITIES.guest, s.pos);
    e.setProperty(LOOK, s.look);
    live.delete(s.key);
    s.key = e.id;
    s.ghost = false;
    live.set(e.id, s);
    if (s.mode === "travel" && s.route) {
      e.triggerEvent("zoocraft:travel");
      e.setProperty(WALKING, true);
    } else e.triggerEvent(`zoocraft:${s.mode}`);
    return true;
  } catch {
    return false; // the chunk went while we looked: still a ghost
  }
}

// A strolling guest who reaches a working Viewing Point stops, turns to the exhibit and watches.
function startWatching(s, now) {
  const g = BALANCE.guests;
  const at = s.pos;
  const point = allPoints("viewpoint").find(
    (p) => p.viewed && p.spot && p.exhibitId && !s.watched.has(p.id) && p.dimension === s.dimension && Math.hypot(p.spot.x + 0.5 - at.x, p.spot.z + 0.5 - at.z) <= g.watchRange && Math.abs(p.spot.y - at.y) <= 2
  );
  if (!point) return;
  s.watched.add(point.id);
  s.mode = "watch";
  const [lo, hi] = g.watchSeconds;
  s.until = now + Math.round((lo + Math.random() * (hi - lo)) * 20);
  trigger(s, "zoocraft:watch");
  const e = entityOf(s);
  const b = getExhibit(point.exhibitId)?.bbox;
  if (e && b) e.setRotation({ x: 0, y: yawToward(at, { x: (b.min.x + b.max.x + 1) / 2, y: at.y, z: (b.min.z + b.max.z + 1) / 2 }) });
}

function tripDelay() {
  const [lo, hi] = BALANCE.guests.tripAfterSeconds;
  return Math.round((lo + Math.random() * (hi - lo)) * 20);
}

// Every standing spot on the path network a guest could walk to: beside working Viewing Points,
// Snack Stands and Benches, anywhere in the park (not only near players).
function journeySpots(net, dimensionId) {
  const out = [];
  const reach = BALANCE.guests.routeReach;
  for (const rec of allPoints("viewpoint")) {
    if (!rec.viewed || !rec.spot || rec.dimension !== dimensionId) continue;
    const node = nearestNode(net, rec.spot, reach);
    if (node) out.push({ id: rec.id, ...rec.spot, node, exhibitId: rec.exhibitId, what: "viewpoint" });
  }
  for (const rec of allServices()) {
    if ((rec.type !== "stand" && rec.type !== "bench") || rec.problem || !rec.spot || rec.dimension !== dimensionId) continue;
    const node = nearestNode(net, rec.spot, reach);
    if (node) out.push({ id: rec.id, ...rec.spot, node, what: rec.type });
  }
  return out;
}

// The guests' route searches wait in one queue and run one after another in a single job (0.1.96, core/jobs.js).
const routes = jobQueue((gen) => system.runJob(timedJob("route", gen)), (error) => log(`guests: a route search failed: ${error}`));

// Plan a route from the guest to a spot's node over the network, a slice a tick, and hand `done`
// the waypoints as feet positions (undefined when the guest isn't on the network, the way is too
// long, or there is none). The guest keeps strolling while the search runs.
function planRoute(s, net, toNode, done) {
  const from = nearestNode(net, feetOf(s), BALANCE.guests.routeReach);
  if (!from) return done(undefined);
  s.planning = true;
  routes.push((function* () {
    let route;
    try {
      if (live.get(s.key) !== s) return; // gone while it waited its turn
      route = yield* routeSearch(net, from, toNode, BALANCE.paths.maxNodes, BALANCE.guests.searchPerTick);
    } finally {
      s.planning = false;
    }
    if (live.get(s.key) !== s) return; // gone while we searched
    if (!route || routeTicks(route, 1) > BALANCE.guests.tripRange) return done(undefined);
    const d = dim(s.dimension);
    const top = (x, y, z) => {
      try {
        const b = d.getBlock({ x, y, z });
        if (!b) return 1;
        if (/_slab$/.test(b.typeId)) return b.permutation.getState("minecraft:vertical_half") === "top" ? 1 : 0.5;
        return 1;
      } catch {
        return 1; // unloaded along the way: a full block
      }
    };
    done(waypoints(route).map((n) => feetAt(n, top)));
  })());
}

// Set off along a route: the vanilla goals stand down, the legs start swinging.
function startTravel(s, path, then, dest) {
  s.mode = "travel";
  s.route = path;
  s.wp = 1;
  s.then = then;
  s.dest = dest;
  s.until = system.currentTick + routeTicks(path, BALANCE.guests.walkSpeed) * 2 + 100; // patience: twice the walk
  trigger(s, "zoocraft:travel");
  setWalking(s, true);
}

// After strolling a while: pick somewhere else on the network and walk there.
function startJourney(s, now) {
  s.tripAt = now + tripDelay();
  if (s.planning) return;
  const cur = currentNetwork();
  if (!cur || cur.dimension !== s.dimension) return;
  const spots = journeySpots(cur.net, s.dimension).filter((sp) => Math.hypot(sp.x + 0.5 - s.pos.x, sp.z + 0.5 - s.pos.z) > 6);
  const favoured = s.type && s.type !== "any" ? favouredExhibits(s.type, allExhibits(), SPECIES) : undefined;
  const dest = pickDestination(spots, feetOf(s), s.watched, Math.random, favoured, BALANCE.guests.themedPull);
  if (!dest) return;
  planRoute(s, cur.net, dest.node, (path) => {
    if (path && path.length >= 2 && s.mode === "stroll") startTravel(s, path, "stroll", dest);
  });
}

// Time to go: walk the network back to the entrance, then the vanilla leaving takes it through the gate.
function startLeaving(s) {
  s.mode = "leave";
  trigger(s, "zoocraft:leave");
  const cur = currentNetwork();
  const park = getPark();
  if (!cur || !park?.entrance || cur.dimension !== s.dimension) return;
  const ent = park.entrance;
  const gateNode = nearestNode(cur.net, { x: ent.x, y: ent.y, z: ent.z }, BALANCE.paths.startRange);
  if (!gateNode) return;
  planRoute(s, cur.net, gateNode, (path) => {
    if (path && path.length >= 2 && s.mode === "leave") startTravel(s, path, "leave", undefined);
  });
}

// Arrived (or out of patience): back to the vanilla goals; a strolling guest looks for the animals.
function endTravel(s) {
  s.route = undefined;
  s.dest = undefined;
  setWalking(s, false);
  if (s.then === "leave") {
    s.mode = "leave";
    trigger(s, "zoocraft:leave");
  } else {
    s.mode = "stroll";
    s.tripAt = system.currentTick + tripDelay();
    trigger(s, "zoocraft:stroll");
  }
}

function step(s, now) {
  if (s.mode === "watch" && now >= s.until) {
    s.mode = "stroll";
    trigger(s, "zoocraft:stroll");
  }
  if (s.mode === "stroll" && now >= s.leaveAt) return startLeaving(s);
  if (s.mode === "travel" && now >= s.until) return endTravel(s);
  if (s.mode === "stroll") {
    startWatching(s, now);
    if (s.mode === "stroll" && now >= s.tripAt) startJourney(s, now);
  }
}

// Every tick: walk the travelling guests one step along their routes, entity or ghost alike.
export function tickJourneys() {
  const speed = BALANCE.guests.walkSpeed;
  for (const s of [...live.values()]) {
    if (s.mode !== "travel" || !s.route) continue;
    const target = s.route[s.wp];
    if (!target) {
      endTravel(s);
      continue;
    }
    const next = walkStep(s.pos, target, speed);
    const e = entityOf(s);
    if (e) {
      try {
        e.teleport({ x: next.x, y: next.y, z: next.z }, { rotation: { x: 0, y: next.yaw }, keepVelocity: false });
      } catch {
        toGhost(s); // the ground ahead unloaded: it walks on as a ghost
      }
    }
    s.pos = { x: next.x, y: next.y, z: next.z };
    if (next.arrived) {
      s.wp++;
      if (s.wp >= s.route.length) endTravel(s);
    }
  }
}

// A leaving guest goes once they're through the gate, or out of sight once they've had time.
function gone(s, near, now, park) {
  if (s.mode !== "leave") return false;
  const ent = park.entrance;
  const atGate = ent && ent.dimension === s.dimension && Math.hypot(ent.x + 0.5 - s.pos.x, ent.z + 0.5 - s.pos.z) <= 2 && Math.abs(ent.y - s.pos.y) <= 2;
  const late = now - s.leaveAt;
  const limit = BALANCE.guests.leaveSeconds * 20;
  return atGate || (late >= limit && near >= BALANCE.guests.minSpawnDistance) || late >= limit * 3;
}

// Every two seconds: move guests between strolling, watching and leaving, take away the ones who
// have left, turn the ones out of range into ghosts and ghosts back in range into people, and
// bring in one more now and then if the park is open and fewer are about than its popularity
// calls for.
export function tickGuests() {
  const park = getPark();
  const open = Boolean(park?.open && park.entrance);
  const g = BALANCE.guests;
  const now = system.currentTick;
  for (const s of [...live.values()]) {
    if (!open) {
      entityOf(s)?.remove();
      live.delete(s.key);
      continue;
    }
    if (s.ghost) {
      if (gone(s, Infinity, now, park)) {
        live.delete(s.key);
        continue;
      }
      const near = nearestPlayer(s.dimension, s.pos);
      if (near <= g.spawnRange && dim(s.dimension).isChunkLoaded(feetOf(s))) materialize(s);
    } else {
      const e = entityOf(s);
      if (!e) {
        // Unloaded under it (or taken away): it walks on as a ghost from where it was, if there is room.
        if (ghostCount() < g.maxGhosts) toGhost(s);
        else live.delete(s.key);
        continue;
      }
      s.pos = { x: e.location.x, y: e.location.y, z: e.location.z };
      const near = nearestPlayer(e.dimension.id, e.location);
      if (gone(s, near, now, park)) {
        e.remove();
        live.delete(s.key);
        continue;
      }
      if (near > g.spawnRange + 16) {
        if (ghostCount() < g.maxGhosts) toGhost(s);
        else {
          e.remove();
          live.delete(s.key);
        }
        continue;
      }
    }
    try {
      step(s, now);
    } catch {
      // The guest unloaded mid-step; it's sorted out next time.
    }
  }
  // The benchmark park (bench/) shows its own number of guests, arriving faster.
  const bench = park?.benchmark;
  if (!open || now < nextArrival || presentCount() >= (bench ? bench.guests : visibleGuests(demand, BALANCE))) return;
  nextArrival = now + (bench ? bench.arrivalSeconds : g.arrivalSeconds) * 20;
  spawnGuest();
  for (let k = 1; bench && k < bench.arrivals && presentCount() < bench.guests; k++) spawnGuest();
}

// Guests from an earlier session, or left behind by a ghost, aren't tracked: clear them away when
// their chunk loads.
export function guestLoaded(entity) {
  if (entity.typeId === ENTITIES.guest && !live.has(entity.id)) entity.remove();
}

export function clearGuests() {
  for (const id of ["overworld", "nether", "the_end"]) {
    try {
      for (const e of dim(id).getEntities({ type: ENTITIES.guest })) if (!live.has(e.id)) e.remove();
    } catch {
      // Dimension not available.
    }
  }
}

// What a guest says when a player talks to them (data/guestLines.js): the park's main complaint, or a goodbye on the
// way out, where it's heading, a greeting just after it came in, or something about the nearest exhibit.
export function guestLine(entity, complaint, detail) {
  const s = live.get(entity.id);
  const type = guestType(entity);
  const say = (situation, values) => guestLineFor(situation, type, values);
  const about = complaint === "services" ? detail : complaint;
  if (about && Math.random() < 0.6) {
    const line = say(about);
    if (line) return line;
  }
  if (s?.mode === "leave") return say("goodbye");
  if (s?.mode === "travel" && s.dest) return say("travel", { where: s.dest.what === "viewpoint" ? (getExhibit(s.dest.exhibitId)?.name ?? PLACES.viewpoint) : (PLACES[s.dest.what] ?? PLACES.viewpoint) });
  if (s && system.currentTick - (s.bornAt ?? -Infinity) < BALANCE.guests.greetSeconds * 20 && Math.random() < 0.5) return say("greeting");
  const ex = nearestExhibit(entity.dimension.id, entity.location, 32);
  const residents = ex ? animalsIn(ex) : [];
  if (!residents.length) return say("empty");
  const a = residents[Math.floor(Math.random() * residents.length)];
  const values = { name: a.name, kind: SPECIES[a.speciesId]?.displayName.toLowerCase() ?? "animal", exhibit: ex.name };
  const own = type !== "any" && SPECIES[a.speciesId]?.homeDimension === VISITOR_TYPES[type].dimension; // its own lines only about its own dimension's animals
  return guestLineFor(welfare(a) >= BALANCE.needs.bands.healthy ? "happy" : "glum", own ? type : "any", values);
}

// A guest's kind: its record's, or its look's when it has no record.
function guestType(entity) {
  const s = live.get(entity.id);
  if (s?.type) return s.type;
  try {
    return typeOfLook(Number(entity.getProperty(LOOK)));
  } catch {
    return "any";
  }
}

export function talk(player, entity, complaint, detail) {
  message(player, `§7${VISITOR_TYPES[guestType(entity)].label}: §f"${guestLine(entity, complaint, detail)}"`);
}
