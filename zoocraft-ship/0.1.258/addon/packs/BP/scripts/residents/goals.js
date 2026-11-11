// The zoo goals that take time (0.1.258, Austin's NPC Expansion #16-20 spec; the rules are residents/goalRules.js):
// Clian's clean-exhibit streak and Carrie's happy-staff streak (park days in a row, per park), and Desilva's count of zoo
// problems (world-wide). Every simulation step of a park (balance.js clock.simEvery park seconds) looks at its exhibits
// with animals in them and its employees; each park day's end counts the day. Kept in "goals": one record a park (its
// id: { clean, staff, ill, unpaid }) and "world" ({ problems }). Only this module writes that collection.
import { BALANCE } from "../data/balance.js";
import { residentById } from "../data/residents.js";
import { on } from "../core/events.js";
import { db } from "../persistence/db.js";
import { getPark, inScope, membersOnline } from "../park/park.js";
import { allAnimals } from "../animals/animals.js";
import { allExhibits } from "../exhibits/exhibits.js";
import { message } from "../platform/mc.js";
import { info } from "../core/log.js";
import { isUnlocked } from "./people.js";
import { streakCheck, streakDayEnd, dirtyExhibits, occupiedIds, unpaidStaff, newlyIll, freshProblems } from "./goalRules.js";

const COL = "goals";
const WORLD = "world";

function parkRec(id) {
  return db.get(COL, id) ?? { id };
}

function addProblems(n, why) {
  if (!(n > 0)) return;
  const w = db.get(COL, WORLD) ?? { id: WORLD, problems: 0 };
  db.put(COL, { ...w, problems: (w.problems ?? 0) + n });
  info(`goals: zoo problem (${why}), ${(w.problems ?? 0) + n} so far`);
}

// Tells the park's members online, while the resident the goal is for hasn't moved in yet.
function tell(park, resId, text) {
  if (isUnlocked(resId) || !residentById(resId)) return;
  for (const p of membersOnline(park)) message(p, text);
}

/** One look at the scope's park (each simulation step). */
export function checkGoals() {
  const park = getPark();
  if (!park) return;
  const g = BALANCE.residents.goals;
  const exhibits = allExhibits();
  const animals = allAnimals();
  const occupied = occupiedIds(exhibits, animals);
  const dirty = dirtyExhibits(exhibits, occupied, g.cleanBelow);
  const staff = db.all("staff").filter(inScope);
  const unpaid = unpaidStaff(staff);
  const rec = parkRec(park.id);
  const clean = streakCheck(rec.clean, occupied.size > 0, dirty.length > 0);
  const happy = streakCheck(rec.staff, staff.length > 0, unpaid.length > 0);
  if (clean.broke) tell(park, g.cleanFor, `§e${dirty[0].name} got too dirty: ${residentById(g.cleanFor).name}'s goal starts again §7(every exhibit clean for ${g.days} park days in a row).`);
  if (happy.broke) tell(park, g.staffFor, `§e${unpaid[0].name} went unpaid: ${residentById(g.staffFor).name}'s goal starts again §7(every employee happy, which is paid, for ${g.days} park days in a row).`);
  // Zoo problems: an animal falling ill, staff left unpaid (each counted as it starts; not on the first look at a park).
  const ill = newlyIll(rec.ill, animals);
  const fresh = freshProblems(rec, ill, unpaid.length > 0);
  addProblems(fresh.ill, "an animal fell ill");
  addProblems(fresh.unpaid, "staff unpaid");
  db.put(COL, { ...rec, clean: clean.s, staff: happy.s, ill: ill.ill, unpaid: unpaid.length > 0 });
}

/** The scope's park day ended: count it for both streaks. */
export function goalsDayEnd() {
  const park = getPark();
  if (!park) return;
  const g = BALANCE.residents.goals;
  const rec = parkRec(park.id);
  const clean = streakDayEnd(rec.clean);
  const happy = streakDayEnd(rec.staff);
  db.put(COL, { ...rec, clean: clean.s, staff: happy.s });
  if (clean.counted) tell(park, g.cleanFor, `§7${residentById(g.cleanFor).name}'s goal: §f${Math.min(clean.s.streak, g.days)} of ${g.days}§7 park days in a row with every exhibit clean.`);
  if (happy.counted) tell(park, g.staffFor, `§7${residentById(g.staffFor).name}'s goal: §f${Math.min(happy.s.streak, g.days)} of ${g.days}§7 park days in a row with every employee happy (paid).`);
}

/** For the unlocks (residents/unlocks.js): the best streaks of any park, and the problems so far. */
export function goalStats() {
  let cleanStreak = 0;
  let staffStreak = 0;
  for (const rec of db.all(COL)) {
    if (rec.id === WORLD) continue;
    cleanStreak = Math.max(cleanStreak, rec.clean?.streak ?? 0);
    staffStreak = Math.max(staffStreak, rec.staff?.streak ?? 0);
  }
  return { cleanStreak, staffStreak, problems: db.get(COL, WORLD)?.problems ?? 0 };
}

export function initGoals() {
  on("simStep", () => checkGoals());
  on("parkDay", () => goalsDayEnd());
  on("animalOutside", () => addProblems(1, "an animal got out"));
}
