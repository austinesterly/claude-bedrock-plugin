// Residents' days (0.1.182, module 6c: research/npc_plan.md), pure. A resident lives in a home (residents/homes.js) and
// goes by the time of day (world.getTimeOfDay(), 0 to 23999; research/npc_facts.md): in bed from bedTime (13000) until
// wakeTime (23000), up and about at home until their own leaving time (between leaveFrom and leaveTo), out at the zoo
// until returnTime (11500), then home again. Going by the time of day rather than counting ticks means a night skipped
// by sleeping players simply wakes them.

/** The part of the day it is for a resident who leaves home at `leaveAt`. */
export function dayPhase(t, leaveAt, g) {
  const time = ((t % 24000) + 24000) % 24000;
  if (time >= g.bedTime && time < g.wakeTime) return "night";
  if (time >= g.wakeTime || time < leaveAt) return "morning";
  if (time < g.returnTime) return "out";
  return "evening";
}

/** A resident's own leaving time, the same every day: spread over leaveFrom..leaveTo by their id. */
export function leaveTimeFor(id, g) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  return g.leaveFrom + (h % Math.max(1, g.leaveTo - g.leaveFrom));
}

/**
 * What a resident does now. `state` is where they are: "inside" (at home, up), "asleep", "leaving" (on the way out to
 * the zoo), "visiting" (in the zoo), "returning" (on the way home) or "waiting" (outside a home that stopped working).
 * ctx: { homeWorks, houseOk, parkOpen, wentToday } (houseOk: the house itself stands, room, bed and door, whatever its
 * path; wentToday: they've already been out today).
 * Returns "sleep", "wake", "leave", "return", "goIn" or undefined (carry on).
 */
export function nextMove(state, phase, ctx) {
  if (state === "waiting") return ctx.houseOk ?? ctx.homeWorks ? "goIn" : undefined;
  if (state === "visiting" || state === "leaving") {
    if (phase === "evening" || phase === "night" || !ctx.parkOpen || !ctx.homeWorks) return "return";
    return undefined;
  }
  if (state === "returning") return undefined;
  if (state === "asleep") return phase === "night" ? undefined : "wake";
  // inside
  if (phase === "night") return "sleep";
  if (phase === "out" && ctx.homeWorks && ctx.parkOpen && !ctx.wentToday) return "leave";
  return undefined;
}

/**
 * Up to `count` residents who'd like to move in: never one already housed in this world (`housed`: ids), the same three
 * for a mailbox until one is picked (seeded by the mailbox's id and the day), so using it twice doesn't reshuffle them.
 */
export function pickOffers(residents, housed, count, seed) {
  const free = residents.filter((r) => !housed.has(r.id));
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const out = [];
  const pool = [...free];
  while (out.length < count && pool.length) {
    h = Math.imul(h ^ 0x9e3779b9, 16777619) >>> 0;
    out.push(pool.splice(h % pool.length, 1)[0]);
  }
  return out;
}

/** "Rosie likes planters and birds." from tags (data/residents.js LIKE_NAMES). */
export function tagList(tags, names) {
  const words = tags.map((t) => names[t] ?? t);
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

/** What a resident is up to, for their page and the mailbox. */
export function doingText(state, phase) {
  switch (state) {
    case "asleep":
      return "asleep at home";
    case "leaving":
      return "on the way to the zoo";
    case "visiting":
      return "visiting the zoo";
    case "returning":
      return "on the way home";
    case "waiting":
      return "waiting outside, because the home needs fixing";
    default:
      return phase === "out" ? "at home" : phase === "evening" ? "at home for the evening" : "at home, getting ready for the day";
  }
}

/**
 * One line from a resident when a player talks to them: by what they're doing, now and then about something they like
 * or dislike. `lines` is the resident's own (data/residents.js), `random()` picks.
 */
export function residentLine(res, state, random = Math.random) {
  const L = res.lines ?? {};
  const pick = (arr) => (arr?.length ? arr[Math.floor(random() * arr.length)] : undefined);
  const byState = { asleep: L.asleep, leaving: L.leaving, visiting: L.visiting, returning: L.returning, waiting: L.waiting, inside: L.home };
  const r = random();
  if (r < 0.25 && L.likes?.length) return pick(L.likes);
  if (r < 0.35 && L.dislikes?.length) return pick(L.dislikes);
  return pick(byState[state]) ?? pick(L.hello) ?? "Hello!";
}

/** A short path walked one way, then back: the waypoints from the last back to the first. */
export function reversed(points) {
  return [...points].reverse();
}

// --- likes, dislikes and moods (0.1.217, research/npc_plan.md section 9) ---
// What a resident comes across on a visit is a set of tags (data/residents.js LIKE_NAMES): the park's on the way in at
// the gate (arrivalTags), and each Viewing Point's or amenity's as they stop at it (stopTags). The ones they like or
// dislike are kept for the day on their record (`met`: { day, liked, disliked }); the mood is worked out from them.

/**
 * The animal kinds a species counts as (data/residents.js KIND_SPECIES and its rules).
 * @param {any} sp a SPECIES entry
 * @param {Record<string, string[]>} kinds KIND_SPECIES
 */
export function kindsOf(sp, kinds) {
  if (!sp) return [];
  const out = [];
  for (const [tag, ids] of Object.entries(kinds)) if (ids.includes(sp.id)) out.push(tag);
  if (sp.movementProfile === "aquatic" && !sp.mob) out.push("fish");
  if (sp.homeDimension === "minecraft:nether") out.push("nether");
  if (sp.homeDimension === "minecraft:the_end") out.push("end");
  if (sp.boss && !out.includes("bosses")) out.push("bosses");
  if (sp.mob) out.push("mob_house");
  return out;
}

/**
 * The park as a resident finds it on the way in. facts: { lamps, planters (the share of the paths with one near, 0 to
 * 1, or undefined while uncounted), litter (units on the paths), guestsPerDay, price, fair }.
 */
export function arrivalTags(f, g) {
  const out = [];
  if ((f.lamps ?? 0) >= g.amenityCover) out.push("lamps");
  if ((f.planters ?? 0) >= g.amenityCover) out.push("planters");
  const litter = f.litter ?? 0;
  if (litter >= g.litterFrom) out.push("litter");
  else if (litter <= g.cleanTo) out.push("clean");
  const guests = f.guestsPerDay ?? 0;
  if (guests >= g.crowdFrom) out.push("crowds");
  else if (guests <= g.quietTo) out.push("quiet");
  if (f.price > f.fair) out.push("high_admission");
  else if (f.price < f.fair) out.push("low_admission");
  return out;
}

/**
 * What a stop shows: a Viewing Point its exhibit's kinds (stop.speciesIds, when it has animals), an amenity its tag
 * (stop.type; a Snack Stand only with food in it).
 */
export function stopTags(stop, species, kinds, services) {
  if (stop.type) return stop.type === "stand" && !(stop.stock > 0) ? [] : services[stop.type] ? [services[stop.type]] : [];
  const out = new Set();
  for (const id of stop.speciesIds ?? []) for (const k of kindsOf(species[id], kinds)) out.add(k);
  return [...out];
}

/** The day's likes and dislikes met so far, with `tags` added: a new day starts afresh. */
export function addMet(met, tags, res, day) {
  const cur = met?.day === day ? met : { day, liked: [], disliked: [] };
  const liked = [...cur.liked];
  const disliked = [...cur.disliked];
  for (const t of tags) {
    if (res.likes?.includes(t) && !liked.includes(t)) liked.push(t);
    if (res.dislikes?.includes(t) && !disliked.includes(t)) disliked.push(t);
  }
  return { day, liked, disliked };
}

/** Hearts out of g.moodMax: each visit starts at g.moodBase, a heart up for each like met, one down for each dislike. */
export function moodOf(met, g) {
  if (!met) return g.moodBase;
  return Math.max(0, Math.min(g.moodMax, g.moodBase + met.liked.length - met.disliked.length));
}

export function moodText(mood, words) {
  return `${words[mood] ?? words[words.length - 1]} (${mood} of ${words.length - 1} hearts)`;
}

/** Coins a resident puts in the Donation Boxes heading home (g.tips by hearts; a generous one gives g.generousTip times). */
export function tipFor(mood, res, g) {
  const base = g.tips[mood] ?? 0;
  return res?.attributes?.includes("generous") ? base * g.generousTip : base;
}

/** Score points the park's residents add to its rating: g.ratingPerHeart for each heart over g.moodBase, g.ratingMax at most. */
export function ratingLift(moods, g) {
  let over = 0;
  for (const m of moods) over += Math.max(0, m - g.moodBase);
  return Math.min(g.ratingMax, over * g.ratingPerHeart);
}

/** How much more (or less) often a resident picks a stop for what it shows (`tags`): liked ones likePull, disliked dislikePull. */
export function stopPull(tags, res, g) {
  let pull = 1;
  if (tags.some((t) => res.likes?.includes(t))) pull *= g.likePull;
  if (tags.some((t) => res.dislikes?.includes(t))) pull *= g.dislikePull;
  return pull;
}

/** A resident's own leaving time: an early riser's in g.earlyFrom..g.earlyTo, everyone else's leaveTimeFor. */
export function leaveTimeOf(res, g) {
  if (!res?.attributes?.includes("early_riser")) return leaveTimeFor(res.id, g);
  return leaveTimeFor(res.id, { leaveFrom: g.earlyFrom, leaveTo: g.earlyTo });
}

/**
 * A line about today: something that pleased them (their own line for it, else PLEASED's) or bothered them (BOTHERED's),
 * or undefined when nothing has yet.
 */
export function dayLine(res, met, random, pleased, bothered) {
  const pick = (arr) => (arr?.length ? arr[Math.floor(random() * arr.length)] : undefined);
  const all = [...(met?.liked ?? []).map((t) => [t, true]), ...(met?.disliked ?? []).map((t) => [t, false])];
  if (!all.length) return undefined;
  const [tag, good] = all[Math.floor(random() * all.length)];
  const own = good ? res.lines?.pleased?.[tag] : res.lines?.bothered?.[tag];
  return pick(own) ?? (good ? pleased[tag] : bothered[tag]);
}

/**
 * What a resident says when talked to, with their day (0.1.217): after a visit (`met` for today) now and then about what
 * pleased or bothered them (g.dayChance, a chatty one g.chattyDayChance), else residentLine.
 */
export function talkLine(res, state, met, random, g, pleased, bothered) {
  const chance = res.attributes?.includes("chatty") ? g.chattyDayChance : g.dayChance;
  if (met && random() < chance) {
    const line = dayLine(res, met, random, pleased, bothered);
    if (line) return line;
  }
  return residentLine(res, state, random);
}

/** "pleased by the birds and benches; bothered by litter" for a resident's page, or undefined before a visit. */
export function dayText(met, names) {
  if (!met || (!met.liked.length && !met.disliked.length)) return undefined;
  const parts = [];
  if (met.liked.length) parts.push(`pleased by ${tagList(met.liked, names)}`);
  if (met.disliked.length) parts.push(`bothered by ${tagList(met.disliked, names)}`);
  return parts.join("; ");
}
