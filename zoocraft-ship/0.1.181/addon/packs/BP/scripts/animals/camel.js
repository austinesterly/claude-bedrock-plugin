import { system, world, MolangVariableMap } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { getExhibit, cellsOf, shadeSpotsOf } from "../exhibits/exhibits.js";
import { allAnimals, liveEntity } from "./animals.js";
import { findWay, smoothWay, yawTo, turnToward } from "./zebraRules.js";
import { ACT, isMidday, nextPhase, phaseAct, phaseEvent, shadedAt, isSandBlock, besideCells, pickShadeSpot, spotKeys, walkStep, SAND_DUST, RED_SAND_DUST } from "./camelRules.js";

// Camels in the world (0.1.181; rules in camelRules.js). The game walks a zoo camel about (its own stroll). Every second
// this script: now and then kneels one a while (the game camel's own sit and look round, which the game's sitting goal
// does only for its own camel: found on the test server); at midday walks a grown one out in the sun into the shade
// (zoocraft:lead takes its own walk away; it's pushed along a tick at a time, so the game's own walk shows) and kneels it
// there (zoocraft:kneel, act 1) till the heat passes; and out of the heat, now and then kneels one standing on sand for a
// dust bath (act 2: sand thrown up round it with the sand's sound). A wild camel is the game's own: its sitting fires
// minecraft:start_sitting and minecraft:stop_sitting, kept here for the Field Journal (isKneeling).

const GRIT = "zoocraft:crab_grit";
const WAY_STEPS = 48; // the longest walk into the shade (blocks)
const WAY_NODES = 4000; // blocks looked at to find it (all from the exhibit's measured floor: no reads)
const phases = new Map(); // animal id -> { phase, since, until, retryAt } (game ticks)
const sitting = new Set(); // wild camels kneeling by the game's own sitting
const walks = new Map(); // entity id -> a walk into the shade
const spots = new Map(); // animal id -> { exId, cell } the shaded spot it walks to or rests on

const keyOf = (c) => `${c.x},${c.y},${c.z}`;
function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.5), z: Math.floor(p.z) };
}

export function initCamels() {
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const id = ev.entity.id;
      if (ev.eventId === "minecraft:start_sitting") {
        if (sitting.size > 512) sitting.clear(); // ones that unloaded kneeling
        sitting.add(id);
      } else sitting.delete(id);
    },
    { entityTypes: ["minecraft:camel"], eventTypes: ["minecraft:start_sitting", "minecraft:stop_sitting"] },
  );
}

// Whether a camel (zoo or wild) is kneeling: a wild one by the game's own sitting, a zoo one at rest or in a dust bath.
/** @param {import("@minecraft/server").Entity} e */
export function isKneeling(e) {
  if (sitting.has(e.id)) return true;
  try {
    const act = e.getProperty("zoocraft:act");
    return act === ACT.rest || act === ACT.bath;
  } catch {
    return false;
  }
}

function setPhase(e, phase) {
  try {
    const act = phaseAct(phase);
    if (e.getProperty("zoocraft:act") !== act) e.setProperty("zoocraft:act", act);
    e.triggerEvent(phaseEvent(phase));
  } catch {
    // gone
  }
}

function typeReader(d) {
  return (x, y, z) => {
    try {
      return d.getBlock({ x, y, z })?.typeId;
    } catch {
      return undefined;
    }
  };
}
const OPEN_IDS = new Set(["minecraft:air", "minecraft:light_block", "minecraft:structure_void"]);

// Sand thrown up round it, with the sand's sound.
function dust(e, typeId) {
  try {
    const c = typeId === "minecraft:red_sand" ? RED_SAND_DUST : SAND_DUST;
    const vars = new MolangVariableMap();
    vars.setFloat("variable.r", c.r);
    vars.setFloat("variable.g", c.g);
    vars.setFloat("variable.b", c.b);
    const l = e.location;
    for (const [dx, dz] of [[0.7, 0], [-0.7, 0], [0, 0.7], [0, -0.7]]) e.dimension.spawnParticle(GRIT, { x: l.x + dx * (0.5 + Math.random()), y: l.y + 0.1, z: l.z + dz * (0.5 + Math.random()) }, vars);
    e.dimension.playSound("dig.sand", l, { volume: 0.6, pitch: 0.8 + Math.random() * 0.3 });
  } catch {
    // Cosmetic only.
  }
}

// Start a camel's walk into the shade: the nearest shaded floor (the exhibit's measure says where) shaded all round, so all
// of it lies in the shade, else with floor beside it, else any; not by another camel's spot; and the way there over the
// exhibit's measured floor. False when there's none to go to or no way there.
function startWalk(e, a, now, T) {
  const exId = a.location.id;
  const cells = cellsOf(exId);
  const shade = shadeSpotsOf(exId);
  if (!cells || !shade) return false; // not measured since the world loaded
  const isLand = (c) => cells.get(keyOf(c)) === "land";
  const shaded = (c) => shade.has(keyOf(c));
  const under = [];
  for (const k of shade) {
    const [x, y, z] = k.split(",").map(Number);
    under.push({ x, y, z });
  }
  const taken = new Set();
  for (const [id, sp] of spots) if (id !== a.id && sp.exId === exId) for (const k of spotKeys(sp.cell)) taken.add(k);
  const read = typeReader(e.dimension);
  const from = e.location;
  const goal =
    pickShadeSpot(under, from, shaded, (c) => besideCells(c).every((n) => isLand(n) && shaded(n)), taken) ??
    pickShadeSpot(under, from, shaded, (c) => besideCells(c).every(isLand), taken) ??
    pickShadeSpot(under, from, shaded, () => true, taken);
  if (!goal) return false;
  const gk = keyOf(goal);
  const headroom = (c) => OPEN_IDS.has(read(c.x, c.y + 2, c.z) ?? "");
  const way = findWay((c) => isLand(c) || keyOf(c) === gk, headroom, cellOf(from), goal, WAY_STEPS, WAY_NODES);
  if (!way) return false;
  const pts = way.length ? smoothWay({ x: from.x, y: from.y, z: from.z }, way, isLand) : [{ x: goal.x + 0.5, y: goal.y, z: goal.z + 0.5 }];
  spots.set(a.id, { exId, cell: goal });
  walks.set(e.id, { e, pts, i: 0, yaw: e.getRotation().y, checkAt: now + T.stuckTicks, checkPos: { x: from.x, z: from.z }, done: undefined });
  return true;
}

function endWalk(a, e) {
  if (e) walks.delete(e.id);
  spots.delete(a.id);
}

// Every second: each loaded camel in an exhibit goes on with its own life, kneels a while, goes into the shade, rests there,
// or has a dust bath.
export function tickCamels() {
  const now = system.currentTick;
  const T = BALANCE.camel;
  const live = new Set();
  let midday = false;
  try {
    midday = isMidday(world.getTimeOfDay(), T);
  } catch {
    return;
  }
  for (const a of allAnimals()) {
    const species = SPECIES[a.speciesId];
    if (!species?.desert || a.location.kind !== "exhibit") continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    const ex = getExhibit(a.location.id);
    if (!ex) continue;
    live.add(a.id);
    const s = phases.get(a.id) ?? { phase: "life", since: now, until: 0, retryAt: 0 };
    let shaded = false;
    let under;
    let inWater = false;
    try {
      inWater = e.isInWater;
      const l = e.location;
      const x = Math.floor(l.x), y = Math.floor(l.y), z = Math.floor(l.z);
      const read = typeReader(e.dimension);
      under = read(x, y - 1, z);
      shaded = shadedAt(read, x, y, z, T);
    } catch {
      continue;
    }
    // A walk that got stuck (a fixture in the way, another camel lying there) gives up for now.
    const w = walks.get(e.id);
    let next;
    if (s.phase === "seek" && w?.done === "stuck") next = { phase: "life", retry: T.retryTicks };
    else next = nextPhase(s, { now, midday, shaded, shadeHere: (ex.coveredCells ?? 0) > 0, onSand: isSandBlock(under), inWater, walking: Boolean(w && !w.done) }, T);
    if (next?.phase === "seek" && s.phase !== "seek" && !startWalk(e, a, now, T)) next = { phase: "life", retry: T.retryTicks };
    if (next) {
      if (next.retry) s.retryAt = now + next.retry;
      if (next.phase !== "seek") walks.delete(e.id);
      if (next.phase !== "seek" && next.phase !== "rest") spots.delete(a.id);
      if (next.phase !== s.phase) {
        s.phase = next.phase;
        s.since = now;
        s.until = now + (next.ticks ?? 0);
        setPhase(e, next.phase);
      }
    }
    if (s.phase === "bath" && isSandBlock(under)) dust(e, under);
    phases.set(a.id, s);
  }
  for (const id of phases.keys()) if (!live.has(id)) phases.delete(id);
  for (const id of spots.keys()) if (!live.has(id)) spots.delete(id);
}

// Every tick: push the camels walking into the shade along their ways, turning them as they go.
export function tickCamelMoves() {
  if (!walks.size) return;
  const T = BALANCE.camel;
  const now = system.currentTick;
  for (const [id, w] of [...walks]) {
    if (w.done) continue;
    try {
      if (!w.e.isValid) {
        walks.delete(id);
        continue;
      }
      const pos = w.e.location;
      const st = walkStep(w.pts, w.i, pos, w.e.getVelocity(), w.e.isOnGround, T.walkPace);
      w.i = st.i;
      w.e.applyImpulse(st.push);
      if (st.done) {
        w.done = "arrived";
        continue;
      }
      if (st.dx || st.dz) {
        w.yaw = turnToward(w.yaw, yawTo(st.dx, st.dz), 15);
        w.e.setRotation({ x: 0, y: w.yaw });
      }
      if (now >= w.checkAt) {
        if (Math.hypot(pos.x - w.checkPos.x, pos.z - w.checkPos.z) < T.stuckBlocks) w.done = "stuck";
        w.checkAt = now + T.stuckTicks;
        w.checkPos = { x: pos.x, z: pos.z };
      }
    } catch {
      walks.delete(id);
    }
  }
}

// For the bench and tests: what a camel is doing (its phase) and whether it's being walked.
export function camelState(animalId, entityId) {
  return { phase: phases.get(animalId)?.phase ?? "life", walking: walks.has(entityId) && !walks.get(entityId).done, spot: spots.get(animalId)?.cell };
}
