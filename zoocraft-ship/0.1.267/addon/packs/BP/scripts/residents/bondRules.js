// Friendship (0.1.223, stage C of Austin's residents spec: research/npc_spec_plan.md section 7), pure. Each player has
// their own friendship with each resident, 0 to 100 points (balance.js residents.bonds), in tiers: Stranger,
// Acquaintance, Friend, Close Friend, Best Friend. The first chat of the day with a player counts, and one gift a day
// from each player: a gift they like (their `giftLikes`, data/residents.js GIFT_TAGS) counts most, one they don't like
// (`giftDislikes`) costs, anything else counts a little. A resident's `bond` (from Austin's words for their
// attributes) changes those numbers for them. Friend opens Follow Me (followBlock), in their free time.

/** "Stranger", "Acquaintance", "Friend", "Close Friend", "Best Friend". */
export const TIER_NAMES = ["Stranger", "Acquaintance", "Friend", "Close Friend", "Best Friend"];
const TIER_PLURAL = ["Strangers", "Acquaintances", "Friends", "Close Friends", "Best Friends"];

/** The tier a friendship is in (0 Stranger to 4 Best Friend), by g.tiers' lower bounds. */
export function tierOf(points, g) {
  let t = 0;
  for (let i = 0; i < g.tiers.length; i++) if ((points ?? 0) >= g.tiers[i]) t = i;
  return t;
}

/** Points after a change, kept within 0 and g.max. */
export function addPoints(points, delta, g) {
  return Math.max(0, Math.min(g.max, (points ?? 0) + delta));
}

/** "Friend, 46 of 100". */
export function friendshipText(points, g) {
  return `${TIER_NAMES[tierOf(points, g)]}, ${points ?? 0} of ${g.max}`;
}

/** The next tier and where it starts ("Close Friend at 70"), or undefined at the top. */
export function nextTierText(points, g) {
  const t = tierOf(points, g);
  return t + 1 < g.tiers.length ? `${TIER_NAMES[t + 1]} at ${g.tiers[t + 1]}` : undefined;
}

/** "You and Zach are now Friends!" (the tier reached), with what it opens. */
export function tierUpText(name, tier, g) {
  const opens = tier === g.followFrom ? ` ${name} will follow you now, in their free time (Follow Me).` : "";
  return `You and ${name} are now ${TIER_PLURAL[tier] ?? TIER_NAMES[tier]}!${opens}`;
}

/** Items that are never offered as gifts: the add-on's own (a crate may hold an animal), and boxes and bags of things. */
export function canGift(typeId) {
  if (typeof typeId !== "string") return false;
  if (ZOO_BOWS.test(typeId)) return true; // 0.1.261: ZooCraft's bows are only bows
  return !/^zoocraft:/.test(typeId) && !/shulker_box$/.test(typeId) && !/(^minecraft:|_)bundle$/.test(typeId);
}

/** ZooCraft's fifteen bows (data/bows.js). */
export const ZOO_BOWS = /^zoocraft:(short_bow|scrap_bow|needle_bow|classic_bow|flurry_bow|longbow|proximity_bow|twin_fang_bow|vexcaller_bow|sonic_bow|blightbloom_bow|blaze_bow|panda_bow|scorpion_bow|ballista_bow)$/;

/**
 * 0.1.267, Jack's "fake items": an item with a name of its own (renamed at an anvil: it says it's something it may not
 * be) is a fake. A book's name is its title (Sophia's signed book carries its whole title as its name) and a name tag's
 * name is what it's for, so neither ever is.
 */
export function fakeGift(typeId, name) {
  return typeof name === "string" && name.length > 0 && !/^minecraft:(written_book|writable_book|book|name_tag)$/.test(typeId);
}

/** The gift tags an item has (GIFT_TAGS: tag -> patterns of item ids). */
export function giftTagsOf(typeId, tags) {
  const out = [];
  for (const [tag, patterns] of Object.entries(tags)) if (patterns.some((p) => p.test(typeId))) out.push(tag);
  return out;
}

/**
 * How a resident takes a gift with these tags: "disliked" when any is a gift dislike of theirs (a diamond sword is a
 * weapon to Carrot before it's a diamond), else "liked" when any is a gift like, else "neutral". Returns { kind, tags
 * (the tags behind it) }.
 */
export function giftKind(res, tags) {
  const bad = tags.filter((t) => res?.giftDislikes?.includes(t));
  if (bad.length) return { kind: "disliked", tags: bad };
  const good = tags.filter((t) => res?.giftLikes?.includes(t));
  if (good.length) return { kind: "liked", tags: good };
  return { kind: "neutral", tags: [] };
}

/** Points for a chat or a gift: the resident's own (`bond`), else everyone's. kind: "talk", "liked", "neutral", "disliked". */
export function bondPoints(res, kind, g) {
  return res?.bond?.[kind] ?? g[kind];
}

/** A friendship record as it starts: { points, talkDay, giftDay, liked: [tags], disliked: [tags], talks, gifts }. */
export function newBond() {
  return { points: 0, talkDay: undefined, giftDay: undefined, liked: [], disliked: [], talks: 0, gifts: 0 };
}

/**
 * A chat on `day`: the first of the day counts (bondPoints "talk"), later ones that day don't. Returns { bond (a new
 * record), gain, first (their first chat ever), tierUp (the tier reached, or undefined) }.
 */
export function chat(b, res, day, g) {
  const was = { ...newBond(), ...b };
  const first = !was.talks;
  const gain = was.talkDay === day ? 0 : bondPoints(res, "talk", g);
  const points = addPoints(was.points, gain, g);
  // 0.1.230: dayTalks, the chats so far on talkDay (chatRules.js chatStatus: the daily limit).
  const bond = { ...was, points, talkDay: day, talks: was.talks + 1, dayTalks: was.talkDay === day ? (was.dayTalks ?? 1) + 1 : 1 };
  const t0 = tierOf(was.points, g);
  const t1 = tierOf(points, g);
  return { bond, gain: points - was.points, first, tierUp: t1 > t0 ? t1 : undefined };
}

/**
 * A gift on `day` (an item with gift tags `tags`): one a day counts; a second the same day is turned down and nothing
 * is taken ({ ok: false, why: "again" }). Otherwise { ok: true, bond, kind, tags, gain, tierUp, tierDown }; what they
 * liked or didn't is remembered for their page.
 */
export function gift(b, res, tags, day, g) {
  const was = { ...newBond(), ...b };
  if (was.giftDay === day) return { ok: false, why: "again" };
  const k = giftKind(res, tags);
  const points = addPoints(was.points, bondPoints(res, k.kind, g), g);
  const remember = (list, add) => [...new Set([...(list ?? []), ...add])];
  const bond = {
    ...was,
    points,
    giftDay: day,
    gifts: was.gifts + 1,
    liked: k.kind === "liked" ? remember(was.liked, k.tags) : was.liked,
    disliked: k.kind === "disliked" ? remember(was.disliked, k.tags) : was.disliked,
  };
  const t0 = tierOf(was.points, g);
  const t1 = tierOf(points, g);
  return { ok: true, bond, kind: k.kind, tags: k.tags, gain: points - was.points, tierUp: t1 > t0 ? t1 : undefined, tierDown: t1 < t0 ? t1 : undefined };
}

/**
 * Why a resident won't follow a player now, or undefined when they will. o: { state, phase ("night": bedtime), tier,
 * working (on a work shift: stage D's), leader (the player id they follow or wait for), me (this player's id),
 * sameDimension, far (they've come as far from home as they'll go) }. Asleep, bedtime and work come first (nobody
 * changes those), then being on their way somewhere, someone else's follower, and last the friendship.
 */
export function followBlock(o, g) {
  if (o.sameDimension === false) return "dimension";
  if (o.state === "asleep") return "asleep";
  if (o.phase === "night") return "late";
  if (o.working) return "working";
  if (o.learning) return "class"; // 0.1.247: at class, or on the way there or back
  if (o.leader && o.leader !== o.me && (o.state === "following" || o.state === "staying")) return "other";
  if (o.state === "staying" && o.far) return "far";
  if (!["inside", "visiting", "staying", "following"].includes(o.state)) return o.state === "waiting" ? "waiting" : "walking";
  if (o.tier < g.followFrom) return "friendship";
  return undefined;
}

/** Under a creeped-out answer to Follow Me (0.1.233): what would open it, in one line for the talk box. */
export function followLockNote(o, g) {
  return `Follow Me opens at ${TIER_NAMES[g.followFrom]}: ${g.tiers[g.followFrom]} friendship (you have ${o.points ?? 0}).`;
}

/** A locked Follow Me's reason, short, for its button: "Locked: Friend at 40 (you have 14)". */
export function followLockText(why, o, g) {
  switch (why) {
    case "friendship":
      return `Locked: ${TIER_NAMES[g.followFrom]} at ${g.tiers[g.followFrom]} (you have ${o.points ?? 0})`;
    case "asleep":
      return "Not while they're asleep";
    case "late":
      return "Not at their bedtime";
    case "working":
      return "Not while they're working";
    case "class":
      return "Not while they're at class";
    case "other":
      return `They're with ${o.leaderName ?? "someone else"}`;
    case "far":
      return "They won't go further from home";
    case "waiting":
      return "Not until their home is fixed";
    case "dimension":
      return "Not here";
    default:
      return "Not while they're on their way";
  }
}

/** The same reason in full, for the chat when the locked button is pressed. */
export function followLockLong(why, name, o, g) {
  switch (why) {
    case "friendship":
      return `${name} follows friends only: Follow Me opens at ${TIER_NAMES[g.followFrom]} (${g.tiers[g.followFrom]} friendship). You have ${o.points ?? 0}. Have a chat with them each day and bring them a gift they like.`;
    case "asleep":
      return `${name} is asleep. Ask again when they're up.`;
    case "late":
      return `${name} is off to bed: it's their bedtime, not a time for going out.`;
    case "working":
      return `${name} is working. Follow Me opens again when their shift is over.`;
    case "class":
      return `${name} is at class. Follow Me opens again when they're home from the lesson.`;
    case "other":
      return `${name} is with ${o.leaderName ?? "someone else"} just now.`;
    case "far":
      return `${name} has come as far from home as they'll go. Use Stop Following or Go Home.`;
    case "waiting":
      return `${name} is waiting for their home to be fixed. Use their Resident Mailbox to see what it needs.`;
    case "dimension":
      return `${name} stays in their own world.`;
    default:
      return `${name} is on their way somewhere. Ask again when they get there: at home, or at the zoo.`;
  }
}

// What a resident says on each occasion when they have no line of their own for it (data/residents.js lines).
export const BOND_LINES = {
  intro: ["Hello! Nice to meet you."],
  friend: ["Good to see you, friend."],
  close: ["You're one of my favourite people, you know."],
  rain: ["What weather!"],
  liked: ["Oh, I love it! Thank you!"],
  neutral: ["Thank you, that's kind."],
  disliked: ["Oh. That's not really my sort of thing."],
  again: ["You've already given me something today!"],
  follow: ["Lead the way!"],
  followNo: ["Let's get to know each other first."],
  stay: ["I'll wait here."],
  stop: ["Back to my day, then."],
  goHome: ["Off home I go."],
  late: ["It's late. I'm off home to bed."],
  lost: ["I can't follow you there. I'll wait here."],
  found: ["There you are!"],
};

/** One of their lines for an occasion (BOND_LINES' keys), their own when they have one. */
export function bondLine(res, key, random = Math.random) {
  const own = res?.lines?.[key];
  const pool = own?.length ? own : BOND_LINES[key] ?? [""];
  return pool[Math.floor(random() * pool.length)];
}

/** Their line for a gift: one for the tag behind it when they have one (`lines.giftTags`), else for its kind. */
export function giftLine(res, kind, tags, random = Math.random) {
  const own = tags.map((t) => res?.lines?.giftTags?.[t]).filter(Boolean);
  if (own.length) return own[Math.floor(random() * own.length)];
  return bondLine(res, kind, random);
}

/**
 * What they say when a player has a chat (Talk): introducing themselves the first time; asleep, a mumble; a Friend or
 * closer now and then one of their friends' lines (g.friendLines; a Close Friend's too from tier 3); in the rain now
 * and then about the weather (g.rainLines); else `everyday()` (residentRules.js talkLine: their day, likes, what
 * they're doing). ctx: { state, tier, first, weather }.
 */
export function chatLine(res, ctx, random, g, everyday) {
  if (ctx.state === "asleep") return everyday();
  if (ctx.first) return bondLine(res, "intro", random);
  if (ctx.tier >= g.followFrom && random() < g.friendLines) {
    const pool = [...(res.lines?.friend ?? []), ...(ctx.tier > g.followFrom ? res.lines?.close ?? [] : [])];
    if (pool.length) return pool[Math.floor(random() * pool.length)];
  }
  if ((ctx.weather === "Rain" || ctx.weather === "Thunder") && (ctx.state === "inside" || ctx.state === "visiting") && random() < g.rainLines) return bondLine(res, "rain", random);
  return everyday();
}

/** "+3 friendship" / "-6 friendship" / "no change", for a chat or a gift. */
export function gainText(gain) {
  return gain > 0 ? `+${gain} friendship` : gain < 0 ? `${gain} friendship` : "no change in friendship";
}

/**
 * What friendship does at the zoo, by the best friendship any player has with them (0.1.223): { visit (added to the
 * chance of a visit each day), tip (their tips times this) }.
 */
export function bondEffects(tier, g) {
  return { visit: g.visit[tier] ?? 0, tip: g.tip[tier] ?? 1 };
}
