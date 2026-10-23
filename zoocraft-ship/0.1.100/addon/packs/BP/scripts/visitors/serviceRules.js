// Guest services (spec sections 12 and 13), pure: snack sales, litter, donations and the
// "services" satisfaction factor. Whole coins only; fractions carry over between visitor steps.

// Whole part of a running total, ignoring floating-point dust (0.35 * 20 is 6.9999...).
const whole = (x) => Math.floor(x + 1e-9);

// Share of arriving guests who buy a snack at this price.
export function snackShare(price, balance) {
  const s = balance.snacks;
  const share = price <= s.fair ? s.shareAtFair + (s.fair - price) * s.sharePerCoinUnder : s.shareAtFair - (price - s.fair) * s.sharePerCoinOver;
  return Math.max(0, Math.min(s.shareMax, share));
}

// One visitor step at one stand: `guests` passed it, `carry` is the fraction left from before.
// Never sells more than the stand holds.
export function snackSales({ guests, price, stock, carry = 0 }, balance) {
  const expected = carry + guests * snackShare(price, balance);
  const wanted = whole(expected);
  const sold = Math.max(0, Math.min(stock, wanted));
  // Guests who found the stand empty don't wait around: their fraction is dropped.
  return { sold, revenue: sold * price, carry: sold < wanted ? 0 : Math.max(0, expected - wanted) };
}

// Litter from one step goes into bins with room, in order; whatever doesn't fit lands on the
// paths. `bins` is a list of fill levels; returns the new levels and the overflow.
export function litterFlow(amount, bins, balance) {
  const cap = balance.litter.binCapacity;
  let left = amount;
  const fills = bins.map((fill) => {
    const room = Math.max(0, cap - fill);
    const put = Math.min(room, left);
    left -= put;
    return fill + put;
  });
  return { fills, overflow: left };
}

export function litterProduced(guests, snacksSold, balance) {
  return guests * balance.litter.perGuest + snacksSold * balance.litter.perSnack;
}

// Guests drop coins into Donation Boxes near exhibits they can see. Happier animals, more coins.
// `boxes` counts working boxes; `welfare` is the average welfare of the viewed animals (0..100).
export function donations({ guests, boxes, welfare, carry = 0 }, balance) {
  const d = balance.donations;
  const coverage = Math.min(1, boxes / d.boxesForFull);
  const expected = carry + guests * d.perGuest * (welfare / 100) * coverage;
  const coins = whole(expected);
  return { coins, carry: Math.max(0, expected - coins) };
}

export function benchesNeeded(demandPerDay, balance) {
  return Math.max(balance.seating.minBenches, Math.ceil(demandPerDay / balance.seating.guestsPerBench));
}

export function standsNeeded(demandPerDay, balance) {
  return Math.max(1, Math.ceil(demandPerDay / balance.snacks.guestsPerStand));
}

// Restrooms and Water Fountains (0.1.100): one for every `guestsPer` expected daily guests, `min` at least.
export function restroomsNeeded(demandPerDay, balance) {
  const r = balance.restrooms;
  return Math.max(r.min, Math.ceil(demandPerDay / r.guestsPer));
}

export function fountainsNeeded(demandPerDay, balance) {
  const d = balance.drinks;
  return Math.max(d.min, Math.ceil(demandPerDay / d.guestsPer));
}

// A restroom or drinking-water part of the services score: `none` with none at all (guests make do), 100 with all
// that's needed, in between by the share there is.
export function facilityPart(count, need, cfg) {
  return Math.round(cfg.none + (100 - cfg.none) * Math.min(1, need > 0 ? count / need : 1));
}

// The services factor and its weakest part. `stands` counts linked stands with food; `standsEmpty`
// linked stands that ran out; `unlinked` service blocks no path reaches; `benchCover` the share of the paths
// with a bench near (0.1.99, pathCoverage): enough benches all in one corner count for less; `restrooms` and
// `fountains` the working Restrooms and Water Fountains (0.1.100).
export function servicesScore({ stands, standsEmpty, benches, litter, demand, unlinked, benchCover = 1, restrooms = 0, fountains = 0 }, balance) {
  const food = Math.round(100 * Math.min(1, stands / standsNeeded(demand, balance)));
  const seating = Math.round(100 * Math.min(1, benches / benchesNeeded(demand, balance)) * seatingSpread(benchCover, balance));
  const tidy = Math.round(Math.max(0, 100 - litter * balance.litter.scorePerUnit));
  const loos = facilityPart(restrooms, restroomsNeeded(demand, balance), balance.restrooms);
  const drinks = facilityPart(fountains, fountainsNeeded(demand, balance), balance.drinks);
  const w = balance.services.weights;
  const score = Math.round(w.food * food + w.seating * seating + w.litter * tidy + w.restrooms * loos + w.drinks * drinks);
  const parts = { food, seating, litter: tidy, restrooms: loos, drinks };
  let worst = "food";
  for (const k of ["seating", "litter", "restrooms", "drinks"]) if (parts[k] < parts[worst]) worst = k;
  // Say why food is missing: a stand ran out, or nothing a path reaches.
  let detail = worst;
  if (worst === "food" && standsEmpty > 0) detail = "restock";
  else if (worst !== "litter" && unlinked > 0) detail = "paths";
  return { score, parts, worst, detail };
}

// --- Coverage (0.1.99, research/guests_plan.md and guests_facts.md) ---
// A reached path block is covered by a Litter Bin (or a Bench) when a working one stands within `range` blocks
// sideways (a circle) and `rise` up or down (from the ground it stands on, one under its block: level with the path
// beside it). Bins: 12 blocks, about the distance past which people litter more
// (Keep America Beautiful's 2009 study: litterers were on average 29 feet, 9 m, from the nearest bin); benches:
// 25 blocks, half the 50 m most between seats on a busy footway (the UK's Inclusive Mobility, 4.5).

/**
 * The share of a path network within reach of the points, worked out a point a slice. `columns` is the network's
 * "x,z" -> path block heights (visitors/paths.js), `total` its path block count.
 * @param {Map<string, number[]>} columns
 * @param {number} total
 * @param {{ x: number, y: number, z: number }[]} points
 * @param {number} range
 * @param {number} rise
 */
export function* coverageSteps(columns, total, points, range, rise) {
  const covered = new Set();
  for (const p of points) {
    for (let dx = -range; dx <= range; dx++) {
      const span = Math.floor(Math.sqrt(range * range - dx * dx));
      for (let dz = -span; dz <= span; dz++) {
        const x = p.x + dx, z = p.z + dz;
        const ys = columns.get(`${x},${z}`);
        if (!ys) continue;
        for (const y of ys) if (Math.abs(y - (p.y - 1)) <= rise) covered.add(`${x},${y},${z}`);
      }
    }
    yield;
  }
  return { covered: covered.size, total, share: total ? Math.min(1, covered.size / total) : 0 };
}

export function pathCoverage(columns, total, points, range, rise) {
  const steps = coverageSteps(columns, total, points, range, rise);
  for (;;) {
    const r = steps.next();
    if (r.done) return r.value;
  }
}

// The share of the litter that goes to the bins: half with bins only by the gate, all with bins along every path.
export function binnedShare(binCover, balance) {
  const base = balance.litter.binnedBase;
  return base + (1 - base) * Math.max(0, Math.min(1, binCover));
}

// What the seating part counts for, by how far apart the benches are: 70% bunched up, all of it spread out.
export function seatingSpread(benchCover, balance) {
  const base = balance.seating.spreadBase;
  return base + (1 - base) * Math.max(0, Math.min(1, benchCover));
}

// Bins for a day's litter from `demandPerDay` guests (each drops some, and more after a snack at the fair price).
export function binsNeeded(demandPerDay, balance) {
  const l = balance.litter;
  return Math.max(l.minBins, Math.ceil((demandPerDay * (l.perGuest + l.perSnack * balance.snacks.shareAtFair)) / l.binCapacity));
}

/**
 * The bonus for a well-furnished park: each amenity that covers its share of the paths, with enough of them for the
 * guests, brings a few more guests a day; all together capped. `parts` maps an amenity to { cover, count, need }
 * (cover undefined while it's being worked out). Returns { bonus, parts: { key: { ...in, goal, met, bonus } } }.
 */
export function amenityBonus(parts, balance) {
  const a = balance.amenities;
  const out = {};
  let bonus = 0;
  for (const [key, p] of Object.entries(parts)) {
    const goal = a[key]?.cover ?? 1;
    const met = p.cover !== undefined && p.cover >= goal - 1e-9 && p.count >= p.need;
    const b = met ? (a[key]?.guests ?? 0) : 0;
    bonus += b;
    out[key] = { ...p, goal, met, bonus: b };
  }
  return { bonus: Math.min(a.cap, bonus), parts: out };
}

const pct = (x) => `${Math.round(x * 100)}%`;
const bonusPct = (x) => `${Math.round(x * 1000) / 10}%`; // 2.5%
const AMENITY_LABEL = { bins: ["Litter Bins", "Litter Bin"], benches: ["Benches", "Bench"], lamps: ["Path Lamps", "Path Lamp"], planters: ["Planters", "Planter"] };
const COVER_ONLY = new Set(["lamps", "planters"]); // count only by how much of the paths they cover (0.1.100)

/** The Park Ledger's lines for the amenities and the bonus, each with its reason. */
export function amenityLines(amen, balance) {
  const lines = [];
  for (const [key, p] of Object.entries(amen.parts)) {
    const [many, one] = AMENITY_LABEL[key] ?? [key, key];
    const n = `${p.count} ${p.count === 1 ? one : many}`;
    const count = COVER_ONLY.has(key) ? n : `${n} (${p.need} needed)`;
    if (p.cover === undefined) {
      lines.push(`§f${many}: §7${count}, §8checking how much of the paths they cover...`);
      continue;
    }
    const gain = `+${bonusPct(balance.amenities[key].guests)} guests a day`;
    let what, reach;
    if (key === "lamps") {
      what = `lighting ${pct(p.cover)} of the paths at night`;
      reach = `${pct(p.goal)} of the paths lit: ${gain}`;
    } else if (key === "planters") {
      what = `near ${pct(p.cover)} of the paths`;
      reach = `near ${pct(p.goal)} of the paths: ${gain}`;
    } else {
      what = `near ${pct(p.cover)} of the paths: ${key === "bins" ? `they catch ${pct(binnedShare(p.cover, balance))} of the litter` : `seating counts ${pct(seatingSpread(p.cover, balance))}`}`;
      reach = `near ${pct(p.goal)} of the paths with ${p.need} or more: ${gain}`;
    }
    lines.push(`§f${many}: §7${count}, ${what}. ${p.met ? `§a+${bonusPct(p.bonus)} guests a day` : `§8(${reach})`}`);
  }
  lines.push(`§fWell-furnished park: §7${amen.bonus > 0 ? `+${bonusPct(amen.bonus)} guests a day` : "no bonus yet"} §8(up to +${bonusPct(balance.amenities.cap)})`);
  return lines;
}

const FACILITY_LABEL = { restrooms: ["Restrooms", "Restroom"], fountains: ["Water Fountains", "Water Fountain"] };

/**
 * The Park Ledger's lines for the Restrooms and Water Fountains (0.1.100): how many against the need, what their part
 * of the services counts, and what would bring it to 100. `fac` maps restrooms and fountains to { count, need, part }.
 */
export function facilityLines(fac) {
  return Object.entries(fac).map(([key, f]) => {
    const [many, one] = FACILITY_LABEL[key] ?? [key, key];
    const has = f.count ? `${f.count} ${f.count === 1 ? one : many}` : "none";
    const more = f.count >= f.need ? "" : ` §8(${f.need} beside the paths bring${f.need === 1 ? "s" : ""} it to 100)`;
    return `§f${many}: §7${has} (${f.need} needed): counts ${f.part}${f.count ? "" : ", guests make do"}.${more}`;
  });
}

// --- Gift Shop (spec section 12: shops) ---

// Share of guests who buy a souvenir on their way out at this price, before how memorable the
// visit was.
export function giftShare(price, balance) {
  const g = balance.giftShop;
  const share = price <= g.fair ? g.shareAtFair + (g.fair - price) * g.sharePerCoinUnder : g.shareAtFair - (price - g.fair) * g.sharePerCoinOver;
  return Math.max(0, Math.min(g.shareMax, share));
}

// How memorable the visit was (0..1): happy animals guests could see, and more than one kind.
// `welfare` is the average welfare of the viewed animals (0..100), `species` how many kinds they saw.
export function memorable(welfare, species, balance) {
  const g = balance.giftShop;
  if (species <= 0) return 0;
  const happy = g.welfareFloor + (1 - g.welfareFloor) * (welfare / 100);
  const variety = Math.min(1, g.varietyBase + g.varietyPerSpecies * species);
  return happy * variety;
}

// One visitor step at one shop: like a Snack Stand, never sells more than the shop holds.
export function giftSales({ guests, price, stock, carry = 0, welfare, species }, balance) {
  const expected = carry + guests * giftShare(price, balance) * memorable(welfare, species, balance);
  const wanted = whole(expected);
  const sold = Math.max(0, Math.min(stock, wanted));
  return { sold, revenue: sold * price, carry: sold < wanted ? 0 : Math.max(0, expected - wanted) };
}
