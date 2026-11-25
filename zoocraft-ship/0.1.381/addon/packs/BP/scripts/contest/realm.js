// The contest realm in the game (0.1.381; the plan is contest/realmRules.js). A frame of Bunny Blocks lit with a Flint
// and Steel fills with portal; standing in it takes a player to the rabbits' stadium in its own dimension, built once
// from the plan, and the frame that stands there takes them back to where they came from. While a player is in the
// realm its crowd sits in the stands and its king stands on his dais.
import { world, system, BlockVolume, ListBlockVolume, BlockPermutation, GameMode } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { log, reportError } from "../core/log.js";
import { message, countItem } from "../platform/mc.js";
import { AXIS, lightPortal, portalStep, neighbours, portalStillWhole, readBack, writeBack } from "../fishing/portalRules.js";
import { withLoadedIn } from "../fishing/islands.js";
import { TICKET } from "../residents/contestRules.js";
import { CONTEST, BUNNY_BLOCK, CONTEST_PORTAL, CONTEST_FRAME, RABBIT_PERSON, LIGHTERS, CONTEST_BACK, STADIUM_V, KING_FUR, SPOTS, stadiumBoxes, stadiumArea, returnPortal, crowdSeats, kingLine } from "./realmRules.js";

const K = () => BALANCE.contest;
const COL = "contestRealm";
const KEY = "stadium";
const states = new Map(); // player id -> { t, held, going }
const told = new Set();
let building; // the one build under way
let crowdFor = -1; // the tick the crowd was last set out (0 on a fresh session: set out again)

const O = () => K().origin;
const at = (o) => ({ x: O().x + o.x, y: O().y + o.y, z: O().z + o.z });

export function contestDimension() {
  try {
    return world.getDimension(CONTEST);
  } catch {
    return undefined;
  }
}

function blockId(d, x, y, z) {
  try {
    return d.getBlock({ x, y, z })?.typeId;
  } catch {
    return undefined;
  }
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

function play(player, sound, volume = 1) {
  try {
    player.playSound(sound, { volume });
  } catch {
    // none
  }
}

/** The stadium, built once a plan (and again when the plan changes). */
export function ensureStadium() {
  if (db.get(COL, KEY)?.v === STADIUM_V) return Promise.resolve(true);
  if (building) return building;
  const d = contestDimension();
  if (!d) return Promise.reject(new Error("no contest dimension"));
  const area = stadiumArea();
  const o = O();
  building = withLoadedIn(d, "zc_contest", { x: o.x + area.from.x, z: o.z + area.from.z }, { x: o.x + area.to.x, z: o.z + area.to.z }, async () => {
    const boxes = stadiumBoxes();
    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      d.fillBlocks(new BlockVolume({ x: o.x + b.a[0], y: o.y + b.a[1], z: o.z + b.a[2] }, { x: o.x + b.b[0], y: o.y + b.b[1], z: o.z + b.b[2] }), b.id);
      if (i % K().boxesPerTick === K().boxesPerTick - 1) await system.waitTicks(1);
    }
    const rp = returnPortal();
    d.fillBlocks(new ListBlockVolume(rp.frame.map(at)), BUNNY_BLOCK);
    d.fillBlocks(new ListBlockVolume(rp.inside.map(at)), BlockPermutation.resolve(CONTEST_PORTAL, { [AXIS]: rp.axis }));
    db.put(COL, { id: KEY, v: STADIUM_V });
    return true;
  }).finally(() => {
    building = undefined;
  });
  return building;
}

function inPortal(player) {
  try {
    const d = player.dimension;
    const l = player.location;
    const x = Math.floor(l.x);
    const z = Math.floor(l.z);
    return blockId(d, x, Math.floor(l.y), z) === CONTEST_PORTAL || blockId(d, x, Math.floor(l.y + 1.2), z) === CONTEST_PORTAL;
  } catch {
    return false;
  }
}

function unmount(player) {
  try {
    const on = player.getComponent("minecraft:riding")?.entityRidingOn;
    on?.getComponent("minecraft:rideable")?.ejectRider(player);
  } catch {
    // not riding
  }
}

function fade(player) {
  try {
    player.camera.fade({ fadeColor: { red: 0.95, green: 0.8, blue: 0.86 }, fadeTime: { fadeInTime: 0.3, holdTime: 0.4, fadeOutTime: 0.8 } });
  } catch {
    // no camera control here
  }
}

function arriveSpot() {
  const a = SPOTS.arrive;
  return { pos: at(a), ry: a.ry };
}

async function toRealm(player) {
  const from = player.dimension;
  await ensureStadium();
  if (!inPortal(player) || player.dimension.id !== from.id) return false; // stepped out while it was built
  const d = contestDimension();
  if (!d) return false;
  let ry = 0;
  try {
    ry = player.getRotation().y;
  } catch {
    ry = 0;
  }
  player.setDynamicProperty(CONTEST_BACK, writeBack(from.id, player.location, ry));
  unmount(player);
  fade(player);
  const a = arriveSpot();
  player.teleport(a.pos, { dimension: d, rotation: { x: 0, y: a.ry } });
  play(player, "portal.travel", 0.35);
  return true;
}

/** Home from the realm: where they went in, else their spawn point, else the world's. */
export function leaveRealm(player, why) {
  let back;
  try {
    back = readBack(player.getDynamicProperty(CONTEST_BACK));
  } catch {
    back = undefined;
  }
  if (!back) {
    let sp;
    try {
      sp = player.getSpawnPoint();
    } catch {
      sp = undefined;
    }
    const w = world.getDefaultSpawnLocation();
    back = sp ? { d: sp.dimension.id, x: sp.x + 0.5, y: sp.y, z: sp.z + 0.5, ry: 0 } : { d: "minecraft:overworld", x: w.x + 0.5, y: w.y > 320 ? 120 : w.y, z: w.z + 0.5, ry: 0 };
    why = sp || w.y <= 320 ? why : "high";
  }
  unmount(player);
  fade(player);
  player.teleport({ x: back.x, y: back.y, z: back.z }, { dimension: world.getDimension(back.d), rotation: { x: 0, y: back.ry } });
  if (why === "high") {
    try {
      player.addEffect("slow_falling", 400, { showParticles: false });
    } catch {
      // none
    }
  }
  play(player, "portal.travel", 0.35);
}

function go(player, st) {
  st.going = true;
  const inRealm = player.dimension.id === CONTEST;
  const trip = inRealm ? Promise.resolve().then(() => (leaveRealm(player, "portal"), true)) : toRealm(player);
  trip
    .then((went) => {
      st.going = false;
      if (went) st.held = true;
      st.t = 0;
    })
    .catch((error) => {
      st.going = false;
      st.t = 0;
      st.held = true;
      log(`contest portal: ${player.name} couldn't go through: ${error}`);
      message(player, "§7The portal flickers. Step out and in again to try once more.");
    });
}

// The crowd and the king, set out afresh (any left from an earlier visit are cleared away first).
function setCrowd(d) {
  for (const e of d.getEntities({ type: RABBIT_PERSON })) {
    try {
      e.remove();
    } catch {
      // gone
    }
  }
  const put = (spot, fur, king) => {
    const p = at(spot);
    const e = d.spawnEntity(RABBIT_PERSON, p);
    e.setProperty("zoocraft:fur", fur);
    e.setProperty("zoocraft:king", king);
    e.teleport(p, { rotation: { x: 0, y: spot.ry ?? 0 }, keepVelocity: false });
    if (king) e.nameTag = K().kingName;
    return e;
  };
  for (const s of crowdSeats().slice(0, K().crowd)) put(s, s.fur, false);
  put(SPOTS.king, KING_FUR, true);
}

/** Every 4 ticks: who stands in a contest portal, who has fallen out of the realm, and the crowd while someone is there. */
export function tickRealm() {
  const k = K();
  let inRealm = false;
  for (const player of world.getAllPlayers()) {
    let st = states.get(player.id);
    if (!st) states.set(player.id, (st = { t: 0, held: false, going: false }));
    if (st.going) continue;
    let dimId;
    try {
      dimId = player.dimension.id;
    } catch {
      continue;
    }
    if (dimId === CONTEST) {
      inRealm = true;
      if (player.location.y < O().y + k.voidY) {
        // off the edge: back on the field
        const a = arriveSpot();
        try {
          player.teleport(a.pos, { rotation: { x: 0, y: a.ry } });
        } catch (error) {
          reportError("contest fall", error);
        }
        continue;
      }
    }
    const inside = inPortal(player);
    const was = st.t;
    const r = portalStep(st, inside, creative(player), 4, k);
    st.t = r.st.t;
    st.held = r.st.held;
    if (inside && !st.held && was === 0) {
      play(player, "portal.trigger", 0.25);
      if (dimId !== CONTEST) ensureStadium().catch(() => {}); // built while they wait
    }
    if (r.go) go(player, st);
  }
  if (!inRealm) {
    crowdFor = -1;
    return;
  }
  if (crowdFor < 0 && !building && db.get(COL, KEY)?.v === STADIUM_V) {
    const d = contestDimension();
    try {
      if (d && d.getBlock(at(SPOTS.king))) {
        setCrowd(d);
        crowdFor = system.currentTick;
      }
    } catch (error) {
      reportError("contest crowd", error); // the stands are not loaded yet: tried again
    }
  }
}

/** A Flint and Steel (or a Fire Charge) used on a Bunny Block: the frame it is part of lights. Returns whether it was one. */
export function lightBunnyFrame(e) {
  const block = e.block;
  if (block?.typeId !== BUNNY_BLOCK || !LIGHTERS.has(e.itemStack?.typeId ?? "")) return false;
  const player = e.player;
  const d = block.dimension;
  const f = String(e.blockFace);
  const step = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] }[f] ?? [0, 1, 0];
  const start = { x: block.location.x + step[0], y: block.location.y + step[1], z: block.location.z + step[2] };
  let look;
  try {
    look = player.getViewDirection();
  } catch {
    look = { x: 0, y: 0, z: 1 };
  }
  const portal = lightPortal((x, y, z) => blockId(d, x, y, z), start, look, K().frame, CONTEST_FRAME);
  if (!portal) {
    if (!told.has(player.id)) message(player, "§7Bunny Blocks make a portal when they stand as an upright frame, 4 by 5 or bigger, empty in the middle. Light the inside of the frame.");
    told.add(player.id);
    return true; // no fire on the fur
  }
  system.run(() => {
    try {
      d.fillBlocks(new ListBlockVolume(portal.cells), BlockPermutation.resolve(CONTEST_PORTAL, { [AXIS]: portal.axis }), { blockFilter: { includeTypes: ["minecraft:air"] } });
      d.playSound("fire.ignite", start, { volume: 1, pitch: 1.2 });
      d.playSound("portal.trigger", start, { volume: 0.4, pitch: 1.6 });
    } catch (error) {
      reportError("contest portal", error);
    }
  });
  return true;
}

function checkAround(d, p) {
  const get = (x, y, z) => blockId(d, x, y, z);
  for (const n of neighbours(p)) {
    let perm;
    try {
      perm = d.getBlock(n)?.permutation;
    } catch {
      continue;
    }
    if (perm?.type.id !== CONTEST_PORTAL) continue;
    const axis = /** @type {string} */ (perm.getState(/** @type {any} */ (AXIS)) ?? "x");
    const { cells, whole } = portalStillWhole(get, n, axis, K().frame, CONTEST_FRAME, CONTEST_PORTAL);
    if (!whole) {
      try {
        d.fillBlocks(new ListBlockVolume(cells), "minecraft:air", { blockFilter: { includeTypes: [CONTEST_PORTAL] } });
      } catch (error) {
        reportError("contest portal", error);
      }
    }
  }
}

/** A word with one of the rabbit people: the king about tickets, the crowd a cheer. */
export function talkToRabbit(player, e) {
  let king = false;
  try {
    king = Boolean(e.getProperty("zoocraft:king"));
  } catch {
    return;
  }
  const lines = K().lines;
  if (!king) {
    const list = lines.crowd;
    return message(player, `§fRabbit: §7"${list[Math.floor(Math.random() * list.length)]}"`);
  }
  message(player, `§f${K().kingName}: §7"${lines[kingLine(countItem(player, TICKET) > 0)]}"`);
}

export function wireRealm() {
  world.afterEvents.playerBreakBlock.subscribe((e) => {
    const id = e.brokenBlockPermutation.type.id;
    if (id !== CONTEST_PORTAL && id !== BUNNY_BLOCK) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.blockExplode.subscribe((e) => {
    const id = e.explodedBlockPermutation.type.id;
    if (id !== CONTEST_PORTAL && id !== BUNNY_BLOCK) return;
    system.run(() => checkAround(e.dimension, e.block.location));
  });
  world.afterEvents.playerLeave.subscribe((e) => states.delete(e.playerId));
}

/** Bench only. */
export function realmDebug() {
  const d = contestDimension();
  let people = -1;
  try {
    people = d ? d.getEntities({ type: RABBIT_PERSON }).length : -1;
  } catch {
    people = -2;
  }
  return { built: db.get(COL, KEY)?.v, building: Boolean(building), crowdFor, people, states: [...states.values()] };
}
