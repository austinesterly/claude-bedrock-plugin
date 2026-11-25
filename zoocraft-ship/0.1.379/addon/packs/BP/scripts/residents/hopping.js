// Carrot among the rabbits (0.1.379; rules residents/hopRules.js). While she is at the zoo by day and an exhibit has
// rabbits on show, she is posted inside it ("hop") and hops from spot to spot. The first time a player comes near that
// day chat says where she is; on her menu there, "Send her home for the day" or "Let her hop".
import { system, world } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { db } from "../persistence/db.js";
import { reportError } from "../core/log.js";
import { allExhibits, getExhibit, cellsOf } from "../exhibits/exhibits.js";
import { animalsIn } from "../animals/animals.js";
import { parkById } from "../park/park.js";
import { getResident, postResident, unpostResident, movePosted, residentHeld, gatherable, POST_STATE } from "./residents.js";
import { bondLine } from "./bondRules.js";
import { HOPPER, HOP_WHY, RABBIT, canHop, keepsHopping, nextHop, hopAt, hopYaw } from "./hopRules.js";
import { message, onlinePlayers } from "../platform/mc.js";

const G = () => BALANCE.hop;
const COL = "carrotHop";
const KEY = "state";
let s; // this visit among the rabbits: { exId, land, from, to, t0, restUntil, told: Set }; never saved

const saved = () => db.get(COL, KEY) ?? { id: KEY };
const posted = (rec) => rec?.state === POST_STATE && rec.post?.why === HOP_WHY;
const rabbitsIn = (ex) => animalsIn(ex).filter((a) => a.speciesId === RABBIT && a.location?.kind === "exhibit").length;

/** Whether she is in with the rabbits now. */
export const hoppingNow = () => posted(getResident(HOPPER));

function landOf(exId) {
  const cells = cellsOf(exId);
  const out = [];
  if (!cells) return out;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    out.push({ x, y, z });
  }
  return out;
}

function say(player, key) {
  const res = residentById(HOPPER);
  message(player, `§f${res.name}: §7"${bondLine(res, key)}"`);
}

function start(rec, now) {
  for (const ex of allExhibits()) {
    if (ex.dimension !== rec.dimension || ex.parkId !== rec.parkId || !rabbitsIn(ex)) continue;
    const land = landOf(ex.id);
    if (land.length < G().minLand) continue;
    const c = land[Math.floor(Math.random() * land.length)];
    const at = { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
    if (!postResident(HOPPER, ex.dimension, at, HOP_WHY)) return;
    s = { exId: ex.id, land, restUntil: now + G().rest[0], told: new Set() };
    return;
  }
}

function end(home) {
  s = undefined;
  if (hoppingNow()) unpostResident(HOPPER);
  return home;
}

// A player who comes near hears where she is, once a visit.
function notice(rec, ex) {
  for (const p of onlinePlayers()) {
    try {
      if (s.told.has(p.id) || p.dimension.id !== rec.dimension || Math.hypot(p.location.x - rec.pos.x, p.location.z - rec.pos.z) > G().seeRange) continue;
      s.told.add(p.id);
      message(p, `§7${residentById(HOPPER).name} is in the ${ex?.name ?? "rabbit"} exhibit, hopping about with the rabbits. Talk to her to send her home for the day, or let her be.`);
    } catch {
      // leaving
    }
  }
}

/** Every other tick. */
export function tickHopping() {
  const now = system.currentTick;
  const rec = getResident(HOPPER);
  if (!rec) {
    s = undefined;
    return;
  }
  const park = parkById(rec.parkId);
  const day = world.getDay();
  const o = { parkOpen: Boolean(park?.open), time: world.getTimeOfDay(), day, sentDay: saved().sentDay, g: G() };
  if (!posted(rec)) {
    s = undefined;
    if (now % 40 < 2 && canHop({ ...o, state: rec.state, gatherable: gatherable(rec), held: residentHeld(HOPPER) })) start(rec, now);
    return;
  }
  const ex = s ? getExhibit(s.exId) : undefined;
  if (!s || !ex || !keepsHopping({ ...o, rabbits: rabbitsIn(ex) })) return end();
  if (now % 20 < 2) notice(rec, ex);
  if (residentHeld(HOPPER)) {
    if (s.to) {
      movePosted(HOPPER, s.to, undefined, false); // she lands and stands for the talk
      s.to = undefined;
    }
    s.restUntil = now + G().rest[0];
    return;
  }
  if (s.to) {
    const k = (now - s.t0) / G().hopTicks;
    const at = k >= 1 ? s.to : hopAt(s.from, s.to, k, G().height);
    movePosted(HOPPER, at, s.yaw, k < 1);
    if (k >= 1) {
      s.to = undefined;
      s.restUntil = now + G().rest[0] + Math.floor(Math.random() * (G().rest[1] - G().rest[0]));
    }
    return;
  }
  if (now < s.restUntil) return;
  const to = nextHop(s.land, rec.pos, G().reach);
  if (!to) {
    s.restUntil = now + G().rest[1];
    return;
  }
  Object.assign(s, { from: { ...rec.pos }, to, t0: now, yaw: hopYaw(rec.pos, to) });
}

/** "Send her home for the day": she leaves the exhibit and stays out of it till tomorrow. */
export function sendHopperHome(player) {
  try {
    if (!hoppingNow()) return;
    db.put(COL, { ...saved(), sentDay: world.getDay() });
    say(player, "hopSent");
    end();
    message(player, `§7${residentById(HOPPER).name} goes home for the day.`);
  } catch (error) {
    reportError("hop home", error);
  }
}

/** "Let her hop". */
export function letHop(player) {
  if (hoppingNow()) say(player, "hopLet");
}

/** Bench only. */
export function hopDebug() {
  const rec = getResident(HOPPER);
  return { state: rec?.state, why: rec?.post?.why, pos: rec?.pos && [Math.round(rec.pos.x * 10) / 10, Math.round(rec.pos.y * 10) / 10, Math.round(rec.pos.z * 10) / 10], ex: s && getExhibit(s.exId)?.name, land: s?.land.length, hopping: Boolean(s?.to), sentDay: saved().sentDay, day: world.getDay(), time: world.getTimeOfDay() };
}
