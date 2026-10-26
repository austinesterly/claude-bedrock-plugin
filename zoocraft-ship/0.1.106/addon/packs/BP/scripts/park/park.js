import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { advance } from "../core/clock.js";
import { emit } from "../core/events.js";
import { applyLedger } from "../economy/ledger.js";
import { onlinePlayers } from "../platform/mc.js";
import { ROLE_RANK, NEEDS_ROLE, allowed, denyLine, handOver } from "./rules.js";
import { insideParkEdge } from "./fenceRules.js";

// The park record (spec sections 2 and 19): one shared park per world, its members and roles,
// boundary, clock and balance. Only this module writes the "park" collection (the ledger writes
// the balance through economy/ledger.js).

const PARK_ID = "main";
export { ROLE_RANK, NEEDS_ROLE };

export function getPark() {
  return db.get("park", PARK_ID);
}

export function parkTime() {
  return getPark()?.clock.seconds ?? 0;
}

export function roleOf(playerId) {
  return getPark()?.members[playerId]?.role ?? "visitor";
}

export function can(player, action) {
  const park = getPark();
  if (!park) return false;
  return allowed(roleOf(player.id), action);
}

export function denyText(action) {
  const park = getPark();
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

export function claimPark(player) {
  if (getPark()) return { ok: false, reason: "This world already has a park." };
  const loc = player.location;
  const park = {
    id: PARK_ID,
    ownerId: player.id,
    members: { [player.id]: { role: "owner", name: player.name } },
    dimension: player.dimension.id,
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

export function setMember(playerId, name, role) {
  const park = getPark();
  if (!park || playerId === park.ownerId) return false;
  if (role === "visitor") delete park.members[playerId];
  else park.members[playerId] = { role, name };
  db.put("park", park);
  db.flush("park");
  return true;
}

// Hand the park to another member (park/rules.js handOver): the old owner stays on as a manager.
export function transferPark(newOwnerId, newOwnerName) {
  const park = getPark();
  if (!park) return { ok: false, reason: "no park" };
  const r = handOver(park, newOwnerId, newOwnerName);
  if (!r.ok) return r;
  db.put("park", park);
  db.flush("park");
  emit("parkHandedOver", { park, newOwnerId });
  return { ok: true };
}

export function setOpen(open) {
  const park = getPark();
  if (!park) return;
  park.open = open;
  db.put("park", park);
  db.flush("park");
}

export function setEntrance(dimensionId, pos) {
  const park = getPark();
  if (!park) return;
  park.entrance = pos ? { dimension: dimensionId, x: pos.x, y: pos.y, z: pos.z } : undefined;
  if (!pos) park.open = false;
  db.put("park", park);
}

// Set at a Ticket Booth; used only while a booth is paired with the entrance (visitors module).
export function setAdmission(price) {
  const park = getPark();
  if (!park) return;
  park.admissionPrice = price;
  db.put("park", park);
  db.flush("park");
}

// Guest services state (visitors module): litter on the paths and the donations carry.
/** @param {{ litter?: number, donationCarry?: number }} state */
export function setServiceState({ litter = undefined, donationCarry = undefined }) {
  const park = getPark();
  if (!park) return;
  if (litter !== undefined) park.litter = litter;
  if (donationCarry !== undefined) park.donationCarry = donationCarry;
  db.put("park", park);
}

export function setSetting(name, value) {
  const park = getPark();
  if (!park) return;
  park.settings[name] = value;
  // Sandbox mode is remembered for good (park/rules.js): the Park Ledger says the park has used it.
  if (name === "sandbox" && value) park.sandboxUsed = true;
  db.put("park", park);
  db.flush("park");
}

// Visitor numbers for the day and the latest rating (written by the visitors module through here).
export function recordVisitors({ guests = 0, revenue = 0, rating = undefined }) {
  const park = getPark();
  if (!park) return;
  park.today.guests += guests;
  park.today.revenue += revenue;
  if (rating) park.rating = rating;
  db.put("park", park);
}

export function rollDay(day) {
  const park = getPark();
  if (!park) return;
  park.lastDay = { guests: park.today.guests, revenue: park.today.revenue };
  park.today = { day, guests: 0, revenue: 0 };
  db.put("park", park);
}

export function setVisitorCarry(carry) {
  const park = getPark();
  if (!park) return;
  park.visitorCarry = carry;
  db.put("park", park);
}

// The fenced park area (0.1.101, kept by park/fence.js): once Aluminum Fence closes round the Park Deed's spot, the
// park is every column inside it, at any height. Until then the park has no ground at all (Austin, 2026-10-25: the
// fence is "Required"; 2026-10-26: "The zoo should just be where aluminum fences enclose", so the 500-block circle a
// park from before 0.1.101 kept is gone too).
let area;
let areaRead = false;
function fencedArea(park) {
  if (!areaRead) {
    areaRead = true;
    area = db.get("fence", "area")?.last;
  }
  return area && park && area.dimension === park.dimension && area.cx === park.center.x && area.cz === park.center.z ? area : undefined;
}

/** park/fence.js hands over the area each time a fence closes (or undefined when the fence is all gone). */
export function setFencedArea(next) {
  area = next;
  areaRead = true;
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

export function insidePark(dimensionId, pos) {
  const park = getPark();
  if (!park || park.dimension !== dimensionId) return false;
  return insideParkColumn(park, pos.x, pos.z);
}

export function anyMemberOnline() {
  const park = getPark();
  if (!park) return false;
  return onlinePlayers().some((p) => park.members[p.id]);
}

// Called once per real second. Advances active park time and tells the simulation which
// periods passed. Paused while no member is online (spec section 2).
export function tickClock() {
  const park = getPark();
  if (!park || !anyMemberOnline()) return;
  const r = advance(park.clock, 1, BALANCE.clock);
  db.put("park", park);
  emit("parkSecond", { parkTime: park.clock.seconds });
  for (let i = 0; i < r.simSteps; i++) emit("simStep", { seconds: BALANCE.clock.simEvery, parkTime: park.clock.seconds });
  for (let i = 0; i < r.visitorSteps; i++) emit("visitorStep", { seconds: BALANCE.clock.visitorEvery, parkTime: park.clock.seconds });
  if (r.daysAdvanced > 0) emit("parkDay", { day: r.day, parkTime: park.clock.seconds });
}

// Debug: run a full park day of simulation now (for testing; the same code paths as real time).
export function skipTime(seconds) {
  const park = getPark();
  if (!park) return;
  for (let i = 0; i < seconds; i++) {
    const r = advance(park.clock, 1, BALANCE.clock);
    for (let s = 0; s < r.simSteps; s++) emit("simStep", { seconds: BALANCE.clock.simEvery, parkTime: park.clock.seconds, skipped: true });
    for (let s = 0; s < r.visitorSteps; s++) emit("visitorStep", { seconds: BALANCE.clock.visitorEvery, parkTime: park.clock.seconds, skipped: true });
    if (r.daysAdvanced > 0) emit("parkDay", { day: r.day, parkTime: park.clock.seconds });
  }
  db.put("park", park);
}
