// Who is in the rabbits' contest (0.1.383): the one stage being played, and who has qualified for which stage next.
// Kept in memory only: a contest does not outlast leaving the stadium.

/** player id -> the stage they have qualified for and may start (2 or 3). */
export const progress = new Map();

let active; // { id, stage } while a stage is being played
export const activeNow = () => active;
export function setActive(a) {
  active = a;
}
