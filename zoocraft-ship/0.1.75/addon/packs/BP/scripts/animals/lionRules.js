// Lions (0.1.75, Big predators), pure: what a lion is doing, the pride's moods through the day, where a
// resting pride lies, the ledges it rests on, a wild pride's hunt, and what to tell players. Spec 5.2:
// "lion | Lion | Pride rest and scent investigation | Group dens, secure service access". The game side is
// animals/lion.js; the dens, the service gates and the danger to players are animals/predatorRules.js and
// animals/predators.js (every `dangerous` species). Facts and sources: research/predators_facts.md.

// The lion mobs, found by type (0.1.70: never by family alone).
export const LION_TYPES = ["zoocraft:lion", "zoocraft:wild_lion"];

// What a lion is doing (its zoocraft:act entity property): the client plays the matching animation
// (gen/lion_anim.py) and the Field Journal watches for it. 0 nothing in particular (standing, or walking
// where the engine takes it); alert (staring, ears up); warning (crouched, ears flat, snarling, tail
// lashing); the swipe; roaring; lying on its chest; asleep on its side; asleep on its back; rubbing heads
// with a pride mate; licking a pride mate; sniffing; the flehmen grimace; spraying; scraping with the
// hind feet; nursing (a lioness on her side; a cub suckling); a cub at play; drinking; eating at a feeder;
// eating lying down; sitting; stalking; trotting; charging (the gallop); walking where the script takes
// it; yawning; clawing a post or tree.
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
  lick: 9,
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
};
// Lying down (the client plays lying down, holds it, and gets up when the act changes; asleep on its
// side or back it rolls over first and back): on its chest, asleep, eating with the meat between its
// paws, and a lioness nursing.
export const DOWN_ACTS = [ACT.lie, ACT.sleep, ACT.sleepBack, ACT.eat];
// The client's going down and getting up, in ticks (gen/lion_poses.py: lying down 2.0 s, getting up 1.5,
// onto the side 1.3, off it 1.2, onto the back and off it 1.0 each, sitting 1.1 and up 0.8; the swipe 0.9).
export const TICKS = { down: 40, up: 30, toSide: 26, fromSide: 24, toBack: 20, fromBack: 20, sit: 22, sitUp: 16, swipe: 18 };

// How fast the script walks, trots, charges and stalks a lion, in blocks a tick: the client's strides
// (gen/lion_anim.py: 1.06, 2.5, 6 and 0.55 blocks a second, whatever its size), so the paws keep time with
// the ground. The charge is faster than a sprinting player (5.6 blocks a second): a lion charging from
// close can't be outrun, as a real one can't (up to 80 km/h in a short rush).
export const PACE = { walk: 1.06 / 20, trot: 2.5 / 20, gallop: 6.0 / 20, stalk: 0.55 / 20 };

// ---------------- the pride ----------------
// A lion's role: "male" (a grown male, the maned one), "lioness" (a grown female) or "cub".
export function roleOf(a) {
  if (a.juvenile) return "cub";
  return a.sex === "male" ? "male" : "lioness";
}

// A wild lion has no record: its sex is its coat (minecraft:variant 1, the maned male).
export function wildRole(variant) {
  return variant === 1 ? "male" : "lioness";
}

// ---------------- the day ----------------
// Lions rest 20 hours of the 24, and are most active at dusk, through the night and at dawn; a pride
// roars mostly at dusk and before dawn (the roars carry 8 km). World time of day: 0 sunrise, 6000 noon,
// 12000 sunset, 18000 midnight.
export function dayPart(timeOfDay) {
  const t = ((timeOfDay % 24000) + 24000) % 24000;
  if (t >= 11500 && t < 13500) return "dusk";
  if (t >= 22500 || t < 500) return "dawn";
  if (t >= 13500 && t < 22500) return "night";
  return t >= 4000 && t < 9000 ? "midday" : "day";
}

/**
 * The pride's mood for a while: "rest" (a pile in the shade or on the ledges, flat out, touching),
 * "social" (head rubs, licking, a cub's play), "patrol" (a walk along the fence, sniffing, scent
 * marking), "roar" (the pride's chorus) or "play" (cubs; only with cubs).
 * @param {string} part dayPart(); @param {boolean} cubs any cubs in the pride
 */
export function pickMood(part, cubs, L, random = Math.random) {
  const w = { ...L.moods[part] };
  if (!cubs) w.play = 0;
  const total = Object.values(w).reduce((s, v) => s + v, 0);
  let r = random() * total;
  for (const [mood, v] of Object.entries(w)) {
    if ((r -= v) < 0) return mood;
  }
  return "rest";
}

// ---------------- resting together ----------------
/**
 * Where a resting pride lies: side by side, touching (each lion's body 0.75 of a block from the next,
 * shoulder to shoulder, alternately head to head and head to tail), from `anchor` along `yaw` and across
 * it, in rows of four. Lionesses and cubs together, the male a little apart (males often rest a few
 * metres off). Returns [{ x, z, yaw }] (x, z: the middle of the lion), one per lion in `ids` order.
 * @param {{ x: number, z: number }} anchor @param {number} yaw @param {string[]} roles roleOf each
 */
export function pilePlaces(anchor, yaw, roles, L) {
  const r = (yaw * Math.PI) / 180;
  const fwd = { x: -Math.sin(r), z: Math.cos(r) };
  const side = { x: Math.cos(r), z: Math.sin(r) };
  const out = [];
  let k = 0;
  let males = 0;
  for (const role of roles) {
    if (role === "male") {
      // A grown male rests a body length and a half off the end of the pile, across it.
      const d = L.pile.maleOff + males * L.pile.gap * 1.6;
      males++;
      out.push({ x: anchor.x - side.x * d, z: anchor.z - side.z * d, yaw: (yaw + 90) % 360 });
      continue;
    }
    const row = Math.floor(k / L.pile.perRow);
    const col = k % L.pile.perRow;
    const gap = role === "cub" ? L.pile.gap * 0.7 : L.pile.gap;
    const across = col * gap;
    const along = row * L.pile.rowGap;
    out.push({ x: anchor.x + side.x * across + fwd.x * along, z: anchor.z + side.z * across + fwd.z * along, yaw: k % 2 ? (yaw + 180) % 360 : yaw });
    k++;
  }
  return out;
}

// ---------------- ledges ----------------
// A raised place to rest and look out from (zoo lion exhibits give every lion one: a rock ledge, a log
// platform), here a floor block 1 or 2 blocks higher than a floor block beside it. `cells`: the exhibit's
// measured blocks ("x,y,z" -> category), its floor the "land" blocks.
export function ledgesOf(cells) {
  const land = new Set();
  for (const [k, v] of cells) if (v === "land") land.add(k);
  const out = [];
  for (const k of land) {
    const [x, y, z] = k.split(",").map(Number);
    const raised = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => land.has(`${x + dx},${y - 1},${z + dz}`) || land.has(`${x + dx},${y - 2},${z + dz}`));
    if (raised) out.push({ x, y, z });
  }
  return out;
}

// Ledge blocks the pride needs: L.ledgePerLion for each grown lion (a lion lying down covers two).
export function ledgesNeeded(animals, L) {
  return animals.filter((a) => !a.juvenile).length * L.ledgePerLion;
}

// ---------------- the wild hunt ----------------
/**
 * What a hunting wild lion does about its target this half second (animals/lion.js picks the player it
 * spotted, glides the lion at the pace of each step and lands the bite; the entity never attacks by the
 * engine): lionesses stalk a
 * far target low and slow (stalking: the client's crouched gait), then charge from L.hunt.chargeRange;
 * a male holds back roaring for L.hunt.maleHoldTicks, then joins the charge. Close in (reach) it bites
 * and swipes ("attack": the bite, every L.hunt.biteTicks).
 * @returns {"stalk"|"charge"|"hold"|"attack"}
 */
export function huntStep(role, dist, sinceTicks, L) {
  if (dist <= L.hunt.reach) return "attack";
  if (role === "male" && sinceTicks < L.hunt.maleHoldTicks) return "hold";
  if (dist > L.hunt.chargeRange && sinceTicks < L.hunt.stalkTicks) return "stalk";
  return "charge";
}

// The Field Journal and the clipboard: how dangerous wild lions are.
export function wildLine(L) {
  return `Wild lions hunt people: a pride spots anyone within ${L.hunt.spotDay} blocks by day and ${L.hunt.spotNight} at dusk and by night (half that sneaking), stalks low, then charges faster than you can sprint and bites for 4 hearts. Throw a Meat Ration down near one: while it eats it's calm and can be crated.`;
}

// What the pride needs, for the clipboard's warnings: [{ severity, text }].
export function prideWarnings(ex, animals, ledges, L) {
  const out = [];
  const need = ledgesNeeded(animals, L);
  if (need && ledges < need) out.push({ severity: 2, text: `Lions rest up high: ${ledges} of ${need} ledge blocks (a floor block 1 or 2 higher than the floor beside it: a rock shelf, a log platform), ${L.ledgePerLion} for each grown lion` });
  const males = animals.filter((a) => !a.juvenile && a.sex === "male").length;
  if (males > L.coalitionMax) out.push({ severity: 2, text: `${males} grown males: a pride holds a coalition of ${L.coalitionMax} at most, and rivals fight` });
  return out;
}
