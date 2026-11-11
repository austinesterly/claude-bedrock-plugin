// The zoo goals that take time (0.1.258, Austin's NPC Expansion #16-20 spec), pure: Clian's "Every exhibit in the zoo
// must remain clean for 14 consecutive in-game days", Carrie's "Every zoo employee must remain happy for 14 consecutive
// in-game days" (each: "The streak resets if any exhibit fails" / "if an employee fails"), Desilva's "The third zoo
// problem occurs" and Aloof's "at least six zoo exhibits containing enrichment equipment". How each is read is ours
// (balance.js residents.goals; playtest/NPC_batch3_suggestions.md), Austin's to change:
// - a day is a park day (the zoo's own clock, which drains the exhibits);
// - an exhibit "fails" when an exhibit with animals in it drops below goals.cleanBelow (the bottom of the "Needs
//   attention" band: it shows as urgent);
// - an employee (a keeper or a tour guide) is "happy" while paid, and "fails" when left with wages owed;
// - a day with no exhibit with animals (or no employee) neither counts nor breaks the streak;
// - a zoo problem is an animal getting out of its exhibit, an animal falling ill, or staff left unpaid;
// - an exhibit "contains enrichment equipment" when it has animals in it and a piece of equipment the zoo counts as
//   enrichment (balance.js enrichment.fromEquipment) or a Puzzle Feeder.
// No engine calls here.

/** A fresh streak: days counted, broken today, anything to check seen today. */
export function newStreak() {
  return { streak: 0, failed: false, seen: false };
}

/**
 * One check in the day: `any` (something to check: exhibits with animals, employees), `bad` (one fails now).
 * Returns { s (the streak now), broke (it was running and starts again) }.
 */
export function streakCheck(s, any, bad) {
  const cur = s ?? newStreak();
  if (bad) return { s: { streak: 0, failed: true, seen: true }, broke: cur.streak > 0 };
  return { s: { ...cur, seen: cur.seen || Boolean(any) }, broke: false };
}

/** The park day ends: a day seen and not failed counts one more. Returns { s (fresh for the new day), counted }. */
export function streakDayEnd(s) {
  const cur = s ?? newStreak();
  const counted = cur.seen && !cur.failed;
  return { s: { streak: cur.failed ? 0 : cur.streak + (counted ? 1 : 0), failed: false, seen: false }, counted };
}

/** Exhibits with animals in them (`occupied`: a Set of exhibit ids) whose cleanliness is below `below`. */
export function dirtyExhibits(exhibits, occupied, below) {
  return exhibits.filter((ex) => occupied.has(ex.id) && (ex.cleanliness ?? 100) < below);
}

/** The exhibits with animals in them: ids of exhibits that are occupied and hold at least one animal. */
export function occupiedIds(exhibits, animals) {
  const working = new Set(exhibits.filter((e) => e.state === "occupied").map((e) => e.id));
  const out = new Set();
  for (const a of animals) if (a.location?.kind === "exhibit" && working.has(a.location.id)) out.add(a.location.id);
  return out;
}

/** Employees with wages owed (keepers and tour guides: "staff" records). */
export function unpaidStaff(staff) {
  return staff.filter((s) => s.owed?.length);
}

/**
 * Animals that fell ill since the last look: `prev` the ids ill then, `animals` now. Returns { ill (ids ill now), fresh
 * (how many are newly ill) }.
 */
export function newlyIll(prev, animals) {
  const before = new Set(prev ?? []);
  const ill = animals.filter((a) => a.ill).map((a) => a.id);
  return { ill, fresh: ill.filter((id) => !before.has(id)).length };
}

/**
 * The zoo problems one look adds (Desilva's goal): animals newly ill (`ill` from newlyIll) and staff newly unpaid
 * (`unpaidNow`), against the park's record `rec`. The first look at a park (no record of who was ill) only notes what it
 * sees: what went wrong before 0.1.258 can't be known, so a backlog of sick animals on the day of the update isn't
 * counted as new problems.
 */
export function freshProblems(rec, ill, unpaidNow) {
  if (rec?.ill === undefined) return { ill: 0, unpaid: 0 };
  return { ill: ill.fresh, unpaid: unpaidNow && !rec.unpaid ? 1 : 0 };
}

/**
 * Exhibits with animals in them and enrichment equipment: `occupied` (Set of ids), `equipmentOf(ex)` the exhibit's
 * equipment records (its fixtures and its feeders), `kinds` balance.js enrichment.fromEquipment.
 */
export function enrichedCount(exhibits, occupied, equipmentOf, kinds) {
  let n = 0;
  for (const ex of exhibits) {
    if (!occupied.has(ex.id)) continue;
    if (equipmentOf(ex).some((e) => (e.type && kinds[e.type]) || e.puzzle)) n++;
  }
  return n;
}

/**
 * Aloof's monkeys (0.1.258): "Monkeys appear in both his Likes and Dislikes intentionally ... His dialogue may alternate
 * between loving and disliking monkeys." A tag in a resident's `fickle` list is liked on some days and disliked on
 * others (never both on one day), by the day and their id. Returns "likes" or "dislikes".
 */
export function fickleFeeling(resId, tag, day) {
  let h = 2166136261;
  const key = `${resId}:${tag}:${day}`;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619) >>> 0;
  return h % 2 === 0 ? "likes" : "dislikes";
}
