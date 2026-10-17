// Gorillas (0.1.80, the Treetop trio), pure: what a gorilla is doing, the troop's day, the strong walls an
// exhibit needs (the ape measure: exhibits/geometry.js floodClimb with opts.ape), deep water, the troop's one
// silverback, the wild silverback's bluff, and what to tell players. Spec 5.2: "gorilla | Gorilla | Social
// interaction and puzzle solving | Strong fixtures and climbing structures". The game side is
// animals/gorilla.js; the dens, the service gates and the danger to players inside the exhibit are
// animals/predatorRules.js and animals/predators.js (every `dangerous` species). Facts and sources:
// research/treetop_facts.md; the design: research/treetop_plan.md ("0.1.80 Gorilla").

import { ACT as CLIMB_ACT, escapeLegs, clingSpot, centre, hugFor, yawTo } from "./climbRules.js";
import { sexOf } from "./breeding.js";

// The gorilla mobs, found by type (0.1.70: never by family alone).
export const GORILLA_TYPES = ["zoocraft:gorilla", "zoocraft:wild_gorilla"];

// What a gorilla is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/gorilla.py) and the Field Journal watches for it.
export const ACT = {
  none: 0,
  walk: 1, // knuckle-walking where the script takes it
  run: 2, // a charge
  sit: 3,
  eat: 4, // sat up, the food in its hand
  browse: 5, // sat up, reaching into the leaves
  puzzle: 6, // working a Puzzle Feeder
  groom: 7, // picking through another's fur
  nest: 8, // building a nest, pulling branches in round it
  sleep: 9, // asleep on its side
  rest: 10, // lying on its belly, chin on its hands
  display: 11, // the chest-beat display (4 s)
  warn: 12, // upright, beating its chest at someone
  shove: 13, // the shove (0.9 s)
  play: 14, // the young at play
  climb: 15,
  top: 16, // sat on top of a Climbing Frame or a trunk
  down: 17,
  ride: 18, // an infant riding on its mother's back
};
// The client's display and shove, in ticks (gen/gorilla.py: 4 s and 0.9 s; the shove lands at 0.55 s).
export const TICKS = { display: 80, shove: 18 };
// How fast the script walks and runs one, in blocks a tick: the client's strides (gen/gorilla.py: the walk
// about 1 block a second, the run 4.5, a little slower than a sprinting player: a bluff charge can be
// walked back from, a real one can't quite be outrun from close).
export const PACE = { walk: 1.0 / 20, run: 4.5 / 20 };

// ---------------- the troop ----------------
// A gorilla's role: "silverback" (a grown male), "female" (a grown female) or "young".
export function roleOf(a, species) {
  if (a.juvenile) return "young";
  return sexOf(a, species) === "male" ? "silverback" : "female";
}

// A wild gorilla has no record: its sex is its mark (minecraft:mark_variant 1, the silverback).
export function wildRole(mark) {
  return mark === 1 ? "silverback" : "female";
}

// An infant (born within G.rideDays park days) rides on its mother's back while she moves.
export function isInfant(a, today, G) {
  return Boolean(a?.juvenile) && a.bornDay !== undefined && today - a.bornDay < G.rideDays;
}

// ---------------- the day ----------------
// Gorillas are about by day (treetop_facts.md): feeding in the morning, a midday rest in day nests while the
// young play, feeding again, and night nests built before dusk. World time of day: 0 sunrise, 6000 noon,
// 12000 sunset, 18000 midnight.
export function dayPart(timeOfDay) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  if (t >= 23000 || t < 4000) return "morning"; // from dawn
  if (t >= 13000) return "night";
  if (t >= 11000) return "nesting";
  if (t >= 8000) return "afternoon";
  return "midday";
}

/**
 * The troop's mood for a while: "feed" (at the feeders, browsing, a Puzzle Feeder), "travel" (the silverback
 * leads them somewhere else), "rest" (a day nest: lying about near him), "social" (grooming, the young at
 * play, climbing), "nest" (building night nests) or "sleep".
 * @param {string} part dayPart()
 */
export function pickMood(part, G, random = Math.random) {
  const w = G.moods[part] ?? G.moods.morning;
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  let r = random() * total;
  for (const [mood, v] of Object.entries(w)) {
    if ((r -= v) < 0) return mood;
  }
  return "rest";
}

/**
 * Where the troop rests round the silverback: a ring G.restRing blocks out, each a little apart, the young
 * nearest. Returns [{ x, z }] for `count` gorillas, starting at `start` degrees.
 */
export function ringPlaces(mid, count, G, start = 0) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = ((start + (360 * i) / Math.max(1, count)) * Math.PI) / 180;
    const r = G.restRing + (i % 2) * 0.8;
    out.push({ x: mid.x + Math.cos(a) * r, z: mid.z + Math.sin(a) * r });
  }
  return out;
}

// ---------------- the exhibit ----------------
// Strong walls (the ape measure). A gorilla grips trees, Climbing Frames, leaves and fences (wooden rails, as
// chain-link is to a real one: EAZA 2024 never chain-link); it can't grip stone, planks, glass, glass panes,
// iron bars or stone walls. It reaches up and pulls itself onto any top up to G.reach blocks above where it
// stands (a fence or wall block is a block and a half high). The real rule (EAZA 2024): non-climbable walls 4
// m or higher, climbing structures 4 m or more from the walls.
export function apeIssue(plural, climb, G) {
  const v = climb.via;
  const where = v ? ` near ${v.x} ${v.y} ${v.z}` : "";
  const how = v?.leaves ? ", through the branches of a tree that reach over the wall" : v?.hedge ? ", over a hedge" : "";
  return `${plural} could get out${where}${how}. They climb trees, Climbing Frames and fences, and pull themselves up onto anything up to ${G.reach} blocks above where they stand (a fence or wall block counts as a block and a half): build the walls ${Math.ceil(G.reach)} or more blocks high of solid blocks or glass, with nothing to climb within reach of them.`;
}

// The clipboard's line about it.
export function apeLine(ex, plural) {
  const c = ex.apeClimb;
  if (!c) return "§fStrong walls: §7not measured yet: use the Habitat Marker on the ground inside again";
  const trees = `${c.trees} climbing tree${c.trees === 1 ? "" : "s"} (3 or more logs high)`;
  if (c.proof) return `§fStrong walls: §ayes§7, ${plural.toLowerCase()} can't get out; ${trees}`;
  const v = c.via;
  return `§fStrong walls: §cno§7, ${plural.toLowerCase()} could get out${v ? ` near ${v.x} ${v.y} ${v.z}${v.leaves ? " through a tree's branches" : ""}` : ""}; ${trees}`;
}

// Deep water: gorillas can't swim (EAZA 2024: they drown). Any water 2 or more deep in the exhibit is a danger.
export function deepWaterSafe(species, ex) {
  return !species.noSwim || !(ex.deepWaterCells > 0);
}

// Two or more grown males with grown females: rival silverbacks (animals/breeding.js rivalStallions is the
// count). A bachelor group (males only) is fine (EAZA: at most 3 or 4).
export function troopWarnings(ex, residents, rivals, G) {
  const out = [];
  const plural = "Gorillas";
  if (ex.deepWaterCells > 0) out.push({ severity: 2, text: `${plural} can't swim and drown in deep water: ${ex.deepWaterCells} spot${ex.deepWaterCells === 1 ? " is" : "s are"} 2 or more blocks deep. Fill the water to 1 block deep, or fence the deep part off` });
  if (rivals.length) out.push({ severity: 2, text: `${rivals.length} silverbacks with the females: a troop has one silverback, and rivals fight. Move the others to a bachelor group (an exhibit with no females)` });
  const grown = residents.filter((a) => !a.juvenile);
  const males = grown.filter((a) => a.sex === "male").length;
  if (!rivals.length && males > G.bachelorMax && males === grown.length) out.push({ severity: 1, text: `${males} grown males together: a bachelor group gets on with ${G.bachelorMax} at most` });
  return out;
}

// The clipboard's lines for a gorilla exhibit.
export function troopLines(ex, residents) {
  const grown = residents.filter((a) => !a.juvenile);
  const males = grown.filter((a) => a.sex === "male");
  const lines = [];
  lines.push(`§fTroop: §7${males.length ? `${males.length} silverback${males.length === 1 ? "" : "s"}` : "no silverback"}, ${grown.length - males.length} female${grown.length - males.length === 1 ? "" : "s"}, ${residents.length - grown.length} young`);
  lines.push(`§fDeep water: §7${ex.deepWaterCells ? `§c${ex.deepWaterCells} spots 2 or more deep§7 (gorillas drown)` : "none (gorillas can't swim)"}`);
  return lines;
}

// ---------------- climbing ----------------
/**
 * The legs of a climb up a trunk or a Climbing Frame (for the mover, animals/gorilla.js: [{ to, ticks, act,
 * yaw }], each a glide to `to` over `ticks` ticks doing `act`, facing `yaw`): from the block `from` with the
 * trunk `dir` ({ x, z }) one block away, along `route` (climbRules.js climbRoute): onto it, hand over hand up its
 * face, and over onto the top where the route ends there. `scale`: a young one's size (it hugs closer).
 */
export function apeUpLegs(from, dir, route, G, scale = 1) {
  const face = yawTo(dir.x, dir.z);
  const hug = hugFor(G.hug, scale);
  const legs = [{ to: clingSpot(from, dir, hug), ticks: G.gripTicks, act: ACT.climb, yaw: face }];
  for (const c of route.up) legs.push({ to: clingSpot(c, dir, hug), ticks: G.climbTicks, act: ACT.climb, yaw: face });
  if (route.onTop) {
    const last = route.up[route.up.length - 1];
    legs.push({ to: clingSpot({ x: from.x, y: last.y + 1, z: from.z }, dir, hug), ticks: G.climbTicks, act: ACT.climb, yaw: face });
    legs.push({ to: centre(route.top), ticks: G.acrossTicks, act: ACT.walk, yaw: face });
  }
  return legs;
}

// Back down the same way (see apeUpLegs): feet first, facing the trunk (an ape climbs down as it went up,
// not head first like a raccoon), to the middle of the block `from` on the ground.
export function apeDownLegs(from, dir, route, G, scale = 1) {
  const face = yawTo(dir.x, dir.z);
  const hug = hugFor(G.hug, scale);
  const up = route.up;
  const legs = [];
  if (route.onTop) legs.push({ to: clingSpot({ x: from.x, y: up[up.length - 1].y + 1, z: from.z }, dir, hug), ticks: G.acrossTicks, act: ACT.down, yaw: face });
  for (let i = route.onTop ? up.length - 1 : up.length - 2; i >= 0; i--) legs.push({ to: clingSpot(up[i], dir, hug), ticks: G.downTicks, act: ACT.down, yaw: face });
  legs.push({ to: clingSpot(from, dir, hug), ticks: G.downTicks, act: ACT.down, yaw: face });
  legs.push({ to: centre(from), ticks: G.gripTicks, act: ACT.none, yaw: face });
  return legs;
}

/**
 * The legs of a way out of an exhibit without strong walls, along the ape measure's way out (`path`, blocks from
 * the floor to the first block outside), from a gorilla standing in the block `here` near its start: the
 * raccoon's escape (climbRules.js escapeLegs) as a gorilla does it: it walks where a raccoon scrambles, faces the
 * wall coming down (feet first), and takes a climbTicks for each block of a pull up onto a top. Undefined when the
 * way to the start isn't clear.
 */
export function apeEscapeLegs(read, here, path, G) {
  const legs = escapeLegs(read, here, path, G);
  if (!legs) return undefined;
  let y = here.y;
  return legs.map((l, i) => {
    const rise = Math.max(1, Math.round(l.to.y - y));
    y = l.to.y;
    if (l.act === CLIMB_ACT.climb || l.act === CLIMB_ACT.cling) return { ...pullUp(read, l, legs[i + 1], G), act: ACT.climb, ticks: G.climbTicks * rise };
    if (l.act === CLIMB_ACT.down) return { ...l, act: ACT.down, yaw: (l.yaw + 180) % 360 };
    if (l.act === CLIMB_ACT.scramble) return { ...l, act: ACT.walk };
    return { ...l, act: ACT.none };
  });
}

// A pull up onto a top that has nothing in front of it to hold (the raccoon's escape faces the way it last went
// across then: from the top of a Climbing Frame up onto the wall beside it, that's out over the frame's edge): it
// faces the way it goes over next, the wall it reaches up onto, instead.
function pullUp(read, l, next, G) {
  const cell = { x: Math.floor(l.to.x), y: Math.round(l.to.y), z: Math.floor(l.to.z) };
  const facing = { x: Math.round(-Math.sin((l.yaw * Math.PI) / 180)), z: Math.round(Math.cos((l.yaw * Math.PI) / 180)) };
  const held = (d) => !["air", "water", "unloaded"].includes(read(cell.x + d.x, cell.y - 1, cell.z + d.z));
  if (held(facing) || !next) return l;
  const dx = next.to.x - l.to.x;
  const dz = next.to.z - l.to.z;
  const ahead = Math.abs(dx) >= Math.abs(dz) ? { x: Math.sign(dx), z: 0 } : { x: 0, z: Math.sign(dz) };
  if (!(ahead.x || ahead.z) || !held(ahead)) return l;
  return { ...l, to: clingSpot(cell, ahead, G.hug), yaw: yawTo(ahead.x, ahead.z) };
}

// ---------------- the wild silverback's bluff ----------------
// Austin's card (2026-10-16, recommended "Bluff"): a wild silverback warns off a Survival or Adventure player
// who comes within B.displayRange blocks (hoots, stands, beats his chest); still within B.chargeRange after the
// display, he charges and stops short (B.stopShort blocks off), standing his ground; come on within
// B.closeRange, or hurt one of his troop, and the charge is real: a shove for B.damage when he reaches them. A bluff
// charge stops inside B.closeRange, so (displaying, or standing his ground) only coming closer than they were when
// it began counts as coming on (STEP_IN): a player who stands still through the bluff isn't charged for real, nor
// when he starts again on one still standing where his bluff charge left them.
// Back off and he lets them be. One state per silverback and player:
//   "calm" -> "display" -> "charge" (bluff or real) -> "stand" -> "back" (leaves them be a while) -> "calm".
//   see: { dist, exposed (in Survival or Adventure, and not calm: no thrown food), grudge (hurt the troop lately) }
// Returns the next state; `shove` is set on the tick a real charge reaches them.
const STEP_IN = 0.5; // blocks closer than where the silverback stood his ground: coming on
export function bluffStep(s, see, now, B) {
  const st = s ?? { phase: "calm", since: now };
  const at = (phase, extra = {}) => ({ phase, since: now, ...extra });
  if (st.phase === "back") return now >= st.until ? at("calm") : st.shove ? { ...st, shove: false } : st;
  if (!see.exposed) return st.phase === "calm" ? st : at("calm");
  if (see.grudge && st.phase !== "charge") return at("charge", { real: true });
  if (st.phase === "calm") return see.dist <= B.displayRange ? at("display", { near: see.dist }) : st;
  if (st.phase === "display") {
    if (see.dist > B.displayRange + B.leaveSlack) return at("calm");
    if (see.dist <= B.closeRange && see.dist < (st.near ?? Infinity) - STEP_IN) return at("charge", { real: true });
    if (now - st.since >= B.displayTicks) return see.dist <= B.chargeRange ? at("charge", { real: false }) : at("stand", { near: see.dist });
    return st;
  }
  if (st.phase === "charge") {
    if (st.real) {
      if (see.dist <= B.reach) return at("back", { until: now + B.backTicks, shove: true });
      if (now - st.since >= B.chargeTicks) return at("back", { until: now + B.missBackTicks });
      return st;
    }
    if (see.dist <= B.stopShort + 0.4 || now - st.since >= B.chargeTicks) return at("stand", { near: see.dist });
    return st;
  }
  // Standing his ground, watching them: coming on (within the close range, and closer than when he stood) is a
  // real charge; staying back, he leaves them be.
  if (see.dist <= B.closeRange && see.dist < (st.near ?? Infinity) - STEP_IN) return at("charge", { real: true });
  if (see.dist > B.displayRange + B.leaveSlack) return at("calm");
  if (now - st.since >= B.standTicks) return at("back", { until: now + B.backTicks });
  return st;
}

// The Field Journal and the clipboard: how dangerous wild gorillas are.
export function wildLine(B) {
  return `Wild gorillas live in jungle troops: one silverback with his females. Come within ${B.displayRange} blocks and he warns you off: he hoots, stands up and beats his chest. Still within ${B.chargeRange} and he charges, stopping short: back away and he lets you be. Keep coming (within ${B.closeRange}) or hurt one of his troop and the charge is real: a shove for ${B.damage / 2} hearts. Throw a Fruit Ration down near one: while it eats it's calm, and can be crated.`;
}
