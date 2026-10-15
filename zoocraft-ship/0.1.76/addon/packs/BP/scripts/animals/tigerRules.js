// Tigers (0.1.76, Big predators), pure: what a tiger is doing, its mood through the day, the turns grown
// tigers take out of the Holding Dens, the introduction days, the screened floor they need for privacy, a
// wild tiger's ambush, and what to tell players. Spec 5.2: "tiger | Tiger | Solitary patrolling and
// swimming | Privacy and separate adult territories". The game side is animals/tiger.js and
// animals/tigerTurns.js; the dens, the service gates and the danger to players are animals/predatorRules.js
// and animals/predators.js (every `dangerous` species). Facts and sources: research/predators_facts.md and
// research/predators_plan.md ("Tiger (0.1.76)").

// The tiger mobs, found by type (0.1.70: never by family alone).
export const TIGER_TYPES = ["zoocraft:tiger", "zoocraft:wild_tiger"];

// What a tiger is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/tiger_anim.py) and the Field Journal watches for it. The lion's numbers where a tiger does the same
// thing (animals/predators.js asks both the same way), its own from 26: swimming, soaking, the ambush, the
// pounce, chuffing, rolling and sparring. 8 is the cheek rub on a post or tree, 9 grooming (lying), 25
// rearing up to claw high.
export const ACT = {
  none: 0,
  alert: 1,
  warn: 2,
  swipe: 3,
  roar: 4,
  lie: 5,
  sleep: 6,
  sleepBack: 7,
  rub: 8,
  groom: 9,
  sniff: 10,
  flehmen: 11,
  spray: 12,
  scrape: 13,
  nurse: 14,
  play: 15,
  drink: 16,
  feed: 17,
  eat: 18,
  sit: 19,
  stalk: 20,
  trot: 21,
  gallop: 22,
  walk: 23,
  yawn: 24,
  claw: 25,
  swim: 26,
  soak: 27,
  ambush: 28,
  pounce: 29,
  chuff: 30,
  roll: 31,
  spar: 32,
};
// Lying down (the client plays lying down, holds it, and gets up when the act changes; asleep on its side
// or back it rolls over first and back): on its chest, asleep, eating, grooming, soaking, rolling.
export const DOWN_ACTS = [ACT.lie, ACT.sleep, ACT.sleepBack, ACT.eat, ACT.groom, ACT.soak, ACT.roll];
// The client's going down and getting up, in ticks (gen/tiger_poses.py: lying down 2.0 s, getting up 1.5,
// onto the side 1.3, off it 1.2, onto the back and off it 1.0 each, sitting 1.1 and up 0.8; the swipe 0.9,
// the pounce 0.85).
export const TICKS = { down: 40, up: 30, toSide: 26, fromSide: 24, toBack: 20, fromBack: 20, sit: 22, sitUp: 16, swipe: 18, pounce: 17 };

// How fast the script walks, trots, rushes, stalks and swims a tiger, in blocks a tick: the client's strides
// (gen/tiger_anim.py: 1.0, 2.3, 7.0, 0.5 and 0.8 blocks a second, whatever its size), so the paws keep time
// with the ground. The rush is faster than a sprinting player (5.6 blocks a second): a tiger rushing from
// close can't be outrun, as a real one can't (it closes 10 to 20 m in a couple of bounds).
export const PACE = { walk: 1.0 / 20, trot: 2.3 / 20, gallop: 7.0 / 20, stalk: 0.5 / 20, swim: 0.8 / 20 };

// Its size against a tigress's (the client's scale: a tigress 0.5, a male 0.572, a cub 0.225).
export function sizeOf(role) {
  return role === "cub" ? 0.45 : role === "male" ? 1.144 : 1;
}

// Swimming in water 2 or more deep, where it stands (its feet) so the line of its back is just under the
// surface and the head up out of it. cellY: the top water block's y (the water's surface is 0.89 up it);
// a tigress's back is 0.875 of a block over her feet (gen/tiger.py), the others' by their size.
export function swimY(cellY, role) {
  return cellY + 0.89 - 0.08 - 0.875 * sizeOf(role);
}

// ---------------- who's who ----------------
// A tiger's role: "male", "tigress" or "cub". The record keeps its sex (tigers aren't told by coat).
export function roleOf(a) {
  if (a.juvenile) return "cub";
  return a.sex === "male" ? "male" : "tigress";
}

// A wild tiger has no record: its sex is its minecraft:mark_variant (1 a male).
export function wildRole(markVariant) {
  return markVariant === 1 ? "male" : "tigress";
}

// ---------------- the day ----------------
/**
 * A tiger's mood for a while: "rest" (alone in the shade, on a ledge, behind a screen: lying, asleep,
 * grooming), "patrol" (its boundary walk, marking), "swim" (across the pool and out), "soak" (lying in the
 * shallows up to its neck, mostly at midday), "roar" (rare, at dusk and dawn) or "play" (a tigress's cubs;
 * only with cubs). No pool: no swim; no shallows: no soak.
 * @param {string} part dayPart() (animals/lionRules.js)
 * @param {{ cubs?: boolean, deep?: boolean, shallow?: boolean }} has
 */
export function pickMood(part, has, T, random = Math.random) {
  const w = { ...T.moods[part] };
  if (!has.cubs) w.play = 0;
  if (!has.deep) w.swim = 0;
  if (!has.shallow) w.soak = 0;
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  if (total <= 0) return "rest";
  let r = random() * total;
  for (const [mood, v] of Object.entries(w)) {
    if ((r -= v) < 0) return mood;
  }
  return "rest";
}

// ---------------- turns through the dens ----------------
/**
 * The exhibit's tigers as the groups that take turns out: each grown tiger alone, but a tigress with her
 * cubs (the young whose mother she is) one group. Cubs whose mother isn't here are in no group: they're
 * no danger and no rival, and stay out. In a stable order (by the grown one's id), so the turns come
 * round the same way each time.
 * @param {{ id: string, juvenile?: boolean, sex?: string, parents?: string[] }[]} tigers
 * @returns {{ key: string, ids: string[], grown: string[], male: boolean, cubs: number }[]}
 */
export function groupsOf(tigers) {
  const grown = tigers.filter((a) => !a.juvenile).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const groups = grown.map((a) => ({ key: a.id, ids: [a.id], grown: [a.id], male: a.sex === "male", cubs: 0 }));
  for (const c of tigers.filter((a) => a.juvenile)) {
    const g = groups.find((x) => x.key === c.parents?.[0]);
    if (g) {
      g.ids.push(c.id);
      g.cubs++;
    }
  }
  return groups;
}

// An introduction day (tigers meet only to mate: AZA, introductions during oestrus and only for breeding):
// one park day in T.introEvery, while breeding is on and there's a grown male and a grown tigress without
// cubs. Returns the two groups let out together that day, or undefined.
export function introPair(groups, day, breeding, T) {
  if (!breeding || day % T.introEvery !== 0) return undefined;
  const males = groups.filter((g) => g.male);
  const females = groups.filter((g) => !g.male && g.grown.length && !g.cubs);
  if (!males.length || !females.length) return undefined;
  const k = Math.floor(day / T.introEvery);
  return [males[k % males.length], females[k % females.length]];
}

/**
 * Which groups are out today: every group while there's only one; else one group's turn a park day, in
 * order (the Smithsonian's daily rotation: "visitors may see a different tiger each day"); on an
 * introduction day the pair. Returns { out: Set of group keys, intro }.
 */
export function turnPlan(groups, day, breeding, T) {
  if (groups.length < 2) return { out: new Set(groups.map((g) => g.key)), intro: false };
  const pair = introPair(groups, day, breeding, T);
  if (pair) return { out: new Set(pair.map((g) => g.key)), intro: true };
  return { out: new Set([groups[((day % groups.length) + groups.length) % groups.length].key]), intro: false };
}

// Park days until this group's turn comes round again (0: today), as turnPlan rotates them.
export function daysToTurn(groups, key, day) {
  const i = groups.findIndex((g) => g.key === key);
  if (i < 0 || groups.length < 2) return 0;
  return (((i - day) % groups.length) + groups.length) % groups.length;
}

/**
 * Turn changes: who has to go in first and who may come out. The ones out of turn are called into a den
 * first; only when every one of them is in are the ones whose turn it is let out (never two grown tigers
 * loose together but on an introduction day). A tiger let out on the wrong day is called back.
 * @param {{ id: string, juvenile?: boolean, denned: boolean, turnDen: boolean }[]} tigers denned: shut in
 *   a Holding Den; turnDen: shut in by the turns (not by a player or a keeper)
 * @returns {{ callIn: string[], letOut: string[] }} grown tigers' ids (cubs go with their mother)
 */
export function turnSteps(groups, plan, tigers) {
  const byId = new Map(tigers.map((t) => [t.id, t]));
  const callIn = [];
  const letOut = [];
  for (const g of groups) {
    for (const id of g.grown) {
      const t = byId.get(id);
      if (!t) continue;
      if (!plan.out.has(g.key) && !t.denned) callIn.push(id);
      if (plan.out.has(g.key) && t.denned && t.turnDen) letOut.push(id);
    }
  }
  return { callIn, letOut: callIn.length ? [] : letOut };
}

// Two or more grown tigers loose together, but for a male and a tigress on their introduction day: they
// fight (rear up and swat), comfort sinks, and nobody breeds.
export function clash(looseGrown, intro) {
  if (looseGrown.length < 2) return false;
  if (!intro || looseGrown.length > 2) return true;
  const males = looseGrown.filter((a) => a.sex === "male").length;
  return males !== 1;
}

// The clipboard's line: whose turn it is, who's shut in and when each is out next.
// groups: groupsOf(); names: id -> name; day: the park day.
export function turnsLine(groups, plan, names, day) {
  if (groups.length < 2) return undefined;
  const nameOf = (g) => {
    const lead = names.get(g.grown[0]) ?? "a tiger";
    return g.cubs ? `${lead} and her ${g.cubs === 1 ? "cub" : "cubs"}` : lead;
  };
  const out = groups.filter((g) => plan.out.has(g.key)).map(nameOf);
  const rest = groups
    .filter((g) => !plan.out.has(g.key))
    .map((g) => {
      const d = daysToTurn(groups, g.key, day);
      return `${nameOf(g)} (out ${d === 1 ? "tomorrow" : `in ${d} days`})`;
    });
  const many = out.length > 1 || groups.some((g) => plan.out.has(g.key) && g.cubs);
  const head = plan.intro ? `${out.join(" and ")} are out together today: an introduction day` : `${out.join(" and ")} ${many ? "are" : "is"} out today`;
  if (!rest.length) return `Turns: ${head}`;
  return `Turns: ${head}; ${rest.join(", ")} in ${rest.length === 1 ? "a Holding Den" : "Holding Dens"}`;
}

// ---------------- privacy ----------------
// Screened floor blocks the tigers need: T.screenPerTiger for each grown one (a place to get out of sight
// of people and each other: AZA, "rock outcroppings, hills, and foliage").
export function screensNeeded(animals, T) {
  return animals.filter((a) => !a.juvenile).length * T.screenPerTiger;
}

// Is a floor block screened? At least 2 of the 8 blocks round it at head height (the block over the floor
// block's own head block, y + 1) hide a tiger: solid ground, rock, leaves or a tree trunk ("solid",
// "leaves" or "log" from a climb reader: glass, panes, fences and walls are see-through or part of the
// fence, and don't). at(dx, dz): the category there. The exhibit measure counts them
// (exhibits/geometry.js, ex.screenCells and ex.screenSpots).
export function isScreened(at) {
  let n = 0;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const c = at(dx, dz);
    if (c === "solid" || c === "leaves" || c === "log") n++;
  }
  return n >= 2;
}

// What the tigers need, for the clipboard's warnings: [{ severity, text }].
export function tigerWarnings(ex, animals, looseGrown, intro, T) {
  const out = [];
  const need = screensNeeded(animals, T);
  const have = ex.screenCells;
  if (need && have !== undefined && have < need) out.push({ severity: 2, text: `Tigers want privacy, somewhere out of sight: ${have} of ${need} screened floor blocks, ${T.screenPerTiger} for each grown tiger. A floor block is screened with 2 or more blocks of rock, earth, leaves or tree trunk round it at head height (a boulder, a bank, bushes; glass and fences don't hide them)` });
  if (clash(looseGrown, intro)) out.push({ severity: 3, text: `${looseGrown.length} grown tigers are loose together and fighting: tigers live alone. Give each a Holding Den and they take turns out` });
  return out;
}

// ---------------- the wild ambush ----------------
// Is the player looking toward the tiger (within T.hunt.lookDeg of straight at it, across the ground)?
// view: the player's view direction; from: the player; to: the tiger.
export function looking(view, from, to, deg) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  const vl = Math.hypot(view.x, view.z);
  if (len < 1e-6 || vl < 1e-6) return true;
  return (dx * view.x + dz * view.z) / (len * vl) >= Math.cos((deg * Math.PI) / 180);
}

/**
 * A hunting wild tiger, each half second (animals/tiger.js moves it and lands the blows; the entity never
 * attacks by the engine). It comes on low only while its target's back is turned ("stalk"); looked at, it
 * freezes flat ("freeze"), and stared at for T.hunt.stareTicks while still beyond rushing range it gives up
 * for T.hunt.giveUpTicks ("giveup": the Sundarbans masks worked). From T.hunt.rushBack blocks with the
 * target's back turned, or from T.hunt.rushAny whatever, it rushes ("rush", at 7 blocks a second); within
 * T.hunt.pounceRange it leaps ("pounce", once a rush) and within reach it bites ("attack"). A rush lasts
 * T.hunt.rushTicks at most (tigers aren't built for long runs), then it rests T.hunt.restTicks ("rest")
 * and stalks again. Hurt by the target (see.hurt), it rushes at once.
 * @param {object|undefined} H the hunt so far ({ phase, since, stareFrom, rushFrom, restUntil, giveUpUntil, pounced })
 * @param {{ dist: number, looked: boolean, hurt?: boolean }} see
 * @returns {object} the hunt now; .step is what to do
 */
export function huntStep(H, see, now, T) {
  const h = { phase: "stalk", since: now, stareFrom: undefined, rushFrom: undefined, restUntil: 0, giveUpUntil: 0, pounced: false, ...(H ?? {}) };
  const t = T.hunt;
  if (now < h.giveUpUntil && !see.hurt) return { ...h, step: "giveup" };
  if (now < h.restUntil) return { ...h, step: "rest" };
  if (h.phase === "rush") {
    if (see.dist <= t.reach) return { ...h, rushFrom: now, step: "attack" };
    if (now - h.rushFrom > t.rushTicks) return { ...h, phase: "stalk", rushFrom: undefined, pounced: false, restUntil: now + t.restTicks, stareFrom: undefined, step: "rest" };
    if (see.dist <= t.pounceRange && !h.pounced) return { ...h, pounced: true, step: "pounce" };
    return { ...h, step: "rush" };
  }
  // Stalking.
  if (see.hurt || see.dist <= t.rushAny || (!see.looked && see.dist <= t.rushBack)) return { ...h, phase: "rush", rushFrom: now, pounced: false, stareFrom: undefined, step: see.dist <= t.pounceRange ? "pounce" : "rush", ...(see.dist <= t.pounceRange ? { pounced: true } : {}) };
  if (see.looked) {
    const from = h.stareFrom ?? now;
    if (now - from >= t.stareTicks) return { ...h, stareFrom: undefined, giveUpUntil: now + t.giveUpTicks, step: "giveup" };
    return { ...h, stareFrom: from, step: "freeze" };
  }
  return { ...h, stareFrom: undefined, step: "stalk" };
}

// The Field Journal and the clipboard: how dangerous wild tigers are.
export function wildLine(T) {
  return `Wild tigers hunt people from ambush: one spots anyone within ${T.hunt.spotDay} blocks by day and ${T.hunt.spotNight} at dusk and by night (half that sneaking) and creeps up while your back is turned, freezing flat when you look. Facing it helps: stared down long enough, it gives up. From ${T.hunt.rushBack} blocks behind you (${T.hunt.rushAny} if you face it) it rushes faster than you can sprint and pounces for 5 hearts, and it swims after you. Throw a Meat Ration down near one: while it eats it's calm and can be crated.`;
}
