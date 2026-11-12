// Guido's bows and his Bow Case (0.1.261), the parts with no game in them: which items are bows, each bow's numbers, who
// may look and trade, and the checks that keep a trade from ever doubling a bow; 0.1.263 the bows' powers (the aim of a
// volley, a headshot, a turn, what a mob is still owed); 0.1.264 TwoDogs' own (its fan and ring, the draw's power, the
// Sonic Bow's pull, the Vexcaller's healing) and the Signatures and upgrades Guido sells. Runtime: guido/bowCase.js,
// bowShots.js.
import { BOWS, GAME_BOWS } from "../data/bows.js";

export const GUIDO_ID = "guido";
export const BOW_IDS = new Set(BOWS.map((b) => b.id));
const BY_ID = new Map(BOWS.map((b) => [b.id, b]));

/** A bow Guido keeps: one of ZooCraft's fifteen or the game's bow and crossbow. */
export function isCaseBow(typeId) {
  return BOW_IDS.has(typeId) || GAME_BOWS.includes(typeId);
}

/** One of ZooCraft's fifteen. */
export function bowOf(typeId) {
  return BY_ID.get(typeId);
}

/** A bow's power: how much faster (and harder, and farther) its arrows fly than the game's bow's. */
export function powerOf(damage, g) {
  const p = Math.sqrt(Math.max(0, damage) / g.baseDamage);
  return Math.round(Math.min(g.maxPower, Math.max(g.minPower, p)) * 100) / 100;
}

/** What a player may do at the case by friendship tier (0 Stranger .. 4 Best Friend). */
export function caseAccess(tier, g) {
  return { look: tier >= g.lookTier, trade: tier >= g.tradeTier };
}

/** A trade is open once a day per player. */
export function tradeOpen(lastDay, today) {
  return lastDay !== today;
}

/**
 * What identifies one bow in a slot, so a trade or an upgrade can check that nothing moved between the page and the
 * swap: its kind, its name, its wear, its enchantments and (0.1.264) its upgrade stage (`it` is a plain record: typeId,
 * nameTag, damage, enchants [[id, level]], stage).
 */
export function fingerprint(it) {
  if (!it?.typeId) return "";
  const ench = [...(it.enchants ?? [])].map(([id, lvl]) => `${id}:${lvl}`).sort().join(",");
  return `${it.typeId}|${it.nameTag ?? ""}|${it.damage ?? 0}|${ench}|${it.stage ?? 0}`;
}

/** Whether both sides of a trade still hold what the pages showed. */
export function tradeStillGood(offer, now) {
  return Boolean(offer.mine && offer.his && now.mine && now.his) && fingerprint(offer.mine) === fingerprint(now.mine) && fingerprint(offer.his) === fingerprint(now.his);
}

/** The bows to stock a new collection with: one of each of ZooCraft's fifteen, in the table's order. */
export function stockList() {
  return BOWS.map((b) => b.id);
}

/** How worn a bow is, in words. */
export function wearText(damage, max) {
  if (!max) return "never wears";
  const left = Math.max(0, Math.round(((max - (damage ?? 0)) / max) * 100));
  return left >= 100 ? "like new" : `${left}% left`;
}

/** An enchantment id in words ("minecraft:power" 5 -> "Power V"). */
export function enchantText(id, level) {
  const name = String(id).replace(/^minecraft:/, "").split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][level] ?? String(level);
  return `${name} ${roman}`;
}

/** The case's count line for Guido's page. */
export function caseText(n, size) {
  return `${n} bow${n === 1 ? "" : "s"} in his Bow Case (room for ${size})`;
}

// ---- 0.1.263: the bows' TwoDogs powers with the game's arrows (Austin, 12 Nov: "I want all the abilities the same for
// each bow, just use vanilla arrows only instead"). The parts with no game in them; runtime: guido/bowShots.js.

const len = (v) => Math.hypot(v.x, v.y, v.z);
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const rad = (deg) => (deg * Math.PI) / 180;

/** `v` at length 1 (straight ahead, south, for nothing). */
export function unit(v) {
  const l = len(v);
  return l > 1e-9 ? { x: v.x / l, y: v.y / l, z: v.z / l } : { x: 0, y: 0, z: 1 };
}

/** `v` times `k`. */
export function scaled(v, k) {
  return { x: v.x * k, y: v.y * k, z: v.z * k };
}

/** `a` plus `b` times `k`. */
export function along(a, b, k = 1) {
  return { x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k };
}

/** Two directions square to a flight `d` (length 1) and to each other: to its right (level) and up. */
export function basis(d) {
  let r = cross(d, { x: 0, y: 1, z: 0 });
  if (len(r) < 1e-6) r = { x: 1, y: 0, z: 0 }; // straight up or down
  r = unit(r);
  return { r, u: unit(cross(r, d)) };
}

/** A direction `deg` degrees off `d`, turned `around` degrees about it (0 to its right, 90 up). */
export function offAxis(d, deg, around) {
  const { r, u } = basis(d);
  const s = Math.sin(rad(deg));
  const c = Math.cos(rad(deg));
  const cb = Math.cos(rad(around));
  const sb = Math.sin(rad(around));
  return unit({ x: d.x * c + (r.x * cb + u.x * sb) * s, y: d.y * c + (r.y * cb + u.y * sb) * s, z: d.z * c + (r.z * cb + u.z * sb) * s });
}

/** `d` turned `deg` degrees about the up axis (TwoDogs' rotateYaw: its height stays). */
export function yawTurn(d, deg) {
  const a = rad(deg);
  return { x: d.x * Math.cos(a) - d.z * Math.sin(a), y: d.y, z: d.x * Math.sin(a) + d.z * Math.cos(a) };
}

/** `d` laid level, at length 1. */
export function level(d) {
  const l = Math.hypot(d.x, d.z) || 1;
  return { x: d.x / l, y: 0, z: d.z / l };
}

/**
 * 0.1.264, TwoDogs' volleyDirs for pellets (the Scrap Bow, the Twin Fang): `n` arrows fanned evenly across `spreadDeg`
 * about the aim `d`, level (turned about the up axis), none straight down the middle when there are two or more.
 */
export function fanDirs(d, n, spreadDeg) {
  if (n <= 1) return [d];
  return Array.from({ length: n }, (_, i) => yawTurn(d, spreadDeg * (i / (n - 1) - 0.5)));
}

/** TwoDogs' radial ring (the Ballista): `n` arrows flat round the player's level facing, the first straight ahead. */
export function radialDirs(d, n) {
  const f = level(d);
  return Array.from({ length: n }, (_, i) => yawTurn(f, (360 / n) * i));
}

/**
 * How many arrows of a volley fly, by the arrows there are (TwoDogs: the extra ones are paid for as they fire): the
 * first is the bow's own; the rest of `full` in step with the `extraAmmo` found of the `perShot - 1` more it takes.
 */
export function volleyCount(full, perShot, extraAmmo) {
  if (full <= 1) return 1;
  if (perShot <= 1) return full;
  return 1 + Math.floor(((full - 1) * Math.max(0, Math.min(perShot - 1, extraAmmo))) / (perShot - 1));
}

/**
 * TwoDogs' bow power for a draw `elapsed` ticks long of one that takes `drawTicks`: the game's curve (c^2 + 2c) / 3,
 * full 0.1 s (2 ticks) before the draw time (its "ready .1 seconds before the green"), never under 0.1.
 */
export function drawPower(elapsed, drawTicks) {
  const c = Math.min(1, Math.max(0, elapsed) / Math.max(1, drawTicks - 2));
  return Math.max(0.1, Math.min(1, (c * c + 2 * c) / 3));
}

/** A headshot (every bow's, TwoDogs'): the arrow struck from a little below a mob's eye height to the top of its head. */
export function isHeadshot(hitY, eyeY, g) {
  return hitY >= eyeY - g.below && hitY <= eyeY + g.above;
}

/** Whether a mob `to` away (from the arrow) is within `reach` and within `coneDeg` of the arrow's flight `v`. */
export function inSeekCone(v, to, coneDeg, reach) {
  const l = len(to);
  if (l > reach || l < 1e-6) return false;
  return dot(unit(v), unit(to)) >= Math.cos(rad(coneDeg));
}

/** The Proximity Bow's turn: flight `v` turned at most `maxDeg` toward `to`, at the same speed. */
export function turnToward(v, to, maxDeg) {
  const sp = len(v);
  const a = unit(v);
  const b = unit(to);
  const c = Math.max(-1, Math.min(1, dot(a, b)));
  if (Math.acos(c) <= rad(maxDeg)) return scaled(b, sp);
  const side = unit(along(b, a, -c)); // the part of b square to a
  const m = rad(maxDeg);
  return scaled(unit(along(scaled(a, Math.cos(m)), side, Math.sin(m))), sp);
}

/** How far a shot has come since `from`. */
export function travelled(from, at) {
  return len({ x: at.x - from.x, y: at.y - from.y, z: at.z - from.z });
}

/**
 * A mob's hurt time after a hurt of `damage` at tick `now` (`w` its window before: { start, level }). The game's rule:
 * a hurt inside the hurt time only adds what's more than the hurt time's biggest, so the window's level is what has
 * been dealt in it. fresh: this hurt opened a new window; before: the level before this hurt.
 */
export function hurtSeen(w, now, damage, ticks) {
  if (!w || now - w.start >= ticks) return { start: now, level: damage, fresh: true, before: 0 };
  return { start: w.start, level: w.level + damage, fresh: false, before: w.level };
}

/**
 * What a bow's arrows that struck one mob in one tick still owe it. Each counts in full (a headshot `mult` times),
 * less what the game already gave. hits: [{ reported, before, fresh, expected, mult, inWindow }]: reported is what the
 * game gave that arrow; none means it bounced off, which is the hurt time's doing only while the mob is inside one
 * (inWindow), when it's owed what it would have done (expected, arrowDamage). Outside one the mob simply took nothing
 * from arrows (it can't be hurt by them now), and nothing is owed.
 */
export function owedDamage(hits) {
  let want = 0;
  let got = 0;
  for (const h of hits) {
    const full = h.reported === undefined ? (h.inWindow ? h.expected : 0) : h.fresh ? h.reported : h.before + h.reported;
    want += full * (h.mult ?? 1);
    got += h.reported ?? 0;
  }
  return Math.max(0, Math.round((want - got) * 100) / 100);
}

/** The game's arrow hits for twice its speed (blocks a tick), rounded up: what one made by script does. */
export function arrowDamage(speed) {
  return Math.ceil(2 * speed - 1e-9);
}

/** Families the powers never go after: the zoo's own, and players. */
export const NOT_FOES = ["zoocraft_mob", "zoocraft_animal", "zoocraft_boss", "player"];

/** A hostile mob the powers go after: a monster that isn't one of the zoo's (a zoo or calmed mob, an animal, a boss). */
export function isFoe(families) {
  return families.includes("monster") && !families.some((f) => NOT_FOES.includes(f));
}

/** The oldest of a player's called vexes, spores clouds and the like to let go when there are more than `max`. */
export function overMax(list, max) {
  return list.length > max ? list.slice(0, list.length - max) : [];
}

/**
 * A full draw's arrow from the game's bow is a critical one: on the test server it struck for 2.5 times its speed and 1
 * on average, where one made by script (no critical) strikes for arrowDamage. What a fully drawn script arrow is owed
 * on top, as a multiple.
 */
export function critRatio(speed) {
  const plain = arrowDamage(speed);
  return plain > 0 ? (2.5 * speed + 1) / plain : 1;
}

// ---- 0.1.264: Signatures and upgrades (TwoDogs combat/upgrades.js: Base -> Signature -> U1 -> U2 -> U3, one stage at a
// time; here bought from Guido). The stage lives on the bow itself (an item property), so it trades and stays with it.

export const STAGE_KEY = "zoocraft:bow_stage";
export const STAGE_NAMES = ["", "Signature", "Signature, Upgrade I", "Signature, Upgrade II", "Signature, Upgrade III"];

/** A stage read off a bow (0 to 4; anything else is 0). */
export function stageOf(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 && n <= 4 ? n : 0;
}

/**
 * What a bow at `stage` does differently (TwoDogs: U1 damage x1.10; U2 draw x0.90, the Scrap Bow 10% tighter spread
 * instead, an instant bow (the Ballista) reloads x0.90 instead; U3 damage x1.20 in all; a bow with its own stages (the
 * Vexcaller) takes those instead, with no draw change). signature: the bow's Signature, from stage 1. heal / overflow:
 * the Vexcaller's Restoring Shot (U1) and Overflowing (U2).
 */
export function numbersAt(bow, stage, U) {
  const s = stageOf(stage);
  const u = Math.max(0, s - 1); // TwoDogs' upgrade count: 0 at the Signature, 1 at U1 ...
  const own = bow.stages;
  const damage = own ? own.damage[u] ?? 1 : u >= 3 ? U.u3Damage : u >= 1 ? U.u1Damage : 1;
  const two = !own && u >= 2;
  return {
    signature: s >= 1 ? bow.signature : undefined,
    damage,
    draw: two && !bow.spreadInsteadOfDraw && !bow.instant ? U.u2Draw : 1,
    spread: two && bow.spreadInsteadOfDraw ? U.u2Spread : 1,
    recovery: two && bow.instant ? U.u2Recovery : 1,
    heal: own && bow.power?.kind === "vex" && u >= 1 ? U.heal : 0,
    overflow: Boolean(own && bow.power?.kind === "vex" && u >= 2),
  };
}

const times = (m) => `x${m.toFixed(2).replace(/0$/, "")}`;
const round1 = (v) => Math.round(v * 10) / 10;

/** The next stage for a bow at `stage`, for Guido's page: { stage, label, cost, line }, or undefined at the top. */
export function nextStage(bow, stage, U) {
  const s = stageOf(stage);
  if (s >= 4) return undefined;
  if (s === 0) return { stage: 1, label: "Signature", cost: U.signatureCost, line: bow.signature.text };
  const label = ["Upgrade I", "Upgrade II", "Upgrade III"][s - 1];
  if (bow.stages) return { stage: s + 1, label, cost: U.stageCost, line: bow.stages.text[s - 1] };
  if (s === 1) return { stage: 2, label, cost: U.stageCost, line: `Damage ${times(U.u1Damage)}: ${bow.damage} to ${round1(bow.damage * U.u1Damage)}` };
  if (s === 2) {
    if (bow.spreadInsteadOfDraw) return { stage: 3, label, cost: U.stageCost, line: "Spread 10% tighter (no draw to shorten)" };
    if (bow.instant) return { stage: 3, label, cost: U.stageCost, line: `Reload ${bow.recovery}s to ${Math.round(bow.recovery * U.u2Recovery * 1000) / 1000}s` };
    return { stage: 3, label, cost: U.stageCost, line: `Draw time ${bow.draw}s to ${Math.round(bow.draw * U.u2Draw * 100) / 100}s` };
  }
  return { stage: 4, label, cost: U.stageCost, line: `Damage ${times(U.u3Damage)} in all: ${round1(bow.damage * U.u1Damage)} to ${round1(bow.damage * U.u3Damage)}` };
}

/** The lines a bow at `stage` carries under its name (TwoDogs' lore). */
export function stageLore(bow, stage, U) {
  const s = stageOf(stage);
  if (s === 0) return [];
  const lore = [`§dSignature: ${bow.signature.text}`];
  if (bow.stages) {
    for (let k = 2; k <= s; k++) lore.push(`${["§b", "§3", "§6"][k - 2]}U${k - 1}: ${bow.stages.text[k - 2]}`);
    return wrapLore(lore);
  }
  if (s >= 2) lore.push(`§bU1: damage ${times(U.u1Damage)}`);
  if (s >= 3) lore.push(bow.spreadInsteadOfDraw ? "§3U2: tighter spread" : bow.instant ? `§3U2: reload ${times(U.u2Recovery)}` : `§3U2: draw ${times(U.u2Draw)}`);
  if (s >= 4) lore.push(`§6U3: damage ${times(U.u3Damage)} in all`);
  return wrapLore(lore);
}

/**
 * Lore lines held to the game's limits (ItemStack.setLore: 20 lines of at most 50 characters), broken at spaces; a
 * line's colour carries on to the lines it's broken into.
 */
export function wrapLore(lines, width = 50) {
  const out = [];
  for (const line of lines) {
    const m = /^((?:§.)*)([\s\S]*)$/.exec(line);
    const code = m[1];
    let rest = m[2];
    const room = Math.max(10, width - code.length);
    while (rest.length > room) {
      let cut = rest.lastIndexOf(" ", room);
      if (cut <= 0) cut = room;
      out.push(code + rest.slice(0, cut));
      rest = rest.slice(cut).trimStart();
    }
    out.push(code + rest);
  }
  return out.slice(0, 20);
}

/**
 * The Sonic Bow's pull (TwoDogs combat/sonic.js): its full-draw arrow flies dead straight `length` blocks from `from`
 * along `d` (length 1). Every mob (at `pos`, its feet) within `pullRadius` of that line is brought to the point of the
 * line beside it: those behind the shooter come round to the front, none lands nearer than `minAhead`, and they're set
 * down `spacing` apart, nearest first. [{ id, t, at }]: t is how far along the line.
 */
export function sonicPlan(from, d, length, mobs, g) {
  const found = [];
  for (const m of mobs) {
    const v = { x: m.pos.x - from.x, y: m.pos.y + 1 - from.y, z: m.pos.z - from.z };
    const t = dot(v, d);
    const off = len(along(v, d, -t));
    if (off > g.pullRadius) continue;
    found.push({ id: m.id, t: Math.min(length, Math.max(g.minAhead, Math.abs(t))) });
  }
  found.sort((a, b) => a.t - b.t);
  let last = -Infinity;
  return found.map((f) => {
    const t = Math.min(length, Math.max(f.t, last + g.spacing));
    last = t;
    return { id: f.id, t, at: along(from, d, t) };
  });
}

/**
 * The Vexcaller's Restoring Shot and Overflowing (TwoDogs allies/vexes.js) for a player `missing` health: what's healed,
 * and the bonus hearts after (`was`, still running when `now` < `until`), capped. absorption: the level of the game's
 * Absorption that shows them (two hearts a level), or -1 for none.
 */
export function restoring(missing, heal, overflowOn, was, until, now, cap) {
  const gain = Math.max(0, Math.min(heal, missing));
  let bonus = now < until ? was : 0;
  if (overflowOn && gain < heal) bonus = Math.min(cap, bonus + heal - gain);
  return { gain, bonus, absorption: overflowOn && gain < heal ? Math.max(0, Math.ceil(bonus / 4) - 1) : -1 };
}
