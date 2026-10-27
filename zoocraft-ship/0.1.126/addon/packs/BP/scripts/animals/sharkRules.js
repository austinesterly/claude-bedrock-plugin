// Sharks (0.1.125, module 6b: the Great White and the Hammerhead; research/trench_plan.md "Danger"), pure: what a shark
// is doing, and the sums behind the way animals/shark.js steers one. A shark is a dangerous big fish (species.shark,
// with species.dangerous and species.bigFish): the predators' warn-then-charge danger (animals/predatorRules.js
// dangerStep) with water moves. The warn is a circle round the swimmer; the charge is the rush, jaws open; the bite is
// the predators' swipe (3 hearts and a shove); then it backs off. A thrown Fish Ration calms a wild one, or one in a
// tank, so the Large Water Tank can take it (there are no Holding Dens in a tank: keepers feed from the bank and never
// go in). Every rule here is by the species' flags, never by name.

// What a shark is doing (its zoocraft:act entity property): the client plays the matching animation.
export const ACT = {
  cruise: 0,
  circle: 1, // the warn: round and round the swimmer
  rush: 2, // the charge, jaws open
  breach: 3, // the great white's surge to the surface (the entity's own timer)
  sweep: 4, // the hammerhead's head swinging over the floor (the entity's own timer)
  eat: 5, // a thrown Fish Ration
  lunge: 6, // the goblin shark's jaws slung forward (the entity's own timer; 0.1.126)
};

// Which act each kind of danger intent means (animals/predators.js intents: warn, charge, back).
export function actFor(kind) {
  return kind === "warn" ? ACT.circle : kind === "charge" ? ACT.rush : kind === "bait" || kind === "eat" ? ACT.eat : ACT.cruise;
}

// The spot on the circle round the swimmer this step: `angle` in radians, S.circleRadius out, a little under them.
export function circleSpot(center, angle, S) {
  return { x: center.x + Math.cos(angle) * S.circleRadius, y: center.y - S.circleDepth, z: center.z + Math.sin(angle) * S.circleRadius };
}

// The angle to start circling from: where the shark is now, seen from the swimmer.
export function angleFrom(center, pos) {
  return Math.atan2(pos.z - center.z, pos.x - center.x);
}

// Where to back off to after the bite: S.backOff blocks straight away from the swimmer, at its own depth.
export function awaySpot(pos, from, S) {
  const dx = pos.x - from.x;
  const dz = pos.z - from.z;
  const len = Math.hypot(dx, dz) || 1;
  return { x: pos.x + (dx / len) * S.backOff, y: pos.y, z: pos.z + (dz / len) * S.backOff };
}

// One tick's move toward `to` at `pace` blocks a tick: the next position, and whether it is there (within S.reach).
export function stepToward(pos, to, pace, S) {
  const dx = to.x - pos.x;
  const dy = to.y - pos.y;
  const dz = to.z - pos.z;
  const len = Math.hypot(dx, dy, dz);
  if (len <= S.reach) return { pos: { ...pos }, done: true };
  const f = Math.min(1, pace / len);
  return { pos: { x: pos.x + dx * f, y: pos.y + dy * f, z: pos.z + dz * f }, done: false };
}

// The yaw to face the way it moves (Bedrock: 0 is south, +z; 90 is west, -x) and the pitch (up is negative).
export function headingOf(dx, dy, dz) {
  const flat = Math.hypot(dx, dz);
  return { yaw: (Math.atan2(-dx, dz) * 180) / Math.PI, pitch: flat > 0.001 || dy !== 0 ? (-Math.atan2(dy, flat) * 180) / Math.PI : 0 };
}

// The pace for each act (blocks a tick: S.pace).
// `scale`: a slow shark's fraction of it (species.sharkPace: the goblin shark drifts at half the others' steps).
export function paceFor(act, S, scale = 1) {
  return (act === ACT.rush ? S.pace.rush : act === ACT.circle ? S.pace.circle : act === ACT.eat ? S.pace.bait : S.pace.back) * scale;
}
