// Residents' days (0.1.182, module 6c: research/npc_plan.md), pure. A resident lives in a home (residents/homes.js) and
// goes by the time of day (world.getTimeOfDay(), 0 to 23999; research/npc_facts.md): in bed from bedTime (13000) until
// wakeTime (23000), up and about at home until their own leaving time (between leaveFrom and leaveTo), out at the zoo
// until returnTime (11500), then home again. Going by the time of day rather than counting ticks means a night skipped
// by sleeping players simply wakes them.
// 0.1.222 (stage B): a night worker's day (shift "night": balance.js residents.night) runs the same way round, from
// waking at their own wakeTime to bed at their own bedTime, whatever side of midnight each falls (scheduleOf).

/** The part of the day it is for a resident who leaves home at `leaveAt`. */
export function dayPhase(t, leaveAt, g) {
  // How far round the day from waking each time is: up, then off out, then home, then bed.
  const since = (x) => ((((x - g.wakeTime) % 24000) + 24000) % 24000);
  const now = since(t);
  if (now < since(leaveAt)) return "morning";
  if (now < since(g.returnTime)) return "out";
  if (now < since(g.bedTime)) return "evening";
  return "night";
}

/** The times a resident's day goes by (0.1.222): a night worker's (balance.js residents.night), else everyone's. */
export function scheduleOf(res, g) {
  return res?.shift === "night" ? { ...g, ...g.night } : g;
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
 * ctx: { homeWorks, houseOk, parkOpen, wentToday, goOut } (houseOk: the house itself stands, room, bed and door, whatever
 * its path; wentToday: they've already been out today; goOut false (0.1.222): a day at home, or weather that keeps them
 * in, so they stay in, or head home early).
 * Returns "sleep", "wake", "leave", "return", "goIn" or undefined (carry on).
 */
export function nextMove(state, phase, ctx) {
  if (state === "waiting") return ctx.houseOk ?? ctx.homeWorks ? "goIn" : undefined;
  if (state === "visiting" || state === "leaving") {
    if (phase === "evening" || phase === "night" || !ctx.parkOpen || !ctx.homeWorks || ctx.goOut === false) return "return";
    return undefined;
  }
  if (state === "returning") return undefined;
  if (state === "asleep") return phase === "night" ? undefined : "wake";
  // inside
  if (phase === "night") return "sleep";
  if (phase === "out" && ctx.homeWorks && ctx.parkOpen && !ctx.wentToday && ctx.goOut !== false) return "leave";
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

/** Why a resident is at home when they'd be out (0.1.222, stayReason). */
export const STAY_TEXT = { rest: "having a day at home", rain: "staying in out of the rain", thunder: "staying in until the storm passes" };

/**
 * What a resident is up to, for their page and the mailbox. o (0.1.222): { why (stayReason's, when they'd be out), night
 * (a night worker) }; 0.1.223: { leader (the player they're following, or waiting for), you (that's the reader), home
 * (heading home), from (where they set off from: "visiting", the zoo) }.
 */
export function doingText(state, phase, o = {}) {
  switch (state) {
    case "following":
      return o.you ? "following you" : `following ${o.leader ?? "someone"}`;
    case "staying":
      return o.you ? "waiting where you left them" : `waiting where ${o.leader ?? "someone"} left them`;
    case "rejoining":
      return o.home || o.from !== "visiting" ? "on the way home" : "on the way back to the zoo";
    case "asleep":
      return "asleep at home";
    case "leaving":
      return "on the way to the zoo";
    case "visiting":
      // 0.1.249: the vet at work
      if (o.vetDoing === "station") return o.vetWaiting ? "treating the animals in recovery at the Recovery Station" : "at the Recovery Station, with no unwell animals waiting";
      if (o.vetDoing === "exhibit") return `treating ${o.patient ?? "an unwell animal"} at its exhibit`;
      if (o.vetGoing === "station") return "on the way to the Recovery Station";
      if (o.vetGoing === "exhibit") return `on the way to treat ${o.patient ?? "an unwell animal"}`;
      return "visiting the zoo";
    case "returning":
      return "on the way home";
    case "waiting":
      return "waiting outside, because the home needs fixing";
    // 0.1.224 (stage D): work
    case "toWork":
      return `on the way to work${o.site ? ` at the ${o.site}` : ""}`;
    case "working":
      return o.wait ? `at work, waiting: the ${o.site ?? "work site"} needs fixing` : `working at the ${o.site ?? "work site"}`;
    case "fromWork":
      return "on the way home from work";
    // 0.1.247: class at the teacher's house
    case "toClass":
      return `on the way to class at ${o.teacher ?? "the teacher"}'s house`;
    case "inClass":
      return `in class at ${o.teacher ?? "the teacher"}'s house`;
    case "fromClass":
      return "on the way home from class";
    default:
      if (o.teaching) return `at home, teaching ${o.teaching}`;
      if (o.expecting) return `at home, waiting for ${o.expecting} to come to class`;
      if (phase === "out" && o.why && STAY_TEXT[o.why]) return `at home, ${STAY_TEXT[o.why]}`;
      if (o.night) return phase === "out" ? "at home" : phase === "evening" ? "at home for the night" : "at home, getting ready to go out";
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
  const byState = { asleep: L.asleep, leaving: L.leaving, visiting: L.visiting, returning: L.returning, waiting: L.waiting, inside: L.home, toWork: L.toWork, working: L.working, fromWork: L.fromWork };
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
 * 1, or undefined while uncounted), litter (units on the paths), guestsPerDay, price, fair }; 0.1.222: time (of day),
 * clear (no rain), walk (blocks of path from their door to the gate).
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
  if (f.time !== undefined) {
    const time = ((f.time % 24000) + 24000) % 24000;
    // After dark (the day residents' bedtime to sunrise) with too few Path Lamps; the sun up on a clear day.
    if (time >= g.bedTime && time < g.wakeTime && (f.lamps ?? 0) < g.amenityCover) out.push("darkness");
    else if ((time >= g.sunrise || time < g.sunset) && f.clear) out.push("sunlight");
  }
  if ((f.walk ?? 0) >= g.longWalk) out.push("long_walks");
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
  if (stop.young && stop.speciesIds?.length) out.add("babies"); // 0.1.220: a young animal in the exhibit
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

/**
 * Hearts out of g.moodMax: each visit starts at g.moodBase (0.1.222: `lift` more from a nice home), a heart up for each
 * like met, one down for each dislike.
 */
export function moodOf(met, g, lift = 0) {
  const start = Math.min(g.moodMax, g.moodBase + lift);
  if (!met) return start;
  return Math.max(0, Math.min(g.moodMax, start + met.liked.length - met.disliked.length));
}

export function moodText(mood, words) {
  return `${words[mood] ?? words[words.length - 1]} (${mood} of ${words.length - 1} hearts)`;
}

/**
 * Coins a resident puts in the Donation Boxes heading home (g.tips by hearts; a generous one gives g.generousTip times;
 * 0.1.222: times their home's tier's g.homeTiers.tip; 0.1.223: times the best friendship's g.bonds.tip, `friend` its
 * tier, residents/bondRules.js).
 */
export function tipFor(mood, res, g, tier = 0, friend = 0) {
  const base = g.tips[mood] ?? 0;
  const coins = res?.traits?.includes("generous") ? base * g.generousTip : base;
  return Math.round(coins * (g.homeTiers?.tip[tier] ?? 1) * (g.bonds?.tip[friend] ?? 1));
}

/** Score points the park's residents add to its rating: g.ratingPerHeart for each heart over g.moodBase, g.ratingMax at most. */
export function ratingLift(moods, g) {
  let over = 0;
  for (const m of moods) over += Math.max(0, m - g.moodBase);
  return Math.min(g.ratingMax, over * g.ratingPerHeart);
}

/**
 * How much more (or less) often a resident picks a stop for what it shows (`tags`): liked ones likePull, disliked
 * dislikePull; 0.1.222: a favourite favPull times more again.
 */
export function stopPull(tags, res, g) {
  let pull = 1;
  if (isFavourite(tags, res)) pull *= g.favPull;
  if (tags.some((t) => res.likes?.includes(t))) pull *= g.likePull;
  if (tags.some((t) => res.dislikes?.includes(t))) pull *= g.dislikePull;
  return pull;
}

/** A resident's own leaving time: an early riser's in g.earlyFrom..g.earlyTo, everyone else's leaveTimeFor. */
export function leaveTimeOf(res, g) {
  if (res?.shift === "night") return leaveTimeFor(res.id, g.night); // 0.1.222: at dusk
  if (!res?.traits?.includes("early_riser")) return leaveTimeFor(res.id, g);
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
  const chance = res.traits?.includes("chatty") ? g.chattyDayChance : g.dayChance;
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

// --- Austin's residents: who can move in (0.1.220, research/npc_spec_plan.md section 3) ---

/**
 * What the zoo has on display, from its own records: an animal counts when it's in an exhibit (location.kind
 * "exhibit") that works (state "occupied"); wild mobs, animals in crates and in holding don't. `exhibits` are the zoo's
 * exhibit records (the Mob House's mob pens among them); a school of fish counts its fish. Returns { species: Map<speciesId, animals>, animals, young,
 * exhibits (working exhibits with an animal on display), leads (the lead species of those) }.
 * @param {any[]} animals
 * @param {any[]} exhibits
 */
export function displayStats(animals, exhibits) {
  const working = new Map(exhibits.filter((e) => e.state === "occupied").map((e) => [e.id, e]));
  const species = new Map();
  const shown = new Set();
  let n = 0;
  let young = 0;
  for (const a of animals) {
    if (a.location?.kind !== "exhibit" || !working.has(a.location.id)) continue;
    const k = a.count > 0 ? a.count : 1; // a school of fish is one record with its count
    n += k;
    if (a.juvenile) young += 1;
    species.set(a.speciesId, (species.get(a.speciesId) ?? 0) + k);
    shown.add(a.location.id);
  }
  const leads = new Set([...shown].map((id) => working.get(id).speciesId).filter(Boolean));
  return { species, animals: n, young, exhibits: shown.size, leads };
}

/**
 * How far the zoo is towards a resident's goal (data/residents.js `unlock`): { have (at most need), need, met }.
 * `kinds` is KIND_SPECIES (for "kind" goals).
 */
export function unlockProgress(u, stats, kinds) {
  let have = 0;
  switch (u.kind) {
    case "species":
      have = stats.species.size;
      break;
    case "animals":
      have = stats.animals;
      break;
    case "of":
      have = u.species.reduce((n, id) => n + (stats.species.get(id) ?? 0), 0);
      break;
    case "young":
      have = stats.young;
      break;
    case "kind":
      have = (kinds[u.tag] ?? []).filter((id) => stats.species.has(id)).length;
      break;
    case "exhibits":
      have = u.unique ? stats.leads.size : stats.exhibits;
      break;
    case "stations": // 0.1.248: Recovery Stations placed in a zoo (Dr. Pollo's "veterinary building")
      have = stats.stations ?? 0;
      break;
  }
  return { have: Math.min(have, u.count), need: u.count, met: have >= u.count };
}

/** Residents move in by day: from sunrise (g.wakeTime) until they'd head home (g.returnTime). */
export function arrivalTime(t, g) {
  const time = ((t % 24000) + 24000) % 24000;
  return time >= g.wakeTime || time < g.returnTime;
}

/** The goals nearest to done first (for the mailbox and the Park Ledger): [{ res, have, need }]. */
export function nearestGoals(residents, progressOf, count) {
  return residents
    .map((res) => ({ res, ...progressOf(res) }))
    .filter((x) => !x.met)
    .sort((a, b) => b.have / b.need - a.have / a.need || a.need - a.have - (b.need - b.have))
    .slice(0, count);
}

/** A resident's job for their page (0.1.221): "singer (works nights)", "farmer (works days)", "retired". */
export function jobText(res) {
  if (!res?.occupation) return undefined;
  return res.shift ? `${res.occupation} (works ${res.shift === "night" ? "nights" : "days"})` : res.occupation;
}

// --- their own days, the weather, favourites (0.1.222, stage B: research/npc_spec_plan.md section 6) ---

/** A number from 0 up to 1, the same all day for a resident and a question (`what`), different day to day. */
export function dayRoll(id, day, what) {
  const s = `${id}|${day}|${what}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  // Mixed, so days next to each other don't roll alike.
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d) >>> 0;
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39) >>> 0;
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/**
 * How likely a resident is to visit on a day: their routine's `visits` (g.visitWords), more likely after a happy visit,
 * less after a glum one, more from a comfortable home (g.homeTiers.visit by tier) and, 0.1.223, with a good friend
 * (g.bonds.visit by the best friendship's tier, `friend`); never under g.visitMin.
 */
export function visitChance(res, mood, tier, g, friend = 0) {
  const base = g.visitWords[res?.routine?.visits] ?? 1;
  const felt = mood >= g.happyFrom ? g.happyVisit : mood <= g.glumTo ? -g.glumVisit : 0;
  return Math.max(g.visitMin, Math.min(1, base + felt + (g.homeTiers.visit[tier] ?? 0) + (g.bonds?.visit[friend] ?? 0)));
}

/** A day at home (true) or a zoo day: rolled once a day against visitChance (`mood`: their last visit's). */
export function restToday(res, day, mood, tier, g, friend = 0) {
  return dayRoll(res.id, day, "visit") >= visitChance(res, mood, tier, g, friend);
}

/**
 * The weather keeping a resident in (`weather`: "Clear", "Rain" or "Thunder"): "thunder" or "rain" when it does, else
 * undefined. Their routine says, for rain and for a storm (a storm rains too), "go", "stay", or "sometimes" (they stay in
 * on g.sometimes of days, the same all day).
 */
export function weatherStop(res, day, weather, g) {
  const keeps = (kind) => {
    const how = res?.routine?.[kind] ?? "go";
    return how === "stay" || (how === "sometimes" && dayRoll(res.id, day, kind) < g.sometimes);
  };
  if (weather === "Thunder" && keeps("thunder")) return "thunder";
  if ((weather === "Rain" || weather === "Thunder") && keeps("rain")) return "rain";
  return undefined;
}

/** A stop shows one of their favourites (the spec's section 10: Carrot's rabbits, Amanda's pandas and so on). */
export function isFavourite(tags, res) {
  return Boolean(res?.favourites?.length) && tags.some((t) => res.favourites.includes(t));
}

/** Their walking pace: everyone's (g.walkSpeed) times their routine's `walk` (Sheila walks slowly). */
export function walkSpeedOf(res, g) {
  return g.walkSpeed * (res?.routine?.walk ?? 1);
}

const WEATHER_WORDS = { go: "goes anyway", sometimes: "sometimes stays in", stay: "stays in" };

/** Their routine in words, for their page and the mailbox: ["most days, in the evening", "sometimes stays in", "stays in"]. */
export function routineText(res) {
  const r = res?.routine ?? {};
  return [`${r.visits ?? "every day"}, ${res?.shift === "night" ? "in the evening" : "by day"}`, WEATHER_WORDS[r.rain ?? "go"], WEATHER_WORDS[r.thunder ?? "go"]];
}

/** When a resident walks to the zoo and back, for the mailbox's invite (0.1.222: the night workers go at dusk). */
export function commuteText(res) {
  return res?.shift === "night" ? "walk to the zoo at dusk and come home at midnight" : "walk to the zoo each morning and come home at sunset";
}
