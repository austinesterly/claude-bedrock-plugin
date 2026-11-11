// Shark People in the Exotic Formation (0.1.240; rules in world/sharkPeopleRules.js). Every few seconds, for each
// hall with a player in it: on Peaceful its Shark People go; otherwise, while it has fewer than the difficulty's
// count, one more may be put down on the floor away from the players, half of them on their village's plaza. A faster loop, running only while a hall has
// a player in it, lets them swim in goo: up and out of a pit towards whoever is near.
// The mob itself is the game's own kind of monster (BP entities/shark_person.json): it sees, chases and bites.
import { world } from "@minecraft/server";
import { onlinePlayers } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { hallAt, awayFrom } from "./midnightOwlRules.js";
import { hallFloor } from "./hallFloor.js";
import { inExotic } from "./exoticBiome.js";
import { SHARK_PERSON, difficultyKey, sharksWanted, sharkSpot, gooPush } from "./sharkPeopleRules.js";
import { cellOf } from "./formationRules.js";
import { villageIn, plazaSpot, inHut } from "./sharkVillageRules.js";

const P = BALANCE.sharkPeople;
const V = BALANCE.sharkVillage;
const GOO = "zoocraft:goo";
let active = []; // the halls with a player in them at the last look: { f, d }
const swimming = new Set(); // the Shark People pushed at the last goo look

function settle(d, f, players) {
  const c = cellOf(f.x, f.z);
  const village = villageIn(c.i, c.j);
  for (let n = 0; n < P.tries; n++) {
    const by = players[Math.floor(Math.random() * players.length)];
    // half of them at their village's plaza (0.1.241), the rest anywhere in the hall but on a hut
    // (when a player is too near the plaza for that, they come from the hall like the rest)
    let spot = Math.random() < V.share ? plazaSpot(village, Math.random(), Math.random()) : undefined;
    if (!spot || !awayFrom(spot, players, { away: P.near[0] })) spot = sharkSpot(f, by.x, by.z, Math.random(), Math.random(), P);
    if (!spot || inHut(village, spot.x, spot.z) || !awayFrom(spot, players, { away: P.near[0] })) continue;
    const y = hallFloor(d, f, spot, P);
    if (y === undefined) continue;
    d.spawnEntity(SHARK_PERSON, { x: spot.x + 0.5, y, z: spot.z + 0.5 });
    return true;
  }
  return false;
}

const sharksOf = (d, f) => d.getEntities({ type: SHARK_PERSON, location: { x: f.x, y: f.y + 12, z: f.z }, maxDistance: f.radius + P.count });

export function tickSharkPeople() {
  const halls = new Map(); // "x,z" -> { f, d, players }
  for (const player of onlinePlayers()) {
    try {
      if (player.dimension.id !== "minecraft:overworld") continue;
      const at = player.location;
      const f = hallAt(at.x, at.y, at.z, P);
      if (!f || !inExotic(player.dimension, at)) continue; // 0.1.253: the biome says whether this is the Exotic Formation
      const key = `${f.x},${f.z}`;
      if (!halls.has(key)) halls.set(key, { f, d: player.dimension, players: [] });
      halls.get(key).players.push(at);
    } catch {
      // left meanwhile
    }
  }
  active = [...halls.values()];
  if (!active.length) return;
  const difficulty = difficultyKey(world.getDifficulty());
  for (const { f, d, players } of active) {
    try {
      const sharks = sharksOf(d, f);
      if (difficulty === "peaceful") {
        for (const shark of sharks) shark.remove();
        continue;
      }
      if (sharksWanted(sharks.length, difficulty, P) > 0 && Math.random() < P.chance) settle(d, f, players);
    } catch {
      // a chunk not loaded: next time
    }
  }
}

export function tickSharkGoo() {
  if (!active.length) {
    if (swimming.size) swimming.clear();
    return;
  }
  const seen = new Set();
  for (const { f, d } of active) {
    try {
      const players = d.getPlayers({ location: { x: f.x, y: f.y, z: f.z }, maxDistance: f.radius + P.count });
      for (const shark of sharksOf(d, f)) {
        const at = shark.location;
        const goo = (dy) => d.getBlock({ x: at.x, y: at.y + dy, z: at.z })?.typeId === GOO;
        const inGoo = goo(0);
        const over = !inGoo && swimming.has(shark.id) && (goo(-1) || goo(-2));
        if (!inGoo && !over) continue;
        let dx = Infinity;
        let dy = 0;
        let dz = Infinity;
        for (const p of players) {
          const l = p.location;
          if (Math.hypot(l.x - at.x, l.z - at.z) < Math.hypot(dx, dz)) [dx, dy, dz] = [l.x - at.x, l.y - at.y, l.z - at.z];
        }
        const push = gooPush({ inGoo, over, deep: inGoo && goo(1.6) }, dx, dy, dz, shark.getVelocity(), P);
        if (!push) continue;
        seen.add(shark.id);
        shark.applyImpulse(push);
      }
    } catch {
      // a chunk not loaded: next time
    }
  }
  for (const id of swimming) if (!seen.has(id)) swimming.delete(id);
  for (const id of seen) swimming.add(id);
}
