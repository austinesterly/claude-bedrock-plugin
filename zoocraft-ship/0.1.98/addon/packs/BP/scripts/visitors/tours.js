import { system, world } from "@minecraft/server";
import { timedJob } from "../core/perf.js";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { SPECIES, pluralOf } from "../data/species.js";
import { posKey, newId } from "../core/ids.js";
import { on } from "../core/events.js";
import { log } from "../core/log.js";
import { getPark, parkTime, insidePark, anyMemberOnline, recordVisitors } from "../park/park.js";
import { earn, charge } from "../economy/economy.js";
import { exhibitAt, getExhibit } from "../exhibits/exhibits.js";
import { animalsIn, speciesGroups, welfare } from "../animals/animals.js";
import { allPoints } from "./points.js";
import { pathLinked, currentNetwork } from "./network.js";
import { standSpot, yawToward } from "./sight.js";
import { nearestNode, feetAt, walkStep } from "./routes.js";
import { tourSales, seatsPerDay, guideLimit, orderStops, planTour, tourTicks, legFeet, guideLine, routeText } from "./tourRules.js";
import { dim, blockReader, onlinePlayers, message } from "../platform/mc.js";
import { DIR } from "../equipment/structures.js";
import { newVisitor } from "./guests.js";

// Guided tours (0.1.65, M6 part 5; spec section 13 lists tours as park revenue). The Tour Desk is a
// counter block on the guest side that a path from the entrance reaches. Tour Guides are hired
// there ("staff" records with role "guide", wages like keepers). Guests buy tickets at the desk as a
// share of the visitors (tourRules.js), and a guide takes each group from the desk along the path
// network to the working Viewing Points and back, talking about the animals at every stop. The walk
// is real: the guide's position moves along the route every tick whether or not anyone is near, and
// the guide (with a few of the ticket holders behind) is shown as people when a player is within
// range, like the ghost guests of 0.1.64. Only this module writes "tourdesk" equipment records and
// "guide" staff records. The walk in progress is never saved: on reload every guide is back at the
// desk and the next group sets off from there.

const EQUIP = "equipment";
const STAFF = "staff";
const LOOK = "zoocraft:look";
const WALKING = "zoocraft:walking";
const LOOKS = 2;
const NAMES = ["Rosa", "Felix", "Amara", "Leo", "Hana", "Jude", "Nia", "Elias", "Zara", "Owen", "Mira", "Tomas", "Ada", "Idris", "Suki", "Bram"];
export const DESK_TEXT = {
  outside: "Tour Desk: outside the park. Guests only visit inside the park boundary.",
  inside: "Tour Desk: this is inside an exhibit. Put it on the guest side of the fence.",
  path: "Tour Desk: no guest path reaches it. Lay a path (gravel, bricks, planks...) from the Park Entrance Gate to right beside it.",
  stand: "Tour Desk: the guide has nowhere to stand. Leave a 2-block-high space on solid ground right next to it.",
  unchecked: "Tour Desk: checking the paths... use it again in a moment. Is there a Park Entrance Gate yet?",
};

const routes = new Map(); // desk id -> { plan, names, netSize, stopKey, planning, at }
const runs = new Map(); // guide id -> the tour in progress
const guideEntities = new Map(); // guide id -> entity id
const nextTourAt = new Map(); // guide id -> game tick a guide may set off again
let lastDeskCheck = -Infinity;

// --- records ---

export function allDesks() {
  return db.all(EQUIP).filter((e) => e.type === "tourdesk");
}

export function workingDesks() {
  return allDesks().filter(working);
}

export function allGuides() {
  return db.all(STAFF).filter((s) => s.role === "guide");
}

export function getGuide(id) {
  return db.get(STAFF, id);
}

export function getDesk(id) {
  const rec = db.get(EQUIP, id);
  return rec?.type === "tourdesk" ? rec : undefined;
}

const working = (rec) => !rec.problem;

function save(g) {
  db.put(STAFF, g);
}

function ensure(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "tourdesk", blockId: block.typeId, dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, dir: block.permutation.getState(DIR), price: BALANCE.tours.defaultPrice, carry: 0, soldToday: 0, soldDay: 0, waiting: 0, toursToday: 0, toursDay: 0, linked: undefined, problem: "unchecked" };
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
    rec.toursToday = 0;
  }
  return rec;
}

// Re-check where a desk stands, whether a path reaches it and where the guide stands beside it.
// Keeps the last path answer for whatever the latest walk couldn't tell.
export function checkDesk(rec) {
  const linked = pathLinked(rec.dimension, rec.pos);
  if (linked !== undefined) rec.linked = linked;
  const d = dim(rec.dimension);
  if (d.isChunkLoaded(rec.pos)) rec.spot = standSpot(blockReader(d), rec.pos);
  if (!insidePark(rec.dimension, rec.pos)) rec.problem = "outside";
  else if (exhibitAt(rec.dimension, rec.pos)) rec.problem = "inside";
  else if (rec.linked === false) rec.problem = "path";
  else if (rec.linked === undefined) rec.problem = "unchecked";
  else if (!rec.spot) rec.problem = "stand";
  else rec.problem = undefined;
  db.put(EQUIP, rec);
  return rec;
}

export function checkAllDesks() {
  for (const rec of allDesks()) checkDesk(rec);
}

// --- the route: the desk's walk over the path network to the working Viewing Points ---

// One stop per exhibit: the working Viewing Point nearest the desk that stands on the network.
function stopsFor(desk, net) {
  const reach = BALANCE.guests.routeReach;
  const byExhibit = new Map();
  for (const v of allPoints("viewpoint")) {
    if (!v.viewed || !v.spot || !v.exhibitId || v.dimension !== desk.dimension) continue;
    const node = nearestNode(net, v.spot, reach);
    if (!node) continue;
    const d = (v.spot.x - desk.spot.x) ** 2 + (v.spot.z - desk.spot.z) ** 2;
    const prev = byExhibit.get(v.exhibitId);
    if (!prev || d < prev.d) byExhibit.set(v.exhibitId, { id: v.id, x: v.spot.x, y: v.spot.y, z: v.spot.z, node, exhibitId: v.exhibitId, d });
  }
  return [...byExhibit.values()];
}

const stopKeyOf = (stops) => stops.map((s) => s.id).sort().join("|");

// Plan (or re-plan) a desk's route as a job when the network or the Viewing Points changed, or
// every so often. The last plan stands while a new one is searched.
function planRoute(desk, now) {
  const cur = currentNetwork();
  const route = routes.get(desk.id);
  if (!cur || cur.dimension !== desk.dimension || !desk.spot) return;
  if (route?.planning) return;
  const stops = stopsFor(desk, cur.net);
  const stopKey = stopKeyOf(stops);
  if (route && route.netSize === cur.net.size && route.stopKey === stopKey && now - route.at < BALANCE.tours.replanSeconds * 20) return;
  const deskNode = nearestNode(cur.net, desk.spot, BALANCE.paths.reach);
  const next = { plan: route?.plan, names: route?.names ?? [], netSize: cur.net.size, stopKey, planning: true, at: now };
  routes.set(desk.id, next);
  if (!deskNode || !stops.length) {
    next.plan = undefined;
    next.names = [];
    next.planning = false;
    return;
  }
  const ordered = orderStops(desk.spot, stops, BALANCE.tours.maxStops);
  const search = planTour(cur.net, deskNode, ordered, { limit: BALANCE.paths.maxNodes, perYield: BALANCE.guests.searchPerTick, maxLength: BALANCE.tours.maxLength });
  system.runJob(
    timedJob("tour", (function* () {
      let plan;
      try {
        plan = yield* search;
      } catch (error) {
        log(`tours: route for the desk at ${desk.pos.x}, ${desk.pos.y}, ${desk.pos.z} failed: ${error}`);
      } finally {
        next.planning = false;
      }
      if (routes.get(desk.id) !== next) return;
      next.plan = plan;
      next.names = plan ? plan.stops.map((s) => getExhibit(s.exhibitId)?.name ?? "an exhibit") : [];
    })()),
  );
}

// The desk's current route plan (undefined before the first plan, or when there is no walk).
export function deskRoute(deskId) {
  return routes.get(deskId);
}

export function deskRouteText(desk) {
  const route = routes.get(desk.id);
  if (route?.planning && !route.plan) return "Planning the walk over the paths...";
  const t = BALANCE.tours;
  return routeText(route?.plan, t.walkSpeed, t.talkSeconds * 20, route?.names ?? []);
}

// --- guides: hiring and management (the Tour Desk menu calls these after its permission checks) ---

export function limit() {
  return guideLimit(workingDesks().length, BALANCE);
}

// The guides a desk's tours can count on: its own, paid, with the desk working.
export function guidesOnDuty(desk) {
  if (!working(desk)) return [];
  return allGuides().filter((g) => homeDesk(g)?.id === desk.id && !g.owed?.length);
}

// A guide's desk: the one it was hired at while that stands, else the first working desk.
export function homeDesk(g) {
  const own = getDesk(g.deskId);
  if (own) return own;
  return workingDesks()[0];
}

export function hire(desk) {
  const guides = allGuides();
  if (guides.length >= limit()) {
    if (workingDesks().length) return { ok: false, reason: `The Tour Desks employ ${limit()} guides. Build another Tour Desk for more.` };
    return { ok: false, reason: `Guides need a working Tour Desk first. ${desk ? DESK_TEXT[desk.problem] ?? "" : ""}`.trim() };
  }
  const used = new Set(guides.map((g) => g.name));
  const name = NAMES.find((n) => !used.has(n)) ?? `Guide ${guides.length + 1}`;
  const g = { id: newId("guide"), role: "guide", name, look: guides.length % LOOKS, deskId: desk?.id, hiredAt: parkTime(), done: 0, owed: [], status: "Ready at the Tour Desk" };
  save(g);
  db.flush(STAFF);
  return { ok: true, guide: g };
}

export function dismiss(g) {
  endRun(g.id);
  removeGuideEntity(g.id);
  db.remove(STAFF, g.id);
  db.flush(STAFF);
}

export function rename(g, name) {
  g.name = name;
  save(g);
  const e = guideEntity(g.id);
  if (e) e.nameTag = name;
}

export function setTourPrice(desk, price) {
  desk.price = price;
  db.put(EQUIP, desk);
}

// What a guide is up to, for the menu and when a player talks to one.
export function statusOf(g) {
  if (g.owed?.length) return `§cUnpaid: waiting for ${g.owed.length * BALANCE.tours.guideWage} coins of wages`;
  if (!homeDesk(g)) return "§eNo working Tour Desk to work from";
  return g.status ?? "";
}

// --- wages (as for keepers: owed at the start of each park day, paid when the park can) ---

function owe(day) {
  for (const g of allGuides()) {
    if (!g.owed.includes(day)) g.owed.push(day);
    save(g);
  }
  payOwed(true);
}

function payOwed(announce = false) {
  const unpaid = [];
  for (const g of allGuides()) {
    if (!g.owed?.length) continue;
    for (const day of [...g.owed]) {
      const r = charge(BALANCE.tours.guideWage, `Wages: ${g.name} (tour guide)`, `wage:${g.id}:${day}`);
      if (!r.ok) break;
      g.owed = g.owed.filter((d) => d !== day);
    }
    save(g);
    if (g.owed.length) unpaid.push(g.name);
  }
  if (announce && unpaid.length) {
    const park = getPark();
    for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, `§c${unpaid.join(", ")} couldn't be paid and stopped leading tours. §fThey start again once the park has ${BALANCE.tours.guideWage} coins for each of them.`);
  }
}

// --- ticket sales (one visitor step, from visitors.js) ---

export function tourStep(guests, stepKey) {
  const park = getPark();
  if (!park || guests <= 0) return;
  let income = 0;
  for (const desk of allDesks()) {
    today(desk);
    const duty = guidesOnDuty(desk);
    const plan = routes.get(desk.id)?.plan;
    if (!duty.length || !plan) {
      desk.carry = 0;
      db.put(EQUIP, desk);
      continue;
    }
    const seatsLeft = Math.max(0, seatsPerDay(duty.length, BALANCE) - desk.soldToday);
    const sale = tourSales({ guests, price: desk.price, stops: plan.stops.length, seatsLeft, carry: desk.carry ?? 0 }, BALANCE);
    desk.carry = sale.carry;
    if (sale.sold > 0) {
      const res = earn(sale.revenue, `Tours: ${sale.sold} ticket${sale.sold === 1 ? "" : "s"} at ${desk.price}`, `tour:${desk.id}:${stepKey}`);
      if (res.ok && !res.duplicate) {
        desk.soldToday += sale.sold;
        desk.waiting += sale.sold;
        income += sale.revenue;
      }
    }
    db.put(EQUIP, desk);
  }
  if (income > 0) recordVisitors({ revenue: income });
}

// For the Park Ledger: desks, guides, today's tours and tickets.
export function tourSummary() {
  let tours = 0;
  let tickets = 0;
  for (const desk of allDesks()) {
    today(desk);
    tours += desk.toursToday;
    tickets += desk.soldToday;
  }
  return { desks: allDesks().length, working: workingDesks().length, guides: allGuides().length, tours, tickets };
}

// --- the walk ---

function nearestPlayer(dimensionId, pos) {
  let best = Infinity;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== dimensionId) continue;
    const d = Math.hypot(p.location.x - pos.x, p.location.z - pos.z);
    if (d < best) best = d;
  }
  return best;
}

function playersNear(dimensionId, pos, range) {
  return onlinePlayers().filter((p) => p.dimension.id === dimensionId && Math.hypot(p.location.x - pos.x, p.location.y - pos.y, p.location.z - pos.z) <= range);
}

// The feet position over a path block: a bottom slab is half a block lower (unloaded: a full block).
function topReader(d) {
  return (x, y, z) => {
    try {
      const b = d.getBlock({ x, y, z });
      if (!b) return 1;
      if (/_slab$/.test(b.typeId)) return b.permutation.getState("minecraft:vertical_half") === "top" ? 1 : 0.5;
      return 1;
    } catch {
      return 1;
    }
  };
}

const deskStand = (desk) => ({ x: desk.spot.x + 0.5, y: desk.spot.y, z: desk.spot.z + 0.5 });

function say(run, text) {
  const g = getGuide(run.guideId);
  if (!g) return;
  for (const p of playersNear(run.dimension, run.pos, BALANCE.tours.talkRange)) message(p, `§7Guide ${g.name}: §f"${text}"`);
}

// A group sets off: the guide walks the desk's current plan with up to a group of ticket holders.
function startTour(g, desk, plan, now) {
  const d = dim(desk.dimension);
  const feet = (n) => feetAt(n, topReader(d));
  const legs = plan.legs.map((leg) => ({ to: leg.to, feet: legFeet(leg, feet) }));
  const riders = Math.min(BALANCE.tours.groupSize, desk.waiting);
  desk.waiting -= riders;
  db.put(EQUIP, desk);
  const run = { guideId: g.id, deskId: desk.id, dimension: desk.dimension, legs, leg: 0, wp: 1, pos: { ...legs[0].feet[0] }, phase: "walk", until: 0, started: now, stopCount: plan.stops.length, stopIndex: 0, riders, followers: [], trail: [] };
  runs.set(g.id, run);
  nextTourAt.delete(g.id);
  g.status = `Leading a tour of ${riders} guest${riders === 1 ? "" : "s"}: ${plan.stops.length} stop${plan.stops.length === 1 ? "" : "s"}`;
  save(g);
  const e = guideEntity(g.id);
  if (e) {
    try {
      e.triggerEvent("zoocraft:travel");
      e.setProperty(WALKING, true);
    } catch {
      // gone under us; it's spawned again on the way
    }
  }
  say(run, `Welcome, everyone! Follow me: ${plan.stops.length} stop${plan.stops.length === 1 ? "" : "s"} today, then back here.`);
}

function endRun(guideId) {
  const run = runs.get(guideId);
  if (!run) return;
  for (const f of run.followers) removeFollower(f);
  runs.delete(guideId);
}

// Back at the desk: the tour counts, the guide rests a moment before the next group.
function finishTour(run, now) {
  const g = getGuide(run.guideId);
  const desk = getDesk(run.deskId);
  if (desk) {
    today(desk);
    desk.toursToday += 1;
    db.put(EQUIP, desk);
  }
  if (g) {
    g.done = (g.done ?? 0) + 1;
    g.status = `Back at the Tour Desk (${g.done} tour${g.done === 1 ? "" : "s"} led)`;
    save(g);
  }
  say(run, "And that's the tour. Thanks for coming, and enjoy the rest of your visit!");
  endRun(run.guideId);
  nextTourAt.set(run.guideId, now + BALANCE.tours.restSeconds * 20);
  const e = guideEntity(run.guideId);
  if (e) {
    try {
      e.triggerEvent("zoocraft:idle");
      e.setProperty(WALKING, false);
    } catch {
      // gone
    }
  }
}

// At a stop: the guide turns to the exhibit and talks about who lives there.
function arriveAtStop(run, now) {
  const leg = run.legs[run.leg];
  const stop = leg.to;
  run.phase = "talk";
  run.until = now + BALANCE.tours.talkSeconds * 20;
  const ex = getExhibit(stop.exhibitId);
  const animals = ex ? animalsIn(ex) : [];
  const groups = speciesGroups(animals).map((grp) => ({ name: grp.species.displayName.toLowerCase(), plural: pluralOf(grp.species).toLowerCase(), n: grp.animals.length }));
  const avg = animals.length ? animals.reduce((s, a) => s + welfare(a), 0) / animals.length : 0;
  const lead = speciesGroups(animals)[0]?.species ?? (ex ? SPECIES[ex.speciesId] : undefined);
  say(run, guideLine(run.stopIndex, run.stopCount, ex?.name ?? "this exhibit", groups, avg, lead?.where, BALANCE));
  run.stopIndex += 1;
  const e = guideEntity(run.guideId);
  if (e) {
    try {
      e.triggerEvent("zoocraft:talk");
      e.setProperty(WALKING, false);
      const b = ex?.bbox;
      if (b) e.setRotation({ x: 0, y: yawToward(run.pos, { x: (b.min.x + b.max.x + 1) / 2, y: run.pos.y, z: (b.min.z + b.max.z + 1) / 2 }) });
    } catch {
      // gone
    }
  }
}

function nextLeg(run) {
  run.leg += 1;
  run.wp = 1;
  run.phase = "walk";
  const e = guideEntity(run.guideId);
  if (e) {
    try {
      e.triggerEvent("zoocraft:travel");
      e.setProperty(WALKING, true);
    } catch {
      // gone
    }
  }
}

// Every tick: walk every tour one step along its route, guide shown or not, and keep the group behind.
export function tickTourWalk() {
  const now = system.currentTick;
  const t = BALANCE.tours;
  for (const run of [...runs.values()]) {
    if (run.phase === "talk") {
      if (now >= run.until) {
        if (run.leg + 1 >= run.legs.length) finishTour(run, now);
        else nextLeg(run);
      }
      continue;
    }
    const leg = run.legs[run.leg];
    const target = leg?.feet[run.wp];
    if (!target) {
      if (!leg || !leg.to) finishTour(run, now);
      else arriveAtStop(run, now);
      continue;
    }
    const next = walkStep(run.pos, target, t.walkSpeed);
    run.pos = { x: next.x, y: next.y, z: next.z };
    run.trail.push({ x: next.x, y: next.y, z: next.z, yaw: next.yaw });
    const keep = t.followGap * (t.followers + 1) + 2;
    if (run.trail.length > keep) run.trail.splice(0, run.trail.length - keep);
    const e = guideEntity(run.guideId);
    if (e) {
      try {
        e.teleport({ x: next.x, y: next.y, z: next.z }, { rotation: { x: 0, y: next.yaw }, keepVelocity: false });
      } catch {
        removeGuideEntity(run.guideId); // the ground ahead unloaded: the walk goes on unseen
      }
    }
    walkFollowers(run);
    if (next.arrived) {
      run.wp += 1;
      if (run.wp >= leg.feet.length) {
        if (leg.to) arriveAtStop(run, now);
        else finishTour(run, now);
      }
    }
  }
}

// --- the people: the guide's entity and the ticket holders behind it, shown near players only ---

function guideEntity(guideId) {
  const id = guideEntities.get(guideId);
  const e = id && world.getEntity(id);
  return e?.isValid ? e : undefined;
}

function removeGuideEntity(guideId) {
  const e = guideEntity(guideId);
  guideEntities.delete(guideId);
  try {
    e?.remove();
  } catch {
    // already gone
  }
  const run = runs.get(guideId);
  if (run) for (const f of run.followers) removeFollower(f);
}

function showGuide(g, dimensionId, pos, mode) {
  let e = guideEntity(g.id);
  if (e) return e;
  const d = dim(dimensionId);
  e = d.spawnEntity(ENTITIES.tourGuide, pos);
  e.setProperty(LOOK, g.look ?? 0);
  e.nameTag = g.name;
  e.triggerEvent(`zoocraft:${mode}`);
  if (mode === "travel") e.setProperty(WALKING, true);
  guideEntities.set(g.id, e.id);
  return e;
}

function followerEntity(f) {
  const e = f.key && world.getEntity(f.key);
  return e?.isValid ? e : undefined;
}

function removeFollower(f) {
  const e = followerEntity(f);
  f.key = undefined;
  try {
    e?.remove();
  } catch {
    // already gone
  }
}

// The group walks the guide's trail, each a few steps behind the one before; they stop when the
// guide stops (the trail only grows while the guide walks).
function walkFollowers(run) {
  const t = BALANCE.tours;
  run.followers.forEach((f, i) => {
    const at = run.trail[run.trail.length - 1 - t.followGap * (i + 1)];
    if (!at) return;
    const e = followerEntity(f);
    if (!e) return;
    try {
      e.teleport({ x: at.x, y: at.y, z: at.z }, { rotation: { x: 0, y: at.yaw }, keepVelocity: false });
    } catch {
      removeFollower(f);
    }
  });
}

function showFollowers(run) {
  const t = BALANCE.tours;
  const want = Math.min(t.followers, run.riders);
  while (run.followers.length < want) run.followers.push({ key: undefined, look: newVisitor().look });
  const d = dim(run.dimension);
  run.followers.forEach((f, i) => {
    if (followerEntity(f)) return;
    const at = run.trail[run.trail.length - 1 - t.followGap * (i + 1)] ?? run.pos;
    try {
      const e = d.spawnEntity(ENTITIES.guest, { x: at.x, y: at.y, z: at.z });
      e.setProperty(LOOK, f.look);
      e.triggerEvent("zoocraft:travel");
      e.setProperty(WALKING, run.phase === "walk");
      f.key = e.id;
    } catch {
      // unloaded: next time
    }
  });
}

// Guest entities this module walks: guests.js must not clear them away.
export function isTourGuest(entityId) {
  for (const run of runs.values()) for (const f of run.followers) if (f.key === entityId) return true;
  return false;
}

// Where a guide is now: on the walk, or standing at its desk.
function guidePos(g) {
  const run = runs.get(g.id);
  if (run) return { dimension: run.dimension, pos: run.pos, mode: run.phase === "walk" ? "travel" : "talk" };
  const desk = homeDesk(g);
  if (!desk?.spot) return undefined;
  return { dimension: desk.dimension, pos: deskStand(desk), mode: "idle" };
}

// Show or hide a guide (and its group) by whether a player is near where it is.
function syncPeople(g) {
  const at = guidePos(g);
  if (!at || g.owed?.length) return removeGuideEntity(g.id);
  const t = BALANCE.tours;
  const near = nearestPlayer(at.dimension, at.pos);
  let loaded = false;
  try {
    loaded = dim(at.dimension).isChunkLoaded({ x: Math.floor(at.pos.x), y: Math.floor(at.pos.y), z: Math.floor(at.pos.z) });
  } catch {
    loaded = false;
  }
  if (near > t.spawnRange + 16 || !loaded) return removeGuideEntity(g.id);
  if (near > t.spawnRange) return;
  try {
    const e = showGuide(g, at.dimension, at.pos, at.mode);
    const run = runs.get(g.id);
    if (run) showFollowers(run);
    else if (Math.hypot(e.location.x - at.pos.x, e.location.z - at.pos.z) > 3) e.teleport(at.pos); // wandered off the desk
  } catch {
    // the spot unloaded between the check and the spawn; next time
  }
}

// --- every two seconds ---

export function tickTours() {
  const park = getPark();
  if (!park || !anyMemberOnline()) return;
  const now = system.currentTick;
  const t = BALANCE.tours;
  // Desks: one re-check every so often (paths, standing spot), routes re-planned when things change.
  const desks = allDesks();
  if (now - lastDeskCheck >= t.deskRecheckSeconds * 20) {
    lastDeskCheck = now;
    for (const desk of desks) checkDesk(desk);
  }
  for (const desk of desks) if (working(desk)) planRoute(desk, now);
  const guides = allGuides();
  if (!guides.length) return;
  payOwed();
  for (const g of guides) {
    try {
      step(g, now);
      syncPeople(g);
    } catch (error) {
      log(`tours: ${g.name}: ${error}`);
    }
  }
}

function step(g, now) {
  if (runs.has(g.id)) return; // on the walk: tickTourWalk moves it along
  if (g.owed?.length) return;
  const desk = homeDesk(g);
  if (!desk) {
    if (g.status !== "No working Tour Desk to work from") {
      g.status = "No working Tour Desk to work from";
      save(g);
    }
    return;
  }
  today(desk);
  const park = getPark();
  if (!park?.open) return setStatus(g, "At the Tour Desk (the park is closed)");
  const plan = routes.get(desk.id)?.plan;
  if (!plan) return setStatus(g, "At the Tour Desk: no tour route yet");
  if (desk.waiting <= 0) return setStatus(g, "At the Tour Desk, waiting for guests to buy tickets");
  if ((nextTourAt.get(g.id) ?? -Infinity) > now) return setStatus(g, "At the Tour Desk, gathering the next group");
  // One group at a time per desk sets off; a second guide at the desk waits for the next group.
  startTour(g, desk, plan, now);
}

function setStatus(g, status) {
  if (g.status === status) return;
  g.status = status;
  save(g);
}

// --- the block, loading and talking ---

export function deskText(rec) {
  if (rec.problem) return `§e${DESK_TEXT[rec.problem] ?? rec.problem}`;
  today(rec);
  const duty = guidesOnDuty(rec).length;
  if (!duty) return "§eTour Desk: open, but no guide on duty. Hire a Tour Guide here.";
  return `§aTour Desk: open, ${duty} guide${duty === 1 ? "" : "s"} on duty, tickets ${rec.price} coins.`;
}

// Tell the player who placed a Tour Desk whether it's ready.
export function deskPlaced(player, block) {
  const rec = ensure(block);
  system.runTimeout(() => {
    const cur = getDesk(rec.id);
    if (!cur) return;
    checkDesk(cur);
    message(player, `${deskText(cur)} §fUse the desk to hire guides and set the ticket price.`);
  }, 10);
}

export function tourDeskComponent(openMenu) {
  return {
    onPlace(e) {
      ensure(e.block);
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = ensure(e.block);
      system.run(() => openMenu(player, checkDesk(rec)));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      db.remove(EQUIP, id);
      routes.delete(id);
      // Guides hired here move to another desk if there is one (homeDesk); their walks end here.
      for (const g of allGuides()) if (g.deskId === id) endRun(g.id);
    },
  };
}

// Guides and tour guests from an earlier session aren't tracked: clear them away when their chunk loads.
export function tourLoaded(entity) {
  if (entity.typeId === ENTITIES.tourGuide && ![...guideEntities.values()].includes(entity.id)) entity.remove();
}

export function guideForEntity(entity) {
  for (const [gid, eid] of guideEntities) if (eid === entity.id) return getGuide(gid);
  return undefined;
}

export function talkToGuide(player, entity) {
  const g = guideForEntity(entity);
  if (!g) return;
  const run = runs.get(g.id);
  const extra = run ? ` Next: ${run.legs[run.leg]?.to ? (getExhibit(run.legs[run.leg].to.exhibitId)?.name ?? "the next exhibit") : "back to the Tour Desk"}.` : "";
  message(player, `§7Guide ${g.name}: §f${statusOf(g).replace(/§./g, "")}.${extra}`);
}

export function initTours() {
  on("parkDay", ({ day }) => owe(day));
  on("pathsChanged", () => {
    for (const route of routes.values()) route.netSize = -1; // re-plan on the next tick
  });
  for (const id of ["overworld", "nether", "the_end"]) {
    try {
      for (const e of dim(id).getEntities({ type: ENTITIES.tourGuide })) e.remove();
    } catch {
      // Dimension not available.
    }
  }
  log(`tours: ${allGuides().length} guides, ${allDesks().length} Tour Desks`);
}
