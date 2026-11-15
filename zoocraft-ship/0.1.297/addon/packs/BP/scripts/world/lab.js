// The Skeleton Scientist and his laboratories (0.1.297; Austin's NPC #23 spec, sections 5 to 9; the rules:
// world/labRules.js, the numbers: data/balance.js `lab`).
//
// A player in the Nether with enough nether brick round them is in a fortress. The first time that is so the
// fortress's laboratory is built, straight under it near the bottom of the Nether: a bedrock box with no way in
// (Austin, 2026-11-15: "On first visit"; the game has no way to tell add-ons where fortresses are). Now and then,
// rarely, a Skeleton Scientist appears in a fortress a player is in. Killed, he leaves nothing. If he gets to a
// player and stays on them, he takes them: they wake tied to a chair in that fortress's laboratory, with everything
// they carried. Crouching again and again breaks the ropes; then the Scientist and his wither skeleton guards fight
// in the hall, and when they are all down the vault's gate opens on the chest: a Wither Wish Bone, 42 obsidian and a
// flint and steel, once for each player in each laboratory. The way out is a portal the player builds; where it lets
// out in the Overworld is remembered, and going back through it sets them down in the laboratory again, free.
//
// Nobody is ever stuck: the ropes need only crouching, a player who dies or is found outside the laboratory is let go,
// and one who leaves the game tied finds the ropes as they left them.
import { world, system, ItemStack, BlockVolume, InputPermissionCategory, GameMode } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { db } from "../persistence/db.js";
import { message } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import {
  NETHER, OVERWORLD, SCIENTIST, GUARD, SIZE, SPOTS, BARS, LOOT, isLabRecord, capId, isFortBlock, sensePoints, inFortress, labNear, labOps, inLab, labSpot, labOrigin, newLab, nextLabNumber,
  scientistDue, scientistFloor, grabCount, grabbed, newCapture, ropeStep, ropeWords, guardCount, lootDue, withLoot, labByLink, withLink,
} from "./labRules.js";

const G = () => BALANCE.lab;
const COL = "lab";
const BOSS_TAG = "zc_lab_boss";
const labTag = (lab) => `zc_${lab.id.replace(":", "_")}`;
const labs = () => db.all(COL).filter(isLabRecord);
const capOf = (player) => db.get(COL, capId(player.id));
const building = new Map(); // lab id -> the promise of its build
const taking = new Set(); // players being carried off now
const grabs = new Map(); // scientist id -> looks running on a player
const tied = new Set(); // players whose ropes are watched (ids)
let lastSpawn; // the tick a Scientist last appeared

function typeAt(d, p) {
  try {
    return d.getBlock(p)?.typeId;
  } catch {
    return undefined;
  }
}

/** Runs `fn` with the laboratory's blocks loaded: a ticking area for as long as it takes, unless they are loaded already. */
async function withLab(lab, fn) {
  const d = world.getDimension(NETHER);
  const tam = world.tickingAreaManager;
  const name = `zoocraft_${labTag(lab)}`;
  const probe = labSpot(lab, SPOTS.boss);
  const far = { x: lab.x + SIZE.x - 1, y: lab.y, z: lab.z + SIZE.z - 1 };
  const loaded = () => typeAt(d, probe) !== undefined && typeAt(d, { x: lab.x, y: lab.y, z: lab.z }) !== undefined && typeAt(d, far) !== undefined;
  let made = false;
  try {
    if (!loaded()) {
      try {
        if (tam.hasTickingArea(name)) tam.removeTickingArea(name);
        await tam.createTickingArea(name, { dimension: d, from: { x: lab.x - 8, y: 0, z: lab.z - 8 }, to: { x: far.x + 8, y: 0, z: far.z + 8 } });
        made = true;
      } catch {
        // no room for another area: it works only if the place happens to be loaded
      }
      for (let k = 0; k < G().loadWait && !loaded(); k++) await system.waitTicks(2);
    }
    if (!loaded()) return undefined;
    return await fn(d);
  } finally {
    if (made) {
      system.runTimeout(() => {
        try {
          if (tam.hasTickingArea(name)) tam.removeTickingArea(name);
        } catch {
          // gone
        }
      }, G().holdTicks);
    }
  }
}

/** Builds a laboratory's box, a few fills a tick. Resolves true when it stands. */
function build(lab) {
  if (lab.built) return Promise.resolve(true);
  const had = building.get(lab.id);
  if (had) return had;
  const job = (async () => {
    const ok = await withLab(lab, async (d) => {
      const ops = labOps(lab);
      for (let i = 0; i < ops.length; i++) {
        d.fillBlocks(new BlockVolume(ops[i].from, ops[i].to), ops[i].block);
        if (i % G().fillsPerTick === G().fillsPerTick - 1) await system.waitTicks(1);
      }
      for (const s of [...SPOTS.cellDoor, ...SPOTS.vaultGate, ...SPOTS.cageDoor]) d.getBlock(labSpot(lab, s))?.setType(BARS);
      d.getBlock(labSpot(lab, SPOTS.chest))?.setType("minecraft:chest");
      return true;
    });
    if (ok) db.put(COL, { ...(db.get(COL, lab.id) ?? lab), built: true });
    return Boolean(ok);
  })()
    .catch((err) => {
      reportError("lab build", err);
      return false;
    })
    .finally(() => building.delete(lab.id));
  building.set(lab.id, job);
  return job;
}

/** The laboratory of the fortress a player stands in: the one recorded near, or a new one, laid out under them. */
function labFor(player) {
  const at = player.location;
  const near = labNear(labs(), at, G().radius);
  if (near) return near;
  const d = player.dimension;
  const lab = newLab(nextLabNumber(labs()), labOrigin(at, d.heightRange.min, G()), world.getDay());
  db.put(COL, lab);
  return lab;
}

function senseFortress(player) {
  const d = player.dimension;
  let n = 0;
  for (const p of sensePoints(player.location, G().sense)) if (isFortBlock(typeAt(d, p))) n++;
  return inFortress(n, G().sense);
}

function scientistsNear(player, r) {
  try {
    return player.dimension.getEntities({ type: SCIENTIST, location: player.location, maxDistance: r, excludeTags: [BOSS_TAG] });
  } catch {
    return [];
  }
}

/** A Scientist appears on a fortress floor a little way from the player. Returns the entity or undefined. */
function spawnScientist(player, random = Math.random) {
  const d = player.dimension;
  const at = player.location;
  const g = G().scientist;
  for (let k = 0; k < g.tries; k++) {
    const a = random() * Math.PI * 2;
    const r = g.near + random() * (g.far - g.near);
    const x = Math.floor(at.x + Math.cos(a) * r), z = Math.floor(at.z + Math.sin(a) * r);
    for (let dy = 2; dy >= -2; dy--) {
      const y = Math.floor(at.y) + dy;
      if (!scientistFloor(typeAt(d, { x, y: y - 1, z }), typeAt(d, { x, y, z }), typeAt(d, { x, y: y + 1, z }))) continue;
      try {
        const e = d.spawnEntity(SCIENTIST, { x: x + 0.5, y, z: z + 0.5 });
        e.setDynamicProperty("zoocraft:born", system.currentTick);
        return e;
      } catch (err) {
        reportError("lab scientist", err);
        return undefined;
      }
    }
  }
  return undefined;
}

function lock(player, on) {
  try {
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, !on);
    player.inputPermissions.setPermissionCategory(InputPermissionCategory.Jump, !on);
  } catch (err) {
    reportError("lab lock", err);
  }
}

function setBars(d, lab, spots, shut) {
  for (const s of spots) {
    try {
      d.getBlock(labSpot(lab, s))?.setType(shut ? BARS : "minecraft:air");
    } catch {
      // unloaded: nothing to do
    }
  }
}

function fillChest(d, lab, player) {
  const now = db.get(COL, lab.id) ?? lab;
  if (!lootDue(now, player.id)) return;
  const b = d.getBlock(labSpot(lab, SPOTS.chest));
  if (!b) return;
  if (b.typeId !== "minecraft:chest") b.setType("minecraft:chest");
  const c = b.getComponent("minecraft:inventory")?.container;
  if (!c) return;
  for (const [typeId, n] of LOOT) {
    let left = n;
    while (left > 0) {
      const stack = new ItemStack(typeId, 1);
      const k = Math.min(left, stack.maxAmount);
      stack.amount = k;
      left -= k;
      const over = c.addItem(stack);
      if (over) d.spawnItem(over, { x: b.location.x + 0.5, y: b.location.y + 1, z: b.location.z + 0.5 }); // the chest is full: beside it, never lost
    }
  }
  db.put(COL, withLoot(now, player.id, world.getDay()));
}

/** The Scientist takes a player: the laboratory built and loaded first, then they wake tied in its cell. */
async function capture(player, scientist) {
  if (taking.has(player.id) || capOf(player)) return "busy";
  taking.add(player.id);
  try {
    const lab = labFor(player);
    message(player, "§5The Skeleton Scientist's needle goes in. Everything goes dark...");
    if (!(await build(lab))) {
      message(player, "§7The Scientist loses his grip on you and vanishes into the fortress.");
      return "nobuild";
    }
    const done = await withLab(lab, async (d) => {
      if (!player.isValid) return false;
      setBars(d, lab, SPOTS.cellDoor, true);
      setBars(d, lab, SPOTS.vaultGate, true);
      fillChest(d, lab, player);
      const seat = labSpot(lab, SPOTS.seat);
      try {
        player.getComponent("minecraft:riding")?.entityRidingOn?.getComponent("minecraft:rideable")?.ejectRider(player);
      } catch {
        // on foot
      }
      player.teleport({ x: seat.x + 0.5, y: seat.y, z: seat.z + 0.5 }, { dimension: d, facingLocation: { x: seat.x + 6.5, y: seat.y + 1, z: seat.z + 0.5 } });
      db.put(COL, newCapture(player.id, lab.id, world.getDay()));
      tied.add(player.id);
      lock(player, true);
      return true;
    });
    if (!done) return "unloaded";
    try {
      if (scientist?.isValid) scientist.remove();
    } catch {
      // gone already
    }
    message(player, "§eYou wake in a hidden laboratory, tied to a chair with ropes. §fCrouch again and again to break them.");
    return "taken";
  } catch (err) {
    reportError("lab capture", err);
    return "error";
  } finally {
    taking.delete(player.id);
  }
}

function release(player, why) {
  db.remove(COL, capId(player.id));
  tied.delete(player.id);
  lock(player, false);
  if (why) message(player, why);
}

/** The ropes break: the cell opens, and the Scientist and his guards are in the hall. */
function startFight(player, cap) {
  const lab = db.get(COL, cap.lab);
  const d = player.dimension;
  tied.delete(player.id);
  lock(player, false);
  if (!lab) return release(player);
  setBars(d, lab, SPOTS.cellDoor, false);
  const tag = labTag(lab);
  let there = [];
  try {
    there = d.getEntities({ tags: [tag] });
  } catch {
    // none
  }
  if (!there.length) {
    try {
      const b = labSpot(lab, SPOTS.boss);
      const boss = d.spawnEntity(SCIENTIST, { x: b.x + 0.5, y: b.y, z: b.z + 0.5 });
      boss.addTag(tag);
      boss.addTag(BOSS_TAG);
      boss.triggerEvent("zoocraft:become_boss");
      const fighters = world.getPlayers().filter((p) => p.dimension.id === NETHER && inLab(lab, p.location)).length;
      for (const s of SPOTS.guards.slice(0, guardCount(fighters, G()))) {
        const p = labSpot(lab, s);
        d.spawnEntity(GUARD, { x: p.x + 0.5, y: p.y, z: p.z + 0.5 }).addTag(tag);
      }
    } catch (err) {
      reportError("lab fight", err);
    }
  }
  message(player, "§cThe Skeleton Scientist and his guards are waiting in the hall. §fThe vault opens when they are all down.");
}

function fightStep(player, cap) {
  const lab = db.get(COL, cap.lab);
  if (!lab) return release(player);
  let left = 0;
  try {
    left = player.dimension.getEntities({ tags: [labTag(lab)] }).length;
  } catch {
    return;
  }
  if (left > 0) return;
  setBars(player.dimension, lab, SPOTS.vaultGate, false);
  release(player, "§aThe laboratory is quiet. The vault's gate is open. §fBuild a portal on the marked floor to get out.");
}

/** The ropes of everyone tied, looked at every other tick (a crouch is short). */
export function tickRopes() {
  if (!tied.size) return;
  for (const player of world.getPlayers()) {
    if (!tied.has(player.id)) continue;
    const cap = capOf(player);
    if (!cap || cap.phase !== "tied") {
      tied.delete(player.id);
      continue;
    }
    const next = ropeStep(cap, player.isSneaking, G());
    if (next.presses !== cap.presses) {
      const words = ropeWords(next.presses, G());
      if (words) message(player, words);
      try {
        player.playSound("dig.cloth", { volume: 0.8, pitch: 0.8 + next.presses * 0.03 });
      } catch {
        // no sound
      }
    }
    if (next.presses !== cap.presses || next.sneaking !== cap.sneaking) db.put(COL, next);
    if (next.phase === "fight") startFight(player, next);
  }
}

let beat = 0;
/** Once a second: fortresses sensed and their laboratories built, Scientists appearing, grabbing and fading, fights watched. */
export function tickLab() {
  beat++;
  const g = G();
  for (const player of world.getPlayers()) {
    try {
      const cap = capOf(player);
      if (cap) {
        const lab = db.get(COL, cap.lab);
        if (player.dimension.id !== NETHER || !inLab(lab, player.location)) release(player); // out of it, however: let go
        else if (cap.phase === "tied") {
          if (!tied.has(player.id)) {
            tied.add(player.id); // back in the game: the ropes as they were
            lock(player, true);
          }
        } else fightStep(player, cap);
        continue;
      }
      if (player.dimension.id !== NETHER || taking.has(player.id)) continue;
      // the Scientists by this player: one that stays on them takes them
      for (const s of scientistsNear(player, 24)) {
        const born = s.getDynamicProperty("zoocraft:born");
        if (typeof born === "number" && system.currentTick - born > g.scientist.life) {
          grabs.delete(s.id);
          s.remove();
          continue;
        }
        const mode = player.getGameMode();
        if (mode === GameMode.Creative || mode === GameMode.Spectator) continue;
        const dist = Math.hypot(s.location.x - player.location.x, s.location.y - player.location.y, s.location.z - player.location.z);
        const n = grabCount(grabs.get(s.id), dist, g.scientist);
        grabs.set(s.id, n);
        if (grabbed(n, g.scientist)) {
          grabs.delete(s.id);
          capture(player, s);
          break;
        }
      }
      if (beat % g.sense.every !== 0) continue;
      if (!senseFortress(player)) continue;
      const lab = labFor(player);
      if (!lab.built) build(lab);
      if (scientistDue({ alive: scientistsNear(player, 64).length, lastSpawn, now: system.currentTick }, g.scientist)) {
        if (spawnScientist(player)) lastSpawn = system.currentTick;
      }
    } catch (err) {
      reportError("lab tick", err);
    }
  }
}

/** Dying lets a captive go; the way back through a laboratory's own portal is remembered and kept. */
export function wireLab() {
  world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    try {
      if (initialSpawn) {
        if (!capOf(player)) lock(player, false); // never left locked by a game that closed mid-capture
        return;
      }
      if (capOf(player)) release(player);
      else lock(player, false);
    } catch (err) {
      reportError("lab spawn", err);
    }
  });
  world.afterEvents.playerDimensionChange.subscribe((e) => {
    try {
      const from = e.fromDimension.id, to = e.toDimension.id;
      const player = e.player;
      const g = G().portal;
      if (from === NETHER && to === OVERWORLD) {
        const lab = labs().find((l) => inLab(l, e.fromLocation));
        if (!lab) return;
        system.runTimeout(() => {
          try {
            if (!player.isValid || player.dimension.id !== OVERWORLD) return;
            const l = player.location;
            db.put(COL, withLink(db.get(COL, lab.id) ?? lab, { x: Math.floor(l.x), y: Math.floor(l.y), z: Math.floor(l.z) }, g.apart, g.keep));
          } catch (err) {
            reportError("lab link", err);
          }
        }, g.settle);
      } else if (from === OVERWORLD && to === NETHER) {
        const lab = labByLink(labs(), e.fromLocation, g.reach);
        if (!lab) return;
        system.runTimeout(() => backToLab(player, lab), g.settle);
      }
    } catch (err) {
      reportError("lab portal", err);
    }
  });
}

/** Someone came through the Overworld end of a laboratory's portal: if the game set them down elsewhere, they go to the laboratory. */
async function backToLab(player, lab) {
  try {
    if (!player.isValid || player.dimension.id !== NETHER || inLab(lab, player.location)) return;
    await withLab(lab, async (d) => {
      if (!player.isValid) return;
      let spot = labSpot(lab, SPOTS.arrive);
      const a = SPOTS.portal;
      look: for (let x = a.from.x; x <= a.to.x; x++) for (let z = a.from.z; z <= a.to.z; z++) for (let y = 2; y <= 5; y++) {
        const p = { x: lab.x + x, y: lab.y + y, z: lab.z + z };
        if (typeAt(d, p) === "minecraft:portal") {
          spot = { x: p.x, y: lab.y + 2, z: lab.z + a.from.z - 1 };
          break look;
        }
      }
      player.teleport({ x: spot.x + 0.5, y: spot.y, z: spot.z + 0.5 }, { dimension: d });
    });
  } catch (err) {
    reportError("lab return", err);
  }
}

/** For the test server. */
export function labDebug(player, what) {
  if (what === "sense") return { fortress: senseFortress(player), labs: labs().length };
  if (what === "lab") {
    const lab = labFor(player);
    return build(lab).then((ok) => ({ ok, lab: db.get(COL, lab.id) }));
  }
  if (what === "spawn") return { spawned: Boolean(spawnScientist(player)) };
  if (what === "capture") return capture(player, undefined);
  if (what === "state") return { cap: capOf(player) ?? null, labs: labs(), tied: [...tied] };
  return undefined;
}
