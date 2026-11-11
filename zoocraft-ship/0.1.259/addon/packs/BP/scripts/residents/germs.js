// The exhibits Clian has sanitised, and until when (0.1.259; the rules are residents/sanitationRules.js). Kept in
// "germs": { id: <exhibit id>, until: <park seconds> }. Only his round (residents/residents.js) writes it; the animals'
// care step (animals/animals.js) reads it to run the illness clock slower there. Nothing else is changed: not the
// exhibit's cleanliness, its litter, the blocks in it or the animals' needs.
import { db } from "../persistence/db.js";
import { BALANCE } from "../data/balance.js";
import { germFactor, sanitisedUntil } from "./sanitationRules.js";

const COL = "germs";

/** Until when (park seconds) an exhibit stays sanitised: 0 when it never was. */
export function germFreeUntil(exhibitId) {
  return db.get(COL, exhibitId)?.until ?? 0;
}

/** How fast the illness clock runs in an exhibit at park time `now` (1 unless he has sanitised it lately). */
export function germFactorOf(exhibitId, now) {
  return germFactor(germFreeUntil(exhibitId), now, BALANCE.residents.sanitation);
}

/** He has just sanitised an exhibit, at park time `now`. */
export function markSanitised(exhibitId, now) {
  db.put(COL, { ...(db.get(COL, exhibitId) ?? { id: exhibitId }), until: sanitisedUntil(now, BALANCE.residents.sanitation) });
}

/** How many of these exhibit ids are sanitised at park time `now`. */
export function sanitisedCount(exhibitIds, now) {
  let n = 0;
  for (const id of exhibitIds) if (germFreeUntil(id) > now) n++;
  return n;
}
