// The named zookeepers at work (0.1.361; Austin's spec, research/ZooCraft_Tycoon_Specialized_Zookeepers_Spec.md; the
// rules are zookeeperRules.js). Stevie, The Boulder, Dory and Ping are residents: a home, a mailbox, friendship, chats
// and Follow Me are the roster's own. This file joins them to the keepers' engine (staff.js): a hired zookeeper has a
// keeper record (`zoo`: their resident id), and on their day shift they stand in the Staff Room (posted there, as
// Darian is by the Void Portal) and are seen at their tasks as a keeper with their own face, one body at a time. Off
// shift they are a resident like any other. Hired from their application at a Resident Mailbox (ui/mailboxMenu.js),
// after the workroom is checked for the team as it would be with them.
import { world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { RESIDENTS, residentById } from "../data/residents.js";
import { getResident, residentsOfPark, postResident, unpostResident, movePosted, hideResident, moveIn, POST_STATE } from "../residents/residents.js";
import { leaveTimeOf } from "../residents/residentRules.js";
import { bestPoints, bondOf, saveBond } from "../residents/bonds.js";
import { getPark, parkById, withPark } from "../park/park.js";
import { db } from "../persistence/db.js";
import { dim, onlinePlayers, message } from "../platform/mc.js";
import { info } from "../core/log.js";
import { setStaffHooks, zookeepers, keeperOf, hireZookeeper, dismiss, setWork, teamHolds, workingRooms, allRooms, roomText, standSpot, retiredKeepers } from "./staff.js";
import { JOBS, efficiencyOf, canHire, overRoom, onDuty, thanksDue, sizeText, roomFor } from "./zookeeperRules.js";

const KEEPING = "keeping";
const ZOO = RESIDENTS.filter((r) => r.zookeeper).map((r) => r.id);
// States a zookeeper is taken from to their post: at home or on an everyday walk. Never while they follow a player,
// sleep, sit in class or are posted elsewhere.
const FREE = new Set(["inside", "leaving", "visiting", "returning", "waiting"]);
const placed = new Set(); // keeper ids whose body stands at a checked spot in the Staff Room

export const isZookeeper = (id) => ZOO.includes(id);

/** How well a zookeeper works (0.75 to 1): by the best friendship any player has with them. */
export function efficiencyNow(resId) {
  return efficiencyOf(bestPoints(resId), BALANCE.zookeepers);
}

function dutyNow(res) {
  return onDuty(world.getTimeOfDay(), leaveTimeOf(res, BALANCE.residents), BALANCE.residents.work.dayTo);
}

/** Why a hired zookeeper isn't working right now (staff.js shows it as their status), or undefined when they are. */
function dutyOf(k) {
  const rec = getResident(k.zoo);
  const res = residentById(k.zoo);
  if (!rec || !res) return "§eHas no home";
  if (rec.state === "following" || rec.state === "staying" || rec.state === "rejoining") return `Out with ${rec.follow?.name ?? "a player"}`;
  if (!dutyNow(res)) return "Off shift";
  if (rec.state !== POST_STATE || rec.post?.why !== KEEPING) return "On the way to work";
  return undefined;
}

/** Whether a zookeeper is on their shift at the zoo now (Follow Me waits till they are off). */
export function atWork(resId) {
  const rec = getResident(resId);
  return rec?.state === POST_STATE && rec.post?.why === KEEPING;
}

/** A hired zookeeper's page: their keeper record, job, efficiency and what the workroom needs. */
export function zookeeperState(resId) {
  const k = keeperOf(resId);
  if (!k) return undefined;
  const park = parkById(k.parkId);
  return withPark(park, () => {
    const team = zookeepers().map((z) => z.id);
    return { keeper: k, work: k.work, efficiency: efficiencyNow(resId), points: bestPoints(resId), team: team.length, holds: teamHolds(), over: overRoom(team, teamHolds()).includes(k.id), need: roomFor(team.length, BALANCE.zookeepers), unpaid: (k.owed?.length ?? 0) * BALANCE.staff.keeperWage, done: k.done ?? 0, atWork: atWork(resId), park };
  });
}

/** Give a hired zookeeper a job (one of zookeeperRules.js JOBS). Friendship, efficiency and home are untouched. */
export function assignWork(resId, jobId) {
  const k = keeperOf(resId);
  if (!k || !JOBS[jobId]) return false;
  return withPark(parkById(k.parkId), () => setWork(k, jobId));
}

/** Whether an application can be accepted into this home now: { ok } or { ok: false, why, need, text }. */
export function applicationCheck(home, resId) {
  const park = home?.parkId ? parkById(home.parkId) : undefined;
  if (!park) return { ok: false, why: "park", text: "This home's path doesn't reach a zoo yet." };
  if (keeperOf(resId) || getResident(resId)) return { ok: false, why: "hired", text: "They already work here." };
  return withPark(park, () => {
    const g = BALANCE.zookeepers;
    const team = zookeepers().length;
    const r = canHire(team, teamHolds(), workingRooms().length > 0, g);
    if (r.ok) return r;
    const room = allRooms()[0];
    const size = r.need ? sizeText(r.need) : "";
    const text = r.why === "full" ? "All four zookeepers already work here."
      : r.why === "room" ? `Zookeepers need a working Staff Room as their workroom first${room ? `. ${roomText(room)}` : ": a closed building with the Staff Room block inside it or against its outside wall."}`
      : `The workroom is too small for ${team + 1} zookeeper${team ? "s" : ""}. It needs at least ${size} blocks of floor inside (either way round, ${BALANCE.staff.roomMinSize} high). Make the Staff Room's building bigger, then accept the application.`;
    return { ...r, text };
  });
}

/** Accept an application: they move into the home and are employed. One of each, however many players ask at once. */
export function acceptApplication(home, resId) {
  const res = residentById(resId);
  const check = applicationCheck(home, resId);
  if (!res?.zookeeper || !check.ok) return check;
  if (!moveIn(home, resId)) return { ok: false, why: "home", text: `${res.name} can't move in here now.` };
  withPark(parkById(home.parkId), () => hireZookeeper(res, ZOO.indexOf(resId)));
  info(`zookeepers: ${res.name} hired into ${home.id}`);
  return { ok: true };
}

/** The thank-you speeches a player hasn't heard yet, by THEIR friendship with the zookeeper: the steps, lowest first. */
export function thanksFor(player, resId) {
  const b = bondOf(resId, player.id);
  return thanksDue(b.points ?? 0, b.thanked, BALANCE.zookeepers);
}

export function markThanked(player, resId, at) {
  const b = bondOf(resId, player.id);
  if ((b.thanked ?? []).includes(at)) return;
  saveBond({ ...b, thanked: [...(b.thanked ?? []), at] }, player);
}

// Every two seconds, for the scope's park: employment kept in step with who lives here, and each zookeeper put at
// their post for the shift or let go home after it.
export function tickZookeepers() {
  const park = getPark();
  if (!park) return;
  const gone = retiredKeepers();
  if (gone) for (const p of onlinePlayers()) message(p, `§eThe zoo's ${gone} unnamed keeper${gone === 1 ? " has" : "s have"} moved on. §fFour zookeepers now apply for the work by name: read their applications at a Resident Mailbox on an empty, ready home.`);
  // A zookeeper living here with no keeper record (moved in by a test setup, or a record lost) is employed; a keeper
  // record whose zookeeper moved out is ended. Friendship lives apart (bonds), so neither loses any.
  for (const rec of residentsOfPark(park.id)) {
    const res = residentById(rec.id);
    if (res?.zookeeper && !keeperOf(rec.id)) hireZookeeper(res, ZOO.indexOf(rec.id));
  }
  const team = zookeepers();
  const holds = teamHolds();
  const over = overRoom(team.map((k) => k.id), holds);
  const room = workingRooms().sort((a, b) => (b.holds ?? 1) - (a.holds ?? 1))[0];
  for (const k of team) {
    const rec = getResident(k.zoo);
    const res = residentById(k.zoo);
    if (!rec || !res) {
      placed.delete(k.id);
      dismiss(k);
      continue;
    }
    const posted = rec.state === POST_STATE && rec.post?.why === KEEPING;
    const want = Boolean(k.work) && !k.owed?.length && Boolean(room) && !over.includes(k.id) && dutyNow(res);
    if (posted && !want) {
      placed.delete(k.id);
      hideResident(k.zoo, false);
      unpostResident(k.zoo, true);
      continue;
    }
    if (!posted && want && FREE.has(rec.state)) {
      placed.delete(k.id);
      postResident(k.zoo, room.dimension, { x: room.pos.x + 0.5, y: room.pos.y + 1, z: room.pos.z + 0.5 }, KEEPING, true);
    }
    if ((posted || want) && room && !placed.has(k.id)) {
      // A spot to stand in the room, once its blocks are loaded (till then nobody is near enough to see a body).
      let spot;
      try {
        spot = dim(room.dimension).isChunkLoaded(room.pos) ? standSpot(room, team.indexOf(k)) : undefined;
      } catch {
        spot = undefined;
      }
      if (spot && movePosted(k.zoo, { x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 }, undefined, false)) placed.add(k.id);
    }
  }
}

export function initZookeepers() {
  setStaffHooks({ duty: dutyOf, efficiency: (k) => efficiencyNow(k.zoo), seen: (k, on) => hideResident(k.zoo, on) });
  info(`zookeepers: ${db.all("staff").filter((s) => s.zoo).length} of ${ZOO.length} employed`);
}
