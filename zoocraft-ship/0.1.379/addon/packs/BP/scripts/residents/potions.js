// 0.1.330: Darian's advanced potions at work (rules in residents/potionRules.js). Drunk like the game's potions (the
// item's own drinking, "zoocraft:brew"); what runs is kept on the player (BREW_KEY) and counted down a second at a
// time while they are in the world; milk and death end them as they end the game's effects.
import { world, system, BlockVolume, BlockTypes, ItemStack } from "@minecraft/server";
import { message, onlinePlayers, later } from "../platform/mc.js";
import { reportError } from "../core/log.js";
import { BALANCE } from "../data/balance.js";
import { becomeDragon, keepDragon, endDragon, setDragonEnd, wornSlots } from "./shapeshift.js";
import { SHAPE_ID, armorLine } from "./shapeshiftRules.js";
import { timeStopped } from "./timeWand.js";
import { BREWS, BREW_KEY, brewsOf, brewsText, drink, passSecond, clock, blastOffset, isPoisonTick, ownBlast, GROWERS, growerOf, growStep, auraPicks, keepPick, tempoBoost } from "./potionRules.js";

const G = () => BALANCE.potions;
const NAMES = Object.fromEntries(Object.values(BREWS).map((b) => [b.id, b.effect ?? b.name]));
// only the ids this game knows (sugar cane is "reeds" in some versions): one unknown id makes the whole block query fail
let plantTypes;
const PLANT_TYPES = () => (plantTypes ??= GROWERS.flatMap((g) => g.ids).filter((id) => Boolean(BlockTypes.get(id))));

/** Who has which running now, by player id (kept in step with each player's BREW_KEY, so the hurt events can read it). */
const running = new Map();
/** The tick each drinker of Explosion last set off a blast (their own blast is cancelled on them). */
const blasts = new Map();
/** The game's bow: when each player began drawing one, and how long their last draw was as they let go. */
const draws = new Map();
const releases = new Map();
/** Each Demeter's Aura drinker's plants near them (re-found every few seconds): { at, list: [{ x, y, z }] }. */
const plants = new Map();
let stats = { blasts: 0, cancelled: 0, grown: 0, boosted: 0 };
/** 0.1.334: the tick each player was last told they can't shapeshift with armor on. */
const armorTold = new Map();

function read(player) {
  try {
    return brewsOf(player.getDynamicProperty(BREW_KEY));
  } catch {
    return {};
  }
}

function write(player, brews) {
  try {
    player.setDynamicProperty(BREW_KEY, brewsText(brews));
  } catch {
    // the player has gone
  }
  running.set(player.id, brews);
}

/** Whether a player has a potion running (Archer's Tempo for ZooCraft's bows: guido/bowShots.js). */
export function brewRunning(player, id) {
  const b = running.get(player?.id);
  return Boolean(b && b[id] > 0);
}

/** The item's drinking: "zoocraft:brew" on each of the three potions. */
export function brewComponent() {
  return {
    onConsume(e) {
      const p = e.source;
      const brew = BREWS[e.itemStack?.typeId];
      if (!brew || p?.typeId !== "minecraft:player") return;
      if (brew.id === SHAPE_ID && armored(p, e.itemStack.typeId)) return; // 0.1.334: given back (the drink is stopped before it starts: wirePotions)
      write(p, drink(read(p), brew.id, brew.seconds));
      if (brew.id === "explosion") {
        try {
          p.addEffect("poison", brew.seconds * 20, { amplifier: 0, showParticles: true });
        } catch {
          // gone
        }
      }
      for (const x of brew.effects ?? []) {
        // 0.1.379: One with the Rabbits is the game's own Jump Boost and Speed
        try {
          p.addEffect(x.effect, brew.seconds * 20, { amplifier: x.amplifier, showParticles: true });
        } catch {
          // gone
        }
      }
      if (brew.id === SHAPE_ID) becomeDragon(p); // 0.1.331
      message(p, `§d${brew.name} §7(${clock(brew.seconds)}): ${G().says[brew.id]}`);
    },
  };
}

/**
 * 0.1.334 (Austin: "it should just say you cannot shapeshift with armor on"): a dragon-shape drink drunk with something
 * worn does nothing but say so, and the bottle is theirs again. Returns whether it was.
 */
function armored(p, typeId) {
  const worn = wornSlots(p);
  if (!worn.length) return false;
  message(p, `§7${armorLine(BALANCE.potions.shape.words, worn)}`);
  try {
    const c = p.getComponent("minecraft:inventory")?.container;
    const left = c ? c.addItem(new ItemStack(typeId, 1)) : new ItemStack(typeId, 1);
    if (left) p.dimension.spawnItem(left, p.location);
  } catch (e) {
    reportError("potions.armored", e);
  }
  return true;
}

function end(player, ids) {
  const b = read(player);
  for (const id of ids) delete b[id];
  write(player, b);
}

function endAll(player, why) {
  const shape = (running.get(player.id) ?? read(player))[SHAPE_ID] > 0;
  write(player, {});
  plants.delete(player.id);
  if (shape) endDragon(player, why); // 0.1.331
}

/** Each second: every player's potions count down (the wand of 0.1.332 will stop them), and Demeter's Aura grows plants. */
export function tickPotions() {
  for (const p of onlinePlayers()) {
    let b = running.get(p.id);
    if (b === undefined) {
      b = read(p); // first look since they joined
      running.set(p.id, b);
    }
    if (!Object.keys(b).length) continue;
    // Explosion goes with its poison: milk or a totem took it away
    if (b.explosion > 0 && !hasPoison(p)) {
      const { explosion, ...rest } = b;
      b = rest;
    }
    const { brews, ended } = passSecond(b, timeStopped(p)); // 0.1.332: Damien's Wand stops their time
    write(p, brews);
    for (const id of ended) {
      if (id === SHAPE_ID) endDragon(p, "time"); // 0.1.331: off the dragon, with its own words
      else message(p, `§7${NAMES[id] ?? id} has worn off.`);
    }
    if (brews[SHAPE_ID] > 0) keepDragon(p);
    if (brews.demeters_aura > 0) {
      try {
        growNear(p);
      } catch (e) {
        reportError("potions.grow", e);
      }
    } else plants.delete(p.id);
  }
}

function hasPoison(p) {
  try {
    return Boolean(p.getEffect("poison"));
  } catch {
    return false;
  }
}

// --- Explosion: a blast round the drinker at each sting of the poison

function blastNear(p) {
  const g = G().explosion;
  const off = blastOffset(Math.random(), Math.random(), g);
  const at = { x: p.location.x + off.dx, y: p.location.y + g.up, z: p.location.z + off.dz };
  blasts.set(p.id, system.currentTick);
  stats.blasts += 1;
  try {
    // no `source`: the game won't take a player as one on every server, and the drinker's own blast is known by its tick
    p.dimension.createExplosion(at, g.power, { breaksBlocks: world.gameRules.tntExplodes !== false, causesFire: false });
  } catch (e) {
    reportError("potions.blast", e);
  }
}

// --- Demeter's Aura: crops and plants near the drinker grow `times` as fast

function growNear(p) {
  const g = G().aura;
  const now = system.currentTick;
  let found = plants.get(p.id);
  const here = { x: Math.floor(p.location.x), y: Math.floor(p.location.y), z: Math.floor(p.location.z) };
  if (!found || now - found.at >= g.refindSeconds * 20 || found.dim !== p.dimension.id || Math.hypot(here.x - found.from.x, here.z - found.from.z) > g.refindMoved) {
    const from = { x: here.x - g.radius, y: here.y - g.height, z: here.z - g.radius };
    const to = { x: here.x + g.radius, y: here.y + g.height, z: here.z + g.radius };
    const list = [];
    try {
      for (const at of p.dimension.getBlocks(new BlockVolume(from, to), { includeTypes: PLANT_TYPES() }, false).getBlockLocationIterator()) {
        list.push({ x: at.x, y: at.y, z: at.z });
        if (list.length >= g.maxPlants) break;
      }
    } catch {
      // part of it isn't loaded: nothing this time
    }
    found = { at: now, dim: p.dimension.id, from: here, list };
    plants.set(p.id, found);
  }
  // the field's extra growth this second: random plants picked (as the game's random ticks pick blocks), each kept at its own kind's speed
  const n = found.list.length;
  if (!n) return;
  const rMax = Math.max(...Object.values(g.base));
  const picks = auraPicks(n, rMax, g.times, Math.random());
  for (let i = 0; i < picks; i++) {
    const block = p.dimension.getBlock(found.list[Math.floor(Math.random() * n)]);
    const grower = block ? growerOf(block.typeId) : undefined;
    if (grower && keepPick(g.base[block.typeId] ?? g.base.default, rMax, Math.random())) growOnce(block, grower);
  }
}

/** One growth step of a plant; false when it has nothing more to grow. */
function growOnce(block, grower) {
  let value;
  try {
    value = block.permutation.getState(grower.state);
  } catch {
    return false;
  }
  const step = growStep(grower, value);
  if (!step) return false;
  if (step.set !== undefined) {
    block.setPermutation(block.permutation.withState(grower.state, step.set));
    stats.grown += 1;
    return true;
  }
  if (step.fruit) return growFruit(block, step.fruit);
  if (step.top) return growTop(block, grower);
  return false;
}

const SIDES = [
  { dx: 0, dz: -1, face: 2 },
  { dx: 0, dz: 1, face: 3 },
  { dx: -1, dz: 0, face: 4 },
  { dx: 1, dz: 0, face: 5 },
];
const FRUIT_SOIL = new Set(["minecraft:dirt", "minecraft:grass_block", "minecraft:farmland", "minecraft:coarse_dirt", "minecraft:podzol", "minecraft:rooted_dirt", "minecraft:mycelium", "minecraft:moss_block", "minecraft:mud", "minecraft:muddy_mangrove_roots"]);

/** A melon or pumpkin stem at the top: its fruit on a free side, on soil, as the game grows it (one at a time). */
function growFruit(stem, fruit) {
  const d = stem.dimension;
  const { x, y, z } = stem.location;
  for (const s of SIDES) if (d.getBlock({ x: x + s.dx, y, z: z + s.dz })?.typeId === fruit) return false;
  const free = SIDES.filter((s) => d.getBlock({ x: x + s.dx, y, z: z + s.dz })?.isAir && FRUIT_SOIL.has(d.getBlock({ x: x + s.dx, y: y - 1, z: z + s.dz })?.typeId ?? ""));
  if (!free.length) return false;
  const s = free[Math.floor(Math.random() * free.length)];
  d.getBlock({ x: x + s.dx, y, z: z + s.dz }).setType(fruit);
  try {
    stem.setPermutation(stem.permutation.withState("facing_direction", s.face));
  } catch {
    // its look follows when the game next looks at it
  }
  stats.grown += 1;
  return false; // one fruit is all a step makes
}

/** Sugar cane or cactus at its top age: a new block on top if it is short enough and there is room. */
function growTop(block, grower) {
  const d = block.dimension;
  const { x, y, z } = block.location;
  let below = 0;
  while (below < grower.height && d.getBlock({ x, y: y - below - 1, z })?.typeId === block.typeId) below += 1;
  if (below + 1 >= grower.height) return false;
  const above = d.getBlock({ x, y: y + 1, z });
  if (!above?.isAir) return false;
  above.setType(block.typeId);
  block.setPermutation(block.permutation.withState(grower.state, 0));
  stats.grown += 1;
  return false;
}

// --- Archer's Tempo on the game's bow (ZooCraft's bows ask brewRunning in guido/bowShots.js)

function boostArrow(arrow) {
  let owner;
  try {
    owner = arrow.getComponent("minecraft:projectile")?.owner;
  } catch {
    return;
  }
  if (owner?.typeId !== "minecraft:player" || !brewRunning(owner, "archers_tempo")) return;
  // how long the draw was: the game sends the arrow out before it reports the bow let go, so the draw may still be open
  const now = system.currentTick;
  const r = releases.get(owner.id);
  const start = draws.get(owner.id);
  const held = r && now - r.tick <= 2 ? r.held : start !== undefined ? now - start : undefined;
  releases.delete(owner.id);
  draws.delete(owner.id);
  if (held === undefined) return;
  const g = G().tempo;
  const boost = tempoBoost(held, g.gameFullTicks, Math.round(g.gameFullTicks * g.drawTimes), g.cap);
  if (boost <= 1) return;
  try {
    const v = arrow.getVelocity();
    arrow.clearVelocity();
    arrow.applyImpulse({ x: v.x * boost, y: v.y * boost, z: v.z * boost });
    stats.boosted += 1;
  } catch {
    // gone this tick
  }
}

/** The events: drinking ends (milk), deaths, the poison's stings, blasts on the drinker, the game's bow. */
export function wirePotions() {
  setDragonEnd((p) => end(p, [SHAPE_ID])); // 0.1.331: a player who sneaks off the dragon turns back: the potion is over
  // 0.1.334 (Austin: "it should just say you cannot shapeshift with armor on"): with anything worn, a Shapeshifting
  // Potion or Dragon Seeker isn't drunk at all (it stays in their hand) and chat says what to take off.
  world.beforeEvents.itemUse.subscribe((e) => {
    const p = e.source;
    if (BREWS[e.itemStack?.typeId]?.id !== SHAPE_ID || p?.typeId !== "minecraft:player") return;
    const worn = wornSlots(p);
    if (!worn.length) return;
    e.cancel = true;
    const now = system.currentTick;
    if (now - (armorTold.get(p.id) ?? -100) < 40) return; // a held button tries again and again: one line
    armorTold.set(p.id, now);
    later(() => message(p, `§7${armorLine(BALANCE.potions.shape.words, worn)}`));
  });
  world.afterEvents.itemCompleteUse.subscribe((e) => {
    if (e.itemStack?.typeId === "minecraft:milk_bucket" && e.source?.typeId === "minecraft:player") endAll(e.source, "milk");
  });
  world.afterEvents.entityDie.subscribe(
    (e) => {
      if (e.deadEntity?.typeId === "minecraft:player") endAll(e.deadEntity, "death");
    },
    { entityTypes: ["minecraft:player"] },
  );
  world.afterEvents.entityHurt.subscribe(
    (e) => {
      const p = e.hurtEntity;
      if (!brewRunning(p, "explosion")) return;
      let dealer;
      try {
        dealer = e.damageSource?.damagingEntity;
      } catch {
        dealer = undefined;
      }
      if (isPoisonTick(e.damageSource?.cause, Boolean(dealer), true)) blastNear(p);
    },
    { entityTypes: ["minecraft:player"] },
  );
  world.beforeEvents.entityHurt.subscribe((e) => {
    const p = e.hurtEntity;
    if (p?.typeId !== "minecraft:player" || !brewRunning(p, "explosion")) return;
    const cause = e.damageSource?.cause;
    let dealerId;
    try {
      dealerId = e.damageSource?.damagingEntity?.id;
    } catch {
      dealerId = undefined;
    }
    // their own blast: by the source the blast names, or (when the game names none) one set off this very tick
    const justNow = system.currentTick - (blasts.get(p.id) ?? -10) <= 1;
    if (ownBlast(cause, dealerId ?? (justNow ? p.id : undefined), p.id, true)) {
      e.cancel = true;
      stats.cancelled += 1;
    }
  });
  world.afterEvents.itemStartUse.subscribe((e) => {
    if (e.itemStack?.typeId === "minecraft:bow" && e.source) draws.set(e.source.id, system.currentTick);
  });
  world.afterEvents.itemReleaseUse.subscribe((e) => {
    const p = e.source;
    if (!p || e.itemStack?.typeId !== "minecraft:bow") return;
    const start = draws.get(p.id);
    draws.delete(p.id);
    if (start !== undefined) releases.set(p.id, { tick: system.currentTick, held: system.currentTick - start });
  });
  world.afterEvents.entitySpawn.subscribe((e) => {
    const a = e.entity;
    try {
      if (a?.typeId === "minecraft:arrow" && a.isValid) boostArrow(a);
    } catch {
      // gone at once
    }
  });
  world.afterEvents.playerLeave.subscribe((e) => {
    running.delete(e.playerId);
    plants.delete(e.playerId);
    draws.delete(e.playerId);
    releases.delete(e.playerId);
    blasts.delete(e.playerId);
    armorTold.delete(e.playerId);
  });
}

/** For the test server. */
export function potionsDebug(player) {
  return { brews: player ? read(player) : undefined, running: player ? running.get(player.id) : undefined, plants: player ? plants.get(player.id)?.list.length : undefined, ...stats };
}

export function resetPotionStats() {
  stats = { blasts: 0, cancelled: 0, grown: 0, boosted: 0 };
}
