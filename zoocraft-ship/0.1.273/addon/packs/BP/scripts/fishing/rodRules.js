// ZooCraft's own fishing rods (0.1.269, Austin 12 Nov: "Steel rod ... This should all work like the vanilla rod"): the
// parts with no game in them. The game's own hook only stays out for the game's own rod, so a ZooCraft rod does the
// whole of fishing itself (fishing/rods.js) with the game's numbers: data/balance.js `rods`. Where the wiki gives no
// Bedrock number (the cast), it was measured from the game's own rod on Mojang's server (12 Nov, research/rods.md).
//
// The cast, as the game's hook flies (measured tick by tick): it leaves 1.24 over the player's feet (0.28 under the head
// location the game gives, 1.52 up), 0.15 ahead, at
// 2.392 blocks a tick along the look; each tick it moves by its speed and 0.074 down, then keeps 0.911 of its speed
// and loses 0.159 up. A level cast from a bank lands about 11.5 blocks out, one 45 degrees up about 16. The same
// flight as one projectile (speed then gravity each tick): inertia 0.911 and gravity 0.1656 from a start 0.074 lower.

export const STEEL_ROD = "zoocraft:steel_rod";
export const DEEP_SEA_ROD = "zoocraft:deep_sea_rod";
export const BOBBER = "zoocraft:fishing_bobber";

// 0.1.273 (Austin: "make it work like the vanilla casts, and have smooth animations and transitions"): a ZooCraft rod's
// use gets no arm swing from the game, so it plays one (RP animations/zoocraft_rod_swing.animation.json, the game's
// own swing over its 0.3 seconds) on its own controller, so nothing else the player plays is cut off.
export const SWING = { animation: "animation.zoocraft.rod.swing", controller: "controller.animation.zoocraft.rod_swing" };

// Each rod: its reach (how many times the game's cast it flies) and whether it takes tackle (0.1.271: a lure, at the
// Tackle Box). The Deep Sea Rod (0.1.271, Austin: "takes tackle, casts 3x as far").
export const RODS = {
  [STEEL_ROD]: { id: STEEL_ROD, name: "Steel Rod", reach: 1, tackle: true },
  [DEEP_SEA_ROD]: { id: DEEP_SEA_ROD, name: "Deep Sea Rod", reach: 3, tackle: true },
};

/** The rod a held item is, or undefined. */
export function rodOf(typeId) {
  return typeof typeId === "string" ? RODS[typeId] : undefined;
}

const unit = (v) => {
  const n = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / n, y: v.y / n, z: v.z / n };
};

/**
 * Where the bobber leaves and how fast (blocks a tick), for a player's eyes and view direction: the game's start,
 * as the projectile's first step. `reach` scales the speed so the rod casts that many times as far (castScale).
 */
export function castStart(eye, view, c, reach = 1) {
  const d = unit(view);
  const flat = Math.hypot(d.x, d.z) || 1;
  const k = c.speed * castScale(reach, c);
  return {
    pos: { x: eye.x + (d.x / flat) * c.ahead, y: eye.y - c.below, z: eye.z + (d.z / flat) * c.ahead },
    vel: { x: d.x * k, y: d.y * k - c.drop, z: d.z * k },
  };
}

/** One tick of the bobber's flight: it moves by its speed, then keeps `inertia` of it and loses `gravity` up. */
export function flightStep(pos, vel, c) {
  return {
    pos: { x: pos.x + vel.x, y: pos.y + vel.y, z: pos.z + vel.z },
    vel: { x: vel.x * c.inertia, y: vel.y * c.inertia - c.gravity, z: vel.z * c.inertia },
  };
}

/** How far along the ground a cast from `eye` looking `view` flies before it comes down through `surfaceY`. */
export function castDistance(eye, view, surfaceY, c, reach = 1) {
  let { pos, vel } = castStart(eye, view, c, reach);
  const from = pos;
  for (let t = 0; t < 400; t++) {
    const next = flightStep(pos, vel, c);
    if (next.pos.y <= surfaceY) {
      const k = (pos.y - surfaceY) / Math.max(1e-9, pos.y - next.pos.y);
      const x = pos.x + (next.pos.x - pos.x) * k;
      const z = pos.z + (next.pos.z - pos.z) * k;
      return Math.hypot(x - eye.x, z - eye.z);
    }
    ({ pos, vel } = next);
  }
  return Math.hypot(pos.x - from.x, pos.z - from.z);
}

/**
 * The speed scale that makes a cast fly `reach` times as far as the game's (a level cast from a bank 1.62 above the
 * water's top, the usual cast). 1 for the game's own reach. Found once per reach by halving.
 */
const scales = new Map();
export function castScale(reach, c) {
  if (!(reach > 1)) return 1;
  const key = `${reach}:${c.speed}:${c.inertia}:${c.gravity}:${c.drop}:${c.below}`;
  if (scales.has(key)) return scales.get(key);
  const eye = { x: 0, y: 1.62, z: 0 };
  const view = { x: 1, y: 0, z: 0 };
  const base = castDistance(eye, view, 0, c, 1);
  let lo = 1;
  let hi = reach * 2;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const d = castDistance(eye, view, 0, { ...c, speed: c.speed * mid }, 1);
    if (d < base * reach) lo = mid;
    else hi = mid;
  }
  scales.set(key, (lo + hi) / 2);
  return (lo + hi) / 2;
}

/**
 * Where a bobber that came down into water comes to rest, as the game's hook does: from where its flight (`start`, the
 * cast's start) crosses the water's top, on by `slide` times the last tick's move along the ground (the game's hook
 * comes to rest 12.84 blocks out from a level cast and 16.15 from a 45-degree one; this gives 12.72 and 16.30).
 * Worked out from the cast itself, so it's the same whichever way the game and the script share a tick.
 */
export function restPoint(start, floatY, c, slide) {
  let { pos, vel } = start;
  let prev = pos;
  for (let i = 0; i < 400 && pos.y > floatY; i++) {
    prev = pos;
    ({ pos, vel } = flightStep(pos, vel, c));
  }
  const k = prev.y > pos.y ? Math.min(1, Math.max(0, (prev.y - floatY) / (prev.y - pos.y))) : 1;
  const step = { x: pos.x - prev.x, z: pos.z - prev.z };
  return { x: prev.x + step.x * k + step.x * slide, z: prev.z + step.z * k + step.z * slide, dir: step };
}

/**
 * Ticks from the bobber settling to a fish starting toward it, as the game's: 100 to 600, Lure taking 100 off both
 * ends for each level; a wait that would come out at nothing is rolled again, so it's anywhere up to the top.
 * Undefined when nothing will ever come (Lure high enough to take the top below a tick, as the game's past V).
 */
export function waitTicks(lure, random, w) {
  const off = Math.max(0, lure ?? 0) * w.perLure;
  const hi = w.max - off;
  if (hi < 1) return undefined;
  const lo = Math.max(1, w.min - off);
  return Math.round(lo + random() * (hi - lo));
}

/**
 * The wait's scale for where the bobber floats, as the game counts it down: each tick it counts 1, and in rain one tick
 * in four counts 2, and with no open sky above it one tick in two counts nothing. So twice as long under a roof, a
 * fifth shorter in rain under open sky, a third longer in rain under a roof.
 */
export function waitScale(open, raining, w) {
  const rate = 1 + (raining ? w.rainSpeed : 0) - (open ? 0 : w.roofSlow);
  return 1 / rate;
}

/** Whether a block above the bobber keeps the sky off it (the game's: glass and carpet don't, leaves and ice do). */
export function covers(typeId) {
  if (typeof typeId !== "string" || typeId === "minecraft:air" || typeId === "minecraft:light_block" || /^minecraft:light_block_/.test(typeId)) return false;
  if (/glass|carpet|water|_pane$/.test(typeId)) return false;
  return true;
}

/** Ticks a fish takes coming in once it starts (its ripple trail), 20 to 80. */
export function approachTicks(random, a) {
  return a.min + Math.floor(random() * (a.max - a.min + 1));
}

/** Where the fish's ripple is, `left` ticks from the bobber: the game's trail comes in on a slow curve. */
export function rippleAt(bobber, angle, left, total) {
  const k = Math.max(0, left) / Math.max(1, total);
  const r = 0.5 + 6 * k;
  const a = angle + Math.sin(k * Math.PI * 2) * 0.5;
  return { x: bobber.x + Math.sin(a) * r, y: bobber.y, z: bobber.z + Math.cos(a) * r };
}

/** The catch's three kinds and their chances out of the total for `luck` (Luck of the Sea's level): the game's table. */
export function catchOdds(luck, k) {
  const L = Math.max(0, luck ?? 0);
  const out = {};
  for (const kind of ["junk", "treasure", "fish"]) out[kind] = Math.max(0, k.weights[kind] + k.quality[kind] * L);
  return out;
}

/** Which kind a catch is: junk, treasure or fish, by the game's odds. */
export function catchKind(luck, random, k) {
  const odds = catchOdds(luck, k);
  const total = odds.junk + odds.treasure + odds.fish;
  let r = random() * total;
  for (const kind of ["junk", "treasure", "fish"]) {
    if (r < odds[kind]) return kind;
    r -= odds[kind];
  }
  return "fish";
}

/** The game's loot table for a kind of catch (a jungle has its own junk and fish). */
export function lootPath(kind, jungle) {
  if (kind === "treasure") return "gameplay/fishing/treasure";
  return `gameplay/fishing/${jungle ? "jungle_" : ""}${kind === "junk" ? "junk" : "fish"}`;
}

/** Wear a reel costs, as the game's rod: a catch 1, the bobber caught in a block 2, a mob hooked 5, nothing 0. */
export function wearOf(outcome, k) {
  return k.wear[outcome] ?? 0;
}

/** How much of `n` wear Unbreaking lets through: each point only one time in (level + 1), as the game's tools. */
export function paidWear(n, unbreaking, random) {
  let paid = 0;
  for (let i = 0; i < n; i++) if (random() < 1 / ((unbreaking ?? 0) + 1)) paid++;
  return paid;
}

/** The XP a catch gives, 1 to 6 as the game's. */
export function catchXp(random, k) {
  return k.xp.min + Math.floor(random() * (k.xp.max - k.xp.min + 1));
}

/** Mending on the rod: 2 durability back for each point of a catch's XP, the rest of the XP to the player. */
export function mend(xp, damage, perXp) {
  const repair = Math.min(Math.max(0, damage), xp * perXp);
  const used = Math.ceil(repair / perXp);
  return { repair, xp: xp - used };
}

/**
 * How far the bobber may be from the player before the line snaps (the bobber's gone, no wear): the game's 32 blocks
 * times the rod's reach, and never past `maxLine` (0.1.271: so a Deep Sea cast stays where the world around a player
 * still moves on the smallest simulation distance).
 */
export function lineLimit(reach, k) {
  return Math.min(k.lineBreak * Math.max(1, reach ?? 1), k.maxLine ?? Infinity);
}

/** Whether the line snaps at `dist` blocks. */
export function lineTooLong(dist, reach, k) {
  return dist > lineLimit(reach, k);
}

/**
 * A catch thrown from the bobber to the player: a fish flies in an arc and lands in their hands. The game's items fall
 * `gravity` then move then keep `drag` of their speed each tick (measured), so the throw is worked out to reach
 * `aimUp` over the player's feet after a tick a block (`perBlock`, between `min` and `max` ticks).
 */
export function throwToward(from, to, t) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const dy = to.y + t.aimUp - from.y;
  const ticks = Math.max(t.min, Math.min(t.max, Math.round(Math.hypot(dx, dz) * t.perBlock)));
  const s = (1 - Math.pow(t.drag, ticks)) / (1 - t.drag); // how far a speed of 1 carries in that many ticks
  const fall = (t.gravity / (1 - t.drag)) * (ticks - s); // and how far the falling takes it down
  return { x: dx / s, y: (dy + fall) / s + t.gravity, z: dz / s, ticks };
}

/** Where an item thrown at `v` is after `ticks`, by the game's item flight (for the tests). */
export function itemAt(from, v, ticks, t) {
  let p = { ...from };
  let u = { x: v.x, y: v.y, z: v.z };
  for (let i = 0; i < ticks; i++) {
    u = { ...u, y: u.y - t.gravity };
    p = { x: p.x + u.x, y: p.y + u.y, z: p.z + u.z };
    u = { x: u.x * t.drag, y: u.y * t.drag, z: u.z * t.drag };
  }
  return p;
}

/** A hooked mob reeled in: a tenth of the way to the player, as the game's. */
export function pullToward(from, to, k) {
  return { x: (to.x - from.x) * k.pull, y: (to.y - from.y) * k.pull, z: (to.z - from.z) * k.pull };
}

/** The rod's tip, for the line's end: ahead of the player's eyes, to the right and a little down. */
export function tipOf(eye, view, t) {
  const d = unit(view);
  const flat = Math.hypot(d.x, d.z) || 1;
  // right of the look, flat on the ground (the player's right is the view turned clockwise seen from above)
  const r = { x: -d.z / flat, z: d.x / flat };
  return { x: eye.x + d.x * t.ahead + r.x * t.right, y: eye.y + d.y * t.ahead - t.down, z: eye.z + d.z * t.ahead + r.z * t.right };
}

/**
 * The speed (blocks a tick) that takes the bobber from `at` to `to` in its next tick (0.1.273): it glides there, where a
 * teleport would hop (the game never smooths a teleport).
 */
export function glide(at, to) {
  return { x: to.x - at.x, y: to.y - at.y, z: to.z - at.z };
}

/** Whether the rod's tip has moved enough from where the bobber last heard it to send it again. */
export function lineMoved(a, b, step) {
  return !a || Math.abs(a.x - b.x) >= step || Math.abs(a.y - b.y) >= step || Math.abs(a.z - b.z) >= step;
}

/** The fishing state's next step when the player uses the rod: with no bobber out, cast; with one out, reel in. */
export function onUse(state) {
  return state ? "reel" : "cast";
}

/** What a reel gets, from the bobber's state: a catch on a bite, nothing early or late, the block or mob it holds. */
export function reelOutcome(state, tick) {
  if (!state) return "none";
  if (state.hooked) return "entity";
  if (state.stuck) return "block";
  if (state.phase === "bite" && tick <= state.biteEnds) return "catch";
  return "none";
}

// --- tackle (0.1.271, Austin 12 Nov: spoons for more bites, a lure for rarer catches, and artificial worms for both,
// slightly). A lure goes on a rod that takes tackle at the Tackle Box (fishing/tackleBox.js), one at a time, and stays
// on until it's changed; it never wears out. What each adds: data/balance.js rods.lures. The rarer-catch lure is our
// Spinnerbait: the name Austin used is a lure maker's (playtest/NPC_batch3_suggestions.md).
export const TACKLE_BOX = "zoocraft:tackle_box";
export const LURE_KEY = "zoocraft:lure"; // the lure's id, on the rod item itself
export const LURES = {
  "zoocraft:spoon": { id: "zoocraft:spoon", key: "spoon", name: "Spoon", short: "Bites come sooner", does: "Bites come sooner: one more level of Lure." },
  "zoocraft:spinnerbait": { id: "zoocraft:spinnerbait", key: "spinnerbait", name: "Spinnerbait", short: "Rarer catches", does: "Rarer catches: one more level of Luck of the Sea." },
  "zoocraft:artificial_worm": { id: "zoocraft:artificial_worm", key: "worm", name: "Artificial Worm", short: "A little of both", does: "A little of both: half a level of Lure and half of Luck of the Sea." },
};

/** The lure an item or a rod's stored lure id is, or undefined. */
export function lureOf(typeId) {
  return typeof typeId === "string" ? LURES[typeId] : undefined;
}

/** The levels a rod fishes at: its own Lure and Luck of the Sea, with its lure's on top (`L`: rods.lures). */
export function fishingLevels(lure, luck, tackle, L) {
  const t = tackle ? L?.[tackle.key] : undefined;
  return { lure: (lure ?? 0) + (t?.lure ?? 0), luck: (luck ?? 0) + (t?.luck ?? 0) };
}

/** A rod's lore for its lure: one line, or none for a bare rod. */
export function lureLore(tackle) {
  return tackle ? [`§7Lure: ${tackle.name}`] : [];
}

/** What's still missing to make something: [[item, how many more]], for a cost [[item, n]] and the counts carried. */
export function missingFor(have, cost) {
  return (cost ?? []).map(([id, n]) => [id, n - (have?.[id] ?? 0)]).filter(([, n]) => n > 0);
}
