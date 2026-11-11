// Ailing Bot's class for the other residents (0.1.247; Austin's NPC Expansion spec, "Teaching NPCs"): "His house
// functions as the classroom", "Only one NPC student may attend at a time", "NPCs do not attend during their own work
// shifts", "NPCs who dislike school do not attend" (Sheila), "NPCs who like school are more likely to attend and learn
// more quickly" (Amanda), "His teaching skill improves as he gives more lessons", "Students improve their occupational
// skill". The numbers (balance.js residents.class) are ours. No engine calls here.

export const TEACHER_ID = "ailing_bot";
export const CLASS_STATES = new Set(["toClass", "inClass", "fromClass"]);

const has = (list, word) => (list ?? []).some((x) => String(x).trim().toLowerCase() === word);

/** How a resident feels about school, by Austin's own lists: "likes", "dislikes" or undefined. */
export function schoolFeeling(res) {
  if (has(res?.spec?.dislikes, "school")) return "dislikes";
  if (has(res?.spec?.likes, "school")) return "likes";
  return undefined;
}

/** Whether a resident has an occupation to get better at. */
export function hasJob(res) {
  return Boolean(res?.occupation) && res.occupation !== "retired";
}

/** Why a resident never goes to class ("teacher", "job": none to learn for, "dislikes"), or undefined: they may. */
export function neverStudies(res) {
  if (!res || res.id === TEACHER_ID) return "teacher";
  if (schoolFeeling(res) === "dislikes") return "dislikes";
  if (!hasJob(res)) return "job";
  return undefined;
}

/** The chance a resident wants a lesson on a given day. */
export function classChance(res, g) {
  if (neverStudies(res)) return 0;
  return schoolFeeling(res) === "likes" ? g.likesChance : g.chance;
}

/** His teaching skill (0 Apprentice, 1 Skilled, 2 Expert) by the lessons he has given. */
export function teachSkill(given, g) {
  let s = 0;
  for (let i = 0; i < g.skillFrom.length; i++) if ((given ?? 0) >= g.skillFrom[i]) s = i;
  return s;
}

/** Real seconds a lesson takes, by his teaching skill. */
export function lessonSeconds(skill, g) {
  return g.seconds[Math.max(0, Math.min(g.seconds.length - 1, skill ?? 0))];
}

/** What one lesson adds to a student's occupational skill count: more for one who likes school, and from an Expert teacher. */
export function lessonGain(res, skill, g) {
  return 1 + (schoolFeeling(res) === "likes" ? g.likesBonus : 0) + (skill >= g.skillFrom.length - 1 ? g.expertBonus : 0);
}

/**
 * Whether class is on: o is { state (the teacher's), phase (his part of the day), houseOk, lessonsToday, busy (a
 * student is on the way or in class) }. He teaches at home, up and about, a few lessons a day, one student at a time.
 */
export function classOpen(o, g) {
  return o.state === "inside" && o.phase !== "night" && Boolean(o.houseOk) && !o.busy && (o.lessonsToday ?? 0) < g.maxPerDay;
}

/**
 * Why a resident who may study isn't setting out now, or undefined: off they go. o is { state, phase (theirs),
 * onShift, weather (what keeps them in, if anything), houseOk, wentToday (had today's lesson), wants (today's roll),
 * noWay (no path to his door was found today) }.
 */
export function studentBlock(o) {
  if (o.wentToday) return "done";
  if (!o.wants) return "notToday";
  if (o.noWay) return "noWay";
  if (o.state !== "inside") return "busy";
  if (o.onShift) return "shift";
  if (o.phase === "night") return "late";
  if (o.weather) return "weather";
  if (!o.houseOk) return "house";
  return undefined;
}

/** "Skilled teacher (12 lessons given; Expert at 30)". */
export function teachText(given, g, names) {
  const n = given ?? 0;
  const s = teachSkill(n, g);
  const next = g.skillFrom[s + 1];
  return `${names[s]} teacher (${n} lesson${n === 1 ? "" : "s"} given${next === undefined ? "" : `; ${names[s + 1]} at ${next}`})`;
}

/** A student's page line about class: never, and why; or how many lessons they've had. */
export function classText(res, taken, teacherName) {
  const never = neverStudies(res);
  if (never === "teacher" || never === "job") return undefined;
  if (never === "dislikes") return `never goes: ${res.name} dislikes school`;
  const n = taken ?? 0;
  return `${n} lesson${n === 1 ? "" : "s"} with ${teacherName}${schoolFeeling(res) === "likes" ? " (likes school: goes more often and learns faster)" : ""}`;
}
