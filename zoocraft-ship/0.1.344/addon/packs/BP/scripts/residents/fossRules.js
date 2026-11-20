// 0.1.344: Dr. Foss's Acufend expedition (Austin's NPC #29 spec, sections 9, 14 and 15), the rules. Pure, so the tests
// can run them; residents/fossExpedition.js plays them in the game.
//
// One record in the world ("fossExpedition"/"exp"): each player's answer to his offer at 100 friendship (`players`:
// { [id]: { state: "accepted" | "declined" | "done", name, day } }), and the Frequency Friends' statue (`statue`:
// { state: "cave" | "carried" | "placed", gen, by, byId, d, x, y, z }), with `home` ({ day, by, byId }) once it first
// reached the Overworld. There is one statue in each world: each taking of it (from the cave, or picked up from where
// it stood) hands over the one item, stamped with the statue's `gen`; a copy with another stamp won't stand.
import { statueCells } from "../world/acufendCaveRules.js";

export const FOSS_ID = "dr_foss";
export const STATUE_ITEM = "zoocraft:frequency_statue";
/** On the statue item: which taking of the statue it is. */
export const STATUE_GEN = "zoocraft:statue_gen";
/** On the Frequency Friends that come for the statue. */
export const AMBUSH_TAG = "ff_ambush";
/** His 100 friendship reward's key: the story of Acufend, and his offer. */
export const TALE = "acufend_tale";
/** The blocks a placed statue may take the place of (as a block placed on grass does). */
export const CLEAR = new Set(["minecraft:air", "minecraft:short_grass", "minecraft:tall_grass", "minecraft:fern", "minecraft:large_fern", "minecraft:deadbush", "minecraft:snow_layer"]);

const hyp = (x, z) => Math.hypot(x, z);
const yawTo = (dx, dz) => (Math.atan2(-dx, dz) * 180) / Math.PI;

export function newExpedition() {
  return { id: "exp", players: {}, statue: { state: "cave", gen: 0 } };
}

/** A player's answer to his offer: "accepted", "declined", "done", or undefined (never asked, or never answered). */
export function answerOf(rec, pid) {
  return rec?.players?.[pid]?.state;
}

/** On the expedition now: they said yes, and the statue isn't home yet. */
export const onIt = (rec, pid) => answerOf(rec, pid) === "accepted";

/**
 * A player's answer: yes (accepted) or not yet (declined: asked again whenever they like, the spec's "declining should
 * not permanently remove the opportunity"). An answer once they're on it, or done, changes nothing.
 */
export function withAnswer(rec, pid, name, yes, day) {
  const was = answerOf(rec, pid);
  if (was === "accepted" || was === "done") return rec;
  if (yes && rec.home) return { ...rec, players: { ...rec.players, [pid]: { state: "done", name, day } } }; // the statue is home already
  return { ...rec, players: { ...rec.players, [pid]: { state: yes ? "accepted" : "declined", name, day } } };
}

/**
 * Whether a player can take the statue from the cave: "ok"; "gone" (it isn't there); "stranger" (they aren't on the
 * expedition: it won't move for them); "guarded" (Augustus Kong isn't beaten).
 */
export function takeWhy(rec, pid, beaten) {
  if (rec.statue?.state !== "cave") return "gone";
  if (!onIt(rec, pid)) return "stranger";
  if (!beaten) return "guarded";
  return "ok";
}

/** The statue taken from the cave (or picked up where it stood): an item now, with a new stamp. */
export function withTaken(rec, pid, name, day) {
  const gen = (rec.statue?.gen ?? 0) + 1;
  return { ...rec, statue: { state: "carried", gen, by: name, byId: pid, day } };
}

/** The statue is in the Overworld for the first time, carried by this player: the expedition is done for everyone on it. */
export function withHome(rec, pid, name, day) {
  if (rec.home) return rec;
  const players = {};
  for (const [id, p] of Object.entries(rec.players ?? {})) players[id] = p.state === "accepted" ? { ...p, state: "done" } : p;
  players[pid] = { ...(players[pid] ?? { day }), state: "done", name };
  return { ...rec, players, home: { day, by: name, byId: pid } };
}

/** The statue stood up at `at` ({ d, x, y, z }: the middle of its bottom layer) by this player, who owns it there. */
export function withPlaced(rec, at, pid, name) {
  return { ...rec, statue: { ...rec.statue, state: "placed", d: at.d, x: at.x, y: at.y, z: at.z, by: name, byId: pid } };
}

/** The placed statue picked up by its owner: an item again, with a new stamp. */
export function withPicked(rec, pid, name, day) {
  const { d, x, y, z, ...rest } = rec.statue;
  return { ...rec, statue: { ...rest, state: "carried", gen: (rest.gen ?? 0) + 1, by: name, byId: pid, day } };
}

/** Whether a statue item's stamp is this world's statue (a carried one). */
export function stampOk(rec, stamp) {
  return rec.statue?.state === "carried" && typeof stamp === "number" && stamp === rec.statue.gen;
}

/** The statue's blocks standing on `base` (the middle of its bottom layer): [{ x, y, z, block }], the cave's shape. */
export function statueBlocks(base) {
  return statueCells().map(([dx, dy, dz, block]) => ({ x: base.x + dx, y: base.y + dy, z: base.z + dz, block }));
}

/** Whether a block (whole coordinates) is one of a statue's standing on `base`. */
export function inStatue(base, p) {
  const dx = p.x - base.x, dy = p.y - base.y, dz = p.z - base.z;
  if (Math.abs(dx) > 1 || Math.abs(dz) > 1 || dy < 0 || dy > 6) return false;
  return statueCells().some(([x, y, z]) => x === dx && y === dy && z === dz);
}

/**
 * Whether the statue can stand on the block a player used it on: "ok"; "face" (not its top); "acufend" (not in
 * Acufend: its people would take it back); "stamp" (not this world's statue); "room" (something in the way of its
 * 3 by 3 by 7). `idAt(p)` is the block at p (undefined where it can't be read).
 */
export function placeWhy(o) {
  if (o.face !== "Up") return "face";
  if (o.inAcufend) return "acufend";
  if (!o.stampOk) return "stamp";
  for (const c of statueBlocks(o.base)) if (!CLEAR.has(o.idAt(c))) return "room";
  return "ok";
}

/**
 * What Dr. Foss says of the expedition when asked (his menu's button): the line's key. `inAcufend`: they're there now;
 * `beaten`: Augustus Kong is.
 */
export function progressKey(rec, pid, beaten) {
  const a = answerOf(rec, pid);
  if (a === "done" || rec.home) return rec.statue?.state === "placed" ? "expPlaced" : "expDone";
  if (a !== "accepted") return "expAsk";
  if (rec.statue?.state === "carried") return "expCarry";
  if (!beaten) return "expGuarded";
  return "expFetch";
}

// ---- Dr. Foss along on the expedition (the spec: "remain involved in the quest without interfering with the player's
// combat"). He walks where the player walked (their footsteps on the ground, a block apart), a few blocks behind;
// left far behind he catches up at once; he never steps into the fight with Augustus Kong (a footstep near the statue
// is held while he is unbeaten).

/** A footstep added (in a copy) when the player, on the ground at `p`, has gone g.step on; at most g.keep kept. */
export function trailAdd(trail, p, g) {
  const last = trail[trail.length - 1];
  if (last && hyp(p.x - last.x, p.z - last.z) < g.step && Math.abs(p.y - last.y) < 0.5) return trail;
  const out = [...trail, { x: p.x, y: p.y, z: p.z }];
  return out.length > g.keep ? out.slice(out.length - g.keep) : out;
}

const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * His move this tick, at `at`, following `leader` (their feet) along `trail`; `hold(p)`: a footstep he won't take now.
 * Returns { pos, yaw, walking, trail, jump } (jump: he caught up at once).
 */
export function companionStep(at, trail, leader, hold, g) {
  const face = (p) => yawTo(leader.x - p.x, leader.z - p.z);
  const stand = (tr) => ({ pos: at, yaw: face(at), walking: false, trail: tr, jump: false });
  if (d3(at, leader) <= g.near) return stand([]); // beside them: the way here is behind them now
  if (d3(at, leader) > g.jumpFar) {
    // far behind: to their newest footstep he may take that is near them, if there is one
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      if (d3(p, leader) > g.jumpFar / 2) break;
      if (hold(p)) continue;
      return { pos: { x: p.x, y: p.y, z: p.z }, yaw: face(p), walking: false, trail: trail.slice(i + 1), jump: true };
    }
  }
  let i = 0;
  while (i < trail.length && d3(at, trail[i]) < 0.05) i++;
  const tr = i ? trail.slice(i) : trail;
  const next = tr[0];
  if (!next || hold(next) || d3(next, leader) < g.near) return stand(tr);
  const speed = d3(at, leader) > g.hurryFrom ? g.hurry : g.walk;
  const dist = d3(at, next);
  const f = Math.min(1, speed / dist);
  const pos = { x: at.x + (next.x - at.x) * f, y: at.y + (next.y - at.y) * f, z: at.z + (next.z - at.z) * f };
  const yaw = Math.abs(next.x - at.x) + Math.abs(next.z - at.z) > 1e-3 ? yawTo(next.x - at.x, next.z - at.z) : face(at);
  return { pos, yaw, walking: true, trail: f >= 1 ? tr.slice(1) : tr, jump: false };
}

/** A footstep he holds back from while Augustus Kong is unbeaten: this near the statue's middle (level). */
export function heldBack(p, statue, g) {
  return hyp(p.x - (statue.x + 0.5), p.z - (statue.z + 0.5)) < g.holdOff;
}

// ---- The Frequency Friends come for their statue (the spec: "the chamber becomes flooded with Frequency Friends").
// They come out of the three passages that aren't the way out, and up from the far side of the floor, so the way out
// is open at first: running is always a way out. They never leave the cave.

/** Which of the cave's side chambers (1 to 4) the way in comes down into. */
export function wayInSide(L) {
  const open = L.tubes.find((t) => t.open);
  const end = open ? open.pts[open.pts.length - 1] : L.pad;
  let best = 1;
  for (let i = 2; i < L.chambers.length; i++) {
    const a = L.chambers[i], b = L.chambers[best];
    if (hyp(a.x - end.x, a.z - end.z) < hyp(b.x - end.x, b.z - end.z)) best = i;
  }
  return best;
}

/**
 * Where each of them comes from, in the order they come: [{ x, z, y, at }] (y the floor height to look down from, at
 * the tick after the start). Each passage but the way in's (passage i - 1 goes to side chamber i) sends g.perPassage
 * from its end in the great chamber; g.ring more come up on the far side of the floor, across from the way in.
 */
export function ambushPlan(L, g, rnd) {
  const side = wayInSide(L);
  const main = L.chambers[0];
  const mx = L.statue.x + 0.5, mz = L.statue.z + 0.5;
  const spots = [];
  for (let i = 0; i < 4; i++) {
    if (i + 1 === side) continue;
    const p = L.tubes[i].pts[0];
    for (let j = 0; j < g.perPassage; j++) spots.push({ x: p.x + (rnd() - 0.5) * 2, z: p.z + (rnd() - 0.5) * 2, y: L.tubes[i].y0 + 2 });
  }
  const w = L.chambers[side];
  const away = Math.atan2(mz - w.z, mx - w.x); // from the way in's side, across the middle
  for (let j = 0; j < g.ring; j++) {
    const a = away + ((j / Math.max(1, g.ring - 1) - 0.5) * g.ringSpread * Math.PI) / 180;
    spots.push({ x: mx + Math.cos(a) * g.ringR, z: mz + Math.sin(a) * g.ringR, y: main.floor + 3 });
  }
  // in turns, one from each place at a time, over g.spreadTicks
  const order = [];
  const groups = [];
  for (let k = 0; k < spots.length; k += g.perPassage) groups.push(spots.slice(k, k + g.perPassage));
  for (let j = 0; order.length < spots.length; j++) for (const gr of groups) if (gr[j]) order.push(gr[j]);
  return order.map((s, n) => ({ ...s, at: Math.round((n * g.spreadTicks) / Math.max(1, order.length - 1)) }));
}

/** Whether `p` is in the cave's bounds (its chambers, passages and way in), or within `margin` of them (level). */
export function inCave(L, p, margin) {
  const b = L.box;
  return p.x >= b.x0 - margin && p.x <= b.x1 + margin && p.z >= b.z0 - margin && p.z <= b.z1 + margin;
}

/** Whether a Frequency Friend at `p` has gone as far as it goes: near the cave's mouth, or out of the cave's bounds. */
export function friendTooFar(L, p, g) {
  if (Math.hypot(p.x - L.mouth.x, p.y - L.mouth.y, p.z - L.mouth.z) < g.mouth) return true;
  return !inCave(L, p, g.edge);
}

/** Feet height in a column read from the top down (`ids[k]` the block at top - k): the first open cell over a solid one. */
export function feetIn(ids, top) {
  const open = (id) => id === undefined || id === "minecraft:air" || id === "minecraft:light_block" || id === "minecraft:glow_lichen";
  for (let k = 1; k < ids.length; k++) if (open(ids[k - 1]) && !open(ids[k])) return top - k + 1;
  return undefined;
}
