// Zach's show with the player (0.1.374; rules residents/concertRules.js). At 100 friendship he asks; on a night he is
// out singing the player joins him from his menu. Every resident free to come is posted in rings round him ("concert"),
// a row of guests stands behind them and the park's guests are drawn in; the player plays their Guitar; "We're done" on
// his menu ends it, everyone goes home and the park is paid. Nothing is saved but the day of the last show.
import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { ENTITIES } from "../data/items.js";
import { residentById } from "../data/residents.js";
import { db } from "../persistence/db.js";
import { newId } from "../core/ids.js";
import { reportError } from "../core/log.js";
import { getResident, allResidents, postResident, unpostResident, movePosted, gatherable, POST_STATE } from "./residents.js";
import { bondOf } from "./bonds.js";
import { bondLine } from "./bondRules.js";
import { buskingNow, holdShow } from "./busking.js";
import { BUSKER, showTime } from "./buskRules.js";
import { CONCERT_WHY, CONCERT_ID, hasInvite, startWhy, ringSpots, enoughPlayed, payFor, cheerAt, endWhy } from "./concertRules.js";
import { onGuitarNote } from "../equipment/guitar.js";
import { newVisitor } from "../visitors/guests.js";
import { earn } from "../economy/economy.js";
import { coinsText } from "../economy/bankRules.js";
import { parkById, withPark } from "../park/park.js";
import { dim, message } from "../platform/mc.js";

const COL = "zachConcert";
const G = () => BALANCE.concert;
const CHEERS = ["§7The crowd cheers.", "§7Someone at the back whistles.", "§7The whole town claps along.", "§7\"Encore!\" somebody shouts.", "§7The crowd sways with the tune."];
let c; // the show on now: { playerId, parkId, dimension, center, notes, posted: [resident ids], fans: [entity ids] }
const fanIds = new Set();

const record = () => db.get(COL, CONCERT_ID) ?? { id: CONCERT_ID };
const say = (player, key) => message(player, `§f${residentById(BUSKER).name}: §7"${bondLine(residentById(BUSKER), key)}"`);
const night = () => showTime(world.getTimeOfDay(), BALANCE.busk);

/** Guest entities this module stands in the crowd: guests.js must not clear them away. */
export const isConcertGuest = (entityId) => fanIds.has(entityId);
/** Whether a show is on, and whether it is this player's. */
export const concertOn = () => Boolean(c);
export const concertOf = (player) => Boolean(c && c.playerId === player.id);
export const invited = (player) => hasInvite(bondOf(BUSKER, player.id));

/** Why this player cannot start a show now ("uninvited", "running", "night", "played"), or undefined. */
export function concertWhy(player) {
  return startWhy({ invited: invited(player), running: concertOn(), night: night(), singing: buskingNow(), lastDay: record().lastDay, day: world.getDay() });
}

function standable(d, p) {
  try {
    const feet = d.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });
    return Boolean(feet && feet.isAir && feet.above()?.isAir && !feet.below()?.isAir && !feet.below()?.isLiquid);
  } catch {
    return false;
  }
}

function dropFans() {
  for (const id of fanIds) {
    try {
      world.getEntity(id)?.remove();
    } catch {
      // already gone
    }
  }
  fanIds.clear();
}

/** The show begins: everyone gathers round him. Returns whether it began. */
export function startConcert(player) {
  const why = concertWhy(player);
  if (why) {
    say(player, why === "played" ? "concertAgain" : "concertWhen");
    return false;
  }
  const zach = getResident(BUSKER);
  if (!zach) return false;
  const g = G();
  const d = dim(zach.dimension);
  const spots = ringSpots(zach.pos, g).filter((p) => standable(d, p));
  c = { playerId: player.id, parkId: zach.parkId, dimension: zach.dimension, center: { ...zach.pos }, notes: 0, posted: [] };
  holdShow(true);
  // the residents, nearest rings first
  for (const rec of allResidents()) {
    if (rec.id === BUSKER || rec.parkId !== zach.parkId || !gatherable(rec) || !residentById(rec.id)) continue;
    const spot = spots.shift();
    if (!spot) break;
    if (!postResident(rec.id, zach.dimension, spot, CONCERT_WHY, true)) continue;
    movePosted(rec.id, spot, spot.yaw, false);
    c.posted.push(rec.id);
  }
  // and a row of guests behind them
  for (let i = 0; i < g.guests && spots.length; i++) {
    const spot = spots.shift();
    try {
      const e = d.spawnEntity(ENTITIES.guest, { x: spot.x, y: spot.y, z: spot.z });
      e.setProperty("zoocraft:look", newVisitor().look);
      e.triggerEvent("zoocraft:travel");
      e.teleport({ x: spot.x, y: spot.y, z: spot.z }, { rotation: { x: 0, y: spot.yaw }, keepVelocity: false });
      fanIds.add(e.id);
    } catch {
      // not loaded there
    }
  }
  say(player, "concertStart");
  message(player, `§7${c.posted.length} residents and a crowd of guests have gathered. Play your Guitar. When you are done, tell Zach.`);
  return true;
}

/** The show ends: `why` is "done" (the player said so), or what ended it ("gone", "far", "day"). */
export function endConcert(why) {
  if (!c) return;
  const show = c;
  c = undefined;
  for (const id of show.posted) {
    const rec = getResident(id);
    if (rec?.state === POST_STATE && rec.post?.why === CONCERT_WHY) unpostResident(id, true);
  }
  dropFans();
  holdShow(false);
  const player = world.getAllPlayers().find((p) => p.id === show.playerId);
  const coins = payFor(show.notes, G());
  if (coins > 0) {
    const park = parkById(show.parkId);
    if (park) withPark(park, () => earn(coins, "Zach's show: playing with Zach", newId("concert")));
    db.put(COL, { ...record(), lastDay: world.getDay() });
  }
  if (!player) return;
  if (coins > 0) {
    say(player, why === "day" ? "concertDay" : "concertDone");
    message(player, `§aThe crowd goes wild. The park is paid ${coinsText(coins)} for the show.`);
  } else say(player, why === "far" ? "concertFar" : "concertEarly");
}

/** "We're done" on his menu. With too little played he asks for more, and the show goes on. */
export function finishConcert(player) {
  if (!concertOf(player)) return;
  if (!enoughPlayed(c.notes, G())) {
    say(player, "concertMore");
    message(player, `§7Use your Guitar to play: ${c.notes} of ${G().minNotes} notes so far. Walk away to call the show off.`);
    return;
  }
  endConcert("done");
}

function note(player) {
  if (!concertOf(player)) return;
  c.notes++;
  if (cheerAt(c.notes, G())) message(player, CHEERS[Math.floor(Math.random() * CHEERS.length)]);
}

/** Every second. */
export function tickConcert() {
  try {
    if (!c) {
      // after a reload: nobody is left standing at a show that is over
      for (const rec of allResidents()) if (rec.state === POST_STATE && rec.post?.why === CONCERT_WHY) unpostResident(rec.id, true);
      return;
    }
    const player = world.getAllPlayers().find((p) => p.id === c.playerId);
    let distance = Infinity;
    try {
      if (player && player.dimension.id === c.dimension) distance = Math.hypot(player.location.x - c.center.x, player.location.z - c.center.z);
    } catch {
      // leaving
    }
    const why = endWhy({ playerHere: Boolean(player), distance, night: night(), singing: buskingNow() }, G());
    if (why) endConcert(why);
  } catch (error) {
    reportError("concert", error);
  }
}

export function wireConcert() {
  onGuitarNote(note);
}

/** For the test server. */
export function concertDebug() {
  return { on: Boolean(c), notes: c?.notes, posted: c?.posted.length, fans: fanIds.size, lastDay: record().lastDay, day: world.getDay(), tick: system.currentTick };
}
