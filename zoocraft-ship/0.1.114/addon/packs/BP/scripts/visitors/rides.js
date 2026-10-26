import { system, world } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { pluralOf } from "../data/species.js";
import { posKey } from "../core/ids.js";
import { log } from "../core/log.js";
import { getPark, insidePark, anyMemberOnline, recordVisitors, inScopeAt, runLater, runTimeoutLater, withPark, parkById } from "../park/park.js";
import { earn } from "../economy/economy.js";
import { exhibitAt, getExhibit, allExhibits, releaseSpot } from "../exhibits/exhibits.js";
import { allAnimals, getAnimal, saveAnimal, animalsIn, speciesGroups, welfare, liveEntity, spawnInExhibit, despawn } from "../animals/animals.js";
import { steeredElsewhere } from "../animals/flight.js";
import { yawOf, pitchOf } from "../animals/glide.js";
import { pathLinked } from "./network.js";
import { rideSales, rideSeatsPerDay, planLoop, loopStep, stopLine } from "./rideRules.js";
import { dim, onlinePlayers, message } from "../platform/mc.js";
import { newVisitor } from "./guests.js";

// The Void Ray Expedition (0.1.66, Austin's idea 7). An Expedition Platform on the guest side sells
// rides on the park's own Void Rays: the owner assigns adult rays to the platform at its menu, guests
// buy rides as a share of the visitors (rideRules.js), and a ray with riders flies a loop from the
// platform straight up, over the park's exhibits (nearest first) and back down to land. Like the
// tours, the ride is real whether or not anyone watches: the ray's position moves along the loop
// every tick, and the ray (with its riders) is shown when a player is near. A ray only flies when it
// is well (welfare in the healthy band), so many rides a park day, and rests between rides; the rest
// of the time it lives in its exhibit as before. Only this module writes "platform" equipment
// records and an animal's onRide flag. A ride in progress is never saved: on reload the ray is put
// back in its exhibit and the next ride starts fresh.

const EQUIP = "equipment";
const RAY = "zoocraft:void_ray";
const LOOK = "zoocraft:look";
export const PLATFORM_TEXT = {
  outside: "Expedition Platform: outside the park. Guests only visit inside the park boundary.",
  inside: "Expedition Platform: this is inside an exhibit. Put it on the guest side of the fence.",
  path: "Expedition Platform: no guest path reaches it. Lay a path (gravel, bricks, planks...) from the Park Entrance Gate to right beside it.",
  sky: "Expedition Platform: something is in the way above it. Leave the sky over the platform open.",
  unchecked: "Expedition Platform: checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?",
};

const runs = new Map(); // ray (animal) id -> the ride in progress
const homing = new Set(); // ray ids whose mob still has to be put back in its exhibit
const nextRideAt = new Map(); // ray id -> game tick it may set off again
let lastCheck = -Infinity;

// --- records ---

// 0.1.111: the scope's park's platforms while a loop runs for one park (park/park.js inScopeAt).
export function allPlatforms() {
  return db.all(EQUIP).filter((e) => e.type === "platform" && inScopeAt(e));
}

export function workingPlatforms() {
  return allPlatforms().filter(working);
}

export function getPlatform(id) {
  const rec = db.get(EQUIP, id);
  return rec?.type === "platform" ? rec : undefined;
}

const working = (rec) => !rec.problem;

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "platform", blockId: block.typeId, dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, price: BALANCE.ride.defaultPrice, rayIds: [], soldDay: -1, soldToday: 0, waiting: 0, ridesToday: 0, carry: 0, linked: undefined, problem: "unchecked" };
    db.put(EQUIP, rec);
  }
  return rec;
}

// Today's counts, rolled over when the park day has changed (the ticket holders went home).
function today(rec) {
  const day = getPark()?.today.day ?? 0;
  if (rec.soldDay !== day) {
    rec.soldDay = day;
    rec.soldToday = 0;
    rec.waiting = 0;
    rec.ridesToday = 0;
    for (const id of rec.rayIds ?? []) {
      const a = getAnimal(id);
      if (a && a.ridesDay !== day) {
        a.ridesDay = day;
        a.ridesToday = 0;
        saveAnimal(a);
      }
    }
  }
  return rec;
}

function skyOpen(rec) {
  const d = dim(rec.dimension);
  if (!d.isChunkLoaded(rec.pos)) return undefined;
  for (let dy = 1; dy <= BALANCE.ride.skyClear; dy++) {
    for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      let b;
      try {
        b = d.getBlock({ x: rec.pos.x + dx, y: rec.pos.y + dy, z: rec.pos.z + dz });
      } catch {
        return undefined;
      }
      if (!b) return undefined;
      if (!b.isAir) return false;
    }
  }
  return true;
}

// Re-check where a platform stands, whether a path reaches it and whether the sky above is open.
export function checkPlatform(rec) {
  const linked = pathLinked(rec.dimension, rec.pos);
  if (linked !== undefined) rec.linked = linked;
  const sky = skyOpen(rec);
  if (sky !== undefined) rec.sky = sky;
  if (!insidePark(rec.dimension, rec.pos)) rec.problem = "outside";
  else if (exhibitAt(rec.dimension, rec.pos)) rec.problem = "inside";
  else if (rec.linked === false) rec.problem = "path";
  else if (rec.linked === undefined) rec.problem = "unchecked";
  else if (rec.sky === false) rec.problem = "sky";
  else rec.problem = undefined;
  db.put(EQUIP, rec);
  return rec;
}

export function checkAllPlatforms() {
  for (const rec of allPlatforms()) checkPlatform(rec);
}

// --- the rays: assigned at the platform's menu ---

// The park's grown Void Rays living in an exhibit in the platform's dimension, with the platform
// (if any) each is assigned to.
export function candidateRays(platform) {
  const out = [];
  for (const a of allAnimals()) {
    if (a.speciesId !== RAY || a.juvenile || a.location.kind !== "exhibit") continue;
    const ex = getExhibit(a.location.id);
    if (!ex || ex.dimension !== platform.dimension) continue;
    out.push({ animal: a, exhibit: ex, platform: platformOf(a.id) });
  }
  return out;
}

export function platformOf(rayId) {
  return allPlatforms().find((p) => (p.rayIds ?? []).includes(rayId));
}

export function assignRay(platform, rayId) {
  const r = BALANCE.ride;
  platform.rayIds = platform.rayIds ?? [];
  if (platform.rayIds.includes(rayId)) return { ok: true };
  if (platform.rayIds.length >= r.maxRays) return { ok: false, reason: `A platform works with ${r.maxRays} ray${r.maxRays === 1 ? "" : "s"} at most.` };
  const other = platformOf(rayId);
  if (other) {
    other.rayIds = other.rayIds.filter((id) => id !== rayId);
    db.put(EQUIP, other);
  }
  platform.rayIds.push(rayId);
  db.put(EQUIP, platform);
  return { ok: true };
}

export function releaseRay(platform, rayId) {
  platform.rayIds = (platform.rayIds ?? []).filter((id) => id !== rayId);
  db.put(EQUIP, platform);
  const run = runs.get(rayId);
  if (run) abandon(run, "released from the ride");
}

export function setRidePrice(platform, price) {
  platform.price = price;
  db.put(EQUIP, platform);
}

// Whether a ray can set off now, or why not (for the menu and the ride steps).
export function rayState(a, platform) {
  const r = BALANCE.ride;
  const run = runs.get(a.id);
  if (run) return { ready: false, text: runText(run) };
  if (homing.has(a.id)) return { ready: false, text: "On its way back to its exhibit" };
  if (a.location.kind !== "exhibit") return { ready: false, text: "Not in an exhibit" };
  if (welfare(a) < r.welfareMin) return { ready: false, text: `Not well enough to fly (welfare ${Math.round(welfare(a))}, needs ${r.welfareMin})` };
  if ((a.ridesToday ?? 0) >= r.ridesPerDay) return { ready: false, text: `Done for today (${r.ridesPerDay} rides a park day)` };
  if ((nextRideAt.get(a.id) ?? -Infinity) > system.currentTick) return { ready: false, text: "Resting between rides" };
  if (!platform || !working(platform)) return { ready: false, text: "The platform isn't working" };
  return { ready: true, text: `Ready (${a.ridesToday ?? 0} of ${r.ridesPerDay} rides today)` };
}

function runText(run) {
  const w = run.plan.waypoints[run.wp];
  if (run.phase === "board") return `Boarding ${run.riders} rider${run.riders === 1 ? "" : "s"} at the platform`;
  if (run.phase === "rest") return "Landed, resting on the platform";
  if (run.phase === "hover" && w?.kind === "stop") return `Hovering over ${w.name} with ${run.riders} rider${run.riders === 1 ? "" : "s"}`;
  if (w?.kind === "climb") return `Climbing from the platform with ${run.riders} rider${run.riders === 1 ? "" : "s"}`;
  if (w?.kind === "stop") return `Flying to ${w.name} with ${run.riders} rider${run.riders === 1 ? "" : "s"}`;
  if (w?.kind === "return") return "Flying back to the platform";
  return "Coming in to land";
}

export function raysOnDuty(platform) {
  if (!working(platform)) return [];
  return (platform.rayIds ?? []).map((id) => getAnimal(id)).filter((a) => a && a.location.kind === "exhibit");
}

// --- the loop ---

// Exhibits with animals in the platform's dimension, as stops (centre, roof height).
function stopsFor(platform) {
  const out = [];
  for (const ex of allExhibits()) {
    if (ex.dimension !== platform.dimension || !ex.bbox || !ex.animalIds?.length) continue;
    const b = ex.bbox;
    out.push({ exhibitId: ex.id, name: ex.name, x: (b.min.x + b.max.x + 1) / 2, y: b.min.y, z: (b.min.z + b.max.z + 1) / 2, top: b.max.y + 1 });
  }
  return out;
}

export function platformLoop(platform) {
  return planLoop(platform.pos, stopsFor(platform), BALANCE);
}

// --- ticket sales (one visitor step, from visitors.js) ---

export function rideStep(guests, stepKey) {
  const park = getPark();
  if (!park || guests <= 0) return;
  let income = 0;
  for (const platform of allPlatforms()) {
    today(platform);
    const duty = raysOnDuty(platform);
    if (!duty.length || !platformLoop(platform)) {
      platform.carry = 0;
      db.put(EQUIP, platform);
      continue;
    }
    const seatsLeft = Math.max(0, rideSeatsPerDay(duty.length, BALANCE) - platform.soldToday);
    const sale = rideSales({ guests, price: platform.price, seatsLeft, carry: platform.carry ?? 0 }, BALANCE);
    platform.carry = sale.carry;
    if (sale.sold > 0) {
      const res = earn(sale.revenue, `Expedition: ${sale.sold} ride${sale.sold === 1 ? "" : "s"} at ${platform.price}`, `ride:${platform.id}:${stepKey}`);
      if (res.ok && !res.duplicate) {
        platform.soldToday += sale.sold;
        platform.waiting += sale.sold;
        income += sale.revenue;
      }
    }
    db.put(EQUIP, platform);
  }
  if (income > 0) recordVisitors({ revenue: income });
}

// For the Park Ledger: platforms, rays assigned, today's rides and tickets.
export function rideSummary() {
  let rides = 0;
  let tickets = 0;
  let rays = 0;
  for (const p of allPlatforms()) {
    today(p);
    rides += p.ridesToday;
    tickets += p.soldToday;
    rays += (p.rayIds ?? []).length;
  }
  return { platforms: allPlatforms().length, working: workingPlatforms().length, rays, rides, tickets };
}

// --- a ride ---

function nearestPlayer(dimensionId, pos) {
  let best = Infinity;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== dimensionId) continue;
    const d = Math.hypot(p.location.x - pos.x, p.location.y - pos.y, p.location.z - pos.z);
    if (d < best) best = d;
  }
  return best;
}

// A ride sets off: the ray comes to the platform and waits while its riders climb on.
function startRide(a, platform, plan, now, forPlayer = undefined) {
  const r = BALANCE.ride;
  const riders = Math.min(r.seats - (forPlayer ? 1 : 0), platform.waiting);
  platform.waiting -= riders;
  db.put(EQUIP, platform);
  const run = { rayId: a.id, platformId: platform.id, parkId: getPark()?.id, dimension: platform.dimension, plan, wp: 0, pos: { ...plan.start }, phase: "board", until: now + r.boardSeconds * 20, riders, guests: [], forPlayer, stopIndex: 0, yaw: 0 };
  runs.set(a.id, run);
  a.onRide = true;
  saveAnimal(a);
  const e = liveEntity(a.id);
  if (e) {
    steeredElsewhere.add(e.id);
    try {
      e.teleport(run.pos, { rotation: { x: 0, y: 0 }, keepVelocity: false });
      setProps(e, false, true, false);
    } catch {
      // unloaded under us; shown again on the way
    }
  }
}

function setProps(e, gliding, resting, looping) {
  for (const [k, v] of [["zoocraft:gliding", gliding], ["zoocraft:resting", resting], ["zoocraft:looping", looping]]) {
    if (e.getProperty(k) !== v) e.setProperty(k, v);
  }
}

function rayEntity(run) {
  return liveEntity(run.rayId);
}

function playerRiders(e) {
  try {
    return (e.getComponent("minecraft:rideable")?.getRiders() ?? []).filter((r) => r.typeId === "minecraft:player");
  } catch {
    return [];
  }
}

function tell(run, text) {
  const e = rayEntity(run);
  if (!e) return;
  for (const p of playerRiders(e)) message(p, `§d${text}`);
}

// Over a stop: who lives there, for the riders.
function arriveAtStop(run, now) {
  const w = run.plan.waypoints[run.wp];
  run.phase = "hover";
  run.until = now + BALANCE.ride.hoverSeconds * 20;
  const ex = getExhibit(w.exhibitId);
  const animals = ex ? animalsIn(ex) : [];
  const groups = speciesGroups(animals).map((grp) => ({ name: grp.species.displayName.toLowerCase(), plural: pluralOf(grp.species).toLowerCase(), n: grp.animals.length }));
  tell(run, stopLine(run.stopIndex, run.plan.stops, ex?.name ?? w.name, groups));
  run.stopIndex += 1;
}

// Landed: everyone gets off, the ride counts, the ray rests on the platform before going home.
function land(run, now) {
  run.phase = "rest";
  run.until = now + BALANCE.ride.restSeconds * 20;
  tell(run, "Back on the platform. Thanks for flying with us!");
  const e = rayEntity(run);
  if (e) {
    try {
      e.getComponent("minecraft:rideable")?.ejectRiders();
      setProps(e, false, true, false);
    } catch {
      // gone
    }
  }
  for (const g of run.guests) removeGuest(g);
  run.guests = [];
  const platform = getPlatform(run.platformId);
  if (platform) {
    today(platform);
    platform.ridesToday += 1;
    db.put(EQUIP, platform);
  }
  const a = getAnimal(run.rayId);
  if (a) {
    const day = getPark()?.today.day ?? 0;
    if (a.ridesDay !== day) {
      a.ridesDay = day;
      a.ridesToday = 0;
    }
    a.ridesToday = (a.ridesToday ?? 0) + 1;
    a.ridesTotal = (a.ridesTotal ?? 0) + 1;
    saveAnimal(a);
  }
}

// The ride is over (or cut short): the ray goes back into its exhibit.
function endRun(run) {
  for (const g of run.guests) removeGuest(g);
  runs.delete(run.rayId);
  nextRideAt.set(run.rayId, system.currentTick + BALANCE.ride.restSeconds * 20);
  homing.add(run.rayId);
  goHome(run.rayId);
}

function abandon(run, why) {
  tell(run, `The ride is over early (${why}): the ray is going home.`);
  const e = rayEntity(run);
  if (e) {
    try {
      for (const p of playerRiders(e)) softLanding(p);
      e.getComponent("minecraft:rideable")?.ejectRiders();
    } catch {
      // gone
    }
  }
  endRun(run);
}

// A rider let go in mid-air floats down.
export function softLanding(player) {
  try {
    player.addEffect("slow_falling", BALANCE.rays.mount.floatTicks, { amplifier: 0, showParticles: false });
  } catch {
    // not a player any more
  }
}

// Where in its exhibit a ray goes back to: an air cell near the middle, else the middle of its box.
function homeSpot(ex) {
  const b = ex.bbox;
  const mid = { x: Math.floor((b.min.x + b.max.x) / 2), y: Math.floor((b.min.y + b.max.y) / 2), z: Math.floor((b.min.z + b.max.z) / 2) };
  const cell = releaseSpot(ex.id, mid, ["air", "land"]) ?? mid;
  return { x: cell.x + 0.5, y: cell.y + 0.6, z: cell.z + 0.5 };
}

// Put a ray back in its exhibit once its mob is loaded (right away if it is).
function goHome(rayId) {
  const a = getAnimal(rayId);
  if (!a) return homing.delete(rayId);
  const ex = a.location.kind === "exhibit" && getExhibit(a.location.id);
  const e = liveEntity(rayId);
  if (!ex?.bbox) {
    homing.delete(rayId);
    if (e) steeredElsewhere.delete(e.id);
    a.onRide = false;
    saveAnimal(a);
    return;
  }
  if (!e) {
    // The mob is somewhere unloaded along the loop: when its chunk loads it is moved (tickRides).
    return;
  }
  try {
    e.getComponent("minecraft:rideable")?.ejectRiders();
    e.teleport(homeSpot(ex), { keepVelocity: false });
    setProps(e, false, false, false);
  } catch {
    return;
  }
  steeredElsewhere.delete(e.id);
  homing.delete(rayId);
  a.onRide = false;
  saveAnimal(a);
}

// Every tick: fly every ride a step along its loop, shown or not.
export function tickRideFly() {
  const now = system.currentTick;
  const r = BALANCE.ride;
  for (const run of [...runs.values()]) {
    try {
      withPark(parkById(run.parkId), () => flyRun(run, now, r));
    } catch (error) {
      log(`rides: ${error}`);
    }
  }
}

// One ride's tick (0.1.114: inside its park's scope; `run.parkId` is the park the ride started in).
function flyRun(run, now, r) {
  if (run.phase === "board" || run.phase === "hover" || run.phase === "rest") {
    if (now < run.until) {
      holdEntity(run);
      return;
    }
    if (run.phase === "rest") {
      endRun(run);
      return;
    }
    if (run.phase === "hover") run.wp += 1;
    if (run.phase === "board") tell(run, "Hold on tight! Up we go.");
    run.phase = "fly";
  }
  const w = run.plan.waypoints[run.wp];
  if (!w) {
    land(run, now);
    return;
  }
  const vertical = w.kind === "climb" || w.kind === "land";
  const step = loopStep(run.pos, w, vertical ? r.climbSpeed : r.loopSpeed, r.reach);
  if (!vertical) run.yaw = yawOf(step.dx, step.dz);
  const dy = step.y - run.pos.y;
  run.pos = { x: step.x, y: step.y, z: step.z };
  moveEntity(run, dy);
  if (step.arrived) {
    if (w.kind === "stop") arriveAtStop(run, now);
    else if (w.kind === "land") land(run, now);
    else run.wp += 1;
  }
}

// The shown ray follows the ride's position: a nudge each tick, a teleport if it fell behind (0.1.70:
// back from 0.1.69's teleport every tick; the pushes were never the fault, see animals/mover.js).
function moveEntity(run, dy) {
  const e = rayEntity(run);
  if (!e) return;
  const p = e.location;
  const dx = run.pos.x - p.x;
  const dyy = run.pos.y - p.y;
  const dz = run.pos.z - p.z;
  const d = Math.hypot(dx, dyy, dz);
  if (d > 4) {
    e.teleport(run.pos, { rotation: { x: 0, y: run.yaw }, keepVelocity: false });
    return;
  }
  const k = d > 0.5 ? 0.5 / d : 1;
  e.clearVelocity();
  e.applyImpulse({ x: dx * k, y: dyy * k, z: dz * k });
  e.setRotation({ x: pitchOf({ x: 0, y: dy, z: Math.max(0.05, Math.hypot(dx, dz)) }), y: run.yaw });
  setProps(e, true, false, false);
}

// Hovering or waiting: held at the ride's position.
function holdEntity(run) {
  const e = rayEntity(run);
  if (!e) return;
  const p = e.location;
  const dx = run.pos.x - p.x;
  const dy = run.pos.y - p.y;
  const dz = run.pos.z - p.z;
  if (Math.hypot(dx, dy, dz) > 4) {
    e.teleport(run.pos, { rotation: { x: 0, y: run.yaw }, keepVelocity: false });
    return;
  }
  e.clearVelocity();
  e.applyImpulse({ x: dx * 0.3, y: dy * 0.3, z: dz * 0.3 });
  setProps(e, run.phase === "hover", run.phase !== "hover", false);
}

// --- the people: the ray and its riders are shown near players only ---

function guestEntity(g) {
  const e = g.key && world.getEntity(g.key);
  return e?.isValid ? e : undefined;
}

function removeGuest(g) {
  const e = guestEntity(g);
  g.key = undefined;
  try {
    e?.remove();
  } catch {
    // already gone
  }
}

function showGuests(run, e) {
  const want = Math.min(BALANCE.ride.seats, run.riders);
  while (run.guests.length < want) run.guests.push({ key: undefined, look: newVisitor().look });
  const rideable = e.getComponent("minecraft:rideable");
  if (!rideable) return;
  const d = dim(run.dimension);
  for (const g of run.guests) {
    if (guestEntity(g)) continue;
    try {
      const guest = d.spawnEntity(ENTITIES.guest, { x: run.pos.x, y: run.pos.y + 0.5, z: run.pos.z });
      guest.setProperty(LOOK, g.look);
      guest.triggerEvent("zoocraft:travel");
      if (rideable.addRider(guest)) g.key = guest.id;
      else guest.remove();
    } catch {
      // unloaded, or no seat: next time
    }
  }
}

// Show or hide a ride's ray by whether a player is near where it is.
function syncRide(run) {
  const r = BALANCE.ride;
  const a = getAnimal(run.rayId);
  const ex = a?.location.kind === "exhibit" && getExhibit(a.location.id);
  if (!a || !ex) return abandon(run, "the ray left the park");
  const near = nearestPlayer(run.dimension, run.pos);
  let loaded = false;
  try {
    loaded = dim(run.dimension).isChunkLoaded({ x: Math.floor(run.pos.x), y: Math.floor(run.pos.y), z: Math.floor(run.pos.z) });
  } catch {
    loaded = false;
  }
  let e = rayEntity(run);
  if (near > r.spawnRange + 16 || !loaded) {
    if (e) {
      for (const g of run.guests) removeGuest(g);
      if (!playerRiders(e).length) {
        steeredElsewhere.delete(e.id);
        despawn(a);
      }
    }
    return;
  }
  if (near > r.spawnRange) return;
  if (!e) {
    try {
      e = spawnInExhibit(a, ex, { x: Math.floor(run.pos.x), y: Math.floor(run.pos.y), z: Math.floor(run.pos.z) });
      e.teleport(run.pos, { rotation: { x: 0, y: run.yaw }, keepVelocity: false });
    } catch {
      return; // next time
    }
  }
  steeredElsewhere.add(e.id);
  if (run.phase === "board" || run.phase === "fly" || run.phase === "hover") {
    showGuests(run, e);
    if (run.forPlayer && run.phase === "board") {
      const p = onlinePlayers().find((pl) => pl.id === run.forPlayer);
      if (p && !playerRiders(e).some((r) => r.id === p.id)) {
        try {
          if (e.getComponent("minecraft:rideable")?.addRider(p)) message(p, "§dYou're on. The ray sets off once everyone has boarded.");
        } catch {
          // out of reach
        }
      }
    }
  }
}

// --- every two seconds ---

export function tickRides() {
  const park = getPark();
  if (!park || !anyMemberOnline()) return;
  const now = system.currentTick;
  const platforms = allPlatforms();
  if (now - lastCheck >= BALANCE.tours.deskRecheckSeconds * 20) {
    lastCheck = now;
    for (const p of platforms) checkPlatform(p);
  }
  for (const id of [...homing]) goHome(id);
  for (const run of [...runs.values()]) {
    try {
      syncRide(run);
    } catch (error) {
      log(`rides: ${error}`);
    }
  }
  for (const platform of platforms) {
    if (!working(platform)) continue;
    today(platform);
    if (!park.open || platform.waiting <= 0) continue;
    for (const a of raysOnDuty(platform)) {
      if (platform.waiting <= 0) break;
      if (!rayState(a, platform).ready) continue;
      const plan = platformLoop(platform);
      if (!plan) break;
      startRide(a, platform, plan, now);
    }
  }
}

// --- the block, the menu's actions and loading ---

export function platformText(rec) {
  if (rec.problem) return `§e${PLATFORM_TEXT[rec.problem] ?? rec.problem}`;
  today(rec);
  const duty = raysOnDuty(rec).length;
  if (!duty) return "§eExpedition Platform: open, but no Void Ray assigned. Assign one of the park's grown rays here.";
  return `§aExpedition Platform: open, ${duty} ray${duty === 1 ? "" : "s"} on the ride, rides ${rec.price} coins.`;
}

// Tell the player who placed a platform whether it's ready.
export function platformPlaced(player, block) {
  const rec = ensure(block);
  runTimeoutLater(() => {
    const cur = getPlatform(rec.id);
    if (!cur) return;
    checkPlatform(cur);
    message(player, `${platformText(cur)} §fUse the platform to assign rays and set the price.`);
  }, 10);
}

// A park member rides for free: joins a ride that is boarding, or sets one off with the guests waiting.
export function rideNow(player, platform) {
  const r = BALANCE.ride;
  if (player.dimension.id !== platform.dimension || Math.hypot(player.location.x - platform.pos.x - 0.5, player.location.z - platform.pos.z - 0.5) > 6) return { ok: false, reason: "Stand on the platform to ride." };
  for (const run of runs.values()) {
    if (run.platformId !== platform.id || run.phase !== "board") continue;
    const e = rayEntity(run);
    const rideable = e?.getComponent("minecraft:rideable");
    if (!rideable) continue;
    if (rideable.getRiders().length >= r.seats) return { ok: false, reason: "That ray is full. The next ride is yours." };
    return rideable.addRider(player) ? { ok: true } : { ok: false, reason: "Couldn't get you on. Stand right by the ray and try again." };
  }
  const duty = raysOnDuty(platform);
  if (!duty.length) return { ok: false, reason: "No ray is assigned to this platform yet." };
  const ready = duty.find((a) => rayState(a, platform).ready);
  if (!ready) return { ok: false, reason: `No ray can fly right now: ${duty.map((a) => `${a.name}: ${rayState(a, platform).text}`).join("; ")}.` };
  const plan = platformLoop(platform);
  if (!plan) return { ok: false, reason: "There is no loop to fly: the park needs an exhibit with animals within reach." };
  today(platform);
  startRide(ready, platform, plan, system.currentTick, player.id);
  syncRide(runs.get(ready.id));
  return { ok: true, started: true };
}

export function platformComponent(openMenu) {
  return {
    onPlace(e) {
      ensure(e.block);
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      runLater(() => openMenu(player, checkPlatform(rec)));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      db.remove(EQUIP, id);
      for (const run of [...runs.values()]) if (run.platformId === id) abandon(run, "the platform is gone");
    },
  };
}

// Guest entities this module seats on rays: guests.js must not clear them away.
export function isRideGuest(entityId) {
  for (const run of runs.values()) for (const g of run.guests) if (g.key === entityId) return true;
  return false;
}

// A ray's mob that loads mid-ride (or after a reload with the ride gone) is picked up by its ride,
// or sent home.
export function rideLoaded(entity) {
  if (entity.typeId !== RAY) return;
  runTimeoutLater(() => {
    if (!entity.isValid) return;
    for (const run of runs.values()) {
      if (liveEntity(run.rayId)?.id === entity.id) {
        steeredElsewhere.add(entity.id);
        return;
      }
    }
    for (const id of homing) if (liveEntity(id)?.id === entity.id) goHome(id);
  }, 2);
}

// Riders who got off a ray in flight (sneaking) float down rather than fall.
const wasRiding = new Map(); // player id -> ray entity id
export function tickRideSafety() {
  const now = new Map();
  for (const run of runs.values()) {
    const e = rayEntity(run);
    if (!e) continue;
    for (const p of playerRiders(e)) now.set(p.id, e.id);
  }
  for (const [pid, eid] of wasRiding) {
    if (now.has(pid)) continue;
    const p = onlinePlayers().find((pl) => pl.id === pid);
    if (!p) continue;
    const e = world.getEntity(eid);
    if (e?.isValid && Math.abs(e.location.y - p.location.y) < 2 && !p.isOnGround) softLanding(p);
  }
  wasRiding.clear();
  for (const [k, v] of now) wasRiding.set(k, v);
}

export function initRides() {
  for (const a of allAnimals()) if (a.onRide) homing.add(a.id);
  for (const id of [...homing]) goHome(id);
  log(`rides: ${allPlatforms().length} Expedition Platforms, ${allPlatforms().reduce((n, p) => n + (p.rayIds ?? []).length, 0)} rays assigned`);
}
