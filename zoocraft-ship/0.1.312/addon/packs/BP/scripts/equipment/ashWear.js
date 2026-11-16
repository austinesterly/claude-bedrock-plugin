// What Ash's pieces do while worn (0.1.304; the rules: residents/ashRules.js). Each player on their own:
//  - Ghast J's (feet) Slow Falling, Soul Shoes (feet) Swiftness, Blaze Gauntlets and Warped Gauntlets (off hand) Fire
//    Resistance and Haste: the game's own effects, without particles, topped up while the piece is on and taken off with
//    it. An effect from a potion or a beacon is never cut short.
//  - Shroomlight Necklace (chest): the game has no light that moves with a player, so one unseen light block is kept at
//    the wearer's head, only ever in air, and put back to air as they move on, take the necklace off or leave.
//  - Wither Star Necklace (chest): the damage the wearer takes is kept and added to their next hit by hand.
//  - Crying Obsidian Necklace: its 5 armor points are the item's own (the chest slot), nothing here.
import { world, EquipmentSlot } from "@minecraft/server";
import { onlinePlayers, message } from "../platform/mc.js";
import { BALANCE } from "../data/balance.js";
import { ASH_MARK, ashWareOf } from "./hanvilRules.js";
import { WARES, GLOW_ITEM, STAR_ITEM, wornEffects, effectStep, starAdd, starHit, starCounts, starFx, starHand, glowPlan, lightBlock } from "../residents/ashRules.js";

const C = () => BALANCE.ashShop;
const EFFECTS = [...new Set(WARES.filter((w) => w.effect).map((w) => w.effect))];
const GLOW_P = "zoocraft:ash_glow";
const STAR_P = "zoocraft:ash_star";
// player id -> { gave: { effect: true }, worn, glow: lit cell, star: stored damage, dirty, used: bonus to tell, player }
const state = new Map();

/** 0.1.307: boots Han Lock joined a pair of Ash's shoes to count as those shoes. */
function feetOf(it) {
  if (!it) return undefined;
  let mark;
  try {
    mark = it.getDynamicProperty(ASH_MARK);
  } catch {
    mark = undefined;
  }
  return ashWareOf(it.typeId, mark);
}

function wornOf(player) {
  const eq = player.getComponent("minecraft:equippable");
  if (!eq) return {};
  return {
    head: eq.getEquipment(EquipmentSlot.Head)?.typeId,
    chest: eq.getEquipment(EquipmentSlot.Chest)?.typeId,
    feet: feetOf(eq.getEquipment(EquipmentSlot.Feet)),
    offhand: eq.getEquipment(EquipmentSlot.Offhand)?.typeId,
  };
}

function unlight(c) {
  if (!c) return true;
  try {
    const b = world.getDimension(c.dim).getBlock(c);
    if (!b) return false; // not loaded: later
    if (b.typeId === lightBlock(C().glow)) b.setType("minecraft:air");
    return true;
  } catch {
    return false;
  }
}

function stateOf(player) {
  let s = state.get(player.id);
  if (!s) {
    s = { gave: {}, worn: {}, glow: undefined, star: 0, dirty: false, used: 0, stale: undefined };
    try {
      const g = player.getDynamicProperty(GLOW_P); // a light left by a crash or a sudden leave
      if (typeof g === "string") s.stale = JSON.parse(g);
      const st = player.getDynamicProperty(STAR_P);
      if (typeof st === "number") s.star = st;
    } catch {
      // nothing kept
    }
    state.set(player.id, s);
  }
  return s;
}

/** Every 10 ticks: who wears what, their effects, the star's count kept, lights of those gone put out. */
export function tickAshWear() {
  const seen = new Set();
  for (const player of onlinePlayers()) {
    seen.add(player.id);
    try {
      step(player);
    } catch {
      // left, or not loaded: next time
    }
  }
  for (const [id, s] of state) {
    if (seen.has(id)) continue;
    unlight(s.glow);
    state.delete(id);
  }
}

function step(player) {
  const s = stateOf(player);
  if (s.stale) {
    if (unlight(s.stale)) {
      s.stale = undefined;
      if (!s.glow) player.setDynamicProperty(GLOW_P, undefined);
    }
  }
  s.worn = wornOf(player);
  const want = new Set(wornEffects(s.worn));
  for (const effect of EFFECTS) {
    const left = player.getEffect(effect)?.duration ?? 0;
    const what = effectStep(want.has(effect), left, Boolean(s.gave[effect]), C().ticks);
    if (what === "give") {
      player.addEffect(effect, C().ticks, { amplifier: C().level[effect] ?? 0, showParticles: false });
      s.gave[effect] = true;
    } else if (what === "take") {
      player.removeEffect(effect);
      s.gave[effect] = false;
    } else if (!left || !want.has(effect)) s.gave[effect] = false;
  }
  // the Wither Star: taken off, what it held is gone
  if (s.worn.chest !== STAR_ITEM && s.star > 0) {
    s.star = 0;
    s.dirty = true;
  }
  if (s.used > 0) {
    message(player, `§7Wither Star Necklace: §f+${Math.round(s.used * 10) / 10} damage§7 on that hit.`);
    s.used = 0;
  }
  s.release = undefined; // a hit that never landed shows nothing later
  if (s.star > 0 && s.worn.chest === STAR_ITEM) starGlow(player, s.star); // 0.1.312: the hand glows while it holds something
  if (s.dirty) {
    player.setDynamicProperty(STAR_P, s.star > 0 ? s.star : undefined);
    s.dirty = false;
  }
  if (s.worn.chest !== GLOW_ITEM && s.glow) glow(player, s);
}

/** Every 2 ticks: the Shroomlight Necklace's light follows its wearers (nobody wearing one: nothing). */
export function tickAshGlow() {
  let any = false;
  for (const s of state.values()) if (s.worn.chest === GLOW_ITEM || s.glow) any = true;
  if (!any) return;
  for (const player of onlinePlayers()) {
    const s = state.get(player.id);
    if (!s || (s.worn.chest !== GLOW_ITEM && !s.glow)) continue;
    try {
      glow(player, s);
    } catch {
      // not loaded: next time
    }
  }
}

function glow(player, s) {
  const wearing = s.worn.chest === GLOW_ITEM;
  const h = player.getHeadLocation();
  const plan = glowPlan(s.glow, { x: h.x, y: h.y, z: h.z, dim: player.dimension.id }, wearing);
  if (!plan.clear && !plan.set) return;
  let lit;
  if (plan.set) {
    const b = player.dimension.getBlock(plan.set);
    if (b?.isAir) {
      b.setType(lightBlock(C().glow)); // only ever into air: no block of a build is replaced
      lit = plan.set;
    }
  }
  if (plan.clear) unlight(plan.clear);
  s.glow = lit;
  player.setDynamicProperty(GLOW_P, lit ? JSON.stringify(lit) : undefined);
}

// --- the Wither Star's show (0.1.312): our own purple particles and the game's sounds; chat and screen stay as they were
const fxCount = { gather: 0, glow: 0, release: 0 }; // for the test server
const fx = (dimension, id, at) => {
  try {
    dimension.spawnParticle(id, at);
  } catch {
    // not loaded there: nothing to see
  }
};
const snd = (dimension, id, at, volume, pitch) => {
  try {
    dimension.playSound(id, at, { volume, pitch });
  } catch {
    // no sound, no matter
  }
};
const handOf = (player) => starHand(player.getHeadLocation(), player.getViewDirection());

/** Hurt while wearing it: purple motes fly into the weapon hand and a note climbs with what is kept. */
function starGather(player, stored) {
  const f = starFx(stored, C().starCap);
  const at = handOf(player);
  fx(player.dimension, "zoocraft:star_gather", at);
  fx(player.dimension, "zoocraft:star_glow", at);
  snd(player.dimension, "respawn_anchor.charge", at, 0.8, f.pitch);
  fxCount.gather++;
}

/** While something is kept: the weapon hand glows purple (each half second). */
function starGlow(player, stored) {
  const f = starFx(stored, C().starCap);
  const at = handOf(player);
  fx(player.dimension, "zoocraft:star_glow", at);
  for (let i = 0; i < f.glints; i++) fx(player.dimension, "zoocraft:star_glint", at);
  fxCount.glow++;
}

/** The hit that spends it: a flash, a burst and a ring at what was hit, and the sound of it let go. */
function starRelease(target, bonus) {
  const f = starFx(bonus, C().starCap);
  const l = target.location;
  let mid = { x: l.x, y: l.y + 0.9, z: l.z };
  try {
    const h = target.getHeadLocation();
    mid = { x: l.x, y: (l.y + h.y) / 2, z: l.z };
  } catch {
    // no head: the middle of a block up will do
  }
  const d = target.dimension;
  fx(d, "zoocraft:star_flash", mid);
  fx(d, "zoocraft:star_burst", mid);
  fx(d, "zoocraft:star_ring", { x: l.x, y: l.y + 0.15, z: l.z });
  snd(d, f.big ? "mace.heavy_smash_ground" : "mace.smash_ground", mid, 1, f.big ? 0.9 : 1.15);
  snd(d, "respawn_anchor.deplete", mid, 0.9, 1.3);
  if (f.big) snd(d, "mob.warden.sonic_boom", mid, 0.35, 1.8);
  fxCount.release++;
}

/** Before a hit lands: the wearer's stored damage is added to it, once. */
export function ashHurtBefore(e) {
  const by = e.damageSource?.damagingEntity;
  if (by?.typeId !== "minecraft:player") return;
  const s = state.get(by.id);
  if (!s || !(s.star > 0)) return;
  if (!starCounts(e.damageSource.cause, by.id, e.hurtEntity?.id, e.damageSource.damagingProjectile)) return;
  if (wornOf(by).chest !== STAR_ITEM) return;
  const hit = starHit(s.star, e.damage);
  e.damage = hit.damage;
  s.star = 0;
  s.used = hit.bonus;
  s.release = { bonus: hit.bonus, target: e.hurtEntity?.id }; // 0.1.312: shown and heard once the hit has landed
  s.dirty = true;
}

/** After a wearer is hurt: what they took is kept for their next hit. */
export function ashHurtAfter(e) {
  const who = e.hurtEntity;
  const by = e.damageSource?.damagingEntity;
  if (by?.typeId === "minecraft:player") {
    const sb = state.get(by.id);
    if (sb?.release && sb.release.target === who?.id) {
      const r = sb.release;
      sb.release = undefined;
      if (who?.isValid) starRelease(who, r.bonus);
    }
  }
  if (who?.typeId !== "minecraft:player" || !(e.damage > 0)) return;
  if (wornOf(who).chest !== STAR_ITEM) return;
  const s = stateOf(who);
  const next = starAdd(s.star, e.damage, C().starCap);
  if (next !== s.star) {
    s.star = next;
    s.dirty = true;
  }
  starGather(who, s.star); // 0.1.312
}

/** For the test server. */
export function ashWearDebug(player) {
  const s = state.get(player.id);
  return { worn: wornOf(player), gave: s?.gave, glow: s?.glow, star: s?.star, fx: { ...fxCount }, effects: EFFECTS.map((e) => [e, player.getEffect(e)?.duration ?? 0, player.getEffect(e)?.amplifier]) };
}
