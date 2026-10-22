import { onlinePlayers, isNight } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { animalFromEntity, liveEntity } from "./animals.js";
import { getExhibit } from "../exhibits/exhibits.js";
import { sleepNow, isNocturnalHouse, SLEEPER_TYPES } from "./nightRules.js";
import { GECKO_TYPES, ACT as GECKO_ACT } from "./geckoRules.js";

// Nocturnal animals (M6 part 3b; the rules are in animals/nightRules.js). Every half second, for
// the hedgehogs near players only: by Minecraft day a hedgehog sleeps curled up where it stands (in
// its Burrow Shelter when it got there in time), and at night it is up and about; in a nocturnal
// house (a fully enclosed, dark building) that is turned round, so guests see it by day. An awake one curls
// into a ball for a few seconds when someone who isn't sneaking walks right up to it, wild or in a
// zoo. What a hedgehog is doing goes to the client through its entity properties (asleep, curled)
// for its animations, and the Field Journal reads the same. Asleep or curled, it is held still (the
// entity's zoocraft:still event) so the pose reads.

const RANGE = 48; // blocks from a player
const state = new Map(); // entity id -> { curledUntil, still }

// Every 10 ticks: the hedgehogs near players.
export function tickNight(now) {
  const seen = new Set();
  const players = onlinePlayers();
  const night = isNight();
  for (const player of players) {
    let hogs;
    try {
      hogs = player.dimension.getEntities({ location: player.location, maxDistance: RANGE, families: ["hedgehog"] });
    } catch {
      continue;
    }
    for (const h of hogs) {
      if (seen.has(h.id)) continue;
      seen.add(h.id);
      try {
        step(h, now, players, night);
      } catch {
        state.delete(h.id);
      }
    }
  }
  for (const id of [...state.keys()]) if (!seen.has(id)) state.delete(id);
}

function setProp(e, name, value) {
  if (e.getProperty(name) !== value) e.setProperty(name, value);
}

function dist3(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

// The exhibit a zoo hedgehog lives in; undefined for a wild one, or one in a carrier or holding.
function houseOf(entity) {
  const a = animalFromEntity(entity);
  if (!a || a.location.kind !== "exhibit") return undefined;
  return getExhibit(a.location.id);
}

function step(hog, now, players, night) {
  let s = state.get(hog.id);
  if (!s) {
    s = { curledUntil: 0, still: undefined };
    state.set(hog.id, s);
  }
  const ex = houseOf(hog);
  const asleep = sleepNow(night, ex ? isNocturnalHouse(ex, BALANCE) : false);
  const N = BALANCE.nocturnal;
  if (!asleep && players.some((p) => p.dimension.id === hog.dimension.id && !p.isSneaking && dist3(p.location, hog.location) <= N.startleRange)) s.curledUntil = now + N.startleTicks;
  const curled = !asleep && now < s.curledUntil;
  setProp(hog, "zoocraft:asleep", asleep);
  setProp(hog, "zoocraft:curled", curled);
  const still = asleep || curled;
  // First met, s.still is unset, so this always sets the right group (0.1.70: which also gives back a
  // walking speed the old "move" event could take away, see the hedgehog's zoocraft:moving group).
  if (still !== s.still) {
    hog.triggerEvent(still ? "zoocraft:still" : "zoocraft:move");
    s.still = still;
  }
}

// Is this entity a nocturnal animal asleep in its ball? (A Viewing Point doesn't count one; other
// animals have no such property and are never asleep.) A Warped Gecko (0.1.85) tucked into its hide by day, in a crack
// or a Burrow Shelter, is out of sight too (one asleep up on a wall is still on show).
export function entityAsleep(e) {
  try {
    if (GECKO_TYPES.includes(e.typeId)) return e.getProperty("zoocraft:act") === GECKO_ACT.hide;
    return SLEEPER_TYPES.has(e.typeId) && e.getProperty("zoocraft:asleep") === true;
  } catch {
    return false;
  }
}

// Is this nocturnal animal standing in pitch dark (light level 0)? Guests can't see one there, so
// a Viewing Point doesn't count it: a nocturnal house needs its Nocturnal Lamps. Other animals are
// never hidden this way.
export function hiddenInTheDark(e) {
  try {
    if (!SLEEPER_TYPES.has(e.typeId) || e.getProperty("zoocraft:asleep") === undefined) return false;
    return e.dimension.getBlock(e.location)?.getLightLevel() === 0;
  } catch {
    return false;
  }
}

// What a zoo animal is doing now, from its live entity: { asleep, curled }, or undefined while it
// isn't loaded.
export function nightState(animal) {
  const e = liveEntity(animal.id);
  if (!e) return undefined;
  try {
    return { asleep: e.getProperty("zoocraft:asleep") === true, curled: e.getProperty("zoocraft:curled") === true };
  } catch {
    return undefined;
  }
}
