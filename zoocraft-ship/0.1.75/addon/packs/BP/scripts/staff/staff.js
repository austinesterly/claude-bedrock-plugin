import { system, world, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { RATIONS, ENTITIES, rationPlural, rationCount } from "../data/items.js";
import { newId, posKey } from "../core/ids.js";
import { on } from "../core/events.js";
import { log } from "../core/log.js";
import { getPark, parkTime, anyMemberOnline } from "../park/park.js";
import { charge } from "../economy/economy.js";
import { allExhibits, getExhibit, profileOf, releaseSpot, staffClean } from "../exhibits/exhibits.js";
import { refreshLook as refreshFeeder } from "../equipment/feeder.js";
import { fixturesOf, saveFixture, refreshLook as refreshFixture } from "../equipment/fixtures.js";
import { drinksFrom, drinksFromPool, reachesFeeder } from "../equipment/rules.js";
import { animalsIn, speciesGroups } from "../animals/animals.js";
import { jobsFor, pickJob, rationFor, totalStock, takeStock, roomUnits, defaultExhibits, keeperLimit, measureRoom, JOB_TEXT, ROOM_TEXT } from "./rules.js";
import { dim, onlinePlayers, message, blockReader } from "../platform/mc.js";
import { feederCapacity, exhibitsPerKeeper, keeperTime } from "../research/research.js";
import { isDangerousExhibit, keeperStop, shiftForKeeper, releaseAfterKeeper, airlockWalk } from "../animals/predators.js";
import { fastDay } from "../animals/predatorRules.js";
import { dayOf } from "../core/clock.js";

// Keepers (spec section 14, build plan C6). A keeper is a "staff" record: name, the exhibits it
// looks after, wages owed and the job it holds. Every couple of seconds each keeper takes the most
// urgent job in its exhibits (refill a feeder, food basket or trough, or clean) and does it with
// rations from the Staff Rooms: keepers move supplies, they never make food (spec section 10).
// With a player near the job, the keeper appears in the exhibit, walks to it and works in view;
// otherwise the job takes a fixed time out of sight. Resources are checked when the job is done,
// never before, so nothing is used twice. The visible keeper is never saved.
// Big predators (0.1.75): a keeper never shares space with them. Before a job in a dangerous exhibit the
// keeper shifts every grown animal into a Holding Den (worked from outside the fence) and counts them
// ("Shifting the lions into their Holding Dens (2 of 3 in)", "Counted: all 3 lions shut in"), goes in
// through the double Keeper Gate, does the job, and lets them out after. No double gate, or too few
// dens, and the keeper won't go in (the reason is its status). Out of sight the shift is part of the job.
// A fast day (big cats, one park day in seven) has no feeding job.

const STAFF = "staff";
const EQUIP = "equipment";
const LOOK = "zoocraft:look";
const LOOKS = 2;
const DIETS = Object.fromEntries(Object.entries(RATIONS).map(([item, r]) => [item, r.diet]));
const GO_EVENT = { feed: "zoocraft:go_feeder", basket: "zoocraft:go_basket", water: "zoocraft:go_trough", clean: "zoocraft:clean" };
const TARGET_NAME = { feed: "Basic Feeder", basket: "Hanging Food Basket", water: "trough" };
const NAMES = ["Sam", "Priya", "Jonas", "Maya", "Theo", "Ana", "Kofi", "Lena", "Ravi", "Iris", "Mateo", "June", "Omar", "Freya", "Kai", "Nell"];

const live = new Map(); // keeper id -> entity id
const shown = new Map(); // keeper id -> the job id its visible keeper was last sent to
const idleSince = new Map(); // keeper id -> park seconds its visible keeper ran out of jobs
const retryAt = new Map(); // job id -> park seconds when it may be tried again
const roomsToCheck = new Set(); // Staff Room ids to measure again (a block changed near them)
const NO_ROOM = "§eNo working Staff Room: build one as the keepers' base";

export function allKeepers() {
  return db.all(STAFF).filter((s) => s.role === "keeper");
}

export function getKeeper(id) {
  return db.get(STAFF, id);
}

export function allRooms() {
  return db.all(EQUIP).filter((e) => e.type === "staffroom");
}

// Staff Rooms that are real rooms (a building around or behind the block): only these house
// keepers and supply them.
export function workingRooms() {
  return allRooms().filter((r) => r.valid);
}

export function roomText(room) {
  return room.valid ? `This Staff Room works: ${room.space} blocks of space inside.` : ROOM_TEXT[room.problem ?? "open"];
}

// Measure the building around a Staff Room block. Returns the record, changed or not; a room that
// isn't loaded keeps what it had.
export function checkRoom(room) {
  const s = BALANCE.staff;
  let r;
  try {
    const read = blockReader(dim(room.dimension));
    const memo = new Map();
    r = measureRoom((x, y, z) => {
      const key = `${x},${y},${z}`;
      if (!memo.has(key)) memo.set(key, read(x, y, z));
      return memo.get(key);
    }, room.pos, { minSize: s.roomMinSize, maxCells: s.roomMaxCells });
  } catch {
    r = { ok: false, reason: "unloaded" };
  }
  if (r.reason === "unloaded") return room;
  const was = room.valid;
  room.valid = r.ok;
  room.problem = r.ok ? undefined : r.reason;
  room.space = r.cells ?? 0;
  room.bbox = r.bbox;
  room.checkedAt = parkTime();
  db.put(EQUIP, room);
  if (was && !room.valid) {
    const park = getPark();
    for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, `§eThe Staff Room at ${room.pos.x}, ${room.pos.y}, ${room.pos.z} isn't a room any more. §f${ROOM_TEXT[room.problem]}`);
  }
  return room;
}

// A player placed or broke a block: measure the Staff Rooms it could touch again.
export function staffBlockChanged(dimensionId, pos) {
  for (const room of allRooms()) {
    if (room.dimension !== dimensionId) continue;
    const b = room.bbox ?? { min: room.pos, max: room.pos };
    if (pos.x >= b.min.x - 3 && pos.x <= b.max.x + 3 && pos.y >= b.min.y - 3 && pos.y <= b.max.y + 3 && pos.z >= b.min.z - 3 && pos.z <= b.max.z + 3) roomsToCheck.add(room.id);
  }
}

// Tell the player who placed a Staff Room block whether it's in a room yet.
export function roomPlaced(player, block) {
  const room = checkRoom(ensureRoom(block));
  message(player, room.valid ? `§a${roomText(room)} §fUse it to hire keepers and stock rations.` : `§e${roomText(room)}`);
}

// Rooms waiting after an edit first, then the oldest measurement: at most one a tick.
function serviceRooms(now) {
  for (const id of [...roomsToCheck]) {
    roomsToCheck.delete(id);
    const room = db.get(EQUIP, id);
    if (room) checkRoom(room);
  }
  const due = allRooms()
    .filter((r) => r.checkedAt === undefined || now - r.checkedAt >= BALANCE.staff.roomRecheckSeconds)
    .filter((r) => {
      try {
        return dim(r.dimension).isChunkLoaded(r.pos);
      } catch {
        return false;
      }
    })
    .sort((a, b) => (a.checkedAt ?? -Infinity) - (b.checkedAt ?? -Infinity))[0];
  if (due) checkRoom(due);
}

export function roomAt(dimensionId, pos) {
  return db.get(EQUIP, posKey(dimensionId, pos));
}

export function stockTotals() {
  return totalStock(workingRooms());
}

export function limit() {
  return keeperLimit(workingRooms().length, BALANCE);
}

function save(k) {
  db.put(STAFF, k);
}

// --- hiring and management (the staff menu calls these after its permission checks) ---

export function hire() {
  const keepers = allKeepers();
  if (keepers.length >= limit()) {
    if (workingRooms().length) return { ok: false, reason: `The Staff Rooms house ${limit()} keepers. Build another Staff Room for more.` };
    const room = allRooms()[0];
    return { ok: false, reason: room ? `Keepers need a working Staff Room first. ${roomText(room)}` : "Build a Staff Room first: a closed building with at least 3 x 3 x 3 of open space inside, with the Staff Room block inside it or against its outside wall." };
  }
  const used = new Set(keepers.map((k) => k.name));
  const name = NAMES.find((n) => !used.has(n)) ?? `Keeper ${keepers.length + 1}`;
  const k = { id: newId("keeper"), role: "keeper", name, look: keepers.length % LOOKS, exhibitIds: defaultExhibits(allExhibits(), keepers, exhibitsPerKeeper()), hiredAt: parkTime(), done: 0, owed: [], job: undefined, status: "Settling in" };
  save(k);
  db.flush(STAFF);
  return { ok: true, keeper: k };
}

export function dismiss(k) {
  removeEntity(k.id);
  db.remove(STAFF, k.id);
  db.flush(STAFF);
}

export function rename(k, name) {
  k.name = name;
  save(k);
  const e = entityOf(k.id);
  if (e) e.nameTag = name;
}

export function assign(k, exhibitIds) {
  k.exhibitIds = exhibitIds.slice(0, exhibitsPerKeeper());
  if (k.job && !k.exhibitIds.includes(k.job.exhibitId)) dropJob(k, "Reassigned");
  save(k);
}

// What a keeper is up to, for menus and when a player talks to one.
export function statusOf(k) {
  if (k.owed?.length) return `§cUnpaid: waiting for ${k.owed.length * BALANCE.staff.keeperWage} coins of wages`;
  if (!k.exhibitIds.length) return "§eNo exhibits assigned";
  return k.status ?? "";
}

// --- Staff Room block ---

function ensureRoom(block) {
  const id = posKey(block.dimension.id, block.location);
  let rec = db.get(EQUIP, id);
  if (!rec) {
    rec = { id, type: "staffroom", dimension: block.dimension.id, pos: { x: block.x, y: block.y, z: block.z }, stock: {} };
    db.put(EQUIP, rec);
  }
  return rec;
}

export function staffRoomComponent(openMenu) {
  const ensure = ensureRoom;
  return {
    onPlace(e) {
      ensure(e.block);
    },
    onPlayerInteract(e) {
      const player = e.player;
      if (!player) return;
      const rec = checkRoom(ensure(e.block));
      system.run(() => openMenu(player, rec));
    },
    onPlayerBreak(e) {
      const id = posKey(e.block.dimension.id, e.block.location);
      const rec = db.get(EQUIP, id);
      if (!rec) return;
      // The supplies come back out as items, so nothing is lost.
      for (const [item, units] of Object.entries(rec.stock ?? {})) {
        let count = Math.floor(units / (RATIONS[item]?.units ?? 1));
        while (count > 0) {
          const s = new ItemStack(item, 1);
          s.amount = Math.min(count, s.maxAmount);
          count -= s.amount;
          e.block.dimension.spawnItem(s, e.block.center());
        }
      }
      db.remove(EQUIP, id);
      roomsToCheck.delete(id);
    },
  };
}

// Put up to `units` of a ration into a room. Returns how many went in.
export function stockRoom(room, item, units) {
  const space = BALANCE.staff.roomCapacity - roomUnits(room);
  const put = Math.max(0, Math.min(space, units));
  if (put > 0) {
    room.stock[item] = (room.stock[item] ?? 0) + put;
    db.put(EQUIP, room);
  }
  return put;
}

export function unstockRoom(room, item, units) {
  const taken = takeStock([room], item, units);
  if (taken) db.put(EQUIP, room);
  return taken;
}

// --- wages ---

// At the start of each park day every keeper is owed a day's wages; they're paid straight away
// when the park can afford it. A keeper with wages owed stops work until paid (spec section 13:
// no debt spiral, and staff status made explicit).
function owe(day) {
  for (const k of allKeepers()) {
    if (!k.owed.includes(day)) k.owed.push(day);
    save(k);
  }
  payOwed(true);
}

function payOwed(announce = false) {
  const unpaid = [];
  for (const k of allKeepers()) {
    if (!k.owed?.length) continue;
    for (const day of [...k.owed]) {
      const r = charge(BALANCE.staff.keeperWage, `Wages: ${k.name}`, `wage:${k.id}:${day}`);
      if (!r.ok) break;
      k.owed = k.owed.filter((d) => d !== day);
    }
    save(k);
    if (k.owed.length) unpaid.push(k.name);
  }
  if (announce && unpaid.length) {
    const park = getPark();
    for (const p of onlinePlayers()) if (park?.members[p.id]) message(p, `§c${unpaid.join(", ")} couldn't be paid and stopped work. §fThey start again once the park has ${BALANCE.staff.keeperWage} coins for each of them.`);
  }
}

// --- the job loop ---

function entityOf(keeperId) {
  const id = live.get(keeperId);
  const e = id && world.getEntity(id);
  return e?.isValid ? e : undefined;
}

function removeEntity(keeperId) {
  const e = entityOf(keeperId);
  live.delete(keeperId);
  shown.delete(keeperId);
  idleSince.delete(keeperId);
  try {
    e?.remove();
  } catch {
    // Already gone.
  }
}

function playerNear(dimensionId, pos, range) {
  return onlinePlayers().some((p) => p.dimension.id === dimensionId && Math.hypot(p.location.x - pos.x, p.location.z - pos.z) <= range);
}

function canShow(j) {
  try {
    return dim(j.dimension).isChunkLoaded(j.pos) && playerNear(j.dimension, j.pos, BALANCE.staff.visibleRange);
  } catch {
    return false;
  }
}

// All jobs in the park. A refill the Staff Rooms have no fitting ration for is marked `blocked`
// with what's missing, so no keeper walks out for nothing.
function allJobs() {
  const out = [];
  const stock = stockTotals();
  const balance = { ...BALANCE, feeder: { ...BALANCE.feeder, capacity: feederCapacity() } };
  for (const ex of allExhibits()) {
    if (!ex.animalIds.length) continue;
    const profile = profileOf(ex);
    const feeders = (ex.feederIds ?? []).map((id) => db.get(EQUIP, id)).filter(Boolean);
    // A shared exhibit (0.1.61): each species asks for its own food and drink; one job per target.
    const taken = new Set();
    for (const { species, animals } of speciesGroups(animalsIn(ex))) {
      const pool = drinksFromPool(species, profile, ex);
      const fasting = fastDay(species, dayOf(parkTime(), BALANCE.clock.dayLength), BALANCE.predators);
      for (const j of jobsFor({ ...ex, animalIds: animals.map((a) => a.id) }, species, feeders, fixturesOf(ex), pool, balance, DIETS)) {
        if (taken.has(j.targetId)) continue;
        if (fasting && j.kind === "feed") continue; // a planned fast day: no feed today
        taken.add(j.targetId);
        if (j.kind === "feed" || j.kind === "basket") {
          const rec = db.get(EQUIP, j.targetId);
          if (rec && !rationFor(species, rec, stock, RATIONS)) j.blocked = `Needs ${rationPlural(rec.units > 0 && rec.item ? rec.item : species.baitItem)} in a Staff Room for ${ex.name}`;
        }
        out.push(j);
      }
    }
  }
  return out;
}

function dropJob(k, status) {
  // Done in a dangerous exhibit: the keeper is out through the gates, and the animals are let out.
  const ex = k.job && getExhibit(k.job.exhibitId);
  if (ex && isDangerousExhibit(ex)) {
    removeEntity(k.id);
    releaseAfterKeeper(ex); // only the ones this keeper shut in
  }
  k.job = undefined;
  k.status = status;
  save(k);
}

function giveUp(k, why) {
  retryAt.set(k.job.id, parkTime() + BALANCE.staff.retrySeconds);
  dropJob(k, `§e${why}`);
  removeEntity(k.id);
}

function where(j) {
  return getExhibit(j.exhibitId)?.name ?? "an exhibit";
}

// A spot to stand near `pos`: two blocks of air over something solid, closest first.
function standNear(d, pos) {
  const free = (x, y, z) => {
    const b = d.getBlock({ x, y, z });
    return b && (b.isAir || b.typeId === "minecraft:short_grass" || b.typeId === "minecraft:tall_grass");
  };
  for (let r = 1; r <= 3; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        for (let dy = 1; dy >= -2; dy--) {
          const x = pos.x + dx, y = pos.y + dy, z = pos.z + dz;
          const below = d.getBlock({ x, y: y - 1, z });
          if (free(x, y, z) && free(x, y + 1, z) && below && !below.isAir && !below.isLiquid) return { x, y, z };
        }
      }
    }
  }
  return undefined;
}

// The keeper appears inside the exhibit a few steps from the job (beside the job when the exhibit
// hasn't been measured since the world loaded) and walks over.
function showKeeper(k, j) {
  let e = entityOf(k.id);
  if (!e) {
    const d = dim(j.dimension);
    const b = getExhibit(j.exhibitId)?.bbox;
    let from = j.pos;
    if (b) {
      const cx = (b.min.x + b.max.x) / 2 - j.pos.x;
      const cz = (b.min.z + b.max.z) / 2 - j.pos.z;
      const len = Math.hypot(cx, cz) || 1;
      const step = Math.min(5, len);
      from = { x: Math.round(j.pos.x + (cx / len) * step), y: j.pos.y, z: Math.round(j.pos.z + (cz / len) * step) };
    }
    // Into a dangerous exhibit by its double Keeper Gate: the keeper comes in just inside the inner gate.
    const ex = getExhibit(j.exhibitId);
    if (ex?.service?.length && isDangerousExhibit(ex)) from = airlockWalk(ex.service[0]).inside;
    const spot = releaseSpot(j.exhibitId, from) ?? standNear(d, j.pos);
    if (!spot) throw new Error("nowhere to stand near the job");
    e = d.spawnEntity(ENTITIES.keeper, { x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 });
    e.setProperty(LOOK, k.look ?? 0);
    e.nameTag = k.name;
    live.set(k.id, e.id);
  }
  idleSince.delete(k.id);
  if (shown.get(k.id) !== j.id) {
    e.triggerEvent(GO_EVENT[j.kind]);
    shown.set(k.id, j.id);
  }
  return e;
}

// Do the job: check what's needed and what the Staff Rooms hold now, then change the records.
function commit(k, j) {
  if (j.kind === "clean") {
    const ex = getExhibit(j.exhibitId);
    if (!ex) return dropJob(k, "Idle");
    staffClean(ex);
    return finished(k, `Cleaned ${ex.name}`);
  }
  const rec = db.get(EQUIP, j.targetId);
  const ex = getExhibit(j.exhibitId);
  if (!rec || !ex) return dropJob(k, "Idle");
  const groups = speciesGroups(animalsIn(ex));
  if (j.kind === "water") {
    // Water, or lava from a Lava Trough for animals that drink lava; any other trough is left alone.
    if (!groups.some((g) => drinksFrom(g.species, rec))) return dropJob(k, "Idle");
    rec.units = BALANCE.trough.capacity;
    saveFixture(rec);
    refreshFixture(rec);
    return finished(k, `Topped up the ${rec.liquid === "lava" ? "Lava" : "Water"} Trough in ${ex.name}`);
  }
  // The species the feeder is for: the one eating what it holds, else the first that can reach it.
  const species = (rec.item && rec.units > 0 ? groups.find((g) => g.species.dietTags.includes(DIETS[rec.item]) && reachesFeeder(g.species, rec)) : groups.find((g) => reachesFeeder(g.species, rec)))?.species ?? groups[0]?.species;
  if (!species) return dropJob(k, "Idle");
  const rooms = workingRooms();
  const item = rationFor(species, rec, totalStock(rooms), RATIONS);
  if (!item) return giveUp(k, `Needs ${rationPlural(species.baitItem)} in a Staff Room for ${ex.name}`);
  const cap = j.kind === "feed" ? feederCapacity() : BALANCE.basket.capacity;
  const taken = takeStock(rooms, item, cap - rec.units);
  for (const r of rooms) db.put(EQUIP, r);
  if (taken <= 0) return giveUp(k, `Needs ${rationPlural(item)} in a Staff Room for ${ex.name}`);
  rec.units += taken;
  rec.item = item;
  if (j.kind === "feed") {
    db.put(EQUIP, rec);
    refreshFeeder(rec);
  } else {
    saveFixture(rec);
    refreshFixture(rec);
  }
  finished(k, `Put ${taken} ${rationCount(item, taken)} in the ${TARGET_NAME[j.kind]} in ${ex.name}`);
}

function finished(k, what) {
  k.done = (k.done ?? 0) + 1;
  dropJob(k, `Done: ${what}`);
  const e = entityOf(k.id);
  if (e) e.triggerEvent("zoocraft:idle");
}

function step(k, jobs, claimed, now) {
  if (k.owed?.length) {
    removeEntity(k.id);
    return;
  }
  if (!workingRooms().length) {
    if (k.status !== NO_ROOM) dropJob(k, NO_ROOM);
    removeEntity(k.id);
    return;
  }
  // Drop a job that no longer needs doing (a player filled the feeder, the exhibit emptied...).
  if (k.job && !jobs.some((j) => j.id === k.job.id)) {
    dropJob(k, "Idle");
  }
  if (!k.job) {
    const next = pickJob(k, jobs.filter((j) => !j.blocked), claimed, retryAt, now);
    const blocked = jobs.find((j) => j.blocked && k.exhibitIds.includes(j.exhibitId));
    if (!next && blocked && k.status !== `§e${blocked.blocked}`) {
      k.status = `§e${blocked.blocked}`;
      save(k);
    }
    if (!next) {
      // A keeper seen working stays a little, then goes back to the Staff Room (out of sight).
      if (entityOf(k.id)) {
        if (!idleSince.has(k.id)) idleSince.set(k.id, now);
        else if (now - idleSince.get(k.id) >= BALANCE.staff.lingerSeconds) removeEntity(k.id);
      }
      if (!k.status?.startsWith("Done") && !k.status?.startsWith("§e")) {
        k.status = "All caught up";
        save(k);
      }
      return;
    }
    // Moving on to another exhibit: the keeper seen in this one goes.
    if (entityOf(k.id) && next.exhibitId !== k.lastExhibitId) removeEntity(k.id);
    k.job = { ...next, state: "travel", since: now };
    k.lastExhibitId = next.exhibitId;
    k.status = `On the way to ${JOB_TEXT[next.kind]} in ${where(next)}`;
    save(k);
    claimed.add(next.id);
  }
  const j = k.job;
  const s = BALANCE.staff;
  const ex = getExhibit(j.exhibitId);
  if (ex && isDangerousExhibit(ex)) {
    const stop = keeperStop(ex);
    if (stop) return giveUp(k, stop);
    // In view, the animals walk into their dens first, and the job waits for the count.
    if (!j.shifted && canShow(j)) {
      const shift = shiftForKeeper(ex);
      if (!shift.done) {
        removeEntity(k.id); // the keeper is at the dens, outside the fence
        j.shiftFrom ??= now;
        if (now - j.shiftFrom > BALANCE.predators.dens.shiftSeconds) {
          releaseAfterKeeper(ex);
          return giveUp(k, `${shift.text}: one won't come in. Try again when they've settled`);
        }
        j.since = now;
        if (k.status !== shift.text) {
          k.status = shift.text;
          save(k);
        }
        return;
      }
      j.shifted = true;
      j.since = now;
      k.status = shift.text;
      save(k);
    }
  }
  if (!canShow(j)) {
    removeEntity(k.id);
    if (now - j.since >= keeperTime(s.awaySeconds)) commit(k, j);
    return;
  }
  let e;
  try {
    e = showKeeper(k, j);
  } catch {
    // Nowhere to put the keeper in view: the job is done out of sight instead.
    if (now - j.since >= keeperTime(s.awaySeconds)) commit(k, j);
    return;
  }
  if (j.state === "travel") {
    const dx = e.location.x - (j.pos.x + 0.5);
    const dz = e.location.z - (j.pos.z + 0.5);
    const flat = Math.hypot(dx, dz);
    const close = j.kind === "clean" || (flat <= s.reach && Math.abs(e.location.y - j.pos.y) <= s.reach + 1);
    const late = now - j.since >= s.travelSeconds;
    if (close || (late && flat <= s.reach * 2)) {
      j.state = "work";
      j.since = now;
      k.status = `Working: ${JOB_TEXT[j.kind]} in ${where(j)}`;
      save(k);
      if (j.kind !== "clean") e.triggerEvent("zoocraft:work");
    } else if (late) {
      giveUp(k, `Couldn't reach the ${TARGET_NAME[j.kind] ?? "job"} in ${where(j)}. Is it walled off from the exhibit floor?`);
    }
    return;
  }
  if (now - j.since >= keeperTime(j.kind === "clean" ? s.cleanSeconds : s.workSeconds)) commit(k, j);
}

// Every two seconds while a park member is online.
export function tickStaff() {
  const park = getPark();
  if (!park || !anyMemberOnline()) return;
  const now = parkTime();
  serviceRooms(now);
  const keepers = allKeepers();
  if (!keepers.length) return;
  payOwed();
  const jobs = allJobs();
  const claimed = new Set(keepers.filter((k) => k.job).map((k) => k.job.id));
  for (const k of keepers) {
    try {
      step(k, jobs, claimed, now);
    } catch (error) {
      log(`staff: ${k.name}: ${error}`);
    }
  }
}

// Keepers from an earlier session aren't tracked: clear them away when their chunk loads.
export function keeperLoaded(entity) {
  if (entity.typeId === ENTITIES.keeper && ![...live.values()].includes(entity.id)) entity.remove();
}

export function keeperForEntity(entity) {
  for (const [kid, eid] of live) if (eid === entity.id) return getKeeper(kid);
  return undefined;
}

export function talkToKeeper(player, entity) {
  const k = keeperForEntity(entity);
  if (!k) return;
  message(player, `§7Keeper ${k.name}: §f${statusOf(k).replace(/§./g, "")}.`);
}

export function initStaff() {
  on("parkDay", ({ day }) => owe(day));
  for (const id of ["overworld", "nether", "the_end"]) {
    try {
      for (const e of dim(id).getEntities({ type: ENTITIES.keeper })) e.remove();
    } catch {
      // Dimension not available.
    }
  }
  log(`staff: ${allKeepers().length} keepers, ${allRooms().length} Staff Rooms`);
}
