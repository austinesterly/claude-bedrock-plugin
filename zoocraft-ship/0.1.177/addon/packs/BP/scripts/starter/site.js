import { world, system, BlockPermutation, BlockVolume, ItemStack } from "@minecraft/server";
import { db } from "../persistence/db.js";
import { log, info } from "../core/log.js";
import { message, dim, onlinePlayers } from "../platform/mc.js";
import { planSite, readBox, isGround, insideSite, SITE } from "./sitePlan.js";
import { loadArea, dropArea, waitTicks, placeHandler } from "../bench/benchmark.js";
import { claimParkAs, claimProblemFor, allParks, parkName, parkById, ownedPark, withPark } from "../park/park.js";
import { BALANCE } from "../data/balance.js";
import { fenceTouched } from "../park/fence.js";
import { tutorialStatus } from "../quests/tutorial.js";

// The abandoned park (0.1.176, module 13; the plan is starter/sitePlan.js, the design research/polish_plan.md):
// reading the ground round a spot, building the old park on it, and its records. Two ways in:
// - a player's Park Deed, "Start from an old park": built round the player, who then owns it (once a player a world);
// - the console (/zoocraft:oldpark or `scriptevent zoocraft:oldpark`): built with no owner, round the world spawn (or
//   given x z), the way the starter world gets one; its Noticeboard then offers "Claim this old park".
// Records: the "oldparks" collection, one { id, dimension, center, spot, board, gate, plaza, rabbits, levels, builtAt, parkId? }
// an old park (only this module writes it); a player's "players" record gets oldPark: true once they've started one.

const COL = "oldparks";
const AREA = "zoocraft_oldpark";
const PER_SLICE = 1200; // blocks placed between two yields
const READ_PER_SLICE = 40; // columns read between two yields
let building = false;

/** Every old park in the world. */
export function allSites() {
  return db.all(COL);
}

/** The old park whose ring holds (x, z) in `dimensionId`, if any. */
export function siteAt(dimensionId, pos) {
  return allSites().find((s) => s.dimension === dimensionId && insideSite(s, Math.floor(pos.x), Math.floor(pos.z)));
}

/** 0.1.177: how near the world spawn spot a player first joining must be to be set down at it (the game places a new
 * player on a safe block within the spawnradius game rule of it, facing whichever way it chooses, not the gate). */
export const SPAWN_REACH = 12;

/**
 * The unclaimed old park whose spawn spot a player at `pos` (in `dimensionId`) has just spawned by: the starter world's,
 * whose spawn spot is the world spawn (built from the console in spawn mode). Pure apart from the records.
 */
export function spawnSiteNear(dimensionId, pos) {
  const site = unclaimedSite();
  if (!site?.spawnAt || site.dimension !== dimensionId) return undefined;
  const near = Math.abs(pos.x - (site.spawnAt.x + 0.5)) <= SPAWN_REACH && Math.abs(pos.z - (site.spawnAt.z + 0.5)) <= SPAWN_REACH;
  return near ? site : undefined;
}

/**
 * A player's first join in a world with an unclaimed old park at its spawn: a few ticks on (a teleport in the spawn
 * event itself can be lost), set down on the spawn spot outside the gate, facing the gate. Whether it will.
 */
export function faceOldParkGate(player) {
  if (ownedPark(player)) return false;
  const site = spawnSiteNear(player.dimension.id, player.location);
  if (!site) return false;
  system.runTimeout(() => {
    try {
      if (!player.isValid) return;
      const at = site.spawnAt;
      player.teleport({ x: at.x + 0.5, y: at.y, z: at.z + 0.5 }, { dimension: dim(site.dimension), facingLocation: { x: site.gate.x + 0.5, y: at.y + 1.6, z: site.gate.z + 0.5 } });
    } catch (error) {
      log(`oldpark: setting ${player.name} down by the gate: ${error}`);
    }
  }, 5);
  return true;
}

/** The old park a park was started from (park.oldPark), if any. */
export function siteOfPark(park) {
  return park?.oldPark ? db.get(COL, park.oldPark) : undefined;
}

/** An old park nobody has claimed yet (the starter world's), for the welcome line. */
export function unclaimedSite() {
  return allSites().find((s) => !s.parkId || !parkById(s.parkId));
}

/** Whether a player may still start a park from an old park (once a player a world). */
export function mayStartOldPark(player) {
  return !db.get("players", player.id)?.oldPark;
}

// --- reading the ground ---

// One column: the top ground block (through plants, trees and snow layers) and any water or lava over it.
function readColumn(d, x, z) {
  let top;
  try {
    top = d.getTopmostBlock({ x, z });
  } catch {
    return undefined;
  }
  if (!top) return undefined;
  let b = top;
  for (let i = 0; i < 48 && b && (b.isLiquid || !isGround(b.typeId)); i++) b = b.below();
  if (!b) return undefined;
  // getTopmostBlock reads under water (0.1.167): look above the ground for it.
  let liquid;
  let surface;
  let up = b.above();
  for (let i = 0; i < 40 && up?.isLiquid; i++) {
    liquid = up.typeId.includes("lava") ? "lava" : "water";
    surface = up.y;
    up = up.above();
  }
  return { y: b.y, top: b.typeId, ...(liquid ? { liquid, surface } : {}) };
}

function* readGround(d, cx, cz) {
  const box = readBox();
  const cols = new Map();
  let n = 0;
  for (let x = box.x0; x <= box.x1; x++) {
    for (let z = box.z0; z <= box.z1; z++) {
      const g = readColumn(d, cx + x, cz + z);
      if (g) cols.set(`${x},${z}`, g);
      if (++n % READ_PER_SLICE === 0) yield;
    }
  }
  return (x, z) => cols.get(`${x},${z}`);
}

// --- building ---

const perms = new Map();
function perm(block, states) {
  const k = states ? `${block}${JSON.stringify(states)}` : block;
  let p = perms.get(k);
  if (!p) perms.set(k, (p = BlockPermutation.resolve(block, states)));
  return p;
}

/** Every block the plan puts down, resolved before anything changes. Returns which one the game refused, if any. */
function unresolvedOp(plan) {
  for (const op of plan.ops) {
    try {
      perm(op.block, op.states);
    } catch (error) {
      return `the game won't take ${op.block}${op.states ? ` ${JSON.stringify(op.states)}` : ""} (${error})`;
    }
  }
  return undefined;
}

/** Why an old park can't go round (x, z) in `d`, before anything is read (another park or old park too close). */
function placeProblem(d, x, z) {
  if (d.id !== "minecraft:overworld") return "An old park can only be started in the Overworld.";
  const reach = SITE.half * 2 + 4;
  const near = allParks().find((p) => p.dimension === d.id && Math.abs(p.center.x - x) <= reach && Math.abs(p.center.z - z) <= reach);
  if (near) return `This is too close to ${parkName(near)}. Start an old park at least ${reach} blocks from another park's Park Deed spot.`;
  const old = allSites().find((s) => s.dimension === d.id && Math.abs(s.center.x - x) <= reach && Math.abs(s.center.z - z) <= reach);
  if (old) return `There's an old park here already (round ${old.center.x} ${old.center.z}).`;
  return undefined;
}

/**
 * Start building an old park round (x, z) in `d`. `owner`: the player who'll own it (the Park Deed), or undefined
 * (the console). `opts.spawn`: move the world spawn to just outside its gate (the starter world). `say`: where the
 * progress goes. Returns why it can't start, or undefined once started.
 */
export function startOldPark(d, x, z, owner, say, opts = {}) {
  if (building) return "An old park is being built already.";
  const problem = placeProblem(d, x, z) ?? (owner ? claimProblemFor(owner.id, d.id, { x, y: 0, z }) : undefined);
  if (problem) return problem;
  if (owner && !mayStartOldPark(owner)) return "You've started a park from an old park in this world already.";
  building = true;
  system.runJob(build(d, Math.floor(x), Math.floor(z), owner, say, opts));
  return undefined;
}

function* build(d, cx, cz, owner, say, opts) {
  const fail = (why) => {
    say(`§cThe old park can't go here: ${why}`);
    log(`oldpark: ${why}`);
  };
  try {
    say("§6Old park: §fclearing the overgrowth round you. Stay where you are.");
    const box = readBox();
    const bbox = { min: { x: cx + box.x0, z: cz + box.z0 }, max: { x: cx + box.x1, z: cz + box.z1 } };
    const area = yield* loadArea(d, bbox, 64, AREA);
    if (!area.loaded) return fail(`its ground didn't load in 30 seconds (${area.said}).`);
    const ground = yield* readGround(d, cx, cz);
    const plan = planSite({ x: cx, z: cz }, ground);
    if (!plan.ok) return fail(plan.reason);
    const bad = unresolvedOp(plan);
    if (bad) return fail(`${bad}. Nothing was changed.`);
    // The blocks, in the plan's order: the ground, the buildings, the fence and the gate.
    let n = 0;
    const placed = [];
    const filled = [];
    for (const op of plan.ops) {
      if (op.op === "fill") {
        d.fillBlocks(new BlockVolume(op.from, op.to), perm(op.block, op.states));
        n += (op.to.y - op.from.y + 1) * (op.to.x - op.from.x + 1) * (op.to.z - op.from.z + 1);
      } else {
        const b = d.getBlock(op.pos);
        if (!b) continue;
        b.setPermutation(perm(op.block, op.states));
        if (op.op === "place") placed.push(op);
        if (op.items || op.text) filled.push(op);
        n++;
      }
      if (n >= PER_SLICE) {
        n = 0;
        yield;
      }
    }
    yield* waitTicks(3);
    // Each fence and the gate registered as if placed by hand (the fence list, the gate's arch).
    for (const op of placed) {
      const comp = placeHandler(op.block);
      const b = d.getBlock(op.pos);
      if (comp?.onPlace && b) comp.onPlace({ block: b, dimension: d, previousBlock: perm("minecraft:air") }, { params: {} });
      if (++n % 40 === 0) yield;
    }
    // The stores' supplies and the signs.
    for (const op of filled) {
      const b = d.getBlock(op.pos);
      if (!b) continue;
      try {
        if (op.items) {
          const c = b.getComponent("minecraft:inventory")?.container;
          for (const { item, amount } of op.items) c?.addItem(new ItemStack(item, amount));
        }
        if (op.text) {
          const sign = b.getComponent("minecraft:sign");
          sign?.setText(op.text);
          sign?.setWaxed(true);
        }
      } catch (error) {
        log(`oldpark: filling ${op.block} at ${op.pos.x} ${op.pos.y} ${op.pos.z}: ${error}`);
      }
    }
    // Wild rabbits just outside the old fence (the tutorial: "Observe a nearby starter species").
    for (const pos of plan.rabbits) {
      try {
        d.spawnEntity("minecraft:rabbit", { x: pos.x + 0.5, y: pos.y, z: pos.z + 0.5 });
      } catch (error) {
        log(`oldpark: a rabbit at ${pos.x} ${pos.z}: ${error}`);
      }
    }
    const site = {
      id: `${d.id}:${cx},${cz}`,
      dimension: d.id,
      center: { x: cx, z: cz },
      spot: plan.spot,
      board: plan.board,
      gate: plan.gate,
      plaza: plan.plaza,
      spawnAt: plan.spawn,
      rabbits: plan.rabbits,
      levels: plan.levels,
      gaps: plan.gaps,
      builtAt: Date.now(),
    };
    db.put(COL, site);
    db.flush(COL);
    yield* dropArea(d, AREA);
    if (opts.spawn) {
      try {
        world.setDefaultSpawnLocation(plan.spawn);
      } catch (error) {
        log(`oldpark: setting the world spawn: ${error}`);
      }
    }
    info(`oldpark: built round ${cx} ${cz} (yard y ${plan.levels.yard}, pen y ${plan.levels.pen}, ${plan.ops.length} steps)`);
    if (owner?.isValid) {
      const res = claimSite(owner, site);
      if (!res.ok) say(`§e${res.reason}`);
      try {
        owner.teleport({ x: plan.plaza.x + 0.5, y: plan.plaza.y, z: plan.plaza.z + 0.5 }, { dimension: d, facingLocation: { x: cx + 0.5, y: plan.plaza.y + 1, z: cz + 0.5 } });
      } catch {
        // they moved off; the park is built anyway
      }
    } else {
      say(`§6Old park: §fbuilt round ${cx} ${cz}. Its Noticeboard by the gate offers it to the first player who wants it.`);
    }
  } catch (error) {
    fail(`the build stopped: ${error}`);
  } finally {
    building = false;
  }
}

/**
 * Claim an old park for a player: the park's spot is the middle of the old fence, and the park remembers it came from
 * the old park (the tutorial's texts then talk about mending it). Returns { ok, reason?, park? }.
 */
export function claimSite(player, site) {
  if (site.parkId && parkById(site.parkId)) return { ok: false, reason: `${parkName(parkById(site.parkId))} has claimed this old park already.` };
  const res = claimParkAs({ id: player.id, name: player.name }, site.dimension, site.spot);
  if (!res.ok) return res;
  const park = res.park;
  park.oldPark = site.id;
  db.put("park", park);
  db.put(COL, { ...site, parkId: park.id });
  db.put("players", { ...db.get("players", player.id), id: player.id, oldPark: true });
  db.flush();
  fenceTouched(site.dimension, player.id); // the old fence's state (where its gaps are) is worked out for the new park
  message(player, `§aYou claimed ${parkName(park)}, an old wildlife park! §e${BALANCE.economy.startingFunds} Zoo Coins §ato start.`);
  message(player, `§fIts Aluminum Fence is broken in ${site.gaps} places, and the Rabbit Meadow pen was never finished. §7The Noticeboard by the cabin says what to do first; the stores behind the cabin and the barrel in the old workshop hold supplies to get started.`);
  return { ok: true, park };
}

// --- the wild rabbits ---
// The game's rabbits despawn far from every player (the vanilla rabbit's minecraft:despawn, despawn_from_distance) and
// only spawn on their own in deserts, taigas, snowy ground, flower forests, groves, meadows and cherry groves, so the
// ones spawned with the old park may be gone (the starter world is built with nobody there) or never come back. While
// a claimed old park's tutorial still needs its animal ("Bring in an animal"), a member nearby finds wild rabbits again
// by the old fence: back up to RABBITS when fewer than two are about.
const RABBITS = 3;
const RABBIT_NEAR = 48; // a member this close (the chunks are loaded)
const RABBIT_COUNT = 40; // rabbits this close to the rabbits' spot count

function rabbitsWanted(site) {
  const park = parkOfSite(site);
  if (!park || !site.rabbits?.length) return 0;
  const done = withPark(park, () => tutorialStatus().completed.animal !== undefined);
  if (done) return 0;
  const d = dim(site.dimension);
  const at = site.rabbits[0];
  const near = onlinePlayers().some((p) => park.members[p.id] && p.dimension.id === site.dimension && Math.hypot(p.location.x - at.x, p.location.z - at.z) <= RABBIT_NEAR);
  if (!near) return 0;
  const have = d.getEntities({ type: "minecraft:rabbit", location: { x: at.x + 0.5, y: at.y, z: at.z + 0.5 }, maxDistance: RABBIT_COUNT }).length;
  return have < 2 ? RABBITS - have : 0;
}

/** Every 10 seconds (main.js): each claimed old park's wild rabbits, while its tutorial needs one. */
export function tickOldParks() {
  for (const site of allSites()) {
    try {
      let n = rabbitsWanted(site);
      const d = dim(site.dimension);
      for (const pos of site.rabbits ?? []) {
        if (n <= 0) break;
        // 0.1.177: a spot whose chunk isn't loaded waits for the next look (getTopmostBlock throws there).
        if (!d.isChunkLoaded({ x: pos.x, y: pos.y, z: pos.z })) continue;
        const top = d.getTopmostBlock({ x: pos.x, z: pos.z });
        if (!top || top.isLiquid || top.above()?.isLiquid) continue;
        d.spawnEntity("minecraft:rabbit", { x: pos.x + 0.5, y: top.y + 1, z: pos.z + 0.5 });
        n--;
      }
    } catch (error) {
      log(`oldpark: rabbits by ${site.id}: ${error}`);
    }
  }
}

/** For the console's "who's building" line and the tests: whether a build is running. */
export function oldParkBuilding() {
  return building;
}

/** The console way in: `scriptevent zoocraft:oldpark [spawn | <x> <z>]` (the starter world's build). */
export function initOldParks() {
  system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id !== "zoocraft:oldpark") return;
    const words = e.message.trim().split(/\s+/).filter(Boolean);
    const source = e.sourceEntity;
    const say = (text) => (source?.typeId === "minecraft:player" ? message(source, text) : info(text.replace(/§./g, "")));
    runConsoleBuild(words, source, say);
  });
}

/** /zoocraft:oldpark and the script event: build round x z, the world spawn ("spawn"), or the player running it. */
export function runConsoleBuild(words, source, say) {
  const d = source?.dimension ?? dim("minecraft:overworld");
  let x;
  let z;
  const spawn = words[0] === "spawn";
  if (spawn) {
    const s = world.getDefaultSpawnLocation();
    x = s.x;
    z = s.z;
  } else if (words.length >= 2 && Number.isFinite(Number(words[0])) && Number.isFinite(Number(words[1]))) {
    x = Number(words[0]);
    z = Number(words[1]);
  } else if (source) {
    x = source.location.x;
    z = source.location.z;
  } else {
    return say("Give x and z, or spawn.");
  }
  const why = startOldPark(d, x, z, undefined, say, { spawn });
  if (why) say(`§c${why}`);
}

/** The welcome line for a player who joins a world with an unclaimed old park and no park of their own. */
export function oldParkWelcome(player) {
  if (ownedPark(player)) return undefined;
  const site = unclaimedSite();
  if (!site) return undefined;
  return `§6An old wildlife park lies at ${site.gate.x} ${site.gate.z}. §fUse the Noticeboard by its gate to claim it and bring it back to life.`;
}

/** The park an old park's Noticeboard works for: the park that claimed it. */
export function parkOfSite(site) {
  return site?.parkId ? parkById(site.parkId) : undefined;
}
