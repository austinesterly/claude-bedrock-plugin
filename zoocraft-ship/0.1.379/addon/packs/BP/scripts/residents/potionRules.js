// 0.1.330: Darian's advanced potions (Austin 2026-11-18 21:41Z, his answer 5): a melded ingredient brewed into an
// Awkward Potion at a brewing stand. "Exploison": a spider eye and TNT melded (Unstable Eye); poison, and at each tick of
// its damage TNT-like blasts round the drinker, who takes none of the blast. "Demeters Aura": golden apple and bone meal
// (Apple of Growth); crops and plants near the drinker grow 500%. "Archers Tempo": golden carrot and glistering melon
// (Gold Fruit); bows draw and fire faster. 0.1.331: Damien's Shapeshifting Potion and Dragon Seeker: 30 seconds as a
// small dragon (residents/shapeshift.js). Pure: no game objects here (residents/potions.js runs them).

/** The three potions, by their item: `id` names the effect, `seconds` how long it lasts (the game's own: Poison 0:45, a buff 3:00). */
export const BREWS = {
  "zoocraft:potion_explosion": { id: "explosion", name: "Explosion", seconds: 45 },
  "zoocraft:potion_demeters_aura": { id: "demeters_aura", name: "Demeter's Aura", seconds: 180 },
  "zoocraft:potion_archers_tempo": { id: "archers_tempo", name: "Archer's Tempo", seconds: 180 },
  // 0.1.379 (Austin: "a one with the rabbits potion, giving you jump boost X3 and swiftness X3 for 8 minutes"); `effects`, the game's own
  "zoocraft:potion_one_with_rabbits": { id: "one_with_rabbits", name: "One with the Rabbits", seconds: 480, effects: [{ effect: "jump_boost", amplifier: 2 }, { effect: "speed", amplifier: 2 }] },
  // 0.1.331 (Austin: "they turn into a small dragon for 30 seconds"); `effect`, what wears off
  "zoocraft:shapeshifting_potion": { id: "dragon_shape", name: "Shapeshifting Potion", seconds: 30, effect: "Your dragon shape" },
  "zoocraft:dragon_seeker": { id: "dragon_shape", name: "Dragon Seeker", seconds: 30, effect: "Your dragon shape" },
};

/** Where a player's running potions are kept (a dynamic property): JSON { [effect id]: seconds left }. */
export const BREW_KEY = "zoocraft:brews";

/** A player's running potions from the stored text: { id: seconds left }, only positive whole seconds. */
export function brewsOf(raw) {
  let o;
  try {
    o = typeof raw === "string" ? JSON.parse(raw) : undefined;
  } catch {
    o = undefined;
  }
  const out = {};
  if (!o || typeof o !== "object") return out;
  for (const [id, s] of Object.entries(o)) if (typeof s === "number" && s > 0) out[id] = Math.ceil(s);
  return out;
}

/** The stored text for a set of running potions, or undefined when none run. */
export function brewsText(brews) {
  const ids = Object.keys(brews).filter((id) => brews[id] > 0);
  if (!ids.length) return undefined;
  const o = {};
  for (const id of ids.sort()) o[id] = brews[id];
  return JSON.stringify(o);
}

/** Drinking one: its full time again, as the game's potions do (never cut a longer time short). */
export function drink(brews, id, seconds) {
  return { ...brews, [id]: Math.max(brews[id] ?? 0, seconds) };
}

/**
 * A second of a player's potions passing: { brews, ended } (the ids that ran out now). `frozen` (the wand of 0.1.332):
 * time stands still for them.
 */
export function passSecond(brews, frozen = false) {
  if (frozen) return { brews, ended: [] };
  const out = {};
  const ended = [];
  for (const [id, s] of Object.entries(brews)) {
    if (s - 1 > 0) out[id] = s - 1;
    else ended.push(id);
  }
  return { brews: out, ended };
}

/** "2:05" for 125 seconds. */
export function clock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// --- Explosion

/**
 * Where a blast goes, round the drinker: `a` and `b` are two random numbers 0 to 1, the blast `g.minDistance` to
 * `g.maxDistance` blocks away in any direction on the level. Returns { dx, dz }.
 */
export function blastOffset(a, b, g) {
  const angle = a * Math.PI * 2;
  const d = g.minDistance + b * (g.maxDistance - g.minDistance);
  return { dx: Math.cos(angle) * d, dz: Math.sin(angle) * d };
}

/**
 * Whether a hurt is the game's tick of Poison damage on a drinker of Explosion: magic damage (Poison's), with no one
 * and nothing dealing it, on a player whose Explosion runs.
 */
export function isPoisonTick(cause, hasDealer, running) {
  return running && cause === "magic" && !hasDealer;
}

/** Whether a hurt is a drinker's own blast on themselves (it's cancelled: they take only the poison). */
export function ownBlast(cause, dealerId, hurtId, running) {
  return running && (cause === "entityExplosion" || cause === "blockExplosion") && dealerId !== undefined && dealerId === hurtId;
}

// --- Demeter's Aura

/**
 * The plants the aura speeds up, and how one grows a step. `state`: the block state that counts its growth, up to
 * `max`. `kind`: "stage" (one step up the state), "stem" (melon and pumpkin stems: at the top a fruit grows beside it),
 * "tall" (sugar cane and cactus: at the top a new block grows on top, up to `height` tall).
 */
export const GROWERS = [
  { ids: ["minecraft:wheat", "minecraft:carrots", "minecraft:potatoes", "minecraft:beetroot"], state: "growth", max: 7, kind: "stage" },
  { ids: ["minecraft:sweet_berry_bush"], state: "growth", max: 7, kind: "stage" },
  { ids: ["minecraft:nether_wart"], state: "age", max: 3, kind: "stage" },
  { ids: ["minecraft:cocoa"], state: "age", max: 2, kind: "stage" },
  { ids: ["minecraft:melon_stem"], state: "growth", max: 7, kind: "stem", fruit: "minecraft:melon_block" },
  { ids: ["minecraft:pumpkin_stem"], state: "growth", max: 7, kind: "stem", fruit: "minecraft:pumpkin" },
  { ids: ["minecraft:reeds", "minecraft:sugar_cane"], state: "age", max: 15, kind: "tall", height: 3 },
  { ids: ["minecraft:cactus"], state: "age", max: 15, kind: "tall", height: 3 },
];

const GROWER_BY_ID = new Map(GROWERS.flatMap((g) => g.ids.map((id) => [id, g])));

/** The grower a block is, or undefined. */
export function growerOf(typeId) {
  return GROWER_BY_ID.get(typeId);
}

/**
 * One growth step for a plant at `value` of its state: { set } (the state's next value), { fruit } (a stem at the top:
 * grow its fruit beside it), { top } (sugar cane or cactus at its top age: a new block on top, the age back to 0) or
 * undefined (nothing to do: fully grown).
 */
export function growStep(grower, value) {
  if (!grower || typeof value !== "number") return undefined;
  if (value < grower.max) return { set: value + 1 };
  if (grower.kind === "stem") return { fruit: grower.fruit };
  if (grower.kind === "tall") return { top: true };
  return undefined;
}

/**
 * How many extra growth tries a plant gets a second under the aura: the game's own chance a second for that kind of
 * plant (`base`, measured on the game's server) times `times` (500% faster is 4 more on top of the game's 1). A fraction
 * is kept as a chance: `roll` 0 to 1 decides it. Returns a whole number.
 */
export function extraTries(base, times, roll) {
  const want = base * (times - 1);
  const whole = Math.floor(want);
  return whole + (roll < want - whole ? 1 : 0);
}

/**
 * The same, for a whole field at once (cheaper than a roll for every plant each second): how many plants to pick at
 * random this second, `n` plants whose fastest kind grows `rMax` steps a second. Each pick is then kept with
 * keepPick (its own kind's speed against the fastest), so every plant still gets its own kind's share.
 */
export function auraPicks(n, rMax, times, roll) {
  return extraTries(n * rMax, times, roll);
}

/** Whether a picked plant grows: its kind's speed `rate` against the fastest `rMax`, `roll` 0 to 1. */
export function keepPick(rate, rMax, roll) {
  return rMax > 0 && roll < rate / rMax;
}

/** The blocks round a point the aura reaches: every { x, y, z } offset within `radius` across and `height` up or down. */
export function auraOffsets(radius, height) {
  const out = [];
  for (let dy = -height; dy <= height; dy++) for (let dx = -radius; dx <= radius; dx++) for (let dz = -radius; dz <= radius; dz++) out.push({ dx, dy, dz });
  return out;
}

// --- Archer's Tempo

/** A bow's draw time under Archer's Tempo: `times` as long (0.5 = twice as fast), never under 2 ticks. */
export function tempoTicks(drawTicks, running, times) {
  return running ? Math.max(2, Math.round(drawTicks * times)) : drawTicks;
}

/**
 * The game's bow: how full a draw `held` ticks is (its curve (c^2 + 2c) / 3, full at `full` ticks: 20, or fewer under
 * Archer's Tempo). 0 to 1.
 */
export function bowPower(held, full) {
  const c = Math.min(1, Math.max(0, held) / Math.max(1, full));
  return Math.min(1, (c * c + 2 * c) / 3);
}

/**
 * How much faster an arrow from the game's bow flies under Archer's Tempo: the power of the draw at the quicker time
 * against the game's, never slower, at most `cap` times (a tap-shot isn't made a rocket). 1 when it changes nothing.
 */
export function tempoBoost(held, gameFull, tempoFull, cap) {
  const was = bowPower(held, gameFull);
  const now = bowPower(held, tempoFull);
  if (was <= 0 || now <= was) return 1;
  return Math.min(cap, now / was);
}
