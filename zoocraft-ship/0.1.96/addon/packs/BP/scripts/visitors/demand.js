// Guests as numbers (spec section 12; research doc: visible guests come later as cosmetic NPCs).
// Pure. Demand per park day comes from the park rating and how many occupied exhibits are open.

export function dailyDemand({ stars, occupiedExhibits }, balance) {
  if (occupiedExhibits <= 0) return 0;
  const attraction = Math.min(1, 0.4 + 0.2 * occupiedExhibits); // 1 exhibit 0.6, 3+ exhibits 1.0
  return balance.economy.demandTarget * (stars / 5) * attraction;
}

// Guests arriving in one visitor step. Fractions carry over so small parks still get guests.
export function arrivals(carry, demandPerDay, stepSeconds, balance) {
  const expected = carry + (demandPerDay * stepSeconds) / balance.clock.dayLength;
  const guests = Math.floor(expected);
  return { guests, carry: expected - guests };
}

// Park rating (spec section 13): 40% welfare, 25% satisfaction, 20% variety, 15% operations,
// capped at two stars while any animal is critical.
export function parkRating(s, balance) {
  const w = balance.rating.weights;
  const satisfaction = 0.35 * s.viewing + 0.25 * s.services + 0.2 * s.cleanliness + 0.2 * s.value;
  const variety = Math.min(100, s.speciesCount * 25);
  const score = w.welfare * s.welfare + w.satisfaction * satisfaction + w.variety * variety + w.operations * s.operations;
  let stars = Math.round((score / 20) * 2) / 2;
  if (s.anyCritical) stars = Math.min(stars, balance.rating.criticalCapStars);
  return { score: Math.round(score), stars: Math.max(0, Math.min(5, stars)), satisfaction: Math.round(satisfaction) };
}

// --- admission price (Ticket Booth) ---

// What guests think is fair to pay: more for a better-rated park.
export function fairPrice(stars, balance) {
  const a = balance.admission;
  return Math.round(a.fairBase + a.fairPerStar * stars);
}

// The "value" satisfaction factor: full marks at or under the fair price, falling for each coin over.
export function valueScore(price, fair, balance) {
  return Math.max(0, Math.min(100, 100 - Math.max(0, price - fair) * balance.admission.valueLossPerCoin));
}

// Demand multiplier: a few more guests when it's cheap, fewer when it's dear.
export function priceDemand(price, fair, balance) {
  const a = balance.admission;
  const m = price <= fair ? 1 + (fair - price) * a.demandPerCoinUnder : 1 - (price - fair) * a.demandPerCoinOver;
  return Math.max(a.demandFloor, Math.min(a.demandBonusMax, m));
}

// --- viewing (Viewing Points) ---

// One score per occupied exhibit: a happy animal guests can actually see is the best view; an
// exhibit with no working viewing point still gives a glimpse over the fence.
export function viewingScore(exhibits, balance) {
  if (!exhibits.length) return 0;
  const v = balance.viewing;
  const each = exhibits.map(({ welfare, viewed }) => (viewed ? v.seenBase + v.seenWelfare * welfare : v.unseenWelfare * welfare));
  return Math.round(each.reduce((a, b) => a + b, 0) / each.length);
}

// Which exhibit a Viewing Point serves. `rows` are the occupied exhibits in range, nearest first:
// { ex, seen, total, dist }. A point standing at an exhibit's fence (within viewing.besideRange of
// its box) belongs to that exhibit even when its animals are out of sight right now; otherwise the
// nearest exhibit with any animal in view wins (0.1.45: a point right beside Exhibit 3 kept picking
// a farther exhibit with more animals in sight). With none in view, the nearest with animals loaded.
export function chooseViewed(rows, balance) {
  return (
    rows.find((r) => settlesView(r, balance)) ??
    rows.find((r) => r.total > 0) ??
    rows[0]
  );
}

// A row chooseViewed takes as soon as it comes to it: the exhibits farther off can't change the choice, so the point
// stops looking there (0.1.96: a point among five exhibits looked along up to 40 sightlines and used the first few).
export function settlesView(row, balance) {
  return row.total > 0 && (row.seen > 0 || row.dist <= balance.viewing.besideRange);
}

// The second of a `every`-second cycle a Viewing Point is checked at, from its id (its position): the park's points
// spread over the cycle rather than all being checked on the minute (0.1.96, points.js checkPointsDue).
export function pointSlot(id, every) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) >>> 0;
  return h % every;
}

// A viewing point keeps counting while its animals are out of sight for a short while (privacy
// shelters are fine); it lapses once nothing has been seen for `memorySeconds`.
export function viewStatus(prev, visible, now, balance) {
  const lastSeenAt = visible > 0 ? now : prev.lastSeenAt;
  const viewed = lastSeenAt !== undefined && now - lastSeenAt <= balance.viewing.memorySeconds;
  return { lastSeenAt, viewed };
}

// The guests' biggest complaint, or undefined when nothing is below the bar. A services complaint
// names its weakest part (the `detail` from visitors/serviceRules.js servicesScore).
export const COMPLAINTS = {
  viewing: "We couldn't see the animals. Add Viewing Points with a clear view into each exhibit, joined to the entrance by a path.",
  cleanliness: "The exhibits are dirty. Rake them clean.",
  value: "The tickets cost too much for what's here. Lower the price at the Ticket Booth.",
  services: "There's nothing for guests here. Add Snack Stands, Benches and Litter Bins along the paths.",
};
export const SERVICE_COMPLAINTS = {
  food: "We got hungry and there was nothing to eat. Build a Snack Stand beside a path and stock it.",
  restock: "The Snack Stand ran out of food. Restock it.",
  seating: "There's nowhere to sit down! Put Benches along the paths.",
  litter: "There's litter everywhere. Put Litter Bins by the paths, empty them, and sweep with a Cleaning Rake.",
  paths: "We couldn't find the way to everything. Join the entrance to your stands and benches with a path.",
};
export function complaintText(key, serviceDetail) {
  if (key === "services" && SERVICE_COMPLAINTS[serviceDetail]) return SERVICE_COMPLAINTS[serviceDetail];
  return COMPLAINTS[key];
}
export function dominantComplaint(factors, balance) {
  let worst, low = balance.admission.complaintBelow;
  for (const key of Object.keys(COMPLAINTS)) {
    if (factors[key] < low) {
      worst = key;
      low = factors[key];
    }
  }
  return worst;
}

// How many guests to show walking about: a handful, standing in for the day's admissions.
export function visibleGuests(demandPerDay, balance) {
  if (demandPerDay <= 0) return 0;
  return Math.min(balance.guests.max, Math.ceil(demandPerDay / balance.guests.perAdmissions));
}
