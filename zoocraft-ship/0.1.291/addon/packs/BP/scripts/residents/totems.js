// The Volatile Totems (0.1.291; the rules: residents/voidRules.js, the numbers: data/balance.js `void.totems`).
//
// Use one (hold it and use it, anywhere) and it takes you: Dwelling to your bed (the world's spawn if the bed is gone),
// Zoo to your zoo's entrance, Nether to the nearest Nether portal ZooCraft has seen a player use, End to the End's
// arrival platform. Before anyone moves, the place is loaded and a safe spot is found near it (solid under the feet,
// two open blocks, no lava, fire or portal beside): with none, nobody moves and the totem stays whole. It is used up
// only as the journey happens. It wakes only for a player Chasm has taught it to.
import { world, system, GameMode, BlockVolume } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { ownedPark, parksOf } from "../park/park.js";
import { bondOf } from "./bonds.js";
import { CHASM_ID, TOTEMS, totemKey, knowsTotem, standKind, safeSpot, addPortal, dropPortal, portalOrder, OVERWORLD, NETHER, THE_END, END_ARRIVAL, END_PLATFORM } from "./voidRules.js";

const T = () => BALANCE.void.totems;
const COL = "void";
const going = new Set(); // players a totem is carrying now

function portalsKnown() {
  return db.get(COL, "portals")?.list ?? [];
}
function savePortals(list) {
  db.put(COL, { id: "portals", list });
}

function typeAt(d, x, y, z) {
  try {
    return d.getBlock({ x, y, z })?.typeId;
  } catch {
    return undefined; // not loaded, or out of the world
  }
}
const reader = (d) => (x, y, z) => {
  try {
    const b = d.getBlock({ x, y, z });
    return b ? standKind(b.typeId, b.isAir, b.isLiquid) : undefined;
  } catch {
    return undefined;
  }
};
/** The nearest block within `r` of `at` whose id passes, or undefined. */
function nearBlock(d, at, r, pass) {
  let best;
  for (let dx = -r; dx <= r; dx++) for (let dy = -r; dy <= r; dy++) for (let dz = -r; dz <= r; dz++) {
    const id = typeAt(d, at.x + dx, at.y + dy, at.z + dz);
    if (!id || !pass(id)) continue;
    const n = dx * dx + dy * dy + dz * dz;
    if (!best || n < best.n) best = { n, x: at.x + dx, y: at.y + dy, z: at.z + dz };
  }
  return best && { x: best.x, y: best.y, z: best.z };
}

/** Runs `fn` with the blocks round `at` loaded (a ticking area for as long as it takes, unless they're loaded already). */
async function withLoaded(d, at, name, fn) {
  const tam = world.tickingAreaManager;
  const probe = { x: Math.floor(at.x), y: Math.min(Math.max(Math.floor(at.y), d.heightRange.min), d.heightRange.max - 1), z: Math.floor(at.z) };
  const isLoaded = () => typeAt(d, probe.x, probe.y, probe.z) !== undefined;
  let made = false;
  try {
    if (!isLoaded()) {
      const r = T().load;
      try {
        if (tam.hasTickingArea(name)) tam.removeTickingArea(name);
        await tam.createTickingArea(name, { dimension: d, from: { x: probe.x - r, y: 0, z: probe.z - r }, to: { x: probe.x + r, y: 0, z: probe.z + r } });
        made = true;
      } catch {
        // no room for another area: it is safe only if the place happens to be loaded
      }
      for (let k = 0; k < T().loadWait && !isLoaded(); k++) await system.waitTicks(2);
    }
    return await fn();
  } finally {
    if (made) {
      system.runTimeout(() => {
        try {
          if (tam.hasTickingArea(name)) tam.removeTickingArea(name);
        } catch {
          // gone
        }
      }, T().hold); // the traveller's own chunks hold the place by then
    }
  }
}

const isBed = (id) => /(^minecraft:|_)bed$/.test(id) || id === "minecraft:respawn_anchor";

/** Where each totem goes for this player: { d (the dimension), spot { x, y, z }, words } or { why }. */
const ROUTES = {
  async dwelling(player, name) {
    let sp;
    try {
      sp = player.getSpawnPoint();
    } catch {
      sp = undefined;
    }
    if (sp) {
      const at = { x: sp.x, y: sp.y, z: sp.z };
      const d = sp.dimension;
      const spot = await withLoaded(d, at, name, () => (nearBlock(d, at, T().bedNear, isBed) ? safeSpot(reader(d), at, T()) : undefined));
      if (spot) return { d, spot, words: "your bed" };
    }
    // no bed (or it is gone, or blocked): as the game does, the world's spawn
    const w = world.getDefaultSpawnLocation();
    const d = world.getDimension(OVERWORLD);
    const spot = await withLoaded(d, { x: w.x, y: 64, z: w.z }, name, () => {
      let y = w.y;
      if (!(y >= d.heightRange.min && y < d.heightRange.max)) {
        const top = d.getTopmostBlock({ x: w.x, z: w.z });
        if (!top) return undefined;
        y = top.location.y + 1;
      }
      return safeSpot(reader(d), { x: w.x, y, z: w.z }, { ...T(), up: 12, down: 12 });
    });
    return spot ? { d, spot, words: "the world's spawn (you have no bed to go to)" } : { why: "§7The totem finds no safe place at the world's spawn. It stays whole." };
  },
  async zoo(player, name) {
    const park = ownedPark(player) ?? parksOf(player)[0];
    const e = park?.entrance;
    if (!e) return { why: "§7The totem has nowhere to take you: you have no zoo entrance yet. §8Place a Park Entrance Gate first." };
    const d = world.getDimension(e.dimension);
    const spot = await withLoaded(d, e, name, () => safeSpot(reader(d), e, T()));
    return spot ? { d, spot, words: "your zoo's entrance" } : { why: "§7The totem finds no safe place at your zoo's entrance. It stays whole." };
  },
  async nether(player, name) {
    let home = { x: 0, z: 0 };
    try {
      home = player.getSpawnPoint() ?? world.getDefaultSpawnLocation();
    } catch {
      // the world's middle will do
    }
    const here = { d: player.dimension.id, ...player.location };
    let blocked = false;
    for (const p of portalOrder(portalsKnown(), here, home).slice(0, T().portalTries)) {
      const d = world.getDimension(p.d);
      const found = await withLoaded(d, p, name, () => {
        if (typeAt(d, p.x, p.y, p.z) === undefined) return { unread: true };
        const portal = nearBlock(d, p, T().portalNear, (id) => id === "minecraft:portal");
        return portal ? { spot: safeSpot(reader(d), portal, T()) } : { gone: true };
      });
      if (found.gone) savePortals(dropPortal(portalsKnown(), p)); // broken since: forgotten
      else if (found.spot) return { d, spot: found.spot, words: `a Nether portal in ${p.d === NETHER ? "the Nether" : "the Overworld"}` };
      else blocked = true;
    }
    return { why: blocked ? "§7The totem finds no safe place beside the Nether portal. It stays whole." : "§7The totem knows no Nether portal to take you to. §8It remembers every Nether portal a player walks through: go through one first." };
  },
  async end(player, name) {
    const d = world.getDimension(THE_END);
    const spot = await withLoaded(d, END_ARRIVAL, name, () => {
      if (typeAt(d, END_ARRIVAL.x, END_ARRIVAL.y, END_ARRIVAL.z) === undefined) return undefined;
      const safe = safeSpot(reader(d), END_ARRIVAL, { reach: 2, up: 1, down: 1 });
      if (safe) return safe;
      // as the game does for everyone who comes through an End portal: the obsidian platform again, and air over it
      d.fillBlocks(new BlockVolume(END_PLATFORM.from, END_PLATFORM.to), "minecraft:obsidian");
      d.fillBlocks(new BlockVolume(END_PLATFORM.airFrom, END_PLATFORM.airTo), "minecraft:air");
      return { ...END_ARRIVAL };
    });
    return spot ? { d, spot, words: "the End" } : { why: "§7The totem can't reach the End just now. It stays whole." };
  },
};

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

/** Takes one totem of that id from the player (the held one first). False if they carry none any more. */
function takeTotem(player, id) {
  const inv = player.getComponent("minecraft:inventory")?.container;
  if (!inv) return false;
  const order = [player.selectedSlotIndex, ...Array.from({ length: inv.size }, (_, i) => i)];
  for (const i of order) {
    const it = inv.getItem(i);
    if (!it || it.typeId !== id) continue;
    if (it.amount > 1) {
      it.amount -= 1;
      inv.setItem(i, it);
    } else inv.setItem(i, undefined);
    return true;
  }
  return false;
}

function unmount(player) {
  try {
    const on = player.getComponent("minecraft:riding")?.entityRidingOn;
    on?.getComponent("minecraft:rideable")?.ejectRider(player);
  } catch {
    // not riding
  }
  try {
    player.getComponent("minecraft:rideable")?.ejectRiders();
  } catch {
    // nothing riding them
  }
}

async function journey(player, key) {
  const t = TOTEMS[key];
  const route = await ROUTES[key](player, `zoocraft_totem_${player.id}`);
  if (!player.isValid) return "left";
  if (route.why) {
    message(player, route.why);
    return "nowhere";
  }
  const used = T().consume && !creative(player);
  if (used && !takeTotem(player, t.id)) return "no totem"; // put down while it woke
  unmount(player);
  player.teleport({ x: route.spot.x + 0.5, y: route.spot.y, z: route.spot.z + 0.5 }, { dimension: route.d });
  try {
    player.playSound("mob.endermen.portal", { volume: 0.8 });
  } catch {
    // no sound
  }
  message(player, `§5The ${t.name} ${used ? "breaks apart as" : "hums and"} the void sets you down at ${route.words}.`);
  return "went";
}

/** A totem used by a player. Returns what happened (for the test server): a promise of "went", "nowhere", ... */
export function useTotem(player, typeId) {
  const key = totemKey(typeId);
  if (!key || player?.typeId !== "minecraft:player") return Promise.resolve("not a totem");
  if (going.has(player.id)) return Promise.resolve("busy");
  if (!knowsTotem(bondOf(CHASM_ID, player.id), key)) {
    message(player, `§7The totem is cold in your hand: you don't know how to wake it. §8Chasm teaches the ${TOTEMS[key].name} at ${TOTEMS[key].at} friendship.`);
    return Promise.resolve("untaught");
  }
  going.add(player.id);
  const id = player.id;
  return journey(player, key)
    .catch((e) => {
      reportError("totem", e);
      return "failed";
    })
    .finally(() => system.runTimeout(() => going.delete(id), 40)); // past the dimension change it may cause
}

/** The totems' custom component (zoocraft:volatile_totem). */
export function totemComponent() {
  return {
    onUse: (e) => {
      const player = e.source;
      const id = e.itemStack?.typeId;
      if (player?.typeId === "minecraft:player" && id) system.run(() => useTotem(player, id));
    },
  };
}

/** A Nether portal remembered (a block of one, or where a player stood in one). */
export function notePortal(dimensionId, loc) {
  savePortals(addPortal(portalsKnown(), { d: dimensionId, x: loc.x, y: loc.y, z: loc.z }, T().portalApart, T().portalsKept));
}

/** Remembers the Nether portals players go through: where they left from, and the one they came out of. */
export function wireVoid() {
  world.afterEvents.playerDimensionChange.subscribe((e) => {
    const from = e.fromDimension.id;
    const to = e.toDimension.id;
    if (!((from === OVERWORLD && to === NETHER) || (from === NETHER && to === OVERWORLD))) return;
    if (going.has(e.player.id)) return; // a totem's journey, not a portal
    const player = e.player;
    const left = { x: Math.floor(e.fromLocation.x), y: Math.floor(e.fromLocation.y), z: Math.floor(e.fromLocation.z) };
    try {
      // where they left from: a portal if it can still be read, taken on trust if not (checked before anyone is sent there)
      const d = e.fromDimension;
      if (typeAt(d, left.x, left.y, left.z) === undefined) notePortal(from, left);
      else {
        const portal = nearBlock(d, left, 1, (id) => id === "minecraft:portal");
        if (portal) notePortal(from, portal);
      }
    } catch (err) {
      reportError("void portal from", err);
    }
    system.runTimeout(() => {
      try {
        if (!player.isValid || player.dimension.id !== to) return;
        const l = player.location;
        const portal = nearBlock(player.dimension, { x: Math.floor(l.x), y: Math.floor(l.y), z: Math.floor(l.z) }, 2, (id) => id === "minecraft:portal");
        if (portal) notePortal(to, portal);
      } catch (err) {
        reportError("void portal to", err);
      }
    }, 20);
  });
}

/** For the test server. */
export function voidDebug() {
  return { portals: portalsKnown(), going: [...going] };
}
