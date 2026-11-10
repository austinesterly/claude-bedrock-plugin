// Midnight Owls in the Exotic Formation (0.1.238; rules in world/midnightOwlRules.js). Every few seconds, for each
// hall with a player in it: the hall is topped up to a few owls, one at a time, each put down on a floor or ledge away
// from the players; now and then one hoots, two low notes; and one that has settled into a goo pit is lifted out.
// The owls themselves are the game's own flying mob (BP entities/wild_midnight_owl.json): they fly about the hall,
// land, and look at whoever comes close. They harm nothing.
import { onlinePlayers } from "../platform/mc.js";
import { runTimeoutLater } from "../park/park.js";
import { BALANCE } from "../data/balance.js";
import { PASSABLE_PATTERNS } from "../data/blocks.js";
import { MIDNIGHT_OWL, hallAt, owlSpot, perchIn, awayFrom, owlsWanted } from "./midnightOwlRules.js";

const M = BALANCE.midnightOwl;
const kinds = new Map(); // block id -> "solid" or "other"

function kindOf(block) {
  if (block.isAir) return "air";
  if (block.isLiquid) return "other";
  const id = block.typeId;
  let k = kinds.get(id);
  if (!k) {
    k = PASSABLE_PATTERNS.some((r) => r.test(id)) ? "other" : "solid";
    kinds.set(id, k);
  }
  return k;
}

function hoot(owl) {
  const d = owl.dimension;
  const at = owl.location;
  d.playSound("note.flute", at, { volume: M.hootVolume, pitch: M.hootPitch[0] });
  runTimeoutLater(() => {
    try {
      d.playSound("note.flute", at, { volume: M.hootVolume, pitch: M.hootPitch[1] });
    } catch {
      // unloaded meanwhile
    }
  }, M.hootGap);
}

function settle(d, f, players) {
  const range = d.heightRange;
  for (let n = 0; n < M.tries; n++) {
    const spot = owlSpot(f, Math.random(), Math.random(), M);
    if (!awayFrom(spot, players, M)) continue;
    const top = Math.min(range.max - 1, f.y + M.top);
    const column = [];
    for (let i = 0; i <= M.depth && top - i >= range.min; i++) {
      const b = d.getBlock({ x: spot.x, y: top - i, z: spot.z });
      if (!b) break;
      column.push(kindOf(b));
    }
    const i = perchIn(column, M);
    if (i < 0) continue;
    d.spawnEntity(MIDNIGHT_OWL, { x: spot.x + 0.5, y: top - i + 1, z: spot.z + 0.5 });
    return true;
  }
  return false;
}

export function tickMidnightOwls() {
  const halls = new Map(); // "x,z" -> { f, d, players }
  for (const player of onlinePlayers()) {
    try {
      if (player.dimension.id !== "minecraft:overworld") continue;
      const at = player.location;
      const f = hallAt(at.x, at.y, at.z, M);
      if (!f) continue;
      const key = `${f.x},${f.z}`;
      if (!halls.has(key)) halls.set(key, { f, d: player.dimension, players: [] });
      halls.get(key).players.push(at);
    } catch {
      // left meanwhile
    }
  }
  for (const { f, d, players } of halls.values()) {
    try {
      const owls = d.getEntities({ type: MIDNIGHT_OWL, location: { x: f.x, y: f.y + 12, z: f.z }, maxDistance: f.radius + M.count });
      for (const owl of owls) {
        if (d.getBlock(owl.location)?.typeId === "zoocraft:goo") owl.applyImpulse({ x: 0, y: M.lift, z: 0 }); // up and out of a goo pit
      }
      if (owls.length && Math.random() < M.hootChance) hoot(owls[Math.floor(Math.random() * owls.length)]);
      if (owlsWanted(owls.length, M) > 0) settle(d, f, players);
    } catch {
      // a chunk not loaded: next time
    }
  }
}
