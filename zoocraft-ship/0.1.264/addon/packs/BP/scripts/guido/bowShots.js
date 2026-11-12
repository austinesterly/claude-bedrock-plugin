// What a ZooCraft bow does with the game's own arrow (0.1.261; 0.1.263: every bow's TwoDogs power, Austin 12 Nov: "I
// want all the abilities the same for each bow, just use vanilla arrows only instead"; 0.1.264: TwoDogs' own numbers,
// from its files, and the Signatures and upgrades). Numbers: data/bows.js (each bow's, TwoDogs') and balance.js
// residents.bowCase (shots, powers, upgrades); the parts with no game in them: guido/bowRules.js.
//
// The player's arrow is the game's, fired by the game's bow code (minecraft:shooter), and stays theirs to pick up as
// ever. Its speed is scaled by the bow's power, which scales its damage and reach the way a stronger draw does. Then, as
// TwoDogs' combat/bows.js, projectiles.js, sonic.js, jungle.js, nether.js and allies/vexes.js do it:
// - Scrap Bow and Twin Fang: their arrows fanned evenly across 16 and 4 degrees (4 and 2 arrows). The Ballista: no draw
//   (a tap fires it), four arrows flat in a ring round the player, straight, 32 blocks; then it winds back. The extra
//   arrows are paid for from the player's arrows as they fire (none in Creative or with Infinity), fewer if there are
//   fewer. Every arrow of one shot that strikes a hostile mob counts in full (the hurt time doesn't swallow them).
// - Every bow's headshot does 1.5 times (the Needle Bow's twice). Proximity Bow: the arrow locks the nearest hostile mob
//   it can see in a 15-degree cone within 18 blocks and turns 90 degrees a second toward it. Vexcaller: a full draw's
//   arrow that strikes calls a vex that flies to a hostile mob near and strikes it twice (8 each), gone after 6 seconds.
// - Sonic Bow: a full draw flies dead straight 64 blocks through every hostile mob, and every hostile mob within 24
//   blocks of its line is brought onto the line ahead of it (and struck). Scorpion: straight, 48 blocks, on through up to
//   seven. Blightbloom: a spore cloud where it lands that poisons hostile mobs in it (5 a second). Blaze: the arrow burns
//   and a hostile mob it strikes burns for 4 a second. Panda: hearts behind it. Trails and sounds are TwoDogs'.
// - Signatures (from Guido): see data/bows.js `signature`. Upgrades I to III: damage x1.1, then the draw x0.9 (the Scrap
//   Bow's spread, the Ballista's reload), then damage x1.2 in all; the Vexcaller heals, then overflows, then x1.1.
// The extra arrows (a volley's, the one carrying a shot on through a mob, the Scrap Bow's rapid fire) are the game's
// arrow too, made here: the shooter's, gone as soon as they land or after a few seconds, so none can be picked up. The
// powers only go after hostile mobs that aren't the zoo's (isFoe): zoo animals, zoo and calmed mobs, residents, guests
// and players are hit by an arrow just as the game's arrow hits them, never more.
import { world, system, ItemStack, EquipmentSlot, GameMode } from "@minecraft/server";
import { BALANCE } from "../data/balance.js";
import { bowOf, powerOf, unit, scaled, along, fanDirs, radialDirs, volleyCount, drawPower, isHeadshot, inSeekCone, turnToward, travelled, hurtSeen, owedDamage, arrowDamage, critRatio, isFoe, NOT_FOES, overMax, numbersAt, sonicPlan, restoring, STAGE_KEY, stageOf } from "./bowRules.js";
import { heldBowItem } from "./bowCase.js";

export const EXTRA_TAG = "zoocraft_bow_arrow"; // an extra arrow made here: never left lying about
export const VEX_TYPE = "zoocraft:bow_vex";
const ARROW = "minecraft:arrow";
const BALLISTA_COOLDOWN = "zoocraft_ballista"; // the Ballista's minecraft:cooldown category
const DIMENSIONS = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
const FOES = { families: ["monster"], excludeFamilies: NOT_FOES };
const FX = (id) => (id.includes(":") ? id : `zoocraft:bow_${id}`);

const shots = new Map(); // arrow id -> what it is (shot())
const windows = new Map(); // mob id -> its hurt time { start, level } (bowRules hurtSeen)
const struck = new Map(); // arrow id -> what the game gave the mob it struck { reported, before, fresh }
let owing = new Map(); // mob id -> this tick's hits on it by the bows' arrows
let settling = false;
const clouds = []; // Blightbloom spore clouds
const dots = new Map(); // `${kind}:${mob id}` -> poison: { mob, perSecond, until, next }
const blooming = new Map(); // mob id -> poisoned by a spreading cloud: { gen, owner, perSecond, until }
const burning = new Map(); // mob id -> { until, more }: a Blaze arrow (or its Inferno) set it burning
const vexes = new Map(); // called vex id -> its record
const bonus = new Map(); // player id -> the Vexcaller's overflowing bonus hearts { amount, until }
const draws = new Map(); // player id -> a bow being drawn { bowId, start, stage, readyAt, ready, scoped }
const releases = new Map(); // player id -> the last draw let go { bowId, elapsed, tick }
const nextShot = new Map(); // player id -> the tick a shot fired on the press (Ballista, Scrap rapid fire) may come again
let vexBatch = 0;

const g = () => BALANCE.residents.bowCase.shots;
const P = () => BALANCE.residents.bowCase.powers;
const U = () => BALANCE.residents.bowCase.upgrades;
const speedOf = (v) => Math.hypot(v.x, v.y, v.z);
// How far a bow's arrow flies before it's gone (TwoDogs' rangeBlocks): its power's range, but the Proximity Bow's range is
// how far it looks for a mob to home on, and its arrow flies on as far as it will (TwoDogs' has no rangeBlocks).
const reach = (bow) => (bow.power?.kind === "homing" ? undefined : bow.power?.range);

function familiesOf(e) {
  try {
    return e.getComponent("minecraft:type_family")?.getTypeFamilies() ?? [];
  } catch {
    return [];
  }
}

const foe = (e) => isFoe(familiesOf(e));
/** A foe the Sonic Bow may bring to its line: not one of the game's bosses (balance powers.sonic.never). */
const pullable = (e) => foe(e) && !P().sonic.never.includes(e.typeId);

function chest(e) {
  try {
    const h = e.getHeadLocation();
    return { x: e.location.x, y: (e.location.y + h.y) / 2, z: e.location.z };
  } catch {
    return e.location;
  }
}

function playerById(id) {
  if (!id) return undefined;
  let p;
  try {
    p = world.getEntity(id) ?? world.getPlayers().find((q) => q.id === id);
  } catch {
    p = undefined;
  }
  return p?.isValid ? p : undefined;
}

function fx(dim, id, at) {
  try {
    dim.spawnParticle(FX(id), at);
  } catch {
    // out of loaded range
  }
}

function sound(dim, s, at) {
  try {
    if (s) dim.playSound(s.id, at, { volume: s.volume, pitch: s.pitch });
  } catch {
    // no sound
  }
}

/** A clear line between two points (no solid block in the way). */
function clearPath(dim, from, to) {
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
  const l = speedOf(d);
  if (l < 0.05) return true;
  try {
    return !dim.getBlockFromRay(from, scaled(d, 1 / l), { maxDistance: l, includePassableBlocks: false, includeLiquidBlocks: false });
  } catch {
    return true;
  }
}

/**
 * What an arrow of a ZooCraft bow is, for as long as it's followed. `o`: the shot's own parts (bow, stage numbers,
 * owner, full, the hit set it shares, its speed and where it started).
 */
function shot(o, arrow, vel, extra) {
  const now = system.currentTick;
  const pw = o.bow.power ?? {};
  const sig = o.nums.signature;
  const left = pw.kind === "pierce" ? pw.through : pw.kind === "sonic" ? Infinity : sig?.kind === "pierce" ? sig.through : 0;
  return {
    ...o,
    kind: pw.kind,
    pw,
    sig,
    extra,
    born: now,
    until: now + (extra ? P().extraTicks : g().keepTicks),
    vel,
    pos: arrow.location,
    from: o.from ?? arrow.location,
    gone: 0, // how far it has flown
    left: o.left ?? left,
    hit: o.hit ?? new Set(),
    trail: sig?.trail ?? o.bow.trail,
    landed: false,
  };
}

/** A bow whose arrows fly burning (the Blaze Bow: its trail says so). */
const flaming = (bow) => typeof bow.trail === "object" && Boolean(bow.trail.fire);

/** Straight shots: the Sonic Bow, the Scorpion and the Ballista fly with no drop, as far as their range. */
const straight = (bow) => ["sonic", "pierce", "radial"].includes(bow.power?.kind);

/** An extra arrow: the game's arrow, the shooter's, flying `vel` from `at`. Known here before its spawn event comes. */
function makeArrow(dim, at, vel, o) {
  let a;
  try {
    a = dim.spawnEntity(ARROW, at);
  } catch {
    return undefined;
  }
  shots.set(a.id, shot(o, a, vel, true));
  try {
    a.addTag(EXTRA_TAG);
    const pr = a.getComponent("minecraft:projectile");
    const owner = playerById(o.owner);
    if (owner) pr.owner = owner;
    if (straight(o.bow)) pr.gravity = 0;
    if (flaming(o.bow)) a.setOnFire(g().fireSeconds, true);
    pr.shoot(vel);
  } catch {
    takeAway(a.id);
    return undefined;
  }
  return a;
}

function takeAway(id) {
  shots.delete(id);
  try {
    const a = world.getEntity(id);
    if (a?.isValid) a.remove();
  } catch {
    // gone already
  }
}

function creative(player) {
  try {
    return player.getGameMode() === GameMode.Creative;
  } catch {
    return false;
  }
}

/** Arrows that cost nothing: in Creative, or from a bow with Infinity (as the game's bow). */
function freeArrows(player, item) {
  if (creative(player)) return true;
  try {
    return Boolean(item?.getComponent("minecraft:enchantable")?.getEnchantment("infinity"));
  } catch {
    return false;
  }
}

/** Takes up to `n` of the player's arrows (the off hand first, as the game's bow): how many it took. */
function takeArrows(player, n) {
  let took = 0;
  try {
    const eq = player.getComponent("minecraft:equippable");
    const off = eq?.getEquipment(EquipmentSlot.Offhand);
    if (off?.typeId === ARROW && n > 0) {
      const k = Math.min(n, off.amount);
      if (k >= off.amount) eq.setEquipment(EquipmentSlot.Offhand, undefined);
      else {
        off.amount -= k;
        eq.setEquipment(EquipmentSlot.Offhand, off);
      }
      took += k;
    }
    const inv = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; inv && i < inv.size && took < n; i++) {
      const it = inv.getItem(i);
      if (it?.typeId !== ARROW) continue;
      const k = Math.min(n - took, it.amount);
      if (k >= it.amount) inv.setItem(i, undefined);
      else {
        it.amount -= k;
        inv.setItem(i, it);
      }
      took += k;
    }
  } catch {
    // the inventory went away
  }
  return took;
}

function countArrows(player) {
  let n = 0;
  try {
    const off = player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Offhand);
    if (off?.typeId === ARROW) n += off.amount;
    const inv = player.getComponent("minecraft:inventory")?.container;
    for (let i = 0; inv && i < inv.size; i++) {
      const it = inv.getItem(i);
      if (it?.typeId === ARROW) n += it.amount;
    }
  } catch {
    // none
  }
  return n;
}

/** Luck in the Chamber, Bamboo Luck: a chance the arrows paid for come back (never ones that cost nothing). */
function refund(player, sig, paid) {
  if (sig?.kind !== "refund" || paid <= 0 || Math.random() >= sig.chance) return;
  try {
    const inv = player.getComponent("minecraft:inventory")?.container;
    const left = inv?.addItem(new ItemStack(ARROW, paid));
    if (left) player.dimension.spawnItem(left, player.location);
    player.onScreenDisplay.setActionBar(`§6${sig.text.split(":")[0]}: arrow refunded`);
    fx(player.dimension, "refund_glint", player.getHeadLocation());
  } catch {
    // gone
  }
}

/** The stage numbers and the draw of the bow a player holds now. */
function holding(player) {
  const h = heldBowItem(player);
  if (!h) return undefined;
  return { ...h, nums: numbersAt(h.bow, h.stage, U()) };
}

/** A bow's draw in ticks at its stage (Upgrade II: 90% of it). */
const drawTicksOf = (bow, nums) => Math.max(1, Math.round(bow.draw * 20 * nums.draw));

/**
 * How full a draw the shot was, 0 to 1 (the game's power curve). The game's own: the arrow's speed against a full
 * draw's. TwoDogs': the same curve from how long it was drawn, full 0.1 s before the bow shows ready (its "ready .1
 * seconds before the green"), over Upgrade II's quicker draw too. The fuller of the two.
 */
function drawOf(owner, bow, nums, raw) {
  if (bow.instant) return 1;
  let p = Math.min(1, raw / P().fullSpeed);
  if (p < 1) {
    const now = system.currentTick;
    const d = draws.get(owner.id);
    const r = releases.get(owner.id);
    const elapsed = r && r.bowId === bow.id && now - r.tick <= 2 ? r.elapsed : d && d.bowId === bow.id ? now - d.start : undefined;
    if (elapsed !== undefined) p = Math.max(p, drawPower(elapsed, drawTicksOf(bow, nums)));
  }
  return p >= 0.999 ? 1 : p;
}

/** An arrow from a player holding one of ZooCraft's bows: its power, and the shot's other arrows. */
function launched(arrow) {
  if (shots.has(arrow.id)) return; // an extra made here
  let owner;
  let pr;
  try {
    pr = arrow.getComponent("minecraft:projectile");
    owner = pr?.owner;
  } catch {
    owner = undefined;
  }
  if (owner?.typeId !== "minecraft:player") return;
  const h = holding(owner);
  if (!h) return;
  const { bow, nums, item } = h;
  const sig = nums.signature;
  const kind = bow.power?.kind;
  let v;
  try {
    v = arrow.getVelocity();
  } catch {
    return; // gone this tick
  }
  const raw = speedOf(v);
  const draw = drawOf(owner, bow, nums, raw);
  endDraw(owner);
  const full = draw >= 1;
  const sp = P().fullSpeed * draw * powerOf(bow.damage, g());
  const view = owner.getViewDirection();
  // TwoDogs' shots fly along the view, with none of the game's wobble (combat/bows.js: "the view is the shot's
  // direction"), so a volley fans out round the crosshair and every bow is as true as TwoDogs'.
  const d = unit(view);
  const radial = kind === "radial";
  // How many arrows this shot is, and how many fly (the rest are paid for now).
  const fullCount = radial ? (sig?.kind === "radial" ? sig.arrows : bow.power.arrows) : kind === "fan" ? bow.power.arrows : 1;
  const perShot = kind === "fan" || radial ? bow.power.arrows : 1;
  const free = freeArrows(owner, item);
  let count = fullCount;
  if (fullCount > 1 && !free) count = volleyCount(fullCount, perShot, takeArrows(owner, perShot - 1));
  const dirs = radial ? radialDirs(d, fullCount) : kind === "fan" ? fanDirs(d, count, bow.power.spreadDeg * nums.spread) : [d];
  const vel = scaled(dirs[0], sp);
  try {
    arrow.clearVelocity();
    arrow.applyImpulse(vel);
  } catch {
    // the arrow went this tick: it flies as the game's bow sent it
  }
  try {
    if (straight(bow)) pr.gravity = 0;
    if (flaming(bow)) arrow.setOnFire(g().fireSeconds, true);
  } catch {
    // already gone
  }
  // A full draw the game didn't count as one (let go in TwoDogs' last 0.1 s, or over Upgrade II's quicker draw) is
  // owed the critical the game's full draw gives.
  const gameFull = raw >= P().fullSpeed * 0.98;
  const o = { bow, nums, owner: owner.id, full, drawPower: draw, speed: sp, mult: nums.damage * (sig?.damageTimes ?? 1), crit: full && !gameFull ? critRatio(sp) : 1, range: reach(bow), from: arrow.location, raw };
  if (radial) o.hit = new Set(); // a ring strikes each mob once a shot
  shots.set(arrow.id, shot(o, arrow, vel, false));
  const dim = arrow.dimension;
  // The volley's other arrows: script-made, so no critical; a full draw's are owed what a critical adds.
  const xo = { ...o, crit: full ? critRatio(sp) : 1 };
  for (let i = 1; i < count; i++) {
    const at = radial ? { x: owner.location.x + dirs[i].x * P().radial.out, y: owner.location.y + P().radial.up, z: owner.location.z + dirs[i].z * P().radial.out } : arrow.location;
    makeArrow(dim, at, scaled(dirs[i], sp), xo);
  }
  refund(owner, sig, free ? 0 : perShot === 1 ? 1 : count);
  if (bow.charge && draw >= 0.9) {
    sound(dim, bow.charge.shot, owner.location);
    const head = owner.getHeadLocation();
    for (const id of bow.charge.flash) fx(dim, id, along(head, view, 1.5));
  }
  if (kind === "homing") seek(dim, shots.get(arrow.id), vel, arrow.location);
  if (kind === "sonic" && full) sonicPull(owner, shots.get(arrow.id), arrow.location, unit(vel));
}

/**
 * A shot fired here on the press, as TwoDogs fires it (its scriptShot): the Ballista (no draw: four arrows flat in a
 * ring round the player, sixteen with its Signature, then it winds back) and the Scrap Bow's Signature, rapid fire (no
 * draw: each use fires its four-arrow fan at once, then a short recovery). The game's own bow use is stopped
 * (beforeEvents.itemUse), so these are all arrows made here: the shooter's, gone where they land.
 */
function scriptVolley(player) {
  const h = holding(player);
  if (!h) return;
  const { bow, nums, item } = h;
  const sig = nums.signature;
  const radial = bow.power?.kind === "radial";
  if (!radial && sig?.kind !== "rapid") return;
  const now = system.currentTick;
  if (now < (nextShot.get(player.id) ?? 0)) return;
  const perShot = bow.power.arrows;
  const count = radial && sig?.kind === "radial" ? sig.arrows : perShot;
  const free = freeArrows(player, item);
  // TwoDogs fires a press shot only with its full four arrows (Creative needs none; Infinity, one, as the game's bow).
  const need = creative(player) ? 0 : free ? 1 : perShot;
  if (countArrows(player) < need) {
    player.onScreenDisplay.setActionBar("§cNo arrows");
    player.playSound("random.click", { pitch: 0.6, volume: 0.6 });
    return;
  }
  if (!free) takeArrows(player, perShot);
  // The wait before the next: the Ballista winds back (Upgrade II: 10% sooner), shown as its cooldown, which its
  // model winds by; the Scrap Bow's rapid fire recovers.
  const recovery = radial ? Math.max(2, Math.round(bow.recovery * 20 * nums.recovery)) : Math.round(sig.recovery * 20);
  nextShot.set(player.id, now + recovery);
  if (radial) {
    try {
      player.startItemCooldown(BALLISTA_COOLDOWN, recovery);
    } catch {
      // no cooldown to show
    }
  }
  const view = player.getViewDirection();
  const head = player.getHeadLocation();
  const eye = { x: head.x, y: head.y - 0.1, z: head.z };
  const dirs = radial ? radialDirs(view, count) : fanDirs(view, count, bow.power.spreadDeg * nums.spread);
  const sp = P().fullSpeed * powerOf(bow.damage, g());
  const o = { bow, nums, owner: player.id, full: true, drawPower: 1, speed: sp, mult: nums.damage * (sig?.damageTimes ?? 1), crit: critRatio(sp), range: reach(bow) };
  if (radial) o.hit = new Set(); // a ring strikes each mob once a shot; pellets each count
  for (const dir of dirs) {
    const at = radial ? { x: player.location.x + dir.x * P().radial.out, y: player.location.y + P().radial.up, z: player.location.z + dir.z * P().radial.out } : eye;
    makeArrow(player.dimension, at, scaled(dir, sp), { ...o, from: at });
  }
  wear(player, item);
  try {
    player.dimension.playSound("random.bow", player.location, { pitch: radial ? 0.7 : 1.25, volume: 0.8 });
  } catch {
    // no sound
  }
}

/** One use's wear on the bow in hand (Unbreaking may spare it), as the game's bow wears a shot. */
function wear(player, item) {
  try {
    const dur = item.getComponent("minecraft:durability");
    if (!dur || creative(player)) return;
    const unb = item.getComponent("minecraft:enchantable")?.getEnchantment("unbreaking")?.level ?? 0;
    if (Math.random() >= 1 / (unb + 1)) return;
    const eq = player.getComponent("minecraft:equippable");
    if (dur.damage + 1 >= dur.maxDurability) {
      eq.setEquipment(EquipmentSlot.Mainhand, undefined);
      player.playSound("random.break");
      return;
    }
    dur.damage += 1;
    eq.setEquipment(EquipmentSlot.Mainhand, item);
  } catch {
    // it's gone from the hand
  }
}

/** A hit by one of the bows' arrows on a hostile mob: counted for the settling up next tick. */
function owe(target, h) {
  const list = owing.get(target.id) ?? [];
  list.push(h);
  owing.set(target.id, list);
  if (!settling) {
    settling = true;
    system.run(settleUp);
  }
}

/** Last tick's hits: each mob struck gets what the arrows that struck it still owe it (bowRules owedDamage). */
function settleUp() {
  settling = false;
  const todo = owing;
  owing = new Map();
  for (const [id, hits] of todo) {
    const t = world.getEntity(id);
    if (!t?.isValid) continue;
    const w = windows.get(id);
    const inWindow = Boolean(w) && system.currentTick - 1 - w.start < P().hurtTicks;
    const owed = owedDamage(hits.map((h) => ({ ...(struck.get(h.arrow) ?? {}), expected: h.expected, mult: h.mult, inWindow })));
    if (owed > 0) addDamage(t, owed, hits[0].owner);
  }
  struck.clear();
}

/**
 * `amount` more on a mob. "override" is the one kind of damage the game lands in full inside a mob's hurt time (the
 * test server: entityAttack, magic, fire and void are all held back by it), so what a power adds is never lost to it.
 * What an arrow, a blast or a vex adds is the shooter's (`ownerId`: the kill and its drops are theirs); a cloud's,
 * poison's or burning's each second comes from no one, so it doesn't knock the mob back each time (the arrow that
 * started it still makes the kill the player's, as the game's burning does).
 */
function addDamage(t, amount, ownerId) {
  const by = ownerId ? playerById(ownerId) : undefined;
  try {
    t.applyDamage(amount, by ? { cause: "override", damagingEntity: by } : { cause: "override" });
  } catch {
    // it can't be hurt now
  }
}

/** Hostile mobs within `radius` of `at` but `not`; with `see`, only those the point can see (TwoDogs' losClear). */
function foesAround(dim, at, radius, not, see = true) {
  try {
    return dim.getEntities({ location: at, maxDistance: radius, ...FOES }).filter((m) => m.id !== not && (!see || clearPath(dim, at, chest(m))));
  } catch {
    return [];
  }
}

/**
 * Where an arrow lands, once (a mob or the ground): the Blightbloom's cloud, the Short Bow's blast, the Blaze's Inferno
 * (TwoDogs projectiles.js impact). A partial draw weakens the blast and the cloud, not the Inferno.
 */
function impact(s, dim, at) {
  if (s.impacted) return;
  s.impacted = true;
  const pw = s.pw;
  const draw = s.drawPower ?? 1;
  if (pw.kind === "spores") sporeCloud(dim, at, s.owner, { radius: pw.radius * (0.6 + 0.4 * draw), seconds: pw.seconds, perSecond: pw.perSecond * draw, gen: 0, spread: s.sig?.kind === "spreading" });
  if (s.sig?.kind === "inferno") {
    fx(dim, "inferno_burst", at);
    sound(dim, { id: "mob.blaze.shoot", volume: 0.9, pitch: 0.8 }, at);
    for (const m of foesAround(dim, at, s.sig.radius, undefined, false)) {
      addDamage(m, s.sig.damage, s.owner);
      setBurning(m, s.sig.perSecond, s.sig.seconds);
    }
  }
  if (s.sig?.kind === "explosive") {
    for (const m of foesAround(dim, at, s.sig.radius + 0.5)) addDamage(m, s.sig.damage * draw, s.owner);
    fx(dim, "blast_ring", at);
    fx(dim, "minecraft:large_explosion", at);
    sound(dim, { id: "random.explode", volume: 1, pitch: 1.1 }, at);
    swiftness(dim, at);
  }
}

/** After a player's blast: Swiftness I for a few seconds to every player near it that it can see (TwoDogs explode). */
function swiftness(dim, at) {
  const W = P().swiftness;
  system.run(() => {
    for (const p of world.getAllPlayers()) {
      try {
        if (p.dimension.id !== dim.id || travelled(p.location, at) > W.range || !clearPath(dim, at, chest(p))) continue;
        p.addEffect("speed", W.seconds * 20, { amplifier: 0, showParticles: false });
      } catch {
        // gone
      }
    }
  });
}

/** A Blaze burn: the game's fire on the mob for `seconds`, and each second it burns `perSecond` in all. */
function setBurning(m, perSecond, seconds) {
  burning.set(m.id, { until: system.currentTick + seconds * 20, more: Math.max(0, perSecond - 1) });
  try {
    m.setOnFire(seconds, true);
  } catch {
    // fireproof, or gone
  }
}

/** Poison (the Twin Fang's Signature, the Blightbloom's clouds): `perSecond` each second until `seconds` from now. */
function poison(m, perSecond, seconds) {
  const key = `poison:${m.id}`;
  const now = system.currentTick;
  const was = dots.get(key);
  if (was) {
    was.until = now + Math.round(seconds * 20);
    was.perSecond = Math.max(was.perSecond, perSecond);
  } else dots.set(key, { mob: m, perSecond, until: now + Math.round(seconds * 20), next: now + 20 });
}

/** The Vexcaller: `count` vexes over the mob it struck, the player's; and its Restoring Shot and Overflowing. */
function callVexes(ownerId, hit, at, count, nums) {
  const V = P().vex;
  const now = system.currentTick;
  const batch = ++vexBatch;
  for (let i = 0; i < count; i++) {
    const mine = [...vexes.entries()].filter(([, r]) => r.owner === ownerId).sort((a, b) => a[1].batch - b[1].batch);
    for (const [id] of overMax(mine, V.maxPerPlayer - 1)) despawnVex(id);
    const side = (i - (count - 1) / 2) * V.spread;
    const p = { x: at.x + side, y: at.y + V.above, z: at.z + side * 0.4 };
    try {
      const e = hit.dimension.spawnEntity(VEX_TYPE, p);
      vexes.set(e.id, { owner: ownerId, batch, origin: { ...at }, target: hit.isValid ? hit.id : undefined, left: V.strikes, readyAt: now + V.readyTicks, until: now + V.lifeSeconds * 20, nextSearch: 0 });
    } catch {
      // out of loaded range
    }
  }
  sound(hit.dimension, { id: "mob.vex.charge", volume: 0.6, pitch: 1.2 }, at);
  const owner = playerById(ownerId);
  if (!owner || !nums.heal) return;
  try {
    const hp = owner.getComponent("minecraft:health");
    const was = bonus.get(ownerId) ?? { amount: 0, until: 0 };
    const r = restoring(hp.effectiveMax - hp.currentValue, nums.heal, nums.overflow, was.amount, was.until, now, V.overflowCap);
    if (r.gain > 0) hp.setCurrentValue(hp.currentValue + r.gain);
    if (r.absorption >= 0) {
      owner.addEffect("absorption", V.overflowSeconds * 20, { amplifier: r.absorption, showParticles: false });
      bonus.set(ownerId, { amount: r.bonus, until: now + V.overflowSeconds * 20 });
    }
    fx(owner.dimension, "minecraft:villager_happy", owner.getHeadLocation());
  } catch {
    // gone
  }
}

function despawnVex(id, puff = true) {
  vexes.delete(id);
  try {
    const e = world.getEntity(id);
    if (e?.isValid) {
      if (puff) fx(e.dimension, "minecraft:basic_smoke_particle", e.location);
      e.remove();
    }
  } catch {
    // gone
  }
}

/** Each tick: the called vexes fly to a hostile mob near where they were called and strike it (TwoDogs tickVexes). */
function tickVexes(now) {
  const V = P().vex;
  for (const [id, v] of vexes) {
    const e = world.getEntity(id);
    const owner = playerById(v.owner);
    if (!e?.isValid || !owner || now >= v.until) {
      despawnVex(id);
      continue;
    }
    try {
      const dim = e.dimension;
      let t = v.target ? world.getEntity(v.target) : undefined;
      if (t && (!t.isValid || t.dimension.id !== dim.id)) t = undefined;
      if (!t && now >= v.nextSearch) {
        v.nextSearch = now + V.searchEvery;
        let best;
        let bestD = Infinity;
        for (const m of dim.getEntities({ location: v.origin, maxDistance: V.searchRadius, ...FOES })) {
          const dd = travelled(e.location, m.location);
          if (dd < bestD) {
            best = m;
            bestD = dd;
          }
        }
        t = best;
        v.target = t?.id;
      }
      const at = e.location;
      if (!t) {
        e.teleport({ x: at.x, y: at.y + Math.sin(now / 6) * 0.02, z: at.z });
        continue;
      }
      const goal = { x: t.location.x, y: t.location.y + 1, z: t.location.z };
      const dist = travelled(at, goal);
      if (dist > V.reach) {
        const step = Math.min(V.flySpeed, dist - 1);
        const next = along(at, unit({ x: goal.x - at.x, y: goal.y - at.y, z: goal.z - at.z }), step);
        if (clearPath(dim, at, next)) e.teleport(next, { facingLocation: goal });
        else v.target = undefined; // a wall in the way: another
        continue;
      }
      if (now < v.readyAt || !clearPath(dim, at, goal)) continue;
      addDamage(t, V.strikeDamage, v.owner);
      v.left--;
      v.readyAt = now + Math.round(V.strikeSeconds * 20);
      fx(dim, "minecraft:critical_hit_emitter", goal);
      sound(dim, { id: "mob.vex.hurt", volume: 0.5, pitch: 1.5 }, at);
      if (v.left <= 0) despawnVex(id);
    } catch {
      vexes.delete(id);
    }
  }
}

/** Blightbloom: a spore cloud at `at`, the player's (TwoDogs spawnBloom). */
function sporeCloud(dim, at, ownerId, c) {
  const S = P().spores;
  const now = system.currentTick;
  const mine = clouds.filter((k) => k.owner === ownerId);
  for (const old of overMax(mine, S.maxPerPlayer - 1)) clouds.splice(clouds.indexOf(old), 1);
  const radius = c.gen > 0 ? S.spreadRadius : c.radius;
  const seconds = c.gen > 0 ? S.spreadSeconds : c.seconds;
  clouds.push({ dim, at: { ...at }, owner: ownerId, radius, perSecond: c.perSecond, gen: c.gen, spread: c.spread, until: now + Math.round(seconds * 20), next: now });
  fx(dim, "spore_burst", at);
  fx(dim, "bloom_puff", at);
  sound(dim, { id: "dig.grass", volume: 0.9, pitch: 0.6 + c.gen * 0.1 }, at);
  sound(dim, { id: "bubble.pop", volume: 0.7, pitch: 0.5 }, at);
}

/**
 * The Sonic Bow (TwoDogs sonicPull): its line is known as it leaves, to the first wall or its range. Every hostile mob
 * within its pull of the line is brought to the floor under the line, a moment before the arrow gets there, and is
 * struck as it passes; one the arrow then misses (the floor is below the line) takes the arrow's hit from here.
 */
function sonicPull(owner, s, from, d) {
  const pw = s.pw;
  const dim = owner.dimension;
  let length = pw.range;
  try {
    const hit = dim.getBlockFromRay(from, d, { maxDistance: pw.range, includePassableBlocks: false, includeLiquidBlocks: false });
    if (hit) length = travelled(from, { x: hit.block.location.x + hit.faceLocation.x, y: hit.block.location.y + hit.faceLocation.y, z: hit.block.location.z + hit.faceLocation.z });
  } catch {
    length = pw.range;
  }
  length -= 0.6;
  if (length < pw.minAhead) return; // a wall right in front: no line to bring them to
  let mobs;
  try {
    mobs = dim.getEntities({ location: from, maxDistance: length + pw.pullRadius, ...FOES }).filter(pullable);
  } catch {
    return;
  }
  const byId = new Map(mobs.map((m) => [m.id, m]));
  const plan = sonicPlan(from, d, length, mobs.map((m) => ({ id: m.id, pos: m.location })), pw);
  const aftershock = s.sig?.kind === "aftershock" ? s.sig.seconds : 0;
  for (const p of plan) {
    const m = byId.get(p.id);
    const arrive = Math.max(0, Math.round(p.t / s.speed) - 1);
    system.runTimeout(() => {
      try {
        if (!m.isValid) return;
        const y = floorUnder(dim, p.at);
        if (y !== undefined && (Math.hypot(m.location.x - p.at.x, m.location.z - p.at.z) > 0.7 || Math.abs(m.location.y - y) > 0.6)) {
          fx(dim, "sonic_vanish", { x: m.location.x, y: m.location.y + 0.9, z: m.location.z });
          m.teleport({ x: p.at.x, y, z: p.at.z }, { keepVelocity: false, checkForBlocks: false });
          fx(dim, "sonic_arrive", { x: p.at.x, y: y + 1, z: p.at.z });
          fx(dim, "sonic_mote", { x: p.at.x, y: y + 1, z: p.at.z });
        }
        if (aftershock && m.isValid) m.addEffect("slowness", aftershock * 20, { amplifier: 10, showParticles: false });
      } catch {
        // it went
      }
    }, arrive);
    system.runTimeout(() => {
      if (!m.isValid || s.hit.has(m.id)) return;
      s.hit.add(m.id);
      addDamage(m, arrowDamage(s.speed) * critRatio(s.speed) * s.mult, s.owner);
    }, arrive + P().sonic.settleTicks);
  }
  if (plan.length) sound(dim, { id: "mob.warden.sonic_boom", volume: 0.25, pitch: 1.6 }, owner.location);
}

/**
 * Standing room on the floor under a point of the line (feet height), or undefined: nothing within a few blocks below
 * it (a pit), the point inside a block, or no head room (TwoDogs floorUnder; found here by rays down and up, which pass
 * through grass, flowers and the like). The floor is the top of the block the ray meets (the test server gives the
 * ray's faceLocation as 0 on a block's top, so it isn't used): on a slab the mob is set half a block high and drops.
 */
function floorUnder(dim, point) {
  const opts = (d) => ({ maxDistance: d, includePassableBlocks: false, includeLiquidBlocks: false });
  try {
    const down = dim.getBlockFromRay(point, { x: 0, y: -1, z: 0 }, opts(P().sonic.floorSteps + 1));
    if (!down) return undefined;
    const y = down.block.location.y + 1;
    if (y > point.y + 0.01) return undefined;
    if (dim.getBlockFromRay({ x: point.x, y: y + 0.05, z: point.z }, { x: 0, y: 1, z: 0 }, opts(1.8))) return undefined;
    return y;
  } catch {
    return undefined;
  }
}

/** The world events: draws, arrows leaving a bow, arrows striking and landing, hurts and deaths, and each tick. */
export function wireBowShots() {
  // A draw: its sounds and the Longbow's scope follow it (itemStartUse); its length is kept as it's let go.
  world.afterEvents.itemStartUse.subscribe((e) => {
    const p = e.source;
    const bow = e.itemStack ? bowOf(e.itemStack.typeId) : undefined;
    if (!bow || p?.typeId !== "minecraft:player") return;
    const h = holding(p);
    const nums = h?.bow === bow ? h.nums : numbersAt(bow, 0, U());
    // Ready 0.1 s before the full draw time, as TwoDogs (drawPower is full then).
    draws.set(p.id, { bowId: bow.id, start: system.currentTick, readyAt: system.currentTick + Math.max(1, drawTicksOf(bow, nums) - 2), ready: false, scoped: false, scope: nums.signature?.kind === "scope" ? nums.signature : undefined });
    if (bow.charge) sound(p.dimension, bow.charge.draw, p.location);
  });
  const letGo = (e) => {
    if (e.source) endDraw(e.source);
  };
  world.afterEvents.itemReleaseUse.subscribe(letGo);
  world.afterEvents.itemStopUse.subscribe(letGo);

  // The Ballista and the Scrap Bow's rapid fire fire on the press itself (the Ballista not while it winds back).
  world.beforeEvents.itemUse.subscribe((e) => {
    const bow = e.itemStack ? bowOf(e.itemStack.typeId) : undefined;
    if (!bow) return;
    const p = e.source;
    if (bow.instant) {
      e.cancel = true;
      let left = 0;
      try {
        left = p.getItemCooldown(BALLISTA_COOLDOWN);
      } catch {
        left = 0;
      }
      if (left <= 0)
        system.run(() => {
          if (p.isValid) scriptVolley(p);
        });
      return;
    }
    if (bow.signature?.kind !== "rapid") return;
    let stage = 0;
    try {
      stage = stageOf(e.itemStack.getDynamicProperty(STAGE_KEY));
    } catch {
      stage = 0;
    }
    if (stage < 1) return;
    e.cancel = true;
    system.run(() => {
      if (p.isValid) scriptVolley(p);
    });
  });

  world.afterEvents.entitySpawn.subscribe((e) => {
    const arrow = e.entity;
    try {
      if (arrow?.typeId === ARROW && arrow.isValid) launched(arrow);
    } catch {
      // gone at once
    }
  });

  // Every hurt: each mob's hurt time (so what's added lands in full), what the game gave each of the bows' arrows,
  // and a Blaze-burnt mob's burning.
  world.afterEvents.entityHurt.subscribe((e) => {
    let tid;
    try {
      tid = e.hurtEntity.id;
    } catch {
      return;
    }
    const now = system.currentTick;
    if (e.damageSource?.cause === "override") return; // what the powers add: it never counts in the hurt time
    const w = hurtSeen(windows.get(tid), now, e.damage, P().hurtTicks);
    windows.set(tid, { start: w.start, level: w.level });
    let pid;
    try {
      pid = e.damageSource?.damagingProjectile?.id;
    } catch {
      pid = undefined;
    }
    if (pid && shots.has(pid)) struck.set(pid, { reported: e.damage, before: w.before, fresh: w.fresh });
    if (e.damageSource?.cause === "fireTick") {
      const b = burning.get(tid);
      if (b && now <= b.until && b.more > 0) {
        const t = e.hurtEntity;
        system.run(() => {
          if (t.isValid) addDamage(t, b.more);
        });
      }
    }
  });

  // Spreading Bloom: a mob that dies poisoned by a spreading cloud bursts into a new, smaller one.
  world.afterEvents.entityDie.subscribe((e) => {
    let id;
    try {
      id = e.deadEntity.id;
    } catch {
      return;
    }
    const b = blooming.get(id);
    if (!b) return;
    blooming.delete(id);
    if (system.currentTick > b.until || b.gen > P().spores.spreadGenerations) return;
    try {
      const at = { x: e.deadEntity.location.x, y: e.deadEntity.location.y + 0.5, z: e.deadEntity.location.z };
      sporeCloud(e.deadEntity.dimension, at, b.owner, { perSecond: b.perSecond, gen: b.gen, spread: true });
    } catch {
      // gone with it
    }
  });

  world.afterEvents.projectileHitEntity.subscribe((e) => {
    let id;
    try {
      id = e.projectile?.id;
    } catch {
      id = undefined;
    }
    const s = id ? shots.get(id) : undefined;
    if (!s) return;
    let hit;
    try {
      hit = e.getEntityHit()?.entity;
    } catch {
      hit = undefined;
    }
    s.landed = true;
    if (!hit || !foe(hit)) return; // anything else: the game's arrow, nothing more
    if (s.hit.has(hit.id)) {
      // A shot carried on through this mob met it again (it was knocked on along the flight): past it once more, no
      // second hit. A few times at most.
      if (s.carried && (s.again ?? 0) < P().againMax) {
        carryOn(e, s, hit, e.hitVector, true);
        if (s.extra) system.run(() => takeAway(id));
      }
      return;
    }
    s.hit.add(hit.id);
    struckFoe(s, id, hit, e);
  });

  // Where an arrow lands on the ground: its burst, its cloud or blast; an extra arrow goes at once (it can't be picked up).
  world.afterEvents.projectileHitBlock.subscribe((e) => {
    let id;
    try {
      id = e.projectile?.id;
    } catch {
      id = undefined;
    }
    const s = id ? shots.get(id) : undefined;
    if (!s) return;
    s.landed = true;
    endTrail(s, e.dimension, e.location);
    impact(s, e.dimension, e.location);
    if (s.extra) system.run(() => takeAway(id));
    else shots.delete(id);
  });

  // An extra arrow or a called vex left from before a reload, or in ground that was unloaded: gone as soon as it's seen.
  world.afterEvents.entityLoad.subscribe(({ entity }) => {
    try {
      if (entity.typeId === ARROW && !shots.has(entity.id) && entity.hasTag(EXTRA_TAG)) entity.remove();
      else if (entity.typeId === VEX_TYPE && !vexes.has(entity.id)) entity.remove();
    } catch {
      // gone
    }
  });
  system.runInterval(sweep, P().sweepTicks);
  system.runInterval(flight, 1);
}

/** One of the bows' arrows struck a hostile mob: what it's owed, and the bow's power and Signature on it. */
function struckFoe(s, id, hit, e) {
  let mult = s.mult * s.crit;
  try {
    if (s.bow.headshot > 1 && isHeadshot(e.location.y, hit.getHeadLocation().y, P().headshot)) {
      mult *= s.bow.headshot;
      e.dimension.spawnParticle("minecraft:critical_hit_emitter", e.location);
    }
  } catch {
    // no head to speak of
  }
  owe(hit, { arrow: id, owner: s.owner, expected: arrowDamage(hitSpeed(s)), mult });
  const sig = s.sig;
  const draw = s.drawPower ?? 1;
  if (s.kind === "vex" && s.full && !s.vexed) {
    s.vexed = true;
    callVexes(s.owner, hit, e.location, sig?.kind === "vex" ? sig.count : s.pw.count, s.nums);
  }
  if (s.kind === "burn") setBurning(hit, s.pw.perSecond * draw, s.pw.seconds);
  if (sig?.kind === "poison") poison(hit, sig.perSecond * draw, sig.seconds);
  if (sig?.kind === "lightning") {
    const c = { x: hit.location.x, y: hit.location.y + 1, z: hit.location.z };
    for (const m of foesAround(e.dimension, c, sig.radius, hit.id)) addDamage(m, sig.damage * draw, s.owner);
    fx(e.dimension, "spark", c);
    sound(e.dimension, { id: "mob.bee.sting", volume: 0.6, pitch: 1.8 }, c);
  }
  impact(s, e.dimension, e.location);
  if (s.left > 0) carryOn(e, s, hit, e.hitVector);
  else endTrail(s, e.dimension, e.location);
}

/**
 * How fast an arrow was going when it struck: the faster of its last two ticks (the tick it struck in, an arrow that
 * bounced off is already slow).
 */
function hitSpeed(s) {
  return Math.max(speedOf(s.vel), s.prev ? speedOf(s.prev) : 0);
}

/**
 * The shot carries on through `hit` (Scorpion, Sonic Bow, a Needle Signature): a new arrow just past it, as fast. `again`:
 * past a mob it had already gone through (that doesn't use up a mob).
 */
function carryOn(e, s, hit, dir, again = false) {
  const d = unit(dir ?? s.vel);
  const vel = scaled(d, hitSpeed(s));
  const probe = P().probe;
  let exit = 0;
  try {
    const back = e.dimension.getEntitiesFromRay(along(e.location, d, probe), scaled(d, -1), { maxDistance: probe }).find((r) => r.entity.id === hit.id);
    exit = back ? probe - back.distance : 0;
  } catch {
    exit = 0;
  }
  // The arrow knocks the mob on along its flight: start past where it's being knocked to, or the new arrow strikes it
  // again (inside its hurt time, where it would bounce off).
  let knock = 0;
  try {
    const mv = hit.getVelocity();
    knock = Math.max(0, mv.x * d.x + mv.y * d.y + mv.z * d.z) * P().knockTicks;
  } catch {
    knock = 0;
  }
  const o = { bow: s.bow, nums: s.nums, owner: s.owner, full: s.full, drawPower: s.drawPower, speed: s.speed, mult: s.mult, crit: s.full ? critRatio(hitSpeed(s)) : 1, range: s.range, from: s.from, left: again ? s.left : s.left - 1, hit: s.hit, lock: s.lock };
  const a = makeArrow(e.dimension, along(e.location, d, exit + P().past + knock), vel, o);
  const n = a ? shots.get(a.id) : undefined;
  if (n) {
    n.gone = s.gone;
    n.carried = true;
    n.again = again ? (s.again ?? 0) + 1 : 0;
  }
}

/** A trail along an arrow's flight from `from` to `to` (TwoDogs leaveTrail): none near the bow, sparks now and then. */
function leaveTrail(s, dim, from, to) {
  const t = s.trail;
  if (!t) return;
  if (typeof t === "string") return fx(dim, t, to);
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
  const l = speedOf(d);
  if (l < 0.01) return;
  const steps = Math.max(1, Math.ceil(l / t.spacing));
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    if (s.gone + l * f < (t.clear ?? 0)) continue;
    const at = along(from, d, f);
    for (const id of t.particles) fx(dim, id, at);
    s.trailPoints = (s.trailPoints ?? 0) + 1;
    if (t.sparks && s.trailPoints % (t.sparkEvery ?? 3) === 0) fx(dim, t.sparks, at);
  }
}

function endTrail(s, dim, at) {
  if (s.trailEnded || !s.trail || typeof s.trail !== "object") return;
  s.trailEnded = true;
  for (const id of s.trail.burst ?? []) fx(dim, id, at);
}

/** Each tick: the arrows' flight (range, trail, homing, the Scorpion's wide bolt), the clouds, poison, vexes, draws. */
function flight() {
  const now = system.currentTick;
  for (const [id, s] of shots) {
    if (now > s.until) {
      if (s.extra) takeAway(id);
      else shots.delete(id);
      continue;
    }
    const a = world.getEntity(id);
    if (!a?.isValid) {
      s.goneAt ??= now;
      if (now - s.goneAt > P().forgetTicks) shots.delete(id);
      continue;
    }
    let v;
    let pos;
    try {
      v = a.getVelocity();
      pos = a.location;
    } catch {
      continue;
    }
    if (speedOf(v) < g().stillSpeed) continue; // stuck in something
    const was = s.pos;
    s.prev = s.vel;
    s.vel = v;
    try {
      leaveTrail(s, a.dimension, was, pos);
      s.gone += travelled(was, pos);
      s.pos = pos;
      if (s.range && travelled(s.from, pos) > s.range) {
        endTrail(s, a.dimension, pos);
        takeAway(id); // the shot is spent
        continue;
      }
      if (s.kind === "homing") home(a, s, v, pos);
      if (s.sig?.kind === "wide") wide(a, s, was, pos);
    } catch {
      // gone this tick
    }
  }
  tickClouds(now);
  tickDots(now);
  tickVexes(now);
  tickDraws(now);
}

function tickClouds(now) {
  const S = P().spores;
  for (let i = clouds.length - 1; i >= 0; i--) {
    const c = clouds[i];
    if (now >= c.until) {
      clouds.splice(i, 1);
      continue;
    }
    if (now < c.next) continue;
    c.next = now + S.tickTicks;
    try {
      fx(c.dim, c.radius >= 2.2 ? "bloom_cloud" : "bloom_cloud_small", c.at);
      for (const m of c.dim.getEntities({ location: c.at, maxDistance: c.radius + S.reach, ...FOES })) {
        if (Math.abs(m.location.y + 0.9 - c.at.y) > S.height) continue;
        poison(m, c.perSecond, S.lingerSeconds);
        if (c.spread && c.gen < S.spreadGenerations) blooming.set(m.id, { gen: c.gen + 1, owner: c.owner, perSecond: c.perSecond, until: now + Math.round(S.lingerSeconds * 20) });
      }
    } catch {
      clouds.splice(i, 1);
    }
  }
}

function tickDots(now) {
  for (const [key, d] of dots) {
    if (!d.mob.isValid || now >= d.until) {
      dots.delete(key);
      continue;
    }
    if (now < d.next) continue;
    d.next = now + 20;
    addDamage(d.mob, d.perSecond);
    try {
      if (d.mob.isValid) fx(d.mob.dimension, "poison_burst", { x: d.mob.location.x, y: d.mob.location.y + 1, z: d.mob.location.z });
    } catch {
      // gone
    }
  }
}

/** A draw over: let go, its arrow away, or the bow out of the hand. Its length is kept for the arrow; the scope goes. */
function endDraw(p) {
  const d = draws.get(p.id);
  if (!d) return;
  draws.delete(p.id);
  if (d.scoped) scope(p, undefined);
  releases.set(p.id, { bowId: d.bowId, elapsed: system.currentTick - d.start, tick: system.currentTick });
}

/** The draws: the ready chime of a charging bow, and the Longbow Signature's scope while its player sneaks. */
function tickDraws(now) {
  for (const [pid, d] of draws) {
    const p = playerById(pid);
    if (!p) {
      draws.delete(pid);
      continue;
    }
    if (heldBowItem(p)?.bow.id !== d.bowId) {
      endDraw(p);
      continue;
    }
    const bow = bowOf(d.bowId);
    if (!d.ready && now >= d.readyAt) {
      d.ready = true;
      if (bow?.charge) sound(p.dimension, bow.charge.ready, p.location);
    }
    if (d.scope) {
      const want = p.isSneaking;
      if (want && !d.scoped) scope(p, d.scope.fov);
      else if (!want && d.scoped) scope(p, undefined);
      d.scoped = want;
    }
  }
}

/** The Longbow's scope: the view narrowed to `fov`, or back as it was. */
function scope(p, fov) {
  try {
    if (fov) p.camera.setFov({ fov, easeOptions: { easeTime: 0.15 } });
    else p.camera.setFov({ easeOptions: { easeTime: 0.1 } });
  } catch {
    try {
      if (!fov) p.camera.clear();
    } catch {
      // no camera to reset
    }
  }
}

/** The homing numbers of a shot: its Signature's, or its bow's. */
const homing = (s) => (s.sig?.kind === "homing" ? s.sig : s.pw);

/**
 * The Proximity Bow's lock (TwoDogs steer): the nearest hostile mob in its cone, within its range, that it can see from
 * `pos`, not yet struck by this shot. Its player hears the lock chime. Returns the mob, or undefined.
 */
function seek(dim, s, v, pos) {
  const H = homing(s);
  let t;
  let best = H.range;
  for (const m of dim.getEntities({ location: pos, maxDistance: H.range, ...FOES })) {
    if (s.hit.has(m.id)) continue;
    const c = chest(m);
    const to = { x: c.x - pos.x, y: c.y - pos.y, z: c.z - pos.z };
    const dd = speedOf(to);
    if (dd > best || !inSeekCone(v, to, H.coneDeg, H.range) || !clearPath(dim, pos, c)) continue;
    best = dd;
    t = m;
  }
  if (!t) return undefined;
  s.lock = t.id;
  try {
    const ow = /** @type {import("@minecraft/server").Player | undefined} */ (playerById(s.owner));
    ow?.playSound("random.orb", { pitch: 2, volume: 0.4 }); // the lock chime, to its player
  } catch {
    // gone
  }
  return t;
}

/** The Proximity Bow (TwoDogs steer): toward its lock while it can see it (a new lock when it can't), its turn a tick. */
function home(a, s, v, pos) {
  const H = homing(s);
  let t = s.lock ? world.getEntity(s.lock) : undefined;
  if (t && (!t.isValid || !clearPath(a.dimension, pos, chest(t)))) t = undefined;
  if (!t) {
    s.lock = undefined;
    t = seek(a.dimension, s, v, pos);
    if (!t) return;
  }
  // TwoDogs' turn a second is for its arrow's own speed (flightSpeed); ours flies faster, so it turns that much more a
  // tick, and curves as tightly for each block it flies.
  const c = chest(t);
  const turn = (H.turnPerSecond / 20) * (s.speed / (s.pw.flightSpeed ?? s.speed));
  const nv = scaled(unit(turnToward(v, { x: c.x - pos.x, y: c.y - pos.y, z: c.z - pos.z }, turn)), s.speed);
  a.clearVelocity();
  a.applyImpulse(nv);
  s.vel = nv;
}

/** The Scorpion's Signature: a wider bolt. Hostile mobs beside its flight (within the wider width) are struck too. */
function wide(a, s, from, to) {
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
  const l = speedOf(d);
  if (l < 0.05) return;
  const u = scaled(d, 1 / l);
  const r = P().wide.radius;
  const side = Math.hypot(u.x, u.z) > 0.01 ? unit({ x: -u.z, y: 0, z: u.x }) : { x: 1, y: 0, z: 0 };
  const starts = [along(from, side, r), along(from, side, -r), { x: from.x, y: from.y + r, z: from.z }, { x: from.x, y: from.y - r, z: from.z }];
  for (const st of starts) {
    let found;
    try {
      found = a.dimension.getEntitiesFromRay(st, u, { maxDistance: l });
    } catch {
      continue;
    }
    for (const { entity: m } of found) {
      if (s.left < 0 || s.hit.has(m.id) || !foe(m)) continue;
      s.hit.add(m.id);
      s.left--;
      addDamage(m, arrowDamage(speedOf(s.vel)) * s.mult * s.crit, s.owner);
    }
  }
}

/** Every few seconds: hurt times long over are forgotten, and any extra arrow nobody follows any more goes. */
function sweep() {
  const now = system.currentTick;
  if (!settling) struck.clear(); // what the game gave arrows that struck nothing the powers go after
  for (const [id, w] of windows) if (now - w.start >= P().hurtTicks) windows.delete(id);
  for (const [id, b] of burning) if (now > b.until) burning.delete(id);
  for (const [id, b] of blooming) if (now > b.until) blooming.delete(id);
  for (const [id, r] of releases) if (now - r.tick > 40) releases.delete(id);
  for (const [id, b] of bonus) if (now > b.until) bonus.delete(id);
  for (const dimId of DIMENSIONS) {
    try {
      for (const a of world.getDimension(dimId).getEntities({ type: ARROW, tags: [EXTRA_TAG] })) if (!shots.has(a.id)) a.remove();
    } catch {
      // that dimension isn't loaded
    }
  }
}

/** Bench and test only: the arrows being followed, the clouds, poison, burning, the vexes. */
export function shotsDebug() {
  return {
    shots: [...shots.entries()].map(([id, s]) => ({ id, bow: s.bow.id, kind: s.kind, extra: s.extra, left: s.left, full: s.full, draw: Math.round((s.drawPower ?? 1) * 1000) / 1000, raw: s.raw === undefined ? undefined : Math.round(s.raw * 1000) / 1000, speed: Math.round(s.speed * 1000) / 1000, crit: Math.round(s.crit * 1000) / 1000, mult: Math.round(s.mult * 1000) / 1000, landed: s.landed, hit: [...s.hit] })),
    clouds: clouds.map((c) => ({ r: Math.round(c.radius * 100) / 100, gen: c.gen, perSecond: c.perSecond })),
    dots: dots.size,
    burning: [...burning.keys()],
    vexes: vexes.size,
    windows: windows.size,
    draws: [...draws.values()].map((d) => d.bowId),
  };
}
