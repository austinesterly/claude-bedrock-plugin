import { system, world, MolangVariableMap, ItemStack } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { SPECIES } from "../data/species.js";
import { cellsOf } from "../exhibits/exhibits.js";
import { allAnimals, liveEntity, saveAnimal } from "./animals.js";
import { findWay, smoothWay, yawTo, turnToward } from "./zebraRules.js";
import { isSandBlock, SAND_DUST, RED_SAND_DUST } from "./camelRules.js";
import { ACT, isNestingTime, nextNestPhase, nestAct, turtleStep, turtleCarry, carryStalled, nearestWater, pickBaskSpot, nextBaskPhase } from "./turtleRules.js";
import { nestOfMother, layTurtleEggs } from "./nursery.js";

// Sea turtles in the world (0.1.183; rules in turtleRules.js). The game's own goals swim a zoo turtle about (and in some
// pools crawl it up the beach and back: the test server found the game's move_to_land never once did in the test zoo's
// Turtle Beach, not even for the game's own turtle). So by day this script now and then walks each grown one up onto the
// sand near the water to bask (zoocraft:lead, as below), lets it lie there a while (zoocraft:dig: still) and walks it
// back to the water. Every second it shows a female carrying her eggs (the egg belly, act 1); at night it
// walks her (zoocraft:lead takes her own goals away, and a push a tick moves her, so the game's own crawl and swim show)
// out of the water and up the beach to her nest spot, where she digs (act 2: the game's digging flippers, sand thrown up
// with its sound), lays her eggs (animals/nursery.js puts the Turtle Nest on the sand) and is walked back to the water.
// A walk that sticks waits for the next night; the night the eggs are due she lays where she has got to. A wild turtle is
// the game's own: its own nesting fires minecraft:go_lay_egg and minecraft:laid_egg, kept here for the Field Journal
// (isLaying). A young one that grows up sheds a Turtle Scute (shedScute, from the nursery).

const GRIT = "zoocraft:crab_grit";
const WAY_STEPS = 64; // the longest walk up the beach (blocks)
const WAY_NODES = 6000; // blocks looked at to find it (all from the exhibit's walked cells: no reads)
const SCUTE = "minecraft:turtle_scute";
const phases = new Map(); // animal id -> { phase, since, until, retryAt, bask } (game ticks; bask: in a bask, up on the sand and back)
const laying = new Set(); // wild turtles between the game's go_lay_egg and laid_egg
const walks = new Map(); // entity id -> a walk up the beach or back

const keyOf = (c) => `${c.x},${c.y},${c.z}`;
function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y + 0.5), z: Math.floor(p.z) };
}

export function initTurtles() {
  world.afterEvents.dataDrivenEntityTrigger.subscribe(
    (ev) => {
      const id = ev.entity.id;
      if (ev.eventId === "minecraft:go_lay_egg") {
        if (laying.size > 512) laying.clear(); // ones that unloaded on the way
        laying.add(id);
      } else laying.delete(id);
    },
    { entityTypes: ["minecraft:turtle"], eventTypes: ["minecraft:go_lay_egg", "minecraft:laid_egg"] },
  );
}

// Whether a turtle (zoo or wild) is digging her nest: a zoo one at act 2; a wild one between the game's own go_lay_egg and
// laid_egg, out of the water.
/** @param {import("@minecraft/server").Entity} e */
export function isLaying(e) {
  try {
    if (laying.has(e.id)) return !e.isInWater && e.isOnGround;
    return e.getProperty("zoocraft:act") === ACT.dig;
  } catch {
    return false;
  }
}

// Whether a turtle is up out of the water on sand (the journal's "ashore").
/** @param {import("@minecraft/server").Entity} e */
export function isAshore(e) {
  try {
    if (e.isInWater || !e.isOnGround) return false;
    const l = e.location;
    return isSandBlock(e.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y - 0.2), z: Math.floor(l.z) })?.typeId);
  } catch {
    return false;
  }
}

function setAct(e, act) {
  try {
    if (e.getProperty("zoocraft:act") !== act) e.setProperty("zoocraft:act", act);
  } catch {
    // gone
  }
}
function trigger(e, ev) {
  try {
    e.triggerEvent(ev);
  } catch {
    // gone
  }
}

// Sand thrown up round her, with the sand's sound.
function dust(e) {
  try {
    const l = e.location;
    const under = e.dimension.getBlock({ x: Math.floor(l.x), y: Math.floor(l.y - 0.2), z: Math.floor(l.z) })?.typeId;
    const c = under === "minecraft:red_sand" ? RED_SAND_DUST : SAND_DUST;
    const vars = new MolangVariableMap();
    vars.setFloat("variable.r", c.r);
    vars.setFloat("variable.g", c.g);
    vars.setFloat("variable.b", c.b);
    for (const [dx, dz] of [[0.6, 0], [-0.6, 0], [0, 0.6], [0, -0.6]]) e.dimension.spawnParticle(GRIT, { x: l.x + dx * (0.5 + Math.random()), y: l.y + 0.1, z: l.z + dz * (0.5 + Math.random()) }, vars);
    e.dimension.playSound("dig.sand", l, { volume: 0.5, pitch: 0.9 + Math.random() * 0.3 });
  } catch {
    // Cosmetic only.
  }
}

// Start a walk over the exhibit's walked cells (land and water) to the cell `goal`. False when there's no way.
function startWalk(e, exId, goal, now, T) {
  const cells = cellsOf(exId);
  if (!cells || !goal) return false;
  const gk = keyOf(goal);
  const can = (c) => cells.has(keyOf(c)) || keyOf(c) === gk;
  const from = e.location;
  const way = findWay(can, () => true, cellOf(from), goal, WAY_STEPS, WAY_NODES);
  if (!way) return false;
  const pts = way.length ? smoothWay({ x: from.x, y: from.y, z: from.z }, way, (c) => cells.get(keyOf(c)) === "land") : [{ x: goal.x + 0.5, y: goal.y, z: goal.z + 0.5 }];
  walks.set(e.id, { e, pts, i: 0, yaw: e.getRotation().y, checkAt: now + T.stuckTicks, checkPos: { x: from.x, y: from.y, z: from.z }, done: undefined });
  return true;
}

// Every second: each loaded female carrying eggs shows them, and at night is walked up the beach to dig her nest.
export function tickTurtles() {
  const now = system.currentTick;
  const T = BALANCE.turtle;
  const live = new Set();
  let night = false;
  try {
    night = isNestingTime(world.getTimeOfDay(), T);
  } catch {
    return;
  }
  for (const a of allAnimals()) {
    const species = SPECIES[a.speciesId];
    if (!species?.seaTurtle || a.location.kind !== "exhibit") continue;
    // A young one that grew up while it wasn't loaded sheds its scute when it is.
    if (a.scuteDue && !a.juvenile && shedScute(a.id)) {
      a.scuteDue = false;
      saveAnimal(a);
    }
    if (a.juvenile) continue;
    const e = liveEntity(a.id);
    if (!e) continue;
    live.add(a.id);
    const nest = a.expecting?.nestId ? nestOfMother(a) : undefined;
    const hasNest = Boolean(nest && nest.laid === undefined);
    const s = phases.get(a.id) ?? { phase: "life", since: now, until: 0, retryAt: 0 };
    const roll = !night && Math.random() < T.baskChance; // up onto the sand to bask, this second
    if (s.phase === "life" && !hasNest && !walks.has(e.id) && !(roll && now >= (s.retryAt ?? 0))) {
      setAct(e, ACT.life);
      phases.set(a.id, s);
      continue;
    }
    let inWater = false;
    try {
      inWater = e.isInWater;
    } catch {
      continue;
    }
    const w = walks.get(e.id);
    // The night the eggs are due (the last day of the wait), she lays where she has got to if her walk doesn't get there.
    const laidLate = Boolean(a.expecting && a.expecting.daysLeft <= 1);
    // A bask (up on the sand by day and back) runs to its end; a nest waiting for her comes after it.
    const basking = Boolean(s.bask) || (s.phase === "life" && !hasNest);
    const seen = { now, night, inWater, arrived: w?.done === "arrived", stuck: w?.done === "stuck" };
    const next = basking ? nextBaskPhase(s, { ...seen, bask: roll, r: Math.random() }, T) : nextNestPhase(s, { ...seen, hasNest, walking: Boolean(w && !w.done), laidLate }, T);
    if (next) {
      walks.delete(e.id);
      if (next.retry) s.retryAt = now + next.retry;
      if (next.lay && nest) layTurtleEggs(nest.id); // the eggs on the sand (the nursery keeps the block)
      s.phase = next.phase;
      s.since = now;
      s.until = now + (next.ticks ?? 0);
      if (next.phase === "seek") {
        const goal = nest ? { x: nest.pos.x, y: nest.pos.y, z: nest.pos.z } : undefined;
        if (goal && startWalk(e, a.location.id, goal, now, T)) trigger(e, "zoocraft:lead");
        else {
          s.phase = "life";
          s.retryAt = now + T.retryTicks;
        }
      } else if (next.phase === "ashore") {
        s.bask = true;
        const cells = cellsOf(a.location.id);
        const spot = cells ? pickBaskSpot(cells, e.location, Math.random, T.baskReach) : undefined;
        if (spot && startWalk(e, a.location.id, spot, now, T)) trigger(e, "zoocraft:lead");
        else {
          s.phase = "life";
          s.retryAt = now + T.retryTicks;
        }
      } else if (next.phase === "dig" || next.phase === "bask") trigger(e, "zoocraft:dig"); // still: digging, or lying on the sand
      else if (next.phase === "home") {
        const cells = cellsOf(a.location.id);
        const water = cells ? nearestWater(cells, e.location) : undefined;
        if (water && startWalk(e, a.location.id, water, now, T)) trigger(e, "zoocraft:lead");
        else {
          s.phase = "life";
          trigger(e, "zoocraft:settle");
        }
      } else trigger(e, "zoocraft:settle");
    }
    if (s.phase === "life") s.bask = false;
    if (s.phase === "dig") dust(e);
    const stillGravid = s.phase !== "home" && hasNest;
    setAct(e, nestAct(s.phase, stillGravid));
    phases.set(a.id, s);
  }
  for (const id of phases.keys()) if (!live.has(id)) phases.delete(id);
}

// Every tick: push the turtles walking up the beach (or back to the water) along their ways, turning them as they go.
export function tickTurtleMoves() {
  if (!walks.size) return;
  const T = BALANCE.turtle;
  const now = system.currentTick;
  for (const [id, w] of [...walks]) {
    if (w.done) continue;
    try {
      if (!w.e.isValid) {
        walks.delete(id);
        continue;
      }
      const pos = w.e.location;
      const wet = w.e.isInWater;
      const ground = w.e.isOnGround;
      // In the water a push hardly moves a led turtle (the test server: one pushed toward the beach stuck at its edge), so
      // there she is carried a step a tick (turtleCarry: up to the beach's height at its edge, then over onto it), till
      // she's on the ground again; on land the push a tick, so the game's own crawl shows.
      w.carry = wet || (Boolean(w.carry) && !ground);
      let st;
      if (w.carry) {
        st = turtleCarry(w.pts, w.i, pos, T.walkPace, T.swimRise, T.climbRise);
        w.i = st.i;
        if (!st.done) {
          if (st.dx || st.dz) w.yaw = turnToward(w.yaw, yawTo(st.dx, st.dz), 10);
          const opts = { checkForBlocks: true, keepVelocity: false, rotation: { x: 0, y: w.yaw } };
          for (const p of st.tries) if (w.e.tryTeleport(p, opts)) break; // straight on, else slide along a wall or the edge, else just rise
          if (carryStalled(w.pts[w.i], pos, w.e.location)) w.i++; // short of a point she can't reach: on to the next
        }
      } else {
        st = turtleStep(w.pts, w.i, pos, w.e.getVelocity(), ground, wet, T.walkPace);
        w.i = st.i;
        w.e.applyImpulse(st.push);
        if (!st.done && (st.dx || st.dz)) {
          w.yaw = turnToward(w.yaw, yawTo(st.dx, st.dz), 10);
          w.e.setRotation({ x: 0, y: w.yaw });
        }
      }
      if (st.done) {
        w.done = "arrived";
        continue;
      }
      if (now >= w.checkAt) {
        if (Math.hypot(pos.x - w.checkPos.x, pos.y - w.checkPos.y, pos.z - w.checkPos.z) < T.stuckBlocks) w.done = "stuck";
        w.checkAt = now + T.stuckTicks;
        w.checkPos = { x: pos.x, y: pos.y, z: pos.z };
      }
    } catch {
      walks.delete(id);
    }
  }
}

// A young one grown up sheds a Turtle Scute at its feet (the game's own grow-up drop), when it's loaded.
export function shedScute(animalId) {
  try {
    const e = liveEntity(animalId);
    if (!e) return false;
    e.dimension.spawnItem(new ItemStack(SCUTE, 1), e.location);
    return true;
  } catch {
    return false;
  }
}

// For the bench and tests: what a turtle is doing (its phase) and whether it's being walked.
export function turtleState(animalId, entityId) {
  return { phase: phases.get(animalId)?.phase ?? "life", walking: walks.has(entityId) && !walks.get(entityId).done };
}
