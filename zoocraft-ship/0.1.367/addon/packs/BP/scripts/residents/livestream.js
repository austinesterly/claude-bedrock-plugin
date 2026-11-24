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
import { allExhibits, getExhibit, cellsOf } from "../exhibits/exhibits.js";
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
  pickStage, pickCrocs, nearest, shotOf, sceneBeats, timeToRun, atGate, pickLine,
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
  exemptFromDanger(player.id, on);
}

function fade(player) {
  try {
    player.camera.fade({ fadeColor: { red: 0, green: 0, blue: 0 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.6, fadeOutTime: 0.6 } });
  } catch {
    // no camera
  }
}

function shot(player, name, ease) {
  const s = scene;
  try {
    const v = shotOf(name, { outside: s.outside, stage: s.stage, croc: s.crocAt }, G());
    player.camera.setCamera("minecraft:free", ease ? { ...v, easeOptions: { easeTime: ease, easeType: EasingType.Linear } } : v);
  } catch (error) {
    reportError("stream camera", error);
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
  const player = playerOf(s.playerId);
  if (player) {
    try {
      player.camera.clear();
    } catch {
      // no camera to give back
    }
    lock(player, false);
  } else exemptFromDanger(s.playerId, false);
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

/** Yes or No to his question. No is not a way out of it: he goes in anyway. */
export function answerStream(player, yes) {
  if (streamNow() !== "asked") return;
  if (scene) return say(player, "streamBusy");
  const ex = nearestCrocExhibit(player);
  if (!ex) return say(player, "streamNoCrocs");
  say(player, yes ? "streamYes" : "streamNo");
  scene = { playerId: player.id, together: yes, exId: ex.id, phase: "loading", t0: system.currentTick, done: new Set() };
  fade(player);
  lock(player, true);
  const d = player.dimension;
  const b = ex.bbox ?? { min: ex.controller, max: ex.controller };
  const mine = scene;
  // The exhibit's ground is loaded before anyone is moved there, and kept until the player stands by it.
  withLoadedIn(d, "zc_stream", { x: b.min.x - 8, z: b.min.z - 8 }, { x: b.max.x + 8, z: b.max.z + 8 }, async () => {
    for (let waited = 0; scene === mine && !setStage(player, ex, d); waited += 10) {
      if (waited >= G().loadWait || !player.isValid) {
        if (scene === mine) finish(false);
        return;
      }
      await system.waitTicks(10);
    }
    await system.waitTicks(20);
  }).catch((error) => {
    reportError("stream load", error);
    if (scene === mine) finish(false);
  });
}

/** Everyone to their marks, once the exhibit has been measured. False while it hasn't. */
function setStage(player, ex, d) {
  const cells = cellsOf(ex.id);
  if (!cells) return false;
  const way = wayIn(getExhibit(ex.id) ?? ex, cells, d, player.location);
  const picked = way && pickStage(landOf(cells), way.inside, G());
  if (!picked) return false;
  const s = scene;
  const out = center(way.outside);
  const stage = center(picked.stage);
  const len = Math.hypot(out.x - stage.x, out.z - stage.z) || 1;
  const ux = (out.x - stage.x) / len;
  const uz = (out.z - stage.z) / len;
  const watch = spotBy(d, way.outside, ux, uz, s.together ? [[0, 1], [0, -1], [1, 1], [1, -1], [1, 0], [2, 0]] : [[3, 0], [3, 1], [3, -1], [2, 0], [4, 0], [2, 1], [2, -1], [1, 1], [1, -1], [1, 0]]);
  Object.assign(s, { outside: out, stage, beside: center(picked.beside), watch: center(watch ?? way.outside), gate: way.gate, ux, uz, dimension: d.id });
  if (!postResident(STREAMER, d.id, out, "stream", true)) return false;
  movePosted(STREAMER, out, yawFrom(out, { x: out.x + ux, z: out.z + uz }), false);
  try {
    player.teleport(s.watch, { dimension: d, facingLocation: { x: out.x, y: out.y + 1.5, z: out.z }, keepVelocity: false });
  } catch (error) {
    reportError("stream teleport", error);
    return false;
  }
  s.phase = "before";
  s.t0 = system.currentTick;
  return true;
}

function beat(player, name) {
  const s = scene;
  const g = G();
  const inward = { x: s.stage.x - s.ux, z: s.stage.z - s.uz };
  if (name === "live") {
    shot(player, "live");
    say(player, s.together ? "streamLiveWith" : "streamLive");
  } else if (name === "enter") {
    movePosted(STREAMER, s.stage, yawFrom(s.stage, inward), false);
    if (s.together) {
      try {
        player.teleport(s.beside, { facingLocation: { x: inward.x - s.ux * 4, y: s.stage.y + 1, z: inward.z - s.uz * 4 }, keepVelocity: false });
      } catch (error) {
        reportError("stream teleport", error);
      }
    }
    shot(player, "in");
    tell(player, s.gate ? `Austin slips in through the Keeper Gates${s.together ? ", and you go with him" : ""}.` : `Austin climbs over the fence${s.together ? ", and you go with him" : ""}.`);
  } else if (name === "film") {
    shot(player, "film");
    say(player, "streamFilm");
  } else if (name === "steak") {
    s.steak = true;
    s.steakAt = system.currentTick;
    say(player, "streamSteak");
    const ex = getExhibit(s.exId);
    const cell = { x: Math.floor(s.stage.x), y: Math.floor(s.stage.y), z: Math.floor(s.stage.z) };
    s.crocs = ex ? pickCrocs(liveCrocs(ex), s.stage, g) : [];
    for (const c of s.crocs) lureTo(c.id, cell);
    s.crocAt = s.crocs[0]?.pos;
    shot(player, "chase");
    s.phase = "chase";
  } else if (name === "run") {
    letCrocsGo();
    s.steak = false;
    movePosted(STREAMER, s.outside, yawFrom(s.outside, { x: s.outside.x + s.ux, z: s.outside.z + s.uz }), false);
    if (s.together) {
      try {
        player.teleport(s.watch, { facingLocation: { x: s.stage.x, y: s.stage.y + 1, z: s.stage.z }, keepVelocity: false });
      } catch (error) {
        reportError("stream teleport", error);
      }
    }
    shot(player, "out");
    tell(player, s.gate ? "Austin is out through the gates with a second to spare." : "Austin is back over the fence with a second to spare.");
    say(player, "streamRun");
  } else if (name === "made") {
    say(player, s.together ? "streamMadeWith" : "streamMade");
  } else if (name === "end") finish(true);
}

function sceneStep(now) {
  const s = scene;
  const player = playerOf(s.playerId);
  const res = getResident(STREAMER);
  if (!player || !res || (s.phase !== "loading" && res.state !== POST_STATE)) return finish(false);
  if (s.phase === "loading") return;
  const g = G();
  const beats = sceneBeats(g);
  setSteak(Boolean(s.steak));
  if (s.phase === "before") {
    for (const b of beats.before) {
      if (now - s.t0 < b.at || s.done.has(b.beat)) continue;
      s.done.add(b.beat);
      beat(player, b.beat);
      if (scene !== s) return;
    }
    return;
  }
  if (s.phase === "chase") {
    const ex = getExhibit(s.exId);
    const ids = new Set(s.crocs.map((c) => c.id));
    const live = ex ? liveCrocs(ex).filter((c) => ids.has(c.id)) : [];
    const near = nearest(live, s.stage);
    const first = [...live].sort((a, b) => Math.hypot(a.pos.x - s.stage.x, a.pos.z - s.stage.z) - Math.hypot(b.pos.x - s.stage.x, b.pos.z - s.stage.z))[0];
    if (first && now - (s.aimed ?? 0) >= g.cam.followTicks) {
      s.aimed = now;
      s.crocAt = first.pos;
      shot(player, "chase", g.cam.followTicks / 20);
    }
    if (!timeToRun(now - s.steakAt, near, g)) return;
    s.phase = "after";
    s.t1 = now;
  }
  for (const b of beats.after) {
    if (now - s.t1 < b.at || s.done.has(b.beat)) continue;
    s.done.add(b.beat);
    beat(player, b.beat);
    if (scene !== s) return;
  }
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
  return { state: streamNow(), rec: rec(), scene: s ? { phase: s.phase, together: s.together, done: [...s.done], crocs: s.crocs?.length, gate: s.gate, since: system.currentTick - s.t0 } : undefined, austin: res ? { state: res.state, why: res.post?.why, pos: res.pos } : undefined, crocs: hasCrocs() };
}
export function streamSet(state) {
  save({ ...rec(), state });
}
