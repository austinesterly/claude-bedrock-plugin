// Climbing animals (raccoons, 0.1.71), pure: what the climb measure means to players, the way up a
// trunk or a Climbing Frame and back down, washing at the water, raiding Litter Bins and climbing
// out of an exhibit that isn't climb-proof. Spec 5.x: "raccoon | Raccoon | Manipulates puzzle
// feeders | Climbing; attracted to unsecured bins". The game side is animals/raccoon.js; the measure
// itself is exhibits/geometry.js floodClimb.

import { climbOpen, climbGrips, climbFloor } from "../exhibits/geometry.js";

// The raccoon mobs, found by type (0.1.70: never by family alone).
export const RACCOON_TYPES = ["zoocraft:raccoon", "zoocraft:wild_raccoon"];

// What a raccoon is doing (its zoocraft:act entity property): the client plays the matching animation
// and the Field Journal watches for it. Climbing up a trunk; clinging to it partway; working a
// Puzzle Feeder; washing at the water; rummaging at a Litter Bin; asleep on top of a trunk or frame
// (at night); coming down head first; looking out from the top (by day); scrambling across the top
// of something (over the top of a trunk, along the top of a wall).
export const ACT = { none: 0, climb: 1, cling: 2, puzzle: 3, wash: 4, rummage: 5, sleep: 6, down: 7, lookout: 8, scramble: 9 };
// The acts the Field Journal counts as climbing.
export const CLIMBING_ACTS = [ACT.climb, ACT.cling, ACT.down, ACT.lookout];

const DIRS = [
  { x: 1, z: 0 },
  { x: -1, z: 0 },
  { x: 0, z: 1 },
  { x: 0, z: -1 },
];
const DIAGS = [
  { x: 1, z: 1 },
  { x: 1, z: -1 },
  { x: -1, z: 1 },
  { x: -1, z: -1 },
];

// The issue a climber's exhibit shows when one could climb out.
export function climbIssue(plural, climb) {
  const v = climb.via;
  const where = v ? ` near ${v.x} ${v.y} ${v.z}` : "";
  const how = v?.leaves ? ", through the branches of a tree that reach over the wall: move the tree back from the wall or cut the branches" : v?.hedge ? ", through a hedge" : "";
  return `${plural} climb: they could climb out${where}${how}. They climb fences, walls, bars, logs and hedges, but not glass, and can't hang under a roof: use glass walls there, add an overhang (a row of blocks sticking inward along the top of the wall), or roof the exhibit.`;
}

// The clipboard's line about climbing, for an exhibit climbers live in or might move into.
export function climbLine(ex, plural) {
  const c = ex.climb;
  if (!c) return "§fClimb-proof: §7not measured yet: use the Habitat Marker on the ground inside again";
  const trees = `${c.trees} climbing tree${c.trees === 1 ? "" : "s"} (3 or more logs high)`;
  if (c.proof) return `§fClimb-proof: §ayes§7, ${plural.toLowerCase()} can't climb out; ${trees}`;
  const v = c.via;
  return `§fClimb-proof: §cno§7, ${plural.toLowerCase()} could climb out${v ? ` near ${v.x} ${v.y} ${v.z}${v.leaves ? " through a tree's branches" : v.hedge ? " through a hedge" : ""}` : ""}; ${trees}`;
}

// Something to climb: a climbing tree on the floor, or a Climbing Frame. A species without the need,
// or an exhibit not measured for it yet, always has one.
export function hasClimbTree(species, ex, fixtures) {
  if (!species.climbTree) return true;
  if (fixtures.some((f) => f.type === "frame")) return true;
  const c = treesMeasure(species, ex);
  return !c || c.trees > 0;
}

// The measure that counted an exhibit's climbing trees for this species: the ape measure for a gorilla
// (ex.apeClimb, 0.1.80), the climb measure for everyone else (ex.climb).
export function treesMeasure(species, ex) {
  return species.ape ? ex.apeClimb : ex.climb;
}

// Water to wash food in: a pool in the floor, even one block. A species without the need always has it.
export function canWash(species, ex) {
  return !species.wash || (ex.waterCells ?? 0) >= species.wash.minCells;
}

// A column a climber can go up from beside it: a Climbing Frame, or 3 logs starting level with its feet.
function isTrunk(read, x, y, z) {
  const c = read(x, y, z);
  return c === "frame" || (c === "log" && read(x, y + 1, z) === "log" && read(x, y + 2, z) === "log");
}

const standable = (read, c) => read(c.x, c.y, c.z) === "air" && read(c.x, c.y + 1, c.z) === "air" && climbFloor(read(c.x, c.y - 1, c.z));

/**
 * A climbing tree or Climbing Frame beside a climber standing in the block `foot`: `dir` is the way
 * to it ({ x, z }, one block) from the block `from` the climb starts in, which is `foot` itself, or
 * a block beside it when the trunk stands corner to corner with it (it steps round first).
 * @returns {{ dir: {x:number,z:number}, from: {x:number,y:number,z:number} } | undefined}
 */
export function trunkBeside(read, foot) {
  for (const d of DIRS) if (isTrunk(read, foot.x + d.x, foot.y, foot.z + d.z)) return { dir: d, from: foot };
  for (const g of DIAGS) {
    if (!isTrunk(read, foot.x + g.x, foot.y, foot.z + g.z)) continue;
    for (const s of [{ x: g.x, z: 0 }, { x: 0, z: g.z }]) {
      const c = { x: foot.x + s.x, y: foot.y, z: foot.z + s.z };
      if (standable(read, c)) return { dir: { x: g.x - s.x, z: g.z - s.z }, from: c };
    }
  }
  return undefined;
}

/**
 * The way up a trunk (a column of logs) or a Climbing Frame ("frame") from a climber standing in the
 * block `foot`, with the trunk `dir` ({ x, z }) one block away: up the face while the trunk is beside
 * it and the air is clear (it stops under the leaves), at most `maxUp` blocks; then, if the trunk ends
 * there and its top is clear, over onto the top. `read` gives climb reader categories ("log", "frame",
 * "air", "leaves" ...). Undefined when there are fewer than 2 blocks to climb.
 * @returns {{ up: {x:number,y:number,z:number}[], top: {x:number,y:number,z:number}, onTop: boolean } | undefined}
 */
export function climbRoute(read, foot, dir, maxUp) {
  const tx = foot.x + dir.x;
  const tz = foot.z + dir.z;
  const up = [];
  for (let k = 1; k <= maxUp; k++) {
    const y = foot.y + k;
    if (read(foot.x, y, foot.z) !== "air" || !climbGrips(read(tx, y, tz))) break;
    up.push({ x: foot.x, y, z: foot.z });
  }
  if (up.length < 2) return undefined;
  const last = up[up.length - 1];
  const above = last.y + 1;
  if (read(tx, above, tz) === "air" && read(foot.x, above, foot.z) === "air") return { up, top: { x: tx, y: above, z: tz }, onTop: true };
  return { up, top: last, onTop: false };
}

/**
 * Water to wash in beside a climber standing in the block `foot`: in it (paddling in the shallows),
 * beside it level with its feet or a step down (a bank), corner to corner too. The way to face
 * ({ x, z }, { x: 0, z: 0 } in the water) and the water block, or undefined.
 */
export function waterNear(read, foot) {
  if (read(foot.x, foot.y, foot.z) === "water") return { dir: { x: 0, z: 0 }, at: { x: foot.x, y: foot.y, z: foot.z } };
  for (const d of [...DIRS, ...DIAGS]) {
    const x = foot.x + d.x;
    const z = foot.z + d.z;
    if (read(x, foot.y, z) === "water") return { dir: d, at: { x, y: foot.y, z } };
    if (read(x, foot.y, z) === "air" && read(x, foot.y - 1, z) === "water") return { dir: d, at: { x, y: foot.y - 1, z } };
  }
  return undefined;
}

// A raccoon at a Litter Bin at night. A latched bin holds: it tries the lid and gives up. An unlatched
// one tips over: what was in it spills onto the paths with the scraps a raccoon drags out, and the
// bin catches nothing until someone stands it up. One already knocked over has nothing left.
export function binRaid(bin, balance) {
  if (bin.tipped) return { outcome: "empty", spilled: 0 };
  if (bin.latched) return { outcome: "latched", spilled: 0 };
  return { outcome: "tipped", spilled: Math.round((bin.fill ?? 0) + balance.raccoon.scraps) };
}

// Steps for the mover from `from` to `to` (block positions), as points to glide through: a step up and
// over (a diagonal in the path) goes up first, then across; a drop goes across first, then down.
export function stepsBetween(from, to) {
  const across = from.x !== to.x || from.z !== to.z;
  if (!across || from.y === to.y) return [to];
  if (to.y > from.y) return [{ x: from.x, y: to.y, z: from.z }, to];
  return [{ x: to.x, y: from.y, z: to.z }, to];
}

// Is this spot (a block position) still open for a climber? (The mover checks before each step.)
export function stillOpen(read, p) {
  return climbOpen(read(p.x, p.y, p.z));
}

// Which way an animal faces to look along ({ dx, dz }), as a Minecraft yaw in degrees.
export function yawTo(dx, dz) {
  return Math.round((Math.atan2(-dx, dz) * 180) / Math.PI) + 0; // + 0 turns -0 into 0
}

// The middle of a block, at its floor.
export function centre(c) {
  return { x: c.x + 0.5, y: c.y, z: c.z + 0.5 };
}

// How far in from the middle of its block a climber hugs the bark: balance.raccoon.hug is a grown-up's
// (the climbing poses are fitted to it); a youngster, drawn at `scale` of that size about its feet,
// sits nearer the bark so its paws still reach it (0.5 would be right against the bark).
export function hugFor(hug, scale = 1) {
  return 0.5 - (0.5 - hug) * scale;
}

// Where a climber clinging in the block `c` sits: the middle, `hug` blocks toward the trunk `dir`
// away, so its paws are on the bark.
export function clingSpot(c, dir, hug) {
  return { x: c.x + 0.5 + dir.x * hug, y: c.y, z: c.z + 0.5 + dir.z * hug };
}

/**
 * The legs of a climb up a trunk or frame, for the mover: [{ to, ticks, act, yaw }], each a glide to
 * `to` (a position) over `ticks` ticks doing `act`, facing `yaw`. From the block `from` (the climber
 * stands in its middle) with the trunk `dir` away, along `route` (climbRoute): onto the bark, up the
 * face (stopping to cling a while at `pauseAt`, the index of a block on the way, when it's set), and
 * over onto the top when the route ends there. `t` is balance.raccoon.
 */
export function upLegs(from, dir, route, t, pauseAt = -1) {
  const face = yawTo(dir.x, dir.z);
  const legs = [{ to: clingSpot(from, dir, t.hug), ticks: t.gripTicks, act: ACT.climb, yaw: face }];
  route.up.forEach((c, i) => {
    legs.push({ to: clingSpot(c, dir, t.hug), ticks: t.climbTicks, act: ACT.climb, yaw: face });
    if (i === pauseAt) legs.push({ to: clingSpot(c, dir, t.hug), ticks: t.pauseTicks, act: ACT.cling, yaw: face });
  });
  if (route.onTop) {
    const last = route.up[route.up.length - 1];
    legs.push({ to: clingSpot({ x: from.x, y: last.y + 1, z: from.z }, dir, t.hug), ticks: t.climbTicks, act: ACT.climb, yaw: face });
    legs.push({ to: centre(route.top), ticks: t.acrossTicks, act: ACT.scramble, yaw: face });
  }
  return legs;
}

/**
 * The legs back down the same trunk or frame (see upLegs): head first, facing away from the bark
 * (a raccoon turns its hind feet round to come down that way), from the top or from where it clung,
 * to the middle of the block `from` on the ground.
 */
export function downLegs(from, dir, route, t) {
  const away = yawTo(-dir.x, -dir.z);
  const up = route.up;
  const legs = [];
  if (route.onTop) legs.push({ to: clingSpot({ x: from.x, y: up[up.length - 1].y + 1, z: from.z }, dir, t.hug), ticks: t.acrossTicks, act: ACT.down, yaw: away });
  for (let i = route.onTop ? up.length - 1 : up.length - 2; i >= 0; i--) legs.push({ to: clingSpot(up[i], dir, t.hug), ticks: t.downTicks, act: ACT.down, yaw: away });
  legs.push({ to: clingSpot(from, dir, t.hug), ticks: t.downTicks, act: ACT.down, yaw: away });
  legs.push({ to: centre(from), ticks: t.gripTicks, act: ACT.none, yaw: away });
  return legs;
}

// What a climber in the block `c` holds on to: the side of something solid beside it (not glass),
// `prefer` first. undefined when there's nothing to hold.
function gripDir(read, c, prefer) {
  if (prefer && climbGrips(read(c.x + prefer.x, c.y, c.z + prefer.z))) return prefer;
  return DIRS.find((d) => climbGrips(read(c.x + d.x, c.y, c.z + d.z)));
}

// The next way across along `path` from point `i` on (where a climb up a wall leads: over its top).
function aheadDir(path, i) {
  for (let j = i; j + 1 < path.length; j++) {
    const dx = Math.sign(path[j + 1].x - path[j].x);
    const dz = Math.sign(path[j + 1].z - path[j].z);
    if (dx || dz) return { x: dx, z: dz };
  }
  return undefined;
}

// One block down from where it is, into the block `c`: head first holding on to the side of
// something (the way it came across turned round, first), or a drop where there's nothing to hold.
function downLeg(read, c, lastAcross, t, legs) {
  const back = lastAcross ? { x: -lastAcross.x, z: -lastAcross.z } : undefined;
  const dir = gripDir(read, c, back);
  legs.push(dir ? { to: clingSpot(c, dir, t.hug), ticks: t.downTicks, act: ACT.down, yaw: yawTo(-dir.x, -dir.z) } : { to: centre(c), ticks: t.dropTicks, act: ACT.none, yaw: legs[legs.length - 1]?.yaw ?? 0 });
}

/**
 * The legs of a climb out of an exhibit along the climb measure's way out (`path`, blocks from the
 * floor to the first block outside), from a climber standing in the block `here` near its start: a
 * few steps across the floor to it, then up the wall clinging and facing it, over the top, along it,
 * and down the other side head first (or a drop where there's nothing to hold), on down to the
 * ground (the way out ends at the first block outside) and off the bark onto its feet. Undefined
 * when the way to the start isn't clear.
 */
export function escapeLegs(read, here, path, t) {
  const legs = [];
  const start = path[0];
  const dist = Math.hypot(start.x - here.x, start.z - here.z);
  if (dist > 0) {
    // Straight across the floor to the start: every block on the way open and floored.
    const n = Math.ceil(dist * 2);
    for (let k = 1; k <= n; k++) {
      const c = { x: Math.floor(here.x + 0.5 + ((start.x - here.x) * k) / n), y: here.y, z: Math.floor(here.z + 0.5 + ((start.z - here.z) * k) / n) };
      if (!standable(read, c) && read(c.x, c.y, c.z) !== "water") return undefined;
    }
    legs.push({ to: centre(start), ticks: Math.max(t.gripTicks, Math.round(dist * t.acrossTicks)), act: ACT.scramble, yaw: yawTo(start.x - here.x, start.z - here.z) });
  }
  let prev = start;
  let lastAcross = aheadDir(path, 0);
  for (let i = 1; i < path.length; i++) {
    const steps = stepsBetween(path[i - 1], path[i]);
    steps.forEach((p, k) => {
      if (p.y > prev.y) {
        // Up: holding the wall it is about to go over.
        const dir = gripDir(read, prev, aheadDir(path, i - 1)) ?? lastAcross ?? { x: 0, z: 1 };
        legs.push({ to: clingSpot(p, dir, t.hug), ticks: t.climbTicks, act: ACT.climb, yaw: yawTo(dir.x, dir.z) });
      } else if (p.y < prev.y) {
        // Down, a block at a time: head first holding on, or a drop.
        for (let y = prev.y - 1; y >= p.y; y--) downLeg(read, { x: p.x, y, z: p.z }, lastAcross, t, legs);
      } else {
        const d = { x: Math.sign(p.x - prev.x), z: Math.sign(p.z - prev.z) };
        lastAcross = d;
        // Over the edge of something it climbs down the far side of, it goes straight on down head
        // first holding on, rather than out into the air first.
        const next = steps[k + 1];
        const overEdge = next && next.y < p.y && gripDir(read, { x: p.x, y: p.y - 1, z: p.z }, { x: -d.x, z: -d.z });
        if (!overEdge) legs.push({ to: centre(p), ticks: t.acrossTicks, act: ACT.scramble, yaw: yawTo(d.x, d.z) });
      }
      prev = p;
    });
  }
  // On down to the ground outside, through the air (it stops at water, or anything else, below).
  for (let n = 0; n < t.maxDown && read(prev.x, prev.y - 1, prev.z) === "air"; n++) {
    prev = { x: prev.x, y: prev.y - 1, z: prev.z };
    downLeg(read, prev, lastAcross, t, legs);
  }
  const last = legs[legs.length - 1];
  if (last?.act === ACT.down) legs.push({ to: centre(prev), ticks: t.gripTicks, act: ACT.none, yaw: last.yaw });
  return legs;
}

// What a raccoon goes looking for next (the engine walks it there; animals/raccoon.js does the rest
// when it arrives): Litter Bins at night when it's loose (wild, or out of its exhibit), mostly;
// otherwise something to climb, water to wash in, a stocked Puzzle Feeder it eats from, or nothing
// in particular (it potters about).
export function pickInterest({ binsOk, puzzle }, random = Math.random) {
  if (binsOk && random() < 0.6) return "bins";
  const pool = ["climb", "climb", "water", "idle"];
  if (puzzle) pool.push("puzzle", "puzzle");
  return pool[Math.floor(random() * pool.length)];
}
