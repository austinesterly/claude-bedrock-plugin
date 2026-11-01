// Soul Sloths (module 10, 0.1.161: the second boss; research/boss_plan.md "0.1.161 Soul Sloth"), pure: its fight's
// numbers (the same shape as the yeti's, YETI in animals/bossRules.js, so the boss framework plays both: its rake is the
// "swipe", its soul wail the "slam", its lobbed clump the "hurl"), how it hangs and climbs (the spot under a beam beside
// a post, from the model's own measure), the Nether's ground under a roof, its lair (a soul soil clearing with a fossil
// arch to hang from) and the zoo sloth's exhibit: soul sand or soul soil underfoot and a beam beside a post. The game
// side is animals/boss.js (the wild one), animals/sloth.js (a zoo one) and animals/slothMoves.js (climbing).
import { lairFrame, seeded, yawOf } from "./bossRules.js";

export const WILD_SLOTH = "zoocraft:wild_soul_sloth";
export const ZOO_SLOTH = "zoocraft:soul_sloth";
export const SOUL_CLUMP = "zoocraft:soul_clump";
export const SLOTH_TYPES = [WILD_SLOTH, ZOO_SLOTH];

// What a sloth is doing (its zoocraft:act entity property): the client plays the matching animation (RP
// soul_sloth.animation_controllers.json, gen161/sloth160.py) and the Field Journal watches for it. The fight's moves
// keep the yeti's names: swipe (its claw rake), slam (its soul wail), hurl (its soul clump lob), roar (its howl).
export const SLOTH_ACT = { none: 0, swipe: 1, slam: 2, hurl: 3, roar: 4, eat: 5, tired: 6, sit: 7, sleep: 8, yawn: 9, hang: 10, drop: 11, climb: 12, rake: 13, curl: 14, walk: 15 };
// On the ground sitting or curled up (the client's own way down and up: 1.2 seconds each), and hanging.
export const SLOTH_SEATED = [SLOTH_ACT.tired, SLOTH_ACT.sit, SLOTH_ACT.curl];
export const SLOTH_HANGING = [SLOTH_ACT.hang, SLOTH_ACT.sleep];

// Measured on the model (gen161/sloth160.py checks these against it), in blocks: how high its claws are over the hanging
// entity's position (the beam's underside), how far ahead of a climbing one the post's face is, how tall it is while it
// climbs, how far along the beam from the post's face its hanging body runs, and where the clump leaves its hands in the
// lob (ahead of it and up).
export const SLOTH_BODY = { hangReach: 2.53, postAhead: 1.92, climbTop: 4.202, hangLength: 4.296, lobAhead: 1.98, lobUp: 2.33 };

// The Soul Sloth's fight (boss_plan.md). Ticks are game ticks (20 a second).
export const SLOTH = {
  energy: 400,
  tiredAt: 40,
  angryAt: 200,
  ring: 32,
  provoke: 5,
  noHitTicks: 1200,
  recoverTicks: 1200,
  regenPerSecond: 4,
  roarTicks: 44, // the howl (the art's: ground beats, then the howl at 1.05 s; 2.2 s)
  every: 50,
  everyAngry: 30,
  firstMove: 20,
  gapTicks: 4,
  moves: {
    // The claw rake: near, in front (its claws reach 2.4 blocks out): an arm raised high (0.75 s), raked down at 0.95 s:
    // 7 and about 3 blocks of knock back.
    swipe: { reach: 5, arc: 70, strikeAt: 19, ticks: 30, damage: 7, knock: { h: 1.0, v: 0.35 } },
    // The soul wail: reared up, arms wide; at 1.2 s a ring of soul flame bursts out all round: 4, Slowness I for 3 s and
    // a push back. Nothing catches fire.
    slam: { reach: 7, high: 3, strikeAt: 24, ticks: 40, damage: 4, knock: { h: 1.1, v: 0.4 }, slowTicks: 60, slowLevel: 0 },
    // The soul clump lob, from afar: scooped up (0.4 s), lifted in both hands and flung at 1.1 s: 5 on a hit and a puff.
    hurl: { min: 7, max: 22, strikeAt: 22, ticks: 30, damage: 5, knock: { h: 0.8, v: 0.3 }, speed: 1.0, gravity: 0.05 },
  },
  // Angry at half: it beats the ground and howls; at 1.05 s everyone within 12 is slowed (Slowness II, 3 s) and pushed.
  angry: { ticks: 44, blastAt: 21, radius: 12, slowTicks: 60, slowLevel: 1, knock: { h: 1.2, v: 0.3 } },
  throwFrom: { ahead: SLOTH_BODY.lobAhead, up: SLOTH_BODY.lobUp },
  // Calm: hanging asleep about two thirds of the time (the Nether has no night: its own clock), awake now and then,
  // sometimes down for a while to amble round its lair and rake the soul soil, then back up.
  hang: {
    sleepTicks: [1600, 3600],
    awakeTicks: [400, 1000],
    downChance: 0.35, // at the end of an awake spell it climbs down (else back to sleep)
    groundTicks: [500, 1200],
    rakeChance: 0.02, // a look (every 10 ticks) on the ground: rakes the soul soil
    yawnChance: 0.01,
    climbPace: 0.075, // blocks a tick up or down the post (1.5 a second)
    walkPace: 0.07, // blocks a tick walking to the post
    turnTicks: 16, // the turn over onto the beam (the art's 0.8 s)
    grip: 0.1, // its claws this far into the beam's underside
    walkGiveUp: 400, // ticks walking to the post before it is put there
    dropTicks: 30, // the drop: down within this, then the howl
  },
  rakeTicks: 32, // the art's ground rake (1.6 s)
  yawnTicks: 44, // the art's yawn (2.2 s)
  // Lairs: one per soul sand valley area, in the Nether.
  spacing: 800,
  // 32 to 48 blocks from the player (inside the ticking chunks), the ground found going down from 12 over the player's
  // height to 24 under it (the valleys are terraces under a roof), 9 blocks of air over all of it, level within 3.
  site: { min: 32, max: 48, parks: 160, level: 3, tries: 24, air: 9, over: 12, under: 24 },
  respawn: { near: 40, missing: 64, looks: 3 },
  findRange: 16,
  lairEvery: 100,
};

const hyp = (/** @type {number} */ a, /** @type {number} */ b) => Math.hypot(a, b);

// --- Hanging and climbing ------------------------------------------------------------------------------------------
// Where it climbs and hangs, for a post (a block column: { x, z } its block) with the beam running out from it along `d`
// (one of the four ways, { x, z }), the floor's top at `floor` and the beam's underside at `beam` (world heights): the
// spot (x, z) a little over the post-ahead measure out from the post's face, facing the post; the entity's height
// climbing at the top (its head just under the beam) and hanging (its claws in the beam's underside).
/**
 * @param {{ x: number, z: number }} post @param {{ x: number, z: number }} d @param {number} floor @param {number} beam
 * @returns {{ x: number, z: number, yaw: number, floor: number, climbY: number, hangY: number, beam: number }}
 */
export function hangSite(post, d, floor, beam, B = SLOTH_BODY, H = SLOTH.hang) {
  const fx = post.x + 0.5 + d.x * 0.5;
  const fz = post.z + 0.5 + d.z * 0.5;
  return {
    x: fx + d.x * B.postAhead,
    z: fz + d.z * B.postAhead,
    yaw: yawOf(-d.x, -d.z),
    floor,
    climbY: beam - B.climbTop - 0.05,
    hangY: beam - B.hangReach + H.grip,
    beam,
  };
}

// The heights a climb passes through, a tick at a time: from `from` to `to` at `pace` blocks a tick, ending on `to`.
/** @param {number} from @param {number} to @param {number} pace */
export function climbSteps(from, to, pace) {
  const n = Math.max(1, Math.ceil(Math.abs(to - from) / pace));
  const out = [];
  for (let i = 1; i <= n; i++) out.push(from + ((to - from) * i) / n);
  return out;
}

// The steps of a walk along the ground from `from` to `to` ({ x, z }) at `pace` blocks a tick, ending on `to`.
/** @param {{ x: number, z: number }} from @param {{ x: number, z: number }} to @param {number} pace */
export function walkSteps(from, to, pace) {
  const d = hyp(to.x - from.x, to.z - from.z);
  const n = Math.max(1, Math.ceil(d / pace));
  const out = [];
  for (let i = 1; i <= n; i++) out.push({ x: from.x + ((to.x - from.x) * i) / n, z: from.z + ((to.z - from.z) * i) / n });
  return out;
}

// What a calm hanging sloth does next: from asleep, awake a while; from awake, asleep again or (now and then) down to
// the ground; from the ground, back up. Returns { next, ticks }.
/** @param {"sleep" | "awake" | "ground"} now @param {() => number} [rand] */
export function nextHang(now, rand = Math.random, H = SLOTH.hang) {
  const span = (/** @type {number[]} */ r) => Math.round(r[0] + rand() * (r[1] - r[0]));
  if (now === "sleep") return { next: "awake", ticks: span(H.awakeTicks) };
  if (now === "awake") return rand() < H.downChance ? { next: "ground", ticks: span(H.groundTicks) } : { next: "sleep", ticks: span(H.sleepTicks) };
  return { next: "up", ticks: 0 };
}

// --- The Nether's ground -------------------------------------------------------------------------------------------
// Under a roof: the ground found going down. The ground a lair can stand on; what may stand over it (cleared); lava.
const NETHER_GROUND = /^minecraft:(soul_sand|soul_soil|netherrack|basalt|polished_basalt|smooth_basalt|blackstone|gravel|bone_block|magma|nether_gold_ore|quartz_ore|crimson_nylium|warped_nylium)$/;
const OVER_GROUND = /^minecraft:(air|soul_fire|fire|cave_air|void_air)$/;
/** @param {string | undefined} id */
export function isNetherGround(id) {
  return Boolean(id) && NETHER_GROUND.test(String(id));
}

// The ground's height at a column, going down from `fromY` to `toY`: the first ground block with `air` blocks of air (or
// soul fire) over it; "wet" where lava is met first; undefined unread (unloaded) or none.
/** @param {(x: number, y: number, z: number) => (string | undefined)} idAt @param {number} x @param {number} z @param {number} fromY @param {number} toY */
export function netherGroundY(idAt, x, z, fromY, toY, air = SLOTH.site.air) {
  let clear = 0;
  for (let y = fromY; y >= toY; y--) {
    const id = idAt(x, y, z);
    if (id === undefined) return undefined;
    if (id.includes("lava")) return "wet";
    if (OVER_GROUND.test(id)) {
      clear++;
      continue;
    }
    if (clear >= air && NETHER_GROUND.test(id)) return y;
    clear = 0; // an overhang or a pillar's top: count again under it
  }
  return undefined;
}

// Whether a site is good for a lair: the ground at the middle found going down from `fromY` (S.over over the player's
// height) to S.under under it; every 2 blocks out to the radius, the ground with 9 air over it within `level` of the
// middle's, no lava. `groundAt(x, z, from, to)`: netherGroundY at that column. Returns the middle's ground height.
/** @param {(x: number, z: number, from: number, to: number) => (number | "wet" | undefined)} groundAt @param {{ x: number, z: number }} c @param {number} playerY */
export function slothSiteLevel(groundAt, c, playerY, radius = SLOTH_LAIR.radius, S = SLOTH.site) {
  const y0 = groundAt(c.x, c.z, Math.floor(playerY) + S.over, Math.floor(playerY) - S.under);
  if (typeof y0 !== "number") return undefined;
  for (let dx = -radius; dx <= radius; dx += 2) {
    for (let dz = -radius; dz <= radius; dz += 2) {
      if (hyp(dx, dz) > radius) continue;
      const y = groundAt(c.x + dx, c.z + dz, y0 + S.level + S.air, y0 - S.level - 1);
      if (typeof y !== "number" || Math.abs(y - y0) > S.level) return undefined;
    }
  }
  return y0;
}

// --- Its lair --------------------------------------------------------------------------------------------------------
// A round clearing (radius 8) of soul soil with patches of soul sand; at the back a fossil arch: two bone-block pillars 3
// either side of the middle line and a bone beam across their tops (the floor block is y 0 and the beam y 7, so the
// beam's underside is 6 blocks over the floor); soul lanterns hung from bone brackets outside the pillars and soul
// torches at their feet; basalt columns and bone ribs round the rim.
export const SLOTH_LAIR = { radius: 8, clearUp: 9, fillDown: 4, arch: { v: 5, half: 3, beam: 7 } };

// The lair's post and beam in the world (its sloth hangs from the right-hand pillar's side of the beam), and its spot.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function slothLairSite(c, facing) {
  const at = lairFrame(c, facing);
  const A = SLOTH_LAIR.arch;
  const o = at(0, 0, 0);
  const r1 = at(1, 0, 0);
  const r = { x: r1.x - o.x, z: r1.z - o.z };
  const post = at(A.half, A.v, 1);
  const d = { x: -r.x, z: -r.z };
  return { post: { x: post.x, z: post.z }, d, site: hangSite(post, d, c.y + 1, c.y + A.beam) };
}

// Every block the lair sets, in order ({ x, y, z, id, states? }); the clearing's columns are cleared first
// (slothLairColumns) and their dips filled with soul soil. `seed` picks its look.
/** @param {{ x: number, y: number, z: number }} c @param {number} facing @param {number} seed */
export function slothLairBlocks(c, facing, seed) {
  const rand = seeded(seed);
  const at = lairFrame(c, facing);
  const A = SLOTH_LAIR.arch;
  const R = SLOTH_LAIR.radius;
  const o = at(0, 0, 0);
  const r1 = at(1, 0, 0);
  const across = r1.x !== o.x ? "x" : "z"; // the beam's axis (along u)
  const along = across === "x" ? "z" : "x";
  /** @type {{ x: number, y: number, z: number, id: string, states?: Record<string, string | number | boolean> }[]} */
  const out = [];
  const put = (u, v, y, id, states) => out.push({ ...at(u, v, y), id, ...(states ? { states } : {}) });
  const patches = Array.from({ length: 5 }, () => ({ u: Math.round((rand() - 0.5) * 12), v: Math.round((rand() - 0.6) * 12), r: 1 + rand() * 1.6 }));
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      put(u, v, 0, patches.some((p) => hyp(u - p.u, v - p.v) <= p.r) ? "minecraft:soul_sand" : "minecraft:soul_soil");
    }
  }
  // The fossil arch.
  for (const s of [-1, 1]) for (let y = 1; y < A.beam; y++) put(s * A.half, A.v, y, "minecraft:bone_block", { pillar_axis: "y" });
  for (let u = -A.half; u <= A.half; u++) put(u, A.v, A.beam, "minecraft:bone_block", { pillar_axis: across });
  for (const s of [-1, 1]) put(s * A.half, A.v, A.beam + 1, "minecraft:bone_block", { pillar_axis: "y" });
  // Bone brackets outside the pillars, a soul lantern hung from each; soul torches at the pillars' feet, outside.
  for (const s of [-1, 1]) {
    put(s * (A.half + 1), A.v, A.beam - 1, "minecraft:bone_block", { pillar_axis: across });
    put(s * (A.half + 1), A.v, A.beam - 2, "minecraft:soul_lantern", { hanging: true });
    put(s * (A.half + 1), A.v - 1, 1, "minecraft:soul_torch", { torch_facing_direction: "top" });
  }
  // Basalt columns round the rim (the sides and the back), 2 to 4 high.
  for (let i = 0; i < 4; i++) {
    const a = (75 + i * 70 + rand() * 20) * (Math.PI / 180);
    const d = R - 1;
    const u = Math.round(Math.sin(a) * d), v = Math.round(Math.cos(a) * d);
    if (Math.abs(v - A.v) <= 1 && Math.abs(u) <= A.half + 1) continue; // not against the arch
    const h = 2 + Math.floor(rand() * 3);
    for (let y = 1; y <= h; y++) put(u, v, y, "minecraft:basalt", { pillar_axis: "y" });
  }
  // Old bone ribs at the sides, curving in over the floor.
  for (const s of [-1, 1]) {
    for (const v of [-2, 1]) {
      const u = s * (R - 2);
      put(u, v, 1, "minecraft:bone_block", { pillar_axis: "y" });
      put(u, v, 2, "minecraft:bone_block", { pillar_axis: "y" });
      put(u - s, v, 3, "minecraft:bone_block", { pillar_axis: across });
    }
  }
  // A few loose bones and soul sand mounds on the floor, away from the arch and the way to it.
  for (let i = 0; i < 3; i++) {
    const a = (150 + i * 30 + rand() * 25) * (Math.PI / 180);
    const d = 3 + rand() * 3;
    put(Math.round(Math.sin(a) * d), Math.round(Math.cos(a) * d), 1, "minecraft:bone_block", { pillar_axis: rand() < 0.5 ? across : along });
  }
  return out;
}

// The columns of the clearing (the world's x, z).
/** @param {{ x: number, y: number, z: number }} c @param {number} facing */
export function slothLairColumns(c, facing) {
  const at = lairFrame(c, facing);
  const out = [];
  const R = SLOTH_LAIR.radius;
  for (let u = -R; u <= R; u++) {
    for (let v = -R; v <= R; v++) {
      if (hyp(u, v) > R + 0.5) continue;
      const p = at(u, v, 0);
      out.push({ x: p.x, z: p.z });
    }
  }
  return out;
}

// --- A zoo sloth's exhibit -----------------------------------------------------------------------------------------
// Soul sand or soul soil under half the floor or more (species.soulFloor) and a beam to hang from (species.beam): a post
// (solid from the floor up to the beam) with 5 solid blocks running out from its top, their undersides 5 to 8 blocks
// over the floor with open air under them. The sloth measure (exhibits/exhibits.js) over the floor the walking measure
// found (cells: key "x,y,z" -> kind; the "land" ones, each the air a block over the floor).
export const SOUL_FLOOR = new Set(["minecraft:soul_sand", "minecraft:soul_soil"]);
export const SOUL_HOW = "soul sand or soul soil in the floor";
export const BEAM_HOW = "a beam to hang from: a post of solid blocks with 5 solid blocks running out from its top, 5 to 8 blocks over the floor with open air under them";
export const BEAM = { low: 5, high: 8, run: 5, keep: 4 };
const NOT_SOLID = /(air|water|lava|torch|lantern|carpet|button|sign|banner|rail|flower|grass|fern|vine|chain|ladder|_bars|pane|fence_gate|door|trapdoor|campfire|lever|pressure_plate|snow_layer|cobweb|fire)/;
/** @param {string | undefined} id */
export function solidId(id) {
  return Boolean(id) && !NOT_SOLID.test(String(id));
}

export function newSlothResult() {
  return { soul: 0, cells: 0, beams: /** @type {{ x: number, z: number, dx: number, dz: number, floor: number, beam: number }[]} */ ([]) };
}

/**
 * @param {(x: number, y: number, z: number) => (string | undefined)} idAt
 * @param {Map<string, string>} cells @param {{ cellsPerYield: number }} opts @param {ReturnType<typeof newSlothResult>} out
 */
export function* measureSloth(idAt, cells, opts, out, Bm = BEAM) {
  let work = 0;
  /** @type {Map<string, number>} */
  const ceil = new Map(); // "x,y,z" of a land cell -> the height of the first solid block over its floor (5 to 8)
  for (const [k, kind] of cells) {
    if (kind !== "land") continue;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    out.cells++;
    if (SOUL_FLOOR.has(idAt(x, y - 1, z) ?? "")) out.soul++;
    for (let h = 0; h <= Bm.high; h++) {
      const id = idAt(x, y + h, z);
      if (id === undefined) break;
      if (!solidId(id)) continue;
      if (h >= Bm.low) ceil.set(k, h);
      break;
    }
  }
  const used = new Set();
  const WAYS = [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }];
  for (const [k, h] of ceil) {
    if (out.beams.length >= Bm.keep) break;
    if (++work % opts.cellsPerYield === 0) yield;
    const [x, y, z] = k.split(",").map(Number);
    for (const d of WAYS) {
      const run = Array.from({ length: Bm.run }, (_, i) => `${x + d.x * i},${y},${z + d.z * i}`);
      if (!run.every((c) => ceil.get(c) === h && !used.has(c))) continue;
      const px = x - d.x, pz = z - d.z;
      if (cells.get(`${px},${y},${pz}`) === "land") continue;
      let post = true;
      for (let j = 0; j <= h && post; j++) post = solidId(idAt(px, y + j, pz));
      if (!post) continue;
      for (const c of run) used.add(c);
      out.beams.push({ x: px, z: pz, dx: d.x, dz: d.z, floor: y, beam: y + h });
      break;
    }
  }
  return out;
}

// Enough soul underfoot, and a beam (causes "sloth": species.soulFloor, species.beam). Not measured yet: passes.
/** @param {{ soulFloor?: { share: number }, beam?: boolean }} species @param {{ sloth?: ReturnType<typeof newSlothResult> }} ex */
export function hasSoulFloor(species, ex) {
  if (!species.soulFloor || !ex.sloth) return true;
  return ex.sloth.cells > 0 && ex.sloth.soul / ex.sloth.cells >= species.soulFloor.share;
}
/** @param {{ beam?: boolean }} species @param {{ sloth?: ReturnType<typeof newSlothResult> }} ex */
export function hasBeam(species, ex) {
  if (!species.beam || !ex.sloth) return true;
  return ex.sloth.beams.length > 0;
}

// The Exhibit Clipboard's lines for sloths.
export function slothLines(ex, species) {
  const t = ex.sloth;
  if (!t) return ["§fSoul underfoot, a beam: §7not measured yet: use the Habitat Marker on the ground inside again"];
  const pct = t.cells ? Math.round((t.soul / t.cells) * 100) : 0;
  return [
    `§fSoul underfoot: ${hasSoulFloor(species, ex) ? "§a" : "§c"}${pct}%§7 of the floor (${t.soul} of ${t.cells} blocks; ${Math.round(species.soulFloor.share * 100)}% wanted: ${SOUL_HOW})`,
    `§fA beam to hang from: ${t.beams.length ? `§a${t.beams.length} found§7 (one for each sloth is best)` : `§cnone§7 (${BEAM_HOW})`}`,
  ];
}

// Care warnings for sloths.
export function slothWarnings(ex, plural, species, cap) {
  const out = [];
  if (!ex.sloth) return out;
  if (!hasSoulFloor(species, ex)) out.push({ severity: 2, text: `${plural} want ${SOUL_HOW} under ${Math.round(species.soulFloor.share * 100)}% of the floor or more (${ex.sloth.soul} of ${ex.sloth.cells} blocks now). Without it comfort can't rise above ${cap}.` });
  if (!hasBeam(species, ex)) out.push({ severity: 2, text: `${plural} sleep hanging from a beam and have none: ${BEAM_HOW}. Without one comfort can't rise above ${cap}, and they sleep curled up on the ground.` });
  return out;
}

// --- The zoo sloth's day (animals/sloth.js) ------------------------------------------------------------------------
// Hanging asleep from its beam most of the time; awake now and then; down for a while to eat at the feeder, rake the
// soul sand, yawn, sit or amble; then back up. With no beam it sleeps curled up on the ground.
export const SLOTH_DAY = {
  weights: { feeder: 3, rake: 1.5, yawn: 0.8, sit: 1.2, wander: 2 },
  coolTicks: 40,
  wanderTicks: [100, 240],
  eatTicks: [100, 180],
  sitTicks: [300, 700],
  curlTicks: [1200, 2400], // asleep curled up with no beam
  feederReach: 2.8,
  baitRange: 8, // a player holding a Fungal Ration this near: it stops what it is doing on the ground (not up its beam)
  getUpTicks: 24, // the client's own way up from sitting or curled (1.2 s)
};

/** @param {{ feeder: boolean }} o @param {() => number} [random] */
export function pickSlothInterest(o, random = Math.random, Z = SLOTH_DAY) {
  const W = Z.weights;
  const options = [["feeder", o.feeder ? W.feeder : 0], ["rake", W.rake], ["yawn", W.yawn], ["sit", W.sit], ["wander", W.wander]];
  let r = random() * options.reduce((n, [, w]) => n + Number(w), 0);
  for (const [what, w] of options) {
    if (r < Number(w)) return String(what);
    r -= Number(w);
  }
  return "wander";
}

// The Field Journal's line on wild ones.
export function slothWildLine(S = SLOTH) {
  return `In the wild one lives alone in its lair in a soul sand valley in the Nether (a clearing of soul soil with a fossil arch of bone), one to an area: a lair is made when a park member walks in a soul sand valley with none within ${S.spacing} blocks. It hangs upside down under its arch's beam, asleep much of the time, and now and then climbs down to amble and rake the soul soil. Calm till someone hits it or walks up to it in Survival without sneaking: then it drops down, howls and fights, its boss bar showing. It rakes you with its claws close by, gives a soul wail that bursts out round it, and lobs clumps of soul sand from afar, each with a wind-up you can see: dodge. At half its energy it beats the ground and howls, slowing you. It is never killed: worn down to a tenth it curls up tired out, and then its Soul Cage works (with a Fungal Ration in your inventory). Left alone a minute it gets up rested and climbs back to its beam`;
}
