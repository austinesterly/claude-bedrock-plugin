// Chats (0.1.230, Austin: "I also want a talking limit to people every day, if you keep talking to them too much, they
// tell you off ... We should have different ones for different times of the day, different friendship levels,
// different areas they are walking or looking at as well. Make them unique to their attributes and personalities"),
// pure. Each resident's own lines are data/residentChats.js (CHATS[id]: time, tier, look, enough, toldOff), beside
// the lines they already had (data/residents.js `lines`). `g` is balance.js residents.chats.

/** The part of the day at a time of day (0 is sunrise): "morning", "afternoon", "evening" or "night". */
export function dayPart(t, g) {
  const x = ((t % 24000) + 24000) % 24000;
  if (x >= g.nightFrom && x < g.morningFrom) return "night";
  if (x >= g.eveningFrom && x < g.nightFrom) return "evening";
  if (x >= g.afternoonFrom && x < g.eveningFrom) return "afternoon";
  return "morning";
}

/** The friendship tiers' keys in a resident's chats, Stranger to Best Friend. */
export const TIER_KEYS = ["stranger", "acquaintance", "friend", "close", "best"];

// What they're looking at, from a stop's tags (residentRules.js stopTags): the first area with one of its tags. A
// young animal is noticed before the kind it is, now and then (babiesFirst).
export const LOOK_AREAS = {
  water: ["fish", "sharks", "pufferfish"],
  reptiles: ["reptiles", "crocodiles"],
  cats: ["big_cats", "cats"], // not "predators": sharks, wolves and bears are predators too
  birds: ["birds", "fliers", "bats"],
  small: ["bunnies", "small_animals", "small_mammals", "snails", "insects"],
  farm: ["farm"],
  big: ["elephants", "pandas"],
  strange: ["nether", "end", "mythical", "bosses", "mob_house", "wardens", "creepers", "cave", "fire"],
  rest: ["benches", "snacks", "fountains", "restrooms"],
};

/** The area a stop's tags are (a LOOK_AREAS key or "babies"), or undefined. */
export function lookArea(tags, random, g) {
  if (!tags?.length) return undefined;
  const areas = Object.keys(LOOK_AREAS).filter((a) => LOOK_AREAS[a].some((t) => tags.includes(t)));
  if (tags.includes("babies") && (!areas.length || random() < g.babiesFirst)) return "babies";
  return areas.length ? areas[Math.floor(random() * areas.length)] : undefined;
}

/** How many chats a day a resident has in them for one player: g.limit, a chatty one g.chattyMore more. */
export function chatLimit(res, g) {
  return g.limit + (res?.traits?.includes("chatty") ? g.chattyMore : 0);
}

/**
 * What the nth chat of a day with one player is (n from 1): "ok", "enough" (the last one: a friendly word that that's
 * plenty for today) or "toldOff" (past it: they tell the player off, and there's no Keep Talking).
 */
export function chatStatus(n, res, g) {
  const limit = chatLimit(res, g);
  return n < limit ? "ok" : n === limit ? "enough" : "toldOff";
}

/**
 * A line for a chat. ctx: { part (dayPart), tier (0 to 4), area (lookArea, when they stand looking at something),
 * raining, recent (lines said to this player lately: not said again while there's another) }. `own` is the resident's
 * `lines` (their friends' lines, the rain), `everyday()` their line for what they're doing. One kind of line is picked
 * by g.weights, then a line of it not said lately; with none left, another kind.
 */
export function chatPick(chats, own, ctx, random, g, everyday) {
  const recent = ctx.recent ?? [];
  const tierKey = TIER_KEYS[ctx.tier] ?? TIER_KEYS[0];
  const pools = {
    look: ctx.area ? chats?.look?.[ctx.area] : undefined,
    time: chats?.time?.[ctx.part],
    tier: [...(chats?.tier?.[tierKey] ?? []), ...(ctx.tier === 2 ? own?.friend ?? [] : []), ...(ctx.tier >= 3 ? own?.close ?? [] : [])],
    rain: ctx.raining ? own?.rain : undefined,
  };
  const kinds = [];
  for (const k of ["look", "time", "tier", "rain"]) {
    const fresh = (pools[k] ?? []).filter((l) => !recent.includes(l));
    if (fresh.length) kinds.push({ k, fresh, w: g.weights[k] });
  }
  kinds.push({ k: "day", w: g.weights.day });
  let roll = random() * kinds.reduce((a, x) => a + x.w, 0);
  let pick = kinds[kinds.length - 1];
  for (const x of kinds) {
    roll -= x.w;
    if (roll < 0) {
      pick = x;
      break;
    }
  }
  if (pick.k !== "day") return { line: pick.fresh[Math.floor(random() * pick.fresh.length)], kind: pick.k };
  // Their everyday line: a few tries for one not said lately, else one of the others.
  for (let i = 0; i < g.tries; i++) {
    const line = everyday();
    if (!recent.includes(line)) return { line, kind: "day" };
  }
  const other = kinds.find((x) => x.fresh);
  return other ? { line: other.fresh[Math.floor(random() * other.fresh.length)], kind: other.k } : { line: everyday(), kind: "day" };
}

/** The lines said lately with `line` added: the last g.remember of them. */
export function remember(recent, line, g) {
  return [...(recent ?? []).filter((l) => l !== line), line].slice(-g.remember);
}

/** A line of a list not said lately (else any of it), or undefined for an empty list. */
export function freshOf(list, recent, random) {
  if (!list?.length) return undefined;
  const fresh = list.filter((l) => !(recent ?? []).includes(l));
  const from = fresh.length ? fresh : list;
  return from[Math.floor(random() * from.length)];
}
