// Big predators (0.1.75 to 0.1.77: lions, then tigers and crocodiles), pure: how dangerous they are,
// their Holding Dens, the double Keeper Gate keepers go in by, and what to tell players. Spec 5.2:
// "lion | Lion | Pride rest and scent investigation | Group dens, secure service access"; the tiger's
// "Privacy and separate adult territories" and the crocodile's "Secure keeper access, shore clearance".
// The real rules (research/predators_facts.md, "Secure keeper access"): the keeper never shares space
// with the animal; it is shut in a holding den worked from outside first; the keeper goes in through a
// double door, one door open at a time; the animals are counted first. Austin's cards (2026-10-15): in an
// exhibit they warn, then swipe ("Warn, then swipe"); in the wild they are "very dangerous". The game side
// is animals/predators.js; every species with `dangerous` follows these rules (never a species name).

// ---------------- danger to a player inside a dangerous exhibit ----------------
// One state per animal and player: "calm"; "warn" (it crouches with its ears flat and growls, staring);
// "charge" (it rushes the player); "back" (after a swipe, or a charge that missed, it backs off and
// leaves that player alone a while). The player is at risk only inside the exhibit, in Survival or
// Adventure, and never from an animal shut in a Holding Den.
//   see: { inside, vulnerable, denned, dist, sneaking }; D: BALANCE.predators.danger.
// Returns the next state; `swipe` is set on the tick the charge reaches the player.
export function dangerStep(s, see, now, D) {
  const st = s ?? { phase: "calm", since: now };
  const at = (phase, extra = {}) => ({ phase, since: now, ...extra });
  const exposed = see.inside && see.vulnerable && !see.denned;
  // Backing off: the swipe landed once, as it went in (never again on the way back).
  if (st.phase === "back") return now >= st.until ? at("calm") : st.swipe ? { ...st, swipe: false } : st;
  if (!exposed) return st.phase === "calm" ? st : at("calm");
  if (st.phase === "calm") return see.dist <= D.warnRange ? at("warn") : st;
  if (st.phase === "warn") {
    if (see.dist > D.warnRange + D.leaveSlack) return at("calm");
    if (see.dist <= D.closeRange) return at("charge"); // walking right up to it
    const wait = see.sneaking ? D.sneakWarnTicks : D.warnTicks;
    if (now - st.since >= wait && see.dist <= D.strikeRange) return at("charge");
    return st;
  }
  // charging
  if (see.dist <= D.reach) return at("back", { until: now + D.backTicks, swipe: true });
  if (now - st.since >= D.chargeTicks) return at("back", { until: now + D.missBackTicks }); // it fled in time
  return st;
}

// The one line every player sees about a dangerous species (clipboard, Field Journal, care notes).
export function dangerLine(species) {
  const many = species.plural ?? `${species.displayName}s`;
  return `Dangerous: ${many.toLowerCase()} ${species.dangerMoves ?? "warn anyone inside their exhibit, then charge and swipe"}. Keepers go in only when every one is shut in a Holding Den, through a double Keeper Gate${species.shoreClear ? ", with the shore kept clear" : ""}.`;
}

// ---------------- Holding Dens ----------------
// A Holding Den serves the exhibit its door faces into: set in the fence line, the floor right in front of
// its door (its facing: north, south, west or east) is the exhibit's floor. cells: the exhibit's measured
// cells ("x,y,z" -> kind); den: { pos, facing }.
const FRONT = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] };
export function denServes(cells, den) {
  const [dx, dz] = FRONT[den.facing] ?? FRONT.north;
  return cells.get(`${den.pos.x + dx},${den.pos.y},${den.pos.z + dz}`) === "land";
}

// How many dens an exhibit needs: one for each grown animal; lions one more, so one can be shut in while
// the others are used in turn and cleaned (Scottish DWA guidance: "three separate den areas should be
// allowed for two cats"). Young need no den of their own: they're no danger.
export function densNeeded(species, animals) {
  const grown = animals.filter((a) => !a.juvenile).length;
  if (!grown) return 0;
  return grown + (species.dens?.spare ?? 0);
}

// Which den each loose grown animal is called into: the nearest free one, the nearest animal first.
// animals: [{ id, pos, juvenile, denId }]; dens: [{ id, pos, held }] (held: the animal id inside, if any).
// Young stay out (they're no danger, and keepers work round them). Returns { assign: [{ animalId, denId }], missing: [animal ids with no den] }.
export function shiftPlan(animals, dens) {
  const free = dens.filter((d) => !d.held);
  const loose = animals.filter((a) => !a.juvenile && !a.denId);
  const d2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2 + (a.y - b.y) ** 2;
  const pairs = [];
  for (const a of loose) for (const d of free) pairs.push({ a, d, k: d2(a.pos, d.pos) });
  pairs.sort((p, q) => p.k - q.k || (p.a.id < q.a.id ? -1 : 1));
  const usedA = new Set();
  const usedD = new Set();
  const assign = [];
  for (const { a, d } of pairs) {
    if (usedA.has(a.id) || usedD.has(d.id)) continue;
    usedA.add(a.id);
    usedD.add(d.id);
    assign.push({ animalId: a.id, denId: d.id });
  }
  return { assign, missing: loose.filter((a) => !usedA.has(a.id)).map((a) => a.id) };
}

// Every grown animal of the exhibit shut in (the keeper's count before going in). Young aren't counted:
// they're no danger.
export function allShutIn(animals) {
  const grown = animals.filter((a) => !a.juvenile);
  return grown.length > 0 && grown.every((a) => a.denId);
}

// ---------------- the service entrance: two Keeper Gates in a row ----------------
// gates: the bottom halves of Keeper Gates near the exhibit [{ id, pos }]; touches(pos): is there an
// exhibit floor cell right beside it (the gate is in the exhibit's fence). The inner gate is one in the
// fence; its outer gate is another Keeper Gate in line with it (same row or column, a block of height
// either way), B.pairMin to B.pairMax blocks off and not in the fence: the keeper's airlock between them.
// Each inner gate takes the nearest outer one; an outer gate serves one pair.
export function servicePairs(gates, touches, B) {
  const inner = gates.filter((g) => touches(g.pos));
  const outer = gates.filter((g) => !touches(g.pos));
  const used = new Set();
  const pairs = [];
  for (const g of inner) {
    let best;
    for (const o of outer) {
      if (used.has(o.id) || Math.abs(o.pos.y - g.pos.y) > 1) continue;
      const dx = Math.abs(o.pos.x - g.pos.x);
      const dz = Math.abs(o.pos.z - g.pos.z);
      if (dx && dz) continue; // not in line
      const d = dx + dz;
      if (d < B.pairMin || d > B.pairMax) continue;
      if (!best || d < best.d) best = { o, d };
    }
    if (best) {
      used.add(best.o.id);
      pairs.push({ inner: g.id, outer: best.o.id, innerPos: g.pos, outerPos: best.o.pos });
    }
  }
  return pairs;
}

// The interlock: the other gate of this one's pair, when it is open (so this one must stay shut).
export function interlockedBy(gateId, pairs, isOpen) {
  for (const p of pairs) {
    if (p.inner === gateId && isOpen(p.outer)) return p.outer;
    if (p.outer === gateId && isOpen(p.inner)) return p.inner;
  }
  return undefined;
}

// ---------------- keepers ----------------
// Can a keeper go into this dangerous exhibit now, and if not, why (the keeper's status, the clipboard).
// { pairs, dens needed / have, shore }: shore, crocodiles' shore clearance (crocRules.js shoreBlock), what's wrong.
export function keeperBlock(species, ex, info) {
  const many = (species.plural ?? `${species.displayName}s`).toLowerCase();
  if (!info.pairs.length) return `No double Keeper Gate: keepers won't go in with the ${many} (two Keeper Gates in a row, 2 to 4 blocks apart, one in the fence)`;
  if (info.have < info.needed) return `Can't shift every ${species.displayName.toLowerCase()} in ${ex.name}: add Holding Dens (${info.needed} needed, ${info.have} now)`;
  if (info.shore) return info.shore;
  return undefined;
}

// A planned fast day: big cats are fed once a park day and keepers skip one day in B.fastEvery, as zoos
// do ("no more than 2 fast days a week"). Satiety drains more slowly that day, so a fast is no hardship.
export function fastDay(species, day, B) {
  return Boolean(species.fasts) && day % B.fastEvery === B.fastEvery - 1;
}

// ---------------- the wild ----------------
// A wild predator busy eating a Meat Ration someone threw down: until when it's calm and can be crated.
// items: Meat Ration item entities [{ id, pos }]; returns the nearest within range, or undefined.
export function baitNear(pos, items, range) {
  let best;
  for (const it of items) {
    const d = Math.hypot(it.pos.x - pos.x, it.pos.y - pos.y, it.pos.z - pos.z);
    if (d <= range && (!best || d < best.d)) best = { item: it, d };
  }
  return best?.item;
}

// Why a carrier can't take this animal now, or undefined. A wild one only while it eats a thrown
// Meat Ration; a zoo one only while it is shut in its Holding Den (crated from outside, as zoos crate-train
// their cats through the den door).
export function crateBlock(species, { wild, eating = false, denned = false }) {
  if (!species.dangerous) return undefined;
  const one = species.displayName.toLowerCase();
  if (wild && !eating) return `Too dangerous to crate: throw a Meat Ration down near the ${one} and crate it while it eats.`;
  if (!wild && !denned) return `Shut the ${one} in a Holding Den first, then crate it at the den from outside.`;
  return undefined;
}
