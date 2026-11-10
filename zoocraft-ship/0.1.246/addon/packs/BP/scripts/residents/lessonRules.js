// Lessons for the player (0.1.246; the lessons themselves: data/lessons.js). A lesson opens at its friendship; finished,
// it is recorded in the player's friendship record with the teacher (`lessons[<id>] = day`) for good, whatever
// friendship does later (Austin's spec: "Completed lessons are permanently recorded, even if friendship later
// decreases"). No engine calls here.

/** Whether this player finished a lesson. */
export const finished = (bond, id) => bond?.lessons?.[id] !== undefined;

/** A lesson's state for a friendship record: "done", "open" or "locked". */
export function lessonState(lesson, bond) {
  if (finished(bond, lesson.id)) return "done";
  return (bond?.points ?? 0) >= lesson.at ? "open" : "locked";
}

/** The friendship record with a lesson finished on `day` (the first day stands if it was finished before). */
export function withLesson(bond, id, day) {
  if (finished(bond, id)) return bond;
  return { ...bond, lessons: { ...(bond.lessons ?? {}), [id]: day } };
}

/** The lessons a player finished, in the lessons' own order. */
export function finishedLessons(lessons, bond) {
  return lessons.filter((l) => finished(bond, l.id));
}

/** The band a lesson belongs to (the last whose friendship it reaches). */
export function bandOf(lesson, bands) {
  let b = bands[0];
  for (const x of bands) if (lesson.at >= x.at) b = x;
  return b;
}

/** A lesson's second line on the list: finished, ready, or the friendship it takes. */
export function lessonNote(lesson, bond) {
  const s = lessonState(lesson, bond);
  return s === "done" ? "§2Finished" : s === "open" ? "§1Ready to learn" : `§8At ${lesson.at} friendship`;
}

/** A lesson as a page: its band and topic, then what it teaches. */
export function lessonText(lesson, bands, topics) {
  return [`§8${bandOf(lesson, bands).name}: ${topics[lesson.topic]}`, "", ...lesson.lines.map((l) => `§f${l}`)].join("\n");
}
