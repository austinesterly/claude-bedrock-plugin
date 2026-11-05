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
