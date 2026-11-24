// Zach the singer's nights on the zoo paths (0.1.370; Austin's character notes for Zach, 24 Nov: "He should sing at the
// zoo, on random spots of the path of the zoo, where he also brings an open guitar case for people to donate money. He
// will have a merchandise store where he only sells fried chicken (it gives you 5 hunger bars, 20 zoo coins). He
// attracts more guests to his area." And: "dislikes all nights but Friday night. Friday night he is always amped.").
// No engine calls here.

export const BUSKER = "zach";
export const BUSK_WHY = "sing";
export const BUSK_SONG = "zoocraft.zach.song";
export const CHICKEN = "zoocraft:fried_chicken";

/** The days of a Minecraft week: the world's first day is a Monday. */
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const weekday = (day) => WEEKDAYS[((Math.floor(day) % 7) + 7) % 7];
export const isFriday = (day) => weekday(day) === "Friday";

/** Whether it is his time to sing: the night, `g.from` to `g.to` of the day's clock. */
export const showTime = (t, g) => t >= g.from && t < g.to;

/**
 * A path block to sing on next: any of the network's at random when he is nowhere yet; otherwise one between
 * `g.hop.min` and `g.hop.max` blocks from where he is, so the walk there is short (any other one when the paths have
 * none that near). `columns` is the path network's own map ("x,z" -> the y of each path block there).
 */
export function pickSpot(columns, from, random, g) {
  if (!(columns instanceof Map) || !columns.size) return undefined;
  const all = [];
  const near = [];
  for (const k of columns.keys()) {
    const i = k.indexOf(",");
    const x = Number(k.slice(0, i));
    const z = Number(k.slice(i + 1));
    all.push(k);
    if (!from) continue;
    const d = Math.hypot(x + 0.5 - from.x, z + 0.5 - from.z);
    if (d >= g.hop.min && d <= g.hop.max) near.push(k);
  }
  const pool = near.length ? near : all;
  const k = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  const ys = columns.get(k);
  if (!ys?.length) return undefined;
  const i = k.indexOf(",");
  return { x: Number(k.slice(0, i)), y: ys[Math.min(ys.length - 1, Math.floor(random() * ys.length))], z: Number(k.slice(i + 1)) };
}

/** Where the open guitar case and the fried chicken stand go: just in front of him, a little to his right. */
/**
 * 0.1.376: whether he may set up now, by what he is doing. As a night worker he walks to the zoo at dusk like any
 * resident, so a show that waited for him to be at home never began before midnight (Austin, 24 Nov: singing on a
 * path at night, no case and no stand). He sets up from home, from bed, or from that walk; not while a player has him
 * following or waiting, and never from another posting, a trip or work.
 */
export const HELD_STATES = ["following", "staying"];
export const freeToSing = (state, gatherable) => Boolean(gatherable) && !HELD_STATES.includes(state);

/**
 * 0.1.376: where his two props may stand, best first, as [ahead, side] steps from his feet turned by his facing: the
 * open guitar case in front of him, the chicken stall beside him. The runtime takes the first on open ground.
 */
export function propSpots(feet, yaw, g) {
  const r = (yaw * Math.PI) / 180;
  const fx = -Math.sin(r);
  const fz = Math.cos(r);
  const at = (ahead, side) => ({ x: feet.x + fx * ahead - fz * side, y: feet.y, z: feet.z + fz * ahead + fx * side });
  const a = g.caseAhead;
  const w = g.stallSide;
  return {
    case: [at(a, 0), at(a, 1), at(a, -1), at(-a, 0)],
    stall: [at(0, w), at(0, -w), at(a, w), at(a, -w), at(-a, w), at(-a, -w), at(2 * a, 0)],
  };
}

export function standSpot(feet, yaw, g) {
  const r = (yaw * Math.PI) / 180;
  const fx = -Math.sin(r);
  const fz = Math.cos(r);
  return { x: feet.x + fx * g.stand.ahead - fz * g.stand.side, y: feet.y, z: feet.z + fz * g.stand.ahead + fx * g.stand.side };
}

/** The Zoo Coins `guests` listeners drop in the case in one beat: each may tip; a Friday crowd tips more. */
export function tips(guests, friday, random, g) {
  let coins = 0;
  for (let i = 0; i < Math.min(guests, g.tip.maxGuests); i++) {
    if (random() >= g.tip.chance) continue;
    coins += g.tip.min + Math.floor(random() * (g.tip.max - g.tip.min + 1));
  }
  return friday ? coins * g.fridayTips : coins;
}

/** How hard his spot pulls the park's guests when they pick where to walk next (1 = like any other spot). */
export const pullOf = (friday, g) => (friday ? g.pull * g.fridayPull : g.pull);

/** Which of his lines he says between songs: amped on a Friday night, the night getting to him on any other. */
export const moodKey = (day) => (isFriday(day) ? "amped" : "nightGrump");

/** Buying a piece of fried chicken: "ok", or "poor" when the park cannot pay (free in a sandbox park). */
export const chickenCheck = (balance, price, free) => (free || (balance ?? 0) >= price ? "ok" : "poor");
