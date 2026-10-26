import { system } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { advance, dayOf } from "../core/clock.js";
import { emit } from "../core/events.js";
import { applyLedger } from "../economy/ledger.js";
import { onlinePlayers } from "../platform/mc.js";
import { ROLE_RANK, NEEDS_ROLE, allowed, denyLine, handOver } from "./rules.js";
import { insideParkEdge } from "./fenceRules.js";

// The park records (spec sections 2 and 19): a park's members and roles, boundary, clock and balance. Only this
// module writes the "park" collection (the ledger writes the balance through economy/ledger.js).
//
// 0.1.109 (module 5b, Austin 2026-10-26: "People should be able to have their own zoos on a world, or work
// together"): the collection holds one record a park. The first park of a world is "main" (as every park was before);
// later ones are "p2", "p3"... with `number` 2, 3... "The park" is then:
//   - the park a loop is running for (forEachPark sets it while the loop body runs),
//   - else the park the player or position is in (parkOf, parkAt),
//   - else, in a world with one park, that park (getPark with nothing: how every caller from before 0.1.109 asks).
// 0.1.114 (the second park): a world takes any number of parks. "The park" is then the scope: the park a loop runs
// for (forEachPark, withPark, inPark), else the world's one park, else nothing, so a caller in a world with several
// parks has to say which (parkOf a player, parkAt a block, or the park it was handed). The query helpers of the other
// modules (allExhibits, allAnimals, allKeepers, the equipment lists) answer only the scope's park while one is set,
// so a loop body written for one park works for each in turn. Records that belong to a park say so: exhibits,
// animals, staff and ledger entries by `parkId`; the fence area, path network, quests, releases and research by a
// record id (parkRecordId) that stays as it was for the world's first park.
//
// The scope is lexical, nothing else: withPark sets it for one synchronous call and puts the scope before back after,
// inPark for each slice of a generator. Work the game runs later (system.run, a job, a form's answer) runs outside it,
// so each entry point sets its own: a block's or item's handler from its block and player (atBlock, forPlayer), a loop
// from forEachPark, a queued job through scopedJob, a menu by withPark round each part after a form (ui/). A caller
// that asks for "the park" with several and no scope gets nothing (and the mock world's check hears of it).

const PARK_ID = "main";
export { ROLE_RANK, NEEDS_ROLE };

let current; // the park a loop is running for (forEachPark, withPark, inPark)
let depth = 0; // explicit scopes open (withPark/inPark/inParkOf, a park or none): getPark() inside one never complains
let unscoped; // the mock world's check: told of a getPark() with several parks and no scope (never set in the game)

/** The scope's park id while a loop runs for one, else undefined. */
export function scopeId() {
  return current?.id;
}

/** Run `fn` with getPark() answering `park` (nests: the scope before is back after). */
export function withPark(park, fn) {
  const before = current;
  current = park;
  depth++;
  try {
    return fn(park);
  } finally {
    current = before;
    depth--;
  }
}

/** A generator run with getPark() answering `park` on every slice (a job that runs across ticks). */
/** inPark for a job whose park is not known when it starts (the benchmark claims its park a few slices in). */
export function* inParkOf(getter, gen) {
  for (;;) {
    let r;
    const before = current;
    current = getter();
    depth++;
    try {
      r = gen.next();
    } finally {
      current = before;
      depth--;
    }
    if (r.done) return r.value;
    yield r.value;
  }
}

export function* inPark(park, gen) {
  for (;;) {
    let r;
    const before = current;
    current = park;
    depth++;
    try {
      r = gen.next();
    } finally {
      current = before;
      depth--;
    }
    if (r.done) return r.value;
    yield r.value;
  }
}

/** A job queued from inside a scope keeps that scope on every slice (core/jobs.js runs it later). */
export function scopedJob(gen) {
  return current ? inPark(current, gen) : gen;
}

/** A park by id (a record's `parkId`; one from before 0.1.109 is the first park's). */
export function parkById(id) {
  return db.get("park", id ?? PARK_ID);
}

/** The park a record with a `parkId` belongs to (an exhibit, an animal, a keeper, a ledger entry). */
export function parkOfRecord(rec) {
  return rec ? parkById(rec.parkId) : undefined;
}

/** The park a block's handler works for: the park the block stands in, else the player's park, else the world's one. */
export function scopeFor(block, player = undefined) {
  let at;
  try {
    at = parkAt(block.dimension.id, block.location ?? { x: block.x, y: block.y, z: block.z });
  } catch {
    at = undefined;
  }
  return at ?? (player ? parkOf(player) : onlyPark());
}

/** The world's one park, if it has exactly one (quiet: no scope needed). */
export function onlyPark() {
  const col = db.col("park");
  return col.size === 1 ? col.values().next().value : undefined;
}

/** Run a block's handler with getPark() answering the park the block (or its player) belongs to. */
export function atBlock(block, player, fn) {
  return withPark(scopeFor(block, player), fn);
}

/** Run a player's action with getPark() answering their park (parkOf). */
export function forPlayer(player, fn) {
  return withPark(parkOf(player), fn);
}

/** Run `fn` for the park a record belongs to (messages about an exhibit or an animal go to that park's members). */
export function forRecord(rec, fn) {
  return withPark(parkOfRecord(rec) ?? getPark(), fn);
}

/** system.run that keeps the scope it was called in. */
export function runLater(fn) {
  const park = current;
  return system.run(() => withPark(park, fn));
}

/** system.runTimeout that keeps the scope it was called in. */
export function runTimeoutLater(fn, ticks) {
  const park = current;
  return system.runTimeout(() => withPark(park, fn), ticks);
}

/** A block's custom component with every handler run for the park its block (or player) belongs to. */
export function scopedComponent(component) {
  const out = {};
  for (const [name, fn] of Object.entries(component)) out[name] = typeof fn === "function" ? (e) => atBlock(e.block, e.player, () => fn(e)) : fn;
  return out;
}

/** An item's custom component: onUseOn for the park the block (or player) belongs to, onUse for the player's park. */
export function scopedItem(component) {
  const out = {};
  for (const [name, fn] of Object.entries(component)) {
    if (typeof fn !== "function") out[name] = fn;
    else if (name === "onUseOn") out[name] = (e) => atBlock(e.block, e.source, () => fn(e));
    else out[name] = (e) => (e.source?.typeId === "minecraft:player" ? forPlayer(e.source, () => fn(e)) : fn(e));
  }
  return out;
}

/** The mock world sets this to catch callers that still ask for "the park" in a world with several. */
export function setUnscopedCheck(fn) {
  unscoped = fn;
}

/** Does a record with a `parkId` belong to the scope's park? (Every record is in scope while no loop runs; one from before 0.1.109 is the first park's.) */
export function inScope(rec) {
  const id = current?.id;
  return !id || (rec.parkId ?? PARK_ID) === id;
}

/** Does a record standing at (dimension, pos) belong to the scope's park: is it inside that park's fence? */
export function inScopeAt(rec) {
  if (!current) return true;
  return current.dimension === rec.dimension && insideParkColumn(current, rec.pos.x, rec.pos.z);
}

/** A record id for a park's own copy of something: `base` for the world's first park (as before 0.1.109), "base:<id>" after. */
export function parkRecordId(base, park = getPark()) {
  return !park || park.id === PARK_ID ? base : `${base}:${park.id}`;
}

/** Every park of the world, by number. */
export function allParks() {
  const col = db.col("park");
  if (col.size <= 1) return [...col.values()];
  return [...col.values()].sort((a, b) => (a.number ?? 1) - (b.number ?? 1));
}

/** The scope's park, else the world's one park (undefined with none, or with several and no scope). */
export function getPark() {
  if (current) return db.get("park", current.id) ?? current; // as it is now (a scope set a while ago holds the object it was given)
  const col = db.col("park");
  if (col.size === 1) return col.values().next().value;
  if (col.size > 1 && depth === 0 && unscoped) unscoped(new Error("getPark() with several parks and no scope").stack);
  return undefined;
}

/** The park whose fence holds the column (x, z) of that dimension, if any. */
export function parkAt(dimensionId, pos) {
  for (const park of allParks()) {
    if (park.dimension !== dimensionId) continue;
    if (insideParkColumn(park, pos.x, pos.z)) return park;
  }
  return undefined;
}

/** The park a player works for: the park they stand in if they belong to it; else the one they own; else one they
 * belong to; else the park they stand in; else the world's one park. */
export function parkOf(player) {
  let at;
  try {
    at = parkAt(player.dimension.id, player.location);
  } catch {
    at = undefined;
  }
  if (at?.members[player.id]) return at;
  const parks = allParks();
  return parks.find((p) => p.ownerId === player.id) ?? parks.find((p) => p.members[player.id]) ?? at ?? onlyPark();
}

/** The park a player owns, if any. */
export function ownedPark(player) {
  return allParks().find((p) => p.ownerId === player.id);
}

/** Every park the player belongs to, by number. */
export function parksOf(player) {
  return allParks().filter((p) => p.members[player.id]);
}

/** Is the player a member of any park? */
export function memberOfAny(player) {
  return allParks().some((p) => p.members[player.id]);
}

/** Run a loop body once a park, with getPark() answering that park meanwhile. */
export function forEachPark(fn) {
  for (const park of allParks()) withPark(park, fn);
}

/** The members of a park who are online. */
export function membersOnline(park = getPark()) {
  if (!park) return [];
  return onlinePlayers().filter((p) => park.members[p.id]);
}

// The sidebar's park (ui/hud.js): Bedrock shows one scoreboard sidebar to everyone, so with several parks it shows the
// one with the most members online (ties: the lowest number). Everyone reads their own park's figures on its Park Ledger.
export function sidebarPark() {
  let best;
  let most = -1;
  for (const park of allParks()) {
    const n = membersOnline(park).length;
    if (n > most) {
      most = n;
      best = park;
    }
  }
  return best;
}

/** The park's name for messages and the sidebar. */
export function parkName(park) {
  return park?.name ?? `${park?.members[park.ownerId]?.name ?? "The"}'s Zoo`;
}

export function parkTime(park = getPark()) {
  return park?.clock.seconds ?? 0;
}

/** The park day an animal lives in (0.1.114: its exhibit's park's; a wild one's, the world's first park's). */
export function dayFor(a) {
  const ex = a?.location?.kind === "exhibit" ? db.get("exhibits", a.location.id) : undefined;
  return dayOf(parkTime(parkOfRecord(ex) ?? onlyPark() ?? allParks()[0]), BALANCE.clock.dayLength);
}

/** The park day for a loop over wild mobs (0.1.114: the world's one park's, else its first park's). */
export function worldDay() {
  return dayOf(parkTime(onlyPark() ?? allParks()[0]), BALANCE.clock.dayLength);
}

export function roleOf(playerId, park = getPark()) {
  return park?.members[playerId]?.role ?? "visitor";
}

export function can(player, action, park = getPark()) {
  if (!park) return false;
  return allowed(roleOf(player.id, park), action);
}

export function denyText(action, park = getPark()) {
  return denyLine(action, park?.members[park.ownerId]?.name);
}

// Everyone who has joined this world (the "players" collection, one record per player id), so the
// owner can set roles for players who are offline. Written on every first spawn.
export function notePlayer(player) {
  db.put("players", { ...(db.get("players", player.id) ?? {}), id: player.id, name: player.name, lastSeen: Date.now() });
}

export function knownPlayers() {
  return db.all("players").filter((p) => p.name);
}

/** Why the player can't claim a park where they stand, or undefined when they can (0.1.114: one park an owner, each
 * park outside every other park's Aluminum Fence; Austin 2026-10-26: "People should be able to have their own zoos on
 * a world, or work together"). */
export function claimProblem(player) {
  return claimProblemFor(player.id, player.dimension.id, player.location);
}

/** The same, for an owner id and a spot (0.1.118: the benchmark's second park has no player standing there). */
export function claimProblemFor(ownerId, dimensionId, loc) {
  const own = allParks().find((p) => p.ownerId === ownerId);
  if (own) return `You already own ${parkName(own)}. One park an owner; you can be a manager or keeper of other parks.`;
  const at = parkAt(dimensionId, loc);
  if (at) return `This spot is inside ${parkName(at)}. Claim a park outside every park's Aluminum Fence.`;
  const near = allParks().find((p) => p.dimension === dimensionId && Math.abs(p.center.x - Math.floor(loc.x)) <= BALANCE.park.spotGap && Math.abs(p.center.z - Math.floor(loc.z)) <= BALANCE.park.spotGap);
  if (near) return `This spot is too close to ${parkName(near)}'s Park Deed spot (${near.center.x} ${near.center.z}). Claim a park at least ${BALANCE.park.spotGap} blocks from another park's spot.`;
  return undefined;
}

/** Rename a park (from its Park Ledger's settings). Returns why not, or undefined. */
export function renamePark(name, park = getPark()) {
  if (!park) return "no park";
  const clean = String(name ?? "").replace(/§./g, "").trim().slice(0, 32);
  if (!clean) return "A park needs a name.";
  const taken = allParks().find((p) => p.id !== park.id && parkName(p).toLowerCase() === clean.toLowerCase());
  if (taken) return `Another park is already called ${parkName(taken)}.`;
  park.name = clean;
  db.put("park", park);
  db.flush("park");
  return undefined;
}

export function claimPark(player) {
  return claimParkAs({ id: player.id, name: player.name }, player.dimension.id, player.location);
}

/** Claim a park at a spot for an owner { id, name } (0.1.118: the benchmark's second park is owned by nobody who plays). */
export function claimParkAs(owner, dimensionId, loc) {
  const problem = claimProblemFor(owner.id, dimensionId, loc);
  if (problem) return { ok: false, reason: problem };
  const parks = allParks();
  // 0.1.114: the world's first park is "main" (as every park was before 0.1.109); later ones "p2", "p3"... by number.
  const number = parks.length ? Math.max(...parks.map((p) => p.number ?? 1)) + 1 : 1;
  const park = {
    id: parks.length ? `p${number}` : PARK_ID,
    number,
    name: `${owner.name}'s Zoo`,
    ownerId: owner.id,
    members: { [owner.id]: { role: "owner", name: owner.name } },
    dimension: dimensionId,
    center: { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) },
    // 0.1.101: no ground until an Aluminum Fence closes round the spot (0.1.106: so for every park, old or new).
    open: false,
    entrance: undefined,
    balance: 0,
    clock: { seconds: 0 },
    visitorCarry: 0,
    today: { day: 0, guests: 0, revenue: 0 },
    lastDay: { guests: 0, revenue: 0 },
    rating: { stars: 0, score: 0, satisfaction: 0 },
    settings: { peacefulCare: false },
    createdAt: Date.now(),
  };
  db.put("park", park);
  applyLedger(db, park, { opId: "grant:starting_funds", amount: BALANCE.economy.startingFunds, reason: "Starting funds", parkTime: 0 });
  db.flush();
  emit("parkClaimed", park);
  return { ok: true, park };
}

export function setMember(playerId, name, role, park = getPark()) {
  if (!park || playerId === park.ownerId) return false;
  if (role === "visitor") delete park.members[playerId];
  else park.members[playerId] = { role, name };
  db.put("park", park);
  db.flush("park");
  return true;
}

// Hand the park to another member (park/rules.js handOver): the old owner stays on as a manager.
export function transferPark(newOwnerId, newOwnerName, park = getPark()) {
  if (!park) return { ok: false, reason: "no park" };
  // 0.1.114: one park an owner.
  const theirs = allParks().find((p) => p.ownerId === newOwnerId && p.id !== park.id);
  if (theirs) return { ok: false, reason: `${newOwnerName} already owns ${parkName(theirs)}; one park an owner.` };
  const r = handOver(park, newOwnerId, newOwnerName);
  if (!r.ok) return r;
  db.put("park", park);
  db.flush("park");
  emit("parkHandedOver", { park, newOwnerId });
  return { ok: true };
}

export function setOpen(open, park = getPark()) {
  if (!park) return;
  park.open = open;
  db.put("park", park);
  db.flush("park");
}

export function setEntrance(dimensionId, pos, park = getPark()) {
  if (!park) return;
  park.entrance = pos ? { dimension: dimensionId, x: pos.x, y: pos.y, z: pos.z } : undefined;
  if (!pos) park.open = false;
  db.put("park", park);
}

// Set at a Ticket Booth; used only while a booth is paired with the entrance (visitors module).
export function setAdmission(price, park = getPark()) {
  if (!park) return;
  park.admissionPrice = price;
  db.put("park", park);
  db.flush("park");
}

// Guest services state (visitors module): litter on the paths and the donations carry.
/** @param {{ litter?: number, donationCarry?: number }} state */
export function setServiceState({ litter = undefined, donationCarry = undefined }, park = getPark()) {
  if (!park) return;
  if (litter !== undefined) park.litter = litter;
  if (donationCarry !== undefined) park.donationCarry = donationCarry;
  db.put("park", park);
}

export function setSetting(name, value, park = getPark()) {
  if (!park) return;
  park.settings[name] = value;
  // Sandbox mode is remembered for good (park/rules.js): the Park Ledger says the park has used it.
  if (name === "sandbox" && value) park.sandboxUsed = true;
  db.put("park", park);
  db.flush("park");
}

// Visitor numbers for the day and the latest rating (written by the visitors module through here).
export function recordVisitors({ guests = 0, revenue = 0, rating = undefined }, park = getPark()) {
  if (!park) return;
  park.today.guests += guests;
  park.today.revenue += revenue;
  if (rating) park.rating = rating;
  db.put("park", park);
}

export function rollDay(day, park = getPark()) {
  if (!park) return;
  park.lastDay = { guests: park.today.guests, revenue: park.today.revenue };
  park.today = { day, guests: 0, revenue: 0 };
  db.put("park", park);
}

export function setVisitorCarry(carry, park = getPark()) {
  if (!park) return;
  park.visitorCarry = carry;
  db.put("park", park);
}

// The fenced park area (0.1.101, kept by park/fence.js): once Aluminum Fence closes round the Park Deed's spot, the
// park is every column inside it, at any height. Until then the park has no ground at all (Austin, 2026-10-25: the
// fence is "Required"; 2026-10-26: "The zoo should just be where aluminum fences enclose", so the 500-block circle a
// park from before 0.1.101 kept is gone too).
// 0.1.109: one area a park, under "area" for the first park and "area:<park id>" for the others (park/fence.js).
const areas = new Map(); // park id -> area (or undefined once read and there is none)
export function areaRecordId(park) {
  return park.id === PARK_ID ? "area" : `area:${park.id}`;
}
function fencedArea(park) {
  if (!park) return undefined;
  if (!areas.has(park.id)) areas.set(park.id, db.get("fence", areaRecordId(park))?.last);
  const area = areas.get(park.id);
  return area && area.dimension === park.dimension && area.cx === park.center.x && area.cz === park.center.z ? area : undefined;
}

/** park/fence.js hands over a park's area each time its fence closes (or undefined when the fence is all gone). */
export function setFencedArea(next, park = getPark()) {
  if (park) areas.set(park.id, next);
}

/** What marks the park's edge: "fence" (a closed Aluminum Fence) or "none" (no ground yet). */
export function parkEdge(park = getPark()) {
  if (!park) return "none";
  return fencedArea(park) ? "fence" : "none";
}

/** Where something has to be, in the words of the park's edge. */
export function insideWords(park = getPark()) {
  if (parkEdge(park) === "fence") return "inside the park's Aluminum Fence";
  return "inside the park, and it has no ground until an Aluminum Fence closes round the Park Deed's spot";
}

/** Is the column (x, z) in the park's dimension inside the park? */
export function insideParkColumn(park, x, z) {
  return insideParkEdge(park, fencedArea(park), x, z);
}

/** Is that spot inside a park (the loop's park while a loop runs; any park otherwise)? */
export function insidePark(dimensionId, pos) {
  if (current) return current.dimension === dimensionId && insideParkColumn(current, pos.x, pos.z);
  return parkAt(dimensionId, pos) !== undefined;
}

export function anyMemberOnline(park = getPark()) {
  if (!park) return false;
  return onlinePlayers().some((p) => park.members[p.id]);
}

// Called once per real second. Advances each park's time and tells the simulation which periods passed, with
// getPark() answering that park while its events run. A park's clock is paused while none of its members is
// online (spec section 2).
export function tickClock() {
  forEachPark((park) => {
    if (!anyMemberOnline(park)) return;
    const r = advance(park.clock, 1, BALANCE.clock);
    db.put("park", park);
    emit("parkSecond", { parkTime: park.clock.seconds, parkId: park.id });
    for (let i = 0; i < r.simSteps; i++) emit("simStep", { seconds: BALANCE.clock.simEvery, parkTime: park.clock.seconds, parkId: park.id });
    for (let i = 0; i < r.visitorSteps; i++) emit("visitorStep", { seconds: BALANCE.clock.visitorEvery, parkTime: park.clock.seconds, parkId: park.id });
    if (r.daysAdvanced > 0) emit("parkDay", { day: r.day, parkTime: park.clock.seconds, parkId: park.id });
  });
}

// Debug: run a full park day of simulation now (for testing; the same code paths as real time).
export function skipTime(seconds, park = getPark()) {
  if (!park) return;
  withPark(park, () => {
    for (let i = 0; i < seconds; i++) {
      const r = advance(park.clock, 1, BALANCE.clock);
      for (let s = 0; s < r.simSteps; s++) emit("simStep", { seconds: BALANCE.clock.simEvery, parkTime: park.clock.seconds, parkId: park.id, skipped: true });
      for (let s = 0; s < r.visitorSteps; s++) emit("visitorStep", { seconds: BALANCE.clock.visitorEvery, parkTime: park.clock.seconds, parkId: park.id, skipped: true });
      if (r.daysAdvanced > 0) emit("parkDay", { day: r.day, parkTime: park.clock.seconds, parkId: park.id });
    }
    db.put("park", park);
  });
}
