import { BLOCKS, isClearLava, FIRE_IMMUNE_TYPES } from "../data/items.js";
import { onlinePlayers } from "../platform/mc.js";
import { GLIDE, glideStep, reached, spotIn, facing } from "./glide.js";

// Clear Lava (Austin, 0.1.47) is a see-through block that acts like lava (equipment/lavaFlow.js
// makes it flow). Bedrock add-ons can't add liquids, so what lava does is done here, near players only:
// - Lava Rays swim in it (steered by animals/glide.js), so they can be watched under the surface
//   (in the full blocks: pools and falls, not the shallow flowing edges);
// - anything else in it burns like in lava, and dropped items burn up;
// - players sink slowly in it and rise while they hold jump, like swimming in lava.

const RANGE = 48; // blocks from a player
const swimming = new Map(); // ray entity id -> { spot, drifting, until, trim }

function blockAt(d, p) {
  try {
    return d.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });
  } catch {
    return undefined; // unloaded or out of the world
  }
}
function isClear(d, p) {
  return blockAt(d, p)?.typeId === BLOCKS.clearLava;
}

// Is this entity in Clear Lava (still or flowing): its feet, or the middle of its body?
export function inClearLava(entity) {
  const l = entity.location;
  const d = entity.dimension;
  return isClearLava(blockAt(d, l)?.typeId) || isClearLava(blockAt(d, { x: l.x, y: l.y + 0.5, z: l.z })?.typeId);
}

// Every tick: steer the Lava Rays near players that are in Clear Lava.
export function tickLavaSwim(now) {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let rays;
    try {
      rays = player.dimension.getEntities({ location: player.location, maxDistance: RANGE, families: ["lava_ray"] });
    } catch {
      continue;
    }
    for (const r of rays) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      try {
        steer(r, now);
      } catch {
        swimming.delete(r.id);
      }
    }
  }
  for (const id of [...swimming.keys()]) if (!seen.has(id)) swimming.delete(id);
}

function steer(ray, now) {
  const d = ray.dimension;
  const pos = ray.location;
  const here = isClear(d, pos) ? pos : isClear(d, { x: pos.x, y: pos.y + 0.5, z: pos.z }) ? { x: pos.x, y: pos.y + 0.5, z: pos.z } : undefined;
  const move = ray.getComponent("minecraft:movement");
  let s = swimming.get(ray.id);
  if (!here) {
    // Out of the Clear Lava (in real lava, or on the bank): the game moves it as usual. (Its held
    // walking speed is saved with the world, so it's given back even after a reload.)
    swimming.delete(ray.id);
    if (move && move.currentValue === 0) move.resetToDefaultValue();
    return;
  }
  if (!s) {
    // Hold still for the game's own walking, which would only drag it along the bottom.
    move?.setCurrentValue(0);
    s = { spot: spotIn(cellOf(here)), drifting: true, until: now, trim: 0 };
    swimming.set(ray.id, s);
  }
  if (now >= s.until || (!s.drifting && reached(pos, s.spot))) pickSpot(ray, s, now);
  const yaw = ray.getRotation().y;
  const f = facing(yaw);
  const clearAhead = isClear(d, { x: pos.x + f.x * 1.2, y: s.spot.y, z: pos.z + f.z * 1.2 });
  const v = glideStep({ pos, yaw, spot: s.spot, drifting: s.drifting, clearAhead, trim: s.trim });
  s.trim = v.trim;
  ray.clearVelocity();
  ray.applyImpulse({ x: v.x, y: v.y, z: v.z });
  if (!s.drifting) ray.setRotation({ x: 0, y: v.yaw });
}

function cellOf(p) {
  return { x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) };
}

// The next spot: a random Clear Lava cell in reach (any depth), or a pause where it drifts.
function pickSpot(ray, s, now) {
  const here = cellOf(ray.location);
  if (Math.random() < GLIDE.driftChance && !s.drifting) {
    const [lo, hi] = GLIDE.driftTicks;
    s.drifting = true;
    s.spot = { ...ray.location, y: Math.max(ray.location.y, s.spot.y) };
    s.until = now + lo + Math.floor(Math.random() * (hi - lo + 1));
    return;
  }
  const d = ray.dimension;
  const r = GLIDE.wanderRange;
  for (let i = 0; i < GLIDE.tries; i++) {
    const c = { x: here.x + Math.floor(Math.random() * (2 * r + 1)) - r, y: here.y + Math.floor(Math.random() * 4) - 2, z: here.z + Math.floor(Math.random() * (2 * r + 1)) - r };
    if (Math.hypot(c.x - here.x, c.z - here.z) < 2 || !isClear(d, c)) continue;
    s.drifting = false;
    s.spot = spotIn(c);
    s.until = now + GLIDE.swimTicks;
    return;
  }
  // Nowhere to go (a tiny pool): drift where it is for a bit.
  s.drifting = true;
  s.spot = spotIn(here);
  s.until = now + GLIDE.driftTicks[0];
}

// Every few ticks: Clear Lava burns what falls in, like lava, and players can swim up out of it.
export function tickClearLavaBurn() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    let near;
    try {
      // Clear Lava does nothing to our fire-proof entities, so they're left out of the query rather than have the block
      // read at each one (0.1.96: guests, keepers and the Nether animals are half a full park).
      near = player.dimension.getEntities({ location: player.location, maxDistance: RANGE, excludeTypes: FIRE_IMMUNE_TYPES });
    } catch {
      continue;
    }
    for (const e of near) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      try {
        if (!e.isValid || !inClearLava(e)) continue;
        burn(e);
      } catch {
        // gone mid-check
      }
    }
  }
}

function burn(e) {
  if (e.typeId === "minecraft:item") return void e.kill(); // dropped items burn up, as in lava
  if (e.typeId === "minecraft:player") {
    // Sink slowly; hold jump to swim up (like lava).
    e.addEffect("slow_falling", 10, { amplifier: 0, showParticles: false });
    if (e.isJumping) e.addEffect("levitation", 6, { amplifier: 3, showParticles: false });
  }
  if (e.getComponent("minecraft:fire_immune")) return; // Nether animals, blazes, striders...
  e.setOnFire(15, true);
  e.applyDamage(4, { cause: "lava" });
}
