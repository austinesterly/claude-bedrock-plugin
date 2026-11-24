// Austin the resident's big livestream in the game (0.1.367; the rules are residents/streamRules.js). He asks at 80
// friendship (ui/residentMenu.js). The scene is played for the one player who answered: the screen fades, they are
// brought to the crocodile exhibit (its ground loaded first), stand still, and watch through a free camera while he
// goes in by the Keeper Gates (over the fence where there are none), films, takes out a steak, the crocodiles come
// (animals/predators.js lureTo), and he gets out. Nothing is written on the screen: his words are in chat. Banned, he
// stands at the park gate by day (posted there, as residents.js posts Darian and Dr. Foss) and says so.
import { system, world, InputPermissionCategory, EasingType } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { reportError } from "../core/log.js";
import { residentById } from "../data/residents.js";
import { message, onlinePlayers, center, dim } from "../platform/mc.js";
import { show } from "../ui/forms.js";
import { allExhibits, getExhibit, cellsOf, isInsideCells } from "../exhibits/exhibits.js";
import { camWay } from "../equipment/camRules.js";
import { trailPush, fanSpot } from "./showRules.js";
import { animalsIn, liveEntity } from "../animals/animals.js";
import { airlockWalk, isDenned, lureTo, clearIntent, exemptFromDanger } from "../animals/predators.js";
import { withLoadedIn } from "../fishing/islands.js";
import { arrivalSpots } from "../park/gate.js";
import { parkById } from "../park/park.js";
import { bondOf, saveBond } from "./bonds.js";
import { bondLine } from "./bondRules.js";
import { getResident, residentBody, postResident, unpostResident, movePosted, hideResident, POST_STATE } from "./residents.js";
import {
  STREAM_ID, STREAMER, STREAM_SPECIES, newStream, streamState, withAsked, withPlayed, withConfront, withUnban, pointsBack, streamGate,
  pickStage, pickCrocs, nearest, shotPlan, sceneSteps, readTicks, arrived, escaped, lookAt, timeToRun, atGate, pickLine,
} from "./streamRules.js";

const COL = "austinStream";
const STEAK = "zoocraft:steak";
const IN_SCENE = "zoocraft:stream_scene"; // on a player in the scene, so one cut short by leaving the world is lifted on return
const G = () => BALANCE.stream;

const rec = () => db.get(COL, STREAM_ID) ?? newStream();
const save = (r) => db.put(COL, r);

/** The scene playing now: { playerId, together, exId, phase, t0, ... } (one at a time). */
let scene;
/** After a scene: he stays by the exhibit a little, then goes home. */
let lingerUntil = 0;
let lastHeckle = 0;
let lastLine;

export const streamNow = () => streamState(rec());

function crocsIn(ex) {
  return animalsIn(ex).filter((a) => a.speciesId === STREAM_SPECIES && a.location?.kind === "exhibit");
}

/** Whether there are crocodiles on exhibit anywhere. */
export function hasCrocs() {
  return allExhibits().some((ex) => crocsIn(ex).length > 0);
}

/** For rewardRules.js: his invitation waits for crocodiles on exhibit, and is made once. */
export function streamNeeds(reward) {
  return reward?.needs !== "crocs" || streamGate(reward, hasCrocs(), streamNow());
}

/** He has asked (the question is on his menu until it is answered). */
export function streamAsked() {
  const r = rec();
  const next = withAsked(r);
  if (next !== r) save(next);
}

function say(player, key) {
  const res = residentById(STREAMER);
  const line = res && bondLine(res, key);
  if (line) message(player, `§f${res.name}: §7"${line}"`);
}
const tell = (player, text) => message(player, `§7${text}`);

function lock(player, on) {
  try {
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, !on);
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, !on);
    player.setDynamicProperty(IN_SCENE, on ? true : undefined);
  } catch (error) {
    reportError("stream lock", error);
  }
}

function fade(player) {
  try {
    player.camera.fade({ fadeColor: { red: 0, green: 0, blue: 0 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.6, fadeOutTime: 0.6 } });
  } catch {
    // no camera
  }
}

/** Whether nothing solid stands between a camera place and what it must show (0.1.369: no walls in the picture). */
function clearView(d, from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dy, dz);
  try {
    const here = d.getBlock({ x: Math.floor(from.x), y: Math.floor(from.y), z: Math.floor(from.z) });
    if (!here?.isAir) return false;
    if (len < 0.6) return true;
    return !d.getBlockFromRay(from, { x: dx / len, y: dy / len, z: dz / len }, { maxDistance: len - 0.4, includeLiquidBlocks: false, includePassableBlocks: false });
  } catch {
    return false;
  }
}

/** Puts the player's camera at the first place of a shot with a clear view. Returns where. */
function shot(player, name) {
  const s = scene;
  try {
    const plan = shotPlan(name, { outside: s.outside, stage: s.stage, croc: s.crocAt, ux: s.ux, uz: s.uz }, G());
    const d = player.dimension;
    const top = { x: plan.see[0].x + 0.01, y: plan.see[0].y + 3.5, z: plan.see[0].z };
    const v = plan.tries.find((t) => plan.see.every((p) => clearView(d, t.location, p))) ?? { location: top, rotation: lookAt(top, plan.see[0]) };
    player.camera.setCamera("minecraft:free", v);
    return v.location;
  } catch (error) {
    reportError("stream camera", error);
    return undefined;
  }
}

function setSteak(on) {
  try {
    const body = residentBody(STREAMER);
    if (body && body.getProperty(STEAK) !== on) body.setProperty(STEAK, on);
  } catch {
    // unloaded
  }
}

const yawFrom = (from, to) => (Math.atan2(-(to.x - from.x), to.z - from.z) * 180) / Math.PI;

function standable(d, c) {
  try {
    const feet = d.getBlock(c);
    const head = d.getBlock({ x: c.x, y: c.y + 1, z: c.z });
    const under = d.getBlock({ x: c.x, y: c.y - 1, z: c.z });
    return Boolean(feet?.isAir && head?.isAir && under && !under.isAir && !under.isLiquid);
  } catch {
    return false;
  }
}

/** The way in: its Keeper Gates, or the nearest stretch of fence a person can stand outside of. */
function wayIn(ex, cells, d, near) {
  const pair = ex.service?.[0];
  if (pair) {
    const w = airlockWalk(pair);
    return { outside: w.outside, inside: w.inside, gate: true };
  }
  let best;
  let bestD = Infinity;
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (cells.has(`${x + dx},${y},${z + dz}`) || cells.has(`${x + 2 * dx},${y},${z + 2 * dz}`)) continue;
      const dd = Math.hypot(x + 2 * dx - near.x, z + 2 * dz - near.z);
      if (dd >= bestD) continue;
      const out = [0, 1, -1].map((dy) => ({ x: x + 2 * dx, y: y + dy, z: z + 2 * dz })).find((c) => standable(d, c));
      if (!out) continue;
      best = { outside: out, inside: { x, y, z }, gate: false };
      bestD = dd;
    }
  }
  return best;
}

/** A place to stand near `at`, `back` blocks further from the exhibit (unit ux, uz) and `side` blocks across. */
function spotBy(d, at, ux, uz, tries) {
  for (const [back, side] of tries) {
    for (const dy of [0, 1, -1]) {
      const c = { x: Math.round(at.x + ux * back - uz * side), y: at.y + dy, z: Math.round(at.z + uz * back + ux * side) };
      if (standable(d, c)) return c;
    }
  }
  return undefined;
}

function landOf(cells) {
  const out = [];
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    const [x, y, z] = k.split(",").map(Number);
    out.push({ x, y, z });
  }
  return out;
}

function liveCrocs(ex) {
  const out = [];
  for (const a of crocsIn(ex)) {
    if (a.juvenile || isDenned(a.id)) continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    try {
      out.push({ id: e.id, pos: { x: e.location.x, y: e.location.y, z: e.location.z } });
    } catch {
      // unloaded
    }
  }
  return out;
}

function playerOf(id) {
  return onlinePlayers().find((p) => p.id === id);
}

function nearestCrocExhibit(player) {
  let best;
  let bestD = Infinity;
  for (const ex of allExhibits()) {
    if (ex.dimension !== player.dimension.id || !crocsIn(ex).length || !ex.controller) continue;
    const dd = Math.hypot(ex.controller.x - player.location.x, ex.controller.z - player.location.z);
    if (dd < bestD) {
      best = ex;
      bestD = dd;
    }
  }
  return best;
}

function letCrocsGo() {
  for (const c of scene?.crocs ?? []) clearIntent(c.id, "lure");
}

/** The scene is over, played through or not: the player has their view and their legs back. */
function finish(played) {
  const s = scene;
  if (!s) return;
  letCrocsGo();
  setSteak(false);
  hideResident(STREAMER, false);
  const player = playerOf(s.playerId);
  if (player) {
    try {
      player.camera.clear();
    } catch {
      // no camera to give back
    }
    lock(player, false);
  }
  exemptFromDanger(s.playerId, false);
  scene = undefined;
  if (!played) {
    if (getResident(STREAMER)?.post?.why === "stream") unpostResident(STREAMER, true);
    if (player) say(player, "streamFail");
    return;
  }
  save(withPlayed(rec(), s.together));
  lingerUntil = system.currentTick + G().linger;
  if (!player) return;
  if (s.together) tell(player, "The stream is over. Austin is still buzzing.");
  else confrontPage(player).catch((error) => reportError("stream confront", error));
}

function wayWords(player, ex) {
  const at = player.location;
  const blocks = Math.round(Math.hypot(ex.controller.x + 0.5 - at.x, ex.controller.z + 0.5 - at.z));
  const way = camWay(at, ex.controller);
  return way === "here" ? "right here" : `about ${blocks} blocks ${way}`;
}

/**
 * Yes or No to his question. No is not a way out of it: he goes in anyway. 0.1.369 (Austin: "some room for the player
 * to take some initiative ... when the player walks with Austin to the crocs"): on a Yes he walks behind the player to
 * the exhibit; on a No he runs off there, and the scene starts when the player comes, or without them after a while.
 */
export function answerStream(player, yes) {
  if (streamNow() !== "asked") return;
  if (scene) return say(player, "streamBusy");
  const ex = nearestCrocExhibit(player);
  const res = getResident(STREAMER);
  if (!ex || !res) return say(player, "streamNoCrocs");
  say(player, yes ? "streamYes" : "streamNo");
  const now = system.currentTick;
  if (!postResident(STREAMER, res.dimension, res.pos, "stream", true)) return;
  scene = { playerId: player.id, together: yes, exId: ex.id, phase: "walk", t0: now, trail: [], lastHint: now, dimension: player.dimension.id };
  if (yes) tell(player, `Walk to the crocodile exhibit and Austin comes with you. It is ${wayWords(player, ex)}.`);
  else {
    hideResident(STREAMER, true);
    tell(player, `Austin has run off to the crocodile exhibit. It is ${wayWords(player, ex)}. Go and see what he is up to.`);
  }
}

/** Everyone's marks, once the exhibit has been measured and its blocks can be read. False while they can't. */
function prepare(player, ex, d) {
  const cells = cellsOf(ex.id);
  if (!cells) return false;
  const now = getExhibit(ex.id) ?? ex;
  const way = wayIn(now, cells, d, player.location);
  const picked = way && pickStage(landOf(cells), way.inside, G());
  if (!picked) return false;
  const s = scene;
  const out = center(way.outside);
  const stage = center(picked.stage);
  const len = Math.hypot(out.x - stage.x, out.z - stage.z) || 1;
  const ux = (out.x - stage.x) / len;
  const uz = (out.z - stage.z) / len;
  const back = spotBy(d, way.outside, ux, uz, [[3, 0], [3, 1], [3, -1], [2, 0], [4, 0], [2, 1], [2, -1]]);
  const side = spotBy(d, way.outside, ux, uz, [[1, 1], [1, -1], [2, 1], [2, -1], [1, 0], [2, 0]]);
  Object.assign(s, { outside: out, stage, beside: center(picked.beside), back: center(back ?? way.outside), side: center(side ?? back ?? way.outside), gate: way.gate, ux, uz, ready: true });
  return true;
}

/** The cut scene starts: the screen fades, the player is held still by the way in, and he is at it. */
function startCut(player) {
  const s = scene;
  fade(player);
  lock(player, true);
  exemptFromDanger(player.id, true);
  hideResident(STREAMER, false);
  postResident(STREAMER, s.dimension, s.outside, "stream", true);
  movePosted(STREAMER, s.outside, yawFrom(s.outside, { x: s.outside.x + s.ux, z: s.outside.z + s.uz }), false);
  try {
    player.teleport(s.together ? s.side : s.back, { facingLocation: { x: s.outside.x, y: s.outside.y + 1.5, z: s.outside.z }, keepVelocity: false });
  } catch (error) {
    reportError("stream teleport", error);
  }
  s.phase = "cut";
  s.steps = sceneSteps(s.together, s.gate);
  s.i = 0;
  s.next = system.currentTick + 25; // the fade
}

/** After a No, when the player never came: they are brought to the exhibit (its ground loaded first) to see it. */
function fetch(player, ex) {
  const s = scene;
  s.phase = "loading";
  fade(player);
  lock(player, true);
  const d = player.dimension;
  const b = ex.bbox ?? { min: ex.controller, max: ex.controller };
  withLoadedIn(d, "zc_stream", { x: b.min.x - 8, z: b.min.z - 8 }, { x: b.max.x + 8, z: b.max.z + 8 }, async () => {
    for (let waited = 0; scene === s && !prepare(player, ex, d); waited += 10) {
      if (waited >= G().loadWait || !player.isValid) {
        if (scene === s) finish(false);
        return;
      }
      await system.waitTicks(10);
    }
    if (scene !== s) return;
    startCut(player);
    await system.waitTicks(20);
  }).catch((error) => {
    reportError("stream load", error);
    if (scene === s) finish(false);
  });
}

function walkStep(now, player) {
  const s = scene;
  const g = G();
  const ex = getExhibit(s.exId);
  if (!ex || player.dimension.id !== s.dimension) return finish(false);
  if (s.together) {
    // he walks the player's own trail, a few steps behind
    let at;
    let yaw = 0;
    try {
      at = player.location;
      yaw = player.getRotation().y;
    } catch {
      return;
    }
    const moved = trailPush(s.trail, at, yaw, g.trail);
    const spot = fanSpot(s.trail, 0, g.trail);
    if (spot) movePosted(STREAMER, { x: spot.x, y: spot.y, z: spot.z }, moved ? spot.yaw : yawFrom(spot, at), moved);
  }
  const near = Math.hypot(ex.controller.x - player.location.x, ex.controller.z - player.location.z) <= 64;
  if (near && (s.ready || (now % 20 < 2 && prepare(player, ex, player.dimension))) && arrived(player.location, s.outside, g)) return startCut(player);
  if (!s.together && now - s.t0 >= g.noWait) return fetch(player, ex);
  if (now - s.lastHint >= g.hintTicks) {
    s.lastHint = now;
    tell(player, s.together ? `The crocodile exhibit is ${wayWords(player, ex)}. Austin is right behind you.` : `Austin is at the crocodile exhibit, ${wayWords(player, ex)}.`);
  }
}

/** One step of the cut scene. Returns the words it put in chat: the next step waits for them to be read. */
function step(player, name) {
  const s = scene;
  const g = G();
  const res = residentById(STREAMER);
  const line = (key) => {
    const text = bondLine(res, key);
    message(player, `§f${res.name}: §7"${text}"`);
    return text;
  };
  const inward = { x: s.stage.x - s.ux, z: s.stage.z - s.uz };
  if (name === "live") {
    shot(player, "live");
    return line(s.together ? "streamLiveWith" : "streamLive");
  }
  if (name === "enter") {
    movePosted(STREAMER, s.stage, yawFrom(s.stage, inward), false);
    if (s.together) {
      try {
        player.teleport(s.beside, { facingLocation: { x: inward.x - s.ux * 4, y: s.stage.y + 1, z: inward.z - s.uz * 4 }, keepVelocity: false });
      } catch (error) {
        reportError("stream teleport", error);
      }
    }
    shot(player, "in");
    const how = s.gate ? `Austin slips in through the Keeper Gates${s.together ? ", and you go with him" : ""}.` : `Austin climbs over the fence${s.together ? ", and you go with him" : ""}.`;
    tell(player, how);
    return `${how} ${line("streamIn")}`;
  }
  if (name === "crocs") {
    const ex = getExhibit(s.exId);
    s.crocs = ex ? pickCrocs(liveCrocs(ex), s.stage, g) : [];
    s.crocAt = s.crocs[0]?.pos;
    shot(player, "crocs");
    return line("streamFilm");
  }
  if (name === "face") {
    shot(player, "face");
    return line("streamFilm2");
  }
  if (name === "steak") {
    s.steak = true;
    return line("streamSteak");
  }
  if (name === "chase") {
    const cell = { x: Math.floor(s.stage.x), y: Math.floor(s.stage.y), z: Math.floor(s.stage.z) };
    for (const c of s.crocs ?? []) lureTo(c.id, cell);
    s.chaseAt = system.currentTick;
    s.chasing = true;
    s.chaseShot = shot(player, "chase");
    const words = s.crocs?.length ? "The crocodiles have smelled the steak. Here they come." : "The crocodiles stay where they are. Austin waves the steak harder.";
    tell(player, words);
    return words;
  }
  if (name === "run") {
    letCrocsGo();
    s.steak = false;
    movePosted(STREAMER, s.outside, yawFrom(s.outside, { x: s.outside.x + s.ux, z: s.outside.z + s.uz }), false);
    if (s.together) {
      try {
        player.teleport(s.side, { facingLocation: { x: s.stage.x, y: s.stage.y + 1, z: s.stage.z }, keepVelocity: false });
      } catch (error) {
        reportError("stream teleport", error);
      }
    }
    shot(player, "out");
    const how = s.together ? "Austin hauls you back over the fence with a second to spare." : s.gate ? "Austin is out through the gates with a second to spare." : "Austin is back over the fence with a second to spare.";
    tell(player, how);
    return `${how} ${line("streamRun")}`;
  }
  if (name === "escape") {
    // 0.1.369 (Austin: "room for the player to take some initiative and move as well. Like the escape"): the camera
    // and their legs are theirs again, inside; he is out already; the dropped steak holds the crocodiles a while.
    s.steak = false;
    movePosted(STREAMER, s.back, yawFrom(s.back, s.stage), false);
    try {
      player.camera.clear();
    } catch {
      // no camera to give back
    }
    lock(player, false);
    s.phase = "escape";
    s.escAt = system.currentTick;
    const text = line("streamEscape");
    tell(player, "§cRUN! §7Get out through the Keeper Gates. The dropped steak holds the crocodiles for a few seconds.");
    return text;
  }
  if (name === "made") return line(s.together ? "streamMadeWith" : "streamMade");
  finish(true);
  return "";
}

function chaseStep(now, player) {
  const s = scene;
  const g = G();
  const ex = getExhibit(s.exId);
  const ids = new Set((s.crocs ?? []).map((c) => c.id));
  const live = ex ? liveCrocs(ex).filter((c) => ids.has(c.id)) : [];
  const first = [...live].sort((a, b) => Math.hypot(a.pos.x - s.stage.x, a.pos.z - s.stage.z) - Math.hypot(b.pos.x - s.stage.x, b.pos.z - s.stage.z))[0];
  if (first && s.chaseShot && now - (s.aimed ?? 0) >= g.cam.followTicks) {
    // the camera stays where it is and turns with the nearest of them
    s.aimed = now;
    const look = { x: (s.stage.x + first.pos.x) / 2, y: s.stage.y + 0.8, z: (s.stage.z + first.pos.z) / 2 };
    try {
      player.camera.setCamera("minecraft:free", { location: s.chaseShot, rotation: lookAt(s.chaseShot, look), easeOptions: { easeTime: g.cam.followTicks / 20, easeType: EasingType.Linear } });
    } catch (error) {
      reportError("stream camera", error);
    }
  }
  if (!timeToRun(now - s.chaseAt, nearest(live, s.stage), g)) return;
  s.chasing = false;
  s.next = now;
}

function escapeStep(now, player) {
  const s = scene;
  const g = G();
  let inside = false;
  let at;
  try {
    at = player.location;
    const c = { x: Math.floor(at.x), y: Math.floor(at.y), z: Math.floor(at.z) };
    inside = isInsideCells(s.exId, c, ["land", "water"]) || isInsideCells(s.exId, { ...c, y: c.y + 1 }, ["water"]);
  } catch {
    return;
  }
  const since = now - s.escAt;
  if (!s.graceOver && since >= g.grace) {
    s.graceOver = true;
    letCrocsGo();
    exemptFromDanger(player.id, false);
    if (inside) tell(player, "§cThe steak is gone. The crocodiles have noticed you.");
  }
  if (!escaped(at, inside, s) && since < g.escapeMax) return;
  letCrocsGo();
  exemptFromDanger(player.id, false);
  s.phase = "cut";
  s.next = now + 10;
}

function sceneStep(now) {
  const s = scene;
  const player = playerOf(s.playerId);
  const res = getResident(STREAMER);
  if (!player || !res || (s.phase !== "loading" && res.state !== POST_STATE)) return finish(false);
  if (s.phase === "loading") return;
  if (s.phase === "walk") return walkStep(now, player);
  setSteak(Boolean(s.steak));
  if (s.phase === "escape") return escapeStep(now, player);
  if (s.chasing) return chaseStep(now, player);
  if (now < s.next) return;
  const name = s.steps[s.i++];
  const words = step(player, name);
  if (scene !== s) return;
  s.next = now + readTicks(words, G());
}

/** The confrontation after he went in against a No: on a page of his own; closed, it is on his menu. */
export async function confrontPage(player) {
  if (streamNow() !== "confront") return;
  const res = residentById(STREAMER);
  const form = new ActionFormData().title(res.name).body(`§f"${bondLine(res, "streamConfront")}"`).button("That was cool!").button("You're never allowed in the zoo again");
  const a = await show(player, form);
  if (!a || a.selection === undefined || streamNow() !== "confront") return;
  const cool = a.selection === 0;
  const b = bondOf(STREAMER, player.id);
  save(withConfront(rec(), cool, player.id, b.points));
  if (cool) return say(player, "streamCool");
  saveBond({ ...b, points: 0 }, player);
  say(player, "streamBanned");
  tell(player, "Austin is banned from the zoo. Your friendship with him is gone. He will be at the park gate by day; let him back in there and you have it back.");
  lingerUntil = 0;
}

/** Let back in (his menu, at the gate): everyone he lost gets their friendship back, and he goes home for today. */
export function unbanStream(player) {
  const r = rec();
  if (streamState(r) !== "banned") return;
  for (const id of Object.keys(r.prev ?? {})) {
    const b = bondOf(STREAMER, id);
    saveBond({ ...b, points: pointsBack(r, id, b.points) }, id === player.id ? player : undefined);
  }
  save(withUnban(r));
  say(player, "streamBack");
  tell(player, "Austin is allowed in the zoo again. Your friendship with him is back where it was.");
  hideResident(STREAMER, false);
  if (getResident(STREAMER)?.post?.why === "gate") unpostResident(STREAMER, true);
}

function gateSpot(res) {
  const park = parkById(res.parkId);
  const spots = arrivalSpots(park);
  if (spots.length) return { dimension: spots[0].dimension, pos: center(spots[spots.length - 1]) };
  const ent = park?.entrance;
  return ent ? { dimension: ent.dimension, pos: center(ent) } : undefined;
}

function bannedStep(now) {
  const g = G();
  const res = getResident(STREAMER);
  if (!res) return;
  let time = 0;
  try {
    time = world.getTimeOfDay();
  } catch {
    return;
  }
  const out = atGate(time, g);
  if (res.state !== POST_STATE || res.post?.why !== "gate") {
    if (res.state === "asleep") return; // he is put at the gate when he is up
    const spot = gateSpot(res);
    if (!spot || !postResident(STREAMER, spot.dimension, spot.pos, "gate", true)) return;
  }
  hideResident(STREAMER, !out);
  if (!out || now - lastHeckle < g.heckleTicks) return;
  const at = getResident(STREAMER);
  const line = pickLine(residentById(STREAMER)?.lines?.heckle, lastLine);
  if (!line || !at?.pos) return;
  let heard = false;
  for (const p of onlinePlayers()) {
    if (p.dimension.id !== at.dimension || Math.hypot(p.location.x - at.pos.x, p.location.z - at.pos.z) > g.sayRange) continue;
    message(p, `§fAustin §8(to his stream)§f: §7"${line}"`);
    heard = true;
  }
  if (heard) {
    lastHeckle = now;
    lastLine = line;
  }
}

/** Every 2 ticks. */
export function tickStream() {
  const now = system.currentTick;
  if (scene) return sceneStep(now);
  const state = streamNow();
  if (state === "banned") {
    if (now % 20 < 2) bannedStep(now);
    return;
  }
  if (lingerUntil && now >= lingerUntil) {
    lingerUntil = 0;
    if (getResident(STREAMER)?.post?.why === "stream") unpostResident(STREAMER, true);
  } else if (!lingerUntil && now % 200 < 2) {
    const res = getResident(STREAMER);
    if (res?.post?.why === "stream" || res?.post?.why === "gate") unpostResident(STREAMER, true); // left there by a world that closed mid-scene
  }
}

/** A scene cut short by leaving the world: the player may move and see again. */
export function streamSpawn(player) {
  try {
    if (player.getDynamicProperty(IN_SCENE) && scene?.playerId !== player.id) {
      lock(player, false);
      player.camera.clear();
    }
  } catch (error) {
    reportError("stream spawn", error);
  }
}

/** For the test server. */
export function streamDebug() {
  const s = scene;
  const res = getResident(STREAMER);
  return { state: streamNow(), rec: rec(), scene: s ? { phase: s.phase, together: s.together, step: s.steps?.[(s.i ?? 1) - 1], chasing: s.chasing, crocs: s.crocs?.length, gate: s.gate, ready: s.ready, since: system.currentTick - s.t0 } : undefined, austin: res ? { state: res.state, why: res.post?.why, pos: res.pos } : undefined, crocs: hasCrocs() };
}
export function streamSet(state) {
  save({ ...rec(), state });
}
