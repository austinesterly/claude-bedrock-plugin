// Guido's bows and his Bow Case (0.1.261), the parts with no game in them: which items are bows, each bow's numbers, who
// may look and trade, and the checks that keep a trade from ever doubling a bow; 0.1.263 the bows' powers (the aim of a
// volley, a headshot, a turn, a pull, what a mob is still owed). Runtime: guido/bowCase.js, bowShots.js.
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
 * What identifies one bow in a slot, so a trade can check that nothing moved between the page and the swap: its kind,
 * its name, its wear and its enchantments (`it` is a plain record: typeId, nameTag, damage, enchants [[id, level]]).
 */
export function fingerprint(it) {
  if (!it?.typeId) return "";
  const ench = [...(it.enchants ?? [])].map(([id, lvl]) => `${id}:${lvl}`).sort().join(",");
  return `${it.typeId}|${it.nameTag ?? ""}|${it.damage ?? 0}|${ench}`;
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

/** The Scrap Bow's other arrows: `n` directions spread evenly over a cone `spreadDeg` across about `d`. */
export function coneDirs(d, n, spreadDeg, rand = Math.random) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(offAxis(d, (spreadDeg / 2) * Math.sqrt(rand()), rand() * 360));
  return out;
}

/** The Ballista's ring: `n` directions `deg` degrees off `d`, evenly round it, the first straight above the aim. */
export function ringDirs(d, n, deg) {
  return Array.from({ length: n }, (_, i) => offAxis(d, deg, 90 + (360 * i) / n));
}

/** Where the Twin Fang's second arrow starts, from the first: `apart` blocks to its right, level. */
export function twinOffset(d, apart) {
  return scaled(basis(d).r, apart);
}

/** A Needle Bow headshot: the arrow struck from a little below a mob's eye height to the top of its head. */
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

/**
 * The Sonic Bow's pull on a zombie standing at `p`, from a shot at `from` flying along `d` (length 1): a level push
 * toward the point of the line beside it (and a little hop), harder the further off it is; undefined when it's behind
 * the shot, too far ahead, too far off the line or already on it.
 */
export function pullToward(p, from, d, g) {
  const rel = { x: p.x - from.x, y: p.y - from.y, z: p.z - from.z };
  const t = dot(rel, d);
  if (t < 0 || t > g.pullAhead) return undefined;
  const near = along(from, d, t);
  const off = { x: near.x - p.x, y: 0, z: near.z - p.z };
  const dist = Math.hypot(off.x, off.z);
  if (dist > g.pullRadius || dist < g.onLine) return undefined;
  const k = Math.min(g.pullMax, dist * g.pullPerBlock) / dist;
  return { x: off.x * k, y: g.hop, z: off.z * k };
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
