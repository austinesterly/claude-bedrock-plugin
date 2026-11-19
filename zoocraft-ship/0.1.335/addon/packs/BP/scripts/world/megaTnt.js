// Mega TNT (0.1.335; Austin's NPC #28 spec: Tim's gift at 100 friendship): the block, lit like TNT (flint and steel,
// a fire charge, redstone, fire beside it, a burning arrow, another blast), and the lit one: a flashing block that
// burns its fuse (Austin: 20 s) and then blows a crater 10 times TNT's radius. The rules and numbers are
// world/megaTntRules.js and data/balance.js megaTnt.
import { world, system, BlockTypes, BlockVolume, GameMode, ItemStack } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { BLAST_PROOF } from "../data/blastProof.js";
import { reportError } from "../core/log.js";
import { timedJob } from "../core/perf.js";
import { jobQueue } from "../core/jobs.js";
import { MEGA_TNT, MEGA_PRIMED, FUSE_LEFT, LATE, KEEP_VANILLA, HOLDERS, lighterOf, isFire, fuseTicks, craterColumns, columnSpan, inBall, ballBox, isLate, smokePoints } from "./megaTntRules.js";

const G = () => BALANCE.megaTnt;
const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end", "zoocraft:fishing", "zoocraft:void"];
const jobs = jobQueue((gen) => system.runJob(timedJob("megatnt", gen)), (error) => reportError("megaTnt.crater", error));
/** @type {Map<string, any>} the lit ones we know of (found again every so often, so a reload loses none) */
const lit = new Map();
const stats = { lit: 0, blasts: 0, columns: 0, spilled: 0, chained: 0, lastMs: 0, lastColumns: 0 };
let keepIds;
let holderIds;

// Only ids the game knows: one unknown id makes a whole block filter fail (0.1.330's lesson).
const known = (ids) => ids.filter((id) => {
  try {
    return Boolean(BlockTypes.get(id));
  } catch {
    return false;
  }
});
function keep() {
  keepIds ??= known([...KEEP_VANILLA, ...BLAST_PROOF, MEGA_TNT, "minecraft:tnt"]);
  return keepIds;
}
function holders() {
  holderIds ??= known(HOLDERS);
  return holderIds;
}

function sound(d, id, at, volume = 1) {
  try {
    d.playSound(id, at, { volume });
  } catch {
    // a sound is never worth an error
  }
}

/** Lights a Mega TNT block: the block goes, a lit one burns where it stood. `cause` "hand", "redstone", "fire", "blast". */
export function ignite(block, cause) {
  if (block?.typeId !== MEGA_TNT) return undefined;
  const d = block.dimension;
  const at = { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 };
  block.setType("minecraft:air");
  return prime(d, at, fuseTicks(cause, G()));
}

function prime(d, at, ticks) {
  const e = d.spawnEntity(MEGA_PRIMED, at);
  e.setDynamicProperty(FUSE_LEFT, ticks);
  lit.set(e.id, e);
  stats.lit += 1;
  sound(d, "random.fuse", at);
  return e;
}

/** The block's own component: lit by flint and steel or a fire charge in hand, by redstone, by fire beside it. */
export function megaTntComponent() {
  return {
    onPlayerInteract(e) {
      const p = e.player;
      if (!p) return;
      const eq = p.getComponent("minecraft:equippable");
      const held = eq?.getEquipment("Mainhand");
      const how = lighterOf(held?.typeId);
      if (!how) return;
      ignite(e.block, "hand");
      if (p.getGameMode() === GameMode.Creative) return;
      // as lighting TNT: the flint and steel wears a little, a fire charge is used up
      if (how === "charge") {
        if (held.amount > 1) {
          held.amount -= 1;
          eq.setEquipment("Mainhand", held);
        } else eq.setEquipment("Mainhand", undefined);
        return;
      }
      const dur = held.getComponent("minecraft:durability");
      if (!dur) return;
      if (dur.damage + 1 >= dur.maxDurability) {
        eq.setEquipment("Mainhand", undefined);
        sound(p.dimension, "random.break", p.location);
      } else {
        dur.damage += 1;
        eq.setEquipment("Mainhand", held);
      }
    },
    onRedstoneUpdate(e) {
      if (e.powerLevel > 0 && !(e.previousPowerLevel > 0)) ignite(e.block, "redstone");
    },
    onTick(e) {
      const b = e.block;
      for (const n of [b.above(), b.below(), b.north(), b.south(), b.east(), b.west()]) {
        if (n && isFire(n.typeId)) {
          ignite(b, "fire");
          return;
        }
      }
      // now and then a green glint rises off it
      if (Math.random() < G().glintChance) {
        try {
          b.dimension.spawnParticle("zoocraft:mega_glow", { x: b.location.x + 0.5, y: b.location.y + 1.05, z: b.location.z + 0.5 });
        } catch {
          // no particle: no matter
        }
      }
    },
  };
}

/** A burning arrow landing on one lights it (as TNT). */
export function megaTntArrow(e) {
  const hit = e.getBlockHit?.();
  const b = hit?.block;
  if (b?.typeId !== MEGA_TNT) return;
  const onFire = e.projectile?.getComponent?.("minecraft:onfire");
  if (onFire) ignite(b, "fire");
}

/**
 * Before any explosion: a Mega TNT block in it is not blown to bits (and dropped), it is lit, with the short fuse a
 * blast gives TNT.
 */
export function megaTntExplosion(e) {
  const hit = e.getImpactedBlocks();
  const mega = hit.filter((b) => b.typeId === MEGA_TNT);
  if (!mega.length) return;
  e.setImpactedBlocks(hit.filter((b) => b.typeId !== MEGA_TNT));
  const spots = mega.map((b) => ({ d: b.dimension, at: { ...b.location } }));
  system.run(() => {
    for (const s of spots) {
      try {
        ignite(s.d.getBlock(s.at), "blast");
      } catch (err) {
        reportError("megaTnt.chain", err);
      }
    }
  });
}

/** Every g.findEvery ticks: the lit ones in loaded places (after a reload, or one we didn't light). */
export function findLit() {
  for (const id of DIMENSIONS) {
    let d;
    try {
      d = world.getDimension(id);
    } catch {
      continue;
    }
    for (const e of d.getEntities({ type: MEGA_PRIMED })) lit.set(e.id, e);
  }
}

/** Every 2 ticks: each fuse burns down; at the end, the blast. */
export function tickMegaTnt() {
  if (!lit.size) return;
  const g = G();
  for (const [id, e] of lit) {
    if (!e.isValid) {
      lit.delete(id);
      continue;
    }
    const left = Number(e.getDynamicProperty(FUSE_LEFT) ?? g.fuse) - 2;
    if (left > 0) {
      e.setDynamicProperty(FUSE_LEFT, left);
      if (isLate(left, g) && !e.getProperty(LATE)) e.setProperty(LATE, true);
      continue;
    }
    lit.delete(id);
    const d = e.dimension;
    const at = { ...e.location };
    e.remove();
    blow(d, at);
  }
}

/** The blast: the game's own (no blocks broken) for the damage, push and sound, then the crater, cut as a job. */
function blow(d, at) {
  const g = G();
  stats.blasts += 1;
  const c = { x: Math.floor(at.x), y: Math.floor(at.y + 0.5), z: Math.floor(at.z) };
  const mid = { x: c.x + 0.5, y: c.y + 0.5, z: c.z + 0.5 };
  let wet = false;
  try {
    const here = d.getBlock(c);
    wet = Boolean(here?.isLiquid) || here?.typeId === "minecraft:water" || here?.typeId === "minecraft:flowing_water";
  } catch {
    wet = false;
  }
  try {
    d.createExplosion(mid, g.radius, { breaksBlocks: false, causesFire: false, allowUnderwater: true });
  } catch (err) {
    reportError("megaTnt.blast", err);
  }
  sound(d, "random.explode", mid, 4);
  for (const p of d.getPlayers({ location: mid, maxDistance: g.shakeReach })) {
    try {
      p.runCommand(`camerashake add @s ${g.shake} 1.5 positional`);
    } catch {
      // no shake: no matter
    }
  }
  // As TNT's: under water it breaks nothing, and nothing when the world's rules say TNT doesn't.
  if (wet || world.gameRules.tntExplodes === false) return;
  jobs.push(crater(d, c));
}

function* crater(d, c) {
  const g = G();
  const t0 = Date.now();
  const height = d.heightRange;
  const box = ballBox(c, g.radius, height);
  // 1. what is in chests and the like falls out; TNT and Mega TNT in the ball are lit (a short fuse); both kept from the cut
  const spill = [];
  const chain = [];
  const lookFor = [...holders(), ...known([MEGA_TNT, "minecraft:tnt"])];
  const fuses = new Set([MEGA_TNT, "minecraft:tnt"]);
  // the box a slice at a time (the whole of it in one look stalls a tick)
  for (let y = box.from.y; y <= box.to.y; y += g.findSlice) {
    try {
      const vol = new BlockVolume({ ...box.from, y }, { ...box.to, y: Math.min(box.to.y, y + g.findSlice - 1) });
      for (const p of d.getBlocks(vol, { includeTypes: lookFor }, true).getBlockLocationIterator()) {
        if (!inBall(p.x - c.x, p.y - c.y, p.z - c.z, g.radius)) continue;
        if (fuses.has(d.getBlock(p)?.typeId ?? "")) chain.push(p);
        else spill.push(p);
      }
    } catch (err) {
      reportError("megaTnt.find", err);
    }
    yield;
  }
  for (const p of spill) {
    try {
      const inv = d.getBlock(p)?.getComponent("minecraft:inventory")?.container;
      for (let i = 0; inv && i < inv.size; i++) {
        const it = inv.getItem(i);
        if (!it) continue;
        d.spawnItem(it, { x: p.x + 0.5, y: p.y + 0.5, z: p.z + 0.5 });
        stats.spilled += it.amount;
      }
      inv?.clearAll();
    } catch {
      // unreadable: left as it is
    }
  }
  yield;
  // 2. the crater, from the middle out, a few columns a step
  const opts = { blockFilter: { excludeTypes: keep() }, ignoreChunkBoundErrors: true };
  const cols = craterColumns(g.radius);
  const smoke = smokePoints(c, g.radius, g.smoke);
  let n = 0;
  let puffed = -1;
  for (const col of cols) {
    const span = columnSpan(c.y, col.half, height);
    if (span) {
      try {
        d.fillBlocks(new BlockVolume({ x: c.x + col.dx, y: span.lo, z: c.z + col.dz }, { x: c.x + col.dx, y: span.hi, z: c.z + col.dz }), "minecraft:air", opts);
      } catch {
        // outside the loaded world: left as it is
      }
    }
    n += 1;
    if (n % g.columnsPerStep === 0) {
      const k = Math.floor((n / cols.length) * smoke.length);
      const s = k !== puffed ? smoke[k] : undefined;
      puffed = k;
      if (s) {
        try {
          d.spawnParticle("minecraft:huge_explosion_emitter", s);
          d.spawnParticle("zoocraft:mega_glow_burst", s);
        } catch {
          // no smoke there: no matter
        }
      }
      yield;
    }
  }
  stats.columns += n;
  stats.lastColumns = n;
  stats.lastMs = Date.now() - t0;
  // 3. the TNT that stood in the ball goes off after
  for (const p of chain) {
    try {
      const b = d.getBlock(p);
      if (b?.typeId === MEGA_TNT) {
        ignite(b, "blast");
        stats.chained += 1;
      } else if (b?.typeId === "minecraft:tnt") {
        b.setType("minecraft:air");
        d.spawnEntity("minecraft:tnt", { x: p.x + 0.5, y: p.y, z: p.z + 0.5 }, { spawnEvent: "minecraft:from_explosion" });
        stats.chained += 1;
      }
    } catch (err) {
      reportError("megaTnt.chainTnt", err);
    }
  }
}

/** For the test server. */
export function megaTntDebug() {
  return { ...stats, known: lit.size, jobs: jobs.waiting, fuses: [...lit.values()].filter((e) => e.isValid).map((e) => e.getDynamicProperty(FUSE_LEFT)) };
}

/** For the test server: one more of the item for a player. */
export function megaTntStack(n = 1) {
  return new ItemStack(MEGA_TNT, n);
}
